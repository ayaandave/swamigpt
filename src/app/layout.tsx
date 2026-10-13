import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Analytics } from "@vercel/analytics/next";
import { Atkinson_Hyperlegible_Next, Tiro_Devanagari_Sanskrit } from "next/font/google";
import { settingsScript } from "@/lib/settings";
import { BottomNav, Header } from "@/components/Chrome";
import { WelcomeGate } from "@/components/WelcomeGate";
import { AccountSync } from "@/components/AccountSync";
import "./globals.css";

const tiro = Tiro_Devanagari_Sanskrit({
  variable: "--font-tiro",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin", "devanagari"],
});

const atkinson = Atkinson_Hyperlegible_Next({
  variable: "--font-atkinson",
  subsets: ["latin", "latin-ext"],
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  title: "SwamiGPT",
  description:
    "A calm AI guide to Hindu philosophy, yoga and meditation, answering from the Gita, Upanishads and Yoga Sutras.",
  // Opens full-screen, like an app, when added to an iPhone home screen
  appleWebApp: { capable: true, title: "SwamiGPT", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#f2e3c6",
  viewportFit: "cover", // lets the safe-area insets reach under the iPhone notch and home bar
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${tiro.variable} ${atkinson.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: settingsScript }} />
      </head>
      <body className="min-h-dvh" suppressHydrationWarning>
        <Header />
        <main className="mx-auto w-full max-w-3xl px-4 pb-40 sm:px-6">{children}</main>
        <BottomNav />
        <WelcomeGate />
        <AccountSync />
        {/* Visit counts without cookies; reads the address, so it waits for the page in a Suspense */}
        <Suspense>
          <Analytics />
        </Suspense>
      </body>
    </html>
  );
}
