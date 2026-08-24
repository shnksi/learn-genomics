# Question bank — S: The statistics track

Covers [S1-S7](../part-S-statistics/S1-probability.md).

Convert to Anki: `python reference/to_anki.py question-banks/ --out anki-import.tsv`

## Probability, conditioning and the base rate

Q: A purple F2 plant from Aa x Aa -- why is it 1/3 homozygous rather than 1/4?
A: P(AA | purple) = P(AA and purple)/P(purple) = (1/4)/(3/4) = 1/3. Conditioning is filtering: observing "purple" deletes the aa quarter of the sample space and the three survivors renormalise to 1/3 : 2/3. The 1/4 figure is a correct probability in the sample space of all offspring, and it answers a different question.

Q: Where does the 2/3 carrier prior come from, and what does dropping it cost?
A: The unaffected sibling of a child with an autosomal recessive disease came from Aa x Aa, and "unaffected" deletes the aa quarter, leaving 2/3 Aa and 1/3 AA. Using 1/2 because "she's a sibling" ignores that a quarter of the sample space has already been deleted, and it cuts the final risk by a quarter to a third depending on what else the calculation conditions on. It is the step most often dropped in pedigree arithmetic.

Q: Meiosis has no memory, yet one affected child can raise the next child's risk more than 600-fold. Reconcile those.
A: With parents already known to be carriers, the second child's risk is 1/4 whether or not the first was affected -- simulation gives 0.2502 against 0.2510, independence exactly as claimed. With unknown parents at carrier frequency 1/25, one affected child proves what was previously a 1-in-625 proposition, taking the next child's risk from 0.0004 to 0.25. The meiosis has no memory; your model of the parents does, and conditioning acts on the unknowns.

Q: What are the four rows of the table clinical genetics uses for a risk calculation, and where does each come from?
A: Prior P(H_i), from Mendelian segregation or a population allele frequency; conditional P(evidence | H_i), the likelihood of what was actually observed under each hypothesis; joint, prior x conditional per column; posterior, joint divided by the sum of the joints. The denominator is never an extra input, because the hypotheses partition the sample space and normalisation supplies it.

Q: Three unaffected children roughly halve a couple's carrier risk. Why is that such weak evidence?
A: Prior P(both carry) = (2/3) x (1/25) = 0.0267; the conditional is (3/4)^3 = 0.4219 against 1; the posterior is 0.0114, so the risk to a fourth child is 0.0114 x 1/4 = 0.00286, about 1 in 350 against 1 in 150 before. The evidence is weak precisely because healthy children are the likely outcome -- 42% of the time -- even when both parents carry.

Q: Why is a test with 99% sensitivity and 99% specificity wrong about 99% of the time it says yes?
A: Sensitivity is P(positive | affected) and the patient wants P(affected | positive), the other conditional, which Bayes says depends on a prevalence the assay knows nothing about. At prevalence 1 in 10,000, per million people tested you get 99 true positives against 9,999 false positives, so the positive predictive value is 0.98%. Nothing is broken: the unaffected pool is 9,999 times larger than the affected one.

Q: For a rare condition, which lever actually improves a screening test -- sensitivity or specificity?
A: Specificity. For rare conditions PPV is approximately prevalence x sensitivity / false-positive rate, so it is linear in prevalence, inversely proportional to the FPR, and almost indifferent to sensitivity. Making sensitivity perfect moves the worked PPV from 0.98% to 0.99%; cutting the false-positive rate a hundredfold, 99% to 99.99% specificity, moves it to 49.75%.

Q: The same NIPT assay reports a 71% PPV in one population and 96% in another. What does that imply about quoting test performance?
A: That quoting sensitivity and specificity without naming a population is meaningless. Non-invasive prenatal testing for trisomy 21 has pooled sensitivity around 99.7% and a false-positive rate around 0.04%, and the identical laboratory assay gives 71% PPV at prevalence 1 in 1,000 and 96% at 1 in 100. One result letter means different things to two patients, which is why a positive screen is a reason to do a different test rather than a diagnosis.

Q: Why is P(A_) + P(B_) = 3/2 in an AaBb x AaBb cross, and what is the right answer?
A: The sum rule applies only to mutually exclusive events, and dominant-at-A and dominant-at-B are not exclusive, so adding them produces a number greater than 1. Inclusion-exclusion gives 3/4 + 3/4 - 9/16 = 15/16, and the complement is faster: the only excluded class is aabb at 1/16, so the answer is 1 - 1/16 = 15/16.

Q: Predicted heterozygous-site counts in a 1 Mb chr22 window matched the observed mean to 0.6% but the observed standard deviation by a factor of 8.7. Is the mean calculation also suspect?
A: No -- the two rest on different assumptions and only one failed. E[sum of X_i] = sum of E[X_i] is linearity of expectation, which holds for arbitrarily dependent variables, so 609.33 predicted against 612.76 observed is genuine evidence for Hardy-Weinberg at each site. Var(sum) = sum of Var additionally needs the terms uncorrelated, and within a megabase linkage disequilibrium makes them anything but: the 3,564 SNPs behave like about 47 independent units. Dependence leaves means alone and destroys variances.

## Distributions as generating stories

Q: A binomial needs more than "two outcomes". What are the two load-bearing assumptions, and how does each break in genomics?
A: Trials must be independent and share an identical p. Reference bias breaks the second -- reads carrying the ALT allele mismatch the reference and align slightly worse, so p at a heterozygous site is a little under 0.5, and shifting it to 0.45 nearly doubles the dropout rate at 10x. Linked reads and PCR duplicates break the first.

Q: In what sense is an individual's genotype literally a binomial draw?
A: Under random mating the genotype is two independent draws from the gamete pool, so the 0/1/2 ALT dosage is Binomial(2, p) and p^2 : 2pq : q^2 is nothing but that binomial's pmf. At the chr22 SNP nearest p = 0.5 in 503 European-ancestry samples the observed counts 123/257/123 land within three individuals of the predicted 125.8/251.5/125.8.

Q: Why does low-coverage genotyping need imputation, in one number?
A: ALT reads at a heterozygous site are Binomial(depth, 0.5), so at 5x depth P(0 ALT reads) = 0.03125: 3.1% of true heterozygotes have no ALT read at all and are called homozygous reference with no ambiguity whatsoever in the data. That figure, not the sequencer's error rate, is what imputation exists to repair.

Q: The Poisson derivation is its specification. What does that mean for deciding when to use it?
A: Poisson is Binomial(n, p) in the limit n to infinity and p to zero with lambda = np held fixed, so it applies exactly where there are enormous numbers of opportunities each individually almost impossible -- which is the structure of a genome. Reads covering a base, de novo mutations per genome, crossovers per chromosome and reads assigned to a gene all have that shape, and it has no separate variance knob: variance = mean, VMR exactly 1.

Q: Poisson said 0.24% of the E. coli genome was uncovered and 0.85% actually was. Why does that gap matter for a sequencing budget?
A: Because the error is a bias in the direction that costs you, and it worsens the further into the tail you go. Fitting the observed overdispersion gives alpha = (9.031 - 6.047)/6.047^2 = 0.0816, so at 15x the honest estimate of under-covered genome is 1.3% rather than Poisson's 0.09% -- fifteen times worse, about 60,000 uncallable bases. The negative binomial does not cross 0.1% until 23x, which is why the 30x convention is Lander-Waterman corrected for a lambda that varies along the genome.

Q: Are crossovers Poisson along a chromosome?
A: No -- they are underdispersed, VMR below 1, because interference and the obligate crossover space them more evenly than Poisson allows. A Poisson bivalent with lambda = 1 would have no crossover 37% of the time and real bivalents essentially always have one. That is precisely the difference between the Haldane map function (Poisson, no interference: r = 0.316 at 0.5 M) and Kosambi (interference: r = 0.381).

Q: State two things the central limit theorem does not promise.
A: It does not promise that your data are normal -- it is about the sum or mean, so a million read counts are still not normal while their mean is -- and it does not promise accuracy in the far tails at any n. For the mean of 1,000 Poisson(0.5) draws, exact calculation puts the 4-sigma right tail 1.5x heavier and the left tail 1.7x lighter than normal, and genome-wide testing lives at 5 sigma and beyond.

Q: How many loci does it take for a simulated additive trait on real genotypes to stop failing a normality test, and what does that demonstrate?
A: About 50. Giving real chr22 genotypes random additive effects, one locus gives three discrete classes with Shapiro p = 1 x 10^-25, and by 50 loci the test has nothing left to reject (p = 0.23). Nobody had to assume a normal trait: it falls out of adding up small independent contributions, which is what a polygenic architecture is. It does not justify normality for multiplicative traits, where the logarithm is normal instead.

Q: Why does a Hardy-Weinberg test have 1 degree of freedom rather than 2, and what does the wrong choice cost?
A: df = (cells - 1) - (parameters estimated from these same data) = 3 - 1 - 1 = 1, because p-hat was computed from the very genotypes being tested. A chi-square's mean equals its df, and the observed mean over 1,784 common chr22 SNPs was 1.077. Using df = 2 gives 2.9% of SNPs below p = 0.05 against 8.1% -- visibly conservative, so real genotyping failures go unnoticed.

Q: Why is overdispersion invisible at low counts and dominant at high ones?
A: Because the negative binomial's variance is mu + alpha x mu^2: Poisson noise scales with mu while biological variation scales with mu^2. In real yeast replicates the VMR rose from 0.85 at counts near 10 to 209 at counts in the thousands, while the dispersion alpha stayed roughly constant between 0.013 and 0.05 -- which is the sense in which the negative binomial is the right two-parameter family, and why a gene must never be flagged as noisy on VMR alone.

Q: Three replicates of the same yeast strain gave 12,528, 8,756 and 9,724 counts for TDH3. What do Poisson and the negative binomial say, and what follows?
A: Poisson puts P(X >= 12,528) at 7 x 10^-97; the negative binomial fitted to the same three numbers calls it 0.13, ordinary. Fitting Poisson to biological replicates makes every highly expressed gene overwhelmingly significant, because you have modelled away the only source of variation that matters -- the p-values are not slightly optimistic, they are meaningless. That is why DESeq2 and edgeR exist and why nearly all their sophistication goes into estimating alpha rather than mu.

## Sampling, estimation, and what more data cannot fix

Q: What is the difference between a standard deviation and a standard error, and how does each behave as n grows?
A: SD describes the data -- how spread out individuals are -- and estimates a population property that does not shrink with more data. SE describes an estimate -- how much p-hat would move if you repeated the study -- and shrinks as 1/sqrt(n). On the chr22 EUR genotypes the SD stayed flat at 0.70 from n = 10 to n = 1,000 while the SE of p-hat fell from 0.111 to 0.011.

Q: Expected heterozygosity computed from estimated frequencies is biased. In which direction, by how much, and what is the fix?
A: Too small, because sampling variance in p-hat inflates the sum of p-hat squared -- the bias is about -H/(2n), a 10% understatement of diversity at n = 5. Nei's 1978 correction multiplies by 2n/(2n-1) and removes it. Without the correction, comparing two species sampled at different sizes makes the smaller-sampled one look less diverse as a pure artefact of arithmetic.

Q: Why is an unbiased estimator not automatically the right one to use?
A: Because MSE = bias^2 + variance, and accepting some bias to buy a larger reduction in variance lowers total error. Dividing a sum of squares by n+1 is visibly biased and closer to the truth on average than the unbiased n-1 divisor at n = 5, 10 and 30. That trade is the design principle behind ridge regression, shrinkage in polygenic scores, empirical-Bayes dispersion shrinkage in RNA-seq, and the pseudocounts in every position weight matrix.

Q: What does "95% confidence" actually claim, and what does it not?
A: That the procedure, applied to repeated samples from this population, would produce intervals containing the true value 95% of the time. It does not say your particular interval has a 95% chance of containing the truth: in the worked simulation interval #12 was [0.4423, 0.6377] and the true p was 0.4205, so it contains the truth with probability zero. The probability statement about the parameter needs a prior and is a Bayesian credible interval.

Q: At MAF 0.5% with 50 people the nominal 95% Wald interval covers the truth 39% of the time. Why, and what should you use instead?
A: Because p-hat is often exactly 0, and then the standard error is computed as 0 too, producing the interval [0, 0]. It is not slightly optimistic; it is broken. The Wilson score interval holds at 91% in the same cell and is essentially correct everywhere else, so use Wilson -- or Clopper-Pearson if you need guaranteed conservatism -- for any proportion that might be small.

Q: What is the single substitution the bootstrap makes, and why can it be more honest than a formula?
A: You cannot resample from the population, but your sample is your best picture of it, so you resample from the sample with replacement and watch the statistic move. On 60 chr22 genotypes the bootstrap SE was 0.0416 against a formula SE of 0.0440, and the gap is informative rather than noise: the formula assumes Hardy-Weinberg while the bootstrap over individuals uses the genotype distribution actually observed.

Q: Why is the choice of resampling unit the whole design decision in a bootstrap?
A: Because whatever you resample is what your interval is about. For F_ST(AFR, EUR) = 0.0648, resampling SNPs answers "what if I had genotyped a different part of the genome" and gives SE 0.0015; resampling individuals answers "what if I had recruited different people" and gives 0.0023; resampling both gives 0.0028, with the variances adding as they should. Picking the wrong unit silently answers a question nobody asked.

Q: The per-SNP F_ST bootstrap understated its standard error 3.5-fold. What went wrong, and what changed once it was fixed?
A: The plain bootstrap assumes exchangeable units, and 3,564 SNPs spanning one megabase are correlated by linkage disequilibrium, so resampling them one at a time pretends you have more independent information than you do. A block bootstrap raised the SE from 0.0015 to 0.0052 before plateauing once blocks exceeded the LD scale -- and once corrected, marker-choice uncertainty exceeded recruit-different-people uncertainty, reversing the earlier reading.

Q: An assay miscalls 5% of true heterozygotes as homozygous reference. What happens to the confidence interval as n grows from 100 to 100,000?
A: The bias stays fixed at about -0.012 and never moves, while the interval width falls by a factor of 30, so coverage of the true value collapses from 92% to 0.000. At n = 100,000 the study is guaranteed to report a confidently wrong answer with a tight interval. Sample size cures variance and never cures bias -- more data did not help, more data did the damage.

Q: Why does precision on a rare allele frequency depend on the expected count rather than the sample size?
A: Because for a rare allele the relative standard error is about 1/sqrt(expected number of copies): 50,000 samples is one expected copy at f = 10^-5. Observing one copy in 1,000 chromosomes leaves a 95% interval from 0.00018 to 0.0056, a thirty-fold range; and seeing zero copies in m chromosomes gives a 95% upper bound of roughly 3/m -- the rule of three -- which is why "allele frequency is 0 in gnomAD" is weak evidence unless the database is very large.

Q: Why do MAF filters such as `--maf 0.01` exist?
A: Below that threshold the frequency estimate has relative error near 1, the normal approximation fails, the Hardy-Weinberg chi-square becomes anti-conservative by orders of magnitude, and single-variant association tests have essentially no power. The filter is an admission that these variants must be analysed in aggregate -- burden tests, SKAT -- rather than one at a time. In the unfiltered chr22 file 84% of variants have MAF below 1% and 41% are seen exactly once even with 5,096 chromosomes.

## Significance testing, power and the forking paths

Q: Name the four components of a significance test and say which one carries the modelling risk.
A: A null hypothesis specific enough to generate data; a test statistic chosen so that large values mean "unlike what the null produces"; the distribution of that statistic if the null were true; and the p-value, the fraction of that null distribution at least as extreme as what you saw. The expected counts carry all the risk, because they encode the genetic hypothesis -- the machinery will happily return a p-value for a null nobody believes.

Q: A p-value is a property of what, and in which direction does it reason?
A: It is a property of the null hypothesis, not of yours: it answers "how often would data like mine arise if nothing were going on", and never "given my data, what is going on". Getting from the first to the second requires a prior. Small p means only that the null makes your data look weird.

Q: Quantify the error in reading p = 0.05 as "a 5% chance the null is true", using the HWE-filtering example.
A: Reversing the conditional needs a base rate. Filtering a million variants where 1% are genuinely broken at F = 0.15 with N = 2,000: at alpha = 0.05 you get 10,000 true positives and 49,500 false ones, so 83% of the variants you would throw away are fine. At alpha = 10^-6 the flagged set is essentially pure while still catching 96.5% of the broken variants -- which is exactly why the HWE filter sits at 10^-6 rather than 0.05.

Q: How does simulation settle the degrees of freedom when a parameter was estimated from the same data?
A: Simulate 200,000 populations that genuinely are in Hardy-Weinberg and compute the statistic both ways: mean chi-square is 1.004 when p is re-estimated from each dataset and 2.001 when p is handed over in advance, and a chi-square's mean equals its df. Estimating one parameter costs exactly one degree of freedom -- and the exercise shows you can always build a null distribution by brute force when no textbook one exists.

Q: Why is a conservative test not the safe choice?
A: It is safe against Type I error and reckless against Type II. Using df = 2 for a Hardy-Weinberg test cuts the false-positive rate to 1.4% instead of 5%, which sounds cautious, but it throws away most of the power and you will never see the real departures you missed. For a QC filter whose job is detecting genotyping failure, hiding real problems is the failure that matters.

Q: A test returns p = 0.36 on 91 samples and the author writes "the population is in Hardy-Weinberg equilibrium". What should be reported instead?
A: The effect size and its interval. At N = 91 the test has 7.6% power against F = 0.05 and needs F about 0.29 -- larger than the deficit from mating full sibs -- to be caught 80% of the time, so the non-significant result excludes nothing of biological interest. "F-hat = +0.041, 95% CI [-0.048, +0.127]" states what the data rule out; a confidence interval contains the test and adds the magnitude the test omits.

Q: What is the exchange rate between a tighter alpha and power?
A: Brutal. The same study with the same real departure -- N = 1,000, F = 0.10 -- has power 0.885 at alpha = 0.05, 0.449 at 10^-3 and 0.011 at 5 x 10^-8. And because sample size scales as 1/effect^2, halving the effect you want to detect quadruples the study, which is the whole trajectory from candidate-gene studies of 200 people to biobanks of 500,000.

Q: Why is the histogram of p-values from a genome-wide scan a diagnostic instrument?
A: Because under a true null p-values are uniform on [0,1], so any departure from flat is information. Pooling all 26 populations rejects HWE for 64.4% of common chr22 SNPs with median F = +0.059 -- the Wahlund effect, not broken genotyping. Within GBR alone only 2.4% fall below 0.05 and 31% pile up between 0.4 and 0.6: a histogram that sags at the small-p end and bulges in the middle says something upstream regularised your data, here haplotype-based refinement of low-coverage calls.

Q: When does the Hardy-Weinberg chi-square stop being trustworthy, and by how much?
A: Below about MAF 0.5%, where the minor-homozygote expected count is tiny and the asymptotic approximation fails. On 2,548 samples the chi-square flagged 292 variants at p < 10^-6 in that MAF band where the exact test flagged one -- a 292-fold over-rejection, all in the anti-conservative direction and all of it good rare variants. At common frequencies the two agree, 824 against 793. Use `plink2 --hardy` when the minor allele is rare.

Q: In 500 null scans of 3,564 chr22 SNPs, the mean hit count matched theory exactly but its standard deviation was 82.5 rather than 13.0. What does that show?
A: That expectation survives dependence and variance does not. The mean was 177.8 against a predicted 178.2, but these SNPs sit within 1 Mb in strong linkage disequilibrium, so they are nowhere near the 3,564 independent tests the binomial standard deviation assumes. It also shows the typical best p-value in a null scan is 6 x 10^-4 -- a number that would look publishable on its own.

Q: Why does "the effective m is the number of analyses you could have run" matter even if you report every test?
A: Because each defensible choice made after seeing data multiplies the error rate. On the same coin-flip phenotype and real genotypes, additive coding alone gives a 4.9% type-I rate at alpha = 0.05; best of three genetic codings gives 9.0%, best of five populations 17.8%, and best of all fifteen 26.8%. Nobody lied or ran a test they did not believe in. The defences are pre-registration, an explicit analysis plan, correcting for every path you could have taken, and -- the only one that always works -- replication in data you had not seen.

## Variance, covariance and regression

Q: Why is genetics written in variances rather than standard deviations or mean absolute deviations?
A: Because variances of independent contributions add and nothing else does, which is what lets a phenotype be written as a sum of components and its variance partitioned among them. Heritability is a fraction of a variance because variance is the only spread measure that can be divided into shares. Two independent contributions each with SD 3 give a sum with variance 18 and SD 4.24, not 6.

Q: For a 200-SNP unweighted score on 2,503 real people, how much of the variance is the covariance cross term?
A: 71%. The variance of the sum was 132.62 against a sum of single-locus variances of only 38.56, the difference being 2 x the sum of all covariances = 94.06; shuffling each column independently makes it vanish. The covariance comes from linkage disequilibrium plus five continental groups with different allele frequencies. Every V_A = sum of 2 p_i q_i alpha_i^2 formula carries the clause "assuming linkage equilibrium", and this is the number that clause hides.

Q: Give a real genomic case with total dependence and exactly zero correlation.
A: At the chr22 SNP whose allele frequency is exactly 0.5, corr(dosage, being heterozygous) is exactly 0.000000 with a p-value of exactly 1, while eta^2 = 1.0000 -- heterozygosity is a deterministic function of dosage. The relationship is a perfect inverted V and a straight line through an inverted V has slope zero. Zero correlation means no linear trend, not independence and not "no relationship".

Q: Why is R^2 in a simple regression exactly the squared correlation?
A: Because least squares makes residuals orthogonal to fitted values, so the cross term vanishes and the total sum of squares splits cleanly into explained plus residual. Substituting the fitted deviation b1(x - xbar) with b1 = Cov(x,y)/Var(x) collapses explained/total to Cov(x,y)^2/(Var x times Var y) = r^2. "Proportion of variance explained" is therefore the correct reading of both.

Q: Regressing observed heterozygote frequency on the expectation 2pq gives a pooled slope of 0.9587. What does 1 - slope estimate, and why?
A: F_ST, here 0.041 across the five continental groups. Observed heterozygosity sits 4.13% below Hardy-Weinberg expectation at every frequency, and because the shortfall is proportional rather than additive, 1 - slope reads it off directly. Splitting by super-population removes four of the five deficits -- AFR 1.0024, EUR 1.0123, EAS 1.0315, AMR 1.0086 -- so most of the pooled shortfall is mixing rather than inbreeding. The slope cannot say whether a residual deficit is structure or consanguinity, because both have the same algebraic form.

Q: Is regression to the mean a biological force pulling offspring toward average?
A: No -- it is a property of imperfect correlation and runs equally strongly in both directions in time. In simulation, families whose midparents averaged +2.39 SD had children averaging +1.30 SD, and children who were themselves +2 SD had midparents averaging +1.30 SD. No force can pull parents toward their children's mean retrospectively. Conditioning on an extreme value selects partly for true extremity and partly for lucky noise, and the noise does not transmit.

Q: Why is the offspring-midparent regression slope exactly h^2, with no scaling constant?
A: Because under random mating Var(midparent) = V_P/2 and Cov(offspring, midparent) = V_A/2, so the slope is V_A/V_P = h^2. Regressing on a single parent doubles the predictor variance while leaving the covariance unchanged, so that slope is h^2/2 and must be doubled. Galton's two-thirds in 1886 was an estimate of h^2 for human height before anyone knew what a gene was -- the technique is named after a genetics result.

## Confounding, adjustment and causal reading

Q: In a multiple regression, what exactly is the coefficient b1 the slope of?
A: The slope of y on the part of x that the other covariates cannot explain -- not a metaphor but the Frisch-Waugh-Lovell theorem. Residualise x on z, residualise y on z, regress one set of residuals on the other, and you recover b1 exactly; on real chr22 data the residual-on-residual slope matched the multiple-regression coefficient to six decimal places. A covariate uncorrelated with the predictor does not move b1 at all.

Q: Does adjusting for ten ancestry principal components remove population stratification?
A: It removes only the component of the confounder that the covariates measure. On a phenotype driven purely by ancestry, the naive coefficient was -0.3171 with p = 5 x 10^-32; PC1 alone recovered little of the bias (-0.2903), ten PCs recovered most (-0.0793), and the true ancestry label recovered all of it (-0.0411, p = 0.17). In a real study you never have the true label, and what survives ten PCs is the residual stratification that LD-score regression and within-family designs exist to catch.

Q: When does an odds ratio approximate a risk ratio, and what happens when it does not?
A: Only when the outcome is rare in both exposure groups. In the chr22 example the risk ratio was 1.98 and the odds ratio 4.27, because the outcome ran 35-70%. At 40% prevalence an OR of 1.30 corresponds to a risk ratio of 1.16; at 0.4% prevalence it corresponds to 1.299. A case/control study also cannot estimate absolute risk without an external prevalence, since the case:control ratio was chosen by the investigator -- which is exactly why it reports an odds ratio.

Q: How do you tell a confounder from a collider, and what does conditioning on each do?
A: By which side of the variables it sits on: a confounder is upstream of both, a collider downstream of both. Adjust for the first; never condition on the second, because conditioning on a collider -- by adjusting for it or simply by only recruiting people who have it -- manufactures an association where no causal path and no confounder exists. Biobank participation is heritable, case/control ascertainment conditions on diagnosis, and adjusting for a heritable covariate or a mediator is the same error committed deliberately.

Q: If x and y are associated and x does not cause y, what are the four possible explanations, and which one is structurally impossible in genetics?
A: Chance, confounding, reverse causation, and selection or collider bias -- at least one of them, not exactly one, since an association can be part noise and part confounding at once. Reverse causation is structurally impossible for a germline genotype, because your BMI cannot have changed the allele you inherited, and that single asymmetry is the entire basis of Mendelian randomisation.

## Likelihood and the evidence ratio

Q: What is the difference between a probability distribution and a likelihood function, given they share a formula?
A: Fix the parameter and vary the data and you have a probability distribution, which sums to 1 over possible datasets. Fix the data at what you observed and vary the parameter and you have the likelihood. It does not integrate to 1 -- for a binomial the integral over p is exactly 1/(n+1) -- it is not a density, and it makes no claim about how probable any parameter value is.

Q: A colleague says "the likelihood that the allele frequency is 0.30 is 0.12". What could they legitimately have said?
A: A ratio, an estimate with an interval, or -- if they state a prior -- an actual posterior probability. The number 0.12 is P(data | p = 0.30), a probability of the data rather than of the parameter, and multiplying the whole likelihood function by any positive constant leaves the inference unchanged, so an absolute height has no meaning. On the real GBR count, L(0.89)/L(0.50) = 2.6 x 10^27 is a complete and interpretable statement.

Q: Why is everything in likelihood work done in logs?
A: Because likelihoods are products over reads, alignment columns, pedigree members or samples, and products of small numbers destroy floating point. IQ-TREE's fit to a 17,421-column mitochondrial alignment has likelihood about 10^-27582 while float64 dies below 10^-324, so direct multiplication underflows to exactly zero after roughly 200 columns. Logs turn products into sums, and log-likelihoods from independent datasets add -- which is what let separate laboratories sum each other's LOD tables.

Q: Is the maximum likelihood estimator unbiased?
A: Not in general. It is consistent, asymptotically efficient, and invariant to reparameterisation -- the MLE of d^2 is the square of the MLE of d, which is emphatically not true of unbiased estimators -- but it is routinely biased in small samples. The MLE of a variance divides by n rather than n-1, which is precisely the correction that Bessel's n-1 makes.

Q: Define the LOD score, and say why the threshold is 3.0 rather than something derived from a p-value.
A: Z(theta) = log10[L(theta)/L(0.5)], comparing the probability of the observed inheritance pattern under linkage at recombination fraction theta against free assortment. The threshold of 3.0 is a Bayesian calculation done once, in 1955, and then hard-coded: two loci drawn at random from the genome have prior odds around 1:50 against linkage, so a 1,000:1 likelihood ratio buys only 20:1 posterior odds and roughly 5% false positives. "LOD 3 means p < 0.001" is wrong.

Q: State Wilks' theorem and its two standard failure modes.
A: If H0 is H1 with r parameters fixed, then under H0 the statistic 2 ln LR is asymptotically chi-square on r df. It requires nesting -- JC69 inside K80 inside GTR qualifies, comparing model classes that do not nest does not, and then you need AIC or BIC. And the chi-square is wrong on a boundary: testing whether a variance component is zero puts the null on the edge of the parameter space, where the reference is a 50:50 mixture of chi-square with 0 and 1 df, so halve the p-value.

## Priors, posteriors and model choice

Q: Do priors wash out with enough data?
A: They get diluted at a knowable rate rather than vanishing. A Beta(2,6) prior -- worth eight pseudo-observations -- still moves the posterior mean to 0.8632 against an MLE of 0.8901 after 182 real chromosomes, a shift of 0.027. At n = 2 the same prior is what rescues a degenerate MLE of 1.0 down to a posterior mean of 0.50. "How much does my prior still matter" is a computation, not a reassurance.

Q: A credible interval and a confidence interval are numerically identical here. What is the difference, and where does it bite?
A: A confidence interval is built from the sampling distribution of the estimator, treats theta as fixed and unknown, and its 95% describes the procedure over hypothetical repeats. A credible interval is built from the posterior, treats theta as a random variable, and licenses "there is a 95% probability the parameter lies here" -- but only because a prior made that legitimate. At k = 162/182 all methods agree to two decimals; at k = 1/182 the Wald interval contains negative allele frequencies, which is the regime rare-variant genomics lives in.

Q: Two real E. coli sites both have depth 8 and 2 non-reference reads. Why do they get opposite genotype calls?
A: Because the likelihood reads the base quality strings and an allele-fraction threshold cannot. At one site the alternate reads carry Q41 and Q30 -- error probabilities 8 x 10^-5 and 10^-3 -- giving P(het | data) = 0.998; at the other they carry Q2 twice, error probability 0.63 each, giving P(hom-ref | data) = 0.99997. Identical depth, identical allele fraction, opposite calls: that is the entire argument for probabilistic variant calling, in eight reads.

Q: In what sense is the ACMG variant-classification framework a naive Bayes classifier, and what is its core weakness?
A: Each evidence code contributes an OddsPath -- P(evidence | pathogenic)/P(evidence | benign) -- and the strength tiers form a geometric ladder (Supporting 1, Moderate 2, Strong 4, Very Strong 8), so evidence becomes additive in points. From a 0.10 prior, 6 points gives posterior 0.8999, essentially the "Likely pathogenic >= 0.90" boundary, and -7 points gives 0.0007, under the "Benign < 0.001" line. The weakness is that multiplying likelihood ratios assumes the evidence items are conditionally independent, and predictor scores, missense constraint and paralogue conservation are anything but.

Q: AIC and BIC pick different substitution models on the same alignment. Why, and which is wrong?
A: Neither. AIC = 2k - 2 lnL penalises each parameter a flat 2 and targets predictive accuracy; BIC = k ln n - 2 lnL penalises ln n, approximates a log marginal likelihood, and so prefers smaller models increasingly as data grow. On the real 17,421-column mitochondrial alignment GTR+F+R2 buys 8.088 log-likelihood units for 2 extra parameters: delta AIC = -12.176 picks GTR, delta BIC = +3.355 picks TIM2, and the LRT (16.176 on 2 df, p = 3 x 10^-4) sides with AIC. Report which criterion you used.

Q: A profile-likelihood interval and a credible interval for the human-chimp mitochondrial distance agree to four decimals, yet IQ-TREE reports a value outside both. What is the lesson?
A: That model misspecification moves the point estimate further than sampling error moves the interval. Both intervals, [0.0891, 0.0995] and [0.0892, 0.0996], are conditional on K80 being true; IQ-TREE's TIM2+F+R2 adds unequal base composition and among-site rate heterogeneity, both of which increase the estimated number of hidden substitutions, and gives 0.1041. The interval quantifies the noise and says nothing whatever about the model.

## Many tests: thresholds, FDR and inflation

Q: What different guarantees do family-wise error control and false-discovery control make, and when do you want each?
A: FWER controls P(at least one false positive anywhere) -- at 5%, one wrong finding in twenty studies. FDR controls the expected fraction of your rejections that are false -- at 5%, one wrong finding in twenty discoveries. Neither is more correct: use FWER when a single false claim is expensive, as for GWAS hits or clinical variants, and FDR when you are generating a screening list of DE genes or QTLs.

Q: Why does Bonferroni remain valid on correlated genotypes, and what does the correlation cost you instead?
A: It rests on Boole's inequality -- the probability of a union is at most the sum of the probabilities -- which holds under any dependence, so it assumes nothing about independence. Dependence makes it conservative rather than invalid: two SNPs in perfect LD are one test and Bonferroni charges for two. Sidak's exact-under-independence threshold is only about 2.6% larger, so the approximation is negligible beside what dependence costs.

Q: Derive 5 x 10^-8, and say what quantity it is actually pricing.
A: It is 0.05 divided by M_eff of about 10^6, the number of effectively independent tests in the common-variant space of European-ancestry LD, estimated by permutation and by simulation under the observed LD; two-sided that is |Z| > 5.4513. It prices the genome's independent information content rather than the number of rows in your file, and it sits just above the largest excursion noise typically produces -- the expected maximum |Z| among 10^6 null tests is about 4.97.

Q: The same 1,146 chr22 variants are worth 160 independent tests in Europeans and 235 in Africans. What follows, and how far should the numbers be trusted?
A: Longer haplotype blocks mean more redundancy and fewer real questions asked, so a fixed 5 x 10^-8 is anti-conservative precisely for African-ancestry studies, while WGS proposals cluster at 5 x 10^-9 to 10^-8 and founder populations can relax it. Read the absolute values as estimates rather than measurements: with n = 503 samples and M = 1,146 markers the correlation matrix has rank at most 502, so only the 1.47x comparison -- sample size and marker set held fixed -- survives that caveat.

Q: State the Benjamini-Hochberg rule, and say what "FDR 5%" does not mean.
A: Sort the p-values ascending, find the largest k with p_(k) <= k q / m, and reject everything up to it. It controls a proportion, not a probability: FDR 5% does not mean each finding has a 5% chance of being wrong, it means the expected share of wrong ones across the whole list is 5%. The marginal members are far more likely to be false than the top ones, so a single gene picked out of the list carries no individual 95% guarantee.

Q: Why can the genomic inflation factor lambda not tell you whether a study is confounded?
A: Because for a polygenic trait most of the genome carries a small true signal, so the median chi-square is legitimately above the null and lambda grows without bound as a perfectly clean study gets bigger -- applying genomic control then deletes real discoveries. LD-score regression separates the two because confounding inflates every statistic equally while polygenic signal inflates a variant in proportion to how much it tags, so the regression intercept estimates the inflation that does not track LD.

Q: A QQ plot leaves the diagonal. When is that a problem?
A: Departure in the tail is what real associations look like. Departure at the median means either confounding or genuine polygenicity, and lambda alone cannot separate them -- only the LD-score intercept can. In the lab-08 scan the verdict is unambiguous only because the phenotype was assigned without consulting a single genotype: lambda = 18.07 with median p = 0.0041 can only be model failure there, and ten PCs restore lambda to 1.142 and the median p to 0.4711.

Q: Bonferroni kept 1,138 variants and BH kept 2,130 on a scan where the correct answer was zero associations. What does that establish about multiple-testing correction?
A: That correction controls noise and cannot repair a wrong model. Both procedures assumed the p-values were valid under the null, and they were not: the null model omitted ancestry, so the test measured a real association between genotype and a phenotype that ancestry causes. Adding ten principal components takes the count to zero and the smallest p-value in the whole scan to 2.1 x 10^-3.

## Structure, shrinkage and dependence in high dimensions

Q: Is PC1 the ancestry axis?
A: Not necessarily. PC1 is the axis of largest variance, which on unpruned data can be a single LD block or an inversion. On this unpruned megabase PC2 carries most of the ancestry signal -- between-population R^2 of 0.65 against 0.23 for PC1 -- and PC1 draws 36% of its squared loadings from one 100 kb window holding 9% of the SNPs. That is why you LD-prune before PCA and mask long-range LD regions such as the 17q21 MAPT inversion, the HLA and LCT.

Q: Clusters on a UMAP or t-SNE plot are evidence of what, exactly?
A: Only that distinct groups exist. The width of a gap, the size of a blob and the ordering of between-cluster distances are evidence of nothing, because these methods optimise local neighbourhood preservation and are under no constraint to preserve global geometry. Changing t-SNE's random seed moved the fidelity of between-population distances from Spearman 0.58 to 0.84, and lab-09's UMAP correlated with the PC-space distances it was built from at only 0.289. Quantify in the space you analysed and use the embedding to look.

Q: What happens to ordinary least squares when predictors outnumber samples?
A: The design matrix has a null space, so infinitely many coefficient vectors fit the training data exactly and all of them fit noise -- a training R^2 of 1.0 carries no information whatever. On 300 training individuals and 3,564 SNPs, OLS scored train R^2 = 1.000 and test R^2 = -0.108, worse than predicting the mean, while ridge scored +0.287 and lasso +0.330 against a ceiling of 0.506.

Q: In what sense is a shrinkage penalty an assumption rather than a technicality?
A: Both ridge and lasso are posterior modes under a prior: ridge's L2 penalty is a Gaussian prior on the effects and suits a dense architecture where everything matters a little, lasso's L1 penalty is a Laplace prior and suits a sparse one. Which is right is an empirical question about genetic architecture, and the polygenic-score literature is four priors on one estimator -- genome-wide ridge, LDpred's point-normal, lassosum's L1, and PRS-CS's heavy-tailed continuous shrinkage.

Q: How large is the winner's curse, and what does it depend on?
A: Entirely on power, not on the trait. Over 200 discovery/replication splits of real chr22 genotypes, discovery effects averaged 1.22x too large at h^2 = 0.10 and 1.07x at h^2 = 0.50, falling monotonically in between -- and because variance explained goes as the square of the effect, the bias on R^2 is squared, 1.22^2 = 1.49. At h^2 = 0.10 a single split's ratio ran anywhere from 0.83 to 1.85, which is exactly why one split's number must not be quoted.

Q: A pooled-Poisson test called 1,447 differentially expressed genes where DESeq2 called 274, both at BH 5%. What does that show about the division of labour between model and correction?
A: That no multiple-testing procedure can rescue a wrong likelihood. BH was applied to both lists, so the 5.3x excess is entirely an artefact of assuming away biological variation between replicates; the p-values themselves were wrong before any correction was applied. With three replicates there are about 2 degrees of freedom per gene, so DESeq2 and edgeR fit a mean-dispersion trend across all genes and shrink each gene's estimate toward it.

Q: What does a linear mixed model give you that k principal components as covariates do not?
A: The whole relatedness spectrum instead of the top of it. The random effect's covariance is the same GRM K whose leading eigenvectors are the PCs, so k PCs handle continental ancestry while K additionally carries sibships and cousinships spread thinly across thousands of small eigenvalues -- one model for population structure and cryptic relatedness at once. The costs are an O(n^3) likelihood per variant, which BOLT-LMM, fastGWA and REGENIE exist to avoid, and proximal contamination, where a variant inside K partly absorbs its own effect, fixed by building K from the other chromosomes.
