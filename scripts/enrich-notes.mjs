// One-time per text: Claude writes a plain-English meaning and life themes for every passage.
// Writes data/scripture/<text>.notes.json, which search embeds and the UI shows as "In plain words".
//
// Usage: ANTHROPIC_API_KEY=... node scripts/enrich-notes.mjs gita   (or yoga-sutras, ...)
// Then re-run scripts/embed-scripture.mjs. Safe to re-run: passages that already have notes are skipped.
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import fs from "fs";
import { z } from "zod";

const TEXT = process.argv[2];
const TITLES = { gita: "Bhagavad Gita", "yoga-sutras": "Yoga Sutras of Patanjali" };
if (!TITLES[TEXT]) {
  console.error(`Usage: node scripts/enrich-notes.mjs <${Object.keys(TITLES).join(" | ")}>`);
  process.exit(1);
}
const VERSES = `data/scripture/${TEXT}.json`;
const NOTES = `data/scripture/${TEXT}.notes.json`;
const BATCH = 20; // verses per request, sent with their neighbours for context
const PARALLEL = 4;

const Notes = z.object({
  notes: z.array(
    z.object({
      id: z.string(),
      plain: z.string(),
      themes: z.array(z.string()),
    }),
  ),
});

const SYSTEM = `You annotate passages of the ${TITLES[TEXT]} for a scripture search engine and for readers new to it: teenagers, grandparents, people of any faith.

For each verse you are given, write:
- plain: one or two sentences saying what the passage means, in plain modern English a 13-year-old understands. Stay faithful to it; do not add teaching it does not contain. Name the speaker when it matters ("Arjuna, overwhelmed, says…"); a teacher's teachings can be stated directly. Explain any name or Sanskrit term in passing. If a teacher's explanation is given, use it to understand the passage.
- themes: 3 to 6 short phrases naming the real-life situations, feelings or questions this verse speaks to, in the words a person would use when asking for help (e.g. "exam stress", "fear of failure", "grief after a death", "anger at family", "can't focus while meditating"). For narrative verses (battle scenes, lists of warriors) give plain story themes like "the armies gather" instead of forcing life lessons.

Return one note per verse id you were asked about, in order.`;

const client = new Anthropic();
const verses = JSON.parse(fs.readFileSync(VERSES, "utf8"));
const notes = fs.existsSync(NOTES) ? JSON.parse(fs.readFileSync(NOTES, "utf8")) : {};

const todo = verses.filter((v) => !notes[v.id]);
const batches = [];
for (let i = 0; i < todo.length; i += BATCH) batches.push(todo.slice(i, i + BATCH));
console.log(`${verses.length} verses, ${todo.length} need notes, ${batches.length} requests`);

const line = (v) =>
  [
    `[${v.id}] ${v.source}${v.speaker ? `, ${v.speaker} speaking` : ""}: ${v.translation}`,
    v.commentary?.length && `  Explanation: ${v.commentary.join(" ").slice(0, 700)}`,
  ]
    .filter(Boolean)
    .join("\n");

async function annotate(batch) {
  const first = verses.indexOf(batch[0]);
  const last = verses.indexOf(batch.at(-1));
  const before = verses.slice(Math.max(0, first - 3), first);
  const after = verses.slice(last + 1, last + 4);
  const prompt = [
    `Section: ${batch[0].chapterName ?? batch[0].sectionName}.`,
    before.length && `Preceding verses (context only, no notes):\n${before.map(line).join("\n")}`,
    `Verses to annotate:\n${batch.map(line).join("\n")}`,
    after.length && `Following verses (context only, no notes):\n${after.map(line).join("\n")}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  const res = await client.beta.messages.parse({
    model: "claude-opus-5-5",
    max_tokens: 16000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort: "medium", format: betaZodOutputFormat(Notes) },
    system: SYSTEM,
    messages: [{ role: "user", content: prompt }],
  });
  if (res.stop_reason === "refusal") throw new Error(`refused ${batch[0].id}`);
  const wanted = new Set(batch.map((v) => v.id));
  for (const n of res.parsed_output?.notes ?? []) {
    if (wanted.has(n.id)) notes[n.id] = { plain: n.plain, themes: n.themes };
  }
  fs.writeFileSync(NOTES, JSON.stringify(notes, null, 1));
  console.log(`done ${batch[0].source} to ${batch.at(-1).source}`);
}

const queue = [...batches];
await Promise.all(
  Array.from({ length: PARALLEL }, async () => {
    while (queue.length) await annotate(queue.shift());
  }),
);

const missing = verses.filter((v) => !notes[v.id]).map((v) => v.id);
console.log(missing.length ? `still missing ${missing.length}: ${missing.join(", ")} (re-run)` : "all verses annotated");
