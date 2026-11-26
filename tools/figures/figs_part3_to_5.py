"""Generate 16 precision SVG diagrams for Parts 3, 4, and 5 (Chapters 16–29)."""
from __future__ import annotations

import math
from pathlib import Path
from svg_kit import (
    AMBER, AMBER_BG, BG, BLUE, BLUE_BG, BLUE_DK, DNA, DNA_BG, EMERALD, FAINT,
    GOLD, GREEN, GREEN_BG, INK, PANEL, PURPLE, PURPLE_BG, ROSE, ROSE_BG,
    ROSE_DK, RULE, RULE_LT, SOFT, SUNK, TEAL, TEAL_BG, TEAL_DK, Canvas,
)


def fig_16(out: Path):
    c = Canvas(760, 360, "Mutation types: transitions vs. transversions and coding consequences",
               "Transitions (purine↔purine, pyrimidine↔pyrimidine) occur ~2× more often despite 2× fewer possible paths")
    # Left: Transition vs Transversion diagram
    c.panel_box(24, 72, 260, 268, "Transitions (2) vs Transversions (4)")
    nodes = [("A", 92, 146), ("G", 216, 146), ("C", 92, 260), ("T", 216, 260)]
    c.text(154, 114, "Purines (2 rings)", size=10, weight="700", fill=TEAL_DK, anchor="middle")
    c.text(154, 304, "Pyrimidines (1 ring)", size=10, weight="700", fill=BLUE_DK, anchor="middle")
    # Transitions (horizontal)
    c.line(116, 146, 192, 146, stroke=TEAL, sw=2.6, marker="arr-teal")
    c.line(192, 146, 116, 146, stroke=TEAL, sw=2.6, marker="arr-teal")
    c.line(116, 260, 192, 260, stroke=TEAL, sw=2.6, marker="arr-teal")
    c.line(192, 260, 116, 260, stroke=TEAL, sw=2.6, marker="arr-teal")
    c.text(154, 136, "Transition", size=9.5, weight="700", fill=TEAL_DK, anchor="middle")
    c.text(154, 280, "Transition", size=9.5, weight="700", fill=TEAL_DK, anchor="middle")
    # Transversions (vertical + diagonal)
    for (x1, y1), (x2, y2) in [((92, 168), (92, 238)), ((216, 168), (216, 238)), ((110, 164), (198, 242)), ((198, 164), (110, 242))]:
        c.line(x1, y1, x2, y2, stroke=ROSE, sw=1.4, dash="3,3")
    c.text(154, 206, "Transversions", size=9.5, weight="700", fill=ROSE_DK, anchor="middle")
    for b, nx, ny in nodes:
        c.circle(nx, ny, 20, fill=DNA_BG[b], stroke=DNA[b], sw=2)
        c.text(nx, ny + 5, b, size=14, weight="700", fill=DNA[b], anchor="middle", mono=True)
    c.text(154, 326, "CpG deamination (5mC → T) drives Ti/Tv ≈ 2.1", size=9.5, fill=SOFT, anchor="middle")

    # Right: Coding effects
    c.panel_box(304, 72, 432, 268, "Coding-sequence consequences of substitutions & indels")
    rows = [
        ("Wild type", "AUG  UUC  CAG  GGA", "Met - Phe - Gln - Gly", TEAL_BG, TEAL),
        ("Synonymous", "AUG  UUU  CAG  GGA", "Met - Phe - Gln - Gly  (same aa)", GREEN_BG, GREEN),
        ("Missense", "AUG  UUC  CUG  GGA", "Met - Phe - Leu - Gly  (1 aa swap)", BLUE_BG, BLUE),
        ("Nonsense", "AUG  UUC  UAG  GGA", "Met - Phe - STOP  (NMD / truncated)", AMBER_BG, AMBER),
        ("Frameshift", "AUG  UUC  AGG  GA...", "Met - Phe - Arg - ...  (all shifted)", ROSE_BG, ROSE),
    ]
    for idx, (lbl, seq, prot, bg, col) in enumerate(rows):
        yy = 104 + idx * 44
        c.pill(318, yy + 4, 88, 24, lbl, fill=bg, stroke=col, text_fill=col, size=9.5)
        c.text(418, yy + 20, seq, size=10.5, weight="700", fill=INK, mono=True)
        c.text(566, yy + 20, prot, size=10, fill=SOFT)
    c.save(out / "fig-16-mutation-types.svg")


def fig_17(out: Path):
    c = Canvas(760, 365, "The five DNA repair pathways matched to their lesion",
               "Every single-strand repair exploits the intact complementary strand; double-strand breaks force a harder choice")
    rows = [
        ("BER (Base Excision)", "Small base damage\n(uracil, 8-oxoG)", TEAL, TEAL_BG, "Glycosylase clips base → AP endonuclease → Pol β → Ligase"),
        ("NER (Nucleotide Excision)", "Bulky helix distortions\n(UV pyrimidine dimers)", BLUE, BLUE_BG, "Excises ~25–30 nt oligomer around lesion → Pol δ/ε fills gap"),
        ("MMR (Mismatch Repair)", "Replication errors &\nsmall slippage loops", PURPLE, PURPLE_BG, "MSH2/6 or MSH2/3 detects mismatch → nicked new strand excised"),
        ("DSB · NHEJ (fast, any phase)", "Double-strand break\n(no template used)", AMBER, AMBER_BG, "Ku70/80 binds ends → ligates directly → small indels / scars"),
        ("DSB · HDR (S/G2 phase)", "Double-strand break\n(sister chromatid copy)", GREEN, GREEN_BG, "5′ resection → RAD51 invades sister chromatid → exact repair"),
    ]
    for idx, (name, lesion, col, bg, mech) in enumerate(rows):
        yy = 74 + idx * 54
        c.rect(24, yy, 184, 44, fill=bg, stroke=col, sw=1.5, rx=7)
        c.text(116, yy + 26, name, size=10.5, weight="700", fill=col, anchor="middle")
        c.rect(222, yy, 168, 44, fill=PANEL, stroke=RULE, sw=1.2, rx=7)
        c.multiline(306, yy + 18, lesion.split("\n"), size=9.8, lh=14, fill=INK, anchor="middle")
        c.arrow(392, yy + 22, 418, yy + 22, color="ink", sw=1.6)
        c.rect(422, yy, 314, 44, fill="#ffffff", stroke=col, sw=1.2, rx=7)
        c.text(434, yy + 26, mech, size=10, fill=SOFT)
    c.save(out / "fig-17-dna-repair.svg")


def fig_18(out: Path):
    c = Canvas(760, 365, "Homologous recombination: DSB repair and meiotic crossing-over",
               "One molecular machine repairs broken forks (mostly non-crossovers) and generates meiotic chiasmata (crossovers)")
    steps = [
        (24, "1. DSB & Resection", TEAL, TEAL_BG, "Spo11 / damage breaks duplex;\n5′→3′ resection leaves 3′ tails"),
        (206, "2. Strand Invasion", BLUE, BLUE_BG, "RAD51/DMC1 filament invades\nhomolog, displacing a D-loop"),
        (388, "3. Double Holliday", PURPLE, PURPLE_BG, "DNA synthesis + second-end\ncapture forms two junctions"),
        (570, "4. Resolution", AMBER, AMBER_BG, "Cut orientation decides\nCrossover vs Non-crossover"),
    ]
    for i, (x, t, col, bg, d) in enumerate(steps):
        c.box(x, 76, 166, 76, t, d.split("\n"), fill=bg, stroke=col, title_fill=col, body_size=9.8)
        if i < 3:
            c.arrow(x + 168, 114, x + 202, 114, color="ink", sw=1.8)

    # Bottom visual: D-loop & two resolution outcomes
    c.panel_box(24, 174, 344, 168, "D-loop & double Holliday junction")
    # Blue top duplex, Amber bottom duplex exchanging
    c.line(48, 224, 344, 224, stroke=BLUE, sw=2.6)
    c.path("M 48 242 L 138 242 L 164 282 L 238 282 L 264 242 L 344 242", stroke=BLUE, sw=2.6)
    c.path("M 48 282 L 138 282 L 164 242 L 238 242 L 264 282 L 344 282", stroke=AMBER, sw=2.6)
    c.line(48, 300, 344, 300, stroke=AMBER, sw=2.6)
    c.text(152, 266, "HJ1", size=9.5, weight="700", fill=ROSE_DK, anchor="middle")
    c.text(252, 266, "HJ2", size=9.5, weight="700", fill=ROSE_DK, anchor="middle")
    c.text(196, 326, "Heteroduplex patch → gene conversion if mismatched", size=9.8, fill=SOFT, anchor="middle")

    c.panel_box(392, 174, 344, 168, "Two genetic outcomes")
    c.box(412, 210, 304, 52, "Crossover (flanking markers swapped)", ["Required in meiosis I (≥1 per chromosome) to hold homologs"], fill=PURPLE_BG, stroke=PURPLE, title_fill=PURPLE, body_size=9.8)
    c.box(412, 276, 304, 52, "Non-crossover / SDSA (flanks intact)", ["Preferred in somatic cells to avoid loss of heterozygosity"], fill=GREEN_BG, stroke=GREEN, title_fill=GREEN, body_size=9.8)
    c.save(out / "fig-18-homologous-recombination.svg")


def fig_19(out: Path):
    c = Canvas(760, 355, "Transposable elements: copy-and-paste vs. cut-and-paste",
               "Mobile DNA accounts for ~45% of the human genome — dominated by Class I retrotransposons (LINEs, SINEs/Alu, LTRs)")
    # Left: Class I Retrotransposon
    c.panel_box(24, 72, 346, 174, "Class I · Retrotransposons (Copy & Paste via RNA)", fill=TEAL_BG, stroke=TEAL, header_fill=TEAL_DK)
    c.box(44, 108, 76, 44, "Donor DNA", [], fill="#ffffff", stroke=TEAL, title_fill=TEAL_DK, title_size=10.5)
    c.arrow(122, 130, 152, 130, color="teal", sw=1.8)
    c.box(156, 108, 76, 44, "RNA copy", [], fill=ROSE_BG, stroke=ROSE, title_fill=ROSE_DK, title_size=10.5)
    c.arrow(234, 130, 264, 130, color="rose", sw=1.8)
    c.box(268, 108, 86, 44, "New cDNA", [], fill="#ffffff", stroke=TEAL, title_fill=TEAL_DK, title_size=10.5)
    c.text(197, 178, "Reverse transcriptase (LINE-1 ORF2p) copies RNA → DNA", size=10, weight="600", fill=SOFT, anchor="middle")
    c.text(197, 198, "Original copy stays → genome grows exponentially!", size=10, weight="700", fill=TEAL_DK, anchor="middle")
    c.text(197, 224, "Human examples: LINE-1 (autonomous), Alu (parasitic SINE)", size=9.8, fill=FAINT, anchor="middle")

    # Right: Class II DNA transposon
    c.panel_box(390, 72, 346, 174, "Class II · DNA Transposons (Cut & Paste)", fill=AMBER_BG, stroke=AMBER, header_fill=AMBER)
    c.box(410, 108, 92, 44, "TIR–Gene–TIR", [], fill="#ffffff", stroke=AMBER, title_fill=AMBER, title_size=10.5)
    c.arrow(504, 130, 566, 130, color="amber", sw=1.8)
    c.text(535, 118, "Transposase", size=9.5, weight="700", fill=AMBER, anchor="middle")
    c.box(570, 108, 146, 44, "Inserted at new site", ["+ target-site duplications"], fill="#ffffff", stroke=AMBER, title_fill=AMBER, title_size=10.5, body_size=9)
    c.text(563, 184, "Excised as DNA and pasted elsewhere (leaves DSB scar)", size=10, weight="600", fill=SOFT, anchor="middle")
    c.text(563, 206, "Inactive fossils in humans (~3% of genome), active in bacteria", size=9.8, fill=FAINT, anchor="middle")

    # Bottom stacked bar of human genome TE share
    c.text(24, 274, "Share of the human genome (3.1 Gb):", size=11, weight="700", fill=INK)
    segs = [
        ("LINEs ~21%", 0.21, TEAL),
        ("SINEs/Alu ~13%", 0.13, BLUE),
        ("LTR/ERV ~8%", 0.08, PURPLE),
        ("DNA TE 3%", 0.03, AMBER),
        ("Coding 1.5%", 0.03, ROSE),
        ("Introns, regulatory & other unique/satellite ~53%", 0.52, "#94a3b8"),
    ]
    sx = 24
    tot_w = 712
    for lbl, frac, col in segs:
        sw = tot_w * frac
        c.rect(sx, 286, sw - 2, 28, fill=col, rx=4)
        if sw >= 68:
            c.text(sx + sw / 2, 304, lbl, size=9.5, weight="700", fill="#ffffff", anchor="middle")
        sx += sw
    c.text(24, 334, "Coding exons (rose sliver, ~1.5%) are dwarfed ~30× by transposable-element sequence (~45%).", size=10.2, fill=SOFT)
    c.save(out / "fig-19-transposons.svg")


def fig_20(out: Path):
    c = Canvas(760, 365, "Chromosomal structural rearrangements and meiotic nondisjunction",
               "Balanced rearrangements keep gene dosage intact in carriers yet produce unbalanced gametes during meiosis")
    # Left: 4 structural rearrangements on ABCDE chromosome
    c.panel_box(24, 72, 412, 274, "Structural rearrangements (reference: A · B · C · D · E)")
    def chrom_bar(x, y, blocks, label):
        c.text(x, y + 14, label, size=10.5, weight="700", fill=INK)
        bx = x + 112
        for txt, col, bg in blocks:
            c.rect(bx, y, 36, 22, fill=bg, stroke=col, sw=1.4, rx=4)
            c.text(bx + 18, y + 15, txt, size=10.5, weight="700", fill=col, anchor="middle", mono=True)
            bx += 40
    chrom_bar(38, 106, [("A", TEAL, TEAL_BG), ("B", BLUE, BLUE_BG), ("C", PURPLE, PURPLE_BG), ("D", AMBER, AMBER_BG), ("E", ROSE, ROSE_BG)], "Reference")
    chrom_bar(38, 148, [("A", TEAL, TEAL_BG), ("B", BLUE, BLUE_BG), ("D", AMBER, AMBER_BG), ("E", ROSE, ROSE_BG)], "Deletion (-C)")
    chrom_bar(38, 190, [("A", TEAL, TEAL_BG), ("B", BLUE, BLUE_BG), ("C", PURPLE, PURPLE_BG), ("C", PURPLE, PURPLE_BG), ("D", AMBER, AMBER_BG), ("E", ROSE, ROSE_BG)], "Duplication")
    chrom_bar(38, 232, [("A", TEAL, TEAL_BG), ("D", AMBER, AMBER_BG), ("C", PURPLE, PURPLE_BG), ("B", BLUE, BLUE_BG), ("E", ROSE, ROSE_BG)], "Inversion")
    chrom_bar(38, 274, [("A", TEAL, TEAL_BG), ("B", BLUE, BLUE_BG), ("X", GREEN, GREEN_BG), ("Y", GREEN, GREEN_BG)], "Translocation")
    c.text(230, 326, "Inversions suppress recombination; Robertsonian fusions join two acrocentrics.", size=9.8, fill=SOFT, anchor="middle")

    # Right: Nondisjunction M1 vs M2
    c.panel_box(454, 72, 282, 274, "Nondisjunction → Aneuploidy (n+1, n−1)")
    c.box(470, 108, 250, 96, "Meiosis I failure (homologs fail)", [
        "100% of gametes are abnormal:",
        "two (n+1) disomic + two (n−1) nullisomic",
        "Carries BOTH parental homologs",
    ], fill=ROSE_BG, stroke=ROSE, title_fill=ROSE_DK, body_size=9.8)
    c.box(470, 224, 250, 96, "Meiosis II failure (sisters fail)", [
        "50% normal (n) gametes,",
        "one (n+1) + one (n−1) abnormal",
        "Trisomy carries two sister copies",
    ], fill=AMBER_BG, stroke=AMBER, title_fill=AMBER, body_size=9.8)
    c.save(out / "fig-20-chromosome-rearrangements.svg")


def fig_20a(out: Path):
    c = Canvas(760, 360, "Horizontal gene transfer in bacteria and cis/trans complementation",
               "Bacteria exchange DNA via transformation, Hfr conjugation (time-mapped), and phage transduction")
    modes = [
        (24, "1. Transformation", TEAL, TEAL_BG, ["Uptake of naked DNA", "from environment", "Proved DNA = genetic", "material (Avery 1944)"]),
        (206, "2. Conjugation (Hfr)", BLUE, BLUE_BG, ["Pilus transfers linear", "chromosome from oriT", "Interrupted mating maps", "genes in minutes!"]),
        (388, "3. Transduction", PURPLE, PURPLE_BG, ["Bacteriophage carries", "bacterial DNA:", "Generalized (random)", "Specialized (near att)"]),
        (570, "4. Complementation", AMBER, AMBER_BG, ["Merodiploid (m1/m2):", "Wild-type → 2 genes", "Mutant → same gene", "(or cis-acting site)"]),
    ]
    for x, t, col, bg, lines in modes:
        c.rect(x, 76, 166, 178, fill=bg, stroke=col, sw=1.5, rx=10)
        c.text(x + 83, 100, t, size=11.5, weight="700", fill=col, anchor="middle")
        c.line(x + 14, 108, x + 152, 108, stroke=col, sw=0.8, opacity=0.4)
        c.multiline(x + 83, 134, lines, size=10.5, lh=20, fill=INK, anchor="middle")

    # Bottom cis vs trans schematic
    c.rect(24, 274, 712, 66, fill=PANEL, stroke=RULE, rx=8)
    c.text(38, 296, "Complementation logic:", size=11, weight="700", fill=INK)
    c.text(190, 296, "m1⁻ m2⁺  /  m1⁺ m2⁻  (trans)", size=11, weight="700", fill=TEAL_DK, mono=True)
    c.text(430, 296, "→  Both good proteins exist → Wild-type (+)", size=10.5, fill=GREEN, weight="600")
    c.text(190, 322, "m1a⁻  /  m1b⁻  (same gene)", size=11, weight="700", fill=ROSE_DK, mono=True)
    c.text(430, 322, "→  Zero functional copies → Mutant (−)", size=10.5, fill=ROSE_DK, weight="600")
    c.save(out / "fig-20a-bacterial-genetics.svg")


def fig_21(out: Path):
    c = Canvas(760, 365, "The E. coli lac operon: a two-input biological AND gate",
               "High transcription requires BOTH lactose present (removes LacI repressor) AND glucose absent (activates CAP–cAMP)")
    # Operon architecture at top
    c.line(36, 108, 724, 108, stroke=INK, sw=3)
    blocks = [
        (46, 62, "lacI", FAINT, SUNK), (126, 54, "CAP", BLUE, BLUE_BG), (184, 52, "P", TEAL, TEAL_BG),
        (240, 48, "O", ROSE, ROSE_BG), (298, 128, "lacZ (β-gal)", GREEN, GREEN_BG),
        (434, 128, "lacY (permease)", GREEN, GREEN_BG), (570, 128, "lacA", GREEN, GREEN_BG),
    ]
    for bx, bw, lbl, col, bg in blocks:
        c.rect(bx, 90, bw, 36, fill=bg, stroke=col, sw=1.6, rx=5)
        c.text(bx + bw / 2, 112, lbl, size=10, weight="700", fill=col, anchor="middle")
    c.text(77, 82, "trans repressor", size=9, fill=FAINT, anchor="middle")
    c.text(210, 82, "cis promoter/operator", size=9, fill=ROSE_DK, anchor="middle")

    # 4-state logic table
    states = [
        ("Glucose HIGH", "Lactose ABSENT", "CAP off · LacI BOUND", "OFF (basal)", ROSE_BG, ROSE),
        ("Glucose LOW", "Lactose ABSENT", "CAP bound · LacI BOUND", "OFF (repressed)", AMBER_BG, AMBER),
        ("Glucose HIGH", "Lactose PRESENT", "CAP off · LacI released", "LOW (weak Pol)", BLUE_BG, BLUE),
        ("Glucose LOW", "Lactose PRESENT", "CAP–cAMP bound · LacI off", "HIGH (1000× ON!)", GREEN_BG, GREEN),
    ]
    for idx, (glu, lac, state, out_lbl, bg, col) in enumerate(states):
        yy = 152 + idx * 46
        c.rect(24, yy, 712, 38, fill=bg, stroke=col, sw=1.3, rx=7)
        c.text(42, yy + 23, glu, size=10.5, weight="700", fill=INK)
        c.text(168, yy + 23, lac, size=10.5, weight="700", fill=INK)
        c.text(320, yy + 23, state, size=10.5, fill=SOFT)
        c.pill(562, yy + 6, 158, 26, out_lbl, fill="#ffffff", stroke=col, text_fill=col, size=10)
    c.text(380, 350, "Mutant check: Oᶜ (operator constitutive) acts strictly in cis; lacI⁻ acts in trans (rescued by a second lacI⁺ copy).", size=10, fill=FAINT, anchor="middle")
    c.save(out / "fig-21-lac-operon.svg")


def fig_22(out: Path):
    c = Canvas(760, 365, "Eukaryotic transcriptional regulation: distal enhancer looping",
               "Enhancers can sit 50+ kb upstream, downstream, or inside introns — contacting promoters via 3D DNA looping and Mediator")
    # Looped chromatin path
    c.path("M 42 260 L 140 260 C 180 260, 140 100, 260 100 C 370 100, 320 260, 420 260 L 722 260", stroke=INK, sw=3.2)
    # Cohesin ring holding loop base
    c.ellipse(164, 244, 18, 28, fill="none", stroke=PURPLE, sw=3)
    c.text(164, 290, "CTCF + Cohesin", size=9.5, weight="700", fill=PURPLE, anchor="middle")

    # Enhancer on loop apex
    c.rect(206, 86, 114, 28, fill=AMBER_BG, stroke=AMBER, sw=1.8, rx=6)
    c.text(263, 104, "Distal Enhancer", size=10.5, weight="700", fill=AMBER, anchor="middle")
    # Activator TFs bound to enhancer
    for tx, tlbl in [(226, "TF1"), (263, "TF2"), (300, "TF3")]:
        c.circle(tx, 134, 15, fill=BLUE_BG, stroke=BLUE, sw=1.6)
        c.text(tx, 138, tlbl, size=9, weight="700", fill=BLUE_DK, anchor="middle")

    # Mediator bridge connecting TFs to Pol II
    c.ellipse(342, 182, 54, 34, fill=PURPLE_BG, stroke=PURPLE, sw=1.8)
    c.text(342, 180, "Mediator", size=11, weight="700", fill=PURPLE, anchor="middle")
    c.text(342, 195, "coactivator", size=9.5, fill=SOFT, anchor="middle")

    # Core promoter + Pol II + GTFs
    c.rect(396, 246, 102, 28, fill=TEAL_BG, stroke=TEAL, sw=1.8, rx=5)
    c.text(447, 264, "Core Promoter", size=10, weight="700", fill=TEAL_DK, anchor="middle")
    c.ellipse(456, 212, 46, 24, fill=TEAL_BG, stroke=TEAL, sw=2)
    c.text(456, 216, "RNA Pol II", size=10.5, weight="700", fill=TEAL_DK, anchor="middle")
    c.rect(524, 244, 178, 32, fill=GREEN_BG, stroke=GREEN, sw=1.8, rx=6)
    c.text(613, 264, "Target Gene Body →", size=11, weight="700", fill=GREEN, anchor="middle")
    c.arrow(498, 224, 540, 224, color="teal", sw=2.2)

    # Bottom notes
    c.rect(24, 308, 712, 42, fill=PANEL, stroke=RULE_LT, rx=8)
    c.text(380, 333, "Combinatorial control: one gene can use distinct enhancers in brain vs liver — mutations in an enhancer alter only one tissue.", size=10.5, fill=SOFT, anchor="middle")
    c.save(out / "fig-22-eukaryotic-enhancer.svg")


def fig_23(out: Path):
    c = Canvas(760, 355, "Chromatin states and histone modifications",
               "Histone tails and DNA methylation recruit chromatin remodelers, switching loci between accessible and silenced states")
    # Top: Open active chromatin
    c.panel_box(24, 72, 712, 118, "Active Euchromatin — acetylated lysines neutralize positive histone charge", fill=GREEN_BG, stroke=GREEN, header_fill=GREEN)
    c.line(48, 134, 712, 134, stroke=TEAL, sw=3)
    for nx in (120, 280, 440, 600):
        c.circle(nx, 134, 20, fill="#ffffff", stroke=GREEN, sw=2)
        c.text(nx, 138, "Nuc", size=9.5, weight="700", fill=GREEN, anchor="middle")
        c.pill(nx - 24, 96, 48, 18, "Ac", fill=AMBER_BG, stroke=AMBER, text_fill=AMBER, size=9)
    c.pill(168, 152, 86, 20, "H3K4me3 (TSS)", fill="#ffffff", stroke=TEAL, text_fill=TEAL_DK, size=9)
    c.pill(326, 152, 92, 20, "H3K27ac (Enh)", fill="#ffffff", stroke=AMBER, text_fill=AMBER, size=9)
    c.pill(488, 152, 94, 20, "Unmethyl CpG", fill="#ffffff", stroke=GREEN, text_fill=GREEN, size=9)

    # Bottom: Compact silent chromatin
    c.panel_box(24, 208, 712, 128, "Silent Heterochromatin — tightly packed nucleosomes + repressive marks", fill=ROSE_BG, stroke=ROSE, header_fill=ROSE_DK)
    c.line(48, 272, 712, 272, stroke=ROSE_DK, sw=3)
    for nx in range(110, 410, 46):
        c.circle(nx, 272, 19, fill="#ffffff", stroke=ROSE, sw=2)
        c.text(nx, 276, "Nuc", size=9, weight="700", fill=ROSE_DK, anchor="middle")
        c.circle(nx, 246, 7, fill=ROSE)
        c.text(nx, 249, "M", size=8, weight="700", fill="#ffffff", anchor="middle")
    c.multiline(456, 252, [
        "• H3K27me3 (PRC2 / Polycomb): facultative silencing",
        "• H3K9me3 (HP1): constitutive repeat silencing",
        "• 5mC at CpG promoters: locks long-term repression",
        "• Writers (HAT/HMT) · Readers (Bromo/Chromo) · Erasers",
    ], size=10.2, lh=17, fill=INK)
    c.save(out / "fig-23-epigenetics-chromatin.svg")


def fig_24(out: Path):
    c = Canvas(760, 355, "Post-transcriptional RNA silencing: miRNA and siRNA via RISC",
               "Base-pairing between a 21–23 nt guide RNA and target mRNA determines translational repression vs. direct cleavage")
    # Biogenesis pipeline top
    steps = [
        (24, "pri-miRNA", TEAL, TEAL_BG, "Nuclear hairpin\n(Pol II transcript)"),
        (170, "Drosha", BLUE, BLUE_BG, "Crops stem-loop\n→ pre-miRNA"),
        (316, "Exportin-5", PURPLE, PURPLE_BG, "Exports hairpin\nto cytoplasm"),
        (462, "Dicer", AMBER, AMBER_BG, "Cuts ~22 nt\nduplex RNA"),
        (608, "Ago / RISC", ROSE, ROSE_BG, "Loads guide strand\nto scan mRNAs"),
    ]
    for i, (x, t, col, bg, d) in enumerate(steps):
        c.box(x, 78, 128, 72, t, d.split("\n"), fill=bg, stroke=col, title_fill=col, title_size=11, body_size=9.5)
        if i < 4:
            c.arrow(x + 130, 114, x + 166, 114, color="ink", sw=1.6)

    # Bottom: Two targeting outcomes
    c.panel_box(24, 174, 344, 160, "Imperfect match (animal miRNA — seed nt 2–8)", fill=BLUE_BG, stroke=BLUE, header_fill=BLUE_DK)
    c.text(44, 218, "mRNA 3′ UTR:  5′- ... G U A C U A A C ... -3′", size=10, weight="700", fill=INK, mono=True)
    c.text(44, 238, "miRNA guide:  3′- ... C A U G A U U G ... -5′", size=10, weight="700", fill=BLUE_DK, mono=True)
    c.rect(198, 206, 98, 38, fill="none", stroke=AMBER, sw=1.6, rx=4, dash="3,2")
    c.text(247, 258, "Seed (nt 2–8)", size=9.5, weight="700", fill=AMBER, anchor="middle")
    c.multiline(44, 286, ["→ Blocks translation & recruits deadenylase (decay).", "→ One miRNA subtly tunes hundreds of targets."], size=10, lh=16, fill=SOFT)

    c.panel_box(392, 174, 344, 160, "Perfect match (siRNA / therapeutic RNAi)", fill=ROSE_BG, stroke=ROSE, header_fill=ROSE_DK)
    c.text(412, 218, "Target mRNA:  5′- ... C G A U G C A U G ... -3′", size=10, weight="700", fill=INK, mono=True)
    c.text(412, 238, "siRNA guide:  3′- ... G C U A C G U A C ... -5′", size=10, weight="700", fill=ROSE_DK, mono=True)
    c.text(566, 258, "✂ Ago2 catalytic cleavage", size=10, weight="700", fill=ROSE_DK, anchor="middle")
    c.multiline(412, 286, ["→ Endonucleolytic cut → rapid mRNA degradation.", "→ Basis of siRNA drugs (e.g. patisiran, allele-specific)."], size=10, lh=16, fill=SOFT)
    c.save(out / "fig-24-rna-regulation.svg")


def fig_25(out: Path):
    c = Canvas(760, 360, "Core regulatory network motifs and Waddington's fate landscape",
               "Small 1-to-3-gene feedback and feed-forward circuits generate memory, noise-filtering delays, and pulses")
    # 4 motif cards
    cards = [
        (24, 72, "Negative autoregulation", TEAL, TEAL_BG, "Speeds response &\ndampens noise"),
        (206, 72, "Toggle switch (double −)", PURPLE, PURPLE_BG, "Bistable cell-fate\nmemory (A or B)"),
        (388, 72, "Coherent FFL (AND)", BLUE, BLUE_BG, "Filters brief noise;\nsustained input only"),
        (570, 72, "Incoherent FFL", AMBER, AMBER_BG, "Generates sharp\ntransient pulse"),
    ]
    for i, (x, y, t, col, bg, desc) in enumerate(cards):
        c.rect(x, y, 166, 174, fill=bg, stroke=col, sw=1.4, rx=10)
        c.text(x + 83, y + 20, t, size=10.5, weight="700", fill=col, anchor="middle")
        cx, cy = x + 83, y + 84
        if i == 0:
            c.circle(cx, cy, 18, fill="#ffffff", stroke=col, sw=2)
            c.text(cx, cy + 4, "X", size=12, weight="700", fill=col, anchor="middle")
            c.path(f"M {cx+16} {cy-10} C {cx+42} {cy-38}, {cx-42} {cy-38}, {cx-16} {cy-12}", stroke=ROSE, sw=2)
            c.line(cx - 21, cy - 16, cx - 12, cy - 8, stroke=ROSE, sw=2.4)
        elif i == 1:
            c.circle(cx - 38, cy, 16, fill="#ffffff", stroke=col, sw=2)
            c.text(cx - 38, cy + 4, "A", size=11, weight="700", fill=col, anchor="middle")
            c.circle(cx + 38, cy, 16, fill="#ffffff", stroke=AMBER, sw=2)
            c.text(cx + 38, cy + 4, "B", size=11, weight="700", fill=AMBER, anchor="middle")
            c.line(cx - 20, cy - 8, cx + 18, cy - 8, stroke=ROSE, sw=2)
            c.line(cx + 18, cy - 14, cx + 18, cy - 2, stroke=ROSE, sw=2.4)
            c.line(cx + 20, cy + 8, cx - 18, cy + 8, stroke=ROSE, sw=2)
            c.line(cx - 18, cy + 2, cx - 18, cy + 14, stroke=ROSE, sw=2.4)
        elif i == 2:
            c.circle(cx, cy - 28, 13, fill="#ffffff", stroke=col, sw=1.8)
            c.text(cx, cy - 24, "X", size=10, weight="700", fill=col, anchor="middle")
            c.circle(cx - 36, cy + 22, 13, fill="#ffffff", stroke=col, sw=1.8)
            c.text(cx - 36, cy + 26, "Y", size=10, weight="700", fill=col, anchor="middle")
            c.circle(cx + 36, cy + 22, 13, fill="#ffffff", stroke=col, sw=1.8)
            c.text(cx + 36, cy + 26, "Z", size=10, weight="700", fill=col, anchor="middle")
            c.arrow(cx - 10, cy - 16, cx - 28, cy + 8, color="blue", sw=1.6)
            c.arrow(cx + 10, cy - 16, cx + 28, cy + 8, color="blue", sw=1.6)
            c.arrow(cx - 20, cy + 22, cx + 20, cy + 22, color="blue", sw=1.6)
        else:
            c.circle(cx, cy - 28, 13, fill="#ffffff", stroke=col, sw=1.8)
            c.text(cx, cy - 24, "X", size=10, weight="700", fill=col, anchor="middle")
            c.circle(cx - 36, cy + 22, 13, fill="#ffffff", stroke=col, sw=1.8)
            c.text(cx - 36, cy + 26, "Y", size=10, weight="700", fill=col, anchor="middle")
            c.circle(cx + 36, cy + 22, 13, fill="#ffffff", stroke=col, sw=1.8)
            c.text(cx + 36, cy + 26, "Z", size=10, weight="700", fill=col, anchor="middle")
            c.arrow(cx - 10, cy - 16, cx - 28, cy + 8, color="amber", sw=1.6)
            c.arrow(cx + 10, cy - 16, cx + 28, cy + 8, color="amber", sw=1.6)
            c.line(cx - 20, cy + 22, cx + 18, cy + 22, stroke=ROSE, sw=2)
            c.line(cx + 18, cy + 16, cx + 18, cy + 28, stroke=ROSE, sw=2.4)
        c.multiline(cx, y + 140, desc.split("\n"), size=10, lh=14, fill=SOFT, anchor="middle")

    # Bottom Waddington valley schematic
    c.panel_box(24, 262, 712, 82, "Waddington's epigenetic landscape — bifurcating valleys represent stable attractors")
    c.path("M 64 294 C 130 294, 150 326, 210 326 C 260 326, 270 298, 320 298 C 370 298, 385 326, 440 326 C 490 326, 510 298, 560 298 C 610 298, 630 326, 690 326", stroke=TEAL, sw=2.4)
    c.circle(110, 290, 8, fill=AMBER)
    c.text(210, 340, "Fate A (neuron)", size=9.5, weight="700", fill=TEAL_DK, anchor="middle")
    c.text(440, 340, "Fate B (glia)", size=9.5, weight="700", fill=BLUE_DK, anchor="middle")
    c.text(680, 340, "Fate C (muscle)", size=9.5, weight="700", fill=PURPLE, anchor="middle")
    c.save(out / "fig-25-network-motifs.svg")


def fig_25a(out: Path):
    c = Canvas(760, 365, "Positional information (morphogen thresholds) and collinear Hox clusters",
               "Continuous concentration gradients convert into sharp discrete cell-fate boundaries via threshold affinity")
    # Left: French flag morphogen model
    c.panel_box(24, 72, 344, 272, "French-flag morphogen gradient")
    x0, y0, pw, ph = 66, 240, 274, 126
    c.axes(x0, y0, pw, ph, xlabel="Position along embryo axis", ylabel="[Morphogen]")
    pts = [(x0 + pw * k / 60, y0 - ph * math.exp(-3.0 * k / 60)) for k in range(61)]
    c.polyline(pts, stroke=TEAL, sw=2.8)
    # Threshold lines T1 and T2
    t1_y, t2_y = y0 - ph * 0.45, y0 - ph * 0.16
    c.line(x0, t1_y, x0 + pw, t1_y, stroke=BLUE, sw=1.3, dash="4,3")
    c.text(x0 + pw - 4, t1_y - 4, "T₁ (high)", size=9.5, weight="700", fill=BLUE_DK, anchor="end")
    c.line(x0, t2_y, x0 + pw, t2_y, stroke=AMBER, sw=1.3, dash="4,3")
    c.text(x0 + pw - 4, t2_y - 4, "T₂ (low)", size=9.5, weight="700", fill=AMBER, anchor="end")
    # Three discrete fate bands below axis
    c.rect(x0, 286, 74, 24, fill=BLUE_BG, stroke=BLUE, sw=1.4, rx=4)
    c.text(x0 + 37, 302, "Fate 1", size=10, weight="700", fill=BLUE_DK, anchor="middle")
    c.rect(x0 + 76, 286, 94, 24, fill=TEAL_BG, stroke=TEAL, sw=1.4, rx=4)
    c.text(x0 + 123, 302, "Fate 2", size=10, weight="700", fill=TEAL_DK, anchor="middle")
    c.rect(x0 + 172, 286, 102, 24, fill=AMBER_BG, stroke=AMBER, sw=1.4, rx=4)
    c.text(x0 + 223, 302, "Fate 3", size=10, weight="700", fill=AMBER, anchor="middle")

    # Right: Collinear Hox cluster + Cre-loxP conditional knockout
    c.panel_box(388, 72, 348, 130, "Spatial collinearity of the Hox cluster")
    hox = [("Hox1", TEAL, TEAL_BG), ("Hox3", BLUE, BLUE_BG), ("Hox6", PURPLE, PURPLE_BG), ("Hox9", AMBER, AMBER_BG), ("Hox13", ROSE, ROSE_BG)]
    for i, (h, col, bg) in enumerate(hox):
        hx = 408 + i * 62
        c.rect(hx, 112, 54, 28, fill=bg, stroke=col, sw=1.6, rx=5)
        c.text(hx + 27, 130, h, size=10, weight="700", fill=col, anchor="middle")
    c.arrow(412, 160, 712, 160, color="ink", sw=1.8)
    c.text(412, 178, "3′ · Head (anterior) · Early", size=9.8, weight="600", fill=TEAL_DK)
    c.text(712, 178, "5′ · Tail (posterior) · Late", size=9.8, weight="600", fill=ROSE_DK, anchor="end")

    c.panel_box(388, 216, 348, 128, "Conditional mouse knockout (Cre–loxP)")
    c.line(408, 266, 716, 266, stroke=INK, sw=2.4)
    c.polygon([(466, 256), (482, 266), (466, 276)], fill=ROSE, stroke="none")
    c.rect(496, 252, 118, 28, fill=TEAL_BG, stroke=TEAL, sw=1.6, rx=5)
    c.text(555, 270, "Essential Exon", size=10, weight="700", fill=TEAL_DK, anchor="middle")
    c.polygon([(626, 256), (642, 266), (626, 276)], fill=ROSE, stroke="none")
    c.text(474, 294, "loxP", size=9, weight="700", fill=ROSE_DK, anchor="middle")
    c.text(634, 294, "loxP", size=9, weight="700", fill=ROSE_DK, anchor="middle")
    c.text(562, 326, "Tissue-specific Cre excises exon ONLY in target organ", size=10, fill=SOFT, anchor="middle")
    c.save(out / "fig-25a-developmental-genetics.svg")


def fig_26(out: Path):
    c = Canvas(760, 360, "Hardy–Weinberg equilibrium: genotype frequencies as a function of p",
               "For rare recessive diseases (q = 0.01), carriers (2pq ≈ 2%) outnumber affected homozygotes (q² = 0.01%) by ~200×")
    x0, y0, pw, ph = 78, 286, 440, 198
    c.axes(x0, y0, pw, ph, xlabel="Allele frequency p (with q = 1 − p)", ylabel="Genotype frequency",
           xticks=[(0, "0.0"), (0.25, "0.25"), (0.5, "0.50"), (0.75, "0.75"), (1, "1.0")],
           yticks=[(0, "0.0"), (0.25, "0.25"), (0.5, "0.50"), (0.75, "0.75"), (1, "1.0")])
    pts_aa, pts_het, pts_bb = [], [], []
    for k in range(101):
        p = k / 100.0
        q = 1.0 - p
        px = x0 + p * pw
        pts_aa.append((px, y0 - (p * p) * ph))
        pts_het.append((px, y0 - (2 * p * q) * ph))
        pts_bb.append((px, y0 - (q * q) * ph))
    c.polyline(pts_aa, stroke=TEAL, sw=2.6)
    c.polyline(pts_het, stroke=PURPLE, sw=2.6)
    c.polyline(pts_bb, stroke=AMBER, sw=2.6)
    # Peak of 2pq
    c.circle(x0 + 0.5 * pw, y0 - 0.5 * ph, 5, fill=PURPLE)
    c.text(x0 + 0.5 * pw, y0 - 0.5 * ph - 12, "Max het = 0.50 at p = 0.5", size=10, weight="700", fill=PURPLE, anchor="middle")
    c.text(x0 + 0.85 * pw, y0 - 0.78 * ph, "p² (AA)", size=11, weight="700", fill=TEAL_DK)
    c.text(x0 + 0.14 * pw, y0 - 0.78 * ph, "q² (aa)", size=11, weight="700", fill=AMBER)

    c.panel_box(540, 82, 196, 224, "5 HWE assumptions")
    c.multiline(554, 114, [
        "1. Random mating",
        "2. Infinite population (no drift)",
        "3. No selection",
        "4. No mutation",
        "5. No migration / substructure",
        "",
        "Fixed point reached in",
        "ONE generation of random",
        "mating. Departures diagnose",
        "which assumption broke!",
    ], size=10, lh=16, fill=SOFT)
    c.save(out / "fig-26-hardy-weinberg.svg")


def fig_27(out: Path):
    c = Canvas(760, 360, "Genetic drift (effective population size Nₑ) vs. directional selection",
               "Drift is a random walk whose variance per generation scales as 1/(2Nₑ); selection dominates only when |2Nₑs| ≫ 1")
    # Deterministic pseudo-random Wright-Fisher trajectories
    def wf(ne, seed, gens=50):
        # Simple deterministic LCG so builds are byte-reproducible
        st = seed
        def rand():
            nonlocal st
            st = (1103515245 * st + 12345) & 0x7FFFFFFF
            return st / 0x7FFFFFFF
        p = 0.5
        traj = [p]
        for _ in range(gens):
            k = sum(1 for _ in range(2 * ne) if rand() < p)
            p = k / (2 * ne)
            traj.append(p)
        return traj

    # Left: Small Ne = 20
    c.panel_box(24, 72, 344, 268, "Small Nₑ = 20 (strong drift → fast fixation/loss)")
    x0, y0, pw, ph = 66, 286, 282, 166
    c.axes(x0, y0, pw, ph, xlabel="Generations", ylabel="Allele freq p",
           xticks=[(0, "0"), (0.5, "25"), (1, "50")], yticks=[(0, "0"), (0.5, "0.5"), (1, "1")])
    for s, col in [(11, TEAL), (29, AMBER), (47, ROSE), (83, BLUE), (109, PURPLE)]:
        tr = wf(20, s, 50)
        c.polyline([(x0 + i / 50 * pw, y0 - p * ph) for i, p in enumerate(tr)], stroke=col, sw=1.8, opacity=0.85)

    # Right: Large Ne = 400 + selection curve
    c.panel_box(392, 72, 344, 268, "Large Nₑ = 400 (weak drift) vs. selection (s = +0.15)")
    x1, y1, pw2, ph2 = 434, 286, 282, 166
    c.axes(x1, y1, pw2, ph2, xlabel="Generations", ylabel="Allele freq p",
           xticks=[(0, "0"), (0.5, "25"), (1, "50")], yticks=[(0, "0"), (0.5, "0.5"), (1, "1")])
    for s, col in [(11, FAINT), (29, BLUE), (47, TEAL)]:
        tr = wf(400, s, 50)
        c.polyline([(x1 + i / 50 * pw2, y1 - p * ph2) for i, p in enumerate(tr)], stroke=col, sw=1.6, opacity=0.7)
    # Deterministic selection sweep s=0.15 from p0=0.05
    p = 0.05
    sel_pts = []
    for g in range(51):
        sel_pts.append((x1 + g / 50 * pw2, y1 - p * ph2))
        wbar = p * p * 1.15 + 2 * p * (1 - p) * 1.075 + (1 - p) * (1 - p)
        p = (p * p * 1.15 + p * (1 - p) * 1.075) / wbar
    c.polyline(sel_pts, stroke=ROSE, sw=2.6)
    c.text(x1 + 178, y1 - 0.85 * ph2, "Selection sweep", size=10, weight="700", fill=ROSE_DK)
    c.save(out / "fig-27-four-forces-drift.svg")


def fig_28(out: Path):
    c = Canvas(760, 360, "Population substructure (the Wahlund effect) and F_ST",
               "Pooling two subpopulations with different allele frequencies creates a deficit of heterozygotes even when each is in HWE")
    # Subpop 1 + Subpop 2 -> Pooled
    c.box(24, 80, 196, 114, "Subpopulation 1 (HWE)", [
        "p₁ = 0.10,  q₁ = 0.90",
        "AA = 0.01  |  aa = 0.81",
        "Heterozygotes 2p₁q₁ = 0.18",
    ], fill=TEAL_BG, stroke=TEAL, title_fill=TEAL_DK)
    c.box(24, 214, 196, 114, "Subpopulation 2 (HWE)", [
        "p₂ = 0.90,  q₂ = 0.10",
        "AA = 0.81  |  aa = 0.01",
        "Heterozygotes 2p₂q₂ = 0.18",
    ], fill=AMBER_BG, stroke=AMBER, title_fill=AMBER)

    c.arrow(224, 136, 286, 186, color="teal", sw=2.0)
    c.arrow(224, 270, 286, 224, color="amber", sw=2.0)

    c.panel_box(292, 80, 444, 248, "50 / 50 Pooled sample (mean p̄ = 0.50)")
    # Comparison bars: Expected H_T = 0.50 vs Observed H_S = 0.18
    c.text(312, 128, "Expected under single HWE (H_T = 2p̄q̄):", size=11, weight="700", fill=INK)
    c.rect(312, 138, 360, 26, fill=BLUE_BG, stroke=BLUE, sw=1.5, rx=5)
    c.text(492, 155, "0.50  (50% heterozygotes)", size=11, weight="700", fill=BLUE_DK, anchor="middle")

    c.text(312, 192, "Actual observed in pool (H_S = mean 2pᵢqᵢ):", size=11, weight="700", fill=INK)
    c.rect(312, 202, 130, 26, fill=ROSE_BG, stroke=ROSE, sw=1.5, rx=5)
    c.text(377, 219, "0.18", size=11, weight="700", fill=ROSE_DK, anchor="middle")
    c.rect(444, 202, 228, 26, fill=SUNK, stroke=ROSE, sw=1.3, dash="4,3", rx=5)
    c.text(558, 219, "Missing 0.32 (Wahlund deficit!)", size=10.5, weight="700", fill=ROSE_DK, anchor="middle")

    c.rect(312, 250, 404, 60, fill="#ffffff", stroke=TEAL, sw=1.4, rx=8)
    c.text(514, 274, "F_ST  =  (H_T − H_S) / H_T  =  (0.50 − 0.18) / 0.50  =  0.64", size=11.5, weight="700", fill=TEAL_DK, anchor="middle", mono=True)
    c.text(514, 296, "F_ST is the fraction of total allele-frequency variance BETWEEN groups.", size=10.2, fill=SOFT, anchor="middle")
    c.save(out / "fig-28-structure-inbreeding.svg")


def fig_29(out: Path):
    c = Canvas(760, 360, "Linkage disequilibrium (LD) decay by ancestry and haplotype blocks",
               "Recombination breaks down r² over generations: older African populations show steeper LD decay than bottlenecked European ones")
    # Left: LD decay curve r^2 vs distance
    c.panel_box(24, 72, 412, 268, "LD decay: r² vs. physical distance (kb)")
    x0, y0, pw, ph = 78, 286, 336, 166
    c.axes(x0, y0, pw, ph, xlabel="Physical distance between SNPs (kb)", ylabel="Mean LD (r²)",
           xticks=[(0, "0"), (0.25, "50"), (0.5, "100"), (0.75, "150"), (1, "200")],
           yticks=[(0, "0.0"), (0.5, "0.5"), (1, "1.0")])
    # Realistic smooth exponential+background decay curves (EUR slower decay than AFR)
    eur_pts, afr_pts = [], []
    for k in range(81):
        kb = 200.0 * k / 80
        r2_eur = 0.04 + 0.86 * math.exp(-kb / 58.0)
        r2_afr = 0.02 + 0.86 * math.exp(-kb / 19.0)
        eur_pts.append((x0 + kb / 200.0 * pw, y0 - r2_eur * ph))
        afr_pts.append((x0 + kb / 200.0 * pw, y0 - r2_afr * ph))
    c.polyline(eur_pts, stroke=BLUE, sw=2.6)
    c.polyline(afr_pts, stroke=TEAL, sw=2.6)
    c.text(x0 + 140, y0 - 0.56 * ph, "EUR (longer LD blocks)", size=10.5, weight="700", fill=BLUE_DK)
    c.text(x0 + 110, y0 - 0.16 * ph, "AFR (faster decay → sharper fine-mapping)", size=10, weight="700", fill=TEAL_DK)

    # Right: Haplotype phase ambiguity
    c.panel_box(454, 72, 282, 268, "Why genotypes lose haplotype phase")
    c.box(470, 108, 250, 44, "Observed diploid genotype: Aa Bb", [], fill=SUNK, stroke=RULE, title_size=11)
    c.arrow(540, 154, 520, 184, color="teal", sw=1.6)
    c.arrow(650, 154, 670, 184, color="amber", sw=1.6)
    c.box(470, 188, 118, 62, "Cis (coupling)", ["A———B", "a———b"], fill=TEAL_BG, stroke=TEAL, title_fill=TEAL_DK, body_size=10.5)
    c.box(602, 188, 118, 62, "Trans (repulsion)", ["A———b", "a———B"], fill=AMBER_BG, stroke=AMBER, title_fill=AMBER, body_size=10.5)
    c.multiline(595, 278, [
        "Same unphased genotype, different",
        "haplotypes! Statistical phasing or",
        "long reads recover which alleles sit",
        "on the same physical chromosome.",
    ], size=10, lh=15, fill=SOFT, anchor="middle")
    c.save(out / "fig-29-ld-decay.svg")


def build_all(out: Path):
    for fn in [fig_16, fig_17, fig_18, fig_19, fig_20, fig_20a, fig_21, fig_22,
               fig_23, fig_24, fig_25, fig_25a, fig_26, fig_27, fig_28, fig_29]:
        fn(out)
    print("Generated 16 SVGs for Parts 3–5 (Ch 16–29)")


if __name__ == "__main__":
    build_all(Path(__file__).resolve().parents[2] / "figures")
