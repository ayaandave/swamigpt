"use client";

import { track as send } from "@vercel/analytics";

// Product events, counted without cookies (Vercel Analytics). Only these names and small,
// non-personal details are ever sent: never a question, an answer or anything someone typed.
type Events = {
  onboarding_step_viewed: { step: string };
  onboarding_completed: { focus: string; familiarity: string; minutes: number };
  chat_sent: { signedIn: boolean };
  first_answer_completed: Record<string, never>;
  paywall_viewed: { surface: string };
  paywall_dismissed: { method: "x" | "maybe_later" | "outside" | "escape" };
  verse_saved: Record<string, never>;
};

export function track<E extends keyof Events>(name: E, data?: Events[E]) {
  try {
    send(name, data as Record<string, string | number | boolean>);
  } catch {
    // Analytics blocked or not loaded: nothing to do
  }
}
