-- Days someone practised (a meditation, a lesson, a mantra count or today's verse), for the gentle
-- streak and "your journey". Kept on the profile, which RLS already limits to its owner.
alter table public.profiles add column if not exists practice_days date[] not null default '{}';
