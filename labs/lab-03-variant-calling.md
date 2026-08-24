# Lab 03 — Variant calling, and the cost of the wrong reference

> **Time:** ~40 min · **Before this:** [lab-02](lab-02-alignment.md), [Ch 46](../part-10-functional-genomics/46-variant-calling.md)
>
> **No statistics background assumed.** Where this lab leans on probability — genotype posteriors,
> Poisson coverage, binomial allele sampling — a short box explains the model on the spot and
> points into the statistics track ([S1](../part-S-statistics/S1-probability.md),
> [S2](../part-S-statistics/S2-distributions.md)). You can read them after the lab, not before.

Call variants from the alignment you built, read a VCF field by field, and then run the single
most instructive experiment in this lab sequence: **call the same reads against the wrong
reference and watch the answer change by three orders of magnitude.**

```bash
# GENOMICS is exported in lab-00. In a fresh shell, set it again:
#   export GENOMICS=/path/to/learn-genomics
cd "$GENOMICS" && source .venv/bin/activate && cd labs/data
```

---

## 1. Call variants

```bash
bcftools mpileup -f rel606.fa aln.bam -q 20 -Q 20 --threads 2 \
  | bcftools call -mv --ploidy 1 -Ov > raw.vcf
```

Real time: **~3.6 s**.

What the flags mean, and why each matters:

| Flag | Effect |
|---|---|
| `-q 20` | Skip alignments with MAPQ < 20 — discard reads whose *placement* is uncertain |
| `-Q 20` | Skip bases with base quality < 20 — discard bases whose *identity* is uncertain |
| `-m` | Multiallelic caller |
| `-v` | Output variant sites only, not every reference position |
| `--ploidy 1` | *E. coli* is haploid — one allele per site, not two |

`--ploidy 1` is not cosmetic. The caller's genotype model computes a posterior over possible
genotypes; with ploidy 2 it evaluates {0/0, 0/1, 1/1} and can call spurious heterozygotes in an
organism that cannot have any. Getting ploidy wrong is a modelling error, not a formatting one.

> **The statistics here.** The caller is not counting reads against a threshold. For each site it
> computes a **posterior probability for every candidate genotype** — P(genotype | reads) ∝
> P(reads | genotype) × P(genotype) — and reports the winner. Its assumptions are worth naming:
> reads are independent given the genotype, each base quality *is* that base's error probability,
> and there is a prior for how often a variant occurs at all. The prior is why a single odd read
> does not become a call, and the quality-weighted likelihood is why two sites with identical
> depth and identical allele fraction can be called differently — the model reads the quality
> string, a counting rule cannot. What comes out is the most probable genotype plus QUAL, the
> confidence that the site is non-reference.
> [S6](../part-S-statistics/S6-likelihood-and-bayes.md) builds exactly this calculation in §7.1,
> by hand, on two real sites from this lab sequence's *E. coli* alignment;
> [S1](../part-S-statistics/S1-probability.md) is Bayes' theorem itself,
> prior → likelihood → posterior.

```bash
grep -vc '^#' raw.vcf
```

**66** raw variant records.

## 2. Filter

```bash
bcftools filter -i 'QUAL>=30 && DP>=5' raw.vcf -Ov > filt.vcf
grep -vc '^#' filt.vcf
```

**14** variants survive.

QUAL ≥ 30 means P(no variant here) ≤ 0.001, on the same Phred scale as base quality
([lab-01](lab-01-sequences-and-fastq.md)). DP ≥ 5 requires at least five reads — at ~6× mean
depth, a site with 2 reads is a site where you cannot distinguish a real variant from two
sequencing errors.

> **The statistics here.** Read QUAL as a **posterior probability on a log scale**, not as a
> p-value: QUAL = −10 log₁₀ P(no variant | reads), so 30 means P(no variant) ≤ 0.001 and every
> extra 10 divides that by ten. The distinction matters. A posterior answers "given these reads
> and the caller's prior, how likely is it that nothing is here?"; a p-value would answer "how
> often would data this extreme arise if nothing were here?" — a different question with a
> different denominator, and the two are not interchangeable
> ([S4 §3](../part-S-statistics/S4-hypothesis-testing.md)). Choosing where to cut is choosing
> which error you would rather make: raise the threshold and you discard true variants, lower it
> and you keep artefacts — the type I / type II trade-off of
> [S4 §4](../part-S-statistics/S4-hypothesis-testing.md). Note also that QUAL is only as good as
> the model behind it, so it cannot flag a failure of that model; §5 is a whole VCF of high-QUAL
> calls answering the wrong question.

Filtering removed 79% of raw calls. That ratio is normal and is the point of filtering: the
caller's job is to be sensitive, and yours is to decide what to believe.

## 3. Read a VCF record by hand ★

```bash
grep -v '^#' filt.vcf | head -1
```

```
NC_012967.1  9972  .  T  G  84.4  .  DP=5;VDB=0.66971;SGB=-0.556411;MQ0F=0;AC=1;AN=1;DP4=0,0,0,4;MQ=60
```

Field by field:

| Field | Value | Meaning |
|---|---|---|
| CHROM | `NC_012967.1` | Reference sequence |
| POS | `9972` | **1-based** position. VCF is 1-based inclusive; BED is 0-based half-open |
| ID | `.` | No known database identifier |
| REF | `T` | Reference allele |
| ALT | `G` | Alternate allele observed |
| QUAL | `84.4` | Phred confidence a variant exists — P(no variant) ≈ 4 × 10⁻⁹ |
| FILTER | `.` | No filters applied at this stage |
| INFO | ... | Everything else, as key=value |

The INFO fields that carry real information:

- **`DP=5`** — total read depth. Five reads is thin; treat with care.
- **`MQ=60`** — mean mapping quality. High, so the reads are confidently placed.
- **`DP4=0,0,0,4`** — the crucial one: reference-forward, reference-reverse, alt-forward,
  alt-reverse. Here **0,0,0,4** means four reads support the alternate allele, *all on the
  reverse strand*, and zero support the reference.

> **Read DP4 on every variant you care about.** All alternate reads on one strand is a
> **strand bias** signature, and strand bias is the classic fingerprint of an artefact rather
> than a real variant. A genuine variant should be seen from both directions in roughly the
> proportion the reads were sampled. This variant's 0,0,0,4 is a warning sign — with only four
> supporting reads it could be chance, but at higher depth it would be disqualifying.

> **The statistics here.** Strand bias is a **binomial** question. If the variant is real, each
> supporting read independently comes off one strand or the other, so the forward-strand count is
> Binomial(*n* alternate reads, *p* ≈ ½), and you ask how improbable the observed split is under
> that model. That is why depth carries the whole judgement above: an all-on-one-strand split has
> probability 2 × (½)ⁿ, which is 0.125 at *n* = 4 — unremarkable — and 0.008 at *n* = 8. The
> assumption that fails in practice is *p* ≈ ½: capture chemistry, amplification and mapping can
> genuinely skew the strand proportion at a particular locus, which is why DP4 is a prompt for
> suspicion rather than a test you can apply at a fixed cut-off.
> [S2 §1.3](../part-S-statistics/S2-distributions.md) covers the binomial and the exact binomial
> test you would use to put a number on a split like this.

Compare with a healthier call:

```bash
grep -v '^#' filt.vcf | awk '$2==2999330'
```

```
NC_012967.1  2999330  .  G  A  225.4  .  DP=10;...;DP4=0,0,2,7;MQ=60
```

Nine alternate reads split 2 forward / 7 reverse, QUAL 225.4, depth 10. Much more convincing.

## 4. What kinds of variants?

```bash
bcftools view -v snps   filt.vcf | grep -vc '^#'    # 12
bcftools view -v indels filt.vcf | grep -vc '^#'    # 2
```

The two indels are worth looking at:

```
NC_012967.1  433359   CTTTTTTT -> CTTTTTTTT    INDEL;IDV=5;IMF=1;DP=5
NC_012967.1  4431393  TGG      -> T            INDEL;IDV=10;IMF=1;DP=10
```

The first is an insertion of one `T` into a run of seven `T`s. **Homopolymer runs are where
indel calls are least reliable** — polymerase slippage during both library amplification and
sequencing generates length errors in exactly these tracts, so a called indel in a homopolymer
deserves more scepticism than one in complex sequence.

Note also how VCF represents indels: not as "insert T at 433360", but by giving REF and ALT
alleles that share an anchoring base. The same indel can be written at several positions in a
repeat, which is why **normalisation** (`bcftools norm`) must happen before you compare two VCFs
— otherwise identical variants appear to disagree ([Ch 41](../part-09-genomics/41-data-formats.md)).

## 5. The experiment: what the wrong reference costs ★★

These reads are from the **Lenski long-term evolution experiment**, which uses *E. coli* B
strain REL606. We aligned to REL606 and found 14 variants.

*E. coli* K-12 MG1655 is the far more famous lab strain and the default choice for anyone who
types "E. coli reference genome" into a search box. It is a **different strain of the same
species**. Try it:

```bash
curl -sL -o k12.fa.gz \
  "https://ftp.ncbi.nlm.nih.gov/genomes/all/GCF/000/005/845/GCF_000005845.2_ASM584v2/GCF_000005845.2_ASM584v2_genomic.fna.gz"
gunzip -f k12.fa.gz && bwa index k12.fa

bwa mem -t 4 k12.fa ecoli_R1.fastq.gz ecoli_R2.fastq.gz 2>/dev/null \
  | samtools sort -@2 -o aln_k12.bam -
samtools index aln_k12.bam

bcftools mpileup -f k12.fa aln_k12.bam -q 20 -Q 20 --threads 2 \
  | bcftools call -mv --ploidy 1 -Ov > raw_k12.vcf
bcftools filter -i 'QUAL>=30 && DP>=5' raw_k12.vcf -Ov > filt_k12.vcf
grep -vc '^#' filt_k12.vcf
```

The result:

| Reference | Filtered variants |
|---|---|
| **B str. REL606** (correct) | **14** |
| **K-12 MG1655** (wrong strain, same species) | **19,209** |

**A 1,372-fold difference, from one decision.**

And here is what makes it dangerous: the K-12 run looks *fine*. It maps 93.68% of reads. Its
QUAL scores are high. Nothing errors, nothing warns. You would get a clean-looking VCF with
19,209 confident calls, almost all of which are not mutations at all — they are the fixed
sequence differences between two *E. coli* strains that diverged long before the experiment
began.

> **This is reference bias in its starkest form.** Variant calling does not report "differences
> from the truth". It reports **differences from whatever reference you supplied**. Every
> variant is a claim about a comparison, and the comparison is only as meaningful as the
> reference choice. In human genomics the same failure is subtler and more consequential:
> using a reference that poorly represents a sample's ancestry systematically inflates apparent
> variation and depresses sensitivity in the regions that differ most — which is the argument
> for pangenome references ([Ch 45](../part-09-genomics/45-reference-genomes-and-pangenomes.md)).

Clean up the extra files if you want the space back:

```bash
rm -f k12.fa* aln_k12.bam* raw_k12.vcf filt_k12.vcf
```

## 6. Depth is the binding constraint

"6× mean depth" is an average, and averages hide the thing that matters. Reads land on the
genome approximately at random, so per-site depth is roughly **Poisson** with λ = 6.05. Some
sites get twelve reads; some get one.

> **The statistics here.** Poisson is the default model for *counts in a window* when there are
> vast numbers of chances for an event and each is individually almost impossible — which is
> exactly a read landing on a given base. One parameter, λ, is both the mean and the variance;
> P(depth = *k*) = e^(−λ) λᵏ / *k*!, and the piece everyone uses is P(depth = 0) = e^(−λ), the
> uncovered fraction. Read a Poisson number as "what this depth would look like if reads landed
> independently at a constant rate." That constant rate is the assumption, and having only one
> parameter is what makes it easy to falsify: the variance cannot be tuned separately, so if real
> depth is more spread out than Poisson allows, the model is simply wrong — which is what the
> 0.85%-versus-0.24% comparison below demonstrates.
> [S2 §2](../part-S-statistics/S2-distributions.md) derives Poisson and checks it against this
> lab's alignment; [S2 §5](../part-S-statistics/S2-distributions.md) gives the negative binomial,
> the two-parameter fix for counts whose rate varies.

```bash
python - <<'PY'
from math import exp, factorial, comb
lam = 6.05
print("HAPLOID — the constraint is getting enough reads at all (Poisson):")
for k in range(6):
    print(f"  P(depth = {k}) = {exp(-lam)*lam**k/factorial(k):.4f}")
p_lt5 = sum(exp(-lam)*lam**k/factorial(k) for k in range(5))
print(f"  P(depth < 5) = {p_lt5:.4f}  -> ~{p_lt5*100:.0f}% of sites fail the DP>=5 filter")
print(f"  P(depth = 0) = {exp(-lam):.5f}  -> predicts {100*exp(-lam):.2f}% with no coverage")
PY
```

```
  P(depth < 5) = 0.2784  -> ~28% of sites fail the DP>=5 filter
  P(depth = 0) = 0.00236 -> predicts 0.24% with no coverage
```

**Roughly 28% of the genome is uncallable at this depth**, not because anything is wrong but
because the DP≥5 filter cannot be satisfied there. "No variant called" and "no variant present"
are different statements, and the gap between them is 28% of your genome.

Now compare the prediction against reality. `samtools coverage` reported 99.15% breadth, so
**0.85% had zero coverage — three and a half times the Poisson prediction of 0.24%.** That
excess is real information: read placement is *not* uniformly random. Repetitive regions
receive reads that cannot be placed (MAPQ 0, filtered out), and GC-extreme sequence is
under-represented by amplification bias. Real coverage is overdispersed relative to Poisson,
and the discrepancy tells you where.

**Why 30× for human germline?** Because humans are diploid, and at a heterozygous site each
read independently shows the reference or alternate allele with probability ½. *That* is a
genuine binomial sampling problem, and it is much less forgiving:

```bash
python -c "
from math import comb
for dp in (5,10,20,30):
    miss = sum(comb(dp,k)*0.5**dp for k in range(3))
    print(f'depth {dp:3d}: P(fewer than 3 ALT reads, i.e. het missed) = {miss:.4f}')
"
```

```
depth   5: P(het missed) = 0.5000
depth  10: P(het missed) = 0.0547
depth  20: P(het missed) = 0.0002
depth  30: P(het missed) = 0.0000
```

At depth 5 you would **miss half of all true heterozygous sites**. At 30× the sampling failure
rate is negligible, which is precisely why 30× became the convention — it is where allele
sampling stops being the limiting factor. Our haploid *E. coli* at 6× escapes this problem
entirely, because every read at a variant site carries the variant.

> **The statistics here.** The **binomial** counts successes in a fixed number of independent
> tries with a fixed success probability. Here the tries are the reads at the site, and "success"
> is sampling the alternate chromosome, so ALT count ~ Binomial(depth, ½) — the ½ coming from the
> genotype, not from the sequencer. Read the number above as a dropout rate: P(fewer than 3 ALT
> reads) is the probability a genuinely heterozygous site is *invisible in the data*, no matter
> how good the caller is. Nothing downstream can recover it. The assumption to watch is that
> *p* is exactly ½: ALT reads mismatch the reference and align slightly worse, so real *p* runs a
> little under ½ — reference bias — and the dropout rate rises faster than this table suggests.
> [S2 §1.3](../part-S-statistics/S2-distributions.md) has both the model and that correction.

---

## Check yourself

**1. A variant has `DP4=0,0,8,0` and QUAL 200. Should you trust it?**

<details><summary>Answer</summary>

No — treat it as probable artefact despite the high QUAL. All eight alternate reads are on the
forward strand and none on the reverse. A real variant in a randomly-fragmented library should
be observed from both strands in roughly the proportion the reads were sampled.

Complete strand bias at depth 8 is very unlikely by chance and points to a systematic artefact:
a strand-specific sequencing error, misalignment at a repeat edge, or damage introduced during
library preparation. High QUAL does not rescue it, because QUAL answers "is there a
non-reference signal here?" not "is that signal real biology?"

</details>

**2. Why does `--ploidy 1` matter for _E. coli_, beyond tidiness?**

<details><summary>Answer</summary>

Because the caller computes a posterior over candidate genotypes, and ploidy defines that set.
With ploidy 2 it evaluates {0/0, 0/1, 1/1} and can assign high probability to a heterozygous
call. *E. coli* is haploid and cannot be heterozygous, so every such call is wrong by
construction.

Worse, it is wrong in an interpretable-looking way: a site with mixed read support gets called
0/1 rather than triggering suspicion. In a bacterial sample, mixed support usually means
contamination, a mixed population, or a mapping artefact — all things you want flagged, not
smoothed into a plausible-looking heterozygote.

</details>

**3. The K-12 alignment mapped 93.68% of reads and produced high-QUAL calls. Why is that reassuring-looking output actually the danger?**

<details><summary>Answer</summary>

Because nothing failed. Both strains are *E. coli*, so most of the genome is similar enough for
reads to align well, and the mapping rate looks healthy. The 19,209 calls are genuine sequence
differences — they are just differences *between two strains*, not mutations that arose in the
experiment.

The failure is silent and semantic: the pipeline answered the question you asked ("how does this
sample differ from K-12?") rather than the question you meant ("what mutations arose during the
experiment?"). No QC metric distinguishes those, because both are perfectly valid comparisons.
Only knowing the biology does.

The general lesson: a variant call is meaningless without stating what it is a difference *from*.

</details>

**4. You need to compare two VCFs from different pipelines and get spurious disagreements at indel sites. What is the likely cause?**

<details><summary>Answer</summary>

Unnormalised representations. The same indel can be written at multiple positions in or beside
a repeat, with different REF/ALT strings that all describe the identical event — for example an
insertion into a homopolymer can legitimately be anchored at any base in the run.

Run `bcftools norm -f reference.fa` on both files first. It left-aligns indels to a canonical
position and splits multi-allelic records, after which identical variants have identical
representations. Comparing VCFs without normalising is one of the most common sources of
phantom discordance in benchmarking.

</details>
