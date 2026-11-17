"use client";

import { useState } from "react";
import type { SwamiAnswer } from "@/lib/swami";
import type { Depth } from "@/lib/settings";
import { accessToken } from "@/lib/supabase";
import { track } from "@/lib/events";

type Rating = 1 | -1;

// Thumb shapes (after Lucide's thumbs-up / thumbs-down, ISC licence), drawn in the app's line style
const Thumb = ({ down, filled }: { down?: boolean; filled?: boolean }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className={down ? "rotate-180" : undefined}
  >
    <path d="M7 10v12" />
    <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" />
  </svg>
);

// "Was this helpful?" with 👍/👎 under an answer. One tap, no form. A 👍 sends only the rating and
// which passages were quoted; a 👎 also sends the question and the answer, so a person can see what
// went wrong (said in the thank-you line, and in the privacy policy).
export function AnswerFeedback({ question, answer, depth }: { question: string; answer: SwamiAnswer; depth: Depth }) {
  const [rated, setRated] = useState<Rating | null>(null);
  const [state, setState] = useState<"idle" | "sending" | "sent" | "failed">("idle");

  const rate = async (rating: Rating) => {
    if (state === "sending" || state === "sent") return;
    setRated(rating);
    setState("sending");
    track("answer_rated", { helpful: rating === 1 });
    try {
      const token = await accessToken();
      const down = rating === -1;
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          rating,
          depth,
          verseIds: answer.verses.map(({ verse }) => verse.id),
          ...(down && {
            question: question.slice(0, 2000),
            answer: {
              paragraphs: answer.paragraphs,
              verses: answer.verses.map(({ verse, meaning }) => ({ id: verse.id, meaning })),
              practice: answer.practice?.href ?? null,
            },
          }),
        }),
      });
      // A daily limit reached still counts as heard: nothing more to do for them
      setState(res.ok || res.status === 429 ? "sent" : "failed");
    } catch {
      setState("failed");
    }
  };

  const button = (rating: Rating, label: string) => {
    const on = rated === rating;
    return (
      <button
        type="button"
        aria-label={label}
        aria-pressed={on}
        disabled={state === "sending" || state === "sent"}
        onClick={() => void rate(rating)}
        className={`flex size-11 items-center justify-center rounded-full border transition-colors ${
          on ? "border-kesar text-kesar-deep" : "border-sandal-edge text-kajal-soft hover:border-kajal hover:text-kajal"
        } disabled:cursor-default`}
      >
        <Thumb down={rating === -1} filled={on} />
      </button>
    );
  };

  return (
    <div className="flex flex-col gap-2" role="group" aria-label="Was this answer helpful?">
      <div className="flex items-center gap-3">
        <span className="text-[0.95rem] text-kajal-soft">Was this helpful?</span>
        {button(1, "Yes, helpful")}
        {button(-1, "Not helpful")}
      </div>
      <p aria-live="polite" className="text-[0.9rem] text-kajal-soft">
        {state === "sent" && rated === 1 && "Thank you."}
        {state === "sent" && rated === -1 && "Thank you. We keep this question and answer so a person can see how to do better."}
        {state === "failed" && "That didn't send. Please try again later."}
      </p>
    </div>
  );
}
