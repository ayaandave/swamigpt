-- More free questions while the Congressional App Challenge is being judged: judges in one office
-- share a network, and guests are counted per network. Guests 3 -> 8 a day, free accounts 5 -> 10
-- (so signing in still gives more). Plus stays at 20. The site-wide daily cap still applies.
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
    when p_uid is null then 8
    when public.is_plus(p_uid) then 20
    else 10
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
