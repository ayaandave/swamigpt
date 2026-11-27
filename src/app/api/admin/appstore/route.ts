// GET /api/admin/appstore (with the sign-in token): numbers for the owner's dashboard (SwamiGPT HQ).
import { ownerOnly } from "@/lib/hq/route";
import { getAppStore } from "@/lib/hq/appstore";

export async function GET(request: Request) {
  return ownerOnly(request, getAppStore);
}
