# S3 — Sampling, estimation and error

> **Read before:** [Ch 12](../part-02-transmission-genetics/12-probability-and-testing.md) · **Time:** ~45 min

[Chapter 26](../part-05-population-genetics/26-hardy-weinberg.md) opens by declaring that the unit
of analysis is now the population and the state variable is a vector of allele frequencies. Then it
writes down *p* and computes with it as though *p* were a known number.

It is not. Nobody has ever measured an allele frequency. What people measure is an allele frequency
**in a sample** — 91 British people, 660 people of African ancestry, whatever the study could
recruit — and then uses that number as if it were the population's. The gap between those two
things is where a large fraction of genomics goes wrong, and it is not a small gap: at a common SNP
in 50 people, the standard error on that frequency is about 0.05, so being 0.10 off is ordinary.

This chapter is about that gap. How large it is, how to report it, how to shrink it, and — the part
that matters most — how to recognise the errors that shrinking the sample size will never touch.

There is a second reason sampling is unusually load-bearing in genetics. **Drift is sampling
error** ([Ch 27](../part-05-population-genetics/27-the-four-forces.md)). The next generation's
allele frequency differs from this one's because the next generation *is* a finite sample of
gametes from this one. The same √n that governs how well you can measure a frequency governs how
fast that frequency wanders. Learn the statistics once and you get the population genetics for
free.

All code in this chapter runs from the repository root — the directory holding `README.md` and
`.venv` — with `source .venv/bin/activate`, and addresses data as `labs/data/…`.

## What you'll be able to do

- Distinguish the statistical population from the sample, and say what a given estimate is an
  estimate *of*
- Judge an estimator by bias, variance and consistency, and explain why unbiasedness is not the goal
- Compute and correctly report a standard error, and never confuse it with a standard deviation
- State what "95% confidence" claims and what it does not, and check an interval's coverage by
  simulation
- Bootstrap a confidence interval for any statistic in four lines, and choose the right
  resampling unit
- Say why more data cures sampling error and never cures bias, and why a MAF filter exists

## The core idea

Imagine the quantity you care about — the allele frequency at *CFTR* in Ireland, the mean
expression of a gene in liver, the *F*<sub>ST</sub> between two populations. It has a definite
value. You cannot see it. You can only see a finite, randomly chosen slice of the world, and
compute something from that slice.

That computed number is an **estimate**. Run the study again with different people and you get a
different estimate. The set of values you would get across all possible repetitions is the
**sampling distribution**, and its spread is the **standard error**. Every honest number in genomics
comes with one.

Two things follow, and they are the whole chapter:

1. **Sampling error is knowable and shrinkable.** It behaves like 1/√n. You can compute it from a
   formula when one exists and simulate it when one does not.
2. **Everything else is not.** A biased assay, a confounded design, an unrepresentative
   recruitment — these do not average out. More data makes them *more* statistically significant
   and no less wrong.

---

Everything below runs on the real 1000 Genomes chr22 data used by
[lab-07](../labs/lab-07-population-genetics.md): 2,503 people, 3,564 QC-passing SNPs on
chr22:20–21 Mb. Set up once:

```bash
cd /path/to/learn-genomics          # the directory holding README.md and .venv
source .venv/bin/activate
export PATH="$HOME/bin:$PATH"
uv pip install statsmodels          # §5's Wilson intervals need it; lab-00 does not install it
plink2 --pfile labs/data/chr22_qc --export A --out labs/data/chr22_qc   # additive 0/1/2 coding, counting REF
```

```python
import numpy as np, pandas as pd
from scipy import stats

raw   = pd.read_csv("labs/data/chr22_qc.raw", sep="\t")
iid   = raw["IID"].to_numpy()
G     = raw.iloc[:, 6:].to_numpy(dtype=np.int8)      # 2503 people x 3564 SNPs, REF dosage 0/1/2
pvar  = pd.read_csv("labs/data/chr22_qc.pvar", sep="\t", comment="#", header=None,
                    names="CHROM POS ID REF ALT FILTER INFO".split())
pos   = pvar["POS"].to_numpy()
panel = pd.read_csv("labs/data/panel.txt", sep="\t").set_index("sample")
sp    = panel.loc[iid, "super_pop"].to_numpy()

print(G.shape, "genotype matrix")
print(pd.Series(sp).value_counts().to_dict())
```

```
(2503, 3564) genotype matrix
{'AFR': 660, 'EAS': 504, 'EUR': 503, 'SAS': 489, 'AMR': 347}
```

One detail that silently inverts results if you miss it: `--export A` counts the **REF** allele, and
the `.raw` header records which one — the column names end in `_<counted allele>`. So every
frequency computed from `G` below is a reference-allele frequency, while the `AF` field in the
`.pvar` (and in gnomAD) is the *alternate* allele frequency. The two are 1 − each other. Nothing in
this chapter depends on the choice — *H*<sub>e</sub>, *F* and *F*<sub>ST</sub> are all symmetric in
*p* ↔ 1 − *p* — but a comparison against an external database is wrong by reflection if you assume
the wrong one.

## 1. Two populations, and why the word is dangerous

In genetics the word *population* means a group of interbreeding organisms. In statistics it means
the complete set of things you would measure if you could measure everything — the thing your
estimate is an estimate *of*. Genetics uses both meanings, often in the same sentence, and they are
not the same object.

The 503 EUR samples in 1000 Genomes are a genetic population's *sample*. But a sample of what,
exactly? Not of "Europeans" — of five specific cohorts (British, Finnish, Iberian, Tuscan, Utah
residents of northern European ancestry) recruited by convenience decades ago. **The statistical
population is whatever the sampling procedure could have produced**, and no amount of arithmetic
extends an estimate beyond it.

For the rest of this chapter we will treat those 503 EUR genotypes as a stand-in population and draw
samples from them, because that lets us compare estimates to a known truth. Be clear that this is a
simulation *inside* real data: the 503 are themselves a sample, and their frequency is itself an
estimate.

```python
SNP = 185                                    # chr22:20,059,164
g   = G[:, SNP].astype(int)
eur = g[sp == "EUR"]                         # 503 people: our stand-in population
p   = eur.mean() / 2

print(f"chr22:{pos[SNP]}  EUR n={len(eur)}  genotype counts {np.bincount(eur, minlength=3)}")
print(f"reference allele frequency p = {p:.4f}")

rng = np.random.default_rng(0)
for k in range(5):
    s = eur[rng.choice(len(eur), 50, replace=False)]
    print(f"  study {k+1}: n=50   p_hat = {s.mean()/2:.4f}")
```

```
chr22:20059164  EUR n=503  genotype counts [170 243  90]
reference allele frequency p = 0.4205
  study 1: n=50   p_hat = 0.3800
  study 2: n=50   p_hat = 0.3900
  study 3: n=50   p_hat = 0.3200
  study 4: n=50   p_hat = 0.3800
  study 5: n=50   p_hat = 0.4200
```

Five identical studies, five different answers, spanning 0.32 to 0.42. All five are correct
computations. Only one is close to the truth, and none of the five investigators could tell which.

Notation, used consistently from here: *p* is the population value, *p̂* is the estimate. **The hat
is not decoration.** Every quantity in [Ch 26](../part-05-population-genetics/26-hardy-weinberg.md)
through [Ch 29](../part-05-population-genetics/29-linkage-disequilibrium.md) that you compute from
data — *p*, *H*<sub>e</sub>, *F*, *F*<sub>ST</sub>, *D*′, *r*² — wears a hat in practice and is
reported without one about 90% of the time.

## 2. Estimators, and what makes one good

An **estimator** is a function from data to a number. `sample.mean()/2` is an estimator of allele
frequency. There are always alternatives, and three properties separate them.

**Bias** — is the estimator right *on average* over repeated sampling? Bias = E[*θ̂*] − *θ*.

**Variance** — how much does it bounce around from sample to sample?

**Consistency** — does it converge to the truth as *n* → ∞? A consistent estimator can be biased at
any finite *n* as long as the bias vanishes.

Genetics supplies a clean, genuinely important example of bias: **expected heterozygosity**.
[Ch 26 §7](../part-05-population-genetics/26-hardy-weinberg.md) defines
*H*<sub>e</sub> = 1 − Σ*p*<sub>i</sub>². Plug in estimated frequencies and you get an estimate
that is systematically **too small** — because Σ*p̂*<sub>i</sub>² is inflated by the sampling
variance of *p̂* (an average of squares exceeds the square of the average, exactly the algebra
behind the Wahlund effect). The fix is a multiplicative correction, exact under random sampling of
allele copies:

```
Ĥ_unbiased  =  (2n / (2n − 1)) · (1 − Σ p̂_i²)          [Nei 1978]
```

```python
rng = np.random.default_rng(7)
H_true = 2*p*(1-p)
print(f"population heterozygosity H = 2p(1-p) = {H_true:.4f}")
for n in [5, 10, 25, 50, 100]:
    ph    = eur[rng.integers(0, len(eur), (50_000, n))].mean(axis=1) / 2
    naive = 1 - ph**2 - (1-ph)**2
    corr  = naive * (2*n) / (2*n - 1)
    print(f"  n={n:4d}   E[naive] = {naive.mean():.4f} ({naive.mean()-H_true:+.4f})"
          f"   E[corrected] = {corr.mean():.4f} ({corr.mean()-H_true:+.4f})")
```

```
population heterozygosity H = 2p(1-p) = 0.4874
  n=   5   E[naive] = 0.4379 (-0.0495)   E[corrected] = 0.4865 (-0.0008)
  n=  10   E[naive] = 0.4627 (-0.0246)   E[corrected] = 0.4871 (-0.0003)
  n=  25   E[naive] = 0.4776 (-0.0097)   E[corrected] = 0.4874 (+0.0000)
  n=  50   E[naive] = 0.4826 (-0.0048)   E[corrected] = 0.4874 (+0.0001)
  n= 100   E[naive] = 0.4850 (-0.0024)   E[corrected] = 0.4874 (+0.0001)
```

The naive estimator is consistent (bias → 0) but biased at every finite *n*, and the bias is
−*H*/(2*n*) when alleles are sampled independently — which is what the correction inverts, and what
the simulation reproduces to within the small departure from Hardy–Weinberg in this sample. At
*n* = 5 that is a 10% understatement of diversity. Compare two species with
different sample sizes using the naive estimator and you will conclude the smaller-sampled one is
less diverse, which is an artefact of arithmetic.

### Unbiasedness is not the goal

The instinct that unbiased is better is wrong, and the counterexample is the divisor in the sample
variance — the one piece of statistics everyone half-remembers.

```python
rng = np.random.default_rng(3)
true = 4.0
for n in [5, 10, 30]:
    x  = rng.normal(0, 2, size=(200_000, n))
    ss = ((x - x.mean(axis=1, keepdims=True))**2).sum(axis=1)
    out = []
    for d, lbl in [(n-1, "n-1"), (n, "n"), (n+1, "n+1")]:
        v = ss / d
        out.append(f"{lbl}: bias {v.mean()-true:+.4f}  MSE {((v-true)**2).mean():.4f}")
    print(f"  n={n:3d}   " + " | ".join(out))
```

```
  n=  5   n-1: bias +0.0017  MSE 7.9751 | n: bias -0.7987  MSE 5.7419 | n+1: bias -1.3322  MSE 5.3193
  n= 10   n-1: bias -0.0020  MSE 3.5522 | n: bias -0.4018  MSE 3.0387 | n+1: bias -0.7289  MSE 2.9092
  n= 30   n-1: bias -0.0047  MSE 1.1032 | n: bias -0.1379  MSE 1.0499 | n+1: bias -0.2625  MSE 1.0343
```

Dividing by *n* − 1 is unbiased; dividing by *n* + 1 is visibly biased and **closer to the truth on
average**. The reason is that what you usually care about is total error, not average error:

```
MSE  =  bias²  +  variance
```

Accepting some bias to buy a larger reduction in variance lowers MSE. That trade is not an exotic
special case — it is the design principle behind ridge regression and shrinkage in polygenic scores
([Ch 53](../part-11-human-and-statistical-genomics/53-polygenic-scores.md)), empirical-Bayes
dispersion shrinkage in RNA-seq ([Ch 47](../part-10-functional-genomics/47-rna-seq.md)), and the
pseudocounts in every position weight matrix. All of them are deliberately biased, and all of them
beat the unbiased alternative. [S6](./S6-likelihood-and-bayes.md) gives the trade its proper
machinery.

## 3. Standard deviation and standard error are different quantities

These are confused constantly, including in print. They measure different things and behave
differently as *n* grows.

- **Standard deviation** describes the *data*: how spread out individuals are. It estimates a
  property of the population and does not shrink with more data. Getting more people does not make
  people more similar.
- **Standard error** describes an *estimate*: how much *p̂* would move if you repeated the study.
  It shrinks as 1/√n.

```
SE(mean)  =  SD / √n              SE(p̂)  =  √( p(1−p) / 2n )   for n diploid individuals
```

The 2*n* is the number of allele copies, not people — the natural sampling unit for a frequency is
the chromosome.

```python
rng = np.random.default_rng(11)
print(f"  SD of the 503 EUR genotype values = {eur.std(ddof=1):.4f}")
for n in [10, 25, 50, 100, 250, 500, 1000]:
    s   = eur[rng.integers(0, len(eur), (40_000, n))]
    est = s.mean(axis=1) / 2
    print(f"  n={n:5d}   mean SD(genotypes) = {s.std(axis=1, ddof=1).mean():.4f}"
          f"   SE(p_hat) = {est.std(ddof=1):.5f}"
          f"   sqrt(p(1-p)/2n) = {np.sqrt(p*(1-p)/(2*n)):.5f}")
```

```
  SD of the 503 EUR genotype values = 0.7018
  n=   10   mean SD(genotypes) = 0.6898   SE(p_hat) = 0.11087   sqrt(p(1-p)/2n) = 0.11038
  n=   25   mean SD(genotypes) = 0.6975   SE(p_hat) = 0.07043   sqrt(p(1-p)/2n) = 0.06981
  n=   50   mean SD(genotypes) = 0.6993   SE(p_hat) = 0.04941   sqrt(p(1-p)/2n) = 0.04936
  n=  100   mean SD(genotypes) = 0.7001   SE(p_hat) = 0.03502   sqrt(p(1-p)/2n) = 0.03491
  n=  250   mean SD(genotypes) = 0.7009   SE(p_hat) = 0.02221   sqrt(p(1-p)/2n) = 0.02208
  n=  500   mean SD(genotypes) = 0.7009   SE(p_hat) = 0.01575   sqrt(p(1-p)/2n) = 0.01561
  n= 1000   mean SD(genotypes) = 0.7010   SE(p_hat) = 0.01116   sqrt(p(1-p)/2n) = 0.01104
```

**The SD column is flat at 0.70. The SE column falls tenfold, from 0.111 to 0.011.** A hundredfold
increase in sample size buys a tenfold improvement — the whole reason biobanks are the size they
are, and the whole reason the last increment of precision is so expensive.

The formula tracks the simulation to three decimals, which is the point of quoting both: for a
simple estimator you do not need to simulate, and when you do simulate you should get the formula
back.

## 4. The sampling distribution

The object underneath all of this is the distribution of *p̂* over repeated studies. Two of its
properties decide whether the standard machinery applies.

```python
rng = np.random.default_rng(11)
for lbl, pt in [("common p=0.42", p), ("rare   p=0.005", 0.005)]:
    for n in [25, 500]:
        x = rng.binomial(2*n, pt, 200_000) / (2*n)
        print(f"  {lbl}, n={n:4d}:  mean {x.mean():.5f}  sd {x.std():.5f}"
              f"  skew {stats.skew(x):+.3f}  P(p_hat = 0) = {(x==0).mean():.3f}")
```

```
  common p=0.42, n=  25:  mean 0.42068  sd 0.06971  skew +0.043  P(p_hat = 0) = 0.000
  common p=0.42, n= 500:  mean 0.42051  sd 0.01566  skew +0.010  P(p_hat = 0) = 0.000
  rare   p=0.005, n=  25:  mean 0.00502  sd 0.00996  skew +1.962  P(p_hat = 0) = 0.777
  rare   p=0.005, n= 500:  mean 0.00500  sd 0.00224  skew +0.447  P(p_hat = 0) = 0.007
```

At a common variant the sampling distribution is symmetric and effectively normal even at *n* = 25 —
this is the central limit theorem doing its job, and it is why so much of applied statistics gets
away with normal approximations. At MAF 0.5% with 25 people the distribution is strongly
right-skewed and **77% of studies observe the variant zero times**. Any method that assumes normality
is being misapplied there. That single contrast explains most of why rare-variant analysis needs
different tools ([Ch 54](../part-11-human-and-statistical-genomics/54-rare-variants-and-mendelian-disease.md)).

### The formula's hidden assumption

√(*p*(1−*p*)/2*n*) treats the 2*n* allele copies as independent draws. Sampling *individuals* makes
that true only if genotypes are in Hardy–Weinberg proportions. If they are not, the variance is
inflated by exactly (1 + *F*):

```
Var(p̂)  =  p(1 − p)(1 + F) / 2n
```

which is directly measurable in this dataset:

```python
def meanF(mat):
    q  = mat.mean(axis=0) / 2
    Ho = (mat == 1).mean(axis=0)
    He = 2*q*(1-q)
    ok = He > 0.02
    return (1 - Ho[ok]/He[ok]).mean(), ok.sum()

for lbl, mat in [("all 2503 samples pooled", G), ("EUR only (n=503)", G[sp == "EUR"])]:
    f, k = meanF(mat)
    print(f"  {lbl:26s}  mean F over {k} SNPs = {f:+.4f}   SE inflation {np.sqrt(1+f):.3f}x")
```

```
  all 2503 samples pooled     mean F over 3564 SNPs = +0.0422   SE inflation 1.021x
  EUR only (n=503)            mean F over 2272 SNPs = -0.0005   SE inflation 1.000x
```

Within one continental group *F* ≈ 0 and the binomial formula is exact. Pool all five and *F* rises
to +0.042 — the Wahlund effect of [Ch 26 §8](../part-05-population-genetics/26-hardy-weinberg.md),
measured rather than asserted, and the same quantity
[Ch 28](../part-05-population-genetics/28-structure-and-inbreeding.md) calls *F*<sub>ST</sub> for the
whole panel. Population structure does not only bias tests; it makes every standard error in this
pooled dataset about 2% too small, and far worse in more structured samples.

## 5. Confidence intervals are a property of the procedure

An estimate plus a standard error gives an interval. The standard 95% **Wald** interval is
*p̂* ± 1.96·SE.

What does 95% mean? Here is the experiment, run on the real data: draw 100 samples of 50 EUR
individuals, build the interval each time, and count how many contain the value we defined as truth.

```python
rng = np.random.default_rng(2024)
def wald(x, m, z=1.96):
    ph = x/m; se = np.sqrt(ph*(1-ph)/m)
    return ph - z*se, ph + z*se

miss = []
for k in range(100):
    s = eur[rng.integers(0, len(eur), 50)]
    lo, hi = wald(s.sum(), 100)
    if not (lo <= p <= hi):
        miss.append((k+1, s.sum()/100, lo, hi))
print(f"  intervals that do NOT contain p = {p:.4f}:  {len(miss)} of 100")
for m in miss:
    print("    #%3d  p_hat=%.4f  [%.4f, %.4f]" % m)
```

```
  intervals that do NOT contain p = 0.4205:  4 of 100
    #  7  p_hat=0.3200  [0.2286, 0.4114]
    # 12  p_hat=0.5400  [0.4423, 0.6377]
    # 53  p_hat=0.5300  [0.4322, 0.6278]
    # 91  p_hat=0.3000  [0.2102, 0.3898]
```

Four of a hundred missed — close to the advertised five. Look at interval #12: [0.4423, 0.6377]. It
does not contain 0.4205. It contains 0.4205 with probability zero, not 0.95. There is nothing random
left in it; the truth is fixed and the interval is fixed and one of them is outside the other.

> **The 95% belongs to the procedure, not to your interval.** "95% confidence" means: *if this
> whole study were repeated indefinitely, 95% of the intervals so constructed would cover the true
> value.* It does not mean there is a 95% probability that this particular interval contains the
> truth. That statement requires a prior and is a Bayesian credible interval
> ([S6](./S6-likelihood-and-bayes.md)) — a different object that often has a similar numerical
> answer, which is precisely why the confusion survives.

### Nominal coverage is not actual coverage

The 95% is a promise the procedure makes. It is worth checking whether the procedure keeps it.

```python
from statsmodels.stats.proportion import proportion_confint
rng = np.random.default_rng(2024)
for pt in [0.42, 0.10, 0.02, 0.005]:
    cells = []
    for n in [50, 200, 1000]:
        x = rng.binomial(2*n, pt, 60_000)
        lo, hi = wald(x, 2*n)
        w = np.mean((lo <= pt) & (pt <= hi))
        lo2, hi2 = proportion_confint(x, 2*n, method="wilson")
        s = np.mean((lo2 <= pt) & (pt <= hi2))
        cells.append(f"n={n:4d}  Wald {w:.3f}  Wilson {s:.3f}")
    print(f"  p = {pt:.3f} :  " + " | ".join(cells))
```

```
  p = 0.420 :  n=  50  Wald 0.947  Wilson 0.947 | n= 200  Wald 0.945  Wilson 0.951 | n=1000  Wald 0.950  Wilson 0.952
  p = 0.100 :  n=  50  Wald 0.933  Wilson 0.935 | n= 200  Wald 0.952  Wilson 0.948 | n=1000  Wald 0.946  Wilson 0.952
  p = 0.020 :  n=  50  Wald 0.865  Wilson 0.950 | n= 200  Wald 0.895  Wilson 0.954 | n=1000  Wald 0.946  Wilson 0.955
  p = 0.005 :  n=  50  Wald 0.392  Wilson 0.909 | n= 200  Wald 0.864  Wilson 0.948 | n=1000  Wald 0.927  Wilson 0.965
```

**At MAF 0.5% with 50 people the nominal 95% Wald interval covers the truth 39% of the time.** It is
not slightly optimistic; it is broken, because *p̂* is often exactly 0 and then SE is computed as 0
too, producing the interval [0, 0]. The **Wilson score** interval — one line in statsmodels,
`proportion_confint(x, n, method="wilson")` — holds at 91% in the same cell and is essentially
correct everywhere else. Use Wilson (or Clopper–Pearson if you need guaranteed conservatism) for any
proportion that might be small. Wald is fine only for common variants at decent *n*.

## 6. The bootstrap

Everything above needed a formula. For *F*<sub>ST</sub>, for a median, for the output of a pipeline
with four steps, there is no formula, and deriving one is a research project.

The bootstrap replaces the derivation with compute. The logic is a single substitution: you cannot
resample from the population, but your sample *is* your best picture of the population — so resample
from the sample, with replacement, and watch the statistic move.

```python
def bootstrap(data, stat, B=2000, seed=0):
    rng = np.random.default_rng(seed)
    n = len(data)
    return np.array([stat(data[rng.integers(0, n, n)]) for _ in range(B)])
```

Four lines. It works for any statistic you can write as a function. Sanity-check it against the
formula we already trust:

```python
samp  = eur[np.random.default_rng(5).choice(len(eur), 60, replace=False)]
p_hat = samp.mean() / 2
reps  = bootstrap(samp, lambda d: d.mean()/2, B=2000, seed=1)
print(f"  one study, n=60:  p_hat = {p_hat:.4f}")
print(f"  bootstrap SE      = {reps.std(ddof=1):.5f}")
print(f"  formula  SE       = {np.sqrt(p_hat*(1-p_hat)/120):.5f}")
print(f"  bootstrap 95% CI  = [{np.percentile(reps,2.5):.4f}, {np.percentile(reps,97.5):.4f}]")
print(f"  Wald      95% CI  = [{p_hat-1.96*np.sqrt(p_hat*(1-p_hat)/120):.4f}, "
      f"{p_hat+1.96*np.sqrt(p_hat*(1-p_hat)/120):.4f}]")
print(f"  EUR reference     = {p:.4f}")
print(f"  observed Var(genotype) = {samp.var(ddof=1):.4f}   2p(1-p) under HWE = {2*p_hat*(1-p_hat):.4f}")
```

```
  one study, n=60:  p_hat = 0.3667
  bootstrap SE      = 0.04157
  formula  SE       = 0.04399
  bootstrap 95% CI  = [0.2833, 0.4500]
  Wald      95% CI  = [0.2804, 0.4529]
  EUR reference     = 0.4205
  observed Var(genotype) = 0.4362   2p(1-p) under HWE = 0.4644
```

The two agree to within 6%, and the residual difference is informative rather than noise: the
formula assumes Hardy–Weinberg, this sample has a slight heterozygote excess (Var(genotype) = 0.436
against 0.464 under HWE), and **the bootstrap over individuals does not assume HWE** — it uses the
genotype distribution actually observed. The bootstrap is not merely a substitute for a formula; it
is often the more honest calculation.

Now use it on something with no convenient formula — mean expected heterozygosity across all 3,564
SNPs, and the difference between two continental groups:

```python
def mean_He(mat):
    q = mat.mean(axis=0) / 2
    return np.mean(2*q*(1-q))

AFR, EUR = G[sp == "AFR"], G[sp == "EUR"]
rng = np.random.default_rng(2)
bE = np.array([mean_He(EUR[rng.integers(0, len(EUR), len(EUR))]) for _ in range(2000)])
bA = np.array([mean_He(AFR[rng.integers(0, len(AFR), len(AFR))]) for _ in range(2000)])
d  = bA - bE
print(f"  EUR mean He = {mean_He(EUR):.5f}   95% CI [{np.percentile(bE,2.5):.5f}, {np.percentile(bE,97.5):.5f}]")
print(f"  AFR mean He = {mean_He(AFR):.5f}   95% CI [{np.percentile(bA,2.5):.5f}, {np.percentile(bA,97.5):.5f}]")
print(f"  AFR - EUR   = {mean_He(AFR)-mean_He(EUR):+.5f}   95% CI [{np.percentile(d,2.5):+.5f}, {np.percentile(d,97.5):+.5f}]")
```

```
  EUR mean He = 0.17097   95% CI [0.16859, 0.17275]
  AFR mean He = 0.18548   95% CI [0.18423, 0.18653]
  AFR - EUR   = +0.01451   95% CI [+0.01240, +0.01699]
```

African-ancestry samples are more heterozygous, the interval excludes zero comfortably, and that is
the out-of-Africa bottleneck showing up in 3,564 SNPs on one megabase
([Ch 27](../part-05-population-genetics/27-the-four-forces.md)). Note what the interval covers and
what it does not: this SNP set was ascertained by MAF-filtering the *pooled* panel, so the absolute
heterozygosity values are not comparable to genome-wide estimates. The bootstrap quantifies sampling
uncertainty, not ascertainment.

### Choosing the resampling unit is the whole design decision

**Whatever you resample is what your confidence interval is about.** Resample individuals and you
are asking "what if I had recruited different people?". Resample SNPs and you are asking "what if I
had genotyped a different part of the genome?". These are different questions with different
answers, and picking the wrong one silently answers a question nobody asked. The worked example
below computes all three for *F*<sub>ST</sub>.

Two failure modes to know:

- **Breaking the pairing.** If the statistic links two things — the same SNP in two populations, the
  same gene in two conditions — resample the *linked unit*. Resampling SNP indices independently in
  AFR and EUR turns *F*<sub>ST</sub> = 0.065 into 0.383, because (*p*₁ − *p*₂)² becomes a difference
  between unrelated loci.
- **Ignoring dependence.** The plain bootstrap assumes exchangeable units. Adjacent SNPs are in
  linkage disequilibrium ([Ch 29](../part-05-population-genetics/29-linkage-disequilibrium.md)), so
  resampling them individually pretends you have more independent information than you do. The fix
  is a **block bootstrap** — resample contiguous blocks — and it matters by a factor of 3.5 here.

### This is exactly what the phylogenetic bootstrap does

[Ch 34](../part-07-molecular-evolution/34-phylogenetics.md) reports bootstrap support on trees. Same
algorithm: the resampling unit is the **alignment column**, the statistic is the **tree topology**,
and the "confidence interval" is reported as the percentage of replicates containing each clade.

Being precise about what that measures:

| Bootstrap support **does** measure | It **does not** measure |
|---|---|
| How much the signal for this clade depends on a few columns | Whether the clade is true |
| Repeatability if you sequenced a different sample of sites from the same genes | Whether your substitution model is right |
| Sampling error in site choice | Whether your alignment is right |

Every replicate contains the same systematic error, so a misaligned region, a wrong model, or
long-branch attraction produces **100% support for the wrong tree**
([lab-10](../labs/lab-10-phylogenetics.md)). That is not a quirk of phylogenetics. It is the general
property of the bootstrap, and it is the subject of the next section.

## 7. Sampling error and systematic error

Sampling error is random: it makes your estimate scatter around the truth. Bias is systematic: it
makes your estimate scatter around **something else**. Only the first shrinks with *n*.

Here is bias in the most concrete genomic form. A variant sits under the primer or probe site, so
5% of true heterozygotes are called homozygous reference — the allele-dropout failure that
[Ch 26 §6](../part-05-population-genetics/26-hardy-weinberg.md) uses Hardy–Weinberg to detect. The
frequency estimate is now biased downward. Watch the confidence interval.

```python
rng = np.random.default_rng(2024)
for n in [100, 1000, 10_000, 100_000]:
    s     = eur[rng.integers(0, len(eur), (4000, n))]
    lost  = (s == 1) & (rng.random(s.shape) < 0.05)   # het miscalled as hom-ref
    x     = np.where(lost, 0, s).sum(axis=1)
    lo, hi = wald(x, 2*n)
    print(f"  n={n:6d}   mean p_hat = {(x/(2*n)).mean():.4f}   CI width = {(hi-lo).mean():.4f}"
          f"   coverage of the true {p:.4f} = {np.mean((lo <= p) & (p <= hi)):.3f}")
```

```
  n=   100   mean p_hat = 0.4080   CI width = 0.1359   coverage of the true 0.4205 = 0.924
  n=  1000   mean p_hat = 0.4086   CI width = 0.0431   coverage of the true 0.4205 = 0.788
  n= 10000   mean p_hat = 0.4084   CI width = 0.0136   coverage of the true 0.4205 = 0.070
  n=100000   mean p_hat = 0.4084   CI width = 0.0043   coverage of the true 0.4205 = 0.000
```

The bias is fixed at about −0.012 and never moves. The interval width falls by a factor of 30. So
coverage collapses from 92% to **zero**: at *n* = 100,000 the study is guaranteed to report a
confidently wrong answer with a tight interval. More data did not help. More data is what did the
damage.

> **Sample size cures variance and never cures bias.** Every additional sample makes a biased
> estimate more precise, more significant, and no more true. This is the exact lesson of
> [lab-08](../labs/lab-08-gwas.md), where a phenotype with no genetic basis produces 702
> genome-wide-significant hits at λ<sub>GC</sub> = 18.07 — and doubling the cohort would produce
> more of them, with smaller p-values. Only a change of design or model touches bias.

The distinction propagates into how you should read any result: a confidence interval, a p-value and
a bootstrap **all quantify sampling error only**. They are silent about whether your samples
represent the population you care about, whether your assay is calibrated, and whether your model
is right. Those questions are answered by replication in an independent cohort, by positive and
negative controls, and by sensitivity analysis — never by more of the same data.

## 8. Rare variants: when *n* is simply not enough

Most variants are rare. This is the single most consequential fact about the shape of genomic data,
and it is visible directly in the unfiltered chr22 file:

```python
ac, an = [], []
for line in open("labs/data/chr22.pvar"):
    if line.startswith("#"): continue
    info = dict(kv.split("=", 1) for kv in line.split("\t")[6].split(";") if "=" in kv)
    ac.append(int(info["AC"])); an.append(int(info["AN"]))
ac, an = np.array(ac), np.array(an)
mac = np.minimum(ac, an - ac)                      # minor allele count
print(f"  {len(ac)} variants, {an[0]} chromosomes sampled")
for lo, hi, lbl in [(1,1,"singleton"), (2,2,"doubleton"), (3,10,"3-10 copies"),
                    (11,50,"11-50 copies"), (51,254,"51-254 (MAF<5%)"), (255,2548,"MAF >= 5%")]:
    k = ((mac >= lo) & (mac <= hi)).sum()
    print(f"    {lbl:18s} {k:6d}  ({100*k/len(ac):4.1f}%)")
print(f"  MAF < 1%: {(mac/an < 0.01).sum()} variants ({100*(mac/an < 0.01).mean():.1f}%)")
```

```
  27895 variants, 5096 chromosomes sampled
    singleton           11331  (40.6%)
    doubleton            3089  (11.1%)
    3-10 copies          5176  (18.6%)
    11-50 copies         3270  (11.7%)
    51-254 (MAF<5%)      1860  ( 6.7%)
    MAF >= 5%            2603  ( 9.3%)
  MAF < 1%: 23432 variants (84.0%)
```

**84% of variants have MAF below 1%, and 41% are seen exactly once** even with 5,096 chromosomes.
For each of those singletons the entire evidence about its frequency is a single observation.

The relative standard error tells you how bad that is. For a rare allele the variance is
approximately *f*/2*n*, so

```
SE(f̂) / f  ≈  √( 1 / (2n·f) )  =  1 / √(expected number of copies)
```

**Precision depends on the expected *count*, not on the sample size.** Fifty thousand samples is not
"a lot" for a variant at *f* = 10⁻⁵; it is one expected copy.

```python
for x in [0, 1, 2, 5, 10]:
    lo, hi = proportion_confint(x, 1000, method="wilson")
    print(f"  {x:2d} copies in 1000 chromosomes -> f_hat = {x/1000:.4f}   Wilson 95% CI [{lo:.5f}, {hi:.5f}]")
for ftrue, n in [(0.001, 500), (0.001, 5000), (0.001, 50_000)]:
    print(f"  f={ftrue}, n={n:6d} people: expected copies {ftrue*2*n:6.1f}"
          f"   P(see none) = {stats.binom.pmf(0, 2*n, ftrue):.3f}"
          f"   relative SE = {np.sqrt((1-ftrue)/(2*n*ftrue)):.2f}")
```

```
   0 copies in 1000 chromosomes -> f_hat = 0.0000   Wilson 95% CI [0.00000, 0.00383]
   1 copies in 1000 chromosomes -> f_hat = 0.0010   Wilson 95% CI [0.00018, 0.00564]
   2 copies in 1000 chromosomes -> f_hat = 0.0020   Wilson 95% CI [0.00055, 0.00726]
   5 copies in 1000 chromosomes -> f_hat = 0.0050   Wilson 95% CI [0.00214, 0.01165]
  10 copies in 1000 chromosomes -> f_hat = 0.0100   Wilson 95% CI [0.00544, 0.01831]
  f=0.001, n=   500 people: expected copies    1.0   P(see none) = 0.368   relative SE = 1.00
  f=0.001, n=  5000 people: expected copies   10.0   P(see none) = 0.000   relative SE = 0.32
  f=0.001, n= 50000 people: expected copies  100.0   P(see none) = 0.000   relative SE = 0.10
```

Estimating *f* = 0.001 from 500 people is hopeless in a precise sense: the expected count is 1, you
see nothing at all 37% of the time, and the relative standard error is 100% — the estimate is the
same size as its own error bar. Even observing one copy leaves a 95% interval spanning a
**thirty-fold range**, 0.00018 to 0.0056.

Observing zero is not the same as *f* = 0. The useful shortcut is the **rule of three**: if you see
no copies in *m* chromosomes, the 95% upper bound is about 3/*m* — here 3/1000 = 0.003, matching the
Wilson bound of 0.0038 closely enough for a mental estimate. This is the arithmetic behind gnomAD
"allele frequency is 0" being weak evidence in variant interpretation
([Ch 55](../part-11-human-and-statistical-genomics/55-clinical-variant-interpretation.md)) unless
the reference database is very large.

**This is why MAF filters exist.** A `--maf 0.01` threshold is not squeamishness about rare biology.
Below it the frequency estimate has a relative error near 1, the normal approximation fails
(§4), Hardy–Weinberg χ² becomes anti-conservative by orders of magnitude
([Ch 26 §5](../part-05-population-genetics/26-hardy-weinberg.md)), and single-variant association
tests have essentially no power ([Ch 51](../part-11-human-and-statistical-genomics/51-gwas.md)).
The filter is an admission that these variants must be analysed *in aggregate* — burden tests,
SKAT — rather than one at a time
([Ch 54](../part-11-human-and-statistical-genomics/54-rare-variants-and-mendelian-disease.md)).

---

## Common misconceptions

| What people think | What's actually true |
|---|---|
| A 95% CI has a 95% chance of containing the true value | The 95% describes the long-run behaviour of the procedure. Your particular interval either contains the truth or does not. The probability statement requires a prior — that is a Bayesian credible interval ([S6](./S6-likelihood-and-bayes.md)) |
| Standard error and standard deviation are near enough the same | SD describes spread in the data and does not shrink with *n*. SE describes uncertainty in an estimate and shrinks as 1/√n. Here: SD flat at 0.70, SE from 0.111 to 0.011 |
| A bigger sample makes results more accurate | It makes them more *precise*. Accuracy also requires the absence of bias, which *n* does not touch. At *n* = 100,000 with 5% dropout, CI coverage was 0.000 |
| Unbiased estimators are the right ones to use | MSE = bias² + variance. Dividing by *n* + 1 is biased and beats the unbiased *n* − 1 on MSE. Shrinkage estimators in PRS and RNA-seq are deliberately biased and better |
| Non-overlapping CIs mean a significant difference, and overlapping ones mean no difference | Half right, and it is the second half that fails. Non-overlap **does** imply significance for symmetric intervals at the same level — but it is a far stricter test than it looks: with equal SEs, non-overlapping 95% CIs correspond to *p* ≈ 0.006. Overlap implies nothing, because SE(difference) = √(se₁² + se₂²) is smaller than se₁ + se₂; two 95% CIs can overlap by more than half a margin of error and still differ at *p* = 0.05. Test the difference directly — bootstrap it, as in §6 |
| The bootstrap needs no assumptions | It assumes your sample represents the population and that the resampled units are exchangeable. It cannot see bias, and it understates uncertainty when units are correlated — LD inflated the *F*<sub>ST</sub> SE 3.5-fold here |
| High phylogenetic bootstrap support means the clade is probably right | It means the clade is robust to resampling alignment columns. Systematic error is in every replicate, so a wrong model gives 100% support for a wrong tree ([Ch 34](../part-07-molecular-evolution/34-phylogenetics.md)) |
| An allele frequency of 0 in gnomAD means the variant is absent | It means it was not observed. With *m* chromosomes the upper bound is roughly 3/*m* — a real constraint only when *m* is very large |
| A frequency estimated from a large cohort is precise | Precision depends on the expected *count*, not on *n*. 50,000 samples gives one expected copy at *f* = 10⁻⁵ |
| The p-value or CI tells you whether the result is trustworthy | They quantify sampling error alone. They say nothing about ascertainment, confounding, batch effects or a wrong model |

## Worked example: how uncertain is *F*<sub>ST</sub> = 0.065?

[lab-07](../labs/lab-07-population-genetics.md) reports *F*<sub>ST</sub> = 0.0648 between the AFR
and EUR samples on chr22:20–21 Mb, straight out of `plink2 --fst`. That is a point estimate with no
error bar, and [Ch 28](../part-05-population-genetics/28-structure-and-inbreeding.md) offers no
formula for one. Supply the error bar.

**Step 1 — reproduce the estimator.** PLINK2 uses the Hudson ratio-of-averages form
(Bhatia *et al.* 2013), which is worth writing out because it makes the resampling unit obvious:
each SNP contributes a numerator and a denominator, and the estimate is the ratio of the sums.

```python
def fst(A, E):
    n1, n2 = 2*A.shape[0], 2*E.shape[0]
    p1, p2 = A.mean(axis=0)/2, E.mean(axis=0)/2
    num = (p1 - p2)**2 - p1*(1-p1)/(n1-1) - p2*(1-p2)/(n2-1)
    den = p1*(1-p2) + p2*(1-p1)
    return num.sum() / den.sum()

print(f"point estimate  F_ST(AFR, EUR) = {fst(AFR, EUR):.7f}")
print( "PLINK2 --fst    F_ST(AFR, EUR) = 0.0647658")
```

```
point estimate  F_ST(AFR, EUR) = 0.0647658
PLINK2 --fst    F_ST(AFR, EUR) = 0.0647658
```

Seven matching decimal places. The subtracted terms *p*(1−*p*)/(*n*−1) are themselves a bias
correction of exactly the §2 kind: without them, sampling noise in *p̂*₁ and *p̂*₂ inflates
(*p̂*₁ − *p̂*₂)² and *F*<sub>ST</sub> comes out too high, more so in small samples.

**Step 2 — bootstrap, three ways, because there are three questions.**

```python
M, nA, nE = AFR.shape[1], AFR.shape[0], EUR.shape[0]
rng = np.random.default_rng(0)

def show(lbl, reps):
    print(f"  {lbl:22s} SE = {reps.std(ddof=1):.5f}   95% CI [{np.percentile(reps,2.5):.4f}, {np.percentile(reps,97.5):.4f}]")

show("resample SNPs",        np.array([fst(AFR[:, j], EUR[:, j]) for j in (rng.integers(0,M,M) for _ in range(2000))]))
show("resample individuals", np.array([fst(AFR[rng.integers(0,nA,nA)], EUR[rng.integers(0,nE,nE)]) for _ in range(2000)]))
show("resample both",        np.array([fst(AFR[np.ix_(rng.integers(0,nA,nA), j)], EUR[np.ix_(rng.integers(0,nE,nE), j)])
                                       for j in (rng.integers(0,M,M) for _ in range(1000))]))
```

```
  resample SNPs          SE = 0.00150   95% CI [0.0620, 0.0678]
  resample individuals   SE = 0.00234   95% CI [0.0614, 0.0706]
  resample both          SE = 0.00284   95% CI [0.0603, 0.0713]
```

Three different intervals, all correct, answering three different questions. "If I had genotyped a
different set of these SNPs" gives ±0.003; "if I had recruited different people" gives ±0.005; both
sources together give ±0.006, and the variances add as they should
(√(0.00150² + 0.00234²) = 0.00278 against the observed 0.00284). On this evidence the people look
like the dominant source — but the SNP bootstrap here is wrong, and step 3 reverses the conclusion.

**Step 3 — respect the linkage disequilibrium.** Resampling SNPs one at a time pretends 3,564
independent measurements. They are not independent; they span one megabase. Resample contiguous
blocks instead:

```python
for L in [1, 10, 50, 200]:
    nb = M // L
    out = np.empty(1000)
    for b in range(1000):
        j = (rng.integers(0, M-L+1, nb)[:, None] + np.arange(L)).ravel()
        out[b] = fst(AFR[:, j], EUR[:, j])
    print(f"  block = {L:3d} SNPs   SE = {out.std(ddof=1):.5f}   95% CI [{np.percentile(out,2.5):.4f}, {np.percentile(out,97.5):.4f}]")
```

```
  block =   1 SNPs   SE = 0.00149   95% CI [0.0619, 0.0677]
  block =  10 SNPs   SE = 0.00299   95% CI [0.0596, 0.0711]
  block =  50 SNPs   SE = 0.00463   95% CI [0.0569, 0.0753]
  block = 200 SNPs   SE = 0.00519   95% CI [0.0566, 0.0761]
```

The standard error more than **triples** as the block length grows, then plateaus once blocks exceed
the LD scale. The naive SNP bootstrap understated the uncertainty 3.5-fold — and once corrected, the
marker-choice uncertainty (0.0052) **exceeds** the recruit-different-people uncertainty (0.0023),
reversing step 2's reading. This is why population-genetic software reports block-jackknife standard
errors for *F*<sub>ST</sub>, *f*-statistics and admixture estimates rather than per-SNP ones, and it
is the clearest possible demonstration that a bootstrap is only as good as its exchangeability
assumption.

**Step 4 — contrast with the per-SNP estimate**, which is what an *F*<sub>ST</sub> Manhattan plot
displays.

```python
n1, n2 = 2*nA, 2*nE
p1, p2 = AFR.mean(axis=0)/2, EUR.mean(axis=0)/2
num = (p1-p2)**2 - p1*(1-p1)/(n1-1) - p2*(1-p2)/(n2-1)
den = p1*(1-p2) + p2*(1-p1)
ok  = den > 1e-9
r   = num[ok]/den[ok]
print(f"per-SNP F_ST over {ok.sum()} SNPs: mean {r.mean():.4f}  SD {r.std():.4f}"
      f"  10th-90th [{np.percentile(r,10):.4f}, {np.percentile(r,90):.4f}]"
      f"  negative: {100*(r<0).mean():.1f}%  max {r.max():.4f}")
```

```
per-SNP F_ST over 3475 SNPs: mean 0.0565  SD 0.0541  10th-90th [0.0002, 0.1342]  negative: 8.0%  max 0.2758
```

Per-SNP values scatter over a range of 0.27, and 8% are negative — impossible for a real variance
ratio, and a direct readout of estimator noise. Averaged over 3,475 SNPs, that scatter collapses to
a standard error of 0.005. **A single SNP's *F*<sub>ST</sub> carries almost no information; the
genome-wide average is precise.** Any claim that a particular locus is an outlier for selection must
be measured against this null scatter rather than against zero
([Ch 33](../part-07-molecular-evolution/33-neutral-theory-and-selection-tests.md)).

**Step 5 — report it.** *F*<sub>ST</sub>(AFR, EUR) = 0.065, 95% CI [0.057, 0.076] (block bootstrap,
50-SNP blocks, resampling loci), and be explicit that this covers uncertainty from marker choice
only, in this one megabase, among these particular cohorts. None of the intervals above says
anything about whether these samples represent Africa or Europe. That is a question about
recruitment, and no bootstrap can answer it.

## Where this is used

- [Ch 26](../part-05-population-genetics/26-hardy-weinberg.md) — every *p̂*, *q̂* and *F̂* is an
  estimate; the power table there is this chapter's standard errors in disguise
- [Ch 27](../part-05-population-genetics/27-the-four-forces.md) — genetic drift *is* sampling error,
  with Var(Δ*p*) = *pq*/2*N*<sub>e</sub>; *N*<sub>e</sub> is defined by the amount of sampling noise
- [Ch 28](../part-05-population-genetics/28-structure-and-inbreeding.md) — *F*<sub>ST</sub> point
  estimates need block-bootstrap intervals, as above
- [Ch 33](../part-07-molecular-evolution/33-neutral-theory-and-selection-tests.md) — Tajima's *D*
  and related statistics are compared against a simulated null distribution, which is a sampling
  distribution
- [Ch 34](../part-07-molecular-evolution/34-phylogenetics.md) — the phylogenetic bootstrap, and what
  its numbers do and do not mean
- [Ch 47](../part-10-functional-genomics/47-rna-seq.md) — replicate counts, dispersion shrinkage, and
  why three replicates estimate variance poorly
- [Ch 51](../part-11-human-and-statistical-genomics/51-gwas.md) and
  [lab-08](../labs/lab-08-gwas.md) — effect-size standard errors, and stratification as bias that
  sample size makes worse
- [Ch 53](../part-11-human-and-statistical-genomics/53-polygenic-scores.md) — shrinkage estimators
  trading bias for variance, and why PRS trained in one population transfers poorly
- [Ch 54](../part-11-human-and-statistical-genomics/54-rare-variants-and-mendelian-disease.md) and
  [Ch 55](../part-11-human-and-statistical-genomics/55-clinical-variant-interpretation.md) — rare
  allele frequencies, gnomAD, and the rule of three
- Next: [S4](./S4-hypothesis-testing.md) turns standard errors into test statistics;
  [S5](./S5-variance-and-regression.md) partitions variance rather than merely estimating it

## Check yourself

**1. A press release says "the study found the allele frequency is 20%, 95% CI 14.5%–25.5%, so there is a 95% chance the true frequency lies between 14.5% and 25.5%." What is wrong, and what is the correct statement?**

<details><summary>Answer</summary>

The probability statement is misplaced. The true frequency is a fixed number; this interval is now
also fixed. Either it contains the truth or it does not — there is no 95% about it.

The correct statement: *this interval was produced by a procedure that, applied to repeated samples
from this population, would contain the true frequency 95% of the time.*

The interval quoted corresponds to *p̂* = 0.20 with SE = √(0.2 × 0.8/2*n*) and half-width
1.96 × SE = 0.055, so SE = 0.0283 and 2*n* = 200 — i.e. 100 diploid individuals.

A 95% *probability* statement about the parameter is available, but it is a Bayesian credible
interval and requires a prior ([S6](./S6-likelihood-and-bayes.md)). It is a different object that
frequently gives a similar answer, which is why this error is so persistent.

</details>

**2. You estimate an allele frequency of 0.20 from 100 people and want to halve the standard error. How many people do you need? Now you discover the assay drops 5% of heterozygotes. Does the larger sample fix that?**

<details><summary>Answer</summary>

SE ∝ 1/√n, so halving it needs **four times** the sample: 400 people. To reach SE = 0.01 you would
need *p*(1−*p*)/(2·SE²) = 0.2 × 0.8/(2 × 0.0001) = **800 people**.

The dropout is not fixed by any sample size. It is bias: it shifts the expected value of *p̂* rather
than adding scatter. §7 shows the consequence — the estimate stays wrong by a constant while the
interval shrinks around it, so coverage of the true value falls from 92% at *n* = 100 to 0% at
*n* = 100,000. The larger sample makes you *more confidently wrong*.

The fix is diagnostic, not statistical: dropout produces a heterozygote deficit, so it shows up as
*F̂* > 0 in a Hardy–Weinberg test ([Ch 26 §6](../part-05-population-genetics/26-hardy-weinberg.md)),
and the remedy is redesigning the assay or dropping the variant.

</details>

**3. A rare-disease study genotypes 250 people and observes the variant 3 times. Report the frequency with an interval, and say which interval you would use and why.**

<details><summary>Answer</summary>

250 diploid people = 500 chromosomes, so *f̂* = 3/500 = **0.006**.

Wald: SE = √(0.006 × 0.994/500) = 0.00345, giving 0.006 ± 0.00677 = **[−0.0008, 0.0128]**. The lower
bound is negative, which is impossible for a frequency and is the clearest possible signal that the
normal approximation has failed. §5 shows Wald coverage at this kind of frequency and sample size
running as low as 39%.

Wilson: `proportion_confint(3, 500, method="wilson")` = **[0.0020, 0.0175]**. Bounded, asymmetric,
and honest — the upper bound is nearly nine times the lower one.

Use Wilson (or Clopper–Pearson if you need guaranteed conservatism). And report the width honestly:
this study has established that the frequency is somewhere in a nine-fold range. Distinguishing
*f* = 0.002 from *f* = 0.017 would need thousands more samples, because precision follows the
expected *count*.

</details>

**4. You bootstrap a differential-expression pipeline by resampling genes, and get a tight interval on the number of significant genes. A colleague says this shows the result is robust. Are they right?**

<details><summary>Answer</summary>

No, on two counts.

**Wrong resampling unit.** Resampling genes answers "what if I had measured a different set of
genes?" — rarely the question of interest. The question is almost always "what if I had used
different biological samples?", which requires resampling *samples*. With three replicates per
condition ([Ch 47](../part-10-functional-genomics/47-rna-seq.md)) that bootstrap would be far
wider, which is exactly why it was not the one performed.

**Genes are not exchangeable.** They are correlated through co-expression and shared pathways, so a
naive gene bootstrap understates uncertainty for the same reason a naive SNP bootstrap does under
LD — where the worked example found a 3.5-fold understatement.

And even a correctly specified bootstrap would only quantify sampling error. Batch effects,
confounded library preparation and a misspecified normalisation are in every replicate, so the
bootstrap cannot see them. Robustness to resampling is not correctness.

</details>

**5. Why does the per-SNP *F*<sub>ST</sub> in the worked example come out negative for 8% of SNPs, and what does that tell you about interpreting an *F*<sub>ST</sub> outlier scan?**

<details><summary>Answer</summary>

*F*<sub>ST</sub> is a ratio of variance components and cannot truly be negative. The negative values
come from the bias correction: the Hudson numerator subtracts
*p*(1−*p*)/(*n*−1) from each sample to remove the inflation that sampling noise puts into
(*p̂*₁ − *p̂*₂)². When the true between-population difference is near zero, that subtraction
overshoots and the estimate lands below zero. The estimator is unbiased on average, not
non-negative — the negatives are the price of removing the bias, and clipping them at zero would
reintroduce it.

For an outlier scan, the operational lesson is that per-SNP *F*<sub>ST</sub> has an enormous
sampling distribution: SD 0.054 around a mean of 0.057, with a 10th–90th range of [0.0002, 0.134]
under nothing but drift and sampling. A locus at *F*<sub>ST</sub> = 0.15 is unremarkable against
that null, even though it is more than twice the genome-wide average. Outlier scans must compare
each locus to the empirical genome-wide distribution — or to a simulated neutral null with the same
sample sizes and MAF spectrum — and never to zero or to the mean alone
([Ch 33](../part-07-molecular-evolution/33-neutral-theory-and-selection-tests.md)). Averaging is
what makes *F*<sub>ST</sub> precise: the same 3,475 SNPs that individually scatter over 0.27 give a
genome-wide estimate with a standard error of 0.005.

</details>
