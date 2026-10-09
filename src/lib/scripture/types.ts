export type Verse = {
  id: string;
  source: string; // human citation, e.g. "Bhagavad Gita 2.47"
  sanskrit?: string; // not every text has its Sanskrit in the library yet
  transliteration?: string;
  translation: string;
  translator?: string;
  speaker?: string;
  plain?: string; // our plain-English meaning, shown as "In plain words"
};
