"use client";

import { markPractice } from "./practice";
import { createLocalStore } from "./store";

// Mala progress, kept in browser storage and, when signed in, synced to the account (lib/account-sync).
export type Progress = Record<string, number[]>; // path slug -> completed lesson indexes

const store = createLocalStore<Progress>("swamigpt.progress", {});

const doneListeners = new Set<(slug: string, index: number) => void>();

function markDone(slug: string, index: number) {
  const p = store.get();
  store.set({ ...p, [slug]: Array.from(new Set([...(p[slug] ?? []), index])) });
  doneListeners.forEach((l) => l(slug, index));
  markPractice();
}

export const getProgress = store.get;
export const clearProgress = () => store.set({});

// Adds lessons finished on another device without firing onLessonDone again
export function mergeProgress(remote: Progress) {
  const p = { ...store.get() };
  for (const [slug, done] of Object.entries(remote)) p[slug] = Array.from(new Set([...(p[slug] ?? []), ...done]));
  store.set(p);
}

export function onLessonDone(l: (slug: string, index: number) => void) {
  doneListeners.add(l);
  return () => {
    doneListeners.delete(l);
  };
}

export function useProgress() {
  return { progress: store.useStore(), markDone };
}
