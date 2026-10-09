// The scripture library: every verse we can show and quote, with its plain-English note.
// Server only (the Gita alone is half a megabyte); pages and API routes read it, never the browser.
import "server-only";
import gita from "../../../data/scripture/gita.json";
import notesJson from "../../../data/scripture/gita.notes.json";
import type { Verse } from "./types";

export type LibraryVerse = Verse & { chapter: number; verse: number; chapterName: string; speaker: string };

// Empty until scripts/enrich-gita.mjs has run
const notes = notesJson as Record<string, { plain: string; themes: string[] }>;

export const VERSES: LibraryVerse[] = (gita as LibraryVerse[]).map((v) => ({ ...v, plain: notes[v.id]?.plain }));
const BY_ID = new Map(VERSES.map((v) => [v.id, v]));

export function getVerseById(id: string): LibraryVerse | undefined {
  return BY_ID.get(id);
}

export function getVerse(chapter: number, verse: number) {
  const i = VERSES.findIndex((v) => v.chapter === chapter && v.verse === verse);
  if (i === -1) return undefined;
  return { verse: VERSES[i], prev: VERSES[i - 1], next: VERSES[i + 1] };
}

export type Chapter = { number: number; name: string; verses: LibraryVerse[] };

export const CHAPTERS: Chapter[] = Array.from({ length: 18 }, (_, i) => {
  const verses = VERSES.filter((v) => v.chapter === i + 1);
  return { number: i + 1, name: verses[0].chapterName, verses };
});

// Who each speaker is talking to in the Gita's frame story
const LISTENER: Record<string, string> = {
  Krishna: "Arjuna",
  Arjuna: "Krishna",
  Sanjaya: "King Dhritarashtra",
  Dhritarashtra: "Sanjaya",
};
export const speakerLine = (v: LibraryVerse) => `${v.speaker} speaking to ${LISTENER[v.speaker]}`;

export const verseHref = (v: { chapter: number; verse: number }) => `/read/gita/${v.chapter}/${v.verse}`;
