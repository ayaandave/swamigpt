"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Diya } from "@/components/Diya";
import { useSettings } from "@/lib/settings";
import { accountsEnabled, appleEnabled, googleEnabled, supabase } from "@/lib/supabase";
import { isNativeApp } from "@/lib/native";
import { nativeApple, nativeOAuth } from "@/lib/native-auth";

type Mode = "signin" | "signup" | "forgot";

const TITLES: Record<Mode, string> = {
  signin: "Welcome back",
  signup: "Create your account",
  forgot: "Reset your password",
};

// Supabase's messages, in plain words
function friendly(message: string) {
  if (/invalid login/i.test(message)) return "That email and password don't match. Please try again.";
  if (/not confirmed/i.test(message)) return "Please confirm your email first. Look for our email and tap the link.";
  if (/already registered|already been registered/i.test(message))
    return "There's already an account with this email. Try signing in instead.";
  if (/rate limit|too many/i.test(message)) return "Too many tries. Please wait a minute and try again.";
  if (/provider is not enabled/i.test(message)) return "That sign-in option isn't ready yet. Please use email for now.";
  return "Something went wrong. Please try again.";
}

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState<"" | "confirm" | "reset">("");
  // A sign-in that failed in the iPhone app comes back here as ?error=...
  useEffect(() => {
    const failed = new URLSearchParams(window.location.search).get("error");
    if (failed) setError(friendly(failed)); // eslint-disable-line react-hooks/set-state-in-effect -- read once from the address
  }, []);
  // Children under 13 need a parent to make the account (US children's privacy law)
  const { ageGroup } = useSettings();
  const [parent, setParent] = useState(false);

  if (!accountsEnabled) {
    return (
      <div className="flex flex-col items-center pt-12 text-center">
        <Diya size={96} />
        <h1 className="mt-4 font-display text-[2.2rem]">Accounts are coming soon</h1>
        <p className="mt-2 max-w-[34ch] text-[1.1rem] text-kajal-soft">
          You can keep using SwamiGPT without one. Your progress is saved on this device.
        </p>
      </div>
    );
  }

  if (ageGroup === "under13" && !parent) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center pt-12 text-center">
        <Diya size={96} />
        <h1 className="mt-4 font-display text-[2.2rem] leading-tight">Ask a grown-up</h1>
        <p className="mt-3 max-w-[32ch] text-[1.15rem] leading-relaxed text-kajal-soft">
          A parent or guardian needs to sign in or make the account for you. You can keep using SwamiGPT without one.
        </p>
        <button
          type="button"
          onClick={() => setParent(true)}
          className="mt-8 min-h-14 rounded-full bg-kesar px-8 text-[1.05rem] font-bold text-kajal hover:bg-kesar-deep hover:text-sandal"
        >
          I&apos;m a parent or guardian
        </button>
        <Link href="/" className="mt-5 min-h-11 font-semibold text-kesar-deep underline underline-offset-4">
          Keep going without an account
        </Link>
      </div>
    );
  }

  const switchTo = (m: Mode) => {
    setMode(m);
    setError("");
    setSent("");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const sb = supabase();
    if (!sb || busy) return;
    setBusy(true);
    setError("");
    const origin = window.location.origin;
    if (mode === "signin") {
      const { error } = await sb.auth.signInWithPassword({ email, password });
      if (error) setError(friendly(error.message));
      else router.push("/");
    } else if (mode === "signup") {
      const { data, error } = await sb.auth.signUp({ email, password, options: { emailRedirectTo: origin } });
      if (error) setError(friendly(error.message));
      else if (data.session) router.push("/");
      else setSent("confirm"); // email confirmation is on: they tap the link in their email
    } else {
      const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: `${origin}/login/reset` });
      if (error) setError(friendly(error.message));
      else setSent("reset");
    }
    setBusy(false);
  };

  const oauth = async (provider: "google" | "apple") => {
    // In the iPhone app: Apple's own sheet, or Google in Safari's sheet (Google won't sign in
    // inside an app's web view). The Google sign-in finishes in NativeBridge when the app reopens.
    if (isNativeApp()) {
      setError("");
      const problem = provider === "apple" ? await nativeApple() : await nativeOAuth("google");
      if (problem) setError(friendly(problem));
      else if (provider === "apple") router.push("/");
      return;
    }
    const { error } = (await supabase()?.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin },
    })) ?? { error: null };
    if (error) setError(friendly(error.message));
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center pt-12 text-center">
        <Diya size={96} />
        <h1 className="mt-4 font-display text-[2.2rem]">Check your email</h1>
        <p className="mt-2 max-w-[34ch] text-[1.15rem] leading-relaxed text-kajal-soft">
          {sent === "confirm"
            ? `We sent a link to ${email}. Tap it to finish creating your account.`
            : `We sent a link to ${email}. Tap it to choose a new password.`}
        </p>
        <button
          type="button"
          onClick={() => switchTo("signin")}
          className="mt-8 min-h-14 rounded-full border-2 border-kajal px-7 text-[1.05rem] font-semibold hover:bg-kajal hover:text-sandal"
        >
          Back to sign in
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-md flex-col items-center pt-8 text-center">
      <Diya size={80} />
      <h1 className="mt-3 font-display text-[2.2rem] leading-tight">{TITLES[mode]}</h1>
      <p className="mt-2 max-w-[32ch] text-[1.05rem] text-kajal-soft">
        {mode === "forgot"
          ? "Enter your email and we'll send you a link to choose a new password."
          : "Save your questions and your mala, on every device."}
      </p>

      {mode !== "forgot" && (googleEnabled || appleEnabled) && (
        <div className="mt-8 flex w-full flex-col gap-3">
          {appleEnabled && (
            <button
              type="button"
              onClick={() => oauth("apple")}
              className="flex min-h-14 items-center justify-center gap-3 rounded-full bg-kajal text-[1.05rem] font-semibold text-sandal hover:bg-kajal-soft"
            >
              <AppleLogo /> Continue with Apple
            </button>
          )}
          {googleEnabled && (
            <button
              type="button"
              onClick={() => oauth("google")}
              className="flex min-h-14 items-center justify-center gap-3 rounded-full border-2 border-kajal bg-[#fbf3e2] text-[1.05rem] font-semibold hover:bg-sandal-deep"
            >
              <GoogleLogo /> Continue with Google
            </button>
          )}
          <p className="mt-2 flex items-center gap-3 text-[0.9rem] text-kajal-soft before:h-px before:flex-1 before:bg-sandal-edge after:h-px after:flex-1 after:bg-sandal-edge">
            or with email
          </p>
        </div>
      )}

      <form onSubmit={submit} className={`flex w-full flex-col gap-4 text-left ${googleEnabled || appleEnabled ? "mt-3" : "mt-8"}`}>
        <label className="flex flex-col gap-1.5">
          <span className="font-semibold">Email</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="min-h-14 rounded-2xl border-2 border-sandal-edge bg-[#fbf3e2] px-4 text-[1.15rem] outline-none focus:border-kesar-deep"
          />
        </label>
        {mode !== "forgot" && (
          <label className="flex flex-col gap-1.5">
            <span className="flex items-baseline justify-between">
              <span className="font-semibold">Password</span>
              {mode === "signin" && (
                <button
                  type="button"
                  onClick={() => switchTo("forgot")}
                  className="inline-flex min-h-11 items-center text-[0.95rem] font-semibold text-kesar-deep hover:underline"
                >
                  Forgot password?
                </button>
              )}
            </span>
            <span className="flex items-center rounded-2xl border-2 border-sandal-edge bg-[#fbf3e2] focus-within:border-kesar-deep">
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="min-h-14 min-w-0 flex-1 bg-transparent px-4 text-[1.15rem] outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="min-h-12 px-4 text-[0.95rem] font-semibold text-kajal-soft hover:text-kajal"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </span>
            {mode === "signup" && <span className="text-[0.9rem] text-kajal-soft">At least 8 characters.</span>}
          </label>
        )}

        {error && (
          <p role="alert" className="rounded-2xl bg-kumkum/10 px-4 py-3 text-[1rem] font-semibold text-kumkum">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="mt-2 min-h-14 rounded-full bg-kesar text-[1.1rem] font-bold text-kajal hover:bg-kesar-deep hover:text-sandal disabled:opacity-60"
        >
          {busy ? "Please wait…" : mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : "Send reset link"}
        </button>
      </form>

      <p className="mt-6 text-[1.05rem]">
        {mode === "signin" ? (
          <>
            New here?{" "}
            <button type="button" onClick={() => switchTo("signup")} className="inline-flex min-h-11 items-center font-semibold text-kesar-deep hover:underline">
              Create an account
            </button>
          </>
        ) : (
          <button type="button" onClick={() => switchTo("signin")} className="inline-flex min-h-11 items-center font-semibold text-kesar-deep hover:underline">
            ← Back to sign in
          </button>
        )}
      </p>
      {mode === "signup" && (
        <p className="mt-6 max-w-[34ch] text-[0.9rem] text-kajal-soft">
          By creating an account, you agree to our{" "}
          <Link href="/terms" className="underline underline-offset-2">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline underline-offset-2">
            Privacy Policy
          </Link>
          .
        </p>
      )}
      <p className="mt-8 text-[0.85rem] text-kajal-soft">
        You don&apos;t need an account to use SwamiGPT.{" "}
        <Link href="/" className="underline">
          Keep going without one
        </Link>
      </p>
    </div>
  );
}

function AppleLogo() {
  return (
    <svg viewBox="0 0 24 24" className="size-6" fill="currentColor" aria-hidden="true">
      <path d="M16.37 12.6c-.02-2.2 1.8-3.26 1.88-3.31-1.03-1.5-2.62-1.7-3.18-1.73-1.35-.14-2.64.8-3.33.8-.69 0-1.74-.78-2.86-.76-1.47.02-2.83.86-3.59 2.17-1.53 2.65-.39 6.57 1.1 8.72.73 1.05 1.6 2.23 2.73 2.19 1.1-.04 1.51-.7 2.84-.7 1.32 0 1.7.7 2.86.68 1.18-.02 1.93-1.07 2.65-2.13.84-1.22 1.18-2.4 1.2-2.46-.03-.01-2.29-.88-2.3-3.47zM14.2 6.13c.6-.73 1.01-1.75.9-2.76-.87.04-1.92.58-2.54 1.31-.56.65-1.05 1.68-.92 2.67.97.08 1.96-.49 2.56-1.22z" />
    </svg>
  );
}

function GoogleLogo() {
  return (
    <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.1V7.06H2.18A11 11 0 0 0 1 12c0 1.77.42 3.45 1.18 4.94l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  );
}
