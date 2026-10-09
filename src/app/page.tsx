import { Suspense } from "react";
import { AskSwami } from "@/components/AskSwami";
import { AskFromLink } from "@/components/AskFromLink";

export default function Home() {
  // The plain page is prerendered; a link like /?ask=... fills in the question in the browser
  return (
    <Suspense fallback={<AskSwami />}>
      <AskFromLink />
    </Suspense>
  );
}
