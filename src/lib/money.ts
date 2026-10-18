// The money dashboard's numbers (/admin): what SwamiGPT costs to run, read live from Anthropic's
// cost report, ElevenLabs' subscription, and SwamiGPT's own daily counts. Server only: the keys
// never leave the server, and only the account in ADMIN_EMAILS can see the result.
import "server-only";
import { createClient } from "@supabase/supabase-js";

// Monthly budget, in dollars. The dashboard turns orange at 75% and red at 100%.
export const MONTHLY_BUDGET = Number(process.env.MONEY_MONTHLY_BUDGET ?? 25);

// Costs that don't change day to day, in dollars a month. Edit this list when a plan changes.
// ElevenLabs isn't here: its plan price comes live from ElevenLabs.
export const FIXED_COSTS: { name: string; monthly: number | null; note: string }[] = [
  { name: "Vercel", monthly: 0, note: "Hobby plan (free)" },
  { name: "Supabase", monthly: 0, note: "Free plan" },
  { name: "Domain (swamigpt.com)", monthly: null, note: "GoDaddy, paid yearly: add the price in src/lib/money.ts" },
  { name: "Resend (emails)", monthly: 0, note: "Free plan, up to 3,000 emails a month" },
];

// Money spent once rather than every month (top-ups, one-off purchases). Add a line each time.
export const ONE_TIME_COSTS: { name: string; dollars: number; date: string; note: string }[] = [
  {
    name: "Higgsfield API credits",
    dollars: 10,
    date: "2026-10-18",
    note: "Homepage images and scroll film. $8.25 used so far, $1.75 left in the wallet (lasts a year)",
  },
];

type Day = { day: string; dollars: number };
export type Money = {
  updatedAt: string;
  month: string; // e.g. "October 2026"
  daysSoFar: number;
  daysInMonth: number;
  budget: number;
  claude:
    | { ok: true; monthToDate: number; lastMonth: number; byDay: Day[]; byModel: { model: string; dollars: number }[] }
    | { ok: false; problem: string };
  voice:
    | {
        ok: true;
        plan: string;
        status: string;
        charactersUsed: number;
        characterLimit: number;
        resetsAt: string | null;
        nextBill: number | null; // dollars
        currency: string;
      }
    | { ok: false; problem: string };
  usage:
    | {
        ok: true;
        byDay: { day: string; questions: number; voiceChars: number }[];
        questionsThisMonth: number;
        voiceCharsThisMonth: number;
        accounts: number | null;
        plusMembers: number | null;
        reportsToReview: number | null;
      }
    | { ok: false; problem: string };
  fixed: typeof FIXED_COSTS;
  oneTime: typeof ONE_TIME_COSTS;
};

const isoDay = (d: Date) => d.toISOString().slice(0, 10);

// A small per-server cache, so opening the page often doesn't hammer the APIs (Anthropic asks for
// at most one poll a minute)
let cached: { at: number; money: Money } | null = null;
const FRESH_MS = 2 * 60 * 1000;

export async function getMoney(): Promise<Money> {
  if (cached && Date.now() - cached.at < FRESH_MS) return cached.money;
  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const lastMonthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  const daysInMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0)).getUTCDate();
  const [claude, voice, usage] = await Promise.all([claudeCosts(monthStart, lastMonthStart), voicePlan(), siteUsage(monthStart)]);
  const money: Money = {
    updatedAt: now.toISOString(),
    month: monthStart.toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" }),
    daysSoFar: now.getUTCDate(),
    daysInMonth,
    budget: MONTHLY_BUDGET,
    claude,
    voice,
    usage,
    fixed: FIXED_COSTS,
    oneTime: ONE_TIME_COSTS,
  };
  cached = { at: Date.now(), money };
  return money;
}

// ---------- Claude: Anthropic's cost report (needs an Admin API key) ----------
type CostReport = {
  data: { starting_at: string; results: { amount: string; model: string | null }[] }[];
  has_more: boolean;
  next_page: string | null;
};

async function costReport(key: string, from: Date, to: Date) {
  const buckets: CostReport["data"] = [];
  let page: string | null = null;
  do {
    const q = new URLSearchParams({ starting_at: from.toISOString(), ending_at: to.toISOString(), limit: "31" });
    q.append("group_by[]", "description");
    if (page) q.set("page", page);
    const res = await fetch(`https://api.anthropic.com/v1/organizations/cost_report?${q}`, {
      headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "user-agent": "SwamiGPT-money/1.0" },
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) throw new Error(res.status === 401 || res.status === 403 ? "key" : `Anthropic ${res.status}`);
    const body = (await res.json()) as CostReport;
    buckets.push(...body.data);
    page = body.has_more ? body.next_page : null;
  } while (page);
  return buckets;
}

// Amounts come in cents, as decimal strings
const dollars = (cents: string) => Number(cents) / 100;

async function claudeCosts(monthStart: Date, lastMonthStart: Date): Promise<Money["claude"]> {
  const key = process.env.ANTHROPIC_ADMIN_KEY;
  if (!key) return { ok: false, problem: "Add ANTHROPIC_ADMIN_KEY (an Admin API key from the Claude Console) to Vercel." };
  try {
    const [thisMonth, lastMonth] = await Promise.all([
      costReport(key, monthStart, new Date()),
      costReport(key, lastMonthStart, monthStart),
    ]);
    const byModel = new Map<string, number>();
    const byDay = thisMonth.map((b) => {
      let total = 0;
      for (const r of b.results) {
        const d = dollars(r.amount);
        total += d;
        const m = r.model ?? "Other (tools)";
        byModel.set(m, (byModel.get(m) ?? 0) + d);
      }
      return { day: b.starting_at.slice(0, 10), dollars: total };
    });
    const sum = (bs: CostReport["data"]) => bs.reduce((t, b) => t + b.results.reduce((s, r) => s + dollars(r.amount), 0), 0);
    return {
      ok: true,
      monthToDate: sum(thisMonth),
      lastMonth: sum(lastMonth),
      byDay,
      byModel: [...byModel].map(([model, d]) => ({ model, dollars: d })).sort((a, b) => b.dollars - a.dollars),
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    return {
      ok: false,
      problem:
        msg === "key"
          ? "Anthropic refused the Admin key. Check ANTHROPIC_ADMIN_KEY in Vercel (it must be an Admin key, sk-ant-admin…)."
          : "Couldn't reach Anthropic's cost report just now.",
    };
  }
}

// ---------- Voice: the ElevenLabs plan ----------
async function voicePlan(): Promise<Money["voice"]> {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) return { ok: false, problem: "ELEVENLABS_API_KEY isn't set." };
  try {
    const res = await fetch("https://api.elevenlabs.io/v1/user/subscription", {
      headers: { "xi-api-key": key },
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
    if (res.status === 401 || res.status === 403) {
      return { ok: false, problem: "ElevenLabs refused. In ElevenLabs → API keys, give this key the “User: Read” permission." };
    }
    if (!res.ok) return { ok: false, problem: `ElevenLabs answered ${res.status}.` };
    const s = (await res.json()) as {
      tier: string;
      status: string;
      character_count: number;
      character_limit: number;
      next_character_count_reset_unix?: number | null;
      currency?: string | null;
      next_invoice?: { amount_due_cents?: number | null } | null;
    };
    return {
      ok: true,
      plan: s.tier,
      status: s.status,
      charactersUsed: s.character_count,
      characterLimit: s.character_limit,
      resetsAt: s.next_character_count_reset_unix ? new Date(s.next_character_count_reset_unix * 1000).toISOString() : null,
      nextBill: s.next_invoice?.amount_due_cents != null ? s.next_invoice.amount_due_cents / 100 : null,
      currency: (s.currency ?? "usd").toUpperCase(),
    };
  } catch {
    return { ok: false, problem: "Couldn't reach ElevenLabs just now." };
  }
}

// ---------- SwamiGPT's own counts ----------
async function siteUsage(monthStart: Date): Promise<Money["usage"]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secret) return { ok: false, problem: "Supabase keys aren't set." };
  const sb = createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });
  const since = new Date(Date.now() - 30 * 86400_000);
  const [questions, speech, users, plus, reports] = await Promise.all([
    sb.from("question_usage").select("day, count").eq("who", "site").gte("day", isoDay(since)),
    sb.from("speech_usage").select("day, chars").eq("who", "site").gte("day", isoDay(since)),
    sb.auth.admin.listUsers({ page: 1, perPage: 1 }),
    sb.from("plus_members").select("user_id", { count: "exact", head: true }),
    sb.from("answer_reports").select("id", { count: "exact", head: true }).eq("reviewed", false),
  ]);
  if (questions.error || speech.error) return { ok: false, problem: "Couldn't read the daily counts from Supabase." };
  const days = new Map<string, { questions: number; voiceChars: number }>();
  for (let t = since.getTime(); t <= Date.now(); t += 86400_000) days.set(isoDay(new Date(t)), { questions: 0, voiceChars: 0 });
  for (const r of questions.data) days.set(r.day, { ...(days.get(r.day) ?? { voiceChars: 0 }), questions: r.count });
  for (const r of speech.data) days.set(r.day, { ...(days.get(r.day) ?? { questions: 0 }), voiceChars: r.chars });
  const byDay = [...days].map(([day, v]) => ({ day, ...v })).sort((a, b) => a.day.localeCompare(b.day));
  const thisMonth = byDay.filter((d) => d.day >= isoDay(monthStart));
  const total = (users.data as { total?: number } | null)?.total;
  return {
    ok: true,
    byDay,
    questionsThisMonth: thisMonth.reduce((t, d) => t + d.questions, 0),
    voiceCharsThisMonth: thisMonth.reduce((t, d) => t + d.voiceChars, 0),
    accounts: typeof total === "number" ? total : null,
    plusMembers: plus.error ? null : plus.count,
    reportsToReview: reports.error ? null : reports.count,
  };
}
