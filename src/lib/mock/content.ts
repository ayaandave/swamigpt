// MOCK daily verses. Learning paths live in lib/lessons.ts, meditations in lib/meditations.ts.
import { VERSES, type Verse } from "./verses";

export type Daily = { date: string; verse: Verse; reflection: string; question: string };

const DAILY_ROTATION: Omit<Daily, "date">[] = [
  {
    verse: VERSES["gita-2-14"],
    reflection:
      "Today will bring some heat and some cold, some pleasure and some pain. None of it is permanent. Can you meet it the way the earth meets the seasons?",
    question: "What is one small discomfort you can simply let pass today?",
  },
  {
    verse: VERSES["gita-6-5"],
    reflection:
      "You will speak to yourself many times today. Speak the way a good friend would.",
    question: "What would a kind friend tell you right now?",
  },
  {
    verse: VERSES["brihad-1-3-28"],
    reflection:
      "Three short lines that have been chanted for thousands of years. Say them slowly once, before you begin your day.",
    question: "Where in your life would you like a little more light?",
  },
];

export function getDaily(date = new Date()): Daily {
  const day = Math.floor(date.getTime() / 86_400_000);
  return { date: date.toISOString().slice(0, 10), ...DAILY_ROTATION[day % DAILY_ROTATION.length] };
}
