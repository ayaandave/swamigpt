"use client";

import Link from "next/link";
import { VerseCard } from "@/components/VerseCard";
import { SaveVerseButton } from "@/components/SaveVerseButton";
import { whoSays } from "@/lib/scripture/who";
import { useSavedVerses } from "@/lib/saved-verses";
import { useIsClient } from "@/lib/store";

// The verses someone has kept, from answers and from today's verse, newest first
export default function SavedPage() {
  const isClient = useIsClient();
  const { verses } = useSavedVerses();
  if (!isClient) return <div className="min-h-[60vh]" />;

  return (
    <div className="pt-10">
      <h1 className="font-display text-[1.75rem] leading-tight">Saved verses</h1>
      {verses.length === 0 ? (
        <div className="mt-4 max-w-[52ch] text-[1.05rem] leading-relaxed text-kajal-soft">
          <p>Nothing saved yet. When a verse speaks to you, in an answer or in today&apos;s verse, tap “Save verse” to keep it here.</p>
          <Link
            href="/today"
            className="mt-6 inline-flex min-h-14 items-center rounded-xl bg-kesar px-7 text-[1.05rem] font-bold text-on-kesar hover:bg-kesar-deep hover:text-sandal"
          >
            Read today&apos;s verse
          </Link>
        </div>
      ) : (
        <>
          <p className="mt-2 text-[0.95rem] text-kajal-soft">Kept on this device.</p>
          <ul className="mt-8 flex flex-col gap-10">
            {verses.map((verse) => (
              <li key={verse.id} className="flex flex-col gap-3">
                <p className="text-[0.9rem] text-kajal-soft">{whoSays(verse)}:</p>
                <VerseCard verse={verse} />
                <div className="flex flex-wrap gap-3">
                  <SaveVerseButton verse={verse} />
                  <Link
                    href={`/ask?ask=${encodeURIComponent(`What does this verse mean for my life? "${verse.translation.slice(0, 300)}"`)}&about=${encodeURIComponent(verse.id)}`}
                    className="inline-flex min-h-11 items-center rounded-full border border-sandal-edge px-4 text-[0.95rem] font-semibold hover:border-kajal"
                  >
                    Reflect on it
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
