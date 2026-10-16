import Link from "next/link";
import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { PlusPlans } from "@/components/PlusPlans";
import { PLUS } from "@/lib/plans";

export const metadata: Metadata = pageMeta({
  title: "SwamiGPT Plus",
  description: "More questions each day, and Swamiji reads your answers aloud. The same best answers for everyone.",
  path: "/plus",
});

const ROWS: [string, string, string][] = [
  ["Questions a day", String(PLUS.questions.free), String(PLUS.questions.plus)],
  ["Answers read aloud by Swamiji", `${PLUS.readAloud.free} a month`, `About ${PLUS.readAloud.plus} a month`],
  ["Our best answers and voice", "Yes", "Yes"],
  ["Lessons, library, meditations, mantras", "Yes", "Yes"],
];

// SwamiGPT Plus: what it adds, and the plans
export default function PlusPage() {
  return (
    <div className="pt-10">
      <p className="text-[0.85rem] font-semibold uppercase tracking-[0.12em] text-kesar-deep">SwamiGPT Plus</p>
      <h1 className="mt-1 font-display text-[2.4rem] leading-tight">Ask more. Listen more.</h1>
      <p className="mt-3 max-w-[60ch] text-[1.1rem] leading-[1.7]">
        Everyone gets the same answers, from our best model and in our best voice. We never give free answers that
        are any worse. Plus gives you more of them each day, with Swamiji reading your answers aloud.
      </p>

      <table className="mt-8 w-full max-w-2xl border-separate border-spacing-0 text-left text-[1rem]">
        <thead>
          <tr className="text-[0.9rem] text-kajal-soft">
            <th scope="col" className="pb-2 font-semibold">
              <span className="sr-only">Feature</span>
            </th>
            <th scope="col" className="pb-2 pr-2 font-semibold">Free</th>
            <th scope="col" className="pb-2 font-semibold text-kesar-deep">Plus</th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map(([what, free, plus]) => (
            <tr key={what}>
              <th scope="row" className="border-t-2 border-sandal-edge py-3 pr-3 font-normal">{what}</th>
              <td className="border-t-2 border-sandal-edge py-3 pr-2">{free}</td>
              <td className="border-t-2 border-sandal-edge py-3 font-semibold">{plus}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <PlusPlans />

      <p className="mt-8 max-w-[60ch] text-[0.9rem] text-kajal-soft">
        Cancel any time. Plus also helps keep SwamiGPT growing: new texts, lessons and recordings. See our{" "}
        <Link href="/terms" className="underline underline-offset-2">
          Terms
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="underline underline-offset-2">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}
