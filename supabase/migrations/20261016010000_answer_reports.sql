-- "Report this answer": anyone can flag an answer that is wrong about scripture, unsafe or
-- disrespectful. Reports are read in the Supabase dashboard (Table Editor → answer_reports).
-- Only the server writes them (secret key), through add_report(), which allows 10 a day per person.
-- Nobody can read reports through the public API. A report goes with its account when the account
-- is deleted; a guest's report is linked only to the scrambled address code.

create table public.answer_reports (
  id uuid primary key default gen_random_uuid(),
  who text not null,  -- 'user:<id>' or 'guest:<hashed address>', for the daily limit
  user_id uuid references auth.users (id) on delete cascade,
  reason text not null check (reason in ('wrong', 'unsafe', 'disrespectful', 'other')),
  note text check (length(note) <= 500),
  question text not null check (length(question) <= 2000),
  answer jsonb not null check (pg_column_size(answer) <= 100000), -- paragraphs and quoted passage ids
  depth text check (depth in ('simpler', 'deeper')),
  created_at timestamptz not null default now(),
  reviewed boolean not null default false
);
create index answer_reports_by_who on public.answer_reports (who, created_at);
create index answer_reports_to_review on public.answer_reports (reviewed, created_at desc);
alter table public.answer_reports enable row level security;

-- Saves one report if this person has sent fewer than 10 today. Returns true if it was saved.
create function public.add_report(
  p_who text, p_uid uuid, p_reason text, p_note text, p_question text, p_answer jsonb, p_depth text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_who is null or p_who !~ '^(guest|user):[0-9a-f-]{16,128}$' then
    return false;
  end if;
  perform pg_advisory_xact_lock(hashtext('report:' || p_who));
  if (select count(*) from public.answer_reports r
       where r.who = p_who and r.created_at > now() - interval '1 day') >= 10 then
    return false;
  end if;
  insert into public.answer_reports (who, user_id, reason, note, question, answer, depth)
  values (p_who, p_uid, p_reason, nullif(trim(p_note), ''), p_question, p_answer, p_depth);
  return true;
end;
$$;
revoke all on function public.add_report(text, uuid, text, text, text, jsonb, text) from public, anon, authenticated;
grant execute on function public.add_report(text, uuid, text, text, text, jsonb, text) to service_role;
