import { describe, expect, it } from "vitest";
import { countStreak } from "../src/lib/practice";
import { followUps, suggestedQuestions, todaysMeditation } from "../src/lib/suggestions";
import { MEDITATIONS } from "../src/lib/meditations";

// days: which days ago had practice (0 = today)
const streak = (...days: number[]) => countStreak((i) => days.includes(i));

describe("streak with one grace day a week", () => {
  it("counts days in a row", () => expect(streak(0, 1, 2)).toBe(3));
  it("is still alive before today's practice", () => expect(streak(1, 2)).toBe(2));
  it("forgives one missed day", () => expect(streak(0, 2, 3)).toBe(3));
  it("forgives a missed yesterday before today's practice", () => expect(streak(2, 3)).toBe(2));
  it("does not forgive two missed days in a row", () => expect(streak(0, 3, 4)).toBe(1));
  it("forgives only one miss a week", () => expect(streak(0, 2, 4, 5)).toBe(2));
  it("forgives again after a week", () => expect(streak(0, 2, 3, 4, 5, 6, 7, 8, 9, 11)).toBe(10));
  it("is zero with nothing", () => expect(streak()).toBe(0));
});

describe("suggestions", () => {
  it("gives three specific questions", () => {
    for (const focus of [null, "stress", "school", "relationships", "faith", "curious"] as const) {
      const qs = suggestedQuestions(focus, 10);
      expect(qs).toHaveLength(3);
      expect(new Set(qs).size).toBe(3);
    }
  });
  it("puts rest first in the evening", () => expect(suggestedQuestions("stress", 22)[0]).toMatch(/night|sleep/));
  it("changes after an answer", () => expect(suggestedQuestions("faith", 10, 1)).not.toEqual(suggestedQuestions("faith", 10, 0)));
  it("has three follow-ups", () => expect(followUps({ hasVerse: true, hasPractice: false })).toHaveLength(3));
  it("picks a real meditation", () => {
    for (const m of [null, 1, 5, 10] as const)
      for (const h of [8, 22]) expect(MEDITATIONS.some((x) => x.slug === todaysMeditation("relationships", m, h))).toBe(true);
  });
});
