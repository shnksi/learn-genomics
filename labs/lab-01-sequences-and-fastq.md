# Lab 01 — Sequences, FASTQ and quality

> **Time:** ~30 min · **Before this:** [lab-00](lab-00-setup.md), [Ch 41](../part-09-genomics/41-data-formats.md)

You will take real Illumina reads apart by hand, derive the Phred scale rather than looking it
up, and see for yourself why read quality decays along a read.

All outputs below are real, produced on the lab data during writing. Your numbers should match.

```bash
# GENOMICS is exported in lab-00. In a fresh shell, set it again:
#   export GENOMICS=/path/to/learn-genomics
cd "$GENOMICS"
source .venv/bin/activate
cd labs/data
```

---

## 1. The FASTQ record

Look at one:

```bash
gunzip -c ecoli_R1.fastq.gz | head -4
```

```
@SRR2584863.1 HWI-ST957:244:H73TDADXX:1:1101:4712:2181/1
TTCACATCCTGACCATTCAGTTGAGCAAAATAGTTCTTCAGTGCCTGTTTAACCGAGTCACGCAGG...
+
CCCFFFFFGHHHHJIJJJJIJJJIIJJJJIIIJJGFIIIJEDDFEGGJIFHHJIJJDECCGGEGII...
```

Four lines, always in this order:

| Line | Content |
|---|---|
| 1 | `@` then the read identifier |
| 2 | The bases |
| 3 | `+`, optionally repeating the identifier |
| 4 | One quality character **per base** — same length as line 2 |

The identifier is not arbitrary. `HWI-ST957:244:H73TDADXX:1:1101:4712:2181` encodes instrument,
run, flowcell, lane, tile, and x–y coordinates of the cluster on the flowcell. When you later
find that errors cluster on one tile or one edge of the flowcell, this is the field that tells
you.

> **The four-line record is a convention, not a guarantee.** Sequence and quality may in
> principle wrap across lines, and the `@` that starts a header is also a legal quality
> character — so you cannot reliably parse FASTQ by looking for lines beginning with `@`.
> Parsing in strict groups of four is what every real tool does. Writing your own line-based
> parser is a rite of passage that ends in a subtle bug.

## 2. Derive the Phred scale

Quality is encoded as one ASCII character per base. The rule:

**Q = −10 log₁₀(P_error)**, and the character is `chr(Q + 33)`.

The `+ 33` offset exists so that the values land in printable ASCII. Work it out:

```bash
python -c "
for q in (10,20,30,40):
    print(f'Q{q:<3d} P(err)={10**(-q/10):<8.4f} accuracy={100*(1-10**(-q/10)):.2f}%  char={chr(q+33)!r}')
"
```

```
Q10  P(err)=0.1000   accuracy=90.00%  char='+'
Q20  P(err)=0.0100   accuracy=99.00%  char='5'
Q30  P(err)=0.0010   accuracy=99.90%  char='?'
Q40  P(err)=0.0001   accuracy=99.99%  char='I'
```

Q30 — "one error in a thousand bases" — is the usual quality target, and now you know exactly
what it asserts.

> **The statistics here.** A Phred score is a probability written on a log scale:
> Q = −10 log₁₀ P(error), so Q30 asserts P(error) = 0.001 for *that single base call*. That is
> not a frequency you could ever check on one base — it is the instrument's degree of belief
> given the signal it saw, which is the reading of probability that
> [S1](../part-S-statistics/S1-probability.md) sets up. How to read it: every 10 points of Q
> divides the error probability by ten, and the claim is only checkable in aggregate — among all
> bases the instrument labels Q30, about 1 in 1,000 should really be wrong. That is an
> assumption, not a guarantee: Q is a model's output, and an uncalibrated model produces
> confident wrong numbers, which is exactly what the Phred+64 trap below does to it.

**The historical trap.** Older Illumina pipelines (pre-1.8) used an offset of 64, not 33. Feed
Phred+64 data to a tool expecting Phred+33 and every quality is inflated by 31 — nothing
crashes, and every downstream number is wrong. If you ever see quality characters below `!`
(33) or a suspiciously high mean, suspect the encoding. Modern data is Phred+33; archival data
may not be.

## 3. Basic statistics

```bash
seqkit stats ecoli_R1.fastq.gz ecoli_R2.fastq.gz
```

```
file               format  type  num_seqs     sum_len  min_len  avg_len  max_len
ecoli_R1.fastq.gz  FASTQ   DNA    100,000  15,000,000      150      150      150
ecoli_R2.fastq.gz  FASTQ   DNA    100,000  15,000,000      150      150      150
```

Uniform 150 bp — characteristic of Illumina, where read length is set by the number of
sequencing cycles, not by the molecule. Long-read platforms give a broad length distribution
instead; that difference alone tells you which technology produced a file.

**Compute the expected coverage before you align.** 100,000 reads × 2 mates × 150 bp =
30,000,000 bp of sequence against a 4,629,812 bp genome:

30,000,000 ÷ 4,629,812 ≈ **6.5×**

Doing this arithmetic *first* is a habit worth forming. If your alignment later reports a depth
wildly different from your prediction, something is wrong — and you will only notice if you had
a prediction.

> **The statistics here.** 6.5× is an *expected* depth — an average over the genome, not a
> promise about any particular base. The standard model (Lander–Waterman) makes the number of
> reads covering a given base Poisson with λ = depth, which is the right default because there
> are enormously many reads and each has a tiny chance of landing on that base
> ([S2](../part-S-statistics/S2-distributions.md)). Reading it that way gets you the spread for
> free, because Poisson has one parameter and its variance equals its mean: sd = √6.5 ≈ 2.5, so
> per-base depth runs from about 2 to 12, and e^(−6.5) ≈ 0.15% of bases are expected to get no
> read at all. Real coverage is worse than Poisson — S2 measures a variance-to-mean ratio of
> 1.49 on the alignment you build in [lab 02](lab-02-alignment.md), because λ is not constant
> along a genome.

## 4. GC content — a first sanity check

```bash
seqkit fx2tab -nlg ecoli_R1.fastq.gz | awk '{s+=$NF; n++} END {printf "reads GC:     %.2f%%\n", s/n}'
seqkit fx2tab -nlg rel606.fa       | awk '{printf "reference GC: %.2f%%\n", $NF}'
```

```
reads GC:     50.61%
reference GC: 50.77%
```

Within 0.16 percentage points. That agreement is meaningful: it says the library is not
grossly biased and the reads plausibly come from this organism. A large discrepancy would
suggest contamination, adapter read-through, or severe amplification bias against GC-extreme
regions.

> **The statistics here.** Both numbers are estimates of the same underlying quantity, and
> comparing them is a bias check rather than a test. With 100,000 reads the sampling error on
> the read GC is on the order of a hundredth of a percentage point — far below the 0.16 pp gap —
> so what is left over is systematic, not noise: mild GC bias in library prep, adapter, or
> unaligned contamination. Sampling error shrinks as 1/√n and bias does not shrink at all, which
> is the distinction [S3](../part-S-statistics/S3-sampling-and-estimation.md) builds the chapter
> around. So read this comparison for the *size* of the difference, never for whether it is
> "significant": at n = 100,000 every difference is significant, and only its magnitude tells
> you whether it matters.

*E. coli* at ~50.8% GC is unremarkable. Genomic GC ranges from under 20% to over 70% across
bacteria, and it is one of the fastest ways to notice you have the wrong organism.

## 5. Watch quality decay along the read ★

This is the most instructive measurement in the lab. Compute mean quality per sequencing cycle:

```bash
python - <<'PY'
import gzip
sums = [0]*150; n = 0
with gzip.open('ecoli_R1.fastq.gz', 'rt') as f:
    for i, line in enumerate(f):
        if i % 4 == 3:                        # line 4 of each record
            for j, c in enumerate(line.strip()[:150]):
                sums[j] += ord(c) - 33        # Phred+33 decode
            n += 1
            if n >= 20000: break
for cyc in (1, 10, 25, 50, 75, 100, 125, 150):
    q = sums[cyc-1]/n
    print(f"cycle {cyc:3d}: Q{q:5.1f}  P(error) = {10**(-q/10):.5f}  {'#'*int(q/2)}")
PY
```

```
cycle   1: Q 32.4  P(error) = 0.00057  ################
cycle  10: Q 38.0  P(error) = 0.00016  ##################
cycle  25: Q 39.0  P(error) = 0.00013  ###################
cycle  50: Q 35.7  P(error) = 0.00027  #################
cycle  75: Q 31.8  P(error) = 0.00066  ###############
cycle 100: Q 28.4  P(error) = 0.00143  ##############
cycle 125: Q 26.4  P(error) = 0.00230  #############
cycle 150: Q 22.9  P(error) = 0.00514  ###########
```

> **The statistics here.** Each printed Q is a sample mean — the average quality at that cycle
> over 20,000 reads — and it estimates the true per-cycle mean for this library
> ([S3](../part-S-statistics/S3-sampling-and-estimation.md) on estimators and standard error).
> Two things about reading it. The 20,000 are not a random sample of the file, just whatever sits
> at the top of it, so a problem confined to a few flowcell tiles would appear here as if it were
> a property of the whole run — sampling error is tiny at this n, but an unrepresentative sample
> is not sampling error. And because Q is a logarithm, averaging Q averages log probabilities:
> the printed `P(error)` is the *geometric* mean of the per-base error probabilities, which is
> always at or below their arithmetic mean. The true error rate at each cycle is therefore
> somewhat worse than the number shown, and increasingly so as the spread of qualities widens
> towards the end of the read.

Two features, both mechanistic:

**Quality rises over the first ~25 cycles.** The instrument calibrates its base-calling model on
early cycles, and cluster identification is still being refined. The first few bases are
slightly less reliable than cycle 25.

**Quality then falls steadily.** This is **dephasing**. Each cluster is ~1,000 supposedly
identical molecules read in lockstep, and the signal is their summed fluorescence. At every
cycle a small fraction of molecules fail to incorporate, or incorporate two bases. Those
molecules fall out of step, and since the errors accumulate, the fraction out of phase grows
with every cycle. The summed signal gets progressively noisier until it is no longer callable.

The error rate at cycle 150 (0.51%) is **forty times** that at cycle 25 (0.013%), the best cycle in
the read, and nine times that at cycle 1 (0.057%). This is why Illumina read length is capped where
it is: not by chemistry cost but by the point at which dephasing makes the signal unusable. It is
also why trimming low-quality read ends is standard, and why paired-end sequencing helps — the
second read starts fresh from the other end of the fragment.

## 6. Find the adapters

Reads from short fragments sequence past the insert into the adapter.

```bash
gunzip -c ecoli_R1.fastq.gz | awk 'NR%4==2' | grep -c "AGATCGGAAGAGC" || true
```

`AGATCGGAAGAGC` is the start of the standard Illumina TruSeq adapter. A high count means many
fragments were shorter than 150 bp and need trimming before alignment; adapter sequence does
not match the genome and will either fail to align or align badly.

## 7. Duplicates

```bash
gunzip -c ecoli_R1.fastq.gz | awk 'NR%4==2' | sort | uniq -d | wc -l
```

Identical sequences are usually PCR duplicates — the same original fragment amplified and
sequenced repeatedly. They are not independent observations, so they inflate apparent depth
without adding evidence, and they will bias variant calling if not marked. Note this counts
exact duplicates only; real duplicate marking uses alignment position, which catches duplicates
that differ by a sequencing error.

---

## Check yourself

**1. A quality string contains the character `#`. What is the base's error probability?**

<details><summary>Answer</summary>

`ord('#')` = 35, so Q = 35 − 33 = **2**.

P(error) = 10^(−2/10) = 10^(−0.2) ≈ **0.63**

A 63% chance of being wrong — essentially no information. `#` is Illumina's conventional marker
for a base it could not call at all, and you will see runs of them at the ends of poor reads.
Look back at the first record in section 1: it ends in a long run of `#`.

</details>

**2. You are told a FASTQ file has mean quality Q65. What is actually going on?**

<details><summary>Answer</summary>

Q65 corresponds to an error probability of 10^(−6.5) ≈ 3 × 10⁻⁷, which no sequencing platform
achieves per base. The file is almost certainly **Phred+64** encoded and being decoded as
Phred+33, inflating every value by exactly 31. Q65 − 31 = Q34, which is entirely plausible.

The diagnostic: check the range of quality characters actually present. Phred+33 data uses `!`
(33) upward; Phred+64 data starts at `@` (64) and never contains characters below it.

</details>

**3. Why does read quality *improve* over the first 25 cycles before declining?**

<details><summary>Answer</summary>

The instrument's base-calling model is calibrated on early cycles and cluster identification is
still being refined, so the first bases are called with a less well-tuned model. Once
calibration settles, quality peaks — and then dephasing takes over, because the fraction of
molecules within each cluster that have fallen out of step grows monotonically with cycle
number. The result is the characteristic rise-then-fall profile you measured.

</details>

**4. You predicted 6.5× coverage. The alignment reports 6.0×. Is that a problem?**

<details><summary>Answer</summary>

No — and knowing why is the point. Your prediction assumed every base of every read is placed
on the genome. Almost every *read* is: 99.27% of them map ([lab-02 §3](lab-02-alignment.md)).
But only 93.1% of the *bases* align. The difference is **soft-clipping** — 1,851,906 bases,
6.17% of the 30,000,000 you sequenced, are trimmed off read ends by the aligner because they
do not match (adapter remnants and low-quality 3′ tails), and clipped bases contribute no depth.
Reads that fail to map entirely account for only 217,650 bases, 0.73%.

**Reads mapped and bases aligned are different measurements, and coverage is built from the
second.** A pipeline can report a superb mapping rate and still lose 7% of its data.

A discrepancy in the *other* direction — measured depth much higher than predicted — would be
more suspicious, typically meaning the reference is smaller than you think or reads are piling
up in a repeat.

</details>
