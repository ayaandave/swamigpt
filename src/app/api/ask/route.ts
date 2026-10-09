// POST /api/ask: the Swami's answer to one question.
// Finds the closest scripture passages, hands them to Claude with the Swami persona, and
// returns only verses that really exist in our library, with their exact text.
// Plain JSON in and out, so the future iOS app can call it the same way the website does.
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import { MEDITATIONS, PATHS } from "@/lib/mock/content";
import { attribution } from "@/lib/scripture/library";
import { searchPassages } from "@/lib/scripture/search";
import { SWAMI_SYSTEM_PROMPT } from "@/lib/swami-prompt";
import { CRISIS, CRISIS_HELP, type SwamiAnswer } from "@/lib/swami";

const Body = z.object({
  question: z.string().trim().min(1).max(2000),
  depth: z.enum(["simpler", "deeper"]).default("simpler"),
  ageGroup: z.enum(["under13", "13plus"]).nullable().default(null),
  // Earlier turns in this conversation, oldest first, so follow-ups make sense
  history: z
    .array(z.object({ question: z.string().max(2000), answer: z.string().max(8000) }))
    .max(6)
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
  ...PATHS.map((p): [string, Practice] => [
    p.slug,
    { href: `/learn/${p.slug}`, title: p.title, about: `Learning path. ${p.description}` },
  ]),
]);
const PRACTICE_LIST = [...PRACTICES].map(([slug, p]) => `- ${slug}: "${p.title}". ${p.about}`).join("\n");

const OUTPUT_RULES = `

Output format:
- paragraphs: your answer as short plain-text paragraphs (no markdown, no headings, no bullet characters). Do not quote verse text here; the app shows quoted verses on their own.
- verses: zero to two passages you quote, each by its id exactly as given, with "meaning": one plain sentence starting "For you, this means" that connects it to their situation. The translations are over a century old, so the meaning line also does the job of putting it in today's words.
- practice: the slug of one meditation or lesson from the list below that helps right now, with "why": one short line saying why, written to them. null if none fits.
- crisis: true only if the person may be at risk of harming themselves or others.

The passages are search results from several texts, so some will not fit. Each shows where it comes from and who is speaking.

Meditations and lessons in the app:
${PRACTICE_LIST}`;

const KID_NOTE =
  "\nThe person asking is under 13. Use short sentences and words a child knows, prefer a story (Ramayana, Mahabharata, Panchatantra) to an abstract idea, and be extra gentle.";

const client = new Anthropic();

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: "not_configured" }, { status: 503 });
  }
  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }
  const { question, depth, ageGroup, history } = parsed.data;

  // Search on the follow-up plus the previous question, so "what about at work?" still finds something
  const searchText = history.length ? `${history.at(-1)!.question}\n${question}` : question;
  const passages = await searchPassages(searchText);
  const allowed = new Map(passages.map((v) => [v.id, v]));

  const passageText = passages
    .map((p) =>
      [
        `[${p.id}] ${p.source} (${attribution(p)})`,
        p.translation,
        p.plain && `Plain meaning: ${p.plain}`,
        // A teacher's explanation helps pick and explain the passage; it is not for quoting
        p.commentary?.length && `Vivekananda's explanation (context, do not quote): ${p.commentary.join(" ").slice(0, 500)}`,
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
      content: `<passages>\n${passageText}\n</passages>\n\nDepth setting: ${depth}${ageGroup === "under13" ? KID_NOTE : ""}\n\n${question}`,
    },
  ];

  try {
    const res = await client.beta.messages.parse({
      model: "claude-opus-5-5",
      max_tokens: 16000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "medium", format: betaZodOutputFormat(Reply) },
      system: [{ type: "text", text: SWAMI_SYSTEM_PROMPT + OUTPUT_RULES, cache_control: { type: "ephemeral" } }],
      messages,
    });

    const reply = res.stop_reason === "refusal" ? null : res.parsed_output;
    if (!reply) {
      return Response.json({ error: "no_answer" }, { status: 502 });
    }

    const answer: SwamiAnswer = {
      paragraphs: reply.paragraphs.filter((p) => p.trim()),
      // Never show a verse the model didn't get from the library
      verses: reply.verses.flatMap(({ id, meaning }) => {
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
