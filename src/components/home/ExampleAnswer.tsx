import Link from "next/link";
import { getPassageById } from "@/lib/scripture/library";
import { whoSays } from "@/lib/scripture/who";
import { VerseCard } from "../VerseCard";

// A real answer SwamiGPT gave on the live site (16 October 2026), shortened, so a first-time
// visitor sees what an answer is like before asking. Keep it real: if this is replaced, paste
// the new answer's own words and passage, never write one by hand.
const QUESTION = "I'm stressed about a big test tomorrow.";
const OPENING = [
  "A big test tomorrow can make your chest tight and your mind race. Tonight the worry is probably louder than the test itself.",
  "Hindu teaching offers a different way to see it. You are not your marks. What you can do is your part: study what you can, then give your best tomorrow. The result is not yours to squeeze, so place it in God's hands.",
];
const PASSAGE = "vivekananda-jnana-yoga-2-30";
const QUOTE =
  "Me the sun cannot dry, fire cannot burn, sword cannot kill, for I am the birthless, the deathless, the ever-living omnipotent, omnipresent Spirit.";
const MEANING =
  "For you, this means that the real you cannot be burned, cut or broken by a bad mark, so you can walk into that room with a steady heart instead of fear.";

export function ExampleAnswer() {
  const p = getPassageById(PASSAGE);
  if (!p) return null;
  return (
    <section aria-labelledby="example" className="mt-14">
      <p id="example" className="text-[0.85rem] font-semibold uppercase tracking-[0.14em] text-kesar-deep">
        A real answer from SwamiGPT
      </p>
      <p className="mt-3 border-l-4 border-kesar pl-5 font-display text-[1.3rem] leading-snug sm:text-[1.9rem]">
        &ldquo;{QUESTION}&rdquo;
      </p>
      <div className="mt-6 flex max-w-[62ch] flex-col gap-4 text-[1.1rem] leading-[1.75]">
        {OPENING.map((t) => (
          <p key={t}>{t}</p>
        ))}
      </div>
      <p className="mt-6 font-display text-[1.15rem] text-kajal-soft">{whoSays(p)}:</p>
      <div className="mt-3">
        <VerseCard verse={{ id: p.id, source: p.source, translation: QUOTE, translator: p.translator }} />
      </div>
      <p className="mt-4 max-w-[62ch] border-l-4 border-tulsi pl-5 text-[1.1rem] font-semibold leading-[1.7] text-tulsi">
        {MEANING}
      </p>
      <p className="mt-4 text-[0.9rem] text-kajal-soft">
        Shortened. The full answer went on to a short prayer to say before sleeping, and a three-minute calming
        practice.
      </p>
      <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
        <Link
          href="/ask"
          className="inline-flex min-h-14 items-center rounded-xl bg-kesar px-7 text-[1.05rem] font-bold text-on-kesar hover:bg-kesar-deep hover:text-sandal"
        >
          Ask your own question
        </Link>
        <Link href="/sources" className="min-h-11 content-center text-[0.95rem] text-kajal-soft underline underline-offset-4 hover:text-kajal">
          Where every quote comes from
        </Link>
      </div>
    </section>
  );
}
