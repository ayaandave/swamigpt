// GET /api/admin/me (with the sign-in token): whether this account may see the owner pages (money,
// analytics), so the app can show their tabs. The same check as the data routes, without any numbers.
import { isAdminRequest } from "@/lib/admin-auth";

export async function GET(request: Request) {
  const admin = await isAdminRequest(request);
  return Response.json({ admin }, { headers: { "Cache-Control": "private, no-store" } });
}
