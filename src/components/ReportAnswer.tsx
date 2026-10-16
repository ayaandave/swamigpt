"use client";

import { useState } from "react";
import type { SwamiAnswer } from "@/lib/swami";
import type { Depth } from "@/lib/settings";
import { accessToken } from "@/lib/supabase";

const REASONS = [
  { id: "wrong", label: "Wrong about the scriptures" },
  { id: "unsafe", label: "Unsafe or harmful advice" },
  { id: "disrespectful", label: "Disrespectful" },
  { id: "other", label: "Something else" },
] as const;
type Reason = (typeof REASONS)[number]["id"];

// "Report this answer": a quiet link under each answer that opens a short form. The AI can be
// wrong, and a person reads every report.
export function ReportAnswer({ question, answer, depth }: { question: string; answer: SwamiAnswer; depth: Depth }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<Reason | null>(null);
  const [note, setNote] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "limit" | "failed">("idle");

  if (state === "sent") {
    return <p className="text-[1rem] text-tulsi">Thank you. A person will read your report.</p>;
  }
  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="min-h-11 w-fit text-[0.95rem] text-kajal-soft underline underline-offset-4 hover:text-kajal"
      >
        Report this answer
      </button>
    );
  }

  const send = async () => {
    if (!reason || state === "sending") return;
    setState("sending");
    try {
      const token = await accessToken();
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          reason,
          note: note.trim(),
          question: question.slice(0, 2000),
          depth,
          answer: {
            paragraphs: answer.paragraphs,
            verses: answer.verses.map(({ verse, meaning }) => ({ id: verse.id, meaning })),
            practice: answer.practice?.href ?? null,
          },
        }),
      });
      setState(res.ok ? "sent" : res.status === 429 ? "limit" : "failed");
    } catch {
      setState("failed");
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void send();
      }}
      className="flex flex-col gap-4 rounded-2xl border-2 border-sandal-edge px-5 py-5"
    >
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 font-display text-[1.2rem]">What&apos;s wrong with this answer?</legend>
        {REASONS.map((r) => (
          <label
            key={r.id}
            className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl px-3 text-[1.05rem] has-checked:bg-sandal-deep"
          >
            <input
              type="radio"
              name="reason"
              value={r.id}
              checked={reason === r.id}
              onChange={() => setReason(r.id)}
              className="size-5 accent-kesar-deep"
            />
            {r.label}
          </label>
        ))}
      </fieldset>
      <label className="flex flex-col gap-2 text-[1rem]">
        Tell us more (optional)
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value.slice(0, 500))}
          rows={3}
          className="rounded-xl border-2 border-sandal-edge bg-white/60 px-4 py-3 text-[1.05rem] focus:border-kesar focus:outline-none"
        />
      </label>
      <p className="text-[0.9rem] text-kajal-soft">
        This sends your question and this answer to the SwamiGPT team, so we can check it and improve SwamiGPT.
      </p>
      {state === "limit" && <p className="text-[1rem] text-kesar-deep">You&apos;ve sent a lot of reports today. Please try again tomorrow.</p>}
      {state === "failed" && <p className="text-[1rem] text-kesar-deep">That didn&apos;t send. Please try again.</p>}
      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={!reason || state === "sending"}
          className="min-h-12 rounded-full bg-kesar px-6 text-[1rem] font-bold text-kajal hover:bg-kesar-deep hover:text-sandal disabled:opacity-50"
        >
          {state === "sending" ? "Sending…" : "Send report"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="min-h-12 rounded-full border-2 border-sandal-edge px-6 text-[1rem] font-semibold hover:border-kajal"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
