-- SwamiGPT accounts: settings, mala progress, chat history and daily question limits.
-- Every table has Row Level Security: a signed-in person can only ever see their own rows.
-- New tables are not exposed automatically in this project, so each grant below is deliberate.

-- ---------- Profile: settings and the age answer from the welcome gate ----------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  settings jsonb not null default '{}'::jsonb,
  age_group text check (age_group in ('under13', '13plus')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
grant select, insert, update on public.profiles to authenticated;
create policy "own profile: read" on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy "own profile: create" on public.profiles for insert to authenticated with check ((select auth.uid()) = id);
create policy "own profile: update" on public.profiles for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- ---------- Mala progress: one row per finished lesson ----------
create table public.lesson_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  path_slug text not null,
  lesson_index int not null check (lesson_index >= 0),
  done_at timestamptz not null default now(),
  primary key (user_id, path_slug, lesson_index)
);
alter table public.lesson_progress enable row level security;
grant select, insert, delete on public.lesson_progress to authenticated;
create policy "own progress: read" on public.lesson_progress for select to authenticated using ((select auth.uid()) = user_id);
create policy "own progress: add" on public.lesson_progress for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "own progress: remove" on public.lesson_progress for delete to authenticated using ((select auth.uid()) = user_id);

-- ---------- Chat history: conversations made of question-and-answer turns ----------
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index conversations_by_user on public.conversations (user_id, updated_at desc);
alter table public.conversations enable row level security;
grant select, insert, update, delete on public.conversations to authenticated;
create policy "own conversations: read" on public.conversations for select to authenticated using ((select auth.uid()) = user_id);
create policy "own conversations: add" on public.conversations for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "own conversations: update" on public.conversations for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "own conversations: delete" on public.conversations for delete to authenticated using ((select auth.uid()) = user_id);

create table public.turns (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  question text not null,
  answer jsonb not null, -- the answer as shown: paragraphs, quoted verses, practice
  created_at timestamptz not null default now()
);
create index turns_by_conversation on public.turns (conversation_id, created_at);
alter table public.turns enable row level security;
grant select, insert, delete on public.turns to authenticated;
create policy "own turns: read" on public.turns for select to authenticated using ((select auth.uid()) = user_id);
create policy "own turns: add" on public.turns for insert to authenticated with check (
  (select auth.uid()) = user_id
  and exists (select 1 from public.conversations c where c.id = conversation_id and c.user_id = (select auth.uid()))
);
create policy "own turns: delete" on public.turns for delete to authenticated using ((select auth.uid()) = user_id);

-- ---------- Daily question limits ----------
-- Counted by the server through use_question(); people can see their count but never change it.
create table public.question_usage (
  who text not null, -- 'user:<id>' when signed in, 'guest:<hashed address>' when not
  day date not null,
  count int not null default 0,
  primary key (who, day)
);
alter table public.question_usage enable row level security;
grant select on public.question_usage to authenticated;
create policy "own usage: read" on public.question_usage for select to authenticated
  using (who = 'user:' || (select auth.uid())::text);

-- Uses up one question for today if any are left. Signed-in people are counted by their account
-- (the guest key is ignored); guests by the hashed address the server passes in.
-- Returns how many questions are left today, or -1 if none were left.
create function public.use_question(guest_key text default null)
returns int
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  v_who text;
  v_daily int;
  v_used int;
begin
  if uid is not null then
    v_who := 'user:' || uid::text;
    v_daily := 15;
  elsif guest_key is not null and length(guest_key) between 16 and 128 then
    v_who := 'guest:' || guest_key;
    v_daily := 3;
  else
    return -1;
  end if;

  insert into public.question_usage as u (who, day, count)
  values (v_who, current_date, 1)
  on conflict (who, day) do update set count = u.count + 1
    where u.count < v_daily
  returning u.count into v_used;

  if v_used is null then
    return -1; -- already at the limit today
  end if;
  return v_daily - v_used;
end;
$$;
revoke all on function public.use_question(text) from public;
grant execute on function public.use_question(text) to anon, authenticated;
