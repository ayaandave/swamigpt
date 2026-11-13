// Suggested questions, shaped by what brought someone here (the welcome screens) and the time of
// day: in the evening, rest and worry come first. Each one is specific, the way a person would
// actually ask, never vague like "inspire me". Tapping one fills the box; it is never sent for them.
import type { Focus } from "./settings";

const BY_FOCUS: Record<Focus, string[]> = {
  stress: [
    "I'm stressed about a test",
    "I feel overwhelmed by everything I have to do",
    "How do I stop worrying about things I can't control?",
    "I'm anxious about a big decision",
  ],
  school: [
    "I'm stressed about college applications",
    "How do I find what I'm passionate about?",
    "I'm afraid of disappointing my parents",
    "How do I stay focused when I study?",
  ],
  relationships: [
    "I had a fight with someone I love",
    "How do I forgive someone who hurt me?",
    "I feel lonely even around people",
    "How do I deal with jealousy?",
  ],
  faith: [
    "How do I start a simple daily practice?",
    "How can I feel closer to God?",
    "What does the Gita say about duty?",
    "How do I pray when I don't know what to say?",
  ],
  curious: [
    "What is karma, really?",
    "Who is Krishna?",
    "What is the Bhagavad Gita about?",
    "What does Om mean?",
  ],
};

const EVENING = ["I can't stop overthinking at night", "I can't sleep because I'm worried"];
const GENERAL = ["I'm stressed about a test", "What is karma?", "How do I find my passion?", "I had a fight with my parents"];

// Three questions for right now. `seed` turns the list a little each time, so they refresh after each answer.
export function suggestedQuestions(focus: Focus | null, hour = new Date().getHours(), seed = 0): string[] {
  const base = focus ? BY_FOCUS[focus] : GENERAL;
  const rotated = [...base.slice(seed % base.length), ...base.slice(0, seed % base.length)];
  const evening = hour >= 20 || hour < 4;
  const list = evening && focus !== "curious" ? [EVENING[seed % EVENING.length], ...rotated] : rotated;
  return [...new Set(list)].slice(0, 3);
}

// Follow-ups under an answer: short next steps so nobody has to type much on a phone
export function followUps({ hasVerse, hasPractice }: { hasVerse: boolean; hasPractice: boolean }): string[] {
  return [
    hasVerse ? "What does this verse mean, word by word?" : "Can you say more about that?",
    hasPractice ? "How do I make this a daily habit?" : "Give me a 3-minute practice for this",
    "What can I do about this today?",
  ];
}

// Today's meditation on the home screen: the evening winds down; otherwise it fits the time they
// said they have and what brought them here
export function todaysMeditation(
  focus: Focus | null,
  minutes: 1 | 5 | 10 | null,
  hour = new Date().getHours(),
): string {
  if (hour >= 20 || hour < 4) return "before-sleep";
  if (minutes === 10) return focus === "relationships" ? "kindness-to-all" : "so-hum";
  if (minutes === 5) return focus === "relationships" ? "kindness-to-all" : "first-breath";
  return "three-minute-reset";
}
