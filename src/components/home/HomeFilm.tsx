"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { HomeAsk } from "./HomeAsk";
import "./home-film.css";

// First-visit home: "The Leaf and the River". A film made with Higgsfield plays as you scroll:
// from the upside-down tree of Gita 15.1, into its leaves, down a falling leaf to the glacier,
// along the river to a still lake, and out to the sea of Mundaka Upanishad 3.2.8. Each chapter
// pins the film to a moment, so scrolling down plays it and scrolling up rewinds it.
// Shown only to new visitors: a script in the page head marks returning, signed-in and iPhone-app
// visitors before first paint, and CSS hides this for them (see FILM_SEEN_SCRIPT).

export const FILM_SEEN_KEY = "swamigpt.seenFilm";
export const FILM_SEEN_SCRIPT = `try{var l=localStorage,s=l.getItem("${FILM_SEEN_KEY}")||window.Capacitor;for(var i=0;!s&&i<l.length;i++){var k=l.key(i);if(k&&k.indexOf("sb-")===0&&k.slice(-11)==="-auth-token")s=1}if(s)document.documentElement.dataset.seenFilm="1"}catch(e){}`;

const BEADS = 18;
const SOURCES: [string, number, number][] = [
  ["Bhagavad Gita", 40, 40],
  ["Upanishads", 190, 18],
  ["Yoga Sutras", 360, 44],
  ["Ramayana", 30, 170],
  ["Mahabharata", 382, 168],
  ["Vivekananda", 210, 130],
];

export function HomeFilm() {
  const root = useRef<HTMLDivElement>(null);
  const film = useRef<HTMLVideoElement>(null);
  const hero = useRef<HTMLVideoElement>(null);
  const [typed, setTyped] = useState("");
  const [answer, setAnswer] = useState(false);
  const [lit, setLit] = useState(0);
  const [breath, setBreath] = useState({ k: 0, word: "Breathe in" });
  const [flow, setFlow] = useState(0);

  useEffect(() => {
    const el = root.current;
    if (!el || document.documentElement.dataset.seenFilm) return;
    // This visit plays the film; the next one goes straight to the quick home
    try {
      localStorage.setItem(FILM_SEEN_KEY, "1");
    } catch {}
    document.documentElement.classList.add("film-on");
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ---- the lines of each chapter rise in as it arrives ----
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.querySelectorAll<HTMLElement>(".hf-reveal").forEach((r, i) => setTimeout(() => r.classList.add("in"), i * 160));
          io.unobserve(e.target);
        }),
      { rootMargin: "0px 0px -30% 0px" },
    );
    const chapters = [...el.querySelectorAll<HTMLElement>(".hf-chapter")];
    const heroCh = chapters[0];
    heroCh.querySelectorAll<HTMLElement>(".hf-reveal").forEach((r, i) => setTimeout(() => r.classList.add("in"), (reduce ? 0 : 900) + i * 160));
    chapters.slice(1).forEach((c) => io.observe(c));

    // ---- scroll → film time ----
    let anchors: { y: number; t: number }[] = [];
    const measure = () => {
      const top = el.getBoundingClientRect().top + scrollY;
      anchors = chapters.map((c) => ({ y: top + c.offsetTop + c.offsetHeight / 2 - innerHeight / 2, t: Number(c.dataset.t) }));
    };
    const timeAt = (y: number) => {
      if (y <= anchors[0].y) return anchors[0].t;
      for (let i = 0; i < anchors.length - 1; i++) {
        const a = anchors[i], b = anchors[i + 1];
        if (y <= b.y) return a.t + (b.t - a.t) * ((y - a.y) / Math.max(1, b.y - a.y));
      }
      return anchors[anchors.length - 1].t;
    };
    // how far through a chapter the screen's middle is (0 → 1)
    const through = (sel: string) => {
      const c = el.querySelector<HTMLElement>(sel);
      if (!c) return 0;
      const r = c.getBoundingClientRect();
      return Math.min(1, Math.max(0, (innerHeight * 0.75 - r.top) / (r.height * 0.85)));
    };

    let want = 0, shown = 0, raf = 0, stage = "hero";
    const setStage = (s: string) => {
      if (stage === s) return;
      stage = s;
      el.dataset.stage = s;
    };
    let typedOnce = false;
    const onScroll = () => {
      const y = scrollY;
      const filmEnd = anchors[anchors.length - 1].y + innerHeight * 0.9;
      setStage(y < 12 ? "hero" : y < filmEnd ? "film" : "after");
      want = timeAt(y);
      setLit(Math.round(through('[data-fx="mala"]') * BEADS));
      const b = through('[data-fx="breath"]') * 2;
      setBreath({ k: 0.5 - 0.5 * Math.cos(b * Math.PI * 2), word: b % 1 < 0.5 ? "Breathe in" : "Breathe out" });
      setFlow(through('[data-fx="web"]'));
      if (!typedOnce && through('[data-fx="ask"]') > 0.15) {
        typedOnce = true;
        const text = "How do I stop overthinking?";
        if (reduce) {
          setTyped(text);
          setAnswer(true);
        } else {
          let i = 0;
          const step = () => {
            setTyped(text.slice(0, ++i));
            if (i < text.length) setTimeout(step, 45 + Math.random() * 40);
            else setTimeout(() => setAnswer(true), 450);
          };
          step();
        }
      }
    };
    // ease the film toward the scroll position, so it glides instead of jumping
    const seek = () => {
      shown += (want - shown) * (reduce ? 1 : 0.2);
      const v = film.current;
      if (v && v.readyState >= 1 && !v.seeking && Math.abs(v.currentTime - shown) > 1 / 60) {
        try {
          v.currentTime = Math.min(shown, (v.duration || 99) - 0.04);
        } catch {}
      }
      raf = requestAnimationFrame(seek);
    };
    const onResize = () => {
      measure();
      onScroll();
    };
    measure();
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onResize);
    addEventListener("load", onResize);
    if (!reduce) raf = requestAnimationFrame(seek);
    // the looping hero only plays while it can be seen
    const heroIo = new IntersectionObserver(([e]) => {
      const v = hero.current;
      if (!v || reduce) return;
      if (e.isIntersecting) v.play().catch(() => {});
      else v.pause();
    });
    heroIo.observe(heroCh);

    return () => {
      io.disconnect();
      heroIo.disconnect();
      cancelAnimationFrame(raf);
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onResize);
      removeEventListener("load", onResize);
      document.documentElement.classList.remove("film-on");
    };
  }, []);

  return (
    <div ref={root} className="home-film" data-stage="hero">
      {/* the stage: fixed behind the chapters */}
      <div className="hf-stage" aria-hidden="true">
        <video className="hf-layer hf-hero" ref={hero} muted loop playsInline autoPlay preload="auto" poster="/home/film/hero-poster-1920.webp">
          <source src="/home/film/hero-tall.mp4" type="video/mp4" media="(max-aspect-ratio: 4/5)" />
          <source src="/home/film/hero-wide.webm" type="video/webm" />
          <source src="/home/film/hero-wide.mp4" type="video/mp4" />
        </video>
        <video className="hf-layer hf-film" ref={film} muted playsInline preload="auto">
          <source src="/home/film/film-tall.mp4" type="video/mp4" media="(max-aspect-ratio: 4/5)" />
          <source src="/home/film/film-wide.mp4" type="video/mp4" />
        </video>
        <div className="hf-wash" />
      </div>

      <section className="hf-chapter hf-hero-ch" data-t="0">
        <div className="hf-copy">
          <p className="hf-eyebrow hf-reveal">Hindu wisdom, in plain words</p>
          <h1 className="hf-h1 hf-reveal">
            Ask the scriptures <em>anything.</em>
          </h1>
          <p className="hf-lede hf-reveal">
            Calm answers from the Bhagavad Gita, the Upanishads, the Ramayana and more. Every verse is real, and linked to its source.
          </p>
          <div className="hf-ask hf-reveal">
            <HomeAsk />
          </div>
          <p className="hf-hint hf-reveal">
            Scroll the story <span aria-hidden="true">↓</span>
          </p>
        </div>
      </section>

      <section className="hf-chapter" data-t="3.7">
        <div className="hf-copy">
          <p className="hf-eyebrow hf-reveal">Where it begins</p>
          <h2 className="hf-h2 hf-reveal">
            A tree whose leaves are <em>wisdom.</em>
          </h2>
          <Quote who="Krishna says" text="With roots above, branches below, the Asvattha is said to be indestructible; the leaves of it are hymns." cite="Bhagavad Gita 15.1" />
        </div>
      </section>

      <section className="hf-chapter" data-t="7.6">
        <div className="hf-copy">
          <p className="hf-eyebrow hf-reveal">One leaf falls</p>
          <h2 className="hf-h2 hf-reveal">
            4,000+ real verses. <em>One for every question.</em>
          </h2>
          <ul className="hf-stats hf-reveal">
            <li>
              <b>4,000+</b>passages
            </li>
            <li>
              <b>7</b>sacred texts
            </li>
            <li>
              <b>0</b>made-up quotes
            </li>
          </ul>
          <p className="hf-lede hf-reveal">Before it answers, SwamiGPT searches every passage by meaning, then quotes only what it finds, word for word.</p>
        </div>
      </section>

      <section className="hf-chapter" data-t="10.1" data-fx="ask">
        <div className="hf-copy">
          <p className="hf-eyebrow hf-reveal">Ask</p>
          <h2 className="hf-h2 hf-reveal">Bring the question you can&apos;t shake.</h2>
          <div className="hf-chat hf-reveal">
            <div className="hf-bubble" aria-label="How do I stop overthinking?">{typed}</div>
            <div className={`hf-answer ${answer ? "in" : ""}`}>
              <p>Even Arjuna, the bravest warrior of his time, said his mind was as hard to hold as the wind. Krishna didn&apos;t tell him to just relax.</p>
              <blockquote className="hf-quote">
                <span className="hf-who">Krishna says</span>
                <p>“Without doubt the mind is hard to curb and restless; but it may be curbed by constant practice and by dispassion.”</p>
                <cite>Bhagavad Gita 6.35</cite>
              </blockquote>
              <p className="hf-practice">Try tonight: breathe in for 4, out for 6, ten times.</p>
            </div>
          </div>
          <Link className="hf-go hf-reveal" href="/ask">
            Ask your own question
          </Link>
        </div>
      </section>

      <section className="hf-chapter" data-t="12.0" data-fx="mala">
        <div className="hf-copy">
          <p className="hf-eyebrow hf-reveal">Learn</p>
          <h2 className="hf-h2 hf-reveal">
            Five minutes a day. <em>One bead at a time.</em>
          </h2>
          <svg className="hf-mala hf-reveal" viewBox="0 0 300 300" role="img" aria-label="A mala of 18 beads, one for each lesson">
            <defs>
              <radialGradient id="hfBead" cx="35%" cy="30%" r="75%">
                <stop offset="0%" stopColor="#ffe0a3" />
                <stop offset="45%" stopColor="#d9741a" />
                <stop offset="100%" stopColor="#5a2508" />
              </radialGradient>
            </defs>
            <circle cx="150" cy="150" r="112" fill="none" stroke="#c98a2e" strokeWidth="1.5" opacity=".6" />
            {Array.from({ length: BEADS }, (_, i) => {
              const a = Math.PI / 2 + (i + 0.5) * ((2 * Math.PI) / (BEADS + 1));
              return (
                <circle
                  key={i}
                  cx={(150 + 112 * Math.cos(a)).toFixed(1)}
                  cy={(150 + 112 * Math.sin(a)).toFixed(1)}
                  r="11"
                  className={i < lit ? "hf-bead lit" : "hf-bead"}
                />
              );
            })}
            <circle cx="150" cy="262" r="14" fill="#a4281f" />
            <text className="hf-count" x="150" y="150" textAnchor="middle">
              {lit}
            </text>
            <text className="hf-count-label" x="150" y="174" textAnchor="middle">
              OF 18 LESSONS
            </text>
          </svg>
          <Quote who="The Upanishads say" text="Rise, awake! having obtained your boons, understand them!" cite="Katha Upanishad 1.3.14" />
          <Link className="hf-go ghost hf-reveal" href="/learn/gita-18-days">
            Start The Gita in 18 Days
          </Link>
        </div>
      </section>

      <section className="hf-chapter" data-t="15.6" data-fx="breath">
        <div className="hf-copy">
          <p className="hf-eyebrow hf-reveal">Meditate</p>
          <h2 className="hf-h2 hf-reveal">
            Let the mind go still, <em>like water.</em>
          </h2>
          <div className="hf-breath hf-reveal" aria-hidden="true">
            <i style={{ transform: `scale(${0.55 + 0.45 * breath.k})` }} />
            <i className="r2" style={{ transform: `scale(${0.75 + 0.35 * breath.k})` }} />
            <span>{breath.word}</span>
          </div>
          <Quote
            who="Krishna says"
            text="As often as the wavering and unsteady mind goeth forth, so often reining it in, let him bring it under the control of the Self."
            cite="Bhagavad Gita 6.26"
          />
          <Link className="hf-go ghost hf-reveal" href="/meditate">
            Try a 3-minute reset
          </Link>
        </div>
      </section>

      <section className="hf-chapter" data-t="18.8" data-fx="web">
        <div className="hf-copy">
          <p className="hf-eyebrow hf-reveal">Every verse is real</p>
          <h2 className="hf-h2 hf-reveal">
            Many rivers. <em>One sea.</em>
          </h2>
          <svg className="hf-web hf-reveal" viewBox="0 0 460 400" role="img" aria-label="Six sources flowing into one sea">
            <defs>
              <linearGradient id="hfThread" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffe2a6" />
                <stop offset="100%" stopColor="#ff9a3c" />
              </linearGradient>
              <radialGradient id="hfSea">
                <stop offset="0%" stopColor="#ffd38a" stopOpacity=".9" />
                <stop offset="100%" stopColor="#ff9a3c" stopOpacity="0" />
              </radialGradient>
            </defs>
            <ellipse cx="230" cy="340" rx="150" ry="46" fill="url(#hfSea)" opacity={0.3 + 0.7 * flow} />
            {SOURCES.map(([name, x, y], i) => {
              const ex = 150 + i * 32;
              const local = Math.min(1, Math.max(0, flow * 1.6 - i * 0.1));
              return (
                <g key={name}>
                  <path
                    d={`M${x + 20} ${y + 14} C ${x + 20} ${y + 120}, ${ex} 196, ${ex} 336`}
                    className="hf-thread"
                    pathLength={1}
                    style={{ strokeDasharray: 1, strokeDashoffset: 1 - local }}
                  />
                  <circle cx={x + 20} cy={y + 14} r="4" className="hf-node" />
                  <text x={x + 20} y={y} textAnchor="middle" className="hf-src">
                    {name}
                  </text>
                </g>
              );
            })}
          </svg>
          <Quote who="The Upanishads say" text="As the flowing rivers disappear in the sea, losing their name and their form…" cite="Mundaka Upanishad 3.2.8" />
        </div>
      </section>

      <section className="hf-chapter hf-end" data-t="20.0">
        <div className="hf-copy">
          <h2 className="hf-h2 hf-reveal">
            Start with a <em>question.</em>
          </h2>
          <div className="hf-ask hf-reveal">
            <HomeAsk />
          </div>
          <p className="hf-soon hf-reveal">Free at swamigpt.com · Coming soon to iPhone</p>
        </div>
      </section>
    </div>
  );
}

function Quote({ who, text, cite }: { who: string; text: string; cite: string }) {
  return (
    <blockquote className="hf-quote hf-reveal">
      <span className="hf-who">{who}</span>
      <p>“{text}”</p>
      <cite>{cite}</cite>
    </blockquote>
  );
}
