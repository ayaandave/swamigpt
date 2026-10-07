// MOCK meditations, learning paths and daily verses. Phase 6 writes the real content.
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

export type Lesson = { title: string; body: string[]; verseId?: string; reflect: string };
export type LearningPath = {
  slug: string;
  title: string;
  description: string;
  forWhom: string;
  lessons: Lesson[];
  totalLessons: number;
};

export const PATHS: LearningPath[] = [
  {
    slug: "gita-18-days",
    title: "The Gita in 18 days",
    description: "One chapter a day. The great conversation on a battlefield, made simple.",
    forWhom: "Anyone, no background needed",
    totalLessons: 18,
    lessons: [
      {
        title: "Arjuna's despair",
        body: [
          "The Gita begins not with wisdom but with a man falling apart. Arjuna, the greatest archer of his age, looks across the battlefield and sees his teachers, cousins and friends. His bow slips from his hand.",
          "This is where the teaching starts: with honest confusion. You do not need to have it together to begin.",
        ],
        reflect: "When did you last feel stuck between two duties?",
      },
      {
        title: "The Self that never dies",
        body: [
          "Krishna's first answer is surprising. Before talking about what to do, he talks about who you are: a Self that is never born and never dies.",
          "Everything else in the Gita rests on this. If you are more than the body, fear begins to lose its grip.",
        ],
        verseId: "gita-2-20",
        reflect: "What part of you has stayed the same since childhood?",
      },
    ],
  },
  {
    slug: "what-is-karma",
    title: "What is karma?",
    description: "Not fate, not punishment. A clearer way to understand action and consequence.",
    forWhom: "Great for students",
    totalLessons: 5,
    lessons: [
      {
        title: "Karma means action",
        body: [
          "The word karma simply means action. Every action leaves a trace, like a footprint in wet sand.",
          "Karma is not a cosmic scorecard. It is closer to a law of nature: what we do shapes who we become.",
        ],
        verseId: "gita-2-47",
        reflect: "Which of your daily habits is shaping you the most?",
      },
    ],
  },
  {
    slug: "yoga-philosophy",
    title: "Yoga beyond the mat",
    description: "The eight limbs of Patanjali, and why posture is only one of them.",
    forWhom: "For anyone who does yoga",
    totalLessons: 8,
    lessons: [
      {
        title: "What yoga really means",
        body: [
          "Patanjali's definition of yoga does not mention stretching at all. Yoga, he says, is the stilling of the mind.",
          "The postures prepare the body to sit still, so the mind can follow.",
        ],
        verseId: "ys-1-2",
        reflect: "When does your mind feel most still?",
      },
    ],
  },
  {
    slug: "ramayana-stories",
    title: "Stories from the Ramayana",
    description: "Rama, Sita and Hanuman, told slowly, the way grandparents tell them.",
    forWhom: "Lovely to listen to together",
    totalLessons: 7,
    lessons: [
      {
        title: "A prince leaves home",
        body: [
          "On the morning he was to be crowned, Rama was told he must leave for the forest for fourteen years. He did not argue. He bowed to his father and went.",
          "Sita would not stay behind, and his brother Lakshmana would not either. So three people walked out of the city, and the whole city wept.",
        ],
        reflect: "What would you give up to keep your word?",
      },
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
