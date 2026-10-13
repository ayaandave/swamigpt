import Link from "next/link";
import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Use · SwamiGPT",
  description: "The simple rules for using SwamiGPT and SwamiGPT Plus.",
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Use"
      intro="These are the rules for using SwamiGPT. By using it, you agree to them. If you are under 18, please read them with a parent or guardian."
    >
      <section>
        <h2>What SwamiGPT is</h2>
        <p>
          SwamiGPT is an AI guide to Hindu philosophy, yoga and meditation. It is a guide, not a guru. It never speaks
          for God or for any real teacher, and no teacher or organization endorses it.
        </p>
        <p>
          Answers are written by AI. We work hard to keep them faithful, and they quote only from the translations
          listed on our{" "}
          <Link href="/sources" className="font-semibold text-kesar-deep underline underline-offset-4">
            Sources
          </Link>{" "}
          page, but AI can still make mistakes. For important decisions, talk with people you trust.
        </p>
      </section>

      <section>
        <h2>Not professional help</h2>
        <p>
          SwamiGPT is not medical, mental health, legal or financial advice. If you are thinking about hurting yourself,
          or you are in danger, call or text 988 in the United States, or your local emergency number, right away.
        </p>
      </section>

      <section>
        <h2>Using it kindly</h2>
        <ul>
          <li>Don&apos;t use SwamiGPT to harm, harass or mislead anyone.</li>
          <li>Don&apos;t try to get around the daily limits, break the site, or copy it in bulk with automated tools.</li>
          <li>If you make an account, keep your password private. Children under 13 need a parent to make the account.</li>
        </ul>
        <p>We may limit or close accounts that break these rules.</p>
      </section>

      <section>
        <h2>SwamiGPT Plus</h2>
        <ul>
          <li>Plus is a subscription. It renews automatically each month or year until you cancel.</li>
          <li>
            You can cancel any time. On the website, use &quot;Manage or cancel your plan&quot; on the Plus page. In the
            iPhone app, use your Apple subscription settings. You keep Plus until the end of the time you paid for.
          </li>
          <li>
            If there is a free trial, you won&apos;t be charged if you cancel before it ends. Refunds follow the rules
            of the store you paid through (Stripe on the website, Apple in the app).
          </li>
          <li>If prices change, we will tell you before your next renewal, and you can cancel first.</li>
          <li>
            Plus gives you more questions and read-aloud answers. Everyone gets the same quality of answers, with or
            without Plus. Limits may change to keep SwamiGPT fair and affordable to run.
          </li>
        </ul>
      </section>

      <section>
        <h2>The content</h2>
        <p>
          The scripture translations are public domain or openly licensed, as listed on the Sources page, and so are the
          mantra recordings. SwamiGPT&apos;s own lessons, meditations, design and code belong to SwamiGPT. You may share
          your own answers, but please don&apos;t copy the app itself.
        </p>
      </section>

      <section>
        <h2>No promises beyond these</h2>
        <p>
          We offer SwamiGPT as it is, and can&apos;t promise it will always be available or free of mistakes. As far
          as the law allows, SwamiGPT isn&apos;t responsible for decisions made because of an answer, or for losses
          from using the app. If you have Plus, the most we would owe you is what you paid in the last 12 months.
        </p>
      </section>

      <section>
        <h2>Changes</h2>
        <p>
          We may update these terms as SwamiGPT grows. We will change the date at the top, and tell people with
          accounts about big changes. Using SwamiGPT after that means you accept the new terms.
        </p>
      </section>
    </LegalPage>
  );
}
