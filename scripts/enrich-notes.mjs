// One-time per text: Claude writes a plain-English meaning and life themes for every passage.
// Writes data/scripture/<text>.notes.json, which search embeds and the UI shows as "In plain words".
//
// Uses the Message Batches API (half price; results usually within an hour). Run it again with
// the same arguments to pick up a batch that is still running. Passages that already have notes
// are skipped, so it's safe to re-run, and --limit lets you try a small sample first.
//
// Usage: node --env-file=.env.local scripts/enrich-notes.mjs gita --limit 20
//        node --env-file=.env.local scripts/enrich-notes.mjs gita --from gita-2-11 --limit 20
//        then: node scripts/embed-scripture.mjs
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import fs from "fs";
import { z } from "zod";

const TEXT = process.argv[2];
const TITLES = {
  gita: "Bhagavad Gita",
  "yoga-sutras": "Yoga Sutras of Patanjali",
  upanishads: "Upanishads",
  mahabharata: "Mahabharata (Vidura Niti and Yaksha Prashna, Ganguli's translation)",
};
if (!TITLES[TEXT]) {
  console.error(`Usage: node --env-file=.env.local scripts/enrich-notes.mjs <${Object.keys(TITLES).join(" | ")}> [--limit N]`);
  process.exit(1);
}
const limitArg = process.argv.indexOf("--limit");
const LIMIT = limitArg > 0 ? Number(process.argv[limitArg + 1]) : Infinity;
const fromArg = process.argv.indexOf("--from"); // start at this passage id, e.g. --from gita-2-11
const FROM = fromArg > 0 ? process.argv[fromArg + 1] : null;

const VERSES = `data/scripture/${TEXT}.json`;
const NOTES = `data/scripture/${TEXT}.notes.json`;
const PENDING = `data/scripture/.${TEXT}.batch.json`; // the running batch, so a re-run can resume it
const MODEL = "claude-opus-5-5"; // notes are permanent, user-facing content: best model, batch price
const BATCH = 20; // passages per request, sent with their neighbours for context
// Opus 5.5 dollars per million tokens, halved for batches
const PRICE = { input: 4 / 2, output: 20 / 2 };

const Notes = z.object({
  notes: z.array(z.object({ id: z.string(), plain: z.string(), themes: z.array(z.string()) })),
});

const SYSTEM = `You annotate passages of the ${TITLES[TEXT]} for a scripture search engine and for readers new to it: teenagers, grandparents, people of any faith.

For each passage you are given, write:
- plain: one or two sentences saying what the passage means, in plain modern English a 12-year-old understands, with short direct sentences and no abstract metaphors. Stay faithful to it; do not add teaching it does not contain. Name the speaker when it matters ("Arjuna, overwhelmed, says…"); a teacher's teachings can be stated directly. Explain any name or Sanskrit term in passing. If a teacher's explanation is given, use it to understand the passage.
- themes: 3 to 6 short phrases naming the real-life situations, feelings or questions this passage speaks to, in the words a person would use when asking for help (e.g. "exam stress", "fear of failure", "grief after a death", "anger at family", "can't focus while meditating"). For narrative passages (battle scenes, lists of names, ritual details) give plain story themes like "the armies gather" instead of forcing life lessons.

Return one note per passage id you were asked about, in order.`;

const client = new Anthropic();
const read = (path, fallback) => (fs.existsSync(path) ? JSON.parse(fs.readFileSync(path, "utf8")) : fallback);
const verses = read(VERSES, []);
const notes = read(NOTES, {});

const line = (v) =>
  [
    `[${v.id}] ${v.source}${v.speaker ? `, ${v.speaker} speaking` : ""}: ${v.translation}`,
    v.commentary?.length && `  Explanation: ${v.commentary.join(" ").slice(0, 700)}`,
  ]
    .filter(Boolean)
    .join("\n");

function request(batch, index) {
  const first = verses.indexOf(batch[0]);
  const last = verses.indexOf(batch.at(-1));
  const before = verses.slice(Math.max(0, first - 3), first);
  const after = verses.slice(last + 1, last + 4);
  const prompt = [
    `Section: ${batch[0].chapterName ?? batch[0].sectionName}.`,
    before.length && `Preceding passages (context only, no notes):\n${before.map(line).join("\n")}`,
    `Passages to annotate:\n${batch.map(line).join("\n")}`,
    after.length && `Following passages (context only, no notes):\n${after.map(line).join("\n")}`,
  ]
    .filter(Boolean)
    .join("\n\n");
  return {
    custom_id: `part-${index + 1}`, // the API allows 64 characters; each note carries its passage's id
    params: {
      model: MODEL,
      max_tokens: 16000,
      output_config: { effort: "medium", format: zodOutputFormat(Notes) },
      system: SYSTEM,
      messages: [{ role: "user", content: prompt }],
    },
  };
}

// ---- Start a batch, unless one is already running for this text ----
let batchId = read(PENDING, null)?.id;
if (!batchId) {
  const start = FROM ? Math.max(0, verses.findIndex((v) => v.id === FROM)) : 0;
  const todo = verses
    .slice(start)
    .filter((v) => !notes[v.id])
    .slice(0, LIMIT);
  if (!todo.length) {
    console.log(`All ${verses.length} passages already have notes.`);
    process.exit(0);
  }
  const requests = [];
  for (let i = 0; i < todo.length; i += BATCH) requests.push(request(todo.slice(i, i + BATCH), requests.length));
  const batch = await client.messages.batches.create({ requests });
  batchId = batch.id;
  fs.writeFileSync(PENDING, JSON.stringify({ id: batchId, passages: todo.length }));
  console.log(`Started batch ${batchId}: ${todo.length} passages in ${requests.length} requests.`);
} else {
  console.log(`Resuming batch ${batchId}.`);
}

// ---- Wait for it (Ctrl+C is fine: the batch keeps running, and a re-run picks it up) ----
for (;;) {
  const b = await client.messages.batches.retrieve(batchId);
  if (b.processing_status === "ended") break;
  console.log(`  ${new Date().toLocaleTimeString()}: ${b.request_counts.processing} request(s) still processing…`);
  await new Promise((r) => setTimeout(r, 30_000));
}

// ---- Save the notes and report the real cost ----
let input = 0;
let output = 0;
let saved = 0;
const failed = [];
for await (const result of await client.messages.batches.results(batchId)) {
  if (result.result.type !== "succeeded") {
    failed.push(`${result.custom_id} (${result.result.type})`);
    continue;
  }
  const message = result.result.message;
  input += message.usage.input_tokens;
  output += message.usage.output_tokens;
  const text = message.content.filter((b) => b.type === "text").map((b) => b.text).join("");
  try {
    for (const n of Notes.parse(JSON.parse(text)).notes) {
      if (verses.some((v) => v.id === n.id)) {
        notes[n.id] = { plain: n.plain, themes: n.themes };
        saved++;
      }
    }
  } catch {
    failed.push(`${result.custom_id} (unreadable reply)`);
  }
}
fs.writeFileSync(NOTES, JSON.stringify(notes, null, 1));
fs.rmSync(PENDING);

const dollars = (input * PRICE.input + output * PRICE.output) / 1e6;
console.log(`Saved ${saved} notes. ${input} input + ${output} output tokens = $${dollars.toFixed(3)} (batch price).`);
if (saved) console.log(`About $${(dollars / saved).toFixed(4)} per passage.`);
if (failed.length) console.log(`Not done (re-run to retry): ${failed.join(", ")}`);
const left = verses.filter((v) => !notes[v.id]).length;
console.log(`${verses.length - left} of ${verses.length} ${TEXT} passages now have notes. Next: node scripts/embed-scripture.mjs`);
