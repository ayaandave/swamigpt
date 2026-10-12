---
name: ship
description: Check, commit, push and verify a SwamiGPT deploy to swamigpt.com.
disable-model-invocation: true
---

# Ship to swamigpt.com

1. `git status` — show what will ship. If there are unrelated changes, ask which to include (multiple choice, recommended first). Never commit `.env*`.
2. Run `npx eslint .`, `npx tsc --noEmit -p .` and `npx next build`. Stop and fix on any error.
3. Commit with a plain-English message describing what changed for users, ending with the attribution line from the system reminder; push to `main` (Vercel deploys production).
4. Wait for the deploy: if the Vercel MCP is connected, poll the latest production deployment until READY (or ERROR, then show the build log). Otherwise wait ~2 minutes.
5. Smoke-test the live site and report a table:
   - `curl` 200 for `/`, `/ask`, `/learn`, `/learn/gita-18-days/1`, `/meditate`, `/meditate/three-minute-reset`, `/read/gita/2/47`, `/today`, `/settings`, `/sources`; 404 for `/nope`.
   - `/api/search?q=karma` returns 200.
   - Each voice plays: `curl -H "sec-fetch-site: same-origin" "https://www.swamigpt.com/api/speak?v=<voice>&s=0.8&t=Namaste."` for swamiji, amma, sakshi → 200 with audio bytes.
   - Do not call `/api/ask` on the live site unless asked (it spends a daily question).
6. Finish with the commit hash and anything that failed.
