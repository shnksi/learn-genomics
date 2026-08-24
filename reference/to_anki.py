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

Then in Anki: File > Import, choose "Fields separated by: Tab", map field 1 to
Front and field 2 to Back, and enable "Allow HTML in fields" so the <br> line
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


def to_tsv_row(card: dict[str, str], deck: str | None) -> str:
    """Escape for TSV. Anki reads <br> as a line break when HTML is enabled."""

    def clean(text: str) -> str:
        text = html.escape(text, quote=False)
        text = text.replace("\t", " ")
        return text.replace("\n", "<br>")

    fields = [clean(card["front"]), clean(card["back"]), card["tags"]]
    if deck:
        fields.append(deck)
    return "\t".join(fields)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("source", type=Path, help="A question bank .md file, or a directory of them")
    parser.add_argument("--out", type=Path, default=Path("anki-import.tsv"))
    parser.add_argument("--deck", help="Optional deck name, written as a fourth column")
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

    rows = [to_tsv_row(c, args.deck) for c in all_cards]
    args.out.write_text("\n".join(rows) + "\n", encoding="utf-8")

    print(f"\nwrote {len(all_cards)} cards to {args.out}", file=sys.stderr)
    print("import into Anki with: fields separated by Tab, 'Allow HTML in fields' on", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
