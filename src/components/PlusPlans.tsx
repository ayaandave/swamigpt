"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Package, Purchases } from "@revenuecat/purchases-js";
import type { PurchasesPackage } from "@revenuecat/purchases-capacitor";
import { PLUS, plusSold, usePlus } from "@/lib/plus";
import { isNativeApp } from "@/lib/native";
import { useIsClient } from "@/lib/store";
import { accessToken, useAuth } from "@/lib/supabase";
import { APPLE_MANAGE_URL, applePackages, buyApple, restoreApple } from "@/lib/apple-purchases";

// Web checkout through RevenueCat (Stripe underneath). The iPhone app uses Apple's in-app purchase
// instead (lib/apple-purchases), linked to the same account, so Plus bought in either place works in both.
let instance: Purchases | null = null;
async function purchases(userId: string) {
  const { Purchases } = await import("@revenuecat/purchases-js");
  if (instance && Purchases.isConfigured()) {
    if (instance.getAppUserId() !== userId) await instance.changeUser(userId);
    return instance;
  }
  instance = Purchases.configure({ apiKey: PLUS.webKey, appUserId: userId });
  return instance;
}

// One plan button, whichever store sells it
type Plan = { id: string; title: string; price: string; perMonth: string | null; trial: boolean; yearly: boolean };

const fromWeb = (pkg: Package): Plan => {
  const option = pkg.webBillingProduct.defaultSubscriptionOption;
  return {
    id: pkg.identifier,
    title: pkg.webBillingProduct.title,
    price: pkg.webBillingProduct.currentPrice.formattedPrice,
    perMonth: option?.base.pricePerMonth?.formattedPrice ?? null,
    trial: Boolean(option?.trial?.periodDuration),
    yearly: pkg.packageType === "$rc_annual",
  };
};

const fromApple = (pkg: PurchasesPackage): Plan => ({
  id: pkg.identifier,
  title: pkg.product.title,
  price: pkg.product.priceString,
  perMonth: pkg.product.pricePerMonthString,
  trial: pkg.product.introPrice?.price === 0,
  yearly: pkg.packageType === "ANNUAL",
});

const button =
  "flex min-h-14 w-full items-center justify-between gap-3 rounded-2xl px-6 py-3 text-left text-[1.05rem] font-bold disabled:opacity-60";

export function PlusPlans() {
  const { ready, user } = useAuth();
  const isClient = useIsClient();
  const { plus, recheck } = usePlus();
  const [web, setWeb] = useState<Package[] | null>(null);
  const [apple, setApple] = useState<PurchasesPackage[] | null>(null);
  const [manageUrl, setManageUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  useEffect(() => {
    if (!plusSold() || !user) return;
    let live = true;
    const loaded = isNativeApp()
      ? applePackages(user.id).then((packages) => {
          if (!live) return;
          setApple(packages);
          setManageUrl(APPLE_MANAGE_URL);
        })
      : purchases(user.id).then(async (p) => {
          const [offerings, info] = await Promise.all([p.getOfferings(), p.getCustomerInfo()]);
          if (!live) return;
          setWeb(offerings.current?.availablePackages ?? []);
          setManageUrl(info.managementURL);
        });
    loaded.catch(() => live && setProblem("Plans couldn't load. Please try again in a moment."));
    return () => {
      live = false;
    };
  }, [user]);

  // Paid: switch Plus on now instead of waiting for the webhook. If that step fails, the webhook
  // still turns Plus on shortly, so say so rather than asking them to pay again
  const switchOn = async () => {
    try {
      const token = await accessToken();
      const res = await fetch("/api/plus", { method: "POST", headers: { authorization: `Bearer ${token}` } });
      const { plus } = (await res.json()) as { plus?: boolean };
      if (!res.ok || !plus) throw new Error("not yet");
    } catch {
      setProblem("Your payment went through. Plus can take a minute to switch on, so please check back shortly. Don't buy it again.");
    }
    recheck();
  };

  const buy = async (id: string) => {
    if (!user) return;
    setBusy(true);
    setProblem(null);
    if (isNativeApp()) {
      const pkg = apple?.find((p) => p.identifier === id);
      // Only a failure here means nothing was charged
      const result = pkg ? await buyApple(user.id, pkg).catch(() => null) : null;
      if (result === "bought") await switchOn();
      else if (!result) setProblem("That didn't go through, and you weren't charged. Please try again.");
      setBusy(false);
      return;
    }
    const pkg = web?.find((p) => p.identifier === id);
    const p = pkg && (await purchases(user.id).catch(() => null));
    if (!pkg || !p) {
      setProblem("Plans couldn't load. Please try again in a moment. You haven't been charged.");
      setBusy(false);
      return;
    }
    // The payment itself: only a failure here means nothing was charged
    try {
      await p.purchase({ rcPackage: pkg, customerEmail: user.email ?? undefined });
    } catch (e) {
      const { ErrorCode, PurchasesError } = await import("@revenuecat/purchases-js");
      if (!(e instanceof PurchasesError && e.errorCode === ErrorCode.UserCancelledError)) {
        setProblem("That didn't go through, and you weren't charged. Please try again.");
      }
      setBusy(false);
      return;
    }
    await switchOn();
    setManageUrl((await p.getCustomerInfo().catch(() => null))?.managementURL ?? null);
    setBusy(false);
  };

  // Apple requires a way to get back Plus bought earlier with this Apple ID
  const restore = async () => {
    if (!user) return;
    setBusy(true);
    setProblem(null);
    try {
      await restoreApple(user.id);
      const token = await accessToken();
      const res = await fetch("/api/plus", { method: "POST", headers: { authorization: `Bearer ${token}` } });
      const { plus } = (await res.json()) as { plus?: boolean };
      if (!plus) setProblem("We didn't find Plus on this Apple ID.");
    } catch {
      setProblem("Couldn't check your purchases just now. Please try again in a moment.");
    }
    recheck();
    setBusy(false);
  };

  let body: React.ReactNode;
  const native = isClient && isNativeApp();
  const packages = native ? apple : web;
  if (native && !plusSold()) {
    body = <p className="text-[1.05rem]">Everything in the SwamiGPT app is free.</p>;
  } else if (!plusSold()) {
    body = <p className="text-[1.05rem]">Plus is almost ready. Everything on SwamiGPT is free until then.</p>;
  } else if (!ready) {
    body = <div className="h-32" />;
  } else if (!user) {
    body = (
      <>
        <p className="text-[1.05rem]">Sign in first (it&apos;s free), then come back here to choose a plan.</p>
        <Link href="/login" className={`${button} mt-4 w-fit bg-kesar text-on-kesar hover:bg-kesar-deep hover:text-sandal`}>
          Sign in
        </Link>
      </>
    );
  } else if (plus) {
    body = (
      <>
        <p className="font-display text-[1.25rem] leading-tight text-kesar-deep">You have Plus. Thank you.</p>
        {manageUrl && (
          <a href={manageUrl} className="mt-3 inline-block font-semibold text-kesar-deep underline underline-offset-4">
            Manage or cancel your plan
          </a>
        )}
      </>
    );
  } else if (!packages) {
    body = <div className="h-32" />;
  } else {
    // Yearly first: it's the better deal
    const plans = (native ? apple!.map(fromApple) : web!.map(fromWeb)).sort((a, b) => Number(b.yearly) - Number(a.yearly));
    body = (
      <div className="flex flex-col gap-3">
        {plans.map((plan) => (
          <button
            key={plan.id}
            type="button"
            disabled={busy}
            onClick={() => void buy(plan.id)}
            className={`${button} ${plan.yearly ? "bg-kesar text-on-kesar hover:bg-kesar-deep hover:text-sandal" : "border border-sandal-edge hover:border-kajal"}`}
          >
            <span>
              {plan.title}
              {plan.trial && <span className="block text-[0.9rem] font-semibold opacity-80">Free trial first</span>}
            </span>
            <span className="text-right">
              {plan.price}
              {plan.yearly && plan.perMonth && (
                <span className="block text-[0.85rem] font-semibold opacity-80">{plan.perMonth} a month</span>
              )}
            </span>
          </button>
        ))}
        {plans.length === 0 && <p>Plans are being set up. Please check back soon.</p>}
        {native && (
          <>
            <p className="mt-2 text-[0.9rem] leading-[1.6] text-kajal-soft">
              Payment is charged to your Apple ID. Plus renews automatically at the same price unless you cancel at
              least 24 hours before the end of the current period. With the yearly free trial, you&apos;re charged
              when the trial ends. You can manage or cancel in your Apple ID settings.
            </p>
            <button
              type="button"
              disabled={busy}
              onClick={() => void restore()}
              className="w-fit font-semibold text-kesar-deep underline underline-offset-4 disabled:opacity-60"
            >
              Restore purchases
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <section aria-label="Plans" className="mt-10 max-w-2xl rounded-2xl bg-sandal-deep px-6 py-6">
      {body}
      {problem && (
        <p role="alert" className="mt-4 font-semibold text-kesar-deep">
          {problem}
        </p>
      )}
    </section>
  );
}
