// GET /api/search?q=anger: verses about a topic, found by meaning. Runs locally, no API key.
import { searchVerses } from "@/lib/scripture/search";
import { verseHref } from "@/lib/scripture/library";

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q")?.trim().slice(0, 200);
  if (!q) return Response.json({ results: [] });
  const verses = await searchVerses(q, 10);
  return Response.json({
    results: verses.map((v) => ({
      id: v.id,
      source: v.source,
      speaker: v.speaker,
      translation: v.translation,
      plain: v.plain ?? null,
      href: verseHref(v),
    })),
  });
}
