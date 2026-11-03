"use client";

import Link from "next/link";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { aiConsentAsked, answerAiConsent, onAiConsentAsk } from "@/lib/ai-consent";

// Asked once, just before the first question is sent: what goes to the AI, who receives it, and
// a clear yes or no. Saying no keeps lessons, meditations and the library open.
export function AiConsent() {
  const open = useSyncExternalStore(onAiConsentAsk, aiConsentAsked, () => false);
  const agree = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    agree.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && answerAiConsent(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-kajal/40 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-consent-title"
        className="arrive w-full max-w-md rounded-3xl border border-sandal-edge bg-sandal p-6 text-left shadow-xl"
      >
        <h2 id="ai-consent-title" className="font-display text-[1.5rem] leading-[1.15]">
          Before you ask
        </h2>
        <p className="mt-3 text-[1.05rem]">
          To write an answer, SwamiGPT sends your question to <strong>Anthropic</strong>, the company that makes the
          Claude AI. It also sends your last few messages in this chat and your age group.
        </p>
        <p className="mt-3 text-[1.05rem] text-kajal-soft">
          Anthropic uses it only to write your answer and does not train its AI on it. We never sell it. Please
          don&apos;t share private details like your full name, address or phone number.
        </p>
        <Link href="/privacy" className="mt-3 inline-block text-[0.95rem] underline underline-offset-4">
          Read the privacy policy
        </Link>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => answerAiConsent(false)}
            className="min-h-14 rounded-2xl border border-sandal-edge px-4 text-[1.05rem] font-semibold hover:border-kesar hover:bg-sandal-deep"
          >
            Not now
          </button>
          <button
            ref={agree}
            type="button"
            onClick={() => answerAiConsent(true)}
            className="min-h-14 rounded-2xl bg-kesar px-4 text-[1.05rem] font-semibold text-on-kesar hover:bg-kesar-deep hover:text-sandal"
          >
            I agree
          </button>
        </div>
      </div>
    </div>
  );
}
