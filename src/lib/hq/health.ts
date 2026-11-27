// Is everything working? For SwamiGPT HQ: the site, Claude, ElevenLabs and Supabase, checked live,
// plus dates to remember (keys that expire, renewals). Server only; no key is ever sent back.
import "server-only";
import { cached, serverDb } from "./db";

export type Check = { id: string; name: string; ok: boolean; detail: string; ms: number | null };
export type Reminder = { name: string; date: string | null; note: string; href?: string };
export type Health = { checkedAt: string; checks: Check[]; reminders: Reminder[]; setup: { name: string; done: boolean; how: string }[] };

// Dates that matter. Add a line when something new expires or renews.
export const REMINDERS: Reminder[] = [
  {
    name: "Claude Admin key (money numbers)",
    date: "2027-10-15",
    note: "Make a new Admin key in the Claude Console, replace ANTHROPIC_ADMIN_KEY in Vercel, redeploy.",
    href: "https://platform.claude.com/settings/admin-keys",
  },
  {
    name: "Vercel analytics token (visitor numbers)",
    date: "2027-11-17",
    note: "Make a new token scoped to swamigpt, replace VERCEL_ANALYTICS_TOKEN in Vercel, redeploy.",
    href: "https://vercel.com/account/settings/tokens",
  },
  {
    name: "Apple Developer membership",
    date: null,
    note: "Renews once a year on your dad's account. If it lapses, the app leaves the App Store.",
    href: "https://developer.apple.com/account",
  },
  {
    name: "swamigpt.com domain (GoDaddy)",
    date: null,
    note: "Paid yearly. Turn on auto-renew so the site never goes dark.",
    href: "https://dcc.godaddy.com/control/portfolio",
  },
];

async function timed(id: string, name: string, run: () => Promise<string>): Promise<Check> {
  const t = Date.now();
  try {
    return { id, name, ok: true, detail: await run(), ms: Date.now() - t };
  } catch (e) {
    return { id, name, ok: false, detail: e instanceof Error ? e.message : "Not working", ms: null };
  }
}

const opts = (headers: Record<string, string> = {}) => ({ headers, cache: "no-store" as const, signal: AbortSignal.timeout(10000) });

export const getHealth = cached(60 * 1000, async (): Promise<Health> => {
  const checks = await Promise.all([
    timed("site", "swamigpt.com", async () => {
      const res = await fetch("https://www.swamigpt.com/", opts({ "user-agent": "SwamiGPT-HQ/1.0" }));
      if (!res.ok) throw new Error(`The site answered ${res.status}`);
      return "Up";
    }),
    timed("claude", "Claude (answers)", async () => {
      const key = process.env.ANTHROPIC_API_KEY;
      if (!key) throw new Error("ANTHROPIC_API_KEY isn't set");
      // Listing models costs nothing and fails the same way a question would if the key expired
      const res = await fetch("https://api.anthropic.com/v1/models?limit=1", opts({ "x-api-key": key, "anthropic-version": "2023-06-01" }));
      if (res.status === 401 || res.status === 403) throw new Error("The API key was refused: answers will fail. Make a new key.");
      if (!res.ok) throw new Error(`Anthropic answered ${res.status}`);
      return process.env.SWAMI_TEST_MODE === "1" ? "Working, but in test mode (cheaper model)" : "Working";
    }),
    timed("voice", "ElevenLabs (voices)", async () => {
      const key = process.env.ELEVENLABS_API_KEY;
      if (!key) throw new Error("ELEVENLABS_API_KEY isn't set");
      const res = await fetch("https://api.elevenlabs.io/v1/user/subscription", opts({ "xi-api-key": key }));
      if (!res.ok) throw new Error(`ElevenLabs answered ${res.status}`);
      const s = (await res.json()) as { character_count: number; character_limit: number };
      const left = Math.max(0, s.character_limit - s.character_count);
      if (s.character_limit > 0 && left / s.character_limit < 0.1) throw new Error(`Almost out: ${left.toLocaleString()} characters left`);
      return `${left.toLocaleString()} characters left`;
    }),
    timed("db", "Supabase (accounts)", async () => {
      const sb = serverDb();
      if (!sb) throw new Error("Supabase keys aren't set");
      const { error } = await sb.from("question_usage").select("day", { count: "exact", head: true });
      if (error) throw new Error("Supabase didn't answer");
      return "Working";
    }),
  ]);

  const has = (...names: string[]) => names.every((n) => !!process.env[n]);
  const setup = [
    { name: "Money: Claude costs", done: has("ANTHROPIC_ADMIN_KEY"), how: "ANTHROPIC_ADMIN_KEY" },
    { name: "Website visitors", done: has("VERCEL_ANALYTICS_TOKEN"), how: "VERCEL_ANALYTICS_TOKEN" },
    {
      name: "App Store downloads and sales",
      done: has("ASC_KEY_ID", "ASC_ISSUER_ID", "ASC_PRIVATE_KEY", "ASC_VENDOR_NUMBER"),
      how: "ASC_KEY_ID, ASC_ISSUER_ID, ASC_PRIVATE_KEY, ASC_VENDOR_NUMBER",
    },
    { name: "Plus subscribers and revenue", done: has("REVENUECAT_V2_KEY"), how: "REVENUECAT_V2_KEY" },
    { name: "Best model for everyone", done: process.env.SWAMI_TEST_MODE !== "1", how: "Remove SWAMI_TEST_MODE in Vercel production" },
  ];

  return { checkedAt: new Date().toISOString(), checks, reminders: REMINDERS, setup };
});
