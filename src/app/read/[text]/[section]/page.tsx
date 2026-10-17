import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { allTexts, getText, passageHref, shortRef } from "@/lib/scripture/library";
import { JsonLd, SITE, breadcrumbs, pageMeta } from "@/lib/seo";

export function generateStaticParams() {
  return allTexts().flatMap((t) => t.sections.map((s) => ({ text: t.id, section: s.key })));
}

async function load(props: PageProps<"/read/[text]/[section]">) {
  const { text, section } = await props.params;
  const t = getText(text);
  const s = t?.sections.find((s) => s.key === section);
  return t && s ? { t, s, label: `${t.sectionLabel} ${t.sections.indexOf(s) + 1}` } : undefined;
}

export async function generateMetadata(props: PageProps<"/read/[text]/[section]">): Promise<Metadata> {
  const found = await load(props);
  if (!found) return {};
  const { t, s, label } = found;
  const name = `${t.numberedSections ? `${t.short} ${label.toLowerCase()}: ` : ""}${s.name}`;
  return pageMeta({
    title: `${name} · SwamiGPT`,
    description: `${name}: all ${s.passages.length} ${t.passageLabel}s from ${t.title}, each with its meaning in plain words.`,
    path: `/read/${t.id}/${s.key}`,
  });
}

export default async function SectionPage(props: PageProps<"/read/[text]/[section]">) {
  const found = await load(props);
  if (!found) notFound();
  const { t, s, label } = found;

  return (
    <div className="pt-8">
      <JsonLd
        data={{
          "@graph": [
            {
              "@type": "Chapter",
              name: s.name,
              url: `${SITE}/read/${t.id}/${s.key}`,
              isPartOf: { "@type": "Book", name: t.title, url: `${SITE}/read/${t.id}` },
              inLanguage: "en",
            },
            breadcrumbs([
              { name: "Home", path: "/" },
              { name: "Learn", path: "/learn" },
              { name: t.title, path: `/read/${t.id}` },
              { name: s.name, path: `/read/${t.id}/${s.key}` },
            ]),
          ],
        }}
      />
      <Link href={`/read/${t.id}`} className="inline-flex min-h-11 items-center text-[0.95rem] font-semibold text-kesar-deep hover:underline">
        ← {t.title}
      </Link>
      {t.numberedSections && (
        <p className="mt-3 text-[1rem] font-semibold text-kajal-soft">
          {t.short} · {label}
        </p>
      )}
      <h1 className="mt-1 font-display text-[2.2rem] leading-tight">{s.name}</h1>

      <ol className="mt-8 border-t-2 border-sandal-edge">
        {s.passages.map((p, i) => {
          // Upanishads and prose books have parts within a section: label each new one
          // ("Part 1.2", or the chapter title when there is one)
          const part = p.number.includes(".") ? p.number.slice(0, p.number.lastIndexOf(".")) : "";
          const prev = s.passages[i - 1];
          const newPart = part && !prev?.number.startsWith(part + ".");
          return (
            <li key={p.id} className="border-b border-sandal-edge">
              {newPart && (
                <h2 className="pt-8 pb-2 font-display text-[1.3rem] text-kajal-soft">
                  {p.partName ? `${part}. ${p.partName}` : `Part ${part}`}
                </h2>
              )}
              <Link
                href={passageHref(p)}
                className="flex gap-4 py-4 pr-1 hover:bg-sandal-deep/40"
              >
                <span className="min-w-12 shrink-0 pt-0.5 font-display text-[1.1rem] text-kesar-deep">{shortRef(p)}</span>
                <span className="min-w-0">
                  <span className="line-clamp-2 text-[1.05rem] leading-relaxed">{p.plain ?? p.translation}</span>
                  {p.speaker && <span className="text-[0.85rem] text-kajal-soft">{p.speaker}</span>}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
