"""Wave 2 precision SVG diagrams — Parts 4–10 & Part D (12 additional high-impact visual figures)."""
from __future__ import annotations
import math
from pathlib import Path
from svg_kit import (
    Canvas, INK, SOFT, FAINT, RULE, RULE_LT, PANEL, SUNK,
    TEAL, TEAL_DK, TEAL_BG, AMBER, AMBER_BG, BLUE, BLUE_DK, BLUE_BG,
    ROSE, ROSE_DK, ROSE_BG, PURPLE, PURPLE_BG, GREEN, GREEN_BG, DNA, DNA_BG,
)


def fig_17b(out: Path):
    c = Canvas(760, 360, "Strand discrimination in MMR and the DSB repair commitment fork",
               "MMR uses strand nicks to identify the newly synthesized copy; 5′ end resection commits a double-strand break to HR over NHEJ")
    # Left: MMR strand discrimination
    c.panel_box(24, 72, 348, 268, "Mismatch Repair (MMR): which strand is wrong?")
    # Template top, nascent bottom with nick
    c.line(48, 124, 348, 124, stroke=INK, sw=2.8)
    c.text(44, 114, "Template (parental — intact)", size=9, weight="700", fill=INK)
    c.line(48, 152, 134, 152, stroke=TEAL, sw=2.8)
    c.line(146, 152, 348, 152, stroke=TEAL, sw=2.8)
    c.text(140, 170, "Nick!", size=9, weight="700", fill=ROSE_DK, anchor="middle")
    # Mismatch bump at x=240
    c.circle(240, 138, 12, fill=ROSE_BG, stroke=ROSE, sw=1.8)
    c.text(240, 141.5, "G:T", size=8.5, weight="700", fill=ROSE_DK, anchor="middle", mono=True)
    c.pill(200, 178, 86, 22, "MutSα / MutLα", fill=BLUE_BG, stroke=BLUE, text_fill=BLUE_DK, size=9)
    c.arrow(200, 189, 150, 166, color="blue", sw=1.6)
    c.multiline(198, 224, [
        "1. MutSα detects G:T distortion, recruits MutLα.",
        "2. Scans to nearest nick (eukaryotes) or unmethylated",
        "   GATC (E. coli MutH) → marks NEW strand.",
        "3. Exo1 excises patch past mismatch; Pol δ refills.",
        "Loss of MLH1/MSH2 → Lynch syndrome (MSI-high).",
    ], size=9.4, lh=15, fill=SOFT, anchor="middle")

    # Right: DSB commitment fork
    c.panel_box(388, 72, 348, 268, "Double-strand break: the end-resection fork")
    c.pill(496, 108, 132, 26, "DSB (broken duplex)", fill=ROSE_BG, stroke=ROSE, text_fill=ROSE_DK, size=10)
    c.arrow(530, 136, 468, 168, color="amber", sw=1.8)
    c.arrow(594, 136, 656, 168, color="teal", sw=1.8)

    c.box(402, 172, 154, 148, "NHEJ (all phases)", [
        "Ku70/80 + 53BP1",
        "block resection",
        "Fast direct ligation",
        "Often leaves small",
        "indels (knockouts!)",
    ], fill=AMBER_BG, stroke=AMBER, title_fill=AMBER, title_size=10.5, body_size=9.3)

    c.box(568, 172, 154, 148, "HR (S / G2 only)", [
        "MRN + CtIP resect",
        "5′→3′ ssDNA tails",
        "BRCA1/2 load Rad51",
        "Uses sister chromatid",
        "Error-free copy!",
    ], fill=TEAL_BG, stroke=TEAL, title_fill=TEAL_DK, title_size=10.5, body_size=9.3)
    c.save(out / "fig-17b-mmr-dsb-fork.svg")


def fig_21b(out: Path):
    c = Canvas(760, 360, "The trp operon attenuation switch: ribosome speed folds the mRNA",
               "Coupled transcription–translation in bacteria lets a ribosome stalling at tandem Trp codons choose antiterminator vs. terminator")
    # Top: Low Trp -> Antiterminator 2:3 -> Transcription continues
    c.panel_box(24, 72, 712, 124, "Low tryptophan → ribosome stalls on UGG-UGG in Region 1 → Region 2 pairs with Region 3 (read-through)")
    c.line(48, 156, 700, 156, stroke=TEAL, sw=2.6)
    # Stalled ribosome over region 1
    c.ellipse(142, 154, 46, 22, fill=AMBER_BG, stroke=AMBER, sw=2)
    c.text(142, 158, "Ribosome stalled", size=9, weight="700", fill=AMBER, anchor="middle")
    c.text(142, 186, "Region 1 (Trp-Trp)", size=9, fill=SOFT, anchor="middle")
    # Hairpin 2:3
    c.path("M 294 156 L 294 118 C 294 102, 336 102, 336 118 L 336 156", stroke=TEAL, sw=2.8)
    for y in (126, 138, 148):
        c.line(298, y, 332, y, stroke=TEAL, sw=1.6)
    c.text(315, 176, "2 : 3 Antiterminator", size=9.5, weight="700", fill=TEAL_DK, anchor="middle")
    c.rect(424, 144, 52, 22, fill=PANEL, stroke=RULE, rx=4)
    c.text(450, 159, "Reg 4", size=9, fill=SOFT, anchor="middle")
    c.pill(534, 140, 176, 30, "RNA Pol transcribes trpEDCBA →", fill=TEAL_BG, stroke=TEAL, text_fill=TEAL_DK, size=9.5)

    # Bottom: High Trp -> Terminator 3:4 -> Premature stop
    c.panel_box(24, 212, 712, 132, "High tryptophan → ribosome speeds past Region 1 & covers Region 2 → Region 3 pairs with Region 4 (terminator!)")
    c.line(48, 302, 540, 302, stroke=ROSE, sw=2.6)
    c.ellipse(234, 300, 56, 22, fill=BLUE_BG, stroke=BLUE, sw=2)
    c.text(234, 304, "Ribosome covers 2", size=9, weight="700", fill=BLUE_DK, anchor="middle")
    # Hairpin 3:4 + poly-U
    c.path("M 382 302 L 382 260 C 382 244, 424 244, 424 260 L 424 302", stroke=ROSE, sw=3.0)
    for y in (268, 280, 290):
        c.line(386, y, 420, y, stroke=ROSE, sw=1.6)
    c.text(403, 322, "3 : 4 Terminator", size=9.5, weight="700", fill=ROSE_DK, anchor="middle")
    c.text(476, 296, "UUUUUU", size=9.5, weight="700", fill=ROSE_DK, mono=True)
    c.pill(554, 284, 158, 30, "RNA Pol dissociates (OFF)", fill=ROSE_BG, stroke=ROSE, text_fill=ROSE_DK, size=9.5)
    c.save(out / "fig-21b-trp-attenuation.svg")


def fig_22b(out: Path):
    c = Canvas(760, 355, "Modular transcription factors and pioneer opening of closed chromatin",
               "TFs separate DNA recognition (DBD) from effector recruitment (AD); pioneer factors unlock nucleosomal DNA for settler TFs")
    # Left: Modular TF architecture + domain swap
    c.panel_box(24, 72, 346, 264, "Two separable modules (proven by domain-swap)")
    # DBD + linker + AD
    c.rect(58, 126, 118, 46, fill=BLUE_BG, stroke=BLUE, sw=2, rx=10)
    c.text(117, 146, "DNA-Binding", size=10, weight="700", fill=BLUE_DK, anchor="middle")
    c.text(117, 161, "Domain (DBD)", size=9.5, fill=BLUE_DK, anchor="middle")
    c.line(176, 149, 218, 149, stroke=SOFT, sw=3)
    c.rect(218, 126, 124, 46, fill=AMBER_BG, stroke=AMBER, sw=2, rx=10)
    c.text(280, 146, "Activation", size=10, weight="700", fill=AMBER, anchor="middle")
    c.text(280, 161, "Domain (AD, IDR)", size=9.5, fill=AMBER, anchor="middle")
    # DNA below DBD
    c.line(48, 198, 224, 198, stroke=INK, sw=2.6)
    c.rect(86, 188, 62, 20, fill=TEAL_BG, stroke=TEAL, sw=1.4, rx=3)
    c.text(117, 202, "Motif", size=9.5, weight="700", fill=TEAL_DK, anchor="middle", mono=True)
    # Arrow from AD to Mediator/Pol II
    c.arrow(280, 174, 280, 204, color="amber", sw=1.8)
    c.pill(218, 208, 124, 24, "Mediator / p300 / Pol II", fill=TEAL_BG, stroke=TEAL, text_fill=TEAL_DK, size=9)
    c.multiline(197, 258, [
        "Classic DBD folds: Homeodomain (HTH), Zinc Finger,",
        "bZIP (leucine zipper), bHLH — all insert an α-helix",
        "into DNA's major groove. Swap DBDs → new target!",
    ], size=9.3, lh=15, fill=SOFT, anchor="middle")

    # Right: Pioneer TF opening chromatin
    c.panel_box(388, 72, 348, 264, "Pioneer TF unlocks closed chromatin for settler TFs")
    # Step 1: Closed nucleosomes
    c.text(406, 110, "Closed chromatin (inaccessible to ordinary TFs):", size=9.5, weight="700", fill=ROSE_DK)
    for nx in (442, 514, 586, 658):
        c.circle(nx, 160, 19, fill=PANEL, stroke=SOFT, sw=1.8)
        c.text(nx, 164, "Nuc", size=8.5, fill=FAINT, anchor="middle")
    c.line(412, 160, 690, 160, stroke=INK, sw=2, opacity=0.45)
    # Pioneer binding on nucleosome
    c.pill(478, 120, 74, 20, "Pioneer TF", fill=PURPLE_BG, stroke=PURPLE, text_fill=PURPLE, size=8.8)

    c.arrow(562, 184, 562, 206, color="teal", sw=2.0)
    c.text(640, 199, "SWI/SNF remodeller", size=9, weight="700", fill=TEAL_DK)

    # Step 2: Opened enhancer
    c.text(406, 224, "Open nucleosome-free region (ATAC-seq peak):", size=9.5, weight="700", fill=TEAL_DK)
    c.circle(432, 268, 20, fill=PANEL, stroke=SOFT, sw=1.8)
    c.circle(690, 268, 20, fill=PANEL, stroke=SOFT, sw=1.8)
    c.line(452, 268, 670, 268, stroke=TEAL, sw=3)
    c.pill(474, 240, 58, 20, "Pioneer", fill=PURPLE_BG, stroke=PURPLE, text_fill=PURPLE, size=8.5)
    c.pill(540, 240, 58, 20, "Settler 1", fill=BLUE_BG, stroke=BLUE, text_fill=BLUE_DK, size=8.5)
    c.pill(606, 240, 58, 20, "Settler 2", fill=AMBER_BG, stroke=AMBER, text_fill=AMBER, size=8.5)
    c.text(562, 312, "e.g. FOXA1, OCT4, SOX2 initiate cell-fate programmes.", size=9.4, fill=SOFT, anchor="middle")
    c.save(out / "fig-22b-tf-domains-pioneer.svg")


def fig_23b(out: Path):
    c = Canvas(760, 355, "Genomic imprinting at IGF2 / H19: parent-of-origin CTCF insulation",
               "Identical DNA sequence produces opposite expression on maternal vs. paternal chromosomes via ICR methylation")
    # Maternal allele (top)
    c.panel_box(24, 72, 712, 126, "Maternal chromosome: unmethylated ICR binds CTCF insulator → H19 ON, IGF2 OFF")
    c.line(54, 152, 706, 152, stroke=INK, sw=2.6)
    c.rect(108, 138, 108, 28, fill=PANEL, stroke=RULE, sw=1.5, rx=5)
    c.text(162, 156, "IGF2 (OFF)", size=10, weight="700", fill=FAINT, anchor="middle")
    # Unmethylated ICR + CTCF
    c.rect(286, 138, 92, 28, fill=TEAL_BG, stroke=TEAL, sw=1.6, rx=5)
    c.text(332, 156, "ICR (unmeth)", size=9.2, weight="700", fill=TEAL_DK, anchor="middle")
    c.pill(298, 106, 68, 24, "CTCF Wall", fill=BLUE_BG, stroke=BLUE, text_fill=BLUE_DK, size=9)
    # H19 ON + Enhancer
    c.rect(448, 138, 98, 28, fill=TEAL_BG, stroke=TEAL, sw=1.8, rx=5)
    c.text(497, 156, "H19 (ON)", size=10, weight="700", fill=TEAL_DK, anchor="middle")
    c.rect(604, 138, 86, 28, fill=AMBER_BG, stroke=AMBER, sw=1.8, rx=5)
    c.text(647, 156, "Enhancer", size=9.5, weight="700", fill=AMBER, anchor="middle")
    # Enhancer activates H19, blocked from IGF2
    c.path("M 647 136 Q 572 100, 502 134", stroke=AMBER, sw=2.2, marker="arr-amber")
    c.text(248, 122, "Blocked ✕", size=9.5, weight="700", fill=ROSE_DK, anchor="middle")

    # Paternal allele (bottom)
    c.panel_box(24, 214, 712, 126, "Paternal chromosome: methylated ICR prevents CTCF binding → enhancer loops to IGF2 ON")
    c.line(54, 296, 706, 296, stroke=INK, sw=2.6)
    c.rect(108, 282, 108, 28, fill=TEAL_BG, stroke=TEAL, sw=1.8, rx=5)
    c.text(162, 300, "IGF2 (ON)", size=10, weight="700", fill=TEAL_DK, anchor="middle")
    # Methylated ICR
    c.rect(286, 282, 92, 28, fill=ROSE_BG, stroke=ROSE, sw=1.6, rx=5)
    c.text(332, 300, "ICR (CH₃)", size=9.5, weight="700", fill=ROSE_DK, anchor="middle")
    for mx in (298, 320, 342, 364):
        c.circle(mx, 274, 5, fill=ROSE)
    c.rect(448, 282, 98, 28, fill=PANEL, stroke=RULE, sw=1.5, rx=5)
    c.text(497, 300, "H19 (OFF)", size=10, weight="700", fill=FAINT, anchor="middle")
    c.rect(604, 282, 86, 28, fill=AMBER_BG, stroke=AMBER, sw=1.8, rx=5)
    c.text(647, 300, "Enhancer", size=9.5, weight="700", fill=AMBER, anchor="middle")
    # Long-range loop over methylated ICR to IGF2
    c.path("M 647 280 Q 406 218, 170 280", stroke=AMBER, sw=2.4, marker="arr-amber")
    c.text(406, 246, "Enhancer loops freely over methylated ICR!", size=9.5, weight="700", fill=AMBER, anchor="middle")
    c.save(out / "fig-23b-imprinting-igf2-h19.svg")


def fig_25b(out: Path):
    c = Canvas(760, 360, "French-flag morphogen gradients and intercellular signalling relays",
               "Smooth ligand concentration gradients are decoded into sharp cell-fate stripes via receptor-to-nucleus signalling pathways")
    # Left: French flag morphogen gradient
    c.panel_box(24, 72, 344, 268, "Positional information: French-flag threshold decoding")
    x0, y0, pw, ph = 62, 232, 280, 118
    c.axes(x0, y0, pw, ph, xlabel="Position along embryo axis", ylabel="[Morphogen]")
    # Exponential decay curve
    pts = [(x0 + pw * k / 60, y0 - ph * 0.92 * math.exp(-2.8 * k / 60)) for k in range(61)]
    c.polyline(pts, stroke=TEAL, sw=2.8)
    # Two threshold lines T1 (high) and T2 (low)
    t1_y = y0 - ph * 0.50
    t2_y = y0 - ph * 0.20
    c.line(x0, t1_y, x0 + pw, t1_y, stroke=BLUE, sw=1.3, dash="4,3")
    c.line(x0, t2_y, x0 + pw, t2_y, stroke=ROSE, sw=1.3, dash="4,3")
    c.text(x0 + pw - 4, t1_y - 4, "Threshold T₁", size=8.8, weight="700", fill=BLUE_DK, anchor="end")
    c.text(x0 + pw - 4, t2_y - 4, "Threshold T₂", size=8.8, weight="700", fill=ROSE_DK, anchor="end")
    # Three sharp fate stripes below axis
    # x where exp(-2.8*f)=0.50/0.92 -> f=0.22; exp(-2.8*f)=0.20/0.92 -> f=0.54
    b1 = x0 + 0.22 * pw
    b2 = x0 + 0.54 * pw
    c.rect(x0, 266, b1 - x0, 28, fill=BLUE_BG, stroke=BLUE, sw=1.4)
    c.text((x0 + b1) / 2, 284, "Fate 1", size=9.5, weight="700", fill=BLUE_DK, anchor="middle")
    c.rect(b1, 266, b2 - b1, 28, fill=TEAL_BG, stroke=TEAL, sw=1.4)
    c.text((b1 + b2) / 2, 284, "Fate 2", size=9.5, weight="700", fill=TEAL_DK, anchor="middle")
    c.rect(b2, 266, x0 + pw - b2, 28, fill=ROSE_BG, stroke=ROSE, sw=1.4)
    c.text((b2 + x0 + pw) / 2, 284, "Fate 3", size=9.5, weight="700", fill=ROSE_DK, anchor="middle")
    c.text(196, 322, "Different enhancer affinities read T₁ vs. T₂ → sharp borders!", size=9.2, fill=SOFT, anchor="middle")

    # Right: Universal 4-step signalling pipeline
    c.panel_box(388, 72, 348, 268, "Universal cell-to-cell signalling architecture")
    steps = [
        (110, "1. Extracellular ligand", "Wnt, Shh, BMP, FGF, Delta", AMBER, AMBER_BG),
        (166, "2. Transmembrane receptor", "Frizzled, Patched, RTK, Notch", BLUE, BLUE_BG),
        (222, "3. Intracellular relay", "Kinase cascade (MAPK) or proteolysis", PURPLE, PURPLE_BG),
        (278, "4. Nuclear TF switch", "β-catenin / Gli / NICD → target genes", TEAL, TEAL_BG),
    ]
    for y, title, ex, col, bg in steps:
        c.rect(412, y, 300, 42, fill=bg, stroke=col, sw=1.5, rx=8)
        c.text(426, y + 18, title, size=10.2, weight="700", fill=col)
        c.text(426, y + 34, ex, size=9.4, fill=SOFT)
    for ay in (153, 209, 265):
        c.arrow(562, ay, 562, ay + 12, color="ink", sw=1.6)
    c.save(out / "fig-25b-morphogen-signaling.svg")


def fig_36b(out: Path):
    c = Canvas(760, 355, "Restriction cloning into a plasmid and quantitative PCR (qPCR) Ct curves",
               "Sticky ends paste a gene into a selectable plasmid vector; qPCR measures starting template by when fluorescence crosses threshold")
    # Left: Plasmid cloning
    c.panel_box(24, 72, 340, 264, "Recombinant plasmid cloning (cut → ligate → select)")
    # Plasmid ring
    c.circle(194, 186, 62, fill="none", stroke=TEAL, sw=7)
    # Inserted gene arc at top
    c.path("M 152 140 A 62 62 0 0 1 236 140", stroke=ROSE, sw=8)
    # ori and AmpR arcs
    c.path("M 134 198 A 62 62 0 0 0 184 247", stroke=BLUE, sw=8)
    c.path("M 204 247 A 62 62 0 0 0 254 198", stroke=AMBER, sw=8)
    c.text(194, 114, "Gene insert (sticky-end ligated)", size=9.5, weight="700", fill=ROSE_DK, anchor="middle")
    c.text(114, 242, "ori", size=10, weight="700", fill=BLUE_DK, anchor="middle", mono=True)
    c.text(278, 242, "AmpR", size=10, weight="700", fill=AMBER, anchor="middle", mono=True)
    c.text(194, 184, "Recombinant", size=9.8, weight="700", fill=INK, anchor="middle")
    c.text(194, 198, "Plasmid", size=9.8, weight="700", fill=INK, anchor="middle")
    c.multiline(194, 282, [
        "Same restriction enzyme (e.g. EcoRI) cuts vector + insert",
        "→ complementary overhangs anneal → T4 ligase seals.",
        "Plate on ampicillin: only transformed bacteria survive!",
    ], size=9.2, lh=14, fill=SOFT, anchor="middle")

    # Right: qPCR amplification curves
    c.panel_box(384, 72, 352, 264, "Real-time qPCR: ΔCt = 1 cycle per 2-fold template")
    x0, y0, pw, ph = 428, 274, 286, 152
    c.axes(x0, y0, pw, ph, xlabel="PCR cycle number", ylabel="Fluorescence",
           xticks=[(0.0, "0"), (0.33, "15"), (0.67, "30"), (1.0, "45")])
    # Threshold line
    ty = y0 - 0.34 * ph
    c.line(x0, ty, x0 + pw, ty, stroke=ROSE, sw=1.4, dash="4,3")
    c.text(x0 + 6, ty - 5, "Threshold", size=9, weight="700", fill=ROSE_DK)

    # 3 sigmoidal curves shifted by 3.32 cycles (10-fold dilutions)
    curves = [(18, TEAL, "100× (Ct=18)"), (21.3, BLUE, "10× (Ct=21.3)"), (24.6, AMBER, "1× (Ct=24.6)")]
    for ct, col, lbl in curves:
        pts = []
        for k in range(80):
            cyc = 45 * k / 79
            val = 1.0 / (1.0 + math.exp(-0.55 * (cyc - (ct + 2.5))))
            pts.append((x0 + (cyc / 45) * pw, y0 - val * 0.92 * ph))
        c.polyline(pts, stroke=col, sw=2.2)
    c.text(468, 128, "High", size=9, weight="700", fill=TEAL_DK)
    c.text(530, 128, "10× less", size=9, weight="700", fill=BLUE_DK)
    c.text(606, 128, "100× less", size=9, weight="700", fill=AMBER)
    c.text(562, 322, "Lower Ct = MORE starting RNA/DNA (2^ΔCt fold ratio).", size=9.4, weight="600", fill=TEAL_DK, anchor="middle")
    c.save(out / "fig-36b-cloning-qpcr.svg")


def fig_38b(out: Path):
    c = Canvas(760, 355, "dCas9 as a programmable genomic API (no DNA cutting)",
               "Disabling both nuclease domains (D10A + H840A) turns Cas9 into a guide-addressed delivery vehicle for any effector")
    # Center hub: dCas9 + sgRNA on DNA
    c.line(44, 152, 716, 152, stroke=INK, sw=3.2)
    c.rect(306, 108, 148, 56, fill=TEAL_BG, stroke=TEAL, sw=2.2, rx=14)
    c.text(380, 132, "dCas9 + sgRNA", size=11.5, weight="700", fill=TEAL_DK, anchor="middle")
    c.text(380, 149, "(binds 20 bp + PAM, no cut)", size=9, fill=SOFT, anchor="middle")

    # 4 fused effector modules below
    mods = [
        (24, "CRISPRi (Silencing)", ROSE, ROSE_BG, "Fused to KRAB repressor",
         "Recruits H3K9me3 + KAP1\nto shut down enhancers or\ngenes reversibly."),
        (206, "CRISPRa (Activation)", TEAL, TEAL_BG, "Fused to VP64 / p300",
         "Recruits Pol II or writes\nH3K27ac to activate silent\npromoters on demand."),
        (388, "Epigenome Editing", PURPLE, PURPLE_BG, "Fused to DNMT3A / TET1",
         "Writes or erases CpG\nmethylation at targeted\nregulatory elements."),
        (570, "Imaging & Proteomics", BLUE, BLUE_BG, "Fused to GFP / APEX2",
         "Tracks live 3D locus motion\nor biotinylates local proteins\nbound at one enhancer."),
    ]
    for x, title, col, bg, sub, desc in mods:
        cx = x + 83
        c.arrow(380, 166, cx, 198, color="ink", sw=1.5)
        c.rect(x, 202, 166, 132, fill=bg, stroke=col, sw=1.6, rx=10)
        c.text(cx, 224, title, size=10.8, weight="700", fill=col, anchor="middle")
        c.text(cx, 241, sub, size=9.2, weight="700", fill=INK, anchor="middle")
        c.multiline(cx, 264, desc.split("\n"), size=9.3, lh=15, fill=SOFT, anchor="middle")
    c.save(out / "fig-38b-dcas9-api.svg")


def fig_40b(out: Path):
    c = Canvas(760, 365, "How the four sequencing chemistries actually read a base",
               "Every platform trades off optical vs. electrical signal, ensemble averaging vs. single molecules, and read length vs. accuracy")
    cards = [
        (24, 72, "1. Sanger (ddNTP chain termination)", BLUE, BLUE_BG, [
            "Trace fluorescent dideoxy terminators",
            "(no 3′-OH) stop extension at random bases.",
            "Capillary electrophoresis sorts by length",
            "→ 1 clean ~800 bp chromatogram.",
        ]),
        (388, 72, "2. Illumina SBS (reversible terminators)", TEAL, TEAL_BG, [
            "Bridge PCR builds clonal clusters on glass.",
            "Each cycle adds 1 blocked fluorescent base,",
            "images billions of clusters, cleaves blocker",
            "→ ultra-cheap Q30 150–300 bp reads.",
        ]),
        (24, 218, "3. PacBio HiFi (SMRT ZMW polymerase)", AMBER, AMBER_BG, [
            "Single Pol in a zeptolitre well reads a",
            "circularised DNA molecule ~10–15 passes.",
            "Random errors cancel by consensus",
            "→ 15–25 kb reads at Q30+ (99.9%).",
        ]),
        (388, 218, "4. Oxford Nanopore (ionic current squiggle)", PURPLE, PURPLE_BG, [
            "Helicase ratchets native ssDNA through a",
            "protein pore; 5–6 bases in the constriction",
            "modulate picoamp ionic current directly",
            "→ 100 kb–Mb reads + native 5mC calling!",
        ]),
    ]
    for x, y, title, col, bg, lines in cards:
        c.box(x, y, 348, 128, title, lines, fill=bg, stroke=col, title_fill=col, title_size=10.8, body_size=9.7)
    c.save(out / "fig-40b-sequencing-chemistries.svg")


def fig_46b(out: Path):
    c = Canvas(760, 355, "Why local haplotype reassembly beats naive pileup calling near indels",
               "Independent per-read aligners scatter soft-clips and false SNPs around indels; assembling an active region resolves the true alleles")
    # Left: Messy pileup around a 3-bp deletion
    c.panel_box(24, 72, 344, 264, "Naive pileup near a 3-bp deletion (noisy!)")
    c.text(42, 114, "Ref:  A C G T A G C T T A G C A", size=10.2, weight="700", fill=INK, mono=True)
    pile = [
        ("R1:   A C G T - - - T T A G C A", TEAL_DK),
        ("R2:   A C G T A G C", SOFT),
        ("R3:   A C G T T T A G C A . . .", ROSE_DK),
        ("R4:   . . . T T A G C A  (clip!)", ROSE_DK),
        ("R5:   A C G T - - - T T A G C A", TEAL_DK),
    ]
    for i, (ln, col) in enumerate(pile):
        c.text(42, 144 + i * 24, ln, size=9.8, weight="600", fill=col, mono=True)
    c.rect(40, 266, 312, 54, fill=ROSE_BG, stroke=ROSE, sw=1.3, rx=6)
    c.multiline(196, 286, [
        "Reads ending near the deletion mismatch the ref",
        "→ pileup caller emits 2–3 FALSE SNPs!",
    ], size=9.4, lh=15, fill=ROSE_DK, anchor="middle")

    # Right: HaplotypeCaller local De Bruijn assembly
    c.panel_box(388, 72, 348, 264, "HaplotypeCaller: local De Bruijn graph + Pair-HMM")
    # Simple bubble graph inside active region
    c.pill(408, 154, 72, 26, "ACGTA", fill=TEAL_BG, stroke=TEAL, text_fill=TEAL_DK, size=9.5, mono=True)
    c.pill(516, 118, 90, 26, "Ref: AGCTT", fill=BLUE_BG, stroke=BLUE, text_fill=BLUE_DK, size=9.2, mono=True)
    c.pill(516, 190, 90, 26, "Alt: ---TT", fill=AMBER_BG, stroke=AMBER, text_fill=AMBER, size=9.2, mono=True)
    c.pill(642, 154, 72, 26, "TAGCA", fill=TEAL_BG, stroke=TEAL, text_fill=TEAL_DK, size=9.5, mono=True)
    c.arrow(482, 160, 514, 134, color="blue", sw=1.6)
    c.arrow(482, 174, 514, 200, color="amber", sw=1.6)
    c.arrow(608, 134, 640, 160, color="blue", sw=1.6)
    c.arrow(608, 200, 640, 174, color="amber", sw=1.6)

    c.rect(406, 238, 312, 82, fill=TEAL_BG, stroke=TEAL, sw=1.4, rx=6)
    c.multiline(562, 258, [
        "1. Assemble candidate haplotypes across active window.",
        "2. Score every read against each haplotype (Pair-HMM).",
        "3. Call ONE clean 3-bp deletion — zero false SNPs!",
    ], size=9.4, lh=16, fill=TEAL_DK, anchor="middle")
    c.save(out / "fig-46b-local-reassembly.svg")


def fig_50b(out: Path):
    c = Canvas(760, 345, "The Hi-C proximity ligation assay: turning 3D contacts into chimeric DNA reads",
               "Formaldehyde freezes distant enhancers and promoters together so ligation converts physical proximity into a sequenceable junction")
    steps = [
        (24, "1. Crosslink", TEAL, TEAL_BG, "Formaldehyde freezes\n3D chromatin contacts\ninside intact nuclei"),
        (170, "2. Digest", BLUE, BLUE_BG, "Restriction enzyme\n(e.g. MboI) cuts DNA\nleaving overhangs"),
        (316, "3. Biotin fill", AMBER, AMBER_BG, "Polymerase fills ends\nwith biotinylated\nnucleotides (tags)"),
        (462, "4. Ligate", PURPLE, PURPLE_BG, "Blunt ligation joins\n3D-adjacent fragments\ninto chimeric DNA"),
        (608, "5. Pull & Seq", ROSE, ROSE_BG, "Streptavidin enriches\nbiotin junctions →\npaired-end reads!"),
    ]
    for i, (x, title, col, bg, desc) in enumerate(steps):
        c.box(x, 82, 128, 146, title, desc.split("\n"), fill=bg, stroke=col, title_fill=col, title_size=10.8, body_size=9.2)
        if i < 4:
            c.arrow(x + 130, 155, x + 144, 155, color="ink", sw=1.8)

    # Bottom schematic of chimeric paired-end read mapping
    c.panel_box(24, 244, 712, 86, "From chimeric fragment to Hi-C contact matrix pixel (i, j)")
    c.rect(54, 282, 122, 24, fill=TEAL_BG, stroke=TEAL, sw=1.6, rx=4)
    c.text(115, 298, "Read 1 → locus i", size=9.5, weight="700", fill=TEAL_DK, anchor="middle")
    c.circle(188, 294, 8, fill=AMBER)
    c.rect(200, 282, 122, 24, fill=BLUE_BG, stroke=BLUE, sw=1.6, rx=4)
    c.text(261, 298, "Read 2 → locus j", size=9.5, weight="700", fill=BLUE_DK, anchor="middle")
    c.arrow(334, 294, 384, 294, color="ink", sw=1.8)
    c.multiline(398, 288, [
        "Each valid pair increments cell (i, j) in the genome-wide contact matrix.",
        "Note: 2× sharper bin resolution requires 4× more sequencing reads (O(N²))!",
    ], size=9.6, lh=16, fill=SOFT)
    c.save(out / "fig-50b-hic-assay.svg")


def fig_D1b(out: Path):
    c = Canvas(760, 360, "Action potential waveform and Ca²⁺-triggered synaptic transmission",
               "Voltage-gated Na⁺ and K⁺ channels propagate an all-or-none spike down the axon to trigger Ca²⁺-dependent vesicle release")
    # Left: Action potential voltage vs time
    c.panel_box(24, 72, 360, 268, "Action potential waveform (membrane potential mV)")
    x0, y0, pw, ph = 72, 286, 292, 174
    c.axes(x0, y0, pw, ph, xlabel="Time (ms)", ylabel="mV",
           xticks=[(0.0, "0"), (0.25, "1"), (0.5, "2"), (0.75, "3"), (1.0, "4")],
           yticks=[(0.12, "-70"), (0.26, "-55"), (0.64, "0"), (0.94, "+40")])
    # Threshold dashed line
    ty = y0 - 0.26 * ph
    c.line(x0, ty, x0 + pw, ty, stroke=AMBER, sw=1.3, dash="4,3")
    c.text(x0 + pw - 4, ty - 4, "Threshold (-55 mV)", size=8.8, weight="700", fill=AMBER, anchor="end")
    # Action potential curve
    ap = [
        (0.00, 0.14), (0.14, 0.14), (0.22, 0.26), (0.29, 0.68), (0.35, 0.94),
        (0.42, 0.62), (0.50, 0.22), (0.58, 0.05), (0.68, 0.08), (0.82, 0.14), (1.00, 0.14),
    ]
    c.polyline([(x0 + fx * pw, y0 - fy * ph) for fx, fy in ap], stroke=TEAL, sw=3.0)
    c.text(x0 + 0.24 * pw, y0 - 0.72 * ph, "Na⁺ in", size=9.5, weight="700", fill=ROSE_DK, anchor="end")
    c.text(x0 + 0.45 * pw, y0 - 0.66 * ph, "K⁺ out", size=9.5, weight="700", fill=BLUE_DK)
    c.text(x0 + 0.64 * pw, y0 - 0.09 * ph, "Refractory", size=8.8, weight="700", fill=PURPLE)

    # Right: Synaptic vesicle release & Purkinje Ca2+ load
    c.panel_box(402, 72, 334, 268, "Chemical synapse & Purkinje firing load")
    c.box(418, 106, 302, 102, "Presynaptic → Postsynaptic relay", [
        "1. Spike opens voltage-gated Ca²⁺ channels.",
        "2. Ca²⁺ triggers SNARE vesicle fusion.",
        "3. Glutamate → excitatory (Na⁺/Ca²⁺ in);",
        "   GABA → inhibitory (Cl⁻ in, hyperpolarises).",
    ], fill=BLUE_BG, stroke=BLUE, title_fill=BLUE_DK, title_size=10.5, body_size=9.4)

    c.box(418, 222, 302, 104, "Why Purkinje neurons live on a knife-edge", [
        "• Autonomous pacemaking at 40–100 Hz nonstop.",
        "• Climbing-fibre complex spikes flood dendrites",
        "  with massive Ca²⁺ transients every second.",
        "• ATP/mitochondrial failure (e.g. Bβ2!) is lethal.",
    ], fill=ROSE_BG, stroke=ROSE, title_fill=ROSE_DK, title_size=10.5, body_size=9.3)
    c.save(out / "fig-D1b-action-potential-synapse.svg")


def fig_D3b(out: Path):
    c = Canvas(760, 360, "How CAG repeat slip-outs and MutSβ/MutLγ drive somatic expansion",
               "Imperfect CAG hairpins fool mismatch repair into nicking the opposite strand — turning a repair pathway into an expansion engine")
    # Step 1: CAG slip-out hairpin
    c.panel_box(24, 72, 224, 268, "1. CAG slip-out hairpin forms")
    c.line(42, 194, 232, 194, stroke=INK, sw=2.6)
    c.path("M 42 172 L 106 172 L 106 134 C 106 116, 152 116, 152 134 L 152 172 L 232 172", stroke=ROSE, sw=2.8)
    for hy in (140, 152, 164):
        c.line(110, hy, 148, hy, stroke=AMBER, sw=1.6, dash="2,2")
    c.text(129, 114, "CAG·CAG loop", size=9.5, weight="700", fill=ROSE_DK, anchor="middle")
    c.text(129, 186, "(G–C pairs + A–A mismatches)", size=8.5, fill=SOFT, anchor="middle")
    c.multiline(136, 224, [
        "During transcription or base",
        "excision repair, repetitive",
        "CAG tracts slip out into a",
        "metastable hairpin loop.",
    ], size=9.4, lh=15, fill=SOFT, anchor="middle")

    # Step 2: MutSbeta + MutLgamma mis-repair
    c.panel_box(268, 72, 224, 268, "2. MutSβ + MutLγ nick wrong strand")
    c.line(286, 184, 372, 184, stroke=INK, sw=2.6)
    c.line(386, 184, 474, 184, stroke=INK, sw=2.6)
    c.text(379, 202, "MutLγ nick!", size=9, weight="700", fill=ROSE_DK, anchor="middle")
    c.path("M 286 162 L 352 162 L 352 126 C 352 108, 396 108, 396 126 L 396 162 L 474 162", stroke=ROSE, sw=2.6)
    c.pill(326, 114, 96, 24, "MutSβ (MSH2/3)", fill=PURPLE_BG, stroke=PURPLE, text_fill=PURPLE, size=9)
    c.multiline(380, 224, [
        "MutSβ binds & stabilizes the",
        "loop; MutLγ (MLH1/MLH3)",
        "nicks the OPPOSITE strand",
        "instead of excising the loop!",
    ], size=9.4, lh=15, fill=SOFT, anchor="middle")

    # Step 3: Gap fill locks in net expansion
    c.panel_box(512, 72, 224, 268, "3. Gap fill locks in +ΔCAG")
    c.line(530, 146, 718, 146, stroke=TEAL, sw=3.2)
    c.line(530, 174, 594, 174, stroke=INK, sw=2.6)
    c.line(594, 174, 658, 174, stroke=AMBER, sw=3.6)
    c.line(658, 174, 718, 174, stroke=INK, sw=2.6)
    c.text(626, 194, "New CAGs filled in!", size=9.5, weight="700", fill=AMBER, anchor="middle")
    c.rect(528, 214, 192, 108, fill=TEAL_BG, stroke=TEAL, sw=1.4, rx=8)
    c.multiline(624, 234, [
        "Repeats lengthen across decades",
        "in post-mitotic neurons!",
        "",
        "Explains why MSH3 / MLH3 / FAN1",
        "are top GWAS modifiers of",
        "onset age in repeat disorders.",
    ], size=9.2, lh=14, fill=TEAL_DK, anchor="middle")
    c.save(out / "fig-D3b-cag-hairpin-mmr.svg")


def build_all(out: Path):
    for fn in [fig_17b, fig_21b, fig_22b, fig_23b, fig_25b, fig_36b,
               fig_38b, fig_40b, fig_46b, fig_50b, fig_D1b, fig_D3b]:
        fn(out)
    print("Generated 12 Wave-2 SVGs for Parts 4–10 & D")
