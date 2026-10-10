"use client";

import { getDaily } from "@/lib/mock/content";
import { useIsClient } from "@/lib/store";
import { VerseCard } from "@/components/VerseCard";
import { whoSays } from "@/lib/scripture/who";
import { ListenButton } from "@/components/ListenButton";

export default function TodayPage() {
  // The verse depends on the reader's local date, so it renders in the browser only
  const isClient = useIsClient();
  if (!isClient) return <div className="min-h-[60vh]" />;
  const daily = getDaily();

  const dateLabel = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="pt-10">
      <p className="text-[1rem] font-semibold text-kesar-deep">{dateLabel}</p>
      <h1 className="mt-1 font-display text-[2.4rem] leading-tight">Today&apos;s verse</h1>

      <div className="mt-8">
        <VerseCard verse={daily.verse} />
      </div>

      <p className="mt-8 max-w-[58ch] font-display text-[1.35rem] leading-relaxed">{daily.reflection}</p>

      <div className="mt-6">
        <ListenButton
          save
          text={`${whoSays(daily.verse)}: ${daily.verse.translation} ${daily.reflection} ${daily.question}`}
        />
      </div>

      <aside className="mt-10 rounded-[2rem] bg-tulsi px-7 py-6 text-sandal">
        <p className="text-[0.9rem] font-semibold text-sandal/80">A question for your day</p>
        <p className="mt-1 font-display text-[1.35rem] leading-snug">{daily.question}</p>
      </aside>
    </div>
  );
}
