# Problem set 06 — Gene regulation

Covers [Ch 21–25](../part-04-gene-regulation/21-bacterial-regulation.md).

**Attempt before revealing.** Merodiploid problems are fully determined by an algorithm, so
reading the worked answer teaches you nothing. Run it yourself, on paper, every time.

**Notation.** `I` is *lacI* (repressor), `P` the *lac* promoter, `O` the operator, `Z` *lacZ*
(β-galactosidase), `Y` *lacY* (permease). `P⁻` breaks the *lac* promoter only — *lacI* has its
own promoter. A slash separates chromosome (left) from F′ (right). ★ marks the two hardest.

---

## 1. The *lac* truth table

**(a)** Fill in the four rows: lactose present/absent × glucose present/absent, giving operator
state, CRP state, and output.
**(b)** Name the actual molecular signal carrying each input. Neither is the sugar in the
column heading.
**(c)** Write the Boolean expression, then test it. Using the occupancy model of
[Ch 21 §4](../part-04-gene-regulation/21-bacterial-regulation.md) — `rate ∝ f_free × A` with
`A = 0.03 + 0.97·p_C`, `f_free` = 0.001 / 0.15 / 0.95 and `p_C` = 0.05 (glucose present) or
0.90 (absent) — compute the four rates. Is this an AND gate?

<details><summary>Solution</summary>

**(a)**

| Lactose | Glucose | Operator | CRP–cAMP | *lacZYA* |
|:--:|:--:|---|---|---|
| − | + | occupied by LacI | absent | off |
| − | − | occupied by LacI | present | off |
| + | + | mostly occupied (inducer exclusion) | absent | barely on |
| + | − | free | present | **ON** |

**(b) Trap, and the commonest error on this operon.**

- The lactose input is carried by **allolactose**, an isomer made as a side reaction by
  β-galactosidase — the enzyme this operon encodes. Lactose itself binds nothing regulatory.
- The glucose input is carried by **the act of transporting glucose**. Import leaves
  EIIA<sup>Glc</sup> unphosphorylated, which (i) fails to activate adenylate cyclase, so cAMP
  falls and CRP loses its ligand, and (ii) binds LacY directly, shutting the permease
  (**inducer exclusion**).

So the "lactose" row really means "allolactose present", which requires pre-existing permease
*and* pre-existing β-galactosidase. That is why repression must be leaky: a perfect repressor
makes the operon permanently uninducible.

**(c)** `expression = allolactose AND NOT glucose-transport`. Compute `A`:

- glucose present: A = 0.03 + 0.97 × 0.05 = **0.0785**
- glucose absent: A = 0.03 + 0.97 × 0.90 = **0.903**

| Lactose | Glucose | f_free | A | rate = f_free × A | normalised |
|:--:|:--:|--:|--:|--:|--:|
| − | + | 0.001 | 0.0785 | 7.85 × 10⁻⁵ | 0.000092 |
| − | − | 0.001 | 0.903 | 9.03 × 10⁻⁴ | 0.00105 |
| + | + | 0.15 | 0.0785 | 1.178 × 10⁻² | 0.0137 |
| + | − | 0.95 | 0.903 | 8.579 × 10⁻¹ | 1.000 |

Dynamic range = 8.579 × 10⁻¹ / 7.85 × 10⁻⁵ = **10,930-fold**. Switch-like, certainly.

But **it is not an AND gate**: the three "off" states are not equal. The loudest exceeds the
quietest by 1.178 × 10⁻² / 7.85 × 10⁻⁵ = **150-fold** — exactly the `f_free` ratio 0.15 / 0.001,
since both states are glucose-present and `A` cancels. A digital AND has one `0`; this has three,
spanning two orders of magnitude. What makes it *look* digital is positive feedback, which gives
bistability — so the population mean reports a value no single cell holds
([Ch 48](../part-10-functional-genomics/48-single-cell-and-spatial.md)).

</details>

---

## 2. *lacI*⁻ — a broken *trans* factor

Predict β-galactosidase, with and without inducer (IPTG).

| # | Genotype | − IPTG | + IPTG |
|---|---|---|---|
| 1 | `I⁺ O⁺ Z⁺` | | |
| 2 | `I⁻ O⁺ Z⁺` | | |
| 3 | `I⁻ O⁺ Z⁺ / F′ I⁺ O⁺ Z⁻` | | |
| 4 | `I⁺ O⁺ Z⁻ / F′ I⁻ O⁺ Z⁺` | | |

**(a)** Fill in the table.
**(b)** Rows 3 and 4 put the same alleles on opposite molecules. Why does that not matter?
**(c)** LacI is present at ~10 tetramers per cell, and each *lac* copy carries three operators
(O1, O2, O3), so a merodiploid has two copies. Is one functional *lacI* enough? Show the
arithmetic.

<details><summary>Solution</summary>

**(a)**

| # | Genotype | − IPTG | + IPTG | Phenotype |
|---|---|:--:|:--:|---|
| 1 | `I⁺ O⁺ Z⁺` | − | + | inducible (wild type) |
| 2 | `I⁻ O⁺ Z⁺` | **+** | **+** | constitutive |
| 3 | `I⁻ O⁺ Z⁺ / F′ I⁺ O⁺ Z⁻` | − | + | **inducible — rescued** |
| 4 | `I⁺ O⁺ Z⁻ / F′ I⁻ O⁺ Z⁺` | − | + | **inducible — rescued** |

Row 3 by the algorithm: pool the *trans* products — the F′ `I⁺` puts functional LacI in the
cell and it diffuses to both operators. Chromosome `O⁺` repressed, `Z⁺` the only enzyme source;
F′ `O⁺` repressed, `Z⁻` silent anyway. Net: inducible.

**(b)** Because LacI is a **protein**, and a protein leaves the DNA that encoded it. Which
molecule carried the *gene* is invisible to the assay. That is what ***trans*-acting** means,
and why `lacI⁻` is **recessive**: one good copy anywhere supplies the missing global.

**Trap.** "Recessive" here is not inferred from a cross — no meiosis, no gametes, no 3:1. The
merodiploid test asks exactly one question: *does a second copy fix it?* Yes → the lesion is in
a diffusible product. No → the lesion is in the DNA itself.

**(c)** Sites to cover: 3 operators × 2 copies = **6**. Capacity: a LacI tetramer is a dimer of
dimers, so each grips **two** operators (that bridging is what loops the DNA):

10 tetramers × 2 sites = **20 site-equivalents against 6 sites** — a threefold excess.

One functional `lacI` is sufficient, which is what the experiment shows. Note how tight it is:
repression with all three operators is ~1,300-fold, so O1 is unoccupied a fraction
1/1,300 = **7.7 × 10⁻⁴** of the time — the same order of magnitude as the round `f_free = 0.001`
problem 1 uses. (Those occupancies are their own model, not this measurement: 0.95 / 0.001 is
950-fold repression, not 1,300. Same ballpark, different provenance.)

</details>

---

## 3. *lacI*ˢ — a *trans* factor that poisons

`lacI`ˢ binds the operator normally but cannot be released by inducer.

| # | Genotype | − IPTG | + IPTG |
|---|---|---|---|
| 1 | `Iˢ O⁺ Z⁺` | | |
| 2 | `Iˢ O⁺ Z⁺ / F′ I⁺ O⁺ Z⁺` | | |
| 3 | `I⁺ O⁺ Z⁺ / F′ Iˢ O⁺ Z⁻` | | |
| 4 | `Iˢ O⁺ Z⁻ / F′ I⁻ O⁺ Z⁺` | | |

**(a)** Fill in the table.
**(b)** Row 2 is dominant. Give the mechanism, and explain why dominance here is *not* evidence
that the mutant protein is more active.
**(c)** If `Iˢ` and `I⁺` subunits are made in equal amounts and tetramers assemble at random,
what fraction is pure wild type? With ~10 tetramers per cell, how many does a cell hold?
**(d)** Repeat (c) with mutant subunits at 10% of the pool. What does the comparison say about
how absolute dominance is?

<details><summary>Solution</summary>

**(a)** All four are **uninducible — no β-galactosidase under any condition**.

| # | Genotype | − IPTG | + IPTG |
|---|---|:--:|:--:|
| 1 | `Iˢ O⁺ Z⁺` | − | − |
| 2 | `Iˢ O⁺ Z⁺ / F′ I⁺ O⁺ Z⁺` | − | − |
| 3 | `I⁺ O⁺ Z⁺ / F′ Iˢ O⁺ Z⁻` | − | − |
| 4 | `Iˢ O⁺ Z⁻ / F′ I⁻ O⁺ Z⁺` | − | − |

Row 3 is the one to check. `Iˢ` sits on the F′, whose `Z⁻` makes no enzyme — yet the strain is
uninducible, because the superrepressor diffuses to the chromosomal operator and locks the
intact `Z⁺` copy off. **Which molecule carries a *trans* factor is irrelevant.** Hold that until
problem 4, where the opposite holds. Row 4: the pool is pure `Iˢ`, locking the F′'s `O⁺`.

**(b)** LacI is a **homotetramer**, so wild-type and mutant subunits co-assemble into **mixed
tetramers**. A mixed tetramer still binds DNA but cannot be released, because release requires
the whole particle to make the allosteric shift. A minority of mutant subunits disables the
majority — **negative complementation**: dominance from multimerisation, not hyperactivity.

**Trap.** Dominance describes how a lesion behaves *in the presence of a good copy*, not how
strong the mutant product is. `Iˢ` has lost a function yet is dominant, while `I⁻`, which has
lost more function, is recessive. Loss-of-function does not imply recessive.

**(c)** Four subunits drawn independently from a 50:50 pool:

P(all four wild type) = (½)⁴ = 1/16 = **6.25%**; P(≥ 1 mutant) = **93.75%**
Expected pure-wild-type tetramers = 10 × 0.0625 = **0.625 per cell**

A typical cell holds **zero** functional repressor particles, so at this copy number the
dominance is close to absolute.

**(d)** Mutant subunits at 10%:

P(all four wild type) = 0.9⁴ = **65.6%**; P(poisoned) = **34.4%**
Expected pure-wild-type tetramers = 10 × 0.6561 = **6.6 per cell** — substantially inducible.

Dominance is **quantitative and dose-dependent**, not a binary label, and the exponent 4
amplifies it: 10% → 50% mutant subunits takes the poisoned fraction from 34% to 94%.

</details>

---

## 4. *lacO*ᶜ — a *cis* element, and why "dominant" is the wrong word

`lacO`ᶜ is an operator sequence no repressor can bind.

| # | Genotype | − IPTG | + IPTG |
|---|---|---|---|
| 1 | `I⁺ Oᶜ Z⁺` | | |
| 2 | `I⁺ Oᶜ Z⁺ / F′ I⁺ O⁺ Z⁺` | | |
| 3 | `I⁺ Oᶜ Z⁻ / F′ I⁺ O⁺ Z⁺` | | |
| 4 | `I⁻ Oᶜ Z⁻ / F′ I⁺ O⁺ Z⁺` | | |

**(a)** Fill in the table.
**(b)** Rows 2 and 3 differ by one allele — `Z⁺` versus `Z⁻` on the `Oᶜ` copy. Why does that
change the phenotype completely?
**(c)** For row 2, predict the *quantitative* ratio of uninduced to induced β-galactosidase,
taking full repression as 1,300-fold. Why is the ratio diagnostic?

<details><summary>Solution</summary>

**(a)**

| # | Genotype | − IPTG | + IPTG | Phenotype |
|---|---|:--:|:--:|---|
| 1 | `I⁺ Oᶜ Z⁺` | + | + | constitutive |
| 2 | `I⁺ Oᶜ Z⁺ / F′ I⁺ O⁺ Z⁺` | **+** | ++ | **constitutive** |
| 3 | `I⁺ Oᶜ Z⁻ / F′ I⁺ O⁺ Z⁺` | **−** | + | **inducible** |
| 4 | `I⁻ Oᶜ Z⁻ / F′ I⁺ O⁺ Z⁺` | **−** | + | **inducible** |

Row 3: the *trans* pool is healthy. The chromosomal copy is `Oᶜ`, so it ignores the repressor
and is transcribed constitutively — but its `Z⁻` makes that constitutivity invisible to the
assay, and the F′ `O⁺ Z⁺` supplies all the enzyme, inducibly. Row 4 repeats the logic with two
decoys: `I⁻` rescued in *trans*, `Oᶜ` stranded on a `Z⁻` copy. Three mutations, none detectable.

**(b)** Because an operator is a **sequence**, not a product: it can only affect transcription
of genes on its own DNA molecule, so it is scored on that molecule's structural genes and
nowhere else.

**Trap, and the point of this problem set.** `Oᶜ` is called "***cis*-dominant**", and
*dominant* misleads. It is not out-competing `O⁺`; it is not interacting with it at all, and has
literally zero effect on the other copy. Whether you can **detect** it depends on which
structural genes sit downstream of it on its own molecule — a fact about your reporter, not
about dominance. Contrast problem 3 row 3, where a *trans* factor on a `Z⁻` molecule was fully
detectable.

**(c)** Take one fully derepressed copy as 1 unit; a repressed `O⁺` copy runs at
1/1,300 = 7.69 × 10⁻⁴.

Uninduced = 1 (the `Oᶜ` copy) + 7.69 × 10⁻⁴ = **1.00077**
Induced = 1 + 1 = **2**; ratio = 1.00077 / 2 = **0.500**

The strain expresses ~**50%** of its induced level with no inducer; the haploid of row 1 gives
1/1 = **100%**. That is diagnostic — a **fully** constitutive strain has no repressible copy, a
**half** constitutive strain has exactly one. Measuring the ratio rather than scoring ± tells
you the copy number and lets you infer the genotype. This is "partial constitutivity": a
quantitative signature, not a hedge.

</details>

---

## 5. ★ Separating *cis* from *trans* when both are broken

Both reporters assayed now. Predict β-galactosidase **and** permease, ± IPTG.

| # | Genotype |
|---|---|
| a | `Iˢ P⁺ O⁺ Z⁺ Y⁻ / F′ I⁺ P⁺ Oᶜ Z⁻ Y⁺` |
| b | `I⁻ P⁻ Oᶜ Z⁺ Y⁺ / F′ I⁺ P⁺ O⁺ Z⁻ Y⁺` |
| c | `I⁺ P⁺ O⁺ Z⁻ Y⁺ / F′ I⁻ P⁺ Oᶜ Z⁺ Y⁻` |
| d | `Iˢ P⁻ O⁺ Z⁺ Y⁺ / F′ I⁺ P⁺ Oᶜ Z⁺ Y⁻` |

**(a)–(d)** Work each one.
**(e)** You isolate a new constitutive mutant, genotype `? Z⁺`. Design the single merodiploid
that distinguishes `I⁻` from `Oᶜ`. State the exact F′ and why.

<details><summary>Solution</summary>

The algorithm: **(1)** pool the *trans* products; **(2)** take each copy separately, promoter
first, then operator; **(3)** check that copy's structural genes; **(4)** sum.

**(a)** Pool: `Iˢ` → mixed tetramers → repressor locked onto DNA, inducer irrelevant.
Chromosome `P⁺ O⁺` → locked off, so `Z⁺` is never expressed and `Y⁻` is broken anyway. F′
`P⁺ Oᶜ` → immune → constitutive; `Z⁻` no enzyme, `Y⁺` yes.

**(b)** Pool: F′ `I⁺` → normal inducible repressor. Chromosome `P⁻` → **no transcription of
anything, ever**; the `Oᶜ` sits downstream of a dead promoter and is meaningless, `Z⁺ Y⁺`
silent. F′ `P⁺ O⁺` → inducible; `Z⁻` none, `Y⁺` inducible.

**Trap.** `Oᶜ` here is not merely invisible to one reporter — it is *mechanistically inert*. You
cannot regulate a transcript that is never made. Check the promoter before the operator.

**(c)** Pool: chromosomal `I⁺` → normal repressor. Chromosome `P⁺ O⁺` → inducible; `Z⁻` none,
`Y⁺` inducible permease. F′ `Oᶜ` → constitutive; `Z⁺` constitutive β-gal, `Y⁻` none.

**(d)** Pool: `Iˢ` → locked. Chromosome `P⁻` → nothing, so `O⁺ Z⁺ Y⁺` all silent. F′ `Oᶜ` →
immune → constitutive; `Z⁺` yes, `Y⁻` none.

| | β-gal −IPTG | β-gal +IPTG | Permease −IPTG | Permease +IPTG |
|---|:--:|:--:|:--:|:--:|
| **a** | none | none | **+** | **+** |
| **b** | none | none | − | **+** |
| **c** | **+** | **+** | − | **+** |
| **d** | **+** | **+** | none | none |

Row **c** is the one to memorise: **one cell, two genes of the same operon, one constitutive and
one inducible.** There is no such thing as a "constitutive cell" — constitutivity is a property
of a *copy*, and the assay reports whichever copy carries the reporter.

Row **d** shows that a *trans*-dominant lesion and a *cis*-dominant lesion in one cell do not
fight. `Iˢ` wins wherever repressor can bind; `Oᶜ` is a molecule where it cannot.

**(e)** Introduce **F′ `I⁺ O⁺ Z⁻`**.

- Lesion is `I⁻`: the F′ supplies repressor **in *trans***, it binds the chromosomal `O⁺`, and
  the strain becomes **inducible**.
- Lesion is `Oᶜ`: the chromosomal operator binds no repressor however much arrives, so the
  strain stays **constitutive**.

The `Z⁻` is the load-bearing design choice and the part people omit: it guarantees all measured
β-galactosidase comes from the chromosome, making the readout binary. With `F′ I⁺ O⁺ Z⁺` you
would still get an answer — `I⁻` → inducible, `Oᶜ` → ~50% constitutive by problem 4(c) — but you
would be discriminating two levels of a continuous quantity instead of presence from absence.

</details>

---

## 6. *trp* attenuation

The *trp* leader encodes a 14-codon peptide with **Trp codons at positions 10 and 11**. Four RNA
segments: 3:4 is an intrinsic terminator, 2:3 an antiterminator that consumes segment 3.

Model TrpR as 70-fold control of initiation and attenuation as 9-fold control of readthrough
(readthrough 0.90 when Trp is scarce, 0.10 when plentiful).

**(a)** For high and for low tryptophan, state where the ribosome sits, which hairpin forms, and
whether polymerase reaches *trpE*.
**(b)** Compute expression in both conditions and the combined fold-control.
**(c)** A mutation deletes the leader start codon, so no ribosome ever loads. Predict the
outcome under tryptophan starvation.
**(d)** A mutation changes both leader Trp codons to Arg codons. Predict expression under
starvation, and how much regulation survives.
**(e)** Why can no eukaryote use this mechanism? Be precise about what is forbidden.

<details><summary>Solution</summary>

**(a)** The measurement is the ribosome's *speed*; its position is the readout.

**Trp plentiful** — charged tRNA-Trp abundant, the ribosome sails through codons 10–11, reaches
the leader stop codon and rests **covering segment 2**. With 2 sequestered, 2:3 cannot form;
**3:4 pairs into the terminator** and polymerase releases at the U-tract. ***trpEDCBA* not
transcribed.**

**Trp scarce** — uncharged tRNA-Trp, the ribosome **stalls at codons 10–11** on segment 1,
leaving 2 free. **2:3 forms**, consuming segment 3 so 3:4 cannot. **Polymerase reads through.**

Two consecutive Trp codons in a 14-codon peptide is a statistical scream — tryptophan is the
rarest amino acid, ~1% of residues. The peptide is an instrument, not a product.

**(b)** Take fully derepressed initiation as 1.

Low Trp: 1 (TrpR is apo and cannot bind DNA) × 0.90 = **0.90**
High Trp: 1/70 = 0.01429 (Trp is a **corepressor** — it puts TrpR *on* the DNA) × 0.10
= **1.429 × 10⁻³**

Combined = 0.90 / 1.429 × 10⁻³ = **630-fold** = 70 × 9. The mechanisms act at different control
points (initiation, elongation), so they multiply.

**(c)** With no ribosome at all, 1:2 and 3:4 both pair: **the terminator forms and transcription
stops**, even though tryptophan is absent and the enzymes are needed. This reveals the design —
**the default is terminate**, and it takes an *actively stalled ribosome* to switch readthrough
on. The system does not detect missing tryptophan; it detects a ribosome in trouble, so anything
that stops leader translation reads as "plenty of tryptophan".

**(d)** With Arg codons at 10–11 the ribosome no longer stalls when Trp is scarce; Arg is
abundant, so it parks on segment 2 exactly as in the plentiful case.

Under starvation: 1 × 0.10 = **0.10**, i.e. 0.90/0.10 = **9-fold below wild type**, precisely
when the cell needs the enzymes most.

Surviving range: high Trp gives (1/70) × 0.10 = 1.429 × 10⁻³, so 0.10 / 1.429 × 10⁻³
= **70-fold** — TrpR alone. Attenuation is not broken; it is **decoupled from the signal**. It
still fires, always the same way. A sensor stuck at one reading is worse than no sensor, because
it still costs.

**(e)** It requires a ribosome translating a transcript **while polymerase is still making it**,
so ribosome position determines which hairpin forms ahead of the polymerase. Bacteria have no
nucleus; in a eukaryote the transcript is capped, spliced and exported before any ribosome
touches it.

**Be precise about what is forbidden.** Attenuation in the general sense — a leader RNA deciding
whether an already-initiated transcript continues — thrives in eukaryotes: promoter-proximal
Pol II termination is genome-wide, and eukaryotic TPP riboswitches make that decision by RNA
folding. Only the **ribosome-as-sensor** version is ruled out. The nuclear envelope does not add
a processing step; it deletes a class of mechanism.

</details>

---

## 7. Three ways to break a eukaryotic locus

`ENH-L` is a limb-bud-specific enhancer; `geneA` has separate enhancers active in gut and brain;
`geneB`, in the neighbouring domain, is dosage-sensitive and normally brain-only.

```
   CTCF-B1 ▶                                                  ◀ CTCF-B2
   ├───────────────── TAD A (850 kb) ──────────────────┤      ├── TAD B ──┤
   [ENH-L]────────── 350 kb ──────────[P_geneA]─[geneA]        [P_geneB]─[geneB]
```

Predict each consequence, naming **which genes** and **which tissues**:

**(a)** A 600 bp deletion removing `ENH-L`.
**(b)** A point mutation destroying the TATA box in `P_geneA`.
**(c)** A 3 kb deletion removing `CTCF-B2`.
**(d)** Which would exome sequencing detect? Which are *cis*-acting?
**(e)** ENCODE lists **2,348,854** candidate *cis*-regulatory elements against **19,442**
protein-coding genes in a 3.1 × 10⁹ bp genome. Compute elements per gene, mean spacing, and how
many candidates sit inside TAD A.

<details><summary>Solution</summary>

**(a) Enhancer deletion — tissue-specific loss, or nothing.** `geneA` loses limb-bud expression;
gut and brain are untouched, driven by different enhancers acting on the same promoter. `geneB`
unaffected. This is the classic non-coding disease mechanism, and why a limb malformation can be
caused by a variant 350 kb from any coding base.

**Trap.** The honest prediction has a second branch: **frequently, deleting an enhancer does
nothing measurable**, because shadow/redundant enhancers drive the same pattern. Redundancy is
the norm in development, so "no phenotype" is weak evidence that an element is non-functional.

**(b) Promoter mutation — all tissues, one gene, one allele.** The core promoter is the common
output point every enhancer must act through, so `geneA` is degraded in **limb, gut and brain
alike**; `geneB` unaffected. That is the sharpest contrast with (a): enhancer lesions are
tissue-restricted, promoter lesions are not. Mechanistically, enhancers set **burst frequency**
and core promoter elements set **burst size**, so this reduces how much RNA each firing event
makes rather than how often the gene fires. (Only ~10% of human promoters carry a TATA box, so
this is not a generic lesion.)

**(c) Boundary deletion — a gain of expression, in the wrong gene.** `geneA` keeps its own
enhancers and is roughly fine. The dominant consequence is that `ENH-L`, no longer confined, can
contact `P_geneB` and drive **`geneB` ectopically in the limb bud** — **enhancer hijacking**, as
at the *EPHA4* boundary in limb malformation and at boundaries removed by structural variants in
cancer.

**Trap.** The instinct is loss of function, because deletions usually cause loss. Here a deletion
causes a **gain**, of the wrong gene, in the wrong tissue, and the affected gene is not the one
nearest the deletion. Deleting a constraint is not the same as deleting a function.

**(d) Exome sequencing detects none of them** — 350 kb upstream, a core promoter, an insulator.
**All three are *cis*-acting**, which is the payoff of problems 2–5: each affects only the
chromosome it sits on, so in a heterozygote each produces **allele-specific expression**. That
*is* the merodiploid test run in a human, with the homologous chromosome playing the F′
([Ch 52](../part-11-human-and-statistical-genomics/52-association-to-mechanism.md)).

**(e)** Elements per protein-coding gene: 2,348,854 / 19,442 = **120.8**

Mean spacing: 3.1 × 10⁹ / 2,348,854 = **1,320 bp** — a candidate element every ~1.3 kb

Candidates inside TAD A: 850,000 / 1,320 = **644**

A non-coding variant in this TAD sits among ~644 candidates, of which perhaps one is causal — a
prior of 1/644 ≈ **0.16%** before any other evidence, which is why nearest-gene assignment fails
so often. And 2.3 million counts *candidates*: an upper bound on real regulation, a lower bound
on the interpretation problem.

</details>

---

## 8. ★ Feed-forward loops: what each one computes

X is an input, Y an intermediate TF, Z the output.

- **Coherent type-1 (C1-FFL), AND logic:** X → Y; X **and** Y → Z.
- **Incoherent type-1 (I1-FFL):** X → Z; X → Y ⊣ Z.

In both, `dY/dt = β − αY` while X is on with β = 10 units/min and α = 0.1 min⁻¹, and
`dY/dt = −αY` when X is off; Y starts at 0. For the C1-FFL, Z fires iff X is present **and**
Y ≥ 50. For the I1-FFL, take Z as fast relative to Y, so `Z(t) = 100 × 30/(30 + Y(t))` while X
is on.

**(a)** Write Y(t); compute the steady state and the C1-FFL's ON-delay.
**(b)** Give a 4-minute pulse of X. Does Z fire? Show the number.
**(c)** Give a 30-minute sustained X, removed at t = 30. When does Z switch on and off? Explain
the asymmetry.
**(d)** For the I1-FFL compute Z at t = 0, 5, 10, 20 and at steady state. Give the peak-to-steady
ratio and the time at which Z falls to half its peak.
**(e)** Name the computation each performs, and say which you would wire to an expensive
irreversible response driven by a noisy input.
**(f)** Rebuild the C1-FFL with **OR** logic. Where does the delay move? Compute it.

<details><summary>Solution</summary>

**(a)** Y(t) = (β/α)(1 − e^(−αt)) = **100(1 − e^(−0.1t))**, steady state Y* = 10/0.1 = **100**.
Note what sets the timescale: **α alone**. Raising β raises the final level but does not make it
arrive sooner.

ON-delay — Y reaching 50, which is half of Y*:

100(1 − e^(−0.1t)) = 50 → e^(−0.1t) = 0.5 → t = ln 2 / 0.1 = **6.93 min**

The threshold sits at half the steady state, so the delay is exactly one protein half-life.

**(b)** Y(4) = 100(1 − e^(−0.4)) = 100(1 − 0.67032) = **32.97 units**

32.97 < 50, so **Z never fires**, and the AND fails outright the moment X leaves. Minimum pulse
that fires Z: 6.93 min.

**(c)** Z switches **on at t = 6.93 min** and stays on while X persists; Y(30) = 100(1 − e⁻³) =
100(1 − 0.049787) = **95.02 units**, output window 30 − 6.93 = **23.07 min**. Z switches **off at
t = 30, instantly** — the AND needs X, and X is gone; Y is still at 95 and irrelevant.

**The asymmetry is the circuit.** Delay on ON, none on OFF: a **debounce**. Transients shorter
than 6.93 min are discarded, sustained signals get through, withdrawal is obeyed at once.

**(d)** Z(t) = 3000/(30 + Y(t)):

| t (min) | Y(t) | 30 + Y | Z(t) |
|---:|---:|---:|---:|
| 0 | 0 | 30 | **100.0** |
| 5 | 39.35 | 69.35 | **43.3** |
| 10 | 63.21 | 93.21 | **32.2** |
| 20 | 86.47 | 116.47 | **25.8** |
| ∞ | 100 | 130 | **23.1** |

(Working: e^(−0.5) = 0.60653, e^(−1) = 0.36788, e^(−2) = 0.13534; steady state 3000/130 = 23.08.)

Peak-to-steady = 100 / 23.08 = **4.33-fold**

Half-peak (Z = 50): 3000/(30 + Y) = 50 → Y = 30 → 100(1 − e^(−0.1t)) = 30 → e^(−0.1t) = 0.7 →
t = ln(1/0.7)/0.1 = **3.57 min**

Z peaks immediately and is half-gone within 3.6 minutes while X is still fully on. A **pulse**,
generated from a step.

**Trap.** Nothing about the *input* is transient — X is on throughout. The transience is
manufactured by the circuit, so observing a pulse of expression does not license concluding that
the signal was a pulse.

**(e)** The **C1-FFL with AND is a persistence detector** — "has X been on long enough to mean
something?" The **I1-FFL is a pulse generator**, plus an accelerated rise and, tuned
appropriately, **fold-change detection**: it responds to the ratio by which X changed rather
than its absolute level, answering "did something just change?" Many animal I1-FFLs use a
microRNA as the repressing arm
([Ch 24](../part-04-gene-regulation/24-rna-based-regulation.md)).

For an expensive irreversible response to a noisy input: **the coherent AND FFL**. Committing to
an irreversible fate on a 4-minute fluctuation is the exact failure the delay prevents, and a
pulse generator is wrong twice over — it fires on the transient, then shuts off regardless.

**(f) OR logic moves the delay to the OFF edge.** X alone satisfies the OR, so there is **no
ON-delay**; Z fires at t = 0. When X is withdrawn at t = 30, Y = 95.02 and sustains Z alone until
it decays below 50:

95.02 · e^(−0.1Δt) = 50 → e^(−0.1Δt) = 50/95.02 = 0.52620
→ −0.1Δt = ln(0.52620) = −0.64207 → Δt = **6.42 min**

Z persists **6.42 min after X disappears** — a persistence detector on the *loss* of signal, the
right design when interruption is expensive and restarting is slow.

Same three nodes, same edges, same signs; changing only the logic at the Z promoter inverts
which edge is filtered. The wiring diagram does not determine the computation — the wiring
diagram **plus the input function** does, which is why motif-counting tells you where to look,
not what you will find.

</details>

---

## Where you went wrong

| Error pattern | What to re-read |
|---|---|
| Said lactose is the inducer, or that glucose binds something | Problem 1(b) |
| Treated *lac* as a genuine digital AND gate | Problem 1(c) — off-states differ 150-fold |
| Asked which molecule a *trans* factor sits on | Problem 3(a) row 3 — it never matters |
| Assumed loss-of-function implies recessive | Problem 3(b) — dominance by multimerisation |
| Scored `Oᶜ` without checking which genes are downstream **of it** | Problems 4(b) and 5(c) |
| Read "*cis*-dominant" as Mendelian dominance | Problem 4(b) — `Oᶜ` never touches the other copy |
| Checked the operator before the promoter | Problem 5(b) — `P⁻` makes everything downstream moot |
| Called a whole cell "constitutive" | Problem 5(c) — one operon, one gene each way |
| Thought attenuation senses tryptophan | Problem 6(c) — no ribosome reads as "plenty" |
| Predicted loss of function from a boundary deletion | Problem 7(c) — it causes ectopic **gain** |
| Assigned a non-coding variant to the nearest gene | Problem 7(e) — ~644 candidates per TAD |
| Inferred a transient signal from a transient response | Problem 8(d) — the circuit makes the pulse |
| Read a motif's wiring and stopped there | Problem 8(f) — AND and OR give opposite filters |
