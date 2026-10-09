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
const CHUNK = 350; // characters per request: about two sentences, roughly 20 seconds of speech

type Handlers = { onStart?: () => void; onEnd?: () => void };

// What's playing now, and the next piece already loading, so stop can cancel both
let playing: HTMLAudioElement | null = null;
let loading: HTMLAudioElement | null = null;
let session = 0;

// Splits text into pieces of whole sentences. ElevenLabs charges for every character it's
// sent, so asking for one piece at a time means stopping early only costs what was heard.
function chunks(text: string): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+["')\]]*\s*|[^.!?]+$/g) ?? [text];
  const out: string[] = [];
  let buf = "";
  for (const s of sentences) {
    if (buf && buf.length + s.length > CHUNK) {
      out.push(buf.trim());
      buf = "";
    }
    buf += s;
  }
  if (buf.trim()) out.push(buf.trim());
  return out;
}

export function speak(text: string, voiceId: VoiceId, speed: number, handlers: Handlers = {}) {
  stopSpeaking();
  if (!ELEVENLABS) {
    browserSpeak(text, voiceId, speed, handlers);
    return;
  }

  const id = ++session;
  const parts = chunks(text);
  const audioFor = (i: number) => {
    const audio = new Audio(`/api/speak?${new URLSearchParams({ v: voiceId, s: String(speed), t: parts[i] })}`);
    audio.preload = "auto";
    return audio;
  };
  let started = false;

  const play = (i: number, audio: HTMLAudioElement) => {
    if (id !== session) return;
    playing = audio;
    // Fetch the next piece only once this one is playing: at most one piece ahead is ever paid for
    audio.onplaying = () => {
      if (id !== session) return;
      if (!started) handlers.onStart?.();
      started = true;
      if (i + 1 < parts.length && !loading) loading = audioFor(i + 1);
    };
    audio.onended = () => {
      if (id !== session) return;
      if (i + 1 >= parts.length) {
        playing = null;
        handlers.onEnd?.();
        return;
      }
      const next = loading ?? audioFor(i + 1);
      loading = null;
      play(i + 1, next);
    };
    audio.onerror = () => {
      if (id !== session) return;
      // ElevenLabs unavailable: read the rest with the browser's voice instead
      stopSpeaking();
      browserSpeak(parts.slice(i).join(" "), voiceId, speed, started ? { onEnd: handlers.onEnd } : handlers);
    };
    void audio.play().catch(() => {});
  };

  play(0, audioFor(0));
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
  session++; // any events still on their way from the old audio are ignored
  for (const audio of [playing, loading]) {
    if (!audio) continue;
    audio.pause();
    audio.removeAttribute("src"); // also cancels a piece still downloading
  }
  playing = loading = null;
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}
