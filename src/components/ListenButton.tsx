"use client";

import { useEffect, useRef, useState } from "react";
import { speak, stopSpeaking } from "@/lib/speak";
import { useSettings } from "@/lib/settings";
import { getVoice } from "@/lib/voices";
import { SpeakerIcon, StopIcon } from "./icons";

type Props = {
  text: string;
  save?: boolean; // fixed text (lesson, verse): keep the audio so replays cost nothing
  onSpeakingChange?: (speaking: boolean) => void;
  onDark?: boolean;
};

export function ListenButton({ text, onSpeakingChange, onDark = false, save = false }: Props) {
  const { voice, speed } = useSettings();
  const [playing, setPlaying] = useState(false);
  const mine = useRef(false); // this button started what's playing now

  // Leaving the page stops this button's audio, but never audio another button started
  useEffect(() => () => void (mine.current && stopSpeaking()), []);

  const set = (v: boolean) => {
    mine.current = v;
    setPlaying(v);
    onSpeakingChange?.(v);
  };

  const toggle = () => {
    if (playing) {
      stopSpeaking();
      set(false);
      return;
    }
    speak(text, voice, speed, { onStart: () => set(true), onEnd: () => set(false), onStop: () => set(false) }, save);
    set(true);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={playing}
      className={`inline-flex min-h-14 items-center gap-3 rounded-xl px-6 text-[1rem] font-semibold transition-colors ${
        playing
          ? "bg-kajal text-sandal"
          : onDark
            ? "bg-flame text-on-kesar hover:bg-sandal"
            : "bg-kesar text-on-kesar hover:bg-kesar-deep hover:text-sandal"
      }`}
    >
      {playing ? <StopIcon /> : <SpeakerIcon />}
      {playing ? "Stop" : `Listen with ${getVoice(voice).name}`}
    </button>
  );
}
