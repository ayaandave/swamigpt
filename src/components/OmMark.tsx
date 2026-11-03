import { useId } from "react";
import { OM_PATH } from "@/lib/om-path";

// SwamiGPT's mark as a still, solid gold Om: the logo in the header and other small spots, matching
// the app icon. The moving dot Om (Om.tsx) is kept for the big ones above the question boxes.
export function OmMark({ size = 34, className = "" }: { size?: number; className?: string }) {
  const id = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" aria-hidden="true" className={`om-mark shrink-0 ${className}`}>
      <defs>
        {/* Bounding-box units, flipped like the Om: light at the top left */}
        <linearGradient id={id} x1=".15" y1="1" x2=".85" y2="0">
          <stop offset="0" style={{ stopColor: "var(--om-near)" }} />
          <stop offset="1" style={{ stopColor: "var(--om-far)" }} />
        </linearGradient>
      </defs>
      <path d={OM_PATH} fill={`url(#${id})`} transform="translate(60 61) scale(0.112 -0.112) translate(-493 -427)" />
    </svg>
  );
}
