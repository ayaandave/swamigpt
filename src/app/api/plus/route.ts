// POST /api/plus (with the sign-in token): checks RevenueCat now and saves this account's Plus
// status. Called right after checkout, so Plus switches on without waiting for the webhook.
import { createClient } from "@supabase/supabase-js";
import { syncPlus } from "@/lib/plus-sync";

export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const token = request.headers.get("authorization")?.replace(/^Bearer /, "");
  if (!url || !key || !token) return Response.json({ plus: false }, { status: 401 });

  const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await sb.auth.getUser(token);
  if (error || !data.user) return Response.json({ plus: false }, { status: 401 });
  try {
    return Response.json({ plus: await syncPlus(data.user.id) });
  } catch (e) {
    console.error("Plus check failed", e);
    return Response.json({ plus: false }, { status: 502 });
  }
}
