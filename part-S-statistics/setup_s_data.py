#!/usr/bin/env python3
"""Generate synthetic fallback datasets in labs/data/ for Part S (S1-S7).

Part S chapters are scheduled alongside Parts 2, 5 and 6, before the late labs
(lab-02 through lab-09) that produce the real files in ``labs/data/``. Running
this script lets you execute S1-S7 code examples immediately without waiting
for those labs.

Safety guarantee:
    Existing files are NEVER overwritten unless ``--force`` is passed. Once you
    complete a real lab, its outputs take precedence automatically.

Usage:
    python part-S-statistics/setup_s_data.py
    python part-S-statistics/setup_s_data.py --dir /tmp/test-s-data
    python part-S-statistics/setup_s_data.py --force
"""

from __future__ import annotations

import argparse
import gzip
import math
from pathlib import Path
import sys
import numpy as np


SUPERPOPS = [
    ("EUR", ["GBR", "CEU", "TSI"]),
    ("AFR", ["YRI", "LWK", "ESN"]),
    ("EAS", ["CHB", "JPT", "CHS"]),
    ("SAS", ["GIH", "PJL", "BEB"]),
    ("AMR", ["MXL", "PUR", "CLM"]),
]


def _should_write(path: Path, force: bool) -> bool:
    """Return True if path should be created (missing or --force)."""
    if path.exists() and not force:
        return False
    path.parent.mkdir(parents=True, exist_ok=True)
    return True


def _write_text(path: Path, content: str, force: bool, status: dict[str, int]) -> None:
    if not _should_write(path, force):
        status["skipped"] += 1
        return
    path.write_text(content, encoding="utf-8")
    status["created"] += 1


def _benjamini_hochberg(pvals: np.ndarray) -> np.ndarray:
    """Compute Benjamini-Hochberg adjusted p-values (FDR)."""
    n = len(pvals)
    order = np.argsort(pvals)
    ranked = pvals[order]
    adj = ranked * n / np.arange(1, n + 1)
    adj = np.minimum.accumulate(adj[::-1])[::-1]
    adj = np.clip(adj, 0.0, 1.0)
    out = np.empty_like(adj)
    out[order] = adj
    return out


def _generate_population_data(
    out_dir: Path, rng: np.random.Generator, force: bool, status: dict[str, int]
) -> None:
    """Create panel.txt, EUR.ids, keep.txt, chr22_qc.*, chr22_sub.vcf.gz, HWE & PCA."""
    n_per_sp = 100
    n_samples = n_per_sp * len(SUPERPOPS)
    n_snps = 250

    samples: list[tuple[str, str, str, str]] = []
    sp_idx = np.empty(n_samples, dtype=int)
    idx = 0
    for s_i, (sp, pops) in enumerate(SUPERPOPS):
        for j in range(n_per_sp):
            sid = f"HG{idx + 1:05d}"
            pop = pops[j % len(pops)]
            gender = "male" if (j % 2 == 0) else "female"
            samples.append((sid, pop, sp, gender))
            sp_idx[idx] = s_i
            idx += 1

    # Ancestral allele frequencies + Balding-Nichols drift (Fst ~ 0.12)
    p_anc = rng.uniform(0.08, 0.92, size=n_snps)
    fst = 0.12
    a_param = p_anc * (1 - fst) / fst
    b_param = (1 - p_anc) * (1 - fst) / fst
    p_pop = rng.beta(a_param[None, :], b_param[None, :], size=(len(SUPERPOPS), n_snps))
    p_pop = np.clip(p_pop, 0.005, 0.995)

    # Generate correlated LD blocks along chr22 (20,000,000 .. 20,750,000 bp)
    positions = 20_000_000 + np.cumsum(rng.integers(500, 6_000, size=n_snps))
    bases = np.array(["A", "C", "G", "T"])
    ref_idx = rng.integers(0, 4, size=n_snps)
    alt_idx = (ref_idx + rng.integers(1, 4, size=n_snps)) % 4
    refs = bases[ref_idx]
    alts = bases[alt_idx]

    # Sample diploid haplotypes (0 = REF, 1 = ALT) with short-range Markov LD
    hap1 = np.zeros((n_samples, n_snps), dtype=np.int8)
    hap2 = np.zeros((n_samples, n_snps), dtype=np.int8)
    p_mat = p_pop[sp_idx]
    hap1[:, 0] = (rng.random(n_samples) < p_mat[:, 0]).astype(np.int8)
    hap2[:, 0] = (rng.random(n_samples) < p_mat[:, 0]).astype(np.int8)
    for k in range(1, n_snps):
        dist = positions[k] - positions[k - 1]
        stay = math.exp(-dist / 15_000.0) * 0.65
        for hap in (hap1, hap2):
            copy = rng.random(n_samples) < stay
            fresh = (rng.random(n_samples) < p_mat[:, k]).astype(np.int8)
            hap[:, k] = np.where(copy, hap[:, k - 1], fresh)

    # Dosage counting ALT (0/1/2) and REF (2 - alt) as in PLINK2 --export A
    alt_dos = hap1 + hap2
    ref_dos = 2 - alt_dos

    # 1. panel.txt, EUR.ids, keep.txt
    panel_lines = ["sample\tpop\tsuper_pop\tgender"] + [
        f"{s}\t{p}\t{sp}\t{g}" for s, p, sp, g in samples
    ]
    _write_text(out_dir / "panel.txt", "\n".join(panel_lines) + "\n", force, status)
    eur_ids = [s for s, _, sp, _ in samples if sp == "EUR"]
    _write_text(out_dir / "EUR.ids", "\n".join(eur_ids) + "\n", force, status)
    _write_text(
        out_dir / "keep.txt", "\n".join(s for s, _, _, _ in samples) + "\n", force, status
    )

    # 2. chr22_qc.psam
    psam_lines = ["#IID\tSEX"] + [f"{s}\tNA" for s, _, _, _ in samples]
    _write_text(out_dir / "chr22_qc.psam", "\n".join(psam_lines) + "\n", force, status)

    # 3. chr22_qc.pvar and chr22.pvar
    pvar_header = [
        "##FILTER=<ID=PASS,Description=\"All filters passed\">",
        "##contig=<ID=22>",
        "#CHROM\tPOS\tID\tREF\tALT\tQUAL\tFILTER\tINFO",
    ]
    af_all = alt_dos.mean(axis=0) / 2.0
    pvar_rows = [
        f"22\t{positions[k]}\t.\t{refs[k]}\t{alts[k]}\t.\tPASS\tAF={af_all[k]:.5f}"
        for k in range(n_snps)
    ]
    pvar_text = "\n".join(pvar_header + pvar_rows) + "\n"
    _write_text(out_dir / "chr22_qc.pvar", pvar_text, force, status)
    _write_text(out_dir / "chr22.pvar", pvar_text, force, status)

    # 4. chr22_qc.raw (tab-delimited PLINK2 --export A format)
    snp_cols = [f"22:{positions[k]}_{refs[k]}" for k in range(n_snps)]
    raw_lines = ["\t".join(["FID", "IID", "PAT", "MAT", "SEX", "PHENOTYPE", *snp_cols])]
    for i, (sid, _, _, _) in enumerate(samples):
        vals = "\t".join(str(int(v)) for v in ref_dos[i])
        raw_lines.append(f"0\t{sid}\t0\t0\t0\t-9\t{vals}")
    _write_text(out_dir / "chr22_qc.raw", "\n".join(raw_lines) + "\n", force, status)

    # 5. chr22_sub.vcf.gz
    vcf_path = out_dir / "chr22_sub.vcf.gz"
    if _should_write(vcf_path, force):
        with gzip.open(vcf_path, "wt", encoding="utf-8") as gz:
            gz.write("##fileformat=VCFv4.2\n")
            gz.write("##contig=<ID=22>\n")
            gz.write("##FORMAT=<ID=GT,Number=1,Type=String,Description=\"Phased Genotype\">\n")
            gz.write(
                "#CHROM\tPOS\tID\tREF\tALT\tQUAL\tFILTER\tINFO\tFORMAT\t"
                + "\t".join(s for s, _, _, _ in samples)
                + "\n"
            )
            for k in range(n_snps):
                gts = "\t".join(f"{hap1[i, k]}|{hap2[i, k]}" for i in range(n_samples))
                gz.write(
                    f"22\t{positions[k]}\t.\t{refs[k]}\t{alts[k]}\t.\tPASS\t"
                    f"AF={af_all[k]:.5f}\tGT\t{gts}\n"
                )
        status["created"] += 1
    else:
        status["skipped"] += 1

    # 6. chr22_hwe.hardy (Wahlund-effect heterozygote deficit across pooled superpops)
    hardy_lines = [
        "#CHROM\tID\tA1\tAX\tHOM_A1_CT\tHET_A1_CT\tTWO_AX_CT\tO(HET_A1)\tE(HET_A1)\tP"
    ]
    for k in range(n_snps):
        n0 = int(np.sum(alt_dos[:, k] == 0))
        n1 = int(np.sum(alt_dos[:, k] == 1))
        n2 = int(np.sum(alt_dos[:, k] == 2))
        q = (n1 + 2 * n2) / (2 * n_samples)
        o_het = n1 / n_samples
        e_het = 2 * q * (1 - q)
        # Approximate chi-square 1 df p-value using erfc
        if e_het > 1e-6:
            e0 = n_samples * (1 - q) ** 2
            e1 = n_samples * e_het
            e2 = n_samples * q ** 2
            chi2 = (
                ((n0 - e0) ** 2) / max(e0, 1e-9)
                + ((n1 - e1) ** 2) / max(e1, 1e-9)
                + ((n2 - e2) ** 2) / max(e2, 1e-9)
            )
            pval = math.erfc(math.sqrt(chi2 / 2.0))
        else:
            pval = 1.0
        hardy_lines.append(
            f"22\t.\t{refs[k]}\t{alts[k]}\t{n0}\t{n1}\t{n2}\t"
            f"{o_het:.6g}\t{e_het:.6g}\t{max(pval, 1e-300):.6g}"
        )
    _write_text(out_dir / "chr22_hwe.hardy", "\n".join(hardy_lines) + "\n", force, status)

    # 7. chr22_pca.eigenvec (top 10 PCs from standardized genotype matrix)
    x = alt_dos.astype(float)
    mu = x.mean(axis=0)
    sd = x.std(axis=0)
    sd[sd == 0] = 1.0
    z = (x - mu) / sd
    u, _, _ = np.linalg.svd(z, full_matrices=False)
    pcs = u[:, :10]
    pc_header = "\t".join(["#IID"] + [f"PC{i}" for i in range(1, 11)])
    pc_lines = [pc_header] + [
        "\t".join([samples[i][0]] + [f"{pcs[i, j]:.7g}" for j in range(10)])
        for i in range(n_samples)
    ]
    _write_text(out_dir / "chr22_pca.eigenvec", "\n".join(pc_lines) + "\n", force, status)

    # 8. gwas_naive.strat.glm.logistic.hybrid (population-stratified naive GWAS)
    # Phenotype enriched in AFR/EAS to create genuine genomic inflation (lambda_GC > 1)
    prob_case = np.where(np.isin(sp_idx, [1, 2]), 0.68, 0.32)
    y = (rng.random(n_samples) < prob_case).astype(float)
    gwas_lines = [
        "#CHROM\tPOS\tID\tREF\tALT\tPROVISIONAL_REF?\tA1\tOMITTED\t"
        "A1_FREQ\tFIRTH?\tTEST\tOBS_CT\tOR\tLOG(OR)_SE\tZ_STAT\tP\tERRCODE"
    ]
    y_c = y - y.mean()
    for k in range(n_snps):
        g = alt_dos[:, k].astype(float)
        g_c = g - g.mean()
        denom = float(np.dot(g_c, g_c))
        if denom < 1e-6:
            continue
        # Score-test approximation for logistic regression log-OR
        beta = float(np.dot(g_c, y_c)) / (denom * 0.25)
        se = 1.0 / math.sqrt(denom * 0.25)
        z_stat = beta / se
        pval = max(math.erfc(abs(z_stat) / math.sqrt(2.0)), 1e-300)
        odds_ratio = math.exp(np.clip(beta, -5, 5))
        gwas_lines.append(
            f"22\t{positions[k]}\t.\t{refs[k]}\t{alts[k]}\tN\t{alts[k]}\t{refs[k]}\t"
            f"{af_all[k]:.6g}\tN\tADD\t{n_samples}\t{odds_ratio:.6g}\t{se:.6g}\t"
            f"{z_stat:.6g}\t{pval:.6g}\t."
        )
    _write_text(
        out_dir / "gwas_naive.strat.glm.logistic.hybrid",
        "\n".join(gwas_lines) + "\n",
        force,
        status,
    )


def _generate_rnaseq_data(
    out_dir: Path, rng: np.random.Generator, force: bool, status: dict[str, int]
) -> None:
    """Create yeast_counts.tsv and deseq_results.tsv."""
    n_genes = 1000
    genes = [f"Y{chr(65 + (i % 16))}{'LR'[i % 2]}{i + 1:03d}{'WC'[i % 2]}" for i in range(n_genes)]

    # Log-normal base expression + negative-binomial biological overdispersion
    base_mu = np.exp(rng.normal(4.2, 1.5, size=n_genes))
    is_de = rng.random(n_genes) < 0.14
    true_lfc = np.where(is_de, rng.normal(0.0, 1.6, size=n_genes), 0.0)
    disp = 0.06 + 1.5 / (base_mu + 5.0)

    def _draw_nb(mu: np.ndarray, n_rep: int) -> np.ndarray:
        r = 1.0 / disp[:, None]
        p = r / (r + mu[:, None])
        return rng.negative_binomial(r, p, size=(n_genes, n_rep))

    wt = _draw_nb(base_mu, 3)
    snf2 = _draw_nb(base_mu * (2.0 ** true_lfc), 3)

    cnt_lines = ["Name\twt_rep1\twt_rep2\twt_rep3\tsnf2_rep1\tsnf2_rep2\tsnf2_rep3"]
    for i, g in enumerate(genes):
        vals = "\t".join(str(int(v)) for v in (*wt[i], *snf2[i]))
        cnt_lines.append(f"{g}\t{vals}")
    _write_text(out_dir / "yeast_counts.tsv", "\n".join(cnt_lines) + "\n", force, status)

    # Compute DESeq2-like Wald summary table
    wt_m = wt.mean(axis=1)
    snf_m = snf2.mean(axis=1)
    base_mean = (wt_m + snf_m) / 2.0
    lfc = np.log2((snf_m + 1.0) / (wt_m + 1.0))
    var_est = (wt.var(axis=1, ddof=1) + snf2.var(axis=1, ddof=1)) / 2.0
    se = np.sqrt((var_est / 3.0) / np.maximum((base_mean + 1.0) ** 2, 1.0)) / math.log(2.0)
    se = np.maximum(se, 0.12)
    stat = lfc / se
    pvals = np.array([max(math.erfc(abs(z) / math.sqrt(2.0)), 1e-300) for z in stat])
    padj = _benjamini_hochberg(pvals)

    res_lines = ["Name\tbaseMean\tlog2FoldChange\tlfcSE\tstat\tpvalue\tpadj"]
    for i, g in enumerate(genes):
        res_lines.append(
            f"{g}\t{base_mean[i]:.6g}\t{lfc[i]:.6g}\t{se[i]:.6g}\t"
            f"{stat[i]:.6g}\t{pvals[i]:.6g}\t{padj[i]:.6g}"
        )
    _write_text(out_dir / "deseq_results.tsv", "\n".join(res_lines) + "\n", force, status)


def _generate_alignment_data(
    out_dir: Path, rng: np.random.Generator, force: bool, status: dict[str, int]
) -> None:
    """Create filt606.vcf and (if pysam is installed) aln606.bam + aln606.bam.bai."""
    contig = "NC_012967.1"
    contig_len = 25_000
    bases = np.array(list("ACGT"))
    ref_seq = bases[rng.integers(0, 4, size=contig_len)]

    # Plant 12 SNVs
    snv_pos = sorted(int(p) for p in rng.choice(np.arange(1_000, contig_len - 1_000, 50), 12, replace=False))
    snv_alt: dict[int, str] = {}
    for p in snv_pos:
        ref_b = ref_seq[p]
        snv_alt[p] = str(bases[(int(np.where(bases == ref_b)[0][0]) + 1) % 4])

    vcf_lines = [
        "##fileformat=VCFv4.2",
        "##FILTER=<ID=PASS,Description=\"All filters passed\">",
        f"##contig=<ID={contig},length={contig_len}>",
        "##INFO=<ID=DP,Number=1,Type=Integer,Description=\"Raw read depth\">",
        "##FORMAT=<ID=GT,Number=1,Type=String,Description=\"Genotype\">",
        "#CHROM\tPOS\tID\tREF\tALT\tQUAL\tFILTER\tINFO\tFORMAT\trel606",
    ]
    for p in snv_pos:
        vcf_lines.append(
            f"{contig}\t{p + 1}\t.\t{ref_seq[p]}\t{snv_alt[p]}\t220\tPASS\tDP=30\tGT\t1/1"
        )
    _write_text(out_dir / "filt606.vcf", "\n".join(vcf_lines) + "\n", force, status)

    bam_path = out_dir / "aln606.bam"
    if not _should_write(bam_path, force):
        status["skipped"] += 1
        return

    try:
        import pysam  # type: ignore
    except ImportError:
        print("  note: pysam not installed — skipping aln606.bam (activate .venv to generate it)")
        return

    header = {"HD": {"VN": "1.6", "SO": "coordinate"}, "SQ": [{"LN": contig_len, "SN": contig}]}
    read_len = 100
    n_pairs = 3500
    starts = np.sort(rng.integers(0, contig_len - 500, size=n_pairs))
    inserts = np.clip(rng.normal(300, 35, size=n_pairs).astype(int), 150, 480)

    unsorted_records: list[tuple[int, object]] = []
    mut_seq = ref_seq.copy()
    for p, alt_b in snv_alt.items():
        mut_seq[p] = alt_b

    for idx, (s1, tlen) in enumerate(zip(starts, inserts)):
        s1 = int(s1)
        s2 = int(min(s1 + int(tlen) - read_len, contig_len - read_len))
        tlen_actual = s2 + read_len - s1
        for mate, pos, is_rev in ((0, s1, False), (1, s2, True)):
            seg_bases = mut_seq[pos : pos + read_len].copy()
            # ~0.3% sequencing error rate
            errs = rng.random(read_len) < 0.003
            if errs.any():
                seg_bases[errs] = rng.choice(bases, size=int(errs.sum()))
            quals = np.clip(rng.normal(35, 3, size=read_len).astype(int), 15, 40)
            quals[errs] = rng.integers(12, 24, size=int(errs.sum()))

            a = pysam.AlignedSegment()
            a.query_name = f"read_{idx:05d}"
            a.query_sequence = "".join(seg_bases)
            a.flag = 0x1 | 0x2 | (0x10 if is_rev else 0x20) | (0x40 if mate == 0 else 0x80)
            a.reference_id = 0
            a.reference_start = pos
            a.mapping_quality = 60
            a.cigar = [(0, read_len)]
            a.next_reference_id = 0
            a.next_reference_start = s2 if mate == 0 else s1
            a.template_length = tlen_actual if mate == 0 else -tlen_actual
            a.query_qualities = pysam.qualitystring_to_array("".join(chr(q + 33) for q in quals))
            unsorted_records.append((pos, a))

    unsorted_records.sort(key=lambda pair: pair[0])
    with pysam.AlignmentFile(str(bam_path), "wb", header=header) as bam_out:
        for _, seg in unsorted_records:
            bam_out.write(seg)
    pysam.index(str(bam_path))
    status["created"] += 1


def _generate_phylo_data(
    out_dir: Path, rng: np.random.Generator, force: bool, status: dict[str, int]
) -> None:
    """Create phylo/mito_aln.fa and phylo/mito.iqtree."""
    bases = np.array(list("acgt"))
    transitions = {"a": "g", "g": "a", "c": "t", "t": "c"}
    transversions = {"a": ["c", "t"], "g": ["c", "t"], "c": ["a", "g"], "t": ["a", "g"]}
    aln_len = 1200

    def _evolve(seq: list[str], rate: float) -> list[str]:
        out = list(seq)
        for i in range(len(out)):
            if rng.random() < rate:
                if rng.random() < 0.78:  # high mitochondrial Ti/Tv ratio
                    out[i] = transitions[out[i]]
                else:
                    out[i] = str(rng.choice(transversions[out[i]]))
        return out

    root_seq = list(rng.choice(bases, size=aln_len, p=[0.31, 0.31, 0.13, 0.25]))
    primate = _evolve(root_seq, 0.08)
    ape = _evolve(primate, 0.05)
    hominin = _evolve(ape, 0.025)
    seqs = {
        "Homo_sapiens": _evolve(hominin, 0.045),
        "Pan_troglodytes": _evolve(hominin, 0.045),
        "Gorilla_gorilla": _evolve(ape, 0.065),
        "Pongo_abelii": _evolve(ape, 0.11),
        "Macaca_mulatta": _evolve(primate, 0.16),
        "Mus_musculus": _evolve(root_seq, 0.28),
    }

    fa_lines: list[str] = []
    for name, seq in seqs.items():
        fa_lines.append(f">{name}")
        s = "".join(seq)
        for i in range(0, len(s), 60):
            fa_lines.append(s[i : i + 60])
    _write_text(out_dir / "phylo" / "mito_aln.fa", "\n".join(fa_lines) + "\n", force, status)

    iqtree_summary = (
        "IQ-TREE synthetic fallback summary (generated by part-S-statistics/setup_s_data.py)\n\n"
        "Input file name: mito_aln.fa\n"
        "Best-fit model according to BIC: TIM2+F+I+G4\n"
        "Log-likelihood of the tree: -4128.4510 (s.e. 72.1403)\n"
        "Unconstrained log-likelihood (without tree): -3891.2014\n"
        "Number of free parameters (#branches + #model parameters): 16\n"
        "Akaike information criterion (AIC) score: 8288.9020\n"
        "Bayesian information criterion (BIC) score: 8370.3432\n"
    )
    _write_text(out_dir / "phylo" / "mito.iqtree", iqtree_summary, force, status)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument(
        "--dir",
        type=Path,
        default=Path(__file__).resolve().parent.parent / "labs" / "data",
        help="Target directory (default: labs/data/)",
    )
    parser.add_argument(
        "--seed", type=int, default=42, help="PRNG seed for reproducible synthetic data"
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Overwrite existing files (default: preserve all existing files)",
    )
    args = parser.parse_args()

    rng = np.random.default_rng(args.seed)
    status = {"created": 0, "skipped": 0}
    args.dir.mkdir(parents=True, exist_ok=True)

    _generate_population_data(args.dir, rng, args.force, status)
    _generate_rnaseq_data(args.dir, rng, args.force, status)
    _generate_alignment_data(args.dir, rng, args.force, status)
    _generate_phylo_data(args.dir, rng, args.force, status)

    print(
        f"setup_s_data: {status['created']} created, {status['skipped']} kept existing "
        f"in {args.dir}"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
