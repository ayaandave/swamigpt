import { Suspense } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ask a question · SwamiGPT",
  description:
    "Ask about life, karma, the Gita or meditation, and get a calm answer drawn from real scripture: the Bhagavad Gita, the Upanishads, the Yoga Sutras and more.",
};
import { AskSwami } from "@/components/AskSwami";
import { AskFromLink } from "@/components/AskFromLink";

export default function AskPage() {
  // The plain page is prerendered; a link like /ask?ask=... fills in the question in the browser (never sends it)
  return (
    <Suspense fallback={<AskSwami />}>
      <AskFromLink />
    </Suspense>
  );
}
