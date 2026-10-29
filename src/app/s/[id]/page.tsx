import Link from "next/link";
import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { adminDb } from "@/lib/email";
import { getPassageById } from "@/lib/scripture/library";
import { whoSays } from "@/lib/scripture/who";
import { pageMeta } from "@/lib/seo";
import { SHARE_ID, type SharedAnswer } from "@/lib/share";
import type { Verse } from "@/lib/scripture/types";
import { VerseCard } from "@/components/VerseCard";
import { Leaf } from "@/components/Leaf";

// One answer someone shared from the Ask page, at swamigpt.com/s/<id>. Read fresh on every visit
// (a link can be opened a moment before its answer finishes saving). The verse text always comes
// from the library itself, never from what was saved.
async function load(id: string) {
  await connection();
  if (!SHARE_ID.test(id)) return null;
  const { data } = (await adminDb()?.from("shared_answers").select("answer").eq("id", id).maybeSingle()) ?? { data: null };
  if (!data) return null;
  const a = data.answer as SharedAnswer;
  const verses = a.verses.flatMap(({ id, meaning }) => {
    const p = getPassageById(id);
    return p ? [{ verse: p as Verse, meaning }] : [];
  });
  return { ...a, verses };
}

// The first sentence or two, for link previews
function opening(text: string) {
  const sentences = text.match(/[^.!?]+[.!?]+/g) ?? [text];
  let out = "";
  for (const s of sentences) {
    if (out && out.length + s.length > 180) break;
    out += s;
  }
  return out.trim();
}

// Shared answers only exist once someone shares, so none are known at build time. One example id
// lets the page's shell (header, tab bar) be built ahead; real ids render on first visit.
export function generateStaticParams() {
  return [{ id: "example00000" }];
}

export async function generateMetadata(props: PageProps<"/s/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  const a = await load(id);
  if (!a) return { title: "SwamiGPT", robots: { index: false } };
  const first = a.verses[0]?.verse;
  return {
    ...pageMeta({
      title: `“${a.question.slice(0, 90)}” · SwamiGPT`,
      description: opening(a.paragraphs[0] ?? ""),
      path: `/s/${id}`,
      image: first ? `/api/card?id=${encodeURIComponent(first.id)}` : undefined,
      type: "article",
    }),
    // Shared answers are personal: reachable by link, never listed in search engines
    robots: { index: false, follow: true },
  };
}

async function Shared({ params }: Pick<PageProps<"/s/[id]">, "params">) {
  const { id } = await params;
  const a = await load(id);
  if (!a) {
    return (
      <div className="flex flex-col items-start gap-4 pt-10">
        <h1 className="font-display text-[2rem] leading-tight">This answer isn&apos;t here.</h1>
        <p className="text-[1.1rem] text-kajal-soft">The link may be mistyped, or it was just shared. Try again in a moment.</p>
        <Link href="/ask" className="flex min-h-14 items-center rounded-full bg-kesar px-7 font-bold text-kajal">
          Ask your own question
        </Link>
      </div>
    );
  }
  return (
    <article className="flex flex-col gap-6 pt-8">
      <p className="text-[0.85rem] font-bold tracking-[0.16em] text-kesar-deep uppercase">Shared from SwamiGPT</p>
      <h1 className="border-l-4 border-kesar pl-5 font-display text-[1.7rem] leading-snug">{a.question}</h1>
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:gap-4">
        <div className="shrink-0 sm:pt-1">
          <Leaf size={56} />
        </div>
        <div className="flex min-w-0 flex-col gap-4 text-[1.1rem] leading-[1.7]">
          {a.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          {a.verses.map(({ verse, meaning }) => (
            <div key={verse.id} className="mt-3 flex flex-col gap-4">
              <p className="font-display text-[1.15rem] text-kajal-soft">{whoSays(verse)}:</p>
              <VerseCard verse={verse} />
              {meaning && <p className="text-[1.05rem]">{meaning}</p>}
            </div>
          ))}
          {a.practice && (
            <Link href={a.practice.href} className="mt-2 rounded-2xl border-2 border-sandal-edge px-5 py-4 hover:border-kajal">
              <span className="block font-semibold">Try this: {a.practice.title}</span>
              <span className="block text-[1rem] text-kajal-soft">{a.practice.why}</span>
            </Link>
          )}
        </div>
      </div>

      <section className="mt-6 flex flex-col items-start gap-3 rounded-[2rem] bg-sandal-deep p-6">
        <h2 className="font-display text-[1.5rem] leading-tight">Have a question of your own?</h2>
        <p className="text-[1.05rem] text-kajal-soft">
          SwamiGPT answers from real Hindu scripture, in words you&apos;ll actually understand. Free.
        </p>
        <Link
          href="/ask"
          className="flex min-h-14 items-center rounded-full bg-kesar px-7 text-[1.05rem] font-bold text-kajal hover:bg-kesar-deep hover:text-sandal"
        >
          Ask SwamiGPT
        </Link>
      </section>
      <p className="text-[0.9rem] text-kajal-soft">
        SwamiGPT is an AI guide, not a guru. It quotes real scriptures and can still make mistakes.
      </p>
    </article>
  );
}

export default function SharedAnswerPage(props: PageProps<"/s/[id]">) {
  return (
    <Suspense fallback={<div className="h-[60svh]" />}>
      <Shared params={props.params} />
    </Suspense>
  );
}
