-- Answers someone chose to share, each shown at swamigpt.com/s/<id>. Written only by the server
-- (after checking the answer's seal) and read only by the server, so the table has row-level
-- security on and no policies at all: browsers can neither read nor write it directly.
create table if not exists public.shared_answers (
  id text primary key check (id ~ '^[A-Za-z0-9_-]{12}$'),
  question text not null check (char_length(question) between 1 and 2000),
  answer jsonb not null,
  created_at timestamptz not null default now()
);
alter table public.shared_answers enable row level security;
revoke all on public.shared_answers from anon, authenticated;
grant select, insert on public.shared_answers to service_role;
