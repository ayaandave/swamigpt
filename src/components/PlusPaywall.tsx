"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { closePaywall, markSeen, onPaywall, openPaywall, paywallReason, type PaywallReason } from "@/lib/paywall";
import { PLUS } from "@/lib/plans";
import { plusSold, usePlus } from "@/lib/plus";
import { VOICE_FALLBACK } from "@/lib/speak";
import { accessToken, useAuth } from "@/lib/supabase";
import { OmMark } from "./OmMark";
import { PlusPlans } from "./PlusPlans";

const TITLES: Record<PaywallReason, string> = {
  questions: "Keep asking today",
  voice: "Keep hearing Swamiji",
  tap: "SwamiGPT Plus",
};

const LINES: Record<PaywallReason, string> = {
  questions: `You've asked your ${PLUS.questions.free} questions for today. Plus lets you keep going.`,
  voice: "You've used your answers read aloud for now, so the phone's own voice is reading. Plus gives you many more.",
  tap: "More questions each day, and Swamiji reads your answers aloud.",
};

const BENEFITS = [
  `${PLUS.questions.plus} questions a day, not ${PLUS.questions.free}`,
  `Swamiji reads about ${PLUS.readAloud.plus} answers aloud a month`,
  "The same best answers as everyone. We never make free ones worse",
];

// The Plus popup (see lib/paywall for when it opens). Always easy to close: SwamiGPT stays free.
export function PlusPaywall() {
  const reason = useSyncExternalStore(onPaywall, paywallReason, () => null);
  const close = useRef<HTMLButtonElement>(null);

  const { user } = useAuth();
  const { plus } = usePlus();

  useEffect(markSeen, []);

  // Swamiji's voice fell back to the phone's own: if a free account has used up its read-aloud, offer Plus
  useEffect(() => {
    if (!user || plus !== false || !plusSold()) return;
    let asked = false;
    const onFallback = async () => {
      if (asked) return;
      asked = true;
      const token = await accessToken();
      const res = await fetch("/api/plus/voice", { headers: { authorization: `Bearer ${token}` } }).catch(() => null);
      const { usedUp } = ((await res?.json().catch(() => null)) ?? {}) as { usedUp?: boolean };
      if (usedUp) openPaywall("voice");
    };
    window.addEventListener(VOICE_FALLBACK, onFallback);
    return () => window.removeEventListener(VOICE_FALLBACK, onFallback);
  }, [user, plus]);

  useEffect(() => {
    if (!reason) return;
    close.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closePaywall();
    window.addEventListener("keydown", onKey);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [reason]);

  if (!reason) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-kajal/50 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))] sm:items-center"
      onClick={(e) => e.target === e.currentTarget && closePaywall()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="plus-title"
        className="arrive relative max-h-full w-full max-w-md overflow-y-auto rounded-3xl border border-sandal-edge bg-sandal-deep p-6 text-left shadow-xl"
      >
        <button
          ref={close}
          type="button"
          onClick={closePaywall}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 flex size-11 items-center justify-center rounded-full text-[1.3rem] text-kajal-soft hover:bg-sandal hover:text-kajal"
        >
          ✕
        </button>
        <div className="flex flex-col items-center text-center">
          <OmMark size={44} />
          <h2 id="plus-title" className="mt-3 font-display text-[1.6rem] leading-[1.15]">
            {TITLES[reason]}
          </h2>
          <p className="mt-2 text-[1rem] text-kajal-soft">{LINES[reason]}</p>
        </div>
        <ul className="mt-5 flex flex-col gap-2 text-[1rem]">
          {BENEFITS.map((b) => (
            <li key={b} className="flex gap-3">
              <span aria-hidden="true" className="font-bold text-kesar-deep">
                ✓
              </span>
              {b}
            </li>
          ))}
        </ul>
        <PlusPlans inPopup />
      </div>
    </div>
  );
}

// "See SwamiGPT Plus" under an out-of-questions reply: opens the popup
export function SeePlusButton() {
  return (
    <button
      type="button"
      onClick={() => openPaywall("tap")}
      className="flex min-h-14 w-fit items-center rounded-xl bg-kesar px-7 text-[1.05rem] font-bold text-on-kesar hover:bg-kesar-deep hover:text-sandal"
    >
      See SwamiGPT Plus
    </button>
  );
}

// The gentle note when 2 or fewer questions are left today
export function LeftNote({ left }: { left: number }) {
  return (
    <p className="max-w-[62ch] text-[0.9rem] text-kajal-soft">
      {left === 1 ? "1 question" : `${left} questions`} left today. Plus gives you {PLUS.questions.plus} a day.{" "}
      <button
        type="button"
        onClick={() => openPaywall("tap")}
        className="font-semibold text-kesar-deep underline underline-offset-4"
      >
        See Plus
      </button>
    </p>
  );
}
