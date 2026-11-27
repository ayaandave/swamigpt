// GET /api/admin/money (with the sign-in token): the money dashboard's numbers. Only accounts
// listed in ADMIN_EMAILS get an answer; everyone else gets a 404, as if the page didn't exist.
import { isAdminRequest } from "@/lib/admin-auth";
import { getMoney } from "@/lib/money";

export async function GET(request: Request) {
  if (!(await isAdminRequest(request))) return new Response("not found", { status: 404 });
  return Response.json(await getMoney(), { headers: { "Cache-Control": "private, no-store" } });
}
