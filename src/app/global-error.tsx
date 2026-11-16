"use client";

import { useEffect } from "react";

// Shown only if the whole app frame breaks. It replaces the root layout, so it brings its own
// page and simple styles (black and gold, like the app's default look).
export default function GlobalError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error("App error", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          textAlign: "center",
          background: "#000000",
          color: "#f4f3ef",
          fontFamily: "-apple-system, system-ui, sans-serif",
        }}
      >
        <title>SwamiGPT</title>
        <h1 style={{ fontSize: "28px", fontWeight: 500, margin: 0 }}>Something went wrong</h1>
        <p style={{ maxWidth: "30ch", fontSize: "18px", lineHeight: 1.5, color: "#9a9994", margin: "12px 0 0" }}>
          SwamiGPT didn&apos;t load properly. Please try again in a moment.
        </p>
        <button
          type="button"
          onClick={() => retry()}
          style={{
            marginTop: "28px",
            minHeight: "52px",
            padding: "0 28px",
            border: 0,
            borderRadius: "14px",
            background: "#e3b341",
            color: "#000000",
            fontSize: "18px",
            fontWeight: 700,
          }}
        >
          Try again
        </button>
        {/* A full page load, not next/link: the app frame itself is what broke */}
        <button
          type="button"
          onClick={() => window.location.assign("/")}
          style={{
            marginTop: "16px",
            minHeight: "44px",
            border: 0,
            background: "none",
            color: "#f1d38a",
            fontSize: "17px",
            fontWeight: 600,
            textDecoration: "underline",
          }}
        >
          Go home
        </button>
      </body>
    </html>
  );
}
