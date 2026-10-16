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

// onEnd: it finished (or failed). onStop: something else started playing, or it was stopped,
// so a button showing "Stop" can go back to "Listen"
type Handlers = { onStart?: () => void; onEnd?: () => void; onStop?: () => void };
// Whoever is playing now, told when they are interrupted
let owner: Handlers | null = null;

// What's playing now, and the next piece already loading, so stop can cancel both
let playing: HTMLAudioElement | null = null;
let loading: HTMLAudioElement | null = null;
let session = 0;
// A voice ticket for the signed-in account (set by AccountSync), so read-aloud limits follow the
// account's plan. Fetched ahead of time: audio has to start inside the tap, with no waiting.
let voiceTicket: string | null = null;
export const setVoiceTicket = (ticket: string | null) => {
  voiceTicket = ticket;
};

// How far the browser's own voice has read, for speechProgress
let browserRead: { at: number; of: number } | null = null;
// Set when ElevenLabs fails (out of credits, at a read-aloud limit, down), so the next reads go
// straight to the browser's voice for a couple of minutes instead of failing one by one
let elevenDownUntil = 0;
const ELEVEN_RETRY_MS = 2 * 60 * 1000;

// Phones only let speech start from a tap. If ElevenLabs fails after the tap, the browser's voice
// would be blocked, so it is woken up now, silently, while the tap still counts.
function unlockBrowserSpeech() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const u = new SpeechSynthesisUtterance(" ");
  u.volume = 0;
  window.speechSynthesis.speak(u);
}

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

// save: the server keeps the audio and replays it for free next time (lessons, verses and
// meditation lines; never chat answers, which can be personal).
export function speak(text: string, voiceId: VoiceId, speed: number, handlers: Handlers = {}, save = false) {
  stopSpeaking();
  owner = handlers;
  if (!ELEVENLABS || Date.now() < elevenDownUntil) {
    browserSpeak(text, voiceId, speed, handlers);
    return;
  }

  unlockBrowserSpeech();
  const id = ++session;
  const parts = chunks(text);
  // One sentence either side of each piece, so the voice keeps the same flow and mood across pieces
  const lastSentence = (t: string) => (t.match(/[^.!?]+[.!?]+["')\]]*\s*$/)?.[0] ?? t).trim().slice(-150);
  const firstSentence = (t: string) => (t.match(/^[^.!?]+[.!?]+["')\]]*/)?.[0] ?? t).trim().slice(0, 150);
  const audioFor = (i: number) => {
    const q = new URLSearchParams({ v: voiceId, s: String(speed), t: parts[i] });
    if (save) q.set("c", "1");
    if (voiceTicket) q.set("k", voiceTicket);
    if (i > 0) q.set("p", lastSentence(parts[i - 1]));
    if (i + 1 < parts.length) q.set("n", firstSentence(parts[i + 1]));
    const audio = new Audio(`/api/speak?${q}`);
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
      elevenDownUntil = Date.now() + ELEVEN_RETRY_MS;
      stopSpeaking(false);
      owner = handlers;
      browserSpeak(parts.slice(i).join(" "), voiceId, speed, started ? { onEnd: handlers.onEnd } : handlers);
    };
    // A refused play (a phone blocking audio that didn't start from a tap) falls back to the
    // phone's own voice instead of leaving the button stuck on "Stop"
    audio.play().catch(() => {
      if (id !== session || started) return;
      stopSpeaking(false);
      owner = handlers;
      browserSpeak(parts.slice(i).join(" "), voiceId, speed, handlers);
    });
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
  browserRead = { at: 0, of: text.length };
  u.onboundary = (e) => {
    if (browserRead) browserRead.at = e.charIndex;
  };
  u.onstart = () => handlers.onStart?.();
  u.onend = () => {
    browserRead = null;
    handlers.onEnd?.();
  };
  u.onerror = () => {
    browserRead = null;
    handlers.onEnd?.();
  };
  window.speechSynthesis.speak(u);
}

// How far through the current piece the voice is, from 0 to 1, or null when nothing is playing.
// Short texts (under one piece, like meditation lines) make this the share of the whole text.
export function speechProgress(): number | null {
  if (playing && playing.duration > 0 && Number.isFinite(playing.duration)) {
    return playing.currentTime / playing.duration;
  }
  if (browserRead) return browserRead.at / browserRead.of;
  return null;
}

export function stopSpeaking(notify = true) {
  const was = owner;
  owner = null;
  if (notify) was?.onStop?.();
  session++; // any events still on their way from the old audio are ignored
  browserRead = null;
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
