# 36 — Core molecular methods

> **Before this:** [Ch 01](../part-00-orientation/01-chemistry-and-cell-primer.md) · [Ch 02](../part-01-molecular-foundations/02-dna-structure.md) · [Ch 08](../part-01-molecular-foundations/08-proteins-and-gene-function.md) · **Time:** ~45 min

You will read papers whose methods sections assume this material. This chapter gives you the
*logic* of each technique — the problem it solves and the physical fact it exploits — not the
protocol. Protocols expire. The reason a method works does not.

## What you'll be able to do

- Explain why nucleic acids are far easier to measure than proteins, trace that asymmetry
  through every method in this chapter, and state the three hard limits it imposes on mass
  spectrometry
- Derive the amplification, plateau and Ct behaviour of PCR from first principles, and convert
  Ct values into fold changes and absolute copy numbers
- Say what a given gel, blot, array, or reporter assay can and cannot establish
- Explain why Gibson and Golden Gate assembly displaced restriction cloning, in terms of the
  constraint each removes
- Explain why Sanger sequencing survives on error *independence* rather than accuracy, and name
  the failure modes it catches and the ones it cannot see
- Predict the characteristic error *direction* of an antibody-based or interaction assay before
  reading its controls
- Choose an appropriate method for a stated question, and state the assumption it rests on

## The core idea

Two properties make DNA and RNA unreasonably easy to work with, and proteins have neither.

**A constant charge-to-mass ratio.** Every nucleotide contributes one negative phosphate and
roughly the same mass ([Ch 01 §3](../part-00-orientation/01-chemistry-and-cell-primer.md)). So
electrophoretic mobility in a sieving matrix is a function of *length alone*, independent of
sequence. One physical measurement, no per-molecule calibration, works for any DNA anyone has
ever handled.

**Programmable self-recognition.** A sequence binds its complement and nothing else. That means
you can address any target you like with a synthetic oligonucleotide — you specify the query as
a *string*, order it, and it arrives. Detection, amplification, and manipulation all reduce to
writing down a sequence.

Proteins have neither. Their charge depends on composition and pH; they have no complementary
partner you can synthesise; and there is no protein PCR. Every protein method therefore needs a
*bespoke physical reagent* — an antibody raised in an animal — or a mass spectrometer. That one
asymmetry explains why genomics scaled by six orders of magnitude and proteomics did not, and it
is the thread running through everything below.

---

## 1. Getting the molecules out

The problem: a cell is a crowded mixture, and you need one class of molecule, intact and free of
anything that inhibits enzymes downstream.

Break the cell open, denature and strip away protein, then exploit a chemical difference. The
dominant implementation binds nucleic acid to silica in high chaotropic salt (which strips the
water shell) and elutes it in low salt; magnetic-bead versions of the same chemistry are what
sits inside automated extractors. To get RNA rather than DNA, add DNase; the reverse needs RNase.

Three facts that propagate downstream:

- **RNA is chemically self-destructing** ([Ch 01](../part-00-orientation/01-chemistry-and-cell-primer.md)),
  and RNases are ubiquitous and heat-stable. RNA work is a contamination-control discipline.
- **Total RNA is ~80–90% ribosomal RNA.** Every transcriptome method must either deplete it or
  select the small polyadenylated fraction, and that choice biases what you can see
  ([Ch 47](../part-10-functional-genomics/47-rna-seq.md)).
- **DNA shears under ordinary handling.** Pipetting alone caps molecule length in the tens of
  kilobases. For long-read sequencing, the extraction protocol — not the sequencer — sets the
  read-length ceiling ([Ch 40](../part-09-genomics/40-sequencing-technologies.md)).

## 2. Electrophoresis: the free gift of constant charge

Apply a field; DNA (polyanionic) migrates toward the anode. In *free solution* it does not
separate at all: force scales with charge ∝ length, drag scales with length, so mobility is
length-independent. Separation requires a sieving matrix, in which longer molecules are retarded
more. Empirically, migration distance is approximately linear in −log(length) across the useful
range of any given matrix.

```
      wells  ┌───┬───┬───┬───┐
             │ L │ A │ B │ C │        L = ladder, known lengths
   10 kb ────│ ▄ │   │   │ ▄ │
    3 kb ────│ ▄ │ ▄ │   │   │        A: single 3 kb product — clean PCR
    1 kb ────│ ▄ │   │ ▄ │ ▄ │        B: 1 kb only — wrong product or wrong template
   500 bp────│ ▄ │   │   │   │        C: two bands — non-specific amplification
   100 bp────│ ▄ │   │ ▄ │ ▄ │  ← primer-dimer: short, amplifies efficiently
             └───┴───┴───┴───┘
                    ▼ field
```

| | Agarose | Polyacrylamide |
|---|---|---|
| Matrix | polysaccharide, large pores | cross-linked polymer, small tunable pores |
| Useful range | ~100 bp – 25 kb | ~5 – 500 bp |
| Resolution | a few percent of length | single base |
| Typical use | plasmid checks, PCR products, digests | oligo QC, footprinting, protein (SDS-PAGE) |

Two extensions worth knowing. Above roughly 20–50 kb, long molecules reptate end-on through the
pores and mobility becomes length-independent again; **pulsed-field electrophoresis** restores
separation by periodically switching field direction, forcing the molecule to reorient — a step
whose cost scales with length. And **capillary electrophoresis** is the same physics in a
polymer-filled capillary at single-base resolution: it is the readout of Sanger sequencing (§7)
and of fragment-length assays generally.

Contrast with protein. Protein charge depends on amino acid composition and pH, so raw
electrophoresis separates by an uninterpretable mixture of charge and shape. SDS-PAGE works by
coating the protein in the detergent SDS at a roughly fixed mass ratio, *manufacturing* a
constant charge-to-mass ratio. Protein methods spend effort recreating what DNA has for free.

## 3. PCR: exponential amplification of an addressed region

The problem: you hold one copy of a 500 bp locus embedded in 3.1 Gb of irrelevant sequence, and
you need ~10¹² copies of that locus and nothing else.

Two primers — short synthetic oligonucleotides complementary to the flanks, pointing inward —
plus a polymerase, plus thermal cycling:

```
95 °C  denature  ──►  strands separate
55–65 °C anneal  ──►  primers find their complements (and only those, if Tm is right)
72 °C  extend    ──►  polymerase copies from each primer's 3' end
                      repeat 25–40×
```

The enabling idea is **thermostability**: use a polymerase from a thermophile (canonically Taq,
from *Thermus aquaticus*) whose activity survives the 95 °C denaturation step instead of being
destroyed by it — Taq has a half-life of tens of minutes at 95 °C and extends at 72 °C.
Without it, every cycle destroys the enzyme and you must add fresh enzyme by hand. With it, the
process is a machine loop.

### Why the product has defined ends

Track single strands. Let `T` = original template strands (ends undefined), `M` = strands with a
primer-defined 5' end but a run-off 3' end, `S` = strands defined at both ends. Each cycle, every
strand present templates exactly one new strand: copying `T` yields `M`; copying `M` or `S` yields
`S`.

```
T_n = 2                      (constant)
M_n = M_{n-1} + 2            →  M_n = 2n
S_n = 2·S_{n-1} + M_{n-1}    →  S_n = 2^{n+1} − 2n − 2
```

Check n = 3: 2 + 6 + 8 = 16 = 2⁴ strands ✓. The first double-defined *strand* appears at cycle 2
(S₂ = 2), and the first duplex made of two of them — the amplicon you would see on a gel — at
cycle 3. By cycle 30 the undefined-end species are 62 strands out of 2³¹, i.e. a fraction of
3 × 10⁻⁸. The gel band is essentially pure `S`.

### Efficiency and the plateau

With per-cycle efficiency *E* (0 ≤ *E* ≤ 1), copies after *n* cycles are

```
N_n = N_0 (1 + E)^n
```

Perfect doubling is *E* = 1. Real reactions run 0.9–1.0 early, then **plateau**. Causes, roughly
in order of importance: at high product concentration the two product strands reanneal to each
other faster than primers can find them; primers and dNTPs deplete; polymerase accumulates
thermal damage.

The plateau has a consequence people repeatedly forget: **endpoint yield converges regardless of
starting amount.** A reaction seeded with 10 copies and one seeded with 10⁶ end up at similar
final concentration. Endpoint PCR is therefore a presence/absence assay, never a quantitative
one. Everything in §4 is a way around this.

### Primer design as a constraint problem

- **Length 18–25 nt.** Expected chance occurrences of a random *k*-mer in a diploid human genome
  ≈ 6.2 × 10⁹ / 4ᵏ. For *k* = 16 that is ≈ 1.4 — a 16-mer occurs by accident. For *k* = 20 it is
  ≈ 0.006. Specificity is a combinatorics problem, and 18–25 is where it is solved.
- **Matched melting temperatures.** Both primers anneal in the same tube at the same temperature,
  so their Tm values must agree within a degree or two. GC content dominates Tm (three hydrogen
  bonds versus two, plus stronger stacking).
- **Annealing temperature is the specificity knob.** Too low and mismatched primers anneal,
  giving spurious products; too high and nothing anneals. This is a precision/recall trade-off
  with a single continuous control.
- **The 3' end matters most.** Extension requires a base-paired 3'-OH; a mismatch there blocks
  the polymerase, while 5' mismatches are tolerated (which is how tags, barcodes and adapters
  get bolted onto primers). Deliberately placing a variant at the 3' end gives allele-specific
  PCR.
- **Avoid self-complementarity.** Primer-dimers are short, so they amplify with higher efficiency
  than the target and win the exponential race. Two exponentials with different rates have only
  one outcome.

## 4. Turning amplification into measurement

**RT-PCR** prepends reverse transcriptase, which copies RNA into cDNA. No *DNA-dependent* DNA
polymerase accepts an RNA template — reverse transcriptase is itself a DNA polymerase, just an
RNA-dependent one — so every amplification-based RNA method and most sequencing-based ones begin
with this step, RNA-seq included. The exceptions are the methods that read RNA directly: Northern
blotting and RNA-FISH (§6), and direct-RNA nanopore sequencing. Note the naming collision: RT-PCR
is reverse-transcription PCR; real-time PCR is qPCR. Papers use both.

### qPCR: measure during the exponential phase

Read fluorescence every cycle, and take the cycle at which signal crosses a fixed threshold — the
**quantification cycle**, Ct (or Cq). Two detection chemistries:

| | SYBR Green | TaqMan hydrolysis probe |
|---|---|---|
| Mechanism | dye fluoresces when intercalated in any double-stranded DNA | third oligo inside the amplicon carries a fluorophore quenched by FRET; polymerase's 5'→3' exonuclease destroys it during extension, releasing signal |
| Specificity | reports primer-dimers and off-target products too | requires a **third** independent sequence match |
| Cost / design | cheap, nothing to design | probe synthesis per target |
| Control needed | melt curve, to confirm one product | none of that kind |
| Multiplexing | no | yes — different dyes, different targets, one tube |

**Where Ct comes from.** Fluorescence is proportional to copies: *F_n* = *k N₀*(1+*E*)ⁿ. Setting
*F* = *F_T* at *n* = Ct and taking logs,

```
Ct = [ log(F_T / k) − log N_0 ] / log(1 + E)
```

Ct is **affine in log N₀**, with slope −1/log₁₀(1+*E*) per decade. That is the entire content of
the standard curve: run a dilution series of known concentration, regress Ct on log₁₀(copies),
and read efficiency off the slope *m*:

```
E = 10^(−1/m) − 1        perfect doubling ⇒ m = −1/log₁₀2 = −3.32
```

A slope of −3.32 is the canonical target; slopes far from it mean the assay is not doubling and
none of what follows is valid.

**Relative quantification (ΔΔCt).** Since *N₀* ∝ 2^(−Ct) when *E* = 1:

```
within a sample:   target/reference  = 2^−(Ct_target − Ct_ref)  = 2^−ΔCt
across samples:    fold change       = 2^−(ΔCt_treated − ΔCt_control) = 2^−ΔΔCt
```

The inner ratio cancels input amount and extraction efficiency; the outer ratio cancels anything
common to both genes. Two assumptions do all the work and both routinely fail: **equal efficiency**
for target and reference (relax it with the Pfaffl formula, which uses each assay's measured *E*),
and a **reference gene that genuinely does not change**. The second is the compositional-data
problem in miniature — you are measuring a ratio and calling it an abundance — and it returns at
full scale in [Ch 47](../part-10-functional-genomics/47-rna-seq.md).

### Digital PCR: absolute counting

qPCR is relative. Converting Ct to copies needs a standard curve, and the answer inherits the
standard's calibration error.

Digital PCR removes the calibration entirely. Partition the reaction into 10⁴–10⁷ droplets or
microwells so that most contain zero or one template molecule. Amplify to **endpoint** — the
plateau that ruined quantitative endpoint PCR is now a feature, because it drives every occupied
partition to the same saturated signal, so the readout is binary. Count positives.

Partitioning is Poisson with mean λ templates per partition, so with *n* partitions and *k*
positive:

```
P(empty) = e^−λ = (n − k)/n     ⇒   λ = −ln(1 − k/n)      copies = λn
```

The correction matters: at *k*/*n* = 0.21 the naive count undercounts by ~11%, because some
positives held two molecules. The estimate is **absolute** — its units are counted partitions and
a known partition volume, with no reference material. Precision is Poisson, Var(λ̂) = (e^λ − 1)/n,
so it improves as √n and beats qPCR decisively for small fold changes and low copy numbers:
rare-allele detection in circulating tumour DNA, copy-number calls, viral load, and library
quantification.

## 5. Cloning: cut, join, propagate

The problem: obtain unlimited identical copies of a *defined* construct, and get a cell to
express it.

**Restriction enzymes** are a bacterial immune system: they cleave incoming phage DNA at short
recognition sites, while the host methylates its own copies of those sites to spare them — self
versus non-self by covalent marking. The sites are palindromic *in the reverse-complement sense*,
because the enzyme is a homodimer and a two-fold symmetric protein binds a two-fold symmetric
site:

```
EcoRI, GAATTC                      SmaI, CCCGGG
5'-G     A A T T C-3'              5'-C C C   G G G-3'
3'-C T T A A     G-5'              3'-G G G   C C C-5'
   staggered cut → 5' overhangs       flush cut → blunt ends
   "sticky": AATT anneals to any      joins anything to anything;
   fragment cut with EcoRI            no directionality, lower efficiency
```

A 6-bp cutter cuts on average every 4⁶ = 4,096 bp, a 4-bp cutter every 256 bp — modulated by real
genome composition (NotI, `GCGGCCGC`, is rare in vertebrate DNA because CpG is depleted). Sticky
ends only hydrogen-bond; **DNA ligase** forms the phosphodiester bonds that make the join covalent.

**Vectors.** A plasmid is a small circular replicon with three mandatory parts: an **origin of
replication** so the host copies it (the origin also sets copy number), a **selectable marker**,
usually antibiotic resistance, and a **multiple cloning site**. Expression vectors add a promoter,
a ribosome binding site or Kozak sequence, and a terminator.

**Transformation** — chemical competence plus heat shock, or electroporation — succeeds in a tiny
fraction of cells. This is why the marker is *selection*, not screening: plate on antibiotic and
only transformants survive. **Blue-white screening** adds a second layer: the cloning site sits
inside *lacZ*α, so an empty vector complements the host's β-galactosidase, cleaves X-gal, and
gives a blue colony; an insert disrupts the reading frame and gives white. Note precisely what
that establishes — *something* was inserted. Not the right thing, not in the right orientation,
not free of PCR errors. You still sequence.

### Why modern assembly displaced it

Restriction cloning has a structural flaw: it requires recognition sites that are **absent from
the insert**, present in a usable arrangement in the vector, compatible in buffer and temperature,
and it leaves scars. Finding a workable enzyme pair is a constraint-satisfaction problem that
often has no solution, and it does not scale past two or three fragments.

Both replacements move specificity from a fixed enzyme alphabet to *arbitrary designed sequence*.

- **Gibson assembly.** Design 20–40 nt of overlap between adjacent fragments (into the PCR primers,
  so it costs nothing). One isothermal reaction contains an exonuclease that chews back one strand
  to expose those overlaps, a polymerase to fill the gaps, and a ligase to seal. Multiple fragments
  join in defined order, seamlessly, with no sequence constraint on the insert.
- **Golden Gate assembly.** Type IIS enzymes (BsaI, BsmBI and relatives) cut *outside* their
  recognition site at a fixed offset — so **you choose the overhang sequence**, and the cut removes
  the recognition site. Correct products are therefore no longer substrates, which lets cutting and
  ligation run simultaneously in one tube as a ratchet. Four-base overhangs act as orthogonal
  address codes; curated sets of twenty or more mutually non-cross-hybridising overhangs allow
  that many fragments to assemble in defined order in a single reaction. This is what makes
  modular, combinatorial library construction routine.

```mermaid
graph LR
    D["designed sequence"] --> S["synthesis or PCR<br/>with overlap/BsaI tails"]
    S --> A["one-pot assembly<br/><i>Gibson / Golden Gate</i>"]
    A --> T["transformation"]
    T --> SEL["antibiotic selection"]
    SEL --> V["colony screen<br/>+ full-plasmid sequencing"]
    V --> U["expression, editing,<br/>reporter, library"]
```

The third option is increasingly to skip assembly: synthetic DNA is now cheap enough that ordering
a gene-length fragment can cost less than the labour of building it.

## 6. Hybridisation: addressing a sequence with its complement

One idea, many instruments: a labelled nucleic acid probe finds its complement in a complex
mixture, and **stringency** — temperature, salt, formamide — sets how many mismatches you tolerate.
Raising stringency trades sensitivity for specificity along a continuous dial.

| Method | Target | Detected with | Question it answers |
|---|---|---|---|
| **Southern** | DNA | labelled complementary probe | is this sequence present, in what size fragment, in how many copies |
| **Northern** | RNA | labelled complementary probe | is this transcript present, at what size (isoforms are visible), how abundant |
| **Western** | protein | **antibody** — not a probe | is this protein present, at what apparent size, how abundant |
| **FISH** | DNA/RNA *in situ* | labelled probe, imaged | *where*, and how many copies, **per cell** |
| **Microarray** | DNA or RNA | millions of immobilised probes | how much of each of a *predefined* set of sequences |

**Western blotting is not hybridisation.** Ed Southern's surname gave the Southern blot its name;
Northern and Western are puns on it. The joke misleads a large fraction of students into believing
Westerns work by base pairing. They cannot — proteins do not base-pair. A Western works because
someone immunised an animal against your protein and purified the antibodies. That is the core
idea of this chapter made concrete: the DNA and RNA methods take a string as input, the protein
method takes a reagent that must be produced, validated, and re-produced.

**FISH** deserves separate emphasis because it answers a question sequencing answers badly. Bulk
sequencing averages over cells; FISH reports per nucleus. When the question is "what fraction of
cells carry this amplification" or "is this fusion present in a minor subclone", single-cell
spatial information is the point, and FISH remains standard clinical practice for exactly that.

**Microarrays invert the blot**: instead of one probe against a whole sample, immobilise millions
of known probes at known positions and wash the labelled sample over them. Each spot is one
hybridisation assay; the array runs them in parallel. Expression arrays lost to RNA-seq for a
reason that generalises — **a hybridisation assay can only measure what you designed onto it, and
its dynamic range is squeezed between background and saturation; a sequencing assay counts, and is
discovery-capable.** Genotyping arrays survive precisely because their query set is fixed *by
design*: a known panel of common SNPs, cheap per sample, which is what makes population-scale
association studies affordable ([Ch 51](../part-11-human-and-statistical-genomics/51-gwas.md)).

## 7. Sanger sequencing

Chain termination converts a sequence-reading problem into a length-separation problem — which,
by §2, is the one problem DNA hands you for free.

Run a single-primer extension containing normal dNTPs plus a small fraction (~1:100 to 1:1000) of
**dideoxynucleotides**, which lack the 3'-OH. Any ddNTP incorporated terminates that chain, because
the next phosphodiester bond has nothing to attach to. Across millions of molecules you obtain a
population of fragments terminating at *every* position, each carrying a fluorescent dye
identifying which base terminated it. Separate by capillary electrophoresis at single-base
resolution and read the colour order.

```
primer ──►  ...GATTACAG
            ──────────────────────────► fragment length
   A   ▁▁▁█▁▁▁▁▁▁█▁▁▁▁▁▁▁█▁
   C   ▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁█▁▁▁▁     read peak colours in length order
   G   █▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁█      → G A T T A C A G
   T   ▁▁▁▁▁▁█▁█▁▁▁▁▁▁▁▁▁▁▁
```

Usable read length is roughly 500–1,000 bases: the first tens of bases are lost to primer and dye
artefacts, and the far end fails when the relative length difference between consecutive fragments
falls below the resolving power of the capillary.

It survives in the era of massively parallel sequencing for a specific reason. Confirming a
variant is not about accuracy alone — it is about **error independence**. Sanger uses different
chemistry, a different sample path, and different analysis software, so it does not share the
systematic failure modes that matter most: mismapping in a paralogous region, index hopping between
samples, a sample swap. Universal Sanger confirmation of every next-generation call has been
retired in many laboratories in favour of confirmation triggered by quality metrics, but orthogonal
confirmation of reportable findings and of sample identity remains normal practice
([Ch 55](../part-11-human-and-statistical-genomics/55-clinical-variant-interpretation.md)). Know its
limits too: it reads a mixture as superimposed traces, so a heterozygous indel renders everything
downstream unreadable without deconvolution, and it cannot see mosaicism much below ~15–20%.

## 8. Antibodies, and what you can build from them

An antibody is a protein that binds one **epitope** — a small patch of surface — tightly. Raised
by immunisation, they come in two forms: **polyclonal** (a serum containing many binders to many
epitopes on the target; robust to epitope damage, variable between batches, finite in supply) and
**monoclonal** (one B-cell clone, one epitope; renewable and reproducible, but fails completely if
that epitope is masked or altered). Sequencing the clone and expressing it recombinantly gives the
reproducibility of a monoclonal with an inexhaustible supply.

A systemic caveat: a substantial fraction of commercial antibodies do not detect what the label
claims. Validation means a knockout or knockdown control showing the signal disappears — not a
band of the expected size.

**Immunoprecipitation** couples the antibody to a bead and pulls the target out of a lysate, along
with whatever is attached to it. Wash stringency is the control knob and it is a precision/recall
curve: harsh washes remove background and real partners together.

**ChIP** (chromatin immunoprecipitation) is the move that made the technique genomic. Crosslink
protein to DNA *in living cells* with formaldehyde, fragment the chromatin, immunoprecipitate the
protein of interest, reverse the crosslinks, and sequence the DNA that came along. The output is a
genome-wide map of where that protein was — the basis of
[Ch 49](../part-10-functional-genomics/49-epigenome-profiling.md). Two things to hold onto: the
essential controls are input chromatin and a non-specific antibody, and the result is a
**population average of a stochastic occupancy** ([Ch 01 §5](../part-00-orientation/01-chemistry-and-cell-primer.md))
— a "bound site" is one bound often enough, in enough cells, to survive the wash.

**Epitope tagging** sidesteps the reagent problem: engineer a short peptide tag (FLAG, HA, His)
onto the gene, and use one heavily validated anti-tag antibody for every target you will ever
study. This converts an unsolved biochemistry problem into a cloning problem — a move worth
recognising, because the field makes it repeatedly.

## 9. Reporters: making expression observable

Measuring expression usually destroys the sample. A reporter fuses the regulatory sequence you
care about to a gene whose product you can measure non-destructively.

| | Fluorescent protein (GFP and relatives) | Luciferase |
|---|---|---|
| Signal | intrinsic fluorescence, needs only oxygen | enzymatic light from an added substrate |
| Resolution | single cell, live, spatial, over time | population, usually endpoint after lysis |
| Sensitivity / range | moderate; cellular autofluorescence sets a floor | very high; near-zero background, wide dynamic range |
| Main artefact | slow maturation and high stability — poor at reporting *decreases*; the fusion may perturb the protein | needs substrate; kinetics vary with substrate access |

Beyond expression level, a fluorescent fusion reports **localisation** — where in the cell the
protein is — which no lysate-based method can.

What a classical reporter assay actually establishes is **sufficiency**: this isolated fragment,
on a plasmid, in this cell type, can drive expression. It does not establish **necessity** at the
endogenous locus, in native chromatin, at native copy number. That gap is the whole reason enhancer
validation moved to perturbing the native sequence
([Ch 38](../part-08-methods/38-genome-editing.md), [Ch 52](../part-11-human-and-statistical-genomics/52-association-to-mechanism.md)).
The scaled version of the sufficiency assay is the **massively parallel reporter assay**: give each
candidate element a unique barcode inside the transcript, transfect the whole library at once, and
read expression by sequencing barcodes in RNA versus DNA — a one-at-a-time assay converted into a
counting problem over 10⁵ elements. Normalisation by input DNA counts is the same ratio logic as
dual-luciferase and as ΔΔCt.

## 10. Protein–protein interactions, and their error directions

**Yeast two-hybrid** splits a transcription factor into its DNA-binding domain and its activation
domain. Fuse "bait" to one and "prey" to the other. If bait and prey interact, they reconstitute a
functional activator and switch on a reporter gene, which the yeast reads out as growth or colour.
Because the whole assay is genetically encoded, it scales to library-against-library screens.

**Co-immunoprecipitation** pulls down endogenous protein A and blots (or mass-spectrometers) for B.

Each method fails in a characteristic direction, and knowing the direction is more useful than
knowing the protocol:

| Method | Over-reports | Under-reports |
|---|---|---|
| Y2H | pairs forced into the same compartment at high concentration that never co-occur *in vivo*; self-activating and sticky baits | interactions needing post-translational modification absent in yeast; membrane proteins; anything the fusion misfolds |
| Co-IP | abundant sticky proteins; complexes that form *after* lysis destroys compartmentalisation | transient or low-affinity interactions that do not survive washing |
| Proximity labelling (an enzyme fused to the bait tags neighbours within nanometres, in living cells) | neighbourhoods rather than binding partners | genuinely binding partners with no accessible tagging residues |

Interaction networks are unions of assays with these biases. Any topological statistic computed on
an interactome — degree distribution, hub identity, modularity — inherits them, which is worth
remembering before drawing conclusions from network structure
([Ch 25](../part-04-gene-regulation/25-networks-and-development.md)).

## 11. Mass spectrometry: the discovery-capable protein assay

Antibodies can only find proteins you already suspect. Mass spectrometry is the way to identify and
quantify proteins without a per-target reagent. The measurement is simple — mass-to-charge ratio,
*m/z* — and everything else is inference.

**Bottom-up logic.** Whole proteins are too large to measure informatively, so digest with a
sequence-specific protease. Trypsin cleaves after lysine and arginine — a restriction enzyme for
proteins — yielding peptides of tractable length that carry a basic residue at the C-terminus and
therefore ionise well. Separate peptides by liquid chromatography, ionise by electrospray, measure
*m/z* (MS1), select a peptide, fragment it by collision, and measure the fragments (MS2). Adjacent
fragments in the resulting ladder differ by the mass of one amino acid.

**Identification is a database search, not reading.** You compute theoretical fragment spectra for
every peptide in an *in silico* digest of the proteome — which means mass spectrometry is
downstream of genome annotation ([Ch 44](../part-09-genomics/44-annotation.md)) and blind to
anything not annotated. Observed spectra are scored against theoretical ones, and false discovery
is controlled by **target–decoy** search: search a reversed or shuffled database alongside the real
one and count decoy hits above threshold as a direct empirical estimate of the false-positive
count. It is an empirical null, and it is what makes proteomics FDR statements meaningful.

**Acquisition strategy** determines the missing-data structure of your matrix:

- **DDA** fragments the top-*N* most intense MS1 peaks each cycle. Abundance-biased and
  stochastic: which low-abundance peptides get fragmented differs run to run, producing missingness
  that is emphatically *not* at random.
- **DIA** fragments everything within fixed *m/z* windows and deconvolutes computationally. Harder
  spectra, far more reproducible quantification across runs.

**Quantification** is either label-free (peak intensity or spectral counts, requiring careful
normalisation and inheriting the compositional problem) or isobaric labelling, where samples are
tagged with chemically identical, equal-mass labels whose *fragments* differ, mixed, and run once —
eliminating run-to-run variance at the cost of ratio compression when contaminating peptides are
co-isolated.

Three hard limits explain why the proteome is not "solved" the way the genome is. Abundance
dynamic range spans ten or more orders of magnitude in plasma while a single run covers perhaps
four to five, so abundant proteins mask everything else. Peptides are not uniquely assignable to
proteins, giving a **protein inference** problem structurally identical to multi-mapping reads in
RNA-seq. And modifications are substoichiometric, requiring dedicated enrichment. Underneath all
three sits the fact from the top of this chapter: **there is no amplification step for protein.**
Nucleic acids can be copied; proteins must be detected as they are.

## 12. Question → method

| Question | Method | The assumption it rests on |
|---|---|---|
| Is this DNA fragment the expected length? | Agarose gel | Length is the only thing mobility reflects |
| Is this specific sequence present, and at what copy number? | qPCR, or dPCR for absolute counts | Primers are specific; efficiency is known |
| How many copies exactly, in a rare-variant background? | Digital PCR | Partitions are independent and Poisson-distributed |
| Has expression of gene *X* changed between conditions? | RT-qPCR with ΔΔCt | Reference gene is genuinely invariant; efficiencies match |
| What is the sequence of this one amplicon? | Sanger | Sample is clonal or a resolvable diploid |
| Is this variant real, or a mapping artefact? | Orthogonal confirmation (Sanger or a second chemistry) | The two methods fail independently |
| Which cells carry this rearrangement, and how many? | FISH | Probe specificity; adequate cell counts |
| Genotype a known panel across 500,000 people | Genotyping array | Everything you need is on the array |
| Where in the genome does protein P bind? | ChIP + sequencing | Antibody is specific; crosslinking is unbiased |
| Is this protein present, and at what size? | Western blot | The antibody detects what the label says |
| Which proteins are present, without a prior list? | LC-MS/MS | Peptides are in the searched database and above the noise |
| Does this regulatory element drive expression? | Reporter assay | Sufficiency on a plasmid implies relevance |
| Do proteins A and B interact? | Y2H to generate, co-IP or proximity labelling to test | Each assay's error direction is understood |
| Build a defined multi-part construct | Gibson / Golden Gate | Overlaps or overhangs are orthogonal; sequence-verify anyway |

---

## Common misconceptions

| What people think | What's actually true |
|---|---|
| Western blotting works by hybridisation, like Southern and Northern | It works by antibody binding. Proteins do not base-pair. The name is a pun on Ed Southern's surname, and it misleads more students than any other naming accident in biology |
| How much PCR product you get tells you how much you started with | Only during the exponential phase. Reactions plateau to similar endpoint yields regardless of input, which is exactly why qPCR measures a *cycle*, not a *quantity* |
| qPCR gives absolute quantities | It gives relative ones, unless calibrated against a standard curve whose accuracy it then inherits. Digital PCR is the absolute method, and it gets there by counting partitions rather than calibrating |
| Restriction sites are palindromes the way "racecar" is | They read identically on the *reverse complement*, not backwards along one strand. The symmetry exists because the enzyme is a homodimer |
| A band of the right size confirms you have the right molecule | It confirms a length. Identity requires a sequence-specific probe, a diagnostic digest, or sequencing. Correctly sized wrong products are common |
| Sanger sequencing is obsolete | Its value is error *independence*, not accuracy. It fails differently from massively parallel sequencing, which is precisely what orthogonal confirmation requires |
| A yeast two-hybrid hit means the two proteins interact in a cell | It means they can interact when both are forced into a yeast nucleus at high concentration. They may live in different compartments, cell types, or decades of developmental time |
| More cycles means more sensitivity | Past plateau, no. And at very low input, stochastic sampling in early cycles produces allele dropout and jackpot effects — the answer becomes noisy, not merely small |
| A GFP fusion faithfully reports protein level | Fluorescent proteins mature slowly and degrade slowly, so they track increases poorly and decreases very poorly, and the fusion itself can perturb folding, localisation and turnover |
| An antibody sold as "anti-X" detects X | A substantial fraction do not. The only real validation is loss of signal in a knockout or knockdown |

## Worked example: quantifying one gene three ways

A treatment is claimed to induce gene *TGT1*. You measure it by RT-qPCR against reference gene
*ACTB*, and confirm by digital PCR.

**Step 1 — validate the assay with a standard curve.** A tenfold dilution series of a plasmid
standard, 10⁶ down to 10² copies, gives Ct = 16.20, 19.55, 22.87, 26.19, 29.53.

```
slope m = (29.53 − 16.20) / (2 − 6) = 13.33 / (−4) = −3.333
E = 10^(−1/m) − 1 = 10^(1/3.333) − 1 = 10^0.3000 − 1 = 1.995 − 1 = 0.995
```

Efficiency 99.5%, slope essentially the ideal −3.32. The *E* = 1 assumption behind ΔΔCt is
justified for this assay — and this step is not optional, because ΔΔCt without it is a number with
no defined meaning.

**Step 2 — relative quantification.**

```
control:  Ct(TGT1) = 24.60,  Ct(ACTB) = 20.10   →  ΔCt = 24.60 − 20.10 = 4.50
treated:  Ct(TGT1) = 22.15,  Ct(ACTB) = 20.05   →  ΔCt = 22.15 − 20.05 = 2.10

ΔΔCt = 2.10 − 4.50 = −2.40
fold change = 2^(−ΔΔCt) = 2^2.40 = 5.28
```

*TGT1* is up ~5.3-fold. Note that *ACTB* moved 0.05 cycles between conditions — reassuring, though
it demonstrates only stability of *ACTB*, not that it is unaffected by the treatment.

**Step 3 — absolute confirmation by digital PCR.** The treated cDNA is partitioned into
*n* = 20,000 droplets of 0.85 nL each; *k* = 4,200 are positive at endpoint.

```
k/n = 0.2100
λ   = −ln(1 − 0.2100) = −ln(0.7900) = 0.2357 templates per partition
copies in reaction = λn = 0.2357 × 20,000 = 4,714
```

The naive count of 4,200 would understate by (4714 − 4200)/4714 ≈ 11%, because ~476 positive
partitions — *n*[1 − e^−λ(1 + λ)] — held more than one molecule, accounting for the 514 templates
the raw count never sees. Analysed volume = 20,000 × 0.85 nL = 17 µL, so the concentration is
4,714 / 17 ≈ **277 copies µL⁻¹** — absolute, with no standard curve anywhere in the derivation.

**Step 4 — why bother, when qPCR already gave an answer.** Compare precision.

```
dPCR:  Var(λ̂) = (e^λ − 1)/n = (1.2658 − 1)/20,000 = 1.329 × 10⁻⁵
       SD(λ̂) = 0.00365   →   CV = 0.00365 / 0.2357 = 1.5%

qPCR:  typical technical SD ≈ 0.15 cycles
       CV in copy number = 2^0.15 − 1 = 11.0%
```

A 5.3-fold change is far outside qPCR's noise, so here the two agree and qPCR was sufficient. But
had the claimed effect been 1.3-fold — the size of most real regulatory changes — an 11% CV would
have made it unresolvable, while a 1.5% CV would not. **The method you need is set by the effect
size you are chasing, not by the biology of the gene.**

## Connections

- **Back to:** [Ch 01](../part-00-orientation/01-chemistry-and-cell-primer.md) — the polyanionic
  backbone that makes electrophoresis work, and the stochastic view that makes "bound" a
  probability; [Ch 02](../part-01-molecular-foundations/02-dna-structure.md) — base pairing, the
  physical basis of every hybridisation and primer;
  [Ch 04](../part-01-molecular-foundations/04-dna-replication.md) — polymerases need a primed
  3'-OH, which is why ddNTPs terminate;
  [Ch 08](../part-01-molecular-foundations/08-proteins-and-gene-function.md) — why proteins have no
  synthesisable complement;
  [Ch 20A](../part-03-genome-instability/20A-bacterial-and-phage-genetics.md) — where the
  hardware came from before it was hardware: plasmids as replicons with copy number and
  incompatibility, natural competence as the basis of transformation, selectable markers, and
  λ as a vector. Nearly every reagent in this chapter is a domesticated piece of bacterial or
  phage biology
- **Forward to:** [Ch 37](37-model-organisms-and-screens.md) and
  [Ch 38](38-genome-editing.md) compose these primitives into screens and edits;
  [Ch 40](../part-09-genomics/40-sequencing-technologies.md) is chain termination made massively
  parallel; [Ch 47](../part-10-functional-genomics/47-rna-seq.md) generalises RT-qPCR to every
  transcript and inherits its normalisation problem;
  [Ch 49](../part-10-functional-genomics/49-epigenome-profiling.md) is ChIP at genome scale;
  [Ch 51](../part-11-human-and-statistical-genomics/51-gwas.md) runs on genotyping arrays;
  [Ch 55](../part-11-human-and-statistical-genomics/55-clinical-variant-interpretation.md) is where
  orthogonal confirmation earns its keep

## Check yourself

**1. DNA does not separate by length in free solution, yet a gel separates it beautifully. Why — and what does SDS-PAGE have to add to make the same trick work for proteins?**

<details><summary>Answer</summary>

In free solution, driving force scales with charge (∝ length) and viscous drag scales with size
(∝ length), so mobility is length-independent. A sieving matrix breaks the cancellation: longer
molecules are retarded more by having to thread through pores, so mobility becomes a decreasing
function of length. Migration then reads out length alone, because DNA's charge-to-mass ratio is
constant regardless of sequence.

Proteins have no such constant ratio — net charge depends on amino acid composition and pH — so
raw electrophoresis mixes charge, shape and size. SDS coats the unfolded protein at a roughly
fixed mass ratio, imposing a uniform negative charge density and a uniform rod-like shape. It
manufactures the property DNA possesses for free, which is exactly why the protein version needed
inventing and the DNA version did not.

</details>

**2. Endpoint PCR is not quantitative, but digital PCR runs to endpoint and is the most quantitative method in the chapter. Resolve the contradiction.**

<details><summary>Answer</summary>

Endpoint yield is uninformative because the plateau is set by reagent depletion and product
reannealing, not by input: reactions seeded with 10 or 10⁶ copies converge on similar final
concentrations. The information about *N₀* lives in the exponential phase, which is why qPCR
measures a threshold *cycle*.

Digital PCR does not measure yield at all. It partitions the sample so each partition holds zero
or one template, then uses the plateau to force every occupied partition to the same saturated
signal — turning an analogue quantity into a binary call. The measurement is the **count of
positive partitions**, and the plateau's input-independence is what makes the binary call clean.
Poisson inversion, λ = −ln(1 − k/n), recovers copies including partitions that held more than one.

</details>

**3. Why is a qPCR standard-curve slope of −3.32 the target, and what does a slope of −3.9 tell you?**

<accept />
<details><summary>Answer</summary>

From *F_n* = *kN₀*(1+*E*)ⁿ, Ct = [log(*F_T*/*k*) − log *N₀*]/log(1+*E*), so Ct is linear in
log₁₀*N₀* with slope −1/log₁₀(1+*E*). Perfect doubling (*E* = 1) gives −1/log₁₀2 = −3.32 cycles per
tenfold dilution: ten-fold more input is 3.32 doublings' head start.

A slope of −3.9 inverts to *E* = 10^(1/3.9) − 1 = 0.80, i.e. 80% efficiency — the reaction is not
doubling. That matters beyond calibration: the ΔΔCt formula assumes *E* = 1 for both target and
reference, and comparing an 80%-efficient target against a 100%-efficient reference produces a
fold change that is systematically wrong and grows worse with ΔCt. Either fix the assay or use an
efficiency-corrected formula.

</details>

**4. Why are PCR primers 18–25 nucleotides long rather than 12 or 40?**

<details><summary>Answer</summary>

It is a combinatorics problem. A random *k*-mer is expected to occur about 6.2 × 10⁹/4ᵏ times in a
diploid human genome. For *k* = 12 that is ~370 chance occurrences; for *k* = 16, ~1.4; for
*k* = 20, ~0.006. Below roughly 18 nt you cannot expect a unique binding site, and the reaction
amplifies everything.

The upper bound is practical rather than informational: longer primers have higher melting
temperatures (pushing annealing towards extension temperature and losing the specificity knob),
cost more, are more likely to form stable secondary structures with themselves, and — crucially —
become more tolerant of internal mismatches, since a single mismatch in a 40-mer barely dents its
stability. Specificity comes from being *just* long enough to be unique.

</details>

**5. A yeast two-hybrid screen reports an interaction between a nuclear transcription factor and a mitochondrial matrix enzyme. Is this a false positive, and how would you find out?**

<details><summary>Answer</summary>

Probably, and the reason is structural rather than statistical. Y2H forces both proteins into the
yeast nucleus, at high concentration, stripped of their normal targeting sequences and of the
compartment boundaries that keep them apart. Two proteins that never occupy the same cubic
micrometre in a real cell are given every opportunity to touch. Y2H's characteristic error is
exactly this: reporting pairs that *can* bind rather than pairs that *do* co-occur.

It is not automatically wrong — some proteins are genuinely dual-localised, and mitochondrial
proteins with moonlighting nuclear roles exist. To find out: check localisation in the relevant
cell type (fluorescent fusion or immunofluorescence), and test the interaction by a method with a
different error direction — co-IP of the endogenous proteins, or proximity labelling in living
cells, which reports only neighbours that actually share a compartment. Agreement across assays
with independent failure modes is the whole basis for believing an interaction, which is the same
error-independence argument that keeps Sanger confirmation alive in §7.

</details>
