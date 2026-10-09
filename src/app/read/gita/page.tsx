import Link from "next/link";
import type { Metadata } from "next";
import { CHAPTERS } from "@/lib/scripture/library";

export const metadata: Metadata = {
  title: "The Bhagavad Gita · SwamiGPT",
  description: "All 18 chapters and 701 verses of the Bhagavad Gita, in Sanskrit with transliteration and English.",
};

export default function GitaPage() {
  return (
    <div className="pt-8">
      <Link href="/learn" className="text-[0.95rem] font-semibold text-kesar-deep hover:underline">
        ← Learn
      </Link>
      <h1 className="mt-3 font-display text-[2.4rem] leading-tight">The Bhagavad Gita</h1>
      <p className="mt-2 max-w-[48ch] text-[1.1rem] text-kajal-soft">
        A conversation on a battlefield between the warrior Arjuna and Krishna, his friend and guide. 18 chapters,
        701 verses.
      </p>

      <ol className="mt-8 flex flex-col gap-3">
        {CHAPTERS.map((c) => (
          <li key={c.number}>
            <Link
              href={`/read/gita/${c.number}`}
              className="flex min-h-16 items-center gap-4 rounded-2xl border-2 border-sandal-edge px-5 py-3 hover:border-kesar hover:bg-sandal-deep/60"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-sandal-deep font-display text-[1.2rem]">
                {c.number}
              </span>
              <span className="min-w-0">
                <span className="block font-display text-[1.25rem] leading-snug">{c.name}</span>
                <span className="text-[0.9rem] text-kajal-soft">{c.verses.length} verses</span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
