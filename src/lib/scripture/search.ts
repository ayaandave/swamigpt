// Scripture search: finds the verses whose meaning is closest to a question.
// Server only. The vectors come from scripts/embed-scripture.mjs; the query is embedded
// here with the same small local model, so no API call is needed to search.
import "server-only";
import { pipeline, type FeatureExtractionPipeline } from "@huggingface/transformers";
import gita from "../../../data/scripture/gita.json";
import notesJson from "../../../data/scripture/gita.notes.json";
import index from "../../../data/scripture/gita.vectors.json";
import type { Verse } from "./types";

type LibraryVerse = Verse & { chapter: number; verse: number; chapterName: string };

// Empty until scripts/enrich-gita.mjs has run
const notes = notesJson as Record<string, { plain: string; themes: string[] }>;

const VERSES: LibraryVerse[] = (gita as LibraryVerse[]).map((v) => ({ ...v, plain: notes[v.id]?.plain }));
const BY_ID = new Map(VERSES.map((v) => [v.id, v]));
// Copy into a fresh buffer: a Node Buffer can sit at an unaligned offset in a shared pool
const VECTORS = new Float32Array(new Uint8Array(Buffer.from(index.vectors, "base64")).buffer);

let embedder: Promise<FeatureExtractionPipeline> | undefined;
const getEmbedder = () => (embedder ??= pipeline("feature-extraction", index.model, { dtype: "fp32" }));

export function getVerse(id: string): Verse | undefined {
  return BY_ID.get(id);
}

// "Gita 2.47", "chapter 2 verse 47", "BG 2:47" -> asked-for verses go in regardless of score
function referencedVerses(question: string): LibraryVerse[] {
  const refs = [
    ...question.matchAll(/\b(\d{1,2})\s*[.:]\s*(\d{1,2})\b/g),
    ...question.matchAll(/chapter\s+(\d{1,2}),?\s+verse\s+(\d{1,2})/gi),
  ];
  return refs.map(([, ch, n]) => BY_ID.get(`gita-${Number(ch)}-${Number(n)}`)).filter((v) => v !== undefined);
}

export async function searchVerses(question: string, k = 8): Promise<LibraryVerse[]> {
  const embed = await getEmbedder();
  const out = await embed(index.queryPrefix + question, { pooling: "mean", normalize: true });
  const q = out.data as Float32Array;
  const { dims, ids } = index;

  const scored = ids.map((id, i) => {
    let dot = 0;
    for (let d = 0; d < dims; d++) dot += VECTORS[i * dims + d] * q[d];
    return { id, dot };
  });
  scored.sort((a, b) => b.dot - a.dot);

  const picked = new Map(referencedVerses(question).map((v) => [v.id, v]));
  for (const { id } of scored) {
    if (picked.size >= k) break;
    picked.set(id, BY_ID.get(id)!);
  }
  return [...picked.values()];
}
