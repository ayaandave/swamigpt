"use client";

import { useEffect, useState } from "react";
import { createLocalStore } from "@/lib/store";
import { APP_STORE_URL } from "@/lib/seo";

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

const dismissed = createLocalStore<{ at: number }>("swamigpt.install-dismissed", { at: 0 });

// Registers the offline helper (live site only), and on phones offers to put SwamiGPT on the home
// screen: one tap where the browser allows it (Android), the Share-menu steps on iPhone.
export function InstallApp() {
  const [prompt, setPrompt] = useState<InstallEvent | null>(null);
  const [kind, setKind] = useState<"android" | "ios" | null>(null);

  useEffect(() => {
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
    const installed =
      window.matchMedia("(display-mode: standalone)").matches || (navigator as { standalone?: boolean }).standalone;
    // Hidden once installed, and for a month after "Not now"
    if (installed || Date.now() - dismissed.get().at < 30 * 86_400_000) return;
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setPrompt(e as InstallEvent);
      setKind("android");
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    // iPhone Safari has no install button: show the steps instead
    const ua = navigator.userAgent;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the device is only known in the browser
    if (/iPhone|iPad/.test(ua) && /Safari/.test(ua) && !/CriOS|FxiOS/.test(ua)) setKind("ios");
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (!kind) return null;

  const install = async () => {
    if (!prompt) return;
    await prompt.prompt();
    await prompt.userChoice;
    setPrompt(null);
    setKind(null);
  };

  return (
    <section aria-label="Install SwamiGPT" className="mt-10 rounded-2xl border border-sandal-edge px-6 py-5">
      {kind === "android" ? (
        <>
          <p className="font-display text-[1.15rem] leading-tight">Keep SwamiGPT on your home screen</p>
          <p className="mt-1 text-[1rem] text-kajal-soft">It opens like an app, full screen, in one tap.</p>
        </>
      ) : (
        <>
          <p className="font-display text-[1.15rem] leading-tight">SwamiGPT is on the App Store</p>
          <p className="mt-1 text-[1rem] leading-relaxed text-kajal-soft">
            Get the free iPhone app, with daily verse reminders.
          </p>
        </>
      )}
      <div className="mt-4 flex flex-wrap gap-3">
        {kind === "ios" && (
          <a
            href={APP_STORE_URL}
            className="inline-flex min-h-12 items-center rounded-xl bg-kesar px-6 font-bold text-on-kesar hover:bg-kesar-deep hover:text-sandal"
          >
            Get the app
          </a>
        )}
        {kind === "android" && (
          <button
            type="button"
            onClick={() => void install()}
            className="min-h-12 rounded-xl bg-kesar px-6 font-bold text-on-kesar hover:bg-kesar-deep hover:text-sandal"
          >
            Install
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            dismissed.set({ at: Date.now() });
            setKind(null);
          }}
          className="min-h-12 rounded-xl border border-sandal-edge px-6 font-semibold hover:border-kajal"
        >
          Not now
        </button>
      </div>
    </section>
  );
}
