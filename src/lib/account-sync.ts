"use client";

// Keeps this device and the signed-in account in step: settings, the age answer and mala progress.
// On sign-in the two are merged (nothing earned on either side is lost); after that, changes
// made here are saved to the account as they happen.
import { getProgress, mergeProgress, onLessonDone, type Progress } from "./progress";
import { getSettings, onSettingsChange, updateSettings, type Settings } from "./settings";
import { supabase } from "./supabase";

type Remote = { settings: Partial<Settings>; age_group: Settings["ageGroup"] };

const synced = (s: Settings) => {
  const { ageGroup, ...rest } = s;
  return { settings: rest, age_group: ageGroup };
};

export async function startAccountSync(userId: string): Promise<() => void> {
  const sb = supabase();
  if (!sb) return () => {};

  // ---- Settings: the account wins if it has any, otherwise this device's are saved ----
  const { data: profile } = await sb.from("profiles").select("settings, age_group").eq("id", userId).maybeSingle<Remote>();
  if (profile && Object.keys(profile.settings).length) {
    updateSettings({ ...profile.settings, ...(profile.age_group ? { ageGroup: profile.age_group } : {}) });
  } else {
    await sb.from("profiles").upsert({ id: userId, ...synced(getSettings()) });
  }

  // ---- Progress: union of both sides ----
  const { data: rows } = await sb.from("lesson_progress").select("path_slug, lesson_index");
  const remote: Progress = {};
  for (const r of rows ?? []) (remote[r.path_slug] ??= []).push(r.lesson_index);
  const local = getProgress();
  const missing = Object.entries(local).flatMap(([slug, done]) =>
    done.filter((i) => !remote[slug]?.includes(i)).map((i) => ({ user_id: userId, path_slug: slug, lesson_index: i })),
  );
  if (missing.length) await sb.from("lesson_progress").upsert(missing, { ignoreDuplicates: true });
  mergeProgress(remote);

  // ---- From now on, save changes as they happen ----
  let timer: ReturnType<typeof setTimeout> | undefined;
  const offSettings = onSettingsChange(() => {
    clearTimeout(timer); // a burst of slider moves becomes one save
    timer = setTimeout(() => void sb.from("profiles").upsert({ id: userId, ...synced(getSettings()) }), 800);
  });
  const offLessons = onLessonDone(
    (slug, index) =>
      void sb.from("lesson_progress").upsert({ user_id: userId, path_slug: slug, lesson_index: index }, { ignoreDuplicates: true }),
  );

  return () => {
    clearTimeout(timer);
    offSettings();
    offLessons();
  };
}
