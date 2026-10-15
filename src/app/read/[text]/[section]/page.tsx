import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { allTexts, getText, passageHref, shortRef } from "@/lib/scripture/library";

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
  return { title: `${t.numberedSections ? `${t.short} ${label.toLowerCase()}: ` : ""}${s.name} · SwamiGPT` };
}

export default async function SectionPage(props: PageProps<"/read/[text]/[section]">) {
  const found = await load(props);
  if (!found) notFound();
  const { t, s, label } = found;

  return (
    <div className="pt-8">
      <Link href={`/read/${t.id}`} className="inline-flex min-h-11 items-center text-[0.95rem] font-semibold text-kesar-deep hover:underline">
        ← {t.title}
      </Link>
      {t.numberedSections && (
        <p className="mt-3 text-[1rem] font-semibold text-kajal-soft">
          {t.short} · {label}
        </p>
      )}
      <h1 className="mt-1 font-display text-[2.2rem] leading-tight">{s.name}</h1>

      <ol className="mt-8 flex flex-col gap-3">
        {s.passages.map((p, i) => {
          // Upanishads and prose books have parts within a section: label each new one
          // ("Part 1.2", or the chapter title when there is one)
          const part = p.number.includes(".") ? p.number.slice(0, p.number.lastIndexOf(".")) : "";
          const prev = s.passages[i - 1];
          const newPart = part && !prev?.number.startsWith(part + ".");
          return (
            <li key={p.id}>
              {newPart && (
                <h2 className="mt-6 mb-3 font-display text-[1.3rem] text-kajal-soft">
                  {p.partName ? `${part}. ${p.partName}` : `Part ${part}`}
                </h2>
              )}
              <Link
                href={passageHref(p)}
                className="flex gap-4 rounded-2xl border-2 border-sandal-edge px-5 py-4 hover:border-kesar hover:bg-sandal-deep/60"
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
