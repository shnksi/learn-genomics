# Problem set 17 — Repeat disorders and SCA12

Covers [D1–D5](../part-D-sca12/D1-neurons-and-the-cerebellum.md), the SCA12 track.

**Attempt before revealing.** This set closes the specialisation, and it is deliberately unlike
the earlier sets in one respect: several problems have no clean answer, because the field does not
have one. Where that happens the task is not to guess the missing number — it is to say precisely
what is unknown, what would have to be measured to know it, and what you are entitled to tell a
patient in the meantime. A solution that ends "the evidence does not decide this, and here is the
experiment that would" is a complete solution. A solution that ends with a confident threshold you
cannot source is wrong even when it happens to be right.

**Conventions fixed for this set.** Every dataset presented in a fenced block — pedigrees, onset
tables, tool output, subunit abundances, experimental results — is **constructed for teaching**
and is labelled as such where it appears. It is chosen to be arithmetically tractable and to
behave the way real data behave, not to reproduce any published table. Everything stated in prose
as a fact about SCA12 or about repeat disorders in general — thresholds, cohort fractions, cohort
means, correlation coefficients, trial results — is **real and sourced**, and where the sources
disagree the disagreement is given rather than resolved. All repeat counts are **pure CAG units on
the sense strand** unless a problem says otherwise; watch that convention, because problem 1 exists
to break it.

Thirteen problems, roughly in order of difficulty for the first eleven. **★** marks three worth
returning to; **★★** marks the two that are genuinely open research questions dressed as exercises.
**Problems 12 and 13 sit outside that ordering**: they go back to the clinical and cell-biological
ground of [D1](../part-D-sca12/D1-neurons-and-the-cerebellum.md) — the tremor vocabulary of its
clinical-vocabulary section, and the arithmetic behind its selective-vulnerability section — and are
placed last because they are worth attempting once the rest has settled, not because they are the
hardest.

---

## 1. The locus, in base pairs

Four descriptions of the *PPP2R2B* repeat, all from curated sources:

```
STRchive SCA12_PPP2R2B  (constructed layout; values are the real record)
  gene                        PPP2R2B
  cytoband                    5q32
  gene strand                 minus
  repeat, GRCh38              chr5:146,878,727-146,878,759
  repeat, GRCh37/hg19         chr5:146,258,290-146,258,322
  repeat, T2T-CHM13           chr5:147,414,733-147,414,780
  reference copies            10.7
  motif, reference orientation  GCT
  motif, gene orientation       AGC
  region                      5' UTR
```

The literature writes the tract as `(CAG)n`. ClinVar's benign record is
`NM_181675.3(PPP2R2B):c.27CAG[(7_28)]`. A genome browser track over the plus strand shows `(CTG)n`.

**(a)** Compute the numeric span of all three coordinate pairs. Two agree and one does not — say
what that tells you about the third assembly. Then, using only the assembly the stated reference
copy number belongs to, work out which coordinate convention STRchive is using, by requiring that
the tract length and the copy number agree. Show both candidate answers and say which one survives.
**(b)** The reference tract is not a whole number of repeat units. Say what that implies for two
callers that report `10` and `11` for the same reference.
**(c)** Reconcile `CAG`, `CTG`, `AGC` and `GCT` as descriptions of one element. **[trap]**
**(d)** Convert the clinically load-bearing allele lengths to base pairs: the top of the normal
range (32), the threshold Srivastava et al. propose (43), the classical diagnostic threshold (51),
and the top of the Indian founder range (69).
**(e)** A colleague builds a custom caller catalogue using the hg19 coordinate and runs it against
GRCh38 alignments. How far off-target is the interval, and what will the output look like?

<details><summary>Solution</summary>

**(a)** Take the differences first:

```
GRCh38    146,878,759 - 146,878,727 = 32
GRCh37    146,258,322 - 146,258,290 = 32
T2T       147,414,780 - 147,414,733 = 47
```

GRCh38 and GRCh37 agree, and T2T-CHM13 does not — which is the first lesson, and it is the
opposite of the one most people expect. A liftover between GRCh37 and GRCh38 is a re-coordination
of the *same* assembled sequence, so the element's length carries over. T2T-CHM13 is not a
re-coordination: it is a different individual's genome, assembled from scratch. At a polymorphic
STR that individual is entitled to a different allele, and here they have one — 47 bp, about
**15.7 copies**, against GRCh38's 10-and-a-bit. **A repeat tract's span is a property of the
assembly, not of the locus**, so the stated reference copy number may only be read against the
assembly it was computed from.

That settles which row to use for the convention test. STRchive's **10.7** is a GRCh38 figure, so
test the 32-bp GRCh38 interval against the two conventions ([Ch 41
§6](../part-09-genomics/41-data-formats.md), the section that owns this):

- **0-based half-open** (BED): length = end − start = **32 bp** → 32/3 = **10.67 copies**
- **1-based inclusive** (VCF/GFF): length = end − start + 1 = **33 bp** → 33/3 = **11.0 copies**

The record states **10.7**, not 11. Only the 0-based half-open reading reproduces it. So the tract
is **32 bp**, and the coordinates are 0-based half-open.

That is the whole method, and it generalises: when a record gives you both a coordinate pair and a
derived quantity, the derived quantity tells you which convention the coordinate pair is in. You
should never have to guess, and you should never assume — a 1-bp error at a repeat boundary is a
third of a repeat unit, which is exactly the resolution the clinical question turns on.

**(b)** 32 bp is **10 complete CAG units plus 2 bases**. No rounding rule binds both callers, so one
may floor the partial unit and report `10` while another counts it and reports `11` — both describing
the same reference sequence. So a one-unit disagreement on a *normal* allele is usually a boundary
convention rather than a genotyping error (check the reference call before investigating the sample),
and any length reported as a difference from reference inherits the ambiguity. Report absolute repeat
counts with the assay named, never "+2 relative to reference".

**(c) [trap]** The trap is inferring a different locus, or a different disease mechanism, from a
different motif spelling. All four name the same 32 bp.

*PPP2R2B* is on the **minus** strand. So:

```
sense / mRNA strand   5'- ... CAG CAG CAG CAG ... -3'
plus / reference      3'- ... GTC GTC GTC GTC -5'  read 5'->3':  CTG CTG CTG CTG
```

A trinucleotide repeat has **no canonical phase** — a tract of CAG read one base later is AGC and
two bases later is GCA, and all three describe the same string. STRchive normalises to one
rotation per orientation:

| Spelling | Strand | Relationship to `CAG` |
|---|---|---|
| `CAG` | sense (mRNA) | the literature's convention |
| `AGC` | sense (mRNA) | `CAG` rotated one base — the gene-orientation motif in STRchive's JSON |
| `CTG` | plus (reference) | reverse complement of `CAG` |
| `GCT` | plus (reference) | `CTG` rotated one base — the reference-orientation motif in STRchive's JSON |

Two independent transformations, applied in combination: reverse-complement (strand) and cyclic
rotation (phase). Neither changes the element — and note that the *rendered* STRchive locus page shows the same tract as `CTG`/`CAG`, the unrotated spellings, so the four names are a matter of which representation you are reading, not of which locus.

This matters beyond bookkeeping — the antisense
transcript *PPP2R2B-AS1* runs across the repeat on the opposite strand and therefore carries a
**CUG** repeat in its RNA, which is why one 32-bp element can produce both CAG and CUG RNA foci.

**(d)** Repeat units × 3 bp:

| Allele (CAG units) | Tract (bp) | What it is |
|---|---|---|
| 10 | 30 | a common normal allele; essentially reference length |
| 32 | 96 | top of the quoted normal range (4–32 / 6–32, depending on source) |
| 43 | 129 | the threshold Srivastava et al. 2017 propose |
| 51 | 153 | the classical diagnostic threshold |
| 69 | 207 | top of the expanded range in the Indian founder families (Bahl et al. 2005) |
| 78 | 234 | top of the range STRchive records as pathogenic |

Hold those base-pair figures. Problem 4 is entirely about how they compare with a read length.

**(e)** Offset between builds:

```
146,878,727 - 146,258,290 = 620,437 bp
```

The hg19 interval addresses a position roughly **620 kb** away on GRCh38 — it lands ~322 kb outside
the 5′ end of the ~500-kb *PPP2R2B* gene body, so it is off the gene altogether, and nowhere near
the repeat. The failure is silent in
the worst way: the caller finds an interval, aligns reads to it, and emits a **normal-length
genotype with good depth**, because the region it looked at is ordinary sequence. You get a
confident negative, not an error. ([Ch 41 §8](../part-09-genomics/41-data-formats.md) on the
liftover tax; the general rule is that a coordinate without a build is meaningless, and a
coordinate with the *wrong* build is worse than missing.)

For completeness, GRCh38 → T2T-CHM13 is 147,414,733 − 146,878,727 = **536,006 bp** — and by (a)
that build carries a longer tract as well as a different offset, so a catalogue built for one
assembly is wrong twice over when pointed at another.

</details>

---

## 2. A referral fraction is not a prevalence

Two real results from Indian ataxia genetics:

- Sharma et al. 2022 genotyped roughly **5,600** ataxia referrals over ten years. **SCA12: 8.6%
  (490)**. **SCA2: 8.5% (482)**. SCA1: 4.8% (272). SCA3: 2.0% (113).
- Bahl et al. 2005, at a single North Indian centre, found SCA12 in **~16% (20/124)** of
  autosomal-dominant ataxia families.

**(a)** A press summary reports "SCA12 affects 8.6 per 100,000 people in India". Name every step
of the conversion that is missing, and say which of them could in principle be supplied.
**(b)** "SCA12 is now the commonest SCA in India, having overtaken SCA2." Test that claim against
the 490-versus-482 result. **[trap]**
**(c)** Why is Bahl's 16% roughly double Sharma's 8.6% without either being wrong?
**(d)** In Huntington disease, the frequency of ≥36 CAG alleles in European-ancestry populations
is as high as **1:400**, while clinical prevalence is **9.71:100,000**. Compute the ratio and
explain it. Do the same for SBMA: **1:6,887** males carry a pathogenic expansion, clinical
prevalence ~**1:300,000** males.
**(e)** What does (d) predict about the number of people in an endogamous Indian community carrying
a *PPP2R2B* allele in the 40–50 range, and why can you not turn that prediction into a number?

<details><summary>Solution</summary>

**(a)** A prevalence is cases ÷ population at a point in time. The referral fraction supplies
neither.

Missing from the numerator: the 490 are people who reached a tertiary genetics service over ten
years and were genotyped. That is not a prevalent case count — it omits everyone undiagnosed,
everyone diagnosed elsewhere, everyone who died before the window, and everyone whose tremor was
labelled essential tremor and never referred. Missing from the denominator: the catchment
population of that referral network, which is not defined and is not "India". The denominator is
supplyable in principle, by a defined-catchment or registry design; the numerator is not supplyable
from these data at all, because it needs complete case ascertainment in that catchment.

The honest position is the one the sources take. STRchive's machine-readable record carries no
per-100,000 rate at all (`prevalence: null`), and its rendered page offers only a qualitative
statement; neither GeneReviews nor Orphanet gives a rate; **no per-100,000 estimate for SCA12 exists anywhere**.
Anyone quoting one has extrapolated.

**(b) [trap]** The trap is treating 8.6% > 8.5% as an ordering. Of the 972 patients falling into
these two categories, 490 fell to SCA12. Under a null of equal true fractions that count is
Binomial(972, 0.5):

```
expected  = 972 x 0.5   = 486
SD        = sqrt(972 x 0.25) = sqrt(243) = 15.59
z         = (490 - 486) / 15.59 = 0.26      ->  p ~ 0.80
```

A difference of four patients against a standard deviation of nearly sixteen. The data are
completely consistent with the two being equally common. The defensible statement is **"SCA12 and
SCA2 are jointly the commonest SCA subtypes in Indian referral cohorts"** — which is a real and
striking finding, because in most of the world SCA12 is vanishingly rare (one family in 247
European index cases, Fujigasaki et al. 2001).

Note also what "overtaken" smuggles in: a change over time. This is a single ten-year cross-section.
([S4 §3](../part-S-statistics/S4-hypothesis-testing.md) on what a comparison does and does not
license.)

**(c)** Different denominators, both legitimate:

- Sharma: fraction of **all ataxia referrals**, dominant and recessive and sporadic together.
- Bahl: fraction of **autosomal-dominant ataxia families** at one centre.

Dominant families are a subset of all ataxia, so a subtype that is exclusively dominant occupies a
larger share of the smaller denominator. Add single-centre catchment — a North Indian centre draws
disproportionately from the community in which the founder allele sits — and a two-fold difference
needs no explaining beyond the two study designs. Neither number is a prevalence; they answer
different questions, and quoting one as though it were the other is the commonest error in this
literature.

**(d)** HD:

```
carrier frequency  1:400        = 250 per 100,000
clinical prevalence             = 9.71 per 100,000
ratio                           = 250 / 9.71 = 25.7-fold
```

SBMA:

```
ratio = 300,000 / 6,887 = 43.6-fold
```

The explanation is **reduced penetrance concentrated in the lowest allele band**. For HD, most of
the ≥36 alleles in the population are 36–39 repeats, whose penetrance across a typical lifespan is
**0.2%–2%**. Those carriers exist, are countable by genotyping, and mostly never become cases. So
carrier frequency and disease prevalence measure genuinely different things, and the gap between
them is not error — it is the size of the reduced-penetrance reservoir.

**(e)** The same shape must hold for SCA12, and more strongly, because SCA12's contested band is
wider than HD's. Non-penetrant carriers are documented directly: Fujigasaki et al. 2001 found the
expansion in **6 affected and 3 unaffected at-risk** individuals in one Indian family; carriers at
**45–62** repeats have been reported with very-late onset or none; Srivastava et al. found
**CAG-39 carriers unaffected** within an affected family. So carriers of 40–50 alleles must
outnumber SCA12 patients by some multiple greater than one.

You cannot put a number on it because the required measurement has not been made and is explicitly
flagged as unverified: there is no clean primary table of *PPP2R2B* normal-allele distributions in
the relevant populations. The frequently repeated claim that Indian controls reach 45 CAG while
French controls stop at 18 traces to a source that could not be verified, and gnomAD's
short-tandem-repeat data have not been checked for this locus. Until someone genotypes population
controls in the same community, the size of the reservoir is unknown.

Which is not a small gap. If Indian controls really carry alleles to 45, the Srivastava threshold
of 43 is in direct tension with the normal range in the very population that supplies most of the
patients. That single unmeasured distribution is doing more work in this field than any mechanism
paper.

</details>

---

## 3. Instability in transmission, and testing a parent-of-origin effect

**Constructed pedigree.** Repeat sizes are the expanded allele, in CAG units, sized by fragment
analysis in blood.

```
 I    I-1  M  AFFECTED  12/54      x  I-2  F  11/13
      I-3  F  AFFECTED  11/52      x  I-4  M  12/12

 II   children of I-1 (father transmits):
        II-1 M  13/56 | II-2 F  11/55 | II-3 M  13/54 | II-4 F  13/57
      children of I-3 (mother transmits):
        II-5 M  12/52 | II-6 F  12/53 | II-7 F  12/50 | II-8 M  12/53

 III  children of II-1 (father transmits, from 56):
        III-1 F  11/55 | III-2 M  12/57
      children of II-6 (mother transmits, from 53):
        III-3 M  12/53 | III-4 F  11/52
```

**(a)** Tabulate the 12 transmissions as (parent sex, size change). Compute the mean change per
transmission for each parental sex.
**(b)** Test for a parent-of-origin bias in the *direction* of change with an exact test on the
2 × 2 of parent sex against expanded/not-expanded, and separately with a *t*-test on the mean
changes. Report both and say why they agree.
**(c)** How many transmissions per parental class would you need to detect a true mean difference
of 1.0 repeat at 80% power? Compare with the only real SCA12 parent-of-origin dataset.
**(d)** Your fragment-sizing assay has a standard deviation of 1 repeat unit per measurement. What
is the standard deviation of a computed per-transmission change, and what does that do to
part (a)'s conclusion? **[trap]**
**(e)** A reviewer writes: "these sizes increase down the pedigree, so SCA12 shows anticipation."
Two things are wrong with that sentence. **[trap]**

<details><summary>Solution</summary>

**(a)** Twelve transmissions:

| Transmission | Parent | Parent size | Child size | Δ |
|---|---|---|---|---|
| I-1 → II-1 | father | 54 | 56 | +2 |
| I-1 → II-2 | father | 54 | 55 | +1 |
| I-1 → II-3 | father | 54 | 54 | 0 |
| I-1 → II-4 | father | 54 | 57 | +3 |
| II-1 → III-1 | father | 56 | 55 | −1 |
| II-1 → III-2 | father | 56 | 57 | +1 |
| I-3 → II-5 | mother | 52 | 52 | 0 |
| I-3 → II-6 | mother | 52 | 53 | +1 |
| I-3 → II-7 | mother | 52 | 50 | −2 |
| I-3 → II-8 | mother | 52 | 53 | +1 |
| II-6 → III-3 | mother | 53 | 53 | 0 |
| II-6 → III-4 | mother | 53 | 52 | −1 |

```
paternal:  +2, +1,  0, +3, -1, +1   mean = +6/6 = +1.00
maternal:   0, +1, -2, +1,  0, -1   mean = -1/6 = -0.167
difference                          = 1.167 repeats per transmission
```

Both magnitudes are inside the "few triplets" the retired GeneReviews SCA12 chapter describes for
this locus, and are an order of magnitude smaller than the polyQ ataxias and DM1 — where paternally
transmitted *DMPK* alleles increase by a median of **425** repeats against a maternal median of
**200**. Whatever SCA12 is doing, it is not doing that.

**(b)** Direction only, collapsing to expanded (Δ > 0) versus not (Δ ≤ 0):

|  | Expanded | Not expanded | Total |
|---|---|---|---|
| **Paternal** | 4 | 2 | 6 |
| **Maternal** | 2 | 4 | 6 |
| **Total** | 6 | 6 | 12 |

Margins are small and one cell is 2, so use the exact test rather than χ²
([Ch 26 §5](../part-05-population-genetics/26-hardy-weinberg.md) makes the same choice for the same
reason). Under the hypergeometric null with all margins fixed at 6:

```
P(a) = C(6,a) C(6,6-a) / C(12,6),   C(12,6) = 924

a=0  1/924    = 0.0011
a=1  36/924   = 0.0390
a=2  225/924  = 0.2435
a=3  400/924  = 0.4329
a=4  225/924  = 0.2435   <- observed
a=5  36/924   = 0.0390
a=6  1/924    = 0.0011
```

Two-sided p = sum of all tables no more probable than the observed one = (1+36+225+225+36+1)/924 =
524/924 = **0.567**.

Now the *t*-test on the magnitudes:

```
paternal  s^2 = 10/5      = 2.000
maternal  s^2 = 6.833/5   = 1.367
pooled    s^2 = 16.833/10 = 1.683,  s = 1.297
SE(diff)      = sqrt(1.683 x (1/6 + 1/6)) = 0.749
t             = 1.167 / 0.749 = 1.56,  df = 10,  p ~ 0.15
```

They agree because they are reading the same weak signal. The exact test throws away magnitude and
keeps only sign; the *t*-test keeps magnitude and assumes normality. Neither is close to
significance, and the exact test is the more conservative because it discarded information. **The
pedigree does not support a parent-of-origin effect.** Note carefully what that sentence is: a
failure to reject, not a demonstration that no effect exists — which is why (c) exists.

**(c)** Two-sample, two-sided, α = 0.05, power 0.80, σ = 1.3 (the pooled SD above), δ = 1.0:

```
n per group = 2 (z_0.025 + z_0.20)^2 sigma^2 / delta^2
            = 2 (1.96 + 0.84)^2 (1.3)^2 / 1
            = 2 x 7.84 x 1.69
            = 26.5   ->  27 transmissions per parental class, 54 in total
```

For a half-repeat difference, δ = 0.5, the requirement quadruples to **106 per class**.

The only real SCA12 parent-of-origin dataset is Choudhury et al. 2018: **7 maternal, 7 paternal,
1 from both parents**, in 21 patients. Against a requirement of 27 per class for a one-repeat
effect, invert the same formula at *n* = 7 to get the power that study actually had:

```
(z_0.025 + z_1-beta)^2 = n delta^2 / (2 sigma^2) = 7 / (2 x 1.69) = 2.071
z_1-beta               = sqrt(2.071) - 1.96 = 1.439 - 1.96 = -0.521
power                  = Phi(-0.521) = 0.30
```

So **about 25–30%** — 0.30 by the normal approximation used above, and ~0.25 by the exact
noncentral *t* (df 12, ncp 1.439, *t*<sub>crit</sub> 2.179), which is the honest figure because
*n* = 7 is nowhere near large enough for the normal approximation. Either way the study was three
times more likely to miss a one-repeat paternal bias than to find it. So "no parental bias
detected" in that paper is a statement about the study, not about the biology. Compare Huntington disease, where large
expansions occur almost exclusively through the paternal germline and the effect is so big that
small series find it — **SCA12 has no such finding, and no study has been powered to look for
one.** ([S4 §5](../part-S-statistics/S4-hypothesis-testing.md): compute the power of the test you
just ran, every time you report a null.)

**(d) [trap]** The trap is treating a Δ of ±1 as an observation. A change is a difference of two
independent measurements, so the variances add
([S5 §2](../part-S-statistics/S5-variance-and-regression.md)):

```
Var(delta) = 1^2 + 1^2 = 2      SD(delta) = sqrt(2) = 1.41 repeats
```

The measurement noise on a single Δ is **1.41 repeats**, which exceeds the entire paternal mean of
+1.00. Every Δ of 0 or ±1 in the table is inside one standard deviation of "no change at all". Only
the +3 is more than two measurement SDs from zero, and one observation out of twelve is not a
finding.

This is not a hypothetical objection. The reported germline behaviour of this locus — length
variations of a few triplets among sibship members — is the same size as fragment-sizing error.
Any study of SCA12 germline instability must therefore either replicate each sizing, or use an
assay with sub-repeat resolution, before its Δ column means anything
([Ch 17 §5](../part-03-genome-instability/17-dna-repair.md) has the slippage and loop-repair
mechanics that generate these small changes in the first place). If the paper does not say
which, its instability estimate is an upper bound on instability and a lower bound on assay noise,
mixed together.

**(e) [trap]** Two errors, and they are different.

**First: repeat size is not anticipation.** Anticipation is a clinical observation — **earlier
onset or greater severity in successive generations**. It is defined on ages, not on repeat units.
Repeat expansion is a candidate *mechanism* for anticipation, and the two are so routinely
conflated that the word is now used for both. This pedigree contains no onset ages at all, so it
cannot demonstrate anticipation whatever the sizes do.
([Ch 11 §11](../part-02-transmission-genetics/11-beyond-mendel.md) keeps the two apart;
[Ch 16 §9](../part-03-genome-instability/16-mutation.md) supplies the mechanism.)

**Second: the sizes do not increase.** Six paternal transmissions net +6; six maternal net −1;
across all twelve the mean change is +5/12 = **+0.42 repeats**, well inside the noise floor from
(d). The impression of increase comes from reading down the left-hand column of a table sorted by
generation.

And the substantive point behind both: **the current GeneReviews position is that there is
insufficient evidence for anticipation in SCA12**, superseding the retired 2011 chapter's
"moderate degree of anticipation", while patient-facing material states that the repeats typically
do not expand between generations. Three authoritative sources, three positions. SCA12 is the
counter-example to "repeat disease ⇒ anticipation ⇒ paternal bias", and the rules learned from
*HTT* and *DMPK* do not transfer to it automatically. Neither does the counter-claim: SCA6 shows no
anticipation either, and SCA8 reverses the bias entirely, expanding on **maternal** transmission
and contracting on paternal. The class is not one thing.

</details>

---

## 4. What a 150-base read can and cannot size

A PCR-free Illumina library: **2 × 150 bp** reads, mean insert **350 bp**, total depth **30×**. Your
caller requires **≥ 25 bp of unique flanking sequence** on each side of the repeat to trust an
alignment.

**(a)** Derive the longest repeat that a single read can *span* — contain entirely, with anchors
both sides — in repeat units. Compare with the normal range.
**(b)** Derive the shortest repeat that can produce an **in-repeat read** (a read lying wholly
inside the tract), and the longest repeat a single **flanking read** can evidence.
**(c)** From (a) and (b), partition allele length into evidence regimes. Which regime does the
contested 40–50 band fall into? **[trap]**
**(d)** Expected in-repeat reads from one haplotype at depth *C* is (*C*/2*r*)(*L* − *r* + 1) for
read length *r* and tract length *L*. Evaluate for alleles of 52, 60 and 78 repeats at 30×, and
compute the depth needed for five expected in-repeat reads at 52.
**(e)** What read length would you need to span a 52-repeat allele? A 69-repeat allele? What does
a 2 × 250 run buy you?

<details><summary>Solution</summary>

**(a)** A read of length *r* spans a tract of length *L* with anchors *a* on each side when
*r* ≥ *L* + 2*a*:

```
L_max = 150 - 2 x 25 = 100 bp
      = 100 / 3 = 33.3   ->  33 repeat units  (33 x 3 = 99 bp fits; 34 x 3 = 102 bp does not)
```

**Spanning-read sizing reaches 33 units.** The normal range is quoted as 4–32 or 6–32 depending on
source. So a 150-bp read sizes exactly the normal range and stops at its upper edge. Read that
again: the technology is precise for every allele about which nobody has a question, and blind from
the first allele about which anybody does.

**(b)** A read lies wholly inside the tract only when *L* ≥ *r*:

```
L >= 150 bp  ->  50 repeat units
```

A flanking read carries at most *r* − *a* = 150 − 25 = **125 bp** of repeat sequence, i.e. **41
units**, no matter how long the allele really is. Flanking evidence therefore **saturates at 41**.

**(c) [trap]** Four regimes, and the trap is assuming the caller degrades gracefully across them:

| Allele (units) | Tract (bp) | Evidence available | What you can say |
|---|---|---|---|
| ≤ 33 | ≤ 99 | spanning reads | exact size |
| 34–41 | 102–123 | flanking only | a bound, tightening towards 41 |
| **42–49** | **126–147** | **flanking saturated at 41; no spanning read; no in-repeat read** | **"longer than 41" and nothing more** |
| ≥ 50 | ≥ 150 | in-repeat reads, plus flanking | a depth-limited estimate — see (d) |

The 42–49 window has **no read class that can size it**. Not a poor estimate — no estimate. And it
sits precisely on the disputed band: STRchive calls 40–49 intermediate, Srivastava et al. argue 43
is the pathogenic floor, and symptomatic patients have been reported at 40 and 42. The assay is
least informative exactly where the field's open question lives, which is one reason the question
has stayed open.

This is the concrete version of the row in
[Ch 54 §9](../part-11-human-and-statistical-genomics/54-rare-variants-and-mendelian-disease.md) —
repeat expansions are "invisible by construction — the read is shorter than the repeat" — and of
the information limit in
[Ch 42 §9](../part-09-genomics/42-read-alignment.md). It is also why repeat expansions are excluded
from benchmark confident regions ([Ch 46 §13](../part-10-functional-genomics/46-variant-calling.md)):
there is no truth set to benchmark against; [Ch 46
§10](../part-10-functional-genomics/46-variant-calling.md) is the general statement of why short
reads fail on length variation of this kind.

**(d)** With *r* = 150, *C* = 30, so (*C*/2*r*) = 30/300 = 0.1 eligible start positions per base:

```
52 units, L = 156 bp:   0.1 x (156 - 150 + 1) = 0.1 x 7   = 0.7  in-repeat reads
60 units, L = 180 bp:   0.1 x 31              = 3.1
78 units, L = 234 bp:   0.1 x 85              = 8.5
```

At the clinically decisive length the expected in-repeat read count is **0.7**. Treating the count
as Poisson, the probability of seeing even one is 1 − e^(−0.7) = **50%**. A coin flip, at standard
clinical depth, for the read class the caller relies on.

Depth for five expected in-repeat reads at 52 units:

```
5 = (C / 300) x 7   ->  C = 5 x 300 / 7 = 214x
```

**214× whole-genome coverage** to get five in-repeat reads from a 52-repeat allele. Nobody
sequences rare-disease genomes at 214×. The gradient in the table is the reason short-read callers
perform respectably on huge expansions — *C9orf72* at hundreds to thousands of units, *DMPK* at
>1,000 — and badly on the modest ones. SCA12's entire pathogenic range is modest.

**(e)** Span requires *r* ≥ *L* + 50:

```
52 units = 156 bp  ->  206 bp read
69 units = 207 bp  ->  257 bp read
78 units = 234 bp  ->  284 bp read
```

A 2 × 250 run spans (250 − 50)/3 = **66 units**, which covers most but not all of the Indian
founder range of 51–69. It is a real improvement and not a solution.

Long reads move the constraint entirely: a HiFi or nanopore read exceeds any of these tract lengths
by three orders of magnitude, and the binding constraints become coverage, whether the library was
amplified (amplification biases against long tracts, so PCR-free matters more here than almost
anywhere), and per-read basecalling accuracy through a low-complexity tract
([Ch 40 §3](../part-09-genomics/40-sequencing-technologies.md)). That is the whole argument for
[lab 11](../labs/lab-11-repeat-genotyping.md)'s methods and for the platform-by-question table in
[Ch 40 §10](../part-09-genomics/40-sequencing-technologies.md).

</details>

---

## 5. ★ Reading three repeat-caller outputs

**Constructed output**, in the shape a targeted repeat genotyper emits. Same library parameters as
problem 4 unless stated.

```json
Sample A   depth 31x
{ "LocusId": "PPP2R2B",
  "Genotype": "11/52",
  "GenotypeConfidenceInterval": "11-11/44-63",
  "CountsOfSpanningReads": "(11, 24)",
  "CountsOfFlankingReads": "(11, 7), (30, 3), (41, 2)",
  "CountsOfInrepeatReads": "(52, 1)" }

Sample B   depth 8x
{ "LocusId": "PPP2R2B",
  "Genotype": "11/11",
  "GenotypeConfidenceInterval": "11-11/11-11",
  "CountsOfSpanningReads": "(11, 6)",
  "CountsOfFlankingReads": "(11, 2)",
  "CountsOfInrepeatReads": "()" }

Sample C   depth 34x
{ "LocusId": "PPP2R2B",
  "Genotype": "./.",
  "GenotypeConfidenceInterval": "./.",
  "CountsOfSpanningReads": "()",
  "CountsOfFlankingReads": "()",
  "CountsOfInrepeatReads": "()" }
```

**(a)** Sample A: which of the two allele calls do you believe, and why are they not equally
trustworthy? Check the in-repeat read count against your model from problem 4(d).
**(b)** Sample A's confidence interval is 44–63. State what clinical question that interval fails
to answer, and why widening the interval would not help. **[trap]**
**(c)** Sample B: the referring clinician reads "11/11" as excluding SCA12. Compute the power this
result had to detect a 52-repeat allele, and write the sentence you would put in the report.
**(d)** Sample C: give three candidate explanations for a locus with zero reads at 34× depth, and
the single cheapest check that discriminates among them.
**(e)** What confirmatory assay do you order for A, and what does each candidate assay actually
measure?
**(f)** Step back from the outputs. Given only the referral — *adult-onset action tremor with
ataxia, autosomal dominant family history* — which loci would you have interrogated **before** any
of this ran, and why is a negative panel across all of them not a negative answer?
**(g)** A paper reports that somatic instability of the *PPP2R2B* repeat differs between brain
regions in a single SCA12 brain. Name the measurement a claim of that shape must rest on, and two
ways that measurement fails. **[trap]**

<details><summary>Solution</summary>

**(a)** The two calls rest on completely different evidence.

**The 11 is solid.** Twenty-four spanning reads, each containing the whole tract with anchors both
sides, all agreeing. That is an exact measurement, and 11 units (33 bp) is comfortably inside the
33-unit spanning limit from problem 4(a).

**The 52 is an inference from one read.** One in-repeat read, plus a flanking-read distribution
that trails out to 41 — which is not evidence of 41, it is evidence of *saturation at 41*, exactly
as derived in 4(b). The expected in-repeat count for a 52-unit allele at ~30× was 0.7, and the
observation is 1. So the data are perfectly consistent with the call — and would have been almost
as consistent with zero in-repeat reads, and consistent with a 58-unit allele, and with a 46-unit
one. Agreement with expectation is not the same as constraint.

The general habit: read the evidence fields, not the genotype string. A caller's genotype is a
point estimate from a likelihood; the counts tell you how sharp the likelihood was
([S6 §4](../part-S-statistics/S6-likelihood-and-bayes.md)).

**(b) [trap]** The interval 44–63 straddles **51**, and it straddles **43**, and its lower end sits
above **40**. So it cannot distinguish:

- an allele in the classical diagnostic range (≥51),
- an allele in the band Srivastava et al. argue is pathogenic (43–50),
- an allele STRchive calls intermediate (40–49) with reduced penetrance.

The clinical question — *which of the three categories is this?* — is untouched by the result. The
trap is thinking the fix is a wider or better-calibrated interval. It is not: a wider interval
would be more honest and equally useless, and a narrower one would be a lie about the underlying
read evidence.

Worse, and this is the part that catches people who have got everything else right: **the
categories themselves are not measured quantities.** ≥51 is a long-standing laboratory convention;
43 is a proposal from 18 patients in 16 unrelated families; 40 and 42 are single symptomatic
reports. Narrowing the confidence interval to ±1 repeat would tell you the allele is 49 — and the
field would still not agree on what a 49 means. Two different uncertainties are in play, one
statistical and one nosological, and only the first one shrinks with better data.
([Ch 55 §4](../part-11-human-and-statistical-genomics/55-clinical-variant-interpretation.md) makes
the parallel point that "rare" is not a number; here, "pathogenic length" is not a number either,
and the ACMG framework has no clean slot for a continuously varying allele with a disputed floor.)

**(c)** At 8× depth, per problem 4(d), the expected in-repeat read count from a 52-unit allele on
one haplotype is:

```
(8 / (2 x 150)) x (156 - 150 + 1) = 0.0267 x 7 = 0.187
P(at least one in-repeat read) = 1 - e^-0.187 = 0.17
```

**The test had roughly 17% power** to produce its own positive signal. A "11/11" call at 8× is not
a negative result; it is an uninformative one, and it looks identical to a real homozygote.

Report sentence, or something close to it:

> Coverage at this locus (8×) is below the threshold at which an expanded allele would be reliably
> detected; the estimated probability of observing repeat-supporting reads from a 52-unit allele at
> this depth is approximately 0.17. **This result does not exclude an expansion.** Sizing by an
> orthogonal method is recommended before the locus is considered assessed.

The general rule is [S4 §5](../part-S-statistics/S4-hypothesis-testing.md)'s: absence of evidence
is worth reporting only alongside the power of the test that failed to find it. In a diagnostic
report, an unqualified negative from an underpowered assay is not a neutral act — it closes a line
of enquiry.

**(d)** Zero reads at 34× means the aligner put nothing there, or the caller looked in the wrong
place:

1. **Wrong build in the catalogue.** The hg19 interval against GRCh38 alignments points ~620 kb
   away (problem 1(e)) — though note that would usually give a *confident normal call* on ordinary
   sequence rather than zero reads, so this is the least likely of the three here.
2. **Wrong contig naming.** `chr5` versus `5`. The caller finds no such contig, emits no reads, and
   frequently does so without an error ([Ch 41 §8](../part-09-genomics/41-data-formats.md)).
3. **Target not captured.** If this is an exome or a panel rather than a genome, a 5′ UTR repeat may
   simply not be in the bait set — which is the standard reason repeat expansions survive a negative
   exome ([Ch 40 §8](../part-09-genomics/40-sequencing-technologies.md)).

Cheapest discriminating check: **look at the BAM directly over the locus interval** and at the BAM
header's contig names. One command answers all three — if reads are present in the alignment but
absent from the caller's output, it is (1) or (2); if the alignment is empty there too, it is (3).
Check the plumbing before the biology.

**(e)** For sample A, three assays, three different measurements:

| Assay | What it actually measures | Where it fails |
|---|---|---|
| **Fragment-length PCR** | precise size of amplifiable alleles | large alleles amplify poorly or not at all — allele dropout makes a heterozygote look homozygous |
| **Repeat-primed PCR** | *presence* of a long uninterrupted tract, as a decaying sawtooth trace | gives **no size**; answers "is there an expansion" and not "how big" |
| **Long-read sequencing of the amplicon or locus** | size, plus interruption structure and methylation | needs the tract to be captured or amplified without length bias; costlier per sample |

For an allele called at 52 with an interval spanning three clinical categories, the honest order is
**fragment-length PCR for a size, with repeat-primed PCR alongside it** — the pair is designed to
cover each other's blind spots: RP-PCR detects the allele that fragment PCR drops, and fragment PCR
sizes the allele RP-PCR can only detect. Long-read sizing settles it and also reads out whether the
tract is interrupted, which at other loci (*ATXN1*'s CAT, *FMR1*'s AGG) changes the interpretation
entirely — and which nobody has systematically examined at *PPP2R2B*.

**(f)** A repeat panel is not a survey of the genome; it is a **list of loci someone chose**, which
means the differential is decided before any output is printed. For adult-onset action tremor with
ataxia and a dominant family history, the list has four parts and one appendix:

| Locus | Motif and place | Why it is on the list |
|---|---|---|
| ***PPP2R2B*** (SCA12) | CAG, 5′ region | The presenting sign matches exactly — tremor was the first symptom in 90% of Choudhury et al.'s 21 patients and was present at presentation in 95.9% of Ganaraja et al.'s 49 |
| The polyQ SCAs — *ATXN1*, *ATXN2*, *ATXN3*, *CACNA1A*, *ATXN7*, *ATN1*, *TBP* | CAG in coding sequence | The dominant ataxias a pedigree of this shape names first, and the class the panel was originally built around |
| ***FGF14*** (SCA27B) | GAA, deep intron 1 | Reported in 2023 as among the commonest causes of late-onset ataxia — 61% of French-Canadian index patients in the discovery cohort. Dominant, and it was invisible to thirty years of ataxia genetics |
| ***FMR1*** premutation (FXTAS) | CGG, 5′ UTR, 55–200 | A late-onset tremor–ataxia syndrome. X-linked, but affected men in successive generations connected through unaffected carrier women can read as dominant on a referral letter |
| *appendix:* ***RFC1*** (CANVAS) | biallelic AAGGG replacing AAAAG, intron 2 | Recessive — the locus you add the moment the "dominant family history" softens on questioning, which it often does |

Then the second half of the question, which is the half that matters. **A negative panel is a
statement about the panel.** Four separate reasons, and they fail in different ways:

1. **The catalogue is a hypothesis.** A caller reports only loci it was given. SCA27B and CANVAS sat
   undiscovered through three decades of molecular ataxia genetics and fifteen years of short-read
   sequencing of exactly the right patients — the DNA was in the freezer and the reads were too short
   to spell it. Absence from the catalogue is not absence from the genome.
2. **Per-locus power, not panel-level power.** Parts (a)–(c) above: a normal call is worth only the
   depth and the read class behind it, and problem 4(c) showed a whole allele window — 42–49 units at
   *PPP2R2B* — with no read class capable of sizing it at all. A panel that is well powered at
   *C9orf72* can be blind at a locus whose pathogenic range is modest.
3. **Length is not always the variable.** At *RFC1*, SCA31 and SCA37 the mutation is a **motif
   substitution or insertion**, not a longer tract, so a tool reporting only a length has measured
   the wrong quantity and will report it as normal.
4. **The thresholds are conventions, and one of them is contested.** A call of 46 at *PPP2R2B* is
   "negative" against ≥51 and "positive" against the ≥43 proposal — see problem 7(d).

So for this phenotype a negative short-read result should **raise** the posterior on a repeat
expansion rather than lower it, because it has eliminated the variant classes short reads are good
at. The correct next step is a test designed for repeats — flanking PCR with repeat-primed PCR, then
long reads for a size — not a larger sequencing panel. In the vocabulary of
[D4](../part-D-sca12/D4-sca12-from-repeat-to-phenotype.md)'s causal-chain section, the *PPP2R2B*
expansion → SCA12 association is **Established**, which is precisely why an assay-limited negative is
the thing to distrust; the mechanism is not established, and none of the ordering above depends on it.

**(g) [trap]** A claim that instability differs *between regions of one brain* is a claim about the
**distribution of repeat lengths across individual DNA molecules** in each region — not about an
allele size. One number per region cannot carry it; the measurement is a per-molecule length
distribution, and its width, or the mass of it lying above the inherited allele, is the quantity
being compared. Three ways to obtain one: long reads, which report a length per molecule directly
([lab 11](../labs/lab-11-repeat-genotyping.md)'s long-read section does exactly this); **small-pool
PCR**, where the template is diluted until each reaction starts from a handful of molecules so that
each product reports one molecule's length; or an **expansion index** computed from the shape of a
capillary trace, which summarises how far the trace's mass sits beyond the constitutional peak.
(Neither wet-lab assay has an entry in this course's verified-facts file — lab 11 flags the same
gap — so the names and the logic are orientation, not sourced method; the argument here needs only
that each yields a distribution rather than a single allele size.)

Two failure modes, and the first is the trap.

**One: the error floor is one-sided and looks exactly like mosaicism.** In lab 11, HG002 is 10/10 at
its locus and the per-read counts still run 5, 6, 7, 9, 9, 9 and 10 — dropped units, not gained
ones, generated by the instrument and the aligner. PCR slippage does the same thing to a capillary
trace: stutter is manufactured by the assay. Without the floor characterised on material known to be
clonal at that locus, **in the same assay and the same fixation**, a distribution's width is biology
and noise in unknown proportion. And the noise has a regional confounder built in: post-mortem
interval, fixation and extraction quality vary between blocks, so a difference in DNA quality
between regions reproduces a difference in "instability" between regions with no biology at all.

**Two: the unit sampled is a piece of tissue, not a cell type.** A brain region is a mixture, and
cerebellum's mixture is dominated by granule cells (problem 13 does that arithmetic). A regional
difference in a length distribution may be a difference in **cell composition** rather than in
per-cell instability — and the cells that die may be a vanishing minority of the ones that
contributed DNA. Add *n* = 1: with one brain, every between-region difference is confounded with
everything else about that individual, and there is no replicate to separate them.

None of which makes the observation uninteresting — the direction is the interesting part, because
the cerebellum showing the *least* instability is the opposite of Huntington disease, where the
striatum shows the most. On the ladder: that a single SCA12 brain showed regional differences in
repeat length is **Supported** at best — one brain, one design class — and any account of neuronal
death built on it is **Conjectured**.

</details>

---

## 6. ★ Onset age against repeat length

**Constructed cohort**, ten genotyped, affected SCA12 patients from a single referral clinic:

```
repeat (CAG)   44  46  48  50  52  54  56  58  60  62
onset (yr)     72  52  63  66  39  58  39  47  27  42
```

Summary statistics, to save you the sums: x̄ = 53, ȳ = 50.5, *S*<sub>xx</sub> = 330,
*S*<sub>xy</sub> = −587, *S*<sub>yy</sub> = 1818.5, *n* = 10.

**(a)** Fit the least-squares line. Report slope, intercept, *r*, *r*² and the *p*-value on the
slope.
**(b)** Give a 95% confidence interval on the slope, then a 95% **prediction interval** for the
onset age of a newly identified 45-repeat carrier. Say which one a genetic counsellor needs.
**(c)** Every patient here was recruited because they were already affected. Work out the direction
in which that biases the slope. **[trap]**
**(d)** Two real Indian cohorts disagree: Choudhury et al. 2018 report **r = −0.760, P = 0.0001**
(*n* = 21); Ganaraja et al. 2022 report **no significant correlation** (*n* = 49). Srivastava et al.
2017 report **r = −0.65, P < 10⁻⁴** (*n* = 124). A colleague says the Ganaraja null is just small
*n*. Test that claim.
**(e)** Ganaraja's cohort has mean expanded repeat **53.26 ± 6.10**. Test whether restriction of
range explains the null.

<details><summary>Solution</summary>

**(a)** Standard least squares ([S5 §4](../part-S-statistics/S5-variance-and-regression.md)):

```
b = S_xy / S_xx      = -587 / 330      = -1.779 yr per repeat
a = ybar - b xbar    = 50.5 + 1.779(53) = 144.8 yr
r = S_xy / sqrt(S_xx S_yy) = -587 / sqrt(330 x 1818.5) = -587 / 774.7 = -0.758
r^2 = 0.574

SSE   = S_yy (1 - r^2) = 1818.5 x 0.426 = 774.4
s^2   = SSE / (n - 2)  = 774.4 / 8      = 96.8       s = 9.84 yr
SE(b) = s / sqrt(S_xx) = 9.84 / 18.17   = 0.542
t     = -1.779 / 0.542 = -3.28,  df = 8  ->  p ~ 0.011
```

A strong, significant negative relationship: **each extra repeat brings onset forward by about 1.8
years**, and repeat length accounts for 57% of the variance in onset age. If you stopped here you
would write a confident paragraph.

**(b)** With *t*<sub>0.025,8</sub> = 2.306:

```
CI on slope = -1.779 +/- 2.306 x 0.542 = -1.779 +/- 1.249  ->  (-3.03, -0.53) yr per repeat
```

The slope could be −0.5 or −3.0; the data barely constrain it within a six-fold range.

Prediction at *x* = 45 needs the **prediction** interval, which carries the residual scatter of a
new individual and not just the uncertainty in the fitted line:

```
yhat  = 144.8 - 1.779 x 45 = 64.7 yr
SE_pred = s sqrt(1 + 1/n + (x - xbar)^2 / S_xx)
        = 9.84 sqrt(1 + 0.100 + 64/330)
        = 9.84 sqrt(1.294) = 11.19
95% PI = 64.7 +/- 2.306 x 11.19 = 64.7 +/- 25.8  ->  (38.9, 90.5) yr
```

**The counsellor needs the prediction interval, and it is useless.** "Your expected onset is 65,
and the interval runs from 39 to 90" is not information a 30-year-old can act on. The confidence
interval on the slope answers a scientific question — *is there a relationship, and how steep* —
and the prediction interval answers the clinical one, and the second is always the wider. Reporting
the first as though it were the second is the most consequential misuse of a regression in genetic
counselling, because it makes a population trend sound like a personal forecast.

Nothing about this is specific to a small dataset. Even in Huntington disease, where CAG length
explains **50–70%** of onset variance depending on cohort and model, the residual scatter is tens
of years, and the field's canonical model (Langbehn et al. 2004, *n* = 2,913) is deliberately built
as a **conditional probability of onset by a given age**, not a predicted age. That framing exists
precisely because a point prediction is indefensible.

**(c) [trap]** The trap is thinking the ascertainment inflates the correlation. It attenuates it.

Every patient in this cohort had onset **before** recruitment. That censoring does not hit all
repeat lengths equally. A 62-repeat carrier, whose expected onset is in their thirties, is almost
certainly affected by the time a clinic sees them. A 44-repeat carrier whose true onset would be
72 is only in the cohort if they were recruited after 72; the ones destined for late onset — and
the ones who never convert at all — are missing.

So the **high-onset tail is removed preferentially at the low-repeat end**, which lowers the
observed mean onset at low *x*, which flattens the line:

```
schematic, true means vs what a clinic observes

  x = 44   true mean onset ~65   observed only if onset < recruitment age  ->  observed ~52
  x = 62   true mean onset ~35   nearly everyone captured                  ->  observed ~35

  observed slope = (35 - 52) / (62 - 44) = -0.94
  true slope     = (35 - 65) / 18        = -1.67
```

**The true relationship is probably steeper than the fit.** And the confidence interval in (b)
covers none of this, because censoring is a bias, not a variance: it shifts the estimate, and
collecting more patients the same way shifts it no less.

Two further consequences worth stating out loud. The regression contains **no unaffected carriers
at all**, so it says nothing whatever about penetrance — and unaffected carriers at 45–62 repeats
are documented, along with unaffected CAG-39 carriers within an affected family. And this is the
same machinery that generated a century of spurious anticipation claims: ascertaining parent–child
pairs who are both in clinic at once selects for late-onset parents and early-onset children
([Ch 11 §11](../part-02-transmission-genetics/11-beyond-mendel.md);
[Ch 16 §9](../part-03-genome-instability/16-mutation.md)).

**(d)** Test the claim rather than accepting it. What is the smallest correlation Ganaraja's *n* =
49 could detect?

```
critical r at alpha = 0.05 two-sided, df = 47:
  t_crit = 2.012
  r_crit = t_crit / sqrt(t_crit^2 + df) = 2.012 / sqrt(4.05 + 47) = 2.012 / 7.15 = 0.282
```

Now the power to detect Srivastava's *r* = −0.65 at that *n*, via Fisher's *z*
([S5 §3](../part-S-statistics/S5-variance-and-regression.md) for the transform):

```
z(0.65)  = atanh(0.65) = 0.775
z(0.282) = atanh(0.282) = 0.289
SE       = 1 / sqrt(n - 3) = 1 / sqrt(46) = 0.147
Z        = (0.289 - 0.775) / 0.147 = -3.30
power    = P(Z > -3.30) = 0.999
```

**99.9% power.** And for Choudhury's −0.760 it is higher still. So the colleague is wrong: *n* = 49
was not underpowered to find the effect the other two cohorts report. For calibration, that *n* has
82% power even for *r* = −0.40.

This is a **genuine disagreement between cohorts**, not a power failure, and it is one of the open
questions in the field — listed as unresolved alongside the pathogenic threshold and the direction
of the expression change. Note what makes it hard to adjudicate: Ganaraja reports "no significant
correlation" without an effect size. **An unreported *r* cannot be meta-analysed, compared, or
pooled.** Reporting a verdict instead of an estimate removes a study from the cumulative record
([S4 §3](../part-S-statistics/S4-hypothesis-testing.md)).

**(e)** Restriction of range is the standard explanation for a correlation vanishing between
cohorts, and it is testable here because Ganaraja gives the spread. With slope and residual
variance held at this problem's values:

```
Ganaraja:  SD(x) = 6.10,  n = 49   ->  S_xx = 48 x 6.10^2 = 48 x 37.21 = 1786
           b^2 S_xx = (1.779)^2 x 1786 = 3.164 x 1786 = 5651
           SSE      = (n - 2) s^2     = 47 x 96.8      = 4550
           r^2      = 5651 / (5651 + 4550) = 0.554     ->  r = -0.744
```

Under range restriction alone, that cohort should still have seen *r* ≈ −0.74. Restriction of range
does **not** explain the null.

There is a sharper version of the same check. This constructed cohort's own spread is

```
SD(x) = sqrt(S_xx / (n-1)) = sqrt(330/9) = sqrt(36.67) = 6.06
```

— essentially identical to Ganaraja's 6.10. The two cohorts span the same range of repeat lengths.
Whatever separates them, it is not the *x*-axis.

So the disagreement stands, and the candidate explanations that remain are the interesting ones:
different ascertainment (which by (c) can move a slope a long way), different onset definitions
(first symptom noticed versus first symptom recorded, in a disease whose first symptom is a tremor
people live with for years), or a real modifier difference between the sampled families. None has
been tested. Two small Indian cohorts, largely from the same founder community, contradicting each
other on the most basic genotype–phenotype question in the disease — and the correct answer for now
is that we do not know whether repeat length predicts onset in SCA12.

</details>

---

## 7. Predictive testing against a threshold that moves

A 38-year-old woman is referred for predictive testing. Her father was diagnosed with SCA12 at 44
and sized at **CAG 52** in blood, aged 60. She has no symptoms and a normal neurological
examination. She has not been tested.

Take onset in carriers to be normally distributed with mean **46.38** and SD **11.7** years — the
real cohort figures from Ganaraja et al. 2022 — and treat that normal approximation as an
assumption of the model rather than a fact about the disease.

**(a)** Compute her age-specific penetrance at 38, and her posterior probability of carrying the
expanded allele.
**(b)** Repeat at 50 and at 60. What does the trajectory tell her about the value of waiting?
**(c)** Redo (a) and (b) using Choudhury et al. 2018's cohort figures instead — mean **51.33**,
SD **8.98**. Quantify how much the answer depends on which paper you opened.
**(d)** She proceeds to testing. The result is **CAG 46/12**. Two separate problems with that
result, before you counsel anybody. **[trap]**
**(e)** Assume 46 is confirmed. What do you tell her about her own risk, and about her children's?
**[trap]**

<details><summary>Solution</summary>

**(a)** Penetrance by age 38 under the stated model:

```
z    = (38 - 46.38) / 11.7 = -0.716
Phi(-0.716) = 0.237    ->  penetrance by 38 = 23.7%
P(unaffected at 38 | carrier) = 1 - 0.237 = 0.763
```

Four-row table, as in [Ch 15 §5](../part-02-transmission-genetics/15-pedigrees.md):

| | Carrier | Not a carrier |
|---|---|---|
| **Prior** (child of an affected heterozygote) | 1/2 | 1/2 |
| **Conditional**: unaffected at 38 | 0.763 | 1 |
| **Joint** | 0.3815 | 0.5 |
| **Posterior** | 0.3815 / 0.8815 = **0.433** | 0.567 |

**43%**, down from 50%. Twelve symptom-free years past the earliest quoted onset have bought her
almost nothing, because at 38 most carriers are still unaffected. The evidence is weak because the
two hypotheses assign the observation similar probabilities — 0.763 against 1 — which is the same
diagnostic as [ps 04](ps-04-pedigrees-and-risk.md) problem 4(d): evidence is only evidence when the
hypotheses disagree about it.

**(b)**

```
age 50:  z = (50 - 46.38)/11.7 =  0.309   Phi = 0.622   unaffected: 0.378
         posterior = 0.378 / 1.378 = 0.274
age 60:  z = (60 - 46.38)/11.7 =  1.164   Phi = 0.878   unaffected: 0.122
         posterior = 0.122 / 1.122 = 0.109
```

| Age | P(carrier) |
|---|---|
| 38 | 43% |
| 50 | 27% |
| 60 | 11% |

Waiting is informative, and slowly. The whole of her forties buys a fall from 43% to 27% — real,
but not a resolution — and she must live those years not knowing. This is exactly the shape that
makes predictive testing for adult-onset untreatable disease a decision about how someone wants to
live rather than a medical calculation
([Ch 58 §8](../part-12-applications-and-ethics/58-ethics-and-society.md);
[Ch 15 §7](../part-02-transmission-genetics/15-pedigrees.md) on turning a number into a decision).
It also has the uncomfortable property that a decision to defer is not neutral: her risk of having
children before she knows falls with the same clock.

**(c)** With mean 51.33, SD 8.98:

```
age 38:  z = -1.484   Phi = 0.069   unaffected 0.931   posterior = 0.931/1.931 = 0.482
age 50:  z = -0.148   Phi = 0.441   unaffected 0.559   posterior = 0.559/1.559 = 0.359
age 60:  z =  0.966   Phi = 0.833   unaffected 0.167   posterior = 0.167/1.167 = 0.143
```

| Age | Ganaraja (46.38 ± 11.7) | Choudhury (51.33 ± 8.98) |
|---|---|---|
| 38 | 43% | 48% |
| 50 | 27% | 36% |
| 60 | 11% | 14% |

At 50 the two cohorts differ by nine percentage points — a third of the smaller estimate — from
nothing but the choice of paper. And a third source would move it again: the German-American index
family looks like a fourth-decade disease at 34–38 years, and STRchive gives a typical onset window
of 26–50 with a full range of 8–62. The index family's mean is more than a decade below either
Indian cohort, and no published work resolves why; ascertainment, founder repeat-length
differences and modifier background are all candidates and none is demonstrated.

The operational lesson: **name the cohort in the report.** "Assuming the onset distribution reported
by Ganaraja et al. in a 49-patient Indian cohort, her residual risk at 50 is approximately 27%"
is defensible. "Her risk at 50 is 27%" is not, because it conceals a choice that moved the answer
by a third.

**(d) [trap]** Two problems, and the first is not the one most people reach for.

**Problem one: 52 → 46 is a six-repeat contraction.** Germline instability at this locus is
described as modest — length variations of a **few triplets** among sibship members. A drop of six
is outside that description. Before interpreting anything, consider in order: a sizing error on one
of the two measurements (problem 3(d): a computed Δ carries SD ≈ 1.4 repeats even with a good
assay, but not six); the father's 52 being a *blood* measurement taken at 60, when somatic
mosaicism across tissues is documented in this disease
([Ch 17 §5](../part-03-genome-instability/17-dna-repair.md)) and the germline allele he transmitted
decades earlier is not the allele you sized; a sample mix-up; or non-paternity. **Re-test both,
from fresh samples, before any counselling.**

**Problem two: 46 is not a negative result, and it is not a positive one.** The temptation is
"46 < 51, therefore normal". Against that:

| Evidence | Value |
|---|---|
| Shortest reported pathogenic allele | **46** (Dong et al. 2015) |
| Proposed threshold | **≥43** (Srivastava et al. 2017; 18 patients, 16 unrelated families) |
| Symptomatic patients reported at | **40 and 42** (Ganaraja et al. 2022) |
| STRchive intermediate band | **40–49**, tagged as length-affecting-penetrance |
| Classical diagnostic threshold | **≥51** |
| Unaffected carriers documented at | **CAG-39** within an affected family; 45–62 with late or no onset |

46 sits in the middle of a band where the field disagrees with itself, and it happens to be exactly
the shortest allele anyone has published as pathogenic. The correct report is that the allele lies
**in a range where pathogenicity has been reported but is not established**, never "negative".

Note also that the ACMG/AMP framework
([Ch 55](../part-11-human-and-statistical-genomics/55-clinical-variant-interpretation.md)) has no
comfortable slot for this. Its criteria are built for discrete variants with population frequencies
and functional assays, not for a continuous length with a disputed floor and no verified control
distribution. This is a real gap in the framework, not a failure of the person filling in the form.

**(e) [trap]** Two traps here, one on each side of the pedigree.

**Her own risk.** She carries an allele in the contested band. Her risk of developing SCA12 is not
the 43% of part (a) — she is a carrier, so the prior is gone — but it is also not the penetrance
curve of part (a), which was built from a cohort whose **mean expanded repeat is 53.26** and which
therefore describes longer alleles than hers. The lower band carries reduced, apparently
age-dependent penetrance: carriers at 45–62 have been observed with very-late-onset disease and
with none. Nobody has published an age-specific penetrance curve for 43–50 alleles. So the answer
is: her risk is lower than the curve in (a) and greater than zero, and **the size of the reduction
has not been measured.** Say that, rather than substituting the curve you happen to have.

**Her children's risk.** Each child has a **1/2** chance of inheriting the allele — that part is
plain autosomal dominant segregation and does not depend on any of the above. The trap is the
next sentence people want to say: that the allele will expand and the child will be worse affected.
You cannot say it. Current GeneReviews finds **insufficient evidence for anticipation** in SCA12;
the only parent-of-origin dataset is 7 versus 7 in 21 patients; patient-facing material states the
repeats typically do not expand between generations. There is no expansion probability to quote,
and inventing one from the *HTT* or *DMPK* literature would be importing a rule from a locus whose
repeat sits in a completely different place.

What you can say: 1/2 to inherit; if inherited, an allele in a band whose penetrance is unmeasured;
and that the threshold itself has moved downward twice since 2015, so a future re-analysis may
reclassify this result in either direction — which creates a duty to recontact
([Ch 55 §9](../part-11-human-and-statistical-genomics/55-clinical-variant-interpretation.md)).

</details>

---

## 8. ★ A founder allele in an endogamous community

Real anchors for this problem: Bahl et al. 2005 typed 20 Indian SCA12 families with four novel SNPs
and a dinucleotide marker spanning ~137 kb around the repeat, and found **one haplotype
significantly associated with the expanded alleles (P = 0.000)**; the **same haplotype is absent
from the American index pedigree's expanded chromosome**. Expanded alleles in the Indian families
ran **51–69**. Ganaraja et al. 2022 report **79.6% Agarwal** ancestry in a 49-patient cohort, with
**10.2% explicitly non-Agarwal**. Srivastava et al. 2017 identified **two biallelic carriers** —
one homozygous CAG-45/45, one compound CAG-42/51 — neither differing from heterozygous CAG-51
carriers; the same paper's genotype–onset analysis used **124 unrelated patients**.

**Constructed founder scenario.** A community founded by 200 individuals, exactly one of whom
carried the expanded allele. Effective size thereafter *N*<sub>e</sub> = 500, and 20 generations
have passed.

**(a)** Compute the founding allele frequency, and the probability that this allele was ultimately
lost by drift alone.
**(b)** Compute the drift variance in frequency after 20 generations, and interpret the ratio of
its SD to its mean. **[trap]**
**(c)** With a community inbreeding coefficient *F* = 0.03 and an expansion-allele frequency
*p* = 0.004, compute the expected frequency of biallelic individuals and the fold excess over
random mating.
**(d)** Use the two observed biallelic carriers to estimate *F*, and give an interval. What
competing explanation must you exclude first?
**(e)** The Indian founder haplotype is absent from the American pedigree. State what that
establishes, and what it means for a diagnostic laboratory in a third population.

<details><summary>Solution</summary>

**(a)**

```
p_0 = 1 / (2 x 200) = 1/400 = 0.0025
```

Under neutrality the probability that an allele is ultimately fixed equals its current frequency
([Ch 27 §4](../part-05-population-genetics/27-the-four-forces.md)), so:

```
P(ultimate fixation) = 0.0025
P(ultimate loss)     = 1 - 0.0025 = 0.9975
```

**99.75% of founder alleles like this one vanish.** Every founder effect anyone studies is drawn
from the surviving 0.25%. That is survivorship bias built into the object of study, and it means
"this allele reached high frequency, so something must have favoured it" is an inference with no
support: the drift explanation is not merely adequate, it is what you expect to see conditional on
seeing anything at all.

**(b)** Variance in allele frequency after *t* generations of drift from *p*<sub>0</sub>:

```
Var(p_t) = p_0 (1 - p_0) [1 - (1 - 1/(2 N_e))^t]
         = 0.0025 x 0.9975 x [1 - (0.999)^20]
(0.999)^20 = exp(20 x ln 0.999) = exp(-0.02001) = 0.98019
         = 0.0024938 x 0.019810 = 4.94e-5
SD(p_t)  = 0.00703
```

**[trap]** The trap is reading SD = 0.0070 against mean = 0.0025 as an ordinary noisy estimate and
quoting a symmetric interval. The SD is nearly **three times the mean**, and frequency cannot go
below zero, so the distribution is nothing like normal: it is a large point mass at exactly zero
plus a long right tail. The expectation is unchanged at 0.0025 precisely because a small
probability of a much higher frequency balances a large probability of nothing.

That shape is what a founder effect *is*
([Ch 27 §7](../part-05-population-genetics/27-the-four-forces.md), bottlenecks and founder effects).
Drift has no direction and no mean shift; the enrichment appears entirely through conditioning on
survival. The Ashkenazi *BRCA1* and Tay–Sachs alleles and the Ellis–van Creveld allele are the same
phenomenon in different communities, and so is this one.

**(c)** With inbreeding, homozygote frequency is *p*² + *Fp*(1 − *p*)
([Ch 26 §8](../part-05-population-genetics/26-hardy-weinberg.md);
[Ch 28 §2](../part-05-population-genetics/28-structure-and-inbreeding.md)):

```
p^2          = 0.004^2                    = 1.600e-5
F p (1 - p)  = 0.03 x 0.004 x 0.996       = 1.195e-4
total        =                              1.355e-4  ~ 1 in 7,379

fold excess over random mating = F/p + (1 - F) = 7.5 + 0.97 = 8.47x
```

Check by division: 1.355e-4 / 1.600e-5 = 8.47 ✓. The identity *F*/*p* + (1 − *F*) is the same one
that drove the consanguinity arithmetic in [ps 04](ps-04-pedigrees-and-risk.md) problem 6, and it
carries the same moral: the inbreeding term is **linear** in *p* while the random-mating term is
**quadratic**, so the rarer the allele, the more inbreeding dominates.

Note what this does *not* say. SCA12 is dominant, so a biallelic carrier is not a different disease
category — and indeed neither of the two reported biallelic carriers differed from heterozygous
CAG-51 carriers in onset or severity, i.e. **no dosage effect was detected, in a sample of two**.
Biallelic carriers here are a *population-genetic* readout, not a clinical one.

**(d)** Condition on a person already carrying one expanded allele. Under inbreeding, the second
allele is identical by descent with probability *F*, and otherwise drawn from the population at
frequency *p*:

```
P(second allele expanded | one expanded) = F + (1 - F) p  ~  F   when p is small
```

Observed: 2 biallelic among 124 unrelated patients = 0.0161. Since *p* is certainly small (part (e)
of problem 2), essentially all of that is the *F* term:

```
Fhat ~ 0.0161  ~  1/62
```

which is very close to **1/64 = 0.0156, the inbreeding coefficient for second cousins.** The two
biallelic carriers are better explained by parents who were modestly related than by a high
expansion-allele frequency — and the alternative is arithmetically untenable: if *F* were zero,
the same observation would force *p* ≈ 0.0161, which under dominant inheritance implies a disease
frequency near 2*p* ≈ 3,200 per 100,000. No ataxia service in the world sees that.

The interval, because *n* = 2 and a point estimate from two events would be indefensible. An exact
binomial interval on 2/124 runs roughly:

```
95% CI ~ (0.002, 0.058)   ->  F somewhere between ~1/500 and ~1/17
```

An order of magnitude wide on each side. The estimate is real and the precision is nil.

**The competing explanation to exclude first** is not inbreeding at all: it is **ascertainment
through families**. If the 124 "unrelated" patients were recruited through affected relatives, or
if the community practises assortative mating in ways that correlate with the referral route, the
biallelic count is inflated by sampling rather than by *F*. The cheap discriminating check is
genomic: **runs of homozygosity** in the biallelic patients
([Ch 28 §5](../part-05-population-genetics/28-structure-and-inbreeding.md)) measure *F* directly
from each individual's own genome, without asking anyone about their grandparents and without
depending on how the cohort was assembled.

**(e)** The haplotype result establishes two things, and they are usually stated as one.

**Within India: a single founder.** One haplotype carried by expanded chromosomes across 20
families at P = 0.000, over markers spanning ~137 kb, means those expanded chromosomes descend from
one ancestral chromosome. It is a textbook founder demonstration made without a genome — four SNPs
and a dinucleotide marker, and the argument closes.

**Across populations: at least two independent origins.** The American index pedigree's expanded
chromosome does **not** carry that haplotype. Since the same expansion sits on two different
haplotype backgrounds, the mutation arose at least twice. So SCA12 is not one ancient event that
spread; the *PPP2R2B* tract is a site that can expand, and it has done so more than once.

For a diagnostic laboratory in a third population, three consequences:

1. **Do not use haplotype as a proxy for genotype.** A negative for the Indian founder haplotype
   excludes nothing. Size the repeat.
2. **Do not use ancestry as a rule-out.** SCA12 is **founder-enriched, not founder-restricted** —
   10.2% of a 49-patient Indian cohort were explicitly non-Agarwal, ~18% came from southern India,
   and cases exist in French, Italian, Thai, Turkish and Chinese series. A Chinese case report
   concludes SCA12 "may be underdiagnosed" there. The prior differs by ancestry; it is not zero
   anywhere.
3. **Do not convert the prior into a policy without thinking about who bears the cost.** Testing
   preferentially by surname or community is how a founder finding turns into a group harm
   ([Ch 58 §5](../part-12-applications-and-ethics/58-ethics-and-society.md)), and testing only
   European-ancestry patients is how the ancestry bias in genomics reproduces itself
   ([Ch 58 §6](../part-12-applications-and-ethics/58-ethics-and-society.md)). SCA12 is one of the
   few loci where the well-characterised population is South Asian; that inverts the usual pattern
   and does not remove the obligation.

</details>

---

## 9. Subunit stoichiometry: what "overexpression" actually does

PP2A is a **heterotrimer**: a scaffolding **A** subunit, a catalytic **C** subunit, and one variable
**regulatory B** subunit drawn from four unrelated families. The B subunit is what selects the
substrate. *PPP2R2B* encodes **Bβ (PR55β)**, the brain-enriched member of the B55 family.

**Constructed model**, to make the arithmetic visible. A neuron contains **50 arbitrary units of
A–C core dimer** and four competing B subunits:

```
B56 family     40 units
B'' family     30 units
striatin family 20 units
B55beta        10 units
                      total B = 100 units against 50 cores
```

Assume, for (a)–(c), that all four bind the core with equal affinity, so cores are allocated in
proportion to B abundance.

**(a)** Compute the baseline holoenzyme composition.
**(b)** Double B55β to 20 units. Compute the new composition. By what factor did B55β-containing
holoenzyme rise, and what happened to the other three?
**(c)** Now raise B55β **ten-fold**, to 100 units. Compute the composition and the fold change in
B55β holoenzyme. **[trap]**
**(d)** Repeat (a) and (b) with B55β binding the core with **three-fold higher affinity** than the
others.
**(e)** *De novo* **missense** variants in *PPP2R2B* cause a neurodevelopmental syndrome by
impairing holoenzyme incorporation. Model that as B55β affinity going to zero and compute the
composition. What does the pair of results say about how to interpret "PP2A activity" in SCA12?
**(f)** Your collaborator proposes measuring total Bβ protein by western blot to test whether the
expansion causes "PP2A dysfunction". Say what that experiment can and cannot detect, and name the
assay you would run instead.

<details><summary>Solution</summary>

**(a)** Cores are limiting — 50 against 100 units of B — so every B family competes, and with equal
affinity each family's share of cores equals its share of total B:

```
B56       50 x 40/100 = 20.0 cores   (40% of holoenzyme)
B''       50 x 30/100 = 15.0         (30%)
striatin  50 x 20/100 = 10.0         (20%)
B55beta   50 x 10/100 =  5.0         (10%)
```

The other 50 units of B protein are unbound. That is the structural fact the whole problem turns
on: **B subunit abundance is not holoenzyme abundance**, because the core is the scarce reagent.

**(b)** B55β → 20; total B → 110:

```
B56       50 x 40/110 = 18.18   (was 20.0,  -9.1%)
B''       50 x 30/110 = 13.64   (was 15.0,  -9.1%)
striatin  50 x 20/110 =  9.09   (was 10.0,  -9.1%)
B55beta   50 x 20/110 =  9.09   (was  5.0,  +81.8%)
```

Two results, and the second is the one people miss.

**A two-fold rise in B55β protein gives a 1.82-fold rise in B55β holoenzyme, not two-fold.** The
core pool caps it.

**Every other B family loses 9.1% of its holoenzyme.** Overexpressing one subunit is not additive —
it is **subtractive for the others**. So if raising *PPP2R2B* is toxic, the toxicity has two
candidate routes that this experiment cannot separate: gain of B55β-directed dephosphorylation, or
loss of the substrate specificities the displaced families were providing. Both are consistent with
"overexpression is toxic", and they imply opposite therapies.

**(c) [trap]** B55β → 100; total B → 190:

```
B56       50 x 40/190 = 10.53   (was 20.0,  -47%)
B''       50 x 30/190 =  7.89   (was 15.0,  -47%)
striatin  50 x 20/190 =  5.26   (was 10.0,  -47%)
B55beta   50 x 100/190 = 26.32  (was  5.0,  +426%,  i.e. 5.26x)
```

**A ten-fold rise in protein bought a 5.3-fold rise in holoenzyme**, and the share ceiling is
visible: B55β now occupies 52.6% of all cores and can never exceed 100%. The trap is assuming
transfection dose maps linearly onto holoenzyme, which is exactly the assumption every
overexpression experiment in this literature makes implicitly. **Diminishing returns on the
subunit you are pushing, and proportionally severe losses for everything you are pushing against.**

At ten-fold, the displaced families have lost nearly half their holoenzyme. If a cell dies in that
condition, "B55β overexpression is toxic" is one reading and "B56-family PP2A signalling was
halved" is another, and the experiment as designed does not distinguish them.

**(d)** With affinity weights *w* = (1, 1, 1, 3), cores go in proportion to *w*·[B]:

```
baseline weighted:  40, 30, 20, 30   total 120
  B56       50 x 40/120 = 16.67
  B''       50 x 30/120 = 12.50
  striatin  50 x 20/120 =  8.33
  B55beta   50 x 30/120 = 12.50   (25% of holoenzyme from only 10% of B protein)

B55beta doubled -> weighted: 40, 30, 20, 60   total 150
  B56       50 x 40/150 = 13.33   (-20%)
  B''       50 x 30/150 = 10.00   (-20%)
  striatin  50 x 20/150 =  6.67   (-20%)
  B55beta   50 x 60/150 = 20.00   (+60%)
```

Higher affinity does two things at once: it makes B55β a large share of holoenzyme from a small
share of protein, and it makes the **displacement of the others worse** — 20% rather than 9% — for
the same doubling. Meanwhile the fold gain in B55β holoenzyme is *smaller* (1.6× rather than 1.8×),
because a high-affinity subunit is already close to its ceiling. Affinity amplifies the collateral
effect and damps the intended one.

**(e)** Set the B55β weight to zero:

```
weighted:  40, 30, 20, 0   total 90
  B56       50 x 40/90 = 22.22   (+11.1% over baseline 20.0)
  B''       50 x 30/90 = 16.67   (+11.1%)
  striatin  50 x 20/90 = 11.11   (+11.1%)
  B55beta                  0
```

A subunit that cannot be incorporated does not merely subtract its own activity — it **hands its
cores to the other three**, which all rise by 11%. So loss of function at this gene is also a gain
of function for the rest of the family.

Put the two together and the interpretive point is sharp. The same gene produces two diseases at
opposite ends of one axis: *de novo* missense variants that impair holoenzyme incorporation cause a
neurodevelopmental syndrome, and SCA12 is presumed — though not established — to sit on the
overexpression side. That an allelic series exists in both directions is itself evidence that
holoenzyme composition is the axis that matters.

And therefore **"PP2A activity is increased/decreased in SCA12" is not a well-formed claim.** PP2A
has no single activity. The catalytic subunit is shared; specificity is set by which B subunit is in
the trimer. A total-phosphatase-activity assay on lysate measures the sum over all compositions and
answers a question nobody asked
([Ch 08 §6](../part-01-molecular-foundations/08-proteins-and-gene-function.md) on writer/eraser
logic; [Ch 08 §10](../part-01-molecular-foundations/08-proteins-and-gene-function.md) on why
loss, gain and poison are different mechanisms with different predictions).

**(f)** A western blot for total Bβ measures **protein abundance**, which is the *input* to
everything above and none of the output. It cannot see: how much Bβ is in a holoenzyme versus free;
which cores were displaced; whether the change is in Bβ1 or Bβ2 (different first exons, different
subcellular destinations — cytosolic versus outer mitochondrial membrane); or whether the free pool
changed at all.

What to run instead: **immunoprecipitate the A scaffold subunit and quantify every co-precipitating
B subunit**, in patient and control neurons, by mass spectrometry rather than by four separate
antibodies. That measures holoenzyme composition — the quantity the model above is about — and it
reads out the displacement of the other families, which is the term no abundance measurement can
recover.

Two further controls the design needs. Isoform resolution, because the SCA12 repeat sits 5′ of the
**Bβ1** first exon and *not* 5′ of the Bβ2 first exon, so a Bβ2-based mechanism has a missing step
between the mutation and the protein ([lab 12](../labs/lab-12-expression-and-isoforms.md) does the
isoform-level quantification; [Ch 06 §9](../part-01-molecular-foundations/06-rna-processing.md) on
alternative first exons). And cell type, because the direction of the expression change is itself
contested — one group reports the expansion raising the repeat-containing transcript and Bβ1
protein, another reports **most *PPP2R2B* isoforms down-regulated in patient-derived mature
neurons**. A composition measurement in the wrong cell type will settle nothing.

</details>

---

## 10. ★★ Four results, five hypotheses

Five live hypotheses for SCA12 pathogenesis, none established — the curated gene–disease evidence
score for this locus is **8.5 / 18 ("Moderate")** and the mechanism is recorded as "incompletely
established":

- **A** Promoter / 5′-UTR-driven *PPP2R2B* over-expression
- **B** Bβ2-driven mitochondrial fission
- **C1** Sense CAG RNA toxicity (nuclear foci, protein sequestration)
- **C2** Antisense *PPP2R2B-AS1* CUG RNA toxicity
- **C3** RAN translation (polyQ, polySer from the sense strand; polyAla from the antisense strand)

The labels are [D4](../part-D-sca12/D4-sca12-from-repeat-to-phenotype.md)'s, from the evidence table
in its mechanism-hunting section; keep them, because the whole point of a row label is that it means
the same thing in every document. Three rows of that table are **not** tested by the four results
below — **A′**, the polyserine product from the expanded tract; **A′′**, a translational-level dosage
change, which none of R1–R4 measures because none reports protein per transcript; and **D**, tau
hyperphosphorylation via altered PP2A — so nothing you conclude here bears on any of them, and
part (f) is where that omission
starts to matter.

**Four constructed experimental results.** None is a published finding; each is built to have the
shape of one.

```
R1  Patient iPSC line differentiated to mature neurons.
    Bbeta1 protein by western:      0.6x control
    Luciferase reporter carrying the expanded repeat, same cells:  2.4x the 10-repeat reporter

R2  RNA-FISH for nuclear CAG foci, same patient line:
    neural stem cells:              62% of nuclei foci-positive
    mature neurons, day 60:          4% of nuclei foci-positive
    isogenic control at both stages:  0%

R3  ASO knockdown of PPP2R2B-AS1 in an SK-N-MC model:
    CUG foci:                       abolished
    survival under stress:          70% rescue
    total PPP2R2B mRNA:             1.9x higher than untreated

R4  Novel antibody against a polyalanine RAN product:
    transfected HEK293T:            strong signal
    KI-80 knock-in mouse cerebellum: signal present
    three SCA12 post-mortem cerebella: no signal
```

**(a)–(d)** For each result in turn: which hypotheses does it support, which does it damage, and
what is the single next experiment?
**(e)** R4's human negative is the most quoted kind of result in this field and the weakest. Say
what would have to be shown before it could be used as evidence. **[trap]**
**(f)** Across all four, name the one structural feature of the evidence base that limits every
conclusion, and the study design that would fix it.

<details><summary>Solution</summary>

**(a) R1 — reporter up, endogenous protein down.**

*Supports:* Hypothesis A, but only as a claim about the **repeat element**. A reporter shows the expanded
tract has promoter activity that scales with length — which is a genuine published finding, in
reporter assays, with CREB1 and SP1 binding upstream and up-regulating and TFAP4 binding downstream
and down-regulating.

*Damages:* Hypothesis A as a claim about the **endogenous locus in the vulnerable cell**. Bβ1 protein at 0.6×
is the wrong direction. A reporter is an isolated element on a plasmid with no chromatin, no
alternative first exons, no antisense transcript across it and no feedback; the endogenous gene has
all four.

This is not a hypothetical tension. It is the field's central contradiction in miniature: one group
reports the expansion raising the repeat-containing transcript and Bβ1 protein and producing an
apoptotic polyserine tract, another reports most *PPP2R2B* isoforms down-regulated in patient-derived
mature neurons. Both are primary results in good journals.

*Next experiment:* stop measuring "expression" as one thing. Separate **nascent transcription** (run-on
or intronic read density) from **steady-state RNA** from **protein**, resolve by **isoform** and by
**cell type and differentiation stage**, in an **isogenic** background so the only variable is repeat
length. The two contradictory results may both be right about different quantities at different
stages, and no design that collapses them can tell.

**(b) R2 — foci in progenitors, nearly gone in neurons.**

*Supports:* C1, in neural stem cells. Nuclear CAG foci in patient iPSC-derived NSCs are a real
published finding, along with 13 proteins that bind the expanded repeat exclusively, enriched for
protein-clearance machinery.

*Damages:* C1's **relevance**. SCA12 kills mature neurons over decades, and the foci here are
essentially absent from the mature cells. A mechanism that operates in a cell type the disease does
not target needs an account of how it causes late-onset degeneration.

*Careful about a false comfort:* 4% is not zero, and if the foci-positive 4% is the population that
subsequently dies, a low steady-state fraction is exactly what a slow degeneration would look like.
Fraction-positive at one time point cannot distinguish "rare and irrelevant" from "rare because
transient and lethal".

*Next experiment:* an **allelic series** in one isogenic background — an isogenic 73-CAG line
exists, and patient lines with 59, 65 and 67-repeat alleles exist — scored for foci per nucleus at
several differentiation stages, with **live imaging or lineage tracing** to test whether
foci-positive cells are the ones that die. That also fills a stated gap: the published work reports
neither the fraction of cells bearing foci nor a repeat-length threshold for their formation.

**(c) R3 — antisense knockdown rescues, but raises the sense transcript.**

*Supports:* C2. Abolishing CUG foci and rescuing survival is the shape C2 predicts, and antisense
transcription at this locus is established — *PPP2R2B-AS1* is polyadenylated, carries a CUG repeat,
forms foci, and has been proposed as a therapeutic target.

*Creates a problem it cannot solve:* total *PPP2R2B* mRNA went **up 1.9×**. Removing a repressive
antisense transcript up-regulating the sense gene is a well-described consequence of antisense
knockdown ([Ch 24 §7](../part-04-gene-regulation/24-rna-based-regulation.md)) — and here it is a
1.9× rise in the very transcript A says is toxic, in cells that got *better*. Either A is wrong,
or the C2 benefit exceeds the A cost, or the sense rise is inconsequential at this level. R3 cannot
say which.

*Next experiment:* **decouple the two.** Either knock down the antisense with a strategy that leaves
sense levels unchanged — a steric-block oligonucleotide rather than an RNase H gapmer, verified by
measuring sense mRNA — or hold the sense transcript constant with an independent handle
(inducible promoter, degron on the protein) and repeat the rescue. Also worth doing: hold the
antisense down and *deliberately* raise the sense, to see whether the rescue survives it.

**(d) R4 — RAN product in cells and mouse, absent in human brain.**

*Supports:* C3 in models — and RAN translation at this locus is a real finding, not an
extrapolation from SCA8 or *C9orf72*. It is reported in at least three frames depending on strand
and laboratory: polyQ and polySer from the sense strand, polyAla from the antisense.

*Would damage:* C3 in humans — **if the human negative were interpretable**, which is (e).

*Note the reported frames disagree between groups*, which is itself informative: one lab reports
polyQ (persisting even with the sole ATG mutated) and polySer; another reports polyAla from the
antisense CUG ORF and explicitly no polyleucine or polycysteine product. Not reconciled.

*Next experiment:* the positive control described in (e), and then **mass spectrometry** on human
tissue rather than an antibody, since MS identifies the peptide rather than relying on an epitope
surviving fixation.

**(e) [trap]** The trap is treating an antibody negative on post-mortem tissue as evidence of
absence. Before R4's human result can be used at all:

1. **Show the antibody detects a spiked positive in the same fixation.** Formalin-fixed
   post-mortem brain is a hostile substrate; epitope masking is the default, not the exception. Take
   the same three blocks, spike in the recombinant antigen or a transfected-cell pellet processed
   identically, and show the signal survives.
2. **Establish a limit of detection**, in the same tissue, in copies per cell — and compare it with
   the abundance the mouse model gives. If the assay's floor is above the expected level, the
   negative carries no information.
3. **Confirm the tissue is informative.** Post-mortem interval, fixation time and RNA/protein
   integrity all vary, and this exact limitation is documented: in one formalin-fixed SCA12
   post-mortem brain even the **expanded transcript** could not be reliably detected.
4. **Sample the right region.** SCA12's neuropathology is unusual — the cerebral cortex is *more*
   atrophic than the cerebellum, and a cerebellum-only sampling may be looking away from the lesion.

Without those, the honest statement is "not detected by this assay in this tissue", which is a
statement about the assay ([S4 §5](../part-S-statistics/S4-hypothesis-testing.md), again). The real
field position is exactly this: RAN translation happens at this locus in cell and iPSC models, and
**nobody has demonstrated a RAN product in SCA12 human brain tissue.** That is a gap, not a
refutation.

**(f)** The structural feature: **every result comes from a different system.** Reporter plasmids,
transfected HEK293T, SK-N-MC, PC12, one *Drosophila* model, patient iPSC lines at various
differentiation stages, a humanised knock-in mouse whose peer-reviewed phenotype could not be
located, and a handful of post-mortem brains. The entire human neuropathology of SCA12 rests on a
handful of brains, and any statement about "the SCA12 brain" is a statement about single cases.

The consequence is that the hypotheses have never been made to compete. Each is supported in the
system chosen to support it, and none has been tested against the others in one place, so
disagreements between them may be disagreements between models rather than about biology.

The design that fixes it: **one isogenic allelic series, in the vulnerable human cell type,
differentiated to maturity, with all five readouts measured on the same cells** — nascent and
steady-state transcription by isoform, holoenzyme composition (problem 9(f)), sense and antisense
foci, RAN products by mass spectrometry, and a survival endpoint. Expensive, unglamorous, and the
only design that can rank five hypotheses rather than adding a sixth.

Which is the honest summary of this disease and worth stating plainly. Twenty-seven years after the
gene was found, the association is rock solid and the mechanism is argued about. "We do not know" is
the correct answer here, and it is not a gap in the teaching — it is the lesson.

</details>

---

## 11. ★★ Designing an oligonucleotide you cannot yet justify

**The state of the field, all real.** A directed literature search returns **zero** published
studies of an ASO, siRNA or other RNA-targeting therapeutic against *PPP2R2B* in a neurological
context, and **no disease-modifying clinical trial in SCA12**. What exists is intent: one group
proposes *PPP2R2B-AS1* as a therapeutic target; another proposes repeat-stabilising drugs. The one
completed randomised trial in SCA12 is **extended-release propranolol at 240 mg/day versus placebo,
n = 60**, which significantly reduced tremor on TETRAS and improved SARA and quality-of-life scores
— symptomatic tremor control, not disease modification.

**(a)** Enumerate the candidate molecular targets implied by the five hypotheses of problem 10, and
state the mechanistic commitment each one makes.
**(b)** You propose an RNase H1 gapmer against total *PPP2R2B*. Using problem 9's model, derive the
knockdown window you need, bounding it from above and below, and say what makes each bound real.
**(c)** Now suppose the contested expression direction resolves the other way. Recompute, and state
the failure mode in one sentence. **[trap]**
**(d)** Design an allele-selective approach. What genetic feature do you need, what does the founder
haplotype buy you, and what fraction of patients does it miss?
**(e)** Targeting *PPP2R2B-AS1* instead — what does problem 10's R3 predict will go wrong?
**(f)** Write the phase 1 primary endpoint. **[trap]**

<details><summary>Solution</summary>

**(a)** Five hypotheses, five targets, five commitments:

| Hypothesis | Target | What you are committing to |
|---|---|---|
| A over-expression | total *PPP2R2B* mRNA, or the repeat-containing transcript specifically | that the expansion **raises** output, and that the excess is the toxin |
| B Bβ2 / mitochondrial fission | the Bβ2 transcript, or Drp1 signalling downstream | that Bβ2 is elevated in patient neurons — which **has never been shown**, and the repeat is not 5′ to the Bβ2 first exon |
| C1 sense RNA toxicity | the expanded CAG RNA, by steric block or degradation | that foci and sequestration, seen in progenitors, matter in mature neurons |
| C2 antisense RNA toxicity | *PPP2R2B-AS1* | that the CUG species is the driver, and that removing it does not make A worse |
| C3 RAN translation | the ORFs, by steric block at the tract | that a RAN product exists in human brain — never demonstrated |

Notice that **A and C1/C3 point the same way** (reduce output at the expanded allele) while **B
requires a target you cannot show is dysregulated** and **C2 may act against A**. That structure
is the design constraint, not a footnote to it.

**(b)** A gapmer recruits RNase H1 to cleave the target RNA, so it lowers total transcript
([Ch 24 §7](../part-04-gene-regulation/24-rna-based-regulation.md) for the general logic;
[Ch 06's worked example](../part-01-molecular-foundations/06-rna-processing.md) is the
splice-switching cousin, nusinersen, which does not degrade its target).

Take the Hypothesis A direction at face value. Let the normal allele contribute 1 unit of Bβ1 output and the
expanded allele 3 units, against a control total of 2:

```
patient total = 1 + 3 = 4 units   =  2.0x control
```

A non-selective gapmer knocks both alleles down by the same fraction *k*:

```
k = 0.50  ->  4 x 0.50 = 2.0 units  =  1.0x control   <- target restored
k = 0.75  ->  4 x 0.25 = 1.0 unit   =  0.5x control   <- half of normal
```

**Lower bound**, from efficacy: below roughly 40% knockdown you have not returned the cell to
anything like baseline. **Upper bound**, from safety, and this is the real one: *de novo* **missense**
variants in *PPP2R2B* that impair holoenzyme incorporation cause a **neurodevelopmental syndrome** —
the clearest evidence that too little functional Bβ at this gene is itself a human disease, though
the variants are missense and may act dominant-negatively rather than as simple nulls, so the
ceiling is real but its height is not measured. So there is a hard ceiling, and problem
9(e) says why it bites harder than a naive dosage argument would suggest — losing B55β does not
merely subtract its activity, it redistributes cores and raises the other three B families by 11%.

Window: roughly **40–60% knockdown of total *PPP2R2B***. Now the engineering objection: ASO
knockdown in CNS is **not uniform**. Distribution from an intrathecal dose falls off with distance
from the CSF, so some cells see 90% knockdown and some see 10%, and the population mean sitting
inside a 40–60% window guarantees that a substantial fraction of neurons sits outside it in both
directions ([Ch 38 §10](../part-08-methods/38-genome-editing.md) — delivery is the bottleneck, and
it is the same bottleneck for oligonucleotides as for editors). A narrow therapeutic window plus a
spatially heterogeneous dose is the combination that has ended CNS knockdown programmes before.

**(c) [trap]** The trap is designing against one of two contradictory primary results without
noticing there are two. Take the other direction: in patient-derived **mature neurons**, most
*PPP2R2B* isoforms are reported **down**-regulated. Call it 0.6× control:

```
patient total = 0.6x control
k = 0.50  ->  0.6 x 0.50 = 0.30x control
```

**A 50% knockdown takes a neuron already at 60% of normal down to 30% of normal** — into the range
where the missense allelic series says human disease occurs. The drug designed to correct the
disease would be, on that reading, a second insult delivered on purpose to the surviving neurons of
someone with a degenerative disease.

In one sentence: **the same drug at the same dose is either corrective or harmful depending on which
of two contradictory papers describes the human neuron, and the field does not know which.**

That is not an argument for doing nothing. It is an argument that the target-validation experiment
of problem 10(f) — isoform-resolved, cell-type-resolved, isogenic — is not preliminary work to be
skipped in the interests of momentum. It **is** the programme, and no amount of medicinal chemistry
substitutes for it.

**(d)** Allele-selective knockdown needs a sequence difference between the two alleles that an
oligonucleotide can read. The repeat itself is a poor handle — the normal allele has the same motif,
just less of it — so the standard approach is a **heterozygous SNP in phase with the expansion**,
targeted directly, leaving the normal allele intact. That converts the problem in (b) and (c) into a
much safer one: you halve the expanded allele's output and never touch the normal allele's, so the
loss-of-function ceiling is never approached.

**What the founder haplotype buys you.** SCA12's Indian expanded chromosomes carry one haplotype at
P = 0.000 across ~137 kb around the repeat, in 20 families. A haplotype that consistent means the
phasing SNPs are the *same SNPs* in most Indian patients — one oligonucleotide, not a bespoke drug
per family. That is favourable, and the reason is the founder structure rather than anything about
the drug. (Allele-selective programmes at other repeat loci have generally targeted phasing SNPs
rather than the repeat itself; how many patients any of them covers is not something this course
has verified, so treat the comparison as unquantified.)

**What it misses.** Taking 80% haplotype coverage among Indian expanded chromosomes as a working
figure (constructed, and consistent with 79.6% Agarwal ancestry in a 49-patient cohort):

```
Indian patients covered:        ~80%
Indian patients not covered:    ~20%
American index pedigree:          0%   -- that haplotype is absent from its expanded chromosome
```

The zero is not an approximation. The expansion arose **at least twice**, on different backgrounds,
and a haplotype-directed drug is by construction blind to the second origin.

There is an equity point here that runs opposite to the usual one. For once the well-characterised
founder population is South Asian, so a haplotype-directed SCA12 drug would be developed for and
work best in a South Asian community — inverting the ancestry bias that leaves most genomic
medicine calibrated on European-ancestry data
([Ch 58 §6](../part-12-applications-and-ethics/58-ethics-and-society.md)). It also raises the group
question directly: a drug whose eligibility criterion is a haplotype that tracks a named endogamous
community is a drug with a community in its label, and the people who bear that association did not
individually consent to it
([Ch 58 §5](../part-12-applications-and-ethics/58-ethics-and-society.md)).

**(e)** R3 in problem 10 is the prediction: knocking down the antisense removes CUG foci **and
raises total *PPP2R2B* mRNA 1.9×**. If A is right, an anti-*PPP2R2B-AS1* gapmer treats one
mechanism by aggravating another, and the net effect depends on the relative sizes of two effects
neither of which has been measured in human neurons.

The mitigation is chemical rather than conceptual: use a **steric-block** oligonucleotide that
occludes the antisense transcript's function without recruiting RNase H1, and make "sense mRNA
unchanged" a **release criterion for the compound**, verified in every model before it advances.
A programme that measures only its intended target will not see this coming.

**(f) [trap]** The trap is writing a disease-modification endpoint. You cannot have one, and the
reasons are specific and checkable:

- **No natural-history cohort.** There is no multi-site prospective SCA12 cohort with annualised
  SARA progression rates — no SCA12 equivalent of the large ataxia natural-history consortia. Without
  a placebo-arm slope you cannot power a slowing-of-progression trial.
- **No validated fluid biomarker.** Candidates exist and none is replicated: plasma Aβ40 decreased
  with the Aβ42/Aβ40 ratio increased; five mitochondrial quality-control genes down in patient
  PBMCs. Both are single-cohort results, and PBMCs are not neurons.
- **No target-engagement assay.** There is no established way to show, in a living person, that the
  drug changed *PPP2R2B* output in a neuron. That is the single most damaging gap, because without it
  a negative trial cannot distinguish a wrong hypothesis from an undelivered drug.
- **No characterised animal model with a published progressive phenotype.** A humanised knock-in
  mouse carrying 10 or 80 human CAG repeats is described in methods and grant records, but a
  peer-reviewed phenotype paper for it could not be located.

So the phase 1 primary endpoint is the one the evidence supports:

> **Primary:** safety and tolerability of ascending intrathecal doses over *n* weeks.
> **Secondary:** CSF and plasma pharmacokinetics.
> **Exploratory:** candidate target-engagement and biomarker measures, explicitly labelled as
> unvalidated and powered for estimation rather than for a hypothesis test.

And say the rest out loud rather than burying it. SCA12 in 2026 has a **positive randomised trial**
— of a beta-blocker for tremor. The distance between "we can measure this disease well enough to run
an RCT" and "we have something to give it" is the whole distance between a trial-ready phenotype
and a druggable mechanism, and closing it starts with the natural-history cohort and the
target-validation experiment, not with the oligonucleotide.

The uncomfortable corollary, which is the last thing this track has to teach: the most valuable
piece of SCA12 research anyone could do this year is not a mechanism paper. It is a multi-site
prospective cohort with annual SARA scores and banked CSF. It would not be novel, it would take
five years, and every hypothesis in problem 10 is untestable in humans without it.

</details>

---

## 12. A tremor referred as the wrong disease

**Constructed vignette**, written in the shape of a real referral and built to be misread. No patient
is described; the examination findings are chosen from the features
[D1](../part-D-sca12/D1-neurons-and-the-cerebellum.md)'s clinical-vocabulary section teaches.

```
Referral to a movement-disorders clinic

  47-year-old man. Six years of tremor of both hands, described by the
  referring physician as "a resting tremor". Query Parkinson disease.
  No response to a six-month trial of levodopa.

  On examination in clinic:
    hands fully supported in the lap    no tremor
    arms held outstretched              coarse tremor, both hands
    pouring water; reaching for a cup   tremor throughout the movement
    finger-nose                         tremor grows over the last few
                                        centimetres; overshoots the target
    tandem gait                         cannot be sustained
    speech                              slurred, irregularly paced
    strength                            full in all four limbs
    deep-tendon reflexes                brisk; three beats of ankle clonus

  Family history: father and a paternal aunt were both told in their
  forties that they had essential tremor; the father later became
  unsteady on his feet and used a stick from his sixties.
```

**(a)** Classify every tremor in that description by activation condition, and name the single clause
in the referral that is doing the misleading work. **[trap]**
**(b)** One examination finding cannot be produced by the cerebellum. Name it, say what it reports,
and say what it does to the differential.
**(c)** Write the localisation argument out explicitly: the hypothesis, the findings it explains, the
residual, and what the argument outputs — and what it cannot output however good it is.
**(d)** Which genetic test do you order, and why that one? Say what a normal exome would and would
not have told you, and grade what you can tell this family Established / Supported / Conjectured.

<details><summary>Solution</summary>

**(a) [trap]** Classify by **activation condition**, never by amplitude and never by the noun in the
referral:

| Observation | Activation condition | Class |
|---|---|---|
| No tremor with the hands fully supported | not activated | **no rest tremor** |
| Coarse tremor with the arms outstretched | holding a posture against gravity | **postural tremor** |
| Tremor while pouring and reaching | during voluntary movement | **kinetic tremor** |
| Amplitude grows over the last centimetres to target | kinetic, rising on approach | **intention tremor** |

All three positive findings are subtypes of **action tremor**, and the intention component is the
cerebellar signature — feedback correction without prediction, each correction arriving late and
overshooting.

The misleading clause is **"a resting tremor"**. A tremor that disappears when the limb is fully
supported and appears when the limb is used is the exact opposite of a rest tremor; the first two
lines of the examination refute the referral's first sentence. One wrong noun set a Parkinsonian
frame and bought a six-month levodopa trial.

Note what the levodopa non-response does and does not do. It is *consistent* with a non-Parkinsonian
tremor, and it is not a localisation — many things fail to respond to levodopa. The activation-
condition classification is what did the work; the drug trial was the expensive way of not doing it.

This is not an exotic presentation. In the largest Indian SCA12 series tremor was present at
presentation in **95.9%** (Ganaraja et al. 2022, *n* = 49), of postural type in **87.7%**, with an
intention component in **57.1%**; tremor was the first symptom in **90%** of Choudhury et al.'s 21
patients. The constructed part of this vignette is the patient, not the pattern.

**(b)** Brisk reflexes with three beats of ankle clonus is **hyperreflexia** — an *upper motor
neuron* sign. It reports loss of descending corticospinal inhibition of the spinal reflex arc, and
the cerebellar cortex cannot produce it: pure cerebellar disease tends the other way, towards
hypotonia and pendular reflexes.

So it is a **"plus" feature**, and it narrows rather than muddies. It says the pathology is not
confined to the cerebellar cortex, which moves the differential towards the degenerations that touch
cerebellum *and* beyond — the territory of the dominant ataxias. Hyperreflexia is a recognised
feature of SCA12: the current GeneReviews Hereditary Ataxia Overview summarises the disease as action
tremor in the fourth decade, cognitive and psychiatric disorder including dementia, hyperreflexia,
slowly progressive ataxia, and subtle parkinsonism possible.

**(c)** Four steps, in this order, which is the order that keeps you honest:

**Hypothesis.** A degraded cerebellar calibrator — the structure that predicts the consequences of a
motor command and corrects it before the error is made.

**What it explains.** Intention tremor, overshoot on finger–nose (dysmetria), slurred irregularly
paced speech (dysarthria), and unsustainable tandem gait (gait ataxia). Four findings, one lesion,
and all four are the same failure — mis-scaled, mis-timed movement — differing only in which effector
they touch. Full strength in all four limbs is part of the argument too: the cerebellum calibrates
commands generated elsewhere, so weakness would have pointed away from it.

**The residual.** Hyperreflexia, from (b). It does not overturn the localisation; it extends it.
**Cerebellar-plus syndrome** is the output, not "cerebellar syndrome with an odd reflex".

**The pedigree.** Two affected relatives in the parental generation, one of them the father, with a
"benign" tremor label that later turned into gait failure — a shape SCA12 collects, since its tremor
is routinely read as essential tremor. **Father-to-son transmission argues autosomal, not X-linked**,
which does real work in (d).

What the argument outputs: **a region and a syndrome** — cerebellar-plus, with action tremor, in an
apparently autosomal dominant pedigree. What it cannot output, however clean it looks: **a gene.**
Sign-to-circuit reasoning is probabilistic, built on lesion correlations, and no configuration of
physical signs names a locus.

**(d)** Order a **targeted repeat panel — flanking PCR plus repeat-primed PCR** across the dominant
ataxia loci, with *PPP2R2B* on it (problem 5(f) gives the core list and the reason for each entry;
[D5](../part-D-sca12/D5-sca12-population-clinic-therapy.md)'s differential section adds the loci that
arrive as tremor rather than as ataxia). Not
an exome, and not a bigger exome.

The reason is that the phenotype names a **variant class**, and the assay has to be built for that
class. A repeat expansion is invisible to short reads by construction — the read is shorter than the
repeat, and problem 4 derived exactly where that blindness starts. At *PPP2R2B* there is a second
failure on top: the repeat is annotated to the 5′ UTR, and exome bait sets target coding sequence.

Then read the panel the way problem 5(a)–(c) reads a caller: a single peak on flanking PCR is a
**question, not a genotype**, because a homozygous-normal result and a normal-allele-plus-
unamplifiable-expansion result look identical. Repeat-primed PCR answers presence; it does not give a
size. A size, if it matters — and after problem 7(d) it always matters — comes from fragment sizing
where the amplicon survives, or from long reads.

**A normal exome** would have told you there is no coding point mutation of the kind an exome is
powered to see. It would have told you nothing whatever about a repeat, and for *this* phenotype it
should **raise** your posterior on an expansion, because it has eliminated the alternatives short
reads are good at.

What you can say to the family, graded:

- **Established.** The tremor is an action tremor with an intention component; the syndrome is
  cerebellar-plus; the pedigree is consistent with autosomal dominant inheritance; and an expanded
  *PPP2R2B* repeat causes SCA12 — the gene–disease association is not in dispute.
- **Supported.** SCA12 as *this family's* diagnosis. The phenotype fits the modal presentation, and
  the assay, not the examination, decides it.
- **Conjectured.** Everything about mechanism (problem 10), and everything about what a length in the
  contested 43–50 band would mean for this man or his children (problem 7).

And the sentences not to say, both of which this track has spent eleven problems earning: tremor
severity does not report repeat length, and a parent's repeat length does not forecast a child's.

</details>

---

## 13. What bulk cerebellum can and cannot hide

Two sets of real numbers, both already in the track. From
[D2](../part-D-sca12/D2-kinases-phosphatases-and-pp2a.md)'s expression section, GTEx v8 median
gene-level TPM for *PPP2R2B*: **cerebellum 10.16**, cerebellar hemisphere 8.76, frontal cortex BA9
**29.90**, and a median of **0.50** across the 41 non-brain tissues. From
[D1](../part-D-sca12/D1-neurons-and-the-cerebellum.md)'s cerebellum section, unbiased-stereology
estimates of the human cerebellum: **15–30 million Purkinje cells** and **70–100 billion granule
cells**, ranges that have never been reconciled.

**(a)** Compute the Purkinje-cell fraction of cerebellar neurons, as a range. Say which conclusions
survive the whole range and which do not.
**(b)** Assume, for now, that every cell contributes equally to bulk RNA. If *PPP2R2B* were expressed
in Purkinje cells at the frontal-cortex level and nowhere else in the cerebellum, what would bulk
cerebellum read? Compare with 10.16 and with the non-brain median.
**(c)** Invert it. What per-cell expression would Purkinje cells need for the observed 10.16 TPM to
be Purkinje-derived? Express the answer as a share of that cell's transcriptome, and say what bulk
data therefore do and do not exclude. **[trap]**
**(d)** How large would a Purkinje-specific enrichment have to be before bulk cerebellum moved by
10%?
**(e)** Grade the resulting picture Established / Supported / Conjectured, name the hypothesis label
this bears on, and specify the experiment — including how many nuclei an unenriched run would have to
sample.

<details><summary>Solution</summary>

**(a)** Purkinje cells as a fraction *f* of cerebellar neurons, taking the extremes of both ranges:

```
smallest:  15e6  / (15e6  + 100e9) = 1.50e-4   ->  1 in 6,667   (0.015%)
largest:   30e6  / (30e6  +  70e9) = 4.29e-4   ->  1 in 2,333   (0.043%)
```

So **between about 1 in 2,300 and 1 in 6,700**, a factor of three of slop inherited entirely from the
counting.

Two caveats, both in the same direction. Interneurons and — much more importantly for RNA — **glia**
are ignored, and bulk RNA-seq sees them; adding them enlarges the denominator, so every *f* above is
an **upper bound** on the Purkinje share. And the equal-RNA assumption of (b) is false in a known
direction: a Purkinje cell is enormous beside a granule cell and holds correspondingly more RNA, so
the RNA-weighted share exceeds the count-weighted share by some factor greater than one. **No
established figure for that factor exists in this course's sources**, so it stays an unquantified
correction rather than a number, and the arithmetic below is presented as what the cell counts alone
imply.

Which conclusions survive? D1's rule applies: use contested counts only for conclusions robust across
the entire range. "**A Purkinje-specific transcript is invisible in bulk cerebellum unless it is
enriched by orders of magnitude**" survives any choice within 15–30 million and 70–100 billion.
"Purkinje cells are 0.02% of cerebellar neurons" does not.

**(b)** Bulk TPM under equal per-cell RNA is the cell-number-weighted mean of per-cell expression. A
transcript at the frontal-cortex level of 29.90 TPM in Purkinje cells and zero in everything else
gives:

```
f = 1.50e-4:   29.90 x 1.50e-4 = 0.0045 TPM
f = 4.29e-4:   29.90 x 4.29e-4 = 0.0128 TPM
```

Against an observed cerebellar 10.16 TPM, that is **roughly 800–2,300-fold too small**. And it is
roughly 40–110-fold *below* the 0.50 TPM median of the non-brain tissues — i.e. a Purkinje-exclusive
brain-level transcript would register in bulk cerebellum as indistinguishable from a gene that is not
expressed in the brain at all.

Run it the other way and the conclusion is unavoidable: **essentially all of the 10.16 TPM is coming
from non-Purkinje cells**, overwhelmingly granule cells, because there is nothing else there in the
numbers that matter.

**(c) [trap]** Set per-Purkinje expression *E* such that *E* × *f* = 10.16:

```
f = 1.50e-4:   E = 10.16 / 1.50e-4 = 67,700 TPM
f = 4.29e-4:   E = 10.16 / 4.29e-4 = 23,700 TPM
```

Now use the identity that makes TPM interpretable: **TPM sums to 10⁶ over all transcripts in the
sample**. So those figures say the transcript would have to be

```
23,700 / 1e6 = 2.4%   to   67,700 / 1e6 = 6.8%   of the Purkinje cell's entire transcriptome
```

which is the territory of the handful of most abundant transcripts a cell makes — for one regulatory
subunit of one phosphatase. Bulk data therefore **do** exclude something real: the cerebellar signal
cannot be mostly Purkinje-derived, short of a per-cell abundance nobody has claimed.

The trap is the symmetric error, and it is committed in both directions in this literature. "Not
cerebellum-enriched" is a statement about a **tissue**; "not expressed in the vulnerable cell" is a
statement about a **cell type**; and (b) shows the second does not follow from the first, because the
cell type in question is a two-thousandth of the tissue. Equally, nothing above licenses the
optimistic inversion — that Purkinje cells *are* enriched — since the same arithmetic that hides
enrichment hides its absence.

**(d)** Let every cerebellar cell express the transcript at a baseline level and Purkinje cells at
*k* times baseline. Bulk reads the weighted mean:

```
bulk / baseline = (1 - f) + k f = 1 + f (k - 1)

for a 10% shift:  f (k - 1) = 0.10
  f = 1.50e-4  ->  k = 1 + 667 = 668
  f = 4.29e-4  ->  k = 1 + 233 = 234
```

**A Purkinje-specific enrichment of roughly 230–670-fold is needed to move bulk cerebellum by 10%**,
and 10% is already generous — it is inside the spread you would expect between GTEx donors for a
tissue, though this course has no per-tissue variance figure to quote for it. Anything short of a
few-hundred-fold enrichment is invisible **in principle**, not merely underpowered: no number of
additional bulk samples fixes it, because the signal is diluted rather than noisy. That is the whole
difference between a power problem and a resolution problem.

**(e)** On the ladder:

- **Established.** *PPP2R2B* is strongly brain-enriched — brain tissues run roughly 18–60× the median
  non-brain tissue — and it is **not cerebellum-enriched**: cerebellum sits below every cortical and
  basal-ganglia region GTEx samples, with frontal cortex BA9 about three times cerebellum. The Human
  Protein Atlas independently records low regional specificity within brain, and Strack et al. found
  Bβ protein detectable only in brain.
- **Supported.** That the cerebellar phenotype is therefore not explained by where the gene is
  transcribed — an instance of D1's selective-vulnerability problem rather than a solution to it.
- **Conjectured.** Every statement about expression at the Purkinje-cell level, in both directions.
  No published single-nucleus analysis of *PPP2R2B* by cerebellar cell type was found for D2's
  expression section, and the arithmetic above says bulk data could never have supplied one.

The hypothesis label this bears on is **A**, the repeat as a dial on *PPP2R2B* expression. Note
precisely what (a)–(d) do to it: they do not weaken it, they say that **bulk expression data are the
wrong instrument for testing it in the cell type that dies**, which is a different and more
uncomfortable statement. The same applies to any regional expression or methylation measurement made
on dissected brain tissue, including the single-brain result in problem 5(g) — it constrains the
region, not the cell.

The experiment is single-nucleus RNA-seq of human cerebellum with per-cell-type quantification, which
is what [Ch 48](../part-10-functional-genomics/48-single-cell-and-spatial.md) exists for. And the
design constraint falls straight out of (a):

```
unenriched run of 100,000 nuclei:
  f = 1.50e-4  ->  15 Purkinje nuclei
  f = 4.29e-4  ->  43 Purkinje nuclei
```

Fifteen to forty-three nuclei from a hundred thousand — which is why the cell type at the centre of
the disease is the one an unenriched atlas is least able to speak about, and why the design needs
deliberate enrichment of Purkinje nuclei rather than more sequencing. The same lesson as problem
9(f), one level up: **measure the quantity your claim is about, in the compartment your claim is
about, or do not make the claim.**

</details>

---

## Where you went wrong

| Error pattern | What to re-read |
|---|---|
| Assumed a coordinate convention instead of deriving it from the record's own copy number | Problem 1(a) — 32 bp versus 33 bp is a third of a repeat unit |
| Read `CAG`, `CTG`, `AGC`, `GCT` as different elements | Problem 1(c) — one strand flip, one cyclic rotation |
| Ran a caller with hg19 coordinates against GRCh38 and trusted the normal call | Problems 1(e), 5(d) — ~620 kb off, and silent |
| Converted a referral fraction into a population prevalence | Problem 2(a) — no SCA12 prevalence estimate exists |
| Ordered 8.6% above 8.5% without a test | Problem 2(b) — z = 0.26 |
| Treated carrier frequency and disease prevalence as the same quantity | Problem 2(d) — 26-fold apart in HD, 44-fold in SBMA |
| Called a Δ of ±1 repeat an observation without the assay's error | Problem 3(d) — SD(Δ) = 1.41 repeats |
| Reported "no parent-of-origin bias" without computing the power | Problem 3(c) — 7 versus 7 has only ~25–30% power |
| Used repeat sizes down a pedigree as evidence of anticipation | Problem 3(e) — anticipation is defined on onset ages |
| Assumed a short-read caller degrades gracefully across allele lengths | Problem 4(c) — 42–49 units has no informative read class |
| Read a caller's genotype string without the read-count fields | Problem 5(a) — a 52 call from one in-repeat read |
| Treated a normal-looking call at low depth as excluding an expansion | Problem 5(c) — 17% power at 8× |
| Took a negative repeat panel as a negative answer | Problem 5(f) — the catalogue is a hypothesis, and SCA27B was invisible for thirty years |
| Read a regional length difference as per-cell somatic instability | Problem 5(g) — the error floor is one-sided and a region is a mixture |
| Reported a confidence interval on the slope where a prediction interval was needed | Problem 6(b) — ±1.2 versus ±25.8 years |
| Assumed ascertaining affected patients inflates the length–onset correlation | Problem 6(c) — censoring attenuates it |
| Explained a null result as small *n* without computing power | Problem 6(d) — 99.9% power at *n* = 49 |
| Quoted an onset-based risk without naming the cohort it came from | Problem 7(c) — 27% or 36% at age 50 |
| Reported a 46-repeat allele as negative because 46 < 51 | Problem 7(d) — the shortest published pathogenic allele is 46 |
| Quoted an expansion probability for the next generation | Problem 7(e) — insufficient evidence for anticipation in SCA12 |
| Read a founder allele's high frequency as evidence of selection | Problem 8(a) — 99.75% of such alleles are lost |
| Gave a symmetric interval for a drifting allele frequency | Problem 8(b) — SD is 3× the mean and the mass is at zero |
| Inferred a high allele frequency from two biallelic carriers | Problem 8(d) — *F* ≈ 1/62, and check ROH first |
| Used ancestry or haplotype as a rule-out for SCA12 | Problem 8(e) — founder-enriched, not founder-restricted |
| Assumed a 2× rise in subunit protein gives a 2× rise in holoenzyme | Problem 9(b) — 1.82×, and everything else falls 9% |
| Said "PP2A activity is increased in SCA12" | Problem 9(e) — specificity is set by the B subunit |
| Proposed a total-protein western to test holoenzyme composition | Problem 9(f) — immunoprecipitate the A subunit |
| Took a reporter assay as a statement about the endogenous locus | Problem 10(a) — reporter up, endogenous protein down |
| Used an antibody negative on fixed post-mortem tissue as evidence of absence | Problem 10(e) — spike the control first |
| Designed a knockdown without a loss-of-function ceiling | Problem 11(b) — missense *PPP2R2B* variants cause human disease |
| Designed against one of two contradictory primary results | Problem 11(c) — 0.6× becomes 0.3× |
| Wrote a disease-modification endpoint with no natural-history data | Problem 11(f) — no annualised SARA rates exist |
| Classified a tremor from the noun in the referral rather than its activation condition | Problem 12(a) — it vanished when the hands were supported |
| Let a "plus" sign muddy a localisation instead of narrowing it | Problem 12(b) — hyperreflexia is an upper motor neuron sign, and it points somewhere |
| Read "not cerebellum-enriched" in bulk data as "not expressed in the vulnerable cell" | Problem 13(c) — Purkinje cells are 1 in 2,300–6,700 of cerebellar neurons |
