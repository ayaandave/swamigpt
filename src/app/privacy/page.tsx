import Link from "next/link";
import type { Metadata } from "next";
import { CONTACT, LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy · SwamiGPT",
  description: "What SwamiGPT keeps, why, who helps us run it, and how to delete your data.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro="SwamiGPT keeps as little about you as it can. We never sell your information, never show ads, and never use your questions to advertise to you. Here is exactly what happens to your information."
    >
      <section>
        <h2>Without an account</h2>
        <p>You can use all of SwamiGPT without signing in.</p>
        <ul>
          <li>
            Your questions are sent to our AI provider to write the answer. We don&apos;t save them anywhere once
            you get your answer.
          </li>
          <li>
            Your settings (like text size, voice and age group) are saved only on your device.
          </li>
          <li>
            To keep free use fair, we count how many questions you ask each day and how much is read aloud. We count
            these by a scrambled code made from your internet address. The code can&apos;t be turned back into the
            address, and it isn&apos;t linked to your name.
          </li>
        </ul>
      </section>

      <section>
        <h2>With an account</h2>
        <p>If you make an account, we also keep:</p>
        <ul>
          <li>Your email address and a protected copy of your password, so you can sign in.</li>
          <li>Your conversations (questions and answers), so you can come back to them.</li>
          <li>Your settings, your age group and your lesson progress, so they follow you to every device.</li>
          <li>Daily counts of questions and read-aloud audio, linked to your account.</li>
          <li>If you join SwamiGPT Plus: which plan you have and when it renews.</li>
        </ul>
        <p>
          You can delete your account any time from{" "}
          <Link href="/account" className="font-semibold text-kesar-deep underline underline-offset-4">
            your account page
          </Link>
          . That deletes all of the above, for good.
        </p>
      </section>

      <section>
        <h2>Who helps us run SwamiGPT</h2>
        <p>These companies handle information only to provide their part of the service:</p>
        <ul>
          <li>
            <strong>Anthropic</strong> writes the answers. It receives your question, a few recent messages from the
            same conversation, and your age group. Its terms for apps like ours say it doesn&apos;t train its AI on
            this information.
          </li>
          <li>
            <strong>ElevenLabs</strong> makes the read-aloud voice. It receives the text being read: answers, lessons,
            verses and meditations. Read-aloud audio is saved so it can play again without being made twice. Each saved
            file is named with a code made from its text, and can&apos;t be found without that exact text.
          </li>
          <li>
            <strong>Supabase</strong> stores accounts and saved data. <strong>Vercel</strong> hosts the website and
            counts visits without cookies or tracking you across other sites.
          </li>
          <li>
            For SwamiGPT Plus, <strong>Stripe</strong> (on the website) or <strong>Apple</strong> (in the iPhone app)
            take your payment, and <strong>RevenueCat</strong> tells us whether your plan is active. Your card details
            go to them, never to us.
          </li>
        </ul>
      </section>

      <section>
        <h2>Children</h2>
        <p>
          Children under 13 can use SwamiGPT without an account. To make an account, a parent or guardian must sign up.
          Answers for children who tell us they are under 13 are written more simply. If you believe a child under 13
          made an account without a parent, email us and we will delete it.
        </p>
      </section>

      <section>
        <h2>Keeping it safe</h2>
        <p>
          Your saved information is protected so that only you can read it when signed in. Connections to SwamiGPT are
          encrypted. No service is perfectly secure, so please don&apos;t share things you would never want anyone to
          see, like passwords or medical records.
        </p>
      </section>

      <section>
        <h2>Your choices</h2>
        <ul>
          <li>Use SwamiGPT without an account.</li>
          <li>Delete single conversations, or your whole account, any time.</li>
          <li>
            Ask us for a copy of your information, or to correct or delete it, at{" "}
            <a href={`mailto:${CONTACT}`} className="underline underline-offset-2">
              {CONTACT}
            </a>
            .
          </li>
        </ul>
      </section>

      <section>
        <h2>Changes</h2>
        <p>If we change this policy, we will update the date at the top, and tell people with accounts about big changes.</p>
      </section>
    </LegalPage>
  );
}
