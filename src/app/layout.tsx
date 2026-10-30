import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono, Tiro_Devanagari_Sanskrit } from "next/font/google";
import { settingsScript } from "@/lib/settings";
import { FILM_SEEN_SCRIPT } from "@/lib/film";
import { HOME_DESCRIPTION, HOME_TITLE } from "@/lib/seo";
import { BottomNav, Header } from "@/components/Chrome";
import { WelcomeGate } from "@/components/WelcomeGate";
import { AccountSync } from "@/components/AccountSync";
import { NativeBridge } from "@/components/NativeBridge";
import { PrivateAnalytics } from "@/components/PrivateAnalytics";
import "./globals.css";

const tiro = Tiro_Devanagari_Sanskrit({
  variable: "--font-tiro",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin", "devanagari"],
});

const geist = Geist({ variable: "--font-geist", subsets: ["latin", "latin-ext"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.swamigpt.com"),
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  // Opens full-screen, like an app, when added to an iPhone home screen
  appleWebApp: { capable: true, title: "SwamiGPT", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
    { media: "(prefers-color-scheme: light)", color: "#fbfbfa" },
  ],
  viewportFit: "cover", // lets the safe-area insets reach under the iPhone notch and home bar
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${tiro.variable} ${geist.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: settingsScript }} />
        <script dangerouslySetInnerHTML={{ __html: FILM_SEEN_SCRIPT }} />
      </head>
      <body className="min-h-dvh" suppressHydrationWarning>
        {/* In the iPhone app the page runs under the clock and battery; this keeps a calm strip
            behind them so scrolled text never shows through. Zero height in a normal browser. */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-x-0 top-0 z-30 h-[env(safe-area-inset-top)] bg-sandal/90 backdrop-blur-md"
        />
        <Header />
        <main className="mx-auto w-full max-w-3xl px-4 pb-40 sm:px-6 md:pb-20">{children}</main>
        <BottomNav />
        <WelcomeGate />
        <AccountSync />
        <NativeBridge />
        {/* Visit counts without cookies or questions; reads the address, so it waits for the page in a Suspense */}
        <Suspense>
          <PrivateAnalytics />
        </Suspense>
      </body>
    </html>
  );
}
