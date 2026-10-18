"use client";

import { useEffect, useState } from "react";
import { accessToken, useAuth } from "./supabase";

// True when the signed-in account may see the money page (the server decides; see /api/admin/me)
export function useIsAdmin() {
  const { user } = useAuth();
  const [admin, setAdmin] = useState(false);
  const userId = user?.id;
  useEffect(() => {
    let live = true;
    if (!userId) {
      setAdmin(false); // eslint-disable-line react-hooks/set-state-in-effect -- signed out: no tab
      return;
    }
    void (async () => {
      const token = await accessToken();
      if (!token) return;
      const res = await fetch("/api/admin/me", { headers: { authorization: `Bearer ${token}` } }).catch(() => null);
      const { admin: yes } = ((await res?.json().catch(() => null)) ?? {}) as { admin?: boolean };
      if (live) setAdmin(yes === true);
    })();
    return () => {
      live = false;
    };
  }, [userId]);
  return admin;
}
