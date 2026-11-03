"use client";

import { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { supabase, useAuth } from "./supabase";
import { PLUS } from "./plans";
import { isNativeApp } from "./native";

export { PLUS };

// Whether Plus can be bought here. Inside the iPhone app only through Apple's in-app purchase, and
// only in builds that include the purchases plugin (older builds load this same site, and stay
// fully free). The app never points to the website's checkout.
export const plusSold = () =>
  isNativeApp() ? Boolean(PLUS.iosKey) && Capacitor.isPluginAvailable("Purchases") : PLUS.enabled;

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
