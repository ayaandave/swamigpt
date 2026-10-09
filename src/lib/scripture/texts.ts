// The texts in the library. Small and safe to import anywhere (the passages themselves are server only).

export type TextInfo = {
  id: string; // also the URL segment: /read/<id>
  title: string;
  short: string; // for citations, e.g. "Yoga Sutras 1.2"
  description: string;
  sectionLabel: string; // "Chapter", "Book", "Upanishad"
  numberedSections: boolean; // "Chapter 2" makes sense; "Upanishad 3" doesn't
  passageLabel: string; // "verse", "sutra"
  attribution: string; // shown on every passage page
  commentaryBy?: string; // whose explanation is printed with each passage, if any
};

export const TEXTS: TextInfo[] = [
  {
    id: "gita",
    title: "The Bhagavad Gita",
    short: "Bhagavad Gita",
    description:
      "A conversation on a battlefield between the warrior Arjuna and Krishna, his friend and guide. 18 chapters, 701 verses.",
    sectionLabel: "Chapter",
    numberedSections: true,
    passageLabel: "verse",
    attribution: "English by Annie Besant (1922)",
  },
  {
    id: "yoga-sutras",
    title: "The Yoga Sutras of Patanjali",
    short: "Yoga Sutras",
    description:
      "Short sayings on calming the mind and the path of meditation, with Swami Vivekananda's translation and explanation. 4 books, 195 sutras.",
    sectionLabel: "Book",
    numberedSections: true,
    passageLabel: "sutra",
    attribution: "Patanjali, translated and explained by Swami Vivekananda (1896)",
    commentaryBy: "Swami Vivekananda",
  },
  {
    id: "upanishads",
    title: "The Upanishads",
    short: "Upanishads",
    description:
      "The ancient dialogues on the Self, death and what is real: the Isha, Kena, Katha, Mundaka, Prashna and Chandogya. 923 verses.",
    sectionLabel: "Upanishad",
    numberedSections: false,
    passageLabel: "verse",
    attribution: "English by Max Müller (1879–1884)",
  },
];

export const getTextInfo = (id: string) => TEXTS.find((t) => t.id === id);
