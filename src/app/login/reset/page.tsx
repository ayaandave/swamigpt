"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Om } from "@/components/Om";
import { supabase, useAuth } from "@/lib/supabase";

// Where the "reset your password" email lands. Supabase signs the person in from the link,
// then they choose a new password here.
export default function ResetPasswordPage() {
  const router = useRouter();
  const { ready, user } = useAuth();
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const sb = supabase();
    if (!sb || busy) return;
    setBusy(true);
    const { error } = await sb.auth.updateUser({ password });
    setBusy(false);
    if (error) setError("We couldn't save that password. Please try again.");
    else router.push("/");
  };

  return (
    <div className="mx-auto flex max-w-md flex-col items-center pt-8 text-center">
      <Om size={80} />
      <h1 className="mt-3 font-display text-[1.75rem] leading-tight">Choose a new password</h1>
      {!ready ? (
        <p className="mt-4 italic text-kajal-soft">One moment…</p>
      ) : !user ? (
        <p className="mt-4 max-w-[34ch] text-[1.1rem] text-kajal-soft">
          This link has expired or was already used. Go to Sign in and tap &ldquo;Forgot password?&rdquo; to get a new
          one.
        </p>
      ) : (
        <form onSubmit={submit} className="mt-8 flex w-full flex-col gap-4 text-left">
          <label className="flex flex-col gap-1.5">
            <span className="font-semibold">New password</span>
            <span className="flex items-center rounded-2xl border border-sandal-edge bg-sandal-deep focus-within:border-kesar-deep">
              <input
                type={show ? "text" : "password"}
                required
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="min-h-14 min-w-0 flex-1 bg-transparent px-4 text-[1.15rem] outline-none"
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="min-h-12 px-4 text-[0.95rem] font-semibold text-kajal-soft hover:text-kajal"
              >
                {show ? "Hide" : "Show"}
              </button>
            </span>
            <span className="text-[0.9rem] text-kajal-soft">At least 8 characters.</span>
          </label>
          {error && (
            <p role="alert" className="rounded-2xl bg-kumkum/10 px-4 py-3 font-semibold text-kumkum">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="mt-2 min-h-14 rounded-full bg-kesar text-[1.1rem] font-bold text-on-kesar hover:bg-kesar-deep hover:text-sandal disabled:opacity-60"
          >
            {busy ? "Saving…" : "Save new password"}
          </button>
        </form>
      )}
    </div>
  );
}
