# Further reading

Where to go after this curriculum, organised by what you want to do next. Annotated, because
an unannotated reading list is just a way of feeling productive without deciding anything.

## Textbooks

The three that matter, and what each is actually for.

**Griffiths et al., *Introduction to Genetic Analysis*** — the standard undergraduate genetics
text. Its strength is problem sets: hundreds of them, well-graded, and the reason it has
survived a dozen editions. If you want more practice than [`problem-sets/`](../problem-sets/)
provides, this is where to get it. Weak on modern genomics.

**Brown, *Genomes*** — the counterpart to Griffiths for genomics proper. Better than most at
explaining *why* techniques work rather than cataloguing them. Somewhat dated on sequencing
technology, which is unavoidable for any printed genomics book.

**Hartwell et al., *Genetics: From Genes to Genomes*** — a reasonable alternative to Griffiths
with a more molecular emphasis. Pick one, not both.

For the quantitative side, where the undergraduate texts thin out badly:

**Falconer & Mackay, *Introduction to Quantitative Genetics*** — still the clearest treatment
of variance decomposition, breeding values and response to selection. Old, and none the worse
for it; the theory has not moved. Read this if [Part 6](../part-06-quantitative-genetics/30-quantitative-traits.md)
left you wanting the full derivations.

**Hartl & Clark, *Principles of Population Genetics*** — the standard reference for
[Part 5](../part-05-population-genetics/26-hardy-weinberg.md). Thorough and fairly demanding.

**Wakeley, *Coalescent Theory: An Introduction*** — if the backward-in-time framing in
[Ch 34](../part-07-molecular-evolution/34-phylogenetics.md) appealed to you, this develops it
properly. Genuinely elegant mathematics.

**Vitti, Grossman & Sabeti**, and the selection-scan literature generally — for going deeper
than [Ch 33](../part-07-molecular-evolution/33-neutral-theory-and-selection-tests.md).

## Landmark papers

Read primary literature early. These are chosen because they are *readable*, not merely
important — many famous papers are impenetrable without period context.

| Paper | Why read it |
|---|---|
| Watson & Crick 1953, *Nature* | Two pages. The most consequential understatement in science ("It has not escaped our notice…"). Read it alongside Franklin & Gosling in the same issue, which supplied the data |
| Meselson & Stahl 1958, *PNAS* | Often called the most beautiful experiment in biology. The density-gradient logic is a masterclass in designing an experiment that can only come out three ways |
| Luria & Delbrück 1943 | Statistical reasoning used to settle a biological question — whether mutation precedes selection. The variance argument is the whole paper |
| Jacob & Monod 1961, *J Mol Biol* | The operon, and the invention of thinking about genes as a regulatory circuit |
| Kimura 1968, *Nature* | Neutral theory. Short, and it reframed molecular evolution permanently |
| McClintock's transposition work | Resisted for decades. Worth reading partly as a case study in how a field rejects an unfamiliar idea |
| International Human Genome Sequencing Consortium 2001, *Nature* | The draft genome. Read the analysis sections, not the methods |
| Nurk et al. 2022, *Science* — "The complete sequence of a human genome" | T2T-CHM13. What the last 8% contained |
| Liao et al. 2023, *Nature* — draft human pangenome | The conceptual shift from one reference to many. See [Ch 45](../part-09-genomics/45-reference-genomes-and-pangenomes.md) — and note that HPRC has since moved to Release 2 |
| Richards et al. 2015, *Genet Med* | The ACMG/AMP variant interpretation framework. Still the operative standard; read it before [Ch 55](../part-11-human-and-statistical-genomics/55-clinical-variant-interpretation.md) is applied in anger |
| Fisher 1918 | The paper that reconciled Mendelian inheritance with continuous variation and founded quantitative genetics. Hard going, but the argument is worth reconstructing |

## The SCA12 track (Part D)

Reading for the [specialisation track](../part-D-sca12/D1-neurons-and-the-cerebellum.md), grouped
in the order the track needs it. Same rule as above: annotated, or it is decoration.

### Neurobiology (D1)

| Paper | Why read it |
|---|---|
| Azevedo et al. 2009, *J Comp Neurol* 513(5):532–41 — "Equal numbers of neuronal and nonneuronal cells make the human brain an isometrically scaled-up primate brain" | The isotropic fractionator paper that killed the 100-billion-neuron and 10:1 glia:neuron figures in one go. Read it for the method as much as the number: it counts nuclei in brain homogenate, which is why it disagrees with section-based stereology |
| Andersen, Korbo & Pakkenberg 1992, *J Comp Neurol* 326(4):549–60 — "A quantitative study of the human cerebellum with unbiased stereological techniques" | The counterweight to Azevedo. Read the two together and you learn more about how contested "basic facts" are than either teaches alone |
| Masoli et al. 2024, *Commun Biol* 7:5 — "Human Purkinje cells outperform mouse Purkinje cells in dendritic complexity and computational capacity" | Reconstructs human and mouse Purkinje cells side by side. The 80%-of-human-PCs-have-2–3-trunks result quietly demolishes the one-climbing-fibre-per-Purkinje-cell diagram every textbook draws |
| Ito 2008, *Nat Rev Neurosci* 9(4):304–13 — "Control of mental activities by internal models in the cerebellum" | The clearest statement of what the cerebellum is *for*. Read it as a theory paper, because that is what it is — and once you accept it, ataxia, dysmetria and intention tremor stop being a list and become one prediction |
| Attwell & Laughlin 2001, *J Cereb Blood Flow Metab* 21(10):1133–45 — "An energy budget for signaling in the grey matter of the brain" | Builds the brain's ATP bill bottom-up from ion fluxes. A model course in "derive the number rather than cite it" — which is also why its own numbers have since been revised |
| Herrup & Yang 2007, *Nat Rev Neurosci* 8(5):368–78 — "Cell cycle regulation in the postmitotic neuron: oxymoron or new biology?" | Makes "postmitotic" a maintained state rather than a permanent fact, and shows that failure of that maintenance kills neurons |
| Fu, Hardy & Duff 2018, *Nat Neurosci* 21(10):1350–58 — "Selective vulnerability in neurodegenerative diseases" | The canonical statement of the puzzle: ubiquitous genes, selective death. Start here before believing any mechanistic story about why one cell type dies |
| Saxena & Caroni 2011, *Neuron* 71(1):35–48 — "Selective neuronal vulnerability in neurodegenerative diseases: from stressor thresholds to degeneration" | The complementary framing: vulnerability as a threshold phenomenon in cells already running near their stress ceiling. Pairs directly with Purkinje pacemaking |
| Hara et al. 2006, *Nature* 441(7095):885–9 and Komatsu et al. 2006, *Nature* 441(7095):880–4 | Back-to-back papers deleting *Atg5* and *Atg7* from the mouse CNS. Neurodegeneration with ubiquitin inclusions and no disease protein anywhere — the cleanest demonstration that inclusions are a readout of clearance failure, not a diagnosis of cause |
| Airaksinen et al. 1997, *PNAS* 94(4):1488–93 — "Ataxia and altered dendritic calcium signaling in mice carrying a targeted null mutation of the calbindin D28k gene" | Deleting one calcium buffer produces ataxia. The single strongest piece of evidence that Purkinje calcium handling is not a bystander |
| Piochon et al. 2007, *J Neurosci* 27(40):10797 — "NMDA receptor contribution to the climbing fiber response in the adult mouse Purkinje cell" | Overturns the textbook claim that adult Purkinje cells lack functional NMDA receptors. Worth reading as an object lesson in how a negative result becomes a "fact" |
| Schmitz-Hübsch et al. 2006, *Neurology* 66(11):1717–20 — "Scale for the assessment and rating of ataxia: development of a new clinical scale" | The scale you will meet in every ataxia trial. Read the validation statistics, then notice what is missing: no MCID |
| Bhatia et al. 2018, *Mov Disord* 33(1):75–87 — MDS Consensus Statement on the classification of tremors | The two-axis framework that makes "action tremor" a precise claim instead of a description. Essential before writing a sentence about SCA12's presenting tremor |
| Mascalchi et al. 2014, *PLoS ONE* 9(2):e89410 — "Progression of brain atrophy in spinocerebellar ataxia type 2: a longitudinal tensor-based morphometry study" | What an MRI atrophy biomarker actually looks like in an SCA cohort, including detection in preclinical carriers |

### PP2A and *PPP2R2B* (D2)

| Paper | Why read it |
|---|---|
| O'Hearn et al. 2001, *Neurology* 56(3):299–303 — "SCA-12: Tremor with cerebellar and cortical atrophy is associated with a CAG repeat expansion" | The clinical description that put "and cortical" into the phenotype — the reason a purely cerebellar mechanism was always going to be too tidy |
| Lin et al. 2010, *Hum Genet* 128(2):205–12 — "The CAG repeat in SCA12 functions as a *cis* element to up-regulate *PPP2R2B* expression" | Supplies the direction of the dosage change. Without this the whole mechanism has no sign |
| Dagda et al. 2003, *J Biol Chem* 278(27):24976–85 — "A developmentally regulated, neuron-specific splice variant of the variable subunit Bbeta targets protein phosphatase 2A to mitochondria and modulates apoptosis" | The keystone paper for the Bβ1/Bβ2 distinction. Three results matter: the N-terminus is pure targeting, Bβ2 holoenzymes are 10-fold rarer, and the apoptotic effect requires holoenzyme assembly |
| Dagda et al. 2005, *J Biol Chem* 280(29):27375–82 — "Unfolding-resistant translocase targeting" | How a protein gets stuck in the outer mitochondrial membrane by starting import and refusing to unfold. A satisfying mechanism, and a reminder that localisation can be an accident of biophysics |
| Merrill, Slupe & Strack 2013, *FEBS J* 280(2):662–73 | Ser20/21/22 phosphorylation gates Bβ2's trip to the mitochondrion — so the targeting signal is itself under phospho-regulation. Regulation all the way down |
| Dickey & Strack 2011, *J Neurosci* 31(44):15716–26 — "PKA/AKAP1 and PP2A/Bβ2 regulate neuronal morphogenesis via Drp1 phosphorylation and mitochondrial bioenergetics" | One residue, two opposed enzymes anchored on the same membrane, opposite morphological outcomes. The best available illustration of the kinase/phosphatase-ratio idea in a neuron |
| Xu et al. 2006, *Cell* 127(6):1239–51 — "Structure of the protein phosphatase 2A holoenzyme" | The B55 holoenzyme structure. Look at the acidic groove on the propeller's face and the specificity argument makes itself |
| Cho & Xu 2007, *Nature* 445(7123):53–7 — "Crystal structure of a protein phosphatase 2A heterotrimeric holoenzyme" | The B56 counterpart, published within months. Two unrelated folds docking onto the same scaffold is the structural fact behind combinatorial specificity |
| Xing et al. 2006, *Cell* 127(2):341–53 — "Structure of protein phosphatase 2A core enzyme bound to tumor-inducing toxins" | Where okadaic acid and microcystin actually bind. Read before interpreting any experiment that uses them as "PP2A inhibitors" |
| Shi 2009, *Cell* 139(3):468–84 — "Serine/threonine phosphatases: mechanism through structure" | The review that makes the kinase/phosphatase asymmetry vivid: hundreds of kinases, about thirty Ser/Thr catalytic subunits, and all the specificity built combinatorially |
| Sandal et al. 2021, *J Cell Sci* 134(13):jcs248187 — "Protein phosphatase 2A – structure, function and role in neurodevelopmental disorders" | From Strack's own lab; the most usable modern overview, and the one that puts a number (≥50%) on PP2A's share of cellular Ser/Thr dephosphorylation |
| Haanen, O'Connor & Narla 2022, *J Biol Chem* 298(12):102656 — "Biased holoenzyme assembly of protein phosphatase 2A: from cancer to small molecules" | Assembly *bias* as the organising idea — exactly the framing SCA12 needs. Also the clearest account of Leu309 methylation gating B-subunit choice |
| Liu et al. 2005, *Eur J Neurosci* 22(8):1942–50 — "Contributions of protein phosphatases PP1, PP2A, PP2B and PP5 to the regulation of tau phosphorylation" | Where "PP2A is the major tau phosphatase" comes from, with the 71/11/10/7 split and the *K*<sub>m</sub> values that make abundance matter |
| Kuo et al. 2008, *J Biol Chem* 283(4):1882–92 | B55α targets Akt Thr308. Read it to see how specific the subunit–substrate pairing gets — and note it is B55**α**, not β, before transferring the result to *PPP2R2B* |
| Tanimukai, Grundke-Iqbal & Iqbal 2005, *Am J Pathol* 166(6):1761–71 — "Up-regulation of inhibitors of protein phosphatase-2A in Alzheimer's disease" | The endogenous inhibitors I₁PP2A and I₂PP2A, and what happens to them in AD brain. A second route to "too little PP2A activity" that does not touch the genes |
| Junttila et al. 2007, *Cell* 130(1):51–62 — "CIP2A inhibits PP2A in human malignancies" | PP2A as a tumour suppressor, inhibited by a dedicated oncoprotein. Useful for seeing that the same enzyme's dosage matters in two entirely different disease families |

### Repeat-expansion disorders (D3)

| Paper | Why read it |
|---|---|
| Huntington's Disease Collaborative Research Group 1993, *Cell* 72:971–983 | "A novel gene containing a trinucleotide repeat that is expanded and unstable on Huntington disease chromosomes." The paper that turned a linkage peak into a mechanism, and note the honest ranges in it — 30–70 in affected, 9–34 in normals — before anyone knew where the boundary was |
| La Spada et al. 1991, *Nature* 352:77–79 | The first repeat expansion ever found. 35 unrelated Kennedy-disease patients had an expanded androgen-receptor CAG, 75 controls had none. Read it for how quickly a clean association can settle a question |
| Verkerk et al. 1991, *Cell* 65:905–914 | *FMR-1* and the CGG repeat at the fragile site. The founding case for expansion-by-silencing, as opposed to expansion-by-poisoned-protein |
| Campuzano et al. 1996, *Science* 271(5254):1423–1427 | Friedreich ataxia as an intronic GAA expansion — the paper that broke the assumption that repeat diseases are coding and dominant. Recessive, non-coding, loss of function, all at once |
| Pearson, Edamura & Cleary 2005, *Nat Rev Genet* 6:729–742 | "Repeat instability: mechanisms of dynamic mutations." Still the clearest single account of why slipped-strand intermediates form and survive. Read it before any of the mechanism papers below |
| Kovtun et al. 2007, *Nature* 447:447–452 | OGG1 initiates age-dependent CAG expansion. The insight that expansion in a neuron that will never divide again must come from *repair*, and the escalating oxidation–excision cycle that follows |
| GeM-HD Consortium 2015, *Cell* 162(3):516–526 | The first HD onset-modifier GWAS. Two effects at one chromosome-15 locus pulling in opposite directions (6.1 years earlier, 1.4 years later) — a useful antidote to one-locus-one-direction thinking |
| GeM-HD Consortium 2019, *Cell* 178(4):887–900 | "CAG Repeat Not Polyglutamine Length Determines Timing of Huntington's Disease Onset." The CAA-interruption result is the cleanest natural experiment in the field: add glutamines while shortening the uninterrupted CAG, and onset gets *later* |
| Swami et al. 2009, *Hum Mol Genet* 18(16):3039–3047 | Somatic expansion in human HD brain associates with earlier onset. The observation the whole two-step model rests on |
| Handsaker et al. 2025, *Cell* 188(3):623–639.e19 | Single-cell repeat sizing in postmortem striatum. Striatal projection neurons expand and other cell types do not, and the transcriptional collapse starts around 150 CAG. The best current evidence that somatic expansion is the disease clock |
| Miller et al. 2000, *EMBO J* 19:4439–4448 | Muscleblind proteins recruited to (CUG)n foci in DM1 *and* DM2 cells. The founding observation for RNA gain of function — and the reason two different motifs in two different genes make one disease |
| Cho et al. 2005, *Mol Cell* 20:483–489 | Antisense transcription and heterochromatin at the DM1 CTG repeat, held in check by CTCF. Read it when you want to stop thinking of a repeat as sitting in one gene |
| Zu et al. 2011, *PNAS* 108(1):260–265 | RAN translation. Expansion constructs make polyGln, polyAla and polySer with no ATG anywhere. A result that should have been impossible, and that rewrote what "non-coding repeat" means |
| Mori et al. 2013, *Science* 339:1335–1338 | C9orf72 dipeptide-repeat proteins in FTLD/ALS brain — poly-GA dominant, plus poly-GP and poly-GR from three frames. RAN translation caught in human tissue |
| Ash et al. 2013, *Neuron* 77:639–646 | The companion result to Mori, arrived at independently. Two labs, same conclusion, same year — read both and notice how much of the confidence comes from that |
| Haeusler et al. 2014, *Nature* 507(7491):195–200 | G-quadruplexes and R-loops at the C9orf72 repeat, and the abortive transcripts they generate. The best worked example of structure-causes-disease rather than structure-accompanies-disease |
| DeJesus-Hernandez et al. 2011, *Neuron* 72(2):245–256 | The C9orf72 expansion itself. Worth reading alongside the Renton paper published back-to-back with it — two groups, one locus, one issue |
| Ishiura et al. 2018, *Nat Genet* 50(4):581–590 | Intronic TTTCA/TTTTA expansions in benign adult familial myoclonic epilepsy. The class where the pathogenic event is an *insertion of a new motif inside an existing repeat*, not lengthening of the old one |
| Seixas et al. 2017, *AJHG* 101(1) | SCA37: an (ATTTC)n inserted inside an (ATTTT)n. Read it directly after Ishiura — same trick, different chromosome, different disease. The strongest argument that motif identity, not motif length, can be the mutation |
| Kobayashi et al. 2011, *AJHG* 89(1):121–130 | SCA36 and the first hexanucleotide expansion disease, published months before C9orf72. A reminder that "the first hexanucleotide repeat disease" is not the one everybody names |
| Sato et al. 2009, *AJHG* | SCA31: a 2.5–3.8 kb pentanucleotide insertion, RNA foci in 30–50% of Purkinje cell nuclei. The disease where the "repeat length" is most naturally measured in kilobases |
| Pellerin et al. 2023, *NEJM* | Deep-intronic *FGF14* GAA expansion as a frequent cause of late-onset ataxia — present in 61% of French-Canadian index patients. Read it for what genome-wide repeat calling found that thirty years of candidate-gene work had missed |
| *Nat Genet* 2024;56:1080–1089 (SCA4/*ZFHX3*) | A GGC expansion encoding **polyglycine**, solving a locus that had been mapped since 1996. Polyglycine disorders are the newest mechanism class in the table |
| *Nature* 2026;650:920–929, "Insights into DNA repeat expansions among 900,000 biobank participants" | Repeat instability measured at population scale in UK Biobank and *All of Us*: locus-specific germline and blood mutation rates, common alleles that expand with age, and 29 loci where inherited variants increase somatic expansion. The paper that moves this field from families to populations |

### SCA12 itself (D4–D5)

| Paper | Why read it |
|---|---|
| Holmes et al. 1999, *Nat Genet* 23:391–392 | The founding two-page letter. Read it for the method, not the conclusion: repeat expansion detection found a long CAG tract *before* anyone knew which gene it was in, the reverse of how SCA1–3 were solved. It is also a study of one family, which is worth remembering every time SCA12 is described confidently |
| Holmes, O'Hearn & Margolis 2003, *Cytogenet Genome Res* 100:189–197 | Titled "Why is SCA12 different from other SCAs?" and it earns the title. The clearest statement of what a non-coding repeat in a phosphatase subunit does *not* have in common with a polyglutamine ataxia — no polyQ protein, tremor before ataxia, cortex before cerebellum |
| Bahl et al. 2005, *Ann Hum Genet* 69:528–534 | A textbook founder-effect analysis: four novel SNPs plus a dinucleotide marker across ~137 kb, one haplotype at P = 0.000 in 20 families — and the haplotype is *absent* from the American pedigree, so the mutation arose at least twice. Read it as a worked example of how to prove a founder without a genome |
| Srivastava, Takkar, Garg & Faruq 2017, *Brain* 140:27–36 | The paper that moved the pathogenic threshold from 51 down to 43, on 18 patients from 16 families, and that reports the two biallelic carriers. The most consequential clinical-genetics paper in SCA12, and a good argument about where a "normal" allele stops being normal |
| Dagda et al. 2008, *J Biol Chem* 283:36241–36248 | The mitochondrial-fission mechanism at its most persuasive: Bβ2 dephosphorylates Drp1 at S637, fragmentation is required for death, and silencing Bβ2 protects neurons against three different insults. Then ask yourself where the SCA12 repeat is relative to the Bβ2 transcript, and notice the missing step |
| Wang et al. 2011, *J Biol Chem* 286:21742–21754 | The *Drosophila* model. Overexpression causes degeneration and mitochondrial fragmentation, and antioxidants plus SOD2 rescue lifespan — a rare instance in this field of a rescue experiment that names its mediator |
| O'Hearn et al. 2015, *Mov Disord* 30:1813–1824 | The neuropathology of record: cortical atrophy exceeding cerebellar, Purkinje loss, and ubiquitin-positive intranuclear inclusions that stain for **none** of polyQ, tau, α-synuclein or TDP-43. Every negative in that list closes off a hypothesis |
| Ganaraja et al. 2022, *Tremor Other Hyperkinet Mov* 12:13 | The largest single-centre clinical series (49 patients). Two findings matter: 6.1% had a normal MRI, and 10.2% were explicitly non-Agarwal. SCA12 is founder-enriched, not founder-restricted, and imaging does not rule it out |
| Sharma et al. 2022, *Adv Genet* 3:2100078 | Ten years and ~5,600 referrals of Indian ataxia genetics in one table. SCA12 at 8.6% edges SCA2 at 8.5% — read it for the frequencies, and for the honest reporting of biallelic expansions, co-occurring subtypes and premutable normal alleles |
| Zhou et al. 2023, *Mov Disord* 38:2230–2240 | Establishes bidirectional transcription at the locus and a CUG-repeat antisense transcript, PPP2R2B-AS1, that forms foci and undergoes RAN translation in the alanine frame. The preprint version also admits the expanded transcript could not be reliably detected in post-mortem brain — read both |
| Kumar et al. 2024, *iScience* 27:109768 | Patient iPSC neurons from three Indian SCA12 donors: nuclear RNA foci, 13 proteins sequestered, RAN translation in the polyQ and polySer frames. It also reports most *PPP2R2B* isoforms **down** in mature neurons, which contradicts the overexpression model the field has run on since 2010 |
| Zhou et al. 2024, *Mov Disord* 39:1886–1891 | The other half of the argument: expansion raises Bβ1 and produces an apoptotic polyserine tract. Read it back-to-back with Kumar 2024 and decide what you actually believe about *PPP2R2B* expression in SCA12 |
| Parthaje et al. 2025, *Cerebellum* 24:60 | Somatic instability, methylation and expression across regions of a single SCA12 brain. The cerebellum showed the *least* instability — the opposite of the striatal pattern in Huntington disease. One brain, and the most interesting one-brain paper in the field |
| Mohapatra et al. 2026, *Mov Disord* 41:373–383 | The first randomised controlled trial in SCA12: 60 patients, extended-release propranolol to 240 mg/day, significant tremor reduction on TETRAS with SARA and quality-of-life gains. Symptomatic, not disease-modifying, and a useful benchmark for what trial-readiness in a rare ataxia actually looks like |
| Sandal et al. 2025, *Hum Mol Genet* (PMID 39565297) | *De novo* **missense** variants in *PPP2R2B* cause a neurodevelopmental syndrome by impairing holoenzyme assembly, mitochondrial targeting and Drp1 dephosphorylation. The loss-of-function counterpart to SCA12's presumed gain-of-function, at the same gene — the cleanest available test of what Bβ actually does |

### Repeat genotyping and expression methods (labs 11–12)

| Paper | Why read it |
|---|---|
| Dolzhenko et al. 2017, *Genome Res* 27:1895–1903, "Detection of long repeat expansions from PCR-free whole-genome sequence data" | The paper that made repeat expansions visible in ordinary WGS: anchored in-repeat reads turn "unmappable" reads into the signal. All 212 *C9orf72* expansions found in 3,001 ALS genomes |
| Dolzhenko et al. 2019, *Bioinformatics* 35:4754–4756, "ExpansionHunter: a sequence-graph-based tool to analyze variation in short tandem repeat regions" | The v3+ rewrite: loci as sequence graphs, which is why the catalog can express `(GCT)*` with interruptions and adjacent variants. This is the tool lab-11 runs |
| Dolzhenko et al. 2022, *Genome Med* 14:84, "REViewer: haplotype-resolved visualization of read alignments in and around tandem repeats" | Why a genotype should never be reported without looking at the pileup — read the figures, then look at your own SVG from lab-11 |
| Dolzhenko et al. 2020, *Genome Biol* 21:102, "ExpansionHunter Denovo: a computational method for locating known and novel repeat expansions in short-read sequencing data" | Catalog-free discovery: what you can find when you stop telling the genotyper where to look — and the price (detection, not genotypes) |
| Dashnow et al. 2022, *Genome Biol* 23:257, "STRling: a k-mer counting approach that detects short tandem repeat expansions at known and novel loci" | The k-mer alternative to alignment-based genotyping; good on why novel expansion loci are hard |
| Mousavi et al. 2019, *Nucleic Acids Res* 47:e90, "Profiling the genome-wide landscape of tandem repeats expansions" (GangSTR) | Genome-wide STR genotyping with an explicit model of each read class; the clearest published taxonomy of enclosing/flanking/spanning/in-repeat evidence |
| Dolzhenko et al. 2024, *Nat Biotechnol* 42:1606–1614, "Characterization and visualization of tandem repeats at genome scale" (TRGT) | The long-read endgame: genotype, consensus sequence and methylation of ~1M tandem repeats from HiFi, with 98.4% Mendelian concordance |
| Warner et al. 1996, *J Med Genet* 33:1022–1026, "A general method for the detection of large CAG repeat expansions by fluorescent PCR" | The origin of repeat-primed PCR — one clever primer design that clinical labs still run thirty years later. Read it to understand what the stutter ladder can and cannot say |
| Grasso et al. 2014, *J Mol Diagn* 16:23–31, "A novel methylation PCR that offers standardized determination of FMR1 methylation and CGG repeat length without Southern blot analysis" | How methylation-sensitive digestion plus PCR retired the Southern blot for most fragile X testing |
| Chintalaphani et al. 2021, *Acta Neuropathol Commun* 9:98, "An update on the neurological short tandem repeat expansion disorders and the emergence of long-read sequencing diagnostics" | The review that connects Part's disease chapters to this lab: all major STR disorders, all assay generations, one place |
| Byrska-Bishop et al. 2022, *Cell* 185:3426–3440, "High-coverage whole-genome sequencing of the expanded 1000 Genomes Project cohort including 602 trios" | The provenance of lab-11's data: 3,202 genomes at 30x, openly downloadable. Know your sample before you genotype it |
| Wilks et al. 2021, *Genome Biol* 22:323, "recount3: summaries and queries for large-scale RNA-seq expression and splicing" | 750,000 uniformly reprocessed RNA-seq samples behind one R call — the programmatic route to GTEx if the flat files in lab-12 leave you wanting more |
| Siletti et al. 2023, *Science* 382:eadd7046, "Transcriptomic diversity of cell types across the adult human brain" | The atlas lab-12 dissects: ~3 million nuclei, ~100 dissections, 3 donors, 461 clusters — and the cerebellum files small enough for your laptop |

### Standing references for the track

**Purves et al., *Neuroscience*** (NCBI Bookshelf, [NBK10865](https://www.ncbi.nlm.nih.gov/books/NBK10865/) for cerebellar circuits) — free, and the cerebellum chapters are the right length for a geneticist who needs the wiring diagram and nothing more. Skip the sensory chapters; read "Circuits within the Cerebellum" and "Projections from the Cerebellum" and you have enough to read the SCA literature without drowning.

**GeneReviews and OMIM ([#604326](https://omim.org/entry/604326) for SCA12)** — not reading for pleasure, but the discipline of checking a phenotype claim against OMIM before repeating it is exactly the habit this course is trying to build. OMIM's *Clinical Features* section is a curated bibliography disguised as a summary.

**The Human Protein Atlas and the GTEx Portal** — use them as instruments, not encyclopaedias. Both were queried directly while writing [D2](../part-D-sca12/D2-kinases-phosphatases-and-pp2a.md), and both **contradicted** the convenient claim that *PPP2R2B* is cerebellum-enriched. If a chapter asserts a tissue expression pattern without a query behind it, that is a defect worth flagging.

## Databases and resources

The ones you will actually use. Check versions — everything here moves.

**Sequence and annotation**
- [Ensembl](https://www.ensembl.org) and [UCSC Genome Browser](https://genome.ucsc.edu) — the two
  main browsers. Learn one properly; UCSC's track system rewards investment
- [GENCODE](https://www.gencodegenes.org) — the reference annotation. Its
  [statistics page](https://www.gencodegenes.org/human/stats.html) is where this curriculum's
  gene counts come from
- [NCBI](https://www.ncbi.nlm.nih.gov) — RefSeq, GenBank, PubMed, SRA

**Variation**
- [gnomAD](https://gnomad.broadinstitute.org) — population allele frequencies. The single most
  useful resource in clinical genomics
- [ClinVar](https://www.ncbi.nlm.nih.gov/clinvar/) — clinical variant assertions. Read the
  evidence, not the label
- [ClinGen](https://clinicalgenome.org) — gene-disease validity, dosage sensitivity, and the
  SVI recommendations that refine ACMG
- [dbSNP](https://www.ncbi.nlm.nih.gov/snp/), [GWAS Catalog](https://www.ebi.ac.uk/gwas/)

**Functional**
- [GTEx](https://gtexportal.org) — expression and eQTLs across human tissues
- [ENCODE](https://www.encodeproject.org) — regulatory element annotation
- [Human Cell Atlas](https://www.humancellatlas.org), [Single Cell Portal](https://singlecell.broadinstitute.org)
- [COSMIC](https://cancer.sanger.ac.uk/cosmic) — somatic mutations and mutational signatures
- [UniProt](https://www.uniprot.org), [AlphaFold DB](https://alphafold.ebi.ac.uk), [PDB](https://www.rcsb.org)

**Model organisms** — FlyBase, WormBase, SGD, MGI, ZFIN, TAIR. Each is the authoritative
annotation for its organism and generally better curated than the generic databases.

## Courses and lectures

- **MIT 7.03 Genetics** and **7.28 Molecular Biology** — full lecture videos on OCW. Strong on
  the classical material
- **Harvard/Broad StatGen resources** — for the statistical genetics in
  [Part 11](../part-11-human-and-statistical-genomics/51-gwas.md)
- **Rosalind** ([rosalind.info](http://rosalind.info)) — bioinformatics as programming problems.
  Excellent fit for this curriculum's reader; do these alongside [`labs/`](../labs/)
- **Biostars** ([biostars.org](https://www.biostars.org)) — the field's Stack Overflow. Search
  it before debugging anything; someone has hit your error

## Keeping current

Genomics rots. [`verified-facts.md`](verified-facts.md) records what will rot first in this
curriculum, but for the field generally:

- **bioRxiv/medRxiv** — where the field actually publishes first
- **Genome Biology**, **Nature Methods**, **Nature Genetics**, **AJHG** — for methods and human genetics
- **Heng Li's blog and GitHub** — consistently the clearest thinking on alignment and assembly
- **Conference proceedings** — ASHG for human genetics, ISMB/RECOMB for computational, AGBT for technology

A working habit worth adopting: when you encounter a number in a paper, check whether it is
current before you repeat it. Building this curriculum turned up a pangenome release two years
out of date and a sequencing platform six weeks old, both of which would have been written
confidently and wrongly from memory.

## On the ethics and social dimension

Do not treat [Ch 58](../part-12-applications-and-ethics/58-ethics-and-society.md) as the end
of the subject.

- **Rutherford, *A Brief History of Everyone Who Ever Lived*** — accurate popular treatment of
  human genetic history, and good on why continental race categories fail as genetics
- **Skloot, *The Immortal Life of Henrietta Lacks*** — consent, exploitation, and what
  researchers owe the people whose samples they use
- **Kevles, *In the Name of Eugenics*** — the history that explains why genetics carries the
  political weight it does. Uncomfortable and necessary
- **Comfort, *The Science of Human Perfection*** — how medical genetics and eugenics were
  entangled far longer than the field likes to admit
- **Nelson, *The Social Life of DNA*** — genetic ancestry testing, identity, and reconciliation

The historical material is not decoration. Most contemporary arguments about genetics and
society are replays, and knowing the earlier round is the fastest way to evaluate the current one.
