"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { accessToken, supabase } from "@/lib/supabase";

// Delete the account and everything saved with it, after one clear second step
export function DeleteAccount() {
  const router = useRouter();
  const [asking, setAsking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<"plus" | "failed" | null>(null);

  const remove = async () => {
    setBusy(true);
    setProblem(null);
    const token = await accessToken();
    const res = await fetch("/api/account/delete", {
      method: "POST",
      headers: { authorization: `Bearer ${token}` },
    }).catch(() => null);
    if (res?.ok) {
      await supabase()?.auth.signOut({ scope: "local" });
      router.push("/");
      return;
    }
    setProblem(res?.status === 409 ? "plus" : "failed");
    setBusy(false);
  };

  if (!asking) {
    return (
      <button
        type="button"
        onClick={() => setAsking(true)}
        className="min-h-12 self-start rounded-full px-1 text-[0.95rem] font-semibold text-kajal-soft underline underline-offset-4 hover:text-kajal"
      >
        Delete my account
      </button>
    );
  }

  return (
    <section aria-label="Delete your account" className="rounded-[2rem] border-2 border-kesar-deep px-6 py-5">
      <p className="font-display text-[1.3rem] leading-snug">Delete your account?</p>
      <p className="mt-2 text-[1rem] leading-[1.6]">
        This deletes your sign-in, your conversations, your mala progress and your settings, for good. It can&apos;t be
        undone.
      </p>
      {problem === "plus" && (
        <p role="alert" className="mt-3 font-semibold text-kesar-deep">
          You still have Plus. Please{" "}
          <Link href="/plus" className="underline underline-offset-4">
            cancel it first
          </Link>
          , so you aren&apos;t charged again. Then you can delete your account.
        </p>
      )}
      {problem === "failed" && (
        <p role="alert" className="mt-3 font-semibold text-kesar-deep">
          That didn&apos;t work. Please try again in a moment.
        </p>
      )}
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={busy}
          onClick={() => void remove()}
          className="min-h-12 rounded-full bg-kesar-deep px-6 font-bold text-sandal hover:bg-kajal disabled:opacity-60"
        >
          {busy ? "Deleting…" : "Yes, delete everything"}
        </button>
        <button
          type="button"
          onClick={() => setAsking(false)}
          className="min-h-12 rounded-full border-2 border-sandal-edge px-6 font-semibold hover:border-kajal"
        >
          Keep my account
        </button>
      </div>
    </section>
  );
}
