-- Tidying from the Supabase security and performance checks.

-- rls_auto_enable runs on its own (the ensure_rls event trigger turns on row level security for
-- every new table). Nobody needs to call it through the API.
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;

-- Deleting an account removes its turns by user; this keeps that (and history reads) quick
create index if not exists turns_by_user on public.turns (user_id);
