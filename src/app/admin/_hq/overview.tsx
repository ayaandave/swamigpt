import type { Money } from "@/lib/money";
import type { Visits } from "@/lib/visits";
import type { AppStore } from "@/lib/hq/appstore";
import type { PlusNumbers } from "@/lib/hq/plus";
import type { People } from "@/lib/hq/people";
import type { Health } from "@/lib/hq/health";
import type { Load } from "./data";
import type { TikTokData } from "./tiktok";
import type { Todos } from "./health";
import { SERVICES } from "./links";
import { Tile } from "./launchpad";
import { BudgetBar, spend } from "./money";
import { Card, CardTitle, CountUp, Dot, fmt, Label, Metric, Skeleton, type Tone } from "./ui";

export type All = {
  money: Load<Money>;
  visits: Load<Visits>;
  appstore: Load<AppStore>;
  plus: Load<PlusNumbers>;
  people: Load<People>;
  health: Load<Health>;
  tiktok: Load<TikTokData>;
  todos: Load<Todos>;
};
export type SectionId = "overview" | "launch" | "money" | "growth" | "tiktok" | "users" | "health";

type Alert = { tone: Tone; text: string; go?: SectionId };

// Everything that needs the owner, most urgent first
export function alerts(d: All): Alert[] {
  const out: Alert[] = [];
  const h = d.health.data;
  for (const c of h?.checks ?? []) if (!c.ok) out.push({ tone: "bad", text: `${c.name}: ${c.detail}`, go: "health" });
  const m = d.money.data;
  if (m) {
    const s = spend(m);
    if (s.share >= 1) out.push({ tone: "bad", text: `Over budget: ${fmt.usd(s.total)} of ${fmt.usd0(m.budget)} this month`, go: "money" });
    else if (s.share >= 0.8) out.push({ tone: "warn", text: `${fmt.pct(s.share)} of the monthly budget used already`, go: "money" });
    else if (s.projected > m.budget) out.push({ tone: "warn", text: `On track to spend ${fmt.usd0(s.projected)}, over the ${fmt.usd0(m.budget)} budget`, go: "money" });
  }
  for (const r of h?.reminders ?? []) {
    if (!r.date) continue;
    const left = Math.ceil((new Date(r.date + "T00:00:00Z").getTime() - Date.now()) / 86400_000);
    if (left < 60) out.push({ tone: left < 30 ? "bad" : "warn", text: `${r.name} expires in ${left} days`, go: "health" });
  }
  const p = d.people.data;
  if (p?.ok && p.reportsToReview) out.push({ tone: "warn", text: `${p.reportsToReview} reported answer${p.reportsToReview === 1 ? "" : "s"} to review`, go: "users" });
  const t = d.tiktok.data;
  const lastTik = t?.ok ? t.snapshots.at(-1) : undefined;
  if (t?.ok && (!lastTik || Date.now() - new Date(lastTik.day).getTime() > 9 * 86400_000)) {
    out.push({ tone: "warn", text: lastTik ? `TikTok numbers are from ${fmt.day(lastTik.day)}: the Sunday task may not have run` : "No TikTok numbers saved yet", go: "tiktok" });
  }
  const missing = h?.setup.filter((s) => !s.done).length ?? 0;
  if (missing) out.push({ tone: "idle", text: `${missing} dashboard key${missing === 1 ? "" : "s"} still to add`, go: "health" });
  return out;
}

const hello = () => {
  const h = new Date().getHours();
  return h < 5 ? "Good night" : h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
};

export function Overview({ d, go }: { d: All; go: (s: SectionId) => void }) {
  const list = alerts(d);
  const m = d.money.data;
  const v = d.visits.data;
  const a = d.appstore.data;
  const p = d.people.data;
  const t = d.tiktok.data;
  const plus = d.plus.data;
  const h = d.health.data;
  const allGood = h ? h.checks.every((c) => c.ok) : null;
  const snaps = t?.ok ? t.snapshots : [];
  const up = p?.ok ? p.byDay.reduce((s, x) => s + x.up, 0) : 0;
  const down = p?.ok ? p.byDay.reduce((s, x) => s + x.down, 0) : 0;
  const todos = d.todos.data?.ok ? d.todos.data.todos.filter((x) => !x.done) : [];

  return (
    <>
      {/* Greeting + live status */}
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[13px] text-(--hq-dim)">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
          <h1 className="mt-1 text-[32px] font-semibold tracking-[-0.035em] sm:text-[40px]">
            {hello()}. <span className="hq-gold-text">Here&apos;s SwamiGPT.</span>
          </h1>
        </div>
        <button
          type="button"
          onClick={() => go("health")}
          className="flex min-h-10 items-center gap-2.5 rounded-full border border-(--hq-line) bg-white/[0.02] px-4 text-[13px] font-medium hover:border-(--hq-line-hi)"
        >
          <Dot tone={allGood == null ? "idle" : allGood ? "good" : "bad"} pulse={!!allGood} />
          {allGood == null ? "Checking…" : allGood ? "All systems working" : `${h!.checks.filter((c) => !c.ok).length} problem${h!.checks.filter((c) => !c.ok).length === 1 ? "" : "s"}`}
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Money */}
        <button type="button" onClick={() => go("money")} className="hq-card hq-card-link hq-rise p-6 text-left lg:col-span-2">
          {m ? (
            <>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Label>Spent in {m.month.split(" ")[0]}</Label>
                  <p className="hq-gold-text mt-2 text-[52px] font-semibold leading-none tracking-[-0.04em] sm:text-[64px]">
                    <CountUp value={spend(m).total} format={fmt.usd} />
                  </p>
                </div>
                <div className="text-right text-[13px] text-(--hq-dim)">
                  <p>Budget</p>
                  <p className="text-[20px] font-semibold text-(--hq-text)">{fmt.usd0(m.budget)}</p>
                </div>
              </div>
              <div className="mt-6">
                <BudgetBar m={m} />
              </div>
            </>
          ) : (
            <Skeleton h={150} />
          )}
        </button>

        {/* Needs attention */}
        <Card delay={60}>
          <CardTitle right={<span className="text-[12px] text-(--hq-dim)">{list.length || ""}</span>}>Needs you</CardTitle>
          {list.length === 0 ? (
            <div className="grid h-[120px] place-items-center text-center">
              <p className="text-[14px] text-(--hq-dim)">
                <span className="mb-1 block text-[24px]">🪔</span>
                Nothing needs you right now.
              </p>
            </div>
          ) : (
            <ul className="space-y-1.5">
              {list.slice(0, 6).map((x, i) => (
                <li key={i}>
                  <button type="button" onClick={() => x.go && go(x.go)} className="flex w-full items-start gap-2.5 rounded-lg px-2 py-1.5 text-left text-[13px] hover:bg-white/[0.03]">
                    <span className="mt-1.5">
                      <Dot tone={x.tone} />
                    </span>
                    <span>{x.text}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* The six numbers */}
      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <Metric
          label="Visitors · 30d"
          value={v?.ok ? v.visitors : null}
          series={v?.ok ? v.byDay.map((x) => x.visitors) : undefined}
          sub={v && !v.ok ? "Needs the Vercel token" : "swamigpt.com"}
          onClick={() => go("growth")}
          delay={80}
        />
        <Metric
          label="Downloads · 30d"
          value={a?.sales.ok ? a.sales.downloads30 : null}
          series={a?.sales.ok ? a.sales.byDay.map((x) => x.downloads) : undefined}
          color="var(--hq-sky)"
          sub={a && !a.sales.ok ? "Needs the App Store key" : "iPhone app"}
          onClick={() => go("growth")}
          delay={110}
        />
        <Metric
          label="TikTok followers"
          value={snaps.at(-1)?.followers ?? null}
          format={fmt.compact}
          series={snaps.length > 1 ? snaps.map((s) => s.followers) : undefined}
          color="var(--hq-rose)"
          sub={snaps.at(-1) ? `As of ${fmt.day(snaps.at(-1)!.day)}` : "No check yet"}
          onClick={() => go("tiktok")}
          delay={140}
        />
        <Metric
          label="Questions · 30d"
          value={p?.ok ? p.byDay.reduce((s, x) => s + x.questions, 0) : null}
          series={p?.ok ? p.byDay.map((x) => x.questions) : undefined}
          color="var(--hq-teal)"
          sub={p?.ok ? `${fmt.int(p.accounts)} accounts` : undefined}
          onClick={() => go("users")}
          delay={170}
        />
        <Metric
          label="Plus members"
          value={plus?.members.ok ? plus.members.total : null}
          sub={plus?.revenuecat.ok ? `MRR ${fmt.usd(plus.revenuecat.metrics.find((x) => x.id === "mrr")?.value ?? 0)}` : "Paying subscribers"}
          onClick={() => go("growth")}
          delay={200}
        />
        <Metric
          label="Helpful answers"
          value={up + down ? up / (up + down) : null}
          format={fmt.pct}
          sub={up + down ? `👍 ${up} · 👎 ${down} in 30 days` : "No ratings yet"}
          onClick={() => go("users")}
          delay={230}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {/* Quick open */}
        <Card className="lg:col-span-2" delay={260}>
          <CardTitle
            right={
              <button type="button" onClick={() => go("launch")} className="text-[13px] font-semibold text-(--hq-gold-hi) hover:underline">
                All services →
              </button>
            }
          >
            Quick open
          </CardTitle>
          <ul className="grid grid-cols-4 gap-2 sm:grid-cols-7">
            {SERVICES.slice(0, 14).map((s) => (
              <li key={s.id}>
                <a href={s.href} target="_blank" rel="noreferrer" title={s.name} className="group flex flex-col items-center gap-1.5 rounded-xl p-2 hover:bg-white/[0.03]">
                  <span className="transition group-hover:scale-110">
                    <Tile s={s} size={42} />
                  </span>
                  <span className="w-full truncate text-center text-[11px] text-(--hq-dim) group-hover:text-(--hq-text)">{s.name.replace("App Store Connect", "Connect")}</span>
                </a>
              </li>
            ))}
          </ul>
        </Card>

        {/* Next up */}
        <Card delay={290}>
          <CardTitle
            right={
              <button type="button" onClick={() => go("health")} className="text-[13px] font-semibold text-(--hq-gold-hi) hover:underline">
                All →
              </button>
            }
          >
            Next up
          </CardTitle>
          {todos.length === 0 ? (
            <p className="text-[14px] text-(--hq-dim)">{d.todos.data ? "All done. 🙏" : "Loading…"}</p>
          ) : (
            <ul className="space-y-2">
              {todos.slice(0, 4).map((x) => (
                <li key={x.id} className="flex items-start gap-2.5 text-[14px]">
                  <button
                    type="button"
                    aria-label={`Mark “${x.title}” done`}
                    onClick={() => void d.todos.send("PATCH", { id: x.id, done: true })}
                    className="mt-0.5 size-4 shrink-0 rounded-[5px] border border-(--hq-line-hi) hover:border-(--hq-gold)"
                  />
                  <span>{x.title}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
