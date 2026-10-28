// Search (SEO) and AI answer engines (AEO): the tags every public page carries, and the
// structured data (JSON-LD) that tells Google, ChatGPT, Perplexity and others what a page is.
import type { Metadata } from "next";
import { createElement } from "react";

export const SITE = "https://www.swamigpt.com";
export const SITE_NAME = "SwamiGPT";
// Other ways people type the name, so search engines and AI assistants connect them to this site
export const ALT_NAMES = ["Swami GPT", "SwamiGPT.com", "swamigpt"];
// SwamiGPT's own profiles elsewhere. Add the TikTok and others here as they're confirmed.
export const SAME_AS = ["https://www.tiktok.com/@swamigpt", "https://github.com/ayaandave/swamigpt"];
export const HOME_TITLE = "SwamiGPT: a calm guide to the Gita, the Upanishads and meditation";
export const HOME_DESCRIPTION =
  "A calm AI guide to Hindu philosophy, yoga and meditation. Answers drawn only from real scripture: the Bhagavad Gita, the Upanishads, the Yoga Sutras, the Ramayana and more.";
// The picture shown when a page without its own verse card is shared or listed
export const DEFAULT_IMAGE = "/api/card?id=site&v=leaf"; // v= changes the address when the picture changes, so old copies aren't reused

// Title, description, the one true address of the page (so /ask?ask=... and other copies count as
// this page), and the preview shown in search results, messages and social apps
export function pageMeta({
  title,
  description,
  path,
  image = DEFAULT_IMAGE,
  type = "website",
}: {
  title: string;
  description?: string;
  path: string;
  image?: string;
  type?: "website" | "article";
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName: SITE_NAME,
      type,
      locale: "en_US",
      images: [{ url: image, width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

// Structured data as a <script type="application/ld+json">. "<" is escaped so text can never
// close the script tag.
export function JsonLd({ data }: { data: object }) {
  return createElement("script", {
    type: "application/ld+json",
    dangerouslySetInnerHTML: { __html: JSON.stringify({ "@context": "https://schema.org", ...data }).replace(/</g, "\\u003c") },
  });
}

export const ORGANIZATION = {
  "@type": "Organization",
  "@id": `${SITE}/#organization`,
  name: SITE_NAME,
  alternateName: ALT_NAMES,
  url: SITE,
  logo: `${SITE}/pwa-icon/512.png`,
  description: "SwamiGPT (swamigpt.com) is a free AI guide that answers questions using only real Hindu scripture, built by a high school student in California.",
  sameAs: SAME_AS,
};

// "Home › Learn › The Gita in 18 Days": shown by Google under the page title
export function breadcrumbs(items: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE}${item.path}`,
    })),
  };
}
