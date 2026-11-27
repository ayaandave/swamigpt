// The server's Supabase client for SwamiGPT HQ (the owner dashboard). Server only: it uses the
// secret key, which never reaches a browser.
import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export function serverDb(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secret) return null;
  client ??= createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });
  return client;
}

export const isoDay = (d: Date) => d.toISOString().slice(0, 10);

// The last `days` calendar days in UTC, oldest first, ending today
export function lastDays(days: number): string[] {
  const now = new Date();
  return Array.from({ length: days }, (_, i) =>
    isoDay(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - (days - 1 - i)))),
  );
}

// A tiny per-server cache, so opening the dashboard often doesn't hammer outside services
export function cached<T>(ms: number, load: () => Promise<T>): () => Promise<T> {
  let hit: { at: number; value: T } | null = null;
  return async () => {
    if (hit && Date.now() - hit.at < ms) return hit.value;
    const value = await load();
    hit = { at: Date.now(), value };
    return value;
  };
}
