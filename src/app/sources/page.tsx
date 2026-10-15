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
    text: "Yoga Sutras of Patanjali: Sanskrit, translation and explanation",
    from: "Swami Vivekananda, Raja-Yoga (1896), from the proofread Complete Works on Wikisource; public domain. Sutra numbers follow his edition (195 sutras; some editions count 196). Transliteration generated from the Sanskrit.",
  },
  {
    text: "The Upanishads (Isha, Kena, Katha, Mundaka, Prashna, Chandogya): English",
    from: "F. Max Müller, The Upanishads, Sacred Books of the East volumes 1 (1879) and 15 (1884); public domain, from the proofread edition on Wikisource. His bracketed narration, essays and footnotes are left out, and three verse numbers in the Katha (1.3.15–17) follow the standard numbering. Müller spells some names the old way, e.g. Nakiketas for Nachiketa.",
  },
  {
    text: "The Upanishads (Taittiriya, Brihadaranyaka, Shvetashvatara): English",
    from: "F. Max Müller, Sacred Books of the East volume 15 (1884); public domain. Text from the proofread sacred-texts.com transcription (as saved by the Internet Archive), checked word by word against a scan of the printed book, with its few slips corrected to the book's reading. Footnotes are left out, and so are the Brihadaranyaka's lists of teachers and its passages on rituals (6.3–6.4).",
  },
  {
    text: "The Mandukya Upanishad: English",
    from: "Robert Ernest Hume, The Thirteen Principal Upanishads (Oxford, 1921); public domain. Typed from the page images of the printed book; footnotes and the editor's headings are left out.",
  },
  {
    text: "The Mahabharata: Vidura Niti and the Yaksha Prashna",
    from: "Kisari Mohan Ganguli, The Mahabharata of Krishna-Dwaipayana Vyasa (1883–1896); public domain. Vidura Niti is Udyoga Parva sections 33–40, and the Yaksha Prashna is Vana Parva section 311. Text from Project Gutenberg's transcription, checked word by word against a scan of the printed book. Only Vidura's own words are kept, cut into short passages; two of the Yaksha's questions are left out because the printed book itself lost part of their wording.",
  },
  {
    text: "The Mahabharata: stories of the gods",
    from: "The same Ganguli translation: Ganesha writing the epic (Adi Parva section 1), the churning of the ocean (Adi Parva 17–18), the Ganga's descent onto Shiva (Vana Parva 108–109), and Hanuman meeting Bhima (Vana Parva 145–150, leaving out a long talk on the ages of the world). Checked against the printed book the same way.",
  },
  {
    text: "The Vishnu Purana: Lakshmi, Prahlada, Vamana and Krishna",
    from: "Manmatha Nath Dutt, A Prose English Translation of Vishnupuranam (Calcutta, 1896); public domain. Part 1 sections 9 and 17–20, the Vamana passage of Part 3 section 1, and Part 5 sections 7, 10 and 11. Text from Project Gutenberg's transcription, checked word by word against a scan of the printed book, with a few printer's slips in names corrected. Four short passages are left out: two promising rewards for reciting, one describing the body with disgust, and one about an animal offering.",
  },
  {
    text: "The Ramayana: Rama's journey",
    from: "Ralph T. H. Griffith, The Rámáyan of Válmíki, translated into English verse (London, 1870–1874); public domain. The cantos behind the Ramayana lessons: Rama's exile, the golden deer, Jatayu, Shabari, Hanuman meeting Rama and his leap, the bridge to Lanka, Ravana's fall and the homecoming. Text from Project Gutenberg's transcription, checked word by word against a scan of the first edition. Griffith's spelling of names is kept (Ráma, Sítá, Savarí for Shabari). Seven short passages are left out for gore, ritual detail, or a line blaming 'woman's guile'.",
  },
  {
    text: "Swami Vivekananda: Chicago addresses, Karma-Yoga, Raja-Yoga, Bhakti-Yoga, Jnana-Yoga",
    from: "His own books and speeches (1893–1899), from The Complete Works of Swami Vivekananda on Wikisource; public domain. Later volumes and material first published after his death are not included, because they may still be in copyright. Each chapter is divided into short passages; chapter headings and editors' notes are left out.",
  },
  {
    text: "Mantra recordings",
    from: "Om: “OM AUM Mantra Male Chant” by Carlos Carty, CC BY 4.0 (Freesound). Gayatri Mantra: chanted by Rameshvar, CC0 public domain (Wikimedia Commons). Mahamrityunjaya Mantra: “Mahamrityunjay mantra” by afleetingspeck, CC0 public domain (Freesound). Each was evened in volume and given short fades; the tanpura drone is played live in the app, tuned to each voice.",
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
          More texts (including more Upanishads) will be listed here as they are added.
        </p>
        <p className="mt-6 text-[0.95rem] text-kajal-soft">
          Home photo of the ghats of Varanasi by{" "}
          <a href="https://unsplash.com/@aimanness" className="font-semibold underline underline-offset-4">
            Aimanness Harun
          </a>{" "}
          on{" "}
          <a href="https://unsplash.com/photos/_rxWnmOZ4YA" className="font-semibold underline underline-offset-4">
            Unsplash
          </a>
          .
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
        <Link href="/privacy" className="font-semibold text-kesar-deep hover:underline">
          Privacy Policy
        </Link>
        {" · "}
        <Link href="/terms" className="font-semibold text-kesar-deep hover:underline">
          Terms of Use
        </Link>
      </p>
      <p className="mt-4">
        <Link href="/" className="font-semibold text-kesar-deep hover:underline">
          ← Back home
        </Link>
      </p>
    </div>
  );
}
