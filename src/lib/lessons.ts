// Learning paths: short lessons, about five minutes each, in the Swami's voice.
// Each lesson can quote one passage from the scripture library by its id (e.g. "gita-2-13").

export type Lesson = {
  title: string;
  body: string[];
  verseId?: string; // a passage id from the library
  reflect: string; // "Sit with this"
};

export type LearningPath = {
  slug: string;
  title: string;
  description: string;
  forWhom: string;
  lessons: Lesson[];
  totalLessons: number;
};

const GITA: Lesson[] = [
  {
    title: "Arjuna's despair",
    body: [
      "The Bhagavad Gita does not begin with a wise man. It begins with a strong man who is falling apart.",
      "Two sides of one royal family are about to go to war. Arjuna is the best archer of his time. He asks his friend Krishna, who is driving his chariot, to stop between the two armies so he can see who he will be fighting.",
      "Across the field he sees his own family. There is the grandfather who carried him as a baby. There is the teacher who taught him to use a bow. There are cousins he grew up with.",
      "Arjuna's mouth goes dry. His hands shake and his bow falls. He sits down in the chariot and says, \"I will not fight.\"",
      "Here is the important part. The Gita's great teaching only happens because Arjuna admits he is lost. He doesn't pretend to be fine. That honesty is not weakness. It is the first step.",
      "Many of us hide when we are struggling. A student doesn't say they're confused in class. A grandparent doesn't tell anyone they feel lonely. The Gita shows another way: say it out loud, and let someone help.",
      "In the next seventeen lessons, Krishna answers Arjuna. It all begins with Arjuna saying, \"I don't know what to do.\"",
    ],
    verseId: "gita-1-47",
    reflect: "What is something you've been pretending is fine, when it isn't?",
  },
  {
    title: "The Self that never dies",
    body: [
      "When Arjuna says he won't fight, Krishna doesn't tell him what to do yet. First he tells Arjuna who he really is.",
      "Try this. Look at a photo of yourself when you were five. Your height, your face and your voice have all changed. But you still look at the photo and say, \"That's me.\" Some part of you has been there the whole time.",
      "Krishna calls that part the Self. In Sanskrit it is called the Atman. Your body changes from child to teenager to adult to old age. The Self, the real you inside, stays the same.",
      "Why does this matter? Because we often think we are our looks, our grades, our job or our money. Then when we lose one of those things, it feels like we have lost ourselves, and we get scared.",
      "Krishna says you are more than those things. Bad days still come. You can still lose a game, fail a test or retire from a job you loved. But the real you is not lost. Knowing this makes hard times less frightening.",
      "This idea is the base of everything else in the Gita. You don't have to fully believe it today. Just notice that there is a quiet part of you that watches your thoughts and feelings come and go.",
    ],
    verseId: "gita-2-13",
    reflect: "What part of you has stayed the same since you were a child?",
  },
  {
    title: "You can't not act",
    body: [
      "Arjuna now asks a fair question: \"If the real me is the Self, why not walk away from the battle, and from all this effort, and just sit quietly?\"",
      "Krishna's answer is simple. No one can stop doing things. Breathing, eating and sleeping are all actions. Even choosing to do nothing is a choice, and it has results too. So the question is not whether to act. It is how to act.",
      "Here is Krishna's answer: do your work as well as you can, but don't cling to how it turns out. \"Cling\" means holding on so tightly that you can't let go.",
      "Think of a parent who packs their child's lunch every school day for twelve years. Nobody claps. Most days, nobody says thank you. They do it because it is their job, and they do it with love. That is what Krishna means.",
      "Or think of a test. A student who clings thinks, \"If I don't get an A, I'm a failure.\" A student who doesn't cling thinks, \"I'll study hard and do my best.\" They work just as hard, but the second student is calmer, and often does better.",
      "This chapter is called Karma Yoga, which means the yoga of action. It teaches that your everyday work, like chores, homework, your job and caring for others, can become a spiritual practice when you do it with care and without clinging.",
    ],
    verseId: "gita-3-19",
    reflect: "What is one job you do every day that you could do with more care and less worry about the result?",
  },
  {
    title: "Why goodness always comes back",
    body: [
      "In chapter 4, Krishna tells Arjuna something surprising. He says he has taught this same wisdom long ago, to kings of the past. Then it was forgotten, so now he is teaching it again.",
      "Then he makes a promise. Whenever goodness fades and wrong things take over the world, he comes back to set things right.",
      "In Hindu tradition, this is why God is said to come to earth in different forms, called avatars. Rama and Krishna are two of the best known.",
      "This promise matters on hard days. When the news is full of bad things, or a group of friends turns mean, it can feel like goodness has lost. The Gita says it never loses for good. It always returns.",
      "There is a second lesson here too. Goodness often comes back through people. A kid who sticks up for someone being teased, or a neighbor who checks on an elderly friend, is part of that return.",
      "You don't have to be a hero to help. Small, steady kindness is how goodness comes back into a room.",
    ],
    verseId: "gita-4-7",
    reflect: "Where in your life could you help goodness come back this week?",
  },
  {
    title: "Like a lotus leaf",
    body: [
      "Arjuna is still confused. Should he give up the world and stop doing things? Or should he keep working? In chapter 5, Krishna says both paths can lead to peace, but working with the right attitude is easier for most people.",
      "To explain, Krishna uses a picture from nature: the lotus. A lotus plant grows in muddy ponds. Its big leaves sit right on the water. But if you pour water on a lotus leaf, the drops just roll off. The leaf stays dry.",
      "Krishna says a wise person lives like that leaf. They live in the busy, messy world. They go to school, work, cook and care for family. But they don't let greed, jealousy or worry soak in.",
      "Think of a doctor in a busy hospital. They see sadness all day, but they stay calm so they can help. Or a grandparent in a noisy family gathering who stays peaceful while everyone argues around them.",
      "Living like a lotus leaf doesn't mean you stop caring. It means you care and help, without letting every problem make you heavy.",
      "This is why the lotus is everywhere in Indian art. It is a reminder that you can be in the world without being dragged down by it.",
    ],
    verseId: "gita-5-10",
    reflect: "What usually \"soaks in\" and weighs you down? How could you let it roll off more often?",
  },
  {
    title: "Training a restless mind",
    body: [
      "Chapter 6 is about meditation. Krishna explains how to sit quietly and calm the mind. Arjuna is honest: he says his mind is as hard to control as the wind.",
      "Anyone who has tried to sit still knows this. You close your eyes to focus on your breath, and ten seconds later you're thinking about lunch, a text message or something embarrassing from years ago.",
      "Krishna does not say Arjuna is wrong. He agrees the mind is restless. But he says it can be trained in two ways: practice, which means doing it again and again, and letting go, which means not chasing every thought that shows up.",
      "Think of training a puppy to sit. It wanders off. You gently bring it back. It wanders off again. You bring it back again. You don't yell at the puppy. One day, it sits.",
      "Your mind is like that puppy. When it wanders during meditation, just notice it and gently bring it back to your breath. Each time you bring it back, that is the practice. That is not failing.",
      "Start small. Even two minutes a day of sitting and gently returning to the breath will slowly make the mind steadier.",
    ],
    verseId: "gita-6-35",
    reflect: "When your mind wanders, are you gentle with it or hard on it?",
  },
  {
    title: "Pearls on a string",
    body: [
      "In chapter 7, Krishna starts to explain who he really is. He uses a beautiful picture: a necklace of pearls.",
      "When you look at a pearl necklace, you see the pearls. You don't see the string. But the string runs through every pearl and holds the whole necklace together. Without it, the pearls would scatter on the floor.",
      "Krishna says he is like that string. Everything in the world, every person, animal, tree and star, is like a pearl. And he is the hidden string running through all of them, holding them together.",
      "This is a key idea in Hindu thought. God is not only far away in the sky. God is also inside everything, quietly holding it together, even when we can't see it.",
      "This changes how we can look at the world. The tree outside your window, the stranger at the store and your annoying younger brother are all on the same string.",
      "You don't have to see the string to trust it is there. Just remember the necklace when the world feels like it's falling apart.",
    ],
    verseId: "gita-7-7",
    reflect: "Who is one person you find hard to like? What would change if you remembered they are on the same string as you?",
  },
  {
    title: "What you think about, you become",
    body: [
      "Chapter 8 talks about what happens at the end of life. Krishna says that whatever a person thinks about most, they move toward.",
      "That can sound heavy, but the idea is simple. What we think about again and again shapes who we become. If someone spends their days thinking about money, they become a money-focused person. If someone thinks often about kindness, kindness becomes part of them.",
      "Our last thoughts don't appear out of nowhere. They grow from the thoughts we practiced all our life. That is why Krishna says to remember the highest, God or goodness, at all times.",
      "Notice that he also says \"and fight.\" He doesn't tell Arjuna to stop working and only pray. He means: do your duty, and keep the highest in your mind while you do it.",
      "For a student, it might mean doing homework while remembering why learning matters. For a grandparent, it might mean a short prayer while cooking, or humming a bhajan, a devotional song, while doing chores.",
      "You become what you practice thinking. So it's worth choosing what to practice.",
    ],
    verseId: "gita-8-7",
    reflect: "What do you think about most during a normal day? Is that what you want to become?",
  },
  {
    title: "A leaf, a flower, a fruit, water",
    body: [
      "Chapter 9 has one of the most loved verses in the whole Gita. Krishna says that if someone offers him even a leaf, a flower, a fruit or a little water, with love, he gladly accepts it.",
      "Notice what he doesn't say. He doesn't ask for gold, huge temples or expensive gifts. A leaf is free. Water is almost free. Anyone, rich or poor, young or old, can offer them.",
      "What makes the offering count is the love behind it, not the price.",
      "Think of a little child who gives their grandmother a dandelion they picked from the yard. It's just a weed. But the grandmother keeps it, smiles and puts it in water. It's precious because of the love.",
      "This is why, in many Hindu homes, people offer simple things at the family shrine: a flower, a little water, some fruit. It isn't about the size of the gift. It's a way of saying \"thank you\" and \"I remember you.\"",
      "This means anyone can come close to God. You don't need money, special knowledge or a perfect life. You only need a sincere heart.",
    ],
    verseId: "gita-9-26",
    reflect: "What small thing could you offer today, to God or to someone you love, with your whole heart?",
  },
  {
    title: "Sparks of something greater",
    body: [
      "In chapter 10, Arjuna asks Krishna how he can recognize God in the world. Krishna gives a long list of examples: among mountains, he is Meru, the sacred mountain; among rivers, the holy Ganga; among lights, the shining sun.",
      "Then he sums it all up. Whatever is glorious, good, beautiful or powerful anywhere, he says, comes from just a small spark of his splendor.",
      "This gives us a new way to see everyday moments. A beautiful sunset is a spark. A song that gives you chills is a spark. So is a great athlete's skill, a doctor's careful hands, or a kind word from a stranger.",
      "So when something takes your breath away, you can stop for a moment and remember: this is a tiny glimpse of something much greater.",
      "It also means your own talents are sparks too. If you are good at drawing, math, caring for people or making others laugh, that gift is a small piece of something divine.",
      "That can make us humble and grateful at the same time. The talent is real, and it is also a gift.",
    ],
    verseId: "gita-10-41",
    reflect: "What is one \"spark\" you saw this week, something that was beautiful, good or amazing?",
  },
  {
    title: "Brighter than a thousand suns",
    body: [
      "In chapter 11, Arjuna asks to see Krishna's true form. Krishna gives him a special kind of sight, and shows him.",
      "Sanjaya, who is telling the story, tries to describe it. He says: imagine a thousand suns rising in the sky at once. Even that would only begin to match it.",
      "Arjuna sees the whole universe inside Krishna: every world, every god, every living being, all beginnings and all endings. He is amazed and terrified at the same time. He begs Krishna to return to his gentle, familiar form, and Krishna does.",
      "This chapter teaches a feeling called awe. Awe is what you feel looking up at the stars on a clear night, or standing at the edge of the ocean. You feel very small, but in a good way.",
      "Awe helps us see our problems in the right size. A bad grade or an argument can feel huge. Under a sky full of stars, it becomes smaller and easier to carry.",
      "And notice the ending: after showing his huge form, Krishna comes back as Arjuna's friend. The greatest power in the universe is also close, kind and personal.",
    ],
    verseId: "gita-11-12",
    reflect: "When did you last feel awe? What did it do to your worries?",
  },
  {
    title: "The kind of person Krishna loves",
    body: [
      "Chapter 12 is about bhakti, which means loving devotion to God. Arjuna asks whether it is better to worship God with a form, like Krishna, or as something without any form. Krishna says loving devotion is the easier path for most people.",
      "Then he describes the kind of person who is dear to him. It is a beautiful list, and it's not about how many prayers someone says.",
      "This person bears no ill-will to anyone, which means they don't hold grudges. They are friendly and compassionate, which means they feel for others and want to help. They are not full of themselves. They stay steady in good times and bad. And they are forgiving.",
      "Notice that the list is about how you treat people. In the Gita, being close to God shows up as being kind on an ordinary Tuesday.",
      "A teenager who forgives a friend who hurt them is living this verse. So is a grandparent who welcomes a family member they had a fight with years ago.",
      "None of us are all of these things all the time. But we can pick one quality from the list and practice it this week.",
    ],
    verseId: "gita-12-13",
    reflect: "Which quality from Krishna's list is hardest for you? What would one small step toward it look like?",
  },
  {
    title: "The same light in everyone",
    body: [
      "Chapter 13 explains two things: the body, which Krishna calls the \"field,\" and the one who knows the body, the Self inside, which he calls the \"knower of the field.\"",
      "Then he says something powerful. The same God is present equally in every living being. A person who truly sees this, he says, sees things as they really are.",
      "\"Equally\" is the key word. God is not more present in a king than in a cleaner, or in a famous person than in someone who lives on the street. The same light is in all of them.",
      "This idea is behind the Hindu greeting \"Namaste.\" It is often explained as \"the divine in me bows to the divine in you.\"",
      "If we really saw this, it would change how we treat people. It's hard to be rude to a waiter, mock a classmate or ignore an elderly neighbor when you remember the same light is inside them.",
      "It also applies to you. On days when you feel worthless, remember that the same light is in you, equally.",
    ],
    verseId: "gita-13-28",
    reflect: "Who do you treat as less important than others? How would you act if you saw the same light in them?",
  },
  {
    title: "Three kinds of mood",
    body: [
      "Chapter 14 explains three qualities that are mixed into everything in nature, including us. In Sanskrit they are called the gunas.",
      "Sattva is harmony: calm, clear and kind. Rajas is motion: busy, restless and always wanting more. Tamas is inertia: heavy, sleepy and stuck.",
      "Everyone has all three. Think of a normal day. You might wake up foggy and not want to get out of bed, which is tamas. Later you rush around, stressed and doing ten things at once, which is rajas. Then in a quiet moment, maybe on a walk, you feel peaceful and clear, which is sattva.",
      "The point isn't to feel bad about tamas or rajas. Rajas gets work done, and tamas lets us rest. The point is to notice which one is in charge, and to make more room for sattva.",
      "Some simple things that build sattva: fresh food, enough sleep, time in nature, quiet prayer or meditation, and being around kind people. Things like too much screen time, junk food and constant rushing usually feed the other two.",
      "Krishna's deeper teaching is that the real you, the Self, is beyond all three moods. They are like weather passing through the sky. You are the sky.",
    ],
    verseId: "gita-14-5",
    reflect: "Which mood, calm, restless or heavy, has been in charge of you this week?",
  },
  {
    title: "God in your own heart",
    body: [
      "Chapter 15 starts with an unusual picture: a giant tree that grows upside down, with its roots up in heaven and its branches spreading down into our world. It means our world grows out of something higher.",
      "Then Krishna says something very personal. He lives in the heart of every being. Our memory, our understanding, even our forgetting, come from him.",
      "So God is not only in a temple, or far away in the sky. God is also inside you, closer than your own breath.",
      "This can be very comforting. When you feel alone, in a new school, a hospital room or a quiet house after loved ones have moved away, you are not completely alone. The divine is already with you, in your own heart.",
      "It also means you can turn inward for guidance. When you have a hard choice, getting quiet and listening to the calm voice inside is a way of listening to God.",
      "Many people put a hand on their heart when they pray. It's a simple reminder that the one they're praying to is right there.",
    ],
    verseId: "gita-15-15",
    reflect: "When did you last get quiet enough to hear the calm voice inside you?",
  },
  {
    title: "Three doors to trouble",
    body: [
      "Chapter 16 compares two kinds of qualities. Good qualities, like fearlessness, honesty, kindness and patience, lead to freedom. Harmful ones, like pride, anger and cruelty, lead to suffering.",
      "Then Krishna gives a short warning that is easy to remember. There are three doors that lead into trouble: lust, anger and greed.",
      "Lust here means strong, selfish wanting, wanting something so much that you'd hurt someone to get it. Anger is the hot feeling that makes us say and do things we later regret. Greed is never having enough, always wanting more, more, more.",
      "Most of the trouble in the world, from fights between friends to wars between countries, starts at one of these three doors.",
      "Krishna doesn't say we'll never feel these things. Everyone does. He says to notice when we are standing at one of these doors, and choose not to walk through.",
      "A simple trick: when you feel anger rising, take three slow breaths before you speak. When you feel greed, think of one thing you already have and are thankful for.",
    ],
    verseId: "gita-16-21",
    reflect: "Which of the three doors do you find yourself standing at most often?",
  },
  {
    title: "The gift that expects nothing back",
    body: [
      "In chapter 17, Krishna explains that people's food, worship and giving can each be done in three ways, matching the three moods we learned about in chapter 14.",
      "Let's look at giving. Giving can be done to get something back, or grudgingly, when you don't really want to. It can be done carelessly, without respect for the person receiving. Or it can be done in the best way: given freely, at the right time, to someone who needs it, expecting nothing back.",
      "That last kind is the purest gift. Krishna says it is given simply because giving is the right thing to do.",
      "A pure gift might be shoveling an elderly neighbor's driveway and leaving before they can pay you. Or donating to a food bank without posting about it. Or sitting with a lonely classmate at lunch.",
      "The test is simple. Ask yourself: \"Would I still do this if no one ever found out?\" If the answer is yes, it is a pure gift.",
      "Gifts like this make the giver lighter, not heavier. They don't create debts or expectations. They just add a little more good to the world.",
    ],
    verseId: "gita-17-20",
    reflect: "What is a gift you could give this week that no one will ever know about?",
  },
  {
    title: "Arjuna stands up",
    body: [
      "We have reached the last chapter. In chapter 18, Krishna sums up everything: do your own duty, act without clinging, love God and trust him. Then he does something very respectful. He tells Arjuna to think it over and choose for himself.",
      "Krishna doesn't force him. Even God, in the Gita, leaves the final choice to us.",
      "And Arjuna answers. His confusion is gone. He says he remembers who he is now. His doubts have disappeared, and he is ready to do what is right.",
      "Remember how the Gita began, with Arjuna sitting down in the chariot, his bow on the floor, saying \"I will not fight.\" Now he picks up his bow and stands. Same battlefield, same problem. What changed is Arjuna.",
      "That is the whole journey of the Gita. The outside situation doesn't change. The person inside it does. He learns who he really is, how to act without fear and how to trust something greater.",
      "You can make the same journey with your own problems. Not by escaping them, but by facing them with a clearer mind and a steadier heart. Thank you for walking these eighteen days.",
    ],
    verseId: "gita-18-73",
    reflect: "What is a \"battlefield\" in your life right now? What would standing up to it look like?",
  },
];

const KARMA: Lesson[] = [
  {
    title: "Karma means action",
    body: [
      "Many people think karma means \"what goes around comes around,\" or a kind of cosmic punishment. But the word itself is simple. In Sanskrit, karma just means action, something you do.",
      "Every action leaves a mark, like footprints in wet sand. Saying something kind, telling a lie, practicing piano, scrolling your phone for hours: each one leaves a small mark on you.",
      "Over time, those marks add up. That is how habits form, and habits shape who we become. A person who practices patience becomes patient. A person who practices complaining becomes a complainer.",
      "So karma isn't a scorecard kept by someone in the sky. It is more like a law of nature, the way gravity is a law of nature. What we do shapes us.",
      "In the Gita, Krishna adds an important piece. He says our job is the action itself, doing it well and honestly. The results are not fully in our control, so we shouldn't let them be our only reason for acting.",
      "Over the next lessons, we'll see why this is good news. If karma is about what you do, then you always have something to work with: your next action.",
    ],
    verseId: "gita-2-47",
    reflect: "Which of your daily habits is shaping you the most, for better or worse?",
  },
  {
    title: "What we do comes back to us",
    body: [
      "Swami Vivekananda was a great Hindu teacher who traveled to America in 1893. He gave a series of talks called Karma-Yoga, and in them he explains karma very clearly.",
      "He says every action we do comes back to us as a reaction. When people do mean things, they slowly become meaner. When people do good things, they slowly become better. Our actions don't only change the world. They change us.",
      "You have probably seen this. Someone who gossips a lot starts to see the worst in everyone. Someone who helps a lot starts to notice who needs help.",
      "He also says our actions affect other people, and theirs affect us. A smile at the start of the day can change someone's whole mood, and they might pass it on.",
      "This is why karma is not something to be scared of. It is something to use. If what we do shapes us, then we can choose actions that shape us into the person we want to become.",
      "Start with something small. One kind act a day, done on purpose, slowly changes the person doing it.",
    ],
    verseId: "vivekananda-karma-yoga-6-1",
    reflect: "What is one action you repeat that you'd like to stop, and one you'd like to start?",
  },
  {
    title: "Karma is not fate",
    body: [
      "Some people say, \"It's my karma,\" as if everything is already decided and there is nothing they can do. That is a misunderstanding.",
      "Yes, our past actions shape where we are today. A student who didn't study for months will find the final exam hard. That is karma. But it is not the end of the story.",
      "In the Gita, Krishna says something very hopeful: lift yourself up by your own effort, and don't let yourself sink down. Your own mind can be your best friend, or your worst enemy.",
      "This means you are not stuck. Your past choices brought you here, but your choices today decide where you go next. Today's actions become tomorrow's karma.",
      "Think of a grandparent who decides at seventy to learn to use a smartphone so they can video-call their grandchildren. Or a teenager who has struggled in math and decides to ask the teacher for help. Both are lifting themselves up.",
      "So when something hard happens, the better question isn't \"Why is this my karma?\" It's \"What can I do now?\"",
    ],
    verseId: "gita-6-5",
    reflect: "Where in your life have you been saying \"that's just how it is\" when you could take a step?",
  },
  {
    title: "Work like a master, not a slave",
    body: [
      "Swami Vivekananda had a strong way of saying it: work like a master, not like a slave.",
      "He meant this. Most people work only for what they'll get: money, praise, grades, being liked. When they don't get it, they are miserable. They are \"slaves\" to the result.",
      "A \"master\" still works hard, maybe even harder. But they work because the work is worth doing, and because they choose to. They aren't controlled by whether someone claps.",
      "He also says that every act of love brings peace back to the person who does it. Work done with love doesn't drain you the same way work done for a reward does.",
      "Imagine two people volunteering at a temple kitchen. One keeps checking whether anyone noticed how hard they worked. The other just enjoys feeding people. Same job, but only one of them goes home happy.",
      "You can try this with any job: chores, homework or your career. Do it well, do it with care, and let go of needing someone to notice.",
    ],
    verseId: "vivekananda-karma-yoga-3-11",
    reflect: "What work do you do mostly for the reward? How would it feel to do it as a \"master\"?",
  },
  {
    title: "Walk your own path",
    body: [
      "Our last karma lesson is about choosing the right actions for you.",
      "In the Gita, Krishna says it is better to do your own duty, even imperfectly, than to do someone else's duty perfectly. Your duty is called your dharma: the right path for your nature, your stage of life and your situation.",
      "This is very freeing. You don't have to live someone else's life. A student who loves art doesn't have to pretend to love medicine because a cousin did. A grandparent doesn't have to keep up with what younger people are doing.",
      "But it also asks for honesty. Your dharma isn't just \"whatever I feel like.\" It includes your real responsibilities: caring for family, being truthful, doing your work well.",
      "When you are walking your own path, your actions feel right, even when they are hard. When you are copying someone else's path, things can feel wrong even when they are going well.",
      "Put together, these five lessons say one thing: act on purpose, act with care, let go of the results, and walk the path that is truly yours. That is karma, understood well.",
    ],
    verseId: "gita-3-35",
    reflect: "Is there an area of your life where you're walking someone else's path instead of your own?",
  },
];

const YOGA: Lesson[] = [
  {
    title: "What yoga really means",
    body: [
      "Today, most people think yoga means stretching on a mat. But the most famous book about yoga, the Yoga Sutras, barely talks about stretching at all.",
      "The Yoga Sutras were written by a teacher named Patanjali, probably around two thousand years ago. A sutra is a short saying, like a thread of wisdom. Patanjali packed a whole system into 195 of them.",
      "His very first definition is surprising. Yoga, he says, is calming the waves of the mind.",
      "Picture a lake. When the wind blows, the water is choppy, and you can't see the bottom. When the wind stops and the water is still, you can see all the way down. Your mind is like that lake. Worries, wants and thoughts are the waves.",
      "Patanjali says that when the mind becomes still, you can see your true Self clearly, like seeing the bottom of the lake.",
      "So the postures are helpful, but they are only one part. They prepare the body to sit still so the mind can calm down. The real goal of yoga is a quiet, clear mind.",
    ],
    verseId: "yoga-sutras-1-2",
    reflect: "When does your mind feel most like a still lake?",
  },
  {
    title: "Practice and letting go",
    body: [
      "So how do we calm the waves of the mind? Patanjali gives a two-part answer: practice and non-attachment.",
      "Practice means doing it again and again, regularly, for a long time, even when it's boring. Like learning an instrument, the mind gets calmer through steady repetition, not through one big effort.",
      "Non-attachment means letting go. It means not grabbing at every pleasant thing and not running from every unpleasant thing. You notice them, and you let them pass.",
      "The two work together, like the two wings of a bird. Practice gives you energy and direction. Letting go keeps you from getting tense and frustrated.",
      "Swami Vivekananda, who translated these sutras, explains that the mind has strong habits, and practice slowly builds new, calmer habits in their place.",
      "If you meditate for five minutes and your mind wanders the whole time, that is still practice. Coming back to it tomorrow is how the change happens.",
    ],
    verseId: "yoga-sutras-1-12",
    reflect: "What is something you could practice for just five minutes a day?",
  },
  {
    title: "The eight steps of yoga",
    body: [
      "Patanjali lays out yoga as eight steps, often called the eight limbs. They're like the rungs of a ladder.",
      "The first two are about how we live: Yama, how we treat others, and Niyama, how we treat ourselves. The third, Asana, is posture, the part most people know. The fourth, Pranayama, is control of the breath.",
      "The fifth, Pratyahara, means turning our attention inward instead of chasing every sight and sound. The sixth, Dharana, is concentration, holding the mind on one thing. The seventh, Dhyana, is meditation, when that focus flows steadily. The eighth, Samadhi, is deep absorption, the mind completely calm and clear.",
      "Notice the order. Patanjali puts being a good person first, before postures or meditation. A calm mind is very hard to have if you are lying, fighting with people or feeling guilty.",
      "You don't have to master one step before starting the next. People usually work on several at once. But each step makes the next one easier.",
      "In the next lessons, we'll look at each step in plain, everyday terms.",
    ],
    verseId: "yoga-sutras-2-29",
    reflect: "Which of the eight steps do you already practice, even a little?",
  },
  {
    title: "How we treat others",
    body: [
      "The first limb of yoga is the Yamas, five ways of treating others. In Vivekananda's translation, they are non-killing, truthfulness, non-stealing, continence and non-receiving.",
      "Non-killing, or ahimsa, means not hurting others, in actions, words or even thoughts. It is the reason many yogis are vegetarian, and why Gandhi used ahimsa as his way of protest.",
      "Truthfulness means being honest. Non-stealing means not taking what isn't yours. That includes things like taking credit for someone else's work.",
      "Continence means self-control, especially over strong desires. Non-receiving means not grabbing more than you need, and not accepting gifts that come with hidden strings.",
      "Why does yoga start here? Because it is very hard to have a peaceful mind when you are hurting people, hiding lies or always wanting more. These five clear away a lot of inner noise.",
      "Pick one to practice this week. Many people find truthfulness is the best place to start.",
    ],
    verseId: "yoga-sutras-2-30",
    reflect: "Which of the five Yamas is hardest for you right now?",
  },
  {
    title: "How we treat ourselves",
    body: [
      "The second limb is the Niyamas, five healthy habits for our own life. Vivekananda translates them as purification, contentment, mortification, study and worship of God.",
      "Purification means keeping clean, both your body and your mind. A tidy room and a clear conscience both help.",
      "Contentment means being happy with what you have, instead of always wanting the next thing. It is one of the most powerful habits for a calm mind.",
      "Mortification is an old-fashioned word. Here it means self-discipline: doing hard but good things, like waking up early, eating simply or keeping a promise when it's inconvenient. The Sanskrit word is tapas, which means \"heat\": the kind of effort that makes you stronger.",
      "Study means learning from wise books and from looking honestly at yourself. Worship of God means surrendering, trusting something greater than your own small worries.",
      "Together, the Yamas and Niyamas make the ground of yoga. Before stretching or meditating, Patanjali wants us to be honest, kind, disciplined and content.",
    ],
    verseId: "yoga-sutras-2-32",
    reflect: "Which Niyama could make the biggest difference in your life this week?",
  },
  {
    title: "Steady and comfortable",
    body: [
      "Now we come to Asana, posture, the part of yoga most people know. Patanjali's whole description of it is just one short line: posture is that which is firm and pleasant.",
      "That is it. He doesn't list dozens of poses or say you must touch your toes. He says your posture should be steady, so you don't fidget, and comfortable, so you can stay in it.",
      "In Patanjali's time, the main purpose of posture was to sit still for meditation. If your back hurts or your legs fall asleep, your mind will keep thinking about your body instead of becoming calm.",
      "This is good news for everyone. You don't have to be flexible or young to do this kind of yoga. Sitting upright on a chair with your feet flat on the floor is a perfectly good posture.",
      "Modern yoga classes with many poses can be wonderful for health. But Patanjali's test is simple: can you sit steady and at ease?",
      "Try it now: sit up tall, let your shoulders relax, rest your hands on your knees and stay still for one minute.",
    ],
    verseId: "yoga-sutras-2-46",
    reflect: "Where and how do you sit most comfortably and steadily?",
  },
  {
    title: "The breath and the mind",
    body: [
      "The fourth limb is Pranayama, which means control of the breath. Once the body is sitting steady, Patanjali says, we learn to slow and guide the breath, both in and out.",
      "Why the breath? Because the breath and the mind are closely linked. When you are scared or angry, your breath gets fast and shallow. When you are relaxed, it gets slow and deep.",
      "This works in the other direction too. If you slow down your breath on purpose, your mind starts to calm down with it. The breath is like a remote control for your mood.",
      "Try this simple practice: breathe in slowly through your nose for a count of four. Then breathe out slowly for a count of six. Do this five times.",
      "The fifth limb, Pratyahara, comes next. It means turning your attention inward, away from noises and screens, the way a turtle pulls its legs into its shell.",
      "These two steps, a slow breath and an inward attention, are the bridge between the body and meditation.",
    ],
    verseId: "yoga-sutras-2-49",
    reflect: "When could you use slow breathing to calm yourself this week?",
  },
  {
    title: "Focus, meditation and stillness",
    body: [
      "The last three limbs happen inside the mind, and they flow into one another.",
      "Dharana is concentration: holding the mind on one thing, like a candle flame, the breath or a sacred word like Om. At first, the mind keeps slipping away and you keep bringing it back.",
      "Dhyana is meditation. Patanjali describes it as an unbroken flow of attention toward that one thing. The mind stops slipping away, and the focus flows steadily, like oil being poured from one pot to another.",
      "Samadhi is the last step. The mind becomes so still and clear that it forgets itself, and only what it is focused on remains. Patanjali says this is where we see our true Self.",
      "This may sound far away, but you have probably had a taste of it. When you are so absorbed in music, painting, a sport or prayer that you lose track of time, you've touched something like it.",
      "That is the whole path of yoga, from being kind to others all the way to a still, clear mind. It's a lifelong practice. Every small step counts.",
    ],
    verseId: "yoga-sutras-3-2",
    reflect: "When have you been so absorbed in something that you lost track of time?",
  },
];

const RAMAYANA: Lesson[] = [
  {
    title: "A prince leaves home",
    body: [
      "Long ago, in the city of Ayodhya, there lived a good king named Dasharatha. He had four sons. The eldest, Rama, was loved by everyone for his kindness and fairness.",
      "Dasharatha decided to make Rama the next king. The whole city got ready to celebrate. But one of the king's wives, Kaikeyi, wanted her own son, Bharata, to be king instead.",
      "Years earlier, Dasharatha had promised Kaikeyi two wishes. Now she asked for them: make Bharata king, and send Rama to live in the forest for fourteen years. The king was heartbroken, but he had given his word.",
      "Rama could have argued. Many people thought he should. Instead, he calmly bowed to his father and agreed to go, so that his father's promise would be kept.",
      "His wife Sita would not stay behind, and his loyal brother Lakshmana would not either. So the three of them walked out of the city, and all of Ayodhya cried as they left.",
      "This is the first lesson of the Ramayana: keeping your word, and caring about others' honor, sometimes matters more than getting what you want.",
    ],
    verseId: "ramayana-exile-2-19-2",
    reflect: "Have you ever kept a promise even when it cost you something?",
  },
  {
    title: "The golden deer",
    body: [
      "Rama, Sita and Lakshmana lived simply in the forest for years, in a little hut, close to nature.",
      "Far away, on the island of Lanka, lived a powerful demon king named Ravana. He had ten heads, and he was very proud. He heard about Sita's beauty and decided to take her for himself.",
      "Ravana made a plan. A helper of his turned himself into a beautiful golden deer and wandered near the hut. Sita saw it and asked Rama to catch it for her. Rama ran after it into the forest.",
      "Then a voice that sounded like Rama's called out for help. Sita begged Lakshmana to go. In many tellings, before leaving, Lakshmana drew a line around the hut and asked Sita not to step past it.",
      "Ravana came to the hut dressed as a holy man asking for food. When Sita stepped out to help him, he grabbed her and flew away in his chariot. A brave old bird named Jatayu tried to stop him and was badly hurt.",
      "The story warns us that things that look golden and perfect are not always what they seem. Sometimes wanting something shiny can lead us into trouble.",
    ],
    verseId: "ramayana-deer-3-43-4",
    reflect: "When has something that looked perfect turned out to be a trick or a trap?",
  },
  {
    title: "Friends along the way",
    body: [
      "Rama and Lakshmana came home to an empty hut. Rama was heartbroken. The brothers set off searching for Sita, and on the way, they met helpers they never expected.",
      "First they found Jatayu, the brave bird, who used his last strength to tell them Ravana had taken Sita south. Then they met an old woman named Shabari, who had waited her whole life to meet Rama. She welcomed him with simple berries. Many tellings say she tasted each one first to make sure it was sweet, and Rama happily ate them, because they were offered with love.",
      "Then they met the monkey people, called the vanaras. Their prince, Sugriva, who had been driven from his home by his own brother, became Rama's friend. And Sugriva's minister became Rama's most loyal friend of all: Hanuman.",
      "Hanuman was strong, wise and humble. From the moment he met Rama, he devoted his whole life to serving him.",
      "Notice who helps Rama: a wounded bird, a poor old woman and a band of monkeys. Not kings or armies.",
      "The lesson is that help often comes from people others overlook. Every being, no matter how small, can do something great.",
    ],
    verseId: "ramayana-shabari-3-75-3",
    reflect: "Who is someone others overlook who has helped you?",
  },
  {
    title: "Hanuman's great leap",
    body: [
      "The monkeys learned that Sita was being held in Lanka, an island far across the ocean. But who could cross that much water?",
      "Hanuman sat quietly. He had forgotten how strong he really was. As a child, he had been very mischievous with his powers, so sages had made him forget them until the right moment.",
      "An old bear named Jambavan came to him and reminded him: you are the son of the Wind. You can do this. As Hanuman remembered who he was, he grew huge with courage.",
      "He climbed a mountain, chanted Rama's name, and leaped across the whole ocean to Lanka.",
      "There, in a garden, he found Sita, sad but strong. He gave her Rama's ring so she would know he was really sent by Rama, and he promised that Rama was coming.",
      "Sometimes we forget how much strength we have, just like Hanuman. A good friend, teacher or grandparent who says \"You can do this\" can help us remember.",
    ],
    verseId: "ramayana-leap-5-1-6",
    reflect: "Who reminds you of your strength? Whose strength could you remind them of?",
  },
  {
    title: "The bridge and the little squirrel",
    body: [
      "Rama's army reached the ocean's edge, but they still needed to cross. So they decided to build a bridge all the way to Lanka.",
      "The monkeys and bears worked day and night, carrying huge rocks and trees into the sea, and the bridge grew across the water. In many tellings, the stones floated because they were marked with Rama's name.",
      "Many grandparents add a sweet story here. A tiny squirrel wanted to help too. It couldn't carry rocks, so it rolled in the sand on the beach, ran onto the bridge and shook the sand off, filling the tiny gaps between the stones. Again and again.",
      "Some of the monkeys laughed at the little squirrel. But Rama picked it up, thanked it and gently stroked its back with three fingers. People say that's why squirrels in India have three stripes on their backs.",
      "The squirrel's help was small, but it was everything the squirrel had to give, given with love.",
      "No help is too small. What matters is giving your best, whatever size it is.",
    ],
    verseId: "ramayana-bridge-6-22-3",
    reflect: "What \"small\" help could you give that might matter more than you think?",
  },
  {
    title: "Good against pride",
    body: [
      "Once the army crossed into Lanka, a great battle began.",
      "Before the fighting, someone surprising came to Rama's side: Vibhishana, Ravana's own brother. He had begged Ravana to return Sita and make peace. Ravana refused and threw him out. So Vibhishana chose what was right over his own family's side, and Rama welcomed him as a friend.",
      "Ravana was very powerful and very learned. He knew the scriptures and was a great devotee of Shiva. But his pride and his selfish wanting were stronger than his wisdom. Even when he was losing, he would not say sorry or return Sita.",
      "In the end, Rama defeated Ravana, and Sita was free.",
      "Many people find it interesting that Ravana is not simply a monster in the story. He had great gifts. What brought him down was pride, the inability to admit he was wrong.",
      "This is a story about every one of us. We all have gifts. The question is whether our pride gets in the way of doing the right thing.",
    ],
    verseId: "ramayana-ravana-6-111-8",
    reflect: "Is there something you know you should apologize for, but pride is getting in the way?",
  },
  {
    title: "Coming home: the first Diwali",
    body: [
      "At last, the fourteen years were over. Rama, Sita and Lakshmana returned to Ayodhya, along with Hanuman and their new friends.",
      "All this time, Rama's brother Bharata had refused to sit on the throne. He believed it belonged to Rama. He had placed Rama's sandals on it and ruled only as a caretaker until Rama came back.",
      "When the people heard Rama was returning, they were overjoyed. The old poem tells of flowers on every shrine, music and drums, and huge crowds running out to greet him. Families add that on that dark, moonless night, people lit rows and rows of small clay lamps, called diyas, along every street and rooftop to welcome him home.",
      "In many parts of India, this is the story behind Diwali, the festival of lights. Each year, families light diyas to celebrate the return of goodness and the victory of light over darkness.",
      "Rama ruled with such fairness and kindness that, for generations, people have used \"Ram Rajya,\" Rama's rule, to mean an ideal, just world.",
      "So the next time you light a diya, remember the whole story: keeping your word, help from unexpected friends, courage, humility, and the light that always finds its way home.",
    ],
    verseId: "ramayana-homecoming-6-129-21",
    reflect: "What is a \"darkness\" in your life where you could light a small lamp of goodness?",
  },
];

const GODS: Lesson[] = [
  {
    title: "How Ganesha got his elephant head",
    body: [
      "Ganesha is the god with the elephant head. Many Hindu families pray to him first, before starting anything new: a school year, a journey, a new home. But why does he have an elephant's head? Families tell this story in different ways. Here is the best-known one.",
      "The goddess Parvati wanted someone to guard her door while she bathed. So she shaped a boy out of turmeric paste and breathed life into him. She told him, \"Let no one in.\" The boy promised.",
      "Then Shiva, Parvati's husband, came home. He had never met the boy, and the boy had never met him. The boy stood in the doorway and would not let him pass. Neither would give way, and in the fight that followed, Shiva struck off the boy's head.",
      "When Parvati came out and saw what had happened, her grief and anger shook the world. Shiva saw his mistake. He sent his helpers to bring the head of the first living being they found. They came back with the head of a great elephant, and Shiva gave the boy new life with it.",
      "Shiva then made the boy the leader of all his followers, the ganas. That is where the name comes from: Ganesha, or Ganapati, means lord of the ganas. And Shiva promised that Ganesha would be honored first, before every other god.",
      "There is a lot in this story. A child who keeps his promise to his mother. A great god who admits he was wrong and makes it right. And a new beginning that comes out of a terrible mistake. Ganesha is called the remover of obstacles. Maybe that is because he was once an obstacle himself, standing in a doorway, and he became a blessing.",
    ],
    reflect: "Think of a mistake you made. What could you do to make it right, even now?",
  },
  {
    title: "Ganesha writes the Mahabharata",
    body: [
      "The Mahabharata is one of the longest poems in the world. The Bhagavad Gita is one small part of it. It was told by a wise sage named Vyasa. But a poem that long needed someone to write it down.",
      "The god Brahma told Vyasa to ask Ganesha. Ganesha agreed, with one condition: \"My pen must never stop, not even for a moment.\"",
      "Vyasa was clever. He gave his own condition back: \"Then you must understand every verse before you write it down.\" Ganesha said \"Om\" to show he agreed, and they began.",
      "Whenever Vyasa needed time to think, he spoke a verse so deep and tangled that even Ganesha had to stop and work out what it meant. While Ganesha was thinking, Vyasa composed the next part. That is how the great story was written.",
      "In many tellings, Ganesha's pen broke partway through. So he snapped off one of his own tusks and kept writing with it. That's why pictures of Ganesha often show him with one broken tusk.",
      "The story teaches two things. Good work needs both speed and understanding: Ganesha would not write what he did not understand. And when your tools fail, a determined person finds a way to keep going.",
    ],
    verseId: "mahabharata-ganesha-3",
    reflect: "Is there something you do quickly that you should slow down and understand first?",
  },
  {
    title: "Shiva drinks the poison",
    body: [
      "Long ago, the gods and their rivals, the asuras, wanted amrita, the drink that makes you live forever. It was hidden deep in the ocean. To get it, they had to churn the whole ocean, the way you churn milk to make butter.",
      "They used a mountain as the churning stick, and Vasuki, the king of serpents, as the rope. The gods pulled one end and the asuras pulled the other, back and forth, for a very long time.",
      "Wonderful things rose out of the sea: the moon, a white horse, a shining jewel, and the goddess Lakshmi. But then something terrible came up too. A poison called Kalakuta spread over the earth. It blazed like fire, and its fumes made the whole world faint.",
      "Everyone was afraid. Brahma, the creator, asked Shiva for help, and Shiva agreed. To save every living being, he drank the poison himself.",
      "He did not let it go down. He held it in his throat, and it turned his throat blue. That is why Shiva is called Nilakantha, which means the blue-throated one. Pictures of Shiva often show him with a blue neck.",
      "Many at the churning hoped to gain something. Shiva was the one who took the bad part, so the rest of the world could be safe. Sometimes being strong means carrying a hard thing so others don't have to.",
    ],
    verseId: "mahabharata-churning-16",
    reflect: "Who in your life quietly carries hard things so you don't have to? How could you thank them?",
  },
  {
    title: "Shiva catches the Ganga",
    body: [
      "The Ganga is a river Hindus hold especially holy. But there is a story that once, she did not flow on earth at all. She flowed only in heaven.",
      "A king named Bhagiratha wanted to bring her down. Long before, sixty thousand of his ancestors had met their end because of a great sage named Kapila. In many tellings, they angered him and were burned to ashes. They could only find peace if the Ganga's water flowed over their remains.",
      "So Bhagiratha went to the Himalayas and lived very simply for a thousand years, eating only fruit and roots, and praying. Finally, the river goddess Ganga appeared to him and said yes. But she warned him: \"When I fall from the sky, the force will be too much. No one in all the worlds could bear it, except Shiva.\"",
      "So Bhagiratha prayed again, this time to Shiva. Shiva agreed. He stood on the snowy mountain and caught the falling river on his head, so that she came to earth gently instead of smashing it.",
      "That is why pictures of Shiva show the Ganga flowing from his hair. And when people do something that takes enormous, patient effort, they still call it a Bhagiratha effort.",
      "Two lessons are here. Bhagiratha shows that great things take great patience. And Shiva shows that real strength is not always about smashing things. Sometimes it means taking a huge force and making it gentle enough to help.",
    ],
    verseId: "mahabharata-ganga-10",
    reflect: "What is something worth working on for a long time, even if it takes years?",
  },
  {
    title: "Prahlada and the man-lion",
    body: [
      "There was once a proud and powerful king named Hiranyakashipu. He had been granted a special protection, and he thought it made him greater than God. He ordered everyone to worship him instead of Vishnu.",
      "But his own son, a boy named Prahlada, loved Vishnu. He said, gently and without fear, that Vishnu is not just in heaven. He is in everyone, even in his father.",
      "The king was furious. He tried again and again to make his son obey, and when that failed, to hurt him. Serpents, elephants and fire were sent against the boy. Prahlada kept thinking of Vishnu, and none of them could harm him.",
      "Here is the most amazing part. When the king's priests attacked Prahlada and their own magic turned back on them, Prahlada didn't cheer. He prayed for them to live, because, he said, Vishnu was in them too. They rose up unhurt.",
      "In the end, Vishnu came as Narasimha, half man and half lion, and ended the cruel king's rule. Prahlada became a good and kind king himself. In the best-known telling, Narasimha bursts out of a stone pillar, to show that God really is everywhere, just as Prahlada said.",
      "Prahlada was a child, but he was the bravest one in the palace. He stayed kind even to people who tried to hurt him, because he saw God in everyone.",
    ],
    verseId: "vishnu-purana-prahlada-1-18-12",
    reflect: "Is there someone who has been unkind to you that you could still wish well?",
  },
  {
    title: "Vamana's three steps",
    body: [
      "The old book of Vishnu tells this very briefly: Vishnu came as Vamana, and with three steps he won back the worlds and gave them back to Indra. Families tell the fuller story like this.",
      "Bali was a king of the asuras. He was generous, and his people loved him, but he grew so powerful that he took over heaven and the whole world. He was proud of how much he owned.",
      "One day, while Bali was holding a great ceremony, a small boy walked in. He was a young priest, very short, with a gentle smile. His name was Vamana. Bali was famous for giving gifts, so he asked the boy what he wanted.",
      "Vamana said, \"Only as much land as I can cover in three steps.\" Bali laughed. Three tiny steps? Of course!",
      "Then Vamana began to grow. He grew taller than the trees, taller than the mountains, taller than the clouds. With his first step he covered the whole earth. With his second, he covered the sky. Vamana was Vishnu himself, and he gave heaven back to Indra and the gods.",
      "There was nowhere left for the third step. Bali understood. He bowed down and said, \"Put your third step on my head.\" Because Bali kept his promise and gave up his pride, Vishnu blessed him. In Kerala, in the south of India, many families still welcome Bali back every year at the festival of Onam.",
      "The story reminds us that God can come in small, humble forms. And it shows that even a proud person can do something great, by keeping their word and letting go.",
    ],
    verseId: "vishnu-purana-vamana-3-1-1",
    reflect: "When is it hard for you to let go of something you're proud of?",
  },
  {
    title: "Krishna and the serpent Kaliya",
    body: [
      "When Krishna was a boy, he lived among cowherds by the river Yamuna. He played with his friends and looked after the cows. But one part of the river had become deadly.",
      "A huge many-headed serpent named Kaliya lived in a pool there. His poison was so strong that trees on the bank withered, and birds touched by its spray were scorched. The cows and their herders could not drink from it.",
      "Krishna decided to help. He climbed a tall tree and jumped right into the pool. Kaliya and the other serpents rose up and wrapped themselves around him. His friends ran home crying, and the whole village rushed to the river, sure he was lost.",
      "Then Krishna freed himself. He climbed onto Kaliya's great hoods and danced on them, until the proud serpent was tired out and could fight no more.",
      "Kaliya's family begged for mercy, and Krishna gave it. He didn't kill the serpent. He told him to leave the river and go to the sea, far from the village. And he promised that the marks of his feet on Kaliya's head would protect the serpent from his enemies.",
      "Krishna was strong enough to win. But he was also kind enough to forgive. The river was made clean, and even the defeated serpent was given a safe new home.",
    ],
    verseId: "vishnu-purana-kaliya-5-7-23",
    reflect: "When you win an argument or a game, how do you treat the one who lost?",
  },
  {
    title: "Krishna lifts Govardhan Hill",
    body: [
      "Every year, the cowherds of Krishna's village held a big ceremony for Indra, the god of rain. Young Krishna asked them a question: \"Why not honor the things that really feed us: our cows, our forest and Govardhan Hill?\" So that year, they did.",
      "Indra was offended. In his anger, he sent huge storm clouds. Rain poured down like a flood, and the wind howled. The people and their cows were terrified.",
      "Krishna said, \"Don't be afraid.\" Then he lifted the whole of Govardhan Hill with one hand, as if it were a toy, and held it up like a giant umbrella.",
      "Everyone crowded underneath with their cows and wagons. For seven days and nights the rain fell, and Krishna held the mountain steady over their heads. Not one person was harmed.",
      "At last Indra gave up, and the sky cleared. Everyone came out, safe. In many tellings, Indra came down himself and bowed to Krishna.",
      "This story shows God as a shelter when people are frightened, and that pride, even a god's pride, gives way in the end. It also reminds us to be grateful for the land, the animals and the people who quietly keep us alive.",
    ],
    verseId: "vishnu-purana-govardhan-5-11-5",
    reflect: "What are three ordinary things that keep you alive and well that you could be thankful for today?",
  },
  {
    title: "Hanuman meets Bhima",
    body: [
      "Bhima was one of the five Pandava brothers in the Mahabharata. He was the strongest man of his time, and he knew it. One day he was walking through a mountain forest, on his way to find a rare flower.",
      "An old monkey was lying across the narrow path, half asleep. Bhima shouted at him to move. The monkey said, \"I'm old and sick and too weak to get up. If you want to pass, just move my tail out of the way.\"",
      "Bhima laughed and took hold of the tail with one hand. It didn't move. He used both hands. He pulled until his face was red and covered in sweat. He could not even lift it.",
      "Bhima was ashamed of how rudely he had spoken. He bowed, put his hands together and asked, \"Who are you really?\" The monkey smiled. He was Hanuman, the great hero of the Ramayana. And because both of them were sons of the wind god, he was Bhima's brother.",
      "Hanuman showed Bhima the giant form he had taken when he leapt across the sea to find Sita, so huge that Bhima had to close his eyes. Then he hugged his brother, and promised to help him. Hanuman said he would ride on the flag of Arjuna's chariot, Bhima's brother, in the great battle to come.",
      "Bhima learned something that day. However strong you are, there is always someone stronger, and it might be the one you looked down on. Real strength stays humble.",
    ],
    verseId: "mahabharata-hanuman-15",
    reflect: "Have you ever looked down on someone, and then found out you were wrong about them?",
  },
];

export const PATHS: LearningPath[] = [
  {
    slug: "gita-18-days",
    title: "The Gita in 18 days",
    description: "One chapter a day. The great conversation on a battlefield, made simple.",
    forWhom: "Anyone, no background needed",
    totalLessons: 18,
    lessons: GITA,
  },
  {
    slug: "what-is-karma",
    title: "What is karma?",
    description: "Not fate, not punishment. A clearer way to understand action and consequence.",
    forWhom: "Great for students",
    totalLessons: 5,
    lessons: KARMA,
  },
  {
    slug: "yoga-philosophy",
    title: "Yoga beyond the mat",
    description: "The eight limbs of Patanjali, and why posture is only one of them.",
    forWhom: "For anyone who does yoga",
    totalLessons: 8,
    lessons: YOGA,
  },
  {
    slug: "ramayana-stories",
    title: "Stories from the Ramayana",
    description: "Rama, Sita and Hanuman, told slowly, the way grandparents tell them.",
    forWhom: "Lovely to listen to together",
    totalLessons: 7,
    lessons: RAMAYANA,
  },
  {
    slug: "stories-of-the-gods",
    title: "Stories of the gods",
    description: "Ganesha, Shiva, Vishnu, Krishna and Hanuman, in the stories families have told for centuries.",
    forWhom: "For kids and grown-ups together",
    totalLessons: 9,
    lessons: GODS,
  },
];

// Lessons are numbered from 1 in the address: /learn/gita-18-days/4
export const lessonHref = (slug: string, index: number) => `/learn/${slug}/${index + 1}`;
