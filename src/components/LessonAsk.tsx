"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { askSwami, type LessonContext } from "@/lib/ask";
import { saveTurn } from "@/lib/history";
import { useSettings } from "@/lib/settings";
import type { SwamiAnswer } from "@/lib/swami";
import { useAuth } from "@/lib/supabase";
import { Diya } from "./Diya";
import { VerseCard } from "./VerseCard";
import { SendIcon } from "./icons";

const QUICK = ["Explain it more simply", "Give me an example", "How does this fit my life?"];

type Turn = { id: number; question: string; answer?: SwamiAnswer };

// A dropdown at the end of a lesson: ask the Swami about it without leaving the page.
export function LessonAsk({ lesson }: { lesson: LessonContext }) {
  const { depth, ageGroup } = useSettings();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const nextId = useRef(1);
  const conversation = useRef<string | null>(null);
  const thinking = turns.some((t) => !t.answer);

  const ask = async (text: string) => {
    const q = text.trim();
    if (!q || thinking) return;
    const id = nextId.current++;
    const history = turns.flatMap((t) => (t.answer ? [{ question: t.question, answer: t.answer }] : []));
    setDraft("");
    setTurns((t) => [...t, { id, question: q }]);
    const answer = await askSwami(q, depth, ageGroup, history, lesson);
    setTurns((t) => t.map((turn) => (turn.id === id ? { ...turn, answer } : turn)));
    if (user && !answer.notice) {
      // Saved to their history with the lesson named, so it makes sense later
      const saved = conversation.current ? q : `About "${lesson.title}": ${q}`;
      conversation.current = await saveTurn(user.id, conversation.current, saved, answer);
    }
  };

  return (
    <section className="mt-8 overflow-hidden rounded-[2rem] border-2 border-sandal-edge bg-[#fbf3e2]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex min-h-16 w-full items-center gap-3 px-5 py-3 text-left hover:bg-sandal-deep/50"
      >
        <Diya size={34} state={thinking ? "thinking" : "idle"} />
        <span className="flex-1">
          <span className="block font-display text-[1.2rem] leading-snug">Ask the Swami about this lesson</span>
          <span className="text-[0.9rem] text-kajal-soft">A quick question while you read</span>
        </span>
        <span aria-hidden="true" className={`text-[1.4rem] text-kesar-deep transition-transform ${open ? "rotate-180" : ""}`}>
          ▾
        </span>
      </button>

      {open && (
        <div className="border-t-2 border-sandal-edge px-5 pt-4 pb-5">
          {turns.length === 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {QUICK.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => ask(q)}
                  className="min-h-11 rounded-full border-2 border-sandal-edge bg-sandal px-4 text-[0.95rem] hover:border-kesar"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          <div aria-live="polite" className="flex flex-col gap-8">
            {turns.map((t) => (
              <article key={t.id} className="flex flex-col gap-4">
                <p className="border-l-4 border-kesar pl-4 font-display text-[1.2rem] leading-snug">{t.question}</p>
                {!t.answer ? (
                  <p className="italic text-kajal-soft">Swami is reflecting…</p>
                ) : (
                  <InlineAnswer answer={t.answer} />
                )}
              </article>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void ask(draft);
            }}
            className={`flex items-end gap-2 rounded-[1.5rem] border-2 border-kajal bg-sandal p-1.5 focus-within:border-kesar-deep ${
              turns.length ? "mt-6" : ""
            }`}
          >
            <label htmlFor="lesson-ask" className="sr-only">
              Your question about this lesson
            </label>
            <textarea
              id="lesson-ask"
              rows={1}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void ask(draft);
                }
              }}
              placeholder={turns.length ? "Ask a follow-up" : "Your question"}
              className="min-h-12 min-w-0 flex-1 resize-none bg-transparent px-3 py-2.5 font-display text-[1.1rem] leading-snug outline-none placeholder:text-kajal-soft/70"
            />
            <button
              type="submit"
              disabled={thinking || !draft.trim()}
              aria-label="Ask"
              className="flex size-12 shrink-0 items-center justify-center rounded-full bg-kesar text-kajal hover:bg-kesar-deep hover:text-sandal disabled:bg-sandal-deep disabled:text-kajal-soft"
            >
              <SendIcon className="size-6" />
            </button>
          </form>
        </div>
      )}
    </section>
  );
}

function InlineAnswer({ answer }: { answer: SwamiAnswer }) {
  return (
    <div className="flex flex-col gap-4">
      {answer.paragraphs.map((p, i) => (
        <p key={i} className="text-[1.05rem] leading-[1.7]">
          {p}
        </p>
      ))}
      {answer.help && (
        <a href={answer.help.href} className="flex min-h-14 flex-col justify-center rounded-2xl bg-tulsi px-5 py-3 text-sandal">
          <span className="text-[0.85rem]">{answer.help.text}</span>
          <span className="text-[1.1rem] font-bold">{answer.help.label}</span>
        </a>
      )}
      {answer.signInPrompt && (
        <Link
          href="/login"
          className="flex min-h-12 w-fit items-center rounded-full bg-kesar px-6 font-bold text-kajal hover:bg-kesar-deep hover:text-sandal"
        >
          Sign in for more questions
        </Link>
      )}
      {answer.verses.map(({ verse, meaning }) => (
        <div key={verse.id} className="flex flex-col gap-3">
          <VerseCard verse={verse} />
          <p className="border-l-4 border-tulsi pl-4 font-semibold leading-[1.6] text-tulsi">{meaning}</p>
        </div>
      ))}
      {answer.practice && (
        <Link
          href={answer.practice.href}
          className="flex min-h-14 flex-col justify-center rounded-2xl border-2 border-sandal-edge px-5 py-3 hover:border-kesar"
        >
          <span className="text-[0.85rem] font-semibold text-kesar-deep">Try this next</span>
          <span className="font-display text-[1.1rem]">{answer.practice.title}</span>
        </Link>
      )}
    </div>
  );
}
