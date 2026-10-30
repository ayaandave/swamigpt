"use client";

import { useMeditationLog } from "@/lib/meditation-log";
import { usePractice } from "@/lib/practice";
import { useProgress } from "@/lib/progress";

// The account page's "your journey": a few honest numbers, no badges or pressure
export function Journey() {
  const { total, streak, longest } = usePractice();
  const { sessions, minutes } = useMeditationLog();
  const { progress } = useProgress();
  const lessons = Object.values(progress).reduce((n, done) => n + done.length, 0);
  const stats: [string, string][] = [
    ["Days of practice", String(total)],
    ["Days in a row now", String(streak)],
    ["Longest run", `${longest} ${longest === 1 ? "day" : "days"}`],
    ["Meditations", sessions ? `${sessions}, ${minutes} min` : "0"],
    ["Lessons finished", String(lessons)],
  ];
  return (
    <section aria-labelledby="journey" className="mt-8">
      <h2 id="journey" className="font-display text-[1.3rem] leading-tight">
        Your journey
      </h2>
      <dl className="mt-3 grid grid-cols-2 gap-3">
        {stats.map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-sandal-edge px-4 py-3">
            <dt className="text-[0.85rem] text-kajal-soft">{label}</dt>
            <dd className="font-display text-[1.2rem] leading-tight">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
