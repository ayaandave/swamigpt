"use client";

import { createLocalStore } from "./store";

export type TextSize = "regular" | "large" | "larger";
export type VoiceId = "swamiji" | "amma" | "sakshi";
export type Depth = "simpler" | "deeper";

export type Settings = {
  textSize: TextSize;
  voice: VoiceId;
  speed: number; // 0.65 – 0.95
  depth: Depth;
};

const KEY = "swamigpt.settings";

const store = createLocalStore<Settings>(KEY, {
  textSize: "regular",
  voice: "swamiji",
  speed: 0.8,
  depth: "simpler",
});

// Runs in <head> before first paint so the chosen text size never flickers.
export const textSizeScript = `try{var s=JSON.parse(localStorage.getItem("${KEY}")||"{}");if(s.textSize&&s.textSize!=="regular")document.documentElement.dataset.text=s.textSize}catch(e){}`;

function update(patch: Partial<Settings>) {
  const next = { ...store.get(), ...patch };
  if (next.textSize === "regular") delete document.documentElement.dataset.text;
  else document.documentElement.dataset.text = next.textSize;
  store.set(next);
}

export function useSettings() {
  return { ...store.useStore(), update };
}
