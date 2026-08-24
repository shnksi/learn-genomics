# S7 — High-dimensional data

> **Read before:** [Ch 28](../part-05-population-genetics/28-structure-and-inbreeding.md) · **Time:** ~50 min

All code in this chapter runs from the repository root — the directory holding `README.md` and
`.venv` — with `source .venv/bin/activate`, and addresses data as `labs/data/…`.

Every statistical idea in S1–S6 was built around one question: one estimate, one interval, one
test. Genomics almost never asks one question, and the reason is biological. Nobody knows which of
20,000 genes responds to a treatment, or which of ten million variants affects a disease — the
whole point of a genome-wide experiment is that you have no prior good enough to pick. So a GWAS
runs about ten million regressions ([Ch 51](../part-11-human-and-statistical-genomics/51-gwas.md)),
an RNA-seq experiment tests twenty thousand genes
([Ch 47](../part-10-functional-genomics/47-rna-seq.md)), a single-cell run produces a matrix with
more genes than cells ([Ch 48](../part-10-functional-genomics/48-single-cell-and-spatial.md)), and
a polygenic score fits a million coefficients
([Ch 53](../part-11-human-and-statistical-genomics/53-polygenic-scores.md)).

That change of scale is not the same thing done more times. It breaks the meaning of a p-value,
makes overfitting the default rather than a hazard, and fills every dataset with structure that is
entirely real as arithmetic and entirely meaningless as biology. This chapter is the statistics of
that regime.

One note on where you are standing. This chapter is read early — before
[Ch 28](../part-05-population-genetics/28-structure-and-inbreeding.md), whose §10 argument about
principal components and whose §12 argument about inflated test statistics are both unreadable
without it — and the consequence is that its recurring example, including the worked example at
the end, is a **genome-wide association study**: a scan that regresses one phenotype on every
variant in the genome, one variant at a time. You have not met one. Its own chapter,
[Ch 51](../part-11-human-and-statistical-genomics/51-gwas.md), is more than twenty chapters ahead,
and nothing here depends on having read it — statistically a GWAS is just *m* correlated
regressions with one null, which is exactly the object this chapter is about. Of the two pieces of
vocabulary the example borrows, one you already own: the genome-wide significance threshold
5 × 10⁻⁸, named in [Ch 12](../part-02-transmission-genetics/12-probability-and-testing.md) §8 and
derived properly in §2 below. The other, the genomic inflation factor λ<sub>GC</sub>, is built
from scratch in §4 — which is precisely why this chapter has to come before Ch 28 §12 rather than
after it.

## What you'll be able to do

- Choose between family-wise error control and false-discovery control, and state the different
  guarantee each one makes
- Derive the 5 × 10⁻⁸ GWAS threshold, and say why the right number differs by ancestry and by assay
- Implement Benjamini–Hochberg from scratch and reproduce a differential-expression tool's adjusted
  p-values
- Read a QQ plot and a genomic inflation factor, and say precisely what λ cannot tell you
- Compute and interpret the principal components of a genotype matrix, read a scree plot, and
  explain why between-cluster distances on a UMAP or t-SNE plot are not interpretable
- Explain why unpenalised estimates fail when predictors outnumber samples, why read counts need
  a negative binomial rather than a Poisson, and why polygenic scores and RNA-seq dispersions are
  both built with shrinkage
- Explain why an effect size selected by a significance threshold is inflated, and why that bias
  is squared when the same result is reported as variance explained

## The core idea

Take 3,564 SNPs on chromosome 22 and test each against a phenotype that has **no genetic cause
whatever** — the ancestry-driven phenotype simulated in [lab-08](../labs/lab-08-gwas.md), where the
correct number of associations is exactly zero. After correcting for ancestry, 3,361 SNPs return a
p-value and 170 of them reach *p* < 0.05. Under the null that is precisely what should happen:
0.05 × 3,361 = 168.

Nothing is wrong. The p-value did its job. What changed is that you are no longer looking at *a*
p-value — you are looking at the **minimum** of thousands, and the minimum of many null statistics
is not distributed like one of them. The maximum of *m* standard normals grows like √(2 ln *m*):
about 3 for a hundred tests, 4.3 for ten thousand, 5.3 for a million. Noise alone reaches five
sigma once you look a million times.

So the first half of high-dimensional statistics is **knowing what the null looks like when you
ask a lot of questions**. The second half is stranger: in a matrix with more columns than rows,
striking patterns exist for free. A regression with more predictors than samples fits perfectly,
any set of points has principal components pointing somewhere, and any embedding produces
clusters. The discipline is to ask, every time, what this would have looked like if nothing were
there.

---

## 1. The arithmetic of many tests

Under the null a single test at α = 0.05 is wrong 5% of the time. Over *m* independent tests the
probability of at least one false positive is 1 − (1 − α)^*m*, which saturates fast.

```python
for m in (1, 10, 100, 3564, 20000, 1000000):
    print("m=%-8d P(>=1 false positive at 0.05) = %.6f   Bonferroni alpha = %.2e"
          % (m, 1 - 0.95**m, 0.05/m))
```

```
m=1         P(>=1 false positive at 0.05) = 0.050000    Bonferroni alpha = 5.00e-02
m=10        P(>=1 false positive at 0.05) = 0.401263    Bonferroni alpha = 5.00e-03
m=100       P(>=1 false positive at 0.05) = 0.994079    Bonferroni alpha = 5.00e-04
m=3564      P(>=1 false positive at 0.05) = 1.000000    Bonferroni alpha = 1.40e-05
m=20000     P(>=1 false positive at 0.05) = 1.000000    Bonferroni alpha = 2.50e-06
m=1000000   P(>=1 false positive at 0.05) = 1.000000    Bonferroni alpha = 5.00e-08
```

At a hundred tests a false positive is nearly certain. There are two coherent ways to respond, and
they control different things.

| | **Family-wise error rate (FWER)** | **False discovery rate (FDR)** |
|---|---|---|
| Controls | P(**at least one** false positive anywhere) | E[fraction of **your rejections** that are false] |
| Guarantee is about | the whole experiment | the reported list |
| At 5% you expect | one wrong finding in twenty *studies* | one wrong finding in twenty *discoveries* |
| Use when | a single false claim is expensive: GWAS hits, clinical variants | you are generating a screening list: DE genes, QTLs |
| Cost | power, severely, as *m* grows | some of the list is wrong, by design |

Neither is more correct. They answer different questions, and the choice follows from what the
list is *for*.

## 2. Bonferroni, and where 5 × 10⁻⁸ comes from

Test each hypothesis at α/*m*. Then by Boole's inequality — the probability of a union is at most
the sum of the probabilities —

```
FWER = P(⋃ reject_i | all null) ≤ Σ P(reject_i) = m · (α/m) = α
```

Two properties matter. **It requires no independence assumption** — Boole's inequality holds under
any dependence, which is why Bonferroni stays correct on correlated genotypes. And **it is
conservative when tests are correlated**: two SNPs in perfect LD are one test, but Bonferroni
charges for two. (Šidák's exact-under-independence threshold 1 − (1 − α)^(1/*m*) gives
5.13 × 10⁻⁸ where Bonferroni gives 5.00 × 10⁻⁸ — about 2.6% larger, a relative gap of roughly α/2
that does *not* shrink as *m* grows, and negligible beside what dependence costs you. Dependence is
the real issue, not the approximation.)

Genome-wide significance is Bonferroni with the right *m*. The naive answer — the number of
variants on your array — is wrong in both directions. Too large, because adjacent variants in tight
LD are near-duplicates. Too small, because a genotyped variant proxies for everything it tags,
including sites you never measured. The right quantity is the number of **effectively independent
tests** in the genome's common-variant space, *M*<sub>eff</sub>: a property of the population's LD,
not of your file.

You can estimate it. The eigenvalues of the SNP-by-SNP correlation matrix count independent
dimensions — *m* uncorrelated SNPs give *m* eigenvalues of 1, while a block in perfect LD collapses
into one large eigenvalue and a pile of zeros. Li and Ji's estimator sums an integer and a
fractional part of each. Run it on the real 1000 Genomes chr22 data, holding sample size and marker
set identical across populations so that only LD differs:

```bash
plink2 --pfile labs/data/chr22_qc --export A --out labs/data/chr22_qc      # 2503 individuals x 3564 SNPs
```

```python
import numpy as np, pandas as pd
raw   = pd.read_csv('labs/data/chr22_qc.raw', sep='\t')
G     = raw.iloc[:, 6:].to_numpy(float)                # dosage 0/1/2
ids   = raw['IID'].to_numpy()
panel = pd.read_csv('labs/data/panel.txt', sep='\t')
grp   = np.array([dict(zip(panel['sample'], panel['super_pop'])).get(i) for i in ids])

rng = np.random.default_rng(7)
sub = {p: rng.choice(np.where(grp == p)[0], 503, replace=False) for p in ('EUR','EAS','AFR')}
maf = {p: G[sub[p]].mean(0)/2 for p in sub}
keep = np.all([np.minimum(maf[p], 1-maf[p]) >= 0.05 for p in sub], axis=0)

def meff(X):                                            # Li & Ji (2005)
    ev = np.abs(np.linalg.eigvalsh(np.corrcoef(X, rowvar=False)))
    return ((ev >= 1) + (ev - np.floor(ev))).sum()

print(f"SNPs with MAF>=5% in all three, in the same 1.0 Mb: {keep.sum()}\n")
print(f"  n = 503 samples each, M = {keep.sum()} SNPs")
for p in ('EUR','EAS','AFR'):
    me = meff(G[np.ix_(sub[p], np.where(keep)[0])])
    print(f"  {p}  M_eff = {me:6.1f}   M_eff/M = {me/keep.sum():.3f}   Bonferroni alpha = {0.05/me:.2e}")
```

```
SNPs with MAF>=5% in all three, in the same 1.0 Mb: 1146

  n = 503 samples each, M = 1146 SNPs
  EUR  M_eff =  160.0   M_eff/M = 0.140   Bonferroni alpha = 3.12e-04
  EAS  M_eff =  172.0   M_eff/M = 0.150   Bonferroni alpha = 2.91e-04
  AFR  M_eff =  235.0   M_eff/M = 0.205   Bonferroni alpha = 2.13e-04
```

The same 1,146 variants in the same megabase of DNA are worth 160 independent tests in Europeans
and **235 in Africans — a factor of 1.47**, sample size and marker set held fixed. Longer haplotype
blocks mean more redundancy, which means fewer real questions asked.

Read those as estimates, not measurements. With *n* = 503 samples and *M* = 1,146 markers the
sample correlation matrix has rank at most 502, so Li and Ji's rule is being applied to a spectrum
that is partly an artefact of *n* < *M*; the absolute *M*<sub>eff</sub> would move with sample size
even if LD did not. What survives that caveat is the comparison, because *n* and the marker set are
identical across the three panels.

Now the derivation. Several groups estimated *M*<sub>eff</sub> ≈ 1 × 10⁶ for common variants
(MAF ≥ 5%) in European-ancestry LD, by permutation and by simulation under the observed LD. Then

```
α = 0.05 / 10⁶ = 5 × 10⁻⁸        two-sided:  |Z| > 5.4513
```

and notice where that lands: the expected largest |Z| among 10⁶ null tests is about 4.97 by
simulation, √(2 ln *m*) = 5.26 as an asymptotic. **The genome-wide threshold sits just above the
biggest excursion noise typically produces.** That is exactly what it is for.

Three counter-intuitive consequences follow:

- **Denser arrays do not move the threshold.** Imputing to 20 million variants adds redundancy, not
  questions. The threshold prices the genome, not the file.
- **Testing fewer variants earns nothing on its own.** A 50-SNP candidate panel does not license
  α = 10⁻³ merely by being short. It could license a laxer threshold only if the prior that picked
  those 50 were genuinely good, and that is a claim to be argued, not assumed from the denominator.
  This is the statistical core of why the candidate-gene literature failed to replicate.
- **The right number is ancestry- and assay-specific.** African-ancestry samples need roughly twice
  the correction — the 1.47× measured above is that effect; WGS adds rare variants in weak LD with
  everything, so each is nearly a whole extra test and proposals cluster at 5 × 10⁻⁹ to 1 × 10⁻⁸;
  founder populations can relax it. A fixed 5 × 10⁻⁸ is therefore anti-conservative precisely for
  African-ancestry studies ([Ch 51 §5](../part-11-human-and-statistical-genomics/51-gwas.md)).

## 3. False discovery rate and Benjamini–Hochberg

For a screen, FWER is the wrong target. If 1,000 of your 20,000 genes are genuinely differentially
expressed, controlling the probability of *any* error at 5% discards most of them. You would rather
say: give me a list, and guarantee that on average no more than 5% of it is junk.

That is the **false discovery rate**, E[V/R] — expected proportion of false positives *among
rejections*. The Benjamini–Hochberg step-up procedure achieves it. Sort the p-values ascending,
find the largest *k* with *p*<sub>(k)</sub> ≤ *k q / m*, and reject everything up to it:

```python
def bh(p, q=0.05):
    o = np.argsort(p); ps = p[o]; m = len(p)
    k = np.where(ps <= q * np.arange(1, m+1) / m)[0]
    cut = ps[k.max()] if len(k) else 0.0
    padj = np.minimum.accumulate((ps * m / np.arange(1, m+1))[::-1])[::-1]
    out = np.empty(m); out[o] = np.minimum(padj, 1.0)
    return p <= cut, out                    # rejected?, adjusted p-values
```

The threshold is the point at which observed p-values stop out-running what the null would produce:
under the null, *mp* p-values fall below *p*, so *p*<sub>(k)</sub> ≤ *kq/m* says exactly "at most a
fraction *q* of the list this far down is expected noise". The running minimum from the right
enforces monotonicity, so adjusted values never decrease.

Run it on the real differential-expression output from [lab-06](../labs/lab-06-rna-seq.md) — yeast
wild-type versus *snf2*Δ, three replicates each, DESeq2 p-values:

```python
res = pd.read_csv('labs/data/deseq_results.tsv', sep='\t').dropna(subset=['pvalue'])
p = res['pvalue'].to_numpy()
rej, q = bh(p, 0.05)
```

```
genes with a p-value: 4571
Bonferroni 0.05/m = 1.094e-05  -> 99 genes
BH q<0.05                      -> 272 genes   (largest p called: 2.925e-03)
uncorrected p<0.05             -> 699 genes   (229 expected by chance if all null)

DESeq2 padj<0.05 -> 274 genes ; my BH on the same subset (4039 genes) -> 274
max |my q - DESeq2 padj| over unfiltered genes: 2.87e-15
expected false discoveries among the BH set: 0.05 * 272 = 14
```

Seven lines of numpy reproduce DESeq2's `padj` to floating-point precision. Three numbers to read.
**99 versus 272**: Bonferroni finds a third as much as BH on the same data, and the gap widens with
*m*. **699 uncorrected against 229 expected**: raw p-values are useless as a list. **14 expected
false discoveries among the 272**: that is the deal, and it is the guarantee rather than a failure.

The 532 genes DESeq2 dropped rather than tested are **independent filtering**: low-count genes have
no power, so removing them before BH shrinks *m* and legitimately raises the threshold for everyone
else, because their p-values are still uniform under the null
([Ch 47](../part-10-functional-genomics/47-rna-seq.md)).

**q-values** push the logic one step further. BH assumes every hypothesis could be null; if only a
fraction π₀ are, it is conservative by 1/π₀. Storey's estimator reads π₀ off the flat part of the
p-value histogram, since p-values above 0.5 are essentially all null:

```
Storey pi0 (lambda=0.5) = 0.859  -> est. 3926 truly null genes of 4571
q-value (pi0-adjusted) < 0.05 -> 283 genes   (BH gave 272)
```

A q-value is the smallest FDR at which a given test would be called: 11 more genes for free, from
the observation that 14% of these genes are not null.

> **BH controls a proportion, not a probability.** "FDR 5%" does not mean each finding has a 5%
> chance of being wrong; it means the expected share of wrong ones in the whole list is 5%. The
> weakest members are far more likely to be false than the strongest, and a single gene picked out
> of an FDR-controlled list carries no individual 95% guarantee.

The standard BH proof needs independence or a positive-dependence condition (PRDS) that correlated
genotypes and co-expressed genes usually satisfy. The Benjamini–Yekutieli variant divides by
Σ1/*i* ≈ ln *m* + γ for arbitrary dependence — 9.0× more conservative at these 4,571 genes, which
is why it is rarely used.

## 4. QQ plots, λ, and the limits of both

A QQ plot sorts your p-values and plots −log₁₀ observed against −log₁₀ expected under uniformity;
under a true global null the points lie on *y = x*. The **genomic inflation factor** compresses the
plot into one number — convert p-values to χ²₁ statistics and compare the observed median to the
null median 0.4549:

```
λ_GC = median(χ²_observed) / 0.4549
```

Both diagnostics on the real lab-08 scan — 1000 Genomes chr22 genotypes against a phenotype whose
prevalence depends only on ancestry, with zero true associations by construction:

```python
from scipy.stats import chi2
p = pd.read_csv('labs/data/gwas_naive.strat.glm.logistic.hybrid', sep='\t')['P'].dropna().to_numpy()
print(np.median(chi2.isf(p, 1)) / chi2.ppf(0.5, 1))
```

```
no ancestry covariates   m=3564  median p=0.0041  lambda_GC=18.068  min p=1.02e-27  p<5e-8: 702
+ 10 genotype PCs        m=3361  median p=0.4711  lambda_GC= 1.142  min p=2.14e-03  p<5e-8:   0

  quantile      expected -log10 p     observed: naive    observed: +PCs
   top   50.0%         0.30                  2.38              0.33
   top   10.0%         1.00                 10.77              1.02
   top    1.0%         2.00                 16.38              1.80
   maximum             3.85                 26.99              2.67
```

The uncorrected column departs from the diagonal **at the median** — panel C in
[Ch 51 §9](../part-11-human-and-statistical-genomics/51-gwas.md). Here that verdict is unambiguous,
because of how the data were built: 3,564 SNPs in a single megabase against a phenotype with no
genetic cause at all, so no marker can be carrying signal and median inflation can only be model
failure. In a real polygenic scan the same picture is ambiguous — that is exactly the panel B case
the rest of this section resolves with the LD-score intercept. Ten principal components restore the
median
p-value to 0.47 and the smallest p to 2.1 × 10⁻³, which is unremarkable among 3,361 tests.

Now the limit, and λ is the most misused statistic in the field. **λ cannot distinguish confounding
from real polygenicity.** If a trait is affected by tens of thousands of variants, most of the
genome carries a small true signal, the median χ² is genuinely above the null, and λ > 1 is correct
rather than alarming — and since that contribution grows with *N*, λ grows without bound as a clean
study gets bigger. Genomic control (dividing every statistic by λ) then deletes real discoveries.

What separates the two is **LD-score regression**: confounding inflates every statistic equally,
whereas polygenic signal inflates a variant in proportion to how much it tags. Regress χ² on LD
score across millions of variants; the slope estimates heritability, and the **intercept** estimates
the inflation that does not track LD. Intercept ≈ 1 alongside λ = 1.35 means a large, clean,
polygenic study; intercept > 1 means fix the model
([Ch 51 §4](../part-11-human-and-statistical-genomics/51-gwas.md)). Reporting λ alone says almost
nothing.

## 5. Principal components

A genotype matrix is 2,503 × 3,564 here and 500,000 × 10⁷ in a biobank. PCA answers one question:
along which few directions in that space do individuals differ most?

Standardise each column — subtract 2*p̂*, divide by √(2*p̂*(1−*p̂*)), the Hardy–Weinberg SD of a
dosage ([Ch 26](../part-05-population-genetics/26-hardy-weinberg.md)) — and form
**K** = **XX**ᵀ/*M*, the genetic relationship matrix, whose (*i*, *j*) entry is the average
standardised allele-sharing between two people. **The principal components are its eigenvectors —
one coordinate per individual — and each eigenvalue is the variance captured along that axis.** PC1
is the axis along which the sample spreads most; PC2 the most spread remaining once PC1 is removed;
and so on. Each PC also has a set of **SNP loadings**, one coordinate per marker, saying how much
each variant contributes to that axis; those are the eigenvectors of the *m* × *m* SNP covariance
matrix, a different object of a different length, and the two are tied together by the SVD of
**X** (loading ∝ **X**ᵀ**u**). The loadings are what diagnose PC1 later in this section.

```python
p  = G.mean(0)/2
X  = (G - 2*p) / np.sqrt(2*p*(1-p))
K  = X @ X.T / X.shape[1]
ev, V = np.linalg.eigh(K)
ev, V = ev[::-1], V[:, ::-1]
PC = V            # columns of V ARE the per-individual PC coordinates; later blocks use `PC`
```

```
K: 2503 x 2503   mean diagonal 1.042   mean off-diagonal -0.0004

PC   eigenvalue   % variance   cumulative
PC1      193.27      7.41%       7.41%
PC2      138.66      5.32%      12.72%
PC3      107.16      4.11%      16.83%
PC4       90.23      3.46%      20.29%
PC5       87.21      3.34%      23.63%
...   remaining 2495 PCs carry 68.9%

correlation with PLINK2 --pca eigenvectors: ['1.0000', '1.0000', '1.0000', '1.0000']
```

Five lines reproduce `plink2 --pca` exactly. Two things to read off.

**The scree plot** is that eigenvalue sequence. Structure lives where eigenvalues stand clearly
above the noise continuum; here PC1–PC3 separate and the rest decay smoothly. Note how little
variance the leading PCs carry — 7.4% for PC1. That is normal, not a defect: ancestry is a
*consistent* nudge to millions of allele frequencies, so it dominates the leading eigenvector while
explaining a small share of a total that is mostly independent per-SNP noise.

**The PCs track ancestry, but only some of them.** Decomposing each PC's variance into between- and
within-super-population parts:

```
fraction of each PC's variance that is BETWEEN super-populations:
  PC1  R^2 = 0.229
  PC2  R^2 = 0.654
  PC3  R^2 = 0.216
  PC4  R^2 = 0.014
  PC5  R^2 = 0.019
  super-population predicted from the first  1 PCs: 40.3% accurate (5-fold CV, 5 classes)
  super-population predicted from the first  5 PCs: 61.7% accurate (5-fold CV, 5 classes)
  super-population predicted from the first 10 PCs: 72.7% accurate (5-fold CV, 5 classes)
  super-population predicted from the first 20 PCs: 79.8% accurate (5-fold CV, 5 classes)
  chance =  26.4%
```

**Here PC1 is not the ancestry axis — PC2 is**, and the reason is the standard trap: this dataset is
one unpruned megabase, where a single long haplotype block can out-vary continental ancestry. Check
where each PC's SNP loadings sit:

```
PC1: densest 100 kb window 20.80-20.90 Mb holds 36% of the squared loadings ( 9% of the SNPs)
PC2: densest 100 kb window 20.60-20.70 Mb holds 14% of the squared loadings (14% of the SNPs)
```

PC1 draws four times its share of loading from one 100 kb window; PC2 draws exactly its share. PC1
is substantially a local LD block; PC2 is genuinely region-wide. **This is why you LD-prune before
PCA and mask known long-range LD regions** — the *MAPT* inversion at 17q21, the HLA, *LCT* —
otherwise a real inversion polymorphism is reported to you as continental ancestry
([Ch 51 §3](../part-11-human-and-statistical-genomics/51-gwas.md)).

> **Principal components are descriptive axes, not populations.** A PC is a continuous coordinate
> with no natural cut point, and individuals fill the space between labelled groups: 341 of the 347
> admixed-American individuals here fall inside the European PC1 range. Drawing boundaries on a PC
> plot and treating them as biological categories imports a discreteness the data does not have.
> PCs are useful as covariates that soak up ancestry-driven covariance, and that is all they claim
> to be.

### t-SNE and UMAP: the distances are not distances

Non-linear embeddings optimise a neighbourhood objective — keep points that were close together
close — and are under no constraint to preserve anything else. Run t-SNE on the ten PCs above and
compare the 325 between-population centroid distances with the same distances in PC space:

```python
from sklearn.manifold import TSNE
from scipy.spatial.distance import pdist
from scipy.stats import spearmanr
E = TSNE(n_components=2, random_state=0, init='random', perplexity=30).fit_transform(PC[:, :10])
```

```
t-SNE seed 0 vs 10-PC space: Spearman rho over 325 population-pair distances = +0.576
t-SNE seed 1: rho = +0.816       t-SNE seed 2: rho = +0.840
seed 0 vs seed 1 (same algorithm, same data, different random_state): rho = +0.771

  most separated pairs, t-SNE seed 0: ESN-GIH, ESN-FIN, GIH-MSL
  most separated pairs, 10-PC space:  ESN-FIN, FIN-YRI, ESN-GIH
```

Changing one integer with no statistical meaning moves the fidelity of the between-group distances
from 0.58 to 0.84, and two runs of the same algorithm agree with each other only at 0.77.
[Lab-09](../labs/lab-09-single-cell.md) quantifies the same thing on single-cell data and finds
worse: **Spearman ρ = 0.289** between UMAP centroid distances and the PC-space distances the UMAP
was computed from, with on-screen area per cell differing sixfold between clusters.

So: separation on such a plot is evidence that distinct groups exist. The *width* of a gap, the
*size* of a blob and the *ordering* of between-cluster distances are evidence of nothing. Quantify
in the space you analysed, and use the embedding to look.

## 6. Shrinkage: when predictors outnumber samples

With *m* > *n*, ordinary least squares has infinitely many solutions that fit the training data
exactly, and all of them fit noise. Below: real genotypes, a phenotype **simulated** with 20 causal
SNPs and *h*² = 0.5 (the genotypes are real, the trait is not), 300 training individuals, 3,564
predictors, evaluated on 2,203 held-out people.

```python
from sklearn.linear_model import LinearRegression, RidgeCV, LassoCV
n, m = X.shape; rng = np.random.default_rng(1)                 # X is the standardised matrix of §5
causal = rng.choice(m, 20, replace=False); beta = np.zeros(m); beta[causal] = rng.normal(0,1,20)
g = X @ beta; g /= g.std()
y = np.sqrt(0.5)*g + np.sqrt(0.5)*rng.normal(0, 1, n)      # simulated trait, real genotypes
perm = rng.permutation(n); tr, te = perm[:300], perm[300:]

ols = LinearRegression().fit(X[tr], y[tr])
rid = RidgeCV(alphas=np.logspace(0, 6, 25)).fit(X[tr], y[tr])
las = LassoCV(max_iter=20000, random_state=0).fit(X[tr], y[tr])
```

```
training n = 300, predictors m = 3564  (m/n = 11.9)
  OLS (minimum-norm)     test R2 = -0.108   train R2 = 1.000
  ridge  (alpha=5623)    test R2 = +0.287   train R2 = 0.614
  lasso  (alpha=0.104)   test R2 = +0.330   train R2 = 0.493   nonzero = 32 of 3564
  ceiling (true genetic value, h2=0.5)      R2 = 0.506
  lasso recovered 4 of the 20 causal SNPs
```

OLS fits the training set *perfectly* and predicts worse than the sample mean — a negative R² is
not a bug but what interpolating noise buys. Both penalised fits recover most of the achievable
signal. The two penalties differ in what they assume:

| | Penalty | Effect on coefficients | Implied prior ([S6](./S6-likelihood-and-bayes.md)) | Suits |
|---|---|---|---|---|
| **Ridge** (L2) | λΣβ² | shrinks all toward 0, none to 0 | Gaussian β ~ N(0, τ²) | dense architecture — everything matters a little |
| **Lasso** (L1) | λΣ\|β\| | sets most exactly to 0 | Laplace | sparse architecture — a few large effects |

Both are posterior modes under a prior, which is the honest way to read them: **a penalty is an
assumption about the effect-size distribution**, and which one is right is an empirical question
about genetic architecture. Note what the lasso did — 32 non-zero coefficients, only 4 of them
causal. Under LD, which member of a correlated block gets picked is close to arbitrary: the
prediction is fine, the variable selection is not to be trusted.

This is why polygenic scores are built with shrinkage
([Ch 53](../part-11-human-and-statistical-genomics/53-polygenic-scores.md)). Raw GWAS betas are
mostly noise, at per-variant signal-to-noise often below 10⁻³, and summing them sums the noise.
Genome-wide ridge is the infinitesimal model made computational; LDpred's point–normal prior says a
fraction of variants are causal; lassosum uses L1; PRS-CS uses a heavy-tailed continuous-shrinkage
prior. Four methods, four priors, one estimator.

### Winner's curse

Selection on a noisy statistic biases the statistic. If $\hat\beta \sim N(\beta, s^2)$ and you only
report it when $\hat\beta/s > c$, the conditional mean is inflated by the inverse Mills ratio
$\phi(c-\mu)/(1-\Phi(c-\mu))$, with $\mu = \beta/s$ — derived in
[Ch 51 §10](../part-11-human-and-statistical-genomics/51-gwas.md). The size depends entirely on how
far *inside* the threshold the truth sits:

```
true |beta|/SE = 2  ->  reported effect inflated 2.85x at the 5e-8 threshold
                 3  ->  1.93x       4 -> 1.47x       5 -> 1.22x       6 -> 1.08x
```

Watch it happen on real genotypes. Split the 2,503 individuals into a 1,251-person discovery half
and a 1,252-person replication half, scan all 3,564 SNPs marginally in discovery, select at
Bonferroni, and re-estimate those effects in the held-out half. One such split is a single noisy
realisation of the ratio, so run 200 of them per *h*² — fresh causal SNPs, fresh noise, fresh
split each time — and report the average:

```python
def scan(Xs, ys):                                    # marginal slope and z for every SNP at once
    Xc = Xs - Xs.mean(0); yc = ys - ys.mean()
    b  = (Xc*yc[:,None]).sum(0) / (Xc**2).sum(0)
    se = np.sqrt(((yc[:,None] - Xc*b)**2).sum(0)/(len(ys)-2) / (Xc**2).sum(0))
    return b, b/se

from scipy.stats import norm

def replicate(h2, seed):                             # one simulated trait, one discovery/replication split
    rng = np.random.default_rng(seed)
    causal = rng.choice(m, 20, replace=False)
    beta = np.zeros(m); beta[causal] = rng.normal(0, 1, 20)
    g = X @ beta; g /= g.std()
    y = np.sqrt(h2)*g + np.sqrt(1-h2)*rng.normal(0, 1, n)
    perm = rng.permutation(n); disc, rep = perm[:1251], perm[1251:]
    bd, zd = scan(X[disc], y[disc]);  br, _ = scan(X[rep], y[rep])
    sel = 2*norm.sf(abs(zd)) < 0.05/m
    if sel.sum() == 0: return None
    return sel.sum(), np.abs(bd[sel]).mean(), (br[sel]*np.sign(bd[sel])).mean()

runs = [replicate(0.10, s) for s in range(200)]      # then 0.15, 0.20, 0.30, 0.50
```

```
200 replicate simulations per h2 (fresh causal SNPs and fresh noise in each)

h2   ncausal  median sel.  mean|b| disc  mean b rep   ratio (mean +- MC SE)   5-95% of ratio
0.10  20          84       0.1461        0.1272       1.22 +- 0.02          0.83 - 1.85  (198/200)
0.15  20         148       0.1578        0.1426       1.16 +- 0.02          0.82 - 1.75  (200/200)
0.20  20         206       0.1669        0.1539       1.12 +- 0.02          0.84 - 1.53  (200/200)
0.30  20         332       0.1801        0.1690       1.09 +- 0.01          0.88 - 1.38  (200/200)
0.50  20         508       0.1968        0.1871       1.07 +- 0.01          0.91 - 1.30  (200/200)
```

Averaged over replicates, discovery effects are **22% too large at the lowest power tested, falling
monotonically to 7% at the highest**. That is the whole phenomenon: the curse is a function of
power, not of the trait. And because variance explained goes as β², the bias on *R*² is squared —
1.22² = 1.49×.

Note the last column, which is the reason for running 200 splits instead of one. At *h*² = 0.10 a
single realisation of the ratio can land anywhere from 0.83 to 1.85; the *mean* is pinned down to
±0.02, but no individual split is. Quoting one split's number would have been exactly the
single-striking-realisation mistake this chapter closes on. Real GWAS live permanently in the top
rows of that table, which is why replication effect sizes are routinely smaller than discovery ones
(not a failure to replicate), and why scores built from raw discovery betas are over-weighted
exactly at their weakest loci.

## 7. Counts, overdispersion, and why Poisson is not enough

[S2](./S2-distributions.md) introduced the Poisson as the distribution of counts at a fixed rate.
RNA-seq counts are not that, because the rate itself varies between biological replicates. Real
yeast counts, three wild-type replicates, library-size normalised:

```python
# the same yeast counts lab-06 produced: 6,571 genes x 3 WT + 3 snf2 replicates
cnt = pd.read_csv("labs/data/yeast_counts.tsv", sep="\t", index_col=0)
wt  = cnt[["wt_rep1", "wt_rep2", "wt_rep3"]]
wtn = wt / (wt.sum() / wt.sum().mean())      # library-size normalise, then keep expressed genes
wtn = wtn[wtn.mean(1) > 10].to_numpy(float)

mu, var = wtn.mean(1), wtn.var(1, ddof=1)
alpha = (var - mu) / mu**2          # method-of-moments dispersion,  Var = mu + alpha*mu^2
```

```
genes with mean normalised WT count >= 50: 1206
  median variance / mean  = 2.42      (Poisson says 1.0)
  genes with variance > mean: 922 of 1206
  median dispersion alpha = 0.0120  -> biological CV = 11%
  at mean 1000: Poisson SD = 32 ; negative-binomial SD = 114
```

Variance runs 2.4× the mean, and at high counts the gap is enormous: the Poisson SD grows as √μ and
is soon swamped by the αμ² term. Mixing a Poisson rate over a gamma gives exactly the **negative
binomial**, Var = μ + αμ², with α the squared coefficient of variation of true abundance across
replicates. Using the wrong distribution is not a subtlety:

```
  pooled-Poisson (binomial) test, BH 5%  -> 1447 of 6571 genes called differentially expressed
  DESeq2 negative-binomial test, BH 5%   ->  274 genes
```

**5.3× more "discoveries", every extra one an artefact of assuming away biological variation.** BH
was applied to both, so no multiple-testing procedure could help: the p-values themselves were
wrong. And with *n* = 3 replicates there are ~2 degrees of freedom per gene, so per-gene dispersion
estimates are hopeless — DESeq2 and edgeR fit a smooth mean–dispersion trend across all genes and
shrink each gene's estimate toward it. §6's shrinkage again, applied to a nuisance parameter
([Ch 47](../part-10-functional-genomics/47-rna-seq.md)).

## 8. Mixed models, conceptually

The last high-dimensional problem is that **the rows are not independent either**. Biobanks contain
undeclared siblings and cousins, and underneath everyone a continuous gradient of shared ancestry;
*k* principal components as fixed covariates handle the top of that spectrum and miss the rest. A
linear mixed model instead uses a random effect whose covariance *is* the relatedness:

$$\mathbf{y} = \mathbf{X}\boldsymbol{\gamma} + \mathbf{g}\beta + \mathbf{u} + \boldsymbol{\varepsilon},
\qquad \mathbf{u} \sim N(0, \sigma_g^2\mathbf{K}), \quad \boldsymbol{\varepsilon} \sim N(0, \sigma_e^2\mathbf{I})$$

**K** is the same GRM whose eigenvectors were the PCs of §5, and that identity is the whole point:
the PCs are the *top few* eigenvectors, whereas **K** carries the entire spectrum — continental
ancestry in the leading eigenvalues, sibships and cousinships spread thinly across thousands of
small ones. One model therefore handles population structure and cryptic relatedness at once. It is
a variance-components model in the sense of [S5](./S5-variance-and-regression.md): σ²<sub>g</sub>
and σ²<sub>e</sub> are estimated from how phenotypic similarity tracks genetic similarity.

The GRM on this data shows the structure it models:

```
GRM off-diagonal: same super-population  mean +0.0894  sd 0.1747
                  different              mean -0.0239  sd 0.1129
```

People from the same super-population share more than people from different ones, continuously, and
that covariance is what an ordinary regression assumes away. (These numbers come from one megabase,
so extreme entries reflect shared haplotypes in this window rather than genome-wide kinship.) Two
practical costs: the naive likelihood is O(*n*³) per variant, which is what `BOLT-LMM`, `fastGWA`
and `REGENIE` exist to avoid; and a variant inside **K** partly absorbs its own effect — **proximal
contamination**, fixed by building **K** from the other chromosomes
([Ch 51 §3](../part-11-human-and-statistical-genomics/51-gwas.md)).

---

One habit runs through all eight sections. In one dimension a striking result is usually a result;
in a million dimensions the strikingness is manufactured by the search itself. The smallest of a
million p-values is small, the leading eigenvector of any matrix points somewhere, a model with
more parameters than samples fits perfectly, and the effect that cleared your threshold cleared it
partly on noise. **The default assumption in high dimensions must be that a striking pattern is an
artefact until shown otherwise** — by a null distribution you constructed, by held-out data, or by
an independent sample.

## Common misconceptions

| What people think | What's actually true |
|---|---|
| Bonferroni assumes independent tests | It assumes nothing — Boole's inequality holds under any dependence. Dependence makes it *conservative*, not invalid. That conservatism is what *M*<sub>eff</sub> fixes |
| FDR 5% means each finding is 95% likely to be true | It means the *expected proportion* of false ones in the whole list is 5%. The marginal members are much more likely to be false than the top ones |
| Correcting for multiple testing makes an analysis valid | It controls noise, not bias. On the confounded chr22 scan, BH at FDR 5% returns 2,130 "discoveries" from 3,564 SNPs, all false |
| λ > 1 means the study is confounded | For a polygenic trait λ grows with *N* under a perfectly clean analysis. Only the LD-score intercept separates confounding from signal |
| A QQ plot that leaves the diagonal in the tail is a problem | That is what real associations look like. Departure at the *median* means either confounding or genuine polygenicity — λ alone cannot separate them, and only the LD-score intercept can |
| PC1 is the ancestry axis | PC1 is the axis of largest variance, which on unpruned data can be a single LD block or inversion. Here PC2 carries most of the ancestry signal (R² = 0.65 vs 0.23) |
| Clusters on a UMAP or t-SNE plot show how different populations are | Only local neighbourhoods are preserved. Between-cluster distances change with the random seed and correlate weakly with the real distances (ρ = 0.29 in lab-09) |
| More predictors can only help prediction | Past *m* ≈ *n*, unpenalised fits interpolate noise. OLS here scores train R² = 1.000, test R² = −0.108 |
| The lasso tells you which variants are causal | Under LD it picks an arbitrary member of each correlated block. Here 32 selected, 4 causal, with good prediction throughout |
| Discovery effect sizes are unbiased estimates | Winner's curse inflated them 1.22× on average at the lowest power tested above (200 replicate splits), 1.07× at the highest, and squares that bias on variance explained |
| Read counts are Poisson | Biological replicates vary in the underlying rate, giving a negative binomial. Assuming Poisson called 1,447 DE genes where the correct model called 274 |

## Worked example: is any chr22 variant associated with this phenotype?

The end-to-end version, on data where the answer is known to be **no**: the
[lab-08](../labs/lab-08-gwas.md) phenotype is assigned by a coin flip whose bias depends only on
super-population, no genotype was consulted, and the correct number of associations is zero.

**Step 1 — run the scan.** 3,564 SNPs, logistic regression, no covariates. 702 variants beat
5 × 10⁻⁸ and the smallest p is 1.0 × 10⁻²⁷. Taken at face value, a spectacular result.

**Step 2 — apply multiple-testing correction, and watch it fail.** Bonferroni at 5% keeps 1,138
variants; BH at FDR 5% keeps 2,130, three-fifths of the chromosome. Every one is false. Both
procedures assumed the p-values were valid under the null, and they were not: the null model omitted
ancestry, so the test measured a real association between genotype and a phenotype ancestry causes.
**Correction controls noise; it cannot repair a wrong model.**

**Step 3 — read the diagnostics before the hits.** λ<sub>GC</sub> = 18.07, median p = 0.0041. The
QQ plot leaves the diagonal at the *median*. On a real trait that reading would be ambiguous
between confounding and polygenicity; here it is not, because the phenotype was assigned without
consulting a single genotype, so there is no polygenic signal available to inflate anything. This
is model failure.

**Step 4 — fix the model.** Ten genotype principal components as covariates. λ falls to 1.142,
median p to 0.4711, and the smallest p becomes 2.1 × 10⁻³ — ordinary among 3,361 tests, where the
expected minimum is about 2 × 10⁻⁴.

**Step 5 — correct, and report.** Bonferroni: 0. BH at FDR 5%: 0. BH at FDR 1%: 0. There are 170
variants at *p* < 0.05 against 168 expected. **Nothing here is associated with anything** — the
correct answer.

**Step 6 — what trusting a hit would have required.** A threshold priced for this sample's LD
rather than a borrowed 5 × 10⁻⁸; a QQ plot with a clean median; an LD-score intercept near 1; an
effect size discounted for winner's curse; and replication in an independent sample. The p-value is
the last and least of those checks.

## Where this is used

- [Ch 51 — GWAS](../part-11-human-and-statistical-genomics/51-gwas.md): 5 × 10⁻⁸, QQ plots, λ vs
  the LD-score intercept, PCs and mixed models, winner's curse
- [Ch 53 — Polygenic scores](../part-11-human-and-statistical-genomics/53-polygenic-scores.md):
  every method is a shrinkage prior on the effect-size distribution
- [Ch 47 — RNA-seq](../part-10-functional-genomics/47-rna-seq.md): negative binomial, dispersion
  shrinkage, BH with independent filtering
- [Ch 48 — Single-cell](../part-10-functional-genomics/48-single-cell-and-spatial.md): PCA before
  clustering, and everything in §5 about UMAP
- [Ch 52 — From association to mechanism](../part-11-human-and-statistical-genomics/52-association-to-mechanism.md):
  fine-mapping is this problem with a credible set as the answer instead of a threshold
- [Ch 28 — Population structure](../part-05-population-genetics/28-structure-and-inbreeding.md) and
  [Ch 29 — Linkage disequilibrium](../part-05-population-genetics/29-linkage-disequilibrium.md):
  where the GRM, PCA and *M*<sub>eff</sub> come from
- [Ch 46 — Variant calling](../part-10-functional-genomics/46-variant-calling.md),
  [Ch 55 — Clinical variant interpretation](../part-11-human-and-statistical-genomics/55-clinical-variant-interpretation.md),
  [Ch 56 — Cancer genomics](../part-11-human-and-statistical-genomics/56-cancer-genomics.md):
  FDR on variant and driver-gene lists
- [Lab-08](../labs/lab-08-gwas.md) and [lab-09](../labs/lab-09-single-cell.md) run the two central
  demonstrations in this chapter on real data

## Check yourself

**1. A colleague tests 40 candidate SNPs instead of a million and argues that α = 0.05/40 = 1.25 × 10⁻³ is the right threshold. Is it?**

<details><summary>Answer</summary>

As arithmetic, yes — it controls the family-wise error rate *of the 40 tests he ran*. Inferentially,
it is doing no work he has earned. Choosing to type 40 SNPs into the analysis does not by itself
make a *p* = 10⁻³ hit any more likely to be real than the same *p* would be genome-wide, where it
would be ignored. What *could* make it more credible is a genuinely better prior — the panel is an
implicit claim that these 40 are special — and that claim has to be stated and defended, not
smuggled in through the denominator. The historical evidence is that it was not defensible: the
candidate-gene literature at α ≈ 10⁻³ largely failed to replicate while genome-wide scans at
5 × 10⁻⁸ replicate routinely. Absent a prior anyone will commit to in advance, the same evidence
deserves the same scepticism.

The defensible version is to state that prior explicitly and do the Bayesian calculation
([S6](./S6-likelihood-and-bayes.md)). The indefensible version is a laxer threshold because you
typed fewer SNPs into the analysis.

</details>

**2. An RNA-seq screen reports 800 genes at FDR 5%. Your favourite gene is number 780 on the list, at q = 0.049. How confident should you be in it specifically?**

<details><summary>Answer</summary>

Not very. FDR controls the expected proportion of false positives across the whole list — about 40
of the 800 — but that error is not spread evenly. Genes near the threshold are the marginal ones,
and the *local* FDR there (the probability that this particular gene is null) is far higher than
5%, commonly 20–50% depending on the shape of the p-value distribution. Gene number 3 at
q = 10⁻¹⁰ is nearly certain; gene 780 is a near-coin-flip inside a list with a group-level
guarantee. Treat the list as a ranking, and require independent evidence for any single gene you
plan to act on.

</details>

**3. A GWAS of 400,000 people reports λ = 1.28 and an LD-score-regression intercept of 1.03, with mean χ² = 1.42. Confounded or not?**

<details><summary>Answer</summary>

Very likely not. The attenuation ratio is (intercept − 1)/(mean χ² − 1) = 0.03/0.42 = 0.071, so
about 7% of the mean inflation is not attributable to polygenic signal — inside the 0.1–0.2 range
usually treated as acceptable. λ = 1.28 at *N* = 400,000 for a polygenic trait is what a clean
analysis looks like, because the polygenic contribution to the median statistic scales with *N*.
Applying genomic control would divide every χ² by 1.28 and delete real loci near the threshold.

What would change the verdict: an intercept of 1.20 with the same mean χ² (attenuation 0.48),
pointing at residual structure, batch, or — very commonly — sample overlap between meta-analysed
cohorts, which inflates the intercept even when no component study is confounded.

</details>

**4. On a UMAP of 30,000 cells, cluster A and cluster B sit at opposite ends of the plot while cluster C sits between them. A reviewer asks you to say that C is transcriptionally intermediate between A and B. Should you?**

<details><summary>Answer</summary>

No — not on that evidence. UMAP and t-SNE optimise local neighbourhood preservation and place no
constraint on global geometry, so between-cluster distances and arrangements are artefacts of the
layout as much as of the data. [Lab-09](../labs/lab-09-single-cell.md) measures it: ρ = 0.289
between UMAP centroid distances and the PC-space distances the UMAP was built from, two runs
differing only in `random_state` agreeing at ρ = 0.69, and the most separated pair on the seed-0
layout sitting at 0.29 of the maximum in the real space. The t-SNE run in §5 is the same story on
1000 Genomes.

Instead, compute the distance you want to claim in the space you analysed — centroid distances in
PC space, correlation of mean expression profiles, or a trajectory model if intermediacy is the
actual hypothesis — and use the embedding to illustrate the result, not to establish it.

</details>

**5. You have 500 samples and 20,000 gene-expression predictors and want to predict a clinical outcome. Your OLS model has training R² = 1.0. What happened, what do you do, and how do you honestly report accuracy?**

<details><summary>Answer</summary>

With *m* ≫ *n* the design matrix has a null space, so infinitely many coefficient vectors fit the
training data exactly and R² = 1.0 carries no information whatever. §6 is the same situation: train
R² = 1.000, test R² = −0.108, worse than predicting the mean.

Fit a penalised model instead — ridge if you expect many small contributions, lasso or elastic net
if you expect a sparse signal — choosing the penalty by cross-validation, and remember that under
correlated predictors the *identity* of the selected genes is unstable even when prediction is good.

Report accuracy on data that played no part in fitting: a held-out test set, or nested
cross-validation with the penalty chosen inside each fold. Selecting features on the full data and
cross-validating what remains leaks the outcome into the model — the same selection-induced bias as
winner's curse, in a prediction costume.

</details>
