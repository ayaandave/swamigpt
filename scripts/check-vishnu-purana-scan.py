"""Check the Vishnu Purana text from build-vishnu-purana.py word by word against a scan of the
printed book, and list every place they differ.

The scan: M. N. Dutt, A Prose English Translation of Vishnupuranam (Calcutta, 1896), read from
archive.org's own OCR text of the copy vishnupuranam_202308. Running heads ("32 A Prose English
Translation of Vishnupuranam", "Manmatha Nath Dutt, M. A., M.R.A.S. 33") and the footnote blocks at
the foot of each page are dropped, and words split across lines are joined. Accents are ignored
(the scan reads "Parāçara" as "Paracara"), and only real words are compared, so OCR noise in
punctuation doesn't count. Each passage is found by a run of its words and compared in a window
just long enough to hold it. Each difference listed was settled by hand; fixes go in FIXES in
build-vishnu-purana.py.

Usage: python3 scripts/check-vishnu-purana-scan.py <cache-dir>
"""
import difflib
import json
import os
import re
import sys
import unicodedata
import urllib.request

ROOT = os.path.join(os.path.dirname(__file__), "..")
UA = "SwamiGPT-build/0.1 (personal non-commercial project)"
SCAN = "vishnupuranam_202308"

HEAD = re.compile(r"^\d{1,4}\s+A Prose English Translation of Vishnupuranam$|^Manmatha Nath Dutt.{0,25}\d{1,4}$", re.I)


def fetch(cache):
    path = os.path.join(cache, f"{SCAN}.txt")
    if not os.path.exists(path):
        meta = json.load(urllib.request.urlopen(f"https://archive.org/metadata/{SCAN}/files"))
        name = next(f["name"] for f in meta["result"] if f["name"].endswith("_djvu.txt"))
        req = urllib.request.Request(f"https://archive.org/download/{SCAN}/{name}", headers={"User-Agent": UA})
        with urllib.request.urlopen(req) as r, open(path, "wb") as f:
            f.write(r.read())
    return open(path, encoding="utf-8").read()


def is_note_block(lines):
    """A footnote block: every line is very short, or it starts with a note number or mark."""
    return all(len(l) < 40 for l in lines) or bool(re.match(r"^[\d°*†]{1,4}\S", lines[0]))


def scan_body(text):
    """The printed text without running heads and footnotes, lines joined."""
    blocks, block = [], []
    for raw in text.split("\n"):
        line = " ".join(raw.split())
        if not line:
            if block:
                blocks.append(block)
                block = []
            continue
        if HEAD.match(line):
            continue
        block.append(line)
    if block:
        blocks.append(block)
    out = []
    for b in blocks:
        # A body paragraph has full-width lines; footnotes are short and numbered
        if len(b) <= 4 and is_note_block(b) and not re.match(r"^(SECTION|PART)\b", b[0]):
            continue
        for line in b:
            # Only the end of the text so far is looked at, so this stays fast on a whole book
            if out and re.search(r"[a-z]-$", out[-1]) and re.match(r"^[a-z]", line):
                out[-1] = out[-1][:-1] + line
            else:
                out.append(line)
    return " ".join(out)


def words(text):
    text = unicodedata.normalize("NFKD", text)
    text = "".join(c for c in text if not unicodedata.combining(c))
    text = text.replace("’", "'").replace("‘", "'")
    return re.findall(r"[a-z]+(?:'[a-z]+)?", text.lower())


def main(cache):
    passages = json.load(open(os.path.join(ROOT, "data", "scripture", "vishnu-purana.json"), encoding="utf-8"))
    scan = words(scan_body(fetch(cache)))
    total, pos = 0, 0
    for p in passages:
        ours = words(p["translation"])
        start = None
        # Found by a run of its words past the opening, allowing for an OCR slip
        for skip in range(3, min(40, len(ours) - 6)):
            run = ours[skip : skip + 6]
            for j in range(pos, len(scan) - 6):
                if scan[j : j + 6] == run:
                    start = max(0, j - skip)
                    break
            if start is not None:
                break
        if start is None:
            # The stories aren't in book order (Vamana is in Part 3), so try the whole book once
            for skip in range(3, min(40, len(ours) - 6)):
                run = ours[skip : skip + 6]
                for j in range(0, len(scan) - 6):
                    if scan[j : j + 6] == run:
                        start = max(0, j - skip)
                        break
                if start is not None:
                    break
        if start is None:
            print(f"  {p['id']}: not found in the scan")
            continue
        window = scan[start : start + len(ours) + 40]
        sm = difflib.SequenceMatcher(None, ours, window, autojunk=False)
        ops = [op for op in sm.get_opcodes() if op[0] != "equal"]
        # The window runs past the passage's end: a trailing insert there isn't a difference
        if ops and ops[-1][0] == "insert" and ops[-1][1] == len(ours):
            ops = ops[:-1]
        for tag, i1, i2, j1, j2 in ops:
            ctx = " ".join(ours[max(0, i1 - 4) : i1])
            print(f"  {p['id']}: …{ctx} [{' '.join(ours[i1:i2])}] → [{' '.join(window[j1:j2])}]")
        total += len(ops)
        pos = start + max(0, len(ours) - 5)
    print(f"== {len(passages)} passages, {total} differences")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else ".")
