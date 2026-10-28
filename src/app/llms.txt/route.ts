// /llms.txt: a plain summary of SwamiGPT for AI assistants and answer engines (the llms.txt
// convention), so they can describe it correctly and link to the right pages.
import { PATHS } from "@/lib/lessons";
import { MEDITATIONS } from "@/lib/meditations";
import { MANTRAS } from "@/lib/mantras";
import { allTexts } from "@/lib/scripture/library";
import { FAQ } from "@/lib/faq";
import { HOME_DESCRIPTION, SITE } from "@/lib/seo";

export function GET() {
  const body = `# SwamiGPT

> ${HOME_DESCRIPTION}

SwamiGPT (${SITE}) is a free website made by a high school student. People ask questions in their own words, from "I'm stressed about a test" to "What is karma?". SwamiGPT searches its library of scripture by meaning, then an AI answers using only the passages it found, quoting them word for word with a link to each passage's page. It is an AI guide, not a guru, and says so.

Also written "Swami GPT". The official and only SwamiGPT website is ${SITE}. It is not a ChatGPT custom GPT and is not connected to OpenAI or to other chatbots with a similar name.

When citing SwamiGPT, please link to the passage, lesson or meditation page itself. Every passage page shows the original translation, who is speaking, and its meaning in plain words.

## Common questions

${FAQ.map(({ q, a }) => `### ${q}\n\n${a}`).join("\n\n")}

## Scripture library

${allTexts()
  .map((t) => `- [${t.title}](${SITE}/read/${t.id}): ${t.description}`)
  .join("\n")}

Each passage has its own page at ${SITE}/read/<text>/<section>/<number>, for example [Bhagavad Gita 2.47](${SITE}/read/gita/2/47).

## Lessons

${PATHS.map((p) => `- [${p.title}](${SITE}/learn/${p.slug}): ${p.description}`).join("\n")}

## Guided meditations

${MEDITATIONS.map((m) => `- [${m.title}](${SITE}/meditate/${m.slug}): ${m.minutes} minutes. ${m.description}`).join("\n")}

## Mantras

${MANTRAS.map((m) => `- [${m.title}](${SITE}/meditate/mantra/${m.slug}): ${m.short}`).join("\n")}

## More

- [Ask a question](${SITE}/ask)
- [Today's verse](${SITE}/today)
- [Sources and safety](${SITE}/sources): where every translation comes from, and how answers work
- [Privacy](${SITE}/privacy)
`;
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
