import Link from "next/link";
import { Suspense } from "react";
import { HomeHero } from "@/components/home/HomeHero";
import { HomeAsk } from "@/components/home/HomeAsk";
import { ContinueLesson } from "@/components/home/ContinueLesson";
import { TodayCard } from "@/components/home/TodayCard";
import { PracticeStreak } from "@/components/PracticeStreak";
import { dailyEntries } from "@/lib/daily";
import { OldAskLink } from "@/components/home/OldAskLink";
import { AskIcon, LearnIcon, MeditateIcon, PersonIcon, ReadIcon } from "@/components/icons";

const TILES = [
  { href: "/ask", title: "Ask", line: "Real answers from the scriptures, for your question", Icon: AskIcon, tone: "bg-kesar text-kajal" },
  { href: "/learn", title: "Learn", line: "47 short lessons: the Gita, karma, yoga and stories of the gods", Icon: LearnIcon, tone: "bg-tulsi text-sandal" },
  { href: "/meditate", title: "Meditate", line: "Guided meditations and mantras, read aloud", Icon: MeditateIcon, tone: "bg-night text-sandal" },
  { href: "/learn#read", title: "Read", line: "The Gita, 10 Upanishads, the Yoga Sutras and Vivekananda", Icon: ReadIcon, tone: "bg-sandal-deep text-kajal" },
];

// What makes SwamiGPT different from asking any chatbot
const PROMISES = [
  {
    title: "Only real scripture",
    line: "Every quote comes from real, published translations. SwamiGPT is never allowed to make up a verse.",
    Icon: ReadIcon,
  },
  {
    title: "For the whole family",
    line: "Simple enough for a 12-year-old, deep enough for a scholar, and read aloud in a calm voice for elders.",
    Icon: PersonIcon,
  },
  {
    title: "A daily practice",
    line: "A verse each morning, guided meditations, and mantras with real chanting. Not just a chatbot.",
    Icon: MeditateIcon,
  },
];

// The home screen: what SwamiGPT is, in one look, and the way in to each part
export default function Home() {
  return (
    <div className="pb-6">
      <Suspense>
        <OldAskLink />
      </Suspense>
      <HomeHero>
        <HomeAsk />
      </HomeHero>
      <ContinueLesson />
      <PracticeStreak className="mt-6" />

      <section aria-labelledby="different" className="mt-12">
        <h2 id="different" className="font-display text-[1.8rem] leading-tight">
          Why SwamiGPT is different
        </h2>
        <ul className="mt-5 grid gap-3 sm:grid-cols-3 sm:gap-4">
          {PROMISES.map(({ title, line, Icon }) => (
            <li key={title} className="rounded-[1.75rem] border-2 border-sandal-edge bg-white/40 px-5 py-5">
              <Icon className="size-8 text-kesar-deep" />
              <h3 className="mt-3 font-display text-[1.35rem] leading-tight">{title}</h3>
              <p className="mt-1.5 text-[1rem] leading-[1.6]">{line}</p>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-[0.95rem] text-kajal-soft">
          A guide, not a guru: it never pretends to be God, only shows you what the scriptures say.{" "}
          <Link href="/sources" className="font-semibold text-kesar-deep underline underline-offset-4">
            See our sources
          </Link>
        </p>
      </section>

      <section aria-label="What you can do" className="mt-10 grid grid-cols-2 gap-3 [perspective:900px] sm:gap-4">
        {TILES.map(({ href, title, line, Icon, tone }) => (
          <Link key={href} href={href} className={`tile flex min-h-44 flex-col justify-between rounded-[1.75rem] p-5 ${tone}`}>
            <Icon className="size-9" />
            <span>
              <span className="block font-display text-[1.5rem] leading-tight">{title}</span>
              <span className="mt-1 block text-[0.9rem] leading-snug opacity-85">{line}</span>
            </span>
          </Link>
        ))}
      </section>

      <TodayCard entries={dailyEntries()} />

      <section className="mt-14">
        <h2 className="font-display text-[1.8rem] leading-tight">Why I built this</h2>
        <div className="mt-4 flex max-w-[60ch] flex-col gap-4 text-[1.1rem] leading-[1.7]">
          <p>
            I&apos;m a high schooler. Last year I was stressed about everything: SATs, college, figuring out who I want
            to be. I wanted my Hindu scriptures to help, but they felt hard to understand and far from my everyday life.
          </p>
          <p>
            Then I got to meet <strong>Swami Paramatmananda</strong>. I asked him one question:{" "}
            <em>how do I stop being stressed, and how do I find what I&apos;m passionate about?</em>
          </p>
          <p className="font-display text-[1.35rem] leading-snug text-kesar-deep">That same day, I started SwamiGPT.</p>
          <p className="text-kajal-soft">— the founder</p>
        </div>
      </section>

      <nav aria-label="About SwamiGPT" className="mt-14 flex flex-wrap gap-x-6 gap-y-2 text-[0.95rem] text-kajal-soft">
        <Link href="/sources" className="min-h-11 content-center underline-offset-4 hover:underline">
          Sources &amp; safety
        </Link>
        <Link href="/privacy" className="min-h-11 content-center underline-offset-4 hover:underline">
          Privacy
        </Link>
        <Link href="/terms" className="min-h-11 content-center underline-offset-4 hover:underline">
          Terms
        </Link>
      </nav>
    </div>
  );
}
