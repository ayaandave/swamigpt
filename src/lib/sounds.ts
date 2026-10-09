"use client";

// Little sounds for the mala, made live in the browser (no audio files).
// Only ever played in response to a tap or drag, so browsers allow them.

let ctx: AudioContext | null = null;
const audio = () => {
  if (typeof window === "undefined") return null;
  ctx ??= new AudioContext();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
};

// A small temple bell: a few inharmonic partials with long, soft decays
export function playChime(delaySeconds = 0) {
  const c = audio();
  if (!c) return;
  const t = c.currentTime + delaySeconds;
  const base = 659.25; // E5
  [
    [1, 0.16, 3.2],
    [2.01, 0.07, 2.2],
    [2.76, 0.05, 1.6],
    [5.4, 0.025, 0.9],
  ].forEach(([ratio, level, decay]) => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = "sine";
    o.frequency.value = base * ratio;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(level, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
    o.connect(g).connect(c.destination);
    o.start(t);
    o.stop(t + decay + 0.1);
  });
}

// A soft wooden click as a bead passes the fingers
export function playClick() {
  const c = audio();
  if (!c) return;
  const t = c.currentTime;
  const noise = c.createBuffer(1, Math.floor(c.sampleRate * 0.03), c.sampleRate);
  const data = noise.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length) ** 3;
  const src = c.createBufferSource();
  src.buffer = noise;
  const band = c.createBiquadFilter();
  band.type = "bandpass";
  band.frequency.value = 1800;
  band.Q.value = 4;
  const g = c.createGain();
  g.gain.value = 0.35;
  src.connect(band).connect(g).connect(c.destination);
  src.start(t);
}
