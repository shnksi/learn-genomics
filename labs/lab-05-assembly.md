# Lab 05 — Genome assembly and what N50 hides

> **Time:** ~45 min (assemblies run in background) · **Before this:** [lab-02](lab-02-alignment.md), [Ch 43](../part-09-genomics/43-genome-assembly.md)

Assemble a real bacterial genome from short reads at three depths, and watch assembly
contiguity respond to coverage. The headline finding is not that more coverage is better — it
is *where* the returns stop.

All numbers below were produced on this machine with SPAdes 4.3.0.

```bash
# GENOMICS is exported in lab-00. In a fresh shell, set it again:
#   export GENOMICS=/path/to/learn-genomics
cd "$GENOMICS" && source .venv/bin/activate && cd labs/data
```

---

## 1. Get enough data

[lab-00](lab-00-setup.md) fetched 100,000 read pairs — about 6.5× coverage, fine for alignment
and far too little for assembly. Assembly needs every base sampled several times *and* enough
overlap to link contigs. Fetch a million pairs:

```bash
for m in 1 2; do
  curl -sL "https://ftp.sra.ebi.ac.uk/vol1/fastq/SRR258/003/SRR2584863/SRR2584863_${m}.fastq.gz" \
    | gunzip -c 2>/dev/null | head -n 4000000 | gzip > big_R${m}.fastq.gz
done
```

1,000,000 pairs × 2 × 150 bp ÷ 4,629,812 bp = **64.8×**.

> **The statistics here.** "64.8× coverage" is an *average*, and the average is not the quantity
> that decides whether an assembly works — where the reads land is. The standard model treats each
> base as covered by a Poisson number of reads with λ = depth, assuming reads start independently
> and uniformly along the genome (Lander–Waterman,
> [S2 §2](../part-S-statistics/S2-distributions.md)). The number to read off it is the fraction of
> the genome no read touches, e^(−λ): about 0.15% at 6.5×, effectively zero past 20×. Gaps close
> *exponentially* in depth, which is most of why the ladder below behaves as it does. Treat the
> prediction as optimistic, though — real E. coli coverage is overdispersed, with variance about
> 1.5× the mean instead of equal to it, because λ varies with GC content and mappability, and the
> measured gap fraction runs several-fold above the Poisson figure.

Make three subsets so you can compare:

```bash
for n in 100000 300000 1000000; do
  for m in 1 2; do
    gunzip -c big_R${m}.fastq.gz | head -n $((n*4)) | gzip > sub_${n}_R${m}.fastq.gz
  done
done
```

## 2. Assemble

```bash
for n in 100000 300000 1000000; do
  spades.py --isolate -1 sub_${n}_R1.fastq.gz -2 sub_${n}_R2.fastq.gz \
            -o asm_${n} -t 6 -m 16 > asm_${n}.log 2>&1
done
```

`--isolate` is the right mode for a high-coverage single-isolate bacterial library. Run these in
the background — the deepest takes a few minutes.

SPAdes builds **de Bruijn graphs at several k-mer sizes** and combines them. Small *k* tolerates
sequencing error and low coverage but collapses repeats; large *k* resolves repeats but needs
deeper, cleaner data. Using several and merging is how modern assemblers avoid choosing.

## 3. Define N50 — and compute it by hand first

**N50 is the contig length at which half the assembly is in contigs of that length or longer.**
Equivalently: sort contigs longest to shortest, walk down accumulating length, and report the
length of the contig that takes you past 50% of the total.

Work a toy example before trusting a tool. Contigs: 100, 80, 60, 40, 20 kb. Total = 300 kb, half
= 150 kb.

```
sorted:   100    80    60    40    20      (kb)
cumsum:   100   180   240   280   300
                 ^
          first to reach or exceed 150
```

**N50 = 80 kb.** Note it is a *length*, not a count, and not an average — the mean here is
60 kb, and the median is 60 kb. N50 is deliberately weighted toward large contigs.

> **The statistics here.** N50 is a **length-weighted median**: pick a random assembled *base*, ask
> how long the contig holding it is, and N50 is the median of that distribution. That is exactly why
> it is not the median contig length — the unweighted median gives a 200 bp fragment and a 300 kb
> contig one vote each, the weighted one gives the contig 1,500 times the say, and contig lengths are
> so right-skewed that the two summaries differ by an order of magnitude. Read it as: *half the
> assembled sequence sits in contigs this long or longer.* It assumes nothing about a distribution,
> but it does assume the contig set it is computed over is the one you care about — which is the
> assumption §5 shows you can game. And it is a description of the assembly in front of you, not an
> estimate of a population quantity, so there is no standard error on it and nothing to test.
> [S3 §2](../part-S-statistics/S3-sampling-and-estimation.md) is about what makes one summary of a
> dataset preferable to another.

Compute it for the real assemblies:

```bash
python - <<'PY'
import glob
for path in sorted(glob.glob('asm_*/contigs.fasta')):
    lens, cur = [], 0
    for line in open(path):
        if line.startswith('>'):
            if cur: lens.append(cur)
            cur = 0
        else:
            cur += len(line.strip())
    if cur: lens.append(cur)
    lens.sort(reverse=True)
    total = sum(lens); run = 0
    for L in lens:
        run += L
        if run >= total/2:
            n50 = L; break
    print(f"{path:34s} contigs={len(lens):5d}  total={total:,}  N50={n50:,}  max={lens[0]:,}")
PY
```

## 4. The result ★

| pairs | coverage | contigs | total bp | **N50** | largest | % of reference |
|---|---|---|---|---|---|---|
| 100,000 | 6.5× | 2,280 | 4,390,748 | **4,197** | 21,703 | 94.8% |
| 300,000 | 19.4× | 620 | 4,600,202 | **81,541** | 348,079 | 99.4% |
| 1,000,000 | 64.8× | 469 | 4,602,642 | **90,951** | 240,438 | 99.4% |

Reference: 4,629,812 bp.

Three things to read off this, none of them obvious in advance:

**Returns stop early.** N50 improves **19-fold** going from 6.5× to 19.4×, then only
**1.1-fold** going from 19.4× to 64.8× — despite the second step adding more than three times as
much data. Once coverage is sufficient to see every base several times, additional reads do not
buy contiguity; they only confirm what you already had. Sequencing more is the wrong lever past
that point.

> **The statistics here.** Two different limits are visible in that table, and telling them apart is
> the whole skill. Below ~20× the binding constraint is *sampling* — whether every base was seen at
> all — which is the Poisson e^(−λ) calculation from §1 and shrinks exponentially with depth
> ([S2 §2](../part-S-statistics/S2-distributions.md)). Above it the binding constraint is
> *structural*: repeats longer than a read, which no quantity of the same reads touches. The general
> form of that is worth carrying out of this lab — **more data shrinks sampling error and does
> nothing at all to a systematic limitation**
> ([S3 §7](../part-S-statistics/S3-sampling-and-estimation.md)). So read a curve that flattens as a
> diagnosis rather than a disappointment: it is telling you which regime you are in, and therefore
> whether more of the same data is worth buying.

**Total assembly length saturates before N50 does.** At 19.4× the assembly already recovers
99.4% of the genome's length. What deeper sequencing improved was not *how much* was assembled
but *how few pieces* it was in — 620 contigs down to 469.

> **The largest contig gets SMALLER at higher coverage** — 348 kb at 19.4× down to 240 kb at
> 64.8×. This looks like a regression and is not. With more data the assembler has more evidence
> of ambiguity, so it stops joining sequence it cannot justify joining and breaks the contig at
> the uncertain point instead. The 348 kb contig was partly a *guess*. Assemblers trade
> contiguity against correctness, and a longer contig is not automatically a better one.

That last point is why N50 must never be reported alone.

## 5. Why N50 alone misleads

N50 has three failure modes, all exploitable:

**It rewards throwing data away.** N50 is computed over the assembly you produced. Discard every
contig under 10 kb and N50 rises, while the assembly gets *worse* — you have lost real sequence.

**It rewards over-joining.** An assembler that aggressively merges contigs across repeats
produces longer contigs and a better N50, along with misjoins that put sequence in the wrong
place. Section 4 shows the honest behaviour: the more careful assembly has the shorter maximum.

**It is not comparable across assemblies of different total length.** Two assemblies with the
same N50 but totals of 4.6 Mb and 3.0 Mb are not equally good.

**NG50** fixes the third problem by taking 50% of the *estimated genome size* rather than 50% of
the assembly:

```bash
python - <<'PY'
GENOME = 4629812
import glob
for path in sorted(glob.glob('asm_*/contigs.fasta')):
    lens, cur = [], 0
    for line in open(path):
        if line.startswith('>'):
            if cur: lens.append(cur)
            cur = 0
        else: cur += len(line.strip())
    if cur: lens.append(cur)
    lens.sort(reverse=True)
    def at(target):
        run = 0
        for L in lens:
            run += L
            if run >= target: return L
        return 0
    print(f"{path:34s} N50={at(sum(lens)/2):>8,}  NG50={at(GENOME/2):>8,}")
PY
```

When an assembly recovers nearly all of the genome the two nearly coincide; when it is missing a
large fraction, NG50 drops below N50 and exposes it. Always report NG50 when the genome size is
known, and always report total length and contig count alongside either.

## 6. Check the assembly against the reference

Contiguity says nothing about correctness. Align the assembly back:

```bash
minimap2 -x asm5 rel606.fa asm_1000000/contigs.fasta > asm_vs_ref.paf 2>/dev/null
wc -l < asm_vs_ref.paf          # 1092 alignment blocks
awk '{a+=$11} END {printf "sum of block lengths: %d (%.2f%% of reference)\n", a, 100*a/4629812}' asm_vs_ref.paf
```

That prints **100.93% of the reference**, which is impossible — and the impossibility is the
lesson. Summing PAF block lengths **double-counts**: repetitive contigs align to several places,
and contig ends overlap. To get genuine breadth you must merge intervals first:

```bash
awk 'BEGIN{OFS="\t"} {print $6,$8,$9}' asm_vs_ref.paf | sort -k1,1 -k2,2n \
  | bedtools merge -i - \
  | awk '{cov += $3-$2} END {printf "covered: %d bp (%.2f%% of reference)\n", cov, 100*cov/4629812}'
```

```
covered: 4609090 bp (99.55% of reference)
```

**99.55%**, not 100.93% — the naive sum overstated breadth by 1.38 percentage points. Of the
1,092 alignment blocks, 1,024 are under 6 kb, which is the signature of contigs terminating at
repeat boundaries rather than tiling the genome cleanly.

> Any "percentage covered" computed by summing alignment lengths rather than merging intervals
> is wrong, and wrong in the optimistic direction. It is one of the most common quiet errors in
> genomics reporting — the number looks plausible unless it happens to exceed 100% and gives
> itself away.

> **The statistics here.** Those are two *estimators* of one quantity — the fraction of the reference
> the assembly covers. Summing block lengths assumes the blocks are disjoint; they are not, so what
> it really computes is total aligned length, counting a base once per alignment that touches it.
> Merging first computes the union, which is what "breadth" means. The gap between them is **bias**,
> not noise: it does not average out over more alignment blocks, it does not shrink if you align more
> data, and it grows with the repetitiveness of the genome, since repeats are precisely what put
> several blocks over one base. The bias/variance split, and the fact that sample size cures only the
> second, is [S3 §2 and §7](../part-S-statistics/S3-sampling-and-estimation.md). Note that the only
> reason this instance got caught is that it crossed 100%; the same estimator reporting 80% would
> have gone straight into a paper.

Then ask where the breaks are:

```bash
sort -k6,6 -k8,8n asm_vs_ref.paf | awk '{print $6"\t"$8"\t"$9"\t"$1}' | head -20
```

Contig boundaries cluster at repeats. In *E. coli* the usual culprits are the seven ribosomal
RNA operons — each ~5 kb and nearly identical, so a 150 bp read falling inside one cannot be
assigned to a particular copy.

## 7. The repeat limit is information, not engineering

**A repeat longer than your read length cannot be resolved by any assembler.** This is not a
software deficiency; the information is absent from the data.

```bash
python -c "
for rl, name in [(150,'Illumina paired'), (2000,'Sanger'), (15000,'PacBio HiFi'), (100000,'ONT ultra-long')]:
    print(f'{name:18s} read {rl:>6,} bp -> resolves repeats shorter than ~{rl:,} bp')
"
```

*E. coli*'s rRNA operons are ~5 kb. A 150 bp read cannot span one; a 15 kb HiFi read spans it
comfortably with unique flanking sequence on both sides. That single fact — not accuracy, not
throughput — is why long reads produce dramatically better assemblies, and why telomere-to-
telomere human assembly had to wait for ultra-long reads rather than more Illumina
([Ch 43](../part-09-genomics/43-genome-assembly.md)).

At 64.8× we reached 469 contigs. No amount of additional short-read sequencing would get to one
chromosome, because every remaining break is at a repeat longer than 150 bp.

---

## Check yourself

**1. Compute N50 for contigs of 50, 40, 30, 20, 10 kb.**

<details><summary>Answer</summary>

Total = 150 kb, half = 75 kb.

```
sorted:   50    40    30    20    10
cumsum:   50    90   120   140   150
                ^ first to reach 75
```

**N50 = 40 kb.**

Note the mean is 30 kb and the median is 30 kb. N50 exceeds both, by design.

</details>

**2. Assembly A: N50 = 90 kb, total 4.6 Mb. Assembly B: N50 = 150 kb, total 3.1 Mb. Both from the same 4.6 Mb genome. Which is better?**

<details><summary>Answer</summary>

**A**, clearly — and this is exactly what N50 alone would get wrong.

B has a better N50 but has assembled only 3.1 Mb of a 4.6 Mb genome: a third of the genome is
simply missing. Its higher N50 partly reflects that the difficult, fragmented regions were lost
rather than assembled into short contigs, which *raises* N50 while making the assembly worse.

NG50 exposes this. Against a 4.6 Mb genome, B's NG50 is computed at the 2.3 Mb mark of a 3.1 Mb
assembly, dragging it down sharply, while A's NG50 ≈ its N50. This is the case NG50 exists for.

</details>

**3. Going from 19.4× to 64.8× more than tripled the data and improved N50 by only 1.1×. Why, and what should you spend the money on instead?**

<details><summary>Answer</summary>

Because at ~20× the limiting factor is no longer *sampling* — every base is already seen
repeatedly — it is **repeats**. The remaining breaks are at sequences longer than the read
length, and reads shorter than the repeat carry no information capable of resolving it. Adding
more of the same reads adds no new information about those junctions.

Spend it on **read length**, not read count. A modest amount of long-read data (PacBio HiFi or
nanopore) spanning the rRNA operons would collapse hundreds of contigs into a handful — a far
larger gain than tripling short-read depth achieved. Hybrid assembly, using long reads for
structure and short reads for base accuracy, is the standard approach for exactly this reason.

</details>

**4. Your assembly's largest contig shrank when you added data. Should you be worried?**

<details><summary>Answer</summary>

No — it is usually a sign of *improvement*.

With more coverage the assembler has more evidence about which joins are ambiguous. Where it
previously had too little data to notice a conflict and joined straight through a repeat, it now
sees the ambiguity and breaks the contig rather than guessing. The long contig it produced
before was partly unsupported.

This is the fundamental trade-off: contiguity versus correctness. An assembler tuned to maximise
N50 will happily produce misjoins. Judge an assembly by aligning it back to a reference or by
checking for structural inconsistency, not by contig length — which is also why benchmarks
report misassembly counts alongside N50.

</details>
