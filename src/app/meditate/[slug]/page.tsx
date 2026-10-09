import { notFound } from "next/navigation";
import { MEDITATIONS } from "@/lib/meditations";
import { MeditationPlayer } from "@/components/MeditationPlayer";

export function generateStaticParams() {
  return MEDITATIONS.map((m) => ({ slug: m.slug }));
}

export default async function Page(props: PageProps<"/meditate/[slug]">) {
  const { slug } = await props.params;
  const meditation = MEDITATIONS.find((m) => m.slug === slug);
  if (!meditation) notFound();
  return <MeditationPlayer meditation={meditation} />;
}
