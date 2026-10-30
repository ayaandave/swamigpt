"use client";

import Link from "next/link";
import { useState } from "react";
import { getMeditation } from "@/lib/meditations";
import { PlayIcon } from "./icons";

// "How do you feel right now?" Each feeling points to the session that fits it best.
const FEELINGS = [
  { label: "Stressed", slug: "three-minute-reset" },
  { label: "Can't sleep", slug: "before-sleep" },
  { label: "Mind won't stop", slug: "so-hum" },
  { label: "Upset with someone", slug: "kindness-to-all" },
  { label: "New to this", slug: "first-breath" },
] as const;

export function FeelingPicker() {
  const [picked, setPicked] = useState<number | null>(null);
  const m = getMeditation(FEELINGS[picked ?? 0].slug)!;

  return (
    <section aria-labelledby="feel-title" className="glow-card relative mt-6 overflow-hidden rounded-3xl p-5">
      <div className="flex items-center gap-4">
        <div className="relative size-[4.5rem] shrink-0" aria-hidden="true">
          <div className="orb-halo opacity-80" />
          <div className="orb orb-glow size-full" />
        </div>
        <h2 id="feel-title" className="text-[1.25rem] font-medium leading-tight tracking-tight">
          How do you feel right now?
        </h2>
      </div>

      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Pick a feeling">
        {FEELINGS.map((f, i) => (
          <button
            key={f.slug}
            type="button"
            aria-pressed={picked === i}
            onClick={() => setPicked(i)}
            className={`min-h-10 rounded-full border px-4 text-[0.85rem] font-medium transition-colors ${
              picked === i
                ? "border-kesar bg-kesar text-black"
                : "border-sandal-edge bg-sandal text-kajal hover:border-kesar/60"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <Link
        href={`/meditate/${m.slug}`}
        className="mt-5 flex items-center gap-3 rounded-2xl border border-sandal-edge bg-sandal p-3 pr-4 hover:border-kesar/60"
      >
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-kesar text-black">
          <PlayIcon className="size-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-mono text-[0.7rem] text-kesar-deep">
            {picked === null ? "Quick start" : "Try this"} · {m.minutes} min
          </span>
          <span className="block text-[1rem] font-medium leading-snug">{m.title}</span>
        </span>
      </Link>
    </section>
  );
}
