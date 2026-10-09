"use client";

import { createClient, type Session, type SupabaseClient } from "@supabase/supabase-js";
import { useSyncExternalStore } from "react";

// Accounts are optional: until the Supabase keys are in .env.local the app runs signed-out only.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const accountsEnabled = Boolean(url && key);

// Which one-tap providers are switched on in the Supabase dashboard
export const googleEnabled = process.env.NEXT_PUBLIC_AUTH_GOOGLE === "1";
export const appleEnabled = process.env.NEXT_PUBLIC_AUTH_APPLE === "1";

let client: SupabaseClient | null = null;
export function supabase(): SupabaseClient | null {
  if (!accountsEnabled || typeof window === "undefined") return null;
  // Sessions live in the browser (and later the iPhone app); the server is told who's asking
  // by the access token, never by cookies
  client ??= createClient(url!, key!, { auth: { persistSession: true, autoRefreshToken: true } });
  return client;
}

// ---- The signed-in session as a store, so any component can read it ----
type AuthState = { ready: boolean; session: Session | null };
let state: AuthState = { ready: !accountsEnabled, session: null };
const listeners = new Set<() => void>();
let started = false;

function start() {
  const sb = supabase();
  if (started || !sb) return;
  started = true;
  sb.auth.onAuthStateChange((_event, session) => {
    state = { ready: true, session };
    listeners.forEach((l) => l());
  });
}

const subscribe = (l: () => void) => {
  start();
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};
const SERVER: AuthState = { ready: false, session: null };

export function useAuth() {
  const { ready, session } = useSyncExternalStore(subscribe, () => state, () => SERVER);
  return { ready, session, user: session?.user ?? null };
}

// For API calls that should know who's asking (daily limits, saved history)
export async function accessToken(): Promise<string | null> {
  const sb = supabase();
  if (!sb) return null;
  const { data } = await sb.auth.getSession();
  return data.session?.access_token ?? null;
}
