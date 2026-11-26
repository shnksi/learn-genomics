"""Generate 10 precision SVG diagrams for Parts 6, 7, and 8 (Chapters 30–38)."""
from __future__ import annotations

import math
from pathlib import Path
from svg_kit import (
    AMBER, AMBER_BG, BG, BLUE, BLUE_BG, BLUE_DK, DNA, DNA_BG, EMERALD, FAINT,
    GOLD, GREEN, GREEN_BG, INK, PANEL, PURPLE, PURPLE_BG, ROSE, ROSE_BG,
    ROSE_DK, RULE, RULE_LT, SOFT, SUNK, TEAL, TEAL_BG, TEAL_DK, Canvas, normal_pdf,
)


def fig_30(out: Path):
    c = Canvas(760, 360, "Fisher's synthesis: discrete Mendelian loci add up to a Gaussian trait",
               "With even 6–10 additive loci plus environmental noise, discrete allele counts become indistinguishable from a bell curve")
    # Three mini bar histograms: 1 locus, 3 loci, 10 loci + smooth Gaussian
    panels = [
        (24, "1 locus (3 classes)", 2, TEAL),
        (268, "3 loci (7 classes)", 6, BLUE),
        (512, "10 loci + E (continuous)", 20, PURPLE),
    ]
    for px, title, n_trials, col in panels:
        c.panel_box(px, 72, 224, 184, title, header_fill=col)
        x0, y0, pw, ph = px + 20, 232, 184, 118
        c.line(x0, y0, x0 + pw, y0, stroke=SOFT, sw=1.2)
        probs = [math.comb(n_trials, k) * (0.5 ** n_trials) for k in range(n_trials + 1)]
        pmax = max(probs)
        bw = pw / len(probs)
        for k, pr in enumerate(probs):
            bh = (pr / pmax) * (ph - 10)
            c.rect(x0 + k * bw + 1.5, y0 - bh, max(2, bw - 3), bh, fill=col, opacity=0.78, rx=2)
        if n_trials == 20:
            pts = []
            for s in range(60):
                z = -3.2 + 6.4 * s / 59
                yv = normal_pdf(z, 0, 1) / normal_pdf(0, 0, 1)
                pts.append((x0 + (s / 59) * pw, y0 - yv * (ph - 8)))
            c.polyline(pts, stroke=ROSE, sw=2.2)

    # Bottom variance decomposition bar V_P = V_A + V_D + V_E
    c.text(24, 282, "Phenotypic variance decomposition (V_P = V_A + V_D + V_I + V_E):", size=11, weight="700", fill=INK)
    segs = [("V_A (Additive — breeds true)", 0.42, TEAL), ("V_D (Dominance)", 0.14, BLUE),
            ("V_I (Epistasis)", 0.06, PURPLE), ("V_E (Environment & measurement)", 0.38, AMBER)]
    sx = 24
    for lbl, frac, col in segs:
        sw = 712 * frac
        c.rect(sx, 294, sw - 2, 30, fill=col, rx=5)
        if sw > 95:
            c.text(sx + sw / 2, 313, lbl, size=9.8, weight="700", fill="#ffffff", anchor="middle")
        sx += sw
    c.text(380, 344, "Broad-sense H² = V_G / V_P  ·  Narrow-sense h² = V_A / V_P (only V_A predicts parent–offspring resemblance)", size=10, fill=SOFT, anchor="middle")
    c.save(out / "fig-30-quantitative-traits.svg")


def fig_31(out: Path):
    c = Canvas(760, 360, "The breeder's equation (R = h² S) and why h² is NOT about group differences",
               "Selection differential S measures which parents reproduce; response R is damped by narrow-sense heritability h²")
    # Left: Breeder's equation shift
    c.panel_box(24, 72, 412, 268, "Selection response: R = h² · S  (illustrated with h² = 0.5)")
    x0, y0, pw, ph = 56, 284, 356, 168
    c.axes(x0, y0, pw, ph, xlabel="Trait value", ylabel="Density")
    # Parental bell curve (mu=0)
    par_pts = [(x0 + ((z + 3.5) / 7.5) * pw, y0 - (normal_pdf(z, 0, 1) / 0.42) * ph) for z in [(-3.5 + 7.5 * k / 90) for k in range(91)]]
    # Shaded selected tail (z >= 1.0)
    tail = [(x0 + ((1.0 + 3.5) / 7.5) * pw, y0)]
    for k in range(35):
        z = 1.0 + 3.0 * k / 34
        tail.append((x0 + ((z + 3.5) / 7.5) * pw, y0 - (normal_pdf(z, 0, 1) / 0.42) * ph))
    tail.append((x0 + pw, y0))
    c.polygon(tail, fill=AMBER_BG, stroke="none")
    c.polyline(par_pts, stroke=SOFT, sw=2.2)
    # Offspring shifted curve (mu = 0.75)
    off_pts = [(x0 + ((z + 3.5) / 7.5) * pw, y0 - (normal_pdf(z, 0.75, 1) / 0.42) * ph) for z in [(-3.5 + 7.5 * k / 90) for k in range(91)]]
    c.polyline(off_pts, stroke=TEAL, sw=2.5)
    mx0 = x0 + (3.5 / 7.5) * pw
    mx_off = x0 + (4.25 / 7.5) * pw
    mx_sel = x0 + (5.0 / 7.5) * pw
    c.line(mx0, y0 - ph, mx0, y0, stroke=SOFT, sw=1.2, dash="3,3")
    c.line(mx_off, y0 - ph + 16, mx_off, y0, stroke=TEAL, sw=1.5, dash="3,3")
    c.line(mx_sel, y0 - 70, mx_sel, y0, stroke=AMBER, sw=1.5, dash="3,3")
    c.arrow(mx0, y0 - ph + 28, mx_off - 2, y0 - ph + 28, color="teal", sw=2)
    c.text((mx0 + mx_off) / 2, y0 - ph + 22, "R", size=10.5, weight="700", fill=TEAL_DK, anchor="middle")
    c.arrow(mx0, y0 - 46, mx_sel - 2, y0 - 46, color="amber", sw=2)
    c.text((mx0 + mx_sel) / 2, y0 - 52, "S (selected)", size=9.5, weight="700", fill=AMBER, anchor="middle")

    # Right: Lewontin's seed-pot analogy
    c.panel_box(454, 72, 282, 268, "Why h² = 1 within groups ≠ genetic gap between")
    c.box(470, 108, 118, 92, "Rich soil pot", ["Identical seed mix", "Within-pot h² ≈ 1.0", "Mean height = 18 cm"], fill=GREEN_BG, stroke=GREEN, title_fill=GREEN, body_size=9.5)
    c.box(602, 108, 118, 92, "Poor soil pot", ["Identical seed mix", "Within-pot h² ≈ 1.0", "Mean height = 9 cm"], fill=AMBER_BG, stroke=AMBER, title_fill=AMBER, body_size=9.5)
    c.multiline(595, 228, [
        "100% of variation WITHIN each pot is",
        "genetic (same soil for all seeds),",
        "yet 100% of the difference BETWEEN",
        "pots is purely environmental!",
        "",
        "h² is a property of one population",
        "in one environment — never an individual.",
    ], size=10, lh=15, fill=SOFT, anchor="middle")
    c.save(out / "fig-31-heritability-selection.svg")


def fig_32(out: Path):
    c = Canvas(760, 355, "QTL interval mapping: scanning a chromosome for LOD peaks",
               "LOD = log₁₀ [ L(QTL at position x) / L(no QTL) ]; the 1.5-LOD drop defines an approximate 95% confidence interval")
    x0, y0, pw, ph = 78, 250, 628, 164
    c.axes(x0, y0, pw, ph, xlabel="Genetic map position along chromosome (cM)", ylabel="LOD score",
           xticks=[(0, "0"), (0.25, "30"), (0.5, "60"), (0.75, "90"), (1, "120")],
           yticks=[(0, "0"), (0.33, "3"), (0.67, "6"), (1, "9")])

    # Permutation significance threshold (LOD = 3.2)
    thr_y = y0 - (3.2 / 9.0) * ph
    c.line(x0, thr_y, x0 + pw, thr_y, stroke=ROSE, sw=1.5, dash="5,3")
    c.text(x0 + pw - 6, thr_y - 6, "Permutation threshold (α = 0.05, LOD = 3.2)", size=9.8, weight="700", fill=ROSE_DK, anchor="end")

    # LOD curve peaking at 66 cM (LOD = 7.8)
    pts = []
    for k in range(121):
        cm = float(k)
        lod = 0.4 + 7.4 * math.exp(-0.5 * ((cm - 66.0) / 11.5) ** 2) + 0.35 * math.sin(cm / 9.0) ** 2
        pts.append((x0 + (cm / 120.0) * pw, y0 - (lod / 9.0) * ph))
    c.polyline(pts, stroke=TEAL, sw=2.8)

    # 1.5-LOD drop band around peak (LOD 6.3 -> ~58..74 cM)
    ci_l = x0 + (58 / 120.0) * pw
    ci_r = x0 + (74 / 120.0) * pw
    ci_y = y0 - (6.3 / 9.0) * ph
    c.rect(ci_l, y0 - ph, ci_r - ci_l, ph, fill=TEAL_BG, stroke="none", opacity=0.45)
    c.line(ci_l, ci_y, ci_r, ci_y, stroke=AMBER, sw=2.2)
    c.text((ci_l + ci_r) / 2, ci_y - 8, "1.5-LOD CI (~16 cM)", size=9.8, weight="700", fill=AMBER, anchor="middle")

    # Marker ticks on chromosome bar below
    c.text(24, 314, "Markers:", size=10, weight="700", fill=SOFT)
    c.line(x0, 310, x0 + pw, 310, stroke=INK, sw=3)
    for m_cm in [5, 20, 38, 52, 68, 84, 102, 116]:
        mx = x0 + (m_cm / 120.0) * pw
        c.line(mx, 303, mx, 317, stroke=BLUE, sw=2.2)
    c.text(380, 338, "Experimental cross gives high power (50% allele freq) but broad ~10–20 cM intervals (hundreds of candidate genes).", size=10, fill=SOFT, anchor="middle")
    c.save(out / "fig-32-qtl-mapping.svg")


def fig_33(out: Path):
    c = Canvas(760, 360, "Neutral theory cancellation and molecular tests of selection (dN / dS)",
               "Under neutrality, population size cancels out of the substitution rate (k = 2Nμ × 1/2N = μ), powering the molecular clock")
    # Top: Neutral cancellation formula card
    c.rect(24, 72, 712, 64, fill=TEAL_BG, stroke=TEAL, sw=1.5, rx=10)
    c.text(380, 96, "Substitution rate   k  =  (2 N μ new mutations/gen)  ×  (1 / 2N fixation prob)  =  μ", size=12.5, weight="700", fill=TEAL_DK, anchor="middle", mono=True)
    c.text(380, 120, "Population size N cancels exactly for strictly neutral mutations — divergence ticks at the mutation rate μ.", size=10.5, fill=SOFT, anchor="middle")

    # Bottom: dN/dS (omega) regimes
    regimes = [
        (24, "Purifying selection", "ω = dN / dS  <  1", TEAL, TEAL_BG, [
            "Non-synonymous changes hurt",
            "function and are purged.",
            "Typical protein core: ω ≈ 0.05–0.2",
            "(Most of every proteome!)",
        ]),
        (268, "Neutral evolution", "ω = dN / dS  ≈  1", BLUE, BLUE_BG, [
            "Amino-acid changes have zero",
            "fitness effect; fix at same rate",
            "as synonymous sites.",
            "Example: pseudogenes, introns",
        ]),
        (512, "Positive / adaptive", "ω = dN / dS  >  1", ROSE, ROSE_BG, [
            "Amino-acid replacements favored",
            "and driven rapidly to fixation.",
            "Example: viral surface epitopes,",
            "immune MHC, host–pathogen arms",
        ]),
    ]
    for x, t, eq, col, bg, lines in regimes:
        c.rect(x, 156, 224, 184, fill=bg, stroke=col, sw=1.5, rx=10)
        c.text(x + 112, 180, t, size=12, weight="700", fill=col, anchor="middle")
        c.pill(x + 34, 190, 156, 24, eq, fill="#ffffff", stroke=col, text_fill=col, size=10.5, mono=True)
        c.multiline(x + 112, 238, lines, size=10.2, lh=17, fill=INK, anchor="middle")
    c.save(out / "fig-33-neutral-theory.svg")


def fig_34(out: Path):
    c = Canvas(760, 365, "Phylogenetic tree anatomy and the ortholog vs. paralog trap",
               "Orthologs diverge by speciation (often keep function); paralogs diverge by gene duplication (often specialize or diverge)")
    # Left: Cladogram anatomy (monophyletic vs paraphyletic)
    c.panel_box(24, 72, 344, 272, "Rooted tree anatomy & clades")
    # Tree lines
    c.line(54, 236, 98, 236, stroke=INK, sw=2.4)  # root
    c.line(98, 134, 98, 304, stroke=INK, sw=2.2)
    c.line(98, 304, 318, 304, stroke=INK, sw=2.2)  # Outgroup D
    c.line(98, 134, 168, 134, stroke=INK, sw=2.2)
    c.line(168, 108, 168, 220, stroke=INK, sw=2.2)
    c.line(168, 220, 318, 220, stroke=INK, sw=2.2)  # C
    c.line(168, 108, 238, 108, stroke=INK, sw=2.2)
    c.line(238, 108, 238, 168, stroke=INK, sw=2.2)
    c.line(238, 108, 318, 108, stroke=TEAL, sw=2.6)  # A
    c.line(238, 168, 318, 168, stroke=TEAL, sw=2.6)  # B
    # Monophyletic box around A+B
    c.rect(226, 92, 128, 92, fill=TEAL_BG, stroke=TEAL, sw=1.4, dash="4,3", rx=8, opacity=0.45)
    c.text(326, 112, "Taxon A", size=10.5, weight="700", fill=TEAL_DK)
    c.text(326, 172, "Taxon B", size=10.5, weight="700", fill=TEAL_DK)
    c.text(326, 224, "Taxon C", size=10.5, weight="700", fill=INK)
    c.text(326, 308, "Outgroup", size=10.5, weight="700", fill=FAINT)
    c.circle(98, 236, 4.5, fill=ROSE)
    c.text(54, 224, "Root", size=9.5, weight="700", fill=ROSE_DK)
    c.circle(238, 138, 4.5, fill=TEAL)
    c.text(288, 142, "Clade (A,B)", size=9.5, weight="700", fill=TEAL_DK, anchor="middle")
    c.text(196, 330, "Horizontal length = substitutions/site (not tip order!)", size=9.5, fill=SOFT, anchor="middle")

    # Right: Gene tree inside speciation (Orthologs vs Paralogs)
    c.panel_box(388, 72, 348, 272, "Gene duplication creates paralogs vs. orthologs")
    # Duplication node -> two branches (alpha, beta), then each speciates (Human, Mouse)
    c.line(412, 204, 464, 204, stroke=INK, sw=2.4)
    c.rect(456, 196, 16, 16, fill=ROSE, stroke="#ffffff", sw=1.5, rx=2)
    c.text(464, 186, "Duplication", size=9.5, weight="700", fill=ROSE_DK, anchor="middle")
    # Upper copy (α)
    c.line(464, 196, 464, 134, stroke=TEAL, sw=2.2)
    c.line(464, 134, 548, 134, stroke=TEAL, sw=2.2)
    c.circle(548, 134, 6, fill=BLUE)
    c.line(548, 108, 548, 160, stroke=TEAL, sw=2.2)
    c.line(548, 108, 636, 108, stroke=TEAL, sw=2.2)
    c.line(548, 160, 636, 160, stroke=TEAL, sw=2.2)
    c.text(644, 112, "Human α", size=10.5, weight="700", fill=TEAL_DK)
    c.text(644, 164, "Mouse α", size=10.5, weight="700", fill=TEAL_DK)
    # Lower copy (β)
    c.line(464, 212, 464, 268, stroke=AMBER, sw=2.2)
    c.line(464, 268, 548, 268, stroke=AMBER, sw=2.2)
    c.circle(548, 268, 6, fill=BLUE)
    c.line(548, 242, 548, 294, stroke=AMBER, sw=2.2)
    c.line(548, 242, 636, 242, stroke=AMBER, sw=2.2)
    c.line(548, 294, 636, 294, stroke=AMBER, sw=2.2)
    c.text(644, 246, "Human β", size=10.5, weight="700", fill=AMBER)
    c.text(644, 298, "Mouse β", size=10.5, weight="700", fill=AMBER)
    c.text(548, 196, "Blue dots = Speciation", size=9.5, weight="700", fill=BLUE_DK, anchor="middle")
    c.text(562, 326, "Human α & Mouse α = Orthologs  |  Human α & β = Paralogs", size=9.5, weight="600", fill=SOFT, anchor="middle")
    c.save(out / "fig-34-phylogenetics.svg")


def fig_35(out: Path):
    c = Canvas(760, 355, "Evolutionary fates of duplicated genes and the K_s duplication clock",
               "Most duplicates rapidly decay into pseudogenes; survivors partition ancestral enhancers (subfunctionalization) or evolve new roles")
    # Left: 3 fates of duplicate pair
    c.panel_box(24, 72, 412, 266, "Three fates after gene duplication (two copies with enhancers E1, E2)")
    fates = [
        (110, "1. Nonfunctionalization (~90%)", FAINT, SUNK, "Copy 2 accumulates LoF mutations → pseudogene (ψ)"),
        (182, "2. Subfunctionalization (DDC)", TEAL, TEAL_BG, "Copy 1 keeps E1 (brain); Copy 2 keeps E2 (heart) → both essential!"),
        (254, "3. Neofunctionalization", PURPLE, PURPLE_BG, "Copy 1 keeps old role; Copy 2 evolves a brand-new function"),
    ]
    for fy, title, col, bg, desc in fates:
        c.rect(40, fy, 380, 58, fill=bg, stroke=col, sw=1.4, rx=8)
        c.text(54, fy + 22, title, size=11, weight="700", fill=col)
        c.text(54, fy + 42, desc, size=10, fill=INK)

    # Right: Ks distribution showing WGD peak
    c.panel_box(454, 72, 282, 266, "Paralog K_s distribution detects WGD")
    x0, y0, pw, ph = 496, 282, 220, 160
    c.axes(x0, y0, pw, ph, xlabel="Synonymous divergence (K_s)", ylabel="Paralog pairs",
           xticks=[(0, "0"), (0.33, "0.5"), (0.67, "1.0"), (1, "1.5")])
    # Exponential small-scale SSD background + Gaussian WGD bump around Ks=0.65
    pts = []
    for k in range(75):
        ks = 1.5 * k / 74
        val = 0.85 * math.exp(-ks * 3.8) + 0.55 * math.exp(-0.5 * ((ks - 0.65) / 0.14) ** 2)
        pts.append((x0 + (ks / 1.5) * pw, y0 - min(1.0, val) * ph))
    c.polyline(pts, stroke=AMBER, sw=2.6)
    c.text(x0 + 0.48 * pw, y0 - 0.68 * ph, "Ancient WGD peak!", size=9.8, weight="700", fill=AMBER, anchor="middle")
    c.text(x0 + 0.18 * pw, y0 - 0.86 * ph, "Recent SSD", size=9, fill=FAINT)
    c.save(out / "fig-35-genome-evolution.svg")


def fig_35a(out: Path):
    c = Canvas(760, 360, "Dobzhansky–Muller incompatibilities and hybrid-zone clines",
               "Reproductive isolation evolves without either lineage ever crossing a fitness valley; cline width measures selection vs. dispersal")
    # Left: 2-locus DM incompatibility diagram
    c.panel_box(24, 72, 344, 268, "Dobzhansky–Muller two-locus incompatibility")
    c.box(134, 108, 124, 44, "Ancestral: aa bb", ["Viable"], fill=SUNK, stroke=RULE, title_size=11)
    c.arrow(160, 154, 114, 194, color="teal", sw=2)
    c.arrow(232, 154, 278, 194, color="blue", sw=2)
    c.box(46, 198, 134, 48, "Lineage 1: AA bb", ["Fix A (viable)"], fill=TEAL_BG, stroke=TEAL, title_fill=TEAL_DK, title_size=11)
    c.box(212, 198, 134, 48, "Lineage 2: aa BB", ["Fix B (viable)"], fill=BLUE_BG, stroke=BLUE, title_fill=BLUE_DK, title_size=11)
    c.arrow(128, 248, 168, 278, color="rose", sw=1.8)
    c.arrow(264, 248, 224, 278, color="rose", sw=1.8)
    c.box(106, 280, 180, 46, "Hybrid: Aa Bb (A + B clash!)", ["Sterile / inviable"], fill=ROSE_BG, stroke=ROSE, title_fill=ROSE_DK, title_size=10.5)

    # Right: Hybrid zone sigmoid cline
    c.panel_box(388, 72, 348, 268, "Geographic hybrid-zone cline: width w ≈ σ / √s")
    x0, y0, pw, ph = 442, 280, 270, 162
    c.axes(x0, y0, pw, ph, xlabel="Geographic transect (km)", ylabel="Allele freq p",
           xticks=[(0, "-100"), (0.5, "0"), (1, "+100")], yticks=[(0, "0"), (0.5, "0.5"), (1, "1")])
    # Sharp cline (strong selection) vs wide cline (weak selection)
    for k_steep, col, lbl, ly in [(0.14, ROSE, "Strong s (narrow w)", 0.78), (0.045, TEAL, "Weak s (wide w)", 0.28)]:
        pts = [(x0 + i / 80 * pw, y0 - (1.0 / (1.0 + math.exp(-k_steep * (i - 40)))) * ph) for i in range(81)]
        c.polyline(pts, stroke=col, sw=2.5)
        c.text(x0 + 0.68 * pw, y0 - ly * ph, lbl, size=9.8, weight="700", fill=col)
    c.save(out / "fig-35a-speciation-cline.svg")


def fig_36(out: Path):
    c = Canvas(760, 360, "PCR thermal cycling and agarose gel electrophoresis",
               "Primers define an addressed DNA interval amplified exponentially (2ⁿ), then separated by length on a log-linear gel")
    # Left: Thermal cycle + exponential growth
    c.panel_box(24, 72, 412, 268, "One PCR thermal cycle (repeat 25–35× → ~10⁹ copies)")
    steps = [
        (44, "1. Denature", "95 °C", ROSE, ROSE_BG, "Melts H-bonds;\nseparates duplex"),
        (178, "2. Anneal", "55–65 °C", BLUE, BLUE_BG, "Forward & reverse\nprimers bind flank"),
        (312, "3. Extend", "72 °C", TEAL, TEAL_BG, "Taq Pol extends\n5′→3′ from primers"),
    ]
    for i, (sx, t, temp, col, bg, d) in enumerate(steps):
        c.rect(sx, 108, 114, 110, fill=bg, stroke=col, sw=1.5, rx=8)
        c.text(sx + 57, 128, t, size=10.5, weight="700", fill=col, anchor="middle")
        c.pill(sx + 24, 136, 66, 20, temp, fill="#ffffff", stroke=col, text_fill=col, size=9.5, mono=True)
        c.multiline(sx + 57, 176, d.split("\n"), size=9.5, lh=14, fill=SOFT, anchor="middle")
        if i < 2:
            c.arrow(sx + 116, 162, sx + 174, 162, color="ink", sw=1.6)
    # Plateau note
    c.rect(44, 236, 382, 86, fill="#ffffff", stroke=RULE, rx=8)
    c.text(60, 258, "Quantitative PCR (qPCR): C_t is the cycle crossing threshold.", size=10.5, weight="700", fill=INK)
    c.multiline(60, 278, [
        "• ΔC_t = 1 cycle lower  ⇒  2× more starting template",
        "• ΔC_t = 3.32 cycles    ⇒  10× more starting template",
        "• End-point gels saturate in plateau — never use them for quantity!",
    ], size=9.8, lh=15, fill=SOFT)

    # Right: Agarose gel schematic
    c.panel_box(454, 72, 282, 268, "Agarose gel (negatively charged DNA → +)")
    c.rect(480, 104, 230, 206, fill="#1e293b", stroke=INK, sw=1.5, rx=8)
    lanes = [(510, "Ladder"), (566, "WT"), (622, "Het"), (678, "Del")]
    for lx, lbl in lanes:
        c.rect(lx - 14, 114, 28, 7, fill="#64748b", rx=1)
        c.text(lx, 326, lbl, size=10, weight="700", fill=INK, anchor="middle")
    # Ladder bands (log spacing)
    for by, bp in [(140, "3kb"), (166, "1kb"), (198, "500"), (236, "250"), (274, "100")]:
        c.rect(496, by, 28, 4, fill="#94a3b8", rx=1)
        c.text(476, by + 4, bp, size=8.5, fill=FAINT, anchor="end", mono=True)
    # Sample bands
    c.rect(552, 196, 28, 5, fill="#34d399", rx=1)  # WT 500bp
    c.rect(608, 196, 28, 5, fill="#34d399", rx=1)  # Het 500bp
    c.rect(608, 240, 28, 5, fill="#fbbf24", rx=1)  # Het 230bp
    c.rect(664, 240, 28, 5, fill="#fbbf24", rx=1)  # Del 230bp
    c.text(718, 126, "−", size=14, weight="700", fill=BLUE_DK)
    c.text(718, 304, "+", size=14, weight="700", fill=ROSE_DK)
    c.save(out / "fig-36-pcr-and-gel.svg")


def fig_37(out: Path):
    c = Canvas(760, 355, "Forward vs. reverse genetic screens and epistasis pathway ordering",
               "Forward screens map phenotype → gene without bias; double-mutant epistasis orders genes in a linear pathway")
    # Top: Forward vs Reverse
    c.box(24, 76, 344, 92, "Forward genetics: Phenotype → Gene", [
        "Mutagenize randomly (EMS / transposon / CRISPR library)",
        "Screen for mutant phenotype → sequence / map causal locus",
        "Discovers completely unexpected pathway members",
    ], fill=TEAL_BG, stroke=TEAL, title_fill=TEAL_DK, body_size=10)
    c.box(392, 76, 344, 92, "Reverse genetics: Gene → Phenotype", [
        "Start with candidate gene sequence from genome / GWAS",
        "Knock out or edit specifically (CRISPR / RNAi / Cre-loxP)",
        "Observe resulting cellular or organismal phenotype",
    ], fill=BLUE_BG, stroke=BLUE, title_fill=BLUE_DK, body_size=10)

    # Bottom: Epistasis ordering rule (Biosynthetic vs Signaling!)
    c.panel_box(24, 188, 712, 150, "Ordering two genes from a double mutant (opposite rules for biosynthesis vs. signaling!)")
    c.box(42, 224, 326, 98, "Biosynthetic pathway (A → B → Product)", [
        "Mutant a⁻ accumulates Intermediate 1;",
        "Mutant b⁻ accumulates Intermediate 2.",
        "Double mutant a⁻ b⁻ looks like a⁻ (UPSTREAM gene",
        "is epistatic — nothing reaches step B!).",
    ], fill=AMBER_BG, stroke=AMBER, title_fill=AMBER, body_size=9.8)
    c.box(392, 224, 326, 98, "Regulatory signaling (A ⊣ B → Output)", [
        "Suppose A represses B, and B turns ON output.",
        "a⁻ gives ALWAYS ON; b⁻ gives ALWAYS OFF.",
        "Double mutant a⁻ b⁻ is ALWAYS OFF (looks like b⁻:",
        "DOWNSTREAM gene is epistatic in signaling!).",
    ], fill=PURPLE_BG, stroke=PURPLE, title_fill=PURPLE, body_size=9.8)
    c.save(out / "fig-37-screens-epistasis.svg")


def fig_38(out: Path):
    c = Canvas(760, 375, "CRISPR-Cas9 genome editing: programmable R-loop and four editing modes",
               "Changing 20 nt of guide RNA redirects Cas9 anywhere next to a PAM; cellular repair pathways determine the edit")
    # Top: Cas9-sgRNA-PAM R-loop diagram
    c.panel_box(24, 72, 712, 134, "Cas9 ribonucleoprotein (RNP) target recognition & cleavage")
    c.ellipse(380, 144, 156, 46, fill=TEAL_BG, stroke=TEAL, sw=1.8, opacity=0.55)
    c.text(266, 114, "Cas9 nuclease", size=10.5, weight="700", fill=TEAL_DK)
    # DNA target duplex opening into R-loop
    c.path("M 66 132 L 246 132 C 276 132, 290 108, 320 108 L 448 108 C 470 108, 480 132, 502 132 L 690 132", stroke=INK, sw=2.6)
    c.path("M 66 164 L 246 164 C 276 164, 290 182, 320 182 L 448 182 C 470 182, 480 164, 502 164 L 690 164", stroke=INK, sw=2.6)
    # PAM highlight
    c.rect(506, 120, 48, 22, fill=AMBER_BG, stroke=AMBER, sw=1.6, rx=4)
    c.text(530, 135, "NGG", size=10, weight="700", fill=AMBER, anchor="middle", mono=True)
    c.text(530, 113, "PAM", size=9.5, weight="700", fill=AMBER, anchor="middle")
    # Guide RNA annealed to bottom strand
    c.path("M 278 148 L 468 148 C 488 148, 496 168, 526 168", stroke=ROSE, sw=3.2)
    c.text(372, 142, "20 nt spacer sgRNA", size=9.8, weight="700", fill=ROSE_DK, anchor="middle")
    # Cut markers 3 bp upstream of PAM
    c.text(460, 122, "✂", size=14, fill=ROSE, anchor="middle")
    c.text(460, 180, "✂", size=14, fill=ROSE, anchor="middle")
    c.text(596, 184, "Blunt DSB 3 bp upstream of PAM", size=9.8, fill=SOFT)

    # Bottom: 4 editing modalities
    modes = [
        (24, "NHEJ Knockout", AMBER, AMBER_BG, ["DSB repaired without", "template → indels &", "frameshift knockout"]),
        (206, "HDR Knock-in", BLUE, BLUE_BG, ["DSB + donor template", "→ precise edit (low", "efficiency in neurons)"]),
        (388, "Base Editing", TEAL, TEAL_BG, ["nCas9 + deaminase", "C→T or A→G with", "NO double-strand break"]),
        (570, "Prime Editing", PURPLE, PURPLE_BG, ["nCas9 + RT + pegRNA", "Any SNV or small indel", "with NO DSB needed"]),
    ]
    for x, t, col, bg, lines in modes:
        c.box(x, 222, 166, 134, t, lines, fill=bg, stroke=col, title_fill=col, body_size=10)
    c.save(out / "fig-38-crispr-editing.svg")


def build_all(out: Path):
    for fn in [fig_30, fig_31, fig_32, fig_33, fig_34, fig_35, fig_35a, fig_36, fig_37, fig_38]:
        fn(out)
    print("Generated 10 SVGs for Parts 6–8 (Ch 30–38)")


if __name__ == "__main__":
    build_all(Path(__file__).resolve().parents[2] / "figures")
