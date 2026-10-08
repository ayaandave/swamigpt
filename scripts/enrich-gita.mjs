// One-time: Claude writes a plain-English meaning and life themes for every Gita verse.
// Writes data/scripture/gita.notes.json, which search embeds and the UI shows as "In plain words".
//
// Usage: ANTHROPIC_API_KEY=... node scripts/enrich-gita.mjs
// Safe to re-run: verses that already have notes are skipped.
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import fs from "fs";
import { z } from "zod";

const VERSES = "data/scripture/gita.json";
const NOTES = "data/scripture/gita.notes.json";
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

const SYSTEM = `You annotate Bhagavad Gita verses for a scripture search engine and for readers new to the Gita: teenagers, grandparents, people of any faith.

For each verse you are given, write:
- plain: one or two sentences saying what the verse means, in plain modern English a 13-year-old understands. Stay faithful to the verse; do not add teaching it does not contain. Name the speaker when it matters ("Arjuna, overwhelmed, says…"); Krishna's teachings can be stated directly. Explain any name or Sanskrit term in passing.
- themes: 3 to 6 short phrases naming the real-life situations, feelings or questions this verse speaks to, in the words a person would use when asking for help (e.g. "exam stress", "fear of failure", "grief after a death", "anger at family", "can't focus while meditating"). For narrative verses (battle scenes, lists of warriors) give plain story themes like "the armies gather" instead of forcing life lessons.

Return one note per verse id you were asked about, in order.`;

const client = new Anthropic();
const verses = JSON.parse(fs.readFileSync(VERSES, "utf8"));
const notes = fs.existsSync(NOTES) ? JSON.parse(fs.readFileSync(NOTES, "utf8")) : {};

const todo = verses.filter((v) => !notes[v.id]);
const batches = [];
for (let i = 0; i < todo.length; i += BATCH) batches.push(todo.slice(i, i + BATCH));
console.log(`${verses.length} verses, ${todo.length} need notes, ${batches.length} requests`);

const line = (v) => `[${v.id}] ${v.source}, ${v.speaker} speaking: ${v.translation}`;

async function annotate(batch) {
  const first = verses.indexOf(batch[0]);
  const last = verses.indexOf(batch.at(-1));
  const before = verses.slice(Math.max(0, first - 3), first);
  const after = verses.slice(last + 1, last + 4);
  const prompt = [
    `Chapter context: ${batch[0].chapterName}.`,
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
