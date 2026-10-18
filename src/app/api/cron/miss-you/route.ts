// Run by Vercel once a day (vercel.json): one gentle note, with a verse, to people who haven't
// visited in 14 days. Sent once per absence (a visit resets it); never to children's accounts or
// to anyone who turned it off.
import { adminDb, missYouEmail, recipient, sendEmail, todaysVerse } from "@/lib/email";
import { fromCron } from "@/lib/email-auth";

export const maxDuration = 300;
const AWAY_DAYS = 14;

export async function GET(request: Request) {
  if (!fromCron(request)) return Response.json({ error: "forbidden" }, { status: 403 });
  const db = adminDb();
  if (!db) return Response.json({ error: "unavailable" }, { status: 503 });

  const cutoff = new Date(Date.now() - AWAY_DAYS * 86_400_000).toISOString();
  const verse = todaysVerse();
  const { data, error } = await db
    .from("email_prefs")
    .select("user_id")
    .eq("nudges", true)
    .is("nudge_sent_at", null)
    .lt("last_seen_at", cutoff)
    .limit(200);
  if (error) return Response.json({ error: error.message }, { status: 500 });

  let sent = 0;
  for (const { user_id } of data) {
    const now = new Date().toISOString();
    // Claimed before sending, so an overlapping run can't send it twice
    const { data: claimed } = await db
      .from("email_prefs")
      .update({ nudge_sent_at: now })
      .eq("user_id", user_id)
      .is("nudge_sent_at", null)
      .select("user_id");
    if (!claimed?.length) continue;
    const { email, child } = await recipient(db, user_id);
    if (email && !child && (await sendEmail(email, missYouEmail(verse, user_id), user_id))) sent++;
  }
  return Response.json({ ok: true, sent });
}
