import Link from "next/link";
import type { Metadata } from "next";
import { HOME_DESCRIPTION, HOME_TITLE, JsonLd, ORGANIZATION, SITE, SITE_NAME, pageMeta } from "@/lib/seo";
import { Suspense } from "react";
import { HomeHero } from "@/components/home/HomeHero";
import { HomeAsk } from "@/components/home/HomeAsk";
import { ContinueLesson } from "@/components/home/ContinueLesson";
import { TodayCard } from "@/components/home/TodayCard";
import { PracticeStreak } from "@/components/PracticeStreak";
import { InstallApp } from "@/components/InstallApp";
import { dailyEntries } from "@/lib/daily";
import { OldAskLink } from "@/components/home/OldAskLink";
import { AskIcon, LearnIcon, MeditateIcon, ReadIcon } from "@/components/icons";
import { ExampleAnswer } from "@/components/home/ExampleAnswer";
import { HomeFilm } from "@/components/home/HomeFilm";

const TILES = [
  { href: "/ask", title: "Ask", line: "Real answers from the scriptures, for your question", Icon: AskIcon, tone: "bg-kesar text-kajal" },
  { href: "/learn", title: "Learn", line: "47 short lessons: the Gita, karma, yoga and stories of the gods", Icon: LearnIcon, tone: "bg-tulsi text-sandal" },
  { href: "/meditate", title: "Meditate", line: "Guided meditations and mantras, read aloud", Icon: MeditateIcon, tone: "bg-night text-sandal" },
  { href: "/learn#read", title: "Read", line: "The Gita, 10 Upanishads, the Yoga Sutras and Vivekananda", Icon: ReadIcon, tone: "bg-sandal-deep text-kajal" },
];



// The home screen: what SwamiGPT is, in one look, and the way in to each part
export const metadata: Metadata = pageMeta({ title: HOME_TITLE, description: HOME_DESCRIPTION, path: "/" });

// Tells search engines and AI assistants what SwamiGPT is, in their own terms
const SITE_DATA = {
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE}/#website`,
      name: SITE_NAME,
      url: SITE,
      description: HOME_DESCRIPTION,
      inLanguage: "en",
      publisher: { "@id": `${SITE}/#organization` },
    },
    ORGANIZATION,
    {
      "@type": "WebApplication",
      name: SITE_NAME,
      url: SITE,
      description: HOME_DESCRIPTION,
      applicationCategory: "EducationalApplication",
      operatingSystem: "Any (web browser)",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      publisher: { "@id": `${SITE}/#organization` },
    },
  ],
};

export default function Home() {
  return (
    <div className="pb-6">
      <JsonLd data={SITE_DATA} />
      <Suspense>
        <OldAskLink />
      </Suspense>
      {/* New visitors get the scroll film; returning, signed-in and app visitors get the quick home */}
      <HomeFilm />
      <div className="home-classic">
        <HomeHero>
          <HomeAsk />
        </HomeHero>
        <ContinueLesson />
        <PracticeStreak className="mt-6" />
      </div>

      <ExampleAnswer />

      <section aria-label="What you can do" className="mt-14 grid grid-cols-2 gap-3 [perspective:900px] sm:gap-4">
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
      <InstallApp />

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
