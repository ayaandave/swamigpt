// TikTok numbers for SwamiGPT HQ. TikTok and Metricool's free plan don't hand numbers to other
// apps, so they're saved here: by the Sunday TikTok task (scripts/save-tiktok.mjs) after it reads
// Metricool, or typed in on the dashboard. Server only.
import "server-only";
import { serverDb } from "./db";

export type TikTokPost = {
  title: string;
  url?: string;
  posted?: string;
  views: number;
  likes?: number;
  comments?: number;
  shares?: number;
  saves?: number;
};
export type TikTokSnapshot = {
  day: string;
  followers: number;
  likes: number | null;
  views: number | null;
  posts: TikTokPost[];
  note: string | null;
};

export async function getTikTok(): Promise<{ ok: true; snapshots: TikTokSnapshot[] } | { ok: false; problem: string }> {
  const sb = serverDb();
  if (!sb) return { ok: false, problem: "Supabase keys aren't set." };
  const { data, error } = await sb.from("tiktok_snapshots").select("day, followers, likes, views, posts, note").order("day").limit(500);
  if (error) return { ok: false, problem: "Couldn't read the TikTok numbers (has the hq_dashboard migration run?)." };
  return { ok: true, snapshots: data as TikTokSnapshot[] };
}

const count = (v: unknown) => (Number.isInteger(v) && (v as number) >= 0 && (v as number) < 1e10 ? (v as number) : undefined);
const text = (v: unknown, max: number) => (typeof v === "string" && v.trim() && v.length <= max ? v.trim() : undefined);

// Checks a snapshot sent from the dashboard; null if anything is off
export function readSnapshot(body: unknown): TikTokSnapshot | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  const day = typeof b.day === "string" && /^\d{4}-\d{2}-\d{2}$/.test(b.day) ? b.day : null;
  const followers = count(b.followers);
  if (!day || followers === undefined) return null;
  const rawPosts = Array.isArray(b.posts) ? b.posts.slice(0, 60) : [];
  const posts: TikTokPost[] = [];
  for (const p of rawPosts) {
    if (!p || typeof p !== "object") return null;
    const r = p as Record<string, unknown>;
    const title = text(r.title, 200);
    const views = count(r.views);
    if (!title || views === undefined) return null;
    const url = text(r.url, 500);
    posts.push({
      title,
      views,
      ...(url && /^https:\/\/(www\.)?tiktok\.com\//.test(url) ? { url } : {}),
      ...(text(r.posted, 10) ? { posted: text(r.posted, 10) } : {}),
      ...Object.fromEntries((["likes", "comments", "shares", "saves"] as const).flatMap((k) => (count(r[k]) === undefined ? [] : [[k, count(r[k])]]))),
    });
  }
  return { day, followers, likes: count(b.likes) ?? null, views: count(b.views) ?? null, posts, note: text(b.note, 2000) ?? null };
}
