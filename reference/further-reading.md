# Further reading

Where to go after this curriculum, organised by what you want to do next. Annotated, because
an unannotated reading list is just a way of feeling productive without deciding anything.

## Textbooks

The three that matter, and what each is actually for.

**Griffiths et al., *Introduction to Genetic Analysis*** — the standard undergraduate genetics
text. Its strength is problem sets: hundreds of them, well-graded, and the reason it has
survived a dozen editions. If you want more practice than [`problem-sets/`](../problem-sets/)
provides, this is where to get it. Weak on modern genomics.

**Brown, *Genomes*** — the counterpart to Griffiths for genomics proper. Better than most at
explaining *why* techniques work rather than cataloguing them. Somewhat dated on sequencing
technology, which is unavoidable for any printed genomics book.

**Hartwell et al., *Genetics: From Genes to Genomes*** — a reasonable alternative to Griffiths
with a more molecular emphasis. Pick one, not both.

For the quantitative side, where the undergraduate texts thin out badly:

**Falconer & Mackay, *Introduction to Quantitative Genetics*** — still the clearest treatment
of variance decomposition, breeding values and response to selection. Old, and none the worse
for it; the theory has not moved. Read this if [Part 6](../part-06-quantitative-genetics/30-quantitative-traits.md)
left you wanting the full derivations.

**Hartl & Clark, *Principles of Population Genetics*** — the standard reference for
[Part 5](../part-05-population-genetics/26-hardy-weinberg.md). Thorough and fairly demanding.

**Wakeley, *Coalescent Theory: An Introduction*** — if the backward-in-time framing in
[Ch 34](../part-07-molecular-evolution/34-phylogenetics.md) appealed to you, this develops it
properly. Genuinely elegant mathematics.

**Vitti, Grossman & Sabeti**, and the selection-scan literature generally — for going deeper
than [Ch 33](../part-07-molecular-evolution/33-neutral-theory-and-selection-tests.md).

## Landmark papers

Read primary literature early. These are chosen because they are *readable*, not merely
important — many famous papers are impenetrable without period context.

| Paper | Why read it |
|---|---|
| Watson & Crick 1953, *Nature* | Two pages. The most consequential understatement in science ("It has not escaped our notice…"). Read it alongside Franklin & Gosling in the same issue, which supplied the data |
| Meselson & Stahl 1958, *PNAS* | Often called the most beautiful experiment in biology. The density-gradient logic is a masterclass in designing an experiment that can only come out three ways |
| Luria & Delbrück 1943 | Statistical reasoning used to settle a biological question — whether mutation precedes selection. The variance argument is the whole paper |
| Jacob & Monod 1961, *J Mol Biol* | The operon, and the invention of thinking about genes as a regulatory circuit |
| Kimura 1968, *Nature* | Neutral theory. Short, and it reframed molecular evolution permanently |
| McClintock's transposition work | Resisted for decades. Worth reading partly as a case study in how a field rejects an unfamiliar idea |
| International Human Genome Sequencing Consortium 2001, *Nature* | The draft genome. Read the analysis sections, not the methods |
| Nurk et al. 2022, *Science* — "The complete sequence of a human genome" | T2T-CHM13. What the last 8% contained |
| Liao et al. 2023, *Nature* — draft human pangenome | The conceptual shift from one reference to many. See [Ch 45](../part-09-genomics/45-reference-genomes-and-pangenomes.md) — and note that HPRC has since moved to Release 2 |
| Richards et al. 2015, *Genet Med* | The ACMG/AMP variant interpretation framework. Still the operative standard; read it before [Ch 55](../part-11-human-and-statistical-genomics/55-clinical-variant-interpretation.md) is applied in anger |
| Fisher 1918 | The paper that reconciled Mendelian inheritance with continuous variation and founded quantitative genetics. Hard going, but the argument is worth reconstructing |

## Databases and resources

The ones you will actually use. Check versions — everything here moves.

**Sequence and annotation**
- [Ensembl](https://www.ensembl.org) and [UCSC Genome Browser](https://genome.ucsc.edu) — the two
  main browsers. Learn one properly; UCSC's track system rewards investment
- [GENCODE](https://www.gencodegenes.org) — the reference annotation. Its
  [statistics page](https://www.gencodegenes.org/human/stats.html) is where this curriculum's
  gene counts come from
- [NCBI](https://www.ncbi.nlm.nih.gov) — RefSeq, GenBank, PubMed, SRA

**Variation**
- [gnomAD](https://gnomad.broadinstitute.org) — population allele frequencies. The single most
  useful resource in clinical genomics
- [ClinVar](https://www.ncbi.nlm.nih.gov/clinvar/) — clinical variant assertions. Read the
  evidence, not the label
- [ClinGen](https://clinicalgenome.org) — gene-disease validity, dosage sensitivity, and the
  SVI recommendations that refine ACMG
- [dbSNP](https://www.ncbi.nlm.nih.gov/snp/), [GWAS Catalog](https://www.ebi.ac.uk/gwas/)

**Functional**
- [GTEx](https://gtexportal.org) — expression and eQTLs across human tissues
- [ENCODE](https://www.encodeproject.org) — regulatory element annotation
- [Human Cell Atlas](https://www.humancellatlas.org), [Single Cell Portal](https://singlecell.broadinstitute.org)
- [COSMIC](https://cancer.sanger.ac.uk/cosmic) — somatic mutations and mutational signatures
- [UniProt](https://www.uniprot.org), [AlphaFold DB](https://alphafold.ebi.ac.uk), [PDB](https://www.rcsb.org)

**Model organisms** — FlyBase, WormBase, SGD, MGI, ZFIN, TAIR. Each is the authoritative
annotation for its organism and generally better curated than the generic databases.

## Courses and lectures

- **MIT 7.03 Genetics** and **7.28 Molecular Biology** — full lecture videos on OCW. Strong on
  the classical material
- **Harvard/Broad StatGen resources** — for the statistical genetics in
  [Part 11](../part-11-human-and-statistical-genomics/51-gwas.md)
- **Rosalind** ([rosalind.info](http://rosalind.info)) — bioinformatics as programming problems.
  Excellent fit for this curriculum's reader; do these alongside [`labs/`](../labs/)
- **Biostars** ([biostars.org](https://www.biostars.org)) — the field's Stack Overflow. Search
  it before debugging anything; someone has hit your error

## Keeping current

Genomics rots. [`verified-facts.md`](verified-facts.md) records what will rot first in this
curriculum, but for the field generally:

- **bioRxiv/medRxiv** — where the field actually publishes first
- **Genome Biology**, **Nature Methods**, **Nature Genetics**, **AJHG** — for methods and human genetics
- **Heng Li's blog and GitHub** — consistently the clearest thinking on alignment and assembly
- **Conference proceedings** — ASHG for human genetics, ISMB/RECOMB for computational, AGBT for technology

A working habit worth adopting: when you encounter a number in a paper, check whether it is
current before you repeat it. Building this curriculum turned up a pangenome release two years
out of date and a sequencing platform six weeks old, both of which would have been written
confidently and wrongly from memory.

## On the ethics and social dimension

Do not treat [Ch 58](../part-12-applications-and-ethics/58-ethics-and-society.md) as the end
of the subject.

- **Rutherford, *A Brief History of Everyone Who Ever Lived*** — accurate popular treatment of
  human genetic history, and good on why continental race categories fail as genetics
- **Skloot, *The Immortal Life of Henrietta Lacks*** — consent, exploitation, and what
  researchers owe the people whose samples they use
- **Kevles, *In the Name of Eugenics*** — the history that explains why genetics carries the
  political weight it does. Uncomfortable and necessary
- **Comfort, *The Science of Human Perfection*** — how medical genetics and eugenics were
  entangled far longer than the field likes to admit
- **Nelson, *The Social Life of DNA*** — genetic ancestry testing, identity, and reconciliation

The historical material is not decoration. Most contemporary arguments about genetics and
society are replays, and knowing the earlier round is the fastest way to evaluate the current one.
