"use client";

import Link from "next/link";
import { useState } from "react";
import { useSettings, type Depth, type TextSize } from "@/lib/settings";
import { VOICES } from "@/lib/voices";
import { speak, stopSpeaking } from "@/lib/speak";
import { Diya } from "@/components/Diya";
import { CheckIcon, SpeakerIcon, StopIcon } from "@/components/icons";

const TEXT_SIZES: { id: TextSize; label: string; sample: string }[] = [
  { id: "regular", label: "Regular", sample: "text-[1rem]" },
  { id: "large", label: "Large", sample: "text-[1.2rem]" },
  { id: "larger", label: "Larger", sample: "text-[1.4rem]" },
];

const SPEEDS = [
  { value: 0.65, label: "Very slow" },
  { value: 0.8, label: "Slow" },
  { value: 0.95, label: "Natural" },
];

const DEPTHS: { id: Depth; label: string; note: string }[] = [
  { id: "simpler", label: "Simple and warm", note: "Stories and everyday examples" },
  { id: "deeper", label: "Deeper study", note: "Sanskrit terms and different schools of thought" },
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
    <div className="pt-10">
      <h1 className="font-display text-[2.4rem] leading-tight">Voice &amp; settings</h1>

      <section className="mt-10">
        <h2 className="font-display text-[1.6rem]">Choose a voice</h2>
        <div className="mt-4 grid gap-4">
          {VOICES.map((v) => {
            const chosen = s.voice === v.id;
            return (
              <div
                key={v.id}
                className={`flex flex-wrap items-center gap-5 rounded-[2rem] border-2 px-5 py-5 sm:px-7 ${
                  chosen ? "border-kesar bg-sandal-deep" : "border-sandal-edge"
                }`}
              >
                <Diya size={52} state={sampling === v.id ? "speaking" : "idle"} />
                <div className="min-w-0 flex-1 basis-48">
                  <p className="font-display text-[1.4rem] leading-tight">{v.name}</p>
                  <p className="text-[0.95rem] text-kajal-soft">{v.description}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => playSample(v.id, v.sample)}
                    className="flex min-h-14 items-center gap-2 rounded-full border-2 border-kajal px-5 font-semibold hover:bg-kajal hover:text-sandal"
                  >
                    {sampling === v.id ? <StopIcon /> : <SpeakerIcon />}
                    {sampling === v.id ? "Stop" : "Hear sample"}
                  </button>
                  <button
                    type="button"
                    onClick={() => s.update({ voice: v.id })}
                    aria-pressed={chosen}
                    className={`flex min-h-14 items-center gap-2 rounded-full px-5 font-semibold ${
                      chosen ? "bg-tulsi text-sandal" : "bg-kesar text-kajal hover:bg-kesar-deep hover:text-sandal"
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
        <p className="mt-3 text-[0.85rem] text-kajal-soft">
          Preview voices use your device&apos;s built-in speech. The finished app will use studio-quality voices.
        </p>
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

      <Link
        href="/sources"
        className="mt-10 flex min-h-16 items-center justify-between rounded-2xl border-2 border-sandal-edge px-5 py-3 font-semibold hover:border-kajal"
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
}: {
  title: string;
  options: { id: string; label: string; note?: string; className?: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <fieldset className="mt-12">
      <legend className="font-display text-[1.6rem]">{title}</legend>
      <div className={`mt-4 grid gap-3 ${options.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
        {options.map((o) => {
          const on = value === o.id;
          return (
            <label
              key={o.id}
              className={`flex min-h-16 cursor-pointer flex-col justify-center rounded-2xl border-2 px-5 py-3 has-focus-visible:outline-4 has-focus-visible:outline-offset-2 has-focus-visible:outline-kesar-deep ${
                on ? "border-kesar bg-sandal-deep" : "border-sandal-edge hover:border-kajal"
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
              <span className={`flex items-center gap-2 font-semibold ${o.className ?? "text-[1.05rem]"}`}>
                {on && <CheckIcon className="size-6 text-tulsi" />}
                {o.label}
              </span>
              {o.note && <span className="text-[0.9rem] text-kajal-soft">{o.note}</span>}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
