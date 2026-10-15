// POST /api/account/delete (with the sign-in token): deletes the account and everything saved
// with it. Profile, mala progress, conversations and Plus status go with the account (the tables
// cascade); daily usage counts are removed here. Saved voice audio is shared text, not personal.
// While a Plus subscription is still running, the first request is refused so the app can warn that
// deleting doesn't stop billing; the person can then confirm. The RevenueCat record goes too.
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const secret = process.env.SUPABASE_SECRET_KEY;
  const token = request.headers.get("authorization")?.replace(/^Bearer /, "");
  if (!url || !key || !secret || !token) return Response.json({ error: "unavailable" }, { status: 503 });

  const asUser = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await asUser.auth.getUser(token);
  if (error || !data.user) return Response.json({ error: "signed out" }, { status: 401 });
  const id = data.user.id;

  const admin = createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: plus, error: plusError } = await admin.from("plus_members").select("expires_at").eq("user_id", id).maybeSingle();
  if (plusError) return Response.json({ error: "failed" }, { status: 500 });
  const { confirmPlus } = ((await request.json().catch(() => ({}))) ?? {}) as { confirmPlus?: boolean };
  if (!confirmPlus && plus && (plus.expires_at === null || new Date(plus.expires_at) > new Date())) {
    return Response.json({ error: "plus" }, { status: 409 });
  }

  await admin.from("question_usage").delete().eq("who", `user:${id}`);
  await admin.from("speech_usage").delete().eq("who", `user:${id}`);
  const { error: gone } = await admin.auth.admin.deleteUser(id);
  if (gone) {
    console.error("account delete failed", gone.message);
    return Response.json({ error: "failed" }, { status: 500 });
  }
  // Their record at RevenueCat (account id and checkout email) is removed as well
  const rcKey = process.env.REVENUECAT_SECRET_KEY;
  if (rcKey) {
    await fetch(`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: { authorization: `Bearer ${rcKey}` },
    }).catch((e) => console.error("RevenueCat delete failed", e));
  }
  return Response.json({ ok: true });
}
