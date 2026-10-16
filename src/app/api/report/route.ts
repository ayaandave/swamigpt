// POST /api/report: "Report this answer". Saves the question, the answer as shown and the reason,
// so a person can check it. Up to 10 reports a day per person (lib/limits.ts works out who).
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { whoIsAsking } from "@/lib/limits";

const Body = z.object({
  reason: z.enum(["wrong", "unsafe", "disrespectful", "other"]),
  note: z.string().max(500).default(""),
  question: z.string().trim().min(1).max(2000),
  depth: z.enum(["simpler", "deeper"]).nullable().default(null),
  answer: z.object({
    paragraphs: z.array(z.string().max(4000)).max(20),
    verses: z.array(z.object({ id: z.string().max(120), meaning: z.string().max(1000) })).max(6),
    practice: z.string().max(200).nullable().default(null),
  }),
});

export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secret) return Response.json({ error: "unavailable" }, { status: 503 });

  // Only our own pages send reports (browsers mark same-site requests themselves)
  const site = request.headers.get("sec-fetch-site");
  if (site && site !== "same-origin") return Response.json({ error: "forbidden" }, { status: 403 });

  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "bad_request" }, { status: 400 });
  const { reason, note, question, depth, answer } = parsed.data;

  const { who, uid } = await whoIsAsking(request);
  const sb = createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await sb.rpc("add_report", {
    p_who: who,
    p_uid: uid,
    p_reason: reason,
    p_note: note,
    p_question: question,
    p_answer: answer,
    p_depth: depth,
  });
  if (error) {
    console.error("saving report failed", error.message);
    return Response.json({ error: "failed" }, { status: 502 });
  }
  if (data !== true) return Response.json({ error: "limit" }, { status: 429 });
  return Response.json({ ok: true });
}
