// Daily question limits: 3 a day for guests, 15 for signed-in people (set in the database's
// use_question function). Server only. If accounts aren't set up, there are no limits.
import "server-only";
import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
// Mixed into guests' addresses before hashing, so the stored key can't be turned back into an address
const SALT = process.env.GUEST_KEY_SALT ?? "swamigpt-guests";

// Uses one of today's questions for whoever sent this request.
// Returns the number left today, -1 if they had none left, or null when limits aren't on.
export async function takeQuestion(request: Request): Promise<number | null> {
  if (!url || !key) return null;
  // No limits while developing on this Mac (next dev); the live site always counts
  if (process.env.NODE_ENV !== "production") return null;
  const auth = request.headers.get("authorization");
  // Acting as the person who asked: the database reads who they are from their own token
  const sb = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: auth?.startsWith("Bearer ") ? { headers: { Authorization: auth } } : undefined,
  });
  const address = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  const guestKey = createHash("sha256").update(`${SALT}:${address}`).digest("hex");
  const { data, error } = await sb.rpc("use_question", { guest_key: guestKey });
  if (error) {
    console.error("question limit check failed", error.message);
    return null; // don't block people because the counter is down
  }
  return data as number;
}
