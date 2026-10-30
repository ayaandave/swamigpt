import Link from "next/link";
import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { GROUPS, MEDITATIONS } from "@/lib/meditations";
import { MANTRAS } from "@/lib/mantras";
import { MeditationStats } from "@/components/MeditationStats";
import { PracticeStreak } from "@/components/PracticeStreak";
import { PlayIcon } from "@/components/icons";

export const metadata: Metadata = pageMeta({
  title: "Guided meditations and mantras · SwamiGPT",
  description:
    "Calm guided meditations read aloud, from a three-minute reset to sleep, and mantras like Om and the Gayatri with real chanting and a mala counter.",
  path: "/meditate",
});

export default function MeditatePage() {
  return (
    <div className="pt-10">
      <h1 className="font-display text-[1.75rem] leading-tight">Meditate</h1>
      <p className="mt-2 max-w-[44ch] text-[1.1rem] text-kajal-soft">
        Choose what fits this moment. The leaf will breathe with you.
      </p>
      <MeditationStats />
      <PracticeStreak className="mt-5" />

      {GROUPS.map((g) => (
        <section key={g.id} aria-labelledby={`group-${g.id}`} className="mt-10">
          <h2 id={`group-${g.id}`} className="font-display text-[1.3rem] leading-tight">
            {g.title}
          </h2>
          <p className="text-[1rem] text-kajal-soft">{g.note}</p>
          <ul className="mt-4 flex flex-col gap-4">
            {MEDITATIONS.filter((m) => m.group === g.id).map((m) => (
              <li key={m.slug}>
                <Link
                  href={`/meditate/${m.slug}`}
                  className="group flex items-center gap-5 rounded-2xl bg-night px-5 py-5 text-kajal sm:px-7"
                >
                  <span className="flex size-20 shrink-0 flex-col items-center justify-center rounded-full border border-flame/50 text-flame">
                    <span className="font-display text-[1.4rem] leading-none">{m.minutes}</span>
                    <span className="text-[0.7rem]">min</span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-[1.2rem] leading-tight">{m.title}</span>
                    <span className="mt-1 block text-[0.95rem] text-kajal-soft">{m.description}</span>
                  </span>
                  <span
                    aria-hidden="true"
                    className="hidden size-14 shrink-0 items-center justify-center rounded-full bg-flame text-kajal group-hover:bg-sandal sm:flex"
                  >
                    <PlayIcon />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <section aria-labelledby="group-mantras" className="mt-10">
        <h2 id="group-mantras" className="font-display text-[1.3rem] leading-tight">
          Mantras
        </h2>
        <p className="text-[1rem] text-kajal-soft">Sacred words to say aloud or in your mind</p>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2">
          {MANTRAS.map((m) => (
            <li key={m.slug}>
              <Link
                href={`/meditate/mantra/${m.slug}`}
                className="tile flex h-full flex-col rounded-2xl border border-sandal-edge bg-sandal-deep px-6 py-5 hover:border-kesar"
              >
                <span lang="sa" className="font-display text-[1.25rem] leading-tight text-kesar-deep">
                  {m.sanskritName}
                </span>
                <span className="mt-1 block font-display text-[1.15rem] leading-tight">{m.title}</span>
                <span className="mt-1 block text-[0.95rem] leading-snug text-kajal-soft">{m.short}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
