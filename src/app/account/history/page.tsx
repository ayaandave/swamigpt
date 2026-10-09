"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { VerseCard } from "@/components/VerseCard";
import { whoSays } from "@/lib/scripture/who";
import {
  deleteConversation,
  listConversations,
  loadConversation,
  type Conversation,
  type SavedTurn,
} from "@/lib/history";
import { useAuth } from "@/lib/supabase";

const when = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });

export default function HistoryPage() {
  const { ready, user } = useAuth();
  const [list, setList] = useState<Conversation[] | null>(null);
  const [open, setOpen] = useState<{ conversation: Conversation; turns: SavedTurn[] } | null>(null);

  useEffect(() => {
    if (user) void listConversations().then(setList);
  }, [user]);

  if (!ready) return <div className="min-h-[60vh]" />;
  if (!user) {
    return (
      <div className="pt-12 text-center">
        <h1 className="font-display text-[2.2rem]">Your conversations</h1>
        <p className="mt-2 text-[1.1rem] text-kajal-soft">Sign in to keep your conversations with the Swami.</p>
        <Link
          href="/login"
          className="mt-6 inline-flex min-h-14 items-center rounded-full bg-kesar px-8 text-[1.05rem] font-bold text-kajal hover:bg-kesar-deep hover:text-sandal"
        >
          Sign in
        </Link>
      </div>
    );
  }

  if (open) {
    const remove = async () => {
      await deleteConversation(open.conversation.id);
      setList((l) => l?.filter((c) => c.id !== open.conversation.id) ?? null);
      setOpen(null);
    };
    return (
      <div className="pt-8">
        <button
          type="button"
          onClick={() => setOpen(null)}
          className="text-[0.95rem] font-semibold text-kesar-deep hover:underline"
        >
          ← All conversations
        </button>
        <p className="mt-3 text-[0.95rem] text-kajal-soft">{when(open.conversation.updated_at)}</p>
        <div className="mt-4 flex flex-col gap-12">
          {open.turns.map((t) => (
            <article key={t.id} className="flex flex-col gap-5">
              <h2 className="border-l-4 border-kesar pl-5 font-display text-[1.5rem] leading-snug">{t.question}</h2>
              {t.answer.paragraphs.map((p, i) => (
                <p key={i} className="max-w-[62ch] text-[1.1rem] leading-[1.75]">
                  {p}
                </p>
              ))}
              {t.answer.verses.map(({ verse, meaning }) => (
                <div key={verse.id} className="flex flex-col gap-4">
                  <p className="font-display text-[1.15rem] text-kajal-soft">{whoSays(verse)}:</p>
                  <VerseCard verse={verse} />
                  <p className="max-w-[62ch] border-l-4 border-tulsi pl-5 text-[1.1rem] font-semibold leading-[1.7] text-tulsi">
                    {meaning}
                  </p>
                </div>
              ))}
              {t.answer.practice && (
                <Link
                  href={t.answer.practice.href}
                  className="flex min-h-16 flex-col justify-center rounded-2xl border-2 border-sandal-edge px-6 py-3 hover:border-kesar"
                >
                  <span className="text-[0.85rem] font-semibold text-kesar-deep">Try this next</span>
                  <span className="font-display text-[1.2rem]">{t.answer.practice.title}</span>
                </Link>
              )}
            </article>
          ))}
        </div>
        <button
          type="button"
          onClick={remove}
          className="mt-12 min-h-12 rounded-full px-5 text-[0.95rem] font-semibold text-kumkum underline underline-offset-4"
        >
          Delete this conversation
        </button>
      </div>
    );
  }

  return (
    <div className="pt-8">
      <Link href="/account" className="text-[0.95rem] font-semibold text-kesar-deep hover:underline">
        ← Your account
      </Link>
      <h1 className="mt-3 font-display text-[2.4rem] leading-tight">Your conversations</h1>
      {list === null ? (
        <p className="mt-6 italic text-kajal-soft">Gathering your conversations…</p>
      ) : list.length === 0 ? (
        <p className="mt-4 text-[1.1rem] text-kajal-soft">
          Nothing yet. Your questions and the Swami&apos;s answers will be kept here.
        </p>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {list.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => void loadConversation(c.id).then(setOpen)}
                className="flex w-full flex-col rounded-2xl border-2 border-sandal-edge px-5 py-4 text-left hover:border-kesar hover:bg-sandal-deep/60"
              >
                <span className="font-display text-[1.2rem] leading-snug">{c.title}</span>
                <span className="text-[0.9rem] text-kajal-soft">{when(c.updated_at)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
