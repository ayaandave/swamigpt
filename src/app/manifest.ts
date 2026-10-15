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
    id: "/",
    scope: "/",
    orientation: "portrait",
    categories: ["lifestyle", "education", "health"],
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/pwa-icon/192.png", sizes: "192x192", type: "image/png" },
      { src: "/pwa-icon/512.png", sizes: "512x512", type: "image/png" },
      { src: "/pwa-icon/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
    shortcuts: [
      { name: "Ask a question", url: "/ask" },
      { name: "Today's verse", url: "/today" },
      { name: "Meditate", url: "/meditate" },
    ],
  };
}
