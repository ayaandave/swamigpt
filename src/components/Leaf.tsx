import { useId } from "react";

type Props = {
  size?: number;
  state?: "idle" | "thinking" | "speaking";
  onDark?: boolean;
  className?: string;
};

// The golden peepal leaf: SwamiGPT's mark, its "thinking" indicator and its voice. The peepal is
// the ashvattha of Gita 15.1, the tree whose leaves are the hymns. A heart-shaped leaf with a long
// drip tip, its veins, and a soft glow. It sways gently, faster while thinking, and pulses while
// speaking (see .leaf-* in globals.css).
export function Leaf({ size = 120, state = "idle", onDark = false, className = "" }: Props) {
  const id = useId().replace(/:/g, "");
  const u = (name: string) => `url(#${name}-${id})`;
  return (
    <svg
      viewBox="0 0 120 130"
      width={size}
      height={(size * 130) / 120}
      className={`leaf-${state} ${className}`}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={`glow-${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffd38a" stopOpacity={onDark ? 0.75 : 0.55} />
          <stop offset="55%" stopColor="#ffb347" stopOpacity={onDark ? 0.25 : 0.18} />
          <stop offset="100%" stopColor="#ffb347" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`gold-${id}`} x1="0.15" y1="0" x2="0.85" y2="1">
          <stop offset="0%" stopColor="#ffeab5" />
          <stop offset="45%" stopColor={onDark ? "#ffc566" : "#f4b04a"} />
          <stop offset="100%" stopColor={onDark ? "#d9741a" : "#c25e10"} />
        </linearGradient>
        <linearGradient id={`sheen-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fff8e6" stopOpacity="0.85" />
          <stop offset="60%" stopColor="#fff8e6" stopOpacity="0" />
        </linearGradient>
      </defs>

      <circle className="leaf-glow" cx="60" cy="60" r="56" fill={u("glow")} />

      <g className="leaf-body">
        {/* The blade, with its long drip tip at the bottom */}
        <path
          d="M60 124 C59 118 58 111 56.5 105 C36 100 14 84 14 58 C14 34 34 16 60 8 C86 16 106 34 106 58 C106 84 84 100 63.5 105 C62 111 61 118 60 124 Z"
          fill={u("gold")}
        />
        {/* Light catching the upper-left of the leaf */}
        <path d="M60 12 C38 20 20 36 20 58 C20 66 22 72 26 78 C30 52 42 32 60 20 Z" fill={u("sheen")} />
        {/* Midrib and veins */}
        <g stroke={onDark ? "#8a4410" : "#7a3a0c"} strokeWidth="2.4" strokeLinecap="round" fill="none" opacity="0.7">
          <path d="M60 18 V112" />
          <path d="M60 36 Q52 32 40 28 M60 36 Q68 32 80 28" />
          <path d="M60 52 Q48 46 30 42 M60 52 Q72 46 90 42" />
          <path d="M60 68 Q48 63 30 62 M60 68 Q72 63 90 62" />
          <path d="M60 84 Q50 81 38 82 M60 84 Q70 81 82 82" />
        </g>
      </g>
    </svg>
  );
}
