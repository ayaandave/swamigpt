"use client";

import { useEffect, useState } from "react";
import { speak, stopSpeaking } from "@/lib/speak";
import { useSettings } from "@/lib/settings";
import { getVoice } from "@/lib/voices";
import { SpeakerIcon, StopIcon } from "./icons";

type Props = {
  text: string;
  onSpeakingChange?: (speaking: boolean) => void;
  onDark?: boolean;
};

export function ListenButton({ text, onSpeakingChange, onDark = false }: Props) {
  const { voice, speed } = useSettings();
  const [playing, setPlaying] = useState(false);

  useEffect(() => () => stopSpeaking(), []);

  const set = (v: boolean) => {
    setPlaying(v);
    onSpeakingChange?.(v);
  };

  const toggle = () => {
    if (playing) {
      stopSpeaking();
      set(false);
      return;
    }
    speak(text, voice, speed, { onStart: () => set(true), onEnd: () => set(false) });
    set(true);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={playing}
      className={`inline-flex min-h-14 items-center gap-3 rounded-full px-6 text-[1rem] font-semibold transition-colors ${
        playing
          ? "bg-kajal text-sandal"
          : onDark
            ? "bg-flame text-kajal hover:bg-sandal"
            : "bg-kesar text-kajal hover:bg-kesar-deep hover:text-sandal"
      }`}
    >
      {playing ? <StopIcon /> : <SpeakerIcon />}
      {playing ? "Stop" : `Listen with ${getVoice(voice).name}`}
    </button>
  );
}
