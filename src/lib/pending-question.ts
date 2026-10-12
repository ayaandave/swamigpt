// A question typed on the home screen, handed to the Ask page to send straight away. It travels
// in this tab's session storage, not the link, so a shared link, a refresh or the back button
// never asks (and pays for) a question again. Taken once: reading it clears it.
const KEY = "swami-pending-question";

export function setPendingQuestion(question: string): boolean {
  try {
    sessionStorage.setItem(KEY, question);
    return true;
  } catch {
    return false;
  }
}

export function takePendingQuestion(): string {
  try {
    const question = sessionStorage.getItem(KEY) ?? "";
    sessionStorage.removeItem(KEY);
    return question.slice(0, 500);
  } catch {
    return "";
  }
}
