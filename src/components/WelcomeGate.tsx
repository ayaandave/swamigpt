"use client";

import { usePathname } from "next/navigation";
import { useSettings, type AgeGroup } from "@/lib/settings";
import { Om } from "./Om";

// First-visit gate: a quiet greeting and one question. Hidden by CSS before first paint once
// answered (see settingsScript), so returning visitors go straight to the app. Never on the home
// screen: newcomers see what SwamiGPT is first, and are asked when they go further in.
export function WelcomeGate() {
  const { ageGroup, update } = useSettings();
  const path = usePathname();
  if (ageGroup || path === "/") return null;

  // Under-13s can use the app freely; making an account needs a parent (see the login page)
  const choose = (age: AgeGroup) => update({ ageGroup: age });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-title"
      className="welcome-gate fixed inset-0 z-50 flex flex-col items-center justify-center overflow-y-auto bg-sandal px-6 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] text-center"
    >
      <div className="arrive flex w-full max-w-md flex-col items-center">
        <Om size={120} />
        <h1 id="welcome-title" className="mt-5 font-display text-[2rem] leading-[1.1]">
          Namaste.
        </h1>
        <p className="mt-3 max-w-[26ch] text-[1.15rem] text-kajal-soft">
          A calm guide to life, the mind and the old teachings.
        </p>
        <div className="mt-10 w-full">
          <p className="mb-4 font-display text-[1.15rem]">How old are you?</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => choose("under13")}
              className="min-h-16 rounded-2xl border border-sandal-edge px-4 text-[1.1rem] font-semibold hover:border-kesar hover:bg-sandal-deep"
            >
              Under 13
            </button>
            <button
              type="button"
              onClick={() => choose("13plus")}
              className="min-h-16 rounded-2xl bg-kesar px-4 text-[1.1rem] font-semibold text-on-kesar hover:bg-kesar-deep hover:text-sandal"
            >
              13 or older
            </button>
          </div>
        </div>
        <p className="mt-10 text-[0.85rem] text-kajal-soft">An AI guide, not a guru.</p>
      </div>
    </div>
  );
}
