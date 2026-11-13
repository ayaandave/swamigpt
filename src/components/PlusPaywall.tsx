"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { closePaywall, markSeen, onPaywall, openPaywall, paywallReason, type PaywallReason } from "@/lib/paywall";
import { PLUS } from "@/lib/plans";
import { plusSold, usePlus } from "@/lib/plus";
import { VOICE_FALLBACK } from "@/lib/speak";
import { accessToken, useAuth } from "@/lib/supabase";
import { OmMark } from "./OmMark";
import { track } from "@/lib/events";
import { PlusPlans } from "./PlusPlans";

// Short, outcome-first headlines; the line under each says exactly what Plus changes right now
const TITLES: Record<PaywallReason, string> = {
  questions: "Keep asking today",
  voice: "Keep hearing Swamiji",
  tap: "Wisdom for whatever you're facing",
};

const LINES: Record<PaywallReason, string> = {
  questions: `You've used today's ${PLUS.questions.free} questions. Plus gives you up to ${PLUS.questions.plus} a day.`,
  voice: "You've used your answers read aloud for now, so the phone's own voice is reading. Plus gives you many more.",
  tap: "More questions each day, and Swamiji reads your answers aloud.",
};

const BENEFITS = [
  `${PLUS.questions.plus} questions a day, not ${PLUS.questions.free}`,
  `Swamiji reads about ${PLUS.readAloud.plus} answers aloud a month`,
  "The same best answers as everyone. We never make free ones worse",
];

const dismiss = (method: "x" | "maybe_later" | "outside" | "escape") => {
  track("paywall_dismissed", { method });
  closePaywall();
};

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
    track("paywall_viewed", { surface: reason === "tap" ? "button" : `gate_${reason}` });
    close.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && dismiss("escape");
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
      onClick={(e) => e.target === e.currentTarget && dismiss("outside")}
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
          onClick={() => dismiss("x")}
          aria-label="Close"
          className="absolute left-3 top-3 z-10 flex size-11 items-center justify-center rounded-full text-[1.3rem] text-kajal-soft hover:bg-sandal hover:text-kajal"
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
        <p className="mt-4 text-center text-[0.85rem] text-kajal-soft">
          Your conversations are private and never used to train public AI models. No ads, ever.
        </p>
        <button
          type="button"
          onClick={() => dismiss("maybe_later")}
          className="mx-auto mt-2 flex min-h-11 items-center px-4 text-[0.95rem] text-kajal-soft underline-offset-4 hover:text-kajal hover:underline"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}

// The gold "Plus" button in the header, for anyone who doesn't have Plus yet
export function HeaderPlusButton() {
  const { ready, user } = useAuth();
  const { plus } = usePlus();
  if (!ready || !plusSold() || (user && plus !== false)) return null;
  return (
    <button
      type="button"
      onClick={() => openPaywall("tap")}
      className="flex h-[44px] items-center justify-center gap-1 rounded-full bg-kesar px-[14px] text-[14px] font-bold text-on-kesar hover:bg-kesar-deep hover:text-sandal"
    >
      <span aria-hidden="true">✦</span> Plus
    </button>
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

// A calm count of today's questions, under the question box: information, never a sales pitch
export function QuestionsLeft({ left }: { left: number }) {
  if (left < 0 || left > PLUS.questions.plus) return null;
  return (
    <p className="mt-2 text-center text-[0.8rem] text-kajal-soft" aria-live="polite">
      {left === 0 ? "No questions left today. New ones come tomorrow." : `${left} ${left === 1 ? "question" : "questions"} left today`}
    </p>
  );
}
