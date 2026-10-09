"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSettings, type TextSize } from "@/lib/settings";
import { accountsEnabled, useAuth } from "@/lib/supabase";
import { Diya } from "./Diya";
import { AskIcon, LearnIcon, MeditateIcon, PersonIcon, SettingsIcon, TodayIcon } from "./icons";

const SIZES: TextSize[] = ["regular", "large", "larger"];
const SIZE_LABEL: Record<TextSize, string> = { regular: "Aa", large: "Aa+", larger: "Aa++" };

export function Header() {
  const { textSize, update } = useSettings();
  const next = SIZES[(SIZES.indexOf(textSize) + 1) % SIZES.length];

  return (
    <header className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-4 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6">
      <Link href="/" className="flex items-center gap-2 rounded-full pr-3" aria-label="SwamiGPT home">
        <Diya size={40} />
        <span className="font-display text-[1.3rem] tracking-tight">SwamiGPT</span>
      </Link>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => update({ textSize: next })}
          className="flex min-h-12 items-center gap-2 rounded-full border-2 border-sandal-edge px-4 text-[0.85rem] font-semibold hover:border-kajal"
          aria-label={`Text size: ${textSize}. Tap to make text ${next === "regular" ? "regular" : "bigger"}.`}
        >
          <span className="font-display text-[1.1rem] leading-none">{SIZE_LABEL[textSize]}</span>
          <span className="hidden sm:inline">Text size</span>
        </button>
        <Link
          href="/settings"
          className="flex min-h-12 items-center gap-2 rounded-full border-2 border-sandal-edge px-4 text-[0.85rem] font-semibold hover:border-kajal"
        >
          <SettingsIcon className="size-6" />
          <span className="hidden sm:inline">Voice &amp; settings</span>
        </Link>
        {accountsEnabled && <AccountButton />}
      </div>
    </header>
  );
}

const TABS = [
  { href: "/", label: "Ask", Icon: AskIcon, also: [] as string[] },
  { href: "/meditate", label: "Meditate", Icon: MeditateIcon, also: [] },
  { href: "/learn", label: "Learn", Icon: LearnIcon, also: ["/read"] }, // the scripture library lives under Learn
  { href: "/today", label: "Today", Icon: TodayIcon, also: [] },
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
          const active = href === "/" ? path === "/" : [href, ...also].some((p) => path.startsWith(p));
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
  if (!ready) return <span className="size-12" />;
  if (user) {
    return (
      <Link
        href="/account"
        aria-label={`Your account (${user.email})`}
        className="flex size-12 items-center justify-center rounded-full bg-tulsi font-display text-[1.2rem] text-sandal hover:bg-kajal"
      >
        {(user.email ?? "?")[0].toUpperCase()}
      </Link>
    );
  }
  return (
    <Link
      href="/login"
      className="flex min-h-12 items-center gap-2 rounded-full bg-kajal px-4 text-[0.85rem] font-semibold text-sandal hover:bg-kajal-soft"
    >
      <PersonIcon className="size-6" />
      <span className="hidden sm:inline">Sign in</span>
      <span className="sr-only sm:hidden">Sign in</span>
    </Link>
  );
}
