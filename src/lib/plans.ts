// SwamiGPT Plus. Everyone gets the same best answers and voice; Plus is more of them.
// The numbers here are for display; the real limits live in the database (use_question, use_voice).
export const PLUS = {
  // Web checkout appears once RevenueCat's public web key is set (Vercel env)
  enabled: Boolean(process.env.NEXT_PUBLIC_REVENUECAT_WEB_KEY),
  webKey: process.env.NEXT_PUBLIC_REVENUECAT_WEB_KEY ?? "",
  questions: { guest: 3, free: 5, plus: 20 },
  readAloud: { free: 3, plus: 28 }, // answers read in Swamiji's voice, about this many a month
};
