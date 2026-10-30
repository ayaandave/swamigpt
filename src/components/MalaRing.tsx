"use client";

import { useEffect, useId, useRef } from "react";
import { playClick } from "@/lib/sounds";

type Props = {
  total: number;
  done: number[];
  size?: number;
  fresh?: number | null; // a bead just earned: it drops onto the string with a burst
  celebrate?: boolean; // the whole mala is complete: a glow runs round every bead
  interactive?: boolean; // drag to spin, tap a bead to open its lesson
  onBead?: (index: number) => void;
  canOpen?: (index: number) => boolean;
};

const GAP = 44; // degrees left open at the bottom for the guru bead and tassel

// A real mala: beads on a loop of thread, one per lesson, meeting at the guru bead.
export function MalaRing({
  total,
  done,
  size = 260,
  fresh = null,
  celebrate = false,
  interactive = false,
  onBead,
  canOpen = () => true,
}: Props) {
  const id = useId().replace(/:/g, "");
  const c = size / 2;
  const R = size * 0.36;
  const span = 360 - GAP;
  const step = total > 1 ? span / (total - 1) : 0;
  // Bead 1 sits beside the guru bead on the left; the beads climb round to the right
  const angleOf = (i: number) => 90 + GAP / 2 + i * step;
  const r = Math.min(size * 0.055, ((Math.PI * 2 * R * (span / 360)) / Math.max(total, 1)) * 0.4);
  // Rounded so server and browser agree to the last digit (their trig can differ in the 15th place)
  const round = (n: number) => Math.round(n * 100) / 100;
  // An invisible strip across each bead that can be opened, as wide as the gap to its neighbours
  // and reaching well inside and outside the ring, so a fingertip doesn't have to land exactly
  const hitWide = round(Math.max(r, R * Math.sin((step * Math.PI) / 360)) * 2);
  const hitLong = round(r * 4.4);
  const at = (deg: number, radius = R) => [
    round(c + radius * Math.cos((deg * Math.PI) / 180)),
    round(c + radius * Math.sin((deg * Math.PI) / 180)),
  ];
  const doneSet = new Set(done);
  const [gx, gy] = at(90);

  const { svgRef, groupRef } = useSpin({ enabled: interactive, center: c, stepDeg: step || 20, onTap: onBead, canOpen });

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${size} ${size * 1.12}`}
      width={size}
      height={size * 1.12}
      role="img"
      aria-label={`Mala: ${done.length} of ${total} beads earned`}
      className={`mala-ring select-none ${interactive ? "cursor-grab touch-none active:cursor-grabbing" : ""} ${
        fresh !== null ? "mala-sway" : ""
      }`}
    >
      <defs>
        <radialGradient id={`bead-${id}`} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#f6dc95" />
          <stop offset="45%" stopColor="#c8961f" />
          <stop offset="100%" stopColor="#5a4310" />
        </radialGradient>
        <radialGradient id={`empty-${id}`} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="var(--sandal-edge)" />
          <stop offset="100%" stopColor="var(--sandal-edge)" />
        </radialGradient>
        <radialGradient id={`guru-${id}`} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#f6dc95" />
          <stop offset="55%" stopColor="#e3b341" />
          <stop offset="100%" stopColor="#7a5a14" />
        </radialGradient>
        <radialGradient id={`glow-${id}`}>
          <stop offset="0%" stopColor="#f1d38a" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#e3b341" stopOpacity="0" />
        </radialGradient>
      </defs>

      <g ref={groupRef} style={{ transformOrigin: `${c}px ${c}px` }}>
        {/* the thread */}
        <circle cx={c} cy={c} r={R} fill="none" stroke="var(--sandal-edge)" strokeWidth={Math.max(1.5, size * 0.006)} opacity="0.7" />

        {Array.from({ length: total }, (_, i) => {
          const [x, y] = at(angleOf(i));
          const earned = doneSet.has(i);
          const isFresh = i === fresh;
          const open = interactive && onBead && canOpen(i);
          return (
            <g
              key={i}
              data-bead={i}
              transform={`translate(${x} ${y})`}
              role={open ? "button" : undefined}
              tabIndex={open ? 0 : undefined}
              aria-label={open ? `Lesson ${i + 1}${earned ? ", done" : ""}` : undefined}
              onKeyDown={open ? (e) => (e.key === "Enter" || e.key === " ") && onBead(i) : undefined}
              className={open ? "mala-bead-open outline-none" : undefined}
            >
              {open && (
                <rect
                  x={-hitLong / 2}
                  y={-hitWide / 2}
                  width={hitLong}
                  height={hitWide}
                  transform={`rotate(${round(angleOf(i))})`}
                  fill="#000"
                  fillOpacity={0}
                />
              )}
              {isFresh && <circle r={r} className="mala-ripple" fill="none" stroke="#e3b341" strokeWidth={2.5} />}
              {(isFresh || (celebrate && earned)) && (
                <circle
                  r={r * 2.4}
                  fill={`url(#glow-${id})`}
                  className={isFresh ? "mala-halo" : "mala-wave"}
                  style={{ animationDelay: celebrate ? `${i * 70}ms` : undefined }}
                />
              )}
              <g className={`mala-bead ${isFresh ? "mala-drop" : ""}`}>
                <circle
                  r={r}
                  fill={earned ? `url(#bead-${id})` : `url(#empty-${id})`}
                  stroke={earned ? "#5a4310" : "var(--sandal-edge)"}
                  strokeWidth={earned ? 0.8 : 1.5}
                />
                {earned && <circle cx={-r * 0.3} cy={-r * 0.35} r={r * 0.22} fill="#fff4e0" opacity="0.55" />}
              </g>
              {isFresh &&
                Array.from({ length: 10 }, (_, k) => (
                  <circle
                    key={k}
                    r={Math.max(2.5, r * (k % 2 ? 0.26 : 0.36))}
                    fill={k % 2 ? "#f1d38a" : "#e3b341"}
                    className="mala-spark"
                    style={
                      {
                        "--x": `${round(Math.cos((k * Math.PI) / 5) * r * (k % 2 ? 2.8 : 3.8))}px`,
                        "--y": `${round(Math.sin((k * Math.PI) / 5) * r * (k % 2 ? 2.8 : 3.8))}px`,
                      } as React.CSSProperties
                    }
                  />
                ))}
            </g>
          );
        })}

        {/* guru bead and tassel */}
        <g transform={`translate(${gx} ${gy})`}>
          <circle r={r * 1.45} fill={`url(#guru-${id})`} stroke="#5a4310" strokeWidth={0.8} />
          <circle cx={-r * 0.45} cy={-r * 0.5} r={r * 0.3} fill="#fff4e0" opacity="0.45" />
          <g className={`mala-tassel ${fresh !== null ? "mala-tassel-swing" : ""}`}>
            <rect x={-r * 0.35} y={r * 1.35} width={r * 0.7} height={r * 0.7} rx={r * 0.15} fill="#c8961f" />
            {[-0.5, -0.25, 0, 0.25, 0.5].map((dx) => (
              <line
                key={dx}
                x1={dx * r * 0.6}
                y1={r * 2}
                x2={dx * r * 1.4}
                y2={r * 4.6}
                stroke="#e3b341"
                strokeWidth={Math.max(1.5, r * 0.22)}
                strokeLinecap="round"
              />
            ))}
          </g>
        </g>
      </g>

      {/* count in the middle */}
      <text x={c} y={c - size * 0.01} textAnchor="middle" className="font-display" fontSize={size * 0.14} fill="var(--kajal)">
        {done.length}
        <tspan fontSize={size * 0.07} fill="var(--kajal-soft)">
          {" "}
          / {total}
        </tspan>
      </text>
      {size >= 160 && (
        <text x={c} y={c + size * 0.09} textAnchor="middle" fontSize={size * 0.05} fill="var(--kajal-soft)">
          {done.length === 1 ? "bead" : "beads"}
        </text>
      )}
    </svg>
  );
}

// Drag to spin the mala like counting japa; it clicks past each bead, then swings back to hang
// from the guru bead. A tap without dragging opens that bead's lesson.
function useSpin({
  enabled,
  center,
  stepDeg,
  onTap,
  canOpen,
}: {
  enabled: boolean;
  center: number;
  stepDeg: number;
  onTap?: (i: number) => void;
  canOpen: (i: number) => boolean;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const groupRef = useRef<SVGGElement>(null);
  const latest = useRef({ onTap, canOpen, stepDeg });
  useEffect(() => {
    latest.current = { onTap, canOpen, stepDeg };
  });

  useEffect(() => {
    const svg = svgRef.current;
    const group = groupRef.current;
    if (!enabled || !svg || !group) return;

    let angle = 0;
    let velocity = 0;
    let dragging = false;
    let moved = 0;
    let lastPointer = 0;
    let lastTime = 0;
    let lastTick = 0;
    let lastClickAt = 0;
    let frame = 0;

    const pointerAngle = (e: PointerEvent) => {
      const box = svg.getBoundingClientRect();
      const scale = box.width / svg.viewBox.baseVal.width;
      return (Math.atan2(e.clientY - box.top - center * scale, e.clientX - box.left - center * scale) * 180) / Math.PI;
    };
    const apply = () => {
      group.style.transform = `rotate(${angle}deg)`;
      const tick = Math.floor(angle / latest.current.stepDeg);
      if (tick !== lastTick) {
        lastTick = tick;
        const now = performance.now();
        if (now - lastClickAt > 45) {
          lastClickAt = now;
          playClick();
        }
      }
    };
    // Inertia, then a gentle pull back to hanging straight
    const settle = () => {
      const rest = Math.round(angle / 360) * 360;
      velocity = velocity * 0.94 + (rest - angle) * 0.012;
      angle += velocity;
      apply();
      if (Math.abs(velocity) > 0.02 || Math.abs(rest - angle) > 0.2) frame = requestAnimationFrame(settle);
      else {
        angle = 0;
        group.style.transform = "";
      }
    };

    const down = (e: PointerEvent) => {
      cancelAnimationFrame(frame);
      dragging = true;
      moved = 0;
      velocity = 0;
      lastPointer = pointerAngle(e);
      lastTime = performance.now();
      svg.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      const a = pointerAngle(e);
      let d = a - lastPointer;
      if (d > 180) d -= 360;
      if (d < -180) d += 360;
      const now = performance.now();
      velocity = (d / Math.max(now - lastTime, 1)) * 16;
      lastPointer = a;
      lastTime = now;
      moved += Math.abs(d);
      angle += d;
      apply();
    };
    const up = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      if (moved < 4) {
        // A tap: find the bead under the finger
        const bead = (document.elementFromPoint(e.clientX, e.clientY) as Element | null)?.closest("[data-bead]");
        const i = bead ? Number(bead.getAttribute("data-bead")) : NaN;
        const { onTap, canOpen } = latest.current;
        if (!Number.isNaN(i) && onTap && canOpen(i)) onTap(i);
      }
      frame = requestAnimationFrame(settle);
    };

    svg.addEventListener("pointerdown", down);
    svg.addEventListener("pointermove", move);
    svg.addEventListener("pointerup", up);
    svg.addEventListener("pointercancel", up);
    return () => {
      cancelAnimationFrame(frame);
      svg.removeEventListener("pointerdown", down);
      svg.removeEventListener("pointermove", move);
      svg.removeEventListener("pointerup", up);
      svg.removeEventListener("pointercancel", up);
    };
  }, [enabled, center]);

  return { svgRef, groupRef };
}
