"use client";

// The iPhone app's native extras, used from the website's own code. Everything here does nothing
// in a normal browser: Capacitor only reports a native platform inside the app.
import { Capacitor } from "@capacitor/core";
import { dailyIndex } from "./daily-verses";

export const isNativeApp = () => Capacitor.isNativePlatform();

type Today = { who: string; verse: string; url: string };
const FIRST_ID = 1000;
const DAYS_AHEAD = 30; // iOS allows 64 waiting notifications; a month ahead, topped up on every open

const pad = (n: number) => String(n).padStart(2, "0");

// Schedules today's-verse notifications for the next month at hh:mm, each with that day's verse.
// Returns false if notifications aren't allowed.
export async function scheduleDailyVerse(time: string): Promise<boolean> {
  if (!isNativeApp()) return false;
  const { LocalNotifications } = await import("@capacitor/local-notifications");
  let perm = await LocalNotifications.checkPermissions();
  if (perm.display === "prompt" || perm.display === "prompt-with-rationale") perm = await LocalNotifications.requestPermissions();
  if (perm.display !== "granted") return false;

  const res = await fetch("/api/today");
  if (!res.ok) return false;
  const { entries } = (await res.json()) as { entries: Today[] };
  const [hh, mm] = time.split(":").map(Number);

  await cancelDailyVerse();
  const now = new Date();
  const notifications = [];
  for (let i = 0; i < DAYS_AHEAD; i++) {
    const at = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i, hh, mm);
    if (at <= now) continue;
    const e = entries[dailyIndex(at)];
    notifications.push({
      id: FIRST_ID + i,
      title: "Today's verse",
      body: `${e.who}: “${e.verse}”`,
      schedule: { at, allowWhileIdle: true },
      extra: { url: "/today", day: `${at.getFullYear()}-${pad(at.getMonth() + 1)}-${pad(at.getDate())}` },
    });
  }
  if (notifications.length) await LocalNotifications.schedule({ notifications });
  return true;
}

export async function cancelDailyVerse() {
  if (!isNativeApp()) return;
  const { LocalNotifications } = await import("@capacitor/local-notifications");
  const ids = Array.from({ length: DAYS_AHEAD + 1 }, (_, i) => ({ id: FIRST_ID + i }));
  await LocalNotifications.cancel({ notifications: ids });
}

// Tapping a notification opens the page it's about (today's verse)
export async function onNotificationTap(go: (url: string) => void) {
  if (!isNativeApp()) return () => {};
  const { LocalNotifications } = await import("@capacitor/local-notifications");
  const handle = await LocalNotifications.addListener("localNotificationActionPerformed", (a) => {
    const url = (a.notification.extra as { url?: string } | undefined)?.url;
    if (url) go(url);
  });
  return () => void handle.remove();
}
