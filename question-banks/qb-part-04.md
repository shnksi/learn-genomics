# Question bank — Part 04: Gene regulation

Covers [Ch 21-25A](../part-04-gene-regulation/21-bacterial-regulation.md).

Convert to Anki: `python reference/to_anki.py question-banks/ --out anki-import.tsv`

## The bacterial baseline: operons and the lac system

Q: What is an operon, and which feature of bacterial translation makes it work?
A: One promoter serving a run of adjacent genes, transcribed into a single polycistronic mRNA. It works because bacterial ribosomes need not start at the 5' end: each coding sequence carries its own Shine-Dalgarno sequence a few bases upstream of its start codon, so a ribosome binds directly at each one. The payoff is coordinate regulation of a whole pathway from one control point.

Q: The inducer of the lac operon is not lactose. What is it, and why is that arrangement self-referential?
A: Allolactose, an isomer produced as a side reaction by beta-galactosidase, the enzyme the operon itself encodes. The operon's own product makes the molecule that turns the operon on, so the system cannot bootstrap from a true zero. IPTG is used in the lab precisely because it bypasses this: it binds LacI but is not a substrate.

Q: Why is lac repression deliberately leaky rather than absolute?
A: Lactose enters only through the permease (lacY) and allolactose is made only by beta-galactosidase (lacZ), both operon products. With true zero basal expression no inducer could ever be made and the operon could never be induced. The residual few molecules per cell are the seed that a positive feedback loop requires, not a defect to be engineered away.

Q: Glucose binds nothing in the lac system. How does it repress the operon?
A: The act of transporting glucose is the signal. Transport dephosphorylates EIIA-Glc; unphosphorylated EIIA-Glc no longer activates adenylate cyclase, so cAMP falls and CRP cannot activate the weak promoter. The same unphosphorylated EIIA-Glc also binds LacY directly and shuts the permease, which is inducer exclusion. Both layers are real.

Q: How much repression does each lac operator contribute, and what does that reveal about the mechanism?
A: O1 alone gives about 20-fold. O1 plus one auxiliary operator gives about 440-fold (with O3) or about 700-fold (with O2); all three together give about 1,300-fold. LacI is a tetramer whose two halves each grip an operator and loop the DNA between them, so most of the repression comes from looping rather than simple occlusion of the promoter.

Q: The lac truth table is usually written as an AND gate. In what sense is that an approximation, and what makes the system look digital anyway?
A: Modelling the firing rate as free-operator fraction times promoter activity gives about 11,000-fold dynamic range, but the three off states still differ from each other by about 150-fold, so it is analogue with a wide range rather than a gate. Positive feedback (more permease, more lactose, more allolactose, less repressor) plus cooperative binding produces bistability, so single cells are fully induced or fully off and the population mean is a value no cell exhibits.

## cis versus trans, and merodiploid logic

Q: What distinguishes a cis-acting from a trans-acting regulatory element, and why is the distinction absolute?
A: A cis element is a sequence, such as a promoter or operator, so it can only affect the DNA molecule it physically sits on. A trans factor is a diffusible gene product that leaves its template and reaches every copy of its target. Break a trans factor and every copy misbehaves; break a cis element and only that copy does.

Q: A strain expresses lacZ constitutively. Why does that not tell you which element is broken, and what experiment resolves it?
A: Two entirely different lesions give constitutivity: a non-functional trans-acting repressor (lacI-, recessive) or an altered operator the repressor cannot bind (lacOc, cis-dominant). A merodiploid carrying a second lac region on an F' separates them: a wild-type lacI supplies repressor in trans and rescues lacI-, but nothing supplied in trans can rescue lacOc.

Q: Why is the lacI-s superrepressor dominant when lacI- is recessive?
A: LacI is a tetramer, so in a partial diploid wild-type and mutant subunits assemble into mixed tetramers. Those still bind the operator but cannot be released by inducer, so a few mutant subunits poison the whole pool. This is negative complementation: dominance arising from multimerisation, not from the mutant protein being more active.

Q: Why is cis-dominance not a form of Mendelian dominance?
A: lacOc has literally zero effect on the other copy; it is not competing with it or masking it. Whether you can detect it at all depends only on which structural genes sit downstream of it on that same DNA molecule. Put lacOc on a copy carrying a dead lacZ and a beta-galactosidase assay sees nothing.

Q: For lacI- P+ Oc lacZ- lacY+ / F' lacI+ P- O+ lacZ+ lacY-, what is expressed, and what is the trap?
A: No beta-galactosidase under any condition, and permease constitutively. The F' supplies functional LacI in trans, but its own promoter is dead so that copy transcribes nothing; the chromosomal copy escapes repression through Oc but carries a dead lacZ. The trap is that a beta-galactosidase assay alone reads zero in both conditions, exactly like a lacI-s strain. Only assaying permease separates the two genotypes.

## Bacterial control points beyond initiation

Q: Both LacI and TrpR are negative regulators controlled by a small molecule. Why is TrpR not just LacI running backwards?
A: The allosteric signs are opposite. Allolactose binds LacI and takes it off the DNA, so it is an inducer; tryptophan binds TrpR and enables DNA binding, so it is a corepressor. That is why negative versus positive control and inducible versus repressible are two independent axes rather than one.

Q: How does attenuation convert tryptophan supply into a transcription decision at the trp operon?
A: The trpL leader encodes a 14-codon peptide with two consecutive Trp codons at positions 10 and 11, and the leader RNA can fold as a 2:3 antiterminator or a 3:4 terminator. With Trp plentiful the ribosome sails through and covers segment 2, so 3:4 forms and polymerase terminates. With Trp scarce the ribosome stalls on segment 1, leaving segment 2 free to pair with 3, so the terminator cannot form and polymerase reads into trpEDCBA. It adds roughly 8 to 10-fold on top of TrpR's roughly 70-fold.

Q: Why is ribosome-mediated attenuation impossible in a eukaryote, and what exactly is ruled out?
A: It requires a ribosome translating a transcript while RNA polymerase is still making it, so that ribosome position determines which hairpin forms ahead of the polymerase. In eukaryotes the transcript is capped, spliced and exported before any ribosome touches it. Only the ribosome-as-sensor version is ruled out: promoter-proximal premature Pol II termination and eukaryotic TPP riboswitches are still leader-RNA decisions about an already-initiated transcript.

Q: What is a riboswitch, and why is its aptamer the purest cis element there is?
A: An mRNA leader that folds into an aptamer binding a metabolite directly, coupled to an expression platform whose fold changes on binding, controlling termination, ribosome binding, or self-cleavage with no protein in the decision path. The aptamer is part of the very molecule it regulates, so it acts not merely on its own DNA molecule but on its own RNA molecule. The metabolite remains trans, since it diffuses to every copy.

Q: The heat-shock regulator sigma-32 is often described as a thermometer. Why is it better described as sensing demand?
A: Free chaperones bind sigma-32 and deliver it to a protease. When unfolded protein accumulates, chaperones are titrated away, sigma-32 is stabilised, and more chaperones are made. The controller measures unmet demand for its own output, which is a better sensor than temperature and needs no thermometer, though sigma-32's mRNA does also carry an RNA thermometer.

Q: Gene A is needed in 99% of environments and gene B in 0.1%. Which should get negative control and which positive, and why?
A: A gets negative control and B positive. A is nearly always wanted, so a default-ON strong promoter costs little, the response to the rare stop signal is fast, and leakiness is harmless. B's dominant cost is the noise floor integrated over the 99.9% of the time it is useless, and positive control on an intrinsically weak promoter gives a much lower floor at the price of slower turn-on. The failure modes agree: an operator mutation locks A permanently ON, which is cheap, while an activator-site mutation locks B permanently OFF, which is tolerable.

## Bacterial sensing and bet-hedging

Q: What is the conserved core of a two-component system, and why is it called a genuine interface?
A: A sensor histidine kinase autophosphorylates a conserved histidine using ATP and transfers the phosphoryl group to a conserved aspartate in the receiver domain of a response regulator, whose output domain then acts. Only that His-to-Asp transfer is conserved: the input domain is whatever detects the signal and the output domain is whatever acts on it, so evolution has done combinatorial assembly on it, giving E. coli K-12 alone about 30 histidine kinases and 32 response regulators. The output need not be transcription at all, which is why the same architecture spans five orders of magnitude in response time, down to phospho-CheY reversing the flagellar motor in milliseconds.

Q: If 30 histidine kinases share one phosphotransfer chemistry, why is there so little crosstalk between them?
A: Specificity is kinetic rather than structural. Cognate kinase and regulator pairs have coevolved contact residues, so a kinase phosphorylates its own partner far faster than any other response regulator. Nothing forbids the wrong reaction; it is simply slow. Specificity is a rate ratio, the same answer that protein-DNA recognition gives.

Q: Salmonella inverts a 996-bp segment to switch flagellins. Why is that not Lamarckian, and what does it say about mutation rate?
A: The switching is blind and constant: Hin recombinase inverts the segment at roughly 10^-3 to 10^-5 per cell per generation whether or not a host is present, so by the time antibodies are raised against one flagellin a minority sub-population already displays the other. The host selects among variants that already exist; nothing induces the useful one. The second lesson is that mutation rate is under genetic control and not uniform across the genome, as at Neisseria opa contingency loci, where a pentameric repeat inside the coding sequence makes slipped-strand mispairing shift the frame, and that locally elevated rate is itself a selected property.

## The eukaryotic inversion: default off

Q: What single reframe distinguishes eukaryotic from bacterial transcriptional regulation?
A: Default off. Bacterial regulation asks whether a gene should be switched off, because the promoter is accessible and polymerase can find it. Eukaryotic DNA is nucleosomal and nothing happens by default, so regulation asks whether enough independent evidence has accumulated to justify switching a gene on. That inversion generates the need for many inputs, the tolerance of long distances, and the existence of factors specialised for prising chromatin open.

Q: Eukaryotes have essentially no operons. What is the mechanistic reason, and what is the exception?
A: Eukaryotic ribosomes load at the 5' cap and scan forward, so in practice only the first open reading frame is translated and downstream cistrons would be wasted. Co-regulation is achieved instead by giving physically unlinked genes the same binding-site sequences, a broadcast pattern rather than a shared transcript. Nematodes are the exception, with more than 17% of C. elegans genes in polycistronic units, but only because they evolved SL2 trans-splicing to resolve them.

Q: What three operational properties define an enhancer?
A: Position independence, so it works upstream, downstream, or inside an intron of its target or of a neighbour; orientation independence, so flipping it changes nothing, unlike a promoter which is directional; and distance tolerance, routinely tens of kb and up to about 1 Mb, as with the ZRS that drives SHH in the limb bud from inside intron 5 of LMBR1.

Q: One megabase of DNA has a contour length of about 340 micrometres, in a nucleus about 6 micrometres across. How can an enhancer act over that distance?
A: Linear distance is not the operative variable; contact frequency is. The intervening DNA is extruded as a loop by cohesin, bringing enhancer and promoter into physical contact. Contact frequency decays with genomic separation but is structured by topologically associating domains, whose CTCF-bound boundaries make within-domain contacts far more likely than contacts across a boundary.

Q: What is enhancer hijacking, and why does it show that TAD boundaries are load-bearing?
A: Removing a boundary lets enhancers reach genes they normally cannot. Deleting the boundary near EPHA4 lets limb enhancers activate the wrong genes and produces limb malformations without altering a single coding base, and structural variants that delete boundaries activate oncogenes the same way.

Q: An enhancer does not simply switch a gene on. What does it change, and what are the two burst parameters?
A: Transcription occurs in bursts, modelled as a two-state telegraph: burst frequency is set by k_on and burst size by k_syn/k_off. Enhancers predominantly set burst frequency; core promoter elements set burst size; and cell-type differences in expression are mostly differences in frequency. Because bulk RNA-seq reports only the mean, it cannot separate the two parameters.

Q: Roughly 90% of GWAS associations are non-coding. Why is the usual selection explanation stated backwards?
A: Only about 1.5% of the genome is protein-coding exon, so with no selection at all you would expect about 98.5% of associations to be non-coding; at 90% coding variants are several-fold over-represented, roughly 7-fold on these numbers, not slightly. Selection cannot explain a number below the base rate. What it does explain is sharper: why non-coding hits concentrate in accessible regulatory DNA, with about 76.6% of non-coding trait SNPs lying in or in perfect linkage disequilibrium with a DNase-hypersensitive site, and why effect sizes are small.

Q: Given an enhancer's sequence and every promoter in its TAD, can you predict which promoter it drives?
A: No, and that is the honest 2026 statement. It is why nearest-gene assignment is wrong a large fraction of the time and remains the single most common error in interpreting non-coding association signals. What is known only constrains the answer: compatibility is partly promoter-class based, with housekeeping and developmental promoters preferring different enhancer types, yet across large-scale reporter assays most pairs are broadly compatible and an enhancer's intrinsic strength explains more variance than any pairing rule. CTCF and cohesin boundaries narrow the search space without picking the target inside it.

Q: A 2025 result separated an enhancer's strength from its reach. What was it, and why does it matter?
A: A range extender (REX) element sitting beside HS72, a long-range Sall1 limb enhancer with a native working distance of 411 kb. REX has no enhancer activity of its own, but adding it to shorter-range limb enhancers extended their reach, in the extreme case letting an enhancer with a 73 kb native range act across the 848 kb separating the ZRS from SHH. Conversely, short-range enhancers swapped into the ZRS position could not drive SHH from that distance. "How strongly" and "how far" are separately encoded properties.

Q: Pol II and Mediator form visible clusters at highly active loci. Why is calling them phase-separated condensates ahead of the evidence?
A: The clustering is real and reproducible; the thermodynamic reading is not established. Many such clusters contain only tens of molecules, far below the scale at which classical phase behaviour is well defined; the standard perturbations, 1,6-hexanediol and optogenetic droplet induction, are blunt and have off-target effects; multivalent-binding hub models reproduce most observations with no phase transition at all; and forcing condensate formation sometimes inhibits transcription. Bursting, the other half of the same section, is on far firmer ground.

## Transcription factors and the specificity problem

Q: A sequence-specific transcription factor is two separable modules. What are they, and what did that separability make possible?
A: A DNA-binding domain that recognises a short sequence, and an activation or repression domain that recruits machinery, the latter typically intrinsically disordered, often acidic, poorly conserved and interchangeable. The activation domain acts as a recruitment address rather than on DNA or polymerase. Separability is why GAL4-VP16 fusions work across species, why the yeast two-hybrid assay works, and why dCas9 fusions give CRISPRa and CRISPRi.

Q: Why does a genome-wide scan for a transcription-factor motif fail as a predictor of binding?
A: A position weight matrix with information content I bits gives an expected 2L x 2^(-I) genome-wide matches. Real motifs are 6 to 15 bp and degenerate, carrying roughly 8 to 15 bits, which over 3.1 x 10^9 bp gives between about 10^5 and 10^7 matches, while a typical factor occupies only 10^3 to 10^5 sites by ChIP-seq. This is the futility theorem of Wasserman and Sandelin: on the order of 1,000 false positives per functional site.

Q: GATA1's WGATAA motif carries about 10.3 bits. Trace how filtering gets from motif matches to a realistic enhancer count.
A: Both strands of 3.1 x 10^9 bp give about 5.0 x 10^6 matches. Requiring two partner motifs, a TAL1 E-box and a KLF1 site, within a 300 bp window cuts this to about 9 x 10^5, only about 6-fold. Intersecting with the roughly 1.5% of the genome accessible in that cell type gives about 1.4 x 10^4. Chromatin does far more filtering than combinatorics, which is the structural reason default-off is the eukaryotic strategy.

Q: Why is a pioneer factor necessary at all, and why can an ordinary activator not open its own site?
A: There is a bootstrap circularity: most DNA-binding domains need the major groove free, opening a nucleosome needs an ATP-dependent remodeller, and remodellers are recruited by already-bound factors. Pioneer factors break the loop by engaging their motifs on nucleosomal DNA. FOXA1's winged-helix fold resembles linker histone H1; GATA factors, OCT4, SOX2 and KLF4 have comparable ability. MYC, the fourth Yamanaka factor, is not a pioneer and rides on the accessibility the others create.

Q: Eukaryotic activators almost never contact Pol II. What three classes of machinery do they recruit instead, and which one physically bridges to the polymerase?
A: They recruit, and what they recruit does the work: ATP-dependent remodellers (SWI/SNF, ISWI, CHD, INO80) that slide, eject and swap nucleosomes; histone modifiers such as p300/CBP writing H3K27ac and COMPASS writing H3K4me1; and above all Mediator, whose roughly 26-subunit core has a tail contacting activation domains and a head contacting Pol II, with a separable CDK8 kinase module.

Q: An MPRA says a sequence drives expression but a CRISPRi tiling screen says the endogenous element is not required. Which result is wrong?
A: Neither. MPRA tests sufficiency out of context; CRISPRi tests necessity in place. They disagree often and each is right about the question it asked. A CRISPRi negative is also expected wherever shadow or redundant enhancers drive the same pattern, so failure to see an effect on perturbation is not evidence the element does nothing.

Q: Enhanceosome versus billboard: how do the two models of enhancer grammar differ, and which evidence discriminates them?
A: In an enhanceosome, such as the roughly 55 bp human interferon-beta enhancer, spacing and orientation are critical because the occupants form one rigid cooperative surface, the logic is a strict all-or-nothing AND, and single-base-pair insertions abolish activity. In a billboard, such as the roughly 500 bp even-skipped stripe 2 enhancer, sites can be shuffled, gained and lost, sub-elements are semi-autonomous and the logic is roughly additive; the evidence is that the sequence diverges heavily between Drosophila species while the output stays conserved. A third model, the TF collective, covers enhancers whose co-occupancy depends on protein-protein and chromatin context rather than on motif grammar at all.

## Chromatin marks and cellular memory

Q: What is the strict definition of "epigenetic", and why does the loose definition cause trouble?
A: Strictly, a change that is heritable through cell division and not explained by a change in DNA sequence; heritability is the whole content of the claim, and the test is to remove the initiating signal, let the cell divide, and see whether the state persists. The loose definition, meaning anything to do with chromatin, makes the word a synonym for regulatory and lets a result proved loosely, such as stress altering histone acetylation, be reported strictly, as stress altering your grandchildren.

Q: Why does histone acetylation open chromatin while lysine methylation does not?
A: Acetylation transfers an acetyl group onto the lysine amino group and neutralises its positive charge, which is part of what binds the octamer to DNA's polyanionic backbone; affinity drops and the region opens. This is derivable from electrostatics alone. Methylation changes no charge and does essentially nothing to histone-DNA affinity; its entire effect is that reader domains such as chromodomains, PHD fingers and Tudor domains bind methylated lysines and not unmethylated ones.

Q: What property separates the chromatin marks that can be inherited from the ones that cannot?
A: A read-write loop. PRC2's EED subunit binds H3K27me3 and allosterically stimulates the EZH2 catalytic subunit; HP1 binds H3K9me3 through its chromodomain and recruits SUV39H1; UHRF1 reads hemimethylated DNA and recruits DNMT1. Reading the mark recruits the writer of the same mark, which is positive feedback that restores the state after replication dilutes it. Acetylation has no such loop and turns over in minutes, so it reports current activity rather than remembering it.

Q: In what specific ways does the "histone code" framing overstate the case?
A: The symbols are not independent, since H3K4me3, H3K9ac, H3K27ac and nucleosome depletion co-occur because they share a cause, and genome-wide segmentation recovers about 15 to 25 recurrent states rather than 2^N. Many marks are consequences of transcription rather than causes. The few causal tests split, with H3K27R substitution abolishing Polycomb silencing while other residues show weak effects. And readout is context-dependent, so the same letter means different things in different places.

Q: Why is bistability, rather than high-fidelity copying, the right model for chromatin memory?
A: Measured DNMT1 maintenance fidelity is roughly 0.96 to 0.99 per site per division, which is not enough over the distances that matter: 0.99^300 is about 0.05, so copying alone leaves essentially nothing over the hundreds of divisions a real lineage runs. Because writers are recruited by readers, the de novo rate rises with local mark density, making the dynamics over a block of sites nonlinear with two stable attractors. Memory is a property of a domain, not of a nucleotide.

Q: Why is centromere identity the cleanest strict-sense epigenetic mark in the genome?
A: Because sequence does not determine it. Neocentromeres form on ordinary unique sequence with no alpha satellite at all and are then stably inherited for generations, while the original alpha-satellite array sits inert. CENP-A, the histone H3 variant that replaces H3 at centromeres, templates its own re-deposition, so identity is propagated by the mark rather than by the sequence.

Q: Why is X inactivation the largest-scale strictly epigenetic event in the genome, and what makes the state so hard to reverse?
A: Two chromosomes of identical sequence hold two different heritable states across hundreds of cell divisions, which is exactly what the strict definition asks for. The state is hard to reverse because XIST-directed silencing is layered: SPEN with HDAC3 to deacetylate, then PRC1 and PRC2 writing H2AK119ub and H3K27me3, then macroH2A, then SMCHD1, then DNA methylation of CpG-island promoters -- each layer individually dispensable, together a lock that is essentially irreversible in somatic cells. The choice of which X is random per cell in the early epiblast and then clonally inherited, so a heterozygous female is a mosaic and her X-linked disease expression is variable and skew-dependent. Roughly 15 to 25% of X-linked genes escape.

## DNA methylation, imprinting, and inheritance claims

Q: Why is CpG symmetry load-bearing for the heritability of DNA methylation?
A: CpG is its own reverse complement, so a methylated site carries the mark on both strands. Replication therefore produces a hemimethylated site, a strand-asymmetric intermediate that unambiguously encodes that the mark belongs there. UHRF1 recognises hemimethylated CpG and recruits DNMT1 to restore the new strand. In a non-palindromic context there would be no restore signal, only passive dilution.

Q: "DNA methylation switches genes off." Where is that true and where is it false?
A: True at promoter CpG islands, where methylation both blocks methylation-sensitive factors such as CTCF and recruits MBD proteins that pull in HDAC and corepressor complexes. False in gene bodies: SETD2 deposits H3K36me3 co-transcriptionally, DNMT3B's PWWP domain reads it and methylates the underlying DNA, so gene-body methylation correlates positively with expression and suppresses spurious internal initiation. Any genome-wide average methylation level averages two opposite signals.

Q: Why is the human genome CpG-poor, and why are CpG islands the exception?
A: 5-methylcytosine deaminates to thymine, a perfectly legitimate DNA base, so the repair machinery sees a T:G mismatch and cannot tell which strand is wrong. Methylated CpG is therefore the single most mutable position in the genome. At about 41% GC the expected CpG frequency is around 4.2% of dinucleotides, and the observed value is about 1%. CpG islands survive because they are the regions kept unmethylated in the germline and so never exposed to the accelerated C to T rate.

Q: Derive the IGF2/H19 imprinting logic from CTCF's methylation sensitivity, and predict both disease directions.
A: On the maternal chromosome ICR1 is unmethylated, CTCF binds its sites, and the resulting insulator blocks the downstream enhancers from reaching IGF2, so H19 is expressed instead. On the paternal chromosome ICR1 is methylated, CTCF cannot bind, and the enhancers reach IGF2. Gain of methylation on the maternal ICR1 makes it behave paternally, giving two active IGF2 copies and the overgrowth of Beckwith-Wiedemann syndrome; loss of methylation on the paternal ICR1 gives no expressed IGF2 and the growth restriction of Silver-Russell syndrome.

Q: Prader-Willi and Angelman syndromes arise from the same locus. What distinguishes them, and what do they establish?
A: Both come from the imprinted domain at 15q11-q13 and differ only in which parent's copy is lost. Paternal loss gives Prader-Willi, with the paternally expressed SNORD116 snoRNA cluster as the critical locus; maternal loss gives Angelman, with UBE3A, which is maternally expressed in neurons only. They are the proof in humans that the maternal and paternal genomes are not functionally interchangeable.

Q: Why did imprinting evolve at all, and what is the strongest evidence for that explanation?
A: Haig's kinship or conflict theory. Where a mother provisions offspring after fertilisation and may have offspring by more than one male, a paternally derived allele is likely absent from her later offspring, so its optimum is to extract maternal resources aggressively, while a maternally derived allele is present in half of them and its optimum is restraint. The prediction that paternally expressed genes promote growth and maternally expressed ones restrain it fits IGF2 against H19 and CDKN1C. The strongest evidence is convergence: imprinting arose independently in placental mammals and in the endosperm of flowering plants, the two lineages with post-fertilisation maternal provisioning, and not in egg-laying lineages.

Q: Why is mammalian transgenerational epigenetic inheritance mechanistically hard, and how should the generations be counted?
A: An environmentally induced mark must be written in the germline, survive erasure to roughly 7 to 15% genome-wide methylation in primordial germ cells, survive the post-fertilisation wave, and still alter phenotype; the known escapees are mostly IAP and other LTR retrotransposons. On counting: if a pregnant F0 female is exposed, the F1 fetus and the germ cells that make F2 are also directly exposed, so F3 is the first unexposed generation; for an exposed F0 male it is F2. Anything earlier is intergenerational.

Q: What does the Dutch Hunger Winter methylation study actually show, and what are its main confounders?
A: Individuals conceived during the 1944-45 famine had about 5.2% lower methylation at the IGF2 differentially methylated region six decades later than their own unexposed same-sex siblings. Those subjects were exposed in utero, so this is F1 and not transgenerational. No causal link to phenotype was tested, whole blood is a cell mixture so composition shifts mimic methylation change, and methylation at most such regions is under substantial genetic control through mQTLs.

Q: What is "epigenetic age acceleration" in statistical terms, and what does it not tell you?
A: It is the residual from regressing clock-predicted age on chronological age. Horvath's multi-tissue clock uses 353 CpGs, correlates about 0.96 with chronological age and has a median absolute error of about 3.6 years, but the residual inherits every confounder of its features, blood cell composition above all. The chosen CpGs are one arbitrary representative set drawn from many correlated equivalents, so reading biology off the gene list is a mistake, and a regression residual is not a state you can reverse.

## RNA-based regulation

Q: Why is RNA-based recognition cheap to evolve, and what is the unavoidable statistical cost?
A: The machinery, including Argonaute, Cas9, the ribosome and the spliceosome, is generic and takes a guide sequence as an argument, so inventing a new specificity costs about 20 nucleotides rather than a new protein fold. The cost is that short guides match by chance: a 7-mer occurs once every 4^7 = 16,384 bases, so across roughly 2.3 x 10^7 nt of human 3'UTR a single miRNA has around 1,400 chance seed matches before any biology.

Q: A miRNA seed match sits in your gene's 3'UTR, and the miRNA is known to repress it in a reporter. How much have you learned?
A: Very little. Chance matches outnumber real ones, so prediction is a ranking problem with a bad prior rather than a classification problem, and conservation filtering against a shuffled-seed background lifts precision only to roughly a coin flip. The reporter tests sufficiency, using a massively overexpressed construct carrying a 3'UTR fragment out of its native context, so it shows the site can be bound, not that the endogenous message is regulated. Necessity needs the miRNA perturbed in the real cell type plus AGO CLIP occupancy showing where Argonaute actually sits.

Q: You transfect a miRNA and run RNA-seq to see which predicted targets responded. Why is a per-gene fold-change cutoff the wrong statistic?
A: Real targets move by tens of percent, not folds, roughly 20 to 35% median repression for 8mer sites and less for 7mers, because miRNAs mostly buffer noise and enforce tissue-specific off-states rather than switching genes off. A 2-fold cutoff would return almost nothing and you would wrongly conclude the miRNA is inert. The correct test is a shift between two cumulative distributions, comparing log fold-changes for site-containing against site-free messages by Kolmogorov-Smirnov or Mann-Whitney.

Q: Trace a miRNA from Pol II transcript to loaded RISC, and say what decides which strand becomes the guide.
A: A capped, polyadenylated pri-miRNA with an embedded hairpin is cropped in the nucleus by Drosha with DGCR8 to a roughly 60 to 70 nt pre-miRNA, exported by Exportin-5 with RanGTP, cut by Dicer in the cytoplasm to a roughly 22 nt duplex with 2-nt 3' overhangs, and loaded into Argonaute with the passenger strand discarded. Every step is a used control point. Strand selection is thermodynamic: the strand whose 5' end is less stably paired is retained as guide, and because the 5p to 3p ratio shifts between tissues, "the" mature miRNA is context-dependent.

Q: How does piRNA biogenesis differ from the miRNA and siRNA routes, and how is the piRNA pool amplified?
A: piRNAs are 24 to 32 nt, Dicer-independent and largely germline-restricted, and their guides come from piRNA clusters, loci densely packed with fragments of transposons that previously invaded the lineage. Amplification is the ping-pong cycle: an antisense piRNA guides cleavage of a sense transposon transcript, that product becomes a secondary sense piRNA, and it guides cleavage of a cluster transcript, regenerating the primary. The signature is reciprocal pairs overlapping by exactly 10 nt at their 5' ends, with uracil at position 1 of one partner and adenine at position 10 of the other. Because amplification is keyed on the substrate, it runs only while the transposon is actually being transcribed.

Q: A paper reports that a lncRNA sponges a miRNA, on luciferase reporters plus correlated expression. What is the first number to ask for?
A: Copies per cell of both, in the same cell type. Titration is a stoichiometric claim: to lower free miRNA measurably the sponge must supply high-affinity sites on the order of the miRNA's own abundance. A miRNA such as miR-21 runs to tens of thousands of copies per cell while a typical lncRNA sits at 1 to 100 copies with a handful of sites, three to four orders of magnitude short. That is why the competing-endogenous-RNA hypothesis is mostly unsupported, and why even the one convincing circRNA case, CDR1as with over 70 miR-7 sites, is now read as transport rather than titration.

Q: Mammalian knockdowns use 21-nt duplexes even though long dsRNA is the natural RNAi trigger. Why, and what problem does the substitution import?
A: Long dsRNA reads as a viral signature: it activates PKR, which phosphorylates eIF2-alpha and collapses cap-dependent translation globally, and it triggers interferon. A 21-mer sits below that threshold and is exactly the product Dicer would have made, so it loads into RISC directly. But its seed makes it a miRNA too, repressing a few hundred unintended messages in a pattern that is perfectly reproducible for that sequence, so repeating with the same siRNA is not a control. Independent sequences plus rescue are.

Q: "lncRNA" is a category defined by exclusion. What does the label assert, and what four distinct claims could a transcribed locus support?
A: It asserts only a transcript over 200 nt with no evident coding capacity, and both halves are weak, since the threshold is an artefact of a column size cutoff and ribosome profiling keeps finding translated small ORFs. A locus may be functional through the RNA, through the act of transcribing it, as a DNA element with the RNA a by-product, or not at all. Airn silences its imprinted target even when truncated so that no full-length RNA exists.

Q: How would you separate the RNA from the act of transcribing it at a candidate lncRNA locus?
A: Different perturbations remove different things. An ASO or RNAi removes the RNA only; CRISPRi at the promoter removes the RNA and the transcription; a poly(A) cassette truncates the transcript while leaving the DNA element intact; deleting the locus removes all three at once. Disagreement between them is informative rather than contradictory, and only rescue in trans from a transgene elsewhere shows the RNA molecule itself does the work.

Q: The spacer in a CRISPR array is exactly the sequence the effector destroys. Why is the array not cut?
A: The PAM. The effector requires a short motif immediately adjacent to the protospacer, 5'-NGG-3' on the 3' side for S. pyogenes Cas9, which is present next to the target in the invader and absent next to the spacer in the array, where the flanks are repeats. Self versus non-self is decided by two or three bases of context, not by the guide, which is identical in both places. PAM-first checking is also what makes searching a whole genome by random collision kinetically feasible.

Q: Why can you not make a gene respond faster by transcribing it harder?
A: With dm/dt = k_syn - k_deg x m, the steady state is k_syn/k_deg but the approach is exponential with time constant 1/k_deg, so the half-time to a new steady state is the message's own half-life. Transcription sets the destination; only degradation sets the speed. That is why fast-response genes such as cytokines, immediate-early transcription factors and cell-cycle regulators carry destabilising AU-rich elements: the instability is bandwidth bought with wasted synthesis.

## Networks, development, and evolution

Q: Why does a gene's response time depend only on its removal rate, and what does negative autoregulation buy?
A: With dX/dt = beta - alpha X the steady state is beta/alpha but the half-time to reach it is ln2/alpha, so raising production raises the final level without making it arrive sooner. Negative autoregulation decouples them: set beta very high so X shoots up and let repression clamp it at the same level, which measurably cut the rise time to about one fifth of a cell cycle. It also reduces variance, acting as a proportional controller, and over 40% of E. coli transcription factors do it.

Q: Why does positive autoregulation give a switch only if binding is cooperative?
A: Steady states are where production f(X) = beta X^n / (K^n + X^n) meets removal g(X) = alpha X. With n = 1 the production curve is concave everywhere, so a straight line through the origin cuts it at most once away from zero, giving a graded response and no memory. With n > 1 the curve is sigmoidal with a flat foot near the origin, so the line can cross three times, giving stable low and high states with an unstable one between. Cooperativity, from dimerisation or multiple reinforcing sites, is the price of memory.

Q: What does hysteresis buy a cell that is committing to a fate?
A: A latch. Sweeping an input up, the system stays off until the low and middle states annihilate and then jumps to on; sweeping it back down, it stays on well past that point because now the on state must be destroyed instead. Over a range of inputs the state depends on history, so a transient signal produces a permanent decision. A morphogen present for two hours can install a state that persists for eighty years.

Q: What does a coherent type-1 feed-forward loop with AND logic do, and why is it useful?
A: X activates Y, and X and Y together activate Z, so when X switches on Z must wait for Y to accumulate past threshold. A brief pulse of X never gets Y there, so Z never fires; a sustained X does. When X switches off the AND fails immediately and Z shuts down with no delay. Delay on the ON step and none on the OFF step makes it a persistence detector, a debounce circuit that ignores transients while still terminating quickly.

Q: Derive the shape of a morphogen gradient, and say why the French flag is a specification rather than a mechanism.
A: A morphogen made at a source, diffusing with coefficient D and degraded at first-order rate k, satisfies D x (d^2c/dx^2) = k x c at steady state, giving c(x) = c0 x e^(-x/lambda) with lambda = sqrt(D/k), the distance a molecule diffuses in one lifetime. That decay length sets the physical size of the patterned field, which is why gradients work over hundreds of micrometres. But an exponential read against a fixed threshold is a bad position detector: near the threshold small fluctuations in concentration displace the inferred boundary a long way, while real embryos place boundaries to roughly single-cell precision. The sharpening is manufactured downstream by cross-repression between target genes, time-averaging and cell-cell communication.

Q: Waddington's landscape is the most useful picture in developmental biology. What are its three failure modes?
A: It has no potential function in the general case: a ball rolling downhill is a gradient flow and gradient flows cannot oscillate, yet the vertebrate segmentation clock is a limit cycle. It has no spatial dimension, whereas development is spatial, the same network running in every cell and giving different outcomes only because the inputs differ by position. And downhill-only is wrong, as reprogramming shows. Keep it for the intuition that identity is an attractor with a barrier around it; drop it the moment you need dynamics.

Q: even-skipped is expressed in seven evenly spaced stripes, yet nothing upstream of it is periodic. How is the periodicity generated?
A: It is not generated; it is queried into existence. eve has separate independent enhancers, one per stripe or stripe pair, each reading the aperiodic gap-gene landscape. The minimal stripe 2 enhancer is about 480 bp with roughly twelve binding sites for four proteins: Bicoid and Hunchback activate, Giant sets the anterior border by repression and Kruppel the posterior, so the stripe appears in the gap between the two repressor domains. Seven such conjunctive queries happen to land at regular intervals; the periodicity lives in the readout, not in any oscillator or counter.

Q: What does a homeotic transformation demonstrate, and why is "master regulator" a misleading phrase for a Hox gene?
A: Expressing Antennapedia in the head makes legs where antennae should be, which shows the leg-building programme was already present and functional in the antennal segment and merely unselected. Hox genes are selectors that route between pre-existing developmental subroutines; they do not contain the design of a leg, only a routing decision. Colinearity, in which gene order along the cluster matches expression order along the body axis, is one of the very few cases where gene order is functionally load-bearing.

Q: Reprogramming a fibroblast with four factors works in well under 1% of cells over weeks. Why is that inefficiency evidence for the attractor model rather than against it?
A: If identity were a passive consequence of which factors are present, supplying them would flip nearly every cell quickly and deterministically. Low probability, long latency and wide cell-to-cell variability are the signature of stochastic escape from a deep basin of attraction maintained by mutually reinforcing transcription factors plus chromatin and methylation states re-established after each division. The four factors lower the barrier; noise does the rest. That the escape happens at all also settles the older question: nothing was deleted on the way down.

Q: Argue from first principles why morphological evolution sits disproportionately in non-coding regulatory sequence.
A: A developmental transcription factor is deployed in many tissues at many times, so a coding change alters every deployment at once and selection sees the total fitness effect, which is usually prohibitive. Enhancers are modular, roughly one per tissue, time and domain, so changing one alters exactly one deployment. In sticklebacks the Pitx1 coding sequence is intact in pelvic-reduced fish, expression is lost only in the pelvic region, and the causal lesion is deletion of the Pel enhancer, whose reintroduction restores the pelvis.

## Developmental logic: lineage and position

Q: A laser ablates a single precursor cell. What do you expect to see afterwards if fate is set by lineage, and what if it is set by position?
A: If fate is set by lineage (mosaic development), the ablated cell's descendants are simply missing: the determinants were inherited, nothing supplies them again, and a lost cell is a lost structure. If fate is set by position (regulative development), the neighbours re-read their coordinates and re-pattern to fill the gap. The same contrast appears on transplantation, where a lineage-specified cell keeps its original fate in the new site while a positionally specified one adopts the fate of the new position.

Q: C. elegans has an invariant somatic cell lineage. Give two reasons why "the worm proves fate is set by lineage" is still wrong.
A: First, the canonical lineage animal also uses induction: the anchor cell in the overlying gonad signals to six vulval precursor cells, and Kimble's ablation of the anchor cell before the L3 stage made all six take the default, non-vulval fate. Second, no cell anywhere reads its own pedigree; there is no address register. Invariance describes the output, while the mechanism is entirely local, asymmetric partitioning of cytoplasmic determinants at each division plus short-range signalling between the products, so the determinism is emergent rather than implemented.

## The Drosophila segmentation hierarchy, found by screening

Q: The three segmentation gene classes were defined years before any of the genes was cloned. Defined on what, and what are the three?
A: On the geometry of the missing cuticle pattern in dead embryos, from roughly 27,000 balanced lines screened deliberately for embryonic lethals. Gap mutants lack a contiguous block of adjacent segments, implying a gene acting over one broad aperiodic domain; pair-rule mutants lack alternate segments or part of every alternate segment, implying two-segment periodicity; segment-polarity mutants lack part of every segment with the remainder mirror-duplicated, implying one-segment periodicity plus a front-to-back axis within each segment. The molecules came later and had to fit the classes.

Q: Why was the cuticle of a dead embryo the right instrument, and why screen for embryonic lethals on purpose?
A: The cuticle is high-dimensional: a patterned shell with denticle belts in a stereotyped arrangement, so it does not report "abnormal", it reports precisely which piece of the pattern is missing and where. It also survives the animal's death, mounts flat and is scored in seconds. Embryonic lethals were the deliberate target because anything patterning the body plan kills the embryo when broken, so a screen scoring viable adults would have discarded the entire class of interest, at the price of maintaining every mutagenised chromosome as a heterozygous stock over a balancer.

Q: A screen recovers a mutant whose embryos are missing every second segment. What can you predict about the gene before anything is cloned?
A: That it is a pair-rule gene expressed with two-segment periodicity, so expect roughly seven stripes along a fourteen-segment embryo, and that it sits below the gap genes and above the segment-polarity genes. The periodicity of the defect predicts the periodicity of the expression, which is a molecular prediction read off the shape of a dead larva: when even-skipped was eventually stained it was in seven stripes, and the screen had already said it would be.

Q: Three phenotype classes are three piles, not a hierarchy. What turns them into an ordered hierarchy?
A: Asymmetric dependence. Break tier k and everything downstream is corrupted while everything upstream is untouched: remove bicoid and the gap-gene domains are lost or displaced, remove a gap gene and the pair-rule stripes shift, remove a pair-rule gene and the segment-polarity stripes fail in alternate positions. None of it runs backwards, and the direction in which corruption propagates is the direction of the arrow.

Q: What is the genetic signature of a maternal-effect gene, and what does it cost the screen?
A: The embryo's phenotype is set by its mother's genotype rather than its own, because the mother loaded the egg cytoplasm before the embryo had a genome to consult. A homozygous mutant mother gives uniformly defective embryos whatever she is crossed to, while her heterozygous sister gives normal embryos even though a quarter of them are homozygous mutant, so reciprocal crosses disagree sharply and the inheritance looks lagged by a generation. The screen therefore shifts by a generation: you score the offspring of homozygous mutant mothers, not the mutants themselves.

## Hox genes and homeosis as genetics

Q: What does a homeotic transformation establish about how a body is built?
A: That identity is a variable separable from the structure being built. Losing bithorax complex function transforms the third thoracic segment into a copy of the second, so halteres become wings and the fly has four, and nothing novel was constructed: a segment that was going to be built anyway was built with the wrong identity. The structural programme therefore exists independently and a selector gene assigns which structure it makes, a strong architectural claim obtained entirely from mutants.

Q: What does the sign of a homeotic transformation tell you about a Hox gene?
A: Loss of function transforms a posterior structure toward a more anterior identity, so anterior is the default; ectopic expression transforms anterior toward posterior. Where two Hox genes are co-expressed the more posterior usually prevails, which shows up genetically as epistasis between Hox genes and is one reason a single loss of function can be silent.

## Epistasis: ordering a pathway with a double mutant

Q: Why can a double mutant order two genes when neither single mutant can?
A: Model the pathway as a composition, output = f_n( ... f_2( f_1(input) ) ... ). A null allele of gene i replaces f_i with the constant function OFF and a constitutive allele replaces it with the constant ON; both are the same operation, a clamp that discards its argument. Put clamps at positions j and k with j < k: since f_k ignores its input, nothing f_j produced can reach the output, so the double mutant's phenotype is set by the clamp with the larger index. The entire inference is "a constant function ignores its argument".

Q: Is the epistatic mutation the upstream gene or the downstream one?
A: It depends on the pathway type, and getting this backwards is the commonest error in reading a double mutant. In a switch regulatory pathway, where the assay reads the state of a final decision, the last clamp wins (argmax) and the epistatic mutation is downstream. In a substrate-dependent pathway, where the assay reads which compound accumulates, the earliest block wins (argmin) and the epistatic mutation is upstream. The type is a claim about what your assay measures, not about the molecules, so classify the assay before converting "epistatic" into a direction.

Q: Two mutants are both Vulvaless and the double is Vulvaless. Your supervisor calls the experiment a failure. Was it, and what should you do instead?
A: It did not fail; it was incapable of succeeding, and that was predictable in advance. Both nulls clamp the output to the same value, so both orderings predict the same double-mutant phenotype and the observation is consistent with every hypothesis. You need a pair with opposite phenotypes, one stuck off and one stuck on: build a constitutive allele, or find a negative regulator in the same pathway whose loss gives the opposite phenotype. let-60(gf), which is Multivulva, against let-23(lf), which is Vulvaless, resolves the order in a single cross.

Q: What four conditions must hold before a double mutant validly orders two genes?
A: Both alleles must be null or fully constitutive, since a hypomorph is a partial clamp rather than a constant function and the derivation collapses; test each independently, because a true null is no worse opposite a chromosomal deletion of the locus than opposite itself. The single mutants must have opposite, distinguishable phenotypes. The genes must act in the same pathway, since genes in parallel pathways give a double merely worse than either, which is an interaction and not an ordering. And you must know the pathway type, because the rule inverts.

Q: lin-1 loss of function is Multivulva. Which inference does that support, and which does it not?
A: It gives the sign of the edge, not the position. Removing lin-1 produces more vulva, so wild-type LIN-1 prevents vulval fate: it is a repressor, and the pathway works by relieving its repression. The double mutants placed lin-1 in the order and said nothing about sign. Position comes from double mutants and sign comes from single mutants taken alone; fuse the two inferences and you draw a chain of activators that is topologically right and mechanistically backwards.

## Mammalian development, germ layers and the neural crest

Q: Name the principal derivatives of the three germ layers, and say what a germ-layer label actually asserts.
A: Ectoderm gives epidermis and its appendages plus the entire nervous system; mesoderm gives heart, blood, bone, skeletal muscle, kidney and connective tissue; endoderm gives the gut tube and its outgrowths, meaning lungs, liver, pancreas and thyroid. They are produced at gastrulation, when epiblast cells move through the primitive streak (mouse around embryonic day 6.5, human around days 14 to 16). The label asserts ancestry, not tissue type: cranial neural crest is ectodermal in origin yet makes bone and cartilage.

Q: The neural crest is sometimes called a fourth germ layer. Where does it come from, and what does it make?
A: It arises at the border between the neural plate and the epidermal ectoderm, delaminates, and migrates throughout the embryo. Its derivatives read like a list assembled at random: neurons and glia of the peripheral nervous system including the enteric nervous system, melanocytes of skin, hair and inner ear, most craniofacial cartilage and bone, the adrenal medulla, and the smooth muscle of the great vessels. Knowing that list is what converts a multi-organ syndrome into a prediction.

Q: A newborn has congenital sensorineural deafness, patches of white hair and depigmented skin, and a distal colon that will not pass stool because it lacks a nerve plexus. Why is this most likely one disease?
A: Because it is one lineage, not three organs. Melanocytes, including those in the stria vascularis of the inner ear where they are required for normal hearing, are neural crest derivatives, and so are the enteric neurons that must migrate the whole length of the gut; failing to reach the distal segment leaves it aganglionic and obstructed, which is Hirschsprung disease. One defect in crest specification, survival or migration produces all three, and the combination is Waardenburg syndrome type 4 (Shah-Waardenburg). The transferable move is that when a syndrome links organs with no anatomical connection, ask what they shared in the embryo.

## Gene targeting in the mouse

Q: In a positive-negative selection targeting vector, why does HSV-tk sit outside the homology arms, and what happens if you move it inside?
A: Homologous recombination copies in only what lies between the regions of homology, whereas random integration inserts the whole linear molecule. So with tk outside the arms, a correctly targeted cell gains neo (which sits between the arms) but never tk and survives ganciclovir, while a random integrant keeps tk, phosphorylates ganciclovir into a toxic nucleotide analogue, and dies. Move tk inside and recombination copies it in too, so ganciclovir kills targeted and random cells alike and you have selected against the outcome you wanted. The step is geometric, not chemical.

Q: Positive-negative selection enriches correct targeting about 2,000-fold. What does that number not do for you?
A: It enriches; it does not verify. The planned homologous replacement happens in only about one per thousand transformed mammalian cells, so survivors of the double selection still contain wrong events and correct targeting must be confirmed by Southern blot or long-range PCR with one primer outside each arm. What the 2,000-fold did buy is generality: the enrichment is independent of whether the target gene is expressed in ES cells, which is the clause that made the method more than a trick for selectable loci.

Q: Which property of ES cells makes gene targeting work, and how do you tell for free that a targeted allele reached the germ line?
A: Not that they grow in culture, but that when injected back into a host blastocyst they contribute to every tissue of the animal including the germ line, so a change made in a dish can be transmitted to offspring. For the readout, use ES cells from an agouti strain and host blastocysts from a black strain: the chimeric pup's agouti fraction estimates the ES contribution, and because agouti is dominant, an agouti pup from a chimera crossed to black can only have come from an ES-cell-derived gamete. The assay is coat colour, readable at weaning.

Q: In what sense were knockout and knock-in never separate techniques?
A: The homology arms are an address and whatever sits between them is a payload, so the operation is always write(address, payload). A selection cassette replacing essential exons gives a knockout; a single altered codon gives a knock-in modelling a human variant in its own locus; a fluorescent protein in frame at the start codon gives a reporter under the gene's own regulation rather than a transgene's guess at it; Cre gives a tissue-specific driver line; and essential exons flanked by loxP sites give a conditional allele.

## Conditional and inducible alleles

Q: "A knockout mouse tells you what the gene does." What is wrong with that sentence?
A: Two things. About a third of null lines never yield a healthy adult homozygote, since of the first 1,751 IMPC knockouts 410 were lethal and 198 subviable, roughly 23% and 11%, so for those genes the knockout answers "is it essential?" and then stops. And the survivors had all of development to compensate, so what you measure is an animal built without the gene, which is not the same as the consequence of losing it.

Q: Two different failure modes send you from a null to a conditional allele. What are they, and which axis does each require you to restrict?
A: If the animal dies before the tissue of interest exists, restrict in space and delete in one lineage only; this is exactly the founding experiment, where germline deletion of the DNA polymerase beta promoter and first exon is lethal but a Cre transgene making the identical deletion only in T cells gave mice that lived. If the animal survives but has compensated during development, giving a suspiciously mild phenotype, restrict in time and delete acutely in an animal that developed normally. The second case is subtler and commoner than expected, because a viable stable mutant has been selected for tolerating the loss and acute removal has not.

Q: Why is a floxed allele not a knockout allele, and how is the trigger supplied?
A: The floxed allele is engineered to be functionally wild type until Cre arrives, with the loxP sites placed in introns flanking essential exons, so it is deliberately silent. That silence is a design requirement: homozygous floxed mice without Cre are a required control and a phenotype in them means the line is broken. The trigger lives in a separate animal, a driver expressing Cre from a tissue-specific promoter, usually knocked into an endogenous locus so it inherits that gene's real regulation; crossing the two deletes the exons only in cells that have expressed Cre, permanently and in every descendant.

Q: Why does "conditional knockout" name an intention rather than a genotype?
A: Because recombination is not atomic. Efficiency is well below 100% and varies with locus, cell type and driver, so the tissue is a mosaic, and unrecombined cells frequently carry a growth advantage and repopulate it, which makes a real phenotype fade with time and read as a false negative. Drivers are also leaky, recombining in unintended tissues and sometimes the germ line, which turns a conditional allele into a whole-body null in the next generation.

Q: How does CreER add a time axis, and what makes it respond to the drug rather than to the animal's own hormone?
A: Cre is fused to a mutated ligand-binding domain of the oestrogen receptor, and the fusion sits in the cytoplasm unable to reach DNA until ligand binds. The mutations, G400V/M543A/L544A in CreER-T2, make it respond to the drug 4-hydroxytamoxifen while ignoring endogenous oestrogen. Space comes from the promoter driving Cre and time from when you dose the drug, though CreER lines retain some ligand-independent background activity.

Q: Homozygous nulls for gene X die at E9.5 and you want to know what X does in adult liver. Name the three minimum controls for the conditional experiment and what each catches.
A: Floxed-only littermates, showing the allele is genuinely silent without Cre. Cre-only littermates, controlling for Cre toxicity, which is real at high expression in some tissues, and for tamoxifen's own effects. And a lox-stop-lox reporter crossed in, mapping where Cre actually recombined rather than where the promoter was supposed to send it, which catches leaky drivers, germline recombination and the achieved efficiency. The mosaicism it reveals should be reported, since deletion is never complete.

Q: Change what sits between the loxP sites and Cre stops being a deletion tool. What does it become?
A: An irreversible, heritable label. Put a transcriptional stop cassette flanked by loxP sites in front of a reporter at a ubiquitously expressed locus, conventionally Rosa26: the reporter is silent until Cre excises the stop, then it switches on permanently in that cell and every descendant whether or not Cre is ever active again. Barker and colleagues used this with EGFP-IRES-CreER-T2 knocked into Lgr5 plus a Rosa26-lacZ reporter, and one tamoxifen pulse labelled single crypt-base cells whose descendants later filled continuous ribbons from crypt base to villus tip containing every differentiated cell type, demonstrating self-renewal and multipotency rather than asserting them.

Q: Did CRISPR make gene targeting obsolete?
A: No; it replaced the addressing step, not the grammar. Editing specifies the address with a 20-nt guide RNA plus a PAM instead of kilobase homology arms, works in any species rather than only those with germline-competent ES lines, and reaches a founder animal in weeks rather than roughly a year. But floxed exons, tissue-specific Cre drivers, lox-stop-lox reporters and inducible recombinases are unchanged, remain the standard way to ask a spatially and temporally restricted question in a mammal, and are now routinely built with CRISPR because it makes inserting loxP sites cheap. Editing buys speed and reach; the targeting grammar buys control over what, when and where.
