import Link from "next/link";
import { GROUPS, MEDITATIONS } from "@/lib/meditations";
import { MeditationStats } from "@/components/MeditationStats";
import { PlayIcon } from "@/components/icons";

export default function MeditatePage() {
  return (
    <div className="pt-10">
      <h1 className="font-display text-[2.4rem] leading-tight">Meditate</h1>
      <p className="mt-2 max-w-[44ch] text-[1.1rem] text-kajal-soft">
        Choose what fits this moment. The lamp will breathe with you.
      </p>
      <MeditationStats />

      {GROUPS.map((g) => (
        <section key={g.id} aria-labelledby={`group-${g.id}`} className="mt-10">
          <h2 id={`group-${g.id}`} className="font-display text-[1.6rem] leading-tight">
            {g.title}
          </h2>
          <p className="text-[1rem] text-kajal-soft">{g.note}</p>
          <ul className="mt-4 flex flex-col gap-4">
            {MEDITATIONS.filter((m) => m.group === g.id).map((m) => (
              <li key={m.slug}>
                <Link
                  href={`/meditate/${m.slug}`}
                  className="group flex items-center gap-5 rounded-[2rem] bg-night px-5 py-5 text-sandal sm:px-7"
                >
                  <span className="flex size-20 shrink-0 flex-col items-center justify-center rounded-full border-2 border-flame/50 text-flame">
                    <span className="font-display text-[1.7rem] leading-none">{m.minutes}</span>
                    <span className="text-[0.7rem]">min</span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-[1.4rem] leading-tight">{m.title}</span>
                    <span className="mt-1 block text-[0.95rem] text-sandal/75">{m.description}</span>
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
    </div>
  );
}
