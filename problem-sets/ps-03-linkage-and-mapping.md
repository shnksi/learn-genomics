# Problem set 03 — Linkage and mapping

Covers [Ch 14](../part-02-transmission-genetics/14-linkage-and-mapping.md).

**Attempt before revealing.** The three-point cross in problem 4 is the single most important
calculation in classical genetics — it is worth doing twice.

---

## 1. Recognising linkage

A dihybrid *AaBb* is test-crossed to *aabb*. Offspring:

| Phenotype | Count |
|---|---|
| *A B* | 412 |
| *a b* | 388 |
| *A b* | 102 |
| *a B* | 98 |
| **Total** | **1000** |

**(a)** What would independent assortment predict?
**(b)** Are these genes linked? Test it.
**(c)** Compute the recombination frequency and map distance.
**(d)** Was the dihybrid parent in coupling or repulsion?

<details><summary>Solution</summary>

**(a)** A test cross reads the dihybrid's gametes directly. Under independent assortment all
four gamete types are equally frequent: **250 : 250 : 250 : 250**.

**(b)** Observed is nothing like 1:1:1:1. Test formally with χ² against the 250 expectation:

χ² = (412−250)²/250 + (388−250)²/250 + (102−250)²/250 + (98−250)²/250
   = 104.98 + 76.18 + 87.62 + 92.42 = **361.2**

df = 3, critical value 7.815 at α = 0.05. χ² = 361 is enormous — **reject independent
assortment decisively.** The genes are linked.

**(c)** The two rare classes are the recombinants:

RF = (102 + 98) / 1000 = 200/1000 = **0.20 = 20%**

Map distance = **20 cM** (1% RF ≡ 1 map unit).

**(d)** The *parental* (most frequent) classes tell you the parent's configuration. *A B* and
*a b* are the abundant ones, so the alleles *A* and *B* travelled together on one chromosome
and *a* and *b* on the other:

**Coupling (cis): _AB / ab_**

Had it been repulsion (*Ab / aB*), the abundant classes would have been *A b* and *a B*.

</details>

---

## 2. Why RF cannot exceed 50%

**(a)** Explain why recombination frequency saturates at 50%, in terms of crossover number.
**(b)** Two genes on the same chromosome show RF = 50%. What can you conclude?
**(c)** How would you demonstrate they are nonetheless syntenic?

<details><summary>Solution</summary>

**(a)** A single crossover between two loci produces two recombinant and two parental chromatids
from a four-chromatid bivalent — so **one crossover in an interval yields 50% recombinants among
the products of that meiosis**, not 100%.

As the interval lengthens, the number of crossovers per meiosis rises. With two crossovers
between the loci, the second can undo the first: a two-strand double crossover restores the
parental configuration entirely. Averaged over the possible strand involvements, multiple
crossovers drive the expected recombinant fraction toward — but never above — 50%.

The limit is therefore the same value you would get from genes on *different* chromosomes,
where the loci assort independently and give 50% recombinants by definition.

**(b)** That the loci are **genetically unlinked**. You cannot tell from this data whether they
are on different chromosomes or far apart on the same one — the two are indistinguishable by
recombination frequency alone. This is why genetic maps are built additively from *short*
intervals: only short intervals give distances that are both accurate and additive.

**(c)** Show synteny by a route that does not depend on recombination:

- **Linkage through a third marker.** If A–C = 15 cM and C–B = 18 cM, then A and B are on the
  same chromosome ~33 cM apart even though A–B measures 50%.
- **Physical evidence** — both loci map to the same chromosome by *in situ* hybridisation, or
  both appear on the same assembled sequence in a reference genome.

Chaining short intervals is precisely how classical maps were built, and it is why a map can be
hundreds of cM long when no single measured RF exceeds 50%.

</details>

---

## 3. Mapping functions ★

**(a)** Derive Haldane's mapping function from the assumption that crossovers occur as a Poisson
process with no interference.
**(b)** An observed RF is 0.30. What map distance does Haldane give?
**(c)** Kosambi gives a different answer. Why, and which is more realistic over short distances?

<details><summary>Solution</summary>

**(a)** Count crossovers **on a single chromatid**, not on the bivalent — that is what a map
distance in Morgans already is. Let *d* be the mean number falling in the interval on one
chromatid. Under Poisson with no interference,

P(*k* crossovers) = e^(−d) d^k / k!

A chromatid is recombinant across the interval **if and only if *k* is odd**: zero crossovers
leave the flanking markers as they started, and two put them back. So sum the odd terms
(the parity argument of [Ch 14](../part-02-transmission-genetics/14-linkage-and-mapping.md) §3):

RF = P(*k* odd) = e^(−d) (d + d³/3! + d⁵/5! + ⋯) = e^(−d) sinh d

and since sinh d = (e^d − e^(−d))/2,

**RF = ½(1 − e^(−2d))**

Note what this derivation did *not* need: any four-chromatid bookkeeping. The fact that each
crossover involves only two of the four chromatids is already absorbed by counting per
chromatid, which is exactly what makes *d* a map distance. (Count per meiosis instead, call
that *m*, and you get *d* = m/2 — the same formula, reached with an extra step to get wrong.)

Invert:

e^(−2d) = 1 − 2·RF
−2d = ln(1 − 2·RF)

**d = −½ ln(1 − 2·RF)** Morgans

Two sanity checks. As RF → 0, expand ln(1−x) ≈ −x: d ≈ ½(2·RF) = RF, so short distances give
d ≈ RF as they must. As RF → 0.5, the logarithm diverges and d → ∞ — correctly capturing that
50% recombination is compatible with unlimited map distance.

**(b)** d = −½ ln(1 − 0.60) = −½ ln(0.40) = −½ × (−0.9163) = **0.458 Morgans = 45.8 cM**

The correction is substantial: a naive reading of 30% RF as 30 cM understates the distance by
more than a third.

**(c)** Haldane assumes **no interference** — crossovers are independent. Real meioses show
**positive interference**: one crossover suppresses another nearby, so double crossovers in
short intervals are rarer than Poisson predicts.

Kosambi's function builds in interference that decays with distance:

d = ¼ ln[(1 + 2·RF)/(1 − 2·RF)]

At RF = 0.30: d = ¼ ln(1.60/0.40) = ¼ ln(4) = ¼ × 1.3863 = **0.347 M = 34.7 cM**

Kosambi gives a shorter distance because it does not credit the interval with as many
undetected double crossovers. Over **short** intervals — where interference is strongest and
real — Kosambi is the better model; both converge on RF itself as RF → 0, and both diverge as
RF → 0.5.

</details>

---

## 4. The three-point cross ★★

A trihybrid is test-crossed. Genes *a*, *b*, *c*. Offspring (1,000 total):

| Phenotype | Count |
|---|---|
| `+ + +` | 390 |
| `a b c` | 380 |
| `+ b c` | 62 |
| `a + +` | 58 |
| `+ + c` | 52 |
| `a b +` | 48 |
| `+ b +` | 5 |
| `a + c` | 5 |

**(a)** Identify the parental and double-crossover classes.
**(b)** Determine the gene order.
**(c)** Compute both map distances.
**(d)** Compute the coefficient of coincidence and interference.

<details><summary>Solution</summary>

**(a)** **Parentals are the most frequent**: `+ + +` (390) and `a b c` (380) — 770 total.

**Double crossovers are the rarest**: `+ b +` (5) and `a + c` (5) — 10 total.

The remaining four classes are single crossovers in one interval or the other.

**(b)** Compare a double-crossover class with the parental it most resembles. A double crossover
flips **only the middle gene**.

Parental: `+ + +`
DCO:      `+ b +`

Positions 1 and 3 are unchanged; the middle symbol changed from `+` to `b`. **Therefore *b* is
in the middle**, and the order is **a – b – c**.

Rewriting all classes in map order a–b–c makes the structure visible:

```
          a   b   c      count   class
          +   +   +       390    parental
          a   b   c       380    parental
          +   b   c        62    CO in region I  (a–b)
          a   +   +        58    CO in region I
          +   +   c        52    CO in region II (b–c)
          a   b   +        48    CO in region II
          +   b   +         5    DCO
          a   +   c         5    DCO
```

**(c)** A double crossover involves a crossover in *both* regions, so it must be counted in both
distances. This is the step people omit.

**Region I (a–b):** single crossovers 62 + 58 = 120, plus both DCO classes 10

RF(a–b) = (120 + 10)/1000 = 130/1000 = 0.130 → **13.0 cM**

**Region II (b–c):** single crossovers 52 + 48 = 100, plus both DCO classes 10

RF(b–c) = (100 + 10)/1000 = 110/1000 = 0.110 → **11.0 cM**

Total a–c = 24.0 cM. Note this exceeds the *observed* a–c recombinant count (120 + 100 = 220,
i.e. 22%), because the DCO chromatids are parental at the outer markers and so are invisible to
a two-point a–c measurement. That gap is exactly why three-point crosses are more accurate than
chaining two-point ones.

**(d)** Expected DCOs if the two regions were independent:

Expected frequency = 0.130 × 0.110 = 0.0143 → **14.3 expected** in 1,000

Observed = 10

**Coefficient of coincidence** = observed/expected = 10/14.3 = **0.70**

**Interference** = 1 − c.o.c. = 1 − 0.70 = **0.30**

Interpretation: only 70% of the expected double crossovers occurred, so 30% were prevented. A
crossover in one region suppresses one nearby — positive interference, which is what Kosambi's
function in problem 3 is designed to accommodate.

</details>

---

## 5. LOD scores

A human pedigree study tests linkage between a disease locus and a marker. At θ = 0.10 the
likelihood of the data under linkage is 1,000 times the likelihood under no linkage.

**(a)** What is the LOD score?
**(b)** Is this significant by the conventional threshold, and what is that threshold?
**(c)** Why is the threshold 3 rather than something corresponding to p < 0.05?

<details><summary>Solution</summary>

**(a)** LOD = log₁₀(likelihood ratio) = log₁₀(1000) = **3.0**

**(b)** Yes. The conventional threshold for declaring linkage in humans is **LOD ≥ 3.0**, and
LOD ≤ −2 is taken as evidence *excluding* linkage at that θ.

**(c)** Because of the low prior probability that any two randomly chosen loci are linked.

The human genome is roughly 3,500 cM of genetic map. For a randomly chosen marker and a disease
locus, the prior odds of them being linked closely enough to detect is roughly **1 in 50**.

Bayes then requires the *likelihood ratio* to overcome those prior odds before the posterior
favours linkage:

posterior odds = prior odds × likelihood ratio = (1/50) × 1000 = **20:1**

which corresponds to a posterior probability of linkage of 20/21 ≈ 95% — the familiar
confidence level. A LOD of 3 is therefore not "p = 0.001"; it is the likelihood ratio needed to
drag a 1-in-50 prior up to about 95% posterior.

This is a genuinely Bayesian threshold, and it is why the number is 3 rather than something
derived from a tail probability. The same logic is why genome-wide association studies need
p < 5 × 10⁻⁸ rather than 0.05 ([Ch 51](../part-11-human-and-statistical-genomics/51-gwas.md)) —
in both cases the correction is for the enormous number of places the signal could have been.

</details>

---

## 6. Genetic versus physical distance

Human autosomes: ~2,875 Mb physical, ~3,400-3,500 cM genetic (sex-averaged, autosomal).

**(a)** What is the genome-wide average relationship between cM and Mb?
**(b)** A 5 Mb interval shows 0.5 cM of recombination. What does that suggest?
**(c)** Give three reasons the ratio varies across the genome.

<details><summary>Solution</summary>

**(a)** 3,500 cM ÷ 2,875 Mb = **~1.2 cM/Mb**, conventionally rounded to **~1 cM ≈ 1 Mb** in
humans.

This is a coincidence of scale, not a law, and it is species-specific — in *Drosophila* the
ratio is very different.

**(b)** Observed 0.5 cM across 5 Mb = 0.1 cM/Mb, about **one-twelfth** the genome average. This is
a **recombination cold spot**. Typical causes: proximity to a centromere, where recombination is
strongly suppressed, or a large heterochromatic block.

The practical consequence matters: in a cold spot, linkage disequilibrium extends much further
than the physical distance would suggest, so an association signal there implicates a much
larger candidate region and is correspondingly harder to fine-map
([Ch 52](../part-11-human-and-statistical-genomics/52-association-to-mechanism.md)).

**(c)** Three genuine reasons:

1. **Hotspots.** Recombination is concentrated into narrow hotspots of 1–2 kb, positioned
   largely by PRDM9 binding. Most of the genome recombines far below average; a few kilobases
   carry a disproportionate share.
2. **Chromosomal position.** Recombination is suppressed near centromeres and elevated toward
   telomeres, so the ratio varies systematically along each chromosome.
3. **Sex.** The female genetic map is roughly 1.6× longer than the male map in humans, so cM/Mb
   depends on which sex's meiosis produced the gamete. A sex-averaged map hides this.

</details>

---

## 7. Building a map additively ★

You have pairwise recombination frequencies for four loci on one chromosome:

| Pair | RF |
|---|---|
| A–B | 0.09 |
| B–C | 0.12 |
| A–C | 0.19 |
| C–D | 0.08 |
| B–D | 0.19 |
| A–D | 0.26 |

**(a)** Determine the gene order.
**(b)** Build the map using the short intervals.
**(c)** Compare the predicted A–D distance with the observed A–D recombination frequency, and
explain the discrepancy.

<details><summary>Solution</summary>

**(a)** Find the order by looking for which locus sits between which. The largest pairwise RF
identifies the outermost pair: A–D at 0.26 is the largest, so A and D are the ends.

Check where B and C fall. A–B = 0.09 and A–C = 0.19, so B is closer to A than C is. Order:

**A – B – C – D**

Verify against the remaining values: B–D should be roughly B–C + C–D = 0.12 + 0.08 = 0.20, and
the observed 0.19 is consistent. Good.

**(b)** Build from the **short** intervals only, since those are the ones where RF is closest to
true map distance:

```
A ----9.0---- B ----12.0---- C ----8.0---- D
              |<--- 21.0 --->|
|<---------- 29.0 cM total -------------->|
```

- A–B = 9.0 cM
- B–C = 12.0 cM
- C–D = 8.0 cM
- **Total A–D = 29.0 cM**

**(c)** Predicted A–D from the map = 29.0 cM. Observed A–D recombination = 0.26 = 26%.

The observed value is **lower**, by 3 percentage points. This is not measurement error — it is
systematic, and it is the entire reason maps are built additively.

Over the 29 cM separating A and D, double crossovers occur. A double crossover between A and D
restores the parental configuration at those two outer markers, so the chromatid **looks
non-recombinant** even though two exchanges happened. Every undetected double crossover subtracts
from the observed RF.

The effect grows with distance: at A–B (9 cM) doubles are negligible, at A–D (29 cM) they cost
3 points, and as distance grows further RF saturates toward 0.5 (problem 2). This is why:

- Short intervals give RF ≈ map distance and can be trusted directly
- Long intervals systematically **underestimate** distance
- The correct procedure is to measure short intervals and sum them

You could also recover the true distance from the observed 0.26 with a mapping function
(problem 3): Haldane gives −½ ln(1 − 0.52) = −½ ln(0.48) = −½ × (−0.7340) = 0.367 M = **36.7 cM**.

Note this *overshoots* the additive 29.0 cM, and by considerably more than the 3 points the
doubles cost. Haldane assumes **no interference**, so it credits the interval with every double
crossover a Poisson process would produce — but real meioses suppress nearby doubles, so far
fewer occurred. Haldane therefore over-corrects. The additive map built from short intervals is
the better estimate, and Kosambi (which builds in interference) would land between the two:
¼ ln(1.52/0.48) = 0.288 M ≈ 28.8 cM, very close to the additive 29.0.

</details>

---

## 8. Sex differences and applied mapping

In humans the female genetic map is roughly 1.6× longer than the male map, while the physical
distance is of course identical.

**(a)** A 10 Mb region is 12 cM on the female map. Estimate its male map length and the
sex-averaged length.
**(b)** You are mapping a disease locus using only paternal meioses. How does this affect your
resolution?
**(c)** A recombination hotspot occupies 2 kb but accounts for 40% of the crossovers in a
100 kb interval. What is the local recombination rate inside the hotspot relative to the
interval average?

<details><summary>Solution</summary>

**(a)** If female is 1.6× male, and female = 12 cM:

male = 12 / 1.6 = **7.5 cM**

Sex-averaged is the mean of the two maps:

(12 + 7.5)/2 = **9.75 cM**

Sanity check against the genome average: 9.75 cM over 10 Mb ≈ 0.98 cM/Mb, within about 20% of
the genome-wide ~1.2 cM/Mb from problem 6. Consistent.

**(b)** Using only paternal meioses means observing recombination at the **male** rate, which is
about 40% lower. Fewer crossovers per meiosis in the region means:

- **Fewer informative recombinants** for a given number of meioses, so you need more families
  for the same statistical power.
- **Coarser resolution.** Mapping resolution depends on observing crossovers that fall between
  your locus and nearby markers; with fewer crossovers, the interval you can narrow to is wider.

The flip side is that male meioses are *more* informative near telomeres, where the male map is
locally denser than the female map. Sex-specific maps differ in shape, not just in total length,
so which sex is more useful depends on where in the genome you are working.

**(c)** Compute the rate density inside and outside the hotspot.

Let the interval carry a total recombination rate *R* over 100 kb.

- **Hotspot**: 40% of *R* in 2 kb ⇒ rate density = 0.40*R* / 2 kb = 0.20*R* per kb
- **Interval average**: *R* / 100 kb = 0.01*R* per kb

Ratio = 0.20*R* / 0.01*R* = **20-fold** the interval average.

Comparing instead against the *non-hotspot* remainder: 60% of *R* spread over 98 kb gives
0.00612*R* per kb, so the hotspot is 0.20/0.00612 ≈ **33-fold** hotter than the surrounding
sequence.

This is a deliberately mild example. Real human hotspots are typically 1–2 kb wide and can carry
recombination rates hundreds to thousands of times the genome average, with the great majority
of the genome recombining far below average. The consequence for association studies is direct:
LD breaks down sharply *at* hotspots and persists across the cold blocks between them, which is
what produces the haplotype-block structure of the human genome
([Ch 29](../part-05-population-genetics/29-linkage-disequilibrium.md)).

</details>

---

## Where you went wrong

| Error pattern | What to re-read |
|---|---|
| Forgot to add DCOs into *both* interval distances | Problem 4(c) — the commonest three-point error |
| Determined gene order from the parentals instead of comparing DCO to parental | Problem 4(b) |
| Read RF = 50% as "definitely different chromosomes" | Problem 2(b) |
| Treated map distance as directly equal to RF over long intervals | Problem 3(b) |
| Thought LOD 3 means p = 0.001 | Problem 5(c) |
| Assumed 1 cM = 1 Mb everywhere | Problem 6(c) |
