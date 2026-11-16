// Shapes shared by the Ask page, the /api/ask route and the mock answers.
import type { Verse } from "./scripture/types";

export type QuotedVerse = { verse: Verse; meaning: string };

export type SwamiAnswer = {
  paragraphs: string[];
  verses: QuotedVerse[];
  help?: { text: string; href: string; label: string };
  practice?: { href: string; title: string; why: string }; // a meditation or lesson in the app
  notice?: "limit" | "error" | "stopped"; // not a real answer: never saved to history
  signInPrompt?: boolean; // show "Sign in for more questions"
  plusPrompt?: boolean; // show "See SwamiGPT Plus"
  left?: number; // questions left today, from the server (not saved)
  seal?: string; // proof SwamiGPT wrote this answer, so it can be shared (src/lib/share.ts)
};

// Checked in code as well as by Claude, so the help card never depends on the model noticing
export const CRISIS =
  /suicid|kill(ing)? myself|end(ing)? my life|end it all|want to die|wanna die|self.harm|hurt(ing)? myself|cut(ting)? myself|don.?t want to (be here|live|be alive|exist)|no reason to live|better off without me|overdos/i;
export const CRISIS_HELP = { text: "Talk to someone now", href: "tel:988", label: "Call or text 988" };
