# Problem set 01 — Molecular foundations

Covers [Ch 02–08](../part-01-molecular-foundations/02-dna-structure.md).

**Attempt each problem before opening the solution.** Reading a worked solution produces a
strong and completely false sense of understanding. If you are stuck, re-read the chapter's
worked example rather than revealing the answer.

Problems are roughly in order of difficulty. ★ marks ones worth returning to.

---

## 1. Strands and direction

You are given the sequence `5'-ATGCGTACGGATTAGCC-3'`.

**(a)** Write its complementary strand, correctly labelled with 5′ and 3′ ends.
**(b)** Write the reverse complement in the conventional 5′→3′ orientation.
**(c)** Compute the GC content.
**(d)** A colleague sends you this sequence in a file with no strand annotation and asks which
strand of the chromosome it came from. What do you tell them?

<details><summary>Solution</summary>

**(a)** Pair each base and note the strands are antiparallel:

```
5'- A T G C G T A C G G A T T A G C C -3'
3'- T A C G C A T G C C T A A T C G G -5'
```

**(b)** Reverse the complement so it reads 5′→3′: `5'-GGCTAATCCGTACGCAT-3'`

A useful check: the reverse complement of the reverse complement returns the original.

**(c)** Count G and C: positions 3, 4, 5, 8, 9, 10, 15, 16, 17 — nine of seventeen.

GC = 9/17 = **52.9%**

**(d)** You cannot tell, and neither can they. A double-stranded DNA molecule has two strands,
and either can be written down; "the sequence" is meaningless without a reference coordinate
and a strand. This is exactly why FASTA of a genomic region is ambiguous unless you know the
assembly and orientation, and why annotation formats such as GFF carry an explicit strand
column ([Ch 41](../part-09-genomics/41-data-formats.md)).

The deeper point: strandedness is a property of the *annotation*, not of the molecule.

</details>

---

## 2. Melting behaviour

Two DNA duplexes of identical length, 60 bp:

- Duplex **A**: 30% GC
- Duplex **B**: 70% GC

**(a)** Which has the higher melting temperature, and why?
**(b)** Give *two* distinct physical reasons, not one.
**(c)** You need to design PCR primers for a GC-rich promoter region. What problem does this
create and how would you address it?

<details><summary>Solution</summary>

**(a)** Duplex B, the GC-rich one.

**(b)** Two reasons, and most students give only the first:

1. **Hydrogen bonding.** G–C pairs form three hydrogen bonds, A–T only two, so more energy is
   needed to separate the strands.
2. **Base stacking.** GC-containing steps have more favourable stacking interactions than
   AT-containing ones. This contributes *more* to duplex stability than the hydrogen-bond
   difference does — a point [Ch 02](../part-01-molecular-foundations/02-dna-structure.md)
   makes and which is routinely omitted.

The common answer "because G–C has three hydrogen bonds" is correct but incomplete, and it
propagates the misconception that pairing dominates stability. It doesn't; stacking does.

**(c)** GC-rich templates resist denaturation, so the strands do not separate cleanly at
standard cycling temperatures, and they also form stable secondary structures (hairpins,
G-quadruplexes) that block polymerase progression. Practical responses: raise the denaturation
temperature, add a co-solvent such as DMSO or betaine to destabilise secondary structure, use
a polymerase and buffer formulated for GC-rich templates, and design primers to avoid
self-complementarity. This is also why GC-extreme regions are systematically under-covered in
sequencing libraries that involve amplification ([Ch 40](../part-09-genomics/40-sequencing-technologies.md)).

</details>

---

## 3. Replication arithmetic ★

The human genome is approximately 3.1 × 10⁹ bp per haploid set. Human replication forks move
at roughly 2 kb per minute, and S phase lasts about 8 hours.

**(a)** If replication proceeded from a single bidirectional origin, how long would copying one
copy of the genome take?
**(b)** Given that S phase is ~8 hours, estimate the minimum number of origins required.
**(c)** Explain why the actual number of origins used is far larger than your estimate.

<details><summary>Solution</summary>

**(a)** A single bidirectional origin has two forks moving in opposite directions, so together
they cover 2 × 2 kb = 4 kb per minute.

Time = 3.1 × 10⁹ bp ÷ 4 × 10³ bp/min = 7.75 × 10⁵ minutes

= 7.75 × 10⁵ ÷ 60 ≈ **12,900 hours ≈ 538 days**

Roughly a year and a half to copy one genome. This is the calculation that makes the necessity
of multiple origins vivid.

**(b)** With 8 hours = 480 minutes available, each bidirectional origin can cover:

480 min × 4 kb/min = 1,920 kb ≈ 1.92 Mb

Minimum origins = 3.1 × 10⁹ ÷ 1.92 × 10⁶ ≈ **1,615 origins**

**(c)** Several reasons, and they compound:

- **Origins are not evenly spaced or uniformly efficient.** Licensing is stochastic; a given
  licensed origin fires in only a fraction of cell cycles. To guarantee coverage everywhere,
  the cell must license far more origins than the minimum.
- **Forks stall and collapse.** Replication runs into damage, transcription complexes, and
  hard-to-replicate structures. Dormant origins provide backup — if a fork dies, a nearby
  origin can fire and rescue the region. A system with exactly the minimum number of origins
  would fail whenever any fork failed.
- **Timing is programmed.** Replication is not uniform in time; euchromatin replicates early
  and heterochromatin late, which requires more origins than a uniform schedule would.

Estimates for licensed origins in a human cell run to tens of thousands, with a smaller
subset firing in any given cycle. The redundancy is the point: this is a system engineered for
robustness against fork failure, not for minimal resource use.

</details>

---

## 4. Okazaki fragments

Consider a single replication bubble with two bidirectional forks that together replicate
120 kb of DNA. Human Okazaki fragments are roughly 150 nucleotides.

**(a)** How much of the 120 kb is synthesised discontinuously?
**(b)** Approximately how many Okazaki fragments are produced?
**(c)** How many ligation events are needed?

<details><summary>Solution</summary>

**(a)** At each fork one strand is leading and one is lagging. Both parental strands are
copied, so across the whole bubble exactly **half** the newly synthesised DNA is made
discontinuously: **60 kb**.

The symmetry is worth pausing on. It is a direct consequence of antiparallel strands plus a
polymerase that only works 5′→3′; there is no way to arrange it otherwise.

**(b)** 60,000 nt ÷ 150 nt per fragment = **400 Okazaki fragments**

**(c)** Each fragment must be joined to the one behind it. For 400 fragments in a bubble, the
number of joins is 400 minus the number of fragment runs that terminate at a bubble end. With
two lagging strands (one per fork), you have two runs of ~200 fragments each, needing ~199
joins apiece, so **approximately 398 ligation events** — and in practice the final fragments
are joined to the neighbouring replicon rather than left free.

The order-of-magnitude answer, ~400, is the one that matters. The point of the calculation is
that lagging-strand synthesis imposes an enormous number of priming, primer-removal, gap-fill
and ligation events, every one of which is an opportunity for error — which is why the lagging
strand carries a slightly different mutational signature from the leading strand.

</details>

---

## 5. Fidelity as a product ★

DNA replication fidelity is achieved by three mechanisms acting in series:

| Mechanism | Error rate after this step |
|---|---|
| Polymerase base selection | ~1 in 10⁵ |
| 3′→5′ proofreading exonuclease | ~1 in 10⁷ |
| Mismatch repair | ~1 in 10¹⁰ |

**(a)** By what factor does each successive mechanism improve fidelity?
**(b)** How many replication errors would you expect per diploid genome (6.2 × 10⁹ bp) copied?
**(c)** A tumour has lost mismatch repair function. Estimate the resulting error rate per
genome replication, and name the diagnostic signature this produces.
**(d)** ★ The germline mutation rate is ~1.2 × 10⁻⁸ per bp per generation. Why is it *not* a
contradiction that this is a hundred times worse than the per-replication fidelity above?

<details><summary>Solution</summary>

**(a)** Roughly **100-fold** from proofreading and **1,000-fold** from mismatch repair:

- Base selection alone: 10⁻⁵
- Proofreading: 10⁻⁵ → 10⁻⁷, a 10²-fold improvement
- Mismatch repair: 10⁻⁷ → 10⁻¹⁰, a further 10³-fold

No individual mechanism is remotely accurate. The final fidelity is the *product* of three
mediocre filters — the general shape of every fidelity number in biology
([Ch 01 §5](../part-00-orientation/01-chemistry-and-cell-primer.md)).

**(b)** 6.2 × 10⁹ bp × 10⁻¹⁰ errors/bp = **~0.6 errors per diploid genome replication**

Fewer than one substitution per complete duplication of the genome. Worth pausing on: copying
6.2 billion characters and expecting to get all but roughly half of one right.

**(c)** Losing mismatch repair removes the last 1,000-fold filter, so the error rate returns to
approximately **10⁻⁷ per bp**:

6.2 × 10⁹ × 10⁻⁷ = **~620 errors per genome replication**

A thousandfold increase, compounding at every division — a **hypermutator** phenotype.

**(d)** Because they are **different units measuring different things**, and this is the most
common unit error in the whole subject.

- 10⁻¹⁰ is per base **per replication** — one cell division.
- 1.2 × 10⁻⁸ is per base **per generation** — the whole path from zygote to gamete.

A generation is not one replication. The male germline undergoes a few hundred divisions
between zygote and sperm, so replication errors alone accumulate to roughly
10⁻¹⁰ × 300 ≈ 3 × 10⁻⁸ per generation — the same order as the measured rate.

Note the direction of the disagreement: the estimate **overshoots** the measurement by a factor
of two or three. That is the expected failure mode, because 10⁻¹⁰ is an order-of-magnitude
bound rather than a measured constant. And pushing the other way, a substantial share of
germline mutation is not replicative at all — it comes from unrepaired chemical damage such as
deamination and depurination ([Ch 16](../part-03-genome-instability/16-mutation.md)), which no
amount of polymerase fidelity would prevent.

Agreement within a small factor is all this calculation is entitled to claim. Quoting the two
numbers as though they were comparable is not.

The diagnostic signature is **microsatellite instability**. Mismatch repair is what corrects
the strand-slippage errors that polymerase makes at short tandem repeats, so without it,
microsatellite tract lengths become unstable and vary between cells. MSI is used clinically to
identify Lynch syndrome and, importantly, as a biomarker predicting response to immune
checkpoint inhibitors — because a hypermutated tumour generates many neoantigens
([Ch 56](../part-11-human-and-statistical-genomics/56-cancer-genomics.md)).

</details>

---

## 6. Transcription and strand conventions

A gene is annotated on the **reverse strand**. The forward-strand genomic sequence across the
first part of its coding region reads:

```
5'-...GGCATCGATTACGCAT...-3'   (forward strand, GRCh38)
```

**(a)** Which strand serves as the template for transcription?
**(b)** Write the mRNA sequence produced from this region.
**(c)** Explain why the mRNA sequence matches one genomic strand exactly, apart from one
substitution.

<details><summary>Solution</summary>

**(a)** The gene is on the reverse strand, meaning the reverse strand is the **coding (sense)
strand** — the one whose sequence matches the mRNA. Therefore the **forward strand shown here
is the template**, and RNA polymerase reads it 3′→5′.

This is the single most confusing naming convention in molecular biology, so state it
carefully: the *template* strand is the one read by polymerase; the *coding* strand is the one
whose sequence the mRNA reproduces. They are the two strands of the same duplex.

**(b)** The mRNA is the reverse complement of the shown forward-strand sequence, with U
replacing T.

Forward strand (template): `5'-GGCATCGATTACGCAT-3'`

Reverse complement: `5'-ATGCGTAATCGATGCC-3'`

As RNA: **`5'-AUGCGUAAUCGAUGCC-3'`**

Note it begins with AUG, which is consistent with this being the start of a coding region.

**(c)** Because the mRNA is synthesised by complementary base pairing against the template
strand, and the coding strand is *also* complementary to the template strand. Two sequences
complementary to the same third sequence are identical to each other. The only difference is
chemical: RNA uses uracil where DNA uses thymine.

This is why a genome browser can display "the sequence" of a gene without ambiguity once
strand is specified — and why forgetting the strand produces a reverse-complemented,
biologically meaningless answer.

</details>

---

## 7. Reading frames

Given the mRNA: `5'-AAAUGCCCGGGUAAUGCUAA-3'`

**(a)** Identify all three reading frames and translate each until a stop codon.
**(b)** Which frame is most likely the biologically used one, and why?
**(c)** What is the peptide product?

<details><summary>Solution</summary>

**(a)** Write the sequence and split it three ways:

```
seq:      A A A U G C C C G G G U A A U G C U A A

frame 1:  AAA UGC CCG GGU AAU GCU AA
          Lys Cys Pro Gly Asn Ala ...        (no stop reached)

frame 2:  AAU GCC CGG GUA AUG CUA A
          Asn Ala Arg Val Met Leu ...        (no stop reached)

frame 3:  AUG CCC GGG UAA UGC UAA
          Met Pro Gly STOP                   (stop at position 10-12)
```

**(b)** **Frame 3.** It is the only frame that begins with an AUG start codon and terminates at
an in-frame stop codon — a complete open reading frame. Frames 1 and 2 simply run off the end
of the fragment without either feature.

Translation initiates at an AUG, and in eukaryotes the ribosome scans from the 5′ cap to find
the first suitable one ([Ch 07](../part-01-molecular-foundations/07-genetic-code-and-translation.md)).
The AUG here is at position 3.

**(c)** **Met–Pro–Gly**, then termination at UAA.

A tripeptide, which is biologically implausible as a real protein — but the exercise is about
frame identification, and the notable feature is the second AUG downstream of the stop. This
illustrates why naive ORF-finding is nearly useless in eukaryotic genomic DNA: there are AUGs
and stops everywhere by chance, and distinguishing a real coding sequence requires splice
signals, codon-usage statistics, and ideally direct transcript evidence
([Ch 44](../part-09-genomics/44-annotation.md)).

</details>

---

## 8. Mutation consequences

The wild-type coding sequence begins: `5'-AUG GCA UUU CGA GGU UCA UAA-3'`

For each mutation, give the consequence and its classification.

**(a)** The 6th base A → G
**(b)** The 7th base U → A
**(c)** The 10th base C → U
**(d)** Deletion of the 8th base
**(e)** ★ The 9th base U → C

<details><summary>Solution</summary>

Wild-type, numbered:

```
pos:   1 2 3   4 5 6   7 8 9   10 11 12   13 14 15   16 17 18   19 20 21
       A U G   G C A   U U U   C  G  A    G  G  U    U  C  A    U  A  A
       Met     Ala     Phe     Arg        Gly        Ser        STOP
```

**(a)** Position 6, A→G: codon 2 `GCA` → `GCG`. Both encode **Ala**.
**Synonymous (silent) at the protein level.** But note the caveat: synonymous is not
necessarily consequence-free. It can alter codon usage and translation rate, mRNA secondary
structure, or splicing regulatory elements. Deep-intronic and synonymous variants disrupting
splicing are a genuinely under-recognised disease class
([Ch 06](../part-01-molecular-foundations/06-rna-processing.md)).

**(b)** Position 7, U→A: codon 3 `UUU` → `AUU`. Phe → **Ile**.
**Missense.** Both are hydrophobic residues of broadly similar character, so this is a
relatively **conservative** substitution — less likely to be damaging than a change altering
charge or size dramatically, though this depends entirely on structural context.

**(c)** Position 10, C→U: codon 4 `CGA` → `UGA`. Arg → **STOP**.
**Nonsense.** The protein truncates after three residues. In a real multi-exon transcript, a
premature stop this far upstream would also trigger nonsense-mediated decay, degrading the
mRNA rather than producing a truncated protein — so the usual result is loss of function via
absence of transcript, not a short protein.

**(d)** Deletion of position 8: everything downstream shifts by one.

```
new:   AUG GCA UUC GAG GUU CAU AA
       Met Ala Phe Glu Val His ...
```

**Frameshift.** Codon 3 happens to remain Phe (UUU → UUC, both Phe), but every codon after it
is different, and the original stop is no longer in frame. Frameshifts are typically severe:
they destroy the entire downstream protein sequence and usually introduce a premature stop at
some random downstream point.

**(e)** Position 9, U→C: codon 3 `UUU` → `UUC`. Both encode **Phe**.
**Synonymous** — and specifically a third-position change, which is where the genetic code is
most degenerate.

This is not a coincidence, and it is the interesting part. The code is arranged so that
third-position changes are usually synonymous (wobble), and so that when a substitution *does*
change the amino acid, the replacement tends to be chemically similar. The code has an
**error-minimising** structure — it is far better at buffering mutation and mistranslation
than a randomly assigned code would be. That property is almost certainly the product of
selection on the code itself.

</details>

---

## 9. Splicing ★

A gene has three exons. The intron 1 donor site is mutated from the canonical `GU` to `AU`.

**(a)** What is the immediate molecular consequence?
**(b)** Name three distinct outcomes that could follow.
**(c)** Why might this variant be missed by a standard coding-region analysis?

<details><summary>Solution</summary>

**(a)** The spliceosome recognises the 5′ splice site largely through base pairing between U1
snRNA and the donor consensus, of which the `GU` dinucleotide is the most strongly conserved
element. Mutating it prevents normal recognition, so **intron 1 is not spliced at its correct
donor site**.

**(b)** Three genuinely different outcomes:

1. **Intron retention.** The intron is left in the mature mRNA. Introns usually contain
   in-frame stop codons, so this typically produces a premature termination codon and triggers
   nonsense-mediated decay.
2. **Exon skipping.** The spliceosome instead joins exon 1's upstream partner to exon 3,
   removing exon 2 entirely. Whether this is tolerated depends on whether exon 2's length is a
   multiple of three — if not, the downstream sequence frameshifts.
3. **Cryptic splice site activation.** A nearby sequence that weakly resembles a donor site is
   used instead, producing a transcript with a slightly shortened or lengthened exon, again
   with frame consequences depending on the shift.

Which occurs is often unpredictable from sequence alone, and more than one can occur in the
same tissue, producing a mixture of transcripts.

**(c)** Because the variant is **not in the coding sequence**. It sits at the exon–intron
boundary, in what a naive coding-region annotation treats as intronic and therefore filters
out. Analyses that consider only missense and nonsense changes within exons will discard it.

This generalises: splice-disrupting variants — including deep-intronic ones creating new
cryptic sites, and synonymous exonic ones destroying splicing enhancers — are a substantial
and historically under-ascertained cause of Mendelian disease. It is one of the main reasons
exome sequencing leaves cases undiagnosed that genome sequencing plus RNA analysis can solve
([Ch 54](../part-11-human-and-statistical-genomics/54-rare-variants-and-mendelian-disease.md)).

</details>

---

## 10. Packing arithmetic

The human diploid genome is about 6.2 × 10⁹ bp. B-DNA rises 0.34 nm per base pair. A typical
nucleus is about 6 μm across.

**(a)** What is the total contour length of DNA in one diploid cell?
**(b)** What linear compaction factor is required to fit it into the nucleus?
**(c)** A nucleosome wraps 147 bp in about 1.7 turns, occupying roughly 11 nm of linear space
where the naked DNA would span 50 nm. What compaction does the nucleosome alone achieve, and
what does that tell you?

<details><summary>Solution</summary>

**(a)** 6.2 × 10⁹ bp × 0.34 nm/bp = 2.108 × 10⁹ nm = **~2.1 metres**

Two metres of DNA in every nucleated cell in your body.

**(b)** Comparing end-to-end length with nuclear diameter:

2.1 × 10⁹ nm ÷ 6 × 10³ nm = **~350,000-fold linear compaction**

But this comparison is the wrong one, and recognising why is the real content of the problem.
DNA is not a rigid rod that must be shortened; it is a flexible polymer whose *unconstrained*
size is set by random-coil statistics, not contour length. The genuine problem is not fitting
2 m into 6 μm — it is imposing an **ordered, untangled, locally accessible** conformation on a
polymer that would otherwise adopt a knotted random coil.

**(c)** Nucleosome compaction = 50 nm ÷ 11 nm ≈ **4.5-fold** (commonly quoted as ~6-7 fold
depending on how linker DNA is counted).

What that tells you: the nucleosome achieves only a tiny fraction of the total compaction
needed. Even the 30 nm fibre — whose existence *in vivo* is not established
([Ch 03](../part-01-molecular-foundations/03-genomes-chromosomes-chromatin.md)) — reaches only
~40-fold cumulative. The remaining several orders of magnitude come from loop extrusion,
compartmentalisation and large-scale folding
([Ch 50](../part-10-functional-genomics/50-3d-genome.md)), not from a tidy hierarchy of coils
within coils.

The textbook ladder of 10 nm → 30 nm → 300 nm loops → chromosome is a diagram, not a finding.

</details>

---

## Where you went wrong

Track your errors by type — the patterns repeat far more than the content does.

| Error pattern | What to re-read |
|---|---|
| Lost track of 5′/3′ or strand | [Ch 02](../part-01-molecular-foundations/02-dna-structure.md), and problem 1(d) |
| Confused template with coding strand | [Ch 05](../part-01-molecular-foundations/05-transcription.md), problem 6 |
| Treated synonymous as "no effect" | [Ch 07](../part-01-molecular-foundations/07-genetic-code-and-translation.md), problem 8(a) |
| Forgot frameshift destroys everything downstream | Problem 8(d) |
| Assumed one mechanism gives the final fidelity | [Ch 04](../part-01-molecular-foundations/04-dna-replication.md), problem 5 |
| Compared contour length to nuclear diameter without questioning it | Problem 10(b) |
