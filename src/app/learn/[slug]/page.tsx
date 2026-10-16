import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PATHS, lessonHref } from "@/lib/lessons";
import { JsonLd, ORGANIZATION, SITE, breadcrumbs, pageMeta } from "@/lib/seo";
import { PathTimeline } from "@/components/PathTimeline";

export function generateStaticParams() {
  return PATHS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(props: PageProps<"/learn/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const path = PATHS.find((p) => p.slug === slug);
  return path ? pageMeta({ title: `${path.title} · SwamiGPT`, description: path.description, path: `/learn/${path.slug}` }) : {};
}

export default async function Page(props: PageProps<"/learn/[slug]">) {
  const { slug } = await props.params;
  const path = PATHS.find((p) => p.slug === slug);
  if (!path) notFound();
  return (
    <>
      <JsonLd
        data={{
          "@graph": [
            {
              "@type": "Course",
              name: path.title,
              description: path.description,
              url: `${SITE}/learn/${path.slug}`,
              audience: { "@type": "Audience", audienceType: path.forWhom },
              inLanguage: "en",
              isAccessibleForFree: true,
              provider: ORGANIZATION,
              hasPart: path.lessons.map((l, i) => ({
                "@type": "LearningResource",
                name: l.title,
                url: `${SITE}${lessonHref(path.slug, i)}`,
                position: i + 1,
              })),
            },
            breadcrumbs([
              { name: "Home", path: "/" },
              { name: "Learn", path: "/learn" },
              { name: path.title, path: `/learn/${path.slug}` },
            ]),
          ],
        }}
      />
      <PathTimeline path={path} />
    </>
  );
}
