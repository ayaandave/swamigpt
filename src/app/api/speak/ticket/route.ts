// POST /api/speak/ticket (with the sign-in token): a voice ticket for this account, which the
// app adds to /api/speak links so read-aloud limits follow the account and its plan.
import { createClient } from "@supabase/supabase-js";
import { makeTicket } from "@/lib/voice-ticket";

export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const token = request.headers.get("authorization")?.replace(/^Bearer /, "");
  if (!url || !key || !token) return Response.json({ ticket: null });

  const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await sb.auth.getUser(token);
  if (error || !data.user) return Response.json({ ticket: null }, { status: 401 });
  return Response.json({ ticket: makeTicket(data.user.id) });
}
