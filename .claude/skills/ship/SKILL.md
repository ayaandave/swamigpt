---
name: ship
description: Check, build and put SwamiGPT live: lint, type check, production build, commit, push to main (Vercel deploys it), then confirm swamigpt.com updated and its main pages load. Use when the user says "ship it", "deploy", "put it live" or runs /ship.
disable-model-invocation: true
---

# Ship

Pushing `main` deploys swamigpt.com straight away, so every step below must pass before the push.

1. **See what's changing.** `git status --short` and `git diff --stat`. If there's nothing to ship, say so and stop. Never commit `.env*` files or anything holding a key.
2. **Database first.** If the changes add a file in `supabase/migrations/` that isn't live yet, stop: copy it to the clipboard (`pbcopy < <file>`), open the Supabase SQL Editor (https://supabase.com/dashboard/project/itcwkjkjlitmjugtisle/sql/new), and ask the user to paste it, click Run and reply "success". Code that needs a table must never go live before the table exists.
3. **Checks** (each must pass; on a failure, fix it or stop and explain in plain words):
   - `npx eslint .` — errors fail; the known `react-hooks/exhaustive-deps` warning in MeditationPlayer is fine.
   - `npx tsc --noEmit -p .`
   - `npm test` (unit tests in `tests/`)
   - `npx next build` (run it in the background if it may pass two minutes). The build writes `.next` in this folder, which can break a `next dev` that's running from it: tell the user to restart their dev server afterwards if one is running.
4. **Test what changed** when it shows in the browser: `npx next start -p 3312` in the background, load the changed pages, check for errors, then stop it (`pkill -f "next start -p 3312"`). Never spend real AI or voice credits in tests; mock `/api/ask` and `/api/speak` instead.
5. **Commit and push.** Work on a branch (`git checkout -b <short-name>` if on main), commit with a clear message that ends with the attribution lines from the session, then `git checkout main && git merge --ff-only <branch> && git push origin main`.
6. **Confirm it's live.** Wait with an until-loop (no bare `sleep`) for something only the new version has: new text in a page's HTML, a new header, or a new route returning 200. Then check `/`, `/ask`, `/learn`, `/meditate`, `/read/gita/2/47` return 200. If something you changed is behind sign-in or costs credits, say what you couldn't check.
7. **Report simply:** what went live (a short, plain list), what was tested, and anything the user still has to do.
