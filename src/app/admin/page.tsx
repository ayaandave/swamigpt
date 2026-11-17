"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { Money } from "@/lib/money";
import { accessToken, useAuth } from "@/lib/supabase";
import { Bars, OwnerTabs, Row, Stat } from "./parts";

const usd = (n: number) => `$${n.toFixed(n < 10 ? 2 : 0)}`;
const usdExact = (n: number) => `$${n.toFixed(2)}`;
const short = (iso: string) => new Date(iso + "T00:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
const REFRESH_MS = 5 * 60 * 1000;

// The money dashboard: everything SwamiGPT spends, live. Only the owner's account can load it
export default function MoneyPage() {
  const { ready, user } = useAuth();
  const [money, setMoney] = useState<Money | null>(null);
  const [state, setState] = useState<"loading" | "ok" | "denied" | "failed">("loading");

  const load = useCallback(async () => {
    const token = await accessToken();
    if (!token) return setState("denied");
    const res = await fetch("/api/admin/money", { headers: { authorization: `Bearer ${token}` } }).catch(() => null);
    if (!res) return setState("failed");
    if (res.status === 404) return setState("denied");
    if (!res.ok) return setState("failed");
    setMoney(await res.json());
    setState("ok");
  }, []);

  // Updates by itself every five minutes while the page is open
  useEffect(() => {
    if (!ready || !user) return;
    void load(); // eslint-disable-line react-hooks/set-state-in-effect -- loading data for the signed-in owner
    const t = setInterval(() => void load(), REFRESH_MS);
    return () => clearInterval(t);
  }, [ready, user, load]);

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
  if (!money) {
    return <p className="pt-16 text-center text-kajal-soft">{state === "failed" ? "Couldn't load the numbers. Try again in a minute." : "Adding it all up…"}</p>;
  }

  const { claude, voice, usage } = money;
  const claudeMonth = claude.ok ? claude.monthToDate : 0;
  const voiceMonth = voice.ok && voice.nextBill != null ? voice.nextBill : 0;
  const fixedMonth = money.fixed.reduce((t, f) => t + (f.monthly ?? 0), 0);
  // One-time spending counts toward the month it was paid in
  const monthKey = new Date(money.updatedAt).toISOString().slice(0, 7);
  const oneTimeMonth = money.oneTime.filter((o) => o.date.startsWith(monthKey)).reduce((t, o) => t + o.dollars, 0);
  const oneTimeAll = money.oneTime.reduce((t, o) => t + o.dollars, 0);
  const total = claudeMonth + voiceMonth + fixedMonth + oneTimeMonth;
  // Claude grows with use; the plans are flat for the month
  const projected = (claudeMonth / Math.max(1, money.daysSoFar)) * money.daysInMonth + voiceMonth + fixedMonth + oneTimeMonth;
  const share = total / money.budget;
  const level = share >= 1 ? "over" : share >= 0.75 ? "close" : "fine";
  const tone = { fine: "bg-tulsi", close: "bg-kesar", over: "bg-kumkum" }[level];
  const label = { fine: "Under budget", close: "Getting close to the budget", over: "Over budget" }[level];

  return (
    <div className="pt-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <OwnerTabs />
          <h1 className="mt-1 font-display text-[1.75rem] leading-tight">{money.month}</h1>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="min-h-11 rounded-xl border border-sandal-edge px-5 text-[0.95rem] font-semibold hover:border-kajal"
        >
          Refresh
        </button>
      </div>
      <p className="mt-1 text-[0.9rem] text-kajal-soft">
        Updated {new Date(money.updatedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}. Updates by itself every 5
        minutes. Claude&apos;s numbers can lag by a few minutes.
      </p>

      {/* The headline: this month so far against the budget */}
      <section aria-label="This month" className="mt-8">
        <p className="text-[1rem] text-kajal-soft">Spent this month so far</p>
        <p className="font-display text-[2.25rem] leading-none">{usdExact(total)}</p>
        <p className="mt-2 text-[1.05rem]">
          of your {usd(money.budget)} budget · on track for about <strong>{usd(projected)}</strong> by the end of the month
        </p>
        <div
          className="mt-4 h-3 overflow-hidden rounded-full bg-sandal-deep"
          role="meter"
          aria-valuemin={0}
          aria-valuemax={money.budget}
          aria-valuenow={Math.round(total * 100) / 100}
          aria-label="Budget used"
        >
          <div className={`h-full rounded-full ${tone}`} style={{ width: `${Math.min(100, share * 100)}%` }} />
        </div>
        <p className={`mt-2 text-[0.95rem] font-semibold ${level === "fine" ? "text-tulsi" : level === "close" ? "text-kesar-deep" : "text-kumkum"}`}>
          {level === "fine" ? "✓" : "!"} {label} ({Math.round(share * 100)}%)
        </p>
      </section>

      {/* Where it goes */}
      <section aria-labelledby="where" className="mt-12">
        <h2 id="where" className="font-display text-[1.3rem]">Where it goes</h2>
        <ul className="mt-3 border-t border-sandal-edge">
          <Row
            name="Claude (answers)"
            value={claude.ok ? usdExact(claude.monthToDate) : "—"}
            note={claude.ok ? `Last month: ${usdExact(claude.lastMonth)}` : claude.problem}
            problem={!claude.ok}
          />
          <Row
            name="ElevenLabs (voices)"
            value={voice.ok ? (voice.nextBill != null ? usdExact(voice.nextBill) : "—") : "—"}
            note={voice.ok ? `${voice.plan} plan, ${voice.status}${voice.nextBill != null ? " · next bill" : ""}` : voice.problem}
            problem={!voice.ok}
          />
          {money.fixed.map((f) => (
            <Row key={f.name} name={f.name} value={f.monthly == null ? "—" : usdExact(f.monthly)} note={f.note} problem={f.monthly == null} />
          ))}
        </ul>
      </section>

      {/* One-time spending */}
      {money.oneTime.length > 0 && (
        <section aria-labelledby="one-time" className="mt-12">
          <h2 id="one-time" className="font-display text-[1.3rem]">One-time spending</h2>
          <p className="mt-1 text-[0.95rem] text-kajal-soft">Top-ups and one-off purchases. {usdExact(oneTimeAll)} in total so far.</p>
          <ul className="mt-3 border-t border-sandal-edge">
            {money.oneTime.map((o) => (
              <Row key={o.name + o.date} name={o.name} value={usdExact(o.dollars)} note={`${short(o.date)} · ${o.note}`} problem={false} />
            ))}
          </ul>
        </section>
      )}

      {/* Claude by day */}
      {claude.ok && (
        <section aria-labelledby="by-day" className="mt-12">
          <h2 id="by-day" className="font-display text-[1.3rem]">Claude spending by day</h2>
          <Bars
            points={claude.byDay.map((d) => ({ label: short(d.day), value: d.dollars }))}
            format={usdExact}
            colorClass="fill-kesar"
            empty="No Claude spending yet this month."
          />
          {claude.byModel.length > 0 && (
            <ul className="mt-4 text-[0.95rem] text-kajal-soft">
              {claude.byModel.map((m) => (
                <li key={m.model}>
                  {m.model}: <span className="font-semibold text-kajal">{usdExact(m.dollars)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* ElevenLabs quota */}
      {voice.ok && (
        <section aria-labelledby="voice" className="mt-12">
          <h2 id="voice" className="font-display text-[1.3rem]">Voice characters</h2>
          <p className="mt-2 text-[1.05rem]">
            <strong>{voice.charactersUsed.toLocaleString()}</strong> of {voice.characterLimit.toLocaleString()} used
            {voice.resetsAt && <> · resets {new Date(voice.resetsAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</>}
          </p>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-sandal-deep">
            <div
              className={`h-full rounded-full ${voice.charactersUsed / voice.characterLimit >= 0.9 ? "bg-kumkum" : "bg-night-soft"}`}
              style={{ width: `${Math.min(100, (voice.charactersUsed / Math.max(1, voice.characterLimit)) * 100)}%` }}
            />
          </div>
        </section>
      )}

      {/* Use of the site */}
      <section aria-labelledby="use" className="mt-12">
        <h2 id="use" className="font-display text-[1.3rem]">How much SwamiGPT is used</h2>
        {usage.ok ? (
          <>
            <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
              <Stat label="Questions this month" value={usage.questionsThisMonth.toLocaleString()} />
              <Stat
                label="Claude cost per question"
                value={claude.ok && usage.questionsThisMonth ? usdExact(claude.monthToDate / usage.questionsThisMonth) : "—"}
              />
              <Stat label="Accounts" value={usage.accounts?.toLocaleString() ?? "—"} />
              <Stat label="Reports to review" value={usage.reportsToReview?.toLocaleString() ?? "—"} />
              <Stat
                label="Helpful, last 30 days"
                value={usage.helpful == null || usage.notHelpful == null ? "—" : `👍 ${usage.helpful} · 👎 ${usage.notHelpful}`}
              />
            </dl>
            <h3 className="mt-8 text-[1rem] font-semibold">Questions answered, last 30 days</h3>
            <Bars
              points={usage.byDay.map((d) => ({ label: short(d.day), value: d.questions }))}
              format={(n) => `${n} question${n === 1 ? "" : "s"}`}
              colorClass="fill-tulsi"
              empty="No questions in the last 30 days."
            />
          </>
        ) : (
          <p className="mt-2 text-kumkum">{usage.problem}</p>
        )}
      </section>
    </div>
  );
}
