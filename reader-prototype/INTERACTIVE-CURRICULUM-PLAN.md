# Interactive curriculum plan

Status: validated full-course implementation with seventy-three Hero Labs and sixteen selective changed-context transfer challenges
Scope: 74 chapter/statistics files, 506 stated learning objectives
Delivery constraint: the built reader must continue to work from `file://`

## Current review set — 26 August 2026

The current review set now covers all 74 modules with a substantial
interactive experience:

- the six existing Chapter 00 interactives, retained and regression-tested;
- seventy-three new Hero Labs in every module except Chapter 00;
- sixteen selective changed-context transfer challenges with three independent
  cases each: the existing Chapter 14 mapping challenge plus fifteen new
  additions in the chapters where changed-context reasoning adds the most value;
- the transmission-genetics tranche specifically adds Chapters 09-13 and 15;
- the genome-instability tranche adds Chapters 16-20A and maps all 42 stated
  objectives in those six modules to active lab states;
- the gene-regulation tranche adds Chapters 21-25A and maps all 41 stated
  objectives in those six modules to active lab states;
- the population-genetics tranche adds Chapters 26-29 and maps all 28 stated
  objectives in those four modules to active lab states;
- the sampling and quantitative-genetics tranche adds S3 and Chapters 30-32 and
  maps all 26 stated objectives in those four modules to active lab states;
- the hypothesis-testing and molecular-evolution tranche adds S4 and Chapters
  33-35A and maps all 34 stated objectives in those five modules to active lab
  states;
- the experimental-methods tranche adds Chapters 36-38 and maps all 21 stated
  objectives in those three modules to active lab states;
- the genomics and functional-genomics tranche adds Chapters 39-42 and 44-49,
  maps all 70 stated objectives in those ten modules to active lab states, and
  keeps Chapter 43 and Chapter 50 inside the same end-to-end regression;
- the human-genomics, clinical, cancer, practice, and ethics tranche adds
  Chapters 51-58 and maps all 53 stated objectives in those eight modules to
  active lab states;
- the advanced-statistics tranche adds S5-S7 and maps all 20 stated objectives
  in those three modules to active lab states;
- the SCA12 deep-dive tranche adds D1-D5 and maps all 33 stated objectives in
  those five modules to evidence-tiered active lab states;
- 410 explicit runtime objective mappings across 70 objective-mapped interactions;
- 243 total mounted widgets across the generated reader, including the existing
  floor interactions outside this tranche.

The seventy-three new labs and fifteen new transfer challenges are implemented
and validated. All modules now have an authored interactive experience, but this is not a
claim that the full 506-objective assessment manifest is complete: the 19
earlier Hero Labs, original Chapter 00 states, and floor interactions still need
equivalent objective-to-evidence records. Transfer is deliberately selective:
the review found that a standalone challenge is valuable where learners must
carry a causal rule into unfamiliar symbols, data, or evidence, but often adds
redundancy where the Hero Lab already contains a strong changed-context state.
Browser and model evidence is
recorded in `.gstack/qa-reports/qa-report-genomics-interactions-wave1-2026-08-25.md`,
`.gstack/qa-reports/qa-report-genomics-transmission-wave-2026-08-26.md`,
`.gstack/qa-reports/qa-report-genomics-instability-and-full-regression-2026-08-26.md`,
`.gstack/qa-reports/qa-report-genomics-regulation-and-all-visualizations-2026-08-26.md`,
`.gstack/qa-reports/qa-report-genomics-population-and-full-regression-2026-08-26.md`,
`.gstack/qa-reports/qa-report-genomics-quantitative-and-full-regression-2026-08-26.md`,
`.gstack/qa-reports/qa-report-genomics-evolution-and-full-regression-2026-08-26.md`,
`.gstack/qa-reports/qa-report-genomics-methods-and-full-regression-2026-08-26.md`,
`.gstack/qa-reports/qa-report-genomics-parts9-10-and-full-regression-2026-08-26.md`,
`.gstack/qa-reports/qa-report-full-course-visualizations-2026-08-26.md`, and
`.gstack/qa-reports/qa-report-all-74-module-visualizations-2026-08-26.md`.
The selective changed-context build and its case-by-case review are recorded in
`.gstack/qa-reports/qa-report-transfer-challenges-2026-08-26.md`.

## 1. Outcome

Every substantial scientific claim in the course should have an active visual
representation. A learner should not merely watch DNA replication, linkage,
assembly, or loop extrusion. They should predict an outcome, change the model,
run it, inspect the consequence, and use the same rule in a changed context.

The unit of coverage is the **learning objective**, not the widget. The course
currently contains 74 chapter/statistics files, 506 objectives, 711 numbered
primary sections, and 390 subsections. Building one unrelated widget for each
heading would fragment the experience. Instead, the target is:

| Unit | Requirement | Approximate total |
|---|---|---:|
| Chapter or statistics module | one substantial Hero Lab | 74 |
| Learning objective | one or more active evidence records | 506 |
| Supporting concept | a focused state or micro-interaction | about 200 |
| High-transfer chapter or statistics module | one three-case changed-context challenge | 16 in the current selective portfolio |
| Misconception | predict before explanatory feedback | existing floor plus additions |

A transfer challenge is therefore not a universal chapter-completion badge.
It is added only when the new context tests a reusable inference that the Hero
Lab itself could otherwise allow a learner to solve by remembering its controls.

## 2. What counts as interactive coverage

An interaction counts only when the learner must do something scientifically
meaningful. Panning, opening a tooltip, or watching an autoplay animation does
not satisfy an objective.

The shared interaction grammar is:

1. **Learn:** see the minimum causal rule and representation.
2. **Predict:** commit to an observable outcome before it is revealed.
3. **Manipulate:** change a causal variable, construct a system, or classify
   evidence.
4. **Run:** allow the model or experiment to produce its result.
5. **Inspect:** connect the microscopic event to the aggregate observation.
6. **Counterfactual:** change one input while holding the fixture or random seed
   fixed.
7. **Transfer:** apply the rule to different symbols, organisms, data, or a
   clinical context.

Every Hero Lab has three modes:

- **Guided:** the rule and action cues remain visible.
- **Challenge:** cues are removed and the learner must construct or diagnose.
- **Explore:** prediction gates and scoring are disabled; the lab behaves as a
  reusable scientific instrument.

## 3. Visual and interaction system

The review set extends the reader's existing paper, ink, teal, and amber system. It
should feel like annotated scientific benches embedded in a textbook rather
than dashboards embedded in prose.

Each lab uses one dominant visualization and a compact causal rail:

`you changed -> mechanism -> observable`

The rail is structural rather than decorative. It keeps the learner's action,
the biological process, and the measured result visible at the same time.

Design rules:

- one primary scientific relationship per state;
- controls use the vocabulary of the chapter, not implementation terminology;
- measurements and units remain on the visual;
- colour is paired with labels, position, or shape;
- transitions show a change of state and never loop decoratively;
- every drag interaction has a click and keyboard alternative;
- all stochastic models support seeded replay;
- `prefers-reduced-motion` removes non-essential movement;
- dense canvas views have a textual or tabular alternative;
- no interaction depends on network access.

## 4. Reusable engines

The course should reuse engines, not generic scientific content.

| Engine | Core capabilities | Initial consumers |
|---|---|---|
| Sequence | strands, bases, coordinates, mutations, translation | Ch 02, 04-07, 16-19, 38, 41, 46 |
| Molecular/spatial | parts, orientation, state transitions, scale | Ch 02-08, 17-25, 36, 38, 40, 49-50 |
| Lineage | chromosomes, cells, gametes, pedigrees, clones | Ch 09-15, 20, 25A, 37, 54, 56 |
| Population | deterministic and seeded stochastic generations | Ch 26-35A, 51, 53, 57-58 |
| Graph | paths, components, trees, networks | Ch 25, 34-35, 42-45, 52, 56 |
| Matrix | counts, likelihood surfaces, heatmaps, contact maps | Ch 12, 14, 32, 46-52, S4-S7 |
| Experiment | samples, instruments, pipelines, controls | Ch 36-50, 54-57 |
| Evidence/decision | claims, support, uncertainty, stakeholders | Ch 39, 44, 52, 55, 57-58, D4-D5 |
| Sampling/statistics | repeated samples, distributions, estimators | Ch 12, 26-34, 40, 46-53, S1-S7 |

Scientific models are pure deterministic functions where possible. Rendering,
narrative fixtures, and assessment evidence remain separate so the model can be
unit-tested against known limits.

## 5. Authoring and coverage manifest

Every interaction record should declare:

- stable interaction ID;
- source document and placement heading;
- objective IDs such as `ch14-o2`;
- Guided, Challenge, and Explore availability;
- learner action;
- causal inputs and measured outputs;
- target misconception;
- transfer fixture;
- scientific source or chapter section;
- accessible alternative;
- model, fixture, and browser tests.

The build should eventually fail when:

- an objective has no active evidence mapping;
- a placement references an unregistered interaction;
- a required transfer fixture is absent;
- an interaction is anchored to a heading that no longer exists;
- a stochastic interaction cannot reproduce its saved seed.

Source modules can remain separated during authoring and be concatenated into
one ordinary script during the Python build. That preserves the current
`file://` constraint without making a monolithic source file the authoring API.

## 6. Curriculum coverage map

The following is the required Hero Lab for each chapter. Semicolon-separated
items are states or embedded micro-interactions within that lab.

### Part 0 — Orientation

- **00 — Whole-Story Control Room:** retain strand complement, central dogma,
  meiosis, mutation budget, drift, and curriculum map; add cell-identity,
  chromosome-packing, genotype-to-phenotype, and read-reconstruction states.
- **01 — Molecular Forces Playground:** bond construction; water and
  hydrophobic collapse; macromolecule assembly; compartments and diffusion;
  molecular noise; free energy versus activation energy.

### Part 1 — Molecular foundations

- **02 — DNA Geometry and Topology Bench:** nucleotide and direction builder;
  pairing and stacking; melting controls; groove reader; alternative DNA
  structures; twist/writhe/linking number; evidence reconstruction.
- **03 — Genome Scale Zoomer:** base-to-chromosome scale; packing and karyotype;
  composition; repeat-driven tool failures; mitochondrial heteroplasmy.
- **04 — Replication Fork Machine:** Meselson-Stahl; origin arithmetic;
  leading/lagging construction; fork machinery; fidelity filters; telomeres;
  licensing; timing and stress.
- **05 — Transcription Engine:** strand choice; bacterial and eukaryotic
  initiation; elongation and termination; CTD states; pausing; enhancer contact;
  gene-length timing; pervasive transcription.
- **06 — Spliceosome Editor:** cap/splice/poly-A pipeline; both chemistry steps;
  splice-site and regulatory mutations; isoforms; NMD ruler; RNA editing.
- **07 — Ribosome and Reading-Frame Lab:** six frames; triplet-code evidence;
  tRNA and wobble; alternative codes; charging fidelity; start choice;
  synonymous mechanisms.
- **08 — Protein Fate Lab:** folding interactions; domains and motifs; PTMs and
  localization; synthesis/degradation dynamics; proteostasis; variant
  mechanisms; structure-prediction confidence.

### Part 2 — Transmission genetics

- **09 — Chromosome Time Machine:** terminology and DNA-content guards;
  mitosis/meiosis scrubber; crossover tracing; Mendel from mechanics;
  meiosis-I, meiosis-II, and mitotic nondisjunction.
- **10 — Inheritance Probability Lab:** molecular dominance; cross builder;
  Punnett-to-probability transformation; multilocus rules; testcross sampling;
  binomial families; frequency and fitness.
- **11 — Pathway Genetics Circuit:** incomplete dominance and codominance by
  assay; pathway ratios; complementation; penetrance and expressivity;
  sex/environment effects; phenocopies.
- **12 — Genetic Inference Workbench:** expected counts and residuals;
  chi-square and degrees of freedom; power; pedigree Bayes; ascertainment;
  multiple testing.
- **13 — Sex-System Comparator:** mammal/fly/worm/environmental systems; SRY
  exceptions; Y evolution; sex-linked pedigrees; X-inactivation mosaics; dosage
  compensation.
- **14 — Genetic Map Workbench:** phase; four-chromatid crossing over;
  recombination fraction and the 50% ceiling; three-point mapping; tetrads;
  interference and mapping functions; LOD support.
- **15 — Pedigree Detective:** editable pedigree; competing mode likelihoods;
  penetrance, de novo, mosaic, imprinting and anticipation controls;
  consanguinity paths; risk communication.

### Part 3 — Genome instability

- **16 — Mutation Forensics Bench:** classification by scale and consequence;
  chemical routes; damage versus mutation; germline versus somatic; signatures;
  Ames and Luria-Delbruck; regional rates and repeat instability.
- **17 — Repair Triage Simulator:** lesion routing; direct repair, BER, NER and
  MMR; HR/NHEJ resection decision; synthetic lethality; damage tolerance;
  checkpoint fate; defect signatures.
- **18 — Homologous Recombination Molecular Lab:** resection, invasion and
  junction resolution; DSBR versus SDSA; gene conversion; GC bias; PRDM9;
  obligate crossover; NAHR.
- **19 — Transposon Lifecycle Studio:** cut-and-paste versus copy-and-paste;
  L1 target-primed reverse transcription; active/fossil census; insertion
  evidence; host defence; domestication.
- **20 — Karyotype and Rearrangement Workbench:** nondisjunction; dosage;
  inversion/translocation pairing; CNV and NAHR; chromothripsis; rescue and UPD;
  detection-resolution ladder.
- **20A — Microbial Genetics Lab:** transformation, conjugation and transduction;
  interrupted mating; F-prime partial diploids; cotransduction; plasmids;
  lambda switch; complementation versus recombination.

### Part 4 — Gene regulation

- **21 — Operon Circuit Board:** quantitative lac system and merodiploids;
  cis/trans tests; trp attenuation; riboswitches; sigma regulons; two-component
  signalling; quorum and phase variation.
- **22 — Enhancer Logic Studio:** regulatory landscapes and looping; modular
  transcription factors; PWMs; pioneer opening; enhancer grammars; bursting;
  sufficiency versus necessity assays.
- **23 — Epigenetic Memory Lab:** definitions; marks and remodelers; symmetric
  methylation maintenance; promoter/gene-body effects; imprinting; XIST;
  reprogramming and clock confounding.
- **24 — RNA Regulation Workbench:** miRNA/RISC and seed matches; siRNA/piRNA;
  lncRNA transcript versus transcription; CRISPR immunity; half-life;
  translational control; stoichiometry.
- **25 — Gene-Network Dynamics Studio:** feedback, feed-forward, toggles and
  oscillators; cooperativity and hysteresis; attractors; gradients and stripes;
  Hox; reprogramming; robustness and evo-devo.
- **25A — Developmental Genetics Lab:** lineage versus position; fly screens;
  homeotic changes; double-mutant epistasis; fate maps; targeting; Cre-lox and
  lineage tracing.

### Part 5 — Population genetics

- **26 — Hardy-Weinberg Population Simplex:** allele/genotype conversion;
  one-generation equilibrium; assumption perturbations; tests and power;
  error, multiallelic, X-linked, inbreeding, and Wahlund states.
- **27 — Evolution Sandbox:** mutation, selection, dominance, drift, migration;
  same-seed counterfactuals; equilibrium, fixation and loss; effective
  population size; bottlenecks and founders.
- **28 — Population Structure Explorer:** pedigree IBD and inbreeding;
  runs of homozygosity; Wahlund; F-statistics; geography; PCA, admixture, local
  ancestry; false GWAS.
- **29 — Haplotype and LD Lab:** phase ambiguity; four-haplotype table;
  D, D-prime and r-squared; recombination decay; creation by history and
  selection; heatmaps; tagging, sweeps, and imputation.

### Part 6 — Quantitative genetics

- **30 — Polygenic Variance Loom:** exact Mendelian class mixtures becoming
  continuous under environmental variance; threshold liability and
  ascertainment; the signed G/E/covariance/G-by-E ledger; one-locus regression
  into breeding value and dominance residual; genetic correlation; IBD-derived
  relative covariance.
- **31 — Heritability and Selection-Response Tape:** narrow versus broad-sense
  partitions; parent, sibling, twin, GREML and LD-score estimands; fixed
  genetics across two gardens; truncation selection and a labelled Bulmer
  approximation; replicated plateaus diagnosed by intervention; the
  within-group/between-group counterexample.
- **32 — Chromosome and LOD Scan Bench:** Haldane attenuation from hidden QTL to
  marker; interval and composite scans including a ghost peak; permutation and
  Bonferroni thresholds; F2, RIL, AIL and NIL design trade-offs; support
  intervals, the detection floor and winner's curse; family linkage versus
  association and the boundary between measured polygenicity and mechanism.

### Part 7 — Molecular evolution

- **33 — Selection Inference Lab:** neutral substitution cancellation; molecular
  clocks; nearly neutral regimes; multiple-hit correction; dN/dS; SFS and
  Tajima D; MK; sweep/demography confounding.
- **34 — Tree Inference Studio:** topology space; orthology/paralogy; alignment
  perturbation; distance, parsimony, likelihood and Bayes; long-branch
  attraction; bootstrap; rooting, clocks and the coalescent.
- **35 — Genome Evolution Theatre:** segmental, retro and whole-genome
  duplication; duplicate fates; dosage balance and Ks; families, concerted
  evolution, orthology, synteny, HGT, de novo genes and pangenomes.
- **35A — Speciation and Conservation Map:** species concepts; barriers and gene
  flow; incompatibilities and snowballing; Haldane and large-X; hybrid zones;
  introgression; FST confounding; rescue trade-offs.

### Part 8 — Experimental methods

- **36 — Virtual Molecular Bench:** extraction, gels, PCR/qPCR/digital PCR,
  cloning and assembly, hybridisation, Sanger, antibody and reporter assays,
  interactions, mass spectrometry, and question-to-method cases.
- **37 — Genetic Screen Designer:** model selection; forward-screen breeding;
  saturation; mapping; complementation; reverse and pooled screens; epistasis;
  synthetic lethality; reasons for no phenotype.
- **38 — Genome Editor Simulator:** addressing versus repair; R-loop and cut;
  specificity; NHEJ/HDR; base and prime editing; dCas9; pooled screens;
  delivery, therapy, germline, and gene drive.

### Part 9 — Genomics

- **39 — Genome Landscape Zoomer:** cross-species scale; composition; C/G-value
  paradoxes; definitions and bounds on function; repeat textures and tool
  breakage; mutational hazard; organelles.
- **40 — Sequencer Simulator:** Sanger, Illumina, PacBio and nanopore physical
  signals; consensus; platform errors; coverage; duplicates and GC bias;
  capture designs; platform choice.
- **41 — Format and Coordinate Debugger:** one molecule through FASTA, FASTQ,
  SAM/BAM/CRAM, VCF, BED and GFF; Phred, flags, CIGAR and MAPQ; normalization;
  coordinates, indexing, builds and naming.
- **42 — Alignment Workbench:** search complexity; BWT/FM-index; seeds,
  minimizers and chains; affine dynamic programming; spliced and split reads;
  MAPQ, multimapping, reference bias, and BAM failure signatures.
- **43 — Assembly Graph Lab:** OLC versus de Bruijn framing; k choice; tips and
  bubbles; unitigs; repeats as an information limit; scaffolding; contiguity
  metrics; phasing; T2T and metagenomes.
- **44 — Annotation HMM Lab:** structural versus functional annotation;
  bacterial ORFs versus eukaryotic HMMs; evidence integration; annotation
  disagreement; transcript-dependent consequence; regulatory and homology
  errors.
- **45 — Pangenome Path Explorer:** reference composition and T2T; arithmetic
  reference bias; graph paths and GFA; graph coordinates and liftover; graph
  mapping; reference choice.

### Part 10 — Functional genomics

- **46 — Variant Caller Bench:** pileups, qualities, likelihoods and posteriors;
  haplotype assembly; gVCFs and joint genotyping; filters and QC; structural and
  somatic states; benchmarking and callable regions.
- **47 — RNA-seq Design and Analysis Lab:** design and batch; library choice;
  multimapping EM; compositional normalization; negative-binomial GLM,
  shrinkage and FDR; bulk composition; failure signatures.
- **48 — Single-Cell Atlas Lab:** droplet and barcode mechanics; ambient,
  doublet and zero models; QC bias; neighbour graphs, UMAP and clustering;
  circular testing; integration; pseudotime, velocity, multimodal and spatial.
- **49 — Epigenome Assay Bench:** ChIP/CUT&RUN/CUT&Tag and controls; peaks and
  IDR; ATAC and footprint bias; methylation chemistry and composition;
  nascent transcription; enhancer claims; state segmentation.
- **50 — Living 3D Genome:** proximity ligation; matrix normalization and
  resolution; compartments, TADs and loops; extrusion and CTCF orientation;
  acute perturbations; single-cell/ensemble distinction; enhancer uncertainty;
  boundary hijacking.

### Part 11 — Human and statistical genomics

- **51 — GWAS Failure Lab:** dosage model; population-structure false positives;
  PCs, mixed models and siblings; lambda/LDSC; thresholds; QC and imputation;
  QQ/Manhattan; winner's curse; tagging and ancestry.
- **52 — Locus-to-Mechanism Evidence Board:** credible sets and LD limits;
  multi-ancestry; functional priors; nearest gene, eQTL, colocalisation, TWAS,
  contacts and CRISPR; regulation gaps; MR; target chain.
- **53 — Polygenic Score Clinic:** weighted sum; LD and noise; shrinkage;
  leakage; relative-to-absolute risk; discrimination/calibration; portability;
  screening, breeding, embryo and consumer limits.
- **54 — Rare-Disease Variant Detective:** frequency/effect plane; power and
  tagging bounds; filtering; trio artefacts; phase and segregation; burden/SKAT;
  constraint, matchmaking, penetrance and screening.
- **55 — Clinical Evidence Classifier:** five tiers; evidence strengths and
  combinations; Bayesian odds; credible frequency; predictor dependence;
  functional calibration; segregation/de novo/phase; ClinVar and reclassification.
- **56 — Cancer Evolution Lab:** tumour populations; drivers and passengers;
  oncogene/tumour-suppressor patterns; two hits; signatures; instability;
  clonal trees and VAF; treatment-selected resistance; therapy evidence.

### Part 12 — Applications and ethics

- **57 — Genomics-in-Practice Case Carousel:** rare disease, rapid diagnosis,
  NIPT, screening, pharmacogenomics, outbreaks, breeding, forensic likelihood,
  ancient DNA, microbiomes and consumer tests; the same data lead to different
  decisions because the loss function changes.
- **58 — Genomic Ethics Consequence Simulator:** re-identification and kin;
  consent over time; discrimination and group harms; ancestry bias; race versus
  ancestry; reproduction and heritable editing; gene drive, dual use, and
  governance. No fake single-answer scoring.

### Statistics

- **S1 — Probability Workbench:** sample spaces; product and sum rules;
  simulation; conditional probability; independence; Bayes; expectation;
  base-rate testing.
- **S2 — Distribution Zoo:** Bernoulli/binomial, Poisson, normal, chi-square,
  negative binomial, exponential/geometric and beta distributions generated by
  their biological processes.
- **S3 — Repeated-Study Estimation Lab:** population versus sampling frame;
  repeated estimates and the inverse-square-root standard-error law;
  bias/variance/MSE and finite-sample correction; exact Wald versus Wilson
  coverage; rare-variant zero counts; bootstrap unit choice; systematic error
  that becomes more precisely wrong as sample size grows.
- **S4 — Hypothesis Lab:** null, data, statistic and tail; degrees of freedom;
  p-value misconceptions; type I/II and power; negative results; multiplicity;
  forking paths.
- **S5 — Regression Lab:** variance; covariance and correlation; least squares;
  residuals; regression to the mean; adjustment and confounding; logistic
  regression; causal diagrams.
- **S6 — Likelihood Landscape:** likelihood versus probability; numerical
  optimization; LR/LOD/LRT; prior to posterior; credible versus confidence;
  genotype, pedigree, clinical and fine-mapping fixtures; AIC/BIC.
- **S7 — High-Dimensional Microscope:** family-wise versus FDR; GWAS threshold;
  BH; QQ and lambda; PCA; t-SNE/UMAP distortion; shrinkage and winner's curse;
  overdispersed counts and relatedness.

### Part D — SCA12 deep dive

Part D uses an evidence-tiered implementation because several SCA12 claims are
still unsettled. Human tissue, patient-derived cells, overexpression models,
cross-disease analogy, and conjecture remain visibly distinct; contested repeat
thresholds and PPP2R2B expression direction are presented as uncertainty rather
than collapsed into a single mechanism.

- **D1 — Neuron and Cerebellum Systems Lab:** neuronal geometry, transport and
  energy; signalling; cerebellar circuit; Purkinje vulnerability; proteostasis,
  autophagy, mitochondria, calcium and death; signs, SARA and MRI.
- **D2 — PP2A Phosphorylation Network:** opposing fluxes; PP2A heterotrimer and
  B families; B55-beta isoform localization; substrate states; limited-core
  competition; discriminating experiment.
- **D3 — Repeat Expansion Lab:** motif/location taxonomy; secondary structures
  and repair; germline/somatic clocks; MSH mechanisms; thresholds and
  interruptions; anticipation; mechanism classes; short-read blind spot.
- **D4 — SCA12 Mechanism Board:** locus/strand/isoform; threshold uncertainty;
  expression, mitochondrial and RNA/RAN hypotheses; predictions,
  counterevidence and falsifiers; tissue/iPSC results; confidence-tagged chain.
- **D5 — Population-to-Therapy Dossier:** founder/endogamy sampling;
  repeat-sizing pipeline; reports; counselling with uncertain penetrance;
  therapy sign depends on mechanism; trial design; research dossier.

## 7. Pilot specification

The four pilots are a vertical slice through the architecture:

| Pilot | Interaction family | Primary relationship | Required proof |
|---|---|---|---|
| Ch 04 — Replication Fork Machine | molecular/spatial | antiparallel templates plus 5-prime-to-3-prime synthesis force discontinuous lagging synthesis | learner can identify the lagging template and explain the primer/fragment consequence |
| Ch 14 — Genetic Map Workbench + Transfer Challenge | lineage + quantitative | recombinant progeny reveal phase and distance, observed recombination saturates at 50%, and a new three-point dataset exposes gene order, hidden double crossovers, and interference | learner must solve three changed-context datasets, with misconception-specific feedback for phase, DCO, interval, c.o.c., and interference errors |
| Ch 43 — Assembly Graph Lab | graph/information | a repeat can make multiple genomes consistent with the same k-mer multiset | learner can walk a graph and distinguish an algorithmic problem from missing information |
| Ch 50 — Living 3D Genome | matrix/spatial | oriented CTCF barriers constrain extrusion, while compartments arise separately | learner predicts an inversion or depletion outcome and reads it from the contact matrix |

Pilot acceptance criteria:

- prediction gate records to the existing chapter ledger;
- Explore mode opens the instrument without recording a score;
- the scientific model responds to every enabled control;
- the causal rail explains the current action-mechanism-observable chain;
- keyboard use reaches every control and every selectable scientific object;
- the visual remains legible at 320 px and in both themes;
- reduced-motion mode removes non-essential transitions;
- generated pages work from `file://` with no runtime fetch;
- existing Chapter 00 widgets and floor widgets remain unchanged in behaviour;
- build and structural verification pass.

### 7A. Selective transfer portfolio

The chapter-by-chapter review retained sixteen modules. Each has a rule that is
easy to imitate in the worked example but difficult to apply when strand
direction, symbols, data geometry, or evidential context changes. Every new
challenge uses three cases and three linked decisions; a correct decision
annotates the specimen and unlocks the next inference instead of merely showing
a score.

| Module | Executable objectives | Changed context that earns a challenge |
|---|---|---|
| Ch 04 — replication | `ch04-o3` | Reverse fork direction, then separate primer, ligase, and proofreading phenotypes while preserving 5′→3′ chemistry. |
| Ch 06 — RNA processing | `ch06-o3`, `ch06-o5` | Move from splice-signal damage to isoform, then place a new stop relative to the final exon junction. |
| Ch 07 — translation | `ch07-o1`, `ch07-o7` | Change strand identity, reading-frame perturbation, or mitochondrial code before classifying the consequence. |
| Ch 09 — meiosis | `ch09-o4`, `ch09-o6` | Infer meiosis I, meiosis II, or post-zygotic failure from allele-copy products rather than a familiar cartoon. |
| Ch 12 — genetic inference | `ch12-o1`–`o3` | Recompute residuals and degrees of freedom for new multinomials, including a fitted parameter, and bound the final claim. |
| Ch 14 — linkage | `ch14-o4` | Reconstruct gene order, both intervals, coefficient of coincidence, and interference from three unseen eight-class testcrosses. |
| Ch 15 — pedigrees | `ch15-o2`, `ch15-o4` | Use decisive transmission constraints, then make a separate conditional risk update without equating allele and phenotype. |
| Ch 17 — repair | `ch17-o2`, `ch17-o4`, `ch17-o5` | Route UV, double-strand-break, and alkylation lesions through the step that fails and predict a specific signature or dependency. |
| Ch 29 — LD | `ch29-o1`, `ch29-o3`, `ch29-o4` | Derive D, D′, and r² from phased haplotypes, including a case where perfect D′ is a poor tag. |
| Ch 31 — heritability | `ch31-o5`, `ch31-o7` | Recalculate h² and response across environments while rejecting individual- and between-group causal misreadings. |
| Ch 41 — formats | `ch41-o2`–`o5`, `ch41-o7` | Decode SAM/FASTQ, preserve interval length, normalise VCF, validate target-build REF, and distinguish omission from callability. |
| Ch 42 — alignment | `ch42-o3`–`o5` | Interpret an intron gap, turn candidate competition into MAPQ, and identify a repeat-span information limit. |
| Ch 43 — assembly | `ch43-o1`, `ch43-o3` | Build edges from new k-mer multisets and decide whether one or multiple complete walks are identified by the data. |
| Ch 46 — variant calling | `ch46-o1`, `ch46-o4`, `ch46-o7` | Separate a balanced posterior call, a strand/mapping artefact, and a zero-depth no-call. |
| Ch 55 — clinical interpretation | `ch55-o2`, `ch55-o3`, `ch55-o5`, `ch55-o7` | Audit evidence dependence, combine calibrated points, preserve the VUS boundary, and update a dated classification. |
| S6 — likelihood and Bayes | `s6-o1`, `s6-o3`–`o5` | Keep observations fixed on a likelihood, handle a boundary interval, and multiply prior odds by a likelihood ratio. |

The remaining modules retain their Hero Labs without an extra standalone
transfer card. That is intentional where the lab already includes a strong
counterfactual or unfamiliar dataset, where the learning objective is primarily
orientation or vocabulary, or where discussion and evidence appraisal are more
appropriate than a forced-choice sequence. The portfolio should expand only
when a new challenge adds a distinct inference, not to make the chapter counts
look uniform.

## 8. Validation

Each interaction requires five kinds of evidence:

1. **Model tests:** known limits, invariants, and hand-calculated fixtures.
2. **Science review:** wording, units, orientation, and the difference between
   established results and interpretation.
3. **Structural tests:** registration, placement, build, offline assets, saved
   state, and failure degradation.
4. **Interface tests:** desktop, narrow mobile, light/dark, keyboard, focus,
   reduced motion, and screen-reader summaries.
5. **Learning tests:** a novice can perform the Guided state and solve a changed
   fixture without copying the demonstration.

Clicks, time-on-widget, and exploratory slider movement are not mastery
evidence. Store predictions, constructed relationships, explanations, and
transfer outcomes separately.

## 9. Rollout

1. Establish the interaction registry, coverage manifest, common layout, seeded
   model utilities, and pilot tests.
2. Review and revise the four pilots before scaling their engines.
3. Complete Parts 0-1 and S1-S2 to strengthen the learner's visual vocabulary
   — present in the current review set.
4. Complete Parts 2-7 with S3-S4 and the statistics modules they require
   — present in the current review set.
5. Complete Part 8's experiment and evidence interactions
   — present in the current review set.
6. Complete Parts 9-10, where pipeline, graph, and matrix interactions provide
   especially high leverage — present in the current review set.
7. Complete Parts 11-12 with explicit evidence and stakeholder review
   — present in the current review set.
8. Complete S5-S7 and implement Part D with source-tiered claims and explicit
   uncertainty — present in the current review set.

Each part exits only when every objective has a coverage record, each Hero Lab
passes its scientific and interface checks, and every deliberately selected
transfer challenge passes all three of its changed contexts. Shipping all
widgets for one reusable engine before completing any curricular part is
explicitly not the rollout strategy; learners need coherent reading-order depth
rather than a horizontal technology demo.

## 10. Validation gate

The current seventy-three-lab and fifteen-new-transfer tranche passed this gate
on 26 August 2026. Before a release or future expansion, re-check:

- scientific correctness and scope of all seventy-three models, with special
  scrutiny of the four cross-domain pilots and the evidence boundaries in Part D;
- whether each interaction teaches one relationship cleanly;
- whether the visual language feels integrated with the reader;
- whether each of the sixteen transfer tasks measures understanding rather than
  control memory, and whether any unselected chapter has gained a genuine need;
- whether the source/runtime split is acceptable for scaling;
- the complete implementation diff and browser screenshots.
