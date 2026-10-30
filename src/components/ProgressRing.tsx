// A thin gold ring showing how much of a course is done, with "3/18" in the middle.
export function ProgressRing({ done, total, size = 52 }: { done: number; total: number; size?: number }) {
  const r = 21;
  const length = 2 * Math.PI * r;
  const part = total ? Math.min(1, done / total) : 0;
  return (
    <svg viewBox="0 0 52 52" width={size} height={size} role="img" aria-label={`${done} of ${total} lessons done`}>
      <circle cx="26" cy="26" r={r} fill="none" strokeWidth="3" className="stroke-sandal-edge" />
      {part > 0 && (
        <circle
          cx="26"
          cy="26"
          r={r}
          fill="none"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={`${part * length} ${length}`}
          transform="rotate(-90 26 26)"
          className="stroke-kesar-deep drop-shadow-[0_0_6px_var(--glow)]"
        />
      )}
      <text
        x="26"
        y="30"
        textAnchor="middle"
        className={`font-mono text-[11px] font-medium ${part > 0 ? "fill-kajal" : "fill-kajal-soft"}`}
      >
        {done}/{total}
      </text>
    </svg>
  );
}
