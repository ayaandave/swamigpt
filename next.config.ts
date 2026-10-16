import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  // The meaning-search model is read from disk at runtime, so make sure it ships with the routes
  // that search, and leave out the downloaded copy and other platforms' binaries
  outputFileTracingIncludes: {
    "/api/search": ["./data/models/**/*", "./node_modules/onnxruntime-node/**/*", "./node_modules/onnxruntime-common/**/*"],
    "/api/ask": ["./data/models/**/*", "./node_modules/onnxruntime-node/**/*", "./node_modules/onnxruntime-common/**/*"],
  },
  outputFileTracingExcludes: {
    "*": [
      "node_modules/@huggingface/transformers/.cache/**",
      "node_modules/onnxruntime-node/bin/napi-v*/darwin/**",
      "node_modules/onnxruntime-node/bin/napi-v*/win32/**",
      "node_modules/@img/sharp-libvips-darwin*/**",
    ],
  },
  partialPrefetching: true,
  // The service worker is always fetched fresh, so an update reaches everyone straight away
  // Every page: no other site may frame SwamiGPT (so nobody can disguise it to trick a tap), browsers
  // never guess file types, other sites see only "swamigpt.com" when someone follows a link out, and
  // only the microphone (for asking out loud) can be used
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'; object-src 'none'; base-uri 'self'" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), geolocation=(), browsing-topics=(), microphone=(self)" },
        ],
      },
      {
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self'" },
        ],
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
