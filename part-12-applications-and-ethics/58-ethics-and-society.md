# 58 — Ethics, privacy and society

> **Before this:** [Ch 57 — Genomics in practice](57-genomics-in-practice.md) ·
> [Ch 53 — Polygenic scores](../part-11-human-and-statistical-genomics/53-polygenic-scores.md) ·
> [Ch 31 — Heritability and response to selection](../part-06-quantitative-genetics/31-heritability-and-selection.md) ·
> **Time:** ~55 min

This is the last chapter and it is not an appendix. Every problem in it is a real problem with
real trade-offs, on which competent and decent people disagree. Where the disagreement is
genuine I say so and give both sides their strongest form. Where a claim is simply wrong — and
some of the loudest claims here are — I show the defect rather than the disapproval, because
the defect is what you can check.

## What you'll be able to do

- Derive why a genome cannot be anonymised, and say what "de-identified genomic data" does and
  does not mean
- Explain why individual consent is structurally inadequate for genomic data, and what replaces it
- Name the specific gaps in GINA and the UK insurance code, and separate the empirical question
  from the normative one
- Distinguish genetic ancestry from race operationally, and diagnose exactly which step fails in
  a genetic argument for between-group differences
- Trace the causal chain from biased sampling to worse variant interpretation, more VUS and
  degraded polygenic scores in under-represented groups
- Evaluate what controlled access, federated analysis, differential privacy and homomorphic
  encryption each buy you, what none of them can buy, and why the defaults, retention windows and
  matching features set at design time are the operative policy
- Explain why selecting embryos on a polygenic score gains so little, and why the objections to
  heritable editing are not answered by better technique

## The core idea

Every framework for handling personal data assumes three things: that data can be
de-identified, that the person it describes can consent for themselves, and that consent can be
withdrawn. Genomic data breaks all three, structurally.

It cannot be de-identified, because a genome *is* an identifier — permanent, unchangeable, shed
onto every glass you touch. It cannot be individually consented to, because half of it is also
your sibling's and a quarter your grandchild's, and they were not asked. It cannot be
withdrawn, because your relatives' data continues to describe you after you leave.

> **Your genome is not personal data in the sense the law means. It is a permanent, shared
> identifier held jointly with everyone you are related to — most of whom you will never meet,
> some of whom are not yet born, and none of whom you can consent for.**

Almost everything difficult below follows from that sentence. The privacy problems follow
because a shared permanent identifier cannot be anonymised. The consent problems follow because
the unit of decision (the individual) does not match the unit of exposure (the family, and
sometimes the community). The equity problems follow because whichever populations are measured
first accumulate an interpretive advantage that compounds. And the race arguments go wrong
because they mistake a statistical description of continuous ancestry for a taxonomy of
discrete kinds.

---

## 1. Why a genome cannot be anonymised

Take a SNP with minor allele frequency *q* in Hardy–Weinberg proportions
([Ch 26](../part-05-population-genetics/26-hardy-weinberg.md)). Two unrelated people share a
genotype there with probability

$$P_{\text{match}} = (p^2)^2 + (2pq)^2 + (q^2)^2$$

At *q* = 0.5 that is 0.25² + 0.5² + 0.25² = **0.375**. Over *n* independent such SNPs the match
probability is 0.375ⁿ, so uniqueness among 8 billion people needs
*n* > ln(1.25 × 10⁻¹⁰)/ln(0.375) = 23.3 — **24 SNPs**. At a more typical *q* = 0.2 the per-SNP
match probability is 0.514 and you need 35. That is where the familiar "30–80 SNPs identify a
person" figure comes from, and it is worth deriving rather than quoting: the number is small
because genotypes are three-valued and common variants are near-maximally informative.

A "de-identified" genotype file is therefore a file of unique keys. Stripping the name removes
only the join *you* would have used.

**Identifiability is not a property of a dataset. It is a property of the join between that
dataset and the rest of the world.** Which is why every mitigation aimed at the file — dropping
columns, coarsening ages, k-anonymising postcodes — misses. The attacks work on the join.

| Attack | Mechanism | Demonstrated |
|---|---|---|
| **Quasi-identifier join** | Genotype + age + sex + region matched against a public record | Routine; the same logic that re-identifies "anonymous" health records |
| **Y-haplotype surname inference** | The Y chromosome descends with the surname in patrilineal societies. Profile Y-STRs, query a recreational genealogy database keyed on surname, triangulate with age and state | Gymrek et al., *Science* 2013 — ~12% success for US males, using only free public resources |
| **Long-range familial search** | Match on shared IBD segments; a third cousin is enough to build a pedigree and close it with public records | Erlich et al., *Science* 2018 — searching a 1.28M-record consumer database, "nearly 60% of long-range familial searches return a relative with IBD segments with a total length of 100 cM or more"; the authors project that covering ~2% of a target population gives **more than 99%** of it a third-cousin match |
| **Membership inference from summaries** | Given a target's genotypes and a reference panel, a likelihood-ratio test over many allele frequencies detects whether the target was in the case cohort | Homer et al., *PLoS Genetics* 2008 — after which NIH withdrew aggregate GWAS frequencies from open access |
| **Beacon querying** | "Is allele X present in this dataset?", repeated over rare alleles | Shringarpure & Bustamante, *AJHG* 2015 — 250 queries sufficed against a 65-person beacon, ~5,000 against one holding 1,000 individuals; cost scales with beacon size, and beacons now rate-limit and budget |

The Homer result is the one that surprises engineers. **Summary statistics are not safe.** The
perturbation one person makes to an allele frequency is individually invisible and jointly
diagnostic across half a million SNPs. Any release pipeline resting on "we only publish
aggregates" rests on something disproved in 2008.

### The part that breaks consent

Let *c* be the fraction of a population in a searchable database and *N* the number of
relatives close enough to yield a detectable IBD match. Assuming rough independence,

$$P(\text{findable}) = 1 - (1 - c)^N$$

The exponent does the work. Take *N* ≈ 45, a deliberately conservative effective count:

| Coverage *c* | 1% | 2% | 5% | 10% |
|---|---:|---:|---:|---:|
| **Fraction of population findable** | 36% | 60% | 90% | 99% |

Two honest caveats, because this model is easier to misuse than to use. **The *N* here is an
effective parameter, not a census of your relatives.** You have far more third cousins than 45;
*N* absorbs
the facts that not every true relationship leaves a detectable segment and that relatives are not
independently sampled into a database.

**And no single *N* reproduces the published data.** Erlich's two results pull apart: getting the
observed ~60% hit rate for a 1.28M-record database — roughly 0.9% coverage of the relevant
population — needs *N* ≈ 107, while getting the projected >99% findability at 2% coverage needs
*N* ≈ 228. No value fits both, which tells you the functional form is wrong and not merely the
parameter: relatives are not independent draws into a database, and detectability falls off with
relationship. So read the table as an argument about the *shape* of exposure — it saturates fast,
and it saturates because coverage sits in the exponent — and not as a prediction. On Erlich's own
figures the exposure at 2% coverage is far higher than 60%.

A database holding one person in fifty indexes most of a population through relatives. The 2%
chose to be there. **Everyone else made no decision, was never asked, and cannot opt out — because
the data that exposes them is not theirs.** Individual consent, the mechanism the entire
post-Nuremberg apparatus of research ethics is built on, does not have the right shape for this.

### Forensic genetic genealogy

The 2018 identification of the Golden State Killer suspect — a crime-scene profile uploaded to a
public genealogy site, worked back through cousin matches — has since resolved hundreds of cold
cases and identified unidentified remains. That is a genuine good, and the argument for it is
not weak.

The argument against is not privacy in the abstract. It is that the mechanism conscripts
non-participants, and that the databases were built under terms that said nothing about police.
When GEDmatch switched every existing user to opt *out* of law-enforcement matching in May 2019,
only a minority opted back in — about 185,000 profiles by late that year, out of a database then
holding over a million. New users have to choose at registration, **with opt-in pre-selected**,
and 83% of them stay opted in (Guerrini et al. 2021). Same population, same question, opposite
answers: what is "consented" to here is mostly a default.

Governance has partly caught up. A US Department of Justice interim policy (approved September
2019, effective 1 November 2019) restricts federally funded forensic genealogy to violent crime
and unidentified remains and requires conventional leads to be exhausted first — but it is policy, not law, and binds only
DOJ-funded work. Maryland's 2021 statute goes further: judicial authorisation, specified
offences only, laboratory licensing, a private right of action. Most jurisdictions have neither.
A 2019 Florida warrant authorising a search of an entire genealogy database *over its own
opt-out settings* is the clearest available statement that platform privacy promises are not
enforceable against a court.

### What happens when the company dies

23andMe filed for Chapter 11 in March 2025 with over 15 million customers, roughly 80% of whom
had consented to research use. A database like that is an *asset*, and bankruptcy exists to
convert assets into creditor payments. After a reopened auction the buyer was TTAM Research
Institute, a non-profit formed by the company's co-founder, at $305 million, closing July 2025,
under binding commitments to comply with the existing privacy policies and to honour customers'
right to delete their data and opt out of research in perpetuity. That was better than the
alternatives on offer — and it turned on who won an auction, not on legal structure.

Two lessons. **A privacy policy is a contract a company can amend and a court can transfer**;
consent given to entity A is not consent given to A's acquirer, but the machinery for enforcing
that is thin. And **a breach of genomic data is permanent**: 23andMe's 2023 credential-stuffing
incident exposed millions of profiles *through the relative-matching feature*, which was itself
the amplifier. You can reissue a password. You cannot reissue a genome, and you cannot reissue
your brother's.

## 2. What technical mitigations buy, and what they cannot

| Mechanism | Protects | Does not protect |
|---|---|---|
| **Controlled access** (dbGaP, EGA, trusted research environments) | Who gets data, under agreement, with audit | Nothing mathematically — it is a contract plus a log, and fails silently if ignored |
| **Federated analysis** ("code to data") | Raw genotypes never leave the custodian | The *outputs* — frequencies, effect sizes, model weights — which are what membership inference consumes |
| **Differential privacy** | A provable bound on any one participant's influence on a release | Utility, at genomics scale (below) |
| **Homomorphic encryption / MPC** | Data in transit and *in use*; the compute party sees no plaintext | The result. If the result is a genotype or a score from one, it identifies as before |

Differential privacy is the right formalism, and its difficulty here is specific. A GWAS
releases per-variant effect sizes at thresholds around 5 × 10⁻⁸ across millions of variants
([Ch 51](../part-11-human-and-statistical-genomics/51-gwas.md)). The privacy budget splits
across all of them, and the noise needed at a per-query ε small enough to compose is comparable
to the signal. Worse, standard composition assumes independent queries, and genomic queries are
the opposite: linkage disequilibrium
([Ch 29](../part-05-population-genetics/29-linkage-disequilibrium.md)) means an adversary
recovers a noised genotype by averaging over its LD neighbours. Correlation between queries
helps the attacker and not the accounting. DP works for coarse releases — cohort counts,
aggregated phenotype summaries, beacon responses — and poorly for the fine-grained statistics
the field wants to share.

Homomorphic encryption is real, deployed for narrow tasks (secure imputation, encrypted variant
search), and improving. It also solves a different problem from the one people reach for it to
solve.

> **There is no cryptographic fix for a result that is itself identifying.** Encryption protects
> the pipeline; the question is what comes out of it, and whether that output, joined against
> the world, names someone. Governance is not a weak substitute for better crypto — for a large
> class of these problems it is the only layer at which the problem exists.

The design consequence is concrete: what determines privacy outcomes are *product* decisions —
whether relative-matching exists, whether it defaults on, what a beacon answers, what an API
rate-limits, whether summaries are released per-variant or binned. They matter more than the
cipher suite, and the worked example at the end of this chapter walks one of them through.

## 3. Discrimination

Two worries: that an insurer or employer uses genetic information against you, and that *fear*
of it stops you being tested or joining a study. The second is measurable and large even where
the first is rare.

**GINA** (US, 2008) bars health insurers from using genetic information in eligibility or
premiums and from requiring a test (Title I), and bars employers from using it in hiring, firing
or terms of employment (Title II). Its gaps are specific and not marginal:

| Not covered | Consequence |
|---|---|
| **Life insurance** | An insurer may ask for and underwrite on a predictive test result |
| **Disability insurance** | Same |
| **Long-term-care insurance** | Same — the coverage most directly implicated by a late-onset neurodegenerative risk variant |
| **Employers with fewer than 15 employees** | Title II does not apply at all |
| **Manifested disease** | GINA protects genetic *information*, not people already symptomatic; that is ADA territory, with different tests |
| **US military and some federal contexts** | Separate rules |

Some US states extend protection to life, disability and long-term-care cover; most do not, so
the operative regime depends on where you live.

Other jurisdictions chose differently. The UK runs the **Code on Genetic Testing and Insurance**
(2018) — an agreement between government and the Association of British Insurers, not a statute.
Insurers will not require a test and will not ask for a predictive result at all, with one
exception: Huntington disease, on life cover above £500,000. Canada's Genetic Non-Discrimination
Act (2017) criminalises requiring a test or disclosure as a condition of a contract or service,
and was upheld by the Supreme Court in 2020. Australia, judging self-regulation to have failed,
announced a ban in September 2024; the enabling legislation passed Parliament in April 2026 and
commences in October 2026, prohibiting the use of adverse genetic test results in life-insurance
underwriting.

**How much discrimination actually occurs?** Documented adverse decisions are far rarer than
fear of them, and much of what respondents report was triggered by *family history* — which no
genetic-privacy statute regulates — rather than by a test result. Among people at risk for
Huntington disease, on the order of 85–90% report concern and roughly 40% report an experience
they classify as discrimination, concentrated in insurance and, notably, in family and social
settings rather than employment.

A low observed rate is therefore not evidence that protection is unnecessary, because the low
rate is partly *produced* by people declining to be tested: they forgo surveillance that would
extend their lives, and decline research participation, degrading the evidence base for everyone.

**The actuarial case, at its strongest.** Voluntary insurance is priced on symmetric information.
If applicants know their genotype and insurers may not ask, high-risk people buy more cover at
pooled prices and low-risk people buy less — adverse selection, which raises prices and can
unravel a market. On this view a ban is not neutral fairness; it is an unstated transfer from
low-risk to high-risk purchasers.

**The reply, also at its strongest.** Adverse selection has been measured, and the result is two
things at once. In relative terms it is real and large among the few people who have actually
tested: Huntington mutation carriers are up to **five times** as likely as the general population
to hold long-term-care cover, and Oster and colleagues (2010) argue that even a modest expansion
of genetic information could threaten that market's viability — the same coverage the table above
flags as the one most directly implicated. In aggregate market terms it stays small, and for the
reason built into that sentence: carriers are a vanishing fraction of applicants, because
predictive tests are uncommon and mostly weakly predictive. Against that sits the large cost of
deterring clinically indicated testing — and note the loop, because the thing keeping aggregate
selection small is precisely the testing suppression this section condemns. Beneath the empirics
is a normative choice no dataset settles: whether insurance *pools* risk or *sorts* it. A society that thinks
pooling is the point restricts underwriting on unchosen characteristics; one that thinks sorting
is the point does not. Both are coherent, and the same unresolved disagreement sits under every
debate about pre-existing conditions.

## 4. Consent

The consent form assumes you can describe the research at enrolment. Biobanking assumes you
cannot.

| Model | Participant agrees to | Cost |
|---|---|---|
| **Specific** | This study, this question | Re-consent for every new use; attrition and bias as the cohort ages; often impossible at scale |
| **Broad** | A described *domain* of future research, governed by a named oversight body | Consent to a process, not a project — legitimacy transfers to the governance |
| **Dynamic** | An ongoing digital relationship: granular, revisable preferences, notification of new uses | Real autonomy gain; real participant burden, and it selects for the engaged, skewing the cohort |
| **Opt-out / waiver** | Research proceeds unless the participant objects | Defensible for low-risk record research; corrosive for anything identifiable or sensitive |

Broad consent is the workhorse, and its honest description is uncomfortable: **you are not
consenting to a study, you are consenting to a committee.** That is how consent to any long-lived
institution works — but the ethical weight has moved from the form to the data access committee,
and committees vary enormously in rigour and in whose interests they represent.

**The right not to know** is not irrationality to be talked out of. A 30-year-old declining a
predictive Huntington test faces a result that is unactionable, irreversible, and interacts with
insurance exactly as §3 describes; uptake of predictive HD testing has stayed low for decades.

It collides with **secondary findings**. Sequence an exome for one indication and you
incidentally observe everything else. ACMG recommends actively examining a curated list of
medically actionable genes — grown from 56 in 2013 to more than 80 across revisions — and
reporting what is found, with an opt-out. The defence: declining to look at a pathogenic *BRCA1*
variant you have already sequenced is a strange kind of ignorance to protect. The objection: it
converts a diagnostic test into an unrequested screening programme, on a committee's list, in
people with no family history — where positive predictive value is far lower than a literature
ascertained in affected families suggests.

**Return of results is a versioning problem.** Variants move between VUS, likely pathogenic and
benign as evidence accumulates
([Ch 55](../part-11-human-and-statistical-genomics/55-clinical-variant-interpretation.md)), so a
report is a snapshot of a moving evidence base. Whether a laboratory owes a duty to recontact
years later is unsettled in most jurisdictions — and it is a systems problem before it is an
ethical one: nobody built the infrastructure to push an update to a PDF issued in 2019.

**Children.** Professional societies default to deferring predictive testing for adult-onset
conditions, to preserve the future adult's right not to know. The counter is real: parents may
need the information for reproductive planning or cascade testing, and where childhood
surveillance exists deferral is harmful. Newborn screening is a genuine exception — a population
programme essentially without individualised consent, justified by treatability — and genomic
newborn screening (BabySeq; the UK Generation Study) stresses that justification hard, because
sequencing returns far more than the treatable conditions the programme rests on. **Adults who
cannot consent** rely on proxies with a best-interests standard plus assent, and here §5 bites: a
proxy can consent for a person, and nobody can consent for a lineage.

## 5. Group harms, and what consent cannot represent

Between 1990 and 1994, researchers collected blood from about 400 members of the Havasupai Tribe
for a study of the community's very high diabetes prevalence. The samples were subsequently used
for research on schizophrenia, on inbreeding, and on population migration — including a thesis
concluding the tribe's ancestors crossed the Bering Strait, contradicting the tribe's own
account of its origins. A tribal member discovered this in 2003 at a university presentation.
Litigation settled in 2010: $700,000 to 41 members, return of the samples, support for a clinic
and school. Because it settled, it set no precedent.

The *structure* of the harm is the transferable lesson. No individual was re-identified. No
individual suffered a medical consequence. The harm fell on the group — its standing, its origin
narrative, its ability to control what is said about it — and was inflicted by research a
conventional consent form, read literally, arguably permitted. **A framework whose only unit is
the individual cannot represent this kind of injury, let alone prevent it.**

Henrietta Lacks makes a point about time. Cells taken during her 1951 cervical cancer treatment
without consent (not then required) became HeLa, the most widely used human cell line in biology.
The HeLa genome was published in 2013 and withdrawn after the family objected, followed by an NIH
agreement giving family members a seat on the committee controlling access; a settlement with
Thermo Fisher over commercial use was reached in August 2023. Seventy years is not an unusual
interval here. **Data you generate today will outlive the consent regime under which you
generated it.**

The constructive response has a name. **FAIR** — Findable, Accessible, Interoperable, Reusable —
optimises data for machine reuse and is why public genomics works at all. It is silent on *who
benefits* and *who decides*. **CARE** — Collective benefit, Authority to control, Responsibility,
Ethics — articulated by the Global Indigenous Data Alliance in 2019, supplies that missing axis
and is built to sit alongside FAIR, not replace it.

The tension is real and should not be smoothed over: open data is a genuine public good, and
every restriction costs discoveries not made; indigenous data sovereignty is also a genuine good,
grounded in a documented history where openness was the mechanism of harm. The workable syntheses
are procedural — community review boards with authority to refuse, benefit-sharing negotiated
before collection, and tiered access where some analyses are open and others need community
approval. Do **not** reach for the Nagoya Protocol here, however often you see it cited in this
context: its definition of a genetic resource is "any plant, animal, microbial or material of
other origin", and human genetic material is explicitly outside its scope. It is the nearest
existing benefit-sharing model, which is why it gets invoked, and it does not reach this case at
all. H3Africa's model, African-led with access governed
on the continent, is the most developed large-scale example, and it builds capacity as well as
data. Shipping samples out of a community and publishing on them is the Havasupai structure with
better paperwork.

## 6. Equity: the ancestry bias and its concrete cost

As of August 2026 the GWAS Diversity Monitor records **88% of discovery-stage GWAS participants as
being of European genetic ancestry** — a group comprising about **16%** of the world's population
(Martin et al. 2019). Participants recorded as African ancestry account for **0.3%**, with a
further 2.8% recorded as African American or Afro-Caribbean, against a sub-Saharan African
population that is roughly 15% of the world's.

Watch the denominator in that first figure, because it is easy to get wrong in the direction that
flatters your argument. 16% is the world share of people of European *ancestry*, which includes
the European-descended populations of the Americas and Oceania that most of the 88% was recruited
from. Europe's *resident* population is about 9%, and quoting that against an ancestry numerator
nearly doubles the apparent over-representation. The real ratio is bad enough. This is not an
abstraction, and it has four mechanical consequences.

**1. Variant interpretation degrades.** Clinical classification leans on population allele
frequency: a variant common in healthy people is not causing a severe rare disease
([Ch 55](../part-11-human-and-statistical-genomics/55-clinical-variant-interpretation.md)). That
filter needs a frequency estimate *in the patient's own ancestry*. Manrai et al. (2016) showed
that several variants reported as pathogenic for hypertrophic cardiomyopathy were benign
polymorphisms common in African-ancestry populations and rare in the European controls then
available; patients — all of African or unspecified ancestry — received positive reports for a
disease they did not have, and simulations showed that modest numbers of African-ancestry
controls would have prevented it. The failure was not in the assay or the reasoning. It was in
the reference panel.

**2. More variants of uncertain significance.** Under-represented ancestries yield higher VUS
rates for the same test, because evidence density is lower. Say this precisely: **a VUS is a
statement about the evidence, not about the variant.** A higher VUS rate in a group means we
know less about that group, not that its genomes are more ambiguous.

**3. Polygenic scores do not transfer.** PRS accuracy decays with genetic distance from the
training cohort, enough that a score developed in European-ancestry samples can lose most of its
predictive value in African-ancestry individuals
([Ch 53](../part-11-human-and-statistical-genomics/53-polygenic-scores.md)). The causes are
mundane:

```
  GWAS finds a tag SNP, not the causal variant  ────┐
  LD between tag and causal variant differs         │
    between populations (Ch 29)              ───────┼──►  the weight is wrong
  allele frequencies differ, so variance            │      in the new sample
    explained differs                        ───────┤
  effect estimates absorb stratification and        │
    indirect genetic effects (Ch 51, Ch 53)  ───────┤
  environments and their interactions differ ───────┘
```

> **Portability failure is caused by biased sampling and by LD structure. It is not evidence
> that the biology differs between groups.** Train a score in an African-ancestry cohort of
> equivalent size and it works there and transfers poorly the other way. The asymmetry is in the
> data, not in the people.

**4. Discoveries are missed.** Variants common in one population and absent in another are only
findable where they are common. *PCSK9* is the standard exemplar, and it is worth stating exactly,
because the usual telling overstates it. The gene's link to cholesterol was found first in
European families with autosomal dominant hypercholesterolaemia, through *gain*-of-function
mutations (Abifadel et al., *Nature Genetics* 2003). What the African-ancestry participants
supplied was the opposite direction — knockouts, and the outcome data that made them a drug
target. In one analysis of the Atherosclerosis Risk in Communities cohort, nonsense alleles
carried by 2.6% of Black participants and essentially absent in Europeans gave a 28% LDL reduction
and an **88% reduction in coronary heart disease**, while the one common European
loss-of-function variant (R46L, 3.2% of white participants) gave 15% and **47%** (HR 0.50, 95% CI
0.32–0.79, *P* = 0.003; Cohen et al., *NEJM* 2006). A 47% reduction at *P* = 0.003 is not a signal a European-only design would have
missed — so the honest claim is not "far later" but that a European-only design would have seen a
far weaker effect and, crucially, would have lacked the near-complete-knockout carriers who made
the safety and therapeutic case unambiguous.

**The risk of widening rather than narrowing.** Deploying PRS clinically today distributes a
benefit largest for the already best-served group. Even with impeccable intent a uniform rollout
amplifies an existing disparity, because the tool's accuracy is itself unequally distributed.
That is a reason to sequence deployment carefully, not a reason against the technology.

**What is being done.** *All of Us* has enrolled a cohort in which about 80% of participants come
from communities historically under-represented in biomedical research and 46% from
under-represented racial and ethnic groups, with whole genomes for hundreds of thousands; gnomAD
v4 aggregates 807,162 individuals and HPRC Release 2 provides 460 haplotypes from 200+ people
([reference/verified-facts.md](../reference/verified-facts.md)). Recruiting from historically
exploited communities, though, requires §5's governance first.

**The global access gap** is the sharpest inequity in the field, and sickle cell disease is the
cleanest case. The best-developed genome-editing therapy in existence treats it
([Ch 38](../part-08-methods/38-genome-editing.md)), at a US list price around $2.2M, requiring
apheresis, myeloablative conditioning and a transplant unit. The burden is concentrated
overwhelmingly in sub-Saharan Africa and India. A therapy whose delivery requirements exceed the
health-system capacity of the places the disease is concentrated is not, operationally, a cure
for that disease yet.

## 7. Race, ancestry, and what genetics does not license

**Genetic ancestry** describes your actual genealogical relationships — which populations your
ancestors came from, in what proportions, when. It is continuous, multidimensional, estimable
with quantifiable uncertainty, and it varies *within* an individual across the genome, because
different segments have different histories.

**Race** is a social classification: categories whose boundaries were drawn by historical and
political processes, which have changed repeatedly within living memory and differ between
countries. It is real in its effects — exposure, discrimination, access to care — and those
effects are frequently what a "racial difference" in a health outcome is measuring.

They correlate imperfectly. **They are not interchangeable, and using one where you mean the
other is the commonest technical error in this area.**

### The apportionment result and the objection to it

Lewontin (1972) partitioned human genetic variation: roughly **85% within populations, ~8% among
populations within continental groupings, ~6% among continental groupings.** Any two people from
the same village differ in most of the ways any two people on Earth differ.

Edwards (2003) raised a real objection, and it should be stated at full strength because on its
own terms it is correct. Single-locus apportionment discards the *correlation structure* across
loci. Individual variants classify people poorly; many variants jointly classify them almost
perfectly — not a philosophical claim but the daily experience of anyone who has run PCA on a
genotype matrix ([Ch 28](../part-05-population-genetics/28-structure-and-inbreeding.md)) and
watched continental groups separate on the first two components. That structure is real, and it
is what makes ancestry inference work and stratification correction necessary.

Both results are correct; they answer different questions.

| Question | Answer | What it licenses |
|---|---|---|
| Can individuals be assigned to ancestry clusters from genotypes? | Yes, accurately, given enough markers | Ancestry inference, stratification control, admixture mapping |
| Is most variation within rather than between those clusters? | Yes, ~85% within | Only that most human genetic variation is shared. It places no bound on the size of any particular between-group trait difference — see (a)–(e) below for the arguments that do that work |
| Do the clusters constitute discrete natural kinds? | **No** | Nothing |

The third row is where the argument turns. Unsupervised methods return clusters because
clustering is what you asked for: in ADMIXTURE and relatives, *K* is a parameter you choose, not
a quantity the data discovers. Sample three continents and you recover three clusters; sample
densely along a transect and you recover a cline, because human variation is overwhelmingly
clinal — allele frequencies change gradually with distance under migration and isolation by
distance. **The apparent discreteness of the output is a property of the sampling design, not of
the species.**

Hence continental labels are poor operational proxies. Admixture proportions vary enormously
*within* any self-identified group; for most specific quantities you would want to predict, the
within-label variance exceeds the between-label difference. If your model needs ancestry,
estimate ancestry. It is measurable, so measure it.

### What is wrong with the genetic argument for between-group differences

The argument, in the form it is always made:

1. Groups G₁ and G₂ differ on average in trait T.
2. T is substantially heritable *within* G₁ and within G₂.
3. Therefore the difference between them is substantially genetic.

Step 3 does not follow. **(a) and (b) are each independently fatal to the inference**; (c), (d)
and (e) close off the routes usually taken around them, and are worth grading honestly rather than
piling on — (c) blocks a proposed rescue, (d) is the closest thing to a direct test and is not a
clean one, (e) is a proof that something environmental can move population means by more than the
gaps at issue.

**(a) Heritability is a within-group statistic carrying no between-group information.** This is
the two-pots argument of
[Ch 31](../part-06-quantitative-genetics/31-heritability-and-selection.md): genetically variable
seed split between rich and poor soil gives *h*² ≈ 1 within each pot and a between-pot
difference that is 100% environmental by construction. Heritability is computed from within-group
variance; the between-group mean does not appear in its definition. No value of *h*², however
large or well estimated, constrains the cause of a between-group difference.

**(b) The groups are not randomised into their environments.** In the pots, the experimenter
randomised the seed. Socially defined human groups differ systematically in nutrition, schooling,
income, pollution, discrimination and medical care — which is largely what the categories track.
The confound is not a residual to adjust away; it is comprehensive and correlated with the
grouping by construction.

**(c) The measurement the argument needs cannot currently be made.** "Then compare polygenic
score means across groups" is invalid with present methods, for reasons established elsewhere in
this book rather than invented here: PRS means are shifted by residual stratification, because
stratification and trait can share the same geographic structure; the LD and frequency
differences of §6 systematically bias the weights; and between-family GWAS estimates carry
indirect genetic effects and assortative-mating components that do not transfer
([Ch 53](../part-11-human-and-statistical-genomics/53-polygenic-scores.md)). A between-group PRS
difference is confounded with the portability failure itself, and no current method separates
the two.

**(d) The nearest thing to a direct test exists, has been run, and does not settle it.** In an
admixed population, individual ancestry proportions vary continuously and are measurable
([Ch 28](../part-05-population-genetics/28-structure-and-inbreeding.md)). If a group difference
in T were genetic, T should track individual ancestry proportion *within* that population — a
comparison that at least avoids contrasting two socially separated groups.

The classic studies found nothing. Scarr, Pakstis, Katz and Barker (1977), "Absence of a
relationship between degree of white ancestry and intellectual skills within a black population",
and Loehlin, Vandenberg and Osborne (1973) both report no association. Both, however, estimated
ancestry from a handful of blood-group markers — a weak proxy for genome-wide ancestry — and both
were underpowered. Replications using genome-wide ancestry estimates do report non-null slopes;
they are also published almost entirely outside mainstream genetics venues, in journals whose
review standards, and in some cases whose editorial history, a reader has to weigh as part of the
evidence. That is information about the finding's reception, and it is not by itself a refutation.

So do not settle this by counting papers on either side. Settle it by seeing what the design can
and cannot do. **Ancestry proportion inside an admixed population is itself correlated with
appearance, with socioeconomic position, and with how a person is treated** — so objection (b)
applies here too, and no version of this study separates a genetic effect from ancestry-correlated
social treatment. Regressing a trait on ancestry proportion is not a randomised experiment, and it
was never going to be one. The honest statement is that (d) is contested and structurally
confounded, which is why nothing above depends on it: (a) and (b) carry the refutation on their
own, and would carry it whichever way (d) came out.

**(e) The trait moves faster than allele frequencies can.** Population mean scores on cognitive
tests rose substantially across the twentieth century — the Flynn effect — by margins exceeding
the group gaps at issue, over intervals far too short for allele frequencies to have changed.
Whatever produces those shifts is environmental, large, and demonstrably able to move population
means.

Note what has been argued, and what has not. This is not "the science is silent, so choose the
kinder answer", and it is not "the data have settled it". The inference is invalid on its own
terms: the step from within-group heritability to a between-group cause has no support in the
definition of heritability, and the groups were never randomised into their environments. Every
proposed rescue — polygenic score means, admixture regression — inherits the same confound rather
than escaping it. The refutation is more useful to you than the condemnation, because you can
check every step of it, including the parts where the honest answer is that the evidence is
contested.

### Race-based versus ancestry-informed versus genotype-based medicine

The same confusion has done concrete clinical harm through a recognisable failure mode: **race
used inside a clinical algorithm as a proxy for an unmeasured variable.**

The eGFR equations carried a coefficient raising estimated kidney function for patients
identified as Black, derived from an average creatinine difference whose causes were never
established. The effect was to make measured kidney disease look milder, delaying referral and
transplant listing; the 2021 CKD-EPI race-free equations removed it. Spirometry carried an
analogous race correction for decades; the ATS moved to race-neutral interpretation in 2023.

| If the real predictor is… | Measure… | Example |
|---|---|---|
| A genotype | The genotype | *APOL1* G1/G2 alleles and kidney disease — present in some people of West African ancestry and absent in others |
| Genetic ancestry (for allele-frequency priors) | Estimated ancestry, continuously | Variant-interpretation reference panels; pharmacogenomic allele frequencies |
| Environment, exposure or access | The exposure | Air quality, occupational history, insurance status, experienced discrimination |

Race-as-proxy fails in all three, and in the third it does something worse than fail: it converts
a disparity produced by unequal conditions into a fixed characteristic of the patient and then
adjusts for it — embedding the disparity in the tool meant to detect it.

## 8. Reproductive decisions

**Prenatal screening.** Cell-free DNA screening detects fetal aneuploidy from maternal blood with
high sensitivity and specificity ([Ch 57](57-genomics-in-practice.md)). You know what happens
next: at a prevalence near 1 in 1,000, a 99.7%-sensitive test with a 0.04% false-positive rate
has a positive predictive value near 71% — nearly three positives in ten are wrong. That is a
calculation you can do in your head, and it is nonetheless routinely
conveyed to patients as a diagnosis rather than a screen, with irreversible decisions taken on
the misconception. The problem is not statistical illiteracy in the abstract; it is that these
tests are marketed directly and reported without the prior.

**The expressivist objection, seriously.** Disability-rights scholars (Asch, Parens and others)
argue that a societal programme of screening for condition X sends a message about the value of
existing lives with X; that prenatal testing selects against *people*, not conditions; and that
prospective parents' picture of life with the condition comes almost entirely from clinicians
describing pathology.

The standard replies: a decision about which child to bring into existence is not a judgment
about any existing person; reproductive autonomy is a strong and widely shared commitment; and
the conditions screened for span such a severity range that no single argument covers both a
lethal neonatal condition and one compatible with a long life.

What should survive the exchange, even if you reject its conclusion, is its strongest empirical
point: **people living with many of these conditions report quality of life far higher than
clinicians and prospective parents predict** — the disability paradox is among the most
replicated findings in health psychology. The information these decisions rest on is therefore
biased in a known direction, and fixing that is compatible with any position on the underlying
ethics. Meanwhile the aggregate outcome — in several countries, very high termination rates after
a prenatal diagnosis of Down syndrome and a shrinking population living with it — is a
population-level consequence no individual decision aimed at, which is exactly why individual
autonomy does not fully answer the objection.

**Selection for non-disease traits.** Preimplantation genetic testing for polygenic risk (PGT-P)
is commercially offered and, on current evidence, weak — for reasons that follow from the
statistics, not from any ethical premise:

1. **The variance available is within-family.** Siblings from the same two parents vary far less
   than the population, and you choose among a handful of viable embryos. Published estimates of
   expected gain are small — on the order of a few centimetres of height, or a few IQ points
   under favourable assumptions.
2. **The weights are estimated between families and applied within one.** Population GWAS effects
   include stratification, indirect genetic effects and assortative-mating inflation, all of
   which shrink or cancel within a sibship — which is where the selection happens
   ([Ch 53](../part-11-human-and-statistical-genomics/53-polygenic-scores.md)).
3. **Pleiotropy.** Selecting on one score moves every genetically correlated trait, in directions
   not measured for that embryo.
4. **Portability.** Every problem in §6 applies to every embryo whose ancestry differs from the
   training cohort's.

Professional societies have advised against clinical use. The market exists anyway, which is a
governance observation rather than a scientific one.

**The therapy/enhancement line** is invoked constantly and does not survive contact. Deafness and
achondroplasia are regarded by many within those communities as identities rather than diseases;
treating short stature within the normal range is enhancement in a lab coat; vaccination is
uncontroversially enhancement of the immune system. A fuzzy line does not make the ends the same
— repairing a lethal metabolic defect and selecting for height are genuinely different — but it
does mean the line cannot bear the weight of a policy, and any policy resting on it will be
argued about at the boundary forever.

## 9. Heritable genome editing

Somatic editing changes the treated person and dies with them. Germline editing changes every
descendant. The reagents are identical; the difference is which cell you put them in
([Ch 38](../part-08-methods/38-genome-editing.md)).

He Jiankui's 2018 editing of *CCR5* in human embryos is the case everyone cites; Chapter 38 gives
the molecular detail. The governance outcome belongs here. A Shenzhen court convicted him in
December 2019 of **illegal medical practice** — that was the charge available, because editing
embryos was not itself a crime at the time — and sentenced him to three years and a ¥3M fine.
China then closed the gap: the 2020 amendment to the Criminal Law makes implantation of a
gene-edited human embryo an offence carrying three to seven years. Note the sequence, because it
is the general pattern of §11 in miniature — the law arrived after the experiment, and was written
by the country the experiment embarrassed. The ethical analysis is separable from the technical
failure and sharper for it:

| Objection | Why better technique does not answer it |
|---|---|
| **No unmet need** | Sperm washing already prevents paternal HIV transmission. With no numerator in the risk/benefit ratio, no level of precision justifies the risk |
| **Consent is structurally impossible** | The subject cannot consent and neither can any descendant. There is no withdrawal mechanism, ever |
| **Novel alleles have no evidence base** | The natural Δ32 allele has population-scale data behind it; a novel indel in the same gene has none. A data problem, not a technique problem |
| **Mosaicism and verification** | The editor acts while the zygote divides. You genotype cells you discard and infer about cells you keep — the inference gap is intrinsic |
| **Irreversibility across generations** | An error propagates into a lineage; somatic error is bounded by one lifespan |

**The strongest case in favour** deserves stating: a small set of couples cannot obtain an
unaffected embryo by preimplantation testing — for instance where both partners are homozygous
for the same recessive pathogenic variant. For them editing is the only route to an unaffected
genetically related child. The 2020 International Commission convened by the US National
Academies and the UK Royal Society examined exactly this and found the eligible group very
small. The counter is that gamete donation and adoption already address it, and that a technology
with unbounded downstream consequences is poorly justified by an edge case with existing
alternatives. Reasonable people land differently, and more data will not resolve it.

**The enhancement worry has an honest technical answer.** Complex traits are polygenic with tiny
per-variant effects ([Ch 30](../part-06-quantitative-genetics/30-quantitative-traits.md)).
Editing for intelligence or height would need hundreds to thousands of edits, each carrying
off-target and structural risk, using between-family effect estimates that shrink within one, in
a background of unknown interactions. The architecture that makes embryo selection weak makes
editing weaker. The realistic near-term worry is not enhancement; it is a rogue clinic repeating
2018 with one edit and a marketing claim.

**Governance as of August 2026:** heritable editing is prohibited by law in more than 70 countries
and by the Oviedo Convention; the 2020 Commission specified narrow preconditions and a
translational pathway if clinical use were ever contemplated; the WHO issued a governance
framework in 2021; the Third International Summit (London, March 2023) concluded heritable
editing remains unacceptable at this time. The structural gap is obvious: prohibition is national
and the technology is portable. Medical tourism is the failure mode, and one prosecution in one
jurisdiction — the He case above — is the whole of the deterrence record. That is not nothing, and
it is not much: it worked because the work was done at home and announced to the world.

## 10. Gene drives, dual use, and synthesis screening

**Gene drives** invert Mendelian transmission so a costly allele can spread from low frequency
([Ch 38](../part-08-methods/38-genome-editing.md)), breaking the arithmetic all of Part 5 rests
on. Against roughly 600,000 malaria deaths a year, mostly children, the case for suppressing a
vector species is not marginal. The governance problem is that consent here is *geographic* and
the technology is not: a drive does not stop at a border, can introgress into hybridising
species, and is not recallable. Who is the consenting party for an ecosystem, and what does one
state's refusal mean when the mosquitoes do not check? The Convention on Biological Diversity
requires case-by-case risk assessment with engagement of affected communities, and the leading
programmes have spent years on engagement before any release. **No gene-drive organism has been
released into the wild as of August 2026.**

**Dual use** has an uncomfortable structure: the norms that make this a science — publish the
sequence, publish the method, make it reproducible — are the norms that make dangerous work
reproducible. The canonical case remains the 2011–12 transmissible H5N1 experiments and the
debate over redacting the methods, which established that no institution had a mechanism for the
decision and that redaction is largely futile once the result is known to exist.

**Synthesis screening** is the field's clearest chokepoint control. Ordering synthetic DNA runs
through a modest number of commercial providers, so screening orders against sequences of concern
and verifying customers is tractable at a real bottleneck — which is why the International Gene
Synthesis Consortium has operated a voluntary framework for years. US policy has been unstable: a
2023 executive order produced an OSTP *Framework for Nucleic Acid Synthesis Screening* in 2024; a
May 2025 executive order directed it be revised or replaced within 90 days; as of early 2026 no
replacement has issued, leaving providers in limbo, some applying the 2024 version and others
pausing. The deeper erosion is technological: benchtop synthesisers move synthesis inside the
customer's building and dissolve the chokepoint, and design tools proposing novel sequences
weaken screening lists that match against known agents.

## 11. Governance and the pacing gap

There is no single regulator, only a patchwork with holes in predictable places.

| Instrument | Covers | Notable hole |
|---|---|---|
| **FDA device pathway** | Tests marketed as diagnostics; a handful of authorised DTC health-risk and pharmacogenomic reports | Most DTC output, including ancestry and "wellness", sits outside it |
| **CLIA** | Laboratory analytical quality | Silent on whether the test means anything clinically |
| **HIPAA** | Covered entities: providers, plans, clearinghouses | **A DTC genomics company is not a covered entity.** Your clinical genome is protected; the one you bought is governed by a terms-of-service document |
| **GINA and national equivalents** | Health insurance and employment | §3's gaps |
| **GDPR** | Genetic data as a special category needing a legal basis | Jurisdictional, with broad research exemptions |
| **Common Rule / research ethics committees** | Funded human-subjects research | Private research outside funded institutions; and group harms fit poorly in a framework built on individual risk |
| **US state genetic-privacy statutes** | A growing patchwork (Utah's Genetic Information Privacy Act, effective May 2021, was first; Montana, Indiana, South Dakota and others have followed through 2026) | Fifty answers, none reaching a company incorporated elsewhere |

**The Myriad decision** is the most instructive case law here. *Association for Molecular
Pathology v. Myriad Genetics* (2013) held that isolated naturally occurring genomic DNA is a
product of nature and not patent-eligible, while cDNA — which does not occur in nature — is.
Exclusive rights over *BRCA1*/*BRCA2* testing ended, prices fell sharply, multi-gene panels
became legal to offer.

What did not change is the instructive part. Myriad had accumulated, under exclusivity, the
largest collection of *BRCA* variant observations paired with clinical outcomes, and did not
share it. The patent went away; the interpretive moat did not. The response was collective —
Sharing Clinical Reports, then ClinVar and the ClinGen expert panels
([Ch 55](../part-11-human-and-statistical-genomics/55-clinical-variant-interpretation.md)) —
rebuilding a public evidence base from laboratories willing to deposit.

> **In genomics the durable monopoly is not on sequence. It is on interpretation.** Sequence is
> cheap and commoditising; a curated, longitudinal variant–outcome database is expensive,
> defensible and cumulative. Anyone reasoning about competition, access or public-good provision
> here should watch the interpretation layer, not the assay.

**The pacing gap** is the general condition. Law is jurisdictional, slow and reactive; sequencing
capacity, editing reagents and analysis pipelines are portable, fast and available by post. Two
consequences. Technical design choices *are* policy — defaults, retention windows, rate limits,
whether relative-matching exists — and they are made years before any statute reaches them. And
professional norms plus data-access governance do the work statutes do not, which makes the
seriousness of an access committee not a bureaucratic detail but, for most of this data, the
actual control.

---

## Common misconceptions

| What people think | What's actually true |
|---|---|
| Genomic data can be de-identified by removing names | ~30–40 common SNPs make a person unique. Identifiability comes from the join with external data, which stripping columns does not touch |
| Sharing only aggregate statistics is safe | Allele frequencies leak membership (Homer 2008), which is why NIH withdrew open aggregate GWAS data |
| Encryption solves genomic privacy | It protects data in transit and in use. If the output is a genotype or a score from one, the output identifies. There is no crypto fix for an identifying result |
| Consenting to share your genome is your decision alone | It exposes parents, siblings and children who were not asked. Erlich et al. (2018) project that a database covering 2% of a population yields a third-cousin-or-closer match for more than 99% of it |
| GINA protects you from genetic discrimination | Not in life, disability or long-term-care insurance, not at employers with fewer than 15 staff, and not once disease has manifested |
| Race and genetic ancestry are the same thing measured differently | Ancestry is continuous, genealogical and measurable; race is a social classification whose boundaries have repeatedly changed. They correlate imperfectly and are never interchangeable |
| High heritability within groups implies group differences are genetic | Heritability is computed from within-group variance and contains no between-group information ([Ch 31](../part-06-quantitative-genetics/31-heritability-and-selection.md)) |
| Comparing polygenic scores across ancestries measures genetic difference | It measures the score's own portability failure, confounded with residual stratification, and no current method separates them. Portability failure reflects biased training data and differing LD — train in the other population and the asymmetry reverses |
| A VUS means the variant is probably harmless — or probably harmful | It means the *evidence* is insufficient. VUS rates are higher in under-represented groups because we have less data |
| Race-adjusted clinical equations correct for biology | They usually proxy for an unmeasured variable. The eGFR and spirometry corrections were removed (2021, 2023) because the adjustment embedded the disparity it claimed to handle |
| Embryo selection on polygenic scores can meaningfully raise a trait | Within-sibship variance is a fraction of population variance, weights are estimated between families, and pleiotropy moves everything else |
| Germline editing is banned everywhere, so the issue is settled | Prohibited in 70+ countries — but prohibition is national and the technology is portable. Enforcement, not consensus, is the open problem |
| Ethics is what you do after the analysis | Defaults, retention, query limits and matching features are decided at design time and are the operative policy for most of this data |

## Worked example: you are asked to ship a relative-matching feature

A product manager wants the feature every consumer-genomics company has: show each customer
their genetic relatives in the database. You have 500,000 customers in a population of 25
million, and an array assaying 600,000 SNPs. Work out what you are actually shipping.

**Step 1 — how identifying is the data?** From §1, at MAF 0.2 the genotype-match probability
between two unrelated people is 0.64² + 0.32² + 0.04² = 0.4096 + 0.1024 + 0.0016 = **0.5136** per
SNP. Uniqueness among 8 × 10⁹ people needs

```
n  >  ln(1.25e-10) / ln(0.5136)  =  (-22.80) / (-0.6663)  =  34.2   →   35 SNPs
```

You hold, per customer, a key with roughly **17,000 times** the SNPs required to be globally
unique. No transformation short of destroying the data makes it non-identifying, and hashing does
not help — an adversary with a candidate genotype hashes it the same way.

**Step 2 — how many non-customers does the feature expose?** Coverage *c* = 500,000 / 25,000,000
= **2%**. Using §1's conservative effective *N* ≈ 45 — remembering that it is an effective
parameter and that Erlich's own figures for a 2%-covered population are considerably higher:

```
P(≥1 detectable relative in the database)
   = 1 - (1 - 0.02)^45
   = 1 - exp(45 × (-0.020203))
   = 1 - exp(-0.9091)
   = 1 - 0.4028  =  0.597     →  about 60%
```

**Roughly 15 million people are now discoverable through your product, and that is the optimistic
number.** Half a million consented; the other 14.5 million were never asked and cannot opt out,
because the exposing data is not theirs to withdraw. Note the shape: coverage sits in the exponent, so exposure saturates
fast — doubling to 4% gives 1 − 0.96⁴⁵ = **84%**.

**Step 3 — what it does to breach severity.** Without matching, one compromised account yields one
profile. With matching, it yields that customer's relative list — names, degrees of relationship,
sometimes locations. The blast radius of a stolen credential is multiplied by the match-list
length, which is precisely the mechanism of the 2023 consumer-genomics breach.

**Step 4 — what the mitigations actually cover.**

| Proposal | Covers | Does not cover |
|---|---|---|
| Encrypt at rest and in transit | Storage compromise, interception | The threat here — authorised queries and legitimate outputs |
| Default the feature off | Customers who never enable it | The exposed non-customers, whose exposure comes from *relatives* enabling it |
| Rate-limit and anomaly-detect queries | Bulk enumeration, credential stuffing at scale | A targeted search for one person |
| Coarsen output ("3rd–5th cousin", no segment map) | Precision of pedigree reconstruction | Existence of the match, which is the identifying part |
| Law-enforcement policy requiring legal process | Casual access; sets a norm | A warrant, which overrides your settings (§1) |
| Commitments drafted to survive acquisition | Some post-sale risk | Bankruptcy court, a hard forum for promises with nothing behind them |

**Step 5 — the decision.** There is no purely technical answer, and that is the lesson. The
residual exposure of ~15 million non-consenting people is inherent in the feature, not a bug in
its implementation. What remains is a judgment about whether that exposure is worth what the
feature delivers — made, in this industry, by an engineer and a product manager, with no ethics
review, years before the first statute arrived.

**You are the person who will be asked to build this.** That is why this chapter sits in a book
about algorithms and file formats. Every consequential question in it — what to retain, what to
release, what defaults to set, whose reference panel to use, which ancestry label to hard-code
into a schema, whether a score should be shown to a clinician at all — arrives disguised as a
technical decision, and gets made by whoever is closest to the code.

## Connections

- **Back to:** [Ch 31 — Heritability](../part-06-quantitative-genetics/31-heritability-and-selection.md)
  supplies the two-pots argument §7 turns on ·
  [Ch 28 — Structure and inbreeding](../part-05-population-genetics/28-structure-and-inbreeding.md)
  supplies PCA and admixture estimation ·
  [Ch 29 — Linkage disequilibrium](../part-05-population-genetics/29-linkage-disequilibrium.md)
  explains why scores fail to transfer ·
  [Ch 53 — Polygenic scores](../part-11-human-and-statistical-genomics/53-polygenic-scores.md) and
  [Ch 55 — Clinical variant interpretation](../part-11-human-and-statistical-genomics/55-clinical-variant-interpretation.md)
  supply the portability and VUS mechanics of §6 ·
  [Ch 38 — Genome editing](../part-08-methods/38-genome-editing.md) supplies the molecular detail
  behind §9 and §10 · [Ch 57 — Genomics in practice](57-genomics-in-practice.md) is the clinical
  setting these problems arise in
- **Forward to:** nothing in this book — forward to the systems you build. Re-read
  [Ch 00](../part-00-orientation/00-the-whole-story.md). The whole story is short now, and it will
  read completely differently

## Check yourself

**1. A collaborator proposes releasing only per-variant allele frequencies from a 2,000-person case cohort, arguing that aggregates identify nobody. What do you tell them, and what do you propose instead?**

<details><summary>Answer</summary>

Aggregates do identify. Given a target's genotypes and a reference panel from the same
population, a likelihood-ratio statistic accumulated across hundreds of thousands of variants
detects whether the target contributed — the Homer et al. 2008 attack, which is why NIH withdrew
open aggregate GWAS data. Each variant's contribution is negligible and the sum is decisive, so
there is no threshold of "aggregate enough". And membership in a case cohort is itself the
sensitive fact, because it discloses the diagnosis.

Options, in rough order: controlled access with audit; a federated or trusted-research-environment
model where code runs against the data and only approved outputs leave; differential privacy for
coarse statistics such as counts and beacon responses, accepting that per-variant effect sizes are
outside DP's practical utility range; at minimum, common-variant frequencies behind rate-limited
queries. The residual problem survives every option: an output fine-grained enough to be
scientifically useful is usually fine-grained enough to leak membership.

</details>

**2. A dataset holds 3% of a population. Roughly what fraction is discoverable through relatives, taking the effective number of relatives close enough to give a detectable IBD match as ~45? Why does this break the consent model rather than merely strain it?**

<details><summary>Answer</summary>

P = 1 − (1 − 0.03)⁴⁵ = 1 − exp(45 × (−0.030459)) = 1 − exp(−1.3707) = 1 − 0.254 = **0.746**, about
**75%** — a floor rather than an estimate: *N* = 45 is a deliberately conservative effective
count, and fitting this model to Erlich's published results needs *N* somewhere between roughly
107 and 228.

It breaks rather than strains because consent is defined over the person who signs while the
exposure lands on people who did not sign and cannot withdraw — you cannot revoke your sibling's
genome. The unit of decision and the unit of harm are different objects. That is structural, not
a matter of better forms, and it is why biobanking has shifted weight from the consent document
to ongoing governance: access committees, use restrictions and community consultation are the
only mechanisms operating at the unit where exposure actually falls.

</details>

**3. A variant is reported "pathogenic" for a patient of West African ancestry by a pipeline whose frequency filter uses a European-ancestry reference panel. What can go wrong, and is this a defect in the ACMG framework?**

<details><summary>Answer</summary>

The frequency filter is the failure point. Classification uses "too common in the population to
cause a severe rare disease" as strong evidence against pathogenicity. If the panel lacks the
patient's ancestry, a common benign West African polymorphism looks absent-or-rare, survives the
filter, accumulates weaker supporting evidence, and is called pathogenic — precisely what Manrai
et al. (2016) documented for hypertrophic cardiomyopathy.

It is not a defect in the ACMG framework, which is agnostic about where the frequency estimate
comes from. It is a defect in the data fed to it. The fix is ancestry-matched frequencies — from
gnomAD's population-specific estimates and purpose-built cohorts — plus reporting the ancestry
assumption alongside the classification, so a reader can see which panel supported the call.

</details>

**4. Someone argues: trait T differs between two socially defined groups; twin studies put h² ≈ 0.6 within each group; therefore the difference is at least partly genetic. Identify every point at which this fails.**

<details><summary>Answer</summary>

Two failures are fatal on their own, from §7:

1. *h*² is computed from within-group variance and the between-group mean never enters its
   definition ([Ch 31](../part-06-quantitative-genetics/31-heritability-and-selection.md)).
2. The groups were not randomised into their environments, so the confound is comprehensive and
   correlated with the grouping by construction.

Three more close off the usual escape routes:

3. The obvious substitute measurement — comparing PRS means across ancestries — is confounded
   with the score's own portability failure, and nothing separates the two.
4. The nearest thing to a direct test, whether T tracks individual ancestry proportion within an
   admixed population, is contested — classic studies using weak ancestry proxies found nothing,
   genomic replications report non-null slopes — and is in any case not clean, because ancestry
   proportion within an admixed population is itself correlated with appearance, socioeconomic
   position and treatment. Failure 2 applies inside the population as well as between populations.
5. Twentieth-century score gains exceed the gaps at issue over intervals far too short for allele
   frequencies to have changed.

The argument fails at its inferential step and at its identification strategy, and every proposed
measurement that would rescue it inherits the same confound. Note that this does not require the
empirical literature in (4) to come out any particular way — which is the point of arguing it this
way round.

</details>

**5. Why is the fact that the Myriad ruling did not lower the cost of *interpretation* the most durable lesson in the governance section?**

<details><summary>Answer</summary>

Because it locates where value and power actually sit. The Court removed the patent on isolated
*BRCA1*/*BRCA2* DNA and testing prices collapsed — sequence is commodity. Myriad's database of
variant observations paired with clinical outcomes was untouched, and it kept it. Interpretation
is cumulative, expensive and defensible in a way sequence is not.

Two consequences. Access policy aimed at the assay layer keeps missing the bottleneck; what
worked was collective deposition — Sharing Clinical Reports, then ClinVar and ClinGen — rebuilding
a public evidence base. And the same logic explains §6: the interpretive advantage held by
populations sequenced first is an accumulating asset that compounds unless deliberately
counteracted. Both are the same problem — **the scarce resource is annotated observations, not
sequence.**

</details>
