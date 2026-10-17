// GET /api/admin/money (with the sign-in token): the money dashboard's numbers. Only accounts
// listed in ADMIN_EMAILS get an answer; everyone else gets a 404, as if the page didn't exist.
import { createClient } from "@supabase/supabase-js";
import { getMoney } from "@/lib/money";

export async function GET(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const admins = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  const token = request.headers.get("authorization")?.replace(/^Bearer /, "");
  if (!url || !key || !token || !admins.length) return new Response("not found", { status: 404 });

  const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await sb.auth.getUser(token);
  const email = data.user?.email?.toLowerCase();
  // A confirmed email only, so nobody can sign up with your address and get in
  if (error || !email || !data.user?.email_confirmed_at || !admins.includes(email)) {
    return new Response("not found", { status: 404 });
  }
  return Response.json(await getMoney(), { headers: { "Cache-Control": "private, no-store" } });
}
