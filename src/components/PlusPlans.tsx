"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Package, Purchases } from "@revenuecat/purchases-js";
import type { PurchasesPackage } from "@revenuecat/purchases-capacitor";
import { PLUS, plusSold, usePlus } from "@/lib/plus";
import { isNativeApp } from "@/lib/native";
import { useIsClient } from "@/lib/store";
import { accessToken, useAuth } from "@/lib/supabase";
import { APPLE_MANAGE_URL, appleUsedTrials, applePackages, buyApple, restoreApple } from "@/lib/apple-purchases";

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

// One plan, whichever store sells it
type Plan = {
  id: string;
  price: string; // what they're actually charged each time, always shown biggest (Apple 3.1.2)
  amount: number; // the same, as a number, to work out the yearly saving
  perMonth: string | null;
  trialDays: number; // 0 when there's no free trial (or they've had it)
  yearly: boolean;
};

// "P1W" → 7, "P7D" → 7, "P1M" → 30
const days = (iso: string | null | undefined) => {
  const m = iso?.match(/^P(\d+)([DWMY])$/);
  if (!m) return 0;
  return Number(m[1]) * { D: 1, W: 7, M: 30, Y: 365 }[m[2] as "D" | "W" | "M" | "Y"];
};

const fromWeb = (pkg: Package): Plan => {
  const option = pkg.webBillingProduct.defaultSubscriptionOption;
  return {
    id: pkg.identifier,
    price: pkg.webBillingProduct.price.formattedPrice,
    amount: pkg.webBillingProduct.price.amountMicros / 1e6,
    perMonth: option?.base.pricePerMonth?.formattedPrice ?? null,
    trialDays: days(option?.trial?.periodDuration),
    yearly: pkg.packageType === "$rc_annual",
  };
};

const UNIT_DAYS: Record<string, number> = { DAY: 1, WEEK: 7, MONTH: 30, YEAR: 365 };
const fromApple = (pkg: PurchasesPackage, usedTrials: Set<string>): Plan => {
  const intro = pkg.product.introPrice;
  const free = intro && intro.price === 0 && !usedTrials.has(pkg.product.identifier);
  return {
    id: pkg.identifier,
    price: pkg.product.priceString,
    amount: pkg.product.price,
    perMonth: pkg.product.pricePerMonthString,
    trialDays: free ? intro.periodNumberOfUnits * (UNIT_DAYS[intro.periodUnit] ?? 0) : 0,
    yearly: pkg.packageType === "ANNUAL",
  };
};

// Apple's store can stall without ever answering; give up after a while instead of showing nothing
function timeout<T>(work: Promise<T>, ms: number): Promise<T> {
  return Promise.race([work, new Promise<T>((_, no) => setTimeout(() => no(new Error("timed out")), ms))]);
}

const gold = "bg-kesar text-on-kesar hover:bg-kesar-deep hover:text-sandal";
const bigButton = "flex min-h-14 w-full items-center justify-center rounded-2xl px-6 text-[1.1rem] font-bold disabled:opacity-60";

// The kind line under the plans
export const KIND_LINE =
  "We'd make SwamiGPT free if we could, but every answer, and every word Swamiji reads aloud, costs us a little.";

export function PlusPlans({ inPopup = false }: { inPopup?: boolean }) {
  const { ready, user } = useAuth();
  const isClient = useIsClient();
  const { plus, recheck } = usePlus();
  const [plans, setPlans] = useState<Plan[] | null>(null);
  const [apple, setApple] = useState<PurchasesPackage[] | null>(null);
  const [web, setWeb] = useState<Package[] | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const [manageUrl, setManageUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!plusSold() || !user) return;
    let live = true;
    const show = (list: Plan[]) => {
      // Yearly first, and picked to start with: it's the better deal
      const sorted = [...list].sort((a, b) => Number(b.yearly) - Number(a.yearly));
      setPlans(sorted);
      setPicked((p) => p ?? sorted[0]?.id ?? null);
    };
    const loaded = isNativeApp()
      ? timeout(applePackages(user.id), 20000).then(async (packages) => {
          // Only decides whether to show the trial; Apple's sheet has the final word
          const used = await timeout(
            appleUsedTrials(
              user.id,
              packages.map((p) => p.product.identifier),
            ),
            5000,
          ).catch(() => new Set<string>());
          if (!live) return;
          setApple(packages);
          setManageUrl(APPLE_MANAGE_URL);
          show(packages.map((p) => fromApple(p, used)));
        })
      : timeout(purchases(user.id), 20000).then(async (p) => {
          const [offerings, info] = await Promise.all([p.getOfferings(), p.getCustomerInfo()]);
          if (!live) return;
          const packages = offerings.current?.availablePackages ?? [];
          setWeb(packages);
          setManageUrl(info.managementURL);
          show(packages.map(fromWeb));
        });
    loaded.catch((e) => {
      console.error("Plus plans didn't load", e);
      if (live) setProblem("Plans couldn't load. Please try again in a moment.");
    });
    return () => {
      live = false;
    };
  }, [user, attempt]);

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
        <Link href="/login" className={`${bigButton} ${gold} mt-4 w-fit`}>
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
  } else if (!plans) {
    body = problem ? (
      <button type="button" onClick={() => {
        setProblem(null);
        setAttempt((a) => a + 1);
      }} className={`${bigButton} ${gold}`}>
        Try again
      </button>
    ) : (
      <p className="flex h-32 items-center justify-center text-kajal-soft">Loading plans…</p>
    );
  } else if (plans.length === 0) {
    body = <p>Plans are being set up. Please check back soon.</p>;
  } else {
    const plan = plans.find((p) => p.id === picked) ?? plans[0];
    const monthly = plans.find((p) => !p.yearly);
    // Honest saving: the yearly price against twelve months of the monthly one
    const save = (p: Plan) =>
      p.yearly && monthly && monthly.amount > 0 ? Math.round((1 - p.amount / (monthly.amount * 12)) * 100) : 0;
    const per = (p: Plan) => (p.yearly ? "year" : "month");
    body = (
      <div className="flex flex-col gap-4">
        <div role="radiogroup" aria-label="Choose a plan" className="grid grid-cols-2 gap-3">
          {plans.map((p) => {
            const on = p.id === plan.id;
            const saving = save(p);
            return (
              <button
                key={p.id}
                type="button"
                role="radio"
                aria-checked={on}
                disabled={busy}
                onClick={() => setPicked(p.id)}
                className={`relative flex min-h-32 flex-col items-start rounded-2xl border-2 px-4 pb-4 pt-5 text-left transition-colors disabled:opacity-60 ${
                  on ? "border-kesar bg-sandal" : "border-sandal-edge hover:border-kajal-soft"
                }`}
              >
                {saving > 0 && (
                  <span className="absolute -top-3 left-3 rounded-full bg-kesar px-2.5 py-0.5 text-[0.75rem] font-bold uppercase tracking-[0.06em] text-on-kesar">
                    Save {saving}%
                  </span>
                )}
                <span className="flex items-center gap-2 text-[0.95rem] font-semibold">
                  <span
                    aria-hidden="true"
                    className={`inline-block size-4 rounded-full border-2 ${on ? "border-kesar bg-kesar shadow-[inset_0_0_0_2px_var(--color-sandal)]" : "border-kajal-soft"}`}
                  />
                  {p.yearly ? "Yearly" : "Monthly"}
                </span>
                <span className="mt-2 text-[1.3rem] font-bold leading-tight">{p.price}</span>
                <span className="text-[0.9rem] text-kajal-soft">a {per(p)}</span>
                {p.yearly && p.perMonth && <span className="text-[0.85rem] text-kajal-soft">({p.perMonth} a month)</span>}
                {p.trialDays > 0 && (
                  <span className="mt-auto pt-2 text-[0.9rem] font-semibold text-kesar-deep">{p.trialDays} days free</span>
                )}
              </button>
            );
          })}
        </div>

        {plan.trialDays > 0 && (
          <ol className="flex flex-col gap-2 border-l-2 border-kesar/50 pl-4 text-[0.95rem]">
            <li>
              <span className="font-semibold">Today:</span> Plus starts, free.
            </li>
            <li>
              <span className="font-semibold">Day {plan.trialDays}:</span> {plan.price} for the {per(plan)}, unless you
              cancel before then.
            </li>
          </ol>
        )}

        <button type="button" disabled={busy} onClick={() => void buy(plan.id)} className={`${bigButton} ${gold}`}>
          {plan.trialDays > 0 ? `Start ${plan.trialDays}-day free trial` : `Get Plus for ${plan.price} a ${per(plan)}`}
        </button>

        <p className="text-[0.85rem] leading-[1.6] text-kajal-soft">
          {plan.trialDays > 0 ? `Free for ${plan.trialDays} days, then ${plan.price} a ${per(plan)}.` : `${plan.price} a ${per(plan)}.`}{" "}
          {native
            ? `Charged to your Apple ID${plan.trialDays > 0 ? " when the trial ends" : ""}. Renews automatically every ${per(plan)} at the same price unless you cancel at least 24 hours before the period ends. Manage or cancel in your Apple ID settings.`
            : `Renews every ${per(plan)} until you cancel. Cancel any time.`}
        </p>

        <p className="flex flex-wrap gap-x-4 gap-y-1 text-[0.85rem] text-kajal-soft">
          {native && (
            <button
              type="button"
              disabled={busy}
              onClick={() => void restore()}
              className="font-semibold text-kesar-deep underline underline-offset-4 disabled:opacity-60"
            >
              Restore purchases
            </button>
          )}
          <Link href="/terms" className="underline underline-offset-2">
            Terms of Use
          </Link>
          <Link href="/privacy" className="underline underline-offset-2">
            Privacy Policy
          </Link>
        </p>

        <p className="text-[0.85rem] italic leading-[1.6] text-kajal-soft">{KIND_LINE}</p>
      </div>
    );
  }

  return (
    <section
      aria-label="Plans"
      className={inPopup ? "mt-5" : "mt-10 max-w-2xl rounded-2xl bg-sandal-deep px-6 py-6"}
    >
      {body}
      {problem && (
        <p role="alert" className="mt-4 font-semibold text-kesar-deep">
          {problem}
        </p>
      )}
    </section>
  );
}
