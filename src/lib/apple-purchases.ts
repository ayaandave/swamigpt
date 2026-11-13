"use client";

// Plus inside the iPhone app, bought with Apple's in-app purchase through RevenueCat's plugin.
// The RevenueCat user is the Supabase account, the same as on the web, so Plus bought in either
// place works in both.
import type { PurchasesPackage } from "@revenuecat/purchases-capacitor";
import { PLUS } from "./plans";

// Apple's own page for managing subscriptions (opens outside the app)
export const APPLE_MANAGE_URL = "https://apps.apple.com/account/subscriptions";

let configured = false;
async function purchases(userId: string) {
  const { Purchases } = await import("@revenuecat/purchases-capacitor");
  if (!configured) {
    await Purchases.configure({ apiKey: PLUS.iosKey, appUserID: userId });
    configured = true;
  } else if ((await Purchases.getAppUserID()).appUserID !== userId) {
    await Purchases.logIn({ appUserID: userId });
  }
  return Purchases;
}

export async function applePackages(userId: string) {
  const p = await purchases(userId);
  const offerings = await p.getOfferings();
  return offerings.current?.availablePackages ?? [];
}

// Product ids whose free trial this Apple ID has already used (Apple gives each trial once).
// When Apple can't say, the trial is shown and Apple's own purchase sheet has the final word.
export async function appleUsedTrials(userId: string, productIds: string[]): Promise<Set<string>> {
  const p = await purchases(userId);
  const found = await p.checkTrialOrIntroductoryPriceEligibility({ productIdentifiers: productIds });
  // 1 = INTRO_ELIGIBILITY_STATUS_INELIGIBLE
  return new Set(Object.entries(found).filter(([, e]) => e.status === 1).map(([id]) => id));
}

// "cancelled" when they backed out; throws on a real failure
export async function buyApple(userId: string, pkg: PurchasesPackage): Promise<"bought" | "cancelled"> {
  const p = await purchases(userId);
  try {
    await p.purchasePackage({ aPackage: pkg });
    return "bought";
  } catch (e) {
    if ((e as { userCancelled?: boolean | null }).userCancelled) return "cancelled";
    throw e;
  }
}

// Asks Apple for this Apple ID's past purchases and links them to this account
export async function restoreApple(userId: string) {
  const p = await purchases(userId);
  await p.restorePurchases();
}
