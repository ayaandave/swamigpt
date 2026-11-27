import { useState } from "react";
import type { Visits } from "@/lib/visits";
import type { AppStore } from "@/lib/hq/appstore";
import type { PlusNumbers } from "@/lib/hq/plus";
import type { Load } from "./data";
import { Loading, Mini } from "./money";
import { BarList, Card, CardTitle, Chart, CountUp, fmt, Label, plural, Problem, SectionTitle, Setup } from "./ui";

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
  "/s/[id]": "A shared answer",
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
const STEPS: [string, string][] = [
  ["onboarding_completed", "Finished the welcome"],
  ["chat_sent", "Asked a question"],
  ["first_answer_completed", "Got their first answer"],
  ["answer_rated", "Rated an answer"],
  ["verse_saved", "Saved a verse"],
  ["paywall_viewed", "Saw the Plus offer"],
];

let regions: Intl.DisplayNames | null = null;
export function countryName(code: string) {
  if (code === "Others") return "Other countries";
  if (!code) return "Unknown";
  try {
    regions ??= new Intl.DisplayNames(["en"], { type: "region" });
    return regions.of(code) ?? code;
  } catch {
    return code;
  }
}
const named = (name: string, map: Record<string, string>) => (name === "Others" ? "Everything else" : (map[name] ?? (name || "Direct / unknown")));

type Tab = "web" | "app" | "plus";

export function GrowthSection({ visits, appstore, plus }: { visits: Load<Visits>; appstore: Load<AppStore>; plus: Load<PlusNumbers> }) {
  const [tab, setTab] = useState<Tab>("web");
  const tabs: [Tab, string][] = [
    ["web", "Website"],
    ["app", "App Store"],
    ["plus", "Plus"],
  ];
  return (
    <>
      <SectionTitle
        title="Growth"
        sub="Who finds SwamiGPT, and where they come from"
        right={
          <div role="tablist" className="flex rounded-full border border-(--hq-line) bg-white/[0.02] p-1">
            {tabs.map(([id, label]) => (
              <button
                key={id}
                role="tab"
                aria-selected={tab === id}
                type="button"
                onClick={() => setTab(id)}
                className={`min-h-9 rounded-full px-4 text-[13px] font-semibold transition ${tab === id ? "bg-(--hq-gold) text-black" : "text-(--hq-dim) hover:text-(--hq-text)"}`}
              >
                {label}
              </button>
            ))}
          </div>
        }
      />
      {tab === "web" && <Web visits={visits} />}
      {tab === "app" && <App appstore={appstore} />}
      {tab === "plus" && <PlusTab plus={plus} />}
    </>
  );
}

function Web({ visits }: { visits: Load<Visits> }) {
  const v = visits.data;
  if (!v) return <Loading load={visits} />;
  if (!v.ok) return <Setup>{v.problem}</Setup>;
  const funnel = STEPS.map(([id, label]) => ({ name: label, value: v.events.find((e) => e.name === id)?.visitors ?? 0 }));
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <div className="mb-5 grid grid-cols-3 gap-4">
          <div>
            <Label>Visitors · 30 days</Label>
            <p className="mt-1 text-[34px] font-semibold leading-none tracking-[-0.03em]">
              <CountUp value={v.visitors} />
            </p>
          </div>
          <Mini label="Page views" value={fmt.int(v.pageviews)} />
          <Mini label="Pages per visitor" value={v.visitors ? (v.pageviews / v.visitors).toFixed(1) : "—"} />
        </div>
        <Chart points={v.byDay.map((d) => ({ label: fmt.day(d.day), value: d.visitors }))} format={(n) => plural(n, "visitor")} empty="No visitors yet." />
      </Card>
      <Card delay={60}>
        <CardTitle>What visitors do</CardTitle>
        <BarList items={funnel} color="var(--hq-teal)" empty="No actions recorded yet." />
      </Card>
      <Card delay={120}>
        <CardTitle>Where they come from</CardTitle>
        <BarList items={v.referrers.map((r) => ({ name: named(r.name, {}), value: r.visitors }))} color="var(--hq-sky)" />
      </Card>
      <Card delay={160}>
        <CardTitle>Countries</CardTitle>
        <BarList items={v.countries.map((c) => ({ name: countryName(c.name), value: c.visitors }))} />
      </Card>
      <Card delay={200}>
        <CardTitle>Top pages</CardTitle>
        <BarList items={v.pages.map((p) => ({ name: named(p.name, PAGES), value: p.pageviews }))} color="var(--hq-rose)" />
      </Card>
      <Card className="lg:col-span-3" delay={240}>
        <CardTitle>Devices</CardTitle>
        <div className="grid gap-6 sm:grid-cols-2">
          <BarList items={v.devices.map((d) => ({ name: named(d.name, DEVICES), value: d.visitors }))} color="var(--hq-teal)" />
          <BarList items={v.systems.map((d) => ({ name: d.name === "Others" ? "Everything else" : d.name, value: d.visitors }))} color="var(--hq-sky)" />
        </div>
      </Card>
    </div>
  );
}

function Stars({ n }: { n: number }) {
  return (
    <span aria-label={`${n} stars`} className="text-[13px] tracking-[0.1em] text-(--hq-gold)">
      {"★★★★★".slice(0, Math.round(n))}
      <span className="text-(--hq-faint)">{"★★★★★".slice(Math.round(n))}</span>
    </span>
  );
}

function App({ appstore }: { appstore: Load<AppStore> }) {
  const a = appstore.data;
  if (!a) return <Loading load={appstore} />;
  const { store, sales } = a;
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        {sales.ok ? (
          <>
            <div className="mb-5 grid grid-cols-3 gap-4">
              <div>
                <Label>Downloads · 30 days</Label>
                <p className="mt-1 text-[34px] font-semibold leading-none tracking-[-0.03em]">
                  <CountUp value={sales.downloads30} />
                </p>
              </div>
              <Mini label="Plus purchases" value={fmt.int(sales.plus30)} />
              <Mini label="Apple pays you (USD)" value={fmt.usd(sales.proceedsUsd30)} />
            </div>
            <Chart kind="bars" color="var(--hq-sky)" points={sales.byDay.map((d) => ({ label: fmt.day(d.day), value: d.downloads }))} format={(n) => plural(n, "download")} empty="No downloads in the last 30 days." />
            <p className="mt-3 text-[12px] text-(--hq-faint)">Apple publishes each day&apos;s numbers the next morning.</p>
          </>
        ) : sales.setup ? (
          <>
            <CardTitle>Downloads and sales</CardTitle>
            <Setup>{sales.problem} The steps are on the Health page.</Setup>
          </>
        ) : (
          <Problem>{sales.problem}</Problem>
        )}
      </Card>
      <Card delay={60}>
        <CardTitle right={store.ok ? <a href={store.url} target="_blank" rel="noreferrer" className="text-[13px] font-semibold text-(--hq-gold-hi) hover:underline">Open ↗</a> : null}>App Store page</CardTitle>
        {store.ok ? (
          <>
            <p className="text-[44px] font-semibold leading-none tracking-[-0.03em]">{store.rating ? store.rating.toFixed(1) : "—"}</p>
            <div className="mt-2">
              <Stars n={store.rating ?? 0} />
            </div>
            <p className="mt-1 text-[13px] text-(--hq-dim)">
              {store.ratings === 0 ? "No ratings yet" : `${fmt.int(store.ratings)} rating${store.ratings === 1 ? "" : "s"}`} · version {store.version}
            </p>
            {store.updated && <p className="mt-1 text-[12px] text-(--hq-faint)">Live since {fmt.day(store.updated)}</p>}
          </>
        ) : (
          <Problem>{store.problem}</Problem>
        )}
      </Card>
      {sales.ok && (
        <Card delay={120}>
          <CardTitle>Downloads by country</CardTitle>
          <BarList items={sales.countries.map((c) => ({ name: countryName(c.code), value: c.downloads }))} color="var(--hq-sky)" />
        </Card>
      )}
      <Card className={sales.ok ? "lg:col-span-2" : "lg:col-span-3"} delay={160}>
        <CardTitle>Latest reviews</CardTitle>
        {store.ok && store.reviews.length ? (
          <ul className="grid gap-3 sm:grid-cols-2">
            {store.reviews.map((r, i) => (
              <li key={i} className="rounded-xl border border-(--hq-line) p-4">
                <div className="flex items-center justify-between gap-2">
                  <Stars n={r.stars} />
                  <span className="text-[11px] text-(--hq-faint)">{r.date ? fmt.day(r.date) : ""} · v{r.version}</span>
                </div>
                <p className="mt-2 text-[14px] font-semibold">{r.title}</p>
                <p className="mt-1 line-clamp-3 text-[13px] text-(--hq-dim)">{r.text}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[14px] text-(--hq-dim)">No written reviews in the US store yet. An in-app rating prompt (on the to-do list) would help.</p>
        )}
      </Card>
    </div>
  );
}

const STORE: Record<string, string> = { app_store: "iPhone (App Store)", stripe: "Web (Stripe)", play_store: "Android", promotional: "Gifted", other: "Other" };

function PlusTab({ plus }: { plus: Load<PlusNumbers> }) {
  const p = plus.data;
  if (!p) return <Loading load={plus} />;
  const { revenuecat: rc, members } = p;
  const pick = (id: string) => (rc.ok ? rc.metrics.find((m) => m.id === id) : undefined);
  const money = (m?: { value: number; unit: string }) => (m ? (m.unit === "$" || m.unit === "USD" || m.unit.includes("$") ? fmt.usd(m.value) : fmt.int(m.value)) : "—");
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card>
        <Label>Plus members now</Label>
        <p className="hq-gold-text mt-2 text-[56px] font-semibold leading-none tracking-[-0.04em]">{members.ok ? <CountUp value={members.total} /> : "—"}</p>
        <p className="mt-2 text-[13px] text-(--hq-dim)">From SwamiGPT&apos;s own list, kept in step with RevenueCat.</p>
      </Card>
      <Card delay={60}>
        <CardTitle>Where they pay</CardTitle>
        {members.ok ? <BarList items={members.byStore.map((s) => ({ name: STORE[s.store] ?? s.store, value: s.count }))} empty="No Plus members yet." /> : <Problem>{members.problem}</Problem>}
      </Card>
      <Card delay={120}>
        <CardTitle>RevenueCat</CardTitle>
        {rc.ok ? (
          <div className="grid grid-cols-2 gap-4">
            <Mini label="Monthly revenue" value={money(pick("mrr"))} />
            <Mini label="Revenue (28 days)" value={money(pick("revenue"))} />
            <Mini label="Active subscriptions" value={money(pick("active_subscriptions"))} />
            <Mini label="Free trials" value={money(pick("active_trials"))} />
            <Mini label="New customers" value={money(pick("new_customers"))} />
            <Mini label="Active users" value={money(pick("active_users"))} />
          </div>
        ) : rc.setup ? (
          <Setup>{rc.problem}</Setup>
        ) : (
          <Problem>{rc.problem}</Problem>
        )}
      </Card>
    </div>
  );
}
