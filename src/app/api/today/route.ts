// GET /api/today: the daily verses, for the iPhone app's morning notification and home screen
// widget. ?date=YYYY-MM-DD gives that day's verse (the reader's local date, the same choice the
// Today page makes); with no date, the whole cycle in order, so the app can schedule ahead.
import { dailyEntries } from "@/lib/daily";
import { dailyIndex } from "@/lib/daily-verses";
import { whoSays } from "@/lib/scripture/who";

const SITE = "https://www.swamigpt.com";

// A verse short enough for a notification or a small widget, cut at a word
function short(text: string, max: number) {
  const flat = text.replace(/\s*\n\s*/g, " ").replace(/\s+/g, " ").trim();
  return flat.length <= max ? flat : flat.slice(0, flat.lastIndexOf(" ", max)).replace(/[,;:—-]$/, "") + "…";
}

export function GET(request: Request) {
  const entries = dailyEntries().map((d) => ({
    who: whoSays(d.verse),
    verse: short(d.verse.translation, 160),
    reflection: d.reflection,
    question: d.question,
    url: `${SITE}/today`,
  }));
  const date = new URL(request.url).searchParams.get("date");
  const m = date?.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const body = m ? entries[dailyIndex(new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])))] : { count: entries.length, entries };
  return Response.json(body, { headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400" } });
}
