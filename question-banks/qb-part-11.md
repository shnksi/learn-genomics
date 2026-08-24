# Question bank — Part 11: Human and statistical genomics

Covers [Ch 51-56](../part-11-human-and-statistical-genomics/51-gwas.md).

Convert to Anki: `python reference/to_anki.py question-banks/ --out anki-import.tsv`

## GWAS: the model and its confounders

Q: A GWAS is about ten million regressions of phenotype on genotype. Why is it not a first-year statistics exercise inside a loop?
A: Nobody ran the experiment: the mapping population is human history, which randomised nothing and sorted both allele frequencies and phenotypes by geography. The rows are not independent either, because a biobank contains undeclared relatives and a continuous gradient of relatedness. And the predictor is a proxy, correlated with the causal site at some r^2 set by population history.

Q: Additive 0/1/2 dosage coding forces the heterozygote exactly halfway between the homozygotes. Why is it still the default, and where does it fail?
A: The additive test's non-centrality is proportional to the additive variance V_A and is blind to dominance variance, so the question is what fraction of locus variance is additive. For a strictly recessive allele that fraction is 2p/(2p+q): about 67% at MAF 0.5 and 40% at 0.25, but only 9.5% at MAF 0.05. Additive coding is defensible for common variants and poor for rare ones.

Q: Write down the covariance that population stratification creates, and say what must be true for it to be non-zero.
A: For a variant with genuinely zero effect inside every subpopulation, with two groups in proportions w and 1-w, Cov(g, y) = 2 w (1-w) (p1 - p2) (mu1 - mu2). It is non-zero only when both the allele frequency and the mean phenotype differ between the groups, which makes ancestry a common cause of genotype and phenotype -- a confounder in the strict sense.

Q: Why does a larger sample make a stratification artefact more significant rather than less?
A: Because stratification is bias, not variance. The estimate does not shrink with n; only the standard error does, so the non-centrality grows linearly in n and the p-value marches toward zero. Every other error in genomics improves with more data; this one worsens.

Q: Rank principal components, linear mixed models and within-family designs by how much confounding each removes.
A: PCs are weakest: they capture the dominant axes of ancestry but miss structure hiding in small eigenvalues and fine-scale recent relatedness. A mixed model with a genetic relationship matrix carries the entire relatedness spectrum, handling continental ancestry and cryptic cousinships in one model. Within-sibship regression is strongest, because conditional on the parents segregation is a fair coin, so confounding is removed by construction rather than adjusted for.

Q: What does a within-sibship GWAS estimate that a population GWAS does not, and how big is the difference?
A: A population estimate mixes the direct effect of the inherited allele with demographic confounding (stratification and assortative mating) and with indirect genetic effects, where parents' and siblings' alleles act through the environment they create. Within-sibship analysis isolates the direct effect. Across 178,086 siblings in 19 cohorts the attenuation was about 47% for educational attainment against about 10% for height, so the discount is trait-specific and bites hardest on socially loaded traits.

Q: Why is substituting a race or ethnicity label for a measured ancestry covariate a measurement-error problem before it is anything else?
A: Genetic ancestry is a continuous, measurable statement about which historical populations a genome was inherited from, estimated as coordinates on continuous axes or as admixture proportions, with individuals routinely sitting between labelled clusters. Race is a social classification whose categories differ between countries and change within a century, and the two correlate imperfectly and differently in different places. So a race label is a noisy proxy for the confounder you meant to control, and residual stratification survives the adjustment.

## Inflation, thresholds and quality control

Q: A height GWAS in 450,000 people reports genomic inflation lambda = 1.35. Is the analysis confounded?
A: Not necessarily. Under a polygenic architecture most of the genome carries a small true effect, so the median chi-square is legitimately above the null, and that contribution scales with N -- lambda grows without bound as a perfectly clean study grows. For height at that sample size, 1.35 is roughly what a correct analysis should produce.

Q: How does LD-score regression separate confounding from polygenicity, when lambda cannot?
A: Polygenic signal is proportional to a variant's LD score (how many variants it tags, weighted by how well), whereas stratification and cryptic relatedness inflate every statistic irrespective of its LD. Regressing observed chi-square on LD score gives E[chi2] = (N h^2 / M) times the LD score, plus Na, plus 1, so the slope estimates SNP heritability and the intercept measures inflation that does not track LD. The scale-free diagnostic is the attenuation ratio, (intercept - 1)/(mean chi2 - 1), with below about 0.1 to 0.2 treated as acceptable.

Q: Why is applying genomic control to a modern well-powered GWAS a mistake?
A: Genomic control divides every statistic by lambda, which is sound only if all inflation comes from uniform confounding. Under polygenicity much of lambda is real signal, so the correction deletes genuine discoveries, and it gets worse as studies grow. In the worked example a hit at Z = 5.914 becomes Z = 5.421 after correction -- below the 5.4513 threshold, so the discovery disappears.

Q: Where does the 5 x 10^-8 threshold come from, and why does imputing to 20 million variants not make it stricter?
A: It is 0.05 Bonferroni-corrected for roughly 10^6 effectively independent common-variant tests in European-ancestry LD, corresponding to |Z| > 5.4513. Extra markers are mostly redundant with ones already tested, so the threshold prices the genome's independent information content rather than the number of columns in your file. By the same logic, testing only 50 candidate SNPs earns no laxer threshold -- which is the statistical core of why the candidate-gene literature failed to replicate.

Q: For whom is a fixed 5 x 10^-8 threshold miscalibrated, and in which direction?
A: African-ancestry samples have shorter haplotype blocks -- roughly 11 kb against 22 kb -- so there are about twice as many effectively independent tests and the threshold should sit nearer 1-2 x 10^-8; a fixed 5 x 10^-8 is anti-conservative there. It is conservative in founder populations with long haplotypes, and too lax for whole-genome sequencing, where proposals cluster around 5 x 10^-9 to 1 x 10^-8. The equity consequence is that the group with most to gain from discovery is the one where the fixed threshold controls error least well.

Q: Why is the Hardy-Weinberg filter applied in controls only, and why should its threshold be kept loose?
A: HWE departure is used as a genotyping-error detector, because allele dropout and mis-clustering produce heterozygote deficits far larger than any biological force. A true recessive association makes cases genuinely depart from HWE, so filtering the whole sample deletes the discovery. The threshold stays loose (around p < 1 x 10^-6) because at N = 500,000 the test detects trivially small departures caused by structure, and a strict filter would remove real variants.

Q: Why are A/T and C/G variants dangerous in a cross-study merge, and what is standard practice?
A: They are palindromic: the reverse-complement allele set equals the forward set, so the allele codes alone cannot say which strand each cohort reported. The only remaining evidence is allele frequency, which discriminates nothing when the MAF is near 0.5. Standard practice is to drop palindromic variants with MAF above roughly 0.4 before merging, because a silent sign flip makes a variant actively subtract, with no warning and no malformed data.

Q: Which QC step is called "the classic false positive", and by what route does it manufacture association?
A: Differential missingness between cases and controls. If the two groups were plated, extracted or arrayed separately, missingness correlates with phenotype -- and so does the genotype among those successfully called, so a variant whose assay behaves differently in the two batches shows association with no biology behind it. The test is a per-variant comparison of call rates in cases against controls, and it is what catches batch structure that the phenotype happens to know about.

Q: Why is the frequency filter in a GWAS written as MAC >= 20 rather than MAF >= 0.01?
A: Because chi-square asymptotics fail when a handful of carriers drive the statistic, and what governs that is a count of minor alleles rather than a proportion. A count-based threshold then scales with the study automatically: MAF 0.01 is 20 alleles in 1,000 people, which is exactly the edge, and 10,000 alleles in 500,000 people, where the same fractional cut needlessly deletes perfectly testable variants.

Q: Why does imputation output posterior dosages rather than hard calls, and what does an INFO filter of 0.4 cost you?
A: The posterior mean dosage in [0, 2] carries the imputation uncertainty into the regression where it belongs, whereas rounding to a best guess biases effects toward zero. INFO (or r^2) compares the observed variance of imputed dosages to the variance expected under Hardy-Weinberg at that allele frequency and behaves like the squared correlation between imputed and true genotype, so it plugs straight into the attenuation result: INFO 0.4 costs a factor of 2.5 in effective sample size.

Q: Why do imputation failures fall hardest on under-represented ancestries?
A: Imputation copies each target chromosome as a mosaic of reference-panel haplotypes, so the panel is the constraint: a variant absent from the panel cannot be imputed at all, and a target haplotype unlike anything in the panel forces constant switching, which flattens the posterior and lowers INFO. Both failures bite hardest where panel haplotype sharing is thinnest, so the groups already under-represented in discovery lose variants and effective sample size on top of that.

Q: Fixed-effect inverse-variance meta-analysis is identical to what, and why does that equivalence organise the whole field?
A: Weighting each study by w_k = 1/s_k^2 gives, under homogeneous effects and no sample overlap, exactly the estimate you would get by pooling the individual-level data. That is the load-bearing fact of the consortium model: summary statistics suffice, so individual genotypes never have to leave the institution or jurisdiction that consented the participants. For case-control studies the right weight is the effective sample size N_eff = 4 / (1/N_cases + 1/N_controls), so 1,000 cases with 500,000 controls is worth about 4,000, not 501,000.

Q: Every component study of a meta-analysis has a clean LD-score intercept, but the meta-analysis intercept exceeds 1. What is the likely cause?
A: Sample overlap. The same participants entering two contributing studies makes their estimates non-independent, which inflates the combined statistic irrespective of LD -- exactly the signature the intercept detects -- while leaving each component study perfectly well behaved. It is a property of the combination, not a confound inside any single cohort, and biobanks that everybody uses make it endemic.

Q: On a Manhattan plot, why is a lone spike more suspicious than a shorter tower with shoulders?
A: Because a real causal effect must by construction be visible through everything in LD with it, so a genuine association appears as an index variant flanked by dozens of correlated variants whose significance decays with their r^2 to it, over the tens of kilobases LD extends across. A single significant point with no supporting neighbours is almost always an artefact -- a mis-clustering assay, a badly imputed variant -- which makes shape, not height, the fastest artefact detector available.

Q: On a QQ plot the diagnostic value is entirely in where the curve leaves the diagonal. What do the three departure patterns mean?
A: A late departure, with the bulk on y = x and a lift only in the extreme tail, means a small number of real loci and a clean analysis. A uniform lift, leaving the diagonal gently near the origin and staying above it, means polygenicity or mild confounding, which lambda cannot separate -- check the LD-score intercept. An early departure, inflated even near p = 0.5, means confounding from structure, relatedness, batch or a miscalibrated test, and nothing there is safe. Deflation below the diagonal means over-correction.

## Effect sizes, replication, and why the hit is a tag

Q: How large are typical genome-wide-significant common-variant effects, and how does a trait become highly heritable from effects that small?
A: Per-allele odds ratios usually run 1.05 to 1.3, and quantitative-trait effects 0.01 to 0.05 phenotypic standard deviations per allele. A variant at MAF 0.3 with beta = 0.02 SD explains 2pq beta^2, about 1.7 x 10^-4, or 0.017% of the variance. Thousands of such variants are how a trait reaches 60% heritability.

Q: Why does every discovery study overstate the effects it discovers, and which estimates does it overstate most?
A: Effects that small clear a stringent threshold only when noise helps, so conditioning on significance truncates the sampling distribution and inflates the reported estimate by an inverse Mills ratio term. The inflation is worst for variants whose true non-centrality sits well inside the threshold: in the worked example a true E[Z] of 4.108 becomes 5.914 when detected, a factor of 1.44. Because variance explained goes as beta squared, the bias on variance explained is the square of that, about 2.07-fold.

Q: Why does replication use a nominal p < 0.05 with a prespecified direction rather than genome-wide significance again?
A: Because replication tests one prespecified variant, so the burden is one test, not a genome scan. In the worked example a variant with 9% power to reach 5 x 10^-8 has 99% power to replicate at nominal significance in an identically sized sample, so demanding genome-wide significance twice would discard nearly every true finding.

Q: Why is the index variant at a locus usually not the causal one?
A: It is simply the marker with the largest test statistic among dozens in the same LD block, all correlated with the true causal site at similar r^2. Which one tops the list is close to a coin flip resolved by sampling noise, and re-running the study on a fresh sample from the same population routinely promotes a different block member. The causal site may not have been genotyped at all.

Q: About 90% of index variants lie outside coding sequence. Why is that not an ascertainment accident, and what does the FTO locus teach about naming the gene?
A: Coding changes with real consequences are under stronger purifying selection and therefore sit at low frequency where common-variant GWAS has no power, and most of the mutational target for quantitative variation is regulatory anyway. FTO is the standing warning: variants in its intron 1 are among the strongest BMI associations, but the causal variant disrupts a repressor site in an enhancer that loops to IRX3 and IRX5 several hundred kilobases away, and perturbing FTO itself does not reproduce the effect.

## Fine-mapping and the limits of resolution

Q: What sample size is needed to separate a causal variant from a competitor, and what does the formula say about perfect proxies?
A: Demanding a Bayes factor of at least B requires N >= 2 ln(B) / [(1 - r^2) R^2_c], where r is the correlation between the two variants and R^2_c the trait variance the causal variant explains. Sample size buys resolution linearly while LD costs it as 1/(1 - r^2), so at r^2 = 0.99 a strong locus needs about 175,000 samples and at r^2 = 1 the task is impossible at any N -- identical genotype columns cannot be distinguished.

Q: Why does adding samples of a different ancestry buy resolution that more of the same ancestry cannot?
A: Because r is a population parameter: two variants in near-perfect LD in one population may sit at much lower r^2 in another with a different recombination and demographic history. Populations of African ancestry have larger long-term effective size and no out-of-Africa bottleneck, so blocks are roughly half as long and neighbouring variants show sharper r^2 contrasts -- exactly the denominator in the resolution formula. Multi-ancestry data adds a second constraint too: the causal variant is associated in all populations, a tag only where it happens to be correlated.

Q: What does a 95% credible set actually assert, and what does it not?
A: Conditional on the model being right, there is 0.95 posterior probability that the set contains the causal variant. It is not a frequentist confidence set and carries no coverage guarantee, and a variant with PIP 0.2 is not "20% causal" -- it holds a fifth of the posterior mass. The conditions are load-bearing: the causal variant must be in the analysed data, the effect additive, the number of causal variants within the assumed maximum, and the LD matrix correct for this sample.

Q: What is LD mismatch in summary-statistics fine-mapping, and why is it so dangerous?
A: Summary-statistics methods take marginal z-scores plus a reference-panel LD matrix. If that matrix does not match the study sample -- wrong population, wrong panel, a meta-analysis of structurally different cohorts -- the implied linear system is inconsistent, and the method resolves the inconsistency by confidently nominating whichever variant explains the discrepancy. You get PIP 0.99 on the wrong base with no error message, which is why diagnostics comparing each observed z against what its neighbours predict should be run every time.

Q: Functional annotation can be used as a prior over which variant is causal. Name the three cautions that follow from it being a prior.
A: It cannot create information about which variant is causal, only reweight the survivors -- a flat likelihood plus a confident prior returns the prior. It is circular if the annotation was derived from the same trait. And every PIP is now conditional on the annotation model, so two groups with different annotation stacks can report different credible sets from identical summary statistics, both correctly.

## Variant to gene, and Mendelian randomisation

Q: A GWAS lead SNP is also a strongly significant eQTL for a nearby gene. Why is that not evidence that the gene mediates the association?
A: Sharing a lead SNP is not sharing a causal variant. An LD block holds hundreds of correlated variants, so two independent causal variants -- one for the trait, one for expression -- each produce a signal across the whole block and their leads coincide often. The test that distinguishes them is colocalisation, which asks whether the two traits share a causal variant (H4) or have distinct ones inside the same block (H3).

Q: How should coloc output be read, and what is the commonest misinterpretation?
A: PP4 is the quantity of interest, and PP4/(PP3+PP4) states "given both traits have a signal here, they share it". The commonest misreading is treating low PP4 as evidence against colocalisation: low PP3 and low PP4 together mean the region is underpowered for one trait, not that the signals are distinct. The prior p12, conventionally 10^-5, drives the answer and sensitivity to it should be reported.

Q: Why is a significant TWAS gene not a causal gene?
A: A TWAS statistic is a weighted linear combination of the same marginal GWAS z-scores, so a hit arises whenever the causal variant correlates with variants that happen to receive weight, mediation or not. Neighbouring genes also share regulatory variants, so their weight vectors correlate and hits arrive in blocks of adjacent genes, with the top rank set by which prediction model put more weight near the causal variant. Treat it as a screen to be followed by colocalisation and then perturbation.

Q: What logical claim does an MPRA test, and how does it differ from what a CRISPR perturbation tests?
A: An MPRA tests sufficiency: that 200 bp, removed from chromatin and placed on an episome, drives transcription differently depending on which allele it carries, in that cell type. CRISPRi or deletion of the endogenous element tests necessity in native chromatin, and base or prime editing tests necessity of the specific allele. They dissociate in both directions -- redundant enhancers are sufficient but not necessary, and elements needing native nucleosome positioning or a long-range contact are necessary but not sufficient.

Q: Only about 5-40% of trait associations colocalise with an eQTL. Why does the selection argument make that expected rather than a technical shortfall?
A: Genes whose dosage matters for a trait are by that fact under purifying selection on expression, so a common variant with a large expression effect on such a gene would have been removed; what survives commonly near constrained genes is small-effect regulatory variation. eQTL studies most easily find large expression effects, concentrated near the transcription start sites of genes whose expression is not constrained. The property that makes a gene matter for disease is the property that makes its expression variation rare, so the two discovery processes ascertain different parts of the genome.

Q: State the three instrumental-variable assumptions behind Mendelian randomisation and name the untestable one.
A: Relevance (the instrument is associated with the exposure), which is testable; independence (the instrument is independent of confounders of exposure and outcome), which is partly testable and broken by population structure, assortative mating and dynastic effects; and exclusion (the instrument affects the outcome only through the exposure), which is not testable and is broken by horizontal pleiotropy.

Q: MR-Egger, weighted median, weighted mode and MR-PRESSO are called sensitivity analyses. What do they actually establish?
A: Each checks that a specific class of violation is absent, under further assumptions of its own -- Egger allows directional pleiotropy under the unverifiable InSIDE condition, the weighted median needs half the weight from valid instruments and the weighted mode needs the largest cluster of individual-SNP estimates to come from valid ones, MR-PRESSO assumes most instruments are valid and selects on residuals. None tests the exclusion restriction. The evidence is agreement across estimators with different, non-nested assumptions; a single point estimate is not.

Q: Human genetic support multiplies the odds a drug programme succeeds by about 2.6, refining an older twofold estimate. What two details about that multiplier matter more than the headline?
A: The advantage grows with confidence in the causal gene -- it is not "there is a GWAS hit nearby" but "we know which gene", which is what the whole variant-to-gene toolkit earns. It is also largely unaffected by the variant's effect size or allele frequency, because a drug perturbs a target far harder than any common allele does, so an odds ratio of 1.03 can still nominate a worthwhile target.

## Polygenic scores

Q: Why is summing all the genome-wide-significant marginal effects in a region the wrong estimator?
A: Because a GWAS fits one variant at a time, so each marginal estimate already absorbs the causal effects of everything it is correlated with: the marginal vector is approximately the LD matrix times the joint effects. One causal variant tagged by twenty markers at r = 0.95 appears twenty times in the sum, roughly nineteen times the true genetic contribution. The ideal fix, multiplying by the inverse LD matrix, is unavailable because that matrix is huge, estimated from a small reference panel and ill-conditioned.

Q: In what sense are clumping+thresholding, LDpred, lassosum and PRS-CS the same method?
A: All are regularised solutions to the same ill-conditioned linear system, differing only in the prior they place on the distribution of true effect sizes -- a point mass below a p-value threshold, a point-normal mixture, a Laplace penalty, or a heavy-tailed global-local scale mixture. Which prior wins is an empirical question about the trait's genetic architecture: sparse priors suit lipids and autoimmune disease, continuous shrinkage suits hyper-polygenic traits like height and schizophrenia.

Q: Why does adding more SNPs to a score not reliably improve it?
A: A variant whose true effect is zero contributes no signal and its estimation variance to the score, and the overwhelming majority of variants are null. Restricting to significant hits fixes that but discards the large number of true effects below genome-wide significance, so the p-value threshold is a bias-variance tradeoff whose optimum is not a property of the trait -- it moves with GWAS sample size and polygenicity and must be tuned on a separate cohort.

Q: A polygenic score for a disease reaches AUC 0.68. Is that a poor score?
A: Not by itself: the ceiling is set by how much liability variance a score can explain. At prevalence 5% a score capturing an entire liability heritability of 0.30 would top out at AUC 0.82, and a score explaining 0.10 of liability variance reaches 0.691. The meaningful quantity is the ratio of achieved to attainable, not the raw number.

Q: A score has excellent AUC but assigns 40% risk to people whose true risk is 4%. Which property has failed, and why does AUC not detect it?
A: Calibration has failed while discrimination is fine. AUC is invariant to any monotone transformation of the score, so multiplying every predicted risk by ten leaves it unchanged -- it is incapable of detecting miscalibration. Calibration is the property a threshold-based decision consumes, and it is the one that breaks first when a score moves to a new setting, because both the baseline risk and the score's own mean and variance shift.

Q: A press release reports a 99th-versus-1st-percentile odds ratio of 33 for a disease with 5% prevalence. What does the same model say in absolute terms?
A: With a score explaining 10% of liability variance, top-decile absolute risk is about 12.75% against a population 5% -- an increase of 7.8 percentage points, with 87% of the top decile never developing the disease. The same model gives a relative risk of 2.55 against the population average, so the extreme-percentile odds ratio has multiplied that by thirteen without adding information. Only the top decile's 25.5% share of all cases tells you screening it alone would miss three quarters of cases.

Q: A European-trained score predicts about a third as well in a West-African-ancestry cohort. Why is "the genetics of the trait differs between groups" the wrong explanation?
A: The score weights tag markers, and each weight is the causal effect scaled by the tag-cause correlation in the discovery population; where LD differs the weight is wrong, and where the sign of r flips the variant actively subtracts. Allele-frequency differences and worse imputation compound it. The failure is directional and follows the data: train the identical pipeline in a West-African-ancestry cohort and the score works there and degrades in Europeans, which a property of the trait could not do.

Q: Genomic prediction transformed dairy cattle breeding but underperforms in human clinics. What differs, given that the estimator is the same?
A: Nothing about the statistics is better in cattle; the setting is. Livestock training and target populations are the same closed breed, re-trained every generation, with small effective size giving long stable LD so markers tag the same way in the target, a deliberately uniform environment, and a requirement only for an accurate ranking of candidates. Human prediction applies one cohort's weights to everyone, in an uncontrolled environment correlated with genotype, and needs a calibrated absolute risk for one person.

Q: A paper reports that its polygenic score reaches R^2 = 0.28 for coronary disease. Which two things must you check before that number means anything?
A: Whether it is incremental over a covariates-only model, because age and sex alone already reach a C-statistic near 0.75 for CAD, so a full-model figure is mostly reporting the covariates rather than the score. And whether a case-control result has been converted to the liability scale, because an observed-scale R^2 depends on the case fraction the investigators chose to ascertain, which makes two studies of the same score incomparable until both are converted.

Q: Training, tuning and testing a polygenic score needs three disjoint sets of people. Which breaches of that are easiest to miss?
A: Sample overlap between the discovery GWAS and the target cohort, because biobanks are heavily re-used and overlap is often undocumented, which lets the score partly memorise the target phenotypes. Cryptic relatedness across the sets, which needs an explicit kinship filter rather than a name check, because relatives share both genotype and environment. And tuning on the test set, which reports a maximum over hyperparameters as if it had been prespecified, and is often not described as a tuning step at all.

## Rare variants and Mendelian disease

Q: Why is the "common and large effect" corner of the frequency-by-effect plane essentially empty, and what do the exceptions have in common?
A: An allele that reduces fitness sits at mutation-selection balance: about mu/hs for a dominant and about sqrt(mu/s) for a recessive, which for a severe condition puts the ceiling near 10^-6 and 10^-3 respectively. Selection sets the frequency ceiling, so the exceptions are the cases where selection cannot act -- late onset (APOE e4 costs nothing at 25), balancing selection (the HBB sickle allele at about 10% where malaria was endemic), and drift or founder effects in small populations.

Q: Why can no test, however clever, bring a variant carried by fewer than about 25 people to genome-wide significance?
A: In a balanced case-control study each of k carriers is a case with probability one half under the null, so the most extreme possible outcome -- all carriers are cases -- has p = 2^-k. Setting 2^-k <= 5 x 10^-8 gives k >= 25. This is an information bound, not a modelling weakness, so the fix is to aggregate variants so that the gene has 25 carriers even though no variant does.

Q: A collaborator proposes a 20-million-marker array to find a rare disease variant by tagging. Why can that never work?
A: For two loci at frequencies p < q the maximum attainable r^2 is p(1-q)/[q(1-p)], so a causal variant at MAF 0.001 tagged by a common SNP at 0.30 has r^2max = 0.0023 -- a 430-fold sample-size penalty, and only in the best case where the rare allele is perfectly nested inside the common haplotype. A variant can only be tagged by another of similar frequency, so density is irrelevant; you must sequence and observe the variant directly.

Q: "Rare variants are undetectable by GWAS in any design." Where is that summary too strong?
A: Power scales as p x beta^2, so a low frequency can be bought back with a large effect: a variant at MAF 0.1% with a half-standard-deviation effect needs only about 80,000 people for 80% power, and biobank-scale single-variant analyses do find such things. What is genuinely unreachable is the ultra-rare end, where fewer than about 25 carriers exist and the 2^-k carrier floor makes genome-wide significance impossible at any sample size.

Q: Why is the allele-frequency filter for a recessive disease hypothesis about a thousand times looser than for a dominant one?
A: Because the frequency of affected people is linear in q under a dominant model and quadratic under a recessive one. Requiring the allele to explain at most a fraction c of cases gives q <= cP/(2f) for a dominant and Q <= sqrt(cP/f) for a recessive; at prevalence 2 x 10^-5, full penetrance and c = 0.05 those are 5 x 10^-7 and 1 x 10^-3. The square root is the entire difference, and both numbers reproduce mutation-selection balance from the other direction.

Q: Before filtering, roughly what fraction of naive trio de novo calls are real, and what is the dominant error term?
A: About 2%: around 70 true de novo events against thousands of candidate positions, a 98% false discovery rate. The dominant error is not a missed heterozygous parent -- at 30x coverage a true heterozygote yields zero alternate reads with probability about 10^-9 -- but systematic artefacts in the child, from mismapping in segmental duplications and repeats, alignment-induced false indels and strand-biased errors.

Q: Two unrelated children have de novo truncating variants in the same gene. How strong is that evidence?
A: It depends entirely on how many trios you looked at, because the per-gene de novo protein-truncating expectation is about 5 x 10^-6 per child. In a 100-trio study two hits in one gene is roughly a 1-in-400 event and near-conclusive; in a 10,000-trio study you expect about 24 such genes by chance across the genome and would need five hits to make the same claim. It is a p-value that scales with cohort size, not a fixed standard of evidence.

Q: Two rare damaging variants sit in the same recessive gene. Why is that not yet a diagnosis, and why can statistical phasing not settle it?
A: A recessive diagnosis needs both copies disabled, so the two variants must be in trans; in cis one allele is fully intact and the person is an unaffected carrier of a doubly-mutant haplotype. Roughly half of by-chance pairs are in cis. Statistical phasing works by finding other people who share a haplotype, and an ultra-rare variant has almost no LD partners, so it fails precisely for the variants a Mendelian diagnosis turns on -- trio, read-backed or long-read phasing is required.

Q: When should you run a burden test and when SKAT, and why does the variant mask matter more than the choice?
A: Burden collapses the gene to one number and has a single degree of freedom, so it extracts maximum signal when effects share direction -- predicted loss-of-function variants in a haploinsufficient gene -- and exactly zero when they cancel, as with mixed loss- and gain-of-function missense variants, which is a SKAT situation. The mask matters more because it is a hypothesis about which variants share a mechanism: if only a fraction pi of included variants are causal, the non-centrality falls by pi, so a mask that is 20% causal needs five times the cohort.

Q: A gene has LOEUF 1.4 and pLI 0.01. Give three innocent reasons you might still take a candidate variant in it seriously.
A: The gene may be short -- LOEUF's precision scales with the expected pLoF count, and about 12% of genes still have fewer than 10 expected at gnomAD v4 scale, with DCX called unconstrained by both metrics until the larger v4 sample flipped it to LOEUF 0.44. The disease may be recessive, so heterozygous loss is never depleted (CFTR and HBB look unconstrained). Or it may be late-onset, so the fitness cost is small, as for BRCA2 and LDLR.

Q: Population-scale genotype-first studies find much lower penetrance than the textbook figures. What explains the gap?
A: Ascertainment. Classical penetrance was estimated from families that reached clinical attention because they contained multiple affected members, which conditions on exactly the things that raise penetrance -- polygenic background, modifier alleles, shared environment. Across two large biobanks, 89% of about 5,360 pathogenic or loss-of-function variants carried a risk difference of 5 percentage points or less, with mean observed penetrance around 7%, and even BRCA1 and BRCA2 averaged near 38%. Neither figure is "the" penetrance: the family estimate is right for a member of such a family, the population estimate for someone found incidentally.

Q: A newborn screen for a condition affecting 1 in 50,000 runs at 99.9% specificity. What is its positive predictive value, and what does that force on the design?
A: About 2%: across 100,000 newborns you get roughly 2 true positives against roughly 100 false ones, because PPV is dominated by prevalence rather than by specificity. That one calculation drives everything -- restrict the gene list, restrict to variants with strong pre-existing evidence rather than "any loss-of-function allele in the gene", and require orthogonal confirmation before anything is called a diagnosis -- because the cost of a false positive is a healthy child medicalised.

Q: A carrier screen with 90% detection returns negative for a condition with carrier frequency 1 in 25. What is the residual risk?
A: About 1 in 241. The residual risk is c(1-d)/(1-cd) with prior carrier frequency c and detection rate d, so 0.04 x 0.10 / (1 - 0.036) = 0.00415. A negative result reduces the risk roughly tenfold and does not eliminate it, and counselling that treats it as elimination is wrong.

## Clinical variant interpretation

Q: What is a variant of uncertain significance actually a statement about, and what does it license?
A: It is a statement about the evidence, not the variant: the accumulated evidence has not moved the posterior out of roughly 0.10 to 0.90 in either direction. Most VUSs are benign variants nobody has yet gathered evidence about. A VUS licenses nothing -- not surgery, not surveillance changes, not predictive testing of relatives -- because acting as if pathogenic and acting as if benign both cause harm, so the workup continues by other means.

Q: What model underlies the ACMG/AMP checklist, and how do points map onto posteriors?
A: A naive Bayes classifier with hand-set likelihood ratios, in which the strength tiers form a geometric ladder -- each step squaring the one below -- which makes evidence additive in units of the Supporting step. Scoring Supporting 1, Moderate 2, Strong 4 and Very Strong 8, with prior 0.10 and Very Strong odds 350, the posterior is pi X^(N/8) / [pi X^(N/8) + (1-pi)]. Six points gives exactly 0.900 and ten points 0.994, reproducing the published tier boundaries.

Q: Show that the rule "two Strong criteria implies Pathogenic" is inconsistent with the Bayesian model, and say why the rule exists.
A: Two Strong criteria are 8 points, so the combined odds are 350^(8/8) = 350 and the posterior is 35/35.9 = 0.975 -- Likely pathogenic, not Pathogenic. It exists because the 2015 rules were assembled by expert consensus on which combinations felt sufficient, before anyone wrote down the implied model; sixteen of the eighteen rules turned out consistent with it, and the other mismatch runs the other way, with PVS1 plus one Moderate scoring 10 points and a posterior of 0.994.

Q: How do you decide whether a variant is too common to cause a given disease?
A: Derive a maximum credible allele frequency from the disease model: AF_max = D x g x a / (2 psi) for a dominant condition, where D is prevalence, g the largest fraction of cases from this gene, a the largest fraction of those from one allele, and psi the penetrance. For hypertrophic cardiomyopathy via MYH7 that gives 5.6 x 10^-6, about 9 alleles in gnomAD's ~1.6 million -- note MYBPC3 (~20% of cases) is the largest single-gene contributor, not MYH7 (~14%), so g = 0.14 here. The threshold is a model output, not a constant -- only BA1 at 5% needs no disease model.

Q: A variant is absent from gnomAD. How much does that argue for pathogenicity?
A: Little, which is why ClinGen downgrades PM2 to Supporting. Almost every variant is absent from almost every database, because the space of possible variants vastly exceeds the number sampled, so rarity is what benign and pathogenic rare variants have in common. Zero observations in about 1.6 million alleles bounds the frequency above at roughly 1.9 x 10^-6 by the rule of three, which is informative only if that sits below the disease's maximum credible frequency.

Q: A curator writes "SIFT deleterious, PolyPhen-2 probably damaging, REVEL 0.81 -- three lines of computational evidence, so PP3 at Strong." What are the two errors?
A: The evidence is counted three times: these tools read overlapping features, above all the same cross-species alignment, and REVEL is a random forest built over thirteen other predictors including these, so multiplying three likelihood ratios inflates the evidence roughly quadratically. And the strength is invented -- it is read off calibrated score intervals for one tool, and REVEL 0.81 falls in the PP3_Moderate band, not Strong. The correct entry is a single PP3_Moderate worth 2 points.

Q: A published paper shows the variant reduces activity in a functional assay. Why is that not automatically PS3?
A: Because the strength comes from the assay's validation, not from how impressive the experiment looks. The assay must be run over known pathogenic and known benign control variants, and its odds ratio computed from how well it separates them, then mapped onto the strength ladder -- roughly 2.1 for Supporting, 4.3 Moderate, 18.7 Strong, 350 Very Strong. An assay with eleven pathogenic and eleven benign controls separating them perfectly still cannot exceed Strong, because the control set is too small to estimate odds of 350.

Q: A variant introduces a premature stop codon. Why is that not automatically PVS1?
A: PVS1 applies to a null variant only in a gene where loss of function is an established mechanism of that disease, and the final clause is the whole criterion. Where the mechanism is dominant-negative a stop codon can even be evidence against pathogenicity, because a transcript degraded by nonsense-mediated decay produces no poison peptide at all.

Q: Once PVS1 does apply, what sets its strength?
A: The ClinGen decision tree rather than the flat criterion: whether nonsense-mediated decay is predicted, how much of the protein is removed, whether a skipped exon preserves the reading frame, and whether an alternative start codon rescues translation. A frameshift in the last exon is therefore not the same evidence as one in exon 2, and the tree says so explicitly.

Q: ClinVar lists a variant as pathogenic. What has to be checked before that counts as evidence?
A: The review status, because ClinVar is an archive of submitted assertions rather than a truth set: 165,877 unique variants carry conflicting classifications, a zero-star submission states no method at all and is an anecdote, and one star means either a single submitter with criteria or submitters who disagree. Only about 22,000 variants carry three-star expert-panel review, where a ClinGen VCEP applied a gene-specific specification published in advance; for everything else you read the evidence, not the label.

Q: Why did ClinGen retire PP5 and BP6, and what larger loop does that failure belong to?
A: They let "a reputable source says pathogenic" count as evidence, which launders one lab's unexamined conclusion into everyone else's classification as though it were an independent observation. That is one arm of a circuit: ClinVar labels train computational predictors, predictor scores supply PP3/BP4 evidence, that evidence feeds new classifications, and those classifications are resubmitted to ClinVar, so systematic error is amplified rather than corrected. Excluding training-set overlap during calibration and preferring expert-panel records as controls are attempts to cut the circuit, not solutions.

## Cancer genomics

Q: What plays the role of mutation, selection and drift in a tumour, and which parameter has the largest consequence?
A: The population is the cells of a tissue: they divide, inherit their parent's genome with error, and compete, so heritable variation and differential reproduction are both present, and the compartments are small, so drift matters -- a colonic crypt maintained by a handful of stem cells goes monoclonal by drift alone within years, before any driver is involved. The consequential difference is that somatic lineages are strictly clonal -- no recombination -- so linkage is total and every mutation present in the founding cell of the winning clone rides to fixation with it whether it contributed anything or not. That is why a cancer genome is mostly passengers.

Q: Blood is the standard matched normal in tumour sequencing. Why is that a trap in an older adult?
A: Blood in an older adult is not clone-free: expanded haematopoietic clones carrying DNMT3A, TET2, ASXL1 or PPM1D mutations are common past 60, sitting at 2-20% and drifting upward with age. Such a variant appears in the "normal" and is subtracted as though germline, or appears in plasma and is called as tumour. Good assay design sequences white cells deeply and separately for exactly this reason, which is also why serious minimal-residual-disease assays run a parallel white-cell track.

Q: Why does a naive test for recurrently mutated genes manufacture false drivers, and why does a larger study make it worse?
A: Because the background mutation rate is not constant: it varies severalfold with replication timing, chromatin state, transcription and sequence context, and more than a thousandfold in burden between tumours. With a rate ratio r between true and assumed, the z-score is (r-1) sqrt(mu0 L N), which grows as the square root of N. It is a bias problem, not a power problem, and bias multiplied by sample size beats noise -- which is how TTN and olfactory receptor genes were reported as pan-cancer drivers.

Q: How does somatic dN/dS fix the background-rate problem without modelling any covariates?
A: Synonymous mutations in a gene experience the same replication timing, the same chromatin, the same trinucleotide contexts and the same patient-specific spectrum as the non-synonymous ones, so the gene's own synonymous count is an internal control for every covariate you failed to model. It also gives an interpretable effect size: dN/dS = 2 for missense means half the observed missense mutations there are attributable to selection. Its limit is that synonymous sites are not perfectly neutral, since splice enhancers and codon usage put a floor under the denominator.

Q: How can you read "oncogene" or "tumour suppressor" straight off a mutation diagram, and why do the shapes differ?
A: Oncogene mutations cluster at a few hotspot codons and are almost all missense, because creating a new activity requires a specific structural change that only a handful of substitutions achieve. Tumour suppressor mutations are dispersed and enriched for nonsense, frameshift and splice changes, because destroying an activity can be done almost any way. Quantitatively, the neutral nonsense fraction among coding point mutations is 5-8%; a suppressor shows 30-60%, an oncogene close to zero.

Q: TP53 is a tumour suppressor, so why does its lollipop plot look like an oncogene's, and what is the general lesson?
A: Its missense mutations cluster hard at a handful of DNA-binding-domain residues -- p.(Arg175His), p.(Arg248Gln), p.(Arg273His), p.(Arg282Trp) -- because p53 works as a tetramer, so a mutant subunit poisons complexes containing wild-type subunits (a dominant-negative effect, plus neomorphic gain of function for some alleles). The selective logic is an oncogene's even though the gene is a suppressor, and the lesson is that when the picture and the classification disagree, the picture is telling you about the mechanism.

Q: Somatic APC truncations concentrate in codons 1286-1513 rather than spreading flat across the gene. Why is that not hotspot gain of function?
A: Truncating inside that mutation cluster region -- under 10% of the coding sequence carrying over 60% of the somatic hits -- removes the AXIN-binding SAMP repeats while retaining some beta-catenin-binding repeats, leaving Wnt output high but not maximal, the "just-right" level for tumour growth. That is dosage tuning within the truncating class rather than a new activity, and it is why real suppressor lollipops are rarely as flat as the selective logic alone predicts.

Q: Derive the two-hit hypothesis from Knudson's age-of-onset data.
A: If a tumour needs k independent rate-limiting events at constant rate, the probability a cell has all k by age t goes as t^k and the incidence goes as t^(k-1). Sporadic retinoblastoma incidence rises linearly with age, so k-1 = 1 and two hits are required; hereditary incidence is roughly flat, so k = 1, because the other hit was inherited and is present in every retinal cell. Bilaterality and incomplete penetrance then both fall out of the same Poisson parameter, since e^(-lambda) carriers get no tumour at all.

Q: Why is the second hit at a tumour suppressor usually loss of heterozygosity rather than a second point mutation?
A: Because mitotic recombination and chromosome missegregation happen per cell division at rates vastly higher than the per-base mutation rate: the first hit is a base, the second is an arm. That asymmetry is why two-hit inactivation is achievable within a human lifetime at all. Copy-neutral mechanisms such as mitotic recombination and gene conversion leave the coverage ratio unchanged and are visible only as allelic imbalance at germline heterozygous SNPs.

Q: What does a mutational signature actually identify, and why is SBS3 alone a weak call for homologous-recombination deficiency?
A: A signature identifies a mutational process, not an exposure -- different causes can generate similar chemistry, and the inference to a cause runs through everything else you know about the patient. Flat signatures are the least specific, and SBS3 is flat, which is why clinical HRD assessment combines it with ID6 (deletions carrying microhomology at the junction) and with genomic-scar scores from LOH extent, telomeric allelic imbalance and large-scale state transitions.

Q: A mutation is seen at VAF 0.30. Why is that uninterpretable, and what do you compute instead?
A: VAF confounds tumour purity, local copy number, the number of mutant copies per carrying cell and the cancer cell fraction. The interpretable quantity is CCF = VAF x [rho CN_t + (1-rho) CN_n] / (rho m), which says what fraction of tumour cells carry the mutation: near 1 is clonal and a valid target, 0.3 is one branch. A CCF above 1 is not an error to clamp -- it is the estimator telling you the multiplicity assumption was wrong.

Q: A colorectal cancer relapses on anti-EGFR therapy with four different KRAS mutations and one NRAS mutation in plasma. Did the drug cause them?
A: No -- this is selection on standing variation, the fluctuation-test argument run inside a patient. Induction gives no reason to expect several independent lineages converging on the same functional escape simultaneously, whereas selection predicts exactly that: the alleles pre-existed below the detection limit and the drug removed their competitors. Polyclonal, convergent resistance is the fingerprint, and its therapeutic corollary is that treating harder selects harder, which is the reasoning behind adaptive-therapy trials.

Q: Why does tumour-only sequencing create a consent problem as well as a technical one?
A: Because it cannot reliably separate germline from somatic variants, and incidental pathogenic germline findings turn up in the order of 10-15% of unselected advanced-cancer patients, most without suggestive family history. A somatic BRCA1 mutation is a property of the tumour; a germline one is a property of the patient and, with probability one half per first-degree relative, of the family -- which triggers cascade testing and surveillance conversations nobody agreed to in advance.

Q: Why does MSI predict checkpoint-inhibitor response better than raw tumour mutational burden?
A: Because the kind of mutation matters more than the count: mismatch-repair deficiency generates indels in coding repeat tracts, and a frameshift produces a long stretch of entirely novel peptide rather than a single altered residue, so the neoantigen yield per mutation is far higher. TMB is also assay-dependent and not portable across panels, the 10 mutations per Mb threshold is a regulatory line rather than a biological one, and clonality matters -- a subclonal neoantigen is a target on only a minority of cells.

Q: BRAF p.(Val600Glu) is the same variant in melanoma and in colorectal cancer, so why does the same inhibitor work in one and not the other?
A: Colorectal cells answer BRAF inhibition with rapid EGFR-mediated reactivation of the pathway and melanoma cells do not, so BRAF plus MEK inhibition works well in melanoma and responds poorly in colorectal cancer with the identical variant and the identical drug. Genotype to therapy is not a lookup table: the driver is necessary and the cellular context is decisive.

Q: In ctDNA-based cancer screening, why does specificity rather than sensitivity set the positive predictive value?
A: Because cancer prevalence in a screened population is well under 1%, so the false positives generated by the enormous unaffected majority dominate the true positives however sensitive the assay becomes, and no assay improvement removes that. A second constraint is independent of the assay entirely: a test that finds cancers earlier necessarily finds some that would never have caused harm, and overdiagnosis is a property of the disease's natural history rather than of the test.
