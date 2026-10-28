import Link from "next/link";
import type { Metadata } from "next";
import { Leaf } from "@/components/Leaf";

export const metadata: Metadata = { title: "You're offline · SwamiGPT", robots: { index: false } };

// Shown by the service worker when there's no connection and the page wasn't saved before
export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center pt-16 text-center">
      <Leaf size={110} />
      <h1 className="mt-4 font-display text-[2.2rem] leading-tight">You&apos;re offline</h1>
      <p className="mt-3 max-w-[34ch] text-[1.1rem] leading-relaxed text-kajal-soft">
        The leaf is still here. Take a slow breath while your connection comes back. Pages you&apos;ve opened before
        will still work.
      </p>
      <Link
        href="/"
        className="mt-8 flex min-h-14 items-center rounded-full bg-kesar px-8 text-[1.05rem] font-bold text-kajal hover:bg-kesar-deep hover:text-sandal"
      >
        Try again
      </Link>
    </div>
  );
}
