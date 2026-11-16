import Link from "next/link";
import type { Metadata } from "next";
import { Om } from "@/components/Om";

export const metadata: Metadata = { title: "Page not found · SwamiGPT" };

// For links to pages that don't exist
export default function NotFound() {
  return (
    <div className="flex flex-col items-center pt-12 text-center">
      <Om size={96} />
      <h1 className="mt-4 font-display text-[1.75rem] leading-tight">We couldn&apos;t find that page</h1>
      <p className="mt-2 max-w-[34ch] text-[1.1rem] leading-relaxed text-kajal-soft">
        It may have moved, or the link has a small mistake.
      </p>
      <Link
        href="/"
        className="mt-8 flex min-h-14 items-center rounded-xl bg-kesar px-8 text-[1.05rem] font-bold text-on-kesar hover:bg-kesar-deep hover:text-sandal"
      >
        Go home
      </Link>
    </div>
  );
}
