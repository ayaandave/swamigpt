import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MANTRAS, getMantra } from "@/lib/mantras";
import { JsonLd, ORGANIZATION, SITE, breadcrumbs, pageMeta } from "@/lib/seo";
import { MantraCounter } from "@/components/MantraCounter";
import { MantraListen } from "@/components/MantraListen";
import { BackIcon } from "@/components/icons";

export function generateStaticParams() {
  return MANTRAS.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata(props: PageProps<"/meditate/mantra/[slug]">): Promise<Metadata> {
  const m = getMantra((await props.params).slug);
  return m ? pageMeta({ title: `${m.title} · SwamiGPT`, description: m.short, path: `/meditate/mantra/${m.slug}` }) : {};
}

// One mantra: the Sanskrit and how to say it, word by word, what it means, and a counter
export default async function MantraPage(props: PageProps<"/meditate/mantra/[slug]">) {
  const m = getMantra((await props.params).slug);
  if (!m) notFound();

  return (
    <div className="pt-8">
      <JsonLd
        data={{
          "@graph": [
            {
              "@type": "LearningResource",
              name: m.title,
              alternateName: m.sanskritName,
              description: m.about,
              url: `${SITE}/meditate/mantra/${m.slug}`,
              learningResourceType: "Mantra",
              inLanguage: "en",
              isAccessibleForFree: true,
              publisher: ORGANIZATION,
            },
            breadcrumbs([
              { name: "Home", path: "/" },
              { name: "Meditate", path: "/meditate" },
              { name: m.title, path: `/meditate/mantra/${m.slug}` },
            ]),
          ],
        }}
      />
      <Link href="/meditate" className="inline-flex min-h-11 items-center gap-2 font-semibold text-kajal-soft hover:text-kajal">
        <BackIcon className="size-5" />
        Meditate
      </Link>

      <p lang="sa" className="mt-6 font-display text-[1.3rem] text-kesar-deep">
        {m.sanskritName}
      </p>
      <h1 className="font-display text-[1.75rem] leading-tight">{m.title}</h1>
      <p className="mt-3 max-w-[60ch] text-[1.1rem] leading-[1.7]">{m.about}</p>
      {m.audio && <MantraListen audio={m.audio} title={m.title} />}

      {m.parts.map((part, i) => (
        <section key={i} aria-label={part.name ?? m.title} className="mt-10">
          {part.name && <h2 className="font-display text-[1.3rem] leading-tight">{part.name}</h2>}

          <div className="mt-4 rounded-2xl border border-sandal-edge bg-white/40 px-6 py-6">
            {part.lines.map((line) => (
              <p key={line.sa} className="py-1.5">
                <span lang="sa" className="block font-display text-[1.25rem] leading-[1.7]">
                  {line.sa}
                </span>
                <span className="block text-[1rem] italic text-kajal-soft">{line.tr}</span>
              </p>
            ))}
          </div>

          <h3 className="mt-6 text-[0.85rem] font-semibold uppercase tracking-[0.12em] text-kesar-deep">Word by word</h3>
          <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-[1rem]">
            {part.words.map(([word, meaning]) => (
              <div key={word} className="contents">
                <dt className="font-semibold italic">{word}</dt>
                <dd>{meaning}</dd>
              </div>
            ))}
          </dl>

          <h3 className="mt-6 text-[0.85rem] font-semibold uppercase tracking-[0.12em] text-kesar-deep">What it means</h3>
          <p className="mt-2 max-w-[60ch] font-display text-[1.1rem] leading-snug">{part.meaning}</p>

          <p className="mt-4 text-[0.95rem] text-kajal-soft">
            From {part.source}.
            {part.passageHref && (
              <>
                {" "}
                <Link href={part.passageHref} className="font-semibold text-kesar-deep underline underline-offset-4">
                  Read it in the library
                </Link>
              </>
            )}
          </p>
        </section>
      ))}

      <section className="mt-10">
        <h2 className="font-display text-[1.3rem] leading-tight">How to say it</h2>
        <p className="mt-2 max-w-[60ch] text-[1.1rem] leading-[1.7]">{m.howTo}</p>
        {m.note && <p className="mt-3 max-w-[60ch] text-[0.95rem] text-kajal-soft">{m.note}</p>}
      </section>

      <MantraCounter title={m.title === "The peace chants" ? "the chant" : m.title.replace(/^The /, "the ")} />
    </div>
  );
}
