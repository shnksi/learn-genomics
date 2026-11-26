"""Embed all 82 figures (74 SVGs + 8 scientific hero PNGs) into the 74 learn-genomics chapters.

Idempotent: re-running skips figures already embedded in a chapter.
Verifies 100% coverage (every figure in figures/ is embedded, every chapter has >= 1 figure).
"""
from __future__ import annotations
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
FIG_DIR = ROOT / "figures"

# (chapter_rel_path, target_h2_substring, figure_filename, caption)
PLACEMENTS: list[tuple[str, str, str, str]] = [
    # Part 00 — Orientation
    (
        "part-00-orientation/00-the-whole-story.md",
        "2. Reading it: the central dogma",
        "fig-00-whole-story.svg",
        "End-to-end map of molecular genetics: information flows from DNA storage through regulated transcription and translation into folded proteins, while replication, recombination, and mutation generate the variation acted on by evolution and disease.",
    ),
    (
        "part-00-orientation/01-chemistry-and-cell-primer.md",
        "1. Atoms, bonds, and the only chemistry that matters here",
        "fig-01-chemistry-macromolecules.svg",
        "Bond energy hierarchy (covalent bonds holding polymers together versus individually weak non-covalent interactions that enable reversible folding and recognition) and the four biological macromolecule classes.",
    ),
    (
        "part-00-orientation/01-chemistry-and-cell-primer.md",
        "4. The cell",
        "fig-01d-prokaryote-vs-eukaryote.svg",
        "Side-by-side comparison of prokaryotic and eukaryotic cellular architectures: in prokaryotes, a single circular chromosome sits open in the cytoplasm where transcription and translation happen simultaneously, whereas the eukaryotic nuclear envelope separates transcription and RNA processing inside the nucleus from translation in the cytoplasm.",
    ),
    (
        "part-00-orientation/01-chemistry-and-cell-primer.md",
        "4. The cell",
        "art-01-prokaryotic-cell.png",
        "Cutaway prokaryotic bacterial cell (rod-shaped bacillus) with no nucleus or membrane-bound organelles: deep-teal outer cell wall/capsule with pili and flagellum, amber plasma membrane, a single tangled circular nucleoid chromosome floating freely in the cytoplasm, a small circular plasmid ring (amber), free cytoplasmic ribosomes, and ribosomes actively translating a nascent mRNA strand (coral) directly off the DNA.",
    ),
    (
        "part-00-orientation/01-chemistry-and-cell-primer.md",
        "4. The cell",
        "art-01-eukaryotic-cell.png",
        "Cutaway eukaryotic animal cell showing the central nucleus with chromatin and nucleolus (teal), ribosome-studded rough endoplasmic reticulum and smooth ER tubules (blue), stacked Golgi apparatus with budding vesicles (amber), cristae-filled mitochondria (dark teal), spherical lysosomes (coral), and cytoskeletal filaments.",
    ),
    # Part 01 — Molecular Foundations
    (
        "part-01-molecular-foundations/02-dna-structure.md",
        "2. The polymer: why direction is chemistry, not convention",
        "fig-02-dna-polarity-pairing.svg",
        "Antiparallel DNA polarity (5′→3′ versus 3′→5′) and Watson–Crick base-pair geometry: every purine–pyrimidine pair (A=T with two hydrogen bonds, G≡C with three) spans an identical ~10.8 Å C1′–C1′ width to maintain a uniform helix.",
    ),
    (
        "part-01-molecular-foundations/02-dna-structure.md",
        "5. The grooves, and reading sequence without opening the helix",
        "art-02-dna-helix.png",
        "Three-dimensional B-form DNA double helix illustrating the antiparallel sugar-phosphate backbones (slate and amber ribbons), planar nitrogenous base pairs stacked inside the hydrophobic core, and alternating wide major and narrow minor grooves.",
    ),
    (
        "part-01-molecular-foundations/03-genomes-chromosomes-chromatin.md",
        "1. The packaging problem, quantified",
        "fig-03-chromatin-hierarchy.svg",
        "Compaction of ~2 metres of human nuclear DNA into a ~10 µm nucleus — from naked 2 nm B-DNA and 147 bp nucleosomes to irregular chromatin fibres, cohesin-extruded TAD loops, euchromatin/heterochromatin compartments, and mitotic chromosomes — alongside the compositional breakdown of the human genome.",
    ),
    (
        "part-01-molecular-foundations/04-dna-replication.md",
        "4. The machinery at the fork",
        "fig-04-replication-fork.svg",
        "Asymmetric DNA replication fork: because all DNA polymerases extend strictly 5′→3′, the leading strand is synthesised continuously toward the advancing helicase while the lagging strand is built discontinuously as RNA-primed Okazaki fragments joined by DNA ligase.",
    ),
    (
        "part-01-molecular-foundations/05-transcription.md",
        "2. Template, coding, and the naming disaster",
        "fig-05-transcription-bubble.svg",
        "RNA polymerase transcription bubble showing the relationship between the 5′→3′ coding (non-template) strand, the 3′→5′ template strand, and the nascent 5′→3′ RNA transcript, plus bacterial σ-factor promoters versus eukaryotic Pol II pre-initiation complexes.",
    ),
    (
        "part-01-molecular-foundations/06-rna-processing.md",
        "1. The pipeline",
        "fig-06-rna-processing.svg",
        "Co-transcriptional eukaryotic mRNA maturation (5′ m⁷G cap, intron removal via two transesterifications and a lariat intermediate, and 3′ cleavage/polyadenylation) and how alternative splicing expands one gene into multiple protein isoforms.",
    ),
    (
        "part-01-molecular-foundations/07-genetic-code-and-translation.md",
        "2. Reading frames",
        "fig-07-translation-ribosome.svg",
        "Ribosomal translation elongation across the A, P, and E sites, reading-frame shifts caused by single-base insertions, and wobble base-pairing at the third codon position explaining why the 64-codon genetic code tolerates synonymous third-base changes.",
    ),
    (
        "part-01-molecular-foundations/08-proteins-and-gene-function.md",
        "2. Four levels",
        "art-08-protein-folding.png",
        "Tertiary fold of a globular protein in ribbon representation: α-helices (teal), β-strands assembled into a central sheet (amber), connecting loops (slate), and a bound small-molecule ligand (coral) nestled inside the active-site pocket.",
    ),
    (
        "part-01-molecular-foundations/08-proteins-and-gene-function.md",
        "5. What the surface does",
        "fig-08-protein-levels-and-effects.svg",
        "The four hierarchical levels of protein structure and how mutations map to distinct functional mechanisms: loss of function (haploinsufficiency), dominant negative poisoning of multimers, and gain of function.",
    ),
    # Part 02 — Transmission Genetics
    (
        "part-02-transmission-genetics/09-mitosis-and-meiosis.md",
        "4. Meiosis: replicate once, divide twice",
        "fig-09-mitosis-vs-meiosis.svg",
        "Side-by-side comparison of mitosis (equational division producing two genetically identical 2n daughters) and meiosis (homologue pairing, crossing over, and reductional division in Meiosis I followed by sister-chromatid separation in Meiosis II to yield four distinct 1n gametes).",
    ),
    (
        "part-02-transmission-genetics/10-mendelian-inheritance.md",
        "4. Punnett squares, and why to abandon them immediately",
        "fig-10-mendel-segregation.svg",
        "Mendel's laws derived as factored probabilities: a monohybrid Aa × Aa cross gives 1:2:1 genotypes (3:1 phenotypes), and independent assortment of unlinked loci lets multi-locus crosses multiply directly instead of expanding giant Punnett grids.",
    ),
    (
        "part-02-transmission-genetics/11-beyond-mendel.md",
        "6. Epistasis: pathways generate ratios",
        "fig-11-beyond-mendel.svg",
        "How molecular mechanisms reshape the classic 9:3:3:1 dihybrid ratio: incomplete dominance and codominance at one locus, essential-gene recessive lethality (2:1), and recessive (9:3:4) versus duplicate recessive (9:7) epistasis in two-step biochemical pathways.",
    ),
    (
        "part-02-transmission-genetics/12-probability-and-testing.md",
        "3. Chi-square against a genetic hypothesis",
        "fig-12-chi-square-testing.svg",
        "Chi-square goodness-of-fit distributions for df = 1, 2, and 3 showing the α = 0.05 rejection threshold alongside a worked 3:1 monohybrid test contrasting observed counts against Mendelian expectation.",
    ),
    (
        "part-02-transmission-genetics/13-sex-linkage.md",
        "4. Hemizygosity: what one copy does to Mendel",
        "fig-13-sex-linkage.svg",
        "Reciprocal crosses for an X-linked recessive trait — illustrating why affected fathers transmit the allele to all daughters and no sons (criss-cross inheritance) — together with random X-chromosome inactivation (Lyonisation) in mammalian females.",
    ),
    (
        "part-02-transmission-genetics/14-linkage-and-mapping.md",
        "5. The three-point testcross",
        "fig-14-linkage-mapping.svg",
        "Three-point testcross logic (identifying the middle locus by comparing parental versus rarest double-crossover classes) and Haldane's mapping function showing why observed recombination frequency saturates asymptotically at 50%.",
    ),
    (
        "part-02-transmission-genetics/15-pedigrees.md",
        "2. The five modes and their signatures",
        "fig-15-pedigree-modes.svg",
        "Diagnostic pedigree signatures for the five classical modes of single-gene inheritance: autosomal dominant, autosomal recessive, X-linked recessive, X-linked dominant, and mitochondrial (strictly maternal transmission).",
    ),
    # Part 03 — Genome Instability
    (
        "part-03-genome-instability/16-mutation.md",
        "3. Classification by molecular type: the transition puzzle",
        "fig-16-mutation-types.svg",
        "Transition (purine↔purine, pyrimidine↔pyrimidine) versus transversion substitutions and the six coding-sequence mutation consequences: silent, missense, nonsense, frameshift, splice-site disruption, and repeat expansion.",
    ),
    (
        "part-03-genome-instability/17-dna-repair.md",
        "1. What every pathway exploits",
        "fig-17-dna-repair.svg",
        "Lesion-to-pathway map of cellular DNA repair: direct reversal, base excision repair (BER), nucleotide excision repair (NER), mismatch repair (MMR), and the double-strand break fork between error-prone NHEJ and template-guided HR.",
    ),
    (
        "part-03-genome-instability/18-recombination-mechanisms.md",
        "4. Two endings, and what decides between them",
        "fig-18-homologous-recombination.svg",
        "Double-strand break repair by homologous recombination: 5′→3′ resection, Rad51-mediated strand invasion into the D-loop, and the choice between synthesis-dependent strand annealing (non-crossover) and double Holliday junction resolution (crossover or non-crossover with gene conversion).",
    ),
    (
        "part-03-genome-instability/19-transposable-elements.md",
        "1. Two ways to move",
        "fig-19-transposons.svg",
        "Mechanisms of mobile DNA: Class I copy-and-paste retrotransposons (autonomous LINE-1 and non-autonomous *Alu* elements transposing via an RNA intermediate) versus Class II cut-and-paste DNA transposons.",
    ),
    (
        "part-03-genome-instability/20-chromosome-abnormalities.md",
        "3. Three failure modes, and how to tell them apart",
        "fig-20-chromosome-rearrangements.svg",
        "Meiotic nondisjunction in Meiosis I versus Meiosis II generating trisomic and monosomic gametes, alongside the major structural chromosome rearrangements (deletion, duplication, inversion, and reciprocal translocation).",
    ),
    (
        "part-03-genome-instability/20A-bacterial-and-phage-genetics.md",
        "1. Genetics without sex: the working vocabulary",
        "fig-20a-bacterial-genetics.svg",
        "The three mechanisms of horizontal gene transfer in bacteria: uptake of naked DNA (transformation), unidirectional F/Hfr pilus transfer enabling time-of-entry mapping (conjugation), and bacteriophage-mediated gene transfer (generalised and specialised transduction).",
    ),
    # Part 04 — Gene Regulation
    (
        "part-04-gene-regulation/21-bacterial-regulation.md",
        "4. Catabolite repression, and the AND gate",
        "fig-21-lac-operon.svg",
        "The *lac* operon as a biological AND gate: high transcription requires both lactose present (releasing the LacI repressor from the operator) and glucose absent (raising cAMP so CAP–cAMP activates RNA polymerase recruitment).",
    ),
    (
        "part-04-gene-regulation/22-eukaryotic-transcriptional-regulation.md",
        "3. Enhancers, and the distance paradox",
        "fig-22-eukaryotic-enhancer.svg",
        "Long-range eukaryotic transcriptional activation: distal enhancers bound by cell-type-specific transcription factors loop through 3D space via Mediator to contact the core promoter and RNA Pol II, bounded by CTCF insulators.",
    ),
    (
        "part-04-gene-regulation/23-chromatin-and-epigenetics.md",
        "3. Histone modifications, and the \"code\" that isn't",
        "fig-23-epigenetics-chromatin.svg",
        "Chromatin state transitions driven by writers, erasers, and readers: open, acetylated, unmethylated euchromatin (H3K4me3/H3K27ac) versus compacted, CpG-methylated heterochromatin (H3K9me3/H3K27me3), plus semi-conservative DNMT1 methylation maintenance.",
    ),
    (
        "part-04-gene-regulation/24-rna-based-regulation.md",
        "2. miRNA biogenesis",
        "fig-24-rna-regulation.svg",
        "Post-transcriptional silencing by small RNAs: nuclear Drosha cleavage and cytoplasmic Dicer processing load a guide strand into Argonaute/RISC, where partial 3′-UTR seed matching triggers repression and decay (miRNA) while near-perfect pairing induces direct Ago2 cleavage (siRNA).",
    ),
    (
        "part-04-gene-regulation/25-networks-and-development.md",
        "2. Motifs are circuits, and you already know most of them",
        "fig-25-network-motifs.svg",
        "Core regulatory circuit motifs — negative autoregulation (speed and noise damping), toggle switch (bistable cell-fate memory), coherent feed-forward loop (persistence filter), and morphogen gradients reading concentration thresholds into sharp spatial boundaries.",
    ),
    (
        "part-04-gene-regulation/25A-developmental-genetics.md",
        "3. Hox genes as a genetic phenomenon",
        "art-25a-embryo-patterning.png",
        "Vertebrate embryo body plan illustrating segmented somites along the dorsal axis, pharyngeal arches, emerging limb buds, and nested anterior–posterior expression domains (green → teal → blue → amber → rose) reflecting spatial collinearity of *Hox* genes.",
    ),
    (
        "part-04-gene-regulation/25A-developmental-genetics.md",
        "4. Epistasis: ordering a pathway with a double mutant",
        "fig-25a-developmental-genetics.svg",
        "The *Drosophila* anterior–posterior segmentation hierarchy (maternal morphogens → gap → pair-rule → segment-polarity → *Hox* selectors) and epistasis logic for ordering two genes in a developmental signalling pathway.",
    ),
    # Part 05 — Population Genetics
    (
        "part-05-population-genetics/26-hardy-weinberg.md",
        "2. Deriving it",
        "fig-26-hardy-weinberg.svg",
        "Hardy–Weinberg genotype frequencies (*p*², 2*pq*, *q*²) as a function of allele frequency *p*: heterozygosity peaks at 0.5 when *p* = 0.5, while for rare recessive alleles (*q* = 0.01) carriers outnumber affected homozygotes by roughly 200 to 1.",
    ),
    (
        "part-05-population-genetics/27-the-four-forces.md",
        "4. Drift: a variance process, not a force",
        "fig-27-four-forces-drift.svg",
        "Simulated Wright–Fisher genetic drift trajectories in a small (*N* = 25) versus large (*N* = 500) population, paired with the effective-selection boundary |*N*<sub>e</sub>*s*| deciding whether selection or drift dominates allele fate.",
    ),
    (
        "part-05-population-genetics/28-structure-and-inbreeding.md",
        "6. The Wahlund effect",
        "fig-28-structure-inbreeding.svg",
        "How identity by descent (*F*) shifts heterozygotes into homozygotes without changing allele frequencies, and how pooling two differentiated subpopulations produces an excess of homozygotes (the Wahlund effect) measured by *F*<sub>ST</sub>.",
    ),
    (
        "part-05-population-genetics/29-linkage-disequilibrium.md",
        "6. How LD decays",
        "fig-29-ld-decay.svg",
        "Exponential decay of linkage disequilibrium (*r*²) with recombination distance and generations, showing why African populations have shorter LD blocks than bottlenecked out-of-Africa populations and how recombination hotspots carve genomes into haplotype blocks.",
    ),
    # Part 06 — Quantitative Genetics
    (
        "part-06-quantitative-genetics/30-quantitative-traits.md",
        "1. The dispute that Fisher settled",
        "fig-30-quantitative-traits.svg",
        "Fisher's synthesis: adding independent Mendelian loci rapidly converts discrete genotypes into a bell-shaped continuous phenotype distribution, whose variance decomposes into additive (*V*<sub>A</sub>), dominance (*V*<sub>D</sub>), interaction (*V*<sub>I</sub>), and environmental (*V*<sub>E</sub>) components.",
    ),
    (
        "part-06-quantitative-genetics/31-heritability-and-selection.md",
        "6. The breeder's equation",
        "fig-31-heritability-selection.svg",
        "Narrow-sense heritability *h*² visualised both as the midparent–offspring regression slope and in the breeder's equation (*R* = *h*²*S*), predicting evolutionary response to truncation selection.",
    ),
    (
        "part-06-quantitative-genetics/32-mapping-quantitative-traits.md",
        "4. Interval mapping: put the QTL between the markers",
        "fig-32-qtl-mapping.svg",
        "Quantitative trait locus (QTL) interval mapping LOD profile across a chromosome with a permutation-derived genome-wide threshold, plus the contrast between wide F₂ linkage intervals and fine GWAS LD resolution.",
    ),
    # Part 07 — Molecular Evolution
    (
        "part-07-molecular-evolution/33-neutral-theory-and-selection-tests.md",
        "6. d<sub>N</sub>/d<sub>S</sub>: comparing a gene against its own control",
        "fig-33-neutral-theory.svg",
        "Neutral theory's rate cancellation (*k* = *μ*), Jukes–Cantor multiple-hit saturation correcting observed divergence, and the *d*<sub>N</sub>/*d*<sub>S</sub> (*ω*) scale separating purifying selection, neutrality, and positive selection.",
    ),
    (
        "part-07-molecular-evolution/34-phylogenetics.md",
        "2. Homology: the ortholog/paralog trap",
        "fig-34-phylogenetics.svg",
        "Rooted phylogenetic tree anatomy (taxa, internal nodes, clades, and outgroup) paired with a gene tree showing how speciation creates orthologs while gene duplication creates paralogs.",
    ),
    (
        "part-07-molecular-evolution/35-genome-evolution.md",
        "2. The fates of a duplicate pair",
        "fig-35-genome-evolution.svg",
        "Evolutionary fates following gene duplication — pseudogenisation (nonfunctionalisation), subfunctionalisation (partitioning ancestral enhancers/functions), neofunctionalisation (new function), and dosage conservation.",
    ),
    (
        "part-07-molecular-evolution/35A-speciation-and-ecological-genetics.md",
        "3. Dobzhansky–Muller incompatibilities, derived",
        "fig-35a-speciation-cline.svg",
        "How two-locus Dobzhansky–Muller incompatibilities evolve intrinsic hybrid sterility without either lineage crossing a fitness valley, paired with a tension-zone allele-frequency cline balancing dispersal against selection.",
    ),
    # Part 08 — Methods
    (
        "part-08-methods/36-core-molecular-methods.md",
        "3. PCR: exponential amplification of an addressed region",
        "fig-36-pcr-and-gel.svg",
        "The three-step PCR thermal cycle (denaturation, primer annealing, Taq extension) driving 2<sup>*n*</sup> exponential amplification, coupled with agarose gel electrophoresis separating DNA fragments logarithmically by length.",
    ),
    (
        "part-08-methods/37-model-organisms-and-screens.md",
        "3. Forward screens I: mutagenesis",
        "fig-37-screens-epistasis.svg",
        "Forward genetics (phenotype → mutant → causal gene) versus reverse genetics (gene → targeted edit → phenotype), and how suppressor versus enhancer modifier screens map interacting genes around a focal mutation.",
    ),
    (
        "part-08-methods/38-genome-editing.md",
        "3. Cas9 mechanism",
        "fig-38-crispr-editing.svg",
        "CRISPR-Cas9 programmable DNA cleavage (sgRNA spacer + NGG PAM → DSB repaired by NHEJ indels or HDR templating) alongside nickase-based base editing and prime editing that install precise edits without double-strand breaks.",
    ),
    # Part 09 — Genomics
    (
        "part-09-genomics/39-genome-landscapes.md",
        "1. Six orders of magnitude, and no signal",
        "fig-39-genome-landscapes.svg",
        "The C-value paradox across six orders of magnitude of genome size — showing that protein-coding gene count plateaus around ~20,000 in animals while transposable-element expansion drives dramatic genome-size variation.",
    ),
    (
        "part-09-genomics/40-sequencing-technologies.md",
        "5. The comparison",
        "fig-40-sequencing-platforms.svg",
        "Read-length versus per-read accuracy landscape across Sanger, Illumina short-read, PacBio HiFi, and Oxford Nanopore platforms, together with the Lander–Waterman Poisson curve (*P*(0) = *e*<sup>−*C*</sup>) linking depth to unsequenced fraction.",
    ),
    (
        "part-09-genomics/41-data-formats.md",
        "6. Coordinates — the section that matters most",
        "fig-41-data-formats-coords.svg",
        "Genomics file pipeline (FASTQ → BAM/CRAM → VCF + BED/GTF) and the critical off-by-one coordinate rule: BED uses 0-based half-open intervals `[start, end)` whereas VCF, SAM, and GFF/GTF use 1-based closed coordinates `[start, end]`.",
    ),
    (
        "part-09-genomics/42-read-alignment.md",
        "3. The Burrows–Wheeler transform and the FM-index",
        "fig-42-bwt-fm-index.svg",
        "Burrows–Wheeler Transform (BWT) and LF-mapping enabling *O*(*m*) exact seed lookup in the FM-index, followed by seed-and-extend dynamic programming to tolerate SNPs and indels.",
    ),
    (
        "part-09-genomics/43-genome-assembly.md",
        "3. De Bruijn graphs, and the Eulerian framing",
        "fig-43-de-bruijn-assembly.svg",
        "De Bruijn graph genome assembly (*k*-mers as edges between (*k*−1)-mer nodes) and the three canonical graph artefacts: dead-end tips from sequencing errors, bubbles from heterozygous SNPs, and collapsed loops from repeats longer than *k*.",
    ),
    (
        "part-09-genomics/44-annotation.md",
        "2. Ab initio gene finding as HMM decoding",
        "fig-44-gene-finding-hmm.svg",
        "Eukaryotic gene-finding Hidden Markov Model traversing intergenic, start, exon, splice-site, intron, and stop states, integrated with empirical RNA-seq splice junctions and protein homology evidence.",
    ),
    (
        "part-09-genomics/45-reference-genomes-and-pangenomes.md",
        "4. Pangenomes: from one string to a graph",
        "fig-45-pangenome-graph.svg",
        "From a single linear reference (causing reference-allele mapping bias and missing population insertions) to a pangenome variation graph encoding SNPs, structural insertions, and multi-haplotype paths across diverse ancestries.",
    ),
    # Part 10 — Functional Genomics
    (
        "part-10-functional-genomics/46-variant-calling.md",
        "2. The genotype likelihood",
        "fig-46-variant-calling.svg",
        "Variant calling from an aligned read pileup: integrating base qualities and read alleles into genotype likelihoods *P*(*D* | *G*) for 0/0, 0/1, and 1/1, and why local haplotype reassembly outperforms column-by-column calling near indels.",
    ),
    (
        "part-10-functional-genomics/47-rna-seq.md",
        "4. Normalisation: the conceptual heart",
        "fig-47-rnaseq-pipeline.svg",
        "Bulk RNA-seq workflow from reads to a count matrix, illustrating why library-size and composition-aware normalisation (DESeq2 median-of-ratios) prevents highly expressed genes from distorting differential-expression volcano plots.",
    ),
    (
        "part-10-functional-genomics/48-single-cell-and-spatial.md",
        "1. The confound, with numbers",
        "fig-48-single-cell-confound.svg",
        "Why bulk RNA-seq confounds cell-type composition with cell-intrinsic expression changes — and how single-cell transcriptomics resolves distinct cell states in UMAP space while exposing sparse UMI counts and dropout.",
    ),
    (
        "part-10-functional-genomics/48-single-cell-and-spatial.md",
        "2. Measuring one cell at a time",
        "art-48-single-cell-droplets.png",
        "Microfluidic droplet encapsulation for single-cell RNA-seq: individual cells (teal, blue, rose) and barcoded hydrogel beads coated with capture oligos (amber) meet flanking oil streams to pinch off nanolitre water-in-oil droplets — yielding mostly empty droplets, single-cell/single-bead captures, and occasional doublets governed by Poisson loading.",
    ),
    (
        "part-10-functional-genomics/49-epigenome-profiling.md",
        "4. Accessibility",
        "fig-49-epigenome-tracks.svg",
        "Aligned multi-omic epigenome browser tracks across an active gene: ATAC-seq open chromatin peaks, sharp promoter H3K4me3, distal enhancer H3K27ac, CTCF boundary ChIP/CUT&Tag signal, and hypomethylated CpG islands.",
    ),
    (
        "part-10-functional-genomics/50-3d-genome.md",
        "4. Four levels, largest to smallest",
        "art-50-3d-nucleus.png",
        "Cutaway eukaryotic nucleus showing the nuclear envelope pierced by nuclear pores, the fibrous nuclear lamina mesh at the periphery, distinct non-overlapping chromosome territories (coloured chromatin fibres), and an extruded chromatin loop held at its base by a cohesin ring.",
    ),
    (
        "part-10-functional-genomics/50-3d-genome.md",
        "5. Loop extrusion",
        "fig-50-hic-tad-loops.svg",
        "Reading a Hi-C contact heatmap (triangular TAD squares and corner loop dots) directly from the loop-extrusion mechanism: cohesin reels chromatin through its ring until stalled by convergently oriented CTCF motifs.",
    ),
    # Part 11 — Human & Statistical Genomics
    (
        "part-11-human-and-statistical-genomics/51-gwas.md",
        "5. Multiple testing: where 5 × 10⁻⁸ comes from",
        "fig-51-gwas-manhattan-qq.svg",
        "Reading GWAS diagnostics: a Manhattan plot marking the genome-wide significance threshold (*p* = 5 × 10⁻⁸) paired with QQ plots distinguishing true polygenic signal from uncalibrated population stratification.",
    ),
    (
        "part-11-human-and-statistical-genomics/52-association-to-mechanism.md",
        "2. Fine-mapping is variable selection under near-perfect collinearity",
        "fig-52-finemapping-coloc.svg",
        "From GWAS hit to causal mechanism: LD turns one causal SNP into a wide peak of correlated variants, statistical fine-mapping assigns posterior inclusion probabilities (PIPs) into a 95% credible set, and colocalisation plus chromatin looping link the variant to its target gene.",
    ),
    (
        "part-11-human-and-statistical-genomics/53-polygenic-scores.md",
        "5. Discrimination, calibration, and the ceiling",
        "fig-53-polygenic-scores.svg",
        "Polygenic risk score (PRS) distributions showing why case and control bell curves substantially overlap despite strong odds ratios in the tails, alongside the steep drop in transferability across non-training genetic ancestries.",
    ),
    (
        "part-11-human-and-statistical-genomics/54-rare-variants-and-mendelian-disease.md",
        "1. The allelic architecture spectrum, and the empty corner",
        "fig-54-allelic-architecture.svg",
        "The allele-frequency versus effect-size spectrum (from ultra-rare high-penetrance Mendelian variants to common small-effect GWAS alleles) paired with the clinical trio-exome filtering funnel from ~50,000 raw variants to a single causal candidate.",
    ),
    (
        "part-11-human-and-statistical-genomics/55-clinical-variant-interpretation.md",
        "3. The Bayesian reformulation",
        "fig-55-acmg-bayesian.svg",
        "The ACMG/AMP five-tier clinical classification scale reformulated as Bayesian posterior probability of pathogenicity, showing how supporting, moderate, strong, and very-strong evidence tiers shift prior odds into Pathogenic or Benign bands.",
    ),
    (
        "part-11-human-and-statistical-genomics/56-cancer-genomics.md",
        "2. The tissue as a population",
        "fig-56-cancer-evolution.svg",
        "Somatic Darwinian evolution in cancer: a clonal fishplot tracing truncal driver acquisition, branching subclones, and therapy-selected resistant relapse, contrasted with Knudson's two-hit tumour-suppressor versus single-hit oncogene logic.",
    ),
    # Part 12 — Applications & Ethics
    (
        "part-12-applications-and-ethics/57-genomics-in-practice.md",
        "3. Screening is not diagnosis: NIPT and the arithmetic",
        "fig-57-clinical-screening-ppv.svg",
        "Why positive predictive value (PPV) depends critically on prior prevalence even for a 99.5% specific screening test like NIPT, paired with pharmacogenomic metaboliser phenotypes translating genotype into clinical dosing.",
    ),
    (
        "part-12-applications-and-ethics/58-ethics-and-society.md",
        "6. Equity: the ancestry bias and its concrete cost",
        "fig-58-genomic-privacy.svg",
        "Two structural challenges in genomic medicine: familial re-identification through shared DNA segments (rendering genomes inherently non-anonymisable) and the stark Eurocentric GWAS representation gap that degrades clinical equity.",
    ),
    # Part D — SCA12 Deep Dive
    (
        "part-D-sca12/D1-neurons-and-the-cerebellum.md",
        "3. The cerebellum",
        "art-D1-cerebellum-purkinje.png",
        "Anatomy of the human cerebellum and its cortex. Left: sagittal section through the cerebellar folia and branching white-matter arbor vitae attached to the brainstem. Right: the three cortical layers — densely packed granule cells (amber) below, a single-cell layer of Purkinje somas (teal) in the middle, and each Purkinje neuron's vast planar dendritic arbor receiving parallel and climbing-fibre inputs in the molecular layer above.",
    ),
    (
        "part-D-sca12/D1-neurons-and-the-cerebellum.md",
        "4. Selective vulnerability: the central puzzle of neurogenetics",
        "fig-D1-cerebellar-circuit.svg",
        "Signal flow through the cerebellar microcircuit — parallel-fibre and climbing-fibre excitation converging onto the sole cortical output neuron, the GABAergic Purkinje cell — and why extreme metabolic, Ca²⁺, and dendritic demands make Purkinje neurons selectively vulnerable.",
    ),
    (
        "part-D-sca12/D2-kinases-phosphatases-and-pp2a.md",
        "3. PP2A: one name, sixty to a hundred possible holoenzymes",
        "art-D2-pp2a-holoenzyme.png",
        "Structure of the heterotrimeric PP2A holoenzyme: the horseshoe-shaped HEAT-repeat scaffold subunit A (slate blue), the globular catalytic subunit C (amber) housing two active-site metal ions, and the seven-bladed β-propeller regulatory subunit B55β encoded by *PPP2R2B* (teal), which governs substrate specificity and subcellular targeting.",
    ),
    (
        "part-D-sca12/D2-kinases-phosphatases-and-pp2a.md",
        "4. *PPP2R2B* and its two isoforms",
        "fig-D2-pp2a-switch.svg",
        "Combinatorial specificity of the PP2A heterotrimer (A + C + swappable B regulatory subunits) and the two alternative N-terminal isoforms encoded by *PPP2R2B*: cytoplasmic Bβ1 versus mitochondrially targeted Bβ2 regulating Drp1-mediated fission.",
    ),
    (
        "part-D-sca12/D3-repeat-expansion-disorders.md",
        "1. The taxonomy: organising the zoo by mechanism",
        "fig-D3-repeat-expansions.svg",
        "Mechanistic taxonomy of repeat-expansion disorders by gene location (5′-UTR, coding polyQ, intron, 3′-UTR) and the somatic instability loop driven by DNA slip-outs processed by mismatch-repair complexes (MSH2/MSH3).",
    ),
    (
        "part-D-sca12/D4-sca12-from-repeat-to-phenotype.md",
        "3. Why SCA12 breaks the taxonomy",
        "fig-D4-sca12-locus-hypotheses.svg",
        "Architecture of the *PPP2R2B* 5′ CAG repeat locus (normal 7–31 vs pathogenic ~43–78+ repeats) and five candidate mechanisms actively tested in SCA12: promoter dosage dysregulation, Bβ1/Bβ2 isoform shift, RNA foci toxicity, antisense/RAN translation, and somatic repeat expansion.",
    ),
    (
        "part-D-sca12/D5-sca12-population-clinic-therapy.md",
        "4. Therapy: you cannot design the drug until you know the arrow",
        "fig-D5-sca12-clinic-therapy.svg",
        "Diagnostic blind spot of standard short-read WGS at expanded *PPP2R2B* repeats (requiring repeat-primed PCR or long reads) and the therapeutic decision tree showing why knocking down versus preserving *PPP2R2B* depends on resolving the causal arrow.",
    ),
    # Part S — Statistics Companion
    (
        "part-S-statistics/S1-probability.md",
        "5. Bayes' theorem, and the table every genetic counsellor uses",
        "fig-S1-probability-bayes.svg",
        "Probability tree and Bayesian update table for genetic counselling: starting from a 1/2 prior carrier risk, observing three unaffected sons updates the posterior probability of being a carrier via the likelihood ratio.",
    ),
    (
        "part-S-statistics/S2-distributions.md",
        "5. Negative binomial: when the rate itself varies",
        "fig-S2-distributions.svg",
        "The four core probability distributions of genetics and genomics — Binomial (inheritance counts), Poisson (mean = variance baseline for sequencing depth), Normal (polygenic sums), and Negative Binomial (overdispersed RNA-seq counts).",
    ),
    (
        "part-S-statistics/S3-sampling-and-estimation.md",
        "5. Confidence intervals are a property of the procedure",
        "fig-S3-sampling-ci.svg",
        "Frequentist 95% confidence intervals across 20 repeated samples (most bracketing the true parameter *θ*, occasional misses) alongside the 1/√*n* narrowing of the standard error of the mean.",
    ),
    (
        "part-S-statistics/S4-hypothesis-testing.md",
        "1. The four moving parts",
        "fig-S4-hypothesis-errors.svg",
        "Null (*H*₀) and alternative (*H*₁) sampling distributions displaying Type I error (*α*), Type II error (*β*), and statistical power (1 − *β*) as complementary areas divided by the critical threshold.",
    ),
    (
        "part-S-statistics/S5-variance-and-regression.md",
        "4. Least squares: fitting, and reading, a line",
        "fig-S5-variance-regression.svg",
        "Ordinary least squares regression minimising squared vertical residuals (top-left) contrasted with correlation *r* = 0 nonlinear structure and Simpson's paradox demonstrating why controlling for confounders reverses naive slopes.",
    ),
    (
        "part-S-statistics/S6-likelihood-and-bayes.md",
        "5. Bayes for parameters: prior, likelihood, posterior",
        "fig-S6-likelihood-bayes.svg",
        "Log-likelihood curve with maximum-likelihood estimate (MLE) and likelihood-ratio drop, paired with Bayesian updating where multiplying a Beta prior by binomial data produces a sharper posterior distribution.",
    ),
    (
        "part-S-statistics/S7-high-dimensional-data.md",
        "3. False discovery rate and Benjamini–Hochberg",
        "fig-S7-multiple-testing-pca.svg",
        "Benjamini–Hochberg step-up FDR control compared against strict Bonferroni correction on ordered *p*-values, paired with a geometric view of PCA rotating correlated high-dimensional axes onto orthogonal principal components.",
    ),
    # === WAVE 2 — 34 High-Impact Visual Section Figures (28 SVGs + 6 3D Hero PNGs) ===
    (
        "part-00-orientation/01-chemistry-and-cell-primer.md",
        "2. Water is not the background",
        "fig-01b-water-bilayer-folding.svg",
        "The hydrophobic effect in aqueous cells: water maximises its own hydrogen-bond network by pushing nonpolar chains together — driving both phospholipid bilayer self-assembly and the hydrophobic collapse that folds proteins.",
    ),
    (
        "part-00-orientation/01-chemistry-and-cell-primer.md",
        "### Proteins",
        "art-01-alpha-beta-groove.png",
        "Protein secondary structure and DNA recognition. Left: right-handed α-helix (~12 Å diameter) stabilised by vertical backbone hydrogen bonds. Centre: three-strand antiparallel β-sheet linked by inter-strand hydrogen bonds. Right: an α-helix nestled snugly inside the wide major groove of a DNA double helix.",
    ),
    (
        "part-00-orientation/01-chemistry-and-cell-primer.md",
        "### Proteins",
        "fig-01c-secondary-structure.svg",
        "Geometric dimensions of α-helices (~12 Å, *i* → *i*+4 backbone H-bonds, 3.6 residues per turn) and pleated β-sheets, illustrating why a 12 Å recognition α-helix fits cleanly into DNA's ~22 Å major groove but cannot fit into the ~12 Å minor groove.",
    ),
    (
        "part-01-molecular-foundations/02-dna-structure.md",
        "1. The monomer",
        "fig-02b-nucleotide-monomer.svg",
        "Numbered deoxyribonucleotide monomer (1′–5′ ring carbons, 5′-phosphate, reactive 3′-OH nucleophile, and the 2′-H versus 2′-OH difference separating stable DNA from reactive RNA) alongside two-ring purines (A, G) and single-ring pyrimidines (C, T, U).",
    ),
    (
        "part-01-molecular-foundations/02-dna-structure.md",
        "6. B, A and Z",
        "fig-02c-dna-forms-grooves.svg",
        "Helical conformations of B-DNA, A-DNA (and dsRNA), and left-handed Z-DNA, paired with the four-character major-groove hydrogen-bond code (donor/acceptor/methyl pattern) that distinguishes every base pair without opening the duplex.",
    ),
    (
        "part-01-molecular-foundations/02-dna-structure.md",
        "8. Topology: DNA is a closed object",
        "fig-02d-dna-topology-nonb.svg",
        "DNA supercoiling topology (*Lk* = *Tw* + *Wr*) regulated by topoisomerases I and II, plus four biologically critical non-B DNA structures formed at repeats: hairpins/cruciforms, G-quadruplexes, slipped CAG hairpins, and R-loops.",
    ),
    (
        "part-01-molecular-foundations/03-genomes-chromosomes-chromatin.md",
        "2. The nucleosome",
        "art-03-nucleosome-octamer.png",
        "Three-dimensional structure of the eukaryotic nucleosome core particle: ~147 bp of double-stranded DNA wrapped 1.65 left-handed turns around the eight-subunit histone octamer (pairs of H2A, H2B, H3, and H4) with flexible N-terminal histone tails protruding outward carrying epigenetic modifications.",
    ),
    (
        "part-01-molecular-foundations/03-genomes-chromosomes-chromatin.md",
        "4. Chromosome anatomy and the karyotype",
        "fig-03b-chromosome-anatomy.svg",
        "Replicated metaphase chromosome anatomy (sister chromatids, p and q arms, centromere, telomeres, and G-bands), centromere classifications, and decoding cytogenetic coordinates such as 5q32 (the *PPP2R2B* locus).",
    ),
    (
        "part-01-molecular-foundations/04-dna-replication.md",
        "1. Semiconservative replication",
        "fig-04b-meselson-stahl-fidelity.svg",
        "Meselson–Stahl ¹⁵N/¹⁴N density-gradient bands across two generations proving semiconservative replication, alongside the three multiplicative fidelity filters (base selection × 3′→5′ proofreading × MMR) achieving ~10⁻¹⁰ errors per base.",
    ),
    (
        "part-01-molecular-foundations/05-transcription.md",
        "4. Bacterial termination",
        "fig-05b-termination-and-pic.svg",
        "Bacterial Rho-independent termination (a nascent GC-rich RNA hairpin stalling RNA polymerase over a weak rU:dA hybrid) contrasted with eukaryotic Pol II pre-initiation complex assembly (TFIID/TBP, TFIIB, TFIIH helicase, and CTD phosphorylation).",
    ),
    (
        "part-01-molecular-foundations/06-rna-processing.md",
        "6. The chemistry: two transesterifications",
        "fig-06b-splicing-chemistry.svg",
        "Two-step transesterification chemistry of pre-mRNA splicing: the branch-point adenine's 2′-OH attacks the 5′ GU splice site to form a 2′–5′ lariat intermediate, freeing Exon 1's 3′-OH to attack the 3′ AG junction and ligate the exons at zero net chemical ATP cost.",
    ),
    (
        "part-01-molecular-foundations/07-genetic-code-and-translation.md",
        "3. Wobble: why the third base is cheap",
        "fig-07b-trna-wobble.svg",
        "Transfer RNA cloverleaf architecture (separating the 3′-CCA amino-acid acceptor stem from the anticodon loop), third-position wobble pairing rules (including three-way inosine recognition), and aminoacyl-tRNA synthetase fidelity.",
    ),
    (
        "part-01-molecular-foundations/08-proteins-and-gene-function.md",
        "1. Twenty side chains",
        "fig-08b-amino-acid-classes.svg",
        "The 20 genetically encoded amino acids organised by side-chain chemistry (nonpolar aliphatic, aromatic, polar uncharged, positively charged basic, negatively charged acidic, and structural specialists Gly, Pro, and Cys).",
    ),
    (
        "part-01-molecular-foundations/08-proteins-and-gene-function.md",
        "3. Anfinsen, Levinthal, chaperones",
        "art-08-folding-funnel.png",
        "Three-dimensional protein-folding energy funnel: diverse unfolded polypeptide chains at the wide high-entropy rim descend a rugged free-energy landscape — occasionally pausing in local kinetic traps rescued by chaperones — to settle into the single compact native fold at the deep narrow minimum.",
    ),
    (
        "part-02-transmission-genetics/09-mitosis-and-meiosis.md",
        "5. Prophase I: where the exchange happens",
        "fig-09b-prophase1-crossover.svg",
        "Prophase I crossing over across a four-chromatid bivalent: physical chiasma formation between two non-sister chromatids tethers homologous chromosomes for faithful Meiosis I segregation while producing two parental and two recombinant gametes.",
    ),
    (
        "part-02-transmission-genetics/11-beyond-mendel.md",
        "3. Multiple alleles: ABO worked properly",
        "fig-11b-abo-molecular.svg",
        "Molecular basis of ABO blood types: *I*<sup>A</sup> and *I*<sup>B</sup> encode active glycosyltransferases adding distinct sugars to the H-antigen (codominant), whereas *i* is a 1-bp frameshift null leaving bare H-antigen (recessive).",
    ),
    (
        "part-02-transmission-genetics/13-sex-linkage.md",
        "6. Dosage compensation",
        "fig-13b-x-inactivation-par.svg",
        "Human X versus Y chromosome architecture (pseudoautosomal pairing regions PAR1/PAR2 and *SRY*) paired with random embryonic X-inactivation via *XIST* lncRNA producing clonal Barr-body mosaicism.",
    ),
    (
        "part-02-transmission-genetics/14-linkage-and-mapping.md",
        "6. Tetrad analysis",
        "fig-14b-tetrad-analysis.svg",
        "Fungal tetrad analysis distinguishing Parental Ditype (PD), Tetratype (T, single crossover), and Non-Parental Ditype (NPD, four-strand double crossover) asci directly within a single meiosis.",
    ),
    (
        "part-03-genome-instability/16-mutation.md",
        "5. Where spontaneous mutations come from",
        "fig-16b-spontaneous-lesions.svg",
        "Four primary endogenous mutation mechanisms: cytosine deamination (C→U, recognised as foreign), 5-methylcytosine deamination (5mC→T, creating CpG mutation hotspots), spontaneous depurination, and polymerase slippage on tandem repeats.",
    ),
    (
        "part-03-genome-instability/17-dna-repair.md",
        "5. Mismatch repair",
        "fig-17b-mmr-dsb-fork.svg",
        "Strand discrimination in mismatch repair (MutSα/MutLα scanning to a nascent-strand nick or unmethylated GATC) and the double-strand break commitment fork separating 53BP1/Ku-protected NHEJ from MRN/CtIP-resected homologous recombination.",
    ),
    (
        "part-04-gene-regulation/21-bacterial-regulation.md",
        "6. The *trp* operon",
        "fig-21b-trp-attenuation.svg",
        "Transcriptional attenuation in the bacterial *trp* leader: low tryptophan stalls the ribosome on tandem UGG codons so mRNA regions 2–3 form an antiterminator loop; high tryptophan lets the ribosome mask region 2 so regions 3–4 snap into a Rho-independent terminator.",
    ),
    (
        "part-04-gene-regulation/22-eukaryotic-transcriptional-regulation.md",
        "5. Transcription factors are two separable modules",
        "fig-22b-tf-domains-pioneer.svg",
        "Modular transcription-factor design (separable DNA-binding and transactivation domains) alongside pioneer transcription factors binding closed nucleosomal DNA to recruit chromatin remodellers and open enhancers for settler TFs.",
    ),
    (
        "part-04-gene-regulation/23-chromatin-and-epigenetics.md",
        "6. Genomic imprinting",
        "fig-23b-imprinting-igf2-h19.svg",
        "Parent-of-origin imprinting at the *IGF2*/*H19* locus: an unmethylated maternal ICR binds CTCF to insulate *IGF2* from the shared enhancer, whereas paternal ICR methylation blocks CTCF so the enhancer loops to activate *IGF2*.",
    ),
    (
        "part-04-gene-regulation/25-networks-and-development.md",
        "3. Waddington's landscape",
        "art-25-waddington-landscape.png",
        "Three-dimensional Waddington epigenetic landscape: a pluripotent stem cell at the summit rolls down bifurcating valleys carved by gene-regulatory network attractors into stable, terminally differentiated cell-fate basins.",
    ),
    (
        "part-04-gene-regulation/25-networks-and-development.md",
        "7. Signalling pathways: the intercellular layer",
        "fig-25b-morphogen-signaling.svg",
        "French-flag threshold decoding converting a continuous morphogen gradient into sharp gene-expression domains, paired with the four-step intercellular signalling architecture shared across Wnt, Hedgehog, Notch, BMP, and RTK/MAPK pathways.",
    ),
    (
        "part-08-methods/36-core-molecular-methods.md",
        "5. Cloning: cut, join, propagate",
        "fig-36b-cloning-qpcr.svg",
        "Restriction-enzyme sticky-end cloning into a selectable plasmid vector (origin of replication + antibiotic resistance gene) paired with real-time qPCR amplification curves showing how each 2-fold dilution shifts the threshold cycle *C*<sub>t</sub> by 1 cycle.",
    ),
    (
        "part-08-methods/38-genome-editing.md",
        "6. dCas9: targeting as an API",
        "fig-38b-dcas9-api.svg",
        "Catalytically inactive dCas9 (D10A + H840A) repurposed as a programmable genomic address bus recruiting KRAB (CRISPRi), VP64/p300 (CRISPRa), DNMT3A/TET1 (epigenome editing), or GFP/APEX2 (live imaging and locus proteomics).",
    ),
    (
        "part-09-genomics/40-sequencing-technologies.md",
        "2. Second generation: parallelism as the whole idea",
        "fig-40b-sequencing-chemistries.svg",
        "Molecular reading mechanisms of the four major sequencing platforms: Sanger ddNTP termination, Illumina bridge-amplified reversible-terminator SBS, PacBio SMRT ZMW circular consensus, and Oxford Nanopore ionic-current squiggle decoding.",
    ),
    (
        "part-09-genomics/40-sequencing-technologies.md",
        "3. Third generation: read one molecule, in real time",
        "art-40-nanopore-sequencing.png",
        "Cutaway illustration of nanopore single-molecule sequencing: a transmembrane protein nanopore (slate blue) spans a synthetic lipid bilayer while a motor helicase (teal) ratchets DNA through the narrow central constriction, modulating the ionic current (glowing cyan ions) in real time.",
    ),
    (
        "part-10-functional-genomics/46-variant-calling.md",
        "4. Haplotype-based calling and local reassembly",
        "fig-46b-local-reassembly.svg",
        "Why naive column-by-column pileups emit false SNPs near indels (soft-clipped or misaligned read ends), and how GATK HaplotypeCaller resolves the true indel cleanly by assembling a local De Bruijn graph and scoring reads with a Pair-HMM.",
    ),
    (
        "part-10-functional-genomics/50-3d-genome.md",
        "1. The ligation trick, and the assay family",
        "fig-50b-hic-assay.svg",
        "Five-step Hi-C proximity ligation workflow — formaldehyde crosslinking, restriction digestion, biotin end-fill, proximity blunt ligation, and streptavidin pulldown — turning 3D nuclear contacts into chimeric paired-end sequencing reads.",
    ),
    (
        "part-D-sca12/D1-neurons-and-the-cerebellum.md",
        "1. The neuron: a cell type pushed to extremes",
        "art-D1-neuron-synapse.png",
        "Cellular anatomy of neural signalling. Left: a multipolar neuron with its branching dendritic tree, soma and nucleus, myelinated axon segments separated by nodes of Ranvier, and axon terminals. Right: cutaway chemical synapse showing neurotransmitter vesicles fusing at the presynaptic active zone and activating postsynaptic ion-channel receptors.",
    ),
    (
        "part-D-sca12/D1-neurons-and-the-cerebellum.md",
        "2. Signalling, in one section",
        "fig-D1b-action-potential-synapse.svg",
        "Action potential waveform (voltage-gated Na⁺ influx, K⁺ efflux, and refractory undershoot) linked to presynaptic Ca²⁺-triggered vesicle release and the extraordinary metabolic and Ca²⁺-buffering demands placed on cerebellar Purkinje neurons.",
    ),
    (
        "part-D-sca12/D3-repeat-expansion-disorders.md",
        "2. Instability mechanics: beyond slippage",
        "fig-D3b-cag-hairpin-mmr.svg",
        "Molecular engine of somatic CAG repeat expansion: slipped-out CAG·CAG hairpins are bound and stabilised by MutSβ (MSH2–MSH3), causing MutLγ (MLH1–MLH3) to nick the opposite strand so gap-filling locks in net repeat lengthening in post-mitotic neurons.",
    ),
    # === WAVE 3 — 24 Deep Visual-Gap Figures (20 SVGs + 4 3D Hero PNGs) ===
    (
        "part-01-molecular-foundations/04-dna-replication.md",
        "7. The ends of linear chromosomes",
        "fig-04c-telomere-end-replication.svg",
        "The end-replication problem and telomerase rescue: removing the terminal lagging-strand RNA primer leaves an unfillable 5′ gap that shortens linear chromosomes each division unless telomerase extends the 3′ template overhang using its internal TERC RNA.",
    ),
    (
        "part-01-molecular-foundations/04-dna-replication.md",
        "7. The ends of linear chromosomes",
        "art-04-telomerase.png",
        "Three-dimensional view of the telomerase ribonucleoprotein extending a chromosome end: double-stranded telomeric DNA enters from the left, its 3′ single-stranded overhang docks inside the cutaway catalytic cleft of the TERT reverse transcriptase (slate-teal), and pairs with the internal TERC RNA template (amber) to synthesise new hexamer repeats.",
    ),
    (
        "part-01-molecular-foundations/08-proteins-and-gene-function.md",
        "7. Degradation, and the two-sided ledger",
        "art-08-proteasome-autophagy.png",
        "Cutaway structural illustration of the 26S proteasome: a misfolded protein tagged with a chain of gold ubiquitin spheres enters the upper 19S regulatory cap (amber), is unfolded and threaded through the four-ring 20S catalytic barrel (teal/slate), and emerges below as short cleaved peptides.",
    ),
    (
        "part-02-transmission-genetics/09-mitosis-and-meiosis.md",
        "2. The cell cycle is a state machine with guards",
        "fig-09c-cell-cycle-checkpoints.svg",
        "The eukaryotic cell cycle as a guarded state machine (G1 → S → G2 → M, plus quiescent G0) controlled by three hard checkpoints: G1/S restriction (RB/p53), G2/M DNA-damage guard (ATM/ATR), and the M-phase spindle assembly checkpoint.",
    ),
    (
        "part-02-transmission-genetics/15-pedigrees.md",
        "6. Consanguinity and the coefficient of inbreeding",
        "fig-15b-consanguinity-inbreeding.svg",
        "Computing the inbreeding coefficient *F* from a first-cousin pedigree loop: summing (½)<sup>*n*</sup> over the two five-individual paths through shared grandparents A₁ and A₂ yields *F* = 1/16, multiplying rare autosomal-recessive disease risk sharply.",
    ),
    (
        "part-03-genome-instability/17-dna-repair.md",
        "3. Base excision repair: the workhorse",
        "fig-17c-ber-vs-ner.svg",
        "Side-by-side comparison of Base Excision Repair (DNA glycosylase + APE1 + Pol β replacing a single damaged base) versus Nucleotide Excision Repair (distortion sensor + TFIIH unwinding + dual XPF/XPG cuts excising a ~27 nt patch around bulky lesions like UV thymine dimers).",
    ),
    (
        "part-03-genome-instability/18-recombination-mechanisms.md",
        "9. NAHR: homology in the wrong place",
        "fig-18b-nahr-rearrangements.svg",
        "Non-allelic homologous recombination (NAHR) between segmental duplications: direct flanking repeats generate reciprocal microdeletions and microduplications (e.g. 22q11.2, CMT1A), whereas inverted repeats flip the intervening segment into a balanced inversion.",
    ),
    (
        "part-03-genome-instability/20-chromosome-abnormalities.md",
        "6. The maternal age effect, derived",
        "fig-20c-maternal-age-cohesin.svg",
        "Mechanistic basis of the maternal age effect in Trisomy 21: human oocytes arrest in Prophase I before birth without replenishing cohesin rings, so 20–45 years of cohesin erosion destabilise chiasmata and drive exponential Meiosis I nondisjunction after age 35.",
    ),
    (
        "part-03-genome-instability/20-chromosome-abnormalities.md",
        "8. Structural rearrangements and their meiotic behaviour",
        "fig-20b-meiotic-rearrangements.svg",
        "Meiotic pairing geometries of structural rearrangements: an inversion heterozygote forms an inversion loop (where crossovers create dicentric/acentric or duplicated/deleted chromatids), while a reciprocal translocation forms a cross-shaped quadrivalent segregating via balanced alternate or unbalanced adjacent-1 modes.",
    ),
    (
        "part-03-genome-instability/20A-bacterial-and-phage-genetics.md",
        "3. Conjugation: putting a time axis on a chromosome",
        "fig-20Ab-hfr-time-of-entry.svg",
        "Interrupted-mating Hfr × F⁻ conjugation: linear DNA transfer from *oriT* at a constant rate converts blending time directly into a circular *E. coli* genetic map measured in minutes.",
    ),
    (
        "part-04-gene-regulation/24-rna-based-regulation.md",
        "10. CRISPR as bacterial adaptive immunity",
        "fig-24b-crispr-bacterial-immunity.svg",
        "The three natural stages of bacterial CRISPR-Cas adaptive immunity (Adaptation via Cas1–Cas2, Expression into mature crRNAs, and PAM-gated Interference) alongside the chronological repeat–spacer CRISPR array.",
    ),
    (
        "part-04-gene-regulation/25A-developmental-genetics.md",
        "7. Conditional and inducible alleles",
        "fig-25Ab-cre-lox-conditional.svg",
        "Conditional gene knockout using Cre-loxP: crossing a floxed target line with a tissue-specific or tamoxifen-inducible Cre driver leaves the gene intact across the embryo while excising the critical exon selectively in one target cell type (such as Purkinje neurons).",
    ),
    (
        "part-05-population-genetics/27-the-four-forces.md",
        "7. Effective population size",
        "fig-27b-effective-pop-size.svg",
        "Why effective population size *N*<sub>e</sub> is governed by the harmonic mean across generations: a single bottleneck at *N* = 50 collapses *N*<sub>e</sub> to 293 even when census size sits at 10,000 in every other generation.",
    ),
    (
        "part-07-molecular-evolution/33-neutral-theory-and-selection-tests.md",
        "7. The site frequency spectrum, and Tajima's *D*",
        "fig-33b-sfs-sweeps-tajima.svg",
        "Site frequency spectra under neutrality (*D* ≈ 0), selective sweep or population growth (excess rare singletons, *D* < 0), and balancing selection or bottleneck (*D* > 0), paired with the local diversity trough (*π*) carved by a hard selective sweep.",
    ),
    (
        "part-09-genomics/42-read-alignment.md",
        "11. Reading a BAM: health, and failure signatures",
        "fig-42b-bam-qc-signatures.svg",
        "Four visual BAM alignment QC signatures: clean versus adapter-contaminated insert-size distributions, aligned soft-clip cliffs marking structural breakpoints, PCR duplicate stacks, and MAPQ = 0 repeat blackouts.",
    ),
    (
        "part-10-functional-genomics/46-variant-calling.md",
        "10. Structural variants",
        "fig-46c-sv-read-signatures.svg",
        "Detecting structural variants from short-read WGS by combining read depth, discordant paired-end insert/orientation signatures, and split reads pinpointing exact 1-bp breakpoints across deletions, duplications, inversions, and translocations.",
    ),
    (
        "part-10-functional-genomics/48-single-cell-and-spatial.md",
        "13. Spatial genomics",
        "art-48-spatial-transcriptomics.png",
        "Two paradigms of spatial transcriptomics. Left: array-based spatial capture (such as Visium), where a tissue section overlays a hexagonal grid of spatially barcoded capture spots on glass. Right: subcellular in-situ imaging (such as MERFISH or Xenium), resolving individual fluorescently barcoded mRNA molecules directly inside mapped cell boundaries.",
    ),
    (
        "part-10-functional-genomics/49-epigenome-profiling.md",
        "2. Tethered nucleases: CUT&RUN and CUT&Tag",
        "fig-49b-chip-vs-cutrun-cuttag.svg",
        "Protocol comparison of ChIP-seq (whole-genome sonication + antibody pulldown) versus tethered-enzyme methods CUT&RUN (pA-MNase local excision) and CUT&Tag (pA-Tn5 direct adapter tagmentation) in intact nuclei.",
    ),
    (
        "part-11-human-and-statistical-genomics/56-cancer-genomics.md",
        "4. Oncogenes and tumour suppressors — readable off a picture",
        "fig-56b-oncogene-vs-tsg-lollipops.svg",
        "Diagnostic somatic mutation lollipop plots: activating oncogenes (*KRAS*, *BRAF*) display sharp missense hotspot towers at 1–2 codons with almost no truncations, whereas tumour suppressors (*RB1*, *APC*) show scattered nonsense, frameshift, and splice-site loss-of-function mutations across the entire coding sequence.",
    ),
    (
        "part-11-human-and-statistical-genomics/56-cancer-genomics.md",
        "7. Mutational signatures: reading causes off the genome",
        "fig-56c-mutational-signatures.svg",
        "Four canonical COSMIC 96-channel trinucleotide mutational signatures fingerprinting endogenous ageing (SBS1 CpG C>T), UV light (SBS7a/b dipyrimidine C>T), tobacco smoke (SBS4 C>A), and homologous-recombination deficiency (SBS3 flat spectrum predicting PARP-inhibitor sensitivity).",
    ),
    (
        "part-D-sca12/D1-neurons-and-the-cerebellum.md",
        "5. The neurodegeneration mechanism toolbox",
        "fig-D1c-proteostasis-toolbox.svg",
        "The neuronal proteostasis triad — chaperone refolding, the ubiquitin–proteasome system (UPS) for soluble monomers, and autophagy/mitophagy for large aggregates and damaged mitochondria — and how saturation triggers selective neuronal loss.",
    ),
    (
        "part-D-sca12/D2-kinases-phosphatases-and-pp2a.md",
        "6. Why dosage of a regulatory subunit is dangerous",
        "fig-D2b-pp2a-subunit-competition.svg",
        "PP2A holoenzyme subunit competition: because ~20 regulatory B subunits compete for the same finite pool of A–C core dimers, overexpressing *PPP2R2B* (B55β/Bβ2) simultaneously drives excess activity on its own substrates while starving rival B55α and B56 holoenzymes.",
    ),
    (
        "part-D-sca12/D4-sca12-from-repeat-to-phenotype.md",
        "5. Hypothesis B — the Bβ2 mitochondrial route",
        "art-D4-mitochondria-fission.png",
        "Mitochondrial dynamics in Hypothesis B of SCA12. Left: a healthy elongated, branching mitochondrial network with intact cristae. Right: outer-membrane recruitment of PP2A/Bβ2 promotes Drp1 assembly into a constricting helical fission collar (coral-amber), pinching mitochondria into small fragmented spheres that compromise neuronal ATP and Ca²⁺ buffering.",
    ),
    (
        "part-D-sca12/D5-sca12-population-clinic-therapy.md",
        "2. Diagnosis: why a negative genome is not an answer",
        "fig-D5b-rppcr-sawtooth-longread.svg",
        "SCA12 molecular diagnostic readouts compared: standard flanking PCR suffers allelic dropout of expanded repeats (appearing falsely homozygous), repeat-primed PCR (RP-PCR) reveals a diagnostic 3-bp sawtooth tail proving expansion, and long-read sequencing spans the entire repeat tract to capture exact size, interruptions, and methylation.",
    ),
]


def insert_figure_in_section(text: str, h2_sub: str, fig_file: str, caption: str) -> tuple[str, str]:
    rel_src = f"../figures/{fig_file}"
    if rel_src in text:
        return text, "skipped (already embedded)"

    lines = text.splitlines(keepends=True)
    heading_idx = None
    want_h3 = h2_sub.startswith("### ")
    needle = h2_sub[4:] if want_h3 else h2_sub
    for i, ln in enumerate(lines):
        if want_h3 and ln.startswith("### ") and needle in ln:
            heading_idx = i
            break
        if (not want_h3) and ln.startswith("## ") and needle in ln:
            heading_idx = i
            break

    if heading_idx is None:
        raise ValueError(f"Heading containing {h2_sub!r} not found")

    # Find end of first prose paragraph right after the heading (or after the target paragraph for Ch 01 Proteins)
    j = heading_idx + 1
    while j < len(lines) and lines[j].strip() == "":
        j += 1

    insert_at = j
    if j < len(lines):
        first = lines[j].lstrip()
        is_special = (
            first.startswith("#")
            or first.startswith("|")
            or first.startswith("```")
            or first.startswith(">")
            or first.startswith("- ")
            or first.startswith("* ")
            or re.match(r"^\d+\.\s", first) is not None
            or first.startswith("![")
            or first.startswith("<")
        )
        if not is_special:
            # Advance to end of this opening paragraph
            k = j
            while k < len(lines) and lines[k].strip() != "":
                k += 1
            insert_at = k
            # Special precision placement: inside Ch 01 '### Proteins', place right after the α-helix/β-sheet paragraph!
            if want_h3 and needle == "Proteins":
                for idx in range(heading_idx + 1, min(len(lines), heading_idx + 35)):
                    if "wider of DNA's two grooves" in lines[idx]:
                        m = idx
                        while m < len(lines) and lines[m].strip() != "":
                            m += 1
                        insert_at = m
                        break

    fig_block = f"\n![{caption}]({rel_src})\n"
    # Ensure clean blank-line separation before and after
    if insert_at > 0 and lines[insert_at - 1].strip() == "":
        fig_block = f"![{caption}]({rel_src})\n"
    if insert_at < len(lines) and lines[insert_at].strip() != "":
        fig_block += "\n"

    new_lines = lines[:insert_at] + [fig_block] + lines[insert_at:]
    return "".join(new_lines), f"inserted at line {insert_at + 1}"


def main() -> int:
    # 1. Verify every declared figure exists on disk and every file in figures/ is covered
    disk_figs = sorted(p.name for p in FIG_DIR.iterdir() if p.suffix in {".svg", ".png"})
    declared_figs = sorted(p[2] for p in PLACEMENTS)
    missing_on_disk = set(declared_figs) - set(disk_figs)
    unused_on_disk = set(disk_figs) - set(declared_figs)
    if missing_on_disk:
        raise RuntimeError(f"Declared figures missing on disk: {missing_on_disk}")
    if unused_on_disk:
        raise RuntimeError(f"Unused figures in {FIG_DIR}: {unused_on_disk}")

    # 2. Verify all 74 chapters are covered
    all_chapters = sorted(
        str(p.relative_to(ROOT)) for p in ROOT.glob("part-*/*.md")
    )
    covered_chapters = sorted({p[0] for p in PLACEMENTS})
    uncovered = set(all_chapters) - set(covered_chapters)
    if uncovered:
        raise RuntimeError(f"Chapters with zero figures: {uncovered}")

    # 3. Verify no unmatched ** in captions
    for ch, _, fig, cap in PLACEMENTS:
        if "**" in cap:
            raise RuntimeError(f"Bold ** found in caption for {fig} (avoid in alt text)")
        if cap.count("*") % 2 != 0:
            raise RuntimeError(f"Unmatched * in caption for {fig}: {cap}")

    # 4. Apply insertions
    inserted = 0
    skipped = 0
    for ch, h2_sub, fig_file, caption in PLACEMENTS:
        ch_path = ROOT / ch
        orig = ch_path.read_text(encoding="utf-8")
        updated, status = insert_figure_in_section(orig, h2_sub, fig_file, caption)
        if updated != orig:
            ch_path.write_text(updated, encoding="utf-8")
            inserted += 1
        else:
            skipped += 1
        print(f"  {ch} <- {fig_file}: {status}")

    print(
        f"\nDone: {inserted} inserted, {skipped} skipped. "
        f"Coverage: {len(declared_figs)}/{len(disk_figs)} figures across {len(covered_chapters)}/{len(all_chapters)} chapters."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
