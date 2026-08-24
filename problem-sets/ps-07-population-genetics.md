# Problem set 07 — Population genetics

Covers [Ch 26–29](../part-05-population-genetics/26-hardy-weinberg.md).

**Attempt before revealing.** Several of these have answers that are counterintuitive until you
do the algebra — problems 4 and 5 in particular.

---

## 1. Allele frequencies and the HWE test

A sample of 1,000 individuals is genotyped at a biallelic locus:

| Genotype | Count |
|---|---|
| *AA* | 640 |
| *Aa* | 320 |
| *aa* | 40 |

**(a)** Compute the allele frequencies.
**(b)** Compute HWE-expected genotype counts.
**(c)** Test for departure from HWE.
**(d)** If the test were significant, what would you check *first* — biology or bench?

<details><summary>Solution</summary>

**(a)** Count alleles. Each individual carries two.

*p* = freq(*A*) = (2 × 640 + 320) / (2 × 1000) = (1280 + 320)/2000 = 1600/2000 = **0.80**
*q* = freq(*a*) = 1 − 0.80 = **0.20**

Check: (2 × 40 + 320)/2000 = 400/2000 = 0.20 ✓

**(b)** Expected under *p*² : 2*pq* : *q*²

- *AA*: 0.80² × 1000 = 0.64 × 1000 = **640**
- *Aa*: 2 × 0.80 × 0.20 × 1000 = 0.32 × 1000 = **320**
- *aa*: 0.20² × 1000 = 0.04 × 1000 = **40**

**(c)** Observed equals expected exactly, so χ² = 0.

df = (number of genotypes) − (number of alleles) = 3 − 2 = **1**. Note this is *not* 3 − 1 = 2:
one degree of freedom is spent estimating *p* from the data itself. Getting this wrong is the
standard HWE df error.

χ² = 0 < 3.84 → no evidence against HWE.

**(d)** **The bench, not the biology.** In modern practice, HWE deviation is used principally as
a **genotyping quality-control filter**, not as a discovery about population structure.

The realistic causes of a significant departure, in rough order of likelihood: genotype calling
error (especially heterozygote under-calling, which produces an excess of homozygotes), a
deleted allele or primer-site polymorphism causing allele dropout, copy-number variation at the
locus, sample duplication or contamination. Only after excluding these would you entertain
inbreeding, population structure, or selection.

This is why GWAS pipelines filter on HWE p-values in *controls* ([Ch 51](../part-11-human-and-statistical-genomics/51-gwas.md)) — a variant out of equilibrium is usually a variant genotyped badly.

</details>

---

## 2. Carrier frequency from incidence ★

Cystic fibrosis affects roughly 1 in 2,500 newborns in a northern European population.
Assume HWE.

**(a)** Estimate the allele frequency.
**(b)** Estimate the carrier frequency.
**(c)** Two unrelated individuals from this population have a child. What is the risk the child
is affected, given no family history?
**(d)** Why is the approximation "carrier frequency ≈ 2*q*" acceptable here?

<details><summary>Solution</summary>

**(a)** Affected individuals are *aa*, so *q*² = 1/2500 = 0.0004

*q* = √0.0004 = **0.02**

**(b)** Carriers are heterozygotes:

2*pq* = 2 × 0.98 × 0.02 = **0.0392 ≈ 1 in 25.5**

Roughly **1 person in 25** is a carrier — which is the number that surprises people. A disease
affecting 1 in 2,500 has carriers at 1 in 25, a hundredfold more common. That ratio is
general: for a rare recessive, carriers outnumber affected individuals by about 2/*q*.

Here 2/*q* = 2/0.02 = 100 ✓

**(c)** Both parents must be carriers, and both must transmit the allele:

P = 0.0392 × 0.0392 × ¼ = 0.001537 × 0.25 = **3.84 × 10⁻⁴ ≈ 1 in 2,603**

Which is, as it must be, approximately the population incidence of 1 in 2,500. The small
discrepancy is because 2*pq* uses *p* = 0.98 rather than 1. A good check on your working: a
random couple's risk should reproduce the population incidence.

**(d)** Because 2*pq* = 2*q*(1 − *q*) = 2*q* − 2*q*², and when *q* is small the *q*² term is
negligible.

Here: 2*q* = 0.04 versus the exact 0.0392 — an error of 2%, which is far smaller than the
uncertainty in the incidence estimate itself. The approximation degrades as *q* grows; at
*q* = 0.2 it would overstate carriers by 20%.

</details>

---

## 3. X-linked HWE

Red-green colour blindness affects about 8% of males in a European population. It is X-linked
recessive.

**(a)** What is the allele frequency?
**(b)** What proportion of females are affected?
**(c)** What proportion are carriers?
**(d)** Why does the male frequency give *q* directly, while the female frequency does not?

<details><summary>Solution</summary>

**(a)** Males are **hemizygous** — one X, so genotype frequency *equals* allele frequency:

*q* = **0.08**

**(b)** Females need two copies: *q*² = 0.08² = 0.0064 = **0.64%**, about 1 in 156.

**(c)** 2*pq* = 2 × 0.92 × 0.08 = **0.147 ≈ 14.7%**

So roughly one female in seven carries the allele while fewer than one in 150 is affected.

**(d)** Because a male has only one X. His phenotype *is* his genotype at every X-linked locus,
so counting affected males counts alleles directly — no square root, no assumption about mating.

Females require two copies, so their affected frequency is *q*², and recovering *q* from it
means taking a square root of a small number, which amplifies sampling error badly. Estimating
X-linked allele frequencies from males is both simpler and statistically better.

This asymmetry is why X-linked recessive conditions show a large male excess, and the rarer the
allele the larger the excess: the ratio of affected males to affected females is *q*/*q*² = 1/*q*.
Here 1/0.08 = 12.5 times as many affected males as females.

</details>

---

## 4. Selection against a recessive ★★

A recessive lethal allele (*s* = 1, fully recessive, *h* = 0) has frequency *q*₀ = 0.10.

**(a)** Derive the recursion for *q* under complete selection against *aa*.
**(b)** How many generations to halve *q*?
**(c)** How many further generations to halve it again, from 0.05 to 0.025?
**(d)** What does this imply about eugenic proposals to eliminate recessive disease alleles?

<details><summary>Solution</summary>

**(a)** With *aa* lethal, the *aa* class contributes nothing to the next generation.

Before selection: *AA* = *p*², *Aa* = 2*pq*, *aa* = *q*²
After selection, *aa* removed. Surviving fraction = 1 − *q*².

New allele frequency counts *a* alleles among survivors — all in heterozygotes:

*q*′ = (½ × 2*pq*) / (1 − *q*²) = *pq* / (1 − *q*²)

Since 1 − *q*² = (1−*q*)(1+*q*) = *p*(1+*q*):

**_q_′ = _q_ / (1 + _q_)**

A pleasingly simple result, and it has a closed form. Applying it repeatedly:

**_q_ₙ = _q_₀ / (1 + n·_q_₀)**

**(b)** Set *q*ₙ = 0.05 with *q*₀ = 0.10:

0.05 = 0.10 / (1 + 0.10n)
1 + 0.10n = 2
n = **10 generations**

**(c)** From 0.05, halving to 0.025. Using the closed form from the original start,
*q*ₙ = 0.025 requires 0.10/(1 + 0.10n) = 0.025 → 1 + 0.10n = 4 → n = 30. Since 10 generations
had already elapsed, the second halving takes **20 more generations** — twice as long as the
first.

The general result: from any starting point, halving *q* takes 1/*q* generations, and since *q*
is falling, each successive halving takes twice as long as the last.

**(d)** They are futile, and the algebra shows exactly why.

As *q* falls, an ever-greater proportion of the remaining *a* alleles sit in **heterozygotes**,
which selection cannot see. At *q* = 0.10, the ratio of alleles in heterozygotes to alleles in
homozygotes is 2*pq*/(2*q*²) = *p*/*q* = 9:1. At *q* = 0.01 it is 99:1. Selection is removing an
ever-smaller fraction of the target.

To go from *q* = 0.01 to *q* = 0.005 takes 100 generations of eliminating *every single affected
individual* — roughly 2,500 years of the most extreme intervention imaginable, to halve the
frequency of one allele. And mutation continuously replenishes it (problem 5).

This is not a moral argument, it is an arithmetic one, and it was known to population geneticists
in the 1920s — well before the peak of eugenic legislation. The programmes were not merely
atrocious; they could not have worked.

</details>

---

## 5. Mutation–selection balance

**(a)** Derive the equilibrium frequency of a deleterious recessive allele under
mutation–selection balance.
**(b)** For a lethal recessive with μ = 1 × 10⁻⁶, what is *q̂*?
**(c)** Derive the equilibrium for a *dominant* deleterious allele and compute it for the same μ
with *s* = 0.5, *h* = 1.
**(d)** Why are dominant deleterious alleles so much rarer at equilibrium?

<details><summary>Solution</summary>

**(a)** At equilibrium, alleles gained by mutation equal alleles lost to selection.

Gain per generation ≈ μ*p* ≈ μ (for small *q*).
Loss per generation for a recessive: selection acts only on *aa*, frequency *q*², removing a
fraction *s* of them, so loss ≈ *s q*².

Setting gain = loss: μ = *s q*²

**_q̂_ = √(μ/_s_)**

**(b)** With *s* = 1 (lethal), μ = 10⁻⁶:

*q̂* = √(10⁻⁶/1) = **10⁻³ = 0.001**

Affected frequency *q̂*² = 10⁻⁶ — equal to μ, as it must be at equilibrium.

Carrier frequency 2*q̂* = 0.002, i.e. 1 in 500. Note again the carrier-to-affected ratio of
2/*q* = 2,000.

**(c)** For a dominant, selection sees the heterozygote, frequency ≈ 2*q*, removing a fraction
*hs* of them:

Loss ≈ 2*q* · *hs* ... but each heterozygote removed takes only *one* copy of the allele out of
the two it carries at that locus in the population's allele count, so per-allele loss is *hsq*.

Setting μ = *hsq*:

**_q̂_ = μ/(_hs_)**

With μ = 10⁻⁶, *h* = 1, *s* = 0.5: *q̂* = 10⁻⁶/0.5 = **2 × 10⁻⁶**

**(d)** Because selection sees **every copy** of a dominant allele, whereas it sees a recessive
allele only in the small fraction of copies that happen to be paired with another.

Quantitatively: the recessive equilibrium scales as **√μ**, the dominant as **μ**. Since μ is
tiny, its square root is enormously larger than itself. Compare:

- Recessive lethal: *q̂* = 10⁻³
- Dominant, *s* = 0.5: *q̂* = 2 × 10⁻⁶

A five-hundred-fold difference, and the dominant allele is under *weaker* selection (*s* = 0.5
versus 1). Recessive alleles hide from selection in heterozygotes; dominant ones cannot hide at
all. This is the single most important structural fact about deleterious variation in
populations, and it explains why recessive disease alleles reach appreciable carrier
frequencies while severe dominant conditions are almost always caused by fresh mutation.

</details>

---

## 6. Heterozygote advantage

In a population where malaria is endemic, the sickle-cell genotypes have relative fitnesses:

| Genotype | Fitness |
|---|---|
| *AA* | 0.89 |
| *AS* | 1.00 |
| *SS* | 0.20 |

**(a)** Derive the equilibrium frequency of *S*.
**(b)** Compute it.
**(c)** What happens to that equilibrium if malaria is eliminated?

<details><summary>Solution</summary>

**(a)** Write fitnesses as 1 − *s*₁ for *AA* and 1 − *s*₂ for *SS*, with the heterozygote at 1.

*s*₁ = 1 − 0.89 = 0.11
*s*₂ = 1 − 0.20 = 0.80

At equilibrium the marginal fitness of both alleles is equal. The standard result for
overdominance:

**_q̂_ = _s_₁ / (_s_₁ + _s_₂)**

where *q̂* is the frequency of the *S* allele.

This equilibrium is **stable**: displaced in either direction, selection pushes it back, because
whichever allele is rarer spends proportionally more of its time in the fitter heterozygote.

**(b)** *q̂* = 0.11 / (0.11 + 0.80) = 0.11/0.91 = **0.121**

About 12% — which is close to observed *S* allele frequencies in historically malarial regions
of West Africa, and the agreement between this two-parameter model and reality is one of the
better quantitative successes in human population genetics.

Heterozygote frequency at equilibrium: 2 × 0.879 × 0.121 = 0.213, so ~21% of the population is
protected. Homozygote *SS* frequency: 0.121² = 0.0147, about 1.5% — the cost of the protection.

**(c)** The heterozygote advantage disappears. With no malaria, *AA* fitness rises to ~1.0 while
*SS* remains severely reduced, so the model becomes ordinary selection against a deleterious
recessive.

The *S* allele then declines — but slowly, at the rate derived in problem 4, because it hides in
heterozygotes. This is exactly what is seen in populations of West African descent living for
generations outside malarial regions: the allele persists at appreciable frequency long after
the selective pressure that maintained it has gone.

A useful reminder that allele frequencies record the environment of the *past*, not the present.

</details>

---

## 7. Drift and effective population size

**(a)** A neutral allele is at frequency 0.3 in a population. What is its probability of eventual
fixation?
**(b)** A population has 500 breeding females and 20 breeding males. Compute *N*ₑ.
**(c)** A population is 1,000 for nine generations and 10 in the tenth. Compute the long-term *N*ₑ.
**(d)** What do (b) and (c) together tell you about which events dominate a population's genetic history?

<details><summary>Solution</summary>

**(a)** For a neutral allele, the probability of eventual fixation equals its **current
frequency**: **0.30**.

The argument is elegant: every copy of every allele in the population is equally likely to be
the ancestor of all future copies, and the allele occupies 30% of the copies.

**(b)** With unequal sex ratio:

*N*ₑ = 4 *N*_f *N*_m / (*N*_f + *N*_m)
    = (4 × 500 × 20)/(500 + 20)
    = 40,000/520
    = **76.9**

A census of 520 breeders behaves, genetically, like an ideal population of 77. The rarer sex
dominates: with only 20 males, every offspring's paternal allele is drawn from a pool of 20, and
that bottleneck applies every generation.

**(c)** Fluctuating size uses the **harmonic** mean, not the arithmetic:

*N*ₑ = n / Σ(1/*N*ᵢ) = 10 / (9 × (1/1000) + 1 × (1/10))
    = 10 / (0.009 + 0.1)
    = 10 / 0.109
    = **91.7**

The arithmetic mean would be (9 × 1000 + 10)/10 = 901. The harmonic mean is **91.7** — an order
of magnitude smaller, and dominated almost entirely by the single bad generation.

**(d)** That **genetic history is set by its worst moments, not its average ones.**

The harmonic mean weights small values heavily, so a single bottleneck leaves a signature that
many subsequent generations of large population size cannot erase. Diversity lost in one
crash is not recovered by later abundance — it can only be rebuilt by mutation, which is slow.

This is why species that are currently numerous can nonetheless show low genetic diversity
(cheetahs, northern elephant seals), and why human *N*ₑ is estimated at ~10,000 despite a census
population in the billions. That figure is a statement about our history, not our present.

</details>

---

## 8. Structure and F_ST

Two subpopulations of equal size, each internally in HWE, with allele frequencies *p*₁ = 0.2 and
*p*₂ = 0.8. They are pooled and genotyped as one sample.

**(a)** Compute expected heterozygosity within subpopulations, *H*_S.
**(b)** Compute expected heterozygosity in the pooled population, *H*_T.
**(c)** Compute *F*_ST.
**(d)** What would you observe if you tested the pooled sample for HWE, and what is this called?

<details><summary>Solution</summary>

**(a)** Within each subpopulation, 2*pq*:

Subpop 1: 2 × 0.2 × 0.8 = 0.32
Subpop 2: 2 × 0.8 × 0.2 = 0.32

*H*_S = mean = **0.32**

**(b)** Pooled allele frequency: *p̄* = (0.2 + 0.8)/2 = 0.5

*H*_T = 2 × 0.5 × 0.5 = **0.50**

**(c)** *F*_ST = (*H*_T − *H*_S)/*H*_T = (0.50 − 0.32)/0.50 = 0.18/0.50 = **0.36**

A very large value. For context, *F*_ST among human continental groups is on the order of
0.10–0.15, so this hypothetical pair is far more differentiated than any human populations are
from each other.

**(d)** You would observe a **deficit of heterozygotes** relative to HWE expectation.

Expected under HWE from the pooled *p̄* = 0.5: heterozygote frequency 0.50.
Actually observed: 0.32.

The pooled sample fails an HWE test with an excess of both homozygote classes. This is the
**Wahlund effect** — mixing differentiated subpopulations always produces a heterozygote deficit,
even though every subpopulation is individually in perfect equilibrium.

The critical consequence: at a single locus, the Wahlund effect is **indistinguishable from
inbreeding**. Both produce a homozygote excess and both give a positive *F*. Telling them apart
requires many loci — inbreeding raises homozygosity genome-wide and roughly uniformly, whereas
population structure raises it in proportion to how differentiated each locus is between the
subpopulations. That difference is what PCA and model-based clustering exploit
([Ch 28](../part-05-population-genetics/28-structure-and-inbreeding.md)), and unmodelled
structure of exactly this kind is the main source of false positives in association studies.

</details>

---

## Where you went wrong

| Error pattern | What to re-read |
|---|---|
| Used df = 2 for the HWE chi-square | Problem 1(c) — one df is spent estimating *p* |
| Treated a significant HWE test as a biological finding | Problem 1(d) |
| Forgot carriers vastly outnumber affected for rare recessives | Problem 2(b) — the 2/*q* ratio |
| Took a square root to get *q* from affected *males* | Problem 3(d) — males are hemizygous |
| Expected selection to eliminate a recessive quickly | Problem 4 |
| Confused the √(μ/*s*) and μ/(*hs*) equilibria | Problem 5(d) |
| Used the arithmetic mean for fluctuating *N*ₑ | Problem 7(c) — it is harmonic |
| Read a heterozygote deficit as inbreeding without considering structure | Problem 8(d) |
