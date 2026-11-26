"""Generate 20 precision SVG diagrams for Parts 11, 12, D (SCA12), and S (Statistics)."""
from __future__ import annotations

import math
from pathlib import Path
from svg_kit import (
    AMBER, AMBER_BG, BG, BLUE, BLUE_BG, BLUE_DK, DNA, DNA_BG, EMERALD, FAINT,
    GOLD, GREEN, GREEN_BG, INK, PANEL, PURPLE, PURPLE_BG, ROSE, ROSE_BG,
    ROSE_DK, RULE, RULE_LT, SOFT, SUNK, TEAL, TEAL_BG, TEAL_DK, Canvas, normal_pdf,
)


def fig_51(out: Path):
    c = Canvas(760, 360, "GWAS Manhattan plot and QQ diagnostic for population stratification",
               "A single locus creates an LD skyscraper above 5 × 10⁻⁸; genome-wide QQ inflation (λ_GC ≫ 1) exposes unmodeled ancestry confounding")
    # Left: Manhattan plot
    c.panel_box(24, 72, 434, 268, "Manhattan plot across chromosomes (5 × 10⁻⁸ threshold)")
    x0, y0, pw, ph = 70, 286, 368, 166
    c.axes(x0, y0, pw, ph, xlabel="Chromosome", ylabel="−log₁₀(p)",
           xticks=[(0.08, "1"), (0.25, "4"), (0.45, "8"), (0.65, "13"), (0.85, "19")],
           yticks=[(0, "0"), (0.5, "7.3"), (1.0, "14")])
    # Genome-wide threshold 7.3
    ty = y0 - (7.3 / 14.0) * ph
    c.line(x0, ty, x0 + pw, ty, stroke=ROSE, sw=1.4, dash="4,3")
    c.text(x0 + pw - 4, ty - 5, "p = 5 × 10⁻⁸", size=9.2, weight="700", fill=ROSE_DK, anchor="end")
    # Deterministic SNPs + 2 real skyscrapers at x=0.22 (chr3) and x=0.68 (chr14)
    st = 17
    for i in range(180):
        st = (1103515245 * st + 12345) & 0x7FFFFFFF
        fx = i / 179.0
        chr_idx = int(fx * 10)
        col = TEAL if chr_idx % 2 == 0 else BLUE
        base = -math.log10(max(0.002, (st / 0x7FFFFFFF)))
        # Add two LD skyscrapers
        pk1 = 10.2 * math.exp(-((fx - 0.22) / 0.015) ** 2)
        pk2 = 8.4 * math.exp(-((fx - 0.68) / 0.015) ** 2)
        val = min(13.6, base + pk1 + pk2)
        c.circle(x0 + fx * pw, y0 - (val / 14.0) * ph, 2.3 if val > 7.3 else 1.8, fill=ROSE if val > 7.3 else col, opacity=0.85)

    # Right: QQ plot (confounded vs PC-corrected)
    c.panel_box(476, 72, 260, 268, "QQ plot: Confounded vs. PC-corrected")
    qx0, qy0, qpw, qph = 524, 286, 192, 166
    c.axes(qx0, qy0, qpw, qph, xlabel="Expected −log₁₀(p)", ylabel="Observed",
           xticks=[(0, "0"), (0.5, "3"), (1, "6")], yticks=[(0, "0"), (0.5, "6"), (1, "12")])
    # Null diagonal (obs = exp -> slope 0.5 in this 6x12 box)
    c.line(qx0, qy0, qx0 + qpw, qy0 - 0.5 * qph, stroke=FAINT, sw=1.4, dash="3,3")
    # Confounded (lifts immediately -> lambda_GC = 1.65)
    conf_pts = [(qx0 + k / 40 * qpw, qy0 - min(1.0, (k / 40) * 0.96) * qph) for k in range(41)]
    c.polyline(conf_pts, stroke=ROSE, sw=2.4)
    c.text(qx0 + 70, qy0 - 0.84 * qph, "Naive (λ_GC=1.65)", size=9.2, weight="700", fill=ROSE_DK)
    # PC-corrected (hugs null then shoots up at tail!)
    clean_pts = [(qx0 + k / 40 * qpw, qy0 - min(0.96, (k / 40) * 0.50 + max(0, k / 40 - 0.82) ** 2 * 14) * qph) for k in range(41)]
    c.polyline(clean_pts, stroke=TEAL, sw=2.4)
    c.text(qx0 + 96, qy0 - 0.24 * qph, "+PCs (λ_GC=1.01)", size=9.2, weight="700", fill=TEAL_DK)
    c.save(out / "fig-51-gwas-manhattan-qq.svg")


def fig_52(out: Path):
    c = Canvas(760, 355, "From GWAS association to causal mechanism: fine-mapping and colocalization",
               "Because SNPs travel in correlated LD blocks, the top GWAS hit is rarely the causal variant — and nearest gene is often wrong")
    steps = [
        (24, "1. GWAS locus", BLUE, BLUE_BG, ["50 correlated SNPs in", "high LD (r² > 0.8)", "share one peak"]),
        (206, "2. Fine-mapping", TEAL, TEAL_BG, ["SuSiE / FINEMAP yields", "95% credible set with", "PIP summing to 0.95"]),
        (388, "3. Colocalization", PURPLE, PURPLE_BG, ["Does GWAS share the", "SAME causal SNP as", "tissue eQTL (PP.H4)?"]),
        (570, "4. Perturbation", AMBER, AMBER_BG, ["CRISPRi enhancer test", "in target cell type", "proves causal gene!"]),
    ]
    for i, (x, t, col, bg, lines) in enumerate(steps):
        c.box(x, 76, 166, 108, t, lines, fill=bg, stroke=col, title_fill=col, body_size=9.8)
        if i < 3:
            c.arrow(x + 168, 130, x + 202, 130, color="ink", sw=1.8)

    # Bottom contrast: True colocalization vs LD hitchhiking (H4 vs H3)
    c.panel_box(24, 204, 344, 134, "True colocalization (PP.H4 high)", fill=GREEN_BG, stroke=GREEN, header_fill=GREEN)
    c.text(196, 248, "GWAS peak   ▲   and   eQTL peak   ▲", size=10.5, weight="700", fill=GREEN, anchor="middle")
    c.text(196, 270, "Driven by the EXACT same causal variant", size=10.2, fill=INK, anchor="middle")
    c.text(196, 294, "Multi-ancestry fine-mapping (shorter AFR LD)", size=9.8, fill=SOFT, anchor="middle")
    c.text(196, 312, "shrinks the credible set from 40 SNPs to 2–3.", size=9.8, fill=SOFT, anchor="middle")

    c.panel_box(392, 204, 344, 134, "Distinct linked variants (PP.H3 — false link!)", fill=ROSE_BG, stroke=ROSE, header_fill=ROSE_DK)
    c.text(564, 248, "GWAS causal (SNP1)  ←LD→  eQTL causal (SNP2)", size=10.2, weight="700", fill=ROSE_DK, anchor="middle")
    c.text(564, 272, "Both hit at p < 10⁻⁸, yet regulate DIFFERENT genes!", size=10.2, fill=INK, anchor="middle")
    c.text(564, 298, "Overlap of significant p-values ≠ shared mechanism.", size=9.8, fill=SOFT, anchor="middle")
    c.save(out / "fig-52-finemapping-coloc.svg")


def fig_53(out: Path):
    c = Canvas(760, 360, "Polygenic scores (PGS): liability overlap and cross-ancestry portability loss",
               "Even an informative PGS overlaps heavily between cases and controls — and drops sharply when ported to non-training ancestries")
    # Left: Case vs Control PGS distribution overlap
    c.panel_box(24, 72, 364, 268, "Case vs. Control PGS distributions (strong overlap!)")
    x0, y0, pw, ph = 58, 286, 304, 166
    c.axes(x0, y0, pw, ph, xlabel="Standardized PGS (z-score)", ylabel="Density",
           xticks=[(0, "-3"), (0.5, "0"), (1, "+3")])
    for mu, col, lbl, lx in [(-0.4, BLUE, "Controls", 0.25), (0.65, ROSE, "Cases", 0.78)]:
        pts = [(x0 + ((z + 3.5) / 7.0) * pw, y0 - (normal_pdf(z, mu, 1) / 0.44) * ph) for z in [-3.5 + 7.0 * k / 80 for k in range(81)]]
        c.polyline(pts, stroke=col, sw=2.4)
        c.text(x0 + lx * pw, y0 - 0.88 * ph, lbl, size=10, weight="700", fill=col, anchor="middle")
    # Top 5% risk tail
    tx = x0 + ((1.65 + 3.5) / 7.0) * pw
    c.line(tx, y0 - ph, tx, y0, stroke=AMBER, sw=1.4, dash="4,3")
    c.text(tx - 4, y0 - ph + 16, "Top 5% tail (~3× OR)", size=9.2, weight="700", fill=AMBER, anchor="end")

    # Right: Martin et al. cross-ancestry R² portability drop
    c.panel_box(408, 72, 328, 268, "Relative PGS accuracy (EUR-trained GWAS)")
    bars = [
        ("European (EUR)", 1.00, TEAL),
        ("Hispanic / AMR", 0.65, BLUE),
        ("South Asian (SAS)", 0.58, PURPLE),
        ("East Asian (EAS)", 0.49, AMBER),
        ("African (AFR)", 0.24, ROSE),
    ]
    for idx, (pop, val, col) in enumerate(bars):
        yy = 116 + idx * 38
        c.text(422, yy + 15, pop, size=10, weight="600", fill=INK)
        c.rect(544, yy, val * 144, 22, fill=col, rx=4)
        c.text(544 + val * 144 + 6, yy + 15, f"{int(val * 100)}%", size=10, weight="700", fill=col, mono=True)
    c.text(572, 322, "Driven by LD & allele-frequency differences (not biology).", size=9.5, fill=SOFT, anchor="middle")
    c.save(out / "fig-53-polygenic-scores.svg")


def fig_54(out: Path):
    c = Canvas(760, 360, "The allelic architecture spectrum: allele frequency vs. effect size",
               "Purifying selection empties the upper-right corner; GWAS sees the lower-right while sequencing/pedigrees hunt the upper-left")
    x0, y0, pw, ph = 84, 286, 466, 198
    c.axes(x0, y0, pw, ph, xlabel="Minor Allele Frequency (log scale)", ylabel="Effect size / Odds Ratio",
           xticks=[(0.08, "0.01%"), (0.33, "0.1%"), (0.58, "1%"), (0.82, "10%"), (0.96, "50%")],
           yticks=[(0.12, "1.1×"), (0.45, "2×"), (0.78, "10×"), (0.95, "100×")])

    # Four quadrants / zones
    c.ellipse(x0 + 0.16 * pw, y0 - 0.84 * ph, 64, 28, fill=ROSE_BG, stroke=ROSE, sw=1.8)
    c.text(x0 + 0.16 * pw, y0 - 0.86 * ph, "Mendelian rare", size=10.5, weight="700", fill=ROSE_DK, anchor="middle")
    c.text(x0 + 0.16 * pw, y0 - 0.77 * ph, "(WES/WGS, SCA12)", size=9, fill=SOFT, anchor="middle")

    c.ellipse(x0 + 0.44 * pw, y0 - 0.54 * ph, 72, 28, fill=AMBER_BG, stroke=AMBER, sw=1.8)
    c.text(x0 + 0.44 * pw, y0 - 0.56 * ph, "Low-freq intermediate", size=10, weight="700", fill=AMBER, anchor="middle")
    c.text(x0 + 0.44 * pw, y0 - 0.47 * ph, "(BRCA2, APOE ε4)", size=9, fill=SOFT, anchor="middle")

    c.ellipse(x0 + 0.80 * pw, y0 - 0.18 * ph, 74, 26, fill=TEAL_BG, stroke=TEAL, sw=1.8)
    c.text(x0 + 0.80 * pw, y0 - 0.20 * ph, "Common GWAS hits", size=10.5, weight="700", fill=TEAL_DK, anchor="middle")
    c.text(x0 + 0.80 * pw, y0 - 0.11 * ph, "(OR 1.05–1.3)", size=9, fill=SOFT, anchor="middle")

    # Empty upper-right corner
    c.rect(x0 + 0.58 * pw, y0 - 0.96 * ph, 0.39 * pw, 0.36 * ph, fill=SUNK, stroke=RULE, dash="4,3", rx=8)
    c.multiline(x0 + 0.775 * pw, y0 - 0.81 * ph, ["EMPTY CORNER", "Purifying selection", "purges common", "severe alleles"], size=9.8, lh=14, fill=FAINT, anchor="middle")

    # Lower-left underpowered corner
    c.rect(x0 + 0.04 * pw, y0 - 0.38 * ph, 0.38 * pw, 0.32 * ph, fill=PANEL, stroke=RULE, dash="4,3", rx=8)
    c.multiline(x0 + 0.23 * pw, y0 - 0.24 * ph, ["Low statistical power", "(rare + small effect:", "hard to detect)"], size=9.5, lh=14, fill=FAINT, anchor="middle")

    c.panel_box(568, 84, 168, 204, "Discovery tools")
    c.multiline(580, 118, [
        "Upper-left:",
        "• Pedigree / trio WGS",
        "• Gene burden tests",
        "• Repeat-primed PCR",
        "",
        "Lower-right:",
        "• SNP array GWAS",
        "• Biobank N > 100k",
    ], size=9.8, lh=16, fill=SOFT)
    c.save(out / "fig-54-allelic-architecture.svg")


def fig_55(out: Path):
    c = Canvas(760, 355, "ACMG/AMP five-tier clinical classification and Bayesian posterior scale",
               "Tavtigian et al. mapped ACMG evidence rules onto explicit posterior probabilities — VUS is an honest abstention zone")
    # 5 tiers horizontal scale
    tiers = [
        (24, 128, "Benign (B)", "< 0.1%", GREEN, GREEN_BG),
        (160, 134, "Likely Benign (LB)", "0.1% – 10%", TEAL, TEAL_BG),
        (302, 156, "VUS (Uncertain)", "10% – 90%  (Abstain!)", AMBER, AMBER_BG),
        (466, 134, "Likely Path (LP)", "90% – 99%", ROSE, ROSE_BG),
        (608, 128, "Pathogenic (P)", "> 99%", ROSE_DK, ROSE_BG),
    ]
    for x, w, t, pr, col, bg in tiers:
        c.rect(x, 82, w, 78, fill=bg, stroke=col, sw=1.8, rx=8)
        c.text(x + w / 2, 108, t, size=10.5, weight="700", fill=col, anchor="middle")
        c.pill(x + 12, 122, w - 24, 24, pr, fill="#ffffff", stroke=col, text_fill=col, size=9.5, mono=True)

    # Bottom: Evidence strength ladder (Points framework)
    c.panel_box(24, 182, 712, 154, "Quantitative ACMG evidence ladder (prior ≈ 10% → sum evidence points)")
    pts_rows = [
        ("Very Strong (PVS1: +8 pts)", "Predicted null variant in a proven LoF disease gene", ROSE_DK),
        ("Strong (PS1–4: +4 pts)", "Well-established functional assay or confirmed de novo (PS2)", ROSE),
        ("Moderate (PM1–6: +2 pts)", "Absent from gnomAD (PM2) or mutational hotspot (PM1)", AMBER),
        ("Supporting (PP1–5: +1 pt)", "Cosegregation or computational VEP score (ESM-2 / AlphaMissense)", BLUE),
    ]
    for idx, (tag, desc, col) in enumerate(pts_rows):
        yy = 216 + idx * 28
        c.pill(38, yy - 13, 196, 22, tag, fill="#ffffff", stroke=col, text_fill=col, size=9.2)
        c.text(248, yy + 2, desc, size=10.2, fill=INK)
    c.save(out / "fig-55-acmg-bayesian.svg")


def fig_56(out: Path):
    c = Canvas(760, 360, "Cancer as somatic Darwinian evolution: clonal fishplot and Knudson's two-hit model",
               "Tumors evolve through sequential driver mutations, branching subclones, and therapy-selected resistant relapse")
    # Top: Clonal evolution fishplot
    c.panel_box(24, 72, 712, 162, "Clonal evolution from normal cell → primary tumor → drug bottleneck → resistant relapse")
    # Trunk clone (teal), subclone A (blue), resistant subclone B (rose)
    c.polygon([(48, 162), (160, 120), (380, 106), (480, 156), (706, 114), (706, 212), (480, 174), (380, 216), (160, 204), (48, 168)], fill=TEAL_BG, stroke=TEAL, sw=1.6)
    c.polygon([(200, 134), (380, 118), (445, 160), (380, 170)], fill=BLUE_BG, stroke=BLUE, sw=1.5)
    c.polygon([(300, 186), (380, 198), (480, 168), (706, 126), (706, 206), (480, 174)], fill=ROSE_BG, stroke=ROSE, sw=1.8)
    c.line(480, 114, 480, 224, stroke=AMBER, sw=2, dash="4,3")
    c.text(480, 108, "Targeted therapy", size=9.5, weight="700", fill=AMBER, anchor="middle")
    c.multiline(124, 162, ["Driver 1", "(trunk)"], size=9.5, weight="700", fill=TEAL_DK, anchor="middle", lh=12)
    c.text(320, 148, "Sensitive subclone", size=9.2, weight="700", fill=BLUE_DK, anchor="middle")
    c.text(606, 172, "Resistant clone expands", size=10.5, weight="700", fill=ROSE_DK, anchor="middle")

    # Bottom: Knudson two-hit TSG vs Oncogene
    c.box(24, 248, 344, 92, "Tumor suppressors (Knudson two-hit)", [
        "Need BOTH copies knocked out (recessive at cell level).",
        "Hereditary (RB1, BRCA1): born with Hit 1 → early onset.",
        "Sporadic: needs two independent somatic hits → late onset.",
    ], fill=BLUE_BG, stroke=BLUE, title_fill=BLUE_DK, body_size=9.8)
    c.box(392, 248, 344, 92, "Oncogenes (single-hit gain of function)", [
        "One activating mutation (e.g. KRAS G12D, BRAF V600E)",
        "locks signaling ON — dominant at the cellular level.",
        "Most mutations in a tumor (>95%) are neutral passengers!",
    ], fill=AMBER_BG, stroke=AMBER, title_fill=AMBER, body_size=9.8)
    c.save(out / "fig-56-cancer-evolution.svg")


def fig_57(out: Path):
    c = Canvas(760, 355, "Screening vs. diagnosis: why Positive Predictive Value depends on prior prevalence",
               "Even a test with 99% sensitivity and 99.9% specificity has <50% PPV when the condition is rarer than 1 in 1,000")
    x0, y0, pw, ph = 84, 282, 396, 192
    c.axes(x0, y0, pw, ph, xlabel="Prior prevalence (log₁₀ scale)", ylabel="Positive Predictive Value",
           xticks=[(0, "1:10,000"), (0.33, "1:1,000"), (0.67, "1:100"), (1, "1:10")],
           yticks=[(0, "0%"), (0.5, "50%"), (1, "100%")])
    # Exact Bayes PPV for sens=0.99, spec=0.999 (FPR=0.001) and spec=0.99 (FPR=0.01)
    for fpr, col, lbl, ly in [(0.001, TEAL, "99.9% spec (NIPT T21)", 0.88), (0.01, AMBER, "99.0% spec", 0.36)]:
        pts = []
        for k in range(81):
            exp = -4.0 + 3.0 * k / 80
            prev = 10 ** exp
            ppv = (0.99 * prev) / (0.99 * prev + fpr * (1 - prev))
            pts.append((x0 + (k / 80) * pw, y0 - ppv * ph))
        c.polyline(pts, stroke=col, sw=2.6)
        c.text(x0 + 0.56 * pw, y0 - ly * ph, lbl, size=9.8, weight="700", fill=col)

    c.panel_box(504, 82, 232, 224, "NIPT worked check (age 25 vs 40)")
    c.multiline(518, 118, [
        "Test: 99% sens, 99.9% spec",
        "",
        "High prior (1 in 100):",
        "  99 TP vs 10 FP → PPV ≈ 91%",
        "",
        "Low prior (1 in 1,200):",
        "  8 TP vs 10 FP → PPV ≈ 45%!",
        "",
        "Rule: Screening flags risk;",
        "follow with diagnostic test.",
    ], size=10, lh=16, fill=SOFT)
    c.save(out / "fig-57-clinical-screening-ppv.svg")


def fig_58(out: Path):
    c = Canvas(760, 355, "Why a genome cannot be anonymized: long-range familial re-identification",
               "Even with your name stripped, sharing IBD segments with a distant 3rd cousin in a public database narrows identity to a few people")
    # Re-identification chain
    nodes = [
        (24, "De-identified\nDNA sample", ROSE, ROSE_BG, "Name removed;\nSNPs uploaded"),
        (206, "IBD match to\n3rd cousin", AMBER, AMBER_BG, "~0.8% shared DNA\nin public database"),
        (388, "Shared great-great-\ngrandparents", BLUE, BLUE_BG, "Public genealogy\ntree narrows branch"),
        (570, "Age + Zip + Sex\nintersection", PURPLE, PURPLE_BG, "Usually leaves 1–3\nindividuals unique!"),
    ]
    for i, (x, t, col, bg, d) in enumerate(nodes):
        lines = t.split("\n")
        c.box(x, 82, 166, 118, lines[0], lines[1:] + ["", *d.split("\n")], fill=bg, stroke=col, title_fill=col, title_size=10.5, body_size=9.5)
        if i < 3:
            c.arrow(x + 168, 140, x + 202, 140, color="ink", sw=1.8)

    # Bottom: Governance & consent realities
    c.panel_box(24, 222, 712, 114, "Technical controls vs. governance realities")
    c.multiline(42, 258, [
        "• A genome is a familial identifier: uploading your DNA automatically reveals relatives who never consented.",
        "• Controlled-access enclaves (dbGaP, UK Biobank, All of Us) and federated analysis protect raw genotypes far better than 'de-identification'.",
        "• Legal protections (e.g. GINA in the US) cover health insurance & employment — NOT life, disability, or long-term-care insurance.",
    ], size=10.2, lh=20, fill=SOFT)
    c.save(out / "fig-58-genomic-privacy.svg")


def fig_D1(out: Path):
    c = Canvas(760, 365, "Cerebellar cortical circuit and why Purkinje neurons are selectively vulnerable",
               "Purkinje cells integrate ~150,000 parallel-fiber synapses plus one powerful climbing fiber and are the SOLE output of the cerebellar cortex")
    # 3 horizontal cortical layers on left
    c.rect(24, 76, 444, 86, fill=BLUE_BG, stroke=BLUE, sw=1.3, rx=8)
    c.text(36, 96, "Molecular layer", size=10.5, weight="700", fill=BLUE_DK)
    c.text(36, 114, "Parallel fibers (×150,000) cross flat Purkinje dendritic fan", size=9.5, fill=SOFT)

    c.rect(24, 168, 444, 62, fill=TEAL_BG, stroke=TEAL, sw=1.6, rx=8)
    c.text(36, 188, "Purkinje cell layer (monolayer)", size=10.5, weight="700", fill=TEAL_DK)
    c.text(36, 206, "Massive GABAergic neurons — SOLE cortical output (→ DCN)", size=9.5, fill=INK)

    c.rect(24, 236, 444, 68, fill=AMBER_BG, stroke=AMBER, sw=1.3, rx=8)
    c.text(36, 256, "Granule cell layer", size=10.5, weight="700", fill=AMBER)
    c.text(36, 274, "Billions of tiny excitatory granule cells (mossy-fiber input)", size=9.5, fill=SOFT)

    # Schematic Purkinje neuron + inputs inside layers
    c.circle(384, 198, 16, fill=TEAL, stroke="#ffffff", sw=2)
    c.text(384, 202, "PC", size=10, weight="700", fill="#ffffff", anchor="middle")
    # Dendritic tree up into molecular layer
    c.line(384, 182, 384, 128, stroke=TEAL_DK, sw=2.6)
    for dx in (-44, -22, 0, 22, 44):
        c.line(384, 142, 384 + dx, 102, stroke=TEAL_DK, sw=1.8)
    # Axon down to DCN
    c.arrow(384, 216, 384, 326, color="teal", sw=2.4)
    c.pill(314, 328, 140, 22, "Deep Cerebellar Nuclei", fill=PURPLE_BG, stroke=PURPLE, text_fill=PURPLE, size=9.5)

    # Right: Vulnerability checklist
    c.panel_box(486, 76, 250, 272, "Why Purkinje cells die first in SCAs")
    c.multiline(500, 114, [
        "1. Pacemaker firing (40–100 Hz)",
        "   spontaneously, 24/7 for decades",
        "",
        "2. Extreme Ca²⁺ & ATP demand",
        "   across massive dendritic arbor",
        "",
        "3. Zero redundancy: sole output",
        "   wire from cerebellar cortex",
        "",
        "4. Post-mitotic (never replaced);",
        "   somatic repeat instability &",
        "   signaling drift accumulate",
        "   over a human lifetime.",
    ], size=10, lh=16, fill=SOFT)
    c.save(out / "fig-D1-cerebellar-circuit.svg")


def fig_D2(out: Path):
    c = Canvas(760, 360, "Combinatorial architecture of the PP2A phosphatase holoenzyme",
               "Kinases (~500) outnumber serine/threonine phosphatase catalytic subunits (~30) — PP2A achieves specificity via ~20 swappable B subunits")
    # Top: Kinase vs Phosphatase toggle
    c.rect(24, 72, 712, 62, fill=PANEL, stroke=RULE, rx=8)
    c.pill(46, 90, 120, 26, "Protein (inactive)", fill=SUNK, stroke=RULE, text_fill=INK, size=10)
    c.arrow(172, 97, 302, 97, color="amber", sw=2)
    c.text(237, 90, "Kinase (+ATP)", size=9.5, weight="700", fill=AMBER, anchor="middle")
    c.arrow(302, 111, 172, 111, color="teal", sw=2)
    c.text(237, 124, "PP2A Phosphatase (−Pᵢ)", size=9.5, weight="700", fill=TEAL_DK, anchor="middle")
    c.pill(308, 90, 134, 26, "Protein–PO₄²⁻ (ON)", fill=AMBER_BG, stroke=AMBER, text_fill=AMBER, size=10)
    c.multiline(464, 95, ["Reversible phosphorylation is the cell's", "fast mutable state (ion channels, tau, TFs)."], size=10, lh=15, fill=SOFT)

    # Bottom: PP2A Heterotrimer combinatorial equation
    c.panel_box(24, 152, 712, 190, "PP2A holoenzyme = A (scaffold) + C (catalytic) + B (substrate-addressing subunit)")
    c.box(44, 194, 166, 94, "A · Scaffold (2 genes)", ["PPP2R1A / PPP2R1B", "Horseshoe HEAT repeats", "Holds B and C together"], fill=BLUE_BG, stroke=BLUE, title_fill=BLUE_DK, body_size=9.5)
    c.text(226, 246, "+", size=20, weight="700", fill=SOFT, anchor="middle")
    c.box(242, 194, 166, 94, "C · Catalytic (2 genes)", ["PPP2CA / PPP2CB", "Active site (2 metal ions)", "Does the dephosphorylation"], fill=AMBER_BG, stroke=AMBER, title_fill=AMBER, body_size=9.5)
    c.text(424, 246, "+", size=20, weight="700", fill=SOFT, anchor="middle")
    c.box(440, 194, 276, 94, "B · Regulatory (~20 isoforms · 4 families)", [
        "B55 (PPP2R2A–D) · B56 · PR72 · Striatin",
        "PPP2R2B encodes B55β (mutated in SCA12!)",
        "Controls WHERE PP2A goes & WHICH substrates it cuts",
    ], fill=TEAL_BG, stroke=TEAL, title_fill=TEAL_DK, body_size=9.5)
    c.text(380, 322, "2 A × 2 C × ~20 B  →  60–100 distinct PP2A holoenzymes sharing one catalytic engine.", size=10.5, weight="700", fill=INK, anchor="middle")
    c.save(out / "fig-D2-pp2a-switch.svg")


def fig_D3(out: Path):
    c = Canvas(760, 365, "Repeat-expansion disorders across gene anatomy and somatic instability",
               "Where a repeat sits (5′ UTR, exon, intron, 3′ UTR) shapes its toxicity mechanism; MSH2/MSH3 mismatch repair drives somatic expansion")
    # Gene map showing where major repeat diseases sit
    c.panel_box(24, 72, 712, 152, "Gene-region taxonomy of human tandem repeat expansions")
    c.line(48, 148, 712, 148, stroke=INK, sw=3)
    regions = [
        (56, 134, "5′ UTR", ROSE, ROSE_BG, "SCA12 (CAG · PPP2R2B)\nFragile X (CGG · FMR1)"),
        (210, 146, "Coding Exon", BLUE, BLUE_BG, "HD, SCA1/2/3/6/7/17\n(PolyQ CAG repeats)"),
        (376, 148, "Intron", PURPLE, PURPLE_BG, "C9orf72 (G₄C₂ · ALS)\nFRDA (GAA · FXN)"),
        (544, 154, "3′ UTR", AMBER, AMBER_BG, "DM1 (CTG · DMPK)\nSCA8 (CTA/CTG)"),
    ]
    for rx, rw, lbl, col, bg, ex in regions:
        c.rect(rx, 132, rw, 32, fill=bg, stroke=col, sw=1.8, rx=5)
        c.text(rx + rw / 2, 152, lbl, size=10.5, weight="700", fill=col, anchor="middle")
        c.multiline(rx + rw / 2, 184, ex.split("\n"), size=9.2, lh=14, fill=INK, anchor="middle")

    # Bottom: Somatic expansion / anticipation feedback loop
    c.panel_box(24, 240, 712, 108, "Why repeats expand over generations (anticipation) and inside aging neurons (somatic instability)")
    steps = [
        (42, "1. Hairpin loop forms", "CAG/CTG strands slip out", AMBER, AMBER_BG),
        (216, "2. MSH2/MSH3 binds", "MutSβ recognizes loop", PURPLE, PURPLE_BG),
        (390, "3. Error-prone repair", "Loop copied into duplex!", ROSE, ROSE_BG),
        (564, "4. Longer tract", "Even faster future slippage", ROSE_DK, ROSE_BG),
    ]
    for i, (sx, t, d, col, bg) in enumerate(steps):
        c.box(sx, 274, 152, 56, t, [d], fill=bg, stroke=col, title_fill=col, title_size=10, body_size=9.2)
        if i < 3:
            c.arrow(sx + 154, 302, sx + 172, 302, color="rose", sw=1.6)
    c.save(out / "fig-D3-repeat-expansions.svg")


def fig_D4(out: Path):
    c = Canvas(760, 375, "SCA12 (PPP2R2B on chr5q32): the 5′ CAG repeat locus and five competing hypotheses",
               "Alternative first exons make the same CAG repeat sit in a 5′ UTR, promoter, or coding frame depending on isoform — breaking neat taxonomy")
    # Top: PPP2R2B locus diagram
    c.panel_box(24, 72, 712, 128, "PPP2R2B (chr5q32) · Normal: 7–31 CAG  |  Pathogenic SCA12: ~43–78+ CAG")
    c.line(48, 136, 712, 136, stroke=INK, sw=2.8)
    c.rect(72, 120, 92, 32, fill=ROSE_BG, stroke=ROSE, sw=2, rx=5)
    c.text(118, 140, "(CAG)ₙ", size=11.5, weight="700", fill=ROSE_DK, anchor="middle", mono=True)
    c.text(118, 112, "5′ Promoter / Exon 1a", size=9.2, weight="700", fill=ROSE_DK, anchor="middle")
    c.rect(206, 122, 86, 28, fill=BLUE_BG, stroke=BLUE, sw=1.6, rx=4)
    c.text(249, 140, "Alt Exon 1b", size=9.8, weight="700", fill=BLUE_DK, anchor="middle")
    c.rect(334, 122, 86, 28, fill=PURPLE_BG, stroke=PURPLE, sw=1.6, rx=4)
    c.text(377, 140, "Alt Exon 1c", size=9.8, weight="700", fill=PURPLE, anchor="middle")
    c.rect(476, 118, 214, 36, fill=TEAL_BG, stroke=TEAL, sw=1.8, rx=5)
    c.text(583, 140, "Shared Core Exons 2–10 (B55β)", size=10.5, weight="700", fill=TEAL_DK, anchor="middle")
    c.text(380, 182, "Different N-terminal first exons target B55β to distinct compartments (e.g. cytoplasm vs outer mitochondrial membrane)!", size=10, fill=SOFT, anchor="middle")

    # Bottom: The 5 competing SCA12 disease hypotheses
    c.text(24, 224, "Five candidate mechanisms still actively tested in SCA12 (why SCA12 breaks single-bucket models):", size=11, weight="700", fill=INK)
    hyps = [
        (24, "A · Promoter dosage", TEAL, TEAL_BG, "CAG acts in cis to alter\nPPP2R2B transcription"),
        (170, "B · Isoform shift", BLUE, BLUE_BG, "Shifts ratio of B55β1\nvs mitochondrial B55β2"),
        (316, "C · RNA toxicity", AMBER, AMBER_BG, "Expanded CAG RNA foci\nsequester splicing factors"),
        (462, "D · Antisense / RAN", PURPLE, PURPLE_BG, "Bidirectional / non-ATG\ntoxic peptide translation"),
        (608, "E · Somatic drift", ROSE, ROSE_BG, "Post-mitotic cerebellar\nCAG expansion over time"),
    ]
    for hx, t, col, bg, d in hyps:
        c.box(hx, 238, 128, 116, t, d.split("\n"), fill=bg, stroke=col, title_fill=col, title_size=10, body_size=9.2)
    c.save(out / "fig-D4-sca12-locus-hypotheses.svg")


def fig_D5(out: Path):
    c = Canvas(760, 360, "SCA12 clinical testing blind spot and therapeutic modality comparison",
               "Standard short-read exomes miss expanded CAG tracts; each emerging therapy targets a different link in the pathogenic chain")
    # Top: Diagnostic blind spot
    c.panel_box(24, 72, 712, 92, "Why a 'negative' clinical exome / short-read WGS does NOT rule out SCA12", fill=ROSE_BG, stroke=ROSE, header_fill=ROSE_DK)
    c.multiline(42, 110, [
        "• 55 CAG repeats = 165 bp — LONGER than a standard 150 bp Illumina read (cannot span both flanks!).",
        "• Definitive diagnosis requires targeted Repeat-Primed PCR (RP-PCR), ExpansionHunter/TRGT on long reads (PacBio HiFi / ONT), or Southern blot.",
    ], size=10.2, lh=18, fill=INK)

    # Bottom: 4 therapeutic strategies
    ther = [
        (24, "Allele-selective ASO", TEAL, TEAL_BG, [
            "Intrathecal oligo",
            "degrades mutant RNA",
            "via RNase H1 (preserves",
            "healthy PPP2R2B copy)",
        ]),
        (206, "siRNA / miRNA AAV", BLUE, BLUE_BG, [
            "One-time viral delivery",
            "of RNAi against repeat",
            "or linked SNP; durable",
            "CNS knockdown",
        ]),
        (388, "CRISPR Repeat Edit", PURPLE, PURPLE_BG, [
            "Excise or contract CAG",
            "tract directly in DNA",
            "(challenge: safe, broad",
            "Purkinje delivery)",
        ]),
        (570, "MMR / MSH3 Modulator", AMBER, AMBER_BG, [
            "Slow somatic expansion",
            "in neurons across ALL",
            "CAG/CTG repeat diseases",
            "(mechanism-agnostic)",
        ]),
    ]
    for x, t, col, bg, lines in ther:
        c.box(x, 184, 166, 156, t, lines, fill=bg, stroke=col, title_fill=col, title_size=10.8, body_size=9.6)
    c.save(out / "fig-D5-sca12-clinic-therapy.svg")


def fig_S1(out: Path):
    c = Canvas(760, 355, "Conditional probability: why a purple F₂ plant has P(AA | purple) = 1/3",
               "Conditioning shrinks the sample space from all 4 equally likely genotypes to the 3 that match the observation")
    # Left: Full sample space (4 boxes) -> Conditioned space (3 boxes)
    c.panel_box(24, 72, 344, 266, "Full sample space of Aa × Aa (4 outcomes)")
    boxes = [(56, 112, "AA", "Purple", TEAL_BG, TEAL), (196, 112, "Aa", "Purple", TEAL_BG, TEAL),
             (56, 212, "aA", "Purple", TEAL_BG, TEAL), (196, 212, "aa", "White (eliminated!)", ROSE_BG, ROSE)]
    for bx, by, g, ph, bg, col in boxes:
        c.rect(bx, by, 124, 76, fill=bg, stroke=col, sw=1.8, rx=8, dash="4,3" if g == "aa" else "")
        c.text(bx + 62, by + 32, g, size=14, weight="700", fill=col, anchor="middle", mono=True)
        c.text(bx + 62, by + 54, ph, size=10, fill=SOFT, anchor="middle")
        if g == "aa":
            c.line(bx + 8, by + 8, bx + 116, by + 68, stroke=ROSE, sw=2)
    c.text(196, 318, "Observing 'Purple' deletes aa → 3 outcomes remain", size=10, weight="700", fill=TEAL_DK, anchor="middle")

    # Right: Bayes theorem visual formula
    c.panel_box(392, 72, 344, 266, "Conditioning & Bayes' theorem")
    c.rect(412, 112, 304, 54, fill=TEAL_BG, stroke=TEAL, sw=1.5, rx=8)
    c.text(564, 134, "P(AA | Purple) = (1/4) / (3/4) = 1/3", size=12, weight="700", fill=TEAL_DK, anchor="middle", mono=True)
    c.text(564, 154, "NOT 1/2! Two of the three purple squares are Aa.", size=10, fill=SOFT, anchor="middle")

    c.rect(412, 186, 304, 62, fill=BLUE_BG, stroke=BLUE, sw=1.5, rx=8)
    c.text(564, 210, "P(H | D)  =  P(D | H) · P(H)  /  P(D)", size=11.5, weight="700", fill=BLUE_DK, anchor="middle", mono=True)
    c.text(564, 232, "Posterior  ∝  Likelihood × Prior", size=10.5, weight="600", fill=SOFT, anchor="middle")

    c.multiline(564, 274, [
        "Same conditioning logic powers pedigree carrier",
        "risk (Ch 15), variant calling (Ch 46), and clinical",
        "ACMG classification (Ch 55).",
    ], size=10, lh=16, fill=SOFT, anchor="middle")
    c.save(out / "fig-S1-probability-bayes.svg")


def fig_S2(out: Path):
    c = Canvas(760, 385, "The four workhorse distributions of genetics and genomics",
               "Each distribution reflects a physical generating mechanism — match the assay physics before picking a model")
    # 2x2 grid
    # 1. Binomial (n=16, p=0.25)
    c.panel_box(24, 70, 346, 144, "Binomial(n=16, p=0.25) · Crosses & read counts", header_fill=TEAL_DK)
    x0, y0, pw, ph = 52, 192, 294, 84
    c.line(x0, y0, x0 + pw, y0, stroke=SOFT, sw=1.2)
    bprobs = [math.comb(16, k) * (0.25 ** k) * (0.75 ** (16 - k)) for k in range(13)]
    bm = max(bprobs)
    for k, pr in enumerate(bprobs):
        bh = (pr / bm) * ph
        c.rect(x0 + k * 22 + 4, y0 - bh, 16, bh, fill=TEAL, rx=2)
    c.text(x0 + 96, 114, "μ = np = 4,  Var = np(1−p)", size=9.5, fill=SOFT, mono=True)

    # 2. Poisson (lambda = 2 vs 6)
    c.panel_box(390, 70, 346, 144, "Poisson(λ) · Sequencing depth & rare mutations", header_fill=BLUE_DK)
    x1, y1 = 418, 192
    c.line(x1, y1, x1 + pw, y1, stroke=SOFT, sw=1.2)
    for lam, col, dx in [(2.0, BLUE, 0), (6.0, PURPLE, 8)]:
        pprobs = [(lam ** k) * math.exp(-lam) / math.factorial(k) for k in range(14)]
        pm = max(pprobs)
        for k, pr in enumerate(pprobs):
            bh = (pr / 0.28) * ph
            c.rect(x1 + k * 20 + dx, y1 - min(ph, bh), 8, min(ph, bh), fill=col, opacity=0.82, rx=2)
    c.text(x1 + 130, 114, "λ=2 (blue) vs λ=6 (purple) · Var = μ", size=9.5, fill=SOFT)

    # 3. Negative Binomial vs Poisson (same mean mu=8, overdispersed!)
    c.panel_box(24, 226, 346, 144, "Negative Binomial vs. Poisson (same μ=8) · RNA-seq", header_fill=AMBER)
    x2, y2 = 52, 348
    c.line(x2, y2, x2 + pw, y2, stroke=SOFT, sw=1.2)
    pois8 = [(8.0 ** k) * math.exp(-8.0) / math.factorial(k) for k in range(22)]
    # NB(mu=8, theta=2): p = theta/(theta+mu) = 0.2
    nb8 = [math.exp(math.lgamma(k + 2) - math.lgamma(2) - math.lgamma(k + 1) + 2 * math.log(0.2) + k * math.log(0.8)) for k in range(22)]
    c.polyline([(x2 + k * 13.5, y2 - (pr / 0.16) * ph) for k, pr in enumerate(pois8)], stroke=BLUE, sw=2.2)
    c.polyline([(x2 + k * 13.5, y2 - (pr / 0.16) * ph) for k, pr in enumerate(nb8)], stroke=AMBER, sw=2.4)
    c.text(x2 + 120, 268, "NB (wide tail, Var=μ+μ²/θ)", size=9.5, weight="700", fill=AMBER)
    c.text(x2 + 120, 284, "Poisson (too narrow!)", size=9.5, weight="700", fill=BLUE_DK)

    # 4. Normal (mu +- 1, 2, 3 sigma)
    c.panel_box(390, 226, 346, 144, "Normal(μ, σ²) · Sums of many small effects", header_fill=ROSE_DK)
    x3, y3 = 418, 348
    c.line(x3, y3, x3 + pw, y3, stroke=SOFT, sw=1.2)
    # Shade ±1 SD (68%)
    pts1 = [(x3 + ((z + 3.5) / 7) * pw, y3 - (normal_pdf(z) / 0.42) * ph) for z in [-1.0 + 2.0 * k / 20 for k in range(21)]]
    c.polygon([(pts1[0][0], y3), *pts1, (pts1[-1][0], y3)], fill=ROSE_BG, stroke="none")
    pts_n = [(x3 + ((z + 3.5) / 7) * pw, y3 - (normal_pdf(z) / 0.42) * ph) for z in [-3.5 + 7.0 * k / 70 for k in range(71)]]
    c.polyline(pts_n, stroke=ROSE, sw=2.4)
    c.text(x3 + pw / 2, y3 - 26, "68% (±1σ)", size=9.5, weight="700", fill=ROSE_DK, anchor="middle")
    c.text(x3 + pw / 2, y3 - ph + 10, "95% within ±1.96σ", size=9.5, fill=SOFT, anchor="middle")
    c.save(out / "fig-S2-distributions.svg")


def fig_S3(out: Path):
    c = Canvas(760, 360, "Standard error shrinks as σ / √n, and what a 95% confidence interval means",
               "Across repeated random samples, ~95% of computed intervals cover the fixed true parameter μ (the interval is random, not μ)")
    # Left: Population SD vs Sampling SE (n=25 -> 5x narrower)
    c.panel_box(24, 72, 344, 268, "Population (SD = σ) vs. Sample mean (SE = σ/√n)")
    x0, y0, pw, ph = 52, 286, 290, 166
    c.axes(x0, y0, pw, ph, xlabel="Value", ylabel="Density")
    pop_pts = [(x0 + ((z + 3.5) / 7) * pw, y0 - (normal_pdf(z, 0, 1.0) / 1.2) * ph) for z in [-3.5 + 7.0 * k / 80 for k in range(81)]]
    se_pts = [(x0 + ((z + 3.5) / 7) * pw, y0 - (normal_pdf(z, 0, 0.35) / 1.2) * ph) for z in [-3.5 + 7.0 * k / 80 for k in range(81)]]
    c.polyline(pop_pts, stroke=FAINT, sw=2.2)
    c.polyline(se_pts, stroke=TEAL, sw=2.6)
    c.text(x0 + 216, y0 - 0.28 * ph, "Population (σ)", size=9.8, weight="700", fill=FAINT)
    c.text(x0 + 178, y0 - 0.86 * ph, "Sample mean x̄ (SE = σ/√n)", size=9.8, weight="700", fill=TEAL_DK)

    # Right: 16 repeated 95% CIs (15 hit true mu, 1 misses in rose!)
    c.panel_box(388, 72, 348, 268, "16 repeated 95% confidence intervals around true μ")
    true_x = 562
    c.line(true_x, 102, true_x, 314, stroke=INK, sw=1.8, dash="4,3")
    c.text(true_x, 330, "True μ (fixed)", size=10, weight="700", fill=INK, anchor="middle")
    offsets = [-18, 12, -8, 24, -30, 6, 46, -14, 18, -22, 8, -4, 28, -16, 10, -26]
    half_w = 34
    for i, dx in enumerate(offsets):
        yy = 112 + i * 12.8
        cx = true_x + dx
        misses = abs(dx) > half_w
        col = ROSE if misses else TEAL
        c.line(cx - half_w, yy, cx + half_w, yy, stroke=col, sw=2.2)
        c.circle(cx, yy, 2.8, fill=col)
        if misses:
            c.text(cx + half_w + 6, yy + 3.5, "miss!", size=9, weight="700", fill=ROSE_DK)
    c.save(out / "fig-S3-sampling-ci.svg")


def fig_S4(out: Path):
    c = Canvas(760, 355, "Hypothesis testing geometry: Type I error (α), Type II error (β), and power (1 − β)",
               "Statistical power rises with effect size and sample size; a p-value is P(data this extreme | H₀), never P(H₀ | data)")
    x0, y0, pw, ph = 64, 280, 444, 188
    c.axes(x0, y0, pw, ph, xlabel="Test statistic (z)", ylabel="Density",
           xticks=[(0.28, "H₀ (0)"), (0.58, "z_crit"), (0.72, "H₁ (δ)")])

    def gx(z): return x0 + ((z + 3.2) / 9.2) * pw
    def gy(val): return y0 - (val / 0.44) * ph

    z_crit = 1.96
    mu1 = 2.8
    # Shade alpha (H0 right of z_crit)
    a_pts = [(gx(z_crit), y0)] + [(gx(z), gy(normal_pdf(z, 0, 1))) for z in [z_crit + 2.8 * k / 30 for k in range(31)]] + [(gx(z_crit + 2.8), y0)]
    c.polygon(a_pts, fill=ROSE_BG, stroke="none")
    # Shade beta (H1 left of z_crit)
    b_pts = [(gx(-1.0), y0)] + [(gx(z), gy(normal_pdf(z, mu1, 1))) for z in [-1.0 + (z_crit + 1.0) * k / 30 for k in range(31)]] + [(gx(z_crit), y0)]
    c.polygon(b_pts, fill=AMBER_BG, stroke="none", opacity=0.7)
    # Shade power (H1 right of z_crit)
    p_pts = [(gx(z_crit), y0)] + [(gx(z), gy(normal_pdf(z, mu1, 1))) for z in [z_crit + 4.0 * k / 40 for k in range(41)]] + [(gx(z_crit + 4.0), y0)]
    c.polygon(p_pts, fill=TEAL_BG, stroke="none", opacity=0.65)

    h0 = [(gx(z), gy(normal_pdf(z, 0, 1))) for z in [-3.2 + 9.2 * k / 100 for k in range(101)]]
    h1 = [(gx(z), gy(normal_pdf(z, mu1, 1))) for z in [-3.2 + 9.2 * k / 100 for k in range(101)]]
    c.polyline(h0, stroke=BLUE, sw=2.4)
    c.polyline(h1, stroke=TEAL, sw=2.4)
    c.line(gx(z_crit), y0 - ph, gx(z_crit), y0, stroke=ROSE, sw=1.8, dash="4,3")

    c.text(gx(0), gy(0.415), "Null H₀", size=11, weight="700", fill=BLUE_DK, anchor="middle")
    c.text(gx(mu1), gy(0.415), "Alternative H₁", size=11, weight="700", fill=TEAL_DK, anchor="middle")
    c.multiline(gx(3.4), gy(0.16), ["Power", "1 − β"], size=10, weight="700", fill=TEAL_DK, anchor="middle", lh=13)
    c.text(gx(1.3), gy(0.06), "β", size=11, weight="700", fill=AMBER, anchor="middle")
    c.text(gx(2.35), gy(0.03), "α", size=11, weight="700", fill=ROSE_DK, anchor="middle")

    c.panel_box(528, 82, 208, 224, "Four moving parts")
    c.multiline(542, 118, [
        "• α (Type I): false positive",
        "  rate under H₀ (e.g. 0.05)",
        "",
        "• β (Type II): false negative",
        "  rate under true effect H₁",
        "",
        "• Power = 1 − β: probability",
        "  of detecting a real effect",
        "",
        "• Underpowered studies miss",
        "  real hits AND inflate effects!",
    ], size=9.8, lh=15.5, fill=SOFT)
    c.save(out / "fig-S4-hypothesis-errors.svg")


def fig_S5(out: Path):
    c = Canvas(760, 355, "Linear regression as orthogonal variance decomposition (SST = SSR + SSE)",
               "OLS minimizes squared vertical residuals; R² is the fraction of total Y-variance explained by the linear fit")
    x0, y0, pw, ph = 74, 282, 384, 190
    c.axes(x0, y0, pw, ph, xlabel="Predictor X (e.g., allele dosage or mid-parent value)", ylabel="Outcome Y")

    pts = [(0.12, 0.22), (0.20, 0.34), (0.31, 0.30), (0.40, 0.50), (0.48, 0.44),
           (0.58, 0.62), (0.68, 0.58), (0.76, 0.84), (0.84, 0.72), (0.92, 0.86)]
    # Mean y line
    ybar = sum(p[1] for p in pts) / len(pts)
    c.line(x0, y0 - ybar * ph, x0 + pw, y0 - ybar * ph, stroke=FAINT, sw=1.4, dash="4,3")
    c.text(x0 + 8, y0 - ybar * ph - 6, "ȳ (mean)", size=9.5, fill=FAINT)
    # Regression line y = 0.14 + 0.76 x
    c.line(x0 + 0.05 * pw, y0 - (0.14 + 0.76 * 0.05) * ph, x0 + 0.96 * pw, y0 - (0.14 + 0.76 * 0.96) * ph, stroke=TEAL, sw=2.6)
    for px, py in pts:
        yhat = 0.14 + 0.76 * px
        sx = x0 + px * pw
        c.line(sx, y0 - py * ph, sx, y0 - yhat * ph, stroke=ROSE, sw=1.4)
        c.circle(sx, y0 - py * ph, 4.2, fill=BLUE)
    # Highlight one point decomposition (0.76, 0.84)
    hx = x0 + 0.76 * pw
    hy = y0 - 0.84 * ph
    hyhat = y0 - (0.14 + 0.76 * 0.76) * ph
    hybar = y0 - ybar * ph
    c.line(hx + 6, hyhat, hx + 6, hybar, stroke=TEAL, sw=2.6)
    c.text(hx + 12, (hyhat + hybar) / 2 + 4, "ŷ − ȳ", size=9.5, weight="700", fill=TEAL_DK)
    c.text(hx + 10, (hy + hyhat) / 2 + 4, "y − ŷ", size=9.5, weight="700", fill=ROSE_DK)

    c.panel_box(482, 82, 254, 224, "Pythagorean identity of variance")
    c.rect(496, 114, 226, 36, fill=TEAL_BG, stroke=TEAL, rx=6)
    c.text(609, 136, "Σ(y−ȳ)² = Σ(ŷ−ȳ)² + Σ(y−ŷ)²", size=10.5, weight="700", fill=TEAL_DK, anchor="middle", mono=True)
    c.multiline(498, 174, [
        "R² = Explained / Total = r²",
        "",
        "Slope β̂ = Cov(X, Y) / Var(X)",
        "",
        "Warning: r measures ONLY linear",
        "association — always plot the",
        "residuals before trusting r!",
    ], size=10, lh=16, fill=SOFT)
    c.save(out / "fig-S5-variance-regression.svg")


def fig_S6(out: Path):
    c = Canvas(760, 360, "Log-likelihood maximization (MLE) and Bayesian prior → posterior updating",
               "The MLE sits at the peak of ℓ(p) with precision set by curvature; Bayes multiplies prior × likelihood into a posterior")
    # Left: Binomial log-likelihood curve (k=14 of n=20 -> p_hat=0.70)
    c.panel_box(24, 72, 344, 268, "Log-likelihood ℓ(p) for k = 14 / 20 successes")
    x0, y0, pw, ph = 68, 286, 276, 166
    c.axes(x0, y0, pw, ph, xlabel="Parameter p", ylabel="ℓ(p) − ℓ(p̂)",
           xticks=[(0, "0.2"), (0.375, "0.5"), (0.625, "0.7"), (1, "1.0")],
           yticks=[(0, "-10"), (0.5, "-5"), (1, "0")])
    k_obs, n_obs = 14, 20
    lmax = k_obs * math.log(0.7) + (n_obs - k_obs) * math.log(0.3)
    pts = []
    for i in range(81):
        p = 0.20 + 0.78 * i / 80
        ll = k_obs * math.log(p) + (n_obs - k_obs) * math.log(1 - p) - lmax
        if ll >= -10:
            pts.append((x0 + ((p - 0.2) / 0.8) * pw, y0 - ((ll + 10) / 10) * ph))
    c.polyline(pts, stroke=TEAL, sw=2.6)
    px_hat = x0 + ((0.7 - 0.2) / 0.8) * pw
    c.circle(px_hat, y0 - ph, 4.5, fill=ROSE)
    c.text(px_hat, y0 - ph + 16, "MLE p̂ = 0.70", size=9.8, weight="700", fill=ROSE_DK, anchor="middle")
    # 2-log-likelihood CI drop line (-1.92)
    ci_y = y0 - ((10 - 1.92) / 10) * ph
    c.line(x0, ci_y, x0 + pw, ci_y, stroke=AMBER, sw=1.3, dash="4,3")
    c.text(x0 + 6, ci_y - 5, "−1.92 (95% LRT CI)", size=9, weight="700", fill=AMBER)

    # Right: Bayesian Prior -> Likelihood -> Posterior
    c.panel_box(392, 72, 344, 268, "Bayesian update: Prior × Likelihood → Posterior")
    bx0, by0, bpw, bph = 434, 286, 278, 166
    c.axes(bx0, by0, bpw, bph, xlabel="Allele frequency p", ylabel="Density",
           xticks=[(0, "0.0"), (0.5, "0.5"), (1, "1.0")])
    # Prior Beta(4, 4) centered at 0.5, Likelihood peaked at 0.75, Posterior Beta(18, 10) peaked at 0.65
    def beta_pdf(p, a, b):
        return (p ** (a - 1)) * ((1 - p) ** (b - 1)) / (math.gamma(a) * math.gamma(b) / math.gamma(a + b))
    for a, b, col, lbl, lx, ly in [(4, 4, FAINT, "Prior Beta(4,4)", 0.24, 0.44),
                                    (15, 6, BLUE, "Likelihood (14/20)", 0.84, 0.78),
                                    (18, 10, PURPLE, "Posterior Beta(18,10)", 0.62, 0.96)]:
        pts_b = [(bx0 + (i / 80) * bpw, by0 - min(1.0, beta_pdf(max(0.01, min(0.99, i / 80)), a, b) / 5.2) * bph) for i in range(1, 80)]
        c.polyline(pts_b, stroke=col, sw=2.4)
        c.text(bx0 + lx * bpw, by0 - ly * bph, lbl, size=9.2, weight="700", fill=col, anchor="middle")
    c.save(out / "fig-S6-likelihood-bayes.svg")


def fig_S7(out: Path):
    c = Canvas(760, 360, "High-dimensional genomics: Benjamini–Hochberg FDR and geometric PCA",
               "BH controls expected false discovery proportion across thousands of genes; PCA rotates onto orthogonal maximum-variance axes")
    # Left: Benjamini-Hochberg step-up line vs Bonferroni
    c.panel_box(24, 72, 344, 268, "Benjamini–Hochberg (FDR q = 0.10) vs. Bonferroni")
    x0, y0, pw, ph = 68, 286, 278, 166
    c.axes(x0, y0, pw, ph, xlabel="Sorted rank i (out of m = 20 tests)", ylabel="p-value",
           xticks=[(0, "1"), (0.5, "10"), (1, "20")], yticks=[(0, "0"), (0.5, "0.05"), (1, "0.10")])
    # BH diagonal p <= (i/m)*q
    c.line(x0, y0, x0 + pw, y0 - ph, stroke=TEAL, sw=2.0, dash="5,3")
    c.text(x0 + pw - 6, y0 - ph + 14, "BH line (i/m)·q", size=9.2, weight="700", fill=TEAL_DK, anchor="end")
    # Bonferroni line 0.05/20 = 0.0025
    by = y0 - (0.0025 / 0.10) * ph
    c.line(x0, by, x0 + pw, by, stroke=ROSE, sw=1.4, dash="3,3")
    c.text(x0 + pw - 6, by - 5, "Bonferroni (α/m)", size=9, weight="700", fill=ROSE_DK, anchor="end")
    # Sorted p-values (first 6 below BH line!)
    pvals = [0.001, 0.002, 0.008, 0.014, 0.021, 0.028, 0.044, 0.052, 0.061, 0.072, 0.083, 0.095]
    for i, pv in enumerate(pvals, 1):
        px = x0 + ((i - 1) / 19.0) * pw
        py = y0 - min(1.0, pv / 0.10) * ph
        hit = i <= 6
        c.circle(px, py, 3.8, fill=TEAL if hit else FAINT)
    c.multiline(x0 + 82, y0 - 0.58 * ph, ["6 BH discoveries", "(only 2 pass Bonf.)"], size=9.2, weight="700", fill=TEAL_DK, lh=12)

    # Right: Geometric PCA ellipse showing PC1 & PC2
    c.panel_box(392, 72, 344, 268, "PCA: rotating correlated axes onto orthogonal PC1 & PC2")
    cx, cy = 564, 212
    c.line(430, cy, 700, cy, stroke=RULE, sw=1.2)
    c.line(cx, 114, cx, 310, stroke=RULE, sw=1.2)
    # Tilted point cloud (30 deg)
    ang = math.radians(28)
    ca, sa = math.cos(ang), math.sin(ang)
    pts_pca = [(-78, -8), (-62, 12), (-46, -14), (-32, 6), (-18, -10), (-4, 14),
               (12, -12), (26, 8), (42, -6), (56, 12), (72, -8), (84, 4), (-22, 18), (34, -18)]
    for u, v in pts_pca:
        rx = cx + u * ca - v * sa
        ry = cy - (u * sa + v * ca)
        c.circle(rx, ry, 3.8, fill=BLUE, opacity=0.75)
    # PC1 and PC2 orthogonal arrows
    c.arrow(cx - 92 * ca, cy + 92 * sa, cx + 104 * ca, cy - 104 * sa, color="teal", sw=2.4)
    c.arrow(cx + 42 * sa, cy + 42 * ca, cx - 50 * sa, cy - 50 * ca, color="amber", sw=2.2)
    c.text(cx + 100 * ca, cy - 100 * sa - 8, "PC1 (max variance)", size=9.8, weight="700", fill=TEAL_DK, anchor="middle")
    c.text(cx - 56 * sa, cy - 56 * ca - 4, "PC2 ⊥ PC1", size=9.8, weight="700", fill=AMBER, anchor="end")
    c.text(564, 326, "PC1 captures ancestry in GWAS or cell type in scRNA-seq.", size=9.5, fill=SOFT, anchor="middle")
    c.save(out / "fig-S7-multiple-testing-pca.svg")


def build_all(out: Path):
    for fn in [fig_51, fig_52, fig_53, fig_54, fig_55, fig_56, fig_57, fig_58,
               fig_D1, fig_D2, fig_D3, fig_D4, fig_D5,
               fig_S1, fig_S2, fig_S3, fig_S4, fig_S5, fig_S6, fig_S7]:
        fn(out)
    print("Generated 20 SVGs for Parts 11–12, D (SCA12), and S (Statistics)")


if __name__ == "__main__":
    build_all(Path(__file__).resolve().parents[2] / "figures")
