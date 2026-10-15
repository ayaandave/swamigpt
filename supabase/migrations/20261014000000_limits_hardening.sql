-- Hardening from the security review before payments.
--   take_question: the question limit, now counted only by the server (secret key), which has
--   already checked who is asking. Adds a site-wide daily ceiling so no number of accounts or
--   addresses can run up an unlimited bill.
--   use_voice: requests are now counted one at a time, so a burst of parallel requests can't all
--   slip under the limit before any of them is counted.
-- The old use_question stays until the new code is live, then a later migration removes public access.

create or replace function public.take_question(p_who text, p_uid uuid, p_site_cap int)
returns int
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_daily int;
  v_site int;
  v_used int;
begin
  if p_who is null or p_who !~ '^(guest|user):[0-9a-f-]{16,128}$' then
    return -1;
  end if;
  v_daily := case
    when p_uid is null then 3
    when public.is_plus(p_uid) then 20
    else 5
  end;

  -- One question at a time for the site-wide count
  perform pg_advisory_xact_lock(hashtext('questions:site'));

  select coalesce(max(u.count), 0) into v_site
    from public.question_usage u
   where u.who = 'site' and u.day = current_date;
  if v_site >= p_site_cap then
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
