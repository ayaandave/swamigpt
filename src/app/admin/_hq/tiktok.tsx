import { useState } from "react";
import type { TikTokPost, TikTokSnapshot } from "@/lib/hq/tiktok";
import type { Load } from "./data";
import { Loading, Mini } from "./money";
import { Card, CardTitle, Chart, CountUp, fmt, Label, plural, Problem, SectionTitle } from "./ui";

export type TikTokData = { ok: true; snapshots: TikTokSnapshot[] } | { ok: false; problem: string };

const ROSE = "var(--hq-rose)";

export function TikTokSection({ tiktok }: { tiktok: Load<TikTokData> }) {
  const [adding, setAdding] = useState(false);
  const t = tiktok.data;
  if (!t) return <Loading load={tiktok} />;
  if (!t.ok) return <Problem>{t.problem}</Problem>;
  const snaps = t.snapshots;
  const last = snaps.at(-1);
  const prev = snaps.at(-2);
  const posts = [...(last?.posts ?? [])].sort((a, b) => b.views - a.views);
  const best = posts[0];
  const addButton = (
    <div className="flex items-center gap-2">
      <a href="https://app.metricool.com" target="_blank" rel="noreferrer" className="min-h-10 content-center rounded-full border border-(--hq-line) px-4 text-[13px] font-semibold text-(--hq-dim) hover:border-(--hq-line-hi) hover:text-(--hq-text)">
        Metricool ↗
      </a>
      <button type="button" onClick={() => setAdding((a) => !a)} className="min-h-10 rounded-full bg-(--hq-gold) px-4 text-[13px] font-semibold text-black hover:brightness-110">
        {adding ? "Close" : "+ Add numbers"}
      </button>
    </div>
  );
  return (
    <>
      <SectionTitle
        title="TikTok"
        sub={last ? `@swamigpt · last checked ${fmt.day(last.day)} · saved every Sunday by the TikTok task` : "@swamigpt"}
        right={addButton}
      />
      {adding && <AddForm tiktok={tiktok} last={last} done={() => setAdding(false)} />}
      {!last ? (
        <Card>
          <p className="text-[14px] text-(--hq-dim)">No TikTok numbers saved yet. The Sunday task saves them, or add them above.</p>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <Card>
            <Label>Followers</Label>
            <p className="mt-2 text-[48px] font-semibold leading-none tracking-[-0.04em]" style={{ color: "#ff8fab" }}>
              <CountUp value={last.followers} format={fmt.compact} />
            </p>
            {prev && (
              <p className="mt-2 text-[13px] text-(--hq-dim)">
                <span style={{ color: last.followers >= prev.followers ? "var(--hq-good)" : "var(--hq-bad)" }}>
                  {last.followers >= prev.followers ? "+" : ""}
                  {fmt.int(last.followers - prev.followers)}
                </span>{" "}
                since {fmt.day(prev.day)}
              </p>
            )}
            <div className="mt-5 grid grid-cols-2 gap-4 border-t border-(--hq-line) pt-4">
              <Mini label="Total likes" value={last.likes == null ? "—" : fmt.compact(last.likes)} />
              <Mini label="Posts tracked" value={fmt.int(posts.length)} />
            </div>
          </Card>
          <Card className="lg:col-span-2" delay={60}>
            <CardTitle>Followers over time</CardTitle>
            <Chart color={ROSE} points={snaps.map((s) => ({ label: fmt.day(s.day), value: s.followers }))} format={(n) => plural(n, "follower")} total={false} height={170} empty="Needs two checks to draw a line." />
          </Card>
          {best && (
            <Card className="lg:col-span-3" delay={120}>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="min-w-0">
                  <Label>Best post</Label>
                  <p className="mt-1 truncate text-[20px] font-semibold">{best.title}</p>
                  <p className="mt-1 text-[13px] text-(--hq-dim)">
                    {Math.round((best.views / Math.max(1, posts.reduce((t, p) => t + p.views, 0))) * 100)}% of all tracked views. Make more like this one.
                  </p>
                </div>
                <div className="flex gap-6">
                  <Mini label="Views" value={fmt.compact(best.views)} />
                  {best.likes != null && <Mini label="Likes" value={fmt.compact(best.likes)} />}
                  {best.saves != null && <Mini label="Saves" value={fmt.compact(best.saves)} />}
                  {best.shares != null && <Mini label="Shares" value={fmt.compact(best.shares)} />}
                </div>
              </div>
            </Card>
          )}
          <Card className="lg:col-span-3" delay={160}>
            <CardTitle>Posts, most viewed first</CardTitle>
            <PostTable posts={posts} />
          </Card>
          <Card className="lg:col-span-3" delay={200}>
            <CardTitle>Every check</CardTitle>
            <ul className="divide-y divide-(--hq-line)">
              {[...snaps].reverse().map((s) => (
                <li key={s.day} className="flex items-center justify-between gap-3 py-2.5 text-[14px]">
                  <span>
                    <strong>{fmt.day(s.day)}</strong>
                    {s.note && <span className="ml-2 text-[12px] text-(--hq-dim)">{s.note}</span>}
                  </span>
                  <span className="flex items-center gap-4 tabular-nums">
                    <span>{fmt.int(s.followers)} followers</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Delete the TikTok numbers from ${fmt.day(s.day)}?`)) void tiktok.send("DELETE", undefined, `?day=${s.day}`);
                      }}
                      className="text-[12px] text-(--hq-faint) hover:text-(--hq-bad)"
                    >
                      Delete
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </>
  );
}

function PostTable({ posts }: { posts: TikTokPost[] }) {
  const max = Math.max(...posts.map((p) => p.views), 1);
  return (
    <div className="-mx-2 overflow-x-auto">
      <table className="w-full min-w-[520px] text-left text-[14px]">
        <thead>
          <tr className="text-[11px] uppercase tracking-[0.14em] text-(--hq-dim)">
            <th className="px-2 pb-2 font-semibold">Post</th>
            <th className="px-2 pb-2 text-right font-semibold">Views</th>
            <th className="px-2 pb-2 text-right font-semibold">Likes</th>
            <th className="px-2 pb-2 text-right font-semibold">Saves</th>
            <th className="px-2 pb-2 text-right font-semibold">Shares</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((p, i) => (
            <tr key={p.title + i} className="border-t border-(--hq-line)">
              <td className="relative px-2 py-2.5">
                <span aria-hidden="true" className="absolute inset-y-1 left-0 rounded-md" style={{ width: `${(p.views / max) * 100}%`, background: "rgba(255,107,139,0.08)" }} />
                <span className="relative">
                  {p.url ? (
                    <a href={p.url} target="_blank" rel="noreferrer" className="hover:underline">
                      {p.title}
                    </a>
                  ) : (
                    p.title
                  )}
                  {p.posted && <span className="ml-2 text-[12px] text-(--hq-faint)">{fmt.day(p.posted)}</span>}
                </span>
              </td>
              <td className="px-2 text-right font-semibold tabular-nums">{fmt.compact(p.views)}</td>
              <td className="px-2 text-right tabular-nums text-(--hq-dim)">{p.likes == null ? "—" : fmt.compact(p.likes)}</td>
              <td className="px-2 text-right tabular-nums text-(--hq-dim)">{p.saves == null ? "—" : fmt.compact(p.saves)}</td>
              <td className="px-2 text-right tabular-nums text-(--hq-dim)">{p.shares == null ? "—" : fmt.compact(p.shares)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const inputCls = "min-h-11 w-full rounded-xl border border-(--hq-line) bg-black/40 px-3 text-[15px] text-(--hq-text) outline-none placeholder:text-(--hq-faint) focus:border-(--hq-gold)";
const num = (s: string) => (s.trim() === "" ? undefined : Math.max(0, Math.round(Number(s.replace(/[, ]/g, "").replace(/k$/i, "e3").replace(/m$/i, "e6"))) || 0));

// Typing numbers in by hand: one post per line as "title | views | likes | saves | shares"
function AddForm({ tiktok, last, done }: { tiktok: Load<TikTokData>; last?: TikTokSnapshot; done: () => void }) {
  const [day, setDay] = useState(new Date().toISOString().slice(0, 10));
  const [followers, setFollowers] = useState("");
  const [likes, setLikes] = useState("");
  const [lines, setLines] = useState(last ? last.posts.map((p) => [p.title, p.views, p.likes ?? "", p.saves ?? "", p.shares ?? ""].join(" | ")).join("\n") : "");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const save = async () => {
    const f = num(followers);
    if (f === undefined) return setError("Add the follower count.");
    const posts = lines
      .split("\n")
      .map((l) => l.split("|").map((x) => x.trim()))
      .filter((c) => c[0])
      .map(([title, views, l, saves, shares]) => ({ title, views: num(views ?? "") ?? 0, likes: num(l ?? ""), saves: num(saves ?? ""), shares: num(shares ?? "") }));
    setBusy(true);
    const err = await tiktok.send("POST", { day, followers: f, likes: num(likes), posts, note: "Typed in on HQ" });
    setBusy(false);
    if (err) return setError(err);
    done();
  };
  return (
    <Card className="mb-4">
      <CardTitle>Add a TikTok check</CardTitle>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="text-[12px] text-(--hq-dim)">
          Date
          <input type="date" value={day} onChange={(e) => setDay(e.target.value)} className={`${inputCls} mt-1`} />
        </label>
        <label className="text-[12px] text-(--hq-dim)">
          Followers
          <input inputMode="numeric" placeholder={last ? String(last.followers) : "1700"} value={followers} onChange={(e) => setFollowers(e.target.value)} className={`${inputCls} mt-1`} />
        </label>
        <label className="text-[12px] text-(--hq-dim)">
          Total likes (optional)
          <input inputMode="numeric" placeholder="52.4k" value={likes} onChange={(e) => setLikes(e.target.value)} className={`${inputCls} mt-1`} />
        </label>
      </div>
      <label className="mt-3 block text-[12px] text-(--hq-dim)">
        Posts, one per line: title | views | likes | saves | shares (you can write 12k or 1.2m)
        <textarea rows={6} value={lines} onChange={(e) => setLines(e.target.value)} className={`${inputCls} mt-1 py-2 font-mono text-[13px]`} placeholder="Hanuman mantra | 375k | 50.3k | 15.5k | 5.3k" />
      </label>
      {error && <p className="mt-2 text-[13px] text-(--hq-bad)">{error}</p>}
      <div className="mt-4 flex justify-end">
        <button type="button" disabled={busy} onClick={() => void save()} className="min-h-11 rounded-full bg-(--hq-gold) px-6 text-[14px] font-semibold text-black disabled:opacity-50">
          {busy ? "Saving…" : "Save"}
        </button>
      </div>
    </Card>
  );
}
