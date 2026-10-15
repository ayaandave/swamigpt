// Daily question limits: 3 a day for guests, 5 for free accounts, 20 with Plus, and a ceiling for
// the whole site (set in the database's take_question function). Server only: the server works out
// who is asking, so nobody can claim to be someone else or skip the count. If accounts aren't set
// up, there are no limits.
import "server-only";
import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const secret = process.env.SUPABASE_SECRET_KEY;
// Mixed into guests' addresses before hashing, so the stored key can't be turned back into an address
const SALT = process.env.GUEST_KEY_SALT ?? "swamigpt-guests";
// Questions answered across the whole site in a day, whoever asks: a ceiling on the day's bill
const QUESTIONS_PER_SITE = Number(process.env.QUESTIONS_DAILY_PER_SITE ?? 400);

// A guest's address, hashed. An IPv6 address counts by its network (the first four groups), since
// one connection can use millions of addresses in it.
const hashAddress = (request: Request) => {
  let address = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  if (address.includes(":")) address = address.split(":").slice(0, 4).join(":") + "::/64";
  return createHash("sha256").update(`${SALT}:${address}`).digest("hex");
};

// Who sent this request: their account id if the sign-in token checks out, otherwise null
async function signedInUser(request: Request): Promise<string | null> {
  const token = request.headers.get("authorization")?.replace(/^Bearer /, "");
  if (!token || !url || !key) return null;
  const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await sb.auth.getUser(token);
  return error || !data.user ? null : data.user.id;
}

// If the counter itself is down, each server instance keeps a small count of its own, so the
// limits still hold roughly instead of switching off
const fallback = new Map<string, number>();
function fallbackTake(who: string) {
  const k = `${new Date().toISOString().slice(0, 10)}|${who}`;
  const used = (fallback.get(k) ?? 0) + 1;
  if (fallback.size > 10_000) fallback.clear();
  fallback.set(k, used);
  return used > 3 ? -1 : 3 - used;
}

// Uses one of today's questions for whoever sent this request. Returns the number left today,
// -1 if they had none left, -2 if the whole site is at today's ceiling, or null when limits aren't on.
export async function takeQuestion(request: Request): Promise<number | null> {
  if (!url || !key || !secret) return null;
  // No limits while developing on this Mac (next dev); the live site always counts
  if (process.env.NODE_ENV !== "production") return null;
  // A missing or invalid token just means a guest
  const uid = await signedInUser(request);
  const who = uid ? `user:${uid}` : `guest:${hashAddress(request)}`;
  const sb = createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await sb.rpc("take_question", { p_who: who, p_uid: uid, p_site_cap: QUESTIONS_PER_SITE });
  if (error) {
    console.error("question limit check failed", error.message);
    return fallbackTake(who);
  }
  return data as number;
}

// Limits on new voice audio, in characters (about one ElevenLabs credit each), set by plan in the
// database's use_voice function. Audio that is already saved replays for free and doesn't count.
// A full chat answer read aloud is about 1,800 characters. The whole site also has a daily ceiling.
const SPEECH_PER_SITE = Number(process.env.SPEECH_DAILY_PER_SITE ?? 60_000);

// Counts this many characters of new audio for whoever sent the request: by account when the
// request carries a voice ticket (an <audio> element can't send a sign-in token), otherwise by
// address. Returns false once they, or the whole site, are at the limit.
export async function takeSpeech(request: Request, chars: number, userId: string | null): Promise<boolean> {
  if (!url || !secret) return true;
  if (process.env.NODE_ENV !== "production") return true;
  const sb = createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await sb.rpc("use_voice", {
    p_who: userId ? `user:${userId}` : `guest:${hashAddress(request)}`,
    p_uid: userId,
    p_chars: chars,
    per_site: SPEECH_PER_SITE,
  });
  if (error) {
    console.error("audio limit check failed", error.message);
    return false; // the app falls back to the phone's own voice, so no one is left without audio
  }
  return data === true;
}
