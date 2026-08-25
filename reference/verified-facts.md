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

## Huntington disease — HTT CAG allele classes

Source: [GeneReviews, Huntington Disease (NBK1305)](https://www.ncbi.nlm.nih.gov/books/NBK1305/) · fetched 2026-08-25 · **Tier A**

| Quantity | Value |
|---|---|
| Normal allele | **≤26 CAG** |
| Intermediate allele | **27–35 CAG** |
| Reduced-penetrance HD-causing allele | **36–39 CAG** |
| Full-penetrance HD-causing allele | **≥40 CAG** |
| Prevalence, European ancestry | **9.71:100,000** (up to **17:100,000** with multi-source ascertainment) |
| Prevalence, East Asian and African populations | **0.1–2:100,000** |
| Frequency of ≥36 CAG alleles, European ancestry | **as many as 1:400** |
| Age-at-onset variance attributed to CAG length | **up to 70%** |
| Heritable share of the residual variability | **10%–20%** |

> Unit warning: all values are **repeat units**, not base pairs. A 40-repeat allele is 120 bp of CAG tract.
> Teaching note: carrier frequency of a disease-causing allele (~1:400) exceeds disease prevalence
> (~1:10,000) by about 25-fold. Nearly the whole gap is 36–39-repeat alleles that never declare themselves.

## Repeat-expansion disorders — repeat, location and thresholds

Sources: GeneReviews chapters (Tier A, each fetched 2026-08-25) and the [STRipy STR database](https://stripy.org/database) (Tier B, fetched 2026-08-25)

| Quantity | Value | Tier | Source |
|---|---|---|---|
| *HTT* repeat motif and location | **CAG, coding exon 1** | A | [GeneReviews NBK1305](https://www.ncbi.nlm.nih.gov/books/NBK1305/) |
| *AR* (SBMA) normal / reduced-penetrance / pathogenic | **≤34 / 36–37 / ≥38** | A | [GeneReviews NBK1333](https://www.ncbi.nlm.nih.gov/books/NBK1333/) |
| *ATN1* (DRPLA) normal / intermediate / pathogenic | **6–35 / 35–47 / 48–93** | A | [GeneReviews NBK1491](https://www.ncbi.nlm.nih.gov/books/NBK1491/) |
| *ATXN1* (SCA1) full penetrance | **39–44 CAG uninterrupted by CAT** | A | [GeneReviews NBK1184](https://www.ncbi.nlm.nih.gov/books/NBK1184/) |
| *ATXN2* (SCA2) normal / at-risk / pathogenic | **≤31 / 33–34 / ≥35** | A | [GeneReviews NBK1275](https://www.ncbi.nlm.nih.gov/books/NBK1275/) |
| *ATXN3* (SCA3) normal / intermediate / pathogenic | **12–44 / 45–59 / ~60–87** | A | [GeneReviews NBK1196](https://www.ncbi.nlm.nih.gov/books/NBK1196/) |
| *CACNA1A* (SCA6) normal / pathogenic | **≤18 / 20–33** | A | [GeneReviews NBK1140](https://www.ncbi.nlm.nih.gov/books/NBK1140/) |
| *ATXN7* (SCA7) normal / mutable / reduced-penetrance / full | **7–27 / 28–33 / 34–36 / 37–460** | A | [GeneReviews NBK1256](https://www.ncbi.nlm.nih.gov/books/NBK1256/) |
| *TBP* (SCA17) normal / reduced-penetrance / full | **25–40 / 41–48 / ≥49** | B | GeneReviews NBK1438 (secondary read) |
| *DMPK* (DM1) motif and location | **CTG, 3′ UTR** | A | [GeneReviews NBK1165](https://www.ncbi.nlm.nih.gov/books/NBK1165/) |
| *DMPK* normal / premutation / pathogenic / congenital | **5–34 / 35–49 / >50 / usually >1,000** | A | [GeneReviews NBK1165](https://www.ncbi.nlm.nih.gov/books/NBK1165/) |
| *CNBP* (DM2) motif, location, pathogenic range | **CCTG, intron 1, ~75–11,000 (mean ~5,000)** | A | [GeneReviews NBK1466](https://www.ncbi.nlm.nih.gov/books/NBK1466/) |
| *FMR1* normal / grey zone / premutation / full mutation | **~5–44 / 45–54 / 55–200 / >200 (CGG, 5′ UTR)** | A | [GeneReviews NBK1384](https://www.ncbi.nlm.nih.gov/books/NBK1384/) |
| *FXN* (FRDA) motif, location, normal / pathogenic | **GAA, intron 1, 5–33 / 66–~1,300** | A | [GeneReviews NBK1281](https://www.ncbi.nlm.nih.gov/books/NBK1281/) |
| *C9orf72* normal / uncertain / pathogenic | **2–24 / 25–60 / 61 – >4,000 (GGGGCC, intron 1)** | A | [GeneReviews NBK268647](https://www.ncbi.nlm.nih.gov/books/NBK268647/) |
| *ATXN10* (SCA10) motif, location, normal / full | **ATTCT, intron 9, 10–32 / 800–4,500** | A | [GeneReviews NBK1175](https://www.ncbi.nlm.nih.gov/books/NBK1175/) |
| *ATXN8OS*/*ATXN8* (SCA8) normal / typical pathogenic | **15–50 / 54–250 combined (CTA·TAG)n(CTG·CAG)n** | A | [GeneReviews NBK1268](https://www.ncbi.nlm.nih.gov/books/NBK1268/) |
| *RFC1* (CANVAS) pathogenic motif and size | **biallelic (AAGGG)₄₀₀–₂₀₀₀₊, intron 2** | A | [GeneReviews NBK564656](https://www.ncbi.nlm.nih.gov/books/NBK564656/) |
| *DAB1* (SCA37) pathogenic allele | **(ATTTC)₃₁–₇₅ inserted inside an (ATTTT)n** | A | [Seixas et al., *AJHG* 2017](https://www.cell.com/ajhg/fulltext/S0002-9297(17)30242-2) |
| *FGF14* (SCA27B) pathogenic threshold | **≥250 GAA** (250–300 reduced penetrance; ≥300 full) | B | [Pellerin et al., *NEJM* 2023](https://www.nejm.org/doi/full/10.1056/NEJMoa2207406) |
| *ZFHX3* (SCA4) motif and product | **GGC → polyglycine, coding; pathogenic ≥42** | B | [*Nat Genet* 2024;56:1080–1089](https://www.nature.com/articles/s41588-024-01719-5) |

> Assembly note: none of these thresholds are coordinates, so no assembly applies — but any *genomic*
> coordinate for a repeat locus must name GRCh38 or T2T-CHM13 and its 0-/1-based convention, because
> STR callers differ on both.
> Unit warning: STRipy and GeneReviews disagree at *ATXN7*, *ATXN3*, *C9orf72*, *ATN1* and *AR*. Where
> they disagree, the GeneReviews value is the one recorded here.

## SCA12 — PPP2R2B repeat and thresholds

Source: [Srivastava et al., *Brain* 2017;140(1):27–36](https://academic.oup.com/brain/article/140/1/27/2670174) and [STRipy](https://stripy.org/database) · fetched 2026-08-25 · **Tier C — contested, give as a range**

| Quantity | Value | Tier | Source |
|---|---|---|---|
| Gene and locus | ***PPP2R2B*, 5q32** | B | Holmes et al. 1999; secondary reads |
| Repeat motif and position | **CAG, ~133 nt upstream of the reported transcription start site (5′ region / probable promoter)** | B | secondary reads of the *PPP2R2B* literature |
| Control repeat range | **4–31 (Srivastava cohort); 4–32 quoted elsewhere** | A | Srivastava et al. 2017 |
| Classical pathogenic threshold | **≥51** | B | STRipy; long-standing convention |
| GeneReviews SCA12 chapter | **NBK1202** — last updated **2011-11-17**, **retired 2018-12-13** ("RETIRED CHAPTER, FOR HISTORICAL REFERENCE ONLY"). While current it gave **≥51 diagnostic** in the right clinical context, normal **4–32**, and stated the threshold itself was **"not clear"**, with 40–62 alleles seen with variable, late or absent onset | B | [GeneReviews NBK1202](https://www.ncbi.nlm.nih.gov/books/NBK1202/) · fetched 2026-08-25 |
| Revised lower threshold argued | **≥43** — "the shortest pathogenic length for the SCA12 phenotype" | A | Srivastava et al. 2017 (18 patients, 16 unrelated families, CAG 43–50) |
| Repeat length vs age at onset | **Pearson r = −0.65, P < 10⁻⁴, n = 124 unrelated patients** | A | Srivastava et al. 2017 |
| Discovery | **Holmes et al., *Nat Genet* 1999;23(4):391–392** | B | citation verified by search; paper not fetched |
| Nuclear CAG **RNA foci** in SCA12 patient iPSC-derived neural stem cells, absent from controls; pull-down identifies **13 proteins binding the expanded repeat exclusively** | demonstrated in cells; **no fraction-of-cells figure and no length threshold reported** | A | Kumar et al. 2024, *iScience* 27(5):109768, PMID 38711441 |
| **RAN translation at the SCA12 locus** | demonstrated in cells and iPSC-derived neurons, in multiple frames — **polyglutamine and polyserine** from the sense strand (Delhi group), **polyalanine** from the antisense *PPP2R2B-AS1* ORF (Hopkins group), polyleucine and polycysteine absent. Frames **not reconciled between labs**; **no RAN product has been demonstrated in SCA12 human brain** | A | Kumar et al. 2024, *iScience*; Zhou et al. 2023, *Mov Disord* 38(12):2230–2240 |
| **Bidirectional transcription** at *PPP2R2B*: antisense **PPP2R2B-AS1** carries a CUG repeat, forms CUG RNA foci in SK-N-MC cells and induces apoptosis | demonstrated in cells; expanded transcripts reliably detected **only in iPSCs and mouse models**, not in post-mortem brain | A | Zhou et al. 2023, *Mov Disord* 38(12):2230–2240 |

> Teaching note: the mechanism is **not settled either**. The long-standing working model is
> *cis*-regulatory mis-setting of *PPP2R2B* expression, but RNA foci and RAN translation are now
> reported at this locus, and Kumar 2024 finds most *PPP2R2B* isoforms **down** in patient-derived
> mature neurons — which contradicts the up-regulation model the field has run on since 2010. Do not
> write "no toxic RNA, no translated product" for SCA12.

> Teaching note: the SCA12 threshold is **not settled**. Tell the reader the range (43–51), name the
> paper that moved it, and say the field has not converged as of August 2026. A course that reports
> "51" as a fact is teaching a convention as though it were a measurement.

## Human brain — neuron numbers

Source: [Azevedo et al. 2009, *J Comp Neurol* 513(5):532–41](https://pubmed.ncbi.nlm.nih.gov/19226510/) · fetched 2026-08-25 · **Tier A**

| Quantity | Value |
|---|---|
| Neurons, whole adult human brain | **≈ 86 billion** |
| Neurons, cerebellum | **≈ 69 billion** (**≈ 80%** of all brain neurons) |
| Mass, cerebellum | **≈ 154 g** (≈ 10% of brain mass) |
| Neurons, cerebral cortex incl. white matter | **≈ 16 billion** (**≈ 19%**) |
| Mass, cerebral cortex incl. white matter | **≈ 1,233 g** |
| Non-neuronal cells, whole brain | **≈ 85 billion** (glia : neuron ≈ **1 : 1**) |

> **Teaching note.** The 10:1 glia-to-neuron ratio in older textbooks is wrong; this study is where
> the correction comes from. Note also that the cerebellum holds four-fifths of the brain's
> neurons in one-tenth of its mass — "cerebellar disease" is not a disease of a small structure.

## Human cerebellum — cell counts (contested)

Source: [Nairn et al. 1989, *J Comp Neurol* 290(4):527–32](https://pubmed.ncbi.nlm.nih.gov/2613942/) · [Andersen, Korbo & Pakkenberg 1992, *J Comp Neurol* 326(4):549–60](https://pubmed.ncbi.nlm.nih.gov/1484123/) · [Azevedo et al. 2009](https://pubmed.ncbi.nlm.nih.gov/19226510/) · fetched 2026-08-25 · **Tier C**

| Quantity | Value | Tier | Source |
|---|---|---|---|
| Purkinje cells, whole cerebellum | **15.4 × 10⁶** (CV 19%, n = 12) | C | Nairn 1989, fractionator |
| Purkinje cells, whole cerebellum | **30.5 × 10⁶** (CV 0.13, n = 5) | C | Andersen 1992, optical disector |
| Granule cells, whole cerebellum | **101 × 10⁹** (CV 0.13) | C | Andersen 1992 |
| All cerebellar neurons | **≈ 69 × 10⁹** | A | Azevedo 2009, isotropic fractionator |
| Neurons, dentate nucleus | **5.01 × 10⁶** (CV 0.28) | A | Andersen 1992 |
| Cerebellar cortical surface area | **1,160 cm²** (CV 0.29) | A | Andersen 1992 |

> **This is a genuine, unresolved disagreement.** Purkinje-cell estimates differ two-fold and
> granule-cell estimates conflict with the whole-cerebellum neuron count. Quote as
> **15–30 million Purkinje cells** and **~70–100 billion granule cells**, and tell the reader the
> spread is a fact about counting methods (nucleoli vs nuclei vs homogenate), not about people.

## Human Purkinje cell — morphology

Source: [Masoli et al. 2024, *Commun Biol* 7:5](https://doi.org/10.1038/s42003-023-05689-y) · fetched 2026-08-25 · **Tier A**

| Quantity | Value |
|---|---|
| Total dendritic length, human PC | **20,167 ± 15,249 µm** |
| Total dendritic length, mouse PC | **2,783 ± 671 µm** |
| Human : mouse dendritic length | **7.24×** |
| Dendritic spines, human PC | **38,417 ± 29,210** (max 97,853) |
| Dendritic spines, mouse PC | **5,064 ± 1,342** |
| Spine density, both species | **≈ 2 spines/µm** |
| Human PCs with 2–3 primary dendritic trunks | **80%** (mouse 10.5%) |
| Dendritic complexity index, human : mouse | **27×** |

> **Tier C caveat.** A 2025 review from the same group quotes ≈ 35,000 (rodent) and ≈ 360,000
> (human) spines and human dendritic lengths of 30,000–63,645 µm (Masoli et al. 2025,
> *Front Physiol* 16:1671271). Reconstruction method drives the difference. Write "tens of
> thousands to a few hundred thousand parallel-fibre inputs per human Purkinje cell".

## Purkinje cell — firing

Source: [Arancillo et al. 2015, *J Neurophysiol* 113(2):578–91](https://pubmed.ncbi.nlm.nih.gov/25355961/) · fetched 2026-08-25 · **Tier B**

| Quantity | Value |
|---|---|
| Simple-spike rate, spontaneous in vivo | mean **≈ 40 Hz**, range **0–200 Hz** |
| Intrinsic pacemaker range, regular firing | **30–150 Hz** |
| Complex-spike (climbing-fibre) rate | **≈ 0.5–1 Hz** |

> **Teaching note.** Purkinje cells are intrinsic pacemakers — they fire with all synaptic input
> blocked (Raman & Bean 1999, *J Neurosci* 19(5):1663–74). This is the load-bearing fact behind the
> firing-energetics account of their selective vulnerability.

## Brain energetics

Source: [Attwell & Laughlin 2001, *J Cereb Blood Flow Metab* 21(10):1133–45](https://pubmed.ncbi.nlm.nih.gov/11598490/) · fetched 2026-08-25 · **Tier A (model) / B (body-share figures)**

| Quantity | Value | Tier |
|---|---|---|
| Brain share of body mass | **≈ 2%** | B |
| Brain share of body oxygen consumption | **≈ 20%** | B |
| Brain share of body glucose consumption | **≈ 25%** | B |
| Grey-matter signalling budget: action potentials | **47%** | A |
| … postsynaptic effects of glutamate | **34%** | A |
| … resting potential | **13%** | A |
| … glutamate recycling | **3%** | A |

> **Unit and scope warning.** The 47/34/13/3 split is a *calculated* budget for **rodent grey
> matter**, not a measurement of human cerebellum, and later work revised the action-potential
> share downward (mammalian spikes are more Na⁺-efficient than assumed) while raising
> non-signalling costs (Engl & Attwell 2015, *J Physiol* 593(16):3417–29). Use it for the qualitative
> claim only.

## SARA — Scale for the Assessment and Rating of Ataxia

Source: [Schmitz-Hübsch et al. 2006, *Neurology* 66(11):1717–20](https://pubmed.ncbi.nlm.nih.gov/16769946/) · item structure from [Shirley Ryan AbilityLab RehabMeasures](https://www.sralab.org/rehabilitation-measures/scale-assessment-and-rating-ataxia) · fetched 2026-08-25 · **Tier A / B**

| Quantity | Value | Tier |
|---|---|---|
| Items | **8** | B |
| Total score range | **0** (no ataxia) – **40** (most severe) | B |
| Item ranges | Gait 0–8 · Stance 0–6 · Sitting 0–4 · Speech 0–6 · Finger chase 0–4 · Nose–finger 0–4 · Fast alternating movements 0–4 · Heel–shin 0–4 | B |
| Validation cohorts | **167** and **119** SCA patients | A |
| Interrater reliability | ICC **0.98** | A |
| Test–retest reliability | ICC **0.90** | A |
| Internal consistency | Cronbach's α **0.94** | A |
| Administration time | **14.2 ± 7.5 min** (range 5–40) | A |
| Correlation, Barthel Index | r = **−0.80** | A |
| Correlation, UHDRS-IV | r = **−0.89** | A |
| Correlation, disease duration | r = **0.34** | A |
| Minimal clinically important difference | **not established** | C |

> **Two warnings.** (1) Gait (8) plus stance (6) supply **35% of the maximum score**, so SARA is
> weighted toward axial function; limb-predominant change moves it little. (2) High reliability
> with **no established MCID** means a reported point-change has no independently anchored clinical
> meaning. Reliability is not interpretability.

## Human kinases and phosphatases

Source: [Manning et al. 2002, *Science* 298(5600):1912–34](https://pubmed.ncbi.nlm.nih.gov/12471243/) · [Shi 2009, *Cell* 139(3):468–84](https://pubmed.ncbi.nlm.nih.gov/19879837/) · [Olsen et al. 2006, *Cell* 127(3):635–48](https://pubmed.ncbi.nlm.nih.gov/17081983/) · fetched 2026-08-25 · **Tier A / B**

| Quantity | Value | Tier | Source |
|---|---|---|---|
| Protein kinase genes, human | **518** (≈ 1.7% of genes) | A | Manning 2002 |
| … Ser/Thr kinases | **428** | B | Shi 2009 |
| … Tyr kinases | **90** | B | Shi 2009 |
| Protein tyrosine phosphatase genes | **107** | B | Alonso 2004 / Shi 2009 |
| Ser/Thr phosphatase **catalytic subunit** genes | **≈ 30** (PPP + PPM) | B | Shi 2009 |
| Phosphosite distribution Ser : Thr : Tyr | **≈ 86 : 12 : 2** | B | Olsen 2006 |

> **The asymmetry is the point.** 428 Ser/Thr kinases against ~30 Ser/Thr phosphatase catalytic
> subunits means phosphatase specificity cannot live in the catalytic subunit. It is built
> combinatorially by targeting subunits — which is what PP2A's B subunits are.

## PP2A — holoenzyme architecture

Source: [Sandal et al. 2021, *J Cell Sci* 134(13):jcs248187](https://journals.biologists.com/jcs/article/134/13/jcs248187/270819) · [Haanen, O'Connor & Narla 2022, *J Biol Chem* 298(12):102656](https://pmc.ncbi.nlm.nih.gov/articles/PMC9707111/) · [Xu et al. 2006, *Cell* 127(6):1239–51](https://pubmed.ncbi.nlm.nih.gov/17174897/) · fetched 2026-08-25 · **Tier A / B / C**

| Quantity | Value | Tier | Source |
|---|---|---|---|
| Composition | heterotrimer: scaffold **A** + catalytic **C** + regulatory **B** | A | Xu 2006 |
| A-subunit genes | *PPP2R1A*, *PPP2R1B* | A | Sandal 2021 |
| A-subunit structure | **15 HEAT repeats**, L-shaped superhelix | A | Xu 2006 |
| C-subunit genes | *PPP2CA*, *PPP2CB* | A | Sandal 2021 |
| B families | **B/B55** (*PPP2R2A–D*) · **B′/B56** (*PPP2R5A–E*) · **B″/PR72** (*PPP2R3A–C*) · **B‴/striatin** (*STRN*, *STRN3*, *STRN4*) | A | Sandal 2021; Haanen 2022 |
| B-subunit genes / variants | **15 genes**, ≥ **26** transcript and splice variants | B | Haanen 2022 |
| B55 fold | seven-bladed **WD40 β-propeller** with acidic top groove | A | Xu 2006 |
| Distinct holoenzymes formable | **≈ 60–100** | C | "over 60" Haanen 2022; "nearly 100" Sandal 2021 |
| PP2A share of cellular Ser/Thr dephosphorylation | **≥ 50%** in most cell types | B | Sandal 2021 |
| PP2A as fraction of total cellular protein | **up to ~1%** in some tissues | B | reviewed in Shi 2009 |

> **Range honesty.** The holoenzyme count is a combinatorial upper bound from subunit arithmetic,
> not a census. Not every combination assembles, and observed abundances differ by orders of
> magnitude (Bβ2 holoenzymes are ~10-fold rarer than Bβ1; Dagda 2003).

## *PPP2R2B* — gene and isoforms

Source: [GTEx reference API](https://gtexportal.org/api/v2/reference/gene?geneId=PPP2R2B) (GRCh38/hg38) · [OMIM #604326](https://omim.org/entry/604326) · [Dagda et al. 2003, *J Biol Chem* 278(27):24976–85](https://pubmed.ncbi.nlm.nih.gov/12716901/) · [Strack et al. 1998, *J Comp Neurol* 392(4):515–27](https://pubmed.ncbi.nlm.nih.gov/9514514/) · fetched 2026-08-25 · **Tier A**

| Quantity | Value |
|---|---|
| Product | **B55β / Bβ / PR55β**, a PP2A regulatory subunit |
| Location | **5q32**; **chr5:146,581,146–147,084,784 (GRCh38), minus strand** (GENCODE model via GTEx; the NCBI RefSeq span differs — see *SCA12 — locus anatomy* below) |
| Entrez / Ensembl | **5521** / **ENSG00000156475** |
| SCA12 CAG tract position | **133 nt upstream** of the reported transcription start site — 5′ regulatory, **not coding** |
| Isoforms | **Bβ1** (cytosolic) and **Bβ2** (outer mitochondrial membrane), differing only in the N-terminal tail |
| Effect of the Bβ2 N-terminus on catalysis | **none** — pure targeting signal; the tail alone targets GFP to mitochondria |
| Bβ2 : Bβ1 holoenzyme abundance | Bβ2 ≈ **10-fold less abundant** |
| Bβ2 N-terminal gating residues | **Ser20/21/22**; phosphorylation neutralises the import signal's +3 charge and holds Bβ2 cytosolic |
| Tissue restriction of Bβ protein | detectable **only in brain** (unlike A, Bα, C) |
| Bβ2 regional bias | **predominantly forebrain** |

> **The structural point.** The SCA12 repeat is not in the ORF and makes no polyglutamine tract.
> SCA12 is a regulatory-dosage disease; the repeat acts as a *cis* element that **up-regulates**
> *PPP2R2B* (Lin et al. 2010, *Hum Genet* 128(2):205–12).

## *PPP2R2B* — expression (corrects a common claim)

Source: [GTEx v8 median gene TPM, API `ENSG00000156475.18`](https://gtexportal.org/) · [Human Protein Atlas](https://www.proteinatlas.org/ENSG00000156475-PPP2R2B/tissue) · fetched 2026-08-25 · **Tier A / B**

| Quantity | Value | Tier |
|---|---|---|
| Highest tissue, GTEx v8 | **Brain — Frontal Cortex (BA9), 29.90 TPM** | A |
| Brain — Cortex | 24.66 TPM | A |
| **Brain — Cerebellum** | **10.16 TPM** | A |
| **Brain — Cerebellar Hemisphere** | **8.76 TPM** | A |
| Median across 41 non-brain tissues | **0.50 TPM** | A |
| Cells — Cultured fibroblasts | 0.011 TPM | A |
| HPA tissue specificity | **group enriched (brain, retina, testis)** | B |
| HPA brain-region specificity | **low region specificity**, detected in all regions | B |

> **Correction.** *PPP2R2B* is strongly **brain**-enriched but **not cerebellum**-enriched:
> cerebellum ranks below every cortical and basal-ganglia region GTEx samples, and frontal cortex
> is ~3× higher. The cerebellar phenotype of SCA12 is therefore **not** explained by where the gene
> is transcribed — it is an instance of selective neuronal vulnerability, not a solution to it.
>
> **Unknown, stated as unknown.** Bulk cerebellar RNA-seq is dominated by granule cells, which
> outnumber Purkinje cells by ~10³–10⁴. These data cannot rule out Purkinje-cell-specific
> enrichment; they rule out cerebellum-level enrichment. No published single-nucleus analysis of
> *PPP2R2B* by cerebellar cell type was found.

## PP2A — tau phosphatase activity

Source: [Liu et al. 2005, *Eur J Neurosci* 22(8):1942–50](https://pubmed.ncbi.nlm.nih.gov/16262633/) · fetched 2026-08-25 · **Tier A**

| Quantity | Value |
|---|---|
| PP2A share of total tau phosphatase activity, human brain | **≈ 71%** |
| PP1 | **≈ 11%** |
| PP5 | **≈ 10%** |
| PP2B (calcineurin) | **≈ 7%** |
| *K*<sub>m</sub>, tau dephosphorylation by PP1 / PP2A / PP5 | **8–12 µM** (≈ intraneuronal tau concentration) |
| *K*<sub>m</sub>, PP2B | **5-fold higher** |
| In Alzheimer's disease brain | total and PP2A/PP5 tau-phosphatase activity **decreased**; PP2B increased |

> **Why the *K*<sub>m</sub> matters.** With *K*<sub>m</sub> near the physiological substrate
> concentration, PP2A's flux tracks its abundance — the enzyme is neither saturated nor idle. That
> is the enzymological reason a *dosage* change in a PP2A subunit is not automatically buffered.

## PP2A — DRP1 and mitochondrial fission

Source: [Dickey & Strack 2011, *J Neurosci* 31(44):15716–26](https://pubmed.ncbi.nlm.nih.gov/22049414/) · [Merrill, Slupe & Strack 2013, *FEBS J* 280(2):662–73](https://pmc.ncbi.nlm.nih.gov/articles/PMC3549015/) · fetched 2026-08-25 · **Tier A**

| Quantity | Value |
|---|---|
| DRP1 inhibitory phosphosite | **Ser637** (human) = **Ser656** (rat) |
| Kinase (inhibits fission) | **PKA**, anchored by **AKAP1** at the outer mitochondrial membrane |
| Phosphatases (promote fission) | **PP2A/Bβ2** and **calcineurin (PP2B)** |
| Consequence of PP2A/Bβ2 action in neurons | mitochondria fragment and depolarise, are depleted from dendrites; dendritic outgrowth stunted, synapse number rises |
| Bβ2 targeting mechanism | cryptic mitochondrial import signal + unfolding-resistant arrest domain, stalling the protein in the outer membrane |

## PP2A — regulation and inhibitors

Source: [Haanen et al. 2022, *J Biol Chem* 298(12):102656](https://pmc.ncbi.nlm.nih.gov/articles/PMC9707111/) · [Tanimukai et al. 2005, *Am J Pathol* 166(6):1761–71](https://pubmed.ncbi.nlm.nih.gov/15920161/) · [Junttila et al. 2007, *Cell* 130(1):51–62](https://pubmed.ncbi.nlm.nih.gov/17632056/) · fetched 2026-08-25 · **Tier A / B**

| Quantity | Value | Tier |
|---|---|---|
| Methylated residue on PP2A-C | **Leu309** (C-terminal carboxylate) | B |
| Methyltransferase | **LCMT1**; methylation permits **B55 and B56** binding | B |
| Methylesterase | **PME-1**; demethylation disfavours B binding and protects free C from proteasomal degradation | B / A |
| Biogenesis chaperones | **α4 (IGBP1)**, **PTPA** | B |
| Endogenous inhibitors | **I₁PP2A (ANP32A)**, **I₂PP2A (SET)** — both up-regulated in AD neocortex; I₂PP2A relocates nucleus → cytoplasm and its 39-kDa form is cleaved to ~20 kDa in AD | A |
| Oncogenic inhibitor | **CIP2A** — blocks PP2A toward c-Myc Ser62, stabilising c-Myc | A |
| Pharmacological inhibitors | okadaic acid, microcystin-LR (active-site binders; co-crystal structures available) | A |

> **Regulatory framing.** PP2A is controlled chiefly by **which holoenzyme assembles**, not by
> dialling a catalytic rate. Methylation state, chaperone availability and subunit stoichiometry
> all act on assembly — which is why a change in the amount of one B subunit is a credible
> pathogenic mechanism.

## PP2A B-subunit dosage — hypothesis, not fact

Source: reasoning from [Xu et al. 2006](https://pubmed.ncbi.nlm.nih.gov/17174897/), [Sandal et al. 2021](https://journals.biologists.com/jcs/article/134/13/jcs248187/270819), [Haanen et al. 2022](https://pmc.ncbi.nlm.nih.gov/articles/PMC9707111/), [Dagda et al. 2003](https://pubmed.ncbi.nlm.nih.gov/12716901/) · assessed 2026-08-25 · **Tier C**

| Claim | Status |
|---|---|
| Substrate specificity and targeting reside in the B subunit | **Established** (structural + functional) |
| 15 B-subunit genes compete for cores built from 2 A and 2 C genes | **Established** (gene counts) |
| Holoenzyme assembly is a methylation- and chaperone-gated binding equilibrium | **Established** |
| Therefore raising one B subunit displaces others from a limiting A–C core pool | **Not demonstrated quantitatively** — asserted in reviews, follows from the above, but no primary measurement of the free-core pool or of endogenous B-subunit displacement at disease-relevant dosage was found |
| Bβ2's pro-apoptotic effect requires holoenzyme assembly (assembly-defective mutant is inert) | **Established** (Dagda 2003) — consistent with, but not proof of, competition |

> **Write it as a hypothesis with its logic exposed**, and name the experiment that would settle
> it: quantitative interaction proteomics of the A subunit across a *PPP2R2B* dosage series,
> measuring the full B-subunit occupancy distribution rather than the overexpressed subunit alone.

## Somatic instability and mismatch repair in Huntington disease

Sources: GeM-HD Consortium papers and Handsaker et al. 2025 · fetched 2026-08-25

| Quantity | Value | Tier | Source |
|---|---|---|---|
| GeM-HD 2015: chromosome 15 locus, effect 1 | **hastens onset by 6.1 years** | B | GeM-HD, *Cell* 2015;162(3):516–526 |
| GeM-HD 2015: chromosome 15 locus, effect 2 | **delays onset by 1.4 years** | B | GeM-HD, *Cell* 2015;162(3):516–526 |
| GeM-HD 2015: chromosome 8 locus | **hastens onset by 1.6 years** | B | GeM-HD, *Cell* 2015;162(3):516–526 |
| GeM-HD 2019: cohort size | **9,064 unique HD subjects** of European ancestry | A | GeM-HD, *Cell* 2019;178(4):887–900 |
| GeM-HD 2019: modifier genes | ***FAN1*** (chr15, top locus), ***MSH3*/*DHFR*** (chr5), ***PMS1*** (chr2), ***MLH1*** (chr3), ***PMS2*** (chr7), ***LIG1*** (chr19), ***RRM2B*/*UBR5*** (chr8) — all DNA repair | A | GeM-HD, *Cell* 2019 |
| GeM-HD 2019: the CAA result | **loss of the CAACAG → earlier onset; CAACAG duplication (more glutamines) → later onset.** Uninterrupted CAG length, not polyQ length, drives timing | A | GeM-HD, *Cell* 2019 |
| Somatic threshold in striatal projection neurons | **≈150 CAG**; SPNs below it look transcriptionally normal, above it lose identity | B | Handsaker et al., *Cell* 2025;188(3):623–639.e19 |
| Somatic expansion and onset, human brain | longer somatic expansion in brain associates with **earlier** onset | A | Swami et al., *Hum Mol Genet* 2009;18(16):3039–3047 |
| Age-dependent somatic expansion, mechanism | **OGG1-initiated** "toxic oxidation" cycle in post-mitotic cells | A | Kovtun et al., *Nature* 2007;447:447–452 |

> **Do not quote per-locus effect sizes in years from the 2019 paper.** Two automated reads of the
> PMC full text returned mutually inconsistent values for the same table rows, and the PMC table
> endpoint was CAPTCHA-gated on 2026-08-25. The 2015 figures above are safe; the 2019 per-haplotype
> figures must be read from Table 1 by eye before any chapter uses them.

## Interruptions, premutations and reduced penetrance

Sources: GeneReviews chapters · fetched 2026-08-25 · **Tier A** unless marked

| Quantity | Value | Tier | Source |
|---|---|---|---|
| HD reduced-penetrance allele penetrance (36–38 CAG) | **0.2%–2% across a typical life span** | B | GeneReviews NBK1305 |
| SBMA: clinical prevalence vs carrier frequency | **~1:300,000 males clinically, but 1:6,887 males carry a pathogenic expansion** | A | GeneReviews NBK1333 |
| *FMR1* AGG interruptions | occur about every **9–10 CGG**; presence reduces risk of expansion to full mutation for alleles **<100 repeats** | A | GeneReviews NBK1384 |
| *FMR1* grey-zone expansion risk | about **14%** of 45–54-repeat alleles expand into the premutation range on maternal transmission | A | GeneReviews NBK1384 |
| FXTAS penetrance in male premutation carriers | **17%** (50–59 y), **38%** (60–69 y), **47%** (70–79 y), **75%** (≥80 y) | A | GeneReviews NBK1384 |
| FXTAS penetrance in female premutation carriers >50 y | **16%–20%** (vs ~40% in males) | A | GeneReviews NBK1384 |
| *ATXN1* CAT interruptions | a 36–44 CAG allele **with** CAT is normal; **without** CAT it is mutable or pathogenic | A | GeneReviews NBK1184 |
| *ATXN10* ATCCT interruption | associated with **higher prevalence of epileptic seizures**; interrupted alleles show anticipation with paradoxical repeat **contraction** | A | GeneReviews NBK1175 |
| SCA8 penetrance | **reduced penetrance at repeats of all sizes**; alleles 71 – >1,300 occur in affected and unaffected people | A | GeneReviews NBK1268 |
| DM2 genotype–phenotype | **no significant correlation** between CCTG size and age of onset or severity; anticipation not confirmed | A | GeneReviews NBK1466 |
| SCA6 anticipation | **not observed** | A | GeneReviews NBK1140 |
| DRPLA anticipation | offspring onset **~26–29 y earlier** than affected fathers, **~14–15 y earlier** than affected mothers | A | GeneReviews NBK1491 |
| DM1 transmitted expansion size | paternal median **425** (range 70–2,000); maternal median **200** (range 57–1,400) | A | GeneReviews NBK1165 |
| FRDA onset by GAA1 length | GAA1 **<700 → mean onset 18 y**; **>700 → mean onset 9.7 y**; <500 → onset >25 y; <300 → onset >40 y | A | GeneReviews NBK1281 |
| FRDA carrier frequency | **1/60–1/100** | A | GeneReviews NBK1281 |
| C9orf72 share of ALS/FTD | **30–50%** familial ALS, **4–10%** sporadic ALS, **~25%** familial FTD | A | GeneReviews NBK268647 |
| RFC1 share of adult-onset ataxia | **14%–22%**; **82%–97%** of full-CANVAS phenotypes | A | GeneReviews NBK564656 |
| SCA3 share of dominant ataxia families | **20%–50%** worldwide; **21%–25%** in the US and Canada | A | GeneReviews NBK1196 |

> Teaching note: "premutation", "intermediate allele" and "reduced-penetrance allele" are three
> different things. An intermediate allele is unstable but harmless to its carrier; a premutation
> (the *FMR1* 55–200 case) causes a **different disease** by a mechanism the full mutation cannot
> use; a reduced-penetrance allele (HD 36–39) is the disease allele in someone who may never
> manifest.

## SCA12 — locus anatomy

Source: [STRchive `SCA12_PPP2R2B`, STRchive-loci.json](https://strchive.org/loci/sca12_ppp2r2b/) · fetched 2026-08-25 · **Tier A**

| Quantity | Value |
|---|---|
| Gene | ***PPP2R2B*** |
| Cytoband | **5q32** |
| Gene strand | **minus** |
| Repeat, GRCh38 | **chr5:146,878,728–146,878,759** |
| Repeat, GRCh37 | **chr5:146,258,291–146,258,322** |
| Repeat, T2T-CHM13 | **chr5:147,414,734–147,414,765** |
| Reference copy number | **10.7** |
| Motif, plus/reference strand | **GCT** (i.e. the tract reads CTG-like on the plus strand) |
| Motif, gene/sense strand | **AGC** (i.e. the tract reads CAG-like on the mRNA) |
| Region annotation | **5′ UTR** |
| Gene span, GRCh38 | **chr5:146,580,742–147,081,520** |
| RefSeq transcript variants | **10** |

> **Unit and strand warning.** `(CAG)n`, `(CTG)n`, `(AGC)n` and `(GCT)n` in the SCA12 literature all
> name the *same* ~32-bp reference element (30 bp as the ExpansionHunter catalog bounds it, 32 bp as
> STRchive does). *PPP2R2B* is on the minus strand, so the disease-relevant
> CAG reading is on the mRNA and the plus-strand genome browser shows CTG; a trinucleotide repeat has
> no canonical phase, so databases differ by a cyclic rotation. Never infer a different locus from a
> different motif spelling.

## SCA12 — allele ranges (sources disagree)

| Quantity | Value | Tier | Source |
|---|---|---|---|
| Normal alleles | **4–32** | B | GeneReviews SCA12 chapter (retired 2018-12-13), fetched 2026-08-25 |
| Normal alleles | **6–32** | A | STRchive JSON, fetched 2026-08-25 |
| Normal alleles | **4–31** | A | Srivastava et al. 2017, *Brain* 140(1):27–36 |
| Benign call anchor | **7–28** | A | ClinVar RCV000005966, `NM_181675.3(PPP2R2B):c.27CAG[(7_28)]`, fetched 2026-08-25 |
| Intermediate alleles | **40–49** | A | STRchive JSON, fetched 2026-08-25 |
| "Intermediate pathogenic" | **43–50** | A | Srivastava et al. 2017, *Brain* 140(1):27–36 |
| Pathogenic alleles | **51–78** | A | STRchive JSON; GeneReviews (retired) gives ≥51 as diagnostic |
| Proposed lowered threshold | **≥43** | A | Srivastava et al. 2017, *Brain* 140(1):27–36 |
| Shortest reported pathogenic allele | **46** | A | Dong, Wu & Wu 2015, *Parkinsonism Relat Disord* 21(4):398–401 |
| Shortest reported symptomatic alleles | **40 and 42** | A | Ganaraja et al. 2022, *Tremor Other Hyperkinet Mov* 12:13 |
| Index-family expanded alleles | **66–78** (fully penetrant) | B | GeneReviews SCA12 chapter (retired) |
| Indian founder expanded alleles | **51–69** | A | Bahl et al. 2005, *Ann Hum Genet* 69(Pt 5):528–534 |
| Non-penetrant / very-late-onset carriers | reported at **45–62** | B | GeneReviews SCA12 chapter (retired) |
| Unaffected carriers within an affected family | **CAG-39** | A | Srivastava et al. 2017, *Brain* 140(1):27–36 |

> **Teaching note.** ≥51 CAG with a compatible phenotype is diagnostic and ≤31 is normal — everything
> from 32 to 50 is contested territory, and the boundary has moved downward twice since 2015 (46, then
> 43, then symptomatic cases at 40). Report a 44-repeat allele as "in a range where pathogenicity is
> reported but not established", never as "negative".

## SCA12 — epidemiology

| Quantity | Value | Tier | Source |
|---|---|---|---|
| Fraction of Indian ataxia referrals (pan-India, ~5,600 patients, 10 yr) | **8.6% (490)** | A | Sharma et al. 2022, *Adv Genet* 3(2):2100078 |
| SCA2 in the same cohort, for comparison | **8.5% (482)** | A | Sharma et al. 2022 |
| Fraction of AD ataxia at AIIMS North India | **~16% (20/124)** | A | Bahl et al. 2005, *Ann Hum Genet* 69(Pt 5):528–534 |
| Agarwal ancestry in a 49-patient Indian cohort | **79.6%** (10.2% explicitly non-Agarwal) | A | Ganaraja et al. 2022, *Tremor* 12:13 |
| Founder haplotype association with expanded alleles | **P = 0.000**, 20 families, markers spanning ~137 kb | A | Bahl et al. 2005 |
| Independent origins of the expansion | **≥2** (Indian founder haplotype absent from the American pedigree) | A | Bahl et al. 2005 |
| Yield in a European ataxia screen | **1 family / 247 index cases** | A | Fujigasaki et al. 2001, *Ann Neurol* 49(1):117–121 |
| *PPP2R2B* expansions in familial essential tremor probands | **1 / 515** (of 6/515 pathogenic STR expansions total) | A | Zhou X et al. 2024, *Brain Commun*, PMID 38961870 |
| Population prevalence per 100,000 | **no published estimate** | — | STRchive `prevalence: null`; absent from GeneReviews and Orphanet |

> **Teaching note.** "Second commonest SCA in India" is the familiar line and comes from a 124-family
> AIIMS series. The largest series (Sharma 2022, ~5,600 referrals) puts SCA12 fractionally *ahead* of
> SCA2 — 8.6% vs 8.5%, a margin inside the noise. Say "SCA12 and SCA2 are jointly the commonest SCAs
> in Indian referral cohorts", and never convert a referral fraction into a population prevalence.

## SCA12 — clinical phenotype

Source: [Ganaraja et al. 2022, *Tremor Other Hyperkinet Mov* 12:13](https://tremorjournal.org/articles/10.5334/tohm.686) (n = 49 from 42 families) · fetched 2026-08-25 · **Tier A**

| Quantity | Value |
|---|---|
| Tremor at presentation | **95.9%** |
| Ataxia at presentation | **73.5%** |
| Head tremor | **55.1%** |
| Voice tremor | **42.8%** |
| Impaired tandem gait | **89.8%** |
| Dysmetria | **75.5%** |
| Dysarthria | **57.1%** |
| Cognitive dysfunction | **22.4%** |
| Psychiatric disturbance | **8.1%** |
| Mean age at onset | **46.38 ± 11.7 yr** |
| Mean expanded repeat length | **53.26 ± 6.10** |
| Positive family history | **93.8%** |
| MRI: cerebellar atrophy only | **34.7%** |
| MRI: cerebral atrophy only | **16.3%** |
| MRI: both | **34.7%** |
| MRI: **normal** | **6.1%** |

| Quantity | Value | Tier | Source |
|---|---|---|---|
| Cognitive impairment (dedicated non-motor study, n=34) | **61.76%** | A | Basu et al. 2024, *Front Neurol* 15:1464149 |
| Psychiatric disorders (n=21) | **67%** | A | Choudhury et al. 2018, *Mov Disord Clin Pract* 5(1):39–46 |
| Tremor as first symptom (n=21) | **90%** | A | Choudhury et al. 2018 |
| Mean age at onset (n=21) | **51.33 ± 8.98 yr**, range 41–69 | A | Choudhury et al. 2018 |
| Repeat length vs age at onset | **r = −0.760, P = 0.0001** | A | Choudhury et al. 2018 |
| Repeat length vs age at onset | **no significant correlation** | A | Ganaraja et al. 2022 |
| Typical onset window | **26–50 yr**; full range **8–62 yr** | A | STRchive JSON |
| Index-family onset | "fourth decade", mean **34–38 yr** | B | GeneReviews SCA12 chapter (retired) |
| Life expectancy | **believed not shortened; no survival study published** | C | National Ataxia Foundation, fetched 2026-08-25 |

> **Teaching note.** The two Indian cohorts disagree about whether repeat length predicts onset age
> (r = −0.76 vs none) and the index family looks a decade or two younger at onset than any Indian
> series. Both disagreements are live. Quote a cohort, never a consensus.

> **Diagnostic warning.** 6.1% of a genetically confirmed SCA12 cohort had a **normal MRI**, and two
> short-duration patients in a second cohort had no atrophy. Imaging supports the diagnosis; it never
> excludes it.

## SCA12 — anticipation and instability (contested)

| Quantity | Value | Tier | Source |
|---|---|---|---|
| Anticipation | **"Insufficient evidence for anticipation"** | A | GeneReviews *Hereditary Ataxia Overview*, last revised **2026-07-09**, fetched 2026-08-25 |
| Anticipation | "a moderate degree of anticipation has been observed" | B | GeneReviews SCA12 chapter, retired 2018-12-13 |
| Germline instability | "modestly unstable, length variations of a **few triplets** among sibship members" | B | GeneReviews SCA12 chapter (retired) |
| Parent of origin (n=21) | **7 maternal, 7 paternal, 1 biparental** — no bias detected | A | Choudhury et al. 2018 |
| Somatic mosaicism in brain | detected across regions; **cerebellum showed the least** instability, with higher methylation and lower *PPP2R2B* expression | A | Parthaje et al. 2025, *Cerebellum* 24(3):60 — **n = 1 brain** |
| Biallelic carriers | **CAG-45/45** and **CAG-42/51**; no difference from heterozygous CAG-51 | A | Srivastava et al. 2017, *Brain* 140(1):27–36 |

> **Teaching note.** SCA12 is the counter-example to "repeat disease ⇒ anticipation ⇒ paternal bias."
> Current GeneReviews says the evidence for anticipation is insufficient, the only parent-of-origin
> dataset is 7-vs-7 in 21 patients, and the single brain studied showed *least* somatic instability in
> the cerebellum — the opposite of the striatal pattern in Huntington disease. The mechanistic rules
> learned from HTT and DMPK do not transfer automatically.

## SCA12 — mechanism evidence (nothing established)

| Claim | Status | Tier | Source |
|---|---|---|---|
| Repeat region has promoter activity that **increases with repeat length** | demonstrated in reporter assays | A | O'Hearn et al. 2015, *Mov Disord* 30(13):1813–1824 |
| Repeat acts as a *cis* element up-regulating *PPP2R2B*; CREB1/SP1 up, TFAP4 down | demonstrated in cells | A | Lin et al. 2010, *Hum Genet* 128(2):205–212 |
| Expansion raises the 7B7D transcript and **Bβ1** protein, and yields a **polyserine** tract that triggers apoptosis | demonstrated in cell models | A | Zhou et al. 2024, *Mov Disord* 39(10):1886–1891 |
| Most *PPP2R2B* isoforms are **down**-regulated in patient-derived mature neurons | demonstrated — **contradicts the overexpression model** | A | Kumar et al. 2024, *iScience* 27(5):109768 |
| Bβ2 targets PP2A to mitochondria and promotes apoptosis | demonstrated (overexpression) | A | Dagda et al. 2003, *JBC* 278(27):24976–24985 |
| Bβ2 dephosphorylates Drp1 S637, drives fission, antagonises neuronal survival; silencing Bβ2 is protective | demonstrated (overexpression/knockdown) | A | Dagda et al. 2008, *JBC* 283(52):36241–36248 |
| *Drosophila* *ppp2r2b* overexpression → neurodegeneration, mitochondrial fragmentation, ROS; rescued by antioxidants and SOD2 | demonstrated in fly | A | Wang et al. 2011, *JBC* 286(24):21742–21754 |
| The SCA12 expansion specifically raises **Bβ2** in patient neurons | **not demonstrated** — the repeat is 5′ to the Bβ1 first exon, not Bβ2's | — | inference from Dagda 2003 + Zhou 2023 |
| Nuclear **CAG RNA foci** in patient iPSC-derived neural stem cells; 13 proteins bind the expanded repeat exclusively | demonstrated | A | Kumar et al. 2024, *iScience* |
| **CUG RNA foci** from the antisense transcript **PPP2R2B-AS1** | demonstrated in SK-N-MC cells | A | Zhou et al. 2023, *Mov Disord* 38(12):2230–2240 |
| **RAN translation at the SCA12 locus** — polyQ and polySer (sense, Delhi group); polyAla (antisense, Hopkins group); polyLeu and polyCys absent | demonstrated in cells and iPSC neurons; **frames not reconciled between labs** | A | Kumar 2024; Zhou 2023 |
| Any RAN product in **SCA12 human brain tissue** | **never shown** | — | negative: Zhou 2023 could not reliably detect expanded transcript in one post-mortem brain |
| **Tau** dephosphorylation as an SCA12 mechanism | **proposed in a 2001 review, never tested in any SCA12 system**; the one autopsy series found **tau-negative** inclusions | — | Holmes et al. 2001, *Brain Res Bull* 56(3–4):397–403; O'Hearn et al. 2015 |
| Autopsy findings | enlarged ventricles, **marked cerebral cortical atrophy**, Purkinje cell loss, less prominent cerebellar/pontine atrophy, **ubiquitin-positive intranuclear inclusions negative for polyQ, α-synuclein, tau and TDP-43** | A | O'Hearn et al. 2015 — **a handful of brains** |
| Overall mechanism confidence | STRchive gene–disease evidence score **8.5 / 18 ("Moderate")**; mechanism "incompletely established" | A | STRchive curation page, fetched 2026-08-25 |

> **Teaching note.** SCA12 is the honest counterweight to the tidy repeat-disease narrative. Twenty-seven
> years after the gene was found, the field has five plausible mechanisms — promoter-driven
> overexpression, Bβ2-driven mitochondrial fission, sense RNA toxicity, antisense RNA toxicity, and RAN
> translation in at least three frames — supported almost entirely by overexpression constructs, cell
> lines, one fly model, iPSC neurons and a handful of autopsy brains. Two of the strongest results point
> in opposite directions (Bβ1 up in Zhou 2024, isoforms down in Kumar 2024). "We do not know" is the
> correct answer, and it is not a gap in the teaching — it is the lesson.

## SCA12 — therapy and trial readiness

| Quantity | Value | Tier | Source |
|---|---|---|---|
| Published ASO or RNA-targeting therapeutic for *PPP2R2B* | **none** | A | directed Europe PMC search, 2026-08-25, zero hits |
| Disease-modifying clinical trial in SCA12 | **none found** | A | same search |
| Randomised trial of propranolol | **n = 60**, extended-release propranolol to **240 mg/day** vs placebo, 8 weeks; significant reduction in TETRAS PS, improved ADL, SARA and SF-36; no safety discontinuations | A | Mohapatra et al. 2026, *Mov Disord* 41(2):373–383 |
| Longitudinal progression data | 3 patients over 5–6 yr; gait variability (step length, stance time, step time) progressed | A | Siddique et al. 2021, *Clin Park Relat Disord* 5:100102 |
| Objective motor biomarker | ML on reaching kinematics separates SCA12 from essential tremor at **83.3%** accuracy | A | Bayen et al. 2026, *Cerebellum* 25(4):92 |
| Candidate plasma biomarker | **Aβ40 decreased, Aβ42/Aβ40 ratio increased** | A | Banerjee et al. 2026, *Cerebellum* 25(3):75 |
| Candidate blood transcript biomarker | 5 mitochondrial quality-control genes down in PBMCs | A | Ansari et al. 2026, *Parkinsonism Relat Disord* 145:108228 |
| Multi-site prospective natural-history cohort with annualised SARA rates | **none found** | A | directed search, 2026-08-25 |

> **Teaching note.** SCA12 in 2026 has a positive randomised trial — of a beta-blocker for tremor. That
> is symptom control, not disease modification. The gap between "we can measure this disease well enough
> to run an RCT" and "we have anything to give it" is the entire distance between a trial-ready
> phenotype and a druggable mechanism.

## SCA12 locus — genomic definition (GRCh38)

Source: [Illumina ExpansionHunter hg38 variant catalog](https://raw.githubusercontent.com/Illumina/ExpansionHunter/master/variant_catalog/hg38/variant_catalog.json) · fetched 2026-08-25 · **Tier A**

| Quantity | Value |
|---|---|
| Catalog entry (0-based half-open) | **chr5:146878727-146878757**, LocusStructure `(GCT)*` |
| Same interval, 1-based (samtools form) | **chr5:146,878,728–146,878,757 (GRCh38)** |
| Reference allele | **10 repeat units** (30 bp) |
| gnomAD v4 API main_reference_region (cross-check) | chr5:146878727-146878757 · fetched 2026-08-25 |
| STRchive interval (cross-check) | chr5:146878727-146878759 · [strchive.org/loci/sca12_ppp2r2b](https://strchive.org/loci/sca12_ppp2r2b/) |

> The catalog motif GCT is the **plus-strand** reading; *PPP2R2B* is transcribed from the
> minus strand, where the repeat reads CAG. STRchive annotates the repeat as 5'UTR; the
> gnomAD v4 API annotates the same interval "coding: polyserine" against a different
> transcript — which transcript the repeat is "in" is annotation-dependent. Teach the
> disagreement.

## Repeat-genotyping tools — versions and platforms

Source: GitHub releases API + bioconda package API, per-tool repos ([ExpansionHunter](https://github.com/Illumina/ExpansionHunter), [REViewer](https://github.com/Illumina/REViewer), [ExpansionHunterDenovo](https://github.com/Illumina/ExpansionHunterDenovo), [STRling](https://github.com/quinlan-lab/STRling), [GangSTR](https://github.com/gymreklab/GangSTR), [TRGT](https://github.com/PacificBiosciences/trgt)) · fetched 2026-08-25 · **Tier A**

| Quantity | Value |
|---|---|
| ExpansionHunter latest release | **v5.0.0** (2021-08-20); bioconda incl. osx-arm64 |
| Loci in default hg38 catalog | **31**, including PPP2R2B |
| REViewer latest release | **v0.2.7** (2022-02-02); **repo archived**; bioconda osx-64/linux only |
| ExpansionHunter Denovo latest | **v0.9.0** (2020-03-04); bioconda linux only |
| STRling latest | **v0.6.0** (2025-12-06); bioconda linux-64 only |
| GangSTR latest | **v2.5** (2021-01-29); bioconda incl. osx-arm64 |
| TRGT latest | **v5.1.0** (2026-06-10); bioconda linux-64 only |

> Versions move; re-check dates before republishing. The archived status of REViewer is a
> teaching point about clinical-bioinformatics tool lifecycles, not a reason to drop it.

## Lab-11 public data — URLs, sizes, executed results

Source: HEAD requests + executed samtools/ExpansionHunter runs on this machine · 2026-08-25 · **Tier A**

| Quantity | Value |
|---|---|
| HG00096 30x CRAM (AWS mirror) | **15.7 GB** — https://1000genomes.s3.amazonaws.com/1000G_2504_high_coverage/data/ERR3240114/HG00096.final.cram |
| Its .crai index | **1.4 MB** |
| Reads in chr5:146877000-146880000 (executed) | **888**, all **150 bp**; region BAM 145 KB |
| ExpansionHunter genotype of HG00096 at PPP2R2B (executed) | **10/14** GCT units (CI 10-10/14-14; 12+14 spanning reads; 0 IRRs) |
| chr5 reference slice via EBI CRAM registry (REF_PATH) | **173 MB** cached, fetched automatically by MD5 |
| Full GRCh38_full_analysis_set_plus_decoy_hla.fa (alternative) | **3.26 GB** |
| GIAB HG002 HiFi GRCh38 BAM | **119.8 GB** (bai 23.8 MB) — region extraction: 69 reads, mean **14,552 bp**, 9 s |
| HG002 source material | DNA extracted from the EBV-immortalised B-lymphoblastoid cell line **GM24385** (Coriell) — NIST RM 8391 certificate · **Tier A** |
| HG002 repeat by direct count (executed) | 53 spanning HiFi reads, modal **10 CTG units** (≈10/10) |
| GIAB HG002 ONT-UL GRCh38 BAM | **187.5 GB** (bai 54.6 MB) — 41 reads over the repeat, counted in 11 s |
| Whole-lab download budget | **≈300 MB** |

> `samtools view -c <URL> region` works with no reference (counting never decodes bases);
> extracting sequences from CRAM without `REF_PATH` fails with
> `Unable to fetch reference` — run the failure first, then set
> `REF_PATH=...:https://www.ebi.ac.uk/ena/cram/md5/%s`. Cohort: 3,202 samples at 30x,
> NovaSeq 2×150 bp (Byrska-Bishop 2022, *Cell* 185:3426).

## *PPP2R2B* expression — GTEx v10

Source: [GTEx v10 gene median TPM file](https://storage.googleapis.com/adult-gtex/bulk-gex/v10/rna-seq/GTEx_Analysis_v10_RNASeQCv2.4.2_gene_median_tpm.gct.gz) (downloaded, 8.8 MB) and [GTEx portal API v2](https://gtexportal.org/api/v2/expression/medianGeneExpression?gencodeId=ENSG00000156475.19&datasetId=gtex_v10) · fetched 2026-08-25 · **Tier A**

| Quantity | Value |
|---|---|
| Genes × tissue columns in the median-TPM file | **59,033 × 68** (54 primary tissues + 14 LCM sub-columns) |
| *PPP2R2B* median TPM, Brain_Frontal_Cortex_BA9 | **29.71** (highest tissue) |
| *PPP2R2B* median TPM, Brain_Cerebellum / Cerebellar_Hemisphere | **10.02 / 8.78** |
| *PPP2R2B* median TPM, Whole_Blood / Liver / Muscle_Skeletal | **0.40 / 0.05 / 0.04** |
| Annotated transcripts returned by the transcript API | **21**; top cerebellar isoform ENST00000504198.5 at **6.26 TPM** |
| Full transcript-TPM matrix (do NOT assign) | **4.34 GB**; no median-transcript flat file exists in the v10 bucket |

> GTEx v10 released Nov 2024 (AnVIL announcement); ~12% more RNA-seq samples than v8
> (**Tier B**). Numbers above are v10 and will change with any future release — name the
> version wherever they appear.

## Lab-12 single-cell data — Siletti human brain atlas

Source: [CZ CELLxGENE curation API, collection 283d65eb-dd53-496d-adb7-7570c7caa443](https://api.cellxgene.cziscience.com/curation/v1/collections/283d65eb-dd53-496d-adb7-7570c7caa443) · fetched 2026-08-25 · **Tier A**

| Quantity | Value |
|---|---|
| Atlas | Human Brain Cell Atlas v1.0 (Siletti et al. 2023, *Science* 382:eadd7046) |
| Cerebellar Vermis (CBV) dissection h5ad | **71,874 cells, 431 MB**, direct download, no registration |
| Cerebellum lateral hemisphere (CBL) h5ad | 28,028 cells, 160 MB |
| Supercluster: Cerebellar inhibitory h5ad | 14,411 cells, 150 MB |

> Direct URLs are content-addressed (datasets.cellxgene.cziscience.com/&lt;id&gt;.h5ad) and may
> rotate on dataset revision — re-resolve via the collection page if a 404 appears. The
> zero-install fallback is the cellxgene Explorer on the same collection.

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
