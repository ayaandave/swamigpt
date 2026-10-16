"use client";

import { createLocalStore } from "./store";

export type TextSize = "regular" | "large" | "larger";
export type VoiceId = "swamiji" | "amma" | "sakshi";
export type Depth = "simpler" | "deeper";
export type AgeGroup = "under13" | "13plus";

export type Settings = {
  textSize: TextSize;
  voice: VoiceId;
  speed: number; // 0.65 – 0.95
  depth: Depth;
  ageGroup: AgeGroup | null; // answered once on the welcome gate
  meditationVoice: VoiceId; // meditations are read by Dhyan ("sakshi") unless changed in the player
  avatar: string | null; // an id from lib/avatars, chosen on the account page
};

const KEY = "swamigpt.settings";

const store = createLocalStore<Settings>(KEY, {
  textSize: "regular",
  voice: "swamiji",
  speed: 0.8,
  depth: "simpler",
  ageGroup: null,
  meditationVoice: "sakshi",
  avatar: null,
});

// Runs in <head> before first paint so the chosen text size never flickers
// and returning visitors never see the welcome gate flash.
export const settingsScript = `try{var s=JSON.parse(localStorage.getItem("${KEY}")||"{}"),d=document.documentElement.dataset;if(s.textSize&&s.textSize!=="regular")d.text=s.textSize;if(s.ageGroup)d.welcomed="1"}catch(e){}`;

export const getSettings = store.get;
export const onSettingsChange = store.onChange;

export function updateSettings(patch: Partial<Settings>) {
  update(patch);
}

function update(patch: Partial<Settings>) {
  const next = { ...store.get(), ...patch };
  if (next.textSize === "regular") delete document.documentElement.dataset.text;
  else document.documentElement.dataset.text = next.textSize;
  if (next.ageGroup) document.documentElement.dataset.welcomed = "1";
  store.set(next);
}

export function useSettings() {
  return { ...store.useStore(), update };
}
