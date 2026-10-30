"use client";

import { useEffect, useRef, useState } from "react";
import type { SwamiAnswer } from "@/lib/swami";
import { whoSays } from "@/lib/scripture/who";

const SITE = "https://www.swamigpt.com";

// The first sentence or two of the answer, so the shared text stays short
function opening(paragraphs: string[]) {
  const text = paragraphs[0] ?? "";
  const sentences = text.match(/[^.!?]+[.!?]+/g) ?? [text];
  let out = "";
  for (const s of sentences) {
    if (out && out.length + s.length > 220) break;
    out += s;
  }
  return out.trim();
}

// Share an answer: on phones, the share sheet with a picture of the verse; elsewhere, copy the text.
// The link opens this exact answer (swamigpt.com/s/<id>). Answers without a seal (crisis answers,
// children's answers, old saved ones) link to the verse's page instead.
export function ShareButton({ question, answer }: { question: string; answer: SwamiAnswer }) {
  const verse = answer.verses[0]?.verse;
  const id = answer.seal?.slice(0, 12);
  const url = id ? `${SITE}/s/${id}` : verse ? `${SITE}/v/${verse.id}` : SITE;
  const text = [
    `“${question}”`,
    opening(answer.paragraphs),
    verse && `${whoSays(verse)}: “${verse.translation.replace(/\s*\n\s*/g, " ")}”`,
    `Read the whole answer on SwamiGPT: ${url}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  // The picture is fetched ahead of time: phones only open the share sheet straight from a tap
  const card = useRef<File | null>(null);
  useEffect(() => {
    if (!verse || typeof navigator === "undefined" || !navigator.canShare) return;
    let live = true;
    fetch(`/api/card?id=${encodeURIComponent(verse.id)}`)
      .then((r) => (r.ok ? r.blob() : null))
      .then((b) => {
        if (live && b) card.current = new File([b], "swamigpt.png", { type: "image/png" });
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [verse]);

  const [copied, setCopied] = useState(false);
  // Saves the answer so its link works. Started on the tap but not waited for, because phones only
  // open the share sheet straight from a tap; the link is known already, since it comes from the seal.
  const save = () =>
    answer.seal
      ? fetch("/api/share", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          keepalive: true,
          body: JSON.stringify({
            question: question.trim(),
            paragraphs: answer.paragraphs,
            verses: answer.verses.map(({ verse, meaning }) => ({ id: verse.id, meaning })),
            practice: answer.practice,
            seal: answer.seal,
          }),
        }).catch(() => null)
      : Promise.resolve(null);

  const share = async () => {
    const saved = save();
    const files = card.current ? [card.current] : [];
    try {
      if (files.length && navigator.canShare?.({ files, text })) {
        await navigator.share({ files, text });
        return;
      }
      if (navigator.share) {
        await navigator.share({ text, url });
        return;
      }
    } catch (e) {
      if ((e as Error).name === "AbortError") return; // they closed the share sheet
    }
    await saved;
    await navigator.clipboard?.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <button
      type="button"
      onClick={() => void share()}
      className="inline-flex min-h-14 items-center gap-2 rounded-xl border border-sandal-edge px-6 text-[1rem] font-semibold hover:border-kajal"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 3v12M7.5 7.5 12 3l4.5 4.5M5 13v5.5A2.5 2.5 0 0 0 7.5 21h9a2.5 2.5 0 0 0 2.5-2.5V13" />
      </svg>
      {copied ? "Copied" : "Share"}
    </button>
  );
}
