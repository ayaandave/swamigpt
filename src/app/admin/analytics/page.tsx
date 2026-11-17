"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { Slice, Visits } from "@/lib/visits";
import { accessToken, useAuth } from "@/lib/supabase";
import { Bars, OwnerTabs, Stat } from "../parts";

const short = (iso: string) => new Date(iso + "T00:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
const REFRESH_MS = 5 * 60 * 1000;

// Plain names for the site's pages
const PAGES: Record<string, string> = {
  "/": "Home",
  "/ask": "Ask",
  "/today": "Today's verse",
  "/saved": "Saved verses",
  "/read": "Scripture library",
  "/read/[text]": "A scripture",
  "/read/[text]/[section]": "A scripture chapter",
  "/read/[text]/[section]/[number]": "Reading a verse",
  "/v/[id]": "A shared verse",
  "/learn": "Learn",
  "/learn/[slug]": "A course",
  "/learn/[slug]/[lesson]": "A lesson",
  "/meditate": "Meditate",
  "/login": "Sign in",
  "/settings": "Settings",
  "/account": "Account",
  "/plus": "Plus",
  "/privacy": "Privacy",
  "/sources": "Sources",
};
const DEVICES: Record<string, string> = { desktop: "Laptop or desktop", mobile: "Phone", tablet: "Tablet" };
// What people do, in the order they usually do it
const EVENTS: [string, string][] = [
  ["onboarding_step_viewed", "Saw the welcome steps"],
  ["onboarding_completed", "Finished the welcome"],
  ["chat_sent", "Asked a question"],
  ["first_answer_completed", "Got their first answer"],
  ["answer_rated", "Rated an answer 👍/👎"],
  ["verse_saved", "Saved a verse"],
  ["paywall_viewed", "Saw the Plus offer"],
  ["paywall_dismissed", "Closed the Plus offer"],
];

let regions: Intl.DisplayNames | null = null;
function countryName(code: string) {
  if (code === "Others") return "Other countries";
  if (!code) return "Unknown";
  try {
    regions ??= new Intl.DisplayNames(["en"], { type: "region" });
    return regions.of(code) ?? code;
  } catch {
    return code;
  }
}
const others = (name: string, fallback: (n: string) => string) => (name === "Others" ? "Everything else" : fallback(name));

// The owner's visitor numbers, read live from Vercel Web Analytics. Only the owner's account can load it
export default function AnalyticsPage() {
  const { ready, user } = useAuth();
  const [days, setDays] = useState<7 | 30>(30);
  const [visits, setVisits] = useState<Visits | null>(null);
  const [state, setState] = useState<"loading" | "ok" | "denied" | "failed">("loading");

  const load = useCallback(async (d: 7 | 30) => {
    const token = await accessToken();
    if (!token) return setState("denied");
    const res = await fetch(`/api/admin/analytics?days=${d}`, { headers: { authorization: `Bearer ${token}` } }).catch(() => null);
    if (!res) return setState("failed");
    if (res.status === 404) return setState("denied");
    if (!res.ok) return setState("failed");
    setVisits(await res.json());
    setState("ok");
  }, []);

  // Updates by itself every five minutes while the page is open
  useEffect(() => {
    if (!ready || !user) return;
    void load(days); // eslint-disable-line react-hooks/set-state-in-effect -- loading data for the signed-in owner
    const t = setInterval(() => void load(days), REFRESH_MS);
    return () => clearInterval(t);
  }, [ready, user, load, days]);

  if (!ready) return <div className="min-h-[60vh]" />;
  if (!user || state === "denied") {
    return (
      <div className="pt-16 text-center">
        <h1 className="font-display text-[1.5rem]">Page not found</h1>
        <Link href="/" className="mt-4 inline-flex min-h-11 items-center font-semibold text-kesar-deep underline underline-offset-4">
          Go home
        </Link>
      </div>
    );
  }
  if (!visits) {
    return <p className="pt-16 text-center text-kajal-soft">{state === "failed" ? "Couldn't load the numbers. Try again in a minute." : "Counting visitors…"}</p>;
  }

  return (
    <div className="pt-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <OwnerTabs />
          <h1 className="mt-1 font-display text-[1.75rem] leading-tight">Visitors</h1>
        </div>
        <div className="flex gap-2" role="group" aria-label="Time range">
          {([7, 30] as const).map((d) => (
            <button
              key={d}
              type="button"
              aria-pressed={days === d}
              onClick={() => setDays(d)}
              className={`min-h-11 rounded-xl border px-4 text-[0.95rem] font-semibold ${
                days === d ? "border-kesar-deep bg-sandal-deep text-kesar-deep" : "border-sandal-edge hover:border-kajal"
              }`}
            >
              {d} days
            </button>
          ))}
          <button
            type="button"
            onClick={() => void load(days)}
            className="min-h-11 rounded-xl border border-sandal-edge px-4 text-[0.95rem] font-semibold hover:border-kajal"
          >
            Refresh
          </button>
        </div>
      </div>

      {!visits.ok ? (
        <p className="mt-6 text-kumkum">{visits.problem}</p>
      ) : (
        <>
          <p className="mt-1 text-[0.9rem] text-kajal-soft">
            Last {visits.days} days · updated {new Date(visits.updatedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}. Counts
            the live site and the iPhone app, without cookies. Your own devices are left out.
          </p>

          <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
            <Stat label="Visitors" value={visits.visitors.toLocaleString()} />
            <Stat label="Page views" value={visits.pageviews.toLocaleString()} />
            <Stat label="Pages per visitor" value={visits.visitors ? (visits.pageviews / visits.visitors).toFixed(1) : "—"} />
            <Stat
              label="From Google"
              value={visits.referrers
                .filter((r) => r.name.startsWith("google."))
                .reduce((t, r) => t + r.visitors, 0)
                .toLocaleString()}
            />
          </dl>

          <section aria-labelledby="by-day" className="mt-12">
            <h2 id="by-day" className="font-display text-[1.3rem]">Visitors by day</h2>
            <Bars
              points={visits.byDay.map((d) => ({ label: short(d.day), value: d.visitors }))}
              format={(n) => `${n} visitor${n === 1 ? "" : "s"}`}
              colorClass="fill-kesar"
              empty="No visitors yet in this time."
            />
          </section>

          <div className="mt-6 grid gap-x-10 md:grid-cols-2">
            <TopList title="Where they live" items={visits.countries} name={countryName} />
            <TopList title="How they found SwamiGPT" items={visits.referrers} name={(n) => others(n, (h) => h || "Typed it in or a saved link")} />
            <TopList title="Pages they visit" items={visits.pages} name={(n) => others(n, (p) => PAGES[p] ?? p)} showViews />
            <TopList title="Phone or computer" items={visits.devices} name={(n) => DEVICES[n] ?? (n || "Unknown")} />
            <TopList title="System and browser" items={visits.systems} name={(n) => others(n, (s) => s || "Unknown")} />
          </div>

          <section aria-labelledby="doing" className="mt-12">
            <h2 id="doing" className="font-display text-[1.3rem]">What people do</h2>
            <p className="mt-1 text-[0.95rem] text-kajal-soft">How many people did each step at least once (and how many times in all).</p>
            <ul className="mt-3 border-t border-sandal-edge">
              {EVENTS.map(([key, label]) => {
                const e = visits.events.find((x) => x.name === key);
                return (
                  <li key={key} className="flex items-baseline justify-between gap-4 border-b border-sandal-edge py-3">
                    <span>{label}</span>
                    <span className="shrink-0 tabular-nums">
                      <strong className="font-display text-[1.2rem]">{e?.visitors ?? 0}</strong>
                      <span className="text-[0.9rem] text-kajal-soft"> {e?.visitors === 1 ? "person" : "people"} · {e?.count ?? 0}×</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>

          <p className="mt-10 text-[0.9rem] text-kajal-soft">
            Not counted: any device where you&apos;ve signed in to this account, and automated test browsers. To leave out another device (a
            family phone, a test browser), open <strong>swamigpt.com/?nocount=1</strong> on it once. <strong>?nocount=0</strong> counts it again.
          </p>
        </>
      )}
    </div>
  );
}

// One "top 8" list with thin bars sized by visitors
function TopList({ title, items, name, showViews }: { title: string; items: Slice[]; name: (n: string) => string; showViews?: boolean }) {
  const max = Math.max(1, ...items.map((i) => i.visitors));
  return (
    <section className="mt-10">
      <h2 className="font-display text-[1.3rem]">{title}</h2>
      {items.length === 0 ? (
        <p className="mt-2 text-kajal-soft">Nothing yet.</p>
      ) : (
        <ul className="mt-3">
          {items.map((i) => (
            <li key={i.name} className="py-1.5">
              <div className="flex items-baseline justify-between gap-3">
                <span className="min-w-0 truncate">{name(i.name)}</span>
                <span className="shrink-0 tabular-nums">
                  <strong>{i.visitors.toLocaleString()}</strong>
                  {showViews && <span className="text-[0.85rem] text-kajal-soft"> · {i.pageviews.toLocaleString()} views</span>}
                </span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-sandal-deep" aria-hidden="true">
                <div className="h-full rounded-full bg-kesar" style={{ width: `${(i.visitors / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
