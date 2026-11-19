#!/usr/bin/env python3
"""Convert question banks to an Anki-importable TSV.

Question banks use a flat, human-readable format:

    ## Section heading (optional, becomes a tag)

    Q: What does a centromere do?
    A: It is the chromosomal region where the kinetochore assembles, so that
       spindle microtubules can attach and segregate the chromosome.

Answers may span multiple lines and continue until the next `Q:`, the next
heading, or end of file. Blank lines inside an answer are preserved as line
breaks.

Usage
-----
    python reference/to_anki.py question-banks/ --out anki-import.tsv
    python reference/to_anki.py question-banks/qb-part-01.md --out part1.tsv
    python reference/to_anki.py question-banks/ --deck "Genomics::Part 1"
    python reference/to_anki.py question-banks/ --legacy --out anki-legacy.tsv

By default, answers longer than ``--max-words`` (35) are split into a concise
core answer in ``Back`` and the extended explanation in a separate ``Notes``
column (4 columns: ``Front``, ``Back``, ``Notes``, ``Tags``; plus optional
``Deck``). Pass ``--legacy`` for the original 3-column ``Front / Back / Tags``
format with the full answer in ``Back``.

Then in Anki: File > Import, choose "Fields separated by: Tab", map field 1 to
Front, field 2 to Back, field 3 to Notes (optional extra field on your note
type), field 4 to Tags, and enable "Allow HTML in fields" so the <br> line
breaks render.
"""

from __future__ import annotations

import argparse
import html
import re
import sys
from pathlib import Path

Q_PREFIX = re.compile(r"^Q:\s*(.*)$")
A_PREFIX = re.compile(r"^A:\s*(.*)$")
HEADING = re.compile(r"^#{1,6}\s+(.*)$")


class ParseError(Exception):
    """Raised when a bank is malformed in a way that would silently lose cards."""


def slugify_tag(text: str) -> str:
    """Anki tags cannot contain spaces; use underscores."""
    text = re.sub(r"[^\w\s-]", "", text).strip()
    return re.sub(r"[\s-]+", "_", text)


def parse_bank(path: Path) -> list[dict[str, str]]:
    """Extract Q/A pairs from one markdown question bank.

    Returns a list of {"front", "back", "tags"} dicts.
    """
    cards: list[dict[str, str]] = []
    section = ""
    pending_q: str | None = None
    answer_lines: list[str] = []
    q_lineno = 0

    def flush() -> None:
        nonlocal pending_q, answer_lines
        if pending_q is None:
            return
        back = "\n".join(answer_lines).strip()
        if not back:
            raise ParseError(f"{path}:{q_lineno}: question has no answer -- {pending_q[:60]!r}")
        cards.append(
            {
                "front": pending_q.strip(),
                "back": back,
                "tags": " ".join(
                    t for t in (slugify_tag(path.stem), slugify_tag(section)) if t
                ),
            }
        )
        pending_q, answer_lines = None, []

    for lineno, raw in enumerate(path.read_text(encoding="utf-8").splitlines(), start=1):
        line = raw.rstrip()

        heading = HEADING.match(line)
        if heading:
            flush()
            section = heading.group(1)
            continue

        q_match = Q_PREFIX.match(line)
        if q_match:
            flush()
            pending_q, q_lineno = q_match.group(1), lineno
            continue

        a_match = A_PREFIX.match(line)
        if a_match:
            if pending_q is None:
                raise ParseError(f"{path}:{lineno}: answer with no preceding question")
            answer_lines = [a_match.group(1)]
            continue

        # Continuation of the current answer.
        if pending_q is not None and answer_lines:
            answer_lines.append(line.strip())

    flush()
    return cards


# Sentence boundary: punctuation followed by whitespace and a sentence starter,
# avoiding common scientific abbreviations and decimal numbers.
_SENT_SPLIT = re.compile(
    r"(?<!\be\.g)(?<!\bi\.e)(?<!\bvs)(?<!\bCh)(?<!\bFig)(?<!\bNo)(?<!\bDr)(?<!\bal)"
    r"(?<=[.!?])\s+(?=[A-Z0-9(\"`'\[])"
)


def split_atomic_answer(text: str, max_words: int = 35) -> tuple[str, str]:
    """Split a long answer into a concise core Back and a detailed Notes field.

    Always keeps at least the first full sentence in Back so cards never break
    mid-thought. Returns ``(back, notes)`` where ``notes`` is empty if the full
    answer already fits within ``max_words``.
    """
    if len(text.split()) <= max_words:
        return text, ""

    paragraphs = [p.strip() for p in text.split("\n") if p.strip()]
    first_para = paragraphs[0]
    rest_paras = paragraphs[1:]

    sentences = _SENT_SPLIT.split(first_para)
    core: list[str] = [sentences[0]]
    words = len(sentences[0].split())
    rest_sents: list[str] = []

    for i, sent in enumerate(sentences[1:], start=1):
        sw = len(sent.split())
        if words + sw <= max_words:
            core.append(sent)
            words += sw
        else:
            rest_sents = sentences[i:]
            break

    back = " ".join(core).strip()
    note_parts: list[str] = []
    if rest_sents:
        note_parts.append(" ".join(rest_sents).strip())
    note_parts.extend(rest_paras)
    return back, "\n".join(note_parts).strip()


def to_tsv_row(
    card: dict[str, str],
    deck: str | None,
    *,
    legacy: bool = False,
    max_words: int = 35,
) -> str:
    """Escape for TSV. Anki reads <br> as a line break when HTML is enabled."""

    def clean(text: str) -> str:
        text = html.escape(text, quote=False)
        text = text.replace("\t", " ")
        return text.replace("\n", "<br>")

    if legacy:
        fields = [clean(card["front"]), clean(card["back"]), card["tags"]]
    else:
        back, notes = split_atomic_answer(card["back"], max_words=max_words)
        fields = [clean(card["front"]), clean(back), clean(notes), card["tags"]]
    if deck:
        fields.append(deck)
    return "\t".join(fields)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("source", type=Path, help="A question bank .md file, or a directory of them")
    parser.add_argument("--out", type=Path, default=Path("anki-import.tsv"))
    parser.add_argument("--deck", help="Optional deck name, written as the final column")
    parser.add_argument(
        "--max-words",
        type=int,
        default=35,
        help="Target maximum words in Back before overflowing to Notes (default: 35)",
    )
    parser.add_argument(
        "--legacy",
        action="store_true",
        help="Emit the original 3-column Front/Back/Tags format without splitting Notes",
    )
    args = parser.parse_args(argv)

    if args.source.is_dir():
        banks = sorted(args.source.glob("*.md"))
    elif args.source.is_file():
        banks = [args.source]
    else:
        print(f"error: no such file or directory: {args.source}", file=sys.stderr)
        return 1

    if not banks:
        print(f"error: no .md question banks found in {args.source}", file=sys.stderr)
        return 1

    all_cards: list[dict[str, str]] = []
    for bank in banks:
        try:
            cards = parse_bank(bank)
        except ParseError as exc:
            print(f"error: {exc}", file=sys.stderr)
            return 1
        print(f"  {bank.name}: {len(cards)} cards", file=sys.stderr)
        all_cards.extend(cards)

    if not all_cards:
        print("error: parsed 0 cards -- check the Q:/A: format", file=sys.stderr)
        return 1

    rows = [
        to_tsv_row(c, args.deck, legacy=args.legacy, max_words=args.max_words)
        for c in all_cards
    ]
    args.out.write_text("\n".join(rows) + "\n", encoding="utf-8")

    cols = "Front / Back / Tags" if args.legacy else "Front / Back / Notes / Tags"
    print(f"\nwrote {len(all_cards)} cards ({cols}) to {args.out}", file=sys.stderr)
    print("import into Anki with: fields separated by Tab, 'Allow HTML in fields' on", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
