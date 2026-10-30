import type { ReactNode } from "react";

// The home screen's opening: a slowly breathing gold orb, one headline, one line under it, and the
// question box (`children`) right below, so asking is the first thing anyone can do.
export function HomeHero({ children }: { children?: ReactNode }) {
  return (
    <section className="flex flex-col items-center pt-10 pb-2 text-center sm:pt-16">
      <div className="orb size-28 sm:size-32" aria-hidden="true" />
      <h1 className="mt-10 font-display text-[2rem] leading-[1.1] text-kajal text-balance sm:text-[2.6rem]">
        Ask the scriptures anything.
      </h1>
      <p className="mt-3 max-w-[34ch] text-[1rem] leading-snug text-kajal-soft">
        Answers only from real verses of the Gita, the Upanishads and more. Every one linked.
      </p>
      <div className="mt-7 w-full max-w-xl text-left">{children}</div>
    </section>
  );
}
