"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { PATHS, lessonHref, type LearningPath } from "@/lib/lessons";
import { TEXTS } from "@/lib/scripture/texts";
import { useProgress } from "@/lib/progress";
import { Om } from "@/components/Om";
import { VerseFinder } from "@/components/VerseFinder";
import { BowIcon, CheckIcon, KarmaIcon, LampIcon, LearnIcon, MeditateIcon, PlayIcon } from "@/components/icons";

const TOTAL_LESSONS = PATHS.reduce((n, p) => n + p.totalLessons, 0);

const ICONS: Record<string, (p: { className?: string }) => React.ReactNode> = {
  "gita-18-days": LearnIcon,
  "what-is-karma": KarmaIcon,
  "yoga-philosophy": MeditateIcon,
  "ramayana-stories": BowIcon,
  "stories-of-the-gods": LampIcon,
};

// The Gita goes one chapter a day; the other courses are lessons or stories
const unit = (p: LearningPath) =>
  p.slug === "gita-18-days" ? "Day" : p.slug.includes("stories") ? "Story" : "Lesson";

export default function LearnPage() {
  const { progress } = useProgress();
  const doneIn = (p: LearningPath) => progress[p.slug] ?? [];
  const nextIn = (p: LearningPath) => p.lessons.findIndex((_, i) => !doneIn(p).includes(i));
  const beads = PATHS.reduce((n, p) => n + Math.min(doneIn(p).length, p.totalLessons), 0);

  // Today's lesson: carry on with a course already started, otherwise begin the Gita
  const started = PATHS.find((p) => doneIn(p).length > 0 && nextIn(p) >= 0);
  const fresh = PATHS.find((p) => nextIn(p) >= 0);
  const todayPath = started ?? fresh ?? PATHS[0];
  const todayIndex = Math.max(0, nextIn(todayPath));
  const today = todayPath.lessons[todayIndex];

  return (
    <div className="pt-8">
      <div className="flex items-baseline justify-between gap-4">
        <h1 className="text-[1.75rem] font-medium leading-tight tracking-tight">Five minutes a day.</h1>
        <span className="shrink-0 font-mono text-[0.75rem] text-kajal-soft">{TOTAL_LESSONS} lessons</span>
      </div>
      <p className="mt-2 max-w-[44ch] text-[0.95rem] text-kajal-soft">
        Short lessons in plain words. Each one you finish adds a bead to your mala, a string of prayer beads.
      </p>

      <Link
        href={lessonHref(todayPath.slug, todayIndex)}
        className="glow-card mt-6 flex items-center justify-between gap-4 rounded-3xl p-5 transition-transform active:scale-[.98]"
      >
        <span className="min-w-0">
          <span className="block font-mono text-[0.72rem] text-kesar-deep">
            {started ? "Keep going" : "Today's lesson"} · 5 min
          </span>
          <span className="mt-1.5 block text-[1.3rem] font-medium leading-tight tracking-tight">{today.title}</span>
          <span className="mt-1 block text-[0.8rem] text-kajal-soft">
            {todayPath.title} · {unit(todayPath)} {todayIndex + 1}
          </span>
          <span className="mt-4 inline-flex min-h-10 items-center gap-1.5 rounded-full bg-kesar px-5 text-[0.9rem] font-medium text-black">
            <PlayIcon className="size-4" />
            Start
          </span>
        </span>
        <span className="shrink-0" aria-hidden="true">
          <Om size={84} />
        </span>
      </Link>

      <Mala done={beads} />

      {PATHS.map((p) => (
        <CourseRow key={p.slug} path={p} done={doneIn(p)} next={nextIn(p)} />
      ))}

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

// A short string of beads: the ones you've earned glow gold
function Mala({ done }: { done: number }) {
  const shown = Math.min(TOTAL_LESSONS, Math.max(12, done + 6));
  return (
    <div className="mt-5 flex items-center gap-3" aria-label={`${done} of ${TOTAL_LESSONS} beads on your mala`}>
      <span className="shrink-0 font-mono text-[0.72rem] text-kajal-soft">Your mala</span>
      <span className="flex min-w-0 flex-1 gap-[3px] overflow-hidden" aria-hidden="true">
        {Array.from({ length: shown }, (_, i) => (
          <span
            key={i}
            className={`size-2.5 shrink-0 rounded-full ${
              i < done ? "bg-kesar shadow-[0_0_6px_var(--glow)]" : "border border-sandal-edge"
            }`}
          />
        ))}
      </span>
      <span className="shrink-0 font-mono text-[0.72rem] text-kesar-deep">
        {done} {done === 1 ? "bead" : "beads"}
      </span>
    </div>
  );
}

// One course: a heading, then its lessons as a row of square tiles you can swipe through.
// The row starts at your next lesson, so it's always in view.
function CourseRow({ path, done, next }: { path: LearningPath; done: number[]; next: number }) {
  const row = useRef<HTMLUListElement>(null);
  const Icon = ICONS[path.slug] ?? LearnIcon;
  const finished = done.length >= path.totalLessons;

  useEffect(() => {
    const ul = row.current;
    const tile = ul?.children[Math.max(0, next - 1)] as HTMLElement | undefined;
    if (ul && tile && next > 1) ul.scrollLeft = tile.offsetLeft - ul.offsetLeft - 16;
  }, [next]);

  return (
    <section aria-labelledby={`course-${path.slug}`} className="mt-9">
      <div className="flex items-baseline justify-between gap-4">
        <h2 id={`course-${path.slug}`} className="text-[1.1rem] font-medium tracking-tight">
          <Link href={`/learn/${path.slug}`} className="hover:text-kesar-deep">
            {path.title}
          </Link>
        </h2>
        <span className="shrink-0 font-mono text-[0.72rem] text-kajal-soft">
          {finished ? "Finished" : `${done.length} / ${path.totalLessons}`}
        </span>
      </div>
      <p className="text-[0.8rem] text-kajal-soft">{path.description}</p>
      {done.length > 0 && (
        <span className="mt-2 block h-[3px] overflow-hidden rounded-full bg-sandal-edge">
          <span
            className="block h-full rounded-full bg-kesar shadow-[0_0_8px_var(--glow)]"
            style={{ width: `${Math.min(1, done.length / path.totalLessons) * 100}%` }}
          />
        </span>
      )}

      <ul ref={row} className="tile-row scrollbar-none -mx-4 mt-3 flex gap-2.5 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6">
        {path.lessons.map((l, i) => {
          const isDone = done.includes(i);
          const isNext = i === next;
          return (
            <li key={i} className="w-[7.4rem] shrink-0">
              <Link
                href={lessonHref(path.slug, i)}
                aria-label={`${unit(path)} ${i + 1}: ${l.title}${isDone ? ", done" : isNext ? ", next" : ""}`}
                className={`gold-tile flex aspect-square flex-col justify-between rounded-2xl p-3 ${isNext ? "is-next" : ""} ${isDone ? "opacity-60" : ""}`}
              >
                <span
                  className={`flex size-8 items-center justify-center rounded-[10px] ${isNext ? "bg-kesar text-black" : "gold-chip"}`}
                >
                  {isDone ? (
                    <CheckIcon className="size-4" />
                  ) : isNext ? (
                    <PlayIcon className="size-4" />
                  ) : (
                    <Icon className="size-[1.1rem]" />
                  )}
                </span>
                <span className="min-w-0">
                  <span className={`block font-mono text-[0.65rem] ${isNext ? "text-kesar-deep" : "text-kajal-soft"}`}>
                    {unit(path)} {i + 1}
                    {isNext && done.length > 0 ? " · Next" : ""}
                  </span>
                  <span className="mt-0.5 line-clamp-3 text-[0.82rem] font-medium leading-snug">{l.title}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
