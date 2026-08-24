# Glossary

Every term the curriculum relies on, defined once, with a link to the chapter that develops it properly — a one-line definition is a reminder, not a substitute for the derivation. Terms are grouped alphabetically; where a term is routinely misunderstood the entry says explicitly what it is *not*, because in genetics the confident wrong belief is usually the expensive one. Quantitative terms carry their units (cM, bp, substitutions/site), and where a definition depends on a number, that number is pinned in [`reference/verified-facts.md`](reference/verified-facts.md) rather than remembered here. For the formulas themselves — and the assumptions each one hides — see [`reference/formulas.md`](reference/formulas.md), which points at the chapter that derives each result.

---

## A

**A/B compartments** — Megabase-scale partition of the genome into two spatial classes, recovered as the sign of PC1 of the Hi-C correlation matrix; A is gene-dense and active, B is not, and the eigenvector's sign is arbitrary until oriented against gene density. [Ch 50](part-10-functional-genomics/50-3d-genome.md)

**ab initio gene finding** — Predicting gene structure from sequence alone by decoding a generalised HMM over exon/intron/intergenic states; accurate for bacteria, insufficient alone for vertebrates, where evidence from observed transcripts and cross-species alignment does most of the work. [Ch 44](part-09-genomics/44-annotation.md)

**accessibility (chromatin)** — The property of not being nucleosome-occluded and therefore reachable by a probing enzyme; a necessary but not sufficient condition for regulation, since insulators, poised elements and repressed-but-open regions all score as accessible. [Ch 49](part-10-functional-genomics/49-epigenome-profiling.md)

**ACMG/AMP framework** — The 2015 rule set that combines weighted evidence codes into five clinical tiers; it classifies the *evidence about* a variant in a specific gene–disease context, not the variant in the abstract. See also *VUS*. [Ch 55](part-11-human-and-statistical-genomics/55-clinical-variant-interpretation.md)

**additive genetic variance (V_A)** — The variance of the fitted values from regressing genotypic value on allele count; the only component transmitted through meiosis, and hence the one that predicts response to selection. [Ch 30](part-06-quantitative-genetics/30-quantitative-traits.md)

**admixture** — Gene flow between previously separated populations, producing individuals whose genome is a mosaic of ancestries and generating long-range linkage disequilibrium even between unlinked loci. [Ch 28](part-05-population-genetics/28-structure-and-inbreeding.md)

**affine gap penalty** — Alignment scoring that charges separately for opening and extending a gap; not a refinement of the linear penalty but a different and better model, since one 12 bp indel and twelve scattered 1 bp indels have wildly different prior probabilities. [Ch 42](part-09-genomics/42-read-alignment.md)

**allele** — One of the alternative sequences found at a locus; a difference, not a thing, and defined only relative to the other sequences segregating in the population. [Ch 10](part-02-transmission-genetics/10-mendelian-inheritance.md)

**allele dropout** — Failure of an assay to detect one of the two alleles present, producing a spurious homozygote; the leading cause of heterozygote deficit in genotyping data and hence of Hardy–Weinberg failure. [Ch 26](part-05-population-genetics/26-hardy-weinberg.md)

**allele frequency (p, q)** — The proportion of gene copies in a population that are a given allele; computable from genotype counts as an identity, whereas the reverse direction requires a model. [Ch 26](part-05-population-genetics/26-hardy-weinberg.md)

**allele surfing** — Rise of an allele to high frequency in newly colonised territory because it happened to sit on an advancing range front and rode a chain of founder events; drift with a spatial ratchet, and one of the neutral processes that manufactures steep clines and *F*<sub>ST</sub> outliers with no selection anywhere. [Ch 35A](part-07-molecular-evolution/35A-speciation-and-ecological-genetics.md)

**allelic architecture** — The joint distribution of effect size against allele frequency for a trait; the corner that is empty — common variants of large effect — is empty because selection removes them, not because nobody looked. [Ch 54](part-11-human-and-statistical-genomics/54-rare-variants-and-mendelian-disease.md)

**allolactose** — The actual inducer of the *lac* operon, made from lactose by β-galactosidase — the very enzyme the operon encodes, which is why leaky basal expression is required for induction to bootstrap. [Ch 21](part-04-gene-regulation/21-bacterial-regulation.md)

**ALT contig** — An alternate haplotype sequence shipped alongside the primary reference assembly; adding them without alt-aware post-processing makes calling worse, because reads multi-map and MAPQ collapses to 0. [Ch 45](part-09-genomics/45-reference-genomes-and-pangenomes.md)

**alternative splicing** — Production of multiple mature mRNAs from one pre-mRNA by differential exon and splice-site selection; GENCODE 50 lists 644,292 transcripts from 78,733 genes, which bounds proteome diversity from above rather than measuring it. [Ch 06](part-01-molecular-foundations/06-rna-processing.md)

**Alu element** — A ~300 bp Pol III-transcribed SINE at ~1.1 million copies (~11% of the human genome) that encodes no protein and propagates by hijacking L1's ORF2p. [Ch 19](part-03-genome-instability/19-transposable-elements.md)

**aneuploidy** — An abnormal chromosome number that is not a whole multiple of the haploid set; preimplantation testing puts human embryo aneuploidy near 20–30% in the early thirties and above 50% past about 40. See also *ploidy*. [Ch 20](part-03-genome-instability/20-chromosome-abnormalities.md)

**Anfinsen's principle** — That a protein's native structure is determined by its amino acid sequence; untouched by the existence of chaperones, which add no structural information and only suppress aggregation. [Ch 08](part-01-molecular-foundations/08-proteins-and-gene-function.md)

**annotation** — The set of asserted gene models, coordinates and functional labels laid over an assembly; a property of the annotation release, not of the genome, so re-running a pipeline against a newer GTF changes the numbers. [Ch 44](part-09-genomics/44-annotation.md)

**anticipation** — Earlier onset or greater severity of a disease in successive generations, caused by repeat-tract expansion during transmission — a physical change in DNA length, not inheritance of acquired severity, and inflated by ascertainment bias. [Ch 11](part-02-transmission-genetics/11-beyond-mendel.md)

**anticodon** — The tRNA triplet that base-pairs with a codon; the ribosome checks codon–anticodon geometry only and cannot verify which amino acid the tRNA is carrying. [Ch 07](part-01-molecular-foundations/07-genetic-code-and-translation.md)

**ascertainment bias** — Distortion introduced because the sample was collected conditional on the phenotype; in completely ascertained two-child sibships the recessive expectation is 4/7, not 1/4. [Ch 12](part-02-transmission-genetics/12-probability-and-testing.md)

**ATAC-seq** — Assay for accessible chromatin using Tn5 transposase to insert sequencing adapters into unprotected DNA; ~1–3% of the genome is accessible, and mitochondrial reads are the characteristic artefact. [Ch 49](part-10-functional-genomics/49-epigenome-profiling.md)

**attenuation** — Bacterial regulation that decides whether an *already-initiated* transcript is finished, by coupling ribosome position to RNA secondary structure; a different control point from repression, not a form of it. [Ch 21](part-04-gene-regulation/21-bacterial-regulation.md)

## B

**background selection** — The chronic reduction in neutral diversity near functional sites caused by purifying selection removing linked variation; the baseline against which sweeps must be judged, and it mimics a sweep's signature. [Ch 33](part-07-molecular-evolution/33-neutral-theory-and-selection-tests.md)

**BAM** — The compressed binary form of SAM; it contains alignment *hypotheses*, not reads — one read can produce primary, secondary and supplementary records, so rows ≠ reads. [Ch 41](part-09-genomics/41-data-formats.md)

**base editing** — Chemical conversion of one base to another at a targeted site without a double-strand break; standard deaminase editors make transitions only (C•G→T•A, A•T→G•C). [Ch 38](part-08-methods/38-genome-editing.md)

**base excision repair (BER)** — Removal of a damaged base by a lesion-specific glycosylase followed by patch resynthesis; the workhorse pathway for the ~10⁴–10⁵ spontaneous lesions per cell per day. [Ch 17](part-03-genome-instability/17-dna-repair.md)

**base stacking** — Hydrophobic and π-interaction between vertically adjacent bases; the dominant stabilising force in duplex DNA, and the reason GC-rich sequence melts higher — not the third hydrogen bond. [Ch 02](part-01-molecular-foundations/02-dna-structure.md)

**batch effect** — Systematic technical variation between processing groups; removable only if batch is not confounded with condition, in which case the design matrix is rank-deficient and no correction exists. [Ch 47](part-10-functional-genomics/47-rna-seq.md)

**Beavis effect** — Systematic upward bias in the estimated effect of a QTL that cleared a significance threshold in an underpowered study; shrinkage on replication is the expected behaviour of a *real* locus. See also *winner's curse*. [Ch 32](part-06-quantitative-genetics/32-mapping-quantitative-traits.md)

**BED format** — A 0-based, half-open interval format; converting to VCF or GFF coordinates means adding 1 to the start only — the end is the same integer in both conventions. [Ch 41](part-09-genomics/41-data-formats.md)

**bisulfite sequencing** — Chemical conversion of unmethylated cytosine to uracil to read methylation; it measures *non-conversion*, which is 5mC plus 5hmC plus whatever simply failed to convert. [Ch 49](part-10-functional-genomics/49-epigenome-profiling.md)

**bivalent** — A synapsed pair of homologous chromosomes in meiosis I, comprising four chromatids; a bivalent with no crossover has no chiasma to pull against and segregates at random. [Ch 09](part-02-transmission-genetics/09-mitosis-and-meiosis.md)

**bootstrap support** — The percentage of pseudoreplicate trees, built by resampling alignment columns with replacement, that recover a given split; a measure of repeatability under resampling, **not** the probability that the clade is correct — systematic error is present in every replicate. [Ch 34](part-07-molecular-evolution/34-phylogenetics.md)

**branch length** — On a phylogeny, expected substitutions per site — **not** elapsed time; converting requires a clock model plus an external calibration, both assumptions. [Ch 34](part-07-molecular-evolution/34-phylogenetics.md)

**breadth (of coverage)** — The fraction of the genome covered by at least one read, as opposed to *depth*, the mean number of reads per base; both are routinely called "coverage". See also *coverage*. [Ch 40](part-09-genomics/40-sequencing-technologies.md)

**breeder's equation** — R = h²S: response to selection equals narrow-sense heritability times the selection differential, valid only in the population and environment where h² was measured. [Ch 31](part-06-quantitative-genetics/31-heritability-and-selection.md)

**breeding value** — An individual's additive genetic merit, defined as twice the mean deviation of its offspring; the quantity that is actually transmitted, as opposed to genotypic value. [Ch 30](part-06-quantitative-genetics/30-quantitative-traits.md)

**broad consent** — Consent to future unspecified research use of a biosample or genome, the workhorse model for biobanking; its honest description is that you are consenting to a governance committee rather than to a study, because the studies do not exist yet. [Ch 58](part-12-applications-and-ethics/58-ethics-and-society.md)

**broad-sense heritability (H²)** — V_G/V_P, the fraction of phenotypic variance attributable to all genetic variance including dominance and epistasis; does not predict response to selection. [Ch 31](part-06-quantitative-genetics/31-heritability-and-selection.md)

**burden test** — A rare-variant test that collapses variants in a gene into a single count; it cancels toward zero when effects are bidirectional, and to exactly zero when they are balanced — a fact about the biology rather than the software. See also *SKAT*, *mask*. [Ch 54](part-11-human-and-statistical-genomics/54-rare-variants-and-mendelian-disease.md)

**Burrows–Wheeler transform (BWT)** — A reversible permutation of a string that clusters repeated contexts, making the FM-index possible; the basis of short-read aligners' memory efficiency. [Ch 42](part-09-genomics/42-read-alignment.md)

**bursting (transcriptional)** — Stochastic, episodic production of mRNA in which promoters cycle between on and off states; enhancers raise burst frequency rather than switching a gene on. [Ch 22](part-04-gene-regulation/22-eukaryotic-transcriptional-regulation.md)

**BUSCO** — A completeness metric based on recovery of conserved single-copy orthologs; blind to repeats, so an assembly missing every centromere can still score ~99%. [Ch 43](part-09-genomics/43-genome-assembly.md)

## C

**callable region** — The genomic interval in which a pipeline had enough evidence to have made a call had one existed; without a callable-region report, absence of a variant carries no information. [Ch 46](part-10-functional-genomics/46-variant-calling.md)

**cancer cell fraction (CCF)** — The proportion of tumour cells carrying a mutation, obtained by correcting VAF for purity, local copy number and mutant multiplicity; the only interpretable clonality measure. [Ch 56](part-11-human-and-statistical-genomics/56-cancer-genomics.md)

**5′ cap** — The 7-methylguanosine added to the 5′ end of Pol II transcripts co-transcriptionally; required for export, translation initiation and protection from exonucleases. [Ch 06](part-01-molecular-foundations/06-rna-processing.md)

**carrier frequency** — The frequency of heterozygotes for a recessive allele, ≈ 2q for rare alleles; carriers outnumber affected individuals by ≈ 2/q, so at incidence 1 in 10⁶ carriers are 2,000× more common than cases. [Ch 26](part-05-population-genetics/26-hardy-weinberg.md)

**Cas9** — The RNA-guided nuclease of the type II CRISPR system; it collides with DNA randomly, checks for a PAM first, and only then interrogates the guide — which is what makes genome-scale search feasible. [Ch 38](part-08-methods/38-genome-editing.md)

**catabolite repression** — Reduction of *lac* expression when glucose is available; glucose binds nothing in the *lac* system — its *transport* dephosphorylates EIIA^Glc, lowering cAMP and blocking the permease. [Ch 21](part-04-gene-regulation/21-bacterial-regulation.md)

**centimorgan (cM)** — The unit of genetic map distance: 1 cM corresponds to a 1% recombination frequency over short intervals. The human sex-averaged *autosomal* map is ~3,400–3,500 cM, so ~1.2 cM/Mb on average — an average that is locally wrong by orders of magnitude, since ~80% of events fall in <15% of the sequence. [Ch 14](part-02-transmission-genetics/14-linkage-and-mapping.md)

**central dogma** — Sequence information flows DNA → RNA → protein and not back from protein to nucleic acid; a claim about information transfer, not a claim that DNA controls everything. [Ch 00](part-00-orientation/00-the-whole-story.md)

**centromere** — The chromosomal region at which the kinetochore assembles; defined epigenetically by CENP-A nucleosomes, not by its DNA sequence — alpha satellite is the usual substrate, not the instruction, and neocentromeres form on ordinary sequence. [Ch 03](part-01-molecular-foundations/03-genomes-chromosomes-chromatin.md)

**chiasma** — The cytologically visible site of a crossover between non-sister chromatids; its mechanical job is to hold the bivalent together until anaphase I, with variation as a consequence. [Ch 09](part-02-transmission-genetics/09-mitosis-and-meiosis.md)

**ChIP-seq** — Chromatin immunoprecipitation followed by sequencing; a peak is a region of enrichment and therefore a *hypothesis* about binding, since crosslinking captures indirectly tethered proteins and hyper-ChIPable regions enrich with any antibody. [Ch 49](part-10-functional-genomics/49-epigenome-profiling.md)

**chi-square test** — Goodness-of-fit test comparing observed to expected class counts; it scales with N, so it must never be run on percentages, and df = (number of phenotypic classes) − 1 − (one more for each parameter estimated from the same data). [Ch 12](part-02-transmission-genetics/12-probability-and-testing.md)

**chromosome** — One continuous DNA molecule with its associated proteins in G1 or in a gamete, and *two* sister molecules sharing one centromere after S phase — count centromeres, not molecules. [Ch 09](part-02-transmission-genetics/09-mitosis-and-meiosis.md)

**chromothripsis** — A single catastrophic event producing tens to hundreds of clustered breakpoints, recognised by copy number oscillating between just two states and by join orientations spread *evenly across all four* possibilities, rather than by complexity alone. [Ch 20](part-03-genome-instability/20-chromosome-abnormalities.md)

**CIGAR string** — The compact encoding of an alignment's match/insert/delete/clip operations; `D` claims a deleted base and `N` claims an intron, which is a mechanistic claim the aligner made and that then propagates downstream. [Ch 41](part-09-genomics/41-data-formats.md)

**cis-acting** — Acting only on the same physical DNA molecule, as an operator or enhancer does; contrasted with *trans*-acting diffusible products, and distinguishable experimentally by the merodiploid test. [Ch 21](part-04-gene-regulation/21-bacterial-regulation.md)

**cline** — A gradient in allele frequency or phenotype across space; its **width** is conventionally the inverse of the maximum gradient, and at equilibrium between dispersal and selection *w* = σ√(8/*s*), so a narrow cline is a measurement of strong selection rather than a description of a boundary. [Ch 35A](part-07-molecular-evolution/35A-speciation-and-ecological-genetics.md)

**ClinVar** — The public archive of submitted clinical variant classifications with their supporting evidence; an aggregation of submitter opinions of varying quality, to be read at the level of review status rather than the headline label. [Ch 55](part-11-human-and-statistical-genomics/55-clinical-variant-interpretation.md)

**coalescent** — The backwards-in-time model of how sampled lineages merge into common ancestors; it predicts gene-tree discordance as the normal outcome when internal branches are short. [Ch 34](part-07-molecular-evolution/34-phylogenetics.md)

**codominance** — Both alleles' products detectable in the heterozygote as distinct phenotypes (ABO *AB*, MN blood group); distinct from incomplete dominance, which gives one intermediate phenotype. [Ch 11](part-02-transmission-genetics/11-beyond-mendel.md)

**codon** — A triplet of nucleotides specifying one amino acid or a stop; there are 64 codons for 20 amino acids plus stop, and one codon has exactly one meaning. [Ch 07](part-01-molecular-foundations/07-genetic-code-and-translation.md)

**cohesin** — The ring complex that holds sister chromatids together and, separately, extrudes chromatin loops [Ch 50](part-10-functional-genomics/50-3d-genome.md); in oocytes it is loaded before fetal prophase-I arrest and never replenished, which is the leading mechanism of the maternal age effect. [Ch 20](part-03-genome-instability/20-chromosome-abnormalities.md)

**colocalisation** — Testing whether a GWAS signal and a molecular QTL share a *causal variant* rather than merely overlapping within an LD block; low PP4 means no colocalisation only if PP3 is high, otherwise the region is simply underpowered. [Ch 52](part-11-human-and-statistical-genomics/52-association-to-mechanism.md)

**complementation test** — Crossing two recessive mutants to ask whether they disrupt the same gene; reliable only for recessive loss-of-function alleles, and broken by dominant-negatives, intragenic complementation and non-allelic non-complementation. [Ch 11](part-02-transmission-genetics/11-beyond-mendel.md)

**compound heterozygote** — An individual carrying two different variants in the same gene; a recessive diagnosis only if the two are in *trans*, and roughly half of by-chance pairs are in *cis*. [Ch 54](part-11-human-and-statistical-genomics/54-rare-variants-and-mendelian-disease.md)

**condensate** — A membraneless, dynamically assembled cluster of proteins and nucleic acids; clustering of Pol II and Mediator is well documented, but that it is genuine phase separation, and causal, remains contested. [Ch 22](part-04-gene-regulation/22-eukaryotic-transcriptional-regulation.md)

**consanguinity** — Mating between relatives; it creates no alleles and only raises the probability that two IBD copies of an allele the family already carried meet in one person, with the risk ratio scaling roughly as F/q. [Ch 15](part-02-transmission-genetics/15-pedigrees.md)

**conservation** — Retention of sequence across species beyond neutral expectation; evidence of past constraint and useful as a prior, but blind to lineage-specific function and to recently degraded sequence. [Ch 44](part-09-genomics/44-annotation.md)

**constraint (gene-level)** — Depletion of a class of variant relative to mutational expectation, summarised by pLI or LOEUF; a high LOEUF in a short gene means there was never enough expected variation to tell, and constraint is blind to recessive and late-onset genes. [Ch 54](part-11-human-and-statistical-genomics/54-rare-variants-and-mendelian-disease.md)

**copy number variation (CNV)** — Deletion or duplication of a kilobase-to-megabase segment; 4.8–9.5% of the genome is copy-number variable in healthy people, and CNVs account for more differing base pairs between two genomes than SNVs do. [Ch 20](part-03-genome-instability/20-chromosome-abnormalities.md)

**coverage** — Ambiguous by convention, and conflating the two senses causes real errors: *depth* is C = N·L/G, mean reads per base; *breadth* is the fraction of the genome with at least one read (1 − e^−C under uniformity). Depth is a mean over a non-uniform, overdispersed distribution, so it is the left tail that determines whether a heterozygote is called. [Ch 40](part-09-genomics/40-sequencing-technologies.md)

**CpG island** — A local region of elevated CpG density, typically at promoters, that escaped the germline methylation-and-deamination erosion responsible for the genome's overall CpG depletion. [Ch 23](part-04-gene-regulation/23-chromatin-and-epigenetics.md)

**CRAM** — A reference-based compressed alignment format storing differences from the reference; without the exact checksum-matched reference the file cannot be decoded at all. [Ch 41](part-09-genomics/41-data-formats.md)

**credible set** — The smallest set of variants holding 95% of the posterior probability of causality; the *set*, not each member, holds that mass, and only conditional on a sparsity prior, an effect-size prior, a maximum causal count and an LD matrix matching the sample. [Ch 52](part-11-human-and-statistical-genomics/52-association-to-mechanism.md)

**CRISPR** — A bacterial adaptive immune system storing a chronologically ordered, heritable memory of past infections as spacers; genome editing is a repurposing of one branch of it. See also *Cas9*. [Ch 24](part-04-gene-regulation/24-rna-based-regulation.md)

**crossing over** — Reciprocal exchange between non-sister chromatids of homologous chromosomes during prophase I; it creates new *combinations* of existing alleles, never new alleles. [Ch 09](part-02-transmission-genetics/09-mitosis-and-meiosis.md)

**CTCF** — The insulator-binding zinc-finger protein whose *oriented* sites stall cohesin-driven loop extrusion; deplete it and extrusion continues unimpeded while boundaries and corner peaks vanish, compartments untouched. Contrast *cohesin*, whose loss removes the boundary *preference* rather than the single-cell domains. [Ch 50](part-10-functional-genomics/50-3d-genome.md)

**ctDNA** — Circulating tumour DNA in plasma; a negative result means below the assay's limit of detection, which depends on shedding, tumour site and sequencing depth. [Ch 56](part-11-human-and-statistical-genomics/56-cancer-genomics.md)

**C-value paradox** — That genome size does not track organismal complexity; resolved by non-coding and repeat content. The remaining *C-value enigma* — why lineages differ so much and whether it matters — is open. [Ch 39](part-09-genomics/39-genome-landscapes.md)

## D

**D (linkage disequilibrium coefficient)** — D = p_AB − p_A·p_B, the excess of a haplotype over the product of its allele frequencies; a poor summary alone because its range depends on the allele frequencies. [Ch 29](part-05-population-genetics/29-linkage-disequilibrium.md)

**D′** — D normalised by its maximum given the allele frequencies; D′ = 1 says only that one of the four haplotypes is missing, and a rare allele on a common background gives D′ = 1 with r² ≈ 0.05. [Ch 29](part-05-population-genetics/29-linkage-disequilibrium.md)

**de Bruijn graph** — An assembly graph whose nodes are (k−1)-mers and edges are k-mers, turning assembly into an Eulerian path problem; better for many short reads, worse for few long ones because it discards read coherence. [Ch 43](part-09-genomics/43-genome-assembly.md)

**de-identification** — Removing direct identifiers from a dataset; it does not work for genomes, because ~30–40 common SNPs make a person unique and identifiability comes from the join with external data, which stripping columns does not touch. [Ch 58](part-12-applications-and-ethics/58-ethics-and-society.md)

**de novo mutation** — A variant present in an offspring and neither parent; ~60–70 per diploid genome per generation, ~80% paternal in origin, rising ~1.3–1.5 per year of paternal age. [Ch 16](part-03-genome-instability/16-mutation.md)

**deconvolution** — Estimating the cell-type composition underlying a bulk or spot-level measurement; required because capture-based spatial methods give per-*spot* mixtures rather than per-cell profiles. [Ch 48](part-10-functional-genomics/48-single-cell-and-spatial.md)

**degeneracy (of the genetic code)** — That several codons share one meaning; the map is many-to-one, which is the opposite of ambiguous. [Ch 07](part-01-molecular-foundations/07-genetic-code-and-translation.md)

**diagnostic odyssey** — The years of undirected testing many rare-disease patients pass through before sequencing; a negative genome means no causal variant was identified with current knowledge and coverage, and reanalysis of the same data adds diagnoses every year. [Ch 57](part-12-applications-and-ethics/57-genomics-in-practice.md)

**differential expression** — Testing whether a gene's expression differs between conditions, fitted as a negative binomial GLM on counts with size-factor offsets; significance and effect size are different quantities and both must be reported. [Ch 47](part-10-functional-genomics/47-rna-seq.md)

**diploid** — Carrying two copies of each chromosome, one from each parent; the two copies are homologs, not sisters, and differ at roughly 1 base in 1,000. [Ch 09](part-02-transmission-genetics/09-mitosis-and-meiosis.md)

**direct-to-consumer (DTC) testing** — Consumer genetic testing, which with few exceptions **genotypes** ~600,000–1,000,000 pre-chosen array positions rather than sequencing; rare variants are mostly absent and unreliably called, giving ~40% false positives among raw-data variants sent for clinical confirmation. [Ch 57](part-12-applications-and-ethics/57-genomics-in-practice.md)

**dispersion (α)** — The overdispersion parameter of the negative binomial capturing biological variability between replicates; Var(log FC) ≈ (1/n₁ + 1/n₂)(1/μ + α) — 2/n with equal groups — so depth attacks only the 1/μ term and saturates at α. [Ch 47](part-10-functional-genomics/47-rna-seq.md)

**dN/dS (ω)** — Nonsynonymous substitutions per nonsynonymous *site* divided by synonymous substitutions per synonymous *site*; ω < 1 purifying, = 1 neutral, > 1 positive, but the gene-wide average rarely exceeds 1 even under real positive selection. [Ch 33](part-07-molecular-evolution/33-neutral-theory-and-selection-tests.md)

**DNA methylation (5mC)** — Covalent methylation of cytosine, usually at CpG; it silences at promoter CpG islands but correlates *positively* with expression in gene bodies, where it is deposited co-transcriptionally. [Ch 23](part-04-gene-regulation/23-chromatin-and-epigenetics.md)

**DNA polymerase** — The enzyme that extends a primed strand 5′→3′ against a template; it does not unwind the helix — helicase does — and its intrinsic base selection contributes only ~10⁻⁵ of the final ~10⁻¹⁰ fidelity. [Ch 04](part-01-molecular-foundations/04-dna-replication.md)

**DNA repair** — The set of pathways that recognise and correct *damage* — abnormal or mispaired DNA detectable because something else disagrees. Repair cannot fix a mutation, which is a normal, correctly paired base pair with no evidence left. [Ch 17](part-03-genome-instability/17-dna-repair.md)

**Dobzhansky–Muller incompatibility (DMI)** — A pair of alleles, each harmless in its own genome, that lowers fitness when a hybrid brings them together; both must be **derived** and in **different** lineages, or the pair would already have been tested inside a population and removed. Not a bad gene — a property of an untested pair, and their number grows with the *square* of divergence. [Ch 35A](part-07-molecular-evolution/35A-speciation-and-ecological-genetics.md)

**dominance variance (V_D)** — The variance arising from within-locus interactions between alleles; not transmitted, because meiosis destroys the genotype combinations it lives in. [Ch 30](part-06-quantitative-genetics/30-quantitative-traits.md)

**dominant** — Describing an allele whose phenotype is expressed in the **heterozygote**. That is the entire content of the word: it says nothing about the allele's frequency, severity, fitness or molecular strength. Huntington disease is dominant and rare; ABO *O* is recessive and the commonest allele almost everywhere. Dominance is also indexed by phenotype and assay — *HbS* is recessive clinically, codominant on a gel, and dominant for malaria resistance. [Ch 10](part-02-transmission-genetics/10-mendelian-inheritance.md)

**dominant-negative** — A variant whose product actively poisons the wild-type product, often making a missense change more severe than a complete deletion of the same gene. [Ch 08](part-01-molecular-foundations/08-proteins-and-gene-function.md)

**dosage compensation** — The equalisation of sex-chromosome expression between sexes; a *problem*, not a mechanism — mammals silence one X, flies double the male X, worms halve both. [Ch 13](part-02-transmission-genetics/13-sex-linkage.md)

**drift (genetic)** — Change in allele frequency from random sampling of gametes; a variance process with E[p′] = p and *no* directional tendency — alleles are lost often because 0 is absorbing and most alleles start near it. [Ch 27](part-05-population-genetics/27-the-four-forces.md)

**drift load** — Deleterious alleles *fixed* by drift in a small population; unlike the masked load exposed by inbreeding it cannot be selected away, because no alternative allele remains to select for, so only immigration recovers it. The argument for gene flow that purging cannot answer. [Ch 35A](part-07-molecular-evolution/35A-speciation-and-ecological-genetics.md)

**driver mutation** — A somatic mutation conferring a selective advantage on the clone carrying it; drivers are acquired constantly in normal tissue and almost never produce a tumour, and on average 4–5 are needed together in a workable order. [Ch 56](part-11-human-and-statistical-genomics/56-cancer-genomics.md)

**duplicate (PCR)** — Multiple reads derived from one input molecule; they should be *marked* rather than deleted, because the duplicate rate measures library complexity, and a high rate means too few distinct molecules, not too much sequencing. [Ch 40](part-09-genomics/40-sequencing-technologies.md)

## E

**effective population size (N_e)** — The size of an idealised Wright–Fisher population that would drift at the observed rate; a harmonic mean over time discounted by sex ratio and reproductive variance, routinely 10–100× below census size. Human historical N_e ≈ 10,000 is a statistic about deep time, not a claim that only 10,000 humans ever lived. [Ch 27](part-05-population-genetics/27-the-four-forces.md)

**electrophile** — The electron-poor partner in a bond-making reaction: the one that gets attacked. In nucleic acid chemistry it is almost always a phosphorus atom flanked by oxygens, which is why one reaction type extends, cuts and ligates both DNA and RNA. See also *nucleophile*. [Ch 01](part-00-orientation/01-chemistry-and-cell-primer.md)

**endogenous retrovirus (ERV)** — A retroviral genome fixed in the host after a *germline* infection; most human ERVs are now solo LTRs, the internal genes having recombined out and left a lone promoter. [Ch 19](part-03-genome-instability/19-transposable-elements.md)

**enhancer** — A cis-regulatory element that raises transcription of a target promoter from any orientation and from up to ~1 Mb away, frequently skipping intervening genes; the nearest gene is a biased heuristic, not the target. [Ch 22](part-04-gene-regulation/22-eukaryotic-transcriptional-regulation.md)

**epigenetic clock** — A penalised regression on methylation levels fitted to predict chronological age; "age acceleration" is a regression residual that inherits every confounder of its features, notably blood cell composition. [Ch 23](part-04-gene-regulation/23-chromatin-and-epigenetics.md)

**epigenetics** — Definitionally contested. The narrow sense — heritable change in gene expression through cell division without a change in DNA sequence, requiring a read–write propagation loop — is the one that does scientific work; the broad popular sense of "environment affecting gene expression" covers changes that are neither heritable nor stable, and the equivocation between the two is the source of most public confusion. Nothing here implies Lamarckian inheritance: in mammals a mark must survive two genome-wide reprogramming waves, and the known escapees are mostly retrotransposons. [Ch 23](part-04-gene-regulation/23-chromatin-and-epigenetics.md)

**epistasis** — Interaction *between loci*: classically, one locus masking another in a pathway; statistically, a non-zero interaction term in a regression. The two are different objects, either can occur without the other, and neither is "dominance between genes" — dominance is within a locus. [Ch 11](part-02-transmission-genetics/11-beyond-mendel.md)

**eQTL** — A variant associated with expression of a gene; overlap with a GWAS signal in the same LD block is expected by chance, so identifying the gene requires colocalisation, not proximity. [Ch 52](part-11-human-and-statistical-genomics/52-association-to-mechanism.md)

**equilibrium constant (K)** — The ratio of product to reactant concentrations a reversible reaction settles at, [AB]/([A][B]) for A + B ⇌ AB; a property of the reaction and the temperature only, so an enzyme cannot change it — catalysis lowers the barrier, never moves the destination. [Ch 01](part-00-orientation/01-chemistry-and-cell-primer.md)

**evolutionarily significant unit (ESU)** — A population judged to have evolved independently long enough to be managed separately — Moritz's criterion is reciprocal monophyly at mtDNA plus significant nuclear allele-frequency divergence; a *historical* criterion, and the boundary you hesitate to cross when moving animals. Contrast *management unit*. Contested because mtDNA is one locus and reciprocal monophyly takes of order 4*N*<sub>e</sub> generations to arise even with zero gene flow. [Ch 35A](part-07-molecular-evolution/35A-speciation-and-ecological-genetics.md)

**exome sequencing** — Targeted capture and sequencing of annotated coding exons; capture efficiency is uneven and systematically so, and some clinically important GC-rich exons drop out in every sample. [Ch 40](part-09-genomics/40-sequencing-technologies.md)

**exon definition** — The vertebrate mode of splice-site recognition in which factors pair across an exon rather than across an intron; this is why breaking a donor site makes the *upstream exon* skip rather than causing intron retention. [Ch 06](part-01-molecular-foundations/06-rna-processing.md)

**expressivity** — How severely a phenotype is expressed among individuals who express it at all; distinct from penetrance, which is whether it is expressed at all. [Ch 11](part-02-transmission-genetics/11-beyond-mendel.md)

## F

**F (inbreeding coefficient)** — The probability that the two alleles at a locus in an individual are identical by descent, relative to a chosen base population; pedigree F is an *expectation*, and the realised value varies by ~0.02 even for first cousins. [Ch 28](part-05-population-genetics/28-structure-and-inbreeding.md)

**FASTQ** — A sequence with a per-base Phred quality string, offset by 33 in modern data (legacy data may be +64, and mis-guessing the offset silently shifts every quality by 31). [Ch 41](part-09-genomics/41-data-formats.md)

**feed-forward loop** — A three-node network motif in which a regulator acts on a target both directly and through an intermediate; the coherent form filters transient input, the incoherent form generates pulses. [Ch 25](part-04-gene-regulation/25-networks-and-development.md)

**fine-mapping** — Variable selection under near-perfect collinearity to identify causal variants within an association signal; resolution scales as N(1−r²), so LD contrast rather than sample size is the binding constraint. [Ch 52](part-11-human-and-statistical-genomics/52-association-to-mechanism.md)

**fitness (w)** — Expected relative reproductive contribution of a genotype; selection coefficient s = 1 − w, and h is the dominance coefficient applied to it in the heterozygote. [Ch 27](part-05-population-genetics/27-the-four-forces.md)

**fixation** — Rise of an allele to frequency 1; for a neutral allele the probability equals its current frequency, and mean time to fixation is ≈ 4N_e generations. [Ch 27](part-05-population-genetics/27-the-four-forces.md)

**FLAG (SAM)** — A bitfield encoding an alignment's properties (paired, mapped, reverse, secondary, supplementary, duplicate); misreading it as a small integer rather than a set of bits is a standard source of silent error. [Ch 41](part-09-genomics/41-data-formats.md)

**fluctuation test** — The Luria–Delbrück experiment showing that the *variance* of mutant counts across parallel cultures, not the mean, distinguishes pre-existing mutation from adaptive response; it ruled out directed mutation in 1943. [Ch 16](part-03-genome-instability/16-mutation.md)

**FM-index** — A compressed full-text index built from the BWT supporting backward search in space near that of the text; it solves *exact* matching, and a single mismatch empties the range — approximate alignment is still dynamic programming. [Ch 42](part-09-genomics/42-read-alignment.md)

**forensic genetic genealogy** — Identifying a sample donor by IBD-matching to distant relatives in a consumer database; at ~2% database coverage, ~60% of individuals of European descent get a third-cousin-or-closer match, so your relatives' choices set your exposure — and coverage, hence exposure, differs by ancestry. [Ch 58](part-12-applications-and-ethics/58-ethics-and-society.md)

**forward genetics** — Starting from a phenotype and finding the responsible gene, typically by mutagenesis and screening; contrasted with reverse genetics, which starts from the gene. [Ch 37](part-08-methods/37-model-organisms-and-screens.md)

**free energy (ΔG°)** — The driving force of a reaction, ΔH° − TΔS°, quoted in kcal/mol and negative when the reaction is favourable as written; it fixes where a reaction ends up (ΔG° = −RT ln K) and says nothing at all about how fast it gets there, which is set by the barrier instead. [Ch 01](part-00-orientation/01-chemistry-and-cell-primer.md)

**FRiP** — Fraction of reads in peaks, a signal-to-background ratio for ChIP and ATAC data; because it is a ratio, sequencing deeper cannot rescue a poor experiment. [Ch 49](part-10-functional-genomics/49-epigenome-profiling.md)

**F_ST** — (H_T − H_S)/H_T, the proportion of genetic variance attributable to differences between subpopulations; a ratio of variance components, so F_ST ≈ 0.12 between human continental groups does **not** mean people differ in 12% of their DNA. It depends on Nm rather than m, which is why one migrant per generation suffices to hold it near 0.2. [Ch 28](part-05-population-genetics/28-structure-and-inbreeding.md)

## G

**gain of function** — A variant conferring a new or constitutive activity rather than removing one; predicts dominant inheritance and, unlike loss of function, is not phenocopied by deletion. [Ch 08](part-01-molecular-foundations/08-proteins-and-gene-function.md)

**GC-biased gene conversion (gBGC)** — A meiotic transmission bias favouring G and C alleles at heteroduplex mismatches; it is *not* selection, but it enters the equations exactly where selection does, which is why it generates false positives in selection scans. [Ch 18](part-03-genome-instability/18-recombination-mechanisms.md)

**gene** — Contested at the edges: a locus producing one or more functional products, whose boundaries depend on the annotation and whose product count is not one. GENCODE 50 lists 19,442 protein-coding and 58,195 non-coding genes. [Ch 08](part-01-molecular-foundations/08-proteins-and-gene-function.md)

**gene conversion** — Non-reciprocal copying of a few hundred bp from the homolog during recombination repair; ~80–90% of programmed meiotic breaks resolve this way, making conversion hundreds of times more likely per base per generation than point mutation. [Ch 18](part-03-genome-instability/18-recombination-mechanisms.md)

**gene desert** — A long interval with no annotated protein-coding gene; conserved gene deserts sit beside developmental genes and are dense with regulatory elements, so emptiness is a statement about annotation. [Ch 39](part-09-genomics/39-genome-landscapes.md)

**gene drive** — An engineered element that copies itself onto the homologous chromosome, achieving super-Mendelian inheritance; it spreads because it copies itself, not because it is beneficial, and fitness cost slows invasion without stopping it. [Ch 38](part-08-methods/38-genome-editing.md)

**gene ontology (GO) enrichment** — Testing which annotation terms are over-represented in a gene list; the answer depends on the background you chose and on a vocabulary whose coverage tracks how much each gene has been studied. [Ch 44](part-09-genomics/44-annotation.md)

**gene tree** — The phylogeny of a single locus, which frequently disagrees with the species tree; discordance is the expected outcome under the coalescent when internal branches are short, not an error. [Ch 34](part-07-molecular-evolution/34-phylogenetics.md)

**genetic ancestry** — A continuous, measurable property describing the populations from which an individual's genome segments descend. It is not race: race is a social classification whose boundaries vary by country and era, and using one to proxy the other injects measurement error into the very confounder you meant to control. Ancestry estimates are also relative to a chosen reference panel and time depth and change when the panel changes. [Ch 58](part-12-applications-and-ethics/58-ethics-and-society.md)

**genetic code** — The mapping from 64 codons to 20 amino acids plus stop; the code is the *table*, not the DNA, and it is near-universal — mitochondria and some ciliates and yeasts reassign codons. [Ch 07](part-01-molecular-foundations/07-genetic-code-and-translation.md)

**genetic rescue** — An increase in population fitness caused by immigration of new alleles — inbreeding depression run backwards, restoring heterozygosity and re-masking each lineage's recessive load. Distinct from *demographic* rescue, which is just more bodies; and it masks load rather than purging it, so the durable version is sustained gene flow (*N*<sub>e</sub>*m* ≈ 1 per generation), not a one-off translocation. [Ch 35A](part-07-molecular-evolution/35A-speciation-and-ecological-genetics.md)

**genome build** — The named assembly version (GRCh37, GRCh38, T2T-CHM13) that a coordinate refers to; the build is part of the coordinate, and a position without one does not identify a place. [Ch 41](part-09-genomics/41-data-formats.md)

**genome-wide significance** — The 5 × 10⁻⁸ threshold, being 0.05 Bonferroni-corrected for ~10⁶ effectively independent common-variant tests *in European-ancestry LD*; not a law of nature, and testing fewer variants earns no laxer threshold. [Ch 51](part-11-human-and-statistical-genomics/51-gwas.md)

**genomic control (λ adjustment)** — Dividing test statistics by the genomic inflation factor; a 1999 fix that removes genuine polygenic signal along with confounding and gets worse as studies grow. [Ch 51](part-11-human-and-statistical-genomics/51-gwas.md)

**genomic imprinting** — Parent-of-origin-dependent monoallelic expression at ~150 human loci; the mark is a differentially methylated imprinting control region, **erased in the primordial germ cells and re-set during gametogenesis according to the sex of the individual making the gametes**, then protected by ZFP57/TRIM28 through the post-fertilisation wave. The reason uniparental disomy and mammalian parthenogenesis fail. [Ch 23](part-04-gene-regulation/23-chromatin-and-epigenetics.md)

**genomic inflation factor (λ)** — median(observed χ²)/0.4549 for 1 df; it grows with N under a perfectly clean analysis of a polygenic trait, so λ > 1 is not evidence of confounding. See also *LD-score regression*. [Ch 51](part-11-human-and-statistical-genomics/51-gwas.md)

**genotype** — The pair of alleles an individual carries at a locus; genotype frequencies determine allele frequencies as an identity, but the reverse requires the Hardy–Weinberg model. [Ch 10](part-02-transmission-genetics/10-mendelian-inheritance.md)

**genotype–environment covariance** — Cov(G,E), between an individual's genotypic value and the environment they meet; randomisation forces it to zero by design, but in human observational data genetic nurture and niche picking make it positive, inflating everything estimated from families. [Ch 30](part-06-quantitative-genetics/30-quantitative-traits.md)

**genotype likelihood (PL/GL)** — P(reads | genotype) for each possible genotype at a site — three of them where the site is biallelic — the quantity a caller actually computes before applying a prior, with PL its Phred-scaled form normalised so the best genotype is 0; it beats counting and thresholding because it propagates base-level uncertainty. [Ch 46](part-10-functional-genomics/46-variant-calling.md)

**germline** — The cell lineage that gives rise to gametes; only germline variants are transmitted, which is why distinguishing them from somatic variants requires sequencing a normal tissue alongside a tumour. [Ch 16](part-03-genome-instability/16-mutation.md)

**germline mosaicism** — Presence of a variant in a subset of a parent's germ cells but not in their blood; for DMD it leaves mothers of an isolated case a ~6% recurrence risk for a male fetus despite a negative blood test. [Ch 15](part-02-transmission-genetics/15-pedigrees.md)

**GIAB (Genome in a Bottle)** — The benchmark truth sets used to measure variant-calling accuracy; an F1 of 0.999 applies only within regions where truth could be established, which excludes the hard regions by construction. [Ch 46](part-10-functional-genomics/46-variant-calling.md)

**GINA** — The US Genetic Information Nondiscrimination Act; it does not cover life, disability or long-term-care insurance, employers with fewer than 15 staff, or manifested disease. [Ch 58](part-12-applications-and-ethics/58-ethics-and-society.md)

**gnomAD** — The aggregated population reference database (v4: 807,162 individuals, GRCh38); absence from it is a weak, near-universal property, since most variants in any genome are absent from it. [Ch 54](part-11-human-and-statistical-genomics/54-rare-variants-and-mendelian-disease.md)

**group harm** — Injury to a community rather than to an enrolled individual — stigmatising findings, contradicted origin narratives, uses the group never agreed to; a framework whose only unit is individual consent cannot represent it, and nobody can consent for a lineage. [Ch 58](part-12-applications-and-ethics/58-ethics-and-society.md)

**gVCF** — A VCF dialect that records confidence in *homozygous-reference* blocks as well as variant sites; it exists precisely because a missing row otherwise cannot be distinguished from no coverage. [Ch 46](part-10-functional-genomics/46-variant-calling.md)

**GWAS** — Testing millions of common variants for association with a trait, one at a time, with ancestry covariates; the covariates matter more than the model, and the hit is a tag, not a cause. [Ch 51](part-11-human-and-statistical-genomics/51-gwas.md)

**G×E interaction** — Genotype-dependent response to environment; real and important, but statistically hard because power for interaction terms is far lower than for main effects and scale transformations create and destroy it. [Ch 32](part-06-quantitative-genetics/32-mapping-quantitative-traits.md)

## H

**Haldane's rule** — That when one sex is absent, rare or sterile among F1 hybrids, it is the **heterogametic** sex — including in ZW taxa, where that sex is female. Composite in mechanism: dominance (incompatibility alleles are partially recessive, so hemizygosity costs 1 against 2*h*) carries inviability and the ZW cases, faster-male carries sterility in XY taxa. Not the Haldane rule of [Ch 15](part-02-transmission-genetics/15-pedigrees.md). [Ch 35A](part-07-molecular-evolution/35A-speciation-and-ecological-genetics.md)

**haploinsufficiency** — A phenotype caused by having only one functional copy, i.e. half the product is not enough; one of three routes to dominance, alongside dominant-negative and gain of function. [Ch 08](part-01-molecular-foundations/08-proteins-and-gene-function.md)

**haplotype** — The set of alleles carried together on one chromosome copy; determining which allele sits on which copy is the phase problem. Statistical phasing is accurate for common variants and degrades as frequency falls, with singletons essentially unphaseable without trios or reads spanning both sites. [Ch 29](part-05-population-genetics/29-linkage-disequilibrium.md)

**haplotype block** — A stretch of high LD delimited by recombination hotspots; a useful idealisation whose boundaries are algorithm- and sample-dependent, and whose hotspot positions vary between individuals via *PRDM9*. [Ch 29](part-05-population-genetics/29-linkage-disequilibrium.md)

**Hardy–Weinberg equilibrium (HWE)** — The genotype proportions p² : 2pq : q² reached after **one** generation of random mating, and a null model rather than a description of any real population; the fit licenses almost nothing, because power against realistic departures is very low. [Ch 26](part-05-population-genetics/26-hardy-weinberg.md)

**helicase** — The motor that unwinds duplex DNA ahead of the replication fork; polymerase cannot do this, and removing helicase stops replication before polymerase is relevant. [Ch 04](part-01-molecular-foundations/04-dna-replication.md)

**hemizygous** — Having only one copy of a locus, as males do for most of the X; dominance terms do not apply, because there is no second allele for the first to be dominant over. [Ch 13](part-02-transmission-genetics/13-sex-linkage.md)

**heritability** — The proportion of **phenotypic variance in a particular population, in a particular environment, at a particular time** that is attributable to genetic variance (H² broad-sense, h² narrow-sense). It is not a property of an individual and does not partition anyone's trait value; it does not mean unchangeable — PKU is near-fully heritable and near-fully preventable by diet, and Dutch mean height rose ~20 cm while h² stayed ~0.7–0.8; and it licenses **no** inference whatsoever about the causes of differences *between* groups, because it is computed from within-group variance and contains no between-group information. See also *two pots argument*, *missing heritability*. [Ch 31](part-06-quantitative-genetics/31-heritability-and-selection.md)

**heritable genome editing** — Editing in embryos or gametes so the change is transmitted; technically identical to somatic editing in its reagents, differing only in which cell receives them, and prohibited in 70+ countries — but prohibition is national while the technology is portable, so enforcement rather than consensus is the open problem. [Ch 58](part-12-applications-and-ethics/58-ethics-and-society.md)

**heterochromatin** — Condensed, repeat-rich, late-replicating and generally transcriptionally repressive chromatin; constitutive at centromeres and telomeres, facultative where a developmental decision has been locked in. [Ch 03](part-01-molecular-foundations/03-genomes-chromosomes-chromatin.md)

**heteroplasmy** — Coexistence of different mtDNA sequences in one cell; because there are thousands of copies, a mitochondrial mutation has a *load*, with disease appearing above a threshold and load varying between tissues and over a lifetime. [Ch 03](part-01-molecular-foundations/03-genomes-chromosomes-chromatin.md)

**Hi-C** — Proximity ligation followed by sequencing, giving a genome-wide contact matrix; contact probability falls ~167-fold from 100 kb to 10 Mb, so balancing and an observed/expected step are mandatory before any statistic means anything. [Ch 50](part-10-functional-genomics/50-3d-genome.md)

**histone code hypothesis** — The proposal that combinations of histone modifications constitute a readable symbolic code; marks are heavily correlated, resolve into ~15–25 recurrent states rather than 2ᴺ, and many are consequences of transcription rather than causes. [Ch 23](part-04-gene-regulation/23-chromatin-and-epigenetics.md)

**Holliday junction** — A four-way DNA branch formed during recombination; resolution direction determines crossover versus non-crossover, and meiotic resolution is directed toward crossover by MutLγ rather than being 50/50 geometry. [Ch 18](part-03-genome-instability/18-recombination-mechanisms.md)

**homologous chromosomes** — The maternal and paternal copies of a chromosome, differing at ~1 base in 1,000; not to be confused with sister chromatids, which are S-phase copies and identical. [Ch 09](part-02-transmission-genetics/09-mitosis-and-meiosis.md)

**homologous recombination (HR)** — Template-directed repair of a double-strand break using a homologous sequence; accurate but restricted to S/G2, and its loss is what PARP inhibitors exploit. [Ch 17](part-03-genome-instability/17-dna-repair.md)

**homology** — Shared ancestry; **binary**, not a percentage — a stated percentage is sequence *identity* or *similarity*. [Ch 34](part-07-molecular-evolution/34-phylogenetics.md)

**Hox genes** — Selector genes specifying segment identity, arranged colinearly with their expression domains; they route between developmental programmes that already exist elsewhere, rather than containing the design of the structure. [Ch 25](part-04-gene-regulation/25-networks-and-development.md)

**HRD (homologous recombination deficiency)** — A tumour phenotype of impaired HR repair, inferred from structural scars and signature SBS3; SBS3 alone is a weak call, and HRD is the biomarker for PARP-inhibitor sensitivity. [Ch 56](part-11-human-and-statistical-genomics/56-cancer-genomics.md)

**HWE departure ("significant" HWE test)** — In modern genomics almost always a **genotyping-error signal**, not a biological finding: allele dropout, collapsed paralogues, contamination or batch effects. The sign is diagnostic — heterozygote deficit suggests dropout, structure or inbreeding; heterozygote excess suggests CNV/paralogue collapse or contamination. Selection strong enough to matter is nearly orthogonal to it: a fully lethal recessive at q = 0.01 induces F = −0.01 and would need ~78,500 samples to detect. The test has **1 df**, not 2, because the allele frequency was estimated from the same genotypes. [Ch 26](part-05-population-genetics/26-hardy-weinberg.md)

**hybrid zone** — A spatial band of mixed ancestry where two divergent forms meet and interbreed. A **tension zone** is held by endogenous selection against hybrids and is a stable dispersal–selection equilibrium, not a merger in progress; an **ecotone cline** is held by the environment and moves when it does. Coincident clines at *unlinked* loci are the diagnostic, since nothing else makes them agree. [Ch 35A](part-07-molecular-evolution/35A-speciation-and-ecological-genetics.md)

**hybridisation** — Sequence-specific annealing of a labelled probe to its complement; the basis of Southern and Northern blotting, arrays and capture — but **not** of Western blotting, which uses antibodies. [Ch 36](part-08-methods/36-core-molecular-methods.md)

**hydrophobic effect** — The apparent attraction between non-polar groups in water, driven by water's entropy reorganising around them rather than by attraction between the groups themselves. [Ch 01](part-00-orientation/01-chemistry-and-cell-primer.md)

## I

**identity by descent (IBD)** — Two alleles being copies of the same ancestral allele, as opposed to merely identical in state; the distinction on which every inbreeding and relatedness calculation rests. [Ch 28](part-05-population-genetics/28-structure-and-inbreeding.md)

**IDR (irreproducible discovery rate)** — A mixture model over ranked peaks from replicate experiments; reproducibility across replicates rather than a nominal FDR is the real evidence for a peak list. [Ch 49](part-10-functional-genomics/49-epigenome-profiling.md)

**imputation** — Inferring unobserved genotypes from a reference haplotype panel using LD; it recovers common variants well and rare ones poorly, and its accuracy depends on the panel matching the sample's ancestry. [Ch 51](part-11-human-and-statistical-genomics/51-gwas.md)

**inbreeding depression** — Reduced fitness in inbred individuals, caused by exposing recessive deleterious alleles already hidden in heterozygotes; inbreeding creates no mutations and changes no allele frequencies. In a closed population it is arithmetic rather than behaviour: *F* rises by 1/(2*N*<sub>e</sub>) per generation whatever the mating system, because the mate pool is finite. [Ch 28](part-05-population-genetics/28-structure-and-inbreeding.md), applied in [Ch 35A](part-07-molecular-evolution/35A-speciation-and-ecological-genetics.md)

**incomplete dominance** — A heterozygote phenotype intermediate between the two homozygotes; distinct from codominance, where both phenotypes appear at once. [Ch 11](part-02-transmission-genetics/11-beyond-mendel.md)

**indel** — An insertion or deletion of 1–50 bp; in coding sequence a length not divisible by 3 shifts the frame [Ch 16](part-03-genome-instability/16-mutation.md). In a repeat the same indel has many valid left/right-shifted encodings, which is why unnormalised joins between VCFs fail silently — see *normalisation (variant)*. [Ch 41](part-09-genomics/41-data-formats.md)

**independent assortment** — Mendel's second law: alleles at different loci segregate independently. It applies only to loci on **different chromosomes**, or far enough apart on the same one that RF is indistinguishable from 0.5 — at 50 cM the expected RF is still only ~0.32 under Haldane (~0.38 under Kosambi), so "unlinked" and "on different chromosomes" are not synonyms. [Ch 10](part-02-transmission-genetics/10-mendelian-inheritance.md)

**index SNP (lead SNP)** — The variant with the largest association statistic at a locus, genotyped or imputed; it is a proxy correlated with the causal site rather than the causal site itself, and which member of the LD block tops the list is close to sampling noise. [Ch 51](part-11-human-and-statistical-genomics/51-gwas.md)

**interference** — The suppression of one crossover by another nearby, so double crossovers are rarer than independence predicts; I = 1 − coefficient of coincidence, and the Kosambi function accommodates it where Haldane does not. [Ch 14](part-02-transmission-genetics/14-linkage-and-mapping.md)

**interval mapping** — Testing for a QTL at every position *between* markers by weighting genotypes by their probability given the flanking markers, which separates effect size from position. [Ch 32](part-06-quantitative-genetics/32-mapping-quantitative-traits.md)

**introgression** — Movement of alleles from one population or species into another by hybridisation followed by repeated backcrossing; systematically reduced near incompatibility loci, near genes and on the sex chromosome, and enhanced where the allele is useful in its new setting (**adaptive introgression** — *EPAS1* in Tibetans, insecticide resistance in *Anopheles*). Detected as an excess of ABBA over BABA sites, which incomplete lineage sorting cannot produce. [Ch 35A](part-07-molecular-evolution/35A-speciation-and-ecological-genetics.md)

**intron** — A sequence removed from the pre-mRNA by splicing; not junk — introns carry branch points and splicing regulatory elements, host snoRNA and miRNA genes, and their removal deposits the EJC marks used for quality control. [Ch 06](part-01-molecular-foundations/06-rna-processing.md)

**inversion** — A reversed chromosomal segment; balanced in the carrier but generating unbalanced gametes through the inversion loop at meiosis, and invisible to microarrays. [Ch 20](part-03-genome-instability/20-chromosome-abnormalities.md)

## J

**joint genotyping** — Genotyping a cohort together from per-sample gVCFs; no reads are shared — what the cohort supplies is the site-specific prior about which sites are polymorphic and at what frequency. [Ch 46](part-10-functional-genomics/46-variant-calling.md)

**Jukes–Cantor (JC69)** — The simplest substitution model, correcting observed p-distance for multiple hits as d = −¾ ln(1 − 4p/3) substitutions/site; corrected distances can exceed 1.0 substitutions/site even though p-distance saturates at 0.75. [Ch 34](part-07-molecular-evolution/34-phylogenetics.md)

**junk DNA** — Ohno's inference that a species cannot maintain unlimited functional sequence against mutation, which was and remains correct as population genetics even though the phrase was rhetorically bad; ~46% of the human genome is degraded transposon relic and only ~5–10% shows detectable purifying selection, while non-coding *genes* outnumber coding ones ~3:1. [Ch 39](part-09-genomics/39-genome-landscapes.md)

## K

**karyotype** — The full chromosome complement as visualised and counted [Ch 03](part-01-molecular-foundations/03-genomes-chromosomes-chromatin.md); because of mosaicism a normal karyotype in one tissue excludes nothing in another. [Ch 20](part-03-genome-instability/20-chromosome-abnormalities.md)

**k-mer** — A length-k substring; the unit of de Bruijn assembly, of sketching, and of most alignment-free comparison, with the choice of k trading repeat resolution against effective coverage. [Ch 43](part-09-genomics/43-genome-assembly.md)

**knockout** — Complete inactivation of a gene; no phenotype means the assays used did not detect a difference, not that the gene does nothing. [Ch 37](part-08-methods/37-model-organisms-and-screens.md)

**Knudson two-hit hypothesis** — That tumour suppressor inactivation requires both alleles, inferred from the age-incidence curves of familial versus sporadic retinoblastoma; a statement about rate-limiting steps, and the number for adult carcinomas is closer to six. [Ch 56](part-11-human-and-statistical-genomics/56-cancer-genomics.md)

**Kosambi mapping function** — d = ¼ ln[(1+2r)/(1−2r)] Morgans, converting recombination frequency to map distance while allowing distance-dependent interference; Haldane's assumes none. [Ch 14](part-02-transmission-genetics/14-linkage-and-mapping.md)

**K_s** — Synonymous substitutions per synonymous site between paralogs, used as a molecular clock to date duplications; peaks in a K_s histogram mark whole-genome duplication events. [Ch 35](part-07-molecular-evolution/35-genome-evolution.md)

## L

**lagging strand** — The strand synthesised discontinuously as Okazaki fragments; no strand anywhere is ever synthesised 3′→5′ — each fragment is made 5′→3′ while the *series* moves away from the fork. [Ch 04](part-01-molecular-foundations/04-dna-replication.md)

**Lander–Waterman model** — The Poisson treatment of coverage: P(depth 0) = e^(−C); real data are overdispersed relative to it, so the observed zero-coverage fraction exceeds the prediction. [Ch 40](part-09-genomics/40-sequencing-technologies.md)

**LD-score regression** — Regressing GWAS χ² on LD score; the **slope** is proportional to polygenic heritability and the **intercept** indexes confounding, which λ alone cannot separate — though the intercept is no oracle, rising with sample overlap between cohorts and with a mismatched LD reference panel. [Ch 51](part-11-human-and-statistical-genomics/51-gwas.md)

**lethal allele** — An allele causing death in some genotype, producing modified ratios such as 2:1; dominance is indexed by phenotype, so *A^y* is dominant for coat colour and recessive for lethality from a single deletion. [Ch 11](part-02-transmission-genetics/11-beyond-mendel.md)

**liability threshold model** — Treating a binary disease as a normally distributed latent liability crossed at a threshold, which makes all the quantitative-genetic machinery applicable to a binary observed scale. [Ch 30](part-06-quantitative-genetics/30-quantitative-traits.md)

**liftover** — Mapping coordinates between assemblies; a **partial, non-invertible function** — regions with no image, regions with several, and REF/ALT flips — so round-tripping is not the identity. [Ch 41](part-09-genomics/41-data-formats.md)

**LINE-1 (L1)** — The only autonomously active human transposable element, copying itself by target-primed reverse transcription and supplying the machinery *Alu* and SVA parasitise. [Ch 19](part-03-genome-instability/19-transposable-elements.md)

**linkage (genetic)** — Physical proximity of two loci on the same chromosome, causing them to be co-inherited more often than 50% of the time; a property of *loci in an individual's meiosis*. [Ch 14](part-02-transmission-genetics/14-linkage-and-mapping.md)

**linkage disequilibrium (LD)** — Non-random association of alleles at two loci in a **population** — a correlation between two columns of a genotype matrix. This is **not** genetic linkage: admixture and population structure create LD between loci on different chromosomes, while two tightly linked loci can sit at D = 0 after enough generations. Recombination *destroys* LD at rate c per generation; mutation, drift, admixture and selection create it. [Ch 29](part-05-population-genetics/29-linkage-disequilibrium.md)

**lncRNA** — A non-coding transcript over ~200 nt, a category defined by exclusion; GENCODE 50 annotates 35,885 lncRNA genes, but that counts loci with transcript evidence — genome-scale CRISPRi gave a growth phenotype at ~3%. [Ch 24](part-04-gene-regulation/24-rna-based-regulation.md)

**local adaptation** — Higher fitness of a population in its own environment than a *foreign* population achieves **in that same environment**; the local-versus-foreign comparison, not home-versus-away, which is confounded by site quality. Established by reciprocal transplant, and in reaction-norm terms it is a G×E whose lines **cross**. [Ch 35A](part-07-molecular-evolution/35A-speciation-and-ecological-genetics.md)

**LOD score** — log₁₀ of the likelihood ratio for linkage versus no linkage; the threshold of 3 is a 1,000:1 ratio chosen to overcome a ~50:1 prior against linkage, and it does **not** mean p < 0.001 — the nominal pointwise p is ≈ 1 × 10⁻⁴, because θ is bounded at 0.5 and the null distribution is a 50:50 mixture of a point mass at 0 and χ²₁ (2 ln10 × 3 = 13.8, halved). [Ch 14](part-02-transmission-genetics/14-linkage-and-mapping.md)

**LOEUF** — The upper bound of the **90% confidence interval** on the observed/expected ratio for predicted loss-of-function variants in a gene; a *high* value in a short gene means the interval is wide for lack of expected variation, not that the gene tolerates loss. See also *constraint*. [Ch 54](part-11-human-and-statistical-genomics/54-rare-variants-and-mendelian-disease.md)

**loop (chromatin)** — A CTCF-anchored contact enriched in Hi-C maps; at a well-measured mammalian TAD the fully looped state exists only ~3–6.5% of the time with a lifetime of ~10–30 min. [Ch 50](part-10-functional-genomics/50-3d-genome.md)

**loop extrusion** — Cohesin reeling chromatin through its ring until stalled by convergently oriented CTCF sites, generating TADs and loops; it *antagonises* compartmentalisation by mixing what affinity-driven segregation separates. [Ch 50](part-10-functional-genomics/50-3d-genome.md)

**loss of function (LoF)** — A variant abolishing the product's activity; usually recessive not because the intact allele works harder — it is generally not upregulated — but because pathway flux is buffered against changes in any single enzyme. [Ch 08](part-01-molecular-foundations/08-proteins-and-gene-function.md)

## M

**major groove** — The wider helical groove, which exposes a distinct donor/acceptor/methyl pattern for each of the four base-pair orientations; sequence-specific readout happens here, on intact duplex, without opening the helix. [Ch 02](part-01-molecular-foundations/02-dna-structure.md)

**management unit (MU)** — A population with significant allele-frequency divergence from its neighbours regardless of tree structure — a *demographic* criterion about present-day independence, and the unit you monitor. Many MUs typically sit inside one *evolutionarily significant unit*. [Ch 35A](part-07-molecular-evolution/35A-speciation-and-ecological-genetics.md)

**MAPQ** — The aligner's confidence that a read is placed at the **right locus**, nominally −10 log₁₀ P(wrong position). It is **not** base quality and says nothing about whether the bases are right. It is **not comparable across aligners**: the scale constant is fitted per tool, maxima differ (~60 vs 42), and STAR uses 255 for "unique" where the SAM spec reserves 255 for "unavailable". A read from sequence missing from the reference can be given MAPQ 60 at entirely the wrong place. [Ch 42](part-09-genomics/42-read-alignment.md)

**mask (variant)** — The rule defining which variants are aggregated in a gene-level rare-variant test; it matters more than the choice of statistical test, since a mask that is 20% causal costs a factor of five in effective sample size. [Ch 54](part-11-human-and-statistical-genomics/54-rare-variants-and-mendelian-disease.md)

**maternal age effect** — The steep rise in oocyte aneuploidy with maternal age, caused specifically by decay of cohesin loaded in fetal life and never replenished through decades of prophase-I arrest — not by eggs "degrading" generally, and mechanistically distinct from the paternal age effect on point mutations. [Ch 20](part-03-genome-instability/20-chromosome-abnormalities.md)

**MAVE (multiplexed assay of variant effect)** — Functional measurement of thousands of variants in one experiment; its evidentiary strength comes from calibration against known pathogenic and benign controls, not from the experiment itself. [Ch 55](part-11-human-and-statistical-genomics/55-clinical-variant-interpretation.md)

**maximum credible allele frequency** — The highest population frequency a variant could have and still cause a given disease, derived from prevalence, penetrance, heterogeneity and allelic heterogeneity; "rare" is not a single number and varies by orders of magnitude between diseases. [Ch 55](part-11-human-and-statistical-genomics/55-clinical-variant-interpretation.md)

**McDonald–Kreitman test** — Comparing the nonsynonymous:synonymous ratio for fixed differences against that for within-species polymorphism; the correct way to use ω-style logic when within-species variants are involved. [Ch 33](part-07-molecular-evolution/33-neutral-theory-and-selection-tests.md)

**meiosis** — Two divisions after one round of replication, halving chromosome number at anaphase I; DNA content goes 4c → 2c → 1c, so it *quarters* DNA across two divisions while halving chromosome number once. [Ch 09](part-02-transmission-genetics/09-mitosis-and-meiosis.md)

**melting temperature (T_m)** — The temperature at which half the strands of a duplex are paired; it depends on sequence *order*, not only on %GC, because duplex stability sums over dinucleotide stacks — which is why the nearest-neighbour model has no parameter for "a base pair" at all. [Ch 02](part-01-molecular-foundations/02-dna-structure.md)

**Mendelian randomisation (MR)** — Using genetic variants as instruments for an exposure; it is observational, rests on three assumptions of which one is untestable, and estimates a *lifelong* exposure effect — agreement across non-nested estimators is the evidence, not any single sensitivity analysis. [Ch 52](part-11-human-and-statistical-genomics/52-association-to-mechanism.md)

**merodiploid** — A partial diploid carrying a second copy of a region on an episome (typically an F′), used to test whether a mutation is *cis*- or *trans*-acting; the enabling trick is that bacteria are otherwise haploid, so dominance and complementation become testable at all. Built in [Ch 20A §4](part-03-genome-instability/20A-bacterial-and-phage-genetics.md); applied in [Ch 21 §5](part-04-gene-regulation/21-bacterial-regulation.md), where it is the definitive experiment distinguishing *lacI*⁻ from *lacO*ᶜ.

**Meselson–Stahl experiment** — Density-gradient demonstration of semiconservative replication; generation 1 excluded only the conservative model, and it took the **second** generation's two discrete bands to exclude dispersive replication. [Ch 04](part-01-molecular-foundations/04-dna-replication.md)

**minimizer** — The k-mer with the smallest **hash** value in a sliding window of *w* consecutive k-mers, used as a sampled seed so that overlapping windows share seeds; the ordering is a hash rather than lexicographic, which is what stops selection piling onto low-complexity k-mers. The basis of long-read seed-chain-align. [Ch 42](part-09-genomics/42-read-alignment.md)

**minor groove** — The narrower helical groove, which carries *categorically* less information: it cannot distinguish A·T from T·A or G·C from C·G, so minor-groove binders read shape, not identity. [Ch 02](part-01-molecular-foundations/02-dna-structure.md)

**miRNA** — A ~22 nt RNA that guides Argonaute to partially complementary sites, mostly in 3′UTRs; most true targets move by tens of percent, so miRNAs mainly buffer noise rather than switching genes off. [Ch 24](part-04-gene-regulation/24-rna-based-regulation.md)

**mismatch repair (MMR)** — Post-replicative correction of mispairs, contributing a further 10²–10³ to fidelity; its loss produces microsatellite instability and a characteristic hypermutation signature. [Ch 17](part-03-genome-instability/17-dna-repair.md)

**missense** — A substitution changing one amino acid; position dominates class, so a missense in an active site can be a complete null while a nonsense in the last exon can be nearly harmless. [Ch 07](part-01-molecular-foundations/07-genetic-code-and-translation.md)

**missing heritability** — The gap between twin-based h² and the variance explained by discovered variants; largely a difference of estimands rather than a mystery, since h²_SNP measures variance tagged by common SNPs and twin h² includes several biases. [Ch 31](part-06-quantitative-genetics/31-heritability-and-selection.md)

**mitochondrial DNA (mtDNA)** — The maternally inherited ~16.6 kb circular genome present in thousands of copies per cell; it uses a *different* genetic code, so applying the standard table to mitochondrial genes produces garbage. [Ch 03](part-01-molecular-foundations/03-genomes-chromosomes-chromatin.md)

**model organism** — A species chosen for throughput, genetic tractability and scorable phenotypes — not for resemblance to humans, which is traded away deliberately and must be re-argued for each question. [Ch 37](part-08-methods/37-model-organisms-and-screens.md)

**molecular clock** — The approximate constancy of neutral substitution rate over time; a Poisson process at best and empirically overdispersed, giving dates with wide and often understated intervals. [Ch 33](part-07-molecular-evolution/33-neutral-theory-and-selection-tests.md)

**morphogen** — A diffusible signal read against concentration thresholds to supply positional information; an exponential gradient is an imprecise position detector, and boundary sharpness is manufactured downstream by cross-repression and feedback. [Ch 25](part-04-gene-regulation/25-networks-and-development.md)

**mosaicism** — Presence of genetically distinct cell populations in one individual; it makes otherwise-lethal karyotypes survivable and makes tissue choice decisive for testing. [Ch 20](part-03-genome-instability/20-chromosome-abnormalities.md)

**MPRA** — Massively parallel reporter assay, testing whether thousands of candidate sequences can autonomously activate a minimal promoter on an episome; it measures **sufficiency** in one cell type, and necessity in native chromatin is a separate experiment that dissociates from it in both directions. [Ch 49](part-10-functional-genomics/49-epigenome-profiling.md)

**multi-mapping** — A read aligning equally well to several loci; not an algorithmic failure but an information limit — for a read shorter than the repeat it lies in, the likelihood is flat over the copies. [Ch 42](part-09-genomics/42-read-alignment.md)

**mutation** — A heritable change in DNA sequence, as distinct from *damage*: a lesion is chemical and repairable because the other strand still holds the answer, while a mutation is a correctly paired sequence change with no evidence left that anything happened. [Ch 16](part-03-genome-instability/16-mutation.md)

**mutation rate** — In humans ~1.1–1.3 × 10⁻⁸ **per bp per generation** in the germline, which is a different quantity from replication fidelity (~10⁻¹⁰ **per base per replication**) — they differ ~100× and are not comparable. [Ch 16](part-03-genome-instability/16-mutation.md)

**mutation–selection balance** — The equilibrium frequency where new mutation replaces what selection removes: q̂ = √(μ/s) for recessives, q̂ = μ/(hs) for dominants; the reason dominant disease alleles persist despite reducing fitness. [Ch 27](part-05-population-genetics/27-the-four-forces.md)

**mutational signature** — A characteristic distribution of substitution types in trinucleotide context left by a mutational *process*; it identifies a process, not an exposure, and flatter signatures support weaker inferences. [Ch 16](part-03-genome-instability/16-mutation.md) · [Ch 56](part-11-human-and-statistical-genomics/56-cancer-genomics.md)

## N

**N50** — A **length**, not a count and not an average: sort contigs longest-first, and N50 is the length of the contig at which the cumulative sum first reaches half the assembly total. Misleading on its own — it rewards long contigs whether or not they are correct, and a misjoin *raises* it — so report contig N50 alongside NG50, an error-aware metric and a completeness measure. [Ch 43](part-09-genomics/43-genome-assembly.md)

**NAHR** — Non-allelic homologous recombination between misaligned repeat copies, generating the recurrent deletions and duplications behind many genomic disorders. [Ch 18](part-03-genome-instability/18-recombination-mechanisms.md)

**narrow-sense heritability (h²)** — V_A/V_P, the fraction of phenotypic variance due to additive genetic effects; the one that predicts response to selection. See also *heritability*. [Ch 31](part-06-quantitative-genetics/31-heritability-and-selection.md)

**nearly neutral theory** — The quantitative claim that variants with |s| ≲ 1/(2N_e) behave as neutral; the neutral class is therefore defined by N_e, so the same mutation is effectively neutral in one species and selected in another. [Ch 33](part-07-molecular-evolution/33-neutral-theory-and-selection-tests.md)

**negative binomial** — The gamma–Poisson mixture used for RNA-seq counts; Poisson covers technical resampling only, and biological replicates vary in the underlying rate, so Poisson p-values are wrong by orders of magnitude. [Ch 47](part-10-functional-genomics/47-rna-seq.md)

**neofunctionalisation** — Retention of a gene duplicate because one copy acquires a new function; requires 4N_esφ ≫ 1 and is inefficient in vertebrates, which is why subfunctionalisation and dosage balance do more of the work. [Ch 35](part-07-molecular-evolution/35-genome-evolution.md)

**neutral theory** — That most *fixed* differences between species are selectively neutral and driven by drift, giving neutral substitution rate k = μ independent of population size; it does not say selection is unimportant — purifying selection is pervasive and is why most mutations never become differences. [Ch 33](part-07-molecular-evolution/33-neutral-theory-and-selection-tests.md)

**NHEJ** — Non-homologous end joining, which ligates broken ends directly and is mutagenic by design; the dominant double-strand-break pathway outside S/G2 and the route by which most CRISPR knockouts are actually made. [Ch 17](part-03-genome-instability/17-dna-repair.md)

**NIPT** — Non-invasive prenatal testing by counting cell-free DNA fragments; a **screen**, not a diagnosis — its positive predictive value depends on prevalence, and it measures placental trophoblast rather than the fetus. [Ch 57](part-12-applications-and-ethics/57-genomics-in-practice.md)

**nondisjunction** — Failure of chromosomes or chromatids to separate at anaphase; meiosis I and meiosis II errors are distinguishable from *pericentromeric* markers, by whether the trisomic offspring carries both maternal homologs or two copies of one. For trisomy 21, ~90% of errors are maternal and ~77% of those are MI. [Ch 09](part-02-transmission-genetics/09-mitosis-and-meiosis.md)

**nonsense-mediated decay (NMD)** — Degradation of transcripts with a stop codon upstream of the last exon junction; a premature stop within ~50–55 nt of the final junction, or in the last exon, escapes NMD and the truncated protein is made — often dominant-negative, with a different inheritance pattern. [Ch 06](part-01-molecular-foundations/06-rna-processing.md)

**normalisation (RNA-seq)** — Computing per-sample size factors robust to composition; total-count scaling is exactly wrong when a few genes dominate, because the data are compositional. [Ch 47](part-10-functional-genomics/47-rna-seq.md)

**normalisation (variant)** — Left-aligning and parsimoniously representing an indel so the same variant has one canonical POS/REF/ALT; without it, joins between VCFs fail silently. [Ch 41](part-09-genomics/41-data-formats.md)

**nucleophile** — The electron-rich partner in a bond-making reaction: the one that attacks, typically an oxygen or nitrogen carrying a lone pair. A chain's 3'-hydroxyl is *the* nucleophile of this curriculum, and the fact that the growing chain rather than the incoming nucleotide carries it is why every polymerase extends 5'→3'. See also *electrophile*. [Ch 01](part-00-orientation/01-chemistry-and-cell-primer.md)

**nucleosome** — 147 bp of DNA wrapped ~1.65 turns around a histone octamer; ~75% of the genome is on an octamer at any moment, and the remainder is mostly linker, which is *not* accessible. [Ch 03](part-01-molecular-foundations/03-genomes-chromosomes-chromatin.md)

**nucleotide diversity (π)** — Mean pairwise differences per site within a sample; compared against Watterson's θ_W it gives Tajima's D. [Ch 33](part-07-molecular-evolution/33-neutral-theory-and-selection-tests.md)

**nucleotide excision repair (NER)** — Repair that recognises helix *distortion* rather than a specific lesion, giving it broad substrate range; the only route for UV dimers in placental mammals, which lost photolyase. [Ch 17](part-03-genome-instability/17-dna-repair.md)

**NUMT** — A nuclear insertion of mitochondrial sequence; hundreds exist, and they are the standard source of phantom heteroplasmy when mitochondrial reads are assigned by similarity alone. [Ch 39](part-09-genomics/39-genome-landscapes.md)

## O

**Okazaki fragment** — A short discontinuously synthesised piece of the lagging strand, made 5′→3′ like everything else and later joined by ligase. [Ch 04](part-01-molecular-foundations/04-dna-replication.md)

**omnigenic model** — The proposal that peripheral genes expressed in the relevant tissue collectively dominate heritability for complex traits; the polygenicity it addresses is measured and real, but the core/peripheral mechanism is not established and faces an identifiability critique. [Ch 32](part-06-quantitative-genetics/32-mapping-quantitative-traits.md)

**oncogene** — A gene whose *activation* drives proliferation, recognisable from mutation patterns clustering at specific residues; contrasted with tumour suppressors, whose mutations are dispersed and inactivating. [Ch 56](part-11-human-and-statistical-genomics/56-cancer-genomics.md)

**open reading frame (ORF)** — A stretch between start and stop in one frame; nearly sufficient for finding bacterial genes and hopeless for vertebrates, where the CDS is fragmented into exons too short to stand out. [Ch 44](part-09-genomics/44-annotation.md)

**operon** — A set of genes under one promoter transcribed as a single mRNA; essentially absent from eukaryotes, with the striking exception of nematodes, where >17% of *C. elegans* genes are in operons resolved by SL2 trans-splicing. [Ch 21](part-04-gene-regulation/21-bacterial-regulation.md)

**origin of replication** — A licensed site where a replication bubble opens with two forks running in opposite directions; 30,000–50,000 fire per human cell cycle, which is only ~5–10% of the licensed sites — the excess is dormant backup for stalled forks. There is no consensus motif; you cannot grep for one. [Ch 04](part-01-molecular-foundations/04-dna-replication.md)

**ortholog** — Genes in different species whose most recent common ancestor is a **speciation** event; defined by the event, not by similarity or best-hit score, and frequently one-to-many. See also *paralog*, *reciprocal best hit*. [Ch 35](part-07-molecular-evolution/35-genome-evolution.md)

**outbreeding depression** — Reduced fitness in hybrids relative to *both* parental populations, from local-adaptation mismatch, fixed chromosomal differences, or the breaking up of co-adapted combinations. The counter-risk to genetic rescue, and asymmetric to inbreeding depression in timing: inbreeding depression is certain and immediate, outbreeding depression is possible and often delayed to F2/F3, so a healthy F1 is not evidence of safety. [Ch 35A](part-07-molecular-evolution/35A-speciation-and-ecological-genetics.md)

**overdominance** — Heterozygote advantage, which maintains polymorphism at equilibrium q̂ = s₁/(s₁+s₂); genuinely rare, and unambiguous examples are few. [Ch 27](part-05-population-genetics/27-the-four-forces.md)

**overlap–layout–consensus (OLC)** — Assembly by computing pairwise read overlaps and finding a Hamiltonian-style path; better than de Bruijn for few long reads because it preserves read coherence. [Ch 43](part-09-genomics/43-genome-assembly.md)

## P

**pangenome** — A **graph** reference carrying an explicit alignment of many haplotypes, with shared sequence collapsed and branches addressable; the current human pangenome is HPRC Release 2 (May 2025, 200+ individuals, 460 haplotypes). Unrelated to the bacterial *pan-genome*, which is core-versus-accessory gene content across strains. [Ch 45](part-09-genomics/45-reference-genomes-and-pangenomes.md)

**paralog** — Genes whose most recent common ancestor is a **duplication** event; the highest-scoring cross-species hit is often a paralog rather than the ortholog. [Ch 35](part-07-molecular-evolution/35-genome-evolution.md)

**PARP inhibitor** — A drug class exploiting synthetic lethality with HR deficiency; killing tracks PARP **trapping** — locking PARP1 onto DNA as a physical obstacle — far better than catalytic inhibition, which is why the class is not equipotent. [Ch 17](part-03-genome-instability/17-dna-repair.md)

**parsimony** — Tree inference minimising the number of changes; it is not assumption-free — its implicit model assumes change is rare and evenly distributed, and where that fails it is statistically *inconsistent*: more data, more confidence, wrong tree. [Ch 34](part-07-molecular-evolution/34-phylogenetics.md)

**paternal age effect** — The ~1.3–1.5 additional de novo point mutations per year of paternal age, driven by continuing spermatogonial divisions; mechanistically distinct from the maternal age effect on aneuploidy. [Ch 16](part-03-genome-instability/16-mutation.md)

**PCA (population structure)** — Principal components of the genotype matrix used as ancestry covariates; clusters in a PCA plot do not imply discrete populations, since sampling a continuous cline discretely manufactures them, and adding 10 PCs does not remove fine-scale structure. [Ch 28](part-05-population-genetics/28-structure-and-inbreeding.md)

**PCR** — Exponential amplification of a region addressed by two primers; product yield reflects starting quantity only during the exponential phase, since reactions plateau to similar endpoints regardless of input. [Ch 36](part-08-methods/36-core-molecular-methods.md)

**pedigree** — A structured family diagram used to rank modes of inheritance; the output is a posterior over models on a tiny, non-randomly ascertained sample, not a label. [Ch 15](part-02-transmission-genetics/15-pedigrees.md)

**penetrance** — The probability that a person with a genotype shows the phenotype; age-dependent, background-dependent, and upward-biased when estimated from families ascertained through affected members — population-scale genotype-first studies find a mean of ~7% across thousands of P/LoF variants. [Ch 11](part-02-transmission-genetics/11-beyond-mendel.md) · [Ch 54](part-11-human-and-statistical-genomics/54-rare-variants-and-mendelian-disease.md)

**persistence length** — The length scale over which a polymer stays straight, ~150 bp (~50 nm) for B-DNA; beyond it DNA is a floppy polymer that bends, writhes and breathes open locally. [Ch 02](part-01-molecular-foundations/02-dna-structure.md)

**pharmacogenomics** — Using germline variation to predict drug response; it failed to translate on workflow, reimbursement, EHR integration and unrepresentative allele panels rather than on weak science, and genotype still is not phenotype because inhibitors cause phenoconversion. [Ch 57](part-12-applications-and-ethics/57-genomics-in-practice.md)

**phase** — Which alleles at different loci sit on the same physical chromosome; "recombinant" is defined relative to the parent's phase, so the same gamete is recombinant from a coupling parent and parental from a repulsion parent. [Ch 14](part-02-transmission-genetics/14-linkage-and-mapping.md) · [Ch 29](part-05-population-genetics/29-linkage-disequilibrium.md)

**phenoconversion** — A person's drug-metabolism phenotype departing from their genotype because a co-administered inhibitor or inducer has changed enzyme activity; the standing reminder that a pharmacogenomic genotype is not a phenotype. [Ch 57](part-12-applications-and-ethics/57-genomics-in-practice.md)

**phenotype** — Any measurable characteristic of an organism; dominance, penetrance and expressivity are all indexed to a *specific* phenotype and assay, not to the allele in general. [Ch 10](part-02-transmission-genetics/10-mendelian-inheritance.md)

**Phred quality score** — Q = −10 log₁₀(P_error), so Q20 = 1% error, Q30 = 0.1%, Q40 = 0.01%; an *estimate* whose calibration is itself a modelling claim, and headline platform Q figures are a mode or median over a run. [Ch 41](part-09-genomics/41-data-formats.md) · [Ch 40](part-09-genomics/40-sequencing-technologies.md)

**phylogenetic tree** — A hypothesis about ancestry in which the tips are all contemporary; extant species descend from inferred internal nodes, not from each other. [Ch 34](part-07-molecular-evolution/34-phylogenetics.md)

**pioneer factor** — A transcription factor able to engage its motif on nucleosomal DNA and initiate accessibility; it solves the bootstrap problem of how anything binds closed chromatin first. [Ch 22](part-04-gene-regulation/22-eukaryotic-transcriptional-regulation.md)

**pleiotropy** — One locus affecting multiple traits; the reason genetic correlations exist and the reason selecting on one trait moves others. [Ch 11](part-02-transmission-genetics/11-beyond-mendel.md)

**ploidy** — The number of complete chromosome sets; polyploidy (a whole extra set) is a different phenomenon from aneuploidy (an unbalanced subset) and has very different consequences. [Ch 20](part-03-genome-instability/20-chromosome-abnormalities.md)

**polygenic score (PRS)** — A weighted sum of allele dosages, Σβᵢ·dosageᵢ with shrunk weights; it is a **prediction from a model fitted to other people**, so its accuracy is a property of the training cohort, not of the genome being scored, and it shifts a probability rather than stating an outcome. [Ch 53](part-11-human-and-statistical-genomics/53-polygenic-scores.md)

**population stratification** — Confounding of association by ancestry differences correlated with the phenotype; it is **bias**, not variance, so it does not shrink with sample size — the p-value falls while the estimate stays wrong. [Ch 51](part-11-human-and-statistical-genomics/51-gwas.md)

**portability (of a PRS)** — How well a score built in one population predicts in another; failure reflects differing LD and allele frequencies relative to the *training* sample, not biological difference between groups, and reverses if you retrain in the other population. [Ch 53](part-11-human-and-statistical-genomics/53-polygenic-scores.md)

**positive predictive value (PPV)** — P(disease | positive test), the quantity a patient actually wants, which depends on **prevalence** and not only on the test's sensitivity and specificity; a 99.7%/99.96% test has a PPV of just 71% at a prevalence of 1 in 1,000. [Ch 57](part-12-applications-and-ethics/57-genomics-in-practice.md)

**post-translational modification (PTM)** — Covalent modification of a protein after synthesis; phosphorylation can change activity by orders of magnitude, so modified and unmodified forms are functionally different molecules rather than fine-tuned versions of one. [Ch 08](part-01-molecular-foundations/08-proteins-and-gene-function.md)

**posterior probability (phylogenetic)** — The Bayesian support for a clade; a different quantity on a different scale from bootstrap support, routinely much higher on the same data, and calibrated only under a correct model. [Ch 34](part-07-molecular-evolution/34-phylogenetics.md)

**PRDM9** — The zinc-finger protein that positions meiotic recombination hotspots in humans and mice; its binding array evolves extremely fast, so human and chimpanzee hotspots barely overlap and the recombination landscape differs between individuals. The same turnover makes it the only hybrid-sterility gene identified in a vertebrate, and a textbook *Dobzhansky–Muller incompatibility*. [Ch 18](part-03-genome-instability/18-recombination-mechanisms.md), [Ch 35A](part-07-molecular-evolution/35A-speciation-and-ecological-genetics.md)

**prime editing** — Editing using a nickase-reverse transcriptase fusion and an extended guide that templates the desired sequence; it writes the edit itself rather than relying on the cell's repair choice. [Ch 38](part-08-methods/38-genome-editing.md)

**promoter** — The region where the transcription machinery assembles and initiation occurs; strength is a *rate*, well approximated by a PWM score, and perfect consensus is counterproductive because the polymerase then binds too tightly to escape. [Ch 05](part-01-molecular-foundations/05-transcription.md)

**promoter-proximal pausing** — Pol II initiating, moving ~30 nt and stalling until released by P-TEFb; a separately regulated decision, which is why Pol II ChIP signal at a promoter usually means a paused polymerase rather than an expressed gene. [Ch 05](part-01-molecular-foundations/05-transcription.md)

**proofreading** — The polymerase's 3′→5′ exonuclease removing a misinserted base; it contributes one factor of ~100 out of ~10¹⁰ and is hopelessly inadequate alone. [Ch 04](part-01-molecular-foundations/04-dna-replication.md)

**prosecutor's fallacy** — Reporting P(evidence | innocence) as if it were P(innocence | evidence); posterior odds = prior odds × likelihood ratio, and the alternative hypothesis must name a plausible source, including relatives. [Ch 57](part-12-applications-and-ethics/57-genomics-in-practice.md)

**pseudogene** — A duplicate or retrotransposed copy that has lost coding function; GENCODE 50 annotates 14,702, and decay to a pseudogene is the *default* fate of a duplicate. [Ch 35](part-07-molecular-evolution/35-genome-evolution.md)

**pseudoreplication** — Treating non-independent units as independent; in single-cell condition comparisons the unit is the donor, and cell-level tests inflate significance by roughly the square root of cells per donor. [Ch 48](part-10-functional-genomics/48-single-cell-and-spatial.md)

**Punnett square** — A hand-drawn outer product of gamete types; correct but scaling as 4ⁿ, so multiply per-locus probabilities instead. [Ch 10](part-02-transmission-genetics/10-mendelian-inheritance.md)

**purging** — Removal of recessive deleterious alleles by the selection that inbreeding exposes them to. Real but small — under 1% average effect on inbreeding depression across 119 captive pedigreed populations — because selection sees an allele only when |*N*<sub>e</sub>*s*| ≳ 1, and the small *N*<sub>e</sub> causing the inbreeding is what blinds it. Cannot be a conservation plan. [Ch 35A](part-07-molecular-evolution/35A-speciation-and-ecological-genetics.md)

**purifying selection** — Removal of deleterious variants; pervasive, and the reason most mutations never become fixed differences — which is precisely what makes neutral theory a claim about *fixed* differences only. [Ch 27](part-05-population-genetics/27-the-four-forces.md)

**purine** — A or G, the two-ring bases; the larger of the two size classes, which is why every base pair is one purine against one pyrimidine and the duplex holds a constant width. The bond joining a purine to its sugar is also the one that hydrolyses spontaneously, at ~10⁴ depurinations per cell per day. [Ch 02](part-01-molecular-foundations/02-dna-structure.md)

**PWM (position weight matrix)** — A per-position log-odds model of a binding motif; a genome-wide scan returns on the order of 1,000 false positives per functional site, so motif presence is weak evidence. [Ch 22](part-04-gene-regulation/22-eukaryotic-transcriptional-regulation.md)

**pyrimidine** — C or T, and U in RNA: the one-ring bases, the smaller of the two size classes. T is U plus a 5-methyl group, which is what lets repair enzymes treat any uracil found in DNA as damage. [Ch 02](part-01-molecular-foundations/02-dna-structure.md)

## Q

**qPCR** — Quantification by measuring the cycle at which fluorescence crosses a threshold, i.e. during the exponential phase; it gives *relative* quantities unless calibrated against a standard curve whose accuracy it then inherits. [Ch 36](part-08-methods/36-core-molecular-methods.md)

**QQ plot** — Observed against expected quantiles of the GWAS p-value distribution; *where* the curve leaves the diagonal is the whole diagnostic. Departure only in the extreme tail means a few real loci; a lift beginning near the origin means polygenicity **or** confounding, which the plot alone cannot separate — that is what the LD-score intercept is for. [Ch 51](part-11-human-and-statistical-genomics/51-gwas.md)

**QTL** — Quantitative trait locus: an **interval**, not a gene, typically 5–30 cM in a standard cross — often tens of megabases and hundreds of genes, and it may contain more than one causal locus. [Ch 32](part-06-quantitative-genetics/32-mapping-quantitative-traits.md)

**quantitative trait** — A continuously varying trait produced by many Mendelian loci plus environmental noise; Fisher 1918 showed the biometricians' correlations are *derivable* from particulate inheritance, so no non-Mendelian mechanism is needed. [Ch 30](part-06-quantitative-genetics/30-quantitative-traits.md)

## R

**r²** — The squared correlation between two loci treated as 0/1 indicators, D²/(p_A p_a p_B p_b); the LD statistic that sets sample size, because testing a tag rather than the causal variant costs a factor of 1/r² in n. r² = 1 requires the two loci to have *matched* allele frequencies (p_A = p_B), so a common SNP can never perfectly tag a rare one. [Ch 29](part-05-population-genetics/29-linkage-disequilibrium.md)

**read alignment** — Placing reads onto a reference by seed-and-extend; the aligner finds the best-scoring placement in a reference that is *not* the source genome, so "best" and "true" come apart wherever the true locus is absent or repeated. [Ch 42](part-09-genomics/42-read-alignment.md)

**recessive** — Describing an allele whose phenotype appears only in the homozygote; usually the by-product of a saturating flux curve, where half the enzyme gives nearly all the flux, rather than of the dominant allele suppressing anything. [Ch 10](part-02-transmission-genetics/10-mendelian-inheritance.md)

**reciprocal best hit (RBH)** — Ortholog inference by mutual top-scoring matches; it returns at most one pair, so it silently discards co-orthologs, and differential loss makes it confidently report paralogs as orthologs. [Ch 35](part-07-molecular-evolution/35-genome-evolution.md)

**reciprocal transplant** — Growing two populations at both of their home sites, the definitional test of local adaptation because it is the only design that makes both required comparisons. Report **local versus foreign** (genotypes compared within a site, so site quality cancels), never home versus away. [Ch 35A](part-07-molecular-evolution/35A-speciation-and-ecological-genetics.md)

**recombination frequency (RF)** — Recombinant gametes divided by total, bounded above by 0.5; RF = 0.5 means the measurement saturated, so unlinked and very-distantly-linked loci are indistinguishable by it. [Ch 14](part-02-transmission-genetics/14-linkage-and-mapping.md)

**recombination hotspot** — A ~1–2 kb interval carrying a disproportionate share of crossovers; in humans positioned by which PRDM9 allele the individual carries, so the sequence alone does not fix them; canids, whose PRDM9 is a pseudogene, use promoters instead. [Ch 18](part-03-genome-instability/18-recombination-mechanisms.md)

**reference bias** — Systematic loss of non-reference alleles because reads carrying them align worse or not at all; a **bias**, so deeper sequencing reduces variance and not the problem, and it falls unequally across ancestries. [Ch 45](part-09-genomics/45-reference-genomes-and-pangenomes.md)

**reference genome** — The agreed coordinate system a project works in, with a sequence attached rather than a consensus of anybody's genome; the human reference is a mosaic of a handful of anonymous donors, dominated by one, carrying the minor allele at millions of positions. "GRCh38" identifies a *family* of files, not a file. [Ch 45](part-09-genomics/45-reference-genomes-and-pangenomes.md)

**regulatory network** — The graph of transcription factors and targets whose dynamics, not whose individual edges, determine cell identity; identity is an attractor, and it is reversible. [Ch 25](part-04-gene-regulation/25-networks-and-development.md)

**repeat expansion** — Growth of a short tandem repeat beyond a threshold across transmissions, causing disease and producing anticipation; the physical mechanism behind a phenomenon that was once dismissed as pure ascertainment bias. [Ch 16](part-03-genome-instability/16-mutation.md)

**replication fork** — The moving junction where the duplex is unwound and both strands copied; forks collide with transcription, especially head-on, and those collisions are a major source of R-loops, stalling and mutation. [Ch 04](part-01-molecular-foundations/04-dna-replication.md)

**repressor** — A protein that reduces transcription by binding a cis element; repression of *lac* is ~1,300-fold with all three operators (~20-fold from O1 alone — the rest comes from looping), not infinite, and the residual expression is required for induction to bootstrap. [Ch 21](part-04-gene-regulation/21-bacterial-regulation.md)

**reproductive isolation** — Any heritable feature that reduces gene flow between populations, classified by *when* it acts: prezygotic (ecological, temporal, behavioural, mechanical, gametic) or postzygotic (extrinsic, or intrinsic hybrid inviability and sterility). Barriers act in sequence and therefore **multiply**, RI = 1 − Π(1 − *b*ᵢ), so an early barrier of a given strength always dominates the accounting. [Ch 35A](part-07-molecular-evolution/35A-speciation-and-ecological-genetics.md)

**retrotransposon** — A Class I element that transposes by an RNA intermediate, inserting a *new* copy while the original stays put, so transposition is strictly additive unlike Class II excision; copy number still falls over time, because recombination between element copies deletes them — most human ERVs survive only as solo LTRs. [Ch 19](part-03-genome-instability/19-transposable-elements.md)

**ribosome** — The RNA-based machine that reads codon–anticodon geometry and forms peptide bonds; it cannot verify which amino acid a tRNA carries, so a mischarged tRNA installs the wrong residue at every occurrence of that codon. [Ch 07](part-01-molecular-foundations/07-genetic-code-and-translation.md)

**riboswitch** — A cis-acting RNA element that changes conformation on binding a metabolite and thereby regulates its own transcript, with no protein involved. [Ch 21](part-04-gene-regulation/21-bacterial-regulation.md)

**RNA interference (RNAi)** — Argonaute-mediated silencing guided by small RNAs; it is the antiviral defence of plants and invertebrates, whereas mammals answer viral dsRNA with interferon and PKR — in mammals RNAi is mainly a tool. [Ch 24](part-04-gene-regulation/24-rna-based-regulation.md)

**RNA polymerase** — The enzyme that synthesises RNA from the **template** strand; the RNA merely resembles the coding strand, which is why the coding strand is the one printed in databases. [Ch 05](part-01-molecular-foundations/05-transcription.md)

**RNA-seq** — Sequencing of a transcript population to estimate per-gene abundance; a measurement of *relative* composition, which is why normalisation and not depth is the conceptual heart of the analysis. [Ch 47](part-10-functional-genomics/47-rna-seq.md)

**RNA velocity** — Inference of expression change direction from the unspliced:spliced ratio; it reports the sign of a steady-state residual under strong kinetic assumptions, projected onto a non-metric embedding, and documented cases point backwards. [Ch 48](part-10-functional-genomics/48-single-cell-and-spatial.md)

**Robertsonian translocation** — Fusion of two acrocentric chromosomes at their centromeres; balanced carriers are healthy but at reproductive risk, and this is the mechanism behind familial Down syndrome. [Ch 20](part-03-genome-instability/20-chromosome-abnormalities.md)

**runs of homozygosity (ROH)** — Long homozygous genomic stretches reflecting recent shared ancestry; a direct genomic measure of realised F, superior to a pedigree expectation. [Ch 28](part-05-population-genetics/28-structure-and-inbreeding.md)

## S

**SAM format** — The text alignment format with 11 mandatory fields plus optional tags; a row is an alignment record, not a read. [Ch 41](part-09-genomics/41-data-formats.md)

**Sanger sequencing** — Chain-termination sequencing read by capillary electrophoresis; its enduring value is error **independence** rather than accuracy — a confirmation sharing failure modes with the thing it confirms is worthless. [Ch 40](part-09-genomics/40-sequencing-technologies.md)

**screen (genetic)** — A systematic search of perturbed individuals or cells for a phenotype; a "saturated" screen has found all the genes findable *by that assay, in that background*, and redundant, essential and pleiotropic genes are structurally invisible to it. [Ch 37](part-08-methods/37-model-organisms-and-screens.md)

**seed (miRNA)** — Nucleotides 2–8 of a miRNA, which dominate target recognition; one specific 7-mer occurs ~1,400 times by chance across the human 3′UTR-ome, so chance matches outnumber real ones. [Ch 24](part-04-gene-regulation/24-rna-based-regulation.md)

**seed-and-extend** — The alignment strategy of finding exact short matches then extending by dynamic programming; the pigeonhole principle sets how long a seed can be for a given mismatch budget. [Ch 42](part-09-genomics/42-read-alignment.md)

**segmental duplication** — A duplicated block >1 kb at >90% sequence identity, also called a low-copy repeat; the repeat class that causes recurrent disease-associated rearrangements by NAHR, and that collapses in assemblies. [Ch 39](part-09-genomics/39-genome-landscapes.md)

**segregation (Mendel's first law)** — That the two alleles of a heterozygote separate into different gametes; each meiosis produces *exactly* two of each allele, so the observed noise comes from which gametes fertilise. [Ch 10](part-02-transmission-genetics/10-mendelian-inheritance.md) · [Ch 09](part-02-transmission-genetics/09-mitosis-and-meiosis.md)

**selection coefficient (s)** — The proportional fitness reduction of a genotype; whether selection or drift dominates is decided by |N_e·s|, the most important inequality in population genetics. [Ch 27](part-05-population-genetics/27-the-four-forces.md)

**selective sweep** — The reduction of diversity around a rapidly rising beneficial allele, leaving long haplotypes and a skewed site frequency spectrum; background selection produces the same reduction chronically, which is why sweeps require an outlier argument. [Ch 33](part-07-molecular-evolution/33-neutral-theory-and-selection-tests.md)

**sex chromosome** — A chromosome carrying a sex-determining switch; the switch is not conserved — presence of a Y makes a mammal male, whereas in *Drosophila* the Y is irrelevant to sex and XXY flies are fertile females. [Ch 13](part-02-transmission-genetics/13-sex-linkage.md)

**sex linkage** — Location of a locus on a sex chromosome — nothing more. Colour vision, factor VIII and dystrophin have nothing to do with sex; and sex-*limited* and sex-*influenced* traits are usually autosomal. [Ch 13](part-02-transmission-genetics/13-sex-linkage.md)

**shadow enhancer** — A second, apparently redundant enhancer driving the same expression pattern; deleting one often does nothing under standard conditions and everything under stress, so redundancy is the developmental norm. [Ch 25](part-04-gene-regulation/25-networks-and-development.md)

**sigma (σ) factor** — The interchangeable bacterial subunit that gives core RNA polymerase its promoter specificity; swapping σ switches an entire transcriptional programme, and *E. coli* has seven. [Ch 21](part-04-gene-regulation/21-bacterial-regulation.md)

**single-cell RNA-seq (scRNA-seq)** — Per-cell transcript counting via barcoding; most zeros in UMI data are ordinary sampling predicted by a plain count model, and the zero-inflation/imputation framing has been substantially retired. [Ch 48](part-10-functional-genomics/48-single-cell-and-spatial.md)

**SKAT** — A variance-component rare-variant test sensitive to bidirectional effects, where a burden test cancels toward zero; the complement to burden, chosen by what you believe about effect direction. [Ch 54](part-11-human-and-statistical-genomics/54-rare-variants-and-mendelian-disease.md)

**soft clipping** — Retention in the record of read bases not aligned to the reference; clipping clustered at a single coordinate is the primary short-read evidence for a structural variant, not a sign of a bad read. [Ch 42](part-09-genomics/42-read-alignment.md)

**somatic mutation** — A mutation arising in a non-germline cell and therefore not transmitted; every person is a mosaic of somatic lineages, which is the foundation of cancer genomics. [Ch 16](part-03-genome-instability/16-mutation.md)

**spatial transcriptomics** — Measuring transcripts with positional information; capture-based methods give per-*spot* mixtures needing deconvolution, imaging-based methods give per-molecule positions needing segmentation, and neither hands you clean single-cell profiles. [Ch 48](part-10-functional-genomics/48-single-cell-and-spatial.md)

**species concept** — A rule for deciding where one species stops. The three in general use are three different *operations*, not three phrasings: the **biological** concept tests interbreeding (a cross), the **phylogenetic** concept tests diagnosability and ancestry (a tree), the **genotypic-cluster** criterion tests for a deficit of intermediates in sympatry (a histogram). They agree on easy cases and diverge exactly where you needed an answer, because divergence is continuous — so state which you used and report the measurement, not the label. [Ch 35A](part-07-molecular-evolution/35A-speciation-and-ecological-genetics.md)

**spliceosome** — The RNA–protein machine that removes introns; its catalytic core is **RNA** — U6 snRNA positions the two catalytic magnesiums — while its ~150 proteins scaffold, drive and proofread. [Ch 06](part-01-molecular-foundations/06-rna-processing.md)

**splicing** — Removal of introns by two transesterifications that conserve phosphodiester bonds and are near-neutral in energy; all eight ATP-dependent steps buy fidelity and irreversible ordering, not the chemistry. [Ch 06](part-01-molecular-foundations/06-rna-processing.md)

**SPO11** — The topoisomerase-like enzyme that makes ~200–300 programmed meiotic double-strand breaks; without them homologs do not pair, synapse or segregate. [Ch 18](part-03-genome-instability/18-recombination-mechanisms.md)

**SRY** — The Y-linked gene whose product triggers testis determination in mammals; it delivers an input to a switch rather than being maleness itself. [Ch 13](part-02-transmission-genetics/13-sex-linkage.md)

**structural variant (SV)** — A variant of ~50 bp or larger — deletion, duplication, inversion, insertion, translocation; short-read catalogues undercount them severalfold, especially insertions, and even at the true count they affect far more base pairs than SNVs do. [Ch 46](part-10-functional-genomics/46-variant-calling.md)

**subfunctionalisation** — Preservation of both duplicates because complementary degenerative mutations divide the ancestral function between them; a purely neutral route to duplicate retention, unlike neofunctionalisation. [Ch 35](part-07-molecular-evolution/35-genome-evolution.md)

**supercoiling** — Over- or underwinding of a topologically closed DNA domain; cells maintain σ ≈ −0.05 to −0.07, i.e. **under**wound relative to relaxed B-form, because that stores free energy that helps open promoters and origins. [Ch 02](part-01-molecular-foundations/02-dna-structure.md)

**synonymous mutation** — A substitution that changes no amino acid — which is **not** the same as silent: it can destroy a splicing enhancer, alter translation speed and co-translational folding, change mRNA stability, and be non-synonymous in another isoform. *SMN2* c.840C>T changes no amino acid and skips exon 7. [Ch 07](part-01-molecular-foundations/07-genetic-code-and-translation.md)

**synthetic lethality** — Lethality from the combination of two perturbations, each tolerated alone; the principle behind PARP inhibition in HR-deficient tumours. [Ch 17](part-03-genome-instability/17-dna-repair.md)

## T

**T2T-CHM13** — The first gap-free human assembly, adding ~8% of previously inaccessible sequence including all centromeres; a complete hydatidiform mole cell line — effectively haploid, which is exactly why it was assemblable — and it eliminates *gaps*, not reference bias. [Ch 45](part-09-genomics/45-reference-genomes-and-pangenomes.md)

**TAD** — Topologically associating domain: a region of preferentially self-interacting chromatin in a population-averaged Hi-C map. Single-cell tracing finds domain-like blocks whose boundaries sit at different positions in every cell, so a population TAD is a *preference*, not a box. Acute removal of every TAD and loop changes only a low single-digit percentage of genes. [Ch 50](part-10-functional-genomics/50-3d-genome.md)

**tag SNP** — A genotyped marker correlated with an ungenotyped causal variant; high r² between two variants means statistical correlation in that population, not shared biology — that is the entire premise of array genotyping. [Ch 29](part-05-population-genetics/29-linkage-disequilibrium.md)

**Tajima's D** — A scaled contrast between two diversity estimators — mean pairwise differences (π) and Watterson's θ_W, the segregating-site count rescaled by the harmonic number aₙ; it confounds selection with demography, so a negative D is equally consistent with a sweep, population expansion, background selection or ordinary purifying selection. [Ch 33](part-07-molecular-evolution/33-neutral-theory-and-selection-tests.md)

**TATA box** — A promoter element ~25–30 bp **upstream** of the transcription start site; most human promoters lack one, and transcription does not start at it. [Ch 05](part-01-molecular-foundations/05-transcription.md)

**tautomer** — The same molecule with one hydrogen sitting on a different atom, which turns a hydrogen-bond donor into an acceptor; the rare enol and imino forms of the bases are what let A·C and G·T pair at all, and hence one route to spontaneous mispairing. [Ch 02](part-01-molecular-foundations/02-dna-structure.md)

**telomerase** — The reverse transcriptase that extends telomeres from its own internal RNA template (TERC), needing no external one; a division counter with a genuine trade-off, since variants shortening telomeres cause marrow failure and pulmonary fibrosis while variants lengthening them raise melanoma and glioma risk. [Ch 04](part-01-molecular-foundations/04-dna-replication.md)

**telomere** — The repetitive protective end of a linear chromosome; shortening is partly the lagging-strand terminal-primer gap and partly deliberate nucleolytic resection at the leading end to create the 3′ overhang. [Ch 04](part-01-molecular-foundations/04-dna-replication.md)

**template strand** — The strand RNA polymerase reads; template-ness belongs to a *transcription unit*, not to a gene, since genes run both ways and one strand's template is the neighbouring gene's coding strand. [Ch 05](part-01-molecular-foundations/05-transcription.md)

**Ti/Tv ratio** — Transitions over transversions in a callset (~2.0 genome-wide, ~3.0 in exomes); sensitive to bulk false positives with a near-random spectrum, actively *misled* by spectrum-biased artefacts (FFPE C>T raises it, oxidative G>T lowers it), and silent about false negatives. [Ch 46](part-10-functional-genomics/46-variant-calling.md)

**TMB (tumour mutational burden)** — Somatic mutations per megabase; a weak and assay-dependent prior for immunotherapy response, with neoantigen quality, clonality and immune infiltration all mattering more than the count. [Ch 56](part-11-human-and-statistical-genomics/56-cancer-genomics.md)

**topoisomerase** — The enzyme class that changes DNA linking number by transient strand breakage; required because in a topologically closed domain, unwinding here forces overwinding there. [Ch 02](part-01-molecular-foundations/02-dna-structure.md)

**TPM** — Transcripts per million: a within-sample rescaling for reading and cross-gene comparison, which discards the count magnitude that encodes precision and is therefore not what you test on. [Ch 47](part-10-functional-genomics/47-rna-seq.md)

**transcription** — Synthesis of RNA from a DNA template; per event it is ~10⁵ times sloppier than replication (~10⁻⁵ per base), which is fine because the product is one disposable copy of thousands rather than the archive. [Ch 05](part-01-molecular-foundations/05-transcription.md)

**transcription factor (TF)** — A sequence-specific protein with separable DNA-binding and effector modules that regulates transcription; occupancy is a probability, and most ChIP peaks have no measurable effect when perturbed. [Ch 22](part-04-gene-regulation/22-eukaryotic-transcriptional-regulation.md)

**transgenerational epigenetic inheritance** — Transmission of an epigenetic state to descendants who were never exposed; in mammals it requires surviving two genome-wide reprogramming waves, the known escapees are mostly retrotransposons, and no human study has demonstrated it. The Dutch Hunger Winter cohort were exposed *in utero* — F1, not F3. [Ch 23](part-04-gene-regulation/23-chromatin-and-epigenetics.md)

**transition / transversion** — Purine↔purine or pyrimidine↔pyrimidine substitution versus purine↔pyrimidine; transitions are ~2× more frequent despite there being twice as many possible transversions. 5-methyl-C deamination at CpG is the largest single *named* cause but carries only about a third of the excess — the rest is the general geometric ease of transition mispairing. [Ch 16](part-03-genome-instability/16-mutation.md)

**translation** — Decoding of mRNA into protein by the ribosome; fidelity lives in aminoacyl-tRNA synthetase charging and in codon–anticodon proofreading, not in any check on amino acid identity at the ribosome. [Ch 07](part-01-molecular-foundations/07-genetic-code-and-translation.md)

**translocation** — Exchange of segments between non-homologous chromosomes; a balanced carrier has no dosage abnormality and is typically healthy, with reproductive rather than personal risk. [Ch 20](part-03-genome-instability/20-chromosome-abnormalities.md)

**transposable element (TE)** — A sequence able to move or copy itself within a genome, making up ~46% of the human genome — a lower bound set by detection, since older copies have decayed past recognition. Activity is confined to narrow windows (germ cells, early embryo, some neurons, tumours), not constant. [Ch 19](part-03-genome-instability/19-transposable-elements.md)

**trio sequencing** — Sequencing a proband with both parents to detect de novo variants and resolve phase; before filtering, ~98% of naive de novo calls are artefacts. [Ch 54](part-11-human-and-statistical-genomics/54-rare-variants-and-mendelian-disease.md)

**trisomy** — Three copies of one chromosome; which autosomal trisomies survive to term tracks gene *poverty* rather than chromosome size — trisomy 21 survives because chromosome 21 is gene-poorest, and trisomy 19 is never seen at term. [Ch 20](part-03-genome-instability/20-chromosome-abnormalities.md)

**tumour suppressor gene** — A gene whose *inactivation* permits tumour growth, recognisable from dispersed truncating mutations; the strict two-hit model is broken by haploinsufficiency, dominant-negative alleles and epigenetic silencing. [Ch 56](part-11-human-and-statistical-genomics/56-cancer-genomics.md)

**TWAS** — Transcriptome-wide association study, testing gene-level associations built from predicted expression; a weighted sum of the same GWAS z-scores, so LD and co-regulation of neighbouring genes routinely make bystanders significant — it is not a causal test. [Ch 52](part-11-human-and-statistical-genomics/52-association-to-mechanism.md)

**twin study** — Comparing MZ and DZ resemblance — correlations, or concordance for binary traits — to partition variance; it estimates total additive variance plus several biases, which is why twin h² and SNP h² are different estimands and are not supposed to agree. [Ch 31](part-06-quantitative-genetics/31-heritability-and-selection.md)

**two pots argument** — Lewontin's demonstration that heritability can be ~1 within each of two groups while the entire difference between them is environmental; the general situation, not an edge case, and the reason no within-population heritability licenses any between-group inference. [Ch 31](part-06-quantitative-genetics/31-heritability-and-selection.md)

## U

**UMAP** — A non-linear embedding used to visualise single-cell data; between-cluster distance, cluster size, density and relative arrangement all carry **no** information, and only local neighbourhood structure is approximately preserved. [Ch 48](part-10-functional-genomics/48-single-cell-and-spatial.md)

**UMI** — A unique molecular identifier tagging each input molecule before amplification, so that duplicates can be collapsed and molecules counted rather than reads; without UMIs, coordinate deduplication in RNA-seq deletes real signal. [Ch 47](part-10-functional-genomics/47-rna-seq.md)

**uniparental disomy (UPD)** — Inheritance of both copies of a chromosome from one parent; not harmless despite all the sequence being present, because it silences imprinted loci and, in isodisomy, exposes one parent's recessive variants. [Ch 20](part-03-genome-instability/20-chromosome-abnormalities.md)

## V

**VAF (variant allele fraction)** — The fraction of reads supporting the alternate allele; it confounds tumour purity, local copy number and mutant multiplicity, so only cancer cell fraction is interpretable. [Ch 56](part-11-human-and-statistical-genomics/56-cancer-genomics.md)

**variant annotation** — Assigning a predicted consequence to a variant; a variant has one consequence **per transcript**, so "the" consequence is an aggregation rule you chose, and different rules disagree on the same VCF row. [Ch 44](part-09-genomics/44-annotation.md)

**variant calling** — Inferring genotypes from aligned reads by computing a posterior at each site; every call is a decision at an operating point, so "the variants in this sample" is not well defined without stating the threshold. [Ch 46](part-10-functional-genomics/46-variant-calling.md)

**VCF** — A 1-based, reference-relative variant format; a *missing* row means not called, which may mean no coverage at all, and two files listing the same variant share POS/REF/ALT only after normalisation. [Ch 41](part-09-genomics/41-data-formats.md)

**VUS (variant of uncertain significance)** — A statement about the **evidence**, not about the variant: one whose accumulated evidence has not moved the posterior probability of pathogenicity out of the 0.10–0.90 band. It is not "probably borderline" — most VUSs are benign variants nobody has yet gathered evidence about. It licenses no clinical action and no cascade testing of relatives, and "cautious" action on a VUS is still action on a VUS. VUS rates are higher in under-represented groups because we have less data on them. [Ch 55](part-11-human-and-statistical-genomics/55-clinical-variant-interpretation.md)

## W

**Waddington's landscape** — A metaphor for developmental attractors; it has no spatial dimension, no general potential function, and cannot represent oscillation — yet the segmentation clock is an oscillator. Useful for intuition, misleading for dynamics. [Ch 25](part-04-gene-regulation/25-networks-and-development.md)

**Wahlund effect** — The heterozygote deficit produced by pooling differentiated subpopulations; indistinguishable from inbreeding at a single locus, and separating them requires many loci. [Ch 28](part-05-population-genetics/28-structure-and-inbreeding.md)

**Western blot** — Antibody-based detection of size-separated proteins; it does not work by hybridisation, because proteins do not base-pair, and an antibody sold as "anti-X" is only validated by loss of signal in a knockout. [Ch 36](part-08-methods/36-core-molecular-methods.md)

**winner's curse** — Systematic inflation of effect sizes that cleared a stringent discovery threshold, worst for the marginal hits, and squared when converted to variance explained; shrinkage on replication is expected behaviour for a real locus. See also *Beavis effect*. [Ch 51](part-11-human-and-statistical-genomics/51-gwas.md)

**wobble** — Non-Watson–Crick pairing at the third codon position, letting one tRNA read several codons; it explains why the third position is cheap *for the amino acid* while remaining the substrate for every neutrality test in molecular evolution. [Ch 07](part-01-molecular-foundations/07-genetic-code-and-translation.md)

**Wright's F-statistics** — Three nested measures of departure from panmixia, each one minus a ratio of heterozygosities: F_IS within subpopulations, F_ST among them, F_IT overall. They telescope as (1 − F_IT) = (1 − F_IS)(1 − F_ST) because 1 − F is a probability of non-identity; F_ST is also the fraction of allele-frequency variance among groups, and F_IS may be negative under disassortative mating. [Ch 28](part-05-population-genetics/28-structure-and-inbreeding.md)

## X

**X inactivation** — Random transcriptional silencing of one X in female mammalian cells, clonally maintained; 15–25% of genes escape it, its ratio is a small-sample binomial so skewing is common, and manifesting female carriers of X-linked recessive disease are well documented. [Ch 13](part-02-transmission-genetics/13-sex-linkage.md)

**X-linked** — Located on the X chromosome; in hemizygous males dominance terms simply do not apply, and X-linked dominant separates from autosomal dominant only through an **affected father**, who transmits to all daughters and no sons. [Ch 13](part-02-transmission-genetics/13-sex-linkage.md)

## Y

**Y chromosome** — The male-determining mammalian sex chromosome, degenerate through lack of recombination outside the PARs; gene loss occurred in a few early bursts and then stopped — the human Y has lost one ancestral gene in the ~25 My since divergence from rhesus macaque. [Ch 13](part-02-transmission-genetics/13-sex-linkage.md)

**yeast two-hybrid** — An interaction assay reconstituting a transcription factor from two fusion proteins; a hit means they *can* interact when both are forced into a yeast nucleus at high concentration, which they may never be in any real cell. [Ch 36](part-08-methods/36-core-molecular-methods.md)

## Z

**Z-DNA** — A left-handed duplex conformation favoured by alternating purine–pyrimidine sequence; not a laboratory artefact — it forms behind transcribing polymerases and is read by Zα-domain proteins. [Ch 02](part-01-molecular-foundations/02-dna-structure.md)
