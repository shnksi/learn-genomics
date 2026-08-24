# Verified facts — the pinned numbers

Every chapter in this curriculum draws its quantitative claims from this file. Nothing here
was written from memory: each entry was checked against a source on the date shown.

**Why this file exists.** A 58-chapter textbook written over many sittings will drift — the
gene count becomes 19,000 in one chapter and 20,000 in another, the pangenome is "47
genomes" in Chapter 43 and "200+" in Chapter 45. Pinning the numbers in one place makes
that class of error impossible, and makes the whole knowledge base auditable: you can check
this one file rather than re-reading 140,000 words.

**How to use it when writing.** Never state a number in a chapter that is not either
(a) listed here, (b) derived from something listed here with the derivation shown, or
(c) explicitly framed as an approximate teaching figure.

## Confidence tiers

| Tier | Meaning | How to write it |
|---|---|---|
| **A** | Fetched directly from the primary source (database stats page, consortium site, published paper) | State the exact number, cite release/version |
| **B** | Confirmed across reputable secondary sources, primary not directly fetched | State the number, hedge lightly ("approximately") |
| **C** | Fast-moving vendor specification or an actively contested estimate | Give a **range**, name the date, tell the reader it moves |

---

## Human genome — annotation

Source: [GENCODE Human Release 50 statistics](https://www.gencodegenes.org/human/stats.html) · fetched 2026-08-13 · **Tier A**

| Quantity | Value |
|---|---|
| Protein-coding genes | **19,442** |
| Long non-coding RNA genes | **35,885** |
| Small non-coding RNA genes | **7,608** |
| Pseudogenes | **14,702** |
| — processed | **10,634** |
| — unprocessed | **3,535** |
| — unitary | **296** |
| — IG/TR pseudogenes | **237** |
| IG/TR protein-coding segments | **412** |
| Readthrough genes (protein-coding, *not* inside the 19,442) | **665** |
| Artifact biotype | **19** |
| Total annotated genes | **78,733** |
| Total transcripts | **644,292** |

The four pseudogene sub-counts are components of the 14,702, not additions to it:
`10,634 + 3,535 + 296 + 237 = 14,702`, exactly. The IG/TR row on GENCODE's page splits into
412 protein-coding segments and 237 pseudogenes; only the 412 sit outside the four headline
categories, because the 237 are already counted as pseudogenes.

### The non-coding count — do not compute it by subtraction

**58,195**, not 59,291. The four headline categories sum to 77,637, leaving **1,096** of the
78,733 total. That residual is routinely misidentified — including in an earlier version of
this file — as immunoglobulin and T-cell-receptor gene segments alone. GENCODE's own rows
decompose it exactly:

`412 IG/TR protein-coding segments + 665 readthrough genes + 19 artifact = 1,096`

**1,077 of the 1,096 are protein-coding** (the IG/TR segments plus the readthrough genes), so
the teaching point survives intact: subtracting protein-coding genes from the total sweeps
over a thousand coding entities into the non-coding tally. Only the identification of the
residual changes.

Use `35,885 + 7,608 + 14,702 = 58,195`. The ~3:1 non-coding:coding ratio survives either way,
but the honest figure is 58,195.

> **Say which 3:1 you mean.** 58,195 / 19,442 = **2.99:1** only because pseudogenes are in the
> numerator. Transcribed non-coding **RNA** genes alone are 35,885 + 7,608 = **43,493**, i.e.
> **2.24:1**. A sentence whose subject is "transcribed into non-coding RNA" must therefore say
> *better than 2:1*, and reach 3:1 only by explicitly adding the pseudogenes — which are the
> weakest part of the anti-junk argument anyway.

> **Teaching note.** The protein-coding count is one of the most misquoted numbers in
> biology. The 2001 draft-genome estimates of 30,000–40,000 have been revised steadily
> downward; "about 20,000" is the honest round figure and **19,442** is the current
> annotation. Note also that non-coding genes now outnumber coding genes roughly 3:1 — a
> fact that should be used to kill the "junk DNA" framing in Chapters 03 and 39.

## Human genome — composition

| Quantity | Value | Tier | Source |
|---|---|---|---|
| Transposable element content | **~46%** of the genome (T2T-CHM13 annotation) | B | T2T repeat-element analyses, *Science* 2022 |
| Sequence newly resolved by T2T-CHM13 | **~8%** of the genome, previously inaccessible — all centromeres, and the entire short arms of five acrocentric chromosomes | B | *The complete sequence of a human genome*, Science 2022 |
| Only autonomously active human TE | **LINE-1** | B | as above |
| *Alu* copy number | **~1.1 million** copies, **~11%** of the genome | B | [Alu elements: know the SINEs](https://link.springer.com/article/10.1186/gb-2011-12-12-236) |
| 30 nm chromatin fibre compaction | **~40-fold cumulative** relative to naked DNA — i.e. a further ~6-fold beyond the nucleosome, **not** a further 40-fold | B | standard chromatin texts |
| Nucleosome-occupied fraction | ~75% of the genome on an octamer at any moment. The remainder is mostly **linker**, which is *not* accessible; ATAC/DNase-accessible regions are ~1–3% of the genome | B | ENCODE accessibility data |

## Replication fidelity — mind the units

**Tier B** · [DNA Replication — A Matter of Fidelity, *Molecular Cell* 2016](https://www.cell.com/molecular-cell/fulltext/S1097-2765(16)30140-X)

| Filter | Error rate after this step | Improvement |
|---|---|---|
| Polymerase base selection | ~10⁻⁵ | — |
| + 3′→5′ proofreading | ~10⁻⁷ | 10²–10³ |
| + mismatch repair | **~10⁻⁹ – 10⁻¹⁰** | 10²–10³ |

Final replication fidelity: **~10⁻¹⁰ per base per cell division** (measured as low as
2 × 10⁻¹⁰ substitutions per base per division).

> **This is the single easiest unit error in the curriculum, and it appeared in four chapters
> and one problem set before being caught.** Replication fidelity ~10⁻¹⁰ is **per base per
> replication**. The germline rate ~1.1–1.3 × 10⁻⁸ is **per base per generation** — a
> different quantity that sums hundreds of cell divisions *and* includes unrepaired chemical
> damage that was never a polymerase error. They differ by ~100× and are not comparable.
>
> Sanity check, and note it *overshoots*: 10⁻¹⁰ × ~300 germline divisions ≈ 3 × 10⁻⁸ against a
> measured 1.2 × 10⁻⁸. Agreement within a factor of 2–3 is all this calculation is entitled to
> claim — 10⁻¹⁰ is an order-of-magnitude bound, not a constant.

## Spontaneous DNA damage

| Process | Rate | Tier |
|---|---|---|
| Depurination (loss of A or G by spontaneous hydrolysis) | **on the order of 10⁴ per cell per day** | C — sources span ~5,000 to ~26,000 depending on what is counted; use the order of magnitude |

## Germline mutation rate

**Tier B** · multiple trio and long-read pedigree studies

| Quantity | Value |
|---|---|
| Genome-wide SNV rate | **~1.1–1.3 × 10⁻⁸** per bp per generation |
| Recent long-read pedigree estimate | **1.30 × 10⁻⁸** per bp per generation |
| Coding-sequence rate | somewhat higher, ~1.25–2.1 × 10⁻⁸ |
| Fraction of de novo mutations of paternal origin | **~80%** |
| Additional de novo mutations per year of paternal age | **~1.3–1.5** |

> Use the rate to derive the ~60–70 de novo mutations per diploid genome per generation
> figure in Chapter 16 rather than asserting it — the derivation is the teaching point.

## Human generation time

**Tier C** · fetched **2026-08-13** · [Wang RJ, Al-Saffar SI, Rogers J & Hahn MW, "Human
generation times across the past 250,000 years", *Science Advances* 9:eabm7047, 2023 (PMID
36608127)](https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=EXT_ID:36608127&resultType=core&format=json)

| Quantity | Value |
|---|---|
| Sex-averaged generation time, averaged over the past 250 kyr | **26.9 years** |
| Paternal | **30.7 years** |
| Maternal | **23.2 years** |

**Curriculum convention: 27 years per generation.** Use it wherever generations are converted
to years, and name it in the same sentence.

Tier C because this is a model-based inference from the mutation spectrum rather than a
measurement, and it is contested; the usable literature spans roughly **25–30 years**, and
older sources routinely use 25 or 29. Every years-from-generations conversion inherits that
±10% spread, so quote the generation count — which is exact — and treat the years as
approximate.

> **This was a live inconsistency, not a hypothetical.** Chapter 27 converted a
> 69,000-generation mutation half-life at 25 years (1.7 My); Chapter 29 converted a
> 6,900-generation LD half-life at 28 years (194,000 y). Both now use 27 years, giving 1.9 My
> and 190,000 y. The choice is not cosmetic: at 25 versus 29 years that LD half-life reads
> 173,000 or 200,000 years — the difference between "shorter than" and "comparable to" the
> 315 ± 34 kyr age of the oldest *H. sapiens* fossils
> ([Hublin et al., *Nature* 546:289, 2017](https://europepmc.org/article/MED/28593953)).

## Molecular machinery — Part 1 chapters

Fetched from the primary sources on **2026-08-13**, during the adjudicated accuracy pass.
Each row replaced a number that was wrong or overstated in the text.

| Quantity | Value | Tier | Source |
|---|---|---|---|
| Pol III cores per active *E. coli* replisome | **three**, not the classical two — three τ molecules trimerise the polymerase. Purified holoenzyme is still often drawn as a dimer | A | [Reyes-Lamothe, Sherratt & Leake, *Science* 328:498, 2010](https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=EXT_ID:20413500&resultType=core&format=json) |
| UP-element stimulation at *E. coli rrnB* P1 | **~30-fold** (αCTD–UP element interaction reported at **30–70-fold** in vivo; a consensus UP element in the wild-type position gives 29-fold). **Not tenfold** | A | [Ross et al., *Science* 262:1407, 1993](https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=EXT_ID:8248780&resultType=core&format=json) · [Meng et al., *Nucleic Acids Res.* 29:4166, 2001](https://academic.oup.com/nar/article/29/20/4166/1066254) |
| σ⁵⁴ activator (bacterial enhancer-binding protein) distance | **80–150 bp** upstream of the promoter in natural systems. **Not "hundreds of base pairs"** | B | [Bush & Dixon, *Microbiol. Mol. Biol. Rev.* 76:497, 2012](https://journals.asm.org/doi/10.1128/mmbr.00006-12) |
| Minor (U12-type) spliceosome snRNAs | Four unique — U11, U12, U4atac, U6atac — **plus U5, which is shared with the major spliceosome**. A parts list omitting U5 is incomplete | A | [Pessa et al., *PNAS* 105:8655, 2008](https://pmc.ncbi.nlm.nih.gov/articles/PMC2438382/) — *"U5 snRNA, in contrast, is shared between the two spliceosomes."* |

## Lactase persistence — timing, and what it does not show

**Tier A** · fetched **2026-08-13** · [Evershed et al., *Nature* 608:336–345, 2022](https://pmc.ncbi.nlm.nih.gov/articles/PMC7615474/) ([Europe PMC record](https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=EXT_ID:35896751&resultType=core&format=json))

| Quantity | Value |
|---|---|
| Strength of selection | LP is **the most strongly selected monogenic trait to have evolved over the past 10,000 years** (verbatim) |
| Earliest European LP individual in ancient DNA | **c. 4,700–4,600 BC** |
| First reaches appreciable frequency | **c. 2,000 BC** — "nearly three millennia after its first detection" |
| Milk use in Europe | **widespread from the Neolithic onwards**, i.e. long before the frequency rise |

> **Do not couple the sweep to the start of dairying.** The paper's own model comparison
> rejects it: *"LP selection varying with levels of prehistoric milk exploitation is no better
> at explaining LP allele frequency trajectories than uniform selection since the Neolithic
> period."* Population fluctuations, settlement density and wild-animal exploitation fit
> better, and the authors propose **famine and/or increased pathogen exposure** as what made
> lactase non-persistence costly. Write it as a very strong selection signal whose *driver*
> is still argued over — Chapter 00's worked example does exactly this.

## Population reference datasets

| Resource | Current state | Tier | Source |
|---|---|---|---|
| **gnomAD** | Current release is **v4.1.1 (30 March 2026)** — a gene-constraint, LOFTEE-flag and annotation update on v4.1 (19 April 2024), which itself fixed v4.0's allele-number issue. The cohort is unchanged since v4.0 (1 November 2023): **730,947 exomes + 76,215 genomes = 807,162 individuals**, aligned to GRCh38, including 416,555 UK Biobank exomes. **No v5 as of Aug 2026.** Cite the point release — constraint metrics moved in v4.1.1 without the cohort changing. | B | [gnomAD news index](https://gnomad.broadinstitute.org/news/) — release list fetched 2026-08-13; [v4.0 announcement](https://gnomad.broadinstitute.org/news/2023-11-gnomad-v4-0/) for cohort composition |
| **ClinVar** | **No version number — cite the release date.** NCBI ships a full weekly VCF/XML plus a monthly archived release named by date: latest monthly `ClinVarVCVRelease_2026-08` (posted 2026-08-06), latest weekly VCF `clinvar_20260808` (posted 2026-08-10). "The current ClinVar" is not a citable object; a classification can change between two consecutive weeks. | A | [ClinVar FTP release listing](https://ftp.ncbi.nlm.nih.gov/pub/clinvar/) · fetched 2026-08-13 |
| **1000 Genomes** | Original final release 2,504 unrelated individuals, 26 populations, low-coverage. **Expanded high-coverage (30×) release: 3,202 samples including 602 complete trios**, NovaSeq 6000, called against GRCh38. | B | [1000 Genomes / NYGC](https://www.internationalgenome.org/announcements/3202-samples-at-high-coverage-from-NYGC/) |
| **HPRC pangenome** | **Release 2 (May 2025)** — 200+ individuals, **460 haplotypes**, ~5× expansion over Release 1. Captures >99% of common variation seen in All of Us v8. Release 1 was 47 individuals / 94 haplotypes. | B | [HPRC Data Release 2](https://humanpangenome.org/hprc-data-release-2/) |

> **This corrected a stale assumption.** Writing Chapter 45 from memory would have described
> the 2023 Release 1 draft pangenome as current. It is two years and a fivefold expansion
> out of date.

## Sequencing platforms

**Tier C throughout** — vendor specifications move fast and marketing figures are best-case.
Chapter 40 must give ranges, state the date, and tell the reader to check current specs.

| Platform | Read length | Accuracy | Notes |
|---|---|---|---|
| **Illumina NovaSeq X / X Plus** | 2×150 bp typical (2×300 available) | ~Q30+, ~0.1% error | 25B flow cell ≈ 8 Tb per flow cell |
| **PacBio Revio** (HiFi / CCS) | ~15–25 kb | >99.9% consensus (HiFi) | **~100–120 Gb per SMRT Cell in ~24 h** at 15–20 kb inserts; ~70–100 Gb at 10–15 kb; ~35–70 Gb at 5–10 kb; 30 h runs at 20–25 kb |
| **Oxford Nanopore** R10.4.1 / kit V14 | 10s of kb routine; ultra-long >100 kb achievable | simplex **~99.75% (Q26)** on current high-accuracy models, against a vendor record of **Q28 (99.8%)**; duplex ~Q30 (>99.9%) | Longest reads. The accuracy gain is in the *basecaller*, not the chemistry — same pore and kit designation, Q20 → Q26. The duplex figure has no current vendor page behind it: treat as unpinned |
| **Roche AXELIOS 1** (SBX) | **~400–600 bp** in short-read (simplex) mode; **up to ~1,500 bp** under favourable sample and library prep | not yet independently benchmarked | **Launched 29 June 2026**, research-use-only. Sequencing-by-expansion: DNA converted to "Xpandomers" read on a CMOS nanopore sensor. Same-day whole genomes claimed. Roche's own pages are not self-consistent on read length; simplex and duplex modes differ |

**Per-row sources, each re-fetched 2026-08-13.** Tier C rows rot fastest, so they carry their
own URL and date rather than a single date for the section:

| Row | Source | Fetched |
|---|---|---|
| Illumina NovaSeq X / X Plus | [NovaSeq X Plus specifications](https://www.illumina.com/systems/sequencing-platforms/novaseq-x-plus/specifications.html); roadmap from the [23 Feb 2026 release](https://www.illumina.com/company/news-center/press-releases/2026/7b4175f1-a13f-401e-9335-3e5eadbb1fe0.html) | 2026-08-13 |
| PacBio Revio | [pacb.com/revio](https://www.pacb.com/revio/) | 2026-08-13 |
| Oxford Nanopore | [nanoporetech.com/platform/accuracy](https://nanoporetech.com/platform/accuracy); Q28 record from the [7 Dec 2023 release](https://nanoporetech.com/news/news-oxford-nanopore-announces-breakthrough-performance-simplex-single-molecule-accuracy) | 2026-08-13 |
| Roche AXELIOS 1 / SBX | [SBX technology overview](https://diagnostics.roche.com/global/en/diagnostics-insights/sbx-technology-overview.html) (400–600 bp); [launch release, 29 Jun 2026](https://www.roche.com/media/releases/med-cor-2026-06-29) (~1,500 bp) | 2026-08-13 |

> **The Illumina row is deliberately conservative, not stale.** Illumina's current spec page
> gives the 25B flow cell as ~8–10.5 Tb at 2×150; "≈ 8 Tb" sits at the bottom of the vendor's
> own published range, which is the right way to quote a best-case marketing figure. A
> February 2026 roadmap announces 25B→35B and 10B→14B flow cells over an 18-month rollout;
> **do not write those as current specifications** until a shipped datasheet says so.

> **This was a genuine knowledge gap.** The Roche AXELIOS 1 / SBX platform launched six
> weeks before this curriculum was written. A chapter on sequencing technology written from
> memory would have presented a three-horse race (Illumina / PacBio / ONT) and missed a new
> entrant with a fundamentally different chemistry. Chapter 40 covers it — while being clear
> that independent benchmarks do not yet exist.

## Single-cell droplet platform — the multiplet rate

**Tier C** · [10x Genomics, *An introduction to GEM-X technology*, 11 March 2024](https://www.10xgenomics.com/blog/the-next-generation-of-single-cell-rna-seq-an-introduction-to-gem-x-technology) · [Chromium technology page](https://www.10xgenomics.com/platforms/chromium/technology) · both fetched 2026-08-13

| Quantity | Value |
|---|---|
| Multiplet rate, current chemistry (GEM-X) | **~0.4% per 1,000 cells recovered** |
| Multiplet rate, preceding chemistry (Next GEM) | ~0.8% per 1,000 recovered — GEM-X is quoted as a "2-fold reduction" |
| Maximum cells per channel | up to **20,000** |
| Median cell recovery, 3′ v4 | **~75%** (was ~60% on Next GEM v3.1) |

> **This is the single most copy-pasted stale number in single-cell methods sections.** The
> rate is linear in cells recovered, so it multiplies straight through into a doublet budget:
> at 0.4% a 10,000-cell run is ~4% doublets, at the old 0.8–1% it was 8–10%. A protocol
> inherited from a 2023 paper overstates the doublet burden by ~2×. Chapter 48 uses 0.4% in
> both §3 and the Ch 48 worked example, and states the previous figure so the reader can spot
> the substitution in someone else's methods.

## Clinical variant interpretation

**Tier B** · [ClinGen SVI](https://clinicalgenome.org/working-groups/sequence-variant-interpretation/)

- The **operative published standard remains Richards et al. 2015** (ACMG/AMP), as refined
  by ClinGen Sequence Variant Interpretation working-group recommendations and by
  gene- and disease-specific Variant Curation Expert Panel specifications.
- **ACMG v4 is in draft**, previewed at the ACMG 2025 Clinical Genomics Meeting. It
  restructures and consolidates the evidence codes to be more concept-driven, while leaving
  the foundational framework intact.
- As of July 2025 ClinGen directs users to its "Variant Classification Guidance" page rather
  than to a single static document.

> **Chapter 55 must teach the 2015 framework as the working standard while flagging v4 as
> imminent.** Teaching v4 as current would be wrong; teaching 2015 as unchallenged would be
> dated. This nuance is exactly the sort of thing a textbook written from memory gets wrong.

## ClinGen Cardiomyopathy VCEP — *MYH7* specification

**Tier A** · [ClinGen Criteria Specification Registry, record GN002](https://cspec.genome.network/cspec/SequenceVariantInterpretation/id/135637574) · JSON fetched 2026-08-13

Record **GN002**, *"ClinGen Cardiomyopathy Expert Panel Specifications to the ACMG/AMP Variant
Interpretation Guidelines for MYH7 Version 2.0"*, state **Released**, approved **2024-04-22**.
Version 1.0 is Kelly et al. 2018 (PMID 29300372) and is **superseded** — do not quote its
thresholds.

| Criterion | Specification for *MYH7* |
|---|---|
| **BA1** | Filtering allele frequency **≥ 0.001** (0.1%) in gnomAD, popmax subpopulation |
| **BS1** | Filtering allele frequency **≥ 0.0001** (0.01%) in gnomAD, popmax subpopulation |
| **PM2_Supporting** | **≤ 0.00004** in the popmax subpopulation, using the **upper** bound of the 95% CI (gnomAD displays the FAF, which is the *lower* bound, so this must be computed) |
| **PM1** | Missense in codons **167–931** (ENST00000355349 / NM_000257.4). *"Rule should NOT be combined with PM5"* — same-codon pathogenic variants defined the cluster, so combining double-counts |
| **PM5** | *"PM5 should not be combined with PM1."* Where both apply at Moderate, prefer PM5 as variant-specific |
| **PP2** | **Not applicable** for *MYH7*; the regional enrichment it would capture is already in PM1 |
| **PP3** | Approved at **Supporting only** — Moderate, Strong and Very Strong are all marked not applicable. REVEL **≥ 0.70**. Meta-predictors preferred; individual algorithms are not independent criteria |
| **PS2** | *"For most cardiomyopathies, it is recommended to default to Phenotype consistency: 'Phenotype consistent with gene but not highly specific'"* — which on the SVI de novo point scale is **1 point (Moderate)** for confirmed parentage. Shifting up or down requires stated clinical judgement |

> **This one changed the answer to Chapter 55's flagship worked example.** The chapter had applied
> the *general* ClinGen REVEL calibration (PP3_Moderate at 0.89) inside a case built on *MYH7*,
> while obeying the same panel's PM1 and PP2 rules four lines earlier. The corrected worked example
> applies the specification to both PP3 (down to Supporting) and PS2 (up to Moderate); the two
> changes cancel at 6 points, and the standing lesson is that consistency about *which rulebook you
> are in* matters more than either individual call.

## Hypertrophic cardiomyopathy — gene contributions

**Tier A** · Sedaghat-Hamedani et al., *Clin Res Cardiol* 2018;107(1):30–41, PMID 28840316 · abstract fetched 2026-08-13

| Gene | Share of HCM cases |
|---|---|
| *MYBPC3* | **20%** — the largest single-gene contributor |
| *MYH7* | **14%** |
| *TNNT2*, *TNNI3* | 2% each |

Meta-analysis of 51 studies, 7,675 HCM patients. The ClinGen *MYH7* specification uses a still
lower gene contribution (10.6%, from Kelly et al. 2018).

> ***MYH7* is not the largest contributor and its *g* is not 0.30.** Chapter 55's maximum credible
> allele frequency worked example used *g* ≈ 0.30 and got AF_max = 1.2 × 10⁻⁵; at *g* = 0.14 it is
> **5.6 × 10⁻⁶**, about 9 alleles in gnomAD's ~1.6 million. Whiffin et al. 2017 build the same
> example on *MYBPC3*.

## GWAS ancestry representation

| Quantity | Value | Tier | Source |
|---|---|---|---|
| European-ancestry share of GWAS participants | **88.25%** (discovery stage) | A | [GWAS Diversity Monitor](https://gwasdiversitymonitor.com/), fetched 2026-08-13, page timestamp 2026-08-07 |
| African | **0.27%** | A | as above |
| African American or Afro-Caribbean | **2.77%** | A | as above |
| Asian | 6.09% · Hispanic/Latin American 1.28% · Other/mixed 1.34% | A | as above |
| World-population share of European **ancestry** | **~16%** | A | [Martin et al. 2019, *Nat Genet*, PMC6563838](https://pmc.ncbi.nlm.nih.gov/articles/PMC6563838/): *"~79% of all GWAS participants are of European descent despite making up only 16% of the global population"* |

> **Mind the denominator.** 16% is the world share of people of European *ancestry*, which
> includes the European-descended populations of the Americas and Oceania. Europe's *resident*
> population is ~9%. Chapter 58 used 9% against an ancestry numerator, which nearly doubled the
> apparent over-representation ratio (5.4× → 9.7×). This is a **Tier C-behaving row**: the monitor
> moves, so re-fetch and re-date rather than copying.

## Long-range familial search — Erlich et al. 2018

**Tier A** · [Erlich, Shor, Pe'er & Carmi, *Science* 2018, PMC7549546](https://pmc.ncbi.nlm.nih.gov/articles/PMC7549546/) · fetched 2026-08-13

- Dataset analysed: **1.28 million individuals** tested with a DTC provider.
- *"nearly 60% of long-range familial searches return a relative with IBD segments with a total
  length of 100 cM or more"* — this is the hit rate **for that 1.28M database**, roughly 0.9%
  coverage of the relevant population.
- *"a genetic database needs to cover only 2% of the target population to provide a third-cousin
  match to nearly any person"*, and at ~3 million US individuals of European descent (2%),
  *"more than 99% of the people of this ethnicity would have at least a single third-cousin
  match."*

> **The 60% and the 2% are different results and must never be fused.** Writing "~60% at 2%
> coverage" is a fabrication, and Chapter 58 had additionally back-solved its constant
> *N* ≈ 45 from that non-existent datum. No single *N* fits both published endpoints —
> 60% at 0.9% coverage needs *N* ≈ 107, >99% at 2% needs *N* ≈ 228 — so the independence model
> `P = 1 − (1 − c)^N` must be presented as a shape argument with an effective, conservative *N*,
> never as a fitted prediction.

## Applied genomics — dated events and figures

| Quantity | Value | Tier | Source |
|---|---|---|---|
| **UK Generation Study** | **200+ conditions**, **more than 500 genes**; 97 genes / 48 conditions added April 2026; **about 1 in 100** babies expected to be *suspected* of a condition (not diagnosed) | A | [Genomics England — choosing conditions](https://www.genomicsengland.co.uk/initiatives/newborns/choosing-conditions), fetched 2026-08-13. Supersedes the pre-April-2026 figures 462 genes / 208 conditions / 1 in 200 |
| **Genome vs exome diagnostic yield** | Within-cohort pooled **30.6%** GS vs **23.2%** ES, from **N = 3** studies; OR 1.7, **95% CI 0.94–2.92, *P* = .13 — not significant**. Three authors are Illumina employees/stockholders | A | Pandey et al., *Genet Med* 2025;27(6):101398, PMID 40022598, abstract fetched 2026-08-13 |
| **EU New Genomic Techniques regulation** | European Parliament gave **final approval 17 June 2026**. Two categories: category 1 (equivalent to conventional breeding) follows a verification route outside the full GMO regime; category 2 stays inside it. Enters into force 20 days after OJ publication, **applies two years later** | B | [Renew Europe, 2026-06-17](https://www.reneweuropegroup.eu/news/2026-06-17/parliament-gives-final-green-light-to-new-genomic-techniques-legislation); [Rothamsted, 2026-06-29](https://www.rothamsted.ac.uk/news/rothamsted-research-welcomes-new-eu-regulations-light-touch-approval-gene-edited-crops); [Appleyard Lees](https://www.appleyardlees.com/eu-parliament-approves-new-genomic-techniques-ngt-regulation/) · fetched 2026-08-13 |
| **DOJ forensic genetic genealogy interim policy** | **Approved 09.02.2019, effective 11.01.2019** (2 September and 1 November 2019), per the policy document's own page footer; publicly announced 24 September 2019 | A | [DOJ Interim Policy PDF](https://www.justice.gov/media/1025866/dl), fetched 2026-08-13 |
| **Beacon re-identification cost** | 250 queries against a 65-individual beacon; **~5,000 queries** against a 1,000-individual beacon. Cost scales with beacon size | A | Shringarpure & Bustamante, *AJHG* 2015;97(5):631–46, PMID 26522470, abstract fetched 2026-08-13 |
| **GEDmatch opt-in** | ~185,000 profiles opted back in by late 2019 after the May 2019 switch to opt-out; new users choose at registration **with opt-in pre-selected**, and **83%** stay opted in | B | Guerrini et al., "Four misconceptions about investigative genetic genealogy", PMC8043143, fetched 2026-08-13 |
| **Nagoya Protocol scope** | **Does not cover human genetic material.** Genetic resources are *"any plant, animal, microbial or material of other origin"* | B | [UK BRCN guidance](https://www.ukbrcn.org/guidelines/the-nagoya-protocol/), fetched 2026-08-13 |
| **Utah Genetic Information Privacy Act** | S.B. 227, governor-signed **17 March 2021**, effective **5 May 2021** — the DTC genetic-privacy wave began in 2021, not 2025–26 | A | [le.utah.gov SB0227 (2021)](https://le.utah.gov/~2021/bills/static/SB0227.html), fetched 2026-08-13 |
| ***PCSK9*** | Gene→hypercholesterolaemia link established **2003** via gain-of-function ADH families (Abifadel et al., *Nat Genet*, PMID 12730697). ARIC: nonsense alleles in **2.6%** of Black participants → 28% LDL, **88%** CHD reduction; **R46L** in **3.2%** of white participants → 15% LDL, **47%** CHD reduction, HR 0.50 (95% CI 0.32–0.79), *P* = 0.003 | A | Cohen et al., *NEJM* 2006;354:1264–72, PMID 16554528, abstract fetched 2026-08-13 |
| **He Jiankui** | Convicted of illegal medical practice **December 2019**, three years' imprisonment and ¥3M fine; China's **2020 Criminal Law amendment** made implantation of a gene-edited human embryo an offence carrying 3–7 years | B | contemporaneous reporting (Xinhua, *Science*, STAT), checked 2026-08-13 |
| **Genetic adverse selection** | Huntington mutation carriers are **up to five times** as likely as the general population to hold long-term-care insurance; the authors argue modest growth in genetic information could threaten that market's viability | B | Oster, Shoulson, Quaid & Dorsey, [NBER w15326](https://www.nber.org/papers/w15326) (published *J Public Econ* 2010), fetched 2026-08-13 |

> **Still unverified — do not harden.** The 85–90% concern / ~40% discrimination figures for
> people at risk of Huntington disease (Ch 58 §3) have no located source. RUSP condition count
> (Ch 57 §4) and the *DPYD* testing-mandate row (Ch 57 §5) were not re-checked; HRSA returns 403.
> The FDA/PIC PRRS pig approval (Ch 57 §7) is unconfirmed. The EU NGT row above is Tier B pending
> the Official Journal text — sources disagree on the vote tally, so **no tally is quoted in the
> chapter**.

---

## What this review changed

Recorded so the corrections aren't silently re-introduced later:

1. **Pangenome** — Release 1 (47 genomes) is superseded by Release 2 (200+ individuals, 460 haplotypes, May 2025).
2. **Sequencing platforms** — Roche AXELIOS 1 / SBX launched June 2026 and belongs in the platform comparison.
3. **ACMG** — v4 exists in draft; the 2015 guidelines need to be framed as "current but under active revision", not as settled.
4. **Gene count** — pinned to the exact current annotation (19,442, GENCODE 50) rather than a remembered round number, with the non-coding:coding ratio available to make a pedagogical point.
5. **UP element** (2026-08-13) — ~30-fold, not tenfold, at *rrnB* P1. The old figure understated it 3×.
6. **σ⁵⁴ activators** (2026-08-13) — 80–150 bp upstream, not "hundreds of base pairs".
7. **Pol III stoichiometry** (2026-08-13) — three cores per live replisome; "dimeric holoenzyme" is the pre-2010 picture.
8. **Minor spliceosome** (2026-08-13) — U5 belongs in the parts list; it is shared with the major spliceosome.
9. **Lactase persistence** (2026-08-13) — the sweep is *not* coupled to the onset of dairying; the allele stays rare for nearly three millennia after first appearing.
10. **GENCODE residual** (2026-08-13) — the 1,096 genes outside the four headline categories are **412 IG/TR coding segments + 665 readthrough + 19 artifact**, not "IG/TR gene segments" alone. 1,077 are protein-coding, so the do-not-subtract lesson stands; the identification was wrong. The 237 IG/TR pseudogenes are *inside* the 14,702, not additional to it.
11. **ONT accuracy** (2026-08-13) — simplex ~Q26 (99.75%), vendor record Q28. The old ~Q23 ceiling was ~2.5 years stale **on its own pinning date**. The duplex ~Q30 figure now has no vendor page behind it.
12. **PacBio Revio throughput** (2026-08-13) — ~100–120 Gb per SMRT Cell in ~24 h, not ~60–90 Gb in ~30 h. One chemistry generation behind.
13. **Roche SBX read length** (2026-08-13) — ~400–600 bp short-read mode, up to ~1,500 bp; the pinned "~175 bp" was a pre-launch example figure and appears nowhere in Roche's shipped documentation.
14. **10x multiplet rate** (2026-08-13) — ~0.4% per 1,000 cells recovered on current chemistry, roughly half the 0.5–1% previously pinned. Worked examples in Chapter 48 recomputed.
15. **Human generation time** (2026-08-13) — newly pinned at **27 years**. It was unpinned, and the curriculum was silently using 25 (Ch 27), 28 (Ch 29) and 29 (problem set 9) for the same conversion. Chapters 27 and 29 now agree; the question banks and problem sets still need reconciling.
16. **ClinGen *MYH7* VCEP** (2026-08-13) — v2.0 (approved 2024) supersedes the Kelly 2018 v1 thresholds. PP3 is approved at **Supporting only** for *MYH7*, so Chapter 55's flagship worked example was applying the *general* REVEL calibration inside a case that obeys the specification elsewhere. PS2's specification default runs the other way (Moderate, not Supporting). Both now applied; the tally is unchanged at 6 points and Likely pathogenic, and the standing lesson is **check for a specification before deriving your own thresholds**.
17. **HCM gene contribution** (2026-08-13) — *MYBPC3* (~20%) is the largest single-gene contributor, not *MYH7* (~14%). Chapter 55's *g* ≈ 0.30 was unsourced and wrong under the chapter's own definition of *g*; AF_max for HCM via *MYH7* is **5.6 × 10⁻⁶** (~9 alleles in 1.6M), not 1.2 × 10⁻⁵ (~19).
18. **Erlich et al. 2018** (2026-08-13) — "~60% of US individuals of European descent at ~2% coverage" **fuses two different results and states a figure the paper does not contain**. 60% is the hit rate for a 1.28M-record database (~0.9% coverage); at 2% coverage the paper projects **>99%**. Chapter 58 had back-solved its *N* ≈ 45 from the fused datum; the model is now presented as a shape argument with an explicitly effective, conservative *N*.
19. **GWAS ancestry denominator** (2026-08-13) — European *ancestry* is ~16% of the world (Martin et al. 2019); 9% is Europe's *resident* population, and using it against an ancestry numerator inflated the over-representation ratio from ~5.4× to ~9.7×. Monitor figures re-fetched live: 88.25% European, 0.27% African.
20. **Nagoya Protocol** (2026-08-13) — **does not cover human genetic material.** Listing it among remedies for the Havasupai structure of harm was a category error; Chapter 58 now says so explicitly rather than deleting it, because the mis-citation is common.
21. **Generation Study** (2026-08-13) — >500 genes / 200+ conditions / **~1 in 100**, superseding 462 / 208 / 1 in 200. Corrected in Ch 57 §4 and Ch 54 (Ch 54's "more than 200 conditions" was already right and was left alone).
22. **EU NGT regulation** (2026-08-13) — adopted 17 June 2026. Chapter 57's "the EU still regulates most such organisms under its 2001 GMO directive" became false, and the section's "one technique, three regulatory philosophies" punchline went with it — the EU's two-tier, edit-based structure now parallels the UK Act.
23. **DOJ forensic-genealogy policy** (2026-08-13) — Ch 58 said September 2019, Ch 57 said November 2019, and both were half-right: **approved 2 September, effective 1 November**. Both chapters now name the event rather than a bare date.

> **Both question-bank propagations of items 17 and 18 were resolved on 2026-08-13.**
> `question-banks/qb-part-12.md` no longer back-solves *N* from the fabricated "60% at 2% coverage"
> datum; it now states the model as a shape argument and gives Erlich's two irreconcilable fits
> (*N* ≈ 107 at ~0.9% coverage, *N* ≈ 228 at 2%), matching Ch 58.
> `question-banks/qb-part-11.md` now carries 5.6 × 10⁻⁶ / ~9 alleles and names *MYBPC3* as the
> largest single-gene contributor, matching Ch 55.

## Re-verification

Everything above carries a verification date of **2026-08-10**, except rows and sections
explicitly dated **2026-08-13** (added during the adjudicated accuracy pass). The Tier C rows
(sequencing platforms) and the ACMG row are the ones that will rot first. Re-check them
before relying on this curriculum a year from now.

**The 2026-08-13 pass found that prediction was already too optimistic.** Two of the four
sequencing-platform rows and the single-cell multiplet rate were stale *on their original
2026-08-10 pinning date* — the ONT figure by about two and a half years. A vendor row is not
verified because someone wrote a date next to it; it is verified because someone opened the
vendor's page. That is why the Tier C rows now carry their own per-row URL and fetch date:
the next person to re-check them can see exactly what was opened and when, and does not have
to trust a section-level date stamp.
