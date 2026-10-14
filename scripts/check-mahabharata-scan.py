"""Check the Vidura Niti and Yaksha Prashna text from build-mahabharata.py word by word against a
scan of the printed book, and list every place they differ.

The scan: Ganguli's translation as reissued by Pratap Chandra Roy's office, University of Toronto
copies on archive.org: mahabharataofkri03roypuoft (Vana Parva) and mahabharataofkri04roypuoft
(Virata and Udyoga Parva), read from archive.org's own OCR text. Running heads ("664 MAHABHARATA")
and the translator's footnotes (which end "— T.") are dropped before comparing, and words split
across lines are joined. Only real words are compared, so OCR noise in punctuation is ignored.
Each listed difference was settled by hand against the page images; fixes go in FIXES in
build-mahabharata.py.

Usage: python3 scripts/check-mahabharata-scan.py <cache-dir>
"""
import difflib
import json
import os
import re
import sys
import urllib.request

ROOT = os.path.join(os.path.dirname(__file__), "..")
UA = "SwamiGPT-build/0.1 (personal non-commercial project)"
SCANS = {
    "01": "mahabharataofkri01roypuoft",
    "02": "mahabharataofkri02roypuoft",
    "03": "mahabharataofkri03roypuoft",
    "04": "mahabharataofkri04roypuoft",
}
# Where each teaching starts and ends in the scan (first words of each, as printed)
RANGES = {
    "yaksha-prashna": ("03", "What is it that maketh the Sun rise", "let all thy brothers live"),
    "vidura-niti": ("04", "Sleeplessness", "SECTION XLI"),
    "ganesha": ("01", "I esteem thee", "great abundance"),
    "churning": ("01", "mountain named Meru", "the Amrita in the hands"),
    "ganga": ("02", "That same king, of a powerful bow", "destroyed by Agastya"),
    "hanuman": ("03", "On those sounds being heard", "vanished at that spot"),
}


def fetch(cache, vol):
    path = os.path.join(cache, f"scan{vol}.txt")
    if not os.path.exists(path):
        ident = SCANS[vol]
        meta = json.load(urllib.request.urlopen(f"https://archive.org/metadata/{ident}/files"))
        name = next(f["name"] for f in meta["result"] if f["name"].endswith("_djvu.txt"))
        req = urllib.request.Request(f"https://archive.org/download/{ident}/{name}", headers={"User-Agent": UA})
        with urllib.request.urlopen(req) as r, open(path, "wb") as f:
            f.write(r.read())
    return open(path, encoding="utf-8").read()


def scan_body(text):
    """The printed text without running heads and footnotes, lines joined."""
    lines = []
    in_note = False
    for raw in text.split("\n"):
        line = " ".join(raw.split())
        if not line:
            in_note = False
            continue
        if re.fullmatch(r"\d{1,4}\s+[A-Z][A-Z .]{4,}[A-Z.]|[A-Z][A-Z .]{4,}[A-Z.]\s+\d{1,4}|\d{1,4}", line):
            continue  # running head or page number
        # A footnote: starts with its number (or a symbol) and a capital, at the foot of a page
        if re.match(r"^[\d*†]\s+[A-Z‘'\"]", line) and not re.match(r"^\d+\s+(?:And|The|O)\b.{0,10}$", line):
            in_note = True
        if in_note:
            if re.search(r"—\s?T\.?\s*$|-\s?T\.\s*$", line):
                in_note = False
            continue
        lines.append(line)
    out = []
    for line in lines:
        # Only the end of the text so far is looked at, so this stays fast on a whole book
        if out and re.search(r"[a-z]-$", out[-1]) and re.match(r"^[a-z]", line):
            out[-1] = out[-1][:-1] + line
        else:
            out.append(line)
    return " ".join(out)


def words(text):
    text = text.replace("’", "'").replace("‘", "'")
    return re.findall(r"[a-z]+(?:'[a-z]+)?", text.lower())


def main(cache):
    passages = json.load(open(os.path.join(ROOT, "data", "scripture", "mahabharata.json"), encoding="utf-8"))
    for section, (vol, first, last) in RANGES.items():
        body = scan_body(fetch(cache, vol))
        squash = re.sub(r"\s+", " ", body)
        # The anchors narrow the search; if the OCR garbled one, the whole volume is searched
        a = squash.find(re.sub(r"\s+", " ", first))
        a = max(a, 0)
        b = squash.find(last, a)
        b = b + len(last) if b != -1 else len(squash)
        scan = words(squash[a:b])
        # Each passage is found in the scan by its opening words, then compared word by word in
        # a window just long enough to hold it (comparing everything at once is far too slow)
        total, pos = 0, 0
        for p in passages:
            if p["section"] != section:
                continue
            ours = words(p["translation"])
            # Found by a run of its words past the opening (which is often just "The Yaksha asked,
            # What is"), allowing for an OCR slip: the first run of 6 that matches exactly
            start = None
            for skip in range(3, min(40, len(ours) - 6)):
                run = ours[skip : skip + 6]
                for j in range(pos, len(scan) - 6):
                    if scan[j : j + 6] == run:
                        start = max(0, j - skip)
                        break
                if start is not None:
                    break
            if start is None:
                print(f"  {p['id']}: opening words not found in the scan")
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
            pos = start + len(ours) - 5
        print(f"== {section}: {total} differences")

if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else ".")
