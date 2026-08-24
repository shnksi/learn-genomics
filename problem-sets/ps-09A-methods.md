# Problem set 09A — Methods

Covers [Ch 36–38](../part-08-methods/36-core-molecular-methods.md).

**Attempt before revealing.** Methods chapters read easily and are almost never *understood*
easily, because the understanding lives in the arithmetic: how much product 30 cycles actually
makes, which fragments a digest actually produces, what a fold change actually is once the two
assays have different efficiencies, and how many cells a screen actually needs. Almost every
problem here is built around a headline number that means something different from what it
appears to mean — a 62% editing efficiency, a 5.3-fold induction, a "saturated" screen, a
library that is "complete". Problems 3, 7 and 8 in particular have answers that are smaller,
messier and more honest than the numbers a paper would print.

---

## 1. Thirty cycles of PCR, counted honestly

Use the strand bookkeeping of [Ch 36 §3](../part-08-methods/36-core-molecular-methods.md):
starting from one double-stranded template (so `T` = 2 strands), after *n* cycles

```
T_n = 2                       strands with both ends undefined
M_n = 2n                      strands with one primer-defined end
S_n = 2^(n+1) − 2n − 2        strands defined at both ends (the amplicon)
```

For parts (b) and (c), treat the reaction as purely exponential — ignore the plateau — and use
`N_n = N_0 (1 + E)^n` with per-cycle efficiency *E*.

**(a)** After 10 cycles, how many strands have both ends defined, how many strands are there in
total, and what fraction of the reaction is the clean product?
**(b)** A reaction starts from *N*₀ = 50 template molecules. Compute the yield after 30 cycles at
*E* = 0.95 and at *E* = 1.00. What does a 5-percentage-point efficiency shortfall cost?
**(c)** How many cycles are needed to reach 10^12 copies from a single molecule at *E* = 1.00, and
at *E* = 0.90?
**(d)** Two tubes are seeded with 10 and 10^6 copies of the same target, run for 40 cycles, and
give bands of indistinguishable intensity on a gel. What have you learned about the two samples?

<details><summary>Solution</summary>

**(a)** Substitute *n* = 10:

```
S_10 = 2^11 − 2(10) − 2 = 2048 − 20 − 2 = 2026
T_10 + M_10 = 2 + 20 = 22
total = 2 + 20 + 2026 = 2048 = 2^11
```

The total is always exactly 2^(n+1) — every strand present templates exactly one new strand each
cycle, so the strand count doubles no matter what kind of strand it is. That is a useful check on
the algebra: `2 + 2n + (2^(n+1) − 2n − 2) = 2^(n+1)` identically.

Clean product = 2026/2048 = **0.98926, i.e. 98.9%**.

At 30 cycles the undefined-end species are `2 + 60 = 62` strands out of 2^31 = 2,147,483,648, a
fraction of **2.9 × 10^-8**. This is why a PCR band is a single sharp line rather than a smear:
the run-off species are still there, but they grow *linearly* (`M_n = 2n`) while the amplicon
grows exponentially, and over thirty cycles the exponential wins by log₁₀(2^31/62) = **7.5 orders
of magnitude**.

**(b)** Plug in.

```
E = 1.00 :  N = 50 × 2.00^30 = 50 × 1.073742 × 10^9 = 5.369 × 10^10
E = 0.95 :  N = 50 × 1.95^30 = 50 × 5.023869 × 10^8 = 2.512 × 10^10
```

Ratio = 2.512/5.369 = **0.468**, so 95% efficiency yields **53.2% less** product than perfect
doubling. Equivalently, log₂(1/0.468) = **1.10 cycles' worth of doubling lost** over the run.

The lesson is not that 53% is a lot — for a gel it is nothing, both tubes give a bright band. The
lesson is the *mechanism*: efficiency enters as a base raised to the cycle number, so small
per-cycle differences compound silently. Hold that thought for problem 3, where a per-cycle gap of
exactly this size between two assays is the entire error in a published fold change.

**(c)** Solve (1+*E*)^n = 10^12, i.e. *n* = 12/log₁₀(1+*E*).

```
E = 1.00 :  n = 12/0.30103 = 39.86  →  40 cycles
E = 0.90 :  n = 12/0.27875 = 43.05  →  44 cycles
```

**Four extra cycles** to cover a 10% efficiency deficit. Check: 1.9^43 = 9.69 × 10^11 (just
short), 1.9^44 = 1.84 × 10^12 (over). This is the honest shape of the trade — efficiency losses
cost cycles logarithmically, not catastrophically, which is exactly why a mediocre reaction still
produces a visible band and you never notice it is mediocre.

**(d)** **Nothing whatsoever about how much template each tube contained.**

Under pure exponential growth the endpoint ratio would be 10^6/10 = **10^5**, a difference you
could not miss. You observe a ratio of 1. So the reaction is not exponential at cycle 40: it has
**plateaued**. Product strands reanneal to each other faster than primers can find them, primers
and dNTPs deplete, and the polymerase accumulates thermal damage — so endpoint yield converges on
a value set by the reagents, not by the input.

The wrong conclusion, and it is a common one: "the two samples contain similar amounts of
target". Endpoint PCR is a **presence/absence** assay. The information about *N*₀ lives entirely
in the exponential phase, which is precisely why qPCR reports a *cycle* (problem 3) and why
digital PCR throws the yield away and counts partitions instead.

</details>

---

## 2. Reading a digest, and the constraint that killed restriction cloning

A cloning vector is a **4,000 bp circle**, coordinates 1–4000. It has exactly one EcoRI site
(cutting between positions 1000 and 1001) and exactly one SmaI site (cutting between 2200 and
2201). The EcoRI site sits inside *lacZ*α, so blue-white screening works.

The insert is a **1,500 bp fragment with EcoRI ends**. Numbering its top strand 1–1500 as drawn,
it carries a single internal SmaI site between positions 400 and 401.

*Conventions:* ignore the four-base 5' overhangs — treat every cut as occurring at a single
coordinate, and count fragment lengths as coordinate differences, so lengths always sum to the
total. Both EcoRI (`GAATTC`) and SmaI (`CCCGGG`) are 6-bp cutters.

**(a)** The vector is cut with EcoRI and the insert ligated in. What are the sizes of the
recombinant plasmid, and what does an EcoRI digest of it give?
**(b)** The insert can go in either way round. Work out the SmaI digest pattern for each
orientation, and say whether a gel can tell them apart.
**(c)** A white colony gives the expected EcoRI pattern, but SmaI gives a **single band at
5,500 bp**. What happened, and what does this say about reading gels?
**(d)** Estimate the probability that a randomly chosen 1,500 bp insert contains at least one
EcoRI site; then the probability it is free of *both* EcoRI and SmaI sites. Repeat for a 3,000 bp
insert. What does this tell you about restriction cloning as a design method?

<details><summary>Solution</summary>

**(a)** Recombinant plasmid = 4,000 + 1,500 = **5,500 bp**.

It now has **two** EcoRI sites — one regenerated at each junction — so an EcoRI digest cuts a
circle in two places and returns two fragments: **4,000 bp and 1,500 bp** (sum 5,500 ✓). That
is the expected diagnostic, and it establishes that a 1,500 bp EcoRI fragment is present.

Note what blue-white screening has already established and what it has not. A white colony means
*lacZ*α is disrupted, i.e. *something* went in. It says nothing about what, how many copies, or
which way round.

**(b)** After EcoRI digestion the vector is a 4,000 bp **linear** molecule whose SmaI site sits
2200 − 1000 = **1,200 bp** from one end and 4000 − 1200 = **2,800 bp** from the other. The linear
insert's SmaI site sits **400 bp** from one end and 1500 − 400 = **1,100 bp** from the other.

Circularising joins each vector end to one insert end, and the two SmaI sites cut the circle into
two arcs. Each arc is (a vector arm) + (an insert arm):

```
Orientation A — insert's 400 bp arm joins the vector's 1,200 bp arm

    1200 + 400  = 1,600 bp
    2800 + 1100 = 3,900 bp        sum 5,500 ✓

Orientation B — insert flipped

    1200 + 1100 = 2,300 bp
    2800 + 400  = 3,200 bp        sum 5,500 ✓
```

**Yes, a gel resolves them.** 1,600 versus 2,300 differ by 44%, and 3,900 versus 3,200 by 22%;
agarose resolves a few percent of length in this range. The generalisable trick: an orientation
test needs a cutter that is **asymmetric with respect to both the vector and the insert**. Had
the vector's SmaI site sat at position 3000 — equidistant from the EcoRI site in both directions
around the 4,000 bp circle — both orientations would give the same pair of fragments and the
digest would be useless.

**(c)** A circle cut **once** linearises and gives one band at full length. A single 5,500 bp band
therefore means the plasmid contains exactly **one** SmaI site — the vector's. The insert's SmaI
site is absent, so **the 1,500 bp fragment is not the intended insert**.

Plausible culprits: a different EcoRI fragment of coincidentally similar size ligated in; two
smaller fragments ligated head to tail; a rearranged or partially deleted insert.

The lesson is the one Ch 36 states flatly: **a band of the right size confirms a length, not an
identity.** Correctly sized wrong products are common — this is the same failure mode as a
SYBR Green qPCR signal from a primer-dimer, and the same reason a Western band at the expected
molecular weight is not validation. Identity requires a sequence-specific probe, a diagnostic
digest that interrogates internal sequence, or sequencing. In practice you sequence the whole
plasmid.

**(d)** A 6-bp cutter cuts on average every 4^6 = **4,096 bp**, so in *L* bp of random sequence the
expected number of sites is λ = *L*/4096. Sites are rare events over very many positions, so the
count is Poisson ([S2 §2](../part-S-statistics/S2-distributions.md)) and

```
P(at least one site) = 1 − e^(−λ)
```

```
L = 1500 :  λ = 1500/4096 = 0.366   P(≥1) = 1 − e^−0.366 = 0.307  →  30.7%
L = 3000 :  λ = 3000/4096 = 0.732   P(≥1) = 1 − e^−0.732 = 0.519  →  51.9%
```

Free of **both** enzymes needs zero sites of each; the two site types are independent, so the
total rate is 2λ:

```
L = 1500 :  P(clean for both) = e^(−2 × 0.366) = e^−0.732 = 0.481  →  48.1%
```

So **a coin flip decides whether your favourite enzyme pair is even usable on a 1.5 kb insert**,
and by 3 kb a single 6-bp cutter is more likely than not to appear inside it. Now recall that
restriction cloning also needs those sites present in a usable arrangement in the vector, the two
enzymes compatible in buffer and temperature, and the scars tolerable — and that the whole
constraint set must be re-solved for every new construct, with no guarantee a solution exists.
Adding a third fragment squares the difficulty.

The obvious escape is a rarer cutter: NotI is 8 bp, so λ = 1500/65,536 = 0.023 and only **2.3%**
of 1.5 kb inserts contain one. But rare cutters are rare in the vector too, and NotI's `GCGGCCGC`
is rarer still in vertebrate DNA because CpG is depleted — you have traded one scarcity for
another.

This is exactly the constraint Gibson and Golden Gate remove. Gibson specifies junctions as
20–40 nt of designed overlap carried on the PCR primers, so there is **no sequence constraint on
the insert at all**. Golden Gate uses Type IIS enzymes that cut outside their recognition site, so
*you* choose the four-base overhang and the cut removes the site — making correct products
non-substrates, which is what lets one tube run cutting and ligation simultaneously and assemble
twenty fragments in defined order. Both moved specificity from a fixed enzyme alphabet to
arbitrary designed sequence, and the calculation above is why that mattered.

</details>

---

## 3. ΔΔCt when the efficiencies do not match

You are testing whether a treatment induces target gene *T*, normalising to reference gene *ACTB*.
Both assays are first run on a tenfold dilution series of a plasmid standard:

| Standard (copies) | Ct, *T* | Ct, *ACTB* |
|---|---|---|
| 10^6 | 17.10 | 15.40 |
| 10^5 | 20.85 | 18.73 |
| 10^4 | 24.60 | 22.06 |
| 10^3 | 28.35 | 25.39 |

Then the samples:

| | Ct, *T* | Ct, *ACTB* |
|---|---|---|
| control | 26.40 | 22.10 |
| treated | 23.55 | 22.00 |

*Conventions:* the standard curve regresses Ct on **log₁₀(copies)**, so the slope *m* is in cycles
per tenfold dilution and *E* = 10^(−1/*m*) − 1. ΔCt = Ct(target) − Ct(reference); ΔΔCt =
ΔCt(treated) − ΔCt(control); fold change = 2^(−ΔΔCt).

**(a)** Compute the slope and efficiency of each assay. Is the *E* = 1 assumption behind ΔΔCt
justified?
**(b)** Compute the fold change by ΔΔCt anyway.
**(c)** Derive an efficiency-corrected fold change from `N_0 ∝ (1+E)^(−Ct)`, compute it, and say
by how much ΔΔCt was wrong and in which direction.
**(d)** Digital PCR on the same cDNA shows that *ACTB* itself rose 1.40-fold with treatment. What
is the true induction of *T*?

<details><summary>Solution</summary>

**(a)** The Ct values are evenly spaced, so the slope is the common difference per decade.

```
ACTB :  differences 3.33, 3.33, 3.33
        m = (25.39 − 15.40)/(3 − 6) = 9.99/(−3) = −3.330
        E = 10^(1/3.330) − 1 = 10^0.30030 − 1 = 1.99664 − 1 = 0.997   (99.7%)

T    :  differences 3.75, 3.75, 3.75
        m = (28.35 − 17.10)/(3 − 6) = 11.25/(−3) = −3.750
        E = 10^(1/3.750) − 1 = 10^0.26667 − 1 = 1.84785 − 1 = 0.848   (84.8%)
```

The ideal slope is −1/log₁₀2 = **−3.32**. *ACTB* is essentially perfect. The target assay is at
**−3.75**, which is 85% efficiency — it is **not doubling**, and the *E* = 1 assumption behind
ΔΔCt is false for one of the two assays.

Do not skip this step. Ch 36 is blunt about it: ΔΔCt without a validated standard curve is a
number with no defined meaning. The standard curve is not a calibration you can borrow from the
last experiment; it is the licence to use the formula at all.

**(b)** Mechanically:

```
control :  ΔCt = 26.40 − 22.10 =  4.30
treated :  ΔCt = 23.55 − 22.00 =  1.55
ΔΔCt    =  1.55 − 4.30 = −2.75
fold    =  2^(−ΔΔCt) = 2^2.75 = 6.73
```

"*T* is induced 6.7-fold." This is the number that would appear in the figure.

**(c)** Start from what the chapter actually derives. Fluorescence crosses threshold when copies
reach a fixed value, so `N_0 ∝ (1+E)^(−Ct)` — the base is (1+*E*), not 2, and the base is
**per assay**. A gene's fold change between conditions is therefore

```
fold(gene) = (1 + E_gene)^(Ct_control − Ct_treated)
```

and normalising the target to the reference divides one by the other:

```
                (1 + E_T)^ΔCt_T
fold change  =  ---------------          ΔCt_T   = Ct_T(control)    − Ct_T(treated)
                (1 + E_R)^ΔCt_R          ΔCt_R   = Ct_R(control)    − Ct_R(treated)
```

which is the Pfaffl formula, and it collapses to 2^(−ΔΔCt) when both efficiencies are 1. Note the
sign: ΔCt here is control **minus** treated, so a target that starts later in control and earlier
in treated gives a positive exponent and a fold change above 1.

```
ΔCt_T = 26.40 − 23.55 = 2.85
ΔCt_R = 22.10 − 22.00 = 0.10

numerator   = 1.84785^2.85 = 5.754
denominator = 1.99664^0.10 = 1.072

fold change = 5.754/1.072 = 5.37
```

**5.37-fold, not 6.73** — ΔΔCt overstated the induction by a factor of 1.25, i.e. **25.3%**.

The direction is not random and it is worth being able to predict without computing. ΔΔCt assumed
the target assay doubles every cycle when it actually multiplies by 1.85. Each cycle of ΔCt is
therefore credited with more amplification than really occurred, so **an under-efficient target
assay makes an induction look bigger than it is**. (Reverse the situation — an under-efficient
*reference* — and the bias flips.) And the error compounds with ΔCt, because it is a ratio of two
different bases raised to the same exponent:

| ΔCt_T | naive 2^−ΔΔCt | corrected | ratio |
|---|---|---|---|
| 1 | 1.87 | 1.72 | 1.08 |
| 2 | 3.73 | 3.19 | 1.17 |
| 2.85 | 6.73 | 5.37 | 1.25 |
| 5 | 29.9 | 20.1 | 1.49 |
| 10 | 955 | 433 | 2.21 |

A 2-cycle effect is 17% wrong; a 10-cycle effect is off by more than twofold. The bigger the
effect you are excited about, the more the mismatch costs you.

**(d)** ΔΔCt does not measure the target. It measures the **ratio** target/reference, and calls it
the target's abundance. If the reference genuinely rose 1.40-fold, then

```
measured ratio change = 5.37 = (true T fold) / (true ACTB fold) = (true T fold)/1.40
true T fold = 5.37 × 1.40 = 7.52
```

So *T* is really up **7.5-fold**, and the published 6.73 was wrong twice, in opposite directions,
partially cancelling — 6.73 against a truth of 7.52 is a 10.5% understatement, which looks
reassuringly small and is an accident.

This is the compositional-data problem in miniature, and it is the deeper of the two assumptions.
Efficiency mismatch is detectable from data you already have (part (a)); reference-gene drift is
**not detectable from the qPCR at all**, because every quantity in the calculation is a
difference of Ct values and any change common to both genes cancels by construction. Detecting it
needs an external absolute measurement — digital PCR counting partitions, or a spike-in — which
is exactly the argument for dPCR in Ch 36 §4, and the same problem returns at full scale as
normalisation in RNA-seq. The observation that *ACTB* moved only 0.05–0.10 cycles between
conditions is *not* evidence that it is stable: it demonstrates the stability of *ACTB relative to
itself*, which is a tautology.

</details>

---

## 4. Two routes to the same gene

A *C. elegans* process has never been screened. You may run either:

- **Forward** — EMS mutagenesis, F2 clonal screen. Each F1 hermaphrodite descends from one
  mutagenised gamete and self-fertilises, so its brood segregates 1/4 homozygous at any
  mutagenised locus. You clone F2 animals to individual plates and score their F3 broods.
- **Reverse** — RNAi by feeding, one bacterial clone per gene, against all ~20,000 *C. elegans*
  protein-coding genes.

**(a)** How many F2 animals must be cloned from a given F1 line to be 95% sure of recovering a
homozygote? For 99%?
**(b)** You want to screen 20,000 mutagenised haploid genomes at 95% confidence per line. How
many F2 clones is that, and how does it compare with the number of assays in the reverse screen?
**(c)** Five genes contribute to the process. For each, say whether the forward screen, the
reverse RNAi screen, both, or neither would find it.

| | Property |
|---|---|
| **G1** | Has a paralogue that fully covers its loss; the single mutant is normal |
| **G2** | Absolutely required in early embryogenesis, long before the process is scorable |
| **G3** | Its contribution appears only under a stress the assay never applies |
| **G4** | An enhancer — non-coding regulatory sequence, no transcript of its own |
| **G5** | Pleiotropic; *any* allele that reduces function enough to affect this process also makes animals too sick to score |

**(d)** The reverse screen returns nothing for G1. Write the sentence you are entitled to publish.

<details><summary>Solution</summary>

**(a)** A randomly picked F2 from a self-fertilising heterozygote is homozygous with probability
1/4, so *n* independent clones all miss with probability (3/4)^n.

```
95% :  (3/4)^n ≤ 0.05   →  n ≥ ln(0.05)/ln(0.75) = (−2.9957)/(−0.2877) = 10.41  →  11 clones
99% :  (3/4)^n ≤ 0.01   →  n ≥ ln(0.01)/ln(0.75) = (−4.6052)/(−0.2877) = 16.01  →  17 clones
```

Check the rounding, because this is where the arithmetic usually goes wrong: (3/4)^10 = 0.0563
(still above 0.05, not enough) and (3/4)^11 = 0.0422 ✓; (3/4)^16 = 0.0100 (right on the line) and
(3/4)^17 = 0.0075 ✓. Always round **up**, and always verify the boundary case — the 99% answer is
16.008, and rounding 16.008 down to 16 fails.

Note the shape: buying the last 4 percentage points of confidence costs 6 more clones, more than
half again as much work. Confidence in a sampling scheme is logarithmically expensive.

**(b)** 20,000 lines × 11 clones = **220,000 individually cloned and scored F2 animals**, against
**20,000 wells** in the reverse screen. Eleven times as many scored units — and that
understates it, because each of the 220,000 forward units is a plate of worms to be inspected,
while an RNAi plate is 96 wells.

The genuinely important asymmetry is not the count. It is that the reverse screen's 20,000 units
are **indexed**: a hit arrives with the gene's name attached. The forward screen's units are not,
so every mutant recovered then enters a second experiment — bulk-segregant mapping, filtering for
EMS-consistent G:C→A:T coding changes, and transformation rescue — before it has a gene attached
at all. Forward genetics front-loads nothing and back-loads everything.

**(c)** The forward screen breaks sequence at random and asks the phenotype; the reverse screen
knocks down one *annotated transcript* at a time.

| | Forward EMS | Reverse RNAi | Why |
|---|---|---|---|
| **G1** | no | no | Redundancy. Neither single perturbation produces a phenotype. Only a double mutant reveals it — a synthetic interaction, which is a different experiment |
| **G2** | **yes** | **yes** | Forward: EMS makes an **allelic series**, so hypomorphic and temperature-sensitive alleles survive early development and expose the later requirement. Reverse: RNAi is a partial, dose-tunable knockdown, so it too can bypass the early lethality. A CRISPR null would miss it |
| **G3** | no | no | An assay problem, not a genetics problem. No perturbation is visible to an oracle that never queries the relevant condition |
| **G4** | **yes** | no | EMS mutates any base, coding or not. An RNAi library is built one clone per gene from annotated transcripts, so a non-coding element is simply not in the query set. (A dCas9-based CRISPRi tiling screen is the reverse-genetic tool that *does* reach it) |
| **G5** | no | **yes** | Every *heritable* allele strong enough to matter is filtered out before scoring, so even an EMS allelic series cannot deliver one. Acute, tunable knockdown lands on the phenotype without killing the animal. This is the same knockdown-versus-knockout distinction as G2, from the other side |

Two structural readings. First, the forward screen's virtue is that it needs no prior hypothesis
and no annotation — G4 is invisible to a gene-indexed method and visible to a mutagen. Second, the
allelic-series advantage (G2) belongs to *graded* perturbation, not to forward genetics as
such: EMS and RNAi both provide it, and a clean CRISPR null does not. G5 is the sharper case —
there the grading has to be *acute* as well as partial, which a heritable mutation cannot be. "Knockdown and knockout are
not the same experiment" cuts both ways.

Genes G1 and G3 are found by **neither**. That is the point of Ch 37 §5: saturation is a property
of the screen, never of the genome. A screen enumerates what its oracle can score, in the
background used, under the conditions applied.

**(d)** Not "G1 is dispensable", and not "G1 does not function in this process". The defensible
sentence names the assay, the background, the conditions and the power:

> "RNAi against G1 by feeding produced no detectable defect in [the assay], in [the strain],
> under [the conditions], at *n* = [k] independent broods, with 80% power to detect a difference
> of [E]. Knockdown efficiency was confirmed by [measurement]."

The last clause matters as much as the rest — an RNAi negative with no knockdown control is not a
result about the gene, it is a result about the reagent. And even a complete negative here would
not touch the redundancy explanation, which requires the G1-paralogue double mutant.

</details>

---

## 5. Screen design: target size, saturation, and the suspicious singleton ★

In a forward screen, model the number of recoverable loss-of-function alleles recovered per gene
as Poisson with mean λ, and take **λ proportional to coding length**, with λ = 3.0 for a gene with
2,000 bp of coding sequence.

**(a)** For genes of 500 bp, 2,000 bp and 6,000 bp of coding sequence, what fraction is hit at
least once?
**(b)** Among the genes of each size that *are* recovered, what fraction is represented by exactly
one allele?
**(c)** The screen returns exactly one allele of a 6,000 bp gene. How surprising is that, and give
three explanations. How would you decide between them?
**(d)** You consider doubling the mutagen dose (λ → 2λ). Assume each recovered mutant carries on
average 8 additional unlinked loss-of-function lesions at the standard dose, and that each outcross
to wild type — selecting for the mutant phenotype — retains each unlinked lesion with probability
1/2. What does doubling the dose buy, and what does it cost?

<details><summary>Solution</summary>

**(a)** λ scales as length/2000, and P(hit) = 1 − e^(−λ).

```
  500 bp :  λ = 3.0 × 500/2000  = 0.75   P(≥1) = 1 − e^−0.75 = 0.5276  →  52.8%
2,000 bp :  λ = 3.0             = 3.00   P(≥1) = 1 − e^−3.00 = 0.9502  →  95.0%
6,000 bp :  λ = 3.0 × 6000/2000 = 9.00   P(≥1) = 1 − e^−9.00 = 0.99988 →  100.0%
```

A screen that is 95% saturated "on average" has seen only **half** the small genes. Saturation is
not a single number; it is a function of target size, and quoting one number for a screen quietly
averages over a factor-of-two spread in detection probability.

**(b)** Condition on being recovered at all: P(exactly 1 | at least 1) = λe^(−λ)/(1 − e^(−λ)).

```
  500 bp :  0.75 e^−0.75 / 0.5276 = 0.3543/0.5276 = 0.671   →  67.1%
2,000 bp :  3.00 e^−3.00 / 0.9502 = 0.1494/0.9502 = 0.157   →  15.7%
6,000 bp :  9.00 e^−9.00 / 0.99988 = 0.001111/0.99988 = 0.00111  →  0.111%
```

The **allele spectrum is a size spectrum**. Singletons are overwhelmingly small genes; large genes
arrive with several alleles or not at all. That is a direct check you can run on any screen: if
your singleton complementation groups turn out to be large genes, the Poisson model is wrong
somewhere, and problem (c) is about where.

**(c)** For a 6 kb gene, a singleton is a **1-in-900 outcome** under the model (1/0.00111 = 900).
That is not a fluke to shrug at; it is a signal that one of the model's assumptions has failed.
Three explanations, all real:

1. **The mutable target is far smaller than the gene.** λ ∝ coding length assumes every codon is
   equally able to yield a scorable phenotype. If only a handful of residues — one active site,
   one interaction surface — can be mutated to a phenotype without also being lethal or silent,
   the effective target is a few hundred bases and the gene behaves like the 500 bp row.
   Ch 37 §5 names this explicitly: mutability varies enormously between genes, and the naive
   1 − e^(−λ) is optimistic for exactly this reason.
2. **The allele is not causal.** A mutant carries many lesions (part (d)). If the "allele"
   assigned to this gene is a background lesion and the real causal mutation is elsewhere, the
   group is a singleton because it is an artefact. Complementation testing does not protect you
   here — and it has its own failure modes, including **unlinked non-complementation** between
   dosage-sensitive partners, which manufactures spurious groups.
3. **Most alleles of this gene never reach scoring.** If loss is usually lethal or pleiotropic,
   the alleles you recover are the rare weak ones, so the *scorable* target is small even though
   the mutable target is large.

Deciding between them: sequence the gene in every mutant in the group — explanation 1 predicts
independent alleles clustering in one small region, which is itself evidence about which part of
the protein matters. Then outcross the singleton several times and re-test (kills explanation 2 if
the phenotype survives), and finally do **transformation rescue** — reintroduce the wild-type
copy and ask whether the phenotype disappears. Rescue is the gold standard because it is the only
step that demonstrates sufficiency rather than correlation, and it settles explanation 2 outright.

**(d)** What it buys:

```
  500 bp :  52.763%  →  77.687%    +24.9 points
2,000 bp :  95.021%  →  99.752%     +4.7 points
6,000 bp :  99.988%  → 100.000%     +0.01 points
```

**The gain is concentrated almost entirely in the small genes**, which is the correct way to think
about the dose knob: you are not buying "more saturation", you are buying the low-λ tail. If your
screen is already recovering large genes with five alleles each, doubling the dose adds nothing
there and everything at the small end.

What it costs. The background rises from 8 to 16 unlinked lesions per mutant. Each outcross halves
the expected number retained:

```
from  8 :  8 → 4 → 2 → 1 → 0.5     4 outcrosses to expect <0.5 residual
from 16 : 16 → 8 → 4 → 2 → 1 → 0.5  5 outcrosses
```

**One extra outcross generation per mutant** — and with dozens of mutants and a three-day
generation time, that is the "months" Ch 37 §3 refers to.

One thing that is *not* the cost, and is worth computing so you do not assert it: background
lesions do not meaningfully pollute the mapped interval. In a ±1 cM window of about 600 kb in a
100 Mb genome, the expected number of background lesions is

```
 8 × 600,000/100,000,000 = 0.048
16 × 600,000/100,000,000 = 0.096
```

— under one in ten either way, against roughly 120 genes in that window at ~1 gene per 5 kb. The
filter for mutagen-consistent (G:C→A:T) coding changes typically leaves one to three candidates
regardless. The real cost of a high dose is the breeding, not the bioinformatics, which is why the
standard target is about one lethal-equivalent per mutagenised genome rather than as much mutagen
as the animals survive.

</details>

---

## 6. Counting genes from a complementation table

A screen recovers a set of recessive mutants with the same phenotype. Eight of them are crossed
pairwise and the heterozygous progeny scored. `+` = progeny wild type (complementation);
`−` = progeny mutant (non-complementation). The diagonal is `−` by definition.

| | m1 | m2 | m3 | m4 | m5 | m6 | m7 | m8 |
|---|---|---|---|---|---|---|---|---|
| **m1** | − | + | + | − | + | + | − | − |
| **m2** | + | − | + | + | − | + | + | − |
| **m3** | + | + | − | + | + | + | + | − |
| **m4** | − | + | + | − | + | + | − | − |
| **m5** | + | − | + | + | − | + | + | − |
| **m6** | + | + | + | + | + | − | + | − |
| **m7** | − | + | + | − | + | + | − | − |
| **m8** | − | − | − | − | − | − | − | − |

**(a)** Assign complementation groups. How many genes have you found?
**(b)** m8 behaves differently from every other mutant. What is going on, what single cross
diagnoses it, and how should m8 be handled?
**(c)** The full screen recovered **84 mutants in 31 complementation groups**, with 12 groups
represented by a single allele, 8 by two, 5 by three, and 6 by four or more. Estimate how many
genes the screen has missed, and its completeness.
**(d)** Give two distinct ways in which the number of complementation groups can differ from the
number of genes, in *opposite* directions.

<details><summary>Solution</summary>

**(a)** Read off the `−` entries away from the diagonal and take equivalence classes. Failure to
complement is the relation; the groups are its connected components.

```
m1 fails with m4, m7      m4 fails with m1, m7      m7 fails with m1, m4
m2 fails with m5          m5 fails with m2
m3 fails with nothing     m6 fails with nothing
m8 fails with everything
```

Setting m8 aside for the moment (part (b)):

```
group I    : m1, m4, m7    (3 alleles)
group II   : m2, m5        (2 alleles)
group III  : m3            (1 allele)
group IV   : m6            (1 allele)
```

**Four complementation groups among the seven well-behaved mutants — four genes.** The internal
consistency is worth checking, because a real table has errors in it: group I requires all three
of m1–m4, m1–m7 and m4–m7 to be `−`, and they are. A table where m1 fails with m4 and m4 fails
with m7 but m1 *complements* m7 is not a valid partition, and means either a scoring error or one
of the pathologies in part (d).

The logic behind the partition: two broken copies of *different* genes each supply what the other
lacks, so the heterozygote is wild type; two broken copies of the *same* gene supply nothing.

Cost note: the eight mutants needed C(8,2) = **28** crosses. The full 84 would need C(84,2) =
**3,486** — pairwise complementation is quadratic, which is why real screens complement in pools
first, or sequence and skip the crosses entirely.

**(b)** m8 fails to complement **every** mutant, including mutants in four different genes. It
cannot be an allele of all four genes at once.

The diagnostic cross is **m8 × wild type**. If m8/+ is mutant, m8 is **dominant** — most likely a
dominant-negative allele whose product poisons the complex or pathway irrespective of what the
other chromosome carries — and the complementation test simply does not apply to it. The test is
valid **only for recessive loss-of-function alleles**, and this is the standard way that condition
is violated.

Handle m8 by excluding it from the group assignment and characterising it separately: sequence it,
and assign it to a gene by sequence rather than by cross. It may well be a genuinely informative
allele — dominant-negatives often identify multimeric proteins — but it contributes nothing to the
gene count.

The classic wrong path is to run the table through the partition mechanically. m8 fails with
everything, so a naive connected-components pass merges m1–m8 into **one single group**: eight
mutants, one gene. The screen would be reported as having found one gene when it found four. Any
mutant that fails to complement mutants in more than one established group must be pulled out and
tested against wild type before the table is partitioned at all.

**(c)** Use the Chao-style estimator for unseen classes on the allele spectrum, where f₁ is the
number of single-allele groups and f₂ the number of two-allele groups:

```
unseen genes ≈ f₁²/(2 f₂) = 12²/(2 × 8) = 144/16 = 9
```

```
estimated total = 31 recovered + 9 unseen = 40
completeness    = 31/40 = 0.775  →  77.5%
```

Arithmetic check on the stated spectrum: 12(1) + 8(2) + 5(3) = 12 + 16 + 15 = 43 alleles in the
small groups, leaving 84 − 43 = **41** alleles across the 6 large groups, a mean of 6.8 each and
all ≥ 4 ✓. Always run this — a spectrum that does not sum to the reported number of mutants means
the table is wrong before any estimator touches it.

**The screen is not finished, and the twelve singletons are the tell.** At true saturation almost
every gene is represented by several independent alleles, and newly isolated mutants fall into
existing groups rather than founding new ones. Many singletons and few doubletons is the signature
of a sample far from complete — the identical estimator, and the identical reasoning, as unseen
species in an ecological survey ([S3](../part-S-statistics/S3-sampling-and-estimation.md)) or
unseen bugs in a fuzzing campaign.

Two caveats on the number 40. It assumes independent hits at gene-specific rates — which
problem 5 showed is exactly the assumption that fails when target sizes vary. And it estimates
the number of genes **detectable by this screen**: redundant, essential and pleiotropic genes are
outside the sampled universe entirely and no amount of further screening will reveal them. "40"
is not the number of genes in the process. It is the number of genes this oracle could ever name.

**(d)** Two failures, in opposite directions:

- **Too many groups (one gene splits).** **Intragenic complementation**: two alleles hitting
  different domains of a multimeric protein can partially restore function in the heterozygote,
  scoring `+`, so one gene is counted as two.
- **Too few groups (two genes merge).** **Unlinked non-complementation**: two genes whose products
  are dosage-sensitive partners can give a mutant heterozygote — as m8 would if it were a
  dominant-negative rather than dominant, or as any pair of interacting haploinsufficient loci
  can — so two genes are counted as one.

Both are resolved the same way, and it is the only way: sequence the alleles.

</details>

---

## 7. Library coverage: presence is not the binding constraint ★

You build a genome-wide pooled CRISPR knockout library: **4 guides per gene** against all
**19,442** human protein-coding genes ([GENCODE 50](../reference/verified-facts.md)). Cells are
transduced at MOI < 1 so that each transduced cell carries at most one construct; treat each
transduced cell as drawing its construct uniformly at random from the library, so the number of
cells receiving a given construct is Poisson with mean λ = cells/constructs.

**(a)** You recover 400,000 transduced cells. How many constructs are expected to be absent from
the pool entirely? How many *genes* lose all four of their guides?
**(b)** How many transduced cells are needed for a 95% chance that **no** construct is missing?
What coverage is that, in cells per construct?
**(c)** Ch 38 §9 says pooled screens need coverage of 100–1000×. Your answer to (b) is far below
that. Why is presence not the binding constraint?
**(d)** Your collaborator proposes fixing a noisy screen by sequencing the guide amplicon ten
times more deeply. Model the count for one construct as two stages of Poisson sampling — *c* cells
per construct, then *r* reads per construct — for which the relative variance is
CV² = 1/*c* + 1/*r*. Evaluate the proposal.

<details><summary>Solution</summary>

**(a)** Library size C = 19,442 × 4 = **77,768 constructs**.

```
λ = 400,000/77,768 = 5.144
P(a given construct receives zero cells) = e^−5.144 = 0.005837
expected constructs missing = 77,768 × 0.005837 = 454
```

**About 454 constructs — 0.58% of the library — are simply not there.** At λ ≈ 5 that feels
surprising; it is the same Poisson zero-class that makes 0.7% of a genome uncovered at 5× sequencing
depth ([S2 §2](../part-S-statistics/S2-distributions.md)). Rare events over many opportunities do
not distribute themselves evenly, and "on average five" guarantees nothing about any particular
construct.

Genes, though, are protected by redundancy. A gene disappears only if all four of its guides do:

```
P(all 4 guides absent) = (e^−λ)^4 = e^(−4 × 5.144) = e^−20.574 = 1.16 × 10^−9
expected genes lost = 19,442 × 1.16 × 10^−9 = 0.000023
```

Effectively zero. This is the first real function of multiple guides per gene — before it is a
noise-averaging device (Ch 37 §10), it is an insurance policy against Poisson dropout. Four
independent chances at e^−λ each turn a 1-in-171 risk into a 1-in-861-million risk.

**(b)** Constructs are (near enough) independent, so

```
P(none missing) = (1 − e^−λ)^C ≈ exp(−C e^−λ) ≥ 0.95
C e^−λ ≤ −ln(0.95) = 0.05129
e^−λ ≤ 0.05129/77,768 = 6.596 × 10^−7
λ ≥ ln(77,768/0.05129) = ln(1,516,144) = 14.23
cells ≥ 14.23 × 77,768 = 1.11 × 10^6
```

Check exactly: (1 − e^−14.23)^77768 = 0.950 ✓. So **1.11 million transduced cells, a coverage of
14.2×**.

Note the shape of the requirement: it went from λ = 5.14 to λ = 14.23 — not because the library
grew, but because "no construct missing out of 77,768" is a much stronger demand than "few
missing". Demanding a *maximum* over many independent events costs a log factor in λ; that log
factor is ln(C), which is why library size enters the coverage requirement so weakly.

**(c)** Because **presence is not what the screen measures**. The screen measures a *change in
abundance*, and a construct present in exactly one cell carries no usable information about its
own fold change — one cell either survives selection or does not.

Coverage 14× buys you a library that is complete. It does not buy a library whose counts mean
anything. At *c* cells per construct the sampling noise on a neutral construct's abundance is
CV = 1/√*c*:

```
c =  14.2  →  CV = 26.5%
c = 500    →  CV =  4.5%
```

Every passage, every selection, every library prep is another multinomial resampling of the pool,
so these compound: three independent bottlenecks at coverage *c* give CV ≈ √(3/*c*), which at
c = 500 is 7.7% and at c = 14 is 46%. A construct whose true effect is a 20% dropout is invisible
against 26% — let alone 46% — of drift. That is what 100–1000× coverage is for.

```
100×  coverage =   7.8 million cells
500×  coverage =  38.9 million cells
1000× coverage =  77.8 million cells
```

**(d)** Compute it rather than arguing about it. Take *c* = 14.2 cells per construct and vary the
reads:

```
c = 14.2, r =  100 :  CV = √(1/14.2 + 1/100) = 0.284  →  28.4%
c = 14.2, r =  500 :  CV = √(0.0703 + 0.0020) = 0.269  →  26.9%
c = 14.2, r = 1000 :  CV = √(0.0703 + 0.0010) = 0.267  →  26.7%
```

**A tenfold increase in sequencing moves the noise from 28.4% to 26.7%.** The proposal is worth
essentially nothing, and the reason is visible in the formula: the two variances **add**, so the
larger term sets the floor. The cell-only floor at *c* = 14.2 is 1/√14.2 = 26.5%, and no amount of
sequencing goes below it. Reads sample the DNA, and the DNA already inherited whatever the cells
did — you cannot re-sample information that was destroyed at the bottleneck.

The correct fix runs the other way:

```
c = 500, r =  100 :  CV = √(0.0020 + 0.0100) = 0.110  →  11.0%
c = 500, r =  500 :  CV = √(0.0020 + 0.0020) = 0.063  →   6.3%
```

More cells, at every step, with the cell number **recorded** at each transfer so the achieved
coverage is auditable. The most common cause of an irreproducible pooled screen is a
sampling-statistical failure at a step nobody wrote down. The diagnostic signature is precise:
strong constructs (true essentials) still score in both replicates, while weak effects do not
reproduce — replicate correlation collapses even though the positive controls look fine. Deep
sequencing does not rescue it, and a deeply sequenced under-covered screen is the most expensive
way to get an uninterpretable answer.

Once coverage is adequate, two artefacts remain and neither is fixed by cells or reads:
**copy-number confounding** — cutting is toxic in proportion to the number of cuts, so an
amplified region drops out regardless of gene function, and the matched control is a
cut-number-matched one rather than non-targeting guides — and **in-frame escape**, since about a
third of indels preserve the reading frame.

</details>

---

## 8. Reading an editing efficiency honestly ★★

**(a)** Amplicon sequencing across a Cas9 cut site reports a **62% indel rate** across reads, and
**68%** of indel alleles have a length not divisible by 3. Compute the frameshift allele
frequency, the fraction of cells that are biallelic frameshift, and the fraction with at least one
frameshift allele. Assume the two alleles in a cell are hit independently, then say which way that
assumption is wrong.

**(b)** You repeat the experiment with an HDR donor. Allele-level outcomes are now: **6%** carry
the precise templated edit, **56%** carry an indel, **38%** are unmodified. Compute the full
genotype distribution over cells. What fraction of cells is usable for a correction experiment —
precisely edited on at least one allele and *not* disrupted on the other? How many clones must you
pick to be 95% sure of one homozygous precise edit? What happens to all of this in a neuron?

**(c)** Your 20-nt guide has no perfect match elsewhere in the genome. Using the counting argument
of Ch 38, estimate the number of genomic sites within 3 mismatches, and within 4. Take the genome
as 3.1 Gb read on both strands, i.e. 6.2 × 10^9 positions, of which the fraction followed by an
`NGG` PAM is 1/16.

**(d)** Write the sentence about off-targets that this experiment entitles you to publish.

<details><summary>Solution</summary>

**(a)** Chain the two fractions. An allele is a frameshift only if it carries an indel *and* that
indel is out of frame:

```
frameshift allele frequency = 0.62 × 0.68 = 0.4216
```

Under independence between the two alleles of a cell:

```
biallelic frameshift        = 0.4216²          = 0.1777  →  17.8%
at least one frameshift     = 1 − (1 − 0.4216)² = 0.6655 →  66.5%
exactly one (heterozygous)  = 0.6655 − 0.1777   = 0.4877 →  48.8%
```

For completeness the other alleles are: in-frame indels 0.62 × 0.32 = 0.1984, unmodified
1 − 0.62 = 0.3800.

**A population reported as "62% editing efficiency" contains about 18% true knockout cells** — a
factor of 3.5 between the headline and the thing you care about. Half the population is
heterozygous for a frameshift, which for a haplosufficient gene is phenotypically wild type
(Ch 37 §4: most loss-of-function alleles are recessive because most genes are haplosufficient), and
14% is entirely unmodified. Any assay run on the bulk population is measuring a mixture in which
the intended genotype is a minority. This is why single-cell cloning or a selectable marker is
standard, and why a bulk-edited population is a poor experimental unit.

**The independence assumption is wrong, and wrong in a known direction.** Cells differ in how much
editor they received — transfection or transduction dose varies across the population — so allele
outcomes *within* a cell are positively correlated: a cell with lots of Cas9 tends to lose both
alleles, a cell with little loses neither. The measured 42.16% allele frequency is a marginal over
an overdispersed cell-level distribution, so the true biallelic fraction **exceeds** 0.4216². The
naive binomial square is a **lower bound**, not an estimate. (The same overdispersion logic
appears in [S2 §5](../part-S-statistics/S2-distributions.md) as the negative binomial: a Poisson
whose rate itself varies.)

**(b)** Two independent alleles drawn from {HDR 0.06, indel 0.56, WT 0.38}:

| Genotype | Probability | |
|---|---|---|
| HDR / HDR | 0.06² | **0.36%** |
| HDR / indel | 2 × 0.06 × 0.56 | **6.72%** |
| HDR / WT | 2 × 0.06 × 0.38 | **4.56%** |
| indel / indel | 0.56² | **31.36%** |
| indel / WT | 2 × 0.56 × 0.38 | **42.56%** |
| WT / WT | 0.38² | **14.44%** |
| | | sum 100.00% ✓ |

Cells carrying a precise edit with the other allele intact = HDR/HDR + HDR/WT =
0.36% + 4.56% = **4.92%**.

Note what got thrown away. Cells with at least one precise edit are 11.64%, but 6.72 points of
that are HDR/indel — precisely corrected on one chromosome and destroyed on the other. For a
recessive condition that may be tolerable; for anything dosage-sensitive it is not, and it is
never what the headline number implies. The headline here would be "62% of alleles edited", of
which the useful yield is under one cell in twenty.

Clones needed for one HDR/HDR at 95% confidence:

```
(1 − 0.0036)^n ≤ 0.05
n ≥ ln(0.05)/ln(0.9964) = (−2.9957)/(−0.0036065) = 830.6  →  831 clones
```

Against 60 clones for a merely usable (HDR/HDR or HDR/WT) cell. **Homozygous precise editing is a
fourteen-fold harder screening problem than heterozygous**, because it squares a small number.

**In a neuron, all of it collapses.** HDR requires a donor template, a sister chromatid and the
S/G2 phases of the cell cycle. Neurons are terminally post-mitotic, so HDR is effectively zero and
the entire HDR column of the table goes to 0: the break is repaired by NHEJ, and the only outcomes
are indels and unmodified — the opposite of a precise correction. (Adult hepatocytes are a
different case: merely G0-quiescent, retaining proliferative capacity, so HDR there is very
inefficient rather than absent.) This is the central practical constraint of the field, and it is
why base editing and prime editing exist: both nick rather than break, neither depends on HDR, and
both therefore work in non-dividing cells. If the required change is a transition — C•G→T•A or
A•T→G•C — a base editor is the answer; otherwise a prime editor. It is also why Casgevy was
designed as a **knockout** of a *BCL11A* enhancer rather than a repair of *HBB*: a precise-repair
problem re-specified as a break-something problem, because breaking things is what the repair
machinery does well.

**(c)** Count 20-mers at Hamming distance exactly *d*: choose which *d* positions differ, C(20,*d*),
and change each to one of 3 other bases, 3^*d*.

```
d = 0 :      1 ×   1 =        1
d = 1 :     20 ×   3 =       60
d = 2 :    190 ×   9 =    1,710
d = 3 :  1,140 ×  27 =   30,780      cumulative ≤3  =  32,551
d = 4 :  4,845 ×  81 =  392,445      cumulative ≤4  = 424,996
```

A random 20-mer falls in each set with probability count/4^20, and 4^20 = 1.0995 × 10^12:

```
P(within 3) =  32,551/1.0995 × 10^12 = 2.96 × 10^−8
P(within 4) = 424,996/1.0995 × 10^12 = 3.87 × 10^−7
```

Candidate PAM-adjacent targets = 6.2 × 10^9 × 1/16 = **3.88 × 10^8**. So

```
expected sites within 3 mismatches = 3.88 × 10^8 × 2.96 × 10^−8 ≈  11.5
expected sites within 4 mismatches = 3.88 × 10^8 × 3.87 × 10^−7 ≈ 150
```

**Relaxing the search by one mismatch multiplies the candidate list by 13** (424,996/32,551 =
13.1). That single number is why in-silico off-target enumeration has excellent recall and
terrible precision, and why the threshold you choose determines the size of your problem more
than the guide does.

Now say what the calculation does and does not mean. It **bounds how many candidates you must
test**. It does **not** estimate how many are real, for two reasons pointing in opposite
directions. Most of these sites will never be cut, because most of their mismatches will fall in
the PAM-proximal seed, where mismatches abort R-loop formation — Hamming distance is the wrong
model, since a 3-mismatch seed site is usually dead while a 3-mismatch PAM-distal site can be cut
efficiently. But the genome is not uniform random sequence: repeats and paralogues make the real
count of close homologues worse than 11.5, and RNA or DNA bulges create sites that a fixed-length
string search never enumerates at all.

**(d)** Not "no off-target editing was detected", and never "the guide is specific". The
defensible statement names the assays, the cell type, the union rather than the intersection, and
the floor:

> "Candidate off-target sites were nominated by [an in-cell break-capture assay] and [an in-vitro
> cut census], and the **union** of the two lists was taken. Each candidate was amplicon-sequenced
> in [the therapeutic cell type, edited by the clinical delivery format]. No site exceeded the
> **limit of detection of 0.1% allele frequency**. Structural outcomes — large deletions, loss of
> heterozygosity, translocations — were assessed separately by [long-read or karyotype-level
> assay], because amplicon sequencing across a cut site cannot see them."

Three things are load-bearing there. **The union**, because the assays measure different things
and do not agree: an in-vitro census on naked DNA has high sensitivity but no chromatin and
nominates sites never accessible in a cell, while an in-cell tag-capture assay reports genuine
breaks but with sensitivity limited by tag uptake. There is no gold standard, so no single assay
can be believed alone. **The detection floor**, because 0.1% is what you measured, and "zero" is
not a measurement — reporting a floor of 0.1% means about 10,000 reads to expect ten supporting
reads at that frequency. And **the separate structural assay**, because amplicon sequencing across
the cut site conditions on the primer sites surviving; kilobase-scale deletions, loss of
heterozygosity and chromothripsis destroy those primer sites, so the assay is blind to exactly the
events that matter most. That is an ascertainment bias, not a measurement error, and no amount of
sequencing depth on the amplicon repairs it.

</details>

---

## Where you went wrong

| Error pattern | What to re-read |
|---|---|
| Read equal endpoint bands as equal starting material | Problem 1(d) — the plateau is why qPCR reports a *cycle* |
| Treated a right-sized band as a confirmed identity | Problem 2(c) — a gel confirms a length, nothing more |
| Ran ΔΔCt without checking the standard-curve slope | Problem 3(a) — 2^(−ΔΔCt) assumes *E* = 1 for **both** assays |
| Believed a stable reference gene because the Ct barely moved | Problem 3(d) — that is a tautology; drift is invisible to the assay that assumes it away |
| Expected knockdown and knockout to give the same answer | Problem 4(c) — graded and null perturbations find different genes, in both directions |
| Quoted one saturation figure for a whole screen | Problem 5(a)–(b) — detection probability is a function of target size |
| Accepted a singleton complementation group at face value | Problem 5(c) — for a large gene it is a 1-in-900 event, so something else is true |
| Partitioned a complementation table without testing the odd mutant against wild type | Problem 6(b) — one dominant allele collapses four genes into one |
| Sized a pooled library by "at least one cell per construct" | Problem 7(b)–(c) — presence is cheap; measuring a fold change is not |
| Proposed deeper sequencing to fix a noisy screen | Problem 7(d) — the variances add, and the cell term is the floor |
| Reported an indel percentage as a knockout percentage | Problem 8(a) — 62% edited alleles is ~18% knockout cells |
| Planned an HDR correction in post-mitotic tissue | Problem 8(b) — HDR needs a sister chromatid and S/G2 |
| Ranked off-target risk by Hamming distance | Problem 8(c) — mismatch tolerance is position-dependent; the seed is what matters |
| Wrote "no off-targets detected" | Problem 8(d) — report the union of assays and the detection floor |
