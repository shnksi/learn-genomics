# Problem set 09 — Molecular evolution

Covers [Ch 33–35](../part-07-molecular-evolution/33-neutral-theory-and-selection-tests.md).

**Attempt before revealing.** Every problem here is a null model plus a departure from it, and the
arithmetic *is* the argument — reading it does not transfer.

Problems are roughly in order of difficulty. ★ marks the two worth returning to. Parts flagged
**(trap)** carry a specific conceptual error that the solution names explicitly.

---

## 1. The cancellation at the heart of neutral theory

A pseudogene evolves neutrally. Use the pinned germline rate μ = 1.2 × 10⁻⁸ per bp **per
generation** ([verified facts](../reference/verified-facts.md)). Take two diploid populations,
*N* = 10⁴ and *N* = 10⁶.

**(a)** How many new neutral mutations enter each population per site per generation?
**(b)** What is the fixation probability of any one of them, and why?
**(c)** Multiply. State the substitution rate *k* for each population.
**(d)** A coding gene in the same genome has only *f*₀ = 0.15 of its new mutations neutral. Two
lineages separate for *T* = 5 × 10⁵ generations. Compute divergence for pseudogene and gene.
**(e)** **(trap)** A colleague redoes (c) using "the replication error rate, 10⁻¹⁰". By what factor
does the answer change, and what did they get wrong?

<details><summary>Solution</summary>

**(a)** A diploid population of *N* individuals carries **2N** copies of each site, each mutating
at μ:

```
N = 10⁴:  2 × 10⁴ × 1.2 × 10⁻⁸ = 2.4 × 10⁻⁴
N = 10⁶:  2 × 10⁶ × 1.2 × 10⁻⁸ = 2.4 × 10⁻²
```

The large population generates **100×** more raw material.

**(b)** Under drift alone allele frequency is a martingale, and the process absorbs at 0 or 1, so
E[*p*<sub>∞</sub>] = *p*₀ = 1·P(fix) + 0·P(loss). Hence P(fix) = 1/(2*N*) — a new mutant is one copy
out of 2*N*. That gives **5 × 10⁻⁵** and **5 × 10⁻⁷**: exactly 100× smaller.

**(c)** *k* = 2*N*μ × 1/(2*N*):

```
N = 10⁴:  2.4 × 10⁻⁴ × 5 × 10⁻⁵ = 1.2 × 10⁻⁸
N = 10⁶:  2.4 × 10⁻² × 5 × 10⁻⁷ = 1.2 × 10⁻⁸
```

Both equal μ. The 2*N* cancels **algebraically**: *k* = μ regardless of *N*, of bottlenecks, or of
whether *N* is even constant. A beneficial mutation fixes with probability ≈ 2*s* instead, giving
*k*<sub>b</sub> = 4*N*μ<sub>b</sub>*s* — nothing cancels, so adaptive substitution scales with *N*.

**(d)** *k* = *f*₀μ and both lineages accumulate substitutions, so *d* = 2*kT*.

```
pseudogene:  d = 2 × 1.2 × 10⁻⁸ × 5 × 10⁵ = 0.012
gene:        k = 0.15 × 1.2 × 10⁻⁸ = 1.8 × 10⁻⁹
             d = 2 × 1.8 × 10⁻⁹ × 5 × 10⁵ = 0.0018
```

The ratio 0.0018/0.012 = 0.15 = *f*₀. **A ratio of divergences recovers the neutral fraction** —
what d<sub>N</sub>/d<sub>S</sub> does in problem 3, with synonymous sites as the pseudogene.

**(e)** **The trap, and the most expensive unit error in the subject.** The answer falls 120-fold,
and every divergence time built on it inflates the same way.

- **10⁻¹⁰ is per base per *replication*** — one round of copying, after base selection,
  proofreading and mismatch repair.
- **1.2 × 10⁻⁸ is per base per *generation*** — zygote to gamete, summing a few hundred germline
  divisions *and* including unrepaired chemical damage that was never a polymerase error.

Check: 10⁻¹⁰ × ~300 divisions ≈ 3 × 10⁻⁸ against a measured 1.2 × 10⁻⁸ — it **overshoots**, because
10⁻¹⁰ is an order-of-magnitude bound. And *k* = μ is a per-*generation* statement, because
1/(2*N*) is a per-generation fixation probability.

</details>

---

## 2. Jukes–Cantor and the nonlinearity of the correction

Two aligned sequences of *L* = 1,000 sites.

**(a)** Compute *d* = −¾ ln(1 − 4*p*/3) for *p* = 0.05 and *p* = 0.45, expressing each correction
as a percentage of *p*.
**(b)** Repeat for *p* = 0.72. Then attempt *p* = 0.78 and explain what happens.
**(c)** **(trap)** Using Var(*d*) = *p*(1−*p*)/[(1 − 4*p*/3)²*L*], compute the standard error at
each of *p* = 0.05 and 0.45. Which estimate is more precise?

<details><summary>Solution</summary>

**(a)**

```
p = 0.05:  4p/3 = 0.0666667 ;  1 − 4p/3 = 0.9333333 ;  ln = −0.0689929
           d = −0.75 × (−0.0689929) = 0.0517446      correction = +3.5%

p = 0.45:  4p/3 = 0.6000000 ;  1 − 4p/3 = 0.4000000 ;  ln = −0.9162907
           d = −0.75 × (−0.9162907) = 0.6872181      correction = +52.7%
```

A ninefold rise in observed difference produces a **13.3-fold** rise in inferred substitutions.
Observed difference is a compressed function of elapsed change; undoing it is super-linear.

**(b)** *p* = 0.72: ln(0.04) = −3.2188758, *d* = **2.4142** — a 235% correction; every site has
been hit twice on average.

*p* = 0.78: 4*p*/3 = 1.04, so 1 − 4*p*/3 = **−0.04** and the logarithm is undefined. Not a bug:
under JC69 two infinitely diverged sequences differ at 3/4 of sites, so 78% is *worse than random*
— evidence the model is wrong, not evidence of enormous distance.

**(c)**

```
p = 0.05:  Var = 0.0475/(0.8711111 × 1000) = 5.4528 × 10⁻⁵ ;  sd = 0.007384
p = 0.45:  Var = 0.2475/(0.16 × 1000)      = 1.546875 × 10⁻³ ; sd = 0.039330
```

**The trap.** "*p* = 0.05, its error is five times smaller" compares absolute errors on quantities
differing 13-fold. Relative: **14.3%** (0.007384/0.051745) against **5.7%** (0.039330/0.687218) —
the *distant* pair is more precise, and countably so: 50 sites differ at *p* = 0.05, giving noise
~1/√50 = 14%; 450 differ at *p* = 0.45, giving ~1/√450 = 4.7%, inflated to 5.7% by the correction.
Precision improves with divergence until the (1 − 4*p*/3)² denominator explodes near saturation.

</details>

---

## 3. d<sub>N</sub>/d<sub>S</sub>: normalise or don't bother

An aligned 900 bp coding region (300 codons) between two species, with **225 synonymous sites** and
**675 nonsynonymous sites**. Observed: **45 synonymous** and **27 nonsynonymous** differences.

**(a)** **(trap)** A first pass reports "27 nonsynonymous versus 45 synonymous, ratio 0.60." What
is wrong with it?
**(b)** Compute p<sub>N</sub>, p<sub>S</sub>, then d<sub>N</sub>, d<sub>S</sub> and ω. Interpret.
**(c)** Compare ω with the uncorrected p<sub>N</sub>/p<sub>S</sub>. Which class needed the bigger
correction, and which way does skipping it bias ω?
**(d)** Suppose 5 codons are genuinely under positive selection at ω = 8 and 295 sit at ω = 0.1.
Compute gene-wide ω, then find how strong those 5 would have to be for gene-wide ω to exceed 1.

<details><summary>Solution</summary>

**(a)** **The trap is that raw counts are not rates.** The code does not offer the two classes equal
opportunity: roughly one site in four is synonymous and three in four nonsynonymous, because third
positions are degenerate and second positions almost never are. A gene under **no selection at all**
accumulates about three times as many nonsynonymous changes, so the neutral expectation for the raw
ratio is ~3, not 1 — meaning a raw 0.60 is already five-fold *depleted*. Normalising converts counts
into rates per opportunity: an exposure offset in a Poisson regression, and just as non-optional.

**(b)**

```
pS = 45/225 = 0.200000
pN = 27/675 = 0.040000

dS = −0.75 × ln(1 − (4/3)(0.20)) = −0.75 × ln(0.7333333) = −0.75 × (−0.3101549) = 0.2326162
dN = −0.75 × ln(1 − (4/3)(0.04)) = −0.75 × ln(0.9466667) = −0.75 × (−0.0548082) = 0.0411062

ω = 0.0411062 / 0.2326162 = 0.1767
```

**ω ≈ 0.18: strong purifying selection** — roughly 82% of amino-acid-changing mutations removed
before they could fix.

**(c)** Uncorrected p<sub>N</sub>/p<sub>S</sub> = 0.04/0.20 = **0.200**, overstating ω by 13.2%.
Synonymous needed 0.2326/0.200 = **+16.3%**, nonsynonymous only 0.0411/0.040 = **+2.8%**. The fast
class saturates first, so it is the *denominator* that inflates, and skipping the correction biases
ω **upward** — toward spuriously resembling relaxed constraint.

**(d)** With equal synonymous opportunity per codon:

```
gene-wide ω = (295 × 0.1 + 5 × 8)/300 = (29.5 + 40)/300 = 69.5/300 = 0.2317
```

**0.23** — utterly ordinary. For gene-wide ω > 1 you need 29.5 + 5*x* > 300, i.e. **ω > 54.1 at
every one of the five sites**, which essentially never happens over a whole branch. This is why **ω < 1 is
not evidence against positive selection**; the fix is site models (M1a vs M2a, M7 vs M8), which fit
a mixture across codons and test whether a class with ω > 1 is needed.

</details>

---

## 4. ★ Tajima's *D*, and what it cannot tell you

A sample of *n* = 12 sequences. *S* = 24 segregating sites. Summed pairwise differences over all
C(12,2) = 66 pairs = 297, so π = 297/66 = 4.5.

**(a)** What does θ<sub>W</sub> measure, what does π measure, and why do they differ in sensitivity
to rare variants? Compute both.
**(b)** Compute *D*, using a₁ = Σ¹¹ 1/*i* = 3.0198773 and a₂ = Σ¹¹ 1/*i*² = 1.5580322.
**(c)** Two hypothetical datasets, both *S* = 24: in **A** all sites are singletons; in **B** all
sit at derived frequency 6/12. Compute π and *D* for each.
**(d)** **(trap)** You write "*D* = −1.93: evidence of a recent selective sweep." What is wrong?

<details><summary>Solution</summary>

**(a)** Both estimate θ = 4*N*<sub>e</sub>μ under the null, by different weightings of the same site
frequency spectrum. **θ<sub>W</sub> = S/a₁** counts segregating sites — every site contributes
**1**, whether its derived allele sits in 1 copy or 6. **π** is the mean difference between two
random sequences, so a site at derived frequency *i*/*n* contributes 2*i*(*n*−*i*)/[*n*(*n*−1)]:
zero at the edges, maximal at *i* = *n*/2. A singleton therefore adds a full unit to θ<sub>W</sub>
and almost nothing to π. Under E[ξ<sub>i</sub>] = θ/*i* both integrate to θ, so the difference has
expectation zero and measures the spectrum's *shape*, not its size.

```
θW = 24/3.0198773 = 7.9473 ;  π = 4.5 ;  π − θW = −3.4473
```

**(b)** With *n* = 12:

```
b1 = (n+1)/(3(n−1))      = 13/33    = 0.3939394
b2 = 2(n²+n+3)/(9n(n−1)) = 318/1188 = 0.2676768
c1 = b1 − 1/a1 = 0.3939394 − 0.3311393 = 0.0628001
c2 = b2 − (n+2)/(a1·n) + a2/a1²
   = 0.2676768 − 14/36.2385 + 1.5580322/9.1196590
   = 0.2676768 − 0.3863290 + 0.1708430 = 0.0521908
e1 = c1/a1       = 0.0628001/3.0198773  = 0.0207956
e2 = c2/(a1²+a2) = 0.0521908/10.6776912 = 0.0048878

Var = e1·S + e2·S(S−1) = 0.0207956(24) + 0.0048878(552)
    = 0.4990944 + 2.6980877 = 3.1971821      sd = 1.788067

D = −3.4473/1.788067 = −1.928
```

**D ≈ −1.93**: an excess of rare variants.

**(c)** Variance depends only on *n* and *S*, so sd = 1.788067 in both.

```
A (i = 1):  weight = 2(1)(11)/(12×11) = 22/132 = 0.1666667
            πA = 24 × 0.1666667 = 4.0
            DA = (4.0 − 7.9473)/1.788067 = −2.208

B (i = 6):  weight = 2(6)(6)/132 = 72/132 = 0.5454545
            πB = 24 × 0.5454545 = 13.0909
            DB = (13.0909 − 7.9473)/1.788067 = +2.877
```

**Identical θ<sub>W</sub> = 7.95; π differs 3.3-fold; *D* swings from −2.21 to +2.88.** The statistic
is blind to how much variation there is and sensitive only to how it is distributed.

**(d)** **The trap: a negative *D* has at least four causes and cannot separate them** — a recent
**selective sweep**, whose wiped-out region re-accumulates new and therefore rare mutations;
**population expansion**, whose genealogies have long terminal branches and so many singletons;
**background selection**, chronically removing chromosomes carrying deleterious mutations; and
ordinary **purifying selection** at the locus.

**Sweep and expansion are genuinely confounded** — both push the spectrum toward rare variants, and
no precision on *D* at one locus separates them. Nor is *D* standard normal despite the
normalisation, so "−1.93, therefore *p* < 0.05" is wrong too; p-values come from coalescent
simulation.

The escape route is that **demography acts genome-wide while selection acts locally**: compare
against the empirical genome-wide distribution of *D*; compute Fay and Wu's *H*, since hitchhiking
drags neutral variants to *high* derived frequency and expansion does not; check haplotype length at
frequency (iHS, XP-EHH). Background selection survives all three, which is why modern scans fit a
background-selection baseline first.

</details>

---

## 5. Dating a split, and why the arithmetic overstates its own precision

1 Mb of putatively neutral autosomal sequence aligned between human and chimpanzee shows **12,000
differing sites**. Use μ = 1.2 × 10⁻⁸ per bp per generation.

**(a)** Compute *p* and the JC-corrected *d*.
**(b)** Compute the divergence time at a generation interval of 25 years, then at 29 years.
**(c)** The fossil-calibrated estimate is 6–7 Mya. **(trap)** Give three distinct reasons your
estimate carries far more uncertainty than the arithmetic suggests, with a number for each.

<details><summary>Solution</summary>

**(a)** *p* = 12,000/1,000,000 = **0.012**

```
4p/3 = 0.016 ;  1 − 0.016 = 0.984 ;  ln(0.984) = −0.0161294
d = −0.75 × (−0.0161294) = 0.0120970
```

The correction is only **0.81%** — at 1.2% divergence almost no site has been hit twice.

**(b)** Both lineages accumulate substitutions, so *d* = 2μ*T* with *T* per lineage:

```
T = 0.0120970/(2 × 1.2 × 10⁻⁸) = 504,043 generations
× 25 y = 12.6 million years        × 29 y = 14.6 million years
```

**(c)** **The trap is treating a chain of point estimates as a measurement.**

**1 — The mutation rate is the whole answer, and it is contested.** *T* scales as 1/μ. Pedigree
sequencing gives ~1.2 × 10⁻⁸; older phylogenetic calibrations gave ~2.5 × 10⁻⁸:

```
T = 0.0120970/(5 × 10⁻⁸) = 241,941 generations × 25 y = 6.0 million years
```

**Exactly the fossil answer.** The twofold disagreement in the literature *is* the twofold
disagreement in μ, and no amount of sequence adjudicates it.

**2 — Sequence divergence is older than the species split.** *d*/(2μ) dates the **coalescence** of
the two sequences, which happened in the ancestral population before it split; the expected extra
depth is 2*N*<sub>anc</sub> generations. With *N*<sub>anc</sub> ≈ 65,000:

```
504,043 − 130,000 = 374,043 generations × 25 y = 9.4 million years
```

A 26% reduction from a parameter you did not measure — it shrinks the gap without closing it.

**3 — Generation time is neither constant nor shared.** It has varied over the interval, differs
between the sexes, and human mutation is ~80% paternal with ~1.3–1.5 extra de novo mutations per
year of paternal age — so a change in mating system moves μ per year without moving μ per
generation, and it cannot be revised independently of reason 1.

Also: the clock is **overdispersed** (Var/Mean ~1–35 across proteins), and calibration uncertainty
does not shrink with data, since a fossil gives only a minimum age and only rate × time is
identified. Report "order 6–13 My", not "12.6 My".

</details>

---

## 6. McDonald–Kreitman

|  | Fixed | Polymorphic |
|---|---|---|
| **Nonsynonymous** | D<sub>n</sub> = 78 | P<sub>n</sub> = 24 |
| **Synonymous** | D<sub>s</sub> = 50 | P<sub>s</sub> = 60 |

**(a)** Compute the neutrality index and α. Interpret.
**(b)** Compute the number of adaptive fixations directly and check it against α.
**(c)** Test significance with a χ² on the 2×2.
**(d)** Dropping polymorphisms below 10% frequency leaves P<sub>n</sub> = 14, P<sub>s</sub> = 54.
Recompute α. **(trap)** Why did it move in that direction?
**(e)** A second gene gives D<sub>n</sub> = 20, D<sub>s</sub> = 30, P<sub>n</sub> = 90,
P<sub>s</sub> = 60. Compute α and interpret.

<details><summary>Solution</summary>

**(a)**

```
Pn/Ps = 24/60 = 0.400000        Dn/Ds = 78/50 = 1.560000
NI = 0.400000/1.560000 = 0.256410
α  = 1 − (Ds·Pn)/(Dn·Ps) = 1 − (50 × 24)/(78 × 60) = 1 − 1200/4680 = 0.7436
```

**α ≈ 0.74: roughly 74% of nonsynonymous substitutions were fixed by positive selection.** NI < 1 is
the signature — amino-acid changes enriched among *fixed* differences relative to their share of
polymorphism.

**(b)**

```
expected Dn = Ds × (Pn/Ps) = 50 × 0.400000 = 20.0
observed Dn = 78  →  excess = 58 adaptive fixations
58/78 = 0.7436   ✓ matches α, which is that excess as a proportion
```

**(c)** Row totals 102 and 110, column totals 128 and 84, *n* = 212.

```
E(Dn) = 102 × 128/212 = 61.5849     E(Pn) = 102 × 84/212 = 40.4151
E(Ds) = 110 × 128/212 = 66.4151     E(Ps) = 110 × 84/212 = 43.5849

every cell deviates by the same 78 − 61.5849 = 16.4151

χ² = 16.4151² × (1/61.5849 + 1/40.4151 + 1/66.4151 + 1/43.5849)
   = 269.4555 × (0.0162378 + 0.0247432 + 0.0150569 + 0.0229437)
   = 269.4555 × 0.0789816 = 21.28       df = 1,  p ≈ 4 × 10⁻⁶
```

**(d)** α = 1 − (50 × 14)/(78 × 54) = 1 − 700/4212 = **0.8338**, up from 0.744.

**The trap is reading MK as assumption-free.** It *is* robust to demography: synonymous and
nonsynonymous sites are interdigitated in the same codons with the same genealogy, so a bottleneck
or expansion distorts both spectra identically and the distortion cancels in the ratio of ratios —
exactly the confound that ruins Tajima's *D*. It is **not** robust to **slightly deleterious
nonsynonymous mutations**, which segregate at low frequency and almost never fix, inflating
P<sub>n</sub> without touching D<sub>n</sub> and pushing α down. A frequency cutoff removes them
preferentially, hence the increase — and since that bias scales with *N*<sub>e</sub>, uncorrected α
is not comparable across species.

**(e)**

```
NI = (90/60)/(20/30) = 1.500000/0.666667 = 2.25
α  = 1 − 2.25 = −1.25
```

**Negative α is not "negative adaptation".** Nonsynonymous variants are over-represented among
polymorphisms relative to fixed differences — a gene loaded with slightly deleterious variation that
will never fix. Report "no evidence of adaptive fixation; strong evidence of deleterious
polymorphism", and do not average it with positive α from other genes.

</details>

---

## 7. Discordance: duplication or incomplete lineage sorting?

The species tree is ((A, B), C).

**(a)** Across 5,000 loci: 3,000 gene trees give ((A,B),C), 1,000 give ((A,C),B), 1,000 give
((B,C),A). Which process, and what is the internal branch length in coalescent units? Use
P(discordant) = (2/3)e<sup>−τ</sup>.
**(b)** A single gene places A with C at a node dated ~450 Mya, while the A–C speciation is dated
~320 Mya. Generation time ~2 years, vertebrate *N*<sub>e</sub> ~ 10⁴. **(trap)** Could ILS produce
this?
**(c)** If each lineage independently ends up single-copy with probability *q* = 0.5, how often does
reciprocal best hit confidently pair two **paralogs**?
**(d)** What functional-annotation error follows from getting (b) wrong, and where does it end up?

<details><summary>Solution</summary>

**(a)** **Incomplete lineage sorting**, diagnosed by **symmetry**: 1,000 versus 1,000. ILS arises
when A and B fail to coalesce in the ancestral AB population; three lineages then enter the deeper
population, all three topologies become equally likely, and the two discordant ones must therefore
occur equally often in expectation.

```
P(discordant) = 2,000/5,000 = 0.40 = (2/3)e^(−τ)
e^(−τ) = 0.60  ⟹  τ = −ln(0.60) = 0.5108 coalescent units
```

The internal branch is **0.51 × 2*N*<sub>e</sub> generations** — short relative to ancestral
population size, exactly the regime where a large minority of loci disagree with the species tree,
and *that is the correct answer, not an error*. An asymmetric split (1,500 versus 500) would instead
mean gene flow.

**(b)** **No — ruled out by three orders of magnitude.** ILS *can* push a coalescence deeper than
the species split, but the excess depth is bounded by the ancestral population's coalescent
timescale, ~2*N*<sub>e</sub> generations:

```
excess depth = 450 − 320 = 130 My = 130 × 10⁶/2 = 6.5 × 10⁷ generations
2Ne = 6.5 × 10⁷  ⟹  Ne ≈ 3.25 × 10⁷
```

An ancestral vertebrate *N*<sub>e</sub> of 32 million against a realistic ~10⁴ — **3,000× too
large**. Independently: grant even a generous 50-My internal branch between the A–B and A–C splits
— 5 × 10⁷ years = 2.5 × 10⁷ generations — and the stated *N*<sub>e</sub> = 10⁴ gives
τ = 2.5 × 10⁷/(2 × 10⁴) = 1,250, so P(discordant) = (2/3)e<sup>−1250</sup> ≈ **9 × 10⁻⁵⁴⁴**.

**The trap.** ILS is right at shallow, rapidly radiating splits and arithmetically impossible at deep
ones. A discordant node **older than the speciation it contradicts** is the signature of **gene
duplication followed by differential loss** — the gene tree is correct as a gene tree, and its
duplication node is being read as a speciation node. Confirm with the second copy retained in an
outgroup, and with synteny.

**(c)** If the ancestor carried paralogs X1 and X2 and each lineage independently ends single-copy
with probability *q*, retaining either copy with equal chance, both are single-copy with probability
*q*², and half of those retained *different* paralogs:

```
P(pseudoorthology) = q²/2 = 0.25/2 = 0.125 = 12.5%
```

One family in eight. RBH pairs A-X1 with C-X2, scores it highly, and cannot detect the error —
each really *is* the other's best surviving hit.

**(d)** **Function is transferred along the orthology assignment**, so the error is an annotation
copied from the wrong paralog — precisely the copy whose function was licensed to diverge, since
duplication is where functional change happens and speciation is not. High identity does not rescue
you: expression domain can diverge completely while coding sequence stays >90% identical. And the
annotation does not stay put — it is deposited in a database, inherited by every downstream
pipeline, and silently weights every enrichment analysis run against that genome afterwards.

</details>

---

## 8. ★ Why duplicate genes survive at all

A newly duplicated pair. Null mutations arise per copy at rate *u*<sub>n</sub>; mutations conferring
a beneficial new function at *u*<sub>b</sub>, with coefficient *s*. Write
φ = *u*<sub>b</sub>/*u*<sub>n</sub>.

**(a)** Derive the rate at which a null mutation fixes in one copy. Note what is absent.
**(b)** Derive P(neo) and evaluate for a vertebrate (*N*<sub>e</sub> = 10⁴) and an insect
(*N*<sub>e</sub> = 10⁷), with *s* = 0.01 and φ = 10⁻⁴.
**(c)** Derive P(sub) under duplication–degeneration–complementation with *n* = 2 regulatory
elements; evaluate at *r* = *u*<sub>r</sub>/*u*<sub>c</sub> = 1 and *r* = 2.
**(d)** **(trap)** Vertebrate genomes retain roughly 20% of duplicate pairs long-term. Show
neofunctionalisation alone cannot account for that, and give the *N*<sub>e</sub> it would require.
**(e)** Combine the mechanisms into a total predicted retention. Why is a naive sum approximately
right here, and what is still missing?

<details><summary>Solution</summary>

**(a)** Immediately after duplication both copies are functional and either is dispensable, so a null
mutation in either is **selectively neutral**. By problem 1, nulls arise at 2*N*·*u*<sub>n</sub> and
each fixes with probability 1/(2*N*), giving **λ<sub>null</sub> = *u*<sub>n</sub>**. **What is absent
is *N*** — the duplicate decays on a clock population size cannot slow, which is why
nonfunctionalisation is the default and preservation needs an active explanation.

**(b)** Beneficial mutations arise at 2*N*·*u*<sub>b</sub> and fix with probability ≈ 2*s*, so
λ<sub>neo</sub> = 4*N u*<sub>b</sub>*s*. For competing Poisson processes the probability the
beneficial one arrives first is the ratio of rates:

```
P(neo) = 4Nu_b s/(4Nu_b s + u_n) = 4Nsφ/(4Nsφ + 1)

Vertebrate: 4Nsφ = 4 × 10⁴ × 0.01 × 10⁻⁴ = 0.04  →  P = 0.04/1.04 = 0.0385 = 3.85%
Insect:     4Nsφ = 4 × 10⁷ × 0.01 × 10⁻⁴ = 40    →  P = 40/41   = 0.9756 = 97.6%
```

**Ohno's mechanism is efficient in large populations and nearly useless in small ones**, because 2*s*
does not shrink with *N* while 1/(2*N*) does.

**(c)** Give the gene 2 independently mutable regulatory elements plus a coding region whose loss
kills the copy; *u*<sub>r</sub> is the null rate per element, *u*<sub>c</sub> the coding null rate.

**Step 1.** Neutral targets: 2 copies × (1 coding + 2 elements), total rate
2(*u*<sub>c</sub> + 2*u*<sub>r</sub>). A coding hit ends in nonfunctionalisation, a regulatory hit
does not, so P(regulatory first) = 4*u*<sub>r</sub>/(2*u*<sub>c</sub> + 4*u*<sub>r</sub>).

**Step 2.** Say element 1 of copy A is gone. Copy B's element 1 is now the only source of
subfunction 1, and its coding region indispensable, so mutations in either are deleterious. That
leaves three neutral targets — copy A's coding region (*u*<sub>c</sub>), copy A's element 2
(*u*<sub>r</sub>), copy B's element 2 (*u*<sub>r</sub>) — and only the last completes the pair.

```
P(sub) = 2u_r/(u_c + 2u_r) × u_r/(u_c + 2u_r) = 2r²/(1 + 2r)²

r = 1:  2(1)/(3)²  = 2/9  = 0.2222 = 22.2%
r = 2:  2(4)/(5)²  = 8/25 = 0.3200 = 32.0%
```

**Look at what is missing: *N*.** Subfunctionalisation preserves duplicates by *degrading* them,
through individually neutral mutations, so it works as well at 10⁴ as at 10⁷.

**(d)** **The trap is assuming a preserved duplicate must have acquired a new function.**
Neofunctionalisation predicts **3.85%** against an observed **20%**, and the gap cannot be tuned
away, because closing it needs 4*N*<sub>e</sub>*s*φ = 0.25:

```
N = 0.25/(4 × 0.01 × 10⁻⁴) = 0.25/(4 × 10⁻⁶) = 62,500
```

**An *N*<sub>e</sub> of 6.25 × 10⁴, over six times the vertebrate estimate.** Vertebrates are
duplicate-rich *and* small-*N*<sub>e</sub> — the combination Ohno's mechanism cannot deliver.

**(e)** Let the beneficial route take its share first and route the remainder into the DDC branching:

```
P(neo)          = 0.0385
remainder       = 1/1.04 = 0.9615
P(sub) joint    = 0.9615 × 0.2222 = 0.2137
total retention ≈ 0.0385 + 0.2137 = 0.2521  →  25.2%
```

The naive sum, 0.0385 + 0.2222 = 26.1%, is within 1 percentage point, because φ = 10⁻⁴ makes the
beneficial route only 4% as fast as the null route, so it barely depletes the DDC path. The same
approximation would fail for the insect, where that route carries 97.6% of the flow.

**25.2% predicted against ~20% observed** — the right order, from a model whose dominant term is not
adaptive at all. Still missing is **dosage balance**: proteins in stoichiometric complexes cannot
lose a copy without misassembly, so loss is deleterious rather than neutral. It dominates after
whole-genome duplication, which is why WGD pairs show a ~23 My half-life against ~8 My for
small-scale duplicates in the same genome.

</details>

---

## Where you went wrong

| Error pattern | What to re-read |
|---|---|
| Used a per-*replication* rate where a per-*generation* rate belongs | Problem 1(e); [verified facts](../reference/verified-facts.md) |
| Read *k* = μ as "big populations evolve more slowly" | Problem 1(c) — the two factors of *N* cancel exactly |
| Treated the Jukes–Cantor correction as a small constant tweak | Problem 2(a) — 3.5% at *p* = 0.05, 53% at *p* = 0.45 |
| Compared raw counts of synonymous and nonsynonymous changes | Problem 3(a) — the code offers ~3× more nonsynonymous sites |
| Read ω < 1 as evidence against positive selection | Problem 3(d) — five selected codons in 300 give ω = 0.23 |
| Confused what π and θ<sub>W</sub> weight, or called a negative *D* a sweep | Problem 4(a),(c) — same *S*, *D* from −2.21 to +2.88; 4(d) — sweep and expansion are confounded |
| Quoted a divergence date to three significant figures, or forgot divergence predates the split | Problem 5(c) — it moves twofold with μ alone; 5(c2) — subtract 2*N*<sub>anc</sub> generations |
| Read a negative α as evidence against adaptation | Problem 6(e) — deleterious polymorphism inflating P<sub>n</sub> |
| Reached for ILS to explain a deep discordant node | Problem 7(b) — ILS is bounded by ~2*N*<sub>e</sub> generations |
| Trusted reciprocal best hits to return orthologs | Problem 7(c) — *q*²/2 ≈ 12.5% pseudoorthology |
| Assumed a retained duplicate acquired a new function | Problem 8(d) — subfunctionalisation is neutral and *N*-independent |
