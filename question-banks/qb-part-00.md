# Question bank — Part 0: Orientation

Covers [Ch 00](../part-00-orientation/00-the-whole-story.md) and
[Ch 01](../part-00-orientation/01-chemistry-and-cell-primer.md).

Convert to Anki: `python reference/to_anki.py question-banks/ --out anki-import.tsv`

## The central architecture

Q: What are the four bases of DNA?
A: Adenine (A), cytosine (C), guanine (G), thymine (T).

Q: Which bases pair with which, and what enforces the rule?
A: A pairs with T, and G pairs with C. Hydrogen bonds are directional and specific, and the donor/acceptor geometry permits only these two combinations rather than promiscuous pairing.

Q: Why is the fact that DNA is double-stranded and complementary so consequential?
A: Each strand is a complete recipe for reconstructing the other. That single property makes replication possible (each strand templates a new partner), repair possible (damage on one strand is corrected by reading across), and reading possible (the helix opens locally and one strand serves as template).

Q: What does the central dogma state?
A: Information flows DNA to RNA to protein. DNA is transcribed into RNA; RNA is translated into protein. DNA is also replicated into DNA.

Q: Why does the cell make RNA copies rather than using DNA directly?
A: RNA is a cheap, disposable working copy. Thousands of identical transcripts can be made, used, and destroyed without touching or risking the protected master archive.

Q: What is a codon?
A: A group of three consecutive bases in RNA, read as a unit during translation, specifying one amino acid or a stop signal.

Q: How many codons are there, and how many amino acids do they specify?
A: 64 codons specifying 20 amino acids plus stop. The code is therefore redundant, with several codons often meaning the same amino acid.

Q: In what sense is a protein's shape its function?
A: A protein works by presenting a surface complementary to its binding partner or substrate. Change the shape and you change or abolish what it can interact with. This is why one amino acid substitution can destroy function or do nothing at all, depending on where it sits.

## Regulation and cell identity

Q: Every cell in your body has the same genome. What makes a neuron different from a liver cell?
A: Which genes are expressed, and at what level. Cell identity is a self-sustaining pattern of gene expression maintained by transcription factors, chromatin state, and feedback -- the same information, a different subset read.

Q: "Every cell in your body has the same genome" is a first approximation. Where does it break down?
A: Cells accumulate somatic mutations throughout life, so a body is a genetic mosaic rather than 37 trillion copies of one sequence -- which is central to cancer. There is also one large-scale programmed exception: developing B and T cells physically cut out and rejoin segments of their antibody and T-cell-receptor loci, so a mature lymphocyte really does differ from the germline at those loci.

Q: Why does most of what distinguishes closely related species lie in regulation rather than protein sequence?
A: Human and chimpanzee proteins are nearly identical in sequence. The substantial differences are in when, where, and how much genes are expressed -- changes in regulatory sequence rather than coding sequence.

Q: Where does most disease-associated common genetic variation sit, and why does that matter?
A: Overwhelmingly outside protein-coding sequence, in regulatory regions. It changes how much of a protein is made rather than what the protein looks like -- which makes interpreting it much harder than reading a coding change.

## Packaging and chromosomes

Q: How many chromosomes do humans have, and how are they organised?
A: 46, in 23 pairs. Twenty-two pairs are autosomes; the twenty-third pair is the sex chromosomes, X and Y. One member of each pair comes from each parent.

Q: Why is DNA packaging a layer of regulation and not just storage?
A: Compacted DNA cannot be read. The packaging state marks whole regions as available or off-limits, and that state can be propagated to daughter cells -- which is the substance of epigenetics.

Q: Why do the histone proteins that package DNA carry a strong positive charge?
A: DNA's backbone carries one negative charge per nucleotide, so it electrostatically self-repels and resists compaction. Positive histones neutralise that repulsion. Chemically removing that positive charge (by acetylation) loosens the interaction and opens the region.

## Inheritance and variation

Q: What does mitosis produce?
A: Two daughter cells genetically identical to the parent cell. This is growth, repair and maintenance.

Q: What does meiosis do, and why is it necessary?
A: It halves the chromosome number, producing gametes with 23 chromosomes from a cell with 46, so that fertilisation restores 46 rather than doubling the count each generation.

Q: What are the two mechanisms by which meiosis generates variation?
A: Independent assortment of whole chromosomes (2^23 combinations in humans, since each pair segregates independently), and recombination -- physical exchange of segments between paired chromosomes, making each transmitted chromosome a mosaic.

Q: What is the approximate human germline mutation rate?
A: About 1.1 to 1.3 x 10^-8 per base pair per generation, giving roughly 60 to 80 new mutations per person that neither parent carried.

Q: Are mutations usually harmful?
A: No. Most are neutral -- they land in sequence where the exact bases do not matter much. Harmful ones are a minority, and beneficial ones are rarer still but not negligible.

Q: Besides generating variation, what does recombination make possible for genetics as a discipline?
A: It is why genes near each other on a chromosome tend to be inherited together while distant ones do not. That distance-dependent shuffling is what genetic mapping measures, and it is the reason association studies work a century later.

Q: Mutation and recombination both generate variation. What is the difference?
A: Mutation creates alleles that did not previously exist -- the only source of genuinely new variation, and undirected. Recombination creates no new alleles but reshuffles existing ones into new combinations every generation.

## Genotype, phenotype, dominance

Q: Define genotype and phenotype.
A: Genotype is the genetic sequence an individual carries. Phenotype is what the individual observably is. The mapping between them is loose and is the central problem of the field.

Q: What do homozygous and heterozygous mean?
A: Homozygous means carrying two identical alleles at a locus; heterozygous means carrying two different ones.

Q: What does "dominant" actually mean?
A: That the heterozygote resembles one homozygote rather than falling between the two. Nothing more.

Q: Why is it wrong to think a dominant allele is common, strong, or advantageous?
A: Dominance describes only the heterozygote's phenotype. Frequency is set independently by mutation, selection, drift and migration. Huntington's disease is dominant, rare and harmful; blood group O is recessive and the most common allele in most populations.

Q: What is a quantitative or complex trait?
A: A trait influenced by many variants of individually small effect, plus environment and chance -- height, blood pressure, most disease risk. These are the normal case; single-gene traits are the tractable exception.

Q: A trait runs strongly in a family. Why does that not establish that it is genetic?
A: Families share environment, diet, language, income and habits as well as alleles, so clustering is consistent with genetic causation but does not demonstrate it. Separating the two needs designs that break the confound -- adoption studies, twin comparisons, within-family association tests.

Q: Why is "the genome is a blueprint for the organism" the wrong analogy, and what is better?
A: Nothing in the genome corresponds to a picture of the result -- there is no representation of a finger anywhere in it. It is closer to a recipe: a set of local rules whose interaction produces structure as the system runs.

## Populations and evolution

Q: Define evolution mechanically.
A: Change in allele frequencies in a population over time.

Q: What are the four forces that change allele frequencies?
A: Mutation (introduces new alleles), selection (systematically changes frequencies of variants affecting survival or reproduction), genetic drift (random sampling between generations), and migration (movement between populations).

Q: Why is it wrong to say selection improves organisms toward a goal?
A: Selection is a bias in a sampling process with no foresight and no objective function. It cannot preserve a currently useless variant for future usefulness. Drift, meanwhile, changes frequencies with no reference to fitness at all.

Q: In what kind of population does genetic drift dominate?
A: Small populations. The smaller the population, the larger the sampling variance between generations, and the more frequencies wander irrespective of fitness.

## What genomics is

Q: What changed when sequencing made it possible to read genomes directly, and what is the binding constraint now?
A: Genetics spent its first century inferring the contents of the genome indirectly -- from inheritance patterns, crosses, and disease running through families. Genomics is what happened when we could just look. Sequencing cost has fallen faster than semiconductor manufacturing did over the same decades, so generating data is no longer the hard part; interpreting it is.

Q: Why does a catalogue of how common every observed variant is make clinical interpretation possible?
A: Because frequency is evidence against pathogenicity: a variant seen in thousands of healthy adults is not causing a severe childhood disease. Databases recording variant frequencies across hundreds of thousands of people turn that argument into a routine filter.

## The cell

Q: How does prokaryotic cell architecture differ from eukaryotic, and what does that difference create?
A: Prokaryotes have no nucleus -- one circular chromosome sits in the cytoplasm and ribosomes latch onto an RNA while it is still being transcribed, so transcription and translation are coupled. Eukaryotes enclose the DNA in a nucleus, transcribing inside and translating outside, and that separation creates an RNA-processing step in between where a great deal of regulatory complexity lives.

Q: Why does a human cell contain a second, separate genome, and how is it inherited?
A: Mitochondria descend from free-living bacteria engulfed by an ancestral cell -- endosymbiosis -- and have retained a small circular chromosome ever since. It is inherited only from the mother, which gives mitochondrial disease a distinctive pedigree pattern and makes mitochondrial DNA a favourite marker in population history.

## Chemistry that matters

Q: What is the difference between covalent bonds and non-covalent interactions in biology?
A: Covalent bonds are strong and long-lived at body temperature -- they store information and build backbones. Breaking one usually takes an enzyme, though not always: spontaneous depurination alone breaks ~10^4 base-sugar bonds per cell per day, which is why a covalent archive still needs constant repair. Non-covalent interactions are weak and transient -- they make decisions. Anything that has to be reversible in an instant -- a protein binding DNA, two strands separating, an enzyme releasing product -- is non-covalent; anything that has to persist is covalent.

Q: If covalent bonds are stable at body temperature, why does a covalent DNA archive still need constant repair?
A: Because stable is not permanent. DNA loses purines continuously to spontaneous hydrolysis of the bond joining base to sugar, on the order of 10^4 per cell per day, and that slow chemical attrition is where a large share of mutation comes from.

Q: What are the four classes of biological macromolecule, and what is each for?
A: Nucleic acids (DNA and RNA) store and carry information; proteins do essentially all the work -- catalysis, structure, transport, signalling, and regulation of the genome itself; lipids are non-polar and self-assemble into the bilayers that form every cellular membrane; carbohydrates supply energy and, attached to proteins, act as molecular identity tags such as the ABO blood groups.

Q: What is the hydrophobic effect, and what actually drives it?
A: The clustering of non-polar molecules in water. It is driven by water's entropy, not by attraction between the non-polar molecules: water cannot form its normal hydrogen-bond network around a non-polar surface, so burying that surface releases ordered water.

Q: Name three things the hydrophobic effect is responsible for.
A: Protein folding (hydrophobic side chains bury inward), membrane formation (lipid bilayers self-assemble), and stabilisation of the double helix (flat bases stack in the interior away from water).

Q: Why is RNA chemically less stable than DNA, and why is that useful?
A: Ribose has a 2'-hydroxyl that deoxyribose lacks; it can attack the adjacent phosphate and cleave the backbone. Useful because a working copy should decay -- a permanent message queue would make regulation impossible.

Q: What does it mean that DNA is polyanionic, and give two consequences.
A: Its backbone carries one negative charge per nucleotide. Consequences: DNA migrates toward the positive electrode in gel electrophoresis, and proteins binding DNA non-specifically tend to be positively charged.

## The stochastic view

Q: How does a transcription factor find its binding site among three billion base pairs?
A: By diffusion and random collision. It does not go anywhere -- it random-walks, colliding constantly, sticking briefly at most positions and much longer at its target. Specificity is a matter of relative residence time, not addressing.

Q: If a transcription factor binds its target 1000 times more tightly than random DNA, is that enough to be specific in a human genome?
A: No. With ~3 x 10^9 potential sites and only a 10^3 preference, it spends most of its time bound elsewhere. Real specificity comes from combinatorial requirements (several sloppy factors that must all be present), plus chromatin making most of the genome inaccessible.

Q: Why do two genetically identical cells in identical conditions express different amounts of the same gene?
A: Because expression depends on small numbers of stochastic binding and dissociation events. Expression level is a time average over an intrinsically noisy process, so it varies between cells.

Q: How is DNA replication fidelity of ~10^-10 per base per replication achieved?
A: As the product of three imperfect filters in series: base selection by the polymerase (~10^-5), 3' to 5' proofreading (~10^-7), and mismatch repair (~10^-9 to 10^-10). No single step is accurate; the composition is.

Q: Replication is accurate to ~10^-10 per base per replication, but the germline rate is ~1.1 to 1.3 x 10^-8 per base per generation. Why the hundredfold gap?
A: They are different quantities with different denominators. A generation stacks hundreds of germline cell divisions on top of that filter stack, and much germline mutation begins as spontaneous chemical damage that never passed through a polymerase at all. Every rate needs its denominator checked.

Q: What is the correct mental model for molecular events, for someone used to programming?
A: A massively concurrent system with no scheduler, no locks, no ordering guarantees and unreliable delivery, where correctness is achieved statistically through redundancy and downstream error correction. Discard the function-call model.

## Structure from first principles

Q: Why is the DNA backbone on the outside of the helix and the bases on the inside?
A: The backbone is charged and burying charge away from water is energetically costly, so it faces out. The bases are flat and largely non-polar, so they pack in the interior away from water.

Q: What does it mean that a DNA strand has a 5' end and a 3' end, and why does it matter practically?
A: The two ends of a strand are chemically different, so a strand has direction and the two strands of a duplex run antiparallel. That asymmetry is why replication is messy, why sequence is written 5' to 3' by convention, and why a coordinate on the reverse strand needs care.

Q: Why must a purine always pair with a pyrimidine?
A: To keep the helix a constant width. A two-ring purine paired with a one-ring pyrimidine gives a uniform diameter; purine-purine would bulge and pyrimidine-pyrimidine would pinch.

Q: What is the functional significance of the major groove?
A: It is wide enough to expose distinguishing chemical features of each base pair, so a protein can read the underlying sequence without opening the helix. This is how sequence-specific DNA-binding proteins recognise their targets.

Q: Contributes more to double-helix stability: base pairing or base stacking?
A: Base stacking. The hydrogen bonds of base pairing provide specificity -- determining which base goes opposite which -- but stacking interactions between adjacent bases contribute more of the stability.

## Scale and intuition

Q: Roughly how much DNA is in a human cell, and how big is the nucleus that holds it?
A: About two metres of DNA, in a nucleus roughly six micrometres across.

Q: How large is the human haploid genome, and how much raw information is that?
A: About 3.1 billion base pairs. At two bits per base, roughly 750 MB -- smaller than many video files.

Q: What proportion of the human genome encodes protein?
A: Only about 2%.

Q: Why is "the other 98% is junk" wrong, and why is "it's all functional" also wrong?
A: "Junk" is wrong because much of it is regulatory, structural, or transcribed into non-coding RNA -- non-coding genes outnumber coding genes roughly 3:1. "All functional" is wrong because ~46% of the genome is transposable-element derived and largely degraded, and being transcribed or bound is not the same as doing something useful. The honest position is that the functional fraction is contested and depends on the definition of "functional".

Q: How crowded is the interior of a cell?
A: Macromolecules occupy 20 to 30% of the volume. It is nothing like a dilute solution -- diffusion is hindered and local concentrations are far from uniform.

## The one-gene trace

Q: What does the LCT gene encode, and what regulates whether it stays on in adulthood?
A: Lactase, the enzyme that digests lactose. Whether it stays on is controlled by a regulatory element roughly 14,000 bases away, inside a neighbouring gene -- not by sequence within LCT itself.

Q: Why is lactase persistence a good illustration of convergent evolution?
A: Different populations -- northern Europeans and some East African pastoralists -- independently evolved different variants in the same regulatory region producing the same phenotype, in each case alongside cattle domestication.

Q: Why does the lactase persistence allele sit on an unusually long shared haplotype?
A: Because it rose in frequency very fast under strong selection -- faster than recombination could break up the surrounding chromosome segment. Long-range haplotype structure is a signature of recent, strong selection.
