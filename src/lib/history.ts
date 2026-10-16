"use client";

// Chat history for signed-in people: each question and answer is saved as a turn in a conversation.
import type { SwamiAnswer } from "./swami";
import { supabase } from "./supabase";

export type Conversation = { id: string; title: string; updated_at: string };
export type SavedTurn = { id: string; question: string; answer: SwamiAnswer; created_at: string };

// Saves one turn; starts a conversation (titled by its first question) when there isn't one yet.
// Returns the conversation id to pass next time, or null if it couldn't be saved.
export async function saveTurn(
  userId: string,
  conversationId: string | null,
  question: string,
  answer: SwamiAnswer,
): Promise<string | null> {
  const sb = supabase();
  if (!sb) return null;
  let id = conversationId;
  if (!id) {
    const title = question.length > 80 ? question.slice(0, 77) + "…" : question;
    const { data, error } = await sb.from("conversations").insert({ user_id: userId, title }).select("id").single();
    if (error) return null;
    id = data.id as string;
  } else {
    await sb.from("conversations").update({ updated_at: new Date().toISOString() }).eq("id", id);
  }
  const { error } = await sb.from("turns").insert({ conversation_id: id, user_id: userId, question, answer });
  return error ? conversationId : id;
}

export async function listConversations(): Promise<Conversation[]> {
  const { data } = (await supabase()
    ?.from("conversations")
    .select("id, title, updated_at")
    .order("updated_at", { ascending: false })
    .limit(100)) ?? { data: null };
  return (data as Conversation[] | null) ?? [];
}

export async function loadConversation(id: string) {
  const sb = supabase();
  if (!sb) return null;
  const [{ data: convo }, { data: turns }] = await Promise.all([
    sb.from("conversations").select("id, title, updated_at").eq("id", id).maybeSingle<Conversation>(),
    sb.from("turns").select("id, question, answer, created_at").eq("conversation_id", id).order("created_at"),
  ]);
  return convo ? { conversation: convo, turns: (turns as SavedTurn[] | null) ?? [] } : null;
}

// True once it's really gone, so the list only drops it after the delete worked
export async function deleteConversation(id: string): Promise<boolean> {
  const sb = supabase();
  if (!sb) return false;
  const { error } = await sb.from("conversations").delete().eq("id", id);
  return !error;
}
