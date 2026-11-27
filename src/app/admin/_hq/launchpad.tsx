import { useState } from "react";
import { GROUPS, SERVICES, type Service } from "./links";
import { SectionTitle } from "./ui";

export function Tile({ s, size = 44 }: { s: Service; size?: number }) {
  return (
    <span
      aria-hidden="true"
      className="grid shrink-0 place-items-center rounded-[14px] font-bold"
      style={{
        width: size,
        height: size,
        fontSize: s.mark.length > 2 ? size * 0.28 : s.mark.length > 1 ? size * 0.34 : size * 0.44,
        color: s.color,
        background: `radial-gradient(circle at 30% 20%, color-mix(in srgb, ${s.color} 26%, transparent), color-mix(in srgb, ${s.color} 8%, transparent))`,
        boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${s.color} 30%, transparent)`,
      }}
    >
      {s.mark}
    </span>
  );
}

// Opens every service in its own tab. Browsers block all but the first unless pop-ups are allowed
// for swamigpt.com, so the result says how many opened.
export function openAll(list: Service[] = SERVICES) {
  let opened = 0;
  for (const s of list) {
    const w = window.open(s.href, "_blank");
    if (w) {
      w.opener = null; // the service's page can't reach back into HQ
      opened++;
    }
  }
  return opened;
}

export function LaunchpadSection() {
  const [note, setNote] = useState<string | null>(null);
  return (
    <>
      <SectionTitle
        title="Launchpad"
        sub={`All ${SERVICES.length} services SwamiGPT runs on. Press ⌘K anywhere to jump to one.`}
        right={
          <button
            type="button"
            onClick={() => {
              const n = openAll();
              setNote(n < SERVICES.length ? "If only one tab opened, allow pop-ups for swamigpt.com (the icon at the right of the address bar), then press again." : null);
            }}
            className="min-h-11 rounded-full bg-(--hq-gold) px-5 text-[14px] font-semibold text-black shadow-[0_0_30px_-6px_rgba(227,179,65,0.6)] hover:brightness-110"
          >
            Open all {SERVICES.length} ↗
          </button>
        }
      />
      {note && <p className="-mt-3 mb-5 text-[13px] text-(--hq-warn)">{note}</p>}
      <div className="space-y-8">
        {GROUPS.map((g, gi) => (
          <section key={g} aria-labelledby={`g-${gi}`}>
            <div className="mb-3 flex items-center justify-between">
              <h2 id={`g-${gi}`} className="text-[11px] font-semibold uppercase tracking-[0.16em] text-(--hq-dim)">
                {g}
              </h2>
              <button type="button" onClick={() => openAll(SERVICES.filter((s) => s.group === g))} className="text-[12px] font-semibold text-(--hq-faint) hover:text-(--hq-gold-hi)">
                Open group ↗
              </button>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {SERVICES.filter((s) => s.group === g).map((s, i) => (
                <li key={s.id} className="hq-card hq-card-link hq-rise flex flex-col p-4" style={{ animationDelay: `${gi * 60 + i * 30}ms` }}>
                  <a href={s.href} target="_blank" rel="noreferrer" className="flex items-center gap-3.5 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-(--hq-gold)">
                    <Tile s={s} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] font-semibold">{s.name}</span>
                      <span className="block truncate text-[13px] text-(--hq-dim)">{s.what}</span>
                    </span>
                    <span aria-hidden="true" className="text-(--hq-faint)">
                      ↗
                    </span>
                  </a>
                  {s.note && <p className="mt-2 text-[12px] text-(--hq-warn)">{s.note}</p>}
                  {s.quick && (
                    <div className="mt-3 flex flex-wrap gap-1.5 border-t border-(--hq-line) pt-3">
                      {s.quick.map((q) => (
                        <a key={q.href} href={q.href} target="_blank" rel="noreferrer" className="rounded-full border border-(--hq-line) px-2.5 py-1 text-[12px] text-(--hq-dim) hover:border-(--hq-line-hi) hover:text-(--hq-text)">
                          {q.label}
                        </a>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
