"""Add the Mandukya Upanishad, in Robert Ernest Hume's translation, to data/scripture/upanishads.json.

Source: R. E. Hume, The Thirteen Principal Upanishads (Oxford University Press, 1921), pp. 391-393,
public domain. Muller didn't translate the Mandukya, so this is Hume's. Its twelve verses were
typed from the page images of the Princeton copy on archive.org (thirteenprincipa00hume, leaves
410-412), keeping Hume's wording, punctuation and Sanskrit glosses; dropped are his footnotes and
the editor's headings ("The mystic symbolism of the word 'Om'").

Run after build-upanishads.py and build-upanishads-sbe15.py (build-upanishads.py rewrites the file).
Usage: python3 scripts/build-mandukya.py
"""
import json
import os

OUT = os.path.join(os.path.dirname(__file__), "..", "data", "scripture", "upanishads.json")
ORDER = ["isha", "kena", "katha", "prashna", "mundaka", "mandukya", "taittiriya", "chandogya",
         "brihadaranyaka", "shvetashvatara"]

VERSES = [
    "Om!—This syllable is this whole world. Its further explanation is:— The past, the present, the future—everything is just the word Om. And whatever else that transcends threefold time—that, too, is just the word Om.",
    "For truly, everything here is Brahma; this self (ātman) is Brahma. This same self has four fourths.",
    "The waking state (jāgarita-sthāna), outwardly cognitive, having seven limbs, having nineteen mouths, enjoying the gross (sthūla-bhuj), the Common-to-all-men (vaiśvānara), is the first fourth.",
    "The dreaming state (svapna-sthāna), inwardly cognitive, having seven limbs, having nineteen mouths, enjoying the exquisite (pravivikta-bhuj), the Brilliant (taijasa), is the second fourth.",
    "If one asleep desires no desire whatsoever, sees no dream whatsoever, that is deep sleep (suṣupta). The deep-sleep state (suṣupta-sthāna), unified (ekī-bhūta), just (eva) a cognition-mass (prajñāna-ghana), consisting of bliss (ānanda-maya), enjoying bliss (ānanda-bhuj), whose mouth is thought (cetas-), the Cognitional (prājña), is the third fourth.",
    "This is the lord of all (sarveśvara). This is the all-knowing (sarva-jña). This is the inner controller (antar-yāmin). This is the source (yoni) of all, for this is the origin and the end (prabhavāpyayau) of beings.",
    "Not inwardly cognitive (antaḥ-prajña), not outwardly cognitive (bahiḥ-prajña), not both-wise cognitive (ubhayataḥ-prajña), not a cognition-mass (prajñāna-ghana), not cognitive (prajña), not non-cognitive (a-prajña), unseen (a-dṛṣṭa), with which there can be no dealing (a-vyavahārya), ungraspable (a-grāhya), having no distinctive mark (a-lakṣaṇa), non-thinkable (a-cintya), that cannot be designated (a-vyapadeśya), the essence of the assurance of which is the state of being one with the Self (ekātmya-pratyaya-sāra), the cessation of development (prapañcopaśama), tranquil (śānta), benign (śiva), without a second (a-dvaita)—[such] they think is the fourth. He is the Self (Ātman). He should be discerned.",
    "This is the Self with regard to the word Om, with regard to its elements. The elements (mātra) are the fourths; the fourths, the elements: the letter a, the letter u, the letter m.",
    "The waking state, the Common-to-all-men, is the letter a, the first element, from āpti ('obtaining') or from ādimatvā ('being first'). He obtains, verily, indeed, all desires, he becomes first—he who knows this.",
    "The sleeping state, the Brilliant, is the letter u, the second element, from utkarṣa ('exaltation') or from ubhayatvā ('intermediateness'). He exalts, verily, indeed, the continuity of knowledge; and he becomes equal (samāna); no one ignorant of Brahma is born in the family of him who knows this.",
    "The deep-sleep state, the Cognitional, is the letter m, the third element, from miti ('erecting') or from apīti ('immerging'). He, verily, indeed, erects (minoti) this whole world, and he becomes its immerging—he who knows this.",
    "The fourth is without an element, with which there can be no dealing, the cessation of development, benign, without a second. Thus Om is the Self (Ātman) indeed. He who knows this, with his self enters the Self—yea, he who knows this!",
]


def main():
    new = [
        {
            "id": f"upanishads-mandukya-{n}",
            "source": f"Mandukya Upanishad {n}",
            "section": "mandukya",
            "sectionName": "Mandukya Upanishad",
            "number": str(n),
            "translation": text,
            "translator": "Robert Ernest Hume (1921)",
        }
        for n, text in enumerate(VERSES, start=1)
    ]
    old = [p for p in json.load(open(OUT)) if p["section"] != "mandukya"]
    merged = sorted(old + new, key=lambda p: ORDER.index(p["section"]))  # stable: verse order kept
    with open(OUT, "w") as f:
        json.dump(merged, f, ensure_ascii=False, indent=1)
    print(f"Mandukya Upanishad: {len(new)} verses; wrote {len(merged)} verses to {os.path.normpath(OUT)}")


if __name__ == "__main__":
    main()
