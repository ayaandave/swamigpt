import type { Metadata } from "next";

export const metadata: Metadata = { title: "Saved verses · SwamiGPT", robots: { index: false } };

export default function SavedLayout({ children }: { children: React.ReactNode }) {
  return children;
}
