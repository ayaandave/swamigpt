// Turns every passage in the library into a meaning-vector so search finds passages by what
// they're about, not by matching words. Runs a small local model; no API key needed.
// Writes data/scripture/vectors.json, read by src/lib/scripture/search.ts.
//
// Usage: node scripts/embed-scripture.mjs   (re-run after any text or notes file changes)
import { env, pipeline } from "@huggingface/transformers";
import fs from "fs";

// Same model and settings as src/lib/scripture/embedder.ts, loaded from data/models
const MODEL = "Xenova/bge-small-en-v1.5";
const DTYPE = "q8";
env.localModelPath = "data/models/";
env.allowRemoteModels = false;
const OUT = process.argv[2] ?? "data/scripture/vectors.json";
// bge models expect this prefix on queries (not on the passages)
const QUERY_PREFIX = "Represent this sentence for searching relevant passages: ";
const TEXTS = ["gita", "yoga-sutras", "upanishads", "vivekananda"]; // data/scripture/<id>.json, plus <id>.notes.json

const read = (path, fallback) => (fs.existsSync(path) ? JSON.parse(fs.readFileSync(path, "utf8")) : fallback);

const passages = [];
for (const id of TEXTS) {
  const items = read(`data/scripture/${id}.json`, []);
  const notes = read(`data/scripture/${id}.notes.json`, {});
  console.log(`${id}: ${items.length} passages, ${items.filter((p) => notes[p.id]).length} with plain-English notes`);
  for (const p of items) {
    const n = notes[p.id];
    // Plain meaning and themes first: they're in the words people actually ask with.
    // A teacher's commentary, when there is one, is plainer than the old translation.
    const parts = [
      n && `${n.plain} Themes: ${n.themes.join(", ")}.`,
      !n && p.chapterName && `${p.chapterName}.`,
      p.translation,
      p.commentary?.length && p.commentary.join(" ").slice(0, 600),
    ];
    passages.push({ id: p.id, text: parts.filter(Boolean).join(" ") });
  }
}

const embed = await pipeline("feature-extraction", MODEL, { dtype: DTYPE });
const vectors = [];
for (let i = 0; i < passages.length; i += 64) {
  const out = await embed(passages.slice(i, i + 64).map((p) => p.text), { pooling: "mean", normalize: true });
  vectors.push(...out.tolist());
}

const flat = Float32Array.from(vectors.flat());
fs.writeFileSync(
  OUT,
  JSON.stringify({
    model: MODEL,
    dtype: DTYPE,
    queryPrefix: QUERY_PREFIX,
    dims: vectors[0].length,
    ids: passages.map((p) => p.id),
    vectors: Buffer.from(flat.buffer).toString("base64"),
  }),
);
console.log(`wrote ${vectors.length} vectors (${vectors[0].length} dims)`);
