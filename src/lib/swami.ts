// Shapes shared by the Ask page, the /api/ask route and the mock answers.
import type { Verse } from "./scripture/types";

export type QuotedVerse = { verse: Verse; meaning: string };

export type SwamiAnswer = {
  paragraphs: string[];
  verses: QuotedVerse[];
  help?: { text: string; href: string; label: string };
  practice?: { href: string; title: string; why: string }; // a meditation or lesson in the app
  notice?: "limit" | "error"; // not a real answer: never saved to history
  signInPrompt?: boolean; // show "Sign in for more questions"
  plusPrompt?: boolean; // show "See SwamiGPT Plus"
  seal?: string; // proof SwamiGPT wrote this answer, so it can be shared (src/lib/share.ts)
};

// Checked in code as well as by Claude, so the help card never depends on the model noticing
export const CRISIS = /suicid|kill myself|end my life|want to die|self.harm|hurt myself/i;
export const CRISIS_HELP = { text: "Talk to someone now", href: "tel:988", label: "Call or text 988" };
