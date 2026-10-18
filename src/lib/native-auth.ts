"use client";

// Signing in inside the iPhone app. Google refuses to show its sign-in page inside an app's own
// web view, so Google sign-in opens in Safari's sheet and comes back to the app through
// com.swamigpt.app://auth/callback (a redirect URL listed in Supabase). Apple uses the iPhone's
// own "Sign in with Apple" sheet. Nothing here runs in a normal browser.
import { supabase } from "./supabase";

export const APP_AUTH_REDIRECT = "com.swamigpt.app://auth/callback";
let sheetOpen = false; // whether Safari's sign-in sheet is showing

export async function nativeOAuth(provider: "google"): Promise<string | null> {
  const sb = supabase();
  if (!sb) return "Accounts aren't set up";
  const { data, error } = await sb.auth.signInWithOAuth({
    provider,
    options: { redirectTo: APP_AUTH_REDIRECT, skipBrowserRedirect: true },
  });
  if (error || !data.url) return error?.message ?? "Couldn't start sign-in";
  const { Browser } = await import("@capacitor/browser");
  await Browser.open({ url: data.url, presentationStyle: "popover" });
  sheetOpen = true;
  return null;
}

// Called when iOS opens the app from the sign-in callback: saves the session, closes the sheet
export async function finishNativeOAuth(url: string): Promise<string | null> {
  if (!url.startsWith(APP_AUTH_REDIRECT)) return null;
  if (sheetOpen) {
    sheetOpen = false;
    const { Browser } = await import("@capacitor/browser");
    await Browser.close().catch(() => {});
  }
  const sb = supabase();
  if (!sb) return "Accounts aren't set up";
  const u = new URL(url);
  const params = new URLSearchParams(u.hash.replace(/^#/, ""));
  u.searchParams.forEach((v, k) => params.set(k, v));
  const failed = params.get("error_description") ?? params.get("error");
  if (failed) return failed;
  const code = params.get("code");
  if (code) {
    const { error } = await sb.auth.exchangeCodeForSession(code);
    return error?.message ?? null;
  }
  const access_token = params.get("access_token");
  const refresh_token = params.get("refresh_token");
  if (!access_token || !refresh_token) return "Sign-in didn't finish. Please try again.";
  const { error } = await sb.auth.setSession({ access_token, refresh_token });
  return error?.message ?? null;
}

const hex = (buf: ArrayBuffer) => Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");

// Sign in with Apple, with the iPhone's own sheet. Apple gets a hashed one-time value and
// Supabase the original, so a stolen token can't be replayed.
export async function nativeApple(): Promise<string | null> {
  const sb = supabase();
  if (!sb) return "Accounts aren't set up";
  const raw = hex(crypto.getRandomValues(new Uint8Array(32)).buffer);
  const hashed = hex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw)));
  const { SignInWithApple } = await import("@capacitor-community/apple-sign-in");
  try {
    const { response } = await SignInWithApple.authorize({
      clientId: "com.swamigpt.app",
      redirectURI: "https://www.swamigpt.com/login",
      scopes: "email name",
      nonce: hashed,
    });
    const { error } = await sb.auth.signInWithIdToken({ provider: "apple", token: response.identityToken, nonce: raw });
    return error?.message ?? null;
  } catch (e) {
    // Closing the sheet isn't an error worth showing
    const msg = e instanceof Error ? e.message : String(e);
    return /cancel|1001/i.test(msg) ? null : msg;
  }
}
