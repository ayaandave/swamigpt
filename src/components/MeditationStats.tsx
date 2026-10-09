"use client";

import { useMeditationLog } from "@/lib/meditation-log";

// "You've meditated 4 times, 32 minutes in all." Shown once there's something to show.
export function MeditationStats() {
  const { sessions, minutes } = useMeditationLog();
  if (!sessions) return null;
  return (
    <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-sandal-deep px-5 py-2.5 text-[1rem]">
      <span aria-hidden="true">🪔</span>
      You&apos;ve meditated {sessions === 1 ? "once" : `${sessions} times`}, {minutes} minutes in all.
    </p>
  );
}
