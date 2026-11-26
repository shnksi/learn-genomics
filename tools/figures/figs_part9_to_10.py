"""Generate 12 precision SVG diagrams for Parts 9 and 10 (Chapters 39–50)."""
from __future__ import annotations

import math
from pathlib import Path
from svg_kit import (
    AMBER, AMBER_BG, BG, BLUE, BLUE_BG, BLUE_DK, DNA, DNA_BG, EMERALD, FAINT,
    GOLD, GREEN, GREEN_BG, INK, PANEL, PURPLE, PURPLE_BG, ROSE, ROSE_BG,
    ROSE_DK, RULE, RULE_LT, SOFT, SUNK, TEAL, TEAL_BG, TEAL_DK, Canvas,
)


def fig_39(out: Path):
    c = Canvas(760, 355, "The C-value paradox: genome size spans six orders of magnitude without tracking complexity",
               "Humans (3.1 Gb, ~20k genes) have a 5× smaller genome than an onion and 14× smaller than a marbled lungfish")
    # Horizontal log10-scale bar chart of genome sizes (Mb)
    orgs = [
        ("E. coli (bacterium)", 4.6, "~4,400 genes", TEAL),
        ("S. cerevisiae (yeast)", 12.1, "~6,000 genes", BLUE),
        ("C. elegans (worm)", 100.0, "~20,000 genes", PURPLE),
        ("D. melanogaster (fly)", 140.0, "~14,000 genes", PURPLE),
        ("Homo sapiens (human)", 3100.0, "~19,900 genes (1.5% coding)", ROSE),
        ("Allium cepa (onion)", 16000.0, "Mostly LTR retrotransposons", AMBER),
        ("Protopterus (lungfish)", 43000.0, "Massive repeat expansion", AMBER),
    ]
    x0, w_max = 196, 370
    # Log10 scale from 0 (1 Mb) to 5 (100,000 Mb)
    for tick_exp, lbl in [(0, "1 Mb"), (1, "10 Mb"), (2, "100 Mb"), (3, "1 Gb"), (4, "10 Gb"), (5, "100 Gb")]:
        tx = x0 + (tick_exp / 5.0) * w_max
        c.line(tx, 76, tx, 294, stroke=RULE_LT, sw=1, dash="3,3")
        c.text(tx, 310, lbl, size=9.5, fill=FAINT, anchor="middle", mono=True)

    for idx, (name, mb, note, col) in enumerate(orgs):
        yy = 84 + idx * 30
        c.text(x0 - 10, yy + 14, name, size=10.5, weight="700" if "Homo" in name else "600", fill=ROSE_DK if "Homo" in name else INK, anchor="end")
        bw = (math.log10(mb) / 5.0) * w_max
        c.rect(x0, yy, bw, 18, fill=col, rx=4)
        c.text(x0 + bw + 8, yy + 13, f"{mb:g} Mb · {note}", size=9.5, fill=SOFT)
    c.text(380, 338, "Resolution: C-value varies by repeat/transposon accumulation; G-value complexity comes from regulation & alternative splicing.", size=10, fill=SOFT, anchor="middle")
    c.save(out / "fig-39-genome-landscapes.svg")


def fig_40(out: Path):
    c = Canvas(760, 360, "Sequencing platforms: the read-length vs. accuracy landscape",
               "Short reads dominate raw cost-per-base; long reads (HiFi & Nanopore) span repeats, phase haplotypes, and read methylation directly")
    # 4 platform cards + comparison plot
    x0, y0, pw, ph = 84, 286, 380, 194
    c.axes(x0, y0, pw, ph, xlabel="Read length (log₁₀ bp)", ylabel="Single-read accuracy",
           xticks=[(0, "100 bp"), (0.33, "1 kb"), (0.67, "10 kb"), (1, "100 kb+")],
           yticks=[(0, "90%"), (0.5, "95%"), (1, "99.9%+")])

    # Platform bubbles (x = (log10(bp)-2)/3, y = accuracy mapped nicely)
    plats = [
        (0.06, 0.94, 30, "Illumina SBS", "150–300 bp · Q30–40", BLUE, BLUE_BG),
        (0.27, 0.96, 26, "Sanger", "700–1k bp · gold std", TEAL, TEAL_BG),
        (0.71, 0.92, 34, "PacBio HiFi", "15–25 kb · Q30+ CCS", PURPLE, PURPLE_BG),
        (0.88, 0.72, 38, "Oxford Nanopore", "10 kb–Mb · native 5mC", AMBER, AMBER_BG),
    ]
    for fx, fy, r, lbl, sub, col, bg in plats:
        cx, cy = x0 + fx * pw, y0 - fy * ph
        c.circle(cx, cy, r, fill=bg, stroke=col, sw=2, opacity=0.9)
        c.text(cx, cy - 2, lbl, size=9.5, weight="700", fill=col, anchor="middle")
        c.text(cx, cy + 12, sub.split("·")[0].strip(), size=8.5, fill=SOFT, anchor="middle")

    # Right summary table
    c.panel_box(486, 82, 250, 224, "How each platform reads DNA")
    items = [
        ("Sanger:", "ddNTP chain termination", TEAL_DK),
        ("Illumina:", "Reversible fluorescent terminators", BLUE_DK),
        ("PacBio HiFi:", "Circular consensus ZMW polymerase", PURPLE),
        ("Nanopore:", "Ionic current drop through protein pore", AMBER),
    ]
    for idx, (k, v, col) in enumerate(items):
        yy = 118 + idx * 44
        c.text(500, yy, k, size=10.5, weight="700", fill=col)
        c.text(500, yy + 16, v, size=10, fill=SOFT)
    c.save(out / "fig-40-sequencing-platforms.svg")


def fig_41(out: Path):
    c = Canvas(760, 370, "Genomic coordinate systems: 0-based half-open (BED) vs. 1-based inclusive (VCF/GFF)",
               "Off-by-one coordinate bugs are the #1 silent error in bioinformatics — anchor both systems to this single nucleotide ruler")
    # Nucleotide boxes for "A T G C C A T G"
    seq = "ATGCCATG"
    bx0, cw, gap = 110, 62, 6
    # 0-based inter-base ticks (edges)
    c.text(24, 96, "0-based", size=10.5, weight="700", fill=TEAL_DK)
    c.text(24, 110, "(BED/BAM)", size=9.5, fill=FAINT)
    for i in range(len(seq) + 1):
        tx = bx0 + i * (cw + gap) - gap / 2
        c.line(tx, 102, tx, 124, stroke=TEAL, sw=1.8)
        c.text(tx, 96, str(i), size=11, weight="700", fill=TEAL_DK, anchor="middle", mono=True)

    # Sequence bases (highlight "GCC" = indices 2..5 in BED, 3..5 in VCF)
    for i, b in enumerate(seq):
        x = bx0 + i * (cw + gap)
        hi = i in (2, 3, 4)
        c.rect(x, 128, cw, 40, fill=DNA_BG[b] if hi else PANEL, stroke=DNA[b] if hi else RULE, sw=2.2 if hi else 1.2, rx=6)
        c.text(x + cw / 2, 154, b, size=16, weight="700", fill=DNA[b], anchor="middle", mono=True)

    # 1-based base centers
    c.text(24, 198, "1-based", size=10.5, weight="700", fill=AMBER)
    c.text(24, 212, "(VCF/GFF)", size=9.5, fill=FAINT)
    for i in range(len(seq)):
        cx = bx0 + i * (cw + gap) + cw / 2
        c.text(cx, 196, str(i + 1), size=11, weight="700", fill=AMBER, anchor="middle", mono=True)

    # Highlight bracket for GCC
    x_start = bx0 + 2 * (cw + gap)
    x_end = bx0 + 5 * (cw + gap) - gap
    c.rect(x_start, 216, x_end - x_start, 28, fill=TEAL_BG, stroke=TEAL, sw=1.4, rx=5)
    c.text((x_start + x_end) / 2, 234, "BED: [2, 5)  →  len = 5 − 2 = 3 bp", size=10.5, weight="700", fill=TEAL_DK, anchor="middle", mono=True)
    c.rect(x_start, 250, x_end - x_start, 28, fill=AMBER_BG, stroke=AMBER, sw=1.4, rx=5)
    c.text((x_start + x_end) / 2, 268, "VCF / GFF: [3, 5]  →  len = 5 − 3 + 1 = 3 bp", size=10.5, weight="700", fill=AMBER, anchor="middle", mono=True)

    # Bottom Phred Q-score quick reference
    c.panel_box(24, 294, 712, 60, "FASTQ Phred quality:  Q = −10 log₁₀(P_error)")
    for idx, (q, err, col) in enumerate([("Q10 = 10% error (90%)", TEAL_DK, TEAL_BG), ("Q20 = 1% error (99%)", BLUE_DK, BLUE_BG), ("Q30 = 0.1% error (99.9%)", GREEN, GREEN_BG), ("Q40 = 0.01% error", PURPLE, PURPLE_BG)]):
        c.pill(38 + idx * 172, 322, 162, 22, q, fill=col, stroke=err, text_fill=err, size=9.2, mono=True)
    c.save(out / "fig-41-data-formats-coords.svg")


def fig_42(out: Path):
    c = Canvas(760, 365, "Burrows–Wheeler Transform (BWT) and FM-index backward search",
               "Sorting cyclic rotations groups identical contexts together; the LF property maps any BWT row back to its predecessor in O(1)")
    # Left: Sorted rotations of "ACGACG$"
    c.panel_box(24, 72, 344, 272, "Sorted cyclic rotations of  T = ACGACG$")
    rots = [
        ("0", "$", "ACGAC", "G"),
        ("1", "A", "CGACG", "$"),
        ("2", "A", "CG$AC", "G"),
        ("3", "C", "GACG$", "A"),
        ("4", "C", "G$ACG", "A"),
        ("5", "G", "ACG$A", "C"),
        ("6", "G", "$ACGA", "C"),
    ]
    c.text(56, 108, "Row", size=9.5, weight="700", fill=FAINT, mono=True)
    c.text(106, 108, "F (first)", size=9.5, weight="700", fill=TEAL_DK, mono=True)
    c.text(192, 108, "Middle", size=9.5, weight="700", fill=FAINT, mono=True)
    c.text(282, 108, "L = BWT", size=9.5, weight="700", fill=ROSE_DK, mono=True)
    for idx, (r, fch, mid, lch) in enumerate(rots):
        yy = 128 + idx * 28
        c.text(64, yy, r, size=10.5, fill=FAINT, mono=True)
        c.rect(108, yy - 14, 26, 20, fill=TEAL_BG, stroke=TEAL, sw=1.2, rx=3)
        c.text(121, yy, fch, size=11, weight="700", fill=TEAL_DK, anchor="middle", mono=True)
        c.text(182, yy, mid, size=11, fill=SOFT, mono=True)
        c.rect(286, yy - 14, 26, 20, fill=ROSE_BG, stroke=ROSE, sw=1.2, rx=3)
        c.text(299, yy, lch, size=11, weight="700", fill=ROSE_DK, anchor="middle", mono=True)
    c.text(196, 330, "L = G$GAACC (runs compress tightly!)", size=10, weight="700", fill=ROSE_DK, anchor="middle", mono=True)

    # Right: Backward search for pattern "ACG"
    c.panel_box(388, 72, 348, 272, "Backward search for query  P = 'ACG'  in O(|P|)")
    steps = [
        (110, "Step 1: Match 'G'", "F-interval for G  →  rows [5, 6]  (2 hits)", BLUE_BG, BLUE),
        (178, "Step 2: Prepend 'C'", "Count 'C' in L[5..6]  →  rows [3, 4]  ('CG' × 2)", PURPLE_BG, PURPLE),
        (246, "Step 3: Prepend 'A'", "Count 'A' in L[3..4]  →  rows [1, 2]  ('ACG' × 2!)", TEAL_BG, TEAL),
    ]
    for sy, t, desc, bg, col in steps:
        c.box(406, sy, 312, 52, t, [desc], fill=bg, stroke=col, title_fill=col, body_size=10)
    c.text(562, 326, "No genome scan needed: BWA/Bowtie2 find seeds in microseconds!", size=9.8, weight="600", fill=SOFT, anchor="middle")
    c.save(out / "fig-42-bwt-fm-index.svg")


def fig_43(out: Path):
    c = Canvas(760, 355, "De Bruijn assembly graphs and why repeats break short-read contigs",
               "Short k-mers collapse identical repeat copies into one node, leaving an ambiguous fork that only long reads span")
    # Left: De Bruijn graph with repeat R collapsed in the middle
    c.panel_box(24, 72, 464, 266, "Collapsed repeat tangle in a De Bruijn graph (A–R–B and C–R–D)")
    # Nodes A, C on left -> Repeat R in center -> B, D on right
    c.box(48, 126, 86, 42, "Unique A", [], fill=TEAL_BG, stroke=TEAL, title_fill=TEAL_DK, title_size=10.5)
    c.box(48, 226, 86, 42, "Unique C", [], fill=BLUE_BG, stroke=BLUE, title_fill=BLUE_DK, title_size=10.5)
    c.box(196, 172, 118, 52, "Repeat R", ["(2× coverage!)"], fill=ROSE_BG, stroke=ROSE, title_fill=ROSE_DK, title_size=11)
    c.box(378, 126, 86, 42, "Unique B", [], fill=TEAL_BG, stroke=TEAL, title_fill=TEAL_DK, title_size=10.5)
    c.box(378, 226, 86, 42, "Unique D", [], fill=BLUE_BG, stroke=BLUE, title_fill=BLUE_DK, title_size=10.5)
    c.arrow(136, 148, 194, 188, color="teal", sw=2)
    c.arrow(136, 246, 194, 210, color="blue", sw=2)
    c.arrow(316, 188, 374, 148, color="teal", sw=2)
    c.arrow(316, 210, 374, 246, color="blue", sw=2)
    c.text(255, 294, "Ambiguity: Is the genome (A→R→B, C→R→D) or (A→R→D, C→R→B)?", size=10, weight="700", fill=ROSE_DK, anchor="middle")
    c.text(255, 316, "Short-read assemblers MUST break into 5 separate contigs here!", size=10, fill=SOFT, anchor="middle")

    # Right: How long reads resolve the repeat
    c.panel_box(506, 72, 230, 266, "Why long reads finish genomes")
    c.text(522, 118, "Short reads (150 bp < |R|):", size=10.5, weight="700", fill=ROSE_DK)
    c.line(522, 134, 574, 134, stroke=ROSE, sw=3)
    c.line(586, 134, 638, 134, stroke=ROSE, sw=3)
    c.text(522, 156, "Trapped inside repeat R.", size=9.8, fill=SOFT)
    c.text(522, 198, "Long HiFi / ONT read (> |R|):", size=10.5, weight="700", fill=GREEN)
    c.rect(522, 210, 44, 18, fill=TEAL_BG, stroke=TEAL, rx=3)
    c.text(544, 223, "A", size=9.5, weight="700", fill=TEAL_DK, anchor="middle")
    c.rect(566, 210, 96, 18, fill=ROSE_BG, stroke=ROSE, rx=3)
    c.text(614, 223, "Repeat R", size=9.5, weight="700", fill=ROSE_DK, anchor="middle")
    c.rect(662, 210, 44, 18, fill=TEAL_BG, stroke=TEAL, rx=3)
    c.text(684, 223, "B", size=9.5, weight="700", fill=TEAL_DK, anchor="middle")
    c.multiline(522, 254, [
        "Single molecule physically",
        "anchors A directly to B,",
        "untangling the graph into",
        "telomere-to-telomere contigs.",
    ], size=10, lh=15, fill=SOFT)
    c.save(out / "fig-43-de-bruijn-assembly.svg")


def fig_44(out: Path):
    c = Canvas(760, 355, "Ab initio eukaryotic gene finding as a Hidden Markov Model (HMM)",
               "Viterbi decoding finds the highest-probability hidden state path (intergenic, exon, splice donor/acceptor, intron) across raw DNA")
    # HMM State diagram
    states = [
        (36, 150, 98, "Intergenic", FAINT, SUNK),
        (164, 150, 96, "5′ UTR / ATG", BLUE, BLUE_BG),
        (294, 150, 102, "Coding Exon\n(3-bp period)", TEAL, TEAL_BG),
        (434, 86, 108, "Intron\n(GT···A···AG)", AMBER, AMBER_BG),
        (578, 150, 138, "STOP / 3′ UTR\n(TAA/TAG/TGA)", ROSE, ROSE_BG),
    ]
    for sx, sy, sw, lbl, col, bg in states:
        lines = lbl.split("\n")
        c.box(sx, sy, sw, 56, lines[0], lines[1:], fill=bg, stroke=col, title_fill=col, title_size=10.5, body_size=9)

    c.arrow(136, 178, 160, 178, color="ink", sw=1.8)
    c.arrow(262, 178, 290, 178, color="teal", sw=1.8)
    # Exon -> Intron -> Exon loop
    c.path("M 366 150 C 378 110, 404 106, 430 112", stroke=AMBER, sw=2, marker="arr-amber")
    c.path("M 434 128 C 406 134, 396 146, 386 150", stroke=TEAL, sw=2, marker="arr-teal")
    c.text(394, 102, "5′ GT", size=9, weight="700", fill=AMBER)
    c.text(412, 148, "3′ AG", size=9, weight="700", fill=TEAL_DK)
    c.arrow(398, 178, 574, 178, color="rose", sw=1.8)
    # Self-loop hints
    c.text(345, 224, "Emission: codon bias", size=9.5, weight="600", fill=TEAL_DK, anchor="middle")
    c.text(488, 156, "Phase 0/1/2", size=9, fill=AMBER, anchor="middle")

    # Bottom contrast: why ab initio alone isn't enough
    c.panel_box(24, 248, 712, 88, "Modern annotation combines three independent evidence tracks")
    tracks = [
        (42, "1. Ab initio HMM / DNA CNN", "Finds splice motifs & 3-base codon periodicity", TEAL),
        (274, "2. RNA-seq / Iso-Seq reads", "Directly observes real spliced exon–exon junctions", BLUE),
        (506, "3. Cross-species homology", "Aligns conserved proteins across mammals/vertebrates", PURPLE),
    ]
    for tx, t, d, col in tracks:
        c.text(tx, 290, t, size=10.5, weight="700", fill=col)
        c.text(tx, 308, d, size=9.5, fill=SOFT)
    c.save(out / "fig-44-gene-finding-hmm.svg")


def fig_45(out: Path):
    c = Canvas(760, 355, "Linear reference bias vs. a pangenome variation graph",
               "A single linear reference drops reads carrying non-reference alleles; a pangenome graph encodes all haplotypes as paths")
    # Top: Linear reference bias
    c.panel_box(24, 72, 712, 110, "Linear reference genome (GRCh38): reference bias at structural variants & divergent alleles", fill=ROSE_BG, stroke=ROSE, header_fill=ROSE_DK)
    c.line(48, 128, 712, 128, stroke=INK, sw=3.5)
    c.rect(280, 114, 130, 28, fill="#ffffff", stroke=ROSE, sw=1.6, rx=5)
    c.text(345, 132, "Ref allele only", size=10.5, weight="700", fill=ROSE_DK, anchor="middle")
    c.text(380, 164, "Reads carrying a novel 2 kb insertion or alternate haplotype fail to align or get penalized → systematic reference bias.", size=10.2, fill=SOFT, anchor="middle")

    # Bottom: Pangenome variation graph (HPRC)
    c.panel_box(24, 200, 712, 138, "Pangenome graph (HPRC): shared conserved spine with branching SNP & structural-variant bubbles", fill=TEAL_BG, stroke=TEAL, header_fill=TEAL_DK)
    # Spine nodes & bubbles
    c.box(46, 250, 90, 36, "Conserved", [], fill="#ffffff", stroke=TEAL, title_fill=TEAL_DK, title_size=10)
    # Bubble 1 (SNP A vs G)
    c.path("M 136 268 C 154 268, 160 238, 186 238", stroke=TEAL, sw=2)
    c.path("M 136 268 C 154 268, 160 298, 186 298", stroke=BLUE, sw=2)
    c.pill(186, 226, 62, 24, "SNP: A", fill="#ffffff", stroke=TEAL, text_fill=TEAL_DK, size=9.5, mono=True)
    c.pill(186, 286, 62, 24, "SNP: G", fill=BLUE_BG, stroke=BLUE, text_fill=BLUE_DK, size=9.5, mono=True)
    c.path("M 248 238 C 272 238, 278 268, 296 268", stroke=TEAL, sw=2)
    c.path("M 248 298 C 272 298, 278 268, 296 268", stroke=BLUE, sw=2)
    c.box(296, 250, 92, 36, "Conserved", [], fill="#ffffff", stroke=TEAL, title_fill=TEAL_DK, title_size=10)
    # Bubble 2 (2 kb Insertion vs Deletion)
    c.path("M 388 268 C 408 268, 414 236, 444 236", stroke=AMBER, sw=2)
    c.path("M 388 268 L 594 268", stroke=TEAL, sw=2)
    c.pill(444, 224, 114, 24, "+2 kb Insertion", fill=AMBER_BG, stroke=AMBER, text_fill=AMBER, size=9.5)
    c.path("M 558 236 C 578 236, 582 268, 594 268", stroke=AMBER, sw=2)
    c.box(594, 250, 118, 36, "Conserved →", [], fill="#ffffff", stroke=TEAL, title_fill=TEAL_DK, title_size=10)
    c.text(380, 326, "Every individual's haplotype is a walk through the graph — eliminating reference bias across global ancestries.", size=10, weight="600", fill=TEAL_DK, anchor="middle")
    c.save(out / "fig-45-pangenome-graph.svg")


def fig_46(out: Path):
    c = Canvas(760, 365, "Variant calling from a read pileup: genotype likelihoods vs. artefacts",
               "A caller weighs base qualities across aligned reads for G ∈ {0/0, 0/1, 1/1} — then filters strand bias and low MAPQ")
    # Left: True heterozygous pileup
    c.panel_box(24, 72, 416, 272, "Read pileup at chr22:20,104,218  (Reference = A)")
    c.text(44, 108, "Ref:", size=10.5, weight="700", fill=INK)
    c.base_seq(96, 92, "TCGATAGCTA", cell_w=26, cell_h=24, gap=3, highlight={4: AMBER_BG})
    reads = [
        ("r1 (+)", "TCGATAGCTA", True),
        ("r2 (−)", "TCGATAGCTA", True),
        ("r3 (+)", "TCGGTAGCTA", False),
        ("r4 (−)", "TCGGTAGCTA", False),
        ("r5 (+)", "TCGGTAGCTA", False),
        ("r6 (−)", "TCGATAGCTA", True),
    ]
    for idx, (rid, seq, is_ref) in enumerate(reads):
        yy = 132 + idx * 28
        c.text(42, yy + 16, rid, size=9.5, fill=FAINT, mono=True)
        for j, ch in enumerate(seq):
            bx = 96 + j * 29
            if j == 4:
                col = DNA[ch]
                bg = DNA_BG[ch]
                c.rect(bx, yy, 26, 22, fill=bg, stroke=col, sw=1.8, rx=4)
                c.text(bx + 13, yy + 15, ch, size=11, weight="700", fill=col, anchor="middle", mono=True)
            else:
                c.text(bx + 13, yy + 15, ".", size=12, fill=RULE, anchor="middle", mono=True)
    c.text(232, 322, "Balanced 3 A / 3 G on BOTH (+) and (−) strands → clean 0/1 het call!", size=10, weight="700", fill=TEAL_DK, anchor="middle")

    # Right: Genotype likelihood bars + artifact checklist
    c.panel_box(458, 72, 278, 144, "Genotype likelihoods P(D | G)")
    bars = [("0/0 (A/A)", 0.04, FAINT), ("0/1 (A/G)", 0.94, TEAL), ("1/1 (G/G)", 0.02, FAINT)]
    for idx, (lbl, val, col) in enumerate(bars):
        yy = 108 + idx * 32
        c.text(472, yy + 15, lbl, size=10.5, weight="700", fill=INK, mono=True)
        c.rect(558, yy, val * 150, 20, fill=col, rx=4)
        c.text(558 + val * 150 + 6, yy + 15, f"{val:.2f}", size=10, weight="700", fill=col, mono=True)

    c.panel_box(458, 228, 278, 116, "Three artefact traps (why filters matter)")
    c.multiline(472, 262, [
        "• Strand bias: alt base ONLY on (+) reads",
        "• Low MAPQ: reads from paralog/repeat",
        "• Homopolymer / tandem repeat indels",
        "  (short reads cannot span long repeats!)",
    ], size=10, lh=16, fill=SOFT)
    c.save(out / "fig-46-variant-calling.svg")


def fig_47(out: Path):
    c = Canvas(760, 355, "Bulk RNA-seq workflow: from transcripts to differential expression",
               "Library-size normalization, Negative Binomial dispersion modeling, and FDR control separate biology from depth noise")
    # Top pipeline
    steps = [
        (24, "1. Library Prep", TEAL, TEAL_BG, "Poly-A vs ribo-zero\n(shapes what's seen)"),
        (170, "2. Quantify", BLUE, BLUE_BG, "Align / Salmon\n→ integer count matrix"),
        (316, "3. Size Factors", PURPLE, PURPLE_BG, "Median-of-ratios\n(fixes composition!)"),
        (462, "4. NB GLM", AMBER, AMBER_BG, "Var = μ + μ²/θ\n(shrinks dispersion)"),
        (608, "5. Volcano & FDR", ROSE, ROSE_BG, "log₂FC × −log₁₀(p_adj)\n(Benjamini–Hochberg)"),
    ]
    for i, (x, t, col, bg, d) in enumerate(steps):
        c.box(x, 76, 128, 74, t, d.split("\n"), fill=bg, stroke=col, title_fill=col, title_size=10.5, body_size=9.2)
        if i < 4:
            c.arrow(x + 130, 113, x + 166, 113, color="ink", sw=1.6)

    # Bottom: Mini volcano plot + key caveat
    c.panel_box(24, 170, 370, 168, "Volcano plot: effect size (log₂FC) vs. significance")
    x0, y0, pw, ph = 72, 304, 296, 100
    c.axes(x0, y0, pw, ph, xlabel="log₂ Fold Change", ylabel="−log₁₀ p",
           xticks=[(0, "-4"), (0.5, "0"), (1, "+4")])
    c.line(x0, y0 - 42, x0 + pw, y0 - 42, stroke=ROSE, sw=1.2, dash="4,3")
    # Deterministic cloud of non-sig and sig genes
    pts_ns = [(-1.2, 12), (-0.8, 18), (-0.4, 26), (-0.1, 8), (0.2, 14), (0.6, 22), (1.1, 16), (-0.5, 34), (0.4, 30), (0.0, 20), (-0.9, 28), (0.9, 24)]
    for gx, gy in pts_ns:
        c.circle(x0 + (gx + 4) / 8 * pw, y0 - gy, 3.2, fill=FAINT, opacity=0.7)
    pts_up = [(1.8, 56), (2.4, 72), (3.1, 86), (2.1, 62), (2.8, 78)]
    pts_dn = [(-1.9, 54), (-2.6, 76), (-3.2, 88), (-2.2, 64)]
    for gx, gy in pts_up:
        c.circle(x0 + (gx + 4) / 8 * pw, y0 - gy, 3.8, fill=ROSE)
    for gx, gy in pts_dn:
        c.circle(x0 + (gx + 4) / 8 * pw, y0 - gy, 3.8, fill=BLUE)
    c.text(x0 + pw - 8, y0 - 84, "Up-regulated", size=9.2, weight="700", fill=ROSE_DK, anchor="end")
    c.text(x0 + 8, y0 - 84, "Down-regulated", size=9.2, weight="700", fill=BLUE_DK)

    c.panel_box(412, 170, 324, 168, "Two classic RNA-seq traps")
    c.multiline(428, 210, [
        "1. Pseudoreplication: 3 sequencing lanes",
        "   of ONE library is n = 1, NOT n = 3!",
        "   Biological variance requires independent",
        "   organisms/cultures.",
        "",
        "2. TPM/FPKM distortion: one hugely induced",
        "   gene shrinks everyone else's relative share.",
        "   DESeq2 size factors correct this.",
    ], size=10, lh=16, fill=SOFT)
    c.save(out / "fig-47-rnaseq-pipeline.svg")


def fig_48(out: Path):
    c = Canvas(760, 370, "The bulk composition confound and single-cell barcoding (CB + UMI)",
               "Identical bulk expression (44) can arise from killing proliferating cells OR slowing proliferation — single-cell resolves them")
    # Top: Numerical proof of composition vs state confound
    c.panel_box(24, 72, 712, 142, "Non-identifiability in bulk RNA-seq:  b_g = Σ π_k · μ_gk   (Type A = 100, Type B = 20)")
    boxes = [
        (40, "Control tissue", TEAL, TEAL_BG, "60% A (100) + 40% B (20)", "Bulk = 68"),
        (274, "Story 1: Composition shift", ROSE, ROSE_BG, "30% A (100) + 70% B (20)", "Bulk = 44"),
        (508, "Story 2: State change", BLUE, BLUE_BG, "60% A (60) + 40% B (20)", "Bulk = 44"),
    ]
    for bx, t, col, bg, comp, val in boxes:
        c.rect(bx, 102, 214, 96, fill=bg, stroke=col, sw=1.5, rx=8)
        c.text(bx + 107, 122, t, size=10.5, weight="700", fill=col, anchor="middle")
        # Visual cell-proportion bar
        frac_a = 0.30 if "Story 1" in t else 0.60
        c.rect(bx + 16, 132, 182 * frac_a, 14, fill=col, rx=3)
        c.rect(bx + 16 + 182 * frac_a + 2, 132, 182 * (1 - frac_a) - 2, 14, fill="#cbd5e1", rx=3)
        c.text(bx + 107, 164, comp, size=9.8, fill=INK, anchor="middle")
        c.pill(bx + 56, 172, 102, 20, val, fill="#ffffff", stroke=col, text_fill=col, size=10, mono=True)

    # Bottom: Read 1 (CB + UMI) + Read 2 (cDNA) barcoding anatomy
    c.panel_box(24, 230, 712, 124, "How droplet scRNA-seq removes PCR bias: Cell Barcode (which cell) + UMI (which molecule)")
    c.text(44, 274, "Read 1:", size=10.5, weight="700", fill=INK)
    c.rect(108, 256, 146, 28, fill=TEAL_BG, stroke=TEAL, sw=1.6, rx=5)
    c.text(181, 274, "Cell Barcode (16 bp)", size=10, weight="700", fill=TEAL_DK, anchor="middle")
    c.rect(258, 256, 124, 28, fill=AMBER_BG, stroke=AMBER, sw=1.6, rx=5)
    c.text(320, 274, "UMI (12 bp)", size=10, weight="700", fill=AMBER, anchor="middle")
    c.text(406, 274, "Read 2:", size=10.5, weight="700", fill=INK)
    c.rect(468, 256, 248, 28, fill=BLUE_BG, stroke=BLUE, sw=1.6, rx=5)
    c.text(592, 274, "3′ cDNA transcript (aligns to gene)", size=10, weight="700", fill=BLUE_DK, anchor="middle")
    c.text(380, 314, "400 PCR duplicates sharing the same (CB, UMI, gene) collapse to count = 1 molecule!", size=10.5, weight="700", fill=TEAL_DK, anchor="middle")
    c.text(380, 334, "Remember: condition tests replicate over DONORS, never cells; UMAP distances between clusters are layout artefacts.", size=9.8, fill=SOFT, anchor="middle")
    c.save(out / "fig-48-single-cell-confound.svg")


def fig_49(out: Path):
    c = Canvas(760, 360, "Multi-track epigenome browser: ATAC-seq, ChIP-seq, and chromatin state",
               "Aligned assays map open DNA (ATAC), active promoters (H3K4me3), enhancers (H3K27ac), and silenced domains (H3K27me3)")
    x0, tw = 140, 586
    # Gene track at top
    c.text(24, 96, "Locus map", size=10.5, weight="700", fill=INK)
    c.line(x0, 92, x0 + tw, 92, stroke=INK, sw=2)
    c.rect(x0 + 60, 82, 74, 20, fill=AMBER_BG, stroke=AMBER, sw=1.4, rx=4)
    c.text(x0 + 97, 96, "Enhancer", size=9.5, weight="700", fill=AMBER, anchor="middle")
    c.rect(x0 + 250, 80, 120, 24, fill=TEAL_BG, stroke=TEAL, sw=1.5, rx=4)
    c.text(x0 + 310, 96, "Active Gene →", size=10, weight="700", fill=TEAL_DK, anchor="middle")
    c.rect(x0 + 454, 80, 110, 24, fill=ROSE_BG, stroke=ROSE, sw=1.5, rx=4)
    c.text(x0 + 509, 96, "Silenced Gene", size=10, weight="700", fill=ROSE_DK, anchor="middle")

    # 4 signal tracks
    def draw_track(y_base, name, sub, col, fill_bg, peaks):
        c.text(24, y_base - 14, name, size=10.5, weight="700", fill=col)
        c.text(24, y_base, sub, size=9, fill=FAINT)
        c.line(x0, y_base + 4, x0 + tw, y_base + 4, stroke=RULE, sw=1.2)
        pts = [(x0, y_base + 4)]
        for k in range(140):
            px = x0 + tw * k / 139
            h = 2.0
            for center, width, amp in peaks:
                h += amp * math.exp(-0.5 * ((px - (x0 + center)) / width) ** 2)
            pts.append((px, y_base + 4 - h))
        pts.append((x0 + tw, y_base + 4))
        c.polygon(pts, fill=fill_bg, stroke=col, sw=1.6)

    draw_track(154, "ATAC-seq", "Open chromatin", BLUE, BLUE_BG, [(97, 14, 34), (255, 13, 38)])
    draw_track(212, "H3K4me3", "Active TSS (sharp)", TEAL, TEAL_BG, [(260, 16, 40)])
    draw_track(270, "H3K27ac", "Enhancer + TSS", AMBER, AMBER_BG, [(97, 18, 36), (260, 18, 32)])
    draw_track(328, "H3K27me3", "Polycomb (broad)", ROSE, ROSE_BG, [(490, 48, 32), (535, 40, 28)])
    c.save(out / "fig-49-epigenome-tracks.svg")


def fig_50(out: Path):
    c = Canvas(760, 365, "Hi-C contact matrix and CTCF–cohesin loop extrusion",
               "Contact frequency decays with genomic distance, organizes into TAD triangles, and spikes at convergent CTCF loop anchors")
    # Left: Upper-triangular Hi-C heatmap
    c.panel_box(24, 72, 346, 272, "Hi-C contact map (rotated 45° above genome axis)")
    # Genome baseline
    gx0, gx1, gy = 54, 340, 286
    c.line(gx0, gy, gx1, gy, stroke=INK, sw=2.2)
    # Two TAD triangles
    t1_mid = (gx0 + 196) / 2
    t2_mid = (196 + gx1) / 2
    c.polygon([(gx0, gy), (196, gy), (t1_mid, gy - 72)], fill=ROSE_BG, stroke=ROSE, sw=1.6)
    c.polygon([(198, gy), (gx1, gy), (t2_mid, gy - 72)], fill=ROSE_BG, stroke=ROSE, sw=1.6)
    # Hot diagonal intensity + corner loop dots
    c.polygon([(gx0 + 14, gy), (182, gy), (t1_mid, gy - 54)], fill=ROSE, stroke="none", opacity=0.22)
    c.polygon([(212, gy), (gx1 - 14, gy), (t2_mid, gy - 54)], fill=ROSE, stroke="none", opacity=0.22)
    c.circle(t1_mid, gy - 68, 6.5, fill=ROSE_DK)
    c.circle(t2_mid, gy - 68, 6.5, fill=ROSE_DK)
    # Outer faint A/B compartment triangle
    c.polygon([(gx0, gy), (gx1, gy), ((gx0 + gx1) / 2, gy - 144)], fill="none", stroke=RULE, sw=1.2, dash="3,3")
    c.text(t1_mid, gy - 20, "TAD 1", size=11, weight="700", fill=ROSE_DK, anchor="middle")
    c.text(t2_mid, gy - 20, "TAD 2", size=11, weight="700", fill=ROSE_DK, anchor="middle")
    c.text(t1_mid, gy - 82, "Loop corner dot", size=9.2, weight="700", fill=ROSE_DK, anchor="middle")
    # Convergent CTCF arrows along baseline
    c.text(gx0 + 6, gy + 16, "▶ CTCF", size=8.8, weight="700", fill=TEAL_DK)
    c.text(196, gy + 16, "◀ | ▶", size=9.5, weight="700", fill=TEAL_DK, anchor="middle")
    c.text(gx1 - 6, gy + 16, "CTCF ◀", size=8.8, weight="700", fill=TEAL_DK, anchor="end")
    c.text(196, 330, "Boundary insulates enhancers inside TAD 1 from TAD 2", size=9.5, fill=SOFT, anchor="middle")

    # Right: Cohesin loop extrusion mechanism
    c.panel_box(390, 72, 346, 272, "Loop extrusion stalls at convergent CTCF motifs (→ ··· ←)")
    c.path("M 420 264 L 502 264 C 520 264, 466 130, 562 130 C 658 130, 604 264, 622 264 L 708 264", stroke=INK, sw=3)
    # Cohesin ring pinching base
    c.ellipse(562, 246, 62, 18, fill=PURPLE_BG, stroke=PURPLE, sw=2.4, opacity=0.85)
    c.text(562, 250, "Cohesin ring (ATP motor)", size=9.5, weight="700", fill=PURPLE, anchor="middle")
    # CTCF stops
    c.pill(464, 276, 64, 22, "CTCF →", fill=TEAL_BG, stroke=TEAL, text_fill=TEAL_DK, size=9.5)
    c.pill(598, 276, 64, 22, "← CTCF", fill=TEAL_BG, stroke=TEAL, text_fill=TEAL_DK, size=9.5)
    c.pill(512, 114, 100, 22, "Extruded TAD loop", fill=AMBER_BG, stroke=AMBER, text_fill=AMBER, size=9.5)
    c.text(562, 326, "Deleting a boundary merges TADs → ectopic enhancer activation!", size=9.6, weight="600", fill=ROSE_DK, anchor="middle")
    c.save(out / "fig-50-hic-tad-loops.svg")


def build_all(out: Path):
    for fn in [fig_39, fig_40, fig_41, fig_42, fig_43, fig_44, fig_45, fig_46, fig_47, fig_48, fig_49, fig_50]:
        fn(out)
    print("Generated 12 SVGs for Parts 9–10 (Ch 39–50)")


if __name__ == "__main__":
    build_all(Path(__file__).resolve().parents[2] / "figures")
