import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CHAPTERS, verseHref } from "@/lib/scripture/library";

export function generateStaticParams() {
  return CHAPTERS.map((c) => ({ chapter: String(c.number) }));
}

const findChapter = (n: string) => CHAPTERS.find((c) => String(c.number) === n);

export async function generateMetadata(props: PageProps<"/read/gita/[chapter]">): Promise<Metadata> {
  const c = findChapter((await props.params).chapter);
  return c ? { title: `Bhagavad Gita chapter ${c.number}: ${c.name} · SwamiGPT` } : {};
}

export default async function ChapterPage(props: PageProps<"/read/gita/[chapter]">) {
  const c = findChapter((await props.params).chapter);
  if (!c) notFound();

  return (
    <div className="pt-8">
      <Link href="/read/gita" className="text-[0.95rem] font-semibold text-kesar-deep hover:underline">
        ← All chapters
      </Link>
      <p className="mt-3 text-[1rem] font-semibold text-kajal-soft">Bhagavad Gita · Chapter {c.number}</p>
      <h1 className="mt-1 font-display text-[2.2rem] leading-tight">{c.name}</h1>

      <ol className="mt-8 flex flex-col gap-3">
        {c.verses.map((v) => (
          <li key={v.id}>
            <Link
              href={verseHref(v)}
              className="flex gap-4 rounded-2xl border-2 border-sandal-edge px-5 py-4 hover:border-kesar hover:bg-sandal-deep/60"
            >
              <span className="w-12 shrink-0 pt-0.5 font-display text-[1.1rem] text-kesar-deep">
                {c.number}.{v.verse}
              </span>
              <span className="min-w-0">
                <span className="line-clamp-2 text-[1.05rem] leading-relaxed">{v.plain ?? v.translation}</span>
                <span className="text-[0.85rem] text-kajal-soft">{v.speaker}</span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
