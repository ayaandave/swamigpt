"""Check the Taittiriya, Brihadaranyaka and Shvetashvatara text from build-upanishads-sbe15.py
word by word against a scan of the printed book, and list every place they differ.

The scan: F. Max Muller, Sacred Books of the East vol. 15 (Oxford, 1884), University of Michigan
copy on archive.org (1922707.0015.002.umich.edu). Its verse text is read from the page layout:
  - running heads (page number, title) are the first line of a page;
  - Muller's footnotes follow the verses after a gap, start with a superscript marker, and are
    set closer together (~94px apart against ~117px), so the first such line ends the verses;
  - superscript footnote markers inside the verses are dropped.
The scan garbles Sanskrit names and quote marks, so only differences in plain English words are
listed: a word the book has that the transcription doesn't, or a different word. Each listed
difference was settled by hand; the transcription's mistakes are fixed in build-upanishads-sbe15.py.

Usage: python3 scripts/build-upanishads-sbe15.py <cache-dir> --verses <cache-dir>/verses.json
       python3 scripts/check-sbe15-scan.py <cache-dir> <cache-dir>/verses.json
"""
import collections
import difflib
import gzip
import html
import json
import os
import re
import sys
import unicodedata
import urllib.request

UA = "SwamiGPT-build/0.1 (personal non-commercial project)"
SCAN = "https://archive.org/download/1922707.0015.002.umich.edu/1922707.0015.002.umich.edu_abbyy.gz"
ROOT = os.path.join(os.path.dirname(__file__), "..")
WORDS = "/usr/share/dict/words"

# slug, name, scan pages (0-based leaf numbers), heading levels used for the citation number
UPANISHADS = [
    ("taittiriya", "Taittiriya Upanishad", (104, 128), ["valli", "anuvaka"]),
    ("brihadaranyaka", "Brihadaranyaka Upanishad", (132, 289), ["adhyaya", "brahmana"]),
    ("shvetashvatara", "Shvetashvatara Upanishad", (290, 327), ["adhyaya"]),
]
ORDINALS = {
    w: i + 1
    for i, w in enumerate(
        "first second third fourth fifth sixth seventh eighth ninth tenth eleventh twelfth thirteenth "
        "fourteenth fifteenth sixteenth seventeenth eighteenth nineteenth twentieth".split()
    )
}
ORDINALS["eight"] = 8
# The scan's readings of the heading words, e.g. "Brahma^a", "BRAHMAiVA", "VALLf"
HEADINGS = {
    "valli": r"VALL\S{0,2}",
    "anuvaka": r"ANUVAKA",
    "adhyaya": r"ADHYAYA\S?",
    "brahmana": r"BR[AÂ&]HMA\S{1,4}",
}
# Opening/closing blessings, chapter subtitles, and the end of the text
SKIP = re.compile(r"^(Or, the Chapter|Hari\S{0,2},? Om|Adoration to the\b|This is the Upanishad\.?$)", re.I)


def fetch_scan(cache):
    path = os.path.join(cache, "sbe15.abbyy.gz")
    if not os.path.exists(path):
        req = urllib.request.Request(SCAN, headers={"User-Agent": UA})
        with urllib.request.urlopen(req) as r, open(path, "wb") as f:
            f.write(r.read())
    return gzip.open(path, "rt", encoding="utf-8").read()


CHAR = re.compile(r"<charParams[^>]*>([^<]*)</charParams>")


def page_lines(page):
    """[(baseline, text)] top to bottom, with superscripts wrapped in {}."""
    out = []
    for attrs, body in re.findall(r"<line ([^>]*)>(.*?)</line>", page, re.S):
        top, base = int(re.search(r'\bt="(\d+)"', attrs).group(1)), int(re.search(r'baseline="(\d+)"', attrs).group(1))
        text = ""
        for fmt, run in re.findall(r"<formatting ([^>]*)>(.*?)</formatting>", body, re.S):
            t = html.unescape("".join(CHAR.findall(run)))
            text += "{" + t.strip() + "}" if "superscript" in fmt and t.strip() else t
        text = " ".join(text.split())
        if len(re.sub(r"\{[^}]*\}", "", text)) > 2:  # specks on the page read as "t" or "."
            out.append((top, base, text))
    return [(b, t) for _, b, t in sorted(out)]


def verse_lines(page):
    """The page's verse text: no running head, no footnotes, no footnote markers."""
    lines = page_lines(page)
    if not lines:
        return []
    first = lines[0][1]
    start = 1 if re.search(r"\d|UPAN|ADHYAYA,|VALL\S*,", first) and not re.match(r"^\S{1,3}\s?\.\s", first) else 0
    kept, body_seen = [], False
    for i in range(start, len(lines)):
        base, text = lines[i]
        gap = base - lines[i - 1][0] if i else 0
        after = lines[i + 1][0] - base if i + 1 < len(lines) else None
        if re.match(r"^\[\d+\]", text):
            continue  # the printer's sheet mark, e.g. "[15] K"
        if body_seen and gap > 135 and (text.startswith("{") or after is None or after < 106):
            break  # the footnotes
        if 108 <= (gap or 117) <= 130:
            body_seen = True
        text = re.sub(r"\{[^}]*\}", "", text).strip()
        if text:
            kept.append(text)
    return kept


def heading(line):
    for level, word in HEADINGS.items():
        m = re.match(rf"^([A-Za-z]+)\s+{word}[\s.,\\/]*$", line, flags=re.I)
        if m and m.group(1).lower() in ORDINALS:
            return level, ORDINALS[m.group(1).lower()]
    return None


def number(token):
    """The scan reads a verse's 1 as i, I, l or t (so 11 as "ii", 21 as "2i"), 0 as O,
    and spaces out 13 as "1 3"."""
    t = token.replace(" ", "")
    if not re.fullmatch(r"[\diIlt|oO]{1,3}", t) or not re.search(r"[\diIl]", t):
        return None
    t = re.sub(r"[iIlt|]", "1", t).replace("o", "0").replace("O", "0")
    return int(t)


def join_lines(lines, words):
    """Undo end-of-line hyphenation where the joined word is a real word ("concen-tration")."""
    text = ""
    for line in lines:
        if text.endswith("-") and re.search(r"[a-z]-$", text) and re.match(r"^[a-z]", line):
            left = re.search(r"(\w+)-$", text).group(1)
            right = re.match(r"^(\w+)", line).group(1)
            if (left + right).lower() in words or (left + right).rstrip("s").lower() in words:
                text = text[:-1] + line
                continue
            text += line
        else:
            text += (" " if text else "") + line
    return text


def tidy(text):
    text = re.sub(r"(?<=\w)/(?=[\s,;:.!?]|$)", "'", text)  # a closing quote read as "/"
    text = re.sub(r"(^|\s)\*\s?(?=[A-Z'(])", r"\1'", text)  # an opening quote read as "*"
    text = re.sub(r"\s+([,.;:!?)])", r"\1", text)
    text = re.sub(r"\(\s+", "(", text)
    return " ".join(text.split())


# A verse number: at the start of a line, or after a sentence ends mid-line (Muller sometimes runs
# short verses together: "Om means Brahman. 2. Om means all this."). Not "i. e." ("that is").
NUMBER = re.compile(r"(?:^|(?<=[.!?;'\"V] ))(\S{1,2}(?: \d)?)\s?[.,](?:\s+|(?=['\"]))(?=\S)(?!e\.)")
# Verse numbers the scan misread beyond the rules in number()
LINE_FIXES = {"2j. Then Yaf^avalkya said": "27. Then Yaf^avalkya said"}
SKIPPED = []  # verse numbers the scan lost, reported for checking


def split_numbers(line, expect):
    """[(verse number or None, text)]: the line cut wherever the next expected verse begins."""
    out, pos = [], 0
    for m in NUMBER.finditer(line):
        n = number(m.group(1))
        if n == expect + 1 and (m.start() == 0 or line[m.end() : m.end() + 1] in "'\"("):
            SKIPPED.append(expect)  # verse `expect` lost its number; it stays inside the one before
        elif n != expect:
            continue
        if m.start() > pos:
            out.append((None, line[pos : m.start()].strip()))
        out.append((n, ""))
        pos, expect = m.end(), n + 1
    rest = line[pos:].strip()
    if out and out[-1][1] == "" and out[-1][0] is not None:
        out[-1] = (out[-1][0], rest)
    elif rest:
        out.append((None, rest))
    return [(n, t) for n, t in out if t or n is not None]


def parse(lines, levels):
    """Yield (citation number, [lines]) for each verse."""
    at = {lvl: 0 for lvl in levels}
    verse, expect = None, 1
    for line in lines:
        for wrong, right in LINE_FIXES.items():
            line = line.replace(wrong, right)
        if SKIP.match(line) or re.match(r"^[A-Z\-]+UPANISHAD\.?$", line.replace(" ", "")):
            if verse and line.lower().startswith("this is the upanishad"):
                verse[1].append(line)
            continue
        h = heading(line)
        if h:
            level, n = h
            if verse:
                yield verse
                verse = None
            at[level] = n
            for lower in levels[levels.index(level) + 1 :]:
                at[lower] = 0
            expect = 1
            continue
        before = len(SKIPPED)
        for start, piece in split_numbers(line, expect):
            if start is not None:
                if verse:
                    yield verse
                verse = [".".join(str(at[lvl]) for lvl in levels) + f".{start}", [piece]]
                expect = start + 1
                if len(SKIPPED) > before:
                    print(f"  lost verse number before {verse[0]}: check the verse before it")
                    before = len(SKIPPED)
            elif verse is None and expect == 1 and all(at.values()):
                # A section printed as one unnumbered paragraph is its verse 1
                verse = [".".join(str(at[lvl]) for lvl in levels) + ".1", [piece]]
                expect = 2
            elif verse:
                verse[1].append(piece)
    if verse:
        yield verse


def compare(text, scanned, words):
    """Differences in plain English words between the transcription and the scan of one verse."""
    plain = lambda t: unicodedata.normalize("NFKD", t).encode("ascii", "ignore").decode()
    toks = lambda t: re.findall(r"[A-Za-z0-9^/#&£$*%\\|!?@~<>{}]+(?:[-'][A-Za-z]+)*", plain(t))
    norm = lambda t: re.sub(r"[^a-z0-9]", "", t.lower())
    english = lambda t: re.fullmatch(r"[A-Za-z]+(?:-[A-Za-z]+)*", t) and all(
        w.lower() in words or w.lower().rstrip("s") in words for w in t.split("-"))
    a, b = toks(text), toks(scanned)
    match = difflib.SequenceMatcher(None, [norm(t) for t in a], [norm(t) for t in b], autojunk=False)
    for op, i1, i2, j1, j2 in match.get_opcodes():
        ours, book = a[i1:i2], b[j1:j2]
        if op == "equal" or (op == "replace" and not any(english(t) for t in book)):
            continue  # the scan's own garbling of a name
        if any(english(t) for t in book) or (not book and any(english(t) for t in ours)):
            yield " ".join(ours), " ".join(book), " ".join(a[max(0, i1 - 6) : i2 + 6])


def main(cache, verses_json):
    words = {w.strip().lower() for w in open(WORDS)}
    pages = fetch_scan(cache).split("<page ")[1:]
    ours = json.load(open(verses_json))
    total = 0
    for slug, name, (first, last), levels in UPANISHADS:
        lines = [l for p in range(first, last + 1) for l in verse_lines(pages[p])]
        scanned = {num: tidy(join_lines(body, words)) for num, body in parse(lines, levels)}
        missing = sorted(set(ours[slug]) ^ set(scanned))
        if missing:
            print(f"{name}: verse numbers in only one of the two: {missing}")
        for num, text in ours[slug].items():
            for mine, book, context in compare(text, scanned.get(num, ""), words) if num in scanned else []:
                total += 1
                print(f"{name} {num}: transcription [{mine}] book [{book}]  ~ {context}")
    print(f"{total} differences to settle")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
