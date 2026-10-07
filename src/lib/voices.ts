import type { VoiceId } from "./settings";

export type Voice = {
  id: VoiceId;
  name: string;
  description: string;
  sample: string;
  // Placeholder tuning for the browser voice until ElevenLabs is connected
  pitch: number;
  prefer: "male" | "female" | "any";
};

export const VOICES: Voice[] = [
  {
    id: "swamiji",
    name: "Swamiji",
    description: "An elder's voice. Deep, slow and unhurried.",
    sample: "Namaste. Sit for a moment. There is no hurry here.",
    pitch: 0.7,
    prefer: "male",
  },
  {
    id: "amma",
    name: "Amma",
    description: "A warm teacher. Gentle, like a grandmother telling a story.",
    sample: "Come, child. Let us look at this question together.",
    pitch: 1.05,
    prefer: "female",
  },
  {
    id: "sakshi",
    name: "Sakshi",
    description: "A clear, even narrator. Calm without a strong character.",
    sample: "Let us begin. Breathe in slowly, and let the breath go.",
    pitch: 0.95,
    prefer: "any",
  },
];

export function getVoice(id: VoiceId) {
  return VOICES.find((v) => v.id === id) ?? VOICES[0];
}
