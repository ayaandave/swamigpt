import type { Metadata } from "next";
import { AnimationLab } from "./AnimationLab";

// A private test page for trying React Bits animations on real SwamiGPT screens.
// Not linked from anywhere and kept out of search engines.
export const metadata: Metadata = {
  title: "Animation lab · SwamiGPT",
  robots: { index: false, follow: false },
};

export default function AnimationLabPage() {
  return <AnimationLab />;
}
