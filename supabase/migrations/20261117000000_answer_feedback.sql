-- 👍/👎 under each answer: "Was this helpful?". Read in the Supabase dashboard (Table Editor →
-- answer_feedback) and counted on /admin.
-- Keeps as little as it can: a 👍 keeps only the rating, the depth and which passages were
-- quoted. A 👎 also keeps the question and the answer, so a person can see what went wrong.
-- Only the server writes (secret key), through add_feedback(), at most 30 a day per person.
-- Nobody can read it through the public API. Feedback goes with its account when the account is
-- deleted; a guest's is linked only to the scrambled address code.

create table public.answer_feedback (
  id uuid primary key default gen_random_uuid(),
  who text not null,  -- 'user:<id>' or 'guest:<hashed address>', for the daily limit
  user_id uuid references auth.users (id) on delete cascade,
  rating smallint not null check (rating in (-1, 1)),
  depth text check (depth in ('simpler', 'deeper')),
  verse_ids text[] not null default '{}' check (cardinality(verse_ids) <= 6),
  question text check (length(question) <= 2000),               -- 👎 only
  answer jsonb check (answer is null or pg_column_size(answer) <= 100000), -- 👎 only
  created_at timestamptz not null default now()
);
create index answer_feedback_by_who on public.answer_feedback (who, created_at);
create index answer_feedback_by_day on public.answer_feedback (created_at desc);
alter table public.answer_feedback enable row level security;

-- Saves one rating if this person has sent fewer than 30 today. Returns true if it was saved.
create function public.add_feedback(
  p_who text, p_uid uuid, p_rating int, p_depth text, p_verse_ids text[], p_question text, p_answer jsonb
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_who is null or p_who !~ '^(guest|user):[0-9a-f-]{16,128}$' or p_rating not in (-1, 1) then
    return false;
  end if;
  perform pg_advisory_xact_lock(hashtext('feedback:' || p_who));
  if (select count(*) from public.answer_feedback f
       where f.who = p_who and f.created_at > now() - interval '1 day') >= 30 then
    return false;
  end if;
  insert into public.answer_feedback (who, user_id, rating, depth, verse_ids, question, answer)
  values (
    p_who, p_uid, p_rating, p_depth, coalesce(p_verse_ids, '{}'),
    case when p_rating = -1 then p_question end,
    case when p_rating = -1 then p_answer end
  );
  return true;
end;
$$;
revoke all on function public.add_feedback(text, uuid, int, text, text[], text, jsonb) from public, anon, authenticated;
grant execute on function public.add_feedback(text, uuid, int, text, text[], text, jsonb) to service_role;
