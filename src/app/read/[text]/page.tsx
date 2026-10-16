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

      <ol className="mt-8 flex flex-col gap-3">
        {t.sections.map((s, i) => (
          <li key={s.key}>
            <Link
              href={`/read/${t.id}/${s.key}`}
              className="flex min-h-16 items-center gap-4 rounded-2xl border-2 border-sandal-edge px-5 py-3 hover:border-kesar hover:bg-sandal-deep/60"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-sandal-deep font-display text-[1.2rem]">
                {i + 1}
              </span>
              <span className="min-w-0">
                <span className="block font-display text-[1.25rem] leading-snug">{s.name}</span>
                <span className="text-[0.9rem] text-kajal-soft">
                  {s.passages.length} {t.passageLabel}s
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
