# Problem set 08 — Quantitative genetics

Covers [Ch 30–32](../part-06-quantitative-genetics/30-quantitative-traits.md).

**Attempt before revealing.** Heritability is the one quantity in this book where knowing the
definition and understanding it are nearly unrelated skills — problem 5 tests the second.

Problems are roughly in order of difficulty. ★ marks the two worth returning to.

---

## 1. Variance decomposition

A population is measured for a quantitative trait. Assume *V*_I = 0, Cov(*G*,*E*) = 0, no *G*×*E*.

| Component | Value (trait units²) |
|---|---|
| *V*_A additive | 42 |
| *V*_D dominance | 12 |
| *V*_E environmental | 66 |

**(a)** Compute *V*_P, *H*² and *h*².
**(b)** State precisely what each heritability means. "How genetic the trait is" is not acceptable
for either.
**(c)** Predict the correlations for parent–offspring, full sibs, half sibs, MZ twins.
**(d)** ⚠ *Trap.* The observed MZ correlation comes back at 0.61. Diagnose it, and say what it
implies for every other estimate.

<details><summary>Solution</summary>

**(a)** *V*_P = 42 + 12 + 66 = **120**;  *V*_G = 42 + 12 = **54**

*H*² = *V*_G/*V*_P = 54/120 = **0.45**
*h*² = *V*_A/*V*_P = 42/120 = **0.35**

**(b)**

- *H*² = 0.45: **45% of the variance in this population, in this environment, at this time**
  tracks genotype at all, dominance included — the ceiling on prediction from a full genotype.
- *h*² = 0.35: **35% of the variance is predictable from parental phenotype** — the fraction
  carried by breeding values, the part that survives meiosis. It is the offspring–midparent
  slope, and the only one of the two that appears in the breeder's equation.

Both describe a population, never a trait and never an individual.

**(c)** Using Cov = ½·E[*k*]·*V*_A + Pr(*k*=2)·*V*_D:

| Relationship | Covariance | Correlation |
|---|---|---|
| Parent–offspring | ½(42) = 21 | 21/120 = **0.175** |
| Full sibs | ½(42) + ¼(12) = 24 | 24/120 = **0.200** |
| Half sibs | ¼(42) = 10.5 | 10.5/120 = **0.0875** |
| MZ twins | 42 + 12 = 54 | 54/120 = **0.450** |

Parent–offspring is exactly *h*²/2, MZ is exactly *H*², and dominance appears only in the
full-sib line — a parent and child cannot share a *genotype* by descent.

**(d)** Excess = 0.61 − 0.45 = **0.16**. MZ twins share the whole genome, so their correlation is
*H*² + *c*² — there is no unused genetic term available. Hence **ĉ² = 0.16**.

Shared environment is not confined to twins, and that is the damage. Full sibs should now
correlate 0.20 + 0.16 = 0.36, and the estimator *h*² = 2*t*_FS would return 0.72, double the
truth. **The full-sib estimate is an upper bound, not an estimate** — hence animal breeding's
preference for half sibs by a common sire, reared by different dams.

</details>

---

## 2. Parent–offspring regression

Adult height in 1,200 families, female heights multiplied by 1.08 to put both sexes on one scale
(as Galton did). σ_P = 7.0 cm. The regression of offspring on midparent has slope **0.62**.

**(a)** Give *h*², *V*_A and σ_A.
**(b)** Derive why the midparent slope estimates *h*² directly while a single-parent slope
estimates *h*²/2. "Because there are two parents" is not the answer.
**(c)** ⚠ *Trap.* The same sample regressed on **fathers only** gives slope 0.39. A student doubles
it to *h*² = 0.78 and calls the two estimates inconsistent. Spouses correlate ρ = 0.25 for height.
Reconcile them.

<details><summary>Solution</summary>

**(a)** The midparent slope *is* the narrow-sense heritability, no scaling constant:
***h*² = 0.62**.

*V*_P = 7.0² = 49.0 cm²;  *V*_A = 0.62 × 49.0 = **30.38 cm²**;  σ_A = √30.38 = **5.51 cm**

**(b)** Both regressions have the **same numerator**; the factor of two lives entirely in the
variance of the predictor.

Cov(*P*_O, *P*_parent) = ½*V*_A — the offspring shares one allele per locus IBD with this parent.
Cov(*P*_O, MP) = ½[½*V*_A + ½*V*_A] = ½*V*_A — averaging two ½*V*_A covariances returns ½*V*_A.

Denominators: Var(parent) = *V*_P, but Var(MP) = (*V*_P + *V*_P)/4 = *V*_P/2 under random mating:

*b*_O·parent = (½*V*_A)/*V*_P = **½*h*²**   and   *b*_O·MP = (½*V*_A)/(½*V*_P) = **_h_²**

Averaging parents adds no genetic information; it halves the noise in the predictor.

**(c)** Assortative mating breaks the single-parent estimator and leaves the midparent one alone.

With mates correlated ρ, each parent's phenotype becomes informative about the *other* parent's
breeding value — Cov(*A*_dam, *P*_sire) = *h*²Cov(*P*_dam,*P*_sire) = ρ*V*_A — so

*b*_O·father = ½*h*²(1 + ρ)

0.39 = ½ × *h*² × 1.25 → *h*² = (2 × 0.39)/1.25 = 0.78/1.25 = **0.624**

which matches the midparent 0.62 to rounding. There was never an inconsistency, only an
unapplied correction.

Why midparent escapes — numerator and denominator inflate by the same factor:

Cov(*P*_O, MP) = ¼[*V*_A + ρ*V*_A + ρ*V*_A + *V*_A] = ½*V*_A(1 + ρ)
Var(MP) = ¼[*V*_P + 2ρ*V*_P + *V*_P] = ½*V*_P(1 + ρ)

The (1 + ρ) cancels exactly. Assortment still raises *V*_A itself; the slope faithfully reports
that inflated *current* heritability.

</details>

---

## 3. Twin study and the equal-environments assumption

A twin study of a physiological trait reports *r*_MZ = 0.68, *r*_DZ = 0.42.

**(a)** Estimate *h*², *c*², *e*² by Falconer's formula.
**(b)** Derive the formula and state when the factor of 2 is exact.
**(c)** A second trait gives *r*_MZ = 0.80, *r*_DZ = 0.32. Compute and interpret.
**(d)** ⚠ *Trap.* State the equal-environments assumption. If MZ pairs share trait-relevant
environment more than DZ pairs do, in which direction is *h*² biased, and by how much per unit of
violation?
**(e)** Name a bias running the other way.

<details><summary>Solution</summary>

**(a)** *ĥ*² = 2(0.68 − 0.42) = 2(0.26) = **0.52**

*ĉ*² = 2*r*_DZ − *r*_MZ = 0.84 − 0.68 = **0.16**  (check: 0.52 + 0.16 = 0.68 = *r*_MZ ✓)

*ê*² = 1 − 0.68 = **0.32** — non-shared environment and measurement error.

**(b)** With *d*² = *V*_D/*V*_P, and both twin types sharing family environment equally:

*r*_MZ = *h*² + *d*² + *c*²
*r*_DZ = ½*h*² + ¼*d*² + *c*²
*r*_MZ − *r*_DZ = ½*h*² + ¾*d*²

so *h*² = 2(*r*_MZ − *r*_DZ) − 1.5*d*². **The factor of 2 is exact only when *V*_D = *V*_I = 0**;
otherwise the formula charges all non-additive variance to additivity and is biased **upward**.
If *d*² = 0.08 here, true *h*² = 0.52 − 1.5(0.08) = **0.40**, not 0.52.

**(c)** *ĥ*² = 2(0.48) = **0.96**;  *ĉ*² = 0.64 − 0.80 = **−0.16**

A negative variance component is impossible, so **the model has failed and you stop**. The usual
culprit is non-additive variance, which enters *r*_MZ at full weight and *r*_DZ at ¼ or less.
Report "*h*² ≤ 0.96, non-additive component unquantified". A negative *ĉ*² is the most useful
diagnostic the design offers.

**(d)** **EEA: MZ and DZ pairs are equally correlated for trait-relevant environments** — not
that they are treated identically, only that any environmental sharing is equal across twin type.

Direction: **upward**, and the trap is the magnitude. If MZ pairs share an extra ε of
environmental correlation,

*ĥ*²_biased = 2[(*r*_MZ + ε) − *r*_DZ] = *ĥ*²_true + **2ε**

The bias is **twice** the violation: with ε = 0.05, *ĥ*² = 2(0.73 − 0.42) = 0.62 rather than 0.52.
Differencing amplifies exactly the quantity the design cannot observe. The critiques with real
force: MZ twins are treated more alike, and share a chorion about two-thirds of the time while DZ
never do — prenatal, so it touches physical traits too.

**(e)** **Assortative mating** biases it downward: correlated mates raise *r*_DZ, since those
twins' parents now have covarying breeding values, while *r*_MZ cannot rise. The biases run both
ways with unknown magnitudes, which argues for reporting a range.

</details>

---

## 4. The breeder's equation

Broiler 6-week body weight: μ = 2,400 g, σ_P = 200 g, *h*² = 0.40 from a half-sib design. The top
**5%** are selected as parents, both sexes equally.

**(a)** Compute *i*, *S*, *R*, and the new mean.
**(b)** Project 10 generations naively.
**(c)** ⚠ *Trap.* Correct the second-generation response for the fact that truncation changes the
variance as well as the mean.
**(d)** Records after 10 generations show ΣS = 3,960 g and ΣR = 1,150 g. Compute realised
heritability and account for the shortfall. *N*_e = 30.

<details><summary>Solution</summary>

**(a)** *x* = Φ⁻¹(0.95) = **1.6449**

φ(1.6449) = 0.39894 × e^(−1.6449²/2) = 0.39894 × e^(−1.35284) = 0.39894 × 0.25851 = **0.10313**

*i* = 0.10313/0.05 = **2.0626**
*S* = *i*σ_P = 2.0626 × 200 = **412.5 g** (selected parents mean 2,812.5 g)
*R* = *h*²*S* = 0.40 × 412.5 = **165.0 g** → new mean **2,565 g**

Check: *R* = *i h*²σ_P = 2.0626 × 0.40 × 200 = 165.0 ✓

**(b)** 10 × 165.0 = 1,650 g → mean **4,050 g**.

**(c)** Truncation takes a slice off the top of a distribution, and slices have less variance.
The variance-reduction coefficient is

*k* = *i*(*i* − *x*) = 2.06271 × (2.06271 − 1.64485) = 2.06271 × 0.41786 = **0.8619**

(*i* and *x* carried to five places here; the rounded 2.0626 of part (a) would give 0.8615.)

The trap is reading this as lost alleles. It is not: selecting the tail creates **negative linkage
disequilibrium** between like-signed loci — the **Bulmer effect** — half of which recombination
restores each generation.

*V*_A = 0.40 × 40,000 = 16,000 g²; residual = 24,000 g².

*V*_A(1) = *V*_A(1 − ½*kh*²) = 16,000 × (1 − 0.5 × 0.8619 × 0.40) = 16,000 × 0.82762 = **13,242 g²**
*V*_P(1) = 13,242 + 24,000 = 37,242 → σ_P(1) = **192.98 g**;  *h*²(1) = 13,242/37,242 = **0.3556**

*R*(2) = 2.0626 × 0.3556 × 192.98 = **141.5 g**

A **14% shortfall in one generation**, with no allele frequency change whatever. Iterating, *V*_A
settles near 12,380 g² (*h*² ≈ 0.340) by generation five, for a steady *R* ≈ 134 g:
165.0 + 141.5 + 135.8 + 134.3 + 134.0 + 5 × 133.8 ≈ **1,380 g** over ten generations.

**(d)** *h*²_realised = ΣR/ΣS = 1,150/3,960 = **0.290** against a pedigree 0.40. (ΣS is 3,960, not
10 × 412.5 = 4,125, because σ_P shrinks.)

- **Bulmer** covers 1,650 → ~1,380 g. Diagnostic: relax selection two generations and *V*_A
  recovers as recombination breaks the disequilibrium. Nothing was lost.
- The remaining ~1,380 → 1,150 g (17%) needs **allele fixation** (diagnostic: reverse selection
  also fails) or **opposing natural selection** — real in broilers, where the heaviest birds have
  reduced fertility and leg pathology, so effective *S* falls below nominal.
- **Drift is not the answer at generation 10.** Robertson's limit puts total advance at
  ≈ 2*N*_e*R*₁ = 2(30)(165) = **9,900 g**, half-life ≈ 1.4*N*_e = **42 generations**.

Realised heritability is the number to trust — the only one measured on the intervention actually
performed.

</details>

---

## 5. The heritability misconceptions ★

Adult height in a well-nourished European population has *h*² ≈ 0.8, σ_P ≈ 7 cm. All four claims
below are false. For each, say what went wrong and what the correct statement is.

**(a)** "80% of an individual's height is genes; 20% is environment."
**(b)** "Since height is 80% heritable, environmental intervention can't move it much."
**(c)** "Population X averages 8 cm shorter than Y. Since *h*² = 0.8, most of that gap must be
genetic."
**(d)** "*h*² = 0.8 is a fact about human height, so it holds in any population."

<details><summary>Solution</summary>

**(a) Heritability partitions variance, not an individual's trait value.** Variance is a property
of a group; you have one height and there is nothing to decompose. Correctly: of the *variance
among people in this population*, 80% tracks additive genetic differences. Your height is not 80%
genes and 20% food — it is 100% both, as a rectangle's area is not 60% length. The killer
counterexample: **number of fingers** is near-perfectly genetically specified and has heritability
near **zero**, because nearly all its variance is industrial accidents.

**(b) High heritability says nothing about malleability.**

**Dutch height.** Mean adult male height rose roughly **20 cm** since the mid-nineteenth century
on nutrition, sanitation and disease burden — 20/7 = **2.9 σ_P**. Heritability stayed high
throughout, because it measures how well *rank within a cohort* tracks genotype, and rank is
stable while the whole distribution translates.

**Phenylketonuria.** Heritability near 1, untreated causes severe irreversible disability,
completely preventable by a low-phenylalanine diet — an intervention that did not exist in the
environments the heritability was estimated over. **Heritability is estimated over the
environments that happened to be present**, and interventions are attempts to leave that range.

**(c) Heritability contains no information about between-group differences.**

**The two pots.** Take genetically variable seed. Split it **at random** into two pots.

```
POT A — full soil                    POT B — depleted soil
  30 cm  26 cm  33 cm  27 cm           12 cm  10 cm  14 cm  12 cm
  mean 29 cm                           mean 12 cm

WITHIN each pot: environment is uniform, so essentially all
variation is genetic  →  h² ≈ 1 in both pots.

BETWEEN pots: the 17 cm gap is 100% environmental,
by construction — the seed was randomised.
```

Within-group heritability is as high as it can be; the between-group difference is entirely
environmental. Both are true at once, and this is not an edge case: **heritability is computed
from within-group variance and has no term for between-group means.** The reverse seals it — two
genetically distinct seed sources on identical soil give a 100% genetic gap that the within-pot
heritabilities again say nothing about.

⚠ *The sophisticated version also fails.* "σ_E = √0.2 × 7 = 3.13 cm, so an 8 cm gap needs mean
environments differing by 8/3.13 = **2.56 environmental SDs** — implausible." The Dutch **2.9 σ**
shift happened *within one population*, entirely environmentally: σ_E, estimated over environments
varying *within* a population, does not bound differences *between* them.
[Ch 58](../part-12-applications-and-ethics/58-ethics-and-society.md) has the history.

**(d) Heritability is a property of a population, in an environment, at a time.** Hold *V*_A
fixed at 0.8 (units where the original *V*_P = 1, so *V*_E = 0.2) and vary only environment:

| Environmental variance | *h*² = *V*_A/(*V*_A + *V*_E) |
|---|---|
| *V*_E = 0.2 (original) | 0.8/1.0 = **0.800** |
| *V*_E doubled to 0.4 | 0.8/1.2 = **0.667** |
| *V*_E quadrupled to 0.8 | 0.8/1.6 = **0.500** |
| *V*_E → 0 (uniform environment) | **1.000** |

Not one allele frequency changed in that table, which is why reported heritabilities differ across
countries and decades — and note the perverse corollary: **equalising environments raises
heritability.** A high *h*² can be an achievement of social policy, not a constraint on it.

</details>

---

## 6. Liability threshold and sibling recurrence risk

A disease has prevalence *K* = 2%. Liability *L* ~ 𝒩(0,1); heritability of liability
*h*²_L = 0.60.

**(a)** Compute the threshold *T* and the mean liability of affected individuals, *i*.
**(b)** Compute sibling recurrence risk and λ_s.
**(c)** ⚠ *Trap.* A second disease has prevalence 0.5% and the **same** *h*²_L = 0.60. Compute
λ_s. Why does this make λ_s a poor cross-disease measure of "how genetic" a condition is?

<details><summary>Solution</summary>

**(a)** *K* = 1 − Φ(*T*), so *T* = Φ⁻¹(0.98) = **2.0537**

φ(2.0537) = 0.39894 × e^(−2.0537²/2) = 0.39894 × e^(−2.1089) = 0.39894 × 0.12137 = **0.04842**

*i* = φ(*T*)/*K* = 0.04842/0.02 = **2.421**

Affected individuals average 2.42 SD up the liability scale — well above the threshold of 2.0537.

**(b)** Falconer's construction: a relative of a proband has expected liability shifted by
*r*·*h*²_L·*i*, with *r* = ½ for full sibs. (The proband sits at *i*; a fraction *h*²_L of that
deviation is additive genetic; a sib inherits half.)

Shift = 0.5 × 0.60 × 2.421 = **0.7263**

*K*_sib = 1 − Φ(*T* − 0.7263) = 1 − Φ(2.0537 − 0.7263) = 1 − Φ(1.3274) = 1 − 0.9078
= **0.0922 ≈ 9.2%**

λ_s = 0.0922/0.02 = **4.61**

A 1-in-11 sibling risk against a 1-in-50 population risk. The naive "sibs share half the genes, so
halve something" has no meaning here: the calculation runs through a **shift in a latent normal
followed by re-integrating the tail**, and a 0.73 SD shift multiplies risk by 4.6 because the
threshold is crossing the steep part of that tail.

**(c)** For *K* = 0.005:

*T* = Φ⁻¹(0.995) = **2.5758**
φ(2.5758) = 0.39894 × e^(−3.3174) = 0.39894 × 0.036248 = **0.014460**
*i* = 0.014460/0.005 = **2.892**

Shift = 0.5 × 0.60 × 2.892 = **0.8676**
*K*_sib = 1 − Φ(2.5758 − 0.8676) = 1 − Φ(1.7082) = 1 − 0.9562 = **0.0438 ≈ 4.4%**
λ_s = 0.0438/0.005 = **8.76**

**Identical liability heritability, and λ_s nearly doubles** — 4.61 versus 8.76 — purely because
one disease is four times rarer. Probands come from a more extreme tail (*i* rises 2.42 → 2.89)
*and* the sib risk is divided by a smaller *K*.

So **λ_s is not comparable across diseases of different prevalence**: "schizophrenia has λ_s ≈ 10
and type 2 diabetes ≈ 3, therefore schizophrenia is more genetic" is unsound without converting
both to the liability scale. Same reason polygenic score performance is reported as
liability-scale *R*² or AUC.

</details>

---

## 7. Missing heritability, quantified

Estimates for adult height, the best-measured complex trait there is:

| Estimator | *h*² |
|---|---|
| Twin / pedigree | 0.80 |
| Common-SNP GREML (array) | 0.45 |
| Genome-wide-significant SNPs (12,111 SNPs, 5.4M people) | 0.40 |
| Whole-genome-sequence GREML | 0.68 |

**(a)** Quantify the gaps, absolutely and as fractions of the pedigree estimate. In 2009 about 45
loci explained ~0.05 — what fraction was "missing" then, and now?
**(b)** Give the leading explanation for each gap. There are three, not one.
**(c)** ⚠ *Trap.* Evaluate "the missing heritability must be epistasis."
**(d)** Compute the average per-variant effect implied by row 3, at MAF 0.30, in cm. σ_P = 7 cm.

<details><summary>Solution</summary>

**(a)**

| Gap | Absolute | Fraction of 0.80 |
|---|---|---|
| GWAS-significant 0.40 → array GREML 0.45 | 0.05 | 6.3% |
| Array GREML 0.45 → WGS GREML 0.68 | 0.23 | 28.8% |
| WGS GREML 0.68 → pedigree 0.80 | 0.12 | 15.0% |
| **Pedigree − GWAS-significant** | **0.40** | **50.0%** |

2009: (0.80 − 0.05)/0.80 = **93.8% missing**. Now 0.40/0.80 = **50% missing** by the same
estimator — and the WGS row shows most of that remainder is untagged, not absent.

**(b)**

**0.40 → 0.45: a power problem, not a variant problem.** Both rows share an estimand — additive
variance tagged by array SNPs — but row 3 counts only variants clearing *p* < 5 × 10⁻⁸, and most
causal variants sit below it. The gap closes with sample size: height went from 45 loci to 12,111
by adding people ([Ch 51](../part-11-human-and-statistical-genomics/51-gwas.md)).

**0.45 → 0.68: rare and low-LD variants arrays cannot tag.** *h*²_SNP is the additive variance of
causal variants *in LD with the array*, so *h*²_SNP ≤ *h*² by construction. That the recovered
variance concentrates in rare, protein-altering, low-LD variants is a signature of **negative
selection**: larger effects are held at lower frequency, and *V*_A = 2*pq*α² penalises rarity
twice.

**0.68 → 0.80: the pedigree estimate was too high.** Shared environment, assortative mating,
genetic nurture and non-additive variance all inflate the twin numerator. True additive *h*² for
height is nearer 0.70.

**(c)** Epistatic variance enters relative covariances with **squared** coefficients — ¼*V*_AA
between full sibs, ¹⁄₁₆ between half sibs — so it decays fast with relationship distance and is
nearly unidentifiable; and at realistic allele frequencies most epistatic *gene action* converts
into *V*_A anyway ([Ch 30 §4](../part-06-quantitative-genetics/30-quantitative-traits.md)). It is
not zero, but the ledger in (b) allocates the whole 0.40 without invoking any interaction.

**(d)** Mean variance explained per significant variant = 0.40/12,111 = **3.303 × 10⁻⁵** of *V*_P.

An additive variant explains 2*pq*β² in *V*_P units. At MAF 0.30, 2*pq* = 2(0.30)(0.70) = 0.42:

β² = 3.303 × 10⁻⁵/0.42 = 7.864 × 10⁻⁵
β = **8.87 × 10⁻³** phenotypic SD per allele = 8.87 × 10⁻³ × 7 cm = **0.062 cm ≈ 0.62 mm**

Six tenths of a millimetre per allele, for the most heritable common trait in humans — which is
why GWAS needed millions of people, and why common-disease/common-variant was right about
"common" and wrong by an order of magnitude about effect size.

</details>

---

## 8. The Beavis effect ★

An F2 mouse cross with **N = 200** is scanned for QTLs. A permutation test gives a genome-wide 5%
threshold of **LOD 3.3**.

**(a)** Why are QTL effect sizes from small studies systematically overestimated, and in which
direction?
**(b)** Compute the smallest PVE this experiment can *report*. What does that mean for a QTL whose
true PVE is 4%?
**(c)** Quantify the bias with the conditional-expectation formula. Take SE(δ̂) = 0.20 and
threshold *c* = 0.50, for a low-power case (δ = 0.30) and a high-power case (δ = 0.80).
**(d)** ⚠ *Trap.* Six QTLs are reported at 12% PVE each in a cross whose broad-sense heritability
is 0.45. What is wrong, what is the fix, and what is *not* evidence of a false positive?

<details><summary>Solution</summary>

**(a)** An unconditional estimate is unbiased: E[δ̂] = δ. But you never report one. You report δ̂
**given that it cleared significance**, and estimates that fluctuated up clear it while those that
fluctuated down never appear. The published value is the mean of a distribution **truncated from
below**, so the bias is **always upward**, and larger the lower the power.

**(b)** χ² = 2·ln(10)·LOD ≈ 4.605 × 3.3 = **15.20**. For small PVE the non-centrality is
χ² ≈ *N* × PVE, so

PVE_min = 15.20/200 = **7.6%**

**Nothing below 7.6% can appear in this experiment at all.** A QTL with true PVE 4% cannot be
reported honestly even in principle: on the rare occasions it clears the threshold it must be
reported at ≥ 7.6%, an inflation of 7.6/4.0 = **1.90×, at least 90%**, built in before a single
mouse was phenotyped. Putting a 4% QTL *at* the threshold needs *N* = 15.20/0.04 = **380**
animals, and more for decent power.

**(c)** E[δ̂ | δ̂ > *c*] = δ + σ_δ̂·λ((*c* − δ)/σ_δ̂), λ(*x*) = φ(*x*)/(1 − Φ(*x*)).

**Low power, δ = 0.30:** *x* = (0.50 − 0.30)/0.20 = **1.00**; power = 1 − Φ(1.00) = **0.159**

λ(1.00) = 0.24197/0.15866 = **1.5251**
E[δ̂ | sig] = 0.30 + 0.20 × 1.5251 = **0.605** → **2.02× the truth**, +102%

**High power, δ = 0.80:** *x* = (0.50 − 0.80)/0.20 = **−1.50**; power = 1 − Φ(−1.50) = **0.933**

λ(−1.50) = φ(1.5)/Φ(1.5) = 0.12952/0.93319 = **0.1388**
E[δ̂ | sig] = 0.80 + 0.20 × 0.1388 = **0.828** → 1.035×, **+3.5%**

The bias is governed entirely by power, matching Beavis's simulations: about double at ~100
progeny, modest at ~500, largely gone at ~1,000. In the limit *c* ≫ δ, λ(*x*) → *x* and the
expression collapses to E[δ̂ | sig] ≈ *c* — **the reported effect is pinned near the detection
threshold, almost independently of the truth**, exactly as the 7.6% floor says.

**(d)** 6 × 12% = **72% of the variance explained** in a cross whose total genetic contribution is
45%. The reported QTLs explain more variance than exists — arithmetic, not biology, and routine
in the early QTL literature.

Fixes, in order: **estimate effects in an independent sample** (discovery tells you *where*, never
*how big*); failing that, invert the formula in (c) as a shrinkage correction; and **report the
detection floor beside every effect**.


⚠ The corollary that gets misapplied in reverse: **a QTL whose effect shrinks on replication is
not thereby a false positive.** Shrinkage is the *expected* behaviour of a real locus. Evidence
against a locus is failure to reach significance in a replication *powered for the replicated
effect size* — not a smaller number. The identical structure governs GWAS discovery betas and
polygenic scores ([Ch 53](../part-11-human-and-statistical-genomics/53-polygenic-scores.md)).

</details>

---

## Where you went wrong

| Error pattern | What to re-read |
|---|---|
| Used *H*² where the breeder's equation needs *h*² | Problem 1, [Ch 31 §1](../part-06-quantitative-genetics/31-heritability-and-selection.md) |
| Doubled a single-parent slope without checking assortative mating | Problem 2(c) — the slope is ½*h*²(1 + ρ) |
| Reported Falconer's *h*² without computing *c*² | Problem 3(c) — a negative *ĉ*² means stop |
| Assumed an EEA violation biases *h*² by the size of the violation | Problem 3(d) — it biases by twice it |
| Reapplied the original *h*² in generation 2 of a selection programme | Problem 4(c) — Bulmer effect |
| Read *h*² = 0.8 as a statement about an individual | Problem 5(a) — variance decomposes, individuals do not |
| Inferred a between-group cause from a within-group heritability | Problem 5(c) — the two pots |
| Treated *h*² as a constant of the trait | Problem 5(d) — halve *V*_E and it rises |
| Compared λ_s across diseases of different prevalence | Problem 6(c) — λ_s is a function of *K* |
| Blamed the missing-heritability gap on epistasis | Problem 7(c) — three gaps, three causes |
| Quoted a discovery effect size, or called a shrinking replicate a false positive | Problem 8 |
