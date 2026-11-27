// One wrapper for every HQ data route: owner only (everyone else gets a 404, as if the page didn't
// exist), never cached by a browser or the CDN.
import "server-only";
import { isAdminRequest } from "@/lib/admin-auth";

export async function ownerOnly(request: Request, run: () => Promise<unknown>): Promise<Response> {
  if (!(await isAdminRequest(request))) return new Response("not found", { status: 404 });
  const body = await run();
  if (body instanceof Response) return body;
  return Response.json(body, { headers: { "Cache-Control": "private, no-store" } });
}

export const bad = (why: string) => Response.json({ error: why }, { status: 400 });
