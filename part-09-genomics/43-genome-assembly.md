# 43 — Genome assembly

> **Before this:** [Ch 39](39-genome-landscapes.md) · [Ch 40](40-sequencing-technologies.md) · [Ch 42](42-read-alignment.md) · **Time:** ~55 min

Alignment ([Ch 42](42-read-alignment.md)) assumes you already have the genome and only need to
locate reads in it. Assembly is the case where you don't. It is the harder problem, and it is
hard for a reason that no amount of engineering removes.

## What you'll be able to do

- Formulate assembly as a graph problem, state the Hamiltonian and Eulerian framings of it, and build a de Bruijn graph from reads by hand to read a contig off it
- State the *k*-selection trade-off precisely, in terms of repeat resolution, effective coverage, and error survival
- Explain why a repeat longer than the read length is unresolvable in principle, not in practice
- Compute N50, L50 and NG50 from contig lengths, and say exactly how N50 and a completeness score each mislead
- Distinguish a collapsed repeat from a misjoin from a false duplication by their coverage signatures
- Explain why a diploid assembly needs phasing, and how trio binning and Hi-C supply it
- Explain what read length, read accuracy and an effectively haploid source each contributed to closing the human reference, and why no two of the three would have sufficed

## The core idea

You are handed an enormous multiset of short substrings, sampled from unknown positions on
unknown strands of an unknown string, with errors. Reconstruct the string.

Framed that way it looks like a shortest-common-superstring problem, and the classical
literature treats it as one. That framing is doubly wrong. It is NP-hard, which is annoying;
and the shortest superstring is *not the right answer*, which is fatal — the shortest string
consistent with the reads is the one that collapses every repeat into a single copy, so the
optimal solution to the stated problem is a wrong genome.

The real content of assembly is this: **the reads determine the genome only up to the
ambiguity created by repeats longer than the reads.** Everything else — graph formalisms,
error correction, scaffolding, polishing — is machinery for extracting exactly the information
the reads contain and no more. The history of the field is the history of making reads long
enough that the ambiguity disappears.

---

## 1. The problem, stated precisely

Input: reads $r_1 \dots r_n$, each a substring of the target with substitution and indel
errors, from an unknown strand, sampled at positions that are approximately uniform but not
exactly (GC content, chromatin state and library chemistry all bias coverage). Output: a set
of strings that, laid end to end, reconstruct the target.

Coverage is not the binding constraint. Under Poisson sampling at depth *c*, the expected
fraction of the genome covered by no read is $e^{-c}$ — at 30× that is about $10^{-13}$, so
sampling gaps are a non-issue at modern depths. The genome is fully *observed*. It is just not
fully *determined*, and the gap between those two words is the subject of this chapter.

## 2. Overlap–layout–consensus, and the Hamiltonian framing

The obvious approach:

1. **Overlap.** For every pair of reads, find suffix–prefix overlaps above a length and
   identity threshold.
2. **Layout.** Build a graph with reads as nodes and overlaps as edges. A reconstruction uses
   every read once, so it is a **Hamiltonian path**.
3. **Consensus.** With reads laid out, call each base by majority vote over the column.

Two problems. The framing is NP-hard — Hamiltonian path is the textbook example — though in
practice the graph is nearly a path and heuristics do fine. The real killer is step 1: all-pairs
overlap is $O(n^2)$ suffix–prefix computations. With $n \approx 10^9$ short reads that is
hopeless, and indexing tricks (minimiser seeding, an FM-index over the read set) reduce the
candidate set but leave a brutal constant.

There is also an information problem. A 150 bp read overlapping another by 40 bp is weak
evidence — not because 40 bp of random sequence recurs by chance (it does not; random sequence
becomes expected-unique in a 3 Gb genome at ~17 bp), but because the genome is not random. A 40 bp
window sits inside *Alu* and other repeat families a million times over, and an overlap that short
gives no leverage to tell a repeat-driven match from a true adjacency. Sequencing error compounds
it. Short reads produce a graph dense with spurious edges.

OLC is the right answer when *n* is small and overlaps are long and unambiguous — which is to
say, for long reads. It was how Sanger-era genomes were built, it was abandoned for short
reads, and it came back the moment reads got long again. The formalism did not change; the
data did.

## 3. De Bruijn graphs, and the Eulerian framing

The move that made short-read assembly tractable: stop treating reads as the unit.

Chop every read into all its overlapping substrings of length *k* (**k-mers**). Build a graph
whose **nodes are (k−1)-mers** and whose **edges are k-mers**: the k-mer `ACGT` is an edge from
node `ACG` to node `CGT`. A reconstruction now uses every k-mer once, so it is an **Eulerian
path** — and Eulerian path is linear-time.

The deeper win is that no pairwise comparison ever happens. Identical sequence collapses to the
same node automatically, by hashing. Graph construction is a k-mer count, which is embarrassingly
parallel and streams.

The price: read coherence is thrown away. A read spanning three variant positions told you those
three alleles co-occur on one molecule; after k-merisation, that information is gone unless
*k* exceeds the span.

### A worked graph

Target (unknown to the assembler), 11 bp, and four 7 bp reads:

```
       position  1234567890 1
       target    TACGGATCAGT
       r1        TACGGAT
       r2         ACGGATC
       r3           GGATCAG
       r4            GATCAGT
```

Decompose each read into 4-mers (k = 4):

```
r1 -> TACG ACGG CGGA GGAT
r2 ->      ACGG CGGA GGAT GATC
r3 ->                GGAT GATC ATCA TCAG
r4 ->                     GATC ATCA TCAG CAGT

distinct 4-mers: TACG ACGG CGGA GGAT GATC ATCA TCAG CAGT   (8)
```

Each 4-mer is an edge between its two 3-mers:

```
 TAC --TACG--> ACG --ACGG--> CGG --CGGA--> GGA --GGAT--> GAT
                                                          |
                                                        GATC
                                                          v
 AGT <--CAGT-- CAG <--TCAG-- TCA <--ATCA-- ATC <----------+
```

Every node has in-degree = out-degree = 1 except `TAC` (in 0, out 1) and `AGT` (in 1, out 0), so
the Eulerian path is forced. Read it off by taking the start node and appending the last base of
each successive node:

```
TAC + G + G + A + T + C + A + G + T  =  TACGGATCAGT     ✓ the target
```

Now break it. Suppose the target contains a sequence **R** twice, with different flanks — `…A R B…`
and `…C R D…` — and R is long enough that its internal k-mers are shared. The two paths merge:

```
   …A ──┐                 ┌── B…
         ├──►[  R  ]──────┤
   …C ──┘                 └── D…
```

Node R now has in-degree 2 and out-degree 2. **Two Eulerian paths exist** — (A·R·B, C·R·D) and
(A·R·D, C·R·B) — and the k-mer multiset is identical under both. The graph does not prefer one.
No traversal heuristic can, because the information is not present.

## 4. Choosing *k*

Precisely: two copies of an exact repeat of length *r* stay separate in the graph only if
*r* ≤ *k* − 2. At *r* = *k* − 1 the repeat is itself a node, and that node acquires the 2-in/2-out
structure above. So **larger *k* resolves longer repeats**, one base at a time.

Against that, two costs, both quantifiable.

**Effective coverage falls.** A read of length *L* yields *L* − *k* + 1 k-mers, so k-mer coverage
is $c_k = c \cdot (L-k+1)/L$. You cannot spend read length on *k* and still have it.

**Error survival falls exponentially.** A single substitution destroys up to *k* k-mers and
creates *k* spurious ones. The probability a given k-mer is error-free is roughly $(1-\varepsilon)^k$.

For *L* = 150, ε = 0.001, read coverage 30×:

| *k* | k-mer coverage factor $(L-k+1)/L$ | effective $c_k$ | $(1-\varepsilon)^k$ |
|---|---|---|---|
| 31 | 0.80 | 24× | 0.970 |
| 61 | 0.60 | 18× | 0.941 |
| 101 | 0.33 | 10× | 0.904 |

At *k* = 101 you have 10× k-mer coverage, which is no longer comfortably separable from the error
k-mers, and 10% of k-mers are corrupted. The trade-off is therefore **not** "bigger *k* is better
until memory runs out": it is that *k* must be large enough to break repeats and small enough that
true k-mers remain confidently more abundant than error k-mers. That window widens with coverage,
widens dramatically with read accuracy, and is why HiFi reads (>99.9% consensus,
[Ch 40](40-sequencing-technologies.md)) permit *k* in the thousands where noisy short reads permit
tens.

## 5. What errors do to the graph, and how to clean it

Three characteristic lesions:

| Structure | Cause | Signature |
|---|---|---|
| **Tip** | an error near a read end — the erroneous path runs a few k-mers and dies | short dead-end branch, coverage ≈ 1 |
| **Bubble** | an error in a read interior, *or* a heterozygous site | two parallel paths of similar length rejoining |
| **Chimeric link** | a chimeric read, or an error creating a k-mer that exists elsewhere | a spurious edge joining unrelated regions |

The discriminator is coverage. Plot the k-mer count histogram and it is bimodal: a huge spike at
count 1–2 (errors, each unique) and a Poisson-ish peak at $c_k$ (true k-mers). For a diploid there
are *two* true peaks — heterozygous k-mers at $c_k/2$, homozygous at $c_k$ — and the ratio of their
areas estimates heterozygosity while the total estimates genome size. That histogram, computed
before any assembly, tells you what you are about to be up against.

Cleaning is then: clip tips, pop bubbles, remove low-coverage edges. The danger is that **bubble
popping is haplotype destruction**. Heterozygous bubbles and error bubbles look alike locally, and
an aggressive cleaner silently produces a haploid consensus of a diploid organism. Error correction
before assembly — reads corrected against a consensus of their overlapping neighbours — moves the
same decision earlier, where more evidence is available.

## 6. String graphs and unitigs

The overlap graph has redundant edges: if A overlaps B, B overlaps C, and A overlaps C consistently,
the A→C edge is *transitively inferable* and carries no information. Remove all such edges, and
discard reads wholly contained in others, and what remains is the **string graph** — the minimal
graph representing the same set of reconstructions.

In both formalisms, the honest output is the **unitig**: a maximal path with no branches, i.e. a
stretch where the traversal had no choices. Unitigs are what the data determines. A **contig** is
unitigs plus decisions — some of which are wrong.

This is why the assembly *graph* (usually GFA, [Ch 41](41-data-formats.md)), not the flattened FASTA,
is the real result. The FASTA is a lossy projection that discards exactly the record of where the
assembler guessed. The same insight drives the move to graph references in
[Ch 45](45-reference-genomes-and-pangenomes.md).

## 7. Repeats: an information-theoretic wall

Return to the 2-in/2-out structure. Consider a read lying entirely inside one copy of a repeat.
Which copy did it come from? The read is a substring of both. It carries *zero* bits about its
origin. If every read spanning the region is like that, the two arrangements are not merely hard to
distinguish — they generate identical data.

> **A repeat longer than the read length, and identical between copies, cannot be resolved by any
> algorithm from those reads.** This is a statement about the data, not about the software.

The escape hatch is that repeat copies are rarely perfectly identical. Copies diverge, and a read
long enough to span two divergent positions is assigned to a copy. So the operative requirement is:
reads long enough to reach from one distinguishing variant to the next.

That single fact explains the entire technology history:

| Repeat class | Typical length | Reads needed |
|---|---|---|
| *Alu* elements ([Ch 19](../part-03-genome-instability/19-transposable-elements.md)) | ~300 bp | > a few hundred bp |
| LINE-1 | up to ~6 kb | > 6 kb |
| Segmental duplications, >99% identical | 10s–100s kb | 10s–100s kb, high accuracy |
| Centromeric higher-order repeat arrays | megabases | ultra-long reads (>100 kb) |
| rDNA arrays, acrocentric short arms | megabases | ultra-long reads |

Short-read assemblies of a mammal fragment at the scale of the interspersed repeat landscape:
contig N50s of tens of kb against a mean *Alu* spacing of ~3 kb (~1.1 million copies over ~3.1 Gb,
[verified facts](../reference/verified-facts.md)). Paired ends and the divergence between copies
walk an assembler through many *Alu*s; nothing walks it through the rest, and that is where the
information runs out. Nothing in the assembler is at fault.

## 8. Scaffolding, gap filling, polishing

**Scaffolding** orders and orients contigs using long-range links, *without* knowing the intervening
sequence. Gaps are written as runs of `N` whose length is an estimate. A scaffold is a hypothesis
about arrangement; a contig is a claim about sequence.

| Source of linkage | What it gives | Failure mode |
|---|---|---|
| **Mate pairs / jumping libraries** | two reads a known distance apart; landing on different contigs gives order, orientation and gap size | chimeric junctions during library construction produce false links |
| **Long reads** | direct spanning evidence | none in principle; coverage in practice |
| **Optical maps** | positions of a short motif along megabase molecules, matched to an in-silico digest of contigs | label density; no sequence, so only order/orient and large SV detection |
| **Hi-C** | frequency of physical contact between loci ([Ch 50](../part-10-functional-genomics/50-3d-genome.md)) | joins across haplotypes; needs curation |

**Why Hi-C works** is worth stating as a data-analysis fact. Chromatin is a constrained polymer, so
the probability that two loci are cross-linked together decays monotonically with the genomic
separation between them — roughly inversely with separation over the megabase range — and contacts
*between* chromosomes are an order of magnitude rarer than contacts within one. So a Hi-C experiment
hands you a noisy, monotone-decreasing function of an unknown distance between every pair of contig
ends. That is a seriation problem: cluster contigs into chromosomes (block structure of the contact
matrix), order them so contact frequency decays with position (a travelling-salesman-flavoured
ordering), and orient each by asking which of its two ends contacts its neighbour more. From one
experiment you get chromosome-scale scaffolds for an organism with no genetic map and no reference.

**Gap filling** re-assembles locally: collect reads whose partners anchor into the gap, assemble
just those, splice in. **Polishing** is the consensus step done properly — realign all reads to the
draft and recall every base, which is a per-position inference problem identical in structure to
variant calling ([Ch 46](../part-10-functional-genomics/46-variant-calling.md)). Polishing a
long-read assembly with short reads was standard when long reads were noisy, and it has a nasty
failure mode: short reads mismap between paralogues and *introduce* errors into exactly the
multi-copy genes that matter clinically. Accurate long reads largely removed the need.

Per-base accuracy is reported as **QV** = −10 log₁₀(per-base error rate): Q40 is one error per
10 kb, Q50 one per 100 kb, Q60 one per Mb.

## 9. Measuring an assembly

**N50** is the length-weighted median contig length. Operationally: sort contigs descending, walk
down accumulating length, and report the length of the contig at which you pass half the assembly
total. Equivalently — the framing worth remembering — **pick a random base of the assembly; N50 is
the median length of the contig containing it.** **L50** is how many contigs that took.

Three ways it lies:

1. **It rewards long contigs regardless of correctness.** Concatenating two contigs incorrectly
   raises N50.
2. **It is normalised by the assembly's own size.** A fragmented assembly that also lost 20% of the
   genome divides by a smaller denominator and scores better than it deserves. **NG50** fixes this
   by walking to half of the *estimated genome size*, making assemblies of the same organism
   comparable.
3. **Scaffold N50 is not contig N50.** Scaffold N50 counts gap `N`s as though they were sequence. An
   assembly can have a 50 Mb scaffold N50 and a 200 kb contig N50; report both or the number is
   meaningless.

The correctness-aware variant, **NGA50**, aligns the assembly to a trusted reference, breaks contigs
at every structural disagreement, and computes NG50 on the fragments — so a misjoin lowers it.

**Completeness** is assessed with conserved single-copy orthologs — genes expected exactly once in
every member of a clade (the BUSCO idea). Search the assembly for them and report complete /
duplicated / fragmented / missing. The **duplicated** fraction is the diagnostic that matters most:
a high value usually means both haplotypes were retained as separate contigs rather than merged, not
that the organism has extra genes. Caveat: this measures *gene space only*. An assembly can be 99%
BUSCO-complete and contain no centromere at all.

**Reference-free evaluation** avoids assuming a reference exists. Count k-mers in the raw reads;
those seen often enough to be real but absent from the assembly indicate missing sequence or
consensus errors, and their rate converts directly to a QV. The reciprocal check — assembly k-mers
absent from reads — flags fabricated sequence. Add: map the reads back and look for coverage
anomalies and clipped-read pileups.

**Assembly errors** and their signatures, since detection is mostly coverage arithmetic:

| Error | What happened | Signature |
|---|---|---|
| **Misjoin** | false adjacency between distant regions | clipped reads piling up at one point; Hi-C off-diagonal block; long reads span the junction in neither direction |
| **Collapsed repeat** | *n* copies represented as one | ~*n*× coverage over the region; excess heterozygous calls that look like a repeat's paralogous differences |
| **False duplication** | one region represented twice (unmerged haplotypes) | ~0.5× coverage on both copies; duplicated BUSCOs |
| **Haplotype switch** | the contig jumps between parental haplotypes | phase discordance against parental or Hi-C data |

## 10. A diploid genome is two genomes

Human cells contain two genomes that differ at millions of sites. The traditional "primary assembly"
is a single sequence that switches arbitrarily between them — a mosaic that exists in no cell and
that systematically misrepresents any region where the haplotypes differ structurally.

Two ways to phase properly:

**Trio binning.** Sequence both parents. Find k-mers present in one parent and absent from the
other; these mark paternal and maternal haplotypes. Assign each child read to a bin by which marker
k-mers it contains, then assemble the bins separately. The result is two haplotype assemblies with
essentially no switch errors — and the elegance is that the hard problem (phasing) is solved by
counting before any assembly happens. Regions where the parents carry the same allele have no
markers, but they also have nothing to switch.

**Hi-C phasing.** No parents required. A Hi-C read pair mostly links two loci on the *same physical
chromosome*, therefore the same haplotype. Heterozygous sites linked by many such pairs are in phase,
and phase blocks extend chromosome-scale. Modern assemblers keep both haplotype paths in the graph
and use trio or Hi-C signal to partition them, producing hap1/hap2 assemblies rather than a mosaic.
This is how the human pangenome's haplotype-resolved assemblies are built
([Ch 45](45-reference-genomes-and-pangenomes.md)).

## 11. Telomere-to-telomere

T2T-CHM13 closed the human reference. It required three things simultaneously:

- **A haploid-like source.** CHM13 is a complete hydatidiform mole cell line — essentially one
  haplotype. Phasing was removed from the problem entirely.
- **HiFi accuracy**, so that reads could be placed correctly within near-identical repeat arrays
  using the rare positions where copies differ.
- **ONT ultra-long reads** (>100 kb) to span *many consecutive*, near-identical repeat copies at
  once. Alpha-satellite higher-order repeat units are themselves only ~0.3–6 kb, well inside HiFi
  range; the length is needed not to span one unit but to reach from one rare distinguishing variant
  to the next across a homogeneous megabase array.

The result resolved **~8% of the genome that had been inaccessible**, including **all centromeres
and the entire short arms of the five acrocentric chromosomes**
([verified facts](../reference/verified-facts.md)). Those regions were not "difficult" in the earlier
references — they were absent, represented by multi-megabase runs of `N`. That the human reference
went from "complete" in 2003 to actually complete in 2022 is the clearest possible demonstration of
§7.

## 12. Metagenomes

Assembling a community adds difficulties that are not merely quantitative:

- **The number of genomes is unknown**, and so is the length of each.
- **Coverage is abundance.** Depth varies over orders of magnitude *and carries signal* — so the
  single low-coverage cutoff that cleans a single-genome graph deletes the rare organisms.
- **Strain variation** produces dense micro-bubbles indistinguishable from errors.
- **Repeats span species.** Conserved genes, rRNA operons and mobile elements are shared between
  genomes, so a collapsed repeat can create a contig that is chimeric *between organisms* — a
  sequence belonging to no living thing.

The standard response is assemble-then-**bin**: cluster contigs into metagenome-assembled genomes
using tetranucleotide composition (species-characteristic) plus the vector of coverages across
multiple samples (co-varying contigs are the same organism). That is unsupervised clustering in a
composition-plus-abundance space, and it is where a reader with a machine-learning background has an
immediate advantage. Quality is then judged by single-copy marker genes, with the widely used
convention for a high-quality draft being >90% complete and <5% contaminated.

## 13. Choosing an approach

| Situation | Approach | Why |
|---|---|---|
| Bacterial isolate | long reads alone, circularise | genome < 10 Mb, few long repeats; complete circular chromosomes are routine |
| Small, low-repeat eukaryote | HiFi + graph assembly | repeats mostly shorter than reads |
| Large repeat-rich plant, often polyploid | HiFi + ultra-long + Hi-C | many near-identical subgenomes; phasing is the whole problem |
| Human, research-grade | HiFi + ONT ultra-long + Hi-C or trio, phased output | haplotype-resolved is now the standard, not the luxury |
| Human, clinical | do not assemble — align to a reference or pangenome | assembly answers a question the clinic is not asking, at far higher cost |
| Metagenome | long reads if biomass permits; assemble, then bin | recovers more full-length genes and fewer inter-species chimeras |
| Ancient or degraded DNA | reference-guided only | fragments of tens of bp carry too little overlap information |

The decision rule underneath the table: **compare the read length distribution you can obtain with
the repeat length distribution of the target.** Everything else is secondary.

---

## Common misconceptions

| What people think | What's actually true |
|---|---|
| Assembly finds the shortest string consistent with the reads | The shortest superstring collapses every repeat. The correct genome is longer than the optimum of that objective, so the "optimal" answer is wrong by construction |
| More coverage fixes fragmentation | Coverage saturates. At 30× essentially every base is observed; contiguity is limited by read length versus repeat length, and adding depth changes neither |
| De Bruijn assembly is better than overlap assembly | It is better *for many short reads*, because it avoids all-pairs overlap. For few long reads, overlap and string-graph methods are better — they keep read coherence, which de Bruijn discards |
| A bigger *k* always gives a better assembly | Bigger *k* resolves longer repeats but cuts effective k-mer coverage and lets errors destroy more k-mers. There is an optimum, and it depends on coverage and accuracy |
| A high N50 means a good assembly | N50 rewards long contigs whether or not they are correct — a misjoin *raises* it. Report contig N50, NG50, an error-aware metric, and a completeness measure together |
| A finished genome is one sequence per chromosome | A diploid has two haplotypes per chromosome. A single merged sequence is a mosaic that exists in no cell |
| Gaps in an assembly are random unlucky regions | They are overwhelmingly the repeats — centromeres, satellite arrays, segmental duplications. The missing 8% of the human genome before T2T was not a random 8% |
| BUSCO-complete means the genome is complete | BUSCO samples conserved single-copy genes. It is blind to repeats, so an assembly missing every centromere can still score ~99% |

## Worked example: contiguity metrics, and how a mistake improves them

An assembly of an organism whose genome size is estimated at **160 Mb** produces ten contigs
(lengths in Mb):

```
40, 30, 20, 15, 10, 5, 4, 3, 2, 1        total = 130 Mb
```

**N50.** Half the assembly total is 130/2 = **65 Mb**. Walk the sorted lengths:

```
contig   length   cumulative
  1        40         40        < 65
  2        30         70        ≥ 65   ← stop
```

**N50 = 30 Mb, L50 = 2.**

**NG50.** Now walk to half the *estimated genome size*: 160/2 = **80 Mb**.

```
  1        40         40        < 80
  2        30         70        < 80
  3        20         90        ≥ 80   ← stop
```

**NG50 = 20 Mb, LG50 = 3.**

NG50 < N50 because the assembly recovered only 130 of 160 Mb. N50 divided by what was assembled;
NG50 divided by what exists. The 30 Mb of missing sequence — almost certainly repeats — is invisible
to N50 and penalised by NG50. **This is why NG50 is the metric to quote whenever a genome size
estimate is available**, and the k-mer histogram of §5 gives you one without a reference.

**Now introduce an error.** Suppose the scaffolder wrongly joins the 40 Mb and 30 Mb contigs:

```
70, 20, 15, 10, 5, 4, 3, 2, 1            total = 130 Mb

half = 65 Mb:   contig 1 = 70 ≥ 65      ← stop immediately
```

**N50 = 70 Mb, L50 = 1** — the headline contiguity metric more than doubled, and the assembly got
worse. NG50, by contrast, does *not* move: walking to 80 Mb, the 70 Mb contig alone falls short, so
the walk takes the next one and **NG50 = 20 Mb, LG50 = 2** — exactly its value before the misjoin.
Read that as luck, not protection. NG50 is normalised by genome size, not by correctness; it happened
to be insensitive here only because 70 < 80, and had the scaffolder swallowed the 20 Mb contig as
well, the resulting 90 Mb piece would have carried NG50 to 90 Mb. Only a correctness-aware metric is
*designed* to catch this: NGA50 aligns to a trusted reference, breaks the contig at the false
junction back into its 40 and 30 Mb pieces, and so refuses to credit the join at all.

**The check that would have caught it.** At the false junction, long reads span it in neither
direction, soft-clipped reads pile up at a single coordinate, and the Hi-C contact matrix shows the
two halves of the 70 Mb contig with near-background contact frequency between them — when §8 says
contact frequency between adjacent sequence should be at its maximum. Three independent signals, all
available before publication.

## Connections

- **Back to:** [Ch 39](39-genome-landscapes.md) supplies the repeat content that sets the difficulty;
  [Ch 40](40-sequencing-technologies.md) supplies the read lengths and accuracies that set what is
  achievable; [Ch 42](42-read-alignment.md) is the same string-matching machinery used with a
  reference in hand; [Ch 19](../part-03-genome-instability/19-transposable-elements.md) explains why
  the repeats are there at all
- **Forward to:** [Ch 44](44-annotation.md) — an assembly is uninterpreted until annotated;
  [Ch 45](45-reference-genomes-and-pangenomes.md) — many haplotype-resolved assemblies become a
  pangenome graph, and the graph formalism of §6 becomes the reference itself;
  [Ch 46](../part-10-functional-genomics/46-variant-calling.md) — polishing and variant calling are
  the same inference; [Ch 35](../part-07-molecular-evolution/35-genome-evolution.md) — collapsed
  repeats and false duplications are a standing hazard in comparative genomics

## Check yourself

**1. Why is the shortest common superstring the wrong objective for assembly, even setting aside its complexity?**

<details><summary>Answer</summary>

Because minimising length is exactly the instruction to merge every repeat into a single copy. A
genome with a 5 kb sequence repeated three times has a shortest consistent superstring containing it
once. The true genome is a suboptimal solution to the stated problem. Any objective that rewards
compactness is systematically biased toward collapsing repeats — which is the dominant error class
in real assemblies.

</details>

**2. An assembler is run with k = 51 on a genome containing an exact 200 bp repeat with distinct flanks. What happens, and does k = 201 fix it?**

<details><summary>Answer</summary>

At k = 51 the repeat's internal k-mers are shared between copies, so the two paths merge into a
2-in/2-out node and both Eulerian traversals are consistent with the data. The assembler either
breaks the contig there or guesses.

k = 201 does *not* fix it. Nodes are (k−1)-mers, so at k = 201 the 200 bp repeat is exactly one
node — precisely the failing case, with in-degree 2 and out-degree 2. The requirement is repeat
length ≤ k − 2, so **k = 202** is the smallest k that genuinely separates the copies. But if the
reads are 150 bp, no k-mer of length 202 can be extracted from any read — the
graph would be empty. If the reads are 20 kb, k = 202 is both possible and unnecessary, because the
overlap/string-graph route would already have spanned the repeat with whole reads. The general
answer: k is bounded above by read length, so raising k is only a repeat-resolution strategy within
the range read length already permits.

</details>

**3. Assembly A has contig N50 = 5 Mb; assembly B of the same species has contig N50 = 45 Mb. What could make B the worse assembly?**

<details><summary>Answer</summary>

Several possibilities, all common. B may contain misjoins — an incorrect join strictly increases N50.
B may be scaffold N50 mislabelled, with most of its length being gap `N`s. B may have collapsed
repeats, producing long contigs that are shorter than the true sequence (detectable as elevated
coverage). Or B may have discarded 25% of the genome, shrinking the denominator that N50 divides by.

The way to tell: NG50 against a genome-size estimate, NGA50 or long-read spanning support at
junctions, coverage uniformity, BUSCO duplication rate, and reference-free k-mer completeness. N50
alone answers none of these.

</details>

**4. Trio binning phases a child's genome by counting k-mers in the parents. Why does that work, and what does it require that Hi-C phasing does not?**

<details><summary>Answer</summary>

At a site where the parents differ, some k-mers occur in one parent's reads and not the other's.
Those k-mers tag haplotype origin directly, so each child read can be assigned to a parental bin
before any assembly — the phasing problem is reduced to set membership on a hash table, and there is
no opportunity for switch errors because assembly happens after partitioning.

It requires sequencing both parents, which is often impossible: the parents may be unavailable,
unknown, or dead, and it is unusable for a wild-caught individual or a tumour. Hi-C phasing needs
only the sample itself, exploiting the fact that a cross-link mostly joins two loci on the same
physical chromosome and therefore the same haplotype. It is the more general tool; trio binning is
the more accurate one when available.

</details>

**5. Why did the human reference genome need ultra-long ONT reads to complete, when HiFi reads are far more accurate?**

<details><summary>Answer</summary>

Accuracy and length solve different halves of §7. Human centromeres are megabase arrays of higher-
order repeat units that are highly similar to one another. A 20 kb HiFi read sits entirely inside
such an array and — unless it happens to span two positions where the copies differ — cannot be
assigned to a specific position within it. Length is the binding constraint there — but not for the
reason usually given. The higher-order repeat units are only ~0.3–6 kb, so spanning *one* unit is
not the problem. What ONT reads of >100 kb supply is a single molecule long enough to cross many
consecutive copies at once, reaching from one rare distinguishing variant to the next, which is what
anchors a read uniquely inside a megabase array.

Conversely, ONT accuracy alone was insufficient to distinguish near-identical copies by their rare
differences, which is what HiFi supplied. Adding the effectively haploid CHM13 line removed the
phasing problem so that all remaining ambiguity was repeat ambiguity. All three together resolved the
~8% of the genome that had been inaccessible, including every centromere and the five acrocentric
short arms.

</details>
