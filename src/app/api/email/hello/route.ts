// POST /api/email/hello (with the sign-in token), once per visit while signed in: notes the visit
// (so the two-weeks-away note knows who's been around, and can be sent again after a later absence)
// and sends the welcome email the first time.
import { adminDb, recipient, sendEmail, todaysVerse, welcomeEmail } from "@/lib/email";
import { signedInUser } from "@/lib/email-auth";

export async function POST(request: Request) {
  const user = await signedInUser(request);
  const db = adminDb();
  if (!user || !db) return Response.json({ ok: false }, { status: user ? 503 : 401 });

  const now = new Date().toISOString();
  const { error } = await db
    .from("email_prefs")
    .upsert({ user_id: user.id, last_seen_at: now, nudge_sent_at: null }, { onConflict: "user_id" });
  if (error) {
    console.error("email hello", error.message);
    return Response.json({ ok: false }, { status: 500 });
  }

  // Claim the welcome first, so two tabs signing in at once can't both send it
  const { data: claimed } = await db
    .from("email_prefs")
    .update({ welcome_sent_at: now })
    .eq("user_id", user.id)
    .is("welcome_sent_at", null)
    .select("user_id");
  if (claimed?.length) {
    const { email } = await recipient(db, user.id);
    const sent = email ? await sendEmail(email, welcomeEmail(todaysVerse())) : false;
    // Not sent (no confirmed email yet, or the email service is down): try again on a later visit
    if (!sent) await db.from("email_prefs").update({ welcome_sent_at: null }).eq("user_id", user.id);
  }
  return Response.json({ ok: true });
}
