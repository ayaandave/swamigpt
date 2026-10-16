"use client";

import { Analytics } from "@vercel/analytics/next";

// Visit counts without cookies. Only the page's path is sent, never what comes after "?", because
// links like /ask?ask=... carry someone's own question, and that stays on their phone.
export function PrivateAnalytics() {
  return <Analytics beforeSend={(event) => ({ ...event, url: event.url.split(/[?#]/)[0] })} />;
}
