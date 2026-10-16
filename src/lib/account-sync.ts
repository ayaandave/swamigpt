"use client";

// Keeps this device and the signed-in account in step: settings, the age answer, mala progress
// and practice days.
// On sign-in the two are merged (nothing earned on either side is lost); after that, changes
// made here are saved to the account as they happen.
import { clearMeditationLog } from "./meditation-log";
import { clearPracticeDays, getPracticeDays, mergePracticeDays, onPractice } from "./practice";
import { clearProgress, getProgress, mergeProgress, onLessonDone, type Progress } from "./progress";
import { getSettings, onSettingsChange, updateSettings, type Settings } from "./settings";
import { supabase } from "./supabase";

type Remote = { settings: Partial<Settings>; age_group: Settings["ageGroup"] };

const synced = (s: Settings) => {
  const { ageGroup, ...rest } = s;
  return { settings: rest, age_group: ageGroup };
};

// A Supabase query only runs once something waits for it (a bare "void query" never sends
// anything), so each save goes through here: it runs, and a failure is tried once more later.
type Query = PromiseLike<{ error: { message: string } | null }>;
function save(run: () => Query, retried = false) {
  void Promise.resolve(run()).then(
    ({ error }) => {
      if (!error) return;
      if (!retried) setTimeout(() => save(run, true), 5000);
      else console.error("saving to your account failed", error.message);
    },
    () => !retried && setTimeout(() => save(run, true), 5000),
  );
}

// On signing out: this phone forgets the account's lessons, practice days, meditation totals and
// picture, so the next person to use it doesn't see them or merge them into their own account.
// They're all saved in the account and come back on signing in. Text size and voice stay.
export function forgetAccountOnThisDevice() {
  clearProgress();
  clearPracticeDays();
  clearMeditationLog();
  updateSettings({ avatar: null });
}

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

  // ---- Practice days: union of both sides ----
  const { data: practice } = await sb.from("profiles").select("practice_days").eq("id", userId).maybeSingle<{ practice_days: string[] }>();
  mergePracticeDays(practice?.practice_days ?? []);
  await sb.from("profiles").update({ practice_days: getPracticeDays() }).eq("id", userId);

  // ---- From now on, save changes as they happen ----
  let timer: ReturnType<typeof setTimeout> | undefined;
  const offSettings = onSettingsChange(() => {
    clearTimeout(timer); // a burst of slider moves becomes one save
    timer = setTimeout(() => save(() => sb.from("profiles").upsert({ id: userId, ...synced(getSettings()) })), 800);
  });
  const offLessons = onLessonDone(
    (slug, index) =>
      save(() => sb.from("lesson_progress").upsert({ user_id: userId, path_slug: slug, lesson_index: index }, { ignoreDuplicates: true })),
  );

  const offPractice = onPractice((days) => save(() => sb.from("profiles").update({ practice_days: days }).eq("id", userId)));

  return () => {
    clearTimeout(timer);
    offSettings();
    offLessons();
    offPractice();
  };
}
