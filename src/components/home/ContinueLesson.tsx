"use client";

import Link from "next/link";
import { PATHS, lessonHref } from "@/lib/lessons";
import { useProgress } from "@/lib/progress";
import { useIsClient } from "@/lib/store";

const greeting = (hour: number) => (hour < 5 ? "Good night" : hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening");

// For people who have started a path: a greeting and the next lesson waiting for them
export function ContinueLesson() {
  const isClient = useIsClient();
  const { progress } = useProgress();
  if (!isClient) return null;

  const next = PATHS.flatMap((path) => {
    const done = progress[path.slug] ?? [];
    if (!done.length) return [];
    const index = path.lessons.findIndex((_, i) => !done.includes(i));
    return index === -1 ? [] : [{ path, index }];
  })[0];
  if (!next) return null;

  return (
    <section className="mt-8">
      <p className="font-display text-[1.2rem]">{greeting(new Date().getHours())}.</p>
      <Link
        href={lessonHref(next.path.slug, next.index)}
        className="tile mt-3 flex min-h-20 items-center justify-between gap-4 rounded-2xl bg-sandal-deep border border-kesar/40 px-6 py-4 text-kajal"
      >
        <span>
          <span className="block text-[0.85rem] font-semibold text-kajal-soft">
            Continue · {next.path.title} · Lesson {next.index + 1}
          </span>
          <span className="block font-display text-[1.1rem] leading-snug">{next.path.lessons[next.index].title}</span>
        </span>
        <span aria-hidden="true" className="text-[1.6rem]">
          →
        </span>
      </Link>
    </section>
  );
}
