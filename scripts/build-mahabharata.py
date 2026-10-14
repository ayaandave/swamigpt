"""Builds data/scripture/mahabharata.json: two teachings from the Mahabharata, in Kisari Mohan
Ganguli's English translation (1883-1896, public domain).

  - Vidura Niti: Vidura's counsel to the sleepless king Dhritarashtra, Udyoga Parva sections
    33-40 (the traditional eight chapters). Only Vidura's own words are kept; the king's short
    questions and the narrator's links are left out. Long paragraphs are cut into passages of
    a few sentences, always at the end of a sentence.
  - Yaksha Prashna: the Yaksha's questions to Yudhishthira at the lake, Vana Parva section 311.
    Each question with its answer is one passage, then Yudhishthira's choice that ends it.

Text: Project Gutenberg's transcription (ebooks 15474 and 15475), checked word by word against
the University of Toronto scan of the printed book (scripts/check-mahabharata-scan.py).
Passages left out, and why, are listed in LEAVE_OUT below and on the Sources page.

Usage: python3 scripts/build-mahabharata.py <cache-dir>
"""
import json
import os
import re
import sys
import urllib.request

ROOT = os.path.join(os.path.dirname(__file__), "..")
OUT = os.path.join(ROOT, "data", "scripture", "mahabharata.json")
UA = "SwamiGPT-build/0.1 (personal non-commercial project)"
TRANSLATOR = "Kisari Mohan Ganguli (1883–1896)"

ROMAN = {"XXXIII": 33, "XXXIV": 34, "XXXV": 35, "XXXVI": 36, "XXXVII": 37, "XXXVIII": 38, "XXXIX": 39, "XL": 40}
TARGET = 520  # characters: a passage is a few sentences, cut where a sentence ends

# Passages left out by id, with the reason (also summed up on the Sources page)
LEAVE_OUT: dict = {
    "mahabharata-yaksha-6": "the printed book itself lost part of the wording",
    "mahabharata-yaksha-7": "the printed book itself lost part of the wording",
    "mahabharata-yaksha-3": "about the duties and rank of castes",
    "mahabharata-yaksha-4": "about the duties and rank of castes",
    "mahabharata-vidura-3-5": "about the duties and rank of castes",
    "mahabharata-vidura-3-18": "about the duties and rank of castes",
    "mahabharata-vidura-5-5": "about the duties and rank of castes",
    "mahabharata-vidura-6-4": "about the duties and rank of castes",
    "mahabharata-vidura-6-8": "about the duties and rank of castes",
    "mahabharata-vidura-8-14": "about the duties and rank of castes",
    "mahabharata-yaksha-5": "about sacrifice and ancestor rites, which need footnotes to follow",
    "mahabharata-yaksha-11": "about sacrifice and ancestor rites, which need footnotes to follow",
    "mahabharata-yaksha-18": "about sacrifice and ancestor rites, which need footnotes to follow",
    "mahabharata-yaksha-20": "about sacrifice and ancestor rites, which need footnotes to follow",
    "mahabharata-yaksha-21": "about sacrifice and ancestor rites, which need footnotes to follow",
    "mahabharata-vidura-8-5": "about sacrifice and ancestor rites, which need footnotes to follow",
    "mahabharata-yaksha-30": "threatens everlasting hell",
    "mahabharata-yaksha-14": "treats women or wives as property, untrustworthy or a vice",
    "mahabharata-yaksha-29": "treats women or wives as property, untrustworthy or a vice",
    "mahabharata-vidura-1-18": "treats women or wives as property, untrustworthy or a vice",
    "mahabharata-vidura-1-21": "treats women or wives as property, untrustworthy or a vice",
    "mahabharata-vidura-1-27": "treats women or wives as property, untrustworthy or a vice",
    "mahabharata-vidura-1-28": "treats women or wives as property, untrustworthy or a vice",
    "mahabharata-vidura-1-31": "treats women or wives as property, untrustworthy or a vice",
    "mahabharata-vidura-1-32": "treats women or wives as property, untrustworthy or a vice",
    "mahabharata-vidura-3-27": "treats women or wives as property, untrustworthy or a vice",
    "mahabharata-vidura-3-28": "treats women or wives as property, untrustworthy or a vice",
    "mahabharata-vidura-4-25": "treats women or wives as property, untrustworthy or a vice",
    "mahabharata-vidura-5-2": "treats women or wives as property, untrustworthy or a vice",
    "mahabharata-vidura-5-8": "treats women or wives as property, untrustworthy or a vice",
    "mahabharata-vidura-5-14": "treats women or wives as property, untrustworthy or a vice",
    "mahabharata-vidura-5-15": "treats women or wives as property, untrustworthy or a vice",
    "mahabharata-vidura-5-17": "treats women or wives as property, untrustworthy or a vice",
    "mahabharata-vidura-5-27": "treats women or wives as property, untrustworthy or a vice",
    "mahabharata-vidura-6-6": "treats women or wives as property, untrustworthy or a vice",
    "mahabharata-vidura-6-15": "treats women or wives as property, untrustworthy or a vice",
    "mahabharata-vidura-6-19": "treats women or wives as property, untrustworthy or a vice",
    "mahabharata-vidura-6-20": "treats women or wives as property, untrustworthy or a vice",
    "mahabharata-vidura-7-26": "treats women or wives as property, untrustworthy or a vice",
    "mahabharata-vidura-7-30": "treats women or wives as property, untrustworthy or a vice",
    "mahabharata-vidura-7-32": "treats women or wives as property, untrustworthy or a vice",
    "mahabharata-vidura-7-33": "treats women or wives as property, untrustworthy or a vice",
    "mahabharata-vidura-8-4": "treats women or wives as property, untrustworthy or a vice",
    "mahabharata-vidura-6-14": "advises killing a defeated enemy",
}

# Where the transcription differs from the printed book (scripts/check-mahabharata-scan.py), each
# settled by hand against the page images: (passage id, transcription, book). The book's reading
# is kept unless it is plainly a printer's slip (the book's "thy very reverse" and "relinquished"
# are left as the transcription has them). The rest fix quote marks the transcription mangled.
FIXES = [
    ("mahabharata-vidura-1-5", "He whose proposed actions", "He whose purposed actions"),
    ("mahabharata-vidura-1-5", "fear of attachment", "fear or attachment"),
    ("mahabharata-vidura-1-40", "harsh words to others for getting himself", "harsh words to others forgetting himself"),
    ("mahabharata-vidura-1-43", "persons of equal positions", "persons of equal position"),
    ("mahabharata-vidura-2-6", "led by this unsubdued senses", "led by his unsubdued senses"),
    ("mahabharata-vidura-3-6", "Making our lives forfeited", "Making our lives the forfeit"),
    ("mahabharata-vidura-3-13", "The mother also of Sudhanwan", "Mother also of Sudhanwan"),
    ("mahabharata-vidura-4-20", "the acquisition of his object", "the acquisition of its object"),
    ("mahabharata-vidura-4-31", "having the same friends and the same foes", "having same friends and same foes"),
    ("mahabharata-vidura-5-21", "the root of the successful of all", "the root of the success of all"),
    ("mahabharata-vidura-7-4", "strive with activity quarrelling", "strive with activity in quarrelling"),
    ("mahabharata-yaksha-10", "about to die is charity.", "about to die is charity.’"),
    ("mahabharata-yaksha-15", "Yudhishthira answered,—“The best", "Yudhishthira answered,—‘The best"),
    ("mahabharata-yaksha-31", "Yudhishthira answered,-’Listen", "Yudhishthira answered,—‘Listen"),
    ("mahabharata-yaksha-35", "get up with life!", "get up with life!’"),
    ("mahabharata-yaksha-36", "The Yaksha rejoined,-’This", "The Yaksha rejoined,—‘This"),
    ("mahabharata-yaksha-37", "O bull of Bharata race!", "O bull of Bharata race!’"),
    ("mahabharata-churning-2", "begemmed peak—in conclave", "begemmed peak and sat in conclave"),
    ("mahabharata-churning-2", "eager seekers alter amrita", "eager seekers after amrita"),
    ("mahabharata-churning-2", "Nara-yana", "Narayana"),
    ("mahabharata-churning-2", "chum the Ocean", "churn the Ocean"),
    ("mahabharata-churning-4", "failing to do so same to Vishnu", "failing to do so came to Vishnu"),
    ("mahabharata-churning-5", "churn thy waters for obtaining", "churn thy water for obtaining"),
    ("mahabharata-churning-6", "agitation of my waters", "agitation of my water"),
    ("mahabharata-churning-7", "made of Mandara a churning staff", "made Mandara churning staff"),
    ("mahabharata-churning-9", "Large trees with birds", "Large trees abounding with birds"),
    ("mahabharata-churning-12", "we have no strength left", "we have not any strength left"),
    ("mahabharata-churning-14", "I grant you sufficient strength", "I grant ye sufficient strength"),
    ("mahabharata-ganga-15", "stumbling at it were", "stumbling as it were"),
    ("mahabharata-hanuman-2", "short flesh neck", "short fleshy neck"),
    ("mahabharata-hanuman-4", "slayer of foes as casting", "slayer of foes was casting"),
    ("mahabharata-hanuman-6", "reasonable persons like thee", "reasonable person like thee"),
    ("mahabharata-hanuman-39", "when thou shall give", "when thou shalt give"),
]


def fetch(cache, n):
    path = os.path.join(cache, f"{n}.txt")
    if not os.path.exists(path):
        req = urllib.request.Request(f"https://www.gutenberg.org/cache/epub/{n}/pg{n}.txt", headers={"User-Agent": UA})
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
    """Cut after . ! ? (and any closing quotes), not inside 'viz.' or 'i.e.'."""
    parts = re.split(r"(?:(?<=[.!?])|(?<=[.!?][’”'\"]))(?<!viz\.)(?<!i\.e\.)\s+(?=[‘“'\"(A-Z])", text)
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


def section_text(book, start_heading, end_heading):
    a = book.index(f"\n{start_heading}\n")
    b = book.index(f"\n{end_heading}\n", a)
    return book[a + len(start_heading) + 2 : b]


def unquote(speech):
    """Strip the narrator's outer quotes and the speech's own quotes from a paragraph."""
    s = speech.strip().lstrip("“\"").rstrip("”\"").strip()
    s = s.removeprefix("‘").strip()
    s = re.sub(r"[’']+$", "", s).strip() if s.count("‘") < s.count("’") else s
    return s


def vidura(volume):
    """[(chapter, part_text)] in order: Vidura's words only."""
    book = volume[volume.index("\nBOOK 5\n") :]
    names = list(ROMAN)
    out = []
    for i, heading in enumerate(names):
        end = names[i + 1] if i + 1 < len(names) else "XLI"
        body = section_text(book, f"SECTION {heading}", f"SECTION {end}")
        speaking = False
        for para in re.split(r"\n\s*\n", body):
            para = clean(para)
            if not para:
                continue
            m = re.match(r"^[“\"]?(?:Vidura (?:said|continued|replied)|Kshattri said)[,.]?\s*[‘']", para)
            other = re.match(r"^[“\"]?(?:Dhritarashtra|Vaisampayana|Sanjaya)\b[^‘']{0,40}(?:said|continued|asked|replied)", para)
            if m:
                speaking, para = True, para[m.end() :]
            elif other:
                # A paragraph that starts with someone else may still hand over to Vidura mid-way
                hand = re.search(r"Vidura (?:replied|said),?\s*[‘']", para)
                speaking = bool(hand)
                if not hand:
                    continue
                para = para[hand.end() :]
            elif not speaking:
                continue
            text = unquote(para)
            if text:
                out.append((ROMAN[heading] - 32, text))
    return out


def yaksha(volume):
    """The questions and answers of section 311, then Yudhishthira's choice."""
    book = volume[volume.index("\nBOOK 3\n") :]
    body = clean(section_text(book, "SECTION CCCXI", "SECTION CCCXII"))
    start = body.index("The Yaksha then said, ‘What is it that maketh the Sun rise?")
    body = body[start:]
    pieces = re.split(r"(?=The Yaksha (?:then said|asked|said|rejoined),?—?)", body)
    pieces = [p.strip() for p in pieces if p.strip()]
    out = []
    for p in pieces:
        p = p.replace("The Yaksha then said, ‘What is it", "The Yaksha asked, ‘What is it")
        out.append(p.rstrip("”").strip())
    # The ending (from "Thou hast, O king truly answered who is a man") is Yudhishthira's choice:
    # kept together as the last passages, in the book's order
    return out


# Stories of the gods, for the Learn path of that name: (key, title, [(book, section, first words,
# last words)]). A segment runs from its first words (or the section's start) to its last words
# (or the section's end); the narrator's frame is kept, since these are stories.
STORIES = [
    ("ganesha", "Ganesha writes the Mahabharata", [
        ("1", "I", "Brahma said. ‘I esteem thee", "other verses in great abundance."),
    ]),
    ("churning", "The churning of the ocean", [
        ("1", "XVII", "There is a mountain named Meru", None),
        ("1", "XVIII", None, None),
    ]),
    ("ganga", "The Ganga comes down to earth", [
        ("3", "CVIII", None, None),
        ("3", "CIX", None, None),
    ]),
    ("hanuman", "Hanuman meets Bhima", [
        ("3", "CXLV", "On those sounds being heard", None),
        ("3", "CXLVI", None, None),
        ("3", "CXLVII", None, None),
        ("3", "CXLIX", None, "no match for thee single-handed."),
        ("3", "CL", None, None),
    ]),
]


def story(volume, segments):
    """The story's paragraphs, cleaned, without section titles and closing formulas."""
    paras = []
    for book_no, roman, first, last in segments:
        book = volume[volume.index(f"\nBOOK {book_no}\n") :]
        a = book.index(f"\nSECTION {roman}\n")
        b = book.index("\nSECTION ", a + 5)
        body = book[a:b]
        body = body[body.index("\n", 2) :]  # past the heading
        body = re.sub(r"(?<!\n)\n(?!\n)", " ", body)  # lines joined, paragraph breaks kept
        body = re.sub(r" {2,}", " ", body)
        if first:
            body = body[body.index(first) :]
        if last:
            body = body[: body.index(last) + len(last)]
        for para in re.split(r"\n\s*\n", body):
            para = clean(para)
            if not para or re.match(r"^\(.*continued\)$|^So ends the", para):
                continue
            paras.append(para)
    return paras


def main(cache):
    vol1, vol2 = fetch(cache, 15474), fetch(cache, 15475)
    passages = []

    counts = {}
    for chapter, text in vidura(vol2):
        for piece in chunk(text):
            counts[chapter] = counts.get(chapter, 0) + 1
            n = f"{chapter}.{counts[chapter]}"
            passages.append(
                {
                    "id": f"mahabharata-vidura-{chapter}-{counts[chapter]}",
                    "source": f"Vidura Niti {n}",
                    "section": "vidura-niti",
                    "sectionName": "Vidura Niti: Vidura's counsel",
                    "number": n,
                    "partName": f"Chapter {chapter}",
                    "translation": piece,
                    "translator": TRANSLATOR,
                }
            )

    for i, text in enumerate(yaksha(vol1), 1):
        passages.append(
            {
                "id": f"mahabharata-yaksha-{i}",
                "source": f"Yaksha Prashna {i}",
                "section": "yaksha-prashna",
                "sectionName": "Yaksha Prashna: the Yaksha's questions",
                "number": str(i),
                "translation": text,
                "translator": TRANSLATOR,
            }
        )

    for key, title, segments in STORIES:
        vol = vol1  # Books 1 and 3 are both in volume 1
        n = 0
        for para in story(vol, segments):
            for piece in chunk(para):
                n += 1
                passages.append(
                    {
                        "id": f"mahabharata-{key}-{n}",
                        "source": f"{title} {n}",
                        "section": key,
                        "sectionName": title,
                        "number": str(n),
                        "translation": piece,
                        "translator": TRANSLATOR,
                    }
                )

    by_id = {p["id"]: p for p in passages}
    for pid, wrong, right in FIXES:
        if wrong not in by_id[pid]["translation"]:
            sys.exit(f"{pid}: fix no longer matches: {wrong!r}")
        by_id[pid]["translation"] = by_id[pid]["translation"].replace(wrong, right)

    kept = [p for p in passages if p["id"] not in LEAVE_OUT]
    missing = set(LEAVE_OUT) - {p["id"] for p in passages}
    if missing:
        sys.exit(f"LEAVE_OUT names passages that don't exist: {sorted(missing)}")
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(kept, f, ensure_ascii=False, indent=0)
        f.write("\n")
    sections = {}
    for p in kept:
        sections[p["section"]] = sections.get(p["section"], 0) + 1
    print(f"{len(kept)} passages {sections}; {len(LEAVE_OUT)} left out")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else ".")
