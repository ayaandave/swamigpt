// POST /api/ask: the Swami's answer to one question.
// Finds the closest scripture passages, hands them to Claude with the Swami persona, and
// returns only verses that really exist in our library, with their exact text.
// Plain JSON in and out, so the future iOS app can call it the same way the website does.
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import { MEDITATIONS } from "@/lib/meditations";
import { MANTRAS } from "@/lib/mantras";
import { PATHS } from "@/lib/lessons";
import { attribution, getPassageById } from "@/lib/scripture/library";
import { searchPassages } from "@/lib/scripture/search";
import { SWAMI_SYSTEM_PROMPT } from "@/lib/swami-prompt";
import { CRISIS, CRISIS_HELP, type SwamiAnswer } from "@/lib/swami";
import { takeQuestion } from "@/lib/limits";

const Body = z.object({
  question: z.string().trim().min(1).max(2000),
  depth: z.enum(["simpler", "deeper"]).default("simpler"),
  ageGroup: z.enum(["under13", "13plus"]).nullable().default(null),
  // Earlier turns in this conversation, oldest first, so follow-ups make sense
  // The lesson someone is reading when they ask from inside it
  lesson: z.object({ title: z.string().max(200), text: z.string().max(6000) }).optional(),
  // The library passage someone was reading when they pressed "Ask the Swami about this"
  about: z.string().max(120).optional(),
  history: z
    .array(z.object({ question: z.string().max(2000), answer: z.string().max(4000) }))
    .max(4)
    .default([]),
});

const Reply = z.object({
  paragraphs: z.array(z.string()),
  verses: z.array(z.object({ id: z.string(), meaning: z.string() })),
  practice: z.object({ slug: z.string(), why: z.string() }).nullable(),
  crisis: z.boolean(),
});

// What the Swami can point to at the end of an answer
type Practice = { href: string; title: string; about: string };
const PRACTICES = new Map<string, Practice>([
  ...MEDITATIONS.map((m): [string, Practice] => [
    m.slug,
    { href: `/meditate/${m.slug}`, title: m.title, about: `${m.minutes}-minute meditation. ${m.description}` },
  ]),
  ...MANTRAS.map((m): [string, Practice] => [
    `mantra-${m.slug}`,
    { href: `/meditate/mantra/${m.slug}`, title: m.title, about: `Mantra to say or think, with its meaning. ${m.short}` },
  ]),
  ...PATHS.map((p): [string, Practice] => [
    p.slug,
    { href: `/learn/${p.slug}`, title: p.title, about: `Learning path. ${p.description}` },
  ]),
]);
const PRACTICE_LIST = [...PRACTICES].map(([slug, p]) => `- ${slug}: "${p.title}". ${p.about}`).join("\n");

const OUTPUT_RULES = `

Output format:
- paragraphs: your answer as short plain-text paragraphs (no markdown, no headings, no bullet characters). Do not quote verse text here; the app shows quoted verses on their own.
- verses: the passages you quote (up to two in simpler mode, up to four in deeper mode), each by its id exactly as given, with "meaning": one sentence. In simpler mode it starts "For you, this means" and connects it to their situation; in deeper mode it says what the passage shows about the question. The translations are over a century old, so this line also puts it in today's words.
- practice: the slug of one meditation or lesson from the list below that helps right now, with "why": one short line saying why, written to them. null if none fits.
- crisis: true only if the person may be at risk of harming themselves or others.

The passages are search results from several texts, so some will not fit. Each shows where it comes from and who is speaking.

Meditations and lessons in the app:
${PRACTICE_LIST}`;

const KID_NOTE =
  "\nThe person asking is under 13. Use short sentences and words a child knows, prefer a story (Ramayana, Mahabharata, Panchatantra) to an abstract idea, and be extra gentle.";

// Questions asked from inside a lesson: answer about that lesson, briefly, since it's shown inline
// Asked from a passage's page: answer about that passage, and quote it
const readingNote = (id: string) =>
  `They are asking about the passage [${id}] above, which they were just reading. Explain that passage and quote it.\n\n`;

const lessonNote = (lesson: { title: string; text: string }) =>
  `<lesson title="${lesson.title.replace(/"/g, "'")}">\n${lesson.text}\n</lesson>\nThe person is reading this lesson in the app and asks a follow-up question about it. Answer about the lesson itself, in two or three short paragraphs, at the same reading level. Quote a passage only if it adds something the lesson didn't. The practice suggestion is optional here.\n\n`;

const client = new Anthropic();

// Testing mode (SWAMI_TEST_MODE=1): a cheaper model and less thinking, to save credits while
// building. Off at launch, so real users always get the best model.
const TEST_MODE = process.env.SWAMI_TEST_MODE === "1";
const MODEL = TEST_MODE ? "claude-sonnet-5-5" : "claude-opus-5-5";
const EFFORT: "low" | "medium" = TEST_MODE ? "low" : "medium";
// Deeper study is for serious students: think hard and read more, even while testing
const DEEPER = { effort: "high" as const, passages: 14, commentary: 1200, maxVerses: 4 };
const SIMPLER = { effort: EFFORT, passages: 8, commentary: 500, maxVerses: 2 };

// Dollars per million tokens, for the cost log
const PRICES: Record<string, { input: number; output: number; cacheRead: number }> = {
  "claude-opus-5-5": { input: 4, output: 20, cacheRead: 0.2 },
  "claude-sonnet-5-5": { input: 2, output: 10, cacheRead: 0.2 },
};

function logCost(usage: Anthropic.Beta.BetaUsage, model: string) {
  const p = PRICES[model] ?? PRICES[MODEL];
  const read = usage.cache_read_input_tokens ?? 0;
  const write = usage.cache_creation_input_tokens ?? 0;
  const dollars =
    (usage.input_tokens * p.input + write * p.input * 1.25 + read * p.cacheRead + usage.output_tokens * p.output) / 1e6;
  console.log(
    `[ask] ${model}: ${usage.input_tokens} in, ${read} cached, ${write} cache-written, ${usage.output_tokens} out = $${dollars.toFixed(4)}`,
  );
}

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: "not_configured" }, { status: 503 });
  }
  // Only our own pages ask (browsers mark same-site requests themselves). Revisit for the iPhone
  // app, whose pages load from their own origin, the same as in /api/speak.
  const site = request.headers.get("sec-fetch-site");
  if (site && site !== "same-origin") return Response.json({ error: "forbidden" }, { status: 403 });

  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }
  const { question, depth, ageGroup, history, lesson, about } = parsed.data;
  const reading = about ? getPassageById(about) : undefined;

  // Each real answer costs money, so count it against today's allowance first
  const left = await takeQuestion(request).catch((error) => {
    console.error("question limit failed", error);
    return -2; // limits can't be checked, so no paid answer
  });
  if (left === -1) {
    return Response.json({ error: "limit" }, { status: 429 });
  }
  if (left === -2) {
    return Response.json({ error: "site_limit" }, { status: 429 });
  }
  // Deeper study thinks harder and reads more (about three times the cost), so it uses a second
  // question when one is left. With only one left, the deeper answer still comes, as the last one.
  if (depth === "deeper" && left !== null && left > 0) {
    await takeQuestion(request).catch(() => null);
  }

  // Search on the follow-up plus the previous question, so "what about at work?" still finds something
  const searchText = [lesson?.title, reading?.translation, history.at(-1)?.question, question].filter(Boolean).join("\n");
  const mode = depth === "deeper" ? DEEPER : SIMPLER;
  const found = await searchPassages(searchText, mode.passages).catch((error) => {
    console.error("search failed", error);
    return null;
  });
  if (!found) return Response.json({ error: "failed" }, { status: 502 });
  // The passage they were reading always goes in first, so "this passage" can't be mistaken for
  // another text's verse with the same number
  const passages = reading ? [reading, ...found.filter((p) => p.id !== reading.id)].slice(0, mode.passages) : found;
  const allowed = new Map(passages.map((v) => [v.id, v]));

  const passageText = passages
    .map((p) =>
      [
        `[${p.id}] ${p.source} (${attribution(p)})`,
        p.translation,
        p.plain && `Plain meaning: ${p.plain}`,
        // A teacher's explanation helps pick and explain the passage; it is not for quoting
        p.commentary?.length && `Vivekananda's explanation (context, do not quote): ${p.commentary.join(" ").slice(0, mode.commentary)}`,
      ]
        .filter(Boolean)
        .join("\n"),
    )
    .join("\n\n");

  const messages: Anthropic.Beta.BetaMessageParam[] = [
    ...history.flatMap((t) => [
      { role: "user" as const, content: t.question },
      { role: "assistant" as const, content: t.answer },
    ]),
    {
      role: "user",
      content: `<passages>\n${passageText}\n</passages>\n\n${lesson ? lessonNote(lesson) : ""}${reading ? readingNote(reading.id) : ""}Depth setting: ${depth}${ageGroup === "under13" ? KID_NOTE : ""}\n\n${question}`,
    },
  ];

  try {
    const res = await client.beta.messages.parse({
      model: MODEL,
      max_tokens: 16000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: mode.effort, format: betaZodOutputFormat(Reply) },
      system: [{ type: "text", text: SWAMI_SYSTEM_PROMPT + OUTPUT_RULES, cache_control: { type: "ephemeral" } }],
      messages,
    });

    logCost(res.usage, res.model);
    const reply = res.stop_reason === "refusal" ? null : res.parsed_output;
    if (!reply) {
      return Response.json({ error: "no_answer" }, { status: 502 });
    }

    const answer: SwamiAnswer = {
      paragraphs: reply.paragraphs.filter((p) => p.trim()),
      // Never show a verse the model didn't get from the library
      verses: reply.verses.slice(0, mode.maxVerses).flatMap(({ id, meaning }) => {
        const p = allowed.get(id);
        if (!p) return [];
        // The card only needs the text itself, not the long commentary
        const verse = {
          id: p.id,
          source: p.source,
          sanskrit: p.sanskrit,
          transliteration: p.transliteration,
          translation: p.translation,
          translator: p.translator,
          speaker: p.speaker,
          plain: p.plain,
        };
        return [{ verse, meaning }];
      }),
      help: reply.crisis || CRISIS.test(question) ? CRISIS_HELP : undefined,
    };
    const practice = reply.practice && PRACTICES.get(reply.practice.slug);
    if (practice) answer.practice = { href: practice.href, title: practice.title, why: reply.practice!.why };
    return Response.json(answer);
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      return Response.json({ error: "not_configured" }, { status: 503 });
    }
    if (error instanceof Anthropic.RateLimitError) {
      return Response.json({ error: "busy" }, { status: 429 });
    }
    console.error("ask failed", error);
    return Response.json({ error: "failed" }, { status: 502 });
  }
}
