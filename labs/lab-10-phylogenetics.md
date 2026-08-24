# Lab 10 — Phylogenetics from sequence to tree

> **Time:** ~40 min · **Before this:** [Ch 34](../part-07-molecular-evolution/34-phylogenetics.md)

Build a phylogeny of six primates from complete mitochondrial genomes, and interrogate what the
numbers on the branches actually mean. All output is real.

Three statistical ideas do the work here — model selection, maximum likelihood, and the bootstrap.
You do not need to arrive fluent in them: each gets a short box at the point where it first bites,
pointing into the statistics track ([S3](../part-S-statistics/S3-sampling-and-estimation.md),
[S6](../part-S-statistics/S6-likelihood-and-bayes.md)).

```bash
# GENOMICS is exported in lab-00. In a fresh shell, set it again:
#   export GENOMICS=/path/to/learn-genomics
cd "$GENOMICS" && source .venv/bin/activate
mkdir -p labs/data/phylo && cd labs/data/phylo
export PATH="$HOME/bin:$PATH"
```

**Tool note.** IQ-TREE is not a Homebrew formula — download from [iqtree.org](http://www.iqtree.org/)
and put the binary on your `PATH`. The macOS build used here is x86-64 and runs under Rosetta on
Apple Silicon; it is fast enough for this and any dataset you are likely to build by hand.

---

## 1. Fetch the sequences

Mitochondrial genomes are ideal for a first phylogeny: single-copy, non-recombining, maternally
inherited, fast-evolving enough to resolve recent splits, and available complete for almost
every vertebrate.

```bash
: > mito.fa
while IFS=' ' read -r acc name; do
  curl -sL "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=nuccore&id=${acc}&rettype=fasta&retmode=text" -o tmp.fa
  { echo ">$name"; tail -n +2 tmp.fa | tr -d '\n'; echo; } >> mito.fa
  sleep 1
done <<'EOF'
NC_012920 Homo_sapiens
NC_001643 Pan_troglodytes
NC_001645 Gorilla_gorilla
NC_002083 Pongo_abelii
NC_002764 Macaca_sylvanus
NC_005089 Mus_musculus
EOF
seqkit stats mito.fa
```

Six genomes, 16,299–16,586 bp each. Note the macaque here is **NC_002764, the Barbary macaque
*Macaca sylvanus*** — not the rhesus macaque *M. mulatta*, which is NC_005943 and 16,564 bp.
Accession and species name have to be checked against each other every time; a tree labelled
with the wrong taxon is wrong in the only way that matters, however good the branch supports.

*Mus musculus* is the **outgroup** — a taxon known to lie
outside the group of interest, included so the tree can be rooted (§5).

The `sleep 1` respects NCBI's rate limit. Hammering E-utilities gets you blocked.

## 2. Align

```bash
mafft --auto --quiet mito.fa > mito_aln.fa
seqkit stats mito_aln.fa
```

Runs in ~8 s. All six sequences emerge at **17,421 columns** — longer than any input, because
alignment inserts gaps.

> **Alignment is the step most likely to be wrong, and the one least often questioned.** Every
> downstream inference treats the alignment as observed data, but it is itself an inference —
> and errors in it propagate silently into tree topology and branch lengths. If two sequences
> are misaligned over a region, the model sees substitutions that never happened.
>
> Mitochondrial genomes across primates are easy: colinear, similar length, no rearrangement.
> Aligning divergent sequences with indels, or protein-coding sequence without respecting codon
> structure, is where alignment error becomes a real problem.

## 3. Choose a substitution model

```bash
iqtree2 -s mito_aln.fa -m MFP -B 1000 -T 2 --prefix mito
grep -i "Best-fit model" mito.log
```

```
Best-fit model: TIM2+F+R2 chosen according to BIC
```

`-m MFP` runs ModelFinder Plus, which fits many substitution models and picks by BIC. Decoding
the answer:

| Component | Meaning |
|---|---|
| **TIM2** | Transition model 2 — distinct rates for different substitution types, rather than assuming all are equal |
| **+F** | Base frequencies taken from the data, not assumed equal |
| **+R2** | Free-rate heterogeneity with 2 categories — sites evolve at different rates |

Why bother? Because the simplest model, Jukes–Cantor, assumes every substitution type is equally
likely and every site evolves at the same rate. Both are false for real sequence, and mtDNA
violates them badly: transitions vastly outnumber transversions, base composition is skewed, and
rate varies enormously between the control region and protein-coding genes.

Fitting a model that ignores this **systematically underestimates divergence**, because it
cannot account for multiple substitutions at the same site.

> **The statistics here.** ModelFinder fits every candidate model to the alignment by maximum
> likelihood and ranks them by BIC = *k* ln *n* − 2 ln *L̂* — the fitted log-likelihood, penalised
> for the number of free parameters *k*. **Lower is better**, and because the penalty scales with
> ln *n*, a 17,421-column alignment charges a steep price per parameter: BIC systematically
> prefers smaller models than AIC does. That is not academic here. On this exact run AIC picks
> GTR+F+R2 and BIC picks TIM2+F+R2, which is why IQ-TREE bothers to print *chosen according to
> BIC* rather than just "best"
> ([S6 §8](../part-S-statistics/S6-likelihood-and-bayes.md) works both criteria through on this
> file's own numbers). And note the standing assumption: an information criterion ranks the models
> you fitted. It cannot tell you the true one was never on the list.

## 4. The tree ★

```bash
cat mito.treefile
```

```
(Homo_sapiens:0.0537,
 Pan_troglodytes:0.0562,
 (Gorilla_gorilla:0.0728,
  (Pongo_abelii:0.1214,
   (Macaca_sylvanus:0.2832,
    Mus_musculus:1.1071)100:0.0766)100:0.0491)100:0.0191);
```

Reading it as a nested structure:

```
                    ┌─ Homo_sapiens
              ┌─────┤
              │     └─ Pan_troglodytes
        ┌─────┤
        │     └─ Gorilla_gorilla
   ┌────┤
   │    └─ Pongo_abelii
   │
   ├─ Macaca_sylvanus
   │
   └─ Mus_musculus   (outgroup, branch 1.107)
```

**Every internal node has 100% bootstrap support**, and the topology is the accepted primate
phylogeny: human and chimpanzee are sisters, then gorilla, then orangutan, then macaque, with
mouse outside. Six mitochondrial genomes and one command recover a result that took decades of
morphology to settle.

Look at the branch lengths, in substitutions per site:

| Branch | Length |
|---|---|
| *Homo sapiens* | 0.054 |
| *Pan troglodytes* | 0.056 |
| *Gorilla gorilla* | 0.073 |
| *Pongo abelii* | 0.121 |
| *Macaca sylvanus* | 0.283 |
| ***Mus musculus*** | **1.107** |

The mouse branch is **20 times** longer than the human branch. That is expected — mouse diverged
long before the primates split from each other — but it is also the classic setup for **long-branch
attraction**, where parsimony methods erroneously group long branches together because they
accumulate convergent changes by chance. Model-based maximum likelihood is much more resistant
because it explicitly accounts for multiple hits, which is one of the strongest arguments for ML
over parsimony ([Ch 34](../part-07-molecular-evolution/34-phylogenetics.md)).

> **The statistics here.** The tree is a maximum-likelihood estimate. For a candidate topology
> IQ-TREE finds the branch lengths that make the observed alignment most probable under
> TIM2+F+R2, then keeps the topology whose maximised likelihood is highest
> ([S6](../part-S-statistics/S6-likelihood-and-bayes.md)). Two assumptions carry the weight: that
> sites evolve independently, and that one tree generated all 17,421 columns. Read a branch length
> as a fitted parameter in **expected substitutions per site** — not a time, not a percentage of
> differing bases, and not a quantity with a printed error bar. It behaves like any other MLE:
> it converges on the truth as data accumulate, and it is only as trustworthy as the model it was
> fitted under.

## 5. Rooting

The Newick string above is **unrooted** — it prints as a trifurcation, with human, chimp and
everything-else radiating from one point. An unrooted tree shows relationships but not the
direction of time.

The outgroup provides the root. Because *Mus* is known to lie outside the primates on independent
evidence, the root must be on the branch leading to it. Placing it there makes the tree
time-directed and lets you read which splits happened first.

**Without an outgroup you cannot root a tree from the sequence data alone.** Rooting is an
external assumption, not something the alignment tells you.

## 6. Distances, and why one exceeds 1.0

```bash
cat mito.mldist
```

```
Homo_sapiens     0.0000  0.1041  0.1337  0.2123  0.4240  1.2180
Pan_troglodytes  0.1041  0.0000  0.1373  0.2292  0.4387  1.2685
Gorilla_gorilla  0.1337  0.1373  0.0000  0.2280  0.4392  1.2429
Pongo_abelii     0.2123  0.2292  0.2280  0.0000  0.4554  1.2957
Macaca_sylvanus  0.4240  0.4387  0.4392  0.4554  0.0000  1.3517
Mus_musculus     1.2180  1.2685  1.2429  1.2957  1.3517  0.0000
```

Distances from human increase exactly as the phylogeny predicts: chimp 0.104 < gorilla 0.134 <
orangutan 0.212 < macaque 0.424 < mouse 1.218.

> **Human–mouse distance is 1.218 substitutions per site — greater than one.** This is not an
> error, and understanding why is the point of the section.
>
> The *observed* proportion of differing sites (p-distance) can never exceed 0.75 for DNA: with
> four bases, two random sequences differ at ~3/4 of positions. But the **corrected** distance
> estimates the number of substitutions that actually *occurred*, including multiple hits at the
> same site that leave no trace. A site can change A→G→T and be counted once.
>
> Over deep divergences most substitutions are invisible, so the correction is large. 1.218
> means roughly 1.2 substitutions per site have occurred on the path between human and mouse
> mitochondria — the sequences are effectively saturated, and the estimate carries wide
> uncertainty. This is exactly the correction Jukes–Cantor introduces and richer models refine
> ([Ch 33](../part-07-molecular-evolution/33-neutral-theory-and-selection-tests.md)).

> **The statistics here.** Every cell is a maximum-likelihood *estimate* — the distance that makes
> that pair's observed columns most probable under the fitted model — printed as a bare point
> value with no interval attached. Both kinds of error matter, and they are not the same size.
> [S6](../part-S-statistics/S6-likelihood-and-bayes.md) fits the simpler K80 model to the 15,981
> unambiguous human–chimp columns and gets 0.094, with a 95% interval of [0.089, 0.100] — tight,
> because 15,981 columns is a great deal of data. The 0.1041 in the table above is the same pair
> under the richer TIM2+F+R2, and it falls *outside* that interval. **Model choice moves these
> numbers further than sampling error does.** So read 1.218 as "saturated, and strongly
> model-dependent" rather than as a precise figure with a small wobble.

## 7. What bootstrap support is not

Every node here shows 100. That is a strong result and a commonly misread one.

**Bootstrap resamples alignment columns with replacement**, rebuilds the tree from each replicate,
and reports how often each node recurs. It measures **whether the signal is spread through the
alignment or concentrated in a few sites**.

> **The statistics here.** `-B 1000` ran the *ultrafast* bootstrap: 1,000 replicate alignments,
> each formed by drawing 17,421 columns with replacement from the original 17,421, a tree inferred
> from each, and the percentage of replicates recovering each clade reported. The resampling unit
> is the **column**, and that fixes what the number can possibly mean — "what if I had sequenced a
> different sample of *sites*?", and nothing else
> ([S3 §6](../part-S-statistics/S3-sampling-and-estimation.md) does the phylogenetic case
> explicitly). It also fixes the assumption: columns are treated as independent, exchangeable
> draws from one process, so every replicate inherits the same alignment and the same model, and
> any error in either survives resampling untouched. On reading the value, thresholds are
> flavour-specific — UFBoot support is calibrated so that **≥95 is the conventional cutoff**,
> whereas the slower classic bootstrap (`-b`) is conservative and read at around 70.

It does **not** measure the probability the node is correct. Bootstrap cannot detect error that is
consistent across the whole alignment:

- A systematically wrong alignment gives high bootstrap on the wrong tree
- A misspecified substitution model gives high bootstrap on the wrong tree
- Long-branch attraction gives high bootstrap on the wrong tree
- Real biological conflict — introgression, incomplete lineage sorting, horizontal transfer —
  means no single tree is right, and mitochondrial data cannot see it

Our 100% values say the 16 kb alignment is internally consistent. They do not certify the
topology, and a single non-recombining locus tells you the history of *that locus*, which need
not equal the species tree.

---

## Check yourself

**1. The human–mouse distance is 1.218 substitutions per site. How, when only four bases exist?**

<details><summary>Answer</summary>

Because it is a **corrected** distance, estimating substitutions that occurred rather than
differences observed.

The observed proportion of differing sites saturates at ~0.75 for DNA — two random sequences
share a base at ~1/4 of positions by chance. But over long divergences a site may be hit
repeatedly (A→G→T counts once) or revert (A→G→A counts as zero). Model-based correction infers
the hidden events.

A value above 1 signals near-saturation: most information about the true number of changes has
been erased, so the estimate has wide uncertainty. It is one reason very deep phylogenies are
better resolved with protein sequence or with slowly-evolving genes.

</details>

**2. All nodes show 100% bootstrap. Is the topology certainly correct?**

<details><summary>Answer</summary>

No. Bootstrap measures **repeatability under resampling of alignment columns** — whether the
signal is distributed across the alignment or driven by a handful of sites. It cannot detect
error that is consistent across the whole alignment.

High bootstrap on a wrong tree arises from systematic alignment error, model misspecification,
and long-branch attraction. And where the true history is not tree-like — introgression,
incomplete lineage sorting — no topology is correct, yet bootstrap will still be high.

Here the topology is independently well supported, so we can be confident. But that confidence
comes from outside evidence, not from the bootstrap value.

</details>

**3. Why is Jukes–Cantor a poor choice for this dataset, and what does using it cost?**

<details><summary>Answer</summary>

JC69 assumes all four bases are equally frequent and all substitution types equally likely. Both
assumptions fail badly for mtDNA: base composition is strongly skewed, and transitions
outnumber transversions by a large factor.

ModelFinder chose **TIM2+F+R2** — unequal substitution rates, empirical base frequencies, and
two rate categories across sites.

The cost of using JC69 is **systematic underestimation of divergence**, because a model that
cannot represent rate heterogeneity has no way to account for multiple hits at fast-evolving
sites. Branch lengths shrink, deep divergences compress, and any molecular-clock date derived
from them is too recent. Topology is often robust; branch lengths and dates are not.

</details>

**4. You add a seventh species and the tree changes, with the new taxon placed inside the primates on a long branch. What do you check?**

<details><summary>Answer</summary>

A long branch landing in an unexpected place is the signature of **long-branch attraction** or a
data problem, and both are worth excluding before believing the result.

Check, in order:

1. **Is the sequence what you think it is?** BLAST it. Mislabelled records and contaminated
   assemblies are common, and a bacterial or human contaminant will attach itself somewhere
   arbitrary.
2. **Did the alignment survive?** A divergent sequence can wreck a multiple alignment; inspect
   the columns around it and check whether the new taxon is aligned or effectively randomised.
3. **Long-branch attraction.** Long branches accumulate convergent changes by chance and attract
   each other — notably toward your existing long outgroup branch. Test by removing the outgroup
   and re-running: if placement shifts, LBA is implicated.
4. **Model adequacy.** LBA is worst under parsimony and under-parameterised models. Re-run
   ModelFinder including the new taxon; the best model may change.
5. **Taxon sampling.** Adding intermediate taxa that break up the long branch is the most
   effective fix, and often the only real one.

If it survives all five, consider that it may be right — or that the gene tree genuinely differs
from the species tree through introgression or incomplete lineage sorting, which a single
non-recombining locus cannot distinguish.

</details>
