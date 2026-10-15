-- After the server moved to take_question and use_voice (secret key only), the old functions go:
-- use_question could be called by anyone through the public API, and use_speech is unused.
revoke all on function public.use_question(text) from public, anon, authenticated;
drop function if exists public.use_question(text);
drop function if exists public.use_speech(text, int, int, int);
