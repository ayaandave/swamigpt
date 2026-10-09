"use client";

import { useEffect } from "react";
import { startAccountSync } from "@/lib/account-sync";
import { useAuth } from "@/lib/supabase";

// Mounted once in the layout: syncs settings and mala progress while someone is signed in
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

  return null;
}
