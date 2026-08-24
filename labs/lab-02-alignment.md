# Lab 02 — Alignment, FLAGs and CIGARs

> **Time:** ~40 min · **Before this:** [lab-01](lab-01-sequences-and-fastq.md), [Ch 42](../part-09-genomics/42-read-alignment.md)

Align real reads to a real genome, then decode the alignment records by hand. The point is not
to run `bwa` — that is one command. The point is to be able to read what comes out, because
every downstream analysis inherits its errors from here.

All outputs are real, from this data on this machine.

Where this lab leans on statistics — MAPQ as a probability, coverage as a Poisson process — a box
says so and points at the [statistics track](../part-S-statistics/S1-probability.md). Nothing
beyond basic statistics is assumed here.

```bash
# GENOMICS is exported in lab-00. In a fresh shell, set it again:
#   export GENOMICS=/path/to/learn-genomics
cd "$GENOMICS" && source .venv/bin/activate && cd labs/data
```

---

## 1. Index the reference

```bash
bwa index rel606.fa
```

Real time: **0.61 s** for a 4.63 Mb genome. This builds the FM-index — the
Burrows–Wheeler-transformed, sampled-suffix-array structure that lets the aligner find exact
matches in time proportional to the query length rather than the genome length
([Ch 42](../part-09-genomics/42-read-alignment.md)).

Look at what it produced:

```bash
ls -lh rel606.fa.*
```

The `.bwt`, `.sa`, `.pac`, `.amb` and `.ann` files together are the index. For a human genome
this step takes closer to an hour and produces several gigabytes — which is why you build it
once and keep it.

## 2. Align

```bash
bwa mem -t 4 rel606.fa ecoli_R1.fastq.gz ecoli_R2.fastq.gz \
  | samtools sort -@2 -o aln.bam -
samtools index aln.bam
```

Real time: **~1.7 s** for 200,000 reads on 4 threads. Note the pipe — `bwa` writes uncompressed
SAM to stdout and `samtools sort` consumes it directly. Writing the intermediate SAM to disk
would be several times larger than the final BAM and pointlessly slow. Streaming between tools
is the normal idiom in genomics, not an optimisation.

## 3. Did it work? Read the flagstat

```bash
samtools flagstat aln.bam
```

```
201312 + 0 in total (QC-passed reads + QC-failed reads)
200000 + 0 primary
0 + 0 secondary
1312 + 0 supplementary
0 + 0 duplicates
199861 + 0 mapped (99.28% : N/A)
198549 + 0 primary mapped (99.27% : N/A)
...
193670 + 0 properly paired (96.83% : N/A)
1427 + 0 singletons (0.71% : N/A)
```

How to read this:

| Number | Meaning | Healthy? |
|---|---|---|
| 200,000 primary | Matches your input read count exactly | ✓ nothing lost |
| 201,312 total > 200,000 | The excess is **supplementary** alignments | ✓ expected |
| 99.28% mapped | Fraction placed anywhere | ✓ this is the *right* reference for these reads |
| 96.83% properly paired | Both mates placed, correct orientation, sensible distance | ✓ the strongest single health signal |
| 0.71% singletons | One mate mapped, the other didn't | ✓ low |

**Hold on to 99.28%.** [Lab 03 §5](lab-03-variant-calling.md) aligns these same reads to
*E. coli* K-12 — the wrong strain of the right species — and gets 93.68% mapped, which still
*looks* perfectly healthy. A five-point drop in mapping rate is the entire visible warning you
get before the wrong reference manufactures 19,209 false variants. That is the point of the
number, and it is why "the mapping rate looked fine" is not evidence of anything on its own.

**Total exceeding input is not a bug.** A read that spans a structural junction can be split
into a primary alignment plus a *supplementary* one, so one read contributes two records.
Counting records and calling it "reads" is a common and silent error — always filter to primary
alignments when you mean to count reads.

A properly-paired rate this high says the library is intact and the reference is right. Below
~80% for a well-matched sample, start suspecting contamination, the wrong reference, or
adapter contamination.

> **The statistics here.** Every percentage in that output is a proportion: *n* reads, each of
> which either did or did not map, which is the binomial setting
> ([S2](../part-S-statistics/S2-distributions.md)). Read it as an estimate carrying a standard
> error of √(p(1−p)/n) ([S3](../part-S-statistics/S3-sampling-and-estimation.md)) — at n = 200,000
> and p ≈ 0.99 that is about 0.02%, so a mapping rate that drops from 99.3% to 98.8% between two
> runs of the same library is not sampling noise, it is a change worth chasing. The assumption that
> leaks is independence: reads from one duplicated fragment or one repeat family succeed or fail
> together, so real run-to-run spread is wider than the formula. Treat that SE as a floor on the
> noise, not the noise.

## 4. Decode a FLAG by hand ★

The FLAG is a **bitfield**. Each bit asserts one independent fact about the alignment.

| Bit | Value | Meaning |
|---|---|---|
| 0x1 | 1 | read is paired |
| 0x2 | 2 | proper pair |
| 0x4 | 4 | read unmapped |
| 0x8 | 8 | mate unmapped |
| 0x10 | 16 | read on reverse strand |
| 0x20 | 32 | mate on reverse strand |
| 0x40 | 64 | first in pair |
| 0x80 | 128 | second in pair |
| 0x100 | 256 | secondary alignment |
| 0x200 | 512 | fails QC |
| 0x400 | 1024 | PCR/optical duplicate |
| 0x800 | 2048 | supplementary alignment |

Take a real record from this dataset:

```
SRR2584863.43990   99   NC_012967.1   14   60   150M   =   736   825
```

Decompose **99**:

```
99 = 64 + 32 + 2 + 1
   = 0x40 + 0x20 + 0x2 + 0x1
   = first in pair + mate reverse + proper pair + paired
```

Check yourself against the tool:

```bash
samtools flags 99
```

```
0x63	99	PAIRED,PROPER_PAIR,MREVERSE,READ1
```

The four FLAGs you will see constantly, and what they mean together:

| FLAG | Decodes to | Role |
|---|---|---|
| 99 | paired, proper, mate-reverse, read1 | forward read of a proper pair |
| 147 | paired, proper, reverse, read2 | its mate |
| 83 | paired, proper, reverse, read1 | forward-strand pair, other orientation |
| 163 | paired, proper, mate-reverse, read2 | its mate |

99/147 and 83/163 are the two orientations of a normal pair. Seeing anything else in bulk is
informative — for example FLAG 77 and 141 are both-mates-unmapped.

**Filtering by FLAG** is how you select records. `-f` requires bits, `-F` excludes them:

```bash
samtools view -c -f 2 -F 2304 aln.bam    # properly paired, excluding secondary(256)+supplementary(2048)
```

2304 = 256 + 2048. Learn this number; excluding non-primary alignments is the single most
common filter you will apply, and forgetting it silently double-counts reads.

## 5. Decode CIGARs

The CIGAR describes how the read aligns, operation by operation.

| Op | Meaning | Consumes read | Consumes reference |
|---|---|---|---|
| M | match **or mismatch** | yes | yes |
| I | insertion to the reference | yes | no |
| D | deletion from the reference | no | yes |
| S | soft clip (present in SEQ, unaligned) | yes | no |
| H | hard clip (absent from SEQ) | no | no |
| N | skipped reference (intron, in RNA-seq) | no | yes |

Three real CIGARs from this alignment:

**`150M`** — the whole 150 bp read aligned end to end.

> **M does not mean "match".** It means *aligned*, mismatches included. A read with ten
> substitutions still reports `150M`. To find mismatches you need the `NM` tag or the MD
> string. Assuming `150M` means a perfect match is a genuine and common error.

**`5M1I144M`** — 5 aligned, then one base present in the read but not the reference (an
insertion), then 144 aligned:

```
read:  ACGTA C TTGCA...        (150 bases: 5 + 1 + 144)
ref:   ACGTA – TTGCA...        (149 reference bases consumed)
```

Read bases consumed: 5 + 1 + 144 = 150 ✓ (must equal read length)
Reference bases consumed: 5 + 144 = 149 (I consumes no reference)

**`4S146M`** — the first 4 bases did not align and were soft-clipped; 146 aligned. The clipped
bases are still in the SEQ field. Soft clipping at read starts often means residual adapter;
heavy soft clipping concentrated at one reference position is a structural-variant signature.

> **The statistics here.** "Concentrated at one position" is a comparison against a background
> rate, not an eyeball judgement. Clips caused by adapter or bad read ends fall more or less at
> random along the genome, so the number of clips starting at any one base is a count of rare
> events in a small window — Poisson, with the mean being the background rate
> ([S2](../part-S-statistics/S2-distributions.md)). With 200,000 reads spread over 4.6 Mb, that
> mean is a small fraction of one clip per base, so five or ten clips at the *same* coordinate is
> not something the background produces. Read it as a ratio, observed over expected at that base;
> the raw number of clipped reads on its own says nothing. Poisson assumes a constant rate, and
> that fails here in the usual direction — mappability and repeats make some positions clip-prone,
> so a caller compares against local background, not a genome-wide average.

**Verify the invariant yourself** — read-consuming operations must sum to read length:

```bash
samtools view aln.bam | head -2000 | awk '{
  n=0; c=$6; while (match(c, /[0-9]+[MIS=X]/)) {
    n += substr(c, RSTART, RLENGTH-1) + 0; c = substr(c, RSTART+RLENGTH)
  }
  if (n != length($10) && $6 != "*") print "MISMATCH:", $1, $6, n, length($10)
}' | head
```

Silence means every CIGAR is internally consistent. (Hard-clipped records are the exception —
`H` removes bases from SEQ, so those legitimately differ.)

## 6. Mapping quality

MAPQ is column 5. It is **not** alignment quality — it estimates the probability that the read
was placed in the *wrong location*:

MAPQ = −10 log₁₀ P(placement is wrong)

So MAPQ 60 ≈ one in a million; MAPQ 0 means the aligner found equally good placements elsewhere
and cannot choose.

> **The statistics here.** MAPQ is a probability written on a log scale. The aligner treats each
> candidate location's alignment score as a log-likelihood and turns the gap between the best and
> the runner-up into P(wrong location) — evidence as a likelihood ratio, then a posterior over
> locations, which is the machinery of [S6](../part-S-statistics/S6-likelihood-and-bayes.md), not a
> p-value. To read it, divide by 10 and take that negative power of ten: 10 → 1 in 10 wrong, 20 →
> 1 in 100, 30 → 1 in 1,000, 60 → 1 in a million. Two assumptions carry it, and both leak. The
> probability is *conditional on the candidate set the aligner actually looked at*, and a
> conditional probability is only as good as the thing conditioned on
> ([S1](../part-S-statistics/S1-probability.md)) — a read whose true locus is missing from the
> reference can score a confident 60 at the wrong place. And the constant that converts a score gap
> into a probability is fitted by each tool against its own simulations, which is why the numbers
> do not travel between aligners.

```bash
samtools view aln.bam | awk '{print $5}' | sort -n | uniq -c | sort -rn | head -6
```

MAPQ 0 reads are not bad reads. They are usually *perfectly good* reads from repetitive
sequence — the read is real, the placement is unknowable. Variant callers discard them, which
is why repeats are systematically invisible to short-read sequencing regardless of how deep you
sequence ([Ch 42](../part-09-genomics/42-read-alignment.md)).

> **MAPQ is not comparable across aligners.** BWA's 60 and Bowtie2's 42 do not mean the same
> thing; each tool has its own scale and cap. Any threshold you set is tool-specific.

## 7. Coverage

```bash
samtools coverage aln.bam
```

```
#rname       startpos  endpos   numreads  covbases  coverage  meandepth  meanbaseq  meanmapq
NC_012967.1  1         4629812  199861    4590373   99.1482   6.04763    31.6       58.5
```

Two different quantities, routinely conflated:

- **coverage 99.15%** — *breadth*: the fraction of the genome with at least one read
- **meandepth 6.05×** — *depth*: average reads per position

You predicted 6.5× in lab-01; you got 6.05×, the gap being unmapped reads. Prediction confirmed.

Note the 0.85% of the genome with zero coverage even at 6× — mostly repetitive regions where
reads exist but cannot be placed, plus a little GC-extreme sequence lost in library prep.

> **The statistics here.** Depth and breadth are linked by a model, not by definition. If reads
> landed independently and uniformly, the number covering a given base would be Poisson with mean
> equal to the depth, so the uncovered fraction would be e^(−depth) — the Lander–Waterman
> calculation ([S2](../part-S-statistics/S2-distributions.md)). At 6.05× that predicts 0.24%
> uncovered, and the real figure above is 0.85%: a 3.6-fold miss. Read the gap as a verdict on the
> assumption rather than on the arithmetic. The Poisson rate is not constant along a genome, so
> depth is *overdispersed* — variance over mean is 1.49 on this BAM, not the 1 that Poisson
> requires — and both tails, including the zero-coverage tail, are heavier than predicted. S2 runs
> the check on this exact alignment and turns the correction into a sequencing budget.

---

## Check yourself

**1. A record has FLAG 147. Decompose it and say what the read is.**

<details><summary>Answer</summary>

147 = 128 + 16 + 2 + 1 = second in pair + reverse strand + proper pair + paired.

It is the reverse-strand mate of a properly paired read — the partner of a FLAG 99 record.
Confirm with `samtools flags 147` → `PAIRED,PROPER_PAIR,REVERSE,READ2`.

</details>

**2. `samtools view -c` reports more records than you have reads. Explain, and give the correct command.**

<details><summary>Answer</summary>

Supplementary (2048) and secondary (256) alignments each add records without adding reads. A
read spanning a junction can be split into a primary plus one or more supplementary alignments.

```bash
samtools view -c -F 2304 aln.bam
```

2304 = 256 + 2048 excludes both. In this dataset that turns 201,312 records back into the
200,000 reads you actually put in.

</details>

**3. A read has CIGAR `20S130M` and MAPQ 60. What happened, and is it a problem?**

<details><summary>Answer</summary>

Twenty bases at the start did not align and were soft-clipped; the remaining 130 aligned
confidently (MAPQ 60 means the aligner is sure of the *location*).

Whether it is a problem depends on the cause. Residual adapter or low-quality read ends are
benign and handled by trimming. But if many reads soft-clip at the *same reference coordinate*,
that is a structural-variant signature — a breakpoint where the sample's genome diverges from
the reference, so reads align up to the junction and no further. Clustered soft clips are one
of the main signals SV callers use.

</details>

**4. Why does a MAPQ 0 read not indicate a low-quality read?**

<details><summary>Answer</summary>

MAPQ measures confidence in *placement*, not in the bases. A MAPQ 0 read can have perfect base
qualities and align with zero mismatches — it simply aligns equally well in several places,
typically because it comes from a repeat. The sequence is trustworthy; its origin is not
determinable.

This is an information limit rather than an algorithmic one: a read shorter than the repeat it
falls in cannot be placed by any method. It is the fundamental argument for long reads.

</details>
