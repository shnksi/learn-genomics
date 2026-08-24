# Question bank — Part 08: Methods

Covers [Ch 36-38](../part-08-methods/36-core-molecular-methods.md).

Convert to Anki: `python reference/to_anki.py question-banks/ --out anki-import.tsv`

## The nucleic-acid advantage

Q: What two physical properties make DNA and RNA unreasonably easy to work with, and why do proteins have neither?
A: A constant charge-to-mass ratio, since each nucleotide contributes one negative phosphate and roughly the same mass, so mobility reports length alone. And programmable self-recognition, so any target is addressable by writing down a string and ordering the oligonucleotide. Protein charge depends on composition and pH, proteins have no synthesisable complement, and there is no protein PCR, so every protein method needs a bespoke reagent or a mass spectrometer.

Q: DNA does not separate by length in free solution, yet a gel separates it beautifully. Why, and what does SDS-PAGE add to make the same trick work for proteins?
A: In free solution the driving force scales with charge (proportional to length) and drag scales with size (also proportional to length), so they cancel and mobility is length-independent; a sieving matrix breaks the cancellation by retarding longer molecules more. SDS coats an unfolded protein at a roughly fixed mass ratio, manufacturing the constant charge-to-mass ratio that DNA has for free.

Q: Does Western blotting work by hybridisation, like Southern and Northern blotting?
A: No. Proteins do not base-pair, so no complementary probe exists; a Western works because an animal was immunised against the protein and the antibodies purified. The name is a pun on Ed Southern's surname, and it misleads more students than any other naming accident in biology.

Q: A band of the expected size appears on your gel. What has that established?
A: A length, and nothing more. Identity requires a sequence-specific probe, a diagnostic digest, or sequencing. Correctly sized wrong products are common.

Q: Is Sanger sequencing obsolete, and what are its limits?
A: No, because its value is error independence rather than accuracy: chain termination read by capillary electrophoresis uses different chemistry, sample path and software, so it does not share failure modes such as mismapping in paralogous regions, index hopping or sample swaps. Its limits are 500 to 1,000 bases of usable read, unreadable traces downstream of a heterozygous indel, and blindness to mosaicism much below about 15 to 20%.

Q: What makes a dideoxynucleotide terminate a Sanger sequencing chain, and what problem does chain termination convert the sequencing problem into?
A: A ddNTP lacks the 3'-OH, so the next phosphodiester bond has nothing to attach to and that chain stops where it was incorporated. Spiking normal dNTPs with roughly 1 part in 100 to 1,000 of dye-labelled ddNTPs gives a population of fragments terminating at every position, so reading sequence becomes reading colours in length order: the length-separation problem DNA hands you for free.

## Hybridisation, FISH and arrays

Q: Why did expression microarrays lose to RNA-seq while genotyping arrays survived?
A: A hybridisation assay can only measure what you designed onto it, and its dynamic range is squeezed between background and saturation, whereas a sequencing assay counts and is discovery-capable. Genotyping arrays survive precisely because their query set is fixed by design: a known panel of common SNPs, cheap per sample, which is what makes population-scale association studies affordable.

Q: What question does FISH answer that bulk sequencing answers badly?
A: Anything about the distribution across cells. Bulk sequencing averages over cells while FISH reports per nucleus, so questions such as what fraction of cells carry this amplification, or whether a fusion is present in a minor subclone, are exactly what it is for, and that is why it remains standard clinical practice.

Q: What single knob sets the sensitivity-specificity trade-off in any hybridisation assay?
A: Stringency, meaning temperature, salt and formamide, which together set how many mismatches a probe-target duplex tolerates. Raising stringency trades sensitivity for specificity along a continuous dial, so the same probe can be run as a permissive or a strict query.

## PCR: amplification and its limits

Q: What does thermostability actually buy PCR?
A: A polymerase from a thermophile, canonically Taq from Thermus aquaticus, survives the 95 C denaturation step instead of being destroyed by it, with a half-life of tens of minutes at 95 C and extension at 72 C. Without it you must add fresh enzyme by hand every cycle; with it, PCR becomes a machine loop.

Q: Write the PCR amplification relationship and name the causes of the plateau in order of importance.
A: N_n = N_0 (1 + E)^n, where E is per-cycle efficiency between 0 and 1 and perfect doubling is E = 1. Real reactions run at E of 0.9 to 1.0 early, then plateau because product strands reanneal to each other faster than primers can find them, because primers and dNTPs deplete, and because the polymerase accumulates thermal damage.

Q: Does the amount of PCR product tell you how much template you started with?
A: Only during the exponential phase. Because the plateau is set by reagent depletion and product reannealing rather than by input, reactions seeded with 10 copies and with 10^6 copies converge on similar final concentration. That is exactly why qPCR measures a cycle rather than a quantity.

Q: Does running more cycles give more sensitivity?
A: Past the plateau, no. And at very low input, stochastic sampling in the early cycles produces allele dropout and jackpot effects, so the answer becomes noisy rather than merely small.

Q: Why are PCR primers 18 to 25 nucleotides long rather than 12 or 40?
A: A random k-mer is expected about 6.2 x 10^9 / 4^k times in a diploid human genome: about 1.4 chance occurrences at k = 16 but about 0.006 at k = 20, so below roughly 18 nt no unique site can be expected. Longer primers cost more, push melting temperature towards the extension temperature, and tolerate internal mismatches better.

Q: Why does a mismatch at a primer's 3' end matter far more than one at its 5' end?
A: Extension requires a base-paired 3'-OH, so a 3' mismatch blocks the polymerase while 5' mismatches are tolerated. That is why tags, barcodes and adapters get bolted onto primer 5' ends, and why deliberately placing a variant at the 3' end gives allele-specific PCR.

## Quantification: qPCR and digital PCR

Q: Why does reverse transcription gate nearly every RNA method?
A: No DNA-dependent DNA polymerase accepts an RNA template, and reverse transcriptase is itself a DNA polymerase, just an RNA-dependent one, so amplification-based RNA methods and most sequencing-based ones must copy RNA into cDNA first. The exceptions are the methods that read RNA directly: Northern blotting, RNA-FISH and direct-RNA nanopore sequencing.

Q: What does a TaqMan probe buy over SYBR Green, and what control does SYBR then require?
A: The probe is a third oligonucleotide inside the amplicon, so detection requires a third independent sequence match rather than any double-stranded DNA, and different dyes let several targets run in one tube. SYBR Green is cheap and needs nothing designed, but it reports primer-dimers and off-target products too, so it requires a melt curve to confirm one product.

Q: Why is Ct linear in log starting copy number, and what is the ideal standard-curve slope?
A: Fluorescence tracks copies, F_n = k N_0 (1 + E)^n, so Ct = [log(F_T/k) - log N_0] / log(1 + E). Ct is therefore affine in log N_0 with slope -1/log10(1 + E) per decade; perfect doubling gives -1/log10(2) = -3.32 cycles per tenfold dilution, because tenfold more input is 3.32 doublings' head start.

Q: How do you read efficiency off a standard curve, and what does a slope of -3.9 mean?
A: E = 10^(-1/m) - 1, where m is the slope in cycles per decade. A slope of -3.9 gives E = 0.80, so the reaction is running at 80% efficiency and is not doubling. That invalidates ddCt, which assumes E = 1 for both target and reference, with the error growing as dCt grows.

Q: State the ddCt relationship and the two assumptions that carry all the weight.
A: Fold change = 2^-ddCt, where ddCt = dCt(treated) - dCt(control) and each dCt = Ct(target) - Ct(reference). It assumes equal efficiency for target and reference, which the Pfaffl formula relaxes using each assay's measured E, and a reference gene that genuinely does not change; the second is the compositional-data problem in miniature, since you measure a ratio and call it an abundance.

Q: Does qPCR give absolute quantities?
A: No. It gives relative ones unless calibrated against a standard curve, whose calibration error the answer then inherits. Digital PCR is the absolute method, and it gets there by counting partitions rather than by calibrating against a reference material.

Q: How does digital PCR use the plateau that ruined quantitative endpoint PCR, and what is the Poisson correction?
A: Partition into 10^4 to 10^7 droplets so most hold zero or one template, then amplify to endpoint: the plateau drives every occupied partition to the same saturated signal, so the readout is binary and the measurement is a count. With n partitions and k positive, lambda = -ln(1 - k/n) and copies = lambda x n; at k/n = 0.21 the naive count undercounts by about 11% because some partitions held two molecules.

## Cloning, reporters and protein assays

Q: In what sense are restriction sites palindromes, and why does that symmetry exist?
A: They read identically on the reverse complement, not backwards along one strand as "racecar" does. The symmetry exists because the enzyme is a homodimer, and a two-fold symmetric protein binds a two-fold symmetric site.

Q: What structural flaw in restriction cloning did Gibson and Golden Gate assembly remove?
A: Restriction cloning needs recognition sites absent from the insert, usably arranged in the vector and compatible in buffer and temperature, leaves scars, and does not scale past two or three fragments. Both replacements move specificity from a fixed enzyme alphabet to arbitrary designed sequence: Gibson uses 20 to 40 nt designed overlaps, and Golden Gate uses Type IIS enzymes that cut outside their site so you choose the four-base overhang.

Q: Why does Golden Gate assembly run as a one-pot ratchet?
A: Type IIS cutting removes the recognition site along with the cut, so correct products are no longer substrates and cannot be re-cut. Cutting and ligation therefore run simultaneously in one tube, and curated sets of twenty or more mutually orthogonal four-base overhangs order that many fragments in a single reaction.

Q: An antibody is sold as "anti-X". What validates that claim?
A: Only loss of signal in a knockout or knockdown control. A substantial fraction of commercial antibodies do not detect what the label says, and a band of the expected size is not validation.

Q: What are the steps of a ChIP experiment, and what are its two essential controls?
A: Crosslink protein to DNA in living cells with formaldehyde, fragment the chromatin, immunoprecipitate the protein of interest, reverse the crosslinks, and sequence the DNA that came along, giving a genome-wide map of where that protein was. The two essential controls are input chromatin and a non-specific antibody.

Q: What does a ChIP peak tell you about any individual cell?
A: Very little directly, because occupancy is stochastic and a peak is a population average of it: a bound site is one bound often enough, in enough cells, to survive the wash. It is an occupancy frequency, not a statement that the protein sits there in every cell.

Q: How does epitope tagging sidestep the antibody-reagent problem, and what kind of move is that?
A: Engineer a short peptide tag such as FLAG, HA or His onto the gene, then use one heavily validated anti-tag antibody for every target you will ever study. It converts an unsolved biochemistry problem into a cloning problem, a substitution the field makes repeatedly.

Q: Does a GFP fusion faithfully report protein level?
A: No. Fluorescent proteins mature slowly and degrade slowly, so they track increases poorly and decreases very poorly, and the fusion itself can perturb folding, localisation and turnover. What a fluorescent fusion does uniquely well is report localisation, which no lysate-based method can.

Q: What does a yeast two-hybrid hit actually mean?
A: That the two proteins can interact when both are forced into a yeast nucleus at high concentration, stripped of their normal targeting. They may live in different compartments, cell types, or developmental stages, so Y2H characteristically over-reports pairs that can bind rather than pairs that do co-occur.

Q: What does a classical reporter assay establish, and what does it not?
A: Sufficiency: this isolated fragment, on a plasmid, in this cell type, can drive expression. It does not establish necessity at the endogenous locus, in native chromatin, at native copy number, which is why enhancer validation moved to perturbing the native sequence.

## Mass spectrometry and the protein asymmetry

Q: Why is proteomics done bottom-up, and what job does trypsin do?
A: Whole proteins are too large to measure informatively, so the sample is digested with a sequence-specific protease first. Trypsin cleaves after lysine and arginine, making it a restriction enzyme for proteins, and it yields peptides of tractable length that carry a basic residue at the C-terminus and therefore ionise well; those peptides are separated by liquid chromatography, weighed as MS1, then fragmented and weighed again as MS2.

Q: In what sense is protein identification by mass spectrometry a database search, and what is it therefore blind to?
A: Theoretical fragment spectra are computed for every peptide in an in-silico digest of the proteome and observed spectra are scored against them, so nothing is read off the instrument directly. That puts mass spectrometry downstream of genome annotation and blind to any real sequence the annotation does not contain.

Q: How is false discovery controlled in a proteomics database search?
A: By target-decoy search: a reversed or shuffled database is searched alongside the real one, and decoy hits above threshold are a direct empirical estimate of the false-positive count. It is an empirical null rather than a modelled one, which is what makes a proteomics FDR statement mean something.

Q: Why is the proteome not "solved" the way the genome is?
A: Abundance dynamic range spans ten or more orders of magnitude in plasma while a single run covers four to five, so abundant proteins mask everything else; peptides are not uniquely assignable to proteins, giving a protein-inference problem structurally identical to multi-mapping reads in RNA-seq; and modifications are substoichiometric, so each needs dedicated enrichment. Underneath all three sits the fact that there is no amplification step for protein.

## Forward and reverse genetics

Q: Define forward and reverse genetics, and name the hard step in each.
A: Forward genetics starts from a phenotype and finds the gene, so the hard step is deciding which of many random mutations is causal; the virtue is that no prior hypothesis is needed. Reverse genetics starts from a gene and finds the phenotype, so the hard step has migrated entirely into choosing and powering an assay that touches the gene's function.

Q: Are model organisms chosen because they resemble humans?
A: No. They are chosen for throughput, genetic tractability and scorable phenotypes, and relevance is traded away deliberately and must be re-argued for each question. A model organism is not a small human; it is an instrument with known distortion.

Q: Why does an F1 mutagenesis screen find only dominant mutations?
A: The mutagenised gamete contributes one mutant allele, so the F1 is heterozygous, and most loss-of-function alleles are recessive because most genes are haplosufficient. Seeing a recessive requires homozygosing it, which costs one or two extra generations of breeding, and is the real reason mouse forward screens are rare.

Q: What three things does a Drosophila balancer chromosome do that a plain marked chromosome cannot?
A: Its nested inversions make any crossover product inviable, so recombinants are never recovered and the mutagenised chromosome cannot be broken up. Its recessive lethal prevents the balancer going homozygous, so the stock cannot lose the mutant chromosome. Its dominant visible marker makes carriers identifiable by eye.

Q: How does C. elegans self-fertilisation make the F2 screen free, and how many F2 clones per line do you need?
A: Every F1 hermaphrodite is a self-crossing heterozygote, so its brood is automatically one quarter homozygous with no cross to set up. To be 95% certain of recovering at least one homozygote you need n with (3/4)^n <= 0.05, i.e. n >= 11 clones per line.

Q: Contrast chemical and insertional mutagens by what each costs you.
A: EMS and ENU give dense point mutations and a useful allelic series of nulls, hypomorphs and temperature-sensitives, but the lesion carries no tag so you must map it. Transposon and T-DNA insertions carry their own sequence tag, so recovering the flanking DNA gives the gene, but density is lower and insertion-site bias means some genes are never hit.

Q: How do you study a gene whose null is dead, and what does a temperature-sensitive allele give that a knockout cannot?
A: Use a conditional allele: a ts missense change that folds at 23 C and misfolds at 37 C turns an essential gene into a switch, so you shift the temperature and ask when in the process the requirement lies. What it adds over a knockout is acute loss, with no time to compensate, and temporal resolution within a single cell cycle, which is how the logic of the cell cycle was extracted from yeast.

Q: What do Cre-loxP and tamoxifen-inducible CreER each fix about a straight mouse knockout?
A: A straight knockout can kill the animal before the tissue of interest exists, and any survivor has had its whole development to compensate. Flanking an essential exon with loxP and supplying Cre from a tissue-specific promoter deletes the gene only where Cre is expressed, and fusing Cre to a modified oestrogen receptor keeps it out of the nucleus until tamoxifen is given, so you also choose when.

Q: State the general principle that conditional alleles are an instance of.
A: Separate the allele from the trigger, then control the trigger in space and time. The same move recurs throughout modern genetics, from ts alleles and CreER to inducible promoters and chemically gated editors.

Q: Why does a modifier screen start from a weak allele rather than a null?
A: Because a sensitised background sits near the phenotypic threshold, which puts the assay on the steep part of the dose-response curve, so a gene whose loss produces no detectable phenotype on its own produces a large one here. That makes the screen select for functional connection rather than for having a phenotype at all, which is the filter you want when asking what else is in this pathway.

Q: What does an intragenic suppressor tell you that an extragenic one does not?
A: An intragenic suppressor is a second change in the same protein that restores the fold or an interaction surface, so it is evidence about structure. An extragenic suppressor is a mutation in a different gene that bypasses or compensates for the defect, so it is evidence about the pathway.

## Saturation, complementation and mapping

Q: How do you estimate from an allele spectrum how many genes a screen has missed?
A: Sort the mutants into complementation groups and apply the Chao-style estimator for unseen classes: unseen genes is approximately f1^2 / (2 f2), where f1 is the number of groups with one allele and f2 the number with two. Many singletons and few doubletons means you are nowhere near done.

Q: Has a saturated screen found all the genes for a process?
A: No. It has found all the genes findable by that assay, in that background, under those conditions. Four classes are structurally invisible: genes with redundant paralogues, genes required earlier than the process being scored, genes whose loss is pleiotropic enough that the mutant is filtered out for other reasons, and genes the assay does not interrogate.

Q: State the complementation test, and give the three ways it lies.
A: Cross two recessive mutants: wild-type progeny means complementation and different genes, mutant progeny means the same gene. It is valid only for recessive loss-of-function alleles, so a dominant-negative fails to complement everything; intragenic complementation between alleles hitting different domains of a multimeric protein gives false complementation within one gene; and unlinked non-complementation between dosage-sensitive partners gives false non-complementation between two genes.

Q: What is the estimator behind bulk-segregant analysis?
A: Unlinked markers sit at a mutant-strain allele frequency of 0.5, because half the genome came from each parent. At the causal locus every selected chromosome must carry the mutant allele, so the frequency goes to 1.0, and at recombination fraction r from the locus the expected frequency is 1 - r. You read a genetic map directly off a coverage-normalised allele-frequency track.

Q: Do bigger screens need deeper sequencing?
A: Rarely. In bulk-segregant mapping resolution is set by the number of selected meioses, so with N selected chromosomes the nearest recovered breakpoint sits about 1/N Morgans away and depth cannot buy resolution the meioses do not contain. In pooled screens the noise floor is set by cells per construct, since every passage is a multinomial resampling of the pool.

## Perturbation, interaction and phenotype

Q: Do knockdown and knockout answer the same question?
A: No. A stable mutant has been selected for tolerance and can compensate transcriptionally, while an acute knockdown cannot. Zebrafish morphant-versus-mutant disagreements turned out to be off-target artefacts in some cases and genetic compensation in others, both real, and disagreement between the two is information rather than technical failure.

Q: Does epistasis mean physical interaction?
A: No. Classical epistasis orders genes in an information-flow sense. Two genes can be epistatic without their products ever touching, and two proteins can interact physically with no epistasis at all.

Q: Define the multiplicative epistasis measure and give the meaning of each sign.
A: With single-mutant relative fitnesses W_a and W_b, the independence expectation for the double is W_a x W_b, so epsilon = W_ab - W_a x W_b. Negative epsilon is aggravating (synthetic sick or lethal) and indicates parallel buffering pathways; positive epsilon is alleviating and often means the same complex or pathway; epsilon near zero is independence.

Q: A null a(lf) never responds to a cue, a gain-of-function b(gf) responds constitutively, and the double mutant a(lf); b(gf) is constitutive. Which gene acts downstream?
A: B acts downstream of A. In a positive-acting chain from cue to A to B to response, a constitutive double shows that B does not need A in order to fire; had the double shown no response instead, B's output would still require A and B would be upstream.

Q: What three conditions must hold before a double mutant can order two genes in a pathway?
A: The alleles must be a true null and a true constitutive, since a hypomorph gives an intermediate that orders nothing; the two single mutants must have opposite, distinguishable phenotypes; and the pathway must be a linear chain of positive regulators. If either gene is a negative regulator the slogan that the epistatic mutant is downstream inverts, so you reason from the wiring rather than reciting the rule.

Q: Explain synthetic lethality as a therapeutic strategy, using BRCA and PARP.
A: If losing gene A is survivable and losing gene B is survivable but losing both is not, a tumour that already lost A can be killed selectively by a drug against B while normal cells retaining A survive. BRCA1- or BRCA2-mutant tumours are defective in homologous-recombination repair, and PARP inhibitors trap PARP on DNA, generating lesions only homologous recombination can resolve.

Q: A knockout mouse shows no detectable phenotype. What are you entitled to say?
A: Not that the gene does nothing, but that the assays used, in that background, under those conditions and at whatever power the sample size gave, detected no difference. The defensible sentence names the assays, the background, and the effect size the study had 80% power to detect.

Q: Why must a knockout's control be a littermate, and what counts as n?
A: The same targeted null gives different phenotypes on different inbred backgrounds because modifier alleles differ, so comparing against a separate wild-type stock confounds the gene with every other difference between the lines. And n is the number of independent animals, litters or infections, not cells, wells or images, since cage, litter and batch are random effects with real variance.

Q: Did CRISPR make forward genetics obsolete?
A: No. It made targeted perturbation cheap, which is the reverse-genetic step. Unbiased discovery still requires an assay that scores a phenotype, and that has not become any easier.

## CRISPR mechanism and the repair pathways

Q: Was CRISPR's advance over TALENs a gain in specificity?
A: No. TALENs already had a code, one repeat per base with identity set by two residues, so the field already knew how to specify any target sequence. The revolution was that binding energy is supplied by base pairing instead of by a folded protein surface: a protein interface has to be designed, expressed and validated, while a guide RNA is a string literal.

Q: Why are pooled screens not constructible on the zinc-finger or TALEN platforms?
A: Because the scaling differs, not the constant factor. Editing N targets costs N protein-engineering campaigns with ZFNs or TALENs, since each new address is a new binding module to assemble and validate, but costs one plasmid plus N oligonucleotides with CRISPR, since the address is a 20-nt parameter.

Q: Does CRISPR edit DNA?
A: CRISPR cuts DNA; the cell's own repair machinery writes the final sequence. Every editor is a programmable DNA-binding module plus a payload, and the third component you do not control is the repair pathway that decides the outcome. Base editors and prime editors are the exceptions that write the change themselves.

Q: Why are knockouts easy and precise corrections hard, in terms of pathway competition?
A: Perfect religation after non-homologous end joining regenerates the target so Cas9 cuts again, and the reaction runs until an indel destroys the site, making indels an absorbing state. Precise edits need homology-directed repair, which requires a donor template, a sister chromatid and the S/G2 phases, and runs at single-digit to low-double-digit percent even in dividing cells.

Q: Why does HDR-based correction fail in exactly the cells you most want to fix?
A: Neurons and cardiomyocytes are terminally post-mitotic, so HDR there is effectively zero. Adult hepatocytes are only G0-quiescent and retain proliferative capacity, so HDR is very inefficient rather than absent and works appreciably only in neonatal or regenerating liver. Base editing and prime editing exist because of this one fact.

Q: Why does SpCas9 require a PAM, and what would a PAM-less Cas9 do to its host?
A: The PAM is the self/non-self test: the bacterium's own CRISPR array carries the spacer but not the adjacent PAM, so Cas9 cannot cut the array encoding its own guides. Without it, a CRISPR system is an autoimmune disease. For the engineer, NGG occurs about once every 8 bp across both strands, so the PAM is a constraint on the addressable space.

Q: Trace Cas9 target recognition from collision to cut.
A: Cas9 collides with DNA constantly but interrogates only PAMs; on finding one it locally melts the duplex and zippers the guide onto the target strand from the PAM-proximal end. A complete R-loop, with the guide paired to the target strand and the non-target strand displaced, licenses the HNH and RuvC domains to cut one strand each, giving a blunt cut 3 bp upstream of the PAM.

Q: Is a guide with no perfect off-target match in the genome safe?
A: No. Mismatch tolerance is position-dependent, not Hamming-distance-dependent: three mismatches in the seed (roughly the PAM-proximal 8 to 12 nt) usually abort cutting, but three mismatches at the PAM-distal end can be cut efficiently. RNA and DNA bulges also create sites that a fixed-length string search never enumerates.

## Off-targets, delivery and pooled screens

Q: Are off-target effects measured, so that the number is known?
A: No. In vitro cut censuses on naked DNA are highly sensitive but have no chromatin and nominate sites never cut in a cell, while in-cell tag-capture assays report genuine breaks but are limited by tag uptake and event frequency. Nominated lists overlap only partially and none is a gold standard, so reports state a detection floor, typically about 0.1% allele frequency, rather than zero.

Q: Why can amplicon sequencing across the cut site not tell you what happened?
A: It is blind to kilobase-scale deletions, loss of heterozygosity, translocations and chromothripsis, because those events destroy the primer binding sites. The assay conditions on the damage not having occurred, which is an ascertainment bias rather than a measurement error, so long-read or karyotype-level assessment belongs in any therapeutic package.

Q: Why is the ranking RNP, then LNP-mRNA, then AAV a specificity ranking?
A: Cas9 is effectively single-turnover and stays clamped to its cut product, so cutting is fast and release is slow. Total off-target damage therefore integrates over how long the editor is present, not over how fast it works, and electroporated RNP persists for hours, mRNA in lipid nanoparticles for days, and AAV for months to years. AAV persists mainly as an episome rather than by integration, but it expresses for months to years, so the exposure time is long either way.

Q: What does dCas9 decouple, and what different questions do CRISPRi and CRISPRa ask?
A: Inactivating both nuclease domains gives a programmable DNA-binding protein with a payload slot, separating which locus from what to do there. CRISPRi represses without cutting, giving dose-tunable knockdown that also works on non-coding elements where frameshifts are meaningless; CRISPRa activates and therefore tests sufficiency rather than necessity.

Q: A genome-wide knockout screen reports a whole chromosomal region of "essential" genes with no functional coherence. What happened?
A: Copy-number amplification. Cutting is toxic in proportion to the number of cuts, so guides targeting an amplified region drop out regardless of gene function and the signal tracks copy number rather than biology. Fix it with copy-number-aware normalisation, a cut-number-matched control at inert loci, or CRISPRi, which never cuts.

Q: Why does a headline "62% editing efficiency" not mean 62% knockout cells?
A: Only frameshifting indels knock out, so if 68% of indel alleles have length not divisible by 3, the frameshift allele frequency is 0.62 x 0.68 = 0.4216, and treating a cell's two alleles as independent gives 0.4216^2 = 0.178 biallelic knockouts. Fewer than one in five cells is a true knockout, which is why single-cell cloning or a selectable marker is standard.

Q: The biallelic-knockout calculation assumes a cell's two alleles are hit independently. Which way does that assumption fail?
A: It understates the answer. Cells differ in how much editor they received, so allele outcomes within a cell are positively correlated and the true biallelic fraction exceeds the binomial square; the measured allele frequency is a marginal over an overdispersed cell-level distribution.

## Base editing, prime editing and governance

Q: What is a base editor, and why does it work in non-dividing cells?
A: A deaminase fused to a Cas9 nickase. The R-loop exposes a short single-stranded stretch of the non-target strand and the deaminase chemically converts a base within a window of roughly 4 to 8 nt, counted from the PAM-distal end of the protospacer. There is no double-strand break, no donor template and no dependence on HDR.

Q: Can base editors make any substitution?
A: The conventional deaminase editors install transitions only: a cytosine base editor gives C:G to T:A, and an adenine base editor, whose deaminase was evolved in the laboratory because no natural DNA adenine deaminase exists, gives A:T to G:C. Transversions require prime editing, a nuclease, or the newer glycosylase-coupled editors such as CGBE and AYBE, which are cut-free but lower-efficiency and narrower-window.

Q: Why do adenine base editors address a large share of correctable variants despite the transition-only limit?
A: Spontaneous deamination of methylated cytosine makes G:C to A:T by far the most common class of pathogenic point mutation, and reversing those is exactly an A:T to G:C change. Other real limits remain: bystander editing of every susceptible base in the window, and guide-independent deamination of transiently single-stranded DNA or RNA, which guide-based off-target assays cannot see at all.

Q: How does prime editing write new sequence, and where is its efficiency bottleneck?
A: A Cas9 nickase fused to an engineered reverse transcriptase nicks the PAM-containing strand; the freed 3' end anneals to the primer binding site on the pegRNA, and the RT copies the RT template to make a 3' flap carrying the edit, which displaces the original 5' flap. The bottleneck is the resulting heteroduplex, where mismatch repair decides which strand wins, attacked by nicking the non-edited strand (PE3) and by dominant-negative MLH1 (PE4/PE5).

Q: Why is AAV cargo capacity a design constraint for CRISPR therapy?
A: AAV holds about 4.7 kb in total and the SpCas9 coding sequence alone is about 4.1 kb, so SpCas9 plus guide plus promoters does not comfortably fit. That drives compact orthologues such as SaCas9 and split-vector designs, and AAV's months-to-years expression also means long off-target exposure.

Q: How does Casgevy illustrate the central practical constraint of genome editing?
A: Repairing the causal HBB mutation would require HDR in haematopoietic stem cells, the hard problem. Instead the therapy disrupts the erythroid-specific enhancer in intron 2 of BCL11A ex vivo, de-repressing HBG1 and HBG2 so fetal haemoglobin substitutes for the defective adult protein. A precise-repair problem was re-specified as a break-something problem, because breaking things is what the repair machinery does well.

Q: Do germline and somatic editing differ technically?
A: No. The reagents are identical and only the target cell differs: somatic edits affect the treated person and die with them, while editing an embryo or gamete makes the change heritable. The distinction is legal and ethical, and heritable editing is prohibited by law in more than 70 countries and by the Oviedo Convention.

Q: Name three scientific objections to the He Jiankui embryo-editing experiment that better technique could not have fixed.
A: There was no unmet need, since sperm washing already prevents paternal HIV transmission, so the risk-benefit ratio had no numerator. Mosaicism is intrinsic, because the editor acts while the zygote is dividing and you biopsy cells you discard in order to infer about cells you keep. And the installed change was not the population-tested CCR5 delta-32 allele but novel edits with no human data behind them.

Q: Beyond consent, what biological cost does deleting CCR5 carry?
A: Loss of CCR5 carries elevated susceptibility to some flaviviruses. There is no such thing as a free knockout, which is why an allele with a century of human population data behind it is not interchangeable with a novel indel in the same gene.

Q: Do gene drives spread because they are beneficial, and what stalls them?
A: No, they spread because a drive encodes Cas9 plus a guide against the wild-type allele at its own locus, so HDR copies the drive across in heterozygotes and transmission rises from 50% toward 100%; fitness cost slows invasion but does not stop it. They stall when NHEJ repairs the cut instead, producing an indel that destroys the guide target: a drive-resistant allele, immune to conversion and positively selected.

Q: How do containment designs limit a gene drive, and how far has any of this actually gone?
A: Split drives unlink Cas9 from the guide so the drive cannot spread alone, daisy-chain drives exhaust after a bounded number of generations, and reversal drives are meant to overwrite a released drive; each trades reach for reversibility and none has been demonstrated at ecological scale. No gene-drive organism has been released into the wild as of August 2026.

Q: Why is gene-drive governance a genuinely novel problem rather than an instance of an old one?
A: Because a drive has no geographic containment, can move between hybridising species, and is not recallable, so consent and risk assessment cannot be bounded by a trial site. The Convention on Biological Diversity requires case-by-case risk assessment with the engagement and consent of affected communities, and field programmes so far have used staged releases of non-drive modified mosquitoes.
