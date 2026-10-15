// The scripture library: every passage we can show and quote, from every text, with its
// plain-English note. Server only (the files are large); pages and API routes read it, never the browser.
import "server-only";
import gitaJson from "../../../data/scripture/gita.json";
import gitaNotes from "../../../data/scripture/gita.notes.json";
import sutrasJson from "../../../data/scripture/yoga-sutras.json";
import sutrasNotes from "../../../data/scripture/yoga-sutras.notes.json";
import upanishadsJson from "../../../data/scripture/upanishads.json";
import upanishadsNotes from "../../../data/scripture/upanishads.notes.json";
import vivekanandaJson from "../../../data/scripture/vivekananda.json";
import mahabharataJson from "../../../data/scripture/mahabharata.json";
import mahabharataNotes from "../../../data/scripture/mahabharata.notes.json";
import vishnuPuranaJson from "../../../data/scripture/vishnu-purana.json";
import vishnuPuranaNotes from "../../../data/scripture/vishnu-purana.notes.json";
import ramayanaJson from "../../../data/scripture/ramayana.json";
import ramayanaNotes from "../../../data/scripture/ramayana.notes.json";
import { TEXTS, type TextInfo } from "./texts";
import type { Verse } from "./types";

export type Passage = Verse & {
  textId: string;
  section: string; // chapter or book, as it appears in the URL
  sectionName: string;
  number: string; // verse or sutra number within the section
  speaker?: string; // Gita only: who is talking
  partName?: string; // chapter title within a section, for prose books ("The Secret of Work")
  commentary?: string[]; // a teacher's explanation printed with the text (Vivekananda on the sutras)
};

type Notes = Record<string, { plain: string; themes: string[] }>;
const withNote = (notes: Notes) => (p: Passage): Passage => ({ ...p, plain: notes[p.id]?.plain });

type GitaVerse = Verse & { chapter: number; verse: number; chapterName: string; speaker: string };
const gita: Passage[] = (gitaJson as GitaVerse[]).map(({ chapter, verse, chapterName, ...v }) => ({
  ...v,
  textId: "gita",
  section: String(chapter),
  sectionName: chapterName,
  number: String(verse),
}));

// Notes files are empty until scripts/enrich-notes.mjs has run
export const PASSAGES: Passage[] = [
  ...gita.map(withNote(gitaNotes as Notes)),
  ...(sutrasJson as Omit<Passage, "textId">[]).map((p) => ({ ...p, textId: "yoga-sutras" })).map(withNote(sutrasNotes as Notes)),
  ...(upanishadsJson as Omit<Passage, "textId">[])
    .map((p) => ({ ...p, textId: "upanishads" }))
    .map(withNote(upanishadsNotes as Notes)),
  ...(mahabharataJson as Omit<Passage, "textId">[])
    .map((p) => ({ ...p, textId: "mahabharata" }))
    .map(withNote(mahabharataNotes as Notes)),
  ...(vishnuPuranaJson as Omit<Passage, "textId">[])
    .map((p) => ({ ...p, textId: "vishnu-purana" }))
    .map(withNote(vishnuPuranaNotes as Notes)),
  ...(ramayanaJson as Omit<Passage, "textId">[])
    .map((p) => ({ ...p, textId: "ramayana" }))
    .map(withNote(ramayanaNotes as Notes)),
  // Already in plain English, so no notes
  ...(vivekanandaJson as Omit<Passage, "textId">[]).map((p) => ({ ...p, textId: "vivekananda" })),
];

const BY_ID = new Map(PASSAGES.map((p) => [p.id, p]));
export const getPassageById = (id: string) => BY_ID.get(id);

export type Section = { key: string; name: string; passages: Passage[] };
export type Text = TextInfo & { sections: Section[]; passages: Passage[] };

const LIBRARY = new Map<string, Text>(
  TEXTS.map((info) => {
    const passages = PASSAGES.filter((p) => p.textId === info.id);
    const sections: Section[] = [];
    for (const p of passages) {
      const last = sections.at(-1);
      if (last?.key === p.section) last.passages.push(p);
      else sections.push({ key: p.section, name: p.sectionName, passages: [p] });
    }
    return [info.id, { ...info, sections, passages }];
  }),
);

export const getText = (id: string) => LIBRARY.get(id);
export const allTexts = () => [...LIBRARY.values()];

export function getPassage(textId: string, section: string, number: string) {
  const passages = LIBRARY.get(textId)?.passages ?? [];
  const i = passages.findIndex((p) => p.section === section && p.number === number);
  if (i === -1) return undefined;
  return { passage: passages[i], prev: passages[i - 1], next: passages[i + 1] };
}

export const passageHref = (p: Passage) => `/read/${p.textId}/${p.section}/${p.number}`;

// The citation number on its own: "2.47", "1.2", "1.2.18"
export const shortRef = (p: Passage) => p.source.split(" ").at(-1)!;

// Who each Gita speaker is talking to, in the frame story
const LISTENER: Record<string, string> = {
  Krishna: "Arjuna",
  Arjuna: "Krishna",
  Sanjaya: "King Dhritarashtra",
  Dhritarashtra: "Sanjaya",
};

// "Krishna speaking to Arjuna", or the text's own attribution
export function attribution(p: Passage) {
  if (p.speaker) return `${p.speaker} speaking to ${LISTENER[p.speaker]}`;
  if (p.section === "vidura-niti") return "Vidura speaking to King Dhritarashtra";
  if (p.section === "yaksha-prashna") return "The Yaksha questioning Yudhishthira";
  return LIBRARY.get(p.textId)?.attribution ?? "";
}
