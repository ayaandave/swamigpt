"use client";

import { createLocalStore } from "./store";

// MOCK progress in browser storage. Phase 5 moves this to Supabase accounts.
type Progress = Record<string, number[]>; // path slug -> completed lesson indexes

const store = createLocalStore<Progress>("swamigpt.progress", {});

function markDone(slug: string, index: number) {
  const p = store.get();
  store.set({ ...p, [slug]: Array.from(new Set([...(p[slug] ?? []), index])) });
}

export function useProgress() {
  return { progress: store.useStore(), markDone };
}
