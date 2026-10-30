"use client";

import { useEffect } from "react";
import { INTRO_DECODE_SCRIPT, INTRO_MS, INTRO_WORD } from "@/lib/intro";

// The opening overlay. Hidden unless html[data-intro] was set before first paint (src/lib/intro.ts);
// CSS does the animating and a tiny inline script scrambles the letters, so it all plays even before
// the page's JavaScript arrives. Once it has finished, the flag is cleared so moving around the app
// doesn't replay any of it.
export function BrandIntro() {
  useEffect(() => {
    const d = document.documentElement;
    if (!d.dataset.intro) return;
    const t = setTimeout(() => delete d.dataset.intro, INTRO_MS);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="brand-intro" aria-hidden="true">
      <div className="brand-intro__stack">
        <p id="intro-word" className="brand-intro__word">
          {INTRO_WORD.split("").map((ch, i) => (
            // The inline script changes these letters while they decode
            <span key={i} suppressHydrationWarning>
              {ch}
            </span>
          ))}
        </p>
        <div className="brand-intro__scan" />
        <p className="brand-intro__tag">Life. School. Future. Answered.</p>
      </div>
      <script dangerouslySetInnerHTML={{ __html: INTRO_DECODE_SCRIPT }} />
    </div>
  );
}
