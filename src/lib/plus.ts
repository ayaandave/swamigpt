"use client";

import { useEffect, useState } from "react";
import { supabase, useAuth } from "./supabase";
import { PLUS } from "./plans";
import { isNativeApp } from "./native";

export { PLUS };

// Whether Plus can be bought here. Never inside the iPhone app: Apple only allows its own in-app
// purchase there, so the app stays fully free and never points to the website's checkout.
export const plusSold = () => PLUS.enabled && !isNativeApp();

// Whether the signed-in person has Plus, read from their own row (null while checking)
export function usePlus() {
  const { user } = useAuth();
  const [plus, setPlus] = useState<boolean | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const sb = supabase();
    if (!user || !sb) return;
    let live = true;
    void sb
      .from("plus_members")
      .select("expires_at")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (live) setPlus(Boolean(data) && (data!.expires_at === null || new Date(data!.expires_at) > new Date()));
      });
    return () => {
      live = false;
    };
  }, [user, version]);

  return { plus: user ? plus : false, recheck: () => setVersion((v) => v + 1) };
}
