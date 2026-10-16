"use client";

import { markPractice } from "./practice";
import { createLocalStore } from "./store";

// Finished meditation sessions, kept on this device
type Log = { sessions: number; minutes: number };

const store = createLocalStore<Log>("swamigpt.meditation", { sessions: 0, minutes: 0 });

export function logSession(minutes: number) {
  const l = store.get();
  store.set({ sessions: l.sessions + 1, minutes: l.minutes + minutes });
  markPractice();
}

export const useMeditationLog = () => store.useStore();
export const clearMeditationLog = () => store.set({ sessions: 0, minutes: 0 });
