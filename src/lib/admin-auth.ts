// Server check for the owner-only pages (/admin money, /admin/analytics): the request's sign-in
// token must belong to a confirmed email listed in ADMIN_EMAILS.
import "server-only";
import { createClient } from "@supabase/supabase-js";

export async function isAdminRequest(request: Request): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const admins = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  const token = request.headers.get("authorization")?.replace(/^Bearer /, "");
  if (!url || !key || !token || !admins.length) return false;
  const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await sb.auth.getUser(token);
  const email = data.user?.email?.toLowerCase();
  // A confirmed email only, so nobody can sign up with your address and get in
  return !error && !!email && !!data.user?.email_confirmed_at && admins.includes(email);
}
