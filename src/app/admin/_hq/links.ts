// Every outside service SwamiGPT uses, for the Launchpad and the ⌘K quick-open box.
// Edit this list when a service is added or a link moves.
export type Service = {
  id: string;
  name: string;
  what: string; // what it does for SwamiGPT, in a few words
  href: string;
  mark: string; // one or two letters on the tile
  color: string;
  group: "App" | "AI & voice" | "Money" | "App Store" | "Marketing";
  quick?: { label: string; href: string }[];
  note?: string;
};

export const SERVICES: Service[] = [
  {
    id: "site",
    name: "swamigpt.com",
    what: "The live website",
    href: "https://www.swamigpt.com",
    mark: "ॐ",
    color: "#e3b341",
    group: "App",
    quick: [
      { label: "Ask", href: "https://www.swamigpt.com/ask" },
      { label: "Learn", href: "https://www.swamigpt.com/learn" },
    ],
  },
  {
    id: "vercel",
    name: "Vercel",
    what: "Hosting and deploys",
    href: "https://vercel.com/desihiphop/swamigpt",
    mark: "▲",
    color: "#ffffff",
    group: "App",
    quick: [
      { label: "Deployments", href: "https://vercel.com/desihiphop/swamigpt/deployments" },
      { label: "Env vars", href: "https://vercel.com/desihiphop/swamigpt/settings/environment-variables" },
      { label: "Logs", href: "https://vercel.com/desihiphop/swamigpt/logs" },
    ],
  },
  {
    id: "supabase",
    name: "Supabase",
    what: "Accounts, history, limits",
    href: "https://supabase.com/dashboard/project/itcwkjkjlitmjugtisle",
    mark: "S",
    color: "#3ecf8e",
    group: "App",
    quick: [
      { label: "Users", href: "https://supabase.com/dashboard/project/itcwkjkjlitmjugtisle/auth/users" },
      { label: "Tables", href: "https://supabase.com/dashboard/project/itcwkjkjlitmjugtisle/editor" },
      { label: "Storage", href: "https://supabase.com/dashboard/project/itcwkjkjlitmjugtisle/storage/buckets" },
    ],
  },
  {
    id: "github",
    name: "GitHub",
    what: "The code",
    href: "https://github.com/ayaandave/swamigpt",
    mark: "GH",
    color: "#a5b4fc",
    group: "App",
    quick: [
      { label: "Branches", href: "https://github.com/ayaandave/swamigpt/branches" },
      { label: "Pull requests", href: "https://github.com/ayaandave/swamigpt/pulls" },
    ],
  },
  {
    id: "claude",
    name: "Claude Platform",
    what: "Answers (Anthropic API)",
    href: "https://platform.claude.com",
    mark: "C",
    color: "#d97757",
    group: "AI & voice",
    quick: [
      { label: "Usage", href: "https://platform.claude.com/usage" },
      { label: "Cost", href: "https://platform.claude.com/cost" },
      { label: "API keys", href: "https://platform.claude.com/settings/keys" },
    ],
  },
  {
    id: "elevenlabs",
    name: "ElevenLabs",
    what: "Read-aloud voices",
    href: "https://elevenlabs.io/app/home",
    mark: "11",
    color: "#c7c2ff",
    group: "AI & voice",
    quick: [
      { label: "Subscription", href: "https://elevenlabs.io/app/subscription" },
    ],
  },
  {
    id: "revenuecat",
    name: "RevenueCat",
    what: "Plus subscriptions",
    href: "https://app.revenuecat.com/projects/154211bf",
    mark: "RC",
    color: "#f25a5a",
    group: "Money",
  },
  {
    id: "stripe",
    name: "Stripe",
    what: "Web payments for Plus",
    href: "https://dashboard.stripe.com",
    mark: "$",
    color: "#8f86ff",
    group: "Money",
    quick: [{ label: "Payments", href: "https://dashboard.stripe.com/payments" }],
  },
  {
    id: "asc",
    name: "App Store Connect",
    what: "The iPhone app's listing",
    href: "https://appstoreconnect.apple.com/apps/6829579517",
    mark: "A",
    color: "#4aa8ff",
    group: "App Store",
    note: "Dad's account (needs his 2-step code)",
    quick: [
      { label: "Analytics", href: "https://appstoreconnect.apple.com/analytics" },
      { label: "Sales", href: "https://appstoreconnect.apple.com/trends" },
    ],
  },
  {
    id: "appstore",
    name: "App Store page",
    what: "What people see",
    href: "https://apps.apple.com/us/app/swamigpt/id6829579517",
    mark: "★",
    color: "#7cc7ff",
    group: "App Store",
  },
  {
    id: "appledev",
    name: "Apple Developer",
    what: "Membership and keys",
    href: "https://developer.apple.com/account",
    mark: "Dev",
    color: "#d4d4d8",
    group: "App Store",
    note: "Dad's account (needs his 2-step code)",
  },
  {
    id: "metricool",
    name: "Metricool",
    what: "Schedules TikTok posts",
    href: "https://app.metricool.com",
    mark: "M",
    color: "#ffb547",
    group: "Marketing",
  },
  {
    id: "tiktok",
    name: "TikTok",
    what: "@swamigpt",
    href: "https://www.tiktok.com/@swamigpt",
    mark: "♪",
    color: "#ff4f8b",
    group: "Marketing",
  },
];

export const GROUPS: Service["group"][] = ["App", "AI & voice", "Money", "App Store", "Marketing"];
