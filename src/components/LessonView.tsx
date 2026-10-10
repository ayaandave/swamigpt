"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { lessonHref, type LearningPath } from "@/lib/lessons";
import type { Verse } from "@/lib/scripture/types";
import { useProgress } from "@/lib/progress";
import { MalaCelebration } from "./MalaCelebration";
import { playChime } from "@/lib/sounds";
import { VerseCard } from "./VerseCard";
import { ListenButton } from "./ListenButton";
import { LessonAsk } from "./LessonAsk";
import { BackIcon, CheckIcon } from "./icons";

// One lesson of a path. The path's timeline (PathTimeline) is one tap back.
export function LessonView({ path, index, verse }: { path: LearningPath; index: number; verse?: Verse }) {
  const router = useRouter();
  const { progress, markDone } = useProgress();
  const done = progress[path.slug] ?? [];
  const [celebrating, setCelebrating] = useState(false);

  const lesson = path.lessons[index];
  const isDone = done.includes(index);
  const hasNext = index + 1 < path.lessons.length;
  const spoken = [lesson.title, ...lesson.body, verse ? `${verse.source}. ${verse.translation}` : "", lesson.reflect].join(" ");

  const finish = () => {
    markDone(path.slug, index);
    setCelebrating(true);
    playChime(0.8); // rings as the bead lands on the string
  };

  return (
    <div className="pt-8">
      <Link
        href={`/learn/${path.slug}`}
        className="inline-flex min-h-12 items-center gap-1 rounded-full border-2 border-sandal-edge pl-2 pr-5 text-[0.95rem] font-semibold hover:border-kajal"
      >
        <BackIcon className="size-6" />
        All lessons
      </Link>

      <article className="mt-6">
        <p className="text-[0.95rem] font-semibold text-kesar-deep">
          {path.title} · Lesson {index + 1} of {path.lessons.length}
        </p>
        <h1 className="mt-1 font-display text-[2.2rem] leading-tight">{lesson.title}</h1>

        <div className="mt-5">
          <ListenButton text={spoken} save />
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

        <LessonAsk
          key={index}
          lesson={{
            title: lesson.title,
            text: [...lesson.body, verse ? `Verse: ${verse.source}: ${verse.translation}` : "", `Reflect: ${lesson.reflect}`]
              .filter(Boolean)
              .join("\n\n"),
          }}
        />

        <div className="mt-8">
          {isDone ? (
            <p className="flex min-h-14 items-center gap-2 font-semibold text-tulsi">
              <CheckIcon /> Lesson done
            </p>
          ) : (
            <button
              type="button"
              onClick={finish}
              className="flex min-h-14 items-center gap-2 rounded-full bg-kesar px-7 text-[1.05rem] font-bold text-kajal hover:bg-kesar-deep hover:text-sandal"
            >
              <CheckIcon /> Mark lesson done
            </button>
          )}
        </div>

        <nav aria-label="Lessons" className="mt-8 grid grid-cols-2 gap-3">
          {index > 0 ? (
            <Link
              href={lessonHref(path.slug, index - 1)}
              className="flex min-h-16 flex-col justify-center rounded-2xl border-2 border-sandal-edge px-5 py-3 hover:border-kesar"
            >
              <span className="text-[0.85rem] text-kajal-soft">← Previous</span>
              <span className="line-clamp-2 font-display text-[1.05rem] leading-snug">{path.lessons[index - 1].title}</span>
            </Link>
          ) : (
            <span />
          )}
          {hasNext && (
            <Link
              href={lessonHref(path.slug, index + 1)}
              className="flex min-h-16 flex-col items-end justify-center rounded-2xl border-2 border-sandal-edge px-5 py-3 text-right hover:border-kesar"
            >
              <span className="text-[0.85rem] text-kajal-soft">Next →</span>
              <span className="line-clamp-2 font-display text-[1.05rem] leading-snug">{path.lessons[index + 1].title}</span>
            </Link>
          )}
        </nav>
      </article>

      {celebrating && (
        <MalaCelebration
          total={path.lessons.length}
          done={done}
          fresh={index}
          onNext={
            hasNext
              ? () => {
                  setCelebrating(false);
                  router.push(lessonHref(path.slug, index + 1));
                }
              : undefined
          }
          onClose={() => setCelebrating(false)}
        />
      )}
    </div>
  );
}
