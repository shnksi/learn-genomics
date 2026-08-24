"""
Markdown rendering, glossary linking and section extraction for the reader.

Split out of build.py when the build went from one chapter to the whole course.
Everything here is pure: it takes markdown text and returns HTML or data, and
never touches the filesystem except to read the glossary it is handed.

The renderer covers exactly the subset of markdown the curriculum uses. It is
deliberately small rather than general — every feature in it is here because a
real chapter needed it.
"""

from __future__ import annotations

import html
import re
from pathlib import Path


# Which terms are worth auto-linking. A plain length cut-off looks reasonable
# and is wrong: it throws away GWAS, BAM, eQTL, Hi-C and MAPQ — precisely the
# terms a reader with no biology most needs a definition for. So short terms
# are kept when they look like notation rather than an ordinary English word.
MIN_TERM_LEN = 5
MIN_NOTATION_LEN = 3
NOTATION = re.compile(r"[A-Z0-9_\-]")
TERM_STOPLIST = {"gene", "genes", "base", "bases", "cell", "cells", "state", "loop", "mask"}


def is_linkable(term: str) -> bool:
    if term.lower() in TERM_STOPLIST:
        return False
    if len(term) >= MIN_TERM_LEN:
        return True
    # BAM, GWAS, Hi-C, K_s — notation, not vocabulary.
    return len(term) >= MIN_NOTATION_LEN and bool(NOTATION.search(term))


# ─────────────────────────────────────────────────────────────────────────────
# Inline markdown
# ─────────────────────────────────────────────────────────────────────────────

_PUNCT = set("!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~")


def _flanking(prev_ch: str, next_ch: str) -> tuple[bool, bool]:
    prev_ws = prev_ch == "" or prev_ch.isspace()
    next_ws = next_ch == "" or next_ch.isspace()
    prev_punct = prev_ch in _PUNCT
    next_punct = next_ch in _PUNCT
    left = (not next_ws) and (not next_punct or prev_ws or prev_punct)
    right = (not prev_ws) and (not prev_punct or next_ws or next_punct)
    return left, right


def _emphasis(text: str) -> str:
    """Resolve * and _ emphasis by delimiter runs, as CommonMark does.

    A pair of regexes cannot do this. `**2*s***` has one run of three closing
    both a strong and an em, and a regex pass produces crossed tags —
    `<strong>2<em>s</strong></em>`. Scanning runs against a stack of open
    delimiters is what makes the nesting come out in the right order, and what
    leaves genuinely unmatched delimiters as literal text instead of pairing
    them with whatever run comes next.
    """
    if "*" not in text and "_" not in text:
        return text

    toks: list[dict] = []
    pos = 0
    # Runs must be homogeneous: "**_Aa_**" is a run of two asterisks, then an
    # underscore — not a single mixed run of three.
    for m in re.finditer(r"\*+|_+", text):
        if m.start() > pos:
            toks.append({"k": "t", "v": text[pos:m.start()]})
        toks.append({"k": "d", "c": m.group(0)[0], "n": len(m.group(0)),
                     "orig": len(m.group(0)), "open_tags": [], "close_tags": []})
        pos = m.end()
    if pos < len(text):
        toks.append({"k": "t", "v": text[pos:]})

    for i, t in enumerate(toks):
        if t["k"] != "d":
            continue
        prev_ch = ""
        for prev in reversed(toks[:i]):
            if prev["k"] == "t" and prev["v"]:
                prev_ch = prev["v"][-1]
                break
            if prev["k"] == "d":
                prev_ch = prev["c"]
                break
        next_ch = ""
        for nxt in toks[i + 1:]:
            if nxt["k"] == "t" and nxt["v"]:
                next_ch = nxt["v"][0]
                break
            if nxt["k"] == "d":
                next_ch = nxt["c"]
                break
        left, right = _flanking(prev_ch, next_ch)
        if t["c"] == "_":
            # Intraword underscores stay literal, which is what protects
            # snake_case names and any TeX subscript the maths pass missed.
            t["can_open"] = left and (not right or prev_ch in _PUNCT)
            t["can_close"] = right and (not left or next_ch in _PUNCT)
        else:
            t["can_open"], t["can_close"] = left, right

    stack: list[int] = []
    for i, t in enumerate(toks):
        if t["k"] != "d":
            continue
        if t["can_close"]:
            while t["n"] > 0:
                found = -1
                for j in range(len(stack) - 1, -1, -1):
                    o = toks[stack[j]]
                    if o["c"] != t["c"] or o["n"] <= 0:
                        continue
                    # CommonMark's "rule of three": a run that both opens and
                    # closes cannot pair when the two run lengths sum to a
                    # multiple of three, unless both are themselves multiples.
                    if ((o["can_close"] or t["can_open"])
                            and (o["orig"] + t["orig"]) % 3 == 0
                            and not (o["orig"] % 3 == 0 and t["orig"] % 3 == 0)):
                        continue
                    found = j
                    break
                if found < 0:
                    break
                o = toks[stack[found]]
                use = 2 if (o["n"] >= 2 and t["n"] >= 2) else 1
                tag = "strong" if use == 2 else "em"
                o["n"] -= use
                t["n"] -= use
                o["open_tags"].insert(0, f"<{tag}>")
                t["close_tags"].append(f"</{tag}>")
                del stack[found + 1:]
                if o["n"] == 0:
                    stack.pop()
        if t["can_open"] and t["n"] > 0:
            stack.append(i)

    out = []
    for t in toks:
        if t["k"] == "t":
            out.append(t["v"])
        else:
            out.append("".join(t["close_tags"]) + t["c"] * t["n"]
                       + "".join(t["open_tags"]))
    return "".join(out)


def _is_math(span: str) -> bool:
    """Distinguish `$D' = 1$` from `$7.1M in late 2007 to ≈$`.

    Backslashes, carets, underscores or braces settle it. Failing those, a span
    is still maths unless it contains a real word — three consecutive letters —
    which is what separates the one currency range in Ch 40 from the 203 short
    algebraic spans like $D'$ that carry no TeX markers at all.
    """
    if re.search(r"[\\^_{}]", span):
        return True
    return not re.search(r"[A-Za-z]{3,}", span)


_PLACEHOLDER = "\x00{}\x00"


class _Vault:
    """Holds fragments that must survive escaping and emphasis untouched."""

    def __init__(self) -> None:
        self.items: list[str] = []

    def stash(self, fragment: str) -> str:
        self.items.append(fragment)
        return _PLACEHOLDER.format(len(self.items) - 1)

    def restore(self, text: str) -> str:
        def sub(m: re.Match[str]) -> str:
            return self.items[int(m.group(1))]

        # Nested stashes (a link whose text holds code) need repeated passes.
        for _ in range(4):
            new = re.sub(r"\x00(\d+)\x00", sub, text)
            if new == text:
                break
            text = new
        return text


def _escape_text(text: str) -> str:
    """Escape only what is genuinely stray — entities and unicode pass through."""
    text = re.sub(r"&(?![a-zA-Z]+;|#\d+;|#x[0-9a-fA-F]+;)", "&amp;", text)
    return text.replace("<", "&lt;").replace(">", "&gt;")


def render_inline(text: str) -> str:
    vault = _Vault()

    # 1. Code spans win over everything inside them. The delimiter is a RUN of
    #    backticks, so ```` ``` ```` is one span whose content is three
    #    backticks — not a fence, and not three separate spans.
    def code_span(m: re.Match[str]) -> str:
        content = m.group(2)
        # CommonMark strips one leading and trailing space, which is what lets
        # a span hold backticks at its own edges.
        if content.startswith(" ") and content.endswith(" ") and content.strip():
            content = content[1:-1]
        return vault.stash(f"<code>{_escape_text(content)}</code>")

    text = re.sub(r"(?<!`)(`+)(?!`)(.+?)(?<!`)\1(?!`)", code_span, text, flags=re.S)

    # 2. Inline maths. This must run before raw HTML, links and emphasis,
    #    because TeX is full of characters those passes would eat: `_` and `*`
    #    would become emphasis, `<` could open a tag, and `\frac{a}{b}` would
    #    lose its backslashes.
    def math(m: re.Match[str]) -> str:
        return vault.stash(
            f'<span class="math-inline">{html.escape(m.group(1))}</span>'
        )

    text = re.sub(r"\$([^$\n]{1,200})\$", lambda m: math(m) if _is_math(m.group(1))
                  else m.group(0), text)

    # 3. Backslash escapes. Stashed as literals so the emphasis and table
    #    passes never see the character: \* appears in star-allele names like
    #    CYP2D6\*4, and \| inside table cells.
    text = re.sub(
        r"\\([\\`*_{}\[\]()#+\-.!|<>~])",
        lambda m: vault.stash(html.escape(m.group(1))),
        text,
    )

    # 4. Raw inline HTML the chapters use: <sub>, <i>, <b>, <br/>, <details>…
    text = re.sub(
        r"</?[a-zA-Z][a-zA-Z0-9]*(?:\s[^<>]*)?/?>",
        lambda m: vault.stash(m.group(0)),
        text,
    )

    # 5. Images, before links — the syntax differs only by a leading "!", so a
    #    link pattern applied first would swallow them.
    def image(m: re.Match[str]) -> str:
        alt, src = m.group(1), m.group(2)
        return vault.stash(
            f'<img src="{html.escape(src)}" alt="{html.escape(alt)}" loading="lazy">'
        )

    text = re.sub(r"!\[([^\]]*)\]\(([^)]+)\)", image, text)

    # 6. Links.
    def link(m: re.Match[str]) -> str:
        label, href = m.group(1), m.group(2)
        # Stash the TAGS only and leave the label inline.
        #
        # Recursing into render_inline(label) here builds a second vault whose
        # placeholder numbering collides with this one's. Any label already
        # holding a stashed fragment — a code span, an <em>, a <sub> — then
        # restores the wrong item or raises IndexError. Leaving the label in the
        # stream lets it pick up escaping and emphasis from the passes below,
        # using the one vault that owns its placeholders.
        #
        # .md hrefs are emitted verbatim; build.resolve_links rewrites them to
        # real pages once every document in the course is known.
        rel = "" if ".md" in href else ' rel="noopener"'
        return vault.stash(f'<a href="{html.escape(href)}"{rel}>') + label + vault.stash("</a>")

    text = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", link, text)

    # 7. Everything still bare is prose.
    text = _escape_text(text)

    # 8. Emphasis, longest marker first.
    text = _emphasis(text)

    return vault.restore(text)


# ─────────────────────────────────────────────────────────────────────────────
# Block markdown
# ─────────────────────────────────────────────────────────────────────────────


def slugify(text: str) -> str:
    text = re.sub(r"<[^>]+>", "", text)
    text = re.sub(r"[^\w\s-]", "", text.lower())
    return re.sub(r"[\s_]+", "-", text).strip("-")


def _fence_open(line: str) -> tuple[str, str] | None:
    """A code-fence opener, or None.

    CommonMark forbids a backtick in a backtick fence's info string, and that
    rule is load-bearing here: reference/verification-report.md:401 opens with
    four backticks around an inline span of three. Treating that as a fence
    swallowed the rest of the file and swapped prose and code for the whole
    page.
    """
    stripped = line.strip()
    m = re.match(r"^(`{3,}|~{3,})(.*)$", stripped)
    if not m:
        return None
    marker, info = m.group(1), m.group(2)
    if marker[0] == "`" and "`" in info:
        return None
    return marker, info.strip()


def _fence_close(line: str, marker: str) -> bool:
    """A closer must be the same character and at least as long as the opener."""
    stripped = line.strip()
    return bool(re.match(rf"^{re.escape(marker[0])}{{{len(marker)},}}\s*$", stripped))


_LIST_ITEM = re.compile(r"^(\s*)(?:([-*])|(\d+)\.)\s+(.*)$")


def _dedent(block: list[str]) -> list[str]:
    """Strip the common indent from an item's continuation lines.

    Dedenting by the shared minimum — rather than by a fixed two spaces — is
    what lets a nested list inside an item still look like a list when the
    item's content is rendered recursively.
    """
    conts = [ln for ln in block[1:] if ln.strip()]
    if not conts:
        return block
    pad = min(len(ln) - len(ln.lstrip()) for ln in conts)
    return [block[0]] + [ln[pad:] if ln.strip() else "" for ln in block[1:]]


def _take_list(lines: list[str], i: int) -> tuple[str, int]:
    """Parse one list beginning at lines[i]; return its HTML and the next index.

    Item content is rendered by recursing into render_blocks, so an item may
    hold a nested list, a fenced block or several paragraphs. A one-paragraph
    item is unwrapped so ordinary lists stay visually tight.
    """
    first = _LIST_ITEM.match(lines[i])
    indent = len(first.group(1))
    ordered = first.group(3) is not None
    items: list[list[str]] = []
    n = len(lines)

    while i < n:
        line = lines[i]
        m = _LIST_ITEM.match(line)

        if m and len(m.group(1)) == indent:
            if (m.group(3) is not None) != ordered:
                break                       # a different kind of list at this level
            items.append([m.group(4)])
            i += 1
            continue

        if not line.strip():
            # A blank line only continues the list if indented content follows.
            j = i + 1
            while j < n and not lines[j].strip():
                j += 1
            if j < n and items and (len(lines[j]) - len(lines[j].lstrip())) > indent:
                items[-1].append("")
                i += 1
                continue
            break

        if items and (len(line) - len(line.lstrip())) > indent:
            items[-1].append(line)
            i += 1
            continue

        break

    tag = "ol" if ordered else "ul"
    body = []
    for item in items:
        inner = render_blocks(_dedent(item))
        # Only unwrap a genuinely single paragraph. A greedy fullmatch on
        # "<p>a</p><p>b</p>" strips the outer tags and leaves the inner pair
        # stranded, producing "<li>a</p><p>b</li>".
        solo = re.fullmatch(r"<p>((?:(?!</p>).)*)</p>", inner, re.DOTALL)
        body.append(f"<li>{solo.group(1) if solo else inner}</li>")
    return f"<{tag}>{''.join(body)}</{tag}>", i


def render_blocks(lines: list[str]) -> str:
    """Render a list of markdown lines to HTML."""
    out: list[str] = []
    i = 0
    n = len(lines)

    while i < n:
        line = lines[i]
        stripped = line.strip()

        if not stripped:
            i += 1
            continue

        # Display maths — $$ on its own line, or $$…$$ closed on one line
        if stripped.startswith("$$"):
            if stripped.endswith("$$") and len(stripped) > 4:
                out.append(f'<div class="math-display">'
                           f'{html.escape(stripped[2:-2].strip())}</div>')
                i += 1
                continue
            body: list[str] = []
            i += 1
            while i < n and not lines[i].strip().endswith("$$"):
                body.append(lines[i])
                i += 1
            if i < n:
                tail = lines[i].strip()[:-2].strip()
                if tail:
                    body.append(tail)
                i += 1
            out.append(f'<div class="math-display">'
                       f'{html.escape(chr(10).join(body).strip())}</div>')
            continue

        # Fenced code / mermaid
        fence = _fence_open(line)
        if fence:
            marker, lang = fence
            body: list[str] = []
            i += 1
            while i < n and not _fence_close(lines[i], marker):
                body.append(lines[i])
                i += 1
            i += 1
            content = "\n".join(body)
            if lang == "mermaid":
                out.append(f'<div class="mermaid">{html.escape(content)}</div>')
            else:
                cls = f' class="lang-{lang}"' if lang else ""
                out.append(f"<pre><code{cls}>{html.escape(content)}</code></pre>")
            continue

        # Headings
        m = re.match(r"^(#{1,6})\s+(.*)$", stripped)
        if m:
            level = len(m.group(1))
            inner = render_inline(m.group(2))
            out.append(f'<h{level} id="{slugify(m.group(2))}">{inner}</h{level}>')
            i += 1
            continue

        # Horizontal rule
        if re.fullmatch(r"-{3,}|\*{3,}", stripped):
            out.append("<hr>")
            i += 1
            continue

        # Table — only when a separator row follows. Without this check a prose
        # line using absolute-value bars, "|D'| is normalised", matched nothing
        # and was silently dropped from the page.
        if _is_table_start(lines, i):
            header = _split_row(lines[i])
            i += 2
            rows: list[list[str]] = []
            while i < n and lines[i].strip().startswith("|"):
                rows.append(_split_row(lines[i]))
                i += 1
            head = "".join(f"<th>{render_inline(c)}</th>" for c in header)
            body = "".join(
                "<tr>" + "".join(f"<td>{render_inline(c)}</td>" for c in r) + "</tr>"
                for r in rows
            )
            out.append(
                f'<div class="table-scroll"><table><thead><tr>{head}</tr></thead>'
                f"<tbody>{body}</tbody></table></div>"
            )
            continue

        # Blockquote — collect the run, strip markers, render recursively
        if stripped.startswith(">"):
            inner_lines: list[str] = []
            while i < n and lines[i].strip().startswith(">"):
                inner_lines.append(re.sub(r"^\s*>\s?", "", lines[i]))
                i += 1
            out.append(f"<blockquote>{render_blocks(inner_lines)}</blockquote>")
            continue

        # Lists — ordered or unordered, with indented continuation and nesting
        if _LIST_ITEM.match(line):
            html_list, i = _take_list(lines, i)
            out.append(html_list)
            continue

        # Raw HTML block passthrough (<details>, </details>, <summary>)
        if stripped.startswith("<") and re.match(r"^</?[a-zA-Z]", stripped):
            out.append(stripped)
            i += 1
            continue

        # Paragraph
        para: list[str] = []
        while i < n and lines[i].strip():
            s = lines[i].strip()
            if (s.startswith(("#", ">", "$$")) or _fence_open(lines[i])
                    or _LIST_ITEM.match(lines[i]) or _is_table_start(lines, i)):
                break
            if re.fullmatch(r"-{3,}", s):
                break
            para.append(s)
            i += 1
        if para:
            out.append(f"<p>{render_inline(' '.join(para))}</p>")
        else:
            i += 1

    return "\n".join(out)


def _is_table_start(lines: list[str], i: int) -> bool:
    return (
        lines[i].strip().startswith("|")
        and i + 1 < len(lines)
        and re.match(r"^\s*\|[\s:|-]+\|\s*$", lines[i + 1]) is not None
    )


def _split_row(line: str) -> list[str]:
    """Split a pipe-table row, honouring \\| inside a cell."""
    body = line.strip()
    # Mask code spans first: `|s| <= 1/(2Ne)` is one cell, not three.
    spans: list[str] = []

    def _mask(m: re.Match[str]) -> str:
        spans.append(m.group(0))
        return f"\x01{len(spans) - 1}\x01"

    body = re.sub(r"`[^`\n]*`", _mask, body)
    if body.startswith("|"):
        body = body[1:]
    if body.endswith("|") and not body.endswith("\\|"):
        body = body[:-1]
    # Unescape after splitting: in a table, "\\|" means a literal pipe, and that
    # holds inside code spans too — where a backslash escape would normally be
    # taken literally — because the table layer resolves it first.
    cells = re.split(r"(?<!\\)\|", body)
    return [
        re.sub(r"\x01(\d+)\x01", lambda m: spans[int(m.group(1))], c)
        .strip().replace("\\|", "|")
        for c in cells
    ]


# ─────────────────────────────────────────────────────────────────────────────
# Glossary
# ─────────────────────────────────────────────────────────────────────────────


def parse_glossary(path: Path) -> dict[str, dict]:
    """GLOSSARY.md entries look like:  **term** — definition [Ch 50](path.md)"""
    terms: dict[str, dict] = {}
    for line in path.read_text(encoding="utf-8").splitlines():
        m = re.match(r"^\*\*(.+?)\*\*\s+—\s+(.*)$", line.strip())
        if not m:
            continue
        term, definition = m.group(1).strip(), m.group(2).strip()

        chapter = ""
        cm = re.search(r"\[(Ch\s*\d+[A-Z]?|Part\s*\d+)\]\(([^)]+)\)\s*$", definition)
        if cm:
            chapter = cm.group(1)
            definition = definition[: cm.start()].strip()

        # A parenthesised qualifier is disambiguation, not part of the phrase.
        lookup = re.sub(r"\s*\([^)]*\)\s*$", "", term).strip()
        if not is_linkable(lookup):
            continue

        terms[lookup.lower()] = {
            # `term` is injected as text; `definition` is deliberately HTML,
            # rendered here from trusted course markdown.
            "term": html.escape(term),
            "definition": render_inline(definition),
            "chapter": html.escape(chapter),
        }
    return terms


_SKIP_REGIONS = re.compile(
    r"(<pre\b.*?</pre>|<code\b.*?</code>|<a\b.*?</a>|<h[1-6]\b.*?</h[1-6]>"
    r"|<div class=\"mermaid\">.*?</div>|<[^>]+>)",
    re.DOTALL,
)


def link_glossary(page_html: str, terms: dict[str, dict]) -> tuple[str, dict]:
    """Wrap the first occurrence of each term, once per top-level section.

    Linking every occurrence turns the page into a field of dotted underlines;
    once per section is enough to make the definition reachable where it is
    needed without the page reading as noise.
    """
    ordered = sorted(terms, key=len, reverse=True)
    pattern = re.compile(
        r"\b(" + "|".join(re.escape(t) for t in ordered) + r")(s|es)?\b",
        re.IGNORECASE,
    )

    used: dict[str, dict] = {}
    seen_in_section: set[str] = set()

    # Split on whole <h2>…</h2> elements, so each heading is both skipped and a
    # reset point. Splitting on the opening tag alone severs it from its closer
    # and the skip pattern below stops matching it.
    sections = re.split(r"(<h2\b[^>]*>.*?</h2>)", page_html, flags=re.DOTALL)
    rebuilt: list[str] = []

    for idx_chunk, chunk in enumerate(sections):
        if idx_chunk % 2 == 1:  # a heading — never linked, and starts a section
            seen_in_section = set()
            rebuilt.append(chunk)
            continue

        pieces = _SKIP_REGIONS.split(chunk)
        for idx, piece in enumerate(pieces):
            if idx % 2 == 1:  # a skipped region — emit verbatim
                continue

            def wrap(m: re.Match[str]) -> str:
                key = m.group(1).lower()
                if key in seen_in_section:
                    return m.group(0)
                seen_in_section.add(key)
                used[key] = terms[key]
                return (
                    f'<button class="gloss" type="button" data-term="{html.escape(key)}">'
                    f"{m.group(0)}</button>"
                )

            pieces[idx] = pattern.sub(wrap, piece)
        rebuilt.append("".join(pieces))

    return "".join(rebuilt), used


# ─────────────────────────────────────────────────────────────────────────────
# Widget data, extracted from the chapter itself
# ─────────────────────────────────────────────────────────────────────────────


def extract_misconceptions(md: str) -> list[dict]:
    """The `Common misconceptions` table is already `wrong belief | truth`.

    That is the shape of a good multiple-choice distractor, written by someone
    who knows which wrong beliefs are actually held — so the diagnostic is
    generated from it rather than authored a second time.
    """
    section = _section_body(md, "Common misconceptions")
    rows = []
    for line in section.splitlines():
        line = line.strip()
        if not line.startswith("|") or re.match(r"^\|[\s:|-]+\|$", line):
            continue
        cells = _split_row(line)
        if len(cells) != 2 or cells[0].lower().startswith("what people think"):
            continue
        rows.append({"belief": render_inline(cells[0]), "truth": render_inline(cells[1])})
    return rows


def extract_check_yourself(md: str) -> list[dict]:
    """Turn the folded `<details>` Q/As into data the recall widget can schedule."""
    section = _section_body(md, "Check yourself")
    items = []
    pattern = re.compile(
        r"\*\*\d+\.\s*(.+?)\*\*\s*\n+<details><summary>Answer</summary>\s*\n(.*?)\n</details>",
        re.DOTALL,
    )
    for m in pattern.finditer(section):
        items.append(
            {
                "question": render_inline(m.group(1).strip()),
                "answer": render_blocks(m.group(2).strip().splitlines()),
            }
        )
    return items


def extract_map(md: str) -> dict:
    """Parse §10's mermaid graph into a navigable dependency map.

    The chapter already encodes every part, its one-line description and the
    real prerequisite edges in that diagram. Mermaid renders it as a picture;
    parsing it instead turns the same data into something you can interrogate.
    """
    section = _section_body(md, "10. The map")
    block = re.search(r"```mermaid\s*\n(.*?)```", section, re.DOTALL)
    if not block:
        return {"nodes": [], "edges": []}
    body = block.group(1)

    nodes = []
    for m in re.finditer(r'^\s*(\w+)\["(.+?)"\]\s*$', body, re.MULTILINE):
        label = m.group(2)
        part = re.search(r"<b>(.*?)</b>", label)
        rest = re.sub(r"<b>.*?</b>", "", label).strip()
        title, _, blurb = rest.partition("<br/>")
        nodes.append(
            {
                "id": m.group(1),
                "part": html.escape(part.group(1) if part else m.group(1)),
                "title": html.escape(title.strip()),
                "blurb": html.escape(blurb.strip()),
            }
        )

    edges = []
    for line in body.splitlines():
        line = line.strip()
        if "-->" not in line or "[" in line:
            continue
        chain = [seg.strip() for seg in line.split("-->")]
        edges.extend([a, b] for a, b in zip(chain, chain[1:]))

    return {"nodes": nodes, "edges": edges}


def _section_body(md: str, heading: str) -> str:
    m = re.search(
        rf"^##\s+{re.escape(heading)}\s*$(.*?)(?=^##\s|\Z)", md, re.MULTILINE | re.DOTALL
    )
    return m.group(1) if m else ""


def strip_section(md: str, heading: str) -> str:
    """Remove a section whose content a widget replaces entirely."""
    return re.sub(
        rf"^##\s+{re.escape(heading)}\s*$.*?(?=^##\s|\Z)", "", md, flags=re.MULTILINE | re.DOTALL
    )


# ─────────────────────────────────────────────────────────────────────────────
# Widget placement
# ─────────────────────────────────────────────────────────────────────────────


def insert_widgets(page_html: str, placement: list[dict], data: dict) -> tuple[str, list[dict]]:
    """Insert mount points after the heading each widget is anchored to.

    Anchoring by heading text — rather than by an edit to the source markdown —
    is what keeps the chapter file untouched. See README §"Why a sidecar".
    """
    placed: list[dict] = []

    for spec in placement:
        wid = spec["id"]
        anchor = slugify(spec["after_heading"])
        mount = (
            f'<div class="widget" data-widget="{html.escape(wid)}" '
            f'data-title="{html.escape(spec.get("title", wid))}" '
            f'data-note="{html.escape(spec.get("note", ""))}"></div>'
        )

        # Insert before the next heading of the same or higher level, or at the
        # end of the document if this is the last section.
        m = re.search(rf'<(h[23])\s+id="{re.escape(anchor)}"', page_html)
        if not m:
            print(f"  ! no anchor for widget '{wid}' → heading '{spec['after_heading']}'")
            continue

        level = m.group(1)
        tail_start = m.end()
        boundary = re.search(
            rf"<h[1-{level[1]}]\b", page_html[tail_start:]
        )
        cut = tail_start + boundary.start() if boundary else len(page_html)
        page_html = page_html[:cut] + mount + page_html[cut:]
        placed.append(spec)

    return page_html, placed

