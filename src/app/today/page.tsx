import type { Metadata } from "next";
import { dailyEntries } from "@/lib/daily";
import { TodayView } from "@/components/TodayView";

export const metadata: Metadata = {
  title: "Today's verse · SwamiGPT",
  description: "A verse a day from the Gita, the Upanishads, the Ramayana and more, with a reflection and a practice.",
};

// The whole month is sent; the browser shows the one for the reader's own date
export default function TodayPage() {
  return <TodayView entries={dailyEntries()} />;
}
