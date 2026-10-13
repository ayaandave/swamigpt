"use client";

import { useEffect, useState } from "react";
import { COUNTS } from "@/lib/mantras";

// Say the mantra, then tap: a ring of beads fills as you go, like moving through a mala.
export function MantraCounter({ title }: { title: string }) {
  const [goal, setGoal] = useState<number>(COUNTS[0]);
  const [count, setCount] = useState(0);
  const done = count >= goal;
  const angle = Math.min(1, count / goal) * 360;

  // Counted from the latest value, so quick taps all count
  const tap = () => setCount((c) => Math.min(goal, c + 1));

  // A soft tick on phones for each count, and a double at the end
  useEffect(() => {
    if (!count) return;
    try {
      navigator.vibrate?.(count === goal ? [40, 60, 40] : 12);
    } catch {}
  }, [count, goal]);

  return (
    <section aria-label="Count your repetitions" className="mt-10 rounded-[2rem] bg-night px-6 py-8 text-center text-sandal">
      <h2 className="font-display text-[1.5rem] leading-tight">Count as you go</h2>
      <p className="mt-1 text-[0.95rem] text-sandal/75">Say {title} once, then tap. A mala has 108 beads.</p>

      <div role="radiogroup" aria-label="How many times" className="mt-5 inline-flex rounded-full bg-night-soft p-1">
        {COUNTS.map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={goal === n}
            onClick={() => {
              setGoal(n);
              setCount(0);
            }}
            className={`min-h-11 min-w-16 rounded-full px-4 text-[1rem] font-semibold ${
              goal === n ? "bg-flame text-kajal" : "text-sandal/80 hover:text-sandal"
            }`}
          >
            {n}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={tap}
        aria-label={done ? `Done: ${goal} of ${goal}` : `Count one. ${count} of ${goal} so far`}
        className="mx-auto mt-7 grid size-56 place-items-center rounded-full p-2 transition-transform active:scale-95"
        style={{ background: `conic-gradient(var(--flame) ${angle}deg, rgba(242,227,198,0.15) ${angle}deg)` }}
      >
        <span className="grid size-full place-items-center rounded-full bg-night">
          <span>
            <span className="block font-display text-[3.4rem] leading-none" aria-live="polite">
              {count}
            </span>
            <span className="mt-1 block text-[0.95rem] text-sandal/70">{done ? "Complete" : `of ${goal} · tap`}</span>
          </span>
        </span>
      </button>

      {done ? (
        <p className="mt-6 font-display text-[1.25rem] leading-snug text-flame">
          Sit quietly for a moment before you get up.
        </p>
      ) : null}
      {count > 0 && (
        <button
          type="button"
          onClick={() => setCount(0)}
          className="mt-4 min-h-11 rounded-full px-4 text-[0.95rem] font-semibold text-sandal/70 underline underline-offset-4 hover:text-sandal"
        >
          Start again
        </button>
      )}
    </section>
  );
}
