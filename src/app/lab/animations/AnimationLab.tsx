"use client";

import { useState, type ReactNode } from "react";
import BlurText from "@/components/reactbits/BlurText";
import RotatingText from "@/components/reactbits/RotatingText";
import ShinyText from "@/components/reactbits/ShinyText";
import GradientText from "@/components/reactbits/GradientText";
import CountUp from "@/components/reactbits/CountUp";
import { SendIcon } from "@/components/icons";

// Five calm animations, each shown on the SwamiGPT screen it would live on. Pick by letter.
export function AnimationLab() {
  return (
    <div className="flex flex-col gap-10 pt-6">
      <header className="flex flex-col gap-2">
        <p className="text-[0.8rem] font-bold tracking-[0.18em] text-kesar-deep uppercase">Animation lab · private</p>
        <h1 className="font-display text-[2rem] leading-tight">Which animations do you like?</h1>
        <p className="text-kajal-soft">
          Each one is shown where it would go in the app. Tap Replay to watch it again, then tell Claude the letters you want.
        </p>
      </header>

      <Demo letter="A" name="Blur Text" where="Home headline: the words drift into focus once.">
        {(k) => (
          <div className="rounded-[1.75rem] bg-[#140e18] px-6 py-10 text-center text-sandal">
            <BlurText
              key={k}
              text="Ask the scriptures anything."
              animateBy="words"
              direction="bottom"
              delay={120}
              className="justify-center font-display text-[clamp(2.2rem,7vw,3.4rem)] leading-[1.05]"
            />
          </div>
        )}
      </Demo>

      <Demo letter="B" name="Rotating Text" where="Under the headline: the example topic changes every few seconds.">
        {(k) => (
          <div className="flex flex-wrap items-center justify-center gap-x-2 rounded-[1.75rem] bg-sandal-deep px-6 py-10 text-center font-display text-[1.7rem] leading-tight">
            <span>Ask about</span>
            <RotatingText
              key={k}
              texts={["stress", "karma", "Krishna", "your purpose", "sleep", "exams"]}
              effect="blur"
              rotationInterval={2400}
              staggerDuration={0.015}
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
              splitBy="characters"
              mainClassName="overflow-hidden rounded-xl bg-kesar px-3 py-1 text-kajal"
            />
          </div>
        )}
      </Demo>

      <Demo letter="C" name="Shiny Text" where="The Ask button: a slow gold shimmer every few seconds.">
        {(k) => (
          <div className="flex flex-col items-center gap-4 rounded-[1.75rem] bg-sandal-deep px-6 py-10">
            <div className="flex w-full max-w-md items-center gap-2 rounded-full border-2 border-white/70 bg-white/80 py-2 pr-2 pl-6">
              <span className="flex-1 text-[1.1rem] text-kajal-soft/80">What’s on your mind?</span>
              <span className="flex size-12 items-center justify-center rounded-full bg-kesar text-kajal">
                <SendIcon className="size-6" />
              </span>
            </div>
            <button type="button" className="rounded-full bg-kajal px-7 py-3 text-[1.1rem] font-bold">
              <ShinyText key={k} text="Ask SwamiGPT" color="#e8d2a8" shineColor="#ffd38a" speed={3} delay={1.5} glow={0.4} />
            </button>
          </div>
        )}
      </Demo>

      <Demo letter="D" name="Count Up" where="Home or About: the numbers count up when you scroll to them.">
        {(k) => (
          <div className="grid grid-cols-3 gap-3 rounded-[1.75rem] bg-tulsi px-4 py-8 text-center text-sandal">
            {[
              { to: 4000, suffix: "+", label: "real passages", down: false },
              { to: 47, suffix: "", label: "short lessons", down: false },
              { to: 50, suffix: "", label: "made-up quotes", down: true },
            ].map((s) => (
              <div key={s.label} className="flex flex-col gap-1">
                <CountUp
                  key={`${k}-${s.label}`}
                  to={s.to}
                  from={0}
                  direction={s.down ? "down" : "up"}
                  duration={1.6}
                  separator=","
                  suffix={s.suffix}
                  className="font-display text-[1.7rem] leading-none sm:text-[2.2rem]"
                />
                <span className="text-[0.85rem] opacity-85">{s.label}</span>
              </div>
            ))}
          </div>
        )}
      </Demo>

      <Demo letter="E" name="Gradient Text" where="Lesson and course titles: a slow saffron-to-gold flow.">
        {(k) => (
          <div className="flex flex-col gap-2 rounded-[1.75rem] bg-night px-6 py-10 text-sandal">
            <span className="text-[0.8rem] font-bold tracking-[0.18em] uppercase opacity-80">Course · 18 days</span>
            <GradientText
              key={k}
              colors={["#ffb347", "#ffe2a6", "#d9741a", "#ffb347"]}
              animationSpeed={8}
              className="font-display text-[2.4rem] leading-tight"
            >
              The Gita in 18 Days
            </GradientText>
            <span className="text-[0.95rem] opacity-85">Five minutes a day. One bead at a time.</span>
          </div>
        )}
      </Demo>

      <p className="pb-6 text-[0.9rem] text-kajal-soft">
        Left out on purpose: Glitch, Decrypted, Fuzzy and ASCII text feel too techy for SwamiGPT. Split Text, Text Type and
        Scroll Reveal need a second animation library (GSAP), so they’re skipped to keep the app fast on phones.
      </p>
    </div>
  );
}

function Demo({ letter, name, where, children }: { letter: string; name: string; where: string; children: (k: number) => ReactNode }) {
  const [k, setK] = useState(0);
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-display text-[1.5rem] leading-tight">
            <span className="text-kesar-deep">{letter}.</span> {name}
          </h2>
          <p className="text-[0.95rem] text-kajal-soft">{where}</p>
        </div>
        <button
          type="button"
          onClick={() => setK((n) => n + 1)}
          className="min-h-11 shrink-0 rounded-full border-2 border-sandal-edge px-4 text-[0.9rem] font-semibold hover:border-kajal"
        >
          Replay
        </button>
      </div>
      {children(k)}
    </section>
  );
}
