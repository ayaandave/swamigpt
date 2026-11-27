"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Money } from "@/lib/money";
import type { Visits } from "@/lib/visits";
import type { AppStore } from "@/lib/hq/appstore";
import type { PlusNumbers } from "@/lib/hq/plus";
import type { People } from "@/lib/hq/people";
import type { Health } from "@/lib/hq/health";
import { useAuth } from "@/lib/supabase";
import { OmMark } from "@/components/OmMark";
import { useOwner } from "./data";
import { SERVICES } from "./links";
import { LaunchpadSection, Tile } from "./launchpad";
import { MoneySection } from "./money";
import { GrowthSection } from "./growth";
import { TikTokSection, type TikTokData } from "./tiktok";
import { PeopleSection } from "./people";
import { HealthSection, type Todos } from "./health";
import { alerts, Overview, type All, type SectionId } from "./overview";
import { Dot } from "./ui";

const I = (d: ReactNode) => (
  <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {d}
  </svg>
);
const NAV: { id: SectionId; label: string; icon: ReactNode }[] = [
  { id: "overview", label: "Overview", icon: I(<><rect x="3" y="3" width="7" height="9" rx="2" /><rect x="14" y="3" width="7" height="5" rx="2" /><rect x="14" y="12" width="7" height="9" rx="2" /><rect x="3" y="16" width="7" height="5" rx="2" /></>) },
  { id: "launch", label: "Launchpad", icon: I(<><path d="M5 19 19 5" /><path d="M9 5h10v10" /></>) },
  { id: "money", label: "Money", icon: I(<><circle cx="12" cy="12" r="9" /><path d="M15 9.5c-.5-1-1.6-1.5-3-1.5-1.7 0-3 .8-3 2s1.3 1.7 3 2 3 .8 3 2-1.3 2-3 2c-1.4 0-2.5-.5-3-1.5M12 6.5V8m0 8v1.5" /></>) },
  { id: "growth", label: "Growth", icon: I(<><path d="M3 17l6-6 4 4 8-8" /><path d="M15 7h6v6" /></>) },
  { id: "tiktok", label: "TikTok", icon: I(<><path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5" /><path d="M14 3c.5 2.5 2.3 4 5 4" /></>) },
  { id: "users", label: "Users", icon: I(<><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c.8-3.5 3.4-5.5 6.5-5.5s5.7 2 6.5 5.5" /><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18.5 14.8c1.5.8 2.6 2.6 3 5.2" /></>) },
  { id: "health", label: "Health & to-dos", icon: I(<><path d="M3 12h4l2-5 4 10 2-5h6" /></>) },
];

// SwamiGPT HQ: the owner's whole dashboard. Full screen over the site, always "Temple night" dark.
export function HQ() {
  const { ready, user } = useAuth();
  if (!ready) return <div className="hq fixed inset-0 z-[45]" />;
  if (!user) return <NotFound />;
  // Keyed by account, so switching accounts starts fresh
  return <Dashboard key={user.id} />;
}

function NotFound() {
  return (
    <div className="pt-16 text-center">
      <h1 className="font-display text-[1.5rem]">Page not found</h1>
      <Link href="/" className="mt-4 inline-flex min-h-11 items-center font-semibold text-kesar-deep underline underline-offset-4">
        Go home
      </Link>
    </div>
  );
}

function Dashboard() {
  const d: All = {
    money: useOwner<Money>("/api/admin/money"),
    visits: useOwner<Visits>("/api/admin/analytics?days=30"),
    appstore: useOwner<AppStore>("/api/admin/appstore", 30 * 60 * 1000),
    plus: useOwner<PlusNumbers>("/api/admin/plus"),
    people: useOwner<People>("/api/admin/people"),
    health: useOwner<Health>("/api/admin/health", 60 * 1000),
    tiktok: useOwner<TikTokData>("/api/admin/tiktok", 30 * 60 * 1000),
    todos: useOwner<Todos>("/api/admin/todos", 10 * 60 * 1000),
  };
  const [section, setSection] = useState<SectionId>("overview");
  const [palette, setPalette] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);

  // The section lives in the address (#money), so a refresh or a bookmark lands in the same place
  useEffect(() => {
    const read = () => {
      const h = window.location.hash.slice(1) as SectionId;
      if (NAV.some((n) => n.id === h)) setSection(h);
    };
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, []);
  const go = useCallback((s: SectionId) => {
    setSection(s);
    history.replaceState(null, "", s === "overview" ? window.location.pathname : `#${s}`);
    scroller.current?.scrollTo({ top: 0 });
  }, []);

  // ⌘K / Ctrl+K opens quick-open; 1-7 jump between sections
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPalette((p) => !p);
        return;
      }
      const typing = e.target instanceof HTMLElement && (e.target.closest("input, textarea, select") || e.target.isContentEditable);
      if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
      const n = Number(e.key);
      if (n >= 1 && n <= NAV.length) go(NAV[n - 1].id);
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [go]);

  // Anyone but the owner gets a 404 from every route, so they see the same "not found" as any
  // missing page, and nothing of HQ shows before the server has said yes
  const denied = d.health.state === "denied" || d.money.state === "denied";
  const shown = !denied && (d.health.state !== "loading" || d.money.state !== "loading");

  // The site underneath shouldn't scroll while HQ is open
  useEffect(() => {
    if (!shown) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prev;
    };
  }, [shown]);

  if (denied) return <NotFound />;
  if (!shown) return <div className="min-h-[60vh]" />;

  const count = alerts(d).filter((a) => a.tone === "bad" || a.tone === "warn").length;
  const reloadAll = () => Object.values(d).forEach((l) => void l.reload());

  return (
    <div className="hq fixed inset-0 z-[45] flex">
      <div aria-hidden="true" className="hq-dots pointer-events-none absolute inset-0" />

      {/* Side menu (laptops) */}
      <aside className="relative hidden w-[248px] shrink-0 flex-col border-r border-(--hq-line) px-4 pt-[max(20px,env(safe-area-inset-top))] pb-5 md:flex">
        <div className="flex items-center gap-2.5 px-2">
          <OmMark size={30} />
          <div>
            <p className="text-[16px] font-semibold leading-tight tracking-[-0.02em]">SwamiGPT HQ</p>
            <p className="text-[11px] text-(--hq-dim)">Private · only you</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setPalette(true)}
          className="mt-6 flex min-h-10 items-center justify-between rounded-xl border border-(--hq-line) bg-white/[0.02] px-3 text-[13px] text-(--hq-dim) hover:border-(--hq-line-hi)"
        >
          <span>Open anything…</span>
          <kbd className="rounded-md border border-(--hq-line) px-1.5 py-0.5 text-[11px]">⌘K</kbd>
        </button>
        <nav aria-label="HQ" className="mt-5 flex-1">
          <ul className="space-y-0.5">
            {NAV.map((n, i) => {
              const on = section === n.id;
              return (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => go(n.id)}
                    aria-current={on ? "page" : undefined}
                    className={`group relative flex min-h-10 w-full items-center gap-3 rounded-xl px-3 text-[14px] font-medium transition ${on ? "bg-[rgba(227,179,65,0.1)] text-(--hq-gold-hi)" : "text-(--hq-dim) hover:bg-white/[0.03] hover:text-(--hq-text)"}`}
                  >
                    {on && <span aria-hidden="true" className="absolute top-2 bottom-2 -left-4 w-[3px] rounded-r-full bg-(--hq-gold) shadow-[0_0_12px_var(--hq-gold)]" />}
                    {n.icon}
                    <span className="flex-1 text-left">{n.label}</span>
                    {n.id === "overview" && count > 0 ? (
                      <span className="rounded-full bg-(--hq-warn) px-1.5 text-[11px] font-bold text-black">{count}</span>
                    ) : (
                      <kbd className="text-[11px] text-(--hq-faint) opacity-0 group-hover:opacity-100">{i + 1}</kbd>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="space-y-1 border-t border-(--hq-line) pt-4 text-[13px]">
          <button type="button" onClick={reloadAll} className="flex min-h-9 w-full items-center gap-2 rounded-lg px-3 text-(--hq-dim) hover:text-(--hq-text)">
            <Dot tone="good" /> Refresh everything
          </button>
          <Link href="/" className="flex min-h-9 items-center gap-2 rounded-lg px-3 text-(--hq-dim) hover:text-(--hq-text)">
            ← Back to SwamiGPT
          </Link>
        </div>
      </aside>

      <div className="relative flex min-w-0 flex-1 flex-col">
        {/* Top bar + section pills (phones) */}
        <header className="border-b border-(--hq-line) bg-[rgba(5,5,10,0.75)] pt-[max(12px,env(safe-area-inset-top))] backdrop-blur-xl md:hidden">
          <div className="flex items-center justify-between gap-2 px-4">
            <Link href="/" aria-label="Back to SwamiGPT" className="flex min-h-11 items-center gap-2">
              <OmMark size={26} />
              <span className="text-[16px] font-semibold tracking-[-0.02em]">HQ</span>
            </Link>
            <div className="flex items-center gap-1">
              <button type="button" onClick={reloadAll} aria-label="Refresh everything" className="grid size-11 place-items-center rounded-full text-(--hq-dim)">
                ↻
              </button>
              <button type="button" onClick={() => setPalette(true)} className="min-h-10 rounded-full border border-(--hq-line) px-4 text-[13px] font-semibold text-(--hq-dim)">
                Open…
              </button>
            </div>
          </div>
          <nav aria-label="HQ" className="no-scrollbar mt-1 overflow-x-auto px-3 pb-2.5">
            <ul className="flex w-max gap-1.5">
              {NAV.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => go(n.id)}
                    aria-current={section === n.id ? "page" : undefined}
                    className={`flex min-h-9 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-semibold ${section === n.id ? "bg-(--hq-gold) text-black" : "border border-(--hq-line) text-(--hq-dim)"}`}
                  >
                    {n.label}
                    {n.id === "overview" && count > 0 && <span className="rounded-full bg-(--hq-warn) px-1.5 text-[10px] text-black">{count}</span>}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </header>

        <div ref={scroller} className="flex-1 overflow-y-auto overscroll-contain">
          <main key={section} className="mx-auto w-full max-w-[1240px] px-4 pt-6 pb-[max(40px,env(safe-area-inset-bottom))] sm:px-8 md:pt-10">
            {section === "overview" && <Overview d={d} go={go} />}
            {section === "launch" && <LaunchpadSection />}
            {section === "money" && <MoneySection money={d.money} />}
            {section === "growth" && <GrowthSection visits={d.visits} appstore={d.appstore} plus={d.plus} />}
            {section === "tiktok" && <TikTokSection tiktok={d.tiktok} />}
            {section === "users" && <PeopleSection people={d.people} />}
            {section === "health" && <HealthSection health={d.health} todos={d.todos} />}
          </main>
        </div>
      </div>

      {palette && <Palette close={() => setPalette(false)} go={go} />}
    </div>
  );
}

// ⌘K: type a few letters, press Enter. Services open in a new tab; sections switch in place.
function Palette({ close, go }: { close: () => void; go: (s: SectionId) => void }) {
  const [q, setQ] = useState("");
  const [at, setAt] = useState(0);
  const items = useMemo(() => {
    const all = [
      ...NAV.map((n) => ({ key: `s-${n.id}`, label: n.label, hint: "Section", run: () => go(n.id), service: null })),
      ...SERVICES.flatMap((s) => [
        { key: s.id, label: s.name, hint: s.what, run: () => window.open(s.href, "_blank", "noopener,noreferrer"), service: s },
        ...(s.quick ?? []).map((x) => ({ key: x.href, label: `${s.name} → ${x.label}`, hint: "", run: () => window.open(x.href, "_blank", "noopener,noreferrer"), service: s })),
      ]),
    ];
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    return all.filter((i) => words.every((w) => `${i.label} ${i.hint}`.toLowerCase().includes(w))).slice(0, 9);
  }, [q, go]);
  const pick = (i: number) => {
    items[i]?.run();
    close();
  };
  return (
    <div className="fixed inset-0 z-10 flex items-start justify-center bg-black/60 px-4 pt-[12vh] backdrop-blur-sm" onClick={close}>
      <div role="dialog" aria-modal="true" aria-label="Open anything" className="hq-card hq-rise w-full max-w-[560px] overflow-hidden p-0" onClick={(e) => e.stopPropagation()}>
        <input
          autoFocus
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setAt(0);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") close();
            else if (e.key === "ArrowDown") {
              e.preventDefault();
              setAt((a) => Math.min(items.length - 1, a + 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setAt((a) => Math.max(0, a - 1));
            } else if (e.key === "Enter") pick(at);
          }}
          placeholder="Open Supabase, Vercel env vars, Money…"
          className="w-full border-b border-(--hq-line) bg-transparent px-5 py-4 text-[17px] outline-none placeholder:text-(--hq-faint)"
        />
        <ul className="max-h-[50vh] overflow-y-auto p-2">
          {items.length === 0 && <li className="px-3 py-6 text-center text-[14px] text-(--hq-dim)">Nothing matches.</li>}
          {items.map((it, i) => (
            <li key={it.key}>
              <button
                type="button"
                onMouseEnter={() => setAt(i)}
                onClick={() => pick(i)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left ${i === at ? "bg-[rgba(227,179,65,0.1)]" : ""}`}
              >
                {it.service ? <Tile s={it.service} size={30} /> : <span className="grid size-[30px] place-items-center rounded-[10px] bg-white/5 text-(--hq-gold-hi)">{NAV.find((n) => `s-${n.id}` === it.key)?.icon}</span>}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-medium">{it.label}</span>
                  {it.hint && <span className="block truncate text-[12px] text-(--hq-dim)">{it.hint}</span>}
                </span>
                <span className="text-[12px] text-(--hq-faint)">{it.service ? "↗" : "↵"}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
