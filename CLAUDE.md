@AGENTS.md

# SwamiGPT

A calm AI guide to Hindu philosophy, yoga and meditation, live at https://www.swamigpt.com. The end goal is an iOS App Store app (Capacitor), so prefer choices that work on phones.

Stack: Next.js 16.4 (App Router, cacheComponents, `proxy` not middleware), React 19, Tailwind 4, TypeScript, Supabase (auth, history, limits, `speech` storage bucket), Anthropic SDK (`/api/ask`), ElevenLabs (`/api/speak`), local bge-small embeddings for scripture search. Hosted on Vercel; pushing `main` deploys to production.

## Secrets
- Never print values from `.env.local` or paste keys (`sk_`, `sb_secret_`, `sk-ant-`) or passwords into chat. Check that a variable exists without showing it (`grep -c '^NAME=' .env.local`).
- Voice IDs, the Supabase project URL/ref and the publishable key are fine to show.
- New env vars must also be added in Vercel (Settings → Environment Variables), then redeployed.

## Answers and content
- Answers follow `src/lib/swami-prompt.ts`. Life answers are guided by Hindu philosophy and name God plainly as comfort, but stay welcoming to non-Hindus: no assumed stories, rituals or jargon.
- Quote only passages from the library; refer to them as "Krishna says", "Vivekananda says", never verse numbers or book citations in prose.
- Lessons and home copy: a 12-year-old can follow it, an elder still finds it worthwhile. Plain, direct sentences.
- Deeper study mode is genuinely scholarly (schools, Sanskrit terms, objections), with no forced life advice.
- Never imply a real teacher (e.g. Swami Paramatmananda) endorses the app.

## Costs
- `SWAMI_TEST_MODE=1` uses the cheaper model while testing; launch defaults favour quality.
- ElevenLabs credits are limited: prefer saved audio (`c=1`), and never loop requests to `/api/speak`.

## Working here
- Before deploying: `npx eslint .`, `npx tsc --noEmit -p .`, `npx next build` (or run `/ship`).
- Test answer quality with `/answer-check` after changing the prompt or `/api/ask`.
- If the dev server serves stale CSS or code, restart it (`next dev -p 3311`).
- The header uses px sizes (not rem) so it fits phones at the largest text size; root font size is 125%.
- Database changes go in `supabase/migrations/` as new files.
- Ask questions with multiple-choice options and a recommended pick.
