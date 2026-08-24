# S1 — Probability and uncertainty

> **Read before:** [Ch 09](../part-02-transmission-genetics/09-mitosis-and-meiosis.md) · **Time:** ~40 min

Genetics became a quantitative science the moment someone counted offspring. Mendel's 3:1 is not
a law of nature in the way that conservation of momentum is — it is the visible signature of a
*sampling process*. Meiosis takes a diploid cell and emits one of two alleles, and which one it
emits is decided by which way a bivalent happens to face on the metaphase plate. Every ratio in
Part 2, every risk figure a genetic counsellor quotes, and every posterior probability a variant
caller emits is downstream of that one stochastic event.

This chapter is deliberately incomplete. It covers the probability the rest of the curriculum
leans on and stops. You will not find measure theory, sigma-algebras, or a proof of the strong
law. You *will* find the four things that people who are otherwise good at statistics get wrong
in genetics: multiplying when they should add, inverting a conditional, treating a probability as
a property of an individual, and forgetting the base rate.

All code in this chapter runs from the repository root — the directory holding `README.md` and
`.venv` — with `source .venv/bin/activate`, and addresses data as `labs/data/…`. Only §6 reads a
file from disk, and it is the 1000 Genomes chr22 subset that
[lab-07](../labs/lab-07-population-genetics.md) builds; everything else is self-contained.

## What you'll be able to do

- Write a genetic cross as a sample space with an explicit probability on each outcome, and
  compute any event's probability by summing over it
- Decide correctly whether a situation calls for the product rule or the sum rule, and state the
  biological assumption each one imports
- Compute a conditional probability, and explain why an unaffected sibling of an affected child
  is 2/3 a carrier rather than 1/2
- Explain why successive meioses are independent while a family history still changes the risk,
  and why a pedigree probability is a state of information rather than a long-run frequency
- Derive Bayes' theorem from the definition of conditional probability and lay out a
  prior / conditional / joint / posterior table for a real carrier-risk problem
- Compute the expectation of a random variable, and say when linearity of expectation holds
  despite dependence between the terms
- Explain why a test with 99% sensitivity is usually wrong when it comes back positive, and
  identify which of its three input numbers is actually in charge

## The core idea

A probability model has exactly three parts: a set of possible outcomes, a number attached to
each, and a rule for combining them. As a programmer you already have the right data structure —
a **sample space is a dictionary from outcome to weight, an event is a predicate, and a
probability is a filtered sum**.

Everything else in this chapter is bookkeeping about which sample space you are actually in.
Nearly every probabilistic error in genetics is the same error: you computed a correct
probability in the wrong sample space. The purple plant is 1/4 homozygous in the sample space of
all offspring and 1/3 homozygous in the sample space of purple offspring. The test is 99%
accurate in the sample space of affected people and 1% accurate in the sample space of positive
results. Neither number is wrong. Only one of them answers the question.

> **P(A|B) and P(B|A) are different numbers, and substituting one for the other is the single
> most consequential error in genetics and clinical genomics.** It is the base-rate fallacy in
> screening, the prosecutor's fallacy in forensics, and the misreading of a p-value in
> [S4](./S4-hypothesis-testing.md). Whenever you write down a probability, write down what it is
> conditional on, in the same breath.

---

## 1. A meiosis is a random experiment

An *Aa* heterozygote making a gamete is the canonical random experiment of genetics. The sample
space is {*A*, *a*}; the probabilities are ½ each; the mechanism is that homologues segregate to
opposite poles at anaphase I and which pole is arbitrary
([Ch 09](../part-02-transmission-genetics/09-mitosis-and-meiosis.md)). A cross is two such
experiments run independently, one in each parent.

That is enough structure to compute anything. Here is the whole apparatus in twenty lines,
using exact fractions so nothing is hidden by floating point:

```python
from itertools import product
from fractions import Fraction

def meiosis(genotype):
    """Sample space of one gamete from a diploid: outcome -> probability."""
    space = {}
    for allele in genotype:
        space[allele] = space.get(allele, Fraction(0)) + Fraction(1, len(genotype))
    return space

def combine(*spaces):
    """Independent experiments: the product sample space."""
    out = {}
    for outcomes in product(*[s.items() for s in spaces]):
        key, pr = tuple(o for o, _ in outcomes), Fraction(1)
        for _, p in outcomes:
            pr *= p
        out[key] = out.get(key, Fraction(0)) + pr
    return out

def P(space, event):
    """Probability of an event, where an event is any predicate on outcomes."""
    return sum(pr for outcome, pr in space.items() if event(outcome))

zygote = combine(meiosis("Aa"), meiosis("Aa"))       # Aa x Aa, one offspring
print("sample space:", {"".join(k): str(v) for k, v in zygote.items()})
print("P(purple)  =", P(zygote, lambda o: "A" in o))
print("P(AA)      =", P(zygote, lambda o: o == ("A", "A")))
```

```
sample space: {'AA': '1/4', 'Aa': '1/4', 'aA': '1/4', 'aa': '1/4'}
P(purple)  = 3/4
P(AA)      = 1/4
```

Three things are now explicit that a Punnett square leaves implicit. The **outcomes are ordered
pairs** — `Aa` and `aA` are distinct outcomes that happen to share a phenotype, which is where
the factor of 2 on the heterozygote comes from. The **weights sum to 1**, which is the only axiom
you will ever need to check. And an **event is a predicate, not a cell**: `"A" in o` is the event
"purple", and its probability is a sum over the outcomes satisfying it. That is the sum rule,
and it is safe here precisely because distinct outcomes of a sample space are mutually exclusive
by construction.

## 2. Product and sum, and the classic way to use the wrong one

**Product rule.** If *A* and *B* are independent, P(*A* ∩ *B*) = P(*A*)P(*B*). In genetics the
independence is a *biological* claim, not an arithmetic one: it says the two loci assort
independently, which is true if they are on different chromosomes or far apart on one, and false
otherwise ([Ch 14](../part-02-transmission-genetics/14-linkage-and-mapping.md)).

**Sum rule.** If *A* and *B* are mutually exclusive, P(*A* ∪ *B*) = P(*A*) + P(*B*). If they are
not, you need inclusion–exclusion: P(*A* ∪ *B*) = P(*A*) + P(*B*) − P(*A* ∩ *B*).

The classic error is adding non-exclusive events. Watch it produce a number greater than 1:

```python
di = combine(combine(meiosis("Aa"), meiosis("Aa")),      # locus A
             combine(meiosis("Bb"), meiosis("Bb")))      # locus B
A_ = lambda o: "A" in o[0]
B_ = lambda o: "B" in o[1]

print("P(A_ and B_)        =", P(di, lambda o: A_(o) and B_(o)))
print("P(A_) * P(B_)       =", P(di, A_) * P(di, B_))
print("P(A_ or B_)  WRONG  =", P(di, A_) + P(di, B_))
print("P(A_ or B_)  right  =", P(di, lambda o: A_(o) or B_(o)))
print("inclusion-exclusion =", P(di, A_) + P(di, B_) - P(di, lambda o: A_(o) and B_(o)))
```

```
P(A_ and B_)        = 9/16
P(A_) * P(B_)       = 9/16
P(A_ or B_)  WRONG  = 3/2
P(A_ or B_)  right  = 15/16
inclusion-exclusion = 15/16
```

The mnemonic that survives contact with real problems: **"and" across independent loci
multiplies; "or" within one locus adds.** A phenotypic class like `A_` is a union of genotypes
(*AA* ∪ *Aa*) at one locus — add. A class like `A_ bb CC` is an intersection across three loci —
multiply.

### Why you should never draw the 64-cell square

The trihybrid Punnett square is 8 gametes × 8 gametes = 64 cells. Enumerating it is fine for a
computer and pointless for a person, because the answer factorises:

```python
for n in (2, 3, 5, 10):
    print(f"{n} loci: {4**n:>8} Punnett cells, {2**n} phenotype classes, "
          f"P(dominant at all) = {(3/4)**n:.6f}")
```

```
2 loci:       16 Punnett cells, 4 phenotype classes, P(dominant at all) = 0.562500
3 loci:       64 Punnett cells, 8 phenotype classes, P(dominant at all) = 0.421875
5 loci:     1024 Punnett cells, 32 phenotype classes, P(dominant at all) = 0.237305
10 loci:  1048576 Punnett cells, 1024 phenotype classes, P(dominant at all) = 0.056314
```

The grid grows as 4ⁿ; the product rule costs one multiplication per locus. P(*A*\_ *bb* *CC*)
= ¾ × ¼ × ¼ = **3/64** takes three seconds and no paper. A Punnett square is a device for
teaching that outcomes are ordered pairs; it is not a calculating tool, and past two loci it is
actively an obstacle.

### Both ratios, by simulation

The fastest way to convince yourself a probability model is right is to run it. Simulating
100,000 crosses takes milliseconds and recovers both of Mendel's ratios:

```python
import numpy as np
rng = np.random.default_rng(1)
N = 100_000

g = {}
for locus in "AB":                                   # AaBb x AaBb
    g[locus] = rng.integers(0, 2, N) + rng.integers(0, 2, N)   # copies of the dominant allele
A_, B_ = g["A"] > 0, g["B"] > 0

print("monohybrid  purple : white = %.4f : %.4f" % (A_.mean(), 1 - A_.mean()))
cls = {"A_B_": (A_ & B_).mean(), "A_bb": (A_ & ~B_).mean(),
       "aaB_": (~A_ & B_).mean(), "aabb": (~A_ & ~B_).mean()}
print("dihybrid   ", {k: round(float(v), 4) for k, v in cls.items()})
print("as a ratio ", [round(float(v / cls["aabb"]), 2) for v in cls.values()])
print("P(A_)P(B_) = %.4f   P(A_ and B_) = %.4f" % (A_.mean() * B_.mean(), (A_ & B_).mean()))
```

```
monohybrid  purple : white = 0.7486 : 0.2514
dihybrid    {'A_B_': 0.5612, 'A_bb': 0.1874, 'aaB_': 0.1882, 'aabb': 0.0633}
as a ratio  [8.87, 2.96, 2.97, 1.0]
P(A_)P(B_) = 0.5609   P(A_ and B_) = 0.5612
```

8.87 : 2.96 : 2.97 : 1 against a theoretical 9 : 3 : 3 : 1 — and the last line is the
independence assumption verified empirically rather than assumed. Note how noisy the ratio still
is at N = 100,000 when it is normalised by the smallest class. Mendel's 556 seeds were a small
experiment ([Ch 12](../part-02-transmission-genetics/12-probability-and-testing.md)).

## 3. Conditional probability: the purple plant is 1/3 homozygous

**Definition.** P(*A* | *B*) = P(*A* ∩ *B*) / P(*B*), for P(*B*) > 0.

Read it as an operation on sample spaces: *delete every outcome where B is false, then
renormalise so the survivors sum to 1*. Conditioning is filtering.

The genetics case where this bites is the standard F₂ question. A purple plant from an
*Aa* × *Aa* cross — what is the probability it is homozygous? The answer is not 1/4:

```
P(AA | purple)  =  P(AA and purple) / P(purple)  =  (1/4) / (3/4)  =  1/3
```

The *aa* quarter of the sample space has been deleted by the observation, and the remaining three
quarters renormalise to 1/3 : 2/3. Verify it by literally deleting rows:

```python
rng = np.random.default_rng(2)
dose = rng.integers(0, 2, 100_000) + rng.integers(0, 2, 100_000)   # 0=aa, 1=Aa, 2=AA
purple = dose > 0

print("P(AA)          = %.4f" % (dose == 2).mean())
print("P(AA | purple) = %.4f   <- 1/3 = %.4f" % ((dose[purple] == 2).mean(), 1/3))
print("kept %d purple plants of %d; %d are AA" % (purple.sum(), dose.size, (dose[purple] == 2).sum()))
```

```
P(AA)          = 0.2500
P(AA | purple) = 0.3319   <- 1/3 = 0.3333
kept 75304 purple plants of 100000; 24996 are AA
```

`dose[purple]` is conditioning. The genetics is that this is why a testcross exists: a purple
plant is genotypically ambiguous, and crossing it to *aa* converts a 1/3 : 2/3 belief into an
observation ([Ch 10](../part-02-transmission-genetics/10-mendelian-inheritance.md)).

The same arithmetic, applied to a human pedigree, is the **2/3 carrier prior** that every risk
calculation starts from: the unaffected sibling of a child with an autosomal recessive disease
came from *Aa* × *Aa*, and "unaffected" deletes *aa*, leaving 2/3 *Aa* and 1/3 *AA*
([Ch 15](../part-02-transmission-genetics/15-pedigrees.md)). Dropping that step and using 1/2 cuts
the final risk by a quarter to a third, depending on what else the calculation conditions on.

## 4. Independence, and why meiosis has no memory

*A* and *B* are **independent** iff P(*A* ∩ *B*) = P(*A*)P(*B*), equivalently P(*A* | *B*) =
P(*A*) — knowing *B* changes nothing about *A*. Successive meioses in the same parent are
independent: there is no mechanism by which one anaphase remembers the last.

The clinical form of the gambler's fallacy is a couple who have had one affected child concluding
that the next three are "owed" to them healthy. They are not. But the mirror-image error is just
as common and much subtler: concluding that a family history never changes anything. It changes
your estimate of the *parents' genotypes*, which is a completely different object from the
segregation probability. Simulate both at once:

```python
rng = np.random.default_rng(3)
def aa(n):                              # a child of Aa x Aa is aa iff it draws 'a' twice
    return (rng.random(n) < 0.5) & (rng.random(n) < 0.5)

N = 2_000_000                           # (1) parents KNOWN to be carriers
c1, c2 = aa(N), aa(N)
print("known carrier x carrier")
print("  P(child2 affected)                   = %.4f" % c2.mean())
print("  P(child2 affected | child1 affected) = %.4f" % c2[c1].mean())

M = 20_000_000                          # (2) random couple, carrier frequency 1/25
f = 1/25
both = (rng.random(M) < f) & (rng.random(M) < f)
kid1, kid2 = both & aa(M), both & aa(M)
print("random couple, carrier frequency 1/25")
print("  P(child2 affected)                   = %.6f   (theory %.6f)" % (kid2.mean(), f**2/4))
print("  P(child2 affected | child1 affected) = %.4f   (n = %d families)"
      % (kid2[kid1].mean(), kid1.sum()))
```

```
known carrier x carrier
  P(child2 affected)                   = 0.2502
  P(child2 affected | child1 affected) = 0.2510
random couple, carrier frequency 1/25
  P(child2 affected)                   = 0.000401   (theory 0.000400)
  P(child2 affected | child1 affected) = 0.2429   (n = 8066 families)
```

Read those four numbers carefully. Given known carrier parents, the first child's outcome is
irrelevant to the second — 0.2502 versus 0.2510, independence exactly as claimed. Given *unknown*
parents, one affected child multiplies the risk to the next by more than **600-fold**, from
0.0004 to 0.25, because it proves what was previously a 1-in-625 proposition: that both parents
carry.

**The meiosis has no memory. Your model of the parents does.** Conditioning acts on the unknowns,
and in a pedigree the unknowns are genotypes, not future coin flips.

## 5. Bayes' theorem, and the table every genetic counsellor uses

The derivation is three lines and is worth doing once, because the theorem is not a new principle
— it is the definition of conditional probability read in both directions.

```
(1)  P(A | B) = P(A ∩ B) / P(B)          definition
(2)  P(A ∩ B) = P(B | A) · P(A)          the same definition, rearranged
(3)  P(A | B) = P(B | A) · P(A) / P(B)   substitute (2) into (1)
```

and because the hypotheses *H*₁ … *H*ₖ partition the sample space, the denominator is never an
extra input — it is whatever makes the answer sum to 1:

```
P(B) = Σᵢ P(B | Hᵢ) · P(Hᵢ)
```

That last line is the reason clinical genetics writes the calculation as a **four-row table**,
one column per hypothesis. The rows are the three quantities you must supply and the one you
want:

| Row | What it is | Where it comes from |
|---|---|---|
| **Prior** | P(*Hᵢ*) before the evidence | Mendelian segregation, or a population allele frequency |
| **Conditional** | P(evidence \| *Hᵢ*) | The likelihood of what was actually observed, under each hypothesis |
| **Joint** | prior × conditional | Multiplication, per column |
| **Posterior** | joint ÷ (sum of joints) | Normalisation across the row |

Nothing subjective enters. The priors are segregation ratios and allele frequencies; the
conditionals are Mendelian likelihoods and assay performance figures.

### A carrier-risk problem, end to end

*A woman's brother has cystic fibrosis; their parents are unaffected. She is unaffected. Her
partner has no family history and has not been screened; the population carrier frequency is
1 in 25. They have three unaffected children. What is the risk to a fourth?*

Only one configuration can produce an affected child — both partners carrying — so the hypothesis
space collapses to two columns. **This collapse is legitimate only because P(three unaffected
children | not both carriers) = 1 exactly**; if the alternative hypotheses assigned different
likelihoods to the evidence, they would have to be kept apart.

| | *H*₁: both are carriers | *H*₀: not both |
|---|---|---|
| **Prior** | (2/3) × (1/25) = 2/75 = 0.026667 | 0.973333 |
| **Conditional** — 3 unaffected children | (3/4)³ = 0.421875 | 1 |
| **Joint** | 0.011250 | 0.973333 |
| **Posterior** | 0.011250 / 0.984583 = **0.011426** | 0.988574 |

Risk to the fourth child = P(both carry) × ¼ = 0.011426 × 0.25 = **0.002857**, about **1 in 350**.
Before the three children were born it was (2/75) × ¼ = **1 in 150**. Three healthy children
roughly halved the risk — real evidence, but weak evidence, because healthy children are the
likely outcome even when both parents carry.

Now confirm the whole table by simulating the story it describes:

```python
rng = np.random.default_rng(4)
M = 20_000_000
her  = rng.random(M) < 2/3            # she is a carrier
him  = rng.random(M) < 1/25           # he is a carrier
both = her & him
c1, c2, c3, c4 = (both & ((rng.random(M) < 0.5) & (rng.random(M) < 0.5)) for _ in range(4))
ok = ~(c1 | c2 | c3)                  # first three children unaffected

print("families with 3 unaffected children: %d" % ok.sum())
print("  P(both carriers | 3 unaffected)      = %.6f" % both[ok].mean())
print("  P(4th child affected | 3 unaffected) = %.6f" % c4[ok].mean())
```

```
families with 3 unaffected children: 19691033
  P(both carriers | 3 unaffected)      = 0.011442
  P(4th child affected | 3 unaffected) = 0.002884
```

0.011442 against the algebraic 0.011426, and 0.002884 against 0.002857. When simulation and
algebra agree to three significant figures, you have checked both. Make this a habit: any risk
calculation you cannot reproduce with twenty lines of `numpy` is a calculation you do not yet
understand.

## 6. Random variables and expectation

A **random variable** is a function from outcomes to numbers. "Number of affected children in a
sibship of four" maps each of the 2⁴ outcome patterns to 0–4. Its **expectation** is the
probability-weighted mean, E[*X*] = Σ *x* · P(*X* = *x*).

The property that does all the work is **linearity**: E[*X* + *Y*] = E[*X*] + E[*Y*], for *any*
random variables, **including dependent ones**. Variance has no such property — Var(*X* + *Y*) =
Var(*X*) + Var(*Y*) only when *X* and *Y* are uncorrelated. That asymmetry is not a technicality;
it is why the following real-data result comes out the way it does.

Take the 1000 Genomes chr22 data shipped with the labs — 2,503 individuals genotyped at 3,564
SNPs in a 1 Mb window, chr22:20,000,722–20,999,869 (GRCh38). Let *Xᵢ* = 1 if a person is
heterozygous at variant *i*, and let *H* = Σ *Xᵢ* be their total heterozygous-site count. Under
Hardy–Weinberg, E[*Xᵢ*] = 2*pᵢ*(1 − *pᵢ*) ([Ch 26](../part-05-population-genetics/26-hardy-weinberg.md)):

```bash
export PATH="$HOME/bin:$PATH"
plink2 --pfile labs/data/chr22_qc --export A --out labs/data/chr22_qc     # 0/1/2 dosage matrix
```

```python
import numpy as np, pandas as pd
raw = pd.read_csv("labs/data/chr22_qc.raw", sep=r"\s+")
sup = pd.read_csv("labs/data/panel.txt", sep="\t").set_index("sample") \
        .loc[raw["IID"], "super_pop"].to_numpy()
G = raw.iloc[:, 6:].to_numpy(float)[sup == "EUR"]        # 503 European-ancestry samples
p, L = G.mean(0) / 2, G.shape[1]

EH = (2 * p * (1 - p)).sum()                             # E[H] = sum of E[X_i]  -- linearity
H  = (G == 1).sum(1)
print("E[H] predicted from allele frequencies = %7.2f" % EH)
print("observed mean H                        = %7.2f   (ratio %.4f)" % (H.mean(), H.mean()/EH))

sd_indep = np.sqrt((2*p*(1-p) * (1 - 2*p*(1-p))).sum())  # sd IF the L variants were independent
print("sd of H assuming independence          = %7.2f" % sd_indep)
print("observed sd of H                       = %7.2f   (ratio %.2f)" % (H.std(ddof=1), H.std(ddof=1)/sd_indep))
print("effective number of independent sites  = %7.1f   of %d" % (L * (sd_indep/H.std(ddof=1))**2, L))
```

```
E[H] predicted from allele frequencies =  609.33
observed mean H                        =  612.76   (ratio 1.0056)
sd of H assuming independence          =   19.67
observed sd of H                       =  170.64   (ratio 8.67)
effective number of independent sites  =    47.4   of 3564
```

**The mean is predicted to within 0.6%. The standard deviation is wrong by a factor of 8.7.**
Linearity of expectation did not care that these 3,564 SNPs sit within a megabase and are in
massive linkage disequilibrium; the variance calculation cared enormously. Correlated indicators
move together, so *H* swings far more between people than independence would allow, and the 3,564
variants behave like roughly **47 independent units**.

That number is not a curiosity. It is the same "effective number of independent tests" that sets
the genome-wide significance threshold of 5 × 10⁻⁸ from a million-odd independent common variants
rather than from the ten million actually tested
([Ch 51](../part-11-human-and-statistical-genomics/51-gwas.md),
[S7](./S7-high-dimensional-data.md)), and the correlation producing it is linkage disequilibrium
([Ch 29](../part-05-population-genetics/29-linkage-disequilibrium.md)).

### The functions you will actually call

| Task | Call | Arguments |
|---|---|---|
| Reproducible randomness | `rng = np.random.default_rng(seed)` | Always seed. Never use the legacy `np.random.seed` |
| Bernoulli / coin flips | `rng.random(n) < p` | Returns a boolean array — cheap, and composable with `&` and `\|` |
| Sample from a set | `rng.choice(items, size=n, p=probs)` | `p` must sum to 1; `replace=True` by default |
| Count of successes | `rng.binomial(n, p, size)` | *n* trials per draw, success probability *p* |
| Exact binomial probability | `scipy.stats.binom.pmf(k, n, p)` | P(exactly *k*); `.sf(k, n, p)` gives P(more than *k*) |
| Exact rational arithmetic | `fractions.Fraction` | Keeps 27/64 as 27/64 |

`binom.pmf(1, 4, 0.25)` returns `0.421875` — the probability that exactly one of four children of
carrier parents is affected — and `binom.sf(0, 4, 0.25)` returns `0.68359375` for "at least one".
[S2](./S2-distributions.md) develops the distributions properly.

## 7. A probability is not a frequency until you take a limit

"P = 1/4" does not mean one child in four. It means that *if* you could repeat the conception
indefinitely under identical conditions, the long-run fraction would approach 1/4. The
approach is the whole content of the claim, and it is slow:

```python
rng = np.random.default_rng(5)
n = 10**7
aff = (rng.random(n) < 0.5) & (rng.random(n) < 0.5)
run = np.cumsum(aff) / np.arange(1, n + 1)
for k in [10, 100, 10**3, 10**4, 10**5, 10**6, 10**7]:
    print("n=%-9d p_hat=%.6f   |error|=%.6f   1/sqrt(n)=%.6f"
          % (k, run[k-1], abs(run[k-1] - 0.25), 1/np.sqrt(k)))
```

```
n=10        p_hat=0.300000   |error|=0.050000   1/sqrt(n)=0.316228
n=100       p_hat=0.270000   |error|=0.020000   1/sqrt(n)=0.100000
n=1000      p_hat=0.270000   |error|=0.020000   1/sqrt(n)=0.031623
n=10000     p_hat=0.250800   |error|=0.000800   1/sqrt(n)=0.010000
n=100000    p_hat=0.248350   |error|=0.001650   1/sqrt(n)=0.003162
n=1000000   p_hat=0.249615   |error|=0.000385   1/sqrt(n)=0.001000
n=10000000  p_hat=0.250032   |error|=0.000032   1/sqrt(n)=0.000316
```

The error shrinks like 1/√*n* — four times as many plants to halve the uncertainty, a hundredfold
to shrink it tenfold.
That rate is the whole of [S3](./S3-sampling-and-estimation.md), and it is why genetics
experiments are large.

More important is what happens at realistic sample sizes. Ten thousand independent crosses of a
hundred plants each:

```python
batches = ((rng.random((10_000, 100)) < 0.5) & (rng.random((10_000, 100)) < 0.5)).mean(1)
print("mean %.4f   sd %.4f   (theory %.4f)   95%% of runs give %.2f to %.2f"
      % (batches.mean(), batches.std(), np.sqrt(0.25*0.75/100), *np.percentile(batches, [2.5, 97.5])))
```

```
mean 0.2502   sd 0.0436   (theory 0.0433)   95% of runs give 0.17 to 0.34
```

A perfectly Mendelian cross of 100 plants routinely yields anything from 17% to 34% recessives.
Anyone who reports "we observed 29% and therefore suspect a modifier" has not done this
calculation.

**And a single event has no frequency at all.** "The probability this couple's next child is
affected is 1 in 350" is not a statement about a sequence — there is one child. It is a statement
about a *state of information*: given what is known, 1/350 of the possible worlds consistent with
the evidence contain an affected child. Change the information — screen the partner, observe
another child — and the number changes without anything physical changing. This is the Bayesian
reading, it is what §5's table computes, and it is the only reading under which pedigree risk
means anything. Note the corollary: because the number depends on the conditioning information,
**two competent counsellors with different data will quote different risks and both be right.**

## 8. Base rates, or why a 99% test is usually wrong

Now put §3 and §5 together on the problem that matters clinically. A test has **sensitivity**
P(positive | affected) and **specificity** P(negative | unaffected). The patient wants
P(affected | positive) — the **positive predictive value** — which is the other conditional, and
Bayes says it depends on the prevalence the assay knows nothing about.

```python
def ppv(prev, sens, spec):
    tp, fp = prev * sens, (1 - prev) * (1 - spec)
    return tp / (tp + fp), 1e6 * tp, 1e6 * fp

for prev, sens, spec, label in [
    (1/10_000, 0.99,  0.99,   "illustrative: 99% / 99%, 1 in 10,000"),
    (1/10_000, 1.00,  0.99,   "  perfect sensitivity instead"),
    (1/10_000, 0.99,  0.9999, "  100x better specificity instead"),
    (1/1_000,  0.997, 0.9996, "NIPT trisomy 21, low-risk population"),
    (1/100,    0.997, 0.9996, "NIPT trisomy 21, age-35+ population"),
]:
    p, tp, fp = ppv(prev, sens, spec)
    print("%-38s PPV = %6.2f%%   (per 10^6: %6.0f TP, %6.0f FP)" % (label, 100*p, tp, fp))
```

```
illustrative: 99% / 99%, 1 in 10,000   PPV =   0.98%   (per 10^6:     99 TP,   9999 FP)
  perfect sensitivity instead          PPV =   0.99%   (per 10^6:    100 TP,   9999 FP)
  100x better specificity instead      PPV =  49.75%   (per 10^6:     99 TP,    100 FP)
NIPT trisomy 21, low-risk population   PPV =  71.39%   (per 10^6:    997 TP,    400 FP)
NIPT trisomy 21, age-35+ population    PPV =  96.18%   (per 10^6:   9970 TP,    396 FP)
```

The first row is the one to internalise. A test that is 99% sensitive and 99% specific, applied
to a condition affecting 1 person in 10,000, is **wrong 99% of the time it says yes**. Nothing is
broken: the 9,999 unaffected people who test positive are drawn from a pool 9,999 times larger
than the affected pool. Two design consequences fall straight out of the table:

- **Sensitivity is nearly irrelevant here.** Making it perfect moves the PPV from 0.98% to 0.99%.
- **Specificity is the whole game.** A hundredfold cut in the false-positive rate — 99% to 99.99%,
  which sounds like a trivial change — moves the PPV to 49.75%.

For rare conditions, PPV ≈ prevalence × sensitivity / (false-positive rate): linear in
prevalence, inversely proportional to the false-positive rate, almost indifferent to sensitivity.

The last two rows are real. Non-invasive prenatal testing for trisomy 21 has pooled sensitivity
around 99.7% and a false-positive rate around 0.04%, and the *identical laboratory assay*
delivers a 71% PPV in a low-risk population and a 96% PPV in an older one. Quoting test
performance without naming a population is therefore meaningless, and one result letter means
different things to two patients — which is the argument of
[Ch 57](../part-12-applications-and-ethics/57-genomics-in-practice.md), and the reason a positive
screen is a reason to do a different test rather than a diagnosis.

If the arithmetic still feels wrong, simulate ten million people and count:

```python
rng = np.random.default_rng(6)
N, prev, sens, spec = 10_000_000, 1/10_000, 0.99, 0.99
sick = rng.random(N) < prev
pos = np.where(sick, rng.random(N) < sens, rng.random(N) < 1 - spec)
print("%d positives, %d truly affected -> PPV = %.4f" % (pos.sum(), (pos & sick).sum(), sick[pos].mean()))
```

```
100845 positives, 983 truly affected -> PPV = 0.0097
```

---

## Common misconceptions

| What people think | What's actually true |
|---|---|
| A 1/4 risk means one child in four | It is a per-conception probability, not a quota. P(exactly one affected of four) = 27/64 ≈ 0.42, and P(none) = 81/256 ≈ 0.32 |
| Having an affected child lowers the risk to the next | Meioses are independent. Nothing is owed. What a family history changes is your estimate of the *parents'* genotypes |
| Family history never changes the per-child risk | Only when the parental genotypes are already known. With unknown parents, one affected child raises the next child's risk from 1/2,500 to 1/4 |
| A purple F₂ plant is 1/4 homozygous | 1/3. Observing "purple" deletes the *aa* quarter of the sample space and the survivors renormalise |
| A 99%-sensitive test is right 99% of the time | Sensitivity is conditional on being affected. The patient wants the reverse conditional, which depends on prevalence — at 1 in 10,000 the PPV is 0.98% |
| Improving sensitivity is how you improve a screening test | For rare conditions PPV ≈ prevalence × sens / FPR. Specificity is the lever; sensitivity barely moves the answer |
| Probabilities of alternatives add | Only if they are mutually exclusive. P(*A*\_) + P(*B*\_) = 3/2, which is not a probability |
| Probabilities across loci multiply | Only if the loci are independent. Linked loci require the recombination fraction, and linkage is often the hypothesis under test |
| A probability is a long-run frequency | Only where a reference class of repetitions exists. A pedigree risk is a state of information about one child, and it changes when the information changes without anything physical changing |
| Expectations need independence | Expectation is linear regardless of dependence. *Variance* is what needs it — and in genomic data, linkage disequilibrium routinely inflates variance by an order of magnitude |

## Worked example: how often does a carrier of a variant carry two copies?

A conditional-probability question with a real answer, on real genotypes. **Given that a person
carries at least one copy of a variant, what is the probability they carry two?** This is the
population-genetic version of "the purple plant is 1/3 homozygous", and it is the calculation
underneath every carriers-versus-affected ratio in clinical genetics.

**Step 1 — the algebra.** Under Hardy–Weinberg with minor-allele frequency *q*:

```
P(hom | carrier) = q² / (q² + 2q(1−q)) = q / (2 − q)
```

At *q* = 0.5 that is 0.5/1.5 = **1/3** — Mendel's F₂ result is the special case of a general
population formula. At *q* = 0.1 it is 0.053; at *q* = 0.01 it is 0.005. **The rarer the allele,
the more overwhelmingly its carriers are heterozygotes**, which is why 98% of cystic fibrosis
alleles sit in unaffected carriers ([Ch 26](../part-05-population-genetics/26-hardy-weinberg.md)).

**Step 2 — measure it.** Continuing the §6 session (`raw` and `sup` are already loaded), take the
1,837 common variants (MAF > 5%) of the chr22 window, with the minor allele and the variant set
fixed once on the whole sample so that every group is compared on identical terms:

```python
G   = raw.iloc[:, 6:].to_numpy(float)
qall = G.mean(0) / 2
G    = np.where(qall > 0.5, 2 - G, G)          # recode so 2 = minor homozygote
G    = G[:, np.minimum(qall, 1 - qall) > 0.05]

def report(sub, label):
    q   = sub.mean(0) / 2                      # this group's own minor-allele frequencies
    car, hom = (sub >= 1).sum(), (sub == 2).sum()
    exp = (q**2).sum() / (q**2 + 2*q*(1 - q)).sum()
    print("%-12s n=%4d   carriers %8d   homozygotes %7d   observed %.4f   HWE %.4f   obs/HWE %.3f"
          % (label, sub.shape[0], car, hom, hom/car, exp, (hom/car)/exp))

report(G, "all samples")
for s in ["AFR", "AMR", "EAS", "EUR", "SAS"]:
    report(G[sup == s], s)
```

```
all samples  n=2503   carriers  1716427   homozygotes  379191   observed 0.2209   HWE 0.2008   obs/HWE 1.100
AFR          n= 660   carriers   444088   homozygotes  102561   observed 0.2309   HWE 0.2332   obs/HWE 0.990
AMR          n= 347   carriers   234397   homozygotes   46927   observed 0.2002   HWE 0.2028   obs/HWE 0.987
EAS          n= 504   carriers   341784   homozygotes   76945   observed 0.2251   HWE 0.2322   obs/HWE 0.970
EUR          n= 503   carriers   359249   homozygotes   73804   observed 0.2054   HWE 0.2090   obs/HWE 0.983
SAS          n= 489   carriers   336909   homozygotes   78954   observed 0.2343   HWE 0.2193   obs/HWE 1.069
```

**Step 3 — read the result.** Within a single continental group the prediction holds to within a
few percent: 0.2054 observed against 0.2090 predicted in Europeans, 0.2309 against 0.2332 in
Africans. Pool all 2,503 people and the observed value jumps **10% above** the prediction
computed from the pooled allele frequencies — 0.2209 against 0.2008.

Nothing about any individual changed. What changed is that the pooled sample is not one
population, and the conditional-probability model assumed it was. Two alleles drawn from one
person are more alike than two alleles drawn from the pooled bucket, because they come from the
same continental group. This is the **Wahlund effect**, and it is the single most common reason
real genotype data fails a Hardy–Weinberg test
([Ch 26 §8](../part-05-population-genetics/26-hardy-weinberg.md),
[Ch 28](../part-05-population-genetics/28-structure-and-inbreeding.md)).

**Step 4 — say what was assumed, and what the data has already been through.** Three caveats,
all of which matter more than the headline number:

- These 3,564 SNPs occupy **one megabase**, so they are heavily correlated. The point estimates
  above are unbiased, but their precision is far worse than the eight-digit counts suggest —
  §6 measured the effective sample as roughly 47 independent units, not 3,564.
- The `chr22_qc` file was built with `--hwe 1e-6` applied to the **pooled** sample, so variants
  with the largest pooled departures have already been removed. The 10% excess is therefore an
  *underestimate* of the true pooling effect. Always ask what filters a dataset has been through
  before interpreting a residual.
- The SAS group's 1.069 stands out among the continental groups. South Asian samples in
  1000 Genomes comprise five populations with substantial internal structure and documented
  endogamy, so residual homozygote excess there is expected rather than anomalous — but with
  ~490 people and ~47 effective independent sites, one group's deviation is not by itself strong
  evidence of anything.

## Where this is used

- [Ch 10](../part-02-transmission-genetics/10-mendelian-inheritance.md) and
  [Ch 11](../part-02-transmission-genetics/11-beyond-mendel.md) — every Mendelian ratio is the
  product rule applied across loci and the sum rule applied within one
- [Ch 12](../part-02-transmission-genetics/12-probability-and-testing.md) — turns §5's table into
  the standard pedigree calculation and adds χ² and ascertainment on top of it
- [Ch 14](../part-02-transmission-genetics/14-linkage-and-mapping.md) — what happens to §2's
  product rule when the independence assumption fails
- [Ch 15](../part-02-transmission-genetics/15-pedigrees.md) — the prior/conditional/joint/posterior
  table, applied repeatedly, with imperfect assays in the conditional row
- [Ch 26](../part-05-population-genetics/26-hardy-weinberg.md) — *p*² : 2*pq* : *q*² is the product
  rule on two independent draws from a gamete pool; the worked example is its conditional form
- [Ch 34](../part-07-molecular-evolution/34-phylogenetics.md) and
  [Ch 46](../part-10-functional-genomics/46-variant-calling.md) — genotype likelihoods and tree
  likelihoods are §5's conditional row, computed at scale ([S6](./S6-likelihood-and-bayes.md))
- [Ch 55](../part-11-human-and-statistical-genomics/55-clinical-variant-interpretation.md) — ACMG
  evidence combination is a Bayesian point system; the prior is the pre-test probability of
  pathogenicity
- [Ch 57](../part-12-applications-and-ethics/57-genomics-in-practice.md) — §8 in full: NIPT,
  newborn screening, and the prosecutor's fallacy in forensic genetics

## Check yourself

**1. In a cross *AaBb* × *AaBb* with unlinked loci, what fraction of progeny show the dominant phenotype at *A* or at *B* (or both)?**

<details><summary>Answer</summary>

Not 3/4 + 3/4 = 3/2, which is not a probability. The events are not mutually exclusive.

Inclusion–exclusion: P(*A*\_ ∪ *B*\_) = 3/4 + 3/4 − (3/4)(3/4) = 15/16.

Or take the complement, which is usually easier: the only excluded class is *aabb*, at
(1/4)(1/4) = 1/16, so the answer is 1 − 1/16 = **15/16**. Whenever a question says "at least one"
or "or", reach for the complement first.

</details>

**2. A woman's brother has an autosomal recessive disease. She is unaffected and has been given no test. Her partner is a screened carrier. They have two unaffected children. Compute the risk to a third, and say which step is most often dropped.**

<details><summary>Answer</summary>

Prior for her, from *Aa* × *Aa* with *aa* deleted: **2/3** carrier, 1/3 not. Her partner is a
carrier with certainty.

Conditional on two unaffected children: (3/4)² = 9/16 if she carries, 1 if she does not.

| | Carrier | Non-carrier |
|---|---|---|
| Prior | 2/3 | 1/3 |
| Conditional | 9/16 | 1 |
| Joint | 3/8 | 1/3 |
| Posterior | (3/8)/(3/8 + 1/3) = **9/17 ≈ 0.53** | 8/17 |

Risk to the third child = (9/17) × ½ × ½ = **9/68 ≈ 0.13**.

The step most often dropped is the 2/3 prior — using 1/2 because "she's a sibling" ignores that
the observation "unaffected" has already deleted a quarter of the sample space, and it changes
the final answer by a third. The second most often dropped is noticing how *weak* the evidence
from two unaffected children is: 0.67 → 0.53.

</details>

**3. A variant has minor-allele frequency 2% in a population in Hardy–Weinberg proportions. Of the people carrying at least one copy, what fraction carry two? Of all copies of the minor allele, what fraction sit in heterozygotes?**

<details><summary>Answer</summary>

P(hom | carrier) = *q*/(2 − *q*) = 0.02/1.98 = **0.0101**, about 1 carrier in 99.

Fraction of minor alleles in heterozygotes = 2*pq* / (2*pq* + 2*q*²) = *p*/(*p* + *q*) = *p* =
**0.98**.

Both numbers say the same thing from different ends: for a rare allele, essentially the entire
allelic mass is hiding in heterozygotes. This is why selection against a recessive disease is so
feeble, why carrier screening rather than case-finding is the only effective public-health lever,
and why a rare homozygote is such an informative observation when you see one.

</details>

**4. A newborn screening test for a condition affecting 1 in 20,000 has 99.5% sensitivity and 99.8% specificity. What is the PPV? A vendor offers either perfect sensitivity or a tenfold reduction in false positives, at the same price. Which do you take, and by how much does it help?**

<details><summary>Answer</summary>

Per million newborns: 50 affected → 49.75 true positives. 999,950 unaffected → 1,999.9 false
positives. PPV = 49.75 / 2,049.65 = **2.43%**. About one positive in 41 is real.

Perfect sensitivity gives 50 / 2,049.9 = **2.44%** — a gain of one hundredth of a percentage
point. A tenfold cut in the false-positive rate (specificity 99.98%) gives
49.75 / (49.75 + 200.0) = **19.9%**, an eightfold improvement.

Take the specificity. For a rare condition PPV ≈ π·sens/FPR: linear in prevalence, inversely
proportional to the false-positive rate, and nearly indifferent to sensitivity once sensitivity
is already high. This is why assay development for screening concentrates almost entirely on
false positives, and why you should ask a laboratory for its observed PPV in a clinical series
rather than for its sensitivity.

</details>

**5. You compute the expected number of heterozygous sites per person in a 1 Mb window as Σ 2*pᵢ*(1 − *pᵢ*) and it matches the data to 0.6%. A colleague then computes a standard deviation the same way and gets 19.7 against an observed 170. Is the expectation calculation also suspect?**

<details><summary>Answer</summary>

No. The two calculations rest on different assumptions and only one of them failed.

E[Σ *Xᵢ*] = Σ E[*Xᵢ*] is **linearity of expectation**, which holds for arbitrarily dependent
random variables. The only assumption in the mean is that each E[*Xᵢ*] = 2*pᵢ*(1 − *pᵢ*), i.e.
Hardy–Weinberg at each variant separately — and the 0.6% agreement is genuine evidence for it.

Var(Σ *Xᵢ*) = Σ Var(*Xᵢ*) additionally requires the *Xᵢ* to be uncorrelated, and within a
megabase they are strongly correlated by linkage disequilibrium. Adding the covariance terms back
is what closes the 8.7-fold gap; equivalently, the 3,564 sites behave like about 47 independent
ones.

The general lesson recurs constantly in genomics: **dependence between markers leaves means alone
and destroys variances**, which is why standard errors, p-values and multiple-testing corrections
computed as though variants were independent are wrong, while the effect estimates themselves are
fine ([S5](./S5-variance-and-regression.md), [S7](./S7-high-dimensional-data.md)).

</details>
