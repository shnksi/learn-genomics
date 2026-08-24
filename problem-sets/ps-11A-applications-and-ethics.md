# Problem set 11A — Applications and ethics

Covers [Ch 57–58](../part-12-applications-and-ethics/57-genomics-in-practice.md).

**Attempt before revealing.** Part 12 looks like the argumentative part of the course and mostly
is not. Nearly every disagreement in it turns on a number somebody declined to compute: what a
positive screen is worth at a realistic prevalence, how many people a database exposes through
relatives who never joined it, how far a polygenic score actually moves one person. Six of these
eight problems are arithmetic; the two that are not are built to stop you substituting a verdict
for an argument. What the set will expose, if you read Part 12 rather than calculating it, is the
habit of accepting a percentage — 99.7% sensitive, 2% coverage, 3× relative risk — without
asking what it is conditional on. Several answers are the opposite of the intuition, problems 3,
4 and 7 most sharply.

**Conventions fixed for this set**, so nothing turns on a guess. *False-positive rate* means
1 − specificity throughout. Every rate, penetrance, threshold, detection rate and cost supplied
below is **given data for the problem** — the chapters supply the machinery and the direction of
the effect, not these particular values. Where a table is labelled *supplied*, use it as stated
rather than any figure you may know from elsewhere.

---

## 1. A positive screen, and what it is worth

A prenatal cell-free DNA screening programme runs in a cohort of younger mothers where the birth
prevalence of trisomy 21 is **1 in 1,500**. The assay is the one from [Ch 57 §3](../part-12-applications-and-ethics/57-genomics-in-practice.md):
sensitivity **99.7%**, false-positive rate **0.04%**.

**(a)** A patient screens positive. Answer her. Work in a cohort of 150,000 pregnancies.
**(b)** A different patient screens negative. Answer her too, and name the asymmetry.
**(c)** The laboratory can fund exactly one improvement: sensitivity to a perfect 100%, or the
false-positive rate halved to 0.02%. Compute the new PPV under each and say which to buy.
**(d)** A classmate reaches for the chapter's shortcut PPV ≈ prevalence × sensitivity / FPR,
gets 1.66, and reports a PPV of 166%. What went wrong, and state the condition under which the
shortcut is safe.

<details><summary>Solution</summary>

**(a)** Build the 2×2 table. Never reason about a screen without one.

```
                    trisomy 21     euploid       total
  screen positive        99.70        59.96      159.66
  screen negative         0.30   149,840.04  149,840.34
  ---------------------------------------------------------
  total                 100.00   149,900.00  150,000.00
```

- affected = 150,000 / 1,500 = **100**; unaffected = **149,900**
- true positives = 100 × 0.997 = **99.7**
- false positives = 149,900 × 0.0004 = **59.96**

PPV = 99.7 / 159.66 = **62.4%**

So: *this result raises the probability the fetus has trisomy 21 from about 0.07% to about 62%.
It is a large change and it is not a diagnosis. Nearly two positives in five are wrong. The next
step is a diagnostic test — CVS or amniocentesis — not a decision.*

**Sanity check you should do every time.** [Ch 57 §3](../part-12-applications-and-ethics/57-genomics-in-practice.md)
computes 71.4% for the same assay at a prevalence of 1 in 1,000. Our prevalence is lower, so our
PPV must be lower, and 62.4% < 71.4%. If your answer had come out above 71%, the arithmetic was
wrong, not the intuition.

**(b)** NPV = 149,840.04 / 149,840.34 = **99.9998%**, i.e. about **1 false reassurance in 500,000**.

The asymmetry is the definition of a screen. The same laboratory, on the same run, returns a
negative that is nearly conclusive and a positive that is barely more likely than not. That is
not a defect and it is not marketing: it follows from the false positives being drawn from a pool
1,499 times larger than the true positives. **A negative cfDNA screen is genuinely informative; a
positive cfDNA screen is a reason to do a different test.**

**(c)** Recompute each in turn, holding everything else fixed.

| Change | True positives | False positives | PPV |
|---|---:|---:|---:|
| (none) | 99.70 | 59.96 | **62.4%** |
| sensitivity → 100% | 100.00 | 59.96 | **62.5%** |
| FPR → 0.02% | 99.70 | 29.98 | **76.9%** |

Perfect sensitivity buys **0.07 percentage points**. Halving the false-positive rate buys
**14.4 points** — more than **200 times** as much, for a change in specificity from 99.96% to
99.98%, which sounds like nothing.

Buy the specificity. And notice why the trade-off is invisible when quoted as specificity:
two hundredths of a percentage point of specificity is half the false positives. **Specificity is
the wrong unit to think in; the false-positive count is the right one**, because that is the
number that lands in the denominator of the PPV.

**(d)** The shortcut drops the true positives out of the denominator:

exact PPV = (π × sens) / (π × sens + (1 − π) × FPR), and the shortcut is what remains when
π × sens is negligible against (1 − π) × FPR.

Here it is not negligible — it is the *majority*, because PPV = 62%. The shortcut asserts that
true positives are a small minority of positives and then divides by a number that is too small,
so it produces a "probability" above 1, which is the error announcing itself.

**The condition:** the shortcut is safe when π × sens is far below FPR, equivalently when
π is far below FPR/sens = 0.0004/0.997 = 1 in 2,492. Our prevalence, 1 in 1,500, is **1.66 times
larger** than that — hence the 1.66.

Where it *is* valid, it is excellent. On the chapter's 22q11.2 example
(π = 2.5 × 10^-4, sens = 0.978, FPR = 0.0076): π × sens = 2.4 × 10^-4 against
(1 − π) × FPR = 7.6 × 10^-3, a ratio of 0.032, and the shortcut gives 3.22% against an exact
3.12%.

**Generalise.** The shortcut fails exactly when the screen is working well, and works exactly
when the screen is returning mostly false positives. That is a useful diagnostic in itself: if
the shortcut and the exact answer agree, your test is dominated by false positives.

</details>

---

## 2. Newborn screening: which error costs more ★

A genomic newborn screening programme of the kind described in
[Ch 57 §4](../part-12-applications-and-ethics/57-genomics-in-practice.md) includes gene *G* for a
condition that is treatable in childhood. Screen **1,000,000** newborns. **Supplied:**

| Quantity | Value |
|---|---|
| Newborns carrying a variant on the panel's pathogenic list for *G* | 1 in 5,000 |
| Penetrance of those variants, from families ascertained because a child was affected | 0.90 |
| Penetrance of those variants in an unselected population (the truth, unknown to the programme) | 0.10 |
| Sequencing call accuracy | assume perfect — every variant carrier is flagged, nobody else is |
| The panel's variant list captures every disease-causing variant in *G* | assume true |

The biochemical predecessor — a dried blood spot on tandem mass spectrometry, which measures the
disease process rather than the genotype — has **sensitivity 0.98** and a **false-positive rate
of 1 × 10^-5** for the same condition.

**(a)** How many babies does the genomic screen flag, and what positive predictive value does the
programme implicitly claim? What is the true PPV?
**(b)** Compute the PPV of the biochemical screen. Be careful which prevalence you use.
**(c)** Let C_FP be the harm of one false positive and C_FN the harm of one missed case. At what
ratio C_FN / C_FP do the two screens break even?
**(d)** [Ch 57 §4](../part-12-applications-and-ethics/57-genomics-in-practice.md) says replacing
biochemistry with sequencing "breaks that logic in a specific way". Which logic, which way, and
what single piece of evidence would fix it?

<details><summary>Solution</summary>

**(a)** Flagged = 1,000,000 / 5,000 = **200 babies**.

The programme's literature quotes penetrance 0.90, so it implicitly claims **PPV = 90%** — 180
of the 200 will develop the condition.

The truth: 200 × 0.10 = **20 cases**. True PPV = 20/200 = **10%**.

**180 healthy children have been labelled**, nine for every one helped. And note where the error
lives. Not in the assay — the sequencing is stipulated perfect. Not in the variant list — it is
stipulated complete. The error is entirely in a **penetrance estimate imported from families
ascertained because someone was affected**, which is the one number the assay cannot measure and
the programme did not check.

*Scale check.* Is 1 in 5,000 plausible for one gene on a 500-gene panel? If every panel gene
flagged at this rate the programme would flag 500/5,000 = **1 in 10 babies**. The Generation
Study expects about **1 in 100** ([Ch 57 §4](../part-12-applications-and-ethics/57-genomics-in-practice.md)),
so the *average* panel gene must flag around 1 in 50,000 and *G* is an unusually common one. Do
this check whenever a per-item rate is offered for a many-item panel.

**(b)** The trap is the prevalence. The biochemical assay detects the **disease**, not the
genotype, so its denominator is the 20 true cases — not the 180 non-penetrant carriers, who are
biochemically normal by construction, and not the 200 flagged.

```
                     affected      unaffected        total
  positive              19.60            10.00        29.60
  negative               0.40       999,970.00   999,970.40
  ------------------------------------------------------------
  total                 20.00       999,980.00  1,000,000.00
```

- true positives = 20 × 0.98 = **19.6**
- false positives = 999,980 × 1 × 10^-5 = **10.0**

PPV = 19.6 / 29.6 = **66.2%**, against the genomic screen's 10%.

**The wrong path, which is worth walking.** Using 180 as the case count (the penetrance the
programme believes) gives affected = 180, TP = 176.4, FP = 999,820 × 10^-5 = 10.0,
PPV = 94.6% — and it is nonsense, because those 180 do not have the disease and a biochemical
assay would not find one. Choosing the denominator is the whole problem here, and it is not a
detail of the arithmetic: the two screens are being asked *different questions*, and only one of
them is about a sick child.

**(c)** Compare the two programmes on the same cohort.

| | True positives | False positives | False negatives |
|---|---:|---:|---:|
| Genomic | 20.0 | 180.0 | 0.0 |
| Biochemical | 19.6 | 10.0 | 0.4 |
| **Genomic minus biochemical** | **+0.4** | **+170.0** | **−0.4** |

Genomic sequencing buys **0.4 additional true cases** and pays **170 additional false positives**.
Break-even:

0.4 × C_FN = 170 × C_FP → **C_FN / C_FP = 425**

So the genomic screen is the better buy only if one missed treatable case is worse than **425**
false positives. Whether it is depends entirely on what a false positive actually costs — a
repeat blood spot and a fortnight of parental fear, or a childhood of surveillance appointments,
an insurance record, and a family that treats a well child as ill. The chapter's phrase is that
the Generation Study reports **a suspicion, not a diagnosis**, and the whole weight of the design
sits on how quickly and how completely a suspicion can be retired.

**(d)** The logic is **Wilson–Jungner**: screen only for conditions that are serious, detectable
presymptomatically, and treatable, with earlier treatment better. Every clause is about the
*disease*.

The way it breaks: **biochemistry measures the disease process; sequencing measures a genotype.**
A raised metabolite in a well baby is the disease, early. A pathogenic variant in a well baby is a
probability whose value nobody has measured in well babies — because every published penetrance
estimate came from families ascertained *because* someone was affected. That is what turned a 90%
claim into a 10% reality in (a), and it is the difference between the two screens' PPVs in (b).

The evidence that would fix it: **penetrance estimated in an unselected population** — a large
population biobank, genotype-first, counting how many carriers of the listed variants actually
develop the condition without having been recruited through an affected relative. Nothing else
substitutes: not a better assay, not a longer gene list, not a bigger cohort of families.

**Generalise.** Every time a test moves upstream of the disease it is measuring — genotype
instead of metabolite, screen instead of symptom — the prior falls and the PPV falls with it.
Problem 1 is the same sentence in a different clinic.

</details>

---

## 3. Designing a carrier-screening panel

A laboratory is designing a pan-ethnic carrier screening panel. **Supplied inclusion rule:**
include a gene if its carrier frequency is **at least 1 in 200 in at least one** of the reference
populations against which the laboratory estimates ancestry. Carrier frequencies:

| Gene | Reference population A | Reference population B |
|---|---:|---:|
| *G1* | 1 in 25 | 1 in 90 |
| *G2* | 1 in 150 | 1 in 400 |
| *G3* | 1 in 1,200 | 1 in 60 |
| *G4* | 1 in 900 | 1 in 1,100 |

**(a)** Which genes go on the panel, and via which population?
**(b)** A couple whose genomes both resemble reference population B are considering a pregnancy.
Before any testing, what is their risk of a child affected by the *G3* condition?
**(c)** Both screen negative for *G3*. The panel's variant list detects **90%** of the pathogenic
alleles present in *G3* in this population. What is their residual risk, and by what factor did
the test reduce it? Predict the factor before you compute it.
**(d)** The laboratory's competitor sells an ancestry-targeted panel: *G3* is offered only to
people who self-report an ancestry associated with population B. Name the two ways this fails,
and state what a "negative" on a three-variant *BRCA* panel has in common with it.

<details><summary>Solution</summary>

**(a)** Threshold 1 in 200 = 0.005. Convert everything to a decimal before comparing — comparing
denominators invites a sign error.

| Gene | A | B | Verdict |
|---|---:|---:|---|
| *G1* | 0.0400 | 0.0111 | **include** — clears in both |
| *G2* | 0.00667 | 0.0025 | **include** — clears via A only |
| *G3* | 0.00083 | 0.01667 | **include** — clears via B only |
| *G4* | 0.00111 | 0.00091 | exclude — clears in neither |

*G2* and *G3* are the point of the exercise. Each clears the threshold in exactly one reference
population and would be missing from a panel built around the other. A rule of the form "common
enough **anywhere**" is what makes a single panel serve everyone, and it is why the pan-ethnic
design does not need to know anybody's self-reported ancestry to work.

**(b)** Both parents must be carriers, and both must transmit:

risk = (1/60) × (1/60) × 1/4 = 1/14,400 = **6.94 × 10^-5**, about **1 in 14,400**.

(This is the [Ch 26](../part-05-population-genetics/26-hardy-weinberg.md) random-couple
calculation you did in [problem set 07](ps-07-population-genetics.md) problem 2(c), reused here as
a *prior*.)

**(c)** First the per-person posterior. Count, per 60,000 people from population B:

```
  carriers                  1,000
    variant on the list       900   -> screen POSITIVE
    variant not on the list   100   -> screen NEGATIVE
  non-carriers             59,000   -> screen NEGATIVE
  -----------------------------------------------------
  screen negatives         59,100   of which 100 are carriers
```

P(carrier | negative) = 100 / 59,100 = 0.001692 = **1 in 591**, down from 1 in 60.

Algebraically, with carrier frequency *c* and detection rate *DR*:

P(carrier | negative) = c(1 − DR) / (1 − c·DR) = (0.016667 × 0.10) / (1 − 0.015) = 0.001692 ✓

Residual couple risk = 0.001692^2 × 1/4 = **7.16 × 10^-7**, about **1 in 1,400,000**.

Reduction factor = (1/14,400) / (1/1,397,000) = **97-fold**.

**The prediction most people make is 10-fold**, reasoning that the test misses 10% of alleles. It
is wrong by an order of magnitude, and the reason is structural: **both parents must be carriers,
so the couple's risk is the square of a per-person probability**, and squaring a 9.85-fold
reduction gives 97.

Exactly: the per-person reduction is c / [c(1 − DR)/(1 − c·DR)] = (1 − c·DR)/(1 − DR)
= 0.985/0.10 = 9.85, and 9.85^2 = 97.02. As DR → 1 the per-person factor grows like 1/(1 − DR)
and the couple factor like 1/(1 − DR)^2, which is why the last few percentage points of detection
rate are worth so much more than the first few.

**(d)** Two failures, both named in [Ch 57 §4](../part-12-applications-and-ethics/57-genomics-in-practice.md).

1. **Self-reported ancestry is a poor proxy for which founder variants someone carries.** The
   thing that determines carrier status is which segments of genome the person actually has;
   the thing the intake form records is a social self-description. They correlate imperfectly, so
   the targeting mis-assigns people in both directions — and mis-assignment here means a test
   that was never offered.
2. **It fails completely for people of admixed background.** There is no box to tick that maps
   onto a genome with segments from several reference populations, so the rule has no defined
   behaviour for a growing fraction of the population.

What a three-variant *BRCA* panel has in common: **coverage of a gene is not coverage of a
condition** ([Ch 57 §11](../part-12-applications-and-ethics/57-genomics-in-practice.md)). A test
genotyping three founder variants out of thousands of known pathogenic variants in *BRCA1* and
*BRCA2* returns a "negative" whose detection rate is low and unstated — which is precisely part
(c) run with a *DR* near zero, where the reduction factor is near 1 and the negative is close to
uninformative. In both cases the failure is that the report says *negative* and the patient hears
*not a carrier*.

**Generalise.** A negative screening result is a *likelihood ratio applied to a prior*, exactly
like a positive one. You cannot interpret it without the detection rate, and the detection rate
is a property of the variant list, not of the gene.

</details>

---

## 4. Who your relatives sign up for ★

A national genealogy service holds **600,000** profiles in a population of **40 million**. Use
the exposure model from [Ch 58 §1](../part-12-applications-and-ethics/58-ethics-and-society.md):

P(findable) = 1 − (1 − c)^N

where *c* is the fraction of the population in the database and *N* is an **effective** number of
relatives close enough to leave a detectable IBD segment. Use the chapter's deliberately
conservative **N = 45** unless told otherwise.

**(a)** What fraction of the population is findable, how many people is that, and how many of
them are not customers?
**(b)** The service doubles to 1,200,000 profiles. Recompute. Does exposure double? How many
additional non-customers did each additional customer expose?
**(c)** What coverage would make 95% of the population findable, and how many profiles is that?
**(d)** [Ch 58 §1](../part-12-applications-and-ethics/58-ethics-and-society.md) is blunt that no
single *N* reproduces Erlich et al.'s published results: 60% at ~0.9% coverage needs N ≈ 107, and
>99% at 2% coverage needs N ≈ 228. Recompute (a) at both. Given that the answer moves that much,
what does the model still establish, and what may you not claim with it?

<details><summary>Solution</summary>

**(a)** c = 600,000 / 40,000,000 = **0.015**.

```
P = 1 - (1 - 0.015)^45
  = 1 - exp(45 x ln(0.985))
  = 1 - exp(45 x (-0.0151136))
  = 1 - exp(-0.680114)
  = 1 - 0.506559
  = 0.4934      ->  49.3%
```

People findable = 0.4934 × 40,000,000 = **19,740,000**.
Of those, 600,000 are customers, so **19,140,000 are not**.

**About 32 non-consenting people are exposed per consenting customer.** That ratio, not the
percentage, is the sentence to carry out of this problem.

**(b)** c = 0.03. P = 1 − 0.97^45 = 1 − 0.253938 = **0.7461 → 74.6%**.

Findable = 29,840,000; non-customers among them = **28,640,000**.

Exposure does **not** double. The naive linear answer is 2 × 49.3% = 98.6%, and the truth is
74.6% — because *c* sits in the **exponent**, so the function saturates. Every additional
customer is increasingly likely to expose people already exposed by somebody else's cousin.

Additional non-customers exposed = 28,640,000 − 19,140,000 = **9,500,000**, from 600,000
additional customers = **15.8 each**, against **31.9 each** on average for the first 600,000.
The marginal customer exposes half as many people as the average one, and that number keeps
falling — which is exactly why the harm is front-loaded and why a small database is not a safe
one.

**(c)** Solve 1 − (1 − c)^45 = 0.95:

```
(1 - c)^45 = 0.05
1 - c      = 0.05^(1/45) = exp(ln(0.05)/45) = exp(-2.99573/45) = exp(-0.0665718) = 0.935596
c          = 0.0644   ->  6.44%
```

Profiles = 0.0644 × 40,000,000 = **2,576,000** — about **4.3 times** the current database. To
index 95% of a country you need one person in every 1/0.0644 = **15.5**.

**(d)** Same coverage, three values of *N*:

| *N* | P(findable) at c = 1.5% | Non-customers exposed |
|---:|---:|---:|
| 45 | **49.3%** | 19.1 million |
| 107 | **80.2%** | 31.5 million |
| 228 | **96.8%** | 38.1 million |

The answer spans 49% to 97%. The model does not predict.

*Check the two anchors before trusting either N.* At N = 107 and c = 0.9% the model gives
62.0%, against Erlich's reported "nearly 60%". At N = 228 and c = 2% it gives 99.0%, against
the paper's projected ">99%". Each *N* reproduces the endpoint it was fitted to and neither
reproduces the other, which is the chapter's point: **the functional form is wrong, not merely
the parameter.** Relatives are not independent draws into a database, and detectability decays
with relationship, so no single *N* can hold.

**What survives.** The shape, and it survives at every *N*:

- **Coverage is in the exponent, so exposure saturates fast.** At every *N* in the table, a few
  per cent coverage exposes a large majority.
- **The exposed vastly outnumber the enrolled, at every *N*.** At the *smallest*, most
  conservative *N*, 600,000 people's decision exposes 19 million others — a ratio of 32 to 1.
  Larger *N* makes that worse, never better. **N = 45 is a floor, not an estimate.**
- Therefore the conclusion the chapter draws does not depend on the parameter at all: the unit of
  decision (a person who signs up) and the unit of exposure (their extended family) are different
  objects, so **consent does not have the right shape for this**, and no improvement to the
  consent form changes that.

**What you may not claim.** Any specific percentage as a prediction. Not "60% of this population
is exposed", not "we would need 2.6 million profiles" as an engineering target. Write it as a
bound with the *N* stated, or do not write a number.

**Generalise.** This is the failure mode of every model with a free parameter back-solved from
one endpoint: it will reproduce that endpoint and nothing else. The way to use such a model
honestly is to check whether your *conclusion* is monotone in the parameter over its whole
plausible range. Here it is, which is why the argument holds and the prediction does not.

</details>

---

## 5. Reading a CPIC-style recommendation

[Ch 57 §5](../part-12-applications-and-ethics/57-genomics-in-practice.md) says a diplotype maps
to an activity score and the score maps to a phenotype class. Here are the three **supplied**
tables that make that concrete for *CYP2D6* and codeine.

**Allele activity values**

| Allele | Function | Activity |
|---|---|---:|
| \*1 | normal (reference) | 1.0 |
| \*2 | normal | 1.0 |
| \*4 | no function (splice-disrupting) | 0 |
| \*10 | decreased | 0.25 |
| \*41 | decreased | 0.5 |

A duplication is written `xN` and contributes N copies of that allele's activity.

**Activity score to phenotype**

| Activity score | Phenotype |
|---|---|
| 0 | Poor metaboliser |
| greater than 0, below 1.25 | Intermediate metaboliser |
| 1.25 to 2.25 inclusive | Normal metaboliser |
| above 2.25 | Ultrarapid metaboliser |

**Codeine recommendation**

| Phenotype | Recommendation |
|---|---|
| Ultrarapid | **Avoid codeine.** Risk of respiratory depression. Use a non-codeine, non-tramadol analgesic |
| Normal | Use the standard age- or weight-appropriate dose |
| Intermediate | Use the label dose; if analgesia is inadequate, switch to a non-codeine, non-tramadol analgesic |
| Poor | **Avoid codeine.** Lack of efficacy. Use a non-codeine, non-tramadol analgesic |

Five patients are prescribed codeine after surgery.

| Patient | Diplotype | Other |
|---|---|---|
| A | \*1/\*4 | — |
| B | \*4/\*4 | — |
| C | \*1/\*1x2 | — |
| D | \*4/\*41 | — |
| E | \*1/\*1 | started on a strong *CYP2D6* inhibitor last week |

**(a)** Give each patient's activity score, phenotype and recommendation.
**(b)** Two patients receive the same instruction for opposite reasons. Identify them, state both
reasons, and say why a clinician needs to know which is which.
**(c)** What does the recommendation table, keyed on genotype, get wrong about patient E? Name
the phenomenon.
**(d)** A short-read pipeline that calls SNVs and small indels only is used to generate these
diplotypes. Which patient is misclassified, into what, and what would the clinical consequence be?

<details><summary>Solution</summary>

**(a)** Add the allele activities; look up the band; read off the action.

| Patient | Activity score | Phenotype | Recommendation |
|---|---|---|---|
| A | 1.0 + 0 = **1.0** | Intermediate (0 < 1.0 < 1.25) | Label dose; switch if inadequate |
| B | 0 + 0 = **0** | Poor | **Avoid codeine** |
| C | 1.0 + (1.0 × 2) = **3.0** | Ultrarapid (3.0 > 2.25) | **Avoid codeine** |
| D | 0 + 0.5 = **0.5** | Intermediate | Label dose; switch if inadequate |
| E | 1.0 + 1.0 = **2.0** | Normal *on genotype* | Standard dose — **and this is wrong, see (c)** |

Watch the *CYP2D6* \*1x2 notation: `*1/*1x2` is **three** functional copies, not two. Scoring it
as 2.0 puts the patient in the Normal band and hands them a drug that could kill them.

Watch the band edges too. A score of exactly 1.25 is Normal; 1.24 is Intermediate. A score of
exactly 2.25 is Normal; 2.26 is Ultrarapid. Real diplotypes land on them — \*1/\*10 scores
1.0 + 0.25 = **exactly 1.25**, so it is Normal and not Intermediate — and guessing an edge is how
a lookup table becomes a coin flip. Do not interpolate a published table; read it.

**(b)** **B and C both get "avoid codeine", for opposite reasons.**

- **B (poor metaboliser)**: codeine is a **prodrug** and *CYP2D6* O-demethylates it to morphine.
  B makes almost no morphine, so codeine does nothing. The failure is **no analgesia**.
- **C (ultrarapid, gene duplication)**: C makes morphine fast enough to reach concentrations far
  above the intended exposure. The failure is **respiratory depression** — the mechanism behind
  the deaths in children after tonsillectomy and in breastfed infants of ultrarapid mothers that
  drove the contraindications.

Why the clinician must know which: the *substitute* differs, and so does the monitoring. B needs
an analgesic that does not depend on *CYP2D6* activation, and B's earlier reports that "codeine
doesn't work" were true rather than drug-seeking. C needs the same substitution **and** must not
be given tramadol either, and anyone else in C's family may share the duplication. Same
instruction, different clinical world.

This is the shape [Ch 57 §5](../part-12-applications-and-ethics/57-genomics-in-practice.md)
insists on: **variation in the same enzyme produces opposite failures depending on whether the
enzyme activates the drug or clears it.** Contrast *DPYD* with 5-fluorouracil, where the enzyme
clears an **active** drug, so loss of function means accumulation and toxicity — the opposite
direction from *CYP2D6* loss of function on codeine.

**(c)** The table gives E "standard dose" because E's **genotype** is \*1/\*1, activity 2.0,
Normal. But E is on a strong *CYP2D6* inhibitor, so E's enzyme is inhibited and E behaves as a
**poor metaboliser**: little morphine, no analgesia, and a clinician who concludes the genotype
was wrong.

The phenomenon is **phenoconversion**. The chapter's formulation is the one to keep:
**genotype is not phenotype.** A pharmacogenomic result is a statement about capacity, not about
current activity, and the drug list on the same chart can override it. A decision-support system
that fires on the diplotype alone and ignores concurrent medication will get E wrong every time.

**(d)** **Patient C.** A SNV/indel-only caller cannot see a **whole-gene duplication**: it
observes \*1 alleles and no variants, and returns \*1/\*1, activity 2.0, **Normal metaboliser**.

Consequence: an ultrarapid metaboliser is issued a standard dose of codeine — the exact scenario
that killed children post-tonsillectomy. The mis-call is silent, because the report looks
completely normal.

This is why [Ch 57 §5](../part-12-applications-and-ethics/57-genomics-in-practice.md) singles
*CYP2D6* out as **genuinely hard to genotype**: whole-gene deletions, duplications up to a dozen
copies, and hybrid genes with the neighbouring pseudogene *CYP2D7*. It needs copy-number-aware
calling and, for the hybrids, long reads
([Ch 46](../part-10-functional-genomics/46-variant-calling.md)). Note the asymmetry in the errors
a SNV-only pipeline makes here: it can only ever under-call activity variation toward the
reference, so it turns Ultrarapid into Normal — a false reassurance — rather than the other way
round.

</details>

---

## 6. What GINA does not cover

Six situations, all in the United States unless stated.

| # | Situation |
|---|---|
| 1 | A health insurer raises a premium after obtaining a predictive *BRCA1* result |
| 2 | A life insurer asks for, and underwrites on, the same result |
| 3 | A long-term-care insurer declines an applicant who has a predictive Huntington disease result |
| 4 | An employer with 9 staff withdraws a job offer after learning the applicant's father has Huntington disease |
| 5 | An employer with 400 staff dismisses an employee who has developed symptomatic Huntington disease |
| 6 | A direct-to-consumer genomics company transfers its customer database to an acquirer |

**(a)** For each, say whether GINA Title I, GINA Title II, both or neither applies, and if neither,
name the regime that is actually operating.
**(b)** The strongest empirical argument for letting insurers underwrite on genetic results is
adverse selection. **Supplied:** among 10,000,000 adults, Huntington mutation carriers are 1 in
10,000; 8% of adults hold long-term-care cover; carriers are **five times** as likely to hold it
([Ch 58 §3](../part-12-applications-and-ethics/58-ethics-and-society.md)); and a carrier's
expected claim is 4 units against a non-carrier's 1. Compute the carriers' share of the insurer's
book, their share of its claims, and the premium loading a ban imposes on everyone else.
**(c)** Documented adverse decisions are far rarer than fear of them. Why is that not an argument
that protection is unnecessary? Name the loop.
**(d)** Recompute the loading in (b) if predictive results became routine and 20% of adults held
one. What does the comparison say about the durability of the "adverse selection is small"
finding?

<details><summary>Solution</summary>

**(a)**

| # | Covered by | What is actually operating |
|---|---|---|
| 1 | **GINA Title I** | Health insurers may not use genetic information in eligibility or premiums, and may not require a test. This is the case GINA was written for |
| 2 | **Neither** | Life insurance is outside GINA entirely. In the UK the Code on Genetic Testing and Insurance (2018) bars asking, except Huntington disease on life cover above £500,000; Canada criminalised the demand in 2017; Australia's ban commences October 2026. In most of the US, nothing |
| 3 | **Neither** | Long-term-care insurance is outside GINA — and it is the cover **most directly implicated** by a late-onset neurodegenerative variant, which is what makes this the sharpest gap in the statute. Some US states extend protection; most do not |
| 4 | **Neither** | **Title II does not apply at all to employers with fewer than 15 employees**, so the headcount decides the case however the information is classified. Note also [Ch 58 §3](../part-12-applications-and-ethics/58-ethics-and-society.md)'s separate observation that much of the discrimination people report was triggered by **family history**, which no genetic-privacy statute regulates — so this is the route least reached by law even at a large employer |
| 5 | **Neither** | GINA protects genetic *information*, not people whose disease has manifested. That is ADA territory, with different tests and different remedies |
| 6 | **Neither** | Not GINA, and **not HIPAA** — a DTC genomics company is not a covered entity, so the governing document is a terms-of-service agreement. The 2025 bankruptcy showed what that is worth: **a privacy policy is a contract a company can amend and a court can transfer.** State genetic-privacy statutes are a growing patchwork (Utah's, effective May 2021, was first) and none of them reaches a company incorporated elsewhere |

The pattern: GINA covers one insurer and one employer, and every other row falls to a regime that
either does not exist or was not designed for this.

**(b)** Build the book.

```
  carriers        = 10,000,000 x 1/10,000     =     1,000
  non-carriers    = 10,000,000 - 1,000        = 9,999,000

  carrier uptake  = 5 x 8%                    =      40%
  carrier policies    = 1,000 x 0.40          =       400
  non-carrier policies = 9,999,000 x 0.08     =   799,920
  ---------------------------------------------------------
  total policies                              =   800,320
```

Carriers' share of the book = 400 / 800,320 = **0.050%**, i.e. **1 in 2,001** policyholders —
against 1 in 10,000 of the population, so a **5-fold enrichment**, exactly as advertised.

Claims: 400 × 4 + 799,920 × 1 = 1,600 + 799,920 = **801,520 units** over 800,320 policies.

- Carriers' share of claims = 1,600 / 801,520 = **0.20%**
- Claims per policy = 801,520 / 800,320 = 1.0015, so the **premium loading is 0.15%**

**Both halves of the chapter's sentence are now numbers.** In relative terms the selection is
real and large: a 5-fold enrichment in the book and a 4-fold claim cost. In aggregate market
terms it is negligible: fifteen basis points on the premium. And the reason is in the arithmetic
rather than in anybody's opinion — **carriers are a vanishing fraction of applicants**, so a
large multiple of a tiny number is still a tiny number.

**(c)** Because the low observed rate is **partly produced by the thing protection would
prevent**. People decline testing precisely to keep a result off the record: they forgo
surveillance that would extend their lives, and they decline research participation, degrading
the evidence base for everyone. A discrimination event that never happened because the test was
never taken does not appear in any count of discrimination events.

**The loop, stated plainly:** the aggregate adverse selection in (b) is small *because* few
people have tested; few people have tested *because* the results are underwritable; and the
smallness of the measured selection is then offered as the reason not to change that. Each step
is true and the circle is vicious. You cannot use the 0.15% as evidence about a world in which
testing is normal, because the 0.15% is a measurement of a world in which it is not.

**(d)** Let *f* be the fraction of adults holding an adverse predictive result, with the same
5-fold uptake and 4-fold claim cost. The loading is

loading(f) = f × 5 × 3 / (f × 5 + 1 − f)

| *f* | Premium loading |
|---:|---:|
| 1 in 10,000 (today) | **0.15%** |
| 2% | **27.8%** |
| 20% | **166.7%** |

Check the last one directly: policies = 2,000,000 × 0.40 + 8,000,000 × 0.08 = 800,000 + 640,000 =
1,440,000; claims = 800,000 × 4 + 640,000 = 3,840,000; per policy = 2.667, a loading of 166.7%. ✓

**What the comparison says.** "Adverse selection is empirically small" is not a fact about
genetics; it is a fact about *f*, and *f* is the one quantity the whole field is trying to
increase. The finding is not wrong, it is **conditional on the current rarity of predictive
testing**, and it inverts under exactly the conditions everyone is working toward. Anybody who
quotes the small measured selection in defence of a permanent policy is extrapolating a
measurement outside the range it was taken in.

And underneath all of it sits a question no dataset settles: **whether insurance pools risk or
sorts it.** A society that thinks pooling is the point restricts underwriting on unchosen
characteristics; one that thinks sorting is the point does not. Both are coherent. The
arithmetic tells you the price of each; it does not tell you which to buy.

</details>

---

## 7. What a polygenic score tells one person, and what it does not ★★

**Part A — the clinic.** A patient is told: *your polygenic score for this disease is in the top
2% of the distribution, which carries **3 times** the population-average lifetime risk.* The
disease has a lifetime prevalence of **10%**.

**(a)** Convert that into the three numbers the patient should be given, and the one number the
clinic did not mention.
**(b)** A colleague proposes offering a preventive intervention to everyone in the top 2%. What
does (a) say about the ceiling on that programme's benefit?
**(c)** The patient's genome most resembles African-ancestry reference populations; the score was
trained in European-ancestry biobanks. Which quantity in (a) becomes untrustworthy first, and by
what mechanisms? Is this a statement about the patient?

**Part B — the clinic that sells embryos.** A couple has **5** viable embryos from one IVF cycle
and is offered selection on a polygenic score for adult height. **Supplied:**

| Quantity | Value |
|---|---|
| Standard deviation of the trait in the population | 7 cm |
| Correlation between the score and the trait, estimated **between families** | 0.50 |
| Standard deviation of the score **among full siblings**, relative to its population SD | 1 / sqrt(2) ≈ 0.707 |
| E[maximum of *n* independent standard normal draws] | n=1: 0.00 · n=2: 0.56 · n=3: 0.85 · n=4: 1.03 · n=5: 1.16 · n=10: 1.54 |
| Correlation between score and trait **within a sibship** | 0.30 |

Embryo scores may be treated as independent draws about the parental mean (independent meioses).

**(d)** Compute the expected height gain from picking the top-scoring of the 5, first using the
between-family correlation and then the within-family one. How much would 10 embryos buy? Then
list which of [Ch 58 §8](../part-12-applications-and-ethics/58-ethics-and-society.md)'s four
objections your calculation has and has not accounted for.

<details><summary>Solution</summary>

**(a)** Three numbers to give her, one she was not given.

1. **Absolute lifetime risk: 3 × 10% = 30%.** A relative risk without a baseline is not
   information.
2. **Absolute increase: 20 percentage points** (30% against the 10% population average).
3. **70% of people in the top 2% never develop the disease.** The single most likely outcome for
   this patient, on this score, is that nothing happens.

And the number the clinic did not mention — **what share of all cases the top 2% actually
contains**:

```
  cases arising in the top 2%   = 0.02 x 0.30 = 0.0060
  cases in the whole population =               0.1000
  share                         = 0.006/0.10  = 6%
```

**94% of all cases occur outside the top 2%.** Both facts are true simultaneously: this group is
at genuinely elevated risk, *and* it is nearly irrelevant to where the disease actually comes
from. Consistency check: the other 98% carry 0.094 of the risk mass over 0.98 of the people, an
average risk of **9.59%** — so the top 2% is 30/9.59 = **3.13 times** the risk of everyone else,
slightly more than the 3× quoted against the population average, which includes them.

**(b)** The programme's ceiling is **6% of cases**, because that is all the top 2% contains. Even
a perfectly effective intervention, perfectly delivered, with perfect adherence, prevents at most
six cases in a hundred while touching 2% of the population.

This is the general shape of risk stratification on a common disease and it is not a defect of
this particular score: **most cases arise in the large middle of the distribution, where each
individual's risk is unremarkable.** A screening programme aimed at an extreme tail has a small
ceiling by construction, and the comparison a health system needs is against a population-wide
measure that moves everyone's risk a little. Nothing in (a) argues the score is uninformative for
*this patient*; it argues that "informative for an individual" and "useful as a policy instrument"
are different properties, and the second does not follow from the first.

**(c)** **The percentile goes first** — before the relative risk, before the absolute risk.
"Top 2%" is a statement about where the patient falls in a *distribution*, and the distribution
that was measured is the training cohort's. The mechanisms, all from
[Ch 58 §6](../part-12-applications-and-ethics/58-ethics-and-society.md):

- The GWAS found **tag SNPs, not causal variants**, and LD between tag and causal variant
  differs between populations, so the tag stops tagging
  ([Ch 29](../part-05-population-genetics/29-linkage-disequilibrium.md)).
- **Allele frequencies differ**, so each variant explains a different share of variance, and the
  score's own variance — the denominator of the percentile — is different.
- The **effect estimates absorb stratification and indirect genetic effects** that do not
  transfer.
- **Environments and their interactions differ.**

A score developed in European-ancestry samples can lose most of its predictive value in
African-ancestry individuals. So the honest report is not "top 2%, 30% risk"; it is that the
score's calibration in this patient's ancestry is unestablished, and both the percentile and the
risk attached to it are unreliable — with the direction of the error unknown, which is worse than
a known bias.

**Is this a statement about the patient?** No. It is a statement about **who was sampled**.
Portability failure is caused by biased training data and by LD structure, and the asymmetry
reverses: train the score in an African-ancestry cohort of equivalent size and it works there and
transfers poorly the other way. This is the same lesson as Ch 57's cattle-versus-humans contrast
— identical estimator, different study design — and it is fixed by sampling differently, not by
any claim about biology.

**(d)** Work in units of the score's population SD, then convert.

**Step 1 — how far above the sibling mean is the best of 5?** The embryos' scores are independent
draws about the parental mean with SD 0.707 population SDs. The best of 5 standard normal draws
sits 1.16 SDs above the mean, so:

best-of-5 advantage = 1.16 × 0.707 = **0.820 population score SDs**

**Step 2 — convert score to trait.** With a standardised score *S* and trait *Y* correlated at
*r*, E[Y | S = s] = r·s.

Between-family r = 0.50: expected gain = 0.50 × 0.820 = **0.410 trait SDs = 0.410 × 7 cm =
2.9 cm**

That is the marketable number, and it matches the chapter's "on the order of a few centimetres
of height".

**Step 3 — use the right correlation.** The weights were estimated **between families**, and the
selection happens **within one**. With r = 0.30:

expected gain = 0.30 × 0.820 = 0.246 trait SDs = **1.7 cm** — 60% of the headline figure.

**Step 4 — buy more embryos?** Best of 10 sits 1.54 × 0.707 = 1.089 SDs above the mean, giving
0.544 trait SDs = **3.8 cm** at r = 0.50. **Doubling the number of embryos from 5 to 10 buys
0.9 cm.** The order statistic grows roughly like the square root of the logarithm of *n*; there
is no number of embryos that turns this into a large effect, which is the quantitative content of
"the variance available is within-family".

**Which objections the calculation covers.** Of the four in
[Ch 58 §8](../part-12-applications-and-ethics/58-ethics-and-society.md):

| Objection | In the calculation? |
|---|---|
| 1. The variance available is **within-family** | **Yes** — the 1/sqrt(2) factor and the order statistic are exactly this |
| 2. Weights estimated **between families**, applied **within** one | **Yes** — Step 3, the drop from 0.50 to 0.30 |
| 3. **Pleiotropy** — selecting on one score moves every genetically correlated trait | **No.** Nothing above touches it. The 1.7 cm is a gain in one dimension of an unknown-dimensional move |
| 4. **Portability** — every problem in Part A applies to every embryo whose ancestry differs from the training cohort's | **No.** The r values are stipulated; in a mismatched embryo they are unknown and lower |

So the calculation is an **upper bound under favourable assumptions**, not an estimate. The
honest summary for the couple: about 1.7 cm in expectation under assumptions chosen to flatter
the method, against a population SD of 7 cm — a quarter of a standard deviation — with two of the
four known objections not yet priced in at all, on an uncertain causal model.

**Generalise, and note what the argument is not.** Every step here came from statistics, not from
an ethical premise. That matters for problem 8: PGT-P is weak for reasons that could in principle
change with better data — sibling-design GWAS, calibrated within-family weights — whereas the
objections to, say, heritable germline editing are ones **better technique does not answer**.
Knowing which kind of objection you are making is the difference between an argument and a
position.

</details>

---

## 8. The strongest version of a position you rejected

[Ch 58](../part-12-applications-and-ethics/58-ethics-and-society.md) states repeatedly that where
a disagreement is genuine it gives both sides their strongest form. This problem asks you to do
it, and it is not an invitation to opine: each part has a required structure and a checkable
answer.

Below are three claims. **Assume you accept all three** — they are the positions Part 12 will
most likely have left you holding.

| | Claim |
|---|---|
| **I** | Forensic investigative genetic genealogy should require judicial authorisation, because it searches non-consenting third parties |
| **II** | Insurers should be barred from underwriting on predictive genetic test results |
| **III** | Embryo selection on polygenic scores should not be offered clinically |

**(a)** For **each** claim, write the strongest opposing case in three or four sentences. It must
be one a competent advocate would actually make, must use the chapter's own facts and numbers,
and must not be a position the chapter has already shown to be defective.
**(b)** For each, name the **single premise** the opposing case must defeat for the original claim
to fall. Not a list — one premise each.
**(c)** For each, state what evidence, if it existed, would move you. If the honest answer is
"none, because the disagreement is not empirical", say so and say why.
**(d)** One of these three is an empirical disagreement wearing ethical clothes, and two are
value disagreements wearing empirical clothes. Which is which, and what does the misclassification
cost in practice?

<details><summary>Solution</summary>

**(a)** Three steelmen. Note that a steelman is not a summary of what opponents say; it is the
best available version, which often nobody has bothered to state.

**Against I (require judicial authorisation for FIGG).** The exposure is a property of IBD, not
of police procedure: at the coverage levels of problem 4 a large fraction of the population —
on the larger fitted values of *N*, the overwhelming majority — is already indexed through
relatives whether or not any warrant is ever issued.
A warrant requirement therefore does not un-expose a single person — it rations access to an
exposure that already exists, and rations it against the one use with an unambiguous public
benefit, since hundreds of cold cases have been closed and wrongly convicted people exonerated.
Meanwhile every conventional investigative technique — canvassing, phone records, informants —
also implicates non-consenting third parties without their notice, so singling out this one
requires an argument that genetic information is different in kind, not merely in scale, and that
argument has to be made rather than assumed.

**Against II (bar genetic underwriting).** Voluntary insurance is priced on symmetric
information; if applicants may know their genotype and insurers may not ask, high-risk applicants
buy more cover at pooled prices and low-risk applicants buy less. This is not hypothetical:
Huntington mutation carriers are **up to five times** as likely as the general population to hold
long-term-care cover, and Oster and colleagues argue that even a modest expansion of genetic
information could threaten that market's viability — which is precisely the coverage the
statutory gap leaves unprotected. A ban is therefore not neutral fairness but an unstated,
unlegislated transfer from low-risk to high-risk purchasers, and problem 6(d) shows the transfer
is small only for as long as testing stays rare, which is not a state anybody is defending.

**Against III (do not offer PGT-P).** The expected gain computed in problem 7(d) is small but it
is **not zero**, and "small" is not a category that ordinarily licenses prohibition — PGT-A is
sold routinely on evidence [Ch 57 §4](../part-12-applications-and-ethics/57-genomics-in-practice.md)
calls equivocal for live birth per cycle started, and reproductive autonomy is a strong and widely
shared commitment. The objections in
[Ch 58 §8](../part-12-applications-and-ethics/58-ethics-and-society.md) are objections to the
*magnitude and reliability* of the effect, which is an argument for mandatory disclosure of the
magnitude — 1.7 cm, two objections unpriced — rather than for withholding the choice. A rule that
prospective parents may not buy a service because a professional society judges the expected
benefit too small is a paternalism that would not survive being stated in any other area of
reproductive medicine.

**(b)** The single load-bearing premise in each case.

| Claim | The premise the opposing case must defeat |
|---|---|
| **I** | That a search which imposes a cost on identifiable non-consenting people requires authorisation **even when the exposure enabling it already exists**. If exposure alone extinguishes the interest, claim I falls |
| **II** | That insurance ought to **pool** risk on unchosen characteristics rather than sort it. Every actuarial fact in the world is compatible with claim II if this premise holds, and claim II falls the moment it does not |
| **III** | That **an intervention with small, poorly characterised expected benefit and unquantified correlated effects should not be sold** as a clinical service. If disclosure is a sufficient remedy for uncertainty, claim III falls |

The discipline here is the point: if you cannot name one premise, you have not understood your
own position well enough to defend it, and you will find yourself arguing about the numbers when
the numbers were never what you disagreed about.

**(c)** What would move you.

**I — mostly no.** Empirical work could narrow the edges: how many cases are actually closed,
how often the technique produces a wrong lead, how unevenly the exposure falls across a
population — [Ch 57 §8](../part-12-applications-and-ethics/57-genomics-in-practice.md) says it
is uneven, and says the related technique of familial searching inherits offender databases'
over-representation of some communities. But the core is a
question about whether a person retains an interest in information they cannot control, and no
dataset answers it. Note the trap in the opposing case: "the exposure already exists" is a fact
about the world that arrived through a sequence of unreviewed product decisions
([Ch 58 §2](../part-12-applications-and-ethics/58-ethics-and-society.md)), so treating it as a
given is treating the outcome of the disputed process as the premise of the argument.

**II — the empirical half is settleable and has been settled; the disagreement is not.** How
large adverse selection is, is measurable, and problem 6 measures it: 0.15% today, 28% at
*f* = 2%, 167% at *f* = 20%. What no measurement touches is whether a market that sorts on
unchosen characteristics is the right institution. The chapter is explicit that the same
unresolved disagreement sits under every debate about pre-existing conditions, and that is the
tell: a dispute that recurs identically across unrelated policy domains is not waiting on data
from any one of them.

**III — yes, genuinely.** This one is empirical almost all the way down. Within-sibship GWAS at
scale would pin the within-family correlation that problem 7 had to be handed. Long-term outcome
data on children selected this way would price pleiotropy. Ancestry-diverse training cohorts
would fix portability. If those data came back favourable the calculation changes and so should
the recommendation — and if they came back unfavourable the case closes. Nothing about claim III
rests on a value premise that data cannot reach, which is exactly why the chapter says PGT-P is
weak "for reasons that follow from the statistics, not from any ethical premise".

**(d)** **III is the empirical disagreement wearing ethical clothes. I and II are value
disagreements wearing empirical ones.**

What the misclassification costs, in both directions:

- **Treating a value disagreement as empirical (I and II)** produces an endless demand for more
  studies as a substitute for making a decision, and it lets whichever side currently controls
  the data-collection agenda set the default by delay. It also produces bad-faith argument: if
  the real disagreement is pooling versus sorting, then arguing about the size of adverse
  selection is arguing about something neither party would change their mind over, which is how
  a debate runs for twenty years without moving.
- **Treating an empirical disagreement as ethical (III)** is the more expensive error, because it
  is self-sealing. Framing PGT-P as a values question means the studies that would settle it are
  never prioritised, the professional-society position hardens into a norm rather than a reading
  of the evidence, and the market — which
  [Ch 58 §8](../part-12-applications-and-ethics/58-ethics-and-society.md) notes exists anyway —
  fills the space with claims nobody is measuring. A recommendation that is really about
  effect size should be *stated* as being about effect size, so that it can be revisited when the
  effect size is known.

**Generalise.** Before entering any argument in this chapter, ask which kind it is. If new data
would change your position, say what data. If none would, say that, and argue about the premise
instead. Almost all of the heat in this field comes from people making value arguments in the
vocabulary of evidence, and both sides usually do it at once.

</details>

---

## Where you went wrong

| Error pattern | What to re-read |
|---|---|
| Read a sensitivity or specificity as the probability the result is right | Problem 1(a) — accuracy is conditional on disease status, PPV on the result |
| Bought sensitivity when specificity was the constraint | Problem 1(c) — 0.07 points against 14.4 |
| Applied PPV ≈ prevalence × sensitivity / FPR outside its range | Problem 1(d) — it needs prevalence far below FPR/sens, and announces failure by exceeding 1 |
| Used the penetrance from ascertained families as the PPV of a population screen | Problem 2(a) — 90% claimed, 10% true |
| Used the genotype-positive count as the disease prevalence | Problem 2(b) — the biochemical screen's denominator is cases, not carriers |
| Assumed more sensitive screening is better screening without pricing the false positives | Problem 2(c) — 0.4 extra cases for 170 extra false positives |
| Compared carrier frequencies as denominators rather than decimals | Problem 3(a) |
| Predicted a 10-fold risk reduction from a 90% detection rate | Problem 3(c) — the couple's risk is a square, so it is 97-fold |
| Heard "negative" as "not a carrier" | Problem 3(d) — a negative is a likelihood ratio and needs the detection rate |
| Expected exposure to scale linearly with database size | Problem 4(b) — coverage is in the exponent; the marginal customer exposes half as many as the average one |
| Quoted a findability percentage as a prediction | Problem 4(d) — 49% to 97% on the same coverage; N = 45 is a floor |
| Scored *1/*1x2 as two functional copies | Problem 5(a) — it is three, activity 3.0, Ultrarapid |
| Read "avoid codeine" as one clinical situation | Problem 5(b) — no analgesia and respiratory depression are opposite failures |
| Took a genotype-keyed recommendation as a phenotype | Problem 5(c) — phenoconversion |
| Assumed GINA covers genetic discrimination | Problem 6(a) — not life, disability or long-term-care cover, not employers under 15, not once disease has manifested, not a DTC company |
| Cited "adverse selection is small" as a permanent finding | Problem 6(d) — 0.15% at *f* = 1 in 10,000, 167% at *f* = 20% |
| Reported a relative risk without a baseline | Problem 7(a) — 3× means 30%, and 70% of that group stay well |
| Assumed a high-risk tail is where the cases are | Problem 7(b) — the top 2% holds 6% of cases |
| Trusted a percentile in an ancestry the score was not trained in | Problem 7(c) — the percentile fails before the risk does |
| Used a between-family effect estimate for a within-family choice | Problem 7(d) — 2.9 cm becomes 1.7 cm, and two objections are still unpriced |
| Answered an ethical prompt with a verdict instead of the opposing argument | Problem 8(a)–(b) — name the premise, not the conclusion |
| Demanded more data for a disagreement no data can settle | Problem 8(d) — and neglected the data for the one it could |
