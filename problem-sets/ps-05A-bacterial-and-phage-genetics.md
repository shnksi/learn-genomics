# Problem set 05A — Bacterial and phage genetics

Covers [Ch 20A](../part-03-genome-instability/20A-bacterial-and-phage-genetics.md).

**Attempt before revealing.** This is the most calculable material in classical genetics, and the
reason is that bacteria let you *select* instead of *count*. Almost every problem below therefore
turns on a denominator — how many cells you plated, how many particles were in the lysate, how big
a fragment the phage could carry. The set is built to expose four specific habits: reading an
absolute clock reading as a map position (problem 1), adding cotransduction frequencies (problem 2),
collapsing the two questions "same function?" and "same position?" into one (problems 3 and 4), and
trusting a binary search whose central assumption has quietly failed (problem 8).

Every constant used here is pinned in Ch 20A: the *E. coli* MG1655 chromosome is **4,641,652 bp**
mapped onto **100 minutes**, so 1 minute = **46.4 kb**; the P1 headful is **~100 kb ≈ 2 minutes**;
the T4 genome is **168,903 bp** over ~1,600 map units, so **1 map unit ≈ 106 bp**.

---

## 1. Reading a chromosome off a clock

You have an Hfr strain, **Hfr B7**, of unknown origin and orientation. You mate it with an
Str^R F⁻ recipient carrying auxotrophic lesions in all five markers below, blend samples at
intervals, and plate each on minimal medium plus streptomycin, selecting one donor marker at a
time. Extrapolating each rise back to the axis gives these **times of entry**:

| Marker selected | Time of entry (min) |
|---|---:|
| *lac*⁺ | 12.0 |
| *gal*⁺ | 21.2 |
| *arg*⁺ | 40.0 |
| *his*⁺ | 49.1 |
| *xyl*⁺ | 57.6 |

Three of these have known map positions from the MG1655 sequence (Ch 20A §3): *lacZ* at
**7.9 min**, *galE* at **17.1 min**, *hisG* at **45.0 min**. The positions of *arg* and *xyl* are
what you want. Map coordinates run 0 to 100 and increase in the standard direction; all five
markers lie in the first 60 minutes of the map, so you need not worry about wrapping.

**(a)** Give the order of the five markers and the direction in which Hfr B7 transfers.
**(b)** Place *arg* and *xyl* on the map, in minutes.
**(c)** You used *lac* as your anchor. Show that *gal* and *his* give the same answer, and say
what the agreement demonstrates.
**(d)** A colleague extrapolates the entry times to *t* = 0 and announces that F integrated at
**95.9 min**, with an initiation lag of **4.1 minutes**. Those two claims cannot both be read off
these data. Show that the experiment determines only *one* quantity, say which, and say what you
would have to measure to split it into the two the colleague reported.

<details><summary>Solution</summary>

**The goal.** Turn a set of clock readings into map coordinates, and find out precisely how much
of the clock reading is map and how much is overhead.

**(a)** Order markers by time of entry — that *is* their order on the chromosome, because the
strand is pumped from a fixed point at a constant rate:

**_lac_ → _gal_ → _arg_ → _his_ → _xyl_**

The three anchored markers enter in the order 7.9 → 17.1 → 45.0, i.e. in the direction of
**increasing map coordinate**. So Hfr B7 transfers "forwards" along the standard map.

**(b)** Position is an affine function of entry time, so **differences** transfer directly.
Anchoring on *lac*:

```
pos(arg) = 7.9 + (40.0 − 12.0) = 7.9 + 28.0 = 35.9 min
pos(xyl) = 7.9 + (57.6 − 12.0) = 7.9 + 45.6 = 53.5 min
```

**_arg_ at 35.9 minutes, _xyl_ at 53.5 minutes.**

**(c)** Repeat from the other two anchors:

```
from galE:  17.1 + (40.0 − 21.2) = 17.1 + 18.8 = 35.9  ✓
from hisG:  45.0 + (40.0 − 49.1) = 45.0 − 9.1  = 35.9  ✓
from hisG:  45.0 + (57.6 − 49.1) = 45.0 + 8.5  = 53.5  ✓
```

All three agree exactly. What this demonstrates is the affine model itself, and it does so as a
*prediction test*: two of the three anchors were not needed, so their agreement is a genuine check
rather than an artefact of the fit.

You can also read the check directly off the anchors, without ever touching *arg* or *xyl*:

```
t(gal) − t(lac) = 21.2 − 12.0 = 9.2       pos(galE) − pos(lacZ) = 17.1 − 7.9  = 9.2   ✓
t(his) − t(lac) = 49.1 − 12.0 = 37.1      pos(hisG) − pos(lacZ) = 45.0 − 7.9  = 37.1  ✓
```

Time intervals equal map intervals, minute for minute. That equality is what makes a minute a
legitimate map unit, and it is why the *E. coli* map is additive and never saturates — unlike a
centimorgan, which is a probability of exchange and tops out at 50%.

**(d)** **The lag is not supportable; the impossibility of separating it from the origin is.**

Write the model down. If F integrated so that transfer starts at map position *O*, transfer runs
at 1 minute of map per minute of mating, and there is an initiation lag Λ before pumping begins,
then for every marker:

```
entry_time  =  (position − O)  +  Λ
```

Rearranged: `entry_time − position = Λ − O`. Compute that quantity for all five markers:

| Marker | entry − position |
|---|---:|
| *lac* | 12.0 − 7.9 = 4.1 |
| *gal* | 21.2 − 17.1 = 4.1 |
| *his* | 49.1 − 45.0 = 4.1 |
| *arg* | 40.0 − 35.9 = 4.1 |
| *xyl* | 57.6 − 53.5 = 4.1 |

The data contain **one** number, 4.1, and it is Λ − *O*. There are **two** unknowns. No amount of
extra markers will separate them, because every marker contributes the same equation. The
parameters are not identifiable.

**The wrong path, and why it is seductive.** Extrapolating to *t* = 0 gives position
7.9 − 12.0 = −4.1, i.e. **95.9 min** on the 100-minute circle. That is the answer you get by
*assuming Λ = 0*, and it is wrong by exactly Λ. The chapter's worked example makes the same
computation legitimately — but only because that Hfr's origin was already known to be at 0, which
turns `Λ − O` into `Λ` and lets it be read as a lag. Hfr B7's origin is not known, so the same
arithmetic answers a different question and the reader has to notice which.

Taking Ch 20A's typical few-minute lag, Λ ≈ 6, the origin would be at 95.9 + 6 ≈ **1.9 min** — but
that borrows a constant from someone else's experiment, which is the habit the chapter warns
against.

**What to measure.** The lag is a property of the *mating conditions* — time to form a pair and
initiate at *oriT* — not of the map. So calibrate it: run the identical protocol, same medium,
same temperature, same cell densities, with a reference Hfr whose origin is independently known.
Its `entry − position` is Λ directly. Subtract, and Hfr B7's origin drops out.

**Generalise.** Interrupted mating is a time-indexed oracle with an unknown, additive offset. Any
quantity you compute from *differences* of query times is measurable; any quantity that needs an
*absolute* query time needs a separate calibration. That distinction survives well past bacterial
genetics — it is the same reason a phylogeny gives you branch *ratios* for free but needs a fossil
to give you dates.

**A closing sanity check.** *arg* at 35.9 and *his* at 45.0 are 9.1 minutes apart, which is
9.1 × 46.4 ≈ **422 kb**. That is more than four P1 headfuls, so these two markers will show zero
cotransduction — the coarse instrument placed them, and the fine one is useless at this range.
Problem 2 is about that boundary.

</details>

---

## 2. Cotransduction: the ruler and its two dead zones

You grow P1 on a wild-type donor and transduce a recipient mutant at *argF*, *lysA* and *serB*.
Selecting one marker at a time and scoring the unselected ones gives:

| Pair | Cotransduction frequency *C* |
|---|---:|
| *argF* – *lysA* | 0.614 |
| *lysA* – *serB* | 0.422 |
| *argF* – *serB* | 0.216 |

Take the P1 headful as *L* = **2.00 minutes** and 1 minute = **46.4 kb**.

**(a)** A student adds up the two inner separations as `(1 − C)` values and compares with the
outer pair. Do that calculation, show that it fails, and say what goes wrong.
**(b)** Convert all three frequencies to distances properly, in minutes and in kb, and test
additivity.
**(c)** Does the additivity in (b) establish the gene order? If not, what would?
**(d)** A fourth marker *thrB* gives *C* = 0 against all three. A fifth, *hisD*, gives *C* = 0.97
against *argF*, measured with an uncertainty of about ±0.01. What distance does each result give,
and how good is it?

<details><summary>Solution</summary>

**The goal.** Get from a co-transfer statistic to a length, and learn where along the range the
statistic stops carrying information.

**(a) The wrong path.** The instinct is that closer markers cotransduce more, so `1 − C` ought to
behave like a distance:

```
(1 − 0.614) + (1 − 0.422)  =  0.386 + 0.578  =  0.964
observed for the outer pair: 1 − 0.216       =  0.784
```

The outer "distance" comes out **0.784 against a predicted 0.964 — short by 0.180, or 18.7%.**

In a eukaryotic cross you would blame undetected double crossovers, as in
[Ch 14](../part-02-transmission-genetics/14-linkage-and-mapping.md). That explanation is not
available here: there is no second exchange hiding a first. The shortfall is purely functional.
`C` is not linear in *d*, it is **cubic**:

```
C(d) = (1 − d/L)³
```

so `1 − C` is a cubic in *d* too, and cubics do not add.

**(b)** Invert the relation instead. This is the step that makes the numbers additive:

```
d = L (1 − C^(1/3))
```

| Pair | *C* | *C*^(1/3) | *d* (min) | *d* (kb) |
|---|---:|---:|---:|---:|
| *argF* – *lysA* | 0.614 | 0.84994 | **0.300** | **13.9** |
| *lysA* – *serB* | 0.422 | 0.75007 | **0.500** | **23.2** |
| *argF* – *serB* | 0.216 | 0.60000 | **0.800** | **37.1** |

Additivity test:

```
0.300 + 0.500 = 0.800 min       observed outer: 0.800 min   ✓
```

Exact to three decimals — the residual is 0.000033 min, about **1.5 bp**, which is rounding in
the input frequencies and nothing else. In kb: 13.9 + 23.2 = 37.1 ✓.

Contrast that with (a)'s 18.7% shortfall on the identical data. **The cube root does for
cotransduction exactly what a mapping function does for recombination frequency: it converts an
observable that saturates into a length that adds.** The mechanism is completely different — one
is packaging geometry, the other is multiple crossovers — and the remedy has the same shape,
which is worth noticing rather than memorising.

**(c) No.** Additivity is *consistent with* the order *argF* – *lysA* – *serB*, but a lucky set of
estimates can be additive by accident, and additivity alone can never distinguish an order from
its mirror image.

The order comes from a **three-factor transduction**: transduce a triple mutant, **select an
outside marker**, score the other two, and look at the rarest class. Under the correct order,
three of the four classes need two crossovers and one needs four; the four-crossover class is
rare, and in it, *the marker that disagrees with the other two is the middle one*. Crucially, you
then check the alternative orders explicitly — a class requiring two extra exchanges cannot be
the second most common, so any order that predicts a common class to be rare is excluded by the
data rather than assumed away. Ch 20A's worked example runs this on *tonB*–*trp*–*cysB*.

**(d) The two dead zones.**

***thrB*, C = 0 — the saturated end.** `C = 0` means *d* ≥ *L*. All you can say is

```
d ≥ 2.00 min = 92.8 kb
```

and that is a **bound, not a measurement**. A marker 95 kb away and a marker on the opposite side
of the chromosome give the identical reading, because neither ever shares a headful with your
selected marker. This is the RF = 50% ceiling of Ch 14 in different clothing. The remedy is also
the same: change instrument. Conjugation covers the whole 100 minutes and will place *thrB* to
within about a minute, after which you hunt for a nearer marker to link it to by P1.

***hisD*, C = 0.97 — the compressed end.**

```
d = 2(1 − 0.97^(1/3)) = 2(1 − 0.98990) = 0.02020 min = 938 bp
```

Now propagate the ±0.01 uncertainty:

```
C = 0.98  →  d = 0.01342 min =   623 bp
C = 0.96  →  d = 0.02703 min = 1,255 bp
```

A ±0.01 wobble in the frequency swings the answer over a **632 bp** window — two-thirds of the
estimate itself. The reason is visible in the derivative of *C* near *d* = 0:

```
dC/dd = −3/L = −1.5 per minute
```

so 1 kb (= 0.0215 min) moves *C* by only 1.5 × 0.0215 ≈ **0.032**, about three percentage points.
Once your kilobases are worth three points of frequency each, ordinary plating noise is
kilobase-scale noise. **P1 bottoms out around 1–2 kb**, and 938 bp is below that floor: quote it
as "under 1 kb, and not resolvable further by P1".

**Generalise.** The instrument is trustworthy over roughly 1 kb to 100 kb — a range of two orders
of magnitude, bounded above by geometry (the headful) and below by counting statistics (the flat
slope). Both boundaries are properties of the *measurement*, not of the chromosome, and the fix
at either end is a different assay, not a better fit.

</details>

---

## 3. Two tests that disagree ★

Four independently isolated rII mutants of phage T4 — *m1*, *m2*, *m3*, *m4* — none of which
reverts detectably. You run both of Benzer's tests on all six pairs.

**Complementation.** Coinfect *E. coli* K-12(λ) with each pair at high multiplicity and ask
whether the cell lyses. **+ = lysis (complementation), − = no burst.**

| | *m1* | *m2* | *m3* | *m4* |
|---|:--:|:--:|:--:|:--:|
| *m1* | — | **−** | **+** | **+** |
| *m2* | | — | **+** | **+** |
| *m3* | | | — | **−** |
| *m4* | | | | — |

**Recombination.** Cross each pair on the permissive host *E. coli* B, plate the burst on
K-12(λ), and count r⁺ plaques. **Recombination frequency is the percentage of progeny that are
r⁺, with no doubling**, as in Ch 20A §8; 1 map unit = 106 bp.

| Pair | RF (%) |
|---|---:|
| *m1* × *m2* | 1.10 |
| *m1* × *m3* | 1.17 |
| *m1* × *m4* | 7.05 |
| *m2* × *m3* | 0.07 |
| *m2* × *m4* | 5.95 |
| *m3* × *m4* | 5.88 |

You are told independently that *m1* lies in *rII*A, and that *rII*A precedes *rII*B on the map.

**(a)** How many cistrons are represented, and which mutants fall in each?
**(b)** Build the fine-structure map: linear order and spacing in bp.
**(c)** *m1* and *m2* fail to complement; *m2* and *m3* complement. Which pair is physically
closer? State plainly what question each test answered.
**(d)** A reader concludes from the matrix that *m1* and *m2* are "the same mutation" and from the
0.07% that *m2* and *m3* are "in the same gene". Diagnose both errors.

<details><summary>Solution</summary>

**The goal.** Run the two tests on one dataset and watch them return contradictory-looking
verdicts, then see that they were never answering the same question.

**(a)** Complementation is an equivalence-like partition: mutants that fail to complement each
other share a function. Reading the matrix, the "−" cells are *m1*×*m2* and *m3*×*m4*, and every
cross-group pair is "+".

**Two cistrons: {*m1*, *m2*} and {*m3*, *m4*}.** Since *m1* is in *rII*A, that group is *rII*A
and {*m3*, *m4*} is *rII*B. This is Benzer's headline partition — all rII mutants fall into
exactly two complementation groups, and he named the unit the **cistron** after the *cis*–*trans*
test that defines it.

**(b)** Convert every frequency with 1 map unit = 106 bp:

| Pair | RF (%) | Separation (bp) |
|---|---:|---:|
| *m1* × *m2* | 1.10 | 116.6 |
| *m1* × *m3* | 1.17 | 124.0 |
| *m1* × *m4* | 7.05 | 747.3 |
| *m2* × *m3* | 0.07 | 7.4 |
| *m2* × *m4* | 5.95 | 630.7 |
| *m3* × *m4* | 5.88 | 623.3 |

The largest separation, *m1*–*m4* at 747.3 bp, identifies the outer pair. Test the order
*m1* – *m2* – *m3* – *m4*:

```
m1–m2 + m2–m3           = 116.6 +   7.4           = 124.0    vs observed m1–m3 = 124.0  ✓
m2–m3 + m3–m4           =   7.4 + 623.3           = 630.7    vs observed m2–m4 = 630.7  ✓
m1–m2 + m2–m3 + m3–m4   = 116.6 +   7.4 + 623.3   = 747.3    vs observed m1–m4 = 747.3  ✓
```

Perfectly additive. The map:

```
   |-------------- rIIA ----------------|------------- rIIB --------------|
        m1 -------116.6 bp------- m2 --7.4--- m3 ------623.3 bp------ m4
                                        ^
                        the A/B cistron boundary, in the 7.4 bp gap
```

(Recombination fixes an order, not a direction; the mirror image is equally consistent, and it is
the external statement "*m1* is in *rII*A" that orients the map. Compare problem 1(d) — again the
data determine differences, and an absolute has to come from outside.)

**(c) The pair that fails to complement is 16 times *further apart*.**

```
m1 – m2   fail to complement   116.6 bp apart
m2 – m3   complement             7.4 bp apart
```

Say plainly what happened:

- The **complementation test** asked *do these lesions damage the same function?* It answered:
  *m1*/*m2* yes, *m2*/*m3* no. Its unit is the **cistron**.
- The **recombination test** asked *are these lesions at the same position?* It answered: all six
  pairs are at different positions, and gave the distances. Its unit is the **recon**, down to a
  base pair.

There is no contradiction because there was never one question. A cistron boundary is a
discontinuity in *function* — the point where one reading frame stops and the next begins — and
it has no obligation whatsoever to be a large physical distance. *m2* sits near the end of *rII*A
and *m3* near the start of *rII*B; they are seven base pairs apart and in different genes, while
*m1* and *m2* are a hundred and sixteen base pairs apart and in the same one.

That inversion is the whole of Benzer's result, stated as sharply as the data allow: **a gene is
not the unit of recombination.** It is an interval of many mutable sites, and crossing over
happens between them.

**(d) Both errors are the same error, applied in opposite directions.**

***"m1 and m2 are the same mutation."*** This reads a complementation failure as a statement about
position. It is not — and the data refute it in the same table: *m1* × *m2* yields r⁺
recombinants at 1.10%, which is 116.6 bp of separation, comfortably above Benzer's ~0.02% (≈2 bp)
detection floor. Two mutations at the identical site can never give a wild-type recombinant,
because no parent carries wild-type sequence there. They did, so they are not.

***"m2 and m3 are in the same gene."*** This reads a small recombination frequency as a statement
about function. It is not — and again the table refutes it: *m2* and *m3* complement, so a cell
carrying both makes both products and lyses. Proximity is not membership. If it were, the cistron
would be defined by a distance threshold, and no threshold exists that puts 7.4 bp inside one gene
while keeping 116.6 bp inside another.

**Generalise.** Whenever two tests on one pair of mutants disagree, the first move is not to
distrust either result — it is to write down what each test's *output type* is. Here one returns a
set partition and the other returns a metric. A partition and a metric can disagree about
everything and both be right. (Ch 20A's check-yourself 3 flags the reverse pattern —
complementation *plus* zero recombination — which is a different animal: usually a dominant
mutation or intragenic complementation of a multimer, and
[Ch 11 §7](../part-02-transmission-genetics/11-beyond-mendel.md) lists the three ways a
complementation test lies.)

**Scale check.** *rII*A is 2,178 bp and *rII*B is 939 bp, so the region is 3,117 bp — about
**1.8% of the 168,903 bp T4 genome**, or 29.4 map units at 106 bp each. The four mutants span
747 bp, roughly a quarter of it.

</details>

---

## 4. Designing the merodiploid

You have four independently isolated histidine auxotrophs of *E. coli*: *his-1*, *his-2*, *his-3*,
*his-4*. All four are recessive point mutations somewhere in the histidine biosynthetic operon.
You want to know which pairs damage the same cistron. *E. coli* is haploid.

**(a)** Design the test. Say what you have to construct, what you plate on, and — before looking
at any data — what result you would call "complementation".
**(b)** You build the merodiploids and plate **2.0 × 10⁸ cells** of each on minimal medium
without histidine:

| Construct | Colonies |
|---|---:|
| *his-1* chromosome / F′*his-2* (trans) | confluent lawn |
| *his-3* chromosome / F′*his-4* (trans) | 236 |
| *his-3* chromosome / F′*his*⁺ (control) | confluent lawn |
| *his*⁺ chromosome / F′ carrying *both his-3* and *his-4* (cis control) | confluent lawn |
| *his-3* haploid, no F′ | 38 |
| *his-4* haploid, no F′ | 45 |

Interpret every row.
**(c)** A colleague looks at the 236 colonies and concludes that *his-3* and *his-4* complement
weakly. Compute what is actually going on.
**(d)** Why must the two mutations sit on separate DNA molecules? What is the *cis* control for,
and what would you conclude if it had failed to grow?

<details><summary>Solution</summary>

**The goal.** Build a diploid inside a haploid, and then be disciplined about what counts as a
positive result.

**(a) The design.** A complementation test requires both mutations **in one cell, on separate DNA
molecules**, each molecule otherwise complete. In a diploid eukaryote that is a cross; in a
haploid it is impossible — until an **F′** supplies a second copy of one region and nothing else.

So:

1. Obtain an F′ carrying the *his* region (F′*his*), derived from imprecise excision of an
   integrated F in an Hfr whose integration site is near *his*. F is single-copy, so the
   merodiploid is a clean 2n for this region and n everywhere else.
2. Introduce F′*his-2* by conjugation into an F⁻ *his-1* recipient, and so on for each pair.
   Select for the F′ using an unselected marker on it — never using His⁺, which is the thing you
   are about to measure.
3. Plate the merodiploid on **minimal medium without histidine**.
4. Controls, all at the same cell density: each parent alone (reversion), the F′*his*⁺
   merodiploid (the F′ can supply the function at all), and a *cis* control.

**The positive result, defined in advance: every cell grows.** Complementation is a property of
the *genotype*, so if the two lesions are in different cistrons, each molecule supplies what the
other lacks in every single cell and the plate is a confluent lawn. This definition is the whole
problem, and it is why you state it before you look.

**(b) Row by row.**

| Construct | Reading |
|---|---|
| *his-1* / F′*his-2* | **Confluent — complementation.** Different cistrons. |
| *his-3* / F′*his-4* | 236 colonies from 2.0 × 10⁸ = 1.18 × 10⁻⁶. **Not complementation** (see (c)). Same cistron. |
| *his-3* / F′*his*⁺ | Confluent — confirms the F′ carries a functional *his* region and that *his-3* is recessive to *his*⁺. Without this row, a negative result is uninterpretable: it could just mean your F′ was broken. |
| *cis* control | Confluent — both lesions on one molecule, wild type on the other. Confirms neither allele is dominant or dominant-negative. |
| *his-3* haploid | 38 revertants per 2.0 × 10⁸ = 1.9 × 10⁻⁷. |
| *his-4* haploid | 45 revertants per 2.0 × 10⁸ = 2.25 × 10⁻⁷. |

**(c) The arithmetic that kills "weak complementation".**

First, compare with what complementation looks like. If *his-3* and *his-4* were in different
cistrons, **every one of the 2.0 × 10⁸ cells would grow** — a frequency of 1. Observed:

```
236 / 2.0 × 10⁸ = 1.18 × 10⁻⁶
```

That is smaller than the complementation prediction by a factor of about **8.5 × 10⁵**, nearly
six orders of magnitude. Nothing about "weak" covers a millionfold gap. A quantitative
complementation phenotype would show up as *slower or smaller colonies everywhere*, not as a
handful of colonies on an otherwise empty plate.

Second, account for the 236 colonies properly. Two processes make His⁺ cells in a
*his-3*/F′*his-4* merodiploid that has failed to complement:

```
reversion of his-3            38 per 2.0 × 10⁸
reversion of his-4            45 per 2.0 × 10⁸
                             ─────────────────
expected from reversion       83 per 2.0 × 10⁸  =  4.15 × 10⁻⁷

observed                     236
excess                       236 − 83 = 153 per 2.0 × 10⁸  =  7.65 × 10⁻⁷
```

The excess is **recombination between the two copies**. Both mutations are in the same cistron,
one on the chromosome and one on the F′; a crossover between the two mutant sites reconstructs an
intact *his* sequence on one molecule. This is precisely Benzer's point again — two mutations in
one cistron still recombine — and it is why you would need to plate ~1.3 × 10⁶ cells just to see
one such event.

So the verdict is: ***his-3* and *his-4* fail to complement — same cistron — and the 236 colonies
are 83 revertants plus ~153 recombinants.**

**The named trap: rare colonies are recombinants, complementation is a lawn.** The two are
separated by six orders of magnitude and by *kind*, not degree. Anyone who scores a
complementation test by counting colonies rather than by looking at whether the population grows
will eventually call a recombination frequency a weak complementation.

**(d) Why separate molecules, and what *cis* buys you.**

The *trans* configuration is the informative one because it forces each molecule to supply a
whole product on its own. If the two lesions sat on the *same* molecule with a wild-type partner —
the *cis* configuration — the wild-type molecule alone would supply everything, and the cell would
grow whether the lesions were in one cistron or fifty. **The *cis* arrangement cannot distinguish
the hypotheses**; it is a control, not a test. That asymmetry is what "*cis*–*trans* test" names.

What the *cis* control rules out is dominance. If *his-3* or *his-4* made a poisonous product — a
subunit that spoils the complex it joins — then the *trans* merodiploid would fail to grow for a
reason having nothing to do with which cistron the lesion is in, and you would wrongly score
"same cistron". A *cis* control that **failed to grow** would say exactly that: at least one
mutation is dominant, the complementation test is invalid for this pair, and the negative *trans*
result must be discarded.

**Generalise.** Two instances of one object in a single address space, independently mutable, is
the enabling structure — and it is the reason [Ch 21](../part-04-gene-regulation/21-bacterial-regulation.md)
can turn *cis* versus *trans* into an algorithm for telling a broken diffusible product from a
broken sequence element. A diffusible product can be supplied by either copy; a sequence element
can only ever affect the molecule it sits on.

</details>

---

## 5. Which markers move, and how often

Two lysates are prepared from the same wild-type *E. coli* donor.

- **Lysate X** — phage P1 grown lytically on the donor.
- **Lysate Y** — phage λ, obtained by UV-inducing a λ lysogen of the donor.

Each is used to transduce a recipient mutant in every marker, and transductants are counted per
plaque-forming unit:

| Marker | Map position (min) | Lysate X | Lysate Y |
|---|---:|---:|---:|
| *thr* | 0.0 | 1.8 × 10⁻⁶ | none detected |
| *lac* | 7.9 | 2.4 × 10⁻⁶ | none detected |
| *gal* | 17.1 | 2.1 × 10⁻⁶ | 1.0 × 10⁻⁶ |
| *bio* | just beyond *attB* | 2.0 × 10⁻⁶ | 1.0 × 10⁻⁶ |
| *trp* | 28.5 | 1.6 × 10⁻⁶ | none detected |
| *his* | 45.0 | 2.2 × 10⁻⁶ | none detected |

A Gal⁺ transductant from lysate Y, which also carries a normal λ prophage, is then induced. The
resulting **lysate Z** transduces *gal* at **1.0 × 10⁻¹** per pfu and nothing else at all.

λ's attachment site *attB* is at **17.4 min**. The P1 headful is ~100 kb.

**(a)** Name the mechanism behind each lysate and give the diagnostic feature in the table.
**(b)** Why does lysate Y move *gal* and *bio* and nothing else? How far is *gal* from *attB*?
**(c)** Explain lysate Z's 10⁵-fold jump, and why *bio* dropped out of it.
**(d)** Taking 2.0 × 10⁻⁶ as the typical lysate X frequency, estimate what fraction of P1
particles carry host DNA rather than phage DNA. Is your estimate an upper or lower bound?
**(e)** What kind of cell is a transductant from each lysate?

<details><summary>Solution</summary>

**The goal.** Diagnose two mechanisms from a table of which markers move, and turn a transduction
frequency into a statement about the particle population.

**(a)** **Lysate X is generalized transduction** (P1). **Lysate Y is specialized transduction**
(λ). The diagnostic is the *shape of the marker list*, not the frequencies — both are ~10⁻⁶:

- X moves **every marker tested**, at similar frequency, regardless of position. That is what you
  expect if the mechanism is a **packaging error**: pseudo-*pac* sites are scattered around the
  chromosome, so any 100 kb window can end up in a head.
- Y moves **exactly two markers, and they are the two flanking *attB***. That is what you expect
  if the mechanism is an **excision error**: the prophage is at one site, and imprecise excision
  can only pick up DNA immediately adjacent to it.

Note the trap the table is built to catch: comparing the *frequencies* (2 × 10⁻⁶ vs 1 × 10⁻⁶)
tells you nothing at all. Both mechanisms are rare errors. Only the *distribution over markers*
separates them.

**(b)** λ integrates at a single site by site-specific recombination, and excision reverses that
integration. When excision happens between mismatched sites, the circle that comes out carries a
stretch of whatever lies immediately outside the prophage — and leaves an equivalent length of
phage behind, because a head holds a fixed amount of DNA. In *E. coli*, *attB* sits between the
*gal* and *bio* operons, so the only host genes λ can ever carry are *gal* (one side) and *bio*
(the other). The products are named for it: λ*dgal*, λ*dbio*.

Distance from *gal* to *attB*:

```
17.4 − 17.1 = 0.3 min = 0.3 × 46.4 kb ≈ 13.9 kb
```

Two consequences follow from that number, and they run in opposite directions. It is small enough
that λ can reach *gal* by an excision error at all. And it is well under the 2-minute P1 headful,
so **P1 can move *gal* too** — the two mechanisms overlap at this locus and are told apart only by
what *else* each lysate moves. *trp* at 28.5 min is 11.4 minutes from *gal*, more than five
headfuls, so no P1 particle carries both.

**(c)** The Gal⁺ transductant from lysate Y carries a defective λ*dgal* **plus a normal helper λ**
— it is a **double lysogen**. Induce it and the helper supplies every function the defective
genome lacks, so roughly half the burst is λ*dgal*. The lysate goes from **LFT**
(low-frequency transducing, ~10⁻⁶) to **HFT** (high-frequency transducing, ~10⁻¹):

```
1.0 × 10⁻¹ / 1.0 × 10⁻⁶ = 10⁵-fold
```

*bio* dropped out because a λ*dgal* particle carries *gal*. It never carried *bio*: an individual
imprecise excision goes one way or the other, not both. Lysate Z is a clonal amplification of one
particular excision accident, which is exactly why it is so much better at the one marker and
useless at everything else. **Specialized transduction trades generality for efficiency**, and
lysate Z is that trade taken to its limit.

**(d)** A P1 particle carrying host DNA holds a random ~100 kb window. The fraction of the
chromosome in one window:

```
100,000 / 4,641,652 = 0.02154   →  2.15% of the chromosome
```

If a fraction *f* of particles carry host DNA, the chance that a given particle both carries host
DNA *and* that its window contains your marker is *f* × 0.0215. Setting that equal to the observed
transduction frequency:

```
f × 0.02154 = 2.0 × 10⁻⁶
f = 9.3 × 10⁻⁵    →  about 1 particle in 11,000
```

**This is a lower bound**, and the reason matters. The calculation assumed that every delivered
fragment containing the marker produces a transductant. It does not: the fragment must also
recombine into the resident chromosome, with a crossover on each side of the marker — the same
requirement that makes cotransduction a cube in problem 2. Recombination succeeds well under 100%
of the time, so the true fraction of host-DNA-carrying particles is **higher** than 9.3 × 10⁻⁵,
possibly by an order of magnitude.

Get the direction of that bound the wrong way round and you conclude that transduction is more
efficient than it is. The rule: when your model omits a step that can only lose events, your
estimate of the input is too *low*.

**(e)** They are different objects, and the difference is testable.

- **From lysate X:** an ordinary haploid cell. The particle carried host DNA and **no phage
  genes**, so it can neither lyse nor lysogenise. The donor fragment recombined in, replacing the
  recipient allele. The transductant is stable, is not a lysogen, and releases no phage.
- **From lysate Y:** typically a **merodiploid**. The λ*dgal* genome integrates carrying the donor
  *gal*⁺ while the recipient's own *gal*⁻ stays in place — two copies of the region in one cell.
  It *is* a lysogen, it is immune to superinfection by λ, and inducing it releases phage.

So a one-line diagnostic: streak the transductant and induce it. Lysate X's transductants do
nothing; lysate Y's release a burst. And because lysate Y's product is a partial diploid, it is
usable for exactly the complementation tests of problem 4 — reached by a completely different
route from an F′, by the same underlying accident. **Imprecise excision of an integrated element,
carrying flanking host DNA with it, is one mechanism with two names**, depending on whether the
integrated element was a plasmid or a virus.

</details>

---

## 6. Which plasmids can share a cell

Five plasmids, characterised in *E. coli*:

| Plasmid | Size | Copy number | Replication control | Other |
|---|---:|---:|---|---|
| **pAmp** | 5.2 kb | ~20 | ColE1-type antisense RNA I, family **α** | Amp^R, non-conjugative |
| **pTet** | 28 kb | ~19 | ColE1-type antisense RNA I, family **α** | Tet^R, conjugative |
| **pCam** | 5.4 kb | ~18 | ColE1-type antisense RNA I, family **β** | Cm^R; **99% identical in sequence to pAmp** outside the control region |
| **pKan** | 99 kb | ~1 | F-type **iterons** | Kan^R, conjugative |
| **pStr** | 4.8 kb | ~18 | ColE1-type antisense RNA I, family **β** | Str^R, non-conjugative |

**(a)** There are 10 pairs. Which can be stably co-maintained and which cannot? Give the rule you
used in one sentence.
**(b)** What is the largest number of these plasmids one cell can stably carry, and how many
distinct such sets are there?
**(c)** pAmp and pCam are 99% identical in sequence. Explain, mechanistically, why that is
irrelevant. Then explain why pAmp and pTet — differing more than fivefold in size — have
essentially the same copy number.
**(d)** pKan is a conjugative plasmid carrying Kan^R plus, on an integron cassette, three further
resistance determinants. A patient is treated with kanamycin only. Explain what happens to the
other three determinants, and why a *Klebsiella* isolate can be resistant to a drug it has never
met.

<details><summary>Solution</summary>

**The goal.** Predict coexistence from a controller, not from a sequence — and see why the whole
Inc classification is a *behavioural* one.

**(a) The rule: two plasmids are incompatible if and only if they share a replication control
system.** Nothing else in the table matters.

Grouping by the control column: **Inc-α = {pAmp, pTet}**, **Inc-β = {pCam, pStr}**,
**Inc-F(iteron) = {pKan}**. Two plasmids from the same group are incompatible; any two from
different groups coexist.

| Pair | Verdict |
|---|---|
| pAmp + pTet | **incompatible** — both Inc-α |
| pCam + pStr | **incompatible** — both Inc-β |
| pAmp + pCam · pAmp + pKan · pAmp + pStr · pTet + pCam · pTet + pKan · pTet + pStr · pCam + pKan · pKan + pStr | **compatible** — 8 pairs |

Two of the ten pairs fail.

The mechanism is worth restating because it explains why the rule has that exact form. A
replication controller measures its own inhibitor concentration — for ColE1 types, the antisense
RNA I that pairs with the replication primer — and throttles initiation above a set point. The
inhibitor is **diffusible and made by every copy**. Two plasmids sharing a controller are
therefore counted as a **sum**: the cell holds the total at the set point but has no way to
allocate it, so which molecule fires at any moment is a coin flip, and random partitioning at
division drives one lineage to fixation. Incompatibility is not exclusion at the door and not a
fight; it is drift under a shared sensor.

**(b)** Pick at most one plasmid from each Inc group. Three groups, so:

**Maximum = 3 plasmids.** The number of distinct maximum sets is 2 × 2 × 1 = **4**:

```
{pAmp, pCam, pKan}   {pAmp, pStr, pKan}   {pTet, pCam, pKan}   {pTet, pStr, pKan}
```

pKan is in all four because it is alone in its group. Note that the answer is a purely
combinatorial one — the constraint graph is a union of cliques, one per Inc group, and a maximum
compatible set is a transversal.

**(c) Both halves of this part exist to break a size-and-similarity intuition.**

***99% identity is irrelevant* because the test is functional, not homological.** pAmp and pCam
differ precisely where it counts: the control region. Family α's RNA I does not pair with family
β's primer and vice versa, so each plasmid's controller sees only its own copies and holds only
its own set point. Two independent controllers, two independently maintained replicons, stable
coexistence — even though 99% of their sequence is shared. Run the argument the other way: pKan
shares essentially no sequence with pAmp, and they also coexist, for the same reason. Sequence
identity is neither necessary nor sufficient.

**This is why Inc typing is done by experiment**: introduce one plasmid into a strain carrying the
other, then grow *without selection* for ~20 generations and ask whether the resident is lost. The
scheme classified plasmids by behaviour long before anyone could sequence them, and it survives
sequencing because behaviour is what matters clinically.

***Copy number tracks the controller, not the size.*** pTet is 5.4 times the size of pAmp and sits
at ~19 copies against pAmp's ~20 — indistinguishable, because they share family α's set point.
Meanwhile pKan is 19 times the size of pAmp and sits at 1 copy, but that is because its iteron
controller has a different set point, not because it is large. If you were handed a sixth plasmid
of 30 kb and asked to predict its copy number, the honest answer is that **the size tells you
nothing**; you need to know which control system it carries.

**(d) Selecting for one determinant selects for all of them, and the accounting is not vertical.**

The four determinants sit on **one replicon**. They are not merely linked — they are
**co-replicated**. Kanamycin kills cells that lack pKan, so every survivor carries the whole
plasmid, and the three unused determinants ride to fixation alongside the one under selection.
There is no recombinational route by which a cell keeps Kan^R and discards the others, because
losing them means losing the replicon.

The cross-species part follows from pKan being **conjugative and broad-host-range**. A resistance
determinant travels as cargo on a self-transmissible plasmid over genus boundaries, so a
*Klebsiella* isolate can acquire resistance to a carbapenem no one ever gave it. **"Never exposed
to the drug" is not evidence against resistance — it is the expected situation** when the
determinant travels on a replicon rather than in a lineage. Resistance frequency is the frequency
of a replicon in a community, not the frequency of an allele in a pedigree, and treating it as the
latter is the modelling error behind a public-health problem the GRAM analysis puts at 1.14
million deaths attributable to bacterial antimicrobial resistance in 2021.

**Generalise.** Every property in this problem — copy number, incompatibility, co-selection,
host range — is a consequence of one definition: a plasmid is a **replicon**, a molecule with its
own origin and its own control over how often that origin fires. Start from the controller and the
rest is derivation.

</details>

---

## 7. Perturbing the switch ★

The λ lysis/lysogeny decision is implemented by cI and Cro competing for three operators,
O<sub>R</sub>1, O<sub>R</sub>2 and O<sub>R</sub>3, between the divergent promoters P<sub>RM</sub>
(makes cI) and P<sub>R</sub> (makes Cro). Three features matter: **mutual repression** (cI at
O<sub>R</sub>1/O<sub>R</sub>2 blocks P<sub>R</sub>; Cro at O<sub>R</sub>3 blocks P<sub>RM</sub>),
**positive autoregulation** (the cI dimer on O<sub>R</sub>2 recruits RNA polymerase to
P<sub>RM</sub>), and **negative autoregulation at the top** (very high cI also fills
O<sub>R</sub>3).

For each mutant, say which way the switch goes and which circuit feature was removed.

**(a)** A cI protein that binds O<sub>R</sub>1 and O<sub>R</sub>2 normally but cannot bind
O<sub>R</sub>3 at any concentration.
**(b)** A cI protein that binds all three operators normally but whose O<sub>R</sub>2-bound dimer
can no longer contact RNA polymerase.
**(c)** A phage with no functional Cro. What plaque does it make, and what happens if you try to
induce a lysogen of it with UV?
**(d)** A lysogen of wild-type λ, treated with mitomycin C (a DNA-damaging agent) — and the same
experiment in a *recA*⁻ host.
**(e)** Spontaneous induction runs at about **10⁻⁵ per cell per generation**. In a culture of
10⁹ lysogens with a burst size of ~100, how much free phage appears per generation? What fraction
of lineages have induced after 1,000 generations, and how many generations until half have? At a
20-minute generation, how long is that in real time?

<details><summary>Solution</summary>

**The goal.** Read a circuit diagram as a dynamical system rather than a wiring list, and see that
"bistable" is a claim with quantitative consequences.

**(a) Lysogeny, and an unusually deep one. Negative autoregulation is removed.**

Binding to O<sub>R</sub>1 and O<sub>R</sub>2 is intact, so cI still shuts off P<sub>R</sub> (no
Cro) and still recruits polymerase to P<sub>RM</sub> (more cI). Both arms of the lysogenic
programme work, so the decision goes to lysogeny.

What is lost is the ceiling. In wild type, once cI gets very high it also occupies O<sub>R</sub>3
and represses its own promoter, capping the level. Without that, cI accumulates far above the
normal set point. The lysogen becomes *harder to induce*, because RecA-stimulated self-cleavage
now has more repressor to get through before P<sub>R</sub> opens. A circuit with a broken cap is
still stable — it is stable in a way that no longer responds properly to its input.

**(b) Lysogeny cannot be maintained. Positive autoregulation is removed.**

This is the sharpest one. The protein still represses P<sub>R</sub>, so what remains is **mutual
repression alone**. Ch 20A puts the consequence in one line: *mutual repression alone gives a
switch you can flip; mutual repression plus positive feedback on one arm gives two locally stable
steady states with an unstable one between them — bistability.*

Strip the feedback and cI's own promoter is no longer self-sustaining. Whatever cI is present is
diluted by growth and division with no mechanism amplifying it back, so the high-cI state is not
an attractor: fluctuations downward are not pulled back, they run away. The prediction is a
lysogen that is **unstable** — it establishes, then loses repression at a high rate, and the
culture throws lytic events far above the 10⁻⁵ spontaneous background.

The general lesson is the one worth keeping: **"switchable" and "stable" are different
properties, produced by different features of the circuit.** Mutual repression buys you the first;
only feedback buys you the second.

**(c) Lysogeny becomes the default. The plaque is turbid or absent, and UV induction is
inefficient.**

Cro's job is to take O<sub>R</sub>3 and shut off P<sub>RM</sub>, which is how the lytic arm wins.
Without Cro there is no way to shut down cI synthesis, so infection resolves to lysogeny at close
to 100% and the phage barely lyses: an extremely turbid plaque, or no visible plaque at all. (Note
this is the opposite of a **clear** plaque, which is what a *cI*⁻ mutant makes — lysogeny broken.
Kaiser's 1957 clear-plaque collection is the complementary screen.)

UV then exposes the second half of Cro's job. RecA is activated, cI cleaves itself, P<sub>R</sub>
opens — but with no Cro to occupy O<sub>R</sub>3, P<sub>RM</sub> is never shut off. As soon as the
damage signal decays, cI is resynthesised and the cell can slide back into lysogeny. **Cro is not
just the lytic repressor; it is the latch that makes the transition irreversible.** Induction
without it is leaky and reversible.

**(d) Wild-type host: synchronous lysis. *recA*⁻ host: nothing.**

Mitomycin C damages DNA, which activates RecA (the SOS response,
[Ch 17](../part-03-genome-instability/17-dna-repair.md)). Activated RecA stimulates **cI to cleave
itself**. cI collapses, Cro
takes O<sub>R</sub>3, P<sub>RM</sub> stays off, the lytic programme runs, and the phage abandons a
host whose genome is falling apart.

In a *recA*⁻ host the signal transducer is missing. The DNA is damaged just as badly, but nothing
stimulates cI cleavage, so the prophage sits there and the culture does not lyse. This is the
cleanest possible demonstration that **the prophage does not detect damage — it subscribes to the
host's damage detector.** No phage-encoded sensor exists; the phage wired its escape hatch to a
signal the host was already generating.

**(e)** A culture of 10⁹ lysogens, 10⁻⁵ induction per cell per generation, burst 100:

```
cells inducing per generation  = 10⁹ × 10⁻⁵ = 10⁴
phage released per generation  = 10⁴ × 100  = 10⁶ pfu
```

So a "quiescent" lysogenic culture continuously carries about **10⁶ free phage**, one particle per
thousand cells. Any experiment that assumes a lysogen releases nothing is wrong by six orders of
magnitude in absolute terms — which is why lysogen supernatants always plate.

Fraction of lineages that have *not* induced after *n* generations is (1 − 10⁻⁵)ⁿ:

```
n = 1,000:   (1 − 10⁻⁵)^1000 = 0.99005
             so 1 − 0.99005 = 0.00995  →  about 1.0% have induced
```

Generations until half have induced:

```
(1 − 10⁻⁵)ⁿ = 0.5
n = ln(0.5) / ln(1 − 10⁻⁵) = 69,314 generations
```

At a 20-minute generation:

```
69,314 × 20 min = 1,386,287 min = 963 days ≈ 2.6 years of continuous growth
```

**Why bistability is the point.** "Stable for thousands of generations" is not rhetoric — it is
the 69,314 above, and it is only achievable because cI sits in an **attractor**. Thermal and
partitioning noise perturbs cI constantly; positive autoregulation pulls those perturbations
back. A merely switchable circuit, like the mutant in (b), has no restoring force, so the same
noise is a random walk that escapes quickly. **Bistability is what converts a decision into a
memory.**

And note the asymmetry, which is what separates this circuit from a thermostat: a thermostat
tracks its input, while this one commits. Once Cro occupies O<sub>R</sub>3, restoring cI
*function* does not restore cI *synthesis* — the trajectory has crossed the separatrix and there
is no route back. That hysteresis is the same phenomenon as the escape hatch in (d), read in the
other direction.

</details>

---

## 8. Deletion mapping an unknown ★★

You are mapping point mutants inside *rII*A of phage T4. You hold a nested set of ten deletions
that divide *rII*A into eight consecutive intervals **A1 … A8**, left to right:

```
   rIIA:   |--A1--|--A2--|--A3--|--A4--|--A5--|--A6--|--A7--|--A8--|
   D1      ############################
   D2      ##############
   D3                    ##############
   D4                                  ############################
   D5                                  ##############
   D6                                                ##############
   D7             #######
   D8                           #######
   D9                                         #######
   D10                                                      #######
```

The cross is Benzer's: coinfect the permissive host *E. coli* B with the point mutant and a
deletion, plate the burst on *E. coli* K-12(λ), and ask whether **any** r⁺ plaques appear. This is
a **binary predicate, not a frequency**: a mutation lying inside a deletion can never yield a
wild-type recombinant, because no wild-type sequence exists at that position on either parent.

Four mutants, none of which reverts detectably, are crossed against all ten deletions.
**− = no r⁺ recombinants; + = r⁺ recovered.**

| | D1 | D2 | D3 | D4 | D5 | D6 | D7 | D8 | D9 | D10 |
|---|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| *x1* | − | + | − | + | + | + | + | − | + | + |
| *x2* | + | + | + | − | − | + | + | + | + | + |
| *x3* | − | − | + | + | + | + | + | + | + | + |
| *x4* | − | − | − | + | + | + | − | − | + | + |

**(a)** Localise *x1*, *x2* and *x3*.
**(b)** *x4* is not a point mutant. Prove it from the table alone, say what it is, and give its
extent. What one further experiment would confirm your answer?
**(c)** Only three crosses per mutant are needed if you choose the deletions adaptively. Show the
decision tree. Then run *x4* through it and say what it returns — and what that tells you about
redundancy in a search.
**(d)** You have 2,000 rII point mutants. Compare the total number of crosses needed to map them
all pairwise against the number needed if you first assign each to one of the eight intervals.
Assume mutants are evenly distributed.
**(e)** Assume the ten deletions cut *rII*A into eight intervals of equal length. What resolution
does interval assignment give, and what do you have to do to go finer?

<details><summary>Solution</summary>

**The goal.** Turn a mapping problem from a measurement into a sequence of yes/no containment
queries — and then discover the assumption that the trick smuggles in.

**(a)** For a point mutant, "fails to recombine with D" means "lies inside D". So the mutation
lies in the **intersection of every deletion it failed against**, minus every deletion it
succeeded against.

***x1*** fails against D1, D3, D8.

```
D1 = {A1,A2,A3,A4}   D3 = {A3,A4}   D8 = {A4}
intersection = {A4}
```

Cross-check with the "+" rows: it recombined with D2 = {A1,A2} ✓ (A4 not in D2), with
D4 = {A5..A8} ✓, and with all the rest ✓. **_x1_ is in A4.**

***x2*** fails against D4, D5.

```
D4 = {A5,A6,A7,A8}   D5 = {A5,A6}
intersection = {A5,A6}
```

It recombined with D9 = {A6}, which removes A6. **_x2_ is in A5.**

***x3*** fails against D1, D2.

```
D1 = {A1,A2,A3,A4}   D2 = {A1,A2}
intersection = {A1,A2}
```

It recombined with D7 = {A2}, removing A2. **_x3_ is in A1.**

**(b) *x4* is itself a deletion, spanning A2 through A4.**

The proof needs no extra data. *x4* fails to recombine with D2 and with D3. But

```
D2 = {A1, A2}      D3 = {A3, A4}      D2 ∩ D3 = ∅
```

**D2 and D3 do not overlap.** A single point cannot lie inside two disjoint intervals. The
containment model is therefore violated, and since the assay is sound, the object being localised
is not a point.

Now fit the alternative. A deletion fails to recombine with another deletion exactly when the two
**overlap** (their union covers no wild-type sequence in the shared region), and recombines when
they are disjoint (each parent supplies what the other lacks). Take *x4* = deletion of {A2, A3,
A4} and predict the whole row:

| | D1 | D2 | D3 | D4 | D5 | D6 | D7 | D8 | D9 | D10 |
|---|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| deletion of A2–A4 overlaps? | yes | yes (A2) | yes | no | no | no | yes (A2) | yes (A4) | no | no |
| predicted | − | − | − | + | + | + | − | − | + | + |
| **observed** | **−** | **−** | **−** | **+** | **+** | **+** | **−** | **−** | **+** | **+** |

Every cell matches. Be careful about how much the table actually pins down. It proves *x4* removes
**at least A2, A3 and A4**. It cannot decide whether *x4* also removes A1, because both deletions
containing A1 — D1 and D2 — already overlap *x4* at A2, so they would read "−" either way. The
right-hand end *is* pinned: *x4* recombines with D4 = {A5…A8}, so it does not reach A5.

**The confirming experiment: test for reversion.** Plate a large number of *x4* alone on K-12(λ)
at high density. A point mutation reverts at some low but non-zero rate; **a deletion never
reverts**, because there is no sequence left to restore. That is exactly the criterion Benzer used
to identify his deletions in the first place, and it is a completely independent line of evidence
from the recombination table.

**(c) The adaptive tree.**

```
                        cross vs D1  (A1–A4)
                       /                    \
                   −  /                      \  +
        cross vs D2 (A1–A2)            cross vs D5 (A5–A6)
        /          \                    /            \
     −  /            \  +            −  /              \  +
 D7 (A2)          D8 (A4)        D9 (A6)          D10 (A8)
  /    \           /    \         /    \           /    \
 −      +         −      +       −      +         −      +
A2     A1        A4     A3      A6     A5        A8     A7
```

Three crosses reach any of the eight intervals — log₂ 8 = 3 — using only seven of the ten
deletions. D3, D4 and D6 are never needed. That is the chapter's point about avoiding quadratic
work: **interval containment queried by binary search.**

**Now run *x4* through it.** D1 → −, so go left. D2 → −, so go left. D7 → −. The tree returns
**A2**, confidently and wrongly.

This is the part worth carrying away. Binary search is correct only under its precondition — here,
that the object is a *point* inside exactly one interval. The adaptive tree never asks a question
whose answer could contradict that precondition, so it cannot detect its own failure; it just
returns a plausible-looking interval. The three "redundant" deletions D3, D4 and D6 are what turn
an unverifiable answer into a checkable one, and D3 is the specific cross that exposes *x4*.

**Redundancy is not waste in a search whose model might be wrong.** The extra queries buy you
error detection, and a mapping panel with no redundancy will silently mis-assign every deletion in
your collection.

**(d) The counting.**

Pairwise, as the chapter frames it:

```
n(n − 1)/2 = 2000 × 1999 / 2 = 1,999,000 crosses
```

Deletion mapping first:

```
assignment:  2,000 mutants × 3 crosses            =   6,000
within-interval pairwise, 250 per interval:
             8 × (250 × 249 / 2) = 8 × 31,125     = 249,000
                                                    ─────────
total                                                255,000
```

**255,000 versus 1,999,000 — a 7.8-fold saving, 1.74 million crosses avoided.**

Notice where the remaining cost sits: 249,000 of the 255,000 crosses are the *within-interval*
pairwise work, not the assignment. The assignment step is almost free. So the way to improve the
scheme is not to optimise the search — it is to **subdivide further**, because that shrinks the
quadratic term:

| Intervals | Crosses each | Assignment | Within-interval | Total | Saving |
|---:|---:|---:|---:|---:|---:|
| 8 | 3 | 6,000 | 249,000 | 255,000 | 7.8× |
| 16 | 4 | 8,000 | 124,000 | 132,000 | 15.1× |
| 47 | 6 | 12,000 | 41,553 | 53,553 | 37.3× |

The assignment cost grows as *n* log *k* while the residual quadratic falls as *n*²/*k*. That is
the whole argument for collecting more deletions, and it is why Benzer's map got finished at all.

**(e)** Eight equal intervals across *rII*A's 2,178 bp:

```
2,178 / 8 = 272 bp per interval  =  272 / 106 ≈ 2.57 map units
```

So a single deletion assignment locates a mutation to **~272 bp** — already far better than a
classical gene map, and obtained with three yes/no crosses and no counting whatever.

To go finer you must switch back from the binary predicate to the **frequency**: cross the mutant
against other point mutants in the same interval and measure recombination. The floor on that
measurement is ~0.02 map units, which is

```
0.02 × 106 ≈ 2.1 bp
```

a further **~130-fold** improvement, and about the base pair.

**Why the floor is so low, and it is not because phage recombine unusually well.** It is the
selection. Plating the burst on K-12(λ) gives zero background — only r⁺ grows — so 10⁹ progeny can
be screened on one dish and a single recombinant is a visible plaque. That pushes the detectable
frequency to ~10⁻⁸. A *Drosophila* geneticist scoring 10⁴ flies bottoms out near 10⁻⁴. **Benzer
bought four orders of magnitude by choosing an organism where selection does the counting**, and
that is the same trick as the auxotroph plate in problem 4 and the transductant plate in problem 5.

Treat the bp conversion as approximate — a phage genome pairs several times per infection, so a
phage map unit is not a meiotic centimorgan and the 106 bp/unit factor is soft. The order of
magnitude is not soft, and the conclusion stands: **the gene is an interval, resolvable to about
the base pair, a decade before anyone sequenced one.**

</details>

---

## Where you went wrong

| Error pattern | What to re-read |
|---|---|
| Read an absolute time of entry as a map position, or extrapolated to *t* = 0 and called the result the origin | Problem 1(d) — the data contain Λ − *O*, one number for two unknowns |
| Added cotransduction frequencies, or added (1 − *C*) values, as if they were distances | Problem 2(a) — *C* is cubic in *d*; only *L*(1 − *C*^(1/3)) adds |
| Reported *C* = 0 as a distance instead of a lower bound, or trusted a *C* near 1 to the base pair | Problem 2(d) — both ends of the range are dead for different reasons |
| Concluded from a complementation failure that the mutations are at the same site | Problem 3(d) — complementation tests function, recombination tests position |
| Concluded from a small recombination frequency that the mutations are in the same gene | Problem 3(c) — a 7.4 bp pair straddled the cistron boundary; a 116.6 bp pair did not |
| Scored a complementation test by counting colonies, and called 10⁻⁶ "weak complementation" | Problem 4(c) — complementation is a lawn; rare colonies are revertants plus recombinants |
| Omitted the reversion controls, or the *cis* control, and so could not exclude dominance | Problem 4(b), 4(d) |
| Told generalized from specialized transduction by comparing frequencies rather than which markers moved | Problem 5(a) — both are ~10⁻⁶; only the marker distribution separates them |
| Got the direction of the bound wrong when a model omits a lossy step | Problem 5(d) — 9.3 × 10⁻⁵ is a *lower* bound on transducing particles |
| Predicted plasmid incompatibility from sequence similarity, or copy number from plasmid size | Problem 6(c) — the test is functional; the controller sets both |
| Treated "never exposed to the drug" as evidence against resistance | Problem 6(d) — the determinant travels on a replicon, not in a lineage |
| Treated the λ switch as merely switchable, and so could not say why a lysogen is stable | Problem 7(b), 7(e) — feedback is what makes a decision into a memory |
| Trusted a binary search that returned a clean answer, with no redundant query to check its precondition | Problem 8(c) — the adaptive tree confidently returns A2 for a deletion |
