import { beforeAll, describe, expect, it } from "vitest";

beforeAll(() => {
  process.env.SUPABASE_SECRET_KEY = "test-secret";
});

describe("emails", async () => {
  const { unsubToken, validUnsubToken, unsubUrl, todaysVerse, welcomeEmail, weeklyEmail, missYouEmail } = await import("@/lib/email");
  const id = "11111111-1111-4111-8111-111111111111";

  it("unsubscribe links only work for the account they were made for", () => {
    const t = unsubToken(id);
    expect(validUnsubToken(id, t)).toBe(true);
    expect(validUnsubToken("22222222-2222-4222-8222-222222222222", t)).toBe(false);
    expect(validUnsubToken(id, t.slice(0, -1) + (t.endsWith("A") ? "B" : "A"))).toBe(false);
    expect(validUnsubToken(id, "")).toBe(false);
    expect(unsubUrl(id)).toContain(`u=${id}&t=${t}`);
  });

  it("picks the same verse all day in California", () => {
    const morning = todaysVerse(new Date("2026-10-18T08:00:00-07:00"));
    const night = todaysVerse(new Date("2026-10-18T23:30:00-07:00"));
    expect(morning.verse.id).toBe(night.verse.id);
  });

  it("builds each email with a real verse, plain text, and an unsubscribe link where needed", () => {
    const d = todaysVerse();
    for (const e of [welcomeEmail(d), weeklyEmail(d, id), missYouEmail(d, id)]) {
      expect(e.subject.length).toBeGreaterThan(5);
      expect(e.html).toContain(d.verse.translation.trim().slice(0, 20).replace(/&/g, "&amp;").replace(/</g, "&lt;"));
      expect(e.text).toContain("swamigpt.com");
      expect(e.html).not.toMatch(/undefined|null/);
    }
    expect(weeklyEmail(d, id).html).toContain(unsubToken(id));
    expect(missYouEmail(d, id).text).toContain("Unsubscribe");
    expect(welcomeEmail(d).html).not.toContain("unsubscribe?");
  });
});
