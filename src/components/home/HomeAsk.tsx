"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { SendIcon } from "../icons";

const EXAMPLES = ["I'm stressed about a test", "What is karma?", "How do I find my passion?", "Who is Krishna?"];

// The home screen's question box, sitting on the photo: asking opens the chat with the question already sent
export function HomeAsk() {
  const router = useRouter();
  const [draft, setDraft] = useState("");
  const go = (q: string) => {
    const question = q.trim();
    if (question) router.push(`/ask?q=${encodeURIComponent(question.slice(0, 500))}`);
  };

  return (
    <section aria-label="Ask a question">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          go(draft);
        }}
        className="flex items-center gap-2 rounded-full border-2 border-white/70 bg-white/80 py-2 pr-2 pl-6 shadow-[0_18px_40px_-18px_rgba(43,27,16,0.55)] backdrop-blur-md focus-within:border-kesar"
      >
        <label htmlFor="home-ask" className="sr-only">
          Your question
        </label>
        <input
          id="home-ask"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Ask Swamiji anything…"
          maxLength={500}
          className="min-h-12 min-w-0 flex-1 bg-transparent text-[1.1rem] placeholder:text-kajal-soft/80 focus:outline-none"
        />
        <button
          type="submit"
          aria-label="Ask"
          className="flex size-12 shrink-0 items-center justify-center rounded-full bg-kesar text-kajal hover:bg-kesar-deep hover:text-sandal"
        >
          <SendIcon className="size-6" />
        </button>
      </form>
      {/* One swipeable row on phones, so the photo stays visible; wrapped and centred on wider screens */}
      <ul className="scrollbar-none -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0">
        {EXAMPLES.map((q) => (
          <li key={q} className="shrink-0">
            <button
              type="button"
              onClick={() => go(q)}
              className="min-h-11 rounded-full border-2 border-white/60 bg-white/45 px-4 text-[0.95rem] font-semibold text-kajal backdrop-blur-md hover:border-kesar hover:bg-white/70"
            >
              {q}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
