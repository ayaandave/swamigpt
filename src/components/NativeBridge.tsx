"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { getSettings } from "@/lib/settings";
import { isNativeApp, onNotificationTap, scheduleDailyVerse } from "@/lib/native";

// Mounted once in the layout. Inside the iPhone app: keeps a month of morning verses scheduled
// (topped up each time the app opens) and opens today's verse when a notification is tapped.
export function NativeBridge() {
  const router = useRouter();
  useEffect(() => {
    if (!isNativeApp()) return;
    const { dailyVerse } = getSettings();
    if (dailyVerse.on) void scheduleDailyVerse(dailyVerse.time);
    let off = () => {};
    void onNotificationTap((url) => router.push(url)).then((f) => (off = f));
    return () => off();
  }, [router]);
  return null;
}
