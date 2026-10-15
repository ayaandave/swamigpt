"""Builds data/scripture/ramayana.json: the Ramayana cantos behind the "Stories from the Ramayana"
lessons, in Ralph T. H. Griffith's English verse translation (1870-1874, public domain).

  - Rama leaves for the forest: Book 2, Cantos 19 and 40
  - The golden deer: Book 3, Cantos 43-44
  - Jatayu: Book 3, Cantos 68-69
  - Shabari: Book 3, Canto 75
  - Hanuman meets Rama: Book 4, Cantos 3 and 5
  - Hanuman's leap: Book 5, Canto 1
  - The bridge to Lanka: Book 6, Canto 22, from the Ocean's advice to build it
  - Ravana's fall: Book 6, Cantos 110-111
  - Coming home: Book 6, Cantos 129-130

Griffith's verse keeps its line breaks. Each stanza is cut into passages of a few lines, always
where a sentence ends.

Text: Project Gutenberg's transcription (ebook 24869), checked word by word against a scan of the
printed five-volume edition (scripts/check-ramayana-scan.py). Passages left out, and why, are in
LEAVE_OUT (also summed up on the Sources page).

Usage: python3 scripts/build-ramayana.py <cache-dir>
"""
import json
import os
import re
import sys
import urllib.request

ROOT = os.path.join(os.path.dirname(__file__), "..")
OUT = os.path.join(ROOT, "data", "scripture", "ramayana.json")
UA = "SwamiGPT-build/0.1 (personal non-commercial project)"
TRANSLATOR = "Ralph T. H. Griffith (1870–1874)"
BODY_START = 660  # lines before this are the table of contents
ROMAN_BOOKS = {1: "I", 2: "II", 3: "III", 4: "IV", 5: "V", 6: "VI"}

# key, name, [(book, canto)]
STORIES = [
    ("exile", "Rama leaves for the forest", [(2, 19), (2, 40)]),
    ("deer", "The golden deer", [(3, 43), (3, 44)]),
    ("jatayu", "Jatayu", [(3, 68), (3, 69)]),
    ("shabari", "Shabari", [(3, 75)]),
    ("hanuman-meets-rama", "Hanuman meets Rama", [(4, 3), (4, 5)]),
    ("leap", "Hanuman's leap", [(5, 1)]),
    ("bridge", "The bridge to Lanka", [(6, 22)]),
    ("ravana", "Ravana's fall", [(6, 110), (6, 111)]),
    ("homecoming", "Coming home", [(6, 129), (6, 130)]),
]
# Cantos kept only from these words on (Book 6, Canto 22 is mostly Rama's quarrel with the Ocean)
FROM = {(6, 22): "Then spake the king of brooks and seas"}

# Passages left out by id, with the reason (also summed up on the Sources page)
LEAVE_OUT: dict = {
    "ramayana-deer-3-43-24": "the tale of Vatapi, whose flesh the saints ate and who burst out of them: gruesome",
    "ramayana-deer-3-43-26": "the rest of the Vatapi tale, praising the Brahman caste",
    "ramayana-jatayu-3-69-21": "Rama slaying deer for funeral offerings: ritual detail, upsetting for children",
    "ramayana-jatayu-3-69-22": "funeral libations, ritual detail needing footnotes",
    "ramayana-shabari-3-75-18": "Shabari giving her body to the flames; a child could misread it",
    "ramayana-hanuman-meets-rama-4-5-4": "blames the exile on \"woman's guile\"",
    "ramayana-leap-5-1-38": "Hanuman tearing the demon's body from inside: gory",
}

# Where the transcription differs from the printed book (scripts/check-ramayana-scan.py):
# (passage id, transcription, book)
FIXES: list = [
    ("ramayana-exile-2-19-18", "reverent stops", "reverent steps"),
    ("ramayana-exile-2-19-23", "the dread tiding unrevealed", "the dread tidings unrevealed"),
    ("ramayana-exile-2-40-7", "Oueen", "Queen"),
    ("ramayana-deer-3-43-27", "This wondrous deer will bring or take.", "This wondrous deer will kill or take."),
    ("ramayana-deer-3-44-2", "Where’er the fleeing deer", "Where’er the flying deer"),
    ("ramayana-deer-3-44-3", "Now running with a languid flight", "Now luring with a languid flight"),
    ("ramayana-deer-3-44-6", "Resplendent at the sunbeam’s glow", "Resplendent as the sunbeam’s glow"),
    ("ramayana-deer-3-44-7", "With skillful heed", "With skilful heed"),
    ("ramayana-deer-3-44-7", "Fixed well shaft", "Fixed well the shaft"),
    ("ramayana-deer-3-44-7", "that wonderous dart", "that wondrous dart"),
    ("ramayana-deer-3-44-13", "away the the fallen buck", "away the fallen buck"),
    ("ramayana-jatayu-3-68-7", "The dying bird essayed to speak", "The dying bird assayed to speak"),
    ("ramayana-jatayu-3-68-15", "birds that play the wing", "birds that ply the wing"),
    ("ramayana-shabari-3-75-15", "The tender spray, this bright-hued flower", "The tender spray, the bright-hued flower"),
    ("ramayana-hanuman-meets-rama-4-3-7", "Heroic youth,", "Heroic youths,"),
    ("ramayana-hanuman-meets-rama-4-3-14", "The counselor we", "The counsellor we"),
    ("ramayana-leap-5-1-1", "his soul has dared", "his soul had dared"),
    ("ramayana-leap-5-1-10", "A wonderous deed", "A wondrous deed"),
    ("ramayana-leap-5-1-11", "Rose swifty", "Rose swiftly"),
    ("ramayana-leap-5-1-19", "by the favour of the sire", "by the favour of thy sire"),
    ("ramayana-leap-5-1-26", "shouldst them hinder", "shouldst thou hinder"),
    ("ramayana-ravana-6-110-5", "Rákahas", "Rákshas"),
    ("ramayana-ravana-6-111-5", "weep for those", "weep for these"),
    ("ramayana-homecoming-6-129-9", "cheuries", "chouries"),
    ("ramayana-homecoming-6-130-9", "Ayodbyá", "Ayodhyá"),
    ("ramayana-homecoming-6-130-15", "Kátváyan", "Kátyáyan"),
]


def fetch(cache):
    path = os.path.join(cache, "24869.txt")
    if not os.path.exists(path):
        req = urllib.request.Request("https://www.gutenberg.org/cache/epub/24869/pg24869.txt", headers={"User-Agent": UA})
        with urllib.request.urlopen(req) as r, open(path, "wb") as f:
            f.write(r.read())
    return open(path, encoding="utf-8").read().replace("\r\n", "\n").split("\n")


def roman(n):
    vals = [(100, "C"), (90, "XC"), (50, "L"), (40, "XL"), (10, "X"), (9, "IX"), (5, "V"), (4, "IV"), (1, "I")]
    out = ""
    for v, r in vals:
        while n >= v:
            out += r
            n -= v
    return out


def canto_lines(lines, book, canto):
    """(title, the canto's lines), from its heading to the next canto, book or the appendix."""
    start_book = None
    for i in range(BODY_START, len(lines)):
        if re.match(rf"^BOOK {ROMAN_BOOKS[book]}\.(?:\(\d+\))?$", lines[i]):
            start_book = i
            break
    if start_book is None:
        sys.exit(f"Book {book} not found")
    heading = re.compile(rf"^Canto {roman(canto)}\. (.+)$")
    for i in range(start_book, len(lines)):
        m = heading.match(lines[i])
        if m:
            title = re.sub(r"\(\d+\)", "", m.group(1)).strip().rstrip(".")
            out = []
            for line in lines[i + 1 :]:
                if re.match(r"^(Canto [IVXLC]+\.|BOOK [IVX]+\.|APPENDIX\.)", line):
                    break
                out.append(line)
            return title, out
        if i > start_book and re.match(r"^BOOK [IVX]+\.", lines[i]):
            break
    sys.exit(f"Canto {book}.{canto} not found")


def clean(line):
    line = re.sub(r"\(\d+\)", "", line)  # footnote markers
    line = line.replace("--", "—")
    return re.sub(r"\s+", " ", line).strip()


def stanzas(body):
    """Stanzas as lists of lines; blank lines separate them."""
    out, cur = [], []
    for raw in body:
        line = clean(raw)
        if not line:
            if cur:
                out.append(cur)
                cur = []
            continue
        cur.append(line)
    if cur:
        out.append(cur)
    return out


ENDS = re.compile(r"[.!?][”’\"')]*$")
SOFT = re.compile(r"[;:][”’\"')]*$")


def chunk(stanza):
    """Cut a stanza into passages of about 4-10 lines, at a sentence end where possible."""
    out, cur = [], []
    for line in stanza:
        cur.append(line)
        size = sum(len(x) for x in cur)
        if ENDS.search(line) and (len(cur) >= 6 or size >= 330):
            out.append(cur)
            cur = []
        elif len(cur) >= 12 and SOFT.search(line):
            out.append(cur)
            cur = []
    if cur:
        if out and len(cur) <= 2:
            out[-1] = out[-1] + cur
        else:
            out.append(cur)
    return out


def main(cache):
    lines = fetch(cache)
    passages = []
    for key, name, cantos in STORIES:
        for book, canto in cantos:
            title, body = canto_lines(lines, book, canto)
            if (book, canto) in FROM:
                first = FROM[(book, canto)]
                at = next(i for i, l in enumerate(body) if first in l)
                body = body[at:]
            # Short stanzas run together until a passage is long enough
            pending, n = [], 0
            for st in stanzas(body):
                for piece in chunk(pending + st) if len(pending) + len(st) >= 4 else [None]:
                    if piece is None:
                        pending = pending + st
                        break
                    pending = []
                    n += 1
                    num = f"{book}.{canto}.{n}"
                    passages.append(
                        {
                            "id": f"ramayana-{key}-{book}-{canto}-{n}",
                            "source": f"Ramayana {num}",
                            "section": key,
                            "sectionName": name,
                            "number": num,
                            "partName": f"Book {book}, Canto {canto}: {title}",
                            "translation": "\n".join(piece),
                            "translator": TRANSLATOR,
                        }
                    )
            if pending:
                last = passages[-1]
                last["translation"] += "\n" + "\n".join(pending)

    by_id = {p["id"]: p for p in passages}
    for pid, wrong, right in FIXES:
        if pid not in by_id or wrong not in by_id[pid]["translation"]:
            sys.exit(f"{pid}: fix no longer matches: {wrong!r}")
        by_id[pid]["translation"] = by_id[pid]["translation"].replace(wrong, right)

    missing = set(LEAVE_OUT) - set(by_id)
    if missing:
        sys.exit(f"LEAVE_OUT names passages that don't exist: {sorted(missing)}")
    kept = [p for p in passages if p["id"] not in LEAVE_OUT]
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(kept, f, ensure_ascii=False, indent=0)
        f.write("\n")
    counts = {}
    for p in kept:
        counts[p["section"]] = counts.get(p["section"], 0) + 1
    print(f"{len(kept)} passages {counts}; {len(LEAVE_OUT)} left out")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else ".")
