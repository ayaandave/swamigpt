"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { getSettings } from "@/lib/settings";
import { isNativeApp, onNotificationTap, scheduleDailyVerse } from "@/lib/native";
import { APP_AUTH_REDIRECT, finishNativeOAuth } from "@/lib/native-auth";

// Mounted once in the layout. Inside the iPhone app: keeps a month of morning verses scheduled
// (topped up each time the app opens) and opens today's verse when a notification is tapped.
// It also finishes Google sign-in when Safari hands the app back its callback link.
export function NativeBridge() {
  const router = useRouter();
  useEffect(() => {
    if (!isNativeApp()) return;
    const { dailyVerse } = getSettings();
    if (dailyVerse.on) void scheduleDailyVerse(dailyVerse.time);
    let off = () => {};
    void onNotificationTap((url) => router.push(url)).then((f) => (off = f));
    // Coming back from Google sign-in in Safari's sheet: save the session, then go home
    let offLink = () => {};
    void import("@capacitor/app").then(({ App }) =>
      App.addListener("appUrlOpen", ({ url }) => {
        if (!url.startsWith(APP_AUTH_REDIRECT)) return;
        void finishNativeOAuth(url).then((problem) => router.push(problem ? `/login?error=${encodeURIComponent(problem)}` : "/"));
      }).then((h) => (offLink = () => void h.remove())),
    );
    return () => {
      off();
      offLink();
    };
  }, [router]);
  return null;
}
