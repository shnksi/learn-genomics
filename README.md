# Genetics & Genomics: zero to third-year

A self-contained curriculum that takes you from **no biology at all** to a full third-year
undergraduate grounding in **classical, molecular and evolutionary genetics** — transmission
and mapping, the molecular machinery, bacterial and phage genetics, developmental genetics,
mutation and recombination, population and quantitative theory — with **human and
computational genomics built on top of it**.

62 chapters, 16 problem sets with worked solutions, 11 hands-on computational labs, and
question banks for spaced repetition.

**What it is not is a laboratory course.** All 11 labs are computational — real public data,
real tools, run on your own machine — and there is no bench work anywhere in it. For a reader
who already programs, that is the right trade and the labs teach a genuine skill. But a
conventional genetics degree weights wet-lab practical work heavily, and this does not
replace it: you will finish able to reason about a cloning strategy, a complementation test
or a knockout mouse — and without ever having held a pipette.

## Who this is written for

Someone who **can already program**, has only **basic statistics**, and knows **no biology**.

That shapes everything. Where the genomics gets hard, it reaches for things you already own
as a programmer:

| Concept | Explained via |
|---|---|
| The FM-index behind read aligners | Suffix arrays and the Burrows–Wheeler transform |
| Gene finding | A state machine over a sequence — a hidden Markov model |
| Genome assembly | Traversing a de Bruijn graph, and why repeats make it hard in practice |
| Linkage disequilibrium | Correlation between two columns of a genotype matrix |
| Hardy–Weinberg equilibrium | A fixed point reached in one generation, and what perturbs it |

**The statistics you are not assumed to have, this curriculum teaches.** Genomics is a
statistical subject — variance, likelihood, regression and multiple testing are load-bearing in
most of the later chapters, and hand-waving them produces someone who can run a pipeline and
cannot say whether its output means anything.

So there is a parallel **[statistics track](part-S-statistics/)**, chapters `S1`–`S7`, written to
be read *at the point where each idea is first needed* rather than as a preliminary course. Each
one teaches to the level of **understanding and correct interpretation** — what a method assumes,
how to read its output, and how to recognise it being misused — and each is grounded in **code
you can run**, because you already program and that is the fastest route in.

| | Track chapter | Read before | Because it underpins |
|---|---|---|---|
| **S1** | Probability and uncertainty | **Ch 09** | Crosses, pedigree risk |
| **S2** | The distributions you'll meet | **Ch 09** | Segregation, coverage, counts |
| **S3** | Sampling, estimation, error | **Ch 12** | Allele frequencies, drift, every interval you will report |
| **S4** | Hypothesis testing, and its limits | **Ch 12** | χ², degrees of freedom, power — Ch 12 computes with all three |
| **S5** | Variance, correlation, regression | **Ch 28** | *F*<sub>ST</sub> is a variance ratio; LD is a correlation |
| **S6** | Likelihood and Bayesian inference | **Ch 32** | Interval mapping, phylogenetics, variant calling, ACMG |
| **S7** | High-dimensional data | **Ch 28** | Population-structure PCA, then GWAS, multiple testing, PRS |

If your statistics is already strong, skim them; they are written so the genetics chapters make
sense either way.

What it does **not** assume: any chemistry beyond "atoms form bonds", any cell biology, any
prior genetics. [Chapter 01](part-00-orientation/01-chemistry-and-cell-primer.md) builds the
chemical and cellular vocabulary you need — bonding and water, the four macromolecules, the cell,
and the small amount of thermodynamics that binding, melting and enzyme catalysis all rest on —
and deliberately stops there.

## How to work through it

**Read [Chapter 00](part-00-orientation/00-the-whole-story.md) first.** It tells the entire
story end to end in one sitting — DNA to phenotype to population to sequencing — at low
resolution. Everything afterwards is a zoom into part of that picture. Having the whole map
before the details is the difference between learning a subject and accumulating facts
about it.

Then go in order. The parts genuinely build: you cannot understand linkage mapping
(Ch 14) without meiosis (Ch 09), or GWAS (Ch 51) without linkage disequilibrium (Ch 29).

Each chapter follows the same shape, so you can navigate one you haven't read:

- **What you'll be able to do** — concrete, testable objectives
- **The core idea** — the intuition, in plain language, before any detail
- **The body** — the actual mechanism or mathematics, derived rather than asserted
- **Common misconceptions** — what people believe that is wrong, and why
- **Worked example**
- **Connections** — what this depends on and what depends on it
- **Check yourself** — questions with answers folded away

The **misconceptions** sections are not padding. Genetics is unusually rich in confident
wrong beliefs — that dominant means common, that heritability tells you something about an
individual, that a GWAS hit is a cause. Knowing why those are wrong is a large part of what
separates third-year understanding from first-year.

### The three kinds of practice

| | What it is | When to use it |
|---|---|---|
| [`problem-sets/`](problem-sets/) | 16 sets, worked solutions folded in `<details>` | After finishing a part. Attempt before revealing — genetics is learned by calculating, not by reading |
| [`labs/`](labs/) | 11 computational labs on real public data, CLI + Python | Each after the chapter it names in its own `Before this:` header — most sit in Part 9, but [`lab-07`](labs/lab-07-population-genetics.md) follows Ch 29 and [`lab-10`](labs/lab-10-phylogenetics.md) follows Ch 34. Start with [`lab-00`](labs/lab-00-setup.md) to build the environment |
| [`question-banks/`](question-banks/) | Rapid recall Q&A per part | Ongoing. Convert to Anki with [`reference/to_anki.py`](reference/to_anki.py) |

## Contents

### Statistics track — read each before the chapter that needs it
| | | Read before |
|---|---|---|
| S1 | [Probability and uncertainty](part-S-statistics/S1-probability.md) | Ch 09 |
| S2 | [The distributions you'll actually meet](part-S-statistics/S2-distributions.md) | Ch 09 |
| S3 | [Sampling, estimation and error](part-S-statistics/S3-sampling-and-estimation.md) | Ch 12 |
| S4 | [Hypothesis testing, and what it doesn't tell you](part-S-statistics/S4-hypothesis-testing.md) | Ch 12 |
| S5 | [Variance, correlation and regression](part-S-statistics/S5-variance-and-regression.md) | Ch 28 |
| S6 | [Likelihood and Bayesian inference](part-S-statistics/S6-likelihood-and-bayes.md) | Ch 32 |
| S7 | [High-dimensional data](part-S-statistics/S7-high-dimensional-data.md) | Ch 28 |

The full linear order, statistics included:

```
00 01 · 02–08 · [S1 S2] · 09 10 11 · [S3 S4] · 12 13 14 15 · 16–20 20A · 21–25 25A ·
26 27 · [S5 S7] · 28 29 · 30 31 · [S6] · 32 · 33 34 35 35A · 36–58
```

**A letter suffix means "read here, but numbered out of the way".** Chapters `20A`,
`25A` and `35A` sit exactly where the suffix says — 20A between Ch 20 and Ch 21, 25A after
Ch 25, 35A after Ch 35 — and are read in that position. The convention mirrors the `S`-track's
parallel numbering, and exists so that inserting material does not renumber every chapter after
it and invalidate several thousand cross-references.

### Part 0 — Orientation
| | |
|---|---|
| 00 | [The whole story](part-00-orientation/00-the-whole-story.md) |
| 01 | [The chemistry and cell biology you actually need](part-00-orientation/01-chemistry-and-cell-primer.md) |

### Part 1 — Molecular foundations
| | |
|---|---|
| 02 | [DNA structure](part-01-molecular-foundations/02-dna-structure.md) |
| 03 | [Genomes, chromosomes and chromatin](part-01-molecular-foundations/03-genomes-chromosomes-chromatin.md) |
| 04 | [DNA replication](part-01-molecular-foundations/04-dna-replication.md) |
| 05 | [Transcription](part-01-molecular-foundations/05-transcription.md) |
| 06 | [RNA processing and splicing](part-01-molecular-foundations/06-rna-processing.md) |
| 07 | [The genetic code and translation](part-01-molecular-foundations/07-genetic-code-and-translation.md) |
| 08 | [Proteins, and what genes actually do](part-01-molecular-foundations/08-proteins-and-gene-function.md) |

### Part 2 — Transmission genetics
| | |
|---|---|
| 09 | [Mitosis and meiosis](part-02-transmission-genetics/09-mitosis-and-meiosis.md) |
| 10 | [Mendel and single-gene inheritance](part-02-transmission-genetics/10-mendelian-inheritance.md) |
| 11 | [Beyond Mendel](part-02-transmission-genetics/11-beyond-mendel.md) |
| 12 | [Probability and hypothesis testing in genetics](part-02-transmission-genetics/12-probability-and-testing.md) |
| 13 | [Sex chromosomes and sex linkage](part-02-transmission-genetics/13-sex-linkage.md) |
| 14 | [Linkage, recombination and mapping](part-02-transmission-genetics/14-linkage-and-mapping.md) |
| 15 | [Pedigrees and human inheritance](part-02-transmission-genetics/15-pedigrees.md) |

### Part 3 — Genome instability
| | |
|---|---|
| 16 | [Mutation](part-03-genome-instability/16-mutation.md) |
| 17 | [DNA repair](part-03-genome-instability/17-dna-repair.md) |
| 18 | [Recombination mechanisms](part-03-genome-instability/18-recombination-mechanisms.md) |
| 19 | [Transposable elements](part-03-genome-instability/19-transposable-elements.md) |
| 20 | [Chromosome abnormalities](part-03-genome-instability/20-chromosome-abnormalities.md) |
| 20A | [Bacterial and phage genetics](part-03-genome-instability/20A-bacterial-and-phage-genetics.md) |

### Part 4 — Gene regulation
| | |
|---|---|
| 21 | [Bacterial gene regulation](part-04-gene-regulation/21-bacterial-regulation.md) |
| 22 | [Eukaryotic transcriptional regulation](part-04-gene-regulation/22-eukaryotic-transcriptional-regulation.md) |
| 23 | [Chromatin and epigenetics](part-04-gene-regulation/23-chromatin-and-epigenetics.md) |
| 24 | [RNA-based regulation](part-04-gene-regulation/24-rna-based-regulation.md) |
| 25 | [Regulatory networks and development](part-04-gene-regulation/25-networks-and-development.md) |
| 25A | [Developmental genetics and the genetics of making a mouse](part-04-gene-regulation/25A-developmental-genetics.md) |

### Part 5 — Population genetics
| | |
|---|---|
| 26 | [Allele frequencies and Hardy–Weinberg](part-05-population-genetics/26-hardy-weinberg.md) |
| 27 | [The four forces and effective population size](part-05-population-genetics/27-the-four-forces.md) |
| 28 | [Population structure and inbreeding](part-05-population-genetics/28-structure-and-inbreeding.md) |
| 29 | [Linkage disequilibrium and haplotypes](part-05-population-genetics/29-linkage-disequilibrium.md) |

### Part 6 — Quantitative genetics
| | |
|---|---|
| 30 | [Quantitative traits and variance](part-06-quantitative-genetics/30-quantitative-traits.md) |
| 31 | [Heritability and response to selection](part-06-quantitative-genetics/31-heritability-and-selection.md) |
| 32 | [Mapping quantitative traits](part-06-quantitative-genetics/32-mapping-quantitative-traits.md) |

### Part 7 — Molecular evolution
| | |
|---|---|
| 33 | [Neutral theory and tests of selection](part-07-molecular-evolution/33-neutral-theory-and-selection-tests.md) |
| 34 | [Phylogenetics](part-07-molecular-evolution/34-phylogenetics.md) |
| 35 | [Genome evolution, duplication and orthology](part-07-molecular-evolution/35-genome-evolution.md) |
| 35A | [Speciation, hybridisation and ecological genetics](part-07-molecular-evolution/35A-speciation-and-ecological-genetics.md) |

### Part 8 — Methods
| | |
|---|---|
| 36 | [Core molecular methods](part-08-methods/36-core-molecular-methods.md) |
| 37 | [Model organisms and genetic screens](part-08-methods/37-model-organisms-and-screens.md) |
| 38 | [Genome editing](part-08-methods/38-genome-editing.md) |

### Part 9 — Genomics
| | |
|---|---|
| 39 | [Genome landscapes and the C-value paradox](part-09-genomics/39-genome-landscapes.md) |
| 40 | [Sequencing technologies](part-09-genomics/40-sequencing-technologies.md) |
| 41 | [Data formats and the toolchain](part-09-genomics/41-data-formats.md) |
| 42 | [Read alignment](part-09-genomics/42-read-alignment.md) |
| 43 | [Genome assembly](part-09-genomics/43-genome-assembly.md) |
| 44 | [Annotation](part-09-genomics/44-annotation.md) |
| 45 | [Reference genomes and pangenomes](part-09-genomics/45-reference-genomes-and-pangenomes.md) |

### Part 10 — Functional genomics
| | |
|---|---|
| 46 | [Variant calling](part-10-functional-genomics/46-variant-calling.md) |
| 47 | [RNA-seq](part-10-functional-genomics/47-rna-seq.md) |
| 48 | [Single-cell and spatial genomics](part-10-functional-genomics/48-single-cell-and-spatial.md) |
| 49 | [Chromatin and epigenome profiling](part-10-functional-genomics/49-epigenome-profiling.md) |
| 50 | [The 3D genome](part-10-functional-genomics/50-3d-genome.md) |

### Part 11 — Human and statistical genomics
| | |
|---|---|
| 51 | [GWAS](part-11-human-and-statistical-genomics/51-gwas.md) |
| 52 | [From association to mechanism](part-11-human-and-statistical-genomics/52-association-to-mechanism.md) |
| 53 | [Polygenic scores](part-11-human-and-statistical-genomics/53-polygenic-scores.md) |
| 54 | [Rare variants and Mendelian disease](part-11-human-and-statistical-genomics/54-rare-variants-and-mendelian-disease.md) |
| 55 | [Clinical variant interpretation](part-11-human-and-statistical-genomics/55-clinical-variant-interpretation.md) |
| 56 | [Cancer genomics](part-11-human-and-statistical-genomics/56-cancer-genomics.md) |

### Part 12 — Applications and ethics
| | |
|---|---|
| 57 | [Genomics in practice](part-12-applications-and-ethics/57-genomics-in-practice.md) |
| 58 | [Ethics, privacy and society](part-12-applications-and-ethics/58-ethics-and-society.md) |

### Reference
- [Glossary](GLOSSARY.md) — every term, defined once
- [Formulas](reference/formulas.md) — every quantitative result, with the chapter that derives it
- [Verified facts](reference/verified-facts.md) — the pinned numbers and where they came from
- [Further reading](reference/further-reading.md) — textbooks, landmark papers, databases
- [Study guide](STUDY-GUIDE.md) — pacing and how to use the practice material

## How accuracy is handled here

Wrong genetics is worse than no genetics, so this curriculum treats factual claims as
something to be sourced rather than recalled.

**All quantitative claims are pinned in [`reference/verified-facts.md`](reference/verified-facts.md)**,
each with a source and a verification date, and graded by confidence: fetched from a primary
source, corroborated across secondary sources, or a fast-moving vendor figure that should be
given as a range. Chapters draw their numbers from that file rather than restating remembered
ones, which is what keeps the gene count identical in Chapter 03 and Chapter 39.

The fast-moving areas — sequencing platform specifications, pangenome releases, clinical
variant-interpretation guidelines, database versions — were checked before writing rather
than after. That check changed four things that would otherwise have been wrong, including a
sequencing platform that launched weeks before this was written and a pangenome release that
superseded the one most textbooks still describe.

Genomics rots quickly. The verified-facts file records what will rot first.

## Conventions

**Nomenclature.** Gene symbols follow HGNC and are *italicised*; protein products are set in
roman (*BRCA1* the gene, BRCA1 the protein). Variants use HGVS notation. Every genomic
coordinate names its assembly, because a coordinate without a build is meaningless.

**Coordinates.** The 0-based/1-based split between formats is a genuine and recurring source
of off-by-one bugs — BED is 0-based half-open, VCF and GFF are 1-based inclusive. Chapter 41
covers it properly; everywhere else, the convention in use is stated explicitly.

**Diagrams.** Mermaid for pathways, pipelines, regulatory logic, pedigrees and trees — it
renders natively on GitHub. Monospace blocks for anything sequence-level: alignments,
reading frames, CIGAR strings. Tables for comparisons.

**Units.** bp / kb / Mb / Gb for sequence length; cM for genetic distance; the distinction
between the two is the whole content of Chapter 14.
