// MOCK Swami answers. Phase 3 replaces this with Claude + scripture search,
// using the persona in lib/swami-prompt.ts. These follow the same shape:
// practical help for the real situation first, then a verse and what it means for them.
import type { Depth } from "../settings";
import { CRISIS, CRISIS_HELP, type SwamiAnswer } from "../swami";
import { VERSES } from "./verses";

export type { SwamiAnswer };

type Ctx = { subject: string };
type Entry = {
  match: RegExp;
  simpler: (c: Ctx) => string[];
  deeper: (c: Ctx) => string[];
  verses: { id: string; meaning: string }[];
  help?: SwamiAnswer["help"];
  practice?: SwamiAnswer["practice"];
};

const TALK = { text: "Talking to someone helps", href: "tel:988", label: "Call or text 988" };

const ENTRIES: Entry[] = [
  // School, tests, grades
  {
    match: /test|exam|quiz|final|midterm|grade|homework|school|class|study|college|sat\b|act\b/i,
    simpler: ({ subject }) => [
      `First, breathe. Being stressed about ${subject} means you care, and that's a good thing. But stress won't help you on the day; a clear head will.`,
      "Try this: ask your mom or dad what score they got on a test when they were in high school. Most of them won't remember. It felt huge to them back then too, and life went on. This test matters, but it won't decide who you become.",
      `Tonight, don't try to cover everything. Pick the two topics you feel shakiest on and work through practice problems instead of re-reading notes${
        /computer|coding|programming|\bcs\b/i.test(subject) ? "; code sticks when your hands type it, not when your eyes read it" : ""
      }. Then stop and sleep. A rested brain solves problems faster than a tired one.`,
      "In the test, take three slow breaths before you start. Then just do the next question. Then the next.",
    ],
    deeper: ({ subject }) => [
      `Stress about ${subject} is your mind running ahead to a result that hasn't happened yet. That's very human, and it's also where most of the anxiety lives.`,
      "Ask your parents what they scored on their high-school tests; most won't remember. The score feels permanent now, but what lasts is the habit of preparing well and staying steady under pressure.",
      "So split it in two: the preparation is yours to control, completely. The score is not. Put your full effort into the first, and consciously set the second down.",
    ],
    verses: [
      {
        id: "gita-2-47",
        meaning:
          "For you, this means: your job is the studying and the effort. The score isn't in your hands, so put it down and focus on the next question.",
      },
    ],
    practice: {
      href: "/meditate/first-breath",
      title: "Your first breath",
      why: "Five slow minutes before you study tonight calms the panic, so the practice problems actually stick.",
    },
  },
  // Work, job, career
  {
    match: /work|job|boss|career|interview|promotion|office|deadline|laid off|fired/i,
    simpler: () => [
      "Work stress can follow you home and sit at the dinner table. Let's make it a little lighter.",
      "Write down the three things that are actually in your control this week, and the things that aren't, like your boss's mood or the company's decisions. Most of the worry usually lives in the second list.",
      "Give the first list your best. For the second list, take one slow breath and say, \"That's not mine to carry today.\"",
    ],
    deeper: () => [
      "Much of work stress comes from tying our sense of worth to outcomes we can't fully control: reviews, promotions, other people's choices.",
      "The Gita's idea of karma yoga is very practical here. Do your work with full skill and care, then let go of the result. Not because results don't matter, but because gripping them makes the work worse and the worker unhappy.",
    ],
    verses: [
      {
        id: "gita-2-47",
        meaning: "For you, this means: do your part well, and let the parts that aren't yours be someone else's to carry.",
      },
    ],
  },
  // Family and parents
  {
    match: /parent|mom|dad|mother|father|family|sibling|brother|sister|fight|argu/i,
    simpler: () => [
      "Arguments with family hurt more than arguments with anyone else, because we love them.",
      "When things are calmer, try saying one sentence that starts with \"I feel…\" instead of \"You always…\". It's much harder for someone to argue with how you feel.",
      "And remember: they are probably also lying awake thinking about it.",
    ],
    deeper: () => [
      "Family conflict is hard because we can't simply walk away; the relationship continues tomorrow.",
      "The teachings ask us to be steady inside even when others aren't. Steadiness doesn't mean giving in. It means responding instead of reacting, so that what you say tomorrow is what you actually mean.",
    ],
    verses: [
      {
        id: "gita-6-5",
        meaning: "For you, this means: you can't control how they react, but you can be on your own side and choose how you respond.",
      },
    ],
  },
  // Sadness, loneliness
  {
    match: /sad|depress|hopeless|worthless|lonely|alone|hate myself|no friends/i,
    simpler: () => [
      "Thank you for telling me. What you feel is real, and it matters.",
      "Today, being kind to yourself might just mean texting one person you trust, even only to say \"rough day\". You don't have to explain everything.",
      "If this feeling has been with you for a while, please talk to a parent, a teacher, a doctor or a counsellor. Asking for help is strength, not weakness.",
    ],
    deeper: () => [
      "Heavy feelings can make it seem like no one would understand. Usually, more people would than we think.",
      "Spiritual practice and professional care work together, not against each other. Please talk with someone you trust or a counsellor, especially if this has lasted more than a couple of weeks.",
    ],
    verses: [
      {
        id: "gita-6-5",
        meaning: "For you, this means: be a friend to yourself today, and let others be friends to you too.",
      },
    ],
    help: TALK,
  },
  // Grief and death
  {
    match: /death|died|dying|grief|loss|lost (my|a)|passed away|funeral|soul/i,
    simpler: () => [
      "I'm so sorry. Grief is the shape love takes when someone is gone. It isn't something to fix or rush.",
      "Let yourself remember them out loud: tell a story about them to someone, or write one down. Remembering together helps.",
      "Many people find comfort in the old Hindu teaching that the deepest part of a person, the soul, is never born and never dies.",
    ],
    deeper: () => [
      "I'm sorry for your loss. Grief doesn't follow a schedule, and there's no right way to do it.",
      "Hindu thought teaches that the Self, the atman, is not the body. Schools differ on the details: Advaita sees the Self as one with Brahman, the ultimate reality, while Dvaita and Vishishtadvaita see each soul as eternal and continuing its journey in relation to God. All agree the Self does not perish.",
    ],
    verses: [
      {
        id: "gita-2-20",
        meaning: "For you, this means: the person you loved was more than their body, and that part of them is not gone.",
      },
    ],
  },
  // Restless mind, anxiety, sleep
  {
    match: /mind|focus|restless|overthink|thought|anxious|anxiety|calm|stress|sleep|worr/i,
    simpler: () => [
      "A busy mind is not a broken mind. Everybody's mind wanders; even people who meditate every day.",
      "Try this right now: breathe in for four counts, and out for six. Do it five times. The longer out-breath tells your body it's safe to slow down.",
      "When a thought pulls you away, don't scold yourself. Just come back to the breath. Coming back is the practice.",
    ],
    deeper: () => [
      "The restless mind is one of the oldest problems in the yoga tradition. Patanjali defines yoga itself as the stilling of the mind's movements, called vrittis.",
      "The method is two things together: steady practice over time (abhyasa), and gently loosening your grip on what pulls you (vairagya). A few minutes daily does more than an hour once a week.",
    ],
    verses: [
      {
        id: "gita-6-35",
        meaning: "For you, this means: a restless mind is normal, and it gets calmer with small, regular practice.",
      },
    ],
  },
  // Retirement, ageing, purpose
  {
    match: /retire|old age|getting old|ageing|aging|purpose|meaning|bored|what now/i,
    simpler: () => [
      "Many people feel a little lost after a big chapter ends, whether it's work, raising children, or something else. That's natural.",
      "In the Hindu view of life, this later stage has its own purpose: sharing what you've learned, and turning a little more toward the inner life.",
      "Who in your family could you teach something to this week? A recipe, a story, a prayer. That's a real gift.",
    ],
    deeper: () => [
      "The traditional Hindu stages of life (ashramas) see later life as a time of gradually stepping back from worldly duties toward reflection and service.",
      "That doesn't mean withdrawing from the people you love. It means holding things more lightly, and giving more of your time to what lasts.",
    ],
    verses: [
      {
        id: "isha-1",
        meaning: "For you, this means: enjoy this life fully, while holding it lightly.",
      },
    ],
  },
  // Big questions
  {
    match: /god|brahman|who am i|self|atman|truth|real|hindu|religion/i,
    simpler: () => [
      "That's one of the oldest questions people have ever asked, and you don't need to be Hindu to explore it.",
      "Hinduism has many names and forms for God, and many paths to the same truth. One idea runs through much of it: the divine is not far away. It's in everything, including you.",
    ],
    deeper: () => [
      "The Upanishads ask: what is the relationship between Brahman, the reality behind everything, and your own Self?",
      "Different schools answer differently. Advaita says they are one. Vishishtadvaita says the soul is part of Brahman, like a ray of the sun. Dvaita says soul and God are eternally distinct, joined by love. The texts invite you to explore, not just believe.",
    ],
    verses: [
      {
        id: "isha-1",
        meaning: "For you, this means: look for the sacred in ordinary things, starting with the people around you.",
      },
    ],
  },
];

const FALLBACK: Entry = {
  match: /.*/,
  simpler: () => [
    "Thank you for asking. Could you tell me a little more about what's going on? For example, is this about school, work, family or something else?",
    "This preview only has a few sample answers. Once SwamiGPT is connected to the full library, it will be able to answer much more.",
  ],
  deeper: () => [
    "Tell me a bit more about the situation and I can give a more useful answer.",
    "This preview has a small set of sample teachings. The full version searches the Gita, Upanishads, Yoga Sutras, epics and Swami Vivekananda's works.",
  ],
  verses: [
    {
      id: "brihad-1-3-28",
      meaning: "A prayer for anyone looking for answers: help me see clearly.",
    },
  ],
};

const SUBJECTS =
  /(computer science|\bcs\b|coding|programming|math|maths|algebra|calculus|physics|chemistry|biology|history|english|spanish|french|economics|science)/i;

export async function askSwami(question: string, depth: Depth): Promise<SwamiAnswer> {
  // Simulated thinking time so the flame animation can be judged
  await new Promise((r) => setTimeout(r, 1600));

  if (CRISIS.test(question)) {
    return {
      paragraphs: [
        "I'm really glad you said this out loud. You matter, and you deserve care from a real person right now.",
        "Please call or text 988 (in the US) to reach someone who can listen any time, day or night. If you're outside the US, contact your local emergency number. I'm an AI, and I'll be here after you've spoken with them.",
      ],
      verses: [],
      help: CRISIS_HELP,
    };
  }

  const found = question.match(SUBJECTS)?.[1];
  const subject = found ? `your ${/^cs$/i.test(found) ? "computer science" : found.toLowerCase()} test` : "this test";
  const entry = ENTRIES.find((e) => e.match.test(question)) ?? FALLBACK;

  return {
    paragraphs: (depth === "deeper" ? entry.deeper : entry.simpler)({ subject }),
    verses: entry.verses.map((v) => ({ verse: VERSES[v.id], meaning: v.meaning })),
    help: entry.help,
    practice: entry.practice,
  };
}

export const STARTER_QUESTIONS = [
  "I'm stressed about my computer science test",
  "I can't stop overthinking at night",
  "I had a fight with my parents",
  "I just retired and feel a bit lost",
];
