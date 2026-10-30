import type { Verse } from "@/lib/scripture/types";
import { caption } from "@/lib/scripture/who";

// A verse as a raised card: a thin gold line along the top, the Sanskrit in gold, the
// transliteration, the translation, its meaning in plain words, and where it comes from.
// `onDark` is kept for older callers; the card follows the theme either way.
export function VerseCard({ verse }: { verse: Verse; onDark?: boolean }) {
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
      <figcaption className="mt-4 font-mono text-[0.75rem] text-kesar-deep">{caption(verse)}</figcaption>
    </figure>
  );
}
