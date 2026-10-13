"use client";

/*
  Background sound made live in the browser, so meditations have atmosphere
  before we license or record real audio. Swap for recorded files later.
*/

type Stop = () => void;

// tonic: for "drone", the chanter's home note in Hz, so the drone is in tune with the voice
export function startAmbient(kind: string, tonic?: number): Stop {
  if (kind === "silence" || typeof window === "undefined") return () => {};
  const ctx = new AudioContext();
  const master = ctx.createGain();
  master.gain.value = 0;
  master.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 3);
  master.connect(ctx.destination);
  const timers: number[] = [];

  if (kind === "tanpura") {
    // Pa, Sa, Sa, low Sa — plucked in a slow cycle with long decays
    const sa = 138.59;
    const strings = [sa * 1.5, sa * 2, sa * 2, sa];
    let i = 0;
    const pluck = () => {
      const f = strings[i++ % strings.length];
      const t = ctx.currentTime;
      [1, 2, 3, 4.02].forEach((h, n) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.frequency.value = f * h;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.09 / (n + 1), t + 0.05);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 5.5);
        o.connect(g).connect(master);
        o.start(t);
        o.stop(t + 6);
      });
    };
    pluck();
    timers.push(window.setInterval(pluck, 1300));
  }

  if (kind === "drone" && tonic) {
    // A quiet tanpura under a chanted mantra: the home note and its octaves only (no fifth),
    // because Vedic chant moves just a step around that note
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.linearRampToValueAtTime(0.28, ctx.currentTime + 3);
    const strings = [tonic, tonic * 2, tonic * 2, tonic / 2];
    let i = 0;
    const pluck = () => {
      const f = strings[i++ % strings.length];
      const t = ctx.currentTime;
      [1, 2, 3, 4.02].forEach((h, n) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.frequency.value = f * h;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.08 / (n + 1), t + 0.08);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 6);
        o.connect(g).connect(master);
        o.start(t);
        o.stop(t + 6.5);
      });
    };
    pluck();
    timers.push(window.setInterval(pluck, 1500));
  }

  if (kind === "rain") {
    const len = ctx.sampleRate * 2;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 1200;
    const g = ctx.createGain();
    g.gain.value = 0.25;
    src.connect(lp).connect(g).connect(master);
    src.start();
  }

  if (kind === "bells") {
    const ring = () => {
      const t = ctx.currentTime;
      const base = 520 + Math.random() * 60;
      [1, 2.76, 5.4].forEach((h, n) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.frequency.value = base * h;
        g.gain.setValueAtTime(0.12 / (n + 1), t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 7);
        o.connect(g).connect(master);
        o.start(t);
        o.stop(t + 7);
      });
    };
    ring();
    timers.push(window.setInterval(ring, 9000));
  }

  let stopped = false;
  return () => {
    // Can be called twice (the player's stop and the page closing), so only fade out once
    if (stopped) return;
    stopped = true;
    timers.forEach(clearInterval);
    master.gain.linearRampToValueAtTime(0, ctx.currentTime + 1);
    setTimeout(() => ctx.state !== "closed" && void ctx.close().catch(() => {}), 1100);
  };
}
