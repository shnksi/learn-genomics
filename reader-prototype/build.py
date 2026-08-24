#!/usr/bin/env python3
"""
Build the whole course as a browsable static reader.

    python3 build.py

Reads every markdown file in the course — UNMODIFIED, nothing is ever written
back — and compiles it into one page per chapter, problem set, lab and
reference document, plus an index.

Every chapter gets "the floor": the interactive layer that costs nothing per
chapter, because the course already wrote all of it.

  · glossary hovercards        from GLOSSARY.md
  · a misconception diagnostic from that chapter's own misconceptions table
  · a recall queue             from that chapter's own Check-yourself answers
  · cross-chapter navigation   from the 2,162 links already in the prose

Chapters may additionally declare bespoke widgets in src/placement.json, keyed
by slug. Only Chapter 00 does; everything else runs on the floor alone.

Output is flat — every page sits directly in dist/ so it can reach siblings and
assets by bare filename, which keeps the site working when opened from file://.

No third-party Python packages.
"""

from __future__ import annotations

import html
import json
import os
import re
import shutil
import sys
from dataclasses import dataclass, field
from pathlib import Path

import render

ROOT = Path(__file__).resolve().parent
COURSE = ROOT.parent
SRC = ROOT / "src"
DIST = ROOT / "dist"
GLOSSARY = COURSE / "GLOSSARY.md"

# Where each statistics chapter is scheduled to be read, per README.md's linear
# order. REVIEW-STATE.md §A1 records that this published schedule is wrong for
# nine chapters; it is reproduced faithfully here rather than silently
# corrected, and the index flags the conflict where a chapter demands an
# S-chapter the order has not reached yet.
S_SCHEDULE = {
    "S1": "09", "S2": "09",
    "S3": "12", "S4": "12",
    "S5": "28", "S7": "28",
    "S6": "32",
}

KIND_LABEL = {
    "chapter": "Chapter",
    "stat": "Statistics",
    "problem-set": "Problem set",
    "lab": "Lab",
    "question-bank": "Question bank",
    "reference": "Reference",
}


# ─────────────────────────────────────────────────────────────────────────────
# Document model
# ─────────────────────────────────────────────────────────────────────────────


@dataclass
class Doc:
    rel: str                 # path relative to the course root
    kind: str
    title: str
    number: str | None = None
    part_dir: str = ""
    part_label: str = ""
    out: str = ""            # output filename, flat in dist/
    order: int = 10_000
    md: str = ""
    meta: str = ""           # the "Before this · Time" header line, if any
    needs_stats: list[str] = field(default_factory=list)

    @property
    def src(self) -> Path:
        return COURSE / self.rel


def part_label(dirname: str) -> str:
    m = re.match(r"part-([0-9]+|S)-(.*)$", dirname)
    if not m:
        return dirname
    num, rest = m.group(1), m.group(2).replace("-", " ")
    rest = rest[:1].upper() + rest[1:]
    if num == "S":
        return "Statistics track"
    return f"Part {int(num)} — {rest}"


def _number_key(number: str | None) -> tuple:
    """'00' -> (0, ''), '20A' -> (20, 'A') so 20A sorts between 20 and 21."""
    if not number:
        return (9_999, "")
    m = re.match(r"^(\d+)([A-Z]*)$", number)
    if not m:
        return (9_999, number)
    return (int(m.group(1)), m.group(2))


def _first_meta_line(md: str) -> str:
    """The '> **Before this:** … · **Time:** …' header, however it is phrased.

    Chapters say 'Before this', the statistics track says 'Read before', labs
    lead with 'Time'. Match the blockquote, not one specific wording.
    """
    for line in md.splitlines()[:8]:
        s = line.strip()
        if s.startswith(">") and re.search(r"\*\*(Before this|Read before|Time):\*\*", s):
            return re.sub(r"^>\s*", "", s)
    return ""


def discover() -> list[Doc]:
    docs: list[Doc] = []

    def add(rel: str, kind: str, number: str | None = None, part_dir: str = ""):
        p = COURSE / rel
        md = p.read_text(encoding="utf-8")
        first = md.splitlines()[0]
        m = re.match(r"^#\s+(.*)$", first)
        if not m:
            print(f"  ! {rel}: no H1 title on line 1 — skipped", file=sys.stderr)
            return
        title = m.group(1)
        # "00 — The whole story" -> the part after the em dash is the real title
        short = re.sub(r"^\s*(?:\d+[A-Z]?|S\d)\s*[—-]\s*", "", title).strip()
        docs.append(
            Doc(
                rel=rel, kind=kind, title=title, number=number,
                part_dir=part_dir, part_label=part_label(part_dir) if part_dir else "",
                md=md, meta=_first_meta_line(md),
                needs_stats=sorted(set(re.findall(r"\bS[1-7]\b",
                    re.search(r"^>\s*\*\*Statistics needed:\*\*.*$", md, re.M).group(0)
                    if re.search(r"^>\s*\*\*Statistics needed:\*\*", md, re.M) else ""))),
            )
        )
        docs[-1].short_title = short  # type: ignore[attr-defined]

    for d in sorted(os.listdir(COURSE)):
        if not d.startswith("part-"):
            continue
        for f in sorted(os.listdir(COURSE / d)):
            if not f.endswith(".md"):
                continue
            m = re.match(r"^(\d+[A-Z]?|S\d)-", f)
            number = m.group(1) if m else None
            add(f"{d}/{f}", "stat" if d.endswith("statistics") else "chapter", number, d)

    for folder, kind in (("problem-sets", "problem-set"),
                         ("labs", "lab"),
                         ("question-banks", "question-bank"),
                         ("reference", "reference")):
        if not (COURSE / folder).is_dir():
            continue
        for f in sorted(os.listdir(COURSE / folder)):
            if f.endswith(".md"):
                add(f"{folder}/{f}", kind)

    if GLOSSARY.exists():
        add("GLOSSARY.md", "reference")

    # Output names: flat, prefixed by kind so they never collide.
    prefix = {"chapter": "ch", "stat": "s", "problem-set": "ps",
              "lab": "lab", "question-bank": "qb", "reference": "ref"}
    for d in docs:
        stem = Path(d.rel).stem
        d.out = f"{prefix[d.kind]}-{stem}.html".replace("--", "-")

    _assign_order(docs)
    return docs


def _assign_order(docs: list[Doc]) -> None:
    """Reading order: chapters by number, statistics chapters at their schedule."""
    chapters = sorted([d for d in docs if d.kind == "chapter"],
                      key=lambda d: _number_key(d.number))
    stats = {d.number: d for d in docs if d.kind == "stat"}

    sequence: list[Doc] = []
    for ch in chapters:
        for s_num, before in S_SCHEDULE.items():
            if ch.number == before and s_num in stats and stats[s_num] not in sequence:
                sequence.append(stats[s_num])
        sequence.append(ch)
    for s in stats.values():          # any unscheduled S-chapter still gets a slot
        if s not in sequence:
            sequence.append(s)

    for i, d in enumerate(sequence):
        d.order = i

    tail = sorted([d for d in docs if d.order == 10_000],
                  key=lambda d: (d.kind, d.rel))
    for i, d in enumerate(tail):
        d.order = len(sequence) + i


# ─────────────────────────────────────────────────────────────────────────────
# Cross-document links
# ─────────────────────────────────────────────────────────────────────────────


def build_link_map(docs: list[Doc]) -> dict[str, str]:
    """Every course-relative .md path -> its output filename."""
    return {d.rel: d.out for d in docs}


# Where a bare directory link should land. The prose says "see ../labs/";
# the site has no directories, so it lands on that group in the contents page.
_DIR_ANCHOR = {
    "problem-sets": "index.html#problem-sets",
    "labs": "index.html#labs",
    "question-banks": "index.html#question-banks",
    "reference": "index.html#references",
    "part-S-statistics": "index.html",
}


def resolve_links(page_html: str, doc: Doc, linkmap: dict[str, str]) -> tuple[str, int, int]:
    """Turn the prose's own .md links into working navigation.

    The chapters already cross-reference each other 2,162 times. Building every
    document at once means those stop being dotted placeholders and become the
    site's navigation — no new authoring at all.
    """
    base = os.path.dirname(doc.rel)
    resolved = dead = 0

    def fix(m: re.Match[str]) -> str:
        nonlocal resolved, dead
        attrs, target = m.group(1), m.group(2)
        path, _, anchor = target.partition("#")
        rel = os.path.normpath(os.path.join(base, path)) if path else doc.rel
        rel = rel.replace(os.sep, "/")
        # The pattern stops before the tag's closing ">", which stays in the
        # source string — so the replacement must not emit one, or every link
        # label gets a stray ">" prepended.
        if rel in linkmap:
            resolved += 1
            href = linkmap[rel] + (f"#{anchor}" if anchor else "")
            return f'<a{attrs}href="{href}"'
        dead += 1
        return f'<a{attrs}href="#" data-dead="{html.escape(target)}" class="xref"'

    page_html = re.sub(r'<a([^>]*?)href="([^"]+\.md(?:#[^"]*)?)"', fix, page_html)

    # Directory links — "see ../problem-sets/" — are not .md files, so the pass
    # above never sees them. Left alone they escape the site root entirely and
    # 404 on any host that is not the author's laptop.
    def fix_dir(m: re.Match[str]) -> str:
        nonlocal resolved, dead
        attrs, target = m.group(1), m.group(2)
        rel = os.path.normpath(os.path.join(base, target)).replace(os.sep, "/")
        anchor = _DIR_ANCHOR.get(rel.split("/")[-1] or rel)
        if anchor is None and rel.startswith("part-"):
            anchor = "index.html"
        if anchor:
            resolved += 1
            return f'<a{attrs}href="{anchor}"'
        dead += 1
        return f'<a{attrs}href="#" data-dead="{html.escape(target)}" class="xref"'

    page_html = re.sub(r'<a([^>]*?)href="([^":#?]*/)"', fix_dir, page_html)
    return page_html, resolved, dead


def resolve_images(page_html: str, doc: Doc, wanted: dict[str, Path]) -> tuple[str, int]:
    """Point <img> at copies in assets/img/ and record what needs copying.

    Sources sit beside their chapter (part-S-statistics/S4-power.png) or in a
    lab's data directory, so the path is rewritten and the file registered for
    copying rather than being left pointing outside dist/.
    """
    base = os.path.dirname(doc.rel)
    found = 0

    def fix(m: re.Match[str]) -> str:
        nonlocal found
        src = m.group(1)
        if src.startswith(("http://", "https://", "data:", "assets/")):
            return m.group(0)
        rel = os.path.normpath(os.path.join(base, src)).replace(os.sep, "/")
        abs_path = COURSE / rel
        flat = rel.replace("/", "-")
        if abs_path.is_file():
            wanted[flat] = abs_path
            found += 1
            return f'<img src="assets/img/{flat}"'
        return f'<img data-missing="{html.escape(rel)}" src="assets/img/{flat}"'

    page_html = re.sub(r'<img src="([^"]+)"', fix, page_html)
    return page_html, found


# ─────────────────────────────────────────────────────────────────────────────
# Page assembly
# ─────────────────────────────────────────────────────────────────────────────


FLOOR_WIDGETS = [
    {
        "id": "misconception-check",
        "after_heading": "Common misconceptions",
        "title": "Which of these do you still believe?",
        "note": "Generated from the table above. The wrong answers are its left column, verbatim.",
    },
    {
        "id": "recall-queue",
        "after_heading": None,     # appended at the end of the document
        "title": "Check yourself",
        "note": "Attempt first, then reveal and rate. Ratings schedule the card for review.",
    },
]


def page_template(doc: Doc, body: str, boot: str, nav: dict) -> str:
    prev_link = (f'<a class="pager-prev" href="{nav["prev"]["out"]}">'
                 f'<span class="pager-dir">Previous</span>'
                 f'<span class="pager-title">{html.escape(nav["prev"]["title"])}</span></a>'
                 if nav.get("prev") else '<span></span>')
    next_link = (f'<a class="pager-next" href="{nav["next"]["out"]}">'
                 f'<span class="pager-dir">Next</span>'
                 f'<span class="pager-title">{html.escape(nav["next"]["title"])}</span></a>'
                 if nav.get("next") else '<span></span>')

    kind = KIND_LABEL.get(doc.kind, doc.kind)
    crumb = html.escape(doc.part_label or kind)

    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{html.escape(doc.title)} — Genetics &amp; Genomics</title>
<link rel="stylesheet" href="assets/katex/katex.min.css">
<link rel="stylesheet" href="assets/reader.css">
</head>
<body>
<a class="skip-link" href="#doc">Skip to content</a>

<header class="topbar">
  <div class="topbar-inner">
    <button id="toc-toggle" class="icon-btn" aria-expanded="false" aria-controls="toc"
            title="Contents">☰<span class="sr-only">Contents</span></button>
    <a class="home-link" href="index.html" title="All contents">Contents</a>
    <div class="topbar-title">
      <strong>{html.escape(doc.title)}</strong>
      <span class="topbar-meta">{crumb}</span>
    </div>
    <div class="topbar-actions">
      <span id="ledger" class="ledger" hidden></span>
      <button id="practice" class="icon-btn" title="Practice mode — no gates, nothing auto-starts"
              aria-pressed="false">⟳<span class="sr-only">Practice mode</span></button>
      <button id="text-size" class="icon-btn" title="Text size">Aa<span class="sr-only">Text size</span></button>
      <button id="theme" class="icon-btn" title="Theme">◐<span class="sr-only">Theme</span></button>
    </div>
  </div>
  <div class="progress" role="progressbar" aria-label="Reading progress"
       aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span id="progress-bar"></span></div>
</header>

<div id="resume" class="resume" hidden></div>

<div class="layout">
  <nav id="toc" class="toc" aria-label="Contents"></nav>
  <main id="doc" class="chapter">
{body}
    <nav class="pager" aria-label="Chapter navigation">
      {prev_link}
      {next_link}
    </nav>
  </main>
</div>

<div id="gloss-card" class="gloss-card" hidden role="dialog" aria-label="Definition"></div>
<div id="toast" class="toast" hidden aria-live="polite"></div>

<script id="bootstrap" type="application/json">{boot}</script>
<script src="assets/katex/katex.min.js"></script>
<script src="assets/mermaid.min.js"></script>
<script src="assets/reader.js"></script>
<script src="assets/widgets.js"></script>
</body>
</html>
"""


def build_doc(doc: Doc, terms: dict, linkmap: dict, placement: dict,
              nav: dict, images: dict) -> tuple[str, dict]:
    md = doc.md

    widget_data: dict = {}
    widgets: list[dict] = []

    if doc.kind in ("chapter", "stat"):
        widget_data["misconceptions"] = render.extract_misconceptions(md)
        widget_data["recall"] = render.extract_check_yourself(md)
        widget_data["map"] = render.extract_map(md)
        if widget_data["recall"]:
            md = render.strip_section(md, "Check yourself")
        widgets = [w for w in FLOOR_WIDGETS
                   if w["id"] != "misconception-check" or widget_data["misconceptions"]]
        widgets = [w for w in widgets
                   if w["id"] != "recall-queue" or widget_data["recall"]]
        widgets = placement.get(Path(doc.rel).stem, []) + widgets

    # The header line moves into the top bar rather than being rendered twice.
    if doc.meta:
        md = md.replace("> " + doc.meta, "", 1)

    body = render.render_blocks(md.splitlines())
    body, used_terms = render.link_glossary(body, terms)
    body, resolved, dead = resolve_links(body, doc, linkmap)
    body, n_img = resolve_images(body, doc, images)

    tail_widgets = [w for w in widgets if w.get("after_heading") is None]
    anchored = [w for w in widgets if w.get("after_heading") is not None]
    body, placed = render.insert_widgets(body, anchored, widget_data)
    for w in tail_widgets:
        body += (f'<div class="widget" data-widget="{html.escape(w["id"])}" '
                 f'data-title="{html.escape(w.get("title", w["id"]))}" '
                 f'data-note="{html.escape(w.get("note", ""))}"></div>')
        placed.append(w)

    toc = [{"id": m.group(1), "text": re.sub(r"<[^>]+>", "", m.group(2))}
           for m in re.finditer(r'<h2 id="([^"]+)">(.*?)</h2>', body, re.DOTALL)]

    boot = json.dumps({
        "docId": doc.out.removesuffix(".html"),
        "title": doc.title,
        "kind": doc.kind,
        "terms": used_terms,
        "toc": toc,
        "widgets": widget_data,
        "nav": nav,
    }, ensure_ascii=False)

    return page_template(doc, body, boot, nav), {
        "terms": len(used_terms), "resolved": resolved, "dead": dead,
        "widgets": [w["id"] for w in placed], "toc": len(toc), "images": n_img,
    }


# ─────────────────────────────────────────────────────────────────────────────
# Index
# ─────────────────────────────────────────────────────────────────────────────


def build_404() -> str:
    """Served by GitHub Pages for any path that does not exist.

    Every link is relative, so this works identically at a user site
    (user.github.io) and a project site (user.github.io/repo/).
    """
    return """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Not found — Genetics &amp; Genomics</title>
<link rel="stylesheet" href="assets/reader.css">
</head>
<body class="is-index">
<header class="topbar">
  <div class="topbar-inner">
    <div class="topbar-title">
      <strong>Genetics &amp; Genomics</strong>
      <span class="topbar-meta">page not found</span>
    </div>
  </div>
</header>
<div class="layout layout-index">
  <main id="doc" class="chapter index-main">
    <div class="index-hero">
      <p class="index-lede">That page isn&rsquo;t here.</p>
      <p class="muted">The reader is one page per chapter, problem set, lab and reference
      document. The contents page lists all of them.</p>
      <p><a class="home-link" href="index.html">Go to contents</a></p>
    </div>
  </main>
</div>
</body>
</html>
"""


def build_index(docs: list[Doc]) -> str:
    ordered = sorted([d for d in docs if d.kind in ("chapter", "stat")],
                     key=lambda d: d.order)
    pos = {d.number: d.order for d in ordered if d.number}
    where = {d.number: d for d in ordered if d.number}

    rows = []
    current_part = None
    open_list = False
    for d in ordered:
        # Only a genetics part starts a new heading. The statistics chapters are
        # interleaved at their scheduled points, so heading on every change would
        # split Part 2 into two identical-looking blocks around S3/S4.
        if d.kind == "chapter" and d.part_label != current_part:
            current_part = d.part_label
            if open_list:
                rows.append("</ol>")
            rows.append(f'<h2 class="part-head">{html.escape(current_part)}</h2>'
                        f'<ol class="doc-list">')
            open_list = True
        elif not open_list:
            rows.append('<ol class="doc-list">')
            open_list = True

        num = html.escape(d.number or "")
        short = html.escape(getattr(d, "short_title", d.title))

        # A prerequisite is only worth flagging when the published order has NOT
        # already supplied it. This is REVIEW-STATE.md §A1 made visible: the
        # statistics retrofit left some chapters demanding an S-chapter that the
        # schedule reaches later.
        unmet = [s for s in d.needs_stats
                 if s in pos and pos[s] > d.order]
        note = ""
        if unmet:
            links = ", ".join(
                f'<a href="{where[s].out}">{html.escape(s)}</a>' for s in unmet)
            note = (f'<span class="needs" title="This chapter needs a statistics '
                    f'chapter the published reading order places later">'
                    f'needs {links} &#8599;</span>')
        cls = "doc-row doc-row-stat" if d.kind == "stat" else "doc-row"
        rows.append(
            f'<li class="{cls}" data-doc="{d.out.removesuffix(".html")}">'
            f'<a href="{d.out}">'
            f'<span class="doc-num">{num}</span>'
            f'<span class="doc-title">{short}</span>'
            f'</a>{note}'
            f'<span class="doc-state" data-state></span>'
            f"</li>"
        )
    if open_list:
        rows.append("</ol>")

    def group(kind: str, heading: str, blurb: str) -> str:
        items = sorted([d for d in docs if d.kind == kind], key=lambda d: d.rel)
        if not items:
            return ""
        lis = "".join(
            f'<li><a href="{d.out}">'
            f'{html.escape(getattr(d, "short_title", d.title))}</a></li>'
            for d in items
        )
        return (f'<section class="aux" id="{kind}s"><h2 class="part-head">'
                f'{html.escape(heading)}</h2>'
                f'<p class="aux-blurb">{blurb}</p><ul class="aux-list">{lis}</ul></section>')

    aux = "".join([
        group("problem-set", "Problem sets",
              "Attempt before revealing — genetics is learned by calculating, not by reading."),
        group("lab", "Labs",
              "Computational, on real public data. Start with lab-00 to build the environment."),
        group("question-bank", "Question banks",
              "Rapid recall. Every chapter&rsquo;s own questions are already scheduled in its reader."),
        group("reference", "Reference", "Glossary, formulas, verified facts, further reading."),
    ])

    total_ch = len([d for d in docs if d.kind in ("chapter", "stat")])

    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Genetics &amp; Genomics — contents</title>
<link rel="stylesheet" href="assets/katex/katex.min.css">
<link rel="stylesheet" href="assets/reader.css">
</head>
<body class="is-index">
<header class="topbar">
  <div class="topbar-inner">
    <div class="topbar-title">
      <strong>Genetics &amp; Genomics</strong>
      <span class="topbar-meta">zero to third-year · {total_ch} chapters</span>
    </div>
    <div class="topbar-actions">
      <button id="practice" class="icon-btn" title="Practice mode — no gates, nothing auto-starts"
              aria-pressed="false">⟳<span class="sr-only">Practice mode</span></button>
      <button id="text-size" class="icon-btn" title="Text size">Aa<span class="sr-only">Text size</span></button>
      <button id="theme" class="icon-btn" title="Theme">◐<span class="sr-only">Theme</span></button>
    </div>
  </div>
</header>

<div class="layout layout-index">
  <main id="doc" class="chapter index-main">
    <div class="index-hero">
      <p class="index-lede">A self-contained curriculum from no biology at all to a full
      third-year grounding in classical, molecular and evolutionary genetics — with human and
      computational genomics built on top.</p>
      <div id="index-summary" class="index-summary"></div>
      <p class="muted"><strong>Read Chapter 00 first.</strong> It tells the whole story at low
      resolution; everything after is a zoom into part of that picture.</p>
    </div>
    {''.join(rows)}
    {aux}
  </main>
</div>

<div id="toast" class="toast" hidden aria-live="polite"></div>
<script id="bootstrap" type="application/json">{{"docId":"index","kind":"index"}}</script>
<script src="assets/reader.js"></script>
</body>
</html>
"""


# ─────────────────────────────────────────────────────────────────────────────
# Build
# ─────────────────────────────────────────────────────────────────────────────


def main() -> int:
    if not GLOSSARY.exists():
        print(f"error: missing {GLOSSARY}", file=sys.stderr)
        return 1

    placement_raw = json.loads((SRC / "placement.json").read_text(encoding="utf-8"))
    placement = placement_raw if isinstance(placement_raw, dict) else {}

    docs = discover()
    linkmap = build_link_map(docs)
    terms = render.parse_glossary(GLOSSARY)

    reading = sorted([d for d in docs if d.kind in ("chapter", "stat")], key=lambda d: d.order)
    nav_of = {}
    for i, d in enumerate(reading):
        nav_of[d.rel] = {
            "prev": ({"out": reading[i - 1].out, "title": reading[i - 1].title}
                     if i else None),
            "next": ({"out": reading[i + 1].out, "title": reading[i + 1].title}
                     if i + 1 < len(reading) else None),
            "position": i + 1, "total": len(reading),
        }

    # Clear the whole output tree, not just the pages. Deleting only *.html
    # left a 3.4 MB copy of mermaid.min.js at the site root — an orphan of an
    # earlier layout, unreferenced but still served, and still uploaded to
    # Pages on every deploy.
    if DIST.exists():
        shutil.rmtree(DIST)

    DIST.mkdir(parents=True, exist_ok=True)
    assets = DIST / "assets"
    assets.mkdir(exist_ok=True)
    for name in ("reader.css", "reader.js", "widgets.js"):
        shutil.copy2(SRC / name, assets / name)
    vendor = ROOT / "vendor" / "mermaid.min.js"
    if vendor.exists():
        shutil.copy2(vendor, assets / "mermaid.min.js")
    katex_src = ROOT / "vendor" / "katex"
    if katex_src.is_dir():
        shutil.copytree(katex_src, assets / "katex", dirs_exist_ok=True)

    # Ship the licences with the code they cover. Both libraries are MIT and
    # mermaid bundles DOMPurify (Apache-2.0 OR MPL-2.0); redistributing the
    # minified bundles without their licence text is not permitted by either.
    for lic in sorted((ROOT / "vendor").glob("*LICENSE*")):
        shutil.copy2(lic, assets / lic.name)
    if (ROOT / "vendor" / "LICENSES.md").exists():
        shutil.copy2(ROOT / "vendor" / "LICENSES.md", assets / "LICENSES.md")

    total_terms = total_resolved = total_dead = total_widgets = 0
    images: dict[str, Path] = {}
    by_kind: dict[str, int] = {}

    for d in docs:
        page, info = build_doc(d, terms, linkmap, placement, nav_of.get(d.rel, {}), images)
        (DIST / d.out).write_text(page, encoding="utf-8")
        total_terms += info["terms"]
        total_resolved += info["resolved"]
        total_dead += info["dead"]
        total_widgets += len(info["widgets"])
        by_kind[d.kind] = by_kind.get(d.kind, 0) + 1

    (DIST / "index.html").write_text(build_index(docs), encoding="utf-8")
    (DIST / "404.html").write_text(build_404(), encoding="utf-8")

    # Tell GitHub Pages not to run Jekyll over the output. Without it Jekyll
    # processes the directory and silently drops anything whose name begins
    # with an underscore — which today is nothing, but is one renamed asset
    # away from being a confusing partial deploy.
    (DIST / ".nojekyll").write_text("", encoding="utf-8")

    if images:
        imgdir = assets / "img"
        imgdir.mkdir(exist_ok=True)
        for flat, src in sorted(images.items()):
            shutil.copy2(src, imgdir / flat)

    print(f"documents  {len(docs)}")
    for k, v in sorted(by_kind.items()):
        print(f"           {v:3d}  {KIND_LABEL.get(k, k)}")
    print(f"glossary   {len(terms):,} linkable terms, {total_terms:,} hovercards placed")
    print(f"links      {total_resolved:,} cross-document links resolved, {total_dead} dead")
    print(f"widgets    {total_widgets} mounted across the course")
    print(f"images     {len(images)} copied into assets/img/")
    print(f"pages      404.html + .nojekyll written for static hosting")
    size = sum(f.stat().st_size for f in DIST.glob("*.html")) / 1024
    print(f"\nwrote      dist/  ({len(list(DIST.glob('*.html')))} pages, {size:.0f} KB of HTML)")
    print(f"open       file://{DIST / 'index.html'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
