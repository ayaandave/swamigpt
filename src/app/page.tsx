import Link from "next/link";
import { Suspense } from "react";
import { HomeHero } from "@/components/home/HomeHero";
import { HomeAsk } from "@/components/home/HomeAsk";
import { ContinueLesson } from "@/components/home/ContinueLesson";
import { TodayCard } from "@/components/home/TodayCard";
import { OldAskLink } from "@/components/home/OldAskLink";
import { AskIcon, LearnIcon, MeditateIcon, ReadIcon } from "@/components/icons";

const TILES = [
  { href: "/ask", title: "Ask", line: "Real answers from the scriptures, for your question", Icon: AskIcon, tone: "bg-kesar text-kajal" },
  { href: "/learn", title: "Learn", line: "38 short lessons on the Gita, karma, yoga and more", Icon: LearnIcon, tone: "bg-tulsi text-sandal" },
  { href: "/meditate", title: "Meditate", line: "6 guided meditations, read aloud", Icon: MeditateIcon, tone: "bg-night text-sandal" },
  { href: "/learn#read", title: "Read", line: "The Gita, Upanishads, Yoga Sutras and Vivekananda", Icon: ReadIcon, tone: "bg-sandal-deep text-kajal" },
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

      <TodayCard />

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

      <section className="mt-12 rounded-[2rem] border-2 border-sandal-edge px-7 py-6">
        <h2 className="font-display text-[1.5rem] leading-tight">Not just another AI chatbot</h2>
        <p className="mt-2 max-w-[60ch] text-[1.05rem] leading-[1.7]">
          Every answer is built on the <strong>Bhagavad Gita, the Upanishads, the Yoga Sutras and Swami Vivekananda&apos;s
          talks</strong>, and explained in plain words for <em>your</em> question.
        </p>
        <p className="mt-3 text-[0.9rem] text-kajal-soft">
          An AI guide, not a guru.{" "}
          <Link href="/sources" className="font-semibold text-kesar-deep underline underline-offset-4">
            See our sources
          </Link>
        </p>
      </section>
    </div>
  );
}
