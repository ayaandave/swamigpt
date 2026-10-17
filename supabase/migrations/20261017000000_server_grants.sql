-- The server (secret key = service_role) needs to read and write these tables directly. New tables
-- in this project get no access by default, and these grants were missing, so:
--   account deletion failed (it reads plus_members and clears the usage counts),
--   Plus could never switch on (plus-sync writes plus_members),
--   the money dashboard couldn't read the daily counts or the reports.
-- service_role is the server only; the browser's keys never get it, so nothing here is opened to users.
grant select, insert, update, delete on public.question_usage to service_role;
grant select, insert, update, delete on public.speech_usage to service_role;
grant select, insert, update, delete on public.plus_members to service_role;
grant select, insert, update, delete on public.answer_reports to service_role;
