"use client";

import Link from "next/link";
import { useSettings } from "@/lib/settings";
import { useIsClient } from "@/lib/store";
import { todaysMeditation } from "@/lib/suggestions";
import { MeditateIcon } from "../icons";

export type MeditationSummary = { slug: string; title: string; minutes: number; description: string };

// One meditation picked for today, one tap to start
export function TodayMeditation({ meditations }: { meditations: MeditationSummary[] }) {
  const isClient = useIsClient();
  const { focus, dailyMinutes } = useSettings();
  if (!isClient) return <div className="mt-4 h-24" />;
  const slug = todaysMeditation(focus, dailyMinutes);
  const m = meditations.find((x) => x.slug === slug) ?? meditations[0];
  if (!m) return null;
  return (
    <Link
      href={`/meditate/${m.slug}`}
      className="tile mt-4 flex items-center gap-4 rounded-2xl border border-sandal-edge bg-sandal-deep px-5 py-4 text-kajal hover:border-kesar/50"
    >
      <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-kesar text-on-kesar" aria-hidden="true">
        ▶
      </span>
      <span className="min-w-0">
        <span className="block text-[0.8rem] font-semibold uppercase tracking-[0.12em] text-kesar-deep">
          Today&apos;s meditation · {m.minutes} min
        </span>
        <span className="mt-0.5 block font-display text-[1.1rem] leading-tight">{m.title}</span>
        <span className="mt-0.5 text-[0.9rem] leading-snug text-kajal-soft line-clamp-2">{m.description}</span>
      </span>
      <MeditateIcon className="ml-auto hidden size-7 shrink-0 text-kesar-deep sm:block" />
    </Link>
  );
}
