// Saves one TikTok check to SwamiGPT HQ (the owner dashboard at /admin). Used by the Sunday TikTok
// task after it reads the numbers in Metricool, or by hand.
//   node --env-file=.env.local scripts/save-tiktok.mjs path/to/snapshot.json
// snapshot.json: { "day": "2026-11-29", "followers": 1700, "likes": 56000, "views": 410000,
//   "posts": [{ "title": "Hanuman mantra", "url": "https://www.tiktok.com/@swamigpt/video/…",
//   "posted": "2026-11-16", "views": 12000, "likes": 900, "comments": 20, "shares": 40, "saves": 300 }],
//   "note": "optional" }
// The same day again replaces that day's numbers.
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const file = process.argv[2];
if (!file) throw new Error("Usage: node --env-file=.env.local scripts/save-tiktok.mjs snapshot.json");
const snap = JSON.parse(readFileSync(file, "utf8"));
if (!/^\d{4}-\d{2}-\d{2}$/.test(snap.day ?? "") || !Number.isInteger(snap.followers)) throw new Error("Needs day (YYYY-MM-DD) and followers");
if (!Array.isArray(snap.posts ?? [])) throw new Error("posts must be a list");
for (const p of snap.posts ?? []) if (typeof p.title !== "string" || !Number.isInteger(p.views)) throw new Error(`Each post needs a title and views: ${JSON.stringify(p)}`);

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;
if (!url || !secret) throw new Error("Run with --env-file=.env.local so the Supabase keys are there");
const sb = createClient(url, secret, { auth: { persistSession: false } });
const row = { day: snap.day, followers: snap.followers, likes: snap.likes ?? null, views: snap.views ?? null, posts: snap.posts ?? [], note: snap.note ?? null };
const { error } = await sb.from("tiktok_snapshots").upsert(row);
if (error) throw new Error(`Supabase: ${error.message}`);
console.log(`Saved TikTok numbers for ${snap.day}: ${snap.followers} followers, ${row.posts.length} posts`);
