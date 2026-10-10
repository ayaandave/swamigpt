// Scripture search: finds the passages, from every text, whose meaning is closest to a question.
// Server only. The vectors come from scripts/embed-scripture.mjs; the query is embedded
// here with the same small local model, so no API call is needed to search.
import "server-only";
import index from "../../../data/scripture/vectors.json";
import { getEmbedder, QUERY_PREFIX } from "./embedder";
import { getPassageById, type Passage } from "./library";

// Copy into a fresh buffer: a Node Buffer can sit at an unaligned offset in a shared pool
const VECTORS = new Float32Array(new Uint8Array(Buffer.from(index.vectors, "base64")).buffer);

const UPANISHADS = ["isha", "kena", "katha", "mundaka", "prashna", "chandogya"];

// "Gita 2.47", "chapter 2 verse 47", "Yoga Sutras 1.2", "Katha 1.2.18" -> asked-for passages go in regardless of score
function referencedPassages(question: string): Passage[] {
  const upanishad = UPANISHADS.find((u) => new RegExp(`\\b${u}`, "i").test(question));
  if (upanishad) {
    return [...question.matchAll(/\b(\d{1,2}(?:\.\d{1,2}){0,2})\b/g)]
      .map(([, ref]) => getPassageById(`upanishads-${upanishad}-${ref.replaceAll(".", "-")}`))
      .filter((p) => p !== undefined);
  }
  const text = /sutra/i.test(question) ? "yoga-sutras" : "gita";
  const refs = [
    ...question.matchAll(/\b(\d{1,2})\s*[.:]\s*(\d{1,2})\b/g),
    ...question.matchAll(/(?:chapter|book)\s+(\d{1,2}),?\s+(?:verse|sutra)\s+(\d{1,2})/gi),
  ];
  return refs.map(([, a, b]) => getPassageById(`${text}-${Number(a)}-${Number(b)}`)).filter((p) => p !== undefined);
}

export async function searchPassages(question: string, k = 8): Promise<Passage[]> {
  const embed = await getEmbedder();
  const out = await embed(QUERY_PREFIX + question, { pooling: "mean", normalize: true });
  const q = out.data as Float32Array;
  const { dims, ids } = index;

  const scored = ids.map((id, i) => {
    let dot = 0;
    for (let d = 0; d < dims; d++) dot += VECTORS[i * dims + d] * q[d];
    return { id, dot };
  });
  scored.sort((a, b) => b.dot - a.dot);

  const picked = new Map(referencedPassages(question).map((v) => [v.id, v]));
  // No single text takes more than half the results: Vivekananda's modern English matches
  // questions so well that he would otherwise crowd out the scriptures
  const perText = new Map<string, number>();
  for (const { id } of scored) {
    if (picked.size >= k) break;
    const p = getPassageById(id)!;
    const n = perText.get(p.textId) ?? 0;
    if (n >= Math.ceil(k / 2)) continue;
    perText.set(p.textId, n + 1);
    picked.set(id, p);
  }
  return [...picked.values()];
}
