"use client";

import { useEffect, useRef } from "react";
import { MalaRing } from "./MalaRing";

type Props = {
  total: number;
  done: number[];
  fresh: number;
  onNext?: () => void;
  onClose: () => void;
};

// Petals fall at spread-out but fixed spots, so every render draws the same shower
const PETALS = Array.from({ length: 22 }, (_, i) => ({
  left: (i * 37) % 100,
  delay: ((i * 13) % 20) / 10,
  duration: 3.5 + ((i * 7) % 10) / 5,
  size: 10 + ((i * 5) % 9),
  color: i % 3 === 0 ? "#ffb347" : i % 3 === 1 ? "#d9741a" : "#f2c14e",
}));

// Shown the moment a lesson is marked done: the new bead drops onto the mala.
export function MalaCelebration({ total, done, fresh, onNext, onClose }: Props) {
  const complete = done.length >= total;
  const primary = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    primary.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="bead-title"
      className="fixed inset-0 z-40 flex items-center justify-center overflow-hidden bg-kajal/40 px-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {complete &&
        PETALS.map((p, i) => (
          <span
            key={i}
            aria-hidden="true"
            className="petal pointer-events-none absolute top-0 rounded-[60%_10%]"
            style={
              {
                left: `${p.left}%`,
                width: p.size,
                height: p.size * 1.4,
                background: p.color,
                "--delay": `${0.9 + p.delay}s`,
                "--t": `${p.duration}s`,
              } as React.CSSProperties
            }
          />
        ))}

      <div className="arrive relative flex w-full max-w-sm flex-col items-center rounded-2xl bg-sandal px-6 pt-6 pb-7 text-center shadow-2xl">
        <MalaRing total={total} done={done} fresh={fresh} celebrate={complete} size={250} />
        <h2 id="bead-title" className="mt-1 font-display text-[1.5rem] leading-tight">
          {complete ? "Your mala is complete" : "A new bead for your mala"}
        </h2>
        <p className="mt-2 text-[1.05rem] text-kajal-soft">
          {complete
            ? `All ${total} lessons done. Well walked.`
            : `Lesson ${fresh + 1} done. ${total - done.length} ${total - done.length === 1 ? "bead" : "beads"} to go.`}
        </p>
        <div className="mt-6 flex w-full flex-col gap-3">
          {onNext && !complete && (
            <button
              ref={primary}
              type="button"
              onClick={onNext}
              className="min-h-14 rounded-xl bg-kesar px-7 text-[1.05rem] font-bold text-on-kesar hover:bg-kesar-deep hover:text-sandal"
            >
              Next lesson
            </button>
          )}
          <button
            ref={onNext && !complete ? undefined : primary}
            type="button"
            onClick={onClose}
            className="min-h-14 rounded-xl border border-kajal px-7 text-[1.05rem] font-semibold hover:bg-kajal hover:text-sandal"
          >
            {complete ? "Close" : "Stay here"}
          </button>
        </div>
      </div>
    </div>
  );
}
