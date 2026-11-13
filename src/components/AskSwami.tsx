"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { askSwami } from "@/lib/ask";
import type { SwamiAnswer } from "@/lib/swami";
import { useSettings, type Depth } from "@/lib/settings";
import { saveTurn } from "@/lib/history";
import { useAuth } from "@/lib/supabase";
import { useIsClient } from "@/lib/store";
import { Om } from "./Om";
import { VerseCard } from "./VerseCard";
import { QuestionsLeft, SeePlusButton } from "./PlusPaywall";
import { SaveVerseButton } from "./SaveVerseButton";
import { followUps, suggestedQuestions } from "@/lib/suggestions";
import { markPractice } from "@/lib/practice";
import { track } from "@/lib/events";
import { whoSays } from "@/lib/scripture/who";
import { ListenButton } from "./ListenButton";
import { ShareButton } from "./ShareButton";
import { ReportAnswer } from "./ReportAnswer";
import { CheckIcon, MicIcon, SendIcon, StopIcon } from "./icons";

// The longest question the server accepts (app/api/ask), so nothing typed is ever thrown away
const MAX_QUESTION = 2000;
type Turn = {
  id: number;
  question: string;
  depth: Depth;
  answer?: SwamiAnswer;
};

// initialDraft: a question handed over from elsewhere (e.g. a verse page), typed in but not sent.
// autoAsk: a question to ask straight away (from the home screen).
// about: the library passage a verse page sent them from, used for their first question.
export function AskSwami({
  initialDraft = "",
  autoAsk = "",
  about,
}: {
  initialDraft?: string;
  autoAsk?: string;
  about?: string;
}) {
  const { depth: defaultDepth, ageGroup, focus } = useSettings();
  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState(initialDraft);
  const [, setSpeakingId] = useState<number | null>(null);
  const thinking = turns.some((t) => !t.answer);
  const lastRef = useRef<HTMLElement>(null);
  const nextId = useRef(1);
  const { user } = useAuth();
  const conversation = useRef<string | null>(null); // saved-history conversation, when signed in
  const stopper = useRef<AbortController | null>(null);
  const [left, setLeft] = useState<number | null>(null); // questions left today, from the server
  const isClient = useIsClient();

  useEffect(() => {
    // Bring each new question to the top so the answer reads from its beginning
    lastRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [turns.length]);

  // retry: the id of a turn that failed or was stopped, asked again in place with the same words
  const ask = async (question: string, depth: Depth = defaultDepth, retry?: number) => {
    const q = question.trim();
    if (!q || thinking) return;
    const id = retry ?? nextId.current++;
    if (!retry) setDraft("");
    const earlier = retry ? turns.filter((t) => t.id < retry) : turns;
    const history = earlier.flatMap((t) =>
      t.answer && !t.answer.notice ? [{ question: t.question, answer: t.answer }] : [],
    );
    // The question shows straight away; only its answer is waited for
    setTurns((t) =>
      retry
        ? t.map((turn) => (turn.id === id ? { id, question: q, depth } : turn))
        : [...t, { id, question: q, depth }],
    );
    track("chat_sent", { signedIn: Boolean(user) });
    const controller = new AbortController();
    stopper.current = controller;
    const { left: remaining, ...answer } = await askSwami(
      q,
      depth,
      ageGroup,
      history,
      undefined,
      earlier.length === 0 ? about : undefined,
      controller.signal,
    );
    stopper.current = null;
    if (remaining !== undefined) setLeft(remaining);
    setTurns((t) => t.map((turn) => (turn.id === id ? { ...turn, answer } : turn)));
    if (!answer.notice) {
      markPractice(); // a real conversation counts toward the day's practice
      if (!turns.some((t) => t.answer && !t.answer.notice)) track("first_answer_completed");
    }
    if (user && !answer.notice) conversation.current = await saveTurn(user.id, conversation.current, q, answer);
  };

  // Tapping a suggestion fills the box to edit or send; it is never sent for them
  const fill = (q: string) => {
    setDraft(q);
    requestAnimationFrame(() => {
      const box = document.getElementById("ask") as HTMLTextAreaElement | null;
      box?.focus();
      box?.setSelectionRange(q.length, q.length);
    });
  };
  const answered = turns.filter((t) => t.answer && !t.answer.notice).length;
  const chips = suggestedQuestions(isClient ? focus : null, isClient ? new Date().getHours() : 12, answered);

  // Asked once, even though development mode runs effects twice
  const autoAsked = useRef(false);
  useEffect(() => {
    if (!autoAsk || autoAsked.current) return;
    autoAsked.current = true;
    void ask(autoAsk);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only on arrival
  }, [autoAsk]);

  const started = turns.length > 0;

  return (
    <div className="flex flex-col">
      {!started ? (
        <section className="arrive flex flex-col items-center pt-6 text-center sm:pt-16">
          <Om size={196} hero />
          <h1 className="mt-4 font-display text-[1.75rem] leading-[1.1] sm:mt-6 sm:text-[3.2rem]">Namaste.</h1>
          <p className="mt-3 max-w-[30ch] text-[1.1rem] text-kajal-soft">
            Ask about anything in your life, or about the Gita, karma or meditation. Every answer comes from real
            scripture.
          </p>
          <div className="mt-6 w-full text-left sm:mt-8">
            <AskBox draft={draft} setDraft={setDraft} onAsk={ask} disabled={thinking} autoFocus />
            <p className="mt-6 mb-3 text-[0.9rem] font-semibold text-kajal-soft sm:mt-8">Or begin with one of these</p>
            <ul className="grid gap-3">
              {chips.map((q) => (
                <li key={q}>
                  <button
                    type="button"
                    onClick={() => fill(q)}
                    className="w-full min-h-16 rounded-2xl border border-sandal-edge px-5 py-3 text-left font-display text-[1.1rem] leading-snug hover:border-kesar hover:bg-sandal-deep"
                  >
                    {q}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : (
        <section aria-live="polite" className="flex flex-col gap-12 pt-8">
          {turns.map((turn, i) => (
            <article
              key={turn.id}
              ref={i === turns.length - 1 ? lastRef : undefined}
              className="flex scroll-mt-6 flex-col gap-3"
            >
              <h2 className="font-display text-[1.1rem] leading-snug">{turn.question}</h2>
              <Sources turn={turn} />
              <div className="flex flex-col items-start gap-3">
                {!turn.answer ? (
                  <div className="flex items-center gap-3">
                    <Om size={40} state="thinking" />
                    <p className="text-[0.95rem] text-kajal-soft">Reflecting on the scriptures…</p>
                  </div>
                ) : (
                  <Answer
                    turn={turn as Required<Turn>}
                    onSpeaking={(s) => setSpeakingId(s ? turn.id : null)}
                    onReask={(d) => ask(turn.question, d)}
                    onRetry={() => ask(turn.question, turn.depth, turn.id)}
                    onFollowUp={i === turns.length - 1 ? fill : undefined}
                    disabled={thinking}
                  />
                )}
              </div>
            </article>
          ))}
          <div className="sticky bottom-[calc(4.6rem+env(safe-area-inset-bottom))] z-20 md:bottom-0 -mx-4 bg-sandal/95 px-4 pt-2 pb-3 backdrop-blur sm:-mx-6 sm:px-6">
            <AskBox
              draft={draft}
              setDraft={setDraft}
              onAsk={ask}
              disabled={thinking}
              placeholder="Ask a follow-up"
              compact
              onStop={thinking ? () => stopper.current?.abort() : undefined}
            />
            {left !== null && <QuestionsLeft left={left} />}
          </div>
        </section>
      )}
      <p className="mt-10 text-center text-[0.8rem] text-kajal-soft">
        SwamiGPT is an AI guide, not a guru. It quotes real scriptures and can still make mistakes.{" "}
        <Link href="/sources" className="underline hover:text-kajal">
          Sources &amp; safety
        </Link>
      </p>
    </div>
  );
}

function Answer({
  turn,
  onSpeaking,
  onReask,
  onRetry,
  onFollowUp,
  disabled,
}: {
  turn: Required<Turn>;
  onSpeaking: (s: boolean) => void;
  onReask: (d: Depth) => void;
  onRetry: () => void;
  onFollowUp?: (q: string) => void; // only under the latest answer
  disabled: boolean;
}) {
  const { answer, depth } = turn;
  // Something went wrong or they pressed Stop: their question stays, and one tap asks it again
  if (answer.notice === "error" || answer.notice === "stopped") {
    return (
      <div className="flex flex-col items-start gap-3">
        {answer.paragraphs.map((p, i) => (
          <p key={i} className="max-w-[62ch] text-[1rem] leading-[1.7] text-kajal-soft">
            {p}
          </p>
        ))}
        {answer.help && <HelpCard help={answer.help} />}
        <button
          type="button"
          disabled={disabled}
          onClick={onRetry}
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-kesar px-5 text-[0.95rem] font-semibold text-kesar-deep hover:bg-sandal-deep disabled:opacity-50"
        >
          <span aria-hidden="true">↻</span> Tap to retry
        </button>
      </div>
    );
  }
  const spoken = [
    ...answer.paragraphs,
    ...answer.verses.map(({ verse, meaning }) => `${whoSays(verse)}: ${verse.translation} ${meaning}`),
    ...(answer.practice ? [`Try this next: ${answer.practice.title}. ${answer.practice.why}`] : []),
  ].join(" ");

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4">
      {answer.paragraphs.map((p, i) => (
        <p key={i} className="max-w-[62ch] text-[1rem] leading-[1.7] text-kajal">
          {p}
        </p>
      ))}
      {answer.help && <HelpCard help={answer.help} />}
      {answer.signInPrompt && (
        <Link
          href="/login"
          className="flex min-h-14 w-fit items-center rounded-xl bg-kesar px-7 text-[1.05rem] font-bold text-on-kesar hover:bg-kesar-deep hover:text-sandal"
        >
          Sign in for more questions
        </Link>
      )}
      {answer.plusPrompt && <SeePlusButton />}
      {answer.verses.map(({ verse, meaning }) => (
        <div key={verse.id} className="mt-1 flex flex-col gap-3">
          <p className="text-[0.9rem] text-kajal-soft">{whoSays(verse)}:</p>
          <VerseCard verse={verse} />
          <p className="max-w-[62ch] text-[1rem] leading-[1.65] text-kajal">
            <span className="font-medium text-kesar-deep">For you: </span>
            {meaning.replace(/^for you,?(\s+this means)?\s*[,:]?\s*/i, "")}
          </p>
          {!answer.notice && <SaveVerseButton verse={verse} className="w-fit" />}
        </div>
      ))}
      {answer.practice && (
        <Link
          href={answer.practice.href}
          className="mt-2 flex min-h-16 flex-col justify-center rounded-2xl border border-sandal-edge px-6 py-3 hover:border-kesar hover:bg-sandal-deep"
        >
          <span className="text-[0.85rem] font-semibold text-kesar-deep">Try this next</span>
          <span className="font-display text-[1.1rem]">{answer.practice.title}</span>
          <span className="text-[1rem] text-kajal-soft">{answer.practice.why}</span>
        </Link>
      )}
      <div className="flex flex-wrap items-center gap-3 pt-1">
        {/* Not saved: an answer can repeat something personal, so its audio is never kept */}
        <ListenButton text={spoken} onSpeakingChange={onSpeaking} />
        {!answer.notice && <ShareButton question={turn.question} answer={answer} />}
        {!answer.notice && (
          <CopyButton
            text={[
              ...answer.paragraphs,
              ...answer.verses.map(
                ({ verse, meaning }) => `${whoSays(verse)}: "${verse.translation}" (${verse.source})\n${meaning}`,
              ),
            ].join("\n\n")}
          />
        )}
        <button
          type="button"
          disabled={disabled}
          onClick={() => onReask(depth === "simpler" ? "deeper" : "simpler")}
          className="min-h-14 rounded-xl border border-sandal-edge px-6 text-[1rem] font-semibold hover:border-kajal disabled:opacity-50"
        >
          {depth === "simpler" ? "Go deeper (uses 2)" : "Say it more simply"}
        </button>
      </div>
      {onFollowUp && !answer.notice && (
        <ul aria-label="Ask next" className="flex flex-wrap gap-2">
          {followUps({
            hasVerse: answer.verses.length > 0,
            hasPractice: Boolean(answer.practice),
          }).map((q) => (
            <li key={q}>
              <button
                type="button"
                onClick={() => onFollowUp(q)}
                className="min-h-11 rounded-full border border-sandal-edge px-4 py-2 text-left text-[0.9rem] leading-snug hover:border-kesar hover:bg-sandal-deep"
              >
                {q}
              </button>
            </li>
          ))}
        </ul>
      )}
      {!answer.notice && <ReportAnswer question={turn.question} answer={answer} depth={depth} />}
    </div>
  );
}

function HelpCard({ help }: { help: NonNullable<SwamiAnswer["help"]> }) {
  return (
    <a
      href={help.href}
      className="flex min-h-16 flex-col justify-center rounded-2xl bg-sandal-deep border border-kesar/40 px-6 py-3 text-kajal"
    >
      <span className="text-[0.85rem]">{help.text}</span>
      <span className="text-[1.2rem] font-bold">{help.label}</span>
    </a>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          // Clipboard blocked: nothing to do
        }
      }}
      className="inline-flex min-h-14 items-center gap-2 rounded-xl border border-sandal-edge px-5 text-[1rem] font-semibold hover:border-kajal"
    >
      {copied ? <CheckIcon className="size-5" /> : null}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

type SpeechRec = {
  lang: string;
  interimResults: boolean;
  onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
};

function AskBox({
  draft,
  setDraft,
  onAsk,
  disabled,
  placeholder = "What is on your mind?",
  autoFocus,
  compact = false,
  onStop,
}: {
  draft: string;
  setDraft: (s: string) => void;
  onAsk: (q: string) => void;
  disabled: boolean;
  placeholder?: string;
  autoFocus?: boolean;
  compact?: boolean; // one slim row, for the box pinned under a conversation
  onStop?: () => void; // while an answer is coming: the send button becomes Stop
}) {
  const [listening, setListening] = useState(false);
  const recRef = useRef<SpeechRec | null>(null);
  const isClient = useIsClient();
  const canListen = isClient && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const toggleMic = () => {
    if (listening) {
      recRef.current?.stop();
      return;
    }
    const w = window as unknown as Record<string, new () => SpeechRec>;
    const Rec = w.SpeechRecognition || w.webkitSpeechRecognition;
    const rec = new Rec();
    rec.lang = "en-US";
    rec.interimResults = true;
    rec.onresult = (e) => {
      setDraft(
        Array.from(e.results)
          .map((r) => r[0].transcript)
          .join("")
          .slice(0, MAX_QUESTION),
      );
    };
    rec.onend = () => setListening(false);
    recRef.current = rec;
    rec.start();
    setListening(true);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onAsk(draft);
      }}
      className={`flex rounded-2xl border border-kajal bg-sandal-deep p-2 shadow-[0_0_0_1px_var(--sandal-edge),0_12px_40px_-20px_var(--glow)] focus-within:border-kesar-deep ${
        compact ? "items-end gap-2" : "flex-col gap-1 sm:flex-row sm:items-end sm:gap-2"
      }`}
    >
      <label htmlFor="ask" className="sr-only">
        Your question
      </label>
      <textarea
        id="ask"
        rows={compact ? 1 : Math.min(4, Math.max(2, Math.ceil(draft.length / 16)))} // grow for longer questions
        value={draft}
        maxLength={MAX_QUESTION}
        autoFocus={autoFocus}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onAsk(draft);
          }
        }}
        placeholder={listening ? "Listening… speak your question" : placeholder}
        className={`min-h-14 w-full min-w-0 flex-1 resize-none bg-transparent font-display leading-snug outline-none placeholder:text-kajal-soft/70 ${
          compact ? "px-3 py-3.5 text-[1.1rem] sm:text-[1.25rem]" : "px-4 py-3 text-[1.1rem]"
        }`}
      />
      <div className="flex items-center justify-end gap-2">
        {draft.length > MAX_QUESTION - 200 && (
          <span className="mr-auto px-3 text-[0.85rem] text-kajal-soft" aria-live="polite">
            {MAX_QUESTION - draft.length} characters left
          </span>
        )}
        {canListen && (
          <button
            type="button"
            onClick={toggleMic}
            aria-pressed={listening}
            aria-label={listening ? "Stop listening" : "Speak your question"}
            className={`flex size-14 shrink-0 items-center justify-center rounded-full ${
              listening ? "animate-pulse bg-kumkum text-white" : "bg-sandal-deep hover:bg-sandal-edge"
            }`}
          >
            <MicIcon />
          </button>
        )}
        {onStop ? (
          <button
            type="button"
            onClick={onStop}
            className="flex min-h-14 shrink-0 items-center gap-2 rounded-xl border border-kajal px-5 font-semibold hover:bg-sandal"
          >
            <StopIcon className="size-6" />
            <span className={compact ? "sr-only sm:not-sr-only" : undefined}>Stop</span>
          </button>
        ) : (
          <button
            type="submit"
            disabled={disabled || !draft.trim()}
            className="flex min-h-14 shrink-0 items-center gap-2 rounded-xl bg-kesar px-5 font-semibold text-on-kesar hover:bg-kesar-deep hover:text-sandal disabled:bg-sandal-deep disabled:text-kajal-soft"
          >
            <SendIcon className="size-6" />
            <span className={compact ? "sr-only sm:not-sr-only" : undefined}>Ask</span>
          </button>
        )}
      </div>
    </form>
  );
}

// "Searching…" while the answer comes, then which texts it quotes: the small technical line that
// shows the answer was built from real passages
function Sources({ turn }: { turn: Turn }) {
  if (!turn.answer) return null;
  const texts = [...new Set(turn.answer.verses.map(({ verse }) => verse.source.replace(/\s+[\d.:]+$/, "")))];
  if (!texts.length) return null;
  return (
    <p className="flex items-center gap-2 font-mono text-[0.75rem] text-kajal-soft">
      <span aria-hidden="true" className="size-1.5 rounded-full bg-kesar shadow-[0_0_8px_var(--kesar)]" />
      Quoting {turn.answer.verses.length} {turn.answer.verses.length === 1 ? "passage" : "passages"} ·{" "}
      {texts.join(", ")}
    </p>
  );
}
