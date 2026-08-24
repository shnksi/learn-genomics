# Problem set 10A — Functional genomics

Covers [Ch 46–50](../part-10-functional-genomics/46-variant-calling.md).

**Attempt before revealing.** Part 10 is where genomics stops being about what a sequence *is*
and starts being about what a measurement *supports*. Every problem here has the same skeleton:
you are handed counts, and the counts do not mean what they appear to mean until you have
supplied a model, a background, or a denominator. The set is built to expose the specific place
where each of you will supply the wrong one — a threshold instead of a posterior, a library size
instead of a size factor, a genome-wide null instead of a local one, an average instead of a
distribution.

Roughly in order of difficulty. ★ marks the two harder problems; ★★ the capstone, which is
worth the most time.

Conventions used throughout, so nothing is ambiguous: logarithms are base 10 unless the symbol
says otherwise; Phred quality *q* means an error probability of `10^(-q/10)`; PL is
`10 × (log10 L_best - log10 L_G)` rounded to the nearest integer; QUAL is
`-10 log10 P(hom-ref | D)` and therefore *includes* the prior, while PL and GQ do not.

---

## 1. A pileup, three genotypes

A germline caller reaches a site on chr1 (coordinates illustrative, GRCh38). The reference base
is **C**, the candidate alternate is **T**, and the pileup has depth 8:

| Reads | Base | Base quality |
|---|---|---|
| 6 | C (reference) | Q30 |
| 2 | T (alternate) | Q30 |

All reads are MQ60, duplicates are marked, and the eight reads split evenly across strands.

**(a)** Write down the emission model and compute `P(b | X, eps)` for a reference read and for an
alternate read under each of the three genotypes CC, CT and TT.
**(b)** Compute `log10 P(D | G)` for all three genotypes.
**(c)** Give the PL triple and GQ.
**(d)** A legacy pipeline calls a variant when there are **at least 3 alternate reads and an
alternate fraction of at least 20%**. What does it call here? What does the likelihood say?

<details><summary>Solution</summary>

**(a)** The quality score *is* an error probability: `eps = 10^(-q/10)`, so Q30 gives
eps = 0.001 and eps/3 = 3.3333 × 10^-4 (an error goes to one of the three other bases).

For a haploid template allele *X*: `P(b | X) = 1 - eps` if `b == X`, else `eps/3`.
A diploid genotype is two haplotypes and each read is drawn from one with probability 1/2:

| Genotype | reference read (b = C) | alternate read (b = T) |
|---|---|---|
| CC | 1 - eps = **0.999** | eps/3 = **3.3333 × 10^-4** |
| CT | ½(0.999) + ½(3.3333e-4) = **0.4996667** | ½(3.3333e-4) + ½(0.999) = **0.4996667** |
| TT | eps/3 = **3.3333 × 10^-4** | 1 - eps = **0.999** |

Look hard at the CT row. **The heterozygous term is the same for both read types.** At fixed
depth and fixed quality, the het likelihood is `0.4996667^8` no matter how the eight reads split
between C and T. All of the discrimination in this problem lives in the two homozygous rows.
That is worth knowing before you compute anything: the alt *count* enters only through how badly
it embarrasses CC and TT.

**(b)** Take logs and add. `log10(0.999) = -0.0004345`, `log10(3.3333e-4) = -3.4771213`,
`log10(0.4996667) = -0.3013196`.

```
CC :  6(-0.0004345)  + 2(-3.4771213)   =  -0.002607 -  6.954243  =   -6.956850
CT :  8(-0.3013196)                    =                             -2.410557
TT :  6(-3.4771213)  + 2(-0.0004345)   = -20.862728 -  0.000869  =  -20.863597
```

**(c)** CT is the best genotype. Normalise to it and multiply by 10:

```
PL(CC) = 10 × (-2.410557 + 6.956850)  =  45.463  ->  45
PL(CT) = 0
PL(TT) = 10 × (-2.410557 + 20.863597) = 184.530  -> 185

PL = 45, 0, 185          GQ = 45 - 0 = 45
```

**(d)** The rule calls **no variant**. There are 2 alternate reads, not 3. (The allele fraction,
2/8 = 0.25, clears the 20% bar; it is the read count that fails.)

The likelihood ratio in favour of the heterozygote is `10^4.5463`, about **35,000 : 1**. The rule
threw that away.

Two ways to see why the rule is not merely unlucky here but structurally wrong.

*The threshold is not depth-calibrated.* "At least 3 alt reads" is a stringent test at depth 8
and a trivial one at depth 200, where pure Q30 error produces alt reads on its own. The
threshold is fixed; the evidence it is supposed to represent is not. In the likelihood, depth
enters the calculation rather than the cut-off, so the operating point does not drift.

*The classic wrong answer is the allele-balance one.* Many people reject this site with "a
heterozygote should be near 50%, and 25% is nowhere near." Compute what a true het at depth 8
actually does. The alt count is Binomial(8, ½), so

```
P(alt count <= 2)  =  (1 + 8 + 28)/256  =  37/256  =  0.1445
```

**One true heterozygote in seven, at depth 8, yields two or fewer alt reads.** An allele-fraction
rule applied at low depth does not filter artefacts; it filters shallow sites.

What this site has *not* yet received is a prior. GQ = 45 is a statement about the data alone.
Whether the caller emits a variant depends on the next problem.

</details>

---

## 2. Same reads, three contexts ★

Keep problem 1's site: 6 reference reads at Q30, 2 alternate reads at Q30, depth 8.

**(a)** Apply the single-sample genome-wide prior: P(hom-ref) = 0.9985, P(het) = 10^-3,
P(hom-alt) = 5 × 10^-4. Compute the posterior and QUAL. Compare QUAL with the GQ you got in
problem 1.
**(b)** The sample turns out to be one of 500 in a joint-genotyping run, and across the cohort
the T allele segregates at frequency *f* = 0.20. Re-derive the prior from Hardy–Weinberg and
recompute. Does the site now clear a QUAL ≥ 30 filter?
**(c)** Return to the single-sample prior, but suppose the two alternate reads were **Q10**
rather than Q30. Same counts, same allele fraction. Recompute the likelihoods, PL, GQ and the
posterior.
**(d)** State precisely what joint calling shared between samples, and what it did not.

<details><summary>Solution</summary>

**(a)** Add the log priors to the log likelihoods.
`log10(0.9985) = -0.000652`, `log10(10^-3) = -3`, `log10(5e-4) = -3.30103`.

```
CC :  -6.956850 - 0.000652  =   -6.957502
CT :  -2.410557 - 3.000000  =   -5.410557     <- best
TT : -20.863597 - 3.301030  =  -24.164627
```

CT wins by 1.546945 log units. Normalising the three terms,
**P(hom-ref | D) = 0.02760**, so

```
QUAL = -10 log10(0.02760) = 15.59
```

**GQ = 45, QUAL = 15.6.** These are not the same quantity and confusing them is the standard
error. GQ measures how much better the best genotype fits *the reads* than the runner-up; QUAL
measures how confident you are that the site is not hom-ref *after* paying the price of a
1-in-1,000 prior. The 30-point gap is exactly that price. A pipeline with `QUAL >= 30` discards
this site while its own PL field records 35,000:1 evidence for a heterozygote.

**(b)** Hardy–Weinberg at *f* = 0.20 ([Ch 26](../part-05-population-genetics/26-hardy-weinberg.md)):

```
P(hom-ref) = (1-f)^2 = 0.64        log10 = -0.193820
P(het)     = 2f(1-f) = 0.32        log10 = -0.494850
P(hom-alt) = f^2     = 0.04        log10 = -1.397940
```

```
CC :  -6.956850 - 0.193820  =   -7.150670
CT :  -2.410557 - 0.494850  =   -2.905407     <- best
TT : -20.863597 - 1.397940  =  -22.261537
```

**P(hom-ref | D) = 5.685 × 10^-5**, so **QUAL = 42.45**. The site clears QUAL ≥ 30 comfortably.

Nothing about the reads changed. The prior moved from 10^-3 to 0.32 — a factor of 320, or 2.505
log units — and QUAL rose by 26.9. **That is the whole mechanism of joint genotyping.** The
weak per-sample evidence was always there; what the cohort supplied was the information that
this position is a real segregating site, which is not a property of this sample's reads and
could never have been recovered from them.

**(c)** Q10 means eps = 0.1, so eps/3 = 0.033333 and the het term for an alt read becomes
½(0.033333) + ½(0.9) = 0.4666667. `log10(0.033333) = -1.4771213`, `log10(0.9) = -0.0457575`,
`log10(0.4666667) = -0.3309932`.

```
CC :  6(-0.0004345) + 2(-1.4771213)  =   -2.956850
CT :  6(-0.3013196) + 2(-0.3309932)  =   -2.469904     <- best likelihood
TT :  6(-3.4771213) + 2(-0.0457575)  =  -20.954243

PL = 5, 0, 185          GQ = 5
```

Now the prior:

```
CC :  -2.956850 - 0.000652  =   -2.957502     <- best posterior
CT :  -2.469904 - 3.000000  =   -5.469904
TT : -20.954243 - 3.301030  =  -24.255273
```

**The posterior maximum flips to hom-ref**, by 2.512 log units — a factor of 325.
QUAL collapses to 0.013.

Hold both facts at once, because the VCF does:

- The **likelihood** still prefers the heterozygote, by 0.4869 log units, a factor of 3.07. The
  reads are still better explained by CT than by CC.
- The **posterior** prefers hom-ref, because a factor of 3 cannot pay a 1-in-1,000 prior.
- GQ falls from **45 to 5** — the same two alternate reads, a ninth of the Phred *score* but
  **four orders of magnitude of evidence** (about 32,000:1 down to about 3:1) — because
  GQ is prior-free and reports only that the data no longer distinguish the genotypes.

And the priors interact with the qualities: under the *cohort* prior these same degraded reads
give CT back, but only by 0.1859 log units (a factor of 1.53) and QUAL 4.04. Prior and evidence
are not two independent switches; the call is their product.

**(d)** Joint calling shared **the estimate of which sites are polymorphic and at what frequency**
— nothing else. Every sample's PL was computed from its own reads and its own base qualities and
never changed. No read from any other sample entered this sample's likelihood.

That is why PL is deliberately kept prior-free: it is a sufficient summary of the site's data, so
a later step can substitute a better prior — from a cohort, a population allele frequency, or a
pedigree — without going back to the BAM. Bake the prior into PL and joint genotyping would
require reprocessing every sample every time the prior improved, which is the N+1 problem gVCF
exists to avoid.

The classic wrong answer is "joint calling works because 500 samples give you more reads at the
site." It does not pool reads. It pools *knowledge about where variants are*.

</details>

---

## 3. What a QUAL threshold buys, and what it does not

**(a)** Two heterozygous calls in the same callset both carry QUAL 150. Site X has DP 12; site Y
has DP 250. Compute QD for each and say which you distrust.
**(b)** A third call has depth 60: 30 reference reads (15 forward, 15 reverse) and 30 alternate
reads, **all on the forward strand**. All bases are Q30, all reads MQ60, allele balance is
exactly 0.50. Taking the reference reads' strand split as the expected strand probability,
compute the probability of seeing all 30 alternate reads on one strand. Would a callset of
4,000,000 variants produce one such site by chance?
**(c)** The callset's genome-wide Ti/Tv is **1.70**. Model it as a mixture of true variants at
Ti/Tv = 2.05 and false positives with a near-random spectrum at Ti/Tv = 0.5. What fraction of
the callset is false?
**(d)** You raise the QUAL threshold. 92% of the 4,000,000 calls survive and Ti/Tv rises to
**1.88**. How many true and how many false positives did the threshold remove? What is the
largest Ti/Tv this filter could possibly have produced at 92% retention, and what would it mean
if someone reported a higher one?

<details><summary>Solution</summary>

**(a)** QD = QUAL / depth.

```
site X :  150 / 12  = 12.5
site Y :  150 / 250 =  0.6
```

**Distrust Y.** QUAL rises roughly linearly with depth because every additional independent
read adds evidence, so a QUAL of 150 is an unremarkable achievement at DP 250 and a strong one
at DP 12. Normalising by depth is what makes the number comparable across sites. Y is the
signature of a site where a great many reads each contribute a little — a low-fraction mixture,
a mismapped pile, or contamination — rather than a site where a modest number of reads
contribute a lot.

This is also why QUAL alone is a poor filter and why the chapter's worked example flags QD =
3.75 as "passing, but not comfortably". A raw QUAL threshold is partly a depth threshold.

**(b)** The reference reads split 15/15, so the expected forward probability is 0.5.

```
P(all 30 alt reads forward)  =  0.5^30  =  9.313 × 10^-10
two-sided (either strand)    =  2 × 0.5^30 = 2^-29 = 1.863 × 10^-9
```

Expected number of such sites among 4,000,000 calls:

```
4 × 10^6 × 1.863 × 10^-9 = 0.00745
```

About **one such site every 134 genomes**. This is not chance.

The instructive part is that *every other statistic on this site is perfect*. Depth 60, allele
balance exactly 0.50, all bases Q30, all reads MQ60 — the genotype model, which conditions on
reads being correctly placed and independently erroneous, sees a textbook heterozygote and will
report a QUAL in the hundreds. Only the statistic that asks **where the reads came from**
detects the problem. That is the general shape of filtering: it must test the assumptions the
genotype model conditions on, not re-examine the same column.

**(c)** Write the transition *fraction* of a set with ratio *r* as `r/(1+r)`, and let *p* be the
true-variant fraction:

```
p × (2.05/3.05)  +  (1 - p) × (0.5/1.5)   =   1.70/2.70
p × 0.672131     +  (1 - p) × 0.333333    =   0.629630
p × 0.338798                              =   0.296296
                                       p  =   0.874552
```

So about **12.5% false positives**, inferred from one summary statistic with no truth set at
all. That is what Ti/Tv is for: it is orthogonal to every per-variant quality score and sensitive
to exactly the failure mode those scores are least trustworthy about.

**(d)** Start from 4,000,000 calls at p = 0.874552:

```
TP(before) = 0.874552 × 4,000,000 = 3,498,208
FP(before) = 0.125448 × 4,000,000 =   501,792
```

After the filter, 3,680,000 calls remain at Ti/Tv 1.88. Solving the same mixture equation with
`1.88/2.88 = 0.652778` gives p = 0.942876:

```
TP(after)  = 0.942876 × 3,680,000 = 3,469,785
FP(after)  = 0.057124 × 3,680,000 =   210,215
```

```
removed in total : 320,000
removed FP       : 501,792 - 210,215 = 291,577
removed TP       : 3,498,208 - 3,469,785 =  28,423
```

**The threshold bought a 10.3 : 1 exchange rate** — about ten false positives discarded for every
true one lost. Precision went from 87.5% to 94.3% at a cost of 0.8% of recall. That is what a
QUAL threshold actually buys, stated as a number rather than as a feeling.

Now the ceiling. If the filter were perfect and removed nothing but false positives, all
3,498,208 true variants would survive among the 3,680,000 retained, giving p = 0.950600 and

```
Ti/Tv(max at 92% retention) = 1.902
```

**No filter that retains 92% of this callset can produce a Ti/Tv above 1.90.** So if a
collaborator reports 92% retention and Ti/Tv 1.95, one of three things is true and none of them
is "the callset got cleaner than I thought": the assumed endpoints (2.05 and 0.5) are wrong for
this data, the artefacts are not spectrum-random, or — most commonly — **the filter is
correlated with transition status and is improving the metric rather than the callset.**

That last case is the real trap. Ti/Tv is a *diagnostic*, not an objective function. Optimise a
filter against it and you will find one that preferentially keeps transitions, which is
achievable without removing a single artefact. And note what none of this tells you: which
individual calls are wrong, and anything whatsoever about false negatives.

</details>

---

## 4. Normalisation, and the assumption underneath it

Six genes of equal effective length, two RNA-seq libraries. An orthogonal single-molecule FISH
experiment establishes the ground truth: **genes A–E did not change; gene F rose 6-fold.**

| gene | control | treated |
|---|---:|---:|
| A | 1,200 | 600 |
| B | 800 | 400 |
| C | 1,600 | 800 |
| D | 2,000 | 1,000 |
| E | 400 | 200 |
| F | 4,000 | 12,000 |
| **total** | **10,000** | **15,000** |

**(a)** Scale each library by its total count and report the log2 fold changes. Compare with the
truth.
**(b)** Compute median-of-ratios size factors, the normalised counts and the log2 fold changes.
Then read the size factors themselves: what have they inferred about the cells?
**(c)** A second experiment, same six genes, equal library sizes. The truth this time is that
**A, B, C and D each rose 4-fold while E and F did not change.**

| gene | control | treated |
|---|---:|---:|
| A | 3,000 | 4,000 |
| B | 3,000 | 4,000 |
| C | 3,000 | 4,000 |
| D | 3,000 | 4,000 |
| E | 3,000 | 1,000 |
| F | 3,000 | 1,000 |
| **total** | **18,000** | **18,000** |

Apply median-of-ratios. What does it report?
**(d)** Repeat (c) having added 2,000 spike-in molecules per cell to both samples and sequenced
20,000 reads from each. Show that the truth is recovered.

<details><summary>Solution</summary>

**(a)** Divide each count by its library total.

```
gene A :  (600/15,000) / (1,200/10,000)  =  0.04/0.12  =  0.3333   ->  log2 = -1.585
```

and identically for B, C, D, E. For F:

```
gene F :  (12,000/15,000) / (4,000/10,000) = 0.80/0.40 = 2.000     ->  log2 = +1.000
```

The report: **five genes down 3-fold, one gene up 2-fold.** Every one of the six numbers is
wrong. The truth is five genes flat and one up 6-fold.

The library size was never a measurement of anything — it is a setting on the machine. Because
the measured proportions sum to one, gene F rising drags every other proportion down
mechanically, and total-count scaling reads that arithmetic as biology.

**(b)** Reference pseudo-sample = per-gene geometric mean across the two samples.

```
A: sqrt(1,200 × 600)     =   848.53      D: sqrt(2,000 × 1,000)  = 1,414.21
B: sqrt(  800 × 400)     =   565.69      E: sqrt(  400 ×   200)  =   282.84
C: sqrt(1,600 × 800)     = 1,131.37      F: sqrt(4,000 × 12,000) = 6,928.20
```

Ratio of each count to its gene's reference:

```
          A         B         C         D         E         F
ctrl   1.414214  1.414214  1.414214  1.414214  1.414214  0.577350
treat  0.707107  0.707107  0.707107  0.707107  0.707107  1.732051
```

Size factor = median ratio within each sample. With six genes the median is the mean of the
third and fourth sorted values, and in both samples those are the repeated value:

```
ctrl  sorted: 0.577350, 1.414214 × 5   ->  s_ctrl  = 1.414214
treat sorted: 0.707107 × 5, 1.732051   ->  s_treat = 0.707107
```

The one gene that actually changed sits at an end of each sorted list and cannot move the
median. That is the entire robustness argument, and it is why the estimator is a median rather
than a mean.

Normalise (K / s):

```
gene    control                 treated                  log2 FC
A       1,200/1.4142 =   848.5  600/0.7071   =   848.5     0.000   correct
B         800/1.4142 =   565.7  400/0.7071   =   565.7     0.000   correct
C       1,600/1.4142 = 1,131.4  800/0.7071   = 1,131.4     0.000   correct
D       2,000/1.4142 = 1,414.2  1,000/0.7071 = 1,414.2     0.000   correct
E         400/1.4142 =   282.8  200/0.7071   =   282.8     0.000   correct
F       4,000/1.4142 = 2,828.4  12,000/0.7071= 16,970.6   +2.585   6-fold, correct
```

**Reading the size factors.** `s_treat / s_ctrl = 0.7071/1.4142 = 0.500`. Counts are divided by
*s*, so the smaller factor scales the treated counts *up* by two. The method has inferred that
one treated read represents twice as much per-cell material as one control read. Check it: the
normalised totals are 7,071 and 21,213, a ratio of **3.0** — the treated cell carries three times
the RNA, sampled by 1.5 times as many reads, hence two units of material per read against one.
The scale information was never in the data; it was reconstructed entirely from the assumption
that most genes did not change.

**(c)** Same procedure.

```
geometric means:  A–D: sqrt(3,000 × 4,000) = 3,464.10    E,F: sqrt(3,000 × 1,000) = 1,732.05

          A         B         C         D         E         F
ctrl   0.866025  0.866025  0.866025  0.866025  1.732051  1.732051
treat  1.154701  1.154701  1.154701  1.154701  0.577350  0.577350

s_ctrl = 0.866025      s_treat = 1.154701
```

```
gene    control                 treated                  log2 FC
A–D     3,000/0.8660 = 3,464.1  4,000/1.1547 = 3,464.1    0.000
E,F     3,000/0.8660 = 3,464.1  1,000/1.1547 =   866.0   -2.000
```

**It reports A–D unchanged and E and F down 4-fold. The truth is A–D up 4-fold and E and F
unchanged.** Not merely wrong — exactly inverted, for all six genes, with tight confidence
intervals and a beautiful p-value.

Total-count scaling gives the identical answer here, because the library sizes are equal. Both
methods agree, and both are wrong, which is the point: this is not estimator error. Median-of-
ratios rests on the assumption that **most genes do not change, and those that do are not all in
the same direction.** Four of six moved together. The median tracked the majority, absorbed
their shift into the size factor, and re-expressed the two stationary genes as the ones that
moved.

And the data genuinely cannot tell you otherwise. Composition is all a sequencer measures. The
observed table is exactly what you would see if A–D were flat and E and F fell 4-fold with total
RNA constant. **This is non-identifiability, not a bug**, and no amount of further computation
resolves it. (It is the same wall as "everything doubled": a uniform global shift produces an
identical composition and is invisible.)

**(d)** Spike-ins supply the external scale. Take each endogenous gene at **1,000 molecules per
cell in control** — the fold changes below turn out not to depend on that figure, which is worth
checking once you have them. Control cell: 6 × 1,000 endogenous + 2,000 spike =
8,000 molecules. Treated cell: 4 × 4,000 + 2 × 1,000 + 2,000 = 20,000 molecules. Sequencing
20,000 reads from each in proportion:

```
control :  spike = 20,000 × 2,000/8,000  = 5,000   each gene = 20,000 × 1,000/8,000  = 2,500
treated :  spike = 20,000 × 2,000/20,000 = 2,000   A–D       = 20,000 × 4,000/20,000 = 4,000
                                                   E,F       = 20,000 × 1,000/20,000 = 1,000
```

Now normalise by the spike count, which is a fixed number of molecules per cell by construction:

```
gene A :  control 2,500/5,000 = 0.50    treated 4,000/2,000 = 2.00    FC = 4.0   correct
gene E :  control 2,500/5,000 = 0.50    treated 1,000/2,000 = 0.50    FC = 1.0   correct
```

The truth is recovered. Note what supplied it: not a better algorithm, but a quantity added
**per cell** that the sequencer's simplex could not rescale away. When the "most genes don't
change" assumption fails — global transcriptional amplification, a transcription inhibitor, a
MYC-amplified tumour against normal tissue — the only remedies are external: spike-ins added per
cell or per unit mass, or an independent cell count.

</details>

---

## 5. Replicates, depth, and what the top of your list is ★

The variance of a log fold change between two groups of size *n_1* and *n_2*, for a gene with
mean count mu and dispersion alpha:

```
Var(log2 FC)  ≈  (1/ln 2)^2 × (1/n_1 + 1/n_2) × (1/mu + alpha)
```

Take alpha = 0.04 throughout.

**(a)** Let n_1 = n_2 = *n*, let the total budget be *R* million reads split equally across the
2*n* libraries, and let the gene receive *c* counts per million reads sequenced in a library.
Show that

```
Var(log2 FC)  ≈  (1/ln 2)^2 × [ 4/(cR)  +  2·alpha/n ]
```

and say what each term depends on.
**(b)** You have R = 240 million reads and c = 10. Compare **n = 4 per group at 30M each** with
**n = 6 per group at 20M each**. Then find the per-sample depth at which the n = 4 design would
match the n = 6 design.
**(c)** Six genes from a completed n = 3 experiment. Compute SD(log2 FC), the Wald statistic
z = log2 FC / SD, and a two-sided p-value against a normal reference. Rank the genes by p and by
|log2 FC|.

| gene | mean normalised count mu | true log2 FC |
|---|---:|---:|
| A | 30,000 | 0.90 |
| B | 4,000 | 1.10 |
| C | 250 | 1.30 |
| D | 25 | 1.60 |
| E | 15 | 1.66 |
| F | 8 | 2.20 |

**(d)** Apply Benjamini–Hochberg at q = 0.05 over m = 20,000 tested genes. Then apply independent
filtering, which removes 8,000 low-count genes before correction. Which gene changes status, and
why is this not cheating?

<details><summary>Solution</summary>

**(a)** With equal groups, `1/n_1 + 1/n_2 = 2/n`. Each of the 2*n* libraries gets
`D = R/(2n)` million reads, so `mu = cD = cR/(2n)` and `1/mu = 2n/(cR)`. Substituting:

```
Var(log2 FC) ≈ (1/ln 2)^2 × (2/n) × ( 2n/(cR) + alpha )
             = (1/ln 2)^2 × [ 4/(cR)  +  2·alpha/n ]
```

Read the two terms:

- `4/(cR)` — the **sampling** term. It depends on the *total* budget *R* and on the gene's
  expression, and **not at all on how you split the budget across samples.** Reallocating a fixed
  number of reads between more or fewer libraries leaves it exactly unchanged.
- `2·alpha/n` — the **biological** term. It depends only on the number of replicates, and it has
  no floor of zero: it falls as 1/*n* forever.

So at a fixed budget the depth term is a constant of the experiment, and the only thing you
control is *n*. **More replicates at fixed cost is a strict improvement, for every gene, at every
expression level, for any alpha > 0.** That is a sharper statement than "replicates beat depth",
and it falls straight out of the algebra.

Sanity check against the chapter's crossover: the two bracket terms of the original expression
are equal at mu = 1/alpha = 25. Quadrupling depth from mu = 25 to mu = 100 takes the bracket from
0.0800 to 0.0500, a 37.5% cut; quadrupling forever thereafter can only reach 0.0400, a further
20% of the current value. The dispersion is a wall.

**(b)** cR = 10 × 240 = 2,400.

```
n = 4 :  30M per sample, mu = 300
         Var/(1/ln2)^2 = 4/2400 + 2(0.04)/4 = 0.001667 + 0.020000 = 0.021667
         Var           = 2.081369 × 0.021667 = 0.045096

n = 6 :  20M per sample, mu = 200
         Var/(1/ln2)^2 = 4/2400 + 2(0.04)/6 = 0.001667 + 0.013333 = 0.015000
         Var           = 2.081369 × 0.015000 = 0.031221
```

The sampling terms are identical, exactly as (a) predicted. Ratio 0.6923: the twelve-sample
design cuts the variance by **30.8%** and the standard error by **16.8%**, at the same cost.

Now the depth question, and the answer is the memorable part. As depth goes to infinity at
n = 4, the variance falls to its floor:

```
floor(n = 4) = (1/ln2)^2 × 2(0.04)/4 = 0.041627
Var(n = 6)   =                         0.031221
```

**The n = 4 design cannot reach the n = 6 design at any depth whatsoever.** Its floor is a third
above the twelve-sample design's actual variance. There is no amount of sequencing that
substitutes for two more biological replicates, and this is not rhetoric — it is the statement
that alpha does not depend on mu.

The honest caveat is that the model, not the conclusion, has limits. `Var(log K) ≈ Var(K)/mu^2` is
a delta-method approximation and it requires mu to be comfortably away from zero. At mu of order
10 or less — many isoform-level counts, low-expression genes, single-cell pseudobulk of a rare
type — counts are frequently zero, the log is undefined, and the approximation that generated
this clean decomposition stops holding. That is where "spend it on depth" can become the right
answer, and it is an out-of-model judgement, not something the formula tells you.

**(c)** With n = 3 per group, `(1/n_1 + 1/n_2) = 2/3` and `(1/ln 2)^2 = 2.081369`.

| gene | mu | 1/mu + alpha | Var | SD | z | p (two-sided) |
|---|---:|---:|---:|---:|---:|---:|
| A | 30,000 | 0.0400333 | 0.055549 | 0.23569 | 3.819 | 1.34 × 10^-4 |
| B | 4,000 | 0.0402500 | 0.055850 | 0.23633 | 4.655 | 3.25 × 10^-6 |
| C | 250 | 0.0440000 | 0.061053 | 0.24709 | 5.261 | 1.43 × 10^-7 |
| D | 25 | 0.0800000 | 0.111006 | 0.33318 | 4.802 | 1.57 × 10^-6 |
| E | 15 | 0.1066667 | 0.148008 | 0.38472 | 4.315 | 1.60 × 10^-5 |
| F | 8 | 0.1650000 | 0.228951 | 0.47849 | 4.598 | 4.27 × 10^-6 |

```
rank by p-value :   C  >  D  >  B  >  F  >  E  >  A
rank by |log2FC|:   F  >  E  >  D  >  C  >  B  >  A
```

**The two orderings are different, and the disagreement is systematic.** Gene C, third by fold
change, tops the p-sorted list. Gene F, the most-changed gene in the experiment at 4.6-fold, sits
fourth. Gene E, the second-most-changed, is fifth.

The mechanism is visible in the SD column, which spans a factor of two across the table for
reasons that have nothing to do with biology. Precision scales with count: A and B sit
essentially at the dispersion floor,

```
SD floor at n = 3 = sqrt(2.081369 × (2/3) × 0.04) = 0.2356
```

while F, at mu = 8, carries an extra 1/mu = 0.125 in the bracket — 0.165 against a floor of 0.04,
more than quadrupling it. Ranking by p is ranking by
`LFC / SD`, and SD is largely a readout of expression level. **The top of a p-sorted list is
partly a list of the most highly expressed genes.**

That floor also sets what an n = 3 experiment can see at all: `1.96 × 0.2356 = 0.46`, so
**no gene with |log2 FC| below about 0.46 will reach significance at n = 3, at any depth.** If
your biology is a 1.3-fold change, n = 3 is not an underpowered design, it is a design that
cannot answer the question.

Report and threshold on both quantities. If a minimum effect size genuinely matters, put it in
the null — test H0: |LFC| <= tau — rather than filtering the results of a point-null test
afterwards, which controls nothing.

**(d)** Benjamini–Hochberg: sort the p-values, compare `p_(i)` with `i·q/m`, and reject
everything up to the largest *i* that passes.

```
m = 20,000, q = 0.05  ->  threshold_i = i × 2.5 × 10^-6

 rank  gene       p          threshold
   1     C   1.43e-07      2.50e-06     pass
   2     D   1.57e-06      5.00e-06     pass
   3     B   3.25e-06      7.50e-06     pass
   4     F   4.27e-06      1.00e-05     pass
   5     E   1.60e-05      1.25e-05     FAIL
   6     A   1.34e-04      1.50e-05     FAIL

largest passing rank = 4  ->  reject C, D, B, F
```

Now filter out 8,000 genes with no chance of detection, using **mean normalised count across all
samples, computed without reference to the condition labels**:

```
m = 12,000, q = 0.05  ->  threshold_i = i × 4.1667 × 10^-6

   5     E   1.60e-05      2.08e-05     pass
   6     A   1.34e-04      2.50e-05     FAIL

largest passing rank = 5  ->  reject C, D, B, F, E
```

**Gene E becomes significant** — a real gene with a 3.2-fold change that the uncorrected
multiplicity had buried.

Why this is not cheating, precisely: the filter statistic is independent of the p-value **under
the null**. Mean count across all samples ignores which samples are treated, so conditioning on
it does not distort the null distribution of the survivors — their p-values are still uniform
under H0, and BH still controls FDR at 0.05. What changes is arithmetic: BH's threshold is
`(rank/m)·q`, so shrinking *m* raises the bar for every remaining test.

It becomes cheating the instant the filter statistic correlates with the test statistic under the
null. Filtering on the fold change, or on the p-value itself, preferentially retains tests that
look significant by chance, and the guarantee evaporates. The independence condition is the whole
justification, not a technicality attached to it.

</details>

---

## 6. Droplets, doublets and zeros

Use the pinned droplet-chemistry figure: multiplet rate **0.4% per 1,000 cells recovered** on
current chemistry, **0.8% per 1,000** on the preceding generation.

**(a)** You need 16,000 cells. Compute the doublet count for one channel loaded to recover 16,000,
and for two channels of 8,000 pooled afterwards. Compute what the single 16,000 channel would
have cost on the old chemistry. If four donors are pooled equally in each channel, how many of
the doublets can genotype demultiplexing find?
**(b)** A cell yields *m* = 5,000 distinct UMI-tagged molecules. Reads are drawn at random from
those molecules, so the expected number of distinct molecules seen after *R* reads is
`m(1 - e^(-R/m))` — the same occupancy formula as the UMI-collision calculation, with reads as
the balls and molecules as the bins. Evaluate at R = 5,000, 10,000 and 20,000. Then compare
spending 20,000 reads on one cell against 5,000 reads on each of four cells.
**(c)** A gene sits at relative abundance *p* = 3 × 10^-5 in **every** cell of a population.
Cluster 1 cells have a median 6,000 UMIs; cluster 2 cells have 2,000. Compute the zero fraction
and the "percent expressing" you would report for each. Is the difference biology?
**(d)** You compare treated with control using 3 donors per arm and 1,200 cells per donor. A
Wilcoxon test across cells returns p = 10^-40. By roughly what factor is the standard error
understated, and what is the fix?

<details><summary>Solution</summary>

**(a)** Cells load into droplets approximately Poisson, so among occupied droplets the multiplet
fraction is linear in loading concentration and therefore linear in cells recovered **per
channel**.

```
one channel, 16,000 recovered :  0.4% × 16 = 6.4%   ->  1,024 doublets
two channels,  8,000 each     :  0.4% ×  8 = 3.2%   ->    256 each, 512 total
old chemistry, 16,000         :  0.8% × 16 = 12.8%  ->  2,048 doublets
```

**Splitting the same 16,000 cells across two channels halves the doublet burden**, from 1,024 to
512, for the price of one extra channel. That follows directly from linearity: doublets go as
(rate per cell) × (cells) = k·N·N = kN^2 per channel, so two channels of N/2 give
2·k(N/2)^2 = kN^2/2. Budget per channel, never on the pooled total — an experiment reported as
"16,000 cells, 3.2% doublets" is either two channels or wrong.

Note also the chemistry trap: a methods section copied from a 2023 paper carries 0.8–1% per
1,000 and **overstates the doublet burden by about two-fold**. This is the single most
copy-pasted stale number in single-cell methods.

Four donors pooled equally: two randomly chosen cells come from different donors with
probability `1 - 1/4 = 0.75`.

```
of 1,024 doublets:  768 cross-donor  (found from genotype: heterozygous reads at sites
                                      where both donors are homozygous for different alleles)
                    256 same-donor   (invisible to genotype demultiplexing)
```

Simulation-based scoring catches some of the remaining 256 by exploiting the fact that a doublet
is a *sum*, but same-type doublets stay nearly undetectable — which is why a cluster sitting
exactly between two real clusters and co-expressing both marker sets is an artefact until proven
otherwise.

**(b)** `m(1 - e^(-R/m))` with m = 5,000:

```
R =  5,000 :  5,000(1 - e^-1) = 3,161 molecules   (63.2% of the cell's molecules)
R = 10,000 :  5,000(1 - e^-2) = 4,323             (86.5%)
R = 20,000 :  5,000(1 - e^-4) = 4,908             (98.2%)
```

The first 5,000 reads buy 3,161 molecules. Reads 10,001 to 20,000 — twice as many — buy
4,908 - 4,323 = **585**. That is the saturation curve, and past the knee extra reads are almost
entirely re-observations of UMIs you already have.

The budget comparison follows immediately:

```
20,000 reads on 1 cell   :               4,908 molecule observations
20,000 reads on 4 cells  :  4 × 3,161 = 12,642 molecule observations
```

**2.6 times more information for the same money**, plus four cells instead of one, which is what
you actually need if the question is "which cell types are here and in what proportion". The
trade reverses only when the question is depth-limited rather than cell-limited — a splice
isoform switch, an allele-specific ratio. Finding a cell type at 0.1% of the tissue is a
cell-number problem; quantifying a ratio inside a known cell type is a depth problem, and the two
compete for the same budget.

**(c)** Capture is a small multinomial draw, so `P(count = 0) = (1-p)^n ≈ e^(-np)`.

```
cluster 1 :  np = 6,000 × 3e-5 = 0.18   P(0) = e^-0.18 = 0.835   ->  16.5% "expressing"
cluster 2 :  np = 2,000 × 3e-5 = 0.06   P(0) = e^-0.06 = 0.942   ->   5.8% "expressing"
```

**No, it is not biology.** The two clusters have identical per-cell expression by construction,
and a "percent expressing" comparison reports a 2.8-fold difference. Per-cell
detected/not-detected is mostly a readout of sequencing depth, and cell types differ in RNA
content by an order of magnitude, so this comparison is confounded by design in essentially every
dataset.

Nor is an 83.5% zero rate evidence of zero inflation. A 90% zero rate corresponds to
`np = -ln(0.90) = 0.105` — for n = 5,000 that is p ≈ 2 × 10^-5, an entirely ordinary abundance.
Plain multinomial sampling predicts these zeros; the zero-inflation framing has been largely
retired for UMI data, and imputing them back manufactures correlation structure that downstream
co-expression analysis then rediscovers as biology.

The right analysis compares counts under a model with a **cell-size offset**, which is exactly
the quantity the naive comparison ignored.

**(d)** Across conditions the independent unit is the **donor**, not the cell. Three donors per
arm are three replicates, whatever the software's column count says.

```
SE understated by roughly sqrt(cells per donor) = sqrt(1,200) = 34.6×
```

A test that believes it has 3,600 independent observations when it has 3 will return p = 10^-40
for differences that would not survive a test on three numbers against three. The false-positive
rate approaches one.

The fix is **pseudobulk**: sum counts within each (cell type, donor) pair and run the ordinary
bulk pipeline of problem 5 on a matrix with one column per donor per cell type. A cell-level
mixed model with a donor random effect is the other defensible option. Naive Wilcoxon across
cells is not.

Note the interaction with problem 5: pseudobulk drops you to n = 3, where the SD floor is 0.236
and nothing below a 1.4-fold change is detectable. That is not a loss of power — it is the power
you always had, finally reported honestly.

</details>

---

## 7. An ATAC peak, and the reads you never wanted

Use 200 bp bins and a 3.1 Gb genome.

**(a)** An ATAC-seq library returns 60 million reads, of which **45% map to the mitochondrial
genome**. How many reads are doing the work you paid for? How many total reads would you need to
obtain 50 million nuclear reads at that chrM fraction, and after a detergent wash that drops chrM
to 8%?
**(b)** Using the 33 million nuclear reads: compute the genome-wide background rate per bin. The
scaled control library gives, around a candidate bin, lambda_1kb = 3.4, lambda_5kb = 5.2 and
lambda_10kb = 4.0. Form lambda_local. Two candidate bins carry 28 and 17 reads. Compute the
Poisson tail probability for each against lambda_local and against the genome-wide rate, and
compare with a Bonferroni threshold over all bins. What did taking the maximum cost you?
**(c)** Two labs process identical nuclei. Both have a true *nuclear* FRiP of 30%; one library is
45% chrM and the other 8%. What FRiP does each report if it is computed over all mapped reads?
If the first lab sequences four times deeper, what happens to its FRiP?
**(d)** A 1 Mb H3K27me3 domain is enriched 3-fold over background. Compute its per-bin rate, its
total reads, its excess over background, the bin count needed to clear the genome-wide threshold,
and how many bins in the domain are expected to reach it. What fraction of the domain's excess
signal ends up inside called peaks?

<details><summary>Solution</summary>

**(a)** Mitochondrial DNA has no histones and sits at hundreds to thousands of copies per cell,
so it is the most accessible DNA in the cell and Tn5 attacks it enthusiastically.

```
nuclear reads = 60,000,000 × 0.55 = 33,000,000        45% of the run is wasted
```

```
for 50M nuclear at 45% chrM :  50,000,000 / 0.55 = 90,909,091 reads
for 50M nuclear at  8% chrM :  50,000,000 / 0.92 = 54,347,826 reads
```

A **1.67-fold** difference in sequencing cost, bought by a wash step. The general lesson is worth
more than the fix: the assay is selective for accessible DNA, and the most accessible DNA in the
cell is not in the nucleus.

**(b)** 3.1 × 10^9 / 200 = **15,500,000 bins**.

```
lambda_BG = 33,000,000 / 15,500,000 = 2.129 reads per bin

lambda_local = max( 2.129, 3.4, 5.2, 4.0 ) = 5.2
```

Poisson tail probabilities, and the multiple-testing threshold `0.05 / 15,500,000 = 3.23e-9`:

| bin | tail against lambda_local = 5.2 | tail against lambda_BG = 2.129 | verdict against lambda_local |
|---|---:|---:|---|
| n = 28 | 2.46 × 10^-12 | 6.51 × 10^-22 | **called** |
| n = 17 | 3.22 × 10^-5 | 1.44 × 10^-10 | not called |

**Look at the second row.** Bin n = 17 is significant against the genome-wide background by a
factor of 22 below the threshold — and not significant against the local one at all. That gap is
what the `max()` cost you, and it is deliberate. Taking the maximum of the nested control-derived
windows means a bin must beat the *worst-case* local explanation before it is called, so the
regions that lose most are exactly the ones whose neighbourhoods are already elevated:
sonication-accessible chromatin, amplified copy number, hyper-ChIPable loci. Those are the
regions that generate reproducible false positives, which is precisely why you pay the price.

What you should not do is trust the q-value that comes out. The null is not exactly Poisson,
adjacent bins are heavily correlated, and the fragment-shift step adds dependence of its own.
Nominal FDR here is optimistic by an amount nobody can quantify. **Reproducibility across
independent replicates, not the q-value, is the operative criterion**, which is what IDR exists
to measure.

**(c)** FRiP over all mapped reads includes the mitochondrial reads in the denominator and never
in the numerator, so it is simply the nuclear FRiP scaled down:

```
lab 1 (45% chrM) :  0.55 × 0.30 = 0.165  ->  reported FRiP 16.5%
lab 2 ( 8% chrM) :  0.92 × 0.30 = 0.276  ->  reported FRiP 27.6%
```

Identical nuclei, identical chromatin, identical peaks — and a **1.67-fold** difference in the
headline quality metric. FRiP is only interpretable against a stated read-filtering convention,
and comparing it across labs or across mark types without one measures the convention.

Sequencing four times deeper changes nothing. FRiP is a **ratio**: in-peak reads and background
reads both quadruple. Depth reduces sampling noise; it cannot change signal-to-background. The
same argument applies to a failing ChIP — "sequence it deeper" is never the answer to a poor
FRiP, and if RSC is below 1 the mappability artefact already dominates the enrichment signal and
the experiment failed before any threshold was chosen.

**(d)** Per-bin rate inside the domain, and its size:

```
lambda_in = 2.129 × 3 = 6.387 reads per 200 bp bin
bins      = 1,000,000 / 200 = 5,000
reads in the domain    = 5,000 × 6.387 = 31,935
excess over background = 5,000 × (6.387 - 2.129) = 21,290 reads
```

The control library has no enrichment here, so lambda_local inside the domain is about
lambda_BG = 2.129. Working out the count a bin needs to clear 3.23 × 10^-9 against that null:

```
P(X >= 15 | 2.129) = 8.77 × 10^-9    not called
P(X >= 16 | 2.129) = 1.16 × 10^-9    called
```

So a bin needs **n >= 16**. How many of the 5,000 bins inside the domain get there?

```
E[bins with n >= 16]  =  5,000 × P(X >= 16 | 6.387)  =  4.86
E[reads inside those bins] = 5,000 × 6.387 × P(X >= 15 | 6.387) = 80.4
```

**About five "peaks" out of 5,000 bins, containing 80 of the 21,290 excess reads — 0.4% of the
domain's signal.** A megabase of genuine, reproducible enrichment is reported as five tiny
point-sources sitting wherever the Poisson noise happened to be highest, which is not a
biological location. Both failure modes are visible at once: most of the domain is *missed*, and
what survives is *shattered*.

The fix is not a better threshold. It is a different statistical question. A domain is a
**change-point** problem — where does the level shift? — answered by an HMM or a segmentation
over windows, not by spike detection against a local null. And note the second trap the chapter
flags: if you have no control, so lambda_local must be estimated from the ChIP library itself, a
megabase-scale domain **elevates its own local window estimate and partly subtracts itself**.

</details>

---

## 8. A contact map, a loop, and a TAD that is not a box ★★

Balanced contact counts, and the genome-wide distance decay from Ch 50 §2 at 100 kb bins:

| separation | mean contacts |
|---|---:|
| 100 kb | 5,000 |
| 200 kb | 2,400 |
| 500 kb | 900 |
| 1 Mb | 420 |
| 2 Mb | 190 |

**(a)** Pixel P joins two bins 200 kb apart and carries 2,400 counts. Pixel Q joins two bins 2 Mb
apart and carries 600. Which is the interesting one? Separately: before balancing, bins *i* and
*j* carry visibility biases b_i = 1.4 and b_j = 1.3, while bin *k* carries b_k = 0.6. What O/E
would an unbalanced matrix report for a pixel whose true O/E is 1.0, in the *i*–*j* case and in
the *k*-against-a-normal-bin case?
**(b)** Re-bin at 10 kb and take the 5 × 5 patch of balanced counts centred on a candidate pixel
at 500 kb separation:

```
    21   23   22   20   19
    22   27   30   26   21
    24   31  [96]  33   23
    22   28   29   27   22
    20   21   22   20   18
```

Compute the genome-wide expectation at 10 kb bins, the naive O/E, the donut background rate, the
enrichment over local background, and the Poisson tail probability. There are about
6.2 × 10^7 candidate pixels within 2 Mb of the diagonal. Is it a loop? Then test a second
candidate that carries 60 counts with a donut mean of 52.
**(c)** The map came from a 3-billion-contact library. What does the 96-count pixel become at
5 kb, 2 kb and 1 kb bins, and what library would hold it at 96?
**(d)** Chromatin tracing labels 56 consecutive 30 kb segments across the same 1.68 Mb window in
2,000 single cells. Every cell has exactly one domain boundary somewhere in the window. 340 cells
place it in the segment containing the CTCF site; the other 1,660 are spread across the remaining
55 segments. Compute the enrichment over uniform. Then predict what ensemble Hi-C and what
single-cell tracing each report after acute cohesin depletion, given that depletion removes the
*preference* and leaves boundary positions uniform. Finally: at a fully-looped fraction of
3–6.5%, how many of the 2,000 cells have the CTCF–CTCF loop at any instant?

<details><summary>Solution</summary>

**(a)** Divide by the expectation at each pixel's separation.

```
pixel P :  2,400 / 2,400 = 1.00      exactly average
pixel Q :    600 /   190 = 3.16      threefold enriched
```

**Q is the interesting one, and it carries a quarter of P's raw counts.** Contact frequency falls
about 167-fold between 100 kb and 10 Mb, so any statistic computed on raw counts — clustering,
correlation, "top interactions" — measures genomic separation and nothing else. Rank this map on
raw counts and you get the diagonal, every time, with beautiful significance.

Visibility is the second nuisance and it multiplies rather than adds. Under `C_ij = b_i b_j T_ij`:

```
pixel between i and j (b = 1.4, 1.3) :  apparent O/E = 1.4 × 1.3 × 1.0 = 1.82
pixel between k and a normal bin     :  apparent O/E = 0.6 × 1.0 × 1.0 = 0.60
```

A **threefold** spread between two pixels that are biologically identical, produced entirely by
restriction-site density, GC content, mappability and copy number. Matrix balancing (ICE, or KR)
removes it non-parametrically: assume every bin should make the same total number of contacts,
and let the marginals solve for *b* without your ever having to say which bias is which.

Two caveats a careful reader should demand. Balancing **cannot distinguish technical invisibility
from real biology** — a lamina-associated bin that genuinely makes fewer contacts gets scaled up
and its distinctive behaviour partly erased. And unmappable and low-coverage bins must be
**masked before** the solver runs, because a single pathological bin distorts the whole solution.

**(b)** The expectation at 500 kb is 900 at 100 kb bins. A 100 kb pixel is exactly 100 of the
10 kb pixels at the same separation, so

```
E(500 kb, 10 kb bins) = 900 / 100 = 9.0
```

```
naive O/E = 96 / 9.0 = 10.67
```

which looks decisive and is not evidence of anything yet, because everything inside a TAD is
elevated. Build the local background from the donut — the 16 pixels of the outer ring, excluding
the inner 3 × 3:

```
ring values : 21 23 22 20 19 | 20 21 22 20 18 | 22 24 22 | 21 23 22
ring sum    = 340                        ring mean = 21.25
ring expectation = 16 × 9.0 = 144
local enrichment ratio = 340 / 144 = 2.361
lambda_donut = 9.0 × 2.361 = 21.25
```

```
enrichment over local background = 96 / 21.25 = 4.52

P(X >= 96 | lambda = 21.25) = 2.03 × 10^-32
```

Bonferroni over 6.2 × 10^7 candidate pixels gives a threshold of
`0.05 / 6.2e7 = 8.07 × 10^-10`. The pixel clears it by more than **22 orders of magnitude**. **It is a
loop.**

Now the second candidate, which is what the donut is for:

```
naive O/E                        = 60 / 9.0 = 6.67       looks convincing
enrichment over local background = 60 /  52 = 1.15
P(X >= 60 | lambda = 52)         = 0.149
```

Against 6.2 × 10^7 tests, 0.149 is nothing whatsoever. That pixel sits at a TAD corner where the
whole neighbourhood is elevated; the elevation is the domain, not a loop, and only the local
background separates them. This is the ChIP-seq local-lambda argument of problem 7 in different
clothes: **the enemy is never the genome-wide null, it is the locally structured background.**

**(c)** A contact is a *pair*, so a pixel at fixed separation covers L × L base pairs of contact
space and its counts scale as L^2.

| bin size | pixel counts | library needed to hold 96 counts |
|---|---:|---:|
| 10 kb | 96 | 3 × 10^9 |
| 5 kb | 24 | 1.2 × 10^10 |
| 2 kb | 3.8 | 7.5 × 10^10 |
| 1 kb | 0.96 | 3 × 10^11 |

**Every halving of bin size costs four times the sequencing.** Three hundred billion contacts for
a whole-genome 1 kb map is not a budget decision, it is a different research programme. The
escape is to stop asking for the whole genome: capture a few megabases and the same 3 billion
contacts are concentrated there. That is the entire argument for Capture-C and Region Capture
Micro-C — and it is why the finest structures known, the nested microcompartments linking
individual enhancers to individual promoters, were found in captured regions and not in
genome-wide maps. **Several structural claims in this field are claims about the resolution
people could afford.**

**(d)** Under a uniform boundary distribution, each of the 56 segments would hold
`2,000 / 56 = 35.7` cells.

```
observed at the CTCF segment = 340 = 17.0% of cells
enrichment over uniform      = 340 / 35.7 = 9.52×
```

A 9.5-fold preference — strong, unambiguous, and **83% of cells put their boundary somewhere
else.** Every one of those 2,000 cells has a globular domain with a sharp boundary; the boundary
position is a random variable, peaked at the CTCF site. Averaging cells that share a mode
produces a crisp population TAD, and that population TAD is a statement about the *mode of a
distribution*, not about a box that chromatin sits inside.

After acute cohesin depletion, with the preference gone and boundaries uniform:

- **Ensemble Hi-C** sees the mode and reports that the TAD has **vanished**. Averaging uniformly
  distributed boundaries gives a smooth gradient with no boundary anywhere — the count at the
  former boundary segment falls from 340 to 35.7, a 9.5-fold collapse.
- **Single-cell tracing** reports that the domain-like blocks are **still there**, one per cell,
  with boundaries now scattered at essentially uniform random positions.

Both are correct. Nothing physical disappeared; what disappeared was a *preference*. The standing
error in this field is reading the mean of a mixture as a description of its components, and this
is the cleanest available instance of it.

The loop makes the same point in time rather than in space:

```
fully looped 3.0% of the time  ->  60 of 2,000 cells at any instant
fully looped 6.5% of the time  -> 130 of 2,000 cells
```

**Between 60 and 130 cells out of 2,000.** For roughly 92% of the time there is a partially
extruded loop that does not bridge both boundaries. The persistent circle drawn in every textbook
figure is, in any given cell at any given moment, almost certainly not there — and yet the
ensemble corner peak that reports it clears a Poisson test by 22 orders of magnitude, as (b)
showed. A very strong statistical signal for a structure that mostly does not exist is not a
contradiction. It is what a marginal distribution looks like.

</details>

---

## Where you went wrong

| Error pattern | What to re-read |
|---|---|
| Rejected a het because 2/8 alt reads is "not 50%" | Problem 1(d) — one true het in seven gives <= 2 alt reads at depth 8 |
| Applied a fixed "3 alt reads and 20% VAF" rule instead of a likelihood | Problem 1(d) — the threshold drifts with depth; the model does not |
| Read GQ and QUAL as the same confidence | Problem 2(a) — GQ 45 with QUAL 15.6 at the same site |
| Thought joint genotyping pools reads across samples | Problem 2(d) — it pools the prior, never the data |
| Treated QUAL as depth-independent evidence | Problem 3(a) — QUAL 150 means opposite things at DP 12 and DP 250 |
| Trusted a call because every within-column statistic looked perfect | Problem 3(b) — allele balance 0.50 and all 30 alt reads on one strand |
| Read a rising Ti/Tv as a cleaner callset | Problem 3(d) — the 1.90 ceiling, and filters correlated with transition status |
| Normalised RNA-seq by dividing through the library total | Problem 4(a) — five unchanged genes reported as 3-fold down |
| Believed median-of-ratios is assumption-free | Problem 4(c) — four of six genes moving together inverts every call |
| Bought depth instead of replicates | Problem 5(b) — at fixed budget the sampling term is a constant; only 2·alpha/n moves |
| Assumed enough sequencing can rescue an n = 3 design | Problem 5(b)–(c) — the SD floor 0.236 caps detection at ~1.4-fold, at any depth |
| Took the top of a p-sorted list as the most-changed genes | Problem 5(c) — the 4.6-fold gene ranks fourth |
| Thought independent filtering is p-hacking | Problem 5(d) — the filter statistic is independent of p under the null |
| Budgeted doublets on the pooled cell total rather than per channel | Problem 6(a) — 1,024 doublets in one channel, 512 in two |
| Kept sequencing one cell past UMI saturation | Problem 6(b) — 585 new molecules for the second 10,000 reads |
| Compared "percent expressing" between clusters of different depth | Problem 6(c) — identical expression, 16.5% versus 5.8% |
| Called scRNA-seq zeros dropout and imputed them | Problem 6(c) — e^(-np) predicts them without any extra machinery |
| Treated cells as independent replicates across conditions | Problem 6(d) — SE understated 34.6-fold |
| Proposed deeper sequencing to fix a poor FRiP | Problem 7(c) — FRiP is a ratio, and chrM moves it 1.67-fold on its own |
| Called a broad domain with a point-source caller | Problem 7(d) — 5 "peaks" holding 0.4% of the signal |
| Ranked Hi-C pixels on raw counts | Problem 8(a) — the decay is 167-fold and visibility adds 3-fold more |
| Called a loop from naive O/E without a local background | Problem 8(b) — O/E 6.67 with p = 0.149 |
| Expected twice the reads to double Hi-C resolution | Problem 8(c) — counts go as L^2, so 10 kb to 1 kb costs 100x |
| Read a population TAD as a box, or a corner peak as a persistent loop | Problem 8(d) — 83% of cells put the boundary elsewhere; 3–6.5% carry the loop |
