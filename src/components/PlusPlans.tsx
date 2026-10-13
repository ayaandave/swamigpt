"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Package, Purchases } from "@revenuecat/purchases-js";
import { PLUS, usePlus } from "@/lib/plus";
import { accessToken, useAuth } from "@/lib/supabase";

// Web checkout through RevenueCat (Stripe underneath). The iPhone app will use Apple's in-app
// purchase instead, linked to the same account, so Plus bought in either place works in both.
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

const button =
  "flex min-h-14 w-full items-center justify-between gap-3 rounded-2xl px-6 py-3 text-left text-[1.05rem] font-bold disabled:opacity-60";

export function PlusPlans() {
  const { ready, user } = useAuth();
  const { plus, recheck } = usePlus();
  const [packages, setPackages] = useState<Package[] | null>(null);
  const [manageUrl, setManageUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  useEffect(() => {
    if (!PLUS.enabled || !user) return;
    let live = true;
    void purchases(user.id)
      .then(async (p) => {
        const [offerings, info] = await Promise.all([p.getOfferings(), p.getCustomerInfo()]);
        if (!live) return;
        setPackages(offerings.current?.availablePackages ?? []);
        setManageUrl(info.managementURL);
      })
      .catch(() => live && setProblem("Plans couldn't load. Please try again in a moment."));
    return () => {
      live = false;
    };
  }, [user]);

  const buy = async (pkg: Package) => {
    if (!user) return;
    setBusy(true);
    setProblem(null);
    try {
      const p = await purchases(user.id);
      await p.purchase({ rcPackage: pkg, customerEmail: user.email ?? undefined });
      // Switch Plus on now instead of waiting for the webhook
      const token = await accessToken();
      await fetch("/api/plus", { method: "POST", headers: { authorization: `Bearer ${token}` } }).catch(() => null);
      recheck();
      setManageUrl((await p.getCustomerInfo()).managementURL);
    } catch (e) {
      const { ErrorCode, PurchasesError } = await import("@revenuecat/purchases-js");
      if (!(e instanceof PurchasesError && e.errorCode === ErrorCode.UserCancelledError)) {
        setProblem("That didn't go through, and you weren't charged. Please try again.");
      }
    } finally {
      setBusy(false);
    }
  };

  let body: React.ReactNode;
  if (!PLUS.enabled) {
    body = <p className="text-[1.05rem]">Plus is almost ready. Everything on SwamiGPT is free until then.</p>;
  } else if (!ready) {
    body = <div className="h-32" />;
  } else if (!user) {
    body = (
      <>
        <p className="text-[1.05rem]">Sign in first (it&apos;s free), then come back here to choose a plan.</p>
        <Link href="/login" className={`${button} mt-4 w-fit bg-kesar text-kajal hover:bg-kesar-deep hover:text-sandal`}>
          Sign in
        </Link>
      </>
    );
  } else if (plus) {
    body = (
      <>
        <p className="font-display text-[1.5rem] leading-tight text-kesar-deep">You have Plus. Thank you.</p>
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
    const sorted = [...packages].sort((a) => (a.packageType === "$rc_annual" ? -1 : 0));
    body = (
      <div className="flex flex-col gap-3">
        {sorted.map((pkg) => {
          const product = pkg.webBillingProduct;
          const option = product.defaultSubscriptionOption;
          const trial = option?.trial?.periodDuration;
          const perMonth = option?.base.pricePerMonth;
          const yearly = pkg.packageType === "$rc_annual";
          return (
            <button
              key={pkg.identifier}
              type="button"
              disabled={busy}
              onClick={() => void buy(pkg)}
              className={`${button} ${yearly ? "bg-kesar text-kajal hover:bg-kesar-deep hover:text-sandal" : "border-2 border-sandal-edge hover:border-kajal"}`}
            >
              <span>
                {product.title}
                {trial && <span className="block text-[0.9rem] font-semibold opacity-80">Free trial first</span>}
              </span>
              <span className="text-right">
                {product.currentPrice.formattedPrice}
                {yearly && perMonth && (
                  <span className="block text-[0.85rem] font-semibold opacity-80">
                    {perMonth.formattedPrice} a month
                  </span>
                )}
              </span>
            </button>
          );
        })}
        {packages.length === 0 && <p>Plans are being set up. Please check back soon.</p>}
      </div>
    );
  }

  return (
    <section aria-label="Plans" className="mt-10 max-w-2xl rounded-[2rem] bg-sandal-deep px-6 py-6">
      {body}
      {problem && (
        <p role="alert" className="mt-4 font-semibold text-kesar-deep">
          {problem}
        </p>
      )}
    </section>
  );
}
