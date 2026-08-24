# Question bank — Part 07: Molecular evolution

Covers [Ch 33-35A](../part-07-molecular-evolution/33-neutral-theory-and-selection-tests.md).

Convert to Anki: `python reference/to_anki.py question-banks/ --out anki-import.tsv`

## Neutral theory, the clock and nearly neutral

Q: What does neutral theory actually claim, and why is "neutral theory says selection doesn't matter" wrong?
A: Kimura's 1968 claim is that the overwhelming majority of substitutions distinguishing two species are selectively neutral, fixed by drift rather than by selection. It does not say selection is unimportant: purifying selection is pervasive, and it is precisely why most mutations never survive to become differences between species in the first place.

Q: Derive the neutral substitution rate k, and say exactly where the population size cancels.
A: With 2N gene copies at a locus, neutral mutations enter at rate 2N x mu0 per generation, and each fixes with probability 1/(2N), because under drift alone allele frequency is a martingale absorbed at 0 or 1, so P(fix) equals the mutant's starting frequency. The product is k = mu0. Large populations generate proportionally more neutral mutations and fix a proportionally smaller fraction of each, so nothing about demography enters the neutral substitution rate.

Q: What must be exactly true for the cancellation in k = mu0 to hold?
A: The selection coefficient must be exactly 0, not merely small, because the martingale argument that gives P(fix) = p0 requires it. Give the mutation any consistent fitness effect and P(fix) picks up a dependence on Ne x s, the cancellation fails, and the substitution rate becomes demography-dependent. Notably, the argument does not require N to be constant over time.

Q: Does k = mu mean that large populations evolve more slowly?
A: No. It means the neutral substitution rate is independent of population size. A new beneficial mutation with advantage s fixes with probability about 2s, so adaptive substitutions accumulate at 2N x mu_b x 2s = 4N mu_b s, which is proportional to N. Large populations therefore adapt faster while ticking at the same neutral rate.

Q: In what sense is the molecular clock not a clock?
A: If substitutions were independent events at constant rate, fixations would be a Poisson process with index of dispersion R = variance/mean equal to 1. Across proteins R is commonly reported in the range of about 1 to 35, frequently well above 1, so the clock is overdispersed and ticks more erratically than radioactive decay. It yields dates with wide and often understated confidence intervals.

Q: Name the biological causes of clock overdispersion.
A: The generation-time effect (mutation rate per generation is far better conserved across mammals than mutation rate per year), lineage-specific mutation rates driven by repair fidelity, metabolic rate and sperm-production schedules, episodic changes in constraint that shift the neutral fraction f0, and nearly neutral dynamics that make the rate depend on a fluctuating Ne.

Q: Why is "nearly neutral" a quantitative claim rather than a hedge?
A: Because the criterion is explicit: a mutation is effectively neutral when the absolute value of 2 Ne s is much less than 1, and effectively selected when it is much greater, so selection is blind to any effect smaller than about 1/(2Ne). That threshold is the drift barrier, and it moves with population size, so the same mutation can be neutral in one species and selected in another.

Q: What did the neutralist-selectionist debate actually settle?
A: Not the question of how much selection there is. Its legacy is a computable null model: before Kimura there was no quantitative expectation for what a sequence should look like absent selection, so "this gene is under selection" was an assertion, and afterwards it became a rejected null with a p-value. Neutral theory is most useful precisely where it is false.

## Divergence, distances and substitution models

Q: Why is the raw p-distance biased, and where does it saturate?
A: A site can be hit more than once: A to G to A leaves no trace, and A to G to C looks like one change instead of two, so observed difference undercounts substitutions and does so increasingly with time. For two random sequences with equal base composition, p saturates at 0.75 -- you cannot observe more than three-quarters mismatch however long they have diverged.

Q: State the Jukes-Cantor correction and describe its behaviour at both extremes.
A: d = -(3/4) ln(1 - (4/3) p), measured in substitutions per site. For small p, d is approximately p; as p approaches 0.75 the logarithm diverges and d goes to infinity; and for p greater than or equal to 0.75 the formula is undefined, which is the honest way of saying the signal is gone.

Q: Two lineages differ at 80% of sites. What does Jukes-Cantor give, and what should you conclude?
A: 1 - (4/3)(0.80) = -0.0667, and the logarithm of a negative number is undefined, so the estimator has no value. Since the equilibrium probability that two sequences differ at a site is 3/4, an 80% difference is worse than random: it is evidence that the model is wrong -- compositional bias, non-random data, or a bad alignment -- not evidence of enormous distance.

Q: A four-taxon example corrects p = 0.435 to d = 0.651 but p = 0.136 only to d = 0.150. Why does that matter?
A: The multiple-hit correction is nonlinear and hits long branches hardest -- a 50% increase versus a 10% increase. Omitting or under-applying it compresses long branches more than short ones, which is exactly the mechanism that pulls long branches together and produces long-branch attraction.

Q: What does each of K80, HKY85 and GTR add to JC69, and which addition usually matters most?
A: K80 adds a transition/transversion ratio (1 free parameter), HKY85 adds unequal base frequencies (4), GTR frees all six exchangeabilities under time reversibility (8). But the single most important term is usually +Gamma, which lets the relative rate at a site be a draw from a Gamma distribution, because ignoring rate variation across sites under-corrects multiple hits at fast sites and feeds long-branch attraction.

Q: In phylogenetic model selection, which error is worse -- too few parameters or too many?
A: Too few. Under-parameterisation is a systematic bias that grows with more data, whereas over-parameterisation merely costs estimation variance, so when in doubt choose the richer model. Note also that +I and +Gamma are partly confounded, since a Gamma with small shape already places mass near zero rate, so their individual estimates should not be over-interpreted.

## dN/dS: a gene as its own control

Q: Why can you not simply compare raw counts of synonymous and nonsynonymous changes?
A: Because the genetic code does not offer the two classes equally: summed over a typical coding sequence, roughly one site in four is synonymous and three in four nonsynonymous. A gene evolving with no selection at all therefore produces about three times as many nonsynonymous as synonymous changes, so counts must be normalised into rates per opportunity -- structurally the same as an exposure offset in a Poisson regression.

Q: What do omega < 1, omega about 1 and omega > 1 mean, with typical values?
A: omega below 1 is purifying selection, typically 0.1 to 0.3 for mammalian orthologs and about 0.2 genome-wide for human-chimpanzee. omega about 1 is neutral evolution, seen in pseudogenes and genes that have lost function. omega above 1 is positive selection, amino-acid changes fixed faster than neutral expectation.

Q: Does a gene-wide omega below 1 show that a gene is not under positive selection?
A: No, and this is the normal case rather than a pathology. omega is averaged over every codon and the whole branch, so a 400-residue protein with 5 strongly selected residues and 395 strongly constrained ones still has a gene-wide omega well below 1. The fix is to stop averaging: site models, branch models and branch-site models test by likelihood ratio whether a class with omega above 1 is needed.

Q: Why should you not compute dN/dS on variants segregating within a population?
A: Segregating variants include deleterious ones that selection has not yet removed, so within-species omega is inflated toward 1 and mostly reflects how recently the sampled sequences shared an ancestor rather than selection. With polymorphism data the appropriate test is McDonald-Kreitman.

Q: Give two reasons dN/dS can mislead even between species, apart from averaging.
A: dS is not perfectly neutral -- codon usage bias, exonic splicing enhancers and CpG mutational hotspots give synonymous sites constraint or an elevated rate, shifting omega in either direction. And at deep divergence dS saturates first, so the denominator becomes unreliable and omega becomes noise.

## Polymorphism against divergence: the SFS and McDonald-Kreitman

Q: What is the site frequency spectrum, and what does the standard neutral model predict for it?
A: For a sample of n sequences, the SFS is the vector of counts of segregating sites at which the derived allele appears in exactly i copies, for i from 1 to n-1. Under constant size, no selection and infinite sites, the coalescent gives expected count theta/i with theta = 4 Ne mu -- rare variants are common and common variants are rare. Without an outgroup to identify the ancestral allele you get the folded spectrum, which merges i and n-i.

Q: A locus has Tajima's D of +2.0. What is that consistent with?
A: An excess of intermediate-frequency variants, which is consistent with balancing selection, with a recent bottleneck, and with sampling across cryptically structured subpopulations. As with negative D, these are not distinguishable from D alone, so the inference still has to be an outlier argument against the genome-wide distribution or a test against an explicitly fitted demographic null.

Q: What do Fu and Li's D and F contrast, and what is the practical trap in using them?
A: They contrast singletons -- mutations that fell on the external branches of the coalescent -- against Watterson's theta or pi, which makes them sensitive to very recent events. The trap is that a sequencing error looks exactly like a singleton, so unfiltered data can produce a strong apparent signal that is entirely artefact.

Q: Why does the difference between pi and Watterson's theta contain information, and information about what?
A: Both are unbiased estimators of theta under neutrality, but they are different weighted sums of the same spectrum: Watterson's theta weights every segregating site equally and so is driven by the numerous rare variants, while pi peaks at intermediate frequency. Their difference has expectation zero under the null, so it is a statistic about the shape of the spectrum, not about the amount of variation.

Q: A locus has Tajima's D of -2.0. What can you conclude?
A: On its own, nothing. A negative D means an excess of rare variants, and that is equally consistent with a recent selective sweep, background selection, ordinary widespread purifying selection, and population expansion. Demography acts genome-wide while selection acts locally, so the only valid inference is an outlier argument against the empirical genome-wide distribution, or a test against an explicitly fitted demographic null.

Q: Why do p-values for Tajima's D not come from a z-table?
A: Despite the normalisation by the square root of its variance, D is not standard normal -- its null distribution is skewed and bounded. Significance must come from coalescent simulation under the relevant null model instead.

Q: What does Fay and Wu's H detect that Tajima's D cannot, and what does it cost?
A: H contrasts pi with an estimator weighted toward high-frequency derived variants. Hitchhiking drags a few neutral variants that sat on the sweeping haplotype to high frequency, whereas population growth does not, so H separates sweeps from expansion. The cost is that it needs a reliable outgroup to polarise ancestral from derived alleles, and it is sensitive to outgroup misassignment.

Q: How is a McDonald-Kreitman table built, and what does an excess of Dn mean?
A: Classify every variant site in a gene two ways: by effect (synonymous or nonsynonymous) and by status (polymorphic within your species or fixed against an outgroup), then test the 2x2 with Fisher's exact test or a G-test. An excess of fixed nonsynonymous differences beyond what the polymorphism ratio predicts means amino-acid changes were driven to fixation faster than drift can manage, which is positive selection.

Q: What is alpha in a McDonald-Kreitman test, and why is the test robust to demography?
A: alpha = 1 - (Ds x Pn)/(Dn x Ps) estimates the proportion of nonsynonymous substitutions fixed by positive selection. Synonymous and nonsynonymous sites are interdigitated in the same codons and share the same genealogy, mutational input and demographic history, so a bottleneck or expansion distorts both classes identically and largely cancels in the ratio of ratios.

Q: What confound does McDonald-Kreitman remain vulnerable to, and what are the typical alpha values?
A: Slightly deleterious nonsynonymous variants segregate as polymorphism but rarely fix, inflating Pn and driving alpha downward, sometimes negative. Standard mitigations are discarding polymorphism below a 5 to 15% frequency cutoff, or fitting a distribution of fitness effects explicitly. Corrected estimates run around alpha = 0.5 in Drosophila and near zero to modest in humans, as nearly neutral theory predicts from the Ne difference.

Q: A gene has omega = 0.13 and a significant McDonald-Kreitman result with alpha = 0.59. Is that a contradiction?
A: No. Overwhelming purifying selection across the gene as a whole and a significant excess of adaptive fixations at a minority of sites are simultaneously true. This is exactly why a gene-wide omega below 1 tells you nothing about whether positive selection occurred.

## Sweeps, haplotypes and background selection

Q: How wide is the region affected by a selective sweep, and what sets the width?
A: A sweep affects the region out to roughly where the recombination rate equals the selection coefficient, so the width in base pairs is approximately s divided by the recombination rate per base pair. With s = 0.02 and 1 cM/Mb (10^-8 per bp), that is about 2 Mb -- an enormous scar on the genome.

Q: What is the difference between a hard and a soft sweep, and why does it matter for detection?
A: A hard sweep starts from a single new mutation on a single haplotype and collapses diversity to one long, nearly identical haplotype. A soft sweep starts from standing variation already present on several haplotypes, or from recurrent mutation, so several backgrounds rise together, diversity is reduced less, and the classical signature is far weaker. Most detection methods have poor power against soft sweeps, so much of the argument about how common adaptation is turns on how many sweeps are invisible.

Q: What is the logic behind haplotype-based tests such as EHH and iHS?
A: High frequency and long haplotype are contradictory under neutrality: a neutral allele takes a long time to drift up, and over that time recombination shreds the haplotype it sits on. An allele that is both common and still carried on an unbroken megabase-scale haplotype must have got there fast. iHS integrates extended haplotype homozygosity for derived versus ancestral alleles and detects incomplete, ongoing sweeps.

Q: The sickle allele HbS is the textbook case of balancing selection. Why do genome scans barely detect it?
A: HbS is maintained by heterozygote advantage against Plasmodium falciparum, but it is far too young and too low in frequency to have produced the elevated Tajima's D signature, which takes on the order of Ne generations to accumulate. It is a useful reminder that a selective mechanism and its detectable signature are different things.

Q: Why is background selection the key confound for sweep scans, and how do modern scans handle it?
A: Purifying selection also removes linked neutral variation, because every chromosome carrying a new deleterious mutation is eventually eliminated along with its neighbourhood. Background selection predicts reduced diversity -- worst where recombination is low and functional density high -- plus a mild skew toward rare variants, reproducing the two signatures used to claim sweeps, and it is chronic rather than episodic. Modern scans fit a background-selection baseline (a B-map) first and look for departures from that, not from a constant-size neutral null.

Q: You find a window with 20% of average diversity and Tajima's D of -1.8. Name one measurement that discriminates sweep from background selection.
A: Fay and Wu's H: hitchhiking pulls a subset of neutral variants to high derived frequency, and background selection and expansion do not, so a strongly negative H points to a sweep. Alternatives are haplotype length at a given allele frequency (iHS or XP-EHH), which background selection cannot produce, or checking whether local recombination rate and functional density already predict the observed diversity.

Q: Match the main selection tests to the timescales they can see.
A: dN/dS and branch-site models read divergence between species, 10^6 to 10^8 years. McDonald-Kreitman uses divergence plus polymorphism, 10^5 to 10^7 years. Tajima's D and Fay-Wu H read the site frequency spectrum over roughly 0.1 to 1 x Ne generations, about 10^4 to 10^5 years in humans. Haplotype tests such as iHS and XP-EHH see only the last roughly 10^4 years, after which recombination erases the signal.

## Reading trees: topology, homology and alignment

Q: What does a branch length in a phylogeny actually mean?
A: Expected substitutions per site along that edge -- not years and not generations. Converting branch lengths into time requires a clock model plus an external calibration, and both are additional assumptions rather than things the sequence data supply.

Q: How many unrooted binary topologies are there on n taxa, and where does the formula come from?
A: An unrooted binary tree on n tips has n-2 internal nodes and 2n-3 branches, so adding tip n+1 means splitting one of those 2n-3 branches, each choice giving a distinct topology. Starting from U(3) = 1, the product gives U(n) = (2n-5)!!. Rooting adds one more choice, since the root can sit on any of the 2n-3 branches, so R(n) = (2n-3)!! -- exactly the unrooted count for n+1 taxa.

Q: Why is exhaustive search over tree space not an option, and what replaces it?
A: The count explodes: 3 topologies at n = 4, about 2 x 10^6 at n = 10, 2.2 x 10^20 at n = 20, and 2.8 x 10^80 at n = 53, which is more unrooted topologies than the usual estimate for atoms in the observable universe. Exhaustive search is over at about n = 11 and branch-and-bound at about n = 20, so larger problems use heuristic hill-climbing with NNI, SPR and TBR rearrangements. Finding the optimal tree is NP-hard under both parsimony and likelihood, so you get a good local optimum, not a guarantee -- which is why serious analyses run many searches from different starting points.

Q: Distinguish monophyly, paraphyly and polyphyly, and say which is a claim about history.
A: A monophyletic group is an ancestor plus all of its descendants. A paraphyletic group omits some descendants, as in "reptiles" excluding birds or "prokaryotes" excluding eukaryotes. A polyphyletic group is assembled on a shared feature whose common ancestor is not in the group, so it reflects convergence rather than descent. Only monophyly is a claim about history; the other two are claims about a naming convention.

Q: Why is it wrong to read a phylogeny as showing which species evolved from which?
A: All tips are contemporary. Extant species descend from inferred internal nodes, not from each other, so humans did not evolve from chimpanzees -- both descend from an unsampled common ancestor represented by an internal node.

Q: Why is morphological similarity not evidence of close relationship?
A: Similarity can arise from convergence, which produces polyphyletic groupings, or from shared retained ancestral traits, which are compatible with any relationship. Only shared derived characters group taxa.

Q: Why is it meaningless to say two sequences are "70% homologous"?
A: Homology is binary -- either two sequences descend from a common ancestral sequence or they do not. The percentage you mean is identity or similarity, which is a measurement on the alignment, not a statement about ancestry.

Q: How can mixing up orthologs and paralogs wreck a phylogeny without lowering support?
A: If a gene duplicated into copies alpha and beta before the speciations of interest, and your "human sequence" is alpha while your "mouse sequence" is beta, then the deepest split in your tree is the duplication rather than the human-mouse speciation. The tree is placed far too deep and reported with total confidence: it is not wrong as a gene tree, it is simply not the tree you thought you were building.

Q: Why is alignment error the most under-reported source of error in phylogenetics?
A: It is systematic rather than random, so it does not average out as more sites are added, and it is identical in every bootstrap replicate, so it produces high support for the wrong answer rather than low support. Progressive alignment compounds this, since early mistakes are never revisited and the guide tree biases the alignment toward itself.

## Tree-building methods, support and dating

Q: Why does UPGMA fail without a molecular clock, and in what specific direction?
A: UPGMA joins the closest pair and places their node at half their distance, which recovers the true tree only if the distance matrix is ultrametric -- that is, only under a clock. Without one it joins two slowly evolving lineages because they look similar, even when they are not sisters. It is fine for a quick dendrogram and wrong as a phylogenetic method.

Q: What does neighbour-joining do that makes it statistically consistent?
A: It joins the pair minimising (n-2)d_ij - r_i - r_j, where r_i is the sum of taxon i's distances to everything else, so it asks whether i and j are close relative to how far each is from all other taxa rather than merely close. On an additive matrix it recovers the true tree exactly, and since corrected distances converge to additive ones with sequence length, the consistency is inherited from the distance correction.

Q: Why is parsimony not assumption-free, and where does it fail?
A: It has an implicit model assuming change is rare and evenly distributed. With four taxa where two non-sister branches are long, a parallel change on both long branches supports the wrong grouping at frequency about p squared over 3, while the true grouping needs a change on the short internal branch at frequency about q. When p squared over 3 exceeds q, the misleading pattern is genuinely more common, so more data gives more confidence in the wrong tree -- statistical inconsistency in the Felsenstein zone.

Q: What does Felsenstein's pruning algorithm compute, and why does it make maximum likelihood feasible at all?
A: It is dynamic programming up the tree: L_k(s) = P(data at the tips below node k given that node k is in state s), obtained for an internal node as the product over its two children of sum_x P_sx(t) L_child(x), with tips initialised to indicator vectors and the site likelihood equal to sum_s pi_s L_root(s). The cost is O(n x s^2) per site with s = 4 states, linear in the number of taxa, whereas summing naively over all 4^(n-1) ancestral state assignments is not.

Q: Why does MCMC over tree space need unusually careful convergence checking, and what do you check?
A: Tree space is multimodal, so chains get stuck on topological islands separated by low-likelihood valleys. Run multiple chains from different starting points, check the standard deviation of split frequencies between them and the effective sample size, and use Metropolis-coupled MCMC with heated chains to cross the valleys. Branch-length priors are also not innocuous: a badly chosen one inflates tree length and distorts posteriors without announcing itself.

Q: What does a bootstrap proportion measure, and what can it never detect?
A: It measures how evenly the signal for a split is spread across alignment columns: a high value means the split does not depend on a handful of sites. It cannot detect systematic error, because a wrong model, a bad alignment or a paralog masquerading as an ortholog is present in every replicate, so you get 100% support for the wrong tree. Bootstrap measures precision, not accuracy.

Q: How do posterior probabilities differ from bootstrap proportions, and are they interchangeable?
A: A posterior probability is P(clade given data, model and prior), a direct probability statement, but it is well calibrated only if the model is right. It is empirically much more confident than bootstrap on the same data -- posteriors of 1.00 alongside 60% bootstrap are routine -- and under model misspecification it is systematically overconfident for the same structural reason. Never compare a 0.95 posterior with a 95% bootstrap as if they were the same statement.

Q: Why can sequence data alone not root a tree, and what does an outgroup supply?
A: Almost all substitution models are time-reversible, so the likelihood is identical wherever the root is placed on the tree, making root position unidentifiable from the alignment. An outgroup supplies external information -- prior knowledge from fossils, taxonomy or earlier phylogenies that this taxon diverged before any ingroup taxa diverged from each other. Midpoint rooting substitutes a different assumption, namely a clock.

Q: Will sequencing more genomes narrow a divergence-date estimate?
A: No. Only the product of rate and time is identified by sequence data, so as sequence length grows the credible interval on a divergence time converges to a finite width set entirely by calibration uncertainty. This is why published dates for the same event differ twofold between studies, and why a fossil gives a minimum age for a divergence rather than the divergence date itself.

## The coalescent, gene trees and introgression

Q: Give the expected coalescent waiting times for a sample of n sequences from a population of N diploids.
A: With k lineages remaining there are k(k-1)/2 pairs, each coalescing with probability 1/(2N) per generation, so E[T_k] = 4N/[k(k-1)] generations. Summing telescopes to E[T_MRCA] = 4N(1 - 1/n), which means sampling more individuals barely deepens the tree -- n = 10 already reaches 90% of the limit.

Q: Why is a genealogy shaped like a broom, and what follows for estimating deep history?
A: The final interval with only two lineages left has E[T_2] = 2N, alone half the expected time to the MRCA, while the first coalescence among 100 samples takes about 0.0004N generations. Total branch length is 4N x H(n-1), so the deepest interval holds 35% of the mutational opportunity at n = 10 and still 19% at n = 100 -- deep estimates rest on very few independent events, so the fix is more loci, not more individuals.

Q: What connects the coalescent to Watterson's estimator?
A: Mutations land on branches at rate mu, and expected total branch length is 4N x H(n-1) with H the harmonic number, so E[S] = theta x H(n-1) with theta = 4N mu. That is Watterson's estimator derived rather than asserted, and the same structure explains the excess of singletons, since the many short terminal branches generate them.

Q: Do discordant gene trees mean somebody made a mistake?
A: No. Every locus has its own genealogy, and those genuinely differ from each other and from the species tree -- not from estimation error but because that is how populations work. With short internal branches relative to Ne, most loci disagree with the species tree, and that is the correct answer.

Q: Name the four sources of gene-tree/species-tree discordance and their signatures.
A: Incomplete lineage sorting, where ancestral polymorphism survives a speciation and sorts randomly, giving a symmetric excess of both discordant topologies. Introgression, which is asymmetric, favouring one discordant topology. Horizontal gene transfer, placing single genes deeply wrong, often with atypical composition. And duplication with loss, where paralogs mistaken for orthologs give splits that are too deep.

Q: Quantify incomplete lineage sorting for a species tree ((A,B),C).
A: Lineages A and B fail to coalesce in the ancestral AB population with probability e^-tau, where tau = T/(2N) is the internal branch in coalescent units, and if they fail all three topologies are equally likely, so P(discordant) = (2/3) e^-tau. At tau = 0.25 that is 52% discordance, at tau = 1 it is 25%, at tau = 3 it is 3.3%.

Q: What is Patterson's D, and why is concatenating loci not a safe fallback in the anomaly zone?
A: Counting ABBA and BABA site patterns across (((P1,P2),P3),Outgroup), D = (n_ABBA - n_BABA)/(n_ABBA + n_BABA) has expectation zero under incomplete lineage sorting because ILS is symmetric, so significant deviation indicates gene flow -- this is how archaic introgression was established. In anomaly zones the most probable gene tree differs from the species tree, so concatenation or a majority gene tree is positively misleading; coalescent-aware methods are required.

Q: What are the current estimates of archaic ancestry in living humans, and when did the Neanderthal gene flow happen?
A: Neanderthal ancestry runs about 1 to 2% in non-African populations, roughly 1.7% in Europeans and marginally higher in East Asians, and about 0.3 to 0.5% in African populations, mostly via back-migration from Eurasia. Denisovan ancestry is about 3 to 5% in Papuan and Oceanian populations, method-dependent and sometimes estimated lower, and about 0.1% in East Asians. The bulk of Neanderthal gene flow is dated to a single extended period roughly 50,500 to 43,500 years ago.

Q: How are introgressed archaic segments distributed across the human genome, and what does that distribution imply?
A: Not randomly. They are depleted on the X chromosome and near genes, which is consistent with purifying selection removing archaic ancestry, and enriched at a handful of loci -- immunity, skin and hair biology, and high-altitude adaptation via EPAS1 in Tibetans -- that were plausibly adaptive.

## Gene duplication and the fates of duplicates

Q: Name the three mechanisms that duplicate genes and the structural signature of each.
A: Unequal crossing over or NAHR gives a tandem array with adjacent same-orientation copies and a reciprocal deletion product. Retrotransposition gives a retrogene: intronless, with a poly-A tail and flanking target-site duplications, usually on a different chromosome and without its promoter. Whole-genome duplication duplicates every gene at once, leaving doubled synteny blocks genome-wide.

Q: You find a paralog on a different chromosome, with no introns and a poly-A tract. What should you predict about its expression?
A: It is a retrocopy, produced from a spliced mRNA, so it arrived without its promoter or enhancers. Expect its expression pattern to differ from the parent's -- it is either silent, becoming a processed pseudogene as most do, or driven by whatever regulatory sequence happened to lie nearby. A tandem duplicate, by contrast, brings its regulatory neighbourhood and starts with the parent's expression pattern.

Q: Why is decay to a pseudogene the default fate of a duplicate?
A: Immediately after duplication both copies are functional and either is dispensable, so a null mutation in either copy is neutral. Nulls therefore fix at rate u_n, the null mutation rate, independent of population size. The redundancy that makes a duplicate look like a free spare is exactly what makes the mutations destroying it invisible to selection.

Q: Derive the probability that neofunctionalisation preserves a duplicate, and say what it depends on.
A: Beneficial mutations arise at rate 2N u_b and fix with probability about 2s, giving rate 4N u_b s, while nulls fix at rate u_n; as competing Poisson processes the ratio gives P(neo) = 4Ns phi/(4Ns phi + 1) with phi = u_b/u_n. With phi = 10^-4 and s = 0.01, a vertebrate at Ne about 10^4 gets 3.8% while an insect at Ne about 10^7 gets 98%. Ohno's mechanism is efficient in large populations and nearly useless in small ones.

Q: How does subfunctionalisation preserve duplicates, and what is conspicuously absent from its formula?
A: Under the duplication-degeneration-complementation model, complementary degenerative mutations knock out different regulatory subfunctions in the two copies, so both become required; with r = u_r/u_c, the per-regulatory-element null rate over the coding null rate, P(sub) = 2r^2/(1+2r)^2 -- about 22% when the two rates are equal (r = 1). Population size is absent, so it works as well at Ne of ten thousand as at ten million, which is why preservation by decay, not Ohno's adaptive route, is the plausible default in small-Ne vertebrates.

Q: What is dosage balance, and what retention pattern does it predict?
A: Many proteins act in stoichiometric complexes, so changing one subunit's copy number alone causes misassembly and aggregation, making loss of a duplicated subunit deleterious rather than neutral. The prediction, which is observed, is reciprocal: complex subunits, ribosomal proteins, transcription factors and signalling components are preferentially retained after whole-genome duplication, where the whole complex doubled together, and preferentially lost after single-gene duplication.

Q: What shape should a genome-wide Ks histogram have, and what does a peak mean?
A: If duplicates are born at a steady rate and lost at a constant rate, the density of surviving pairs decays exponentially in Ks and nothing else. Any peak therefore requires a burst of simultaneous duplications, which is the standard evidence for a whole-genome duplication, dated by t = Ks/(2 r_s). Two caveats: Ks saturates above roughly 1 to 1.5, and gene conversion between paralogs resets Ks toward zero, making some pairs look spuriously young.

Q: How do HOX clusters give direct evidence for whole-genome duplication in vertebrates?
A: The invertebrate chordate amphioxus has one HOX cluster; humans have four, on four different chromosomes, with the same internal gene order. Two rounds of whole-genome duplication near the base of the vertebrates -- the 2R hypothesis -- explain 1 to 2 to 4 exactly, and the same 1:4 pattern recurs across many other vertebrate gene families. Teleost fish underwent a third round, 3R, and carry up to seven clusters.

## Orthology, genome size and horizontal transfer

Q: Orthologs are often described as "the same gene in another species". Why is that wrong?
A: Orthology is defined by the event at the most recent common ancestor -- speciation for orthologs, duplication for paralogs -- not by similarity or best-hit score. It is frequently one-to-many: two in-paralogs that duplicated after a speciation are both co-orthologs of the single gene in the other species, and the highest-scoring cross-species hit is often not the ortholog at all.

Q: What is the difference between an in-paralog and an out-paralog, and why does it matter?
A: The reference point is a given speciation. In-paralogs duplicated after it, so both are co-orthologs of the single gene in the other species and either may legitimately be paired with it. Out-paralogs duplicated before it, so their divergence predates the speciation and pairing them across species is an error -- exactly the mistake that places a gene tree far too deep while reporting full confidence.

Q: What are ohnologs and xenologs?
A: Ohnologs are paralogs generated by whole-genome duplication, so they are dosage-balanced, preferentially retained, and detectable because they sit in doubled synteny blocks. Xenologs are homologs whose history includes horizontal transfer, so their gene tree contradicts the species tree, often with atypical base composition.

Q: Why do reciprocal best hits not give you orthologs?
A: RBH returns at most one pair, so it silently discards co-orthologs whenever the relationship is one-to-many, as after a whole-genome duplication. Worse, differential loss produces pseudoorthology: if the ancestor had paralogs X1 and X2 and each lineage lost a different one, RBH confidently pairs paralogs and calls them orthologs. If each lineage independently ends up single-copy with probability q, both are single-copy with probability q^2 and half of those retain different paralogs, so pseudoorthology arises at rate q^2/2 -- about 8% for q = 0.4, which is not an edge case.

Q: What is the ortholog conjecture, and how well supported is it?
A: The conjecture is that orthologs retain function better than paralogs at equal sequence divergence, because duplication licenses functional change and speciation does not -- and essentially all functional annotation of non-model genomes is transferred along orthology assignments on that basis. A 2011 Gene Ontology analysis found the opposite, though GO annotations are biased by within-species paralogs sharing experiments; later expression-based analyses support the conjecture but weakly. Treat a transferred annotation as a prior with a real error rate, not a fact.

Q: What is concerted evolution, and how do you recognise it in a gene tree?
A: In some tandem arrays, copies within a species are more similar to each other than to their orthologs in a sister species, because continual gene conversion and unequal crossing over homogenise the array faster than mutation diversifies it. The tree therefore groups by species rather than by copy position -- the human rDNA arrays are the standard case. Contrast birth-and-death evolution, seen in olfactory receptors, immunoglobulins and MHC, where the tree groups by paralog.

Q: What does genome size correlate with, if not organismal complexity?
A: Eukaryotic genome size spans five orders of magnitude with no complexity correlation -- the C-value paradox. It tracks transposable element content, about 46% in humans, and, under Lynch's mutational-hazard hypothesis, inversely with effective population size -- though that second correlation is contested rather than established.

Q: How well supported is the claim that genome bloat is a small-Ne phenomenon?
A: Proposed and contested. The raw correlation between Ne proxies and transposable-element load weakens or vanishes once phylogenetic non-independence is accounted for, and a 2025 comparative analysis of 807 animal species found no Ne effect on genome size or repeat content. The negative relationship does still hold among close relatives, for instance within Drosophila, so treat it as a shallow-scale pattern rather than a long-term law.

Q: Apply the mutational-hazard inequality to bacteria versus humans, minding the units.
A: Excess DNA costs about s = -u x k, where k is the number of positions at which mutation would do harm, so the relevant quantity is k x Ne x u, and selection acts only when the absolute value of Ne x s is at least about 1. Bacteria: Ne about 10^8 and u about 10^-10 per bp because one generation is one replication, so k of about 100 suffices. Humans: Ne about 10^4 and u = 1.3 x 10^-8 per bp per generation summing about 300 divisions, so k of about 7,700 is needed. Carrying the human rate across to bacteria is the standard way to be wrong by two orders of magnitude.

Q: Do the tiny genomes of obligate endosymbionts prove selection for efficiency?
A: No. Those lineages, down to roughly 110 to 160 kb and fewer than 200 genes, are transmitted through a handful of cells per host generation with no recombination, so Ne is tiny, drift dominates, Muller's ratchet turns, and repair genes are lost early. Their genomes are degrading, not optimising -- small Ne bloats eukaryotic genomes and shrinks bacterial ones only because deletion bias in bacteria runs the other way.

Q: How common is horizontal gene transfer into animals, and what does the tardigrade case teach?
A: HGT is routine in prokaryotes, by transformation, transduction and conjugation, and is how antibiotic resistance spreads between species. In eukaryotes it is rare but real. The 2015 report that a tardigrade genome was about 17% foreign turned out on reanalysis of an independent assembly to be almost entirely bacterial contamination, so the prior on a surprising eukaryotic HGT claim should be low until contamination is excluded by an independent assembly, intron and codon-usage evidence, and phylogenetic placement.

Q: Why is "pangenome" two different concepts, and what is each?
A: The bacterial pan-genome is a biological claim about gene content variation between strains, partitioned into a core genome present in all strains and an accessory genome present in some, largely acquired by HGT -- two E. coli strains can share only around 60% of their genes. The human pangenome is a graph-structured reference representing many haplotypes so that reads carrying non-reference sequence can be aligned. Same word, unrelated concepts.

Q: What decides whether a bacterial pan-genome is open or closed?
A: If the number of new genes contributed by the Nth genome decays as k x N^-alpha, the total diverges as N grows when alpha is less than 1 (open) and converges when alpha is greater than 1 (closed). Species with broad ecological range and active HGT, such as E. coli and Streptococcus, are open: every additional genome sequenced still contributes new genes.

## Synteny, rearrangement and gene birth

Q: What did the random breakage model predict about chromosome rearrangement, and how did whole-genome comparison overturn it?
A: Nadeau and Taylor's 1984 model assumed breakpoints fall uniformly along chromosomes, which predicts an exponential distribution of conserved-segment lengths and, from only a handful of markers, correctly estimated about 180 conserved human-mouse segments. Whole-genome comparison then showed breakpoints cluster and are reused far more often than uniformity permits, because breakpoint regions are enriched for segmental duplications and repeats and NAHR between dispersed repeats is what generates rearrangements. Genome architecture biases its own future rearrangements.

Q: How does a protein-coding gene arise from previously non-coding sequence, and how is such a case identified?
A: Not as a jump but along a continuum: pervasive low-level transcription of intergenic regions, occasional translation of those transcripts, and selection on the few that happen to help, converting a proto-gene into a gene. A case is identified by finding an intact ORF in one lineage aligned to unambiguously non-coding, non-deleted syntenic sequence in outgroups.

Q: What are young de novo genes like, and why is that the expected pattern?
A: Short, weakly expressed, tissue-restricted (often testis-biased) and mostly non-essential, which is exactly what the proto-gene continuum predicts: they are recent recruits from intergenic transcription rather than fully integrated genes. Confirmed cases exist in Drosophila, yeast, mouse and human; the estimated rates remain uncertain, the phenomenon does not.

## Species concepts and reproductive isolation

Q: The biological, phylogenetic and genotypic-cluster species concepts are three different operations rather than three phrasings of one idea. What operation does each perform?
A: The biological concept performs a cross: are the two gene pools reproductively isolated. The phylogenetic concept builds a tree and finds the smallest cluster diagnosable by a unique character combination. The genotypic-cluster criterion performs a measurement: sample in sympatry and ask whether the joint genotype distribution is bimodal, that is whether intermediates are deficient -- so it tolerates hybridisation by construction, asking whether the clusters fuse rather than whether individuals ever mate. In programmer terms these are three equality operators on lineages, testing behaviour, provenance and observed distribution, and they agree on the easy cases and diverge exactly where you needed an answer.

Q: On which kinds of case does each species concept return no answer?
A: The biological concept has no answer for asexual lineages, where interbreeding has no referent, nor for fossil lineages, since you cannot cross a specimen with its own ancestor and a single lineage changing through time has no non-arbitrary division points; and for allopatric pairs "potentially interbreeding" is untestable, which is most populations. The genotypic-cluster criterion needs sympatry, so it is silent on asexuals, fossils and allopatric pairs alike. The phylogenetic concept returns an answer in all of those cases, which is why the disagreement is substantive rather than verbal.

Q: What is the grey zone of speciation, and what does it imply about any threshold written into a species definition?
A: Roux and colleagues (2016) fitted demographic models to 61 animal population/species pairs and found the transition from free gene exchange to established barriers spans roughly 0.5% to 2% net synonymous divergence, with the earliest detectable barriers at divergences as low as 0.075%. The underlying object is continuous, so there is no threshold in nature and any threshold in a definition is a convention. Say which concept you used, and never argue about the label without reporting the measurement.

Q: Why do sequential reproductive isolating barriers multiply rather than add, and what does that do to the question "which barrier matters most"?
A: Each barrier sees only the gene flow the earlier ones let through, so total isolation is RI = 1 - product over i of (1 - b_i). Three barriers each blocking 90% of what reaches them remove 0.900, 0.090 and 0.009 of all gene flow respectively: identical strengths, absolute contributions differing a hundredfold, purely from position in the queue. An early-acting barrier of a given strength always dominates the accounting, so the question is meaningless unless you state the order.

Q: Why can selection build a prezygotic barrier directly but only stumble into a postzygotic one?
A: Let hybrids have fitness 1 - s. A heritable tendency to reject heterospecific mates gains an advantage proportional to s x P(encountering a heterospecific), which is zero in allopatry and non-zero in sympatry, so in sympatry selection acts directly on the prezygotic trait -- that is reinforcement. Nothing comparable acts on the other side: a gene that makes hybrids worse is not favoured by hybrids dying, because the gene is in them, so intrinsic postzygotic isolation is a side-effect accumulating at whatever rate divergence proceeds. Note that the comparative Drosophila pattern is consistent with reinforcement rather than diagnostic of it: differential fusion of sympatric pairs and gene-flow-deflated genetic distances survive as alternatives.

## Dobzhansky-Muller incompatibilities and Haldane's rule

Q: Why can a single population not evolve its way into a Dobzhansky-Muller incompatibility?
A: Because every step is tested on the way. Starting from ancestral aabb, reaching AABB requires passing through living individuals carrying both A and B, and by hypothesis that combination is lethal or sterilising, so selection removes whichever substitution came second as fast as it arises. The population faces a fitness valley it cannot cross.

Q: Why must both alleles of a Dobzhansky-Muller incompatibility be derived, and in different lineages?
A: If one were ancestral -- say B -- then A necessarily arose on a B background, so the A-with-B pair existed in that population the moment A appeared and selection removed it. If both arose in one lineage they would likewise have met inside a population where selection could see them. Only when each allele is derived in a separate lineage is each tested solely against the other lineage's ancestral state (A with b, B with a), leaving the A-B pair first assembled in a hybrid, which is not a population selection can act within.

Q: Is a Dobzhansky-Muller incompatibility a case of one lineage having evolved a bad gene?
A: No. Each allele is unremarkable at home, has been tested against its own genome for its whole history, and would never be flagged by a deleterious-variant scan in its own species. Incompatibility is a property of a pair with no evolutionary history together, not a property of either allele.

Q: After K substitutions have accumulated between two lineages, how many untested cross-lineage pairs of derived alleles exist, and what does that predict?
A: With k on one side and K - k on the other the count is k(K - k), a product rather than a sum, which is K^2/4 in the symmetric case, so if each pair is incompatible with small probability p the expected number of incompatibilities is about p x K^2/4. Since neutral divergence is roughly linear in time, incompatibility grows with the square of time. Orr (1995) called this the snowball effect, and its testable content is sharper than "more divergence, more incompatibility": the number of incompatibilities per unit of divergence should itself increase with divergence.

Q: How strong is the empirical evidence for the snowball effect?
A: Real, thin and contested. Matute and colleagues (2010) counted hybrid-lethality loci across Drosophila pairs and found faster-than-linear accumulation, and Moyle and Nakazato (2010) found Solanum seed-sterility QTL accumulating significantly faster than linearly while pollen-sterility QTL accumulated linearly. Both were formally challenged within two years: a 2011 Comment argued Matute's assay detects loci haploinsufficient in a hybrid background that would not contribute to lethality in ordinary hybrids, and a 2012 reanalysis argued the Solanum result is sensitive to how divergence is estimated in the presence of ancestral polymorphism. The theory is secure; the empirical base is two disputed datasets, not a literature.

Q: Give the dominance-theory derivation of Haldane's rule, and state the condition it requires.
A: Give an X-linked incompatibility allele homozygous effect 1 and dominance coefficient h. In an XY hybrid the X is hemizygous, so one such allele is expressed at full effect: cost proportional to 1 x 1 = 1. An XX hybrid carries two hybrid X chromosomes and therefore twice as many such alleles, but each is heterozygous against the other species' X and expressed at h: cost proportional to 2h. The heterogametic sex is worse off exactly when 2h < 1, that is h < 1/2, which is the partial recessivity already established for deleterious alleles generally. The derivation turns only on hemizygosity and not on sex, so it predicts the rule in ZW systems too, for sterility and inviability alike.

Q: Why does neither dominance nor faster-male account for Haldane's rule on its own?
A: Faster-male, which appeals to the rapid divergence of male reproductive genes, is a claim about maleness, so it predicts the wrong sex in ZW taxa -- yet birds (97%, n = 87) and Lepidoptera (96%, n = 114) obey the rule with the female heterogametic. Dominance handles those cases, but in marsupials imprinted paternal X inactivation makes both sexes functionally hemizygous, removing the asymmetry dominance depends on, and still males are sterile and females fertile in 10 of 11 examined species pairs while the rule for viability is weak or absent. The defensible summary is that the rule is composite: dominance carries hybrid inviability and the ZW cases, faster-male carries hybrid sterility in male-heterogametic taxa, and faster-X and sex-chromosome meiotic drive are amplifiers whose weight is still argued.

## Hybrid zones, clines and introgression

Q: What distinguishes a tension zone from an environmental (ecotone) cline, and why is cline shape no help in telling them apart?
A: A tension zone is held by endogenous selection -- hybrids are unfit anywhere -- so nothing environmental sets its position, it drifts until trapped in a density trough or at a dispersal barrier, and it does not follow the environment if the environment moves. An ecotone cline is held by exogenous selection, each form fitter in its own habitat, so its position is the environmental transition and it does follow it. Both give a sigmoid, so the discriminating tests are coincidence of clines at unlinked loci (unlinked markers have no reason to share a centre and a width unless admixture linkage disequilibrium couples them, which is the tension-zone signature), coincidence with an environmental boundary, and movement over decades.

Q: Does a hybrid zone mean two forms are merging back into one?
A: No: a tension zone is a stable equilibrium between dispersal spreading alleles across the boundary and selection removing hybrid ancestry, not a transient. The width w = sigma x sqrt(8/s) is a steady state, and the fire-bellied toad zone has held at about 6 km for thousands of generations where a neutral smear would by now be tens of kilometres wide.

Q: Derive the cline-width scaling w ~ sigma/sqrt(s), and say why you must not invert it as s = (sigma/w)^2.
A: Dispersal is diffusion, so over t generations it spreads a marker a distance of order sigma x sqrt(t), while selection resolves the fate of hybrid ancestry on a timescale of about t = 1/s; substituting gives w ~ sigma x sqrt(1/s) = sigma/sqrt(s). The scaling argument fixes the exponent and says nothing about the prefactor, so inverting it directly silently sets the constant to 1. Bazykin's underdominance model gives w = sigma x sqrt(8/s) and hence s = 8(sigma/w)^2; Barton and Gale give about 2.5 sigma/sqrt(s) for general selection against hybrids and about 1.7 for a step in exogenous selection. On the toad data the naive inversion returns s = 0.027 against a published 17 to 22%, wrong by a factor of eight, while s = 8(sigma/w)^2 returns 0.21.

Q: Before invoking selection to explain a narrow hybrid zone, what should you compute, and what does it give for the fire-bellied toads?
A: Compute the width the neutral process alone would produce. With sigma = 0.99 km per generation and about 5,000 generations of postglacial contact, free diffusion gives 0.99 x sqrt(5000) = 70 km against an observed 6.05 km; inverted, a 6.05 km smear corresponds to only (6.05/0.99)^2 = 37 generations of diffusion, a hundredth of the contact time. That is the argument for selection stated in two numbers rather than as a plausible story. Then get a second estimate of s from admixture linkage disequilibrium between unlinked loci at the centre, which the same sigma and s predict, because agreement between two independent estimates is the test, not goodness of fit to a sigmoid that was always going to fit.

Q: Ch 34 aimed the D-statistic at Neanderthals. What does it take to generalise it, and what does a non-zero D not tell you?
A: Nothing in the derivation mentions humans: for any four populations with a known topology (((P1, P2), P3), O), incomplete lineage sorting is symmetric, so E[n_ABBA] = E[n_BABA] and D = (n_ABBA - n_BABA)/(n_ABBA + n_BABA) has expectation zero -- two species and an outgroup, two populations and a congener, or two crop landraces and a wild relative all qualify. Significance must come from a block jackknife over the genome, because sites within a block are not independent. A non-zero D says "not incomplete lineage sorting alone" and nothing more: unsampled ghost lineages and ancestral structure produce the same asymmetry, mutation-rate variation perturbs it, and it does not identify the direction of gene flow.

## Local adaptation and F_ST outliers

Q: Which comparison in a reciprocal transplant defines local adaptation, and why is the intuitive alternative wrong?
A: Local versus foreign: W(A,A) > W(B,A) at site A and W(B,B) > W(A,B) at site B, comparing genotypes within a site so that site quality cancels. Home versus away -- each population doing better at its own site than at the other -- is not the definition and is confounded by site quality, because if site A is simply better for everything then every population sampled with A as its home looks fitter at home. Hereford's 2009 survey of published transplants found local adaptation in 71% of cases, with a mean native advantage of 45% in relative fitness.

Q: Which three neutral processes manufacture F_ST outliers, and what does that make an outlier?
A: Isolation by distance and hierarchical structure, because the island model assumes every deme draws from one common pool while real populations sit on a lattice or a tree, which widens the neutral F_ST distribution and gives it a long tail. Allele surfing on a range expansion, where an allele that happens to be on the advancing front rides to high frequency through a chain of founder events, manufacturing steep geographic clines out of nothing. And background selection, which depresses within-population diversity in low-recombination, gene-dense regions, and that diversity is F_ST's denominator, so F_ST rises there chronically with no local adaptation anywhere. An F_ST outlier is therefore a hypothesis, whose confirmation is a reciprocal transplant or a functional test, not a plausible Gene Ontology term on the nearest gene.

Q: What did Lotterhos and Whitlock find about the standard F_ST outlier methods, and what should you do instead?
A: Simulating isolation by distance and range expansion, they found that FDIST2 and BayeScan -- both of which assume the sampled populations are evolutionarily independent -- have badly inflated false-positive rates under exactly those scenarios, and that parameterising FDIST2 on a "neutral" locus set made it worse rather than better; methods that estimate the population covariance, such as FLK and Bayenv2, did better. The remedies are to fit a demographic null instead of assuming one, condition on local recombination rate and functional density, correct for testing millions of loci, and prefer a genotype-environment association, since population structure does not predict a named environmental gradient.

## Conservation genetics: Ne, inbreeding and rescue

Q: Why is the ratio Ne/N about 0.1, and what should you not do with that number?
A: Three ordinary factors each contribute a multiplier below 1 and they compound: unequal sex ratio, variance in family size, and fluctuation in size across generations, the last a harmonic mean and so dominated by the smallest generation. Frankham's 1995 compilation of 192 estimates from 102 species found individual estimates spanning 10^-6 to 0.99 and averaging 0.34, but the comprehensive estimates -- those including all three factors together -- averaged 0.10 to 0.11, so a census of 500 breeding adults is genetically about 50. Do not treat 0.1 as a fact for an unmeasured species: it is a cross-species average over enormous variance, Ne has several non-equivalent definitions, and whether N means adults, breeders or total moves the answer severalfold, so label it as a modelling assumption.

Q: Does inbreeding depression require that relatives mate?
A: No. In a closed population F rises by 1/(2Ne) per generation whatever the mating system, because the mate pool is finite: at Ne = 50 that is 1% per generation with nobody choosing a relative. Since Ne/N is about 0.1, a census of 500 inbreeds like a population of 50.

Q: Will a small population purge its recessive load and recover?
A: Almost certainly not. The mechanism is sound -- inbreeding exposes recessives to selection, which removes them -- but across 119 captive pedigreed populations the average change in inbreeding depression attributable to purging is under 1%. Selection sees an allele only when |Ne x s| is at least about 1, and the small Ne that caused the inbreeding is exactly what blinds it, so the mildly deleterious alleles that form the bulk of the load are unpurgeable; purging also works by killing individuals, in a population endangered because individuals are dying. Drift meanwhile fixes deleterious alleles outright, and no within-population outcrossing recovers those, because a fixed allele leaves no alternative to select for -- only an immigrant chromosome carries one.

Q: What does the contrast between the Florida panther and the Isle Royale wolves show about genetic rescue?
A: Eight Texas females were released to the panthers in 1995 and five reproduced: heterozygosity more than doubled, defect frequencies fell in admixed cohorts, Florida ancestry was retained at 59 to 80% with no region wholly replaced, and the population now stands at 120 to 230 adults and subadults. One male crossed the ice to Isle Royale in 1997: inbreeding fell for about two generations and then rose past its previous level, because within about 2.5 generations every wolf was related to him. One migrant is a demographic event and only a transient genetic one -- genetic rescue is a durable change in Ne and in the ongoing migration rate, of order one migrant per generation sustained, which is why the practical currency is corridors rather than translocations. Note also that the panther gain came from restored heterozygosity masking each lineage's recessive load: rescue masks load, it does not purge it.

Q: Inbreeding depression and outbreeding depression are opposite risks. What makes deciding between them tractable?
A: Their timing is asymmetric, and that is the decision rule. Inbreeding depression in a small isolated population is certain and immediate, whereas outbreeding depression is possible and often delayed to F2 or F3, when recombination breaks up co-adapted gene combinations -- so a healthy F1 is not evidence of safety and monitoring must run two further generations. The risk is screened rather than guessed: Frankham and colleagues' decision tree asks whether the populations are the same species, free of fixed chromosomal differences, in gene-flow contact within roughly the last 500 years, and in similar environments. Read Frankham's 2015 result of benefit in 92.9% of 156 comparisons with its clause attached, since those comparisons were screened as low risk of outbreeding depression rather than chosen arbitrarily.

Q: What is the difference between an evolutionarily significant unit and a management unit, and why is the ESU criterion contested?
A: Moritz's ESU is reciprocally monophyletic at mtDNA with significant nuclear allele-frequency divergence -- a historical criterion about long-term independent evolution, and the boundary you hesitate to cross when moving animals. A management unit requires only significant allele-frequency divergence regardless of tree structure -- a demographic criterion about present-day independence, and the unit you monitor -- so many MUs sit inside one ESU. The ESU criterion is contested because reciprocal monophyly at mtDNA takes of order 4Ne generations to arise even with zero gene flow, and mtDNA is a single locus, one realisation of a genealogy with large variance.
