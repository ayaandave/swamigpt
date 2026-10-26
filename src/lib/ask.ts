// Client side of /api/ask. Until an Anthropic API key is set on the server, falls back to
// the mock answers so the app keeps working.
import type { AgeGroup, Depth } from "./settings";
import { askSwami as mockAnswer } from "./mock/answers";
import { CRISIS, CRISIS_HELP, type SwamiAnswer } from "./swami";
import { PLUS } from "./plans";
import { plusSold } from "./plus";
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

async function fetchAnswer(
  question: string,
  depth: Depth,
  ageGroup: AgeGroup | null,
  history: PastTurn[] = [],
  lesson?: LessonContext, // when asked from inside a lesson
  about?: string, // the library passage they were reading, by id
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
        about,
        history: history.slice(-3).map((t) => ({ question: t.question, answer: asText(t.answer).slice(0, 4000) })),
      }),
    });
    if (res.status === 503) {
      // No API key: only while building on this Mac do the practice answers stand in. On the live site
      // that's a fault, and saying so is more honest than a made-up answer
      if (process.env.NODE_ENV === "production") {
        return {
          paragraphs: ["The Swami can't answer right now. Please try again in a little while."],
          verses: [],
          notice: "error",
        };
      }
      // The practice answers are about general topics, not lessons, so be honest
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
      if (error === "site_limit") {
        return {
          paragraphs: [
            "SwamiGPT has answered so many questions today that it is resting until tomorrow. Please come back then. The lessons, meditations and library are all still open.",
          ],
          verses: [],
          notice: "limit",
        };
      }
      if (error === "limit") {
        if (token && (!plusSold() || (await hasPlus()))) {
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

// Every reply, even "that's all for today" or an error, shows the 988 card when the question
// sounds like someone may be in danger. The check runs here on the phone, so it never depends
// on the server, the daily limit or the AI.
export async function askSwami(...args: Parameters<typeof fetchAnswer>): Promise<SwamiAnswer> {
  const answer = await fetchAnswer(...args);
  return CRISIS.test(args[0]) && !answer.help ? { ...answer, help: CRISIS_HELP } : answer;
}
