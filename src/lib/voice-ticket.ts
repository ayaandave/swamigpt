// Voice tickets: a signed note saying which account is listening, so voice limits follow the
// account (and its plan) even though an <audio> element can't send a sign-in token.
// The ticket holds only the account id and an expiry, never the sign-in token. Server only.
import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";

const TICKET_HOURS = 12;

function signingKey(): Buffer | null {
  const secret = process.env.SUPABASE_SECRET_KEY;
  return secret ? createHash("sha256").update(`voice-ticket:${secret}`).digest() : null;
}

const sign = (key: Buffer, body: string) => createHmac("sha256", key).update(body).digest("base64url");

export function makeTicket(userId: string): string | null {
  const key = signingKey();
  if (!key) return null;
  const body = `${userId}.${Math.floor(Date.now() / 1000) + TICKET_HOURS * 3600}`;
  return `${body}.${sign(key, body)}`;
}

// The account id in a valid, unexpired ticket, or null
export function readTicket(ticket: string | null): string | null {
  const key = signingKey();
  if (!key || !ticket) return null;
  const [userId, expires, signature] = ticket.split(".");
  if (!userId || !expires || !signature) return null;
  const expected = Buffer.from(sign(key, `${userId}.${expires}`));
  const given = Buffer.from(signature);
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  if (Number(expires) < Date.now() / 1000) return null;
  return userId;
}
