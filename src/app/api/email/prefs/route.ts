// GET/POST /api/email/prefs (with the sign-in token): the weekly verse and the two-weeks-away note,
// on or off. Accounts for children under 13 can't turn on emails beyond the welcome.
import { adminDb, recipient } from "@/lib/email";
import { signedInUser } from "@/lib/email-auth";

type Prefs = { weekly: boolean; nudges: boolean };

export async function GET(request: Request) {
  const user = await signedInUser(request);
  const db = adminDb();
  if (!user || !db) return Response.json({ error: "unavailable" }, { status: user ? 503 : 401 });
  const [{ data }, { child }] = await Promise.all([
    db.from("email_prefs").select("weekly, nudges").eq("user_id", user.id).maybeSingle<Prefs>(),
    recipient(db, user.id),
  ]);
  return Response.json({ weekly: data?.weekly ?? false, nudges: child ? false : (data?.nudges ?? true), child });
}

export async function POST(request: Request) {
  const user = await signedInUser(request);
  const db = adminDb();
  if (!user || !db) return Response.json({ error: "unavailable" }, { status: user ? 503 : 401 });
  const body = ((await request.json().catch(() => null)) ?? {}) as Partial<Prefs>;
  const change: Partial<Prefs> = {};
  if (typeof body.weekly === "boolean") change.weekly = body.weekly;
  if (typeof body.nudges === "boolean") change.nudges = body.nudges;
  if (!Object.keys(change).length) return Response.json({ error: "nothing to change" }, { status: 400 });
  const { child } = await recipient(db, user.id);
  if (child && (change.weekly || change.nudges)) return Response.json({ error: "child" }, { status: 403 });
  const { error } = await db.from("email_prefs").upsert({ user_id: user.id, ...change }, { onConflict: "user_id" });
  if (error) return Response.json({ error: "failed" }, { status: 500 });
  return Response.json({ ok: true });
}
