# Formula reference

Every quantitative result in the curriculum, with the chapter that derives it. **Nothing here is
asserted** — each entry points at where the derivation lives, so you can check the assumptions
rather than trusting the formula.

Assumptions are listed because in genetics the assumptions are usually the interesting part. A
formula applied outside them gives a confident wrong answer.

---

## Sequencing and data

| Quantity | Formula | Derived in |
|---|---|---|
| Phred quality | *Q* = −10 log₁₀(*P*ₑᵣᵣₒᵣ) | [Ch 41](../part-09-genomics/41-data-formats.md) |
| Error from Phred | *P* = 10^(−*Q*/10) | [Ch 41](../part-09-genomics/41-data-formats.md) |
| ASCII encoding | char = chr(*Q* + 33) — Phred+33; legacy data may be +64 | [Ch 41](../part-09-genomics/41-data-formats.md) |
| Coverage depth | *C* = *N* · *L* / *G* — reads × length ÷ genome size | [Ch 40](../part-09-genomics/40-sequencing-technologies.md) |
| Uncovered fraction | *P*(depth = 0) = e^(−*C*) — Poisson, Lander–Waterman | [Ch 40](../part-09-genomics/40-sequencing-technologies.md) |
| Depth distribution | *P*(depth = *k*) = e^(−*C*) *C*^*k* / *k*! | [Ch 40](../part-09-genomics/40-sequencing-technologies.md) |
| N50 | Sort contigs descending; N50 = length of the contig at which cumulative sum first reaches half the assembly total | [Ch 43](../part-09-genomics/43-genome-assembly.md) |
| NG50 | As N50, but the target is half the **estimated genome size** | [Ch 43](../part-09-genomics/43-genome-assembly.md) |

**Quick reference:** Q20 = 1% error, Q30 = 0.1%, Q40 = 0.01%.

> Real coverage is **overdispersed** relative to Poisson — repeats and GC bias mean the observed
> zero-coverage fraction exceeds e^(−C). Measured in [lab-03](../labs/lab-03-variant-calling.md):
> 0.85% observed against 0.24% predicted at 6.05×.

## Mutation and repair

| Quantity | Value / formula | Derived in |
|---|---|---|
| Replication fidelity | ~10⁻¹⁰ **per base per replication** — the product of base selection (10⁻⁵) × proofreading (10⁻²) × mismatch repair (10⁻³) | [Ch 04](../part-01-molecular-foundations/04-dna-replication.md) |
| Germline mutation rate | ~1.1–1.3 × 10⁻⁸ **per base per generation** | [verified-facts](verified-facts.md) |
| De novo mutations per generation | *μ* × *G* ≈ 1.2 × 10⁻⁸ × 6.2 × 10⁹ ≈ 68–81 naive; ~60–70 observed (callable fraction) | [Ch 16](../part-03-genome-instability/16-mutation.md) |
| Paternal age effect | ≈ +1.3–1.5 de novo mutations per additional year of paternal age | [Ch 16](../part-03-genome-instability/16-mutation.md) |

> **The single most common unit error in the subject.** Fidelity is per *replication*; the
> germline rate is per *generation*. They differ ~100× and are not comparable. A generation
> spans hundreds of divisions and also accumulates unrepaired chemical damage that was never a
> polymerase error.

## Linkage and mapping

| Quantity | Formula | Derived in |
|---|---|---|
| Recombination frequency | RF = recombinants / total; 1% RF ≡ 1 cM | [Ch 14](../part-02-transmission-genetics/14-linkage-and-mapping.md) |
| Ceiling | RF ≤ 0.5 always — multiple crossovers restore parental configurations | [Ch 14](../part-02-transmission-genetics/14-linkage-and-mapping.md) |
| Haldane mapping function | *d* = −½ ln(1 − 2·RF) Morgans — Poisson crossovers, **no interference** | [Ch 14](../part-02-transmission-genetics/14-linkage-and-mapping.md) |
| Kosambi mapping function | *d* = ¼ ln[(1 + 2·RF)/(1 − 2·RF)] — allows distance-dependent interference | [Ch 14](../part-02-transmission-genetics/14-linkage-and-mapping.md) |
| Coefficient of coincidence | c.o.c. = observed DCO / expected DCO | [Ch 14](../part-02-transmission-genetics/14-linkage-and-mapping.md) |
| Interference | *I* = 1 − c.o.c. | [Ch 14](../part-02-transmission-genetics/14-linkage-and-mapping.md) |
| LOD score | LOD = log₁₀(*L*(linkage) / *L*(no linkage)); threshold 3.0 | [Ch 14](../part-02-transmission-genetics/14-linkage-and-mapping.md) |
| Cotransduction frequency | *C*(*d*) = (1 − *d*/*L*)³ for *d* < *L* — *d* the marker separation, *L* the phage headful; **cube** because the fragment must span both markers and each outer flank needs room for a crossover | [Ch 20A §5](../part-03-genome-instability/20A-bacterial-and-phage-genetics.md) |
| Cotransduction distance | *d* = *L*(1 − *C*<sup>1/3</sup>) — **the inverted form is the additive one**; raw cotransduction frequencies must not be added | [Ch 20A §5](../part-03-genome-instability/20A-bacterial-and-phage-genetics.md) |
| Time of entry (interrupted mating) | Position is an affine function of entry time; **differences** in entry time give map distance in minutes, absolute times do not — every curve is displaced by a few minutes of pair formation. *E. coli* map = 100 minutes | [Ch 20A §3](../part-03-genome-instability/20A-bacterial-and-phage-genetics.md) |

**Three-point cross:** parentals are most frequent, double crossovers least. The gene that
differs between a DCO class and its parental is the **middle** gene. Both DCO classes must be
added into **both** interval distances — the commonest error in the calculation.

> **Both bacterial rulers saturate, and saturation is not a distance.** Cotransduction returns
> *C* = 0 for every *d* ≥ *L*, so "not cotransducible" and "on the far side of the chromosome"
> are the same observation — the RF ≤ 0.5 ceiling above, in different clothing. At *L* ≈ 2
> minutes, P1 transduction is blind beyond ~100 kb and bottoms out around 1–2 kb at the other
> end. Interrupted mating covers the whole chromosome but only to a minute; the two are used
> together, coarse then fine.

**Human scale:** ~3,400–3,500 cM **autosomal** genetic map over the ~2,875 Mb of autosome ⇒
~**1.2 cM/Mb** average. Keep both halves of that ratio on the autosomes: dividing the autosomal
map by the 3.1 Gb whole haploid genome is a common slip and understates the rate by ~7%.
Recombination is in any case highly non-uniform (hotspots, centromeric suppression, ~1.6×
longer female map).

## Hardy–Weinberg and allele frequencies

| Quantity | Formula | Derived in |
|---|---|---|
| HWE genotype frequencies | *p*² : 2*pq* : *q*², reached in **one generation** of random mating | [Ch 26](../part-05-population-genetics/26-hardy-weinberg.md) |
| Allele frequency from genotypes | *p* = (2·*N*_AA + *N*_Aa) / 2*N* | [Ch 26](../part-05-population-genetics/26-hardy-weinberg.md) |
| Carrier frequency, rare recessive | 2*pq* ≈ 2*q*; carriers outnumber affected by ≈ 2/*q* | [Ch 26](../part-05-population-genetics/26-hardy-weinberg.md) |
| X-linked | Male genotype frequency **=** allele frequency (hemizygous); affected male:female ratio = 1/*q* | [Ch 13](../part-02-transmission-genetics/13-sex-linkage.md) |
| HWE chi-square | *df* = (genotypes) − (alleles) = 1 for biallelic — **not** *k* − 1 | [Ch 12](../part-02-transmission-genetics/12-probability-and-testing.md) |

Assumptions: random mating, no selection, no mutation, no migration, infinite population.

> HWE is a **null model**, not a prediction. In modern practice a departure is used as a
> **genotyping-error filter**, not as a biological discovery.

## Selection, drift and effective size

| Quantity | Formula | Derived in |
|---|---|---|
| Selection against recessive lethal | *q*′ = *q*/(1 + *q*); closed form *q*ₙ = *q*₀/(1 + *n q*₀) | [Ch 27](../part-05-population-genetics/27-the-four-forces.md) |
| Halving time | 1/*q* generations — each successive halving takes twice as long | [Ch 27](../part-05-population-genetics/27-the-four-forces.md) |
| Mutation–selection balance, recessive | *q̂* = √(*μ*/*s*) | [Ch 27](../part-05-population-genetics/27-the-four-forces.md) |
| Mutation–selection balance, dominant | *q̂* = *μ*/(*hs*) | [Ch 27](../part-05-population-genetics/27-the-four-forces.md) |
| Overdominance equilibrium | *q̂* = *s*₁/(*s*₁ + *s*₂) — stable | [Ch 27](../part-05-population-genetics/27-the-four-forces.md) |
| Drift variance | Var(Δ*p*) = *pq*/2*N* per generation | [Ch 27](../part-05-population-genetics/27-the-four-forces.md) |
| Neutral fixation probability | = current frequency *p* | [Ch 27](../part-05-population-genetics/27-the-four-forces.md) |
| Mean time to fixation (neutral) | ≈ 4*N*ₑ generations | [Ch 27](../part-05-population-genetics/27-the-four-forces.md) |
| Heterozygosity decay | *H*ₜ = *H*₀(1 − 1/2*N*ₑ)^*t* | [Ch 27](../part-05-population-genetics/27-the-four-forces.md) |
| *N*ₑ, unequal sex ratio | *N*ₑ = 4*N*_f *N*_m/(*N*_f + *N*_m) | [Ch 27](../part-05-population-genetics/27-the-four-forces.md) |
| *N*ₑ, fluctuating size | **harmonic** mean: *N*ₑ = *n* / Σ(1/*N*ᵢ) | [Ch 27](../part-05-population-genetics/27-the-four-forces.md) |
| *N*ₑ, variance in family size | *N*ₑ ≈ (4*N* − 2)/(*V*_k + 2) — exceeds *N* when *V*_k < 2, which managed breeding exploits | [Ch 35A §7](../part-07-molecular-evolution/35A-speciation-and-ecological-genetics.md) |
| *N*ₑ/*N* in wildlife | ≈ **0.1** — the three corrections above **multiply**; Frankham's comprehensive estimates average 0.10–0.11 across 102 species. A cross-species average over enormous variance, so it is a modelling assumption, not a constant | [Ch 35A §7](../part-07-molecular-evolution/35A-speciation-and-ecological-genetics.md) |
| Inbreeding accumulation | Δ*F* = 1/(2*N*ₑ) per generation in a closed population — **whatever the mating system**, because the mate pool is finite | [Ch 35A §7](../part-07-molecular-evolution/35A-speciation-and-ecological-genetics.md) |
| 50/500 rule | *N*ₑ ≥ 50 short-term (the size at which Δ*F* = 1%/generation); *N*ₑ ≥ 500 long-term (mutation–drift balance for *V*_A). Frankham et al. 2014 argue 100/1000; **unresolved** — quote the derivation, not the threshold | [Ch 35A §7](../part-07-molecular-evolution/35A-speciation-and-ecological-genetics.md) |

> **|*N*ₑ*s*| is the most important inequality in population genetics.** ≫1 ⇒ selection
> dominates; ≪1 ⇒ drift dominates and the variant behaves as if neutral. It is also why a small
> population **cannot purge its own load**: the small *N*ₑ that caused the inbreeding is exactly
> what blinds selection to the mildly deleterious alleles that make up most of it — measured at
> under 1% across 119 captive pedigreed populations
> ([Ch 35A §7](../part-07-molecular-evolution/35A-speciation-and-ecological-genetics.md)).

## Structure and inbreeding

| Quantity | Formula | Derived in |
|---|---|---|
| Inbreeding coefficient | *F* = probability two alleles at a locus are **identical by descent** | [Ch 28](../part-05-population-genetics/28-structure-and-inbreeding.md) |
| *F* from a pedigree loop | *F* = Σ (½)^(*n*₁+*n*₂+1) over all paths through common ancestors | [Ch 28](../part-05-population-genetics/28-structure-and-inbreeding.md) |
| Genotype frequencies under inbreeding | *p*² + *Fpq* : 2*pq*(1 − *F*) : *q*² + *Fpq* | [Ch 28](../part-05-population-genetics/28-structure-and-inbreeding.md) |
| *F*_ST | (*H*_T − *H*_S)/*H*_T | [Ch 28](../part-05-population-genetics/28-structure-and-inbreeding.md) |
| F-statistic identity | (1 − *F*_IT) = (1 − *F*_IS)(1 − *F*_ST) | [Ch 28](../part-05-population-genetics/28-structure-and-inbreeding.md) |
| Wahlund effect | Pooling differentiated subpopulations always produces a heterozygote deficit | [Ch 28](../part-05-population-genetics/28-structure-and-inbreeding.md) |

Common *F* values: first cousins 1/16, half-sibs 1/8, uncle–niece 1/8, parent–offspring 1/4.

> At a **single locus**, population structure and inbreeding are indistinguishable — both give a
> homozygote excess. Separating them requires many loci. Measured *F*_ST(AFR, EUR) = 0.065 on
> one 1 Mb region in [lab-07](../labs/lab-07-population-genetics.md).

## Linkage disequilibrium

| Quantity | Formula | Derived in |
|---|---|---|
| *D* | *D* = *p*_AB − *p*_A·*p*_B | [Ch 29](../part-05-population-genetics/29-linkage-disequilibrium.md) |
| *D*′ | *D* / *D*_max — normalised so the range does not depend on allele frequency | [Ch 29](../part-05-population-genetics/29-linkage-disequilibrium.md) |
| *r*² | *D*² / (*p*_A *q*_A *p*_B *q*_B) — **the squared correlation** between loci as 0/1 indicators | [Ch 29](../part-05-population-genetics/29-linkage-disequilibrium.md) |
| Decay | *D*ₜ = *D*₀(1 − *c*)^*t* | [Ch 29](../part-05-population-genetics/29-linkage-disequilibrium.md) |
| Power cost of tagging | Sample size scales as **1/*r*²** when testing a tag rather than the causal variant | [Ch 29](../part-05-population-genetics/29-linkage-disequilibrium.md) |

> LD is **not** linkage. Loci can be linked without LD, and transiently in LD without linkage.

## Quantitative genetics

| Quantity | Formula | Derived in |
|---|---|---|
| Phenotypic variance | *V*_P = *V*_G + *V*_E + 2Cov(G,E) + *V*_GxE | [Ch 30](../part-06-quantitative-genetics/30-quantitative-traits.md) |
| Genetic variance | *V*_G = *V*_A + *V*_D + *V*_I | [Ch 30](../part-06-quantitative-genetics/30-quantitative-traits.md) |
| Broad-sense heritability | *H*² = *V*_G/*V*_P | [Ch 31](../part-06-quantitative-genetics/31-heritability-and-selection.md) |
| Narrow-sense heritability | *h*² = *V*_A/*V*_P — the one that predicts response to selection | [Ch 31](../part-06-quantitative-genetics/31-heritability-and-selection.md) |
| Parent–offspring covariance | ½*V*_A | [Ch 30](../part-06-quantitative-genetics/30-quantitative-traits.md) |
| Full-sib covariance | ½*V*_A + ¼*V*_D | [Ch 30](../part-06-quantitative-genetics/30-quantitative-traits.md) |
| Falconer's formula | *h*² = 2(*r*_MZ − *r*_DZ) — exact **only** when *V*_D = *V*_I = 0; the full expression is *h*² = 2(*r*_MZ − *r*_DZ) − 1.5*d*² with *d*² = *V*_D/*V*_P, so the estimate is biased **upward** under dominance or epistasis | [Ch 31](../part-06-quantitative-genetics/31-heritability-and-selection.md) |
| Breeder's equation | *R* = *h*² · *S* | [Ch 31](../part-06-quantitative-genetics/31-heritability-and-selection.md) |

> **Heritability is a property of a population in an environment.** It says nothing about an
> individual, does not mean "unchangeable", and licenses **no** inference about between-group
> differences. See the seeds-in-two-pots argument in
> [Ch 31](../part-06-quantitative-genetics/31-heritability-and-selection.md).

## Molecular evolution

| Quantity | Formula | Derived in |
|---|---|---|
| Neutral substitution rate | *k* = *μ* — independent of population size (2*Nμ* new mutations × 1/2*N* fixation probability) | [Ch 33](../part-07-molecular-evolution/33-neutral-theory-and-selection-tests.md) |
| Jukes–Cantor distance | *d* = −¾ ln(1 − 4*p*/3) | [Ch 33](../part-07-molecular-evolution/33-neutral-theory-and-selection-tests.md) |
| dN/dS | *ω* = (*d*_N per nonsynonymous **site**) / (*d*_S per synonymous **site**) | [Ch 33](../part-07-molecular-evolution/33-neutral-theory-and-selection-tests.md) |
| Nucleotide diversity | *π* = mean pairwise differences per site | [Ch 33](../part-07-molecular-evolution/33-neutral-theory-and-selection-tests.md) |
| Watterson's estimator | *θ*_W = *S* / Σ(1/*i*), *i* = 1…*n*−1 | [Ch 33](../part-07-molecular-evolution/33-neutral-theory-and-selection-tests.md) |
| Tajima's *D* | ∝ (*π* − *θ*_W), scaled by its standard deviation | [Ch 33](../part-07-molecular-evolution/33-neutral-theory-and-selection-tests.md) |
| ILS discordance | *P*(gene tree ≠ species tree) = ⅔·e^(−*τ*), *τ* = *T*/2*N* | [Ch 34](../part-07-molecular-evolution/34-phylogenetics.md) |
| Patterson's *D* | *D* = (*n*_ABBA − *n*_BABA)/(*n*_ABBA + *n*_BABA) for (((P1,P2),P3),O); expectation 0 under ILS alone, which is **symmetric**. Significance by **block jackknife** — sites within a block are not independent | [Ch 34](../part-07-molecular-evolution/34-phylogenetics.md), generalised in [Ch 35A §5](../part-07-molecular-evolution/35A-speciation-and-ecological-genetics.md) |
| Combined reproductive isolation | RI = 1 − Π(1 − *b*ᵢ) — barriers act **in sequence**, so each sees only what the previous ones let through and an early barrier of a given strength always dominates the accounting | [Ch 35A §2](../part-07-molecular-evolution/35A-speciation-and-ecological-genetics.md) |
| Dobzhansky–Muller snowball | Untested cross-lineage pairs = *k*(*K* − *k*) after *K* substitutions, = *K*²/4 when symmetric; E[incompatibilities] ≈ *pK*²/4 — **quadratic** in divergence, and with *k* = *μ* therefore quadratic in time | [Ch 35A §3](../part-07-molecular-evolution/35A-speciation-and-ecological-genetics.md) |
| Haldane's rule, dominance condition | cost ∝ 1 (hemizygous) against ∝ 2*h* (homogametic) ⟹ the heterogametic sex is worse off iff *h* < ½ | [Ch 35A §4](../part-07-molecular-evolution/35A-speciation-and-ecological-genetics.md) |
| Cline width | *w* = σ√(8/*s*) ⟹ *s* = 8(σ/*w*)² — Bazykin underdominance, width defined as **inverse of the maximum gradient**. Barton & Gale give ≈2.5σ/√*s* (endogenous), ≈1.7σ/√*s* (exogenous) | [Ch 35A §5](../part-07-molecular-evolution/35A-speciation-and-ecological-genetics.md) |
| Neutral spread of a contact zone | width ~ σ√*t* — dispersal is diffusion, so it is the **variance** that adds per generation. Run this null before invoking selection | [Ch 35A §5](../part-07-molecular-evolution/35A-speciation-and-ecological-genetics.md) |

Interpretation: *ω* < 1 purifying, = 1 neutral, > 1 positive. Gene-wide *ω* rarely exceeds 1
even under real positive selection — use branch-site or site models.

> Tajima's *D* confounds **selection with demography**. Negative *D* is consistent with a
> selective sweep *or* population expansion. Corrected distances can exceed 1.0 substitution
> per site even though observed p-distance saturates at 0.75 — see
> [lab-10](../labs/lab-10-phylogenetics.md), where human–mouse mtDNA distance is 1.218.

> **The √*s* scaling of a cline is robust; the constant is a model choice you must declare.**
> Inverting *w* ~ σ/√*s* as if the prefactor were 1 understates selection eightfold — the error
> worked through on the *Bombina* transect in
> [Ch 35A](../part-07-molecular-evolution/35A-speciation-and-ecological-genetics.md), where
> *w* = 6.05 km and σ = 0.99 km/generation give *s* ≈ 0.21, not 0.027. And *s* goes as the
> **square** of σ, so a 20% error in dispersal is a 44% error in selection.

## Statistical genomics

| Quantity | Formula | Derived in |
|---|---|---|
| GWAS significance threshold | 5 × 10⁻⁸ ≈ 0.05 / 10⁶ effectively independent tests | [Ch 51](../part-11-human-and-statistical-genomics/51-gwas.md) |
| Genomic inflation factor | *λ* = median(observed *χ*²) / median(null *χ*²) = median *χ*²/0.4549 for 1 df | [Ch 51](../part-11-human-and-statistical-genomics/51-gwas.md) |
| Additive genotype coding | dosage ∈ {0, 1, 2}, plus covariates (PCs) | [Ch 51](../part-11-human-and-statistical-genomics/51-gwas.md) |
| Polygenic score | PRS = Σ *β*ᵢ · dosageᵢ, weights shrunk toward zero | [Ch 53](../part-11-human-and-statistical-genomics/53-polygenic-scores.md) |
| Benjamini–Hochberg | Reject *H*(ᵢ) where *p*(ᵢ) ≤ (*i*/*m*)·*α* | [Ch 47](../part-10-functional-genomics/47-rna-seq.md) |
| Bayesian pedigree risk | posterior ∝ prior × conditional; tabulate prior / conditional / joint / posterior | [Ch 12](../part-02-transmission-genetics/12-probability-and-testing.md), [Ch 15](../part-02-transmission-genetics/15-pedigrees.md) |

> *λ* alone cannot distinguish **confounding** from **true polygenicity**. Use the LD-score
> regression intercept: raised intercept ⇒ confounding; raised slope with intercept ≈ 1 ⇒ real
> heritability. Demonstrated in [lab-08](../labs/lab-08-gwas.md), where a phenotype with **no
> genetic cause** produced 702 genome-wide significant hits at *λ* = 18.07, falling to 0 hits at
> *λ* = 1.14 once ancestry PCs were included.

---

## Constants

| Quantity | Value | Source |
|---|---|---|
| Human haploid genome | 3.1 Gb (T2T-CHM13: 3,117,292,070 bp) | [verified-facts](verified-facts.md) |
| Protein-coding genes | 19,442 (GENCODE 50) | [verified-facts](verified-facts.md) |
| Non-coding genes | 58,195 — **never** compute as total − coding | [verified-facts](verified-facts.md) |
| Transposable element content | ~46% | [verified-facts](verified-facts.md) |
| B-DNA rise per bp | 0.34 nm | [Ch 02](../part-01-molecular-foundations/02-dna-structure.md) |
| B-DNA bp per turn | ~10.5 | [Ch 02](../part-01-molecular-foundations/02-dna-structure.md) |
| Nucleosome | 147 bp; ~166 bp chromatosome with H1 | [Ch 03](../part-01-molecular-foundations/03-genomes-chromosomes-chromatin.md) |
| Human genetic map | ~3,400–3,500 cM sex-averaged, **autosomal** (male ~2,600–2,700; female ~4,200–4,400) | [Ch 14](../part-02-transmission-genetics/14-linkage-and-mapping.md) |
| Human autosome length | ~2,875 Mb — the denominator for cM/Mb, **not** the 3.1 Gb whole genome | [Ch 13](../part-02-transmission-genetics/13-sex-linkage.md) |
| Human generation time | ~27 years (sex-averaged) | [verified-facts](verified-facts.md) |
| Human *N*ₑ (historical) | ~10,000 | [Ch 27](../part-05-population-genetics/27-the-four-forces.md) |
| Codons / amino acids | 64 / 20 + stop | [Ch 07](../part-01-molecular-foundations/07-genetic-code-and-translation.md) |
