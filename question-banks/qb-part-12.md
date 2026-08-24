# Question bank — Part 12: Applications and ethics

Covers [Ch 57-58](../part-12-applications-and-ethics/57-genomics-in-practice.md).

Convert to Anki: `python reference/to_anki.py question-banks/ --out anki-import.tsv`

## The likelihood-ratio frame

Q: What does a genomic test actually return about the individual in front of you?
A: Not a fact, but a likelihood ratio: how much more probable this observation is if the state holds than if it does not. The answer you want is that ratio multiplied by a prior the assay cannot see.

Q: Why does the same genomic technology look miraculous in some settings and over-promising in others?
A: Because the prior differs, not the assay. Where the prior is high -- a critically ill infant, a suspected outbreak, a family with a known pathogenic variant -- modest evidence is decisive; where the prior is low, as in population screening for a rare condition, even excellent evidence leaves deep uncertainty.

Q: A screening test is advertised as "over 99% accurate". Why does that not mean a positive result is right 99% of the time?
A: Accuracy figures are conditional on disease status; the quantity a patient wants is conditional on the result, and it depends on prevalence. A 99.7%-sensitive, 99.96%-specific test has a positive predictive value of about 71% at a prevalence of 1 in 1,000, and about 96% at 1 in 100 -- identical laboratory, 25 points of difference.

Q: For a rare condition, which single test parameter dominates positive predictive value, and what is the approximation?
A: Specificity, through the false-positive rate. When the prior is much smaller than FPR divided by sensitivity, PPV is approximately prior x sensitivity / FPR: linear in prevalence, inversely proportional to the false-positive rate, and nearly indifferent to sensitivity.

Q: A 22q11.2 cfDNA screen has sensitivity 0.978 and a false-positive rate of 0.0076 against a birth prevalence of 1 in 4,000. What is the PPV, and why is it so much worse than a trisomy 21 screen?
A: About 3.1%, so roughly 1 positive in 32 is real. Sensitivity is nearly as high as for trisomy 21 (97.8% against 99.7%), but the prior is 4 times lower and the false-positive rate 19 times higher, and those factors multiply to a 76-fold difference in posterior odds.

## Rare-disease diagnosis and rapid genomics

Q: How did sequencing invert the search that used to produce the diagnostic odyssey?
A: Instead of asking "does this patient have disease X?" one gene at a time, sequence everything and ask which of the roughly 19,442 protein-coding genes carries a variant that explains this phenotype.

Q: Why is trio sequencing the largest single design improvement in rare-disease diagnosis?
A: It identifies de novo variants directly rather than inferring them, and de novo dominant variants are the commonest cause of severe paediatric disease. It also collapses the candidate list, because a variant carried by a healthy parent is rarely causing that child's severe early-onset condition.

Q: What is the realistic diagnostic yield of exome or genome sequencing in rare paediatric disease, and what drives it most?
A: About 30-40%, with genome modestly ahead of exome (roughly 31% against 23% in within-cohort meta-analyses). Yield depends far more on who was selected than on the platform: a well-phenotyped syndromic paediatric cohort exceeds 50%, while an adult neuropathy cohort may not reach 15%.

Q: Why is a negative genome sequence not a null result?
A: It means no causal variant was identified with current knowledge, methods and coverage -- not that there is no genetic cause. It excludes a large class of explanations and deposits a reusable dataset, and reanalysis after 12-24 months adds several points of yield with no new sample, because what changed was the literature, not the patient.

Q: In rapid genomic diagnosis for critically ill infants, what is the outcome measure that matters, and what are the published figures?
A: Change in management rather than diagnosis: roughly three-quarters of diagnosed infants had care altered. Turnaround runs from a median around 7 days to demonstration cases under 24 hours, with yield around 35-40% because NICU admission with an unexplained presentation is itself a strong prior. Redirection to palliative care on a now-certain lethal diagnosis is a real benefit routinely miscounted as a failure.

## Screening programmes and reproductive genomics

Q: NIPT is commonly described as testing the fetus. What does it actually measure?
A: Cell-free DNA fragments in maternal plasma, roughly nucleosome-length at 150-200 bp. The non-maternal portion comes from apoptotic placental trophoblast, so the assay measures the placenta. Confined placental mosaicism is therefore a true measurement of the wrong tissue.

Q: Why do laboratories decline to call NIPT below about 4% fetal fraction, and why is a "no-call" not a neutral result?
A: The mapped fragments needed scale as 1 over fetal fraction squared: about 4.2 x 10^5 fragments at f = 0.10 for z = 4, but about 2.6 x 10^6 at f = 0.04, and by f = 0.02 GC bias and library variance dominate counting noise. Fetal fraction also falls with maternal weight and is lower in trisomy 13 and 18 because those placentas are smaller, so no-calls are enriched for aneuploidy.

Q: What are the biological, non-statistical sources of a false-positive NIPT result, and how is a positive confirmed?
A: Confined placental mosaicism, a vanishing twin whose demised placenta still sheds cfDNA, a maternal CNV or age-related mosaicism, and occult maternal malignancy shedding aneuploid tumour cfDNA. Confirmation needs a diagnostic procedure: chorionic villus sampling still samples placenta so confined placental mosaicism survives into it, whereas amniocentesis samples fetal-origin amniocytes and does not.

Q: Why does replacing biochemical newborn screening with sequencing break the Wilson-Jungner logic the programme rests on?
A: Biochemistry measures the disease process, while sequencing measures a genotype whose penetrance was historically estimated only from families ascertained because someone was affected. Where unselected-population estimates now exist, from large biobanks, penetrance comes out far lower than the clinical literature implies -- and for most newborn-panel genes no such estimate exists at all. Screening a million well babies therefore labels some number with a condition they will never develop.

Q: Why does PGT-M genotype linked markers rather than the pathogenic variant itself?
A: Whole-genome amplification of a five-cell trophectoderm biopsy causes allele dropout. Calling a haplotype from linked markers is robust to losing any single locus, which is why the family's phase must be established in advance.

Q: Why is selecting embryos on polygenic scores expected to deliver so little?
A: The variance available is within-family, a fraction of population variance, and you choose among a handful of viable embryos, so published estimates of expected gain are on the order of a few centimetres of height. The weights are also estimated between families and applied within one, so stratification, indirect genetic effects and assortative-mating inflation shrink or cancel, and pleiotropy moves correlated traits in directions never measured for that embryo.

Q: Ancestry-targeted carrier screening panels have largely been abandoned. What was the design error?
A: Panels offered specific founder variants to specific self-identified groups, which fails because self-reported ancestry is a poor proxy for which founder variants someone actually carries, and fails completely for people of admixed background. Guidance moved to pan-ethnic panels defined by carrier-frequency thresholds: genetic ancestry is continuous and measurable, the social categories people report are a different object, and building a clinical protocol on the second has a predictable failure mode.

Q: Why is PGT-A genuinely contested in a way that PGT-M is not?
A: PGT-A calls copy number from low-pass sequencing of the same five-cell biopsy, but that biopsy samples trophectoderm rather than inner cell mass, embryos reported as mosaic have produced healthy children, and randomised evidence for improved live birth per cycle started is equivocal.

Q: What is the expressivist objection to prenatal screening, and which part of it survives even if you reject its conclusion?
A: The objection is that a societal programme of screening for a condition sends a message about the value of existing lives with it, and that testing selects against people rather than conditions. What survives is its empirical point: people living with many screened-for conditions report quality of life far higher than clinicians and prospective parents predict -- the disability paradox -- so the information these decisions rest on is biased in a known direction, and fixing that is compatible with any position on the ethics.

## Pharmacogenomics

Q: What are the three mechanisms by which a pharmacogenomic variant causes harm, and how do their failure modes differ?
A: Prodrug activation, where loss of function gives no drug effect and gain of function gives overdose; active-drug clearance, where loss of function gives accumulation and toxicity; and immune recognition, which is not metabolism at all -- a specific HLA allele presents the drug or a drug-modified peptide to T cells.

Q: A CYP2D6 poor metaboliser and an ultrarapid metaboliser are both prescribed codeine. What happens to each?
A: Codeine is a prodrug that CYP2D6 O-demethylates to morphine. The poor metaboliser converts little and gets no analgesia; the ultrarapid metaboliser, commonly through gene duplication, generates morphine fast enough to cause respiratory depression, which killed children after tonsillectomy and breastfed infants of ultrarapid mothers and drove the contraindications.

Q: Contrast DPYD with CYP2D6 to show why variation in a metabolising enzyme produces opposite failures.
A: DPYD catabolises the active drug 5-fluorouracil, so loss of function causes accumulation and severe, sometimes fatal toxicity from a first standard dose -- which is why the EMA has recommended pre-treatment testing since 2020. CYP2D6 activates a prodrug, so loss of function causes lack of effect instead. The direction of the failure depends on whether the enzyme activates or clears the drug.

Q: Why are pharmacogenomic allele definitions haplotypes rather than single variants, and why is CYP2D6 genuinely hard to genotype?
A: The star-allele system names combinations of variants (star-1 is reference, CYP2D6 star-4 is a splice-disrupting haplotype); a diplotype maps to an activity score and the score to a phenotype class. CYP2D6 carries whole-gene deletions, duplications up to a dozen copies, and hybrid genes with the neighbouring pseudogene CYP2D7, so it needs copy-number-aware calling and long reads.

Q: Pharmacogenomics is often said to have failed to translate because the science was weak. What actually caused the twenty-year lag?
A: Nothing biological -- the mechanisms are among the best established in the field. It failed on evidence-hierarchy mismatch (pharmacokinetic and observational data against payers wanting randomised trials with hard endpoints), workflow and EHR integration, results whose interpretation mutates while the genotype is fixed, patchy reimbursement, and unrepresentative allele panels. And genotype still is not phenotype, because a strong inhibitor turns a normal metaboliser into a poor one -- phenoconversion.

Q: What happens when a CYP2C19 poor metaboliser is prescribed clopidogrel, and what does the genotype tell you to do?
A: Clopidogrel is a prodrug that CYP2C19 activates, so a poor metaboliser makes little active metabolite, the antiplatelet effect fails and stent thrombosis risk rises. The action is to switch drug rather than adjust dose, because prasugrel and ticagrelor are not CYP2C19-dependent.

Q: Why do TPMT or NUDT15 loss-of-function variants make a standard thiopurine dose dangerous, and what does NUDT15 add?
A: Both enzymes inactivate the active metabolites of azathioprine and mercaptopurine, so loss of function causes accumulation and life-threatening myelosuppression at standard doses, and poor metabolisers need roughly a tenth of the dose. NUDT15 carries the representation lesson: its variants dominate thiopurine risk in East and South Asian populations and were characterised long after TPMT, so a panel built on common European alleles has genuinely lower sensitivity there.

Q: HLA-B star-57:01 and abacavir is the best-evidenced pharmacogenomic pair. What makes it unlike the CYP examples?
A: The mechanism is immune rather than metabolic -- the HLA allele presents the drug or a drug-modified peptide to T cells, and carriers develop a hypersensitivity reaction that can be fatal on re-challenge. It also rests on prospective randomised evidence rather than pharmacokinetic and observational data, which is why screening is standard of care worldwide; HLA-B star-15:02 with carbamazepine is the same mechanism.

Q: Contrast pre-emptive with reactive pharmacogenomic testing, and say what CPIC contributes.
A: Reactive testing orders the genotype when the prescription is written and pays for it in days of delay; pre-emptive testing genotypes a panel once, stores it, and fires decision support at the moment of prescribing. Pre-emptive wins on arithmetic, because most people are eventually prescribed a drug with pharmacogenomic guidance and a genotype never expires. CPIC supplies what makes that usable: not an association claim but a diplotype-to-action artefact in a form that can be encoded.

## Pathogen genomics and metagenomics

Q: What is the underrated use of pathogen sequencing in a suspected hospital outbreak?
A: The negative one. Isolates from a genuine recent chain differ by a handful of substitutions while isolates merely sharing a species differ by hundreds, so phylogenetically unrelated isolates prove there was never an outbreak and the response can be stood down.

Q: Why does a pathogen phylogeny not show who infected whom?
A: Within-host diversity means a donor transmits a sample of their own population; unsampled intermediates make A to B look direct when it was A to X to B; and pathogen coalescence predates the transmission events. Genomic evidence bounds a transmission hypothesis rather than adjudicating one.

Q: Why is predicting resistance from a mutation catalogue safer than predicting susceptibility?
A: A catalogue encodes only what has been observed, so absence of a known resistance mutation is not evidence of absence of an unknown one. The WHO tuberculosis catalogue shows this: the first edition listed zero variants associated with bedaquiline resistance and the second (2023, built from more than 52,000 isolates across 67 countries, listing over 30,000 variants for 13 drugs) lists 86. The biology did not change; the evidence base caught up.

Q: Why are relative abundances from 16S or shotgun sequencing statistically treacherous?
A: They sum to one, so the data live on a simplex rather than in ordinary coordinate space. If one taxon blooms, every other proportion falls whether or not anything happened to it, so pairwise correlations are spurious by construction and differential-abundance tests have inflated false-discovery rates. Log-ratio transforms help; only absolute quantification by spike-ins, flow cytometry or total-load qPCR is a clean fix.

Q: Thousands of microbiome-disease associations exist and very few causal demonstrations. What confounds the associations, and what supports causation?
A: Confounders include diet, medication (metformin and proton-pump inhibitors have among the largest single effects on gut composition) and stool consistency and transit time; reverse causation is plausible because illness changes what you eat and what your gut does. Causal support comes from gnotobiotic-animal transfer, faecal microbiota transplant for recurrent Clostridioides difficile infection, and Mendelian randomisation, which is instrument-poor because host genotype explains little microbiome variance.

Q: What does wastewater surveillance change about the unit of sampling, and what does it give up?
A: It moves the unit from patient to population: one influent sample integrates a whole sewershed, removing test-seeking bias and capturing asymptomatic infection with no clinical encounter, and sequencing the mixture recovers lineage proportions by constrained least squares on allele frequencies at lineage-defining sites. What it gives up is a denominator -- shedding varies enormously between people, nucleic acid decays in transit, and sewersheds rarely match administrative boundaries.

Q: More than fifteen million SARS-CoV-2 genomes were deposited within a few years. What did that expose about global genomic surveillance?
A: Sequencing capacity was distributed extremely unevenly, so the "global" phylogeny was a biased sample of who could afford to sequence. Genomic surveillance measures the surveillance system as much as it measures the pathogen.

## Prediction, portability and study design

Q: What does genomic selection do differently from marker-assisted selection?
A: It drops the mapping step. Genotype a reference population with phenotypes and markers, fit all markers simultaneously with shrinkage -- ridge regression, equivalently a mixed model on a genomic relationship matrix, or a Bayesian variable-selection prior -- and predict a genomic estimated breeding value for candidates never phenotyped.

Q: Genomic selection roughly doubled annual genetic gain in US dairy cattle. Which terms of the breeder's equation changed?
A: In delta-G = i x r x sigma_A / L it did not raise heritability. It raised r, the accuracy of an estimated breeding value in a young unphenotyped animal; it allowed higher intensity i among candidates now cheap to screen; and it cut the generation interval L from roughly seven years to under two and a half by genotyping bulls at birth instead of waiting for daughters to be milked.

Q: Genomic prediction works spectacularly in cattle and poorly across human populations. Is that because human genetics is more complex?
A: No -- the estimator is identical and only the design differs. In breeding, training and target populations match and the reference is refreshed annually, LD is long and consistent under small effective population size, environments are designed and measured, phenotypes are precise and repeated, and the prediction is a breeding value averaged over hundreds of progeny with a closed feedback loop.

Q: Name the mechanical causes of polygenic score portability failure across ancestries.
A: GWAS finds a tag SNP rather than the causal variant and LD between tag and causal variant differs between populations; allele frequencies differ so variance explained differs; effect estimates absorb stratification and indirect genetic effects; and environments and their interactions differ. The asymmetry is in the data, not in the people -- train a score in an African-ancestry cohort of equivalent size and it transfers poorly the other way.

## Forensics, ancient DNA and consumer genomics

Q: A complete single-source STR profile gives a random match probability of 10^-20. Why does that not mean a 10^-20 chance of innocence?
A: That swaps the conditionals -- the prosecutor's fallacy. Posterior odds = prior odds x likelihood ratio, and the likelihood ratio does not supply the prior. The defence hypothesis must also name a plausible alternative source, because a full sibling's match probability is many orders of magnitude higher than an unrelated person's.

Q: A partial 5-locus profile with random match probability 10^-6 is trawled against a database of 2 x 10^7 profiles and returns one hit. What should you conclude?
A: About 20 coincidental matches were expected (2 x 10^7 x 10^-6) and one was found, so the arithmetically correct LR of 10^6 is nowhere near identification against prior odds appropriate to "one of twenty million people, no other evidence". The same profile matched to a suspect identified independently, putting a few hundred people in the frame, would give posterior odds around 10^4. The genetic evidence did not change; the prior did.

Q: Why is DNA mixture interpretation not objective?
A: Deconvolution requires jointly estimating how many contributors there were, in what proportions, which peaks are true alleles rather than PCR stutter, which alleles dropped out below threshold, and which are drop-in contamination. The assumed contributor number is an input that materially changes the output, different probabilistic genotyping packages on identical data have produced LRs differing by orders of magnitude, and source-code disclosure has been repeatedly litigated.

Q: How does forensic investigative genetic genealogy work, and why can you not opt out of it?
A: A dense SNP profile from the crime scene is uploaded to a consumer genealogy database, matched on identity-by-descent segments to third-to-fifth cousins, and closed with birth, marriage and census records. Because IBD sharing extends to distant cousins, a database holding around 2% of a population returns a third-cousin-or-closer match for most of it, so your relatives' choices set your exposure and the exposing data is not yours to withdraw.

Q: How do you authenticate a 40,000-year-old human sequence against modern contamination, and what would UDG treatment have destroyed?
A: Show the damage profile: cytosine deaminates to uracil in single-stranded overhangs and is read as thymine, giving elevated C->T at 5' ends and G->A at 3' ends that decay roughly exponentially inward, plus the short fragments that depurination produces. UDG excises uracils, removing the errors and with them the evidence, which is why libraries are often built both ways or with partial UDG that leaves terminal damage intact.

Q: Consumer genetic tests are widely believed to sequence your genome. What do they actually do, and what follows?
A: They genotype an array of roughly 600,000 to 1,000,000 pre-selected positions chosen to tag common variation via LD. So they cannot see what is not on the chip, array calling fails for singletons that land in no cluster -- about 40% of variants in consumer raw-data files sent for clinical confirmation were false positives -- and genotyping the three Ashkenazi founder variants across BRCA1 and BRCA2, out of thousands of known pathogenic variants in those genes, gives a "negative" that is close to uninformative for someone with a family history: coverage of a gene is not coverage of a condition.

Q: Why does forensic profiling still use STRs rather than SNPs, and how many core loci does CODIS use?
A: Three reasons that still hold: high polymorphism, so each locus contributes large exclusion power; short amplicons, which survive degraded samples; and thirty years of legacy database. CODIS expanded from 13 to 20 core loci in 2017.

Q: How is a random match probability computed from an STR profile, and why is a theta correction applied?
A: Per-locus genotype frequencies under Hardy-Weinberg, multiplied across loci under approximate linkage equilibrium. The theta (F_ST) correction is applied because a suspect and the true source are likelier to share a subpopulation than the naive product assumes, so an uncorrected product overstates how rare the profile is.

Q: How does familial searching differ from forensic investigative genetic genealogy, and what is its distributional consequence?
A: Familial searching looks for a near-match inside an offender database, implying a first-degree relative, whereas FIGG uploads a dense SNP profile to a consumer genealogy database and reaches third-to-fifth cousins. Offender databases over-represent some communities, so familial searching extends that over-representation to relatives who were never arrested.

## Privacy, consent and group harms

Q: How many common SNPs make a person unique, and why does stripping names not de-identify a genotype file?
A: At minor allele frequency 0.5 two unrelated people match at a SNP with probability 0.375, so uniqueness among 8 billion people needs ln(1.25 x 10^-10) / ln(0.375) = 23.3, i.e. 24 SNPs; at a typical MAF of 0.2 the per-SNP match probability is 0.514 and you need 35. A de-identified genotype file is therefore a file of unique keys, and identifiability is a property of the join with the rest of the world rather than of the file.

Q: Why is releasing only aggregate allele frequencies unsafe?
A: Given a target's genotypes and a reference panel, a likelihood-ratio test accumulated across hundreds of thousands of variants detects whether the target was in the case cohort -- the Homer et al. 2008 result, after which NIH withdrew aggregate GWAS frequencies from open access. Each variant's contribution is individually invisible and the sum is decisive, so there is no threshold of "aggregate enough".

Q: Give the relationship between database coverage and how many people are exposed through relatives, and say why it breaks consent rather than straining it.
A: P(findable) = 1 - (1 - c)^N, with c the fraction of the population in the database and N an effective number of relatives. Read it for the shape, not as a prediction: no single N reproduces Erlich's published results -- the observed ~60% hit rate against a 1.28M-record database (~0.9% coverage) needs N about 107, while the projected >99% findability at 2% coverage needs N about 228. The functional form is wrong, not just the parameter, because relatives are not independent draws into a database and detectability falls off with relationship. What survives is that coverage sits in the exponent, so exposure saturates fast. It breaks consent rather than straining it because the people exposed never chose to be in any database.

Q: Encryption is often proposed as the fix for genomic privacy. What can it and cannot do?
A: Homomorphic encryption and multi-party computation protect data in transit and in use, so the compute party sees no plaintext -- but they do not protect the result. If the output is a genotype or a score derived from one, it identifies exactly as before. There is no cryptographic fix for a result that is itself identifying, which is why governance is the only layer at which a large class of these problems exists.

Q: What is the honest description of broad consent, and where does the ethical weight move?
A: You are not consenting to a study, you are consenting to a committee: a described domain of future research governed by a named oversight body. Legitimacy transfers to the governance, so the rigour of the data access committee and whose interests it represents carry the weight the consent form used to carry.

Q: What kind of harm does the Havasupai case illustrate, and what is the constructive response?
A: Blood collected from about 400 tribal members for a diabetes study was reused for schizophrenia, inbreeding and migration research, including a conclusion about Bering Strait origins that contradicted the tribe's own account. No individual was re-identified or medically harmed: the injury fell on the group's standing and control over what is said about it, which a framework whose only unit is the individual cannot represent. CARE -- Collective benefit, Authority to control, Responsibility, Ethics -- supplies the axis FAIR leaves out, namely who benefits and who decides.

Q: What do controlled access and federated analysis each protect, and what do they leave exposed?
A: Controlled access (dbGaP, EGA, trusted research environments) governs who gets data, under agreement and with an audit log, but it protects nothing mathematically and fails silently if the agreement is ignored. Federated analysis sends code to data so raw genotypes never leave the custodian, but the outputs still leave -- frequencies, effect sizes, model weights -- and those are exactly what membership inference consumes.

Q: Why does differential privacy work badly at genomics scale?
A: A GWAS releases per-variant statistics across millions of variants, so the privacy budget splits across all of them and the noise needed at a per-query epsilon small enough to compose is comparable to the signal. Standard composition also assumes independent queries, whereas LD lets an adversary recover a noised genotype by averaging over its LD neighbours -- correlation between queries helps the attacker and not the accounting. DP works for coarse releases such as cohort counts and beacon responses.

Q: 23andMe filed for Chapter 11 in March 2025. What does that establish about the standing of a privacy policy?
A: That a privacy policy is a contract a company can amend and a court can transfer. A database of over 15 million customers, roughly 80% of whom had consented to research use, is an asset, and bankruptcy exists to convert assets into creditor payments; the buyer was TTAM Research Institute, a non-profit, at USD 305 million closing July 2025 and committing to honour the existing policies. That was a good outcome, but it turned on who won an auction rather than on legal structure -- consent given to one entity is not consent given to its acquirer.

Q: Why is a genomic data breach different in kind from a password breach?
A: You can reissue a password; you cannot reissue a genome, and you cannot reissue your brother's. The 2023 credential-stuffing incident at 23andMe exposed millions of profiles through the relative-matching feature, which was itself the amplifier, so the scale of exposure was set by a product decision rather than by a cipher.

Q: GEDmatch once switched every user to opt out of law-enforcement matching. What happened, and what does it show?
A: Fewer than one in five opted back in, while among new users whose default is opt-in about three in four stay. Same population, same question, opposite answers: what is being called consent here is mostly a default, which makes the default itself the ethical decision.

Q: A platform promises users they can opt out of law-enforcement searching. How much is that promise worth?
A: A 2019 Florida warrant authorised searching an entire genealogy database over its own opt-out settings -- the clearest available statement that platform privacy promises are not enforceable against a court. The surrounding governance is thin: the US Department of Justice interim policy is policy rather than law and binds only federally funded work, Maryland's 2021 statute adds judicial authorisation and laboratory licensing, and most jurisdictions have neither.

Q: What does the ACMG secondary-findings recommendation require, and what is the strongest objection to it?
A: That a laboratory sequencing an exome for one indication also actively examines a curated list of medically actionable genes -- 56 in 2013, more than 80 across later revisions -- and reports what it finds, with an opt-out. The objection is that this converts a diagnostic test into an unrequested screening programme, on a committee's list, in people with no family history, where positive predictive value is far lower than a literature ascertained in affected families suggests.

Q: Why is declining a predictive Huntington test not irrationality to be talked out of?
A: The result is unactionable, irreversible, and interacts with insurance underwriting exactly as the discrimination argument describes, which is why uptake of predictive HD testing has stayed low for decades. The right not to know is a defensible position, and it is what secondary findings collide with, because there the laboratory has already observed the thing you chose not to ask about.

## Ancestry, race, equity and governance

Q: How skewed is GWAS participation, and what is the first mechanical consequence for a patient?
A: As of April 2025 roughly 87% of GWAS participants were of European genetic ancestry, a group comprising about 9% of the world's population, while African-ancestry participants were about 1% of the total against 15.5% of the world. Variant interpretation degrades first: Manrai et al. (2016) found variants reported as pathogenic for hypertrophic cardiomyopathy were benign polymorphisms common in African-ancestry populations. The failure was in the reference panel, not the assay or the reasoning.

Q: A test returns a higher VUS rate in an under-represented group. What does that tell you?
A: That we know less about that group, not that its genomes are more ambiguous. A variant of uncertain significance is a statement about the evidence, not about the variant, and evidence density tracks who has been sequenced.

Q: Give an example showing that under-representation costs discoveries, not just accuracy.
A: PCSK9 loss of function, which produced a major class of cholesterol-lowering drugs, was established through nonsense alleles carried by a few percent of African-ancestry participants and essentially absent in Europeans. The one common European loss-of-function variant gives a much weaker signal, so a European-only design would have found far less, far later.

Q: Lewontin found about 85% of human genetic variation is within populations; Edwards objected that many loci jointly classify people almost perfectly. Who is right?
A: Both, because they answer different questions. Individuals can be assigned to ancestry clusters accurately given enough markers, which is what makes ancestry inference and stratification correction work, and most variation is still shared within populations. Neither result licenses treating the clusters as discrete natural kinds.

Q: Why is the apparent discreteness of ancestry clusters a property of the sampling design rather than of the species?
A: In ADMIXTURE and its relatives, K is a parameter you choose, not a quantity the data discovers, and clustering is what you asked for. Sample three continents and you recover three clusters; sample densely along a transect and you recover a cline, because allele frequencies change gradually with distance under migration and isolation by distance.

Q: Distinguish genetic ancestry from race operationally, and say why a consumer ancestry percentage changes over time.
A: Genetic ancestry is a continuous, multidimensional, measurable statement about which reference populations your segments most resemble, and it varies within an individual across the genome. Race is a social classification whose boundaries were drawn by historical processes, have changed within living memory and differ between countries. An ancestry percentage is an estimate relative to a chosen reference panel and an implied time depth, so it moves when the panel is updated -- it was never the fact users took it for.

Q: A trait differs between two socially defined groups and is highly heritable within each. Why does it not follow that the difference is genetic?
A: Heritability is computed from within-group variance and the between-group mean never enters its definition, so no value of h^2 constrains a between-group cause -- the two-pots argument. The groups were also not randomised into their environments, so the confound is comprehensive and correlated with the grouping by construction rather than a residual to adjust away.

Q: Someone proposes comparing polygenic score means across ancestries to settle a between-group question. What does that comparison actually measure?
A: The score's own portability failure, confounded with residual stratification, because stratification and trait can share the same geographic structure. LD and allele-frequency differences bias the weights systematically, and between-family GWAS estimates carry indirect genetic and assortative-mating components that do not transfer. No current method separates the portability failure from any putative genetic difference.

Q: What is the most direct empirical test of a genetic explanation for a group difference, and what has it found?
A: In an admixed population individual ancestry proportion varies continuously and is measurable, so a genetic explanation predicts the trait tracks individual ancestry proportion within that population -- a comparison largely free of the between-group confound. The admixture studies of cognitive test scores run to date (Scarr et al. 1977, the largest for decades) do not find the predicted relationship, but note their real limit: predating genomic ancestry estimation, they worked from blood-group and serum-protein loci and could not produce usable individual admixture estimates at all, Scarr et al. substituting a rank-order odds coefficient. The honest statement is that the one direct test available has not supported the hypothesis, not that it has precisely excluded it. Twentieth-century score gains also exceeded the gaps at issue over intervals far too short for allele frequencies to change.

Q: Race-adjusted clinical equations are often defended as correcting for biology. What were they actually doing?
A: Proxying for an unmeasured variable. The eGFR race coefficient raised estimated kidney function for patients identified as Black, making measured disease look milder and delaying referral and transplant listing, until the 2021 CKD-EPI race-free equations removed it; spirometry carried an analogous correction until the ATS moved to race-neutral interpretation in 2023. If the real predictor is a genotype measure the genotype, if it is ancestry estimate ancestry continuously, and if it is exposure measure the exposure.

Q: Which gaps in GINA matter most, and how have other jurisdictions differed?
A: GINA does not cover life, disability or long-term-care insurance, does not apply to employers with fewer than 15 staff, and protects genetic information rather than people whose disease has already manifested. The UK Code on Genetic Testing and Insurance (2018) is a voluntary agreement barring predictive results except Huntington disease on life cover above GBP 500,000; Canada criminalised the demand in 2017; Australia's ban passed in April 2026 and commences October 2026.

Q: Documented genetic discrimination is far rarer than fear of it. Why is that not an argument that protection is unnecessary?
A: Because the low observed rate is partly produced by people declining to be tested: they forgo surveillance that would extend their lives and decline research participation, degrading the evidence base for everyone. Among people at risk for Huntington disease, on the order of 85-90% report concern and roughly 40% report an experience they classify as discrimination.

Q: State the actuarial case for letting insurers use genetic test results, and the normative question underneath it.
A: If applicants know their genotype and insurers may not ask, high-risk people buy more cover at pooled prices and low-risk people buy less -- adverse selection, which raises prices and can unravel a voluntary market -- so a ban is not neutral fairness but an unstated transfer from low-risk to high-risk purchasers. Measured genetic adverse selection has been consistently small, and beneath the empirics sits a choice no dataset settles: whether insurance pools risk or sorts it.

Q: Why is the best-developed genome-editing therapy not yet, operationally, a cure for sickle cell disease?
A: Its US list price is around USD 2.2 million and delivery requires apheresis, myeloablative conditioning and a transplant unit, while the burden is concentrated overwhelmingly in sub-Saharan Africa and India. A therapy whose delivery requirements exceed the health-system capacity of the places where the disease is concentrated is not yet functioning as a cure for that disease.

Q: Which objections to heritable genome editing does better technique fail to answer, and why is prohibition in 70-plus countries not settlement?
A: The subject cannot consent and neither can any descendant, with no withdrawal mechanism ever; a novel allele has no population-scale evidence base even where the natural allele does; mosaicism forces you to genotype cells you discard and infer about cells you keep; and an error propagates into a lineage rather than being bounded by one lifespan. Prohibition is national while the technology is portable, so enforcement, not consensus, is the open problem.

Q: Why is a gene drive a different consent problem from a clinical trial?
A: Consent here is geographic and the technology is not: a drive does not stop at a border, can introgress into hybridising species, and is not recallable. There is no consenting party for an ecosystem, and one state's refusal does not bind the mosquitoes. No gene-drive organism had been released into the wild as of August 2026.

Q: The Myriad ruling ended patents on isolated BRCA1 and BRCA2 DNA. What did it not change, and what is the general lesson?
A: Myriad kept the largest collection of BRCA variant observations paired with clinical outcomes and did not share it: the patent went away, the interpretive moat did not. In genomics the durable monopoly is on interpretation rather than sequence, which is why the effective response was collective deposition into ClinVar and the ClinGen expert panels -- the scarce resource is annotated observations.

Q: Why is ethics not something you do after the analysis?
A: Defaults, retention windows, query rate limits, whether relative-matching exists at all, whose reference panel is used and which ancestry labels get hard-coded into a schema are decided at design time, years before any statute reaches them. Law is jurisdictional, slow and reactive while the technology is portable and fast, so technical design choices are the operative policy for most of this data.
