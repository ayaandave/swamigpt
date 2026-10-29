// POST /api/share: saves one answer someone chose to share, so swamigpt.com/s/<id> can show it.
// Only answers sealed by /api/ask are accepted (see src/lib/share.ts). Sharing the same answer
// twice keeps the first copy and returns the same link.
import { z } from "zod";
import { adminDb } from "@/lib/email";
import { shareId, validSeal, type SharedAnswer } from "@/lib/share";

const Body = z.object({
  question: z.string().min(1).max(2000),
  paragraphs: z.array(z.string().max(4000)).min(1).max(12),
  verses: z.array(z.object({ id: z.string().max(120), meaning: z.string().max(2000) })).max(4),
  practice: z.object({ href: z.string().max(200), title: z.string().max(200), why: z.string().max(600) }).optional(),
  seal: z.string().max(100),
});

export async function POST(request: Request) {
  // Only our own pages share (browsers mark same-site requests themselves)
  const site = request.headers.get("sec-fetch-site");
  if (site && site !== "same-origin") return Response.json({ error: "forbidden" }, { status: 403 });

  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "bad_request" }, { status: 400 });
  const { seal, ...answer } = parsed.data;
  if (!validSeal(answer as SharedAnswer, seal)) return Response.json({ error: "not_ours" }, { status: 400 });

  const db = adminDb();
  if (!db) return Response.json({ error: "not_configured" }, { status: 503 });
  const id = shareId(seal);
  const { error } = await db
    .from("shared_answers")
    .upsert({ id, question: answer.question, answer }, { onConflict: "id", ignoreDuplicates: true });
  if (error) {
    console.error("share failed", error);
    return Response.json({ error: "failed" }, { status: 502 });
  }
  return Response.json({ id });
}
