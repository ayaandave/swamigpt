import type { MetadataRoute } from "next";
import { PATHS, lessonHref } from "@/lib/lessons";
import { MEDITATIONS } from "@/lib/meditations";
import { MANTRAS } from "@/lib/mantras";
import { PASSAGES, allTexts, passageHref } from "@/lib/scripture/library";

const SITE = "https://www.swamigpt.com";

// Every public page, so search engines can find each lesson, meditation and passage
export default function sitemap(): MetadataRoute.Sitemap {
  const page = (path: string, priority: number): MetadataRoute.Sitemap[number] => ({ url: `${SITE}${path}`, priority });
  return [
    page("", 1),
    page("/ask", 0.9),
    page("/learn", 0.9),
    page("/meditate", 0.9),
    page("/today", 0.8),
    page("/sources", 0.5),
    page("/plus", 0.4),
    page("/privacy", 0.2),
    page("/terms", 0.2),
    ...PATHS.flatMap((p) => [page(`/learn/${p.slug}`, 0.8), ...p.lessons.map((_, i) => page(lessonHref(p.slug, i), 0.7))]),
    ...MEDITATIONS.map((m) => page(`/meditate/${m.slug}`, 0.7)),
    ...MANTRAS.map((m) => page(`/meditate/mantra/${m.slug}`, 0.7)),
    ...allTexts().flatMap((t) => [page(`/read/${t.id}`, 0.7), ...t.sections.map((s) => page(`/read/${t.id}/${s.key}`, 0.6))]),
    ...PASSAGES.map((p) => page(passageHref(p), 0.5)),
  ];
}
