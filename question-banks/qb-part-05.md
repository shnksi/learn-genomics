# Question bank — Part 05: Population genetics

Covers [Ch 26-29](../part-05-population-genetics/26-hardy-weinberg.md).

Convert to Anki: `python reference/to_anki.py question-banks/ --out anki-import.tsv`

## Hardy-Weinberg: what the null actually claims

Q: Why can allele frequencies always be computed from genotype counts, while the reverse direction needs an assumption?
A: p = P_AA + half of P_Aa is an identity, a change of coordinates that holds under selection, inbreeding, migration, structure and any mating system whatsoever. The reverse recovers two numbers from one, so the missing degree of freedom has to be supplied by a model -- and Hardy-Weinberg is that model.

Q: How many generations of random mating does it take to reach Hardy-Weinberg proportions, and why?
A: One generation on an autosome, from any starting genotype frequencies at all. The mating-table derivation begins with arbitrary parental genotype frequencies and yields p^2, 2pq, q^2 in the offspring, so random mating plus fair Mendelian segregation is the entire input. Two generations if the sexes start with different allele frequencies; on the X, never exactly.

Q: Why does a population fitting Hardy-Weinberg proportions tell you almost nothing about whether it mates at random?
A: Proportions are restored by one generation of random mating from any history whatsoever, so even a perfect fit constrains only the most recent generation -- a population that inbred for centuries and then mated at random once fits exactly. The power is also negligible at ordinary sample sizes: at N = 200 you have about 11% power against F = 0.05, and even N = 1,000 reaches only about 35%.

Q: Does genetic drift cause departures from Hardy-Weinberg proportions?
A: No. Drift changes p between generations, but conditional on p the expected genotype proportions are still p^2, 2pq, q^2. Finite size does not bias them; strictly, in a finite two-sex population where self-fertilisation is impossible there is a heterozygote excess of order 1/N, negligible above a few dozen individuals and in the opposite direction to what people expect.

Q: Why is comparing observed to expected heterozygosity the same operation as estimating F?
A: With k alleles, squaring the allele-frequency vector gives expected heterozygosity H_e = 1 - sum of p_i^2, which is just the Hardy-Weinberg heterozygote total. So F = 1 - H_o/H_e is precisely the standardised gap between the observed heterozygote count and the Hardy-Weinberg prediction.

Q: State the five Hardy-Weinberg assumptions and the derivation step each one licenses.
A: Random mating licenses independence of the two gamete draws; no selection licenses census genotype frequencies equalling those at zygote formation; no mutation licenses the gamete-pool frequency equalling the parental one; no migration licenses the gamete pool being this population's own; infinite size licenses realised offspring equalling their expectations. Random mating is the only one whose failure is routinely large enough to see.

## The X chromosome and rare-recessive arithmetic

Q: How does an X-linked allele frequency behave when the two sexes start out different?
A: The recursions are p_m(t+1) = p_f(t) and p_f(t+1) = half of [p_f(t) + p_m(t)], so the sex difference d = p_f - p_m obeys d(t) = (-1/2)^t d(0). It halves and flips sign every generation: the X approaches equilibrium by damped oscillation and never attains it in finite time.

Q: What is the conserved allele frequency on the X, and why is it a weighted mean?
A: p_bar = two-thirds p_f + one-third p_m, because females carry two thirds of all X chromosomes. Random mating cannot move allele frequencies, so p_bar is invariant and is the value the male and female frequencies oscillate about.

Q: Why is an X-linked recessive phenotype so much commoner in males, and how does the ratio depend on q?
A: Males are hemizygous, so the phenotype frequency is q in males and q^2 in females, giving a male:female ratio of 1/q that blows up as the allele gets rarer. Red-green colour vision deficiency at q about 0.08 gives about 13:1; haemophilia A at q about 2 x 10^-4 gives about 5,000:1. It is a Hardy-Weinberg consequence of hemizygosity, not a fact about severity or dominance.

Q: An autosomal recessive disease has an incidence of 1 in 2,500. Compute the allele and carrier frequencies.
A: Affected individuals are aa, so q^2 = 1/2500 = 4.0 x 10^-4, giving q = 0.02 and p = 0.98. The carrier frequency is the heterozygote class, 2pq = 2 x 0.98 x 0.02 = 0.0392, about 1 in 25.

Q: When is the "carrier frequency is about 2q" shortcut acceptable?
A: 2q overstates the true 2pq by a factor 1/(1 - q), i.e. by about q in relative terms. At q = 0.02 that is a 2% overstatement, invisible against the uncertainty in the incidence estimate; at q = 0.1 it is 11% and at q = 0.3 it is 43%. Use it freely for rare recessives and never for common variants.

Q: A recessive disease is rare, so are its carriers rare too?
A: No. Carriers outnumber affected individuals by 2p/q, which is about 2/q, so the rarer the disease the more lopsided the ratio. At a cystic fibrosis allele frequency of q = 0.02 that is about 98 carriers per affected child, and a fraction p = 98% of all disease alleles sit in unaffected heterozygotes -- which is why carrier screening rather than case-finding is the only effective public-health lever.

## Testing Hardy-Weinberg, and using it as a QC filter

Q: How many degrees of freedom does a Hardy-Weinberg chi-square test have, and why is the obvious answer wrong?
A: One, not two. There are three genotype classes, minus one because frequencies sum to 1, minus one more because the allele frequency p was estimated from the very same genotypes. Using 2 df makes the test conservative and is the single most common error in applying it.

Q: What does the closed form chi-square = N x F_hat^2 reveal about the Hardy-Weinberg test?
A: Writing D = P_AA - p_hat^2, the other two cells are forced, and the statistic collapses to N x F_hat^2 on 1 df with F_hat = D/(p_hat q_hat). So the test is a one-parameter test that F = 0, F_hat is the standardised heterozygote deficit, and the effective sample size is N individuals rather than 2N alleles.

Q: How large a sample does a Hardy-Weinberg test need, and what sets that requirement?
A: The non-centrality is lambda = N F^2, and 80% power at alpha = 0.05 on 1 df needs lambda about 7.85, so N is about 7.85/F^2. Offspring of full-sib matings (F = +0.25) need only 126 people, but a 5% rate of heterozygotes miscalled as homozygotes (F = +0.049) needs about 3,200.

Q: Will selection strong enough to matter show up as a Hardy-Weinberg departure?
A: Almost never. The extreme case, a fully lethal recessive, induces exactly F = -q -- a heterozygote excess equal to the allele's own frequency -- so at q = 0.01 that is F = -0.01 and about 78,500 genotyped people are needed to detect it. Selection and Hardy-Weinberg proportions are nearly orthogonal.

Q: A variant fails Hardy-Weinberg in a large cohort. Why is the sign of F_hat the most informative part of the result?
A: F_hat greater than 0, a heterozygote deficit, points to allele dropout under a probe or primer site, a null allele, a deletion polymorphism, population structure, or real inbreeding. F_hat less than 0, a heterozygote excess, points to two paralogues collapsed into one locus, a CNV or segmental duplication, sample contamination, or mismapped reads.

Q: In modern genomics, what does a Hardy-Weinberg failure usually mean?
A: A broken assay, not biology. Genuine biological forces induce F of order 10^-2 or smaller at realistic allele frequencies, and a few percent of miscalled heterozygotes induces F of comparable size -- but assay pathologies are ubiquitous while strong selection at a common variant is not.

Q: Why does the chi-square test have to be replaced by an exact test for rare variants?
A: Chi-square is an asymptotic approximation to a multinomial and fails when expected cell counts are tiny. At MAF 0.5% in N = 1,000 the expected minor-homozygote count is Nq^2 = 0.025, and a single observed minor homozygote dominates the statistic: chi-square gives p about 6 x 10^-10 where the exact answer is about 0.022, wrong by roughly eight orders of magnitude in the anti-conservative direction.

Q: State the practical rules for using Hardy-Weinberg as a genotyping QC filter.
A: Test in controls, not cases, because a genuinely associated variant should deviate among cases; test within an ancestry-homogeneous stratum, or you measure the Wahlund effect at every locus instead; use a very small threshold, conventionally around p less than 10^-6 rather than 0.05, since real structure at F about 0.01 clears 0.05 easily at large N; and use the exact test below MAF about 5%.

## Selection: dominance, speed, and rare recessives

Q: Define the selection coefficient s and the dominance coefficient h.
A: With relative fitnesses 1, 1 - hs and 1 - s for A1A1, A1A2 and A2A2, s is the fitness cost of the A2A2 homozygote and h is the fraction of that cost paid by the heterozygote. h = 0 is fully recessive, 1 fully dominant, one half additive, h less than 0 overdominant, h greater than 1 underdominant. Dominance is not a property of the allele -- it is a number describing where the heterozygote sits, and it is the hardest parameter here to measure.

Q: Write the general one-locus selection recursion and say what its structure implies.
A: delta q = -pq x s x [q + h(1 - 2q)] / w_bar, where w_bar = 1 - 2pq x hs - q^2 x s. The pq factor means selection needs variation to act on and stops entirely at q = 0 or q = 1; everything else in one-locus selection theory is a special case of this expression.

Q: In what sense is selection gradient ascent, and what does that immediately rule out?
A: Differentiating mean fitness gives delta q = (pq/2) x d(ln w_bar)/dq, so selection climbs log mean fitness with a step size proportional to the genetic variance available. Because w_bar increases monotonically at a single locus, selection cannot cross a fitness valley.

Q: Why is selection against a rare deleterious recessive so feeble?
A: With h = 0 the change is delta q = -p q^2 s / w_bar, which is order q^2 and collapses as q falls, because selection can only see the allele in homozygotes and homozygotes are q^2 of the population. At q = 0.01, 99% of all copies of the allele are hiding in heterozygotes, invisible to selection.

Q: How long does it take to halve the frequency of a fully recessive lethal, and what does that tell you?
A: With s = 1 and h = 0 the recursion becomes 1/q_t = 1/q_0 + t, so the reciprocal is linear in time: going from q = 0.01 to 0.005 takes 100 generations, roughly 2,500 years, of every affected individual leaving zero offspring, and the next halving takes 200 more. This is the quantitative refutation of any proposal to eliminate recessive disease alleles by discouraging reproduction.

Q: Why is selection against a dominant allele so much faster?
A: With h = 1 and q small, delta q is about -sq, so q decays geometrically by a fixed factor per generation regardless of how rare the allele is. Every carrier shows the phenotype so every copy is exposed, and a dominant lethal is gone in one generation.

Q: Why do dominant disease alleles nevertheless persist?
A: They sit at mutation-selection balance q_hat = mu/(hs) and are continually recreated by new mutation. Achondroplasia is dominant and strongly fitness-reducing yet still occurs at roughly 1 in 15,000 to 30,000 births, precisely because about 80% of cases are new mutations.

Q: Do mutation rates explain observed allele frequencies?
A: No. With equilibrium p_hat = nu/(mu + nu) the approach is geometric with half-life ln2/(mu + nu), which at a per-locus rate of mu + nu = 10^-5 is about 69,000 generations, roughly 1.9 million years at the pinned 27 years per generation. Mutation sets frequencies only in balance with selection or drift; alone it is the origin of alleles and nothing more.

Q: Give the mutation-selection balance frequencies for a recessive and for a dominant allele.
A: Balancing mu against s x q_hat x (q_hat + h) gives q_hat = sqrt(mu/s) when h = 0 and q_hat = mu/(hs) when h is much larger than q_hat. With mu = 10^-6 and s = 1 the recessive sits at 10^-3 and the dominant at 10^-6, a thousandfold difference: recessiveness is a hiding place, and the size of the hiding place is 1/sqrt(mu).

Q: Why is sqrt(mu/s) usually the wrong formula for a real human "recessive" disease allele?
A: It requires q_hat much greater than h, i.e. h below about 10^-3. Measured h for human loss-of-function and disease alleles is typically 0.05 to 0.2 -- genes behind autosomal recessive disease average about 0.2 -- roughly two orders of magnitude above that threshold, so the dominant formula mu/(hs) governs and the allele is far rarer than sqrt(mu/s) predicts. Mis-specified h is the usual culprit when such a calculation is off by an order of magnitude.

Q: Why does mutation-selection balance fail for cystic fibrosis?
A: At q about 0.02 with s about 1 before modern treatment, balance demands mu = s q^2 = 4 x 10^-4 per generation, about 400-fold higher than any plausible per-locus rate. The model is not imprecise here, it is refuted; the live alternatives are heterozygote advantage or drift and founder effects in a historically bottlenecked population.

Q: Derive the equilibrium under overdominance and say why it is stable.
A: With fitnesses 1 - s1, 1, 1 - s2, delta q = pq(s1 p - s2 q)/w_bar, which vanishes in the interior when s1 p = s2 q, giving q_hat = s1/(s1 + s2). Below q_hat the bracket is positive so q rises and above it the bracket is negative so q falls, so the point attracts. The worse homozygote's allele sits at the lower frequency.

Q: Work the sickle-cell equilibrium and state what it costs.
A: With w(AA) = 0.89, w(AS) = 1.00 and w(SS) = 0.20, s1 = 0.11 and s2 = 0.80, so q_hat = 0.11/0.91 = 0.1209 -- inside the observed 0.10 to 0.15 range in high-transmission regions. Mean fitness at equilibrium is 0.903, a genetic load of 9.7% paid every generation, with q_hat^2 = 1 in 68 newborns having sickle cell disease.

Q: Does selection maintain genetic variation?
A: Usually it removes it: both directional and purifying selection reduce diversity. Overdominance does maintain it but is expensive and fragile -- any mutation delivering the heterozygote's benefit without the homozygote's cost invades and destroys the polymorphism -- and well-documented single-locus overdominance in humans is close to a list of one.

Q: What is underdominance, and why do chromosomal rearrangements almost never spread?
A: Underdominance is the same algebra with the heterozygote worst than both homozygotes, giving an interior equilibrium that repels: whichever allele starts above the threshold fixes and the other is lost. A new inversion or translocation must therefore cross a fitness valley that selection cannot cross, so the only route across is drift -- which is why rearrangements fix in small or founder populations and essentially nowhere else.

## Drift, effective population size, and the Nes criterion

Q: Does genetic drift push allele frequencies toward loss, or toward 0.5?
A: Neither. Under Wright-Fisher sampling E[p'] = p and Var(p') = p(1-p)/(2N), so drift has zero mean and only a variance. It is dispersion: over replicate populations the mean frequency stays put while the distribution spreads until mass piles up against the absorbing boundaries at 0 and 1. Alleles are lost often because 0 is absorbing and most alleles start near it, not because drift aims there.

Q: If drift has no directional effect on p, why does heterozygosity decline predictably?
A: Two allele copies drawn from generation t+1 are copies of the same parental allele with probability 1/(2N), so H_(t+1) = (1 - 1/2N) H_t and H_t is about H_0 x exp(-t/2N). Variation is lost at a rate 1/(2N) per generation, and the timescale of drift is therefore 2N generations.

Q: What is the fixation probability of a neutral allele, and why does that give a molecular clock?
A: It equals the allele's current frequency, so a new neutral mutation at p = 1/(2N) fixes with probability 1/(2N). Per generation 2N x mu new neutral mutations arise, each fixing with probability 1/(2N), so the Ns cancel and neutral substitutions accumulate at rate mu independent of population size.

Q: State the |Ne x s| criterion and one consequence.
A: Kimura's fixation probability depends only on p and alpha = 4 Ne s, so Ne and s never appear separately. When |Ne x s| is much less than 1 an allele behaves as if neutral no matter what it does to the organism; when much greater than 1, drift is a rounding error. An allele with s = -10^-5 is effectively neutral in humans (Ne about 10^4) and efficiently purged in Drosophila (Ne about 10^6).

Q: Will a beneficial mutation spread?
A: Usually not. For strong selection Kimura's formula gives a fixation probability of about 2s for a new mutation, so a 1% advantage fixes about 2% of the time and is lost the other 98%. Selection changes the odds by a factor of roughly 4 Ne s over the neutral 1/(2N); it does not guarantee outcomes.

Q: Define effective population size, and give two reasons Ne falls below the census number.
A: Ne is the size of an ideal Wright-Fisher population that would experience the same rate of drift as the population in question. Unequal sex ratio gives Ne = 4 N_m N_f/(N_m + N_f), so 10 breeding males and 990 females drift like 39.6 individuals; and variance in reproductive success gives Ne about (4N - 2)/(V_k + 2), so harem or sweepstakes reproduction with V_k = 10 gives Ne about N/3.

Q: What are the three flavours of effective population size, and when do they agree?
A: Variance Ne matches Var(delta p) and equals pq/(2 x Var(delta p)); inbreeding Ne matches the rate of heterozygosity loss, 1/(2Ne) = -delta H/H; coalescent Ne matches the expected time to common ancestry, E[T_2] = 2Ne. They coincide only for an ideal constant-size population and diverge otherwise, which is a real source of confusion when comparing estimates across papers.

Q: Why is Ne the harmonic mean of population size over time rather than the arithmetic mean?
A: Heterozygosity multiplies across generations as the product of (1 - 1/2N_i), which is about exp(-sum of 1/(2N_i)), so the accumulated quantity is a sum of reciprocals and small values dominate. Sizes 1,000 / 1,000 / 10 / 1,000 / 1,000 have arithmetic mean 802 but Ne = 48: one crash generation sets the population's genetic memory.

Q: Human Ne is about 10^4 while the census population is about 8 x 10^9. Does that mean only 10,000 humans ever lived at once?
A: No. Ne here is a harmonic-mean-like summary of drift over hundreds of thousands of years dominated by small, structured, fluctuating populations, and harmonic means are insensitive to large values, so recent explosive growth contributes almost nothing. It is also inflated by ancient population structure, which lengthens coalescence times without any single population ever being large.

Q: What part of human variation does the equilibrium Ne of about 10^4 fail to describe, and what does that break downstream?
A: The recent explosion in census size has generated an enormous excess of very rare variants that an equilibrium Ne says nothing about: most human variation is young, rare and population-specific. That is precisely why rare-variant association is hard, since each variant appears in too few people to carry power, and it is one reason polygenic scores transfer poorly across populations.

Q: Why do bottlenecks destroy allelic richness faster than heterozygosity?
A: A crash to N = 10 for one generation costs only 1/(2N) = 5% of heterozygosity, but an allele at q = 0.01 is lost entirely with probability (1 - 0.01)^20 = 82%. Rare alleles carry almost no heterozygosity yet are the overwhelming majority of alleles, so recent bottlenecks are detected as an excess of heterozygosity relative to the number of alleles observed.

Q: What does a founder effect do that an ordinary bottleneck's loss of variation does not?
A: It shifts frequencies permanently. A variant that was rare in the source population can be common among the founders by chance and then rides the new population's growth up. This is the documented origin of the Finnish disease heritage, of the Ashkenazi BRCA1 and Tay-Sachs founder alleles, and of Ellis-van Creveld syndrome among the Old Order Amish -- and it is one of the two live explanations, alongside heterozygote advantage, for the cystic fibrosis frequency that mutation-selection balance cannot produce.

## Inbreeding, F, and runs of homozygosity

Q: What is the difference between identity by state and identity by descent, and why does the distinction matter?
A: IBS means two alleles have the same sequence; IBD means they are copies of one allele in a specific shared ancestor with an unbroken chain of replication between. IBD implies IBS but not the reverse, and only IBD carries information about ancestry -- an IBD segment drags the whole surrounding chromosome with it, which is why it produces long homozygous tracts and can be dated.

Q: Is F a property of a person's DNA?
A: No, on two counts. IBD is only defined relative to a chosen base population -- trace far enough back and every pair of human alleles is IBD -- so F = 1/16 for a first-cousin child means "relative to the pedigree founders, treated as unrelated by convention". And pedigree F is only an expectation; the realised value scatters around it.

Q: How is F computed from a pedigree, and what does the answer discard?
A: Sum over every distinct path through a common ancestor A: F = sum of (1/2)^(n1 + n2 + 1) x (1 + F_A), where n1 and n2 are the generations from A down to each parent. Full sibs and parent-offspring give 1/4; half sibs, uncle-niece and double first cousins all give 1/8 by completely different routes; first cousins give 1/16. F summarises the loop structure and discards everything else.

Q: Give the genotype frequencies under inbreeding, and say what F does and does not change.
A: P(A1A1) = p^2 + Fpq, P(A1A2) = 2pq(1 - F), P(A2A2) = q^2 + Fpq. Heterozygosity is scaled by (1 - F), which inverts to the estimator F = 1 - H_obs/H_exp. Allele frequencies are untouched: inbreeding repackages alleles into genotypes and matters evolutionarily only by exposing recessives to selection, which then does move frequencies.

Q: Does inbreeding cause harmful mutations?
A: It creates no mutations at all. It makes existing recessive alleles homozygous, and the load was already there, hidden in heterozygotes. Inbreeding depression is exactly linear in F, M(F) = M(0) - 2F x sum of d_i p_i q_i, so it requires directional dominance: with pure additivity, or with dominance deviations pointing in random directions, there is no depression.

Q: Which mechanism supplies the directional dominance behind inbreeding depression, and what is the evidence?
A: Partial dominance -- recurrently generated, mostly partially recessive deleterious alleles unmasked by inbreeding -- is much better supported than true overdominance. Purging is observed in slowly inbred lines, apparent overdominant QTL in maize and Drosophila have repeatedly resolved into recessive deleterious alleles in repulsion phase, and the mutational load model predicts the observed magnitudes without extra assumptions.

Q: How much does a cousin marriage raise recessive disease risk, in relative and in absolute terms?
A: Risk goes from q^2 to q^2 + Fpq, so the relative risk is about 1 + F/q -- for cystic fibrosis at q about 0.02, first cousins are about 4 times at risk, and at q = 0.001 about 63 times. The absolute excess is modest: first-cousin offspring carry roughly 1.7 to 2.8 percentage points of excess significant congenital anomaly on a background of 2 to 3%, and separately about 3.5 points of excess pre-reproductive mortality. Quoting only one framing is how this topic gets misreported in either direction.

Q: How does the length of a run of homozygosity date the shared ancestor?
A: Model crossovers as Poisson at 1 per Morgan per meiosis; with m meioses round the loop the surviving tract is exponential with mean 100/m cM, and m = 2g for g generations back. So expected tract length is about 100/(2g) cM and g is about 50 divided by the mean tract length in cM: first cousins give about 17 cM, a distant shared ancestor 20 generations back gives about 2.5 cM.

Q: Two people both have F_ROH = 0.05, one with 12 tracts averaging 14.6 cM and one with 350 tracts averaging 0.5 cM. What differs?
A: Same total autozygosity, opposite histories. The first has g about 3.4 generations, a recent consanguineous union around first cousins, with roughly 144 Mb exposed to any rare recessive his recent ancestors carried -- 0.05 of 2,881 Mb of autosome, not the 175 Mb you get by misreading his 175 cM of tracts as megabases. The second has g about 100 generations -- no recent loop, but ancestry from a long-term small or endogamous population, where risk is concentrated in a known founder panel rather than being negligible.

Q: Why is F_ROH preferred to pedigree F?
A: Pedigree F is an expectation; F_ROH is the realisation. Mendelian sampling and recombination are stochastic, so for a first-cousin child the expected 219 cM of autozygosity comes in roughly 13 tracts averaging about 17 cM, giving a standard deviation of about 0.024 in F units -- a realised F commonly anywhere between about 0.04 and 0.09.

## Population structure, Wahlund, and F-statistics

Q: Derive the Wahlund effect and state how exact it is.
A: Pool k subpopulations, each internally in perfect Hardy-Weinberg, with allele frequencies p_i. The pooled heterozygote frequency is 2 p_bar q_bar - 2 Var(p), and each homozygote class is in excess by exactly Var(p). Pooling differentiated groups always produces a heterozygote deficit equal to twice the among-group variance in allele frequency -- not an approximation, and requiring no inbreeding, selection or non-random mating anywhere.

Q: What kind of object is F_ST?
A: F_ST = Var(p)/(p_bar x q_bar) is a variance ratio: the fraction of total allele-frequency variance attributable to among-group differences. It is an intraclass correlation, and it is an R-squared. With p1 = 0.2 and p2 = 0.8 pooled equally, Var(p) = 0.09, pooled heterozygosity is 0.32 against an expected 0.50, and F_ST = 0.09/0.25 = 0.36.

Q: Define F_IS, F_ST and F_IT, and explain why they chain multiplicatively.
A: With H_I observed within individuals, H_S expected within subpopulations and H_T expected in the total, F_IS = 1 - H_I/H_S, F_ST = 1 - H_S/H_T and F_IT = 1 - H_I/H_T. Since H_I/H_T = (H_I/H_S)(H_S/H_T), we get (1 - F_IT) = (1 - F_IS)(1 - F_ST). It telescopes because 1 - F is a probability of non-identity, and non-identity at the total level requires it at every nested level.

Q: At a single locus, can you tell a heterozygote deficit caused by inbreeding from one caused by pooled structure?
A: No -- the algebra is identical, and the same F comes out either way. They separate only genome-wide: inbreeding leaves long contiguous ROH tracts and no low-rank covariance, while structure leaves no long tracts but a low-rank genotype covariance and correlated deficits at ancestry-informative loci. A third cause is more common than either: null alleles and genotyping error also eat heterozygotes.

Q: How much migration does it take to stop two populations diverging?
A: Balancing drift against migration gives F_ST about 1/(1 + 4Nm), so the parameter is Nm, the absolute number of migrants per generation, not the proportion m. One migrant per generation -- one individual, whatever the population size -- holds F_ST near 0.2; Nm = 10 gives F_ST = 0.024, effectively one population.

Q: Human F_ST among continental groups is about 0.10 to 0.15. What does that number mean, and what does it not mean?
A: It means the among-group component of allele-frequency variance is about 10 to 15% of the total. It does not mean two people differ in 12% of their sequence -- the actual figure is about 0.1%, and nearly all common alleles are present on every continent, with only frequencies differing. It also implies nothing about discrete groups, since human variation is largely clinal.

Q: Do Lewontin and Edwards contradict each other?
A: No, they answer different questions. Lewontin's partition -- refined by Rosenberg and colleagues to 93 to 95% of variance within populations and only 3 to 5% among continental groupings -- says variance is mostly within-population. Edwards pointed out that small per-locus differences are correlated across loci, so a classifier over thousands of weakly informative markers separates ancestries nearly perfectly. Both are true.

Q: What are the principal components of a normalised genotype matrix actually the components of?
A: Normalising each SNP column by subtracting 2p_j and dividing by sqrt(2 p_j (1 - p_j)) makes XX-transpose/m an estimate of the genetic relationship matrix, so the PCs are the dominant eigenvectors of the empirical relatedness matrix -- the main axes along which people in your sample are related. Two traps: LD-prune and mask long-range LD regions such as the 17q21 MAPT inversion, HLA and LCT, or a top PC will represent an inversion rather than ancestry.

Q: Is the best K in an ADMIXTURE run the number of real populations?
A: No. There is no true K; the model is a description, not a discovery, and cross-validation picks the K that best predicts held-out genotypes, which is a different thing. Worse, sampling imbalance and distinct histories can produce identical bar plots -- a bottleneck in one group and recent admixture in another are not distinguishable from the plot alone.

Q: What does isolation by distance predict, and what did principal components of European genotypes show?
A: When dispersal is local, nearby individuals are more related than distant ones and differentiation grows smoothly with geographic distance -- roughly linearly with distance in one dimension and roughly with its logarithm in two. The first two PCs of European genotype data reproduce the map of Europe closely enough to place an individual's origin within a few hundred kilometres. Nothing discrete is happening; the gradient is the signal.

Q: Do clusters in a PCA plot mean the underlying populations are discrete?
A: No. Sample a continuous cline at discrete locations and the sampling design alone manufactures clusters. And under pure isolation by distance, PCA of the resulting data produces smooth sinusoidal gradients as its leading components -- a mathematical property of the model, not evidence of any migration event. Reading history off PC plots without that caution has generated a lot of confident false history.

Q: Why is the extreme tail of a per-locus F_ST scan weak evidence for local adaptation?
A: Because the null distribution depends entirely on demography: bottlenecks, hierarchical structure and isolation by distance all generate heavy tails with no selection at all. Worse, F_ST is a ratio whose denominator is within-population diversity, so background selection deflates the denominator and manufactures islands of divergence where nothing adaptive happened. Canonical hits such as LCT, SLC24A5 and EDAR do come out this way, but corroborate with an absolute divergence measure first.

Q: What is the difference between global and local ancestry, and what kind of model infers the local kind?
A: Global ancestry is the genome-wide proportion contributed by each source population; local ancestry is the assignment at each position along the chromosome. Local ancestry inference is a hidden Markov model along the chromosome whose hidden states are the ancestry at a position and whose transitions are governed by recombination rate times generations since admixture, so after g generations tracts are roughly exponential with mean 100/g cM and their length distribution dates the admixture.

Q: What does admixture mapping scan for, and why is its multiple-testing burden so light?
A: It scans for regions where local ancestry in cases deviates from the genome-wide average, which is powerful whenever disease risk differs between the source populations. The burden is light because the genome carries only a few thousand effectively independent ancestry blocks rather than millions of SNPs. APOL1 and kidney disease is the standard success story.

Q: Why does unmodelled population structure become a bigger problem as sample size grows?
A: Because it is bias, not variance. Cov(g,y) = 2w(1-w)(p1 - p2)(mu1 - mu2) does not depend on n at all, so the estimate stays put while its standard error falls: the non-centrality grows linearly in n and the p-value marches toward zero. Bigger studies make a stratification artifact more significant, not less.

Q: Does adding ten principal components remove stratification?
A: Not reliably. PCs capture broad structure, but fine-scale structure, recent relatedness and assortative mating survive, and the residual bias grows in significance with sample size. Mixed models with the genetic relationship matrix handle more; only within-family designs remove confounding by construction, and several published geographic gradients in polygenic scores shrank dramatically when re-analysed in siblings.

Q: Why is genomic control's lambda_GC a poor diagnostic for confounding in a large GWAS?
A: Because it grows with n under confounding and also grows with n under genuine polygenicity, since a truly polygenic trait inflates test statistics everywhere. So lambda greater than 1 proves nothing on its own, and dividing every statistic by lambda over-corrects real signal while under-correcting real bias. Separating the two needs something keyed to LD structure: the LD-score regression intercept.

## Haplotypes and the phase problem

Q: What is a haplotype, and why does unphased genotype data underdetermine it?
A: A haplotype is the set of alleles carried on one physical chromosome copy -- alleles that travelled together through the last meiosis -- and you have two at every autosomal region. A genotype assay reports only the unordered pair, so an individual heterozygous at two sites is equally consistent with haplotypes AB and ab or with Ab and aB. Only double heterozygotes are ambiguous, and they are exactly the informative ones.

Q: What are the three routes to recovering phase, and what is odd about the third?
A: Trios, which reveal which parent contributed what; reads long enough to span both sites; and statistical phasing, which infers the most probable haplotypes given that the population carries only a limited number of common ones. The third is circular in a productive way, using LD to infer haplotypes and haplotypes to quantify LD. Fortunately r-squared can be computed without phasing at all.

## Linkage disequilibrium: D, D-prime, and r-squared

Q: What is the difference between genetic linkage and linkage disequilibrium?
A: Linkage is a property of chromosomes -- two loci close enough that crossovers between them are rare -- and essentially never changes. LD is a statistical association between alleles, a property of a specific population at a specific time, and it changes every generation. Two loci 1 kb apart are linked in every organism that ever lived yet can sit at zero LD; two loci on different chromosomes are never linked yet can show strong LD in an admixed population.

Q: Define D, and show that the whole two-locus table is one parameter deep.
A: D = p_AB - p_A p_B, the departure of a haplotype frequency from the product of its marginals. Then p_Ab = p_A p_b - D, p_aB = p_a p_B - D and p_ab = p_a p_b + D, so all four cells follow from D. Equivalently D = p_AB x p_ab - p_Ab x p_aB, which is how you compute it from counts.

Q: Why is D on its own a bad summary of association?
A: Its bounds depend on the allele frequencies: with p_A = p_B = 0.5 it can reach 0.25, but with p_B = 0.01 it cannot exceed 0.005 however perfect the association. So D = 0.004 means "almost nothing" in the first case and "as strong as physically possible" in the second, and a statistic whose scale moves with the marginals cannot compare loci.

Q: What does D-prime = 1 actually tell you, and what is its weakness?
A: D-prime = D divided by its frequency-dependent maximum, so D-prime = 1 means one of the four haplotypes is absent -- no recombination or recurrent mutation has separated the pair since the younger allele arose. That makes it the right tool for asking whether an interval has recombined and for defining haplotype blocks, but it hits 1 whenever a haplotype is missing merely because an allele is rare, so it is upward-biased and noisy exactly where genomes are most variable.

Q: Show that r-squared is an ordinary Pearson correlation, and give the practical payoff.
A: Let X and Y indicate carrying A and carrying B on a randomly drawn chromosome. Then Var(X) = p_A p_a, Var(Y) = p_B p_b and Cov(X,Y) = p_AB - p_A p_B = D, so r-squared = D^2/(p_A p_a p_B p_b). Because it is a correlation, everything you know transfers: it is the fraction of variance in one column explained by the other, and n x r-squared is a chi-square statistic on 1 df for testing D = 0.

Q: Why can r-squared be computed from unphased genotypes?
A: Code genotypes as dosages 0/1/2. Under Hardy-Weinberg the two haplotypes in an individual are independent draws, so the covariance becomes 2D and each variance doubles; the factors cancel and the genotype-dosage correlation equals the haplotype r. This is why plink --r2 works on unphased data.

Q: Can a tightly linked pair always reach r-squared = 1?
A: No. From r-squared = D^2/(p_A p_a p_B p_b), reaching 1 forces p_A = p_B, so a common variant can never be a perfect proxy for a rare one however tightly they are physically bound. A rare allele on a common background typically gives D-prime = 1 with r-squared about 0.05 -- perfect historical association, useless statistical proxy.

Q: What does testing a tag SNP instead of the causal variant cost you?
A: A factor of 1/r-squared in sample size: N_tag = N_causal / r-squared, because the tag's variance explained is r-squared times the causal variant's and the non-centrality is about N x R-squared. The conventional array-design threshold of r-squared at least 0.8 is precisely a decision to accept a 25% inflation; at r-squared = 0.05 you need twenty times the cohort.

## LD decay, haplotype blocks, and what they buy

Q: Derive the LD decay law and state how fast r-squared decays.
A: A gamete is non-recombinant with probability 1 - c, carrying an intact parental haplotype, or recombinant with probability c, in which case its two alleles are independent draws. So p_AB(t+1) = (1-c) p_AB(t) + c p_A p_B, and subtracting p_A p_B gives D_t = D_0 (1-c)^t. Allele frequencies are unchanged, so r-squared decays as (1-c)^(2t) -- twice as fast as D.

Q: At about 1 cM per Mb, contrast the persistence of LD between unlinked loci and at 10 kb.
A: Unlinked loci have c = 0.5, so D halves every generation and is gone in a handful of generations. At 10 kb, c = 0.0001 and the half-life is about 6,900 generations, roughly 190,000 years at the pinned 27 years per generation -- comparable to the age of our species. Between those extremes, at 10 to 100 kb, LD survives long enough to be reliably present and decays fast enough to localise a signal.

Q: Does recombination create linkage disequilibrium?
A: No, it destroys it, at rate c per generation, helped by gene conversion at sub-kilobase scales and by recurrent mutation placing the same allele on different backgrounds. LD is created by mutation, drift, admixture and selection.

Q: A new mutation is born with D-prime = 1 and r-squared near zero. How can both be true?
A: A new allele B arises on exactly one chromosome, which already carries some allele A at a nearby site, so p_AB = p_B and D = p_a p_B, which is exactly D_max -- hence D-prime = 1 by construction. But r-squared = p_a p_B/(p_A p_b), which goes to 0 as p_B goes to 0. Complete LD and near-zero correlation from the same haplotype table.

Q: How does effective population size set the extent of LD?
A: Balancing drift's sampling covariance against recombination gives Sved's approximation E[r-squared] about 1/(1 + 4 Ne c), so LD extent is inversely proportional to Ne. Because correlation at distance c is dominated by coalescent events roughly 1/(2c) generations back, short-distance LD reports on ancient Ne and long-range LD on recent Ne.

Q: Why are haplotype blocks shorter in African than in European or Asian samples?
A: Not because of "more diversity" as such: African populations never passed through the out-of-Africa bottleneck, so their effective size is roughly twice that of non-Africans, their lineages coalesce further back and more recombination has accumulated along the genealogy's branches. Sved's formula then predicts LD extending about half as far -- Gabriel and colleagues found mean block lengths of about 22 kb in European and Asian samples against about 11 kb in Yoruba.

Q: How does admixture generate LD between loci on different chromosomes?
A: Mixing population 1 at fraction m with population 2 gives D = m(1-m)(p_A1 - p_A2)(p_B1 - p_B2) -- the product of the two frequency differences times the mixing variance. It is non-zero for every pair of loci in the genome, linked or not, whenever both loci differ in frequency between the sources, which is exactly why unmodelled ancestry produces genome-wide false positives.

Q: Why do haplotype blocks exist at all, and what are their boundaries really?
A: Roughly 80% of human recombination occurs in 10 to 20% of the sequence, concentrated in hotspots a couple of kilobases wide whose positions are set largely by PRDM9. Punctate recombination gives punctate LD: long stretches with almost no historical recombination separated by short intervals across which D-prime collapses. The block model is an idealisation -- boundaries depend on the algorithm and sample, and hotspot positions vary between individuals because PRDM9 alleles do.

Q: Explain the economics of a tag-SNP array.
A: If a block of 40 common variants carries only three to five common haplotypes, two or three well-chosen tag SNPs predict the rest at r-squared at least 0.8. That collapses roughly 10 million common human variants to a few hundred thousand array positions -- around 500,000 for European ancestry, more for African where blocks are shorter -- cheap enough to run on hundreds of thousands of people, which is the entire economic basis of GWAS.

Q: Why does a common allele on an unusually long haplotype indicate recent selection?
A: Under drift alone, reaching high frequency takes on the order of 4 Ne generations, over which a 1 Mb haplotype has essentially no chance of surviving intact, so common alleles are normally old and old alleles normally sit on short haplotypes. Driving the allele up in about 300 generations leaves a 1 Mb haplotype intact with probability about 0.05 per chromosome, and it is now carried by many chromosomes -- so high frequency plus a long shared haplotype violates the normal relationship.

Q: How does the long-haplotype logic date the European lactase-persistence allele?
A: The European lactase-persistence variant, a single base change in an enhancer in intron 13 of MCM6 about 14 kb upstream of LCT, reaches roughly 90% frequency in Scandinavia while still sitting on a shared haplotype of order 1 Mb. A 1 Mb haplotype has a half-life of about 69 generations, so the allele can only be a few thousand years old; independent estimates give roughly 5,000 to 10,000 years, coincident with cattle domestication.

Q: Is the GWAS index SNP the causal variant?
A: No, it is the best-correlated genotyped marker. Dozens of variants in the same block have nearly identical r-squared with the causal site and therefore nearly identical p-values, so which one tops the list is close to sampling noise. Fine-mapping attacks this with credible sets, very large samples, and multi-ancestry data -- African blocks being shorter, adding African samples narrows the credible set faster than adding more of the same ancestry.

Q: Why do polygenic scores transfer poorly across populations, in LD terms?
A: The estimated tag effect is the causal effect times Cov(G_c,G_t)/Var(G_t), a quantity that depends on the LD structure of the discovery population. Applied where r differs, variance explained scales as r-squared in the new population over r-squared in the discovery population, and if the sign of r flips so does the contribution. Differing allele frequencies compound the degradation.

Q: Why is imputation best thought of as a codec, and what breaks when the reference panel is mismatched?
A: It models the target chromosome as a mosaic copied from reference haplotypes, with switches at a rate proportional to genetic distance -- a hidden Markov model whose hidden state is which reference haplotype is being copied. It works because over tens of kilobases chromosomes really are near-copies of a few ancestral haplotypes. With a mismatched panel, rare population-specific variants are simply absent and cannot be imputed at any accuracy, and the copying model switches too often, flattening the posterior and adding noise downstream.
