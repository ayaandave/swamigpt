// Run by Vercel every Sunday morning (vercel.json): sends the week's verse to everyone who turned
// on the weekly email. Each person is marked as they're sent, so a retried run never doubles up.
import { adminDb, recipient, sendEmail, todaysVerse, weeklyEmail } from "@/lib/email";
import { fromCron } from "@/lib/email-auth";

export const maxDuration = 300;

export async function GET(request: Request) {
  if (!fromCron(request)) return Response.json({ error: "forbidden" }, { status: 403 });
  const db = adminDb();
  if (!db) return Response.json({ error: "unavailable" }, { status: 503 });

  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Los_Angeles" }).format(new Date());
  const verse = todaysVerse();
  let sent = 0;
  // At most 100 rounds of 100, so a stuck update can never loop forever
  for (let round = 0; round < 100; round++) {
    const { data, error } = await db
      .from("email_prefs")
      .select("user_id")
      .eq("weekly", true)
      .or(`weekly_sent_on.is.null,weekly_sent_on.lt.${today}`)
      .limit(100);
    if (error) return Response.json({ error: error.message, sent }, { status: 500 });
    if (!data.length) break;
    for (const { user_id } of data) {
      const { email, child } = await recipient(db, user_id);
      if (email && !child && (await sendEmail(email, weeklyEmail(verse, user_id), user_id))) sent++;
      // Marked even when skipped or failed, so one bad address can't stall the rest of the list
      await db.from("email_prefs").update({ weekly_sent_on: today }).eq("user_id", user_id);
    }
  }
  return Response.json({ ok: true, sent });
}
