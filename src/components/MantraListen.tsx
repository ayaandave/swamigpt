"use client";

import { useEffect, useRef, useState } from "react";
import { startAmbient } from "@/lib/ambient";
import type { MantraAudio } from "@/lib/mantras";
import { PauseIcon, PlayIcon } from "./icons";

// Listen to the mantra chanted, over a quiet tanpura tuned to the chanter's voice.
// "Repeat" keeps it going so you can chant along.
export function MantraListen({ audio, title }: { audio: MantraAudio; title: string }) {
  const el = useRef<HTMLAudioElement>(null);
  const stopDrone = useRef<() => void>(() => {});
  const [playing, setPlaying] = useState(false);
  const [repeat, setRepeat] = useState(true);
  const [drone, setDrone] = useState(true);

  // The drone is started inside the tap itself: iPhones only allow sound to begin from a tap
  const setDroneOn = (on: boolean) => {
    stopDrone.current();
    stopDrone.current = on ? startAmbient("drone", audio.tonicHz) : () => {};
  };
  useEffect(() => () => stopDrone.current(), []);

  const toggle = () => {
    const a = el.current;
    if (!a) return;
    if (a.paused) {
      void a.play().catch(() => setDroneOn(false));
      setDroneOn(drone);
    } else a.pause();
  };

  const switchClass = (on: boolean) =>
    `min-h-11 rounded-xl border px-4 text-[0.95rem] font-semibold ${
      on ? "border-kesar bg-kesar/15 text-kajal" : "border-sandal-edge text-kajal-soft hover:border-kajal"
    }`;

  return (
    <section aria-label={`Listen to ${title}`} className="mt-8 rounded-2xl bg-sandal-deep px-6 py-6">
      <div className="flex items-center gap-5">
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? "Pause" : `Listen to ${title}`}
          className="flex size-16 shrink-0 items-center justify-center rounded-full bg-kesar text-on-kesar hover:bg-kesar-deep hover:text-sandal"
        >
          {playing ? <PauseIcon className="size-7" /> : <PlayIcon className="size-7" />}
        </button>
        <div>
          <p className="font-display text-[1.15rem] leading-tight">Listen and chant along</p>
          <p className="text-[0.95rem] text-kajal-soft">Close your eyes and let the sound carry you.</p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button type="button" aria-pressed={repeat} onClick={() => setRepeat((r) => !r)} className={switchClass(repeat)}>
          Repeat
        </button>
        <button
          type="button"
          aria-pressed={drone}
          onClick={() => {
            setDrone(!drone);
            if (playing) setDroneOn(!drone);
          }}
          className={switchClass(drone)}
        >
          Tanpura drone
        </button>
      </div>

      <audio
        ref={el}
        src={audio.src}
        preload="none"
        loop={repeat}
        onPlay={() => setPlaying(true)}
        onPause={() => {
          setPlaying(false);
          setDroneOn(false);
        }}
        onEnded={() => {
          setPlaying(false);
          setDroneOn(false);
        }}
      />

      <p className="mt-4 text-[0.85rem] text-kajal-soft">
        Recording by {audio.by},{" "}
        <a href={audio.licenseUrl} className="underline underline-offset-2">
          {audio.license}
        </a>{" "}
        (
        <a href={audio.sourceUrl} className="underline underline-offset-2">
          source
        </a>
        ). The tanpura is played live, tuned to the chanter&apos;s voice.
      </p>
    </section>
  );
}
