// GET /api/admin/me (with the sign-in token): whether this account may see the money page, so the
// app can show its tab. The same check as /api/admin/money, without fetching any numbers.
import { createClient } from "@supabase/supabase-js";

export async function GET(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const admins = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  const token = request.headers.get("authorization")?.replace(/^Bearer /, "");
  const no = Response.json({ admin: false }, { headers: { "Cache-Control": "private, no-store" } });
  if (!url || !key || !token || !admins.length) return no;
  const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await sb.auth.getUser(token);
  const email = data.user?.email?.toLowerCase();
  if (error || !email || !data.user?.email_confirmed_at || !admins.includes(email)) return no;
  return Response.json({ admin: true }, { headers: { "Cache-Control": "private, no-store" } });
}
