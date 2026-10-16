// Common questions about SwamiGPT, answered plainly. Shown on the Sources page, and given to search
// engines and AI assistants (as FAQ structured data and in /llms.txt) so they describe SwamiGPT
// correctly. Server only: it counts the library.
import "server-only";
import { PLUS } from "./plans";
import { PASSAGES } from "./scripture/library";
import { TEXTS } from "./scripture/texts";

const count = PASSAGES.length.toLocaleString("en-US");
const texts = TEXTS.map((t) => t.title.replace(/^The /, "the ").split(":")[0]);
const textList = `${texts.slice(0, -1).join(", ")} and the teachings of ${texts.at(-1)}`;

export const FAQ: { q: string; a: string }[] = [
  {
    q: "What is SwamiGPT?",
    a: "SwamiGPT is a free website that answers questions about life, Hindu philosophy, yoga and meditation using real Hindu scriptures. It also has short lessons, guided meditations, mantras and a verse for each day.",
  },
  {
    q: "Where do SwamiGPT's answers come from?",
    a: `Before it answers, SwamiGPT searches a library of ${count} passages by meaning, not just by matching words. The AI then answers using only the passages it found. Every quoted passage links to its own page, so you can read it yourself.`,
  },
  {
    q: "Which scriptures are in the library?",
    a: `The library has ${textList}. They are free English translations that are in the public domain, and each passage has its meaning in plain words.`,
  },
  {
    q: "Is SwamiGPT a real guru or teacher?",
    a: "No. SwamiGPT is an AI guide, not a guru. It can make mistakes, and it doesn't replace a teacher, a temple, a parent or a doctor. If an answer seems wrong, tap “Report this answer” and a person will check it.",
  },
  {
    q: "Do I have to be Hindu to use SwamiGPT?",
    a: "No. SwamiGPT is for anyone who is curious, of any faith or none. It explains every idea in plain words and never assumes you already know the stories or rituals.",
  },
  {
    q: "Is SwamiGPT free?",
    a: `Yes. Lessons, meditations, mantras and the whole scripture library are free with no limit. You can ask ${PLUS.questions.guest} questions a day without an account, or ${PLUS.questions.free} with a free account.${PLUS.enabled ? ` SwamiGPT Plus, a paid plan, gives ${PLUS.questions.plus} questions a day and more answers read aloud.` : ""}`,
  },
  {
    q: "Is SwamiGPT safe for kids?",
    a: "Yes. Children under 13 need a parent or guardian to make an account, and their answers use simpler words. There are no ads. If someone seems to be in danger, SwamiGPT points them to the 988 Suicide & Crisis Lifeline.",
  },
];

export const faqData = {
  "@type": "FAQPage",
  mainEntity: FAQ.map(({ q, a }) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
};
