"""Wave 2 precision SVG diagrams — Parts 0–3 (16 additional high-impact visual figures)."""
from __future__ import annotations
import math
from pathlib import Path
from svg_kit import (
    Canvas, INK, SOFT, FAINT, RULE, RULE_LT, PANEL, SUNK,
    TEAL, TEAL_DK, TEAL_BG, AMBER, AMBER_BG, BLUE, BLUE_DK, BLUE_BG,
    ROSE, ROSE_DK, ROSE_BG, PURPLE, PURPLE_BG, GREEN, GREEN_BG, DNA, DNA_BG,
)


def fig_01b(out: Path):
    c = Canvas(760, 360, "The hydrophobic effect drives membranes and protein folding",
               "Water maximizes its H-bond network by excluding nonpolar chains into lipid bilayers and buried protein cores")
    # Left panel: Phospholipid bilayer
    c.panel_box(24, 72, 348, 268, "Amphipathic phospholipids self-assemble into a bilayer")
    c.text(198, 108, "Aqueous exterior (polar H₂O)", size=10, weight="700", fill=BLUE_DK, anchor="middle")
    # Top row of heads + tails
    for i in range(11):
        hx = 58 + i * 28
        c.circle(hx, 134, 9, fill=BLUE_BG, stroke=BLUE, sw=1.6)
        c.path(f"M {hx-3} 143 Q {hx-7} 162, {hx-3} 180", stroke=AMBER, sw=2.0)
        c.path(f"M {hx+3} 143 Q {hx+7} 162, {hx+3} 180", stroke=AMBER, sw=2.0)
    # Bottom row of heads + tails
    for i in range(11):
        hx = 58 + i * 28
        c.circle(hx, 240, 9, fill=BLUE_BG, stroke=BLUE, sw=1.6)
        c.path(f"M {hx-3} 231 Q {hx-7} 212, {hx-3} 194", stroke=AMBER, sw=2.0)
        c.path(f"M {hx+3} 231 Q {hx+7} 212, {hx+3} 194", stroke=AMBER, sw=2.0)
    c.rect(52, 178, 292, 18, fill=AMBER_BG, stroke="none", opacity=0.7, rx=4)
    c.text(198, 191, "Hydrophobic core (water excluded)", size=10, weight="700", fill=AMBER, anchor="middle")
    c.text(198, 272, "Aqueous cytosol (polar H₂O)", size=10, weight="700", fill=BLUE_DK, anchor="middle")
    c.multiline(198, 298, [
        "Polar phosphate heads face water;",
        "nonpolar fatty-acid tails pack inside → selective barrier.",
    ], size=9.8, lh=14, fill=SOFT, anchor="middle")

    # Right panel: Hydrophobic collapse of protein chain
    c.panel_box(388, 72, 348, 268, "Hydrophobic collapse folds a polypeptide in water")
    # Unfolded chain top
    c.text(562, 108, "Unfolded chain (ordered water cages around nonpolar side chains)", size=9.5, weight="600", fill=FAINT, anchor="middle")
    c.path("M 418 142 Q 454 114, 492 142 T 566 142 T 640 142 T 706 138", stroke=SOFT, sw=2.6)
    beads_u = [(436, 134, AMBER), (468, 128, BLUE), (506, 148, AMBER), (542, 146, BLUE),
               (578, 134, AMBER), (612, 142, BLUE), (648, 138, AMBER), (684, 142, BLUE)]
    for bx, by, col in beads_u:
        c.circle(bx, by, 6.5, fill=col, stroke="#ffffff", sw=1.2)
    c.arrow(562, 162, 562, 188, color="teal", sw=2.2)
    c.text(632, 178, "ΔS(water) > 0", size=10, weight="700", fill=TEAL_DK)

    # Folded globule bottom
    c.circle(562, 242, 46, fill=TEAL_BG, stroke=TEAL, sw=1.8)
    c.circle(562, 242, 24, fill=AMBER_BG, stroke=AMBER, sw=1.4, opacity=0.9)
    for bx, by in [(552, 236), (568, 232), (558, 248), (572, 248), (560, 239)]:
        c.circle(bx, by, 5.5, fill=AMBER, stroke="#ffffff", sw=1)
    for ang in range(0, 360, 45):
        rx = 562 + 40 * math.cos(math.radians(ang))
        ry = 242 + 40 * math.sin(math.radians(ang))
        c.circle(rx, ry, 5.5, fill=BLUE, stroke="#ffffff", sw=1)
    c.text(448, 238, "Polar shell", size=9.8, weight="700", fill=BLUE_DK, anchor="middle")
    c.text(448, 252, "(faces H₂O)", size=9, fill=SOFT, anchor="middle")
    c.text(674, 238, "Hydrophobic", size=9.8, weight="700", fill=AMBER, anchor="middle")
    c.text(674, 252, "buried core", size=9, fill=SOFT, anchor="middle")
    c.text(562, 314, "Same driving force builds both membranes and folded proteins.", size=9.8, weight="600", fill=TEAL_DK, anchor="middle")
    c.save(out / "fig-01b-water-bilayer-folding.svg")


def fig_01c(out: Path):
    c = Canvas(760, 375, "Protein secondary structure: α-helix, β-sheet, and DNA major-groove fit",
               "Local backbone H-bonds form 12 Å α-helices and pleated β-sheets — the exact width needed to read DNA's major groove")
    # Panel 1: alpha-helix
    c.panel_box(24, 72, 224, 280, "α-Helix (right-handed spiral)")
    # Helical turns
    for k in range(5):
        ty = 118 + k * 28
        c.path(f"M 96 {ty+10} C 96 {ty-6}, 176 {ty-6}, 176 {ty+10}", stroke=TEAL_BG, sw=9)
        c.path(f"M 96 {ty+10} C 96 {ty+24}, 176 {ty+24}, 176 {ty+10}", stroke=TEAL, sw=7)
        if k < 4:
            c.line(114, ty + 16, 114, ty + 36, stroke=AMBER, sw=1.5, dash="3,2")
            c.line(158, ty + 16, 158, ty + 36, stroke=AMBER, sw=1.5, dash="3,2")
    # Width bracket ~12 A
    c.line(94, 272, 178, 272, stroke=INK, sw=1.5)
    c.line(94, 267, 94, 277, stroke=INK, sw=1.5)
    c.line(178, 267, 178, 277, stroke=INK, sw=1.5)
    c.text(136, 288, "~12 Å diameter", size=10.5, weight="700", fill=TEAL_DK, anchor="middle", mono=True)
    c.multiline(136, 310, [
        "Backbone H-bonds (i → i+4)",
        "3.6 residues/turn · R-groups out",
    ], size=9.5, lh=14, fill=SOFT, anchor="middle")

    # Panel 2: beta-sheet
    c.panel_box(264, 72, 224, 280, "β-Sheet (extended strands)")
    strands = [
        (308, True, "N → C"),
        (376, False, "C ← N"),
        (444, True, "N → C"),
    ]
    for sx, down, lbl in strands:
        if down:
            c.rect(sx - 12, 114, 24, 112, fill=AMBER_BG, stroke=AMBER, sw=1.8, rx=3)
            c.polygon([(sx - 20, 226), (sx + 20, 226), (sx, 248)], fill=AMBER, stroke=AMBER, sw=1)
        else:
            c.rect(sx - 12, 136, 24, 112, fill=AMBER_BG, stroke=AMBER, sw=1.8, rx=3)
            c.polygon([(sx - 20, 136), (sx + 20, 136), (sx, 114)], fill=AMBER, stroke=AMBER, sw=1)
        c.text(sx, 268, lbl, size=9, weight="700", fill=AMBER, anchor="middle", mono=True)
    # Inter-strand H-bonds
    for hy in (148, 174, 200, 220):
        c.line(322, hy, 362, hy, stroke=BLUE, sw=1.6, dash="3,2")
        c.line(390, hy, 430, hy, stroke=BLUE, sw=1.6, dash="3,2")
    c.multiline(376, 298, [
        "Inter-strand backbone H-bonds",
        "Antiparallel (shown) or parallel",
        "Rigid core of many domains",
    ], size=9.5, lh=14, fill=SOFT, anchor="middle")

    # Panel 3: Why 12 A matters — DNA major groove docking
    c.panel_box(504, 72, 232, 280, "Why 12 Å matters: DNA reading")
    # Schematic DNA grooves (left vertical axis)
    # Major groove cavity (wide ~22 A)
    c.path("M 538 106 C 538 106, 616 122, 616 154 C 616 186, 538 202, 538 202", stroke=BLUE, sw=4)
    c.path("M 538 202 C 538 202, 574 214, 574 234 C 574 254, 538 266, 538 266", stroke=ROSE, sw=4)
    # Docked alpha-helix circle cross-section inside major groove
    c.circle(576, 154, 22, fill=TEAL_BG, stroke=TEAL, sw=2.4)
    c.text(576, 151, "α-helix", size=9.5, weight="700", fill=TEAL_DK, anchor="middle")
    c.text(576, 164, "12 Å", size=9, weight="700", fill=TEAL_DK, anchor="middle", mono=True)
    c.text(630, 146, "Major groove", size=10, weight="700", fill=BLUE_DK)
    c.text(630, 160, "~22 Å wide", size=9.5, fill=BLUE_DK, mono=True)
    c.text(630, 174, "Fits helix cleanly!", size=9.5, weight="600", fill=TEAL_DK)

    c.text(596, 230, "Minor groove", size=10, weight="700", fill=ROSE_DK)
    c.text(596, 244, "~12 Å (too narrow)", size=9.5, fill=ROSE_DK, mono=True)

    c.multiline(620, 294, [
        "Side chains on the recognition",
        "helix read base-pair edges in",
        "the major groove (Ch 02 §5).",
    ], size=9.5, lh=14, fill=SOFT, anchor="middle")
    c.save(out / "fig-01c-secondary-structure.svg")


def fig_01d(out: Path):
    c = Canvas(760, 360, "Two cellular architectures: Prokaryotes vs. Eukaryotes",
               "Whether DNA sits open in the cytoplasm or behind a nuclear envelope shapes how transcription, splicing, and translation work")
    # Left: Prokaryote (Bacteria & Archaea)
    c.panel_box(24, 72, 344, 268, "Prokaryote (~1–5 µm · no nucleus)")
    # Capsule cell outline
    c.rect(54, 108, 284, 114, fill="#ffffff", stroke=TEAL, sw=2.6, rx=52)
    c.rect(62, 116, 268, 98, fill=TEAL_BG, stroke=AMBER, sw=1.4, rx=44)
    # Single circular nucleoid tangle in center-left
    c.path("M 102 162 C 110 132, 160 132, 174 156 C 188 180, 146 198, 122 184 C 98 170, 134 136, 166 146 C 194 156, 176 196, 144 192", stroke=BLUE, sw=2.4)
    c.text(138, 132, "Nucleoid (1 circular chr)", size=8.8, weight="700", fill=BLUE_DK, anchor="middle")
    # Coupled mRNA + ribosomes right off DNA!
    c.line(174, 162, 266, 162, stroke=ROSE, sw=2.2)
    for rx in (198, 224, 250):
        c.circle(rx, 162, 7.5, fill=AMBER_BG, stroke=AMBER, sw=1.6)
    c.text(230, 146, "Ribosomes on nascent", size=8.4, weight="700", fill=AMBER, anchor="middle")
    c.text(230, 184, "mRNA (coupled!)", size=8.4, weight="700", fill=ROSE_DK, anchor="middle")
    # Small plasmid
    c.circle(294, 166, 12, fill="none", stroke=PURPLE, sw=2)
    c.text(294, 192, "Plasmid", size=8.2, weight="700", fill=PURPLE, anchor="middle")

    c.multiline(196, 248, [
        "• No nuclear membrane, no organelles, no splicing.",
        "• Transcription & translation happen SIMULTANEOUSLY",
        "  in the same cytoplasm (enables trp attenuation!).",
        "• Compact circular genome (~0.5–10 Mb, dense genes).",
    ], size=9.2, lh=16, fill=SOFT, anchor="middle")

    # Right: Eukaryote (Animals, plants, fungi, protists)
    c.panel_box(392, 72, 344, 268, "Eukaryote (~10–100 µm · membrane-bound nucleus)")
    # Cell boundary
    c.ellipse(564, 166, 144, 58, fill="#ffffff", stroke=TEAL, sw=2.4)
    # Nuclear envelope inside
    c.ellipse(504, 166, 62, 38, fill=BLUE_BG, stroke=BLUE, sw=2.0, dash="6,3")
    c.text(504, 152, "Nucleus", size=9.5, weight="700", fill=BLUE_DK, anchor="middle")
    c.text(504, 166, "DNA → pre-mRNA", size=8.2, fill=SOFT, anchor="middle")
    c.text(504, 179, "→ Cap/Splice/PolyA", size=8.2, weight="700", fill=BLUE_DK, anchor="middle")
    # Export arrow across nuclear pore to cytoplasmic ribosome
    c.arrow(566, 166, 608, 166, color="rose", sw=2.0)
    c.text(587, 156, "Export", size=8.2, weight="700", fill=ROSE_DK, anchor="middle")
    c.rect(612, 146, 76, 40, fill=AMBER_BG, stroke=AMBER, sw=1.5, rx=6)
    c.text(650, 162, "Cytoplasm", size=8.8, weight="700", fill=AMBER, anchor="middle")
    c.text(650, 176, "Translation", size=8.5, fill=SOFT, anchor="middle")
    # Small mitochondrion with own circular DNA
    c.ellipse(638, 204, 24, 10, fill=TEAL_BG, stroke=TEAL, sw=1.4)
    c.text(566, 208, "Mitochondria (mtDNA)", size=8.2, weight="600", fill=TEAL_DK, anchor="middle")

    c.multiline(564, 248, [
        "• Nuclear envelope separates transcription (inside)",
        "  from translation (outside) → inserts RNA processing!",
        "• Linear chromosomes wrapped in chromatin + organelles.",
        "• Large genomes (~10 Mb–100 Gb) with introns & enhancers.",
    ], size=9.2, lh=16, fill=SOFT, anchor="middle")
    c.save(out / "fig-01d-prokaryote-vs-eukaryote.svg")


def fig_02b(out: Path):
    c = Canvas(760, 360, "Anatomy of a nucleotide monomer: sugar numbering, DNA vs. RNA, and bases",
               "Carbon numbering (1′–5′) sets strand polarity; the 2′ position alone distinguishes stable DNA from reactive RNA")
    # Left: Numbered pentose sugar + 5' phosphate + 1' base
    c.panel_box(24, 72, 376, 268, "Deoxyribonucleotide (dNTP / chain monomer)")
    # Pentagon vertices: O top(218,144), C1'(260,174), C2'(244,224), C3'(192,224), C4'(176,174)
    pts = [(218, 144), (260, 174), (244, 224), (192, 224), (176, 174)]
    c.polygon(pts, fill=TEAL_BG, stroke=TEAL, sw=2.2)
    c.circle(218, 144, 11, fill="#ffffff", stroke=TEAL, sw=1.5)
    c.text(218, 148, "O", size=10, weight="700", fill=TEAL_DK, anchor="middle", mono=True)
    c.text(248, 182, "1′", size=9.5, weight="700", fill=INK, mono=True)
    c.text(235, 218, "2′", size=9.5, weight="700", fill=ROSE_DK, mono=True)
    c.text(194, 218, "3′", size=9.5, weight="700", fill=TEAL_DK, mono=True)
    c.text(182, 182, "4′", size=9.5, weight="700", fill=INK, mono=True)

    # 5' CH2 + Phosphate
    c.line(176, 174, 150, 134, stroke=INK, sw=2)
    c.text(154, 128, "5′ CH₂", size=10, weight="700", fill=BLUE_DK, anchor="middle", mono=True)
    c.line(136, 134, 102, 134, stroke=INK, sw=2)
    c.circle(82, 134, 20, fill=BLUE_BG, stroke=BLUE, sw=2)
    c.text(82, 138, "PO₄⁻", size=10.5, weight="700", fill=BLUE_DK, anchor="middle", mono=True)
    c.text(82, 168, "5′ end", size=9.5, weight="700", fill=BLUE_DK, anchor="middle")

    # 1' Base attachment
    c.line(260, 174, 294, 148, stroke=INK, sw=2)
    c.rect(294, 124, 86, 42, fill=AMBER_BG, stroke=AMBER, sw=2, rx=7)
    c.text(337, 142, "Nitrogenous", size=9.5, weight="700", fill=AMBER, anchor="middle")
    c.text(337, 156, "base (A/T/G/C)", size=9.5, weight="700", fill=AMBER, anchor="middle")

    # 3'-OH reactive group
    c.line(192, 224, 174, 260, stroke=TEAL, sw=2.2)
    c.pill(122, 262, 102, 22, "3′-OH (chain grows)", fill=TEAL_BG, stroke=TEAL, text_fill=TEAL_DK, size=9)

    # 2'-H vs 2'-OH highlight
    c.line(244, 224, 266, 260, stroke=ROSE, sw=2.2)
    c.rect(250, 262, 136, 56, fill=ROSE_BG, stroke=ROSE, sw=1.4, rx=6)
    c.multiline(318, 279, [
        "2′-H  → DNA (stable)",
        "2′-OH → RNA (prone to",
        "   base-catalysed hydrolysis)",
    ], size=9, lh=13, fill=ROSE_DK, anchor="middle")

    # Right: Purines (2 rings) vs Pyrimidines (1 ring)
    c.panel_box(416, 72, 320, 268, "Two base architectures: Purines vs. Pyrimidines")
    # Purine box
    c.rect(432, 106, 288, 96, fill=TEAL_BG, stroke=TEAL, sw=1.4, rx=8)
    c.text(446, 126, "Purines — 2 fused rings (A, G)", size=11, weight="700", fill=TEAL_DK)
    # 6-ring + 5-ring fused schematic
    c.polygon([(468, 146), (486, 136), (504, 146), (504, 168), (486, 178), (468, 168)], fill="#ffffff", stroke=TEAL, sw=1.8)
    c.polygon([(504, 146), (524, 140), (536, 157), (524, 174), (504, 168)], fill="#ffffff", stroke=TEAL, sw=1.8)
    c.multiline(552, 150, [
        "Adenine (A) · Guanine (G)",
        "Larger two-ring footprint",
        "Always pairs with a pyrimidine",
    ], size=9.8, lh=15, fill=SOFT)

    # Pyrimidine box
    c.rect(432, 218, 288, 102, fill=AMBER_BG, stroke=AMBER, sw=1.4, rx=8)
    c.text(446, 238, "Pyrimidines — 1 six-membered ring (C, T, U)", size=10.5, weight="700", fill=AMBER)
    c.polygon([(482, 260), (500, 250), (518, 260), (518, 282), (500, 292), (482, 282)], fill="#ffffff", stroke=AMBER, sw=1.8)
    c.multiline(540, 262, [
        "Cytosine (C) · Thymine (T in DNA)",
        "Uracil (U in RNA, lacks 5-methyl)",
        "Methyl tag lets repair flag U in DNA!",
    ], size=9.5, lh=15, fill=SOFT)
    c.save(out / "fig-02b-nucleotide-monomer.svg")


def fig_02c(out: Path):
    c = Canvas(760, 365, "B-DNA, A-DNA, Z-DNA and the major-groove sequence code",
               "Helix geometry depends on hydration and sequence; proteins read DNA sequence without opening the duplex via groove H-bonds")
    # Left: 3 helix forms table/cards
    forms = [
        (24, "B-DNA (physiological)", TEAL, TEAL_BG, [
            "Right-handed · 10.5 bp/turn",
            "Diameter: ~20 Å",
            "Wide major groove (22 Å)",
            "Narrow minor groove (12 Å)",
            "Standard in aqueous cells",
        ]),
        (268, "A-DNA (RNA–RNA / dry)", BLUE, BLUE_BG, [
            "Right-handed · 11 bp/turn",
            "Wider (~23 Å), tilted bases",
            "Deep narrow major groove",
            "Wide shallow minor groove",
            "Forced by 2′-OH in dsRNA",
        ]),
        (512, "Z-DNA (left-handed)", PURPLE, PURPLE_BG, [
            "Left-handed · 12 bp/turn",
            "Slimmer (~18 Å) zigzag",
            "Flat major groove surface",
            "Forms at (CG)n repeats",
            "Relieves negative supercoil",
        ]),
    ]
    for x, title, col, bg, lines in forms:
        c.box(x, 72, 224, 120, title, lines, fill=bg, stroke=col, title_fill=col, body_size=9.5)

    # Bottom: Major groove vs Minor groove H-bond barcode
    c.panel_box(24, 208, 712, 140, "Reading base pairs without unzipping: Major groove is unique (4-bit code); Minor groove is ambiguous")
    rows = [
        ("A–T", [("A", BLUE), ("D", TEAL), ("A", BLUE), ("M", AMBER)], [("A", BLUE), ("H", FAINT), ("A", BLUE)]),
        ("T–A", [("M", AMBER), ("A", BLUE), ("D", TEAL), ("A", BLUE)], [("A", BLUE), ("H", FAINT), ("A", BLUE)]),
        ("G–C", [("A", BLUE), ("A", BLUE), ("D", TEAL), ("H", FAINT)], [("A", BLUE), ("D", TEAL), ("A", BLUE)]),
        ("C–G", [("H", FAINT), ("D", TEAL), ("A", BLUE), ("A", BLUE)], [("A", BLUE), ("D", TEAL), ("A", BLUE)]),
    ]
    c.text(58, 246, "Pair", size=10, weight="700", fill=INK)
    c.text(242, 246, "Major groove edge (all 4 distinguishable!)", size=10, weight="700", fill=TEAL_DK, anchor="middle")
    c.text(558, 246, "Minor groove (A–T = T–A, G–C = C–G)", size=10, weight="700", fill=ROSE_DK, anchor="middle")
    for idx, (pair, maj, mn) in enumerate(rows):
        y = 258 + idx * 21
        c.text(58, y + 12, pair, size=10.5, weight="700", fill=INK, mono=True)
        for k, (ch, col) in enumerate(maj):
            bx = 132 + k * 56
            c.rect(bx, y, 42, 16, fill="#ffffff", stroke=col, sw=1.3, rx=4)
            c.text(bx + 21, y + 12, ch, size=9.5, weight="700", fill=col, anchor="middle", mono=True)
        for k, (ch, col) in enumerate(mn):
            bx = 476 + k * 56
            c.rect(bx, y, 42, 16, fill="#ffffff", stroke=col, sw=1.3, rx=4)
            c.text(bx + 21, y + 12, ch, size=9.5, weight="700", fill=col, anchor="middle", mono=True)
    c.text(722, 342, "D = H-bond donor · A = acceptor · M = thymine methyl · H = nonpolar H", size=9, fill=FAINT, anchor="end")
    c.save(out / "fig-02c-dna-forms-grooves.svg")


def fig_02d(out: Path):
    c = Canvas(760, 355, "DNA topology (Lk = Tw + Wr) and non-B secondary structures",
               "Supercoiling stores elastic energy regulated by topoisomerases; repetitive motifs fold into alternative non-B structures")
    # Left: Supercoiling topology
    c.panel_box(24, 72, 346, 264, "Topology: Lk = Tw + Wr (closed DNA loops)")
    # Relaxed circle
    c.circle(110, 154, 42, fill="none", stroke=TEAL, sw=3.2)
    c.circle(110, 154, 37, fill="none", stroke=TEAL, sw=1.4, dash="4,3")
    c.text(110, 212, "Relaxed circle", size=10, weight="700", fill=TEAL_DK, anchor="middle")
    c.text(110, 226, "Wr = 0", size=9.5, fill=SOFT, anchor="middle", mono=True)

    c.arrow(160, 154, 206, 154, color="amber", sw=2.0)
    c.text(183, 144, "Gyrase /", size=8.8, weight="700", fill=AMBER, anchor="middle")
    c.text(183, 172, "Pol ahead", size=8.8, fill=SOFT, anchor="middle")

    # Plectonemic supercoil (figure-8 x 2)
    c.path("M 232 132 C 254 102, 276 184, 298 154 C 320 124, 342 184, 342 154 C 342 124, 320 184, 298 154 C 276 124, 254 204, 232 174 C 218 154, 218 154, 232 132", stroke=AMBER, sw=3.0)
    c.text(286, 212, "Negatively supercoiled", size=10, weight="700", fill=AMBER, anchor="middle")
    c.text(286, 226, "Wr < 0 (easier to melt!)", size=9.5, fill=SOFT, anchor="middle")

    c.rect(40, 248, 314, 74, fill="#ffffff", stroke=RULE, rx=7)
    c.multiline(52, 266, [
        "Topoisomerase I: cuts 1 strand → changes Lk by ±1",
        "Topoisomerase II: cuts 2 strands (ATP) → Lk by ±2",
        "Pol II generates (+) supercoil ahead, (−) behind.",
    ], size=9.5, lh=16, fill=SOFT)

    # Right: 4 Non-B structures
    c.panel_box(388, 72, 348, 264, "Non-B DNA structures formed at sequence repeats")
    cards = [
        (404, 108, "Hairpin / Cruciform", TEAL, TEAL_BG, "Inverted repeats fold back;\nstalls Pol & nucleases"),
        (574, 108, "G-Quadruplex (G4)", BLUE, BLUE_BG, "4 G-tracts + K⁺ ion;\ntelomeres & promoters"),
        (404, 218, "Slipped CAG Hairpin", ROSE, ROSE_BG, "Trinucleotide repeats;\ndrives SCA12 / HD expansion"),
        (574, 218, "R-Loop (RNA–DNA)", PURPLE, PURPLE_BG, "Nascent RNA invades duplex;\ndisplaces ssDNA (damage)"),
    ]
    for x, y, title, col, bg, desc in cards:
        c.box(x, y, 150, 96, title, desc.split("\n"), fill=bg, stroke=col, title_fill=col, title_size=10.5, body_size=9.2)
    c.save(out / "fig-02d-dna-topology-nonb.svg")


def fig_03b(out: Path):
    c = Canvas(760, 365, "Metaphase chromosome anatomy, centromere shapes, and cytogenetic banding",
               "Cytogenetic addresses like 5q32 (the PPP2R2B locus in SCA12) locate any gene by chromosome, arm, region, and band")
    # Left: Annotated metaphase chromosome
    c.panel_box(24, 72, 300, 272, "Replicated metaphase chromosome")
    # Two sister chromatids
    for dx in (-20, 20):
        # p arm (shorter top)
        c.rect(144 + dx - 12, 114, 24, 72, fill=TEAL_BG, stroke=TEAL, sw=1.8, rx=12)
        # q arm (longer bottom)
        c.rect(144 + dx - 12, 198, 24, 114, fill=TEAL_BG, stroke=TEAL, sw=1.8, rx=12)
        # G-bands
        c.rect(144 + dx - 11, 134, 22, 14, fill=TEAL, opacity=0.35)
        c.rect(144 + dx - 11, 222, 22, 16, fill=TEAL, opacity=0.35)
        c.rect(144 + dx - 11, 258, 22, 18, fill=ROSE, opacity=0.45)
        # Telomere tips
        c.rect(144 + dx - 10, 114, 20, 9, fill=AMBER, rx=4)
        c.rect(144 + dx - 10, 303, 20, 9, fill=AMBER, rx=4)
    # Centromere constriction
    c.ellipse(144, 192, 34, 10, fill=BLUE_BG, stroke=BLUE, sw=2)

    # Callout labels on right of chromosome
    c.text(204, 122, "Telomere (TTAGGG)n", size=9.5, weight="700", fill=AMBER)
    c.text(204, 154, "p arm (short)", size=10, weight="700", fill=TEAL_DK)
    c.text(204, 195, "Centromere / kinetochore", size=9.5, weight="700", fill=BLUE_DK)
    c.text(204, 246, "q arm (long)", size=10, weight="700", fill=TEAL_DK)
    c.text(204, 270, "Band 5q32 (PPP2R2B)", size=9.5, weight="700", fill=ROSE_DK)
    c.text(144, 332, "2 identical sister chromatids", size=9.5, weight="600", fill=SOFT, anchor="middle")

    # Right top: 3 human centromere positions
    c.panel_box(342, 72, 394, 152, "Centromere position classifies human chromosomes")
    shapes = [
        (408, 42, 42, "Metacentric", "e.g. chr 1, 3"),
        (538, 24, 60, "Submetacentric", "e.g. chr 5, X"),
        (668, 10, 74, "Acrocentric", "chr 13, 14, 15, 21, 22"),
    ]
    for cx, ph, qh, name, ex in shapes:
        cy_top = 108
        c.rect(cx - 8, cy_top, 16, ph, fill=BLUE_BG, stroke=BLUE, sw=1.5, rx=6)
        c.circle(cx, cy_top + ph + 4, 5, fill=ROSE)
        c.rect(cx - 8, cy_top + ph + 8, 16, qh, fill=BLUE_BG, stroke=BLUE, sw=1.5, rx=6)
        c.text(cx, 204, name, size=10, weight="700", fill=INK, anchor="middle")
        c.text(cx, 217, ex, size=9, fill=FAINT, anchor="middle")

    # Right bottom: Karyotype & cytogenetic address decoder
    c.panel_box(342, 238, 394, 106, "Decoding a cytogenetic coordinate: 5q32")
    parts = [(360, 56, "5", "Chr 5", TEAL, TEAL_BG),
             (430, 56, "q", "Long arm", BLUE, BLUE_BG),
             (500, 72, "3", "Region 3", AMBER, AMBER_BG),
             (586, 134, "2", "G-band 2 (~5 Mb)", ROSE, ROSE_BG)]
    for x, w, tok, sub, col, bg in parts:
        c.rect(x, 270, w, 34, fill=bg, stroke=col, sw=1.5, rx=6)
        c.text(x + w / 2, 291, tok, size=13, weight="700", fill=col, anchor="middle", mono=True)
        c.text(x + w / 2, 322, sub, size=9.2, weight="600", fill=SOFT, anchor="middle")
    c.save(out / "fig-03b-chromosome-anatomy.svg")


def fig_04b(out: Path):
    c = Canvas(760, 360, "Meselson–Stahl density proof and multiplicative replication fidelity",
               "CsCl density gradients proved semiconservative copying; three sequential filters multiply to ~1 error per 10¹⁰ bases")
    # Left: Meselson-Stahl 3 tubes
    c.panel_box(24, 72, 356, 268, "Meselson–Stahl experiment (¹⁵N heavy → ¹⁴N light)")
    tubes = [
        (88, "Gen 0 (¹⁵N)", [(238, BLUE, "Heavy ¹⁵N/¹⁵N")]),
        (202, "Gen 1 (¹⁴N)", [(202, PURPLE, "100% Hybrid")]),
        (316, "Gen 2 (¹⁴N)", [(166, TEAL, "50% Light"), (202, PURPLE, "50% Hybrid")]),
    ]
    for tx, title, bands in tubes:
        c.text(tx, 108, title, size=10, weight="700", fill=INK, anchor="middle")
        c.rect(tx - 32, 120, 64, 146, fill="#ffffff", stroke=SOFT, sw=1.6, rx=16)
        for by, col, blbl in bands:
            c.rect(tx - 26, by, 52, 11, fill=col, rx=3)
            c.text(tx, by - 5, blbl, size=8.5, weight="700", fill=col, anchor="middle")
    c.multiline(202, 292, [
        "Gen 1 rules out conservative (no heavy band left).",
        "Gen 2 rules out dispersive (light band separates cleanly).",
    ], size=9.5, lh=15, fill=SOFT, anchor="middle")

    # Right: 3-stage fidelity funnel
    c.panel_box(398, 72, 338, 268, "Fidelity = product of three independent filters")
    stages = [
        (108, 306, "1. Base selection (Pol active-site geometry)", "Error rate ~ 10⁻⁵", BLUE, BLUE_BG),
        (178, 250, "2. 3′→5′ Exonuclease proofreading", "× 10⁻²  →  10⁻⁷", AMBER, AMBER_BG),
        (248, 210, "3. Mismatch Repair (MMR)", "× 10⁻³  →  10⁻¹⁰", TEAL, TEAL_BG),
    ]
    for y, w, title, rate, col, bg in stages:
        x = 567 - w / 2
        c.rect(x, y, w, 46, fill=bg, stroke=col, sw=1.6, rx=8)
        c.text(567, y + 19, title, size=9.6, weight="700", fill=col, anchor="middle")
        c.text(567, y + 36, rate, size=10, weight="700", fill=INK, anchor="middle", mono=True)
    c.arrow(567, 156, 567, 175, color="ink", sw=1.6)
    c.arrow(567, 226, 567, 245, color="ink", sw=1.6)
    c.text(567, 322, "Only ~0.3–1 error per human genome replication!", size=10, weight="700", fill=TEAL_DK, anchor="middle")
    c.save(out / "fig-04b-meselson-stahl-fidelity.svg")


def fig_05b(out: Path):
    c = Canvas(760, 360, "Bacterial Rho-independent termination and eukaryotic Pol II initiation",
               "A GC-rich hairpin + weak U–A hybrid terminates bacterial RNA; eukaryotic Pol II requires GTF assembly and CTD phosphorylation")
    # Left: Rho-independent hairpin terminator
    c.panel_box(24, 72, 336, 268, "Bacterial intrinsic (Rho-independent) terminator")
    # Hairpin stem-loop
    c.path("M 74 226 L 146 226 L 146 146 C 146 116, 194 116, 194 146 L 194 226 L 288 226", stroke=TEAL, sw=3.2)
    for hy in range(154, 218, 14):
        c.line(150, hy, 190, hy, stroke=BLUE, sw=2.0)
    c.text(170, 110, "GC-rich hairpin", size=10, weight="700", fill=BLUE_DK, anchor="middle")
    c.text(170, 124, "(pauses RNA Pol)", size=9, fill=SOFT, anchor="middle")
    # Weak rU-dA tail
    c.rect(204, 214, 96, 24, fill=ROSE_BG, stroke=ROSE, sw=1.5, rx=4)
    c.text(252, 230, "U-U-U-U-U-U-3′", size=9.5, weight="700", fill=ROSE_DK, anchor="middle", mono=True)
    c.line(204, 248, 300, 248, stroke=INK, sw=2.4)
    c.text(252, 264, "A-A-A-A-A-A (DNA)", size=9, fill=SOFT, anchor="middle", mono=True)
    c.multiline(192, 294, [
        "Hairpin snaps shut inside exit channel → stalls Pol;",
        "weak rU:dA base pairs melt spontaneously → RNA releases.",
    ], size=9.3, lh=14, fill=SOFT, anchor="middle")

    # Right: Eukaryotic Pol II Pre-Initiation Complex (PIC)
    c.panel_box(378, 72, 358, 268, "Eukaryotic Pol II Pre-Initiation Complex (PIC)")
    # DNA with TATA & Inr
    c.line(396, 236, 718, 236, stroke=INK, sw=3)
    c.rect(424, 224, 62, 24, fill=PURPLE_BG, stroke=PURPLE, sw=1.5, rx=4)
    c.text(455, 240, "TATA", size=9.5, weight="700", fill=PURPLE, anchor="middle", mono=True)
    c.rect(546, 224, 58, 24, fill=TEAL_BG, stroke=TEAL, sw=1.5, rx=4)
    c.text(575, 240, "+1 Inr", size=9.5, weight="700", fill=TEAL_DK, anchor="middle", mono=True)

    # TFIID/TBP, TFIIB, Pol II, TFIIH
    c.pill(416, 184, 78, 28, "TFIID / TBP", fill=PURPLE_BG, stroke=PURPLE, text_fill=PURPLE, size=9.2)
    c.pill(498, 190, 52, 24, "TFIIB", fill=BLUE_BG, stroke=BLUE, text_fill=BLUE_DK, size=9)
    c.ellipse(592, 166, 62, 38, fill=TEAL_BG, stroke=TEAL, sw=2.2)
    c.text(592, 164, "RNA Pol II", size=11, weight="700", fill=TEAL_DK, anchor="middle")
    c.text(592, 179, "+ TFIIF", size=9, fill=SOFT, anchor="middle")
    c.pill(654, 186, 62, 26, "TFIIH", fill=AMBER_BG, stroke=AMBER, text_fill=AMBER, size=9.5)
    # CTD tail with P-tags
    c.path("M 538 148 Q 502 126, 466 136", stroke=TEAL, sw=2.6)
    for px, py in [(506, 132), (486, 130), (466, 136)]:
        c.circle(px, py, 7, fill=ROSE_BG, stroke=ROSE, sw=1.3)
        c.text(px, py + 3, "P", size=8, weight="700", fill=ROSE_DK, anchor="middle")
    c.text(448, 118, "CTD tail (Ser5-P)", size=9.2, weight="700", fill=ROSE_DK)
    c.multiline(557, 278, [
        "1. TFIID (TBP) bends TATA box → recruits TFIIB & Pol II.",
        "2. TFIIH melts DNA (helicase) & phosphorylates CTD tail.",
        "3. Phospho-CTD releases Pol II & recruits capping/splicing!",
    ], size=9.3, lh=15, fill=SOFT, anchor="middle")
    c.save(out / "fig-05b-termination-and-pic.svg")


def fig_06b(out: Path):
    c = Canvas(760, 355, "Spliceosome chemistry: two transesterifications and the intron lariat",
               "Because every broken phosphodiester bond is exchanged 1-for-1 for a new one, the chemistry itself costs zero net ATP")
    # Step 1
    c.panel_box(24, 72, 224, 262, "Step 1: 2′-OH attacks 5′ splice site")
    c.rect(40, 146, 54, 24, fill=TEAL_BG, stroke=TEAL, sw=1.6, rx=4)
    c.text(67, 162, "Exon 1", size=9.5, weight="700", fill=TEAL_DK, anchor="middle")
    c.line(94, 158, 178, 158, stroke=SOFT, sw=2.4)
    c.rect(178, 146, 54, 24, fill=BLUE_BG, stroke=BLUE, sw=1.6, rx=4)
    c.text(205, 162, "Exon 2", size=9.5, weight="700", fill=BLUE_DK, anchor="middle")
    c.text(104, 148, "GU", size=9, weight="700", fill=ROSE, mono=True)
    c.text(162, 148, "AG", size=9, weight="700", fill=ROSE, mono=True)
    c.circle(144, 158, 10, fill=AMBER_BG, stroke=AMBER, sw=1.6)
    c.text(144, 161.5, "A", size=9.5, weight="700", fill=AMBER, anchor="middle", mono=True)
    c.text(144, 184, "2′-OH", size=9, weight="700", fill=AMBER, anchor="middle", mono=True)
    # Curved nucleophilic attack arrow
    c.path("M 138 172 Q 116 206, 98 168", stroke=AMBER, sw=2.0, marker="arr-amber")
    c.multiline(136, 232, [
        "Branch-point adenine's 2′-OH",
        "attacks the 5′ GU phosphate,",
        "cleaving Exon 1 and forming",
        "a 2′–5′ lariat bond.",
    ], size=9.5, lh=15, fill=SOFT, anchor="middle")

    # Step 2
    c.panel_box(268, 72, 224, 262, "Step 2: Exon 1 attacks 3′ splice site")
    c.rect(284, 154, 54, 24, fill=TEAL_BG, stroke=TEAL, sw=1.6, rx=4)
    c.text(311, 170, "Exon 1", size=9.5, weight="700", fill=TEAL_DK, anchor="middle")
    c.text(348, 170, "3′-OH", size=9, weight="700", fill=TEAL_DK, mono=True)
    # Lariat loop above
    c.circle(394, 134, 20, fill="none", stroke=AMBER, sw=2.2)
    c.line(394, 154, 424, 166, stroke=AMBER, sw=2.2)
    c.text(394, 137, "Lariat", size=8.8, weight="700", fill=AMBER, anchor="middle")
    c.rect(424, 154, 54, 24, fill=BLUE_BG, stroke=BLUE, sw=1.6, rx=4)
    c.text(451, 170, "Exon 2", size=9.5, weight="700", fill=BLUE_DK, anchor="middle")
    c.path("M 358 178 Q 390 206, 422 174", stroke=TEAL, sw=2.0, marker="arr-teal")
    c.multiline(380, 232, [
        "Free 3′-OH of Exon 1 attacks",
        "the 3′ AG splice junction,",
        "covalently ligating Exon 1",
        "directly onto Exon 2.",
    ], size=9.5, lh=15, fill=SOFT, anchor="middle")

    # Step 3: Products
    c.panel_box(512, 72, 224, 262, "Products: Mature mRNA + Lariat")
    c.rect(544, 132, 72, 26, fill=TEAL_BG, stroke=TEAL, sw=1.8, rx=4)
    c.text(580, 149, "Exon 1", size=10, weight="700", fill=TEAL_DK, anchor="middle")
    c.rect(616, 132, 72, 26, fill=BLUE_BG, stroke=BLUE, sw=1.8, rx=4)
    c.text(652, 149, "Exon 2", size=10, weight="700", fill=BLUE_DK, anchor="middle")
    c.text(624, 174, "Seamless coding junction", size=9.2, weight="700", fill=TEAL_DK, anchor="middle")
    # Excised lariat below
    c.circle(608, 210, 18, fill=AMBER_BG, stroke=AMBER, sw=2)
    c.line(626, 210, 666, 210, stroke=AMBER, sw=2.2)
    c.text(624, 244, "Excised intron lariat (degraded)", size=9.2, fill=AMBER, anchor="middle")
    c.multiline(624, 276, [
        "ATP is spent ONLY by RNA",
        "helicases for proofreading and",
        "spliceosome remodelling.",
    ], size=9.5, lh=15, fill=SOFT, anchor="middle")
    c.save(out / "fig-06b-splicing-chemistry.svg")


def fig_07b(out: Path):
    c = Canvas(760, 360, "tRNA adapter architecture and third-base wobble pairing",
               "Aminoacyl-tRNA synthetases enforce chemical fidelity; flexible 3rd-position geometry lets ~40 tRNAs decode 61 sense codons")
    # Left: tRNA cloverleaf schematic
    c.panel_box(24, 72, 316, 268, "tRNA cloverleaf (folds into 75 Å 3D L-shape)")
    cx, cy = 182, 206
    # Acceptor stem (top)
    c.line(cx - 10, 114, cx - 10, 166, stroke=TEAL, sw=2.6)
    c.line(cx + 10, 102, cx + 10, 166, stroke=TEAL, sw=2.6)
    c.pill(cx - 38, 88, 96, 20, "3′-CCA + Amino acid", fill=ROSE_BG, stroke=ROSE, text_fill=ROSE_DK, size=8.8)
    # D loop (left)
    c.circle(cx - 60, cy - 10, 22, fill=BLUE_BG, stroke=BLUE, sw=1.8)
    c.line(cx - 38, cy - 10, cx - 10, cy - 10, stroke=BLUE, sw=2.2)
    c.text(cx - 60, cy - 7, "D loop", size=9, weight="700", fill=BLUE_DK, anchor="middle")
    # TpsiC loop (right)
    c.circle(cx + 60, cy - 10, 22, fill=PURPLE_BG, stroke=PURPLE, sw=1.8)
    c.line(cx + 10, cy - 10, cx + 38, cy - 10, stroke=PURPLE, sw=2.2)
    c.text(cx + 60, cy - 7, "TΨC", size=9, weight="700", fill=PURPLE, anchor="middle")
    # Anticodon stem & loop (bottom)
    c.line(cx - 10, cy + 8, cx - 10, 262, stroke=TEAL, sw=2.6)
    c.line(cx + 10, cy + 8, cx + 10, 262, stroke=TEAL, sw=2.6)
    c.circle(cx, 282, 22, fill=AMBER_BG, stroke=AMBER, sw=2.0)
    c.text(cx, 286, "3′-I A G-5′", size=9, weight="700", fill=AMBER, anchor="middle", mono=True)
    c.text(cx, 324, "Anticodon pairs antiparallel with 5′-CUC-3′", size=9.2, weight="600", fill=SOFT, anchor="middle")

    # Right: Wobble table & synthetase fidelity
    c.panel_box(358, 72, 378, 152, "Wobble base pairing at codon position 3")
    c.text(376, 114, "5′ Anticodon base", size=9.8, weight="700", fill=INK)
    c.text(538, 114, "3′ Codon bases read", size=9.8, weight="700", fill=INK)
    wob = [
        ("G", "C or U (standard + wobble)", TEAL),
        ("U", "A or G", BLUE),
        ("Inosine (I)", "U, C, or A (3-way wobble!)", AMBER),
        ("C or A", "G or U only (strict)", SOFT),
    ]
    for i, (ab, cb, col) in enumerate(wob):
        y = 136 + i * 21
        c.text(376, y, ab, size=10, weight="700", fill=col, mono=True)
        c.text(538, y, cb, size=9.8, fill=SOFT)

    c.box(358, 238, 378, 102, "Where translation fidelity actually lives", [
        "1. Aminoacyl-tRNA synthetases (20 enzymes) match each",
        "   amino acid to its tRNA — the ribosome NEVER rechecks it!",
        "2. Ribosome checks Watson–Crick geometry at positions 1 & 2,",
        "   while tolerating wobble at position 3 (synonymous codons).",
    ], fill=TEAL_BG, stroke=TEAL, title_fill=TEAL_DK, body_size=9.5)
    c.save(out / "fig-07b-trna-wobble.svg")


def fig_08b(out: Path):
    c = Canvas(760, 365, "The twenty amino acids grouped by side-chain chemistry",
               "Replacing an amino acid within its chemical class is often tolerated; crossing classes (e.g. buried nonpolar → charged) disrupts folding")
    groups = [
        (24, 74, 224, 134, "Nonpolar aliphatic (buried core)", AMBER, AMBER_BG, [
            "Ala (A)  Val (V)  Leu (L)",
            "Ile (I)  Met (M)",
            "Drive hydrophobic collapse",
            "into protein interior",
        ]),
        (268, 74, 224, 134, "Aromatic (bulky rings)", PURPLE, PURPLE_BG, [
            "Phe (F)  Tyr (Y)  Trp (W)",
            "Hydrophobic stacking;",
            "Tyr (Y) is a major",
            "phosphorylation target!",
        ]),
        (512, 74, 224, 134, "Polar uncharged (H-bonders)", TEAL, TEAL_BG, [
            "Ser (S)  Thr (T)  Asn (N)",
            "Gln (Q)",
            "Surface & active sites;",
            "Ser/Thr phosphorylated (PP2A!)",
        ]),
        (24, 224, 224, 122, "Positively charged (+ basic)", BLUE, BLUE_BG, [
            "Lys (K)  Arg (R)  His (H)",
            "Bind negatively charged DNA",
            "backbone & histones;",
            "Lys methylated/acetylated",
        ]),
        (268, 224, 224, 122, "Negatively charged (− acidic)", ROSE, ROSE_BG, [
            "Asp (D)  Glu (E)",
            "Salt bridges & Mg²⁺/Ca²⁺",
            "coordination in polymerases",
            "and catalytic pockets",
        ]),
        (512, 224, 224, 122, "Structural specialists", INK, PANEL, [
            "Gly (G): tiny, max flexibility",
            "Pro (P): rigid ring, breaks α-helix",
            "Cys (C): forms covalent S–S",
            "disulfide bridges",
        ]),
    ]
    for x, y, w, h, title, col, bg, lines in groups:
        c.box(x, y, w, h, title, lines, fill=bg, stroke=col, title_fill=col, title_size=10.5, body_size=9.6)
    c.save(out / "fig-08b-amino-acid-classes.svg")


def fig_09b(out: Path):
    c = Canvas(760, 355, "Prophase I crossing over: synaptonemal complex, chiasma, and recombinant gametes",
               "Reciprocal exchange between non-sister chromatids shuffles alleles AND physically tethers homologues for Meiosis I alignment")
    # Left: Bivalent with chiasma
    c.panel_box(24, 72, 344, 264, "Pachytene bivalent (4 chromatids + crossover)")
    # Maternal pair (teal) top two lines
    c.line(54, 134, 336, 134, stroke=TEAL, sw=4.5)
    # Non-sister crossover from maternal lower to paternal upper
    c.path("M 54 164 L 172 164 C 194 164, 206 206, 228 206 L 336 206", stroke=TEAL, sw=4.5)
    c.path("M 54 206 L 172 206 C 194 206, 206 164, 228 164 L 336 164", stroke=AMBER, sw=4.5)
    # Paternal lower
    c.line(54, 236, 336, 236, stroke=AMBER, sw=4.5)

    # Centromeres
    c.circle(110, 149, 10, fill=TEAL_BG, stroke=TEAL, sw=2)
    c.circle(110, 221, 10, fill=AMBER_BG, stroke=AMBER, sw=2)
    # Allele markers
    for y, lbl, col in [(126, "A", TEAL_DK), (156, "A", TEAL_DK), (222, "a", AMBER), (252, "a", AMBER)]:
        c.text(74, y, lbl, size=10.5, weight="700", fill=col, mono=True)
    for y, lbl, col in [(126, "B", TEAL_DK), (156, "b", AMBER), (222, "B", TEAL_DK), (252, "b", AMBER)]:
        c.text(314, y, lbl, size=10.5, weight="700", fill=col, mono=True)
    # Chiasma marker
    c.circle(200, 185, 16, fill="none", stroke=ROSE, sw=1.8, dash="3,2")
    c.text(200, 276, "Chiasma (physical crossover)", size=10, weight="700", fill=ROSE_DK, anchor="middle")
    c.text(200, 294, "Requires ≥1 per bivalent or homologues mis-segregate!", size=9.2, fill=SOFT, anchor="middle")

    # Right: 4 gametes after Meiosis II
    c.panel_box(388, 72, 348, 264, "Four haploid products after Meiosis II")
    prods = [
        (124, TEAL, TEAL, "A — B", "Parental (maternal)"),
        (172, TEAL, AMBER, "A — b", "Recombinant!"),
        (220, AMBER, TEAL, "a — B", "Recombinant!"),
        (268, AMBER, AMBER, "a — b", "Parental (paternal)"),
    ]
    for y, c1, c2, hap, tag in prods:
        c.line(416, y, 492, y, stroke=c1, sw=5)
        c.line(492, y, 568, y, stroke=c2, sw=5)
        c.text(586, y + 4, hap, size=10.5, weight="700", fill=INK, mono=True)
        is_rec = c1 != c2
        c.text(642, y + 4, tag, size=9.5, weight="700" if is_rec else "500", fill=ROSE_DK if is_rec else SOFT)
    c.text(562, 314, "Max 50% recombinants even when crossover happens in 100% of meioses!", size=9.2, weight="700", fill=TEAL_DK, anchor="middle")
    c.save(out / "fig-09b-prophase1-crossover.svg")


def fig_11b(out: Path):
    c = Canvas(760, 340, "Molecular basis of ABO blood groups: codominance and recessive loss of function",
               "One glycosyltransferase gene encodes two active enzymes (Iᴬ, Iᴮ) and one frameshift null allele (i)")
    # Left: H-antigen precursor
    c.box(24, 134, 152, 86, "H-antigen precursor", [
        "RBC surface sugar chain",
        "(present in almost all",
        "individuals via FUT1)",
    ], fill=PANEL, stroke=SOFT, title_fill=INK, body_size=9.4)

    # Three arrows to 3 alleles
    c.arrow(178, 156, 232, 114, color="teal", sw=1.8)
    c.arrow(178, 177, 232, 177, color="blue", sw=1.8)
    c.arrow(178, 198, 232, 240, color="ink", sw=1.8)

    rows = [
        (82, "Iᴬ allele (A-transferase)", "Adds GalNAc sugar → A antigen", TEAL, TEAL_BG),
        (146, "Iᴮ allele (B-transferase)", "Adds Galactose → B antigen", BLUE, BLUE_BG),
        (210, "i allele (1-bp deletion frameshift)", "Truncated inactive enzyme → bare H (Type O)", SOFT, PANEL),
    ]
    for y, title, desc, col, bg in rows:
        c.rect(236, y, 256, 54, fill=bg, stroke=col, sw=1.5, rx=8)
        c.text(250, y + 22, title, size=10.5, weight="700", fill=col)
        c.text(250, y + 40, desc, size=9.5, fill=SOFT)

    # Right: Genotype -> Phenotype summary
    c.panel_box(512, 74, 224, 244, "Genotype → Phenotype")
    gts = [
        ("IᴬIᴬ or Iᴬi", "Type A", TEAL_DK),
        ("IᴮIᴮ or Iᴮi", "Type B", BLUE_DK),
        ("IᴬIᴮ", "Type AB (codominant)", PURPLE),
        ("ii", "Type O (recessive)", SOFT),
    ]
    for i, (g, ph, col) in enumerate(gts):
        y = 116 + i * 36
        c.text(528, y, g, size=10.5, weight="700", fill=INK, mono=True)
        c.text(608, y, ph, size=10, weight="700", fill=col)
    c.multiline(624, 266, [
        "Both Iᴬ and Iᴮ act independently",
        "on RBC sugars → AB expresses",
        "both antigens simultaneously.",
    ], size=9.2, lh=14, fill=SOFT, anchor="middle")
    c.save(out / "fig-11b-abo-molecular.svg")


def fig_13b(out: Path):
    c = Canvas(760, 355, "X vs. Y chromosome anatomy and random X-inactivation (Lyonisation)",
               "Only tiny pseudoautosomal tips (PAR1/PAR2) recombine between X and Y; females silence one random X per cell via XIST")
    # Left: X vs Y chromosomes
    c.panel_box(24, 72, 310, 264, "Human X (~155 Mb) vs. Y (~57 Mb)")
    # X chromosome
    c.rect(92, 108, 30, 184, fill=TEAL_BG, stroke=TEAL, sw=2, rx=12)
    c.rect(92, 108, 30, 18, fill=AMBER, rx=6)
    c.rect(92, 278, 30, 14, fill=AMBER, rx=6)
    c.text(107, 312, "X (~850 genes)", size=10, weight="700", fill=TEAL_DK, anchor="middle")
    # Y chromosome
    c.rect(206, 152, 26, 94, fill=BLUE_BG, stroke=BLUE, sw=2, rx=10)
    c.rect(206, 152, 26, 16, fill=AMBER, rx=5)
    c.rect(206, 234, 26, 12, fill=AMBER, rx=5)
    c.rect(206, 172, 26, 10, fill=ROSE)
    c.text(219, 268, "Y (~65 genes)", size=10, weight="700", fill=BLUE_DK, anchor="middle")
    # Labels
    c.text(162, 120, "PAR1", size=9.2, weight="700", fill=AMBER, anchor="middle")
    c.text(242, 181, "SRY switch", size=9.5, weight="700", fill=ROSE_DK)
    c.text(242, 206, "No crossing over", size=9, fill=SOFT)
    c.text(242, 219, "→ Y degrades", size=9, fill=SOFT)
    c.text(162, 288, "PAR2", size=9.2, weight="700", fill=AMBER, anchor="middle")

    # Right: Random X-inactivation mosaicism
    c.panel_box(352, 72, 384, 264, "Mammalian dosage compensation: XIST → Barr body")
    # Embryonic cell (X^O X^B)
    c.circle(420, 152, 26, fill=PANEL, stroke=INK, sw=1.8)
    c.text(420, 149, "Xᴼ Xᴮ", size=10.5, weight="700", fill=INK, anchor="middle", mono=True)
    c.text(420, 163, "Embryo", size=8.5, fill=FAINT, anchor="middle")
    c.arrow(448, 138, 496, 120, color="amber", sw=1.8)
    c.arrow(448, 166, 496, 186, color="teal", sw=1.8)
    # Two clones
    c.rect(502, 102, 216, 42, fill=AMBER_BG, stroke=AMBER, sw=1.5, rx=8)
    c.text(610, 120, "Xᴮ coated by XIST → Barr body", size=9.5, weight="700", fill=AMBER, anchor="middle")
    c.text(610, 136, "Active Xᴼ → Orange patch clone", size=9.2, fill=SOFT, anchor="middle")

    c.rect(502, 162, 216, 42, fill=TEAL_BG, stroke=TEAL, sw=1.5, rx=8)
    c.text(610, 180, "Xᴼ coated by XIST → Barr body", size=9.5, weight="700", fill=TEAL_DK, anchor="middle")
    c.text(610, 196, "Active Xᴮ → Black patch clone", size=9.2, fill=SOFT, anchor="middle")

    # Mosaic grid bottom
    c.text(448, 246, "Clonal mosaic", size=10, weight="700", fill=INK, anchor="middle")
    c.text(448, 261, "(epigenetic memory", size=9, fill=SOFT, anchor="middle")
    c.text(448, 274, "locked through mitosis)", size=9, fill=SOFT, anchor="middle")
    pat = [0, 0, 1, 1, 0, 1, 0, 0, 1, 1, 1, 0, 1, 1, 0, 0, 1, 0]
    for idx, val in enumerate(pat):
        gx = 520 + (idx % 6) * 28
        gy = 224 + (idx // 6) * 24
        c.rect(gx, gy, 24, 20, fill=AMBER_BG if val == 0 else TEAL_BG, stroke=AMBER if val == 0 else TEAL, sw=1.2, rx=4)
    c.text(604, 314, "Calico cats & heterozygous female carriers are mosaics.", size=9.3, weight="600", fill=TEAL_DK, anchor="middle")
    c.save(out / "fig-13b-x-inactivation-par.svg")


def fig_14b(out: Path):
    c = Canvas(760, 350, "Tetrad analysis: reading all four meiotic products directly",
               "In fungi like yeast and Neurospora, all 4 products of one meiosis stay in one ascus — revealing crossovers directly")
    cards = [
        (24, "Parental Ditype (PD)", TEAL, TEAL_BG, ["AB", "AB", "ab", "ab"],
         "0 crossovers between A & B", "(or 2-strand double CO)"),
        (268, "Tetratype (T)", BLUE, BLUE_BG, ["AB", "Ab", "aB", "ab"],
         "1 crossover between A & B", "2 parental + 2 recombinant"),
        (512, "Non-Parental Ditype (NPD)", ROSE, ROSE_BG, ["Ab", "Ab", "aB", "aB"],
         "Requires 4-strand double CO", "If PD >> NPD → genes linked!"),
    ]
    for x, title, col, bg, spores, l1, l2 in cards:
        c.panel_box(x, 72, 224, 194, title, fill=bg, stroke=col, header_fill=col)
        # Ascus sac with 4 spores
        c.rect(x + 28, 108, 168, 42, fill="#ffffff", stroke=col, sw=1.6, rx=21)
        for k, sp in enumerate(spores):
            sx = x + 52 + k * 40
            rec = sp in ("Ab", "aB")
            c.circle(sx, 129, 15, fill=ROSE_BG if rec else TEAL_BG, stroke=ROSE if rec else TEAL, sw=1.4)
            c.text(sx, 133, sp, size=9.5, weight="700", fill=ROSE_DK if rec else TEAL_DK, anchor="middle", mono=True)
        c.multiline(x + 112, 184, [l1, l2], size=9.8, lh=16, fill=SOFT, anchor="middle")

    # Bottom formulas
    c.rect(24, 280, 712, 54, fill=PANEL, stroke=RULE, rx=8)
    c.text(42, 302, "Unlinked test: PD ≈ NPD  (independent assortment)   |   Linked test: PD >> NPD", size=10.5, weight="700", fill=INK)
    c.text(42, 322, "Map distance (cM) = 100 × (½ T + 3 NPD) / Total   ·   Ordered Neurospora tetrads also map gene-to-centromere distance = ½ (% MII).", size=9.6, fill=SOFT)
    c.save(out / "fig-14b-tetrad-analysis.svg")


def fig_16b(out: Path):
    c = Canvas(760, 365, "The four main sources of spontaneous endogenous DNA mutation",
               "Even without external radiation or mutagens, water chemistry and polymerase slippage damage DNA thousands of times per cell per day")
    panels = [
        (24, 72, "1. Cytosine deamination (C → U)", BLUE, BLUE_BG, [
            "Water removes −NH₂ from C → Uracil.",
            "Normally caught fast by UNG glycosylase",
            "(because U does not belong in DNA!).",
            "If missed before replication → C:G to T:A.",
        ]),
        (388, 72, "2. 5-Methylcytosine deamination (CpG hotspot!)", ROSE, ROSE_BG, [
            "Deaminating 5-mC creates Thymine (T:G)!",
            "Because T IS a normal DNA base, repair is",
            "slower & error-prone → ~10× higher mutation",
            "rate at methylated CpG dinucleotides.",
        ]),
        (24, 218, "3. Spontaneous depurination (~5,000/cell/day)", AMBER, AMBER_BG, [
            "Hydrolysis breaks the glycosidic bond of",
            "A or G → leaves an abasic (AP) site.",
            "Repaired by BER; if bypassed by translesion",
            "Pol, 'A-rule' inserts A → transversion.",
        ]),
        (388, 218, "4. Replication slippage on tandem repeats", PURPLE, PURPLE_BG, [
            "Pol momentarily dissociates on (CAG)n or",
            "homopolymers and re-anneals out of register.",
            "Loop on nascent strand → insertion (+1 repeat);",
            "loop on template strand → deletion (−1 repeat).",
        ]),
    ]
    for x, y, title, col, bg, lines in panels:
        c.box(x, y, 348, 128, title, lines, fill=bg, stroke=col, title_fill=col, title_size=11, body_size=9.8)
    c.save(out / "fig-16b-spontaneous-lesions.svg")


def build_all(out: Path):
    for fn in [fig_01b, fig_01c, fig_01d, fig_02b, fig_02c, fig_02d, fig_03b, fig_04b, fig_05b,
               fig_06b, fig_07b, fig_08b, fig_09b, fig_11b, fig_13b, fig_14b, fig_16b]:
        fn(out)
    print("Generated 17 Wave-2 SVGs for Parts 0–3")
