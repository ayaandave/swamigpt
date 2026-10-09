import { notFound } from "next/navigation";
import { PATHS } from "@/lib/lessons";
import { PathTimeline } from "@/components/PathTimeline";

export function generateStaticParams() {
  return PATHS.map((p) => ({ slug: p.slug }));
}

export default async function Page(props: PageProps<"/learn/[slug]">) {
  const { slug } = await props.params;
  const path = PATHS.find((p) => p.slug === slug);
  if (!path) notFound();
  return <PathTimeline path={path} />;
}
