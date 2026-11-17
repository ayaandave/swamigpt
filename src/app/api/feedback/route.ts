// POST /api/feedback: 👍/👎 under an answer. A 👍 keeps only the rating, the depth and which
// passages were quoted; a 👎 also keeps the question and the answer, so a person can see what went
// wrong (the database drops them for a 👍 too, in case a client sends them). Up to 30 a day per
// person (lib/limits.ts works out who).
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { whoIsAsking } from "@/lib/limits";

const Body = z.object({
  rating: z.union([z.literal(1), z.literal(-1)]),
  depth: z.enum(["simpler", "deeper"]).nullable().default(null),
  verseIds: z.array(z.string().max(120)).max(6).default([]),
  question: z.string().trim().max(2000).optional(),
  answer: z
    .object({
      paragraphs: z.array(z.string().max(4000)).max(20),
      verses: z.array(z.object({ id: z.string().max(120), meaning: z.string().max(1000) })).max(6),
      practice: z.string().max(200).nullable().default(null),
    })
    .optional(),
});

export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secret) return Response.json({ error: "unavailable" }, { status: 503 });

  // Only our own pages send feedback (browsers mark same-site requests themselves)
  const site = request.headers.get("sec-fetch-site");
  if (site && site !== "same-origin") return Response.json({ error: "forbidden" }, { status: 403 });

  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "bad_request" }, { status: 400 });
  const { rating, depth, verseIds, question, answer } = parsed.data;
  const down = rating === -1;

  const { who, uid } = await whoIsAsking(request);
  const sb = createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await sb.rpc("add_feedback", {
    p_who: who,
    p_uid: uid,
    p_rating: rating,
    p_depth: depth,
    p_verse_ids: verseIds,
    p_question: down ? (question ?? null) : null,
    p_answer: down ? (answer ?? null) : null,
  });
  if (error) {
    console.error("saving feedback failed", error.message);
    return Response.json({ error: "failed" }, { status: 502 });
  }
  if (data !== true) return Response.json({ error: "limit" }, { status: 429 });
  return Response.json({ ok: true });
}
