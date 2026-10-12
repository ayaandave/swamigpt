"use client";

import { useEffect, useRef, type ReactNode } from "react";

// The home screen's opening: the ghats of Varanasi at dawn, filling the whole screen, with fog
// drifting over the Ganga. The photo leans gently with the pointer (or scroll, on phones).
// `children` sits at the bottom of the scene, so the question box shows without scrolling.
export function HomeHero({ children }: { children?: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const set = (x: number, y: number) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        el.style.setProperty("--px", x.toFixed(3));
        el.style.setProperty("--py", y.toFixed(3));
      });
    };
    const onPointer = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      set(((e.clientX - r.left) / r.width) * 2 - 1, ((e.clientY - r.top) / r.height) * 2 - 1);
    };
    // On phones there's no pointer to follow, so scrolling moves the photo instead
    const onScroll = () => set(0, Math.min(1, window.scrollY / 400));
    el.addEventListener("pointermove", onPointer);
    el.addEventListener("pointerleave", () => set(0, 0));
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("pointermove", onPointer);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div ref={ref} className="hero relative overflow-hidden bg-[#c9b48f]">
      <picture>
        <source media="(max-width: 900px)" srcSet="/home/varanasi-dawn-1280.jpg" />
        {/* A plain img: it's the page's one big picture, and it has to work in the iOS app too */}
        <img
          src="/home/varanasi-dawn.jpg"
          alt=""
          fetchPriority="high"
          className="hero-photo absolute inset-0 size-full object-cover"
        />
      </picture>

      {/* Light haze up top for the header and words, fog drifting along the river */}
      <div className="hero-veil absolute inset-0" aria-hidden="true" />
      <div className="hero-fog absolute inset-x-[-30%] top-[48%] h-[26%]" aria-hidden="true" />
      <div className="hero-fog hero-fog-2 absolute inset-x-[-30%] top-[60%] h-[22%]" aria-hidden="true" />
      {/* The water darkens slightly under the question box, then melts into the page */}
      <div className="hero-floor absolute inset-x-0 bottom-0 h-[45%]" aria-hidden="true" />

      <div className="hero-content absolute inset-0 flex flex-col">
        <div className="mx-auto w-full max-w-3xl px-6 text-center">
          <h1 className="font-display text-[clamp(2.1rem,6.5vw,3.4rem)] leading-[1.08] text-kajal">
            Ancient wisdom,
            <br />
            {/* Keeps "life today." together when a phone has to wrap the line */}
            for your life&nbsp;today.
          </h1>
          <p className="mt-3 text-[1.1rem] font-semibold tracking-wide text-kajal-soft">Ask. Learn. Breathe.</p>
        </div>
        <div className="flex-1" />
        <div className="mx-auto w-full max-w-3xl px-4 pb-[max(1.25rem,3svh)] sm:px-6">{children}</div>
      </div>
    </div>
  );
}
