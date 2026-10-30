"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { setPendingQuestion } from "@/lib/pending-question";
import { SendIcon } from "../icons";

const EXAMPLES = ["I'm stressed about a test", "What is karma?", "How do I find my passion?", "Who is Krishna?"];

// The home screen's question box: a gold-edged field that shows how many passages are ready to
// search, and four example questions. Asking opens the chat with the question already sent.
export function HomeAsk({ passages }: { passages?: number }) {
  const router = useRouter();
  const [draft, setDraft] = useState("");
  const id = useId(); // the home page can show this box more than once
  const go = (q: string) => {
    const question = q.trim();
    if (!question) return;
    // Handed over out of sight so it's asked once; if storage is blocked, it arrives typed in instead
    if (setPendingQuestion(question.slice(0, 500))) router.push("/ask");
    else router.push(`/ask?ask=${encodeURIComponent(question.slice(0, 500))}`);
  };

  return (
    <section aria-label="Ask a question">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          go(draft);
        }}
        className="gold-edge rounded-2xl"
      >
        <div className="rounded-[15px] bg-sandal-deep px-4 pt-3 pb-2.5">
          <label htmlFor={id} className="sr-only">
            Your question
          </label>
          <input
            id={id}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="What’s on your mind?"
            maxLength={500}
            className="min-h-11 w-full bg-transparent text-[1rem] text-kajal placeholder:text-kajal-soft focus:outline-none"
          />
          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-[0.75rem] text-kajal-soft">
              {passages ? (
                <>
                  <span className="text-kesar-deep">{passages.toLocaleString("en-US")}</span> passages ready
                </>
              ) : (
                "Real scripture only"
              )}
            </span>
            <button
              type="submit"
              aria-label="Ask"
              className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-kajal text-sandal hover:opacity-85"
            >
              <SendIcon className="size-5" />
            </button>
          </div>
        </div>
      </form>
      <ul className="mt-3 grid grid-cols-2 gap-2">
        {EXAMPLES.map((q) => (
          <li key={q}>
            <button
              type="button"
              onClick={() => go(q)}
              className="min-h-11 w-full rounded-xl border border-sandal-edge bg-sandal-deep px-3 py-2 text-left text-[0.875rem] leading-snug text-kajal hover:border-kesar/60"
            >
              {q}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
