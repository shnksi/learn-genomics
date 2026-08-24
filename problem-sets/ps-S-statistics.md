# Problem set S — Statistics for genetics

Covers [S1–S7](../part-S-statistics/S1-probability.md).

**Attempt before revealing.** These problems are not statistics exercises with genetics decoration
on them — every one is a calculation someone actually has to do before a result can be reported,
and each is built around a specific place where the arithmetic comes out one way and the intuition
comes out another. Problems 2, 4 and 6 have answers most people get wrong on the first pass, and
problem 8 is the one that decides whether a genome-wide scan is a discovery or a bug. Where a
problem gives you code, run it from the repository root with `source .venv/bin/activate`.

---

## 1. A carrier test that comes back negative

A woman's brother has cystic fibrosis, an autosomal recessive condition. Their parents are both
unaffected. She is unaffected and has no children.

She takes a carrier screening panel. In this population the panel has **90% sensitivity** —
P(panel calls her a carrier | she is a carrier) = 0.90 — and no false positives, so
P(panel calls her a carrier | she is not a carrier) = 0. Her result is **negative**.

Her partner is unrelated, from the same population, and has not been screened. The population
carrier frequency is 1 in 25.

**(a)** Lay out the prior / conditional / joint / posterior table and compute her posterior
probability of being a carrier.
**(b)** Compute the risk to their first child.
**(c)** By what factor did the negative test change that risk, and can you see that factor without
redoing the table?
**(d)** A colleague uses a prior of 1/2 instead, "because she is a sibling". How wrong is the final
answer?

<details><summary>Solution</summary>

**(a)** The prior comes from the pedigree, not from the population. Both parents must be carriers
(they produced an affected child), so she is a child of *Aa* x *Aa*. The observation "unaffected"
deletes the *aa* quarter of the sample space and the survivors renormalise
([S1 §3](../part-S-statistics/S1-probability.md)):

prior P(carrier) = 2/3, P(non-carrier) = 1/3.

The conditional row is the likelihood of **what was actually observed** — a negative result — under
each hypothesis:

- P(negative | carrier) = 1 - 0.90 = 0.10
- P(negative | non-carrier) = 1.00 (no false positives)

| | *H*1: carrier | *H*0: not a carrier |
|---|---|---|
| **Prior** | 2/3 = 0.666667 | 1/3 = 0.333333 |
| **Conditional** — negative result | 0.10 | 1.00 |
| **Joint** | 0.066667 | 0.333333 |
| **Posterior** | 0.066667 / 0.400000 = **1/6 = 0.166667** | 0.833333 |

**(b)** An affected child needs both parents to carry *and* both to transmit:

P(both carry) = (1/6) x (1/25) = 1/150 = 0.006667

Risk to the child = 1/150 x 1/4 = **1/600 = 0.001667**

**(c)** Before the test her carrier probability was 2/3, so the risk was
(2/3) x (1/25) x (1/4) = 1/150. The test divided the risk by exactly **4**.

You can see that without the table, and this is the more useful way to hold it. The evidence
contributed by any single observation is a **likelihood ratio** ([S6 §4](../part-S-statistics/S6-likelihood-and-bayes.md)):

LR = P(negative | carrier) / P(negative | non-carrier) = 0.10 / 1.00 = 0.10

Prior odds 2:1 in favour of carrier, times LR 0.10, gives posterior odds 0.2:1 — that is 1:5, so
P(carrier) = 1/6. Her carrier probability fell from 2/3 to 1/6, a factor of 4, and everything
downstream is linear in it, so the child's risk falls by the same factor.

Odds x likelihood ratio is the whole of Bayes' theorem for two hypotheses, and it lets you update
in your head. It also makes the order of evidence obviously irrelevant: multiplication commutes.

**(d)** With a 1/2 prior the posterior is (0.5 x 0.10) / (0.5 x 0.10 + 0.5 x 1.00) = 1/11 = 0.0909,
and the child's risk becomes (1/11) x (1/25) x (1/4) = **1/1,100**.

That understates the true 1/600 by a factor of **1.83**. The error is in the direction that
reassures the family, which is the direction errors in genetic counselling must not run.

**The trap generalises.** A negative screen never takes the risk to zero — the number that remains
is the **residual risk**, and it is driven by the assay's *sensitivity*, not its specificity. A
panel that detects 90% of carriers leaves a tenth of carriers undetected, and for a woman who
started at 2/3 that residual is substantial. Note the contrast with problem 2, where specificity is
the number that matters: which of the two performance figures dominates depends entirely on whether
you are conditioning on a positive or a negative result.

</details>

---

## 2. A screening programme, and the number everyone gets wrong

A newborn screening test for a recessive metabolic disorder affecting **1 in 15,000** newborns has
sensitivity 99% and specificity 99.5%.

**(a)** Work out, per million newborns screened, the number of true positives, false positives, and
the positive predictive value.
**(b)** A clinician tells a family "this test is 99% accurate, so there is a 99% chance your baby is
affected". By what factor is that wrong?
**(c)** A vendor offers, at the same price, *either* perfect sensitivity *or* a tenfold reduction in
the false-positive rate. Which do you take, and how much does each buy?
**(d)** The same assay is now offered to a community where the disorder affects 1 in 400. Prevalence
rose 37.5-fold. Did the PPV?

<details><summary>Solution</summary>

**(a)** Build the two-by-two table by counting people, which is the only way to do this without
getting lost ([S1 §8](../part-S-statistics/S1-probability.md)).

Per 1,000,000 newborns:

| | Affected | Unaffected | Total |
|---|---|---|---|
| Count | 66.67 | 999,933.33 | 1,000,000 |
| Test positive | 66.67 x 0.99 = **66.00** | 999,933.33 x 0.005 = **4,999.67** | 5,065.67 |

PPV = P(affected | positive) = 66.00 / 5,065.67 = **0.01303 = 1.30%**

About **1 positive result in 77** is a real case.

The rare-disease approximation confirms it: PPV is roughly prevalence x sensitivity / FPR =
(1/15,000 x 0.99) / 0.005 = 0.0132 = 1.32%, against the exact 1.30%.

**(b)** The true PPV is 1.30%, so the claim of 99% is too high by a factor of **76**.

The clinician has substituted P(positive | affected) for P(affected | positive). These are different
conditionals over different sample spaces, and the arithmetic reason they differ so violently is
that the unaffected pool is **14,999 times larger** than the affected pool, so even a small
false-positive rate applied to it swamps the true positives.

**(c)** Do both, and the answer is not close.

- **Perfect sensitivity:** true positives rise from 66.00 to 66.67, false positives unchanged at
  4,999.67. PPV = 66.67 / 5,066.33 = **1.316%**. A gain of 0.013 percentage points — a relative
  improvement of 1%.
- **Tenfold fewer false positives** (specificity 99.5% to 99.95%): true positives unchanged at
  66.00, false positives fall to 499.97. PPV = 66.00 / 565.97 = **11.66%**, an **8.95-fold**
  improvement.

Take the specificity, and it is not a close call. For a rare condition PPV is approximately
prevalence x sens / FPR: **linear in prevalence, inversely proportional to the false-positive rate,
and almost indifferent to sensitivity** once sensitivity is already high. This is why assay
development for screening spends nearly all its effort on false positives, and why the right
question to ask a laboratory is its observed PPV in a clinical series rather than its sensitivity.

**(d)** No — the PPV rose by considerably less than the prevalence did.

At prevalence 1/400, per million: 2,500 affected giving 2,475 true positives; 997,500 unaffected
giving 4,987.5 false positives.

PPV = 2,475 / 7,462.5 = **33.17%**, about 1 positive in 3.

Prevalence rose 37.5-fold; PPV rose **25.5-fold**. The approximation PPV ~ prevalence x sens / FPR
now predicts 49.5%, badly overshooting the true 33.17%, because it assumed the denominator was
dominated by false positives and at this prevalence it no longer is. PPV is linear in prevalence
only while the condition is rare; it saturates towards 1 as prevalence grows.

**The lesson to carry.** The identical laboratory assay delivers a 1.3% PPV and a 33% PPV depending
only on who is being tested. **Quoting test performance without naming a population is
meaningless**, and one result letter means different things to two families — which is the argument
in [Ch 57](../part-12-applications-and-ethics/57-genomics-in-practice.md), and the reason a positive
screen is grounds for a different, diagnostic test rather than a diagnosis.

</details>

---

## 3. Naming the process before doing the arithmetic

**(a)** For each of the following, name the distribution the generating story implies, and give its
parameters ([S2](../part-S-statistics/S2-distributions.md)). One of the six does **not** fit the
distribution you would first reach for — say which, and why.

1. Two carrier parents of an autosomal recessive condition have five children. Count the affected.
2. One individual's ALT-allele dosage (0, 1 or 2) at a SNP of frequency *p*, under random mating.
3. The number of reads covering a given base, in a shotgun library of average depth *d*, if reads
   land at a constant rate along the genome.
4. Read counts for one gene, across three biological replicates of the same yeast strain.
5. The number of base pairs from one variant to the next along a chromosome.
6. The number of crossovers on one chromosome arm in one meiosis.

**(b)** For scenario 1, compute P(exactly two affected) and P(at least one affected).

**(c)** You are sequencing the 4,629,812 bp *E. coli* REL606 genome and need at least 5x depth at
every base to call variants. Using the Poisson model, how much of the genome is under-covered at 15x
and at 30x?

**(d)** You align a pilot run and measure mean depth 6.047 with variance 9.031. Refit and redo (c).
At what average depth does the honest model deliver what Poisson promised at 15x?

<details><summary>Solution</summary>

**(a)**

| | Distribution | Why |
|---|---|---|
| 1 | **Binomial(5, 1/4)** | Five independent trials, identical success probability from Mendelian segregation |
| 2 | **Binomial(2, *p*)** | A genotype is two independent draws from the gamete pool; *p*^2 : 2*pq* : *q*^2 *is* this pmf |
| 3 | **Poisson(*d*)** | Enormously many reads, each with a tiny chance of covering this base, product held fixed — the Lander-Waterman model |
| 4 | **Negative binomial(mean mu, dispersion alpha)** | Poisson sampling of a rate that itself varies between biological replicates; variance = mu + alpha·mu^2 |
| 5 | **Exponential(rate)** — geometric in discrete bp | Waiting time between events of a Poisson process |
| 6 | **Not Poisson** | See below |

**Scenario 6 is the odd one out.** The Poisson story fits — a chromosome arm has enormously many
base pairs, each with a tiny per-bp crossover probability — but the Poisson limit needs those
opportunities to be *independent*, and crossovers are not. Interference suppresses a second
crossover near a first, and the obligate crossover guarantees at least one per bivalent. The result
is **underdispersion**: variance below the mean, crossovers more evenly spaced than Poisson allows.
A Poisson bivalent with mean 1 would have no crossover 37% of the time, and real bivalents
essentially always have one.

That is not a curiosity — it is exactly the difference between the Haldane mapping function (Poisson,
no interference) and Kosambi (interference built in) in
[Ch 14](../part-02-transmission-genetics/14-linkage-and-mapping.md).

Note also what scenarios 3 and 4 have in common. Both are counts; they differ only in whether the
underlying rate is fixed. Technical replicates of one library really are Poisson; biological
replicates of different cultures are not, and that single distinction is why DESeq2 exists.

**(b)** Binomial(5, 0.25):

P(exactly 2) = C(5,2) x 0.25^2 x 0.75^3 = 10 x 0.0625 x 0.421875 = **0.2637**

P(at least one) = 1 - P(none) = 1 - 0.75^5 = 1 - 0.2373 = **0.7627**

```python
from scipy import stats
print(round(stats.binom.pmf(2, 5, 0.25), 6),
      round(stats.binom.sf(0, 5, 0.25), 6))                  # 0.263672 0.762695
```

The C(5,2) = 10 is the step that gets dropped. Without it you compute 0.0264, the probability of one
particular *ordered* outcome, which is almost never the question asked. Expected number affected is
5 x 0.25 = 1.25 with sd 0.97, so a family of five carrying a 1-in-4 risk very often has none
(P = 0.2373) and this is not evidence against the diagnosis.

**(c)** Under Poisson with lambda = depth, P(depth < 5) = P(0) + ... + P(4):

```python
from scipy import stats
G = 4_629_812
for d in (15, 30):
    c = stats.poisson.cdf(4, d)
    print(d, f"{c:.6e}", f"{G*c:,.0f}")
```

- **15x:** P(depth < 5) = 8.566 x 10^-4, i.e. **3,966 bases** under-covered
- **30x:** P(depth < 5) = 3.624 x 10^-9, i.e. **0.017 bases** — nothing

On this evidence 15x looks like plenty, and the textbook answer is to buy it.

**(d)** Poisson requires variance = mean. The pilot run has variance/mean = 9.031/6.047 = 1.49, so it
does not hold. Fit the negative binomial by moments
([S2 §5](../part-S-statistics/S2-distributions.md)):

alpha = (variance - mean) / mean^2 = (9.031 - 6.047) / 6.047^2 = **0.0816**

In scipy's parameterisation *n* = 1/alpha = 12.255 and *p* = *n*/(*n* + *d*):

```python
alpha = 0.0816; n_ = 1/alpha
for d in (15, 30):
    p_ = n_/(n_ + d)
    print(d, f"{stats.nbinom.cdf(4, n_, p_):.6e}")
```

- **15x:** P(depth < 5) = 1.291 x 10^-2 — **59,760 bases**, fifteen times the Poisson estimate
- **30x:** P(depth < 5) = 1.454 x 10^-4 — **673 bases**

Solving for the depth at which the negative binomial delivers Poisson's 15x promise of 8.57 x 10^-4
gives **23.5x**; the negative binomial first crosses the 0.1% under-covered mark at **23.0x**.

**Read the direction of the error, not just its size.** Poisson is not merely imprecise here, it is
**biased in the direction that costs you**, and the bias grows the further into the tail you go —
which is exactly where the purchasing decision is made. That is the argument for the 30x convention
in genomics: it is not superstition and it is not Lander-Waterman, which would have settled on half
that. It is Lander-Waterman corrected for the fact that lambda is not constant along a genome.

The general form of the mistake: **when a derivation's assumptions fail, the distribution fails in a
predictable direction.** Poisson needs constant *p* across opportunities. Vary *p* (GC content,
mappability, repeats, library chemistry) and you get overdispersion and a fatter lower tail. Make
events repel each other and you get underdispersion — which is scenario 6 in part (a).

</details>

---

## 4. A standard error, a bootstrap, and an error neither can see

You genotype 200 unrelated individuals at a biallelic SNP and observe:

| Genotype | Count |
|---|---|
| *AA* | 84 |
| *AG* | 72 |
| *GG* | 44 |

Report frequencies of the *A* allele throughout.

**(a)** Compute *p*-hat and its standard error from the binomial formula, and give a 95% Wald
interval.
**(b)** You want to halve the standard error. How many individuals? How many to reach SE = 0.01?
**(c)** Bootstrap the same estimate by resampling **individuals**. The bootstrap SE comes out about
12% larger than the formula's. Is the bootstrap wrong, is the formula wrong, or neither?
**(d)** Now suppose that instead of this sample, a large study of the same population uses an assay
in which a variant under the probe causes **5% of true heterozygotes to be called *AA***. The true
allele frequency is 0.60 and the population is in Hardy-Weinberg proportions. What does the study
estimate, and at what sample size does its 95% confidence interval stop containing the truth?

<details><summary>Solution</summary>

**(a)** Count alleles. 200 individuals is 400 chromosomes.

*p*-hat = (2 x 84 + 72) / 400 = 240/400 = **0.6000**

SE = sqrt(*p*(1-*p*)/2*n*) = sqrt(0.24/400) = **0.024495**

Note the 2*n* = 400: the natural sampling unit for an allele frequency is the **chromosome**, not
the person ([S3 §3](../part-S-statistics/S3-sampling-and-estimation.md)).

95% Wald interval = 0.6000 ± 1.96 x 0.024495 = 0.6000 ± 0.048010 = **[0.5520, 0.6480]**

**(b)** SE is proportional to 1/sqrt(*n*), so halving it needs **four times** the sample: **800
individuals**.

For SE = 0.01, solve *n* = *p*(1-*p*)/(2 x SE^2) = 0.24/(2 x 0.0001) = **1,200 individuals**.
Check: sqrt(0.24/2400) = 0.0100. A sixfold increase in cost buys a 2.4-fold improvement in
precision, which is the whole economics of biobanks in one line.

**(c)** **Neither is wrong. They are estimating the same quantity under different assumptions, and
the formula's assumption fails here.**

The binomial formula treats the 400 allele copies as 400 independent draws. You did not sample
allele copies; you sampled 200 people, each contributing a *correlated pair*. That is only
equivalent when genotypes are in Hardy-Weinberg proportions, and these are not:

expected heterozygotes = 2*pq* x *N* = 0.48 x 200 = 96, observed 72

*F*-hat = 1 - *H*o/*H*e = 1 - 72/96 = **+0.25**, a substantial heterozygote deficit.

[S3 §4](../part-S-statistics/S3-sampling-and-estimation.md) gives the corrected variance:

Var(*p*-hat) = *p*(1-*p*)(1 + *F*) / 2*n* = 0.24 x 1.25 / 400 = 0.00075, SE = **0.027386**

and 0.027386 / 0.024495 = 1.118 = sqrt(1 + *F*) = sqrt(1.25). The 12% inflation is exactly the term
the formula dropped.

The bootstrap gets there without being told, because it resamples the unit you actually sampled:

```python
import numpy as np
def bootstrap(data, stat, B=20000, seed=0):
    rng = np.random.default_rng(seed)
    n = len(data)
    return np.array([stat(data[rng.integers(0, n, n)]) for _ in range(B)])

g = np.repeat([2, 1, 0], [84, 72, 44]).astype(float)      # A-allele dosage per person
reps = bootstrap(g, lambda d: d.mean()/2, B=20000, seed=1)
print(round(reps.std(ddof=1), 6))                          # 0.027473
```

Bootstrap SE **0.027473** against the corrected analytic 0.027386 — agreement to three decimals.
The honest interval is 0.6000 ± 0.053678 = **[0.5463, 0.6537]**, 12% wider than the Wald interval in
(a).

The same three lines on real data, where the sample *is* in Hardy-Weinberg proportions, show the
contrast (503 European-ancestry samples, chr22:20,059,164, from
[lab-07](../labs/lab-07-population-genetics.md)):

```python
import pandas as pd
raw   = pd.read_csv("labs/data/chr22_qc.raw", sep="\t")
G     = raw.iloc[:, 6:].to_numpy(dtype=np.int8)
panel = pd.read_csv("labs/data/panel.txt", sep="\t").set_index("sample")
sp    = panel.loc[raw["IID"].to_numpy(), "super_pop"].to_numpy()
eur   = G[sp == "EUR", 185].astype(float)                  # counts [170 243 90]
p     = eur.mean()/2                                       # --export A counts the REF allele
print("p_hat        %.6f" % p)
print("formula SE   %.6f" % np.sqrt(p*(1-p)/(2*len(eur))))
print("bootstrap SE %.6f" % bootstrap(eur, lambda d: d.mean()/2, B=20000, seed=1).std(ddof=1))
```

```
p_hat        0.420477
formula SE   0.015564
bootstrap SE 0.015618
```

*F*-hat here is +0.0087, so sqrt(1 + *F*) = 1.004 and the two agree to three decimals — as they must.
**The bootstrap is not merely a substitute for a formula you cannot derive. It is often the more
honest calculation, because it makes fewer assumptions about the data you actually collected.**

**(d)** Work out the bias first, algebraically. Each miscalled heterozygote changes that person's
*A*-allele count from 1 to 2, so it adds 1 to a total of 2*n*:

*p*-observed = *p* + *d* x *H*/2, where *H* = 2*pq* = 0.48 and *d* = 0.05

= 0.60 + 0.05 x 0.24 = **0.612**

The bias is **+0.012**, and — this is the whole point — it does not depend on *n* at all.

The 95% interval half-width is 1.96 x sqrt(0.24/2*n*). Set that equal to the bias:

1.96 x sqrt(0.12/*n*) = 0.012 → *n* = **3,201 individuals**

At that sample size the interval covers the true 0.60 exactly half the time. Beyond it, coverage
collapses:

| *n* | SE | CI half-width | bias / SE | coverage of the true 0.60 |
|---|---|---|---|---|
| 200 | 0.02449 | 0.04801 | 0.49 | 0.922 |
| 3,201 | 0.00612 | 0.01200 | 1.96 | 0.500 |
| 20,000 | 0.00245 | 0.00480 | 4.90 | 0.002 |
| 200,000 | 0.00077 | 0.00152 | 15.49 | 0.000 |

**More data did not help. More data is what did the damage.** At *n* = 200,000 the study is
guaranteed to report a confidently wrong answer with a tight interval and a tiny p-value. Sample
size cures variance and never cures bias, and a confidence interval, a p-value and a bootstrap all
quantify sampling error *only* — they are silent about whether the assay is calibrated.

The wrong path worth naming: "our interval is narrow, so the estimate is good." Precision is not
accuracy, and the two diverge in opposite directions as *n* grows.

**What would catch it.** Not statistics — a diagnostic. Dropout converts heterozygotes into
homozygotes, so it shows up as a heterozygote deficit. Here the induced *F* is
1 - 0.456/(2 x 0.612 x 0.388) = **+0.0398**, and since SE(*F*-hat) is about 1/sqrt(*n*), the ratio
*F*/SE is 0.56 at *n* = 200, 2.25 at *n* = 3,201, and 5.63 at *n* = 20,000. The same growth in *n*
that makes the bias fatal is what makes the Hardy-Weinberg test able to see it — which is precisely
why HWE filtering is a genotyping quality-control step and not a population-genetic discovery
([S4 §6](../part-S-statistics/S4-hypothesis-testing.md)).

</details>

---

## 5. One degree of freedom, and the power you actually had ★

A study genotypes 400 unrelated individuals from a single ancestry group at one SNP:

| Genotype | Count |
|---|---|
| *AA* | 106 |
| *AG* | 188 |
| *GG* | 106 |

The allele frequency is estimated from these same counts.

**(a)** Compute the Hardy-Weinberg chi-square statistic, give the correct degrees of freedom, and
compute the p-value both with the correct df and with the df most people use. Which direction does
the error run?
**(b)** Compute the effect size *F*-hat and its 95% interval. Verify that chi-square = *N* x *F*-hat^2.
**(c)** The paper concludes "the locus is in Hardy-Weinberg equilibrium". Compute the power this test
actually had against *F* = 0.06, and the smallest *F* it could have detected with 80% power at
alpha = 0.05. Then do the same at the alpha = 10^-6 threshold a real QC pipeline would use.
**(d)** Under what circumstance would df = 2 be correct?

<details><summary>Solution</summary>

**(a)** Estimate *p* from the counts, then build expectations.

*p*-hat(*A*) = (2 x 106 + 188) / 800 = 400/800 = 0.5000

| | *AA* | *AG* | *GG* |
|---|---|---|---|
| Observed | 106 | 188 | 106 |
| Expected | 400 x 0.25 = 100 | 400 x 0.50 = 200 | 100 |
| (O-E)^2/E | 0.36 | 0.72 | 0.36 |

chi-square = 0.36 + 0.72 + 0.36 = **1.440**

**df = 1, not 2.** The rule is df = (classes) - 1 - (parameters estimated from these same data)
= 3 - 1 - 1 = 1. One degree of freedom goes to the fixed total; the second is spent because *p*-hat
was computed from the very counts being tested, bending the expectations toward the data before the
comparison ([S2 §4](../part-S-statistics/S2-distributions.md),
[S4 §2](../part-S-statistics/S4-hypothesis-testing.md)).

- p-value, df = 1 (correct): **0.2301**
- p-value, df = 2 (the error): **0.4868**

**The error is conservative, which is why it survives peer review and why it is worse than it
looks.** Using df = 2 more than doubles the p-value, so at alpha = 0.05 the test rejects about 1.4%
of the time instead of 5%. You have thrown away most of your power in exchange for nothing, and you
will never see the genotyping failures you missed. Conservative is safe against Type I error and
reckless against Type II — and for a QC filter, Type II is the failure that matters.

In scipy, `stats.chisquare(obs, exp, ddof=1)` gives df = 1, because `ddof` is subtracted from
*k* - 1. The default `ddof=0` silently gives you the wrong answer.

**(b)** *F*-hat = 1 - *H*o/*H*e = 1 - 188/200 = **+0.060**

*N* x *F*-hat^2 = 400 x 0.0036 = **1.440**, exactly the chi-square. That identity is not a
coincidence: substituting the definition of *F*-hat into Sigma(O-E)^2/E makes every *p*-hat and
*q*-hat cancel, leaving *N F*^2 on 1 df ([S4 §4](../part-S-statistics/S4-hypothesis-testing.md)).

It follows immediately that sqrt(*N*) x *F*-hat is standard normal under the null, so
SE(*F*-hat) = 1/sqrt(*N*) = 1/20 = 0.050 and

95% interval = 0.060 ± 1.96 x 0.050 = **[-0.038, +0.158]**

**(c)** The non-centrality parameter is lambda = *N F*^2, so power is a tail probability of a
non-central chi-square:

```python
from scipy import stats
from scipy.optimize import brentq
def power(N, F, alpha):
    return stats.ncx2.sf(stats.chi2.ppf(1-alpha, 1), 1, N*F**2)
print(round(power(400, 0.06, 0.05), 4))                              # 0.2244
print(round(brentq(lambda F: power(400, F, 0.05) - 0.8, 0.01, 2), 4))   # 0.1401
print(round(brentq(lambda F: power(400, F, 1e-6) - 0.8, 0.01, 2), 4))   # 0.2867
```

| | alpha = 0.05 | alpha = 10^-6 |
|---|---|---|
| Power against *F* = 0.06 | **0.224** | 0.00011 |
| Smallest *F* detectable with 80% power | ***F* = 0.140** | ***F* = 0.287** |
| *N* needed for 80% power at *F* = 0.06 | 2,180 | 9,131 |

**So the conclusion is unsupported.** A test with 22% power against the departure it actually
estimated has not established equilibrium; it has established that nobody looked hard enough to
tell. To be reliably caught at alpha = 0.05 a departure would have to exceed *F* = 0.14, and at the
10^-6 threshold a real pipeline uses, *F* = 0.29 — larger than the heterozygote deficit produced by
mating full sibs.

**The fix is to report the effect size and its interval instead of the verdict.** "*F*-hat = +0.060,
95% CI [-0.038, +0.158]" is a real statement: the data rule out a deficit above about 0.16 and an
excess below about -0.04, and are agnostic in between. "p = 0.23, not significant" throws all of
that away. A confidence interval **contains** the test — anything outside it would have been
rejected — and adds the magnitude the test omits.

Note also the exchange rate in the table. The same study, the same real departure, tested at 0.05
and at 10^-6, needs a 4.2-fold larger sample for the same power. Tightening alpha to control false
positives buys that control with power, and multiplying *N* is the only currency accepted.

**(d)** If *p* were **not** estimated from these counts — supplied instead by a large independent
reference, so the expectations were fixed before you looked — then the only constraint is the fixed
total and df = 3 - 1 = **2**.

That is the whole content of the rule. Degrees of freedom count how many of the numbers were free to
vary, and every parameter you fit to the data you are testing costs one. The same rule gives df = 2
for a 1:2:1 F2 ratio (Mendel supplied the ratio; you estimated nothing) and df = 3 for a 9:3:3:1
dihybrid test.

</details>

---

## 6. Variance that will not add, and a coefficient that changes sign ★

**Part I — variance partitioning.**

A two-SNP polygenic score is the sum of two allelic contributions. Contribution 1 has variance 0.20,
contribution 2 has variance 0.45, and the two contributions correlate at *r* = +0.50 because the SNPs
are in linkage disequilibrium.

**(a)** Compute the variance of the score. What would you have got assuming independence, and by how
much would you have been wrong — in variance, and in standard deviation?
**(b)** [S5 §2](../part-S-statistics/S5-variance-and-regression.md) builds a 200-SNP unweighted score
on real chr22 genotypes and reports sum-of-variances 38.56 against variance-of-the-sum 132.62. What
fraction of the score's variance is cross term, and what does that imply for any formula written as
*V*A = Sigma 2*p*i*q*i·alpha_i^2?

**Part II — controlling for a confounder.**

An association study pools 1,000 people from ancestry group A and 1,000 from group B, and regresses a
quantitative trait *y* on dosage *x* of the *T* allele (0, 1 or 2 copies). Let *z* = 1 for group B and
0 for group A. Within each group the SNP is in Hardy-Weinberg proportions, with *T* allele frequency
**0.20 in group A** and **0.60 in group B**.

The true data-generating model, which the investigators cannot see, is

```
y  =  12.0  +  0.15·x  -  0.84·z  +  noise
```

**(c)** Compute the coefficient the investigators get when they regress *y* on *x* with no covariate.
**(d)** Which estimate is the causal one, and what exactly would you have to believe to report it?

<details><summary>Solution</summary>

**(a)** Standard deviations never add. Variances do, but only when the contributions are independent
— otherwise there is a cross term:

Var(*X* + *Y*) = Var(*X*) + Var(*Y*) + 2·Cov(*X*, *Y*)

Cov = *r* x sd1 x sd2 = 0.50 x sqrt(0.20) x sqrt(0.45) = 0.50 x sqrt(0.09) = 0.50 x 0.30 = **0.150**

Var(score) = 0.20 + 0.45 + 2(0.150) = **0.950**

Assuming independence gives 0.65 — an underestimate of **31.6% of the true variance**. The score's
sd is sqrt(0.95) = 0.9747 against sqrt(0.65) = 0.8062, a ratio of **1.209**.

Note that the cross term can go either way: at *r* = -0.50 the same two contributions give
Var = 0.65 - 0.30 = **0.35**, and the independence assumption's 0.65 is now **1.86 times too
large**. The sign of the error follows the sign of the covariance; only its absence is safe.

**(b)** Cross-term share = (132.62 - 38.56) / 132.62 = 94.06/132.62 = **70.9%**.

Single-locus variances account for only 38.56 of 132.62 — the variance of the score is **3.44 times**
the sum of the per-locus variances. The rest is covariance between loci: linkage disequilibrium plus
the fact that those 2,503 people come from five continental groups whose allele frequencies differ,
which correlates every locus with every other.

So every formula of the form *V*A = Sigma 2*p*i*q*i·alpha_i^2 carries an unwritten clause: **assuming
linkage equilibrium**. That clause is hiding a factor of 3.4 in this dataset. The practical
consequence is direct — summing per-SNP variances across correlated markers understates the variance
of a polygenic score, so LD pruning or LD-aware weights are a **correctness requirement, not a
refinement** ([Ch 53](../part-11-human-and-statistical-genomics/53-polygenic-scores.md)).

This is also why variance, and not standard deviation or range, is the quantity quantitative genetics
is written in. Variance is the only measure of spread that can be divided into shares, and
heritability is a share.

**(c)** The omitted-variable formula ([S5 §6](../part-S-statistics/S5-variance-and-regression.md)):
if the true model is *y* = beta·*x* + gamma·*z* + noise and you omit *z*, you estimate

b_naive = beta + gamma·delta,   where delta is the slope of regressing *z* on *x*

You need delta, and it comes from the allele frequencies. With equal group sizes, *z* is 0 or 1 with
probability 1/2 each.

Mean dosage: group A = 2 x 0.20 = 0.40, group B = 2 x 0.60 = 1.20, overall = 0.80.

Cov(*z*, *x*) = E[*zx*] - E[*z*]E[*x*] = 0.5(1.20) - 0.5(0.80) = **0.200**

Var(*x*) decomposes into within-group and between-group parts:

- within: 0.5 x 2(0.2)(0.8) + 0.5 x 2(0.6)(0.4) = 0.5(0.32) + 0.5(0.48) = 0.400
- between: 0.5(0.40 - 0.80)^2 + 0.5(1.20 - 0.80)^2 = 0.160
- Var(*x*) = **0.560**

delta = Cov(*z*,*x*)/Var(*x*) = 0.200/0.560 = **0.357143**

b_naive = 0.15 + (-0.84)(0.357143) = 0.15 - 0.30 = **-0.150**

Check it directly, which is worth doing because the omitted-variable formula is easy to apply
backwards:

Cov(*x*, *y*) = beta·Var(*x*) + gamma·Cov(*x*, *z*) = 0.15(0.560) + (-0.84)(0.200)
= 0.084 - 0.168 = -0.084

b_naive = Cov(*x*,*y*)/Var(*x*) = -0.084/0.560 = **-0.150** ✓

**The unadjusted analysis reports the *T* allele as protective at -0.150. The adjusted analysis
reports it as risk-increasing at +0.150. Same data, opposite sign, same magnitude.**

The mechanism is visible in the group means: group A averages *y* = 12.06 and group B averages
*y* = 11.34, a difference of -0.72, while group B also carries three times as many *T* alleles.
Pooled, more *T* tracks lower *y* — and that association is entirely real as arithmetic. The
regression is not lying. The interpretation is.

The wrong path, and it is the common one: "the adjustment shrank the effect towards zero, so the
truth is somewhere in between." It is not. Adjustment moves a coefficient by gamma·delta, a signed
quantity, and when gamma·delta is larger in magnitude than beta and opposite in sign, the naive
estimate is on the wrong side of zero. The magnitude of the naive coefficient carries no information
about how far it is from the truth.

**(d)** The adjusted estimate, **beta = +0.15**, is the causal one — but only under conditions you
have to argue for rather than assume:

1. ***z* is the only confounder.** Adjusting for ancestry removes ancestry. It does nothing about
   assortative mating, genetic nurture, batch, or fine-scale structure within groups.
2. ***z* is measured without error.** "Adjusting for a covariate does not remove the confounder — it
   removes the component of the confounder that the covariate measures." Here *z* is the true group
   label, which no real study has. In practice you have ancestry principal components, and in
   [S5 §6](../part-S-statistics/S5-variance-and-regression.md)'s real example PC1 alone recovered
   only part of the bias (-0.317 to -0.290), ten PCs recovered most of it (-0.079), and the true
   label recovered all of it (-0.041).
3. ***z* is not on the causal path.** If the covariate is a **mediator** — something the genotype
   affects, which in turn affects the trait — adjusting for it deletes the effect you are trying to
   estimate. And if it is a **collider**, something *both* variables affect, conditioning on it
   manufactures an association out of nothing. The diagnostic question is directional: does the
   covariate sit *before* both variables or *after* them? Adjust for the first; never condition on
   the second.

Covariates are not free either. Each costs a degree of freedom, and one correlated with your
predictor inflates the coefficient's standard error. "Control for everything you measured" is not a
strategy — each covariate needs a reason.

</details>

---

## 7. A LOD score, and what it is evidence for

A family study tests linkage between a disease locus and a marker. There are **32 phase-known
informative meioses**, of which **6 are recombinant**. Logs are base 10 throughout.

**(a)** Compute the maximum likelihood estimate of the recombination fraction and the maximum LOD
score, Z(theta) = log10[ L(theta) / L(0.5) ].
**(b)** Is this linkage? Convert the LOD to a posterior probability using the conventional prior odds
of 1:50 against two randomly chosen loci being linked.
**(c)** A second, independent family gives Z = 0.90 at the same theta. Combine the two. Why are you
allowed to just add them?
**(d)** Convert the combined evidence into a likelihood-ratio test statistic. What is the p-value, and
name the reason "LOD 3 means p = 0.001" is wrong twice over.

<details><summary>Solution</summary>

**(a)** For *n* phase-known informative meioses of which *k* are recombinant, the likelihood is
binomial in theta, and the binomial coefficient cancels in the ratio:

Z(theta) = log10[ theta^*k* (1-theta)^(*n*-*k*) / 0.5^*n* ]

```python
import numpy as np
from scipy.optimize import minimize_scalar
n, k = 32, 6
lod = lambda t: np.log10(t**k * (1-t)**(n-k) / 0.5**n)
fit = minimize_scalar(lambda t: -lod(t), bounds=(1e-6, 0.4999), method="bounded")
print(round(fit.x, 4), round(-fit.fun, 6))               # 0.1875 2.926375
```

theta-hat = 6/32 = **0.1875** — the MLE of a binomial proportion is just *k*/*n*.

Z_max = -4.361992 - 2.344592 + 9.632960 = **2.926**

The three terms are log10(theta^6), log10((1-theta)^26) and -log10(0.5^32). The likelihood ratio is
10^Z = **844**.

| theta | Z | LR |
|---|---|---|
| 0.05 | +1.248 | 17.7 |
| 0.10 | +2.443 | 277.5 |
| **0.1875** | **+2.926** | **844.1** |
| 0.25 | +2.772 | 591.8 |
| 0.30 | +2.468 | 293.9 |
| 0.40 | +1.477 | 30.0 |

Note how flat the curve is. The 1-LOD support interval — the range of theta within one log unit of
the peak — runs from **0.072 to 0.360**. Thirty-two meioses locate this locus to "somewhere on this
chromosome arm".

**(b)** **No, not by the conventional standard, and the reason is Bayesian.**

Z_max = 2.93 falls short of Morton's threshold of 3.0. Work out why that threshold sits there:

Two loci drawn at random from the genome are linked closely enough to detect with prior odds of
about 1:50. So

posterior odds = prior odds x likelihood ratio = (1/50) x 844 = **16.88 : 1**

P(linkage) = 16.88 / 17.88 = **0.944**

At LOD exactly 3.0 the likelihood ratio is 1,000, giving posterior odds (1/50) x 1000 = 20:1 and
P = 20/21 = **0.952** — the familiar 95%. **The LOD threshold of 3 is a Bayesian calculation done
once, in the 1950s, and then hard-coded.**

**(c)** Combined Z = 2.926 + 0.900 = **3.826**, so LR = 10^3.826 = **6,705**, posterior odds
(1/50) x 6705 = 134:1, and P(linkage) = **0.993**. Now it is linkage.

You may add them because **log-likelihoods from independent datasets add** — the joint likelihood of
two independent families is the product of their likelihoods, and log turns products into sums
([S6 §2](../part-S-statistics/S6-likelihood-and-bayes.md)). This is a structural property, not a
convenience: it is exactly what allowed twentieth-century laboratories to publish LOD tables as a
function of theta that other laboratories could sum with their own, accumulating evidence across
groups that never shared a sample.

It also means the *order* of the evidence is irrelevant, which is the same fact as problem 1(c):
multiplying likelihood ratios commutes.

**(d)** 2 ln(LR) = 2 x ln(10) x Z = 2 x 2.302585 x 3.826 = **17.62**.

Referred to a chi-square with 1 df that gives p = 2.7 x 10^-5. But that is wrong, twice.

**First: the null sits on the boundary of the parameter space.** theta lives in [0, 0.5] and the null
is theta = 0.5, an endpoint, not an interior point. Wilks' theorem assumes the null is interior; on a
boundary the correct reference is a 50:50 mixture of a point mass at zero and chi-square on 1 df, so
you **halve the p-value** ([S6 §4](../part-S-statistics/S6-likelihood-and-bayes.md), which gives the
rule for variance components — the structure here is identical). Corrected: p = **1.35 x 10^-5**.

**Second, and more fundamentally: a LOD threshold was never a p-value threshold.** A LOD of 3 is a
likelihood ratio of 1,000, chosen to drag a 1-in-50 prior up to about 95% posterior. If you insist on
reading it as a tail probability, the realised false-positive rate of a LOD-3 declaration is nearer
5% than 0.1% — which is what "posterior odds 20:1" says. The two frameworks are answering different
questions and the numbers are not interchangeable.

**The general point about likelihoods.** An absolute likelihood is meaningless — *L*(theta) has no
units and can be multiplied by any positive constant without changing an inference. Only **ratios**
mean anything, which is why every quantity in this problem is a ratio: LOD scores, likelihood ratios,
Bayes factors, and 2 ln LR are the same object in four costumes. And a likelihood ratio only compares
the models you wrote down: this calculation says the data favour linkage at theta = 0.1875 over free
assortment. It says nothing about whether your pedigree phasing, penetrance model, or marker
genotypes are right.

</details>

---

## 8. Three ways a genome-wide scan lies to you ★★

**Part I — how many tests did you really run?**

[S7 §2](../part-S-statistics/S7-high-dimensional-data.md) applies the Li-Ji estimator to 1,146 SNPs
with MAF >= 5% in a single 1 Mb window of chr22, in 503 samples from each of three
super-populations, holding sample size and marker set identical so that only linkage disequilibrium
differs:

| Population | *M*_eff |
|---|---|
| EUR | 160.0 |
| EAS | 172.0 |
| AFR | 235.0 |

**(a)** Give the Bonferroni threshold implied by each, and by the naive count of 1,146 markers.
Explain the direction of the difference between populations. If the European-ancestry genome-wide
*M*_eff is 10^6, giving the familiar 5 x 10^-8, what is the corresponding African-ancestry threshold,
and is a fixed 5 x 10^-8 conservative or anti-conservative there?

**Part II — two corrections, one set of p-values.**

A differential-expression experiment tests **m = 4,000** genes. The ten smallest p-values are:

| Rank | p |
|---|---|
| 1 | 2.0 x 10^-7 |
| 2 | 6.0 x 10^-6 |
| 3 | 1.1 x 10^-5 |
| 4 | 3.0 x 10^-5 |
| 5 | 5.5 x 10^-5 |
| 6 | 7.9 x 10^-5 |
| 7 | 8.0 x 10^-5 |
| 8 | 3.0 x 10^-4 |
| 9 | 9.0 x 10^-4 |
| 10 | 2.0 x 10^-3 |

**(b)** How many genes does Bonferroni declare significant at alpha = 0.05? How many does
Benjamini-Hochberg at q = 0.05? Compute the BH-adjusted values for all ten. There is a trap at rank
6 — find it and say why the procedure behaves that way. What does the FDR guarantee actually promise
about the resulting list?

**Part III — reading the diagnostics.**

**(c)** In the [lab-08](../labs/lab-08-gwas.md) scan the median p-value across all SNPs is 0.0041
without ancestry covariates and 0.4711 with ten genotype principal components. Compute lambda_GC in
each case and say what each verdict is.
**(d)** Two GWAS of the same trait, each in 400,000 people, both report **lambda_GC = 1.36** and
mean chi-square = 1.52. Study X reports an LD-score-regression intercept of 1.02; study Y reports
1.22. What do you conclude about each, and what does this pair of studies prove about lambda?

<details><summary>Solution</summary>

**(a)** Bonferroni is alpha divided by the number of **effectively independent** tests:

| Basis | Threshold |
|---|---|
| naive, *M* = 1,146 | 0.05/1146 = 4.36 x 10^-5 |
| EUR, *M*_eff = 160.0 | 0.05/160.0 = **3.13 x 10^-4** |
| EAS, *M*_eff = 172.0 | 0.05/172.0 = **2.91 x 10^-4** |
| AFR, *M*_eff = 235.0 | 0.05/235.0 = **2.13 x 10^-4** |

The naive count is **7.2 times stricter** than the correct European-ancestry threshold, because
Bonferroni charges for two tests where two SNPs in tight LD are really one question. Bonferroni is
never *invalid* under dependence — Boole's inequality holds regardless — it is merely conservative,
and *M*_eff is what recovers the lost power.

**The African-ancestry sample needs a stricter threshold**, by a factor of 235/160 = **1.47**. That
direction surprises people, so state the mechanism: African populations have **shorter haplotype
blocks and therefore less redundancy**, so the same 1,146 genotyped markers carry more independent
information — more real questions asked, more chances for noise to clear the bar.

Scaling the genome-wide number: if European-ancestry *M*_eff is 10^6, giving 0.05/10^6 =
5 x 10^-8, then African-ancestry *M*_eff is about 1.47 x 10^6 and the correct threshold is
0.05/(1.47 x 10^6) = **3.4 x 10^-8**.

So a fixed 5 x 10^-8 is **anti-conservative precisely for African-ancestry studies** — the very
studies the field most needs to get right. Two corollaries worth carrying: denser arrays and
imputation do **not** move the threshold (they add redundancy, not questions — the threshold prices
the genome, not your file), and testing only 40 candidate SNPs does not earn you a laxer threshold
merely by shortening the denominator.

**(b)** **Bonferroni:** threshold 0.05/4000 = 1.25 x 10^-5. Ranks 1, 2 and 3 clear it (rank 3 at
1.1 x 10^-5 just does; rank 4 at 3.0 x 10^-5 does not). **3 genes.**

**Benjamini-Hochberg:** find the largest *k* with p_(k) <= *k q*/*m*, then reject everything up to it.

| Rank *k* | p | BH critical value *kq*/*m* | passes? | p·*m*/*k* | adjusted (q-value) |
|---|---|---|---|---|---|
| 1 | 2.0e-7 | 1.25e-5 | yes | 0.000800 | **0.000800** |
| 2 | 6.0e-6 | 2.50e-5 | yes | 0.012000 | **0.012000** |
| 3 | 1.1e-5 | 3.75e-5 | yes | 0.014667 | **0.014667** |
| 4 | 3.0e-5 | 5.00e-5 | yes | 0.030000 | **0.030000** |
| 5 | 5.5e-5 | 6.25e-5 | yes | 0.044000 | **0.044000** |
| 6 | 7.9e-5 | 7.50e-5 | **no** | 0.052667 | **0.045714** |
| 7 | 8.0e-5 | 8.75e-5 | yes | 0.045714 | **0.045714** |
| 8 | 3.0e-4 | 1.00e-4 | no | 0.150000 | 0.150000 |
| 9 | 9.0e-4 | 1.125e-4 | no | 0.400000 | 0.400000 |
| 10 | 2.0e-3 | 1.25e-4 | no | 0.800000 | 0.800000 |

**The trap is rank 6.** Its own p-value of 7.9 x 10^-5 *fails* its critical value of 7.50 x 10^-5,
and its raw ratio p·*m*/*k* = 0.0527 is above 0.05. It is declared significant anyway.

The reason is that BH is a **step-up** procedure: you look for the *largest* *k* that passes — here
*k* = 7 — and reject ranks 1 through *k* inclusive. Rank 6 is carried along by rank 7. Equivalently,
the adjusted p-values are computed as a **running minimum from the largest rank downward**, which
enforces monotonicity and pulls rank 6's 0.0527 down to rank 7's 0.0457. Stopping at the first
failure would have given 5 genes and would be wrong.

```python
import numpy as np
def bh(p, q=0.05):
    o = np.argsort(p); ps = p[o]; m = len(p)
    k = np.where(ps <= q * np.arange(1, m+1) / m)[0]
    cut = ps[k.max()] if len(k) else 0.0
    padj = np.minimum.accumulate((ps * m / np.arange(1, m+1))[::-1])[::-1]
    out = np.empty(m); out[o] = np.minimum(padj, 1.0)
    return p <= cut, out
```

Note that the running minimum in `bh` operates on the *whole* vector of 4,000 p-values; the ten shown
here are the smallest, so no gene further down can pull these adjusted values lower.

**Bonferroni 3, BH 7**, on identical data. They are not competing estimates of the same number —
they control different things:

- **Bonferroni / FWER** controls P(at least one false positive anywhere in the experiment) <= 0.05.
  One wrong finding in twenty *studies*.
- **BH / FDR** controls E[fraction of your rejections that are false] <= 0.05. One wrong finding in
  twenty *discoveries*.

So the guarantee on the BH list of 7 is: **on average at most 0.05 x 7 = 0.35 of them are false**.
It is not a promise that each gene is 95% likely to be real. The error is not spread evenly — the
genes near the threshold (ranks 6 and 7, at q = 0.046) are far more likely to be null than rank 1 at
q = 0.0008. **FDR controls a proportion, not a probability**, and a single gene picked out of an
FDR-controlled list carries no individual guarantee at all. Treat the list as a ranking.

Which to use follows from what the list is for. A GWAS hit or a clinical variant call is expensive
to get wrong: control FWER. A screening list you will follow up in the lab is meant to be enriched,
not pure: control FDR.

**(c)** Convert the median p-value to a chi-square statistic on 1 df and compare it with the median
that a true null would give, 0.4549:

```python
from scipy import stats
for medp in (0.0041, 0.4711):
    print(medp, stats.chi2.isf(medp, 1) / stats.chi2.ppf(0.5, 1))
```

- **No covariates:** median chi-square = 8.239, lambda_GC = 8.239/0.4549 = **18.11**
- **Ten PCs:** median chi-square = 0.519, lambda_GC = **1.14**

([S7](../part-S-statistics/S7-high-dimensional-data.md) reports 18.068 and 1.142 from the full
statistic vector; the small gap is rounding of the median p-value to two significant figures.)

**Verdicts.** lambda = 18.1 means the QQ plot leaves the diagonal **at the median** — half of all
tests are inflated, not just the tail. That is model failure, and here you can say so without
hedging, because the lab-08 phenotype was assigned by a coin flip whose bias depends only on ancestry
and no genotype was consulted: there is no polygenic signal available to inflate anything. After ten
principal components, lambda = 1.14 and the smallest p-value in the scan is unremarkable among 3,361
tests, with 170 SNPs below p = 0.05 against 168 expected. Nothing is associated with anything, which
is the correct answer.

The step people skip: **read the diagnostics before the hits.** In step 2 of that scan, Bonferroni
keeps 1,138 variants and BH at 5% keeps 2,130 — three-fifths of the chromosome — and every one is
false. Both procedures assumed the p-values were valid under the null, and they were not.
**Multiple-testing correction controls noise; it cannot repair a wrong model.**

**(d)** attenuation ratio = (intercept - 1)/(mean chi-square - 1):

- **Study X:** (1.02 - 1)/(1.52 - 1) = 0.02/0.52 = **0.038**
- **Study Y:** (1.22 - 1)/(1.52 - 1) = 0.22/0.52 = **0.423**

**Study X is clean.** About 4% of its inflation is not attributable to polygenic signal, comfortably
below the 0.1-0.2 band usually treated as the acceptable ceiling. lambda = 1.36 at *N* = 400,000 for
a polygenic trait is what a *correct* analysis looks like: if tens of thousands of variants have
small true effects, most of the genome carries a little signal, the median chi-square is above the
null, and the contribution grows with *N*. Applying genomic control here — dividing every statistic
by 1.36 — would delete real loci near the threshold.

**Study Y is not.** 42% of the inflation does not track LD, which is the signature of something that
inflates every statistic equally regardless of how much it tags: residual population structure,
batch effects, or — very commonly in meta-analysis — sample overlap between contributing cohorts.
Fix the model before reading any hit.

**What this pair proves.** The two studies have **identical lambda and identical mean chi-square**
and opposite verdicts. **lambda cannot distinguish confounding from real polygenicity**, and
reporting it alone says almost nothing. The separation comes from LD-score regression: confounding
inflates every variant's statistic equally, whereas polygenic signal inflates a variant in
proportion to how much LD it tags, so the regression **slope** estimates heritability and the
**intercept** estimates the inflation that does not track LD.

**And the habit that runs through all three parts.** In one dimension a striking result is usually a
result; in a million dimensions the strikingness is manufactured by the search itself. The smallest
of a million p-values is small by construction. The default assumption must be that a striking
pattern is an artefact until shown otherwise — by a null distribution you constructed, by a
threshold priced for your sample's LD, by a clean median, by an effect size discounted for winner's
curse, and finally by replication in data you had not seen. The p-value is the last and least of
those checks.

</details>

---

## Where you went wrong

| Error pattern | What to re-read |
|---|---|
| Used a 1/2 carrier prior for the sibling of an affected child | Problem 1(d) — "unaffected" already deleted a quarter of the sample space |
| Read a negative test as taking the risk to zero | Problem 1 — the residual risk is set by *sensitivity*, and a 90% panel leaves a tenth of carriers undetected |
| Substituted P(positive \| affected) for P(affected \| positive) | Problem 2(b) — off by a factor of 76 at 1 in 15,000 |
| Tried to fix a screening test by improving its sensitivity | Problem 2(c) — PPV ~ prevalence x sens / FPR; specificity is the only lever that moves |
| Quoted PPV without naming the population it was measured in | Problem 2(d) — 1.3% versus 33% from the identical assay |
| Assumed counts are Poisson because they are counts | Problem 3(a), 3(d) — variance = mean is a property of *Poisson*, and biological replicates and real coverage both break it |
| Assumed crossovers are Poisson along a chromosome | Problem 3(a) item 6 — interference makes them *under*dispersed, which is the Haldane/Kosambi difference |
| Budgeted sequencing depth from the Poisson tail | Problem 3(d) — 15x leaves 60,000 uncalled bases, not 4,000 |
| Used sqrt(*p*(1-*p*)/2*n*) on a sample with a heterozygote deficit | Problem 4(c) — the variance is inflated by (1 + *F*) |
| Read a narrow confidence interval as evidence the estimate is right | Problem 4(d) — coverage of the truth fell to zero as *n* grew, because the error was bias |
| Used df = 2 for a Hardy-Weinberg chi-square | Problem 5(a) — one df is spent estimating *p* from the same counts; the error is conservative, which is worse |
| Concluded "in Hardy-Weinberg equilibrium" from a non-significant test | Problem 5(c) — 22% power against the departure actually estimated |
| Added standard deviations, or summed per-locus variances across SNPs in LD | Problem 6(a), 6(b) — the cross term is 71% of a real 200-SNP score |
| Assumed adjusting for a confounder can only shrink a coefficient | Problem 6(c) — the adjustment moves it by gamma·delta, and here it flips the sign |
| Adjusted for a covariate without asking whether it is upstream or downstream | Problem 6(d) — confounder before, mediator/collider after |
| Read LOD 3 as p = 0.001 | Problem 7(d) — it is a likelihood ratio of 1,000 chosen to overcome 1:50 prior odds, and the null is on a boundary |
| Applied a borrowed 5 x 10^-8 to a non-European cohort | Problem 8(a) — shorter haplotypes mean more independent tests, so the correct threshold is stricter |
| Stopped BH at the first p-value that fails its critical value | Problem 8(b) — it is a step-up procedure; rank 6 is rejected because rank 7 passes |
| Read "FDR 5%" as "each gene is 95% likely to be real" | Problem 8(b) — it controls a proportion over the list, and the marginal members are the risky ones |
| Corrected for multiple testing and considered the scan validated | Problem 8(c) — correction controls noise, not a wrong model; 2,130 BH "discoveries", all false |
| Reported lambda_GC alone as evidence of confounding, or of its absence | Problem 8(d) — two studies, identical lambda, opposite verdicts |
