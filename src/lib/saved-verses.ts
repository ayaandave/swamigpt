"use client";

import type { Verse } from "./scripture/types";
import { createLocalStore } from "./store";

// Verses someone keeps, newest first. Kept on this device (the verse itself is stored, so the
// list shows without loading the whole library).
type Saved = { verses: (Verse & { savedAt: string })[] };

const store = createLocalStore<Saved>("swamigpt.saved", { verses: [] });

export function useSavedVerses() {
  const { verses } = store.useStore();
  return {
    verses,
    isSaved: (id: string) => verses.some((v) => v.id === id),
    toggle: (verse: Verse) => {
      const { verses: now } = store.get();
      store.set({
        verses: now.some((v) => v.id === verse.id)
          ? now.filter((v) => v.id !== verse.id)
          : [{ ...verse, savedAt: new Date().toISOString() }, ...now].slice(0, 500),
      });
    },
  };
}
