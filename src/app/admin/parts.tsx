"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

// Pieces shared by the owner pages (/admin money and /admin/analytics)

// "Money · Analytics" switch at the top of each owner page
export function OwnerTabs() {
  const path = usePathname();
  const tabs = [
    { href: "/admin", label: "Money" },
    { href: "/admin/analytics", label: "Analytics" },
  ];
  return (
    <p className="flex items-center gap-3 text-[0.85rem] font-semibold uppercase tracking-[0.14em]">
      {tabs.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          aria-current={path === t.href ? "page" : undefined}
          className={path === t.href ? "text-kesar-deep" : "text-kajal-soft underline-offset-4 hover:text-kajal hover:underline"}
        >
          {t.label}
        </Link>
      ))}
      <span className="text-kajal-soft">· private</span>
    </p>
  );
}

export function Row({ name, value, note, problem }: { name: string; value: string; note: string; problem?: boolean }) {
  return (
    <li className="flex items-start justify-between gap-4 border-b border-sandal-edge py-4">
      <span className="min-w-0">
        <span className="block font-semibold">{name}</span>
        <span className={`block text-[0.9rem] ${problem ? "text-kumkum" : "text-kajal-soft"}`}>{note}</span>
      </span>
      <span className="shrink-0 font-display text-[1.2rem] tabular-nums">{value}</span>
    </li>
  );
}

export function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[0.85rem] text-kajal-soft">{label}</dt>
      <dd className="font-display text-[1.5rem] leading-tight">{value}</dd>
    </div>
  );
}

// One series of daily bars: thin, rounded at the top, one colour, with a hover/tap label and a
// table for screen readers
export function Bars({
  points,
  format,
  colorClass,
  empty,
}: {
  points: { label: string; value: number }[];
  format: (n: number) => string;
  colorClass: string;
  empty: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(...points.map((p) => p.value), 0);
  if (!points.length || max === 0) return <p className="mt-3 text-kajal-soft">{empty}</p>;
  const W = 600, H = 160, gap = 2;
  const bw = W / points.length;
  const shown = hover ?? points.length - 1;
  return (
    <figure className="mt-3">
      <p className="h-6 text-[0.95rem]" aria-hidden="true">
        <span className="text-kajal-soft">{points[shown].label}:</span> <strong>{format(points[shown].value)}</strong>
      </p>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-40 w-full" preserveAspectRatio="none" aria-hidden="true" onMouseLeave={() => setHover(null)}>
        <line x1="0" x2={W} y1={H - 0.5} y2={H - 0.5} className="stroke-sandal-edge" strokeWidth="1" />
        {points.map((p, i) => {
          const h = p.value > 0 ? Math.max(3, (p.value / max) * (H - 8)) : 0;
          const x = i * bw + gap / 2;
          const w = Math.max(1, bw - gap);
          const r = Math.min(4, w / 2, h);
          return (
            <g key={i} onMouseEnter={() => setHover(i)} onClick={() => setHover(i)}>
              {/* A tall invisible target, easier to hit than a thin bar */}
              <rect x={i * bw} y={0} width={bw} height={H} fill="transparent" />
              {h > 0 && (
                <path
                  className={`${colorClass} ${hover === i ? "opacity-100" : "opacity-85"}`}
                  d={`M${x},${H} V${H - h + r} Q${x},${H - h} ${x + r},${H - h} H${x + w - r} Q${x + w},${H - h} ${x + w},${H - h + r} V${H} Z`}
                />
              )}
            </g>
          );
        })}
      </svg>
      <figcaption className="mt-1 flex justify-between text-[0.8rem] text-kajal-soft" aria-hidden="true">
        <span>{points[0].label}</span>
        <span>{points[points.length - 1].label}</span>
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
