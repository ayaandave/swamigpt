"""Build data/scripture/gita.json: all 701 Bhagavad Gita verses.

Sources (both safe to ship in the app):
  - Sanskrit + transliteration: github.com/gita/gita (Unlicense). We use only the
    Sanskrit text and its romanisation, not the modern translations in that repo,
    which are still under their translators' copyright.
  - English: Annie Besant's translation, 4th edition (1922), public domain,
    proofread on Wikisource.

Usage: python3 scripts/build-gita.py <cache-dir>
Downloads are cached in <cache-dir>, so re-runs don't hit Wikisource again.
"""
import html
import json
import os
import re
import sys
import time
import urllib.request

UA = "SwamiGPT-build/0.1 (personal non-commercial project)"
GITA_RAW = "https://raw.githubusercontent.com/gita/gita/main/data/{}.json"
WIKISOURCE = (
    "https://en.wikisource.org/w/api.php?action=parse&format=json&prop=text"
    "&page=Bhagavad-Gita_(Besant_4th)/Discourse_{}"
)
DEV = str.maketrans("०१२३४५६७८९", "0123456789")
# Speaker lines, read from the transliteration (the Sanskrit omits Krishna's)
SPEAKER_LINE = re.compile(r"^(śhrī[- ]bhagavān|arjuna|sañjaya|dhṛitarāśhtra) uvācha$")
SPEAKERS = {"śhrī bhagavān": "Krishna", "śhrī-bhagavān": "Krishna", "arjuna": "Arjuna",
            "sañjaya": "Sanjaya", "dhṛitarāśhtra": "Dhritarashtra"}
# Words the printed edition broke across a line, which Wikisource kept split
SPLIT_WORDS = {"griev ed": "grieved", "investiga tion": "investigation"}
OUT = os.path.join(os.path.dirname(__file__), "..", "data", "scripture", "gita.json")


def fetch(url, path, pause=0):
    if os.path.exists(path):
        with open(path) as f:
            body = f.read()
        if body.startswith(("{", "[")):
            return json.loads(body)
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    for attempt in range(5):
        time.sleep(pause + attempt * 20)  # Wikisource rate-limits bursts
        body = urllib.request.urlopen(req).read().decode()
        if body.startswith(("{", "[")):
            with open(path, "w") as f:
                f.write(body)
            return json.loads(body)
    sys.exit(f"could not fetch {url}")


def sic(m):
    # Wikisource marks proofreading fixes as [sic] tooltips; keep the corrected word,
    # drop the ones that only fix a verse-number marker like '(31)'.
    fix = html.unescape(m.group(1)).replace("[sic]", "").strip().strip("'")
    return "" if re.fullmatch(r"\(?\d+\)?", fix) else " " + fix + " "


def besant_chapter(page):
    """{verse number: English} for one Wikisource chapter page.

    Each verse is a Sanskrit block ending in '॥ N ॥' followed by Besant's English, so we
    swap every Sanskrit block for a marker and take the text between markers.
    """
    t = page["parse"]["text"]["*"]
    t = re.sub(r"<style.*?</style>", "", t, flags=re.S)
    t = re.sub(r'<sup[^>]*class="reference".*?</sup>', "", t, flags=re.S)
    t = re.sub(r'<ol class="references".*', "", t, flags=re.S)
    t = re.sub(r'<span class="pagenum.*?</span></span>', "", t, flags=re.S)
    t = re.sub(
        r'<span class="wst-tooltip[^"]*" title="([^"]*)">[^<]*<span class="wst-gap[^>]*></span></span>', sic, t
    )

    def block(m):
        nums = re.findall(r"॥\s*([०-९]+)\s*॥", m.group(1))
        return f" @@V{nums[-1].translate(DEV)}@@ " if nums else " @@V?@@ "

    t = re.sub(r'<div class="wst-lang" lang="sa"[^>]*>(.*?)</div>\s*</div>\s*</div>', block, t, flags=re.S)
    s = html.unescape(re.sub(r"<[^>]+>", " ", t)).replace("​", "")
    s = re.sub(r"\[\d+\]", "", s)
    out = {}
    for m in re.finditer(r"@@V(\d+)@@(.*?)(?=@@V|$)", s, flags=re.S):
        n = int(m.group(1))
        eng = re.sub(r"\(\d+(?:[-–]\d+)?\)|\(\d+\b|\b\d+\)", " ", m.group(2))  # verse markers, some malformed
        eng = re.split(r"\bHere endeth\b|\bThus in the\b", eng)[0]  # chapter colophon
        eng = re.sub(r"[ऀ-ॿ]+", " ", eng)
        eng = " ".join(eng.replace(" ;", ";").replace(" ,", ",").replace(" .", ".").split())
        eng = re.sub(r"^(?:The Blessed Lord|Arjuna|Sanjaya|Dhritarâshtra) said:\s*", "", eng)
        if eng or n not in out:  # the colophon reuses '॥ chapter ॥'; never let it clobber a verse
            out[n] = eng
    return out


def clean_sanskrit(text):
    body = re.sub(r"^\s*(?:अर्जुन|सञ्जय|संजय|धृतराष्ट्र) उवाच\s*", "", text.strip())
    body = re.sub(r"\s*।।\s*\d+\.\d+\s*।।\s*$", " ॥", body)  # trailing '।।2.47।।'
    body = re.sub(r"।(?=\S)", "।\n", body)  # a few half-verses are glued together
    return "\n".join(l.strip() for l in body.splitlines() if l.strip()).replace("।।", "॥")


def split_transliteration(text):
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    who = None
    if lines and (m := SPEAKER_LINE.match(lines[0])):
        who = SPEAKERS[m.group(1)]
        lines = lines[1:]
    return who, "\n".join(lines)


def main(cache):
    os.makedirs(cache, exist_ok=True)
    verses = fetch(GITA_RAW.format("verse"), os.path.join(cache, "verse.json"))
    chapters = fetch(GITA_RAW.format("chapters"), os.path.join(cache, "chapters.json"))
    names = {c["chapter_number"]: c["name_meaning"] for c in chapters}
    besant = {}
    for ch in range(1, 19):
        page = fetch(WIKISOURCE.format(ch), os.path.join(cache, f"besant-{ch}.json"), pause=3)
        besant[ch] = besant_chapter(page)

    speaker = "Dhritarashtra"
    out = []
    for v in sorted(verses, key=lambda v: (v["chapter_number"], v["verse_number"])):
        ch, n = v["chapter_number"], v["verse_number"]
        who, translit = split_transliteration(v["transliteration"])
        speaker = who or speaker
        english = besant[ch].get(n)
        if not english:
            sys.exit(f"no English for {ch}.{n}")
        for split, word in SPLIT_WORDS.items():
            english = english.replace(split, word)
        out.append(
            {
                "id": f"gita-{ch}-{n}",
                "source": f"Bhagavad Gita {ch}.{n}",
                "chapter": ch,
                "chapterName": names[ch],
                "verse": n,
                "speaker": speaker,
                "sanskrit": clean_sanskrit(v["text"]),
                "transliteration": translit,
                "translation": english,
                "translator": "Annie Besant (1922)",
            }
        )
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w") as f:
        json.dump(out, f, ensure_ascii=False, indent=1)
    print(f"wrote {len(out)} verses to {os.path.normpath(OUT)}")


if __name__ == "__main__":
    main(sys.argv[1])
