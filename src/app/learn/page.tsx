"use client";

import Link from "next/link";
import { PATHS } from "@/lib/mock/content";
import { TEXTS } from "@/lib/scripture/texts";
import { useProgress } from "@/lib/progress";
import { MalaRing } from "@/components/MalaRing";
import { VerseFinder } from "@/components/VerseFinder";

export default function LearnPage() {
  const { progress } = useProgress();

  return (
    <div className="pt-10">
      <h1 className="font-display text-[2.4rem] leading-tight">Learn</h1>

      <section aria-labelledby="read-title" className="mt-8">
        <h2 id="read-title" className="font-display text-[1.6rem] leading-tight">
          Read the scriptures
        </h2>
        <ul className="mt-4 flex flex-col gap-3">
          {TEXTS.map((t) => (
            <li key={t.id}>
              <Link
                href={`/read/${t.id}`}
                className="flex items-center justify-between gap-4 rounded-[2rem] bg-sandal-deep px-6 py-5 hover:bg-sandal-edge/60 sm:px-8"
              >
                <span>
                  <span className="block font-display text-[1.45rem] leading-tight">{t.title}</span>
                  <span className="mt-1 block text-[0.95rem] leading-snug text-kajal-soft">{t.description}</span>
                </span>
                <span aria-hidden="true" className="font-display text-[1.6rem] text-kesar-deep">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[0.9rem] text-kajal-soft">The Upanishads and Swami Vivekananda&apos;s talks are coming.</p>
        <div className="mt-6">
          <VerseFinder />
        </div>
      </section>

      <h2 className="mt-12 font-display text-[1.6rem] leading-tight">Learning paths</h2>
      <p className="mt-2 max-w-[44ch] text-[1.1rem] text-kajal-soft">
        Short lessons, about five minutes each. Every lesson you finish adds a bead to your mala.
      </p>

      <ul className="mt-6 flex flex-col gap-5">
        {PATHS.map((p) => {
          const done = progress[p.slug] ?? [];
          return (
            <li key={p.slug}>
              <Link
                href={`/learn/${p.slug}`}
                className="flex items-center gap-4 rounded-[2rem] border-2 border-sandal-edge py-5 pr-3 pl-6 hover:border-kesar hover:bg-sandal-deep/60 sm:pl-8"
              >
                <span className="min-w-0 flex-1">
                  <span className="text-[0.85rem] font-semibold text-tulsi">{p.forWhom}</span>
                  <span className="mt-1 block font-display text-[1.5rem] leading-tight">{p.title}</span>
                  <span className="mt-2 block max-w-[52ch] text-[1rem] text-kajal-soft">{p.description}</span>
                  <span className="mt-3 block text-[0.9rem] font-semibold text-kesar-deep">
                    {done.length === 0 ? "Start →" : `${done.length} of ${p.totalLessons} done · Continue →`}
                  </span>
                </span>
                <span className="shrink-0">
                  <MalaRing total={p.totalLessons} done={done} size={104} />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
