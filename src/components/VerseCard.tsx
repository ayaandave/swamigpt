import type { Verse } from "@/lib/scripture/types";
import { caption } from "@/lib/scripture/who";

// Styled after a palm-leaf manuscript: long leaf, two binding holes.
export function VerseCard({ verse, onDark = false }: { verse: Verse; onDark?: boolean }) {
  return (
    <figure
      className={`relative rounded-[2.5rem] px-8 py-7 sm:px-12 ${
        onDark
          ? "bg-night-soft text-sandal"
          : "bg-sandal-deep text-kajal shadow-[inset_0_0_0_1px_var(--sandal-edge)]"
      }`}
    >
      <span
        aria-hidden="true"
        className={`absolute left-3 top-1/2 size-2.5 -translate-y-1/2 rounded-full sm:left-5 ${
          onDark ? "bg-night" : "bg-sandal"
        } shadow-[inset_0_1px_2px_rgba(43,27,16,.35)]`}
      />
      <span
        aria-hidden="true"
        className={`absolute right-3 top-1/2 size-2.5 -translate-y-1/2 rounded-full sm:right-5 ${
          onDark ? "bg-night" : "bg-sandal"
        } shadow-[inset_0_1px_2px_rgba(43,27,16,.35)]`}
      />

      {verse.sanskrit && (
        <p lang="sa" className="mb-4 font-display whitespace-pre-line text-[1.35rem] leading-[1.9]">
          {verse.sanskrit}
        </p>
      )}
      {verse.transliteration && (
        <p
          className={`-mt-1 mb-4 whitespace-pre-line text-[0.85rem] italic leading-relaxed ${
            onDark ? "text-sandal/70" : "text-kajal-soft"
          }`}
        >
          {verse.transliteration}
        </p>
      )}
      <blockquote className="whitespace-pre-line font-display text-[1.15rem] leading-relaxed">
        {verse.translation}
      </blockquote>
      {verse.plain && (
        <p className={`mt-3 text-[1.05rem] leading-relaxed ${onDark ? "text-sandal/85" : "text-kajal-soft"}`}>
          <span className="font-semibold">In plain words: </span>
          {verse.plain}
        </p>
      )}
      <figcaption
        className={`mt-4 text-[0.85rem] font-semibold ${onDark ? "text-flame" : "text-kesar-deep"}`}
      >
        {caption(verse)}
      </figcaption>
    </figure>
  );
}
