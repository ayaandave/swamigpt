"use client";

import { useSearchParams } from "next/navigation";
import { AskSwami } from "./AskSwami";

// ?q= is asked straight away (from the home screen); ?ask= is only typed in (from a verse page)
export function AskFromLink() {
  const params = useSearchParams();
  const send = params.get("q")?.slice(0, 500) ?? "";
  const draft = params.get("ask")?.slice(0, 500) ?? "";
  return <AskSwami key={send + "|" + draft} initialDraft={draft} autoAsk={send} />;
}
