"""Generate 16 precision SVG diagrams for Parts 0, 1, and 2 (Chapters 00–15)."""
from __future__ import annotations

import math
from pathlib import Path
from svg_kit import (
    AMBER, AMBER_BG, BG, BLUE, BLUE_BG, BLUE_DK, DNA, DNA_BG, EMERALD, FAINT,
    GOLD, GREEN, GREEN_BG, INK, PANEL, PURPLE, PURPLE_BG, ROSE, ROSE_BG,
    ROSE_DK, RULE, RULE_LT, SOFT, SUNK, TEAL, TEAL_BG, TEAL_DK, Canvas, chi2_pdf,
)


def fig_00(out: Path):
    c = Canvas(760, 355, "The whole story across four biological scales",
               "From base-pair chemistry to cellular phenotype, populations, and sequencing data")
    stages = [
        (24, "1. Genome (DNA)", TEAL, TEAL_BG, ["3.1 Gb sequence", "20,000 protein genes", "98.5% non-coding", "Mutations & repeats"]),
        (206, "2. Regulation & RNA", BLUE, BLUE_BG, ["Enhancers & chromatin", "Transcription (Pol II)", "Splicing & isoforms", "Translation → Protein"]),
        (388, "3. Cell & Organism", AMBER, AMBER_BG, ["Proteins build traits", "Meiosis & segregation", "Linkage & recombination", "Development & disease"]),
        (570, "4. Population & Data", PURPLE, PURPLE_BG, ["Drift, selection, LD", "Sequencing reads", "GWAS, scRNA, 3D Hi-C", "Clinical inference"]),
    ]
    for i, (x, title, col, bg, items) in enumerate(stages):
        c.rect(x, 78, 166, 178, fill=bg, stroke=col, sw=1.6, rx=10)
        c.rect(x, 78, 166, 30, fill=col, stroke="none", rx=8)
        c.text(x + 83, 98, title, size=11.5, weight="700", fill="#ffffff", anchor="middle")
        for j, it in enumerate(items):
            c.circle(x + 16, 130 + j * 30, 3.5, fill=col)
            c.text(x + 27, 134 + j * 30, it, size=11, fill=INK)
        if i < 3:
            c.arrow(x + 168, 166, x + 202, 166, color="ink", sw=2.0)

    # Bottom feedback bar showing where each part of the course zooms in
    c.rect(24, 274, 712, 62, fill=PANEL, stroke=RULE, sw=1.2, rx=10)
    c.text(380, 294, "How the curriculum zooms into this pipeline", size=11.5, weight="700", fill=INK, anchor="middle")
    pills = [
        (38, "Parts 1–3: Molecular & Inheritance", TEAL_BG, TEAL, TEAL_DK),
        (276, "Parts 4–7: Regulation, Pop & Evol", BLUE_BG, BLUE, BLUE_DK),
        (514, "Parts 8–12 + D: Genomics & SCA12", AMBER_BG, AMBER, AMBER),
    ]
    for px, lbl, bg, st, tf in pills:
        c.pill(px, 304, 218, 22, lbl, fill=bg, stroke=st, text_fill=tf, size=10)
    c.save(out / "fig-00-whole-story.svg")


def fig_01(out: Path):
    c = Canvas(760, 390, "Chemical bond energies and the four biological macromolecules",
               "Covalent bonds lock backbones permanently; weak non-covalent bonds drive reversible folding and binding")
    # Top: bond energy scale
    c.panel_box(24, 72, 712, 112, "Relative bond strengths in aqueous cells (kcal/mol)")
    bonds = [
        ("Covalent (C–C, P–O)", 85, 220, TEAL, "Permanent backbone (needs enzyme)"),
        ("Ionic / salt bridge (in water)", 5, 58, BLUE, "Screened by water dipoles"),
        ("Hydrogen bond (N–H···O)", 3, 44, AMBER, "Specificity in DNA pairing & α-helices"),
        ("van der Waals / hydrophobic", 1, 26, PURPLE, "Additive across large folded surfaces"),
    ]
    for i, (name, kcal, bw, col, note) in enumerate(bonds):
        y = 100 + i * 20
        c.text(36, y + 10, name, size=10.5, weight="600", fill=INK)
        c.rect(225, y, bw, 13, fill=col, rx=3)
        c.text(225 + bw + 8, y + 10, f"~{kcal} kcal/mol · {note}", size=10, fill=SOFT)

    # Bottom: 4 macromolecules
    macros = [
        (24, "Nucleic acids", TEAL, TEAL_BG, "Nucleotides", "Phosphodiester", "Information storage", "DNA, mRNA, tRNA"),
        (206, "Proteins", AMBER, AMBER_BG, "20 amino acids", "Peptide bond", "Catalysis & structure", "Enzymes, TFs, channels"),
        (388, "Lipids", BLUE, BLUE_BG, "Fatty acids + head", "Hydrophobic pack", "Membrane barriers", "Phospholipid bilayer"),
        (570, "Polysaccharides", PURPLE, PURPLE_BG, "Monosaccharides", "Glycosidic bond", "Energy & surface tags", "Glycogen, ABO antigens"),
    ]
    for x, name, col, bg, mono, link, role, ex in macros:
        c.rect(x, 200, 166, 172, fill=bg, stroke=col, sw=1.4, rx=10)
        c.text(x + 83, 222, name, size=12.5, weight="700", fill=col, anchor="middle")
        c.line(x + 14, 230, x + 152, 230, stroke=col, sw=0.8, opacity=0.4)
        rows = [("Monomer:", mono), ("Linkage:", link), ("Job:", role), ("Example:", ex)]
        for k, (rk, rv) in enumerate(rows):
            yy = 250 + k * 30
            c.text(x + 12, yy, rk, size=9.5, weight="700", fill=FAINT)
            c.text(x + 12, yy + 13, rv, size=10.5, weight="600", fill=INK)
    c.save(out / "fig-01-chemistry-macromolecules.svg")


def fig_02(out: Path):
    c = Canvas(760, 395, "Antiparallel DNA polarity and Watson–Crick base-pair geometry",
               "5′→3′ phosphodiester directionality and purine–pyrimidine width conservation (constant ~20 Å helix diameter)")
    # Left: Antiparallel ladder schematic
    c.panel_box(24, 72, 420, 304, "Antiparallel strands: 5′→3′ (top) paired with 3′←5′ (bottom)")
    c.text(44, 118, "5′", size=13, weight="700", fill=TEAL_DK, mono=True)
    c.text(412, 118, "3′-OH", size=11.5, weight="700", fill=TEAL_DK, mono=True)
    c.text(44, 344, "3′-OH", size=11.5, weight="700", fill=AMBER, mono=True)
    c.text(414, 344, "5′", size=13, weight="700", fill=AMBER, mono=True)

    # Top backbone line & Bottom backbone line
    c.line(68, 114, 405, 114, stroke=TEAL, sw=4)
    c.line(82, 340, 408, 340, stroke=AMBER, sw=4)

    pairs = [("A", "T", 2), ("G", "C", 3), ("C", "G", 3), ("T", "A", 2)]
    for i, (top_b, bot_b, hb) in enumerate(pairs):
        cx = 112 + i * 76
        # Top phosphate + deoxyribose pentagon
        c.circle(cx - 26, 114, 7, fill=TEAL_BG, stroke=TEAL, sw=1.4)
        c.text(cx - 26, 117.5, "P", size=9, weight="700", fill=TEAL_DK, anchor="middle")
        c.polygon([(cx - 12, 110), (cx, 102), (cx + 12, 110), (cx + 8, 124), (cx - 8, 124)], fill="#ffffff", stroke=TEAL, sw=1.4)
        c.text(cx, 117, "S", size=9, weight="700", fill=TEAL_DK, anchor="middle")
        # Top base
        is_pur_t = top_b in ("A", "G")
        bh_t = 52 if is_pur_t else 34
        c.rect(cx - 16, 132, 32, bh_t, fill=DNA_BG[top_b], stroke=DNA[top_b], sw=1.6, rx=5)
        c.text(cx, 132 + bh_t / 2 + 4, top_b, size=13, weight="700", fill=DNA[top_b], anchor="middle", mono=True)
        # Bottom base
        is_pur_b = bot_b in ("A", "G")
        bh_b = 52 if is_pur_b else 34
        by_b = 318 - bh_b
        c.rect(cx - 16, by_b, 32, bh_b, fill=DNA_BG[bot_b], stroke=DNA[bot_b], sw=1.6, rx=5)
        c.text(cx, by_b + bh_b / 2 + 4, bot_b, size=13, weight="700", fill=DNA[bot_b], anchor="middle", mono=True)
        # Hydrogen bonds between top and bottom base
        y1 = 132 + bh_t + 4
        y2 = by_b - 4
        offsets = [-6, 6] if hb == 2 else [-9, 0, 9]
        for dx in offsets:
            c.line(cx + dx, y1, cx + dx, y2, stroke=FAINT, sw=1.6, dash="3,3")
        c.text(cx, (y1 + y2) / 2 + 3.5, f"{hb}H", size=8.5, weight="700", fill=FAINT, anchor="middle")
        # Bottom sugar + phosphate
        c.polygon([(cx - 12, 338), (cx - 8, 324), (cx + 8, 324), (cx + 12, 338), (cx, 346)], fill="#ffffff", stroke=AMBER, sw=1.4)
        c.text(cx, 337, "S", size=9, weight="700", fill=AMBER, anchor="middle")
        c.circle(cx + 26, 340, 7, fill=AMBER_BG, stroke=AMBER, sw=1.4)
        c.text(cx + 26, 343.5, "P", size=9, weight="700", fill=AMBER, anchor="middle")

    # Right: Geometry comparison (Purine+Pyrimidine vs mismatches)
    c.panel_box(460, 72, 276, 304, "Why only Purine + Pyrimidine fits")
    geom = [
        (114, "Purine + Pyrimidine (A–T, G–C)", GREEN, GREEN_BG, 68, 42, "Uniform ~20 Å width (fits helix)"),
        (200, "Purine + Purine (A–G bulge)", ROSE, ROSE_BG, 68, 68, "Too wide → distorts backbone"),
        (286, "Pyrimidine + Pyrimidine (C–T)", AMBER, AMBER_BG, 42, 42, "Too narrow → H-bonds can't reach"),
    ]
    for gy, lbl, col, bg, w1, w2, note in geom:
        c.text(476, gy, lbl, size=11, weight="700", fill=col)
        # Fixed helix rails
        c.line(494, gy + 12, 494, gy + 44, stroke=RULE, sw=2.5)
        c.line(634, gy + 12, 634, gy + 44, stroke=RULE, sw=2.5)
        cx = 564
        gap = 8
        tot = w1 + w2 + gap
        sx = cx - tot / 2
        c.rect(sx, gy + 16, w1, 22, fill=bg, stroke=col, sw=1.4, rx=4)
        c.rect(sx + w1 + gap, gy + 16, w2, 22, fill=bg, stroke=col, sw=1.4, rx=4)
        c.text(476, gy + 57, note, size=10, fill=SOFT)
    c.save(out / "fig-02-dna-polarity-pairing.svg")


def fig_03(out: Path):
    c = Canvas(760, 355, "Chromatin packaging hierarchy: 2 meters of DNA inside a 6 μm nucleus",
               "Compaction is not uniform — open euchromatin stays accessible while dense heterochromatin stays silent")
    levels = [
        (24, "1. Naked DNA", "2 nm", TEAL, TEAL_BG, "Double helix\n3.1 Gb = 2.0 m"),
        (168, "2. Nucleosome", "11 nm", BLUE, BLUE_BG, "147 bp wrapped 1.65×\nH2A/H2B/H3/H4 octamer"),
        (312, "3. Chromatin loops", "50–300 nm", PURPLE, PURPLE_BG, "Cohesin/CTCF TADs\n(no rigid 30 nm fibre)"),
        (456, "4. Compartments", "Mb scale", AMBER, AMBER_BG, "Active A (interior)\nSilent B (lamina)"),
        (600, "5. Mitotic Chr", "1,400 nm", ROSE, ROSE_BG, "Condensed only in\ncell division (10,000×)"),
    ]
    for i, (x, title, diam, col, bg, desc) in enumerate(levels):
        c.rect(x, 76, 134, 170, fill=bg, stroke=col, sw=1.4, rx=10)
        c.text(x + 67, 98, title, size=11, weight="700", fill=col, anchor="middle")
        c.pill(x + 28, 106, 78, 19, diam, fill="#ffffff", stroke=col, text_fill=col, size=9.5, mono=True)
        # Mini icon inside each card
        cy = 158
        if i == 0:
            pts1 = [(x + 18 + t * 10, cy + 10 * math.sin(t * 0.9)) for t in range(11)]
            pts2 = [(x + 18 + t * 10, cy - 10 * math.sin(t * 0.9)) for t in range(11)]
            c.polyline(pts1, stroke=col, sw=2)
            c.polyline(pts2, stroke=TEAL_DK, sw=2)
        elif i == 1:
            c.line(x + 16, cy, x + 118, cy, stroke=TEAL, sw=2)
            for cx in (x + 42, x + 90):
                c.circle(cx, cy, 15, fill="#ffffff", stroke=col, sw=2)
                c.text(cx, cy + 3.5, "8H", size=9.5, weight="700", fill=col, anchor="middle")
        elif i == 2:
            c.path(f"M {x+18} {cy+16} C {x+32} {cy-30}, {x+64} {cy-30}, {x+68} {cy+16} C {x+74} {cy-30}, {x+106} {cy-30}, {x+118} {cy+16}", stroke=col, sw=2.4)
            c.ellipse(x + 68, cy + 14, 10, 5, fill="#ffffff", stroke=PURPLE, sw=1.6)
        elif i == 3:
            c.circle(x + 67, cy, 24, fill="#ffffff", stroke=AMBER, sw=2)
            c.circle(x + 67, cy, 13, fill=TEAL_BG, stroke=TEAL, sw=1.2)
            c.text(x + 67, cy + 3.5, "A", size=10, weight="700", fill=TEAL_DK, anchor="middle")
            c.text(x + 84, cy - 14, "B", size=9, weight="700", fill=AMBER, anchor="middle")
        else:
            c.path(f"M {x+48} {cy-22} Q {x+67} {cy}, {x+48} {cy+22}", stroke=col, sw=7)
            c.path(f"M {x+86} {cy-22} Q {x+67} {cy}, {x+86} {cy+22}", stroke=col, sw=7)
            c.circle(x + 67, cy, 5, fill="#ffffff", stroke=ROSE_DK, sw=1.8)
        c.multiline(x + 67, 206, desc.split("\n"), size=9.8, lh=14, fill=SOFT, anchor="middle")
        if i < 4:
            c.arrow(x + 135, 160, x + 165, 160, color="ink", sw=1.6)

    # Bottom contrast bar
    c.rect(24, 266, 348, 68, fill=GREEN_BG, stroke=GREEN, sw=1.3, rx=8)
    c.text(38, 286, "Euchromatin (open, transcriptionally active)", size=11, weight="700", fill=GREEN)
    c.text(38, 304, "Acetylated histones · H3K4me3 / H3K27ac · gene-rich", size=10.5, fill=SOFT)
    c.text(38, 320, "Accessible to RNA Pol II, TFs & ATAC-seq Tn5 transposase", size=10, fill=FAINT)

    c.rect(388, 266, 348, 68, fill=ROSE_BG, stroke=ROSE, sw=1.3, rx=8)
    c.text(402, 286, "Heterochromatin (compact, transcriptionally silent)", size=11, weight="700", fill=ROSE_DK)
    c.text(402, 304, "H3K9me3 (constitutive) or H3K27me3 (facultative)", size=10.5, fill=SOFT)
    c.text(402, 320, "Centromeres, telomeres, silenced repeats & lamina periphery", size=10, fill=FAINT)
    c.save(out / "fig-03-chromatin-hierarchy.svg")


def fig_04(out: Path):
    c = Canvas(760, 380, "The asymmetric DNA replication fork",
               "DNA polymerase synthesizes strictly 5′→3′, forcing continuous leading-strand and discontinuous lagging-strand synthesis")
    # Parental duplex on right
    c.line(480, 180, 725, 180, stroke=INK, sw=3.2)
    c.line(480, 210, 725, 210, stroke=INK, sw=3.2)
    for x in range(495, 720, 18):
        c.line(x, 182, x, 208, stroke=RULE, sw=1.5)
    c.text(728, 175, "5′", size=11, weight="700", fill=INK, anchor="end", mono=True)
    c.text(728, 226, "3′", size=11, weight="700", fill=INK, anchor="end", mono=True)
    c.text(605, 162, "Parental duplex", size=11, weight="700", fill=SOFT, anchor="middle")

    # Helicase wedge at fork
    c.polygon([(446, 195), (488, 166), (488, 224)], fill=PURPLE_BG, stroke=PURPLE, sw=2)
    c.text(472, 199, "Hel", size=9.5, weight="700", fill=PURPLE, anchor="middle")
    c.text(565, 244, "Helicase unwinds →", size=10.5, weight="700", fill=PURPLE, anchor="middle")

    # Upper template (3' left -> 5' right)
    c.path("M 480 180 C 420 180, 390 118, 340 118 L 40 118", stroke=INK, sw=3.0)
    c.text(32, 114, "3′", size=11, weight="700", fill=INK, mono=True)

    # Leading strand (continuous 5'->3' toward fork)
    c.line(48, 140, 412, 140, stroke=TEAL, sw=3.5, marker="arr-teal")
    c.text(48, 158, "5′", size=10.5, weight="700", fill=TEAL_DK, mono=True)
    c.text(225, 100, "Leading strand — continuous 5′→3′ synthesis", size=11.5, weight="700", fill=TEAL_DK, anchor="middle")
    c.ellipse(422, 140, 18, 13, fill=TEAL_BG, stroke=TEAL, sw=1.8)
    c.text(422, 144, "Pol", size=10, weight="700", fill=TEAL_DK, anchor="middle")

    # Lower template (5' left -> 3' right)
    c.path("M 480 210 C 420 210, 390 278, 340 278 L 40 278", stroke=INK, sw=3.0)
    c.text(32, 294, "5′", size=11, weight="700", fill=INK, mono=True)

    # Lagging strand Okazaki fragments (pointing LEFT away from fork, 5'->3')
    c.text(220, 314, "Lagging strand — discontinuous Okazaki fragments (5′→3′ away from fork)", size=11.5, weight="700", fill=AMBER, anchor="middle")
    frags = [(412, 326), (306, 206), (186, 86)]
    for idx, (rx, lx) in enumerate(frags):
        # RNA primer at 5' end (right side)
        c.line(rx, 256, rx - 18, 256, stroke=ROSE, sw=4.2)
        c.line(rx - 20, 256, lx, 256, stroke=AMBER, sw=3.5, marker="arr-amber")
        if idx == 0:
            c.text(rx + 6, 252, "RNA primer", size=9.5, weight="700", fill=ROSE)
        if idx == 1:
            c.text((rx + lx) / 2, 244, "Okazaki fragment", size=9.5, weight="600", fill=AMBER, anchor="middle")
    # Ligase sealing nick
    c.pill(168, 232, 54, 18, "Ligase", fill=BLUE_BG, stroke=BLUE, text_fill=BLUE_DK, size=9)

    # Legend strip
    c.rect(24, 336, 712, 30, fill=PANEL, stroke=RULE_LT, rx=6)
    c.text(40, 355, "Key constraint: dNTPs add ONLY to a free 3′-OH → fork moves right while lagging polymerase synthesizes leftward in chunks.", size=10.5, fill=SOFT)
    c.save(out / "fig-04-replication-fork.svg")


def fig_05(out: Path):
    c = Canvas(760, 360, "Transcription bubble: template vs. coding strand",
               "The coding (sense) strand matches the mRNA sequence (with T for U); RNA Pol reads the template strand 3′→5′")
    # Promoter box on left
    c.rect(34, 134, 62, 26, fill=PURPLE_BG, stroke=PURPLE, sw=1.4, rx=4)
    c.text(65, 151, "-35 box", size=10, weight="700", fill=PURPLE, anchor="middle", mono=True)
    c.rect(128, 134, 68, 26, fill=PURPLE_BG, stroke=PURPLE, sw=1.4, rx=4)
    c.text(162, 151, "-10 TATAAT", size=9.5, weight="700", fill=PURPLE, anchor="middle", mono=True)
    c.arrow(212, 132, 242, 114, color="teal", sw=2.0)
    c.text(236, 106, "+1 TSS", size=10.5, weight="700", fill=TEAL_DK, anchor="end", mono=True)

    # DNA duplex opening into bubble
    c.path("M 26 168 L 240 168 C 280 168, 300 124, 340 124 L 540 124 C 580 124, 600 168, 640 168 L 732 168", stroke=BLUE, sw=3.0)
    c.path("M 26 196 L 240 196 C 280 196, 300 246, 340 246 L 540 246 C 580 246, 600 196, 640 196 L 732 196", stroke=INK, sw=3.0)

    # Strand labels
    c.text(30, 160, "5′", size=11, weight="700", fill=BLUE_DK, mono=True)
    c.text(722, 160, "3′", size=11, weight="700", fill=BLUE_DK, mono=True)
    c.text(440, 112, "Coding (non-template / sense) strand: 5′-ATG CCG TAC-3′", size=11, weight="700", fill=BLUE_DK, anchor="middle", mono=True)
    c.text(30, 214, "3′", size=11, weight="700", fill=INK, mono=True)
    c.text(722, 214, "5′", size=11, weight="700", fill=INK, mono=True)
    c.text(440, 268, "Template (antisense) strand: 3′-TAC GGC ATG-5′", size=11, weight="700", fill=INK, anchor="middle", mono=True)

    # RNA Polymerase oval
    c.ellipse(460, 192, 128, 62, fill=TEAL_BG, stroke=TEAL, sw=1.8, opacity=0.45)
    c.text(552, 152, "RNA Pol →", size=11, weight="700", fill=TEAL_DK)

    # Nascent mRNA exiting to bottom-left
    c.path("M 518 228 L 365 228 C 330 228, 300 296, 240 296 L 78 296", stroke=ROSE, sw=3.6)
    c.text(72, 290, "5′", size=11, weight="700", fill=ROSE_DK, mono=True)
    c.text(526, 232, "3′-OH", size=10, weight="700", fill=ROSE_DK, mono=True)
    c.text(200, 318, "Nascent RNA: 5′-AUG CCG UAC-3′", size=11.5, weight="700", fill=ROSE_DK, anchor="middle", mono=True)
    for hx in range(385, 510, 24):
        c.line(hx, 230, hx, 244, stroke=ROSE, sw=1.4, dash="2,2")
    c.text(446, 220, "8–9 bp RNA–DNA hybrid", size=9.5, weight="600", fill=ROSE_DK, anchor="middle")

    # Summary strip
    c.rect(390, 290, 344, 52, fill=PANEL, stroke=RULE, rx=8)
    c.multiline(404, 308, [
        "No primer needed (unlike DNA Pol).",
        "Reads template 3′→5′; writes RNA 5′→3′.",
    ], size=10.5, lh=16, fill=SOFT)
    c.save(out / "fig-05-transcription-bubble.svg")


def fig_06(out: Path):
    c = Canvas(760, 375, "Eukaryotic pre-mRNA processing and alternative splicing",
               "Co-transcriptional 5′ capping, intron excision via the lariat intermediate, and 3′ polyadenylation")
    # Row 1: Pre-mRNA with splice signals
    c.text(24, 88, "Pre-mRNA", size=11.5, weight="700", fill=INK)
    c.line(105, 110, 725, 110, stroke=SOFT, sw=2.5)
    exons = [(130, 110, "Exon 1", TEAL, TEAL_BG), (330, 100, "Exon 2", BLUE, BLUE_BG), (520, 120, "Exon 3", PURPLE, PURPLE_BG)]
    for ex, ew, lbl, col, bg in exons:
        c.rect(ex, 94, ew, 32, fill=bg, stroke=col, sw=1.8, rx=5)
        c.text(ex + ew / 2, 114, lbl, size=11, weight="700", fill=col, anchor="middle")
    # Splice site annotations on Intron 1
    c.text(246, 98, "GU", size=10, weight="700", fill=ROSE, mono=True)
    c.text(286, 98, "A (branch)", size=9.5, weight="700", fill=AMBER, anchor="middle")
    c.text(312, 98, "AG", size=10, weight="700", fill=ROSE, mono=True)
    c.text(285, 138, "Intron 1 (spliced out)", size=9.5, fill=FAINT, anchor="middle")
    c.text(475, 138, "Intron 2", size=9.5, fill=FAINT, anchor="middle")
    c.pill(86, 98, 42, 22, "m⁷G", fill=AMBER_BG, stroke=AMBER, text_fill=AMBER, size=9.5, mono=True)
    c.pill(650, 98, 76, 22, "AAUAAA", fill=ROSE_BG, stroke=ROSE, text_fill=ROSE_DK, size=9, mono=True)

    # Middle: Splicing lariat
    c.arrow(285, 146, 285, 186, color="amber", sw=1.8)
    c.panel_box(160, 190, 260, 74, "Spliceosome lariat excision", fill=AMBER_BG, stroke=AMBER, header_fill=AMBER)
    c.circle(232, 238, 16, fill="#ffffff", stroke=AMBER, sw=2)
    c.line(216, 238, 186, 238, stroke=AMBER, sw=2)
    c.text(232, 241, "2′–5′", size=8.5, weight="700", fill=AMBER, anchor="middle")
    c.multiline(262, 230, ["Branch-point A attacks 5′ GU;", "3′-OH of Exon 1 joins Exon 2."], size=10, lh=14, fill=SOFT)

    # Bottom: Two alternative mature mRNA isoforms
    c.text(24, 294, "Isoform A", size=11, weight="700", fill=TEAL_DK)
    c.text(24, 308, "(all exons)", size=9.5, fill=FAINT)
    c.pill(110, 288, 44, 24, "5′Cap", fill=AMBER_BG, stroke=AMBER, text_fill=AMBER, size=9)
    for px, pw, lbl, col, bg in [(156, 105, "Exon 1", TEAL, TEAL_BG), (261, 95, "Exon 2", BLUE, BLUE_BG), (356, 115, "Exon 3", PURPLE, PURPLE_BG)]:
        c.rect(px, 284, pw, 32, fill=bg, stroke=col, sw=1.8, rx=4)
        c.text(px + pw / 2, 304, lbl, size=10.5, weight="700", fill=col, anchor="middle")
    c.pill(474, 288, 92, 24, "AAAAA… (poly-A)", fill=ROSE_BG, stroke=ROSE, text_fill=ROSE_DK, size=9)

    c.text(24, 344, "Isoform B", size=11, weight="700", fill=PURPLE)
    c.text(24, 358, "(exon 2 skipped)", size=9.5, fill=FAINT)
    c.pill(110, 338, 44, 24, "5′Cap", fill=AMBER_BG, stroke=AMBER, text_fill=AMBER, size=9)
    for px, pw, lbl, col, bg in [(156, 105, "Exon 1", TEAL, TEAL_BG), (261, 115, "Exon 3", PURPLE, PURPLE_BG)]:
        c.rect(px, 334, pw, 32, fill=bg, stroke=col, sw=1.8, rx=4)
        c.text(px + pw / 2, 354, lbl, size=10.5, weight="700", fill=col, anchor="middle")
    c.pill(379, 338, 92, 24, "AAAAA… (poly-A)", fill=ROSE_BG, stroke=ROSE, text_fill=ROSE_DK, size=9)
    c.text(596, 332, "1 gene → multiple", size=10.5, weight="700", fill=INK)
    c.text(596, 348, "tissue-specific proteins", size=10.5, fill=SOFT)
    c.save(out / "fig-06-rna-processing.svg")


def fig_07(out: Path):
    c = Canvas(760, 375, "Translation on the ribosome (E, P, A sites) and codon reading frames",
               "tRNAs decode 3-base codons sequentially; a 1-base insertion shifts every downstream codon (frameshift)")
    # Ribosome body
    c.ellipse(380, 168, 210, 86, fill=PANEL, stroke=RULE, sw=2)
    c.rect(195, 178, 370, 56, fill=SUNK, stroke=RULE, sw=1.4, rx=22)
    c.text(552, 112, "Large subunit (60S/50S)", size=10, weight="700", fill=FAINT)
    c.text(196, 250, "Small subunit (40S/30S)", size=10, weight="700", fill=FAINT)

    # E, P, A site slots
    sites = [(245, "E (Exit)", FAINT, "#ffffff"), (345, "P (Peptidyl)", TEAL, TEAL_BG), (445, "A (Aminoacyl)", BLUE, BLUE_BG)]
    for sx, lbl, col, bg in sites:
        c.rect(sx, 112, 74, 86, fill=bg, stroke=col, sw=1.5, rx=8)
        c.text(sx + 37, 130, lbl, size=10, weight="700", fill=col, anchor="middle")

    # Growing polypeptide chain out of P site
    aas = [("Met", AMBER), ("Pro", TEAL), ("Gly", BLUE), ("Ser", PURPLE)]
    for idx, (aa, col) in enumerate(aas):
        cx = 382 - idx * 24
        cy = 96 - idx * 8
        c.circle(cx, cy, 12, fill="#ffffff", stroke=col, sw=1.8)
        c.text(cx, cy + 3.5, aa, size=8.5, weight="700", fill=col, anchor="middle")
    # Incoming charged tRNA in A site
    c.circle(482, 98, 12, fill=ROSE_BG, stroke=ROSE, sw=1.8)
    c.text(482, 101.5, "Val", size=8.5, weight="700", fill=ROSE_DK, anchor="middle")
    c.text(482, 162, "tRNA", size=10, weight="700", fill=BLUE_DK, anchor="middle")
    c.text(482, 180, "3′-CAC-5′", size=9.5, weight="700", fill=BLUE_DK, anchor="middle", mono=True)
    c.text(382, 162, "tRNA", size=10, weight="700", fill=TEAL_DK, anchor="middle")
    c.text(382, 180, "3′-AGG-5′", size=9.5, weight="700", fill=TEAL_DK, anchor="middle", mono=True)

    # mRNA strip running through ribosome
    c.line(48, 206, 712, 206, stroke=INK, sw=2.6)
    c.text(34, 210, "5′", size=11, weight="700", fill=INK, mono=True)
    c.text(720, 210, "3′", size=11, weight="700", fill=INK, mono=True)
    codons = [(140, "AUG"), (252, "CCG"), (352, "UCC"), (452, "GUG"), (560, "UAA")]
    for cx, cod in codons:
        bg = ROSE_BG if cod == "UAA" else "#ffffff"
        st = ROSE if cod == "UAA" else INK
        c.rect(cx, 194, 60, 24, fill=bg, stroke=st, sw=1.4, rx=4)
        c.text(cx + 30, 210, cod, size=11, weight="700", fill=st, anchor="middle", mono=True)
    c.text(590, 232, "STOP", size=9.5, weight="700", fill=ROSE, anchor="middle")
    c.arrow(590, 246, 650, 246, color="teal", sw=2.0)
    c.text(620, 260, "Ribosome →", size=10, weight="700", fill=TEAL_DK, anchor="middle")

    # Bottom: Reading frame sensitivity
    c.panel_box(24, 274, 712, 86, "Why 1-base indels break the reading frame (while 3-base indels preserve it)")
    c.text(42, 314, "Normal:", size=10.5, weight="700", fill=TEAL_DK)
    c.text(118, 314, "AUG | CCG | UCC | GUG | ...", size=11.5, weight="700", fill=INK, mono=True)
    c.text(370, 314, "→  Met - Pro - Ser - Val", size=11, weight="600", fill=TEAL_DK)
    c.text(42, 342, "+1 base (A):", size=10.5, weight="700", fill=ROSE_DK)
    c.text(118, 342, "AUG | ACC | GUC | CGU | ...", size=11.5, weight="700", fill=ROSE_DK, mono=True)
    c.text(370, 342, "→  Met - Thr - Val - Arg  (every codon corrupted!)", size=11, weight="600", fill=ROSE_DK)
    c.save(out / "fig-07-translation-ribosome.svg")


def fig_08(out: Path):
    c = Canvas(760, 360, "From protein folding hierarchy to genetic mechanism of mutation",
               "Knowing what a mutation does to the protein explains whether the allele behaves as recessive or dominant")
    # Top row: 4 levels of structure
    lvls = [
        (24, "1° Primary", TEAL, TEAL_BG, "Amino-acid sequence\n(peptide chain)"),
        (206, "2° Secondary", BLUE, BLUE_BG, "Local backbone H-bonds\nα-helix & β-sheet"),
        (388, "3° Tertiary", AMBER, AMBER_BG, "3D fold of one chain\n(hydrophobic core)"),
        (570, "4° Quaternary", PURPLE, PURPLE_BG, "Multi-subunit complex\n(e.g. PP2A, Hb)"),
    ]
    for i, (x, t, col, bg, d) in enumerate(lvls):
        c.box(x, 76, 166, 78, t, d.split("\n"), fill=bg, stroke=col, title_fill=col)
        if i < 3:
            c.arrow(x + 168, 115, x + 202, 115, color="ink", sw=1.8)

    # Bottom: 4 genetic mechanisms (LoF recessive vs haploinsufficient vs DN vs GoF)
    c.text(24, 184, "How protein disruption maps onto dominance in heterozygotes (one wild-type + one mutant allele):", size=11.5, weight="700", fill=INK)
    mechs = [
        (24, "Recessive LoF", GREEN, GREEN_BG, ["50% enzyme is enough", "(most metabolic enzymes)", "Wild-type masks mutant"]),
        (206, "Haploinsufficiency", BLUE, BLUE_BG, ["50% protein is NOT enough", "(dosage-sensitive TFs)", "Dominant phenotype"]),
        (388, "Dominant negative", AMBER, AMBER_BG, ["Mutant subunit poisons", "multi-subunit complex", "(e.g. collagen / dimers)"]),
        (570, "Gain of function", ROSE, ROSE_BG, ["Constitutively active or", "toxic new aggregation", "(e.g. oncogenes, repeats)"]),
    ]
    for x, t, col, bg, lines in mechs:
        c.box(x, 198, 166, 140, t, lines, fill=bg, stroke=col, title_fill=col, body_size=10)
        # Visual meter bar at bottom of box
        bar_y = 312
        c.rect(x + 18, bar_y, 130, 12, fill="#ffffff", stroke=RULE, rx=4)
        if t == "Recessive LoF":
            c.rect(x + 18, bar_y, 65, 12, fill=GREEN, rx=4)
            c.text(x + 83, bar_y + 10, "50% OK", size=8.5, weight="700", fill=GREEN, anchor="middle")
        elif t == "Haploinsufficiency":
            c.rect(x + 18, bar_y, 65, 12, fill=BLUE, rx=4)
            c.line(x + 106, bar_y - 3, x + 106, bar_y + 15, stroke=ROSE, sw=2)
            c.text(x + 106, bar_y - 5, "threshold", size=8, fill=ROSE, anchor="middle")
        elif t == "Dominant negative":
            c.rect(x + 18, bar_y, 20, 12, fill=AMBER, rx=4)
            c.text(x + 92, bar_y + 10, "<25% active", size=8.5, weight="700", fill=AMBER, anchor="middle")
        else:
            c.rect(x + 18, bar_y, 130, 12, fill=ROSE, rx=4)
            c.text(x + 83, bar_y + 10, "Hyperactive / toxic", size=8.5, weight="700", fill="#ffffff", anchor="middle")
    c.save(out / "fig-08-protein-levels-and-effects.svg")


def fig_09(out: Path):
    c = Canvas(760, 385, "Mitosis versus Meiosis I & II: tracking ploidy (n) and DNA content (C)",
               "Meiosis I is the reductional division (separates homologs after crossing-over); Mitosis and Meiosis II separate sister chromatids")
    # Left panel: Mitosis
    c.panel_box(24, 72, 260, 294, "Mitosis — 1 division (2 identical 2n cells)", fill=BLUE_BG, stroke=BLUE, header_fill=BLUE_DK)
    c.circle(154, 134, 30, fill="#ffffff", stroke=BLUE, sw=1.5)
    c.text(154, 132, "2n, 4C", size=11, weight="700", fill=INK, anchor="middle", mono=True)
    c.text(154, 147, "(replicated)", size=9, fill=FAINT, anchor="middle")
    c.arrow(154, 168, 154, 212, color="blue", sw=1.8)
    c.text(164, 194, "Sister chromatids", size=9.5, fill=BLUE_DK)
    c.text(164, 206, "separate", size=9.5, fill=BLUE_DK)
    for cx in (98, 210):
        c.circle(cx, 250, 28, fill="#ffffff", stroke=BLUE, sw=1.5)
        c.text(cx, 253, "2n, 2C", size=11, weight="700", fill=BLUE_DK, anchor="middle", mono=True)
    c.multiline(154, 306, ["Diploid → Diploid", "No pairing of homologs", "Clonal genetic identity"], size=10.5, lh=16, fill=SOFT, anchor="middle")

    # Right panel: Meiosis I + II
    c.panel_box(304, 72, 432, 294, "Meiosis — 2 divisions (4 unique haploid n gametes)", fill=TEAL_BG, stroke=TEAL, header_fill=TEAL_DK)
    c.circle(520, 126, 28, fill="#ffffff", stroke=TEAL, sw=1.5)
    c.text(520, 125, "2n, 4C", size=10.5, weight="700", fill=INK, anchor="middle", mono=True)
    c.text(520, 138, "Prophase I", size=8.5, fill=AMBER, anchor="middle")
    c.pill(564, 114, 154, 24, "Crossing-over (chiasmata)", fill=AMBER_BG, stroke=AMBER, text_fill=AMBER, size=9.5)

    # Meiosis I arrows
    c.arrow(500, 154, 424, 194, color="teal", sw=1.8)
    c.arrow(540, 154, 616, 194, color="teal", sw=1.8)
    c.text(520, 178, "Meiosis I (homologs separate)", size=9.5, weight="700", fill=TEAL_DK, anchor="middle")

    for cx in (414, 626):
        c.circle(cx, 220, 24, fill="#ffffff", stroke=TEAL, sw=1.5)
        c.text(cx, 224, "n, 2C", size=10.5, weight="700", fill=TEAL_DK, anchor="middle", mono=True)

    # Meiosis II arrows
    c.text(520, 256, "Meiosis II (sister chromatids separate)", size=9.5, weight="700", fill=PURPLE, anchor="middle")
    for px, kids in [(414, (362, 466)), (626, (574, 678))]:
        for kx in kids:
            c.arrow(px, 245, kx, 282, color="purple", sw=1.5)
            c.circle(kx, 308, 22, fill="#ffffff", stroke=PURPLE, sw=1.5)
            c.text(kx, 312, "n, 1C", size=10, weight="700", fill=PURPLE, anchor="middle", mono=True)
    c.text(520, 352, "Independent assortment (2²³) + crossing-over generate genetic diversity", size=10.5, weight="600", fill=SOFT, anchor="middle")
    c.save(out / "fig-09-mitosis-vs-meiosis.svg")


def fig_10(out: Path):
    c = Canvas(760, 360, "Mendel's laws as probability tables: F₂ self-cross vs. testcross",
               "Segregation puts one allele per gamete; a testcross (× aa) makes hidden gamete genotypes directly observable")
    # Left: Monohybrid Punnett (Aa x Aa)
    c.panel_box(24, 72, 344, 268, "F₁ × F₁ Monohybrid (Aa × Aa) → 3 : 1 phenotype")
    c.text(170, 114, "A (½)", size=11, weight="700", fill=TEAL_DK, anchor="middle", mono=True)
    c.text(274, 114, "a (½)", size=11, weight="700", fill=AMBER, anchor="middle", mono=True)
    c.text(88, 166, "A (½)", size=11, weight="700", fill=TEAL_DK, anchor="middle", mono=True)
    c.text(88, 246, "a (½)", size=11, weight="700", fill=AMBER, anchor="middle", mono=True)
    cells = [
        (120, 126, "AA (¼)", "Dominant", TEAL_BG, TEAL),
        (224, 126, "Aa (¼)", "Dominant", TEAL_BG, TEAL),
        (120, 206, "Aa (¼)", "Dominant", TEAL_BG, TEAL),
        (224, 206, "aa (¼)", "Recessive", AMBER_BG, AMBER),
    ]
    for cx, cy, g, ph, bg, st in cells:
        c.rect(cx, cy, 98, 74, fill=bg, stroke=st, sw=1.5, rx=6)
        c.text(cx + 49, cy + 32, g, size=12.5, weight="700", fill=INK, anchor="middle", mono=True)
        c.text(cx + 49, cy + 52, ph, size=10.5, fill=SOFT, anchor="middle")
    c.text(196, 314, "Genotypes 1 AA : 2 Aa : 1 aa  |  Phenotypes 3 : 1", size=10.5, weight="600", fill=SOFT, anchor="middle")

    # Right: Testcross (AaBb x aabb)
    c.panel_box(392, 72, 344, 268, "Dihybrid Testcross (AaBb × aabb) → 1 : 1 : 1 : 1")
    c.text(564, 112, "Tester contributes only ab gametes", size=10.5, fill=FAINT, anchor="middle")
    trows = [
        ("AB (¼)", "AaBb", "Dominant A, B", TEAL_BG, TEAL),
        ("Ab (¼)", "Aabb", "Dom A, rec b", BLUE_BG, BLUE),
        ("aB (¼)", "aaBb", "Rec a, dom B", PURPLE_BG, PURPLE),
        ("ab (¼)", "aabb", "Double recessive", AMBER_BG, AMBER),
    ]
    for idx, (gam, geno, phen, bg, col) in enumerate(trows):
        yy = 128 + idx * 44
        c.pill(412, yy + 4, 72, 26, gam, fill=bg, stroke=col, text_fill=col, size=10.5, mono=True)
        c.arrow(488, yy + 17, 520, yy + 17, color="ink", sw=1.5)
        c.rect(526, yy, 192, 34, fill=bg, stroke=col, sw=1.3, rx=6)
        c.text(558, yy + 21, geno, size=11.5, weight="700", fill=INK, anchor="middle", mono=True)
        c.text(650, yy + 21, phen, size=10.5, fill=SOFT, anchor="middle")
    c.text(564, 318, "Offspring ratios = direct readout of F₁ gametes", size=10.5, weight="600", fill=TEAL_DK, anchor="middle")
    c.save(out / "fig-10-mendel-segregation.svg")


def fig_11(out: Path):
    c = Canvas(760, 365, "Beyond Mendel: dominance spectra and two-gene epistasis",
               "Modified 9:3:3:1 ratios diagnose how two enzymes or receptors sit in the same biochemical pathway")
    # Top: Incomplete vs Codominance
    c.panel_box(24, 72, 346, 118, "Single-locus heterozygote phenotypes")
    c.pill(42, 106, 92, 24, "Incomplete", fill=ROSE_BG, stroke=ROSE, text_fill=ROSE_DK, size=10)
    c.text(146, 122, "RR (red) × rr (white) → Rr (pink)", size=10.5, fill=INK)
    c.pill(42, 144, 92, 24, "Codominance", fill=BLUE_BG, stroke=BLUE, text_fill=BLUE_DK, size=10)
    c.text(146, 160, "IᴬIᴮ expresses BOTH A & B sugars", size=10.5, fill=INK)

    # Top-right: Penetrance & Expressivity
    c.panel_box(390, 72, 346, 118, "Same genotype, different clinical outcomes")
    c.text(406, 114, "Incomplete penetrance:", size=10.5, weight="700", fill=TEAL_DK)
    c.text(546, 114, "fraction with trait < 100%", size=10.5, fill=SOFT)
    c.text(406, 144, "Variable expressivity:", size=10.5, weight="700", fill=AMBER)
    c.text(546, 144, "severity varies widely", size=10.5, fill=SOFT)
    c.text(406, 172, "Both reflect background genes + environment.", size=10, fill=FAINT)

    # Bottom: Epistasis pathway diagram (9:3:4 and 9:7)
    c.panel_box(24, 206, 712, 142, "Two-gene biochemical pathway explaining epistatic F₂ ratios")
    c.box(46, 246, 116, 48, "Precursor", ["(colorless)"], fill=SUNK, stroke=RULE)
    c.arrow(164, 270, 232, 270, color="teal", sw=2.2)
    c.text(198, 258, "Gene A", size=10.5, weight="700", fill=TEAL_DK, anchor="middle")
    c.box(236, 246, 128, 48, "Intermediate", ["(brown / colorless)"], fill=AMBER_BG, stroke=AMBER, title_fill=AMBER)
    c.arrow(366, 270, 434, 270, color="purple", sw=2.2)
    c.text(400, 258, "Gene B", size=10.5, weight="700", fill=PURPLE, anchor="middle")
    c.box(438, 246, 116, 48, "Pigment", ["(black / purple)"], fill=PURPLE_BG, stroke=PURPLE, title_fill=PURPLE)

    c.multiline(574, 246, [
        "Recessive epistasis (9:3:4):",
        "aa blocks step 1 → masks B.",
        "",
        "Complementary (9:7):",
        "Need BOTH A– and B–.",
    ], size=10.2, lh=15, fill=SOFT)
    c.text(300, 326, "Blocking step 1 (aa) makes step 2 (B vs b) invisible — that is epistasis.", size=10.5, weight="600", fill=INK, anchor="middle")
    c.save(out / "fig-11-beyond-mendel.svg")


def fig_12(out: Path):
    c = Canvas(760, 360, "Chi-square goodness-of-fit distributions (df = 1, 2, 3)",
               "Degrees of freedom = (categories − 1 − estimated parameters); χ² > 3.84 rejects a 1-df model at α = 0.05")
    x0, y0, pw, ph = 72, 290, 440, 200
    c.axes(x0, y0, pw, ph, xlabel="χ² statistic = Σ (Observed − Expected)² / Expected",
           ylabel="Density",
           xticks=[(0, "0"), (3.84 / 12, "3.84"), (6 / 12, "6"), (9 / 12, "9"), (1, "12")],
           yticks=[(0, "0"), (0.5, "0.25"), (1.0, "0.50")])

    # Shade α=0.05 tail for df=1 (x >= 3.84)
    tail_pts = [(x0 + (3.84 / 12) * pw, y0)]
    for k in range(40):
        xv = 3.84 + (12.0 - 3.84) * k / 39
        yv = min(0.5, chi2_pdf(xv, 1))
        tail_pts.append((x0 + (xv / 12) * pw, y0 - (yv / 0.5) * ph))
    tail_pts.append((x0 + pw, y0))
    c.polygon(tail_pts, fill=ROSE_BG, stroke="none", opacity=0.9)

    for df, col in [(1, TEAL), (2, BLUE), (3, AMBER)]:
        pts = []
        for k in range(1, 120):
            xv = 0.12 + 11.88 * k / 119
            yv = min(0.5, chi2_pdf(xv, df))
            pts.append((x0 + (xv / 12) * pw, y0 - (yv / 0.5) * ph))
        c.polyline(pts, stroke=col, sw=2.3)

    # Critical value vertical line for df=1
    cx = x0 + (3.84 / 12) * pw
    c.line(cx, y0 - ph, cx, y0, stroke=ROSE, sw=1.6, dash="4,3")
    c.text(cx + 6, y0 - ph + 16, "df=1 critical = 3.84 (p=0.05)", size=10, weight="700", fill=ROSE_DK)

    # Legend & df rules panel on right
    c.panel_box(534, 82, 202, 232, "Curve legend & rules")
    for idx, (lbl, col) in enumerate([("df = 1 (2 classes, 3:1)", TEAL), ("df = 2 (3 classes, 1:2:1)", BLUE), ("df = 3 (4 classes, 9:3:3:1)", AMBER)]):
        yy = 118 + idx * 24
        c.line(548, yy, 574, yy, stroke=col, sw=3)
        c.text(582, yy + 4, lbl, size=10, weight="600", fill=INK)
    c.line(548, 194, 720, 194, stroke=RULE_LT, sw=1)
    c.multiline(548, 214, [
        "Product rule (AND):",
        "Independent events → multiply",
        "",
        "Sum rule (OR):",
        "Mutually exclusive → add",
        "",
        "Always test COUNTS, never %!",
    ], size=10, lh=14.5, fill=SOFT)
    c.save(out / "fig-12-chi-square-testing.svg")


def fig_13(out: Path):
    c = Canvas(760, 360, "Human X and Y chromosomes and X-linked recessive inheritance",
               "Because XY males carry a single X (hemizygous), a single recessive allele is expressed — and never passes father-to-son")
    # Left: X vs Y anatomy
    c.panel_box(24, 72, 290, 268, "X vs Y chromosome structure")
    # X chromosome
    c.rect(74, 108, 34, 190, fill=TEAL_BG, stroke=TEAL, sw=2, rx=16)
    c.rect(74, 108, 34, 22, fill=PURPLE_BG, stroke=PURPLE, sw=1.4, rx=8)
    c.rect(74, 276, 34, 22, fill=PURPLE_BG, stroke=PURPLE, sw=1.4, rx=8)
    c.text(91, 318, "X (~155 Mb)", size=10.5, weight="700", fill=TEAL_DK, anchor="middle")
    c.text(91, 332, "~850 genes", size=9.5, fill=FAINT, anchor="middle")
    # Y chromosome
    c.rect(198, 152, 34, 110, fill=AMBER_BG, stroke=AMBER, sw=2, rx=16)
    c.rect(198, 152, 34, 20, fill=PURPLE_BG, stroke=PURPLE, sw=1.4, rx=8)
    c.rect(198, 242, 34, 20, fill=PURPLE_BG, stroke=PURPLE, sw=1.4, rx=8)
    c.rect(198, 178, 34, 14, fill=ROSE, stroke="none", rx=2)
    c.text(242, 189, "SRY", size=10, weight="700", fill=ROSE_DK, italic=True)
    c.text(215, 282, "Y (~57 Mb)", size=10.5, weight="700", fill=AMBER, anchor="middle")
    c.text(215, 296, "~50 protein genes", size=9.5, fill=FAINT, anchor="middle")
    # PAR label
    c.text(146, 124, "PAR1", size=9.5, weight="700", fill=PURPLE, anchor="middle")
    c.line(110, 120, 196, 160, stroke=PURPLE, sw=1.2, dash="3,2")
    c.text(146, 266, "PAR2", size=9.5, weight="700", fill=PURPLE, anchor="middle")
    c.line(110, 286, 196, 252, stroke=PURPLE, sw=1.2, dash="3,2")

    # Right: Criss-cross X-linked recessive transmission
    c.panel_box(334, 72, 402, 268, "X-linked recessive cross: Carrier mother (X⁺X⁻) × Unaffected father (X⁺Y)")
    c.box(384, 108, 116, 42, "Mother X⁺X⁻", ["Carrier (unaffected)"], fill=TEAL_BG, stroke=TEAL, title_fill=TEAL_DK, body_size=9.5)
    c.box(570, 108, 116, 42, "Father X⁺Y", ["Unaffected"], fill=BLUE_BG, stroke=BLUE, title_fill=BLUE_DK, body_size=9.5)
    c.line(500, 129, 570, 129, stroke=SOFT, sw=1.8)
    c.line(535, 129, 535, 174, stroke=SOFT, sw=1.8)
    c.line(392, 174, 678, 174, stroke=SOFT, sw=1.8)
    kids = [
        (356, "X⁺X⁺", "Unaffected\ndaughter", GREEN_BG, GREEN),
        (450, "X⁺X⁻", "Carrier\ndaughter", TEAL_BG, TEAL),
        (544, "X⁺Y", "Unaffected\nson", BLUE_BG, BLUE),
        (638, "X⁻Y", "Affected\nson (50%)", ROSE_BG, ROSE),
    ]
    for kx, geno, desc, bg, col in kids:
        c.line(kx + 38, 174, kx + 38, 198, stroke=SOFT, sw=1.5)
        c.box(kx, 198, 76, 66, geno, desc.split("\n"), fill=bg, stroke=col, title_fill=col, title_size=11.5, body_size=9.2)
    c.multiline(535, 294, [
        "Key rule: Father gives Y to sons and X to all daughters.",
        "Therefore an affected father NEVER transmits X-linked traits to sons.",
    ], size=10.5, lh=16, fill=SOFT, anchor="middle")
    c.save(out / "fig-13-sex-linkage.svg")


def fig_14(out: Path):
    c = Canvas(760, 365, "Genetic linkage, crossing-over, and the 50% recombination ceiling",
               "Even on the same chromosome, multiple crossovers saturate observed recombination frequency at 50% (Haldane curve)")
    # Left: Crossing-over diagram
    c.panel_box(24, 72, 342, 274, "Single crossover between linked loci A and B")
    # 4 chromatids
    ys = [118, 146, 188, 216]
    cols = [TEAL, TEAL, AMBER, AMBER]
    for idx, (y, col) in enumerate(zip(ys, cols)):
        if idx in (0, 3):
            c.line(54, y, 336, y, stroke=col, sw=3.2)
        elif idx == 1:
            c.path("M 54 146 L 178 146 L 214 188 L 336 188", stroke=TEAL, sw=3.2)
        else:
            c.path("M 54 188 L 178 188 L 214 146 L 336 146", stroke=AMBER, sw=3.2)
    # Allele markers
    for y, a, b, tag, tcol in [
        (118, "A", "B", "Parental (AB)", TEAL_DK),
        (146, "A", "b", "Recomb (Ab)", PURPLE),
        (188, "a", "B", "Recomb (aB)", PURPLE),
        (216, "a", "b", "Parental (ab)", AMBER),
    ]:
        c.circle(100, y, 9, fill="#ffffff", stroke=TEAL if a == "A" else AMBER, sw=1.5)
        c.text(100, y + 3.5, a, size=10, weight="700", fill=INK, anchor="middle", mono=True)
        c.circle(264, y, 9, fill="#ffffff", stroke=TEAL if b == "B" else AMBER, sw=1.5)
        c.text(264, y + 3.5, b, size=10, weight="700", fill=INK, anchor="middle", mono=True)
        c.text(344, y + 4, tag, size=9.2, weight="700", fill=tcol, anchor="end")
    c.text(196, 168, "×", size=15, weight="700", fill=ROSE, anchor="middle")
    c.multiline(195, 256, [
        "One crossover involves only 2 of 4 chromatids",
        "→ even 100% crossover frequency yields 50% RF.",
        "1 cM ≈ 1% RF (valid only at short distances < 15 cM).",
    ], size=10.2, lh=16, fill=SOFT, anchor="middle")

    # Right: Haldane mapping function RF = 0.5 * (1 - exp(-2d))
    c.panel_box(386, 72, 350, 274, "Haldane map function: RF = ½(1 − e⁻²ᵈ)")
    x0, y0, pw, ph = 442, 286, 266, 164
    c.axes(x0, y0, pw, ph, xlabel="Genetic distance d (centiMorgans)", ylabel="Recomb. freq.",
           xticks=[(0, "0"), (0.25, "50"), (0.5, "100"), (0.75, "150"), (1, "200")],
           yticks=[(0, "0%"), (0.5, "25%"), (1.0, "50%")])
    # 50% asymptote
    c.line(x0, y0 - ph, x0 + pw, y0 - ph, stroke=ROSE, sw=1.4, dash="4,3")
    # Linear approximation tangent d=RF (slope 1 up to 50 cM)
    c.line(x0, y0, x0 + 0.25 * pw, y0 - ph, stroke=FAINT, sw=1.4, dash="3,3")
    c.text(x0 + 62, y0 - ph + 14, "Linear (RF ≈ d)", size=9.5, fill=FAINT)
    # Haldane curve
    pts = []
    for k in range(80):
        cm = 200.0 * k / 79
        d = cm / 100.0
        rf = 0.5 * (1.0 - math.exp(-2.0 * d))
        pts.append((x0 + (cm / 200.0) * pw, y0 - (rf / 0.5) * ph))
    c.polyline(pts, stroke=TEAL, sw=2.6)
    c.text(x0 + 178, y0 - ph + 30, "50% ceiling", size=10, weight="700", fill=ROSE_DK)
    c.save(out / "fig-14-linkage-mapping.svg")


def fig_15(out: Path):
    c = Canvas(760, 385, "Pedigree notation and the five classical inheritance signatures",
               "Rule out modes systematically by checking vertical transmission, father-to-son links, and affected-to-all-children ratios")
    # Legend bar
    c.rect(24, 68, 712, 34, fill=PANEL, stroke=RULE_LT, rx=6)
    c.rect(40, 77, 16, 16, fill="#ffffff", stroke=INK, sw=1.5, rx=2)
    c.text(64, 89, "Male", size=10.5, fill=INK)
    c.circle(122, 85, 8, fill="#ffffff", stroke=INK, sw=1.5)
    c.text(138, 89, "Female", size=10.5, fill=INK)
    c.rect(202, 77, 16, 16, fill=INK, stroke=INK, sw=1.5, rx=2)
    c.text(226, 89, "Affected", size=10.5, fill=INK)
    c.circle(298, 85, 8, fill="#ffffff", stroke=INK, sw=1.5)
    c.circle(298, 85, 3, fill=INK)
    c.text(314, 89, "Carrier", size=10.5, fill=INK)
    c.line(376, 85, 404, 85, stroke=INK, sw=1.5)
    c.text(412, 89, "Mating", size=10.5, fill=INK)
    c.line(472, 83, 500, 83, stroke=INK, sw=1.4)
    c.line(472, 87, 500, 87, stroke=INK, sw=1.4)
    c.text(508, 89, "Consanguineous (AR clue)", size=10.5, fill=AMBER, weight="600")

    def mini_ped(x, y, w, title, col, bg, p1, p2, kids, rule):
        c.rect(x, y, w, 122, fill=bg, stroke=col, sw=1.3, rx=8)
        c.text(x + w / 2, y + 18, title, size=11, weight="700", fill=col, anchor="middle")
        # Parents
        px1, px2, py = x + w / 2 - 26, x + w / 2 + 26, y + 40
        c.line(px1 + 9, py, px2 - 9, py, stroke=INK, sw=1.4)
        for px, shape, filled, carrier in [(px1, *p1), (px2, *p2)]:
            f = INK if filled else "#ffffff"
            if shape == "M":
                c.rect(px - 8, py - 8, 16, 16, fill=f, stroke=INK, sw=1.4, rx=2)
            else:
                c.circle(px, py, 8, fill=f, stroke=INK, sw=1.4)
            if carrier and not filled:
                c.circle(px, py, 3, fill=INK)
        # Drop line to kids
        mid = x + w / 2
        c.line(mid, py, mid, py + 18, stroke=INK, sw=1.3)
        kx_list = [mid - 34, mid, mid + 34]
        c.line(kx_list[0], py + 18, kx_list[-1], py + 18, stroke=INK, sw=1.3)
        for kx, (shape, filled, carrier) in zip(kx_list, kids):
            c.line(kx, py + 18, kx, py + 28, stroke=INK, sw=1.3)
            ky = py + 36
            f = INK if filled else "#ffffff"
            if shape == "M":
                c.rect(kx - 7, ky - 7, 14, 14, fill=f, stroke=INK, sw=1.4, rx=2)
            else:
                c.circle(kx, ky, 7, fill=f, stroke=INK, sw=1.4)
            if carrier and not filled:
                c.circle(kx, ky, 2.5, fill=INK)
        c.text(x + w / 2, y + 108, rule, size=9.5, weight="600", fill=SOFT, anchor="middle")

    mini_ped(24, 114, 226, "Autosomal Dominant", TEAL, TEAL_BG,
             ("M", True, False), ("F", False, False),
             [("M", True, False), ("F", False, False), ("F", True, False)],
             "Every gen · male-to-male OK")
    mini_ped(267, 114, 226, "Autosomal Recessive", AMBER, AMBER_BG,
             ("M", False, True), ("F", False, True),
             [("M", False, False), ("F", True, False), ("M", False, True)],
             "Skips gens · unaffected parents")
    mini_ped(510, 114, 226, "X-Linked Recessive", BLUE, BLUE_BG,
             ("M", False, False), ("F", False, True),
             [("M", True, False), ("F", False, True), ("M", False, False)],
             "Mostly males · no father→son")
    mini_ped(136, 250, 232, "X-Linked Dominant", PURPLE, PURPLE_BG,
             ("M", True, False), ("F", False, False),
             [("F", True, False), ("F", True, False), ("M", False, False)],
             "Affected dad → 100% daughters, 0% sons")
    mini_ped(392, 250, 232, "Mitochondrial (mtDNA)", ROSE, ROSE_BG,
             ("M", False, False), ("F", True, False),
             [("M", True, False), ("F", True, False), ("M", True, False)],
             "Affected mom → 100% kids; dads → 0%")
    c.save(out / "fig-15-pedigree-modes.svg")


def build_all(out: Path):
    for fn in [fig_00, fig_01, fig_02, fig_03, fig_04, fig_05, fig_06, fig_07,
               fig_08, fig_09, fig_10, fig_11, fig_12, fig_13, fig_14, fig_15]:
        fn(out)
    print("Generated 16 SVGs for Parts 0–2 (Ch 00–15)")


if __name__ == "__main__":
    build_all(Path(__file__).resolve().parents[2] / "figures")
