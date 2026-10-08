// Turns every verse into a meaning-vector so search finds verses by what they're about,
// not by matching words. Runs a small local model; no API key needed.
// Writes data/scripture/gita.vectors.json, read by src/lib/scripture/search.ts.
//
// Usage: node scripts/embed-scripture.mjs   (re-run after gita.json or gita.notes.json change)
import { pipeline } from "@huggingface/transformers";
import fs from "fs";

const MODEL = "Xenova/bge-small-en-v1.5";
// bge models expect this prefix on queries (not on the passages)
const QUERY_PREFIX = "Represent this sentence for searching relevant passages: ";

const verses = JSON.parse(fs.readFileSync("data/scripture/gita.json", "utf8"));
const notesPath = "data/scripture/gita.notes.json";
const notes = fs.existsSync(notesPath) ? JSON.parse(fs.readFileSync(notesPath, "utf8")) : {};
const withNotes = verses.filter((v) => notes[v.id]).length;
console.log(`${verses.length} verses, ${withNotes} with plain-English notes`);

// Plain meaning and themes first: they're in the words people actually ask with
const passage = (v) => {
  const n = notes[v.id];
  return n ? `${n.plain} Themes: ${n.themes.join(", ")}. ${v.translation}` : `${v.chapterName}. ${v.translation}`;
};

const embed = await pipeline("feature-extraction", MODEL, { dtype: "fp32" });
const vectors = [];
for (let i = 0; i < verses.length; i += 64) {
  const out = await embed(verses.slice(i, i + 64).map(passage), { pooling: "mean", normalize: true });
  vectors.push(...out.tolist());
}

const flat = Float32Array.from(vectors.flat());
fs.writeFileSync(
  "data/scripture/gita.vectors.json",
  JSON.stringify({
    model: MODEL,
    queryPrefix: QUERY_PREFIX,
    dims: vectors[0].length,
    ids: verses.map((v) => v.id),
    vectors: Buffer.from(flat.buffer).toString("base64"),
  }),
);
console.log(`wrote ${vectors.length} vectors (${vectors[0].length} dims)`);
