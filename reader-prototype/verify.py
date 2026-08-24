#!/usr/bin/env python3
"""
Check a built site before it is published.

    python3 verify.py [dist]

Exits non-zero and prints a GitHub Actions error annotation for each problem,
so the deploy workflow stops rather than publishing a damaged site.

The checks are the ones that have actually caught something. Each exists
because a real defect got through: an orphaned cross-reference after a chapter
was renamed, a renderer regression leaving markdown markers in the prose, a
figure referenced but never committed, an absolute path that only worked on the
author's laptop.
"""

from __future__ import annotations

import html.parser
import os
import re
import sys
from pathlib import Path

MIN_PAGES = 100
REQUIRED = ["index.html", "404.html", ".nojekyll", "assets/reader.css",
            "assets/katex/LICENSE", "assets/mermaid.LICENSE"]

# Regions where markdown-looking characters are legitimate: Python's **kwargs
# in a code block, a fence marker quoted in the verification report, TeX.
NOISE = re.compile(
    r"<pre.*?</pre>|<code.*?</code>|<script.*?</script>"
    r"|<span class=\"math-inline\">.*?</span>|<div class=\"math-display\">.*?</div>",
    re.DOTALL,
)


class WellFormed(html.parser.HTMLParser):
    VOID = {"img", "br", "hr", "meta", "link", "input", "source", "wbr",
            "col", "area", "base", "embed", "param", "track"}

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.stack: list[str] = []
        self.errors: list[str] = []

    def handle_starttag(self, tag, attrs):
        if tag not in self.VOID:
            self.stack.append(tag)

    def handle_endtag(self, tag):
        if tag in self.VOID:
            return
        if tag in self.stack:
            while self.stack and self.stack[-1] != tag:
                self.errors.append(f"unclosed <{self.stack.pop()}> before </{tag}>")
            if self.stack:
                self.stack.pop()
        else:
            self.errors.append(f"stray </{tag}>")


def main(argv: list[str]) -> int:
    dist = Path(argv[1] if len(argv) > 1 else "dist")
    problems: list[str] = []
    notes: list[str] = []

    def bad(msg: str) -> None:
        problems.append(msg)

    if not dist.is_dir():
        print(f"::error::{dist} does not exist — run build.py first")
        return 1

    for rel in REQUIRED:
        if not (dist / rel).exists():
            bad(f"missing required file: {rel}")

    pages = sorted(dist.glob("*.html"))
    notes.append(f"{len(pages)} pages")
    if len(pages) < MIN_PAGES:
        bad(f"only {len(pages)} pages built — expected at least {MIN_PAGES}")

    on_disk = {p.name for p in pages}
    lower = {n.lower(): n for n in on_disk}
    assets = {
        os.path.relpath(os.path.join(r, f), dist)
        for r, _, fs in os.walk(dist / "assets") for f in fs
    }

    counts = {"dead": 0, "missing_img": 0, "stray": 0, "absolute": 0,
              "case": 0, "broken": 0, "illformed": 0}

    for page in pages:
        raw = page.read_text(encoding="utf-8")
        body = raw.split("<main", 1)[-1].split("</main>", 1)[0]
        name = page.name

        checker = WellFormed()
        checker.feed("<main" + body + "</main>")
        if checker.errors:
            counts["illformed"] += 1
            bad(f"{name}: ill-formed markup — {checker.errors[0]}")

        if "data-dead=" in body:
            counts["dead"] += 1
            target = re.search(r'data-dead="([^"]*)"', body)
            bad(f"{name}: unresolved cross-reference to {target.group(1) if target else '?'}")
        if "data-missing=" in body:
            counts["missing_img"] += 1
            target = re.search(r'data-missing="([^"]*)"', body)
            bad(f"{name}: references a missing image {target.group(1) if target else '?'}")

        prose = NOISE.sub("", body)
        if "**" in prose:
            counts["stray"] += 1
            bad(f"{name}: literal ** left in prose — renderer regression")

        for href in re.findall(r'(?:href|src)="([^"#][^"]*)"', body):
            if href.startswith(("http://", "https://", "mailto:", "data:", "#")):
                continue
            if href.startswith("/") or href.startswith("../"):
                counts["absolute"] += 1
                bad(f"{name}: path escapes the site root — {href}")
                continue
            target = href.split("#")[0]
            if not target:
                continue
            if target.startswith("assets/"):
                if target not in assets:
                    counts["broken"] += 1
                    bad(f"{name}: missing asset {target}")
            elif target.endswith(".html"):
                if target not in on_disk:
                    if target.lower() in lower:
                        counts["case"] += 1
                        bad(f"{name}: link case mismatch — {target} "
                            f"(file is {lower[target.lower()]}); "
                            f"works on macOS, 404s on GitHub Pages")
                    else:
                        counts["broken"] += 1
                        bad(f"{name}: link to non-existent page {target}")

    for k, v in counts.items():
        if v:
            notes.append(f"{k}={v}")
    print("checked: " + ", ".join(notes))

    if problems:
        for p in problems[:40]:
            print(f"::error::{p}")
        if len(problems) > 40:
            print(f"::error::…and {len(problems) - 40} more")
        print(f"\nFAILED — {len(problems)} problem(s)")
        return 1

    print("PASSED — site is publishable")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
