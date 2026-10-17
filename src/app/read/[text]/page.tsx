import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { allTexts, getText } from "@/lib/scripture/library";
import { JsonLd, ORGANIZATION, SITE, breadcrumbs, pageMeta } from "@/lib/seo";

export function generateStaticParams() {
  return allTexts().map((t) => ({ text: t.id }));
}

export async function generateMetadata(props: PageProps<"/read/[text]">): Promise<Metadata> {
  const t = getText((await props.params).text);
  return t ? pageMeta({ title: `${t.title} · SwamiGPT`, description: t.description, path: `/read/${t.id}` }) : {};
}

export default async function TextPage(props: PageProps<"/read/[text]">) {
  const t = getText((await props.params).text);
  if (!t) notFound();

  return (
    <div className="pt-8">
      <JsonLd
        data={{
          "@graph": [
            {
              "@type": "Book",
              name: t.title,
              url: `${SITE}/read/${t.id}`,
              description: t.description,
              inLanguage: "en",
              isAccessibleForFree: true,
              publisher: ORGANIZATION,
              hasPart: t.sections.map((s) => ({ "@type": "Chapter", name: s.name, url: `${SITE}/read/${t.id}/${s.key}` })),
            },
            breadcrumbs([
              { name: "Home", path: "/" },
              { name: "Learn", path: "/learn" },
              { name: t.title, path: `/read/${t.id}` },
            ]),
          ],
        }}
      />
      <Link href="/learn" className="inline-flex min-h-11 items-center text-[0.95rem] font-semibold text-kesar-deep hover:underline">
        ← Learn
      </Link>
      <h1 className="mt-3 font-display text-[2.4rem] leading-tight">{t.title}</h1>
      <p className="mt-2 max-w-[48ch] text-[1.1rem] text-kajal-soft">{t.description}</p>

      <ol className="mt-8 border-t-2 border-sandal-edge">
        {t.sections.map((s, i) => (
          <li key={s.key} className="border-b border-sandal-edge">
            <Link
              href={`/read/${t.id}/${s.key}`}
              className="group flex min-h-16 items-center gap-5 py-4 pr-1 hover:bg-sandal-deep/40"
            >
              <span className="w-8 shrink-0 text-right font-display text-[1.4rem] text-kesar-deep">{i + 1}</span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-[1.25rem] leading-snug">{s.name}</span>
                <span className="text-[0.9rem] text-kajal-soft">
                  {s.passages.length} {t.passageLabel}s
                </span>
              </span>
              <span aria-hidden="true" className="font-display text-[1.3rem] text-kesar-deep transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
