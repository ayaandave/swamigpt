-- Emails: the welcome email (once), the weekly verse (only for people who turn it on) and one
-- "a verse for you" note after two weeks away (on unless turned off). Only the server reads or
-- writes this table; people change their choices through /api/email/prefs or an unsubscribe link.
create table if not exists public.email_prefs (
  user_id uuid primary key references auth.users (id) on delete cascade,
  weekly boolean not null default false,
  nudges boolean not null default true,
  welcome_sent_at timestamptz,
  last_seen_at timestamptz not null default now(),
  nudge_sent_at timestamptz,
  weekly_sent_on date
);
create index if not exists email_prefs_weekly on public.email_prefs (weekly) where weekly;
create index if not exists email_prefs_seen on public.email_prefs (last_seen_at) where nudges and nudge_sent_at is null;

alter table public.email_prefs enable row level security;
-- No policies: signed-in people can't read or change the table directly
grant select, insert, update, delete on public.email_prefs to service_role;
