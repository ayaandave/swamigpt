"""Build data/scripture/yoga-sutras.json: Patanjali's Yoga Sutras, all four books.

Source: Swami Vivekananda, Raja-Yoga (1896), "Patanjali's Yoga Aphorisms", public domain,
from the proofread Complete Works on Wikisource. Each sutra there is printed as the
Sanskrit, Vivekananda's translation, then his commentary, which we keep too.

Usage: python3 scripts/build-yoga-sutras.py <cache-dir>
Needs: pip install indic-transliteration   (Devanagari -> IAST transliteration)
"""
import html
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request

from indic_transliteration import sanscript

UA = "SwamiGPT-build/0.1 (personal non-commercial project)"
PAGE = "The Complete Works of Swami Vivekananda/Volume 1/Raja-Yoga/Patanjali's Yoga Aphorisms - "
BOOKS = [
    (1, "Concentration: Its Spiritual Uses", "Samadhi Pada"),
    (2, "Concentration: Its Practice", "Sadhana Pada"),
    (3, "Powers", "Vibhuti Pada"),
    (4, "Independence", "Kaivalya Pada"),
]
DEV = str.maketrans("०१२३४५६७८९", "0123456789")
OUT = os.path.join(os.path.dirname(__file__), "..", "data", "scripture", "yoga-sutras.json")


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
    t = re.sub(r'<div class="ws-noexport.*?</div>\s*</div>', "", t, flags=re.S)  # header box
    t = re.sub(r'<sup[^>]*class="reference".*?</sup>', "", t, flags=re.S)
    t = re.sub(r"<(?:br|/p|/div|/h\d)[^>]*>", "\n", t)
    s = html.unescape(re.sub(r"<[^>]+>", "", t)).replace("​", "")
    return [" ".join(l.split()) for l in s.splitlines() if l.strip()]


def parse_book(lines):
    """Sutras look like: '<Sanskrit> ॥N॥', then 'N. translation', then commentary paragraphs."""
    sutras = []
    for line in lines:
        if line.startswith("↑") or line in ("Notes", "Footnotes"):
            break  # the page's footnotes start here (some are later editors' notes, not Vivekananda's)
        m = re.match(r"^([ऀ-ॿ\s\-ऽ।॥]+?)\s*॥\s*([०-९]+)\s*॥$", line)
        if m:
            sutras.append({"n": int(m.group(2).translate(DEV)), "sanskrit": m.group(1).strip(), "rest": []})
        elif sutras:
            sutras[-1]["rest"].append(line)
    out = []
    for s in sutras:
        rest = s["rest"]
        first = rest[0] if rest else ""
        m = re.match(rf"^{s['n']}\.\s*(.+)$", first)
        if not m:
            sys.exit(f"sutra {s['n']}: no translation line, got {first[:60]!r}")
        commentary = [p for p in rest[1:] if not re.match(r"^(←|→|Retrieved from|\[edit\])", p)]
        out.append({"n": s["n"], "sanskrit": s["sanskrit"], "translation": m.group(1).strip(), "commentary": commentary})
    return out


def main(cache):
    os.makedirs(cache, exist_ok=True)
    out = []
    for book, name, pada in BOOKS:
        page = fetch(PAGE + name, os.path.join(cache, f"ys-{book}.json"))
        sutras = parse_book(page_lines(page))
        numbers = [s["n"] for s in sutras]
        if numbers != list(range(1, len(numbers) + 1)):
            sys.exit(f"book {book}: sutra numbers out of order: {numbers}")
        for s in sutras:
            out.append(
                {
                    "id": f"yoga-sutras-{book}-{s['n']}",
                    "source": f"Yoga Sutras {book}.{s['n']}",
                    "section": str(book),
                    "sectionName": f"{pada}: {name}",
                    "number": str(s["n"]),
                    "sanskrit": s["sanskrit"] + " ॥",
                    "transliteration": sanscript.transliterate(s["sanskrit"], sanscript.DEVANAGARI, sanscript.IAST),
                    "translation": s["translation"],
                    "translator": "Swami Vivekananda (1896)",
                    "commentary": s["commentary"],
                }
            )
        print(f"book {book}: {len(sutras)} sutras")
    with open(OUT, "w") as f:
        json.dump(out, f, ensure_ascii=False, indent=1)
    print(f"wrote {len(out)} sutras to {os.path.normpath(OUT)}")


if __name__ == "__main__":
    main(sys.argv[1])
