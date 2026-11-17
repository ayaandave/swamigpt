// The analytics page's numbers (/admin/analytics): visitors, pages, where people come from and
// what they do, read live from Vercel Web Analytics. Server only: the Vercel token never leaves
// the server, and only the account in ADMIN_EMAILS can see the result.
import "server-only";

// swamigpt on Vercel (these IDs are not secret). The env vars only exist to point it elsewhere.
const PROJECT = process.env.VERCEL_ANALYTICS_PROJECT ?? "prj_5zAIizJSuayWSfz5xjuZKqqzPgSj";
const TEAM = process.env.VERCEL_ANALYTICS_TEAM ?? "team_jPYKSkZoZN4M7KIsoo7xcPfx";
const API = "https://api.vercel.com/v1/query/web-analytics";

export type Slice = { name: string; visitors: number; pageviews: number };
export type Visits =
  | {
      ok: true;
      updatedAt: string;
      days: number;
      visitors: number;
      pageviews: number;
      byDay: { day: string; visitors: number; pageviews: number }[];
      countries: Slice[];
      referrers: Slice[];
      pages: Slice[];
      devices: Slice[];
      systems: Slice[]; // e.g. "iOS · Mobile Safari"
      events: { name: string; visitors: number; count: number }[];
    }
  | { ok: false; problem: string };

type Row = Record<string, string | number | undefined>;

async function query(kind: "visits" | "events", mode: "aggregate" | "count", params: Record<string, string | string[]>) {
  const token = process.env.VERCEL_ANALYTICS_TOKEN;
  const qs = new URLSearchParams({ projectId: PROJECT, teamId: TEAM });
  for (const [k, v] of Object.entries(params)) for (const one of [v].flat()) qs.append(k, one);
  const res = await fetch(`${API}/${kind}/${mode}?${qs}`, { headers: { authorization: `Bearer ${token}` }, cache: "no-store" });
  if (!res.ok) throw new Error(`Vercel said ${res.status}${res.status === 401 || res.status === 403 ? " (check VERCEL_ANALYTICS_TOKEN)" : ""}`);
  return (await res.json()) as { data: Row[] | Row };
}

const num = (v: unknown) => (typeof v === "number" ? v : Number(v) || 0);

function slices(rows: Row[], name: (r: Row) => string): Slice[] {
  return rows.map((r) => ({ name: name(r), visitors: num(r.visitors), pageviews: num(r.pageviews) }));
}

// A small per-server cache, so flipping between tabs doesn't call Vercel every time
const cache = new Map<number, { at: number; visits: Visits }>();
const FRESH_MS = 60 * 1000;

export async function getVisits(days: 7 | 30 | number): Promise<Visits> {
  if (!process.env.VERCEL_ANALYTICS_TOKEN) {
    return { ok: false, problem: "Add a Vercel access token as VERCEL_ANALYTICS_TOKEN (Vercel → Environment Variables), then redeploy." };
  }
  const hit = cache.get(days);
  if (hit && Date.now() - hit.at < FRESH_MS) return hit.visits;

  const until = new Date();
  // Whole days: from the start of the first day (UTC), so the daily bars are complete
  const since = new Date(Date.UTC(until.getUTCFullYear(), until.getUTCMonth(), until.getUTCDate() - (days - 1)));
  const range = { since: since.toISOString(), until: until.toISOString() };
  const by = (dims: string[], limit = 8) => query("visits", "aggregate", { ...range, by: dims, limit: String(limit) });

  try {
    const [total, daily, countries, referrers, pages, devices, systems, events] = await Promise.all([
      query("visits", "count", range),
      by(["day"], 100),
      by(["country"]),
      by(["referrerHostname"]),
      by(["route"], 10),
      by(["deviceType"], 4),
      by(["osName", "browserName"], 6),
      query("events", "aggregate", { ...range, by: ["eventName"], limit: "20" }),
    ]);
    const t = (Array.isArray(total.data) ? total.data[0] : total.data) ?? {};
    const rows = (r: { data: Row[] | Row }) => (Array.isArray(r.data) ? r.data : [r.data]);

    // Fill in days with no visits, so the bars line up with the calendar
    const seen = new Map(rows(daily).map((r) => [String(r.timestamp).slice(0, 10), r]));
    const byDay = Array.from({ length: days }, (_, i) => {
      const day = new Date(since.getTime() + i * 86400000).toISOString().slice(0, 10);
      const r = seen.get(day);
      return { day, visitors: num(r?.visitors), pageviews: num(r?.pageviews) };
    });

    const visits: Visits = {
      ok: true,
      updatedAt: until.toISOString(),
      days,
      visitors: num(t.visitors),
      pageviews: num(t.pageviews),
      byDay,
      countries: slices(rows(countries), (r) => String(r.country ?? "")),
      referrers: slices(rows(referrers), (r) => String(r.referrerHostname ?? "")),
      pages: slices(rows(pages), (r) => String(r.route ?? r.requestPath ?? "")),
      devices: slices(rows(devices), (r) => String(r.deviceType ?? "")),
      systems: slices(rows(systems), (r) => [r.osName, r.browserName].filter(Boolean).join(" · ")),
      events: rows(events).map((r) => ({ name: String(r.eventName ?? ""), visitors: num(r.visitors), count: num(r.count) })),
    };
    cache.set(days, { at: Date.now(), visits });
    return visits;
  } catch (e) {
    return { ok: false, problem: `Couldn't read Vercel Analytics: ${e instanceof Error ? e.message : "unknown error"}` };
  }
}
