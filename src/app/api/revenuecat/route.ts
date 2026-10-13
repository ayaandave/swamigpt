// POST /api/revenuecat: RevenueCat's webhook. Called whenever a subscription starts, renews,
// changes, is cancelled or expires; we then save the account's current Plus status.
// The dashboard sends the secret set in REVENUECAT_WEBHOOK_AUTH as the Authorization header.
import { timingSafeEqual } from "node:crypto";
import { accountsIn, syncPlus } from "@/lib/plus-sync";

function authorized(request: Request) {
  const expected = process.env.REVENUECAT_WEBHOOK_AUTH;
  const given = request.headers.get("authorization") ?? "";
  if (!expected) return false;
  const a = Buffer.from(given.replace(/^Bearer /, ""));
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  if (!authorized(request)) return new Response("unauthorized", { status: 401 });
  const { event } = ((await request.json().catch(() => ({}))) ?? {}) as { event?: Record<string, unknown> };
  if (!event) return new Response("bad event", { status: 400 });

  try {
    for (const id of accountsIn(event)) await syncPlus(id);
  } catch (e) {
    console.error("Plus sync failed", e);
    return new Response("retry", { status: 500 }); // RevenueCat retries failed webhooks
  }
  return Response.json({ ok: true });
}
