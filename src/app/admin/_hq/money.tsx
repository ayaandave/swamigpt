import type { Money } from "@/lib/money";
import type { Load } from "./data";
import { BarList, Card, CardTitle, Chart, CountUp, fmt, Label, Pill, Problem, Skeleton, SectionTitle, type Tone } from "./ui";

// This month's spending, worked out the same way everywhere on HQ
export function spend(m: Money) {
  const claude = m.claude.ok ? m.claude.monthToDate : 0;
  const voice = m.voice.ok && m.voice.nextBill != null ? m.voice.nextBill : 0;
  const fixed = m.fixed.reduce((t, f) => t + (f.monthly ?? 0), 0);
  const monthKey = new Date(m.updatedAt).toISOString().slice(0, 7);
  const oneTime = m.oneTime.filter((o) => o.date.startsWith(monthKey)).reduce((t, o) => t + o.dollars, 0);
  const total = claude + voice + fixed + oneTime;
  const projected = (claude / Math.max(1, m.daysSoFar)) * m.daysInMonth + voice + fixed + oneTime;
  const share = total / m.budget;
  const tone: Tone = share >= 1 ? "bad" : share >= 0.8 ? "warn" : "good";
  return { claude, voice, fixed, oneTime, total, projected, share, tone };
}

const TONE_COLOR = { good: "var(--hq-gold)", warn: "var(--hq-warn)", bad: "var(--hq-bad)", idle: "var(--hq-faint)" };

// The gold budget bar, with a tick where the month is on track to end
export function BudgetBar({ m }: { m: Money }) {
  const s = spend(m);
  return (
    <div>
      <div className="relative h-3 overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full transition-[width] duration-1000"
          style={{
            width: `${Math.min(100, s.share * 100)}%`,
            background: `linear-gradient(90deg, color-mix(in srgb, ${TONE_COLOR[s.tone]} 55%, transparent), ${TONE_COLOR[s.tone]})`,
            boxShadow: `0 0 18px color-mix(in srgb, ${TONE_COLOR[s.tone]} 50%, transparent)`,
          }}
        />
        <span
          aria-hidden="true"
          title="Where the month is heading"
          className="absolute inset-y-0 w-0.5 bg-white/40"
          style={{ left: `${Math.min(99.5, (s.projected / m.budget) * 100)}%` }}
        />
      </div>
      <div className="mt-2 flex justify-between text-[12px] text-(--hq-dim)">
        <span>
          {fmt.pct(s.share)} of {fmt.usd0(m.budget)}
        </span>
        <span>On track for {fmt.usd0(s.projected)}</span>
      </div>
    </div>
  );
}

export function MoneySection({ money }: { money: Load<Money> }) {
  const m = money.data;
  if (!m) return <Loading load={money} />;
  const s = spend(m);
  const rows = [
    { name: "Claude (answers)", value: s.claude, note: m.claude.ok ? `Last month ${fmt.usd(m.claude.lastMonth)}` : m.claude.problem, bad: !m.claude.ok },
    {
      name: "ElevenLabs (voices)",
      value: s.voice,
      note: m.voice.ok ? `${m.voice.plan} plan · ${m.voice.status}${m.voice.nextBill != null ? " · next bill" : ""}` : m.voice.problem,
      bad: !m.voice.ok,
    },
    ...m.fixed.map((f) => ({ name: f.name, value: f.monthly ?? 0, note: f.note, bad: f.monthly == null })),
    ...(s.oneTime ? [{ name: "One-time this month", value: s.oneTime, note: "Top-ups and purchases", bad: false }] : []),
  ];
  const perQuestion = m.claude.ok && m.usage.ok && m.usage.questionsThisMonth ? m.claude.monthToDate / m.usage.questionsThisMonth : null;
  return (
    <>
      <SectionTitle title="Money" sub={`${m.month} · updated ${fmt.ago(m.updatedAt)}`} right={<Pill tone={s.tone}>{s.tone === "good" ? "Under budget" : s.tone === "warn" ? "Close to budget" : "Over budget"}</Pill>} />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <Label>Spent this month</Label>
          <p className="hq-gold-text mt-2 text-[56px] font-semibold leading-none tracking-[-0.04em]">
            <CountUp value={s.total} format={fmt.usd} />
          </p>
          <div className="mt-6">
            <BudgetBar m={m} />
          </div>
          <div className="mt-6 grid grid-cols-3 gap-4 border-t border-(--hq-line) pt-5">
            <Mini label="Per question" value={perQuestion == null ? "—" : `$${perQuestion.toFixed(3)}`} />
            <Mini label="Questions" value={m.usage.ok ? fmt.int(m.usage.questionsThisMonth) : "—"} />
            <Mini label="Last month (Claude)" value={m.claude.ok ? fmt.usd(m.claude.lastMonth) : "—"} />
          </div>
        </Card>
        <Card delay={60}>
          <CardTitle>Where it goes</CardTitle>
          <ul className="divide-y divide-(--hq-line)">
            {rows.map((r) => (
              <li key={r.name} className="flex items-start justify-between gap-3 py-2.5">
                <span className="min-w-0">
                  <span className="block text-[14px] font-medium">{r.name}</span>
                  <span className={`block text-[12px] ${r.bad ? "text-(--hq-warn)" : "text-(--hq-dim)"}`}>{r.note}</span>
                </span>
                <span className="shrink-0 text-[15px] font-semibold tabular-nums">{fmt.usd(r.value)}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="lg:col-span-2" delay={120}>
          <CardTitle>Claude spending by day</CardTitle>
          {m.claude.ok ? (
            <Chart kind="bars" points={m.claude.byDay.map((d) => ({ label: fmt.day(d.day), value: d.dollars }))} format={fmt.usd} empty="No Claude spending yet this month." />
          ) : (
            <Problem>{m.claude.problem}</Problem>
          )}
        </Card>
        <Card delay={180}>
          <CardTitle>By model</CardTitle>
          {m.claude.ok ? <BarList items={m.claude.byModel.map((x) => ({ name: x.model, value: x.dollars }))} format={fmt.usd} /> : <Problem>{m.claude.problem}</Problem>}
          {m.voice.ok && (
            <div className="mt-6">
              <Label>Voice characters</Label>
              <p className="mt-2 text-[14px]">
                <strong className="tabular-nums">{fmt.int(m.voice.charactersUsed)}</strong>
                <span className="text-(--hq-dim)"> of {fmt.int(m.voice.characterLimit)}</span>
              </p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(100, (m.voice.charactersUsed / Math.max(1, m.voice.characterLimit)) * 100)}%`,
                    background: m.voice.charactersUsed / Math.max(1, m.voice.characterLimit) > 0.9 ? "var(--hq-bad)" : "var(--hq-sky)",
                  }}
                />
              </div>
              {m.voice.resetsAt && <p className="mt-1.5 text-[12px] text-(--hq-dim)">Resets {fmt.day(m.voice.resetsAt)}</p>}
            </div>
          )}
        </Card>
        {m.oneTime.length > 0 && (
          <Card className="lg:col-span-3" delay={240}>
            <CardTitle right={<span className="text-[13px] text-(--hq-dim)">{fmt.usd(m.oneTime.reduce((t, o) => t + o.dollars, 0))} in all</span>}>One-time spending</CardTitle>
            <ul className="divide-y divide-(--hq-line)">
              {m.oneTime.map((o) => (
                <li key={o.name + o.date} className="flex items-start justify-between gap-4 py-2.5">
                  <span className="min-w-0">
                    <span className="block text-[14px] font-medium">{o.name}</span>
                    <span className="block text-[12px] text-(--hq-dim)">
                      {fmt.day(o.date)} · {o.note}
                    </span>
                  </span>
                  <span className="shrink-0 text-[15px] font-semibold tabular-nums">{fmt.usd(o.dollars)}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </>
  );
}

export function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <Label>{label}</Label>
      <p className="mt-1 truncate text-[18px] font-semibold tabular-nums">{value}</p>
    </div>
  );
}

export function Loading<T>({ load }: { load: Load<T> }) {
  if (load.state === "failed") return <Problem>Couldn&apos;t load this just now. It tries again by itself every few minutes.</Problem>;
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Skeleton h={260} />
      </div>
      <Skeleton h={260} />
    </div>
  );
}
