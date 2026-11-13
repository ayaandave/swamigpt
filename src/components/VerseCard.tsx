import Link from "next/link";
import type { Verse } from "@/lib/scripture/types";
import { caption } from "@/lib/scripture/who";

// A verse as a raised card: a thin gold line along the top, the Sanskrit in gold, the
// transliteration, the translation, its meaning in plain words, and where it comes from.
// The source is a link to the full passage in the library, so every quote can be checked
// (`linkSource={false}` on the passage's own page). `onDark` is kept for older callers.
export function VerseCard({ verse, linkSource = true }: { verse: Verse; onDark?: boolean; linkSource?: boolean }) {
  return (
    <figure className="verse-card relative m-0 rounded-2xl border border-sandal-edge bg-sandal-deep px-5 py-5 text-kajal sm:px-6">
      {verse.sanskrit && (
        <p lang="sa" className="mb-3 whitespace-pre-line text-[1.15rem] leading-[1.75] text-kesar-deep">
          {verse.sanskrit}
        </p>
      )}
      {verse.transliteration && (
        <p className="mb-3 whitespace-pre-line text-[0.8rem] italic leading-relaxed text-kajal-soft">
          {verse.transliteration}
        </p>
      )}
      <blockquote className="m-0 whitespace-pre-line text-[1.05rem] leading-relaxed">{verse.translation}</blockquote>
      {verse.plain && (
        <p className="mt-3 text-[0.95rem] leading-relaxed text-kajal-soft">
          <span className="font-medium text-kajal">In plain words: </span>
          {verse.plain}
        </p>
      )}
      <figcaption className="mt-4 font-mono text-[0.75rem] text-kesar-deep">
        {linkSource ? (
          <Link
            href={`/v/${encodeURIComponent(verse.id)}`}
            className="-mx-2 -my-3 inline-flex min-h-11 items-center gap-1.5 rounded-full px-2 underline-offset-4 hover:underline"
          >
            {caption(verse)}
            <span aria-hidden="true">→</span>
            <span className="sr-only">(read the full passage)</span>
          </Link>
        ) : (
          caption(verse)
        )}
      </figcaption>
    </figure>
  );
}
