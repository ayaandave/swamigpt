-- Daily limits on new voice audio, so nobody can drain the ElevenLabs credits.
-- Only audio that has to be made counts; saved audio replays for free.
-- Counted by the server with the secret key through use_speech(); nobody else can read or call it.
create table public.speech_usage (
  who text not null, -- 'guest:<hashed address>', or 'site' for everyone together
  day date not null,
  chars int not null default 0,
  primary key (who, day)
);
alter table public.speech_usage enable row level security;

-- Adds this many characters to today's count for this address and for the whole site, if both stay
-- under their limits. Returns true if the audio may be made.
create function public.use_speech(guest_key text, chars int, per_person int, per_site int)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_person int;
  v_site int;
begin
  if guest_key is null or length(guest_key) not between 16 and 128 or chars <= 0 then
    return false;
  end if;

  select coalesce(sum(u.chars) filter (where u.who = 'guest:' || guest_key), 0),
         coalesce(sum(u.chars) filter (where u.who = 'site'), 0)
    into v_person, v_site
    from public.speech_usage u
   where u.day = current_date and u.who in ('guest:' || guest_key, 'site');

  if v_person + chars > per_person or v_site + chars > per_site then
    return false;
  end if;

  insert into public.speech_usage as u (who, day, chars)
  values ('guest:' || guest_key, current_date, chars), ('site', current_date, chars)
  on conflict (who, day) do update set chars = u.chars + excluded.chars;
  return true;
end;
$$;
revoke all on function public.use_speech(text, int, int, int) from public, anon, authenticated;
grant execute on function public.use_speech(text, int, int, int) to service_role;
