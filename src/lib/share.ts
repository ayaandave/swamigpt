// Sharing one answer as its own page (/s/<id>). Only answers SwamiGPT really wrote can be shared:
// /api/ask seals each answer with a keyed signature, and /api/share refuses anything whose seal
// doesn't match, so nobody can put made-up words on a swamigpt.com page. The share id comes from the
// seal itself, so the link is known straight away (the share sheet opens without waiting) and the
// same answer always gets the same link.
import { createHmac, timingSafeEqual } from "node:crypto";

export type SharedAnswer = {
  question: string;
  paragraphs: string[];
  verses: { id: string; meaning: string }[];
  practice?: { href: string; title: string; why: string };
};

const key = () => `share-seal:${process.env.SUPABASE_SECRET_KEY ?? "dev"}`;

// The same fields in the same order every time, so the seal doesn't depend on how JSON was built
const canonical = (a: SharedAnswer) =>
  JSON.stringify([
    a.question,
    a.paragraphs,
    a.verses.map((v) => [v.id, v.meaning]),
    a.practice ? [a.practice.href, a.practice.title, a.practice.why] : null,
  ]);

export const sealAnswer = (a: SharedAnswer) => createHmac("sha256", key()).update(canonical(a)).digest("base64url");

export function validSeal(a: SharedAnswer, seal: string) {
  const want = Buffer.from(sealAnswer(a));
  const got = Buffer.from(seal);
  return got.length === want.length && timingSafeEqual(got, want);
}

// 12 characters of the seal: unguessable, and the same for the same answer
export const shareId = (seal: string) => seal.slice(0, 12);
export const SHARE_ID = /^[A-Za-z0-9_-]{12}$/;
