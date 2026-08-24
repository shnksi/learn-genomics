# Problem set 10 — Genomics and sequencing maths

Covers [Ch 39–45](../part-09-genomics/39-genome-landscapes.md).

**Attempt before revealing.** Almost every wrong answer here is a units or convention error —
haploid or diploid, reads or read pairs, 0-based or 1-based — and reading the solution first hides
exactly the slip you needed to make yourself.

Problems are roughly in order of difficulty. ★ marks the two hardest.

---

## 1. Coverage, forwards and backwards

An Illumina run produces **320 million read pairs** at 2 × 150 bp. The human haploid reference is
3.1 Gb.

**(a)** Compute mean depth.
**(b)** How many read pairs give 30× on the human genome? How many single-end 150 bp reads give
30× on *E. coli* (4.6 Mb)?
**(c)** *Trap.* A colleague reports 15.5× for the run in (a). Give the **two different** mistakes
that each produce exactly that number.
**(d)** An exome run gives 50 million pairs at 2 × 100 bp, 70% of bases on target, target 35 Mb.
Compute mean on-target depth, and say why that is the wrong number to report.

<details><summary>Solution</summary>

**(a)** *C* = *NL*/*G*.

Bases sequenced = 320 × 10⁶ × 2 × 150 = 320 × 10⁶ × 300 = **9.6 × 10¹⁰ bp**

*C* = 9.6 × 10¹⁰ / 3.1 × 10⁹ = **30.97× ≈ 31×**

**(b)** *N* = *CG*/*L*.

Human: (30 × 3.1 × 10⁹)/300 = 9.3 × 10¹⁰/300 = **3.1 × 10⁸ read pairs**

*E. coli*: (30 × 4.6 × 10⁶)/150 = 1.38 × 10⁸/150 = **920,000 reads**

For scale: a 30× human genome is 93 Gb of sequence, and a NovaSeq X 25B flow cell delivers ≈ 8 Tb
([verified facts](../reference/verified-facts.md)), so 8 × 10¹²/9.3 × 10¹⁰ ≈ **86 genomes per flow
cell**.

**(c)** Both mistakes introduce a factor of 2, so the number alone cannot say which you made.

1. **Dividing by 6.2 Gb.** 9.6 × 10¹⁰/6.2 × 10⁹ = 15.5×. Depth is per *reference* base and the
   reference is haploid — reads from both homologues pile onto the same coordinates. 30× means 30
   reads per position, roughly 15 from each parental copy.
2. **Treating 320 million as reads.** 320 × 10⁶ × 150/3.1 × 10⁹ = 15.5×.

Write units on every quantity: `pairs`, `bp/pair`, `bp/haploid genome`.

**(d)** On-target bases = 50 × 10⁶ × 200 × 0.70 = **7.0 × 10⁹**

Mean on-target depth = 7.0 × 10⁹/3.5 × 10⁷ = **200×**

A mean is undisturbed by a heavy left tail. GC-rich first exons drop out of amplified libraries, so
a 200× mean exome routinely leaves a few per cent of target below 10×. Report **the fraction of
target at or above a threshold** — "97.8% of target ≥ 20×" — because the failure mode is a
confident homozygous-reference call where the patient is heterozygous: a silent false negative,
invisible to any mean.

</details>

---

## 2. Lander–Waterman and the Poisson gap

**(a)** Derive *P*(a base has zero coverage) = *e*^−*C*, stating the assumptions.
**(b)** Compute the uncovered fraction and expected uncovered bases in 3.1 Gb at *C* = 1, 5, 10, 30.
**(c)** At what depth does the model predict fewer than one uncovered base genome-wide?
**(d)** At 10× with 150 bp reads, how many contiguous islands are expected?
**(e)** *Trap.* The model says 22× suffices, industry uses 30×, and a real 30× genome is ~95%
callable. Reconcile all three.

<details><summary>Solution</summary>

**(a)** Take *N* reads of length *L* from a genome of length *G*, start positions independent and
uniform. A read covers base *x* iff it starts in the *L*-wide window ending at *x*, so
*P*(one read covers *x*) = *L*/*G*. The count covering *x* is Binomial(*N*, *L*/*G*), and with *N*
large and *L*/*G* tiny this is Poisson with λ = *NL*/*G* = *C*. Hence

*P*(zero) = *e*^−λ = **_e_^−_C_**   and   E[uncovered] = *G e*^−*C*

Assumptions: uniform independent starts, no mappability constraint, reads present or absent with no
quality gradation. All three are false — see (e).

**(b)**

| *C* | *e*^−*C* | Uncovered bases in 3.1 Gb |
|---|---|---|
| 1 | 0.3679 | 3.1 × 10⁹ × 0.3679 = **1.14 Gb** |
| 5 | 6.738 × 10⁻³ | 3.1 × 10⁹ × 6.738 × 10⁻³ = **20.9 Mb** |
| 10 | 4.540 × 10⁻⁵ | 3.1 × 10⁹ × 4.540 × 10⁻⁵ = **141 kb** |
| 30 | 9.358 × 10⁻¹⁴ | 3.1 × 10⁹ × 9.358 × 10⁻¹⁴ = **0.0003 bp** |

Thirteen orders of magnitude for a thirtyfold cost increase — which is why coverage alone cannot
justify 30×.

**(c)** *G e*^−*C* < 1 ⟹ *C* > ln(3.1 × 10⁹) = ln 3.1 + 9 ln 10 = 1.131 + 20.723 = **21.85 ≈ 22×**

**(d)** *N* = 10 × 3.1 × 10⁹/150 = 2.067 × 10⁸ reads. Islands = *N e*^−*C*:

2.067 × 10⁸ × 4.540 × 10⁻⁵ = **≈ 9,400**

At 10× only 141 kb is untouched, yet the touched part sits in 9,400 disconnected pieces.
**Covered is not assembled** ([Ch 43](../part-09-genomics/43-genome-assembly.md)).

**(e)** Three questions, three answers.

- **22× answers "is every base touched?"** — breadth of ≥1×, which nobody needs.
- **30× answers "can I genotype a heterozygote?"** At local depth *d*, *P*(all reads from one
  parental haplotype) = 2·(½)^*d* = 2^(1−*d*). At *d* = 10 that is 2⁻⁹ = 1.95 × 10⁻³, so across
  ~3 million het sites, 3 × 10⁶ × 1.95 × 10⁻³ ≈ **5,900 sites silently called homozygous**. At
  *d* = 30, 2⁻²⁹ = 1.86 × 10⁻⁹ → 0.006 sites. Seeing both alleles costs roughly triple.
- **95% answers "how much can I call?"** and the missing 5% is not depth. GC bias and chromatin
  effects make real depth overdispersed relative to Poisson (negative binomial is the working
  model), and reads in repeats get MAPQ ≈ 0 and are discarded however many there are. **More of the
  same reads cannot fix a mappability problem** — the whole argument for long reads and pangenomes.

The Poisson model is not wrong. It answers a question that stopped mattering at 15×.

</details>

---

## 3. Phred scores, both directions

**(a)** Convert Q20, Q30, Q40 to error probabilities, and *P* = 0.002, *P* = 5 × 10⁻⁴ back to Q.
**(b)** Expected errors in a 150 bp read at Q30, and the fraction of such reads that are entirely
error-free. Repeat at Q20.
**(c)** How many miscalled bases in a 30× human genome at Q30, against how many true variants?
**(d)** *Trap.* A FASTQ quality line reads `BBBFFFFFHHHH`. Compute expected errors in those 12
bases under Phred+33 and under Phred+64, and say how you decide which is right.

<details><summary>Solution</summary>

**(a)** *Q* = −10 log₁₀ *P* ⟺ *P* = 10^(−*Q*/10).

Q20 → **0.01**; Q30 → **0.001**; Q40 → **0.0001**.

*P* = 0.002: log₁₀ 2 − 3 = 0.30103 − 3 = −2.699 → *Q* = **26.99 ≈ 27**
*P* = 5 × 10⁻⁴: log₁₀ 5 − 4 = 0.69897 − 4 = −3.301 → *Q* = **33.01 ≈ 33**

**(b)** Expected errors is linear in length and needs no independence:

150 × 0.001 = **0.15 errors per read**

The error-free *fraction* does need independence:

(0.999)¹⁵⁰ = *e*^(150 × −0.0010005) = *e*^−0.15008 = **0.8607**

So 86.1% are clean and **13.9% of Q30 reads carry at least one error**.

At Q20: expected errors = **1.5**, and (0.99)¹⁵⁰ = *e*^(150 × −0.0100503) = *e*^−1.5075 =
**0.2215** — only 22% clean.

**(c)** Bases at 30× = 30 × 3.1 × 10⁹ = 9.3 × 10¹⁰.

Miscalls = 9.3 × 10¹⁰ × 10⁻³ = **9.3 × 10⁷ ≈ 93 million wrong bases**

A genome carries roughly 4–5 million true variant sites (approximate teaching figure), so the run
commits about **20 error events for every variant site** — 9.3 × 10⁷ miscalled bases against
4.5 × 10⁶ sites.

**Do not turn that into a per-read prior**: it compares read-level *events* with genome-level
*sites*, and the units do not match. To ask what a single non-reference base means, put both sides
in read-level observations. Each site is read ~30 times, and a heterozygote shows the alternate
allele in only half of those reads, so with a ~2 : 1 het : hom mix the non-reference *observations*
number

4.5 × 10⁶ × 30 × ⅔ = **9.0 × 10⁷**

against 9.3 × 10⁷ errors — **≈ 1 : 1** (0.9 : 1 to 1.4 : 1 across het fractions 0.5 to 1.0). A single
non-reference base is a coin flip, not a 20 : 1 favourite for error — which is why variant calling is
inference across the whole pileup, not a lookup on one read.

**(d)** `B` = ASCII 66, `F` = 70, `H` = 72, with counts 3, 5, 4.

**Phred+33** (*Q* = ASCII − 33 → 33, 37, 39):

10^−3.3 = 5.012 × 10⁻⁴, 10^−3.7 = 1.995 × 10⁻⁴, 10^−3.9 = 1.259 × 10⁻⁴

3(5.012 × 10⁻⁴) + 5(1.995 × 10⁻⁴) + 4(1.259 × 10⁻⁴)
= 1.504 × 10⁻³ + 9.977 × 10⁻⁴ + 5.036 × 10⁻⁴ = **3.00 × 10⁻³ errors**

**Phred+64** (*Q* = 2, 6, 8):

10^−0.2 = 0.6310, 10^−0.6 = 0.2512, 10^−0.8 = 0.1585

3(0.6310) + 5(0.2512) + 4(0.1585) = 1.893 + 1.256 + 0.634 = **3.78 errors**

Ratio = 3.783/0.003005 = **1,259**, and that is forced: every *Q* differs by exactly 31, so every
error probability differs by 10^(31/10) = 1,258.9. The mistake does not distort the file unevenly —
it multiplies the whole thing by a constant. Read a Phred+64 file as Phred+33 and an untrustworthy
base is presented as excellent: trimming removes nothing, the caller believes everything, and you
get confident garbage with no error anywhere.

**Deciding.** The safe rule is **one-sided**: any character below `:` (ASCII 58) *proves* Phred+33,
since Phred+64 cannot encode below 64. Here the minimum is `B` = 66, so nothing is proved — but the
circumstantial case is strong, because runs of `B` are the hallmark of the 2004–2011 Illumina era,
where `B` was the "read segment quality control indicator", a base the instrument was flagging as
untrustworthy (Q2 on +64). Under +33 the same byte reads as Q33, a good base.

The mirror rule — "characters above `J` prove Phred+64" — used to work and is now **wrong**, because
long-read platforms legitimately emit qualities above Q40. Assume Phred+33 unless the data predates
2011, and check the minimum character ([Ch 41](../part-09-genomics/41-data-formats.md)).

</details>

---

## 4. N50, NG50, and metrics that reward vandalism

An assembly of an organism whose genome size is independently estimated at **4.0 Mb** yields ten
contigs, lengths in kb:

```
800, 600, 450, 350, 250, 200, 150, 100, 60, 40
```

**(a)** Define N50 in one sentence, then compute N50 and L50, showing sort and cumulative sum.
**(b)** Compute NG50 and LG50.
**(c)** *Trap.* You discard every contig shorter than 250 kb. Recompute both.
**(d)** The scaffolder wrongly fuses the 450 and 350 kb contigs into one 800 kb contig. Recompute
both.
**(e)** When do N50 and NG50 diverge, and what should you report instead?

<details><summary>Solution</summary>

**(a)** **N50 is the length-weighted median contig length**: sort longest-first, accumulate, and
report the length of the contig at which the running total first reaches half the assembly.
Equivalently: *pick a random base of the assembly; N50 is the median length of the contig
containing it.* **L50** is how many contigs the walk took.

Total = 800 + 600 + 450 + 350 + 250 + 200 + 150 + 100 + 60 + 40 = **3,000 kb**. Half = 1,500 kb.

```
rank  length  cumulative
 1      800      800    < 1500
 2      600     1400    < 1500
 3      450     1850    ≥ 1500   ← stop
```

**N50 = 450 kb, L50 = 3.**

**(b)** NG50 walks to half the *estimated genome size*: 4,000/2 = 2,000 kb.

```
 1      800      800    < 2000
 2      600     1400    < 2000
 3      450     1850    < 2000
 4      350     2200    ≥ 2000   ← stop
```

**NG50 = 350 kb, LG50 = 4.**

NG50 < N50 because only 3.0 of 4.0 Mb was recovered. N50 divides by what you assembled; NG50 by
what exists. The missing 1.0 Mb — almost certainly repeat — is invisible to N50.

**(c)** Removing 200, 150, 100, 60, 40 discards 550 kb. Remaining: 800, 600, 450, 350, 250, total
**2,450 kb**, half = 1,225 kb.

```
 1      800      800    < 1225
 2      600     1400    ≥ 1225   ← stop
```

**N50 = 600 kb, L50 = 2.** NG50 is unchanged — the target is still 2,000 kb and the walk still
stops at 350: **NG50 = 350 kb, LG50 = 4**.

You **deleted 550 kb of correctly assembled sequence and the headline metric improved 33%**. N50's
denominator is the assembly's own size, so discarding data lowers the bar — and a minimum-length
filter is a routine pipeline step.

**(d)** New lengths: 800, 800, 600, 250, 200, 150, 100, 60, 40 — total still **3,000 kb**, since a
misjoin moves sequence rather than creating it. Half = 1,500 kb.

```
 1      800      800    < 1500
 2      800     1600    ≥ 1500   ← stop
```

**N50 = 800 kb, L50 = 2** (up from 450). NG50, walking to 2,000:

```
 1      800      800    < 2000
 2      800     1600    < 2000
 3      600     2200    ≥ 2000   ← stop
```

**NG50 = 600 kb, LG50 = 3** (up from 350).

**Both metrics rewarded the error** — do not take the wrong lesson from (c). NG50 is normalised by
genome size, not by correctness. Only **NGA50** is correctness-aware: it aligns to a trusted
reference, breaks contigs at every structural disagreement — snapping the false 800 back into 450
and 350 — and so refuses to credit the join.

**(e)** They diverge whenever assembly size ≠ genome size, and the sign is diagnostic. NG50 < N50
means sequence is **missing**, and the missing part is repeats, not a random sample. NG50 > N50 means
the assembly is **larger** than the genome, usually because both haplotypes were kept separate.

Report together: **contig N50 and NG50** (scaffold N50 counts gap `N`s as sequence — an assembly can
honestly show a 50 Mb scaffold N50 and a 200 kb contig N50), **NGA50**, and a completeness measure
such as BUSCO, which samples conserved single-copy genes and is blind to repeats — an assembly with
no centromere at all can still score ~99%.

</details>

---

## 5. ★ Read length against repeat length: an information limit

**(a)** A repeat of length *r* occurs at *n* identical copies. Argue from the likelihood why a read
shorter than *r* cannot be assigned to a copy by *any* algorithm.
**(b)** Quantify it in bits for a 150 bp read from inside an *Alu* (~300 bp, ~1.1 million copies).
**(c)** Compute the read length needed to resolve an *Alu*, a full-length LINE-1 (~6 kb), and an
alpha-satellite higher-order repeat array (0.1–5 Mb), assuming a 100 bp unique anchor each side.
**(d)** *Trap.* Copies are not identical. *SMN1* and *SMN2* differ at five positions across a
~4 kb interval. What fraction of 150 bp reads from that interval are informative?

<details><summary>Solution</summary>

**(a)** Let the read be *s* and the copies be at *x*₁ … *xₙ*. If the copies are identical over the
read's span then

*P*(*s* | *x*₁) = *P*(*s* | *x*₂) = … = *P*(*s* | *xₙ*)

because the emitting string is the same at every one. With a uniform prior, the posterior is
**uniform over the *n* copies**. The data are identical under all *n* hypotheses — not similar,
identical — so no statistic of the read separates them.

This is a claim about the data, not the software: a better aligner, more compute and more depth
change nothing. Assembly hits the same wall from the other side — the repeat becomes a graph node
with in-degree 2 and out-degree 2, and both Eulerian traversals are equally consistent with the
*k*-mer multiset ([Ch 43 §7](../part-09-genomics/43-genome-assembly.md)).

**(b)** Naming a position in 3.1 Gb on either strand costs

log₂(6.2 × 10⁹) = ln(6.2 × 10⁹)/ln 2 = 22.548/0.6931 = **32.5 bits**

Being uninformative among 1.1 × 10⁶ copies loses

log₂(1.1 × 10⁶) = 13.911/0.6931 = **20.1 bits**

leaving **12.5 bits** where 32.5 are needed — log₂(6.2 × 10⁹/1.1 × 10⁶) = 12.46, computed before
rounding rather than as 32.5 − 20.1. The aligner's honest output is MAPQ 0 — "nowhere in this
reference wins" ([Ch 42 §9](../part-09-genomics/42-read-alignment.md)).

The opposite bound: a specific *k*-mer is expected *G*/4^*k* times, so setting that to 1 gives
*k* = log₂(3.1 × 10⁹)/2 = 31.53/2 = **15.8 ≈ 16 bp**. Sixteen bases would suffice in a *random*
3.1 Gb sequence; the whole gap between 16 and 150 bp is the genome's repeat content.

**(c)** You must span the repeat *and* anchor in unique sequence: *L* ≥ *r* + 2 × anchor.

| Repeat | *r* | Read length needed | Platform |
|---|---|---|---|
| *Alu* | 300 bp | **500 bp** | No 150 bp read — but a 2 × 150 pair with a ~500 bp insert spans the *fragment*, which is why paired ends recover so much repeat space |
| Full-length LINE-1 | 6 kb | **6.2 kb** | PacBio HiFi (~15–25 kb) or ONT; impossible for Illumina |
| Alpha-satellite HOR array | 0.1–5 Mb | **100 kb – 5 Mb** | Nothing reads 5 Mb |

Yet T2T resolved those arrays — most of the ~8% of the genome previously inaccessible. The escape is
(d): HOR units are not identical, and ultra-long ONT reads (>100 kb) span enough *distinguishing*
positions to be placed without spanning the array. **The requirement is not "longer than the repeat"
but "long enough to reach from one distinguishing variant to the next."**

**(d)** Expected informative sites under a random 150 bp window:

5 × 150/4,000 = **0.1875**

Do not reach for Poisson here. Five sites spread across 4 kb sit ~800 bp apart, so no 150 bp window
can hold two: the count per read is 0 or 1, and the probability of at least one *is* the expectation.

*P*(at least one) = **0.1875 ≈ 19%**

(Poisson would give 1 − *e*^−0.1875 = 0.171 — the answer when sites are free to clump inside one
read, and a lower bound here, since it discounts the double-counting that cannot occur.)

So **~19% of reads are informative, ~81% are not**. Four-fifths of the data cannot say whether it
came from *SMN1* or *SMN2*, and the diagnosis of spinal muscular atrophy — which turns on *SMN1*
copy number — rests on the remaining fifth.

The corollary matters more than the case: **mappability is worst precisely where the variation is
newest.** Old *Alu* copies have diverged 5–20% and map fine — ~89% of annotated TE sequence is
uniquely mappable at 100 bp paired-end. The unmappable remainder is the young subfamilies
(*Alu*Ya5, *Alu*Yb8), exactly the copies still polymorphic and most worth genotyping.

</details>

---

## 6. Coordinate conventions

**(a)** A GFF3 exon reads `chr7 ... exon 1000000 1000150`. Give its length, its BED
representation, and the BED length.
**(b)** Convert BED `chr7  5000  5300` to 1-based inclusive; give the length in both conventions.
**(c)** *Trap.* A script tests membership as `chromStart <= POS < chromEnd`, passing a **VCF**
`POS` straight in. Work out which variants it keeps and drops for the exon in (a), and name the
variant class this systematically destroys.
**(d)** An exome BED has 220,000 intervals totalling 35 Mb. A script computes length as
`end - start + 1`. How wrong is the reported target size, absolutely and relatively?

<details><summary>Solution</summary>

The conventions number **different objects**:

```
0-based ticks     0   1   2   3   4   5   6   7   8
   (interbase)    |   |   |   |   |   |   |   |   |
                  | A | C | G | T | A | C | G | T |
1-based numbers     1   2   3   4   5   6   7   8
```

0-based half-open names the **boundaries between** bases; 1-based inclusive names the **bases**.

**(a)** GFF3 is 1-based inclusive, so length = *e* − *s* + 1 = 1,000,150 − 1,000,000 + 1 =
**151 bp**.

BED is 0-based half-open — the start decrements, the end does not:

```
chr7    999999    1000150
```

BED length = *e* − *s* = 1,000,150 − 999,999 = **151 bp** ✓

**That asymmetry is the entire conversion.** Adjusting *both* endpoints is the commonest form of the
bug, and it is nasty precisely because it leaves the length correct while shifting the interval by
one base — passing every sanity check you would think to write.

**(b)** BED length = 5,300 − 5,000 = **300 bp**. 1-based inclusive: start 5,001, end 5,300, i.e.
`chr7 5001 5300`, length 5,300 − 5,001 + 1 = **300 bp** ✓

**(c)** The script compares a 1-based number against 0-based boundaries, so it keeps
`999999 ≤ POS ≤ 1000149` — in 1-based terms, bases **999,999 to 1,000,149** where the true exon is
**1,000,000 to 1,000,150**.

- **POS = 999,999**, one base upstream: `999999 ≤ 999999 < 1000150` → **kept, wrongly.**
- **POS = 1,000,000**, first exonic base: kept — correctly, by luck.
- **POS = 1,000,150**, *last* exonic base: `1000150 < 1000150` is false → **dropped, wrongly.**

The window is shifted one base. The systematic damage is at each exon's 3′ end, and the final exonic
bases are part of the 5′ splice-donor consensus — so this bug silently deletes exactly the
**splice-region variants**, an under-ascertained cause of Mendelian disease. Interval count and total
length are unchanged, nothing errors, and the callset is one base out of register 220,000 times. The
correct test is `chromStart <= (POS - 1) < chromEnd`.

**(d)** `end - start + 1` on a half-open interval overcounts by exactly 1 each time:

220,000 × 1 = **220,000 bp = 0.22 Mb**, reported as 35,220,000 instead of 35,000,000

Relative error = 220,000/35,000,000 = **0.63%** — too small to look like a bug, big enough that two
labs disagree about "the target size" and every per-base normalisation shifts.

Formats you would expect to agree do not: SAM's *text* `POS` is 1-based while BAM's *binary* `POS` is
0-based, which is why `samtools view` prints one more than the bytes contain. **A coordinate is not a
number; it is a number plus a convention plus a build**
([Ch 41 §6](../part-09-genomics/41-data-formats.md)).

</details>

---

## 7. Decoding the SAM FLAG

**(a)** Decode FLAG 99, 147, 339, 2145, 1187 and 77 into component bits.
**(b)** Compute the `-F` value excluding secondary and supplementary alignments, and say which of
the six it removes.
**(c)** Compute the `-F` value for the standard analysis-ready filter (exclude unmapped, secondary,
QC-fail, duplicate, supplementary), and say what `-f 2` adds.
**(d)** A BAM has 640,000,000 primary, 21,000,000 supplementary and 8,000,000 secondary records. By
what percentage does a naive `samtools view -c` overstate the read count?

<details><summary>Solution</summary>

| Bit | Dec | Meaning | | Bit | Dec | Meaning |
|---|---:|---|---|---|---:|---|
| `0x1` | 1 | paired | | `0x20` | 32 | mate reverse |
| `0x2` | 2 | proper pair | | `0x40` | 64 | read 1 |
| `0x4` | 4 | this segment unmapped | | `0x80` | 128 | read 2 |
| `0x8` | 8 | mate unmapped | | `0x100` | 256 | secondary |
| `0x10` | 16 | this segment reverse | | `0x200` | 512 | failed QC |
| | | | | `0x400` | 1024 | duplicate |
| | | | | `0x800` | 2048 | supplementary |

**(a)** Decompose greedily from the largest bit down.

**99** = 64 + 35 = 64 + 32 + 3 = **64 + 32 + 2 + 1** → paired, proper pair, mate reverse, read 1,
itself forward.

**147** = 128 + 19 = 128 + 16 + 3 = **128 + 16 + 2 + 1** → paired, proper pair, *this* read
reverse, read 2. The partner of 99.

**339** = 256 + 83 = **256 + 64 + 16 + 2 + 1** → a **secondary** alignment of read 1, reverse,
proper pair.

**2145** = 2048 + 97 = **2048 + 64 + 32 + 1** → a **supplementary** alignment of read 1, mate
reverse. Bit 2 is not set: a split alignment is not a proper pair.

**1187** = 1024 + 163 = **1024 + 128 + 32 + 2 + 1** → a **duplicate**, properly paired read 2,
forward, mate reverse. Strip 1024 and it is an ordinary good alignment — duplicates are *marked*,
not deleted, because the duplicate rate is itself a QC signal.

**77** = 64 + 13 = **64 + 8 + 4 + 1** → paired, this segment unmapped, mate unmapped, read 1. Its
partner is 141 = 128 + 8 + 4 + 1.

The distinction people get wrong: **secondary** (`0x100`) is "this *whole* read also aligns here, but
somewhere scored better" — a rival hypothesis. **Supplementary** (`0x800`) is "*part* of this read
aligns here and another part elsewhere" — a split alignment, which is how structural variants and
fusion transcripts present, so discarding them discards your SV evidence.

**(b)** OR the bits into one integer: 256 + 2048 = **2304** (`0x900`).

`-F` excludes a record if **any** bit in the mask is set (`-f` requires **all** bits set). So 2304
removes **339** and **2145** and keeps 99, 147, **1187** and **77** — the trap being that a duplicate
and an unmapped read survive. Passing `-F 256 -F 2048` is not the same thing; whether a repeated
`-F` ORs or overwrites is version-dependent, so compute the mask yourself.

**(c)** 4 + 256 + 512 + 1024 + 2048 = **3844** (`0xF04`; check: 15 × 256 = 3840, + 4 = 3844 ✓).

Applied to the six it removes **77** (4), **339** (256), **2145** (2048) and **1187** (1024), leaving
**99 and 147** — the one intact pair.

`-f 2` additionally *requires* the proper-pair bit. Use it with care: the pairs it removes are the
discordant ones, which are precisely the signal for a structural variant.

**(d)** Records = 640 × 10⁶ + 21 × 10⁶ + 8 × 10⁶ = **669 × 10⁶**

Overstatement = 29 × 10⁶/640 × 10⁶ = **4.53%**

A SAM record is a *hypothesis about a placement*, not a read, so counting records counts hypotheses.
Feed 669 million into a coverage calculation and you report 32.4× for a genome actually at 31.0×.

</details>

---

## 8. ★ Why assembly costs so much more than alignment

You have 30× Illumina coverage (2 × 150 bp, ε = 0.001 per base) of a 3.1 Gb genome, choosing
between aligning to a reference and assembling *de novo* with a de Bruijn graph at *k* = 31.

**(a)** Count the 31-mers: instances in the genome, size of the 31-mer space, and an estimate of
the *distinct* count.
**(b)** Estimate the memory to hold that graph, and compare with an aligner's index.
**(c)** *Trap.* Add the reads' errors. How many *spurious* distinct 31-mers, and what does that do
to (b)?
**(d)** Justify the *k* trade-off quantitatively at *k* = 31, 61, 101.
**(e)** Repeat (c) at ε = 0.05 and draw the architectural conclusion.

<details><summary>Solution</summary>

**(a)** **Instances**: *G* − *k* + 1 = 3.1 × 10⁹ − 30 = **3,099,999,970 ≈ 3.1 × 10⁹**.

**Space**: 4³¹ = 2⁶² = **4.61 × 10¹⁸** possible 31-mers, of which the genome occupies
3.1 × 10⁹/4.61 × 10¹⁸ = **6.7 × 10⁻¹⁰**. The space is empty, which is why *k*-mer sets are hashed
rather than arrayed, and why a 31-mer seen twice means real repetition rather than coincidence —
problem 5 put the expected-unique threshold at *k* ≈ 16.

**Distinct**: fewer than the instances, since exactly repeated sequence collapses. ~46% of the genome
is TE-derived, but most copies have diverged by several per cent and a 31-mer collapses only if all
31 bases match. Taking ~80% of instances gives ≈ **2.5 × 10⁹ distinct 31-mers** (approximate teaching
figure; the exact count depends on the assembly and on canonicalisation).

**(b)** 31 bases × 2 bits = 62 bits → **8 bytes** packed, + a 4-byte count = 12 bytes payload; a hash
table at ~50% load roughly doubles it → **~24 bytes per distinct *k*-mer**.

2.5 × 10⁹ × 24 = 6.0 × 10¹⁰ B = **~60 GB**

An aligner's FM-index of GRCh38 is on the order of **5 GB**, built once and shared read-only. The
asymmetry is structural: **alignment** holds one fixed index and *streams* reads past it, so memory
is O(*G*) regardless of data volume; **assembly** must hold the entire *k*-mer spectrum of the data
at once, because it cannot know which *k*-mers connect until it has seen them all, so memory is
O(distinct *k*-mers) — which grows with errors as well as with genome size.

**(c)** *N* = 30 × 3.1 × 10⁹/150 = **6.2 × 10⁸ reads**, carrying 9.3 × 10¹⁰ bases.

Errors = 9.3 × 10¹⁰ × 0.001 = **9.3 × 10⁷**

Each substitution falls inside up to *k* = 31 *k*-mers, each a novel string appearing nowhere else,
so spurious distinct *k*-mers ≤ 9.3 × 10⁷ × 31 = **2.88 × 10⁹**.

**The error *k*-mers outnumber the true ones.** Memory becomes

(2.5 × 10⁹ + 2.9 × 10⁹) × 24 = 5.4 × 10⁹ × 24 = 1.30 × 10¹¹ B ≈ **130 GB**

Hence every assembler counts *k*-mers before building anything. A true *k*-mer is seen *c_k* ≈ 24
times at 30× (see (d)); an error *k*-mer is seen once, since the same error recurring at the same
position has probability ~ε. The count histogram is **bimodal** — a spike at 1–2 and a Poisson-ish
peak at *c_k* — so discarding singletons drops memory back to ~60 GB while removing almost nothing
real. For a diploid there are *two* true peaks, heterozygous at *c_k*/2 and homozygous at *c_k*,
whose total estimates genome size — which is where problem 4's independent estimate comes from.

**(d)** Three quantities move together as *k* rises. **Repeat resolution improves**: two copies of an
exact repeat of length *r* stay separate only if *r* ≤ *k* − 2 (at *r* = *k* − 1 the repeat *is* a
node, with the fatal 2-in/2-out structure). **Effective coverage falls**:
*c_k* = *c*(*L* − *k* + 1)/*L*. **Error survival falls exponentially**: *P*(*k*-mer error-free)
≈ (1 − ε)^*k*. At *c* = 30, *L* = 150, ε = 0.001:

| *k* | (*L*−*k*+1)/*L* | *c_k* | (1−ε)^*k* |
|---|---|---|---|
| 31 | 120/150 = 0.80 | **24×** | 0.999³¹ = **0.970** |
| 61 | 90/150 = 0.60 | **18×** | 0.999⁶¹ = **0.941** |
| 101 | 50/150 = 0.33 | **10×** | 0.999¹⁰¹ = **0.904** |

At *k* = 101 the true peak sits at 10×, no longer comfortably separable from the error spike, and 10%
of *k*-mers are corrupted. The rule is not "bigger *k* until memory runs out" — it is *k* large
enough to break repeats, small enough that true *k*-mers stay confidently more abundant than error
ones. That window widens with coverage and widens dramatically with accuracy. And *k* is hard-capped
by read length: you cannot extract a 202-mer from a 150 bp read, so problem 5's information limit
returns as a parameter constraint.

**(e)** Errors = 9.3 × 10¹⁰ × 0.05 = 4.65 × 10⁹, so spurious *k*-mers ≤ 4.65 × 10⁹ × 31 =
**1.44 × 10¹¹** — about 1.44 × 10¹¹/2.5 × 10⁹ ≈ **58× more error *k*-mers than true ones**. And

(0.95)³¹ = *e*^(31 × −0.05129) = *e*^−1.590 = **0.204**

only **20%** of 31-mers from such a read are error-free. The singleton filter cannot save you; the
true peak is buried.

So de Bruijn assembly is the right formalism for **many short accurate reads** and the wrong one for
long noisy reads — where the answer is an **overlap / string graph** that keeps each read coherent
(precisely what *k*-merisation discards) and tolerates 5% error because overlap detection is
approximate matching, not exact hashing. HiFi then arrived at >99.9% consensus with 15–25 kb reads
and made large *k* viable, which is how routine T2T-quality assembly happened.

The final choice is not about cost. Alignment inherits **reference bias**: it finds only what the
reference already contains. Assembly costs an order of magnitude more memory and buys the ability to
see sequence in nobody's reference — which is what the pangenome effort exists to systematise
([Ch 45](../part-09-genomics/45-reference-genomes-and-pangenomes.md)).

</details>

---

## Where you went wrong

| Error pattern | What to re-read |
|---|---|
| Divided sequenced bases by the diploid genome, or counted pairs as reads | Problem 1(c) — both halve the answer |
| Reported mean exome depth as the coverage statistic | Problem 1(d) — report fraction of target above a threshold |
| Took *e*^−*C* < 1 base to mean the genome is callable | Problem 2(e) — breadth, genotyping and mappability are three questions |
| Assumed more depth cures a mappability problem | Problem 2(e), [Ch 40 §6](../part-09-genomics/40-sequencing-technologies.md) |
| Read "Q30" as a guarantee, or assumed the FASTQ offset | Problem 3(d) — the offset rule is one-sided |
| Quoted N50 as a quality metric | Problem 4(c), 4(d) — deleting sequence raises it, and so does a misjoin |
| Treated NG50 as protection against misassembly | Problem 4(d) — only NGA50 is correctness-aware |
| Blamed the aligner for MAPQ 0 inside a repeat | Problem 5(a) — the information is not in the read |
| Adjusted *both* endpoints in a coordinate conversion | Problem 6(a) — only the start moves |
| Compared a 1-based `POS` against 0-based BED bounds | Problem 6(c) — the loss is splice-region variants |
| Counted SAM records as reads, or split a mask across two `-F` flags | Problem 7(b), 7(d) |
| Assumed bigger *k* is always better | Problem 8(d) — repeat resolution against coverage and error survival |
