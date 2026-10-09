import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SwamiGPT",
    short_name: "SwamiGPT",
    description: "A calm AI guide to Hindu philosophy, yoga and meditation.",
    start_url: "/",
    display: "standalone",
    background_color: "#f2e3c6",
    theme_color: "#f2e3c6",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
