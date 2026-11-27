// How SwamiGPT is used, for SwamiGPT HQ: sign-ups, questions, lessons, 👍/👎. Counts only: the
// dashboard never shows what anyone asked or who they are. Server only.
import "server-only";
import { PATHS } from "@/lib/lessons";
import { cached, lastDays, serverDb } from "./db";

export type People =
  | {
      ok: true;
      accounts: number;
      byDay: { day: string; signups: number; questions: number; lessons: number; up: number; down: number }[];
      activeAskers7: number; // signed-in people who asked at least once in the last 7 days
      under13: number;
      courses: { slug: string; title: string; people: number; lessons: number; total: number }[];
      reportsToReview: number | null;
    }
  | { ok: false; problem: string };

const DAYS = 30;

export const getPeople = cached(2 * 60 * 1000, async (): Promise<People> => {
  const sb = serverDb();
  if (!sb) return { ok: false, problem: "Supabase keys aren't set." };
  const days = lastDays(DAYS);
  const since = `${days[0]}T00:00:00Z`;
  const week = new Date(Date.now() - 7 * 86400_000).toISOString();

  // Every account's sign-up date (a few pages of 1,000 at most for a long time yet)
  const created: string[] = [];
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await sb.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) return { ok: false, problem: "Couldn't read accounts from Supabase." };
    created.push(...data.users.map((u) => u.created_at));
    if (data.users.length < 1000) break;
  }

  const [questions, lessons, feedback, askers, kids, reports, allLessons] = await Promise.all([
    sb.from("question_usage").select("day, count").eq("who", "site").gte("day", days[0]),
    sb.from("lesson_progress").select("done_at").gte("done_at", since).limit(20000),
    sb.from("answer_feedback").select("rating, created_at").gte("created_at", since).limit(20000),
    sb.from("turns").select("user_id").gte("created_at", week).limit(20000),
    sb.from("profiles").select("id", { count: "exact", head: true }).eq("age_group", "under13"),
    sb.from("answer_reports").select("id", { count: "exact", head: true }).eq("reviewed", false),
    sb.from("lesson_progress").select("user_id, path_slug").limit(50000),
  ]);
  if (questions.error) return { ok: false, problem: "Couldn't read the daily question counts from Supabase." };

  const rows = new Map(days.map((d) => [d, { day: d, signups: 0, questions: 0, lessons: 0, up: 0, down: 0 }]));
  for (const c of created) {
    const r = rows.get(c.slice(0, 10));
    if (r) r.signups++;
  }
  for (const q of questions.data) {
    const r = rows.get(q.day);
    if (r) r.questions = q.count;
  }
  for (const l of lessons.data ?? []) {
    const r = rows.get(String(l.done_at).slice(0, 10));
    if (r) r.lessons++;
  }
  for (const f of feedback.data ?? []) {
    const r = rows.get(String(f.created_at).slice(0, 10));
    if (r) {
      if (f.rating === 1) r.up++;
      else r.down++;
    }
  }

  // Each course: how many people started it and how many lessons they finished in all
  const per = new Map<string, { people: Set<string>; lessons: number }>();
  for (const l of allLessons.data ?? []) {
    const p = per.get(l.path_slug) ?? { people: new Set(), lessons: 0 };
    p.people.add(l.user_id);
    p.lessons++;
    per.set(l.path_slug, p);
  }
  const courses = PATHS.map((p) => ({
    slug: p.slug,
    title: p.title,
    people: per.get(p.slug)?.people.size ?? 0,
    lessons: per.get(p.slug)?.lessons ?? 0,
    total: p.totalLessons,
  })).sort((a, b) => b.people - a.people || b.lessons - a.lessons);

  return {
    ok: true,
    accounts: created.length,
    byDay: [...rows.values()],
    activeAskers7: new Set((askers.data ?? []).map((t) => t.user_id)).size,
    under13: kids.count ?? 0,
    courses,
    reportsToReview: reports.error ? null : reports.count,
  };
});
