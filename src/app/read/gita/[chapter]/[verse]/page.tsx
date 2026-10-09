import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { VERSES, getVerse, speakerLine, verseHref } from "@/lib/scripture/library";
import { VerseCard } from "@/components/VerseCard";
import { ListenButton } from "@/components/ListenButton";

export function generateStaticParams() {
  return VERSES.map((v) => ({ chapter: String(v.chapter), verse: String(v.verse) }));
}

async function load(props: PageProps<"/read/gita/[chapter]/[verse]">) {
  const { chapter, verse } = await props.params;
  return getVerse(Number(chapter), Number(verse));
}

export async function generateMetadata(props: PageProps<"/read/gita/[chapter]/[verse]">): Promise<Metadata> {
  const found = await load(props);
  if (!found) return {};
  const v = found.verse;
  return {
    title: `${v.source} meaning · SwamiGPT`,
    description: v.plain ?? v.translation,
  };
}

export default async function VersePage(props: PageProps<"/read/gita/[chapter]/[verse]">) {
  const found = await load(props);
  if (!found) notFound();
  const { verse: v, prev, next } = found;
  const question = `What does ${v.source} mean for my life?`;

  return (
    <div className="pt-8">
      <Link href={`/read/gita/${v.chapter}`} className="text-[0.95rem] font-semibold text-kesar-deep hover:underline">
        ← Chapter {v.chapter}: {v.chapterName}
      </Link>
      <h1 className="mt-3 font-display text-[2.2rem] leading-tight">{v.source}</h1>
      <p className="mt-1 text-[1rem] text-kajal-soft">{speakerLine(v)}</p>

      <div className="mt-6">
        <VerseCard verse={v} />
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <ListenButton text={`${v.source}. ${v.translation}${v.plain ? ` In plain words: ${v.plain}` : ""}`} />
        <Link
          href={`/?ask=${encodeURIComponent(question)}`}
          className="inline-flex min-h-14 items-center rounded-full border-2 border-kajal px-6 text-[1rem] font-semibold hover:bg-sandal-deep"
        >
          Ask the Swami about this
        </Link>
      </div>

      <nav aria-label="Verses" className="mt-10 grid grid-cols-2 gap-3">
        {prev ? (
          <Link
            href={verseHref(prev)}
            className="flex min-h-16 flex-col justify-center rounded-2xl border-2 border-sandal-edge px-5 py-3 hover:border-kesar"
          >
            <span className="text-[0.85rem] text-kajal-soft">← Previous</span>
            <span className="font-display text-[1.15rem]">
              {prev.chapter}.{prev.verse}
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link
            href={verseHref(next)}
            className="flex min-h-16 flex-col items-end justify-center rounded-2xl border-2 border-sandal-edge px-5 py-3 text-right hover:border-kesar"
          >
            <span className="text-[0.85rem] text-kajal-soft">Next →</span>
            <span className="font-display text-[1.15rem]">
              {next.chapter}.{next.verse}
            </span>
          </Link>
        )}
      </nav>
    </div>
  );
}
