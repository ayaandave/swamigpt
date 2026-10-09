"use client";

import { createLocalStore } from "./store";

// Finished meditation sessions, kept on this device
type Log = { sessions: number; minutes: number };

const store = createLocalStore<Log>("swamigpt.meditation", { sessions: 0, minutes: 0 });

export function logSession(minutes: number) {
  const l = store.get();
  store.set({ sessions: l.sessions + 1, minutes: l.minutes + minutes });
}

export const useMeditationLog = () => store.useStore();
