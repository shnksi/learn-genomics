# Question bank — Part 02: Transmission genetics

Covers [Ch 09-15](../part-02-transmission-genetics/09-mitosis-and-meiosis.md).

Convert to Anki: `python reference/to_anki.py question-banks/ --out anki-import.tsv`

## Meiosis: the machinery behind the ratios

Q: A human cell contains 46 chromosomes and 92 chromatids. Name every stage it could be in, and say which one is the trap.
A: G2, mitotic prophase, prometaphase or metaphase, or meiotic prophase I, metaphase I or anaphase I. Anaphase I is the trap: whole replicated chromosomes are being pulled apart but the centromeres have not split, so the count is still 46 chromosomes and 92 chromatids. At mitotic anaphase the centromeres do split and the count jumps to 92 chromosomes. Count centromeres, not arms.

Q: What is the difference between sister chromatids and homologs, and why does confusing them wreck every later calculation?
A: Sisters are the two DNA molecules made by replicating one template in S phase, so they are identical apart from occasional replication errors. Homologs came from different parents and differ at roughly 1 base in 1,000, which is about 100,000 differences along a 100 Mb chromosome. Every heterozygous site you carry is a difference between homologs, so allelic segregation is a homolog event.

Q: Meiosis halves the chromosome number. What happens to DNA content, and when?
A: DNA content is quartered, not halved: 4c after the single S phase, 2c after meiosis I, 1c in the gamete. The chromosome number halves exactly once, across meiosis I -- anaphase I is the reductional segregation, though the per-cell count only reads 23 once the daughter cells form, since centromeres do not split until anaphase II. Replicate once and divide twice is the whole arithmetic trick that makes reduction possible.

Q: Why do sister chromatids stay joined through meiosis I and separate only at meiosis II?
A: Cohesin is released in two stages. At anaphase I separase cleaves cohesin along the chromosome arms only, while the protein shugoshin shields cohesin at the centromere; that centromeric cohesin is cleaved at anaphase II. Two-stage release is what lets one round of replication serve two divisions.

Q: What is the immediate mechanical job of a crossover, and why is "crossing over exists to generate variation" the wrong emphasis?
A: Between diplotene and anaphase I the only thing holding two homologs together is sister-chromatid cohesion distal to a chiasma, the synaptonemal complex having dissolved. A bivalent that received no crossover arrives at the spindle as two independent univalents and segregates at random, so recombination is a structural requirement for accurate segregation and variation is the consequence.

Q: A crossover is guaranteed to fall between loci A and B in every meiosis. Why are only 50% of gametes recombinant?
A: The bivalent contains four chromatids and a crossover involves only two of them, so each such meiosis yields two parental and two recombinant products. This is the mechanical reason recombination frequency saturates at 0.5 and can never exceed it.

Q: Roughly how many programmed double-strand breaks does a human meiocyte make, how many become crossovers, and how do the sexes differ?
A: SPO11 makes a few hundred programmed breaks per meiocyte, roughly 200-300, and more in oocytes than in spermatocytes. Only a minority mature into crossovers; the rest resolve as non-crossovers (gene conversion) and are invisible to a linkage map. Crossover number is set sex-specifically: about 50 per spermatocyte, against considerably more per oocyte. Per gamete that is roughly 25-30 in males and 40-45 in females, since each crossover involves only two of the four chromatids.

Q: In what sense is Mendel's 1:1 segregation ratio not a coin flip?
A: One meiosis from an Aa heterozygote produces exactly A, A, a, a: deterministically 2:2, every time. The sampling noise Mendel observed comes from which gametes take part in fertilisation, not from segregation. In fungi, where all four products stay together in an ascus, the deterministic 2:2 is directly visible.

Q: What guards the entry into anaphase, and what does its accuracy record tell you?
A: The spindle assembly checkpoint blocks anaphase until every kinetochore in the cell is attached to the spindle and under tension. The signal is emitted by unattached kinetochores, and a single one produces a diffusible wait signal strong enough to hold the whole cell: it is a barrier where the last worker to report in releases everyone and the default is to block. That default is why mitosis in normal human cells missegregates only about once per 100 divisions, against roughly one in five in chromosomally unstable cancer lines, and why the comparatively permissive oocyte checkpoint matters so much.

Q: Mendel's rules map exactly onto meiosis. Why was that correspondence not the proof of the chromosome theory, and what was?
A: Correspondence is not causation, so the Sutton-Boveri parallel made the hypothesis compelling without settling it. The proof came from breaking the correlation on purpose: Morgan's white-eyed Drosophila in 1910 gave a gene whose inheritance tracked the X chromosome specifically, and Bridges in 1916 found rare exceptional flies whose phenotypes implied nondisjunction had occurred, then confirmed cytologically that those same individuals carried the predicted abnormal chromosome constitutions. A genetic anomaly and a visible chromosomal anomaly in the same flies is what settled it.

## Nondisjunction and the two germline clocks

Q: How do marker genotypes distinguish a meiosis I from a meiosis II nondisjunction, and why must the markers be pericentromeric?
A: An MI error delivers the two different homologs, so the trisomic child is heterozygous for that parent's pericentromeric alleles; an MII error delivers two sisters of one homolog, so the child carries two copies of the same allele. Only pericentromeric markers work, because crossing over in prophase I has already scrambled distal segments between the homologs.

Q: For trisomy 21, what is the parental and meiotic-stage breakdown of errors, and what caveat comes with it?
A: About 90% of errors are maternal, and among maternal errors roughly 77% arise in meiosis I and 23% in meiosis II. The caveat is that many apparent MII errors show elevated recombination in the nondisjoined bivalent, suggesting the lesion was set up in meiosis I; also, premature separation of sister chromatids in MI is indistinguishable from a true MII error. The classification is of the observable, not the cause.

Q: Why is the maternal age effect on aneuploidy a two-hit model?
A: Hit one is delivered before birth: a bivalent that got no crossover, or one placed too close to the telomere or centromere to hold well, is structurally fragile from the start. Hit two is age: cohesin is loaded during fetal S phase, its meiosis-specific subunits REC8 and SMC1B are never replenished, and decades of dictyate arrest let chiasmata slip off. This is why maternal MI errors are associated with reduced recombination in the nondisjoined bivalent.

Q: Why does maternal age drive aneuploidy while paternal age drives point mutations?
A: The two germlines measure different clocks. Sperm come from stem cells dividing roughly every 16 days from puberty, so replication errors accumulate with division count: about 80% of de novo single-nucleotide variants are paternal, and each year of paternal age adds roughly 1.3-1.5 of them. Oocytes undergo about 22 mitotic divisions, all prenatal, then sit still for decades while a physical structure decays. Copy count versus wait time.

Q: How common is aneuploidy in human oocytes, and why are most children with Down syndrome born to mothers under 35?
A: Over 20% of oocytes are aneuploid even at peak fertility, rising above 50% by the late thirties to early forties, and aneuploidy is the leading identified cause of miscarriage. Live-birth risk of Down syndrome runs at roughly 1 in 1,250-1,300 at age 25 and about 1 in 100 at 40, but most pregnancies occur at younger ages, so a high relative risk in a small stratum is not where most cases come from.

## Mendel's model and the probability engine

Q: Why should you abandon Punnett squares as soon as more than one locus is involved?
A: A Punnett square is the outer product of two gamete distributions drawn out by hand, and it scales as 4^n cells: 1,048,576 for ten heterozygous loci. Factorise the query across loci instead and multiply, using only five per-locus numbers from an Aa x Aa cross: P(AA) = 1/4, P(Aa) = 1/2, P(aa) = 1/4, P(dominant phenotype) = 3/4, P(recessive phenotype) = 1/4.

Q: Why is a test cross to a homozygous recessive better than selfing for exposing a hidden heterozygote?
A: The tester can contribute only recessive alleles, so its gamete distribution is a point mass that adds no variance and offspring phenotypes read out the unknown parent's gametes directly. Under Rr, n all-dominant offspring have probability (1/2)^n from a test cross against (3/4)^n from a self, so 5 offspring get you below 5% instead of 11.

Q: Exactly when does independent assortment hold?
A: For loci on different chromosomes, and approximately for loci far enough apart on one chromosome that the recombinant fraction approaches 1/2, which means well over 100 cM. It is not a general law of inheritance: at 50 cM the expected recombination frequency is still only about 0.32 under Haldane (0.38 under Kosambi), either way well short of 0.5, and linked loci violate it flagrantly. That violation is the entire basis of genetic mapping.

Q: What does a 3:1 ratio claim about a family of four offspring?
A: Nothing about that family. It is the expected value of a multinomial, and a sibship of four is very often 4:0 or 2:2. The probability of observing exactly three dominant and one recessive among four is only 27/64.

Q: Pea has seven chromosome pairs and Mendel studied seven traits. Why is that a coincidence rather than an explanation?
A: His seven genes are not one per chromosome; they fall on four of the seven. Of the 21 possible pairwise combinations, four involve genes on the same chromosome, and three of those four are far enough apart that no linkage would have been detectable at his sample sizes, leaving exactly one pair that should have shown linkage. He never published a cross using it.

## What dominance actually is

Q: State what "dominant" means, and three things it does not mean.
A: It means only that the heterozygote's phenotype resembles one homozygote's rather than falling between them, which is a claim about the genotype-to-phenotype map. It does not mean common, strong, or advantageous. Huntington disease is dominant, rare and fatal; the ABO O allele is recessive and the most common allele in nearly every human population.

Q: Why are loss-of-function alleles usually recessive? Give the kinetic argument.
A: Model flux as J(E) = Jmax x E/(E+K). A heterozygote for a null makes half the enzyme and retains J(E/2)/J(E) = (E+K)/(E+2K) of the flux: 99.0% at E = 100K, 91.7% at E = 10K, 66.7% at E = K. Most enzymes sit well into saturation and control over pathway flux is distributed across many steps, so halving one changes almost nothing measurable. This is the Kacser-Burns argument of 1981.

Q: Why are transcription factors over-represented among haploinsufficient genes while metabolic enzymes almost never are?
A: Enzymes operate far into saturation, where halving the amount costs a percent or two of flux. Transcription factors work by occupancy, and evolution tunes the binding constant to sit near the operating concentration so that the switch stays responsive; a factor near its K loses about a third of its occupancy at half dose, and downstream thresholds amplify that. Many also act in fixed-stoichiometry complexes. Dosage sensitivity is the price of being a regulator.

Q: Name the four mechanisms by which an allele can be dominant, with one example each.
A: Haploinsufficiency, where 50% of the product is genuinely not enough (PAX6 in aniridia); gain of function, where the variant does something new or does it constitutively (FGFR3 p.(Gly380Arg) in achondroplasia); dominant negative, where the mutant subunit poisons a complex (COL1A1 in osteogenesis imperfecta); and toxic species, where the product does damage the wild type cannot undo (the HTT CAG expansion).

Q: Why can a missense variant be far more severe than a complete deletion of the same gene?
A: Because a dominant-negative product is incorporated into multimers and ruins them, whereas a null merely halves the supply. Type I collagen is alpha1(I)2 alpha2(I)1, so with a heterozygous COL1A1 variant and equal expression only (1/2)^2 = 1/4 of trimers have two normal alpha1 chains: three-quarters of the collagen is defective from a 50% mutant allele dose.

Q: Why can a severely deleterious recessive allele reach a frequency that a lethal dominant never could?
A: A deleterious dominant is exposed to selection in every carrier and is removed about as fast as mutation supplies it. A deleterious recessive is invisible in heterozygotes, and under Hardy-Weinberg the ratio of carriers to affected individuals is 2pq/q^2 = 2p/q, which is about 100 for CFTR F508del at q = 0.02. Roughly 98% of copies sit in people selection cannot see.

## Beyond Mendel: what actually changed

Q: Incomplete dominance, codominance, lethal alleles, epistasis and penetrance are all called exceptions to Mendel. What do they have in common, and which phenomenon is the real exception?
A: They all perturb the genotype-to-phenotype map while leaving segregation and independent assortment untouched, which is precisely why every modified ratio is still counted in sixteenths: the same genotype classes were produced at the same frequencies and only the rendering changed. The only phenomenon in Part 2 that genuinely breaks a Mendelian rule is linkage, which breaks independent assortment.

Q: Distinguish incomplete dominance from codominance, and give the discriminating question.
A: Incomplete dominance gives one intermediate phenotype on a single measured scale, such as a pink snapdragon with about half the anthocyanin. Codominance gives both allelic products present and separately detectable at once, such as an MN heterozygote carrying both glycophorin A antigens on every red cell. Ask whether you can see the two homozygote phenotypes side by side. Both give an F2 of 1:2:1.

Q: Is the sickle-cell allele HbS dominant, recessive, incompletely dominant or codominant?
A: All four, depending on the assay. Clinically the heterozygote is healthy, so it is recessive; on a protein gel both HbA and HbS bands are present, so it is codominant; under severe hypoxia some heterozygote cells sickle, so it is incompletely dominant; for malaria resistance the heterozygote is protected, so it is dominant. Dominance is a property of the (allele, phenotype, assay) triple.

Q: Two identical-looking parents are crossed and the offspring come out 2:1, with litters about a quarter smaller than expected. What does that mean?
A: Both parents are heterozygous for an allele that is dominant for the visible phenotype and recessive lethal: the ordinary 1:2:1 is produced, but the homozygous class dies before it can be counted. Mouse A^y is the case, where a single ~170 kb deletion drives ectopic agouti expression (dominant yellow coat) and destroys the neighbouring Raly gene (recessive lethality). One allele, two dominance verdicts.

Q: How do you derive the modified dihybrid ratios instead of memorising them?
A: Treat "is locus A functional?" and "is locus B functional?" as two binary inputs weighted 3/4 and 1/4, then let the pathway topology pick a function from those inputs onto a smaller output set and sum sixteenths. A sequential pathway gives 9:3:4, a dominant inhibitor gives 12:3:1, an AND gate (two required steps) gives 9:7, and redundant paralogues acting as an OR gate give 15:1. Every one sums to 16.

Q: Distinguish penetrance from expressivity, and say why penetrance is never a single number.
A: Penetrance is P(affected | genotype), the proportion of carriers showing any of the phenotype; expressivity is how severely or in what form it presents among those affected. For adult-onset conditions penetrance is a function of age, so the correct object is a cumulative-incidence curve, and it is variant-specific and biased upward when estimated from families ascertained because they contained many affected members.

Q: A complementation test says two recessive mutants are in the same gene. Name the three ways it can lie.
A: It is valid only for recessive loss-of-function alleles, so a dominant mutation fails to complement whatever it is crossed to and appears to be in every gene. Intragenic complementation between defective subunits of a multimer manufactures a false "different genes". Non-allelic non-complementation between dosage-sensitive partners in one complex manufactures a false "same gene", and usefully nominates them as physically interacting.

Q: ABO has three alleles and two different dominance relationships inside one locus. Why do both fall out of the enzymology rather than needing a rule?
A: The gene encodes a glycosyltransferase that adds a sugar to the H antigen already on the red-cell surface. I^A adds N-acetylgalactosamine and I^B adds galactose, the two enzymes differing at active-site residues 266 and 268; i is a c.261delG frameshift to a premature stop, so it makes no functional protein at all. Enzymes act in trans on a shared substrate pool and their products accumulate independently, so two working enzymes each leave their own mark, making I^A and I^B codominant, while a broken one leaves nothing to see, making both dominant to i.

Q: An I^A i parent is crossed with an I^B i parent. What are the offspring, and why does the result surprise people?
A: 1 AB : 1 A : 1 B : 1 O. Two parents produce children of all four blood groups, including AB and O, which match neither parent. Segregation is completely ordinary -- each parent transmits a working-enzyme allele or the null with probability 1/2 -- and the four-way split comes entirely from the genotype-to-phenotype map.

Q: Phenylketonuria produces brain damage, pale skin and fair hair, musty urine and eczema from one blocked reaction. What is that phenomenon, and what does it do to the phrase "the gene for X"?
A: Pleiotropy, and it is the normal case rather than a curiosity: phenylalanine hydroxylase fails, so phenylalanine accumulates and damages the developing brain while tyrosine becomes scarce and melanin synthesis falls. It usually means the product is used in more than one context, or that one lesion propagates through a network. Because pleiotropy is ubiquitous, "the gene for X" is nearly always a category error, which is also why loci turn up shared across statistically unrelated traits in association studies.

Q: Sex-limited, sex-influenced and sex-linked are three unrelated things. What are they, and which standard example should you refuse to use?
A: Sex-linked is a statement about location: the gene sits on a sex chromosome. The other two involve ordinary autosomal genes whose map to phenotype takes sex as an argument. Sex-limited means expressed in one sex only -- milk yield, carried and transmitted by bulls, or male-limited precocious puberty from activating LHCGR variants -- which is just penetrance conditioned on sex with one conditional penetrance at zero. Sex-influenced means expressed in both sexes with different dominance or threshold, as with the horned allele in some sheep breeds, dominant in rams and recessive in ewes.

Q: Why is pattern baldness the wrong example of a sex-influenced trait?
A: Because androgenetic alopecia is not a single autosomal locus read differently by the two sexes at all: it is polygenic, with a large contribution from the X-linked AR region, so the textbook example is actually part sex-linked. Use the horned allele in sheep, where one genotype gives horned males and polled females and the difference is hormonal rather than genetic.

Q: Why is "genetic means unchangeable" wrong, and what does a genotype actually fix?
A: A genotype fixes a norm of reaction -- phenotype as a function of environment -- not an outcome, and different genotypes have differently shaped functions, which is genotype-by-environment interaction and is the general case rather than a complication. The Siamese cat and Himalayan rabbit carry a TYR allele whose tyrosinase is inactive at core body temperature and active a few degrees below, so pigment appears only on ears, muzzle, paws and tail; shave a patch and keep it cold and the new hair comes in black. Phenylketonuria is the same lesson with the sign reversed: a fully genetic disease whose neurological phenotype largely does not appear if dietary phenylalanine is restricted from birth.

Q: What is a phenocopy, and what does it cost you when you read a pedigree?
A: An environmentally produced phenotype indistinguishable from a genetic one. Thalidomide-induced limb reduction mimicked a rare inherited malformation closely enough to delay recognition of the cause, congenital rubella deafness mimics genetic deafness, and nutritional rickets mimics X-linked hypophosphataemia. The consequence is direct and unforgiving: an affected individual in a pedigree is not proof of a genotype.

Q: What does a modifier gene do, and what is the best-documented human case?
A: It changes the phenotype produced by the same allele on a different genetic background. In mice this is routine: knockouts that are embryonic-lethal on one inbred strain are viable on another. In humans, CFTR F508del homozygotes vary enormously in lung disease severity, with modifier loci mapped at SLC26A9, SLC9A3 and TGFB1. The best-documented case is sickle-cell disease, where severity is strongly modified by variants at BCL11A and HBS1L-MYB that keep fetal haemoglobin switched on, and BCL11A's erythroid enhancer is now the target of an approved gene-editing therapy. A modifier gene became a drug target.

## Testing a genetic hypothesis

Q: Why must a genetic chi-square be run on counts rather than percentages, and where do the expected values come from?
A: Chi-square scales linearly with N, so feeding it percentages asserts N = 100 and discards all information about sample size. The expected values come from the model, which specifies exact proportions with no free parameters; computing them from row and column margins turns it into a test of a different hypothesis with different degrees of freedom.

Q: How do you count degrees of freedom in a genetic goodness-of-fit test, and what is the canonical mistake?
A: df = (number of classes) - 1 - (number of parameters estimated from these same data). The canonical mistake is a Hardy-Weinberg test on three genotype classes: the allele frequency was estimated from those very genotypes, so df = 1, not 2. Using 2 raises the critical value from 3.841 to 5.991, makes the test conservative, and lets genotyping error through a standard quality filter.

Q: A colleague reports chi-square = 1.2 on 3 df, p = 0.75, from a testcross of 80 progeny, and concludes the markers are unlinked. What is wrong?
A: Failure to reject is a statement about the experiment, not about the genome. At a true recombination fraction of 0.4 the expected class proportions are 0.3 : 0.3 : 0.2 : 0.2, giving a non-centrality of 3.2 and only about 29% power at alpha = 0.05. The right output is an estimate of r with an interval, which will be wide and will include both 0.5 and substantial linkage.

Q: Why is a goodness-of-fit p-value near 1 as much a diagnostic as one near 0?
A: The test already assumes the model is true and asks whether the residuals are as large as sampling from that model requires, so data can fail it by being too tidy. Fisher's aggregate for Mendel was chi-square = 41.6 on 84 df, where the expectation of chi-square is its df; a fit that close or closer arises about 3 x 10^-5 of the time. Correct theory plus honest counting gives chi-square near df, not near df/2.

Q: A clinic collects every two-child family in its region containing at least one affected child, finds 45 of 80 children affected, and rejects autosomal recessive inheritance. What is the correct null?
A: 4/7, not 1/4. Under complete ascertainment the expected proportion is (1/4)/(1 - (3/4)^s), which is 0.571 for sibships of two. Expected counts of 45.71 and 34.29 against the observed 45 and 35 give chi-square = 0.026 on 1 df, p about 0.87: the data fit simple autosomal recessive inheritance almost perfectly.

Q: A couple have had three children with a recessive condition. What is the risk for the fourth, and what does a family history actually update?
A: Still 1/4. Each conception is an independent draw and meiosis has no memory, so the segregation probability does not change. What a family history updates is your estimate of the parents' genotypes, which is a different quantity, and that is what a Bayesian pedigree calculation computes.

## Sex chromosomes and sex linkage

Q: Why are the human and Drosophila XY systems not the same system?
A: In mammals the Y carries a dominant male-determining gene, so presence of a Y makes a male: X0 is a female (Turner syndrome) and XXY is a male (Klinefelter syndrome). In Drosophila sex is set by the ratio of X chromosomes to autosome sets and the Y matters only for sperm production, so X0 is a sterile male and XXY is a fertile female. Same variable names, different interpreter.

Q: What do 46,XX males prove about SRY, and what do SRY-negative XX males prove?
A: Most 46,XX males carry SRY translocated onto the tip of an X by a crossover that ran a few kilobases past the PAR1 boundary in the father's meiosis, exactly as SRY's position about 5 kb outside PAR1 predicts; they show SRY is sufficient. XX males with no SRY at all but a duplicated enhancer about 600 kb upstream of SOX9 show that SRY acts through SOX9, so raising SOX9 directly skips the switch entirely.

Q: The X and Y stopped recombining with each other. Why did only the Y degenerate, and is it still degenerating?
A: The X still recombines with another X in females, where two-thirds of all X chromosomes sit; the Y is only ever in males, so its male-specific region is one non-recombining block subject to Muller's ratchet, hitchhiking and background selection, with an effective population size of 0.5N against 2N for an autosome. It is not still crumbling: loss was front-loaded into the early strata, and the human and macaque Y differ by about one gene over 25 million years.

Q: For an X-linked allele at frequency q, what are the male and female phenotype frequencies, and what follows from the ratio?
A: A male is affected if his single X carries the allele, so male frequency = q with no square root needed; a female needs two copies, so female frequency = q^2, and the male-to-female ratio is 1/q. At q = 0.08 for red-green colour vision deficiency that predicts 8% of males, 0.64% of females and about 15% of women as carriers, against an observed 8% and about 0.5%.

Q: Why do reciprocal crosses discriminate X-linkage, and what exactly does "no male-to-male transmission" forbid?
A: For an autosomal locus, A female x B male and B female x A male give identical offspring distributions; for an X-linked locus they do not, because sons take their X from their mother and their Y from their father. What is impossible is transmission of an X-linked allele from father to son, not the co-occurrence of an affected father and an affected son, since with a common allele such as G6PD deficiency the son can have it from a carrier mother.

Q: Why is dosage compensation described as a problem rather than a mechanism?
A: Three lineages solved it three incompatible ways: mammals silence one X using the lncRNA XIST, Drosophila transcriptionally doubles the single male X, and C. elegans halves both X chromosomes in XX hermaphrodites. Convergence on the same functional endpoint with no shared machinery is the signature of a real constraint solved repeatedly from scratch, and birds, which compensate only partially and gene by gene, show the constraint is survivable.

Q: If one X is inactivated in females, why do 45,X and 47,XXY have any phenotype at all?
A: Because silencing is incomplete: roughly 15-25% of X-linked genes escape, about 15% consistently and a further 10% variably, concentrated in the pseudoautosomal regions and on Xp. Escapees are dosage-sensitive by definition, so they are present in one copy in 45,X and three in 47,XXY. SHOX sits in PAR1, escapes, and accounts substantially for the short stature in Turner syndrome.

Q: Why is it unreliable to describe women as unaffected carriers of X-linked recessive disease?
A: X inactivation is chosen independently in a modest number of progenitor cells, of order tens, so the proportion is roughly Binomial(n, 1/2)/n with standard deviation 1/(2 x sqrt(n)), about 0.10 at n = 25. A 70:30 split therefore arises in about 4% of women by sampling alone, and skewing needs no mechanism. Manifesting carriers of Duchenne muscular dystrophy, haemophilia and G6PD deficiency are well documented.

Q: Name the sex-determining systems other than XY, and say what varies between lineages and what does not.
A: ZW, where the female is heterogametic and the signal is Z dosage (birds, snakes, most butterflies and moths); X0, where the male has a single unpaired X and the signal is the X-to-autosome ratio (grasshoppers, C. elegans); haplodiploidy, where ploidy itself decides and an unfertilised egg develops as a haploid male (ants, bees, wasps); and temperature- or environment-dependent determination with no sex chromosomes at all (most turtles, all crocodilians, Bonellia, clownfish). What varies is only the upstream input; the downstream gonad circuit -- a testis network on SOX9 and DMRT1 against an ovary network on WNT4, RSPO1 and FOXL2 -- is far more conserved.

Q: Deleting Foxl2 in an adult mouse ovary turns granulosa cells into Sertoli-like cells. What does that prove about gonadal sex?
A: That it is not a decision made once in the embryo and then stored: it is a state actively maintained for life. SRY, SOX9 and FOXL2 form a bistable latch with mutual repression, and SRY is only a momentary pulse on the set line. Two other consequences follow: the pulse must be large enough and early enough, since a weakened or delayed Sry allele gives ovotestes or XY females with the gene intact, and anything that trips the latch works, so SRY is one input rather than the mechanism.

Q: What physically silences the inactive X, and what is the visible end product?
A: XIST, a roughly 17 kb long non-coding RNA transcribed from the X-inactivation centre at Xq13 on the chromosome that is to be silenced. It coats that chromosome in cis and never leaves the chromosome that made it, recruiting SPEN and Polycomb, which lay down H3K27me3 and macroH2A, move the chromosome to a late-replicating compartment, and finally methylate promoter CpG islands to lock the state in. The condensed inactive X is visible down a microscope as the Barr body.

Q: X inactivation is random and then clonal. What does that make every female mammal, and what is the visible proof?
A: A mosaic of two cell populations expressing different X alleles: each cell in the early epiblast chooses independently and every descendant keeps that choice. The tortoiseshell cat is the proof, since the orange locus is X-linked, so a heterozygote is orange in patches descended from cells that inactivated the non-orange X and black in the rest, with calico adding autosomal white spotting. A tortoiseshell male is nearly always XXY, and the first cloned cat did not look like its nuclear donor because it drew its own independent mosaic from the same genome.

## Linkage, recombination and mapping

Q: Why is "recombinant" not a property of a gamete?
A: It is defined relative to the phase of the chromosomes that entered the meiosis. From a coupling (cis) parent carrying A-B and a-b, the gametes A b and a B are recombinant; from a repulsion (trans) parent carrying A-b and a-B, that same A b gamete is parental. The four gamete classes are identical in both cases and only the labels are opposite.

Q: Distinguish map distance d from recombination frequency r.
A: d, in Morgans, is the expected number of crossovers per gamete across the interval; r is the probability of an odd number of crossovers, because two crossovers put the flanking markers back where they started. They coincide only for small intervals: r is bounded above by 0.5 while d is unbounded.

Q: What does an observed recombination frequency of 0.5 tell you, and why must genetic maps be built from short intervals?
A: That the ruler has saturated and returned no information: two loci at opposite ends of chromosome 1 (about 280 cM) and two loci on different chromosomes give the identical observation. Every long genetic distance is therefore a sum of short intervals, each measured between markers close enough that multiple crossovers are rare, and then chained.

Q: In a three-point testcross, how do the two rarest classes reveal gene order?
A: They are the double-crossover classes, and a double crossover puts one exchange on each side of the middle marker, flipping that marker onto the other chromatid while leaving both flanks in their parental combination. So a DCO class is a parental class with exactly one locus changed, and that locus is the middle one. No amount of two-point data does this.

Q: Why do double crossovers count in both intervals, and how do you compute the coefficient of coincidence?
A: A DCO gamete experienced an exchange in region I and one in region II, so RF(I) = (SCO_I + DCO)/N and RF(II) = (SCO_II + DCO)/N; omitting them undercounts both distances and is the standard arithmetic error. The coefficient of coincidence is observed DCO divided by RF(I) x RF(II) x N, and interference is 1 minus that. It is also why a two-point outer distance falls short by exactly 2 x DCO/N.

Q: What do the Haldane and Kosambi mapping functions assume, and which is the better default?
A: Both solve dr/dd = 1 - 2 c(r) r for a choice of the coincidence coefficient c. Haldane sets c = 1 (no interference, Poisson crossovers), giving r = (1 - e^(-2d))/2. Kosambi sets c = 2r (interference decaying with distance), giving r = tanh(2d)/2. They are near-identical below about 10 cM, but above that Haldane inflates distances by crediting hidden double crossovers that interference actually prevented, so Kosambi is the better default.

Q: Why is 1 cM = 1 Mb a bad conversion to use at a particular locus?
A: It is a genome-wide average of roughly 1.2 cM/Mb, and it is locally wrong by orders of magnitude. About 80% of crossovers fall in under 15% of the sequence, in some 30,000-50,000 hotspots 1-2 kb wide positioned by PRDM9, while pericentromeric regions are nearly silent. Because repair of the break erodes PRDM9's own binding sites, hotspot positions are not even conserved between humans and chimpanzees. Use a published genetic map, not a multiplier.

Q: What does a LOD score of 3 mean, and why is it not the same as p < 0.001?
A: Z(theta) is the base-10 log of the likelihood of the data under linkage at theta versus under no linkage, so 3 means the data are 1,000 times more likely under linkage. Two loci picked at random are linked with prior odds of only about 1:50, so posterior odds come to about 20:1 and the false-positive rate is nearer 5%. LOD scores from independent families add, because log-likelihoods add.

Q: Linkage and linkage disequilibrium are not the same statement. What is the difference, and is either sufficient for the other?
A: Linkage is a property of two loci -- a distance along a chromosome, fixed for the species. LD is a property of allele combinations in a particular population, so it also encodes that population's history: admixture, drift and selection can generate strong LD between loci on different chromosomes, and two tightly linked loci sit at complete equilibrium if no founder haplotype ever coupled their alleles. Linkage is necessary for LD to persist, not sufficient for it to exist.

Q: What does moving from a pedigree to a population buy you, in mapping terms?
A: Resolution, because population history supplies millions of meioses instead of ten. Linkage analysis has long range and low resolution; LD has short range and high resolution, since only the alleles too close together for accumulated crossovers to have separated remain associated. That is why a genotyping array reading one variant per few kilobases can tag almost all common variation, which is the entire operating premise of GWAS.

## Pedigrees and human risk

Q: What is the single sharpest discriminator available in pedigree analysis?
A: An affected father with an X-linked dominant condition transmits to all of his daughters and none of his sons, because he gives every daughter his X and every son his Y. Autosomal dominance predicts half of each sex, so one affected father with k children gives a likelihood ratio of 2^k. Through mothers the two modes are indistinguishable.

Q: Why is "no male-to-male transmission was observed" usually worth nothing?
A: Because absence of a signature is evidence only if the signature had an opportunity to appear: count the affected fathers who had sons, and if the answer is zero the observation carries no information. Even when male-to-male transmission is observed, it excludes X-linkage only where the maternal carrier frequency is negligible, since with a common allele the son may simply have inherited it from a carrier mother.

Q: An affected child is born to two unaffected parents. Why is "autosomal recessive" a dangerous default?
A: A new dominant mutation produces exactly that pedigree: roughly 80% of achondroplasia arises de novo, essentially always on the paternally transmitted chromosome. Choosing wrongly misstates the parents' recurrence risk by about a hundredfold in one direction and the affected person's own offspring risk, which is 1/2, by about a hundredfold in the other.

Q: Derive the fraction of affected males who carry a new mutation for an X-linked recessive that is lethal in males, and say where the derivation breaks.
A: With N males and N females there are 3N X chromosomes; mutation adds copies on all of them at rate mu and selection destroys the qN copies that land in males, so at equilibrium q = 3mu and the de novo fraction is mu/3mu = 1/3 (Haldane, 1935). It assumes equal mutation rates in eggs and sperm, but about 80% of de novo mutations are paternal and a paternal mutation makes a carrier daughter rather than an affected son, so the sporadic fraction is nearer one in six.

Q: A mother of an isolated Duchenne case tests negative on blood for her son's DMD variant. Why is her recurrence risk not zero?
A: Germline mosaicism: the variant can have arisen in one of her primordial germ cells, so a clone of her oocytes carries it while no somatic tissue does, and blood is somatic tissue. Documented germline mosaicism runs at around 8% of families with an apparently de novo DMD event, and the pooled empirical recurrence risk for a subsequent male fetus is roughly 6%, rising to about 12% if he inherits the at-risk maternal haplotype.

Q: Why is the unaffected sibling of a person with an autosomal recessive condition a carrier with probability 2/3?
A: The four equally likely outcomes of a carrier x carrier mating are AA, Aa, aA and aa; observing that the sibling is unaffected deletes aa and renormalises over the remaining three, two of which are heterozygous. Dropping that conditioning step is the most commonly omitted move in recessive risk calculation, and it changes the final answer by nearly a factor of two.

Q: How do you compute the coefficient of inbreeding F by path counting, and why is the last factor of 1/2 not a meiosis?
A: F = sum over closed paths of (1/2)^n x (1 + F_A), where n counts every individual on the path including both parents and the common ancestor A. A path through n individuals contains n - 1 meioses, contributing (1/2)^(n-1); the remaining 1/2 is A's self-kinship, the probability that A sends the same one of its two alleles down both branches. Counting meioses alone makes F exactly twice too large.

Q: How does consanguinity change recessive disease risk, and why does the effect depend so strongly on allele frequency?
A: P(aa) = F q + (1 - F) q^2, so the identity-by-descent term is linear in q while the outbred term is quadratic and the relative increase is roughly F/q. For first cousins at F = 1/16 that is a 4.1-fold increase at q = 0.02 but 63-fold at q = 0.001. In counselling terms, first-cousin unions add about 1.7-2.8% to a population background of roughly 2-3% for a significant congenital anomaly.

Q: Why do Prader-Willi and Angelman syndromes defeat the five-mode pedigree sieve?
A: Both arise from the same region, 15q11.2-q13, but Prader-Willi follows loss of the paternal contribution and Angelman loss of the maternal one, so inheritance depends on the sex of the transmitting parent, which the sieve has no slot for. Uniparental disomy produces either syndrome with no deletion at all, which is why karyotype-normal and sequence-normal cases exist.

Q: In the worked Duchenne example the consultand's carrier risk falls from 1/2 to about 0.6%. Where was the work done, and what is the general lesson?
A: Three unaffected sons, which are free observational data requiring no test, took 50% to 11%; a negative assay with 95% sensitivity took 11% to 1/161, about 0.62%, and the risk to a next son is half that, 1/322 or about 0.31%. Ask about unaffected relatives before ordering anything, and remember that no negative result reaches zero: germline mosaicism, assay sensitivity and a possibly wrong mode assignment set a floor.

Q: What is the transmission signature of the fifth pedigree mode, mitochondrial inheritance, and what is the discriminator against everything that mimics it?
A: Mitochondria and their roughly 16.6 kb circular genome of 37 genes come from the oocyte and sperm contribute essentially none, so transmission is strictly maternal: an affected mother's children are all at risk, of both sexes, and an affected father transmits to nobody. That is stricter than X-linkage, which at least passes from father to daughter. Imprinted loci, X-linkage in a small pedigree and shared maternal environment all mimic maternal transmission, so the discriminator is that mitochondrial inheritance puts all of an affected woman's children at risk, not half.

Q: Why is severity so erratic among the children of one woman carrying a pathogenic mtDNA variant?
A: Heteroplasmy plus a germline bottleneck. A cell holds hundreds to thousands of mtDNA molecules and the pathogenic variant occupies some fraction of them, with no phenotype below a tissue-dependent threshold that is often 60-90%. The fraction transmitted varies wildly between siblings because the bottleneck samples only a small number of molecules into each oocyte, so mitochondrial pedigrees look like a dominant condition with drastic variable expressivity down one maternal line, and recurrence risk is essentially unpredictable.

Q: Anticipation was dismissed for decades as an artefact and then given a mechanism. Which explanation is right?
A: Both, at once. Ascertaining through a severely affected child and then looking backwards at a parent who had to be well enough to reproduce manufactures anticipation out of nothing, and that objection was correct. Unstable repeat expansion then supplied a real physical cause: the repeat tract changes length during transmission and length predicts onset, so a parent whose own repeat sits in the normal-to-intermediate range can produce a child in the pathogenic range in a single meiosis. The phenomenon is real and the bias inflates it, and molecular sizing is what turns an appearance into a finding.

Q: Why does the sex of the transmitting parent change the recurrence risk in a repeat-expansion disorder?
A: Because expansion is parent-of-origin biased and the direction differs by locus. The HTT CAG tract (normal at or below 26, pathogenic at 40 or more) expands most through the father, which is why juvenile-onset Huntington disease is almost always paternally transmitted; the DMPK CTG tract expands maternally for the congenital form of myotonic dystrophy; and an FMR1 CGG premutation of 55-200 repeats converts to a full mutation only when passed through a woman.

Q: What is the Sherman paradox, and why is it impossible under classical X-linked recessive rules?
A: In fragile X, a phenotypically normal transmitting male's grandsons are at higher risk than his own brothers, which no classical X-linked recessive model allows, since risk should not increase as you move away from the carrier line. It is explained entirely by repeat dynamics: he carries an FMR1 premutation that cannot expand to a full mutation when he transmits it, so all his daughters receive the premutation intact, and it expands only when they pass it on.
