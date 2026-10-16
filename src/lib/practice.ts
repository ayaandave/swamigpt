"use client";

import { createLocalStore, useIsClient } from "./store";

// Days with some practice: a finished meditation or lesson, a full mantra count, or time with
// today's verse. Kept in browser storage and, when signed in, synced to the account.
// Shown gently: a streak counts up, and a missed day simply starts a new one, with no warnings.
type Practice = { days: string[] }; // local calendar dates, YYYY-MM-DD

const store = createLocalStore<Practice>("swamigpt.practice", { days: [] });
const listeners = new Set<(days: string[]) => void>();

const dayKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return dayKey(d);
};

export function markPractice() {
  const today = dayKey(new Date());
  const { days } = store.get();
  if (days.includes(today)) return;
  const next = [...days, today].sort().slice(-800);
  store.set({ days: next });
  listeners.forEach((l) => l(next));
}

export const getPracticeDays = () => store.get().days;
export const clearPracticeDays = () => store.set({ days: [] });

// Adds days practised on another device
export function mergePracticeDays(remote: string[]) {
  const merged = Array.from(new Set([...store.get().days, ...remote])).sort().slice(-800);
  store.set({ days: merged });
}

export function onPractice(l: (days: string[]) => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

// Today's streak (still alive if the last practice was yesterday), the longest, and the last 7 days
export function usePractice() {
  const { days } = store.useStore();
  // Dates are the reader's own, so nothing is worked out while the page is built on the server
  const isClient = useIsClient();
  if (!isClient) return { total: 0, streak: 0, longest: 0, week: [], practisedToday: false };
  const set = new Set(days);
  let streak = 0;
  for (let i = set.has(daysAgo(0)) ? 0 : 1; set.has(daysAgo(i)); i++) streak++;
  let longest = 0;
  let run = 0;
  let prev: Date | null = null;
  for (const d of days) {
    const date = new Date(`${d}T12:00:00`);
    run = prev && Math.round((date.getTime() - prev.getTime()) / 86_400_000) === 1 ? run + 1 : 1;
    longest = Math.max(longest, run);
    prev = date;
  }
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return { label: d.toLocaleDateString(undefined, { weekday: "narrow" }), done: set.has(dayKey(d)), today: i === 6 };
  });
  return { total: days.length, streak, longest, week, practisedToday: set.has(daysAgo(0)) };
}
