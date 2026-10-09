// Client side of /api/ask. Until an Anthropic API key is set on the server, falls back to
// the mock answers so the app keeps working.
import type { AgeGroup, Depth } from "./settings";
import { askSwami as mockAnswer } from "./mock/answers";
import type { SwamiAnswer } from "./swami";

export type PastTurn = { question: string; answer: SwamiAnswer };

const SORRY: SwamiAnswer = {
  paragraphs: ["I couldn't gather my thoughts just now. Please give me a moment and ask again."],
  verses: [],
};

// What the model said last time, as plain text, so follow-up questions have context
const asText = (a: SwamiAnswer) =>
  [...a.paragraphs, ...a.verses.map((v) => `(Quoted ${v.verse.source}. ${v.meaning})`)].join("\n\n");

export async function askSwami(
  question: string,
  depth: Depth,
  ageGroup: AgeGroup | null,
  history: PastTurn[] = [],
): Promise<SwamiAnswer> {
  try {
    const res = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question,
        depth,
        ageGroup,
        history: history.slice(-3).map((t) => ({ question: t.question, answer: asText(t.answer) })),
      }),
    });
    if (res.status === 503) return mockAnswer(question, depth);
    if (!res.ok) return SORRY;
    return (await res.json()) as SwamiAnswer;
  } catch {
    return SORRY;
  }
}
