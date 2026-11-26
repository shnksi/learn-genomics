"""Shared SVG design system for Learn Genomics figures.

Matches the reader's exact palette (reader-prototype/src/reader.css) with crisp
typography, generous padding, zero external font dependencies, and valid XML.
"""
from __future__ import annotations

import html
import math
from pathlib import Path

# Palette aligned with reader.css
BG = "#ffffff"
PANEL = "#f8fafc"
SUNK = "#f1f5f9"
INK = "#0f172a"
SOFT = "#334155"
FAINT = "#64748b"
RULE = "#cbd5e1"
RULE_LT = "#e2e8f0"

TEAL = "#0d8a7b"
TEAL_BG = "#e0f5f2"
TEAL_DK = "#085f55"

BLUE = "#2563eb"
BLUE_BG = "#eff6ff"
BLUE_DK = "#1e40af"

AMBER = "#c25e0a"
AMBER_BG = "#fff3e5"
GOLD = "#d97706"

ROSE = "#e11d48"
ROSE_BG = "#fff1f2"
ROSE_DK = "#9f1239"

GREEN = "#15803d"
GREEN_BG = "#ecfdf5"
EMERALD = "#10b981"

PURPLE = "#7c3aed"
PURPLE_BG = "#f5f3ff"

DNA = {"A": "#10b981", "C": "#2563eb", "G": "#d97706", "T": "#e11d48", "U": "#e11d48"}
DNA_BG = {"A": "#ecfdf5", "C": "#eff6ff", "G": "#fffbeb", "T": "#fff1f2", "U": "#fff1f2"}

FONT_UI = "'Plus Jakarta Sans', -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
FONT_MONO = "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"


def esc(s: str) -> str:
    return html.escape(str(s), quote=True)


class Canvas:
    """Clean SVG builder with consistent header, arrowheads, boxes, and plots."""

    def __init__(self, width: int = 760, height: int = 380, title: str = "", subtitle: str = ""):
        self.w = width
        self.h = height
        self.els: list[str] = []
        self.defs: list[str] = [
            f'<marker id="arr-ink" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse"><path d="M 1 1.5 L 9 5 L 1 8.5 z" fill="{SOFT}"/></marker>',
            f'<marker id="arr-teal" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse"><path d="M 1 1.5 L 9 5 L 1 8.5 z" fill="{TEAL}"/></marker>',
            f'<marker id="arr-amber" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse"><path d="M 1 1.5 L 9 5 L 1 8.5 z" fill="{AMBER}"/></marker>',
            f'<marker id="arr-blue" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse"><path d="M 1 1.5 L 9 5 L 1 8.5 z" fill="{BLUE}"/></marker>',
            f'<marker id="arr-rose" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse"><path d="M 1 1.5 L 9 5 L 1 8.5 z" fill="{ROSE}"/></marker>',
            f'<marker id="arr-purple" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse"><path d="M 1 1.5 L 9 5 L 1 8.5 z" fill="{PURPLE}"/></marker>',
        ]
        # Crisp white canvas
        self.rect(0, 0, width, height, fill=BG, rx=0)
        if title:
            self.text(24, 30, title, size=15.5, weight="700", fill=INK)
            if subtitle:
                self.text(24, 48, subtitle, size=11.5, fill=FAINT)
            self.line(24, 58, width - 24, 58, stroke=RULE_LT, sw=1)

    def add(self, s: str) -> None:
        self.els.append(s)

    def rect(self, x, y, w, h, fill=PANEL, stroke="none", sw=1.2, rx=8, dash="", opacity=1.0):
        extra = f' stroke-dasharray="{dash}"' if dash else ""
        op = f' opacity="{opacity}"' if opacity < 1.0 else ""
        self.add(f'<rect x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h:.1f}" rx="{rx}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"{extra}{op}/>')

    def circle(self, cx, cy, r, fill=TEAL, stroke="none", sw=1.5, dash="", opacity=1.0):
        extra = f' stroke-dasharray="{dash}"' if dash else ""
        op = f' opacity="{opacity}"' if opacity < 1.0 else ""
        self.add(f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r:.1f}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"{extra}{op}/>')

    def ellipse(self, cx, cy, rx, ry, fill=TEAL_BG, stroke=TEAL, sw=1.5, dash="", opacity=1.0):
        extra = f' stroke-dasharray="{dash}"' if dash else ""
        op = f' opacity="{opacity}"' if opacity < 1.0 else ""
        self.add(f'<ellipse cx="{cx:.1f}" cy="{cy:.1f}" rx="{rx:.1f}" ry="{ry:.1f}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"{extra}{op}/>')

    def line(self, x1, y1, x2, y2, stroke=RULE, sw=1.5, dash="", marker="", opacity=1.0):
        extra = f' stroke-dasharray="{dash}"' if dash else ""
        mk = f' marker-end="url(#{marker})"' if marker else ""
        op = f' opacity="{opacity}"' if opacity < 1.0 else ""
        self.add(f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="{stroke}" stroke-width="{sw}" stroke-linecap="round"{extra}{mk}{op}/>')

    def path(self, d, fill="none", stroke=TEAL, sw=2.0, dash="", marker="", opacity=1.0):
        extra = f' stroke-dasharray="{dash}"' if dash else ""
        mk = f' marker-end="url(#{marker})"' if marker else ""
        op = f' opacity="{opacity}"' if opacity < 1.0 else ""
        self.add(f'<path d="{d}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round"{extra}{mk}{op}/>')

    def polygon(self, pts, fill=TEAL_BG, stroke=TEAL, sw=1.4, dash="", opacity=1.0):
        pstr = " ".join(f"{x:.1f},{y:.1f}" for x, y in pts)
        extra = f' stroke-dasharray="{dash}"' if dash else ""
        op = f' opacity="{opacity}"' if opacity < 1.0 else ""
        self.add(f'<polygon points="{pstr}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" stroke-linejoin="round"{extra}{op}/>')

    def polyline(self, pts, stroke=TEAL, sw=2.2, dash="", fill="none", opacity=1.0):
        pstr = " ".join(f"{x:.1f},{y:.1f}" for x, y in pts)
        extra = f' stroke-dasharray="{dash}"' if dash else ""
        op = f' opacity="{opacity}"' if opacity < 1.0 else ""
        self.add(f'<polyline points="{pstr}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round"{extra}{op}/>')

    def text(self, x, y, s, size=12, weight="500", fill=INK, anchor="start", mono=False, italic=False, rotate=0):
        fam = FONT_MONO if mono else FONT_UI
        it = ' font-style="italic"' if italic else ""
        tr = f' transform="rotate({rotate} {x:.1f} {y:.1f})"' if rotate else ""
        self.add(f'<text x="{x:.1f}" y="{y:.1f}" font-family="{fam}" font-size="{size}" font-weight="{weight}" fill="{fill}" text-anchor="{anchor}"{it}{tr}>{esc(s)}</text>')

    def multiline(self, x, y, lines, size=11, lh=15, weight="500", fill=SOFT, anchor="start", mono=False):
        for i, ln in enumerate(lines):
            if ln:
                self.text(x, y + i * lh, ln, size=size, weight=weight, fill=fill, anchor=anchor, mono=mono)

    def box(self, x, y, w, h, title, lines=(), fill=PANEL, stroke=RULE, title_fill=INK, rx=8, title_size=12, body_size=10.5):
        self.rect(x, y, w, h, fill=fill, stroke=stroke, sw=1.4, rx=rx)
        if lines:
            self.text(x + w / 2, y + 20, title, size=title_size, weight="700", fill=title_fill, anchor="middle")
            self.multiline(x + w / 2, y + 36, lines, size=body_size, lh=14, fill=SOFT, anchor="middle")
        else:
            self.text(x + w / 2, y + h / 2 + 4, title, size=title_size, weight="700", fill=title_fill, anchor="middle")

    def pill(self, x, y, w, h, label, fill=TEAL_BG, stroke=TEAL, text_fill=TEAL_DK, size=10.5, mono=False):
        self.rect(x, y, w, h, fill=fill, stroke=stroke, sw=1.2, rx=h / 2)
        self.text(x + w / 2, y + h / 2 + 3.8, label, size=size, weight="700", fill=text_fill, anchor="middle", mono=mono)

    def arrow(self, x1, y1, x2, y2, color="ink", sw=1.8, dash=""):
        cmap = {"ink": SOFT, "teal": TEAL, "amber": AMBER, "blue": BLUE, "rose": ROSE, "purple": PURPLE}
        self.line(x1, y1, x2, y2, stroke=cmap[color], sw=sw, dash=dash, marker=f"arr-{color}")

    def panel_box(self, x, y, w, h, header="", fill=PANEL, stroke=RULE_LT, header_fill=TEAL_DK):
        self.rect(x, y, w, h, fill=fill, stroke=stroke, sw=1.2, rx=10)
        if header:
            self.text(x + 12, y + 20, header, size=11.5, weight="700", fill=header_fill)

    def base_seq(self, x, y, seq, cell_w=22, cell_h=22, gap=2, highlight=None):
        highlight = highlight or {}
        for i, b in enumerate(seq):
            bx = x + i * (cell_w + gap)
            c = DNA.get(b, SOFT)
            bg = highlight.get(i, DNA_BG.get(b, SUNK))
            sw = 2.0 if i in highlight else 1.1
            self.rect(bx, y, cell_w, cell_h, fill=bg, stroke=c, sw=sw, rx=4)
            self.text(bx + cell_w / 2, y + cell_h / 2 + 4.5, b, size=12, weight="700", fill=c, anchor="middle", mono=True)

    def axes(self, x, y, w, h, xlabel="", ylabel="", xticks=(), yticks=()):
        # y is bottom of plot, y-h is top
        self.line(x, y - h, x, y, stroke=SOFT, sw=1.5)
        self.line(x, y, x + w, y, stroke=SOFT, sw=1.5)
        for frac, lbl in xticks:
            tx = x + frac * w
            self.line(tx, y, tx, y + 5, stroke=SOFT, sw=1.2)
            self.text(tx, y + 17, lbl, size=10, fill=FAINT, anchor="middle", mono=True)
        for frac, lbl in yticks:
            ty = y - frac * h
            self.line(x - 5, ty, x, ty, stroke=SOFT, sw=1.2)
            self.line(x + 1, ty, x + w, ty, stroke=RULE_LT, sw=0.8, dash="3,3")
            self.text(x - 8, ty + 3.5, lbl, size=10, fill=FAINT, anchor="end", mono=True)
        if xlabel:
            self.text(x + w / 2, y + 34, xlabel, size=11, weight="600", fill=SOFT, anchor="middle")
        if ylabel:
            self.text(x - 36, y - h / 2, ylabel, size=11, weight="600", fill=SOFT, anchor="middle", rotate=-90)

    def render(self) -> str:
        defs_str = "\n  ".join(self.defs)
        body = "\n  ".join(self.els)
        return (
            f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {self.w} {self.h}" '
            f'width="{self.w}" height="{self.h}" role="img">\n'
            f'  <defs>\n  {defs_str}\n  </defs>\n'
            f'  {body}\n'
            f'</svg>\n'
        )

    def save(self, path: Path) -> None:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(self.render(), encoding="utf-8")


def normal_pdf(x: float, mu: float = 0.0, sd: float = 1.0) -> float:
    return math.exp(-0.5 * ((x - mu) / sd) ** 2) / (sd * math.sqrt(2 * math.pi))


def chi2_pdf(x: float, df: int) -> float:
    if x <= 0:
        return 0.0
    k = df / 2.0
    return (x ** (k - 1) * math.exp(-x / 2.0)) / ((2.0 ** k) * math.gamma(k))
