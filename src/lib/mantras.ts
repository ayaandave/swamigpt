// Four mantras to say or think, each with its Sanskrit, how to say it, and what it means.
// The Sanskrit was checked against the source texts on Sanskrit Wikisource (Rig Veda 3.62.10 and
// 7.59.12; the Isha, Katha and Brihadaranyaka Upanishads). Meanings are our own plain English,
// written so a 12-year-old can follow; where the library has the passage, we link to it.

export type MantraLine = { sa: string; tr: string };

export type MantraPart = {
  name?: string; // only when a mantra page has several, like the peace chants
  lines: MantraLine[];
  words: [string, string][]; // transliterated word, its meaning
  meaning: string;
  source: string;
  passageHref?: string; // the passage in the library, if we have it
};

export type Mantra = {
  slug: string;
  title: string;
  sanskritName: string;
  short: string; // one line, for the list and for the Swami's suggestions
  about: string; // what it is, in a few sentences
  parts: MantraPart[];
  howTo: string;
  note?: string;
};

export const COUNTS = [11, 27, 108] as const; // a mala, the prayer-bead string, has 108 beads

export const MANTRAS: Mantra[] = [
  {
    slug: "om",
    title: "Om",
    sanskritName: "ॐ",
    short: "The sound that holds everything. The simplest mantra of all.",
    about:
      "Om is the most sacred sound in Hindu tradition. Prayers, chants and lessons begin and end with it. It is short enough for anyone to say, and deep enough to think about for a lifetime.",
    parts: [
      {
        lines: [{ sa: "ॐ", tr: "Oṁ (said A-U-M)" }],
        words: [
          ["A", "waking: the world we see and touch"],
          ["U", "dreaming: the world inside the mind"],
          ["M", "deep sleep: quiet with no dreams"],
          ["the silence after", "the fourth: the peaceful Self underneath all three"],
        ],
        meaning:
          "The Mandukya Upanishad says Om is everything: the past, the present and the future, and whatever is beyond time too. It hears three sounds in Om, A, U and M, and links them to waking, dreaming and deep sleep. The quiet after the sound stands for the fourth: the true Self, peaceful and whole, which is there through all the others.",
        source: "The Mandukya Upanishad, a short Upanishad all about Om",
        passageHref: "/read/upanishads/mandukya/1",
      },
    ],
    howTo:
      "Sit tall and breathe in. As you breathe out, say Om slowly: let “Aa” open your mouth, “Oo” round your lips, and “Mm” hum with your lips closed. Then rest in the silence for one breath before the next Om. You can also say it silently, in your mind.",
  },
  {
    slug: "gayatri",
    title: "The Gayatri Mantra",
    sanskritName: "गायत्री मन्त्र",
    short: "A prayer for a clear, bright mind, said at sunrise for thousands of years.",
    about:
      "The Gayatri is one of the oldest prayers in the world. It does not ask for money or success. It asks for one thing: that our minds be filled with light. Many families say it at sunrise, or before studying.",
    parts: [
      {
        lines: [
          { sa: "ॐ भूर्भुवः स्वः ।", tr: "Oṁ bhūr bhuvaḥ svaḥ" },
          { sa: "तत्सवितुर्वरेण्यं", tr: "tat savitur vareṇyaṁ" },
          { sa: "भर्गो देवस्य धीमहि ।", tr: "bhargo devasya dhīmahi" },
          { sa: "धियो यो नः प्रचोदयात् ॥", tr: "dhiyo yo naḥ pracodayāt" },
        ],
        words: [
          ["bhūr bhuvaḥ svaḥ", "earth, sky and heaven: all the worlds"],
          ["tat", "that"],
          ["savituḥ", "of Savitr, the divine Sun, who gives life to everything"],
          ["vareṇyam", "most worthy of love"],
          ["bhargaḥ", "shining light"],
          ["devasya", "of God, the divine one"],
          ["dhīmahi", "we meditate on"],
          ["dhiyaḥ", "our minds, our understanding"],
          ["yaḥ", "who"],
          ["naḥ", "our"],
          ["pracodayāt", "may awaken and guide"],
        ],
        meaning:
          "We meditate on the glorious light of God, the divine Sun who gives life to all the worlds. May that light wake up our minds and guide them.",
        source: "The Rig Veda, the oldest of the Vedas. “Om bhur bhuvah svah” is added at the start when it is chanted.",
      },
    ],
    howTo:
      "Face the morning sun if you can, or simply sit quietly. Say each line slowly, or think it. While you say it, picture a warm, golden light filling your mind and making your thoughts clear.",
    note: "Traditions differ on who should chant the Gayatri aloud. Many families today chant it together, and anyone can think about what it means.",
  },
  {
    slug: "mahamrityunjaya",
    title: "The Mahamrityunjaya Mantra",
    sanskritName: "महामृत्युंजय मन्त्र",
    short: "A prayer for healing and courage, when someone is ill or you feel afraid.",
    about:
      "Its name means the great prayer that conquers death. People say it when someone they love is sick, before a journey, or when they feel afraid. It is a prayer for health, for courage, and for peace with whatever happens.",
    parts: [
      {
        lines: [
          { sa: "ॐ त्र्यम्बकं यजामहे", tr: "Oṁ tryambakaṁ yajāmahe" },
          { sa: "सुगन्धिं पुष्टिवर्धनम् ।", tr: "sugandhiṁ puṣṭi-vardhanam" },
          { sa: "उर्वारुकमिव बन्धनान्", tr: "urvārukam iva bandhanān" },
          { sa: "मृत्योर्मुक्षीय मामृतात् ॥", tr: "mṛtyor mukṣīya māmṛtāt" },
        ],
        words: [
          ["tryambakam", "the three-eyed one: Shiva"],
          ["yajāmahe", "we worship"],
          ["sugandhim", "fragrant, full of goodness"],
          ["puṣṭi-vardhanam", "who helps all life grow strong"],
          ["urvārukam iva", "like a ripe cucumber"],
          ["bandhanāt", "from its vine"],
          ["mṛtyoḥ", "from death"],
          ["mukṣīya", "may I be set free"],
          ["mā amṛtāt", "but never from the life that does not die"],
        ],
        meaning:
          "We worship Shiva, the three-eyed one, who is full of goodness and helps all life grow. A ripe cucumber comes away from its vine gently, without being torn. In the same way, may we be set free from death and fear, and never be parted from the life that does not die.",
        source: "The Rig Veda. “Om” is added at the start when it is chanted.",
      },
    ],
    howTo:
      "Sit quietly and think of the person you are praying for, or of what you are afraid of. Say the mantra slowly, or in your mind. Let each repetition feel like handing a little of the worry to God.",
  },
  {
    slug: "peace",
    title: "The peace chants",
    sanskritName: "शान्ति मन्त्र",
    short: "Three short prayers for peace, said before learning and at the end of prayer.",
    about:
      "These chants come from the Upanishads. They are said before studying together, and at the start or end of a prayer. Many end with “Om shanti shanti shanti”: peace said three times, for peace within us, peace with the world around us, and peace from everything beyond our control.",
    parts: [
      {
        name: "Lead me from the unreal to the real",
        lines: [
          { sa: "असतो मा सद्गमय ।", tr: "asato mā sad gamaya" },
          { sa: "तमसो मा ज्योतिर्गमय ।", tr: "tamaso mā jyotir gamaya" },
          { sa: "मृत्योर्मा अमृतं गमय ॥", tr: "mṛtyor mā amṛtaṁ gamaya" },
        ],
        words: [
          ["asataḥ", "from the unreal"],
          ["mā", "me"],
          ["sat", "to the real"],
          ["gamaya", "lead"],
          ["tamasaḥ", "from darkness"],
          ["jyotiḥ", "to light"],
          ["mṛtyoḥ", "from death"],
          ["amṛtam", "to what never dies"],
        ],
        meaning: "Lead me from what is not real to what is real. Lead me from darkness to light. Lead me from death to what never dies.",
        source: "The Brihadaranyaka Upanishad",
        passageHref: "/read/upanishads/brihadaranyaka/1.3.27",
      },
      {
        name: "Together: a prayer for students and teachers",
        lines: [
          { sa: "ॐ सह नाववतु ।", tr: "Oṁ saha nāv avatu" },
          { sa: "सह नौ भुनक्तु ।", tr: "saha nau bhunaktu" },
          { sa: "सह वीर्यं करवावहै ।", tr: "saha vīryaṁ karavāvahai" },
          { sa: "तेजस्वि नावधीतमस्तु मा विद्विषावहै ॥", tr: "tejasvi nāv adhītam astu mā vidviṣāvahai" },
          { sa: "ॐ शान्तिः शान्तिः शान्तिः ॥", tr: "Oṁ śāntiḥ śāntiḥ śāntiḥ" },
        ],
        words: [
          ["saha", "together"],
          ["nau", "us both"],
          ["avatu", "may God protect"],
          ["bhunaktu", "may God nourish"],
          ["vīryaṁ karavāvahai", "may we work with energy"],
          ["tejasvi", "bright, shining"],
          ["adhītam astu", "may what we study be"],
          ["mā vidviṣāvahai", "may we never quarrel"],
          ["śāntiḥ", "peace"],
        ],
        meaning:
          "May God protect us both, teacher and student. May God nourish us both. May we work together with energy. May what we study shine bright. May we never quarrel. Om, peace, peace, peace.",
        source: "The opening prayer of the Katha Upanishad, also said in the Taittiriya Upanishad",
      },
      {
        name: "That is whole, this is whole",
        lines: [
          { sa: "ॐ पूर्णमदः पूर्णमिदं", tr: "Oṁ pūrṇam adaḥ pūrṇam idaṁ" },
          { sa: "पूर्णात्पूर्णमुदच्यते ।", tr: "pūrṇāt pūrṇam udacyate" },
          { sa: "पूर्णस्य पूर्णमादाय", tr: "pūrṇasya pūrṇam ādāya" },
          { sa: "पूर्णमेवावशिष्यते ॥", tr: "pūrṇam evāvaśiṣyate" },
          { sa: "ॐ शान्तिः शान्तिः शान्तिः ॥", tr: "Oṁ śāntiḥ śāntiḥ śāntiḥ" },
        ],
        words: [
          ["pūrṇam", "whole, complete"],
          ["adaḥ", "that: God, whom we cannot see"],
          ["idam", "this: the world we can see"],
          ["pūrṇāt", "from the whole"],
          ["udacyate", "comes out"],
          ["ādāya", "taking away"],
          ["eva", "still"],
          ["avaśiṣyate", "remains"],
        ],
        meaning:
          "That is whole. This is whole. From the whole, the whole comes out. Take the whole away from the whole, and the whole is still there. It is a riddle about God: God is complete, the world that comes from God is complete, and nothing is ever lost from God.",
        source: "The Brihadaranyaka Upanishad, and the opening prayer of the Isha Upanishad",
        passageHref: "/read/upanishads/brihadaranyaka/5.1.1",
      },
    ],
    howTo:
      "Say one of these before you study, before a lesson, or to close your day. Say each line slowly. When you reach “shanti”, let your breath slow down a little more each time.",
  },
];

export const getMantra = (slug: string) => MANTRAS.find((m) => m.slug === slug);
