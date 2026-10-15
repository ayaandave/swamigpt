// Today's verse: a month of passages from across the library, one a day, each with a short
// reflection, a question to carry through the day, and a practice that fits it.
// Client-safe: only ids and words here; src/lib/daily.ts adds the passage text on the server.

export type DailyEntry = {
  id: string; // a passage id from the library
  reflection: string;
  question: string;
  practice: string; // a meditation slug, "mantra-<slug>", or a learning path slug
};

export const DAILY: DailyEntry[] = [
  {
    id: "gita-2-14",
    reflection:
      "Today will bring some heat and some cold, some pleasure and some pain. None of it stays. Can you meet it the way the earth meets the seasons?",
    question: "What is one small discomfort you can simply let pass today?",
    practice: "three-minute-reset",
  },
  {
    id: "gita-6-5",
    reflection: "You will speak to yourself many times today. Speak the way a good friend would.",
    question: "What would a kind friend tell you right now?",
    practice: "kindness-to-all",
  },
  {
    id: "gita-2-47",
    reflection:
      "Do the work in front of you as well as you can, and let the result go. The effort is yours. The outcome never fully was.",
    question: "What task today could you do with care, without worrying about how it turns out?",
    practice: "what-is-karma",
  },
  {
    id: "yoga-sutras-1-2",
    reflection:
      "Yoga is not first about the body. It is about a mind that settles, like a lake that goes still so you can see to the bottom.",
    question: "When today did your mind feel most still?",
    practice: "so-hum",
  },
  {
    id: "yoga-sutras-1-12",
    reflection: "Two things calm the mind: practice, again and again, and letting go. Neither works without the other.",
    question: "What could you practice today, and what could you let go of?",
    practice: "first-breath",
  },
  {
    id: "gita-6-35",
    reflection:
      "Even Arjuna, a great hero, said his mind was as hard to hold as the wind. Krishna didn't argue. He said: practice, and it will come.",
    question: "What pulls your mind away most often?",
    practice: "so-hum",
  },
  {
    id: "upanishads-katha-1-3-14",
    reflection: "Wake up. Not from sleep, but from going through the day without noticing it.",
    question: "What is one thing you will really notice today?",
    practice: "three-minute-reset",
  },
  {
    id: "upanishads-mundaka-3-1-1",
    reflection:
      "Two birds on one tree: one busy tasting every fruit, one calmly watching. Both are in you. Today, spend a moment as the one who watches.",
    question: "What would change if you watched your worries instead of tasting each one?",
    practice: "quiet-witness",
  },
  {
    id: "upanishads-isha-1",
    reflection: "Everything you see is held by something greater. Enjoy what you have, and don't grab for what is someone else's.",
    question: "What do you already have that you could enjoy more today?",
    practice: "quiet-witness",
  },
  {
    id: "upanishads-chandogya-6-8-7",
    reflection:
      "\"Thou art that.\" The deepest part of you is the same as the deepest part of everything. You are not as small as you sometimes feel.",
    question: "Where could you see yourself in someone else today?",
    practice: "quiet-witness",
  },
  {
    id: "gita-12-13",
    reflection: "Krishna names the kind of person he loves: one who wishes no one ill, and is friendly and kind to all.",
    question: "Who could you be a little kinder to today?",
    practice: "kindness-to-all",
  },
  {
    id: "gita-9-26",
    reflection: "A leaf, a flower, a fruit, a little water. What God wants is not something grand. It is your love.",
    question: "What small thing could you offer with love today?",
    practice: "mantra-om",
  },
  {
    id: "gita-2-20",
    reflection: "The real you was never born and will never die. Whatever today brings, that part of you is safe.",
    question: "What would you do differently if you felt truly safe inside?",
    practice: "before-sleep",
  },
  {
    id: "yoga-sutras-1-33",
    reflection:
      "Patanjali's advice for a calm mind: be friendly to the happy, kind to those who suffer, glad for the good, and let go of the rest.",
    question: "Whose good news could you be truly glad about today?",
    practice: "kindness-to-all",
  },
  {
    id: "yoga-sutras-2-46",
    reflection: "Steady and comfortable. That is how to sit, and maybe how to live too.",
    question: "Where in your day could you be steady without being stiff?",
    practice: "first-breath",
  },
  {
    id: "mahabharata-vidura-4-20",
    reflection:
      "Vidura says grief can wear us down if we let it rule us. Sadness is allowed. But we don't have to give it the whole day.",
    question: "What could you do today that gently lifts your spirits?",
    practice: "before-sleep",
  },
  {
    id: "mahabharata-yaksha-33",
    reflection:
      "The greatest wonder, Yudhishthira says, is that we live as if we will never die. Today is a gift. Don't spend it on grudges.",
    question: "If today really mattered, what would you make sure to do?",
    practice: "quiet-witness",
  },
  {
    id: "mahabharata-yaksha-15",
    reflection: "The best gain is health, and the best happiness is contentment. Neither can be bought.",
    question: "What are you content with right now, just as it is?",
    practice: "three-minute-reset",
  },
  {
    id: "mahabharata-yaksha-24",
    reflection: "Anger is called the enemy no one can defeat. The only way through it is to not feed it.",
    question: "When anger comes today, what could you do instead of feeding it?",
    practice: "three-minute-reset",
  },
  {
    id: "mahabharata-yaksha-17",
    reflection: "Let go of pride and people like you more. Let go of anger and you won't regret it. Let go of greed and you feel happy.",
    question: "Which one of these would help you most to let go of today?",
    practice: "kindness-to-all",
  },
  {
    id: "ramayana-ravana-6-111-8",
    reflection: "After the war, Rama said hatred should end. Holding a grudge only keeps the fight going inside you.",
    question: "Is there an old grudge you are ready to put down?",
    practice: "kindness-to-all",
  },
  {
    id: "ramayana-exile-2-19-2",
    reflection: "Rama gave up a kingdom so his father's word would be kept. Keeping your word is a quiet kind of strength.",
    question: "What promise can you keep today, even a small one?",
    practice: "ramayana-stories",
  },
  {
    id: "gita-5-10",
    reflection: "A lotus leaf sits in the water but stays dry. You can be in a messy situation without letting it soak into you.",
    question: "What situation could you be in today without letting it get into you?",
    practice: "so-hum",
  },
  {
    id: "gita-6-17",
    reflection: "Not too much, not too little: food, sleep, work and play. Balance itself is a kind of yoga.",
    question: "Where is your day out of balance, and what one change would help?",
    practice: "before-sleep",
  },
  {
    id: "gita-3-21",
    reflection: "People follow what others do, not what they say. Someone may be learning from you today without telling you.",
    question: "Who might be watching how you act today?",
    practice: "gita-18-days",
  },
  {
    id: "gita-2-56",
    reflection: "A steady person isn't shaken by pain or carried away by pleasure. That steadiness can be practiced.",
    question: "What usually shakes you? How could you meet it more steadily?",
    practice: "three-minute-reset",
  },
  {
    id: "upanishads-taittiriya-3-6-1",
    reflection: "The Upanishad says all beings come from joy, live in joy and return to joy. Joy is not a reward. It is where we come from.",
    question: "Where did you feel joy today, even for a moment?",
    practice: "mantra-peace",
  },
  {
    id: "mahabharata-vidura-1-4",
    reflection: "Vidura says a wise person isn't pulled off course by anger, joy, pride or vanity. Wisdom is staying on your path.",
    question: "What pulls you off your path most easily?",
    practice: "quiet-witness",
  },
  {
    id: "gita-6-26",
    reflection: "However often the mind wanders, bring it back. Each time you bring it back is the practice, not a failure.",
    question: "How many times can you gently bring your mind back today?",
    practice: "first-breath",
  },
  {
    id: "vivekananda-karma-yoga-2-32",
    reflection: "Vivekananda's favorite word from the old books: fearlessness. Do what is right, even when others laugh.",
    question: "What would you do today if you weren't afraid of what people think?",
    practice: "mantra-gayatri",
  },
  {
    id: "vivekananda-raja-yoga-1-12",
    reflection: "There is no limit to what a focused mind can do. Focus is like light gathered into one bright beam.",
    question: "What deserves your full attention today?",
    practice: "so-hum",
  },
];

// The same entry all day, wherever you are: counted by local calendar day
export function dailyIndex(date = new Date()) {
  const local = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.floor(local / 86_400_000) % DAILY.length;
}
