// App Store numbers for SwamiGPT HQ. Two sources:
//   1. Apple's public store data (no key): star rating, number of ratings, live version, latest reviews.
//   2. App Store Connect sales reports (needs an API key): downloads and Plus purchases per day.
// Server only. The key (ASC_PRIVATE_KEY) never leaves the server.
import "server-only";
import { createPrivateKey, sign } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { APP_STORE_ID } from "@/lib/seo";
import { cached, lastDays } from "./db";

export type AppStore = {
  store:
    | {
        ok: true;
        version: string;
        rating: number | null; // average stars, 1-5
        ratings: number; // how many ratings
        updated: string | null; // when the live version came out
        url: string;
        reviews: { title: string; text: string; stars: number; author: string; version: string; date: string | null }[];
      }
    | { ok: false; problem: string };
  sales:
    | {
        ok: true;
        byDay: { day: string; downloads: number; redownloads: number; plus: number }[];
        downloads30: number;
        plus30: number;
        proceedsUsd30: number; // what Apple pays out, USD sales only
        countries: { code: string; downloads: number }[];
      }
    | { ok: false; problem: string; setup?: boolean };
};

// ---------- 1. Public store data ----------
async function storeData(): Promise<AppStore["store"]> {
  try {
    const [lookup, rss] = await Promise.all([
      fetch(`https://itunes.apple.com/lookup?id=${APP_STORE_ID}&country=us`, { cache: "no-store", signal: AbortSignal.timeout(10000) }),
      fetch(`https://itunes.apple.com/us/rss/customerreviews/id=${APP_STORE_ID}/sortBy=mostRecent/json`, {
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      }).catch(() => null),
    ]);
    if (!lookup.ok) return { ok: false, problem: `The App Store answered ${lookup.status}.` };
    const info = ((await lookup.json()) as { results?: Record<string, unknown>[] }).results?.[0];
    if (!info) return { ok: false, problem: "The App Store doesn't list SwamiGPT right now." };
    type Entry = Record<string, { label?: string } | { name?: { label?: string } } | undefined>;
    const feed = rss?.ok ? ((await rss.json().catch(() => null)) as { feed?: { entry?: Entry[] | Entry } } | null) : null;
    const entries = [feed?.feed?.entry ?? []].flat().filter((e) => e && "im:rating" in e);
    const label = (e: Entry, k: string) => (e[k] as { label?: string } | undefined)?.label ?? "";
    return {
      ok: true,
      version: String(info.version ?? ""),
      rating: typeof info.averageUserRating === "number" ? info.averageUserRating : null,
      ratings: Number(info.userRatingCount ?? 0),
      updated: typeof info.currentVersionReleaseDate === "string" ? info.currentVersionReleaseDate : null,
      url: String(info.trackViewUrl ?? `https://apps.apple.com/app/id${APP_STORE_ID}`),
      reviews: entries.slice(0, 5).map((e) => ({
        title: label(e, "title"),
        text: label(e, "content"),
        stars: Number(label(e, "im:rating")) || 0,
        author: (e.author as { name?: { label?: string } } | undefined)?.name?.label ?? "",
        version: label(e, "im:version"),
        date: label(e, "updated") || null,
      })),
    };
  } catch {
    return { ok: false, problem: "Couldn't reach the App Store just now." };
  }
}

// ---------- 2. App Store Connect sales reports ----------
function ascToken(): string | null {
  const kid = process.env.ASC_KEY_ID;
  const iss = process.env.ASC_ISSUER_ID;
  const pem = process.env.ASC_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!kid || !iss || !pem) return null;
  const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const now = Math.floor(Date.now() / 1000);
  const body = `${b64({ alg: "ES256", kid, typ: "JWT" })}.${b64({ iss, iat: now, exp: now + 15 * 60, aud: "appstoreconnect-v1" })}`;
  const sig = sign("sha256", Buffer.from(body), { key: createPrivateKey(pem), dsaEncoding: "ieee-p1363" });
  return `${body}.${sig.toString("base64url")}`;
}

type DayRows = { downloads: number; redownloads: number; plus: number; proceedsUsd: number; countries: Map<string, number> };
// Past days never change once Apple has published them, so they're kept for the life of the server
const dayCache = new Map<string, DayRows>();

// Apple's product type codes: 1/1F/1T first downloads, 3/3F/3T downloads again, 7s are updates,
// IAY/IA1/IA9 in-app purchases and subscriptions (Plus)
const FIRST = new Set(["1", "1F", "1T", "F1"]);
const AGAIN = new Set(["3", "3F", "3T", "F3"]);
const PLUS = new Set(["IAY", "IA1", "IA9", "FI1"]);

export function parseSalesReport(tsv: string): DayRows {
  const [head, ...lines] = tsv.trim().split("\n");
  const cols = head.split("\t");
  const at = (name: string) => cols.indexOf(name);
  const [type, units, proceeds, currency, country] = [
    at("Product Type Identifier"),
    at("Units"),
    at("Developer Proceeds"),
    at("Currency of Proceeds"),
    at("Country Code"),
  ];
  const out: DayRows = { downloads: 0, redownloads: 0, plus: 0, proceedsUsd: 0, countries: new Map() };
  for (const line of lines) {
    const c = line.split("\t");
    const n = Number(c[units]) || 0;
    const t = c[type];
    if (FIRST.has(t)) {
      out.downloads += n;
      out.countries.set(c[country], (out.countries.get(c[country]) ?? 0) + n);
    } else if (AGAIN.has(t)) out.redownloads += n;
    else if (PLUS.has(t)) {
      out.plus += n;
      if (c[currency] === "USD") out.proceedsUsd += n * (Number(c[proceeds]) || 0);
    }
  }
  return out;
}

async function salesDay(token: string, vendor: string, day: string): Promise<DayRows | "missing"> {
  const hit = dayCache.get(day);
  if (hit) return hit;
  const q = new URLSearchParams({
    "filter[frequency]": "DAILY",
    "filter[reportType]": "SALES",
    "filter[reportSubType]": "SUMMARY",
    "filter[vendorNumber]": vendor,
    "filter[reportDate]": day,
    "filter[version]": "1_1",
  });
  const res = await fetch(`https://api.appstoreconnect.apple.com/v1/salesReports?${q}`, {
    headers: { authorization: `Bearer ${token}`, accept: "application/a-gzip" },
    cache: "no-store",
    signal: AbortSignal.timeout(20000),
  });
  if (res.status === 401 || res.status === 403) throw new Error("key");
  // 404: Apple has no report for that day (nothing sold, or not published yet)
  if (res.status === 404) return "missing";
  if (!res.ok) throw new Error(`Apple ${res.status}`);
  const rows = parseSalesReport(gunzipSync(Buffer.from(await res.arrayBuffer())).toString("utf8"));
  dayCache.set(day, rows);
  return rows;
}

async function salesData(): Promise<AppStore["sales"]> {
  const vendor = process.env.ASC_VENDOR_NUMBER;
  let token: string | null;
  try {
    token = ascToken();
  } catch {
    return { ok: false, problem: "ASC_PRIVATE_KEY isn't a valid .p8 key. Paste the whole file, including the BEGIN and END lines." };
  }
  if (!token || !vendor) {
    return {
      ok: false,
      setup: true,
      problem: "Downloads and Plus sales show up once the App Store Connect key is added (ASC_KEY_ID, ASC_ISSUER_ID, ASC_PRIVATE_KEY, ASC_VENDOR_NUMBER).",
    };
  }
  // Apple publishes a day's report the next morning, so the last 30 days end yesterday
  const days = lastDays(31).slice(0, 30);
  try {
    const results = await Promise.all(days.map((d) => salesDay(token, vendor, d)));
    const countries = new Map<string, number>();
    let proceedsUsd30 = 0;
    const byDay = days.map((day, i) => {
      const r = results[i];
      if (r === "missing") return { day, downloads: 0, redownloads: 0, plus: 0 };
      proceedsUsd30 += r.proceedsUsd;
      for (const [c, n] of r.countries) countries.set(c, (countries.get(c) ?? 0) + n);
      return { day, downloads: r.downloads, redownloads: r.redownloads, plus: r.plus };
    });
    return {
      ok: true,
      byDay,
      downloads30: byDay.reduce((t, d) => t + d.downloads, 0),
      plus30: byDay.reduce((t, d) => t + d.plus, 0),
      proceedsUsd30,
      countries: [...countries]
        .map(([code, downloads]) => ({ code, downloads }))
        .sort((a, b) => b.downloads - a.downloads)
        .slice(0, 8),
    };
  } catch (e) {
    const key = e instanceof Error && e.message === "key";
    return {
      ok: false,
      problem: key
        ? "Apple refused the App Store Connect key. Check it has the Sales (or Finance/Admin) role and the IDs match."
        : "Couldn't read the sales reports from App Store Connect just now.",
    };
  }
}

export const getAppStore = cached(30 * 60 * 1000, async (): Promise<AppStore> => {
  const [store, sales] = await Promise.all([storeData(), salesData()]);
  return { store, sales };
});
