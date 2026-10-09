"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { SOUNDS, type Meditation } from "@/lib/meditations";
import { startAmbient } from "@/lib/ambient";
import { logSession } from "@/lib/meditation-log";
import { speak, stopSpeaking } from "@/lib/speak";
import { playChime } from "@/lib/sounds";
import { useSettings, type VoiceId } from "@/lib/settings";
import { VOICES } from "@/lib/voices";
import { Diya } from "./Diya";
import { BackIcon, PauseIcon, PlayIcon } from "./icons";

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
  const stopAmbient = useRef<() => void>(() => {});
  const elapsedRef = useRef(0);
  const timers = useRef<number[]>([]);
  const done = elapsed >= total;

  // Meditation is read a little slower than everything else
  const say = (text: string, delay = 0) => {
    timers.current.push(
      window.setTimeout(() => {
        setLine(text);
        speak(text, meditationVoice, speed * 0.9);
      }, delay),
    );
  };

  // Clock: each cue is spoken at its second; the session ends with a bell and a closing line
  useEffect(() => {
    if (!running) return;
    const t = window.setInterval(() => {
      const e = ++elapsedRef.current;
      setElapsed(e);
      if (e >= total) {
        setRunning(false);
        logSession(meditation.minutes);
        if (meditation.quietEnd) return; // the sleep session ends in silence
        playChime();
        if (meditation.closing) say(meditation.closing, 2500);
        return;
      }
      const cue = meditation.cues.find((c) => c.at === e);
      if (cue) say(cue.text);
    }, 1000);
    return () => clearInterval(t);
    // say only reads the latest voice and speed, so it isn't a dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, meditation, total]);

  // Background sound follows play/pause and the chosen sound
  useEffect(() => {
    stopAmbient.current();
    stopAmbient.current = running ? startAmbient(sound) : () => {};
    return () => stopAmbient.current();
  }, [running, sound]);

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
      stopSpeaking();
    },
    [],
  );

  const toggle = () => {
    if (running) {
      timers.current.forEach(clearTimeout);
      stopSpeaking();
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

  // Breath prompt synced to the CSS cycle: 40% in, 10% hold, 50% out
  const cycle = meditation.breathSeconds;
  const phase = (elapsed % cycle) / cycle;
  const breath = phase < 0.4 ? "Breathe in" : phase < 0.5 ? "Hold" : "Breathe out";

  return (
    <div className="fixed inset-0 z-40 flex flex-col overflow-y-auto bg-night text-sandal">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_42%,rgba(255,179,71,.16),transparent_60%)]"
      />
      <div className="relative mx-auto flex w-full max-w-3xl items-center justify-between px-4 pt-4 sm:px-6">
        <Link
          href="/meditate"
          className="flex min-h-12 items-center gap-1 rounded-full border-2 border-sandal/25 pl-2 pr-5 font-semibold hover:border-sandal/60"
        >
          <BackIcon className="size-6" />
          End
        </Link>
        <p className="font-display text-[1.1rem]">{meditation.title}</p>
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-center px-4 py-4 text-center sm:py-8">
        <div className="relative flex size-[13rem] items-center justify-center sm:size-[20rem]">
          <div
            className={`absolute inset-0 rounded-full border-2 border-flame/40 bg-flame/10 ${running ? "breath-ring" : "scale-[.62]"}`}
            style={{ ["--breath-cycle" as string]: `${cycle}s`, animationPlayState: running ? "running" : "paused" }}
          />
          <Diya size={110} onDark />
        </div>

        <p className="mt-4 min-h-[2.6rem] font-display text-[2rem] leading-tight text-flame" aria-live="polite">
          {running ? breath : done ? "Om shanti" : elapsed ? "Paused" : "When you are ready"}
        </p>
        <p className="mt-3 min-h-[3.5rem] max-w-[36ch] text-[1.05rem] leading-relaxed text-sandal/80">
          {line ?? meditation.description}
        </p>

        <button
          type="button"
          onClick={toggle}
          className="mt-6 flex min-h-16 items-center gap-3 rounded-full bg-flame px-9 text-[1.15rem] font-bold text-kajal hover:bg-sandal"
        >
          {running ? <PauseIcon /> : <PlayIcon />}
          {running ? "Pause" : done ? "Begin again" : elapsed ? "Continue" : "Begin"}
        </button>
        <p className="mt-4 text-[1rem] tabular-nums text-sandal/70">
          {fmt(Math.min(elapsed, total))} of {fmt(total)}
        </p>
      </div>

      <div className="relative mx-auto mb-8 flex w-full max-w-3xl flex-col gap-6 px-4 sm:px-6">
        <fieldset>
          <legend className="mb-3 px-1 text-[0.9rem] font-semibold text-sandal/80">Voice</legend>
          <div className="grid grid-cols-3 gap-2">
            {VOICES.map((v) => (
              <label
                key={v.id}
                className={`flex min-h-14 cursor-pointer items-center justify-center rounded-2xl border-2 px-3 text-center text-[0.95rem] font-semibold ${
                  meditationVoice === v.id ? "border-flame bg-flame/15 text-flame" : "border-sandal/20 hover:border-sandal/50"
                }`}
              >
                <input
                  type="radio"
                  name="voice"
                  value={v.id}
                  checked={meditationVoice === v.id}
                  onChange={() => update({ meditationVoice: v.id as VoiceId })}
                  className="sr-only"
                />
                {v.name}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-3 px-1 text-[0.9rem] font-semibold text-sandal/80">Background sound</legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {SOUNDS.map((s) => (
              <label
                key={s.id}
                className={`flex min-h-14 cursor-pointer items-center justify-center rounded-2xl border-2 px-3 text-center text-[0.95rem] font-semibold ${
                  sound === s.id ? "border-flame bg-flame/15 text-flame" : "border-sandal/20 hover:border-sandal/50"
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
