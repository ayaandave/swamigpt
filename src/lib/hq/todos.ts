// The owner's SwamiGPT to-do list on HQ. Server only.
import "server-only";
import { serverDb } from "./db";

export type Todo = { id: string; title: string; note: string | null; done: boolean; created_at: string; done_at: string | null };

export async function listTodos(): Promise<{ ok: true; todos: Todo[] } | { ok: false; problem: string }> {
  const sb = serverDb();
  if (!sb) return { ok: false, problem: "Supabase keys aren't set." };
  const { data, error } = await sb.from("admin_todos").select("*").order("done").order("created_at").limit(300);
  if (error) return { ok: false, problem: "Couldn't read the to-do list (has the hq_dashboard migration run?)." };
  return { ok: true, todos: data as Todo[] };
}
