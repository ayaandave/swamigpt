// Progress as a string of mala beads: one bead per lesson, filled when done.
export function Mala({ total, done, onDark = false }: { total: number; done: number[]; onDark?: boolean }) {
  return (
    <div
      role="img"
      aria-label={`${done.length} of ${total} lessons done`}
      className="relative flex flex-wrap items-center gap-1.5"
    >
      {Array.from({ length: total }, (_, i) => {
        const filled = done.includes(i);
        return (
          <span
            key={i}
            className={`size-3.5 rounded-full ${
              filled
                ? "bg-tulsi shadow-[inset_-2px_-2px_0_rgba(0,0,0,.2)]"
                : onDark
                  ? "border-2 border-sandal/40"
                  : "border-2 border-sandal-edge bg-sandal"
            }`}
          />
        );
      })}
      <span className="ml-1 size-4 rotate-45 rounded-[3px] bg-kumkum" aria-hidden="true" />
    </div>
  );
}
