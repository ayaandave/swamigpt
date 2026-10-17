"use client";

import { useState } from "react";
import { useSettings } from "@/lib/settings";
import { cancelDailyVerse, isNativeApp, scheduleDailyVerse } from "@/lib/native";
import { useIsClient } from "@/lib/store";

// In the iPhone app only: a gentle notification each morning with today's verse
export function MorningVerse() {
  const isClient = useIsClient();
  const { dailyVerse, update } = useSettings();
  const [problem, setProblem] = useState("");
  if (!isClient || !isNativeApp()) return null;

  const set = async (on: boolean, time = dailyVerse.time) => {
    setProblem("");
    if (on) {
      const ok = await scheduleDailyVerse(time);
      if (!ok) {
        setProblem("Notifications are off for SwamiGPT. Turn them on in your iPhone's Settings → SwamiGPT → Notifications.");
        update({ dailyVerse: { on: false, time } });
        return;
      }
    } else {
      await cancelDailyVerse();
    }
    update({ dailyVerse: { on, time } });
  };

  return (
    <section className="mt-12">
      <h2 className="font-display text-[1.6rem]">Morning verse</h2>
      <p className="mt-1 text-[1rem] text-kajal-soft">A gentle notification each day with today&apos;s verse.</p>
      <div className="mt-4 flex flex-wrap items-center gap-4">
        <button
          type="button"
          role="switch"
          aria-checked={dailyVerse.on}
          onClick={() => void set(!dailyVerse.on)}
          className={`min-h-14 rounded-full px-6 font-semibold ${dailyVerse.on ? "bg-tulsi text-sandal" : "border-2 border-kajal"}`}
        >
          {dailyVerse.on ? "On" : "Turn on"}
        </button>
        <label className="flex min-h-14 items-center gap-3 text-[1.05rem]">
          At
          <input
            type="time"
            value={dailyVerse.time}
            onChange={(e) => void set(dailyVerse.on, e.target.value || "07:30")}
            className="min-h-12 rounded-xl border-2 border-sandal-edge bg-white/60 px-3 text-[1.05rem]"
          />
        </label>
      </div>
      {problem && <p className="mt-3 text-[1rem] text-kumkum">{problem}</p>}
    </section>
  );
}
