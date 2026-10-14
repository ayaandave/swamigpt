"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { takePendingQuestion } from "@/lib/pending-question";
import { AskSwami } from "./AskSwami";

// A question from the home screen is asked straight away. One in a link (?ask= from a verse page,
// or ?q= from anywhere) is only typed in, so opening a link never spends a question by itself.
export function AskFromLink() {
  const params = useSearchParams();
  const draft = (params.get("ask") ?? params.get("q") ?? "").slice(0, 500);
  const about = params.get("about")?.slice(0, 120) || undefined; // the passage page they came from
  const [send, setSend] = useState("");
  useEffect(() => {
    const pending = takePendingQuestion();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- session storage is only readable after mount
    if (pending) setSend(pending);
  }, []);
  return <AskSwami key={send + "|" + draft} initialDraft={send ? "" : draft} autoAsk={send} about={send ? undefined : about} />;
}
