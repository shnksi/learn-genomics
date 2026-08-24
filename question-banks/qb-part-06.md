# Question bank — Part 06: Quantitative genetics

Covers [Ch 30-32](../part-06-quantitative-genetics/30-quantitative-traits.md).

Convert to Anki: `python reference/to_anki.py question-banks/ --out anki-import.tsv`

## From Mendelian loci to a continuous trait

Q: Why does a trait controlled by many Mendelian loci of small effect end up approximately normally distributed?
A: An individual's genotypic value is a sum of many nearly-independent small contributions, so the central limit theorem applies. Quantitative genetics is Mendelian genetics plus the CLT; no new inheritance mechanism was ever required. The continuous distribution is what particulate inheritance looks like once you add enough particles and blur the result with environment.

Q: What dispute did Fisher's 1918 paper settle, and how?
A: Biometricians (Galton, Pearson, Weldon) measured smooth distributions and parent-offspring correlations near 1/2 and concluded inheritance was blending; Mendelians (Bateson, de Vries) had discrete factors and clean ratios but no account of height. Fisher showed the biometricians' observations were a derivable consequence of the Mendelians' mechanism. The same paper coined the word "variance".

Q: For n unlinked loci at frequency p where each "+" allele adds a to the trait, what are the mean and variance of genotypic value, and what assumption lets the variances add?
A: E[G] = 2npa and Var(G) = 2npq a^2, since each allele count is Binomial(2, p) with variance 2pq under Hardy-Weinberg. The variances add only under linkage equilibrium -- sitting on different chromosomes is not sufficient. With n loci there are 2n+1 genotypic classes and G is a scaled Binomial(2n, p).

Q: What criterion tells you when environmental noise will hide the discrete genotypic classes?
A: An equal-weight mixture of two normals whose means differ by d with common standard deviation sigma is unimodal when d is at most 2 sigma. The genotypic class spacing is a, so once the environmental standard deviation reaches roughly a/2 the bumps merge into a smooth histogram. Even Nilsson-Ehle's three wheat loci, giving 7 classes in ratio 1:6:15:20:15:6:1, become invisible under modest environmental variance -- which is precisely why the biometricians never found them.

Q: With the per-allele effect a held fixed, does adding more loci shrink the spacing between genotypic classes?
A: No. The spacing stays at a; what changes is that the range widens to 2na and the genetic standard deviation to sqrt(2npq) times a, so the steps become a finer texture relative to the spread. Spacing itself shrinks only when the loci divide a fixed total, as when two pure parental lines pin a difference D between the extremes so that a = D/2n.

## Liability, thresholds, and the full phenotype model

Q: What does the liability threshold model posit, and how do you get the threshold from a prevalence?
A: It posits an unobserved continuous variable, liability, summing all genetic and environmental contributions to risk; assume it normal and standardise to L ~ N(0,1), which costs nothing since the scale is arbitrary. An individual is affected when L exceeds a threshold T, and for prevalence K the threshold is T = inverse-Phi(1 - K).

Q: How do you compute the mean liability of affected individuals, and how does it compare between a 1% and a 5% disease?
A: It is the inverse Mills ratio i = phi(T)/K, with phi the standard normal density. For K = 0.01, T = 2.326 and i = 0.02665/0.01 = 2.665; for K = 0.05, T = 1.645 and i = 0.1031/0.05 = 2.06. Rarer conditions select a more extreme tail, which is why recurrence risk in relatives is proportionally higher for rare threshold traits even at the same liability heritability.

Q: A binary disease trait cannot be quantitative -- what is wrong with that claim?
A: The liability threshold model makes it one. The observed scale is binary but the latent liability scale is normal, and the whole variance-component machinery works unchanged there. This is why heritability must be reported on the liability scale rather than the observed 0/1 scale, and why polygenic score performance for disease is quoted as liability-scale R^2 or AUC.

Q: Why does a threshold trait behave non-additively on the observed scale even when liability is perfectly additive?
A: Because the map from liability to a binary outcome is a step function. Relatives of severely affected probands have higher risk, and recurrence risk falls off faster than a factor of 1/2 per degree of relationship -- and none of that requires any interaction between loci. Dominance appears for free from the threshold, not from gene action.

Q: Why is assuming Cov(G,E) = 0 not a conservative simplification?
A: The full decomposition is Var(P) = V_G + V_E + 2 Cov(G,E) + V_GxE, and setting the covariance to zero asserts that genotypes are distributed independently of environments. That is true by construction in a randomised field trial or common-garden design and routinely false in observational human data: parents transmit alleles and also rear the child (genetic nurture), individuals select environments matching their propensities (niche picking), and breeders feed high-merit animals better. Each makes the covariance positive and inflates every family-based estimate.

Q: When is V_GxE non-zero, and what is the cleanest example?
A: Exactly when reaction norms are non-parallel -- when the difference between two genotypes depends on the environment they are in. Phenylketonuria is the cleanest case: the PAH genotype's effect on cognition is severe on a normal diet and near zero on a phenylalanine-restricted one. It signals that "the effect of the genotype" is not a well-defined quantity without naming the environment.

## Additive variance and breeding values

Q: What is the real definition of additive genetic variance, and why is "the variance due to genes acting additively" wrong?
A: Regress genotypic value G on allele count X (values 0, 1, 2), weighted by genotype frequencies. The slope is the average effect of an allele substitution, alpha = Cov(G,X)/Var(X) = a + d(q - p), where a is the homozygote deviation and d the dominance parameter. V_A is the variance of the fitted values from that regression -- a statistical decomposition of a population, not a property of gene action.

Q: Give the formulas for breeding value, V_A, the dominance deviation and V_D at one locus, and say why V_G = V_A + V_D has no cross term.
A: The breeding value is the fitted value as a deviation, A = alpha(X - 2p), so V_A = alpha^2 Var(X) = 2pq alpha^2. The dominance deviation is the regression residual D = G - M - A, taking values -2q^2 d, 2pq d and -2p^2 d, so V_D = (2pq d)^2. Residuals are orthogonal to fitted values by construction, so Cov(A,D) = 0 exactly.

Q: A locus shows complete dominance and the dominant allele is at p = 0.05. What fraction of its genotypic variance is dominance variance, and why is that surprising?
A: With d = a, alpha = 1.9a, so V_A = 2(0.05)(0.95)(3.61a^2) = 0.3430a^2 and V_D = (0.095a)^2 = 0.009025a^2 -- dominance is only 2.6% of V_G. Gene action is completely dominant, yet nearly all the variance is additive, because A1A1 individuals are almost absent (p^2 = 0.0025), so nearly all variation lies between heterozygotes and recessive homozygotes and a line fits two points perfectly.

Q: Why is there no frequency-free "effect size" of a locus in this framework?
A: Because alpha = a + d(q - p) contains the allele frequency, and V_A = 2pq alpha^2 contains it twice more. The same allele with identical biochemistry contributes different additive variance in two populations with different frequencies, and contributes exactly zero when fixed. Effect sizes and variance contributions are population-specific.

Q: At what allele frequency is additive variance maximised, and what does that imply for GWAS?
A: With d = 0, V_A = 2pq a^2, which peaks at p = 1/2. A large-effect allele at p = 0.001 contributes 0.002a^2 against 0.5a^2 at p = 1/2 -- a 250-fold difference. This is most of the reason GWAS finds common variants of tiny effect and misses rare variants of large effect.

Q: Parents transmit V_G to their offspring -- what is wrong with that, and what follows from the correction?
A: Parents transmit alleles, not genotypes. Meiosis dismantles every parental genotype and reassembles new ones at random, so dominance is a property of a pairing that is destroyed and re-drawn each generation and epistasis lives in combinations that are largely broken up. Only V_A passes through intact, which is why the response to selection is R = h^2 S with h^2 = V_A/V_P, not V_G/V_P.

## Resemblance between relatives and genetic correlation

Q: Give the general expression for the covariance between relatives in terms of identity-by-descent sharing, and explain where each piece comes from.
A: Cov = (1/2) E[k] V_A + Pr(k = 2) V_D, where k is the number of alleles shared identical by descent at a locus. Each IBD-shared allele carries V_A/2, because a breeding value is the sum of two independent allelic contributions. Dominance deviations are properties of a whole genotype, so they covary only when both alleles are shared IBD.

Q: Why does dominance variance contribute nothing at all to parent-offspring resemblance?
A: The offspring received exactly one allele from this parent, IBD with certainty, and the other came from an unrelated mate. So k = 1 always, giving E[k] = 1 and Pr(k = 2) = 0. A parent and child cannot share a genotype identical by descent, so Cov(parent, offspring) = (1/2) V_A with no dominance term whatever.

Q: Derive the IBD distribution for full sibs and the resulting covariance.
A: From the mother both sibs receive one of her two alleles, the same one with probability 1/2; independently the same for the father. So k is Binomial(2, 1/2): Pr(0) = 1/4, Pr(1) = 1/2, Pr(2) = 1/4, giving E[k] = 1 and Pr(k=2) = 1/4. Hence Cov(full sibs) = (1/2) V_A + (1/4) V_D. Half sibs share only one parent, giving E[k] = 1/2 and Cov = (1/4) V_A; MZ twins have k = 2 always, giving V_A + V_D + V_I.

Q: Full sibs and parent-offspring both carry (1/2) V_A. Why are they not equally informative?
A: Full sibs additionally carry (1/4) V_D and usually a large shared-environment term; parent-offspring carries no V_D at all and a weaker shared-environment term, so they estimate different things. Parent-offspring is not environment-free either -- the same parents transmit the alleles and build the rearing environment, so Cov(G,E) (genetic nurture) inflates it, and that is the assumption that does all the damage in humans. The difference Cov(full sibs) - Cov(parent, offspring) is in principle (1/4) V_D, but in practice it is swamped by shared environment between sibs -- which is why half-sib designs, pure (1/4) V_A with weak common environment, are preferred for isolating dominance.

Q: How do epistatic variance components enter the relative-covariance table, and why does epistatic gene action often show up as V_A?
A: With squared coefficients: Cov = r V_A + u V_D + r^2 V_AA + r u V_AD + u^2 V_DD + ..., where r = E[k]/2 and u = Pr(k=2). So V_AA contributes 1/4 to full sibs but only 1/16 to half sibs, decaying fast with relationship distance and making epistatic variance nearly impossible to identify separately. Interaction at the gene-action level converts largely into V_A at realistic allele frequencies; variance components are not statements about biochemistry.

Q: Two traits have additive genetic correlation r_G = -0.6 but a phenotypic correlation near zero. How is that possible, and what happens if you select on one?
A: The phenotypic correlation is a variance-weighted mixture of the genetic and environmental correlations, so a positive environmental correlation with large environmental variance can mask strongly antagonistic genetics. Selecting on one trait still drags the other down, because response travels through breeding values only, and r_G is what describes those. This is the dairy cattle story: milk yield and fertility are negatively genetically correlated while better-managed herds score higher on both, and decades of selection for yield quietly degraded fertility.

Q: What are the two ways a locus can contribute to the genetic correlation between two traits, and can you tell them apart?
A: Cov_A(X,Y) = sum over loci of 2 p q alpha_X alpha_Y, so a locus contributes either by having a non-zero average effect on both traits -- pleiotropy -- or by being in LD with a locus that affects the other trait. The two sources are not distinguishable from the correlation alone, which is a recurring problem in interpreting any reported r_G.

## What heritability is, and what it is not

Q: Distinguish broad-sense and narrow-sense heritability, and say what question each answers.
A: Broad-sense H^2 = V_G/V_P answers what fraction of variance is attributable to genotype at all. Narrow-sense h^2 = V_A/V_P answers what fraction of variance is predictable from parents. Only the narrow-sense quantity predicts response to selection.

Q: Why is heritability not a measure of how genetic a trait is?
A: It is the fraction of variance in one population, in one environment, at one time that tracks genotype. Number of fingers is almost perfectly genetically determined and has heritability near zero, because nearly all the variance in finger count is accidents. Equally, heritability of zero means genes do not explain variation here, not that genes are irrelevant -- a universally fixed allele contributes nothing to variance and everything to the phenotype.

Q: What is wrong with "h^2 = 0.5 means half my height came from my genes"?
A: Heritability is not a partition of an individual's trait value. Your height is not 50% genes and 50% food; it is 100% both. Variance decomposes across a population; individuals do not.

Q: Does high heritability mean a trait cannot be changed? Give two decisive counterexamples and the general principle.
A: No -- it says nothing about malleability. Adult height is roughly 0.7-0.8 heritable, yet Dutch mean male height rose about 20 cm since the mid-nineteenth century on nutrition and sanitation, because heritability measures ranking within a cohort while the whole distribution translated upward. Phenylketonuria is near-fully genetic and completely preventable by a low-phenylalanine diet. The principle: heritability is estimated over the range of environments that happened to be present, and interventions are attempts to move outside that range.

Q: State Lewontin's two-pots argument and what it establishes about group differences.
A: Split a genetically variable batch of seed at random into a full-nutrient pot and a depleted pot. Within each pot the environment is uniform, so heritability is near 1; the difference between pot means is 100% environmental by construction, since the seed was randomised. Run the reverse case -- identical soil, two genetically distinct seed sources -- and a within-pot heritability that explains nothing accompanies a between-pot gap that is entirely genetic. The within-group statistic is compatible with any between-group cause.

Q: A trait has h^2 = 0.6 in Norway and 0.3 in a population with far more variable childhood nutrition, with identical allele frequencies. Explain.
A: h^2 = V_A/(V_A + V_E), and V_A is the same in both. The second population has larger V_E, so the same V_A is a smaller fraction of a larger denominator, with nothing genetic differing. This is the routine reason heritability estimates differ across countries and decades, and why an h^2 is interpretable only alongside a description of the environment it was measured in.

## Estimating heritability

Q: Show why the regression of offspring on midparent has slope exactly h^2, while the slope on a single parent is half that.
A: Under random mating the parents are uncorrelated, so Var(midparent) = V_P/2, while Cov(offspring, midparent) = (1/2)[(1/2)V_A + (1/2)V_A] = (1/2)V_A. The slope is therefore ((1/2)V_A)/((1/2)V_P) = h^2 with no scaling constant. Regressing on one parent leaves the predictor variance at V_P, giving (1/2) h^2. The factor of two lives entirely in the variance of the predictor.

Q: Random mating is conspicuously absent from the assumptions the offspring-midparent regression needs. Why is that slope robust to assortative mating?
A: Let mates correlate rho for the phenotype. Assortment makes each parent's phenotype informative about the other parent's breeding value, Cov(A_dam, P_sire) = h^2 Cov(P_dam, P_sire) = rho V_A, so the numerator inflates to Cov(offspring, midparent) = (1/2) V_A (1 + rho) while the denominator inflates by the same factor to Var(midparent) = (1/2) V_P (1 + rho). The (1 + rho) cancels and the slope is still h^2, which makes offspring-midparent the one design essentially robust to assortment.

Q: If the midparent slope is robust to assortative mating, what does assortment actually change?
A: V_A itself. Correlated mates build positive gametic-phase disequilibrium between like-signed loci, so V_A and therefore h^2 are genuinely larger than the base-population value, and the slope reports that inflated current h^2 faithfully. What assortment biases are the estimators whose numerator has nothing to cancel against: the single-parent slope becomes (1/2) h^2 (1 + rho), and sib correlations rise because the parents' breeding values now covary.

Q: Why is the half-sib design the workhorse in animal breeding, and why is a full-sib estimate only an upper bound?
A: Half sibs carry (1/4) V_A with no dominance at all, only 1/16 of V_AA, and no shared rearing environment, since half sibs by a common sire are raised by different dams -- so h^2 = 4 times the half-sib correlation. Full sibs carry (1/2) V_A plus (1/4) V_D plus (1/4) V_AA plus a common-environment term, so twice the full-sib correlation bounds h^2 from above rather than estimating it.

Q: State Falconer's twin formula, say exactly when it is valid, and give the diagnostic for when it has failed.
A: With r_MZ = h^2 + d^2 + c^2 and r_DZ = (1/2)h^2 + (1/4)d^2 + c^2, the difference is (1/2)h^2 + (3/4)d^2, so the familiar h^2 = 2(r_MZ - r_DZ) is exact only when dominance and epistasis are absent and is biased upward otherwise. Under the same model c^2 = 2 r_DZ - r_MZ, so a negative shared-environment estimate is the diagnostic: with r_MZ = 0.74 and r_DZ = 0.30 you get h^2 = 0.88 and c^2 = -0.14, meaning the additive model is wrong and the honest report is h^2 at most 0.88.

Q: What is the equal-environments assumption, and which critiques of it bias h^2 upward versus downward?
A: The EEA is that MZ and DZ pairs are equally correlated for trait-relevant environments. MZ twins being treated more alike, and MZ twins sharing a chorion about two-thirds of the time, are real violations biasing h^2 upward -- the second is prenatal, so it applies even to physical traits. Misclassified zygosity pulls r_MZ and r_DZ toward each other and deflates h^2, and assortative mating inflates r_DZ but not r_MZ, also biasing Falconer's h^2 downward.

Q: What do GREML and LD score regression estimate, and why is that not the same quantity a twin study estimates?
A: Both estimate h^2_SNP, the additive variance tagged by genotyped SNPs -- GREML by fitting a mixed model on a genomic relationship matrix among unrelated people, LDSC by regressing chi-squared statistics on LD scores, where the slope gives h^2_SNP and the intercept gives inflation from stratification. Rare and low-LD causal variants are untagged, so h^2_SNP is at most h^2 by construction. Twin h^2 is a different estimand: total additive variance plus dominance, epistasis, shared environment and any EEA violation. They are not supposed to agree.

Q: Why does GREML deliberately drop pairs whose estimated relatedness exceeds about 0.025?
A: Because its whole logic rests on two strangers sharing, by chance, a genome fraction fluctuating around zero -- a fluctuation that is uncorrelated with shared environment, since two people who happen to share 0.5% more genome than average do not therefore share a household. Dropping closer pairs kills any relatedness near enough to carry shared environment or genotype-environment correlation.

Q: Line up the heritability estimates for adult height and say how the missing-heritability gap closed.
A: Twin or pedigree gives about 0.8, common-SNP GREML about 0.45, genome-wide-significant SNPs about 0.40 (12,111 SNPs from 5.4 million people), and whole-genome-sequence GREML about 0.68. Against the 2009 gap -- roughly 5% explained by about 45 known loci -- it closed from both ends: rare and low-LD variants recover much of it, pedigree estimates were inflated by shared environment and assortative mating, and most causal variants were simply below the detection threshold. Height went from 45 loci to 12,111 by adding people, not a new kind of variant.

## Response to selection

Q: Derive the breeder's equation R = h^2 S, and say in what narrow sense heritability is causal here.
A: Regress breeding value on phenotype: the slope is Cov(A,P)/V_P = V_A/V_P = h^2, so selected parents with mean phenotype exceeding the population mean by S have mean breeding value h^2 S. Offspring receive half of each parent's breeding value, giving R = h^2 S. It is the offspring-on-midparent regression applied forward, and it is genuinely causal only because you are physically choosing who breeds.

Q: Define selection intensity for truncation selection and give the most useful form of the response equation.
A: Keeping the top fraction p, with x the standard normal quantile and phi the standard normal density, the selection intensity is i = phi(x)/p and the selection differential is S = i sigma_P. Then R = i h^2 sigma_P = i h sigma_A. The last form is the useful one: response per generation scales with the square root of heritability times the additive standard deviation. For the top 10%, x = 1.2816 and i = 0.17549/0.10 = 1.755.

Q: What is the Bulmer effect, and how much does it cost in the second generation?
A: Truncation selection generates negative linkage disequilibrium between loci with like-signed effects, shrinking V_A with no allele frequency change; recombination restores half of it each generation, so V_A(1) = V_A(1 - (1/2) k h^2) with k = i(i - x). In a crop example with i = 1.755, x = 1.2816 and h^2 = 0.45, k = 0.831, V_A falls from 1.80 to 1.463 %^2 and h^2 to 0.399, cutting the second-generation response from 1.580% to 1.340% -- a 15% shortfall in one generation.

Q: What is realised heritability, and why is it the number to trust?
A: It runs the breeder's equation backwards: h^2_realised is cumulative response divided by cumulative selection differential over t generations, the slope of one on the other. It is the only heritability measured on the intervention you actually performed, so divergence from a pedigree estimate is the signal that something in the model has moved -- as when a predicted 0.45 comes back as 6.30/16.20 = 0.389 after five generations.

Q: State Lande's multivariate breeder's equation and say what the selection gradient beta is.
A: delta-zbar = G P^-1 s = G beta, where G and P are the additive-genetic and phenotypic variance-covariance matrices and s is the vector of selection differentials. beta = P^-1 s is precisely a vector of partial regression coefficients of relative fitness on the traits -- direct selection on each trait holding the others constant, in the multiple-regression sense. The genetics is entirely in G.

Q: What does the structure of the G matrix say about which directions a population can evolve in?
A: Populations evolve most easily along the leading eigenvector of G. If G has a near-null direction, selection along it produces almost no response no matter how hard you push, so what limits response is often the shape of G rather than the strength of selection.

Q: Name the four causes of a selection plateau and the diagnostic that separates each.
A: Exhaustion of V_A -- response decays smoothly and reverse selection also fails. Drift, with Robertson's limit of total advance around 2 N_e times the first-generation response -- replicate lines plateau at different means. Opposing natural selection -- response stops while V_A remains, and relaxing selection causes regression. Physiological limit -- asymmetric, one direction stops while the other does not.

Q: What does the Illinois maize experiment show about long-term selection limits?
A: Selecting kernel oil and protein since 1896, one generation a year past 100 generations, high oil rose from about 4.7% to roughly 20% and high protein to roughly 27-32%, still responding far beyond what the founding additive variance could have supported. Both low lines hit hard physiological limits, since oil content cannot go below zero. New mutation supplies fresh additive variance of order 10^-3 V_E per generation, which is why the high lines keep creeping upward.

## Mapping QTLs: attenuation, design, interval mapping

Q: Derive the marker-QTL attenuation factor in a backcross and relate it to map distance.
A: In an F1 of genotype MQ/mq, progeny carrying M carry Q with probability 1 - r and those carrying m carry Q with probability r, so the marker contrast equals (1 - 2r) times the QTL contrast. Under the Haldane map function r = (1 - e^(-2d))/2 with d in Morgans, so 1 - 2r = e^(-2d) exactly: the effect estimate decays as e^(-2d) and variance explained as e^(-4d). QTL mapping is measurement error in the predictor with a known error rate.

Q: Why are dominance effects systematically harder to map than additive ones?
A: In an F2 the additive contrast between homozygote classes equals 2a(1 - 2r) while the dominance contrast equals d(1 - 2r)^2. Dominance attenuates twice as fast because detecting it requires both chromosomes to be correctly classified. It is a detection problem, not evidence that dominance effects are rarer.

Q: Why can single-marker analysis never report an effect size or a position?
A: Its expectation is (1 - 2r) times the QTL effect, which is one equation in two unknowns. A QTL of effect delta at r = 0.15 and a QTL of effect 0.7 delta sitting on the marker produce identical data. You can only report that something is near this marker; the defect is structural, not statistical.

Q: What does interval mapping do that single-marker analysis cannot, and what makes position identifiable?
A: Lander and Botstein's 1989 move is to test positions rather than markers: walk a hypothetical QTL along the interval and at each position compute the conditional distribution of the unobserved QTL genotype given the flanking marker genotypes. That yields a normal mixture whose mixing weights are individual-specific and fixed by the map with no free parameters -- pure genetics. Those weights give the likelihood surface curvature in position, which is exactly the information single-marker analysis threw away.

Q: What is Haley-Knott regression, and what does it trade away?
A: It replaces interval mapping's normal-mixture likelihood with an ordinary regression of the phenotype on E[QTL genotype given the flanking markers] -- a moment approximation to the likelihood, about two orders of magnitude faster and peaking in nearly the same place. What it gives up is a correct residual variance, and it degrades where marker data are sparse or missing. It is what most software runs inside a permutation loop, where speed is the binding constraint.

Q: What two problems does composite interval mapping fix, and how?
A: Unmodelled QTLs elsewhere sit in the residual and inflate the error variance, lowering power everywhere; and two real linked QTLs flanking an empty interval produce a single spurious ghost peak between them. CIM includes selected markers elsewhere as covariates while scanning, so cofactors on other chromosomes absorb background genetic variance and cofactors on the same chromosome block the linked QTL, splitting the ghost into two peaks. A window around the test position excludes cofactors that would steal the signal.

Q: RILs give both more power and better resolution than an F2 of the same size. Explain why these are independent effects.
A: Power: a RIL is an immortal homozygous genotype, so it can be phenotyped k times, giving the line mean environmental variance sigma^2_E/k and driving line-mean heritability toward 1 -- with no extra recombination at all. Resolution: generations of inbreeding accumulate crossovers, with observed recombination fraction 2r/(1 + 2r) for selfing and 4r/(1 + 6r) for sib-mating, approaching 2x and 4x map expansion at tight linkage. An advanced intercross buys the second lever without the first; a near-isogenic line buys the first without a genome scan.

## Thresholds, the winner's curse, and the road to GWAS

Q: A LOD score is not a p-value. What is the conversion, and where does the conventional threshold of 3 come from?
A: LOD is log base 10 of a likelihood ratio, and twice the natural-log likelihood ratio is asymptotically chi-squared, so chi^2 = 2 ln(10) x LOD, about 4.605 x LOD. LOD 3 gives chi-squared of 13.8 on 1 df, a nominal two-sided p of about 2 x 10^-4, not 0.001. The value 3 comes from Morton (1955) via a Bayesian argument -- prior odds of linkage roughly 1:50 for two random human loci, so a 1000:1 likelihood ratio gives posterior odds near 20:1 -- which is specific to human pedigrees and does not transfer to a genome scan in a mouse cross.

Q: Why is the null distribution of the maximum LOD over a genome scan not chi-squared?
A: Under the null there is no QTL, so the position parameter is unidentified -- a regularity failure, not a small-sample problem, which means the usual chi-squared asymptotics simply do not apply. The relevant asymptotics are those of the supremum of a correlated random field, depending on genome length in Morgans, marker density, cross type and missing-data pattern. That is why the threshold has to be permuted rather than looked up.

Q: Why is Bonferroni the wrong multiple-testing correction for a genome scan?
A: Adjacent tests are near-duplicates. The effective number of independent tests is set by the number of independent recombination intervals -- genome length in Morgans -- not by marker count. Beyond roughly one marker per few cM, extra markers add essentially nothing to the genome-wide null while Bonferroni charges for every one: in a 1,400 cM genome, 1,500 markers demand LOD 3.74 and 50,000 markers demand LOD 5.20, while the permutation threshold stays near 3.4.

Q: What does permutation preserve, and what does it assume?
A: Shuffling the phenotype vector against the intact genotype matrix preserves the full marker correlation structure (map, density, missing-data pattern), the empirical phenotype distribution, and the cofactor selection step if you reselect inside each permutation -- while targeting the genome-wide maximum LOD, the statistic actually being thresholded. It assumes exchangeability of phenotypes under the null, which holds in a designed cross but fails with population structure, unequal relatedness, covariates correlated with genotype, or selective genotyping.

Q: Is a QTL a gene, and why are QTL confidence intervals so wide?
A: A QTL is an interval, typically 5-30 cM in a cross -- often tens of megabases and hundreds of genes, sometimes containing more than one causal locus. The intervals are wide not from statistical inefficiency but because positional information comes only from recombination breakpoints that actually occurred nearby, and there are very few: the Darvasi-Soller rule puts the 95% interval near 3000/(N d^2) cM in a backcross and about half that in an F2, so halving the effect quadruples the interval.

Q: State the Beavis effect, and say whether a QTL whose effect shrinks on replication was a false positive.
A: Estimating an effect conditional on having declared it significant gives an upward-biased estimate; when power is low the conditional expectation collapses to roughly the detection threshold itself, almost independently of the truth. Beavis's simulations show about twofold inflation at 100 progeny, modest at 500, and little at 1,000. So shrinkage on replication is the expected behaviour of a real locus, not evidence against it -- what counts against a locus is failure to reach significance in a replication powered for the smaller estimate.

Q: How does a significance threshold set a minimum reportable effect size before any data are collected?
A: For small PVE, chi^2 is about N x PVE, so a LOD threshold converts directly into a floor on PVE. In an F2 of N = 400 with a LOD 3.4 threshold, chi^2 = 3.4 x 4.605 = 15.66, so nothing below PVE = 15.66/400 = 3.9% can be declared at all. A QTL whose true PVE is 3.0% is undetectable on average, and on the occasions it is detected it must be reported at 3.9% or more -- an unavoidable 30% inflation. At N = 250 the floor rises to 6.3%.

Q: Why did linkage analysis solve Mendelian disease and stall on complex traits?
A: Two independent reasons. Effect size: linkage detects excess allele sharing among affected relatives and the signal collapses as genotype relative risk approaches 1 -- Risch and Merikangas showed that for a variant of frequency 0.1 with genotype relative risk 1.5, linkage needs about 68,000 sib-pair families against about 2,200 trios for a family-based association test, roughly a thirtyfold gap, widening to more than a hundredfold at frequency 0.01 (4.6 million families against about 19,000 trios). Recombination supply: a meiosis yields only a few dozen crossovers, so relatives share chromosome-arm-scale segments and linkage cannot resolve below about 10-20 cM at any sample size. Locus heterogeneity averages the remaining signal toward zero.

Q: What single substitution turns cross-based QTL mapping into GWAS?
A: Replace the attenuation (1 - 2r)^2 = e^(-4d), which comes from the one or two meioses since the founders, with r^2_LD, the squared correlation between marker and causal genotype built by thousands of generations of ancestral recombination. The non-centrality of the marker test is r^2_LD times the causal variant's. Permutation gives way to a fixed 5 x 10^-8 threshold because the effective number of independent common-variant tests is roughly constant at about 10^6, and permuting a biobank would break the relatedness structure the analysis depends on.

## Polygenicity, the omnigenic proposal, and G x E

Q: What did the common-disease/common-variant hypothesis claim, and what is the verdict on it?
A: It claimed that because common diseases are old and human populations passed through a bottleneck and rapid expansion, the contributing alleles should themselves be common and shared across populations -- the argument that justified building fixed arrays to tag common variation through LD. The verdict is right about "common" and badly wrong about magnitude: effect sizes were roughly an order of magnitude smaller than anticipated, so studies powered for odds ratios near 1.5 found nothing while studies of hundreds of thousands of people found thousands of loci with odds ratios near 1.05.

Q: Does the omnigenic model explain complex traits?
A: No -- the polygenicity it addresses is measured and real, but the core/peripheral mechanism is a proposal, not an established result. Boyle, Li and Pritchard (2017) argue that regulatory networks in a relevant cell type are interconnected enough that essentially every gene expressed there perturbs the trait a little, via trans effects propagating to a few "core" genes. Wray et al. (2018) reply that standard many-locus quantitative genetics already predicts that polygenicity, that core versus peripheral has not been shown to be empirically separable, and that a model in which every gene matters is hard to falsify.

Q: Why does detecting a G x E interaction need about four times the sample size of a main effect of the same magnitude?
A: In a balanced 2x2 design with n per cell, the main-effect contrast has variance sigma^2/n while the interaction contrast (ybar_11 - ybar_10) - (ybar_01 - ybar_00) has variance 4 sigma^2/n. The standard error is twice as large, so the same power costs four times the n -- and interactions are typically smaller than main effects, not equal. Measurement error in E attenuates beta_GE on top of that, compounding a problem that was already 4x worse.

Q: Why is "there is a G x E interaction" a statement about a modelling choice rather than about nature?
A: Because interaction is not scale-invariant. A model that is additive on the log scale shows interaction on the raw scale, and conversely, so the claim means nothing until the scale is independently motivated. This is the most frequently missed point in the G x E literature.
