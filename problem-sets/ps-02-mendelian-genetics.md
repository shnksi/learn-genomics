# Problem set 02 — Mendelian genetics

Covers [Ch 09–13](../part-02-transmission-genetics/09-mitosis-and-meiosis.md).

**Attempt before revealing.** Genetics is learned by calculating.

A standing note on method: Punnett squares are a teaching device that scales terribly. A
trihybrid cross needs a 64-cell grid; a four-gene cross needs 256. Use the **product rule on
independent loci** instead — it is faster, less error-prone, and generalises. If the product
and sum rules are not yet second nature, they are §2 of
[S1](../part-S-statistics/S1-probability.md). Several solutions below show both methods so you
can see the saving.

---

## 1. Monohybrid, and what the ratio is actually telling you

In peas, purple flower (*A*) is dominant to white (*a*). A true-breeding purple plant is
crossed to a true-breeding white plant.

**(a)** Give the F1 genotype and phenotype.
**(b)** F1 × F1. Give F2 genotypic and phenotypic ratios.
**(c)** You obtain 1,000 F2 plants. How many purple plants do you expect to be heterozygous?
**(d)** You pick one purple F2 plant at random. What is the probability it is homozygous?

<details><summary>Solution</summary>

**(a)** *AA* × *aa* → all ***Aa*, all purple**.

**(b)** *Aa* × *Aa*:

Genotypic **1 *AA* : 2 *Aa* : 1 *aa***
Phenotypic **3 purple : 1 white**

**(c)** Of 1,000 F2, the expected genotype counts are 250 *AA*, 500 *Aa*, 250 *aa*.

Heterozygous purple = **500**.

**(d)** This is a conditional probability, and it is the part people get wrong.

You have already observed that the plant is purple, which excludes *aa*. Among purple plants
the genotypes are *AA* and *Aa* in ratio 1:2.

P(*AA* | purple) = 1/(1+2) = **1/3**

The unconditional P(*AA*) is 1/4. Conditioning on the observed phenotype changes it to 1/3.
This 1/3 recurs constantly in pedigree work — an unaffected sibling of someone with a recessive
condition has a 2/3 chance of being a carrier, by exactly this argument.

</details>

---

## 2. Dihybrid without a Punnett square

Seed shape (*R* round dominant to *r* wrinkled) and colour (*Y* yellow dominant to *y* green)
assort independently.

Cross *RrYy* × *RrYy*.

**(a)** P(round and yellow)?
**(b)** P(wrinkled and green)?
**(c)** P(round and green)?
**(d)** P(*RRYy*) specifically?
**(e)** What fraction of round yellow offspring are homozygous at both loci?

<details><summary>Solution</summary>

Treat the loci independently and multiply. From a monohybrid *Aa* × *Aa*:
P(dominant phenotype) = 3/4, P(recessive phenotype) = 1/4.

**(a)** P(round) × P(yellow) = 3/4 × 3/4 = **9/16**
**(b)** 1/4 × 1/4 = **1/16**
**(c)** 3/4 × 1/4 = **3/16**

Together with green round (3/16) these give the familiar **9:3:3:1**, derived in three
multiplications rather than a 16-cell grid.

**(d)** P(*RR*) × P(*Yy*) = 1/4 × 1/2 = **1/8**

**(e)** Conditional again. Among round yellow offspring (9/16 of the total), the doubly
homozygous *RRYY* occurs at 1/4 × 1/4 = 1/16.

P(*RRYY* | round yellow) = (1/16) ÷ (9/16) = **1/9**

</details>

---

## 3. Trihybrid — where the method pays off ★

Cross *AaBbCc* × *AaBbCc*, all three loci independent.

**(a)** P(offspring showing all three dominant phenotypes)?
**(b)** P(genotype exactly *AaBbCc*)?
**(c)** P(recessive at exactly one of the three loci)?
**(d)** How many cells would the Punnett square need?

<details><summary>Solution</summary>

**(a)** (3/4)³ = **27/64 ≈ 0.422**

**(b)** For each locus, P(heterozygous from *Aa* × *Aa*) = 1/2.

(1/2)³ = **1/8**

**(c)** "Recessive at exactly one locus" means recessive phenotype at one, dominant at the
other two — and the recessive locus could be any of the three, so this is a binomial term.

P(one specific locus recessive, others dominant) = (1/4) × (3/4) × (3/4) = 9/64

Three ways to choose which locus: 3 × 9/64 = **27/64 ≈ 0.422**

Equivalently, using the binomial with n = 3, p(recessive) = 1/4:

P(exactly 1) = C(3,1) × (1/4)¹ × (3/4)² = 3 × 1/4 × 9/16 = 27/64 ✓

**(d)** Each parent produces 2³ = 8 gamete types, so the square is 8 × 8 = **64 cells**.

You answered (a) through (c) with a handful of multiplications. This is why the product rule
is the method actually used, and Punnett squares are scaffolding to be discarded.

</details>

---

## 4. Test cross

A purple-flowered plant of unknown genotype is crossed to a white (*aa*) plant. The cross
yields 47 purple and 53 white offspring.

**(a)** What was the unknown genotype?
**(b)** What result would the alternative genotype have produced?
**(c)** Why is a test cross preferred over selfing for this purpose?

<details><summary>Solution</summary>

**(a)** Roughly 1:1 purple:white. A test cross to a homozygous recessive reveals the tester
parent's gametes directly:

- If *AA*: all gametes *A*, all offspring *Aa*, **all purple**
- If *Aa*: gametes 1/2 *A* and 1/2 *a*, offspring 1/2 *Aa* purple and 1/2 *aa* white — **1:1**

Observed 47:53 is consistent with 1:1, so the unknown parent is **_Aa_**.

**(b)** *AA* would have given 100 purple and 0 white. A single white offspring would have
excluded it.

**(c)** Because the test cross gives a direct, high-contrast readout of gamete composition.
Crossing to *aa* means the tester contributes only recessive alleles, so **the offspring
phenotype reports the unknown parent's gamete genotype one-to-one**.

Selfing an *Aa* plant gives 3 purple : 1 white, and selfing *AA* gives all purple — you can
still distinguish them, but you must observe enough offspring to see a white one. The
probability of missing it by chance in *n* offspring is (3/4)ⁿ, which is still 5.6% at n = 10.
The test cross needs far fewer offspring for the same confidence because the expected
difference is 50% versus 0%, not 25% versus 0%.

</details>

---

## 5. Chi-square done properly ★

A dihybrid F1 self-cross gives 556 offspring:

| Phenotype | Observed |
|---|---|
| round yellow | 315 |
| round green | 108 |
| wrinkled yellow | 101 |
| wrinkled green | 32 |

**(a)** State the null hypothesis and compute expected counts.
**(b)** Compute χ².
**(c)** State degrees of freedom and interpret against a 0.05 threshold.
**(d)** What would a *non-significant* result license you to conclude?

<details><summary>Solution</summary>

**(a)** H₀: two independently assorting loci, each with complete dominance, giving 9:3:3:1.

Total 556, so expected = 556 × (9, 3, 3, 1)/16:

| Phenotype | Observed | Expected |
|---|---|---|
| round yellow | 315 | 556 × 9/16 = 312.75 |
| round green | 108 | 556 × 3/16 = 104.25 |
| wrinkled yellow | 101 | 556 × 3/16 = 104.25 |
| wrinkled green | 32 | 556 × 1/16 = 34.75 |

**(b)** χ² = Σ (O − E)²/E

- (315 − 312.75)²/312.75 = 5.0625/312.75 = 0.01619
- (108 − 104.25)²/104.25 = 14.0625/104.25 = 0.13489
- (101 − 104.25)²/104.25 = 10.5625/104.25 = 0.10132
- (32 − 34.75)²/34.75 = 7.5625/34.75 = 0.21763

**χ² = 0.470**

**(c)** df = (number of categories) − 1 = 4 − 1 = **3**. No parameters were estimated from the
data — the 9:3:3:1 ratio comes from the genetic hypothesis, not from the observations — so
there is no further subtraction. This is the most common df error in genetics: df is *not*
n − 1 − (something) unless you actually fitted a parameter.

Critical value at α = 0.05, df = 3, is 7.815. Our χ² = 0.470 is far below it (p ≈ 0.93). **Do
not reject H₀.** The data are consistent with 9:3:3:1.

**(d)** Very little, and this is the point of the problem.

Failure to reject is **not** confirmation. It means the data do not provide evidence *against*
the model — which is a much weaker statement. Specifically:

- The test has limited power. Real but modest departures (linkage with high recombination, mild
  differential viability) would not be detected at this sample size.
- Many alternative models also predict approximately 9:3:3:1 and would equally fail to be rejected.
- A very low χ² is itself worth noticing. This is precisely Fisher's critique of Mendel's data:
  across many experiments Mendel's results fit expectation *better than chance should allow*,
  suggesting unconscious selection or over-eager classification of ambiguous plants. A goodness-of-fit
  test has two tails in a sense — data can be suspiciously good as well as suspiciously bad.

</details>

---

## 6. Binomial family composition

Two carrier parents (*Aa* × *Aa*) for a recessive condition have four children.

**(a)** P(exactly one affected)?
**(b)** P(at least one affected)?
**(c)** P(the first two are unaffected and the last two affected)?
**(d)** They already have three unaffected children. What is the probability the fourth is affected?

<details><summary>Solution</summary>

Each child is independently affected with p = 1/4.

**(a)** C(4,1) × (1/4)¹ × (3/4)³ = 4 × 0.25 × 0.421875 = **0.4219 = 27/64**

**(b)** P(at least one) = 1 − P(none) = 1 − (3/4)⁴ = 1 − 81/256 = **175/256 ≈ 0.684**

**(c)** A specified *order*, so no binomial coefficient:

(3/4) × (3/4) × (1/4) × (1/4) = 9/256 ≈ **0.0352**

Compare with (a): the probability of "exactly two affected in any order" would be
C(4,2) × (1/4)² × (3/4)² = 6 × 9/256 = 54/256. Specifying the order costs a factor of 6.

**(d)** **1/4.**

Meiosis has no memory. The three unaffected children do not change the segregation
probabilities for the fourth. This is the gambler's fallacy in a lab coat, and it comes up
constantly in genetic counselling — families frequently believe they have "used up" their risk.

Note the contrast with problem 1(d): there, conditioning on an *observation about the
individual in question* changed the probability. Here the observations are about *different*
individuals and are independent, so they change nothing.

</details>

---

## 7. Multiple alleles and codominance

The ABO blood group has three alleles: *I^A* and *I^B* are codominant with each other, and both
are dominant to *i*.

**(a)** List the genotypes for each of the four phenotypes.
**(b)** A type AB parent and a type O parent have children. What phenotypes are possible?
**(c)** A woman of type A and a man of type B have a type O child. Give both parental genotypes.
**(d)** Could that same couple have an AB child? With what probability?

<details><summary>Solution</summary>

**(a)**

| Phenotype | Genotype(s) |
|---|---|
| A | *I^A I^A* or *I^A i* |
| B | *I^B I^B* or *I^B i* |
| AB | *I^A I^B* |
| O | *ii* |

**(b)** *I^A I^B* × *ii*. Gametes: *I^A* or *I^B* from one parent, *i* from the other.

Offspring: 1/2 *I^A i* (**type A**) and 1/2 *I^B i* (**type B**).

Notably, **neither AB nor O is possible** — the children cannot have either parent's phenotype.
A clean demonstration that "resembling a parent" is not what inheritance guarantees.

**(c)** A type O child is *ii*, so it received an *i* from each parent. Both parents must
therefore carry *i*:

Mother **_I^A i_**, father **_I^B i_**.

**(d)** Yes. Each parent transmits *I^A* or *i* (mother) and *I^B* or *i* (father), each with
probability 1/2.

P(AB) = P(*I^A* from mother) × P(*I^B* from father) = 1/2 × 1/2 = **1/4**

The full offspring distribution is 1/4 *I^A I^B* (AB), 1/4 *I^A i* (A), 1/4 *I^B i* (B),
1/4 *ii* (O) — all four blood groups from one cross.

</details>

---

## 8. Epistasis — derive the ratio, don't memorise it ★

In Labrador retrievers, coat colour involves two loci. Locus *B* determines pigment type:
*B_* black, *bb* brown. Locus *E* controls whether pigment is deposited in the hair at all:
*E_* permits deposition, *ee* blocks it, giving yellow regardless of the *B* genotype.

Cross *BbEe* × *BbEe*.

**(a)** Predict the phenotypic ratio from the pathway logic, without a Punnett square.
**(b)** Name the type of epistasis.
**(c)** A yellow dog is crossed to a brown dog and all puppies are black. Give all three genotypes.

<details><summary>Solution</summary>

**(a)** Reason through the pathway. The *E* locus acts first — it gates whether any pigment
reaches the hair — so evaluate it first.

- P(*ee*) = 1/4 → **yellow**, regardless of *B*. That is 4/16.
- P(*E_*) = 3/4 → pigment is deposited, and now *B* determines which:
  - P(*B_*) = 3/4 → black. 3/4 × 3/4 = 9/16
  - P(*bb*) = 1/4 → brown. 3/4 × 1/4 = 3/16

**9 black : 3 brown : 4 yellow**

The 4 is not a mysterious number: it is 3 + 1, the *bb ee* and *B_ ee* classes collapsing
together because when pigment cannot be deposited, its colour is unobservable. Every "modified
Mendelian ratio" is a 9:3:3:1 with classes merged by a pathway relationship, and reading it off
the pathway is far more reliable than memorising a table.

**(b)** **Recessive epistasis** — the homozygous recessive *ee* genotype masks the *B* locus.
The *E* gene is epistatic to *B*; *B* is hypostatic.

**(c)** All puppies black means every puppy is *B_E_*, so each parent must supply what the
other lacks.

- The **yellow** parent is *ee* by definition. Since no brown puppies appeared, and the other
  parent is *bb*, the yellow parent must supply *B* to every puppy: **_BBee_**.
- The **brown** parent is *bb*. It must supply *E* to every puppy, so it is **_bbEE_**.
- All puppies: **_BbEe_** — black.

A useful check: this is exactly the classic complementation pattern. Two differently-coloured
parents producing uniformly black offspring tells you their defects are at *different* loci.

</details>

---

## Where you went wrong

| Error pattern | What to re-read |
|---|---|
| Used unconditional probability when the phenotype was already observed | Problems 1(d), 2(e) — [Ch 12](../part-02-transmission-genetics/12-probability-and-testing.md) |
| Applied a binomial coefficient to a specified birth order | Problem 6(c) |
| Thought previous children change the next child's risk | Problem 6(d) |
| Got df wrong in the chi-square | Problem 5(c) |
| Read "not significant" as "hypothesis confirmed" | Problem 5(d) |
| Memorised 9:3:4 instead of deriving it from the pathway | Problem 8(a) — [Ch 11](../part-02-transmission-genetics/11-beyond-mendel.md) |
| Reached for a Punnett square on three or more loci | Problem 3 |
