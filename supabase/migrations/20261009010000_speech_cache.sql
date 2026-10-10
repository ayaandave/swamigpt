-- Saved voice audio for fixed text (lessons, verse pages, meditations), so each piece of text
-- costs ElevenLabs credits only the first time it's played.
-- Public to read (the app links straight to the files); only the server can write, using the
-- secret key, which bypasses row level security, so no insert policy is needed.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('speech', 'speech', true, 5242880, array['audio/mpeg'])
on conflict (id) do nothing;
