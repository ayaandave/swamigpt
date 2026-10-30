"use client";

import Link from "next/link";
import { useState } from "react";
import { useSettings, type Depth, type TextSize, type Theme } from "@/lib/settings";
import { VOICES } from "@/lib/voices";
import { speak, stopSpeaking } from "@/lib/speak";
import { Om } from "@/components/Om";
import { MorningVerse } from "@/components/MorningVerse";
import { EmailPrefs } from "@/components/EmailPrefs";
import { CheckIcon, SpeakerIcon, StopIcon } from "@/components/icons";

const TEXT_SIZES: { id: TextSize; label: string; sample: string }[] = [
  { id: "regular", label: "Regular", sample: "text-[1rem]" },
  { id: "large", label: "Large", sample: "text-[1.2rem]" },
  { id: "larger", label: "Larger", sample: "text-[1.4rem]" },
];

const THEMES: { id: Theme; label: string; note: string }[] = [
  { id: "dark", label: "Dark", note: "Black and gold" },
  { id: "light", label: "Light", note: "Paper white and gold" },
  { id: "system", label: "Match my phone", note: "Follows your phone's setting; dark on computers" },
];

const SPEEDS = [
  { value: 0.65, label: "Very slow" },
  { value: 0.8, label: "Slow" },
  { value: 0.95, label: "Natural" },
];

const DEPTHS: { id: Depth; label: string; note: string }[] = [
  { id: "simpler", label: "Simple and warm", note: "Stories and everyday examples" },
  { id: "deeper", label: "Deeper study", note: "Sanskrit terms and different schools of thought. Each answer uses 2 of your daily questions" },
];

export default function SettingsPage() {
  const s = useSettings();
  const [sampling, setSampling] = useState<string | null>(null);

  const playSample = (id: (typeof VOICES)[number]["id"], text: string) => {
    if (sampling === id) {
      stopSpeaking();
      setSampling(null);
      return;
    }
    speak(text, id, s.speed, { onEnd: () => setSampling(null), onStop: () => setSampling(null) }, true);
    setSampling(id);
  };

  return (
    <div className="pt-8">
      <h1 className="text-[1.75rem] font-medium leading-tight tracking-tight">Settings</h1>

      <Choice
        title="Appearance"
        options={THEMES.map((t) => ({ id: t.id, label: t.label, note: t.note }))}
        value={s.theme}
        onChange={(v) => s.update({ theme: v as Theme })}
        first
      />

      <section className="mt-10">
        <h2 className="text-[1.1rem] font-medium tracking-tight">Choose a voice</h2>
        <div className="mt-4 grid gap-4">
          {VOICES.map((v) => {
            const chosen = s.voice === v.id;
            return (
              <div
                key={v.id}
                className={`flex flex-wrap items-center gap-4 rounded-2xl border bg-sandal-deep px-4 py-4 ${
                  chosen ? "border-kesar/70" : "border-sandal-edge"
                }`}
              >
                <Om size={40} state={sampling === v.id ? "speaking" : "idle"} />
                <div className="min-w-0 flex-1 basis-48">
                  <p className="text-[1rem] font-medium leading-tight">{v.name}</p>
                  <p className="text-[0.85rem] text-kajal-soft">{v.description}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => playSample(v.id, v.sample)}
                    className="flex min-h-11 items-center gap-2 rounded-xl border border-sandal-edge px-4 text-[0.9rem] font-medium hover:border-kajal-soft"
                  >
                    {sampling === v.id ? <StopIcon /> : <SpeakerIcon />}
                    {sampling === v.id ? "Stop" : "Hear sample"}
                  </button>
                  <button
                    type="button"
                    onClick={() => s.update({ voice: v.id })}
                    aria-pressed={chosen}
                    className={`flex min-h-11 items-center gap-2 rounded-xl px-4 text-[0.9rem] font-medium ${
                      chosen ? "bg-kesar text-on-kesar" : "bg-kajal text-sandal hover:opacity-90"
                    }`}
                  >
                    {chosen && <CheckIcon />}
                    {chosen ? "Chosen" : "Choose"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <Choice
        title="How fast should Swami speak?"
        options={SPEEDS.map((sp) => ({ id: String(sp.value), label: sp.label }))}
        value={String(s.speed)}
        onChange={(v) => s.update({ speed: Number(v) })}
      />

      <Choice
        title="Text size"
        options={TEXT_SIZES.map((t) => ({ id: t.id, label: t.label, className: t.sample }))}
        value={s.textSize}
        onChange={(v) => s.update({ textSize: v as TextSize })}
      />

      <Choice
        title="How should Swami explain things?"
        options={DEPTHS.map((d) => ({ id: d.id, label: d.label, note: d.note }))}
        value={s.depth}
        onChange={(v) => s.update({ depth: v as Depth })}
      />

      <MorningVerse />
      <EmailPrefs />

      <Link
        href="/sources"
        className="mt-10 flex min-h-14 items-center justify-between rounded-2xl border border-sandal-edge bg-sandal-deep px-4 py-3 font-medium hover:border-kajal-soft"
      >
        Sources &amp; safety
        <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}

function Choice({
  title,
  options,
  value,
  onChange,
  first = false,
}: {
  first?: boolean;
  title: string;
  options: { id: string; label: string; note?: string; className?: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <fieldset className={first ? "mt-6" : "mt-10"}>
      <legend className="text-[1.1rem] font-medium tracking-tight">{title}</legend>
      <div className={`mt-3 grid gap-2 ${options.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
        {options.map((o) => {
          const on = value === o.id;
          return (
            <label
              key={o.id}
              className={`flex min-h-14 cursor-pointer flex-col justify-center rounded-2xl border bg-sandal-deep px-4 py-3 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-kesar ${
                on ? "border-kesar/70" : "border-sandal-edge hover:border-kajal-soft"
              }`}
            >
              <input
                type="radio"
                name={title}
                value={o.id}
                checked={on}
                onChange={() => onChange(o.id)}
                className="sr-only"
              />
              <span className={`flex items-center gap-2 font-medium ${o.className ?? "text-[0.95rem]"}`}>
                {on && <CheckIcon className="size-5 text-kesar-deep" />}
                {o.label}
              </span>
              {o.note && <span className="text-[0.8rem] text-kajal-soft">{o.note}</span>}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
