// A thin gold line drawing of the Varanasi ghats at dawn: temples and old houses on the left,
// steps down to the Ganga, a far shore on the right and one small boat. It sits behind the home
// hero so the Om rises over the river like the sun. Pure decoration: hidden from screen readers,
// never clickable. The fades and the slow shine live in globals.css (.ghats).

const B = 104; // top of the ghat steps, where the near buildings stand
const H = 118; // the water line

type Part =
  | { k: "block"; w: number; h: number; arches?: number }
  | { k: "chhatri"; w: number; h: number }
  | { k: "shikhara"; w: number; h: number; base: number; flag?: boolean };

// Walks left to right along the roofs and returns one outline plus small details (windows, spires).
function skyline(x0: number, ground: number, parts: Part[]) {
  let x = x0;
  let d = `M${x0 - 30} ${ground}L${x0} ${ground}`;
  const details: string[] = [];
  for (const p of parts) {
    const cx = x + p.w / 2;
    if (p.k === "block") {
      const top = ground - p.h;
      d += `L${x} ${top}L${x + p.w} ${top}`;
      if (p.arches) {
        const gap = p.w / (p.arches + 1);
        for (let i = 1; i <= p.arches; i++) {
          const wx = x + gap * i - 2.5;
          const wy = top + 14;
          details.push(`M${wx} ${wy}V${wy - 4}A2.5 2.5 0 0 1 ${wx + 5} ${wy - 4}V${wy}`);
        }
      }
    } else if (p.k === "chhatri") {
      const top = ground - p.h;
      const r = p.w * 0.3;
      d += `L${x} ${top}L${cx - r} ${top}A${r} ${r * 1.15} 0 0 1 ${cx + r} ${top}L${x + p.w} ${top}`;
      details.push(`M${cx} ${top - r * 1.15}V${top - r * 1.15 - 5}`);
    } else {
      const yb = ground - p.base;
      const yt = yb - p.h;
      const xl = x + p.w * 0.12;
      const xr = x + p.w * 0.88;
      const a = p.w * 0.09;
      d +=
        `L${x} ${yb}L${xl} ${yb}` +
        `C${xl} ${yb - p.h * 0.55} ${cx - p.w * 0.17} ${yt + p.h * 0.1} ${cx - a} ${yt + 3}` +
        `A${a} 3 0 0 1 ${cx + a} ${yt + 3}` +
        `C${cx + p.w * 0.17} ${yt + p.h * 0.1} ${xr} ${yb - p.h * 0.55} ${xr} ${yb}` +
        `L${x + p.w} ${yb}`;
      details.push(`M${cx} ${yb}V${yt + 8}`, `M${cx} ${yt}V${yt - 7}`);
      if (p.flag) details.push(`M${cx} ${yt - 7}V${yt - 17}L${cx + 8} ${yt - 14}L${cx} ${yt - 11}`);
    }
    x += p.w;
  }
  d += `L${x} ${ground}L${x + 40} ${ground}`;
  return { d, details, end: x };
}

const near = skyline(240, B, [
  { k: "block", w: 34, h: 26, arches: 2 },
  { k: "block", w: 28, h: 38 },
  { k: "chhatri", w: 30, h: 44 },
  { k: "block", w: 40, h: 34, arches: 3 },
  { k: "shikhara", w: 40, h: 46, base: 22 },
  { k: "block", w: 26, h: 50 },
  { k: "chhatri", w: 28, h: 56 },
  { k: "block", w: 36, h: 42, arches: 3 },
  { k: "shikhara", w: 58, h: 66, base: 26, flag: true },
  { k: "block", w: 30, h: 48, arches: 2 },
  { k: "chhatri", w: 24, h: 40 },
  { k: "block", w: 34, h: 30, arches: 2 },
  { k: "shikhara", w: 30, h: 30, base: 16 },
  { k: "block", w: 30, h: 20 },
]);

const far = skyline(1010, H, [
  { k: "block", w: 20, h: 8 },
  { k: "block", w: 16, h: 12 },
  { k: "chhatri", w: 14, h: 15 },
  { k: "block", w: 22, h: 10 },
  { k: "shikhara", w: 18, h: 16, base: 8 },
  { k: "block", w: 30, h: 9 },
  { k: "block", w: 18, h: 13 },
  { k: "block", w: 26, h: 7 },
  { k: "chhatri", w: 12, h: 11 },
  { k: "block", w: 40, h: 6 },
  { k: "block", w: 24, h: 9 },
  { k: "block", w: 30, h: 4 },
]);

// The ghat itself: a few long steps under the near buildings, and short flights down to the water
const steps = [
  `M210 ${B}H${near.end + 40}L${near.end + 70} ${H}`,
  `M220 109H${near.end + 50}`,
  `M230 114H${near.end + 60}`,
  ...[300, 438, 596].flatMap((x) => [`M${x} ${B}L${x + 12} ${H}`, `M${x + 6} ${B}L${x + 18} ${H}`]),
];

// Broken lines on the water: the near shore's reflection, then calmer ripples further out
const ripples = [
  { d: `M230 123H${near.end}`, dash: "34 10 18 14", o: 0.55 },
  { d: `M260 129H${near.end - 30}`, dash: "16 12 28 18", o: 0.4 },
  { d: "M120 136H1480", dash: "60 26 18 40", o: 0.3 },
  { d: "M0 144H1600", dash: "28 44 90 30", o: 0.2 },
];

function Drawing() {
  return (
    <svg viewBox="0 0 1600 150" preserveAspectRatio="xMidYMax slice" className="h-full w-full" fill="none">
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <path d={`M0 ${H}H1600`} strokeWidth={1} vectorEffect="non-scaling-stroke" />
        <path d={near.d} strokeWidth={1.1} vectorEffect="non-scaling-stroke" />
        <path d={far.d} strokeWidth={0.8} opacity={0.6} vectorEffect="non-scaling-stroke" />
        <path d={[...near.details, ...far.details].join("")} strokeWidth={0.7} opacity={0.55} vectorEffect="non-scaling-stroke" />
        <path d={steps.join("")} strokeWidth={0.7} opacity={0.5} vectorEffect="non-scaling-stroke" />
        {/* the boat: a low hull, a small canopy, one oar */}
        <path
          d="M842 122Q866 131 894 121M854 123V116Q862 110 870 116V125M888 122L902 131"
          strokeWidth={0.9}
          vectorEffect="non-scaling-stroke"
        />
        <path d="M848 135H888M858 140H880" strokeWidth={0.7} opacity={0.35} vectorEffect="non-scaling-stroke" />
        {ripples.map((r) => (
          <path key={r.d} d={r.d} strokeDasharray={r.dash} strokeWidth={0.7} opacity={r.o} vectorEffect="non-scaling-stroke" />
        ))}
      </g>
    </svg>
  );
}

export function Ghats() {
  return (
    <div aria-hidden className="ghats pointer-events-none select-none">
      <Drawing />
      <div className="ghats-shine">
        <Drawing />
      </div>
    </div>
  );
}
