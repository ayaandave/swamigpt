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
