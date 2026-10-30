"use client";

import { useEffect, useRef } from "react";

type Props = {
  size?: number;
  state?: "idle" | "thinking" | "speaking";
  // The big Om right above a question box (home, Ask): a little larger glow
  hero?: boolean;
  className?: string;
};

// SwamiGPT's mark, its "thinking" sign and its voice: an Om drawn with gold dots. The dots come
// from the ॐ glyph in the Tiro Devanagari font; each gets a little depth, so the Om tilts gently
// in 3D, shimmers, and a bright line scans down through it. Big ones (90px and up) have a ring of
// dots orbiting around; small ones use fewer, bigger dots so the shape stays clear. It moves faster
// while thinking and pulses while speaking. Colours follow the theme (--om-near, --om-far, --om-glow
// in globals.css). People who ask their phone to reduce motion get one still frame. It only
// animates while on screen and the tab is visible.

type Dot = [x: number, y: number, z: number, phase: number];
type RGB = [number, number, number];
type Mask = { data: Uint8ClampedArray; minX: number; maxX: number; minY: number; maxY: number };

const S = 240;
const masks = new Map<string, Mask>();

// The glyph's pixels, drawn once per font (and again once the Devanagari part of the font arrives)
function omMask(family: string, fresh = false): Mask | null {
  const hit = masks.get(family);
  if (hit && !fresh) return hit;
  const oc = document.createElement("canvas");
  oc.width = oc.height = S;
  const o = oc.getContext("2d");
  if (!o) return null;
  o.fillStyle = "#fff";
  o.textAlign = "center";
  o.textBaseline = "middle";
  o.font = `200px ${family}, "Kohinoor Devanagari", "Noto Sans Devanagari", serif`;
  o.fillText("ॐ", S / 2, S * 0.56);
  const data = o.getImageData(0, 0, S, S).data;
  let minX = S, maxX = 0, minY = S, maxY = 0;
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      if (data[(y * S + x) * 4 + 3] > 120) {
        minX = Math.min(minX, x); maxX = Math.max(maxX, x);
        minY = Math.min(minY, y); maxY = Math.max(maxY, y);
      }
    }
  }
  const mask = { data, minX, maxX, minY, maxY };
  masks.set(family, mask);
  return mask;
}

// One dot every `step` pixels of the glyph, centred and scaled to -1..1
function sampleOm(mask: Mask, step: number): Dot[] {
  const { data, minX, maxX, minY, maxY } = mask;
  const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
  const half = Math.max(maxX - minX, maxY - minY) / 2 || 1;
  const out: Dot[] = [];
  for (let y = minY; y <= maxY; y += step) {
    for (let x = minX; x <= maxX; x += step) {
      if (data[(Math.round(y) * S + Math.round(x)) * 4 + 3] > 120) {
        out.push([(x - cx) / half, (y - cy) / half, (Math.random() - 0.5) * 0.28, Math.random() * 6.28]);
      }
    }
  }
  return out;
}

function toRGB(css: string, fallback: RGB): RGB {
  const m = css.trim().match(/^#([0-9a-f]{6})$/i);
  if (!m) return fallback;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function Om({ size = 120, state = "idle", hero = false, className = "" }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  // Read by the running animation, so a change of state doesn't restart it
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    const cv = ref.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx) return;
    const root = document.documentElement;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const px = size * dpr;
    cv.width = cv.height = px;

    // Big ones leave room for the orbiting ring; small ones let the Om fill the space
    const ring = size >= 90;
    const half = size * (ring ? 0.324 : 0.44); // the Om's half-width, in CSS px

    let near: RGB = [246, 220, 149], far: RGB = [156, 116, 25], glow: RGB = [227, 179, 65];
    const readColours = () => {
      const s = getComputedStyle(root);
      near = toRGB(s.getPropertyValue("--om-near"), near);
      far = toRGB(s.getPropertyValue("--om-far"), far);
      glow = toRGB(s.getPropertyValue("--om-glow"), glow);
    };
    readColours();

    // About 1.7px between dots on big ones (the full ~1,500); small ones pack them a little tighter
    // and brighter, and tilt less, so the shape still reads at the size of a letter
    const target = ring ? 1.7 : 1.15, tilt = ring ? 1 : 0.45, floor = ring ? 0.4 : 0.7;
    let om: Dot[] = [], gap = target;
    const build = (mask: Mask | null) => {
      if (!mask) return;
      const w = Math.max(mask.maxX - mask.minX, mask.maxY - mask.minY) || 1;
      const step = Math.max(3, (w * target) / (2 * half));
      gap = (2 * half * step) / w;
      om = sampleOm(mask, step);
    };
    const family = getComputedStyle(root).getPropertyValue("--font-tiro").trim() || '"Tiro Devanagari Sanskrit"';
    build(omMask(family));
    let alive = true;
    document.fonts?.load(`200px ${family}`, "ॐ").then(() => {
      if (!alive) return;
      build(omMask(family, true));
      if (reduce.matches) draw(1.2);
    }, () => {});

    const mix = (a: RGB, b: RGB, t: number) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
    const dot = (x: number, y: number, r: number, c: number[], a: number) => {
      ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${a})`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, 6.2832);
      ctx.fill();
    };

    function draw(t: number) {
      const c = px / 2, k = dpr, speaking = stateRef.current === "speaking";
      ctx!.clearRect(0, 0, px, px);
      const breathe = speaking ? 0.5 + 0.5 * Math.sin(t * 8) : 0.5 + 0.5 * Math.sin(t * 1.4);
      const R = half * dpr * (speaking ? 1 + 0.04 * breathe : 1);
      // The glow fades out before the canvas edge, so it never shows a square
      const g = ctx!.createRadialGradient(c, c, 0, c, c, Math.min(R * 1.4, c));
      const strength = hero ? 0.4 : 0.22;
      g.addColorStop(0, `rgba(${glow[0]},${glow[1]},${glow[2]},${strength * (0.6 + 0.4 * breathe)})`);
      g.addColorStop(0.55, `rgba(${glow[0]},${glow[1]},${glow[2]},${strength * 0.3 * (0.6 + 0.4 * breathe)})`);
      g.addColorStop(1, `rgba(${glow[0]},${glow[1]},${glow[2]},0)`);
      ctx!.fillStyle = g;
      ctx!.fillRect(0, 0, px, px);

      // Tilt: a slow sway left and right, a smaller nod up and down
      const ry = Math.sin(t * 0.55) * 0.55 * tilt, rx = Math.sin(t * 0.37) * 0.12 * tilt;
      const cy = Math.cos(ry), sy = Math.sin(ry), cx = Math.cos(rx), sx = Math.sin(rx);
      const scanY = Math.sin(t * 0.9);
      const lift = hero ? 0.1 : 0;
      for (const [x0, y0, z0, ph] of om) {
        const buzz = 0.012 * Math.sin(t * 10 + ph * 4) * (0.5 + breathe);
        const x = x0 * cy + z0 * sy + buzz;
        let z = -x0 * sy + z0 * cy, y = y0 + buzz;
        const y2 = y * cx - z * sx;
        z = y * sx + z * cx;
        y = y2;
        const p = 3 / (3 + z), d = Math.min(1, Math.max(0, (z + 0.6) / 1.2));
        const lit = Math.abs(y0 - scanY) < 0.06;
        dot(c + x * R * p, c + y * R * p, (lit ? 0.45 : (ring ? 0.22 : 0.3) + 0.16 * (1 - d)) * gap * k,
          lit ? near : mix(near, far, d), lit ? 1 : Math.min(1, floor + lift + 0.6 * (1 - d)));
      }
      if (!ring) return;
      // The orbiting ring, with a bright stretch chasing round it
      const n = Math.round((72 * size) / 170), rr = R * 1.36, rk = (k * size) / 170;
      for (let i = 0; i < n; i++) {
        const a = t * 0.3 + (i / n) * 6.2832, on = Math.sin(a * 2 - t * 1.5) > 0.3;
        dot(c + Math.cos(a) * rr, c + Math.sin(a) * rr * 0.98, (on ? 0.6 : 0.35) * rk, on ? mix(near, far, 0.35) : far, on ? 0.8 : 0.3);
      }
    }

    // Thinking runs the clock faster, so the Om sways and scans more quickly
    let raf = 0, visible = true, last = performance.now(), clock = 0;
    const frame = (now: number) => {
      clock += ((now - last) / 1000) * (stateRef.current === "thinking" ? 2.6 : 1);
      last = now;
      draw(clock);
      raf = requestAnimationFrame(frame);
    };
    const update = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      if (reduce.matches) draw(1.2);
      else if (visible && !document.hidden) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; update(); });
    io.observe(cv);
    // Re-read the colours when the theme changes (Settings → Appearance, or the phone's own setting)
    const dark = matchMedia("(prefers-color-scheme: dark)");
    const recolour = () => { readColours(); if (reduce.matches) draw(1.2); };
    const mo = new MutationObserver(recolour);
    mo.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    dark.addEventListener("change", recolour);
    reduce.addEventListener("change", update);
    document.addEventListener("visibilitychange", update);
    update();

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      mo.disconnect();
      dark.removeEventListener("change", recolour);
      reduce.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", update);
    };
  }, [size, hero]);

  return (
    <canvas
      ref={ref}
      className={`shrink-0 ${hero ? "om-hero" : ""} ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    />
  );
}
