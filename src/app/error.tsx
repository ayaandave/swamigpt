"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Om } from "@/components/Om";

// Shown when a page breaks: a calm message instead of a bare error screen, with a way back
export default function PageError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error("Page error", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center pt-12 text-center">
      <Om size={96} />
      <h1 className="mt-4 font-display text-[1.75rem] leading-tight">Something went wrong</h1>
      <p className="mt-2 max-w-[34ch] text-[1.1rem] leading-relaxed text-kajal-soft">
        This page didn&apos;t load properly. Please try again in a moment.
      </p>
      <button
        type="button"
        onClick={() => retry()}
        className="mt-8 min-h-14 rounded-xl bg-kesar px-8 text-[1.05rem] font-bold text-on-kesar hover:bg-kesar-deep hover:text-sandal"
      >
        Try again
      </button>
      <Link href="/" className="mt-5 inline-flex min-h-11 items-center font-semibold text-kesar-deep underline underline-offset-4">
        Go home
      </Link>
    </div>
  );
}
