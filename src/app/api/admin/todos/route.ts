// /api/admin/todos (owner only): the to-do list on SwamiGPT HQ.
// GET lists; POST { title, note? } adds; PATCH { id, done?, title?, note? } changes; DELETE ?id= removes.
import { serverDb } from "@/lib/hq/db";
import { bad, ownerOnly } from "@/lib/hq/route";
import { listTodos } from "@/lib/hq/todos";

const UUID = /^[0-9a-f-]{36}$/i;
const clean = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function GET(request: Request) {
  return ownerOnly(request, listTodos);
}

export async function POST(request: Request) {
  return ownerOnly(request, async () => {
    const b = ((await request.json().catch(() => null)) ?? {}) as Record<string, unknown>;
    const title = clean(b.title, 300);
    if (!title) return bad("Write what needs doing.");
    const sb = serverDb();
    if (!sb) return bad("Supabase keys aren't set.");
    const { error } = await sb.from("admin_todos").insert({ title, note: clean(b.note, 2000) || null });
    if (error) return bad("Couldn't add it.");
    return listTodos();
  });
}

export async function PATCH(request: Request) {
  return ownerOnly(request, async () => {
    const b = ((await request.json().catch(() => null)) ?? {}) as Record<string, unknown>;
    if (typeof b.id !== "string" || !UUID.test(b.id)) return bad("Which to-do?");
    const change: Record<string, unknown> = {};
    if (typeof b.done === "boolean") Object.assign(change, { done: b.done, done_at: b.done ? new Date().toISOString() : null });
    if (clean(b.title, 300)) change.title = clean(b.title, 300);
    if (typeof b.note === "string") change.note = clean(b.note, 2000) || null;
    const sb = serverDb();
    if (!sb) return bad("Supabase keys aren't set.");
    const { error } = await sb.from("admin_todos").update(change).eq("id", b.id);
    if (error) return bad("Couldn't change it.");
    return listTodos();
  });
}

export async function DELETE(request: Request) {
  return ownerOnly(request, async () => {
    const id = new URL(request.url).searchParams.get("id") ?? "";
    if (!UUID.test(id)) return bad("Which to-do?");
    const sb = serverDb();
    if (!sb) return bad("Supabase keys aren't set.");
    await sb.from("admin_todos").delete().eq("id", id);
    return listTodos();
  });
}
