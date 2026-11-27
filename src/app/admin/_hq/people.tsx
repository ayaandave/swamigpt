import type { People } from "@/lib/hq/people";
import type { Load } from "./data";
import { Loading } from "./money";
import { BarList, Card, CardTitle, Chart, fmt, Metric, plural, Problem, SectionTitle } from "./ui";

export function PeopleSection({ people }: { people: Load<People> }) {
  const p = people.data;
  if (!p) return <Loading load={people} />;
  if (!p.ok) return <Problem>{p.problem}</Problem>;
  const sum = (k: "signups" | "questions" | "lessons" | "up" | "down") => p.byDay.reduce((t, d) => t + d[k], 0);
  const series = (k: "signups" | "questions" | "lessons") => p.byDay.map((d) => d[k]);
  const up = sum("up");
  const down = sum("down");
  return (
    <>
      <SectionTitle title="Users" sub="Counts only. HQ never shows what anyone asked or who they are." />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Metric label="Accounts" value={p.accounts} sub={`+${fmt.int(sum("signups"))} in 30 days`} series={series("signups")} color="var(--hq-gold)" />
        <Metric label="Questions · 30d" value={sum("questions")} series={series("questions")} color="var(--hq-teal)" delay={40} />
        <Metric label="Lessons done · 30d" value={sum("lessons")} series={series("lessons")} color="var(--hq-sky)" delay={80} />
        <Metric label="Askers · 7d" value={p.activeAskers7} sub="Signed-in people who asked" delay={120} />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2" delay={160}>
          <CardTitle>Questions answered per day</CardTitle>
          <Chart color="var(--hq-teal)" points={p.byDay.map((d) => ({ label: fmt.day(d.day), value: d.questions }))} format={(n) => plural(n, "question")} />
        </Card>
        <Card delay={200}>
          <CardTitle>Were answers helpful? · 30d</CardTitle>
          {up + down === 0 ? (
            <p className="text-[14px] text-(--hq-dim)">No 👍/👎 yet.</p>
          ) : (
            <>
              <p className="text-[44px] font-semibold leading-none tracking-[-0.03em]">{fmt.pct(up / (up + down))}</p>
              <p className="mt-1 text-[13px] text-(--hq-dim)">said helpful</p>
              <div className="mt-4 flex h-3 overflow-hidden rounded-full">
                <span style={{ width: `${(up / (up + down)) * 100}%`, background: "var(--hq-good)" }} />
                <span style={{ width: `${(down / (up + down)) * 100}%`, background: "var(--hq-bad)" }} />
              </div>
              <p className="mt-2 flex justify-between text-[13px] tabular-nums">
                <span>👍 {fmt.int(up)}</span>
                <span>👎 {fmt.int(down)}</span>
              </p>
            </>
          )}
          <div className="mt-6 grid grid-cols-2 gap-3 border-t border-(--hq-line) pt-4 text-[13px]">
            <span className="text-(--hq-dim)">
              Reports to review <strong className="block text-[18px] text-(--hq-text)">{p.reportsToReview ?? "—"}</strong>
            </span>
            <span className="text-(--hq-dim)">
              Under 13 <strong className="block text-[18px] text-(--hq-text)">{fmt.int(p.under13)}</strong>
            </span>
          </div>
        </Card>
        <Card className="lg:col-span-2" delay={240}>
          <CardTitle>New accounts per day</CardTitle>
          <Chart kind="bars" points={p.byDay.map((d) => ({ label: fmt.day(d.day), value: d.signups }))} format={(n) => plural(n, "sign-up")} empty="No sign-ups in the last 30 days." />
        </Card>
        <Card delay={280}>
          <CardTitle>Courses people take</CardTitle>
          <BarList items={p.courses.map((c) => ({ name: c.title, value: c.people, sub: `${fmt.int(c.lessons)} lessons done` }))} color="var(--hq-sky)" format={(n) => `${fmt.int(n)} ${n === 1 ? "person" : "people"}`} empty="Nobody has finished a lesson yet." />
        </Card>
      </div>
    </>
  );
}
