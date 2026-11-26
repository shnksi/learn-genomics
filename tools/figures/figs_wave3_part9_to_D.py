"""Wave 3 precision SVG diagrams — Parts 9–12 & Part D (8 deep visual-gap figures)."""
from __future__ import annotations
import math
from pathlib import Path
from svg_kit import (
    Canvas, INK, SOFT, FAINT, RULE, RULE_LT, PANEL, SUNK,
    TEAL, TEAL_DK, TEAL_BG, AMBER, AMBER_BG, BLUE, BLUE_DK, BLUE_BG,
    ROSE, ROSE_DK, ROSE_BG, PURPLE, PURPLE_BG, GREEN, GREEN_BG, DNA, DNA_BG,
)


def fig_42b(out: Path):
    c = Canvas(760, 355, "Reading a BAM file: four visual alignment signatures of health vs. failure",
               "Inspecting insert sizes, soft-clips, duplicate stacks, and MAPQ=0 gaps in IGV catches pipeline bugs before variant calling")
    panels = [
        (24, 72, "1. Insert-size distribution", TEAL, TEAL_BG),
        (388, 72, "2. Soft-clip cliff (breakpoint!)", AMBER, AMBER_BG),
        (24, 214, "3. PCR duplicate stacks", ROSE, ROSE_BG),
        (388, 214, "4. MAPQ = 0 repeat blackouts", BLUE, BLUE_BG),
    ]
    for x, y, title, col, bg in panels:
        c.panel_box(x, y, 348, 128, title, header_fill=col)

    # Panel 1: Clean Gaussian insert size ~350bp vs adapter-dimer spike at 80bp
    x0, y0 = 54, 178
    c.line(x0, y0, x0 + 286, y0, stroke=SOFT, sw=1.2)
    pts = [(x0 + 286 * k / 70, y0 - 56 * math.exp(-0.5 * ((k - 42) / 9) ** 2)) for k in range(71)]
    c.polyline(pts, stroke=TEAL, sw=2.4)
    c.rect(x0 + 22, y0 - 38, 12, 38, fill=ROSE_BG, stroke=ROSE, sw=1.4)
    c.text(x0 + 28, y0 - 44, "Adapter!", size=8.5, weight="700", fill=ROSE_DK, anchor="middle")
    c.text(x0 + 180, y0 - 60, "Healthy ~350 bp", size=9, weight="700", fill=TEAL_DK, anchor="middle")
    c.text(198, 192, "Tight bell curve = clean library; bimodal = contamination", size=8.8, fill=SOFT, anchor="middle")

    # Panel 2: Soft-clip cliff
    for i in range(4):
        ry = 114 + i * 16
        c.rect(418, ry, 146, 10, fill=TEAL_BG, stroke=TEAL, sw=1.2, rx=2)
        c.rect(564, ry, 42, 10, fill=AMBER_BG, stroke=AMBER, sw=1.2, rx=2)
    c.line(564, 106, 564, 180, stroke=ROSE, sw=1.8, dash="3,2")
    c.text(620, 146, "Soft-clipped bases", size=9, weight="700", fill=AMBER)
    c.text(620, 160, "(true SV / indel edge!)", size=8.8, fill=SOFT)
    c.text(562, 192, "Aligned rainbow column of clips = exact breakpoint", size=8.8, fill=SOFT, anchor="middle")

    # Panel 3: PCR duplicate stacks
    for i in range(4):
        ry = 252 + i * 14
        c.rect(64, ry, 122, 9, fill=ROSE_BG, stroke=ROSE, sw=1.2, rx=2)
    c.text(204, 274, "Identical start & end", size=9.2, weight="700", fill=ROSE_DK)
    c.text(204, 289, "= 1 molecule × 4 PCR copies", size=8.8, fill=SOFT)
    c.text(198, 330, "Must MarkDuplicates or 1 PCR error looks like a real het!", size=8.8, fill=SOFT, anchor="middle")

    # Panel 4: MAPQ=0 white reads
    for i in range(4):
        ry = 252 + i * 14
        c.rect(418 + i * 16, ry, 110, 9, fill="#ffffff", stroke=RULE, sw=1.2, dash="3,2", rx=2)
    c.text(596, 274, "White / hollow reads", size=9.2, weight="700", fill=BLUE_DK)
    c.text(596, 289, "MAPQ = 0 (segmental dup)", size=8.8, fill=SOFT)
    c.text(562, 330, "Short reads cannot place uniquely → blind spot for SNV calling", size=8.8, fill=SOFT, anchor="middle")
    c.save(out / "fig-42b-bam-qc-signatures.svg")


def fig_46c(out: Path):
    c = Canvas(760, 365, "How structural variants (SVs) are detected from short-read WGS",
               "Combining three orthogonal signals — read depth, discordant pairs, and split reads — resolves deletions, duplications, and inversions")
    # Top: Reference with 3-signal tracks across a Deletion
    c.panel_box(24, 72, 712, 162, "Anatomy of a heterozygous deletion (50 kb) across three WGS read signals")
    # 1. Read depth profile
    c.text(42, 124, "1. Read Depth", size=9.8, weight="700", fill=BLUE_DK)
    c.polyline([(172, 108), (330, 108), (330, 130), (520, 130), (520, 108), (706, 108)], stroke=BLUE, sw=2.8)
    c.text(425, 124, "50% depth drop (het del)", size=9, weight="700", fill=ROSE_DK, anchor="middle")
    # 2. Discordant pair (stretched insert)
    c.text(42, 168, "2. Discordant Pairs", size=9.8, weight="700", fill=AMBER)
    c.rect(256, 158, 56, 12, fill=AMBER_BG, stroke=AMBER, sw=1.5, rx=2)
    c.line(312, 164, 536, 164, stroke=AMBER, sw=2.0, dash="4,3")
    c.rect(536, 158, 56, 12, fill=AMBER_BG, stroke=AMBER, sw=1.5, rx=2)
    c.text(425, 156, "Insert spans 50 kb (>> 350 bp expected!)", size=8.8, weight="700", fill=AMBER, anchor="middle")
    # 3. Split reads
    c.text(42, 206, "3. Split Reads", size=9.8, weight="700", fill=TEAL_DK)
    c.rect(294, 196, 36, 12, fill=TEAL_BG, stroke=TEAL, sw=1.5, rx=2)
    c.line(330, 202, 520, 202, stroke=TEAL, sw=1.6, dash="2,2")
    c.rect(520, 196, 36, 12, fill=TEAL_BG, stroke=TEAL, sw=1.5, rx=2)
    c.text(425, 218, "Exact 1-bp breakpoint resolution!", size=9, weight="700", fill=TEAL_DK, anchor="middle")
    # Breakpoint dashed verticals
    c.line(330, 98, 330, 220, stroke=ROSE, sw=1.3, dash="3,3")
    c.line(520, 98, 520, 220, stroke=ROSE, sw=1.3, dash="3,3")

    # Bottom: SV class signature matrix
    cards = [
        (24, "Deletion", ROSE, ROSE_BG, "Depth: ↓ (0.5× / 0×)", "Pairs: stretched insert"),
        (206, "Tandem Dup", TEAL, TEAL_BG, "Depth: ↑ (1.5× / 2×)", "Pairs: outward ← →"),
        (388, "Inversion", PURPLE, PURPLE_BG, "Depth: unchanged (1×)", "Pairs: same-strand → →"),
        (570, "Translocation", BLUE, BLUE_BG, "Depth: unchanged (1×)", "Pairs: chrA ↔ chrB"),
    ]
    for x, title, col, bg, l1, l2 in cards:
        c.box(x, 248, 166, 94, title, [l1, l2], fill=bg, stroke=col, title_fill=col, title_size=10.5, body_size=9.3)
    c.save(out / "fig-46c-sv-read-signatures.svg")


def fig_49b(out: Path):
    c = Canvas(760, 355, "ChIP-seq vs. CUT&RUN vs. CUT&Tag: why tethered enzymes cut background noise",
               "Instead of shearing the whole genome and pulling down sticky fragments, tethered nucleases cut or tag ONLY where the TF sits")
    cols = [
        (24, "ChIP-seq (classic)", AMBER, AMBER_BG, [
            "1. Crosslink whole genome",
            "2. Sonicate ALL DNA randomly",
            "3. Antibody pulldown + wash",
            "4. End-repair & ligate adapters",
            "Needs 10⁶–10⁷ cells · noisy",
            "background (needs Input ctrl)",
        ]),
        (268, "CUT&RUN (pA-MNase)", BLUE, BLUE_BG, [
            "1. Intact unfixed nuclei on beads",
            "2. Antibody binds target TF/mark",
            "3. Protein A–MNase docks + Ca²⁺",
            "4. Cuts ONLY local TF footprint!",
            "Needs 10³–10⁵ cells · 10× higher",
            "signal-to-noise · tiny reads",
        ]),
        (512, "CUT&Tag (pA-Tn5)", TEAL, TEAL_BG, [
            "1. Intact nuclei + antibody",
            "2. Protein A–Tn5 transposase",
            "   pre-loaded with NGS adapters",
            "3. Mg²⁺ triggers direct cut+tag!",
            "Works down to SINGLE CELLS!",
            "Bias: slight open-chromatin pref.",
        ]),
    ]
    for x, title, col, bg, lines in cols:
        c.box(x, 76, 224, 212, title, lines, fill=bg, stroke=col, title_fill=col, title_size=11, body_size=9.5)

    c.rect(24, 302, 712, 36, fill=PANEL, stroke=RULE, rx=7)
    c.text(380, 324, "Core physics: keeping the genome intact and cutting ONLY at the bound antibody eliminates ~90% of off-target DNA reads.", size=9.8, weight="700", fill=INK, anchor="middle")
    c.save(out / "fig-49b-chip-vs-cutrun-cuttag.svg")


def fig_56b(out: Path):
    c = Canvas(760, 360, "Oncogenes vs. tumour suppressors — literally readable off a lollipop plot",
               "Somatic mutation patterns across patient cohorts immediately reveal whether a gene is activated (hotspot) or inactivated (scattered LoF)")
    # Top: Oncogene lollipop (KRAS / BRAF sharp tower!)
    c.panel_box(24, 72, 712, 126, "Oncogene (e.g. KRAS / BRAF): sharp missense hotspot tower at 1–2 activating codons")
    c.rect(64, 166, 632, 16, fill=AMBER_BG, stroke=AMBER, sw=1.5, rx=4)
    c.text(380, 178, "Protein coding sequence (N → C)", size=9, weight="700", fill=AMBER, anchor="middle")
    # Giant hotspot lollipop at codon 12 (x=140) and tiny second peak
    c.line(146, 166, 146, 106, stroke=AMBER, sw=2.6)
    c.circle(146, 102, 9, fill=AMBER, stroke="#ffffff", sw=1.5)
    c.text(164, 106, "G12D / G12V hotspot (>80% missense!)", size=9.5, weight="700", fill=AMBER)
    c.line(292, 166, 292, 142, stroke=AMBER, sw=1.8)
    c.circle(292, 139, 5, fill=AMBER)
    c.text(304, 142, "Q61", size=8.8, weight="600", fill=SOFT)
    c.text(686, 138, "Almost ZERO truncating mutations", size=9.2, weight="700", fill=TEAL_DK, anchor="end")
    c.text(686, 153, "(breaking the protein kills oncogenicity!)", size=8.8, fill=SOFT, anchor="end")

    # Bottom: Tumour suppressor lollipop (APC / RB1 scattered truncating!)
    c.panel_box(24, 214, 712, 128, "Tumour Suppressor (e.g. RB1 / APC): truncating nonsense & frameshift mutations scattered everywhere")
    c.rect(64, 308, 632, 16, fill=BLUE_BG, stroke=BLUE, sw=1.5, rx=4)
    c.text(380, 320, "Protein coding sequence (N → C) — any early stop knocks out function!", size=9, weight="700", fill=BLUE_DK, anchor="middle")
    xs = [96, 132, 168, 212, 248, 286, 330, 372, 410, 456, 494, 538, 582, 626, 662]
    hs = [28, 42, 22, 36, 48, 26, 38, 30, 44, 24, 36, 40, 22, 32, 26]
    for lx, lh in zip(xs, hs):
        c.line(lx, 308, lx, 308 - lh, stroke=ROSE, sw=1.8)
        c.circle(lx, 308 - lh - 3, 4.5, fill=ROSE)
    c.text(380, 250, "Uniform smear of nonsense (*), frameshift, and splice-site LoF variants across the entire gene", size=9.3, weight="700", fill=ROSE_DK, anchor="middle")
    c.save(out / "fig-56b-oncogene-vs-tsg-lollipops.svg")


def fig_56c(out: Path):
    c = Canvas(760, 360, "COSMIC mutational signatures: reading environmental and repair history off DNA",
               "Grouping somatic substitutions by their flanking 5′ and 3′ bases (96 channels) fingerprints the exact mutagenic cause")
    sigs = [
        (24, 72, "SBS1 — Age clock (5mC deamination)", BLUE, BLUE_BG,
         [0.05, 0.05, 0.05, 0.1, 0.95, 0.85, 0.78, 0.90, 0.06, 0.05, 0.05, 0.05],
         "4 sharp C>T spikes at NCG (CpG) sites"),
        (388, 72, "SBS7a/b — UV light (melanoma)", AMBER, AMBER_BG,
         [0.05, 0.06, 0.05, 0.08, 0.60, 0.95, 0.88, 0.70, 0.45, 0.06, 0.05, 0.05],
         "Dominant C>T at dipyrimidines (TCC, TTC) + CC>TT"),
        (24, 214, "SBS4 — Tobacco smoke (lung)", ROSE, ROSE_BG,
         [0.85, 0.92, 0.76, 0.65, 0.12, 0.10, 0.08, 0.08, 0.14, 0.10, 0.08, 0.06],
         "Strong C>A (G>T) transversions from benzo[a]pyrene"),
        (388, 214, "SBS3 — BRCA1/2 HR deficiency", PURPLE, PURPLE_BG,
         [0.36, 0.34, 0.38, 0.35, 0.30, 0.32, 0.35, 0.33, 0.37, 0.34, 0.36, 0.32],
         "Broad flat profile across all 6 classes → predicts PARP-i!"),
    ]
    for x, y, title, col, bg, bars, note in sigs:
        c.panel_box(x, y, 348, 128, title, header_fill=col)
        bx0, by0, bh = x + 22, y + 98, 56
        c.line(bx0 - 4, by0, x + 328, by0, stroke=SOFT, sw=1.2)
        bw = 304 / len(bars)
        for i, v in enumerate(bars):
            hh = v * bh
            c.rect(bx0 + i * bw, by0 - hh, bw - 4, hh, fill=col, opacity=0.82, rx=2)
        c.text(x + 174, y + 116, note, size=9, weight="600", fill=SOFT, anchor="middle")
    c.save(out / "fig-56c-mutational-signatures.svg")


def fig_D1c(out: Path):
    c = Canvas(760, 355, "The neurodegeneration proteostasis toolbox in post-mitotic neurons",
               "Because mature neurons cannot divide to dilute damaged proteins or mitochondria, they depend on three clearance arms")
    # Top hub: Misfolded protein / damaged organelle
    c.pill(216, 74, 328, 30, "Misfolded protein / Damaged mitochondrion (aging neuron)", fill=ROSE_BG, stroke=ROSE, text_fill=ROSE_DK, size=10)
    # 3 arrows to 3 clearance arms
    c.arrow(280, 106, 136, 136, color="teal", sw=1.8)
    c.arrow(380, 106, 380, 136, color="blue", sw=1.8)
    c.arrow(480, 106, 624, 136, color="amber", sw=1.8)

    arms = [
        (24, "1. Chaperone Refolding", TEAL, TEAL_BG, [
            "Hsp70 / Hsp90 / TRiC rescue",
            "partially folded intermediates",
            "before hydrophobic surfaces",
            "clump into toxic oligomers.",
        ]),
        (268, "2. Ubiquitin–Proteasome (UPS)", BLUE, BLUE_BG, [
            "E1–E2–E3 ligases attach K48",
            "poly-ubiquitin chains → 26S",
            "proteasome unfolds & shreds",
            "soluble monomers only.",
        ]),
        (512, "3. Autophagy & Mitophagy", AMBER, AMBER_BG, [
            "Double-membrane autophagosome",
            "engulfs large aggregates &",
            "fissioned mitochondria (PINK1/",
            "Parkin) → fuses with lysosome.",
        ]),
    ]
    for x, title, col, bg, lines in arms:
        c.box(x, 140, 224, 122, title, lines, fill=bg, stroke=col, title_fill=col, title_size=10.5, body_size=9.4)

    # Bottom failure cascade strip
    c.rect(24, 278, 712, 60, fill=ROSE_BG, stroke=ROSE, sw=1.4, rx=8)
    c.text(380, 298, "When clearance saturates in Purkinje or motor neurons:", size=10.5, weight="700", fill=ROSE_DK, anchor="middle")
    c.text(380, 318, "Aggregates + fragmented mitochondria → ATP collapse + Ca²⁺ excitotoxicity + ER stress (UPR) → selective neuronal death.", size=9.6, fill=SOFT, anchor="middle")
    c.save(out / "fig-D1c-proteostasis-toolbox.svg")


def fig_D2b(out: Path):
    c = Canvas(760, 355, "PP2A subunit competition: why changing PPP2R2B dosage perturbs the whole cell",
               "All ~20 regulatory B subunits compete for the same finite pool of A–C core dimers — changing one subunit shifts other holoenzymes")
    # Left: Balanced homeostatic pool
    c.panel_box(24, 72, 344, 264, "Normal dosage: balanced A–C dimer sharing")
    # Shared A-C pool top
    c.rect(96, 108, 200, 36, fill=PANEL, stroke=INK, sw=1.6, rx=8)
    c.text(196, 130, "Finite A–C core dimer pool", size=10, weight="700", fill=INK, anchor="middle")
    c.arrow(140, 146, 108, 178, color="teal", sw=1.8)
    c.arrow(196, 146, 196, 178, color="blue", sw=1.8)
    c.arrow(252, 146, 284, 178, color="amber", sw=1.8)
    # 3 equal holoenzymes
    c.box(44, 182, 92, 74, "A-C-B55β", ["(PPP2R2B)", "33% pool"], fill=TEAL_BG, stroke=TEAL, title_fill=TEAL_DK, title_size=9.5, body_size=8.8)
    c.box(150, 182, 92, 74, "A-C-B55α", ["(PPP2R2A)", "33% pool"], fill=BLUE_BG, stroke=BLUE, title_fill=BLUE_DK, title_size=9.5, body_size=8.8)
    c.box(256, 182, 92, 74, "A-C-B56", ["(PPP2R5x)", "33% pool"], fill=AMBER_BG, stroke=AMBER, title_fill=AMBER, title_size=9.5, body_size=8.8)
    c.text(196, 294, "Every substrate class receives its", size=9.5, fill=SOFT, anchor="middle")
    c.text(196, 310, "calibrated basal phosphatase flux.", size=9.5, fill=SOFT, anchor="middle")

    # Right: Perturbed PPP2R2B overexpression (or loss!)
    c.panel_box(388, 72, 348, 264, "SCA12 dosage shift: excess B55β (or Bβ2) steals A–C")
    c.rect(462, 108, 200, 36, fill=PANEL, stroke=INK, sw=1.6, rx=8)
    c.text(562, 130, "Same finite A–C core pool!", size=10, weight="700", fill=ROSE_DK, anchor="middle")
    c.arrow(512, 146, 480, 178, color="rose", sw=3.2)
    c.arrow(562, 146, 586, 178, color="ink", sw=1.2, dash="3,2")
    c.arrow(612, 146, 668, 178, color="ink", sw=1.2, dash="3,2")

    c.box(404, 182, 134, 76, "Excess A-C-B55β", ["Sequesters A–C!", "Hyper-dephosphorylates", "Bβ2/Drp1 targets"], fill=ROSE_BG, stroke=ROSE, title_fill=ROSE_DK, title_size=9.6, body_size=8.6)
    c.box(550, 182, 82, 76, "Starved", ["B55α ↓", "loss!"], fill=PANEL, stroke=RULE, title_fill=FAINT, title_size=9.2, body_size=8.6)
    c.box(642, 182, 82, 76, "Starved", ["B56 ↓", "loss!"], fill=PANEL, stroke=RULE, title_fill=FAINT, title_size=9.2, body_size=8.6)
    c.multiline(562, 286, [
        "Overexpressing ONE subunit creates BOTH gain-of-function",
        "on its own targets AND dominant-negative loss on rival B subunits!",
    ], size=9.1, lh=14, fill=ROSE_DK, anchor="middle")
    c.save(out / "fig-D2b-pp2a-subunit-competition.svg")


def fig_D5b(out: Path):
    c = Canvas(760, 360, "SCA12 diagnostics: flanking PCR vs. RP-PCR sawtooth vs. long reads",
               "Large GC-rich CAG tracts fail flanking PCR (allelic dropout); RP-PCR gives a 3-bp sawtooth while long reads size every base")
    # 3 diagnostic panels side by side
    # 1. Flanking PCR (falsely looks homozygous!)
    c.panel_box(24, 72, 224, 268, "1. Flanking PCR (allelic dropout)")
    c.line(44, 224, 228, 224, stroke=SOFT, sw=1.3)
    # Single normal peak at 10 CAG
    c.polygon([(78, 224), (88, 132), (98, 224)], fill=BLUE_BG, stroke=BLUE, sw=2)
    c.text(88, 122, "10 CAG", size=9.2, weight="700", fill=BLUE_DK, anchor="middle")
    # Missing expanded peak dashed
    c.polygon([(164, 224), (174, 178), (184, 224)], fill="none", stroke=ROSE, sw=1.5, dash="3,2")
    c.text(174, 168, "55 CAG?", size=9, weight="700", fill=ROSE_DK, anchor="middle")
    c.text(174, 206, "(fails!)", size=8.5, fill=ROSE_DK, anchor="middle")
    c.multiline(136, 256, [
        "Only 1 peak appears → looks",
        "falsely homozygous (10/10)!",
        "Never stop at a single-peak",
        "flanking PCR result.",
    ], size=9.2, lh=14, fill=SOFT, anchor="middle")

    # 2. Repeat-Primed PCR (RP-PCR sawtooth!)
    c.panel_box(268, 72, 224, 268, "2. RP-PCR (sawtooth stutter)")
    c.line(288, 224, 472, 224, stroke=SOFT, sw=1.3)
    # Sawtooth decreasing peaks spaced 3 bp apart!
    pts = [(294, 224)]
    for k in range(14):
        px = 300 + k * 11
        ph = 86 * math.exp(-0.14 * k)
        pts.extend([(px, 224), (px + 4, 224 - ph), (px + 8, 224)])
    c.polyline(pts, stroke=AMBER, sw=2.0)
    c.text(380, 126, "3-bp sawtooth tail!", size=9.5, weight="700", fill=AMBER, anchor="middle")
    c.multiline(380, 256, [
        "Repeat primer anneals at every",
        "CAG → proves expansion exists",
        "(rules out homozygosity), but",
        "cannot size very long tracts.",
    ], size=9.2, lh=14, fill=SOFT, anchor="middle")

    # 3. PacBio HiFi / ONT Long Reads
    c.panel_box(512, 72, 224, 268, "3. Long-read WGS / targeted")
    # Normal allele read
    c.rect(532, 128, 184, 14, fill=BLUE_BG, stroke=BLUE, sw=1.4, rx=3)
    c.rect(584, 128, 28, 14, fill=TEAL, rx=2)
    c.text(624, 118, "Allele 1: 10 CAG (normal)", size=8.8, weight="700", fill=BLUE_DK, anchor="middle")
    # Expanded allele read spanning full 55 CAG!
    c.rect(532, 174, 184, 14, fill=ROSE_BG, stroke=ROSE, sw=1.4, rx=3)
    c.rect(566, 174, 102, 14, fill=ROSE, rx=2)
    c.text(624, 164, "Allele 2: 55 CAG + interruptions!", size=8.8, weight="700", fill=ROSE_DK, anchor="middle")
    c.text(624, 210, "Single reads span flank-to-flank", size=9, weight="700", fill=TEAL_DK, anchor="middle")
    c.multiline(624, 256, [
        "Gives exact repeat length,",
        "somatic length mosaicism,",
        "sequence interruptions, AND",
        "native CpG methylation!",
    ], size=9.2, lh=14, fill=SOFT, anchor="middle")
    c.save(out / "fig-D5b-rppcr-sawtooth-longread.svg")


def build_all(out: Path):
    for fn in [fig_42b, fig_46c, fig_49b, fig_56b, fig_56c, fig_D1c, fig_D2b, fig_D5b]:
        fn(out)
    print("Generated 8 Wave-3 SVGs for Parts 9–12 & D")
