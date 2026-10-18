"use client";

import { useEffect, useState } from "react";
import { accessToken, useAuth } from "@/lib/supabase";

type Prefs = { weekly: boolean; nudges: boolean; child: boolean };

// Signed in only: the weekly verse email and the two-weeks-away note, on or off
export function EmailPrefs() {
  const { user } = useAuth();
  const userId = user?.id;
  const [prefs, setPrefs] = useState<Prefs | null>(null);
  const [problem, setProblem] = useState("");

  useEffect(() => {
    let live = true;
    if (!userId) return;
    void (async () => {
      const token = await accessToken();
      if (!token) return;
      const res = await fetch("/api/email/prefs", { headers: { authorization: `Bearer ${token}` } }).catch(() => null);
      const body = res?.ok ? ((await res.json().catch(() => null)) as Prefs | null) : null;
      if (live && body) setPrefs(body);
    })();
    return () => {
      live = false;
    };
  }, [userId]);

  if (!userId || !prefs) return null;

  const set = async (change: Partial<Pick<Prefs, "weekly" | "nudges">>) => {
    setProblem("");
    const before = prefs;
    setPrefs({ ...prefs, ...change });
    const token = await accessToken();
    const res = token
      ? await fetch("/api/email/prefs", {
          method: "POST",
          headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
          body: JSON.stringify(change),
        }).catch(() => null)
      : null;
    if (!res?.ok) {
      setPrefs(before);
      setProblem("Couldn't save that. Please try again.");
    }
  };

  const toggle = (label: string, note: string, on: boolean, change: (on: boolean) => Partial<Prefs>) => (
    <div className="mt-4 flex items-center justify-between gap-4">
      <div>
        <p className="text-[1.1rem] font-semibold">{label}</p>
        <p className="text-[0.95rem] text-kajal-soft">{note}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={label}
        onClick={() => void set(change(!on))}
        className={`min-h-12 shrink-0 rounded-full px-6 font-semibold ${on ? "bg-tulsi text-sandal" : "border-2 border-kajal"}`}
      >
        {on ? "On" : "Off"}
      </button>
    </div>
  );

  return (
    <section className="mt-12">
      <h2 className="font-display text-[1.6rem]">Emails</h2>
      {prefs.child ? (
        <p className="mt-1 text-[1rem] text-kajal-soft">Accounts for children under 13 don&apos;t get emails beyond the welcome.</p>
      ) : (
        <>
          {toggle("Weekly verse", "One verse and a small practice, every Sunday morning.", prefs.weekly, (on) => ({ weekly: on }))}
          {toggle("Reminder after time away", "One gentle note with a verse if you haven't visited in two weeks.", prefs.nudges, (on) => ({ nudges: on }))}
        </>
      )}
      {problem && <p className="mt-3 text-[1rem] text-kumkum">{problem}</p>}
    </section>
  );
}
