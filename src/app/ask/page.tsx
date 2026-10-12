import { Suspense } from "react";
import { AskSwami } from "@/components/AskSwami";
import { AskFromLink } from "@/components/AskFromLink";

export default function AskPage() {
  // The plain page is prerendered; a link like /ask?q=... (sent) or /ask?ask=... (typed in) fills in the question in the browser
  return (
    <Suspense fallback={<AskSwami />}>
      <AskFromLink />
    </Suspense>
  );
}
