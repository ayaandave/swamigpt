"use client";

import { getVoice } from "./voices";
import type { VoiceId } from "./settings";

/*
  Reads text aloud. With ElevenLabs set up (NEXT_PUBLIC_ELEVENLABS=1 plus the server keys),
  the voice comes from /api/speak as streamed audio. Otherwise, or if that fails, the
  browser's built-in speech is used, so Listen always works.
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

const ELEVENLABS = process.env.NEXT_PUBLIC_ELEVENLABS === "1";
let current: HTMLAudioElement | null = null;

type Handlers = { onStart?: () => void; onEnd?: () => void };

export function speak(text: string, voiceId: VoiceId, speed: number, handlers: Handlers = {}) {
  stopSpeaking();
  if (ELEVENLABS && text.length <= 5000) {
    const audio = new Audio(`/api/speak?${new URLSearchParams({ v: voiceId, s: String(speed), t: text })}`);
    current = audio;
    let started = false;
    audio.onplaying = () => {
      if (!started) handlers.onStart?.();
      started = true;
    };
    audio.onended = () => {
      if (current === audio) current = null;
      handlers.onEnd?.();
    };
    audio.onerror = () => {
      // ElevenLabs unavailable: read it with the browser's voice instead
      if (current !== audio) return;
      current = null;
      browserSpeak(text, voiceId, speed, started ? { onEnd: handlers.onEnd } : handlers);
    };
    void audio.play().catch(() => {});
    return;
  }
  browserSpeak(text, voiceId, speed, handlers);
}

function browserSpeak(text: string, voiceId: VoiceId, speed: number, handlers: Handlers) {
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
  if (current) {
    const audio = current;
    current = null; // set first, so the pause below isn't treated as an error
    audio.pause();
    audio.removeAttribute("src");
  }
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}
