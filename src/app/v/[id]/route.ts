// /v/<passage id>: a short link to a passage's page, used when sharing an answer
import { getPassageById, passageHref } from "@/lib/scripture/library";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const p = getPassageById((await params).id);
  return Response.redirect(new URL(p ? passageHref(p) : "/", request.url), 308);
}
