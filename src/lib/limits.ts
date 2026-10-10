// Daily question limits: 3 a day for guests, 15 for signed-in people (set in the database's
// use_question function). Server only. If accounts aren't set up, there are no limits.
import "server-only";
import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
// Mixed into guests' addresses before hashing, so the stored key can't be turned back into an address
const SALT = process.env.GUEST_KEY_SALT ?? "swamigpt-guests";

// Mixed and hashed the same way for questions and audio
const hashAddress = (request: Request) => {
  const address = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  return createHash("sha256").update(`${SALT}:${address}`).digest("hex");
};

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
  const { data, error } = await sb.rpc("use_question", { guest_key: hashAddress(request) });
  if (error) {
    console.error("question limit check failed", error.message);
    return null; // don't block people because the counter is down
  }
  return data as number;
}

// Daily limits on new voice audio, in characters (about one ElevenLabs credit each). Audio that is
// already saved replays for free and doesn't count. A full chat answer is about 1,500 characters.
const SPEECH_PER_PERSON = Number(process.env.SPEECH_DAILY_PER_PERSON ?? 10_000);
const SPEECH_PER_SITE = Number(process.env.SPEECH_DAILY_PER_SITE ?? 60_000);

// Counts this many characters of new audio for whoever sent the request (by address: an <audio>
// element can't send a sign-in token). Returns false once they, or the whole site, are at today's limit.
export async function takeSpeech(request: Request, chars: number): Promise<boolean> {
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secret) return true;
  if (process.env.NODE_ENV !== "production") return true;
  const sb = createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await sb.rpc("use_speech", {
    guest_key: hashAddress(request),
    chars,
    per_person: SPEECH_PER_PERSON,
    per_site: SPEECH_PER_SITE,
  });
  if (error) {
    console.error("audio limit check failed", error.message);
    return true; // don't silence everyone because the counter is down
  }
  return data === true;
}
