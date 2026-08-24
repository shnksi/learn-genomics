# Question bank — Part 03: Genome instability

Covers [Ch 16-20A](../part-03-genome-instability/16-mutation.md).

Convert to Anki: `python reference/to_anki.py question-banks/ --out anki-import.tsv`

## Damage, mutation, and randomness

Q: What is the difference between DNA damage and a mutation, and why does that decide what a cell can fix?
A: Damage is chemically abnormal DNA -- a base that is not one of the four, a break in the backbone, a position where the strands disagree -- and it is detectable because something else still holds the correct answer. A mutation is a chemically normal, correctly base-paired change, so no evidence remains that anything happened. Repair fixes damage; nothing can fix a mutation.

Q: Damage runs at 10^4 to 10^5 lesions per cell per day, but the germline mutation rate is about 10^-8 per base pair per generation. What does that gap tell you?
A: That the mutation rate is a property of DNA repair, not of DNA chemistry. Roughly one lesion in 10^7 ends up as an inherited base change, so the measured mutation rate is the residual left after a stack of error-correcting filters rather than a measure of how often DNA is damaged.

Q: A tumour carries a mutation in a well-known cancer gene. Why does that on its own say nothing about the family's risk?
A: Only germline variants are transmitted to offspring. A somatic mutation sits in one clone and its descendants and dies with the patient, and the only question it raises is whether that clone expands. Separating the two requires sequencing a matched normal tissue alongside the tumour, which is why paired tumour-normal sequencing is the standard design.

Q: Why is the recurrence risk after an apparently de novo dominant mutation about 1% rather than zero?
A: Because the mutation may have arisen early in a parent's development, making that parent a gonadal mosaic: unaffected, negative on a blood test, but carrying the variant in a substantial fraction of their gametes. "De novo in the child" is not the same as "absent from the parental germline".

Q: In what precise sense is mutation random, and what does that claim not assert?
A: Random with respect to fitness: the probability that a particular mutation occurs is unrelated to whether it would be useful, and no channel exists by which usefulness could reach the chemistry. It does not assert uniformity. Rates vary severalfold with sequence context, chromatin state, replication timing and transcription, and by 10 to 50 times at CpG sites. Bacteria under stress raise their mutation rate genome-wide, which changes the supply of variation of all kinds without aiming any of it.

Q: The Luria-Delbruck fluctuation test compares two hypotheses that predict the same mean. What separates them?
A: The variance. If resistance were induced at plating, each cell would convert independently and counts would be Poisson, giving a variance/mean ratio near 1. If mutations arise spontaneously during growth, an early mutation founds an enormous jackpot clone, and variance/mean grows roughly as (pi^2/6) x N / ln N. Independent cultures were wildly overdispersed; aliquots of one culture were not, so resistance was pre-existing.

## The mutation spectrum and its chemistry

Q: If substitutions were chosen uniformly at random, what would the transition/transversion ratio be, and why?
A: 0.5. Each of the four bases can change to three others, giving 12 possible substitutions, of which four are transitions (A to G, G to A, C to T, T to C) and eight are transversions. So the null Ti/Tv is 4/8 = 0.5, against an observed 2.0 to 2.1 genome-wide and 3.0 to 3.3 in exomes -- roughly a fourfold enrichment. Because sequencing errors sit near the null, a callset drifting toward 0.5 is filling with artefacts.

Q: Deamination of cytosine and of 5-methylcytosine are the same reaction on the same functional group. Why is only one of them strongly mutagenic?
A: The rates differ only about twofold; what differs is the detectability of the product. Cytosine deaminates to uracil, which does not belong in DNA, so uracil-DNA glycosylase recognises it unambiguously and base excision repair restores the C. 5-methylcytosine deaminates to thymine, a perfectly normal base, leaving a G:T mismatch that must be resolved by inference from context -- TDG and MBD4 do preferentially excise the T at CpG -- rather than by reading the answer off the chemistry. That repair is intrinsically unreliable in a way uracil excision never is, which is why CpG sites mutate 10-50x faster.

Q: How much of the transition excess does CpG deamination actually account for?
A: About a third. CpG C-to-T is only 15 to 20% of human de novo mutations, and stripping it from a genome-wide spectrum drops Ti/Tv from about 2.1 only to about 1.5 to 1.6, still threefold above the 0.5 null. The remainder is the general geometric ease of transition mispairing -- wobble and tautomeric G-T and A-C pairs -- plus non-CpG cytosine deamination.

Q: Human GC content is about 41%, so CpG should be about 4% of dinucleotides. Observed frequency is about 1%. Why?
A: The hotspot has eaten its own substrate. A few hundred million years of 5-methylcytosine deaminating to thymine has converted CpG sites away at 10 to 50 times the background rate, leaving a roughly fourfold depletion of CpG relative to random expectation.

Q: What is depurination, how often does it happen, and what mutation does it produce?
A: Spontaneous hydrolysis of the bond joining a purine to its sugar, at roughly 10,000 purines lost per mammalian cell per day, leaving an abasic site with no base at all. Base excision repair clears nearly all of them, but a polymerase reaching an unrepaired abasic site tends to insert A opposite it, so a lost G becomes a G-to-T transversion.

Q: Which spontaneous lesion is a main route to transversions, and how does it mispair?
A: Oxidation of guanine to 8-oxoguanine by reactive oxygen species from ordinary metabolism. 8-oxoguanine can rotate into a conformation that pairs with A, giving G:C to T:A transversions. The same chemistry produces the OxoG artefact in sequencing libraries oxidised during preparation.

Q: Why do microsatellites mutate four to five orders of magnitude faster than the point-mutation rate?
A: Strand slippage. At a tandem repeat the nascent strand can detach and re-anneal out of register, because the template offers many equally good re-annealing positions, so the tract gains or loses one repeat unit. That gives roughly 10^-3 to 10^-4 per locus per generation against about 10^-8 per base per generation for point mutations, which is what made microsatellites the workhorse markers of linkage mapping and forensic profiling.

Q: Why is a synonymous variant not automatically silent?
A: It can destroy an exonic splicing enhancer or create a cryptic splice site, which is the commonest route to a pathogenic synonymous variant. It can also change translation speed and hence co-translational folding, alter mRNA structure and stability, and may not be synonymous at all in another isoform. Treating the class as null is a modelling convenience, occasionally a clinically consequential error.

Q: Do mutagens create classes of mutation the cell would never otherwise see?
A: No. They raise the rate of lesion classes the cell already handles, with a characteristic bias: UV welds adjacent pyrimidines giving C-to-T and the diagnostic CC-to-TT tandem change, alkylating agents give heavily biased G:C to A:T transitions, and intercalators give plus-or-minus one base pair frameshifts. The bias is exactly what makes mutational signatures readable, but the chemistry is the same.

Q: Repeat expansions in HTT and FMR1 are the same class of mutation. Why do they have opposite molecular logic?
A: Location decides. In HTT the CAG repeat sits in coding sequence and is translated into a long polyglutamine tract that makes the protein aggregate -- a gain of toxic function. In FMR1 the expanded CGG tract in the 5' UTR becomes methylated and silences the gene -- a loss of function.

Q: Why does anticipation follow mechanically from repeat expansion, and why was scepticism about it methodologically correct?
A: Above a threshold length the tract forms hairpin and slipped-strand structures that escape correction, so the mutation rate becomes a function of current allele length: the tract grows through transmission and onset age correlates inversely with length. The scepticism was right in principle, because ascertaining families through an affected child manufactures apparent anticipation from nothing; only molecular measurement of repeat length could show that here it was real.

Q: How is a tumour's somatic mutation catalogue encoded so that mutational signatures can be extracted from it?
A: As counts over 96 channels: 6 substitution classes referenced to the pyrimidine of the pair (C-to-A, C-to-G, C-to-T, T-to-A, T-to-C, T-to-G) times 4 possible 5' neighbours times 4 possible 3' neighbours, so each tumour becomes a 96-vector. Stack many such vectors into a matrix and factorise it by non-negative matrix factorisation; the recovered components are the signatures, each a characteristic 96-channel profile present in a given tumour at some exposure level.

Q: Which mutational processes can be read straight off a tumour's 96-channel spectrum, and which of them is clinically actionable?
A: C-to-T at CpG accumulating linearly with age, which is the 5-methylcytosine deamination clock; C-to-T at dipyrimidines with CC-to-TT tandems, which is UV and shows up in melanoma; C-to-A in the lung tumours of smokers, which is tobacco adducts; and distinctive profiles for APOBEC enzyme activity and for homologous-recombination deficiency in BRCA1/BRCA2-mutant tumours. The last is the actionable one. The spectrum is invertible precisely because each chemical mechanism produces a biased, context-dependent set of changes.

## The mutation rate, derived

Q: Using the pinned germline rate, derive the expected number of de novo point mutations in a child.
A: A human diploid genome is about 6.2 x 10^9 bp (2 x 3.1 Gb). At 1.1 to 1.3 x 10^-8 per bp per generation: 1.1e-8 x 6.2e9 = 68 and 1.3e-8 x 6.2e9 = 81. So roughly 68 to 81 new point mutations that neither parent carried.

Q: Trio studies report about 60 to 70 de novo mutations, below the predicted 68 to 81. Why is that gap informative rather than an error?
A: Short-read trio studies can only call variants in the callable fraction of the genome, excluding centromeres, segmental duplications and long repeats -- on the order of 10 to 15% of the sequence, and also the fastest-mutating part. 0.85 x 80.6 = 68.5, which lands on the reported range. The naive product is the true number; the reported number is the true number minus what the technology cannot see.

Q: Why can a replication fidelity of 10^-9 to 10^-10 not be compared directly with a germline rate of 1.1 to 1.3 x 10^-8?
A: The units differ. Fidelity is per base per replication; the germline rate is per base per generation, summing hundreds of germline cell divisions and also including unrepaired chemical damage that was never a polymerase error. They differ by about 100-fold and are not the same quantity.

Q: A 45-year-old and a 25-year-old each father a child. How many more de novo point mutations, and does the same logic transfer to maternal age?
A: At about 1.3 to 1.5 extra de novo mutations per year of paternal age, twenty extra years gives roughly 20 x 1.4 = 28 more, on a baseline near 70 -- about a 40% increase, consistent with ~80% of de novo mutations being paternal. It does not transfer: maternal age is the dominant risk factor for aneuploidy, a segregation failure in oocytes arrested since fetal life, not for point mutations.

Q: Early cancer-driver scans flagged large, late-replicating, lowly expressed genes such as TTN and the olfactory receptors. What was wrong, and what does the fix have to do with repair?
A: The background mutation model was genome-uniform. Somatic mutation density varies severalfold at megabase scale, tracking repair access rather than damage chemistry -- the heterochromatin mark H3K9me3 alone explains over 40% of that variance, and combined chromatin features over 55%. The fix is to model replication timing, expression and chromatin as covariates, and the same caution applies to any genome-wide test for more mutations than expected, including tests of selection.

## Repair pathways by lesion type

Q: Biology has exactly two sources of redundancy for repairing DNA. What are they, and why does that make double-strand breaks special?
A: The complementary strand, which survives any single-strand damage and can be read across, and the sister chromatid, which exists only after replication. A double-strand break destroys both strands at once, so the first redundancy is gone and the only template left is the sister -- which is why break repair is strange, and why homologous recombination is confined to S and G2.

Q: Photolyase splits UV pyrimidine dimers using the energy of a single blue-light photon. Why does that not help you?
A: Placental mammals lost the enzyme. It is present in bacteria, plants, fungi, insects, fish and marsupials, but every UV dimer in your skin must go through the far more expensive nucleotide excision pathway or be bypassed by a translesion polymerase.

Q: Why is MGMT described as a suicide enzyme, and what clinical consequence does that have?
A: MGMT removes a methyl group from the O6 position of guanine by transferring it onto one of its own cysteines, which irreversibly inactivates the protein -- one protein molecule consumed per lesion, not a catalyst at all. Clinically, glioblastomas that express MGMT mop up temozolomide-induced O6-methylguanine and survive, while tumours that have silenced MGMT by promoter methylation respond, making MGMT promoter methylation a routine predictive biomarker.

Q: Base excision repair handles the highest-volume damage. What is its organising design, and why is the pathway a committed hand-off chain?
A: Recognition is outsourced to a family of about eleven DNA glycosylases, each recognising one kind of damaged base and nothing else -- a dispatch table keyed on lesion type, with UNG for uracil, OGG1 for 8-oxoguanine, MUTYH for adenine opposite 8-oxoguanine, TDG for thymine opposite G. The intermediates are more dangerous than the original lesion (an abasic site, then a nicked backbone), so each enzyme recruits the next and the intermediate is never released.

Q: Nucleotide excision repair handles UV dimers, tobacco adducts and cisplatin crosslinks with one recognition mechanism. How?
A: It recognises a structural property rather than a chemical one -- a lesion that distorts the helix and disrupts base pairing -- so its substrate scope is effectively unlimited, which is why it is the pathway for essentially every environmental carcinogen. Global-genome NER patrols with XPC-RAD23B; transcription-coupled NER is triggered by RNA polymerase II stalling. Both converge on TFIIH and excise a 24 to 32 nucleotide oligomer containing the damage.

Q: Xeroderma pigmentosum patients have over 10,000-fold increased skin cancer risk; Cockayne syndrome patients also have an NER defect but essentially no cancer excess, instead showing neurodegeneration and premature ageing. Reconcile this.
A: Not by a tidy branch-versus-branch split -- five of the seven XP groups lose core incision factors and are deficient in both branches. What differs is the fate of the cell after repair fails. In XP the lesions are tolerated and bypassed by error-prone polymerases in cells that keep dividing, producing mutations and cancer; in Cockayne syndrome a persistently stalled RNA polymerase is a potent apoptotic and senescence signal, so cells die or arrest. A repair defect causes cancer only in cells that survive it.

Q: Mismatch repair faces a problem no other pathway has. State it, and say how bacteria and eukaryotes solve it.
A: After a replication error both bases are chemically normal; there is no damage, only a disagreement. Excising the parental base fixes the mutation permanently, so a strand-blind system would be actively mutagenic in half of all events. E. coli uses delayed Dam methylation of GATC sites, so MutH nicks the still-unmethylated nascent strand. Eukaryotes use the discontinuity of new DNA: MutL-alpha (MLH1-PMS2) carries a latent endonuclease activated by PCNA, which is loaded at the fork with a defined orientation and therefore carries the strand information.

Q: What makes microsatellite instability the cleanest example in medicine of a broken pathway leaving a machine-readable fingerprint?
A: Without mismatch repair, polymerase slippage at short tandem repeats goes uncorrected, so every microsatellite in the tumour drifts to a new length -- readable by comparing tumour against normal at a five-marker panel or across hundreds of loci in sequencing. It also determines treatment: mismatch-repair-deficient tumours accumulate huge mutation burdens and therefore many neoantigens, and pembrolizumab's 2017 approval for MSI-high tumours regardless of tissue of origin was the first tissue-agnostic cancer indication ever granted.

Q: Translesion synthesis is called damage tolerance rather than repair. Why, and what is the price?
A: Because the lesion is still there afterwards. RAD6-RAD18 monoubiquitinates PCNA, swapping the replicative polymerase for a Y-family enzyme with an open active site and no proofreading, error rates of 10^-1 to 10^-3, which inserts a few bases across the lesion and hands back. The cell buys fork progression -- a stalled fork left long enough collapses into a double-strand break -- at the price of mutations, and limits the cost by using the sloppy enzyme for only a few nucleotides.

## Double-strand breaks, BRCA and PARP inhibitors

Q: Non-homologous end joining is error-prone. Why is it the cell's default rather than a fallback?
A: Because a chromosome with a small indel is enormously better than a chromosome in two pieces. Ku70/80 is among the most abundant nuclear proteins and binds free ends within seconds, and the pathway works in every phase of the cycle in minutes rather than hours. The cell even exploits the imprecision: V(D)J recombination uses junctional sloppiness as a source of antibody diversity, which is why NHEJ deficiency causes radiosensitive severe combined immunodeficiency.

Q: Both DSB repair pathways see the same substrate. What single step commits the cell to one of them?
A: Resection -- whether to chew back the 5' ends and expose 3' single-stranded tails. Once the ends are single-stranded, Ku cannot bind and NHEJ is off the table; RPA coats the tails, BRCA2 loads RAD51, and homology search begins. Regulating resection is therefore identical to regulating pathway choice.

Q: Homologous recombination is restricted to S and G2. Is that a regulatory policy, and what enforces it?
A: It is enforced physically. Resection requires CDK activity, which is low in G1 and high from S phase onward, to phosphorylate CtIP and EXO1. The signal that licenses HR is the same signal that guarantees a sister chromatid exists to recombine with, so the cell never has to check. (Mitosis shows the gate is not simply high CDK: CDK1-cyclin B peaks in M, and the block moves downstream to RAD51 loading, with breaks deferred to the next G1.)

Q: Which two proteins set DSB pathway choice by antagonising each other, and in which direction does each push?
A: 53BP1, with RIF1 and the shieldin complex, binds break-adjacent chromatin and blocks resection, protecting the ends for NHEJ. BRCA1-BARD1 displaces 53BP1 and licenses resection, working with MRN and CtIP to start it and EXO1/DNA2-BLM to extend it.

Q: Derive the synthetic-lethality argument behind PARP inhibitors, and say where the therapeutic window comes from.
A: Two genes are synthetically lethal if losing either alone is survivable but losing both is not. BRCA carriers are germline heterozygous, and the tumour arises when the second allele is lost somatically -- so the tumour is HR-deficient while every normal cell in the patient is HR-proficient. Inhibiting PARP1 kills only cells that have already lost BRCA. The window exists before any drug is given.

Q: PARP inhibitors are often described as switching off a repair pathway. What is wrong with that description?
A: Cytotoxicity tracks the drug's ability to trap PARP1 on DNA as a physical protein-DNA roadblock far better than it tracks catalytic inhibition. Talazoparib and veliparib are comparable catalytic inhibitors yet differ about 100-fold in potency, following trapping. If the mechanism were catalytic inhibition the class would be equipotent, and it is not.

Q: A BRCA1-mutant tumour relapses on olaparib with biallelic loss of 53BP1. Why would the same event not rescue a BRCA2-mutant tumour?
A: BRCA1's essential HR function is to antagonise 53BP1-RIF1-shieldin and license resection, so with 53BP1 gone resection proceeds without BRCA1 and HR is restored. BRCA2 acts downstream, loading RAD51 onto RPA-coated ssDNA, so deleting 53BP1 in a BRCA2-null cell produces beautifully resected ends that still cannot form a RAD51 filament. The asymmetry is the cleanest proof that the two genes act at different steps.

Q: ATM and ATR are the two apical damage-response kinases. What does each actually sense, and why is ATR the general replication-stress kinase?
A: ATM is activated at frank double-strand breaks, sensed by the MRN complex (MRE11-RAD50-NBS1). ATR is activated by RPA-coated single-stranded DNA through ATRIP, and single-stranded DNA appears both at resected breaks and at stalled forks -- so a fork that stalls signals through ATR whether or not a break exists. ATM then works through CHK2 and ATR through CHK1, both inactivating the CDC25 phosphatases so CDK activity falls and the cycle arrests.

Q: One double-strand break produces a nuclear focus spanning megabases and visible down a microscope. What makes a single lesion that big?
A: Positive feedback written onto chromatin. ATM phosphorylates the histone variant H2AX to gammaH2AX, which spreads over up to megabases of chromatin flanking the break; MDC1 binds gammaH2AX and recruits more MRN and more ATM, which phosphorylates more H2AX. That amplification is what turns one lesion into a genome-wide signal, and it is why counting gammaH2AX foci is the standard microscopic readout for counting breaks.

Q: Does p53 repair DNA?
A: No. p53 is a transcription factor at the end of the damage-signalling chain and never touches a lesion. Downstream of ATM/ATR and CHK1/CHK2 it decides fate: p21 for arrest and repair, permanent arrest for senescence, or PUMA/NOXA/BAX for apoptosis. A cell that loses p53 does not repair worse -- it stops caring, and proceeds through the cycle with damaged DNA.

## Meiotic recombination, hotspots and NAHR

Q: In what sense is meiotic recombination not merely a process that borrows repair proteins?
A: It is the repair pathway itself, deliberately triggered, with its template preference reversed and its outcome bias inverted. A somatic cell repairs from the identical sister chromatid and suppresses crossovers; meiosis makes the breaks on purpose, blocks sister repair, forces copying from the homolog, and directs the outcome toward crossover.

Q: SPO11 knockouts are sterile and their chromosomes fail to pair. Why is a break-making enzyme required for pairing?
A: Because the resected single-stranded tail is the homology probe. Pairing is achieved by several hundred RAD51/DMC1 filaments each searching for complementary sequence, finding it on the homolog, and thereby tethering the chromosomes at many points, which nucleates synapsis. No breaks, no probes, no pairing -- the damage is the search mechanism.

Q: What is the difference between SDSA and DSBR resolution in terms of what the products look like?
A: In SDSA the extended invading strand is stripped back out of the D-loop and anneals to the other broken end, so the duplexes are never covalently joined and flanking markers are not exchanged -- a non-crossover with a gene conversion tract. In DSBR the second end is captured, forming a double Holliday junction, whose resolution can exchange the flanking markers and give a crossover. Both leave the same conversion patch at the break site.

Q: Why is "half of double Holliday junctions resolve as crossovers" a poor description of meiosis?
A: It describes the geometry, not the biology. Most non-crossovers never form a junction at all, exiting earlier by SDSA, and junctions that do form in meiosis are pre-designated by MutS-gamma (MSH4-MSH5) and resolved by MutL-gamma (MLH1-MLH3) almost exclusively toward crossover. About 250 breaks per human meiocyte give about 50 crossovers, so 80 to 90% of programmed breaks resolve as non-crossovers.

Q: Why is gene conversion, not crossing over, the most common thing that happens to a heterozygous site in meiosis?
A: Because the few hundred base pairs around each break are destroyed on the cut chromatid and rebuilt by copying the homolog -- a non-reciprocal overwrite that occurs at every one of the ~250 breaks, most of which are non-crossovers. In humans conversion tracts are roughly 50 to 1,000 bp, and any given base is converted at about 5.9 x 10^-6 per generation, several hundred times the point-mutation rate of about 1.3 x 10^-8.

Q: A selection scan flags a rapidly evolving non-coding region in the top decile of recombination rate, with substitutions overwhelmingly AT to GC. What is your first objection?
A: GC-biased gene conversion. When heteroduplex mismatch repair meets a G:T or A:C mismatch it preferentially restores the G:C pair, and pedigree measurement shows the GC allele transmitted about 68% of the time instead of 50%. That is a transmission bias with the same mathematical form as weak directional selection but nothing to do with fitness, and it produces exactly this signature -- accelerated, GC-skewed substitution concentrated in high-recombination sequence.

Q: Why must every bivalent receive at least one crossover, and what does a Poisson model predict if placement were random?
A: Because the chiasma, held by cohesion distal to the exchange, is the only physical link between homologs at metaphase I -- without it the spindle has nothing to pull against and the two univalents segregate at random. Human male meiosis averages about 2.26 crossovers per bivalent, so under Poisson e^-2.26 = 0.104 of bivalents would get none, only 8% of meioses would have all 23 chiasmate, and the euploid-gamete rate would be about 29%. Real aneuploidy is far rarer, so assurance is enforced, not lucky.

Q: State the hotspot paradox and its resolution.
A: The chromosome that is cut is the one that loses its sequence, so a chromosome carrying an intact PRDM9 binding motif is cut, repaired from the homolog, and has the motif converted to the disrupted version. An active hotspot allele destroys itself at a rate proportional to how well it works -- yet hotspots are everywhere and strong. The resolution is that hotspots are not persistent, only the system that makes them is: PRDM9's zinc-finger array is a rapidly mutating minisatellite under strong positive selection, so new specificities keep arising. Human and chimpanzee hotspot maps essentially do not overlap.

Q: Are recombination hotspots encoded in the DNA sequence?
A: Not by the sequence alone -- hotspot position is a property of a protein's binding preference, not of the locus. In humans and mice they are specified by where PRDM9 binds and deposits H3K4me3 and H3K36me3, which then directs SPO11. Different PRDM9 alleles give different hotspot maps, so two people can have measurably different recombination landscapes. Species that lost PRDM9 -- dogs, birds, crocodilians -- target recombination to CpG islands and promoters instead, and their hotspot positions are evolutionarily stable.

Q: Why do NAHR-driven deletions recur at the same breakpoints in unrelated patients, when most structural variants do not?
A: Because the breakpoint is not chosen by chance: it falls wherever two low-copy repeats align, and those repeats are fixed features of the genome present in everyone. Every independent event at that locus therefore produces essentially the same rearrangement, resolvable only to within the repeat length. Variants formed by end joining or replication-based template switching have breakpoints set by where a fork happened to collapse, so they are non-recurrent and patient-specific.

Q: NAHR at 17p12 produces two different diseases. Explain how one mechanism gives both.
A: A 1.4 Mb segment containing PMP22 is flanked by 24 kb repeats sharing about 98.7% identity. Misaligned crossover between them deletes the segment on one product and duplicates it on the reciprocal product, in the same event. Three copies of PMP22 cause Charcot-Marie-Tooth disease type 1A and one copy causes hereditary neuropathy with liability to pressure palsies -- a pure gene-dosage effect with identical protein sequence throughout.

## Site-specific and transpositional recombination

Q: Homologous, site-specific and transpositional recombination are three unrelated chemistries. Separate them by homology requirement and by product.
A: Homologous recombination needs extensive homology, hundreds of base pairs, located by base pairing during a RAD51/DMC1/RecA homology search, and its product is a crossover or a gene conversion between allelic copies. Site-specific recombination needs no homology search at all, only a short defined site bound by a tyrosine or serine recombinase, and its product is integration, excision or inversion between those defined sites -- phage lambda attP/attB, Cre-lox, V(D)J. Transpositional recombination needs no homology either: a transposase binds the element's own ends and the element is copied or moved to a new location.

Q: What stops RAG1/RAG2 from joining one V segment to another V segment?
A: The 12/23 rule. Each V, D and J segment is flanked by a recombination signal sequence -- a conserved heptamer CACAGTG, a spacer of exactly 12 or 23 bp, and a nonamer ACAAAAACC -- and RAG1/RAG2 will only join a 12-spacer site to a 23-spacer site, which is what enforces V-to-J rather than V-to-V joining. RAG cuts at the heptamer border leaving hairpinned coding ends, opened by Artemis and joined by non-homologous end joining, so a programmed break is deliberately repaired by the error-prone pathway because here the errors are the point.

## Transposable elements

Q: Class I and Class II elements differ in more than their intermediate. Why does Class I dominate the human genome?
A: Class II DNA transposons cut and paste, so transposition is copy-number-neutral by default -- the element leaves one site and arrives at another. Class I retrotransposons are transcribed and a new copy inserted while the original stays, so every success is strictly additive. Given tens of millions of years and no ceiling other than host defence, the unbounded copying process wins, and human DNA transposons have been extinct for about 37 million years.

Q: Derive the diagnostic signatures of an L1 insertion from target-primed reverse transcription rather than memorising them.
A: ORF2p nicks one strand at a degenerate T-rich site, the L1 mRNA's poly(A) tail anneals to the exposed T tract and primes reverse transcription, and a staggered second nick 7 to 20 bp away on the other strand is filled in during second-strand synthesis. That gives flanking direct repeats of 7 to 20 bp (the stagger), a poly(A) tail at the insert's 3' end (it was the primer), and near-universal 5' truncation (synthesis runs from the 3' end, so interruption leaves the 5' end unmade).

Q: Why do about 500,000 L1 copies yield only 80 to 100 that can still move?
A: Two mechanical causes. TPRT builds the copy 3'-end-first, so the default failure mode deletes the 5' UTR, which contains L1's own promoter -- what cannot be transcribed cannot copy itself again, and only a few thousand copies are full length. Then every landed copy is ordinary neutral sequence accumulating substitutions at about 1.1 to 1.3 x 10^-8 per bp per generation, and one nonsense or frameshift change in either ORF kills it.

Q: Alu encodes no protein and depends entirely on L1's ORF2p, yet outnumbers L1 roughly two to one. How?
A: Copy number measures replicative success, not autonomy. Alu carries an internal RNA polymerase III promoter that travels with every copy, so a new insertion is immediately transcription-competent; being 7SL-derived it localises near translating ribosomes where ORF2p is newly made, letting it intercept the protein despite L1's cis preference; and a 300 bp insertion is far less likely to disrupt something than a 6 kb one, so more copies survive selection.

Q: Name the three distinct ways transposable elements cause human disease, with an example of each.
A: Insertional inactivation -- a de novo L1 into exon 14 of F8 causing haemophilia A, found by Kazazian in 1988 in two of 240 patients. Non-allelic homologous recombination between dispersed copies -- Alu-Alu deletions in LDLR, MSH2, BRCA1 and VWF, which requires no element to be active. And exonisation -- in OAT, one point mutation created a 5' donor site inside an intronic antisense Alu, splicing a 142-nt Alu-derived exon into the mRNA and causing gyrate atrophy.

Q: The piRNA system builds its targeting information from TE fragments captured in piRNA clusters. What makes that a good design, and what is its failure mode?
A: It updates itself without the host needing to know in advance what a transposon is: any element inserting into a cluster automatically becomes the template for piRNAs silencing its whole family, and because the cluster is genomic the update is heritable. The failure mode is a family with no representation in any cluster. Hybrid dysgenesis in Drosophila is the demonstration -- a P-element-free mother crossed to a P-carrying father gives offspring whose maternally deposited piRNA pool matches nothing in P, which then transposes unchecked.

Q: Syncytin is essential to the human placenta and is a retroviral env gene. Does that mean the ancestral infection was beneficial?
A: No. Selection has no foresight and cannot preserve a currently useless sequence against future utility. A germline integration became fixed, the env protein happened to be a membrane-fusion machine, and a lineage expressing it in trophoblast gained a function that ordinary selection then maintained. The decisive evidence is that this happened independently in at least six mammalian lineages with different retroviruses -- contingency, not design.

Q: McClintock published transposition in 1950 and the field would not have it. Why is "she was dismissed for being a woman" too simple to be useful?
A: Her standing was already high: she was elected to the National Academy of Sciences in 1944 and became the first woman president of the Genetics Society of America in 1945, both before the transposition work, and she was securely funded throughout. The resistance was substantive -- a mobile element does not modify the beads-on-a-string model, it breaks the fixed-locus premise on which the field's entire mapping methodology rested; the evidence was maize cytogenetics few could evaluate just as the field moved to phage and E. coli; and she called them controlling elements that regulate expression, a second unacceptable claim stacked on the first and ahead of the operon.

Q: Which arm of transposable-element defence shows the clearest Red Queen dynamic, and what does one turn of the cycle look like?
A: The KRAB zinc-finger proteins -- about 350 of them, the largest human transcription factor family, mostly clustered on chromosome 19. Each recognises a TE family and recruits TRIM28/KAP1, which brings in SETDB1 to lay down H3K9me3 and convert the locus to heterochromatin. Element copies that mutate out of recognition then replicate freely, so the KZFP locus duplicates and its DNA-contacting residues evolve rapidly to re-cover the escapees, and KZFP clusters expand and turn over at a rate tracking the arrival of new TE families.

Q: Besides syncytin, what is the strongest case that a transposon has been domesticated, and what clinches it?
A: RAG1/RAG2. V(D)J recombination is run by a transposase domesticated from a RAG-like, Transib-related DNA transposon, and the recombination signal sequences it recognises are that transposon's terminal inverted repeats. The clincher is ProtoRAG in the lancelet: an intact ancestral element with convergently oriented RAG1-like and RAG2-like genes between terminal inverted repeats, still capable of excision and transposition. The adaptive immune system is a cut-and-paste transposon aimed at a single locus.

Q: Why is 46% best treated as a lower bound on human transposable-element content?
A: Because it is set by detection sensitivity. A copy that landed hundreds of millions of years ago has been decaying by point mutation ever since and eventually stops being recognisable as TE-derived. The measured fraction has risen every time alignment sensitivity or assembly completeness improved -- GRCh38 gives about 45%, and T2T-CHM13, which resolved the centromeres and acrocentric short arms, gives about 46%.

## Chromosome abnormalities and structural variation

Q: What are the only two things you can do to a genome at megabase scale, and what is the dominant consequence of each?
A: Change how many copies of a region exist, or change where the regions sit. Copy number is a dosage problem: transcript output roughly tracks gene copy number, and shifting a few hundred genes at once will catch some that are dosage-sensitive, so the damage is combinatorial. Position is a pairing problem: the carrier's dosage is normal, but meiosis must align homologous sequence, and a different layout forces that alignment into a configuration whose crossover products are broken.

Q: A patient carries a balanced reciprocal translocation. What is their risk?
A: Reproductive, not phenotypic. They have no dosage abnormality and are typically healthy; the hazard appears at meiosis, where the quadrivalent yields balanced gametes only from alternate segregation. The usual presentation is recurrent miscarriage rather than an affected child, and roughly 2 to 5% of couples with recurrent pregnancy loss have a balanced rearrangement in one partner. One exception: about 6% of de novo apparently balanced translocations do carry a phenotype -- a breakpoint inside a gene, a position effect, or cryptic imbalance the karyotype could not see. Inherited ones far less often, for ascertainment reasons.

Q: Trisomy 21, 18 and 13 reach live birth. Why is "small chromosomes are survivable" the wrong explanation?
A: Chromosome 19 is about 59 Mb -- smaller than chromosome 13 at about 114 Mb -- yet carries about 1,400 protein-coding genes against 320, and trisomy 19 is never seen at term. The survivable trisomies are the gene-poorest, not the shortest: severity scales with the number of dosage-sensitive genes displaced, not with base pairs. Chromosomes 13 and 21 are also acrocentric, so their short arms are rDNA already in high copy number.

Q: A trisomy 21 child is genotyped at a marker close to the chromosome 21 centromere. Mother A/B, father C/C, child A/A/C. What does that mean, and how confident should you be?
A: Two copies of the same maternal allele is the centromere-homozygous signature, classically read as MII nondisjunction; three different alleles would be centromere-heterozygous and read as MI. Confidence should be moderate: the inference assumes no crossover between marker and centromere, and one crossover swaps the signatures, so real studies genotype a panel. Much of the apparent MII class is now thought to arise from premature separation of sister chromatids during MI.

Q: Is nondisjunction a structureless accident? Use trisomy 21 to answer.
A: No, it is highly structured. About 90% of trisomy 21 cases are maternal in origin and roughly 70 to 80% of those carry the meiosis I signature. MI-origin cases show markedly reduced or absent recombination on the nondisjoined chromosome, and centromere-homozygous cases show an excess of pericentromeric exchanges, which entangle centromeres rather than clamping arms. Crossover placement, fixed decades before the error occurs, is a risk factor for it.

Q: A woman carries a der(14;21) Robertsonian translocation. Enumerate her gametes, and say why the naive recurrence risk is wrong.
A: The trivalent segregates 2:1, and three choices of which object travels alone times two poles gives six gamete classes. Three are lethal and never present as pregnancies (monosomy 21, trisomy 14, monosomy 14); of the three viable classes one gives a balanced carrier, one a chromosomally normal child and one translocation Down syndrome, so the naive risk is 1 in 3. Observed recurrence is 10 to 15% for a female carrier and under 5% for a male, because segregation is not uniform, selection continues after conception, and spermatogenesis filters unbalanced products far more harshly than oogenesis.

Q: Does mosaicism simply mean a milder version of the same syndrome?
A: Not only. It arises post-zygotically by mitotic nondisjunction, anaphase lag or trisomy rescue, and it can make otherwise-lethal karyotypes survivable at all. Phenotype tracks the abnormal fraction, and that fraction varies tissue by tissue, which makes the sampled tissue decisive: a normal blood karyotype does not exclude 40% abnormal fibroblasts. Confined placental mosaicism, an abnormal line in the placenta only, occurs in roughly 1 to 2% of chorionic villus samples, which is why an abnormal CVS is confirmed by amniocentesis.

Q: Derive the maternal age effect for aneuploidy from mechanism rather than memorising the risk table.
A: Human oocytes enter prophase I in fetal life and arrest there, and sister-chromatid cohesion is provided by cohesin loaded before that arrest with no measurable replenishment. Cohesin is therefore a decaying resource: lose it distal to a chiasma and the bivalent falls into two independently segregating univalents, lose it at the centromere and sisters separate prematurely. Bivalents with few or badly placed crossovers cross the threshold first, so recombination pattern and cohesin decay multiply, which is why the curve accelerates rather than rising linearly.

Q: An extra X is compatible with an unremarkable life; an extra chromosome 19 is not compatible with birth. What accounts for the gap?
A: X inactivation buffers X dosage -- the rule is keep one and silence the rest, so 47,XXX silences two, using machinery that had to exist anyway. And the Y carries only a few dozen genes, mostly multi-copy testis-specific ones, against roughly 800 on the X. The buffering is incomplete, and the residue is the phenotype: about 15% of X-linked genes escape inactivation reliably, and escapees with a Y homologue such as SHOX have a normal dose of two in both sexes, which is why 45,X is genuinely haploinsufficient for them.

Q: A man with a large paracentric inversion has no miscarriages and two healthy children. Does that mean crossovers never occur inside the inversion?
A: No -- it means their products never become pregnancies. A crossover inside a paracentric loop gives one dicentric chromatid, pulled to both poles and broken, and one acentric fragment that goes nowhere and is lost, so both self-destruct before conception. A pericentric inversion is different: its crossover products each carry one centromere and a duplication of one flank plus a deletion of the other, and those do form conceptuses.

Q: A couple with four first-trimester losses have normal chromosomal microarrays. What has not been ruled out, and what would you order?
A: Microarrays detect imbalance only, and are blind to all balanced rearrangements -- reciprocal translocations and inversions, which are exactly the findings that explain recurrent loss because the carrier is balanced and only the conceptuses are not. Order a G-banded karyotype on both partners. Microarray has roughly 100 times the resolution and is still the wrong assay: resolution and coverage are different axes, so choose by hypothesis.

Q: Are copy number variants pathogenic by nature?
A: No. Roughly 4.8 to 9.5% of the genome is copy-number variable among healthy people, around 100 genes can be homozygously deleted with no apparent consequence, and CNVs account for more differing base pairs between two people than all their SNVs combined. Pathogenic CNVs are the tail of that distribution, enriched over dosage-sensitive genes and across intervals large enough to catch several at once.

Q: How would you tell chromothripsis from gradual accumulation of rearrangements, using only the sequence data?
A: Under a single catastrophic event you expect copy number oscillating between just two states along the chromosome, breakpoints clustered far more tightly than uniform, join orientations uniformly distributed over the four possibilities, and retained heterozygosity in surviving fragments -- there was no time for a second hit. Progressive rearrangement gives many copy-number states and scattered breakpoints. In the PCAWG pan-cancer set the signature appears in about 29% of tumours on high-confidence calls.

Q: Uniparental disomy leaves normal copy number and all the sequence present. Why does it cause disease, and how does trisomy rescue produce it?
A: Two routes. Imprinted loci break, because expression there depends on parental origin: two maternal copies of a paternally expressed gene give zero expression from two intact copies, which is how maternal UPD15 causes Prader-Willi syndrome. And isodisomy makes a whole chromosome homozygous, so one carrier parent's recessive variant becomes homozygous in the child. A trisomic zygote that drops one of its three chromosomes picks the odd-parent copy one time in three, and trisomy is common, so UPD is not rare.

## Bacterial crosses: selection and the three transfer routes

Q: In a bacterial cross, what replaces counting progeny, and what then sets the sensitivity of the experiment?
A: Selection. You design a medium on which only the class you want can grow -- prototrophy on minimal medium is selectable with essentially zero background, since only cells that acquired the wild-type allele form colonies -- spread 10^9 cells, and count what appears. Sensitivity is therefore set by how many cells fit on a plate rather than by how many progeny you are willing to score. The background is not quite zero: an auxotroph reverts, so the control everyone forgets is plating each parent alone at the same density.

Q: A resistance determinant transfers from one strain to another on mixing. DNase in the medium does not block it; a filter between the cultures does. Which route is it, and what has each control ruled out?
A: Conjugation. DNase-resistance rules out transformation, because naked DNA crossing the medium would be destroyed while a capsid protects its cargo. Blockade by the filter rules out transduction, because a phage particle passes straight through and a cell-free filtrate would still transfer. What remains needs cell-to-cell contact -- Davis's 1950 U-tube control, which is what showed Lederberg-Tatum recombination required contact while Zinder and Lederberg's Salmonella case did not.

## Transformation and the identification of the genetic material

Q: Avery, MacLeod and McCarty identified the transforming principle as DNA in 1944 and were widely disbelieved. Was that just scientific conservatism?
A: No -- the objection was specific and not unreasonable. Levene's tetranucleotide hypothesis had convinced the field that DNA was a monotonous repeat incapable of carrying information, while protein had twenty letters, and a trace protein contaminant in the preparation could not be formally excluded. Hershey and Chase answered it in 1952 with a second system rather than better chemistry: their 35S/32P blender separation is incomplete and less rigorous chemistry than Avery's, but it landed in a field already softened up. Avery's experiment proved it; Hershey-Chase convinced people.

Q: Haemophilus influenzae Rd carries 1,471 copies of the 9-mer AAGTGCGGT. Why is that a filter rather than a coincidence, and what does it filter for?
A: Do the null calculation: the genome is 1,830,138 bp, so a given 9-mer is expected 1.83 x 10^6 / 4^9 = about 7 times per strand. Against that baseline 1,471 copies is a hundredfold enrichment, and because the uptake machinery prefers DNA carrying the sequence it biases uptake toward conspecific DNA -- the DNA most likely to recombine usefully. Neisseria meningitidis does the same with 1,891 copies of its own 10-mer GCCGTCTGAA, which is one of the two features marking natural competence as evolved rather than accidental.

## Conjugation, Hfr strains and the minute map

Q: Why does an Hfr x F- cross almost never leave the recipient F+, when an F+ x F- cross converts nearly the whole recipient population?
A: Because integration splits F and puts most of it at the far end of the transferred chromosome, so the recipient would have to receive the entire chromosome before the trailing half of F arrives, and mating pairs break spontaneously long before that -- which is exactly why an Hfr donates a gradient rather than a genome. In F+ x F- the whole plasmid moves by rolling circle from oriT and both cells end up with a complete F, but essentially no chromosomal genes move, which is why that cross is not the source of recombinants.

Q: Interrupted mating gives each marker a time of entry. What licenses reading that time as a position, and why can absolute times not be used as coordinates?
A: The strand is pumped through the mating junction at a constant rate, so position is an affine function of entry time -- that is the whole argument, and it has a checkable consequence: the intercept is not zero, because every curve is displaced by a few minutes of pair formation and initiation. Absolute times are therefore not positions; only differences in entry time are proportional to differences in position, so the map is calibrated on intervals and never on the clock reading.

Q: Why is a minute of the E. coli map not a centimorgan?
A: A centimorgan is a probability of exchange -- a parameter of a random process, saturating at 50%. A minute is a time converted to a length by a constant transfer rate: additive by construction and never saturating. Since a 1976 recalibration a minute is formally 1/100 of the chromosome, so with MG1655 at 4,641,652 bp it is about 46.4 kb, and sequence-derived coordinates agree with the classical genetic map to a fraction of a minute. The minute map is a physical map that happened to be measured genetically.

Q: In interrupted mating the plateau height falls from about 0.30 for thr+ to about 0.03 for his+. What produces that gradient, and what does fitting it say about complete transfer?
A: Mating pairs break spontaneously, and spontaneous means a constant hazard lambda per minute, so the fraction still joined at time tau is e^(-lambda x tau) and plateau height is proportional to it -- meaning ln plateau is linear in tau. Fitting 0.30 at 6 min and 0.03 at 51 min gives lambda = ln(10)/45 = about 0.051 per minute, so the fraction of pairs surviving 100 minutes is e^(-5.1) = about 0.006. Complete transfer essentially never happens, and the gradient is a second distance estimate that needs no blender.

Q: One Hfr transfers thr, then lac, then his; an independently isolated Hfr transfers his, then lac, then thr with the same intervals reversed. What does that establish, and what does the argument avoid assuming?
A: That origin and direction of transfer are properties of the strain, not of the chromosome: F has integrated at different insertion sequences and in opposite orientations, so the two strains enter the same map at different points and travel opposite ways. Collect enough Hfrs and the set of linear orders is mutually consistent only when wrapped into a loop, which is the original evidence that the chromosome is circular. The argument uses only differences in entry time, so it cancels the initiation lag and assumes nothing about the transfer rate.

## F-prime merodiploids and complementation in a haploid

Q: Why is a complementation test impossible in a haploid, and what exactly does an F' merodiploid supply that makes it possible?
A: The test asks whether two recessive mutations damage the same function, and it requires both mutations in one cell on separate DNA molecules, each supplying a full copy of everything else -- which one chromosome cannot provide. An F' carries a chromosomal segment on the fertility factor, so the cell is diploid for that segment and haploid everywhere else: two independently mutable instances of one region in one address space. That is what lets you separate a broken diffusible product, which the good copy can supply to both molecules, from a broken sequence element, which can only ever affect the molecule it sits on.

Q: What single kind of event produces both an F' factor and a specialized transducing phage?
A: Imprecise excision of an integrated element. It comes out between mismatched sites, carries a stretch of adjacent chromosome with it and leaves an equivalent piece of itself behind. If the integrated element was a plasmid the product is an F' such as F'lac; if it was a prophage the product is a transducing particle such as lambda dgal, usually defective because a head holds a fixed amount of DNA, so what comes in is balanced by what goes out. One mechanism, two names.

## Transduction and cotransduction

Q: Why are generalized and specialized transduction not two versions of one process?
A: They are different errors at different steps. Generalized transduction (P1, P22) is a packaging error: headful packaging initiates at a host sequence resembling pac and fills a capsid with bacterial DNA, so any marker anywhere can move, the particle carries host DNA only and no phage genes, and lysates come from lytic growth on the donor. Specialized transduction (lambda) is an excision error at the prophage, so only genes flanking the att site can move, the particle is a phage-host hybrid and usually defective, and lysates come from inducing a lysogen.

Q: Cotransduction frequency is C(d) = (1 - d/L)^3, with L the headful length in minutes. Where does the cube come from?
A: From three separate requirements, under a model in which the fragment is an interval of fixed length L positioned uniformly along the chromosome and inheritance of a marker needs one crossover on each side of it inside the fragment, with crossover probability proportional to the DNA available on that side. One factor comes from the fragment having to span both markers at all, and one more for each of the two outer flanks needing room for a crossover. Integrating the flank product over the allowed fragment positions gives M^3/6 over L^3/6 with M = L - d.

Q: Three markers give cotransduction frequencies of 0.69 and 0.66 for the inner pairs and 0.43 for the outer pair. Why do the inner values not sum to the outer one, and what fixes it?
A: Because cotransduction frequency is a distance passed through (1 - d/L)^3 and raw frequencies are not additive: (1 - 0.69) + (1 - 0.66) = 0.65 against 1 - 0.43 = 0.57 observed for the outer pair, and there is no double crossover to blame this time. Invert instead, d = L(1 - C^(1/3)): with L = 2 minutes that gives 0.232, 0.259 and 0.491 minutes, and 0.232 + 0.259 = 0.491 to three decimals. The cube root does for cotransduction what Kosambi does for recombination frequency -- distances add, frequencies do not.

Q: Two markers cotransduce by P1 at 50%; a third cotransduces with each of them at 0%. How far away is the third marker?
A: Unknown, beyond "more than one headful from both" -- and that is the point. C = 0.50 gives d = 2(1 - 0.5^(1/3)) = about 0.41 min = about 19 kb for the first pair, but C = 0 is not a measurement of distance: it says only that the markers never share a roughly 100 kb fragment, so a marker 110 kb away reads identically to one on the far side of the chromosome. This is the RF = 50% ceiling in different clothing, and the remedy is the same -- change instrument, place the marker to within a minute by conjugation, then chain to a nearer P1 marker.

Q: P1 cotransduction returns nothing beyond one headful. Where does the ruler fail at the other end, and why?
A: As d approaches 0, C approaches 1 and dC/dd = -3/L, so with L about 2 minutes (about 100 kb) a 1 kb difference in separation shifts the cotransduction frequency by only about 3%. Below a few kilobases that shift is inside the sampling noise of scoring transductants, so P1 resolution bottoms out around 1-2 kb.

## Plasmids, incompatibility and R factors

Q: Two plasmids 99% identical in sequence coexist stably in one cell, while two plasmids sharing no sequence cannot. What actually determines incompatibility?
A: Sharing a replication control system -- the same antisense RNA, the same iterons, the same partition apparatus -- not sequence similarity, and not exclusion at the door. The controller measures its own concentration and inhibits initiation above a threshold, and it cannot tell the two molecules apart: it counts the sum and throttles both, so which one replicates at any moment is a coin flip and drift at each division drives one lineage to fixation. The test is therefore functional -- introduce one into a strain carrying the other and see whether the resident is lost -- which is why Inc typing classified plasmids by behaviour long before anyone could sequence them.

Q: A clinical isolate is resistant to a drug it was never exposed to, and treating with any one drug in its repertoire selects for the whole set. What genetics explains both observations?
A: A conjugative R factor: a plasmid carrying a transfer region like F's plus a cassette of resistance determinants, often assembled from transposons and integrons, as Watanabe's 1963 review established for the multiply-resistant Shigella isolates of late-1950s Japan. A broad-host-range conjugative plasmid carries its cargo over genus boundaries, so a pathogen can acquire resistance to a drug it never met; and determinants on one replicon are co-replicated rather than merely linked, so selecting with one enriches all of them. The accounting is not vertical -- resistance frequency is the frequency of a replicon in a community, not of an allele in a lineage.

## Phage lambda: the lysis-lysogeny switch

Q: Is a lysogen a phage lying dormant until conditions improve?
A: No -- it is an actively maintained state held by a bistable circuit. cI represses P_R and so blocks Cro, and simultaneously activates its own promoter P_RM, so the lysogen sits in an attractor where fluctuations in cI are pulled back rather than amplified. It is not waiting for good conditions but for a specific trigger: DNA damage activates RecA, activated RecA stimulates cI to cleave itself, Cro takes O_R3, and the lytic programme runs -- an attractor with an escape hatch wired to the host's own damage response. Spontaneous induction runs near one cell in 10^5 per generation.

Q: Mutual repression between cI and Cro already gives a switch you can flip. What extra feature makes the lambda circuit bistable, and what does bistability buy?
A: Positive autoregulation on one arm. The cI dimer bound at O_R2 does not merely block P_R -- it contacts RNA polymerase at P_RM and recruits it, so cI activates its own gene, with negative autoregulation only at very high cI, which fills O_R3 and caps the level. Mutual repression plus positive feedback on one arm gives two locally stable steady states with an unstable one between them, which is why a lysogen stays lysogenic for thousands of generations with no external input.

Q: A lysogen carrying a temperature-sensitive cI is shifted to 42 degrees C, then back to 30 degrees C two minutes later. What happens at each step, and why are the two answers not symmetric?
A: Shift up gives synchronous lysis: inactivating cI de-represses P_R, Cro accumulates and takes O_R3, and the lytic programme runs in every cell at once -- the standard way to induce a lysogen, valuable because it bypasses the RecA/SOS route and its mutagenic side effects. Shift back mostly still gives lysis, because once Cro occupies O_R3 the promoter P_RM is off, so restoring cI function does not restore cI synthesis: the trajectory has crossed the separatrix with no route back to the high-cI attractor, and excision has already begun in many cells. That hysteresis is the difference between a bistable circuit and a thermostat -- a thermostat tracks its input, this circuit commits.

## The gene as an interval: Benzer's fine-structure mapping

Q: Two mutations in one phage gene fail to complement on coinfection, yet crossing them yields wild-type recombinants at 0.05%. Same gene? Same site? What does the combination establish?
A: Same gene, different sites -- because the two observations answer different questions. Failure to complement means both genomes were present, each supplying everything but the damaged function, and still no phage was made, so both lesions damage the same function: one cistron. Recombinants mean exchange between the lesions rebuilt an intact sequence, which requires them to be at different positions: different recons. Complementation tests function, recombination tests position, and a gene is therefore not the unit of recombination but an interval of many mutable sites. Watch for the reverse combination -- complementation with zero recombination -- which usually means a dominant mutation or intragenic complementation in a multimer.

Q: Mapping about 2,000 rII point mutants pairwise would take two million crosses. How did Benzer avoid the quadratic cost?
A: He crossed each point mutant against a small set of deletions covering nested, overlapping intervals. A point mutation inside a deletion can never give a wild-type recombinant, because no wild-type sequence exists at that position on either parent, so the readout is a binary predicate -- any r+ plaques at all? -- rather than a frequency, and needs no counting. Each deletion halves the candidate interval, turning the job into interval containment by binary search: O(n log n) crosses instead of O(n^2), which is why the map got finished.

Q: What recombination resolution did Benzer's selection buy him in base pairs, and how firm is that number?
A: rII mutants grow on E. coli B but not at all on K-12(lambda), while wild type grows on both, so crossing two rII mutants on B and plating 10^9 progeny on K-12(lambda) makes a single r+ recombinant a visible plaque against zero background -- a detectable frequency near 10^-8, against about 10^-4 for a Drosophila worker scoring 10^4 flies. The smallest frequencies he could measure reliably were about 0.02 map units, and with a 168,903 bp T4 genome and a map of order 1,500-1,600 units that is about 106 bp per map unit, so 0.02 x 106 = about 2 bp. Treat the arithmetic as approximate -- a phage genome pairs several times per infection, so a phage map unit is not a meiotic centimorgan and the conversion factor is soft -- but the order of magnitude holds.
