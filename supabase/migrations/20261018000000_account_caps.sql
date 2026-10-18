-- A cap on how much one account can store, so a script signed in to one account can't fill the
-- database. The limits are far above what a person reaches: 2,000 saved conversations and 20,000
-- answers. Past the cap a new row is refused; nothing already saved is touched.
create or replace function public.cap_rows_per_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  cap int := tg_argv[0]::int;
  have int;
begin
  -- One check per account at a time, so two saves at once can't both slip past the cap
  perform pg_advisory_xact_lock(hashtext(tg_table_name || new.user_id::text));
  execute format('select count(*) from public.%I where user_id = $1', tg_table_name)
    into have using new.user_id;
  if have >= cap then
    raise exception 'storage limit reached' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

drop trigger if exists conversations_cap on public.conversations;
create trigger conversations_cap before insert on public.conversations
  for each row execute function public.cap_rows_per_user('2000');

drop trigger if exists turns_cap on public.turns;
create trigger turns_cap before insert on public.turns
  for each row execute function public.cap_rows_per_user('20000');

create index if not exists turns_by_user on public.turns (user_id);
