// Plus numbers for SwamiGPT HQ: RevenueCat's overview (subscribers, trials, monthly revenue) plus
// SwamiGPT's own list of Plus members split by store. Server only.
import "server-only";
import { cached, serverDb } from "./db";

export type PlusNumbers = {
  revenuecat:
    | { ok: true; metrics: { id: string; name: string; value: number; unit: string }[] }
    | { ok: false; problem: string; setup?: boolean };
  members: { ok: true; total: number; byStore: { store: string; count: number }[] } | { ok: false; problem: string };
};

const RC = "https://api.revenuecat.com/v2";

async function revenuecat(): Promise<PlusNumbers["revenuecat"]> {
  // A v2 secret key (RevenueCat → Project settings → API keys → + New secret API key, version 2,
  // with read access to Charts metrics and Project configuration). The older v1 key can't do this.
  const key = process.env.REVENUECAT_V2_KEY;
  if (!key) return { ok: false, setup: true, problem: "Add a RevenueCat v2 secret key as REVENUECAT_V2_KEY to see subscribers and revenue." };
  const get = async (path: string) => {
    const res = await fetch(`${RC}${path}`, {
      headers: { authorization: `Bearer ${key}` },
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
    if (res.status === 401 || res.status === 403) throw new Error("key");
    if (!res.ok) throw new Error(`RevenueCat ${res.status}`);
    return res.json();
  };
  try {
    let project = process.env.REVENUECAT_PROJECT_ID;
    if (!project) {
      const list = (await get("/projects")) as { items?: { id: string }[] };
      project = list.items?.[0]?.id;
      if (!project) return { ok: false, problem: "RevenueCat didn't list any project for this key." };
    }
    const body = (await get(`/projects/${encodeURIComponent(project)}/metrics/overview`)) as {
      metrics?: { id: string; name: string; value: number; unit?: string }[];
    };
    return {
      ok: true,
      metrics: (body.metrics ?? []).map((m) => ({ id: m.id, name: m.name, value: Number(m.value) || 0, unit: m.unit ?? "" })),
    };
  } catch (e) {
    return {
      ok: false,
      problem:
        e instanceof Error && e.message === "key"
          ? "RevenueCat refused REVENUECAT_V2_KEY. It must be a v2 secret key with read access to Charts metrics and Project configuration."
          : "Couldn't reach RevenueCat just now.",
    };
  }
}

async function members(): Promise<PlusNumbers["members"]> {
  const sb = serverDb();
  if (!sb) return { ok: false, problem: "Supabase keys aren't set." };
  const { data, error } = await sb.from("plus_members").select("store, expires_at");
  if (error) return { ok: false, problem: "Couldn't read Plus members from Supabase." };
  const now = Date.now();
  const live = data.filter((m) => !m.expires_at || new Date(m.expires_at).getTime() > now);
  const by = new Map<string, number>();
  for (const m of live) by.set(m.store ?? "other", (by.get(m.store ?? "other") ?? 0) + 1);
  return { ok: true, total: live.length, byStore: [...by].map(([store, count]) => ({ store, count })).sort((a, b) => b.count - a.count) };
}

export const getPlus = cached(5 * 60 * 1000, async (): Promise<PlusNumbers> => {
  const [rc, m] = await Promise.all([revenuecat(), members()]);
  return { revenuecat: rc, members: m };
});
