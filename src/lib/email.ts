// Emails SwamiGPT sends: a welcome when someone joins, an opt-in weekly verse, and one gentle note
// after two weeks away. Sent through Resend (RESEND_API_KEY, added by the Vercel integration) from
// hello@swamigpt.com; replies go to EMAIL_REPLY_TO. Every email but the welcome carries a one-click
// unsubscribe. Server only.
import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { dailyEntries, type Daily } from "./daily";
import { dailyIndex } from "./daily-verses";
import { whoSays } from "./scripture/who";

export const SITE = "https://www.swamigpt.com";
const FROM = "SwamiGPT <hello@swamigpt.com>";
const REPLY_TO = process.env.EMAIL_REPLY_TO ?? "adave0601@gmail.com";

export function adminDb(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secret) return null;
  return createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });
}

// ---------- Unsubscribe links: a keyed code of the account id, so links can't be guessed ----------
const unsubKey = () => `email-unsubscribe:${process.env.SUPABASE_SECRET_KEY ?? ""}`;
export const unsubToken = (userId: string) => createHmac("sha256", unsubKey()).update(userId).digest("base64url");
export function validUnsubToken(userId: string, token: string) {
  const want = Buffer.from(unsubToken(userId));
  const got = Buffer.from(token);
  return want.length === got.length && timingSafeEqual(want, got);
}
export const unsubUrl = (userId: string) => `${SITE}/api/email/unsubscribe?u=${userId}&t=${unsubToken(userId)}`;

// ---------- Today's verse, by the date in California (where the emails are timed) ----------
export function todaysVerse(now = new Date()): Daily {
  const [y, m, d] = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Los_Angeles" }).format(now).split("-").map(Number);
  return dailyEntries()[dailyIndex(new Date(y, m - 1, d))];
}

// ---------- Layout ----------
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const para = (s: string) => `<p style="margin:0 0 16px;font-size:17px;line-height:1.55;color:#2b1b10">${s}</p>`;
const button = (href: string, label: string) =>
  `<p style="margin:24px 0"><a href="${href}" style="display:inline-block;background:#d9741a;color:#ffffff;text-decoration:none;font-weight:700;font-size:17px;padding:14px 26px;border-radius:999px">${esc(label)}</a></p>`;

function verseBlock(d: Daily) {
  const plain = d.verse.plain ? `<p style="margin:14px 0 0;font-size:16px;line-height:1.5;color:#5a4330"><b>In plain words:</b> ${esc(d.verse.plain)}</p>` : "";
  return `<div style="margin:8px 0 24px;padding:20px 22px;background:#fbf3e2;border:1px solid #d6ba86;border-radius:16px">
  <p style="margin:0 0 8px;font-size:14px;font-weight:700;color:#9a4a0b">${esc(whoSays(d.verse))}:</p>
  <p style="margin:0;font-family:Georgia,serif;font-size:19px;line-height:1.5;font-style:italic;color:#2b1b10">“${esc(d.verse.translation.trim())}”</p>${plain}
  <p style="margin:12px 0 0;font-size:14px"><a href="${SITE}${d.href}" style="color:#9a4a0b">Read it in context</a></p></div>`;
}

function page(body: string, footer: string) {
  return `<!doctype html><html><body style="margin:0;padding:0;background:#f2e3c6">
<div style="max-width:560px;margin:0 auto;padding:32px 22px;font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif">
  <p style="margin:0 0 24px;font-size:22px;font-family:Georgia,serif;color:#2b1b10">🪔 SwamiGPT</p>
  ${body}
  <p style="margin:32px 0 0;padding-top:16px;border-top:1px solid #d6ba86;font-size:13px;line-height:1.5;color:#5a4330">${footer}</p>
</div></body></html>`;
}
const aiNote = "SwamiGPT is an AI guide to Hindu wisdom, not a guru. Every verse it quotes is real and linked to its source.";

export type Email = { subject: string; html: string; text: string };

export function welcomeEmail(d: Daily): Email {
  const html = page(
    para("Namaste, and welcome.") +
      para("SwamiGPT answers life's questions from real Hindu scripture: the Bhagavad Gita, the Upanishads, the Ramayana and more, in plain words.") +
      para("Here is today's verse:") +
      verseBlock(d) +
      para(esc(d.reflection)) +
      para("<b>Three things to try:</b><br>1. <a href=\"" + SITE + "/ask\" style=\"color:#9a4a0b\">Ask a question</a>, anything that's on your mind.<br>2. <a href=\"" + SITE + "/learn\" style=\"color:#9a4a0b\">Take a 5-minute lesson</a> and earn your first mala bead.<br>3. <a href=\"" + SITE + "/meditate/three-minute-reset\" style=\"color:#9a4a0b\">Try the 3-minute reset</a>, a short guided breath.") +
      button(`${SITE}/ask`, "Ask your first question") +
      para("Want a verse in your inbox every Sunday? Turn on <b>Weekly verse</b> in <a href=\"" + SITE + "/settings\" style=\"color:#9a4a0b\">Settings</a>.") +
      para("With warmth,<br>SwamiGPT"),
    `${aiNote} You can reply to this email anytime.`,
  );
  const text = `Namaste, and welcome.

SwamiGPT answers life's questions from real Hindu scripture: the Bhagavad Gita, the Upanishads, the Ramayana and more, in plain words.

Today's verse. ${whoSays(d.verse)}: "${d.verse.translation.trim()}"
${d.verse.plain ? `In plain words: ${d.verse.plain}\n` : ""}
${d.reflection}

Three things to try:
1. Ask a question: ${SITE}/ask
2. Take a 5-minute lesson: ${SITE}/learn
3. Try the 3-minute reset: ${SITE}/meditate/three-minute-reset

Want a verse every Sunday? Turn on Weekly verse in Settings: ${SITE}/settings

With warmth,
SwamiGPT

${aiNote}`;
  return { subject: "Welcome to SwamiGPT 🪔", html, text };
}

export function weeklyEmail(d: Daily, userId: string): Email {
  const unsub = unsubUrl(userId);
  const html = page(
    para("Here is your verse for the week.") +
      verseBlock(d) +
      para(esc(d.reflection)) +
      para(`<b>A question to carry this week:</b> ${esc(d.question)}`) +
      button(`${SITE}${d.practice.href}`, `${d.practice.kind}: ${d.practice.title}`) +
      para("Have a peaceful week,<br>SwamiGPT"),
    `${aiNote} You're getting this because you turned on the weekly verse. <a href="${unsub}" style="color:#9a4a0b">Unsubscribe</a> anytime.`,
  );
  const text = `Your verse for the week. ${whoSays(d.verse)}: "${d.verse.translation.trim()}"
${d.verse.plain ? `In plain words: ${d.verse.plain}\n` : ""}
${d.reflection}

A question to carry this week: ${d.question}

${d.practice.kind}: ${d.practice.title}: ${SITE}${d.practice.href}

Have a peaceful week,
SwamiGPT

Unsubscribe: ${unsub}`;
  return { subject: "Your verse for the week 🪔", html, text };
}

export function missYouEmail(d: Daily, userId: string): Email {
  const unsub = unsubUrl(userId);
  const html = page(
    para("It's been a little while. No pressure at all. Here is a verse for today, in case it helps.") +
      verseBlock(d) +
      para(esc(d.reflection)) +
      para("Whenever you're ready, your questions are welcome.") +
      button(`${SITE}/ask`, "Ask a question") +
      para("With warmth,<br>SwamiGPT"),
    `${aiNote} We only send this note once. <a href="${unsub}" style="color:#9a4a0b">Unsubscribe</a> from all SwamiGPT emails.`,
  );
  const text = `It's been a little while. No pressure at all. Here is a verse for today, in case it helps.

${whoSays(d.verse)}: "${d.verse.translation.trim()}"
${d.verse.plain ? `In plain words: ${d.verse.plain}\n` : ""}
${d.reflection}

Whenever you're ready, your questions are welcome: ${SITE}/ask

With warmth,
SwamiGPT

Unsubscribe: ${unsub}`;
  return { subject: "A verse for you 🙏", html, text };
}

// ---------- Sending ----------
export async function sendEmail(to: string, email: Email, unsubscribeFor?: string): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;
  const headers: Record<string, string> = {};
  if (unsubscribeFor) {
    // Lets mail apps show their own "Unsubscribe" button, which works in one click
    headers["List-Unsubscribe"] = `<${unsubUrl(unsubscribeFor)}>`;
    headers["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click";
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify({ from: FROM, to: [to], reply_to: REPLY_TO, subject: email.subject, html: email.html, text: email.text, headers }),
  }).catch(() => null);
  if (!res?.ok) console.error("email send failed", res?.status, await res?.text().catch(() => ""));
  return Boolean(res?.ok);
}

// The account's email, and whether it belongs to a child (under-13 accounts only get the welcome)
export async function recipient(db: SupabaseClient, userId: string) {
  const [{ data: user }, { data: profile }] = await Promise.all([
    db.auth.admin.getUserById(userId),
    db.from("profiles").select("age_group").eq("id", userId).maybeSingle<{ age_group: string | null }>(),
  ]);
  const email = user.user?.email_confirmed_at ? user.user.email ?? null : null;
  return { email, child: profile?.age_group === "under13" };
}
