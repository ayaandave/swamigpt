"""Check the Ramayana text from build-ramayana.py word by word against a scan of the printed book,
and list every place they differ.

The scan: Griffith, The Rámáyan of Válmíki, translated into English verse (London: Trübner;
Benares: E. J. Lazarus, 1870-1874), the five-volume first edition that Project Gutenberg's
transcription follows, read from archive.org's own OCR text of the India History Resource copies.
Each passage is found in its volume by a run of six of its words, then compared word by word in a
window just long enough to hold it. Accents are ignored (the OCR reads Ráma as "Rama", "Rdma" and
worse), and so are punctuation and line breaks, so only real word differences are listed.
Each listed difference was settled by hand against the page images; fixes go in FIXES in
build-ramayana.py.

Usage: python3 scripts/check-ramayana-scan.py <cache-dir>
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
# Book -> the archive.org copy of the volume that holds it
SCANS = {
    2: "india.history.resource.72966",
    3: "india.history.resource.72962",
    4: "india.history.resource.72965",
    5: "india.history.resource.72965",
    6: "india.history.resource.72963",
}


def fetch(cache, ident):
    path = os.path.join(cache, f"{ident}.txt")
    if not os.path.exists(path):
        meta = json.load(urllib.request.urlopen(f"https://archive.org/metadata/{ident}/files"))
        name = next(f["name"] for f in meta["result"] if f["name"].endswith("_djvu.txt"))
        req = urllib.request.Request(f"https://archive.org/download/{ident}/{name}", headers={"User-Agent": UA})
        with urllib.request.urlopen(req) as r, open(path, "wb") as f:
            f.write(r.read())
    return open(path, encoding="utf-8").read()


def plain(text):
    text = unicodedata.normalize("NFKD", text)
    return "".join(c for c in text if not unicodedata.combining(c))


def words(text):
    text = plain(text).replace("’", "'").replace("‘", "'")
    # Words split across lines by a hyphen are joined; hyphenated compounds count as two words
    text = re.sub(r"([a-z])-\s*\n\s*([a-z])", r"\1\2", text)
    return re.findall(r"[a-z]+", text.lower())


def main(cache):
    passages = json.load(open(os.path.join(ROOT, "data", "scripture", "ramayana.json"), encoding="utf-8"))
    scans = {ident: words(fetch(cache, ident)) for ident in set(SCANS.values())}
    pos = {ident: 0 for ident in scans}
    total = 0
    for p in passages:
        book = int(p["number"].split(".")[0])
        ident = SCANS[book]
        scan = scans[ident]
        ours = words(p["translation"])
        start = None
        for begin in (pos[ident], 0):  # in order, but look from the top if a passage came earlier
            for skip in range(3, max(4, min(40, len(ours) - 6))):
                run = ours[skip : skip + 6]
                for j in range(begin, len(scan) - 6):
                    if scan[j : j + 6] == run:
                        start = max(0, j - skip)
                        break
                if start is not None:
                    break
            if start is not None:
                break
        if start is None:
            print(f"  {p['id']}: not found in the scan")
            continue
        window = scan[start : start + len(ours) + 30]
        sm = difflib.SequenceMatcher(None, ours, window, autojunk=False)
        ops = [op for op in sm.get_opcodes() if op[0] != "equal"]
        if ops and ops[-1][0] == "insert" and ops[-1][1] == len(ours):
            ops = ops[:-1]  # the window runs past the passage's end
        if ops and ops[0][0] == "insert" and ops[0][1] == 0:
            ops = ops[1:]  # nor is anything before its start
        for tag, i1, i2, j1, j2 in ops:
            ctx = " ".join(ours[max(0, i1 - 4) : i1])
            print(f"  {p['id']}: …{ctx} [{' '.join(ours[i1:i2])}] → [{' '.join(window[j1:j2])}]")
        total += len(ops)
        pos[ident] = start + max(0, len(ours) - 5)
    print(f"== {len(passages)} passages, {total} differences")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else ".")
