import type { Verse } from "@/lib/mock/verses";

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

      <p lang="sa" className="font-display whitespace-pre-line text-[1.35rem] leading-[1.9]">
        {verse.sanskrit}
      </p>
      <p
        className={`mt-3 whitespace-pre-line text-[0.85rem] italic leading-relaxed ${
          onDark ? "text-sandal/70" : "text-kajal-soft"
        }`}
      >
        {verse.transliteration}
      </p>
      <blockquote className="mt-4 font-display text-[1.15rem] leading-relaxed">
        {verse.translation}
      </blockquote>
      <figcaption
        className={`mt-4 text-[0.85rem] font-semibold ${onDark ? "text-flame" : "text-kesar-deep"}`}
      >
        {verse.source}
      </figcaption>
    </figure>
  );
}
