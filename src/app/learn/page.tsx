"use client";

import Link from "next/link";
import { PATHS } from "@/lib/mock/content";
import { useProgress } from "@/lib/progress";
import { Mala } from "@/components/Mala";

export default function LearnPage() {
  const { progress } = useProgress();

  return (
    <div className="pt-10">
      <h1 className="font-display text-[2.4rem] leading-tight">Learn</h1>
      <p className="mt-2 max-w-[44ch] text-[1.1rem] text-kajal-soft">
        Short lessons, about five minutes each. Every lesson you finish adds a bead to your mala.
      </p>

      <ul className="mt-8 flex flex-col gap-5">
        {PATHS.map((p) => {
          const done = progress[p.slug] ?? [];
          return (
            <li key={p.slug}>
              <Link
                href={`/learn/${p.slug}`}
                className="block rounded-[2rem] border-2 border-sandal-edge px-6 py-6 hover:border-kesar hover:bg-sandal-deep/60 sm:px-8"
              >
                <span className="text-[0.85rem] font-semibold text-tulsi">{p.forWhom}</span>
                <span className="mt-1 block font-display text-[1.6rem] leading-tight">{p.title}</span>
                <span className="mt-2 block max-w-[52ch] text-[1rem] text-kajal-soft">{p.description}</span>
                <span className="mt-5 flex flex-wrap items-center justify-between gap-3">
                  <Mala total={p.totalLessons} done={done} />
                  <span className="text-[0.9rem] font-semibold">
                    {done.length === 0 ? "Start" : `${done.length} of ${p.totalLessons} done`}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
