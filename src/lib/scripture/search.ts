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

// Famous Sanskrit phrases people ask about by name. The old English translations don't contain
// the Sanskrit, so meaning-search can miss the very verse being asked about; these always go in.
const FAMOUS: [RegExp, string[]][] = [
  [/tat\s*tvam\s*asi|thou art that|you are that/i, ["upanishads-chandogya-6-8-7", "upanishads-chandogya-6-12-3", "upanishads-chandogya-6-13-3"]],
  [/karma?n?ye\s*vadhikaras|right to (?:your|the) (?:work|action) (?:alone|only)/i, ["gita-2-47"]],
  [/chitta\s*vritti|citta\s*vrtti/i, ["yoga-sutras-1-2"]],
  [/two birds/i, ["upanishads-mundaka-3-1-1"]],
  [/isha?\s*vasyam|isavasyam/i, ["upanishads-isha-1"]],
  [/uttishthata|arise,? awake|rise,? awake/i, ["upanishads-katha-1-3-14"]],
  [/sarva\s*dharman|abandon all (?:duties|dharmas)/i, ["gita-18-66"]],
  [/yada\s*yada\s*hi\s*dharmasya|whenever (?:there is )?(?:a )?(?:decline|decay) of (?:dharma|righteousness)/i, ["gita-4-7"]],
  [/patram\s*pushpam|leaf,? a flower/i, ["gita-9-26"]],
  [/(?:one )?clod of clay|vacarambhanam|vacharambhanam/i, ["upanishads-chandogya-6-1-4"]],
  [/(?:most|greatest) wonder|yaksha'?s? (?:questions?|prashna|riddles?)|yaksha\s*prashna/i, ["mahabharata-yaksha-33"]],
  [/vidura\s*niti|vidura'?s? (?:advice|counsel|teaching)/i, ["mahabharata-vidura-1-4"]],
];

function famousPassages(question: string): Passage[] {
  return FAMOUS.filter(([re]) => re.test(question))
    .flatMap(([, ids]) => ids.map(getPassageById))
    .filter((p) => p !== undefined);
}

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
    // Story lines (Arjuna's panic, the narrator describing the battle) describe feelings well, so
    // they match questions closely; nudge them just below the teachings they lead into
    const p = getPassageById(id);
    const story = p?.speaker && p.speaker !== "Krishna";
    return { id, dot: story ? dot - 0.03 : dot };
  });
  scored.sort((a, b) => b.dot - a.dot);

  // Passages the question names ("Gita 2.47") come first, but never more than k in all, so naming
  // many verses can't make the answer's prompt (and its cost) bigger than usual
  const named = [...famousPassages(question), ...referencedPassages(question)];
  const picked = new Map<string, (typeof named)[number]>();
  for (const v of named) if (picked.size < k) picked.set(v.id, v);
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
