import { useState } from "react";
import type { Health } from "@/lib/hq/health";
import type { Todo } from "@/lib/hq/todos";
import type { Load } from "./data";
import { Loading } from "./money";
import { Card, CardTitle, Dot, fmt, Pill, Problem, SectionTitle } from "./ui";

export type Todos = { ok: true; todos: Todo[] } | { ok: false; problem: string };

const daysUntil = (iso: string) => Math.ceil((new Date(iso + "T00:00:00Z").getTime() - Date.now()) / 86400_000);

export function HealthSection({ health, todos }: { health: Load<Health>; todos: Load<Todos> }) {
  const h = health.data;
  return (
    <>
      <SectionTitle
        title="Health & to-dos"
        sub={h ? `Checked ${fmt.ago(h.checkedAt)} · checks again every minute while open` : "Checking everything…"}
        right={
          <button type="button" onClick={() => void health.reload()} className="min-h-10 rounded-full border border-(--hq-line) px-4 text-[13px] font-semibold text-(--hq-dim) hover:border-(--hq-line-hi) hover:text-(--hq-text)">
            Check now
          </button>
        }
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardTitle>Is everything working?</CardTitle>
          {!h ? (
            <Loading load={health} />
          ) : (
            <ul className="space-y-2">
              {h.checks.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-3 rounded-xl border border-(--hq-line) bg-white/[0.015] px-4 py-3">
                  <span className="flex min-w-0 items-center gap-3">
                    <Dot tone={c.ok ? "good" : "bad"} pulse={c.ok} />
                    <span className="min-w-0">
                      <span className="block text-[14px] font-medium">{c.name}</span>
                      <span className={`block truncate text-[12px] ${c.ok ? "text-(--hq-dim)" : "text-[#ff9a9d]"}`}>{c.detail}</span>
                    </span>
                  </span>
                  {c.ms != null && <span className="shrink-0 text-[12px] tabular-nums text-(--hq-faint)">{c.ms} ms</span>}
                </li>
              ))}
            </ul>
          )}
        </Card>
        <TodoCard todos={todos} />
        {h && (
          <Card delay={80}>
            <CardTitle>Dates to remember</CardTitle>
            <ul className="divide-y divide-(--hq-line)">
              {h.reminders.map((r) => {
                const left = r.date ? daysUntil(r.date) : null;
                const tone = left == null ? "idle" : left < 30 ? "bad" : left < 60 ? "warn" : "good";
                return (
                  <li key={r.name} className="flex items-start justify-between gap-3 py-3">
                    <span className="min-w-0">
                      <span className="block text-[14px] font-medium">
                        {r.href ? (
                          <a href={r.href} target="_blank" rel="noreferrer" className="hover:underline">
                            {r.name} ↗
                          </a>
                        ) : (
                          r.name
                        )}
                      </span>
                      <span className="block text-[12px] text-(--hq-dim)">{r.note}</span>
                    </span>
                    <Pill tone={tone}>{r.date ? `${fmt.day(r.date)} ${r.date.slice(0, 4)} · ${left} days` : "Date unknown"}</Pill>
                  </li>
                );
              })}
            </ul>
          </Card>
        )}
        {h && (
          <Card delay={120}>
            <CardTitle right={<Pill tone={h.setup.every((s) => s.done) ? "good" : "warn"}>{h.setup.filter((s) => s.done).length} of {h.setup.length} done</Pill>}>Dashboard setup</CardTitle>
            <ul className="space-y-2">
              {h.setup.map((s) => (
                <li key={s.name} className="flex items-start gap-3 text-[14px]">
                  <span className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full text-[11px] font-bold ${s.done ? "bg-(--hq-good) text-black" : "border border-(--hq-line-hi) text-(--hq-faint)"}`}>{s.done ? "✓" : ""}</span>
                  <span>
                    <span className={s.done ? "text-(--hq-dim)" : "font-medium"}>{s.name}</span>
                    {!s.done && <span className="block font-mono text-[12px] text-(--hq-faint)">{s.how}</span>}
                  </span>
                </li>
              ))}
            </ul>
            {!h.setup.every((s) => s.done) && <SetupSteps />}
          </Card>
        )}
      </div>
    </>
  );
}

// The two keys HQ still needs, step by step. Keys go straight into Vercel: never into a chat.
function SetupSteps() {
  return (
    <details className="mt-5 rounded-xl border border-(--hq-line) p-4 text-[13px] leading-relaxed text-(--hq-dim) open:bg-white/[0.015]">
      <summary className="cursor-pointer font-semibold text-(--hq-gold-hi)">How to add the keys</summary>
      <p className="mt-3 font-semibold text-(--hq-text)">App Store Connect (with Dad, about 5 minutes)</p>
      <ol className="mt-1 list-decimal space-y-1 pl-5">
        <li>
          appstoreconnect.apple.com → Users and Access → Integrations → App Store Connect API → Team Keys → <b>+</b>.
        </li>
        <li>
          Name it “SwamiGPT HQ”, access <b>Sales</b>. Download the .p8 file (Apple lets you download it only once).
        </li>
        <li>Copy the Key ID and the Issuer ID shown on that page.</li>
        <li>Payments and Financial Reports → the Vendor number is at the top left.</li>
        <li>
          In Vercel → swamigpt → Settings → Environment Variables (Production, Sensitive) add ASC_KEY_ID, ASC_ISSUER_ID, ASC_VENDOR_NUMBER, and ASC_PRIVATE_KEY (open the .p8 and paste all of it).
        </li>
      </ol>
      <p className="mt-4 font-semibold text-(--hq-text)">RevenueCat</p>
      <ol className="mt-1 list-decimal space-y-1 pl-5">
        <li>RevenueCat → SwamiGPT project → Project settings → API keys → + New secret API key.</li>
        <li>Version 2, name “SwamiGPT HQ”, read-only access to Charts metrics and Project configuration.</li>
        <li>Add it in Vercel as REVENUECAT_V2_KEY (Production, Sensitive).</li>
      </ol>
      <p className="mt-4">Then redeploy, and these numbers fill in by themselves.</p>
    </details>
  );
}

function TodoCard({ todos }: { todos: Load<Todos> }) {
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const t = todos.data;
  const add = async () => {
    if (!title.trim()) return;
    const err = await todos.send("POST", { title });
    setError(err);
    if (!err) setTitle("");
  };
  const open = t?.ok ? t.todos.filter((x) => !x.done) : [];
  const done = t?.ok ? t.todos.filter((x) => x.done) : [];
  return (
    <Card delay={40}>
      <CardTitle right={t?.ok ? <span className="text-[13px] text-(--hq-dim)">{open.length} left</span> : null}>To-do</CardTitle>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void add();
        }}
        className="mb-3 flex gap-2"
      >
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add something to do…"
          maxLength={300}
          className="min-h-11 min-w-0 flex-1 rounded-xl border border-(--hq-line) bg-black/40 px-3 text-[15px] outline-none placeholder:text-(--hq-faint) focus:border-(--hq-gold)"
        />
        <button type="submit" className="min-h-11 rounded-xl bg-(--hq-gold) px-4 text-[14px] font-semibold text-black">
          Add
        </button>
      </form>
      {error && <p className="mb-2 text-[13px] text-(--hq-bad)">{error}</p>}
      {!t ? null : !t.ok ? (
        <Problem>{t.problem}</Problem>
      ) : (
        <ul className="space-y-1">
          {[...open, ...done].map((x) => (
            <li key={x.id} className="group flex items-start gap-3 rounded-xl px-2 py-2 hover:bg-white/[0.02]">
              <button
                type="button"
                aria-label={x.done ? `Mark “${x.title}” not done` : `Mark “${x.title}” done`}
                onClick={() => void todos.send("PATCH", { id: x.id, done: !x.done })}
                className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border text-[11px] font-bold transition ${x.done ? "border-(--hq-gold) bg-(--hq-gold) text-black" : "border-(--hq-line-hi) hover:border-(--hq-gold)"}`}
              >
                {x.done ? "✓" : ""}
              </button>
              <span className="min-w-0 flex-1">
                <span className={`block text-[14px] ${x.done ? "text-(--hq-faint) line-through" : ""}`}>{x.title}</span>
                {x.note && !x.done && <span className="block text-[12px] text-(--hq-dim)">{x.note}</span>}
              </span>
              <button
                type="button"
                aria-label={`Delete “${x.title}”`}
                onClick={() => void todos.send("DELETE", undefined, `?id=${x.id}`)}
                className="shrink-0 text-[12px] text-(--hq-faint) transition hover:text-(--hq-bad) sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
