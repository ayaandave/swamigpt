import type { Metadata } from "next";

// The analytics page is private: never listed in search engines
export const metadata: Metadata = { title: "Analytics · SwamiGPT", robots: { index: false, follow: false } };

export default function AnalyticsLayout({ children }: LayoutProps<"/admin/analytics">) {
  return children;
}
