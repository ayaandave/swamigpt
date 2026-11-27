import { useEffect, useId, useRef, useState, type ReactNode } from "react";

// Building blocks for SwamiGPT HQ: cards, big numbers that count up, trend lines, charts, lists.

// "1 question", "3 questions"
export const plural = (n: number, word: string) => `${Math.round(n).toLocaleString("en-US")} ${word}${Math.round(n) === 1 ? "" : "s"}`;

export const fmt = {
  int: (n: number) => Math.round(n).toLocaleString("en-US"),
  compact: (n: number) => (Math.abs(n) >= 10000 ? new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n) : Math.round(n).toLocaleString("en-US")),
  usd: (n: number) => `$${n.toFixed(2)}`,
  usd0: (n: number) => `$${n.toFixed(n < 10 ? 2 : 0)}`,
  pct: (n: number) => `${Math.round(n * 100)}%`,
  day: (iso: string) => new Date(iso.slice(0, 10) + "T00:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" }),
  ago: (iso: string) => {
    const s = (Date.now() - new Date(iso).getTime()) / 1000;
    if (s < 60) return "just now";
    if (s < 3600) return `${Math.round(s / 60)} min ago`;
    if (s < 86400) return `${Math.round(s / 3600)} h ago`;
    return `${Math.round(s / 86400)} days ago`;
  },
};

const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// A number that rolls up to its value the first time it appears (and glides on later changes)
export function CountUp({ value, format = fmt.int }: { value: number; format?: (n: number) => string }) {
  const [shown, setShown] = useState(value);
  const from = useRef(0);
  useEffect(() => {
    if (reduced()) {
      from.current = value;
      setShown(value); // eslint-disable-line react-hooks/set-state-in-effect -- no animation wanted
      return;
    }
    const start = performance.now();
    const a = from.current;
    let raf = 0;
    const tick = (t: number) => {
      const k = Math.min(1, (t - start) / 900);
      const e = 1 - Math.pow(1 - k, 3);
      setShown(a + (value - a) * e);
      if (k < 1) raf = requestAnimationFrame(tick);
      else from.current = value;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <span className="tabular-nums">{format(shown)}</span>;
}

export function Card({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <div className={`hq-card hq-rise p-5 ${className}`} style={{ animationDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

export function Label({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`text-[11px] font-semibold uppercase tracking-[0.16em] text-(--hq-dim) ${className}`}>{children}</p>;
}

export function SectionTitle({ title, sub, right }: { title: string; sub?: string; right?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-[28px] font-semibold tracking-[-0.03em] sm:text-[34px]">{title}</h1>
        {sub && <p className="mt-1 text-[15px] text-(--hq-dim)">{sub}</p>}
      </div>
      {right}
    </div>
  );
}

export function CardTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="text-[15px] font-semibold tracking-[-0.01em]">{children}</h2>
      {right}
    </div>
  );
}

export type Tone = "good" | "warn" | "bad" | "idle";
const TONE: Record<Tone, string> = { good: "var(--hq-good)", warn: "var(--hq-warn)", bad: "var(--hq-bad)", idle: "var(--hq-faint)" };

export function Dot({ tone, pulse }: { tone: Tone; pulse?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block size-2 shrink-0 rounded-full ${pulse ? "hq-pulse" : ""}`}
      style={{ background: TONE[tone], color: `color-mix(in srgb, ${TONE[tone]} 45%, transparent)` }}
    />
  );
}

export function Pill({ tone = "idle", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] font-medium"
      style={{ borderColor: `color-mix(in srgb, ${TONE[tone]} 35%, transparent)`, color: tone === "idle" ? "var(--hq-dim)" : TONE[tone] }}
    >
      {children}
    </span>
  );
}

// Change between the first and second half of a series, as "▲ 12%"
export function Trend({ values, invert }: { values: number[]; invert?: boolean }) {
  if (values.length < 4) return null;
  const half = Math.floor(values.length / 2);
  const a = values.slice(0, half).reduce((t, v) => t + v, 0);
  const b = values.slice(half).reduce((t, v) => t + v, 0);
  if (a === 0 && b === 0) return null;
  const change = a === 0 ? 1 : (b - a) / a;
  if (Math.abs(change) < 0.01) return null;
  const up = change >= 0;
  const good = invert ? !up : up;
  return (
    <span className="text-[12px] font-semibold tabular-nums" style={{ color: good ? "var(--hq-good)" : "var(--hq-bad)" }}>
      {up ? "▲" : "▼"} {Math.min(999, Math.abs(Math.round(change * 100)))}%
    </span>
  );
}

// A small trend line with a soft glow under it
export function Spark({ values, color = "var(--hq-gold)", height = 44 }: { values: number[]; color?: string; height?: number }) {
  const id = useId().replace(/:/g, "");
  if (values.length < 2) return <div style={{ height }} />;
  const W = 200;
  const max = Math.max(...values, 1);
  const pts = values.map((v, i) => [(i / (values.length - 1)) * W, height - 3 - (v / max) * (height - 8)]);
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${height}`} preserveAspectRatio="none" className="w-full" style={{ height }} aria-hidden="true">
      <defs>
        <linearGradient id={`s${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.35" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${line} L${W},${height} L0,${height} Z`} fill={`url(#s${id})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="1.75" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

// A full chart: area or bars over days, with a hover/tap readout and a table for screen readers
export function Chart({
  points,
  format,
  color = "var(--hq-gold)",
  kind = "area",
  height = 200,
  empty = "Nothing yet.",
  total: showTotal = true,
}: {
  points: { label: string; value: number }[];
  format: (n: number) => string;
  color?: string;
  kind?: "area" | "bars";
  height?: number;
  empty?: string;
  total?: boolean; // false for running counts like followers, where adding the days up means nothing
}) {
  const [hover, setHover] = useState<number | null>(null);
  const id = useId().replace(/:/g, "");
  const max = Math.max(...points.map((p) => p.value), 0);
  if (!points.length || max === 0) return <p className="grid place-items-center text-[14px] text-(--hq-dim)" style={{ height: height / 2 }}>{empty}</p>;
  const W = 600;
  const H = height;
  const n = points.length;
  const x = (i: number) => (kind === "bars" ? ((i + 0.5) / n) * W : (i / Math.max(1, n - 1)) * W);
  const y = (v: number) => H - 4 - (v / max) * (H - 16);
  const line = points.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(" ");
  const shown = hover ?? n - 1;
  const total = points.reduce((t, p) => t + p.value, 0);
  const pick = (clientX: number, el: SVGSVGElement) => {
    const r = el.getBoundingClientRect();
    const k = (clientX - r.left) / r.width;
    setHover(Math.max(0, Math.min(n - 1, kind === "bars" ? Math.floor(k * n) : Math.round(k * (n - 1)))));
  };
  return (
    <figure>
      <div className="mb-2 flex items-baseline justify-between gap-3 text-[13px]" aria-hidden="true">
        <span>
          <span className="text-(--hq-dim)">{points[shown].label}</span>{" "}
          <strong className="text-[15px] tabular-nums">{format(points[shown].value)}</strong>
        </span>
        {showTotal && (
          <span className="text-(--hq-dim)">
            Total <strong className="text-(--hq-text) tabular-nums">{format(total)}</strong>
          </span>
        )}
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="w-full touch-pan-y"
        style={{ height: H }}
        aria-hidden="true"
        onMouseMove={(e) => pick(e.clientX, e.currentTarget)}
        onTouchMove={(e) => pick(e.touches[0].clientX, e.currentTarget)}
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id={`c${id}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={color} stopOpacity="0.32" />
            <stop offset="1" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((g) => (
          <line key={g} x1="0" x2={W} y1={H * g} y2={H * g} stroke="rgba(255,255,255,0.05)" strokeDasharray="2 6" vectorEffect="non-scaling-stroke" />
        ))}
        <line x1="0" x2={W} y1={H - 0.5} y2={H - 0.5} stroke="var(--hq-line)" vectorEffect="non-scaling-stroke" />
        {kind === "area" ? (
          <>
            <path d={`${line} L${W},${H} L0,${H} Z`} fill={`url(#c${id})`} />
            <path d={line} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
            <line x1={x(shown)} x2={x(shown)} y1="0" y2={H} stroke="rgba(255,255,255,0.15)" vectorEffect="non-scaling-stroke" />
          </>
        ) : (
          points.map((p, i) => {
            const bw = (W / n) * 0.62;
            const h = p.value > 0 ? Math.max(3, H - 4 - y(p.value) + 4) : 0;
            return (
              <rect
                key={i}
                x={x(i) - bw / 2}
                y={H - h}
                width={bw}
                height={h}
                rx={Math.min(3, bw / 2)}
                fill={color}
                opacity={hover === null || hover === i ? 0.9 : 0.35}
              />
            );
          })
        )}
      </svg>
      {kind === "area" && (
        // The dot sits outside the stretched SVG so it stays round
        <div className="relative -mt-0 h-0" aria-hidden="true">
          <span
            className="absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-4"
            style={{
              left: `${(x(shown) / W) * 100}%`,
              top: -(H - y(points[shown].value)),
              background: color,
              ["--tw-ring-color" as string]: `color-mix(in srgb, ${color} 25%, transparent)`,
            }}
          />
        </div>
      )}
      <figcaption className="mt-2 flex justify-between text-[11px] text-(--hq-faint)" aria-hidden="true">
        <span>{points[0].label}</span>
        <span>{points[n - 1].label}</span>
      </figcaption>
      <table className="sr-only">
        <tbody>
          {points.map((p) => (
            <tr key={p.label}>
              <th>{p.label}</th>
              <td>{format(p.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

// A ranked list with thin bars behind the numbers
export function BarList({ items, format = fmt.int, color = "var(--hq-gold)", empty = "Nothing yet." }: { items: { name: string; value: number; sub?: string }[]; format?: (n: number) => string; color?: string; empty?: string }) {
  const max = Math.max(...items.map((i) => i.value), 0);
  if (!items.length || max === 0) return <p className="text-[14px] text-(--hq-dim)">{empty}</p>;
  return (
    <ul className="space-y-1.5">
      {items.map((it) => (
        <li key={it.name} className="relative overflow-hidden rounded-lg px-3 py-2">
          <span
            aria-hidden="true"
            className="absolute inset-y-0 left-0 rounded-lg"
            style={{ width: `${Math.max(2, (it.value / max) * 100)}%`, background: `color-mix(in srgb, ${color} 13%, transparent)` }}
          />
          <span className="relative flex items-center justify-between gap-3 text-[14px]">
            <span className="min-w-0 truncate">
              {it.name}
              {it.sub && <span className="ml-2 text-[12px] text-(--hq-dim)">{it.sub}</span>}
            </span>
            <span className="shrink-0 font-semibold tabular-nums">{format(it.value)}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

// Shown where a number needs a key or setup step first
export function Setup({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-(--hq-line-hi) bg-[rgba(227,179,65,0.04)] p-4 text-[14px] leading-relaxed text-(--hq-dim)">
      <span className="mr-1.5 font-semibold text-(--hq-gold-hi)">Setup needed.</span>
      {children}
    </div>
  );
}

export function Problem({ children }: { children: ReactNode }) {
  return <p className="rounded-xl border border-[rgba(255,93,98,0.25)] bg-[rgba(255,93,98,0.06)] p-3 text-[14px] text-[#ff9a9d]">{children}</p>;
}

export function Skeleton({ h = 120 }: { h?: number }) {
  return <div className="hq-loading rounded-[20px] border border-(--hq-line)" style={{ height: h }} />;
}

// A big headline number with its label, trend and spark line
export function Metric({
  label,
  value,
  format,
  series,
  color,
  sub,
  invert,
  onClick,
  delay,
}: {
  label: string;
  value: number | null;
  format?: (n: number) => string;
  series?: number[];
  color?: string;
  sub?: string;
  invert?: boolean;
  onClick?: () => void;
  delay?: number;
}) {
  const body = (
    <>
      <div className="flex items-center justify-between gap-2">
        <Label>{label}</Label>
        {series && <Trend values={series} invert={invert} />}
      </div>
      <p className="mt-2 text-[32px] font-semibold leading-none tracking-[-0.03em]">
        {value == null ? <span className="text-(--hq-faint)">—</span> : <CountUp value={value} format={format} />}
      </p>
      {sub && <p className="mt-1.5 truncate text-[12px] text-(--hq-dim)">{sub}</p>}
      {series && (
        <div className="-mx-1 mt-3">
          <Spark values={series} color={color} />
        </div>
      )}
    </>
  );
  return onClick ? (
    <button type="button" onClick={onClick} className="hq-card hq-card-link hq-rise block w-full p-5 text-left" style={{ animationDelay: `${delay ?? 0}ms` }}>
      {body}
    </button>
  ) : (
    <div className="hq-card hq-rise p-5" style={{ animationDelay: `${delay ?? 0}ms` }}>
      {body}
    </div>
  );
}
