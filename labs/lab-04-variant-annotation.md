# Lab 04 — Variant annotation, and the off-by-one that changes the answer

> **Time:** ~45 min · **Before this:** [lab-03](lab-03-variant-calling.md), [Ch 44](../part-09-genomics/44-annotation.md), [Ch 41](../part-09-genomics/41-data-formats.md)
>
> **Statistics:** §§2 and 4 lean on the binomial test and on a power argument. Nothing beyond basic
> statistics is assumed — the boxes at those points say what each method claims and point into
> [S2](../part-S-statistics/S2-distributions.md), [S3](../part-S-statistics/S3-sampling-and-estimation.md)
> and [S4](../part-S-statistics/S4-hypothesis-testing.md), which teach them properly.

Lab 03 produced 14 variants. A variant call is a coordinate and two strings; it says nothing
about what the variant *does*. Here you find out. You will fetch the REL606 annotation, intersect
the variants against it with `bedtools`, and then **write the codon translator yourself** —
because the only way to understand what a consequence annotation asserts is to compute one,
get the reverse strand wrong, and see the wrong answer look exactly as plausible as the right
one. Every number below was produced on this machine.

```bash
# GENOMICS is exported in lab-00. In a fresh shell, set it again:
#   export GENOMICS=/path/to/learn-genomics
cd "$GENOMICS" && source .venv/bin/activate && cd labs/data
```

One input carries over from lab-03: its filtered callset, which lab-03 wrote as `filt.vcf`. This
lab names it **`filt606.vcf`** — after the reference it was called against, since lab-03 §5 also
produced a callset against the wrong one and you do not want to confuse them a week later. Rebuild
it here rather than trusting a file from a previous session; it takes about five seconds and makes
this lab self-contained:

```bash
bcftools mpileup -f rel606.fa aln.bam -q 20 -Q 20 --threads 2 \
  | bcftools call -mv --ploidy 1 -Ov \
  | bcftools filter -i 'QUAL>=30 && DP>=5' -Ov > filt606.vcf
grep -vc '^#' filt606.vcf
```

**14** — the same fourteen variants lab-03 §2 ended with.

---

## 1. Get the annotation

The reads in this lab sequence come from the *E. coli* B REL606 lineage, and the reference is
assembly **GCF_000017985.1**. NCBI publishes the annotation alongside the sequence in the same
directory:

```bash
curl -sL -o rel606.gff.gz \
  "https://ftp.ncbi.nlm.nih.gov/genomes/all/GCF/000/017/985/GCF_000017985.1_ASM1798v1/GCF_000017985.1_ASM1798v1_genomic.gff.gz"
gunzip -k rel606.gff.gz
```

434 KB compressed, 2.7 MB plain. Check the contig name matches the FASTA before anything else —
an annotation keyed to a different sequence name intersects with nothing and reports it as
"no overlaps" rather than as an error:

```bash
head -9 rel606.gff | tail -2
```

```
##sequence-region NC_012967.1 1 4629812
##species https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?id=413997
```

`NC_012967.1`, length 4,629,812 — identical to `rel606.fa`. Good.

Now count feature types. The obvious command is wrong:

```bash
awk '!/^#/{print $3}' rel606.gff | sort | uniq -c | sort -rn | head -4
```

```
4411 Homology
4320 gene
 187 pseudogene
 116 exon
```

There is no feature type called `Homology`. GFF3 is **tab-separated**, and column 2 (source)
contains values like `Protein Homology` with a space in them. Default `awk` splits on any
whitespace, so `$3` is the second word of the source field for every line that has one. Force the
separator:

```bash
awk -F'\t' '!/^#/{print $3}' rel606.gff | sort | uniq -c | sort -rn
```

```
4431 CDS
4320 gene
 187 pseudogene
 116 exon
  85 tRNA
  22 rRNA
   7 sequence_feature
   7 riboswitch
   5 ncRNA
   2 direct_repeat
   1 tmRNA
   1 region
   1 antisense_RNA
   1 SRP_RNA
   1 RNase_P_RNA
```

`CDS` went from 20 to 4,431. The first run was not an error message — it was a plausible-looking
table with the wrong numbers in it, which is the failure mode this lab is about. **Always
`-F'\t'` on GFF, BED, VCF and SAM.**

The nine GFF3 columns:

| # | Column | Note |
|---|---|---|
| 1 | seqid | must match your FASTA |
| 2 | source | free text, **may contain spaces** |
| 3 | type | `gene`, `CDS`, `exon`, … |
| 4 | start | **1-based, inclusive** |
| 5 | end | **1-based, inclusive** |
| 6 | score | usually `.` |
| 7 | strand | `+` or `-` — load-bearing, see §3 |
| 8 | phase | bases to skip to reach the first codon; `0` for all of these |
| 9 | attributes | `key=value;key=value`, URL-escaped |

## 2. Which variants land in genes?

Build a CDS interval file. Note the `$4-1`: GFF start is 1-based, BED start is 0-based
(§5 makes this concrete).

```bash
awk -F'\t' 'BEGIN{OFS="\t"} !/^#/ && $3=="CDS" {
  name="."; if (match($9,/gene=[^;]+/))      name=substr($9,RSTART+5,RLENGTH-5);
  lt=".";   if (match($9,/locus_tag=[^;]+/)) lt=substr($9,RSTART+10,RLENGTH-10);
  print $1, $4-1, $5, name"|"lt, ".", $7
}' rel606.gff > cds.bed
wc -l < cds.bed        # 4431
```

Intersect:

```bash
bedtools intersect -a filt606.vcf -b cds.bed -u | grep -vc '^#'   # coding
bedtools intersect -a filt606.vcf -b cds.bed -v | grep -vc '^#'   # not coding
```

**10 of 14 fall inside a CDS; 4 do not.**

```bash
bedtools intersect -a filt606.vcf -b cds.bed -wa -wb \
  | awk -F'\t' 'BEGIN{OFS="\t"}{print $2,$4,$5,$12+1,$13,$14,$16}'
```

```
9972     T         G          9926      10492     satP|ECB_RS00055         -
1733343  G         A          1732965   1734377   pykF|ECB_RS08685         +
2446984  A         C          2446912   2447001   .|ECB_RS26305            -
2665639  A         T          2665590   2665937   rplS|ECB_RS13175         -
3339313  A         C          3339162   3339458   fis|ECB_RS16485          +
3488669  A         C          3488448   3489206   .|ECB_RS17315            -
4100183  A         G          4099899   4101230   hslU|ECB_RS20235         -
4201958  A         C          4201735   4202559   iclR|ECB_RS20685         -
4431393  TGG       T          4427869   4431648   tamB|ECB_RS21780         +
4616538  A         C          4615529   4616761   nadR|ECB_RS22740         +
```

**Six of the ten CDS are on the minus strand.** Hold that thought.

Is 10/14 coding a lot? Only against a baseline. Bacterial genomes are dense:

```bash
sort -k1,1 -k2,2n cds.bed | bedtools merge -i - \
  | awk '{s+=$3-$2} END{printf "coding bases %d, density %.4f\n", s, s/4629812}'
```

```
coding bases 4087346, density 0.8828
```

**88.3% of REL606 is protein-coding.** Under a uniform mutation model you would expect 12.4 of 14
variants in CDS and we see 10 — an exact binomial test gives p = 0.072. Nothing to report. In a
human genome, where ~1.5% of bases are coding, 10 of 14 in CDS would be a five-alarm result. The
same observation means opposite things in the two genomes, which is why annotation summaries are
uninterpretable without the background density.

> **The statistics here.** The exact binomial test treats each of the 14 variants as an independent
> trial that lands in coding sequence with the same probability — 0.883, the coding density — and
> asks how often 14 such trials would produce a shortfall as large as 10
> ([S2 §1](../part-S-statistics/S2-distributions.md)). Both assumptions are load-bearing:
> independence fails if the variants cluster, and a constant probability fails wherever mutation
> rate or coverage varies along the genome. Read p = 0.072 as "a shortfall this size is
> unsurprising if variants fall uniformly" — it is a statement about that null model, not a
> measurement of how strongly coding sequence is avoided, and a p above 0.05 with n = 14 is mostly
> a statement about n ([S4 §3](../part-S-statistics/S4-hypothesis-testing.md)).

Now the four non-coding calls. First confirm they are outside *every* annotated feature, not just
outside CDS — a variant inside a tRNA or a pseudogene is not "intergenic":

```bash
awk -F'\t' 'BEGIN{OFS="\t"} !/^#/ && ($3=="gene"||$3=="pseudogene") {
  n="."; if (match($9,/Name=[^;]+/)) n=substr($9,RSTART+5,RLENGTH-5);
  bt=".";if (match($9,/gene_biotype=[^;]+/)) bt=substr($9,RSTART+13,RLENGTH-13);
  print $1,$4-1,$5,n";"bt,".",$7}' rel606.gff > genes.bed
sort -k1,1 -k2,2n genes.bed > genes.sorted.bed

bedtools intersect -a filt606.vcf -b cds.bed -v -header > noncds.vcf
bedtools closest -a noncds.vcf -b genes.sorted.bed -d -k 2 \
  | awk -F'\t' '{print $2, $4"->"$5, " nearest:", $14, $16, " dist", $17}'
```

```
281923   G->T                   nearest: ykgL;protein_coding       +  dist 369
281923   G->T                   nearest: ecpR;protein_coding       -  dist 454
433359   CTTTTTTT->CTTTTTTTT    nearest: lon;protein_coding        +  dist 62
433359   CTTTTTTT->CTTTTTTTT    nearest: hupB;protein_coding       +  dist 122
2999330  G->A                   nearest: ECB_RS14795               +  dist 138
2999330  G->A                   nearest: ECB_RS14800               +  dist 234
3909807  G->T                   nearest: hdfR;protein_coding       -  dist 40
3909807  G->T                   nearest: maoP;protein_coding       +  dist 79
```

All four are genuinely intergenic, and two are interesting:

- **3909807** sits 40 bp from the 5′ end of `hdfR` (minus strand) and 79 bp from the 5′ end of
  `maoP` (plus strand). Two genes transcribed *away from each other* means the sequence between
  them is a **divergent promoter region** — the single most likely place for an intergenic base
  change to have a regulatory effect.
- **433359** is 62 bp past the 3′ end of `lon` and 122 bp before `hupB`, both on the plus strand,
  i.e. in the `hupB` upstream region. It is also an insertion into a run of seven Ts — and
  [lab-03](lab-03-variant-calling.md) established that homopolymer indels are the least reliable
  calls a short-read pipeline makes. The most tempting regulatory candidate is the one you should
  trust least.

"Intergenic" is a statement about the annotation, not about function. `bedtools` can only tell you
a variant missed every interval someone drew.

## 3. Compute the consequences yourself ★

For the 9 coding SNVs we want: which codon, what it becomes, and whether the protein changes.
The rules are mechanical:

1. Find the CDS containing the position.
2. Convert the genomic position to a 0-based **offset along the coding sequence**.
3. `offset // 3` is the codon index, `offset % 3` is which base within the codon.
4. Substitute the ALT base, translate both codons, compare.

On the minus strand, steps 2–4 all change: the coding sequence is the reverse complement of the
reference, the offset counts down from the CDS *end*, and the ALT allele — which VCF always
writes on the forward strand — has to be complemented before it is dropped into the codon.

### 3.1 The version that gets it wrong

Here is the first attempt, which does none of that. Save it as `consequence_naive.py` — it is the
script of §3.3 with the CDS-extraction and offset logic replaced by these five lines, and `s`,
`e`, `strand` unpacked straight from the GFF:

```python
off    = pos - s          # 0-based offset into the CDS
ci     = off // 3         # codon index
cstart = s + ci * 3       # 1-based genomic start of the codon
codon  = fa.fetch(chrom, cstart - 1, cstart + 2).upper()
mut    = codon[:off % 3] + alt + codon[off % 3 + 1:]
```

The `strand` field is read and printed. It is never used.

```bash
python consequence_naive.py
```

```
9972     satP          -  GTT->GGT  V->G
1733343  pykF          +  GAT->AAT  D->N
2446984  ECB_RS26305   -  AAT->CAT  N->H
2665639  rplS          -  CAG->CTG  Q->L
3339313  fis           +  TAT->TCT  Y->S
3488669  ECB_RS17315   -  CGA->CGC  R->R
4100183  hslU          -  AGA->AGG  R->R
4201958  iclR          -  GAG->GCG  E->A
4616538  nadR          +  TAC->TCC  Y->S
```

Nothing crashed. Every codon is a real codon, every amino acid is a real amino acid, and the
table would survive a code review. Six of the nine rows are wrong.

> **The reference-base assertion you are about to reach for does not catch this.** The natural
> safety check — "does the base I am replacing equal the VCF REF allele?" — passes for every row
> above, because `codon[off % 3]` and the base at `pos` are the *same byte of the FASTA* by
> construction. The check verifies that your arithmetic is internally consistent, not that your
> frame or your strand is right. A self-consistency check is not a correctness check.

### 3.2 What actually validates it

The check that works is biological: extract every CDS and translate it. A correctly extracted
protein-coding gene must have a length divisible by 3, exactly one stop codon, and that stop at
the end. Run that over all 4,244 non-pseudogene CDS with and without the reverse-complement:

```bash
python - <<'PY'
import pysam
from Bio.Seq import Seq
fa = pysam.FastaFile("rel606.fa")
cds = []
for line in open("rel606.gff"):
    if line.startswith("#"): continue
    f = line.rstrip("\n").split("\t")
    if f[2] != "CDS": continue
    a = dict(kv.split("=",1) for kv in f[8].split(";") if "=" in kv)
    if a.get("pseudo") == "true": continue
    cds.append((f[0], int(f[3]), int(f[4]), f[6]))

def orf_ok(s):
    if len(s) % 3: return False
    p = s.translate(table=11)
    return p.endswith("*") and p.count("*") == 1

for label, rc in [("WITH reverse-complement", True), ("WITHOUT (the bug)", False)]:
    ok = 0
    for c, s, e, st in cds:
        q = Seq(fa.fetch(c, s-1, e).upper())
        if rc and st == "-": q = q.reverse_complement()
        ok += orf_ok(q)
    print(f"{label:26s} {ok:5d}/{len(cds)}  ({100*ok/len(cds):.1f}%)")
minus = sum(1 for c in cds if c[3] == "-")
print(f"minus-strand CDS: {minus}/{len(cds)} = {100*minus/len(cds):.1f}%")
PY
```

```
WITH reverse-complement     4162/4244  (98.1%)
WITHOUT (the bug)           1997/4244  (47.1%)
minus-strand CDS: 2206/4244 = 52.0%
```

**47.1% versus 98.1%**, and 47.1% is almost exactly the 48.0% of CDS on the plus strand. The bug
is unmissable the moment you translate whole genes and invisible when you only look at codons.
This is the annotation equivalent of a unit test: never trust a coordinate-to-protein mapping you
have not round-tripped through a full translation.

### 3.3 The correct version

`consequence.py` in full:

```python
#!/usr/bin/env python
"""Assign a coding consequence to every variant in filt606.vcf. Strand-aware."""
import pysam
from Bio.Seq import Seq

fa = pysam.FastaFile("rel606.fa")
TABLE = 11                                  # bacterial code; the GFF says transl_table=11

# ---- 1. load CDS features from the GFF -----------------------------------
cds = []
for line in open("rel606.gff"):
    if line.startswith("#"):
        continue
    f = line.rstrip("\n").split("\t")       # MUST split on tab - col 2 contains spaces
    if f[2] != "CDS":
        continue
    a = dict(kv.split("=", 1) for kv in f[8].split(";") if "=" in kv)
    cds.append(dict(chrom=f[0], start=int(f[3]), end=int(f[4]),   # 1-based INCLUSIVE
                    strand=f[6], pseudo=a.get("pseudo") == "true",
                    gene=a.get("gene", a.get("locus_tag", "?"))))

def cds_seq(c):
    """Coding sequence 5'->3'. Reverse-complement it on the minus strand."""
    s = Seq(fa.fetch(c["chrom"], c["start"] - 1, c["end"]).upper())   # -1: GFF -> pysam
    return s.reverse_complement() if c["strand"] == "-" else s

def cds_offset(c, pos):
    """0-based offset of a genomic position along the coding sequence."""
    return pos - c["start"] if c["strand"] == "+" else c["end"] - pos

# ---- 2. validate: a correctly extracted CDS must be a clean ORF -----------
real = [c for c in cds if not c["pseudo"]]
ok = 0
for c in real:
    s = cds_seq(c)
    if len(s) % 3:
        continue
    p = s.translate(table=TABLE)
    ok += p.endswith("*") and p.count("*") == 1
print(f"ORF check: {ok}/{len(real)} non-pseudogene CDS translate cleanly "
      f"({100*ok/len(real):.1f}%)\n")

# ---- 3. classify every variant -------------------------------------------
print("POS\tGENE\tSTR\tCODON\t\tAA\tCONSEQUENCE")
for line in open("filt606.vcf"):
    if line.startswith("#"):
        continue
    f = line.split("\t")
    chrom, pos, ref, alt = f[0], int(f[1]), f[3], f[4]
    hits = [c for c in cds if c["chrom"] == chrom and c["start"] <= pos <= c["end"]]
    if not hits:
        print(f"{pos}\t-\t-\t-\t\t-\tintergenic")
        continue
    c = hits[0]

    if len(ref) != len(alt):                                   # indel
        shift = abs(len(alt) - len(ref))
        kind = "frameshift" if shift % 3 else "inframe_indel"
        print(f"{pos}\t{c['gene']}\t{c['strand']}\t{ref}->{alt}\t-\t{kind} ({shift} bp)")
        continue

    off = cds_offset(c, pos)
    ci, within = off // 3, off % 3                             # codon index, base in codon
    codon = str(cds_seq(c)[ci*3: ci*3 + 3])

    # REF/ALT are written on the FORWARD strand - complement them for a - gene
    ref_c = str(Seq(ref).complement()) if c["strand"] == "-" else ref
    alt_c = str(Seq(alt).complement()) if c["strand"] == "-" else alt
    assert codon[within] == ref_c, f"{pos}: {codon[within]} != {ref_c}"

    mut = codon[:within] + alt_c + codon[within+1:]
    aa1 = str(Seq(codon).translate(table=TABLE))
    aa2 = str(Seq(mut).translate(table=TABLE))
    cons = ("synonymous" if aa1 == aa2 else
            "nonsense"   if aa2 == "*"  else
            "stop_lost"  if aa1 == "*"  else "missense")
    print(f"{pos}\t{c['gene']}\t{c['strand']}\t{codon}->{mut}\t{aa1}{ci+1}{aa2}\t{cons}")
```

Two details that are easy to miss. **`table=11`** is the bacterial genetic code; it differs from
the standard code only in permitted start codons, but declaring it is free and the GFF tells you
which to use (`transl_table=11` on every CDS). And the ALT allele is **complemented, not
reverse-complemented** — it is a single base, and what you need is the base as read on the coding
strand.

```bash
python consequence.py
```

```
ORF check: 4162/4244 non-pseudogene CDS translate cleanly (98.1%)

POS      GENE          STR  CODON     AA      CONSEQUENCE
9972     satP          -    AAC->ACC  N174T   missense
281923   -             -    -         -       intergenic
433359   -             -    -         -       intergenic
1733343  pykF          +    GAT->AAT  D127N   missense
2446984  ECB_RS26305   -    ATT->ATG  I6M     missense
2665639  rplS          -    CTG->CAG  L100Q   missense
2999330  -             -    -         -       intergenic
3339313  fis           +    TAT->TCT  Y51S    missense
3488669  ECB_RS17315   -    TCG->GCG  S180A   missense
3909807  -             -    -         -       intergenic
4100183  hslU          -    TCT->CCT  S350P   missense
4201958  iclR          -    CTC->CGC  L201R   missense
4431393  tamB          +    TGG->T    -       frameshift (2 bp)
4616538  nadR          +    TAC->TCC  Y337S   missense
```

Wrong versus right, side by side:

| POS | Gene | Str | Naive codon | Naive AA | **Correct codon** | **Correct AA** | Naive verdict |
|---|---|---|---|---|---|---|---|
| 9972 | satP | − | GTT→GGT | V→G | **AAC→ACC** | **N174T** | wrong residue |
| 1733343 | pykF | + | GAT→AAT | D→N | **GAT→AAT** | **D127N** | correct |
| 2446984 | ECB_RS26305 | − | AAT→CAT | N→H | **ATT→ATG** | **I6M** | wrong residue |
| 2665639 | rplS | − | CAG→CTG | Q→L | **CTG→CAG** | **L100Q** | reversed |
| 3339313 | fis | + | TAT→TCT | Y→S | **TAT→TCT** | **Y51S** | correct |
| 3488669 | ECB_RS17315 | − | CGA→CGC | R→R | **TCG→GCG** | **S180A** | **false synonymous** |
| 4100183 | hslU | − | AGA→AGG | R→R | **TCT→CCT** | **S350P** | **false synonymous** |
| 4201958 | iclR | − | GAG→GCG | E→A | **CTC→CGC** | **L201R** | wrong residue |
| 4616538 | nadR | + | TAC→TCC | Y→S | **TAC→TCC** | **Y337S** | correct |

Every naive codon is the exact reverse complement of the correct one. That is not a coincidence:
because CDS lengths are divisible by 3, the forward-strand codon *windows* land on precisely the
same genomic bases as the true ones. The frame was never wrong — only the strand was. So the bug
does not produce garbage, it produces a **different valid protein change**, and in two of six
cases a spuriously synonymous one. A pipeline with this bug would report dN/dS as 7/2 instead of
9/0 and no downstream check would notice.

### 3.4 Two independent confirmations

Never ship your own annotator without checking it against something you did not write. NCBI
publishes its own translations:

```bash
curl -sL -o rel606_prot.faa.gz \
  "https://ftp.ncbi.nlm.nih.gov/genomes/all/GCF/000/017/985/GCF_000017985.1_ASM1798v1/GCF_000017985.1_ASM1798v1_protein.faa.gz"
```

Looking up each call's reference residue in the RefSeq protein:

```
gene          protein_id        len   call     NCBI residue  match
satP          WP_000528538.1    188   N174T    N             OK
pykF          WP_001295403.1    470   D127N    D             OK
ECB_RS26305   WP_240811045.1     29   I6M      I             OK
rplS          WP_000065253.1    115   L100Q    L             OK
fis           WP_000462905.1     98   Y51S     Y             OK
ECB_RS17315   WP_015833307.1    252   S180A    S             OK
hslU          WP_001293341.1    443   S350P    S             OK
iclR          WP_000226403.1    274   L201R    L             OK
nadR          WP_000093806.1    410   Y337S    Y             OK
```

Nine for nine, against translations produced by a completely separate pipeline.

Second check: `bcftools csq` is a production consequence caller. Point it at the NCBI GFF:

```bash
bcftools csq -f rel606.fa -g rel606.gff.gz -C 11 -p a -l filt606.vcf 2>&1 | grep Indexed
```

```
Indexed 23 transcripts, 23 exons, 0 CDSs, 0 UTRs
```

**Zero CDSs.** It emits a valid VCF with no annotations whatever and exit status 0. The cause is
a dialect mismatch: `bcftools csq` expects Ensembl-style GFF3, where a CDS's `Parent` is a
*transcript* and the transcript carries `biotype=protein_coding`. NCBI's bacterial GFF has no
`mRNA` features at all — CDS parents point straight at genes — and spells the attribute
`gene_biotype`. Translate the dialect:

```bash
awk -F'\t' 'BEGIN{OFS="\t"}
/^#/{print; next}
$3=="gene" && $9~/gene_biotype=protein_coding/ {
  match($9,/ID=[^;]+/); id=substr($9,RSTART+3,RLENGTH-3);
  nm=id; if (match($9,/Name=[^;]+/)) nm=substr($9,RSTART+5,RLENGTH-5);
  print $1,$2,"gene",$4,$5,$6,$7,$8,"ID=gene:"id";biotype=protein_coding;Name="nm;
  print $1,$2,"mRNA",$4,$5,$6,$7,$8,"ID=transcript:"id";Parent=gene:"id";biotype=protein_coding";
  next }
$3=="CDS" {
  match($9,/Parent=[^;]+/); p=substr($9,RSTART+7,RLENGTH-7);
  print $1,$2,"CDS",$4,$5,$6,$7,$8,"Parent=transcript:"p";biotype=protein_coding" }
' rel606.gff | bgzip > rel606_csq.gff.gz

bcftools csq -f rel606.fa -g rel606_csq.gff.gz -C 11 -p a -l filt606.vcf 2>/dev/null \
  | bcftools query -f '%POS\t%REF>%ALT\t%BCSQ\n'
```

```
Indexed 4204 transcripts, 0 exons, 4244 CDSs, 0 UTRs

9972     T>G     missense|satP|gene-ECB_RS00055|protein_coding|-|174N>174T|9972T>G
281923   G>T     .
433359   CTTTTTTT>CTTTTTTTT  .
1733343  G>A     missense|pykF|gene-ECB_RS08685|protein_coding|+|127D>127N|1733343G>A
2446984  A>C     missense|ECB_RS26305|gene-ECB_RS26305|protein_coding|-|6I>6M|2446984A>C
2665639  A>T     missense|rplS|gene-ECB_RS13175|protein_coding|-|100L>100Q|2665639A>T
2999330  G>A     .
3339313  A>C     missense|fis|gene-ECB_RS16485|protein_coding|+|51Y>51S|3339313A>C
3488669  A>C     missense|ECB_RS17315|gene-ECB_RS17315|protein_coding|-|180S>180A|3488669A>C
3909807  G>T     .
4100183  A>G     missense|hslU|gene-ECB_RS20235|protein_coding|-|350S>350P|4100183A>G
4201958  A>C     missense|iclR|gene-ECB_RS20685|protein_coding|-|201L>201R|4201958A>C
4431393  TGG>T   frameshift|tamB|gene-ECB_RS21780|protein_coding|+|1175SGQIVGKIGETFGVSNLALDTQGVGDSSQVVVSGYVLPGLQVKYGVGIFDSIATLTLRYRLMPKLYLEAVSGVDQALDLLYQFEF*>1175SPDCG*|4431393TGG>T
```

Identical on all ten, including the strand handling. It also does the frameshift properly, which
is worth reading: `tamB` is 1,259 aa; deleting 2 bp at codon 1175 replaces the final 85 residues
with `SPDCG*`, truncating the protein to 1,179 aa and destroying **80 residues, 6.4% of the
protein**. A 2 bp deletion near the 3′ end is still a frameshift, but a frameshift in the last
7% of a protein is a much weaker functional claim than one at codon 20 — position within the
transcript matters as much as the class label.

### 3.5 The 82 CDS that fail the ORF check

98.1% is not 100%. Chase the remaining 82, because "my annotation has exceptions" is a fact about
biology, not a bug. Dropping the `pseudo=true` filter and classifying all 200 failures:

```
failing CDS (of all 4431):                      200
  pseudo=true (annotated pseudogenes)           118    <- excluded above
  one segment of a 2-segment CDS                 79  ]  the 82
  neither                                         3  ]
```

The 79 are IS-element transposases annotated with `exception=ribosomal slippage` and
`Note=programmed frameshift` — genes deliberately translated in two frames, split across two GFF
lines sharing a `Parent`. Any annotator that assumes one CDS record equals one ORF mishandles
them.

The remaining three are the good part:

```
fdnG       1521551-1524598 +   in frame, stops at codons [196, 1016]  internal codon 196 = TGA
fdnG/fdoG  4060919-4063969 -   in frame, stops at codons [196, 1017]  internal codon 196 = TGA
fdhF       4276041-4278188 -   in frame, stops at codons [140, 716]   internal codon 140 = TGA
```

All three are formate dehydrogenase α-subunits, and all three have an in-frame `TGA` that is not
a stop: it is recoded as **selenocysteine** by a downstream stem-loop that recruits a dedicated
tRNA. These are *E. coli*'s selenoproteins, and they are exactly the residue set that a naive
"one stop, at the end" validator flags. Your validator was right to complain and the annotation
was right too.

## 4. dN/dS, and why 14 variants cannot tell you about selection

Nine coding SNVs: **9 missense, 0 synonymous, 0 nonsense.** Not one silent change. That looks
like an enormous excess of protein-altering mutation — the signature of positive selection.
Let us try to make that claim survive.

The comparison is against how many *opportunities* there are for each class. Under the
Nei–Gojobori counting method, each site in each codon contributes a fraction to the synonymous
(S) or nonsynonymous (N) total according to how many of the three possible substitutions there
preserve the amino acid:

```bash
python - <<'PY'
import pysam
from Bio.Seq import Seq
from Bio.Data import CodonTable
fa  = pysam.FastaFile("rel606.fa")
tbl = CodonTable.unambiguous_dna_by_id[11].forward_table
def aa(c): return "*" if c in ("TAA","TAG","TGA") else tbl.get(c)
def sites(c):
    if aa(c) is None: return 0.0, 0.0
    s = 0.0
    for i in range(3):
        for b in "ACGT":
            if b == c[i]: continue
            if aa(c[:i]+b+c[i+1:]) == aa(c): s += 1/3
    return 3-s, s
genes = {"satP","pykF","ECB_RS26305","rplS","fis","ECB_RS17315","hslU","iclR","nadR"}
N = S = 0.0
for line in open("rel606.gff"):
    if line.startswith("#"): continue
    f = line.rstrip("\n").split("\t")
    if f[2] != "CDS": continue
    a = dict(kv.split("=",1) for kv in f[8].split(";") if "=" in kv)
    if a.get("gene", a.get("locus_tag")) not in genes: continue
    q = Seq(fa.fetch("NC_012967.1", int(f[3])-1, int(f[4])).upper())
    if f[6] == "-": q = q.reverse_complement()
    q = str(q)
    for i in range(0, len(q)-3, 3):          # skip the terminal stop
        n_, s_ = sites(q[i:i+3]); N += n_; S += s_
print(f"N = {N:.1f}  S = {S:.1f}  N/S = {N/S:.3f}")
print(f"P(a random change is synonymous) = {S/(N+S):.4f}")
PY
```

```
N = 5247.7  S = 1589.3  N/S = 3.302
P(a random change is synonymous) = 0.2325
```

Across all 4,162 clean CDS in the genome the ratio is essentially the same: N = 2,990,469,
S = 921,930, **N/S = 3.244**. Roughly one nucleotide position in four is a synonymous site,
almost all of them third positions.

> **The statistics here.** Nei–Gojobori is not a test; it builds the null expectation the test will
> use. It counts *opportunities*, splitting each codon position between the nonsynonymous (N) and
> synonymous (S) tallies according to what fraction of the three possible substitutions there would
> change the amino acid — which is why the totals are fractional. The assumption underneath is that
> every base is equally mutable and every substitution equally likely. Read the two numbers
> accordingly: **N/S = 3.302 is a ratio of opportunities, not dN/dS**, and S/(N+S) = 0.2325 is the
> probability that a *random* coding mutation is silent. That probability is the parameter of the
> binomial below, and multiplying it by the 9 observed changes is what turns it into an expected
> count of 2.09 ([S1 §6](../part-S-statistics/S1-probability.md) on expectation;
> [S2 §1](../part-S-statistics/S2-distributions.md) on the binomial it feeds).

So the naive ratio is

```
dN/dS ~ (Nd/N) / (Sd/S) = (9/5247.7) / (0/1589.3) = infinite
```

which should be the first sign that something is wrong with the question rather than the answer.
Do the statistics instead. Under strict neutrality each coding mutation is synonymous with
probability 0.2325, independently:

```bash
python -c "
from scipy.stats import binomtest
p = 1589.3/(5247.7+1589.3)
print(f'expected synonymous among 9 = {9*p:.2f}, observed 0')
r = binomtest(0, 9, p, alternative='less')
print(f'exact binomial p = {r.pvalue:.4f}')
for n in (5,10,15,20,30):
    print(f'  n={n:3d}, 0 synonymous -> p={binomtest(0,n,p,alternative=\"less\").pvalue:.4f}')
"
```

```
expected synonymous among 9 = 2.09, observed 0
exact binomial p = 0.0925
  n=  5, 0 synonymous -> p=0.2664
  n= 10, 0 synonymous -> p=0.0710
  n= 15, 0 synonymous -> p=0.0189
  n= 20, 0 synonymous -> p=0.0050
  n= 30, 0 synonymous -> p=0.0004
```

**p = 0.0925.** The most extreme outcome the data could possibly have produced — every single
coding change protein-altering, not one silent — does not reach p < 0.05. A Fisher exact test on
the 2×2 of changes against sites gives p = 0.129. You would need **12 coding SNVs with zero
synonymous** before the same qualitative result cleared the threshold.

This is the honest shape of the power problem, and it is worth stating precisely: with n = 9 the
*entire* achievable p-value range at the extreme is above 0.05, so no amount of cleverness in the
analysis rescues it. The experiment cannot answer the question. That is a property of the sample
size, decided before any data were collected.

> **The statistics here.** Two things are stacked in that block. The first is the exact binomial
> test again ([S2 §1](../part-S-statistics/S2-distributions.md)), now with the neutral probability
> 0.2325 and `alternative='less'`, asking how often 9 coding changes would include *zero*
> synonymous ones if neutrality held; the Fisher exact test on changes-against-sites is the same
> question posed on a 2×2 table. p = 0.0925 means that outcome arises about one time in eleven
> under the null — it is not the probability that neutrality is true, and it is not an effect size
> ([S4 §3](../part-S-statistics/S4-hypothesis-testing.md)). The second is a **power** argument run
> backwards ([S4 §§4–5](../part-S-statistics/S4-hypothesis-testing.md)): the n-sweep prints the
> *smallest p-value the design can reach* at each sample size, and at n = 9 that floor is 0.0925.
> When the best attainable result already misses the threshold, the test has no power against any
> alternative, and its non-significance excludes nothing.

Three further reasons to distrust the number even if n were larger:

| Problem | Effect |
|---|---|
| **Within-population polymorphism, not divergence** | dN/dS was derived for substitutions fixed between species. Applied to segregating variants in one population, mildly deleterious alleles that have not yet been purged inflate dN. |
| **Mutation spectrum ≠ uniform** | Nei–Gojobori assumes all substitutions are equally likely. They are not. |
| **Ascertainment** | These are variants that passed QUAL ≥ 30 and DP ≥ 5 at ~6× coverage. Filters that vary with local context do not sample N and S sites evenhandedly. |

The middle one is checkable and the answer is startling:

```bash
python -c "
import collections
comp = str.maketrans('ACGT','TGCA')
spec = collections.Counter(); raw = collections.Counter()
for line in open('filt606.vcf'):
    if line.startswith('#'): continue
    f = line.split('\t'); r, a = f[3], f[4]
    if len(r) != 1 or len(a) != 1: continue
    raw[f'{r}>{a}'] += 1
    if r in 'GT': r, a = r.translate(comp), a.translate(comp)   # collapse strands
    spec[f'{r}>{a}'] += 1
print('strand-collapsed:', dict(spec.most_common()))
ti = sum(v for k,v in raw.items() if k in {'A>G','G>A','C>T','T>C'})
print(f'transitions {ti}, transversions {sum(raw.values())-ti}, Ti/Tv = {ti/(sum(raw.values())-ti):.2f}')
"
```

```
strand-collapsed: {'A>C': 6, 'C>A': 2, 'C>T': 2, 'A>T': 1, 'A>G': 1}
transitions 3, transversions 9, Ti/Tv = 0.33
```

**Half of the SNVs are A:T → C:G**, and Ti/Tv is 0.33 where most spontaneous bacterial mutation
spectra sit near or above 1. Two explanations, and this data cannot separate them: a defective
`mutT` (the enzyme that sanitises oxidised nucleotide pools), which produces exactly this
A:T→C:G bias and has arisen repeatedly in long-term *E. coli* evolution experiments; or a
systematic artefact of this library and depth. Note that the very first variant in the file has
`DP4=0,0,0,4` — total strand bias — so the artefact hypothesis is live.

> **The statistics here.** Both summaries are proportions estimated from 12 counts, and a
> proportion from 12 draws is barely an estimate. Three transitions of twelve is a transition
> fraction of 0.25 whose 95% interval runs from about 0.09 to 0.53 — Ti/Tv anywhere from 0.1 to
> 1.1; "half the SNVs are A:T→C:G" is 6 of 12 and is no sharper. The precision of a proportion is
> set by the *count*, not by how striking the ratio looks
> ([S3 §§5, 8](../part-S-statistics/S3-sampling-and-estimation.md)). So 0.33 is compatible with a
> genuinely transversion-heavy spectrum *and* with the unremarkable value near 1 — the quantitative
> form of the sentence above about two explanations this data cannot separate.

For context, the genes carrying these mutations — `pykF`, `nadR`, `fis`, `hslU`, `iclR` — are
among the most frequently mutated across independent populations of the Lenski long-term
evolution experiment, and that convergence across replicate populations *is* strong evidence of
selection. But that evidence comes from the replication, not from this VCF. What one sample of
14 variants supports is a hypothesis worth testing, and nothing more.

## 5. GFF is 1-based inclusive, BED is 0-based half-open ★★

Every consequence above rests on one subtraction, `$4-1`. Here is what it is for, using the
`fis` CDS and the real variant inside it.

```bash
awk -F'\t' '$3=="CDS" && $9~/gene=fis;/{print $1"\t"$4"\t"$5"\t"$7"\t"$8}' rel606.gff
```

```
NC_012967.1	3339162	3339458	+	0
```

| | start | end | length formula | length |
|---|---|---|---|---|
| **GFF / VCF / SAM / samtools** | 3339162 | 3339458 | `end - start + 1` | 297 |
| **BED / BAM internals / pysam** | 3339161 | 3339458 | `end - start` | 297 |

Same 297 bases, two spellings. Only the start moves; the end is identical, which is precisely
what makes the error easy to make and hard to see. The half-open convention exists because it
composes: adjacent intervals meet without overlapping or gapping (`[0,10)` then `[10,20)`), and
length is a plain subtraction. The 1-based convention exists because biologists count the first
base as base 1.

Take the first codon of `fis` three ways:

```bash
samtools faidx rel606.fa NC_012967.1:3339162-3339164          # 1-based inclusive
printf "NC_012967.1\t3339161\t3339164\n" > ok.bed  && bedtools getfasta -fi rel606.fa -bed ok.bed
printf "NC_012967.1\t3339162\t3339164\n" > bad.bed && bedtools getfasta -fi rel606.fa -bed bad.bed
```

```
>NC_012967.1:3339162-3339164
ATG
>NC_012967.1:3339161-3339164
ATG
>NC_012967.1:3339162-3339164
TG
```

The third is the GFF start copied straight into a BED file. It returns `TG` — two bases, starting
one late. A missing start codon is at least *visible*. Now the version that is not.

The variant at POS 3339313 is inside this CDS. Compute its consequence with the correct 1-based
CDS start, then with the BED start reused as though it were 1-based:

```bash
python - <<'PY'
import pysam
from Bio.Seq import Seq
fa = pysam.FastaFile("rel606.fa")
CH, gff_start = "NC_012967.1", 3339162          # fis CDS start, straight from the GFF
pos, ref, alt = 3339313, "A", "C"               # the VCF record; POS is 1-based

for label, cds_start in [("CORRECT: 1-based GFF start        ", gff_start),
                         ("WRONG:   BED start used as 1-based", gff_start - 1)]:
    off = pos - cds_start
    ci, within = off // 3, off % 3
    cstart = cds_start + ci*3
    codon  = fa.fetch(CH, cstart-1, cstart+2).upper()
    mut    = codon[:within] + alt + codon[within+1:]
    a1 = Seq(codon).translate(table=11); a2 = Seq(mut).translate(table=11)
    print(f"{label}  offset={off}  codon #{ci+1}  base {within+1}")
    print(f"    {codon} -> {mut}   {a1} -> {a2}   "
          f"{'SYNONYMOUS' if a1==a2 else 'MISSENSE'}")
    print(f"    codon[{within}] = {codon[within]}, VCF REF = {ref}  -> "
          f"{'consistent' if codon[within]==ref else 'MISMATCH'}\n")
PY
```

```
CORRECT: 1-based GFF start          offset=151  codon #51  base 2
    TAT -> TCT   Y -> S   MISSENSE
    codon[1] = A, VCF REF = A  -> consistent

WRONG:   BED start used as 1-based  offset=152  codon #51  base 3
    CTA -> CTC   L -> L   SYNONYMOUS
    codon[2] = A, VCF REF = A  -> consistent
```

> **A one-base error in the CDS start turned a missense variant into a synonymous one — and the
> reference-allele sanity check passed in both cases.** It passes because shifting the CDS start
> by one shifts the codon window and the within-codon index together, so `codon[within]` still
> resolves to the same genomic base and still equals the VCF REF. The check is a tautology. The
> only thing that catches this class of error is validating against something independent: the
> full-ORF translation of §3.2, NCBI's own protein FASTA, or a second implementation. Off-by-one
> errors in genomics do not raise exceptions. They quietly change the biology you report.

The conversion table worth memorising:

| Format | Coordinates | Convert a 1-based point `p` |
|---|---|---|
| GFF3, GTF | 1-based inclusive | — |
| VCF | 1-based inclusive | — |
| SAM (POS field) | 1-based inclusive | — |
| `samtools faidx` regions | 1-based inclusive | — |
| BED | 0-based half-open | `[p-1, p)` |
| BAM (binary, and pysam's API) | 0-based half-open | `[p-1, p)` |
| `bedtools getfasta` | follows BED | `[p-1, p)` |
| UCSC browser display | 1-based | but its BED downloads are 0-based |

`pysam` is the trap inside the trap: `fa.fetch(chrom, start, end)` is 0-based half-open even
though the file it reads is a FASTA and the tool it wraps (`samtools faidx`) is 1-based on the
command line. Hence `fa.fetch(chrom, pos-1, pos)` for a single base at 1-based `pos`
([Ch 41](../part-09-genomics/41-data-formats.md)).

For indels there is a further subtlety: VCF anchors an indel on the base *before* the event, so
`TGG -> T` at POS 4431393 describes a deletion of the two bases at 4431394–4431395. The REF
allele spans 4431393–4431395, so its BED interval is `[4431392, 4431395)` — three bases wide for
a two-base deletion. `bedtools` gets this right when handed a VCF directly; hand-rolled
converters routinely do not.

## 6. The same reasoning, in a human genome

Everything above transfers, with one structural difference that changes the whole exercise:
**a bacterial gene has one coding sequence; a human gene has many transcripts, and consequence is
a property of the variant *and the transcript*, not of the variant alone.**

Take `rs1042522`, the common TP53 Pro72Arg polymorphism, and ask Ensembl VEP:

```bash
curl -sS --max-time 90 -H 'Content-type:application/json' \
  'https://rest.ensembl.org/vep/human/id/rs1042522?content-type=application/json&mane=1&canonical=1' \
  | python -c "
import sys, json, collections
v  = json.load(sys.stdin)[0]
tc = [t for t in v['transcript_consequences'] if t.get('variant_allele') == 'C']
print(f\"GRCh38 chr{v['seq_region_name']}:{v['start']}  {v['allele_string']}\")
print(f'transcript consequences for the C allele: {len(tc)}')
for k, n in collections.Counter(','.join(t['consequence_terms']) for t in tc).most_common():
    print(f'  {n:3d}  {k}')
"
```

```
GRCh38 chr17:7676154  G/A/C/T
transcript consequences for the C allele: 39
   26  missense_variant
    7  upstream_gene_variant
    2  intron_variant
    2  missense_variant,NMD_transcript_variant
    1  non_coding_transcript_exon_variant
    1  3_prime_UTR_variant,NMD_transcript_variant
```

Two practical notes, both hit while writing this. The call took **26.6 s** — VEP is doing real
work per transcript, so `-sS --max-time 90` rather than a bare `-s`, which would hide the failure.
And Ensembl REST rate-limits: fire several of these in quick succession and one returns empty with
exit status 0, which `json.load` reports as `Expecting value: line 1 column 1 (char 0)` — a JSON
parse error standing in for an HTTP problem. Add `-w '\nHTTP %{http_code}\n'` when that happens.

**One variant, one gene, 39 transcripts, six different consequence classes.** Four of them:

```
ENST00000269305  MANE=NM_000546.6  missense_variant                            aa=P/R  pos=72
ENST00000509690  MANE=-            intron_variant                              aa=-    pos=-
ENST00000635293  MANE=-            missense_variant,NMD_transcript_variant     aa=P/R  pos=33
ENST00000714358  MANE=-            3_prime_UTR_variant,NMD_transcript_variant  aa=-    pos=-
```

The identical base change is missense in one transcript, intronic in another, and 3′ UTR in a
third. Note also that even among the missense calls the residue number differs — **P72R** on the
MANE transcript, **P33R** on a transcript with a different start — so two databases can describe
the same variant with two different, both-correct HGVS strings.

This is why **MANE Select** exists: a per-gene transcript agreed between NCBI and EMBL-EBI, with
identical sequence under both a RefSeq (`NM_000546.6`) and an Ensembl (`ENST00000269305`)
accession, designated as the default for clinical reporting. Without it, "TP53 p.Pro72Arg" is
ambiguous. With it, the reference transcript is a fixed point that both databases share.

| | Bacterium (this lab) | Human |
|---|---|---|
| Transcripts per gene | 1 | 1–100+ |
| Consequence is a function of | variant | variant **×** transcript |
| Splicing | none | consequence classes for splice donor/acceptor/region |
| NMD | none | premature stop in a non-last exon → transcript degraded, not truncated protein |
| Reference transcript | the CDS | MANE Select, else canonical — must be stated |
| Standard tools | `bcftools csq` | VEP, SnpEff, Annovar |
| Coding fraction | 88% | ~1.5% |

Two consequences of that last row. First, most human variants are non-coding, so most of the
interpretive work is regulatory and cannot be done by translating codons — it needs chromatin
and expression data ([Ch 52](../part-11-human-and-statistical-genomics/52-association-to-mechanism.md)).
Second, "predicted loss of function" is a much weaker claim than it sounds: a premature stop in
the last exon escapes nonsense-mediated decay and often yields a functional protein, and a
frameshift at codon 1175 of 1259 — like `tamB` above — is a very different proposition from one
at codon 20.

And the class label is only the first step. Clinical interpretation adds population frequency,
segregation, functional assays and computational predictors under the ACMG/AMP framework, where
most missense variants land in "uncertain significance" and stay there
([Ch 55](../part-11-human-and-statistical-genomics/55-clinical-variant-interpretation.md)). The
9 missense calls in §3 are, in human terms, 9 VUSs.

---

## Check yourself

**1. Your annotator reports a variant as synonymous. It replaces the base your code says the reference has, in a codon that translates to a real amino acid, and the assertion `codon[within] == REF` passes. Name two errors that are still consistent with all of that, and the check that would catch them.**

<details><summary>Answer</summary>

**Wrong strand** and **off-by-one in the CDS start** are both consistent with every one of those
observations, and §3 and §5 produced exactly those false-synonymous calls.

The reference-base assertion cannot catch either, because it is a tautology: `codon[within]` and
the base at `pos` are the same byte of the FASTA under any self-consistent offset arithmetic.
Shift the CDS start by one and the codon window and the within-codon index shift together;
forget the reverse complement and the codon window is unchanged because CDS lengths are divisible
by three. In both cases the check still passes and the reported amino acid changes.

The check that works is external. Translate every CDS in the annotation end to end and require
length divisible by 3, exactly one stop codon, and that stop at the end. Correct extraction gave
98.1%; forgetting the reverse complement gave 47.1% — a difference no code review would have
found and no unit test on a single codon would have surfaced. Then confirm against something you
did not write: NCBI's protein FASTA, or `bcftools csq`.

</details>

**2. Nine coding variants, all missense, zero synonymous, against an N/S site ratio of 3.3. Why is this not evidence of positive selection?**

<details><summary>Answer</summary>

Because the sample cannot produce evidence. Under neutrality each coding mutation is synonymous
with probability S/(N+S) = 0.2325, so 9 changes give an expected 2.09 synonymous. Observing 0 has
exact binomial p = 0.0925 — and that is the **most extreme outcome the data could possibly
produce**. The entire achievable p-value range at n = 9 lies above 0.05, so the question is
unanswerable at this sample size regardless of what the data had shown. It would take 12
consecutive coding SNVs with none synonymous to reach p < 0.05.

Three further problems would remain even with a larger n:

- dN/dS was formulated for **fixed differences between species**. Applied to segregating variants
  within one population it is inflated by mildly deleterious alleles that selection has not yet
  removed.
- Nei–Gojobori assumes a **uniform mutation spectrum**. This sample's spectrum is 6/12 A:T→C:G
  with Ti/Tv = 0.33, wildly non-uniform, which redistributes opportunity between N and S sites.
- The variants are **ascertained** through QUAL ≥ 30 and DP ≥ 5 at ~6× coverage, and those filters
  do not sample the genome evenhandedly.

The genes involved really are recurrent targets of adaptation in the LTEE — but that conclusion
rests on convergence across independent replicate populations, not on this VCF.

</details>

**3. A collaborator sends a BED file of gene coordinates converted from a GFF. Every interval is exactly the right length. What do you check, and how?**

<details><summary>Answer</summary>

Correct length proves nothing, because the standard conversion error preserves it. GFF length is
`end - start + 1` and BED length is `end - start`; copying the GFF start unchanged into BED
yields an interval one base shorter, but copying *both* start and end unchanged — or applying
`+1` to the end to "fix" the length — yields a correctly-sized interval shifted one base right.

Check the **content**, not the arithmetic. For a plus-strand protein-coding gene, run
`bedtools getfasta` on the first three bases: a correct interval starts with `ATG` (or `GTG`/
`TTG` in bacteria). We did exactly this on `fis` — the correct BED gave `ATG`, the naive one gave
`TG`.

Better, do it at scale: extract all intervals, translate, and count how many are clean ORFs. That
is one command and it catches frame errors, strand errors and off-by-ones in a single pass. As a
cheap smoke test, verify one known coordinate against a source with a different convention —
`samtools faidx` is 1-based, so `samtools faidx ref.fa chr:S+1-E` must return the same string as
`bedtools getfasta` on `chr S E`.

</details>

**4. A clinical report says "TP53 c.215C>G p.Pro72Arg, missense". A second lab reports the same patient's variant as p.Pro33Arg, and a third calls it intronic. All three used the same GRCh38 position. Who is wrong?**

<details><summary>Answer</summary>

Nobody. Consequence is a property of the variant **and a transcript**, and TP53 has 39
transcripts overlapping this position. VEP reports missense on 26 of them, intronic on 2,
3′ UTR on 1, and non-coding-exonic on 1 — all for the same base change. The two protein
coordinates come from transcripts with different translation start sites, so P72R and P33R
describe the same substitution numbered from different first residues.

What is wrong is reporting a consequence without naming the transcript. The convention that
resolves it is **MANE Select**: one transcript per gene, agreed between NCBI and EMBL-EBI, with
byte-identical sequence under a RefSeq and an Ensembl accession
(here `NM_000546.6` = `ENST00000269305`), designated as the default for clinical reporting. On
that transcript the answer is p.Pro72Arg. A report should carry the transcript accession with
version, and a variant-level HGVS string is incomplete without one.

For an organism with one transcript per gene this problem does not exist, which is why every
habit you build on bacterial data has to be re-examined before it is used on humans
([Ch 55](../part-11-human-and-statistical-genomics/55-clinical-variant-interpretation.md)).

</details>
