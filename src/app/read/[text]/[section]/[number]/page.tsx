import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PASSAGES, attribution, getPassage, getText, passageHref, shortRef } from "@/lib/scripture/library";
import { VerseCard } from "@/components/VerseCard";
import { ListenButton } from "@/components/ListenButton";

export function generateStaticParams() {
  return PASSAGES.map((p) => ({ text: p.textId, section: p.section, number: p.number }));
}

async function load(props: PageProps<"/read/[text]/[section]/[number]">) {
  const { text, section, number } = await props.params;
  return getPassage(text, section, number);
}

export async function generateMetadata(props: PageProps<"/read/[text]/[section]/[number]">): Promise<Metadata> {
  const found = await load(props);
  if (!found) return {};
  const p = found.passage;
  return { title: `${p.source} meaning · SwamiGPT`, description: p.plain ?? p.translation };
}

export default async function PassagePage(props: PageProps<"/read/[text]/[section]/[number]">) {
  const found = await load(props);
  if (!found) notFound();
  const { passage: p, prev, next } = found;
  const question = `What does ${p.source} mean for my life?`;
  const [firstThoughts, ...moreThoughts] = p.commentary ?? [];
  const commentator = getText(p.textId)?.commentaryBy;

  return (
    <div className="pt-8">
      <Link href={`/read/${p.textId}/${p.section}`} className="text-[0.95rem] font-semibold text-kesar-deep hover:underline">
        ← {p.sectionName}
      </Link>
      <h1 className="mt-3 font-display text-[2.2rem] leading-tight">{p.source}</h1>
      <p className="mt-1 text-[1rem] text-kajal-soft">{attribution(p)}</p>

      <div className="mt-6">
        <VerseCard verse={p} />
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <ListenButton
          text={[`${p.source}.`, p.translation, p.plain && `In plain words: ${p.plain}`, ...(p.commentary ?? [])]
            .filter(Boolean)
            .join(" ")}
        />
        <Link
          href={`/?ask=${encodeURIComponent(question)}`}
          className="inline-flex min-h-14 items-center rounded-full border-2 border-kajal px-6 text-[1rem] font-semibold hover:bg-sandal-deep"
        >
          Ask the Swami about this
        </Link>
      </div>

      {firstThoughts && commentator && (
        <section className="mt-10">
          <h2 className="font-display text-[1.5rem]">{commentator} explains</h2>
          <div className="mt-3 flex max-w-[62ch] flex-col gap-4 text-[1.05rem] leading-[1.75]">
            <p>{firstThoughts}</p>
            {moreThoughts.length > 0 && (
              <details className="group">
                <summary className="inline-flex min-h-12 cursor-pointer list-none items-center rounded-full border-2 border-sandal-edge px-5 font-semibold hover:border-kajal group-open:hidden">
                  Keep reading
                </summary>
                <div className="flex flex-col gap-4">
                  {moreThoughts.map((t, i) => (
                    <p key={i}>{t}</p>
                  ))}
                </div>
              </details>
            )}
          </div>
        </section>
      )}

      <nav aria-label="Passages" className="mt-10 grid grid-cols-2 gap-3">
        {prev ? (
          <Link
            href={passageHref(prev)}
            className="flex min-h-16 flex-col justify-center rounded-2xl border-2 border-sandal-edge px-5 py-3 hover:border-kesar"
          >
            <span className="text-[0.85rem] text-kajal-soft">← Previous</span>
            <span className="font-display text-[1.15rem]">{shortRef(prev)}</span>
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link
            href={passageHref(next)}
            className="flex min-h-16 flex-col items-end justify-center rounded-2xl border-2 border-sandal-edge px-5 py-3 text-right hover:border-kesar"
          >
            <span className="text-[0.85rem] text-kajal-soft">Next →</span>
            <span className="font-display text-[1.15rem]">{shortRef(next)}</span>
          </Link>
        )}
      </nav>
    </div>
  );
}
