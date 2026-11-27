// GET /api/admin/plus (with the sign-in token): numbers for the owner's dashboard (SwamiGPT HQ).
import { ownerOnly } from "@/lib/hq/route";
import { getPlus } from "@/lib/hq/plus";

export async function GET(request: Request) {
  return ownerOnly(request, getPlus);
}
