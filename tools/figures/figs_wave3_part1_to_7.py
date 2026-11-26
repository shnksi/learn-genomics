"""Wave 3 precision SVG diagrams — Parts 1–7 (12 deep visual-gap figures)."""
from __future__ import annotations
import math
from pathlib import Path
from svg_kit import (
    Canvas, INK, SOFT, FAINT, RULE, RULE_LT, PANEL, SUNK,
    TEAL, TEAL_DK, TEAL_BG, AMBER, AMBER_BG, BLUE, BLUE_DK, BLUE_BG,
    ROSE, ROSE_DK, ROSE_BG, PURPLE, PURPLE_BG, GREEN, GREEN_BG, DNA, DNA_BG,
)


def fig_04c(out: Path):
    c = Canvas(760, 365, "The end-replication problem and how telomerase solves it",
               "Removing the terminal lagging-strand RNA primer leaves an unfillable gap; telomerase extends the 3′ template using its own RNA")
    # Left: The problem (shortening)
    c.panel_box(24, 72, 344, 272, "Problem: linear ends shrink every S phase")
    # Parental + lagging primer at 5' end
    c.text(44, 112, "Parental 3′→5′", size=9.2, weight="700", fill=INK)
    c.line(44, 124, 342, 124, stroke=INK, sw=3.0)
    c.text(348, 127, "3′", size=9.5, weight="700", fill=INK, mono=True)
    # Newly synthesized lagging strand + terminal RNA primer (rose)
    c.line(44, 146, 274, 146, stroke=TEAL, sw=3.2)
    c.line(276, 146, 342, 146, stroke=ROSE, sw=4.2)
    c.text(309, 162, "Terminal primer", size=8.8, weight="700", fill=ROSE_DK, anchor="middle")
    c.arrow(194, 172, 194, 196, color="rose", sw=1.8)
    c.text(262, 188, "RNase H removes primer", size=8.8, fill=ROSE_DK)

    # Gap left unfilled
    c.line(44, 212, 342, 212, stroke=INK, sw=3.0)
    c.line(44, 234, 274, 234, stroke=TEAL, sw=3.2)
    c.rect(276, 224, 66, 20, fill=ROSE_BG, stroke=ROSE, sw=1.4, dash="3,2", rx=3)
    c.text(309, 238, "No 3′-OH!", size=8.8, weight="700", fill=ROSE_DK, anchor="middle")
    c.multiline(196, 276, [
        "No upstream 3′-OH exists to fill the 5′ gap.",
        "Somatic cells lose ~50–100 bp/division → Hayflick",
        "senescence; shelterin hides overhang from DSB repair!",
    ], size=9.3, lh=15, fill=SOFT, anchor="middle")

    # Right: Telomerase rescue
    c.panel_box(388, 72, 348, 272, "Solution: Telomerase (TERT + TERC RNA template)")
    # Extending 3' G-rich strand
    c.line(408, 134, 594, 134, stroke=INK, sw=3.0)
    c.line(594, 134, 694, 134, stroke=TEAL, sw=3.6)
    c.text(644, 122, "TTAGGG added →", size=9.2, weight="700", fill=TEAL_DK, anchor="middle", mono=True)
    # Telomerase oval + internal RNA template
    c.ellipse(602, 168, 92, 30, fill=AMBER_BG, stroke=AMBER, sw=1.8)
    c.text(602, 165, "TERC RNA: 3′-CAAUCCCAAUC-5′", size=8.8, weight="700", fill=AMBER, anchor="middle", mono=True)
    c.text(602, 181, "TERT reverse transcriptase", size=9, weight="600", fill=SOFT, anchor="middle")
    c.arrow(562, 204, 562, 226, color="teal", sw=1.8)
    c.text(642, 218, "Primase + Pol α refill", size=8.8, weight="700", fill=TEAL_DK)
    # Completed extended end
    c.line(408, 240, 694, 240, stroke=TEAL, sw=3.2)
    c.line(408, 260, 650, 260, stroke=BLUE, sw=3.2)
    c.text(562, 286, "Active in germline, stem cells & ~85% of cancers.", size=9.5, weight="700", fill=TEAL_DK, anchor="middle")
    c.text(562, 304, "Telomerase is a ribonucleoprotein carrying its own template!", size=9.2, fill=SOFT, anchor="middle")
    c.save(out / "fig-04c-telomere-end-replication.svg")


def fig_09c(out: Path):
    c = Canvas(760, 365, "The eukaryotic cell cycle: a state machine guarded by checkpoints",
               "Cyclin–CDK waves drive irreversible transitions; three hard checkpoints halt division if DNA is damaged or spindles fail")
    cx, cy, r = 205, 208, 92
    # Main cycle ring + phase arcs
    c.circle(cx, cy, r, fill="none", stroke=RULE, sw=16)
    # G1 (top-right to bottom-right), S (bottom), G2 (left), M (top)
    c.path(f"M {cx+20} {cy-90} A {r} {r} 0 0 1 {cx+56} {cy+73}", stroke=TEAL, sw=14)
    c.path(f"M {cx+56} {cy+73} A {r} {r} 0 0 1 {cx-78} {cy+48}", stroke=BLUE, sw=14)
    c.path(f"M {cx-78} {cy+48} A {r} {r} 0 0 1 {cx-42} {cy-82}", stroke=AMBER, sw=14)
    c.path(f"M {cx-42} {cy-82} A {r} {r} 0 0 1 {cx+20} {cy-90}", stroke=ROSE, sw=14)

    # Phase labels inside/outside ring
    c.text(cx + 62, cy - 10, "G1", size=12, weight="700", fill=TEAL_DK, anchor="middle")
    c.text(cx + 62, cy + 4, "Growth", size=8.8, fill=SOFT, anchor="middle")
    c.text(cx - 10, cy + 68, "S", size=12, weight="700", fill=BLUE_DK, anchor="middle")
    c.text(cx - 10, cy + 81, "DNA copy", size=8.8, fill=SOFT, anchor="middle")
    c.text(cx - 66, cy - 14, "G2", size=12, weight="700", fill=AMBER, anchor="middle")
    c.text(cx - 66, cy, "Prep", size=8.8, fill=SOFT, anchor="middle")
    c.text(cx - 10, cy - 64, "M", size=12, weight="700", fill=ROSE_DK, anchor="middle")
    c.text(cx - 10, cy - 51, "Mitosis", size=8.8, fill=SOFT, anchor="middle")

    # G0 exit branch
    c.path(f"M {cx+94} {cy-36} Q {cx+138} {cy-58}, {cx+138} {cy-94}", stroke=PURPLE, sw=2.4, marker="arr-purple")
    c.pill(cx + 102, cy - 122, 74, 24, "G0 (quiescent)", fill=PURPLE_BG, stroke=PURPLE, text_fill=PURPLE, size=8.8)

    # 3 Checkpoint stop signs on the ring
    gates = [
        (cx + 66, cy + 64, "1", ROSE),
        (cx - 56, cy - 72, "2", AMBER),
        (cx + 12, cy - 92, "3", PURPLE),
    ]
    for gx, gy, num, col in gates:
        c.circle(gx, gy, 11, fill="#ffffff", stroke=col, sw=2.2)
        c.text(gx, gy + 4, num, size=10, weight="700", fill=col, anchor="middle")

    # Right: The 3 checkpoints explained
    c.panel_box(384, 72, 352, 272, "Three hard checkpoint guards (cancer breaks these!)")
    cards = [
        (106, "1. G1/S Restriction Point (RB / p53 / p21)", ROSE, ROSE_BG, [
            "Checks growth signals & intact DNA before S phase.",
            "p53 halts via p21; RB loss unlocks permanent division!",
        ]),
        (184, "2. G2/M DNA-Damage Checkpoint (ATM / ATR)", AMBER, AMBER_BG, [
            "Verifies replication finished cleanly with zero DSBs.",
            "Blocks CDK1–Cyclin B until repair completes.",
        ]),
        (262, "3. Spindle Assembly Checkpoint (SAC in M)", PURPLE, PURPLE_BG, [
            "Blocks Anaphase until EVERY kinetochore has tension.",
            "Failure → chromosome mis-segregation & aneuploidy!",
        ]),
    ]
    for y, title, col, bg, lines in cards:
        c.box(400, y, 320, 68, title, lines, fill=bg, stroke=col, title_fill=col, title_size=10, body_size=9.3)
    c.save(out / "fig-09c-cell-cycle-checkpoints.svg")


def fig_15b(out: Path):
    c = Canvas(760, 355, "Consanguinity and computing the inbreeding coefficient F by path counting",
               "First-cousin marriage creates two closed loops through shared grandparents: F = Σ (½)ⁿ = (½)⁵ + (½)⁵ = 1/16")
    # Left: First-cousin pedigree with highlighted loop
    c.panel_box(24, 72, 360, 264, "First-cousin pedigree loop (shared ancestors A₁, A₂)")
    # Gen I: Grandparents A1 (square) & A2 (circle)
    c.rect(144, 108, 24, 24, fill=TEAL_BG, stroke=TEAL, sw=2, rx=3)
    c.text(156, 124, "A₁", size=9.5, weight="700", fill=TEAL_DK, anchor="middle")
    c.circle(236, 120, 12, fill=AMBER_BG, stroke=AMBER, sw=2)
    c.text(236, 124, "A₂", size=9.5, weight="700", fill=AMBER, anchor="middle")
    c.line(168, 120, 224, 120, stroke=INK, sw=1.8)
    c.line(196, 120, 196, 148, stroke=INK, sw=1.8)
    c.line(130, 148, 262, 148, stroke=TEAL, sw=2.4)
    # Gen II: Siblings (B1, B2) + spouses
    c.line(130, 148, 130, 168, stroke=TEAL, sw=2.4)
    c.line(262, 148, 262, 168, stroke=TEAL, sw=2.4)
    c.rect(118, 168, 24, 24, fill=TEAL_BG, stroke=TEAL, sw=2, rx=3)
    c.text(130, 184, "B₁", size=9.5, weight="700", fill=TEAL_DK, anchor="middle")
    c.circle(262, 180, 12, fill=TEAL_BG, stroke=TEAL, sw=2)
    c.text(262, 184, "B₂", size=9.5, weight="700", fill=TEAL_DK, anchor="middle")
    # Spouses (faint)
    c.circle(72, 180, 11, fill="#ffffff", stroke=RULE, sw=1.5)
    c.line(83, 180, 118, 180, stroke=RULE, sw=1.5)
    c.rect(310, 169, 22, 22, fill="#ffffff", stroke=RULE, sw=1.5, rx=3)
    c.line(274, 180, 310, 180, stroke=RULE, sw=1.5)

    # Gen III: First cousins C1 & C2 (double marriage bar!)
    c.line(130, 192, 130, 224, stroke=TEAL, sw=2.4)
    c.line(262, 192, 262, 224, stroke=TEAL, sw=2.4)
    c.rect(118, 224, 24, 24, fill=BLUE_BG, stroke=BLUE, sw=2, rx=3)
    c.text(130, 240, "C₁", size=9.5, weight="700", fill=BLUE_DK, anchor="middle")
    c.circle(262, 236, 12, fill=BLUE_BG, stroke=BLUE, sw=2)
    c.text(262, 240, "C₂", size=9.5, weight="700", fill=BLUE_DK, anchor="middle")
    # Consanguinity double bar
    c.line(142, 233, 250, 233, stroke=ROSE, sw=2.0)
    c.line(142, 239, 250, 239, stroke=ROSE, sw=2.0)
    c.text(196, 227, "Consanguineous", size=8.5, weight="700", fill=ROSE_DK, anchor="middle")

    # Gen IV: Offspring I
    c.line(196, 239, 196, 274, stroke=ROSE, sw=2.4)
    c.circle(196, 288, 14, fill=ROSE_BG, stroke=ROSE, sw=2.2)
    c.text(196, 292, "I", size=11, weight="700", fill=ROSE_DK, anchor="middle")
    c.text(196, 322, "Loop: C₁ — B₁ — A₁ — B₂ — C₂ (5 nodes!)", size=9.5, weight="700", fill=TEAL_DK, anchor="middle")

    # Right: Path-counting calculation & recessive risk boost
    c.panel_box(402, 72, 334, 264, "Path formula: F = Σ (½)ⁿ (n = individuals in loop)")
    c.box(418, 108, 302, 106, "Step-by-step for first cousins", [
        "1. Loop via A₁: C₁ → B₁ → A₁ → B₂ → C₂ (n = 5)",
        "   Contribution = (½)⁵ = 1/32",
        "2. Loop via A₂: C₁ → B₁ → A₂ → B₂ → C₂ (n = 5)",
        "   Contribution = (½)⁵ = 1/32",
        "Total F = 1/32 + 1/32 = 1/16 = 6.25% IBD!",
    ], fill=TEAL_BG, stroke=TEAL, title_fill=TEAL_DK, title_size=10.5, body_size=9.3)

    c.box(418, 228, 302, 96, "Why rare recessive risk jumps dramatically", [
        "Homozygote risk = q²(1−F) + qF.",
        "For q = 0.001 (1 in 1,000 allele):",
        "Unrelated: q² = 1 in 1,000,000",
        "First cousins: ≈ q/16 = 1 in 16,000 (63× higher!)",
    ], fill=AMBER_BG, stroke=AMBER, title_fill=AMBER, title_size=10, body_size=9.3)
    c.save(out / "fig-15b-consanguinity-inbreeding.svg")


def fig_17c(out: Path):
    c = Canvas(760, 360, "Base Excision Repair (BER) vs. Nucleotide Excision Repair (NER)",
               "BER flips out single damaged bases one at a time; NER recognises bulky helix distortions and excises a ~25–30 nt patch")
    # Left: BER (4 steps)
    c.panel_box(24, 72, 348, 268, "BER — small non-distorting base lesions (U, 8-oxoG)")
    ber_steps = [
        (106, "1. DNA Glycosylase (e.g. UNG)", "Flips damaged base out & clips glycosidic bond → AP site", BLUE, BLUE_BG),
        (164, "2. AP Endonuclease (APE1)", "Nicks sugar-phosphate backbone at the abasic site", TEAL, TEAL_BG),
        (222, "3. DNA Pol β (short-patch)", "Removes sugar remnant & inserts 1 correct nucleotide", AMBER, AMBER_BG),
        (280, "4. DNA Ligase III / XRCC1", "Seals final nick → intact original sequence restored", PURPLE, PURPLE_BG),
    ]
    for y, t, d, col, bg in ber_steps:
        c.rect(40, y, 316, 46, fill=bg, stroke=col, sw=1.4, rx=7)
        c.text(52, y + 18, t, size=10, weight="700", fill=col)
        c.text(52, y + 35, d, size=9.1, fill=SOFT)

    # Right: NER (4 steps)
    c.panel_box(388, 72, 348, 268, "NER — bulky helix-distorting lesions (UV thymine dimers)")
    ner_steps = [
        (106, "1. Distortion sensor (XPC / stalled Pol II)", "Detects helix kink, NOT exact chemical identity of lesion", ROSE, ROSE_BG),
        (164, "2. TFIIH helicase (XPB / XPD)", "Unwinds ~25–30 bp open bubble around bulky adduct", AMBER, AMBER_BG),
        (222, "3. Dual endonucleases (XPF + XPG)", "Make TWO cuts flanking lesion → excise ~27 nt oligo", BLUE, BLUE_BG),
        (280, "4. DNA Pol δ/ε + Ligase I", "Refills 27 nt gap using intact strand; XP defect → UV cancer", TEAL, TEAL_BG),
    ]
    for y, t, d, col, bg in ner_steps:
        c.rect(404, y, 316, 46, fill=bg, stroke=col, sw=1.4, rx=7)
        c.text(416, y + 18, t, size=10, weight="700", fill=col)
        c.text(416, y + 35, d, size=9.1, fill=SOFT)
    c.save(out / "fig-17c-ber-vs-ner.svg")


def fig_18b(out: Path):
    c = Canvas(760, 355, "Non-Allelic Homologous Recombination (NAHR): homology in the wrong place",
               "Repeat orientation dictates the structural outcome: direct flanking repeats generate deletions/duplications; inverted repeats flip the segment")
    # Left: Direct repeats -> Deletion + Duplication
    c.panel_box(24, 72, 348, 264, "Direct segmental duplications (→ ... →) → Del + Dup")
    # Misaligned chromatids
    c.line(44, 128, 340, 128, stroke=INK, sw=2.6)
    c.rect(74, 118, 42, 20, fill=AMBER_BG, stroke=AMBER, sw=1.6, rx=3)
    c.text(95, 132, "SD →", size=8.8, weight="700", fill=AMBER, anchor="middle")
    c.rect(128, 118, 66, 20, fill=TEAL_BG, stroke=TEAL, sw=1.5, rx=3)
    c.text(161, 132, "Gene X", size=9, weight="700", fill=TEAL_DK, anchor="middle")
    c.rect(206, 118, 42, 20, fill=AMBER_BG, stroke=AMBER, sw=1.6, rx=3)
    c.text(227, 132, "SD →", size=8.8, weight="700", fill=AMBER, anchor="middle")

    # Lower shifted chromatid
    c.line(74, 174, 352, 174, stroke=INK, sw=2.6)
    c.rect(206, 164, 42, 20, fill=AMBER_BG, stroke=AMBER, sw=1.6, rx=3)
    c.text(227, 178, "SD →", size=8.8, weight="700", fill=AMBER, anchor="middle")
    c.rect(260, 164, 66, 20, fill=BLUE_BG, stroke=BLUE, sw=1.5, rx=3)
    c.text(293, 178, "Gene X", size=9, weight="700", fill=BLUE_DK, anchor="middle")

    # Crossover X between misaligned SDs
    c.line(220, 140, 234, 162, stroke=ROSE, sw=2.2)
    c.line(234, 140, 220, 162, stroke=ROSE, sw=2.2)
    c.arrow(198, 194, 198, 218, color="rose", sw=1.8)

    # Products
    c.rect(42, 226, 312, 42, fill=TEAL_BG, stroke=TEAL, sw=1.4, rx=6)
    c.text(198, 243, "Product 1: DUPLICATION (2 copies of Gene X)", size=9.6, weight="700", fill=TEAL_DK, anchor="middle")
    c.text(198, 259, "e.g. Charcot–Marie–Tooth 1A (PMP22 dup)", size=9, fill=SOFT, anchor="middle")
    c.rect(42, 278, 312, 42, fill=ROSE_BG, stroke=ROSE, sw=1.4, rx=6)
    c.text(198, 295, "Product 2: DELETION (0 copies of Gene X)", size=9.6, weight="700", fill=ROSE_DK, anchor="middle")
    c.text(198, 311, "e.g. 22q11.2 DiGeorge / HNPP deletion", size=9, fill=SOFT, anchor="middle")

    # Right: Inverted repeats -> Inversion
    c.panel_box(388, 72, 348, 264, "Inverted repeats (→ ... ←) → Intrachromosomal inversion")
    # Hairpin loop pairing SD -> with <- SD on same chromatid
    c.path("M 426 206 L 496 206 C 538 206, 538 118, 594 118 C 650 118, 650 206, 610 206 L 696 206", stroke=INK, sw=2.8)
    c.rect(504, 184, 46, 20, fill=AMBER_BG, stroke=AMBER, sw=1.6, rx=3)
    c.text(527, 198, "SD →", size=8.8, weight="700", fill=AMBER, anchor="middle")
    c.rect(584, 184, 46, 20, fill=AMBER_BG, stroke=AMBER, sw=1.6, rx=3)
    c.text(607, 198, "← SD", size=8.8, weight="700", fill=AMBER, anchor="middle")
    c.pill(550, 108, 86, 22, "A — B — C", fill=PURPLE_BG, stroke=PURPLE, text_fill=PURPLE, size=9.2, mono=True)
    c.line(554, 190, 580, 198, stroke=ROSE, sw=2)
    c.line(554, 198, 580, 190, stroke=ROSE, sw=2)

    c.arrow(562, 218, 562, 242, color="purple", sw=1.8)
    c.rect(406, 250, 312, 68, fill=PURPLE_BG, stroke=PURPLE, sw=1.4, rx=6)
    c.multiline(562, 270, [
        "Product: BALANCED INVERSION (C — B — A)",
        "No DNA gained or lost — total copy number = 2,",
        "but breakpoints can split genes (e.g. Factor VIII in haemophilia A)!",
    ], size=9.3, lh=15, fill=PURPLE, anchor="middle")
    c.save(out / "fig-18b-nahr-rearrangements.svg")


def fig_20b(out: Path):
    c = Canvas(760, 365, "Meiotic pairing geometries of inversions and reciprocal translocations",
               "Heterozygotes must contort into inversion loops or cross-shaped quadrivalents to pair homologously — causing unbalanced gametes")
    # Left: Inversion loop
    c.panel_box(24, 72, 344, 272, "Inversion heterozygote: meiotic inversion loop")
    # Normal strand straight + loop
    c.path("M 48 164 L 136 164 C 136 106, 252 106, 252 164 L 340 164", stroke=TEAL, sw=3.2)
    c.path("M 48 182 L 146 182 C 146 124, 242 124, 242 182 L 340 182", stroke=AMBER, sw=3.2)
    c.text(72, 154, "A  B", size=9.5, weight="700", fill=TEAL_DK, mono=True)
    c.text(194, 114, "C — D — E (paired)", size=9, weight="700", fill=INK, anchor="middle", mono=True)
    c.text(308, 154, "F  G", size=9.5, weight="700", fill=TEAL_DK, mono=True)
    # Crossover inside loop
    c.circle(194, 134, 11, fill=ROSE_BG, stroke=ROSE, sw=1.6)
    c.text(194, 137.5, "✕", size=10, weight="700", fill=ROSE_DK, anchor="middle")

    c.box(40, 206, 312, 122, "Crossover inside an inversion loop is lethal to gametes", [
        "• Paracentric (centromere outside loop):",
        "  produces 1 dicentric bridge + 1 acentric fragment!",
        "• Pericentric (centromere inside loop):",
        "  produces chromatids with duplications + deletions.",
        "→ Inversions act as 'crossover suppressors' (supergenes).",
    ], fill=ROSE_BG, stroke=ROSE, title_fill=ROSE_DK, title_size=9.8, body_size=9.1)

    # Right: Reciprocal translocation quadrivalent cross
    c.panel_box(388, 72, 348, 272, "Reciprocal translocation: cross-shaped quadrivalent")
    cx, cy = 562, 166
    # 4 arms of the cross (Chr 1 teal, Chr 2 blue)
    c.line(cx - 82, cy - 8, cx - 8, cy - 8, stroke=TEAL, sw=4)
    c.line(cx - 8, cy - 8, cx - 8, cy - 54, stroke=TEAL, sw=4)
    c.line(cx + 8, cy - 54, cx + 8, cy - 8, stroke=TEAL, sw=4)
    c.line(cx + 8, cy - 8, cx + 82, cy - 8, stroke=BLUE, sw=4)
    c.line(cx - 82, cy + 8, cx - 8, cy + 8, stroke=TEAL, sw=4)
    c.line(cx - 8, cy + 8, cx - 8, cy + 54, stroke=BLUE, sw=4)
    c.line(cx + 8, cy + 54, cx + 8, cy + 8, stroke=BLUE, sw=4)
    c.line(cx + 8, cy + 8, cx + 82, cy + 8, stroke=BLUE, sw=4)
    c.text(cx - 92, cy + 3, "N1", size=9.2, weight="700", fill=TEAL_DK, anchor="end")
    c.text(cx + 92, cy + 3, "N2", size=9.2, weight="700", fill=BLUE_DK)
    c.text(cx, cy - 60, "T1", size=9.2, weight="700", fill=TEAL_DK, anchor="middle")
    c.text(cx, cy + 68, "T2", size=9.2, weight="700", fill=BLUE_DK, anchor="middle")

    c.box(404, 240, 316, 88, "Two main Meiosis I segregation modes", [
        "• Alternate (N1+N2 vs T1+T2): 100% balanced gametes!",
        "• Adjacent-1 (N1+T2 vs T1+N2): partial trisomy + monosomy",
        "  → recurrent miscarriage or congenital anomaly.",
    ], fill=BLUE_BG, stroke=BLUE, title_fill=BLUE_DK, title_size=10, body_size=9.2)
    c.save(out / "fig-20b-meiotic-rearrangements.svg")


def fig_20c(out: Path):
    c = Canvas(760, 355, "The maternal age effect: decades of cohesin decay in arrested oocytes",
               "Human oocytes lock in Prophase I before birth without replacing cohesin rings — driving exponential Trisomy 21 risk after age 35")
    # Left: Trisomy 21 incidence vs maternal age curve
    c.panel_box(24, 72, 360, 264, "Trisomy 21 live-birth risk vs. maternal age")
    x0, y0, pw, ph = 72, 274, 286, 156
    c.axes(x0, y0, pw, ph, xlabel="Maternal age (years)", ylabel="Risk (%)",
           xticks=[(0.0, "20"), (0.33, "30"), (0.67, "40"), (1.0, "45")],
           yticks=[(0.0, "0%"), (0.33, "1%"), (0.67, "2%"), (1.0, "3%")])
    # Exponential curve (20->0.06%, 30->0.11%, 35->0.28%, 40->1.0%, 45->3.0%)
    age_pts = [(20, 0.06), (25, 0.08), (30, 0.11), (33, 0.18), (35, 0.28),
               (37, 0.48), (39, 0.80), (41, 1.35), (43, 2.15), (45, 3.0)]
    pts = [(x0 + ((a - 20) / 25) * pw, y0 - (r / 3.0) * ph) for a, r in age_pts]
    c.polyline(pts, stroke=ROSE, sw=3.0)
    # Inflection marker at age 35
    x35 = x0 + (15 / 25) * pw
    c.line(x35, y0 - ph, x35, y0, stroke=AMBER, sw=1.4, dash="4,3")
    c.text(x35 - 4, y0 - ph + 14, "Age 35 (~1 in 350)", size=9, weight="700", fill=AMBER, anchor="end")
    c.text(x0 + pw - 6, y0 - 0.86 * ph, "Age 45 (~1 in 30)", size=9.2, weight="700", fill=ROSE_DK, anchor="end")
    c.text(206, 322, "~90% of Trisomy 21 originates in maternal Meiosis I.", size=9.4, weight="600", fill=SOFT, anchor="middle")

    # Right: Mechanistic timeline (fetal arrest -> cohesin loss)
    c.panel_box(402, 72, 334, 264, "Why oocytes age differently from sperm")
    c.box(418, 108, 302, 76, "Fetal life (in utero): cohesin loaded ONCE", [
        "All primary oocytes enter Prophase I, pair homologues,",
        "form chiasmata, and arrest in dictyate with cohesin rings.",
    ], fill=TEAL_BG, stroke=TEAL, title_fill=TEAL_DK, title_size=10, body_size=9.2)
    c.arrow(569, 186, 569, 206, color="amber", sw=1.8)
    c.text(650, 199, "20–45 years pass!", size=9, weight="700", fill=AMBER)

    c.box(418, 210, 302, 108, "Age 35–45: cohesin erosion → MI error", [
        "• No new cohesin is synthesised during arrest.",
        "• Rings gradually degrade → chiasmata slip off &",
        "  sister centromeres split prematurely (PSSC).",
        "• Contrast sperm: stem cells divide continuously",
        "  → paternal age raises de novo SNVs, not trisomy!",
    ], fill=ROSE_BG, stroke=ROSE, title_fill=ROSE_DK, title_size=10, body_size=9.1)
    c.save(out / "fig-20c-maternal-age-cohesin.svg")


def fig_20Ab(out: Path):
    c = Canvas(760, 355, "Hfr interrupted-mating conjugation: putting a time axis on a chromosome",
               "Transfer starts at oriT and proceeds linearly at ~45 kb/min — blending at fixed minutes maps E. coli gene order directly")
    # Left: Hfr transfer schematic
    c.panel_box(24, 72, 330, 264, "Hfr donor × F⁻ recipient (linear transfer from oriT)")
    # Donor circle
    c.circle(110, 178, 54, fill=TEAL_BG, stroke=TEAL, sw=2.6)
    c.text(110, 174, "Hfr donor", size=10, weight="700", fill=TEAL_DK, anchor="middle")
    c.text(110, 189, "(F integrated)", size=8.8, fill=SOFT, anchor="middle")
    # Pilus bridge & linear entering strand
    c.line(164, 178, 244, 178, stroke=AMBER, sw=3.6, marker="arr-amber")
    c.text(204, 166, "oriT →", size=9.2, weight="700", fill=AMBER, anchor="middle", mono=True)
    # Recipient circle
    c.circle(292, 178, 44, fill=BLUE_BG, stroke=BLUE, sw=2.2)
    c.text(292, 174, "F⁻", size=11, weight="700", fill=BLUE_DK, anchor="middle")
    c.text(292, 189, "recipient", size=8.8, fill=SOFT, anchor="middle")
    c.multiline(189, 266, [
        "Waring blender shears mating bridge at time t:",
        "earlier-entering genes recombine in more recipients.",
        "Complete E. coli chromosome = 100 minutes!",
    ], size=9.3, lh=15, fill=SOFT, anchor="middle")

    # Right: Time-of-entry curves
    c.panel_box(372, 72, 364, 264, "Interrupted-mating entry curves → genetic map (min)")
    x0, y0, pw, ph = 418, 274, 294, 154
    c.axes(x0, y0, pw, ph, xlabel="Time of mating before blending (minutes)", ylabel="% Recomb.",
           xticks=[(0.0, "0"), (0.33, "10"), (0.67, "20"), (1.0, "30")],
           yticks=[(0.0, "0"), (0.5, "50"), (1.0, "100")])
    genes = [
        (8, 0.90, TEAL, "azi (8m)"),
        (11, 0.72, BLUE, "ton (11m)"),
        (17, 0.50, AMBER, "lac (17m)"),
        (25, 0.28, PURPLE, "gal (25m)"),
    ]
    for t0, plat, col, lbl in genes:
        pts = [(x0 + (t0 / 30) * pw, y0)]
        for dt in range(1, 31 - t0):
            t = t0 + dt
            frac = plat * (1 - math.exp(-0.28 * dt))
            pts.append((x0 + (t / 30) * pw, y0 - frac * ph))
        c.polyline(pts, stroke=col, sw=2.4)
        c.text(x0 + (t0 / 30) * pw + 22, y0 - (plat + 0.03) * ph, lbl, size=8.8, weight="700", fill=col, mono=True)
    c.text(554, 322, "Map order read straight off x-intercepts: azi — ton — lac — gal", size=9.2, weight="700", fill=INK, anchor="middle")
    c.save(out / "fig-20Ab-hfr-time-of-entry.svg")


def fig_24b(out: Path):
    c = Canvas(760, 355, "CRISPR-Cas as bacterial adaptive immunity (the three natural stages)",
               "Long before genome editing, bacteria evolved CRISPR arrays as heritable molecular mugshots of past bacteriophage infections")
    stages = [
        (24, "1. Adaptation (Memory)", AMBER, AMBER_BG, [
            "Phage injects viral DNA.",
            "Cas1–Cas2 excises a ~30 bp",
            "protospacer next to a PAM",
            "and pastes it as a new",
            "spacer into the CRISPR array.",
        ]),
        (268, "2. Expression (Processing)", BLUE, BLUE_BG, [
            "The repeat–spacer array is",
            "transcribed as long pre-crRNA",
            "and cleaved into individual",
            "mature crRNAs (each carrying",
            "one viral spacer sequence).",
        ]),
        (512, "3. Interference (Defence)", TEAL, TEAL_BG, [
            "Mature crRNA loads into a",
            "Cas nuclease (e.g. Cas9).",
            "On re-infection, base-pairing",
            "+ PAM triggers lethal cleavage",
            "of the invading phage genome!",
        ]),
    ]
    for i, (x, title, col, bg, lines) in enumerate(stages):
        c.box(x, 76, 224, 152, title, lines, fill=bg, stroke=col, title_fill=col, title_size=10.8, body_size=9.5)
        if i < 2:
            c.arrow(x + 226, 152, x + 242, 152, color="ink", sw=2.0)

    # Bottom: CRISPR array anatomy schematic
    c.panel_box(24, 244, 712, 94, "Genomic CRISPR array: chronological archive of past infections (newest spacer at the leader end)")
    c.rect(44, 282, 86, 26, fill=PANEL, stroke=INK, sw=1.4, rx=4)
    c.text(87, 299, "Cas genes", size=9.5, weight="700", fill=INK, anchor="middle")
    c.rect(138, 282, 58, 26, fill=PURPLE_BG, stroke=PURPLE, sw=1.4, rx=4)
    c.text(167, 299, "Leader", size=9.2, weight="700", fill=PURPLE, anchor="middle")
    x = 204
    spacers = [("New", ROSE, ROSE_BG), ("Phage B", AMBER, AMBER_BG), ("Phage A", TEAL, TEAL_BG), ("Oldest", BLUE, BLUE_BG)]
    for lbl, col, bg in spacers:
        # Repeat diamond
        c.polygon([(x + 12, 282), (x + 24, 295), (x + 12, 308), (x, 295)], fill=INK, stroke=INK, sw=1)
        x += 28
        c.rect(x, 282, 84, 26, fill=bg, stroke=col, sw=1.5, rx=4)
        c.text(x + 42, 299, lbl, size=9.2, weight="700", fill=col, anchor="middle")
        x += 88
    c.polygon([(x + 12, 282), (x + 24, 295), (x + 12, 308), (x, 295)], fill=INK, stroke=INK, sw=1)
    c.text(460, 326, "Black diamonds = identical palindromic repeats  ·  Coloured blocks = unique viral spacers (no self-cleavage because array lacks PAM!)", size=8.8, fill=SOFT, anchor="middle")
    c.save(out / "fig-24b-crispr-bacterial-immunity.svg")


def fig_25Ab(out: Path):
    c = Canvas(760, 360, "Conditional knockouts with Cre-loxP: bypassing embryonic lethality",
               "Crossing a 'floxed' gene line with a tissue-specific or tamoxifen-inducible Cre line deletes the gene only in one organ or age")
    # Top row: Two mouse lines crossed
    c.panel_box(24, 72, 344, 108, "Line 1: 'Floxed' target gene (normal everywhere)")
    c.line(48, 134, 344, 134, stroke=INK, sw=2.6)
    c.rect(64, 122, 46, 24, fill=TEAL_BG, stroke=TEAL, sw=1.5, rx=4)
    c.text(87, 138, "Ex 1", size=9, weight="700", fill=TEAL_DK, anchor="middle")
    # loxP triangles flanking Exon 2
    c.polygon([(126, 124), (126, 144), (144, 134)], fill=ROSE, stroke=ROSE, sw=1)
    c.rect(152, 120, 74, 28, fill=AMBER_BG, stroke=AMBER, sw=1.8, rx=4)
    c.text(189, 138, "Exon 2", size=9.5, weight="700", fill=AMBER, anchor="middle")
    c.polygon([(234, 124), (234, 144), (252, 134)], fill=ROSE, stroke=ROSE, sw=1)
    c.rect(268, 122, 46, 24, fill=TEAL_BG, stroke=TEAL, sw=1.5, rx=4)
    c.text(291, 138, "Ex 3", size=9, weight="700", fill=TEAL_DK, anchor="middle")
    c.text(189, 166, "loxP sites sit in introns → normal mRNA splicing!", size=9, fill=SOFT, anchor="middle")

    c.panel_box(392, 72, 344, 108, "Line 2: Tissue-specific Cre driver (e.g. Pcp2-Cre)")
    c.line(416, 134, 712, 134, stroke=INK, sw=2.6)
    c.rect(438, 120, 126, 28, fill=BLUE_BG, stroke=BLUE, sw=1.6, rx=4)
    c.text(501, 138, "Purkinje promoter", size=9.5, weight="700", fill=BLUE_DK, anchor="middle")
    c.rect(574, 120, 114, 28, fill=PURPLE_BG, stroke=PURPLE, sw=1.8, rx=4)
    c.text(631, 138, "Cre (or CreERᵀ²)", size=9.5, weight="700", fill=PURPLE, anchor="middle")
    c.text(564, 166, "Cre expressed ONLY in cerebellar Purkinje cells (+ tamoxifen)", size=9, fill=SOFT, anchor="middle")

    # Arrows down to two tissue outcomes
    c.arrow(260, 184, 200, 212, color="teal", sw=1.8)
    c.arrow(500, 184, 560, 212, color="rose", sw=1.8)

    # Bottom left: Other organs (no Cre -> wild-type!)
    c.box(24, 216, 344, 124, "Heart, liver, embryo (Cre OFF → gene INTACT)", [
        "No Cre recombinase present.",
        "Exon 2 stays in place → normal protein made.",
        "Embryo survives to adulthood cleanly!",
    ], fill=TEAL_BG, stroke=TEAL, title_fill=TEAL_DK, title_size=10.5, body_size=9.6)

    # Bottom right: Target tissue (Cre ON -> Exon 2 excised!)
    c.box(392, 216, 344, 124, "Cerebellar Purkinje cells (Cre ON → KNOCKOUT!)", [
        "Cre recombines the two direct loxP sites,",
        "popping Exon 2 out as a circular DNA loop.",
        "Frameshift knockout ONLY in target neurons!",
    ], fill=ROSE_BG, stroke=ROSE, title_fill=ROSE_DK, title_size=10.5, body_size=9.6)
    c.save(out / "fig-25Ab-cre-lox-conditional.svg")


def fig_27b(out: Path):
    c = Canvas(760, 355, "Effective population size (Ne): why bottlenecks dominate via the harmonic mean",
               "A single bottleneck generation crushes Ne across decades — explaining low human genetic diversity despite 8 billion census size")
    # Left: Bottleneck census N vs harmonic mean Ne
    c.panel_box(24, 72, 412, 264, "Census size Nₜ across 6 generations (one bottleneck at gen 3)")
    bars = [
        ("G1", 10000, TEAL),
        ("G2", 10000, TEAL),
        ("G3", 50, ROSE),
        ("G4", 10000, TEAL),
        ("G5", 10000, TEAL),
        ("G6", 10000, TEAL),
    ]
    x0, y0, ph = 64, 264, 136
    c.line(52, y0, 416, y0, stroke=SOFT, sw=1.5)
    for i, (gen, val, col) in enumerate(bars):
        bx = x0 + i * 56
        bh = max(6, (val / 10000) * ph)
        c.rect(bx, y0 - bh, 36, bh, fill=ROSE_BG if val < 100 else TEAL_BG, stroke=col, sw=1.8, rx=4)
        c.text(bx + 18, y0 - bh - 6, f"{val:,}", size=8.5, weight="700", fill=col, anchor="middle", mono=True)
        c.text(bx + 18, y0 + 16, gen, size=9.5, weight="700", fill=INK, anchor="middle")
    # Harmonic mean line at 293 (near bottom!)
    ne_y = y0 - 16
    c.line(52, ne_y, 416, ne_y, stroke=AMBER, sw=2.0, dash="4,3")
    c.text(412, ne_y - 6, "Ne = 293 (NOT 8,342!)", size=9.5, weight="700", fill=AMBER, anchor="end")
    c.text(230, 314, "Arithmetic mean = 8,342  vs.  Harmonic mean Ne = 6 / (5/10⁴ + 1/50) = 293!", size=9.3, weight="700", fill=ROSE_DK, anchor="middle")

    # Right: Formulas & real human Ne
    c.panel_box(454, 72, 282, 264, "Three things that shrink Ne << N")
    c.box(468, 106, 254, 68, "1. Bottlenecks (harmonic mean)", [
        "1/Ne = (1/t) Σ (1/Nᵢ)",
        "Smallest Nᵢ dominates the sum!",
    ], fill=ROSE_BG, stroke=ROSE, title_fill=ROSE_DK, title_size=9.8, body_size=9.2)
    c.box(468, 184, 254, 68, "2. Skewed sex ratio", [
        "Ne = 4·Nm·Nf / (Nm + Nf)",
        "10 males + 1,000 females → Ne ≈ 40",
    ], fill=BLUE_BG, stroke=BLUE, title_fill=BLUE_DK, title_size=9.8, body_size=9.2)
    c.box(468, 262, 254, 62, "3. Human reality", [
        "Census N ≈ 8×10⁹, long-term Ne ≈ 10⁴",
        "(Out-of-Africa bottleneck memory!)",
    ], fill=TEAL_BG, stroke=TEAL, title_fill=TEAL_DK, title_size=9.8, body_size=9.1)
    c.save(out / "fig-27b-effective-pop-size.svg")


def fig_33b(out: Path):
    c = Canvas(760, 360, "Site Frequency Spectrum (SFS), Tajima's D, and selective sweeps",
               "Selection and demography leave distinct footprints in allele frequencies and local heterozygosity along a chromosome")
    # Top-left: Neutral SFS (1/i)
    def draw_sfs(x, y, w, h, title, vals, col, bg, note):
        c.panel_box(x, y, w, h, title)
        bx0, by0, bh = x + 22, y + h - 36, h - 76
        c.line(bx0 - 6, by0, x + w - 16, by0, stroke=SOFT, sw=1.3)
        bw = (w - 46) / len(vals)
        for i, v in enumerate(vals):
            hh = v * bh
            c.rect(bx0 + i * bw, by0 - hh, bw - 5, hh, fill=bg, stroke=col, sw=1.4, rx=3)
        c.text(x + w / 2, y + h - 14, note, size=9, weight="700", fill=col, anchor="middle")

    draw_sfs(24, 72, 224, 148, "Neutral (Tajima's D ≈ 0)", [0.95, 0.48, 0.32, 0.24, 0.19, 0.16], TEAL, TEAL_BG, "1/i singleton decay")
    draw_sfs(268, 72, 224, 148, "Sweep / Growth (D < 0)", [1.0, 0.20, 0.10, 0.06, 0.04, 0.03], ROSE, ROSE_BG, "Excess rare singletons!")
    draw_sfs(512, 72, 224, 148, "Balancing / Bottleneck (D > 0)", [0.32, 0.42, 0.72, 0.76, 0.45, 0.30], BLUE, BLUE_BG, "Excess intermediate alleles")

    # Bottom: Selective sweep trough in nucleotide diversity pi
    c.panel_box(24, 232, 712, 114, "Genetic hitchhiking: a hard selective sweep carves a trough of zero diversity around the selected site")
    x0, y0, pw, ph = 64, 326, 636, 56
    c.line(x0, y0, x0 + pw, y0, stroke=SOFT, sw=1.3)
    c.line(x0, y0 - ph, x0, y0, stroke=SOFT, sw=1.3)
    c.text(44, y0 - ph / 2, "π", size=11, weight="700", fill=INK, anchor="middle")
    pts = []
    for k in range(101):
        u = (k - 50) / 50.0  # -1 to 1
        # Deep V/U trough at center u=0
        pi = 0.88 * (1 - 0.94 * math.exp(-16 * u * u))
        pts.append((x0 + (k / 100) * pw, y0 - pi * ph))
    c.polyline(pts, stroke=TEAL, sw=2.8)
    c.circle(x0 + pw / 2, y0 - 0.05 * ph, 5.5, fill=ROSE)
    c.text(x0 + pw / 2, y0 - 0.72 * ph, "Beneficial mutation sweeps → drags linked neutral variants to fixation", size=9.5, weight="700", fill=ROSE_DK, anchor="middle")
    c.text(x0 + 70, y0 - 0.96 * ph, "Normal background π", size=8.8, fill=TEAL_DK)
    c.text(x0 + pw - 10, y0 + 13, "Genomic position (recombination restores π away from sweep)", size=8.8, fill=FAINT, anchor="end")
    c.save(out / "fig-33b-sfs-sweeps-tajima.svg")


def build_all(out: Path):
    for fn in [fig_04c, fig_09c, fig_15b, fig_17c, fig_18b, fig_20b,
               fig_20c, fig_20Ab, fig_24b, fig_25Ab, fig_27b, fig_33b]:
        fn(out)
    print("Generated 12 Wave-3 SVGs for Parts 1–7")
