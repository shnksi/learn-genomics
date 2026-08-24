# Lab 07 — Population structure, F_ST and LD decay

> **Time:** ~50 min · **Before this:** [Ch 26–29](../part-05-population-genetics/26-hardy-weinberg.md)
>
> **Statistics used here:** [S3 Sampling and estimation](../part-S-statistics/S3-sampling-and-estimation.md) ·
> [S4 Hypothesis testing](../part-S-statistics/S4-hypothesis-testing.md) ·
> [S5 Variance and regression](../part-S-statistics/S5-variance-and-regression.md) ·
> [S7 High-dimensional data](../part-S-statistics/S7-high-dimensional-data.md)

Work with real human genotypes from 1000 Genomes: measure population structure with PCA,
quantify differentiation with F_ST, and watch linkage disequilibrium decay differently by
ancestry. Every number below was produced on this machine.

You do not need the statistics track before starting — the commands run either way. Where a
method produces a number whose meaning is not obvious, a **The statistics here** box says what
the method assumes, how to read what it printed, and which S-chapter teaches it.

```bash
# GENOMICS is exported in lab-00. In a fresh shell, set it again:
#   export GENOMICS=/path/to/learn-genomics
cd "$GENOMICS" && source .venv/bin/activate && cd labs/data
export PATH="$HOME/bin:$PATH"
```

**Tool note.** PLINK2 is not a Homebrew formula. Get the native arm64 macOS build from
[cog-genomics.org/plink/2.0](https://www.cog-genomics.org/plink/2.0/) and put it on your `PATH`.
Version used here: `PLINK v2.0.0-a.6.1 M1`.

---

## 1. Fetch a region without downloading the chromosome

The full chr22 VCF is 185 MB. You need 1 Mb of it. `bcftools` can slice a remote indexed file
over HTTPS, transferring only the bytes for your region:

```bash
URL="https://ftp.1000genomes.ebi.ac.uk/vol1/ftp/data_collections/1000_genomes_project/release/20190312_biallelic_SNV_and_INDEL/ALL.chr22.shapeit2_integrated_snvindels_v2a_27022019.GRCh38.phased.vcf.gz"
bcftools view -r 22:20000000-21000000 "$URL" -Oz -o chr22_sub.vcf.gz
```

> **First attempt returns zero variants if you ask for `chr22:20000000-21000000`.** This file
> names its contig `22`, not `chr22`. Nothing errors — you get a valid VCF with 2,548 sample
> columns and no variant rows, which is exactly the kind of silent failure that wastes an
> afternoon. Check with `bcftools view -h "$URL" | grep '^##contig'` before assuming.
>
> The `chr` prefix split (UCSC uses `chr1`, Ensembl/1000G use `1`) is one of the most persistent
> nuisances in genomics ([Ch 41](../part-09-genomics/41-data-formats.md)).

Result: **29,700 variants × 2,548 samples**, 4.7 MB.

Get population labels:

```bash
curl -sL -o panel.txt \
  "https://ftp.1000genomes.ebi.ac.uk/vol1/ftp/release/20130502/integrated_call_samples_v3.20130502.ALL.panel"
awk 'NR>1{print $3}' panel.txt | sort | uniq -c
```

2,504 labelled samples across 26 populations grouped into five super-populations: AFR, AMR,
EAS, EUR, SAS.

## 2. Convert to PLINK2, and the ID trap

```bash
plink2 --vcf chr22_sub.vcf.gz --make-pgen --out chr22 --max-alleles 2 --snps-only
```

27,895 biallelic SNPs survive.

Now restrict to labelled samples. The obvious command **silently keeps nothing**:

```bash
awk 'NR>1{print $1"\t"$1}' panel.txt > keep.txt      # FID + IID — WRONG here
plink2 --pfile chr22 --keep keep.txt --out x
# --keep: 0 samples remaining.
```

Look at what PLINK2 actually wrote:

```bash
head -3 chr22.psam
```

```
#IID	SEX
HG00096	NA
HG00097	NA
```

**There is no FID column.** PLINK2 omits it when the source has no family structure, so a
two-column `--keep` file fails to match. The fix is one column:

```bash
awk 'NR>1{print $1}' panel.txt > keep.txt
```

> `--keep: 0 samples remaining` is a *warning-shaped* message for what is a fatal
> misunderstanding. PLINK1 always wrote FID+IID; PLINK2 does not. Always `head` your `.psam`
> before writing a keep or phenotype file.

## 3. QC

```bash
plink2 --pfile chr22 --keep keep.txt \
       --maf 0.01 --geno 0.05 --hwe 1e-6 \
       --make-pgen --out chr22_qc
```

```
--keep: 2503 samples remaining.
3564 variants remaining after main filters.
```

From 27,895 to **3,564**. That is a brutal-looking cut, and it is almost entirely `--maf 0.01`:
most variants in any 1 Mb of human sequence are rare, and rare variants carry little information
for structure or LD analysis while adding noise.

The three filters do different jobs:

| Filter | Removes | Why |
|---|---|---|
| `--maf 0.01` | variants below 1% frequency | underpowered for these analyses |
| `--geno 0.05` | variants missing in >5% of samples | assay failure |
| `--hwe 1e-6` | variants far from HWE | **genotyping error**, not biology ([Ch 26](../part-05-population-genetics/26-hardy-weinberg.md)) |

> **The statistics here.** `--hwe 1e-6` is a hypothesis test run once per variant. The null is that
> genotypes are a random pairing of alleles (*p*², 2*pq*, *q*²); the statistic is χ² with **one**
> degree of freedom — one and not two, because the allele frequency was estimated from the same
> counts ([S4](../part-S-statistics/S4-hypothesis-testing.md) §1–§2). Read the output as: a small
> p-value means the genotype counts sit further from HWE proportions than sampling noise alone
> explains. It says nothing about *why*, which is why the "genotyping error" column above is an
> interpretation, not a result. The threshold is 10⁻⁶ rather than 0.05 because thousands of variants
> are tested at once ([S4](../part-S-statistics/S4-hypothesis-testing.md) §7), and because in a
> pooled multi-ancestry sample the null is false everywhere by arithmetic: mixing groups with
> different allele frequencies creates a heterozygote deficit at every locus (the Wahlund effect).
> [S4](../part-S-statistics/S4-hypothesis-testing.md) §6 runs that scan on this very dataset and
> shows how much a pooled test over-rejects — the reason HWE QC properly belongs inside an
> ancestry-homogeneous stratum. The same section shows the χ² approximation breaking down at low
> MAF, where PLINK's exact test is the one to trust.

Note 2,503 of 2,504, not 2,504 — one panel sample is absent from this callset. Worth noticing
rather than shrugging at; unexplained sample loss is how cohorts quietly become non-representative.

## 4. PCA recovers ancestry from genotypes alone ★

```bash
plink2 --pfile chr22_qc --pca 10 --out chr22_pca
head -5 chr22_pca.eigenval
```

```
PC1  193.27
PC2  138.66
PC3  107.16
PC4   90.23
PC5   87.21
```

> **The statistics here.** PCA standardises every genotype column (subtract 2*p̂*, divide by the
> Hardy–Weinberg SD √(2*p̂*(1−*p̂*))), builds the genetic relationship matrix **K** = **XX**ᵀ/*M*
> whose entries are average allele-sharing between pairs of people, and takes its eigenvectors: PC1
> is the direction along which the samples spread most, PC2 the most spread left once PC1 is removed
> ([S7](../part-S-statistics/S7-high-dimensional-data.md) §5). What it assumes is that "spread" means
> variance along straight lines — nothing about populations, clusters or labels.
> **An eigenvalue is a variance, not a percentage:** 193.27 becomes "7.4% of total variance" only
> after dividing by the sum of all 2,503 eigenvalues, and S7 reproduces this exact `--pca` run to
> show it. Small leading percentages are normal, not a failure. Two things S7 §5 warns about on this
> same run: the PC scores below have arbitrary sign and no units, so only relative positions mean
> anything; and PC1 here draws four times its share of loading from a single 100 kb window, i.e. it
> is substantially one LD block rather than ancestry — which is why real analyses LD-prune and mask
> long-range LD regions before running PCA.

Now average each sample's PC scores by super-population — labels PLINK never saw:

```bash
python - <<'PY'
import collections
pop = {}
for i, row in enumerate(open('panel.txt')):
    if i == 0: continue
    f = row.split()
    if len(f) >= 3: pop[f[0]] = f[2]
agg = collections.defaultdict(lambda: [0, 0, 0])
for i, line in enumerate(open('chr22_pca.eigenvec')):
    if i == 0: continue
    f = line.split()
    sp = pop.get(f[0])
    if sp:
        agg[sp][0] += float(f[1]); agg[sp][1] += float(f[2]); agg[sp][2] += 1
for sp in sorted(agg):
    s = agg[sp]
    print(f"{sp}  n={s[2]:4d}  PC1={s[0]/s[2]:+.4f}  PC2={s[1]/s[2]:+.4f}")
PY
```

```
AFR  n= 660  PC1=+0.0141  PC2=-0.0268
AMR  n= 347  PC1=-0.0007  PC2=+0.0076
EAS  n= 504  PC1=+0.0008  PC2=+0.0133
EUR  n= 503  PC1=-0.0065  PC2=+0.0096
SAS  n= 489  PC1=-0.0126  PC2=+0.0072
```

The structure is there. PC1 separates AFR (+0.0141) from SAS (−0.0126) with the others between;
PC2 isolates AFR (−0.0268) from everyone else. **We supplied no labels** — PCA on a centred
genotype matrix found this from 3,564 SNPs on one megabase of chromosome 22.

The interpretation is exactly what the algebra dictates: the leading
eigenvectors of a genotype covariance matrix capture the largest axes of allele-frequency
variation, and the largest such axes in humans track ancestry — because ancestry is what
structures allele frequencies.

Two cautions that matter downstream:

- **The magnitudes are tiny** (~0.01–0.03). Structure is real and detectable but represents a
  small fraction of total variance — see §5.
- **This is precisely why GWAS uses PCs as covariates** ([Ch 51](../part-11-human-and-statistical-genomics/51-gwas.md)).
  Any trait that differs in prevalence between these groups will associate with every variant
  that differs in frequency between them, causally or not.

## 5. F_ST — and what it does not say

```bash
{ echo -e "#IID\tsuperpop"; awk 'NR>1 && ($3=="EUR"||$3=="AFR"){print $1"\t"$3}' panel.txt; } > superpop.txt
plink2 --pfile chr22_qc --pheno superpop.txt --fst superpop --out chr22_fst
cat chr22_fst.fst.summary
```

```
#POP1	POP2	HUDSON_FST
AFR	EUR	0.0647658
```

**F_ST(AFR, EUR) = 0.065** across 1,163 samples.

Read this carefully, because it is one of the most misreported numbers in science.

F_ST is *the proportion of total genetic variance attributable to differences between the
groups*. 0.065 means roughly **6.5% between, and therefore ~93.5% of variation is within
populations** — a result consistent in direction with Lewontin's 1972 finding and with every
replication since on larger marker sets.

Three things to hold simultaneously, all true:

1. **Most human genetic variation is within populations, not between them.** Pick two random
   people from the same population and two from different ones; the within-population pair are
   not much less different.
2. **F_ST is not zero, and the structure is real.** It is exactly what PCA recovered in §4, and
   ignoring it produces false positives in association studies.
3. **Neither fact settles anything about traits.** F_ST describes allele-frequency variance at
   the loci measured. It licenses no inference about any phenotype, and within-group heritability
   licenses no inference about between-group differences
   ([Ch 31](../part-06-quantitative-genetics/31-heritability-and-selection.md)).

> Values in the literature vary with estimator (Hudson here; Weir–Cockerham typically differs),
> marker ascertainment, MAF filtering, and which populations are compared. A single F_ST figure
> quoted without those details is not interpretable. Ours is one 1 Mb region of chr22 at
> MAF > 1% — informative, not definitive.

> **The statistics here.** `--fst` prints a point estimate and no error bar. Hudson's estimator is a
> *ratio of averages*: each SNP contributes a numerator and a denominator, and F_ST is the sum of the
> numerators divided by the sum of the denominators (the per-SNP correction terms exist because
> sampling noise in the two frequency estimates would otherwise inflate the result, more so in small
> samples). There is no closed-form standard error for it, which is exactly the situation the
> bootstrap is built for ([S3](../part-S-statistics/S3-sampling-and-estimation.md) §6). S3's worked
> example resamples this same number and gives two lessons you should carry away before quoting any
> F_ST. First, **whatever you resample is what the interval is about** — resampling people answers
> "what if I had recruited differently", resampling SNPs answers "what if I had genotyped a different
> stretch", and they give different answers. Second, resampling SNPs one at a time is *wrong* here
> because SNPs in one megabase are in LD; resampling contiguous blocks instead triples the standard
> error, yielding 95% CI [0.057, 0.076]. S3 also shows per-SNP F_ST in this window scattering with SD
> 0.054 and coming out negative for 8% of SNPs — so a single locus's F_ST carries almost no
> information, however extreme it looks.

## 6. LD decays faster in African-ancestry samples ★★

```bash
for sp in EUR AFR; do
  awk -v s=$sp 'NR>1 && $3==s{print $1}' panel.txt > ${sp}.ids
  plink2 --pfile chr22_qc --keep ${sp}.ids --r2-unphased \
         --ld-window-kb 250 --ld-window-r2 0 --out ld_${sp}
done
```

`--r2-unphased` writes one row per SNP pair, not a decay curve. Each `.vcor` file is one pair per
line with `POS_A`, `POS_B` and `UNPHASED_R2`; bin them by separation and average:

```bash
python - <<'PY'
import collections
BIN = 10_000                                   # 10 kb bins; the last one is a catch-all
tot = collections.defaultdict(float); n = collections.Counter()
for sp in ('EUR', 'AFR'):
    with open(f'ld_{sp}.vcor') as fh:
        fh.readline()                          # header line
        for line in fh:
            f = line.split('\t')
            d = int(f[4]) - int(f[1])          # POS_B - POS_A
            b = min(d // BIN, 9)
            tot[sp, b] += float(f[6]); n[sp, b] += 1      # UNPHASED_R2
print(f"{'distance':>10}  {'EUR r2':>8} {'AFR r2':>8}   {'EUR pairs':>9} {'AFR pairs':>9}")
for b in range(10):
    label = '90+ kb' if b == 9 else f'{b*10}-{b*10+10} kb'
    print(f"{label:>10}  {tot['EUR',b]/n['EUR',b]:8.4f} {tot['AFR',b]/n['AFR',b]:8.4f}"
          f"   {n['EUR',b]:9d} {n['AFR',b]:9d}")
PY
```

```
  distance    EUR r2   AFR r2   EUR pairs AFR pairs
   0-10 kb    0.1732   0.1053       85145    127016
  10-20 kb    0.1200   0.0650       81171    121884
  20-30 kb    0.0998   0.0549       79524    118719
  30-40 kb    0.0919   0.0497       75912    115143
  40-50 kb    0.0832   0.0464       75742    113117
  50-60 kb    0.0756   0.0414       74895    111253
  60-70 kb    0.0670   0.0366       74089    109340
  70-80 kb    0.0651   0.0351       71972    106212
  80-90 kb    0.0634   0.0339       70173    103915
    90+ kb    0.0337   0.0170     1006087   1536638
```

The last bin is wider than the others — `--ld-window-kb 250` was the ceiling, so "90+" means
90–250 kb — which is why it drops so much further than the step before it. Ignore its absolute
value and read the nine even bins.

**AFR r² is lower at every single distance** — roughly half of EUR at short range and holding
that ratio out to 90 kb.

> **The statistics here.** r² is not a genetics-specific quantity: it is the **squared Pearson
> correlation between the two SNPs' genotype dosages** across the samples in that group
> ([S5](../part-S-statistics/S5-variance-and-regression.md) §3). Correlation divides the covariance
> by both standard deviations, which makes it dimensionless and immune to how you code the alleles —
> the LD statistic of [Ch 29](../part-05-population-genetics/29-linkage-disequilibrium.md) *is* a
> squared correlation, not an analogy to one. Read it as a proportion of variance: r² = 0.1732 means
> 17% of the variance in one SNP's dosage is linearly predictable from the other's, and it is why
> tagging a causal variant at r² = 0.63 costs a factor of 0.63 in association power. Two limits worth
> holding. It measures *linear* association only — S5 §3 shows a chr22 SNP where heterozygosity is a
> perfectly determined function of dosage and the correlation is exactly zero. And two SNPs with
> different allele frequencies cannot reach r² = 1 whatever the haplotypes do, so the MAF filter in
> §3 is part of what these bins mean. The table averages many overlapping SNP pairs from one
> megabase, so the bins are not independent measurements of anything; treat the *pattern* as the
> result, not any single cell.

The explanation is demographic, and it is a coalescent argument rather than a
"more generations" one. African populations have a larger long-term effective population size
and did not pass through the out-of-Africa bottleneck. Larger *N*ₑ means lineages take longer to
coalesce, so any two chromosomes sampled today have had more opportunity for recombination to
separate them since their common ancestor. Non-African populations descend from a smaller
founding subset, so their chromosomes share more recent ancestry and longer unbroken haplotypes.

The practical consequences run right through Part 11:

- **Fine-mapping is easier in African-ancestry samples.** Shorter LD means an association signal
  implicates fewer candidate variants ([Ch 52](../part-11-human-and-statistical-genomics/52-association-to-mechanism.md)).
- **Tag SNPs do not transfer.** A marker tagging a causal variant at r² = 0.9 in Europeans may
  tag it at r² = 0.3 elsewhere, so the same array captures less signal.
- **This is a major reason polygenic scores lose accuracy across ancestries**
  ([Ch 53](../part-11-human-and-statistical-genomics/53-polygenic-scores.md)) — the weights were
  fitted to tags whose relationship to the causal variants differs.
- **More genotyping is needed** for equivalent genome-wide coverage in African-ancestry cohorts.

---

## Check yourself

**1. `--keep` reports "0 samples remaining" but your ID list looks right. What do you check?**

<details><summary>Answer</summary>

`head` the `.psam`. PLINK2 writes `#IID` only when there is no family structure, whereas PLINK1
always wrote FID and IID. A two-column `FID IID` keep file then matches nothing.

Match your keep/phenotype files to the actual columns in the `.psam`. Also check for whitespace
mismatches (tab vs space) and any prefix the VCF added to sample names. The message is worded
like a warning but is a hard failure.

</details>

**2. QC cut 27,895 variants to 3,564. Is that alarming?**

<details><summary>Answer</summary>

No — almost all of it is `--maf 0.01`. The site frequency spectrum is dominated by rare
variants: most segregating sites in any human megabase are at low frequency, and those carry
little information for PCA, F_ST or LD while adding noise.

It *would* be alarming if the loss came mostly from `--geno` (assay failure) or `--hwe`
(genotyping error). Always look at which filter did the cutting — PLINK reports them separately.
And note that for a rare-variant burden analysis you would keep exactly the variants discarded
here ([Ch 54](../part-11-human-and-statistical-genomics/54-rare-variants-and-mendelian-disease.md)).

</details>

**3. F_ST(AFR, EUR) = 0.065. Does that mean humans are 6.5% genetically different by continent?**

<details><summary>Answer</summary>

No, and the phrasing conceals two errors.

F_ST is a **variance-partitioning statistic**: the proportion of total allele-frequency variance
that lies *between* groups rather than within them. 0.065 says ~6.5% of the variance is between
and ~93.5% is within — most variation is found within any population.

It is not a percentage of the genome, not a percentage of sequence differences, and not a
statement about any trait. It also depends on estimator, marker ascertainment, MAF filter and
which populations are compared, so a bare number is uninterpretable.

What it does support: population structure is real, PCA detects it, and association studies must
control for it or generate false positives.

</details>

**4. Your GWAS in a mixed-ancestry cohort produces hundreds of significant hits with a genomic inflation factor of 1.4. What happened, and what do you do?**

<details><summary>Answer</summary>

Almost certainly **uncontrolled population stratification**. λ = 1.4 means test statistics are
inflated genome-wide, which is not what real polygenic signal looks like at a single locus — it
looks like a systematic shift.

Mechanism: your cohort mixes groups with different allele frequencies (§4/§5) *and* different
trait prevalence. Every variant differing in frequency between the groups then associates with
the trait, with no causal relationship whatever.

Fixes, in order: include principal components as covariates; or use a linear mixed model with a
genetic relatedness matrix, which handles both structure and cryptic relatedness; or use
within-family/sibling designs, which are the most robust because siblings share ancestry by
construction.

Then distinguish confounding from genuine polygenicity — λ rises with true polygenic signal too.
LD-score regression separates them: a raised **intercept** indicates confounding, whereas a
raised **slope** with a near-1 intercept indicates real polygenic heritability
([Ch 51](../part-11-human-and-statistical-genomics/51-gwas.md)).

> **The statistics here.** λ, the genomic inflation factor, converts every p-value in the scan to a
> χ² statistic on 1 df and divides the observed **median** by the null median 0.4549
> ([S7](../part-S-statistics/S7-high-dimensional-data.md) §4). So λ = 1.0 is a well-behaved scan and
> λ = 1.4 says the middle of the distribution is shifted — and the middle is the informative part,
> because half the genome cannot plausibly be associated with your trait, so a moved median indicts
> the model rather than the biology. The assumption λ smuggles in is that nothing but confounding
> can raise the median, and that is false: a large, clean study of a highly polygenic trait also has
> λ > 1, and λ climbs with sample size. Reporting λ alone therefore settles nothing, which is exactly
> why the intercept/slope split above exists.

</details>
