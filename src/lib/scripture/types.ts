export type Verse = {
  id: string;
  source: string; // human citation, e.g. "Bhagavad Gita 2.47"
  sanskrit: string;
  transliteration: string;
  translation: string;
  translator?: string;
  speaker?: string;
  plain?: string; // our plain-English meaning, shown as "In plain words"
};
