"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { SOUNDS, type Meditation } from "@/lib/meditations";
import { startAmbient } from "@/lib/ambient";
import { logSession } from "@/lib/meditation-log";
import { speak, speechProgress, stopSpeaking } from "@/lib/speak";
import { playChime } from "@/lib/sounds";
import { useSettings, type VoiceId } from "@/lib/settings";
import { VOICES } from "@/lib/voices";
import { Leaf } from "./Leaf";
import { BackIcon, PauseIcon, PlayIcon } from "./icons";

// Where a line tells you to breathe in or out, so the label and ring change as the voice says it
type Breath = "in" | "out";
const BREATH: [RegExp, Breath][] = [
  [/\b(?:breathe|breathing|slow breath|deep breath|(?<!than )the breath) in\b|\bcom(?:es|ing) in\b|(?:^|\. )In, two/gi, "in"],
  [/\b(?:breathe|breathing|the breath) out\b|\bsigh out\b|\bgo(?:es|ing) out\b|\bAnd out\b|\blet it go\b/gi, "out"],
];
function breathMarks(text: string) {
  const marks: { at: number; breath: Breath }[] = [];
  for (const [re, breath] of BREATH) {
    for (const m of text.matchAll(re)) marks.push({ at: (m.index ?? 0) / text.length, breath });
  }
  return marks.sort((a, b) => a.at - b.at);
}

function fmt(s: number) {
  const m = Math.floor(s / 60);
  return `${m}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
}

export function MeditationPlayer({ meditation }: { meditation: Meditation }) {
  const { meditationVoice, speed, update } = useSettings();
  const total = meditation.minutes * 60;
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [sound, setSound] = useState<string>("tanpura");
  const [line, setLine] = useState<string | null>(null);
  const [breath, setBreath] = useState<Breath | null>(null);
  const stopAmbient = useRef<() => void>(() => {});
  const elapsedRef = useRef(0);
  const timers = useRef<number[]>([]);
  const done = elapsed >= total;

  // The clock below runs for the whole session, so it reads the voice and speed from here:
  // a voice picked mid-session is used from the very next line
  const latest = useRef({ voice: meditationVoice, speed });
  useEffect(() => {
    latest.current = { voice: meditationVoice, speed };
  });

  // The words on screen follow the voice: a line appears when the voice starts saying it,
  // and a cue that comes due while the voice is still talking waits for it to finish
  const speaking = useRef(false);
  const queue = useRef<string[]>([]);
  const fallback = useRef(0);
  const marks = useRef<ReturnType<typeof breathMarks>>([]);
  const lastBreath = useRef(0);

  // Meditation is read a little slower than everything else
  const speakNow = (text: string) => {
    clearTimeout(fallback.current);
    speaking.current = true;
    let ended = false;
    const show = () => {
      clearTimeout(fallback.current);
      setLine(text);
      marks.current = breathMarks(text);
    };
    const finish = () => {
      if (ended) return;
      ended = true;
      show();
      speaking.current = false;
      const next = queue.current.shift();
      if (next) speakNow(next);
    };
    // If the voice can't play at all, the words still appear and the session carries on
    fallback.current = window.setTimeout(() => {
      setLine(text);
      fallback.current = window.setTimeout(finish, 4000 + text.length * 60);
    }, 6000);
    speak(text, latest.current.voice, latest.current.speed * 0.9, { onStart: show, onEnd: finish }, true);
  };

  const say = (text: string, delay = 0) => {
    timers.current.push(
      window.setTimeout(() => {
        if (speaking.current) queue.current.push(text);
        else speakNow(text);
      }, delay),
    );
  };

  const hush = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    clearTimeout(fallback.current);
    queue.current = [];
    speaking.current = false;
    marks.current = [];
    setBreath(null);
    stopSpeaking();
  };

  // Switching voice mid-session re-reads the current line, so the change is heard right away
  const chooseVoice = (voice: VoiceId) => {
    update({ meditationVoice: voice });
    if (running && line) {
      latest.current = { voice, speed };
      speakNow(line);
    }
  };

  // Clock: each cue is spoken at its second; the session ends with a bell and a closing line.
  // Time is read from the clock, not counted in ticks, because phones slow or pause timers when the
  // screen locks: a 5-minute session still ends after 5 minutes. After a pause in the timers, only
  // the latest missed line is spoken, so lines never pile up.
  useEffect(() => {
    if (!running) return;
    let startedAt: number | null = null; // set on the first tick, counting any time already played
    const t = window.setInterval(() => {
      const before = elapsedRef.current;
      startedAt ??= Date.now() - before * 1000;
      const e = Math.min(total, Math.floor((Date.now() - startedAt) / 1000));
      if (e === before) return;
      elapsedRef.current = e;
      setElapsed(e);
      if (e >= total) {
        setRunning(false);
        logSession(meditation.minutes);
        if (meditation.quietEnd) return; // the sleep session ends in silence
        playChime();
        if (meditation.closing) say(meditation.closing, 2500);
        return;
      }
      const cue = meditation.cues.filter((c) => c.at > before && c.at <= e).at(-1);
      if (cue) say(cue.text);
    }, 250);
    return () => clearInterval(t);
  }, [running, meditation, total]);

  // Breathe in / out follows the voice: checked a few times a second against how far it has read.
  // After the line, the last one stays a few seconds while you finish that breath.
  useEffect(() => {
    if (!running) return;
    const t = window.setInterval(() => {
      const p = speechProgress();
      if (p !== null && marks.current.length) {
        const said = marks.current.filter((m) => m.at <= p).at(-1);
        if (said) {
          lastBreath.current = Date.now();
          setBreath(said.breath);
          return;
        }
      }
      if (Date.now() - lastBreath.current > 6000) setBreath(null);
    }, 200);
    return () => clearInterval(t);
  }, [running]);

  // Background sound follows play/pause and the chosen sound
  useEffect(() => {
    stopAmbient.current();
    stopAmbient.current = running ? startAmbient(sound) : () => {};
    return () => stopAmbient.current();
  }, [running, sound]);

  useEffect(() => hush, []);

  const toggle = () => {
    if (running) {
      hush();
      setRunning(false);
      return;
    }
    if (done || elapsedRef.current === 0) {
      // A fresh start: bell first, then the first words once it has rung out
      elapsedRef.current = 0;
      setElapsed(0);
      playChime();
      const first = meditation.cues.find((c) => c.at === 0);
      if (first) say(first.text, 2500);
    }
    setRunning(true);
  };

  // Lock screen and Control Center: the meditation's name with play and pause, in the iPhone app
  // and in browsers that support it
  const toggleRef = useRef(toggle);
  useEffect(() => {
    toggleRef.current = toggle;
  });
  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: meditation.title,
      artist: "SwamiGPT",
      album: `${meditation.minutes}-minute meditation`,
      artwork: [{ src: "/pwa-icon/512.png", sizes: "512x512", type: "image/png" }],
    });
    const run = () => toggleRef.current();
    navigator.mediaSession.setActionHandler("play", run);
    navigator.mediaSession.setActionHandler("pause", run);
    return () => {
      navigator.mediaSession.setActionHandler("play", null);
      navigator.mediaSession.setActionHandler("pause", null);
      navigator.mediaSession.metadata = null;
    };
  }, [meditation]);
  useEffect(() => {
    if ("mediaSession" in navigator) navigator.mediaSession.playbackState = running ? "playing" : "paused";
  }, [running]);

  // The ring fills as you breathe in and empties as you breathe out; otherwise it rests
  const ring = !running
    ? "scale-[.62] duration-1000"
    : breath === "in"
      ? "scale-100 duration-[4000ms]"
      : breath === "out"
        ? "scale-[.62] duration-[6000ms]"
        : "scale-[.8] duration-[3000ms]";

  return (
    <div className="fixed inset-0 z-40 flex flex-col overflow-y-auto bg-night pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pr-[env(safe-area-inset-right)] pl-[env(safe-area-inset-left)] text-kajal">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_42%,rgba(227,179,65,.12),transparent_60%)]"
      />
      <div className="relative mx-auto flex w-full max-w-3xl items-center justify-between px-4 pt-4 sm:px-6">
        <Link
          href="/meditate"
          className="flex min-h-12 items-center gap-1 rounded-full border border-kajal/25 pl-2 pr-5 font-semibold hover:border-kajal/60"
        >
          <BackIcon className="size-6" />
          End
        </Link>
        <h1 className="font-display text-[1.1rem]">{meditation.title}</h1>
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-center px-4 py-4 text-center sm:py-8">
        <div className="relative flex size-[13rem] items-center justify-center sm:size-[20rem]">
          <div
            className={`absolute inset-0 rounded-full border border-flame/40 bg-flame/10 transition-transform ease-in-out ${ring}`}
          />
          <Leaf size={110} onDark />
        </div>

        <p className="mt-4 min-h-[2.6rem] font-display text-[1.5rem] leading-tight text-flame">
          {running ? (breath === "in" ? "Breathe in" : breath === "out" ? "Breathe out" : "Breathe gently") : done ? "Om shanti" : elapsed ? "Paused" : "When you are ready"}
        </p>
        <p className="mt-3 min-h-[5.5rem] max-w-[36ch] text-[1.15rem] leading-relaxed text-kajal-soft" aria-live="polite">
          {line ?? meditation.description}
        </p>

        <button
          type="button"
          onClick={toggle}
          className="mt-6 flex min-h-16 items-center gap-3 rounded-xl bg-flame px-9 text-[1.15rem] font-bold text-kajal hover:bg-sandal"
        >
          {running ? <PauseIcon /> : <PlayIcon />}
          {running ? "Pause" : done ? "Begin again" : elapsed ? "Continue" : "Begin"}
        </button>
        <p className="mt-4 text-[1rem] tabular-nums text-kajal-soft">
          {fmt(Math.min(elapsed, total))} of {fmt(total)}
        </p>
      </div>

      <div className="relative mx-auto mb-8 flex w-full max-w-3xl flex-col gap-6 px-4 sm:px-6">
        <fieldset>
          <legend className="mb-3 px-1 text-[0.9rem] font-semibold text-kajal-soft">Voice</legend>
          <div className="grid grid-cols-3 gap-2">
            {VOICES.map((v) => (
              <label
                key={v.id}
                className={`flex min-h-14 cursor-pointer items-center justify-center rounded-2xl border px-3 text-center text-[0.95rem] font-semibold has-focus-visible:outline-4 has-focus-visible:outline-offset-2 has-focus-visible:outline-flame ${
                  meditationVoice === v.id ? "border-flame bg-flame/15 text-flame" : "border-kajal/20 hover:border-kajal/50"
                }`}
              >
                <input
                  type="radio"
                  name="voice"
                  value={v.id}
                  checked={meditationVoice === v.id}
                  onChange={() => chooseVoice(v.id as VoiceId)}
                  className="sr-only"
                />
                {v.name}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-3 px-1 text-[0.9rem] font-semibold text-kajal-soft">Background sound</legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {SOUNDS.map((s) => (
              <label
                key={s.id}
                className={`flex min-h-14 cursor-pointer items-center justify-center rounded-2xl border px-3 text-center text-[0.95rem] font-semibold has-focus-visible:outline-4 has-focus-visible:outline-offset-2 has-focus-visible:outline-flame ${
                  sound === s.id ? "border-flame bg-flame/15 text-flame" : "border-kajal/20 hover:border-kajal/50"
                }`}
              >
                <input
                  type="radio"
                  name="sound"
                  value={s.id}
                  checked={sound === s.id}
                  onChange={() => setSound(s.id)}
                  className="sr-only"
                />
                {s.name}
              </label>
            ))}
          </div>
        </fieldset>
      </div>
    </div>
  );
}
