-- SwamiGPT HQ (the owner's dashboard at /admin): TikTok numbers saved once a week, and the owner's
-- to-do list. Only the server (service_role) reads or writes these; no browser key ever gets access,
-- and row level security is on with no policies, so the publishable key sees nothing.

-- One row per check of the TikTok account (the Sunday task, or typed in on the dashboard)
create table public.tiktok_snapshots (
  day date primary key,
  followers int not null check (followers >= 0),
  likes int check (likes >= 0),                  -- total likes on the account, when known
  views int check (views >= 0),                  -- total views across posts, when known
  posts jsonb not null default '[]'::jsonb       -- [{ title, url?, posted?, views, likes, comments?, shares?, saves? }]
    check (jsonb_typeof(posts) = 'array' and pg_column_size(posts) <= 200000),
  note text check (length(note) <= 2000),
  created_at timestamptz not null default now()
);
alter table public.tiktok_snapshots enable row level security;
grant select, insert, update, delete on public.tiktok_snapshots to service_role;

create table public.admin_todos (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(title) between 1 and 300),
  note text check (length(note) <= 2000),
  done boolean not null default false,
  created_at timestamptz not null default now(),
  done_at timestamptz
);
alter table public.admin_todos enable row level security;
grant select, insert, update, delete on public.admin_todos to service_role;

-- The numbers from the last two TikTok checks, so the charts have a start
insert into public.tiktok_snapshots (day, followers, likes, views, posts, note) values
  ('2026-10-20', 34, null, null, '[
    {"title":"Hanuman mantra (listen before a hard task)","views":10000,"likes":917,"comments":22},
    {"title":"Arjuna breakdown slideshow","views":1200,"likes":49},
    {"title":"What the Gita teaches","views":486,"likes":41},
    {"title":"Lotus","views":314,"likes":19},
    {"title":"Oppenheimer and the Gita","views":300,"likes":10},
    {"title":"Doomscrolling","views":51}
  ]'::jsonb, 'Typed in from the Oct 20 check'),
  ('2026-11-12', 1587, 52400, null, '[
    {"title":"Hanuman mantra (listen before a hard task)","views":375200,"likes":50300,"saves":15500,"shares":5300},
    {"title":"Shiva sleep prayer","views":6600},
    {"title":"Aigiri Nandini","views":6400},
    {"title":"Ganga aarti","views":2600},
    {"title":"Arjuna slideshow","views":2500}
  ]'::jsonb, 'Typed in from the Nov 12 check (likes per post not recorded except Hanuman)');

insert into public.admin_todos (title, note) values
  ('App Store search update (version 1.0.1)', 'Name "SwamiGPT: Bhagavad Gita Guide", subtitle "Hindu Wisdom & Meditation", new keywords, rating prompt after a 👍 or the 3rd lesson'),
  ('Delete the test report row', 'Optional chore: the old test row in answer_reports'),
  ('Clear old speech audio', 'Optional chore: old files in the Supabase "speech" bucket'),
  ('Add the domain price to the money page', 'GoDaddy, paid yearly: put it in FIXED_COSTS in src/lib/money.ts'),
  ('Check SWAMI_TEST_MODE in Vercel production', 'Remove it if it is 1, so everyone gets the best model');

-- The dashboard's Users section counts rows in these (counts only, never the text). Reading is all
-- the server needs here; harmless if a grant already exists.
grant select on public.profiles, public.lesson_progress, public.turns, public.answer_feedback to service_role;
