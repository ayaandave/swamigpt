"use client";

import Link from "next/link";
import type { Daily } from "@/lib/daily";
import { dailyIndex } from "@/lib/daily-verses";
import { useIsClient } from "@/lib/store";
import { caption, whoSays } from "@/lib/scripture/who";
import { VerseCard } from "./VerseCard";
import { ListenButton } from "./ListenButton";

const pill =
  "inline-flex min-h-14 items-center rounded-full border-2 border-kajal px-6 text-[1rem] font-semibold hover:bg-sandal-deep";

// Today's verse: the passage, a reflection, read aloud, a question for the day and a practice
export function TodayView({ entries }: { entries: Daily[] }) {
  // The verse depends on the reader's local date, so it renders in the browser only
  const isClient = useIsClient();
  if (!isClient) return <div className="min-h-[60vh]" />;
  const daily = entries[dailyIndex()];
  const { verse } = daily;
  const question = `What does this passage from ${caption(verse)} mean for my life?`;
  const dateLabel = new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="pt-10">
      <p className="text-[1rem] font-semibold text-kesar-deep">{dateLabel}</p>
      <h1 className="mt-1 font-display text-[2.4rem] leading-tight">Today&apos;s verse</h1>

      <p className="mt-6 font-display text-[1.15rem] text-kajal-soft">{whoSays(verse)}:</p>
      <div className="mt-3">
        <VerseCard verse={verse} />
      </div>

      <p className="mt-8 max-w-[58ch] font-display text-[1.35rem] leading-relaxed">{daily.reflection}</p>

      <div className="mt-6 flex flex-wrap gap-3">
        <ListenButton
          save
          text={[`${whoSays(verse)}:`, verse.translation, verse.plain && `In plain words: ${verse.plain}`, daily.reflection, daily.question]
            .filter(Boolean)
            .join(" ")}
        />
        <Link href={`/ask?ask=${encodeURIComponent(question)}&about=${encodeURIComponent(verse.id)}`} className={pill}>
          Ask the Swami about this
        </Link>
      </div>

      <aside className="mt-10 rounded-[2rem] bg-tulsi px-7 py-6 text-sandal">
        <p className="text-[0.9rem] font-semibold text-sandal/80">A question for your day</p>
        <p className="mt-1 font-display text-[1.35rem] leading-snug">{daily.question}</p>
      </aside>

      <Link
        href={daily.practice.href}
        className="mt-4 flex min-h-16 flex-col justify-center rounded-[2rem] border-2 border-sandal-edge px-7 py-4 hover:border-kesar hover:bg-sandal-deep"
      >
        <span className="text-[0.85rem] font-semibold text-kesar-deep">Try this today · {daily.practice.kind}</span>
        <span className="font-display text-[1.3rem]">{daily.practice.title}</span>
      </Link>

      <p className="mt-6">
        <Link href={daily.href} className="inline-flex min-h-11 items-center font-semibold text-kesar-deep hover:underline">
          Read it in the library →
        </Link>
      </p>
    </div>
  );
}
