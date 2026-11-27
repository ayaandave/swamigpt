// /api/admin/tiktok (owner only): the saved TikTok numbers for SwamiGPT HQ.
// GET lists every check; POST saves one (same day replaces it); DELETE ?day=YYYY-MM-DD removes one.
import { getTikTok, readSnapshot } from "@/lib/hq/tiktok";
import { serverDb } from "@/lib/hq/db";
import { bad, ownerOnly } from "@/lib/hq/route";

export async function GET(request: Request) {
  return ownerOnly(request, getTikTok);
}

export async function POST(request: Request) {
  return ownerOnly(request, async () => {
    const snap = readSnapshot(await request.json().catch(() => null));
    if (!snap) return bad("Needs a date, followers, and for each post a title and views.");
    const sb = serverDb();
    if (!sb) return bad("Supabase keys aren't set.");
    const { error } = await sb.from("tiktok_snapshots").upsert(snap);
    if (error) return bad("Couldn't save it.");
    return getTikTok();
  });
}

export async function DELETE(request: Request) {
  return ownerOnly(request, async () => {
    const day = new URL(request.url).searchParams.get("day") ?? "";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return bad("Which day?");
    const sb = serverDb();
    if (!sb) return bad("Supabase keys aren't set.");
    await sb.from("tiktok_snapshots").delete().eq("day", day);
    return getTikTok();
  });
}
