import { notFound } from "next/navigation";
import { PATHS } from "@/lib/lessons";
import { getPassageById } from "@/lib/scripture/library";
import type { Verse } from "@/lib/scripture/types";
import { LessonView } from "@/components/LessonView";

export function generateStaticParams() {
  return PATHS.flatMap((p) => p.lessons.map((_, i) => ({ slug: p.slug, lesson: String(i + 1) })));
}

export default async function Page(props: PageProps<"/learn/[slug]/[lesson]">) {
  const { slug, lesson } = await props.params;
  const path = PATHS.find((p) => p.slug === slug);
  const index = Number(lesson) - 1;
  if (!path || !Number.isInteger(index) || !path.lessons[index]) notFound();

  // The library stays on the server: hand the lesson just the verse it quotes
  const p = path.lessons[index].verseId ? getPassageById(path.lessons[index].verseId!) : undefined;
  const verse: Verse | undefined = p && {
    id: p.id,
    source: p.source,
    sanskrit: p.sanskrit,
    transliteration: p.transliteration,
    translation: p.translation,
    translator: p.translator,
    plain: p.plain,
  };
  return <LessonView path={path} index={index} verse={verse} />;
}
