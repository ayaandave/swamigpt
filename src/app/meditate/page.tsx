import Link from "next/link";
import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { GROUPS, MEDITATIONS } from "@/lib/meditations";
import { MANTRAS } from "@/lib/mantras";
import { FeelingPicker } from "@/components/FeelingPicker";
import { MeditationStats } from "@/components/MeditationStats";
import { PracticeStreak } from "@/components/PracticeStreak";
import { LampIcon, MeditateIcon, MoonIcon } from "@/components/icons";

export const metadata: Metadata = pageMeta({
  title: "Guided meditations and mantras · SwamiGPT",
  description:
    "Calm guided meditations read aloud, from a three-minute reset to sleep, and mantras like Om and the Gayatri with real chanting and a mala counter.",
  path: "/meditate",
});

const GROUP_ICON = { quick: MeditateIcon, daily: LampIcon, sleep: MoonIcon };
const groupTitle = (id: string) => GROUPS.find((g) => g.id === id)?.title ?? "";

export default function MeditatePage() {
  return (
    <div className="pt-10">
      <h1 className="text-[1.75rem] font-medium leading-tight tracking-tight">Meditate</h1>
      <p className="mt-2 max-w-[44ch] text-[0.95rem] text-kajal-soft">
        Choose what fits this moment. The gold circle will breathe with you.
      </p>

      <FeelingPicker />
      <MeditationStats />
      <PracticeStreak className="mt-5" />

      <section aria-labelledby="sessions-title" className="mt-10">
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="sessions-title" className="text-[1.1rem] font-medium tracking-tight">
            Guided sessions
          </h2>
          <span className="font-mono text-[0.72rem] text-kajal-soft">{MEDITATIONS.length} sessions</span>
        </div>
        <ul className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {MEDITATIONS.map((m) => {
            const Icon = GROUP_ICON[m.group];
            return (
              <li key={m.slug}>
                <Link
                  href={`/meditate/${m.slug}`}
                  className="gold-tile flex aspect-square flex-col justify-between rounded-2xl p-3.5"
                >
                  <span className="flex items-start justify-between">
                    <span className="gold-chip flex size-9 items-center justify-center rounded-[10px]">
                      <Icon className="size-5" />
                    </span>
                    <span className="font-mono text-[0.75rem] text-kesar-deep">{m.minutes} min</span>
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[1rem] font-medium leading-snug tracking-tight">{m.title}</span>
                    <span className="mt-1.5 inline-block rounded-full border border-sandal-edge px-2.5 py-0.5 text-[0.68rem] text-kajal-soft">
                      {groupTitle(m.group)}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="group-mantras" className="mt-10">
        <h2 id="group-mantras" className="text-[1.1rem] font-medium tracking-tight">
          Mantras
        </h2>
        <p className="text-[0.85rem] text-kajal-soft">Sacred words to say aloud or in your mind</p>
        <ul className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {MANTRAS.map((m) => (
            <li key={m.slug}>
              <Link
                href={`/meditate/mantra/${m.slug}`}
                className="gold-tile flex aspect-square flex-col justify-between overflow-hidden rounded-2xl p-3.5"
              >
                <span
                  lang="sa"
                  className={`truncate font-display leading-tight text-kesar-deep [text-shadow:0_0_18px_var(--glow)] ${
                    m.sanskritName.length > 9 ? "text-[1.05rem]" : "text-[1.5rem]"
                  }`}
                >
                  {m.sanskritName}
                </span>
                <span className="min-w-0">
                  <span className="line-clamp-2 text-[0.95rem] font-medium leading-snug tracking-tight">{m.title}</span>
                  <span className="mt-0.5 line-clamp-2 text-[0.72rem] leading-snug text-kajal-soft">{m.short}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
