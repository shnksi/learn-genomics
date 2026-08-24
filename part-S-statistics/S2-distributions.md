# S2 — The distributions you'll actually meet

> **Read before:** [Ch 09](../part-02-transmission-genetics/09-mitosis-and-meiosis.md) · **Time:** ~45 min

A couple has four children and three of them have cystic fibrosis. Is that a red flag about the
diagnosis, or an ordinary run of luck? You sequence a bacterial genome to 6× average depth and
0.85% of it has no reads at all — is that expected, or did the library fail? You measure a gene
in three biological replicates of the *same* yeast strain and get 12,528, 8,756 and 9,724 counts
— is that gene noisy, or is your pipeline broken?

None of these is answerable without a **model of how the numbers were generated**. That is what a
probability distribution is: not a curve to memorise, but a claim about a generating process.
Choose the process correctly and the arithmetic is trivial. Choose it wrongly and you will get an
answer that is confident, precise, and off by ninety-five orders of magnitude — as §5 demonstrates
on real data.

There are about six generating processes that produce nearly everything you will meet in
genomics. This chapter is a field guide to them.

All code in this chapter runs from the repository root — the directory holding `README.md` and
`.venv` — with `source .venv/bin/activate`, and addresses data as `labs/data/…`. The three real
datasets it uses are built by [lab-02](../labs/lab-02-alignment.md),
[lab-06](../labs/lab-06-rna-seq.md) and [lab-07](../labs/lab-07-population-genetics.md), and
everything it imports is in [lab-00](../labs/lab-00-setup.md)'s base install.

## What you'll be able to do

- Name the generating process behind a genomic measurement and pick the matching distribution
- Compute family-composition probabilities, and read genotype counts as Binomial(2, *p*)
- Derive Poisson from binomial, and use that derivation to say exactly when Poisson applies —
  and predict uncovered genome fraction from sequencing depth
- State what the central limit theorem does and does not promise, and say why quantitative traits
  are approximately normal
- Explain degrees of freedom as "how many numbers were free to vary", and get the
  Hardy–Weinberg df right
- Recognise **overdispersion** in count data, explain why biology causes it, and say why RNA-seq
  needs the negative binomial rather than Poisson
- Read a waiting time as exponential — the continuous form of the geometric — and use a Beta
  posterior to replace a rare-allele point estimate with an interval

## The core idea

Every distribution in this chapter is the answer to a *counting story*.

| The story | The distribution |
|---|---|
| Flip a biased coin once | **Bernoulli** |
| Flip it *n* times, count heads | **Binomial** |
| Very many flips, each very unlikely, expected count fixed | **Poisson** |
| Add up many small independent contributions | **Normal** |
| Add up squared standardised normals | **Chi-square** |
| Poisson counting, but the rate itself varies between samples | **Negative binomial** |
| Wait for the first success | **Geometric** / **Exponential** |
| A probability that is itself uncertain | **Beta** |

Learn the stories, not the formulas. When you meet a new measurement, ask which story generated
it. If none of them did, the distribution you are about to assume is wrong, and that is worth
knowing before you compute a p-value from it.

Two numbers summarise any of them: the **mean** (where it sits) and the **variance** (how far it
spreads). The single most useful diagnostic in genomics is the ratio of the two — the
**variance-to-mean ratio**, or VMR. Poisson has VMR exactly 1. Nearly all real count data has VMR
above 1, and §5 is about what to do when it does.

All code below assumes:

```python
import numpy as np, pandas as pd
from scipy import stats
```

---

## 1. Bernoulli and binomial: *n* independent tries, count the successes

A **Bernoulli** trial has two outcomes with probability *p* and 1 − *p*. Mean *p*, variance
*p*(1 − *p*) — maximised at *p* = 0.5, and zero at *p* = 0 or 1, which is the formal statement
that a certain event carries no information.

Do *n* of them **independently, with the same *p***, and count successes: that is
**Binomial(*n*, *p*)**.

```
P(X = k) = C(n,k) · p^k · (1−p)^(n−k)        mean = np      variance = np(1−p)
```

The binomial coefficient C(*n*,*k*) counts the orderings, and forgetting it is the single most
common error in pedigree arithmetic. Both assumptions are load-bearing: **independent** and
**identical *p***. Nearly every failure of the binomial in genomics is one of those two breaking.

### 1.1 Family composition

Two carrier parents, *Aa* × *Aa*. Each child independently has probability ¼ of being *aa*
([Ch 10](../part-02-transmission-genetics/10-mendelian-inheritance.md)). Four children:

```python
for k in range(5):
    print(f"exactly {k} affected: {stats.binom.pmf(k, 4, 0.25):.4f}")
print("at least one:", round(stats.binom.sf(0, 4, 0.25), 4))
```

```
exactly 0 affected: 0.3164
exactly 1 affected: 0.4219
exactly 2 affected: 0.2109
exactly 3 affected: 0.0469
exactly 4 affected: 0.0039
at least one: 0.6836
```

Those are 81/256, 108/256, 54/256, 12/256, 1/256 — the fourth row of the expansion of
(¾ + ¼)⁴. Three affected out of four has probability 0.047: uncommon, not remarkable. You would
see it in about one in twenty-one such families.

> Note the difference between **0.10547** — first three unaffected, then one affected, *in that
> order* — and **0.42188**, exactly one affected in any order. The ratio is C(4,1) = 4. Pedigree
> questions almost always want the second, and the phrasing rarely says so.

Mean 4 × 0.25 = **1** affected child, variance 4 × 0.25 × 0.75 = 0.75, sd 0.87. A family of four
carrying a ¼ risk expects one affected child and routinely has none — an intuition worth having
before counselling anyone about [pedigrees](../part-02-transmission-genetics/15-pedigrees.md).

### 1.2 A genotype *is* a binomial draw

Here is the reframing that makes [Hardy–Weinberg](../part-05-population-genetics/26-hardy-weinberg.md)
obvious. Under random mating, an individual's genotype is two independent draws from the gamete
pool. Count ALT alleles: **the genotype dosage 0/1/2 is Binomial(2, *p*)**, and *p*², 2*pq*, *q*²
is nothing but that binomial's pmf.

Real data — the 503 European-ancestry samples in the 1000 Genomes chr22 subset:

```python
raw  = pd.read_csv("labs/data/chr22_qc.raw", sep="\t")   # plink2 --pfile labs/data/chr22_qc --export A --out labs/data/chr22_qc
raw  = raw[raw.IID.isin(open("labs/data/EUR.ids").read().split())]   # 2504 -> 503 EUR
G    = raw.iloc[:, 6:].to_numpy(float)         # 503 samples x 3564 SNPs, dosage 0/1/2
p    = G.mean(0) / 2
i    = np.argmin(np.abs(p - 0.5))              # the SNP closest to p = 0.5
g, n = G[:, i], G.shape[0]

obs = np.array([(g == k).sum() for k in (0, 1, 2)])
exp = n * stats.binom.pmf([0, 1, 2], 2, p[i])
print("observed:", obs, " Binomial(2,p):", exp.round(1))
```

```
SNP chr22:20682316 G>A  p_ALT = 0.5000
observed: [123 257 123]  Binomial(2,p): [125.8 251.5 125.8]
```

Two independent Bernoulli draws per person, 503 people, and the genotype counts land within three
individuals of the prediction. Everything Hardy–Weinberg says is contained in that one line of
`stats.binom.pmf`.

### 1.3 ALT reads at a heterozygous site

At a het site, each read independently samples one of the two chromosomes, so the ALT read count
is Binomial(depth, 0.5). This is the model every variant caller uses
([Ch 46](../part-10-functional-genomics/46-variant-calling.md)). It has sharp consequences at low
depth:

```python
for d in (5, 10, 20, 30):
    print(f"{d:2d}x  P(<=2 ALT reads) = {stats.binom.cdf(2, d, 0.5):.4f}"
          f"   P(0 ALT) = {stats.binom.pmf(0, d, 0.5):.5f}")
```

```
 5x  P(<=2 ALT reads) = 0.5000   P(0 ALT) = 0.03125
10x  P(<=2 ALT reads) = 0.0547   P(0 ALT) = 0.00098
20x  P(<=2 ALT reads) = 0.0002   P(0 ALT) = 0.00000
30x  P(<=2 ALT reads) = 0.0000   P(0 ALT) = 0.00000
```

At 5× depth, **3.1% of true heterozygotes have zero ALT reads** and are called homozygous
reference with no ambiguity whatsoever in the data. That number, not the sequencer's error rate,
is why low-coverage genotyping needs imputation. And to *test* a candidate site for allelic
imbalance you want the exact binomial test, not a normal approximation:

```python
r = stats.binomtest(9, 30, 0.5)          # 9 ALT reads out of 30
print(round(r.pvalue, 4), np.round(r.proportion_ci(), 3))
```

```
0.0428 [0.147 0.494]
```

**Where the binomial breaks in practice.** Reads carrying the ALT allele mismatch the reference
and align slightly worse, so *p* is a little under 0.5 — **reference bias**. Set *p* = 0.45 and
P(≤2 ALT reads at 10×) rises from 0.055 to **0.0996**. A 5% shift in one parameter nearly doubles
the dropout rate. The failure is not in the binomial; it is in the claim that *p* = 0.5.

## 2. Poisson: rare events in a large window

### The derivation is the specification

Take Binomial(*n*, *p*). Let *n* → ∞ and *p* → 0 with the product λ = *np* **held fixed**. The
binomial coefficient and the powers conspire, and the limit is

```
P(X = k) = e^(−λ) · λ^k / k!          mean = λ      variance = λ
```

Watch it happen, holding λ = 3:

```python
for k in range(4):
    row = [stats.binom.pmf(k, n, 3.0/n) for n in (10, 100, 1000, 100000)]
    print(k, " ".join(f"{v:.6f}" for v in row), f"| {stats.poisson.pmf(k, 3.0):.6f}")
```

```
k    n=10      n=100     n=1000    n=100000  | Poisson(3)
0  0.028248  0.047553  0.049563  0.049785   | 0.049787
1  0.121061  0.147070  0.149137  0.149359   | 0.149361
2  0.233474  0.225153  0.224154  0.224043   | 0.224042
3  0.266828  0.227474  0.224379  0.224045   | 0.224042
```

By *n* = 1,000 the two agree to three decimals. **Poisson is the binomial when there are enormous
numbers of opportunities and each is individually almost impossible** — which is precisely the
structure of a genome. That is why it appears everywhere:

| Genomic quantity | *n* opportunities | *p* per opportunity | λ |
|---|---|---|---|
| Reads starting at a given base | every read in the library | 1/genome size | depth / read length |
| Reads covering a given base | every read | read length / genome | **depth** |
| De novo mutations per genome | 6.2 × 10⁹ bases | ~1.2 × 10⁻⁸ | ~70 |
| Crossovers on a chromosome | every base pair | ~10⁻⁸ per bp | map length in Morgans |
| Reads assigned to a gene | every read | gene's expression share | expected count |

Note the one parameter. **Poisson has no separate variance knob**: variance = mean, VMR = 1. That
rigidity is what makes it so easy to falsify, and §5 is about what happens when it is falsified.

De novo mutations, straight from the pinned rate
([Ch 16](../part-03-genome-instability/16-mutation.md)): λ = 2 × 1.1 × 10⁻⁸ × 3.1 × 10⁹ = **68**
per diploid genome per generation, with sd √68 = 8.3. Much of the variability between siblings is
a sampling property of the Poisson process rather than any difference in their parents' mutational
quality. But not all of it: paternal age adds a genuine second variance component of ~1.3–1.5
extra mutations per year of the father's age, so siblings born five years apart differ by ~7 in
*expected* count — comparable to the Poisson sd of 8.3, and a systematic shift rather than a draw.

### Sequencing coverage: the real thing

Every base of a genome is covered by a Poisson number of reads with λ = depth. This is the
**Lander–Waterman** model, and the piece everyone uses is P(0 reads) = e^(−λ):

```python
genome_bp = 4_629_812                             # E. coli REL606 (not `G` — that is the
                                                  # genotype matrix from §1, still in scope)
for d in (1, 5, 10, 30):
    print(f"{d:3d}x  P(uncovered) = {np.exp(-d):.3e}   bases missed = {genome_bp*np.exp(-d):12,.0f}")
```

```
  1x  P(uncovered) = 3.679e-01   bases missed =    1,703,213
  5x  P(uncovered) = 6.738e-03   bases missed =       31,195
 10x  P(uncovered) = 4.540e-05   bases missed =          210
 30x  P(uncovered) = 9.358e-14   bases missed =            0
```

Coverage improves the gaps *exponentially*: each extra 1× multiplies the uncovered fraction by
1/e. This is the whole argument for why assemblies stopped being coverage-limited long ago
([Ch 43](../part-09-genomics/43-genome-assembly.md)) and why 30× became the human standard.

Now check it against a real alignment — the E. coli BAM from
[lab 02](../labs/lab-02-alignment.md), 199,861 mapped 150 bp reads:

```python
import pysam
bam = pysam.AlignmentFile("labs/data/aln606.bam")
cov = np.sum(bam.count_coverage("NC_012967.1", 0, 4_629_812, quality_threshold=0), axis=0)
print(f"mean {cov.mean():.3f}  variance {cov.var():.3f}  VMR {cov.var()/cov.mean():.3f}")
print(f"observed P(depth=0) {(cov==0).mean():.5f}   Poisson {stats.poisson.pmf(0, cov.mean()):.5f}")
```

```
mean 6.047  variance 9.031  VMR 1.493
observed P(depth=0) 0.00852   Poisson 0.00236
```

Overlay the observed histogram on the Poisson pmf (`#` = observed, `|` = Poisson prediction):

```
depth  observed  Poisson
    0    0.0085   0.0024   #|
    1    0.0280   0.0143   ####|##
    2    0.0622   0.0432   ###########|####
    3    0.0986   0.0871   ######################|##
    4    0.1286   0.1317   ################################ |
    5    0.1406   0.1593   ###################################
    6    0.1350   0.1606   ##################################
    7    0.1166   0.1387   #############################      |
    8    0.0925   0.1049   #######################   |
    9    0.0678   0.0705   ################# |
   10    0.0468   0.0426   ###########|
   11    0.0301   0.0234   ######|#
   12    0.0187   0.0118   ###|#
   13    0.0111   0.0055   #|#
   14    0.0066   0.0024   #|
```

**The shape is right and the spread is wrong.** Both tails are too heavy, the peak too low; VMR is
1.49, not 1. Real coverage is *overdispersed* because λ is not constant across the genome — GC
content, mappability, repeats and library chemistry all modulate it. The consequence is not
cosmetic: Poisson says 0.24% of the genome is uncovered, and 0.85% actually is — a **3.6-fold
underestimate of the gaps.** §5 gives the fix and the Worked example turns it into a sequencing
budget.

> **When a derivation's assumptions fail, the distribution fails in a predictable direction.** The
> Poisson limit needs constant *p* across opportunities. Vary *p* and you get overdispersion
> (VMR > 1). Make events *repel* each other and you get underdispersion (VMR < 1) — which is
> exactly what crossovers do. Interference and the obligate crossover
> ([Ch 09](../part-02-transmission-genetics/09-mitosis-and-meiosis.md)) mean crossovers are more
> evenly spaced than Poisson: a Poisson bivalent with λ = 1 would have no crossover 37% of the
> time, and real bivalents essentially always have one. That is the whole difference between the
> Haldane map function (Poisson, no interference: *r* = 0.316 at 0.5 M) and Kosambi (interference:
> *r* = 0.381) in [Ch 14](../part-02-transmission-genetics/14-linkage-and-mapping.md).

## 3. Normal: sums of many small effects

The **central limit theorem** says: if *X*₁ … *X*ₙ are independent, identically distributed, and
have **finite variance**, then their standardised sum converges in distribution to Normal(0, 1) as
*n* → ∞. Mean μ, variance σ², and — the fact that gets used — the sum of independent normals is
normal, so the sample mean of *n* draws has variance σ²/*n*.

Be precise about what that is and is not a promise:

| The CLT promises | The CLT does not promise |
|---|---|
| The **sum or mean** approaches normal | That your **data** are normal — heights are, individual read counts are not |
| Convergence **in the body** of the distribution | Accuracy in the **far tails**, where it can be badly wrong at any *n* |
| Convergence for **any** finite-variance parent | A useful *n*; heavily skewed parents need far more |
| Nothing at all if variance is infinite | — (heavy-tailed parents never converge to normal) |

The tail caveat is not academic. Standardise the mean of 1,000 draws from a Poisson(0.5) — badly
skewed, but *n* = 1,000. No simulation is needed: the sum of 1,000 independent Poisson(0.5) draws
is *exactly* Poisson(500), so the true tail probabilities are available in closed form.

```python
lam, n = 0.5, 1000
mu, sd = n*lam, np.sqrt(n*lam)                 # sum ~ Poisson(500), sd = sqrt(500) = 22.361
for z in (1.96, 4.0, -4.0):
    thr   = np.floor(mu + z*sd)
    exact = stats.poisson.sf(thr, mu) if z > 0 else stats.poisson.cdf(thr, mu)
    nrm   = stats.norm.sf(abs(z))
    print(f"P(Z {'>' if z > 0 else '<'} {z:5.2f})  exact {exact:.6f}   "
          f"normal {nrm:.6f}   ratio {exact/nrm:.2f}")
```

```
P(Z >  1.96)  exact 0.027084   normal 0.024998   ratio 1.08
P(Z >  4.00)  exact 0.000048   normal 0.000032   ratio 1.53
P(Z < -4.00)  exact 0.000019   normal 0.000032   ratio 0.59
```

The 5% cut-off is nearly right; the 4σ **right tail is 1.5× too heavy** and the left tail 1.7× too
light. Genome-wide testing lives at 5σ and beyond
([Ch 51](../part-11-human-and-statistical-genomics/51-gwas.md)), which is exactly where the
approximation you were taught to trust stops being trustworthy — and why permutation and exact
tests survive in genomics ([S4](./S4-hypothesis-testing.md)).

### Why quantitative traits are normal

[Ch 30](../part-06-quantitative-genetics/30-quantitative-traits.md) opens with "quantitative
genetics is Mendelian genetics plus the central limit theorem". Here it is literally. Take the
real chr22 genotypes, give each SNP a random additive effect, and sum:

```python
X = G[:, np.minimum(p, 1-p) > 0.05]                 # 503 people x 1784 common SNPs
rng = np.random.default_rng(0)
for L in (1, 5, 50, X.shape[1]):
    idx  = rng.choice(X.shape[1], L, replace=False)
    y    = X[:, idx] @ rng.normal(0, 1, L)
    y    = (y - y.mean()) / y.std()
    print(f"L={L:5d}  skew={stats.skew(y):+.3f}  Shapiro p={stats.shapiro(y).pvalue:.3g}")
```

```
L=    1  skew=+0.406  Shapiro p=1.03e-25
L=    5  skew=-0.175  Shapiro p=3.99e-05
L=   50  skew=-0.163  Shapiro p=0.232
L= 1784  skew=-0.011  Shapiro p=0.365
```

One locus gives three discrete genotype classes — emphatically not normal. **By 50 loci the
normality test has nothing left to reject.** Nobody had to assume a normal trait: it fell out of
adding up small independent contributions, which is what a polygenic architecture *is*. The same
argument, run on environmental contributions too, is why the residual is also treated as normal —
and it is the entire justification for the [variance decomposition](./S5-variance-and-regression.md)
that heritability rests on.

Note what this does **not** justify: multiplicative traits. If effects combine by multiplication
rather than addition, the *logarithm* is normal, not the trait. That is why expression levels,
odds ratios and concentrations get log-transformed as a reflex.

## 4. Chi-square: adding up squared standardised normals

If *Z*₁ … *Z*ₖ are independent standard normals, then Σ*Z*ᵢ² has a **chi-square distribution with
*k* degrees of freedom**. Mean *k*, variance 2*k*. That is the entire definition, and every
chi-square test in genetics is an instance of it.

Why does Σ(O − E)²/E follow it? Not quite for the reason usually given. The cell counts are
**multinomial**, not Poisson: with *n* fixed, Var(*O*ᵢ) = *n p*ᵢ(1 − *p*ᵢ) = *E*ᵢ(1 − *E*ᵢ/*n*).
So each term (*O*ᵢ − *E*ᵢ)/√*E*ᵢ is asymptotically normal but has variance 1 − *E*ᵢ/*n*, a little
*under* 1 — for a heterozygote cell at *p* = 0.5, where *E*/*n* = 0.5, its variance is only ½. Nor
are the terms independent: the counts must sum to *n*, so they are negatively correlated,
Cov(*O*ᵢ, *O*ⱼ) = −*n p*ᵢ*p*ⱼ. The two departures cancel exactly. The shortfall in each term's
variance is precisely offset by the negative covariance between cells, and the quadratic form
comes out chi-square anyway — with **cells − 1** df rather than one per cell. That lost degree of
freedom is the fixed total, not an accounting convention.

**Degrees of freedom = how many of those numbers were free to vary.** Start with the number of
cells, subtract one constraint for every quantity you forced the expected counts to match:

| Test | Cells | Constraints | df |
|---|---|---|---|
| Mendelian 3:1, *n* fixed | 2 | total | 1 |
| Mendelian 9:3:3:1, *n* fixed | 4 | total | 3 |
| **Hardy–Weinberg** | 3 | total, **and *p* estimated from these very counts** | **1** |
| HWE with *p* known independently | 3 | total only | 2 |

The Hardy–Weinberg row is the one people get wrong
([Ch 26 §5](../part-05-population-genetics/26-hardy-weinberg.md)). Three genotype classes look
like df = 2, but *p̂* was computed from the same genotypes, so once you fix the total and the
allele frequency **only one cell is still free**. Using df = 2 makes the test conservative — you
will miss real genotyping failures.

Settle it empirically. Compute the HWE statistic at all 1,784 common chr22 SNPs in the EUR samples
and look at where the distribution sits:

```python
def hwe_chi2(col, pp):
    o = np.array([(col == k).sum() for k in (0, 1, 2)])
    e = o.sum() * np.array([(1-pp)**2, 2*pp*(1-pp), pp**2])
    return ((o - e)**2 / e).sum()

s = np.array([hwe_chi2(G[:, j], p[j]) for j in np.where(np.minimum(p,1-p) > 0.05)[0]])
print("SNPs:", s.size, " mean statistic:", round(s.mean(), 3))
print("frac p<0.05 using df=1:", round((s > stats.chi2.ppf(.95, 1)).mean(), 4),
      "  using df=2:",           round((s > stats.chi2.ppf(.95, 2)).mean(), 4))
```

```
SNPs: 1784  mean statistic: 1.077
frac p<0.05 using df=1: 0.0807   using df=2: 0.0291
```

A chi-square with 1 df has mean 1; with 2 df, mean 2. **The observed mean is 1.077.** The question
is not close. And the calibration confirms it: df = 1 gives 8.1% of SNPs below p = 0.05 — a little
above nominal, as expected from residual structure and genotyping error inside a super-population —
while df = 2 gives 2.9%, visibly conservative.

Related distributions you will meet, all built from the same normals: **Student's *t*** (a normal
divided by an independently estimated sd — heavier tails than normal, converging to it as df
grows), and the ***F*** (a ratio of two chi-squares over their df, the workhorse of ANOVA and
variance-component estimation in [S5](./S5-variance-and-regression.md)).

## 5. Negative binomial: when the rate itself varies

This is the distribution that RNA-seq forced on genomics, and the reason is biological, not
mathematical.

Sequencing a library is Poisson sampling: given a gene's true fraction of the transcript pool,
the read count is Poisson. So counts across **technical** replicates — the same library, sequenced
twice — really are Poisson. But **biological** replicates are different cultures, different mice,
different patients. Each has its own true expression level. The rate λ is not a constant, it is a
random variable.

Let λ vary between replicates with mean μ and variance α μ² (i.e. a constant coefficient of
variation √α), and count Poisson-with-rate-λ. The law of total variance gives

```
Var(X) = E[Var(X|λ)] + Var(E[X|λ]) = μ + αμ²
          └ Poisson noise ┘   └ biological variation ┘
```

Make λ specifically **gamma**-distributed and the marginal count distribution is exactly the
**negative binomial**, with

```
mean = μ        variance = μ + α μ²        α = dispersion
```

That second term is the whole story. Poisson noise scales with μ; biological variation scales with
μ². **At low counts Poisson noise dominates and the negative binomial looks Poisson; at high counts
biological variation dominates and it does not.** So the fingerprint of overdispersion is not a
constant inflation — it is a VMR that grows with expression.

### The fingerprint, in real yeast RNA-seq

Three wild-type biological replicates from [lab 06](../labs/lab-06-rna-seq.md), size-factor
normalised the way DESeq2 does it, binned by mean expression:

```python
cnt  = pd.read_csv("labs/data/yeast_counts.tsv", sep="\t", index_col=0)
wt   = cnt[["wt_rep1", "wt_rep2", "wt_rep3"]]
lg   = np.log(wt.replace(0, np.nan))
sf   = np.exp(lg.sub(lg.mean(axis=1), axis=0).median(skipna=True))   # median-of-ratios
norm = wt / sf
N    = norm[norm.mean(axis=1) > 5]
m, v = N.mean(axis=1).to_numpy(), N.var(axis=1, ddof=1).to_numpy()
```

```
mean-count range   genes   med. mean   med. variance    VMR   implied alpha
      5 –    20     2357        11.8            10.0    0.85       -0.0127
     20 –    50     1589        29.5            33.2    1.12        0.0042
     50 –   150      825        75.9           151.7    2.00        0.0131
    150 –   500      277       232.9          1100.9    4.73        0.0160
    500 –  2000       74       726.0         11812.1   16.27        0.0210
   2000 –  ∞          11      4266.0        890284.4  208.69        0.0487
```

Read the VMR column downward: **0.85 → 209**. At counts around 10 the data are indistinguishable
from Poisson — the bottom bin's negative α is just estimation noise, since with three replicates
each variance carries 2 degrees of freedom. At counts in the thousands the variance is two hundred
times the mean. From 50 counts upward the dispersion α settles between 0.013 and 0.05 — a
biological coefficient of variation of 11–22%, which for replicate yeast cultures is entirely
reasonable. **α is roughly constant while VMR is not**, which is the sense in which the negative
binomial is the right two-parameter family.

Now the consequence, on one gene. `YGR192C` (*TDH3*, glyceraldehyde-3-phosphate dehydrogenase) is
the most highly expressed gene in the set. Its three wild-type replicates:

```python
row   = norm.loc["YGR192C"]
mu, s2 = row.mean(), row.var(ddof=1)
alpha  = (s2 - mu) / mu**2
n_, p_ = 1/alpha, (1/alpha) / (1/alpha + mu)
print(np.round(row.values).astype(int), f"mean {mu:.0f} variance {s2:.0f}")
print("Poisson P(X >= 12528) =", f"{stats.poisson.sf(12527, mu):.3g}")
print("NegBin  P(X >= 12528) =", f"{stats.nbinom.sf(12527, n_, p_):.3g}")
```

```
[12528  8756  9724]   mean 10336   variance 3836708
Poisson P(X >= 12528) = 7.06e-97
NegBin  P(X >= 12528) = 0.133
```

> **Three replicates of the same yeast strain, and Poisson calls the spread between them a
> 7 × 10⁻⁹⁷ event.** The negative binomial calls it p = 0.13 — ordinary. This is the single most
> important number in this chapter. Fit Poisson to biological replicates and *every* highly
> expressed gene becomes overwhelmingly significant, because you have modelled away the only
> source of variation that matters. The p-values are not slightly optimistic; they are meaningless.

This is why DESeq2 and edgeR exist, and why almost all of their sophistication goes into estimating
**α**, not μ. With three replicates you cannot estimate a per-gene dispersion at all, so both
packages shrink each gene's α toward a fitted mean–dispersion trend — borrowing strength across
genes, an idea [S7](./S7-high-dimensional-data.md) generalises. In scipy, `stats.nbinom(n, p)` uses
the "number of failures before *n* successes" parameterisation, so convert:
**`n = 1/α`, `p = n/(n + μ)`**. Verify with `.mean()` and `.var()` every time; this conversion is a
reliable source of silent bugs.

The same logic applies wherever counts come from heterogeneous units: single-cell UMI counts
([Ch 48](../part-10-functional-genomics/48-single-cell-and-spatial.md)), ChIP-seq and ATAC-seq peak
counts ([Ch 49](../part-10-functional-genomics/49-epigenome-profiling.md)), and — as §2 showed —
sequencing depth along a genome.

## 6. Three more, briefly

**Geometric — how many trials until the first success.** *P*(*X* = *k*) = (1−*p*)^(*k*−1)*p*, mean
1/*p*, variance (1−*p*)/*p*². Discrete waiting time; memoryless (having waited does not change what
comes next). Number of clones you must screen before finding a positive.

**Exponential — the continuous version.** Density λe^(−λx), mean 1/λ, **sd also 1/λ**. It is the
gap between consecutive events of a Poisson process, so wherever §2 gave you a count, this gives
you the spacing: distance to the next crossover along a chromosome, distance to the next mutation,
time to the next coalescent event ([Ch 27](../part-05-population-genetics/27-the-four-forces.md)).
The signature test is sd = mean.

Real check, on the 29,700 variant positions in a 1 Mb window of 1000 Genomes chr22:

```
mean gap 33.7 bp   sd 76.3 bp   (exponential predicts sd = mean)
P(gap > 100) observed 0.0508   exponential 0.0513
P(gap > 500) observed 0.0013   exponential 0.0000
```

Right in the body, badly wrong in the tail — the same lesson as everywhere else in this chapter.
Variants are not thrown down at a uniform rate: conserved exons and mutational cold spots create
long gaps that a single-rate exponential can never produce, which is *why* long gaps are
interesting ([Ch 33](../part-07-molecular-evolution/33-neutral-theory-and-selection-tests.md)).

**Beta — a distribution over a probability.** Support [0, 1], parameters *a*, *b*, mean
*a*/(*a*+*b*). Think of *a* − 1 prior successes and *b* − 1 prior failures. Beta(1,1) is uniform;
Beta(20,20) is tight around 0.5; Beta(1,20) piles up near zero. It is the **conjugate prior** for
the binomial: observe *k* ALT alleles out of *n* and the posterior is simply
Beta(*a* + *k*, *b* + *n* − *k*) ([S6](./S6-likelihood-and-bayes.md)).

```python
post = stats.beta(1 + 3, 1 + 1006 - 3)         # 3 ALT copies among 1006 EUR chromosomes
print(f"mean {post.mean():.5f}  95% interval {post.ppf(.025):.5f}–{post.ppf(.975):.5f}")
```

```
mean 0.00397  95% interval 0.00108–0.00868
```

The point estimate 3/1006 = 0.00298 is a single number pretending to certainty; the interval spans
an eightfold range. That is the honest state of knowledge about a rare allele in 503 people, and
mixing Beta with Binomial gives the **beta-binomial** — the overdispersed binomial, used for
allele-specific expression and for pooled sequencing, on exactly the logic of §5.

## Field guide

| Distribution | Generating story | Parameters | Mean | Variance | scipy |
|---|---|---|---|---|---|
| Bernoulli | one trial | *p* | *p* | *p*(1−*p*) | `stats.bernoulli(p)` |
| Binomial | *n* independent trials, same *p* | *n*, *p* | *np* | *np*(1−*p*) | `stats.binom(n, p)` |
| Poisson | *n* → ∞, *p* → 0, *np* fixed | λ | λ | λ | `stats.poisson(mu)` |
| Normal | sum of many small effects | μ, σ | μ | σ² | `stats.norm(loc, scale)` |
| Chi-square | sum of *k* squared std normals | *k* | *k* | 2*k* | `stats.chi2(df)` |
| Negative binomial | Poisson with a gamma-varying rate | μ, α | μ | μ + αμ² | `stats.nbinom(1/a, ...)` |
| Geometric | trials until first success | *p* | 1/*p* | (1−*p*)/*p*² | `stats.geom(p)` |
| Exponential | waiting time in a Poisson process | λ | 1/λ | 1/λ² | `stats.expon(scale=1/lam)` |
| Beta | uncertainty about a probability | *a*, *b* | *a*/(*a*+*b*) | — | `stats.beta(a, b)` |

Every frozen distribution above exposes the same interface — `.pmf`/`.pdf`, `.cdf`, `.sf` (the
upper tail, and **always** use it instead of `1 - cdf` for small p-values), `.ppf` (quantiles),
`.rvs` (simulate), `.mean()`, `.var()`. Learning one teaches you all of them. To check any claim in
this chapter, simulate and overlay:

```python
import matplotlib.pyplot as plt
d = stats.nbinom(20, 20/120)                       # mu = 100, alpha = 0.05
x = d.rvs(200_000, random_state=0)
grid = np.arange(0, 300)
plt.hist(x, bins=np.arange(-.5, 300), density=True, color="0.8")
plt.plot(grid, d.pmf(grid), color="C3")
print(f"theory mean {d.mean():.1f} var {d.var():.1f} | sample {x.mean():.1f} {x.var():.1f}")
```

```
theory mean 100.0 var 600.0 | sample 100.0 var 599.4
```

## Common misconceptions

| What people think | What's actually true |
|---|---|
| Data are normal if you collect enough of it | The CLT is about the **sum or mean**, not the data. A million read counts are still not normal; their mean is |
| Poisson is a good model for read counts | It is exactly right for **technical** replicates and badly wrong for **biological** ones. The whole reason DESeq2 exists |
| Overdispersion inflates the variance by a constant | It scales as μ², so it is invisible at low counts and dominant at high ones. That growing VMR is the diagnostic |
| Three genotype classes means df = 2 | df = 1 when *p* was estimated from the same counts. Every estimated parameter costs a degree of freedom |
| The normal approximation is fine at *n* = 1,000 | Fine at p = 0.05; the 4σ right tail is 1.5× too heavy in the exact calculation above. Genome-wide thresholds live in the region where it fails |
| A binomial needs only "two outcomes" | It needs **independent** trials with **identical *p***. Reference bias breaks the second; linked reads and PCR duplicates break the first |
| The exponential and geometric are different ideas | Same story, continuous vs discrete time. Both memoryless, both the waiting time in a Poisson process |
| Crossovers are Poisson along a chromosome | They are **under**dispersed — interference and the obligate crossover space them out. That is the Haldane/Kosambi difference |
| A rare allele seen 3 times in 1,006 has frequency 0.003 | That is a point estimate with a 95% interval of 0.001–0.009. The Beta posterior says so out loud |
| Variance = mean is a property of counts | It is a property of **Poisson**. Real counts almost always have variance > mean |

## Worked example: how deep should I sequence?

**The question.** You are sequencing a 4.6 Mb bacterial genome and need at least 5× at every base
to call variants confidently. What average depth do you buy?

**Step 1 — name the process.** Reads land at effectively random positions; each base has a huge
number of chances to be covered, each individually tiny. That is the Poisson limit of §2, with
λ = average depth.

**Step 2 — the textbook answer.**

```python
for d in (10, 15, 20, 30):
    print(f"{d:2d}x  Poisson P(depth < 5) = {stats.poisson.cdf(4, d):.6f}")
```

```
10x  Poisson P(depth < 5) = 0.029253
15x  Poisson P(depth < 5) = 0.000857
20x  Poisson P(depth < 5) = 0.000017
```

15× leaves 0.09% of the genome under-covered; 20× leaves 0.002%. Buy 15×.

**Step 3 — check the model against real data before spending money.** The E. coli alignment from
§2 has mean depth 6.05 and variance 9.03. Poisson requires them to be equal. Compare the observed
tail with the prediction:

```
threshold   observed frac    Poisson(6.05)     ratio
depth < 1        0.00852         0.00236        3.60
depth < 2        0.03654         0.01666        2.19
depth < 5        0.32592         0.27878        1.17
```

The model is systematically optimistic, and it gets worse the further into the tail you go — which
is where the decision is being made. **Poisson is not merely imprecise here; it is biased in the
direction that costs you.**

**Step 4 — refit with the observed overdispersion.** Fit a negative binomial to the real coverage:
α = (variance − mean)/mean² = (9.031 − 6.047)/6.047² = **0.0816**. Redo the calculation:

```python
alpha = 0.08159
for d in (15, 20, 30, 50):
    n_ = 1/alpha; p_ = n_/(n_ + d)
    print(f"{d:2d}x  Poisson {stats.poisson.cdf(4, d):.6f}   NegBin {stats.nbinom.cdf(4, n_, p_):.6f}")
```

```
15x  Poisson 0.000857   NegBin 0.012905
20x  Poisson 0.000017   NegBin 0.002470
30x  Poisson 0.000000   NegBin 0.000145
50x  Poisson 0.000000   NegBin 0.000002
```

**Step 5 — answer, with the reason.** At 15× the honest estimate of under-covered genome is 1.3%,
not 0.09% — **fifteen times worse than the Poisson answer**, and at 4.6 Mb that is roughly 60,000
bases you cannot call. The negative binomial does not cross 0.1% until **23×**, where Poisson
claimed 15× (0.086%) already cleared that bar. Buy 30× and keep the margin.

**Step 6 — what actually happened.** The 30× convention in genomics is not superstition and it is
not the Lander–Waterman calculation, which would have settled on half that. It is the
Lander–Waterman calculation *corrected for the fact that λ is not constant along a genome*. Every
step of the reasoning is a distribution choice: Poisson because reads are rare events in a large
window, negative binomial because the rate varies, and the variance-to-mean ratio of the real data
as the arbiter between them. That is the whole method of this chapter.

## Where this is used

- **Binomial** — segregation ratios and family composition
  ([Ch 10](../part-02-transmission-genetics/10-mendelian-inheritance.md),
  [Ch 12](../part-02-transmission-genetics/12-probability-and-testing.md),
  [Ch 15](../part-02-transmission-genetics/15-pedigrees.md)); genotype frequencies
  ([Ch 26](../part-05-population-genetics/26-hardy-weinberg.md)); allele counts and drift
  ([Ch 27](../part-05-population-genetics/27-the-four-forces.md)); allelic balance in variant
  calling ([Ch 46](../part-10-functional-genomics/46-variant-calling.md))
- **Poisson** — coverage and assembly ([Ch 40](../part-09-genomics/40-sequencing-technologies.md),
  [Ch 43](../part-09-genomics/43-genome-assembly.md)); mutations per genome
  ([Ch 16](../part-03-genome-instability/16-mutation.md)); substitutions along a lineage
  ([Ch 33](../part-07-molecular-evolution/33-neutral-theory-and-selection-tests.md)); crossovers
  and map functions ([Ch 14](../part-02-transmission-genetics/14-linkage-and-mapping.md))
- **Normal** — quantitative traits ([Ch 30](../part-06-quantitative-genetics/30-quantitative-traits.md)),
  breeder's equation ([Ch 31](../part-06-quantitative-genetics/31-heritability-and-selection.md)),
  liability threshold models, polygenic score distributions
  ([Ch 53](../part-11-human-and-statistical-genomics/53-polygenic-scores.md))
- **Chi-square** — Mendelian goodness-of-fit
  ([Ch 12](../part-02-transmission-genetics/12-probability-and-testing.md)), Hardy–Weinberg QC
  ([Ch 26](../part-05-population-genetics/26-hardy-weinberg.md)), association tests and genomic
  inflation ([Ch 51](../part-11-human-and-statistical-genomics/51-gwas.md)), likelihood-ratio tests
  ([S6](./S6-likelihood-and-bayes.md))
- **Negative binomial** — differential expression
  ([Ch 47](../part-10-functional-genomics/47-rna-seq.md),
  [lab 06](../labs/lab-06-rna-seq.md)), single-cell counts
  ([Ch 48](../part-10-functional-genomics/48-single-cell-and-spatial.md)), peak counts
  ([Ch 49](../part-10-functional-genomics/49-epigenome-profiling.md))
- **Exponential / Beta** — coalescent waiting times
  ([Ch 27](../part-05-population-genetics/27-the-four-forces.md)), branch lengths
  ([Ch 34](../part-07-molecular-evolution/34-phylogenetics.md)), priors on allele frequency and
  genotype ([S6](./S6-likelihood-and-bayes.md))

**Next:** [S3 — Sampling, estimation and error](./S3-sampling-and-estimation.md) turns these
distributions into standard errors and confidence intervals;
[S4](./S4-hypothesis-testing.md) turns them into tests.

## Check yourself

**1. You sequence a human genome to 30× and find 0.9% of bases below 10× depth. Poisson predicts 0.0007%. Has something gone wrong with the run?**

<details><summary>Answer</summary>

Probably not — the Poisson prediction was never right. `stats.poisson.cdf(9, 30)` = 7.1 × 10⁻⁶,
so the observed 0.9% is about **1,300× the Poisson expectation** — a discrepancy far too large to
be a bad run producing a slightly fat tail. Poisson assumes a constant rate along the genome, and
real coverage is overdispersed because GC content, mappability, repeats and library chemistry all
modulate λ. The E. coli data in §2 showed VMR = 1.49 in a small, repeat-poor, uniformly GC
bacterial genome; a human genome is far worse.

Fit the negative binomial instead: from the observed mean and variance, α = (*s*² − *m*)/*m*², and
recompute `stats.nbinom.cdf(9, 1/α, (1/α)/(1/α + 30))`. Compare *that* against 0.9%.

The diagnostic that would indicate a genuine problem is not the raw fraction but the **shape**:
plot depth against GC content and against mappability. A run that failed shows a distinct
low-coverage mode or a strong GC dependence, not a uniformly fatter tail.

</details>

**2. Two unaffected parents already have a child with an autosomal recessive disease. What is the probability that exactly two of their next three children are affected? And that at least one is?**

<details><summary>Answer</summary>

The parents are obligate carriers, so each subsequent child is an independent Bernoulli trial with
*p* = ¼. Independence is the substantive claim: Mendelian segregation has no memory, and the
existing affected child changes the risk for the next child not at all (it changes your knowledge
of the *parents*, which is what made *p* = ¼ instead of the population risk).

Exactly two of three: C(3,2)(¼)²(¾) = 3 × 0.0625 × 0.75 = **0.1406**.

At least one: 1 − (¾)³ = 1 − 0.4219 = **0.5781**.

`stats.binom.pmf(2, 3, 0.25)` and `stats.binom.sf(0, 3, 0.25)`.

</details>

**3. Two genes, A and B. Across three biological replicates A has mean 12 and variance 14; B has mean 3,000 and variance 250,000. Which is behaving unusually?**

<details><summary>Answer</summary>

Neither, and the trap is comparing VMR directly: A's is 1.2 and B's is 83.

Compare **dispersions**, α = (*s*² − *m*)/*m*², which is the parameter that is supposed to be
roughly constant across genes:

- A: (14 − 12)/144 = **0.014**
- B: (250,000 − 3,000)/9,000,000 = **0.027**

Both are ordinary — the same order as the yeast values in §5. VMR grows with the mean *by
construction* under the negative binomial (VMR = 1 + αμ), which is exactly why the mean–variance
plot rises and why you must never flag a gene as noisy on VMR alone. Note also that with three
replicates each α is estimated from 2 degrees of freedom and is very unreliable individually —
which is why DESeq2 shrinks it toward a fitted trend.

</details>

**4. Why does a Hardy–Weinberg test have 1 degree of freedom, but a test of a 1:2:1 ratio in an F2 cross have 2?**

<details><summary>Answer</summary>

Count the constraints you imposed on the expected counts.

**HWE:** three cells. Fix the total (−1). Then estimate *p̂* from these very genotypes and use it to
build the expectations (−1). Two constraints, so **df = 1**. Concretely: given *N* and *p̂*, knowing
the *AA* count determines the other two, because the allele count is already pinned.

**F2 1:2:1:** three cells. Fix the total (−1). The ratio 1:2:1 came from Mendel, not from the data
— **no parameter was estimated**. One constraint, so **df = 2**.

The general rule: df = (cells − 1) − (parameters estimated from the same data). It is the same rule
that gives 3 df for a 9:3:3:1 dihybrid test. And it is not academic: §4's real chr22 statistics had
mean 1.077, matching df = 1 and not df = 2, and using df = 2 would have made a genotyping-error
filter substantially less sensitive.

</details>

**5. A collaborator finds a gene with p = 10⁻⁴⁰ for differential expression, using a Poisson test on three-versus-three replicates. Should you be excited?**

<details><summary>Answer</summary>

No — that p-value is evidence about the model, not about the gene.

The Poisson model asserts variance = mean, so it attributes *all* variation between biological
replicates to sampling noise, leaving no room for biological variability. §5 showed the size of the
error on real data: for `YGR192C`, three replicates of the *same* strain gave Poisson p = 7.1 ×
10⁻⁹⁷ for an observation the negative binomial rates at p = 0.13. A 95-order-of-magnitude
discrepancy, with no differential expression present at all.

Expect this artefact to hit **highly expressed genes hardest**, because the overdispersion term is
αμ² — so the "top hits" list will be sorted almost by expression level rather than by effect. That
is the tell.

The fix is to fit the dispersion: DESeq2 or edgeR, which shrink per-gene α toward a fitted
mean–dispersion trend. Then judge the gene on its **effect size** — the log fold change — and its
padj, not on a p-value produced by a model with the wrong variance function.

</details>
