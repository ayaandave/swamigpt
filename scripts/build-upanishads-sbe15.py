"""Add the Taittiriya, Brihadaranyaka and Shvetashvatara Upanishads, in Max Muller's translation,
to data/scripture/upanishads.json (beside the six from build-upanishads.py).

Source: F. Max Muller, The Upanishads, Part II, Sacred Books of the East vol. 15 (Oxford, 1884),
public domain. Wikisource doesn't have these three, so the text is the proofread transcription
from sacred-texts.com (J. B. Hare), as saved by the Internet Archive. It was checked word by word
against a scan of the printed book (scripts/check-sbe15-scan.py); the few places where the
transcription differs from the book are corrected below, with the book's reading.

Kept: the numbered verses, and the unnumbered paragraphs that belong to them.
Dropped: Muller's footnotes, the transcription's page marks, opening blessings ("Adoration to
the Highest Self"), and from the Brihadaranyaka the lists of teachers (2.6, 4.6, 6.5), the ritual
for wealth (6.3) and the rites for conceiving a child (6.4), which aren't fit for a family app.
Verses are cited by section and verse, e.g. Brihadaranyaka Upanishad 4.4.5, Shvetashvatara
Upanishad 6.23, Taittiriya Upanishad 2.1.1 (valli, anuvaka, verse).

Usage: python3 scripts/build-upanishads-sbe15.py <cache-dir> [--verses out.json]
  --verses also writes every parsed verse (left-out ones too), for check-sbe15-scan.py.
"""
import collections
import gzip
import json
import os
import re
import sys
import time
import urllib.request

UA = "SwamiGPT-build/0.1 (personal non-commercial project)"
TEXT_URL = "https://web.archive.org/web/20100107001441id_/http://sacred-texts.com/hin/sbe15/sbe15.txt.gz"
OUT = os.path.join(os.path.dirname(__file__), "..", "data", "scripture", "upanishads.json")

# slug, name, where it starts and ends in the transcription, heading levels in the citation
UPANISHADS = [
    ("taittiriya", "Taittiriya Upanishad", "TAITTIRIYAKA-UPANISHAD.", "BRIHADARANYAKA-UPANISHAD.", ["valli", "anuvaka"]),
    ("brihadaranyaka", "Brihadaranyaka Upanishad", "BRIHADARANYAKA-UPANISHAD.", "SVETASVATARA-UPANISHAD.", ["adhyaya", "brahmana"]),
    ("shvetashvatara", "Shvetashvatara Upanishad", "SVETASVATARA-UPANISHAD.", "PRASNA-UPANISHAD.", ["adhyaya"]),
]
LEFT_OUT = {"brihadaranyaka": ("2.6.", "4.6.", "6.3.", "6.4.", "6.5.")}
# The order the Upanishads are usually read in, so the library lists them that way
ORDER = ["isha", "kena", "katha", "prashna", "mundaka", "mandukya", "taittiriya", "chandogya",
         "brihadaranyaka", "shvetashvatara"]

ORDINALS = {
    w: i + 1
    for i, w in enumerate(
        "first second third fourth fifth sixth seventh eighth ninth tenth eleventh twelfth thirteenth "
        "fourteenth fifteenth sixteenth seventeenth eighteenth nineteenth twentieth".split()
    )
}
ORDINALS["eight"] = 8

# Where the transcription differs from the printed book (checked against the scan): verse
# numbers it lost or mistyped, and its typos, as (citation, transcription's reading, book's).
NUMBER_FIXES = {
    "1. 'Yagnavalkya, he said, 'everything here (connected": "3. 'Yagnavalkya,' he said, 'everything here (connected",
    "The pupil the latter, knowledge their union.": "3. The pupil the latter, knowledge their union.",
}
FIXES = [
    ("taittiriya 1.1.1", "HARIH, OM!", "Harih, Om!"),
    ("taittiriya 1.9.1", "The night, and learning", "The right, and learning"),
    ("taittiriya 1.11.4", "Thus conduct thyself 'This", "Thus conduct thyself. 'This"),
    ("taittiriya 2.9.1", "He who knows the bliss of that Brahman", "'He who knows the bliss of that Brahman"),
    ("taittiriya 2.5.1", "of the latter. joy is its head", "of the latter. Joy is its head"),
    ("taittiriya 2.7.1", "there is fear for him}.", "there is fear for him."),
    ("taittiriya 3.1.1", "Varuna, saying: Sir, teach", "Varuna, saying: 'Sir, teach"),
    ("taittiriya 3.5.1", "Varuna, saying—'Sir", "Varuna, saying: 'Sir"),
    ("taittiriya 3.7.1", "able to cat food", "able to eat food"),
    ("brihadaranyaka 1.3.4", "that was for himself The Asuras", "that was for himself. The Asuras"),
    ("brihadaranyaka 1.3.18", "if ever anyone tries", "if ever any one tries"),
    ("brihadaranyaka 1.3.26", "its gold. is tone", "its gold is tone"),
    ("brihadaranyaka 1.5.2", "imperishable one, I then,", "imperishable one,' then,"),
    ("brihadaranyaka 2.1.11", "is not cut off from him,", "is not cut off from him."),
    ("brihadaranyaka 2.1.20", "from that Self The Upanishad", "from that Self. The Upanishad"),
    ("brihadaranyaka 2.4.8", "And as the sounds of a conch-shell", "'And as the sounds of a conch-shell"),
    ("brihadaranyaka 2.5.14", "honey of this Self Likewise", "honey of this Self. Likewise"),
    ("brihadaranyaka 2.5.17", "O ye strong ones.", "O ye strong ones.'"),
    ("brihadaranyaka 3.2.3", "one pronounces names.", "one pronounces names.'"),
    ("brihadaranyaka 3.5.1", "'Yagnavalkya, 'he said", "'Yagnavalkya,' he said"),
    ("brihadaranyaka 3.6.1", "O Gargi, 'he replied", "O Gargi,' he replied"),
    ("brihadaranyaka 3.9.24", "does speech abide Yagnavalkya", "does speech abide?' Yagnavalkya"),
    ("brihadaranyaka 3.9.26", "Yagnavalkya said: In the Apana", "Yagnavalkya said: 'In the Apana"),
    ("brihadaranyaka 4.3.36", "as be came", "as he came"),
    ("brihadaranyaka 4.3.27", "But. there is", "But there is"),
    ("brihadaranyaka 4.3.33", "not overcome. by desire", "not overcome by desire"),
    ("brihadaranyaka 4.4.4", "And as a goldsmith", "'And as a goldsmith"),
    ("brihadaranyaka 4.5.6", "then all this is known!", "then all this is known.'"),
    ("brihadaranyaka 5.1.1", "(the visible Brahman) is full}.", "(the visible Brahman) is full."),
    ("brihadaranyaka 6.2.16", "(see section 11)", "(see § 11)"),
    ("shvetashvatara 3.14", "a thousand heads. a thousand eyes", "a thousand heads, a thousand eyes"),
]
SKIP = re.compile(r"^(OR, THE CHAPTER|Adoration to the\b)")
VERSE_START = re.compile(r"^\d+(?: ?\[\*\d+\])*\.,? ")
# A verse number at the start of a paragraph, or mid-paragraph where Muller runs short verses
# together ("Om means Brahman. 2. Om means all this.")
NUMBER = re.compile(r"(?:^|(?<=[.!?;:'\"\]] ))(\d+)(?: ?\[\*\d+\])*\.,? (?=\S)")


def fetch(cache):
    path = os.path.join(cache, "sbe15.txt.gz")
    if not os.path.exists(path):
        time.sleep(2)
        req = urllib.request.Request(TEXT_URL, headers={"User-Agent": UA})
        with urllib.request.urlopen(req) as r, open(path, "wb") as f:
            f.write(r.read())
    return gzip.open(path, "rt", encoding="latin-1").read().replace("\r", "")


def heading(p):
    """('anuvaka', 3) for 'THIRD ANUVAKA.', None for anything else."""
    m = re.match(r"^([A-Za-z]+) (VALLI|ANUVAKA|ADHYAYA|BRAHMANA)\b[^a-z]*$", p)
    if m and m.group(1).lower() in ORDINALS:
        return m.group(2).lower(), ORDINALS[m.group(1).lower()]
    return None


def paragraphs(block):
    """The text's paragraphs, without footnotes, page marks or the site's running line. A
    paragraph cut in two by a page mark is joined back together."""
    out, in_notes, after_page = [], False, False
    for raw in block.split("\n"):
        line = raw.strip()
        if not line:
            continue
        for wrong, right in NUMBER_FIXES.items():
            if line.startswith(wrong):
                line = right + line[len(wrong) :]
        line = re.sub(r"^(\d) (\d)(?=(?: ?\[\*\d+\])*\. )", r"\1\2", line)  # "2 1." typed for "21."
        if line == "Footnotes":
            in_notes = True
            continue
        if line.startswith("The Upanishads, Part 2 (SBE15)"):
            in_notes = False
            continue
        if re.fullmatch(r"\[p\. [\divxlc]+\w*\]", line):
            in_notes, after_page = False, True  # footnotes end where the next page begins
            continue
        if in_notes or re.match(r"^\^\d+:\d+ ", line):
            continue  # footnotes ("^204:1 It may mean...") also turn up after a page mark
        starts_new = heading(line) or VERSE_START.match(line) or line == line.upper()
        if after_page and out and not starts_new and (not re.search(r"[.!?'\")\]:]$", out[-1]) or re.match(r"^[a-z]", line)):
            out[-1] += " " + line
        else:
            out.append(line)
        after_page = False
    return out


def tidy(text):
    text = re.sub(r"\s*\[\*\d+\]", "", text)  # footnote markers
    text = re.sub(r"\[paragraph continues\]\s*", "", text)
    text = re.sub(r"\s*\[p\. [\divxlc]+\w*\]", "", text)
    text = re.sub(r"(^|\s)\(\d+(?:-\d+)?\)(?=\s|$)", r"\1", text)  # Muller's paragraph counts, "(1-5)"
    text = re.sub(r"\s+([,.;:!?)])", r"\1", text)
    text = text.replace("--", "—")  # the transcription types the book's dash as two hyphens
    return " ".join(text.split())


def parse(text, start, end, levels):
    """{citation number: text} for one Upanishad."""
    i = text.index("\n" + start)
    block = text[i : text.index("\n" + end, i)]
    cut = block.find("For reasons of Victorian modesty")  # the site's appended Hume translation of 6.4
    if cut > 0:
        block = block[:cut]
    at = {lvl: 0 for lvl in levels}
    verses, cur, expect = collections.OrderedDict(), None, 1
    for p in paragraphs(block)[1:]:
        h = heading(p)
        if h:
            at[h[0]] = h[1]
            for lower in levels[levels.index(h[0]) + 1 :]:
                at[lower] = 0
            cur, expect = None, 1
            continue
        if SKIP.match(p) or not all(at.values()):
            continue  # chapter subtitles, blessings, and anything before the first section
        base = ".".join(str(at[lvl]) for lvl in levels)
        pieces, pos = [], 0
        for m in NUMBER.finditer(p):
            if int(m.group(1)) != expect:
                continue
            if m.start() > pos:
                pieces.append((None, p[pos : m.start()].strip()))
            pieces.append((expect, ""))
            pos, expect = m.end(), expect + 1
        rest = p[pos:].strip()
        if pieces and pieces[-1][0] is not None and not pieces[-1][1]:
            pieces[-1] = (pieces[-1][0], rest)
        elif rest:
            pieces.append((None, rest))
        for n, t in pieces:
            if n is not None:
                cur = f"{base}.{n}"
                verses[cur] = [t]
            elif cur and cur.rpartition(".")[0] == base:
                verses[cur].append(t)
            else:  # a section printed as one unnumbered paragraph is its verse 1
                cur, expect = f"{base}.1", 2
                verses[cur] = [t]
    return {k: tidy(" ".join(v)) for k, v in verses.items()}


def main(cache, verses_out=None):
    os.makedirs(cache, exist_ok=True)
    text = fetch(cache)
    fixes = {}
    for cite, wrong, right in FIXES:
        fixes.setdefault(cite, []).append((wrong, right))
    new, parsed = [], {}
    for slug, name, start, end, levels in UPANISHADS:
        verses = parse(text, start, end, levels)
        count = 0
        for num, t in verses.items():
            for wrong, right in fixes.pop(f"{slug} {num}", []):
                if t.count(wrong) != 1:
                    sys.exit(f"the fix for {slug} {num} should match once: {wrong!r}")
                t = t.replace(wrong, right)
            parsed.setdefault(slug, {})[num] = t
            if num.startswith(LEFT_OUT.get(slug, ())):
                continue
            new.append(
                {
                    "id": f"upanishads-{slug}-{num.replace('.', '-')}",
                    "source": f"{name} {num}",
                    "section": slug,
                    "sectionName": name,
                    "number": num,
                    "translation": t,
                    "translator": "Max Müller (1879–1884)",
                }
            )
            count += 1
        print(f"{name}: {count} verses")
    if fixes:
        sys.exit(f"fixes for verses that weren't found: {list(fixes)}")
    # Every section's verses should run 1, 2, 3... with no gaps
    groups = collections.defaultdict(list)
    for p in new:
        head, _, n = p["number"].rpartition(".")
        groups[(p["section"], head)].append(int(n))
    for (slug, head), ns in groups.items():
        if ns != list(range(1, len(ns) + 1)):
            sys.exit(f"{slug} {head}: verses {ns} have a gap")
    if verses_out:
        json.dump(parsed, open(verses_out, "w"), ensure_ascii=False, indent=1)
    slugs = {s for s, *_ in UPANISHADS}
    old = [p for p in json.load(open(OUT)) if p["section"] not in slugs]
    merged = sorted(old + new, key=lambda p: ORDER.index(p["section"]))  # stable: verse order kept
    with open(OUT, "w") as f:
        json.dump(merged, f, ensure_ascii=False, indent=1)
    print(f"wrote {len(merged)} verses to {os.path.normpath(OUT)}")


if __name__ == "__main__":
    args = sys.argv[1:]
    main(args[0], args[args.index("--verses") + 1] if "--verses" in args else None)
