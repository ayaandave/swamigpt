// GET /api/admin/analytics?days=30 (with the sign-in token): visitor numbers for the owner's
// analytics page. Everyone else gets a 404, as if the page didn't exist.
import { isAdminRequest } from "@/lib/admin-auth";
import { getVisits } from "@/lib/visits";

export async function GET(request: Request) {
  if (!(await isAdminRequest(request))) return new Response("not found", { status: 404 });
  const days = Number(new URL(request.url).searchParams.get("days")) === 7 ? 7 : 30;
  return Response.json(await getVisits(days), { headers: { "Cache-Control": "private, no-store" } });
}
