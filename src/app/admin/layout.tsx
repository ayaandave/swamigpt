import type { Metadata } from "next";

// The money dashboard is private: never listed in search engines
export const metadata: Metadata = { title: "Money · SwamiGPT", robots: { index: false, follow: false } };

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return children;
}
