import { useId } from "react";

type Props = {
  size?: number;
  state?: "idle" | "thinking" | "speaking";
  onDark?: boolean;
  className?: string;
};

// The clay lamp: SwamiGPT's mark, its "thinking" indicator and its voice.
export function Diya({ size = 120, state = "idle", onDark = false, className = "" }: Props) {
  const id = useId().replace(/:/g, "");
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
          <stop offset="0%" stopColor="#ffd38a" stopOpacity={onDark ? 0.8 : 0.75} />
          <stop offset="55%" stopColor="#ffb347" stopOpacity={onDark ? 0.28 : 0.25} />
          <stop offset="100%" stopColor="#ffb347" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`flame-${id}`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#d9741a" />
          <stop offset="45%" stopColor="#ffb347" />
          <stop offset="100%" stopColor="#ffe9b8" />
        </linearGradient>
        <linearGradient id={`clay-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#b5602a" />
          <stop offset="100%" stopColor="#6e3413" />
        </linearGradient>
      </defs>

      <circle className="diya-halo" cx="60" cy="52" r="48" fill={`url(#halo-${id})`} />

      <g className="diya-flame">
        <path
          d="M60 14 C69 33 79 51 71 66 C67 74 53 74 49 66 C41 51 51 33 60 14 Z"
          fill={`url(#flame-${id})`}
        />
        <path d="M60 40 C64 50 67 58 63 64 C61 67 59 67 57 64 C53 58 56 50 60 40 Z" fill="#fff6dc" />
      </g>

      <line x1="60" y1="70" x2="60" y2="80" stroke="#2b1b10" strokeWidth="2.5" strokeLinecap="round" />

      <path
        d="M12 82 Q60 74 108 82 Q100 114 60 118 Q20 114 12 82 Z"
        fill={`url(#clay-${id})`}
      />
      <ellipse cx="60" cy="81" rx="46" ry="5.5" fill="#4a2410" />
      <ellipse cx="60" cy="80" rx="40" ry="3" fill="#c98a2e" opacity="0.7" />
      <circle cx="60" cy="100" r="3.2" fill="#a4281f" />
      <path d="M40 100 h8 M72 100 h8" stroke="#e8d2a8" strokeWidth="1.6" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}
