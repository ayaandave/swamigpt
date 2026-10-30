"use client";

import { usePractice } from "@/lib/practice";
import { Om } from "./Om";
import { useIsClient } from "@/lib/store";

// "3 days in a row", with the last week as small dots. Only shown once there's practice to show,
// and never a warning about missing a day: a new streak just starts.
export function PracticeStreak({ className = "" }: { className?: string }) {
  const isClient = useIsClient();
  const { total, streak, week, practisedToday } = usePractice();
  if (!isClient || !total) return null;

  const line =
    streak > 1
      ? `${streak} days in a row`
      : practisedToday
        ? "You practised today"
        : `${total} ${total === 1 ? "day" : "days"} of practice so far`;

  return (
    <section aria-label="Your practice" className={`rounded-2xl bg-sandal-deep px-5 py-4 ${className}`}>
      <p className="flex items-center gap-2 font-display text-[1.1rem] leading-tight">
        <Om size={26} />
        {line}
      </p>
      <ol className="mt-3 flex gap-2" aria-label="The last seven days">
        {week.map((d, i) => (
          <li key={i} className="flex flex-col items-center gap-1">
            <span
              className={`size-5 rounded-full ${d.done ? "bg-kesar" : "border border-sandal-edge"} ${d.today ? "ring-2 ring-kajal/40 ring-offset-2 ring-offset-sandal-deep" : ""}`}
              aria-label={d.done ? "practised" : "not yet"}
            />
            <span className="text-[0.75rem] text-kajal-soft">{d.label}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
