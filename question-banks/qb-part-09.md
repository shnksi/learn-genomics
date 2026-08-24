# Question bank — Part 09: Genomics

Covers [Ch 39-45](../part-09-genomics/39-genome-landscapes.md).

Convert to Anki: `python reference/to_anki.py question-banks/ --out anki-import.tsv`

## Genome size, gene number and function

Q: State the C-value paradox precisely, as a rejected hypothesis rather than a curiosity.
A: It is the emphatic rejection of the hypothesis that genome size increases with organismal complexity or with gene number. Genome size varies across life by six orders of magnitude and predicts neither: a pufferfish carries roughly the human gene count in an eighth of the DNA, an onion has about five times the human genome, and a fork fern has 160.45 Gb.

Q: Why is a within-genus genome-size comparison stronger evidence against the complexity hypothesis than human versus onion?
A: Human versus onion is a between-kingdom comparison, so a defender can always appeal to unmeasured differences. Within a single genus -- Allium, Drosophila, plethodontid salamanders -- species differ several-fold in genome size while being nearly identical in anatomy and gene content. Whatever varies must vary far faster than morphological divergence, which excludes any explanation running through complexity.

Q: People say the C-value paradox is unresolved. What is actually still open?
A: The paradox -- size not tracking gene number -- was resolved once non-coding DNA was discovered. What remains is the C-value enigma: not whether the extra DNA is non-genic (it is), but why lineages differ so wildly in how much they accumulate, and whether the amount has any consequence.

Q: Across eukaryotes, genome size varies over five orders of magnitude while gene number varies over about one. Which component carries the variance, and why that one?
A: Repeat content -- transposable element copies and their degraded remains, plus tandem arrays -- with a secondary contribution from mean gene length as introns expand in large genomes. Repeats are the only genome component with an intrinsic replication mechanism of their own; everything else changes copy number only through comparatively rare duplication events. Genome size is essentially a repeat-load statistic.

Q: What is the G-value paradox, and what resolves it?
A: Gene number barely tracks complexity: C. elegans has about 20,000 protein-coding genes against the human 19,442. The resolution is combinatorial, and therefore invisible in a gene count -- alternative splicing (644,292 transcripts over 78,733 annotated genes, about 8.2 each; Drosophila Dscam alone makes 38,016 isoforms from one locus), roughly a million candidate cis-regulatory elements at about fifty per protein-coding gene, and post-transcriptional and post-translational layers on top.

Q: Marine bacteria and insect endosymbionts both have very small genomes. Why is calling both of them streamlined a mistake?
A: Opposite causes. Free-living marine bacteria have effective population sizes around 10^8 to 10^9, so 1/Ne sits at or below the small selective cost of carrying an extra kilobase and non-coding DNA is purged by selection; their genomes are compact and clean. Endosymbionts pass through severe bottlenecks every host generation, so Ne is minuscule, selection is impotent, and genes are lost by drift -- leaving degraded, AT-skewed, pseudogene-ridden genomes. Same outcome on size, opposite positions on efficacy of selection. (Caveat: a mutation-accumulation experiment puts Prochlorococcus itself at Ne ~10^7, so the flagship streamlining case may be partly drift.)

Q: State Lynch's mutational-hazard explanation of genome size quantitatively.
A: A non-coding insertion is not neutral: it carries a small replication and mutational cost, a selection coefficient perhaps of order 10^-6 to 10^-8. Selection acts only on variants with absolute s substantially greater than 1/Ne. Multicellular eukaryotes have Ne of 10^4 to 10^5, so 1/Ne is 10^-4 to 10^-5, larger than the cost, and insertions drift to fixation. Genome size is therefore a readout of demographic history rather than of biology.

Q: ENCODE reported that ~80% of the human genome is functional; comparative genomics says 5-10%. Is one of them wrong?
A: Neither measurement is wrong; they measure different things. Causal-role function asks what a sequence does and is evidenced by biochemical activity in an assay -- ~80%. Selected-effect function asks what a sequence is for and is evidenced by sequence conserved under purifying selection -- ~5-10%. The claim that junk DNA had been overturned needs the selected-effect sense, and biochemical assays cannot supply it.

Q: Give the three-part critique of the ENCODE 80% figure.
A: Biochemical activity is expected of inert DNA -- polymerase initiates spuriously and transcription factors bind degenerate motifs by the millions -- and 80% was reported with no null model for what random sequence would give. The threshold was permissive, taking a union of "at least one event in at least one cell type" over many assays. And two different concepts of function were conflated, which is the load-bearing objection.

Q: What is the onion test, and what job does it do in an argument about non-coding DNA?
A: Gregory's rhetorical device: whatever function you propose for non-coding DNA, explain why an onion needs about five times more of it than a human, and why one Allium species needs several times more than its close relative. It is a plausibility filter rather than a disproof -- it cannot show any particular sequence is junk -- but any claim of near-universal function has to answer it, and the ENCODE 80% framing never did. Chapter 39 calls it the most efficient bad-argument filter in the field.

Q: Sketch the mutational-load bound on the functional fraction of the genome, and say what it gives.
A: About 70 new SNVs arise per zygote (6.2 Gb diploid at 1.1 to 1.3 x 10^-8 per bp per generation). With functional fraction f and probability delta that a mutation in functional sequence is deleterious, U = 70 x f x delta and each couple must produce 2e^U children. At f = 0.8 and delta = 0.5 that is about 3 x 10^12 children per couple. Inverting with a completed family size of about 5 gives U <= 0.92 and f <= 2.6% at delta = 0.5, 6.5% at 0.2, 13.1% at 0.1. The bound is model-dependent -- synergistic epistasis or truncation selection raises the ceiling several-fold, and it bounds selected-effect function only. The robust output is that f = 0.8 is unreachable, not the figure 2.6%.

Q: Why is the 5-10% constrained estimate a lower bound rather than proof that the rest is junk?
A: A substitution-rate test only detects sequence whose identity is constrained. Sequence whose presence matters but whose identity does not -- spacers, some structural DNA -- is invisible to it, as is anything that evolved too recently to have accumulated a signal.

Q: Junk DNA is often called a discredited idea, and "non-coding means non-functional" an exploded myth. What is the honest position on each?
A: Ohno's inference was correct and still is: population genetics limits how much sequence a species can maintain against mutation, so most of a large genome cannot be under selection. The word was bad, not the population genetics. But the over-correction is equally wrong: for the roughly 36,000 annotated lncRNA genes specifically, function is demonstrated for a small minority and most show little sequence constraint. Being annotated as a gene is not evidence of function.

## Repeats and genome texture

Q: Repeats are often treated as one problem. Which analysis does each class actually break?
A: Interspersed repeats, the transposable-element relics, destroy mapping uniqueness. Tandem arrays -- satellite, minisatellite, microsatellite -- defeat assembly. Segmental duplications cause recurrent disease-associated rearrangements by non-allelic homologous recombination. Repeats are classified by arrangement, not by origin.

Q: One mechanism gives short tandem repeats both a forensic use and a disease role. What is it?
A: Polymerase slippage during replication adds or removes whole repeat units, so a locus becomes highly polymorphic in copy number within a few generations. Forensics genotypes about 20 unlinked STR loci, treats them as independent and multiplies allele-frequency products, driving the random-match probability below 10^-18. Above a threshold length, slippage becomes strongly biased toward expansion, so the repeat grows down a pedigree -- producing anticipation, as in HTT (CAG) and FMR1 (CGG).

Q: HTT and FMR1 are the canonical repeat-expansion loci. Why is borrowing one locus's allele ladder for the other a mistake?
A: The rungs are locus-specific. HTT (CAG) runs normal / intermediate / reduced-penetrance / full-penetrance, at <=26 / 27-35 / 36-39 / >=40 repeats. FMR1 (CGG) runs normal / intermediate / premutation / full mutation. There is no HTT "premutation" -- HTT's third rung is a reduced-penetrance allele -- so describing an HTT allele in fragile-X vocabulary names a category that does not exist at that locus.

Q: Why are the deletions and duplications caused by segmental duplications recurrent across unrelated patients?
A: Because the breakpoints are fixed by the positions of the flanking duplication blocks. Two near-identical blocks misalign in meiosis and recombination between them deletes or duplicates everything in between, so unrelated patients get the same interval at the same size. 22q11.2 deletion syndrome, the PMP22 duplication and deletion at 17p12, Williams-Beuren and Smith-Magenis are the same mechanism at different loci.

Q: Is it true that Alu elements make short reads unmappable?
A: Only the young ones. Alu copies have diverged 5-20% from one another over about 65 million years, so most Alu-derived reads do map uniquely -- measured mappability puts about 89% of annotated transposable-element sequence in the uniquely mappable class at 100 bp paired-end. The mapping problem is concentrated in the recently active subfamilies such as AluYa5 and AluYb8, which are also the polymorphic ones you would most like to genotype.

Q: Why is CpG depleted genome-wide, and what does a surviving CpG island therefore record?
A: Cytosine in a CpG is usually methylated, and 5-methylcytosine deaminates to thymine, giving a G:T mispair in which both bases are perfectly normal DNA; the TDG and MBD4 glycosylases that must repair it are far less efficient than the uracil glycosylase clearing the U:G product of deaminating an unmethylated cytosine. An island -- over 200 bp, GC above 50%, observed/expected CpG above 0.6 -- survived because it was usually unmethylated, so it is a fossil of the region's methylation history, not merely a compositional oddity.

Q: What actually produces isochores, and why is that a cautionary tale?
A: Not selection for thermal stability, the original guess, but GC-biased gene conversion: when recombination resolves a mismatched heteroduplex, repair is biased toward G and C, so high-recombination regions are pushed GC-ward with no fitness consequence at all. It is a fixation bias -- a non-adaptive, recombination-driven distortion of which allele is transmitted -- producing a pattern indistinguishable from selection until you test for it properly.

Q: Is a gene desert empty?
A: Emptiness is a statement about annotation, not about function. Variable deserts are lineage-specific and largely unconstrained, but stable deserts are conserved across vertebrates, densely packed with cis-regulatory elements, and sit beside developmental transcription factors. A conserved gene desert is the regulatory input space of the gene next door, which is why a disease variant can act on a gene a megabase away.

Q: You call mitochondrial variants from whole-genome short reads and find apparent heteroplasmy at 1-3% allele fraction. Why be suspicious?
A: NUMTs. Hundreds of mitochondrial-derived segments sit in the nuclear genome carrying ancient substitutions relative to modern mtDNA, and nuclear reads from them align to the mitochondrial sequence and contribute those substitutions as apparent low-frequency variants -- landing in exactly the low-single-digit-percent range real heteroplasmy occupies. Align to a combined nuclear plus mitochondrial reference, discard multi-mapping reads, and confirm with long reads that span the NUMT junctions.

## Sequencing technologies

Q: Accuracy in sequencing can be bought in exactly three currencies. What are they, and which one is distinctive?
A: Better chemistry, which improves the single measurement; redundancy across molecules, meaning more depth; and redundancy within a molecule, meaning reading the same physical molecule several times and averaging. The third is the distinctive one, and it is what makes long reads accurate. Depth averages out sequencing error but faithfully reproduces any error already present in the molecule you sequenced.

Q: Illumina chemistry adds one base per cycle, so why not run 1,000 cycles and get 1,000 bp reads?
A: Because a cluster is an ensemble of about 1,000 molecules that must stay synchronised. Each cycle a small fraction fails to extend or deblock (phasing) or runs ahead on a defective block (prephasing), and those strands keep extending permanently out of register, contributing the wrong base's signal to every later image. The in-phase fraction decays as (1-p)^n, so at p = 0.002 only about 30% of the cluster is in register at cycle 600. The limit is synchrony loss in a population, not chemistry.

Q: PacBio's raw per-pass error is 10-15%, yet HiFi reads exceed 99.9% accuracy. Why can Illumina not achieve the same thing with more depth?
A: They are different operations. Circular consensus makes k near-independent observations of one physical molecule, so read-out noise on that molecule averages out and error falls exponentially in k -- roughly 1.6-fold per added pass at per-pass error 0.12. Depth makes observations of different molecules: it averages sequencing error but cannot correct anything already wrong in the molecules, such as a polymerase error introduced during library PCR, which every read descended from it reproduces.

Q: What kind of error survives circular consensus, and why?
A: Systematic error. Contexts where the polymerase is biased the same way on every pass -- certain homopolymers, some repeat structures -- are not averaged out, because independence between passes is the load-bearing assumption and it is the assumption that fails first.

Q: Why is a nanopore basecaller solving a sequence-labelling problem rather than simply reading letters?
A: Bases sit about 0.34 nm apart and the pore constriction is of comparable scale, so roughly 5 to 9 bases contribute to the ionic current at any instant. The observable is a noisy function of a sliding window over the sequence and must be inverted -- historically with an HMM over k-mer states, now with neural sequence models trained on labelled current traces. A striking consequence is that the decoder is software: re-basecalling archived raw signal with a newer model produces better reads from data you already own.

Q: In what sense are Illumina and nanopore errors complementary?
A: Illumina errors are dominated by substitutions, with indels orders of magnitude rarer because the 3' block enforces one base per cycle, and quality decays along the read because of dephasing. Nanopore residual errors skew toward indels and concentrate in homopolymers and some methylated contexts. Opposite error modes are exactly why the two platforms combine well.

Q: Why is Sanger sequencing still the confirmation standard rather than a historical curiosity?
A: Orthogonality, not nostalgia. It has different chemistry, different detection physics, different amplification, no alignment step and a fresh aliquot of DNA, so it shares almost none of a short-read pipeline's failure modes. A confirmation is only worth something if it fails differently from the thing it confirms. Its own limits are real: it reads a population average, detecting a minor allele only down to roughly 15-20% of molecules.

## Coverage, depth and library preparation

Q: Distinguish depth from breadth, and give the coverage result that links them.
A: Depth is how many reads overlap a given base, written 30x; breadth is the fraction of the genome with at least one read. With N reads of length L on a genome of length G and independent uniform start positions, the count covering a base is Poisson with mean C = NL/G, so P(a base is uncovered) = e^-C and the expected number of uncovered bases is G x e^-C.

Q: The Poisson model says 30x leaves 0.0003 bases of a human genome untouched, yet real 30x short-read genomes are about 95% callable. Where did the other 5% go?
A: Not into depth. Reads are not uniformly placed: GC bias from amplification, chromatin and extraction effects make the depth distribution overdispersed relative to Poisson, so the low-depth tail is far fatter than e^-C implies. And covered is not callable -- reads landing in repeats get mapping quality near zero and are discarded. Sequencing the same library to 60x barely moves the 5%; longer reads or a pangenome reference do.

Q: Why is 30x the germline convention when the coverage model says 15x is plenty?
A: Because you must observe both alleles, not merely touch a base. At local depth d, the probability every read came from the same parental haplotype is 2 x (1/2)^d: at d = 10 that is 2.0 x 10^-3, about 5,900 of roughly 3 million heterozygous sites read as homozygous. Missing a heterozygote is a silent false negative. 30x is an empirical operating point where short-read germline SNV sensitivity and precision plateau, not a derived one.

Q: A subclonal heterozygous mutation sits in 20% of tumour cells in a biopsy that is 50% tumour. What allele fraction is that, and what depth does it need?
A: f = 0.5 x 0.5 x 0.2 = 0.05. Alt-supporting reads at depth d are approximately Poisson(d x f), and requiring at least 3 alt reads with 95% probability needs lambda about 6.3, so d = 6.3 / 0.05, about 126x. That is only enough to see it, before any question of distinguishing it from sequencing error.

Q: Why is "at least 3 supporting reads" not a somatic variant call?
A: At a per-base error rate of 0.1% split across three wrong bases, the error rate per specific alternate allele is about 3.3 x 10^-4; at depth 130 that gives lambda = 0.043 and P(3 or more error reads) = 1.3 x 10^-5. Across 3.1 x 10^9 positions times 3 alternate alleles that is about 1.2 x 10^5 false positives, against 10^3 to 10^4 true somatic SNVs in a typical solid tumour -- roughly ten to a hundred false positives for every true one.

Q: A collaborator reports a 55% duplicate rate and proposes sequencing that library less deeply next time. What is wrong with the diagnosis?
A: Duplicate rate is a readout of library complexity, not of sequencing effort. Sampling N reads from M distinct molecules gives duplicate fraction 1 - M(1 - e^(-N/M))/N, so a high rate means M is small: too little input DNA, too few molecules surviving the prep, or too many PCR cycles on a thin starting population. Sequencing less deeply lowers the reported percentage while delivering strictly fewer independent observations. The fix is upstream.

Q: Why should PCR duplicates be marked rather than deleted, and why do they matter at all?
A: They are not independent observations, so counting them as such inflates apparent depth, and a polymerase error in an early PCR cycle is propagated into many reads and can look like a confidently supported variant. They should be marked because the duplicate rate is itself a QC measurement of library complexity, and deleting the reads destroys it.

Q: For an exome, why is mean depth the wrong statistic?
A: Because capture efficiency is systematically and reproducibly uneven, so what matters is the fraction of target bases at 20x or more. The exons that drop out are not random: GC-rich first exons of several clinically important genes drop out the same way in every sample, so no amount of batch-level QC flags them, and a negative exome may simply never have read the causal exon.

Q: What is allele dropout on an amplicon panel, and why does depth give no protection?
A: A variant sitting under a primer binding site can prevent that allele amplifying at all. The result is a confident, high-depth, homozygous-reference call at a site where the patient is actually heterozygous for a pathogenic variant. Depth protects against nothing here, because every one of those thousands of reads came from the other allele.

## Data formats and coordinates

Q: Define the Phred quality score in both directions, and say why the scale exists at all.
A: Q = -10 log10 P(error), so P(error) = 10^(-Q/10). Storing a float per base would cost 4 bytes for a base held in 2 bits, so the error probability is log-transformed and quantised into one printable ASCII character. One unit of Q is a factor of about 1.26 in error rate, which puts the useful range from 1 in 2 to 1 in 10^9 inside a single byte.

Q: Q30 is routinely read as one error per 1,000 bases in that read. Why is that wrong?
A: Because Q is the instrument's estimate of a per-base error probability, not a measured frequency, and the estimate is systematically biased by sequence context and by cycle number. Headline platform Q figures are typically a mode or median over a whole run rather than a guarantee for any given base. Base quality score recalibration exists precisely because a raw Q30 is not a 0.1% error rate.

Q: Nothing in a FASTQ declares whether it is Phred+33 or Phred+64. What is the safe detection rule, and what breaks if you guess wrong?
A: The rule is one-sided: any quality character below ":" (ASCII 58) proves Phred+33, because Phred+64 cannot encode below 64. The mirror rule used to work and is now wrong, since long-read platforms legitimately emit qualities well above Q40. Reading a Phred+64 file as Phred+33 inflates every score by 31, so quality trimming becomes a no-op and any model using base quality as a likelihood becomes wildly overconfident -- with no error raised anywhere.

Q: A SAM record has POS 11 and CIGAR 3S8M2D6M2I4M. Give the read length, the reference span and the reference end.
A: Query-consuming operations (S, M, I) sum to 3+8+6+2+4 = 23, which must equal the length of SEQ and is a hard validity check. Reference-consuming operations (M, D) sum to 8+2+6+4 = 20. The reference end, 1-based inclusive, is 11 + 20 - 1 = 30. Soft-clipped bases sit in SEQ and consume no reference, which is why computing coverage from POS and len(SEQ) is a common bug.

Q: A SAM record has FLAG 163. What does that tell you about the read?
A: 163 = 128 + 32 + 2 + 1, so four bits are set: 0x1 paired, 0x2 proper pair, 0x20 mate's SEQ reverse-complemented, 0x80 last segment in the template. Everything else is clear, so this segment is itself on the forward strand and mapped, and its mate is mapped -- a properly paired read 2, forward, mate reverse, the canonical FR orientation. FLAG is a bitfield, and every read-filtering decision you will ever make is a mask against it: 0x4 unmapped, 0x100 secondary, 0x400 duplicate, 0x800 supplementary.

Q: What is the difference between a secondary and a supplementary alignment record?
A: Secondary (0x100) means the whole read also aligns here but somewhere else scored better -- an alternative hypothesis for the entire read, and such records may carry no SEQ at all. Supplementary (0x800) means part of the read aligns here and another part elsewhere -- a split alignment, which is how structural variants and fusion transcripts appear. Counting rows in a BAM does not count reads.

Q: Why is a MAPQ threshold not portable between pipelines?
A: MAPQ is defined as -10 log10 P(this alignment is at the wrong position), but the probability is taken over the aligner's own model of where else the read might have come from, and no two aligners share that model. Maxima differ -- about 60 for BWA-MEM and minimap2, 42 for Bowtie2 -- and STAR uses 255 for "uniquely mapped" where the specification reserves 255 for "unavailable". A filter at 30 can discard half your data or none of it.

Q: Why does one deletion have many valid VCF encodings, and what is the canonical form?
A: In a homopolymer run, deleting any single base produces exactly the same alternate sequence, so every anchor position in the run is a correct encoding -- but each is a different key on CHROM, POS, REF, ALT. The canonical form is parsimonious (no unnecessary bases) and left-aligned (shifted as far left as possible while still describing the same sequences), which is what bcftools norm against the reference FASTA produces.

Q: Why is failing to normalise a VCF before a join not merely untidy?
A: Because the failure is silent. An unnormalised join simply misses the match: the variant appears private to each lab, drops out of concordance metrics, misses its gnomAD frequency and its ClinVar annotation, and is scored as absent by any polygenic score keyed on position and alleles. Nothing is malformed, so no tool reports an error.

Q: A GFF3 exon runs start 1000, end 1200. Give the BED line and its length, and say why only one endpoint changes.
A: chr20 999 1200, length 1200 - 999 = 201, matching the GFF3 arithmetic 1200 - 1000 + 1 = 201. Only the start changes because the two systems number different things: 1-based inclusive coordinates label the bases, 0-based half-open coordinates label the boundaries between bases. The boundary before base 1000 is tick 999, and the boundary after base 1200 is tick 1200, which is already the GFF3 end value. Decrementing both ends is the classic bug.

Q: Why does a missing row in a VCF not mean homozygous reference, and what fixes it?
A: It means not called, which may be no coverage at all. That matters for joint calling, because a site variant in one sample needs a genotype in another and "no row" cannot supply one. A gVCF emits a record for every position, collapsing non-variant stretches into reference blocks -- a row with ALT of NON_REF, an END in INFO, and a genotype quality banding how confident the caller is that nothing is there.

Q: Why is "chr1:1,000,000" not yet a location?
A: Because a coordinate is not a number; it is a number plus a convention plus a build. The convention decides whether the integer labels a base (1-based inclusive) or a boundary between bases (0-based half-open) -- SAM and BAM are the same format in two encodings and disagree, and pysam and GenomicRanges will hand you different integers for the same feature in the same file, correctly, by design. The build decides which sequence is being indexed: chr1:1,000,000 is three different places in GRCh37, GRCh38 and T2T-CHM13. The build is part of the coordinate, not metadata beside it.

Q: An intersection of a BED file with a BAM returns zero overlaps and exit status 0. What do you check first, and what is the nastier version of the same bug?
A: Chromosome naming. UCSC writes chr1, chrX, chrM; Ensembl and NCBI write 1, X, MT; RefSeq writes NC_000001.11 -- the same chromosomes, and mixing conventions yields an empty result with no warning, which is worse than a crash. The nastier version is that hg19's chrM and GRCh37's MT are not two names for one sequence but different sequences of slightly different lengths, so mitochondrial coordinates do not transfer between two names for nominally the same build. Sort order is the same tax again: lexically chr10 precedes chr2, karyotypically it does not, and two differently sorted "sorted" files will fail to merge or merge wrongly.

Q: Is CRAM just a smaller BAM?
A: No -- it is reference-differential. A read matching the reference carries almost no information, so CRAM stores only the differences, column-oriented with per-column codecs, landing around a tenth to a fifth of plain SAM against BAM's third. That buys a hard dependency: decoding requires the exact reference, verified by the M5 checksum in the @SQ header lines. A CRAM plus the wrong reference is not a degraded file, it is an undecodable one, which is why CRAM archives carry reference caches around with them.

Q: Liftover between builds fails in four ways. Which one produces a file that looks perfectly well-formed and is wrong, and what does it wreck?
A: The reference allele changing. A base that was ALT in GRCh37 is REF in GRCh38, so the coordinate lifts perfectly and the variant is now inside out: genotypes must be swapped and, in GWAS summary statistics, the effect-size sign must be flipped. A tool that lifts the position and not the alleles produces a file that looks fine and is wrong. Liftover is a partial, non-invertible map, and round-tripping is not the identity.

## Read alignment

Q: Why does every read aligner ever built have a seed-and-extend architecture?
A: Because exact matching is cheap and approximate matching is not. An index answers "where does this exact string occur?" in time proportional to the pattern length, independent of genome size, but there is no such index for "with up to five differences" -- that needs dynamic programming, quadratic in the two lengths, which against 3.1 Gb is absurd. So a fast exact index nominates a handful of candidate loci and the expensive approximate alignment is paid only there.

Q: What does an FM-index actually solve, and what happens to a read carrying one mismatch?
A: It solves exact matching. Backward search keeps a contiguous range of BWT rows and extends the pattern one character leftward in constant time per step, and the range empties the instant the pattern stops existing -- so a single mismatch anywhere returns an empty range for the whole read. At about 0.2% per base combined error and variation, roughly 26% of 150 bp reads carry at least one difference, and they are precisely the reads carrying the variation you sequenced to find. The index is a nomination device, not the aligner.

Q: What does backward search over an FM-index maintain, and what makes each step constant time?
A: A half-open range [sp, ep) of BWT rows whose suffixes all begin with the pattern matched so far -- contiguous because the rotations were sorted. Extending the pattern by one character c on the left updates it as sp' = C[c] + Occ(c, sp) and ep' = C[c] + Occ(c, ep), where C[c] is the number of characters in the text strictly smaller than c and Occ(c, i) counts c in L[0..i-1]. C is four integers; Occ is answered by checkpoints stored every 128-256 positions plus a popcount over the gap. So the cost is the pattern length, independent of genome size.

Q: Why do aligners seed with roughly 19-22 bp rather than 12 bp or 60 bp?
A: Squeezed from both sides. From below, the expected number of chance occurrences of a k-mer in 6.2 Gb of searchable sequence is 6.2 x 10^9 / 4^k -- about 370 hits at k = 12, about 0.02 at k = 19, with break-even near log base 4 of 6.2 x 10^9, which is 16.3. From above, the pigeonhole bound: tolerating k differences in m bases needs k+1 disjoint seeds, so seed length is at most m/(k+1), which is 25 bp for a 150 bp read and 5 differences.

Q: State the pigeonhole argument that makes seeding work.
A: If a read of length m aligns to some locus with at most k differences, and you cut the read into k+1 non-overlapping pieces, then at least one piece matches that locus exactly, because k differences cannot touch k+1 disjoint pieces. Those exact pieces are found with the index and used as candidate anchors for expensive alignment.

Q: An affine gap penalty is not just a refinement of a linear one. What biology does it encode?
A: That indels are made in single events, not one base at a time -- polymerase slippage removes a repeat unit at once, a transposable element inserts kilobases at once, non-allelic homologous recombination deletes megabases at once. With open 6 and extend 1, one 12 bp gap costs 18 while twelve separate 1 bp gaps cost 84; a linear penalty of 2 per base scores both at 24 and cannot express the difference between one mutational event and twelve. The symptom of getting it wrong is alignments littered with scattered one-base gaps around every real indel.

Q: What is a minimizer, and which of its two properties is the crucial one?
A: Slide a window of w consecutive k-mers and select the one with the smallest hash value, storing only those. Sparsity gives a density of about 2/(w+1) of positions indexed. The crucial property is consistency: selection depends on window content, not on position, so two sequences sharing at least w+k-1 identical bases are guaranteed to select the same k-mer. That is exactly what "keep every 10th k-mer" fails to give, because a one-base indel upstream shifts the phase and the two sketches desynchronise permanently.

Q: Derive MAPQ, and say what it does and does not measure.
A: Treating alignment scores as log-likelihoods on a scale lambda with a uniform prior over positions gives a softmax over candidate loci; with the best two dominating and Delta the score gap to the runner-up, P(wrong) is about e^(-Delta/lambda), so MAPQ is about 4.34 x Delta/lambda. MAPQ is therefore the score gap to the runner-up, rescaled. It measures ambiguity, not correctness: a read whose true locus is absent from the reference can align uniquely and well somewhere else with a large Delta and receive the maximum MAPQ.

Q: Why is multi-mapping an information limit rather than an algorithm's failure?
A: If a read's sequence occurs identically at k positions in the true genome, P(read given position) is identical at all k, the posterior is uniform, and no algorithm can do better than guess -- the information needed is not in the read. Mate rescue and probabilistic reallocation help at the margins (the latter recovering correct aggregates while never placing an individual read), but the only complete fix is a read long enough to span out of the repeat into unique flanking sequence.

Q: Why can a spliced RNA-seq read be placed on a processed pseudogene rather than on the gene it came from?
A: A processed pseudogene is a retrotransposed copy of an mRNA, so it is intronless -- GENCODE 50 annotates 14,702 pseudogenes. A read crossing an exon-exon junction of the parent matches the retrocopy contiguously and perfectly, while matching the parent only across a large N gap. Unless the intron state is nearly free and the retrocopy has diverged enough to discriminate, the aligner prefers the contiguous alignment; expression is attributed to the wrong locus and the output looks like clean data.

Q: Why is reference bias a bias rather than a variance, and what does that imply about sequencing deeper?
A: Reads carrying non-reference alleles score lower than reference-allele reads -- a 150 bp read across a heterozygous SNV scores 145 against 150 -- so they sit closer to every threshold: the minimum reporting score, a contested placement against a paralogue, and soft-clipping of the variant-carrying end. Evidence is always removed in the same direction, against the non-reference allele. More coverage therefore estimates the wrong number more precisely.

Q: A heterozygous SNV inside a segmental duplication shows allele balance 0.38 instead of 0.5. Give two distinct explanations.
A: Reference bias: alt-carrying reads score lower, and with a paralogous locus competing for every read the handicap flips some alt reads to the paralogue or to MAPQ 0, depleting alt evidence systematically. Or it is not a heterozygote at all: reads from the paralogue may be piling onto this locus, so the apparent alt reads are paralogous sequence variants and the true state is homozygous reference with contamination from the duplicate copy. Both are biases in which reads are observed, so depth cannot settle it.

Q: Name the four mitigations for reference bias in increasing order of ambition, and give each one's limit.
A: ALT-aware alignment treats GRCh38's alternate contigs as alternative placements rather than extra genome, but only covers loci someone pre-declared polymorphic. WASP-style flip-and-remap swaps the allele in every read overlapping a heterozygous site, re-aligns, and discards reads whose placement changes -- it throws data away but the survivors are unbiased, and it is the standard fix for allele-specific analyses. A personalised or diploid reference aligns to the sample's own haplotypes, which is chicken-and-egg: you need the variants you are trying to call. A graph or pangenome reference makes the alternate alleles part of the reference so carrying one costs nothing, and pays in coordinates, indexing and tooling.

## Genome assembly

Q: Why is the shortest common superstring the wrong objective for assembly, even setting aside its complexity?
A: Because minimising length is exactly the instruction to merge every repeat into a single copy. A genome with a 5 kb sequence repeated three times has a shortest consistent superstring containing it once, so the true genome is a suboptimal solution to the stated problem. Any objective that rewards compactness is systematically biased toward collapsing repeats, which is the dominant error class in real assemblies.

Q: Contrast the Hamiltonian and Eulerian framings of assembly, and say when each formalism wins.
A: Overlap-layout-consensus makes reads nodes and overlaps edges, so a reconstruction is a Hamiltonian path: NP-hard, and all-pairs overlap is quadratic in read count. A de Bruijn graph makes (k-1)-mers nodes and k-mers edges, so a reconstruction is an Eulerian path, which is linear time and needs no pairwise comparison at all because identical sequence collapses by hashing. De Bruijn wins for many short reads; overlap and string graphs win for few long reads, because they keep read coherence, which k-merisation discards.

Q: State the k-selection trade-off precisely.
A: Two copies of an exact repeat of length r stay separate in the graph only if r is at most k-2, so larger k resolves longer repeats one base at a time. Against that, a read of length L yields L-k+1 k-mers, so effective k-mer coverage is c x (L-k+1)/L, and the probability a k-mer is error-free is about (1-epsilon)^k. So k must be large enough to break repeats and small enough that true k-mers remain confidently more abundant than error k-mers -- a window that widens with coverage and dramatically with read accuracy.

Q: A repeat longer than the read length cannot be resolved. Is that a limitation of the software?
A: No, it is a statement about the data. A read lying entirely inside one copy of an identical repeat is a substring of both copies and carries zero bits about its origin, so the two arrangements generate identical data and no algorithm can prefer one. The escape hatch is that real repeat copies are rarely identical, so the operative requirement is reads long enough to reach from one distinguishing variant to the next.

Q: What does the k-mer count histogram tell you before you assemble anything?
A: It is multimodal. A huge spike at count 1-2 is errors, each unique. For a diploid there are two true peaks -- heterozygous k-mers at half the k-mer coverage and homozygous k-mers at full coverage -- so the ratio of their areas estimates heterozygosity while the total estimates genome size. That gives you a genome size estimate with no reference and no assembly.

Q: Give three ways N50 misleads.
A: It rewards long contigs regardless of correctness, so an incorrect join actually raises it. It is normalised by the assembly's own size, so an assembly that also lost 20% of the genome divides by a smaller denominator and scores better than it deserves -- NG50 fixes this by walking to half the estimated genome size. And scaffold N50 counts gap Ns as though they were sequence, so an assembly can have 50 Mb scaffold N50 and 200 kb contig N50.

Q: Distinguish a collapsed repeat, a false duplication and a misjoin by their signatures.
A: A collapsed repeat represents n copies as one, giving about n-fold coverage over the region plus excess heterozygous calls that are really paralogous differences. A false duplication represents one region twice as unmerged haplotypes, giving about half coverage on both copies and duplicated BUSCOs. A misjoin gives clipped reads piling up at a single coordinate, an off-diagonal Hi-C block, and long reads spanning the junction in neither direction.

Q: Why does trio binning phase a genome, and what does it require that Hi-C phasing does not?
A: At a site where the parents differ, some k-mers occur in one parent's reads and not the other's, so they tag haplotype origin directly and each child read can be assigned to a bin by set membership before any assembly happens -- there is no opportunity for switch errors. It requires sequencing both parents, which is impossible for a wild-caught individual, an unknown parent or a tumour. Hi-C phasing needs only the sample, exploiting that a cross-link mostly joins two loci on the same physical chromosome and therefore the same haplotype.

## Annotation

Q: Annotation splits into two questions. What are they, and what kind of claim does each make?
A: Structural annotation asks where the features are and outputs intervals -- genes, transcripts, exons, CDS, UTRs, regulatory elements -- so its claims are coordinates on a build, and it is a parsing problem: find the highest-scoring parse of a 3.1 Gb string under a probabilistic grammar of what a gene looks like. Functional annotation asks what those features do and outputs labels -- protein names, domains, ontology terms, pathway membership -- so its claims are assertions about biology, reached by inference from analogy. Both are models fitted to evidence, neither is ground truth, and conflating them causes most of the confusion about annotation.

Q: ORF-finding nearly solves bacterial gene finding and fails badly in humans. Give the quantitative reason.
A: Under a random-sequence null, stop codons occur at rate 3/64, so ORF lengths are geometric with mean about 21 codons and a chance 300-codon ORF has probability (61/64)^300, about 6 x 10^-7 -- enormous discriminative power where genes are contiguous and dense. Human coding sequence is split across internal exons of roughly 120-150 bp, which is 40-50 codons and well inside the noise floor. The ORF signal exists only after the introns are removed, and removing them correctly is the whole problem.

Q: Why does a gene-finding HMM need separate exon states for each phase rather than one exon state?
A: Because reading frame is a global constraint while HMM transitions are local. An intron can interrupt a codon after 0, 1 or 2 bases and the next exon must resume at exactly that offset, so tagging exon and intron states with phase and permitting only phase-consistent transitions encodes the frame constraint in the graph topology. Viterbi then cannot return a frame-inconsistent parse for free.

Q: A colleague scans the genome for the splice donor consensus and reports millions of hits. What went wrong?
A: Nothing -- that is the correct behaviour of a low-information motif. At roughly 8 bits, chance matches occur about every 256 bp, giving about 1.2 x 10^7 hits in 3.1 Gb against a few hundred thousand real donor sites: roughly fifty spurious matches per genuine one. The fix is context rather than a stricter motif: joint scoring of coding hexamer statistics, frame consistency with an upstream acceptor or start, and plausible exon length -- plus observed RNA-seq junctions.

Q: Why did RNA-seq change annotation discontinuously, and what does it still not give you?
A: A spliced aligner reports a junction-crossing read with an N operator in its CIGAR, so a junction is observed directly rather than inferred from a motif, and counting reads per junction gives an empirical quantitative catalogue of introns. What it does not give is connectivity: knowing junctions A, B and C exist does not say which transcript contains which combination. Long-read transcript sequencing solves that by brute force, since one read spanning a full-length cDNA is one isoform observation.

Q: Why do GENCODE and RefSeq disagree, and why are gene counts a property of the annotation rather than of the genome?
A: They are independent projects with different editorial policy: what evidence threshold admits a transcript, whether a readthrough between neighbours is a gene, whether a locus with an ORF and no protein evidence is coding or a pseudogene, where a UTR ends. Same evidence, different gene set. Releases ship several times a year, so a differential-expression result, a splice-variant call or a GO enrichment can change between two runs whose only difference is the GTF.

Q: In GENCODE 50, why must the non-coding gene count be summed from its parts rather than obtained by subtraction?
A: Because 35,885 lncRNA + 7,608 small ncRNA + 14,702 pseudogenes = 58,195, whereas subtracting 19,442 protein-coding genes from the 78,733 total returns 59,291. The extra 1,096 entries are 412 IG/TR segments, 665 readthrough genes and 19 artifacts; 1,077 of them GENCODE counts as protein-coding, but it tabulates all 1,096 separately, so the subtraction sweeps 1,096 coding entities into the non-coding tally.

Q: "A variant has a consequence" is false. State the correct version, and say what MANE Select fixes.
A: A (variant, transcript) pair has a consequence: the same substitution can be missense on one isoform, intronic on another and 3'UTR on a third, because the isoforms disagree about what that position is. Pipelines then aggregate, either by most severe consequence across all transcripts (a ranking convention, not a biological fact) or by a designated transcript. MANE Select is one transcript per gene on which RefSeq and Ensembl agree exactly, with paired NM_ and ENST accessions -- which matters because HGVS c. numbering is transcript-relative and meaningless without a versioned accession.

Q: A GO enrichment on a 300-gene list returns dozens of generic significant terms. Why is that the expected result even under a true null?
A: Because annotation depth is not uniform across genes. Long, highly expressed, disease-associated, historically studied genes carry far more annotations and are over-represented in almost any experimentally derived list, so foreground and background are not exchangeable with respect to annotation depth. Two further problems compound it: the ontology is a DAG, so nested terms share genes and independence-based FDR control is not doing what you think, and the background universe is a free parameter that materially changes the answer.

Q: A chromatin-state segmentation labels a region "strong enhancer". What has actually been measured?
A: That the region's pattern of marks resembles that of known enhancers, in one cell type. The labels describe mark patterns, not function -- demonstrating function requires perturbation, not correlation -- and the annotation is per cell type, so there is no single regulatory annotation of the human genome and using one from the wrong tissue is a category error.

## Reference genomes and pangenomes

Q: What is the human reference genome as an object, and why does "reference" not mean "normal"?
A: It is a mosaic composite assembled from tiled bacterial-artificial-chromosome clones from a small number of anonymous donors, with one donor's library, RP11, supplying around 70%. It is haploid, so heterozygosity is annotation on top rather than structure within. At millions of positions it carries the minor allele of a common polymorphism, and at some it carries alleles reported as disease-associated. Because adjacent segments come from different donors, the sequence as a whole is a combination that has never existed in a person.

Q: Show with alignment arithmetic why an insertion larger than about 50 bp is effectively invisible to short reads.
A: With match +1, gap open -6, gap extend -1 and a minimum reported score of 30, a 100 bp read straddling a 60 bp insertion with 20 bp of flank each side scores (20+20) - (6 + 60) = -26 gapped, and 20 clipped. The best available alignment is 20, below threshold, so the read is unmapped or placed elsewhere at low quality. The variant is not called with low confidence; it produces no evidence at all.

Q: Adding ALT contigs to the reference should improve calling in polymorphic regions. Why does it usually make things worse?
A: Because a read from an MHC-like region then matches the primary assembly and an alt contig equally well, multi-mapping drives MAPQ to 0, and every downstream variant caller discards MAPQ-0 reads -- so naive alt inclusion loses calls in exactly the regions the alts were added to help. Correct handling needs an alt-aware aligner that knows the alt-to-primary relationship; the common compromise is a no-alt analysis set plus decoy contigs to catch reads that belong nowhere.

Q: Why was a hydatidiform mole the right sample for the first complete human assembly, and what did completing the reference not fix?
A: CHM13 developed with two copies of a single paternal genome and no maternal contribution, so it is effectively haploid. In a diploid sample a heterozygous site inside a repeat array creates a bubble indistinguishable from repeat-copy ambiguity -- you cannot tell "the other haplotype" from "another copy of the repeat" -- so deleting heterozygosity means every remaining ambiguity is repeat structure. It did not fix reference bias, which comes from representing many genomes with one string, and CHM13 is still one string.

Q: What did T2T-CHM13 add, and what did it reveal about GRCh38?
A: It resolved about 8% of the genome that had been inaccessible, including every centromeric satellite array and the entire short arms of the five acrocentric chromosomes. It also exposed false duplications in GRCh38 -- regions erroneously represented twice, driving MAPQ to zero and making the affected genes uncallable. U2AF1, a recurrent somatic hotspot in myeloid cancers, sat in falsely duplicated sequence, so short-read pipelines systematically failed to call a driver mutation. Assembly errors present as missing data, not as errors.

Q: What does a GFA pangenome file contain, and which record type carries haplotype identity?
A: S records are segments (the sequence-bearing nodes), L records are links (the allowed adjacencies between segment ends), P records are paths through the graph, and W records, added in GFA 1.1, are walks that carry sample and haplotype identity explicitly -- sample, haplotype number, contig, start, end, then the oriented node list such as >1>2>3>5>6. So a W line says whose chromosome copy takes that route, which a bare P line does not. Two conventions make it scale: PanSN naming addresses sequences as sample#haplotype#contig, and rGFA tags each segment with a stable origin (SN, SO, SR) where rank 0 marks a designated linear backbone.

Q: Why is indexing a pangenome graph not the same problem as indexing a string, and what is the practical answer?
A: The analogue of "all suffixes" is "all substrings of all paths", and the number of distinct paths grows exponentially in the number of bubbles: ten independent biallelic bubbles give 1,024 paths, thirty give over a billion, and almost every one is a recombinant no human carries. The better answer is to index the observed haplotypes instead -- 460 linear strings in a compressed representation, seeded with minimizers and clustered by a snarl-aware distance index. That is both cheaper and biologically correct, because linkage disequilibrium means real haplotypes are a tiny structured subset of the combinatorial space.

Q: What is the current human pangenome, and what did it measurably buy?
A: HPRC Release 2 (May 2025) comprises 200+ individuals and 460 haplotypes, roughly a fivefold expansion over Release 1's 47 individuals and 94 haplotypes, and captures over 99% of common variation observed in All of Us v8. On the same reads relative to a linear-reference pipeline, the Release 1 paper reported a 34% reduction in small-variant genotyping errors and a 104% increase in structural variants detected per haplotype.

Q: Why is a node ID a poor long-term pangenome coordinate, and what would a good one need?
A: Node IDs are artefacts of one graph build: rebuild with more haplotypes or different alignment parameters and node boundaries and numbering change, so every annotation keyed to them dangles -- like line numbers after an edit above them. A durable scheme needs stability across rebuilds, projectability onto linear coordinates for interoperability with the existing ecosystem, and some notion of locality so that "the next 10 kb" and interval queries stay expressible. No current scheme satisfies all three.

Q: A pangenome reduces average genotyping error. Why is that not the same claim as reducing a disparity?
A: Because the error it removes is not distributed uniformly. Reference bias scales with how much non-reference sequence a genome carries, which scales with genetic distance from the reference's donors, so individuals whose ancestry is poorly represented lose the most reads and gain the most from a graph. That is a change in variance across groups, not only in the mean -- and the corollary is that a graph of 460 haplotypes drawn from one population would lower average error and leave the disparity untouched.
