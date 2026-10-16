// GET /api/search?q=anger: passages about a topic, from every text, found by meaning. Runs locally, no API key.
import { searchPassages } from "@/lib/scripture/search";
import { attribution, passageHref } from "@/lib/scripture/library";

export async function GET(request: Request) {
  // Only our own pages search (browsers mark same-site requests themselves), so other sites can't
  // borrow the server to run their searches
  const site = request.headers.get("sec-fetch-site");
  if (site && site !== "same-origin") return Response.json({ error: "forbidden" }, { status: 403 });
  const q = new URL(request.url).searchParams.get("q")?.trim().slice(0, 200);
  if (!q) return Response.json({ results: [] });
  const passages = await searchPassages(q, 10);
  return Response.json({
    results: passages.map((p) => ({
      id: p.id,
      source: p.source,
      speaker: p.speaker ?? null,
      translation: p.translation,
      plain: p.plain ?? null,
      href: passageHref(p),
      by: attribution(p) || p.sectionName,
    })),
  });
}
