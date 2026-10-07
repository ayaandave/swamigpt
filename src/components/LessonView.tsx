"use client";

import Link from "next/link";
import { useState } from "react";
import type { LearningPath } from "@/lib/mock/content";
import { VERSES } from "@/lib/mock/verses";
import { useProgress } from "@/lib/progress";
import { Mala } from "./Mala";
import { VerseCard } from "./VerseCard";
import { ListenButton } from "./ListenButton";
import { BackIcon, CheckIcon } from "./icons";

export function LessonView({ path }: { path: LearningPath }) {
  const { progress, markDone } = useProgress();
  const done = progress[path.slug] ?? [];
  const firstOpen = path.lessons.findIndex((_, i) => !done.includes(i));
  // Opens at the first unfinished lesson until the reader picks one
  const [chosen, setIndex] = useState<number | null>(null);
  const index = chosen ?? Math.max(firstOpen, 0);

  const lesson = path.lessons[index];
  const verse = lesson.verseId ? VERSES[lesson.verseId] : undefined;
  const isDone = done.includes(index);
  const hasNext = index + 1 < path.lessons.length;
  const spoken = [lesson.title, ...lesson.body, verse ? `${verse.source}. ${verse.translation}` : "", lesson.reflect].join(" ");

  return (
    <div className="pt-8">
      <Link
        href="/learn"
        className="inline-flex min-h-12 items-center gap-1 rounded-full border-2 border-sandal-edge pl-2 pr-5 text-[0.95rem] font-semibold hover:border-kajal"
      >
        <BackIcon className="size-6" />
        All paths
      </Link>

      <p className="mt-6 text-[0.95rem] font-semibold text-kajal-soft">{path.title}</p>
      <div className="mt-2">
        <Mala total={path.totalLessons} done={done} />
      </div>

      <article className="mt-8">
        <p className="text-[0.95rem] font-semibold text-kesar-deep">
          Lesson {index + 1} of {path.totalLessons}
        </p>
        <h1 className="mt-1 font-display text-[2.2rem] leading-tight">{lesson.title}</h1>

        <div className="mt-5">
          <ListenButton text={spoken} />
        </div>

        <div className="mt-6 flex flex-col gap-5">
          {lesson.body.map((p, i) => (
            <p key={i} className="max-w-[62ch] text-[1.1rem] leading-[1.75]">
              {p}
            </p>
          ))}
          {verse && <VerseCard verse={verse} />}
        </div>

        <aside className="mt-8 rounded-[2rem] bg-tulsi px-7 py-6 text-sandal">
          <p className="text-[0.9rem] font-semibold text-sandal/80">Sit with this</p>
          <p className="mt-1 font-display text-[1.35rem] leading-snug">{lesson.reflect}</p>
        </aside>

        <div className="mt-8 flex flex-wrap gap-3">
          {isDone ? (
            <p className="flex min-h-14 items-center gap-2 font-semibold text-tulsi">
              <CheckIcon /> Lesson done
            </p>
          ) : (
            <button
              type="button"
              onClick={() => markDone(path.slug, index)}
              className="flex min-h-14 items-center gap-2 rounded-full bg-kesar px-7 text-[1.05rem] font-bold text-kajal hover:bg-kesar-deep hover:text-sandal"
            >
              <CheckIcon /> Mark lesson done
            </button>
          )}
          {hasNext && (
            <button
              type="button"
              onClick={() => {
                setIndex(index + 1);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="min-h-14 rounded-full border-2 border-kajal px-7 text-[1.05rem] font-semibold hover:bg-kajal hover:text-sandal"
            >
              Next lesson
            </button>
          )}
          {index > 0 && (
            <button
              type="button"
              onClick={() => setIndex(index - 1)}
              className="min-h-14 rounded-full px-5 text-[1rem] font-semibold text-kajal-soft underline underline-offset-4 hover:text-kajal"
            >
              Previous lesson
            </button>
          )}
        </div>
        {!hasNext && path.lessons.length < path.totalLessons && (
          <p className="mt-6 text-[0.95rem] text-kajal-soft">
            More lessons in this path are being written. This preview has {path.lessons.length}.
          </p>
        )}
      </article>
    </div>
  );
}
