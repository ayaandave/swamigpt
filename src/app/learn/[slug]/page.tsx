import { notFound } from "next/navigation";
import { PATHS } from "@/lib/lessons";
import { getPassageById } from "@/lib/scripture/library";
import type { Verse } from "@/lib/scripture/types";
import { LessonView } from "@/components/LessonView";

export function generateStaticParams() {
  return PATHS.map((p) => ({ slug: p.slug }));
}

export default async function Page(props: PageProps<"/learn/[slug]">) {
  const { slug } = await props.params;
  const path = PATHS.find((p) => p.slug === slug);
  if (!path) notFound();

  // The library stays on the server: hand the lesson view just the verses this path quotes
  const verses: Record<string, Verse> = {};
  for (const { verseId } of path.lessons) {
    const p = verseId && getPassageById(verseId);
    if (!p) continue;
    verses[p.id] = {
      id: p.id,
      source: p.source,
      sanskrit: p.sanskrit,
      transliteration: p.transliteration,
      translation: p.translation,
      translator: p.translator,
      plain: p.plain,
    };
  }
  return <LessonView path={path} verses={verses} />;
}
