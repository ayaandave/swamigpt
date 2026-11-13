"use client";

import { createLocalStore } from "./store";

export type TextSize = "regular" | "large" | "larger";
export type Theme = "system" | "dark" | "light";
export type VoiceId = "swamiji" | "amma" | "sakshi";
export type Depth = "simpler" | "deeper";
export type AgeGroup = "under13" | "13plus";
// Asked once on the welcome screens; they shape the suggested questions and today's meditation
export type Focus = "stress" | "school" | "relationships" | "faith" | "curious";
export type Familiarity = "none" | "little" | "grew-up";

export type Settings = {
  textSize: TextSize;
  theme: Theme; // "system" follows the phone
  voice: VoiceId;
  speed: number; // 0.65 – 0.95
  depth: Depth;
  ageGroup: AgeGroup | null; // answered once on the welcome gate
  meditationVoice: VoiceId; // meditations are read by Dhyan ("sakshi") unless changed in the player
  avatar: string | null; // an id from lib/avatars, chosen on the account page
  dailyVerse: { on: boolean; time: string }; // the iPhone app's morning notification, "07:30"
  aiConsent: boolean; // agreed that questions are sent to Anthropic's AI (asked before the first one)
  focus: Focus | null; // "What brings you here?"
  familiarity: Familiarity | null; // "How well do you know the Gita?"
  dailyMinutes: 1 | 5 | 10 | null; // "How much time do you have each day?"
};

const KEY = "swamigpt.settings";

const store = createLocalStore<Settings>(KEY, {
  textSize: "regular",
  theme: "system",
  voice: "swamiji",
  speed: 0.8,
  depth: "simpler",
  ageGroup: null,
  meditationVoice: "sakshi",
  avatar: null,
  dailyVerse: { on: false, time: "07:30" },
  aiConsent: false,
  focus: null,
  familiarity: null,
  dailyMinutes: null,
});

// "Match my phone" follows a phone's own light or dark setting; laptops and desktops (a mouse or
// trackpad) stay dark unless Light is picked in Settings.
const COMPUTER = "(hover: hover) and (pointer: fine)";

// Runs in <head> before first paint so the chosen text size and theme never flicker
// and returning visitors never see the welcome gate flash.
export const settingsScript = `try{var s=JSON.parse(localStorage.getItem("${KEY}")||"{}"),d=document.documentElement.dataset;if(s.textSize&&s.textSize!=="regular")d.text=s.textSize;if(s.theme==="dark"||s.theme==="light")d.theme=s.theme;else if(matchMedia("${COMPUTER}").matches)d.theme="dark";if(s.ageGroup)d.welcomed="1"}catch(e){}`;

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
  if (next.theme === "dark" || next.theme === "light") document.documentElement.dataset.theme = next.theme;
  else if (matchMedia(COMPUTER).matches) document.documentElement.dataset.theme = "dark";
  else delete document.documentElement.dataset.theme;
  store.set(next);
}

export function useSettings() {
  return { ...store.useStore(), update };
}
