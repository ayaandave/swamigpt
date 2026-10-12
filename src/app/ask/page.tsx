import { Suspense } from "react";
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
