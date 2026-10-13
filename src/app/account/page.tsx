"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Diya } from "@/components/Diya";
import { PLUS, usePlus } from "@/lib/plus";
import { supabase, useAuth } from "@/lib/supabase";

export default function AccountPage() {
  const router = useRouter();
  const { ready, user } = useAuth();
  const { plus } = usePlus();

  if (!ready) return <div className="min-h-[60vh]" />;

  if (!user) {
    return (
      <div className="flex flex-col items-center pt-12 text-center">
        <Diya size={96} />
        <h1 className="mt-4 font-display text-[2.2rem]">You&apos;re not signed in</h1>
        <Link
          href="/login"
          className="mt-6 flex min-h-14 items-center rounded-full bg-kesar px-8 text-[1.05rem] font-bold text-kajal hover:bg-kesar-deep hover:text-sandal"
        >
          Sign in
        </Link>
      </div>
    );
  }

  const signOut = async () => {
    await supabase()?.auth.signOut();
    router.push("/");
  };

  const since = new Date(user.created_at).toLocaleDateString(undefined, { month: "long", year: "numeric" });

  return (
    <div className="pt-10">
      <h1 className="font-display text-[2.4rem] leading-tight">Your account</h1>
      <div className="mt-6 rounded-[2rem] bg-sandal-deep px-7 py-6">
        <p className="text-[0.9rem] font-semibold text-kajal-soft">Signed in as</p>
        <p className="mt-1 break-all font-display text-[1.4rem]">{user.email}</p>
        <p className="mt-2 text-[0.95rem] text-kajal-soft">With SwamiGPT since {since}</p>
      </div>

      <div className="mt-8 flex flex-col gap-3">
        {PLUS.enabled && (
          <Link
            href="/plus"
            className="flex min-h-16 items-center justify-between rounded-2xl border-2 border-sandal-edge px-5 font-semibold hover:border-kajal"
          >
            <span>
              SwamiGPT Plus
              <span className="block text-[0.9rem] font-normal text-kajal-soft">
                {plus ? "You have Plus. Manage your plan" : `Up to ${PLUS.questions.plus} questions a day, read aloud`}
              </span>
            </span>
            <span aria-hidden="true">→</span>
          </Link>
        )}
        <Link
          href="/account/history"
          className="flex min-h-16 items-center justify-between rounded-2xl border-2 border-sandal-edge px-5 font-semibold hover:border-kajal"
        >
          Your conversations <span aria-hidden="true">→</span>
        </Link>
        <Link
          href="/settings"
          className="flex min-h-16 items-center justify-between rounded-2xl border-2 border-sandal-edge px-5 font-semibold hover:border-kajal"
        >
          Voice &amp; settings <span aria-hidden="true">→</span>
        </Link>
        <button
          type="button"
          onClick={signOut}
          className="min-h-14 rounded-full border-2 border-kajal px-7 text-[1.05rem] font-semibold hover:bg-kajal hover:text-sandal"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
