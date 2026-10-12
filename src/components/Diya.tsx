import { useId } from "react";

type Props = {
  size?: number;
  state?: "idle" | "thinking" | "speaking";
  onDark?: boolean;
  className?: string;
};

// The brass lamp: SwamiGPT's mark, its "thinking" indicator and its voice.
// A three-layer flame (ember edge, gold body, white heart) over a petalled brass bowl on a stand.
export function Diya({ size = 120, state = "idle", onDark = false, className = "" }: Props) {
  const id = useId().replace(/:/g, "");
  const u = (name: string) => `url(#${name}-${id})`;
  return (
    <svg
      viewBox="0 0 120 130"
      width={size}
      height={(size * 130) / 120}
      className={`diya-${state} ${className}`}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={`halo-${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffe2a6" stopOpacity={onDark ? 0.85 : 0.8} />
          <stop offset="45%" stopColor="#ffb347" stopOpacity={onDark ? 0.32 : 0.28} />
          <stop offset="100%" stopColor="#ff8a1f" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`outer-${id}`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#c2410c" />
          <stop offset="40%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#fdba74" stopOpacity="0.85" />
        </linearGradient>
        <linearGradient id={`mid-${id}`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="60%" stopColor="#fcd34d" />
          <stop offset="100%" stopColor="#fff1c2" />
        </linearGradient>
        <radialGradient id={`core-${id}`} cx="50%" cy="70%" r="60%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="70%" stopColor="#fff7dd" />
          <stop offset="100%" stopColor="#fde68a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`brass-${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#6b4310" />
          <stop offset="22%" stopColor="#c8902c" />
          <stop offset="42%" stopColor="#f6d77c" />
          <stop offset="58%" stopColor="#d9a441" />
          <stop offset="100%" stopColor="#5a370c" />
        </linearGradient>
        <linearGradient id={`shade-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#2b1606" stopOpacity="0.45" />
        </linearGradient>
        <radialGradient id={`oil-${id}`} cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#ffd27a" />
          <stop offset="60%" stopColor="#8a5a14" />
          <stop offset="100%" stopColor="#3d2406" />
        </radialGradient>
      </defs>

      <circle className="diya-halo" cx="60" cy="48" r="50" fill={u("halo")} />

      {/* Flame */}
      <g className="diya-flame">
        <path
          d="M60 8 C66 22 78 38 75 54 C73 66 66 72 60 72 C54 72 47 66 45 54 C42 38 55 26 60 8 Z"
          fill={u("outer")}
        />
        <path
          d="M60 24 C64 34 71 45 69 56 C68 64 64 68 60 68 C56 68 52 64 51 56 C49 45 56 36 60 24 Z"
          fill={u("mid")}
        />
        <ellipse className="diya-core" cx="60" cy="59" rx="6" ry="10" fill={u("core")} />
        <ellipse cx="60" cy="69" rx="3.4" ry="2.4" fill="#93c5fd" opacity="0.55" />
      </g>

      {/* Wick */}
      <path d="M60 70 q1.5 4 0 8" stroke="#1c1008" strokeWidth="2.6" strokeLinecap="round" fill="none" />

      {/* Stand: foot and stem */}
      <ellipse cx="60" cy="125" rx="26" ry="3.5" fill="#2b1606" opacity="0.28" />
      <path d="M38 124 Q60 114 82 124 Z" fill={u("brass")} />
      <path d="M53 104 Q60 100 67 104 L64 117 Q60 119 56 117 Z" fill={u("brass")} />
      <ellipse cx="60" cy="110" rx="5.5" ry="1.8" fill="#f6d77c" opacity="0.7" />

      {/* Bowl, with petals around its side */}
      <path d="M10 80 Q60 72 110 80 Q104 104 60 107 Q16 104 10 80 Z" fill={u("brass")} />
      <path d="M10 80 Q60 72 110 80 Q104 104 60 107 Q16 104 10 80 Z" fill={u("shade")} />
      <g fill="none" stroke="#7a4d10" strokeWidth="1.1" opacity="0.75">
        <path d="M26 88 q6 10 12 0 M42 90 q6 11 12 0 M58 90.5 q2 11 4 0 M66 90 q6 11 12 0 M82 88 q6 10 12 0" />
      </g>
      <g fill="#fbe39a" opacity="0.85">
        <circle cx="32" cy="98" r="1.1" />
        <circle cx="48" cy="100.5" r="1.1" />
        <circle cx="72" cy="100.5" r="1.1" />
        <circle cx="88" cy="98" r="1.1" />
      </g>
      <circle cx="60" cy="98" r="2.6" fill="#a4281f" />
      <path d="M30 84 Q44 81 54 82" stroke="#fff4c9" strokeWidth="1.6" strokeLinecap="round" opacity="0.7" fill="none" />

      {/* Rim and oil */}
      <ellipse cx="60" cy="79.5" rx="50" ry="6" fill={u("brass")} />
      <ellipse cx="60" cy="79.5" rx="44" ry="4" fill={u("oil")} />
      <ellipse className="diya-glint" cx="60" cy="78.6" rx="9" ry="1.3" fill="#ffe7a8" opacity="0.8" />
    </svg>
  );
}
