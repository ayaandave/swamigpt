"use client";

import type { Verse } from "@/lib/scripture/types";
import { useSavedVerses } from "@/lib/saved-verses";
import { useIsClient } from "@/lib/store";
import { track } from "@/lib/events";

// Keep a verse to come back to (listed on /saved). A quiet toggle: tap again to let it go.
export function SaveVerseButton({ verse, className = "" }: { verse: Verse; className?: string }) {
  const isClient = useIsClient();
  const { isSaved, toggle } = useSavedVerses();
  const saved = isClient && isSaved(verse.id);
  return (
    <button
      type="button"
      onClick={() => {
        if (!saved) track("verse_saved");
        toggle(verse);
      }}
      aria-pressed={saved}
      className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-[0.95rem] font-semibold ${
        saved ? "border-kesar text-kesar-deep" : "border-sandal-edge hover:border-kajal"
      } ${className}`}
    >
      <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round">
        <path d="M6 3.5h12v17l-6-4-6 4z" />
      </svg>
      {saved ? "Saved" : "Save verse"}
    </button>
  );
}
