// MOCK meditations and daily verses. Learning paths now live in lib/lessons.ts.
import { VERSES, type Verse } from "./verses";

export type Meditation = {
  slug: string;
  title: string;
  minutes: number;
  description: string;
  breathSeconds: number; // one full in + out cycle
  script: string[]; // lines the voice speaks, spaced across the session
};

export const SOUNDS = [
  { id: "silence", name: "Silence" },
  { id: "tanpura", name: "Tanpura drone" },
  { id: "rain", name: "Monsoon rain" },
  { id: "bells", name: "Temple bells" },
] as const;

export const MEDITATIONS: Meditation[] = [
  {
    slug: "first-breath",
    title: "Your first breath",
    minutes: 5,
    description: "For anyone who has never meditated. Just breathing, nothing more.",
    breathSeconds: 10,
    script: [
      "Sit comfortably. Let your hands rest.",
      "Breathe in slowly through the nose. And let it go.",
      "If a thought comes, that is fine. Return to the breath.",
      "You are doing it. This is meditation.",
    ],
  },
  {
    slug: "so-hum",
    title: "So hum",
    minutes: 10,
    description: "Hear 'so' as you breathe in and 'hum' as you breathe out. I am that.",
    breathSeconds: 12,
    script: [
      "Close your eyes if you wish.",
      "As you breathe in, silently hear the sound: so.",
      "As you breathe out, hear: hum.",
      "So hum. I am that. Rest in it.",
    ],
  },
  {
    slug: "witness",
    title: "The quiet witness",
    minutes: 20,
    description: "Watch thoughts pass like clouds, from the stillness that sees them.",
    breathSeconds: 14,
    script: [
      "Let the body become still.",
      "Notice the thoughts that come. Do not follow them.",
      "Who is it that notices? Rest as that.",
      "The sky does not hold on to clouds.",
    ],
  },
  {
    slug: "sleep",
    title: "Before sleep",
    minutes: 10,
    description: "Lay down the day, one part of the body at a time.",
    breathSeconds: 12,
    script: [
      "Lie down and let the floor hold you.",
      "Soften the feet. Soften the legs.",
      "Let the shoulders fall away from the ears.",
      "The day is done. You can rest now.",
    ],
  },
];

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
