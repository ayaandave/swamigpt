import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MEDITATIONS } from "@/lib/meditations";
import { MeditationPlayer } from "@/components/MeditationPlayer";

export function generateStaticParams() {
  return MEDITATIONS.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata(props: PageProps<"/meditate/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const m = MEDITATIONS.find((x) => x.slug === slug);
  return m ? { title: `${m.title}: a ${m.minutes}-minute guided meditation · SwamiGPT`, description: m.description } : {};
}

export default async function Page(props: PageProps<"/meditate/[slug]">) {
  const { slug } = await props.params;
  const meditation = MEDITATIONS.find((m) => m.slug === slug);
  if (!meditation) notFound();
  return <MeditationPlayer meditation={meditation} />;
}
