import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MEDITATIONS } from "@/lib/meditations";
import { JsonLd, ORGANIZATION, SITE, breadcrumbs, pageMeta } from "@/lib/seo";
import { MeditationPlayer } from "@/components/MeditationPlayer";

export function generateStaticParams() {
  return MEDITATIONS.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata(props: PageProps<"/meditate/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const m = MEDITATIONS.find((x) => x.slug === slug);
  return m
    ? pageMeta({
        title: `${m.title}: a ${m.minutes}-minute guided meditation · SwamiGPT`,
        description: m.description,
        path: `/meditate/${m.slug}`,
      })
    : {};
}

export default async function Page(props: PageProps<"/meditate/[slug]">) {
  const { slug } = await props.params;
  const meditation = MEDITATIONS.find((m) => m.slug === slug);
  if (!meditation) notFound();
  return (
    <>
      <JsonLd
        data={{
          "@graph": [
            {
              "@type": "LearningResource",
              name: `${meditation.title}: a ${meditation.minutes}-minute guided meditation`,
              description: meditation.description,
              url: `${SITE}/meditate/${meditation.slug}`,
              learningResourceType: "Guided meditation",
              timeRequired: `PT${meditation.minutes}M`,
              inLanguage: "en",
              isAccessibleForFree: true,
              publisher: ORGANIZATION,
            },
            breadcrumbs([
              { name: "Home", path: "/" },
              { name: "Meditate", path: "/meditate" },
              { name: meditation.title, path: `/meditate/${meditation.slug}` },
            ]),
          ],
        }}
      />
      <MeditationPlayer meditation={meditation} />
    </>
  );
}
