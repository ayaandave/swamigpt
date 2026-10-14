import type { Verse } from "./types";

// How a quote is introduced, the way a person would say it: "Krishna says", "Vivekananda says".
// Never the book title or verse number; those stay on the card's small caption.
export function whoSays(verse: Verse): string {
  const id = verse.id;
  if (id.startsWith("gita-")) return verse.speaker ? `${verse.speaker} says` : "Krishna says";
  if (id.startsWith("yoga-sutras-")) return "Patanjali says";
  if (id.startsWith("upanishads-")) return "The Upanishads say";
  if (id.startsWith("vivekananda-")) return "Vivekananda says";
  if (id.startsWith("mahabharata-vidura-")) return "Vidura says";
  if (id.startsWith("mahabharata-yaksha-")) return "Yudhishthira answers";
  if (id.startsWith("mahabharata-")) return "The Mahabharata says";
  if (id.startsWith("vishnu-purana-")) return "The Vishnu Purana says";
  return "The scriptures say";
}

// The small caption under a verse card: the reference people know, never a translator's name.
// "Bhagavad Gita 2.47", "Yoga Sutras 1.2", "Katha Upanishad", "Swami Vivekananda, Karma-Yoga"
export function caption(verse: Verse): string {
  const name = verse.source.replace(/\s[\d.]+$/, ""); // the source without its numbers
  if (verse.id.startsWith("upanishads-")) return name;
  if (verse.id.startsWith("vivekananda-")) return `Swami Vivekananda, ${name}`;
  if (verse.id.startsWith("mahabharata-")) return `Mahabharata, ${name}`;
  if (verse.id.startsWith("vishnu-purana-")) return verse.source.replace(/\.\d+$/, "");
  return verse.source;
}
