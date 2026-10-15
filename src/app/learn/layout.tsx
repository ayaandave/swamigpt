import type { Metadata } from "next";

// The Learn page itself runs in the browser, so its title lives here; lesson pages set their own
export const metadata: Metadata = {
  title: "Learn: lessons and stories · SwamiGPT",
  description:
    "Short lessons a 12-year-old can follow: the Gita in 18 days, karma, yoga beyond the mat, the Ramayana and stories of the gods, plus the full scripture library.",
};

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return children;
}
