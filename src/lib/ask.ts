// Client side of /api/ask. Until an Anthropic API key is set on the server, falls back to
// the mock answers so the app keeps working.
import type { AgeGroup, Depth } from "./settings";
import { askSwami as mockAnswer } from "./mock/answers";
import type { SwamiAnswer } from "./swami";
import { PLUS } from "./plans";
import { accessToken, supabase } from "./supabase";

export type PastTurn = { question: string; answer: SwamiAnswer };

const SORRY: SwamiAnswer = {
  paragraphs: ["I couldn't gather my thoughts just now. Please give me a moment and ask again."],
  verses: [],
  notice: "error",
};

// What the model said last time, as plain text, so follow-up questions have context
const asText = (a: SwamiAnswer) =>
  [...a.paragraphs, ...a.verses.map((v) => `(Quoted ${v.verse.source}. ${v.meaning})`)].join("\n\n");

// Whether the signed-in person has Plus, for the out-of-questions message
async function hasPlus() {
  const sb = supabase();
  const { data } = (await sb?.from("plus_members").select("expires_at").maybeSingle()) ?? { data: null };
  return Boolean(data) && (data!.expires_at === null || new Date(data!.expires_at) > new Date());
}

export type LessonContext = { title: string; text: string };

export async function askSwami(
  question: string,
  depth: Depth,
  ageGroup: AgeGroup | null,
  history: PastTurn[] = [],
  lesson?: LessonContext, // when asked from inside a lesson
): Promise<SwamiAnswer> {
  try {
    // Signed-in people are counted by their account for the daily limit
    const token = await accessToken();
    const res = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({
        question,
        depth,
        ageGroup,
        lesson,
        history: history.slice(-3).map((t) => ({ question: t.question, answer: asText(t.answer) })),
      }),
    });
    if (res.status === 503) {
      // No API key yet: the practice answers are about general topics, not lessons, so be honest
      return lesson
        ? {
            paragraphs: ["The Swami can't answer questions about lessons just yet. This will switch on very soon."],
            verses: [],
            notice: "error",
          }
        : mockAnswer(question, depth);
    }
    if (res.status === 429) {
      const { error } = (await res.json().catch(() => ({}))) as { error?: string };
      if (error === "limit") {
        if (token && (!PLUS.enabled || (await hasPlus()))) {
          return {
            paragraphs: ["That's all the questions for today. Rest with what we talked about, and come back tomorrow."],
            verses: [],
            notice: "limit",
          };
        }
        return token
          ? {
              paragraphs: [
                `That's your ${PLUS.questions.free} questions for today. Rest with what we talked about, and come back tomorrow. With Plus, you can ask up to ${PLUS.questions.plus} a day.`,
              ],
              verses: [],
              notice: "limit",
              plusPrompt: true,
            }
          : {
              paragraphs: [
                "That's your 3 free questions for today. Sign in, free, for more each day, and to keep our conversations.",
              ],
              verses: [],
              notice: "limit",
              signInPrompt: true,
            };
      }
    }
    if (!res.ok) return SORRY;
    return (await res.json()) as SwamiAnswer;
  } catch {
    return SORRY;
  }
}
