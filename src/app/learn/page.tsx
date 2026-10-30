"use client";

import Link from "next/link";
import { PATHS } from "@/lib/lessons";
import { TEXTS } from "@/lib/scripture/texts";
import { useProgress } from "@/lib/progress";
import { ProgressRing } from "@/components/ProgressRing";
import { VerseFinder } from "@/components/VerseFinder";

const TOTAL_LESSONS = PATHS.reduce((n, p) => n + p.totalLessons, 0);

export default function LearnPage() {
  const { progress } = useProgress();

  return (
    <div className="pt-8">
      <div className="flex items-baseline justify-between gap-4">
        <h1 className="text-[1.75rem] font-medium leading-tight tracking-tight">Five minutes a day.</h1>
        <span className="shrink-0 font-mono text-[0.75rem] text-kajal-soft">{TOTAL_LESSONS} lessons</span>
      </div>
      <p className="mt-2 max-w-[44ch] text-[0.95rem] text-kajal-soft">
        Short lessons in plain words. Each one you finish adds a bead to your mala, a string of prayer beads.
      </p>

      <ul className="mt-6 flex flex-col gap-2.5">
        {PATHS.map((p) => {
          const done = progress[p.slug] ?? [];
          const next = p.lessons.findIndex((_, i) => !done.includes(i));
          const finished = done.length >= p.totalLessons;
          const part = Math.min(1, done.length / p.totalLessons);
          return (
            <li key={p.slug}>
              <Link
                href={`/learn/${p.slug}`}
                className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 rounded-2xl border border-sandal-edge bg-sandal-deep p-4 transition-colors hover:border-kesar/60"
              >
                <span className="min-w-0">
                  <span className="block text-[1.05rem] font-medium leading-snug tracking-tight">{p.title}</span>
                  <span className="mt-0.5 block text-[0.8rem] text-kajal-soft">
                    {finished
                      ? "Finished · read again anytime"
                      : done.length > 0 && next >= 0
                        ? `Next · Lesson ${next + 1}: ${p.lessons[next].title}`
                        : p.forWhom}
                  </span>
                </span>
                <span className="row-span-2">
                  <ProgressRing done={done.length} total={p.totalLessons} />
                </span>
                {done.length > 0 && (
                  <span className="mt-2 h-[3px] overflow-hidden rounded-full bg-sandal-edge">
                    <span
                      className="block h-full rounded-full bg-kesar shadow-[0_0_8px_var(--glow)]"
                      style={{ width: `${part * 100}%` }}
                    />
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>

      <section id="read" aria-labelledby="read-title" className="mt-12 scroll-mt-6">
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="read-title" className="text-[1.2rem] font-medium tracking-tight">
            Read the scriptures
          </h2>
          <span className="font-mono text-[0.75rem] text-kajal-soft">{TEXTS.length} texts</span>
        </div>
        <ul className="mt-3 overflow-hidden rounded-2xl border border-sandal-edge bg-sandal-deep">
          {TEXTS.map((t) => (
            <li key={t.id} className="border-b border-sandal-edge last:border-b-0">
              <Link
                href={`/read/${t.id}`}
                className="group flex items-center justify-between gap-4 px-4 py-3.5 hover:bg-night-soft"
              >
                <span className="min-w-0">
                  <span className="block text-[1rem] font-medium leading-snug">{t.title}</span>
                  <span className="mt-0.5 block text-[0.8rem] leading-snug text-kajal-soft">{t.description}</span>
                </span>
                <span aria-hidden="true" className="text-kesar-deep transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-6">
          <VerseFinder />
        </div>
      </section>
    </div>
  );
}
