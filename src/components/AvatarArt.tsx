import { useId, type ReactNode } from "react";
import { OM_PATH } from "@/lib/om-path";

// The twelve profile pictures, each a small painting on a dark round ground with gold light.
// Drawn as SVG so they stay sharp at any size and weigh almost nothing. Colours are fixed (they
// are pictures, not interface), so they look the same in the dark and light themes.
const GOLD = "#e3b341";
const GOLD_LIGHT = "#f6dc95";
const CREAM = "#fff6dc";

type Scene = { ground: [string, string]; draw: (u: (name: string) => string, ref: (name: string) => string) => ReactNode };

const ring = (count: number, radius: number, cx = 48, cy = 46) =>
  Array.from({ length: count }, (_, i) => {
    const a = (i / count) * Math.PI * 2 + Math.PI / 2;
    return { x: cx + Math.cos(a) * radius, y: cy + Math.sin(a) * radius, a };
  });

const SCENES: Record<string, Scene> = {
  // A clay lamp with a steady flame
  diya: {
    ground: ["#402a08", "#0b0704"],
    draw: (u, ref) => (
      <>
        <defs>
          <radialGradient id={u("glow")}>
            <stop offset="0" stopColor={GOLD_LIGHT} stopOpacity=".75" />
            <stop offset="1" stopColor={GOLD} stopOpacity="0" />
          </radialGradient>
          <linearGradient id={u("flame")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={CREAM} />
            <stop offset="1" stopColor="#f0a92c" />
          </linearGradient>
          <linearGradient id={u("clay")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#d49a3a" />
            <stop offset="1" stopColor="#6b4310" />
          </linearGradient>
        </defs>
        <circle cx="48" cy="40" r="30" fill={ref("glow")} />
        <path d="M48 20c6 9 9.500 15.500 9.500 21.500a9.500 9.500 0 0 1-19 0C38.500 35.500 42 29 48 20z" fill={ref("flame")} />
        <path d="M48 33c2.800 4 4 7 4 9.600a4 4 0 0 1-8 0c0-2.600 1.200-5.600 4-9.600z" fill="#fffaf0" />
        <path d="M21 57h54c-2 13-12.500 20-27 20s-25-7-27-20z" fill={ref("clay")} />
        <ellipse cx="48" cy="57" rx="27" ry="4.200" fill="#f0c468" />
        <ellipse cx="48" cy="57" rx="21" ry="2.600" fill="#8a5a16" />
      </>
    ),
  },

  // The Om, in gold
  om: {
    ground: ["#33290a", "#070602"],
    draw: (u, ref) => (
      <>
        <defs>
          <linearGradient id={u("om")} x1=".15" y1="1" x2=".85" y2="0">
            <stop offset="0" stopColor={CREAM} />
            <stop offset="1" stopColor="#b98a1e" />
          </linearGradient>
          <radialGradient id={u("glow")}>
            <stop offset="0" stopColor={GOLD} stopOpacity=".35" />
            <stop offset="1" stopColor={GOLD} stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="48" cy="48" r="38" fill={ref("glow")} />
        <path d={OM_PATH} fill={ref("om")} transform="translate(48 49) scale(0.062 -0.062) translate(-493 -427)" />
      </>
    ),
  },

  // A lotus open on still water
  lotus: {
    ground: ["#421638", "#0d0510"],
    draw: (u, ref) => {
      const petal = "M48 22C58 35 58 52 48 66C38 52 38 35 48 22z";
      return (
        <>
          <defs>
            <linearGradient id={u("petal")} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ffe3ec" />
              <stop offset="1" stopColor="#e2709c" />
            </linearGradient>
            <linearGradient id={u("back")} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#f3a6c2" />
              <stop offset="1" stopColor="#a8406e" />
            </linearGradient>
          </defs>
          <ellipse cx="48" cy="69" rx="36" ry="6" fill={GOLD} opacity=".18" />
          <path d="M18 74h60M28 80h40" stroke={GOLD} strokeWidth="1.200" strokeLinecap="round" opacity=".45" />
          {[-62, 62, -34, 34].map((deg) => (
            <path key={deg} d={petal} fill={ref("back")} transform={`rotate(${deg} 48 66)`} />
          ))}
          <path d={petal} fill={ref("petal")} />
          <circle cx="48" cy="60" r="3" fill={GOLD_LIGHT} />
        </>
      );
    },
  },

  // A crescent moon over quiet hills
  moon: {
    ground: ["#1a2350", "#04050d"],
    draw: (u, ref) => (
      <>
        <defs>
          <mask id={u("crescent")}>
            <rect width="96" height="96" fill="#fff" />
            <circle cx="55" cy="33" r="15.500" fill="#000" />
          </mask>
          <radialGradient id={u("glow")}>
            <stop offset="0" stopColor={GOLD_LIGHT} stopOpacity=".4" />
            <stop offset="1" stopColor={GOLD_LIGHT} stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="46" cy="38" r="30" fill={ref("glow")} />
        <circle cx="46" cy="38" r="18" fill={GOLD_LIGHT} mask={ref("crescent")} />
        {[
          [70, 24, 1.300],
          [76, 44, 0.900],
          [22, 22, 1],
          [16, 46, 0.800],
          [62, 58, 0.800],
        ].map(([x, y, r]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill={CREAM} opacity=".9" />
        ))}
        <path d="M0 80Q22 64 42 75T96 68V96H0z" fill="#0c1026" />
        <path d="M0 88Q30 76 56 86T96 82V96H0z" fill="#070916" />
      </>
    ),
  },

  // Snow peaks catching the first light
  himalaya: {
    ground: ["#27345c", "#090b16"],
    draw: (u, ref) => (
      <>
        <defs>
          <linearGradient id={u("snow")} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={CREAM} />
            <stop offset="1" stopColor="#e9b655" />
          </linearGradient>
          <radialGradient id={u("dawn")}>
            <stop offset="0" stopColor={GOLD} stopOpacity=".5" />
            <stop offset="1" stopColor={GOLD} stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="66" cy="34" r="30" fill={ref("dawn")} />
        <path d="M6 82 42 26l19 29 10-14 21 41z" fill="#2c3657" />
        <path d="M42 26 31 43.500l7-3.500 5 7.500 5-7.500 5.500 4z" fill={ref("snow")} />
        <path d="m71 41-6 8.500 5-1.800 3.500 4.300 3.500-2z" fill={ref("snow")} />
        <path d="M0 96V78q24-10 48-2t48-4v24z" fill="#0a0d1c" />
      </>
    ),
  },

  // The sun rising over a river
  sun: {
    ground: ["#4a1f06", "#0a0502"],
    draw: (u, ref) => (
      <>
        <defs>
          <radialGradient id={u("glow")}>
            <stop offset="0" stopColor="#ffd98a" stopOpacity=".7" />
            <stop offset="1" stopColor="#f0a92c" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={u("sun")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={CREAM} />
            <stop offset="1" stopColor="#f0a92c" />
          </linearGradient>
        </defs>
        <circle cx="48" cy="56" r="40" fill={ref("glow")} />
        <circle cx="48" cy="56" r="17" fill={ref("sun")} />
        <rect y="58" width="96" height="38" fill="#0b0603" />
        <path d="M30 64h36M35 70h26M40 76h16M44 82h8" stroke="#f0b949" strokeWidth="2" strokeLinecap="round" opacity=".8" />
      </>
    ),
  },

  // The eye of a peacock feather
  peacock: {
    ground: ["#073a34", "#020d0c"],
    draw: () => (
      <>
        {ring(26, 34, 48, 42).map(({ x, y }, i) => (
          <path key={i} d={`M48 44L${x.toFixed(1)} ${y.toFixed(1)}`} stroke="#3fb07a" strokeWidth="1" strokeLinecap="round" opacity=".55" />
        ))}
        <path d="M48 62V96" stroke={GOLD_LIGHT} strokeWidth="1.600" strokeLinecap="round" />
        <ellipse cx="48" cy="42" rx="19" ry="25" fill="#1f8a5b" />
        <ellipse cx="48" cy="43" rx="14.500" ry="19.500" fill="#d1a52c" />
        <ellipse cx="48" cy="44" rx="10.500" ry="14.500" fill="#16a3a8" />
        <ellipse cx="48" cy="46.500" rx="6.500" ry="8.500" fill="#1c2c8c" />
      </>
    ),
  },

  // A string of prayer beads
  mala: {
    ground: ["#33200c", "#090502"],
    draw: (u, ref) => (
      <>
        <defs>
          <radialGradient id={u("bead")} cx=".35" cy=".3">
            <stop offset="0" stopColor="#e2a868" />
            <stop offset="1" stopColor="#6b3d14" />
          </radialGradient>
          <radialGradient id={u("guru")} cx=".35" cy=".3">
            <stop offset="0" stopColor={CREAM} />
            <stop offset="1" stopColor="#c28f1f" />
          </radialGradient>
        </defs>
        <circle cx="48" cy="44" r="25" fill="none" stroke="#8a5a16" strokeWidth="1" />
        {ring(18, 25, 48, 44)
          .slice(1)
          .map(({ x, y }, i) => (
            <circle key={i} cx={x} cy={y} r="4" fill={ref("bead")} />
          ))}
        <path d="M48 75v6m-3 0 3 9 3-9z" stroke={GOLD} strokeWidth="1.400" strokeLinejoin="round" fill={GOLD} />
        <circle cx="48" cy="69.500" r="5.500" fill={ref("guru")} />
      </>
    ),
  },

  // A temple bell
  bell: {
    ground: ["#44190a", "#0c0503"],
    draw: (u, ref) => (
      <>
        <defs>
          <linearGradient id={u("brass")} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#a8751c" />
            <stop offset=".4" stopColor={GOLD_LIGHT} />
            <stop offset="1" stopColor="#8a5a16" />
          </linearGradient>
        </defs>
        <path d="M48 0v17" stroke="#c9952b" strokeWidth="2" strokeDasharray="3 2.500" />
        <circle cx="48" cy="21" r="4" fill="none" stroke={GOLD_LIGHT} strokeWidth="2.200" />
        <path d="M48 25c-12 0-16 11-16 25 0 8-3.500 12-6.500 16h45c-3-4-6.500-8-6.500-16 0-14-4-25-16-25z" fill={ref("brass")} />
        <rect x="23" y="65" width="50" height="5" rx="2.500" fill="#f0c468" />
        <circle cx="48" cy="76.500" r="4.500" fill="#d9a53a" />
      </>
    ),
  },

  // A banyan tree, its roots hanging down
  banyan: {
    ground: ["#18330f", "#050a04"],
    draw: (u, ref) => (
      <>
        <defs>
          <radialGradient id={u("leaf")} cx=".4" cy=".3">
            <stop offset="0" stopColor="#7fc46a" />
            <stop offset="1" stopColor="#245a2c" />
          </radialGradient>
        </defs>
        <path d="M26 46v24M34 50v17M62 50v19M71 46v22" stroke="#b08a4a" strokeWidth="1.200" strokeLinecap="round" opacity=".8" />
        <path d="M43 80c2-10 2-20 0-30h10c-2 10-2 20 0 30 3 2 6 3 9 3H34c3 0 6-1 9-3z" fill="#7a5226" />
        <circle cx="30" cy="40" r="14" fill={ref("leaf")} />
        <circle cx="66" cy="40" r="14" fill={ref("leaf")} />
        <circle cx="48" cy="31" r="18" fill={ref("leaf")} />
        <circle cx="42" cy="26" r="2" fill={GOLD_LIGHT} opacity=".7" />
        <circle cx="58" cy="34" r="1.500" fill={GOLD_LIGHT} opacity=".6" />
        <circle cx="28" cy="36" r="1.500" fill={GOLD_LIGHT} opacity=".6" />
      </>
    ),
  },

  // A bamboo flute
  flute: {
    ground: ["#2d1238", "#0a040d"],
    draw: (u, ref) => (
      <>
        <defs>
          <linearGradient id={u("bamboo")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={GOLD_LIGHT} />
            <stop offset="1" stopColor="#a8751c" />
          </linearGradient>
        </defs>
        <g transform="rotate(-32 48 48)">
          <rect x="8" y="43" width="80" height="10" rx="5" fill={ref("bamboo")} />
          {[20, 70].map((x) => (
            <rect key={x} x={x} y="43" width="2.500" height="10" fill="#7a4f12" opacity=".7" />
          ))}
          {[30, 39, 48, 57].map((x) => (
            <circle key={x} cx={x} cy="48" r="1.900" fill="#3a2408" />
          ))}
          <path d="M80 53c1 6-1 11-4 15M83 53c2 6 2 11 0 16" stroke="#e2709c" strokeWidth="1.500" strokeLinecap="round" fill="none" />
        </g>
      </>
    ),
  },

  // A conch shell, blown at the start of prayer
  conch: {
    ground: ["#0f3145", "#030a10"],
    draw: (u, ref) => (
      <>
        <defs>
          <linearGradient id={u("shell")} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fffaf0" />
            <stop offset="1" stopColor="#d2ab6c" />
          </linearGradient>
        </defs>
        <path
          d="M27 40c0-14 13-23 28-20 15 3 21 17 15 30-6 12-20 22-37 29 6-11 5-19 0-26-4-4-6-8-6-13z"
          fill={ref("shell")}
        />
        <path d="M32 32c8-7 22-9 32-3M29 40c10-7 27-8 40-1M41 24c5-1.500 11-1.500 16 0" stroke="#8a6a36" strokeWidth="1.700" strokeLinecap="round" fill="none" />
        <path d="M41 47c11 6 12 17-3 30" stroke="#8a6a36" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M33 79c-3 2-6 3-9 3" stroke="#d2ab6c" strokeWidth="2.400" strokeLinecap="round" />
      </>
    ),
  },
};

// One profile picture, round, at any size
export function AvatarArt({ id, size, className = "" }: { id: string; size?: number; className?: string }) {
  const uid = useId();
  const scene = SCENES[id];
  if (!scene) return null;
  const u = (name: string) => `${uid}${name}`;
  const ref = (name: string) => `url(#${uid}${name})`;
  return (
    <svg
      viewBox="0 0 96 96"
      width={size}
      height={size}
      aria-hidden="true"
      className={`block shrink-0 rounded-full ${className}`}
    >
      <defs>
        <radialGradient id={u("ground")} cx=".5" cy=".42" r=".7">
          <stop offset="0" stopColor={scene.ground[0]} />
          <stop offset="1" stopColor={scene.ground[1]} />
        </radialGradient>
      </defs>
      <rect width="96" height="96" fill={ref("ground")} />
      {scene.draw(u, ref)}
      {/* A hairline of gold round the edge, so the picture reads as a coin on any background */}
      <circle cx="48" cy="48" r="47.250" fill="none" stroke={GOLD} strokeOpacity=".35" strokeWidth="1.500" />
    </svg>
  );
}
