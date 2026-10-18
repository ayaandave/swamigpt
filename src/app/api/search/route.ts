// GET /api/search?q=anger: passages about a topic, from every text, found by meaning. Runs locally, no API key.
import { searchPassages } from "@/lib/scripture/search";
import { attribution, passageHref } from "@/lib/scripture/library";

// Each search runs the meaning model on the server, so a simple speed limit per address keeps one
// visitor (or a script) from tying it up: 30 searches a minute, and 4 at once per server.
const PER_MINUTE = 30;
const AT_ONCE = 4;
const recent = new Map<string, number[]>();
let running = 0;

function allowed(request: Request) {
  const who = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  const now = Date.now();
  const times = (recent.get(who) ?? []).filter((t) => now - t < 60_000);
  if (times.length >= PER_MINUTE) return false;
  times.push(now);
  if (recent.size > 5000) recent.clear();
  recent.set(who, times);
  return true;
}

export async function GET(request: Request) {
  // Only our own pages search (browsers mark same-site requests themselves), so other sites can't
  // borrow the server to run their searches
  const site = request.headers.get("sec-fetch-site");
  if (site && site !== "same-origin") return Response.json({ error: "forbidden" }, { status: 403 });
  const q = new URL(request.url).searchParams.get("q")?.trim().slice(0, 200);
  if (!q) return Response.json({ results: [] });
  if (!allowed(request) || running >= AT_ONCE) {
    return Response.json({ error: "busy" }, { status: 429, headers: { "Retry-After": "10" } });
  }
  running++;
  const passages = await searchPassages(q, 10).finally(() => running--);
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
