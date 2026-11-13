"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useSettings, type AgeGroup, type Familiarity, type Focus } from "@/lib/settings";
import { track } from "@/lib/events";
import { Om } from "./Om";

// First-visit welcome: a few one-tap screens (one question each), then a short "preparing your
// guide" moment, and they land on Ask with questions suggested for them. No account needed:
// the first answer comes before any sign-in. Hidden by CSS before first paint once finished (see
// settingsScript), so returning visitors go straight to the app. Never on the home screen:
// newcomers see what SwamiGPT is first, and are welcomed when they go further in.
type Step = "welcome" | "age" | "focus" | "familiarity" | "time" | "preparing";
const STEPS: Step[] = ["welcome", "age", "focus", "familiarity", "time", "preparing"];

const FOCUS: { id: Focus; label: string }[] = [
  { id: "stress", label: "Stress and worry" },
  { id: "school", label: "School and my future" },
  { id: "relationships", label: "Family and relationships" },
  { id: "faith", label: "Faith and practice" },
  { id: "curious", label: "Just curious" },
];
const FAMILIARITY: { id: Familiarity; label: string }[] = [
  { id: "none", label: "Not at all" },
  { id: "little", label: "A little" },
  { id: "grew-up", label: "I grew up with it" },
];
const MINUTES = [1, 5, 10] as const;

const SOURCES = ["Bhagavad Gita", "Upanishads", "Yoga Sutras", "Swami Vivekananda"];

const choice =
  "min-h-14 w-full rounded-2xl border border-sandal-edge px-5 py-3 text-left text-[1.1rem] font-semibold hover:border-kesar hover:bg-sandal-deep";
const primary =
  "min-h-14 w-full rounded-2xl bg-kesar px-6 text-[1.1rem] font-bold text-on-kesar hover:bg-kesar-deep hover:text-sandal";

export function WelcomeGate() {
  const { ageGroup, update } = useSettings();
  const path = usePathname();
  const [step, setStep] = useState<Step>("welcome");
  const [answers, setAnswers] = useState<{
    ageGroup?: AgeGroup;
    focus?: Focus | null;
    familiarity?: Familiarity | null;
    dailyMinutes?: 1 | 5 | 10 | null;
  }>({});

  const hidden = Boolean(ageGroup) || path === "/";
  useEffect(() => {
    if (!hidden) track("onboarding_step_viewed", { step });
  }, [step, hidden]);

  // "Preparing your guide": a short calm pause, then everything is saved at once (saving the age
  // is what hides this screen, so it waits until the end)
  useEffect(() => {
    if (step !== "preparing") return;
    const t = setTimeout(() => {
      update({
        ageGroup: answers.ageGroup ?? "13plus",
        focus: answers.focus ?? null,
        familiarity: answers.familiarity ?? null,
        dailyMinutes: answers.dailyMinutes ?? null,
      });
      track("onboarding_completed", {
        focus: answers.focus ?? "skipped",
        familiarity: answers.familiarity ?? "skipped",
        minutes: answers.dailyMinutes ?? 0,
      });
    }, 1600);
    return () => clearTimeout(t);
  }, [step, answers, update]);

  if (hidden) return null;

  const next = (patch: typeof answers = {}) => {
    setAnswers((a) => ({ ...a, ...patch }));
    setStep(STEPS[STEPS.indexOf(step) + 1]);
  };
  const back = () => setStep(STEPS[Math.max(0, STEPS.indexOf(step) - 1)]);
  const questionIndex = ["focus", "familiarity", "time"].indexOf(step);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-title"
      className="welcome-gate fixed inset-0 z-50 flex flex-col items-center overflow-y-auto bg-sandal px-6 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] text-center"
    >
      <div className="flex min-h-11 w-full max-w-md items-center justify-between">
        {step !== "welcome" && step !== "preparing" ? (
          <button type="button" onClick={back} className="min-h-11 px-2 text-[1rem] text-kajal-soft hover:text-kajal">
            ← Back
          </button>
        ) : (
          <span />
        )}
        {questionIndex >= 0 && (
          <button type="button" onClick={() => next()} className="min-h-11 px-2 text-[1rem] text-kajal-soft hover:text-kajal">
            Skip
          </button>
        )}
      </div>

      <div key={step} className="arrive my-auto flex w-full max-w-md flex-col items-center py-6">
        {step === "welcome" && (
          <>
            <Om size={120} />
            <h1 id="welcome-title" className="mt-6 font-display text-[2rem] leading-[1.1]">
              Wisdom for whatever you&apos;re facing.
            </h1>
            <ul className="mt-5 flex flex-col gap-2 text-[1.05rem] text-kajal-soft">
              <li>Ask about your life, and get a calm answer.</li>
              <li>Every answer comes from real scripture.</li>
              <li>Learn and meditate, a few minutes a day.</li>
            </ul>
            <button type="button" onClick={() => next()} className={`${primary} mt-10`}>
              Get started
            </button>
            <p className="mt-6 text-[0.85rem] text-kajal-soft">An AI guide, not a guru.</p>
          </>
        )}

        {step === "age" && (
          <>
            <h1 id="welcome-title" className="font-display text-[1.6rem] leading-tight">
              How old are you?
            </h1>
            {/* Under-13s can use the app freely; making an account needs a parent (see the login page) */}
            <div className="mt-8 grid w-full grid-cols-2 gap-3">
              <button type="button" onClick={() => next({ ageGroup: "under13" })} className={`${choice} text-center`}>
                Under 13
              </button>
              <button type="button" onClick={() => next({ ageGroup: "13plus" })} className={`${choice} text-center`}>
                13 or older
              </button>
            </div>
          </>
        )}

        {step === "focus" && (
          <Question title="What brings you here?">
            {FOCUS.map(({ id, label }) => (
              <button key={id} type="button" onClick={() => next({ focus: id })} className={choice}>
                {label}
              </button>
            ))}
          </Question>
        )}

        {step === "familiarity" && (
          <Question title="How well do you know the Bhagavad Gita?">
            {FAMILIARITY.map(({ id, label }) => (
              <button key={id} type="button" onClick={() => next({ familiarity: id })} className={choice}>
                {label}
              </button>
            ))}
          </Question>
        )}

        {step === "time" && (
          <Question title="How much time do you have each day?">
            {MINUTES.map((m) => (
              <button key={m} type="button" onClick={() => next({ dailyMinutes: m })} className={choice}>
                {m} {m === 1 ? "minute" : "minutes"}
              </button>
            ))}
          </Question>
        )}

        {step === "preparing" && (
          <>
            <Om size={96} state="thinking" />
            <h1 id="welcome-title" className="mt-6 font-display text-[1.6rem] leading-tight">
              Preparing your guide…
            </h1>
            <ul className="arrive mt-5 flex flex-col gap-1 font-mono text-[0.8rem] text-kajal-soft">
              {SOURCES.map((s) => (
                <li key={s}>
                  <span className="text-kesar-deep">✓</span> {s}
                </li>
              ))}
            </ul>
            <p className="mt-8 max-w-[34ch] text-[0.9rem] text-kajal-soft">
              Your conversations are private and never used to train public AI models.
            </p>
          </>
        )}
      </div>

      {questionIndex >= 0 && (
        <ol aria-label={`Question ${questionIndex + 1} of 3`} className="flex gap-2 pb-2">
          {[0, 1, 2].map((i) => (
            <li key={i} className={`size-2 rounded-full ${i <= questionIndex ? "bg-kesar" : "bg-sandal-edge"}`} />
          ))}
        </ol>
      )}
    </div>
  );
}

function Question({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
      <h1 id="welcome-title" className="font-display text-[1.6rem] leading-tight">
        {title}
      </h1>
      <div className="mt-8 flex w-full flex-col gap-3">{children}</div>
    </>
  );
}
