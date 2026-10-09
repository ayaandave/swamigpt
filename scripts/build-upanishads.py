"""Build data/scripture/upanishads.json: six principal Upanishads in Max Muller's translation.

Source: F. Max Muller, The Upanishads, Sacred Books of the East vols. 1 (1879) and 15 (1884),
public domain, from the proofread edition on Wikisource. Wikisource has six of the principal
Upanishads in full: Isha, Kena, Katha, Mundaka, Prashna and Chandogya.

Kept: the numbered verses, and unnumbered dialogue lines that belong to them.
Dropped: Muller's bracketed narration, his essays and footnotes, and opening/closing blessings.
Verses are cited the standard way, e.g. Katha Upanishad 1.2.23, Chandogya Upanishad 6.8.7.

Usage: python3 scripts/build-upanishads.py <cache-dir>
"""
import html
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request

UA = "SwamiGPT-build/0.1 (personal non-commercial project)"
OUT = os.path.join(os.path.dirname(__file__), "..", "data", "scripture", "upanishads.json")
SBE1, SBE15 = "Sacred Books of the East/Volume 1/", "Sacred Books of the East/Volume 15/"
CHANDOGYA_PARTS = ["First", "Second", "Third", "Fourth", "Fifth", "Sixth", "Seventh", "Eighth"]

# slug, name, Wikisource pages, heading levels used for the citation number
UPANISHADS = [
    ("isha", "Isha Upanishad", [SBE1 + "Vâgasaneyi-samhitâ-upanishad"], []),
    ("kena", "Kena Upanishad", [SBE1 + "Talavakâra-upanishad"], ["khanda"]),
    ("katha", "Katha Upanishad", [SBE15 + "Katha-upanishad"], ["adhyaya", "valli"]),
    ("mundaka", "Mundaka Upanishad", [SBE15 + "Mundaka-upanishad"], ["mundaka", "khanda"]),
    ("prashna", "Prashna Upanishad", [SBE15 + "Prasña-upanishad"], ["question"]),
    (
        "chandogya",
        "Chandogya Upanishad",
        [f"{SBE1}Khândogya-upanishad/{p} Prapâthaka" for p in CHANDOGYA_PARTS],
        ["prapathaka", "khanda"],
    ),
]

ORDINALS = {
    w: i + 1
    for i, w in enumerate(
        "first second third fourth fifth sixth seventh eighth ninth tenth eleventh twelfth thirteenth "
        "fourteenth fifteenth sixteenth seventeenth eighteenth nineteenth twentieth twenty-first twenty-second "
        "twenty-third twenty-fourth twenty-fifth twenty-sixth".split()
    )
}
ORDINALS["elventh"] = 11  # a typo on the Chandogya 2nd Prapathaka page
# The Wikisource Katha numbers the last verses of 1.3 as 18-20; they are 1.3.15-17 in every edition
RENUMBER = {"katha 1.3.18": "1.3.15", "katha 1.3.19": "1.3.16", "katha 1.3.20": "1.3.17"}
HEADINGS = {
    "prapathaka": r"PRAPÂTHAKA",
    "khanda": r"Khanda",
    "adhyaya": r"ADHYÂYA",
    "valli": r"Vallî",
    "mundaka": r"MUNDAKA",
    "question": r"QUESTION",
}
# Muller's essay after the Isha's last verse, and blessings that open or close a text
STOP = re.compile(r"^(Footnotes$|↑|This Upanishad, though apparently simple)")
SKIP = re.compile(r"^(Adoration to the|Tat sat|Harih, Om!?$)")


def fetch(title, path):
    if os.path.exists(path):
        with open(path) as f:
            body = f.read()
        if body.startswith("{"):
            return json.loads(body)
    url = "https://en.wikisource.org/w/api.php?" + urllib.parse.urlencode(
        {"action": "parse", "format": "json", "prop": "text", "page": title}
    )
    for attempt in range(5):
        time.sleep(3 + attempt * 20)  # Wikisource rate-limits bursts
        body = urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA})).read().decode()
        if body.startswith("{"):
            with open(path, "w") as f:
                f.write(body)
            return json.loads(body)
    sys.exit(f"could not fetch {title}")


def page_lines(page):
    t = page["parse"]["text"]["*"]
    t = re.sub(r"<style.*?</style>", "", t, flags=re.S)
    t = re.sub(r'<sup[^>]*class="reference".*?</sup>', "", t, flags=re.S)
    t = re.sub(r"<(?:br|/p|/div|/h\d|/li)[^>]*>", "\n", t)
    s = html.unescape(re.sub(r"<[^>]+>", "", t)).replace("​", "")
    s = re.sub(r"\[\d+\]", "", s)  # footnote markers
    lines = [" ".join(l.split()) for l in s.splitlines() if l.strip()]
    # The text starts at its title ("KATHA-UPANISHAD.") or, on later Chandogya pages, its part
    # heading ("SECOND PRAPÂTHAKA."); this skips the page's navigation box
    start = next(i for i, l in enumerate(lines) if re.match(r"^([A-ZÂÎÛÑ\-]+-UPANISHAD|[A-Z]+ PRAPÂTHAKA)\.?$", l))
    return lines[start + 1 :]


def heading(line):
    """('khanda', 3) for 'Third Khanda.', None for anything else."""
    for level, word in HEADINGS.items():
        m = re.match(rf"^([A-Za-z\-]+)\s+{word}\.?$", line, flags=re.I)
        if m and m.group(1).lower() in ORDINALS:
            return level, ORDINALS[m.group(1).lower()]
    return None


def parse(lines, levels, first_part=None):
    """Yield (citation number, text) for each verse."""
    at = {lvl: 0 for lvl in levels}
    if first_part is not None:  # Chandogya: one page per prapathaka
        at["prapathaka"] = first_part
    verse = None
    for line in lines:
        if STOP.match(line):
            break
        h = heading(line)
        if h:
            level, n = h
            if level == "prapathaka":
                continue  # already known from the page
            if verse:
                yield verse
                verse = None
            if level == "valli":
                # Katha numbers its vallis 1-6 across both adhyayas; cite them within the adhyaya
                n = n - 3 * (at["adhyaya"] - 1)
            if level in at:
                at[level] = n
                for lower in levels[levels.index(level) + 1 :]:
                    at[lower] = 0
            continue
        # "3. text", or "1, 2. text" where two verses are printed as one
        m = re.match(r"^(\d+)(?:\s*,\s*(\d+))?\.\s+(.*)$", line)
        if m:
            if verse:
                yield verse
            num = ".".join([str(at[lvl]) for lvl in levels] + [m.group(1)])
            verse = [num, m.group(3), int(m.group(2) or m.group(1))]
        elif verse and not SKIP.match(line) and not re.match(r"^\(.*\)\.?$", line):
            verse[1] += " " + line  # dialogue or a line that ran on across a page break
    if verse:
        yield verse


def main(cache):
    os.makedirs(cache, exist_ok=True)
    out = []
    for slug, name, pages, levels in UPANISHADS:
        count = 0
        for p, title in enumerate(pages):
            page = fetch(title, os.path.join(cache, f"up-{slug}-{p + 1}.json"))
            first_part = p + 1 if slug == "chandogya" else None
            for num, text, last in parse(page_lines(page), levels, first_part):
                if f"{slug} {num}" in RENUMBER:
                    fixed = RENUMBER[f"{slug} {num}"]
                    last += int(fixed.rsplit(".", 1)[1]) - int(num.rsplit(".", 1)[1])
                    num = fixed
                text = re.sub(r"\s+([,.;:!?])", r"\1", text).strip()
                out.append(
                    {
                        "id": f"upanishads-{slug}-{num.replace('.', '-')}",
                        "source": f"{name} {num}",
                        "section": slug,
                        "sectionName": name,
                        "number": num,
                        "translation": text,
                        "translator": "Max Müller (1879–1884)",
                        "through": last,  # the last verse number this line covers (removed below)
                    }
                )
                count += 1
        print(f"{name}: {count} verses")
    # Every section's verses should run 1, 2, 3... with no gaps
    groups = {}
    for p in out:
        head, _, n = p["number"].rpartition(".")
        groups.setdefault((p["section"], head), []).extend(range(int(n), p.pop("through") + 1))
    for (slug, head), ns in groups.items():
        if ns != list(range(1, len(ns) + 1)):
            print(f"  check {slug} {head}: verses {ns}")
    ids = [p["id"] for p in out]
    dupes = sorted({i for i in ids if ids.count(i) > 1})
    if dupes:
        sys.exit(f"duplicate citations: {dupes[:10]}")
    with open(OUT, "w") as f:
        json.dump(out, f, ensure_ascii=False, indent=1)
    print(f"wrote {len(out)} verses to {os.path.normpath(OUT)}")


if __name__ == "__main__":
    main(sys.argv[1])
