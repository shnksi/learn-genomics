# Problem set 04 — Pedigrees and risk

Covers [Ch 15](../part-02-transmission-genetics/15-pedigrees.md).

**Attempt before revealing.** Each of these is a model-selection exercise on a tiny, non-randomly
ascertained sample: the answer is never the label, it is the number and the assumptions under it.

Pedigrees are written out rather than drawn so there is nothing to misread. Roughly in order of
difficulty; ★ marks the two worth returning to.

---

## 1. Assigning a mode, and killing the alternatives

A family is ascertained through a young man with a progressive neurological condition.

```
 I    I-1  male AFFECTED  ×  I-2  female, unaffected, married in
 II   children of I-1 × I-2:   II-1 M AFF | II-2 F | II-3 F AFF | II-4 M
      married in:              II-5 F (partner of II-1), II-6 M (partner of II-3)
 III  children of II-1 × II-5: III-1 M AFF | III-2 M | III-3 F AFF
      children of II-3 × II-6: III-4 M AFF | III-5 F
```

**(a)** Assign the most likely mode of inheritance.
**(b)** For each of the other four modes, state the *specific observation* that excludes it, and
say whether the exclusion is logical or merely probabilistic.
**(c)** Autosomal recessive is not logically excluded. Quantify how badly it is disfavoured,
assuming a population carrier frequency of 1/50.
**(d)** II-4 is an unaffected man of 40. Penetrance is 0.8 by age 40. What is the probability he
carries the allele? **[trap]**

<details><summary>Solution</summary>

**(a)** **Autosomal dominant.** Affected people in all three generations (vertical), both sexes
affected in roughly equal numbers (4 male, 2 female), and every affected person has an affected
parent. Among the children of an affected parent, 5 of 9 are affected — consistent with 1/2.

**(b)** Name the observation, not the vibe:

- **X-linked recessive** — killed by **male-to-male transmission**, twice: I-1 → II-1 and
  II-1 → III-1. A father gives his son a Y, never an X. Also by the affected females (II-3,
  III-3), who under XLR would each need an affected father *and* a carrier mother.
- **X-linked dominant** — killed by the same two transmissions, and independently by I-1's
  daughters: an affected father transmits to **all** daughters and **no** sons. I-1 has one
  affected daughter (II-3), one unaffected (II-2), and an affected son (II-1). Both halves fail.
- **Mitochondrial** — killed by transmission through affected *males*. An affected father
  transmits to nobody; I-1 and II-1 transmitted to 4 of 7 children between them.
- **Autosomal recessive** — not logically excluded, see (c).

The male-to-male observations are **probabilistic, not logical**: you saw an affected father with
an affected son, not the transmission of his allele. Misattributed parentage, or a common X-linked
allele entering through the mothers, gives the same picture — which is why two independent
instances matter and one would not be enough.

**(c)** For AR to produce this pedigree, every unaffected spouse who married in — I-2, II-5, II-6
— would have to be a carrier ("pseudo-dominance"). With carrier frequency 1/50 = 0.02:

P(all three carriers) = 0.02³ = **8 × 10⁻⁶**

Under AD those three spouses are unremarkable, probability ≈ 1, so

LR = 1 / (8 × 10⁻⁶) = **125,000 : 1 in favour of AD**

before any segregation data is used. That is the honest form of "it's dominant" — a likelihood
ratio, not a proof.

**(d) [trap]** The trap is answering 0. That reflex is correct only at penetrance 1, and it gets
carried over to the reduced-penetrance case where it is wrong.

Prior: I-1 is heterozygous, I-2 homozygous normal, so each child is a carrier with probability 1/2.

| | Carrier | Not a carrier |
|---|---|---|
| **Prior** | 1/2 | 1/2 |
| **Conditional**: unaffected at 40 | 1 − 0.8 = 0.2 | 1 |
| **Joint** | 0.5 × 0.2 = 0.10 | 0.5 × 1 = 0.50 |
| **Posterior** | 0.10 / 0.60 = **1/6 ≈ 16.7%** | 0.50 / 0.60 = 5/6 |

16.7%, not 0 — and his children are each at 1/6 × 1/2 × 0.8 ≈ **6.7%** of being affected by 40.
Incomplete penetrance is why dominant conditions appear to skip generations
([Ch 11](../part-02-transmission-genetics/11-beyond-mendel.md)).

</details>

---

## 2. When two modes both fit

A different family, ascertained through III-1.

```
 I    I-1  female AFFECTED  ×  I-2  male, unaffected, married in
 II   children of I-1 × I-2:   II-1 F AFF | II-2 M | II-3 M AFF | II-4 F
      married in:              II-5 M (partner of II-1)
 III  children of II-1 × II-5: III-1 M AFF | III-2 F | III-3 F AFF
```

**(a)** Which two modes remain live, and why can you not separate them from this pedigree?
**(b)** A colleague says "no male-to-male transmission — so it's X-linked." What is wrong with
that inference here? **[trap]**
**(c)** Name the single additional observation that would discriminate, and say why it is the
sharpest one available.
**(d)** II-3 later has three daughters and two sons. All three daughters are affected; neither
son is. Compute the likelihood ratio. Then combine it with prior odds of 20:1 favouring
autosomal dominant (such conditions being much the commoner class) and give the posterior.

<details><summary>Solution</summary>

**(a)** **Autosomal dominant and X-linked dominant.** Every transmission here is from a mother —
I-1 and II-1 — and through mothers the two modes are *identical*: a heterozygous mother passes
to 1/2 of her children, sexes exchangeable. Observed: I-1 gave 2 of 4, II-1 gave 2 of 3.

Autosomal recessive needs two carrier spouses marrying in, disfavoured as in problem 1.
Mitochondrial predicts **all** of an affected woman's children are at risk, not half; here 2 of 4
and 1 of 3 are unaffected — strong evidence, though heteroplasmy keeps it evidence rather than
exclusion. X-linked recessive is dead: it cannot give affected females without affected fathers.

**(b) [trap]** The pedigree gave male-to-male transmission **zero opportunities to appear** — the
only affected males, II-3 and III-1, have had no children. Count the chances a signature had
before crediting its absence; here the count is zero, so LR = 1 and the observation is worthless.

**(c)** Find **an affected male with children of both sexes** and record every child's status.
Through mothers the hypotheses are indistinguishable; through an affected father the
sex-by-affection table is *degenerate* under XLD — one diagonal is structurally zero where AD
predicts an even split. It is the only place the two models disagree.

**(d)** Five children, all daughters affected, no sons affected.

- P(outcome | XLD) = 1 — the only outcome XLD permits.
- P(outcome | AD) = (1/2)⁵ = 1/32 — five independent coin flips landing the right way.

LR = 1 ÷ (1/32) = **32 : 1 in favour of XLD**

With prior odds 1:20 (XLD : AD):

Posterior odds = 32 × (1/20) = 1.6 : 1  →  P(XLD) = 1.6 / 2.6 = **0.615 ≈ 62%**

Two lessons. *k* children of an affected father give LR = 2ᵏ — one bit per child — so five buy a
factor of 32, which against a sceptical prior leaves you at a wobbly 62%, not certainty. And the
asymmetry: had **one son been affected**, P(data | XLD) = 0 and XLD would be dead outright.
Falsifying XLD takes one observation; supporting it takes many.

</details>

---

## 3. Recessive recurrence and the 2/3 correction

A man's sister has phenylketonuria (autosomal recessive). He is unaffected. His partner is
unrelated, from a population with a PKU carrier frequency of 1/50.

**(a)** What is his prior probability of being a carrier, and why is it not 1/2?
**(b)** What is the probability their first child is affected?
**(c)** The first child is unaffected. What is the probability the *second* child is affected?
**[trap]**
**(d)** A relative says: "you've had one healthy child, so the 1-in-4 has been used up — the next
is more likely to be affected." Diagnose the error, and note which direction the real effect runs.

<details><summary>Solution</summary>

**(a)** **2/3.** His parents must both be carriers (they produced an affected daughter), so his
four equally likely genotypes are *AA*, *Aa*, *aA*, *aa*. "Unaffected" deletes *aa* and
renormalises over the remaining three, two of which are heterozygous: P(carrier | unaffected) =
2/3. The 1/2 answer forgets to condition on the fact that put him in the problem — the most
commonly dropped step in recessive risk work.

**(b)** Three independent requirements: he is a carrier, she is a carrier, and both transmit.

P = (2/3) × (1/50) × (1/4) = 2/600 = **1/300 ≈ 0.333%**

**(c) [trap]** The unaffected child *is* evidence, and it points the opposite way from intuition.
Set up the hypothesis as "both parents are carriers", since that is the only state in which
children are at risk.

Prior: P(both carriers) = (2/3)(1/50) = 1/75; P(not both) = 74/75.

| | Both carriers | Not both |
|---|---|---|
| **Prior** | 1/75 | 74/75 |
| **Conditional**: one unaffected child | 3/4 | 1 |
| **Joint** | (1/75)(3/4) = 3/300 | 74/75 = 296/300 |
| **Posterior** | (3/300)/(299/300) = **3/299** | 296/299 |

P(second child affected) = (3/299) × (1/4) = **3/1196 ≈ 0.251% ≈ 1 in 399**

Down from 1 in 300 — a **~25% reduction** in risk (24.7% exactly), purely from one free
observation.

**(d)** The gambler's fallacy applied to meiosis: each conception is an independent draw, nothing
is used up. But "no change" is wrong too — the real effect runs *opposite* to the fallacy, because
an unaffected child is mild evidence the parents are not both carriers, so risk **falls**,
1/300 → 1/399.

The sharpest version: **had both parents already tested positive**, the unaffected child would
change nothing — risk stays exactly 1/4 for every subsequent child, forever. The update in (c)
happens only because carrier status was *uncertain*. Data updates the hypothesis, never the coin.

</details>

---

## 4. The full Bayesian table

A woman's maternal grandfather had haemophilia B (X-linked recessive, *F9*). She has four sons,
all healthy and all past the age at which the condition declares itself. She has no molecular
testing.

**(a)** Justify her prior carrier probability from the pedigree alone.
**(b)** Build the full prior / conditional / joint / posterior table.
**(c)** What is the probability that her next son is affected? Her next child, sex unknown?
**(d)** She also has two unaffected daughters. Redo the table including them. **[trap]**
**(e)** Derive the general posterior for *n* unaffected sons, and find how many sons it would take
to bring her carrier probability below 1%.

<details><summary>Solution</summary>

**(a)** An affected male transmits his single X — the one carrying the variant — to **every**
daughter and no son. Her mother is therefore an **obligate carrier**, no test required, and
transmitted one of her two X chromosomes at random: P(carrier) = **1/2**.

**(b)** Each son of a carrier gets the mutant X with probability 1/2, so is unaffected with
probability 1/2; four sons are independent draws.

P(4 unaffected sons | carrier) = (1/2)⁴ = 1/16
P(4 unaffected sons | not a carrier) = 1

| | Carrier | Not a carrier |
|---|---|---|
| **Prior** | 1/2 | 1/2 |
| **Conditional**: 4 unaffected sons | 1/16 | 1 |
| **Joint** | (1/2)(1/16) = 1/32 | (1/2)(1) = 1/2 = 16/32 |
| **Posterior** | (1/32) ÷ (17/32) = **1/17 ≈ 5.88%** | 16/17 ≈ 94.12% |

Four sons, no laboratory, no cost — and the risk has fallen from 50% to 5.9%.

**(c)** Convert carrier risk into the question actually asked:

P(next son affected) = (1/17) × (1/2) = **1/34 ≈ 2.94%**
P(next child affected, sex unknown) = (1/17) × (1/4) = **1/68 ≈ 1.47%**

The 1/4 is 1/2 for "the child is male" times 1/2 for "he gets the mutant X".

**(d) [trap]** The daughters contribute **nothing**. Redo the conditional row honestly:

P(daughter unaffected | mother is a carrier) = 1
P(daughter unaffected | mother is not a carrier) = 1

Her partner is unaffected, so every daughter gets a normal X from him and is unaffected whether or
not she received the mutant maternal X. LR = 1/1 = 1, both joint cells are multiplied by 1, and
the posterior stays at **1/17**.

The habit to build: evidence is only evidence when the two hypotheses assign it *different*
probabilities. (Each daughter is nonetheless a carrier with probability (1/17) × (1/2) =
**1/34 ≈ 2.94%** — she just does not inform her mother's status.)

**(e)** With *n* unaffected sons:

posterior = [(1/2)(1/2ⁿ)] ÷ [(1/2)(1/2ⁿ) + (1/2)(1)] = (1/2ⁿ) ÷ (1/2ⁿ + 1) = **1 / (1 + 2ⁿ)**

Check: *n* = 4 gives 1/17 ✓.

Require 1/(1 + 2ⁿ) < 0.01 ⇒ 1 + 2ⁿ > 100 ⇒ 2ⁿ > 99 ⇒ *n* = 7.

- *n* = 6: 1/65 = 1.54%
- *n* = 7: 1/129 = **0.775%** ✓

**Seven** unaffected sons. Note how slowly this converges — one bit per son, and the posterior
never reaches 0. Compare problem 5, where a single test at LR 20:1 outperforms four sons.

</details>

---

## 5. A negative test with imperfect sensitivity

A woman's brother has spinal muscular atrophy (autosomal recessive, *SMN1*). She has *SMN1*
dosage testing, which detects a carrier with probability **0.95**; her result is **negative**.
Her partner has no family history; the population carrier frequency is 1/50. He has the same
test, also **negative**.

**(a)** Show exactly where the sensitivity of 0.95 enters the table, and why the non-carrier
column gets a 1.
**(b)** Compute her posterior carrier probability.
**(c)** Compute his.
**(d)** Probability their child is affected. Compare with the no-testing figure.
**(e)** The same test, same sensitivity, moved her prior by a factor of 7.3 and his by a factor
of 19.6. Explain the asymmetry. **[trap]**

<details><summary>Solution</summary>

**(a)** Sensitivity is P(test positive | carrier) = 0.95. The conditional row needs
P(**observed** result | hypothesis), and the observed result is *negative*:

P(negative | carrier) = 1 − 0.95 = **0.05** — the false-negative rate. Sensitivity enters as its
complement.
P(negative | not a carrier) = **1** — this is the specificity, taken as 1.0. Such assays
essentially never call a true non-carrier positive; were specificity 0.98 you would put 0.98 here.

**(b)** Her prior is 2/3 — unaffected sibling of an affected person, as in problem 3(a).

| | Carrier | Not a carrier |
|---|---|---|
| **Prior** | 2/3 | 1/3 |
| **Conditional**: negative test | 0.05 | 1 |
| **Joint** | (2/3)(0.05) = 1/30 | 1/3 = 10/30 |
| **Posterior** | (1/30) ÷ (11/30) = **1/11 ≈ 9.09%** | 10/11 ≈ 90.9% |

**(c)** His prior is the population carrier frequency, 1/50 = 0.02.

| | Carrier | Not a carrier |
|---|---|---|
| **Prior** | 0.02 | 0.98 |
| **Conditional**: negative test | 0.05 | 1 |
| **Joint** | 0.02 × 0.05 = 0.001 | 0.98 × 1 = 0.98 |
| **Posterior** | 0.001 / 0.981 = **1/981 ≈ 0.102%** | 0.980/0.981 ≈ 99.9% |

**(d)** P(affected child) = (1/11) × (1/981) × (1/4)

Denominator: 11 × 981 = 10,791; × 4 = **43,164**

= 1/43,164 ≈ **2.32 × 10⁻⁵**, about 1 in 43,000.

Without any testing it would have been (2/3)(1/50)(1/4) = **1/300**. The two negative tests cut
the risk by 43,164 / 300 = **143.9-fold** — but not to zero.

**(e) [trap]** The tempting reading is that the test "worked better" on him. It did not — the
likelihood ratio is identical. Odds form makes this transparent:

LR(negative) = 0.05 / 1 = **1/20** for everybody.

- Her prior odds 2 : 1 → posterior odds 2/20 = 1 : 10 → P = 1/11 ✓
- His prior odds 1 : 49 → posterior odds 1 : 980 → P = 1/981 ✓

Odds are multiplied by exactly 1/20 in both cases. What differs is the *probability* reduction,
because converting odds back to probability renormalises:

- Hers: (2/3) ÷ (1/11) = 22/3 = **7.33-fold**
- His: (1/50) ÷ (1/981) = 981/50 = **19.62-fold**

With a small prior the denominator barely moves (0.981 ≈ 1), so the probability falls by nearly
the full LR of 20; with a large prior the denominator falls too and the reduction is much less.
**The likelihood ratio belongs to the test; the fold-change in probability belongs to the test
*and* the prior.** "This test cuts your risk 20-fold" is therefore wrong for exactly the high-risk
patients who most want to hear it.

The residual is not an arithmetic artefact. 1 in 43,000 rather than 0 reflects the 5% of carriers
the assay misses — for *SMN1*, the "2+0" configuration, two copies on one chromosome and none on
the other, reads out as normal dosage in a true carrier — plus the few per cent of cases from a de
novo deletion in a genuinely non-carrier parent.

</details>

---

## 6. Consanguinity by path counting

A couple are **first cousins once removed**. Precisely: the husband's mother is a first cousin of
the wife, so the husband is one generation further down the same loop. The common ancestors are a
single couple, *A* and *B*, both non-inbred.

**(a)** Draw the loops and compute *F* for their child by path counting. State the classic error
that gives exactly twice the right answer. **[trap]**
**(b)** A recessive condition has a carrier frequency of 1/60 in their community. Compute the
child's risk, and the fold increase over an unrelated couple.
**(c)** Repeat for a much rarer allele, *q* = 1/1000, and explain the pattern.
**(d)** The couple ask what their *overall* risk of a child with a serious genetic condition is.
Why is your answer to (b) not that number? **[trap]**

<details><summary>Solution</summary>

**(a)** The genealogy: *A* × *B* are the ancestor couple; *P*1 and *P*2 their children (full
sibs); *C*1 is *P*1's child, *C*2 is *P*2's child, so *C*1 and *C*2 are first cousins; *D* is
*C*2's child by an unrelated partner; *C*1 × *D* → *X*.

Closed loops linking *X*'s two parents through a common ancestor:

Path through *A*: **C1 – P1 – A – P2 – C2 – D** = 6 individuals
Path through *B*: **C1 – P1 – B – P2 – C2 – D** = 6 individuals

*F* = Σ (1/2)ⁿ (1 + *F*ₐ) with *n* = 6 and *F*ₐ = 0:

*F* = (1/2)⁶ + (1/2)⁶ = 1/64 + 1/64 = 2/64 = **1/32 = 0.03125**

Matching the standard table ✓ — half the first-cousin 1/16, each loop being one individual longer.

**[trap]** The classic error is counting only meioses. A 6-individual loop contains 5 meioses,
giving (1/2)⁵ per path and 2/32 = 1/16 — **exactly twice** the right answer. The missing 1/2 is
not a meiosis: it is the probability that the common ancestor sends the *same one* of its two
alleles down both branches. That is its self-kinship ½(1 + *F*ₐ) — the source of the (1 + *F*ₐ).

**(b)** Carrier frequency 1/60 ≈ 2*q*, so *q* = 1/120 = 0.008333.

P(*aa*) = *F·q* + (1 − *F*)*q*²

- *F·q* = 0.03125 × 0.008333 = 2.6042 × 10⁻⁴
- *q*² = (0.008333)² = 6.9444 × 10⁻⁵
- (1 − *F*)*q*² = 0.96875 × 6.9444 × 10⁻⁵ = 6.7274 × 10⁻⁵
- Total = 2.6042 × 10⁻⁴ + 0.6727 × 10⁻⁴ = **3.2769 × 10⁻⁴ ≈ 1 in 3,052**

Unrelated couple: *q*² = 6.9444 × 10⁻⁵ = **1 in 14,400**

Fold increase = 3.2769 × 10⁻⁴ ÷ 6.9444 × 10⁻⁵ = **4.72×**

Check it algebraically rather than trusting the division: the ratio is
*F*/*q* + (1 − *F*) = 3.75 + 0.96875 = **4.71875** ✓

**(c)** With *q* = 1/1000: *F·q* = 0.03125 × 0.001 = 3.125 × 10⁻⁵ and (1 − *F*)*q*² =
0.96875 × 10⁻⁶ = 9.6875 × 10⁻⁷, total **3.2219 × 10⁻⁵ ≈ 1 in 31,038**, against an outbred 1 in
1,000,000. Fold increase = 31.25 + 0.96875 = **32.2×**.

The IBD term is **linear** in *q*, the outbred term **quadratic**, so their ratio ≈ *F*/*q* and
grows without bound as the allele gets rarer. Consanguinity barely matters for common recessives
and enormously for rare ones — hence the enrichment of consanguineous families among parents of
children with rare recessive disease, and hence homozygosity mapping.

**(d) [trap]** Part (b) is a **per-locus** number, for one allele you already know the family
carries. Their question is genome-wide, dominated by aggregate recessive load — the several dozen
rare pathogenic alleles everyone carries heterozygously, none of them identified.

Empirically: against a background of roughly **2–3%** for a significant congenital anomaly or
genetic disorder in any pregnancy, first cousins (*F* = 1/16) carry an **additional 1.7–2.8%**
absolute. First cousins once removed sit at half that *F*, so of order **1%** extra on a 2–3%
base. Real, and not catastrophic; saying only one of those out loud is a counselling failure.

</details>

---

## 7. ★ Two affected children, unaffected parents

A healthy, unrelated couple have two children with osteogenesis imperfecta. Sequencing finds the
**same heterozygous *COL1A1* variant** in both children. Neither parent carries it in blood at
standard depth. A junior colleague writes "autosomal recessive, recurrence risk 25%".

**(a)** Give two reasons the molecular data refutes autosomal recessive, and name the one loose
end you must close first.
**(b)** Derive a per-gamete rate for a new pathogenic *COL1A1* variant from the germline mutation
rate, watching the units. *COL1A1* has ~4,400 bp of coding sequence; take roughly one in five
new coding substitutions there to be pathogenic. **[trap]**
**(c)** Condition on the first affected child (that is why the family is here) and compute the
posterior odds that a parent is a germline mosaic, taking a prior of 0.08 and a mosaic gamete
fraction of 0.05.
**(d)** Sperm testing shows the variant at a **variant allele fraction of 4%** in the father's
semen. What is the recurrence risk? **[trap]**
**(e)** Compare the three numbers the family could have been given, and give the affected child's
own offspring risk.

<details><summary>Solution</summary>

**(a)** Two reasons:

1. Both affected children are **heterozygous for a single variant**. Autosomal recessive needs two
   hits — homozygous, or compound heterozygous. One pathogenic allele plus disease is a
   dominant-acting allele by definition.
2. **Neither parent carries it.** Under AR both would be obligate carriers of a transmitted allele.

The loose end: exclude a *second*, undetected *COL1A1* or *COL1A2* allele — a deep intronic or
structural variant short-read exome sequencing would miss. Until that is done, (1) is an inference,
not an observation.

**(b) [trap]** The unit trap. Reach for the **germline** rate, not the replication-fidelity
figure. Replication fidelity is ~10⁻¹⁰ per base **per replication**; the germline SNV rate is
~1.2 × 10⁻⁸ per base **per generation**. They differ ~100-fold and are not interchangeable. Here
we need per generation, because a gamete is the end of a generation, not of one cell division.

Coding substitutions in *COL1A1* per gamete per generation:

4,400 bp × 1.2 × 10⁻⁸ per bp per generation = **5.28 × 10⁻⁵**

Pathogenic fraction ≈ 1/5:

5.28 × 10⁻⁵ ÷ 5 ≈ **1.06 × 10⁻⁵ ≈ 1 × 10⁻⁵ per gamete**

**(c)** Two hypotheses, both conditioned on child 1 being affected:

- *H*ₘ: one parent is a germline mosaic, gamete fraction *m* = 0.05.
  P(child 2 also affected | *H*ₘ) = 0.05
- *H*ᵢ: no mosaicism; each event is independent de novo. Mind the units again: (b) gave a rate
  **per gamete**, and a conception samples **two** gametes — either parent's could carry the new
  variant — so the per-conception rate is twice it.
  P(child 2 also affected | *H*ᵢ) = 2 × 1.06 × 10⁻⁵ ≈ **2.1 × 10⁻⁵**

LR = 0.05 ÷ 2.1 × 10⁻⁵ ≈ **2,400**

Prior odds = 0.08 : 0.92 = 0.08696

Posterior odds = 0.08696 × 2,400 ≈ **210 : 1**, i.e. P(mosaic) ≈ **99.5%**

That understates it: both children carry the *identical nucleotide substitution*, and two
independent events hitting the same base is rarer still than two independent pathogenic events
anywhere in the gene.

**Two affected children of unaffected parents is not a recessive signature.** It is equally the
signature of germline mosaicism for a dominant allele, and the molecular data — one heterozygous
variant, absent from parental blood — settles which.

**(d) [trap]** 4% VAF in **sperm** means **4% of gametes carry the variant**: recurrence risk
**4% per pregnancy**.

The trap is halving it. In a *diploid* somatic sample a heterozygous variant present in a fraction
*c* of cells reads out at VAF ≈ *c*/2 — one mutant allele among two per carrying cell. Sperm are
**haploid**: one out of one, so VAF equals the cell fraction directly. Applying the diploid
correction to sperm halves the risk you quote the family.

**(e)** Three numbers, same family, same variant:

| The call | Recurrence risk quoted | Error |
|---|---|---|
| "Autosomal recessive" | 25% | overstates by 25/4 = **6.25×** |
| "De novo — so it won't happen again" | ~2 × 10⁻⁵ per conception | understates by 0.04 ÷ (2 × 10⁻⁵) = **2,000×** |
| Germline mosaicism, measured | **4%** | — |

The affected child's own offspring risk, should they reproduce, is **1/2**: they are a
**constitutional** heterozygote, not a mosaic, so every gamete derives from a carrying cell and
segregation is the ordinary dominant 1/2. Their parents' risk is 4%. Two figures about one variant
in one family differing **12.5-fold**, and which applies depends on who is sitting in front of you.

A negative parental blood test converts a high risk into a low one. Never into zero.

</details>

---

## 8. ★★ Imprinting: one deletion, two syndromes

The 15q11.2–q13 region contains genes expressed only from the paternal chromosome (the
*SNRPN*/*SNORD116* cluster) and *UBE3A*, expressed only from the maternal chromosome in neurons.
Two syndromes arise from it: Prader–Willi (PWS) and Angelman (AS).

**(a)** A child has a ~5 Mb deletion of 15q11.2–q13. Which syndrome? Justify from expression, not
from memory.
**(b)** A second child has a normal microarray and normal *UBE3A* sequence, but abnormal
methylation, and SNP genotyping shows both copies of chromosome 15 came from the mother. Which
syndrome, and by what mechanism?
**(c)** Maternal UPD15 usually follows trisomy rescue. Compute the probability that rescuing a
trisomy produces UPD, and use it to explain why maternal UPD15 accounts for ~25% of PWS while
paternal UPD15 accounts for only ~5% of AS.
**(d)** Using deletion 70%, UPD 25%, imprinting-centre defect 2% for PWS, and deletion 70%,
UPD 5%, IC defect 3%, *UBE3A* point mutation 11% for AS: in 100 consecutive patients of each,
how many would a **methylation test** detect? **[trap]**
**(e)** An unaffected woman carries a deletion of the imprinting centre element required to
*establish the maternal imprint*, on the chromosome 15 she inherited from her **father**. Explain
why she is unaffected, and give the risk and syndrome for her children.

<details><summary>Solution</summary>

**(a)** **It depends entirely on which parent's chromosome carries the deletion**, and only a
parent-of-origin test can say.

- **Paternal deletion → Prader–Willi.** The maternal *SNORD116* copies are already silenced by
  imprinting, so deleting the paternal copy takes expression to zero.
- **Maternal deletion → Angelman.** The paternal *UBE3A* is already silenced in neurons, so
  deleting the maternal copy removes the only expressed copy.

At an imprinted locus you are functionally **hemizygous**: one deletion is a total loss, and which
genes go to zero depends on the parent of origin. The five-mode sieve has no slot for that.

**(b)** **Prader–Willi, by maternal uniparental disomy 15.** Both chromosome 15s carry the
maternal imprint, so the paternally expressed genes are silenced on both — functionally identical
to a paternal deletion, with no deletion anywhere. Hence array-normal, sequence-normal cases, and
hence **methylation** as the correct first-line test.

**(c)** A trisomic conceptus from maternal meiotic nondisjunction has **two maternal and one
paternal** chromosome 15. Rescue drops one of the three at random:

- Lose the paternal one: P = **1/3** → surviving pair both maternal → **maternal UPD15**
- Lose either maternal one: P = 2/3 → normal biparental disomy, no consequence

So 1/3 of rescued trisomy-15 conceptuses have maternal UPD.

The 5:1 asymmetry (25% of PWS vs 5% of AS) follows because the *input* is asymmetric: maternal
meiotic nondisjunction is far commoner than paternal — oocytes sit arrested for decades, sperm do
not — so trisomy 15 is overwhelmingly maternal and rescue overwhelmingly yields *maternal* UPD.
Paternal UPD15 needs a rarer route (monosomy rescue duplicating the lone paternal chromosome).
Maternal UPD15 therefore carries a **maternal-age effect** — the only PWS mechanism that does.

**(d) [trap]** Methylation testing reads the parent-of-origin methylation pattern. It is abnormal
for deletion, UPD **and** IC defect — all three change which parental pattern is present — and
**normal** for a *UBE3A* point mutation, which leaves imprinting untouched.

**PWS, 100 patients:** 70 + 25 + 2 = **97 detected**. All three mechanisms disturb methylation, so
this is effectively a complete first-line test (>99% in practice; the 3-patient shortfall is
midpoint rounding of the published ranges, not an undetectable class).

**AS, 100 patients:** 70 + 5 + 3 = **78 detected**. The 11 *UBE3A* point mutations methylate
normally, and ~11 more have no identified mechanism at all.

Sensitivity: **~97–99% for PWS, ~78% for AS.** The same first-line test, on two syndromes from the
same 5 Mb of DNA, misses roughly one AS patient in five and essentially no PWS patient. A normal
methylation result rules PWS out; it does **not** rule AS out. Next step: *UBE3A* sequencing.

**(e)** The deleted element is only needed on a chromosome that must acquire the **maternal**
imprint. Hers came from her **father**, so it had to acquire the *paternal* imprint — which it
did, the paternal machinery not using this element. Her other chromosome 15 is normal and
maternal. One working paternal contribution, one working maternal: no phenotype.

Her children are another matter. In *her* germline every chromosome 15 she transmits must be given
the **maternal** imprint, and on the deleted one she cannot establish it. A child inheriting it
gets a maternal chromosome carrying a paternal-type imprint plus a genuinely paternal one from the
father — two paternal patterns, no maternal *UBE3A* expression in neurons.

**Risk: 1/2 of her children, affected with Angelman syndrome.**

Note the shape: unaffected transmitting parent, abrupt 50% risk, and a mode that reverses with the
transmitter's sex. The mirror is exact — a man carrying the PWS-side IC deletion on his
**maternally** inherited chromosome 15 is likewise unaffected, and 1/2 of his children have
**Prader–Willi**.

So mechanism, not diagnosis, sets recurrence risk. Same clinical label: de novo deletion or de novo
UPD, under 1%; inherited IC deletion or maternally inherited *UBE3A* variant, **50%**. A 50-fold
range. Classify the mechanism before quoting a number.

</details>

---

## Where you went wrong

| Error pattern | What to re-read |
|---|---|
| Read "no male-to-male transmission" as evidence without counting the opportunities | Problem 2(b) |
| Used 1/2 instead of 2/3 for the unaffected sibling of an affected person | Problems 3(a), 5(b) |
| Said an unaffected child of an affected parent cannot be a carrier | Problem 1(d) — true only at penetrance 1 |
| Counted unaffected daughters as evidence in an X-linked recessive table | Problem 4(d) — LR exactly 1 |
| Put sensitivity rather than (1 − sensitivity) in the conditional cell | Problem 5(a) |
| Quoted a test's fold risk-reduction as a property of the test | Problem 5(e) |
| Computed *F* as (1/2)^(meioses) and got exactly twice the answer | Problem 6(a) |
| Gave the per-locus consanguinity risk as the couple's overall risk | Problem 6(d) |
| Read two affected children of unaffected parents as recessive | Problem 7(c) |
| Used the ~10⁻¹⁰ replication fidelity where a per-generation rate was needed | Problem 7(b) — ~100× apart |
| Halved a sperm VAF as though the sample were diploid | Problem 7(d) |
| Assigned a syndrome from a deletion without asking which parent it came from | Problem 8(a) |
| Treated a normal methylation result as excluding Angelman syndrome | Problem 8(d) — ~78% sensitive |
| Quoted a recurrence risk from the diagnosis rather than the mechanism | Problem 8(e) — <1% versus 50% |
