"use client";

import { getVoice } from "./voices";
import type { VoiceId } from "./settings";

/*
  MOCK VOICE — uses the browser's built-in speech so the "Listen" flow can be
  tested now. Phase 4 replaces this with ElevenLabs audio from our API.
*/

const MALE = /daniel|alex|fred|rishi|aaron|arthur|google uk english male|male/i;
const FEMALE = /samantha|veena|karen|moira|tessa|serena|female|google uk english female/i;

function pickVoice(prefer: "male" | "female" | "any") {
  const voices = window.speechSynthesis.getVoices().filter((v) => v.lang.startsWith("en"));
  const indian = voices.filter((v) => v.lang === "en-IN");
  const pool = indian.length ? [...indian, ...voices] : voices;
  if (prefer === "male") return pool.find((v) => MALE.test(v.name)) ?? pool[0];
  if (prefer === "female") return pool.find((v) => FEMALE.test(v.name)) ?? pool[0];
  return pool[0];
}

export function speak(
  text: string,
  voiceId: VoiceId,
  speed: number,
  handlers: { onStart?: () => void; onEnd?: () => void } = {},
) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    handlers.onEnd?.();
    return;
  }
  const v = getVoice(voiceId);
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  const voice = pickVoice(v.prefer);
  if (voice) u.voice = voice;
  u.rate = speed;
  u.pitch = v.pitch;
  u.onstart = () => handlers.onStart?.();
  u.onend = () => handlers.onEnd?.();
  u.onerror = () => handlers.onEnd?.();
  window.speechSynthesis.speak(u);
}

export function stopSpeaking() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}
