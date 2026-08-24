# S6 — Likelihood and Bayesian inference

> **Read before:** [Ch 32](../part-06-quantitative-genetics/32-mapping-quantitative-traits.md) · **Time:** ~55 min

Six mitochondrial genomes — human, chimpanzee, gorilla, orangutan, macaque, mouse — aligned into
17,421 columns. There are 105 possible unrooted trees relating six taxa. Which one is right?

You cannot answer by counting. No column says "gorilla branched here"; every column is one draw
from a stochastic substitution process, and any tree can produce any column with *some*
probability. What you can do is ask, for each candidate tree, **how probable this exact alignment
would be if that tree were true** — and prefer the tree that makes it most probable. That
quantity is the likelihood, and it is simultaneously the engine behind phylogenetics
([Ch 34](../part-07-molecular-evolution/34-phylogenetics.md)), variant calling
([Ch 46](../part-10-functional-genomics/46-variant-calling.md)), human linkage analysis
([Ch 14](../part-02-transmission-genetics/14-linkage-and-mapping.md)) and clinical variant
interpretation ([Ch 55](../part-11-human-and-statistical-genomics/55-clinical-variant-interpretation.md))
— four of the most consequential applications in this curriculum, the same three lines of algebra
wearing different clothes.

All code in this chapter runs from the repository root — the directory holding `README.md` and
`.venv` — with `source .venv/bin/activate`, and addresses data as `labs/data/…`. Everything it
needs is in [lab-00](../labs/lab-00-setup.md)'s base install and already on disk.

## What you'll be able to do

- Write down a likelihood function for a genetic model, and explain precisely why it is *not* a
  probability distribution over the parameter
- Maximise a likelihood numerically with `scipy.optimize`, extract a confidence interval from the
  curvature or from a profile, and recognise when the optimiser is lying to you
- Read a likelihood ratio as a unit of evidence, and convert between LOD scores, LRT statistics
  and Bayes factors
- Compute a posterior from a prior and a likelihood — for an allele frequency, a genotype, a
  carrier status, a pathogenicity call and a variant's posterior inclusion probability — and
  state the assumption each prior smuggles in
- Say exactly what a 95% credible interval claims and what a 95% confidence interval claims, and
  why only one of them is a statement about the parameter
- Explain what ModelFinder's AIC and BIC columns are penalising, and why they can disagree

## The core idea

Take any probability model — say the binomial, *P*(*k* alt copies | *n* chromosomes, frequency
*p*). Two variables appear: the data *k* and the parameter *p*.

Fix *p*, vary *k*: you get a **probability distribution**. It sums to 1 over the possible
datasets. This is what [S2](./S2-distributions.md) was about.

Fix *k* at the value you actually observed, vary *p*: you get the **likelihood function**. Same
formula, other variable. It does not integrate to 1, it is not a density, and it makes no claim
about how probable any value of *p* is. It says only: *this parameter value would have made my
data this probable*.

Everything else follows. **Maximum likelihood** picks the parameter making the observed data most
probable. **Likelihood ratios** compare two parameter values or two models by how much more
probable each makes the data. **Bayes** is what you do when you want a genuine probability
distribution over the parameter — and the price of that is a prior.

> **The likelihood is a function of the parameter, not a distribution over it.** *L*(*p*) = 0.094
> does not mean "*p* has probability 0.094". A likelihood has no units and no absolute meaning;
> only *ratios* of likelihoods mean anything. Every confusion in this chapter, and a large share
> of the misreadings of genomic output in the wild, is a failure to hold this distinction.

---

## 1. The likelihood function, on real allele counts

Take one real SNP: **chr22:20,274,183 C>T** (GRCh38), inside the 22q11.2 region, in the 91
British (GBR) samples of the 1000 Genomes panel.

```python
import gzip, numpy as np
from scipy.stats import binom

def alt_counts(pos, popwant):
    """Alt-allele copies k and chromosome count n at one chr22 site in one population."""
    pop = {}
    for i, line in enumerate(open("labs/data/panel.txt")):
        f = line.rstrip("\n").split("\t")
        if i: pop[f[0]] = f[1]
    for line in gzip.open("labs/data/chr22_sub.vcf.gz", "rt"):
        if line.startswith("##"): continue
        f = line.rstrip("\n").split("\t")
        if line.startswith("#CHROM"):
            keep = [j for j, s in enumerate(f[9:]) if pop.get(s) == popwant]
            continue
        if f[1] != pos: continue
        gts = [f[9:][j] for j in keep]
        return sum(g.count("1") for g in gts), 2 * len(gts)

k, n = alt_counts("20274183", "GBR")
print(f"chr22:20,274,183 C>T in GBR:  {k} alt copies out of {n} chromosomes")

p = np.linspace(0.001, 0.999, 999)
L = binom.pmf(k, n, p)            # <- k and n fixed; p is the variable

print(f"argmax L  = {p[L.argmax()]:.4f}     k/n = {k/n:.4f}")
print(f"L(0.89)   = {binom.pmf(k, n, 0.89):.4e}")
print(f"L(0.50)   = {binom.pmf(k, n, 0.50):.4e}")
print(f"∫L dp     = {np.trapezoid(L, p):.6f}      1/(n+1) = {1/(n+1):.6f}")
```

```
chr22:20,274,183 C>T in GBR:  162 alt copies out of 182 chromosomes
argmax L  = 0.8900     k/n = 0.8901
L(0.89)   = 9.4153e-02
L(0.50)   = 3.6086e-29
∫L dp     = 0.005464      1/(n+1) = 0.005464
```

Three things to take from those four lines.

**The curve peaks at the sample proportion.** For a binomial, the maximum likelihood estimate of
*p* is exactly *k*/*n*. That is reassuring rather than surprising, and it is the general pattern:
where a sensible estimator already exists, maximum likelihood usually recovers it.

**The absolute height is meaningless.** *L*(0.89) = 0.094 is not a probability *of* 0.89. What is
meaningful is the ratio: *L*(0.89)/*L*(0.50) ≈ 2.6 × 10²⁷. The data support *p* = 0.89 over
*p* = 0.50 by twenty-seven orders of magnitude.

**It is not a density over *p*.** The integral is 0.005464 — which is exactly 1/(*n*+1), a
well-known binomial identity, and just as clearly not 1. You could normalise it, and doing so
turns out to be Bayes with a flat prior (§5), but the likelihood itself carries no such
commitment.

Plotted over the region where it is not numerically zero:

```
                                  ****
                                **   **
                               **      *
                              **       **
                             **         **
                            **           **
                           **             *
                          **               *
                        **                 **
                      ***                   ***
                   ****                       **
********************                            ****************
0.75                           p                            1.0
```

Outside roughly [0.82, 0.94] the likelihood is indistinguishable from zero at plotting
resolution. 182 chromosomes is already a lot of information about one number.

## 2. Why everything is done in logs

Likelihoods are products — over reads, over alignment columns, over pedigree members, over
samples — and products of small numbers destroy floating-point arithmetic.

IQ-TREE's fit to the six-genome mitochondrial alignment (`labs/data/phylo/mito.iqtree`) reports a
log-likelihood of −63,510.258 nats. Convert that back:

```python
import numpy as np
logL = -63510.258
print("log10 L      =", round(logL/np.log(10), 1))
print("np.exp(logL) =", np.exp(logL))
print("smallest positive float64 =", np.nextafter(0, 1),
      "-> log =", np.log(np.nextafter(0, 1)))
```

```
log10 L      = -27582.2
np.exp(logL) = 0.0
smallest positive float64 = 5e-324 -> log = -744.4400719213812
```

The likelihood of that alignment is about 10⁻²⁷⁵⁸². A float64 dies below 10⁻³²⁴. Multiplying
per-column probabilities directly underflows to exactly zero after roughly 200 of the 17,421
columns (the exact point depends on the order) — and once it is zero, every subsequent
comparison is between zeros.

Logs fix this completely, and they fix it for free, because **log turns products into sums**:

```
log L(θ) = Σ_i log P(data_i | θ)
```

Sums of ~17,000 numbers of size ~3.6 are perfectly well conditioned. This is why every field in
this curriculum reports a *log*-likelihood, why VCF `PL` fields are Phred-scaled (−10 log₁₀ of a
likelihood, [Ch 46](../part-10-functional-genomics/46-variant-calling.md)), and why LOD scores in
linkage analysis are log₁₀ (§4). It also has a structural pay-off: **log-likelihoods from
independent datasets add**, which is what allowed twentieth-century laboratories to publish LOD
tables that other laboratories could sum with their own.

## 3. Maximum likelihood, done numerically

The principle: **choose the parameter value that makes the observed data most probable.** It is
not a theorem, it is a proposal — but a well-motivated one. Under mild conditions the MLE is
*consistent* (converges to the truth as *n* grows), *asymptotically efficient* (no other
estimator has smaller variance in the limit), and *invariant to reparameterisation* (the MLE of
*d*² is the square of the MLE of *d*, which is emphatically not true of unbiased estimators). It
is not generally unbiased in small samples — the MLE of a variance divides by *n*, not *n*−1,
which is exactly the correction [S3](./S3-sampling-and-estimation.md) introduces.

In practice you almost never do the calculus. You write the negative log-likelihood as a Python
function and hand it to an optimiser.

Here is a real two-parameter case with no clean closed form: fitting an allele frequency **and**
an inbreeding coefficient *F* to genotype counts, at the same SNP in the 107 Yoruba (YRI)
samples — 57 C/C, 45 C/T, 5 T/T. The model is the standard one from
[Ch 26 §8](../part-05-population-genetics/26-hardy-weinberg.md):

```
P(AA) = p² + Fpq        P(Aa) = 2pq(1 − F)        P(aa) = q² + Fpq
```

```python
import numpy as np
from scipy.optimize import minimize
from scipy.stats import chi2

n_aa, n_ab, n_bb = 57, 45, 5          # YRI genotype counts at chr22:20,274,183
N = n_aa + n_ab + n_bb

def neg_ll(theta):
    p, F = theta                       # p = frequency of the reference allele
    q = 1 - p
    P = np.array([p*p + F*p*q, 2*p*q*(1 - F), q*q + F*p*q])
    if not (0 < p < 1) or np.any(P <= 0):
        return np.inf                  # keep the optimiser inside the legal region
    return -(n_aa*np.log(P[0]) + n_ab*np.log(P[1]) + n_bb*np.log(P[2]))

fit = minimize(neg_ll, x0=[0.7, 0.0], method="Nelder-Mead",
               options=dict(xatol=1e-12, fatol=1e-12))
p_hat, F_hat = fit.x
q = (2*n_bb + n_ab) / (2*N)
Ho, He = n_ab/N, 2*q*(1 - q)

print(f"MLE      p = {p_hat:.5f}   F = {F_hat:+.5f}   logL = {-fit.fun:.4f}")
print(f"moment   p = {1-q:.5f}   F = 1 - Ho/He = {1 - Ho/He:+.5f}")
print(f"HWE-constrained (F = 0) logL = {-neg_ll([1-q, 0.0]):.4f}")
D = 2*(-fit.fun + neg_ll([1-q, 0.0]))
print(f"LRT = {D:.4f}  on 1 df,  p = {chi2.sf(D, 1):.4f}     N·F² = {N*(1-Ho/He)**2:.4f}")
```

```
MLE      p = 0.74299   F = -0.10120   logL = -90.1918
moment   p = 0.74299   F = 1 - Ho/He = -0.10120
HWE-constrained (F = 0) logL = -90.7682
LRT = 1.1528  on 1 df,  p = 0.2830     N·F² = 1.0958
```

The numerical MLE reproduces *F̂* = 1 − *H*<sub>o</sub>/*H*<sub>e</sub> to five decimal places.
That formula, which [Ch 26](../part-05-population-genetics/26-hardy-weinberg.md) introduces as an
intuitive ratio, *is* the maximum likelihood estimator of *F* — which is why it is the one
everybody uses. The likelihood-ratio test statistic (1.153) and Ch 26's χ² = *N F̂*² (1.096) are
two asymptotically equivalent tests of the same null, agreeing to the accuracy you should expect
from an asymptotic approximation at *N* = 107. Neither is significant — which is a failure to
reject, not a demonstration of fit. At *N* = 107 the test has about **18% power** against a
departure the size of the one actually estimated (λ = *N F̂*² = 1.10), and would need |*F*| ≈ 0.27
to reach 80%. The honest report is the effect size and its interval, *F̂* = −0.101 ± 1.96/√*N* =
[−0.29, 0.09] — not "this SNP is in Hardy–Weinberg proportions in YRI"
([Ch 26 §5](../part-05-population-genetics/26-hardy-weinberg.md),
[S4 §5](./S4-hypothesis-testing.md)).

### The optimiser API you will actually use

| Call | Use it when |
|---|---|
| `minimize_scalar(f, bounds=(a,b), method="bounded")` | one parameter, known range |
| `minimize(f, x0, method="Nelder-Mead")` | few parameters, no gradient, possibly rough surface |
| `minimize(f, x0, method="L-BFGS-B", bounds=[...])` | many parameters, smooth, box constraints |
| `curve_fit`, `linregress` | least squares — a likelihood in disguise under Gaussian noise ([S5](./S5-variance-and-regression.md)) |

Four practical rules that are not optional. **Minimise the negative log-likelihood** — every
optimiser minimises — and return `np.inf` rather than letting `log` produce `nan`, because an
optimiser that meets `nan` wanders off. **Constrain by reparameterising**: optimise over log θ
for a positive parameter, over the logit for one in (0,1). **Start from several points**, because
likelihood surfaces in genetics are routinely multimodal — the mixture models of
[Ch 46](../part-10-functional-genomics/46-variant-calling.md), the tree space of
[Ch 34](../part-07-molecular-evolution/34-phylogenetics.md) — and one run explores one basin.
And **check `fit.success`**: a converged-looking answer from a non-converged run is the commonest
silent failure in applied likelihood work.

For uncertainty, use the curvature at the peak. The **observed information** is the negative
second derivative of the log-likelihood; its inverse approximates the variance of the MLE, and
`minimize(..., method="BFGS").hess_inv` hands it to you. The more robust alternative, standard in
genetics, is the **profile likelihood**: an approximate 95% interval is the set of parameter
values whose log-likelihood is within 1.92 of the maximum (1.92 = ½ × χ²₁ at 0.95). The worked
example computes one.

## 4. Likelihood ratios as evidence: LOD scores and LRTs

Since absolute likelihoods are meaningless, evidence is always a **ratio**:

```
LR = L(hypothesis 1) / L(hypothesis 0)
```

"The data are LR times more probable under H₁ than under H₀." That is a complete, interpretable
statement, and it is the common ancestor of three things you will meet under different names.

### LOD scores in linkage analysis

The **LOD score** is that ratio written in base-10 logs:

```
Z(θ) = log10 [ L(θ) / L(0.5) ]
```

θ is the recombination fraction — the probability that a given meiosis emits a gamete recombinant
for the two loci — so *L*(θ) is the probability of the observed inheritance pattern if the loci
are linked at θ, and *L*(0.5) is its probability if they assort freely. Z is therefore a
likelihood ratio and nothing else; LOD is "log of the odds". You have met it already, in
[Ch 14 §9](../part-02-transmission-genetics/14-linkage-and-mapping.md), derived there from the
binomial alone; this is the general object of which that is one instance. For *n* phase-known
informative meioses of which *k* are recombinant the likelihood is binomial, so this is a
three-line computation.

```python
import numpy as np
from scipy.optimize import minimize_scalar

n, k = 20, 3                       # 20 informative meioses, 3 recombinant
lod = lambda t: np.log10(t**k * (1-t)**(n-k) / 0.5**n)

fit = minimize_scalar(lambda t: -lod(t), bounds=(1e-6, 0.4999), method="bounded")
print(f"theta_hat = {fit.x:.4f}   Z_max = {-fit.fun:.4f}   LR = {10**-fit.fun:.1f}")
for t in (0.05, 0.10, 0.15, 0.20, 0.30, 0.40):
    print(f"  theta={t:.2f}   Z={lod(t):+.3f}   LR={10**lod(t):6.1f}")
print("posterior odds after a 1:50 prior against linkage =", round(10**-fit.fun / 50, 2))
```

```
theta_hat = 0.1500   Z_max = 2.3490   LR = 223.4
  theta=0.05   Z=+1.739   LR=  54.8
  theta=0.10   Z=+2.243   LR= 174.9
  theta=0.15   Z=+2.349   LR= 223.4
  theta=0.20   Z=+2.276   LR= 188.9
  theta=0.30   Z=+1.819   LR=  65.9
  theta=0.40   Z=+1.055   LR=  11.4
posterior odds after a 1:50 prior against linkage = 4.47
```

The MLE θ̂ = 0.15 is just *k*/*n*, as in §1. *Z*<sub>max</sub> = 2.35 falls short of Morton's
conventional 3.0 — and the last line shows why the bar sits at 3.0 rather than somewhere lower.
Two loci drawn at random from the genome are linked with prior odds around 1:50, so a 1,000:1
likelihood ratio buys 20:1 posterior odds and roughly 5% false positives. A 223:1 ratio buys
4.5:1, which is not a discovery. **The LOD threshold is a Bayesian calculation done once, in
1955, and then hard-coded** — which is exactly why "LOD 3 means *p* < 0.001" is wrong.

```
          **********************
      *****                    ***********
   ***                                    ********
  **                                             ********
 **                                                     ******
 *                                                           ***
 *
*
*
*

*
0                             theta                           0.5
```

The curve is flat near its peak — a 1-LOD-unit support interval runs from θ = 0.034 to θ = 0.366.
Twenty meioses locate a locus to "somewhere on this chromosome arm".

### Likelihood ratio tests

If H₀ is a special case of H₁ obtained by fixing *r* parameters (**nested** models), then under
H₀ the statistic **2 ln LR** is asymptotically χ² on *r* degrees of freedom — Wilks' theorem.
That is the `LRT = 1.1528 on 1 df` line in §3, and it is the machinery behind the molecular-clock
test in [Ch 34](../part-07-molecular-evolution/34-phylogenetics.md) and the nested substitution
model tests in [Ch 33](../part-07-molecular-evolution/33-neutral-theory-and-selection-tests.md).

Two limits worth carrying:

- **Nesting is required.** JC69 ⊂ K80 ⊂ GTR, so LRTs apply; GTR versus a completely different
  model class does not nest, and you need §8's information criteria instead.
- **The χ² is wrong on a boundary.** Testing whether a variance component is zero puts the null
  on the edge of the parameter space, and the correct reference is a 50:50 mixture of χ²₀ and
  χ²₁ — halve the p-value. This matters for the variance-component tests in
  [Ch 31](../part-06-quantitative-genetics/31-heritability-and-selection.md).

And one limit that is not statistical at all: **a likelihood ratio only compares the models you
wrote down.** The best of a set of wrong models is still wrong, and the ratio will not say so.
Every "the data strongly support tree A over tree B" is silent about tree C.

## 5. Bayes for parameters: prior, likelihood, posterior

[S1](./S1-probability.md) introduced Bayes' theorem for events. The same identity, with a
parameter in place of the event:

```
                 P(D | θ) · P(θ)          likelihood × prior
   P(θ | D)  =  ──────────────────   =   ────────────────────
                      P(D)                    the marginal
```

The denominator *P*(*D*) = ∫ *P*(*D*|θ) *P*(θ) dθ — the **marginal likelihood** or **evidence** —
is just the constant that makes the posterior integrate to 1. It is irrelevant for estimating θ
and central for comparing models, where the ratio of two marginals is the **Bayes factor**.

The posterior *is* a probability distribution over the parameter. That is the whole difference,
and the price is the prior.

### A conjugate update on real data

For a binomial likelihood, a Beta prior gives a Beta posterior with the counts simply added —
**Beta(a, b) + k successes in n trials → Beta(a + k, b + n − k)**. The prior behaves exactly like
*a* + *b* pseudo-observations.

Suppose you had only the African frequency of chr22:20,274,183 to go on (alt frequency ≈ 0.26)
and encoded it as Beta(2, 6) — mean 0.25, worth 8 chromosomes. Now feed in the real GBR samples
one at a time:

```python
import gzip, numpy as np
from scipy.stats import beta as Beta

def gbr_dosages(pos="20274183"):
    """Per-individual alt-allele dosage (0/1/2) for the 91 GBR samples."""
    pop = {}
    for i, line in enumerate(open("labs/data/panel.txt")):
        f = line.rstrip("\n").split("\t")
        if i: pop[f[0]] = f[1]
    for line in gzip.open("labs/data/chr22_sub.vcf.gz", "rt"):
        if line.startswith("##"): continue
        f = line.rstrip("\n").split("\t")
        if line.startswith("#CHROM"):
            keep = [j for j, s in enumerate(f[9:]) if pop.get(s) == "GBR"]
            continue
        if f[1] == pos:
            return np.array([f[9:][j].count("1") for j in keep])

alt = gbr_dosages()                     # 91 individuals, in VCF sample order
a0, b0 = 2, 6
print(f"prior Beta({a0},{b0})  mean {a0/(a0+b0):.3f}"
      f"  95% CrI [{Beta.ppf(0.025,a0,b0):.3f}, {Beta.ppf(0.975,a0,b0):.3f}]")
for m in (2, 5, 15, 45, 91):
    k, n = alt[:m].sum(), 2*m
    a, b = a0 + k, b0 + n - k
    lo, hi = Beta.ppf([0.025, 0.975], a, b)
    print(f"  {m:3d} individuals ({n:3d} chr)  k={k:3d}   posterior Beta({a},{b})"
          f"   mean {a/(a+b):.4f}   MLE {k/n:.4f}   95% CrI [{lo:.3f}, {hi:.3f}]")
```

```
prior Beta(2,6)  mean 0.250  95% CrI [0.037, 0.579]
    2 individuals (  4 chr)  k=  4   posterior Beta(6,6)   mean 0.5000   MLE 1.0000   95% CrI [0.234, 0.766]
    5 individuals ( 10 chr)  k=  9   posterior Beta(11,7)   mean 0.6111   MLE 0.9000   95% CrI [0.383, 0.816]
   15 individuals ( 30 chr)  k= 27   posterior Beta(29,9)   mean 0.7632   MLE 0.9000   95% CrI [0.618, 0.882]
   45 individuals ( 90 chr)  k= 83   posterior Beta(85,13)   mean 0.8673   MLE 0.9222   95% CrI [0.794, 0.927]
   91 individuals (182 chr)  k=162   posterior Beta(164,26)   mean 0.8632   MLE 0.8901   95% CrI [0.811, 0.908]
```

```
        .......                       111111     2222   33
      ...     ...                    11    11   22  22  33
     ..          ...               11        1122    2 3 3
    ..             ..             11          12     223  3
    .                ..          11           221     23  3
   ..                 ...       11           22 11    33  3
  ..                    ...    11           22   11   322 3
  .                       ...11             2     11  3 2 3
  .                         11..           22      11 3 2233
 .                        111  ...        22        133  2 3
 .                      111      .....  222          31  223
..                   1111            .222...        331111233
33333333333333333333333333333333333333333333333333333....111333333
0                               p                                1
```

`.` prior · `1` after 5 individuals · `2` after 15 · `3` after 91 (each curve scaled to its own peak).

Read the arithmetic carefully, because it contains both the case for priors and the case against.

**At *n* = 2 the MLE is 1.0** — four alt copies out of four, a degenerate estimate asserting the
allele is fixed. The posterior mean is 0.50. Priors regularise; that is their most defensible
job, and it is why they are everywhere in genomics, where "zero observations" is a constant
condition.

**At *n* = 91 the prior is still visible.** Posterior mean 0.8632 against an MLE of 0.8901. Eight
pseudo-counts against 182 real ones still move the answer by 0.027. With a flat Beta(1,1) prior
the posterior mean is 0.8859. **Priors do not vanish; they get diluted.** Anyone who tells you a
prior "washes out" should be asked at what sample size, and with what error.

### The honest objection to priors

It is this: two competent analysts with the same data can report different posteriors, because
they chose different priors, and no amount of data adjudicates the choice. That is not a
misunderstanding of Bayesian statistics — it is a correct description of it. Three replies, none
of them a knock-down. The prior is **explicit and therefore auditable**, whereas the frequentist
alternative has made choices about model, estimator and test that are no less consequential and
usually less visible. **Sensitivity analysis is cheap**: re-run with a flat, a sceptical and an
enthusiastic prior and report the range; if the conclusion flips, the data were not deciding it.
And in genomics the prior is often **a measured frequency rather than an opinion** — *P*(het) ≈ θ
≈ 10⁻³ is an estimate of human heterozygosity, the 1:50 prior against linkage is a genome-map
calculation. When it is not a measured frequency, it belongs in the methods section, not buried.

## 6. Credible intervals versus confidence intervals

This is the sharpest contrast in the chapter, and the place where the two frameworks are most
often conflated.

| | Confidence interval (S3) | Credible interval |
|---|---|---|
| Built from | the sampling distribution of the estimator | the posterior distribution of the parameter |
| The 95% refers to | the *procedure*, over hypothetical repeated experiments | *this* interval, given *these* data |
| Legitimate statement | "95% of intervals built this way contain the true value" | "there is a 95% probability the parameter lies here" |
| θ is treated as | fixed and unknown | a random variable |
| Needs a prior | no | yes |

> **A confidence interval does not make a probability statement about the parameter.** Once you
> have computed [0.836, 0.928], the true frequency is either in it or not — there is no
> probability left. The 95% is a property of the *method*. A credible interval *does* make the
> statement everyone wants, and it can do so only because the prior turned the parameter into a
> random variable. If you find yourself saying "there's a 95% chance *p* is in here" about a
> confidence interval, you have silently become a Bayesian with an unstated flat prior.

The frequentist claim is checkable by simulation, and checking it is instructive because the
textbook interval often fails:

```python
import numpy as np
from scipy.stats import beta as Beta
rng = np.random.default_rng(0)
n = 182

def wald(k, n):
    ph = k/n; se = np.sqrt(ph*(1-ph)/n); return ph - 1.96*se, ph + 1.96*se
def clopper(k, n):                                   # exact frequentist
    return (0.0 if k == 0 else Beta.ppf(0.025, k, n-k+1),
            1.0 if k == n else Beta.ppf(0.975, k+1, n-k))
def jeffreys(k, n):                                  # Bayesian, Beta(0.5,0.5) prior
    return Beta.ppf([0.025, 0.975], k+0.5, n-k+0.5)

for p_true in (0.89, 0.05, 0.01):
    ks = rng.binomial(n, p_true, 200_000)
    row = []
    for name, f in (("Wald", wald), ("Clopper-Pearson", clopper), ("Jeffreys", jeffreys)):
        lut = {k: f(k, n) for k in np.unique(ks)}
        row.append(f"{name}: {np.mean([lut[k][0] <= p_true <= lut[k][1] for k in ks]):.3f}")
    print(f"p_true={p_true:<5} " + "  ".join(row))
```

```
p_true=0.89  Wald: 0.929  Clopper-Pearson: 0.968  Jeffreys: 0.943
p_true=0.05  Wald: 0.942  Clopper-Pearson: 0.961  Jeffreys: 0.961
p_true=0.01  Wald: 0.838  Clopper-Pearson: 0.989  Jeffreys: 0.962
```

The nominally-95% Wald interval covers 83.8% of the time at *p* = 0.01. And on a real rare
variant it does something worse:

```
k=1/182   MLE 0.00549
   Wald 95% CI       [-0.00525, 0.01623]      <- a negative allele frequency
   Clopper-Pearson   [ 0.00014, 0.03023]
   Jeffreys 95% CrI  [ 0.00059, 0.02539]

k=162/182   MLE 0.89011
   Wald 95% CI       [ 0.84467, 0.93555]
   Clopper-Pearson   [ 0.83539, 0.93157]
   Jeffreys 95% CrI  [ 0.83858, 0.92936]
```

At *k* = 162 all three agree to two decimal places and the philosophical distinction has no
practical consequence. At *k* = 1 — the regime where rare-variant genomics lives
([Ch 54](../part-11-human-and-statistical-genomics/54-rare-variants-and-mendelian-disease.md)) —
the normal approximation produces a negative frequency and the choice matters enormously.
**Use `scipy.stats.beta.ppf` for binomial intervals and never the Wald formula on counts below
about 10.**

## 7. Four places this machinery *is* the method

### 7.1 Bayesian genotype calling

[Ch 46 §2](../part-10-functional-genomics/46-variant-calling.md) builds the genotype posterior.
The likelihood, for genotype *G* = (*X*₁, *X*₂) and reads (*b*ᵢ, *q*ᵢ) with εᵢ = 10^(−*q*ᵢ/10):

```
P(D | G) = ∏_i [ ½ P(b_i | X_1, ε_i) + ½ P(b_i | X_2, ε_i) ]
           where P(b | X, ε) = 1 − ε if b == X, else ε/3

P(G | D) ∝ P(G) · P(D | G)      with P(het) ≈ θ ≈ 10⁻³ for humans
```

Two real sites from `labs/data/aln606.bam` — an *E. coli* run aligned to REL606 — make the case
better than any argument. Both have depth 8. Both have exactly 2 non-reference reads, an allele
fraction of 25%. A counting rule cannot tell them apart.

```python
import numpy as np, pysam
bam = pysam.AlignmentFile("labs/data/aln606.bam", "rb"); CH = bam.references[0]

def pileup(pos, min_bq=1):
    for col in bam.pileup(CH, pos-1, pos, truncate=True, min_base_quality=0, stepper="all"):
        return [(pr.alignment.query_sequence[pr.query_position],
                 pr.alignment.query_qualities[pr.query_position])
                for pr in col.pileups if not (pr.is_del or pr.is_refskip)
                and pr.alignment.query_qualities[pr.query_position] >= min_bq]

def genotype_log10L(reads, R, A):
    out = {}
    for G in (R+R, R+A, A+A):
        out[G] = sum(np.log10(sum(0.5*((1-10**(-q/10)) if b == X else (10**(-q/10))/3)
                                  for X in G)) for b, q in reads)
    return out

prior = (1 - 1.5e-3, 1e-3, 5e-4)                      # hom-ref, het, hom-alt
for pos, R, A in [(322292, "A", "G"), (6699, "G", "A")]:
    reads = pileup(pos)
    L = genotype_log10L(reads, R, A)
    best = max(L.values())
    lp = np.array([L[g] + np.log10(pr) for g, pr in zip(L, prior)])
    post = 10**(lp - lp.max()); post /= post.sum()
    print(f"NC_012967.1:{pos} {R}>{A}  depth {len(reads)}  "
          f"alt {sum(b == A for b, q in reads)}  reads {reads}")
    for g, pl, po in zip(L, (round(-10*(L[g]-best)) for g in L), post):
        print(f"    {g}   log10 L = {L[g]:8.4f}   PL = {pl:4d}   P(G|D) = {po:.5g}")
    print(f"    QUAL = {-10*np.log10(post[0]):.1f}\n")
```

```
NC_012967.1:322292 A>G  depth 8  alt 2  reads [('A', 31), ('A', 31), ('A', 33), ('A', 35), ('G', 41), ('G', 30), ('A', 27), ('A', 34)]
    AA   log10 L =  -8.0563   PL =   56   P(G|D) = 0.002249
    AG   log10 L =  -2.4099   PL =    0   P(G|D) = 0.99775
    GG   log10 L = -21.9632   PL =  196   P(G|D) = 1.3955e-20
    QUAL = 26.5

NC_012967.1:6699 G>A  depth 8  alt 2  reads [('G', 41), ('G', 40), ('G', 48), ('A', 2), ('G', 40), ('A', 2), ('G', 41), ('G', 40)]
    GG   log10 L =  -1.3544   PL =    0   P(G|D) = 0.99997
    GA   log10 L =  -2.8825   PL =   15   P(G|D) = 2.969e-05
    AA   log10 L = -28.7286   PL =  274   P(G|D) = 2.1158e-31
    QUAL = 0.0
```

Identical depth, identical allele fraction, opposite calls — because at 322292 the two
alternate reads carry Q41 and Q30 (error probabilities 8 × 10⁻⁵ and 10⁻³) while at 6699 they
carry Q2 twice (error probability 0.63 each). The likelihood reads the quality strings; a
threshold on allele fraction cannot. This is the entire argument for probabilistic variant
calling, in eight reads.

Two honest caveats. *E. coli* is **haploid** — the reads and qualities are real, the diploid
model is imported for the arithmetic, and `bcftools` correctly called these samples haploid. And
real callers apply BAQ (base alignment quality), which caps qualities in poorly anchored
contexts: run the computation above on the twelve SNVs in `labs/data/filt606.vcf` and it returns
PLs about 40% larger than `bcftools` did, all in the overconfident direction. **The model is not
the whole method; the inputs to the model are engineering.**

### 7.2 Pedigree risk

[Ch 15 §5](../part-02-transmission-genetics/15-pedigrees.md) computes carrier risk with a
four-row table — prior, conditional, joint, posterior — which is Bayes' theorem laid out as a
spreadsheet. An obligate carrier's daughter has three unaffected sons and then a negative carrier
test with 95% sensitivity:

```python
h = {"carrier": 0.5, "non-carrier": 0.5}                     # prior from the pedigree
for label, cond in [("three unaffected sons", {"carrier": 0.5**3, "non-carrier": 1.0}),
                    ("negative 95% assay",    {"carrier": 0.05,   "non-carrier": 1.0})]:
    joint = {k: h[k]*cond[k] for k in h}
    tot = sum(joint.values())
    h = {k: v/tot for k, v in joint.items()}
    print(f"after {label:22s}  P(carrier) = {h['carrier']:.5f}")
```

```
after three unaffected sons   P(carrier) = 0.11111
after negative 95% assay      P(carrier) = 0.00621
```

Three free observations — sons who were never tested — took the risk from 50% to 11%. The assay
took it from 11% to 0.6%. Each row is a likelihood ratio (1/8 and 1/20 respectively); because
log-likelihoods add, the order of the updates is irrelevant and the same 0.00621 comes out
either way.

### 7.3 The ACMG framework is a naive Bayes classifier

[Ch 55 §3](../part-11-human-and-statistical-genomics/55-clinical-variant-interpretation.md)
reconstructs the clinical variant-classification rules as Bayes with hand-set likelihood ratios.
Each evidence code contributes an OddsPath — *P*(evidence | pathogenic) / *P*(evidence | benign) —
and the strength tiers form a geometric ladder, so evidence becomes **additive in points**:
Supporting 1, Moderate 2, Strong 4, Very Strong 8.

```python
pi, X = 0.10, 350.0                       # prior; Very Strong odds
post = lambda N: (pi/(1-pi) * X**(N/8)) / (1 + pi/(1-pi) * X**(N/8))
for N in (10, 8, 6, 5, 0, -7):
    print(f"{N:+3d} points   OddsPath {X**(N/8):8.2f}   posterior {post(N):.4f}")
```

```
+10 points   OddsPath  1513.86   posterior 0.9941
 +8 points   OddsPath   350.00   posterior 0.9749
 +6 points   OddsPath    80.92   posterior 0.8999
 +5 points   OddsPath    38.91   posterior 0.8121
 +0 points   OddsPath     1.00   posterior 0.1000
 -7 points   OddsPath     0.01   posterior 0.0007
```

The committee's qualitative thresholds fall out of the arithmetic: 6 points gives 0.8999, which
is the "Likely pathogenic ≥ 0.90" boundary essentially exactly, and −7 gives 0.0007, under the
"Benign < 0.001" line. A "VUS" is not a borderline variant; it is a variant whose evidence has
not moved the posterior out of [0.10, 0.90]. And the naive Bayes structure exposes the
framework's core weakness: **multiplying likelihood ratios assumes the evidence items are
conditionally independent**, and computational-predictor scores, missense constraint and
paralogue conservation are anything but.

### 7.4 Fine-mapping: posterior inclusion probabilities

[Ch 52 §2](../part-11-human-and-statistical-genomics/52-association-to-mechanism.md) casts
fine-mapping as Bayesian variable selection. Under a single-causal-variant model, each variant
*j* gets an approximate Bayes factor from its *z*-score, and the **posterior inclusion
probability** is the normalised ABF — a softmax over *z*²/2. The **95% credible set** is the
smallest set of variants whose PIPs sum to 0.95.

The demonstration below uses **real 1000 Genomes EUR genotypes** (503 samples, 307 SNPs with
MAF > 5% in chr22:20.40–20.50 Mb) and a **simulated** quantitative phenotype driven by one
variant. The LD is real; the phenotype is not, and is labelled as such.

```python
import gzip, numpy as np
rng = np.random.default_rng(7)

pop, pos, G = {}, [], []
for i, line in enumerate(open("labs/data/panel.txt")):
    f = line.rstrip("\n").split("\t")
    if i: pop[f[0]] = f[2].strip()
for line in gzip.open("labs/data/chr22_sub.vcf.gz", "rt"):
    if line.startswith("##"): continue
    f = line.rstrip("\n").split("\t")
    if line.startswith("#CHROM"):
        keep = [j for j, s in enumerate(f[9:]) if pop.get(s) == "EUR"]; continue
    p = int(f[1])
    if p < 20_400_000: continue
    if p > 20_500_000: break
    g = np.array([f[9+j].count("1") for j in keep], dtype=float)
    if min(g.mean()/2, 1 - g.mean()/2) < 0.05: continue
    pos.append(p); G.append(g)
pos, G = np.array(pos), np.array(G)
N  = G.shape[1]
Gs = (G - G.mean(1, keepdims=True)) / G.std(1, keepdims=True)   # standardised genotypes

c = 184                                     # the SNP with the most r2>0.6 partners
y = 0.30*Gs[c] + rng.normal(size=N)         # SIMULATED phenotype, one causal variant
y = (y - y.mean())/y.std()

beta = Gs @ y / N                           # marginal per-SNP regression, standardised
se   = np.sqrt((1 - beta**2)/(N - 2))
z    = beta/se

W = 0.04                                    # prior variance on the standardised effect
V = se**2                                   # sampling variance of each beta-hat
logABF = 0.5*np.log(V/(V + W)) + 0.5*z**2*W/(V + W)
pip = np.exp(logABF - logABF.max()); pip /= pip.sum()
order = np.argsort(-pip); cum = np.cumsum(pip[order])
cs = order[:int(np.searchsorted(cum, 0.95)) + 1]

r2 = (Gs @ Gs[c] / N)**2
print(f"causal variant {pos[c]}   z = {z[c]:.2f}     "
      f"lead variant {pos[np.argmax(abs(z))]}   z = {z[np.argmax(abs(z))]:.2f}")
print(f"95% credible set: {len(cs)} SNPs spanning {pos[cs].min()}-{pos[cs].max()} "
      f"({(pos[cs].max()-pos[cs].min())/1000:.1f} kb), cumulative PIP {cum[len(cs)-1]:.3f}")
print(f"causal in set? {c in set(cs.tolist())}    causal PIP {pip[c]:.4f}    "
      f"rank {int(np.where(order == c)[0][0]) + 1}\n")
print(" pos          z      PIP     r2 with causal")
for i in order[:6]:
    print(f" {pos[i]}  {z[i]:6.2f}  {pip[i]:7.4f}   {r2[i]:.3f}"
          f"{'   <- causal' if i == c else ''}")
```

```
causal variant 20441830   z = 7.16     lead variant 20441830   z = 7.16
95% credible set: 21 SNPs spanning 20441167-20488097 (46.9 kb), cumulative PIP 0.953
causal in set? True    causal PIP 0.3200    rank 1

 pos          z      PIP     r2 with causal
 20441830    7.16   0.3200   1.000   <- causal
 20445540    7.10   0.2071   0.817
 20448412    7.06   0.1629   0.803
 20481552    6.81   0.0306   0.917
 20480026    6.78   0.0251   0.918
 20474251    6.70   0.0149   0.922
```

Everything worked — the causal variant is the lead, it is in the credible set, it has the highest
PIP — and the highest PIP is **0.32**. Twenty-one variants over 47 kb share the remaining mass,
because at r² > 0.8 they are near-copies of the causal variant and the data cannot separate them.
This is the honest output of a correct method on a clean simulation, and it is why
[Ch 52](../part-11-human-and-statistical-genomics/52-association-to-mechanism.md) insists that a
credible set is a statement about a model rather than a demonstration of causality.

## 8. Model selection: AIC, BIC, and what ModelFinder does

Adding parameters can never decrease the maximised likelihood, so "pick the highest likelihood"
always picks the biggest model. Information criteria penalise:

```
AIC = 2k − 2 ln L̂           BIC = k ln n − 2 ln L̂        (lower is better)
```

*k* is the number of free parameters, *n* the number of observations. AIC targets predictive
accuracy and its penalty per parameter is a flat 2. BIC approximates the log marginal likelihood
and its penalty is ln *n*, which grows with the data — so **BIC prefers smaller models, and
increasingly so as the dataset grows**.

`labs/data/phylo/mito.iqtree` is a real ModelFinder run over 29 substitution models on the
17,421-column primate mitochondrial alignment ([lab 10](../labs/lab-10-phylogenetics.md)). Its
top two rows — *k* recovered from the reported AIC, and confirmed by IQ-TREE's own
`Number of free parameters: 17` line for the winning model:

| Model | log L | *k* | AIC | BIC |
|---|---:|---:|---:|---:|
| TIM2+F+R2 | −63510.258 | 17 | 127054.515 | **127186.528** |
| GTR+F+R2 | −63502.170 | 19 | **127042.340** | 127189.883 |

GTR buys 8.088 log-likelihood units for 2 extra parameters. Work through both penalties with
*n* = 17,421 and ln *n* = 9.7654:

```
ΔAIC = 2(2) − 2(8.088) = −12.176      ->  AIC prefers GTR+F+R2
ΔBIC = 2(9.7654) − 2(8.088) = +3.355  ->  BIC prefers TIM2+F+R2
LRT  = 2(8.088) = 16.176 on 2 df      ->  p = 3.07e-4, reject the smaller model
```

**Two respectable criteria, one dataset, opposite answers** — and the likelihood-ratio test sides
with AIC. This is not a bug. AIC and the LRT both ask "do the extra parameters improve fit more
than chance would"; BIC asks "would a Bayesian with a unit-information prior bet on the bigger
model", and at *n* = 17,421 that is a much higher bar. IQ-TREE reports the model weights
(w-AIC 0.787 for GTR, w-BIC 0.842 for TIM2), which are posterior probabilities over the model set
and a far more honest summary than a single winner. When AIC and BIC disagree the practical
answer is usually that the distinction does not matter — here the two models give the same
topology — and the correct report says which criterion was used.

---

## Common misconceptions

| What people think | What's actually true |
|---|---|
| The likelihood *L*(θ) is the probability that θ is true | It is the probability of the *data* given θ. It is not normalised over θ and has no absolute meaning — only ratios do. Turning it into a probability over θ requires a prior |
| A high likelihood means a good model | Likelihood is only comparable within the set of models you fitted. The best of a bad set is still bad, and no likelihood will tell you the true model was never on the list |
| Maximum likelihood is unbiased | It is consistent and asymptotically efficient, and routinely biased in small samples — the MLE of a variance divides by *n*, which is precisely why *n*−1 exists |
| A 95% confidence interval has a 95% chance of containing the parameter | It does not. 95% of intervals built by that procedure contain it. Only a credible interval licenses the probability statement, and only because a prior made θ a random variable |
| A credible interval and a confidence interval are basically the same | With plenty of data they usually coincide numerically — at *k* = 162/182 they agree to two decimals. At *k* = 1/182 the Wald interval contains negative frequencies. They differ most exactly where genomics operates |
| LOD 3 means p < 0.001 | It means a 1,000:1 likelihood ratio, chosen to overcome ~50:1 prior odds against linkage. The realised false-positive rate is nearer 5% ([Ch 14](../part-02-transmission-genetics/14-linkage-and-mapping.md)) |
| Priors wash out with enough data | They get diluted at a knowable rate. A Beta(2,6) prior still shifts the estimate by 0.027 after 182 chromosomes. "How much does my prior still matter" is a computation, not a reassurance |
| A variant with PIP 0.99 is proven causal | PIP is a posterior under a sparsity prior, an effect-size prior, a maximum number of causal variants, and an LD matrix. Mismatched reference LD produces confident wrong answers with no warning |
| AIC and BIC answer the same question, so use either | AIC estimates predictive loss; BIC approximates a marginal likelihood. Their penalties differ by a factor ln *n*/2, so they systematically disagree on large alignments — as the real ModelFinder table above shows |
| A Bayes factor is a p-value | A Bayes factor compares two specified models on the evidence; a p-value is a tail probability under one of them. A Bayes factor of 20 and *p* = 0.05 are unrelated quantities that happen to be quoted with similar reverence |

## Worked example: how far apart are the human and chimpanzee mitochondrial genomes?

A complete likelihood analysis of a real question, from counts to a credible interval.

**Step 1 — reduce the data to sufficient statistics.** From `labs/data/phylo/mito_aln.fa`, over
the 15,981 columns where both sequences have an unambiguous base:

```
identical      14,599
transitions     1,264      (A<->G, C<->T)
transversions     118
p-distance = (1264+118)/15981 = 0.08648      observed Ts/Tv = 10.71
```

**Step 2 — the naive answer, and why it is wrong.** The p-distance says 8.6% of sites differ. But
a site that mutated twice looks unchanged, so p-distance *underestimates* the number of
substitutions, and increasingly so with distance. Correcting for multiple hits is exactly what a
substitution model is for ([Ch 33](../part-07-molecular-evolution/33-neutral-theory-and-selection-tests.md)).

**Step 3 — write the likelihood.** Under **K80** with distance *d* and transition/transversion
rate ratio κ, the probability that a site ends identical, transitioned, or at one particular
transversion partner is a closed-form function of (*d*, κ). The log-likelihood is a multinomial:

```
log L(d, κ) = n_id·log P_id + n_ts·log P_ts + n_tv·log P_tv
```

```python
import numpy as np
from scipy.optimize import minimize, brentq
from scipy.stats import chi2

nid, nts, ntv = 14599, 1264, 118
n = nid + nts + ntv

def P_k80(d, kappa):
    b  = d/(kappa + 2)
    e1 = np.exp(-4*b)
    e2 = np.exp(-2*d*(kappa + 1)/(kappa + 2))
    return 0.25 + 0.25*e1 + 0.5*e2, 0.25 + 0.25*e1 - 0.5*e2, 0.25 - 0.25*e1

def ll(d, kappa):
    Pi, Pt, Pv = P_k80(d, kappa)
    if min(Pi, Pt, Pv) <= 0: return -np.inf
    return nid*np.log(Pi) + nts*np.log(Pt) + ntv*np.log(Pv)

k80 = minimize(lambda t: -ll(*t), [0.1, 4.0], method="Nelder-Mead",
               options=dict(xatol=1e-12, fatol=1e-12))
jc  = minimize(lambda t: -ll(t[0], 1.0), [0.1], method="Nelder-Mead",
               options=dict(xatol=1e-12, fatol=1e-12))

print("K80 :  d = %.5f   kappa = %.3f   logL = %.3f" % (k80.x[0], k80.x[1], -k80.fun))
print("JC69:  d = %.5f                     logL = %.3f" % (jc.x[0], -jc.fun))
D = 2*(-k80.fun + jc.fun)
print("LRT = %.2f on 1 df, p = %.3g" % (D, chi2.sf(D, 1)))
for nm, k, l in (("JC69", 1, -jc.fun), ("K80", 2, -k80.fun)):
    print("%-5s k=%d  AIC=%.2f  BIC=%.2f" % (nm, k, 2*k - 2*l, k*np.log(n) - 2*l))
```

**Step 4 — maximise, and test the simpler model.** JC69 is K80 with κ fixed at 1, so the models
are nested and Wilks applies:

```
K80 :  d = 0.09422   kappa = 23.333   logL = -5188.352
JC69:  d = 0.09188                     logL = -6221.680
LRT = 2066.65 on 1 df, p = 0
JC69  k=1  AIC=12445.36  BIC=12453.04
K80   k=2  AIC=10380.70  BIC=10396.06
```

(`p = 0` is underflow, not a p-value: 2 ln LR = 2,067 on 1 df is off the far tail of any
representable double.)

One extra parameter buys 1,033 log-likelihood units. Every criterion — LRT, AIC, BIC — rejects
JC69 without hesitation. This is not a marginal call: mitochondrial DNA is heavily
transition-biased, and κ̂ = 23.3 says a transition happens ~23× more readily than a given
transversion. (The raw count ratio was 10.7 because there are two transversion partners per base
and only one transition partner; 2 × 10.7 ≈ 21, and multiple-hit correction supplies the rest.)

**Step 5 — put an interval on *d*, twice.**

```python
# continues from the block above
def profile(d):                                   # maximise over kappa at fixed d
    r = minimize(lambda kk: -ll(d, kk[0]), [k80.x[1]], method="Nelder-Mead",
                 options=dict(xatol=1e-10, fatol=1e-10))
    return -r.fun

f = lambda d: profile(d) - (-k80.fun - 1.920729)   # 1.92 = 0.5 * chi2_1(0.95)
lo, hi = brentq(f, 0.05, k80.x[0]), brentq(f, k80.x[0], 0.2)

grid = np.linspace(1e-4, 0.3, 60000)               # flat prior on d, kappa at its MLE
lp = np.array([ll(d, k80.x[1]) for d in grid]); lp -= lp.max()
post = np.exp(lp); post /= np.trapezoid(post, grid)   # np.trapz on numpy < 2.0
cdf = np.cumsum(post)*(grid[1] - grid[0])

print(f"profile-likelihood 95% CI  d in [{lo:.5f}, {hi:.5f}]")
print(f"posterior mean d = {np.trapezoid(grid*post, grid):.5f}   95% credible interval "
      f"[{grid[np.searchsorted(cdf, 0.025)]:.5f}, {grid[np.searchsorted(cdf, 0.975)]:.5f}]")
```

```
profile-likelihood 95% CI  d in [0.08914, 0.09952]
posterior mean d = 0.09430   95% credible interval [0.08920, 0.09957]
```

**They agree to four decimal places, and they mean different things.** The first says 95% of
intervals built this way would cover the true divergence. The second says there is a 95%
probability the divergence is in that range. At *n* = 15,981 the flat prior contributes nothing
measurable, so the numbers coincide — which is the usual situation in sequence analysis, and
exactly why the distinction is so easy to forget and so damaging in the small-*n* regimes of §6.

**Step 6 — compare with the tool, and be suspicious of the agreement.** IQ-TREE's ML distance for
this pair, under TIM2+F+R2 fitted across the whole six-taxon tree, is **0.1041** — 10% larger
than our 0.0942, and outside our confidence interval.

Our interval is not wrong; it is *conditional on K80 being true*. IQ-TREE's model adds unequal
base composition and among-site rate heterogeneity, both of which increase the estimated number
of hidden substitutions. **Model misspecification moves the point estimate further than sampling
error moves the interval.** That asymmetry is the single most important practical lesson about
likelihood: the interval quantifies the noise, and says nothing whatever about the model.

**The answer.** Human and chimpanzee mitochondrial genomes differ at 8.6% of aligned sites,
implying roughly 0.094–0.104 substitutions per site once multiple hits are corrected — 9–20%
more evolution than the raw count shows, with the residual uncertainty dominated by model choice
rather than by the 15,981 columns of data.

## Where this is used

- [Ch 14](../part-02-transmission-genetics/14-linkage-and-mapping.md) — LOD scores are log₁₀
  likelihood ratios, and the threshold of 3.0 is a prior calculation (§4)
- [Ch 15](../part-02-transmission-genetics/15-pedigrees.md) — the prior/conditional/joint/posterior
  table is Bayes as a spreadsheet (§7.2)
- [Ch 26](../part-05-population-genetics/26-hardy-weinberg.md), [Ch 28](../part-05-population-genetics/28-structure-and-inbreeding.md)
  — *F̂* = 1 − *H*<sub>o</sub>/*H*<sub>e</sub> is the MLE of the inbreeding coefficient (§3)
- [Ch 32](../part-06-quantitative-genetics/32-mapping-quantitative-traits.md) — QTL mapping is
  LOD scores generalised to continuous traits
- [Ch 33](../part-07-molecular-evolution/33-neutral-theory-and-selection-tests.md),
  [Ch 34](../part-07-molecular-evolution/34-phylogenetics.md) — ML phylogenetics, nested model
  tests, and Bayesian posterior probabilities on clades (§4, §8, worked example)
- [Ch 46](../part-10-functional-genomics/46-variant-calling.md) — genotype likelihoods (`PL`),
  posteriors (`QUAL`), joint calling as a better prior (§7.1)
- [Ch 47](../part-10-functional-genomics/47-rna-seq.md) — negative-binomial dispersion estimated
  by likelihood, then shrunk toward a prior fitted across genes
- [Ch 52](../part-11-human-and-statistical-genomics/52-association-to-mechanism.md) — PIPs and
  credible sets (§7.4)
- [Ch 55](../part-11-human-and-statistical-genomics/55-clinical-variant-interpretation.md) — the
  ACMG points system as naive Bayes (§7.3)
- [Ch 56](../part-11-human-and-statistical-genomics/56-cancer-genomics.md) — somatic callers emit
  a log-odds score because there is no discrete genotype to choose between
- [lab 10](../labs/lab-10-phylogenetics.md) — ModelFinder's AIC/BIC table in the wild (§8)

## Check yourself

**1. A colleague reports "the likelihood that the allele frequency is 0.30 is 0.12". What is wrong with that sentence, and what could they legitimately have said?**

<details><summary>Answer</summary>

Two errors. First, 0.12 is *L*(0.30) = *P*(data | *p* = 0.30) — the probability of the *data*
under that parameter value, not a probability attached to the parameter. Second, the number alone
is uninterpretable: multiply the whole likelihood function by any positive constant and the
inference is unchanged, so 0.12 has no absolute meaning.

Legitimate versions: a **ratio** ("the data are 1.3× more probable under *p* = 0.30 than under
*p* = 0.25"), an **estimate plus interval** ("MLE 0.89, 95% profile interval [0.84, 0.93]"), or — if
they will state a prior — an actual **posterior** probability that *p* lies in a stated range.

</details>

**2. Site A has 20 reads, 5 of them alt, all at Q30. Site B has 20 reads, 5 alt, but the alt reads are Q8 and the ref reads Q35. Both have allele fraction 0.25. Without computing, say which gets the higher heterozygous posterior and why — then say what changes if the human prior *P*(het) = 10⁻³ is replaced by a cohort-derived prior of 0.32.**

<details><summary>Answer</summary>

Site A. At Q30 an alt read has error probability 10⁻³, so five of them are almost impossible
under hom-ref and the het:hom-ref likelihood ratio is enormous. At Q8 the error probability is
0.16, so five alt reads out of 20 are entirely consistent with sequencing noise. The counting
statistic is identical; the evidence is not — the §7.1 contrast with different numbers.

Replacing the prior multiplies both sites' het posterior odds by 0.32/10⁻³ ≈ 320, about 2.5 log₁₀
units or 25 Phred points. Site A was already called; site B may now cross the line. That is
exactly the mechanism of joint calling
([Ch 46 §6](../part-10-functional-genomics/46-variant-calling.md)): no reads are shared, the
likelihoods are untouched, and sensitivity improves purely because the cohort supplied a better
prior. It also means the same reads yield different calls in different cohorts — a feature, and
one you must state when you report a callset.

</details>

**3. Two nested substitution models on a 5,000-column alignment: model 1 has 8 parameters and log L = −20,000; model 2 has 11 parameters and log L = −19,994. Which does the LRT choose? AIC? BIC?**

<details><summary>Answer</summary>

The extra fit is Δ log L = 6 for 3 extra parameters.

**LRT:** 2 × 6 = 12 on 3 df, *p* = 0.0074. Reject model 1; choose model 2.

**AIC:** ΔAIC = 2(3) − 2(6) = −6. Negative, so model 2 wins.

**BIC:** ln(5000) = 8.517, so ΔBIC = 3(8.517) − 2(6) = 25.55 − 12 = +13.55. Positive, so model 1
wins, and decisively — a BIC difference above 10 is conventionally "very strong" evidence.

All three are correct answers to different questions: LRT and AIC ask whether the extra
parameters beat chance, while BIC's penalty grows with *n* and punishes them ~4× harder here.
Report which criterion you used, and check whether the disagreement changes any downstream
conclusion — for substitution models it usually does not.

</details>

**4. You observe 0 copies of a variant in 200 chromosomes. Give a maximum likelihood estimate of its frequency and a 95% interval, and explain why the MLE is unhelpful here.**

<details><summary>Answer</summary>

The likelihood *L*(*p*) = (1 − *p*)²⁰⁰ is strictly decreasing, so the MLE is **p̂ = 0** — a point
estimate asserting the variant does not exist, from data that merely failed to see it. The Wald
interval is [0, 0], because the standard error is √(0 × 1/200) = 0. Both are useless, and both
are what a naive pipeline will report.

The likelihood function itself is fine; it just has no interior maximum, so take an interval from
it instead. The one-sided exact (Clopper–Pearson) upper bound solves (1 − *p*)²⁰⁰ = 0.05, giving
*p* < 0.0149 — which `scipy.stats.beta.ppf(0.95, 1, 200)` also returns, and which is the "rule of
three": with zero events in *n* trials the 95% upper bound is about 3/*n*. A Jeffreys posterior,
Beta(0.5, 200.5), gives a posterior mean of 0.0025 and a 95% credible upper bound of 0.0095 — a
small non-zero estimate and a tighter bound, because a Bayesian interval need not be conservative
at every true *p*.

MLEs on the boundary of the parameter space are uninformative, and that is the regime
rare-variant genomics lives in. Report an upper bound, not a point estimate.

</details>

**5. A fine-mapping run returns a 95% credible set of 12 variants; the lead has PIP 0.44. A collaborator says "so there's a 44% chance the lead variant is causal, and a 95% chance the causal variant is one of these 12". How much of that is right?**

<details><summary>Answer</summary>

The *form* of both statements is right — unlike a confidence interval, a posterior does license
probability statements about the unknown, and that is the point of §6. What is wrong is the
implied unconditionality.

Both numbers are conditional on a sparsity prior, an effect-size prior (*W* in §7.4, which scales
every ABF), a maximum number of causal variants, an LD matrix that may have come from a reference
panel rather than the study samples, and the assumption that the causal variant was genotyped or
imputed at all. If the true causal variant is absent from the panel, the set contains it with
probability 0 while still reporting 0.95. Change the effect-size prior and the PIPs move; change
the causal-variant cap and the set can split in two; use the wrong LD reference and the set can
confidently exclude the truth.

The defensible phrasing is "under this model, 95% of the posterior mass lies on these 12
variants" — and the honest follow-up is that PIP 0.44 across 12 candidates in high LD is what
success looks like, not a failure to be optimised away with a bigger sample
([Ch 52](../part-11-human-and-statistical-genomics/52-association-to-mechanism.md)).

</details>
