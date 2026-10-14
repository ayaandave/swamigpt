"""Builds data/scripture/vishnu-purana.json: the Vishnu Purana stories behind the "Stories of the
gods" lessons, in Manmatha Nath Dutt's English translation (1896, public domain).

  - The churning of the ocean and Lakshmi rising from it: Part 1, Section 9
  - Prahlada, protected by Vishnu, and his father slain by the man-lion: Part 1, Sections 17-20
  - Vamana's three steps: the one passage on it, Part 3, Section 1
  - Krishna and the serpent Kaliya: Part 5, Section 7
  - Krishna lifts Govardhan Hill: Part 5, Sections 10-11

The narrator is the sage Parashara, telling the Purana to his pupil Maitreya; his framing is kept,
since the stories are told through it. Long paragraphs are cut into passages of a few sentences,
always at the end of a sentence.

Text: Project Gutenberg's transcription (ebook 66208), checked word by word against a scan of the
printed book (scripts/check-vishnu-purana-scan.py); the printer's own slips are corrected in FIXES.
Passages left out, and why, are in LEAVE_OUT (also summed up on the Sources page).

Usage: python3 scripts/build-vishnu-purana.py <cache-dir>
"""
import json
import os
import re
import sys
import urllib.request

ROOT = os.path.join(os.path.dirname(__file__), "..")
OUT = os.path.join(ROOT, "data", "scripture", "vishnu-purana.json")
UA = "SwamiGPT-build/0.1 (personal non-commercial project)"
TRANSLATOR = "Manmatha Nath Dutt (1896)"
TARGET = 520  # characters: a passage is a few sentences, cut where a sentence ends

ROMAN = {"I": 1, "III": 3, "V": 5, "VII": 7, "IX": 9, "X": 10, "XI": 11, "XVII": 17, "XVIII": 18, "XIX": 19, "XX": 20}
# key, name, [(part, section)]
STORIES = [
    ("churning", "The churning of the ocean", [(1, 9)]),
    ("prahlada", "Prahlada and the man-lion", [(1, 17), (1, 18), (1, 19), (1, 20)]),
    ("vamana", "Vamana's three steps", [(3, 1)]),
    ("kaliya", "Krishna and the serpent Kaliya", [(5, 7)]),
    ("govardhan", "Krishna lifts Govardhan Hill", [(5, 10), (5, 11)]),
]
# Part 3, Section 1 lists Vishnu's forms in every age; only the paragraph on Vamana is kept
ONLY = {(3, 1): "In the next Manwantara Vishnu was born of Vikunthi"}

# Passages left out by id, with the reason (also summed up on the Sources page)
LEAVE_OUT: dict = {
    "vishnu-purana-prahlada-1-17-22": "describes the body with disgust, and marriage as bringing pain",
    "vishnu-purana-prahlada-1-20-12": "promises ritual merit for reading the story on set lunar days",
    "vishnu-purana-churning-1-9-49": "promises wealth for chanting the hymn, a ritual claim needing footnotes",
    "vishnu-purana-govardhan-5-10-13": "about killing a sacrificial animal and feeding priests, which needs footnotes",
}

# The check against the scan (scripts/check-vishnu-purana-scan.py) found no word where this
# transcription and the printed book differ: what remained was OCR noise and words split by
# hyphens. These fixes correct printer's slips that are in the book itself, where the intended
# word is plain from the sense or from the spelling used everywhere else in the book:
# (passage id, as printed, corrected).
FIXES: list = [
    ("vishnu-purana-churning-1-9-19", "that Suprenje incomprehensible", "that Supreme incomprehensible"),
    ("vishnu-purana-churning-1-9-19", "ever perservering", "ever persevering"),
    ("vishnu-purana-churning-1-9-32", "Milky-occan", "Milky-ocean"),
    ("vishnu-purana-prahlada-1-17-4", "Hiranykasipu", "Hiranyakashipu"),
    ("vishnu-purana-prahlada-1-17-23", "pleasure la the embryo", "pleasure in the embryo"),
    ("vishnu-purana-prahlada-1-19-21", "covered with racks", "covered with rocks"),
    ("vishnu-purana-prahlada-1-19-21", "O thou excellent Puhusha", "O thou excellent Purusha"),
    ("vishnu-purana-kaliya-5-7-2", "Slayer of Mahdhu", "Slayer of Madhu"),
    ("vishnu-purana-kaliya-5-7-8", "stricken with grief and keeping", "stricken with grief and weeping"),
    ("vishnu-purana-kaliya-5-7-10", "Hearing those wards", "Hearing those words"),
    ("vishnu-purana-govardhan-5-10-12", "they will like the offenders", "they will kill the offenders"),
    ("vishnu-purana-govardhan-5-10-14", "autumnal dowers", "autumnal flowers"),
    ("vishnu-purana-govardhan-5-10-17", "Govaradhana", "Govardhana"),
    ("vishnu-purana-govardhan-5-11-2", "Parsara said", "Parāçara said"),
]


def fetch(cache):
    path = os.path.join(cache, "66208.txt")
    if not os.path.exists(path):
        req = urllib.request.Request("https://www.gutenberg.org/cache/epub/66208/pg66208.txt", headers={"User-Agent": UA})
        with urllib.request.urlopen(req) as r, open(path, "wb") as f:
            f.write(r.read())
    return open(path, encoding="utf-8").read().replace("\r\n", "\n")


def clean(text):
    text = re.sub(r"\[\d+\]", "", text)  # footnote markers
    text = text.replace("--", "—")
    text = re.sub(r"\s+", " ", text).strip()
    text = re.sub(r"\s+([,.;:!?])", r"\1", text)
    return text


def sentences(text):
    """Cut after . ! ? (and any closing quotes), not inside 'viz.', 'i.e.' or '&c.'."""
    parts = re.split(r"(?:(?<=[.!?])|(?<=[.!?][’”'\"]))(?<!viz\.)(?<!i\.e\.)(?<!&c\.)\s+(?=[‘“'\"(A-Z])", text)
    return [p for p in parts if p.strip()]


def chunk(text):
    out, buf = [], ""
    for s in sentences(text):
        if buf and len(buf) + len(s) > TARGET:
            out.append(buf)
            buf = ""
        buf = f"{buf} {s}".strip()
    if buf:
        # A short tail joins the passage before it rather than standing alone
        if out and len(buf) < TARGET / 3:
            out[-1] = f"{out[-1]} {buf}"
        else:
            out.append(buf)
    return out


def body(book):
    """The text after the table of contents: from the second "PART I." heading."""
    first = book.index("\nPART I.\n")
    return book[book.index("\nPART I.\n", first + 1) :]


def section(text, part, number):
    parts = ["I", "II", "III", "IV", "V", "VI"]
    p = parts[part - 1]
    a = text.index(f"\nPART {p}.\n")
    end_part = text.find(f"\nPART {parts[part]}.\n", a + 1) if part < 6 else len(text)
    numerals = {v: k for k, v in ROMAN.items()}
    numerals.update({2: "II", 8: "VIII", 12: "XII", 21: "XXI"})
    s = text.index(f"\nSECTION {numerals[number]}.\n", a)
    e = text.find("\nSECTION ", s + 1)
    if e == -1 or (end_part != -1 and e > end_part):
        e = end_part
    return text[s + len(numerals[number]) + 11 : e]


def main(cache):
    text = body(fetch(cache))
    passages = []
    for key, name, places in STORIES:
        for part, number in places:
            paras = [clean(p) for p in re.split(r"\n\s*\n", section(text, part, number)) if p.strip()]
            if (part, number) in ONLY:
                paras = [p for p in paras if p.startswith(ONLY[(part, number)])]
                assert paras, f"{part}.{number}: kept paragraph not found"
            n = 0
            for para in paras:
                for piece in chunk(para):
                    n += 1
                    ref = f"{part}.{number}.{n}"
                    passages.append(
                        {
                            "id": f"vishnu-purana-{key}-{part}-{number}-{n}",
                            "source": f"Vishnu Purana {ref}",
                            "section": key,
                            "sectionName": name,
                            "number": ref,
                            "partName": f"Part {part}, Section {number}",
                            "translation": piece,
                            "translator": TRANSLATOR,
                        }
                    )

    by_id = {p["id"]: p for p in passages}
    for pid, wrong, right in FIXES:
        if wrong not in by_id[pid]["translation"]:
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
