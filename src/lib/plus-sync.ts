// Keeps public.plus_members in step with RevenueCat, which tracks every subscription (Stripe on
// the web, the App Store in the iPhone app). Rather than trusting each webhook's details, we ask
// RevenueCat for the person's current state, so events arriving late or out of order can't
// leave anyone with the wrong status. Server only.
import "server-only";
import { createClient } from "@supabase/supabase-js";

// The entitlement set up in the RevenueCat dashboard
export const PLUS_ENTITLEMENT = "plus";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Subscriber = {
  entitlements?: Record<string, { expires_date: string | null; grace_period_expires_date?: string | null; product_identifier?: string }>;
  subscriptions?: Record<string, { store?: string; is_sandbox?: boolean }>;
};

// Looks up one account (RevenueCat app user id = Supabase user id) and saves whether it has Plus.
// Returns true if it has Plus now.
export async function syncPlus(userId: string): Promise<boolean> {
  const rcKey = process.env.REVENUECAT_SECRET_KEY;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!rcKey || !url || !secret || !UUID.test(userId)) return false;

  const res = await fetch(`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(userId)}`, {
    headers: { authorization: `Bearer ${rcKey}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`RevenueCat ${res.status}`);
  const { subscriber } = (await res.json()) as { subscriber: Subscriber };

  const plus = subscriber.entitlements?.[PLUS_ENTITLEMENT];
  // Billing trouble keeps Plus on through the store's grace period
  const ends = [plus?.expires_date, plus?.grace_period_expires_date].filter(Boolean).sort().at(-1) ?? null;
  // Test purchases (Stripe test mode, TestFlight) never give real Plus on the live site
  const sandbox = subscriber.subscriptions?.[plus?.product_identifier ?? ""]?.is_sandbox === true;
  const testOnly = sandbox && process.env.VERCEL_ENV === "production";
  const active =
    Boolean(plus) && !testOnly && (plus!.expires_date === null || (ends !== null && new Date(ends) > new Date()));

  const sb = createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });
  const { error } = active
    ? await sb.from("plus_members").upsert({
        user_id: userId,
        expires_at: plus!.expires_date === null ? null : ends,
        product: plus!.product_identifier ?? null,
        store: subscriber.subscriptions?.[plus!.product_identifier ?? ""]?.store ?? null,
        updated_at: new Date().toISOString(),
      })
    : await sb.from("plus_members").delete().eq("user_id", userId);
  if (error) throw new Error(`saving Plus failed: ${error.message}`);
  return active;
}

// Every account id an event mentions (a transfer names both sides), Supabase ids only
export function accountsIn(event: Record<string, unknown>): string[] {
  const ids = [event.app_user_id, event.original_app_user_id, event.aliases, event.transferred_from, event.transferred_to]
    .flat()
    .filter((id): id is string => typeof id === "string" && UUID.test(id));
  return [...new Set(ids)];
}
