# SwamiGPT

A calm AI guide to Hindu philosophy, yoga and meditation, for anyone: students, elders, and people of every faith.

## Status

Phase 1: the full frontend with mock data. Answers, voices and progress are placeholders.

- **Ask**: practical help for your situation first, then a verse and what it means for you
- **Meditate**: guided sessions with a breathing lamp and background sound
- **Learn**: short lesson paths with mala-bead progress
- **Today**: a daily verse and reflection
- **Settings**: three voices, speech speed, text size, simple or deeper answers

The Swami persona (used as the Claude system prompt in Phase 3) is in `src/lib/swami-prompt.ts`.

## Run locally

```bash
npm install
npm run dev
```

## Roadmap

1. Frontend with mock data (done)
2. Scripture library in Supabase (pgvector)
3. Claude answers with citations
4. ElevenLabs voices
5. Accounts and saved progress
6. Full content for paths, meditations and daily verses
7. Beta and launch
