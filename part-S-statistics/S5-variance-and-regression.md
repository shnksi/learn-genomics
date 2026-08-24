# S5 — Variance, correlation and regression

> **Read before:** [Ch 28](../part-05-population-genetics/28-structure-and-inbreeding.md) · **Time:** ~55 min

Heritability is a ratio of variances. Not a measure of importance, not a property of a gene — a
number you get by dividing one variance by another. The whole of quantitative genetics is written
that way: *V*<sub>P</sub> = *V*<sub>A</sub> + *V*<sub>D</sub> + *V*<sub>E</sub>, the breeder's
equation, the resemblance between relatives, the model that estimates SNP heritability. Every one
of those is an accounting argument about variance, and none can be read — let alone criticised —
by someone who thinks of variance as "spread".

Then the other half. A GWAS is a few million regressions; an eQTL scan a few billion. RNA-seq
differential expression is a generalised linear model per gene, structure correction is a
covariate, a polygenic score is a vector of fitted coefficients. **Regression is the
most-executed statistical procedure in genomics**, and the commonest way to get a genomics result
badly wrong is to fit one and misread the coefficient.

This chapter covers exactly that, and stops. No matrix algebra of the general linear model, no
proofs of Gauss–Markov, no time series. What a variance is and why the field is written in
variances; what correlation does and does not measure; how to fit, read and distrust a regression.

All code in this chapter runs from the repository root — the directory holding `README.md` and
`.venv` — with `source .venv/bin/activate`, and addresses data as `labs/data/…`. The alignment
comes from [lab-02](../labs/lab-02-alignment.md); the genotypes, the sample panel and the PCA
eigenvectors from [lab-07](../labs/lab-07-population-genetics.md). One package this chapter needs
is not in [lab-00](../labs/lab-00-setup.md)'s base install. Set up once:

```bash
cd /path/to/learn-genomics          # the directory holding README.md and .venv
source .venv/bin/activate
export PATH="$HOME/bin:$PATH"
uv pip install statsmodels          # §§4, 6 and 7 need it; lab-00 does not install it
plink2 --pfile labs/data/chr22_qc --export A --out labs/data/chr22_qc   # 0/1/2 dosage matrix
```

## What you'll be able to do

- Compute variance and covariance from the definition, explain why variance rather than SD is the
  additive quantity, and use V(X+Y) = V(X) + V(Y) + 2Cov(X,Y) to say what the cross term is in a
  real genome
- Distinguish covariance from correlation, and produce a case with total dependence and zero
  correlation
- Fit a least-squares line from the definition, and read a `statsmodels` regression table —
  slope in units, R² as variance explained, residuals as what is left
- Explain why regression to the mean is a property of imperfect correlation rather than a force,
  and convert an offspring-on-parent slope into h² — midparent directly, single parent doubled
- Explain what "adjusting for a covariate" does geometrically, and predict the direction a
  coefficient moves when you add one
- Read an odds ratio correctly, and say when it does and does not approximate a risk ratio
- Take an observed association and enumerate the four non-causal explanations — chance,
  confounding, reverse causation, selection — naming the genetics design that addresses each, and
  tell a confounder from a collider by which side of the variables it sits on

## The core idea

Variance is the average squared distance from the mean. Squaring looks arbitrary — why not average
absolute distance? Here is the only justification that matters for genetics:

**Variances of independent contributions add. Nothing else does.**

If a trait is a genetic part plus an environmental part and the two are independent, the trait's
variance is exactly the sum of their variances. If it is the sum of a thousand small allelic
contributions, its variance is the sum of a thousand small variances. Standard deviations do not
do this. Mean absolute deviations do not. Ranges do not.

That additivity is why Fisher could write a phenotype as a sum of components and then *partition
its variance among them* — the entire subject of
[Ch 30](../part-06-quantitative-genetics/30-quantitative-traits.md). Heritability is a fraction of
a variance because variance is the only spread measure that can be divided into shares.

The second idea follows from the first. When contributions are *not* independent, the sum picks up
a cross term, and that cross term is the covariance — not a separate topic but the correction that
appears the moment additivity fails. Correlation is covariance rescaled so you can compare it
across traits; regression is covariance rescaled so you can *predict* with it. Three ideas, one
object.

---

## 1. Variance and standard deviation, and what each carries

For a sample *x*₁ … *x*<sub>n</sub>:

```
mean       x̄  = (1/n) Σ xᵢ
variance   s² = (1/(n−1)) Σ (xᵢ − x̄)²
sd         s  = √s²
```

The *n*−1 is Bessel's correction: dividing by *n* underestimates, because deviations are taken from
the sample mean rather than the true mean, which is itself pulled toward the data
([S3](./S3-sampling-and-estimation.md)). In numpy this is `ddof=1`, and **numpy's default is
`ddof=0`** — a silent factor of n/(n−1) that matters at small *n* and never at large *n*.

Fix the units in your head. If *x* is in reads, the variance is in **reads²** and the SD is in
**reads**. Variance is not on the scale of the data; SD is. That is the whole trade: SD is
interpretable, variance is additive.

Real sequencing data, the E. coli alignment from [lab-02](../labs/lab-02-alignment.md):

```python
import numpy as np, pysam

bam = pysam.AlignmentFile("labs/data/aln606.bam", "rb")
W = 1000                                    # 1 kb windows
nwin = bam.lengths[0] // W
starts = np.array([r.reference_start for r in bam.fetch(until_eof=True)
                   if not (r.is_unmapped or r.is_secondary or r.is_supplementary)])
counts = np.bincount(starts // W, minlength=nwin)[:nwin].astype(float)

n = len(counts)
mean = counts.sum() / n
var  = ((counts - mean) ** 2).sum() / (n - 1)     # ddof=1: the sample variance

print(f"windows          {n}")
print(f"mean             {mean:.2f} reads / kb")
print(f"variance         {var:.2f} reads^2")
print(f"sd               {np.sqrt(var):.2f} reads")
print(f"numpy agrees     {counts.var(ddof=1):.2f}  {counts.std(ddof=1):.2f}")
print(f"variance / mean  {var/mean:.2f}      (Poisson would give 1.00)")
```

```
windows          4629
mean             42.88 reads / kb
variance         127.84 reads^2
sd               11.31 reads
numpy agrees     127.84  11.31
variance / mean  2.98      (Poisson would give 1.00)
```

Read the last line. If reads landed independently and uniformly, window counts would be Poisson and
the variance would equal the mean ([S2](./S2-distributions.md)). It is **three times** the mean.
Real coverage is *overdispersed* — GC bias, mappability, duplicates, local prep effects — so any
tool assuming Poisson coverage (naive CNV callers, some depth filters) is badly miscalibrated here.
The variance-to-mean ratio is a one-line diagnostic worth running on every new dataset.

## 2. Why variance is the quantity that adds

The identity that the rest of this chapter, and the whole of Part 6, rests on:

```
Var(X + Y) = Var(X) + Var(Y) + 2·Cov(X, Y)

Cov(X, Y) = E[(X − E X)(Y − E Y)]        Cov(X, X) = Var(X)
```

The derivation is one line of expanding a square, and the shape is exactly (*a*+*b*)² = *a*² + *b*²
+ 2*ab*. Two consequences:

**If X and Y are independent, Cov = 0, and variances add exactly.** This is the licence for
*V*<sub>P</sub> = *V*<sub>G</sub> + *V*<sub>E</sub>, and it is why
[Ch 30 §3](../part-06-quantitative-genetics/30-quantitative-traits.md) is so insistent that
dropping 2Cov(*G*,*E*) is an *assumption*, not a simplification.

**Standard deviations never add.** Two independent contributions each with SD 3 give a sum with
variance 9 + 9 = 18, so SD √18 = 4.24 — not 6. Combine SDs by squaring, adding, and taking the
root, always.

Here is the cross term made concrete on real human genotypes. Load the 1000 Genomes chr22 dosage
matrix exported above, take 200 random SNPs, and build a crude unweighted polygenic score by
summing allele counts:

```python
import numpy as np, pandas as pd

raw   = pd.read_csv("labs/data/chr22_qc.raw", sep="\t")
G     = raw.iloc[:, 6:].to_numpy(dtype=float)      # 2503 samples x 3564 SNPs, dosage 0/1/2
iid   = raw["IID"].to_numpy()
panel = pd.read_csv("labs/data/panel.txt", sep="\t").set_index("sample")
pop   = panel.loc[iid, "super_pop"].to_numpy()
print("genotype matrix", G.shape)

rng  = np.random.default_rng(0)
sel  = rng.choice(G.shape[1], 200, replace=False)   # 200 SNPs = a toy polygenic score
X    = G[:, sel]
score = X.sum(axis=1)                               # unweighted allele count

sum_of_var = X.var(axis=0, ddof=1).sum()
var_of_sum = score.var(ddof=1)
C          = np.cov(X, rowvar=False)
cross      = C.sum() - np.trace(C)                  # = 2 * sum of all covariances

print(f"sum of variances      {sum_of_var:8.2f}")
print(f"variance of the sum   {var_of_sum:8.2f}   ({var_of_sum/sum_of_var:.2f}x larger)")
print(f"2 * sum of cov        {cross:8.2f}")
print(f"identity check        {sum_of_var + cross:8.2f}")

shuffled = np.column_stack([rng.permutation(X[:, j]) for j in range(X.shape[1])])
print(f"after shuffling each column independently: "
      f"var of sum {shuffled.sum(1).var(ddof=1):.2f} vs sum of var {shuffled.var(0,ddof=1).sum():.2f}")
```

```
genotype matrix (2503, 3564)
sum of variances         38.56
variance of the sum     132.62   (3.44x larger)
2 * sum of cov           94.06
identity check          132.62
after shuffling each column independently: var of sum 39.01 vs sum of var 38.56
```

**Seventy-one percent of the variance of that score is cross term** — single-locus variances
account for only 38.6 of 132.6. The rest is covariance between loci: linkage disequilibrium
([Ch 29](../part-05-population-genetics/29-linkage-disequilibrium.md)) plus the fact that these
2,503 people come from five continental groups whose allele frequencies differ, which correlates
every locus with every other. Shuffle each column independently and it vanishes, as it must.

Every formula that writes *V*<sub>A</sub> = Σ 2*p*<sub>i</sub>*q*<sub>i</sub>α<sub>i</sub>² —
including the one in [Ch 30 §4](../part-06-quantitative-genetics/30-quantitative-traits.md) —
carries the clause "assuming linkage equilibrium", and this is the number that clause is hiding.
Assortative mating inflates it further, which is why *h*² is genuinely larger in an assortatively
mating population than in the same population mating at random
([Ch 31 §2](../part-06-quantitative-genetics/31-heritability-and-selection.md)).

## 3. Covariance, correlation, and the word "linear"

Covariance has the units of *X* times the units of *Y*, which makes its magnitude uninterpretable.
Divide by both standard deviations and you get the **Pearson correlation**:

```
r = Cov(X, Y) / (s_X · s_Y)          −1 ≤ r ≤ 1
```

Dividing by the SDs makes *r* dimensionless and invariant to any change of scale or origin: measure
height in inches or metres, code a genotype as 0/1/2 or as 0/1000/2000, and *r* does not move.

```python
pvar = pd.read_csv("labs/data/chr22_qc.pvar", sep="\t", comment="#", header=None,
                   names=["CHROM","POS","ID","REF","ALT","QUAL","INFO"])
pos  = pvar["POS"].to_numpy()

E = G[pop == "EUR"]                       # 503 European-ancestry samples
j, k = 1394, 1410                         # two SNPs 6,845 bp apart
x, y = E[:, j], E[:, k]

cov = ((x - x.mean()) * (y - y.mean())).sum() / (len(x) - 1)
r   = cov / (x.std(ddof=1) * y.std(ddof=1))
print(f"chr22:{pos[j]:,} and chr22:{pos[k]:,}   {pos[k]-pos[j]:,} bp apart")
print(f"  alt allele freqs   {x.mean()/2:.3f}  {y.mean()/2:.3f}")
print(f"  cov                {cov:+.4f}   (units: allele-copies^2)")
print(f"  corr               {r:+.4f}")
print(f"  numpy              {np.cov(x,y)[0,1]:+.4f}  {np.corrcoef(x,y)[0,1]:+.4f}")
print(f"  r^2 (this is LD)   {r**2:.4f}")
print(f"rescale SNP 1 to 'copies per 1000':")
print(f"  cov  {np.cov(x*1000, y)[0,1]:+.3f}   corr {np.corrcoef(x*1000, y)[0,1]:+.4f}")
```

```
chr22:20,393,963 and chr22:20,400,808   6,845 bp apart
  alt allele freqs   0.477  0.429
  cov                +0.4238   (units: allele-copies^2)
  corr               +0.7957
  numpy              +0.4238  +0.7957
  r^2 (this is LD)   0.6331
rescale SNP 1 to 'copies per 1000':
  cov  +423.812   corr +0.7957
```

The covariance moved by exactly 1,000×; the correlation did not move at all.

And note what the squared correlation *is* here. These two variants sit 6.8 kb apart and their
dosage columns correlate at r = +0.80, where two sites whose alleles were combined at random
would give 0. Population genetics has a name for that non-independence — it is called **linkage
disequilibrium** — and the statistic the field measures it with is exactly this r², here 0.6331.
It is a property of a population at a moment in time rather than of the chromosome;
[Ch 29](../part-05-population-genetics/29-linkage-disequilibrium.md) develops what creates it,
what grinds it back down and why that distinction is worth holding. When you reach it, the one
thing to carry forward from here is that the LD statistic is not *analogous to* a squared
correlation between genotype columns — it is one, computed exactly as above. That is why
LD pruning is literally decorrelation, and why tagging a causal variant at r² = 0.63 costs a
factor of 0.63 in GWAS non-centrality.

### Correlation measures linear association, and only linear association

This is the most consequential limitation in the chapter, and genomics supplies a perfect example.
Take the chr22 SNP whose allele frequency in Europeans is closest to 0.5, and ask how genotype
dosage correlates with *being heterozygous*:

```python
from scipy import stats

af  = E.mean(axis=0) / 2
i   = int(np.argmin(np.abs(af - 0.5)))       # the SNP closest to 50% frequency
d   = E[:, i]                                # dosage:  0, 1, 2
het = (d == 1).astype(float)                 # heterozygous?  1 / 0

print(f"chr22:{pos[i]:,}   alt allele frequency {af[i]:.4f}")
print(f"genotype counts (0/1/2)  {np.bincount(d.astype(int))}")
print(f"corr(dosage, heterozygous)   {np.corrcoef(d, het)[0,1]:+.6f}")
print(f"pearsonr p-value             {stats.pearsonr(d, het)[1]:.3f}")
print("het given dosage 0/1/2:      ", [sorted(set(het[d == v])) for v in (0, 1, 2)])
grp  = np.array([het[d == v].mean() for v in (0, 1, 2)])
w    = np.array([(d == v).mean()   for v in (0, 1, 2)])
print(f"eta^2 (variance of het explained by dosage) = {(w*(grp-het.mean())**2).sum()/het.var():.4f}")
```

```
chr22:20,682,316   alt allele frequency 0.5000
genotype counts (0/1/2)  [123 257 123]
corr(dosage, heterozygous)   +0.000000
pearsonr p-value             1.000
het given dosage 0/1/2:       [[np.float64(0.0)], [np.float64(1.0)], [np.float64(0.0)]]
eta^2 (variance of het explained by dosage) = 1.0000
```

Heterozygosity is a **deterministic function** of dosage — η² = 1.0000, knowing the dosage tells
you the heterozygosity with certainty — and the correlation is exactly zero, with a p-value of
exactly 1. The relationship is a perfect inverted V, and a straight line through an inverted V has
slope zero.

Zero correlation means *no linear trend*. It does not mean independence, it does not mean "no
relationship", and a non-significant correlation is not evidence of one. Anywhere a genomic
quantity is U-shaped or hump-shaped in another — variance against mean expression, effect size
against allele frequency, coverage against GC — Pearson correlation will under-report and
sometimes erase the relationship. Plot first.

## 4. Least squares: fitting, and reading, a line

Fit *y* ≈ *b*₀ + *b*₁*x* by choosing the coefficients that minimise Σ(*y*ᵢ − *b*₀ − *b*₁*x*ᵢ)².
Differentiating and setting to zero gives the closed form, which is again just covariance:

```
b₁ = Cov(x, y) / Var(x)          b₀ = ȳ − b₁ x̄
```

The slope is a covariance rescaled by the variance of the predictor. Its **units are units of y per
unit of x** — always state them; a slope without units is uninterpretable. The intercept is the
fitted value at *x* = 0, which is meaningless unless *x* = 0 is meaningful.

A genuinely useful genomics regression: across every SNP on chr22, regress the **observed**
heterozygote frequency on the Hardy–Weinberg **expectation** 2*pq*
([Ch 26](../part-05-population-genetics/26-hardy-weinberg.md)). If the sample were one randomly
mating population, the slope would be 1.

```python
import statsmodels.api as sm

def het_pair(mask):
    X = G[mask]
    p = X.mean(axis=0) / 2
    keep = (p > 0.01) & (p < 0.99)
    return 2 * p[keep] * (1 - p[keep]), (X == 1).mean(axis=0)[keep]

x, y = het_pair(np.ones(len(pop), bool))         # all 2,503 samples pooled

# --- least squares from the definition, three lines ---
b1 = ((x - x.mean()) * (y - y.mean())).sum() / ((x - x.mean())**2).sum()
b0 = y.mean() - b1 * x.mean()
fit, resid = b0 + b1 * x, y - (b0 + b1 * x)
r2 = 1 - (resid**2).sum() / ((y - y.mean())**2).sum()
print(f"by hand      slope {b1:.4f}   intercept {b0:+.5f}   R^2 {r2:.4f}")
print(f"corr(x,y)^2  {np.corrcoef(x, y)[0,1]**2:.4f}   <- identical, by construction")

lr = stats.linregress(x, y)
print(f"linregress   slope {lr.slope:.4f}   intercept {lr.intercept:+.5f}   "
      f"R^2 {lr.rvalue**2:.4f}   se {lr.stderr:.4f}   p {lr.pvalue:.2e}")

m = sm.OLS(y, sm.add_constant(x)).fit()
print(f"statsmodels  slope {m.params[1]:.4f}   intercept {m.params[0]:+.5f}   R^2 {m.rsquared:.4f}")
print(f"residual sd  {resid.std(ddof=2):.5f}    n = {len(x)} SNPs")

print("\n           slope   1 - slope   R^2      n SNPs")
for g in ["ALL", "AFR", "EUR", "EAS", "SAS", "AMR"]:
    mask = np.ones(len(pop), bool) if g == "ALL" else (pop == g)
    xg, yg = het_pair(mask)
    f = stats.linregress(xg, yg)
    print(f"  {g:5s}   {f.slope:.4f}   {1-f.slope:+.4f}    {f.rvalue**2:.4f}   {len(xg)}")
```

```
by hand      slope 0.9587   intercept -0.00018   R^2 0.9978
corr(x,y)^2  0.9978   <- identical, by construction
linregress   slope 0.9587   intercept -0.00018   R^2 0.9978   se 0.0008   p 0.00e+00
statsmodels  slope 0.9587   intercept -0.00018   R^2 0.9978
residual sd  0.00761    n = 3564 SNPs

           slope   1 - slope   R^2      n SNPs
  ALL     0.9587   +0.0413    0.9978   3564
  AFR     1.0024   -0.0024    0.9961   2816
  EUR     1.0123   -0.0123    0.9925   2272
  EAS     1.0315   -0.0315    0.9914   2221
  SAS     0.9515   +0.0485    0.9886   2302
  AMR     1.0086   -0.0086    0.9932   2568
```

Read every number.

**Slope 0.9587, pooled.** Observed heterozygosity is 4.13% *below* Hardy–Weinberg expectation, at
every frequency. That is the Wahlund effect
([Ch 26 §8](../part-05-population-genetics/26-hardy-weinberg.md)), and because the shortfall is
proportional rather than additive, 1 − slope estimates *F*<sub>ST</sub> directly: **0.041 across
these five continental groups.** Split the sample by super-population and four of the five deficits
vanish — AFR 1.0024, EUR 1.0123, EAS 1.0315, AMR 1.0086 all sit at or above 1. Most of the pooled
shortfall is mixing, not inbreeding.

**SAS is the exception, and it is the more useful number.** It still sits at 0.9515, and splitting
it into its five 1000 Genomes populations removes only about a quarter of that deficit: BEB 0.9581,
GIH 0.9707, ITU 1.0062, PJL 0.9705, STU 0.9084 — mean 0.963, against 0.9515 pooled. Nor is the
residue small-sample bias, and it is worth seeing why not. Observed heterozygosity is an unbiased
estimator, but E[2*p̂q̂*] = 2*pq*·(2*n*−1)/(2*n*), so estimating *p* from the same ~100 people
shrinks the *predictor* by about 0.5% and biases this slope **upward**: simulate panmictic
genotypes at these sample sizes and these allele frequencies and the slope comes back at 1.005, not
0.95. STU at 0.908 is nowhere near that null.

Something inside each labelled population is depressing heterozygosity, and South Asian panels are
where you would expect it — both jati-level endogamy and consanguineous marriage are documented
there, and both raise homozygosity. **This regression cannot tell you which.** Structure and
inbreeding have the same algebraic form ([Ch 26 §8](../part-05-population-genetics/26-hardy-weinberg.md)):
a proportional heterozygote deficit at every frequency. So 1 − slope reads equally well as
*F*<sub>ST</sub> among unlabelled subgroups or as *F*<sub>IS</sub> from consanguinity, and this fit
will not choose between them. Separating them takes runs of homozygosity or pedigrees, not a line.
A slope is evidence of a deficit; the *cause* of a deficit is a separate argument.

**The pooled figure is an underestimate, and the reason is instructive.** `chr22_qc` was built with
`--hwe 1e-6`, which removed 884 variants — precisely the ones most distorted by pooling. Re-export
without that filter (`plink2 --pfile labs/data/chr22 --keep labs/data/keep.txt --maf 0.01 --export A`) and the slope
falls to **0.9274**, i.e. *F*<sub>ST</sub> = 0.073, in line with the AFR–EUR Hudson *F*<sub>ST</sub>
of 0.065 computed in [lab-07](../labs/lab-07-population-genetics.md). A QC step designed to catch
genotyping error silently removed the signal you were trying to measure. Check what your filters
deleted.

**Intercept −0.00018 heterozygotes.** Essentially zero, as it should be: a monomorphic site
(2*pq* = 0) has no heterozygotes.

**R² = 0.9978, identical to the squared correlation.** Not a coincidence, and the derivation is the
insight. Because least squares makes residuals orthogonal to fitted values, the cross term in the
total sum of squares vanishes:

```
Σ(y − ȳ)²  =  Σ(ŷ − ȳ)²  +  Σ(y − ŷ)²
  total          explained      residual

R² = explained/total = 1 − residual/total
```

Substituting *ŷ* − *ȳ* = *b*₁(*x* − *x̄*) and *b*₁ = Cov/Var(*x*) collapses the ratio to
Cov(*x*,*y*)²/(Var *x* · Var *y*) = **r²**. R² is *literally* the squared correlation in simple
regression, so "proportion of variance explained" is the correct reading of both. In multiple
regression it is the squared correlation between *y* and its fitted values, and the reading holds.

**Residual SD 0.00761.** A typical SNP sits within 0.008 heterozygotes of the line. Residuals are
where the biology hides: the large ones here are variants with unusual differentiation, or a
genotyping problem. Always look at them.

## 5. Regression to the mean, and where the word came from

Galton, 1886, measuring 928 adult children against the average of their parents' heights, found
that tall parents had tall children — but *less* tall, by a consistent factor of about two-thirds.
He called it "regression towards mediocrity". The statistical technique is named after a genetics
result.

It is also the estimator [Ch 31](../part-06-quantitative-genetics/31-heritability-and-selection.md)
uses. Since Var(midparent) = *V*<sub>P</sub>/2 under random mating, and
Cov(offspring, midparent) = ½*V*<sub>A</sub>:

```
b = Cov(P_offspring, MP) / Var(MP) = (½ V_A) / (½ V_P) = V_A/V_P = h²
```

**The offspring–midparent slope is the narrow-sense heritability**, with no scaling constant.
Galton's two-thirds was an estimate of *h*² for human height before anyone knew what a gene was.
Confirm the algebra by simulation — this block is **simulated data**, not a measurement:

```python
# SIMULATED, not real data: 20,000 families, height-like trait, h^2 = 0.8
rng = np.random.default_rng(31)
n, h2, VP, mu = 20_000, 0.80, 49.0, 170.0        # VP = 49 cm^2  ->  sd 7 cm
VA, VE = h2 * VP, (1 - h2) * VP

A_s = rng.normal(0, np.sqrt(VA), n)              # sire breeding value
A_d = rng.normal(0, np.sqrt(VA), n)              # dam  breeding value
A_o = (A_s + A_d) / 2 + rng.normal(0, np.sqrt(VA / 2), n)   # + Mendelian sampling

P_s = mu + A_s + rng.normal(0, np.sqrt(VE), n)
P_d = mu + A_d + rng.normal(0, np.sqrt(VE), n)
P_o = mu + A_o + rng.normal(0, np.sqrt(VE), n)
MP  = (P_s + P_d) / 2

print(f"Var(one parent) {P_s.var():.2f}   Var(midparent) {MP.var():.2f}   Var(offspring) {P_o.var():.2f}")
print(f"offspring on midparent   slope {stats.linregress(MP, P_o).slope:.4f}   <- h^2 = {h2}")
print(f"offspring on one parent  slope {stats.linregress(P_s, P_o).slope:.4f}   <- h^2/2 = {h2/2}")
print(f"parent on OFFSPRING      slope {stats.linregress(P_o, P_s).slope:.4f}   <- same size, backwards in time")

sd_MP, sd_P = MP.std(), P_o.std()
tall = MP > mu + 2 * sd_MP
print(f"\nfamilies with midparent > +2 sd: n = {tall.sum()}")
print(f"  their midparents average {(MP[tall].mean()-mu)/sd_MP:+.2f} sd")
print(f"  their children  average {(P_o[tall].mean()-mu)/sd_P:+.2f} sd")
tallkid = P_o > mu + 2 * sd_P
print(f"children  > +2 sd: their midparents average {(MP[tallkid].mean()-mu)/sd_MP:+.2f} sd")
```

```
Var(one parent) 48.91   Var(midparent) 24.42   Var(offspring) 48.61
offspring on midparent   slope 0.7996   <- h^2 = 0.8
offspring on one parent  slope 0.3973   <- h^2/2 = 0.4
parent on OFFSPRING      slope 0.3997   <- same size, backwards in time

families with midparent > +2 sd: n = 446
  their midparents average +2.39 sd
  their children  average +1.30 sd
children  > +2 sd: their midparents average +1.30 sd
```

The midparent slope recovers *h*² = 0.80 to two decimals; the single-parent slope is half of it,
because regressing on one parent doubles the predictor variance while leaving the covariance
unchanged. Multiply a single-parent slope by 2; do not multiply a midparent slope.

Now the last two lines, which are the whole point. Families whose midparents averaged +2.39 SD
produced children averaging +1.30 SD. And children who were themselves +2 SD had midparents
averaging +1.30 SD — **the regression is exactly as strong going backwards in time as forwards.**
No biological force pulls children toward the mean, because no force can pull parents toward their
children's mean retrospectively. Regression to the mean is a property of imperfect correlation:
conditioning on an extreme value of one variable selects partly for true extremity and partly for
lucky noise, and the noise does not transmit.

That single fact explains a family of genomics results that otherwise look like separate phenomena:
the **winner's curse** in GWAS, where the discovery-sample effect size of a hit is systematically
larger than its replication effect size
([Ch 51](../part-11-human-and-statistical-genomics/51-gwas.md)); the **Beavis effect** in QTL
mapping, where estimated QTL effects shrink as sample size grows
([Ch 32 §8](../part-06-quantitative-genetics/32-mapping-quantitative-traits.md)); and the routine
disappointment of any "top *N* genes" list on a second dataset. Select on a noisy statistic, and
you have selected for noise.

## 6. Multiple regression: what "controlling for" actually does

Fit *y* ≈ *b*₀ + *b*₁*x* + *b*₂*z*. The coefficient *b*₁ is no longer "the slope of *y* on *x*". It
is:

> **the slope of *y* on the part of *x* that *z* cannot explain.**

Not a metaphor — a theorem (Frisch–Waugh–Lovell). Regress *x* on *z* and keep the residuals; do the
same for *y*; regress one set of residuals on the other. The slope is *b*₁ from the multiple
regression, exactly. Geometrically, "adjusting for *z*" projects both variables onto the subspace
orthogonal to *z* and works there. Two consequences:

- **A covariate changes a coefficient only if it is correlated with the predictor.** If *z* is
  uncorrelated with *x*, *b*₁ does not move at all. If strongly correlated, *b*₁ can shrink to
  nothing, grow, or flip sign.
- **The adjustment is only as good as the measurement.** Adjusting for a noisy proxy removes only
  the part of the confounder the proxy captured. Residual confounding is the norm.

Here it is on real 1000 Genomes genotypes with the phenotype from
[lab-08](../labs/lab-08-gwas.md) — a coin flip whose bias depends only on ancestry, so the true
genetic effect of every SNP is exactly zero:

```python
import random, statsmodels.api as sm
pcs = pd.read_csv("labs/data/chr22_pca.eigenvec", sep="\t").rename(columns={"#IID":"IID"}).set_index("IID")
PC  = pcs.loc[iid, [f"PC{k}" for k in range(1,11)]].to_numpy()

random.seed(42)
risk = {"AFR":0.70, "EUR":0.30, "EAS":0.30, "SAS":0.30, "AMR":0.30}
y = np.array([2 if random.random() < risk[p] else 1 for p in pop], float) - 1
print(f"{int(y.sum())} cases, {int((1-y).sum())} controls; true genetic effect = 0 everywhere")

x   = G[:, 2026]                             # chr22:20,598,684
afr = (pop == "AFR").astype(float)           # the actual confounder

print(f"\ncorr(genotype, AFR) {np.corrcoef(x,afr)[0,1]:+.3f}   "
      f"corr(phenotype, AFR) {np.corrcoef(y,afr)[0,1]:+.3f}   "
      f"corr(genotype, phenotype) {np.corrcoef(x,y)[0,1]:+.3f}")
print("alt allele frequency by group:")
for g in ["AFR","AMR","EAS","EUR","SAS"]:
    print(f"   {g}  {x[pop==g].mean()/2:.3f}")

def show(label, cols):
    m = sm.OLS(y, sm.add_constant(np.column_stack(cols))).fit()
    print(f"{label:28s} beta {m.params[1]:+.4f}  se {m.bse[1]:.4f}  "
          f"t {m.tvalues[1]:+7.2f}  p {m.pvalues[1]:.2e}")
    return m
m0 = show("y ~ genotype",             [x])
m1 = show("y ~ genotype + AFR",       [x, afr])
m2 = show("y ~ genotype + PC1",       [x, PC[:,0]])
m3 = show("y ~ genotype + PC1..PC10", [x, PC])

rx = sm.OLS(x, sm.add_constant(afr)).fit().resid
ry = sm.OLS(y, sm.add_constant(afr)).fit().resid
print(f"\nresidual-on-residual slope {np.sum(rx*ry)/np.sum(rx*rx):+.6f}"
      f"   multiple-regression coefficient {m1.params[1]:+.6f}")
```

```
999 cases, 1504 controls; true genetic effect = 0 everywhere

corr(genotype, AFR) -0.553   corr(phenotype, AFR) +0.382   corr(genotype, phenotype) -0.232
alt allele frequency by group:
   AFR  0.766
   AMR  0.973
   EAS  0.995
   EUR  0.994
   SAS  0.996
y ~ genotype                 beta -0.3171  se 0.0266  t  -11.94  p 5.29e-32
y ~ genotype + AFR           beta -0.0411  se 0.0303  t   -1.36  p 1.74e-01
y ~ genotype + PC1           beta -0.2903  se 0.0276  t  -10.53  p 2.18e-25
y ~ genotype + PC1..PC10     beta -0.0793  se 0.0306  t   -2.59  p 9.69e-03

residual-on-residual slope -0.041105   multiple-regression coefficient -0.041105
```

The residual-on-residual slope matches the multiple-regression coefficient to six decimals. That
identity is what "controlling for" means, operationally.

### Confounding, in arithmetic

The naive coefficient is p = 5 × 10⁻³²; the adjusted one is p = 0.17. Nothing about the biology
changed — there was never any biology. The structure is:

```
        AFR ancestry (z)
         /            \
   allele freq       disease risk
   0.766 vs 0.99     0.70 vs 0.30
        (x)              (y)
```

*z* causes both *x* and *y*; there is no arrow from *x* to *y*. The bias has a closed form: if the
true model is *y* = β*x* + γ*z* + ε and you omit *z*, you estimate

```
b_naive = β + γ · δ            where δ = slope of regressing z on x
```

Substituting the fitted values: β = −0.0411, γ = +0.4066, δ = −0.6788, so
−0.0411 + (0.4066)(−0.6788) = **−0.3171**, which is the naive coefficient to four decimals. The
entire association is manufactured by the product of two real correlations, neither of which
involves causation.

> **Adjusting for a covariate does not remove the confounder — it removes the component of the
> confounder that the covariate measures.** PC1 alone recovers only part of the bias here
> (−0.317 → −0.290); ten PCs recover most of it (−0.079); the true ancestry label recovers all of
> it (−0.041). In a real study you never have the true label, and what survives ten PCs is exactly
> the residual stratification that genomic control, LD-score regression and within-family designs
> exist to catch ([Ch 51](../part-11-human-and-statistical-genomics/51-gwas.md)).

Covariates are not free. Each costs a degree of freedom, and one correlated with your predictor
inflates the coefficient's standard error — here from 0.0266 to 0.0306. And a covariate on the
causal path *between* predictor and outcome (a mediator) must **not** be adjusted for: doing so
removes the effect you are estimating. "Control for everything you measured" is not a strategy;
each covariate needs a reason.

## 7. Logistic regression, in one page

Case/control is the commonest genomics outcome, and linear regression handles it badly: it predicts
probabilities below 0 and above 1, and its residual variance is inherently heteroscedastic. The fix
is to model a transformation. **Logistic regression** makes the log-odds linear:

```
odds  = P / (1 − P)
logit(P) = log[P/(1 − P)] = b₀ + b₁x + b₂z + …
```

The logit maps (0,1) onto the whole real line, so no fitted probability can escape the interval.
Coefficients are on the log-odds scale and **exp(b₁) is an odds ratio**: the multiplicative change
in the odds of being a case per one-unit increase in *x* — per extra copy of the allele, for a
dosage-coded SNP. There is no closed form, so the fit is iterative maximum likelihood
([S6](./S6-likelihood-and-bayes.md)).

```python
carrier = (x < 2).astype(int)                     # >= 1 copy of the minor allele
tab = pd.crosstab(pd.Series(carrier, name="minor allele carrier"),
                  pd.Series(y.astype(int), name="case"))
print(tab)
a, b = tab.loc[1,1], tab.loc[1,0]
c, d = tab.loc[0,1], tab.loc[0,0]
print(f"\nrisk in carriers      {a/(a+b):.3f}      odds {a/b:.3f}")
print(f"risk in non-carriers  {c/(c+d):.3f}      odds {c/d:.3f}")
print(f"risk ratio {(a/(a+b))/(c/(c+d)):.2f}      odds ratio {(a/b)/(c/d):.2f}")

for label, cols in [("carrier alone",      [carrier.astype(float)]),
                    ("carrier + AFR",      [carrier.astype(float), afr]),
                    ("dosage alone",       [x]),
                    ("dosage + AFR",       [x, afr]),
                    ("dosage + PC1..PC10", [x, PC])]:
    m  = sm.Logit(y, sm.add_constant(np.column_stack(cols))).fit(disp=0)
    lo, hi = m.conf_int()[1]
    print(f"{label:20s} log-odds {m.params[1]:+.4f}  OR {np.exp(m.params[1]):.3f} "
          f"(95% CI {np.exp(lo):.3f}-{np.exp(hi):.3f})  p {m.pvalues[1]:.2e}")
```

```
case                     0    1
minor allele carrier
0                     1405  768
1                       99  231

risk in carriers      0.700      odds 2.333
risk in non-carriers  0.353      odds 0.547
risk ratio 1.98      odds ratio 4.27
carrier alone        log-odds +1.4513  OR 4.269 (95% CI 3.320-5.488)  p 1.07e-29
carrier + AFR        log-odds +0.2589  OR 1.295 (95% CI 0.952-1.764)  p 1.00e-01
dosage alone         log-odds -1.3541  OR 0.258 (95% CI 0.202-0.329)  p 1.02e-27
dosage + AFR         log-odds -0.2017  OR 0.817 (95% CI 0.611-1.094)  p 1.75e-01
dosage + PC1..PC10   log-odds -0.3642  OR 0.695 (95% CI 0.522-0.925)  p 1.26e-02
```

Three things to take from this.

**The 2×2 table reproduces the model exactly.** exp(1.4513) = 4.269 = (231/99)/(768/1405). A
logistic coefficient for a binary predictor with no covariates *is* the log cross-product ratio,
which is the fastest way to see what the model is doing.

**The odds ratio is 4.27 while the risk ratio is 1.98.** The odds ratio always exaggerates, and the
exaggeration grows with outcome frequency; here the outcome is 35–70% common, so the gap is huge.
"OR ≈ RR for rare outcomes" is exactly right and exactly conditional — at 1% prevalence they agree
to within a percent, at 50% not at all. Reporting a GWAS OR of 1.15 for a common disease as "15%
more risk" is the commonest misreading of a GWAS table.

**Coefficients are on the log scale, so OR 0.258 and OR 3.88 are the same effect reversed.** Always
report which allele is the reference. Intervals are built on the log scale and exponentiated, which
is why they are asymmetric (0.202–0.329 around 0.258).

For a genome-wide scan use `plink2 --glm` rather than looping `statsmodels`: same model, orders of
magnitude faster, with covariate handling and the Firth fallback for separated rare variants.

## 8. Correlation is not causation, done properly

The slogan is useless because it does not tell you what to do. The useful version enumerates the
alternatives. If *x* and *y* are associated and *x* does not cause *y*, then **at least one of four
things is true** — at least one, not exactly one: an association can be part noise, part
confounding and part selection artefact at the same time, and the four fixes are not
interchangeable.

| Explanation | What it means | The genetics design that addresses it |
|---|---|---|
| **Chance** | The association is sampling noise | Pre-specified genome-wide threshold (5 × 10⁻⁸), independent replication cohort ([S4](./S4-hypothesis-testing.md), [S7](./S7-high-dimensional-data.md)) |
| **Confounding** | A third variable causes both | Ancestry PCs and mixed models; within-family / sibling designs, which are immune to any confounder shared by siblings ([Ch 51](../part-11-human-and-statistical-genomics/51-gwas.md)) |
| **Reverse causation** | *y* causes *x* | Genotype is fixed at conception, so a genotype–trait association cannot run backwards. This is what makes Mendelian randomisation work ([Ch 52](../part-11-human-and-statistical-genomics/52-association-to-mechanism.md)) |
| **Selection / collider bias** | The sample was selected on something *both* variables affect — volunteering, surviving, being diagnosed, being a case | Compare against a population-representative sample; do not condition on a heritable covariate, a mediator, or survival; within-family designs ([Ch 51](../part-11-human-and-statistical-genomics/51-gwas.md), [Ch 53](../part-11-human-and-statistical-genomics/53-polygenic-scores.md)) |

Genetics has an unusually strong hand here. **Reverse causation is structurally impossible for a
germline genotype** — your BMI cannot have changed the allele you inherited — and that single
asymmetry is the entire basis of Mendelian randomisation, which uses genotype as an instrument for
a modifiable exposure precisely because the arrow can only point one way. Chance is handled by
brute force: fix the threshold in advance, replicate independently.

Confounding is the hard one and it does not go away. Population stratification is the version this
chapter demonstrated; assortative mating, genetic nurture (parental genotype acting through the
environment it provides) and residual fine-scale structure all survive PC adjustment, and all
inflate estimates in ways that within-family designs shrink — often substantially for behavioural
and social traits.

**Selection bias is the one people forget, and it is not a special case of confounding.** A
confounder sits *upstream* of both variables; a collider sits *downstream* of both, and
conditioning on it — by adjusting for it, or simply by only recruiting people who have it —
manufactures an association where no causal path and no confounder exists. Genomics is full of
colliders. Biobank participation is heritable and correlates with the traits being studied, so a
volunteer cohort is already conditioned on a downstream variable. Case/control ascertainment
conditions on diagnosis. Conditioning on survival to recruitment age induces associations among
everything that affects mortality. Adjusting for a heritable covariate — BMI in a study of
something BMI also depends on — is the same error committed deliberately, which is why §6's warning
about mediators is this row of the table, not the confounding row. The diagnostic question is
directional: does my covariate (or my recruitment criterion) sit *before* both variables or
*after* them? Adjust for the first; never condition on the second.

One failure is *not* on the list because it is a different kind: an association can be entirely
real and causal and still not identify the gene you think it does. A GWAS hit tags a haplotype, not
a variant ([Ch 52](../part-11-human-and-statistical-genomics/52-association-to-mechanism.md)).

---

## Common misconceptions

| What people think | What's actually true |
|---|---|
| Variance and SD are interchangeable, one is just the square root | They carry different units and only variance is additive. Every variance-partitioning argument in quantitative genetics breaks if you use SD |
| Independent contributions have SDs that add | Variances add; SDs combine as √(s₁² + s₂²). Two SD-3 contributions give SD 4.24, not 6 |
| Correlation zero means no relationship | It means no *linear* relationship. A real chr22 SNP shows correlation exactly 0.000000 between dosage and heterozygosity while heterozygosity is a deterministic function of dosage |
| A high R² means the model is right, and the effect important | R² only says how much variance a straight line captures, and it depends on how much variance the predictor has in *your* sample. A curved relationship can give high R² and wrong predictions; restricting the range collapses R² without moving the slope. Plot the residuals |
| Regression to the mean is a biological force pulling offspring to average | It is a property of imperfect correlation and runs equally in both directions in time. Extreme children have less extreme parents by exactly the same factor |
| The regression coefficient is "the effect of x" | It is the slope of y on the part of x not explained by the other covariates. Add a correlated covariate and it changes — same data, different question |
| Controlling for ancestry PCs removes stratification | It removes the component the PCs capture. Fine-scale and recent structure survives, which is why within-family estimates are routinely smaller |
| An odds ratio of 1.5 means 50% more risk | Only if the outcome is rare. Here a risk ratio of 1.98 appears as an odds ratio of 4.27, because the outcome is common |
| Adding more covariates is safer | Each costs power, correlated ones inflate SEs, and adjusting for a mediator removes the very effect you are estimating |

## Worked example: 770 significant associations from a phenotype with no genetic basis

The phenotype above is a coin flip whose bias depends only on super-population label. Every SNP has
a true effect of exactly zero. Scan all 3,564 variants, adjusting for nothing, then for the PCs,
then for the true confounder — using Frisch–Waugh to do all 3,564 regressions as matrix algebra:

```python
def scan(Z):
    """regress y on every SNP, adjusting for the columns of Z (Frisch-Waugh)."""
    Z  = np.column_stack([np.ones(len(y))] + ([Z] if Z is not None else []))
    P  = Z @ np.linalg.pinv(Z)                       # projection onto the covariates
    ry = y - P @ y
    rG = G - P @ G
    b  = (rG * ry[:, None]).sum(0) / (rG**2).sum(0)
    df = len(y) - Z.shape[1] - 1
    se = np.sqrt(((ry[:, None] - rG*b)**2).sum(0) / df / (rG**2).sum(0))
    return b, 2 * stats.t.sf(np.abs(b/se), df)

for label, Z in [("no covariates", None),
                 ("+ PC1..PC10", PC),
                 ("+ AFR indicator", (pop=="AFR").astype(float)[:,None])]:
    b, p = scan(Z)
    print(f"{label:18s}  p < 5e-8: {int((p<5e-8).sum()):4d}   "
          f"p < 1.4e-5 (Bonferroni): {int((p<0.05/3564).sum()):4d}   min p {p.min():.2e}")
```

```
no covariates       p < 5e-8:  770   p < 1.4e-5 (Bonferroni): 1188   min p 5.29e-32
+ PC1..PC10         p < 5e-8:    0   p < 1.4e-5 (Bonferroni):    0   min p 1.87e-03
+ AFR indicator     p < 5e-8:    0   p < 1.4e-5 (Bonferroni):    0   min p 5.19e-04
```

**770 of 3,564 variants — more than one in five — reach genome-wide significance for a trait with
no genetic cause.** One third of the genotyped variants clear Bonferroni. The smallest p-value is
5 × 10⁻³², a number no reviewer would question. Adjusting for ten principal components takes the
count to zero and the smallest p-value in the whole scan to 1.9 × 10⁻³ — unremarkable across 3,564
tests.

(The linear model here finds 770 where [lab-08](../labs/lab-08-gwas.md)'s logistic regression found
702 on the same data. Different link function, same conclusion — and the fact that the two differ
by 10% while both are catastrophically wrong is itself worth noticing: your choice of model is a
rounding error next to your choice of covariates.)

Trace the chain of this chapter's ideas through that result:

1. Ancestry has **variance** in this sample — the five groups differ.
2. Genotype **covaries** with ancestry at most loci: the top SNP is at frequency 0.766 in Africa
   and 0.99 elsewhere (§3).
3. Phenotype covaries with ancestry by construction, r = +0.38.
4. Two variables that are each driven by a third, with independent noise on top, **covary with each
   other**: the induced correlation is roughly the product of the two, (−0.553)(+0.382) = −0.21,
   against an observed −0.23 (§6). *Correlation is not transitive in general* — corr(*x*,*z*) =
   corr(*y*,*z*) = 0.5 leaves corr(*x*,*y*) free anywhere in [−0.5, 1], zero included. The step
   works here only because ancestry is the *only* thing *x* and *y* share.
5. A **regression** turns that covariance into a slope, a standard error and a p-value, and with
   n = 2,503 the p-value is astronomically small (§4). The p-value is answering "is this
   correlation zero?" — and the correlation genuinely is not zero. The test is not lying. The
   *interpretation* is.
6. Putting the confounder in the model removes the component of the genotype it explains, and the
   slope falls from −0.317 to −0.041 (§6) — exactly the amount the omitted-variable formula
   γδ = (0.4066)(−0.6788) = −0.276 predicts.
7. The residual after adjustment is not zero, and in a real study you would never know how much
   remained (§8).

Nothing here is exotic. It requires only that a trait and a genotype each differ between groups —
which describes most traits and nearly every genotype.

## Where this is used

- [Ch 30](../part-06-quantitative-genetics/30-quantitative-traits.md) — the entire chapter is
  variance partitioning, and *V*<sub>A</sub> is *defined* as the variance of the fitted values from
  regressing genotypic value on allele count. §4 here is that regression
- [Ch 31](../part-06-quantitative-genetics/31-heritability-and-selection.md) — *h*² as the
  offspring–midparent slope (§5), twin correlations, and the breeder's equation
  *R* = *h*²*S*, which is a regression prediction
- [Ch 32](../part-06-quantitative-genetics/32-mapping-quantitative-traits.md) — QTL mapping is
  regression of phenotype on marker genotype; the Beavis effect is §5's regression to the mean
- [Ch 26 §8](../part-05-population-genetics/26-hardy-weinberg.md) and
  [Ch 28](../part-05-population-genetics/28-structure-and-inbreeding.md) — the Wahlund effect and
  *F*<sub>ST</sub>, measured in §4 as a regression slope
- [Ch 29](../part-05-population-genetics/29-linkage-disequilibrium.md) — LD *r*² is the squared
  correlation between two genotype columns (§3)
- [Ch 51](../part-11-human-and-statistical-genomics/51-gwas.md) — every GWAS is §6 and §7 run
  millions of times; population stratification is §6's confounding
- [Ch 53](../part-11-human-and-statistical-genomics/53-polygenic-scores.md) — a PGS is a weighted
  sum of dosages, so its variance is §2's identity including the LD cross term, and its accuracy is
  reported as an R²
- [Ch 47](../part-10-functional-genomics/47-rna-seq.md) — differential expression is a generalised
  linear model per gene; the overdispersion in §1 is why it is negative binomial and not Poisson
- [lab-08](../labs/lab-08-gwas.md) — the worked example above, run with production tools

## Check yourself

**1. Two SNPs each contribute a component with variance 0.5 to a polygenic score, and the two components correlate r = 0.6. What is the variance of the score? What if you had assumed independence?**

<details><summary>Answer</summary>

Cov = r·s₁·s₂ = 0.6 × √0.5 × √0.5 = 0.30.

Var(X+Y) = 0.5 + 0.5 + 2(0.30) = **1.6**.

Assuming independence gives 1.0 — a 37.5% underestimate of the variance, 21% of the SD. This is
why LD matters for polygenic scores: summing per-SNP variances across correlated markers
understates the variance of the score, so LD-pruned or LD-adjusted weights are a correctness
requirement, not a refinement
([Ch 53](../part-11-human-and-statistical-genomics/53-polygenic-scores.md)). The cross term can
also be negative: at r = −0.6 the score's variance is 0.4.

</details>

**2. A regression of offspring phenotype on a single parent's phenotype gives slope 0.31. What is h²? What would the midparent regression have given, and which estimate would you trust more?**

<details><summary>Answer</summary>

Single-parent slope = ½*h*², so *h*² = **0.62**. The midparent slope would have been ≈ 0.62
directly.

Trust midparent more. Its sampling error is smaller, because Var(midparent) = *V*<sub>P</sub>/2
makes the predictor less noisy. And it is robust to assortative mating: correlated mates inflate
Cov(offspring, MP) and Var(MP) by the same factor (1 + ρ), which cancels, while the single-parent
slope becomes ½*h*²(1 + ρ) and is biased upward
([Ch 31 §2](../part-06-quantitative-genetics/31-heritability-and-selection.md)).

Both share the same fatal weakness in humans: parents and offspring share environments, so the
covariance contains shared environment as well as ½*V*<sub>A</sub> and both slopes over-estimate
*h*².

</details>

**3. A collaborator reports "no relationship between coverage depth and GC content, r = 0.04, p = 0.4". What would you check before agreeing?**

<details><summary>Answer</summary>

Whether the relationship is linear. GC bias is characteristically **hump-shaped**: coverage falls
at both GC extremes and peaks in the middle. Pearson *r* fits a straight line through that arch and
returns approximately zero, exactly as §3's real SNP returned exactly zero for a perfectly
deterministic inverted-V.

Plot mean coverage against GC decile. If the curve is humped, quantify it with a non-linear
summary — η² across GC bins, Spearman on the monotone arms separately, or a LOESS fit.

For calibration, the E. coli library in §1 really does have essentially no GC bias: across its
4,629 1 kb windows (GC 50.8% on average, 5th–95th percentile 41.6–56.9%) the correlation between
GC and read count is r = 0.039, R² = 0.0015. So *some* libraries genuinely pass this test — but
"r ≈ 0" is what a flat relationship and a symmetric arch both look like, and only the plot
distinguishes them.

</details>

**4. In a case/control GWAS a SNP has β = 0.42 (p = 3 × 10⁻¹¹) unadjusted, and β = 0.39 (p = 2 × 10⁻⁹) with ten ancestry PCs. In a sibling-based analysis the same SNP gives β = 0.11 (p = 0.03). What is going on, and which estimate is the causal one?**

<details><summary>Answer</summary>

The PCs barely moved the estimate, so the association is not driven by *coarse* continental
structure — PCs capture that well. The within-sibling estimate collapsing to a quarter says a large
part of it *is* confounded, by something siblings share and PCs do not capture: fine-scale or
recent structure, assortative mating, or genetic nurture.

The sibling estimate is closest to causal, because siblings are randomised against each other by
meiosis and any confounder shared by the family is differenced out. It is also the noisiest —
within-family genotype contrasts have far less variance — so a non-significant within-family
estimate is not evidence of no effect.

Report both, and do not call 0.42 an effect size. The gap is routinely 2–3× for behavioural and
social traits and near 1× for molecular ones such as blood biomarkers.

</details>

**5. A GWAS reports OR = 1.30 for a variant, for a disease with 40% lifetime prevalence in the cohort. A press release says carriers have a 30% higher chance of getting the disease. Is it right? What if prevalence were 0.4%?**

<details><summary>Answer</summary>

Wrong at 40% prevalence. The odds ratio exaggerates the risk ratio, and the exaggeration grows
with prevalence. Baseline risk 0.40 gives baseline odds 0.667; multiply by 1.30 to get odds 0.867,
which converts back to a risk of 0.867/1.867 = 0.464. That is a risk ratio of 0.464/0.40 =
**1.16**, not 1.30 — roughly half the claimed increase.

At 0.4% prevalence: baseline odds 0.004016, times 1.30 = 0.005221, risk 0.005194, risk ratio
**1.299**. Indistinguishable from the OR.

The rule: OR ≈ RR when the outcome is rare in *both* exposure groups. Most GWAS diseases are rare
enough; the ones that are not — obesity, hypertension, depression, myopia — are precisely the ones
most written about in the press. Note also that a case/control study cannot estimate absolute risk
at all without an external prevalence, because the case:control ratio was chosen by the
investigator rather than sampled. The odds ratio's invariance to that choice is exactly why
case/control studies report it.

</details>
