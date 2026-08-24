# 55 — Clinical variant interpretation

> **Before this:** [Ch 54 — Rare variants and Mendelian disease](54-rare-variants-and-mendelian-disease.md) ·
> [Ch 46 — Variant calling](../part-10-functional-genomics/46-variant-calling.md) ·
> [Ch 41 — Data formats](../part-09-genomics/41-data-formats.md) · **Time:** ~55 min
>
> **Statistics needed:** [S1 Probability](../part-S-statistics/S1-probability.md) ·
> [S6 Likelihood and Bayes](../part-S-statistics/S6-likelihood-and-bayes.md)

## What you'll be able to do

- Place a variant in the five-tier ACMG/AMP scheme and say what each tier does and does not license
- Name the evidence categories, assign a strength to each, and apply the combining rules to reach a call
- Reconstruct the Bayesian model underneath the checklist, convert criteria to points, and compute the posterior
- Derive a maximum credible allele frequency from prevalence, penetrance and heterogeneity, and use it to argue both "too common" and "informatively absent"
- Say why three agreeing computational predictors are not three pieces of evidence, and what calibration replaces them with
- Compute an assay's OddsPath from its pathogenic and benign controls, and say why a perfectly discriminating assay with a small control set still cannot reach Very Strong
- Read a ClinVar record for its evidence rather than its label, and say why classifications move and why penetrance from families overstates risk in an unselected person

This chapter describes **how professionals reason**. It is not clinical advice, and nothing in it
should be used to make a decision about a real person's health.

## The core idea

A patient has a disease that looks genetic. Sequencing returns a variant. Someone must decide
whether that variant explains the disease — and the decision has consequences: surveillance
imaging, prophylactic surgery, testing relatives, reproductive choices.

The naive framing is that the variant either causes disease or it doesn't, and the job is to find
out which. That framing makes the output a property of the variant. It is not. The output is a
property of *what is currently known* — how many people have been sequenced, whether anyone ran
an assay, whether the family was large enough to observe segregation, whether anyone bothered to
curate the gene.

> **A variant classification is a statement about the evidence, not about the variant.** Two labs
> looking at the same variant on the same day can honestly disagree because they hold different
> evidence. The same lab can honestly change its mind next year without the variant having
> changed. "Uncertain significance" is not a claim that the variant is borderline — it is a claim
> that the evidence has not moved the probability far enough from its starting point in either
> direction.

The framework everyone uses looks like a checklist: twenty-eight lettered criteria, a set of
combining rules, five output tiers. Underneath it is **a naive Bayes classifier with hand-set
likelihood ratios** — likelihood ratios, priors and posteriors are covered in
[S6](../part-S-statistics/S6-likelihood-and-bayes.md), and this chapter assumes them. Each
criterion contributes an odds ratio; the strength tiers are a geometric ladder of those odds; the
combining rules are a coarse quantisation of "multiply the likelihood ratios into the prior".
Recognising that turns an arbitrary-looking rulebook into a model you can criticise — and every
important failure mode of the framework is a failure mode of naive Bayes: correlated evidence
double-counted, likelihood ratios asserted rather than measured, a prior that is not the same for
every gene.

The operative published standard is **Richards et al. 2015** (ACMG/AMP), refined by ClinGen
Sequence Variant Interpretation working-group recommendations and by gene- and disease-specific
Variant Curation Expert Panel specifications. A fourth version is in draft and pilot; §11 says
what is changing and why you should not yet use it
([reference/verified-facts.md](../reference/verified-facts.md)).

---

## 1. The five tiers

| Tier | Posterior P(pathogenic) | What it licenses |
|---|---|---|
| **Pathogenic** | > 0.99 | Diagnosis, management change, predictive testing of relatives |
| **Likely pathogenic** | 0.90 – 0.99 | In practice the same clinical actions as pathogenic |
| **Uncertain significance (VUS)** | 0.10 – 0.90 | **Nothing** |
| **Likely benign** | 0.001 – 0.10 | Removed from consideration; not reported by most labs |
| **Benign** | < 0.001 | Removed from consideration |

The probability boundaries are not decoration: the 2015 guideline defines "likely" as greater
than 90% certainty, and §3 shows the whole rule set is consistent with the boundaries above.

**Likely pathogenic is not a hedge.** A 90–99% posterior is acted on; P versus LP affects how a
report is worded, rarely how a patient is managed.

**VUS is the residual, and it is huge.** Any variant on which evidence has not accumulated lands
there — which, for a novel missense change in a poorly studied gene, is the default state of the
world. A VUS must not drive a clinical decision, must not be used to test relatives, and must not
be reported to a patient as "a mutation". The instruction is asymmetric and deliberate: acting on
a VUS as if pathogenic causes harm (unnecessary surgery), and acting on it as if benign causes
harm (missed diagnosis), so the correct action is neither — continue the workup by other means.

**VUS rates are unequally distributed, and that is a data problem.** Patients whose ancestry is
under-represented in reference databases and in the published literature receive more VUS
results, because both arms of the evidence base are thinner for their variants. The variants are
not more ambiguous; the evidence is more absent. Same causal story as polygenic-score
portability failure ([Ch 53](53-polygenic-scores.md)): biased sampling, not biology.

And a classification attaches not to a variant but to a **(variant, gene–disease pair,
laboratory, date)** tuple. The same variant can be pathogenic for one condition and irrelevant to
another, and a classification without its date is nearly uninterpretable.

## 2. The evidence framework

Criteria are named by side (**P** or **B**), strength, and index. On the pathogenic side: PVS
(very strong), PS (strong), PM (moderate), PP (supporting). On the benign side: BA
(stand-alone), BS (strong), BP (supporting).

| Category | Pathogenic | Benign | What is actually being measured |
|---|---|---|---|
| **Population frequency** | PM2, PS4 | BA1, BS1, BS2 | Is this variant rarer than a causal allele for this disease could be — or commoner than one could be? |
| **Predicted molecular effect** | PVS1, PS1, PM4, PM5, PP3 | BP1, BP3, BP4, BP7 | Does the sequence change plausibly break the protein, by the mechanism this disease uses? |
| **Location / constraint** | PM1, PP2 | — | Does it fall in a region where variation is not tolerated? |
| **Functional assay** | PS3 | BS3 | Does a validated experiment show loss (or retention) of function? |
| **Segregation** | PP1 | BS4 | Does it track with disease through meioses in families? |
| **De novo** | PS2, PM6 | — | Did it arise anew in an affected child of unaffected parents? |
| **Allelic / phase** | PM3 | BP2 | For a recessive gene, is it *in trans* with a known pathogenic allele? |
| **Phenotype specificity** | PP4 | BP5 | Is the phenotype so specific it implicates the gene — or already explained by something else? |
| **Retired** | ~~PP5~~ | ~~BP6~~ | "A reputable source says so." Withdrawn by ClinGen: it launders someone else's unexamined conclusion into your evidence |

Two deserve unpacking.

**PVS1** — a null variant (nonsense, frameshift, canonical ±1/±2 splice-site, initiation-codon
loss, whole-exon deletion) in a gene where loss of function is *an established mechanism of that
disease*. The final clause is the whole criterion. A stop codon in a gene whose mechanism is
dominant-negative is not evidence of pathogenicity, and may be evidence against: a truncated
transcript degraded by nonsense-mediated decay
([Ch 06](../part-01-molecular-foundations/06-rna-processing.md)) produces no poison peptide at
all. The ClinGen refinement replaces the flat criterion with a decision tree that sets strength
from whether NMD is predicted, how much protein is removed, whether a skipped exon preserves
frame, and whether an alternative start codon rescues translation. A frameshift in the last exon
is not the same evidence as one in exon 2, and the tree says so.

**PM2** — absent from population databases. The 2015 text made this Moderate; ClinGen recommends
**Supporting**, on a base-rate argument: almost every variant is absent from almost every
database, because the space of possible variants vastly exceeds the number sampled. Rarity is
what benign and pathogenic rare variants have in common, so observing it barely moves the odds.
§4 makes that quantitative.

### The combining rules

**Pathogenic** if any of:

```
PVS1 + (≥1 Strong | ≥2 Moderate | 1 Moderate + 1 Supporting | ≥2 Supporting)
≥2 Strong
1 Strong + (≥3 Moderate | 2 Moderate + ≥2 Supporting | 1 Moderate + ≥4 Supporting)
```

**Likely pathogenic** if any of:

```
PVS1 + 1 Moderate
1 Strong + 1–2 Moderate
1 Strong + ≥2 Supporting
≥3 Moderate
2 Moderate + ≥2 Supporting
1 Moderate + ≥4 Supporting
```

**Benign** if `BA1` alone, or `≥2 Strong`. **Likely benign** if `1 Strong + 1 Supporting` or
`≥2 Supporting`. **Uncertain** otherwise — including when pathogenic and benign criteria are
both met and conflict.

Read those as arithmetic and a pattern appears: one Very Strong behaves like two Strong, one
Strong like two Moderate, one Moderate like two Supporting. That is not a coincidence.

## 3. The Bayesian reformulation

Tavtigian and colleagues asked whether the rules above quantise an actual model, and found that
they do — to a remarkable degree.

> **Statistics:** the odds form of Bayes — prior odds × likelihood ratio = posterior odds — is
> covered in [S6](../part-S-statistics/S6-likelihood-and-bayes.md) §4–5, and
> [S6 §7.3](../part-S-statistics/S6-likelihood-and-bayes.md) runs this exact reconstruction in
> code. Bayes for events is [S1](../part-S-statistics/S1-probability.md) §5.

Posit a **naive Bayes classifier**. Let π be the prior probability that a variant submitted for
classification is pathogenic, and let each criterion *i* contribute an odds of pathogenicity
OddsPathᵢ — the likelihood ratio *P*(evidence | pathogenic) / *P*(evidence | benign). Then

$$\text{Odds}_{\text{post}} = \pi/(1-\pi) \times \prod_i \text{OddsPath}_i$$

Now impose the structure visible in the combining rules: the strength tiers form a **geometric
ladder**, each step squaring the one below. Fix the Very Strong odds at *X*; then

```
Very Strong = X          Strong = X^(1/2)      Moderate = X^(1/4)      Supporting = X^(1/8)
```

Taking logs, that ladder makes the evidence **additive in units of the Supporting step** — so
assign points: Supporting **1**, Moderate **2**, Strong **4**, Very Strong **8**, negative on
the benign side. Total points *N* gives OddsPath = *X*^(N/8), and

$$P_{\text{post}} = \frac{\pi \cdot X^{N/8}}{\pi \cdot X^{N/8} + (1-\pi)}$$

With **π = 0.10** and **X = 350** the boundaries fall out:

| Points *N* | OddsPath = 350^(N/8) | Posterior | Tier |
|---:|---:|---:|---|
| 10 | 1514 | 0.9941 | **Pathogenic** (> 0.99) |
| 6 | 80.9 | **0.8999** | Likely pathogenic — the 0.90 boundary, exactly |
| 5 | 38.9 | 0.8122 | VUS |
| 0 | 1 | 0.1000 | VUS — the prior, untouched |
| −6 | 0.0124 | 0.00137 | Likely benign |
| −7 | 0.00594 | 0.00066 | **Benign** (< 0.001) |

The point thresholds **≥10 / 6–9 / 0–5 / −1 to −6 / ≤−7** reproduce the posterior cut-points
0.99, 0.90, 0.10 and 0.001 essentially exactly. Sixteen of the eighteen 2015 combining rules
are internally consistent with this arithmetic. Two are not, and they are worth checking
yourself:

- **`≥2 Strong` → Pathogenic.** Two Strong is 8 points, OddsPath 350, posterior
  35/35.9 = **0.975** — which is Likely pathogenic, not Pathogenic.
- **`PVS1 + 1 Moderate` → Likely pathogenic.** That is 10 points, posterior **0.994** — which is
  Pathogenic.

Neither discrepancy is scandalous; both are what you get when a committee quantises a continuous
model by hand. What the reformulation buys is enormous:

**Criteria become measurable rather than asserted.** If a criterion is an odds ratio you can
*estimate* it — count how often the evidence appears among known pathogenic versus known benign
variants. That single move is what makes §5 and §6 possible, and it is why the field is migrating
from "does this criterion apply?" to "at what strength?".

**Intermediate strengths become legal.** `PP3_Moderate`, `PS3_Supporting`, `PM2_Supporting` are
not fudges; they are the model used at its natural resolution.

**The prior becomes visible, and contestable.** π = 0.10 is the prior for a variant *arriving in
a classification queue*, not for a random position in the genome. Different calibration exercises
legitimately use different priors — the ClinGen computational-predictor calibration used
π = 0.0441 with *X* = 1124, giving the same geometric ladder (2.41, 5.79, 33.5, 1124) on a
different footing. The framework is parameterised by (π, *X*), and both are modelling choices.

**And the model's weakness becomes explicit.** Multiplying likelihood ratios assumes the evidence
is conditionally independent given pathogenicity. It very often is not, and every double-counting
problem in the rest of this chapter is that assumption failing.

Points-based implementations follow directly, and several VCEP specifications and clinical
pipelines now score variants that way. The tiers are unchanged; only the bookkeeping is.

## 4. Population frequency, and why "rare" is not a number

gnomAD is the workhorse: **730,947 exomes + 76,215 genomes = 807,162 individuals**, aligned to
GRCh38 — roughly 1.6 million alleles at a well-covered site
([reference/verified-facts.md](../reference/verified-facts.md)). It is the single most
informative resource in clinical interpretation, and it is used in both directions.

The mistake is to reach for a fixed threshold. Whether a frequency is disqualifying depends
entirely on the disease.

### Deriving the maximum credible allele frequency

Let *D* be disease prevalence, *g* the largest fraction of cases attributable to this gene
(genetic heterogeneity), *a* the largest fraction of *those* attributable to a single variant
(allelic heterogeneity), and ψ the penetrance. For a dominant condition, affected carriers of
this variant are a fraction *D·g·a* of the population; since only ψ of carriers are affected,
carriers are *D·g·a*/ψ; and since each carrier holds one of their two alleles:

$$\text{AF}_{\max} = \frac{D \cdot g \cdot a}{2\psi}$$

For a recessive condition affected individuals are homozygous, so under Hardy–Weinberg
([Ch 26](../part-05-population-genetics/26-hardy-weinberg.md)) the corresponding bound is
√(*D·g·a*/ψ).

Take hypertrophic cardiomyopathy: prevalence ≈ 1/500. The largest single-gene contributor is
*MYBPC3*, at roughly 20% of cases; *MYH7* is next, at roughly 14% (Sedaghat-Hamedani et al.,
*Clin Res Cardiol* 2018, meta-analysis of 7,675 patients), so for *MYH7* take *g* ≈ 0.14. Extreme
allelic heterogeneity gives *a* ≈ 0.02, and penetrance is age-dependent, ψ ≈ 0.5.

```
AF_max = (2.0e-3 × 0.14 × 0.02) / (2 × 0.5)
       = 5.6e-6 / 1.0
       = 5.6 × 10⁻⁶          ≈ 9 alleles in gnomAD's ~1.6 million
```

A variant seen forty-odd times in gnomAD — a raw frequency of 2.5 × 10⁻⁵, with a lower 95% bound
near 1.9 × 10⁻⁵ — is therefore several times commoner than this model says a *MYH7* HCM allele
could be. Change the assumptions and the answer moves fourfold: at *a* = 0.005 the bound is
1.4 × 10⁻⁶, about 2 alleles. **The threshold is a model output, not a constant** — which is why
VCEPs publish a disease-specific cut-off rather than leaving it to the curator, and why
**BA1 at 5%**, the 2015 framework's one frequency criterion needing no disease model, is its only
stand-alone criterion.

Two cautions before using a number like that in anger, and they are the reason a curator checks
for a specification before deriving anything.

**Where a VCEP has published thresholds, the thresholds govern — and they are looser than the
theoretical bound.** The ClinGen Cardiomyopathy Expert Panel's *MYH7* specification (v2.0,
approved April 2024) sets **BA1 at a filtering allele frequency ≥ 0.1%**, **BS1 at FAF ≥ 0.01%**,
and **PM2_Supporting at an upper 95% bound ≤ 0.004%** in the popmax group — which the panel spells
out as no more than about four alleles in an allele number of 230,000. On the panel's numbers our
forty-allele variant earns *neither*: its filtering allele frequency of ~1.9 × 10⁻⁵ is about
fivefold below the BS1 line, and forty alleles is far too many for PM2. The gap between
5.6 × 10⁻⁶ and 10⁻⁴ is not an error in either direction — the derivation
gives the frequency above which pathogenicity is *implausible*, and the panel sets the frequency
above which a curator may assert benignity and expect to be right nearly always. A benign call is
acted on, so the panel buys margin.

**And the two bounds are computed on different denominators.** The 1.9 × 10⁻⁵ above came from all
~1.6 million alleles; a filtering allele frequency, defined next, is a *popmax* quantity computed
in the single ancestry group where the variant is commonest, where the allele number is much
smaller and the interval correspondingly wider. A global lower bound is a stand-in for the real
thing, and it is the optimistic stand-in.

### Filtering allele frequency, and the other direction

A raw count is a point estimate; you want a bound — and which end of the interval you need
depends on which way you argue.

> **Statistics:** confidence intervals on a rare allele count, and the rule of three for zero
> observations, are covered in [S3](../part-S-statistics/S3-sampling-and-estimation.md) §5 and §8.

To argue **too common** (BS1/BA1) you must be confident the frequency is genuinely high, so take
the **lower** 95% bound. That is the **filtering allele frequency**: the lower limit of the 95%
interval on the allele frequency in the genetic ancestry group where the variant is *commonest*,
the group choice guarding against a variant that looks rare globally only because the group
carrying it is a small share of the database. If FAF still exceeds AF_max, the variant is too
common even under the assumptions most favourable to pathogenicity.

To argue **informatively absent** (PM2) you need the opposite end. Zero observations in ~1.6
million alleles bounds the frequency *above* by roughly 3/1.6 × 10⁻⁶ ≈ **1.9 × 10⁻⁶** — the rule
of three. That sits below HCM's AF_max of 5.6 × 10⁻⁶, so absence genuinely excludes the "too
common" hypothesis. For a disease whose AF_max is 10⁻⁷ it excludes nothing: the database cannot
resolve frequencies that low. **Absence is informative only when the database resolves the
threshold that matters** — and even then, most benign rare variants are absent too, which is the
base-rate argument for PM2 at Supporting.

Four standing caveats on the database itself:

| Caveat | Consequence |
|---|---|
| gnomAD is not a healthy cohort | Severe paediatric disease is excluded; adults with late-onset conditions are not. For adult-onset disease, carriers are present by design |
| Ancestry composition is uneven | A variant common in an under-sampled population looks rare. Using the highest-frequency group helps only for groups actually sampled |
| Coverage varies by site | Allele *number* varies; a low AF over a low AN is meaningless. Read AN, not just AF |
| Homozygotes are separate evidence | For a fully penetrant early-onset recessive condition, healthy homozygotes are BS2 — a cleaner argument than frequency |

## 5. Computational predictors

The 2015 text asks for "multiple lines of computational evidence" at Supporting strength. That
phrasing invited exactly the wrong behaviour, and the correction is the clearest illustration of
the naive-Bayes problem in the whole framework.

**They are not independent.** Most missense predictors read the same underlying signal:
cross-species conservation at the residue, derived from a multiple sequence alignment. Physical
features (buried versus exposed, charge, proline in a helix) are shared too. Worse, the popular
"consensus" tools are *literal ensembles of each other* — REVEL is a random forest over the
scores of thirteen other predictors. Recording that SIFT, PolyPhen-2 and REVEL agree is not three
observations; it is one observation consulted three times, and multiplying three likelihood
ratios for it inflates the evidence by roughly the square of what it should be.

**They are contaminated by their evaluation sets.** Supervised predictors are trained on labelled
variants, and the labels come from ClinVar and HGMD. Evaluating such a tool on ClinVar measures
memorisation as much as generalisation, so published AUCs are systematically optimistic. Honest
calibration must exclude training-set overlap — the ClinGen exercise did, which is part of why
its thresholds are more conservative than tool developers' defaults.

**They are uneven across genes.** Accuracy depends on alignment depth, paralogue structure and how
well the gene was represented in training, so performance is worst precisely in poorly studied
genes — the ones where you needed help. And a predictor trained to recognise "damaging"
generalises badly to **gain-of-function** mechanisms, where the pathogenic variant may be
biophysically mild.

### The shift to likelihood ratios

Stop asking "is the score above the tool's threshold?" and start asking "what likelihood ratio
does *this score* carry?" ClinGen's calibration took ~11,800 curated ClinVar variants across
~1,900 genes, estimated the local posterior as a function of score, and read off the intervals
where each tool reaches Supporting, Moderate, Strong and Very Strong. For REVEL, with π = 0.0441:

```
  BP4 very strong   BP4 str    BP4 moderate    BP4 sup   INDETERMINATE   PP3 sup    PP3 mod    PP3 strong
 |───────────────|──────────|───────────────|──────────|──────────────|──────────|──────────|───────────|
 0            0.003      0.016           0.183      0.290          0.644      0.773      0.932         1
```

Three things to take from that picture. There is an explicit **indeterminate band** — middling
scores carry no evidence in either direction, and "REVEL = 0.5, mildly suggestive" is reporting
noise. The scale is **asymmetric**: REVEL reaches Very Strong on the benign side but only Strong
on the pathogenic side, because a low score is the more reliable signal. And the evidence is
**counted once**: one calibrated predictor at its calibrated strength, not a show of hands.

Splice-effect prediction is a separate axis with its own calibration, supplying PP3/BP4 for
variants a missense predictor cannot see at all — deep-intronic and synonymous changes
([Ch 06](../part-01-molecular-foundations/06-rna-processing.md)). Proteome-scale models raise the
ceiling on coverage but repeal none of the three problems above: they still need independent
calibration, still risk circularity with the label sets, and still cannot know a gene's disease
mechanism.

## 6. Functional evidence and MAVEs

PS3/BS3 ask whether a validated experiment shows the variant damages (or spares) function. The
word doing the work is *validated*. A published assay showing "reduced activity" is not evidence
until you know how well it discriminates variants you already know the answer for.

The ClinGen approach converts an assay into an odds ratio using control variants. Run it over
known pathogenic and known benign variants; let *P*₁ be the proportion pathogenic among all
controls (the assay-specific prior) and *P*₂ the proportion pathogenic among controls the assay
calls abnormal. Then

$$\text{OddsPath}_{\text{abnormal}} = \frac{P_2\,(1 - P_1)}{(1 - P_2)\,P_1}$$

> **Statistics:** why a ratio of proportions like this *is* a likelihood ratio, and what a
> likelihood ratio buys as evidence, are covered in
> [S6](../part-S-statistics/S6-likelihood-and-bayes.md) §4.

and the resulting odds map onto the strength ladder of §3 — roughly 2.1 Supporting, 4.3 Moderate,
18.7 Strong, 350 Very Strong on the (π = 0.10, *X* = 350) scale. An assay with eleven pathogenic
and eleven benign controls that separates them perfectly still cannot exceed Strong, because the
control set is too small to estimate an odds ratio of 350. **The strength of functional evidence
is a property of the assay's validation, not of how impressive the experiment looks.**

### Multiplexed assays of variant effect

The classical workflow is patient first, variant second, assay third — months of work per variant,
and only for variants someone already cared about. **Deep mutational scanning** inverts it.
Synthesise every possible single-amino-acid substitution across a domain or a whole protein, put
the library into cells under a selection that depends on the protein working, sequence the
population before and after, and read each variant's fitness from its change in frequency
([Ch 37](../part-08-methods/37-model-organisms-and-screens.md)). One experiment scores thousands
of variants — including ones no patient has yet been found to carry.

That inversion is the point: the functional evidence is *already in the database* when the
patient's result arrives, converting the rate-limiting step of interpretation from months to a
lookup. Calibrated against ClinVar controls with the OddsPath machinery above, well-designed MAVEs
routinely reach Moderate or Strong, and their effect on VUS burden in the genes they cover is
large.

The limits are biological. An assay measures *one* function; a protein with several (catalysis,
localisation, partner binding, stability) can be spared in the assayed dimension and broken in
another, so a normal score is weaker evidence than an abnormal one unless the assay is known to
capture the disease mechanism. A non-native cell type or non-physiological expression can mask
dominant-negative effects entirely. And the calibration controls are themselves ClinVar
classifications, so the circularity of §5 has not gone away — it has moved.

## 7. Segregation, de novo, and phase

**Segregation** (PP1/BS4) is a likelihood ratio you can compute exactly, and one of the oldest
ideas in the book ([Ch 14](../part-02-transmission-genetics/14-linkage-and-mapping.md)). If the
variant is causal and fully penetrant, every affected relative carries it and every unaffected one
does not; under the null each informative meiosis is a coin flip. So *m* meioses all going the
right way give LR = 2^*m*, or LOD ≈ 0.3*m*. ClinGen guidance, following Jarvik and Browning, sets
thresholds for a **single family** at 3 informative meioses for Supporting (LR 8, LOD ≈ 0.9), 4 for
Moderate (LR 16, LOD ≈ 1.2), 5 for Strong (LR 32, LOD ≈ 1.5) — each threshold one meiosis lower
when the evidence comes from two or more families. Compare those to §3's ladder — Supporting is
2.1, Moderate 4.3, Strong 18.7 — and the criteria are demanding roughly two- to fourfold more
evidence than the nominal strength requires. That conservatism is deliberate: relatives are not
independent draws, penetrance is rarely complete, and families are reported because they segregate,
so the naive 2^*m* overstates the case.

Two limits bound it. Segregation implicates a **locus, not a variant**: anything in linkage
disequilibrium with the causal change segregates identically
([Ch 29](../part-05-population-genetics/29-linkage-disequilibrium.md)). And it saturates —
reaching Very Strong requires a pedigree larger than most families are, which is why segregation
is a supporting player in the modern framework rather than the centrepiece it was in 1990.

**De novo** evidence (PS2 confirmed, PM6 assumed) is strong because the coincidence is
improbable: roughly 60–70 new mutations arise per diploid genome per generation
([Ch 16](../part-03-genome-instability/16-mutation.md)), so one landing in a gene that matches
the child's phenotype is unlikely by chance. Strength comes from a point system over two axes —
how specific the phenotype is for the gene, and whether parentage was genetically confirmed
rather than assumed — accumulated across probands, with 0.5 points reaching Supporting, 1
Moderate, 2 Strong, 4 Very Strong. A confirmed de novo in a syndrome with a near-unique genetic
cause scores 2 points alone; the same observation in a genetically heterogeneous condition scores
0.5, because dozens of genes could have produced that phenotype. Unconfirmed parentage is not a
technicality: a "de novo" variant actually inherited from an unaffected biological father is
evidence of the opposite thing.

**Phase** matters for recessive conditions. Two heterozygous variants in one gene explain disease
only *in trans* — one on each haplotype; in cis they leave an intact copy and explain nothing. PM3
rewards a variant found in trans with a known pathogenic allele, BP2 penalises the reverse. Phase
comes from genotyping the parents or from long reads spanning both sites, and is exactly what
short-read calling discards ([Ch 46](../part-10-functional-genomics/46-variant-calling.md)) — a
trio is worth far more than a proband alone for this reason as much as for de novo detection.

## 8. ClinVar, and how to read it

ClinVar is the public archive where laboratories deposit classifications with supporting
evidence. As of 8 August 2026 it holds **6.9 million submitted records** covering **4.55 million
unique variants** from **3,485 submitters**. It is the reason a lab in one country benefits from a
family studied in another, and no serious pipeline runs without it.

It is also an archive of *submitted assertions*, not a truth set, and the difference is where
people get hurt.

**Submissions disagree.** **165,877 unique variants carry conflicting classifications.** Conflicts
are not noise to be averaged away; they usually mean the submitters held different evidence,
applied different gene-specific criteria, or submitted years apart.

**Submitter quality is not uniform**, and the star rating exists to say so:

| Stars | Review status | What it means |
|---:|---|---|
| 0 | No assertion criteria | No stated method. Treat as an anecdote |
| 1 | Single submitter with criteria, **or** conflicting classifications | One lab's method — or submitters who disagree. Read every submission |
| 2 | Multiple submitters, no conflicts | Independent agreement |
| 3 | Reviewed by expert panel | A ClinGen VCEP applied a gene-specific specification |
| 4 | Practice guideline | The highest tier, and rare — **663** variants |

About **22,000** variants carry expert-panel review — a small fraction of 4.55 million, and where
the framework works as designed: a VCEP publishes a gene-specific specification *in advance*
(which frequency threshold, which domains earn PM1, which assays are calibrated and at what
strength) and then applies it. Those records you can lean on; the rest require you to look at the
evidence.

> **Read the evidence, not the label.** A one-star "pathogenic" submission from 2016, citing a
> single case report and a computational prediction, is not evidence that the variant is
> pathogenic. It is evidence that someone once thought so. The 2015 criteria PP5 and BP6 — which
> allowed you to count "a reputable source says pathogenic" as evidence — were retired for
> exactly this reason: they let one lab's unexamined conclusion propagate through everyone
> else's classification as if it were an independent observation.

That propagation closes a loop worth stating plainly: ClinVar labels train computational
predictors; predictor scores supply PP3/BP4 evidence; that evidence feeds new classifications;
those classifications are submitted to ClinVar. Any systematic error entering the loop is
amplified rather than corrected. Excluding training-set overlap during calibration, and
preferring expert-panel records as controls, are attempts to cut the circuit — not solutions.

## 9. Reclassification, and the obligation it creates

Classifications move, and not symmetrically. In a large hereditary-cancer testing cohort, **7.7%
of unique VUSs were reclassified** and **91.2% of those were downgraded** to likely benign or
benign, median 1.17 years to an amended report. Because common variants are seen in many
patients, roughly a quarter of *reported* VUS results were affected.

The direction follows from how evidence accumulates. Databases grow, an absent variant acquires a
frequency, that frequency usually exceeds what a causal allele's could be, BS1 applies, and the
variant leaves the uncertain zone downward. Genuinely pathogenic variants are rescued more slowly,
by functional data and by segregation in further families. So the base case for a VUS is that it
is benign and will eventually be shown to be — which is emphatically *not* a licence to treat one
as benign today.

This creates an obligation with no clean engineering answer. A clinical report is a **snapshot of
the evidence on its issue date**, but it is read years later as a fact. Someone must notice the
evidence changed, find the patient, and tell them — and health systems have no reliable callback
mechanism. The workable pattern is to make re-evaluation a scheduled batch job over the lab's own
case archive rather than an event triggered by a patient's return, and to stamp the report with
an as-of date. Who owns the duty to recontact is
[Ch 58](../part-12-applications-and-ethics/58-ethics-and-society.md).

## 10. Secondary findings

Sequence an exome for epilepsy and you also, incidentally, sequenced *BRCA1*. What do you do with
a pathogenic variant nobody asked about?

The terms differ by intent: an **incidental finding** is stumbled upon, a **secondary finding** is
one you deliberately went looking for outside the indication. The ACMG position is that a defined,
minimal list of genes should be *actively* analysed and reported, with patient opt-out. The
current list is **ACMG SF v3.3** (2025): **84 genes** — hereditary cancer syndromes, inherited
cardiovascular conditions, a few metabolic disorders — updated annually.

The list is short on purpose. The inclusion criterion is **actionability**: there must be an
intervention that changes outcome for someone who does not yet know they are at risk. Not
"interesting", not "well understood", not "severe". A gene for an untreatable adult-onset
neurodegenerative condition fails the test however confident the genetics — a value judgement the
working group makes explicitly rather than a scientific conclusion. Reporting is restricted to
pathogenic and likely pathogenic variants; never a VUS, which would deliver anxiety with no
information.

One statistical point here is easy to miss and matters enormously:

> **Penetrance estimated from families ascertained through affected members overstates
> penetrance in an unselected person.** A variant catalogued as pathogenic because it was found
> in families full of early-onset cancer was, by construction, observed in families where it did
> something. The same variant found in a population biobank, in someone with no family history,
> is associated with a substantially lower lifetime risk. The variant did not change; the
> sampling did.

That is ordinary selection bias, and it is why a secondary finding warrants a probabilistic
conversation about risk rather than a diagnosis, and why penetrance estimates from unselected
biobanks, where they exist, are the right ones to quote.

## 11. What is coming: ACMG v4

A fourth version is in **draft and multi-site pilot**, previewed at the ACMG 2025 Clinical
Genomics Meeting, with publication anticipated around 2027 and a transition period after that.
The direction of travel, as far as the drafts and pilot reports show: evidence codes
**consolidated** around concepts rather than accumulated numbering, so related observations
cannot be counted twice — the naive-Bayes problem attacked structurally rather than by errata;
**decision trees** for each evidence type, generalising what the PVS1 tree did for null variants;
**gene–disease validity** entering the classification itself rather than sitting beside it as an
unstated precondition; and **VUS subdivided** by likelihood of pathogenicity, so a variant at
posterior 0.85 and one at 0.15 stop sharing a label.

The five tiers and the Bayesian skeleton survive. Until publication, **2015-plus-ClinGen-plus-VCEP
is the standard in clinical use**, and a report issued today against a draft standard is not
interpretable by the people who receive it.

---

## Common misconceptions

| What people think | What's actually true |
|---|---|
| A VUS is a variant that is probably borderline | It is a variant whose *evidence* has not moved the posterior out of 0.10–0.90. Most VUSs are benign variants nobody has gathered evidence about yet. It licenses no clinical action and no testing of relatives — "cautious" action on a VUS is action on a VUS |
| Classifications are properties of variants | They are properties of (variant, gene–disease pair, lab, date). Two labs can honestly disagree today; one lab can honestly reverse itself next year |
| Three predictors agreeing is strong computational evidence | Predictors share features, share alignments, and are literally built from each other. Use one calibrated predictor, once, at its calibrated strength |
| Absent from gnomAD means it must be pathogenic; above 1% means it can't be | Almost every variant is absent from almost every database, so absence is informative only if the database resolves the disease's maximum credible frequency — hence PM2 at Supporting. And the "too common" threshold is derived from prevalence, penetrance and heterogeneity, varying by orders of magnitude between diseases. Only BA1 at 5% needs no disease model |
| A published functional study establishes PS3 | Not until the assay is calibrated against known pathogenic and benign controls. The strength comes from the validation, not the experiment |
| A truncating variant is pathogenic | Only where loss of function is an established mechanism for *that* disease, and the ClinGen decision tree downgrades it by NMD prediction, position and rescue |
| Pathogenic in ClinVar means pathogenic | 165,877 variants carry conflicting submissions, and a zero-star submission states no method at all. Read the evidence and the review status |
| A pathogenic secondary finding means the person will get the disease | Penetrance from families ascertained through affected members overstates risk in someone found incidentally. Same variant, different sampling |

## Worked example: classifying one variant

**This case is constructed.** The variant and every observation are invented to exercise the
framework; nothing here is a claim about the real residue named.

A 34-year-old proband with echocardiographically confirmed hypertrophic cardiomyopathy. Panel
sequencing returns one candidate:

```
NM_000257.4(MYH7):c.2221G>C   p.(Ala741Pro)
```

The `p.` term is parenthesised because the protein consequence is predicted, not observed. The
gene is *MYH7*; the protein is MYH7, β-myosin heavy chain. Codon 741 spans c.2221–2223 and falls
in the converter domain. A substitution has one representation, so nothing is ambiguous here —
but had the candidate been an indel, the transcript-level HGVS (3′-most on the transcript) and
the VCF row (left-aligned on the genome) would shift in opposite genomic directions for a
minus-strand gene ([Ch 41](../part-09-genomics/41-data-formats.md)). Normalise before joining to
any database.

**Step 0 — is the gene–disease relationship valid, and is there a specification?** *MYH7* has
definitive evidence for HCM. If it did not, no amount of variant-level evidence would rescue the
classification. This check comes first — and it comes paired with a second one that curators skip
and should not: **look up whether a Variant Curation Expert Panel has published a specification
for this gene before deriving anything yourself.** One has. The ClinGen Cardiomyopathy Expert
Panel's *MYH7* specification is at v2.0, approved April 2024, and it overrides the general
framework in two places below.

**Step 1 — mechanism.** *MYH7* HCM is not a loss-of-function disease; the mechanism is
dominant-negative, a mutant myosin incorporated into the sarcomere. So **PVS1 is unavailable** —
and would remain unavailable even for a nonsense variant here, because haploinsufficiency is not
the mechanism. **BP1** ("missense in a gene where truncating variants cause disease") is
inapplicable in the opposite direction: missense is the expected class.

**Step 2 — population frequency.** Absent from gnomAD v4 (0/~1.6 × 10⁶ alleles). From §4, AF_max
for HCM via *MYH7* is 5.6 × 10⁻⁶, and the rule-of-three bound from absence is 1.9 × 10⁻⁶ — below
it, so absence is genuinely informative here. The specification agrees by its own route: its
PM2_Supporting threshold is an upper 95% bound ≤ 4 × 10⁻⁵ in the popmax group, which zero
observations anywhere clears easily.

> **PM2_Supporting.** +1 point.

**Step 3 — location.** Codon 741 lies in the converter domain, inside the codon 167–931 window the
same specification designates as enriched for pathogenic variants and depleted of benign
variation.

> **PM1** (Moderate). +2 points.

Note what is *not* also claimed. PP2 ("missense in a gene with a low rate of benign missense
variation") is true of *MYH7*, but counting it as well double-counts one constraint observation —
precisely the naive-Bayes error §3 warns about. The specification folds it into PM1.

**Step 4 — computation, and the first place the specification overrides.** REVEL = 0.89. On the
general ClinGen calibration of §5 that falls in [0.773, 0.932) and would earn `PP3_Moderate`. The
*MYH7* specification does not permit it: it approves PP3 **at Supporting only**, against a single
REVEL threshold of ≥ 0.70, on the reasoning that predictors share inputs and should not be
counted as independent criteria. Every higher strength is marked not applicable for this gene.
Where a specification exists, it governs, and the general calibration is what you use when one
does not. A splice predictor returns a near-zero delta score, so nothing is claimed from splicing
either way.

> **PP3** (Supporting). +1 point. *Not* PP3_Moderate — that is the general calibration, and this
> gene has its own.

**Step 5 — de novo, and the second override, running the other way.** Both parents are clinically
unaffected on imaging, neither carries the variant, and parentage is genetically confirmed. HCM is
genetically heterogeneous — a dozen sarcomere genes could produce this phenotype — so the general
SVI point scale of §7 would take the heterogeneity row and score 0.5, reaching Supporting. The
specification says otherwise: for most cardiomyopathies it directs the curator to *default* to
"phenotype consistent with gene but not highly specific", which for a confirmed de novo is 1
point — Moderate — and to shift up or down only with stated clinical judgement.

> **PS2_Moderate.** +2 points.

Notice what just happened. Two lookups in the same specification moved this case in opposite
directions by the same amount, and a curator who applied the first and not the second would have
reported a different classification than a curator who applied neither. **Consistency about
*which* rulebook you are in matters more than the individual calls.**

**Step 6 — what is unavailable, and why.** PS4 (case-control excess) needs the variant seen in
other cases; this one is private. PM5 needs a *different* pathogenic missense at codon 741; none
is reported — and note that even if one were, the specification forbids counting PM5 alongside
PM1, because pathogenic variants at the same codon are part of what defined the cluster PM1 is
built on. That is the PP2 problem of Step 3 again, one criterion over: the same observation
wearing two names. PP1 needs affected relatives; the case is sporadic and de novo, so there are no
informative meioses. PS3 needs a calibrated assay; none has been run.

**Step 7 — tally.**

```
PM1               Moderate     +2
PS2_Moderate      Moderate     +2
PM2_Supporting    Supporting   +1
PP3               Supporting   +1
                               ---
                                6 points
```

By the 2015 combining rules: two Moderate plus two Supporting → **Likely pathogenic**.
By the points system: 6 points → OddsPath = 350^(6/8) = 80.9 → posterior
8.09/8.99 = **0.900** → Likely pathogenic. The two agree, and the agreement is not luck (§3).

**Step 8 — read the margin honestly.** This is Likely pathogenic *by exactly one point*. Drop
either supporting criterion and it is 5 points, posterior 0.812 — a VUS. And as Step 5 noted,
applying the specification to one of PP3 and PS2 but not the other lands on 5 or 7 points instead:
the call rests on two judgements that happen to cancel. A call sitting on a tier boundary should
be reported as one, and is the strongest possible argument for generating more evidence.

**Step 9 — what would move it.** Suppose a calibrated deep mutational scan of the *MYH7* motor
domain now exists.

| New evidence | Points | Total | Posterior | Call |
|---|---:|---:|---:|---|
| Assay abnormal, OddsPath ≈ 4.3 → PS3_Moderate | +2 | 8 | 0.975 | Likely pathogenic |
| Assay abnormal, OddsPath ≈ 18.7 → PS3 (Strong) | +4 | 10 | 0.994 | **Pathogenic** |
| Assay normal, calibrated → BS3_Moderate | −2 | 4 | 0.675 | **VUS** |

One experiment, three different clinical reports. The variant was identical in all three rows —
which is the chapter's thesis stated as a table.

## Connections

- **Back to:** [Ch 14 — Linkage and mapping](../part-02-transmission-genetics/14-linkage-and-mapping.md)
  and [Ch 15 — Pedigrees](../part-02-transmission-genetics/15-pedigrees.md) supply the segregation
  LOD · [Ch 26 — Hardy–Weinberg](../part-05-population-genetics/26-hardy-weinberg.md) supplies the
  recessive frequency bound · [Ch 16 — Mutation](../part-03-genome-instability/16-mutation.md)
  supplies the de novo rate that makes PS2 strong ·
  [Ch 41 — Data formats](../part-09-genomics/41-data-formats.md) supplies normalisation and the
  HGVS/VCF shift conflict ·
  [Ch 46 — Variant calling](../part-10-functional-genomics/46-variant-calling.md) supplies callable
  regions, without which a negative result is uninterpretable ·
  [Ch 54 — Rare variants and Mendelian disease](54-rare-variants-and-mendelian-disease.md) supplies
  the candidate this chapter classifies
- **Forward to:** [Ch 56 — Cancer genomics](56-cancer-genomics.md) — somatic variants use a
  different, tier-based framework built on actionability rather than causation ·
  [Ch 57 — Genomics in practice](../part-12-applications-and-ethics/57-genomics-in-practice.md) —
  how a classification becomes a report and a clinical decision ·
  [Ch 58 — Ethics, privacy and society](../part-12-applications-and-ethics/58-ethics-and-society.md)
  — consent for secondary findings, the duty to recontact, and who is disadvantaged by an
  unrepresentative evidence base

## Check yourself

**1. A lab reports a VUS. The patient asks whether they should have the preventive surgery their affected sister had. What is wrong with the question, and what has the lab actually said?**

<details><summary>Answer</summary>

The question assumes the classification carries information about the patient's risk. It does
not. "Uncertain significance" says the evidence has failed to move the posterior out of roughly
0.10–0.90 — a statement about the state of the evidence base, not a measurement of a borderline
variant.

A VUS licenses no clinical action: not surgery, not surveillance changes, not predictive testing
of relatives. Acting as if pathogenic risks unnecessary irreversible harm; acting as if benign
risks a missed diagnosis; so the answer is neither, and the diagnostic question is pursued by
other means — phenotyping, other genes, and evidence-gathering on the variant itself (segregation
in the family, a calibrated assay, waiting for databases to grow).

</details>

**2. A curator writes: "SIFT deleterious, PolyPhen-2 probably damaging, REVEL 0.81 — three lines of computational evidence, so PP3 at Strong." Two things are wrong. What?**

<details><summary>Answer</summary>

**The evidence is counted three times.** These are not independent observations. They read
overlapping features — above all the same cross-species alignment — and REVEL is an ensemble
whose inputs include SIFT and PolyPhen-2. Multiplying three likelihood ratios for one underlying
signal inflates the evidence roughly quadratically. The recommendation is one calibrated
predictor, counted once.

**The strength is invented.** Strength is not conferred by the number of agreeing tools; it is
read off the calibrated score intervals for the tool in use. REVEL 0.81 falls in [0.773, 0.932) —
**PP3_Moderate**, not Strong, which would require ≥0.932.

The correct entry is a single `PP3_Moderate`, worth 2 points — *unless* a Variant Curation Expert
Panel has published a specification for this gene that caps PP3 lower, as the *MYH7* panel does.
Check for one before applying the general calibration.

</details>

**3. A variant appears 14 times in gnomAD (~1.6 million alleles). Is it too common to cause an autosomal dominant disease with prevalence 1/10,000, maximum single-gene contribution 20%, maximum single-allele contribution 5%, and penetrance 0.8?**

<details><summary>Answer</summary>

Compute the maximum credible allele frequency:

```
AF_max = D·g·a / (2ψ) = (1.0e-4 × 0.20 × 0.05) / (2 × 0.8)
       = 1.0e-6 / 1.6
       = 6.25 × 10⁻⁷
```

That is about **1 allele in 1.6 million**, so the maximum credible count in this database is
about one. Fourteen observations give a point estimate of 8.75 × 10⁻⁶ — fourteen times the
threshold — and the 95% *lower* bound remains well above 6.25 × 10⁻⁷. **BS1 applies.**

Two points of method. Argue from the filtering allele frequency — the lower bound, computed in the
ancestry group where the variant is commonest — rather than the raw global AF. And note the answer
is driven by assumptions you cannot measure precisely: halve the penetrance and double the allelic
contribution and the threshold moves fourfold, which is why BS1 is applied conservatively.

</details>

**4. Show that "≥2 Strong criteria → Pathogenic" is inconsistent with the Bayesian model, and say why the rule exists anyway.**

<details><summary>Answer</summary>

Two Strong criteria are 4 + 4 = 8 points. With the standard parameters (π = 0.10, Very Strong
odds *X* = 350) the combined odds of pathogenicity are 350^(8/8) = 350, so

```
P_post = (0.10 × 350) / (0.10 × 350 + 0.90) = 35 / 35.9 = 0.975
```

0.975 lies in [0.90, 0.99) — **Likely pathogenic** by the posterior definition, while the 2015
rule calls it Pathogenic.

It exists because the 2015 rules were assembled by expert consensus on which *combinations* felt
sufficient, before anyone wrote down the model they implied. The reformulation came afterwards
and found sixteen of the eighteen already consistent — a remarkable hit rate for a hand-built
rule set — with a couple of edges that do not line up. The other well-known one runs the opposite
way: `PVS1 + 1 Moderate` is 10 points, posterior 0.994, which the arithmetic calls Pathogenic and
the 2015 rules call Likely pathogenic.

The lesson is not that the rules are broken. It is that once you know the model you can see where
a rule is an approximation, and points-based implementations remove the edge cases by
construction.

</details>

**5. A biobank participant with no personal or family history of cancer is found to carry a variant classified pathogenic for an autosomal dominant cancer syndrome, based on published families in which 80% of carriers developed cancer by age 60. Why is 80% the wrong number for this person, and what is the correct framing?**

<details><summary>Answer</summary>

Because the 80% came from families **ascertained through affected members**. A family enters the
literature when it contains a striking cluster of disease; the variant was catalogued precisely
because, in those families, it did something. Conditioning on that selection inflates the
apparent penetrance — and probably also inflates the contribution of modifiers, shared
environment and polygenic background that those families share and this participant does not.

This is ordinary selection bias, not a genetic subtlety, but its consequence is specific: a
secondary finding in an unselected person generally carries substantially lower lifetime risk
than the family-based figure implies, so penetrance estimates from unselected cohorts are the
right ones to quote. The correct framing is probabilistic and conditional rather than diagnostic
— which is why secondary findings are returned with genetic counselling rather than as a result
line.

</details>
