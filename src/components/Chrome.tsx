"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSettings, type TextSize } from "@/lib/settings";
import { accountsEnabled, useAuth } from "@/lib/supabase";
import { Leaf } from "./Leaf";
import { AvatarBadge } from "./AvatarPicker";
import { AskIcon, HomeIcon, LearnIcon, MeditateIcon, MoneyIcon, PersonIcon, SettingsIcon } from "./icons";
import { useIsAdmin } from "@/lib/admin";

const SIZES: TextSize[] = ["regular", "large", "larger"];
const SIZE_LABEL: Record<TextSize, string> = { regular: "Aa", large: "Aa+", larger: "Aa++" };

const TABS = [
  { href: "/", label: "Home", Icon: HomeIcon, also: ["/today"] }, // today's verse is reached from home
  { href: "/ask", label: "Ask", Icon: AskIcon, also: [] as string[] },
  { href: "/learn", label: "Learn", Icon: LearnIcon, also: ["/read"] }, // the scripture library lives under Learn
  { href: "/meditate", label: "Meditate", Icon: MeditateIcon, also: [] },
];

// The owner also gets the private money page as a tab (shown only when the server says so)
const MONEY_TAB = { href: "/admin", label: "Money", Icon: MoneyIcon, also: [] as string[] };
function useTabs() {
  return useIsAdmin() ? [...TABS, MONEY_TAB] : TABS;
}

const isActive = (path: string, href: string, also: string[]) =>
  href === "/" ? path === "/" || also.some((p) => path.startsWith(p)) : [href, ...also].some((p) => path.startsWith(p));

export function Header() {
  const path = usePathname();
  const tabs = useTabs();
  const { textSize, update } = useSettings();
  const next = SIZES[(SIZES.indexOf(textSize) + 1) % SIZES.length];

  // Sizes here are in px, not rem, so the header still fits a phone at the largest text size
  return (
    <header className="relative z-10 mx-auto flex w-full max-w-3xl items-center md:max-w-5xl justify-between gap-2 px-[16px] pt-[max(16px,env(safe-area-inset-top))] sm:px-6">
      <Link href="/" className="flex min-h-[44px] min-w-0 items-center gap-1.5 rounded-full" aria-label="SwamiGPT home">
        <Leaf size={34} />
        <span className="font-display text-[20px] tracking-tight sm:text-[24px]">SwamiGPT</span>
      </Link>
      {/* On big screens the four sections sit up here; phones keep the tab bar at the bottom */}
      <nav aria-label="Main" className="hidden md:block">
        <ul className="flex items-center gap-1">
          {tabs.map(({ href, label, also }) => {
            const active = isActive(path, href, also);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-[44px] items-center rounded-full px-4 text-[16px] font-semibold ${
                    active ? "bg-kesar/20 text-kesar-deep" : "text-kajal-soft hover:text-kajal"
                  }`}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="flex shrink-0 items-center gap-[6px] sm:gap-2">
        <button
          type="button"
          onClick={() => update({ textSize: next })}
          className="flex h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-full border-2 border-sandal-edge text-[14px] font-semibold hover:border-kajal lg:px-4"
          aria-label={`Text size: ${textSize}. Tap to make text ${next === "regular" ? "regular" : "bigger"}.`}
        >
          <span className="font-display text-[17px] leading-none">{SIZE_LABEL[textSize]}</span>
          <span className="hidden lg:inline">Text size</span>
        </button>
        <Link
          href="/settings"
          aria-label="Voice and settings"
          className="flex h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-full border-2 border-sandal-edge text-[14px] font-semibold hover:border-kajal lg:px-4"
        >
          <SettingsIcon className="size-[24px]" />
          <span className="hidden lg:inline">Voice &amp; settings</span>
        </Link>
        {accountsEnabled && <AccountButton />}
      </div>
    </header>
  );
}



export function BottomNav() {
  const path = usePathname();
  const tabs = useTabs();
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-30 border-t-2 md:hidden border-sandal-edge bg-sandal/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
    >
      <ul className={`mx-auto grid max-w-3xl ${tabs.length === 5 ? "grid-cols-5" : "grid-cols-4"}`}>
        {tabs.map(({ href, label, Icon, also }) => {
          const active = isActive(path, href, also);
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

// "Sign in" when signed out; their avatar (or the first letter of their email) when signed in
function AccountButton() {
  const { ready, user } = useAuth();
  if (!ready) return <span className="size-[44px]" />;
  if (user) {
    return (
      <Link
        href="/account"
        aria-label={`Your account (${user.email})`}
        className="flex size-[44px] items-center justify-center rounded-full hover:ring-2 hover:ring-kajal"
      >
        <AvatarBadge fallback={(user.email ?? "?")[0].toUpperCase()} size={44} />
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
