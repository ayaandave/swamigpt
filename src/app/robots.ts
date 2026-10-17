import type { MetadataRoute } from "next";

// Search engines and AI assistants may read everything public; personal pages and the API stay out,
// except the verse pictures that link previews show (/api/card)
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/api/card"],
      disallow: ["/api/", "/account", "/admin", "/login", "/settings", "/v/"],
    },
    sitemap: "https://www.swamigpt.com/sitemap.xml",
  };
}
