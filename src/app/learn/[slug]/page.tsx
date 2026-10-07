import { notFound } from "next/navigation";
import { PATHS } from "@/lib/mock/content";
import { LessonView } from "@/components/LessonView";

export function generateStaticParams() {
  return PATHS.map((p) => ({ slug: p.slug }));
}

export default async function Page(props: PageProps<"/learn/[slug]">) {
  const { slug } = await props.params;
  const path = PATHS.find((p) => p.slug === slug);
  if (!path) notFound();
  return <LessonView path={path} />;
}
