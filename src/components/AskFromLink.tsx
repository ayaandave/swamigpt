"use client";

import { useSearchParams } from "next/navigation";
import { AskSwami } from "./AskSwami";

export function AskFromLink() {
  const ask = useSearchParams().get("ask")?.slice(0, 500) ?? "";
  return <AskSwami key={ask} initialDraft={ask} />;
}
