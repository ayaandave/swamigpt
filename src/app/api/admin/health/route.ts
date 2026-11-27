// GET /api/admin/health (with the sign-in token): numbers for the owner's dashboard (SwamiGPT HQ).
import { ownerOnly } from "@/lib/hq/route";
import { getHealth } from "@/lib/hq/health";

export async function GET(request: Request) {
  return ownerOnly(request, getHealth);
}
