"use client";

import { getSettings, updateSettings } from "./settings";

// Apple (guideline 5.1.2) wants people to agree before anything they type goes to an outside AI.
// askSwami waits on this before the first question; AiConsent shows the question and answers it.
let pending: ((ok: boolean) => void) | null = null;
const listeners = new Set<() => void>();

export function requestAiConsent(): Promise<boolean> {
  if (getSettings().aiConsent) return Promise.resolve(true);
  pending?.(false);
  return new Promise((resolve) => {
    pending = resolve;
    listeners.forEach((l) => l());
  });
}

export function answerAiConsent(ok: boolean) {
  if (ok) updateSettings({ aiConsent: true });
  pending?.(ok);
  pending = null;
  listeners.forEach((l) => l());
}

export const aiConsentAsked = () => pending !== null;

export function onAiConsentAsk(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}
