// GET /api/plus/voice (with the sign-in token): whether this free account has used up its
// answers read aloud for now. Asked only after Swamiji's voice falls back to the phone's own.
import { createClient } from "@supabase/supabase-js";
import { voiceUsedUp } from "@/lib/limits";

export async function GET(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const token = request.headers.get("authorization")?.replace(/^Bearer /, "");
  if (!url || !key || !token) return Response.json({ usedUp: false }, { status: 401 });

  const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await sb.auth.getUser(token);
  if (error || !data.user) return Response.json({ usedUp: false }, { status: 401 });
  return Response.json({ usedUp: await voiceUsedUp(data.user.id) });
}
