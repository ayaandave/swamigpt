// Daily question limits: 8 a day for guests, 10 for free accounts, 20 with Plus, and a ceiling for
// the whole site (set in the database's take_question function). Server only: the server works out
// who is asking, so nobody can claim to be someone else or skip the count. On the live site, if the
// limits can't be checked, paid answers and voices are refused rather than left unlimited.
import "server-only";
import { createHash, createHmac } from "node:crypto";
import { isIP } from "node:net";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const secret = process.env.SUPABASE_SECRET_KEY;
const LIVE = process.env.NODE_ENV === "production";
// A secret mixed into guests' addresses, so the stored code can't be worked back to an address by
// trying every address. GUEST_KEY_SALT if set, otherwise one made from the server's secret key.
const GUEST_KEY = process.env.GUEST_KEY_SALT ?? createHash("sha256").update(`guest-key:${secret ?? "dev"}`).digest("hex");
// Questions answered across the whole site in a day, whoever asks: a ceiling on the day's bill
const QUESTIONS_PER_SITE = Number(process.env.QUESTIONS_DAILY_PER_SITE ?? 400);

// The first four groups of an IPv6 address (its /64 network), written out in full, so every
// address in one network counts as one guest: "2001:db8::1" and "2001:db8::2" are the same.
export function ipv6Network(address: string): string {
  let a = address.replace(/^\[|\]$/g, "").split("%")[0];
  const v4 = a.match(/(\d+\.\d+\.\d+\.\d+)$/); // "::ffff:1.2.3.4": an IPv4 address in IPv6 form
  if (v4) return v4[1];
  const [left, right] = a.includes("::") ? a.split("::") : [a, undefined];
  const head = left ? left.split(":") : [];
  const tail = right ? right.split(":") : [];
  const groups = right === undefined ? head : [...head, ...Array(8 - head.length - tail.length).fill("0"), ...tail];
  a = groups.slice(0, 4).map((g) => parseInt(g || "0", 16).toString(16)).join(":");
  return `${a}::/64`;
}

// A guest's address, as a keyed code. Vercel sets x-forwarded-for itself, so it can't be faked.
const hashAddress = (request: Request) => {
  let address = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  if (isIP(address) === 6) address = ipv6Network(address);
  return createHmac("sha256", GUEST_KEY).update(address).digest("hex");
};

// Who sent this request: their account id if the sign-in token checks out, otherwise null
async function signedInUser(request: Request): Promise<string | null> {
  const token = request.headers.get("authorization")?.replace(/^Bearer /, "");
  if (!token || !url || !key) return null;
  const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await sb.auth.getUser(token);
  return error || !data.user ? null : data.user.id;
}

// Who is asking, as the database counts them: their account if signed in, otherwise their hashed address
export async function whoIsAsking(request: Request): Promise<{ who: string; uid: string | null }> {
  const uid = await signedInUser(request);
  return { who: uid ? `user:${uid}` : `guest:${hashAddress(request)}`, uid };
}

// If the counter itself is down, each server instance keeps a small count of its own: 3 a person
// and 30 in all per day, so answers keep working for a while but the bill stays small
const fallback = new Map<string, number>();
const FALLBACK_PER_INSTANCE = 30;
function fallbackTake(who: string) {
  const day = new Date().toISOString().slice(0, 10);
  const total = `${day}|all`;
  if ((fallback.get(total) ?? 0) >= FALLBACK_PER_INSTANCE) return -2;
  const k = `${day}|${who}`;
  const used = (fallback.get(k) ?? 0) + 1;
  if (used > 3) return -1;
  if (fallback.size > 10_000) fallback.clear();
  fallback.set(k, used);
  fallback.set(total, (fallback.get(total) ?? 0) + 1);
  return 3 - used;
}

// Uses one of today's questions for whoever sent this request. Returns the number left today,
// -1 if they had none left, -2 if the whole site is at today's ceiling (or limits can't be checked),
// or null while developing.
export async function takeQuestion(request: Request): Promise<number | null> {
  // No limits while developing on this Mac (next dev); the live site always counts
  if (!LIVE) return null;
  if (!url || !key || !secret) {
    console.error("question limits aren't set up (Supabase keys missing): refusing paid answers");
    return -2;
  }
  // A missing or invalid token just means a guest
  const { who, uid } = await whoIsAsking(request);
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
  if (!LIVE) return true;
  if (!url || !secret) return false; // limits can't be checked: the phone's own voice reads instead
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
