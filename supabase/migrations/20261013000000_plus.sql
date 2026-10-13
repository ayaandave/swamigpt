-- SwamiGPT Plus: who has it, and limits that depend on it.
-- Quality is the same for everyone (best model, best voice); Plus only changes how many.
--   Questions a day:      guests 3, free accounts 5, Plus 20
--   New voice audio:      free 2,000 characters a day and 6,000 a month (about 3 read-aloud answers)
--                         Plus 8,000 a day and 50,000 a month (about 28 read-aloud answers)
-- Saved audio (meditations, lessons, verses) replays free and never counts.

-- ---------- Who has Plus ----------
-- Written only by the server (RevenueCat webhook, secret key). People can read their own row.
create table public.plus_members (
  user_id uuid primary key references auth.users (id) on delete cascade,
  expires_at timestamptz, -- null: never expires (a lifetime or gifted membership)
  product text,           -- e.g. plus_yearly
  store text,             -- stripe, app_store, ...
  updated_at timestamptz not null default now()
);
alter table public.plus_members enable row level security;
grant select on public.plus_members to authenticated;
create policy "own plus: read" on public.plus_members for select to authenticated
  using ((select auth.uid()) = user_id);

create function public.is_plus(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.plus_members p
     where p.user_id = uid and (p.expires_at is null or p.expires_at > now())
  );
$$;
revoke all on function public.is_plus(uuid) from public, anon, authenticated;

-- ---------- Questions: same as before, with Plus ----------
create or replace function public.use_question(guest_key text default null)
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
    v_daily := case when public.is_plus(uid) then 20 else 5 end;
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

-- ---------- Voice: a day and a 30-day limit, by plan ----------
-- Counted by account when the app sends a signed voice ticket, otherwise by hashed address.
-- Returns true if the audio may be made, and counts it.
create function public.use_voice(p_who text, p_uid uuid, p_chars int, per_site int)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_plus boolean := p_uid is not null and public.is_plus(p_uid);
  v_day_limit int := case when v_plus then 8000 else 2000 end;
  v_month_limit int := case when v_plus then 50000 else 6000 end;
  v_day int;
  v_month int;
  v_site int;
begin
  if p_who is null or p_who !~ '^(guest|user):[0-9a-f-]{16,128}$' or p_chars <= 0 then
    return false;
  end if;

  select coalesce(sum(u.chars) filter (where u.who = p_who and u.day = current_date), 0),
         coalesce(sum(u.chars) filter (where u.who = p_who), 0),
         coalesce(sum(u.chars) filter (where u.who = 'site' and u.day = current_date), 0)
    into v_day, v_month, v_site
    from public.speech_usage u
   where u.day > current_date - 30 and u.who in (p_who, 'site');

  if v_day + p_chars > v_day_limit or v_month + p_chars > v_month_limit or v_site + p_chars > per_site then
    return false;
  end if;

  insert into public.speech_usage as u (who, day, chars)
  values (p_who, current_date, p_chars), ('site', current_date, p_chars)
  on conflict (who, day) do update set chars = u.chars + excluded.chars;
  return true;
end;
$$;
revoke all on function public.use_voice(text, uuid, int, int) from public, anon, authenticated;
grant execute on function public.use_voice(text, uuid, int, int) to service_role;
