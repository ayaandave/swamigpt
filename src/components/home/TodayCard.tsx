"use client";

import Link from "next/link";
import { useState } from "react";
import type { Daily } from "@/lib/daily";
import { dailyIndex } from "@/lib/daily-verses";
import { caption, whoSays } from "@/lib/scripture/who";
import { useIsClient } from "@/lib/store";
import { SaveVerseButton } from "../SaveVerseButton";

const action =
  "inline-flex min-h-11 items-center rounded-full border border-sandal-edge px-4 text-[0.95rem] font-semibold hover:border-kajal";

// Today's verse, the anchor of the home screen: the verse, its plain meaning, and save / share /
// reflect. The full page has the Sanskrit, the reflection and the question for the day.
export function TodayCard({ entries }: { entries: Daily[] }) {
  // The verse depends on the reader's local date, so it renders in the browser only
  const isClient = useIsClient();
  const [shared, setShared] = useState(false);
  if (!isClient) return <div className="mt-10 h-56" />;
  const { verse } = entries[dailyIndex()];
  const reflect = `/ask?ask=${encodeURIComponent(`What does this passage from ${caption(verse)} mean for my life?`)}&about=${encodeURIComponent(verse.id)}`;

  const share = async () => {
    const url = `${location.origin}/v/${encodeURIComponent(verse.id)}`;
    const text = `${whoSays(verse)}: "${verse.translation}"`;
    try {
      if (navigator.share) await navigator.share({ text, url });
      else {
        await navigator.clipboard.writeText(`${text}\n${url}`);
        setShared(true);
      }
    } catch {
      // Cancelled or blocked: nothing to do
    }
  };

  return (
    <section aria-label="Today's verse" className="mt-10 rounded-2xl bg-night px-6 py-6 text-kajal sm:px-7">
      <Link href="/today" className="block">
        <span className="text-[0.85rem] font-semibold uppercase tracking-[0.12em] text-flame">Today&apos;s verse</span>
        <span className="mt-2 block text-[0.95rem] text-kajal-soft">{whoSays(verse)}:</span>
        <span className="mt-1 line-clamp-4 block font-display text-[1.15rem] leading-snug">{verse.translation}</span>
        {verse.plain && <span className="mt-2 line-clamp-2 block text-[0.95rem] text-kajal-soft">{verse.plain}</span>}
        <span className="mt-2 block font-mono text-[0.75rem] text-kesar-deep">{caption(verse)} · read more →</span>
      </Link>
      <div className="mt-4 flex flex-wrap gap-2">
        <SaveVerseButton verse={verse} />
        <button type="button" onClick={() => void share()} className={action}>
          {shared ? "Link copied" : "Share"}
        </button>
        <Link href={reflect} className={action}>
          Reflect
        </Link>
      </div>
    </section>
  );
}
