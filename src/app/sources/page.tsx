import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sources & safety · SwamiGPT",
  description: "Where SwamiGPT's scriptures come from, how its answers work, and where to find real help.",
};

const SOURCES = [
  {
    text: "Bhagavad Gita: Sanskrit and transliteration",
    from: "The open-source Gita dataset at github.com/gita/gita, shared under the Unlicense (free for anyone to use).",
  },
  {
    text: "Bhagavad Gita: English translation",
    from: "Annie Besant, The Bhagavad-Gita, 4th edition (1922). In the public domain; text from the proofread edition on Wikisource.",
  },
  {
    text: "“In plain words” notes",
    from: "Written for SwamiGPT with the help of AI, to put each verse in everyday English. The translation above each note is the original.",
  },
];

export default function SourcesPage() {
  return (
    <div className="pt-10">
      <h1 className="font-display text-[2.4rem] leading-tight">Sources &amp; safety</h1>

      <section className="mt-8">
        <h2 className="font-display text-[1.6rem]">How SwamiGPT answers</h2>
        <div className="mt-3 flex max-w-[60ch] flex-col gap-3 text-[1.05rem] leading-relaxed">
          <p>
            SwamiGPT is an AI guide, not a guru. It doesn&apos;t replace a teacher, a temple, a parent or a doctor,
            and it can make mistakes.
          </p>
          <p>
            When it quotes scripture, the words come from the texts listed below, never from memory, and every quote
            shows exactly where it comes from. When it mentions what a teacher taught, it describes the idea in its
            own words rather than quoting them.
          </p>
          <p>
            Hindu thought has many schools, and they don&apos;t always agree. SwamiGPT tries to say so plainly
            instead of choosing a side.
          </p>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-[1.6rem]">Texts and translations</h2>
        <ul className="mt-4 flex flex-col gap-3">
          {SOURCES.map((s) => (
            <li key={s.text} className="rounded-2xl border-2 border-sandal-edge px-5 py-4">
              <p className="font-semibold">{s.text}</p>
              <p className="mt-1 text-[1rem] text-kajal-soft">{s.from}</p>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[0.95rem] text-kajal-soft">
          More texts (the Upanishads, Yoga Sutras and Swami Vivekananda&apos;s Complete Works) will be listed here as
          they are added.
        </p>
      </section>

      <section className="mt-10 rounded-[2rem] bg-tulsi px-7 py-6 text-sandal">
        <h2 className="font-display text-[1.6rem]">If you are struggling</h2>
        <p className="mt-2 max-w-[56ch] text-[1.05rem] leading-relaxed">
          If you are thinking about hurting yourself, or you are in danger, please talk to a real person now.
        </p>
        <ul className="mt-4 flex flex-col gap-2 text-[1.05rem]">
          <li>
            <a href="tel:988" className="font-bold underline">
              Call or text 988
            </a>{" "}
            in the United States, any time.
          </li>
          <li>
            Outside the US:{" "}
            <a href="https://findahelpline.com" className="font-bold underline">
              findahelpline.com
            </a>{" "}
            lists free helplines in your country.
          </li>
          <li>In an emergency, call your local emergency number.</li>
        </ul>
      </section>

      <p className="mt-10">
        <Link href="/" className="font-semibold text-kesar-deep hover:underline">
          ← Back to Ask
        </Link>
      </p>
    </div>
  );
}
