"use client";

import { useEffect } from "react";
import { startAccountSync } from "@/lib/account-sync";
import { setVoiceTicket } from "@/lib/speak";
import { accessToken, useAuth } from "@/lib/supabase";

// Tickets last 12 hours on the server; fetched again well before then
const TICKET_REFRESH_MS = 6 * 60 * 60 * 1000;

async function fetchVoiceTicket() {
  const token = await accessToken();
  if (!token) return setVoiceTicket(null);
  const res = await fetch("/api/speak/ticket", { method: "POST", headers: { authorization: `Bearer ${token}` } }).catch(
    () => null,
  );
  const { ticket } = ((await res?.json().catch(() => null)) ?? {}) as { ticket?: string | null };
  setVoiceTicket(ticket ?? null);
}

// Notes the visit for emails (and sends the welcome email the first time); once per page load
async function sayHello() {
  const token = await accessToken();
  if (token) await fetch("/api/email/hello", { method: "POST", headers: { authorization: `Bearer ${token}` } }).catch(() => null);
}

// Mounted once in the layout: while someone is signed in, syncs settings and mala progress, and
// keeps a voice ticket so read-aloud limits follow their account and plan, and notes the visit for emails
export function AccountSync() {
  const { user } = useAuth();
  const userId = user?.id;

  useEffect(() => {
    if (!userId) return;
    let stop: (() => void) | undefined;
    let cancelled = false;
    void startAccountSync(userId).then((s) => (cancelled ? s() : (stop = s)));
    return () => {
      cancelled = true;
      stop?.();
    };
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setVoiceTicket(null);
      return;
    }
    void fetchVoiceTicket();
    void sayHello();
    const t = window.setInterval(() => void fetchVoiceTicket(), TICKET_REFRESH_MS);
    return () => clearInterval(t);
  }, [userId]);

  return null;
}
