import type { Verse } from "./types";

// How a quote is introduced, the way a person would say it: "Krishna says", "Vivekananda says".
// Never the book title or verse number; those stay on the card's small caption.
export function whoSays(verse: Verse): string {
  const id = verse.id;
  if (id.startsWith("gita-")) return verse.speaker ? `${verse.speaker} says` : "Krishna says";
  if (id.startsWith("yoga-sutras-")) return "Patanjali says";
  if (id.startsWith("upanishads-")) return "The Upanishads say";
  if (id.startsWith("vivekananda-")) return "Vivekananda says";
  return "The scriptures say";
}
