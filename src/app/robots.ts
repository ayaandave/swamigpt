import type { MetadataRoute } from "next";

// Search engines may read everything public; personal pages and the API stay out
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/account", "/login", "/settings", "/v/"] },
    sitemap: "https://www.swamigpt.com/sitemap.xml",
  };
}
