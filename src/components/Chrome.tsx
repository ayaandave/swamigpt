"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSettings, type TextSize } from "@/lib/settings";
import { accountsEnabled, useAuth } from "@/lib/supabase";
import { Diya } from "./Diya";
import { AskIcon, HomeIcon, LearnIcon, MeditateIcon, PersonIcon, SettingsIcon } from "./icons";

const SIZES: TextSize[] = ["regular", "large", "larger"];
const SIZE_LABEL: Record<TextSize, string> = { regular: "Aa", large: "Aa+", larger: "Aa++" };

export function Header() {
  const { textSize, update } = useSettings();
  const next = SIZES[(SIZES.indexOf(textSize) + 1) % SIZES.length];

  // Sizes here are in px, not rem, so the header still fits a phone at the largest text size
  return (
    <header className="relative z-10 mx-auto flex w-full max-w-3xl items-center justify-between gap-2 px-[16px] pt-[max(16px,env(safe-area-inset-top))] sm:px-6">
      <Link href="/" className="flex min-w-0 items-center gap-1.5 rounded-full" aria-label="SwamiGPT home">
        <Diya size={34} />
        <span className="font-display text-[20px] tracking-tight sm:text-[24px]">SwamiGPT</span>
      </Link>
      <div className="flex shrink-0 items-center gap-[6px] sm:gap-2">
        <button
          type="button"
          onClick={() => update({ textSize: next })}
          className="flex h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-full border-2 border-sandal-edge text-[14px] font-semibold hover:border-kajal sm:px-4"
          aria-label={`Text size: ${textSize}. Tap to make text ${next === "regular" ? "regular" : "bigger"}.`}
        >
          <span className="font-display text-[17px] leading-none">{SIZE_LABEL[textSize]}</span>
          <span className="hidden sm:inline">Text size</span>
        </button>
        <Link
          href="/settings"
          className="flex h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-full border-2 border-sandal-edge text-[14px] font-semibold hover:border-kajal sm:px-4"
        >
          <SettingsIcon className="size-[24px]" />
          <span className="hidden sm:inline">Voice &amp; settings</span>
        </Link>
        {accountsEnabled && <AccountButton />}
      </div>
    </header>
  );
}

const TABS = [
  { href: "/", label: "Home", Icon: HomeIcon, also: ["/today"] }, // today's verse is reached from home
  { href: "/ask", label: "Ask", Icon: AskIcon, also: [] as string[] },
  { href: "/learn", label: "Learn", Icon: LearnIcon, also: ["/read"] }, // the scripture library lives under Learn
  { href: "/meditate", label: "Meditate", Icon: MeditateIcon, also: [] },
];

export function BottomNav() {
  const path = usePathname();
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-30 border-t-2 border-sandal-edge bg-sandal/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
    >
      <ul className="mx-auto grid max-w-3xl grid-cols-4">
        {TABS.map(({ href, label, Icon, also }) => {
          const active = href === "/" ? path === "/" || also.some((p) => path.startsWith(p)) : [href, ...also].some((p) => path.startsWith(p));
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-[4.5rem] flex-col items-center justify-center gap-1 text-[0.8rem] font-semibold ${
                  active ? "text-kesar-deep" : "text-kajal-soft hover:text-kajal"
                }`}
              >
                <span
                  className={`flex h-9 w-14 items-center justify-center rounded-full transition-colors ${
                    active ? "bg-kesar/25" : ""
                  }`}
                >
                  <Icon className="size-7" />
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

// "Sign in" when signed out; the first letter of their email when signed in
function AccountButton() {
  const { ready, user } = useAuth();
  if (!ready) return <span className="size-[44px]" />;
  if (user) {
    return (
      <Link
        href="/account"
        aria-label={`Your account (${user.email})`}
        className="flex size-[44px] items-center justify-center rounded-full bg-tulsi font-display text-[18px] text-sandal hover:bg-kajal"
      >
        {(user.email ?? "?")[0].toUpperCase()}
      </Link>
    );
  }
  return (
    <Link
      href="/login"
      className="flex h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-full bg-kajal text-[14px] font-semibold text-sandal hover:bg-kajal-soft sm:px-4"
    >
      <PersonIcon className="size-[24px]" />
      <span className="hidden sm:inline">Sign in</span>
      <span className="sr-only sm:hidden">Sign in</span>
    </Link>
  );
}
