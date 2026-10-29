"use client";

import { useEffect } from "react";
import { INTRO_MS } from "@/lib/intro";
import { Leaf } from "./Leaf";

// The opening overlay. Hidden unless html[data-intro] was set before first paint (src/lib/intro.ts);
// CSS does all the animating, so it plays even before the page's JavaScript arrives. Once it has
// finished, the flag is cleared so moving around the app doesn't replay any of it.
export function BrandIntro() {
  useEffect(() => {
    const d = document.documentElement;
    if (!d.dataset.intro) return;
    const t = setTimeout(() => delete d.dataset.intro, INTRO_MS);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="brand-intro" aria-hidden="true">
      <div className="brand-intro__mark">
        <Leaf size={112} />
      </div>
      <p className="brand-intro__word">
        <span>SwamiGPT</span>
      </p>
    </div>
  );
}
