import { useCallback, useEffect, useRef, useState } from "react";
import { accessToken } from "@/lib/supabase";

// Loads one owner-only endpoint with the sign-in token. Each section loads its own, so a slow or
// broken service never holds up the rest of the dashboard.
export type Load<T> = { data: T | null; state: "loading" | "ok" | "denied" | "failed"; reload: () => Promise<void>; send: (method: string, body?: unknown, query?: string) => Promise<string | null> };

export async function ownerFetch(path: string, init: RequestInit = {}) {
  const token = await accessToken();
  if (!token) return null;
  return fetch(path, { ...init, headers: { ...init.headers, authorization: `Bearer ${token}`, "content-type": "application/json" } }).catch(() => null);
}

export function useOwner<T>(path: string, refreshMs = 5 * 60 * 1000): Load<T> {
  const [data, setData] = useState<T | null>(null);
  const [state, setState] = useState<Load<T>["state"]>("loading");
  const live = useRef(true);

  const reload = useCallback(async () => {
    const res = await ownerFetch(path);
    if (!live.current) return;
    if (!res) return setState((s) => (s === "ok" ? s : "failed"));
    if (res.status === 404) return setState("denied");
    if (!res.ok) return setState((s) => (s === "ok" ? s : "failed"));
    setData((await res.json()) as T);
    setState("ok");
  }, [path]);

  // Changes something (POST/PATCH/DELETE); the route answers with the fresh list. Returns an error message, or null
  const send = useCallback(
    async (method: string, body?: unknown, query = "") => {
      const res = await ownerFetch(path + query, { method, body: body === undefined ? undefined : JSON.stringify(body) });
      if (!res) return "Couldn't reach the server.";
      const json = (await res.json().catch(() => null)) as (T & { error?: string }) | null;
      if (!res.ok) return json?.error ?? "That didn't work.";
      if (json) setData(json);
      return null;
    },
    [path],
  );

  useEffect(() => {
    live.current = true;
    void reload(); // eslint-disable-line react-hooks/set-state-in-effect -- loading the owner's numbers
    const t = setInterval(() => void reload(), refreshMs);
    return () => {
      live.current = false;
      clearInterval(t);
    };
  }, [reload, refreshMs]);

  return { data, state, reload, send };
}
