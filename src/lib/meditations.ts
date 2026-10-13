// Guided meditations. Each cue is spoken at a set second of the session: often at the start,
// while people settle, then with longer quiet stretches. Written so a 12-year-old can follow.

export type Cue = { at: number; text: string };

export type Meditation = {
  slug: string;
  title: string;
  minutes: number;
  group: "quick" | "daily" | "sleep";
  description: string;
  cues: Cue[];
  closing?: string; // spoken at the end, after the bell
  quietEnd?: boolean; // for sleep: no bell or closing words to wake anyone
};

export const SOUNDS = [
  { id: "silence", name: "Silence" },
  { id: "tanpura", name: "Tanpura drone" },
  { id: "rain", name: "Monsoon rain" },
  { id: "bells", name: "Temple bells" },
] as const;

export const GROUPS = [
  { id: "quick", title: "Quick calm", note: "When you need it right now" },
  { id: "daily", title: "Daily practice", note: "A few minutes every day" },
  { id: "sleep", title: "Sleep", note: "Lie down and let the day go" },
] as const;

export const MEDITATIONS: Meditation[] = [
  {
    slug: "three-minute-reset",
    title: "Three-minute reset",
    minutes: 3,
    group: "quick",
    description: "For stress, before a test, or after an argument. Slow down in three minutes.",
    cues: [
      { at: 0, text: "Wherever you are, stop for a moment. You don't need to go anywhere. Let your shoulders drop." },
      { at: 15, text: "Breathe in slowly through your nose, for a count of four. Now breathe out, even slower." },
      { at: 35, text: "Again. In, two, three, four. And out, slowly, all the way." },
      { at: 55, text: "Notice your feet on the ground. Feel how solid the floor is beneath you." },
      { at: 80, text: "If your mind is racing, that's okay. You don't have to fix anything right now. Just breathe." },
      { at: 105, text: "Breathe in calm. Breathe out the worry. Let each breath out be a little longer than the breath in." },
      { at: 135, text: "Feel your hands. Unclench them if they're tight. Let your jaw soften." },
      { at: 160, text: "One more slow breath in. And let it go." },
    ],
    closing: "You are calmer than you were three minutes ago. Take this steadiness with you.",
  },
  {
    slug: "first-breath",
    title: "Your first breath",
    minutes: 5,
    group: "daily",
    description: "For anyone who has never meditated. Just breathing, nothing more.",
    cues: [
      { at: 0, text: "Welcome. Sit comfortably, on a chair or on the floor. Let your hands rest in your lap." },
      { at: 20, text: "Close your eyes if you like, or let your eyes rest softly on the floor in front of you." },
      { at: 40, text: "Now notice your breath. Don't change it. Just feel the air coming in, and going out." },
      { at: 70, text: "Feel the breath at the tip of your nose. Cool as it comes in. Warm as it goes out." },
      {
        at: 100,
        text: "Your mind will wander. That's normal. It happens to everyone. When you notice, gently come back to the breath.",
      },
      { at: 140, text: "Breathing in, just know you're breathing in. Breathing out, just know you're breathing out." },
      { at: 180, text: "If you got lost in a thought, that's fine. Coming back is the practice." },
      { at: 220, text: "Notice how your body feels now. Maybe a little heavier. A little softer." },
      { at: 255, text: "Stay with a few more breaths, in your own time." },
      { at: 285, text: "In a moment, we'll finish. Take one deep breath in, and let it go." },
    ],
    closing: "You did it. This is meditation. Just this, a few minutes a day.",
  },
  {
    slug: "kindness-to-all",
    title: "Kindness to all",
    minutes: 8,
    group: "daily",
    description: "Maitri, friendliness: wishing well to yourself, your family and everyone, even difficult people.",
    cues: [
      {
        at: 0,
        text: "Sit comfortably and close your eyes. This practice is called Maitri, which means friendliness. Patanjali, the teacher of the Yoga Sutras, said friendliness makes the mind calm and clear.",
      },
      { at: 30, text: "Take three slow breaths. Let your face soften into a small smile." },
      { at: 60, text: "First, think of yourself. Silently say: May I be happy. May I be healthy. May I be peaceful." },
      {
        at: 95,
        text: "If it feels strange to wish yourself well, that's okay. Say it gently anyway. May I be happy. May I be peaceful.",
      },
      { at: 135, text: "Now picture someone you love easily. A parent, a grandparent, a friend, a pet. See their face." },
      { at: 160, text: "Wish them well. May you be happy. May you be healthy. May you be peaceful." },
      { at: 205, text: "Now think of someone you hardly know. A neighbor, a classmate, the person at the store." },
      { at: 230, text: "They want to be happy too, just like you. May you be happy. May you be peaceful." },
      { at: 275, text: "Now, if you can, think of someone who is difficult for you. Start with someone only a little difficult." },
      { at: 300, text: "Underneath it all, they want to be happy too. Gently say: May you be happy. May you find peace." },
      { at: 350, text: "If this is hard, go back to wishing yourself well. There is no rush." },
      {
        at: 385,
        text: "Now let your kindness spread out to everyone, everywhere. May all beings be happy. May all beings be free from suffering.",
      },
      { at: 435, text: "Sit quietly. Feel the warmth this leaves in your heart." },
      { at: 465, text: "Take one slow breath, and gently open your eyes." },
    ],
    closing: "In Sanskrit, we say: Lokah samastah sukhino bhavantu. May all beings everywhere be happy. Om shanti.",
  },
  {
    slug: "so-hum",
    title: "So Hum",
    minutes: 10,
    group: "daily",
    description: "Hear 'so' as you breathe in and 'hum' as you breathe out. It means: I am That.",
    cues: [
      { at: 0, text: "Sit comfortably with your back tall but relaxed. Close your eyes." },
      { at: 20, text: "Take a few slow, natural breaths. Let your body settle." },
      { at: 45, text: "This practice uses two sounds that match the breath. So, on the breath in. Hum, on the breath out." },
      { at: 75, text: "Breathing in, silently hear: so. Breathing out, silently hear: hum." },
      { at: 105, text: "Don't force the breath. Let it be slow and natural. The sounds simply ride along with it." },
      { at: 140, text: "So hum means: I am That. I am part of something much bigger than my worries." },
      { at: 180, text: "When thoughts come, let them pass. Gently return to: so... hum." },
      { at: 240, text: "So... hum." },
      { at: 300, text: "You are halfway. Keep resting in the sound and the breath." },
      { at: 380, text: "If your mind has wandered, smile, and come back. So... hum." },
      {
        at: 460,
        text: "Let the sounds grow quieter and quieter, until there is just the breath, and stillness.",
      },
      { at: 540, text: "Rest in the quiet for these last moments." },
      { at: 585, text: "Slowly let the practice go. Notice how you feel." },
    ],
    closing: "So hum. I am That. Carry this peace into your day.",
  },
  {
    slug: "before-sleep",
    title: "Before sleep",
    minutes: 10,
    group: "sleep",
    description: "Lie down and let the day go, one part of the body at a time.",
    cues: [
      {
        at: 0,
        text: "Lie down on your back and let your arms rest by your sides. Let the bed hold all of your weight.",
      },
      { at: 25, text: "Take a slow breath in, and a long sigh out. Let the day begin to fall away." },
      { at: 55, text: "Bring your attention to your feet. Let them soften and grow heavy." },
      { at: 85, text: "Now your legs. Your calves, your knees, your thighs. Heavy, and warm, and relaxed." },
      { at: 120, text: "Your hips and your lower back. Let them sink into the bed." },
      { at: 155, text: "Your belly rises and falls with each breath. Nothing to do. Nothing to fix." },
      { at: 190, text: "Your chest, and your heart. Let them soften." },
      { at: 225, text: "Now your hands and arms. Let your fingers uncurl. Your arms are heavy and still." },
      { at: 265, text: "Your shoulders. Let them drop down, away from your ears." },
      { at: 300, text: "Your neck, your jaw, your cheeks. Let your tongue rest. Let your forehead go smooth." },
      { at: 345, text: "Your whole body is resting now, from your head to your toes." },
      {
        at: 390,
        text: "If a thought about today or tomorrow comes, let it float away, like a leaf on a river.",
      },
      { at: 450, text: "The day is done. You did what you could. That is enough." },
      { at: 510, text: "Let your breath become slow and easy, all by itself." },
      { at: 570, text: "Sleep well." },
    ],
    quietEnd: true,
  },
  {
    slug: "quiet-witness",
    title: "The quiet witness",
    minutes: 15,
    group: "daily",
    description: "Watch thoughts pass like clouds, from the stillness that sees them.",
    cues: [
      { at: 0, text: "Sit comfortably, upright and relaxed. Close your eyes, and take a few slow breaths." },
      { at: 25, text: "For the first few minutes, simply rest your attention on the breath." },
      { at: 60, text: "Breathing in. Breathing out. Nothing to do but this." },
      {
        at: 110,
        text: "Now notice that thoughts come by themselves. A memory. A plan. A worry. You didn't ask for them. They just appear.",
      },
      {
        at: 155,
        text: "Don't follow the thoughts, and don't fight them. Just watch them, the way you'd watch cars passing from a window.",
      },
      { at: 205, text: "Thoughts come and go. Feelings come and go. Sounds come and go." },
      { at: 260, text: "Now gently ask yourself: who is noticing all this?" },
      {
        at: 300,
        text: "There is a part of you that quietly watches. It does not come and go. In Sanskrit, it is called the sakshi, the witness.",
      },
      { at: 360, text: "Rest as the one who is watching. Calm, like the sky behind the clouds." },
      {
        at: 450,
        text: "If you get carried away by a thought, that's alright. The moment you notice, you are the witness again.",
      },
      { at: 540, text: "The sky does not hold on to the clouds. And the clouds do not harm the sky." },
      { at: 640, text: "Rest in this quiet awareness." },
      { at: 750, text: "Just being. Just watching. Nothing to fix." },
      { at: 840, text: "Slowly bring your attention back to your breath, and to your body sitting here." },
      { at: 875, text: "Wiggle your fingers. And when you're ready, open your eyes." },
    ],
    closing: "You are the sky, not the weather. Take this calm with you.",
  },
];

export const getMeditation = (slug: string) => MEDITATIONS.find((m) => m.slug === slug);
