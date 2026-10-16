import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PATHS, lessonHref } from "@/lib/lessons";
import { JsonLd, ORGANIZATION, SITE, breadcrumbs, pageMeta } from "@/lib/seo";
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
  return pageMeta({
    title: `${l.title} · ${path.title} · SwamiGPT`,
    description: l.body[0],
    path: `/learn/${path.slug}/${lesson}`,
    ...(l.verseId && { image: `/api/card?id=${l.verseId}` }),
    type: "article",
  });
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
  const l = path.lessons[index];
  const url = lessonHref(path.slug, index);
  return (
    <>
      <JsonLd
        data={{
          "@graph": [
            {
              "@type": "LearningResource",
              name: l.title,
              headline: l.title,
              description: l.body[0],
              url: `${SITE}${url}`,
              learningResourceType: "Lesson",
              educationalLevel: "Beginner",
              timeRequired: "PT5M",
              inLanguage: "en",
              isAccessibleForFree: true,
              isPartOf: { "@type": "Course", name: path.title, url: `${SITE}/learn/${path.slug}` },
              ...(p && { citation: { "@type": "Quotation", name: p.source, text: p.translation } }),
              publisher: ORGANIZATION,
            },
            breadcrumbs([
              { name: "Home", path: "/" },
              { name: "Learn", path: "/learn" },
              { name: path.title, path: `/learn/${path.slug}` },
              { name: l.title, path: url },
            ]),
          ],
        }}
      />
      <LessonView path={path} index={index} verse={verse} />
    </>
  );
}
