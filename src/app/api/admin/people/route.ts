// GET /api/admin/people (with the sign-in token): numbers for the owner's dashboard (SwamiGPT HQ).
import { ownerOnly } from "@/lib/hq/route";
import { getPeople } from "@/lib/hq/people";

export async function GET(request: Request) {
  return ownerOnly(request, getPeople);
}
