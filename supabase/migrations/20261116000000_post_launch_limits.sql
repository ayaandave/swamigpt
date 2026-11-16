-- After the App Store launch:
--   1. Plus members are never stopped by the whole-site daily ceilings (questions or voice). They
--      pay, and each is still held to their own limits (20 questions a day; 8,000 voice characters
--      a day, 50,000 a month), so a busy day of free use can't lock them out. Their use still adds
--      to the site totals, so the ceiling keeps protecting the bill from free use.
--   2. return_question gives back questions that were counted but never answered (the search or
--      the AI failed).

create or replace function public.take_question(p_who text, p_uid uuid, p_site_cap int)
returns int
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_plus boolean := p_uid is not null and public.is_plus(p_uid);
  v_daily int;
  v_site int;
  v_used int;
begin
  if p_who is null or p_who !~ '^(guest|user):[0-9a-f-]{16,128}$' then
    return -1;
  end if;
  v_daily := case
    when p_uid is null then 3
    when v_plus then 20
    else 5
  end;

  -- One question at a time for the site-wide count
  perform pg_advisory_xact_lock(hashtext('questions:site'));

  select coalesce(max(u.count), 0) into v_site
    from public.question_usage u
   where u.who = 'site' and u.day = current_date;
  if v_site >= p_site_cap and not v_plus then
    return -2; -- the whole site is at today's ceiling
  end if;

  insert into public.question_usage as u (who, day, count)
  values (p_who, current_date, 1)
  on conflict (who, day) do update set count = u.count + 1
    where u.count < v_daily
  returning u.count into v_used;
  if v_used is null then
    return -1; -- this person is at today's limit
  end if;

  insert into public.question_usage as u (who, day, count)
  values ('site', current_date, 1)
  on conflict (who, day) do update set count = u.count + 1;
  return v_daily - v_used;
end;
$$;
revoke all on function public.take_question(text, uuid, int) from public, anon, authenticated;
grant execute on function public.take_question(text, uuid, int) to service_role;

create or replace function public.use_voice(p_who text, p_uid uuid, p_chars int, per_site int)
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

  -- One request at a time: totals are read and added to without another slipping in between
  perform pg_advisory_xact_lock(hashtext('voice:site'));

  select coalesce(sum(u.chars) filter (where u.who = p_who and u.day = current_date), 0),
         coalesce(sum(u.chars) filter (where u.who = p_who), 0),
         coalesce(sum(u.chars) filter (where u.who = 'site' and u.day = current_date), 0)
    into v_day, v_month, v_site
    from public.speech_usage u
   where u.day > current_date - 30 and u.who in (p_who, 'site');

  if v_day + p_chars > v_day_limit or v_month + p_chars > v_month_limit
     or (v_site + p_chars > per_site and not v_plus) then
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

-- Gives back up to p_count of today's questions to one person, and takes the same number off the
-- site's count. Never goes below zero, and never gives back more than they used today.
create function public.return_question(p_who text, p_count int)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_back int;
begin
  if p_who is null or p_who !~ '^(guest|user):[0-9a-f-]{16,128}$' or p_count is null or p_count < 1 then
    return;
  end if;
  perform pg_advisory_xact_lock(hashtext('questions:site'));

  with old as (
    select u.count from public.question_usage u where u.who = p_who and u.day = current_date for update
  ), upd as (
    update public.question_usage u
       set count = greatest(u.count - least(p_count, 2), 0)
     where u.who = p_who and u.day = current_date
    returning u.count
  )
  select old.count - upd.count into v_back from old, upd;

  if coalesce(v_back, 0) > 0 then
    update public.question_usage u
       set count = greatest(u.count - v_back, 0)
     where u.who = 'site' and u.day = current_date;
  end if;
end;
$$;
revoke all on function public.return_question(text, int) from public, anon, authenticated;
grant execute on function public.return_question(text, int) to service_role;
