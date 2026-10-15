// Today's verse entries with their passage text and practice, for the Today page and home card.
// Server only (reads the library); the browser then picks the entry for the reader's local date.
import "server-only";
import { DAILY } from "./daily-verses";
import { MEDITATIONS } from "./meditations";
import { MANTRAS } from "./mantras";
import { PATHS } from "./lessons";
import { getPassageById, passageHref } from "./scripture/library";
import type { Verse } from "./scripture/types";

export type Daily = {
  verse: Verse;
  href: string; // the passage in the library
  reflection: string;
  question: string;
  practice: { href: string; title: string; kind: string };
};

function practice(key: string) {
  const m = MEDITATIONS.find((x) => x.slug === key);
  if (m) return { href: `/meditate/${m.slug}`, title: m.title, kind: `${m.minutes}-minute meditation` };
  const mantra = MANTRAS.find((x) => `mantra-${x.slug}` === key);
  if (mantra) return { href: `/meditate/mantra/${mantra.slug}`, title: mantra.title, kind: "Mantra" };
  const path = PATHS.find((x) => x.slug === key);
  if (path) return { href: `/learn/${path.slug}`, title: path.title, kind: "Lessons" };
  throw new Error(`daily verse practice not found: ${key}`);
}

export function dailyEntries(): Daily[] {
  return DAILY.map((d) => {
    const p = getPassageById(d.id);
    if (!p) throw new Error(`daily verse not in the library: ${d.id}`);
    const { id, source, sanskrit, transliteration, translation, speaker, plain } = p;
    return {
      verse: { id, source, sanskrit, transliteration, translation, speaker, plain },
      href: passageHref(p),
      reflection: d.reflection,
      question: d.question,
      practice: practice(d.practice),
    };
  });
}
