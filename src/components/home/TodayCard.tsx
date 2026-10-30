"use client";

import Link from "next/link";
import type { Daily } from "@/lib/daily";
import { dailyIndex } from "@/lib/daily-verses";
import { whoSays } from "@/lib/scripture/who";
import { useIsClient } from "@/lib/store";

// A taste of today's verse; the full page has the Sanskrit, the reflection and the question
export function TodayCard({ entries }: { entries: Daily[] }) {
  // The verse depends on the reader's local date, so it renders in the browser only
  const isClient = useIsClient();
  if (!isClient) return <div className="mt-10 h-40" />;
  const { verse } = entries[dailyIndex()];
  return (
    <Link
      href="/today"
      className="tile mt-10 block rounded-2xl bg-night px-7 py-6 text-kajal"
    >
      <span className="text-[0.85rem] font-semibold uppercase tracking-[0.12em] text-flame">Today&apos;s verse</span>
      <span className="mt-2 block text-[0.95rem] text-kajal-soft">{whoSays(verse)}:</span>
      <span className="mt-1 line-clamp-3 block font-display text-[1.15rem] leading-snug">{verse.translation}</span>
      <span className="mt-3 block text-[0.95rem] font-semibold text-flame">Read and reflect →</span>
    </Link>
  );
}
