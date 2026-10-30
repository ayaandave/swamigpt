"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { lessonHref, type LearningPath } from "@/lib/lessons";
import { useProgress } from "@/lib/progress";
import { useIsClient } from "@/lib/store";
import { MalaRing } from "./MalaRing";
import { BackIcon, CheckIcon } from "./icons";

// A path's lessons as a timeline: beads on a string, done ones filled, the next one glowing.
export function PathTimeline({ path }: { path: LearningPath }) {
  const router = useRouter();
  const { progress } = useProgress();
  const isClient = useIsClient();
  const done = progress[path.slug] ?? [];
  const next = path.lessons.findIndex((_, i) => !done.includes(i));
  const finished = next === -1;
  // Progress lives in this browser, so "up next" is only known after the page loads there
  const upNext = isClient && !finished ? next : -1;

  return (
    <div className="pt-8">
      <Link
        href="/learn"
        className="inline-flex min-h-12 items-center gap-1 rounded-full border border-sandal-edge pl-2 pr-5 text-[0.95rem] font-semibold hover:border-kajal"
      >
        <BackIcon className="size-6" />
        All paths
      </Link>

      <header className="mt-6 flex flex-col items-center text-center">
        <p className="text-[0.9rem] font-semibold text-tulsi">{path.forWhom}</p>
        <h1 className="mt-1 font-display text-[1.75rem] leading-tight">{path.title}</h1>
        <p className="mt-2 max-w-[40ch] text-[1.05rem] text-kajal-soft">{path.description}</p>
        <div className="mt-4">
          <MalaRing
            total={path.lessons.length}
            done={done}
            size={190}
            interactive
            onBead={(i) => router.push(lessonHref(path.slug, i))}
          />
        </div>
        <p className="text-[0.85rem] text-kajal-soft">Spin the mala, or tap a bead to open its lesson</p>
        {isClient && (
          <Link
            href={lessonHref(path.slug, finished ? 0 : next)}
            className="mt-5 flex min-h-14 items-center rounded-xl bg-kesar px-8 text-[1.05rem] font-bold text-on-kesar hover:bg-kesar-deep hover:text-sandal"
          >
            {finished ? "Read it again from the start" : done.length === 0 ? "Start lesson 1" : `Continue: lesson ${next + 1}`}
          </Link>
        )}
      </header>

      <ol className="relative mt-10">
        {path.lessons.map((lesson, i) => {
          const isDone = isClient && done.includes(i);
          const isNext = i === upNext;
          const last = i === path.lessons.length - 1;
          return (
            <li key={i} className="relative flex gap-4 pb-3">
              {/* the string, running down to the next bead */}
              {!last && (
                <span
                  aria-hidden="true"
                  className={`absolute top-10 bottom-0 left-[1.2rem] w-0.5 -translate-x-1/2 ${
                    isDone ? "bg-kesar" : "bg-sandal-edge"
                  }`}
                />
              )}
              <span
                aria-hidden="true"
                className={`relative z-10 mt-3 flex size-10 shrink-0 items-center justify-center rounded-full font-display text-[1rem] ${
                  isDone
                    ? "bg-[radial-gradient(circle_at_35%_30%,#f6dc95,#c8961f_45%,#5a4310)] text-black"
                    : isNext
                      ? "bg-kesar text-on-kesar shadow-[0_0_0_6px_var(--glow)]"
                      : "border border-sandal-edge bg-sandal-deep text-kajal-soft"
                }`}
              >
                {isDone ? <CheckIcon className="size-5" /> : i + 1}
              </span>
              <Link
                href={lessonHref(path.slug, i)}
                aria-current={isNext ? "step" : undefined}
                className={`flex min-h-16 flex-1 flex-col justify-center rounded-2xl border px-5 py-3 hover:border-kesar ${
                  isNext ? "border-kesar bg-sandal-deep" : "border-transparent hover:bg-sandal-deep/60"
                }`}
              >
                <span className="text-[0.8rem] font-semibold text-kajal-soft">
                  Lesson {i + 1}
                  {isDone && " · done"}
                  {isNext && " · up next"}
                </span>
                <span className="font-display text-[1.1rem] leading-snug">{lesson.title}</span>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
