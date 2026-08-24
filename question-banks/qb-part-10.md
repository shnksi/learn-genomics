# Question bank — Part 10: Functional genomics

Covers [Ch 46-50](../part-10-functional-genomics/46-variant-calling.md).

Convert to Anki: `python reference/to_anki.py question-banks/ --out anki-import.tsv`

## The genotype posterior

Q: A Phred quality of 30 and of 10 correspond to what error probabilities, and how does a caller use them?
A: The quality is an error probability: e = 10^(-q/10), so Q30 means e = 0.001 and Q10 means e = 0.1. The emission model is P(base | template allele) = 1 - e when the base matches and e/3 otherwise, error going to one of the three other bases. That single fact is what makes calling a probabilistic problem rather than a counting one.

Q: Name the three separable ways a rule like "at least 3 alt reads and at least 20% allele fraction" fails.
A: It discards the confidence of each observation, since three Q40 alt reads and three Q10 alt reads are the same count and wildly different evidence. Its operating point drifts with depth, being stringent at 5x and satisfied by pure error at 200x. And it emits a decision instead of a distribution, so nothing downstream can propagate the uncertainty.

Q: Which of the VCF fields PL, GQ and QUAL include the prior, and what does each mean?
A: Only QUAL. PL is the Phred-scaled genotype likelihoods normalised so the best is 0; GQ is the difference between the two smallest PLs, i.e. confidence in the called genotype; QUAL is -10 log10 P(site is hom-ref given the data) and comes from the posterior.

Q: Why is PL deliberately kept prior-free?
A: Because the likelihood is a sufficient summary of that site's data while the prior is not a property of the data. Keeping them separate lets a later step substitute a better prior -- from a cohort, a population allele frequency, or a pedigree -- without going back to the reads. That is exactly how joint genotyping and imputation work.

Q: Same site, 5 ref and 3 alt reads either way. With two alt reads at Q30 the call is a confident het; with all three alt reads at Q10 it flips to hom-ref. Why?
A: The allele counts and the 37.5% allele fraction are identical, but a Q10 base is 100 times more likely to be an error than a Q30 base, so the hom-ref likelihood rises far more than the het likelihood does. GQ falls from 60 to 19; the posterior margin separately collapses to about 11, which GATK would write as PP, not GQ. A count-and-threshold rule calls a confident het in both cases and cannot express the difference.

Q: Misconception: more depth always means better calls. What is actually true?
A: Depth helps only if the reads are independent and correctly placed. 200x of PCR duplicates, or 200x inside a segmental duplication collapsed in the reference, buys confident wrong answers. QUAL rises with depth regardless of truth, which is exactly why QD = QUAL divided by depth exists.

## Haplotypes, joint calling and filtering

Q: Why can a position-wise caller not find a 4 bp deletion in a CA tandem repeat, no matter how much depth you give it?
A: Placement of the deletion within the repeat is genuinely ambiguous, and the aligner resolves it per read without coordination, so different reads carry the gap at different offsets and some carry a mismatch instead. The evidence is smeared across several columns, none reaching significance, and more depth adds more smear because the ambiguity is systematic rather than random.

Q: What does the pair-HMM compute that Needleman-Wunsch does not, and why does that fix indel calling?
A: The forward algorithm gives P(read | haplotype) as a sum over all alignments, where Needleman-Wunsch takes the maximum. You never commit to one alignment; you marginalise over the ambiguity you were previously forced to resolve arbitrarily. The latent variable also changes, from "the base at position p" to "the pair of haplotypes spanning this window", with candidates enumerated from a local de Bruijn assembly.

Q: Misconception: deep-learning variant callers win because they are bigger models. What is the real reason?
A: They learn the joint error structure that the product-over-reads likelihood assumes away. Homopolymer length, cycle position, strand asymmetry, local context and the signature of a collapsed repeat are correlated errors that a convolution over the read-by-position grid can represent and an independence assumption cannot. It is a correction to conditional independence, not extra capacity.

Q: Misconception: joint calling works by pooling reads across samples. What is actually shared?
A: No reads are shared; each sample's likelihood still comes from its own reads alone. What the cohort supplies is the site-specific prior -- which sites are polymorphic and at what frequency. If 500 samples show a site segregating at 20%, the prior for het becomes 2(0.2)(0.8) = 0.32 instead of the genome-wide 10^-3, and weak per-sample evidence now crosses the line.

Q: What problem does the gVCF solve, and what does the symbolic NON_REF allele do?
A: It solves the N+1 problem: naive joint calling re-runs the expensive per-sample step over the whole cohort whenever a sample is added. A gVCF runs that step once per sample and emits likelihoods for every position, with hom-ref stretches compressed into blocks. NON_REF carries the likelihood of "some allele other than those listed", which lets a later merge evaluate an alternate allele this sample never showed.

Q: A het call has depth 60, allele balance 0.50, high base qualities and QUAL in the thousands, but MQRankSum is -6.2. What is going on?
A: Alt-supporting reads have systematically lower mapping quality than ref-supporting reads, the classic signature of a paralogue collapsed into the reference. Reads from the unrepresented copy pile onto the represented one, carrying the real differences between paralogues as apparent heterozygous variants. Every within-column statistic looks fine because the artefact is a genuine 50/50 mixture of two real sequences.

Q: A purely random error process gives Ti/Tv = 0.5. Why, what do real callsets give, and what is the ratio blind to?
A: Only 4 of the 12 possible substitutions are transitions, so a uniform process gives 4/8 = 0.5. Real human germline variation is transition-enriched at about 2.0 to 2.1 genome-wide and 3.0 to 3.3 in exomes, driven mainly by deamination of 5-methylcytosine at CpG sites. Bulk false positives with a near-random spectrum dilute the ratio toward 0.5, which is what makes it useful, but it says nothing about which calls are wrong, nothing about false negatives, and spectrum-biased artefacts move it predictably -- FFPE C>T damage can push it up.

Q: Why are univariate hard filters wrong in a specific way, and what does trained recalibration (VQSR) do instead?
A: Each hard cut is a marginal decision on a jointly distributed annotation vector, so a variant that is only mildly unusual on four axes passes every individual test. VQSR models the joint distribution instead: it is semi-supervised, fitting a Gaussian mixture in annotation space to variants overlapping a high-confidence known catalogue assumed mostly true, fitting a second model to everything else, scoring each variant by the likelihood ratio, and cutting at a target sensitivity to the known set.

Q: Where does VQSR fail in exactly the situations where hard filters still work?
A: It needs enough variants to fit a mixture, so it breaks on single exomes and small panels. And it assumes the known catalogue is representative of the true variants you are trying to recover, which is false for anything novel or population-specific. The trajectory is toward supervised classifiers trained on benchmark truth, and in end-to-end deep-learning callers toward abolishing the separate filtering stage entirely.

Q: How is cross-sample contamination estimated from a callset, and how little of it already matters?
A: In a pure sample the allele fractions at biallelic SNPs cluster at 0, 1/2 and 1. Contaminating DNA at fraction alpha from an unrelated individual pushes hom-ref sites up toward alpha x f, pulls hom-alt sites down and shifts hets off 1/2, with the displacement predicted by the population allele frequency f at each site, so alpha is fitted by maximum likelihood over thousands of common SNPs. It is a one-parameter mixture model, sensitive well below 1%, and a few percent is already enough to inflate het calls and destroy somatic calling.

Q: Why does a sex check need both X heterozygosity outside the pseudoautosomal regions and Y depth?
A: Each signal alone is ambiguous: X heterozygosity distinguishes one X from two, Y depth distinguishes presence from absence, and karyotypes exist that separate them. Disagreement between the two is informative rather than an error to be suppressed. And because it can reveal something the participant does not know about themselves, it is a consent question as much as a QC question.

## Structural variants, somatic calling and honest benchmarks

Q: Why is structural variant calling a different problem rather than a harder version of SNV calling?
A: Because the variant is larger than the read. By convention an SV is a rearrangement over 50 bp, so you never observe it directly and must infer it from indirect signatures: discordant pair insert sizes, split reads, read depth, or local assembly. Read depth is blind to balanced events such as inversions and reciprocal translocations, which change no copy number at all.

Q: Why do short reads fail at structural variants specifically, why are insertions the worst case, and how large is the gap?
A: SVs are overwhelmingly created in and by repetitive sequence -- tandem-repeat length variation and mobile-element insertion account for most events genome-wide, while non-allelic homologous recombination dominates the recurrent, disease-associated class -- so breakpoints sit by construction where short reads cannot be placed uniquely. A deletion leaves a gap in reference-aligned data, but inserted sequence absent from the reference leaves nothing to align to. Short-read studies reported a few thousand SVs per genome; long-read and assembly-based analyses find roughly 20,000 to 25,000, with insertions and deletions in near balance.

Q: Why does the germline three-genotype framework not transfer to somatic calling?
A: A tumour is a mixture of normal cells and subclones at unknown proportions, so the variant allele fraction is continuous: VAF = rho x phi x 1/2 for a het mutation in a diploid region, with rho the purity and phi the fraction of tumour cells carrying it. There is no discrete three-way choice, so callers test a composite hypothesis -- somatic allele fraction greater than zero in the tumour given zero in the normal -- and emit a log-odds score rather than a genotype.

Q: Misconception: an F1 of 0.999 on the GIAB benchmark means about 1 error per 1,000 variants in my data. What does it actually mean?
A: It means that within regions where truth could be established, on those samples, with that chemistry. The high-confidence BED excludes segmental duplications, centromeric and satellite sequence, many large tandem repeats, and anywhere the constituent technologies disagreed -- that is, precisely the hard regions, because truth could not be established there either. Ask for stratified numbers by difficulty class instead.

Q: A position is missing from a VCF. What could explain it, and what do clinical pipelines report instead?
A: It could be confidently hom-ref, covered by zero reads, covered only by mapping-quality-zero reads, called and then filtered, inside a pre-excluded region, or present in the sample but absent from the reference. A plain VCF cannot distinguish these, so clinical pipelines report callable-region coverage per gene per sample, and a negative result without that statement is uninterpretable rather than reassuring.

## RNA-seq: library preparation, quantification and QC

Q: Poly-A selection or rRNA depletion -- what does each capture, and when do you choose which?
A: Total RNA is over 80% rRNA, so every protocol must choose what to keep. Poly-A selection keeps polyadenylated RNA, mostly mature mRNA: depth-efficient, but blind to non-polyadenylated transcripts, most nascent RNA and bacterial RNA, and it needs high-quality input because degradation truncates from the 5' end. rRNA depletion keeps everything except rRNA -- mRNA, lncRNA, pre-mRNA, circRNA, histone mRNAs -- tolerates FFPE and degraded input, and pays in a large intronic and non-coding read fraction. Choose depletion for degraded or clinical material, lncRNA, nascent transcription or prokaryotes.

Q: Misconception: PCR duplicates should be removed from RNA-seq by coordinate, as in DNA sequencing. Why is that wrong?
A: In RNA-seq coordinate duplicates are expected, because a short, highly expressed transcript is legitimately covered by identical fragments, so coordinate deduplication deletes real signal. The fix is a UMI, a random barcode attached to each cDNA molecule before amplification, so that two reads sharing a UMI and a position came from one original molecule. The UMI must be long enough that same-position collisions are rare given the number of molecules there, which is a birthday-problem calculation rather than a guess.

Q: Two isoforms share exons: 80 reads unique to A, 20 unique to B, 100 shared, equal effective lengths. Where does EM put the shared reads?
A: The E-step gives each read a responsibility proportional to theta_t P(r | t) normalised over transcripts, and the M-step re-estimates theta_t proportional to the summed responsibilities divided by effective length. Let f be A's share at the fixed point: c_A = 80 + 100f out of a total of 200, so f = (80 + 100f)/200 and f = 0.8, giving c_A = 160 and c_B = 40. The unique reads identify the mixture and the shared reads are then allocated in proportion to it.

Q: Why does a transcriptome-only index need decoy sequence, and why are gene-level counts more robust than transcript-level ones?
A: Reads originating from sequence not in the transcriptome -- introns, unannotated loci, genomic DNA -- get force-assigned to whatever transcript they least badly resemble, because a model with no null class will explain everything; including the genome as decoy gives the model a "none of the above" option. Because the assignments are inferred, transcript estimates carry inferential uncertainty on top of sampling noise, and two isoforms differing by one short exon are nearly unidentifiable with strongly anticorrelated estimates. Summing to the gene cancels most of that anticorrelated error.

Q: Name the QC signature of degraded RNA, rRNA carryover and genomic DNA carryover, and what each does to the counts.
A: Degraded RNA shows gene-body coverage sloped toward the 3' end with low RIN or DV200, so length normalisation becomes wrong, long genes lose coverage first and look down, and isoform assignment is corrupted. rRNA carryover shows a high fraction of reads on rRNA loci, so your effective depth is only the non-rRNA depth. Genomic DNA carryover shows elevated intergenic and uniform intronic coverage, with no strand preference in a stranded library, and inflates counts for long genes because gDNA reads scale with genomic span.

## RNA-seq: counts, composition and normalisation

Q: Why is an RNA-seq count not a measurement of concentration, and what follows from that?
A: A sequencer draws a fixed-size sample of fragments from a pool, so 30 million fragments come back whether the cell contained 200,000 or 800,000 mRNA molecules; library size is a machine parameter. The counts are approximately a multinomial draw whose probabilities sum to one, so the data are compositional: they carry no information about absolute scale, and one gene rising mechanically lowers every other measured fraction.

Q: Five genes at 1,000 molecules each; gene E rises six-fold and nothing else changes. What does total-count scaling report, and what does median-of-ratios report?
A: Total-count scaling reports that four unchanged genes halved and E rose three-fold -- all five conclusions wrong. Median-of-ratios builds a per-gene geometric-mean reference pseudo-sample, takes each sample's ratio to it gene by gene, and uses the median ratio as the size factor; the one gene that really changed sits at the end of the sorted list and cannot move the median, so the normalised counts recover four unchanged genes and a six-fold rise exactly.

Q: What assumption do median-of-ratios and TMM both rest on, and what happens when it fails?
A: That most genes do not change, and those that do are not all in the same direction. Under any global shift in transcriptional output -- a transcription inhibitor cutting it, a MYC-amplified tumour raising it -- the data are genuinely non-identifiable, because a uniform rescaling and no change at all produce identical compositions. The only fix is external: spike-in RNA added per cell or per unit mass, or an independent cell count.

Q: Why are TPM units comparable across samples when FPKM units are not?
A: The difference is the order of operations. FPKM divides by depth first and then by length; TPM converts counts to rates (count divided by effective length) first and then normalises those rates to sum to a million. TPM therefore sums to 10^6 in every sample, while FPKM sums to a sample-specific constant that shifts when the expression profile changes.

Q: Misconception: TPM is the properly normalised value, so it is what you test on. Why is that wrong?
A: TPM is a per-sample rescaling meant for human reading and cross-gene comparison, and it strips out the count magnitude that encodes precision. A gene at TPM 50 measured from 5 reads and the same gene from 5,000 reads become the same number with no record of reliability. Test on raw counts with log size factors as offsets, and report TPM.

## RNA-seq: design and differential expression

Q: Why do replicates beat depth, and what is the variance expression that proves it?
A: Var(log2 FC) is approximately (1/ln2)^2 x (1/n1 + 1/n2) x (1/mu + alpha). Depth raises the mean count mu and so attacks only the 1/mu term, which has a floor of zero; the dispersion alpha does not move. Replication divides the whole expression by n, with no floor. At alpha = 0.04 the two terms are equal at mu = 25, so past roughly 100 counts per gene the next dollar buys another biological replicate.

Q: Misconception: batch effects can be removed after the fact. When is that false?
A: When batch is confounded with condition -- every control prepared Monday, every treated sample Tuesday. The design matrix then has two collinear columns and the condition coefficient is not identifiable. That is a rank deficiency, not a statistical subtlety, and no downstream correction repairs it. The remedies are blocking, so every batch contains every condition, or randomisation for nuisance variables you did not anticipate.

Q: Why is the negative binomial the right count model rather than the Poisson?
A: Poisson describes technical resampling of a fixed library, where variance equals the mean. Across biological replicates the underlying relative abundance itself varies, and mixing a Poisson rate over a gamma distribution gives exactly a negative binomial, Var = mu + alpha mu^2. The NB is not a fudge factor for extra noise; using Poisson understates every gene's variance and gives p-values wrong by orders of magnitude.

Q: With n = 3 there are about two degrees of freedom per gene, so a per-gene dispersion estimate is nearly worthless. What is done instead?
A: Information is shared across genes: fit a smooth mean-dispersion trend across all roughly 20,000 genes and shrink each gene's noisy estimate toward it, empirical-Bayes style. Without this, genes that happen to look quiet get a tiny dispersion and become spurious hits. Genes with genuinely, robustly high dispersion are detected as outliers and not shrunk, so real variability is preserved. This is the step that makes small-n RNA-seq work at all.

Q: Independent filtering removes 40% of genes before Benjamini-Hochberg and the number of hits rises. Why is that not cheating?
A: Because the filter statistic -- mean normalised count across all samples, computed without reference to the condition labels -- is independent of the p-value under the null. The survivors' p-values are still uniform under H0, so FDR is still controlled, while fewer tests raises BH's threshold of (rank/m) x q for everything remaining. It becomes cheating the moment the filter statistic correlates with the test statistic under the null.

Q: Misconception: the top of a p-value-sorted list is the most changed genes. What is it actually?
A: Partly a list of the most highly expressed genes. A gene at 50,000 counts can clear significance on a fold change too small to care about, while a gene at 40 counts with a genuine 4-fold change may not clear FDR at all. Report and threshold both, and if a minimum effect size matters, put it in the null hypothesis and test whether the absolute log fold change exceeds a threshold.

## Single-cell measurement and its artefacts

Q: State the composition/state confound precisely, with the arithmetic that makes it a non-identifiability.
A: A bulk measurement is b_g = sum over k of pi_k x mu_gk, with pi the unobserved cell-type proportions and mu the unobserved per-cell-type expression; only the product is observed. A gene at 100 units in type A and 20 in type B gives a bulk value of 44 both when A falls from 60% to 30% of the tissue with no cell changing, and when composition is fixed and A downregulates from 100 to 60. No replication or deeper sequencing separates them.

Q: Misconception: zeros in scRNA-seq are dropout needing imputation. What does plain sampling predict, and why is imputation dangerous?
A: With a per-cell library of n molecules and a gene at relative abundance p, P(count = 0) is about e^(-np). At n = 5,000 and p = 2 x 10^-4 that is e^-1 = 0.37, so 37% of genuinely expressing cells record zero; at p = 2 x 10^-5 it is 0.90. For UMI data the observed zero fractions match a negative binomial with a cell-size offset, so zero-inflation has been largely retired. Imputation borrows information across cells and genes, manufacturing correlation structure that downstream network analyses then rediscover.

Q: Why is the doublet rate linear in the number of cells recovered, and which doublets stay undetectable?
A: Cells load into droplets approximately Poisson with mean lambda, so among occupied droplets the multiplet fraction is P(at least 2)/P(at least 1), roughly lambda/2 -- linear in loading concentration. At around 0.5 to 1% multiplets per 1,000 cells recovered, a 10,000-cell run carries roughly 5 to 10%. Detection works by simulating synthetic doublets as sums of observed profiles, so same-type doublets, which look like an ordinary cell, remain nearly undetectable.

Q: What is ambient RNA, and what artefact does it create in the count matrix?
A: mRNA released into the suspension by cells lysed during dissociation. Every droplet, occupied or empty, receives a draw from this shared soup, whose composition is the tissue average dominated by the most abundant and most fragile cell type. It produces a low-level systematic false signal -- haemoglobin in every cell of a blood-rich tissue, insulin in every cell of an islet prep -- and therefore apparent co-expression of markers from different lineages.

Q: Why is a global QC threshold such as min_genes above 500, or mitochondrial percentage below 5, a filter on biology wearing the costume of a filter on quality?
A: Both statistics are genuine properties of cell types. An RNA-content floor deletes platelets, erythrocytes, neutrophils and small resting lymphocytes; a mitochondrial cap deletes cardiomyocytes, hepatocytes, kidney proximal tubule and skeletal muscle. It fails silently, because the missing cell type simply never appears in a figure. Set thresholds adaptively per sample, and cluster what you discarded to see whether it is coherent.

Q: In a droplet scRNA-seq read the cell barcode and the UMI do different jobs. What is each, and what is a count-matrix entry?
A: The cell barcode identifies the partition -- a droplet, a well-path, a plate position -- and is shared by every molecule from that cell; it is drawn from a fixed known whitelist, so sequencing errors can be corrected by Hamming-distance-1 rescue. The UMI is a random tag attached to each individual mRNA molecule before PCR, so a molecule amplified into 400 reads still carries one UMI, and collapsing by UMI converts an amplification-distorted read count into a molecule count. The entry count[cell, gene] is the number of distinct UMIs observed for that cell-gene pair.

Q: With a 12 bp UMI, when do collisions actually matter, and what does sequencing saturation tell you to buy?
A: There are 4^12 = about 1.68 x 10^7 tags, and if m molecules of one gene in one cell are tagged the expected number of distinct UMIs seen is N(1 - e^(-m/N)), which for m much less than N is essentially m -- so for typical counts of tens per gene per cell collisions are negligible, and only a very highly expressed gene with a short UMI needs the occupancy correction. Saturation is the rising fraction of reads that duplicate an already-observed UMI: past it, extra reads buy almost no new molecules and the budget belongs on more cells; below it, extra cells buy you noisier cells.

## Single-cell analysis: embeddings, clusters and valid tests

Q: What can you legitimately read off a UMAP, and what can you not?
A: You can read local neighbour relationships, whether a population looks connected or discrete-ish, and whether a labelling is spatially coherent. You cannot read the distance between clusters, cluster size or area, density, or the relative arrangement of clusters: those are set by the repulsion term, the initialisation and parameters such as n_neighbors and min_dist, not by expression divergence. An embedding is a legend for a clustering; quantitative claims belong in PC space.

Q: Misconception: the clustering found the right number of cell types. Why is there no such thing?
A: Community detection optimises modularity at a chosen resolution and the number of communities is monotone in that parameter, with no data-driven optimum. Modularity also has a resolution limit: below a size scale set by the total edge count, genuinely separate communities merge however distinct they are. So one resolution cannot suit both an abundant and a rare population in the same dataset.

Q: Why is a marker gene at p = 10^-80 between two clusters not evidence, and what are the two fixes that work?
A: The clusters were built by an algorithm maximising separation on the same matrix that contains that gene, so the null hypothesis was used to construct the groups; forcing two clusters on a homogeneous population yields extreme significance. The fixes are selective inference, which computes the p-value conditional on the clustering event, or count splitting: if X is Poisson(lambda), draw X1 from Binomial(X, e) and set X2 = X - X1, which are exactly independent, then cluster on X1 and test on X2. Splitting cells rather than counts does not work, because labelling held-out cells uses their own expression.

Q: When comparing conditions in single-cell data, why is the independent unit the donor rather than the cell?
A: Cells from one donor share that donor's biology and batch, so ten thousand cells from three patients are three replicates. A cell-level test understates the standard error by roughly the square root of cells per donor -- with 2,000 cells per donor that is about 45-fold, and the false-positive rate approaches one. The fix is pseudobulk: sum counts within each cell-type-and-donor pair and run the ordinary bulk pipeline, or use a mixed model with a donor random effect.

Q: Misconception: spatial transcriptomics gives per-cell expression with coordinates. What do the two families actually give?
A: Capture-based methods give per-spot mixtures needing deconvolution against a single-cell reference -- the composition problem run deliberately in reverse, since a 50 micrometre feature covers several cells. Imaging-based methods give per-molecule positions needing cell segmentation, whose errors produce spatially structured false co-expression that survives every non-spatial correction. Neither hands you clean single-cell profiles.

Q: Misconception: RNA velocity arrows show the direction of differentiation. What do they actually show, and how can they point backwards?
A: Reads on introns report unspliced pre-mRNA u and junction reads report spliced mRNA s; under a steady-state assumption s* = (beta/gamma) u, so a line fitted through the (u, s) cloud across cells makes a cell above the line switching off and one below it switching on, and pooling that sign across genes gives an arrow. Only the ratio of rates is identifiable from a snapshot, so the units are arbitrary and only the direction can mean anything, and the steady-state fit assumes constant kinetic rates across cells -- transcriptional boosts, multiple kinetic regimes and cell-type-specific splicing rates each flip the sign. Documented cases point backwards in developmental systems whose true direction is known, and the arrow is projected onto a non-metric UMAP besides.

Q: What are the three honest caveats on a pseudotime ordering?
A: It is defined only up to a monotone reparametrisation, so it has no units and no calibration to wall-clock time. Cell density along the trajectory reflects both dwell time in a state and sampling and survival biases, so "cells accumulate at stage X" is confounded. And the root is supplied by you rather than by the data, because the geometry is symmetric. The confirmatory experiments are lineage tracing with heritable barcodes, metabolic labelling of newly transcribed RNA, and actual time courses.

## Chromatin and epigenome profiling

Q: Why is the ChIP-seq input or IgG control library not optional?
A: It carries, at matched scale, every non-uniformity unrelated to your protein: sonication bias, copy-number variation, mappability, GC bias in library prep, and hyper-ChIPable regions that enrich with any antibody or none. The caller uses it to set a local expected rate, taking lambda as the maximum of the genome-wide background and control-derived rates in nested 1 kb, 5 kb and 10 kb windows. Without it you are testing against a uniform genome, and a uniform genome does not exist.

Q: Why does tethering a nuclease to the antibody beat immunoprecipitating sheared chromatin?
A: It converts background from a selection problem into a generation problem. In ChIP the background is whatever survived the washes, with a hard floor set by non-specific adsorption to beads and antibody. In CUT and RUN or CUT and Tag the genome is left intact and cutting happens only where the antibody recruited the enzyme, so a background fragment must be actively created by an untethered enzyme, which is rare. Hence roughly 10^3 to 10^5 cells for CUT and RUN and 10^2 to 10^4 for CUT and Tag, against 10^6 to 10^7 for ChIP, and a few million reads instead of tens of millions.

Q: Misconception: sequencing a poor ChIP four times deeper will rescue it. Why not?
A: FRiP is a ratio -- fraction of reads in called peaks -- so quadrupling depth quadruples in-peak and background reads alike and leaves signal-to-background exactly where it was. Depth only reduces sampling noise. RSC below 1 means the read-length mappability artefact in the strand cross-correlation exceeds the fragment-length signal, and RSC is computed without calling any peaks, so it is not a thresholding problem: the experiment failed at the enrichment step.

Q: Misconception: "open" chromatin means "active gene". What does accessibility actually mean?
A: That the DNA is not nucleosome-occluded and is reachable by the enzyme. That includes poised and primed elements, insulators, CTCF sites, and regions that are repressed but accessible. Accessibility is a necessary condition for most regulation, not a sufficient one.

Q: What does bisulfite sequencing actually measure, and why is converted DNA hard to align?
A: It measures non-conversion, which is 5mC plus 5hmC together plus whatever simply failed to convert -- hence mandatory spike-in conversion controls, since incomplete conversion looks exactly like methylation. Conversion turns most cytosines into thymines, shrinking the effective alphabet toward three letters so unique mapping falls and multi-mapping rises, and the two strands stop being reverse complements, so you must align against both a C-to-T and a G-to-A converted reference in both orientations. Enzymatic conversion removes the chemical damage but emits the same three-letter output, so only conversion-free native long-read detection escapes the mapping penalty.

Q: Misconception: a differentially methylated site between cases and controls is a regulatory change. What is it usually?
A: A shift in cell-type proportions. Bulk beta is a composition-weighted average over cell types, and between-cell-type differences at a discriminating CpG run 0.5 to 0.9 while a genuine within-cell-type regulatory change is typically 0.01 to 0.05. Disease, age, smoking, infection, medication and time of blood draw all shift leukocyte proportions, so an epigenome-wide association study without composition adjustment is uninterpretable.

Q: What different claims do MPRA and CRISPR tiling support, and what is each one's characteristic false negative?
A: MPRA and STARR-seq test sufficiency: can this sequence, on a plasmid outside native chromatin, activate a minimal promoter? CRISPR tiling tests necessity: is this element required, in its native context, for this gene in this cell type? MPRA's characteristic false negative is an element that needs native chromatin, spacing or a partner; tiling's is redundancy, since shadow enhancers each individually capable of driving the gene make every single-element perturbation read negative.

Q: Why does a broad chromatin domain shatter into hundreds of peaks under a narrow-peak caller, and why does the local lambda trick not rescue it?
A: A point-source mark such as a transcription factor or H3K4me3 poses a spike-detection question against a local background, but a domain such as H3K27me3 or H3K9me3 poses a change-point question -- where does the level shift -- answered by an HMM or by segmentation over windows. A domain's per-bin fold-enrichment is modest, so a conservative maximum over nested windows tested against a spike-detection null shatters it at the noisiest points inside it, or misses it. And with no control library lambda_local must be estimated from the ChIP itself, so a megabase-scale domain elevates its own local window and partly subtracts itself.

Q: What does IDR model, and why is it better evidence than a per-peak q-value?
A: Rank the peaks in each of two replicates by significance: a real peak has correlated ranks across replicates, a spurious one has independent ranks. IDR models the joint rank distribution as a two-component copula mixture -- a reproducible component with positively correlated ranks, a spurious component with independent ranks -- fits the mixing proportion and correlation by EM, and returns for each peak the posterior probability that it came from the spurious component, thresholded at 0.05 by consortium convention. It uses agreement between experiments rather than a within-experiment null, which matters because the peak null is not Poisson, adjacent bins are correlated, and nominal FDR is optimistic by an unquantified amount.

Q: How is chromatin-state segmentation set up as a multivariate HMM?
A: Binarise each of M marks in 200 bp bins by a Poisson threshold against local background, so the observation at bin t is a binary vector in {0,1}^M. Posit a hidden state s_t from 1 to K with a transition matrix, and take emissions as independent Bernoulli per mark given the state. Fit the transitions and emission probabilities by Baum-Welch over the concatenated genome and assign states by Viterbi or posterior decoding; the fitted emission matrix is the entire interpretation.

Q: What do the state labels in a ChromHMM-style segmentation not mean, and why must the model be fitted once across all cell types?
A: The labels are applied by humans reading the emission matrix afterwards -- the model has never heard of a promoter -- so "Active TSS" is a hypothesis about a state, not an output of the model. K is a user choice with no clean criterion, settled by interpretability, and the conditional-independence emission is plainly false yet works anyway, in the way naive Bayes works. Fitting per sample causes ordinary label switching, so state 4 in one sample is not state 4 in another and nothing is comparable.

Q: Misconception: an epigenetic clock measures biological ageing. What is it actually, and what are the cautions?
A: It is an elastic-net regression of array beta values at hundreds of thousands of CpGs onto chronological age, whose L1 penalty selects a few hundred sites -- 353 in the original multi-tissue clock -- predicting age to a few years' mean absolute error, with the residual called age acceleration. It is a predictive model and not a mechanism; its CpG set is arbitrary among correlated predictors, which is exactly what L1 does, so the selected sites are a poor target for mechanistic follow-up; and a clock fitted on bulk tissue inherits the composition confounder, since part of the age signal in blood is immune-cell proportions drifting with age.

Q: Why is a candidate cis-regulatory element registry not a statement about your cells, and what is the general caution about any chromatin mark?
A: A cCRE registry is a union across cell types, so membership means "active somewhere", not "active in your cells". More broadly, much of the machinery writing these marks is recruited by the transcription apparatus, so the mark is often downstream -- H3K36me3 is deposited co-transcriptionally by an enzyme travelling with elongating Pol II, making it a record of transcription rather than a cause. Treat a mark as a measurement of state, an excellent annotation and a good predictor, and require a perturbation before calling it a mechanism.

## The 3D genome

Q: Why can linear genomic distance not be the variable that regulation responds to, and what replaces it?
A: One megabase of B-form DNA has a contour length of 340 micrometres and the nucleus is about 6 micrometres across, so the molecule is not a line in there. The operative variable is contact probability -- how often, across cells and time, two loci find themselves within touching distance. It decays with genomic separation, which is why most enhancers sit near their targets, but it is not determined by separation.

Q: Misconception: raw contact counts can be compared across a Hi-C matrix. What two corrections are mandatory, and why?
A: Contact frequency follows roughly P(s) proportional to s^-1.1, about a 167-fold fall from 100 kb to 10 Mb, so any statistic on raw counts measures the decay and nothing else. Matrix balancing (ICE or KR) removes per-bin visibility differences by assuming the matrix factorises as C_ij = b_i b_j T_ij with equal row sums. Observed over expected then divides each pixel by the genome-wide mean at its separation, so a value finally means "relative to loci this far apart".

Q: Misconception: sequencing twice as deep doubles Hi-C resolution. What is the real arithmetic?
A: A contact is a pair, so a pixel at fixed separation covers L x L base pairs of contact space and its counts scale as L^2. Halving the bin size quadruples the sequencing needed; going from 10 kb to 1 kb costs 100 times the library, hundreds of billions of contacts. That is why kilobase whole-genome maps exist for only a handful of deeply sequenced cell lines, and why capture methods exist at all.

Q: How are A/B compartments called, and what are the two things routinely botched?
A: Take the observed-over-expected matrix for one chromosome arm, compute the Pearson correlation between rows -- asking whether two bins have the same contact preferences -- and take the leading eigenvector, whose sign partitions the chromosome. First botch: the sign of an eigenvector is arbitrary, so it must be oriented against gene density or GC content per chromosome per sample. Second botch: PC1 is not always the compartment, and on heterochromatin-rich or aneuploid chromosomes it often captures the arm split or a copy-number step instead.

Q: State the loop-extrusion model, and explain why the orientation of a CTCF site can matter at all.
A: Cohesin, loaded by NIPBL and removed by WAPL, reels the chromatin fibre through itself, enlarging a loop at roughly a kilobase per second until it is blocked or unloaded. CTCF's zinc fingers read an asymmetric roughly 19 bp motif, so a bound CTCF has a direction; the blocking surface is its N-terminal region, which contacts the SA-RAD21 interface of cohesin. Cohesin arriving from the side the N-terminus faces stalls, and cohesin arriving from the other side passes -- which is why about 90% of loops with unambiguous anchor motifs have those motifs pointing at each other, and why inverting a single site in place flips which partner it loops to.

Q: Misconception: cohesin and CTCF build the compartments. What did the depletion experiments show?
A: Compartments persist and often sharpen when cohesin or NIPBL is destroyed, because the mixing that was blurring them has stopped. Compartments arise from affinity-driven segregation of like chromatin; extrusion is a mixing process that antagonises it. Consistently, WAPL loss extends cohesin residence and lengthens loops while weakening compartmentalisation -- more extrusion, less segregation.

Q: Misconception: TADs control gene expression. What did acute degron depletion show, and what qualifications keep that honest?
A: Removing every TAD and loop acutely changes a few hundred genes, a low single-digit percentage, with no widespread ectopic activation across the boundaries that just vanished: architecture constrains which contacts are possible rather than choosing targets. The qualifications matter -- the affected minority is precisely the genes with long-range enhancers, inducible responses are far more cohesin-dependent than steady states, "acute" means hours whereas over days the loss is lethal to cell identity, bulk RNA-seq hides burst-kinetics changes at constant mean, and degrons leak.

Q: Ensemble Hi-C shows a crisp TAD boundary; single-cell tracing shows boundaries scattered over every position. Reconcile them, and say what a loop's occupancy really is.
A: Each cell has a globular domain with a sharp boundary somewhere, but the boundary's genomic position is a random variable merely peaked at CTCF and cohesin sites. Averaging cells that share a mode gives a crisp population boundary that no individual cell need adopt, and cohesin depletion removes the peak in that distribution rather than the domains. Live imaging of a well-characterised mouse TAD finds the fully CTCF-to-CTCF looped state present only about 3 to 6.5% of the time, with a median lifetime of about 10 to 30 minutes.

Q: Misconception: deleting a TAD boundary causes disease. What does pathogenicity actually require?
A: Most boundary deletions do nothing: engineered CTCF-site deletions at Shh and Sox9 often produce no detectable change, and healthy people in population databases carry boundary-deleting structural variants. Pathogenic enhancer hijacking needs a conjunction -- a boundary genuinely broken, a strong enhancer of the right tissue specificity on one side, a dosage-sensitive gene on the other, and a developmental window in which both are active. A boundary can also be destroyed without any sequence change, as in IDH-mutant glioma where methylation blocks CTCF binding.

Q: What do 3C, 4C, 5C and Hi-C share, what distinguishes them, and what makes Hi-C a targeted assay?
A: All share crosslinking with formaldehyde on living cells, digesting the crosslinked chromatin, proximity-ligating -- better inside the intact nucleus, which cut the random-ligation background substantially -- and reversing the crosslinks to leave a library of chimeric junctions; only the readout differs. 3C is one versus one by qPCR with two locus-specific primers, 4C one versus all by inverse PCR from a single viewpoint, 5C many versus many over a designed primer set, Hi-C all versus all by paired-end sequencing, and Micro-C swaps the restriction enzyme for MNase to put the resolution floor at a nucleosome. Hi-C is targeted because the digested overhangs are filled in with a biotinylated nucleotide before ligation, so biotin sits inside the junction and nowhere else and a streptavidin pull-down after shearing selects exactly the chimeric molecules.

Q: A Hi-C contact count is not a bond. What is it, and which controls estimate the background?
A: It is the number of times, across millions of nuclei, a particular pair of loci happened to be crosslinkable and then survived digestion, ligation, pull-down, PCR and alignment -- not a bond, not a stable association, and not a measurement on a single cell. Crosslinks chain through protein-protein networks, so the effective capture radius is tens of nanometres and is not precisely known. The controls that matter estimate religation of a fragment to itself, unligated dangling ends, and above all random ligation of fragments that were never near each other, taken from the trans-chromosomal background or a foreign-genome spike-in.

Q: Since a pixel's counts scale as L^2, what are the three routine escapes from the resolution arithmetic, and what does each cost?
A: Better fragmentation: Micro-C digests with MNase to mononucleosomes, so the resolution floor is about 150 bp rather than one restriction fragment, at the cost of a finicky digestion parameter. Capture: hybridise the library to oligos tiling chosen regions so every read is spent there, at the cost of the genome-wide view. Protein-directed enrichment such as ChIA-PET or HiChIP: add an immunoprecipitation step so only contacts involving a chosen protein survive, at the cost of every other contact plus all of ChIP's antibody problems.

Q: State the enhancer-hijacking mechanism, and say what determines which phenotype results.
A: A structural variant removes a domain boundary and puts enhancers in contact with genes they normally cannot reach. Around human EPHA4 sits a TAD containing limb enhancers, and deletions, inversions or duplications that remove the boundary let those enhancers reach PAX3, WNT6 or IHH -- the same enhancer set producing brachydactyly, F-syndrome or polydactyly depending purely on which gene is captured, with no coding sequence altered in any of them. Duplications can go further and build a neo-TAD, a new self-contained domain with its own boundaries that packages an enhancer together with a gene that has no business being regulated by it, as at the SOX9/KCNJ2 locus.

Q: Name the two somatic sequence-based flavours of enhancer hijacking in cancer, with an example of each.
A: A structural variant can relocate an enhancer: inv(3) or t(3;3) acute myeloid leukaemia moves a GATA2 enhancer next to MECOM, activating the oncogene while leaving GATA2 haploinsufficient -- two hits from one rearrangement. Or a structural variant can delete a boundary: boundary deletions in T-cell leukaemia release enhancers onto TAL1 and LMO2, and medulloblastoma rearrangements drive GFI1 and GFI1B. Both break genome sequence, in contrast to the epigenetic route where insulation fails with the sequence intact.
