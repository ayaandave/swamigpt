"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

// The chat used to live at "/": old links like /?ask=... still open it with the question typed in
export function OldAskLink() {
  const router = useRouter();
  const ask = useSearchParams().get("ask");
  useEffect(() => {
    if (ask) router.replace(`/ask?ask=${encodeURIComponent(ask.slice(0, 500))}`);
  }, [ask, router]);
  return null;
}
