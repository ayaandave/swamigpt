"use client";

import { Analytics } from "@vercel/analytics/next";
import { skipCounting } from "@/lib/no-count";

// Visit counts without cookies. Only the page's path is sent, never what comes after "?", because
// links like /ask?ask=... carry someone's own question, and that stays on their phone.
// Our own devices are left out (see lib/no-count.ts), for page views and product events alike.
export function PrivateAnalytics() {
  return <Analytics beforeSend={(event) => (skipCounting(event.url) ? null : { ...event, url: event.url.split(/[?#]/)[0] })} />;
}
