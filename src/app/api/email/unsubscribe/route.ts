// The unsubscribe link in every email (GET shows a page; POST is mail apps' one-click button).
// Turns off the weekly verse and the two-weeks-away note. No sign-in needed: the link carries a
// keyed code of the account id, so it only works for the person it was sent to.
import { adminDb, validUnsubToken } from "@/lib/email";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function unsubscribe(request: Request) {
  const params = new URL(request.url).searchParams;
  const u = params.get("u") ?? "";
  const t = params.get("t") ?? "";
  if (!UUID.test(u) || !validUnsubToken(u, t)) return false;
  const db = adminDb();
  if (!db) return false;
  const { error } = await db.from("email_prefs").update({ weekly: false, nudges: false }).eq("user_id", u);
  return !error;
}

const html = (title: string, body: string) =>
  new Response(
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} · SwamiGPT</title></head>
<body style="margin:0;background:#f2e3c6;font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;color:#2b1b10">
<main style="max-width:520px;margin:0 auto;padding:64px 22px;text-align:center"><p style="font-size:40px;margin:0">🪔</p>
<h1 style="font-family:Georgia,serif;font-weight:400;font-size:30px">${title}</h1><p style="font-size:18px;line-height:1.5">${body}</p>
<p><a href="https://www.swamigpt.com" style="color:#9a4a0b;font-size:17px">Go to SwamiGPT</a></p></main></body></html>`,
    { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } },
  );

// Opening the link only shows a button: some mail scanners open every link in an email, and that
// alone mustn't unsubscribe anyone
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const u = params.get("u") ?? "";
  const t = params.get("t") ?? "";
  if (!UUID.test(u) || !validUnsubToken(u, t)) {
    return html("That link didn't work", "Please try the link from the email again, or change your email choices in Settings.");
  }
  const action = `/api/email/unsubscribe?u=${encodeURIComponent(u)}&t=${encodeURIComponent(t)}`;
  return html(
    "Unsubscribe?",
    `You'll stop getting the weekly verse and reminder emails.</p><form method="post" action="${action}"><button type="submit" style="margin-top:8px;border:0;background:#d9741a;color:#fff;font-weight:700;font-size:17px;padding:14px 28px;border-radius:999px;cursor:pointer">Unsubscribe</button></form><p style="font-size:15px">`,
  );
}

// The button above, and mail apps' own one-click "Unsubscribe" (List-Unsubscribe-Post)
export async function POST(request: Request) {
  const ok = await unsubscribe(request);
  const oneClick = (await request.clone().text().catch(() => "")).includes("List-Unsubscribe=One-Click");
  if (oneClick) return Response.json({ ok }, { status: ok ? 200 : 400 });
  return ok
    ? html("You're unsubscribed", "You won't get the weekly verse or reminder emails anymore. You can turn them back on in Settings anytime.")
    : html("That link didn't work", "Please try the link from the email again, or change your email choices in Settings.");
}
