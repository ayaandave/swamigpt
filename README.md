# SwamiGPT

**Try it: [www.swamigpt.com](https://www.swamigpt.com)**

SwamiGPT (also written Swami GPT) is a free AI guide that answers questions about life, Hindu philosophy, yoga and meditation using **only real Hindu scripture**. You ask in your own words; it searches a library of 4,000+ public-domain passages by meaning, and the AI answers using only the passages it found, quoting them word for word with a link to each one.

It was built by a high school student in California and is live at [swamigpt.com](https://www.swamigpt.com). It is not a ChatGPT custom GPT and is not connected to other chatbots with a similar name.

- **Ask:** practical help first, then a real verse, then what it means for you. "Deeper study" compares how different schools of Hindu thought read the same idea.
- **Learn:** 47 five-minute lessons, with an interactive prayer-bead (mala) progress ring.
- **Meditate:** guided meditations with a breathing circle and words that follow the voice.
- **Today:** a new verse every morning with a small practice.
- **Library:** the Bhagavad Gita, the Upanishads, the Yoga Sutras, Swami Vivekananda and the Ramayana, every passage on its own page.

An AI guide, not a guru. If someone seems to be in crisis, SwamiGPT points them to the 988 Suicide & Crisis Lifeline.

## How it works

Next.js (App Router, TypeScript), Tailwind CSS, Supabase (Postgres with row-level security, auth, storage), Vercel, the Claude API for answers, ElevenLabs for voices, and local `bge-small` embeddings for semantic search. The iPhone app is a Capacitor shell around the live site with native extras (daily-verse notifications, lock-screen meditation audio, offline pages).

## Run locally

```bash
npm install
npm run dev
```

Secrets go in `.env.local` (never committed).
