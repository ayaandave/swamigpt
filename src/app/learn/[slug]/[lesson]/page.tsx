import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PATHS } from "@/lib/lessons";
import { getPassageById } from "@/lib/scripture/library";
import type { Verse } from "@/lib/scripture/types";
import { LessonView } from "@/components/LessonView";

export function generateStaticParams() {
  return PATHS.flatMap((p) => p.lessons.map((_, i) => ({ slug: p.slug, lesson: String(i + 1) })));
}

export async function generateMetadata(props: PageProps<"/learn/[slug]/[lesson]">): Promise<Metadata> {
  const { slug, lesson } = await props.params;
  const path = PATHS.find((p) => p.slug === slug);
  const l = path?.lessons[Number(lesson) - 1];
  if (!path || !l) return {};
  return {
    title: `${l.title} · ${path.title} · SwamiGPT`,
    description: l.body[0],
    ...(l.verseId && { openGraph: { images: [{ url: `/api/card?id=${l.verseId}`, width: 1200, height: 630 }] } }),
  };
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
