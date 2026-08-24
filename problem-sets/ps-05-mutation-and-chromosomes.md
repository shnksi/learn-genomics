# Problem set 05 — Mutation and chromosomes

Covers [Ch 16–20](../part-03-genome-instability/16-mutation.md).

**Attempt before revealing.** Nearly every error in this set is a *units* error or a *denominator*
error, and reading the solution first hides both from you.

Problems are roughly in order of difficulty; ★ marks the two hardest. Parts labelled **Trap** carry a
misconception named explicitly in the solution.

---

## 1. Classify these five changes

Part of exon 2 of a gene, in frame, with the start of intron 2 in lower case. Exon 2 is **88 bp**
long and ends exactly at a codon boundary. Exon 3 begins `GATCCTAAGCT...` and is an *internal* exon —
several more exons follow it.

```
pos:  1 2 3   4 5 6   7 8 9   10 11 12   13 14 15
      C A T   G G C   G A A   T  G  T    C  A  G  | g t a a g t ...
      His     Gly     Glu     Cys        Gln
```

For each change give (i) transition or transversion **where the term applies**, (ii) molecular class,
(iii) consequence.

**(a)** pos 6, C→T **(b)** pos 7, G→T — **Trap** **(c)** pos 5, G→A
**(d)** deletion of pos 10 **(e)** pos 15, G→A — **Trap**

<details><summary>Solution</summary>

Note the only **CpG** in the window, at positions 6–7 (`GG`**`CG`**`AA`). Three of the five changes
touch it.

**(a)** C→T, pyrimidine→pyrimidine: **transition**. `GGC` → `GGT`, both **Gly**: **synonymous**, and
here genuinely silent. It is the commonest de novo substitution in the genome — position 6 is a CpG
cytosine, usually methylated, and deamination of 5-methylcytosine yields thymine directly — and it
*destroys* the CpG, which is why observed CpG frequency (~1%) sits fourfold below expectation.

**(b) Trap.** G→T, purine→pyrimidine: **transversion**. `GAA` → `TAA` = **STOP**: **nonsense**, and —
given the exon structure stated — far enough upstream of the *final* exon–exon junction to trigger
**nonsense-mediated decay**: loss of transcript, not a truncated protein.

Do that step properly rather than by reflex, because the window puts the stop codon suspiciously close
to a junction. Position 15 is the last base of an 88 bp exon 2, so the window is exon-2 positions
74–88 and the new `TAA` occupies positions 80–82 — only `88 − 82 = 6 nt` from the exon 2/3 junction.
The 50–55 nt rule is not measured against the *nearest* junction, though. The pioneer round of
translation strips every exon-junction complex the ribosome passes through, so what decides the fate of
the transcript is whether a complex is still deposited *beyond* the stop — i.e. whether the **last**
junction lies more than 50–55 nt downstream of it. Exon 3 is internal, so the last junction sits far
downstream and this PTC is degraded. Had exon 3 been the terminal exon, those same 6 nt would put the
stop inside the last-junction window and the transcript would **escape** NMD — a truncated protein,
the opposite prediction from the identical base change.

The trap: this is the G of the same CpG, so it looks like "the CpG mutation on the other strand". It
is not. On the antisense strand that G is a C, and its deamination product reads as **G→A** on the
sense strand — a transition. **G→T is not a deamination product at all.** G:C→T:A comes from
oxidation of guanine to **8-oxoguanine**, which pairs with adenine — also the oxidised-library
sequencing artefact and the signature of *MUTYH* loss.

**(c)** G→A, purine→purine: **transition**. `GGC` → `GAC`: Gly → **Asp**. **Missense**, and
non-conservative — glycine has no side chain and is the residue of choice at tight backbone turns.

**(d)** Deleting the T at position 10, spliced to exon 3:

```
before:  CAT GGC GAA TGT CAG | GAT CCT AAG CT...   His Gly Glu Cys Gln Asp Pro Lys
after:   CAT GGC GAA GTC AGG ATC CTA AGC T...      His Gly Glu Val Arg Ile Leu Ser
```

**Frameshift.** Everything from codon 4 on differs and the original stop is out of frame.

**(e) Trap.** G→A: **transition**. `CAG` → `CAA`, both **Gln** — **synonymous at the protein level**,
and therefore exactly what a coding-only filter discards. It is a **splice-site mutation**. Position
15 is the last exonic base, position −1 of the 5′ donor site (consensus `(C/A)AG | GURAGU`), where the
exon's terminal G is the most conserved exonic base and U1 snRNA pairs across the junction. Expect
exon skipping, intron retention, or a cryptic donor
([Ch 06](../part-01-molecular-foundations/06-rna-processing.md)).

Now use the exon length: skipping exon 2 removes 88 nt, and `88 / 3 = 29 remainder 1` — not a
multiple of three, so **skipping frameshifts everything downstream**, the same consequence class as
(d). Had exon 2 been 87 bp, skipping would have deleted 29 residues in frame, usually far milder.

</details>

---

## 2. Why transitions win when transversions outnumber them 2:1

**(a)** What Ti/Tv would uniform substitution give? Compute the enrichment implied by the observed
genome-wide ~2.0–2.1.
**(b)** Removing CpG C→T from a de novo spectrum drops Ti/Tv from ~2.1 to ~1.55. Derive what fraction
of all mutations CpG C→T must be.
**(c)** Exome Ti/Tv is higher still, ~3.0–3.3. Give the reason in one sentence.

<details><summary>Solution</summary>

**(a)** Each of four bases can change to three others: **12 substitutions**, four transitions (A↔G,
C↔T), eight transversions.

```
null Ti/Tv = 4/8 = 0.5        2.1 / 0.5 = 4.2
```

Transitions run **fourfold above chance**. The 2:1 combinatorial handicap turns an observed 2:1 ratio
into a fourfold *excess*; confusing ratio with enrichment is the standard error here.

**(b)** Let *f* = fraction of all mutations that are CpG C→T, all transitions. The remaining (1 − *f*)
has Ti/Tv = 1.55, so within it transitions are 1.55/2.55 = 0.6078 and transversions 1/2.55 = 0.3922.
Set the total ratio to 2.1:

```
[ f + 0.6078(1-f) ] / [ 0.3922(1-f) ] = 2.1

  0.3922f + 0.6078 = 0.8235 - 0.8235f
  1.2157f = 0.2157
        f = 0.177
```

**About 17.7%**, inside the 15–20% quoted from de novo studies — a real consistency check between two
independently reported numbers. Note the sensitivity: with residual 1.6 and observed 2.0 the same
algebra gives *f* = 0.133, so treat it as "roughly a sixth".

What *f* = 0.18 does **not** say: strip CpG C→T out entirely and Ti/Tv is still ~1.55, threefold above
the null. CpG deamination carries about a third of the excess; the rest is the geometric ease of
transition mispairing — a purine opposite a pyrimidine still fits the helix, while purine:purine and
pyrimidine:pyrimidine mismatches distort it.

**(c)** Purifying selection, which acts on coding sequence and not on most of the genome. Classify
third-position changes across the 61 sense codons — one transition and two transversions each:

```
transitions   synonymous: 58 / 61  = 95.1%
transversions synonymous: 68 / 122 = 55.7%
```

**95% of third-position transitions are invisible to protein-level selection, against 56% of
transversions** — the gap comes from the twofold-degenerate boxes, where the synonymous partner is
always a transition. So Ti/Tv needs *different thresholds per capture region*: a whole-genome callset
at 2.0 is healthy, an exome callset at 2.0 is alarming.

</details>

---

## 3. How many mutations did you invent?

Pinned germline rate **1.1–1.3 × 10⁻⁸ per bp per generation**; diploid genome **6.2 × 10⁹ bp**.

**(a)** Expected de novo point mutations in a child.
**(b)** **Trap.** Why 6.2 × 10⁹ and not 3.1 × 10⁹?
**(c)** Trio studies report ~60–70. What callable fraction reconciles that?
**(d)** **Trap.** Replication fidelity is ~10⁻¹⁰ per base. Why can you not use it here?

<details><summary>Solution</summary>

**(a)**

```
1.1e-8 x 6.2e9 = 68.2        1.3e-8 x 6.2e9 = 80.6
```

**Roughly 68–81** new point mutations neither parent carried.

**(b) Trap.** Every base pair in the child is a transmission event and there are two copies of each: a
mutation on either haplotype counts, and both are sequenced. Halving to 3.1 × 10⁹ gives 37, and comes
from thinking of "the genome" as the 3.1 Gb reference rather than the 6.2 Gb the child was handed.

**(c)** Short reads call variants only in the **callable** genome — not centromeres, segmental
duplications, or long tandem repeats. With ~15% unreadable:

```
0.85 x 80.6 = 68.5        0.85 x 68.2 = 58.0
```

which brackets the reported 60–70. Inverting instead, to reproduce 65 from the midpoint:

```
midpoint = (68.2 + 80.6)/2 = 74.4        65 / 74.4 = 0.874  ->  ~13% not callable
```

**The naive product is the true number; the reported number is the true number minus what the
instrument cannot see.** This is also why the long-read estimate (1.30 × 10⁻⁸) sits at the *top* of
the range: long reads recover the repetitive fraction, which is also the fastest-mutating part.

**(d) Trap.** Because **10⁻¹⁰ is per base per *replication* and 1.2 × 10⁻⁸ is per base per
*generation***. They differ ~100× and are not interchangeable.

Used directly, 10⁻¹⁰ × 6.2 × 10⁹ = **0.62 mutations per cell division** — true, and not what was
asked. A generation is not one replication. Summing ~300 germline divisions:

```
300 x 1e-10 = 3e-8 per bp per generation
```

against a measured 1.2 × 10⁻⁸ — an **overshoot of ~2.5×**, the expected direction, because 10⁻¹⁰ is
an order-of-magnitude bound rather than a constant. Pushing the other way, much germline mutation
never was a replication error: unrepaired deamination and depurination, which no polymerase fidelity
would prevent. Agreement within a factor of two to three is all this cross-check can claim.

</details>

---

## 4. Paternal age

Pinned: **~1.3–1.5 extra de novo mutations per year of paternal age**, **~80% paternal in origin**.
Anchor the total at **70 at paternal age 30**.

**(a)** Expected count for fathers aged 20 and 40.
**(b)** Paternal age has sd 6 years in a cohort. Predict the variance of the de novo count across
trios and compare with Poisson.

<details><summary>Solution</summary>

**(a)** Slope 1.4/year, anchored at 70 at age 30:

```
age 20:  70 - 10 x 1.4 = 56
age 40:  70 + 10 x 1.4 = 84        difference 28,  ratio 1.5
```

Across the pinned range the difference spans 26 (at 1.3/yr) to 30 (at 1.5/yr). **A 40-year-old father
transmits ~28 more de novo mutations than a 20-year-old — 50% more than that 20-year-old's 56.**

Name that denominator, because [Ch 16 §7](../part-03-genome-instability/16-mutation.md) quotes the
*same* 28 mutations as a **~40% increase**: `28/56 = 0.50` against the younger father's own count,
`28/70 = 0.40` against the population baseline of 70 at age 30. Same difference, two denominators,
two percentages, neither wrong — and both uninterpretable unstated.

Split by parent, this also shows the 80% figure is not a constant. At age 30, 0.80 × 70 = 56 paternal
and 14 maternal; holding maternal at 14 and putting the whole slope on the father gives 42/56 =
**75%** paternal at age 20 and 70/84 = **83%** at age 40.

Sanity-check against divisions. Spermatogonia divide ~23 times a year, so a pure replication-error
account at 10⁻¹⁰ per base over a haploid 3.1 × 10⁹ bp genome predicts `23 × 1e-10 × 3.1e9 = 7.13`
mutations/yr against an observed 1.4 — an **overshoot of ~5×**. The age effect is not purely
replicative.

**(b)** Condition on paternal age:

```
Var(N) = E[Var(N|age)] + Var(E[N|age])
       = 70 + (1.4 x 6)^2 = 70 + 70.56 = 140.6      sd = 11.9
```

Index of dispersion = 140.6/70 = **2.0**: the count is **twice as dispersed as Poisson**, and
essentially all the excess is one covariate. Same second-moment reasoning as the Luria–Delbrück
fluctuation test — the mean tells you little, the variance identifies the process.

**The trap:** none of this transfers to the mother. Maternal age is the dominant risk factor for
**aneuploidy**, via cohesin loaded in fetal life and decaying over decades of prophase-I arrest
([Ch 20 §6](../part-03-genome-instability/20-chromosome-abnormalities.md)) — *chromosome* errors, not
*point* mutations.

</details>

---

## 5. Lesion → pathway → disease

**(a)** For each lesion name the pathway and the disease caused by losing it: (1) UV cyclobutane
pyrimidine dimer; (2) adenine mis-inserted opposite 8-oxoguanine; (3) single-base mismatch and small
loops at a `(A)₂₅` tract; (4) *O*⁶-methylguanine from temozolomide; (5) two-ended double-strand break
in G1; (6) interstrand crosslink from mitomycin C.
**(b)** An identical break occurs in G1 and in S phase. What single step decides the pathway, and
what gates it?
**(c)** **Trap.** XP and Cockayne syndrome are both NER defects. XP carries >10,000-fold skin cancer
risk; CS carries essentially none. Reconcile.
**(d)** Cytosine deamination produces 100–500 uracils per cell per day. How efficient must uracil
excision be?

<details><summary>Solution</summary>

**(a)**

| # | Pathway | Disease of loss |
|---|---|---|
| 1 | **Nucleotide excision repair** — recognises helix distortion, not the chemistry | **Xeroderma pigmentosum**; losing only the transcription-coupled branch gives **Cockayne syndrome** |
| 2 | **Base excision repair**, glycosylase **MUTYH** | **MUTYH-associated polyposis**, with excess G:C→T:A |
| 3 | **Mismatch repair** (MutSα/MutSβ, MutLα) | **Lynch syndrome**; biallelic loss gives CMMRD. Readout is **microsatellite instability** |
| 4 | **Direct reversal** by **MGMT**, a *suicide* enzyme — stoichiometric, not catalytic | *MGMT* promoter methylation predicts temozolomide response in glioblastoma |
| 5 | **Non-homologous end joining** | **Radiosensitive SCID** (*LIG4*, *PRKDC*, *NHEJ1*, *DCLRE1C*) — V(D)J recombination *is* NHEJ, so the repertoire fails with the repair |
| 6 | **Interstrand crosslink / Fanconi pathway**, feeding into HR | **Fanconi anaemia** |

**(b)** The committing step is **5′→3′ end resection**. Once ends are single-stranded Ku cannot bind
and NHEJ is off the table; RPA coats the ssDNA and BRCA2 loads RAD51. Resection is gated by **CDK
activity** — low in G1, high from S on — which phosphorylates CtIP and EXO1; on top,
**53BP1–RIF1–shieldin blocks** resection and **BRCA1–BARD1 licenses** it. The elegance: the licensing
signal *is* the availability of the template, since sisters exist only after replication.

**(c) Trap.** Not "XP loses one branch, CS the other" — that fits only XP-C and XP-E. XP-A, XP-B,
XP-D, XP-F and XP-G lose core incision factors shared by both branches, so five of seven groups lose
transcription-coupled NER too.

What separates them is **the fate of the cell after repair fails**. In XP lesions persist in dividing
cells, get bypassed by error-prone translesion polymerases, and become mutations — cancer. In CS the
lesions that matter stall RNA polymerase II, a potent apoptotic signal, so cells die or arrest: tissue
attrition and ageing instead of tumours. **A repair deficiency causes cancer only in cells that
survive it.**

**(d)** Take 300/day over a 70-year lineage, allowing this one reaction at most ~100 lifetime
substitutions:

```
300 x 365 x 70 = 7,665,000 deamination events
100 / 7.665e6  = 1.30e-5     <- escape fraction
1 - 1.30e-5    = 0.9999870   <- 99.9987% success
```

**Uracil excision must succeed better than 99.998% of the time**, continuously, for seventy years —
which it does, precisely because uracil is *chemically foreign*. For 5-methylcytosine, whose product
is **thymine**, no unambiguous recognition is available; that loss of detectability is the entire CpG
hotspot, whose size problem 2(b) measured.

</details>

---

## 6. ★ Why a PARP inhibitor kills one cell and not its neighbour

A patient with a germline pathogenic *BRCA2* variant is treated with olaparib.

**(a)** Why is the tumour HR-deficient while the patient's normal cells are not — and when did that
asymmetry arise?
**(b)** Give the mechanism connecting PARP inhibition to death of an HR-deficient cell.
**(c)** Model the window. If PARP inhibition generates *N* one-ended double-strand breaks per S
phase, resolved with probability 0.999 by an HR-proficient cell and 0.5 by an HR-deficient one,
compute survival for *N* = 10 and *N* = 50.
**(d)** **Trap.** The tumour relapses with biallelic loss of *TP53BP1*. Explain — carefully.

<details><summary>Solution</summary>

**(a)** The patient is germline **heterozygous**: one working allele suffices, so every normal cell
does HR normally. The tumour arose after somatic loss of the second allele, so it alone is
HR-deficient. **The asymmetry exists before any drug is given** — the drug does not create
selectivity, it exploits a genotype difference tumour evolution already manufactured. Hence a
**germline** companion diagnostic on blood.

**(b)** **Synthetic lethality**: losing either gene alone is survivable, losing both is not.

```
BRCA2-/-              viable   (true by construction — the tumour exists)
PARP1 inhibited       viable   (normal cells tolerate it)
BRCA2-/- + PARP1 off  dead
```

PARP1 detects single-strand breaks and nucleates their repair. Inhibit it and SSBs persist; a
replication fork hitting one collapses into a **one-ended** double-strand break. One-ended breaks
cannot go through NHEJ — there is no second end to ligate to, and joining it to any other free end
makes a translocation — so the only correct route is HR off the sister chromatid. The HR-deficient
cell has none: it dies, or repairs by NHEJ/MMEJ into chromosome fusions and dies at mitosis anyway.

**The drug's target is intact in the tumour.** PARP1 is not mutated; the relationship is between two
*different* genes, which is what "synthetic" means. (Killing actually tracks PARP **trapping** on DNA
better than catalytic inhibition — talazoparib and veliparib inhibit comparably yet differ ~100-fold
in potency.)

**(c)** Survival across one S phase is the per-break success probability to the *N*:

```
N = 10:  proficient 0.999^10 = 0.9900     deficient 0.5^10 = 9.77e-4    ratio 1.01e3
N = 50:  proficient 0.999^50 = 0.9512     deficient 0.5^50 = 8.88e-16   ratio 1.07e15
```

A per-break difference of a **factor of two** becomes a selectivity of 10³ at ten breaks and 10¹⁵ at
fifty, because survival compounds multiplicatively over independent breaks — the
fidelity-as-a-product argument of [Ch 04](../part-01-molecular-foundations/04-dna-replication.md) run
in reverse. Selectivity therefore depends steeply on dose, which sets *N*, and collapses as the
deficient cell's per-break success climbs back toward 1.

**(d) Trap.** BRCA1's essential HR function is to **antagonise 53BP1–RIF1–shieldin and license
resection**, so deleting 53BP1 lets resection proceed without BRCA1, RAD51 loads, and HR is restored —
a well-documented resistance route.

But this patient is **BRCA2**-mutant, and BRCA2 acts **downstream** of resection: it loads RAD51 onto
RPA-coated ssDNA. Deleting 53BP1 in a BRCA2-null cell gives beautifully resected ends that still
cannot become a RAD51 filament. HR stays dead, the cell stays sensitive. **So the finding as stated
does not explain this relapse** — look instead for a *BRCA2* reversion mutation, restored fork
protection, or drug efflux. The trap is treating "BRCA1/2" as one gene; the asymmetry of 53BP1 rescue
is the cleanest evidence they act at different steps.

</details>

---

## 7. Reading nondisjunction off a genotype

A pericentromeric STR on chromosome 21, 200 kb from the centromere. Read depths in four unrelated
trisomy 21 probands:

| Family | Mother | Father | Child alleles (fraction of reads) |
|---|---|---|---|
| **I** | 28/30 | 32/32 | 28 (33%), 30 (33%), 32 (33%) |
| **II** | 28/30 | 32/32 | 28 (67%), 32 (33%) |
| **III** | 28/28 | 32/34 | 28 (33%), 32 (33%), 34 (33%) |
| **IV** | 28/30 | 32/32 | 28/30/32 in 30% of cells; 28/32 in the rest |

**(a)** Assign an origin to each.
**(b)** **Trap.** Crossovers between marker and centromere are rare but possible. With
P(signature-flipping crossover) = 0.05 and P(MI) = 0.75 among maternal errors: given an observed
**centromere-homozygous** result, what is P(true origin was MI)? Given heterozygous, P(MII)?

<details><summary>Solution</summary>

The logic in one line: **MI nondisjunction sends one chromatid of *each* homologue into the gamete;
MII sends two sister chromatids of *one* homologue.** So count the distinct alleles contributed by
the erring parent.

**(a)**

- **I** — both maternal alleles at equal dose: **centromere-heterozygous → maternal MI**.
- **II** — the maternal contribution is 28 at double dose. The 67:33 read ratio *is* the assay;
  without dosage this looks like an ordinary heterozygote. **Centromere-homozygous → maternal MII**.
- **III** — the mother is uninformative (28/28) but the father contributed both 32 and 34: **paternal
  MI**. A marker reports only on the parent heterozygous at it.
- **IV** — two cell lines: **post-zygotic mitotic nondisjunction**, i.e. **mosaic** trisomy 21.

For calibration: ~90% of trisomy 21 is maternal and ~70–80% of those are MI, so of 100 cases expect
67.5 maternal MI, 22.5 maternal MII, 10 other — call it **~68 / ~22 / ~10**, and note that rounding
*both* halves up gives 101 cases out of 100.

**(b) Trap.** One crossover between centromere and marker swaps the signatures. With P(MI) = 0.75,
P(MII) = 0.25, *c* = 0.05:

```
P(homozygous)   = 0.75 x 0.05 + 0.25 x 0.95 = 0.0375 + 0.2375 = 0.2750
P(MI | homozygous)    = 0.0375 / 0.2750 = 0.136

P(heterozygous) = 0.75 x 0.95 + 0.25 x 0.05 = 0.7125 + 0.0125 = 0.7250
P(MII | heterozygous) = 0.0125 / 0.7250 = 0.017
```

**A single-marker "MII" call is wrong ~14% of the time; a single-marker "MI" call is wrong ~2%.** The
asymmetry is pure base rate — MI is three times more common, so its rare leakage into the small
homozygous class rivals the genuine MII cases, while MII's leakage into the large heterozygous class
is swamped. Nothing about the assay is asymmetric; the prior is. Hence real studies genotype a
**panel**. And even a correct centromere-homozygous call does not cleanly mean MII — much of that
class is attributed to **premature separation of sister chromatids during MI**, so report what you
measured and treat "MI/MII" as a model laid on top.

</details>

---

## 8. ★ Inversion mechanics

Two carriers, each heterozygous for an inversion. `●` is the centromere.

```
Carrier P (paracentric)          Carrier Q (pericentric)
normal    1 2 ● 3 4 5 6 7 8      normal    1 2 3 ● 4 5 6 7
inverted  1 2 ● 6 5 4 3 7 8      inverted  1 2 5 4 ● 3 6 7
```

In each, one crossover occurs inside the inversion loop, between markers 4 and 5.

**(a)** Enumerate the four chromatids for carrier P.
**(b)** Enumerate the four chromatids for carrier Q.
**(c)** Why does one carrier's risk present as reduced fertility and the other's as an abnormal
liveborn? Which inversion size is more dangerous?
**(d)** **Trap.** Why is measured recombination *across* an inversion near zero?

<details><summary>Solution</summary>

Aligning an inverted segment with its normal partner forces a **loop**: markers pair up 1,2,3,4,5,…
along the axis, but on the inverted chromosome that axis runs *backwards* along the physical molecule.
Everything follows from tracing the four arms leaving the exchange point, which joins the
axis-decreasing arm of one chromatid to the axis-increasing arm of the other.

**(a) Paracentric.** Split each chromosome physically at the crossover — between 4 and 5 on the
normal, between 5 and 4 on the inverted, which reads `1 2 ● 6 5 | 4 3 7 8`:

```
recombinant 1 = (1 2 ● 3 4) + (5 6 ● 2 1) = 1-2-●-3-4-5-6-●-2-1
                TWO centromeres -> DICENTRIC     dup 1,2 ; no 7,8

recombinant 2 = (8 7 3 4)   + (5 6 7 8)   = 8-7-3-4-5-6-7-8
                NO centromere  -> ACENTRIC       dup 7,8 ; no 1,2
```

The other two chromatids were uninvolved and are **parental** — one normal, one inverted, both
balanced. The dicentric bridges and breaks; the acentric is never captured by the spindle and is lost.
The duplication/deficiency is *present*, simply packaged in structures that destroy themselves.

**(b) Pericentric.** Same procedure; the inverted chromosome reads `1 2 5 | 4 ● 3 6 7`:

```
recombinant 1 = (1 2 3 ● 4) + (5 2 1)   = 1-2-3-●-4-5-2-1    ONE centromere, dup 1,2 ; del 6,7
recombinant 2 = (7 6 3 ● 4) + (5 6 7)   = 7-6-3-●-4-5-6-7    ONE centromere, dup 6,7 ; del 1,2
```

Two parental chromatids again, but each recombinant is now **monocentric** and perfectly
transmissible, carrying a **duplication of the material distal to one breakpoint and a deficiency of
that distal to the other**.

**(c)** The centromere's position relative to the loop is the whole difference. Paracentric products
self-destruct before fertilisation, so the carrier shows **near-normal reproductive outcomes**, at
most slightly reduced fertility. Pericentric products are viable chromosomes that fertilise, so the
carrier presents with **miscarriage or an unbalanced liveborn**.

Note *which* material is imbalanced: **always the flanking regions outside the inversion**. Hence the
counterintuitive risk rule — a *larger* inverted segment captures more crossovers **and** leaves
smaller flanking segments, so the imbalances are smaller and more survivable. Risk is negligible below
~30% of chromosome length and highest above 50%: **the dangerous inversion is the big one.**

**(d) Trap.** It does not mean crossovers fail to happen. They happen. What is suppressed is the
**recovery** of the products — dicentrics and acentrics are destroyed, unbalanced conceptuses are
lost. Either way the recombinants never reach the next generation, so the *observed* recombination
fraction collapses toward zero and the inverted segment is inherited as one non-recombining block
with persistently high linkage disequilibrium
([Ch 29](../part-05-population-genetics/29-linkage-disequilibrium.md)). Keep the two risks apart,
though: a balanced carrier has **normal gene dosage and is typically healthy**. "Balanced" describes
the carrier's genome, not their gametes.

</details>

---

## Where you went wrong

| Error pattern | What to re-read |
|---|---|
| Treated a synonymous change as consequence-free | Problem 1(e) — the exon's last base is part of the donor site |
| Called G→T at a CpG "the CpG mutation" | Problem 1(b) — deamination gives G→A |
| Judged NMD against the nearest junction rather than the last one | Problem 1(b) — the stop sits 6 nt from the exon 2/3 junction |
| Confused the raw Ti/Tv ratio with enrichment over chance | Problem 2(a) — the null is 0.5 |
| Halved the genome when counting de novo mutations | Problem 3(b) — both transmitted copies count |
| Used per-replication fidelity for a per-generation question | Problem 3(d), and [verified facts](../reference/verified-facts.md) |
| Quoted a percentage change without naming its denominator | Problem 4(a) — 28 mutations is +50% or +40% depending on the base |
| Blamed maternal age for a child's extra point mutations | Problem 4(b) — maternal age drives aneuploidy |
| Said XP and Cockayne differ by which NER branch is lost | Problem 5(c) — five of seven XP groups lose both |
| Assumed 53BP1 loss rescues any BRCA-mutant tumour | Problem 6(d) — BRCA1 only; BRCA2 acts downstream |
| Read one pericentromeric marker as a definitive MI/MII call | Problem 7(b) — ~14% of "MII" calls are MI |
| Said inversions prevent crossing over | Problem 8(d) — they prevent recovery of the products |
