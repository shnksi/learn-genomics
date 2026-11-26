"""Wave 4 side-by-side contrast SVG diagrams for learn-genomics (11 A-vs-B comparison figures)."""
from __future__ import annotations
import math
from pathlib import Path
from svg_kit import (
    Canvas, INK, SOFT, FAINT, RULE, RULE_LT, PANEL, SUNK,
    TEAL, TEAL_DK, TEAL_BG, AMBER, AMBER_BG, BLUE, BLUE_DK, BLUE_BG,
    ROSE, ROSE_DK, ROSE_BG, PURPLE, PURPLE_BG, GREEN, GREEN_BG, normal_pdf,
)


def fig_05c(out: Path):
    c = Canvas(760, 345, "The three eukaryotic RNA polymerases: division of labour",
               "Unlike bacteria (one core RNA Pol), eukaryotes split rRNA, mRNA, and tRNA across three dedicated enzymes")
    pols = [
        (24, "RNA Pol I", BLUE, BLUE_BG, "Location: Nucleolus", [
            "Transcribes: 45S pre-rRNA",
            "(processed into 28S, 18S, 5.8S)",
            "",
            "~50–70% of all cellular RNA",
            "synthesis by mass!",
            "No CTD tail · no capping",
        ]),
        (268, "RNA Pol II", TEAL, TEAL_BG, "Location: Nucleoplasm", [
            "Transcribes: ALL protein-coding",
            "mRNAs + miRNAs, lncRNAs, snRNAs",
            "",
            "Carries long phosphorylated CTD",
            "tail coordinating 5′ cap, splicing,",
            "and 3′ polyadenylation!",
        ]),
        (512, "RNA Pol III", AMBER, AMBER_BG, "Location: Nucleoplasm", [
            "Transcribes: tRNAs, 5S rRNA,",
            "U6 snRNA, 7SL RNA, Alu repeats",
            "",
            "Short structured RNAs;",
            "often uses INTERNAL promoters",
            "(downstream of +1 TSS!)",
        ]),
    ]
    for x, title, col, bg, loc, lines in pols:
        c.rect(x, 76, 224, 246, fill=bg, stroke=col, sw=1.6, rx=10)
        c.text(x + 112, 102, title, size=13, weight="700", fill=col, anchor="middle")
        c.pill(x + 28, 114, 168, 22, loc, fill="#ffffff", stroke=col, text_fill=INK, size=9)
        c.multiline(x + 112, 158, lines, size=9.6, lh=16, fill=SOFT, anchor="middle")
    c.save(out / "fig-05c-three-polymerases.svg")


def fig_09d(out: Path):
    c = Canvas(760, 360, "Nondisjunction in Meiosis I vs. Meiosis II: distinct gamete outcomes",
               "MI failure corrupts 100% of gametes (carrying both homologues); MII failure corrupts 50% (carrying identical sister chromatids)")
    # Left: Meiosis I nondisjunction
    c.panel_box(24, 72, 346, 268, "Meiosis I Nondisjunction (homologues fail to separate)")
    c.pill(122, 104, 150, 24, "Homologues (A / a) stuck!", fill=ROSE_BG, stroke=ROSE, text_fill=ROSE_DK, size=9.2)
    c.arrow(168, 130, 120, 158, color="rose", sw=1.8)
    c.arrow(226, 130, 274, 158, color="ink", sw=1.8)
    c.rect(58, 162, 124, 34, fill=ROSE_BG, stroke=ROSE, sw=1.5, rx=6)
    c.text(120, 183, "Both homologues (n+1)", size=9, weight="700", fill=ROSE_DK, anchor="middle")
    c.rect(212, 162, 124, 34, fill=PANEL, stroke=RULE, sw=1.5, rx=6)
    c.text(274, 183, "Empty (n−1)", size=9, weight="700", fill=FAINT, anchor="middle")
    # 4 gametes
    g1 = [(68, "n+1", "A + a", ROSE, ROSE_BG), (144, "n+1", "A + a", ROSE, ROSE_BG),
          (224, "n−1", "0", SOFT, PANEL), (300, "n−1", "0", SOFT, PANEL)]
    for gx, pl, al, col, bg in g1:
        c.circle(gx, 246, 24, fill=bg, stroke=col, sw=1.8)
        c.text(gx, 244, pl, size=10, weight="700", fill=col, anchor="middle", mono=True)
        c.text(gx, 258, al, size=8.5, fill=SOFT, anchor="middle", mono=True)
    c.text(196, 298, "100% abnormal gametes (2 trisomic + 2 monosomic)", size=9.5, weight="700", fill=ROSE_DK, anchor="middle")
    c.text(196, 316, "Trisomic gamete is heterozygous at centromere (both homologues!).", size=8.8, fill=SOFT, anchor="middle")

    # Right: Meiosis II nondisjunction
    c.panel_box(390, 72, 346, 268, "Meiosis II Nondisjunction (sister chromatids stick)")
    c.pill(488, 104, 150, 24, "MI succeeds cleanly (A | a)", fill=TEAL_BG, stroke=TEAL, text_fill=TEAL_DK, size=9.2)
    c.arrow(534, 130, 486, 158, color="teal", sw=1.8)
    c.arrow(592, 130, 640, 158, color="amber", sw=1.8)
    c.rect(424, 162, 124, 34, fill=TEAL_BG, stroke=TEAL, sw=1.5, rx=6)
    c.text(486, 183, "Normal MII (A | A)", size=9, weight="700", fill=TEAL_DK, anchor="middle")
    c.rect(578, 162, 124, 34, fill=AMBER_BG, stroke=AMBER, sw=1.5, rx=6)
    c.text(640, 183, "Sisters stuck (a+a | 0)", size=9, weight="700", fill=AMBER, anchor="middle")
    g2 = [(434, "n", "A", TEAL, TEAL_BG), (510, "n", "A", TEAL, TEAL_BG),
          (590, "n+1", "a + a", AMBER, AMBER_BG), (666, "n−1", "0", SOFT, PANEL)]
    for gx, pl, al, col, bg in g2:
        c.circle(gx, 246, 24, fill=bg, stroke=col, sw=1.8)
        c.text(gx, 244, pl, size=10, weight="700", fill=col, anchor="middle", mono=True)
        c.text(gx, 258, al, size=8.5, fill=SOFT, anchor="middle", mono=True)
    c.text(563, 298, "50% normal (n) · 25% trisomic (n+1) · 25% monosomic (n−1)", size=9.2, weight="700", fill=TEAL_DK, anchor="middle")
    c.text(563, 316, "Trisomic gamete carries identical sister alleles near centromere!", size=8.8, fill=SOFT, anchor="middle")
    c.save(out / "fig-09d-nondisjunction-mi-vs-mii.svg")


def fig_11c(out: Path):
    c = Canvas(760, 345, "Incomplete dominance vs. codominance: blending dosage vs. dual expression",
               "Both yield 1:2:1 F₂ phenotypic ratios, but the heterozygote looks completely different at the molecular level")
    # Left: Incomplete dominance (Red x White -> Pink)
    c.panel_box(24, 72, 346, 254, "Incomplete dominance (dosage blending)")
    c.circle(86, 152, 28, fill=ROSE, stroke=ROSE_DK, sw=2)
    c.text(86, 156, "CᴿCᴿ", size=10, weight="700", fill="#ffffff", anchor="middle", mono=True)
    c.text(86, 196, "2× pigment", size=9, fill=ROSE_DK, anchor="middle")

    c.circle(196, 152, 28, fill="#f9a8d4", stroke=ROSE, sw=2)
    c.text(196, 156, "CᴿCᵂ", size=10, weight="700", fill=ROSE_DK, anchor="middle", mono=True)
    c.text(196, 196, "1× pigment (Pink)", size=9.2, weight="700", fill=ROSE_DK, anchor="middle")

    c.circle(306, 152, 28, fill="#ffffff", stroke=RULE, sw=2)
    c.text(306, 156, "CᵂCᵂ", size=10, weight="700", fill=SOFT, anchor="middle", mono=True)
    c.text(306, 196, "0× pigment", size=9, fill=FAINT, anchor="middle")

    c.multiline(196, 236, [
        "One functional copy makes half as much enzyme/product",
        "→ intermediate quantitative phenotype (neither allele masks).",
        "Example: snapdragon colour, familial hypercholesterolaemia (LDLR).",
    ], size=9.2, lh=16, fill=SOFT, anchor="middle")

    # Right: Codominance (Both antigens expressed fully!)
    c.panel_box(390, 72, 346, 254, "Codominance (both alleles expressed intact)")
    c.circle(452, 152, 28, fill=TEAL_BG, stroke=TEAL, sw=2)
    c.text(452, 156, "IᴬIᴬ", size=10, weight="700", fill=TEAL_DK, anchor="middle", mono=True)
    c.text(452, 196, "Type A only", size=9, fill=TEAL_DK, anchor="middle")

    # Split circle (half teal, half blue — NOT blended!)
    c.circle(562, 152, 28, fill=BLUE_BG, stroke=BLUE, sw=2)
    c.path("M 562 124 A 28 28 0 0 0 562 180 Z", fill=TEAL_BG, stroke=TEAL, sw=1.8)
    c.text(562, 156, "IᴬIᴮ", size=10, weight="700", fill=INK, anchor="middle", mono=True)
    c.text(562, 196, "BOTH A & B intact!", size=9.2, weight="700", fill=PURPLE, anchor="middle")

    c.circle(672, 152, 28, fill=BLUE_BG, stroke=BLUE, sw=2)
    c.text(672, 156, "IᴮIᴮ", size=10, weight="700", fill=BLUE_DK, anchor="middle", mono=True)
    c.text(672, 196, "Type B only", size=9, fill=BLUE_DK, anchor="middle")

    c.multiline(562, 236, [
        "Heterozygote expresses BOTH distinct gene products in full",
        "(zero intermediate blending — both signals detected simultaneously).",
        "Example: ABO blood group AB, HLA immune alleles, HbA/HbS bands.",
    ], size=9.2, lh=16, fill=SOFT, anchor="middle")
    c.save(out / "fig-11c-incomplete-vs-codominance.svg")


def fig_20d(out: Path):
    c = Canvas(760, 345, "Polyploidy vs. Aneuploidy: balanced whole-genome sets vs. single-chromosome imbalance",
               "Adding a full chromosome set keeps gene stoichiometry intact; adding or losing ONE chromosome breaks complex dosage ratios")
    def draw_karyo(x, title, col, bg, counts, note1, note2):
        c.panel_box(x, 72, 224, 254, title, fill=bg, stroke=col, header_fill=col)
        # 3 chromosome types (Chr 1 tall, Chr 2 med, Chr 3 short)
        hs = [72, 54, 38]
        cols = [TEAL, BLUE, AMBER]
        for ci, (cnt, ch, ccol) in enumerate(zip(counts, hs, cols)):
            gx = x + 32 + ci * 64
            for k in range(cnt):
                rx = gx + k * 12
                c.rect(rx, 192 - ch, 8, ch, fill=ccol, rx=4)
            c.text(gx + (cnt - 1) * 6 + 4, 210, f"Chr {ci+1}", size=8.5, weight="700", fill=SOFT, anchor="middle")
        c.multiline(x + 112, 242, [note1, note2], size=9.3, lh=16, fill=SOFT, anchor="middle")

    draw_karyo(24, "Normal Diploid (2n)", TEAL, TEAL_BG, [2, 2, 2],
               "Dosage ratio 1 : 1 : 1", "Baseline human genome (46)")
    draw_karyo(268, "Polyploid (3n Triploid)", BLUE, BLUE_BG, [3, 3, 3],
               "Dosage ratio STILL 1 : 1 : 1!", "Tolerated in plants (wheat, strawberry)")
    draw_karyo(512, "Aneuploid (2n+1 Trisomy)", ROSE, ROSE_BG, [2, 3, 2],
               "Broken ratio 1 : 1.5 : 1!", "Severe dosage stress (only T21/18/13 live)")
    c.save(out / "fig-20d-ploidy-vs-aneuploidy.svg")


def fig_25Ac(out: Path):
    c = Canvas(760, 355, "Two logics of development: lineage (autonomous) vs. position (conditional)",
               "Embryos build body plans either by inheriting cytoplasmic fate determinants along a fixed tree or by reading local signals")
    # Left: Autonomous / Lineage (C. elegans)
    c.panel_box(24, 72, 344, 264, "Autonomous / Lineage logic (e.g. C. elegans)")
    # Egg with asymmetric determinant crescent -> 2 cells (one inherits crescent!)
    c.circle(110, 146, 26, fill=PANEL, stroke=INK, sw=1.8)
    c.path("M 110 120 A 26 26 0 0 1 110 172 Z", fill=AMBER_BG, stroke=AMBER, sw=1.8)
    c.text(110, 188, "Asymmetric egg", size=8.8, weight="700", fill=AMBER, anchor="middle")
    c.arrow(140, 146, 178, 146, color="ink", sw=1.8)
    c.circle(216, 146, 22, fill=PANEL, stroke=INK, sw=1.8)
    c.text(216, 150, "A", size=10, weight="700", fill=INK, anchor="middle")
    c.circle(272, 146, 22, fill=AMBER_BG, stroke=AMBER, sw=2.0)
    c.text(272, 150, "B", size=10, weight="700", fill=AMBER, anchor="middle")
    c.text(244, 188, "Separate A & B → fixed fates", size=8.8, fill=SOFT, anchor="middle")
    c.box(40, 214, 312, 106, "Ablation test signature (mosaic development)", [
        "• Kill cell B → embryo lacks B's exact tissue!",
        "• Cell fate depends on WHO your mother was",
        "  (cytoplasmic determinants partitioned at mitosis).",
        "• Invariant cell lineage (959 somatic cells in C. elegans).",
    ], fill=AMBER_BG, stroke=AMBER, title_fill=AMBER, title_size=9.8, body_size=9.1)

    # Right: Conditional / Positional (Mammals / Vertebrates)
    c.panel_box(392, 72, 344, 264, "Conditional / Positional logic (e.g. Mammals)")
    # Identical 2-cell embryo split -> two complete twin embryos!
    c.circle(460, 146, 18, fill=TEAL_BG, stroke=TEAL, sw=1.8)
    c.circle(498, 146, 18, fill=TEAL_BG, stroke=TEAL, sw=1.8)
    c.text(479, 184, "Equivalent blastomeres", size=8.8, weight="700", fill=TEAL_DK, anchor="middle")
    c.arrow(524, 146, 566, 146, color="teal", sw=1.8)
    c.text(545, 136, "Split!", size=8.5, weight="700", fill=TEAL_DK, anchor="middle")
    c.circle(606, 146, 22, fill=TEAL_BG, stroke=TEAL, sw=2)
    c.text(606, 150, "Twin 1", size=9, weight="700", fill=TEAL_DK, anchor="middle")
    c.circle(674, 146, 22, fill=TEAL_BG, stroke=TEAL, sw=2)
    c.text(674, 150, "Twin 2", size=9, weight="700", fill=TEAL_DK, anchor="middle")
    c.text(640, 184, "Both regulate into full embryos!", size=8.8, fill=SOFT, anchor="middle")
    c.box(408, 214, 312, 106, "Regulation test signature (conditional fate)", [
        "• Remove 1 cell → neighbours compensate cleanly!",
        "• Cell fate depends on WHERE you sit (inside vs. outside",
        "  in blastocyst; morphogen signals from neighbours).",
        "• Explains identical (monozygotic) human twins!",
    ], fill=TEAL_BG, stroke=TEAL, title_fill=TEAL_DK, title_size=9.8, body_size=9.1)
    c.save(out / "fig-25Ac-lineage-vs-position.svg")


def fig_29b(out: Path):
    c = Canvas(760, 355, "Two LD normalisations: why D′ = 1 can still have tiny r²",
               "D′ asks whether historical recombination ever broke the pair; r² asks whether one SNP actually predicts the other in GWAS")
    # Left: Case A — D'=1, r2=1 (identical frequencies!)
    c.panel_box(24, 72, 346, 264, "Case 1: Matched allele frequencies → |D′| = 1 AND r² = 1")
    # 2x2 haplotype grid
    c.text(136, 114, "B (0.5)", size=9.5, weight="700", fill=BLUE_DK, anchor="middle", mono=True)
    c.text(236, 114, "b (0.5)", size=9.5, weight="700", fill=SOFT, anchor="middle", mono=True)
    c.text(72, 148, "A (0.5)", size=9.5, weight="700", fill=TEAL_DK, anchor="end", mono=True)
    c.text(72, 198, "a (0.5)", size=9.5, weight="700", fill=SOFT, anchor="end", mono=True)
    c.rect(94, 124, 84, 42, fill=TEAL_BG, stroke=TEAL, sw=1.8, rx=5)
    c.text(136, 150, "AB = 0.50", size=10, weight="700", fill=TEAL_DK, anchor="middle", mono=True)
    c.rect(194, 124, 84, 42, fill="#ffffff", stroke=RULE, sw=1.2, rx=5)
    c.text(236, 150, "Ab = 0", size=10, fill=FAINT, anchor="middle", mono=True)
    c.rect(94, 174, 84, 42, fill="#ffffff", stroke=RULE, sw=1.2, rx=5)
    c.text(136, 200, "aB = 0", size=10, fill=FAINT, anchor="middle", mono=True)
    c.rect(194, 174, 84, 42, fill=BLUE_BG, stroke=BLUE, sw=1.8, rx=5)
    c.text(236, 200, "ab = 0.50", size=10, weight="700", fill=BLUE_DK, anchor="middle", mono=True)
    c.multiline(196, 250, [
        "Only 2 haplotypes exist → perfect 1-to-1 proxy!",
        "Knowing SNP A predicts SNP B with 100% accuracy.",
        "GWAS sample size penalty = 1 / r² = 1× (zero loss).",
    ], size=9.3, lh=16, fill=SOFT, anchor="middle")

    # Right: Case B — Mismatched frequencies (rare mutation on common background) -> D'=1, r2=0.05!
    c.panel_box(390, 72, 346, 264, "Case 2: Rare SNP on common allele → |D′| = 1, r² = 0.05!")
    c.text(502, 114, "B (0.5)", size=9.5, weight="700", fill=BLUE_DK, anchor="middle", mono=True)
    c.text(602, 114, "b (0.5)", size=9.5, weight="700", fill=SOFT, anchor="middle", mono=True)
    c.text(438, 148, "A (0.05)", size=9.5, weight="700", fill=ROSE_DK, anchor="end", mono=True)
    c.text(438, 198, "a (0.95)", size=9.5, weight="700", fill=SOFT, anchor="end", mono=True)
    c.rect(460, 124, 84, 42, fill=ROSE_BG, stroke=ROSE, sw=1.8, rx=5)
    c.text(502, 150, "AB = 0.05", size=10, weight="700", fill=ROSE_DK, anchor="middle", mono=True)
    c.rect(560, 124, 84, 42, fill="#ffffff", stroke=ROSE, sw=1.5, dash="3,2", rx=5)
    c.text(602, 150, "Ab = 0!", size=10, weight="700", fill=ROSE_DK, anchor="middle", mono=True)
    c.rect(460, 174, 84, 42, fill=AMBER_BG, stroke=AMBER, sw=1.6, rx=5)
    c.text(502, 200, "aB = 0.45", size=10, weight="700", fill=AMBER, anchor="middle", mono=True)
    c.rect(560, 174, 84, 42, fill=BLUE_BG, stroke=BLUE, sw=1.6, rx=5)
    c.text(602, 200, "ab = 0.50", size=10, weight="700", fill=BLUE_DK, anchor="middle", mono=True)
    c.multiline(563, 250, [
        "Ab = 0 → ZERO historical recombination (|D′| = 1.0)!",
        "Yet common B barely predicts rare A (r² = 0.053).",
        "GWAS tagging with B needs 1 / r² ≈ 19× larger sample size!",
    ], size=9.3, lh=16, fill=ROSE_DK, anchor="middle")
    c.save(out / "fig-29b-dprime-vs-r2.svg")


def fig_31b(out: Path):
    c = Canvas(760, 345, "Two heritabilities: broad-sense H² vs. narrow-sense h²",
               "Clones and identical twins share ALL genetic variance (H²); parents pass only single alleles — so selection sees ONLY V_A (h²)")
    # Top stacked variance bar of total V_P
    c.panel_box(24, 72, 712, 120, "Decomposition of total phenotypic variance V_P in a population")
    segs = [
        ("V_A (Additive · 40%)", 272, TEAL, TEAL_BG),
        ("V_D (Dominance · 15%)", 120, BLUE, BLUE_BG),
        ("V_I (Epistasis · 10%)", 96, PURPLE, PURPLE_BG),
        ("V_E (Environment · 35%)", 192, AMBER, AMBER_BG),
    ]
    sx = 40
    for lbl, w, col, bg in segs:
        c.rect(sx, 108, w, 34, fill=bg, stroke=col, sw=1.6, rx=4)
        c.text(sx + w / 2, 129, lbl, size=9.2, weight="700", fill=col, anchor="middle")
        sx += w
    # Brackets underneath showing h^2 vs H^2
    c.line(40, 156, 312, 156, stroke=TEAL, sw=2.4)
    c.text(176, 174, "Narrow-sense h² = V_A / V_P = 0.40", size=9.8, weight="700", fill=TEAL_DK, anchor="middle")
    c.line(40, 184, 528, 184, stroke=BLUE, sw=2.4)
    c.text(448, 174, "Broad-sense H² = (V_A+V_D+V_I)/V_P = 0.65", size=9.5, weight="700", fill=BLUE_DK, anchor="middle")

    # Bottom two cards explaining why the split matters
    c.box(24, 208, 344, 118, "Broad-sense H² = V_G / V_P (identical genotypes)", [
        "Captures ALL genetic effects including dominance",
        "interactions between paired alleles (V_D) and epistasis.",
        "Estimated from MZ twin pairs or clonal plants.",
        "Can be HIGH even when offspring barely resemble parents!",
    ], fill=BLUE_BG, stroke=BLUE, title_fill=BLUE_DK, title_size=10.2, body_size=9.3)

    c.box(392, 208, 344, 118, "Narrow-sense h² = V_A / V_P (what transmits!)", [
        "Parents pass ONE allele per locus, breaking up",
        "dominance pairs and multi-locus epistatic combos.",
        "ONLY V_A predicts parent–offspring resemblance AND",
        "evolutionary response to selection (R = h² · S)!",
    ], fill=TEAL_BG, stroke=TEAL, title_fill=TEAL_DK, title_size=10.2, body_size=9.3)
    c.save(out / "fig-31b-broad-vs-narrow-h2.svg")


def fig_40c(out: Path):
    c = Canvas(760, 355, "PacBio SMRT sequencing and the Circular Consensus (HiFi) trick",
               "Reading a circularised DNA molecule 10–15 times inside a zeptolitre well cancels random raw errors into 99.9%+ Q30 accuracy")
    # Left: SMRTbell inside ZMW
    c.panel_box(24, 72, 344, 264, "SMRTbell template inside one ZMW nanocavity")
    # ZMW bucket
    c.path("M 106 122 L 106 238 L 286 238 L 286 122", stroke=SOFT, sw=3.0)
    # Immobilized polymerase at bottom of well
    c.ellipse(196, 218, 28, 16, fill=TEAL_BG, stroke=TEAL, sw=2)
    c.text(196, 222, "DNA Pol", size=9.2, weight="700", fill=TEAL_DK, anchor="middle")
    # Circularized SMRTbell dumbbell (dsDNA insert + 2 hairpin adapters)
    c.rect(136, 152, 120, 36, fill=BLUE_BG, stroke=BLUE, sw=2.4, rx=18)
    c.text(196, 174, "15–20 kb SMRTbell", size=9.5, weight="700", fill=BLUE_DK, anchor="middle")
    # Fluorescent pulse flashes
    for fx, col in [(162, TEAL), (186, AMBER), (210, ROSE), (234, BLUE)]:
        c.circle(fx, 132, 6, fill=col)
    c.text(196, 114, "Real-time base-incorporation light pulses", size=8.8, weight="700", fill=AMBER, anchor="middle")
    c.multiline(196, 266, [
        "Hairpin adapters turn linear dsDNA into a closed loop:",
        "one single polymerase orbits the SAME molecule",
        "over and over, generating 10–15 independent subreads.",
    ], size=9.2, lh=15, fill=SOFT, anchor="middle")

    # Right: Consensus error cancellation
    c.panel_box(388, 72, 348, 264, "Circular Consensus (CCS): random errors cancel out")
    passes = [
        ("Pass 1:", "A C G T A - T G C A", ROSE_DK),
        ("Pass 2:", "A C G T A G T G C A", SOFT),
        ("Pass 3:", "A C T T A G T G C A", ROSE_DK),
        ("Pass 4:", "A C G T A G T G C A", SOFT),
        ("Pass 5:", "A C G T A G T G A A", ROSE_DK),
    ]
    for i, (lbl, seq, col) in enumerate(passes):
        y = 114 + i * 24
        c.text(406, y, lbl, size=9.2, weight="700", fill=FAINT, mono=True)
        c.text(472, y, seq, size=9.8, weight="600", fill=col, mono=True)
    c.arrow(562, 228, 562, 250, color="teal", sw=2.0)
    c.rect(406, 254, 312, 64, fill=TEAL_BG, stroke=TEAL, sw=1.6, rx=7)
    c.text(562, 276, "HiFi Consensus:  A C G T A G T G C A", size=10, weight="700", fill=TEAL_DK, anchor="middle", mono=True)
    c.text(562, 298, "Raw ~10% error → ~99.9% (Q30+) across 20 kb reads!", size=9.3, weight="700", fill=INK, anchor="middle")
    c.save(out / "fig-40c-pacbio-smrt-hifi.svg")


def fig_48b(out: Path):
    c = Canvas(760, 355, "Two single-cell RNA-seq architectures: Plate-based vs. Droplet-based",
               "Choose plates when you need full-length transcripts and splicing isoforms; choose droplets for 10,000+ cell atlases")
    # Left: Plate-based (SMART-seq2)
    c.panel_box(24, 72, 344, 264, "Plate-based (e.g. SMART-seq2 / FACS 96-well)")
    # Mini 4x6 well plate
    for r in range(3):
        for col_i in range(6):
            wx = 86 + col_i * 38
            wy = 118 + r * 26
            c.circle(wx, wy, 9, fill=BLUE_BG, stroke=BLUE, sw=1.4)
            c.circle(wx, wy, 3.5, fill=TEAL)
    c.text(196, 198, "1 sorted cell per well → full-length cDNA", size=9.3, weight="700", fill=BLUE_DK, anchor="middle")
    c.box(40, 214, 312, 108, "Strengths & trade-offs", [
        "• Coverage: FULL gene body (5′→3′, sees splicing!).",
        "• Sensitivity: high (~5,000–10,000 genes/cell).",
        "• Scale: 10²–10³ cells (high cost per cell).",
        "• Ideal for: rare FACS-sorted populations & isoforms.",
    ], fill=BLUE_BG, stroke=BLUE, title_fill=BLUE_DK, title_size=9.8, body_size=9.1)

    # Right: Droplet-based (10x Chromium)
    c.panel_box(392, 72, 344, 264, "Droplet-based (e.g. 10x Chromium microfluidics)")
    # 4 oil droplets in a channel (empty, 1 cell + bead, empty, doublet!)
    c.line(414, 146, 714, 146, stroke=RULE, sw=1.5)
    drops = [(452, "Empty", False, False), (528, "1 cell + bead", True, True),
             (604, "Empty", False, False), (680, "Doublet!", True, False)]
    for dx, lbl, has_c, good in drops:
        c.circle(dx, 146, 22, fill=TEAL_BG if good else (ROSE_BG if has_c else PANEL),
                 stroke=TEAL if good else (ROSE if has_c else RULE), sw=1.6)
        if good:
            c.circle(dx - 6, 146, 6, fill=TEAL)
            c.circle(dx + 7, 146, 5, fill=AMBER)
        elif has_c:
            c.circle(dx - 6, 142, 5.5, fill=ROSE)
            c.circle(dx + 6, 150, 5.5, fill=ROSE)
        c.text(dx, 184, lbl, size=8.4, weight="700", fill=TEAL_DK if good else (ROSE_DK if has_c else FAINT), anchor="middle")
    c.box(408, 214, 312, 108, "Strengths & trade-offs", [
        "• Coverage: 3′ (or 5′) tag ONLY + UMI barcode.",
        "• Scale: 10⁴–10⁶ cells cheaply (tissue atlases!).",
        "• Sparse counts: ~1,000–3,000 genes/cell (dropouts).",
        "• Poisson loading creates ambient RNA & doublets.",
    ], fill=TEAL_BG, stroke=TEAL, title_fill=TEAL_DK, title_size=9.8, body_size=9.1)
    c.save(out / "fig-48b-plate-vs-droplet-sc.svg")


def fig_49c(out: Path):
    c = Canvas(760, 355, "Testing regulatory elements: Sufficiency (MPRA) vs. Necessity (CRISPRi)",
               "Chromatin peaks are correlations; proving an enhancer controls a gene requires orthogonal perturbation experiments")
    # Left: Sufficiency (MPRA / STARR-seq)
    c.panel_box(24, 72, 344, 264, "Sufficiency: MPRA / STARR-seq reporter plasmid")
    c.rect(48, 118, 296, 54, fill=AMBER_BG, stroke=AMBER, sw=1.6, rx=8)
    c.rect(62, 130, 82, 30, fill=TEAL_BG, stroke=TEAL, sw=1.5, rx=4)
    c.text(103, 149, "Candidate Enh", size=8.8, weight="700", fill=TEAL_DK, anchor="middle")
    c.rect(152, 130, 62, 30, fill=PANEL, stroke=INK, sw=1.3, rx=4)
    c.text(183, 149, "Min Pro", size=8.8, fill=INK, anchor="middle")
    c.rect(222, 130, 108, 30, fill=BLUE_BG, stroke=BLUE, sw=1.5, rx=4)
    c.text(276, 149, "Reporter + Barcode", size=8.8, weight="700", fill=BLUE_DK, anchor="middle")
    c.text(196, 194, "Question: CAN this 200 bp sequence activate a reporter?", size=9.2, weight="700", fill=AMBER, anchor="middle")
    c.box(40, 210, 312, 110, "Strengths & blind spots", [
        "• Tests 10⁵ variants in parallel (exact ref vs. alt!).",
        "• Episomal plasmid lacks native 3D TAD looping,",
        "  chromatin silencing, and true endogenous target gene.",
        "→ Proves biochemical SUFFICIENCY, not native role.",
    ], fill=AMBER_BG, stroke=AMBER, title_fill=AMBER, title_size=9.8, body_size=9.1)

    # Right: Necessity (CRISPRi / Perturb-seq)
    c.panel_box(392, 72, 344, 264, "Necessity: Endogenous CRISPRi / Enhancer deletion")
    c.line(416, 152, 712, 152, stroke=INK, sw=2.8)
    c.rect(444, 138, 86, 28, fill=ROSE_BG, stroke=ROSE, sw=1.6, rx=4)
    c.text(487, 156, "Enhancer ✕", size=9.2, weight="700", fill=ROSE_DK, anchor="middle")
    c.pill(440, 108, 94, 22, "dCas9–KRAB", fill=PURPLE_BG, stroke=PURPLE, text_fill=PURPLE, size=8.8)
    c.rect(616, 138, 82, 28, fill=TEAL_BG, stroke=TEAL, sw=1.6, rx=4)
    c.text(657, 156, "Gene X ↓ ?", size=9.2, weight="700", fill=TEAL_DK, anchor="middle")
    c.path("M 492 136 Q 574 106, 652 136", stroke=ROSE, sw=1.8, dash="4,3")
    c.text(564, 194, "Question: DOES native Gene X drop when silenced in situ?", size=9.2, weight="700", fill=TEAL_DK, anchor="middle")
    c.box(408, 210, 312, 110, "Strengths & blind spots", [
        "• Directly proves causal Variant → Enhancer → Gene!",
        "• Preserves native 3D loops & chromatin context.",
        "• Redundant 'shadow enhancers' can mask single knockouts.",
        "→ Proves endogenous NECESSITY (gold standard for V2G).",
    ], fill=TEAL_BG, stroke=TEAL, title_fill=TEAL_DK, title_size=9.8, body_size=9.1)
    c.save(out / "fig-49c-sufficiency-vs-necessity.svg")


def fig_51b(out: Path):
    c = Canvas(760, 355, "Distinguishing polygenicity from confounding: λ_GC vs. LD-score regression",
               "True polygenic signal scales linearly with a SNP's LD score (slope); population stratification lifts every SNP equally (intercept > 1)")
    # Left: LD-score regression plot
    c.panel_box(24, 72, 412, 264, "LD-Score Regression: E[χ²_j] = 1 + N·a + (N·h²/M) · ℓ_j")
    x0, y0, pw, ph = 72, 276, 336, 158
    c.axes(x0, y0, pw, ph, xlabel="SNP LD score ℓ_j (sum of r² with neighbours)", ylabel="Mean χ²",
           xticks=[(0.0, "0"), (0.5, "100"), (1.0, "200")],
           yticks=[(0.0, "0.8"), (0.25, "1.0"), (0.62, "1.4"), (1.0, "1.8")])
    # Null horizontal at 1.0
    y1 = y0 - 0.25 * ph
    c.line(x0, y1, x0 + pw, y1, stroke=RULE, sw=1.4, dash="3,3")
    # Pure polygenicity line: starts at 1.0, climbs steeply!
    c.line(x0, y1, x0 + pw, y0 - 0.78 * ph, stroke=TEAL, sw=2.8)
    c.text(x0 + pw - 6, y0 - 0.70 * ph, "True polygenicity (intercept ≈ 1.0)", size=9, weight="700", fill=TEAL_DK, anchor="end")
    # Stratification + polygenicity: shifted UP to intercept ~1.32!
    y_conf = y0 - 0.54 * ph
    c.line(x0, y_conf, x0 + pw, y0 - 0.96 * ph, stroke=ROSE, sw=2.6, dash="5,3")
    c.text(x0 + 8, y_conf - 6, "Stratification lifts intercept > 1!", size=9, weight="700", fill=ROSE_DK)
    c.circle(x0, y1, 5, fill=TEAL)
    c.circle(x0, y_conf, 5, fill=ROSE)

    # Right: Interpretation key
    c.panel_box(454, 72, 282, 264, "Why λ_GC alone misleads modern GWAS")
    c.box(468, 108, 254, 96, "Genomic inflation λ_GC = median(χ²)/0.455", [
        "Cannot tell apart confounding vs. true",
        "polygenicity! In N = 500,000 height GWAS,",
        "λ_GC ≈ 1.6 purely from real biology!",
    ], fill=AMBER_BG, stroke=AMBER, title_fill=AMBER, title_size=9.5, body_size=9.0)
    c.box(468, 218, 254, 102, "LD-score regression separates both:", [
        "• Intercept ≈ 1.00 → clean, unconfounded!",
        "• Intercept > 1.05 → cryptic stratification.",
        "• Slope → estimates SNP heritability h²_SNP",
        "  from summary statistics alone!",
    ], fill=TEAL_BG, stroke=TEAL, title_fill=TEAL_DK, title_size=9.5, body_size=9.0)
    c.save(out / "fig-51b-lambda-vs-ldsc.svg")


def fig_S6b(out: Path):
    c = Canvas(760, 355, "Confidence intervals (Frequentist) vs. Credible intervals (Bayesian)",
               "Same 95% number, opposite probability statements: what is random — the interval or the parameter?")
    # Left: Frequentist CI (fixed theta, random intervals!)
    c.panel_box(24, 72, 344, 264, "Frequentist 95% Confidence Interval (interval is random)")
    tx = 196
    c.line(tx, 106, tx, 248, stroke=INK, sw=2.0, dash="4,3")
    c.text(tx, 102, "Fixed true θ", size=9.2, weight="700", fill=INK, anchor="middle")
    cis = [(152, 232, True), (168, 246, True), (138, 218, True), (208, 284, False), (160, 238, True), (144, 224, True)]
    for i, (x1, x2, hit) in enumerate(cis):
        y = 124 + i * 22
        col = TEAL if hit else ROSE
        c.line(x1, y, x2, y, stroke=col, sw=2.4)
        c.circle((x1 + x2) / 2, y, 3.8, fill=col)
    c.text(288, 193, "Miss!", size=8.8, weight="700", fill=ROSE_DK)
    c.multiline(196, 272, [
        "θ is FIXED (not random); the interval jumps across repeats.",
        "95% of repeated samples produce intervals bracketing θ.",
        "You CANNOT say 'P(θ ∈ this CI) = 95%' strictly!",
    ], size=9.1, lh=15, fill=SOFT, anchor="middle")

    # Right: Bayesian Credible Interval (fixed data, posterior density over theta!)
    c.panel_box(392, 72, 344, 264, "Bayesian 95% Credible Interval (θ has a posterior)")
    x0, y0, pw, ph = 434, 240, 264, 118
    c.line(x0, y0, x0 + pw, y0, stroke=SOFT, sw=1.4)
    # Shaded 95% middle area of posterior bell curve
    pts = [(x0 + pw * k / 80, y0 - ph * 0.92 * math.exp(-0.5 * ((k - 40) / 13) ** 2)) for k in range(81)]
    shade = [(x0 + pw * 15 / 80, y0)] + pts[15:66] + [(x0 + pw * 65 / 80, y0)]
    c.polygon(shade, fill=TEAL_BG, stroke="none")
    c.polyline(pts, stroke=TEAL, sw=2.6)
    c.line(x0 + pw * 15 / 80, y0, x0 + pw * 15 / 80, pts[15][1], stroke=TEAL, sw=1.5, dash="3,2")
    c.line(x0 + pw * 65 / 80, y0, x0 + pw * 65 / 80, pts[65][1], stroke=TEAL, sw=1.5, dash="3,2")
    c.text(x0 + pw / 2, y0 - 46, "95% posterior mass", size=9.8, weight="700", fill=TEAL_DK, anchor="middle")
    c.text(x0 + pw / 2, y0 + 16, "Parameter θ (given observed data D)", size=9, fill=SOFT, anchor="middle")
    c.multiline(564, 276, [
        "Data D are FIXED; posterior P(θ | D) quantifies belief in θ.",
        "Directly licenses: 'Given data + prior, P(θ ∈ [a, b]) = 95%.'",
        "Used for GWAS fine-mapping 95% credible sets (Ch 52)!",
    ], size=9.1, lh=15, fill=SOFT, anchor="middle")
    c.save(out / "fig-S6b-credible-vs-confidence.svg")


def build_all(out: Path):
    for fn in [fig_05c, fig_09d, fig_11c, fig_20d, fig_25Ac, fig_29b,
               fig_31b, fig_40c, fig_48b, fig_49c, fig_51b, fig_S6b]:
        fn(out)
    print("Generated 12 Wave-4 contrast SVGs for learn-genomics")
