"""Build data/scripture/vivekananda.json: Swami Vivekananda's own books, as short passages.

Source: The Complete Works of Swami Vivekananda on Wikisource. Only works he published himself,
which are in the public domain: the 1893 Chicago addresses, Karma-Yoga (1896), Raja-Yoga (1896,
the talks; its sutras are in yoga-sutras.json), Bhakti-Yoga (1896) and Jnana-Yoga (1899).
Volumes 8 and 9 and other material first published after his death are left out (still in copyright).

His talks are prose, so each chapter is split into passages of one to three paragraphs,
cited as "<Book> <chapter>.<passage>", e.g. "Karma-Yoga 3.5".

Usage: python3 scripts/build-vivekananda.py <cache-dir>
"""
import html
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.error
import urllib.request

UA = "SwamiGPT-build/0.1 (personal non-commercial project)"
OUT = os.path.join(os.path.dirname(__file__), "..", "data", "scripture", "vivekananda.json")
WORKS = "The Complete Works of Swami Vivekananda/"

# slug, title, contents page, chapters to leave out
BOOKS = [
    ("chicago", "Chicago Addresses (1893)", "Volume 1/Addresses at The Parliament of Religions", []),
    ("karma-yoga", "Karma-Yoga", "Volume 1/Karma-Yoga", []),
    (
        "raja-yoga",
        "Raja-Yoga",
        "Volume 1/Raja-Yoga",
        ["Preface", "Appendix", "Patanjali"],  # the sutras live in their own text
    ),
    ("bhakti-yoga", "Bhakti-Yoga", "Volume 3/Bhakti-Yoga", []),
    ("jnana-yoga", "Jnana-Yoga", "Volume 2/Jnana-Yoga", []),
]
NOTICE = re.compile(r"talk page|this document|Wikisource|scanned copy|public domain", re.I)
SHORT = 250  # a paragraph shorter than this joins the next one
LONG = 1400  # a passage longer than this is split at a sentence


def fetch(title, path):
    if os.path.exists(path):
        with open(path) as f:
            body = f.read()
        if body.startswith("{"):
            return json.loads(body)
    url = "https://en.wikisource.org/w/api.php?" + urllib.parse.urlencode(
        {"action": "parse", "format": "json", "prop": "text", "page": title}
    )
    for attempt in range(6):
        time.sleep(6 + attempt * 30)  # Wikisource rate-limits bursts
        try:
            body = urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA})).read().decode()
        except urllib.error.HTTPError as e:
            if e.code == 429:
                continue
            raise
        if body.startswith("{"):
            with open(path, "w") as f:
                f.write(body)
            return json.loads(body)
    sys.exit(f"could not fetch {title}")


def chapter_titles(contents_html, book_path, skip):
    """Chapter pages in the order the contents page links them."""
    prefix = "/wiki/" + urllib.parse.quote((WORKS + book_path + "/").replace(" ", "_"))
    seen = []
    for href in re.findall(r'href="([^"#]+)"', contents_html):
        if href.startswith(prefix):
            name = urllib.parse.unquote(href[len(prefix) :]).replace("_", " ")
            if name and "/" not in name and name not in seen and not any(s in name for s in skip):
                seen.append(name)
    return seen


def paragraphs(page):
    t = page["parse"]["text"]["*"]
    t = re.sub(r"<style.*?</style>", "", t, flags=re.S)
    t = re.sub(r'<div class="ws-noexport.*?</div>\s*</div>', "", t, flags=re.S)  # header box
    t = re.sub(r'<sup[^>]*class="reference".*?</sup>', "", t, flags=re.S)
    t = re.sub(r'<ol class="references".*', "", t, flags=re.S)  # footnotes
    out = []
    for p in re.findall(r"<p[^>]*>(.*?)</p>", t, flags=re.S):
        text = " ".join(html.unescape(re.sub(r"<[^>]+>", "", p)).replace("​", "").split())
        # Keep short lines too ("Sisters and Brothers of America,"); drop navigation and
        # Wikisource's own maintenance notices
        # Headings and editors' notes sometimes share the first paragraph's line
        text = re.sub(r"^CHAPTER [IVXL]+\.? [A-Z ,'\-]+ (?=[A-Z][a-z])", "", text)
        text = re.sub(r"^\(\s*(Delivered|A lecture|Written)[^)]*\)\s*", "", text)
        heading = len(text) < 120 and text == text.upper()  # "CHAPTER I KARMA IN ITS EFFECT ON CHARACTER"
        if text and not heading and not text.startswith(("←", "→", "Retrieved from")) and not NOTICE.search(text):
            out.append(text)
    return out


def passages(paras):
    """Join short paragraphs, split very long ones, so each passage is one complete thought."""
    merged, buf = [], ""
    for p in paras:
        buf = f"{buf} {p}".strip()
        if len(buf) >= SHORT:
            merged.append(buf)
            buf = ""
    if buf:
        if merged and len(buf) < SHORT:
            merged[-1] += " " + buf
        else:
            merged.append(buf)
    out = []
    for m in merged:
        while len(m) > LONG:
            cut = max(m.rfind(". ", 0, LONG), m.rfind("? ", 0, LONG), m.rfind("! ", 0, LONG))
            if cut < LONG // 2:
                break
            out.append(m[: cut + 1])
            m = m[cut + 2 :]
        if len(m) < SHORT and out:
            out[-1] += " " + m  # don't leave a one-line scrap on its own
        else:
            out.append(m)
    return out


def main(cache):
    os.makedirs(cache, exist_ok=True)
    out = []
    for slug, title, path, skip in BOOKS:
        contents = fetch(WORKS + path, os.path.join(cache, f"viv-{slug}.json"))
        chapters = chapter_titles(contents["parse"]["text"]["*"], path, skip)
        total = 0
        for c, chapter in enumerate(chapters, start=1):
            page = fetch(f"{WORKS}{path}/{chapter}", os.path.join(cache, f"viv-{slug}-{c}.json"))
            for n, text in enumerate(passages(paragraphs(page)), start=1):
                out.append(
                    {
                        "id": f"vivekananda-{slug}-{c}-{n}",
                        "source": f"{title.split(' (')[0]} {c}.{n}",
                        "section": slug,
                        "sectionName": title,
                        "number": f"{c}.{n}",
                        "partName": chapter,
                        "translation": text,  # his own words in English, so no translator
                    }
                )
                total += 1
        print(f"{title}: {len(chapters)} chapters, {total} passages")
    with open(OUT, "w") as f:
        json.dump(out, f, ensure_ascii=False, indent=1)
    print(f"wrote {len(out)} passages to {os.path.normpath(OUT)}")


if __name__ == "__main__":
    main(sys.argv[1])
