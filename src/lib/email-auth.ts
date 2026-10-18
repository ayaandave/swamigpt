// Who's asking, from the sign-in token an API call carries. Server only.
import "server-only";
import { createClient, type User } from "@supabase/supabase-js";

export async function signedInUser(request: Request): Promise<User | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const token = request.headers.get("authorization")?.replace(/^Bearer /, "");
  if (!url || !key || !token) return null;
  const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await sb.auth.getUser(token);
  return error ? null : data.user;
}

// Scheduled jobs: Vercel sends CRON_SECRET as a bearer token
export function fromCron(request: Request) {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret) && request.headers.get("authorization") === `Bearer ${secret}`;
}
