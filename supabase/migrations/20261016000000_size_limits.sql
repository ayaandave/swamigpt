-- Size limits on what the app saves from the browser, from the Take9 security review.
-- Row level security already keeps each person to their own rows, but without limits one account
-- could fill the database with huge settings, titles or answers. Each limit is many times what the
-- app ever writes (titles are cut to 80 characters, questions to 2,000, a deeper answer is ~20 KB).
-- NOT VALID: the limits apply to every new or changed row; rows already saved aren't rechecked.

alter table public.profiles
  add constraint profiles_settings_size check (pg_column_size(settings) <= 8192) not valid,
  add constraint profiles_practice_days_size check (cardinality(practice_days) <= 4000) not valid;

alter table public.lesson_progress
  add constraint lesson_progress_slug_size check (length(path_slug) <= 100) not valid,
  add constraint lesson_progress_index_size check (lesson_index < 1000) not valid;

alter table public.conversations
  add constraint conversations_title_size check (length(title) <= 200) not valid;

alter table public.turns
  add constraint turns_question_size check (length(question) <= 4000) not valid,
  add constraint turns_answer_size check (pg_column_size(answer) <= 200000) not valid;
