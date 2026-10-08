// MOCK scripture library. Phase 2 replaces this with the searchable Supabase library.
// Translations here are our own plain-English renderings.

import type { Verse } from "../scripture/types";

export type { Verse };

export const VERSES: Record<string, Verse> = {
  "gita-2-47": {
    id: "gita-2-47",
    source: "Bhagavad Gita 2.47",
    sanskrit: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन ।\nमा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि ॥",
    transliteration:
      "karmaṇy evādhikāras te mā phaleṣu kadācana\nmā karma-phala-hetur bhūr mā te saṅgo 'stv akarmaṇi",
    translation:
      "Your right is to the work alone, never to its fruits. Do not let the fruit be your motive, and do not cling to doing nothing.",
  },
  "gita-2-14": {
    id: "gita-2-14",
    source: "Bhagavad Gita 2.14",
    sanskrit: "मात्रास्पर्शास्तु कौन्तेय शीतोष्णसुखदुःखदाः ।\nआगमापायिनोऽनित्यास्तांस्तितिक्षस्व भारत ॥",
    transliteration:
      "mātrā-sparśās tu kaunteya śītoṣṇa-sukha-duḥkha-dāḥ\nāgamāpāyino 'nityās tāṁs titikṣasva bhārata",
    translation:
      "Cold and heat, pleasure and pain, come from the touch of the senses. They come and they go; they do not last. Bear them patiently.",
  },
  "gita-2-20": {
    id: "gita-2-20",
    source: "Bhagavad Gita 2.20",
    sanskrit:
      "न जायते म्रियते वा कदाचिन् नायं भूत्वा भविता वा न भूयः ।\nअजो नित्यः शाश्वतोऽयं पुराणो न हन्यते हन्यमाने शरीरे ॥",
    transliteration:
      "na jāyate mriyate vā kadācin nāyaṁ bhūtvā bhavitā vā na bhūyaḥ\najo nityaḥ śāśvato 'yaṁ purāṇo na hanyate hanyamāne śarīre",
    translation:
      "The Self is never born and never dies. It did not come into being, and it will not cease to be. Unborn, eternal, ancient, it is not slain when the body is slain.",
  },
  "gita-6-5": {
    id: "gita-6-5",
    source: "Bhagavad Gita 6.5",
    sanskrit: "उद्धरेदात्मनात्मानं नात्मानमवसादयेत् ।\nआत्मैव ह्यात्मनो बन्धुरात्मैव रिपुरात्मनः ॥",
    transliteration:
      "uddhared ātmanātmānaṁ nātmānam avasādayet\nātmaiva hy ātmano bandhur ātmaiva ripur ātmanaḥ",
    translation:
      "Lift yourself up by your own self; do not let yourself sink. The self alone is your friend, and the self alone can be your enemy.",
  },
  "gita-6-35": {
    id: "gita-6-35",
    source: "Bhagavad Gita 6.35",
    sanskrit: "असंशयं महाबाहो मनो दुर्निग्रहं चलम् ।\nअभ्यासेन तु कौन्तेय वैराग्येण च गृह्यते ॥",
    transliteration:
      "asaṁśayaṁ mahā-bāho mano durnigrahaṁ calam\nabhyāsena tu kaunteya vairāgyeṇa ca gṛhyate",
    translation:
      "Without doubt, the mind is restless and hard to hold. But it can be steadied by practice and by letting go.",
  },
  "ys-1-2": {
    id: "ys-1-2",
    source: "Yoga Sutras 1.2",
    sanskrit: "योगश्चित्तवृत्तिनिरोधः ॥",
    transliteration: "yogaś citta-vṛtti-nirodhaḥ",
    translation: "Yoga is the stilling of the movements of the mind.",
  },
  "brihad-1-3-28": {
    id: "brihad-1-3-28",
    source: "Brihadaranyaka Upanishad 1.3.28",
    sanskrit: "असतो मा सद्गमय ।\nतमसो मा ज्योतिर्गमय ।\nमृत्योर्मामृतं गमय ॥",
    transliteration: "asato mā sad gamaya\ntamaso mā jyotir gamaya\nmṛtyor mā amṛtaṁ gamaya",
    translation: "Lead me from the unreal to the real. Lead me from darkness to light. Lead me from death to immortality.",
  },
  "isha-1": {
    id: "isha-1",
    source: "Isha Upanishad 1",
    sanskrit: "ईशा वास्यमिदं सर्वं यत्किञ्च जगत्यां जगत् ।\nतेन त्यक्तेन भुञ्जीथा मा गृधः कस्यस्विद्धनम् ॥",
    transliteration:
      "īśā vāsyam idaṁ sarvaṁ yat kiñca jagatyāṁ jagat\ntena tyaktena bhuñjīthā mā gṛdhaḥ kasya svid dhanam",
    translation:
      "All of this, whatever moves in this moving world, is filled with the Lord. Enjoy it by letting go. Do not covet anyone's wealth.",
  },
};
