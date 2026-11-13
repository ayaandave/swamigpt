"use client";

// The Plus popup: opened at the moments Plus actually helps (today's questions are used up, or the
// month's read-aloud has run out), never on a first visit and at most once a day on its own.
// Tapping "See SwamiGPT Plus" always opens it. PlusPaywall shows it.
export type PaywallReason = "questions" | "voice" | "tap";

let open: PaywallReason | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

const today = () => new Date().toISOString().slice(0, 10);
const SHOWN = "swami.paywall.shown"; // the last day it opened on its own
const FIRST = "swami.firstSeen"; // the first day this browser used SwamiGPT
const NOTE = "swami.paywall.note"; // the last day the "questions left" note showed

function read(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Private browsing: the popup may show a little more often, which is fine
  }
}

// Remembers the first day, so the popup never interrupts someone on their very first visit
export function markSeen() {
  if (!read(FIRST)) write(FIRST, today());
}

export function openPaywall(reason: PaywallReason) {
  if (reason !== "tap") {
    // Running out of questions is something they did, so it may show on day one; read-aloud waits
    const first = read(FIRST);
    if (reason === "voice" && (!first || first === today())) return;
    if (read(SHOWN) === today()) return;
    write(SHOWN, today());
  }
  open = reason;
  emit();
}

export function closePaywall() {
  open = null;
  emit();
}

export const paywallReason = () => open;

export function onPaywall(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

// The gentle "2 questions left today" note: once a day at most
export function takeLeftNote(): boolean {
  if (read(NOTE) === today()) return false;
  write(NOTE, today());
  return true;
}
