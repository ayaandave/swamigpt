"use client";

import { useEffect, useRef } from "react";

// The home screen's circle: an Om drawn with about 1,500 gold dots. The dots come from the ॐ glyph
// in the Tiro Devanagari font; each gets a little depth, so the Om tilts gently in 3D, shimmers,
// and a bright line scans down through it, with a ring of dots orbiting around. Colours follow the
// theme (--om-near, --om-far, --om-glow in globals.css). People who ask their phone to reduce
// motion get one still frame. It only animates while on screen and the tab is visible.

type Dot = [x: number, y: number, z: number, phase: number];
type RGB = [number, number, number];

const CSS_SIZE = 170;

function sampleOm(family: string): Dot[] {
  const S = 240;
  const oc = document.createElement("canvas");
  oc.width = oc.height = S;
  const o = oc.getContext("2d");
  if (!o) return [];
  o.fillStyle = "#fff";
  o.textAlign = "center";
  o.textBaseline = "middle";
  o.font = `200px ${family}, "Kohinoor Devanagari", "Noto Sans Devanagari", serif`;
  o.fillText("ॐ", S / 2, S * 0.56);
  const data = o.getImageData(0, 0, S, S).data;
  const out: [number, number][] = [];
  let minX = S, maxX = 0, minY = S, maxY = 0;
  for (let y = 0; y < S; y += 3) {
    for (let x = 0; x < S; x += 3) {
      if (data[(y * S + x) * 4 + 3] > 120) {
        out.push([x, y]);
        minX = Math.min(minX, x); maxX = Math.max(maxX, x);
        minY = Math.min(minY, y); maxY = Math.max(maxY, y);
      }
    }
  }
  const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
  const half = Math.max(maxX - minX, maxY - minY) / 2 || 1;
  return out.map(([x, y]) => [(x - cx) / half, (y - cy) / half, (Math.random() - 0.5) * 0.28, Math.random() * 6.28]);
}

function toRGB(css: string, fallback: RGB): RGB {
  const m = css.trim().match(/^#([0-9a-f]{6})$/i);
  if (!m) return fallback;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function OmDots({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx) return;
    const root = document.documentElement;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const size = CSS_SIZE * dpr;
    cv.width = cv.height = size;

    let near: RGB = [246, 220, 149], far: RGB = [156, 116, 25], glow: RGB = [227, 179, 65];
    const readColours = () => {
      const s = getComputedStyle(root);
      near = toRGB(s.getPropertyValue("--om-near"), near);
      far = toRGB(s.getPropertyValue("--om-far"), far);
      glow = toRGB(s.getPropertyValue("--om-glow"), glow);
    };
    readColours();

    const family = getComputedStyle(root).getPropertyValue("--font-tiro").trim() || '"Tiro Devanagari Sanskrit"';
    let om = sampleOm(family);
    let alive = true;
    // The Devanagari part of the font arrives on demand; resample once it is here
    document.fonts?.load(`200px ${family}`, "ॐ").then(() => {
      if (!alive) return;
      om = sampleOm(family);
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
      const c = size / 2, R = size * 0.36, k = size / 340;
      ctx!.clearRect(0, 0, size, size);
      const breathe = 0.5 + 0.5 * Math.sin(t * 1.4);
      const g = ctx!.createRadialGradient(c, c, 0, c, c, R * 1.25);
      g.addColorStop(0, `rgba(${glow[0]},${glow[1]},${glow[2]},${0.22 * (0.6 + 0.4 * breathe)})`);
      g.addColorStop(1, `rgba(${glow[0]},${glow[1]},${glow[2]},0)`);
      ctx!.fillStyle = g;
      ctx!.fillRect(0, 0, size, size);

      // Tilt: a slow sway left and right, a smaller nod up and down
      const ry = Math.sin(t * 0.55) * 0.55, rx = Math.sin(t * 0.37) * 0.12;
      const cy = Math.cos(ry), sy = Math.sin(ry), cx = Math.cos(rx), sx = Math.sin(rx);
      const scanY = Math.sin(t * 0.9);
      for (const [x0, y0, z0, ph] of om) {
        const buzz = 0.012 * Math.sin(t * 10 + ph * 4) * (0.5 + breathe);
        const x = x0 * cy + z0 * sy + buzz;
        let z = -x0 * sy + z0 * cy, y = y0 + buzz;
        const y2 = y * cx - z * sx;
        z = y * sx + z * cx;
        y = y2;
        const p = 3 / (3 + z), d = Math.min(1, Math.max(0, (z + 0.6) / 1.2));
        const lit = Math.abs(y0 - scanY) < 0.06;
        dot(c + x * R * 0.9 * p, c + y * R * 0.9 * p, (lit ? 1.5 : 0.75 + 0.55 * (1 - d)) * k,
          lit ? near : mix(near, far, d), lit ? 1 : 0.4 + 0.6 * (1 - d));
      }
      // The orbiting ring, with a bright stretch chasing round it
      const n = 72, rr = R * 1.22;
      for (let i = 0; i < n; i++) {
        const a = t * 0.3 + (i / n) * 6.2832, on = Math.sin(a * 2 - t * 1.5) > 0.3;
        dot(c + Math.cos(a) * rr, c + Math.sin(a) * rr * 0.98, (on ? 1.2 : 0.7) * k, on ? mix(near, far, 0.35) : far, on ? 0.8 : 0.3);
      }
    }

    let raf = 0, visible = true;
    const t0 = performance.now();
    const frame = (now: number) => {
      draw((now - t0) / 1000);
      raf = requestAnimationFrame(frame);
    };
    const update = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      if (reduce.matches) draw(1.2);
      else if (visible && !document.hidden) raf = requestAnimationFrame(frame);
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
  }, []);

  return <canvas ref={ref} className={className} style={{ width: CSS_SIZE, height: CSS_SIZE }} aria-hidden="true" />;
}
