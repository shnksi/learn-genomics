#!/usr/bin/env node
"use strict";

// Model-level checks for the bespoke interaction pilots. The rendering layer is
// exercised in the browser; these assertions protect the scientific invariants
// independently of SVG or DOM structure.

const assert = require("node:assert/strict");

global.window = global;
require("./src/interactions.js");
require("./src/interactions-foundations.js");
require("./src/interactions-transmission.js");
require("./src/interactions-instability.js");
require("./src/interactions-regulation.js");
require("./src/interactions-population.js");
require("./src/interactions-quantitative.js");
require("./src/interactions-evolution.js");
require("./src/interactions-methods.js");
require("./src/interactions-genomics.js");
require("./src/interactions-human.js");
require("./src/interactions-advanced-stats.js");
require("./src/interactions-sca12.js");
require("./src/interactions-transfer.js");

const models = global.ReaderInteractionModels;
assert.ok(models, "interaction models were not registered");

const rightFork = models.replication({ kind: "fork", direction: "right" });
const leftFork = models.replication({ kind: "fork", direction: "left" });
assert.equal(rightFork.lagging, "upper",
  "a right-moving fork must copy the upper 5′→3′ template discontinuously");
assert.equal(leftFork.lagging, "lower",
  "reversing the fork must swap leading and lagging templates");

const humanOrigins = models.replication({
  kind: "origins", genomeMb: 6200, speedKbMin: 1.5, hours: 8,
});
assert.equal(humanOrigins.minimum, 4306,
  "origin lower bound must reproduce the chapter's human-genome arithmetic");

const fullFidelity = models.replication({
  kind: "fidelity", selection: true, proofreading: true, mismatchRepair: true,
});
const noMismatchRepair = models.replication({
  kind: "fidelity", selection: true, proofreading: true, mismatchRepair: false,
});
assert.ok(Math.abs(fullFidelity.rate - 1e-10) < 1e-20,
  "three filters must multiply to 10^-10");
assert.ok(Math.abs(noMismatchRepair.rate - 1e-7) < 1e-17,
  "removing mismatch repair must remove its 10^-3 factor");

const zeroDistance = models.linkage(0, "coupling", 1000);
const oneCentimorganSmallFamily = models.linkage(1, "coupling", 100);
const defaultLinkage = models.linkage(21, "coupling", 1000);
const longDistance = models.linkage(120, "coupling", 1000);
assert.equal(zeroDistance.recombination, 0,
  "zero map distance must produce zero recombination");
assert.ok(longDistance.recombination < 0.5 && longDistance.recombination > 0.45,
  "observed recombination must approach but not exceed 50%");
assert.deepEqual(zeroDistance.parental, ["AB", "ab"],
  "coupling phase must make AB and ab parental");
assert.equal(oneCentimorganSmallFamily.counts.Ab + oneCentimorganSmallFamily.counts.aB, 1,
  "a 1 cM interval in 100 offspring must draw one recombinant, not zero");
assert.equal(oneCentimorganSmallFamily.observedRecombination, 0.01,
  "the observable readout must be derived from the displayed integer counts");
assert.equal(defaultLinkage.counts.Ab + defaultLinkage.counts.aB, 171,
  "the default offspring bars must agree with the displayed 17.1% readout");
assert.equal(defaultLinkage.observedRecombination, 0.171,
  "the default observable readout must exactly match its offspring bars");
assert.equal(Object.values(longDistance.counts).reduce((a, b) => a + b, 0), 1000,
  "rounded testcross classes must preserve the requested family size");

const threePointTransfer = models.threePointLinkage({
  ABC: 421, abc: 407,
  Abc: 39, aBC: 35,
  ABc: 49, abC: 45,
  AbC: 2, aBc: 2,
});
assert.equal(threePointTransfer.total, 1000,
  "the transfer fixture must preserve all one thousand offspring");
assert.deepEqual(threePointTransfer.parentalPair.labels, ["ABC", "abc"],
  "the two most abundant reciprocal classes must identify the parental phase");
assert.deepEqual(threePointTransfer.dcoPair.labels, ["AbC", "aBc"],
  "the two least abundant reciprocal classes must identify double crossovers");
assert.equal(threePointTransfer.middleGene, "B",
  "the locus that flips between matching parental and DCO classes must be in the middle");
assert.deepEqual(threePointTransfer.order, ["A", "B", "C"],
  "the first transfer fixture must reconstruct the A-B-C order");
assert.deepEqual(threePointTransfer.intervals.map((interval) => interval.recombinantCount), [78, 98],
  "double crossovers must be counted once in each adjacent interval");
assert.deepEqual(threePointTransfer.intervals.map((interval) => interval.centimorgans), [7.8, 9.8],
  "the transfer map must convert adjacent recombination fractions to 7.8 and 9.8 cM");
assert.equal(threePointTransfer.outerRecombinantCount, 168,
  "double crossovers must be invisible to the two outer markers");
assert.equal(threePointTransfer.outerRecombination, 0.168,
  "the outer-pair recombination readout must be 16.8 percent");
assert.ok(Math.abs(threePointTransfer.expectedDco - 7.644) < 1e-12,
  "expected DCO count must equal r1 times r2 times N");
assert.ok(Math.abs(threePointTransfer.coefficientOfCoincidence - 4 / 7.644) < 1e-12,
  "coefficient of coincidence must compare observed with expected DCO progeny");
assert.ok(Math.abs(threePointTransfer.interference - (1 - 4 / 7.644)) < 1e-12,
  "interference must be one minus the coefficient of coincidence");
assert.ok(Math.abs(threePointTransfer.outerShortfall - 0.008) < 1e-12,
  "the additive-versus-outer shortfall must equal twice the DCO frequency");
assert.equal(threePointTransfer.roleByLabel.AbC, "double crossover");
assert.equal(threePointTransfer.roleByLabel.Abc, "single crossover in A–B");
const threePointMiddleA = models.threePointLinkage({
  AbC: 349, aBc: 341,
  aBC: 61, Abc: 58,
  ABC: 91, abc: 86,
  abC: 7, ABc: 7,
});
assert.deepEqual(threePointMiddleA.parentalPair.labels, ["AbC", "aBc"]);
assert.deepEqual(threePointMiddleA.dcoPair.labels, ["ABc", "abC"]);
assert.equal(threePointMiddleA.middleGene, "A");
assert.deepEqual(threePointMiddleA.order, ["B", "A", "C"]);
assert.deepEqual(threePointMiddleA.intervals.map((interval) => interval.centimorgans), [19.1, 13.3]);
const threePointMiddleC = models.threePointLinkage({
  ABc: 376, abC: 364,
  aBC: 59, Abc: 55,
  aBc: 67, AbC: 63,
  ABC: 8, abc: 8,
});
assert.deepEqual(threePointMiddleC.parentalPair.labels, ["ABc", "abC"]);
assert.deepEqual(threePointMiddleC.dcoPair.labels, ["ABC", "abc"]);
assert.equal(threePointMiddleC.middleGene, "C");
assert.deepEqual(threePointMiddleC.order, ["A", "C", "B"]);
assert.deepEqual(threePointMiddleC.intervals.map((interval) => interval.centimorgans), [14.6, 13]);
assert.deepEqual(Object.keys(global.ReaderInteractionCoverage["linkage-transfer-challenge"]), ["ch14-o4"],
  "the changed-context challenge must publish its Chapter 14 transfer objective");
assert.throws(() => models.threePointLinkage({ ABC: 1, abc: 1 }), /all eight/,
  "an incomplete three-point table must fail rather than imply a map");

const ambiguous = models.assembly("AACAACACG", 3);
const resolved = models.assembly("AACAACACG", 4);
assert.deepEqual(ambiguous.candidates,
  ["AACAACACG", "AACACAACG"],
  "the 3-mer fixture must admit the two intended genomes");
assert.deepEqual(resolved.candidates, ["AACAACACG"],
  "one extra base of context must resolve the pilot fixture");
for (const candidate of ambiguous.candidates) {
  const observed = models.assembly(candidate, 3).counts;
  assert.deepEqual(observed, ambiguous.counts,
    "every ambiguous candidate must have the same 3-mer multiset");
}

const normalMap = models.contact("normal", "normal");
const invertedMap = models.contact("inverted", "normal");
const cohesinLoss = models.contact("normal", "rad21");
const ctcfLoss = models.contact("normal", "ctcf");
const waplLoss = models.contact("normal", "wapl");
assert.deepEqual(normalMap.activeLoop, [3, 8],
  "convergent middle site must anchor the normal loop");
assert.deepEqual(invertedMap.activeLoop, [3, 10],
  "inverting the middle site must shift the loop downstream");
assert.equal(cohesinLoss.activeLoop, null,
  "RAD21 loss must eliminate extrusion-dependent loops");
assert.equal(ctcfLoss.activeLoop, null,
  "CTCF loss must eliminate oriented anchored loops");
assert.ok(cohesinLoss.compartmentStrength > normalMap.compartmentStrength,
  "compartments must strengthen when cohesin is acutely removed");
assert.ok(waplLoss.compartmentStrength < normalMap.compartmentStrength,
  "compartments must weaken when WAPL loss extends extrusion");

const halfOccupied = models.molecularForces({
  kind: "binding", concentrationNm: 20, kdNm: 20, sites: 100,
});
assert.equal(halfOccupied.occupancy, 0.5,
  "binding occupancy must be one half when free concentration equals Kd");
const uncatalysed = models.molecularForces({
  kind: "enzyme", temperatureC: 37, barrierKcal: 18,
  loweredByKcal: 6, deltaGKcal: -3, enzyme: false,
});
const catalysed = models.molecularForces({
  kind: "enzyme", temperatureC: 37, barrierKcal: 18,
  loweredByKcal: 6, deltaGKcal: -3, enzyme: true,
});
assert.equal(catalysed.deltaG, uncatalysed.deltaG,
  "a catalyst must not alter reaction free energy");
assert.equal(catalysed.equilibriumRatio, uncatalysed.equilibriumRatio,
  "a catalyst must not alter the equilibrium ratio");
assert.ok(catalysed.speedup > 1000,
  "lowering a biochemical activation barrier must accelerate the model");
const constitutiveBursts = models.molecularForces({
  kind: "bursts", seed: 9, cells: 4, steps: 5, onFraction: 1,
  onRate: 0, offRate: 0, production: 2, decay: 0,
});
assert.deepEqual(constitutiveBursts.counts, [10, 10, 10, 10],
  "a constitutively on, no-decay expression fixture must accumulate production exactly");
assert.equal(constitutiveBursts.variance, 0,
  "identical deterministic expression histories must have zero cell-to-cell variance");

assert.deepEqual(models.dnaGeometry({ kind: "pair", left: "G", right: "C" }), {
  canonical: true, bonds: 3, width: "constant width",
}, "G-C must be a canonical three-hydrogen-bond, constant-width pair");
const sameCompositionA = models.dnaGeometry({ kind: "stacking", sequence: "GCGCGCAAATTT" });
const sameCompositionB = models.dnaGeometry({ kind: "stacking", sequence: "GGGCCCAAATTT" });
assert.equal(sameCompositionA.gcFraction, sameCompositionB.gcFraction,
  "stacking comparison fixtures must have identical GC content");
assert.notEqual(sameCompositionA.stackingStrength, sameCompositionB.stackingStrength,
  "nearest-neighbour order must distinguish equal-composition duplexes");
const closedTopology = models.dnaGeometry({
  kind: "topology", baselineTwist: 20, turnsUnwound: 3, endsLocked: true,
});
assert.equal(closedTopology.linking, closedTopology.twist + closedTopology.writhe,
  "closed DNA must exactly satisfy Lk = Tw + Wr");
assert.deepEqual(closedTopology, {
  linking: 20, twist: 17, writhe: 3, stressStored: true,
}, "unwinding a closed domain must transfer twist into writhe");

const humanPackaging = models.genomeScale({
  kind: "packaging", genomeGb: 6.2, repeatLengthBp: 200,
});
assert.ok(Math.abs(humanPackaging.contourMetres - 2.108) < 1e-12,
  "6.2 Gb at 0.34 nm per bp must give 2.108 metres of DNA");
assert.equal(humanPackaging.nucleosomes, 31_000_000,
  "the 200 bp repeat approximation must give 31 million nucleosomes");
assert.equal(models.genomeScale({
  kind: "heteroplasmy", loadPercent: 0, bottleneck: 30,
  thresholdPercent: 70, seed: 1, samples: 4,
}).aboveThreshold, 0, "zero maternal mutant load must never cross the threshold");
assert.deepEqual(models.genomeScale({ kind: "repeat", arrangement: "interspersed" }), {
  brokenTool: "short-read alignment", signature: "many equally plausible origins",
}, "interspersed repeats must create read-origin ambiguity rather than an assembly-cycle claim");
assert.equal(models.genomeScale({ kind: "repeat", arrangement: "tandem" }).brokenTool,
  "short-read assembly", "a tandem repeat longer than a read must break short-read assembly");

const rightTranscript = models.transcription({
  kind: "strand", top5to3: "ATGC", direction: "right",
});
const leftTranscript = models.transcription({
  kind: "strand", top5to3: "ATGC", direction: "left",
});
assert.equal(rightTranscript.rna5to3, "AUGC",
  "a rightward promoter must make RNA matching the top coding strand, U for T");
assert.equal(leftTranscript.rna5to3, "GCAU",
  "reversing the promoter must swap strand roles and reverse-complement the product");
assert.equal(models.transcription({
  kind: "timing", lengthKb: 1000, speedKbMin: 2, pauseMinutes: 3,
}).totalMinutes, 503, "a 1 Mb gene at 2 kb/min plus a 3 min pause must take 503 min");
assert.deepEqual(models.transcription({ kind: "ctd", stage: "initiation" }), {
  ser5: "high", ser2: "low", recruits: "5′ capping enzymes",
}, "initiation-state Pol II CTD must be Ser5-high and recruit capping machinery");
assert.equal(models.transcription({ kind: "ctd", stage: "elongation" }).ser2, "high",
  "elongating Pol II must switch to the Ser2-high processing-factor state");
assert.deepEqual(models.transcription({ kind: "enhancer", boundaryIntact: true }), {
  target: "gene B", nearest: "gene A", constrained: true,
}, "the intact-boundary fixture must keep the enhancer from its nearest promoter");
assert.equal(models.transcription({ kind: "enhancer", boundaryIntact: false }).target, "gene A",
  "deleting the fixture boundary must permit the newly shared nearest promoter contact");

assert.equal(models.rnaProcessing({
  kind: "donor", donorIntact: false, organism: "human",
}).consequence, "exon 2 skipped",
"a broken human donor fixture must produce exon skipping under exon definition");
assert.equal(models.rnaProcessing({
  kind: "donor", donorIntact: false, organism: "yeast",
}).consequence, "intron retained",
"the short-intron yeast fixture must produce intron retention");
assert.equal(models.rnaProcessing({
  kind: "nmd", stopNt: 185, lastJunctionNt: 240, stopInLastExon: false,
}).triggered, false, "a stop exactly 55 nt upstream must not cross the instructional NMD cutoff");
assert.equal(models.rnaProcessing({
  kind: "nmd", stopNt: 184, lastJunctionNt: 240, stopInLastExon: false,
}).triggered, true, "a stop 56 nt upstream must cross the instructional NMD cutoff");
const fastSpliceChoice = models.rnaProcessing({
  kind: "choice", sr: 0.4, hnrnp: 0.6, slowPolymerase: false,
});
const slowSpliceChoice = models.rnaProcessing({
  kind: "choice", sr: 0.4, hnrnp: 0.6, slowPolymerase: true,
});
assert.ok(slowSpliceChoice.psi > fastSpliceChoice.psi &&
  slowSpliceChoice.psi > 0 && slowSpliceChoice.psi < 1,
"the stated kinetic-coupling fixture must raise exon inclusion while keeping PSI probabilistic");

const standardFrames = models.translation({
  kind: "frames", sequence: "ATGGCCATATGATTT", code: "standard",
});
const mitochondrialFrames = models.translation({
  kind: "frames", sequence: "ATGGCCATATGATTT", code: "mitochondrial",
});
assert.deepEqual(standardFrames.forward[0].map((codon) => codon.aa), ["M", "A", "I", "*", "F"],
  "the standard-code fixture must translate ATA as Ile and TGA as stop");
assert.deepEqual(mitochondrialFrames.forward[0].map((codon) => codon.aa), ["M", "A", "M", "W", "F"],
  "the vertebrate-mitochondrial fixture must translate ATA as Met and TGA as Trp");
assert.equal(models.translation({
  kind: "mutation", sequence: "ATGGCCATATGATTT", frame: 0,
  code: "standard", mutation: "insertion", position: 4, alt: "A",
}).effect, "frameshift", "a one-base coding insertion must shift the frame");

const tetramerPoison = models.proteinFate({
  kind: "dominantNegative", mutantFraction: 0.5, subunits: 4,
});
assert.equal(tetramerPoison.functionalComplexFraction, 0.0625,
  "random tetramer assembly at 50% mutant must leave 1/16 all-wild-type complexes");
const turnover = models.proteinFate({
  kind: "turnover", halfLifeHours: 2, synthesisPerHour: 10, hours: 2,
});
assert.ok(Math.abs(turnover.amount - turnover.steady / 2) < 1e-12,
  "one half-life after synthesis begins, abundance must be half of steady state");
const buriedPolarSubstitution = models.proteinFate({
  kind: "substitution", site: "core", to: "polar",
});
assert.equal(buriedPolarSubstitution.severity, "high");
assert.match(buriedPolarSubstitution.mechanism, /hydrophobic core/,
  "a polar residue buried in the hydrophobic core must route to the folding mechanism");

const mendelianCross = models.probability({ kind: "cross", parent1: "Aa", parent2: "Aa" });
assert.deepEqual(mendelianCross.probabilities, { AA: 0.25, Aa: 0.5, aa: 0.25 },
  "Aa by Aa must enumerate the 1:2:1 genotype sample space");
const rareTest = models.probability({
  kind: "bayesTest", population: 100000, prevalence: 0.0001,
  sensitivity: 0.99, specificity: 0.99,
});
assert.ok(rareTest.positivePredictiveValue > 0.0097 && rareTest.positivePredictiveValue < 0.0099,
  "a 1-in-10,000 base rate with a 99/99 test must yield about 0.98% PPV");
assert.deepEqual(models.probability({ kind: "conditionalCarrier" }), {
  prior: 0.5, posteriorGivenUnaffected: 2 / 3,
}, "an unaffected sibling of an affected recessive child must have two carrier states among three unaffected states");
assert.deepEqual(models.probability({
  kind: "simulate", seed: 4, families: 3, children: 5, p: 1,
}).successes, [5, 5, 5], "a binomial simulation at p=1 must succeed for every child");

const poissonSix = models.distribution({ kind: "poisson", lambda: 6 });
assert.equal(poissonSix.mean, poissonSix.variance,
  "Poisson mean and variance must be equal");
assert.ok(Math.abs(poissonSix.zero - Math.exp(-6)) < 1e-15,
  "Poisson zero-coverage fraction must be e^-lambda");
const overdispersed = models.distribution({
  kind: "negativeBinomial", mean: 12, dispersion: 3,
});
assert.ok(overdispersed.variance > overdispersed.mean,
  "negative-binomial counts must be overdispersed at finite size");
const binomial = models.distribution({ kind: "binomial", n: 8, p: 0.25 });
assert.ok(Math.abs(binomial.points.reduce((sum, point) => sum + point.p, 0) - 1) < 1e-12,
  "binomial probabilities must sum to one");
const standardNormal = models.distribution({ kind: "normal", mean: 0, sd: 1 });
assert.equal(standardNormal.variance, 1);
assert.ok(Math.abs(standardNormal.points[40].p - 1 / Math.sqrt(2 * Math.PI)) < 1e-15 &&
  Math.abs(standardNormal.points[30].p - standardNormal.points[50].p) < 1e-15,
"the normal-density fixture must peak at its mean and remain symmetric one SD away");

const meioticEntry = models.chromosomeTime({ kind: "stage", stage: "meiosisI" });
const afterMeiosisOne = models.chromosomeTime({ kind: "stage", stage: "afterMI" });
assert.deepEqual(
  [meioticEntry.chromosomes, meioticEntry.chromatids, meioticEntry.ploidy, meioticEntry.dna],
  [46, 92, "2n", "4c"],
  "prophase through anaphase I must retain 46 centromeres and 92 chromatids"
);
assert.deepEqual(
  [afterMeiosisOne.chromosomes, afterMeiosisOne.chromatids, afterMeiosisOne.ploidy, afterMeiosisOne.dna],
  [23, 46, "n", "2c"],
  "meiosis I must halve homolog number without separating sisters"
);
const oneCrossover = models.chromosomeTime({ kind: "crossover", crossover: true });
assert.deepEqual(oneCrossover.products, ["AB", "Ab", "aB", "ab"],
  "one crossover between two loci must make two parental and two recombinant chromatids");
assert.deepEqual(models.chromosomeTime({ kind: "nondisjunction", division: "MI" }).doses,
  [2, 2, 0, 0], "MI nondisjunction must make two disomic and two nullisomic gametes");
assert.deepEqual(models.chromosomeTime({ kind: "nondisjunction", division: "MII" }).doses,
  [2, 0, 1, 1], "MII nondisjunction must leave two normal gametes");

const aaCross = models.inheritance({ kind: "cross", parent1: "Aa", parent2: "Aa" });
assert.deepEqual(aaCross.probabilities, { AA: 0.25, Aa: 0.5, aa: 0.25 },
  "the transmission cross builder must reproduce Aa by Aa exactly");
const threeLocusRecessive = models.inheritance({
  kind: "multiLocus", loci: 3, target: "allRecessive",
});
assert.equal(threeLocusRecessive.probability, 1 / 64,
  "three independent recessive targets must multiply to 1/64");
assert.equal(threeLocusRecessive.gridCellsAvoided, 64,
  "a trihybrid Punnett grid would contain 64 cells");
assert.equal(models.inheritance({
  kind: "family", children: 4, affected: 1, p: 0.25,
}).exactly, 0.421875, "exactly one affected among four at p=1/4 must be 27/64");
assert.equal(models.inheritance({ kind: "testcross", offspring: 5 }).confidence, 0.96875,
  "five Aa by aa offspring must reveal aa with probability 31/32");

assert.equal(models.pathwayGenetics({
  kind: "epistasis", topology: "recessiveEpistasis",
}).ratio, "9:3:4", "recessive epistasis must derive 9:3:4");
assert.equal(models.pathwayGenetics({
  kind: "epistasis", topology: "dominantEpistasis",
}).ratio, "12:3:1", "dominant epistasis must derive 12:3:1");
assert.equal(models.pathwayGenetics({
  kind: "epistasis", topology: "complementary",
}).ratio, "9:7", "two required pathway functions must derive 9:7");
assert.equal(models.pathwayGenetics({
  kind: "epistasis", topology: "duplicate",
}).ratio, "15:1", "duplicate sufficient functions must derive 15:1");
assert.equal(models.pathwayGenetics({
  kind: "complementation", sameGene: false,
}).rescued, true, "different recessive gene defects must complement in the stated fixture");

const exactDihybrid = models.geneticInference({
  kind: "chiSquare", hypothesis: "dihybrid", distortion: 0, estimatedParameters: 0,
});
const distortedDihybrid = models.geneticInference({
  kind: "chiSquare", hypothesis: "dihybrid", distortion: 25, estimatedParameters: 0,
});
assert.equal(exactDihybrid.statistic, 0,
  "counts exactly matching 9:3:3:1 must have chi-square zero");
assert.equal(exactDihybrid.df, 3,
  "four fully specified categories must have three degrees of freedom");
assert.equal(distortedDihybrid.reject, true,
  "the deliberately distorted 160-offspring fixture must cross the 5% critical value");
const certainSegregationRejection = models.geneticInference({
  kind: "power", seed: 3, replicates: 100, n: 20, actualDominant: 1,
});
assert.deepEqual(certainSegregationRejection, { rejected: 100, power: 1 },
  "a 20-of-20 dominant outcome must always reject the 3:1 null in the power simulator");
const ascertainedPairs = models.geneticInference({
  kind: "ascertainment", children: 2, p: 0.25,
});
assert.ok(Math.abs(ascertainedPairs.conditionalMean - 8 / 7) < 1e-12,
  "selected two-child families must average 8/7 affected children");
assert.ok(Math.abs(ascertainedPairs.naiveAffectedFraction - 4 / 7) < 1e-12,
  "complete ascertainment must inflate the naive affected fraction to 4/7");

assert.equal(models.sexSystem({
  kind: "system", organism: "mammal", constitution: "XX+SRY",
}).sex, "testis pathway", "functional translocated SRY must drive the mammalian testis pathway");
assert.equal(models.sexSystem({
  kind: "system", organism: "mammal", constitution: "XY-SRY",
}).sex, "ovary pathway", "an XY mammalian fixture without functional SRY must not trigger testes");
assert.equal(models.sexSystem({
  kind: "system", organism: "fly", constitution: "XO",
}).sex, "sterile male", "Drosophila XO must be male by X:A ratio but sterile without Y fertility genes");
assert.equal(models.sexSystem({
  kind: "system", organism: "fly", constitution: "XXY",
}).sex, "female", "Drosophila XXY must be female because Y does not choose sex");
assert.deepEqual(models.sexSystem({
  kind: "xCross", mother: "carrier", father: "healthy",
}), { affectedSons: 0.5, affectedDaughters: 0, carrierDaughters: 0.5 },
"a carrier mother and healthy father must put half of sons at risk and half of daughters in the carrier class");

const fatherToDaughters = models.pedigree({ kind: "mode", fixture: "fatherDaughters" });
assert.ok(Math.abs(fatherToDaughters.posterior.XLD - 16 / 17) < 1e-12,
  "under equal priors, the father-to-all-daughters fixture must favour XLD 16:1 over AD");
const dmdUpdate = models.pedigree({
  kind: "carrier", prior: 0.5, unaffectedSons: 3, sensitivity: 0.95,
});
assert.ok(Math.abs(dmdUpdate.posterior - 1 / 161) < 1e-12,
  "three unaffected sons plus a 95% sensitive negative test must update 1/2 to 1/161");
const cousinRisk = models.pedigree({
  kind: "inbreeding", relationship: "firstCousins", q: 0.001,
});
assert.equal(cousinRisk.f, 1 / 16,
  "first-cousin offspring must have expected F of 1/16");
assert.ok(Math.abs(cousinRisk.risk - (1 / 16 * 0.001 + 15 / 16 * 0.001 ** 2)) < 1e-15,
  "recessive risk must combine Fq and the non-IBD q-squared route");

// Part 3 — genome instability. These checks intentionally exercise the
// scientific models independently of the DOM so a visually plausible state
// cannot silently contradict the chapter.

const uvDamage = models.mutationForensics({ kind: "classify", fixture: "uvDimer" });
const germlineTransition = models.mutationForensics({ kind: "classify", fixture: "cpgTransition" });
const mosaicFrameshift = models.mutationForensics({ kind: "classify", fixture: "frameshift" });
assert.equal(uvDamage.permanence, "damage",
  "an unrepaired UV dimer must remain damage rather than a mutation");
assert.equal(germlineTransition.permanence, "mutation",
  "a correctly paired C:G to T:A change must be a mutation");
assert.equal(germlineTransition.lineage, "germline",
  "a gamete-precursor mutation must be heritable in the fixture");
assert.equal(mosaicFrameshift.lineage, "post-zygotic mosaic",
  "an early-embryo change must be classified as mosaic");

const uniformSpectrum = models.mutationForensics({ kind: "spectrum", process: "chance" });
const humanSpectrum = models.mutationForensics({ kind: "spectrum", process: "human" });
const intercalatorSpectrum = models.mutationForensics({ kind: "spectrum", process: "intercalator" });
const nonGenotoxicSpectrum = models.mutationForensics({ kind: "spectrum", process: "nonGenotoxic" });
assert.equal(uniformSpectrum.titv, 0.5,
  "the six-class uniform null must reproduce the 4:8 transition/transversion ratio");
assert.ok(Math.abs(humanSpectrum.titv - 2.095975232198142) < 1e-12,
  "the illustrative human mixture must give Ti/Tv about 2.1");
for (const process of ["chance", "human", "cpg", "uv", "tobacco", "alkylator"]) {
  const spectrum = models.mutationForensics({ kind: "spectrum", process });
  assert.ok(Math.abs(spectrum.profile.reduce((sum, value) => sum + value, 0) - 1) < 1e-12,
    `${process} substitution profile must normalise to one`);
}
assert.equal(intercalatorSpectrum.titv, null,
  "a frameshift mutagen must not be assigned a substitution Ti/Tv");
assert.match(nonGenotoxicSpectrum.ames, /Ames-negative/,
  "the Ames model must explicitly retain non-genotoxic carcinogen false negatives");

const deNovoAt25 = models.mutationForensics({
  kind: "deNovo", rate: 1.2e-8, paternalAge: 25, callableFraction: 1,
});
const deNovoAt45 = models.mutationForensics({
  kind: "deNovo", rate: 1.2e-8, paternalAge: 45, callableFraction: 0.85,
});
assert.ok(Math.abs(deNovoAt25.trueCount - 74.4) < 1e-12,
  "1.2e-8 across 6.2 Gb must yield 74.4 de novo SNVs at the age-25 baseline");
assert.equal(deNovoAt45.ageAdded, 28,
  "twenty paternal years at 1.4 mutations/year must add 28 mutations");
assert.ok(Math.abs(deNovoAt45.paternal + deNovoAt45.maternal - deNovoAt45.trueCount) < 1e-12,
  "the 80:20 parental split must preserve the total");
assert.ok(Math.abs(deNovoAt45.paternal - (deNovoAt45.baseAt25 * 0.8 + deNovoAt45.ageAdded)) < 1e-12,
  "the age-added mutations must remain on the paternal side rather than be repartitioned 80:20");
assert.ok(Math.abs(deNovoAt45.callableCount - deNovoAt45.trueCount * 0.85) < 1e-12,
  "callability must reduce the reportable count without changing biology");

const independentFluctuation = models.mutationForensics({ kind: "fluctuation", design: "independent" });
const sharedFluctuation = models.mutationForensics({ kind: "fluctuation", design: "aliquots" });
assert.equal(independentFluctuation.mean, 36,
  "the independent-culture fixture must keep the comparison mean at 36");
assert.equal(sharedFluctuation.mean, 36,
  "the shared-history fixture must keep the comparison mean at 36");
assert.ok(Math.abs(independentFluctuation.dispersion - 250.62962962962962) < 1e-12,
  "independent histories must reproduce the intended jackpot overdispersion");
assert.ok(Math.abs(sharedFluctuation.dispersion - 0.6419753086419753) < 1e-12,
  "shared-history aliquots must remain near-Poisson rather than jackpot dispersed");
assert.ok(models.mutationForensics({ kind: "context", context: "cpg" }).rate >
  models.mutationForensics({ kind: "context", context: "baseline" }).rate,
"a methylated CpG context must exceed the genome-wide teaching background");
assert.ok(models.mutationForensics({ kind: "context", context: "transcribed" }).rate < 1,
  "transcription-coupled repair must depress the transcribed-strand teaching rate");

const expectedRepairRoutes = {
  o6mG: "direct reversal", uracil: "base excision repair",
  uvDimer: "nucleotide excision repair", mismatch: "mismatch repair",
  stalledFork: "damage tolerance", dsb: "NHEJ or HR",
};
for (const [lesion, pathway] of Object.entries(expectedRepairRoutes)) {
  assert.equal(models.repairTriage({ kind: "route", lesion }).pathway, pathway,
    `${lesion} must route to ${pathway}`);
}
assert.equal(models.repairTriage({ kind: "route", lesion: "mismatch" }).template, "parental strand",
  "mismatch repair must expose the strand-discrimination answer key");
assert.equal(models.repairTriage({ kind: "route", lesion: "stalledFork" }).patch, "lesion remains",
  "damage tolerance must not be mislabelled as lesion repair");

const repairBudget = models.repairTriage({
  kind: "budget", lesionsPerDay: 50000, years: 30, paternalMutations: 60,
});
assert.equal(repairBudget.lesions, 547875000,
  "the repair budget must follow one 30-year lineage using 365.25 days/year");
assert.ok(Math.abs(repairBudget.residual - 60 / 547875000) < 1e-20,
  "the inherited mutation residual must be mutations divided by lineage lesions");
assert.ok(repairBudget.ordersRemoved > 6.9 && repairBudget.ordersRemoved < 7.1,
  "the repair stack must remove about seven orders of magnitude in the fixture");

assert.equal(models.repairTriage({ kind: "dsb", phase: "G1", perturbation: "normal" }).pathway, "NHEJ",
  "G1 without a sister must favour NHEJ");
assert.equal(models.repairTriage({ kind: "dsb", phase: "G2", perturbation: "normal" }).pathway, "homologous recombination",
  "G2 with intact BRCA proteins must permit sister-templated HR");
assert.equal(models.repairTriage({ kind: "dsb", phase: "G2", perturbation: "brca1Loss" }).resected, false,
  "BRCA1 loss must block resection in the fixture");
assert.deepEqual(
  [models.repairTriage({ kind: "dsb", phase: "G2", perturbation: "brca2Loss" }).resected,
    models.repairTriage({ kind: "dsb", phase: "G2", perturbation: "brca2Loss" }).rad51],
  [true, false], "BRCA2 loss must act after resection by blocking RAD51 loading");
assert.equal(models.repairTriage({ kind: "dsb", phase: "M", perturbation: "normal" }).pathway, "defer",
  "mitotic HR must be deferred rather than completed with RAD51");

const brca2Trap = models.repairTriage({
  kind: "synthetic", genotype: "brca2Loss", drug: "trapping", resistance: "none",
});
const normalTrap = models.repairTriage({
  kind: "synthetic", genotype: "normal", drug: "trapping", resistance: "none",
});
const brca1Bp53Escape = models.repairTriage({
  kind: "synthetic", genotype: "brca1Loss", drug: "trapping", resistance: "bp53Loss",
});
const brca2Bp53NoEscape = models.repairTriage({
  kind: "synthetic", genotype: "brca2Loss", drug: "trapping", resistance: "bp53Loss",
});
assert.equal(brca2Trap.outcome, "selective tumour killing",
  "BRCA2 loss plus strong PARP trapping must form the synthetic-lethal fixture");
assert.notEqual(normalTrap.outcome, "selective tumour killing",
  "HR-proficient normal cells must retain the qualitative therapeutic window");
assert.equal(brca1Bp53Escape.rescued, true,
  "53BP1 loss must restore resection upstream of BRCA2 in BRCA1-loss cells");
assert.equal(brca2Bp53NoEscape.rescued, false,
  "53BP1 loss must not replace BRCA2 RAD51 loading");
assert.equal(models.repairTriage({ kind: "response", damage: "persistent", p53Intact: true }).decision, "senescence",
  "persistent damage with p53 must resolve to senescence in the teaching circuit");
assert.equal(models.repairTriage({ kind: "response", damage: "catastrophic", p53Intact: true }).decision, "apoptosis",
  "catastrophic damage with p53 must resolve to apoptosis");
assert.equal(models.repairTriage({ kind: "response", damage: "catastrophic", p53Intact: false }).decision, "checkpoint escape",
  "p53 loss must expose checkpoint escape rather than a repaired genome");
assert.ok(models.repairTriage({ kind: "region", region: "lateClosed" }).rate >
  models.repairTriage({ kind: "region", region: "transcribed" }).rate,
"late closed chromatin must exceed the transcription-protected teaching background");

for (const path of ["sdsa", "sameCuts", "oppositeCuts", "dissolution"]) {
  const state = models.recombinationMechanism({ kind: "resolution", path, gcBias: false, context: "meiosis" });
  assert.equal(state.conversion, true, `${path} must retain a local gene-conversion outcome`);
}
assert.equal(models.recombinationMechanism({
  kind: "resolution", path: "sdsa", gcBias: false, context: "meiosis",
}).crossover, false, "SDSA must be non-crossover");
assert.equal(models.recombinationMechanism({
  kind: "resolution", path: "oppositeCuts", gcBias: false, context: "meiosis",
}).crossover, true, "opposite-sense dHJ cuts must exchange flanking markers");
assert.equal(models.recombinationMechanism({
  kind: "resolution", path: "dissolution", gcBias: false, context: "meiosis",
}).crossover, false, "dHJ dissolution must be constrained to non-crossover");
assert.equal(models.recombinationMechanism({
  kind: "resolution", path: "sdsa", gcBias: true, context: "meiosis",
}).gcTransmission, 0.68, "the gBGC fixture must expose 68% GC transmission only inside conversion tracts");
assert.equal(models.recombinationMechanism({
  kind: "resolution", path: "sdsa", gcBias: false, context: "somatic",
}).templatePreference, "sister chromatid", "somatic HR must prefer the sister");
assert.equal(models.recombinationMechanism({
  kind: "resolution", path: "sdsa", gcBias: false, context: "meiosis",
}).templatePreference, "homolog", "meiotic HR must prefer the homolog in the model");

const randomAssurance = models.recombinationMechanism({
  kind: "assurance", crossovers: 52, distribution: "random", hotspotState: "fresh",
});
const assuredCrossovers = models.recombinationMechanism({
  kind: "assurance", crossovers: 52, distribution: "assured", hotspotState: "eroded",
});
assert.ok(Math.abs(randomAssurance.expectedAchiasmate - 2.397975046797064) < 1e-12,
  "52 independently placed crossovers must leave about 2.4 achiasmate bivalents");
assert.ok(Math.abs(randomAssurance.euploidFromThisCause - 0.29189256379362266) < 1e-12,
  "the independent-placement fixture must derive about 29.2% euploid gametes from this component");
assert.deepEqual(
  [assuredCrossovers.expectedAchiasmate, assuredCrossovers.allChiasmate, assuredCrossovers.euploidFromThisCause],
  [0, 1, 1], "a one-per-bivalent assurance floor must remove the zero class");
assert.match(assuredCrossovers.hotspot.inheritance, /destroys its own target/,
  "the eroded-hotspot state must state the hotspot paradox rather than only name PRDM9");
assert.match(models.recombinationMechanism({
  kind: "assurance", crossovers: 52, distribution: "assured", hotspotState: "newPrdm9",
}).hotspot.inheritance, /retargets/,
"the new-PRDM9 state must resolve the paradox by retargeting motifs");

const directNahr = models.recombinationMechanism({ kind: "nahr", geometry: "directHomologs" });
assert.deepEqual(directNahr.products, ["deletion", "reciprocal duplication"],
  "misaligned direct repeats must generate reciprocal deletion and duplication");
assert.deepEqual(models.recombinationMechanism({ kind: "nahr", geometry: "invertedSame" }).products, ["inversion"],
  "inverted repeats on one chromosome must generate an inversion");
assert.deepEqual(models.recombinationMechanism({ kind: "nahr", geometry: "differentChromosomes" }).products, ["reciprocal translocation"],
  "interchromosomal repeats must generate a reciprocal translocation");
assert.match(models.recombinationMechanism({ kind: "nahr", geometry: "siteSpecific" }).homology, /short enzyme-recognition/,
  "site-specific recombination must not require long homology");
assert.match(models.recombinationMechanism({ kind: "nahr", geometry: "transpositional" }).homology, /^none/,
  "transpositional recombination must not require donor-target homology");

const activeL1 = models.transposon({ kind: "classify", element: "l1", hostState: "active" });
const activeAlu = models.transposon({ kind: "classify", element: "alu", hostState: "active" });
const humanDnaTransposon = models.transposon({ kind: "classify", element: "dna", hostState: "active" });
const domesticatedErv = models.transposon({ kind: "classify", element: "erv", hostState: "domesticated" });
assert.deepEqual([activeL1.intermediate, activeL1.sourceStays, activeL1.autonomous], ["RNA", true, true],
  "L1 must be an autonomous copy-and-paste retrotransposon");
assert.deepEqual([activeAlu.autonomous, activeAlu.humanCompetent], [false, true],
  "Alu must be non-autonomous but still capable of new human insertions via L1");
assert.deepEqual([humanDnaTransposon.autonomous, humanDnaTransposon.activity], [false, 0],
  "human DNA-transposon copies must not be presented as active or autonomous");
assert.match(domesticatedErv.meaning, /syncytin|RAG|MER41/,
  "domestication must expose concrete host exaptations");
assert.match(models.transposon({ kind: "classify", element: "l1", hostState: "silenced" }).host, /APOBEC3/,
  "the layered germline defence state must include APOBEC3 as well as chromatin silencing");

const truncatedL1 = models.transposon({ kind: "tprt", step: 3, completion: 0.5, nickSpacing: 14 });
const completeL1 = models.transposon({ kind: "tprt", step: 4, completion: 1, nickSpacing: 14 });
assert.deepEqual([truncatedL1.polyA, truncatedL1.truncation, truncatedL1.fivePrimeComplete], [true, true, false],
  "interrupted TPRT must retain poly(A) while preferentially losing the 5-prime end");
assert.deepEqual([completeL1.tsd, completeL1.tsdBp, completeL1.fivePrimeComplete], [true, 14, true],
  "completed TPRT must expose target-site duplication from nick spacing");
assert.equal(models.transposon({ kind: "evidence", event: "l1Insertion", assay: "exome" }).detected, false,
  "standard exome analysis must preserve the mobile-insertion false negative");
assert.equal(models.transposon({ kind: "evidence", event: "l1Insertion", assay: "longWgs" }).detected, true,
  "long reads spanning both flanks must detect the L1 fixture");
assert.equal(models.transposon({ kind: "evidence", event: "aluExonisation", assay: "exome" }).detected, false,
  "DNA exome capture must not claim to observe intronic Alu exonisation");
assert.equal(models.transposon({ kind: "evidence", event: "aluExonisation", assay: "shortWgs" }).detected, "variant only",
  "genome sequencing may find the donor-creating variant but cannot prove RNA inclusion");

const chr13Load = models.chromosomeWorkbench({ kind: "load", chromosome: "chr13" });
const chr19Load = models.chromosomeWorkbench({ kind: "load", chromosome: "chr19" });
assert.ok(chr19Load.lengthMb < chr13Load.lengthMb && chr19Load.genes > chr13Load.genes,
  "chromosome 19 must be the decisive counterexample to a chromosome-size explanation");
assert.deepEqual([chr13Load.term, chr19Load.term], [true, false],
  "the dosage-load fixture must distinguish trisomy 13 from trisomy 19 at term");

const miOrigin = models.chromosomeWorkbench({
  kind: "origin", origin: "mi", abnormalFraction: 0.4, cellsSampled: 30,
});
const miiOrigin = models.chromosomeWorkbench({
  kind: "origin", origin: "mii", abnormalFraction: 0.4, cellsSampled: 30,
});
const mosaicOrigin = models.chromosomeWorkbench({
  kind: "origin", origin: "mitosis", abnormalFraction: 0.1, cellsSampled: 30,
});
assert.match(miOrigin.markerClue, /both maternal/, "MI must retain both maternal centromere alleles");
assert.match(miiOrigin.markerClue, /duplicated maternal/, "MII must duplicate one maternal centromere allele");
assert.ok(Math.abs(mosaicOrigin.missProbability - 0.9 ** 30) < 1e-15,
  "mosaic sampling miss probability must follow independent cell sampling");

const age20 = models.chromosomeWorkbench({ kind: "age", age: 20, crossover: "wellPlaced" });
const age45 = models.chromosomeWorkbench({ kind: "age", age: 45, crossover: "distal" });
assert.deepEqual([age20.riskDenominator, age45.riskDenominator], [1500, 27.5],
  "the maternal-age states must reproduce the chapter's approximate live-birth risk table");
assert.ok(age45.risk > age20.risk,
  "the displayed trisomy-21 risk must rise strongly across the age fixture");
assert.match(age45.cohesion, /not measurably replenished/,
  "the age model must derive risk from non-replenished oocyte cohesin");

const paracentricInside = models.chromosomeWorkbench({ kind: "carrier", type: "paracentric", event: "inside" });
const pericentricInside = models.chromosomeWorkbench({ kind: "carrier", type: "pericentric", event: "inside" });
const reciprocalAlternate = models.chromosomeWorkbench({ kind: "carrier", type: "reciprocal", event: "alternate" });
const reciprocalAdjacent = models.chromosomeWorkbench({ kind: "carrier", type: "reciprocal", event: "adjacent1" });
const robertsonianBalanced = models.chromosomeWorkbench({ kind: "carrier", type: "robertsonian", event: "balancedPair" });
const robertsonianTrisomy21 = models.chromosomeWorkbench({ kind: "carrier", type: "robertsonian", event: "trisomy21Pair" });
assert.deepEqual(paracentricInside.products.slice(-2), ["dicentric", "acentric"],
  "a paracentric-loop crossover must generate dicentric and acentric chromatids");
assert.match(pericentricInside.products[2], /duplication \+ deletion/,
  "a pericentric-loop crossover must generate centromere-bearing imbalances");
assert.deepEqual([reciprocalAlternate.balanced, reciprocalAdjacent.balanced], [1, 0],
  "alternate versus adjacent translocation segregation must separate balanced from unbalanced products");
assert.deepEqual([robertsonianBalanced.balanced, robertsonianTrisomy21.balanced], [1, 0],
  "the rob(14;21) trivalent must distinguish its balanced pair from the trisomy/monosomy-21 pair");
assert.match(robertsonianTrisomy21.products[0], /trisomy 21/,
  "the Robertsonian carrier fixture must expose the translocation-Down-syndrome route");

const trisomyRescue = models.chromosomeWorkbench({ kind: "rescue", origin: "trisomy", lost: "paternal" });
const monosomyRescue = models.chromosomeWorkbench({ kind: "rescue", origin: "monosomy", lost: "paternal" });
assert.deepEqual([trisomyRescue.updProbability, trisomyRescue.disomy], [1 / 3, "maternal heterodisomy"],
  "loss of the paternal copy in a two-maternal/one-paternal trisomy must create one-third-route maternal UPD");
assert.equal(trisomyRescue.routeProbability, 1 / 3,
  "the selected paternal-loss outcome must represent one of the three equiprobable trisomy-rescue losses");
assert.deepEqual([monosomyRescue.updProbability, monosomyRescue.disomy], [1, "isodisomy"],
  "monosomy rescue must necessarily duplicate the single homologue");

assert.equal(models.chromosomeWorkbench({ kind: "assay", event: "balanced", assay: "array" }).detected, false,
  "microarray must be blind to a balanced translocation");
assert.equal(models.chromosomeWorkbench({ kind: "assay", event: "deletion200", assay: "array" }).detected, true,
  "microarray must detect a 200 kb copy loss in the fixture");
assert.equal(models.chromosomeWorkbench({ kind: "assay", event: "repeatJunction", assay: "longWgs" }).detected, true,
  "long reads must span the repeat-mediated junction fixture");
assert.match(models.chromosomeWorkbench({ kind: "assay", event: "upd", assay: "array" }).detected, /SNPs|trio/,
  "UPD detection must require SNP/parental-origin information rather than copy number alone");

assert.equal(models.chromosomeWorkbench({ kind: "cnv", view: "dosage", state: "common" }).phenotype, "often healthy",
  "the CNV workbench must not label every reference difference pathogenic");
assert.deepEqual([
  models.chromosomeWorkbench({ kind: "cnv", view: "dosage", state: "pmp22One" }).phenotype,
  models.chromosomeWorkbench({ kind: "cnv", view: "dosage", state: "pmp22Two" }).phenotype,
  models.chromosomeWorkbench({ kind: "cnv", view: "dosage", state: "pmp22Three" }).phenotype,
], ["HNPP", "usual dosage", "CMT1A"],
"PMP22 one/two/three-copy states must preserve the reciprocal dosage experiment");
assert.equal(models.chromosomeWorkbench({
  kind: "cnv", view: "catastrophe", twoStates: true, clustered: true, randomJoins: true,
}).diagnosis, "chromothripsis signature",
"all three one-event features must diagnose the chromothripsis signature");
assert.notEqual(models.chromosomeWorkbench({
  kind: "cnv", view: "catastrophe", twoStates: true, clustered: false, randomJoins: false,
}).diagnosis, "chromothripsis signature",
"one chromothripsis-like feature alone must not prove a catastrophic event");

assert.equal(models.microbialGenetics({
  kind: "route", dnaseBlocks: true, filterBlocks: false, filtrateTransfers: true,
}).route, "transformation", "DNase-sensitive transfer must classify as transformation");
assert.equal(models.microbialGenetics({
  kind: "route", dnaseBlocks: false, filterBlocks: true, filtrateTransfers: false,
}).route, "conjugation", "contact-dependent transfer must classify as conjugation");
assert.equal(models.microbialGenetics({
  kind: "route", dnaseBlocks: false, filterBlocks: false, filtrateTransfers: true,
}).route, "transduction", "cell-free DNase-resistant transfer must classify as transduction");

const sharedPlasmids = models.microbialGenetics({ kind: "plasmid", control: "shared" });
const independentPlasmids = models.microbialGenetics({ kind: "plasmid", control: "independent" });
assert.deepEqual([sharedPlasmids.coexist, independentPlasmids.coexist], [false, true],
  "shared replication control must be incompatible while independent control permits coexistence");
assert.equal(models.microbialGenetics({ kind: "fprime", relationship: "differentGenes" }).complements, true,
  "different lac genes in an F-prime merodiploid must complement");
assert.equal(models.microbialGenetics({ kind: "fprime", relationship: "sameGene" }).complements, false,
  "two recessive lesions in the same complementation group must not complement");
assert.equal(models.microbialGenetics({ kind: "rFactor", contact: true }).transferred, true,
  "direct contact must permit conjugative R-factor transfer across the species fixture");
assert.equal(models.microbialGenetics({ kind: "rFactor", contact: false }).transferred, false,
  "a physical filter must block the R-factor conjugation fixture");

const forwardHfr = models.microbialGenetics({ kind: "hfr", direction: "forward", time: 106 });
const reverseHfr = models.microbialGenetics({ kind: "hfr", direction: "reverse", time: 106 });
assert.deepEqual(forwardHfr.markers.map((marker) => marker.name), ["thr", "pro", "lac", "gal", "trp", "his"],
  "forward Hfr transfer must preserve the chapter marker order");
assert.deepEqual(forwardHfr.markers.map((marker) => marker.arrival), [6, 11.6, 13.9, 23.1, 34.5, 51],
  "Hfr arrival times must add the same six-minute overhead to map distances");
assert.deepEqual(reverseHfr.markers.map((marker) => marker.name), ["thr", "his", "trp", "gal", "lac", "pro"],
  "reversing F orientation must reverse travel around the circular map from oriT");
for (let index = 1; index < forwardHfr.markers.length; index += 1) {
  assert.ok(forwardHfr.markers[index].plateau < forwardHfr.markers[index - 1].plateau,
    "later Hfr markers must have a lower transfer plateau in the teaching gradient");
}

const halfHeadful = models.microbialGenetics({ kind: "cotransduction", distance: 1, fragmentLength: 2 });
const beyondHeadful = models.microbialGenetics({ kind: "cotransduction", distance: 2.1, fragmentLength: 2 });
const nearCoincident = models.microbialGenetics({ kind: "cotransduction", distance: 0.01, fragmentLength: 2 });
assert.equal(halfHeadful.c, 0.125,
  "d/L = 1/2 must give cotransduction (1/2)^3 = 1/8");
assert.ok(Math.abs(halfHeadful.inferredDistance - 1) < 1e-12,
  "inverting the cotransduction relation must recover the input distance");
assert.deepEqual([beyondHeadful.c, beyondHeadful.saturated], [0, true],
  "all marker separations at or beyond one headful must collapse to C=0");
assert.equal(nearCoincident.resolutionLimited, true,
  "near-coincident markers must expose the C≈1 sampling-resolution limit");

assert.equal(models.microbialGenetics({ kind: "lambda", condition: "highMoi", genotype: "normal" }).state, "lysogeny",
  "high multiplicity with wild-type lambda must favour lysogeny in the fixture");
assert.equal(models.microbialGenetics({ kind: "lambda", condition: "damage", genotype: "normal" }).state, "lysis",
  "RecA-star DNA-damage induction must cleave cI and enter lysis");
assert.equal(models.microbialGenetics({ kind: "lambda", condition: "highMoi", genotype: "cIminus" }).state, "lysis",
  "cI-minus lambda must be unable to maintain lysogeny");
assert.equal(models.microbialGenetics({ kind: "lambda", condition: "highMoi", genotype: "cIIminus" }).state, "lysis-biased",
  "cII-minus lambda must fail to establish cI efficiently");

const differentCistrons = models.microbialGenetics({
  kind: "benzer", relationship: "differentCistrons", distanceBp: 1, progeny: 1e9,
});
const sameCistronDifferentSites = models.microbialGenetics({
  kind: "benzer", relationship: "sameCistron", distanceBp: 1, progeny: 1e9,
});
const sameSite = models.microbialGenetics({
  kind: "benzer", relationship: "sameCistron", distanceBp: 0, progeny: 1e9,
});
assert.equal(differentCistrons.complements, true,
  "Benzer mutants in different cistrons must complement");
assert.deepEqual([sameCistronDifferentSites.complements, sameCistronDifferentSites.recombines], [false, true],
  "same-function lesions at different positions must fail complementation but permit recombination");
assert.equal(sameSite.recombines, false,
  "the same mutation position must not generate a wild-type recombinant in the fixture");
assert.equal(sameCistronDifferentSites.rawOneEventFloor, 1e-9,
  "one raw event among 10^9 progeny must expose a 10^-9 counting floor");
assert.equal(sameCistronDifferentSites.detectionFloor, 1e-8,
  "the teaching display must retain the chapter's conservative effective selected floor near 10^-8");
assert.equal(sameCistronDifferentSites.selectionGainOrders, 4,
  "a 10^-8 selected floor must buy four orders beyond a 10^4-organism cross");
assert.ok(Math.abs(sameCistronDifferentSites.mapResolutionBp - 2.1112875) < 1e-12,
  "0.02 map units at 168,903 bp per 1,600 units must yield about 2.1 bp reliable resolution");
assert.equal(models.microbialGenetics({
  kind: "benzer", relationship: "differentCistrons", distanceBp: 0, progeny: 1e9,
}).effectiveDistanceBp, 1,
"different cistrons must not be permitted to occupy the same physical position");

// Part 4 — gene regulation. These fixtures protect the causal logic behind
// every control family in the six regulation Hero Labs.

const lacFullyInduced = models.operonCircuit({ kind: "lac", lactose: true, glucose: false });
const lacBasal = models.operonCircuit({ kind: "lac", lactose: false, glucose: true });
const lacCataboliteRepressed = models.operonCircuit({ kind: "lac", lactose: true, glucose: true });
assert.equal(lacFullyInduced.rate, 1,
  "lactose without glucose must define the normalised lac maximum");
assert.ok(lacBasal.rate > 0 && lacBasal.rate < 0.001,
  "the lac OFF state must retain a small non-zero basal bootstrap");
assert.ok(lacCataboliteRepressed.rate > lacBasal.rate && lacCataboliteRepressed.rate < 0.05,
  "glucose plus lactose must be induced above basal but strongly catabolite-repressed");

const transRescueOff = models.operonCircuit({ kind: "merodiploid", fixture: "transRescue", inducer: false });
const transRescueOn = models.operonCircuit({ kind: "merodiploid", fixture: "transRescue", inducer: true });
const cisVisible = models.operonCircuit({ kind: "merodiploid", fixture: "cisVisible", inducer: false });
const cisHidden = models.operonCircuit({ kind: "merodiploid", fixture: "cisHidden", inducer: false });
const superrepressor = models.operonCircuit({ kind: "merodiploid", fixture: "super", inducer: true });
const workedMerodiploid = models.operonCircuit({ kind: "merodiploid", fixture: "worked", inducer: true });
assert.deepEqual([transRescueOff.betaGal, transRescueOff.permease], [false, false],
  "trans LacI supplied by F-prime must repress both copies without inducer");
assert.deepEqual([transRescueOn.betaGal, transRescueOn.permease], [true, true],
  "inducer must release the shared functional LacI pool in the trans-rescue fixture");
assert.deepEqual([cisVisible.betaGal, cisVisible.permease], [true, true],
  "an operator-constitutive copy with intact structural genes must express in cis");
assert.deepEqual([cisHidden.betaGal, cisHidden.permease], [false, true],
  "a cis-constitutive Z-minus Y-plus copy must expose permease but not beta-galactosidase");
assert.deepEqual([superrepressor.betaGal, superrepressor.permease], [false, false],
  "LacI-super must remain dominant in trans even when inducer is present");
assert.deepEqual([workedMerodiploid.betaGal, workedMerodiploid.permease], [false, true],
  "the worked I-minus P-plus O-c Z-minus Y-plus / I-plus P-minus fixture must make only permease");

assert.equal(models.operonCircuit({
  kind: "attenuation", context: "bacterium", tryptophan: "scarce",
}).transcript, "trpEDCBA transcribed",
"scarce charged tRNA-Trp must stall the leader ribosome and favour the 2:3 antiterminator");
assert.equal(models.operonCircuit({
  kind: "attenuation", context: "bacterium", tryptophan: "plentiful",
}).fold, "3:4 terminator",
"plentiful charged tRNA-Trp must permit the bacterial 3:4 terminator");
assert.equal(models.operonCircuit({
  kind: "attenuation", context: "bacterium", tryptophan: "none",
}).transcript, "terminated",
"absence of a translating ribosome must not be mistaken for the Trp-starvation ON signal");
assert.equal(models.operonCircuit({
  kind: "attenuation", context: "eukaryote", tryptophan: "scarce",
}).transcript, "mechanism unavailable",
"nuclear transcription and cytoplasmic translation must make bacterial attenuation unavailable in eukaryotes");
assert.equal(models.operonCircuit({
  kind: "riboswitch", platform: "translation", ligand: true,
}).fold, "Shine–Dalgarno sequestered",
"a translation-platform riboswitch must hide its ribosome-binding site when ligand is bound");
assert.equal(models.operonCircuit({
  kind: "riboswitch", platform: "ribozyme", ligand: true,
}).output, "mRNA stability",
"glmS self-cleavage must be classified as regulation of message stability");
assert.equal(models.operonCircuit({ kind: "system", system: "phase", signal: 0 }).activity,
  models.operonCircuit({ kind: "system", system: "phase", signal: 100 }).activity,
  "phase variation must remain signal-independent in the teaching model");
assert.ok(models.operonCircuit({ kind: "system", system: "quorum", signal: 80 }).activity >
  models.operonCircuit({ kind: "system", system: "quorum", signal: 20 }).activity,
"quorum output must rise after the autoinducer threshold");

const intactDomain = models.enhancerLogic({ kind: "domain", boundaryIntact: true, orientation: "forward", rangeExtender: false });
const reversedDomain = models.enhancerLogic({ kind: "domain", boundaryIntact: true, orientation: "reverse", rangeExtender: false });
const openedDomain = models.enhancerLogic({ kind: "domain", boundaryIntact: false, orientation: "forward", rangeExtender: false });
assert.deepEqual([intactDomain.target, openedDomain.target], ["farther gene B", "nearest gene A"],
  "the boundary must outweigh genomic distance until it is deleted");
assert.deepEqual([intactDomain.contactA, intactDomain.contactB], [reversedDomain.contactA, reversedDomain.contactB],
  "enhancer orientation must not change the domain-contact calculation");
const motifFunnel = models.enhancerLogic({
  kind: "motif", bits: 10, partners: 3, accessibleFraction: 0.015, windowBp: 200,
});
assert.equal(motifFunnel.motifHits, 6_054_687.5,
  "a 10-bit motif on two strands of a 3.1 Gb genome must yield about 6.05 million chance hits");
assert.ok(motifFunnel.accessible < motifFunnel.combined && motifFunnel.combined < motifFunnel.motifHits,
  "partner motifs and chromatin accessibility must narrow the motif-candidate funnel in sequence");
assert.equal(models.enhancerLogic({
  kind: "module", factor: "ordinary", chromatin: "closed", activationDomain: "activator",
}).binds, false, "an ordinary TF must not bind the default-closed fixture");
assert.deepEqual(models.enhancerLogic({
  kind: "module", factor: "pioneer", chromatin: "closed", activationDomain: "activator",
}).opens, true, "a pioneer DNA-binding domain must be able to open the closed fixture");
assert.ok(models.enhancerLogic({
  kind: "grammar", grammar: "enhanceosome", perturbation: "spacingShuffle",
}).activity < models.enhancerLogic({
  kind: "grammar", grammar: "billboard", perturbation: "spacingShuffle",
}).activity, "enhanceosome output must be far more spacing-sensitive than billboard output");
const baseBurst = models.enhancerLogic({
  kind: "burst", baseKon: 0.2, baseKsyn: 10, koff: 1, decay: 0.5,
  enhancerStrength: 1, promoterStrength: 1,
});
const enhancerBurst = models.enhancerLogic({
  kind: "burst", baseKon: 0.2, baseKsyn: 10, koff: 1, decay: 0.5,
  enhancerStrength: 2, promoterStrength: 1,
});
const promoterBurst = models.enhancerLogic({
  kind: "burst", baseKon: 0.2, baseKsyn: 10, koff: 1, decay: 0.5,
  enhancerStrength: 1, promoterStrength: 2,
});
assert.deepEqual([enhancerBurst.burstSize, promoterBurst.kon], [baseBurst.burstSize, baseBurst.kon],
  "enhancer strength must change firing frequency while promoter strength changes burst size");
assert.ok(enhancerBurst.kon > baseBurst.kon && promoterBurst.burstSize > baseBurst.burstSize,
  "the independent burst controls must each affect their intended parameter");
assert.equal(models.enhancerLogic({ kind: "assay", assay: "chip" }).question, "occupancy",
  "ChIP must answer occupancy, not enhancer function");
assert.equal(models.enhancerLogic({ kind: "assay", assay: "hic" }).question, "contact",
  "3C/Hi-C must answer contact, not functional necessity");

const acetylMemory = models.epigeneticMemory({ kind: "mark", mark: "acetyl", feedback: true, divisions: 20 });
const methylMemory = models.epigeneticMemory({ kind: "mark", mark: "methyl", feedback: true, divisions: 20 });
const methylNoRestore = models.epigeneticMemory({ kind: "mark", mark: "methyl", feedback: false, divisions: 20 });
assert.equal(acetylMemory.strictEpigenetic, false,
  "histone acetylation without a read-write loop must not be labelled strict epigenetic memory");
assert.equal(methylMemory.strictEpigenetic, true,
  "symmetric CpG maintenance with read-write feedback must pass the strict persistence test");
assert.ok(methylMemory.value > methylNoRestore.value,
  "reader-writer restoration must preserve a mark better than pure dilution or loss");
assert.ok(Math.abs(methylMemory.stationary - 10 / 11) < 1e-12,
  "the CpG q=0.02, r=0.20 fixture must tend to a 10/11 marked fraction");
const maintenance = models.epigeneticMemory({ kind: "maintenance", start: 1, q: 0.02, r: 0.2, divisions: 40 });
assert.ok(Math.abs(maintenance.stationary - 10 / 11) < 1e-12 && maintenance.value > 0.9,
  "the two-state maintenance recurrence must relax toward r/(r+q)");
assert.equal(models.epigeneticMemory({
  kind: "methylation", context: "promoter", methylated: true,
}).outcome, "lower expression", "promoter methylation must be associated with lower expression in the stated fixture");
assert.equal(models.epigeneticMemory({
  kind: "methylation", context: "geneBody", methylated: true,
}).outcome, "tracks active transcription", "gene-body methylation must not be presented as generic repression");
const normalImprint = models.epigeneticMemory({
  kind: "imprinting", maternalMethylated: false, paternalMethylated: true,
});
const maternalGain = models.epigeneticMemory({
  kind: "imprinting", maternalMethylated: true, paternalMethylated: true,
});
const paternalLoss = models.epigeneticMemory({
  kind: "imprinting", maternalMethylated: false, paternalMethylated: false,
});
assert.deepEqual([normalImprint.igf2Copies, normalImprint.h19Copies], [1, 1],
  "normal H19/IGF2 imprinting must express one copy of each gene");
assert.deepEqual([maternalGain.igf2Copies, paternalLoss.igf2Copies], [2, 0],
  "maternal ICR methylation gain and paternal loss must create opposite IGF2 dosage states");
assert.match(models.epigeneticMemory({ kind: "identity", system: "cenpa" }).sequenceRequirement, /neocentromeres/,
  "centromere identity must expose evidence that alpha-satellite sequence is not sufficient");
assert.equal(models.epigeneticMemory({
  kind: "reprogramming", exposure: "pregnantFemale", generation: 2,
}).transgenerational, false, "F2 germ cells are directly exposed during an F0 maternal pregnancy exposure");
assert.equal(models.epigeneticMemory({
  kind: "reprogramming", exposure: "pregnantFemale", generation: 3,
}).transgenerational, true, "F3 is the first unexposed generation after an F0 maternal pregnancy exposure");
assert.equal(models.epigeneticMemory({
  kind: "reprogramming", exposure: "male", generation: 2,
}).transgenerational, true, "F2 is the first unexposed generation after an exposed F0 male");
assert.deepEqual(models.epigeneticMemory({
  kind: "clock", chronologicalAge: 55, predictedAge: 62, cellCompositionShift: 4,
}), { rawAcceleration: 7, adjustedAcceleration: 3, interpretation: "a regression residual, not a molecular ageing rate" },
"epigenetic age acceleration must retain both the raw and cell-composition-adjusted residual");

const sevenMer = models.rnaRegulation({ kind: "guide", family: "mirna", length: 7, searchSpace: 23_300_000 });
const twentyOneMer = models.rnaRegulation({ kind: "guide", family: "sirna", length: 21, searchSpace: 23_300_000 });
assert.ok(sevenMer.chanceMatches > 1422 && sevenMer.chanceMatches < 1423,
  "one specific 7-mer must have about 1,422 chance matches in 23.3 Mb");
assert.ok(twentyOneMer.chanceMatches < 0.00001,
  "a perfect 21-mer must have a negligible chance-match background in the same search space");
const miRnaStages = models.rnaRegulation({ kind: "mirnaStage", stage: 3 });
assert.deepEqual([miRnaStages.stages.length, miRnaStages.selected.name], [4, "RISC"],
  "the miRNA pipeline must end in an Argonaute-loaded RISC after four displayed stages");
assert.equal(models.rnaRegulation({ kind: "lnc", mechanism: "rna", perturbation: "aso" }).phenotype, true,
  "ASO depletion must hit an RNA-molecule mechanism");
assert.equal(models.rnaRegulation({ kind: "lnc", mechanism: "transcription", perturbation: "aso" }).phenotype, false,
  "ASO depletion must leave a causal act of transcription intact");
assert.equal(models.rnaRegulation({ kind: "lnc", mechanism: "dna", perturbation: "deletion" }).phenotype, true,
  "locus deletion must hit a causal DNA element");
assert.equal(models.rnaRegulation({ kind: "lnc", mechanism: "rna", perturbation: "rescue" }).phenotype, true,
  "rescue in trans must be sufficient only for an RNA-molecule mechanism");
assert.equal(models.rnaRegulation({ kind: "lnc", mechanism: "transcription", perturbation: "rescue" }).phenotype, false,
  "RNA rescue in trans must not restore a local transcriptional mechanism");
assert.equal(models.rnaRegulation({
  kind: "crispr", target: "phage", pamPresent: true, mismatches: 0,
}).outcome, "foreign target cleaved", "a matched phage protospacer with PAM must be cleaved");
assert.equal(models.rnaRegulation({
  kind: "crispr", target: "array", pamPresent: false, mismatches: 0,
}).outcome, "self spacer ignored", "the identical self spacer without PAM must be ignored");
assert.match(models.rnaRegulation({
  kind: "crispr", target: "array", pamPresent: true, mismatches: 0,
}).outcome, /autoimmunity/, "an engineered PAM next to the self spacer must expose autoimmunity, not foreign cleavage");
assert.equal(models.rnaRegulation({
  kind: "crispr", target: "phage", pamPresent: true, mismatches: 3,
}).cleavage, false, "a PAM must not override a badly mismatched guide");
assert.equal(models.rnaRegulation({ kind: "decay", minutes: 90, halfLife: 30 }).remaining, 0.125,
  "three mRNA half-lives must leave one eighth of the message");
const atf4Er = models.rnaRegulation({ kind: "atf4", stress: "er" });
const atf4Viral = models.rnaRegulation({ kind: "atf4", stress: "viral" });
const atf4None = models.rnaRegulation({ kind: "atf4", stress: "none" });
assert.deepEqual([atf4Er.kinase, atf4Viral.kinase], ["PERK", "PKR"],
  "ER stress and viral dsRNA must map to PERK and PKR respectively");
assert.ok(atf4Er.atf4Translation > atf4None.atf4Translation &&
  atf4Er.globalTranslation < atf4None.globalTranslation,
"eIF2-alpha phosphorylation must raise selective ATF4 translation while lowering global translation");

const linearPositive = models.networkDynamics({
  kind: "feedback", feedback: "positive", n: 1, signal: 0.02, initialState: "low",
});
const cooperativePositive = models.networkDynamics({
  kind: "feedback", feedback: "positive", n: 2, signal: 0.02, initialState: "low",
});
const negativeFeedback = models.networkDynamics({
  kind: "feedback", feedback: "negative", n: 2, signal: 0.02, initialState: "low",
});
assert.equal(linearPositive.memory, false,
  "positive autoregulation with Hill coefficient one must not be bistable");
assert.equal(cooperativePositive.memory, true,
  "the n=2 positive-feedback fixture must retain separated low and high histories");
assert.ok(Math.abs(negativeFeedback.lowFinal - negativeFeedback.highFinal) < 0.001,
  "negative feedback must converge from low and high starting histories");
const coherentBrief = models.networkDynamics({ kind: "ffl", loop: "coherent", pulse: 0.5 });
const coherentSustained = models.networkDynamics({ kind: "ffl", loop: "coherent", pulse: 8 });
const incoherentSustained = models.networkDynamics({ kind: "ffl", loop: "incoherent", pulse: 8 });
assert.deepEqual([coherentBrief.peak, coherentBrief.final], [0, 0],
  "the coherent AND loop must reject a brief input pulse");
assert.ok(coherentSustained.peak > 0.99,
  "a sustained input must let the delayed coherent arm cross threshold");
assert.ok(incoherentSustained.peak > 0.6 && incoherentSustained.final < 0.001,
  "the incoherent loop must pulse and adapt back down under a sustained input");
assert.equal(models.networkDynamics({
  kind: "stateMachine", circuit: "toggle", pulse: "x", delay: 2,
}).state, "X high · Y low", "an X pulse must select the X-high toggle state");
assert.match(models.networkDynamics({
  kind: "stateMachine", circuit: "oscillator", pulse: "none", delay: 2,
}).requirement, /6\.0 time units/, "the teaching clock period must scale with its delay");
const stripeDefault = models.networkDynamics({ kind: "pattern", lambda: 0.28 });
const stripeLongGradient = models.networkDynamics({ kind: "pattern", lambda: 0.55 });
assert.deepEqual(stripeDefault.cells.filter((cell) => cell.stripe).map((cell) => cell.position), [1 / 3, 3 / 8],
  "the default stripe-2 query must fire only between the facing Giant and Kruppel edges");
assert.ok(stripeLongGradient.cells.filter((cell) => cell.stripe).every((cell) => cell.position > 0.3 && cell.position < 0.44),
  "changing Bicoid length must not make this one enhancer generate a second posterior stripe");
assert.deepEqual(models.networkDynamics({ kind: "hox", perturbation: "loss" }).destination,
  "more anterior identity", "loss of a Hox selector must posterior-to-anterior transform identity");
assert.deepEqual(models.networkDynamics({ kind: "hox", perturbation: "ectopic" }).destination,
  "more posterior identity", "ectopic posterior Hox expression must anterior-to-posterior transform identity");
assert.ok(models.networkDynamics({
  kind: "attractor", forcedFactors: 4, barrier: 30,
}).probability > models.networkDynamics({
  kind: "attractor", forcedFactors: 4, barrier: 90,
}).probability, "lowering an attractor barrier must increase reprogramming probability");
const bufferedEnhancer = models.networkDynamics({
  kind: "buffer", variant: "enhancer", shadowEnhancer: true, stress: 0,
});
const stressedEnhancer = models.networkDynamics({
  kind: "buffer", variant: "enhancer", shadowEnhancer: true, stress: 100,
});
const codingVariant = models.networkDynamics({
  kind: "buffer", variant: "coding", shadowEnhancer: false, stress: 0,
});
assert.deepEqual([bufferedEnhancer.hidden, stressedEnhancer.hidden], [true, false],
  "a shadow enhancer must hide loss in benign conditions but reveal it under stress");
assert.equal(codingVariant.pleiotropy, "many tissues",
  "a coding perturbation must carry broader pleiotropy than one modular enhancer");

assert.equal(models.developmentalGenetics({ kind: "fate", logic: "position" }).afterAblation,
  "neighbours repattern and fill the gap", "positional fields must compensate after ablation");
assert.equal(models.developmentalGenetics({ kind: "fate", logic: "lineage" }).afterTransplant,
  "retains the inherited fate", "mosaic lineage logic must retain fate after transplantation");
assert.deepEqual([
  models.developmentalGenetics({ kind: "origin", tissue: "cranialBone" }).layer,
  models.developmentalGenetics({ kind: "origin", tissue: "heart" }).layer,
], ["ectoderm", "mesoderm"],
"cranial neural-crest bone and heart must retain their ectodermal and mesodermal origins");
assert.deepEqual([
  models.developmentalGenetics({ kind: "screen", defect: "gap" }).periodicity,
  models.developmentalGenetics({ kind: "screen", defect: "pairRule" }).periodicity,
  models.developmentalGenetics({ kind: "screen", defect: "polarity" }).periodicity,
], ["broad aperiodic domain", "two-segment periodicity", "one-segment periodicity"],
"gap, pair-rule, and segment-polarity phenotypes must map to their diagnostic periodicities");
assert.equal(models.developmentalGenetics({ kind: "homeosis", perturbation: "loss" }).transformation,
  "posterior → anterior", "homeotic loss must transform posterior identity toward anterior");
const switchEpistasis = models.developmentalGenetics({
  kind: "epistasis", pathway: "switch", alleles: "clamps", phenotypes: "opposite",
  relationship: "same", downstreamPhenotype: "ON", upstreamPhenotype: "OFF",
});
const substrateEpistasis = models.developmentalGenetics({
  kind: "epistasis", pathway: "substrate", alleles: "clamps", phenotypes: "opposite",
  relationship: "same", downstreamPhenotype: "pigment", upstreamPhenotype: "colourless",
});
const invalidEpistasis = models.developmentalGenetics({
  kind: "epistasis", pathway: "switch", alleles: "partial", phenotypes: "opposite",
  relationship: "same", downstreamPhenotype: "ON", upstreamPhenotype: "OFF",
});
assert.deepEqual([switchEpistasis.epistatic, substrateEpistasis.epistatic],
  ["downstream mutation", "upstream mutation"],
  "last-clamp and earliest-block pathways must imply opposite epistasis-order rules");
assert.equal(invalidEpistasis.valid, false,
  "ordering must be withheld unless alleles clamp opposite states in the same pathway");
assert.deepEqual([
  models.developmentalGenetics({ kind: "targeting", event: "none" }).survivesBoth,
  models.developmentalGenetics({ kind: "targeting", event: "correct" }).survivesBoth,
  models.developmentalGenetics({ kind: "targeting", event: "random" }).survivesBoth,
], [false, true, false],
"positive-negative selection must retain only the correctly targeted neo-plus tk-minus event");
const waitingConditional = models.developmentalGenetics({
  kind: "conditional", driver: true, tissue: "T cells", inducible: true,
  tamoxifen: false, orientation: "same",
});
const tracingConditional = models.developmentalGenetics({
  kind: "conditional", driver: true, tissue: "neural crest", inducible: true,
  tamoxifen: true, orientation: "same",
});
const inversionConditional = models.developmentalGenetics({
  kind: "conditional", driver: true, tissue: "neural crest", inducible: false,
  tamoxifen: false, orientation: "opposite",
});
assert.equal(waitingConditional.active, false,
  "CreER without tamoxifen must leave the floxed allele functional");
assert.match(tracingConditional.descendants, /permanently/,
  "Cre-lox lineage labels must persist in descendants after the initiating pulse");
assert.equal(inversionConditional.dnaOutcome, "intervening DNA inverted",
  "oppositely oriented loxP sites must invert rather than excise the interval");

const founderReset = models.hardyWeinberg({ kind: "reunion", p: 0.5, departure: 1 });
assert.deepEqual(founderReset.parental, { AA: 0.5, Aa: 0, aa: 0.5 },
  "a half-AA half-aa founder population must occupy the homozygote edge of the simplex");
assert.deepEqual(founderReset.offspring, { AA: 0.25, Aa: 0.5, aa: 0.25 },
  "one random-mating generation must put the founder fixture on the HWE curve");
assert.equal(founderReset.alleleFromParents, founderReset.alleleFromOffspring,
  "random mating must change genotype pairing without changing allele frequency");
const arbitraryReset = models.hardyWeinberg({ kind: "reunion", p: 0.3, departure: -0.8 });
assert.ok(Math.abs(arbitraryReset.offspring.AA - 0.09) < 1e-12 &&
  Math.abs(arbitraryReset.offspring.Aa - 0.42) < 1e-12,
"every feasible parental mixture must reach p-squared, 2pq, q-squared in one generation");
const inbreedingDeparture = models.hardyWeinberg({
  kind: "assumption", assumption: "mating", p: 0.5, strength: 0.4,
});
assert.ok(Math.abs(inbreedingDeparture.frequencies.Aa - 0.45) < 1e-12,
  "F = 0.1 must reduce p=q=0.5 heterozygosity from 0.5 to 0.45");
assert.equal(inbreedingDeparture.allele, "p unchanged",
  "non-random mating must repackage genotypes without moving allele frequency");
const partialViabilitySelection = models.hardyWeinberg({
  kind: "assumption", assumption: "selection", p: 0.6, strength: 0.5,
});
assert.ok(Math.abs(partialViabilitySelection.qAfter - 0.32 / 0.92) < 1e-12,
  "partial selection against aa must retain the surviving aa allele copies in post-selection q");
assert.ok(Math.abs(partialViabilitySelection.frequencies.Aa / 2 +
  partialViabilitySelection.frequencies.aa - partialViabilitySelection.qAfter) < 1e-12,
"the displayed post-selection genotype frequencies must imply the reported allele frequency");
const mutationShift = models.hardyWeinberg({
  kind: "assumption", assumption: "mutation", p: 0.6, strength: 0.75,
});
const migrationShift = models.hardyWeinberg({
  kind: "assumption", assumption: "migration", p: 0.6, strength: 0.75,
});
[mutationShift, migrationShift].forEach((result) => {
  const total = result.frequencies.AA + result.frequencies.Aa + result.frequencies.aa;
  const impliedQ = result.frequencies.Aa / 2 + result.frequencies.aa;
  assert.ok(Math.abs(total - 1) < 1e-12 && Math.abs(impliedQ - result.qAfter) < 1e-12,
    "mutation and migration displays must use a normalized next-zygote pool at the shifted q");
});
const hweExcess = models.hardyWeinberg({ kind: "test", AA: 210, Aa: 580, aa: 210 });
assert.ok(Math.abs(hweExcess.F + 0.16) < 1e-12 && Math.abs(hweExcess.chiSquare - 25.6) < 1e-12,
  "the chapter heterozygote-excess fixture must reproduce F-hat -0.16 and chi-square 25.6");
assert.match(hweExcess.diagnosis, /paralogues/,
  "negative F-hat must route quality control toward excess-heterozygosity assay failures");
const hweRare = models.hardyWeinberg({ kind: "test", AA: 991, Aa: 8, aa: 1 });
assert.ok(Math.abs(hweRare.chiSquare - 38.40812100704522) < 1e-10,
  "the rare-variant fixture must reproduce the misleading asymptotic chi-square statistic");
assert.ok(hweRare.exactP > 0.022 && hweRare.exactP < 0.023,
  "conditional HWE enumeration must recover the chapter's approximately 0.022 exact p-value");
assert.equal(hweRare.recommendedTest, "exact test",
  "a 0.025 expected minor-homozygote cell must reject the chi-square approximation");
const xLinked = models.hardyWeinberg({ kind: "xLinked", female: 0.9, male: 0.3, generations: 3 });
assert.deepEqual(xLinked.series.map((point) => [point.female, point.male]), [
  [0.9, 0.3], [0.6, 0.9], [0.75, 0.6], [0.675, 0.75],
], "X-linked frequencies must follow the chapter's alternating female-average and maternal-male recursion");
assert.ok(Math.abs(xLinked.difference - xLinked.predictedDifference) < 1e-12,
  "the iterated sex difference must equal (-1/2)^t times its starting value");
const carrierRisk = models.hardyWeinberg({ kind: "risk", incidence: 1 / 2500 });
assert.ok(Math.abs(carrierRisk.q - 0.02) < 1e-12 &&
  Math.abs(carrierRisk.carrier - 0.0392) < 1e-12,
"one-in-2,500 recessive incidence must imply q 0.02 and exact carrier frequency 0.0392");
assert.ok(Math.abs(carrierRisk.fractionHidden - 0.98) < 1e-12,
  "98 percent of the disease allele copies in the cystic-fibrosis fixture must sit in carriers");

const mutationOnly = models.populationForces({
  kind: "trajectory", q: 0.2, generations: 1, replicates: 1, seed: 1,
  mu: 1e-5, nu: 0, s: 0, h: 0.5, m: 0, sourceQ: 0, ne: 0,
});
assert.ok(Math.abs(mutationOnly.trajectories[0][1] - (0.2 + 0.8e-5)) < 1e-12,
  "forward mutation must change q by mu times p in one generation");
const recessiveSelection = models.populationForces({
  kind: "trajectory", q: 0.01, generations: 1, replicates: 1, seed: 1,
  mu: 0, nu: 0, s: 1, h: 0, m: 0, sourceQ: 0, ne: 0,
});
const dominantSelection = models.populationForces({
  kind: "trajectory", q: 0.01, generations: 1, replicates: 1, seed: 1,
  mu: 0, nu: 0, s: 1, h: 1, m: 0, sourceQ: 0, ne: 0,
});
assert.ok(recessiveSelection.trajectories[0][1] > 0.0098,
  "a rare fully recessive lethal must decline only by order q-squared");
assert.equal(dominantSelection.trajectories[0][1], 0,
  "a fully dominant lethal must expose and remove every copy in one generation");
const recessiveBalance = models.populationForces({
  kind: "balance", regime: "recessive", mu: 1e-6, s: 1, h: 0, s1: 0, s2: 0,
});
const dominantBalance = models.populationForces({
  kind: "balance", regime: "dominant", mu: 1e-6, s: 1, h: 1, s1: 0, s2: 0,
});
const sickleBalance = models.populationForces({
  kind: "balance", regime: "overdominance", mu: 0, s: 0, h: 0, s1: 0.11, s2: 0.8,
});
assert.ok(Math.abs(recessiveBalance.equilibrium - 0.001) < 1e-12,
  "recessive mutation-selection balance must be square root mu over s");
assert.ok(Math.abs(dominantBalance.equilibrium - 1e-6) < 1e-18,
  "dominant mutation-selection balance must be mu over hs");
assert.ok(Math.abs(sickleBalance.equilibrium - 0.11 / 0.91) < 1e-12,
  "the sickle-cell overdominance fixture must equilibrate at s1 over s1 plus s2");
const oneMigrant = models.populationForces({
  kind: "migration", n: 10000, m: 0.0001, q: 0.1, sourceQ: 0.8,
});
assert.ok(Math.abs(oneMigrant.migrants - 1) < 1e-12 && Math.abs(oneMigrant.fst - 0.2) < 1e-12,
  "one migrant per generation must give the island-model FST approximation 0.2 regardless of N");
const crashNe = models.populationForces({
  kind: "effectiveSize", history: [1000, 1000, 10, 1000, 1000],
  maleFraction: 0.5, offspringVariance: 2, s: -1e-5,
});
assert.ok(Math.abs(crashNe.harmonic - 48.07692307692307) < 1e-10,
  "a single generation at N=10 among four at N=1000 must give harmonic size about 48.08");
const sexSkewNe = models.populationForces({
  kind: "effectiveSize", history: [1000], maleFraction: 0.01,
  offspringVariance: 2, s: -1e-5,
});
assert.ok(Math.abs(sexSkewNe.adjusted - 39.6) < 1e-10,
  "ten males and 990 females must drift like an ideal population of 39.6");
const extremeCompositeNe = models.populationForces({
  kind: "effectiveSize", history: [50], maleFraction: 0.01,
  offspringVariance: 20, s: -1e-5,
});
assert.ok(extremeCompositeNe.rawAdjusted < 1 && extremeCompositeNe.adjusted === 1 &&
  extremeCompositeNe.newMutationP === 0.5 && extremeCompositeNe.approximationFloored,
"an out-of-domain product of effective-size corrections must be flagged and bounded before probabilities are computed");
const finiteSamplingDeparture = models.hardyWeinberg({
  kind: "assumption", assumption: "finite", p: 0.6, strength: 0.75,
});
assert.match(finiteSamplingDeparture.scale, /SD\(q′\)/);
assert.ok(Math.abs(Object.values(finiteSamplingDeparture.frequencies)
  .reduce((sum, value) => sum + value, 0) - 1) < 1e-12,
"finite sampling must leave normalized expected HWE genotypes conditional on the realised allele frequency");
const humanVisibility = models.populationForces({
  kind: "effectiveSize", history: [10000], maleFraction: 0.5,
  offspringVariance: 2, s: -1e-5,
});
const flyVisibility = models.populationForces({
  kind: "effectiveSize", history: [1000000], maleFraction: 0.5,
  offspringVariance: 2, s: -1e-5,
});
assert.match(humanVisibility.category, /nearly neutral/,
  "Nes = -0.1 must remain in the transition band for the human fixture");
assert.match(flyVisibility.category, /efficiently purges/,
  "Nes = -10 at the fly boundary must be classified as efficiently selected");

const firstCousinStructureRisk = models.structureInbreeding({
  kind: "pedigree", relationship: "firstCousins", q: 0.002,
});
assert.ok(Math.abs(firstCousinStructureRisk.F - 1 / 16) < 1e-12 &&
  Math.abs(firstCousinStructureRisk.risk - 1.2875e-4) < 1e-15,
"first-cousin path counting and q-squared plus Fpq must reproduce the chapter worked example");
assert.ok(Math.abs(firstCousinStructureRisk.expectedTracts - 13.125) < 1e-12,
  "first-cousin autozygosity must imply about thirteen 16.7 cM tracts on a 3,500 cM map");
const recentRoh = models.structureInbreeding({ kind: "roh", F: 0.05, meanLengthCm: 16.6666666667 });
const ancientRoh = models.structureInbreeding({ kind: "roh", F: 0.05, meanLengthCm: 0.5 });
assert.ok(Math.abs(recentRoh.generations - 3) < 1e-9,
  "a mean 16.7 cM ROH must date a shared ancestor about three generations back");
assert.equal(ancientRoh.generations, 100,
  "a mean 0.5 cM ROH must date ancestry about one hundred generations back");
const wahlund = models.structureInbreeding({
  kind: "wahlund", p1: 0.1, p2: 0.5, weight: 0.5, fis: 0,
});
assert.ok(Math.abs(wahlund.variance - 0.04) < 1e-12 &&
  Math.abs(wahlund.heterozygoteDeficit - 0.08) < 1e-12 &&
  Math.abs(wahlund.fst - 0.1904761904761905) < 1e-12,
"pooling p=0.1 and p=0.5 groups must reproduce the exact Wahlund worked example");
const nestedF = models.structureInbreeding({
  kind: "wahlund", p1: 0.2, p2: 0.7, weight: 0.4, fis: 0.12,
});
assert.ok(Math.abs(nestedF.fit - nestedF.chainedFit) < 1e-12,
  "FIS, FST, and FIT must satisfy one minus FIT equals their non-identity product");
const confoundedSmall = models.structureInbreeding({
  kind: "confounding", weight: 0.5, p1: 0.2, p2: 0.7,
  mean1: 0, mean2: 0.7, residualSd: 1, n: 5000,
});
const confoundedLarge = models.structureInbreeding({
  kind: "confounding", weight: 0.5, p1: 0.2, p2: 0.7,
  mean1: 0, mean2: 0.7, residualSd: 1, n: 500000,
});
assert.equal(confoundedSmall.withinGroupSlope, 0,
  "the confounding fixture must keep the true SNP effect zero inside both groups");
assert.ok(Math.abs(confoundedSmall.slope - confoundedLarge.slope) < 1e-15,
  "omitted-variable bias must not shrink when sample size grows");
assert.ok(confoundedLarge.t > 9.9 * confoundedSmall.t,
  "a hundredfold larger confounded study must increase apparent evidence by about tenfold");

const workedLd = models.linkageDisequilibrium({
  kind: "table", AB: 90, Ab: 10, aB: 30, ab: 70,
});
assert.ok(Math.abs(workedLd.D - 0.15) < 1e-12 &&
  Math.abs(workedLd.dPrime - 0.75) < 1e-12 &&
  Math.abs(workedLd.r2 - 0.375) < 1e-12,
"the chapter haplotype table must reproduce D 0.15, D-prime 0.75, and r-squared 0.375");
const rareLd = models.linkageDisequilibrium({
  kind: "table", AB: 10, Ab: 90, aB: 0, ab: 100,
});
assert.ok(Math.abs(rareLd.dPrime - 1) < 1e-12 &&
  Math.abs(rareLd.r2 - 1 / 19) < 1e-12 &&
  Math.abs(rareLd.sampleFactor - 19) < 1e-12,
"a rare allele on one background must give D-prime one but only 1/19 r-squared");
const repulsionLd = models.linkageDisequilibrium({
  kind: "table", AB: 10, Ab: 90, aB: 70, ab: 30,
});
assert.ok(Math.abs(repulsionLd.D + 0.15) < 1e-12 && Math.abs(repulsionLd.dPrime + 0.75) < 1e-12,
  "negative D must use the negative feasible bound and preserve association sign");
const decayedLd = models.linkageDisequilibrium({
  kind: "decay", d0: 0.15, r20: 0.375, c: 0.0025, generations: 100,
});
assert.ok(Math.abs(decayedLd.d - 0.1167835559384584) < 1e-12 &&
  Math.abs(decayedLd.r2 - 0.22730664896051744) < 1e-12,
"250 kb and 100 generations must reproduce the chapter's D and r-squared decay fixture");
assert.ok(Math.abs(decayedLd.halfLifeD - 276.91215404724807) < 1e-10 &&
  Math.abs(decayedLd.halfLifeR2 - decayedLd.halfLifeD / 2) < 1e-12,
"r-squared power must halve twice as fast as D under fixed allele frequencies");
const admixtureLd = models.linkageDisequilibrium({
  kind: "admixture", m: 0.5, pA1: 0.9, pA2: 0.1,
  pB1: 0.8, pB2: 0.2, c: 0.5, generations: 1,
});
assert.ok(Math.abs(admixtureLd.d0 - 0.12) < 1e-12 &&
  Math.abs(admixtureLd.remaining - 0.06) < 1e-12,
"admixture must create D between unlinked loci and recombination must halve it in one generation");
assert.ok(Math.abs(models.linkageDisequilibrium({
  kind: "sved", ne: 10000, c: 0.001,
}).r2 - 1 / 41) < 1e-12,
"the drift-recombination fixture must follow Sved's one over one plus 4Nec approximation");
const tagPenalty = models.linkageDisequilibrium({
  kind: "tag", r2: 0.2, causalN: 10000, studyN: 20000,
});
assert.deepEqual([tagPenalty.tagN, tagPenalty.effectiveN], [50000, 4000],
  "r-squared 0.2 must cost fivefold sample size and leave 4,000 causal-equivalent samples from 20,000");

const samplingFixture = models.samplingEstimation({
  kind: "sampling", targetP: 0.4205, frameP: 0.4205, n: 50, replicates: 40, seed: 31415,
});
const samplingHundredfold = models.samplingEstimation({
  kind: "sampling", targetP: 0.4205, frameP: 0.4084, n: 5000, replicates: 40, seed: 31415,
});
assert.ok(Math.abs(samplingFixture.formulaSe - 0.04936392913859269) < 1e-14,
  "p=0.4205 in 50 diploid people must give allele-frequency SE 0.04936");
assert.ok(Math.abs(samplingHundredfold.formulaSe -
  Math.sqrt(0.4084 * 0.5916 / 10000)) < 1e-14,
"the sampling model must divide allele-frequency variance by the number of sampled copies");
const sameFrameSmall = models.samplingEstimation({
  kind: "sampling", targetP: 0.4205, frameP: 0.4084, n: 50, replicates: 40, seed: 31415,
});
assert.ok(Math.abs(sameFrameSmall.formulaSe / samplingHundredfold.formulaSe - 10) < 1e-12,
  "a hundredfold sample-size increase must shrink SE tenfold");
assert.equal(sameFrameSmall.bias, samplingHundredfold.bias,
  "sample size must not change a fixed sampling-frame bias");

const heterozygosityCorrection = models.samplingEstimation({
  kind: "heterozygosity", p: 0.42, n: 20,
});
assert.ok(heterozygosityCorrection.naiveExpectation < heterozygosityCorrection.truth &&
  Math.abs(heterozygosityCorrection.correctedExpectation - heterozygosityCorrection.truth) < 1e-12,
"2n/(2n-1) must exactly remove plug-in heterozygosity bias under the sampling model");
const varianceEstimatorFixture = models.samplingEstimation({
  kind: "varianceEstimators", n: 20, truth: 4,
});
assert.equal(varianceEstimatorFixture.rows[0].expected, 4,
  "dividing normal sums of squares by n-1 must be unbiased");
assert.ok(varianceEstimatorFixture.rows[2].mse < varianceEstimatorFixture.rows[0].mse,
  "the biased n+1 normal-variance estimator must have lower MSE than the unbiased estimator");

const rareCoverage = models.samplingEstimation({ kind: "coverage", p: 0.005, n: 50 });
assert.ok(Math.abs(rareCoverage.waldCoverage - 0.39407096427043775) < 1e-12,
  "exact enumeration must reproduce about 39.4 percent Wald coverage at p=0.005 and n=50");
assert.ok(Math.abs(rareCoverage.wilsonCoverage - 0.9101776910086823) < 1e-12,
  "exact enumeration must reproduce about 91.0 percent Wilson coverage at p=0.005 and n=50");
assert.ok(Math.abs(rareCoverage.zeroProbability - Math.pow(0.995, 100)) < 1e-14 &&
  rareCoverage.expectedCopies === 0.5 && rareCoverage.ruleOfThree === 0.03,
"rare-variant information must expose zero counts, 2np, and the rule-of-three bound");
const blockOne = models.samplingEstimation({ kind: "bootstrap", unit: "block", blockLength: 1 });
const blockFifty = models.samplingEstimation({ kind: "bootstrap", unit: "block", blockLength: 50 });
const blockTwoHundred = models.samplingEstimation({ kind: "bootstrap", unit: "block", blockLength: 200 });
assert.deepEqual([blockOne.se, blockFifty.se, blockTwoHundred.se], [0.00149, 0.00463, 0.00519],
  "the fixed FST bootstrap fixture must reproduce the chapter's linked-block SEs");
const biasedFifty = models.samplingEstimation({ kind: "bias", p: 0.4205, dropout: 0.05, n: 50 });
const biasedHundredThousand = models.samplingEstimation({
  kind: "bias", p: 0.4205, dropout: 0.05, n: 100000,
});
assert.equal(biasedFifty.biasedMean, biasedHundredThousand.biasedMean,
  "growing biased data must not move its large-sample centre");
assert.ok(biasedHundredThousand.coverage < 1e-4 && biasedHundredThousand.se < biasedFifty.se / 40,
  "large biased samples must become precise while losing coverage of the target");

const twoLocusClasses = models.quantitativeTraits({
  kind: "polygenic", loci: 2, p: 0.5, environmentSd: 0.2, span: 6,
});
const threeLocusClasses = models.quantitativeTraits({
  kind: "polygenic", loci: 3, p: 0.5, environmentSd: 0.2, span: 6,
});
assert.deepEqual(twoLocusClasses.classes.map((row) => row.frequency),
  [1, 4, 6, 4, 1].map((value) => value / 16),
"two equal-frequency diploid loci must produce exact 1:4:6:4:1 score classes");
assert.ok(threeLocusClasses.classes.every((row, index) =>
  Math.abs(row.frequency - [1, 6, 15, 20, 15, 6, 1][index] / 64) < 1e-14),
"three equal-frequency diploid loci must produce exact binomial score classes");
const liabilityFixture = models.quantitativeTraits({
  kind: "liability", prevalence: 0.01, caseFraction: 0.5, observedH2: 0.1,
});
assert.ok(Math.abs(liabilityFixture.threshold - 2.3263478743880235) < 1e-9 &&
  Math.abs(liabilityFixture.meanAffected - 2.665214218193199) < 1e-9,
"one-percent prevalence must put the liability threshold at 2.326 and affected mean at 2.665");
assert.ok(Math.abs(liabilityFixture.conversion - 0.551907298954688) < 1e-9,
  "the ascertained half-case fixture must reproduce the chapter's observed-to-liability factor");

const fullVariance = models.quantitativeTraits({ kind: "variance", vg: 4, ve: 9, rho: -0.5, gxe: 2 });
assert.ok(Math.abs(fullVariance.covariance + 3) < 1e-12 && Math.abs(fullVariance.vp - 9) < 1e-12,
  "the full phenotype ledger must include twice the signed G-E covariance plus GxE variance");
const oneLocus = models.quantitativeTraits({ kind: "locus", p: 0.6, a: 10, d: 4 });
assert.ok(Math.abs(oneLocus.populationMean - 3.92) < 1e-12 &&
  Math.abs(oneLocus.alpha - 9.2) < 1e-12 &&
  Math.abs(oneLocus.va - 40.6272) < 1e-10 &&
  Math.abs(oneLocus.vd - 3.6864) < 1e-10 &&
  Math.abs(oneLocus.vg - oneLocus.va - oneLocus.vd) < 1e-10,
"the one-locus regression must reproduce M, alpha, VA, VD, and VG from the worked example");
const rareDominant = models.quantitativeTraits({ kind: "locus", p: 0.05, a: 10, d: 10 });
assert.ok(rareDominant.va > 8 * rareDominant.vd,
  "a rare completely dominant allele must provide the counterexample where most variance is additive");
const traitCorrelation = models.quantitativeTraits({
  kind: "correlation", y1: 1.4, y2: -0.8, environmentalCorrelation: -0.35,
});
assert.ok(Math.abs(traitCorrelation.environmentalCovariance + 0.35) < 1e-12,
  "with unit environmental variances, the environmental covariance must equal the labelled environmental correlation");
assert.ok(Math.abs(traitCorrelation.rP -
  (traitCorrelation.covA - 0.35) /
  Math.sqrt((traitCorrelation.vaX + 1) * (traitCorrelation.vaY + 1))) < 1e-12,
"phenotypic correlation must standardize total covariance by total trait variances");
assert.ok(Math.abs(traitCorrelation.rG) <= 1 && Math.abs(traitCorrelation.rP) <= 1,
  "genetic and phenotypic correlations must remain within correlation bounds");
const parentCovariance = models.quantitativeTraits({
  kind: "relatives", relationship: "parent", va: 4, vd: 2, vaa: 1,
});
const siblingCovariance = models.quantitativeTraits({
  kind: "relatives", relationship: "fullSibs", va: 4, vd: 2, vaa: 1,
});
assert.ok(Math.abs(parentCovariance.additive - 2) < 1e-12 && parentCovariance.dominance === 0,
  "parent-offspring covariance must contain one-half VA and no dominance variance");
assert.ok(Math.abs(siblingCovariance.dominance - 0.5) < 1e-12,
  "full-sib covariance must add one-quarter VD through two-allele IBD sharing");

const heritabilityPartition = models.heritabilitySelection({
  kind: "partition", va: 1.8, vd: 0.8, vi: 0.4, ve: 1,
});
assert.ok(Math.abs(heritabilityPartition.h2 - 0.45) < 1e-12 &&
  Math.abs(heritabilityPartition.H2 - 0.75) < 1e-12,
"narrow and broad heritability must use VA and total VG respectively");
for (const method of ["midparent", "fullSibs", "halfSibs", "twins"]) {
  const cleanMethod = models.heritabilitySelection({
    kind: "relativeMethod", method, va: 2, vd: 0, vaa: 0, ve: 2, common: 0, tagFraction: 1,
  });
  assert.ok(Math.abs(cleanMethod.method.estimate - 0.5) < 1e-12,
    `${method} must recover narrow heritability in the clean additive fixture`);
}
const taggedGreml = models.heritabilitySelection({
  kind: "relativeMethod", method: "greml", va: 2, vd: 0, vaa: 0,
  ve: 2, common: 0, tagFraction: 0.65,
});
assert.ok(Math.abs(taggedGreml.method.estimate - 0.325) < 1e-12,
  "common-SNP GREML mode must return only the tagged fraction of additive variance");
const selectionFixture = models.heritabilitySelection({
  kind: "selection", vp: 4, h2: 0.45, selectedFraction: 0.1, generations: 5, mean: 8,
});
assert.ok(Math.abs(selectionFixture.intensity - 1.7549833224837952) < 1e-9 &&
  Math.abs(selectionFixture.firstResponse - 1.5794849902354158) < 1e-9 &&
  Math.abs(selectionFixture.trajectory[2].va - 1.463499739707898) < 1e-9 &&
  Math.abs(selectionFixture.trajectory[2].response - 1.3418919907591285) < 1e-9,
"the truncation-selection model must reproduce the chapter's i, R1, Bulmer VA1, and R2 fixture");
const highHeritabilityGardens = models.heritabilitySelection({
  kind: "context", va: 4, veA: 0.2, veB: 0.2, meanA: 5, meanB: 12,
});
assert.ok(highHeritabilityGardens.h2A > 0.95 && highHeritabilityGardens.h2B > 0.95 &&
  highHeritabilityGardens.betweenDifference === 7,
"high within-garden heritability must coexist with an arbitrary environmental group-mean shift");

const eightCentimorgans = models.qtlMapping({
  kind: "attenuation", distanceCm: 8, additive: 0.822, dominance: 0.4,
});
assert.ok(Math.abs(eightCentimorgans.additiveFactor - Math.exp(-0.16)) < 1e-12 &&
  Math.abs(eightCentimorgans.observedAdditive - 0.7004621945302257) < 1e-12,
"eight centimorgans must attenuate an additive QTL by e^-0.16 and reproduce the 0.70 marker contrast");
assert.ok(Math.abs(eightCentimorgans.dominanceFactor -
  eightCentimorgans.additiveFactor ** 2) < 1e-12,
"dominance contrast and PVE must retain the square of the additive attenuation factor");
const ghostInterval = models.qtlMapping({ kind: "scan", fixture: "ghost", method: "interval" });
const ghostComposite = models.qtlMapping({ kind: "scan", fixture: "ghost", method: "composite" });
assert.equal(ghostInterval.peak.x, 50,
  "the labelled two-QTL schematic must place the one-QTL ghost maximum between the true loci");
assert.ok(ghostComposite.points.find((point) => point.x === 36).y >
  ghostComposite.points.find((point) => point.x === 50).y,
"conditioning in the schematic composite scan must split the ghost into peaks near true loci");
const f2Design = models.qtlMapping({ kind: "design", design: "f2", n: 400, replicates: 1, generations: 2 });
const rilDesign = models.qtlMapping({ kind: "design", design: "ril", n: 400, replicates: 8, generations: 20, rilMethod: "self" });
const ailDesign = models.qtlMapping({ kind: "design", design: "ail", n: 400, replicates: 1, generations: 40 });
const nilDesign = models.qtlMapping({ kind: "design", design: "nil", n: 400, replicates: 8, generations: 20 });
assert.ok(rilDesign.lineMeanH2 > f2Design.lineMeanH2 && ailDesign.intervalCm < rilDesign.intervalCm,
  "replicated RILs must buy line-mean power while a long AIL buys greater map expansion");
assert.equal(nilDesign.scope, "one preselected interval only",
  "NIL resolution must retain its genome-wide scope cost");
const threshold1500 = models.qtlMapping({ kind: "threshold", markers: 1500 });
const threshold50000 = models.qtlMapping({ kind: "threshold", markers: 50000 });
assert.ok(Math.abs(threshold1500.bonferroniLod - 3.7387550351047336) < 1e-9 &&
  Math.abs(threshold50000.bonferroniLod - 5.195926765811561) < 1e-9 &&
  threshold50000.bonferroniLod > threshold1500.bonferroniLod,
"Bonferroni LOD must reproduce the 1,500- and 50,000-marker chapter values and grow with tests");
const qtlResolution = models.qtlMapping({
  kind: "resolution", n: 400, effectSd: 0.52, thresholdLod: 3.4, truePve: 0.02,
});
assert.ok(Math.abs(qtlResolution.intervalCm - 13.868343195266272) < 1e-10 &&
  Math.abs(qtlResolution.detectionFloor - 0.039143946581) < 1e-12,
"N=400 and d=0.52 must give about 14 cM support and a 3.91 percent detection floor");
assert.ok(qtlResolution.detectedPve > qtlResolution.truePve && qtlResolution.inflation > 2,
  "conditioning a below-floor QTL on detection must produce a winner's-curse effect");
const exhaustionPlateau = models.heritabilitySelection({
  kind: "plateau", cause: "exhaustion", generations: 30,
});
assert.equal(exhaustionPlateau.replicates.length, 5);
assert.ok(exhaustionPlateau.replicates.every((line) => line.every((point, index) =>
  index === 0 || point.value >= line[index - 1].value)),
"the favourable-allele exhaustion fixture must approach its plateau monotonically in every replicate");
assert.match(exhaustionPlateau.diagnostic.reverse, /no stored variance/,
  "the plateau diagnosis must distinguish exhausted variance from recoverable opposition");
assert.match(models.qtlMapping({ kind: "human", method: "association" }).failure,
  /tagging do not identify a causal gene/,
"human population association must stop at tagged association rather than claim causal-gene resolution");
assert.equal(models.qtlMapping({ kind: "human", method: "linkage" }).resolution, "10–20 cM",
  "pedigree linkage must retain its coarse family-crossover resolution fixture");

// S4 — hypothesis testing
const hweChapter = models.hypothesisTesting({
  kind: "hwe", observed: [166, 237, 100], estimateP: true,
});
assert.ok(Math.abs(hweChapter.alleleP - 0.5656063618290258) < 1e-14 &&
  Math.abs(hweChapter.statistic - 0.8515629301279481) < 1e-14 &&
  Math.abs(hweChapter.pValue - 0.3561105681398722) < 1e-6,
"the S4 HWE fixture must reproduce the chapter allele frequency, chi-square, and df=1 tail");
assert.equal(hweChapter.df, 1,
  "estimating allele frequency from the tested genotype counts must spend one degree of freedom");
const hweKnownP = models.hypothesisTesting({
  kind: "hwe", observed: [166, 237, 100], estimateP: false, p: 0.5656,
});
assert.equal(hweKnownP.df, 2,
  "an allele frequency supplied independently must leave two genotype residual degrees of freedom");
const sparseHwe = models.hypothesisTesting({
  kind: "hwe", observed: [90, 9, 1], estimateP: true,
});
assert.equal(sparseHwe.exactRequired, true,
  "a sparse minor-homozygote expectation must route learners away from the asymptotic chi-square test");
const powerWeak = models.hypothesisTesting({ kind: "power", n: 100, effect: 0.05, alpha: 0.05 });
const powerStrict = models.hypothesisTesting({ kind: "power", n: 1000, effect: 0.10, alpha: 0.001 });
assert.ok(Math.abs(powerWeak.power - 0.07909758092804148) < 1e-10 &&
  Math.abs(powerStrict.power - 0.4489758989117261) < 1e-10,
"the normal representation of the 1-df noncentral chi-square must reproduce the chapter power fixtures");
const baseRateFlags = models.hypothesisTesting({
  kind: "baseRate", m: 1000000, prior: 0.01, n: 2000, effect: 0.15, alpha: 0.05,
});
assert.ok(baseRateFlags.truePositive > 9999 && baseRateFlags.falsePositive === 49500 &&
  baseRateFlags.positivePredictiveValue < 0.17,
"at alpha 0.05, the million-variant base-rate fixture must flag about five times more good variants than broken ones");
const flatHistogram = models.hypothesisTesting({ kind: "histogram", profile: "uniform" });
assert.equal(new Set(flatHistogram.bins).size, 1,
  "a calibrated all-null p-value fixture must be flat");
const analysisUniverse = models.hypothesisTesting({
  kind: "multiplicity", loci: 3564, codings: 3, populations: 5, alpha: 0.05,
});
assert.equal(analysisUniverse.tests, 53460,
  "loci, genetic codings, and population subsets must multiply into the reachable analysis universe");

// Ch 33 — neutral theory and selection evidence
const neutralSmall = models.selectionEvidence({ kind: "cancellation", n: 100, mu: 1e-6 });
const neutralLarge = models.selectionEvidence({ kind: "cancellation", n: 100000000, mu: 1e-6 });
assert.equal(neutralSmall.substitutionRate, 1e-6);
assert.equal(neutralLarge.substitutionRate, 1e-6,
  "neutral mutation input and fixation probability must cancel population size exactly");
assert.ok(Math.abs(neutralLarge.entries / neutralSmall.entries - 1000000) < 1e-6,
  "the cancellation must not be faked by holding mutation input constant");
const overdispersedClock = models.selectionEvidence({ kind: "clock", mean: 8, rateCv: 0.5 });
assert.equal(overdispersedClock.dispersion, 3,
  "Poisson rate mixtures must add between-lineage variance and raise Var/Mean above one");
const humanBarrier = models.selectionEvidence({ kind: "driftBarrier", ne: 10000, s: -1e-5 });
const flyBarrier = models.selectionEvidence({ kind: "driftBarrier", ne: 1000000, s: -1e-5 });
assert.ok(humanBarrier.strength < 1 && flyBarrier.strength > 10,
  "the same mildly deleterious effect must cross the drift barrier as effective size grows");
const jcWorked = models.selectionEvidence({ kind: "distance", p: 0.11, length: 1200 });
assert.ok(Math.abs(jcWorked.distance - 0.118953772632479) < 1e-14,
  "p=0.11 must reproduce the chapter's Jukes-Cantor distance");
assert.equal(models.selectionEvidence({ kind: "distance", p: 0.75, length: 1200 }).saturated, true,
  "Jukes-Cantor distance must become undefined at the 0.75 information ceiling");
const omegaWorked = models.selectionEvidence({
  kind: "omega", nonsynonymousChanges: 42, nonsynonymousSites: 900,
  synonymousChanges: 90, synonymousSites: 300,
});
assert.ok(Math.abs(omegaWorked.omega - 0.1257616410365957) < 1e-14,
  "dN/dS must normalise by site opportunity and correct each class separately");
const dilutedSelection = models.selectionEvidence({
  kind: "siteMixture", sites: 400, positiveSites: 5, positiveOmega: 3, backgroundOmega: 0.1,
});
assert.ok(dilutedSelection.geneWideOmega < 1 && dilutedSelection.positiveSites > 0,
  "a real positively selected site class must be able to coexist with gene-wide omega below one");
const tajimaWorked = models.selectionEvidence({ kind: "tajima", n: 10, s: 16, pi: 3.2 });
assert.ok(Math.abs(tajimaWorked.thetaW - 5.655772198064245) < 1e-13 &&
  Math.abs(tajimaWorked.d - (-2.0100190888584057)) < 1e-13,
"the SFS fixture must reproduce the chapter's Watterson theta and Tajima D");
const neutralSpectrum = models.selectionEvidence({
  kind: "sfs", scenario: "neutral", n: 10, segregatingSites: 16,
});
const sweepSpectrum = models.selectionEvidence({
  kind: "sfs", scenario: "sweep", n: 10, segregatingSites: 16,
});
const balancingSpectrum = models.selectionEvidence({
  kind: "sfs", scenario: "balancing", n: 10, segregatingSites: 16,
});
const piFromDisplayedBins = (spectrum) => spectrum.bins.reduce((total, point) => total +
  2 * point.x * (spectrum.n - point.x) / (spectrum.n * (spectrum.n - 1)) * point.y, 0);
assert.ok(Math.abs(neutralSpectrum.bins.reduce((total, point) => total + point.y, 0) - 16) < 1e-12 &&
  Math.abs(neutralSpectrum.pi - piFromDisplayedBins(neutralSpectrum)) < 1e-12 &&
  Math.abs(neutralSpectrum.statistic.d) < 1e-12,
"the displayed neutral SFS must contain S=16 and produce its own pi and Tajima D readouts");
assert.ok(sweepSpectrum.statistic.d < -1.8 && balancingSpectrum.statistic.d > 1.8,
  "the displayed sweep and balancing spectra must drive Tajima D in opposite directions");
const mkWorked = models.selectionEvidence({ kind: "mk", dn: 42, ds: 90, pn: 8, ps: 42 });
assert.ok(Math.abs(mkWorked.alpha - 0.5918367346938775) < 1e-14,
  "the McDonald-Kreitman fixture must estimate about 59.2 percent adaptive substitutions");
const hardSweep = models.selectionEvidence({ kind: "linked", scenario: "sweep" });
const backgroundSelection = models.selectionEvidence({ kind: "linked", scenario: "background" });
const sweepCentre = hardSweep.points.find((point) => point.x === 0);
const bgsCentre = backgroundSelection.points.find((point) => point.x === 0);
assert.ok(sweepCentre.longHaplotype > bgsCentre.longHaplotype &&
  sweepCentre.highDerived > bgsCentre.highDerived,
"the schematic hard sweep must add long-haplotype and high-derived evidence beyond the diversity trough shared with BGS");

// Ch 34 — phylogenetic inference
const topologies4 = models.phylogenyInference({ kind: "topologies", n: 4 });
const topologies10 = models.phylogenyInference({ kind: "topologies", n: 10 });
assert.equal(topologies4.unrooted, 3n);
assert.equal(topologies10.unrooted, 2027025n,
  "unrooted binary topology counts must follow (2n-5) double factorial");
const phylogeneticDistance = models.phylogenyInference({ kind: "distance", q: 0.11, length: 1200 });
assert.ok(Math.abs(phylogeneticDistance.distance - 0.118953772632479) < 1e-14,
  "phylogenetic observed differences must receive the same Jukes-Cantor multiple-hit correction used in selection evidence");
const pattersonFixture = models.phylogenyInference({ kind: "patterson", abba: 130, baba: 70 });
assert.ok(Math.abs(pattersonFixture.d - 0.3) < 1e-15,
  "Patterson D must be the normalized ABBA-minus-BABA imbalance");
const felsensteinZone = models.phylogenyInference({
  kind: "longBranch", longChange: 0.35, internalChange: 0.02,
});
assert.ok(Math.abs(felsensteinZone.misleadingPattern - 0.040833333333333326) < 1e-15 &&
  felsensteinZone.winner === "wrong long-branch grouping",
"p=0.35 and q=0.02 must put parsimony inside the chapter's long-branch-attraction zone");
const shortClockData = models.phylogenyInference({
  kind: "clock", sequenceLength: 100, calibrationCv: 0.15, information: 0.02,
});
const immenseClockData = models.phylogenyInference({
  kind: "clock", sequenceLength: 100000000, calibrationCv: 0.15, information: 0.02,
});
assert.ok(immenseClockData.totalCv < shortClockData.totalCv &&
  immenseClockData.totalCv > immenseClockData.asymptoticFloor,
"more sequence must narrow date uncertainty toward, but never below, the calibration floor");
const coalescentWorked = models.phylogenyInference({
  kind: "coalescent", n: 10, populationN: 10000, tau: 1,
});
assert.equal(coalescentWorked.tmrca, 36000);
assert.ok(Math.abs(coalescentWorked.discordantProbability - 0.24525296078096154) < 1e-14 &&
  coalescentWorked.deepestFraction > 0.5,
"the coalescent fixture must reproduce E[TMRCA], ILS discordance, and dominance of the final pair");

// Ch 35 — genome evolution
const retrocopy = models.genomeEvolution({ kind: "duplication", mechanism: "retro" });
assert.ok(retrocopy.signatures.includes("no introns") && retrocopy.signatures.includes("poly-A remnant"),
  "retrotransposition must leave processed-mRNA rather than tandem-duplication signatures");
const duplicateFates = models.genomeEvolution({
  kind: "fates", ne: 10000, s: 0.01, phi: 1e-4, r: 1,
});
assert.ok(Math.abs(duplicateFates.pNeo - 0.038461538461538464) < 1e-15 &&
  Math.abs(duplicateFates.pSub - 2 / 9) < 1e-15,
"the vertebrate fixture must give 3.8 percent neofunctionalisation and 22.2 percent DDC");
const duplicateFatesLargeN = models.genomeEvolution({
  kind: "fates", ne: 10000000, s: 0.01, phi: 1e-4, r: 1,
});
assert.ok(duplicateFatesLargeN.pNeo > 0.97 && duplicateFatesLargeN.pSub === duplicateFates.pSub,
  "only the adaptive duplicate-preservation route must change with effective population size");
const ksWorked = models.genomeEvolution({
  kind: "ks", ks: 0.85, rate: 6.1e-9, backgroundBase: 900, halvingKs: 0.1, observedAtPoint: 3300,
});
assert.ok(Math.abs(ksWorked.ageYears - 69672131.14754099) < 1e-5 &&
  Math.abs(ksWorked.backgroundAtPoint - 4.9718445552179125) < 1e-12 && ksWorked.excess > 660,
"the Ks peak must date the WGD near 70 My and stand about 660-fold above the exponential background");
const ksRenderedPeak = ksWorked.points.find((point) => Math.abs(point.x - 0.85) < 1e-9);
assert.ok(ksRenderedPeak && Math.abs(ksRenderedPeak.total - ksWorked.observedAtPoint) < 1e-9,
  "the drawn Ks peak must equal the stated observed count rather than adding the background twice");
const humanHazard = models.genomeEvolution({
  kind: "hazard", ne: 10000, mutationRate: 1.3e-8, criticalPositions: 30,
});
assert.ok(Math.abs(humanHazard.strength - 0.0039) < 1e-15 &&
  Math.abs(humanHazard.detectablePositions - 7692.3076923076915) < 1e-10,
"the human mutational-hazard fixture must preserve the lineage-specific Ne*u arithmetic");
const pseudoorthology = models.genomeEvolution({ kind: "pseudoorthology", singleCopyProbability: 0.4 });
assert.ok(Math.abs(pseudoorthology.reciprocalLossProbability - 0.08) < 1e-15,
  "q=0.4 must yield an eight-percent reciprocal differential-loss risk");
const openPan = models.genomeEvolution({ kind: "pangenome", alpha: 0.7, genomes: 100, k: 450, initial: 3200 });
const closedPan = models.genomeEvolution({ kind: "pangenome", alpha: 1.3, genomes: 100, k: 450, initial: 3200 });
assert.equal(openPan.open, true);
assert.equal(closedPan.open, false,
  "the bacterial pan-genome integral must separate divergent alpha<1 from convergent alpha>1 regimes");

// Ch 35A — speciation and conservation
assert.equal(models.speciationBoundary({
  kind: "concept", scenario: "asexual", concept: "biological",
}).outcome, "no answer",
"the biological species operation must refuse an asexual fixture rather than force a boundary");
assert.equal(models.speciationBoundary({
  kind: "concept", scenario: "hybridising", concept: "cluster",
}).outcome, "two species if bimodal",
"the genotypic-cluster criterion must directly handle a persistent hybridising bimodality");
const twoHalfBarriers = models.speciationBoundary({ kind: "barriers", barriers: [0.5, 0.5] });
assert.deepEqual(twoHalfBarriers.contributions, [0.5, 0.25]);
assert.equal(twoHalfBarriers.isolation, 0.75,
  "two sequential 50-percent barriers must produce 75-percent combined isolation, not 100 percent");
const dmiSnowball = models.speciationBoundary({
  kind: "dmi", substitutions: 20, left: 10, probability: 0.02,
});
assert.equal(dmiSnowball.untestedPairs, 100);
assert.equal(dmiSnowball.expected, 2,
  "ten derived substitutions per lineage must create 100 novel pairs and two expected DMIs at p=0.02");
assert.equal(models.speciationBoundary({ kind: "haldane", dominance: 0.25 }).rulePredicted, true);
assert.equal(models.speciationBoundary({ kind: "haldane", dominance: 0.60 }).rulePredicted, false,
  "the dominance account of Haldane's rule must switch exactly at h=1/2");
const toadCline = models.speciationBoundary({
  kind: "cline", sigma: 0.99, width: 6.05, model: "bazykin",
});
assert.ok(Math.abs(toadCline.selection - 0.21421487603305786) < 1e-15,
  "the Bazykin inversion must reproduce about 21 percent selection in the chapter toad fixture");
assert.equal(models.speciationBoundary({ kind: "patterson", abba: 120, baba: 80 }).d, 0.2,
  "ABBA=120 and BABA=80 must produce Patterson D=0.2");
const localTransplant = models.speciationBoundary({
  kind: "transplant", aa: 1.4, ab: 0.7, ba: 0.8, bb: 1.3,
});
assert.equal(localTransplant.locallyAdapted, true,
  "crossing local-versus-foreign reaction norms must satisfy both local-adaptation inequalities");
const siteOnlyTransplant = models.speciationBoundary({
  kind: "transplant", aa: 1.4, ab: 0.7, ba: 1.4, bb: 0.7,
});
assert.equal(siteOnlyTransplant.locallyAdapted, false,
  "a pure site-quality effect with equal populations within site must not count as local adaptation");
const sexRatioNe = models.speciationBoundary({
  kind: "conservation", males: 10, females: 90, migrants: 2,
});
assert.equal(sexRatioNe.ne, 36);
assert.ok(Math.abs(sexRatioNe.inbreedingRate - 1 / 72) < 1e-15 &&
  Math.abs(sexRatioNe.nem - 0.72) < 1e-15,
"the managed-population fixture must compute sex-ratio Ne, delta-F, and sustained migrant currency");

const lowInputPcr = models.molecularMethods({
  kind: "pcr", n0: 10, efficiency: 1, cycles: 40, capacity: 1e12, threshold: 1e8,
});
const highInputPcr = models.molecularMethods({
  kind: "pcr", n0: 1e6, efficiency: 1, cycles: 40, capacity: 1e12, threshold: 1e8,
});
assert.equal(lowInputPcr.copies, 1e12);
assert.equal(highInputPcr.copies, 1e12,
  "endpoint PCR fixtures with very different inputs must converge on the same explicit capacity");
assert.ok(Math.abs(lowInputPcr.ct - Math.log2(1e7)) < 1e-12 &&
  Math.abs(highInputPcr.ct - Math.log2(100)) < 1e-12,
"PCR threshold cycles must follow Ct = log(threshold/N0)/log(1+E)");

const chapterQpcr = models.molecularMethods({
  kind: "qpcr", targetEfficiency: 0.995, referenceEfficiency: 0.995,
  controlTarget: 24.60, controlReference: 20.10,
  treatedTarget: 22.15, treatedReference: 20.05,
});
assert.ok(Math.abs(chapterQpcr.deltaDeltaCt + 2.4) < 1e-12 &&
  Math.abs(chapterQpcr.idealFold - 5.278031643091585) < 1e-12,
"the chapter delta-delta-Ct fixture must reproduce the 5.28-fold ideal calculation");
assert.ok(Math.abs(chapterQpcr.correctedFold - 5.2464188540852446) < 1e-12,
  "the efficiency-corrected ratio must use both measured amplification efficiencies");

const chapterDpcr = models.molecularMethods({
  kind: "dpcr", partitions: 20000, positives: 4200, partitionNl: 0.85,
});
assert.ok(Math.abs(chapterDpcr.lambda + Math.log(0.79)) < 1e-15 &&
  Math.abs(chapterDpcr.copies - 4714.446670421396) < 1e-9,
"digital PCR must invert the empty fraction instead of equating positive droplets with molecules");
assert.ok(Math.abs(chapterDpcr.concentration - 277.3203923777292) < 1e-9,
  "the 20,000 by 0.85 nL fixture must report copies per 17 microlitres");

assert.equal(models.molecularMethods({
  kind: "gel", molecule: "dna", matrix: "free", lengths: [100, 1000],
}).separatesByLength, false,
"DNA must not separate by length in free solution when charge and drag scale together");
assert.equal(models.molecularMethods({
  kind: "gel", molecule: "dna", matrix: "agarose", lengths: [100, 1000],
}).separatesByLength, true,
"a sieving matrix must expose DNA length through its constant charge-to-mass ratio");
assert.equal(models.molecularMethods({
  kind: "gel", molecule: "protein", matrix: "sds", lengths: [15, 100],
}).separatesByLength, true,
"SDS must manufacture the charge-to-mass regularity needed for a protein size ladder");

assert.equal(models.molecularMethods({
  kind: "assembly", method: "restriction", fragments: 4,
  internalSite: false, junctionsUnique: true, overlap: 25,
}).viable, false,
"the restriction-cloning fixture must expose its fixed-site scaling constraint");
assert.match(models.molecularMethods({
  kind: "assembly", method: "restriction", fragments: 4,
  internalSite: false, junctionsUnique: true, overlap: 25,
}).constraint, /teaching plan/,
"the restriction fragment limit must be scoped to the selected teaching plan, not stated as a universal molecular limit");
assert.equal(models.molecularMethods({
  kind: "assembly", method: "gibson", fragments: 8,
  internalSite: true, junctionsUnique: true, overlap: 25,
}).viable, true,
"an internal restriction site must not constrain Gibson assembly");
assert.equal(models.molecularMethods({
  kind: "assembly", method: "golden", fragments: 8,
  internalSite: true, junctionsUnique: true, overlap: 25,
}).viable, false,
"an internal Type IIS site must invalidate the Golden Gate fixture");
assert.match(models.molecularMethods({
  kind: "assembly", method: "golden", fragments: 24,
  internalSite: false, junctionsUnique: true, overlap: 25,
}).constraint, /teaching library/,
"the Golden Gate capacity boundary must name the curated teaching library rather than exhaust the universal overhang space");

const independentConfirmation = models.molecularMethods({
  kind: "orthogonal", firstError: 0.01, secondError: 0.02, sharedFraction: 0,
});
const sharedConfirmation = models.molecularMethods({
  kind: "orthogonal", firstError: 0.01, secondError: 0.02, sharedFraction: 1,
});
assert.ok(Math.abs(independentConfirmation.jointError - 0.0002) < 1e-15 &&
  Math.abs(sharedConfirmation.jointError - 0.01) < 1e-15,
"orthogonal errors must multiply only when their failure modes are independent");

assert.ok(Math.abs(models.geneticScreen({ kind: "breeding", clones: 11 }).recovery -
  (1 - Math.pow(0.75, 11))) < 1e-15,
"eleven selfed F2 clones must give the chapter's 95.8 percent recessive-recovery probability");
const chapterSaturation = models.geneticScreen({
  kind: "saturation", recoveredGroups: 27, singletons: 9, doubletons: 7,
});
assert.ok(Math.abs(chapterSaturation.unseen - 81 / 14) < 1e-15 &&
  Math.abs(chapterSaturation.saturation - 27 / (27 + 81 / 14)) < 1e-15,
"the singleton-doubleton fixture must reproduce about six unseen genes and 82 percent saturation");

const chapterBulk = models.geneticScreen({
  kind: "bulk", selectedIndividuals: 50, distanceCm: 10, depth: 20,
});
assert.equal(chapterBulk.selectedChromosomes, 100);
assert.ok(Math.abs(chapterBulk.recombination - 0.5 * (1 - Math.exp(-0.2))) < 1e-15 &&
  Math.abs(chapterBulk.expectedFrequency - 0.5 * (1 + Math.exp(-0.2))) < 1e-15,
"bulk mapping must use Haldane map distance rather than equating centimorgans with recombination percentage");
assert.equal(chapterBulk.breakpointFloorCm, 1,
  "100 selected chromosomes must set an approximately one-centimorgan breakpoint floor");
assert.ok(chapterBulk.readSe > chapterBulk.poolSe,
  "the displayed 20x per-site read error must remain distinct from finite-pool composition error");
const distantBulkMarker = models.geneticScreen({
  kind: "bulk", selectedIndividuals: 50, distanceCm: 120, depth: 20,
});
assert.ok(distantBulkMarker.recombination < 0.5 && distantBulkMarker.recombination > 0.45 &&
  distantBulkMarker.expectedFrequency > 0.5 && distantBulkMarker.expectedFrequency < 0.55,
"multiple crossovers must make observed recombination approach, but never exceed, the unlinked one-half ceiling");
const underpoweredNegative = models.geneticScreen({
  kind: "negative", animalsPerGroup: 8, trueEffectSd: 0.5,
});
const poweredNegative = models.geneticScreen({
  kind: "negative", animalsPerGroup: 80, trueEffectSd: 0.5,
});
assert.ok(poweredNegative.detectable80 < underpoweredNegative.detectable80 &&
  poweredNegative.power > underpoweredNegative.power,
"a defensible no-phenotype claim must gain power and lower its detectable-effect bound with independent animals");

const chapterPool = models.geneticScreen({
  kind: "pooled", cellsPerGuide: 50, readsPerGuide: 500, log2Effect: -0.5,
});
assert.ok(chapterPool.cellLogSe > 3 * chapterPool.readLogSe,
  "a 50-cell bottleneck must dominate the noise despite 500 reads per guide");
const syntheticSick = models.geneticScreen({
  kind: "epistasis", wa: 0.8, wb: 0.7, wab: 0.3,
});
assert.ok(Math.abs(syntheticSick.expected - 0.56) < 1e-15 &&
  Math.abs(syntheticSick.epsilon + 0.26) < 1e-15 &&
  syntheticSick.className.startsWith("aggravating"),
"double-mutant interaction must be measured against the multiplicative fitness null");
assert.equal(models.geneticScreen({ kind: "organism", question: "vertebrate-development" }).best,
  "zebrafish", "transparent external embryos must win the vertebrate-development fixture");

const neuronRepair = models.genomeEditing({ kind: "repair", phase: "neuron", donor: true });
const sg2Repair = models.genomeEditing({ kind: "repair", phase: "sg2", donor: true });
assert.ok(neuronRepair.hdr < 0.01 && sg2Repair.hdr > 0.3,
  "the labelled repair fixture must make template copying effectively unavailable in neurons but available in S/G2");
assert.ok(neuronRepair.nhej > neuronRepair.hdr,
  "end joining must dominate a nuclease break in the post-mitotic fixture");

assert.equal(models.genomeEditing({
  kind: "guide", mismatchPosition: 20, mismatches: 0, accessible: true, pam: false,
}).relativeCleavage, 0, "PAM absence must close the Cas9 recognition gate");
const distalMismatch = models.genomeEditing({
  kind: "guide", mismatchPosition: 5, mismatches: 1, accessible: true, pam: true,
});
const seedMismatch = models.genomeEditing({
  kind: "guide", mismatchPosition: 18, mismatches: 1, accessible: true, pam: true,
});
assert.ok(seedMismatch.relativeCleavage < distalMismatch.relativeCleavage,
  "the qualitative guide fixture must penalise PAM-proximal seed mismatch more than distal mismatch");

assert.equal(models.genomeEditing({
  kind: "editor", goal: "transition", dividing: false, bystanderFree: true,
}).editor, "base editor", "a bystander-free transition in non-dividing cells should route to a base editor");
assert.match(models.genomeEditing({
  kind: "editor", goal: "transition", dividing: false, bystanderFree: true,
}).writes, /C→T\/G→A.*A→G\/T→C/,
"the base-editor output must name supported chemical directions rather than imply one enzyme reverses every transition");
assert.equal(models.genomeEditing({
  kind: "editor", goal: "transversion", dividing: false, bystanderFree: true,
}).editor, "prime editor", "a specified transversion must not route to a conventional deaminase editor");
assert.ok(models.genomeEditing({
  kind: "editor", goal: "replacement", dividing: false, bystanderFree: true,
}).editor.startsWith("no efficient"),
"the chooser must refuse a general large-replacement promise in non-dividing cells");

const chapterOffTargets = models.genomeEditing({ kind: "offTarget", maxMismatches: 3, genomeGb: 3.1 });
assert.equal(chapterOffTargets.neighbourhood, 32551);
assert.ok(Math.abs(chapterOffTargets.expectedCandidates - 11.471922789496602) < 1e-12,
  "the random-genome NGG bound must reproduce the chapter's roughly dozen <=3-mismatch candidates");
assert.equal(models.genomeEditing({ kind: "delivery", route: "aav" }).cargoKb, 4.7,
  "the AAV teaching record must preserve the chapter's approximately 4.7 kb cargo ceiling");
assert.match(models.genomeEditing({ kind: "delivery", route: "lnp" }).cargoLabel, /formulation-dependent/,
  "the LNP teaching envelope must remain explicitly formulation-dependent rather than read as a hard vector ceiling");

const screenOutcome = models.genomeEditing({
  kind: "screen", copyNumber: 2, indelRate: 0.62, frameshiftFraction: 0.68,
});
assert.ok(Math.abs(screenOutcome.frameshiftAllele - 0.4216) < 1e-15 &&
  Math.abs(screenOutcome.independentBiallelic - 0.17774656) < 1e-15,
"62 percent indels with 68 percent frameshifts must yield about 42 percent frameshift alleles and 18 percent independent biallelic cells");
assert.ok(models.genomeEditing({
  kind: "screen", copyNumber: 20, indelRate: 0.62, frameshiftFraction: 0.68,
}).cuttingDropout > screenOutcome.cuttingDropout,
"the schematic screen fixture must increase cutting-only dropout with target copy number");

const driveStep = models.genomeEditing({
  kind: "drive", driveFrequency: 0.1, homing: 0.9, resistance: 0.05,
});
assert.ok(Math.abs(driveStep.driveNext + driveStep.resistantNext + driveStep.wildNext - 1) < 1e-15);
assert.ok(driveStep.driveNext > 0.1 && driveStep.resistantNext > 0,
  "homing must raise drive transmission while end joining creates a resistant class");

/* Parts 9–10 genomics and functional-genomics models ------------------- */

const humanLandscape = models.genomeLandscape({ kind: "composition", species: "human" });
assert.equal(humanLandscape.genomeGb, 3.1);
assert.ok(Math.abs(humanLandscape.coding + humanLandscape.repeats + humanLandscape.other - 1) < 1e-15,
  "genome-composition fractions must remain normalized");
const functionBound = models.genomeLandscape({
  kind: "functionBound", mutations: 70, deleteriousFraction: 0.2, children: 5,
});
assert.ok(Math.abs(functionBound.mutationLoadLimit - Math.log(2.5)) < 1e-15);
assert.ok(Math.abs(functionBound.functionalBound - Math.log(2.5) / 14) < 1e-15,
  "the mutation-load fixture must reproduce the chapter's 6.5 percent bound");
const highNeHazard = models.genomeLandscape({
  kind: "hazard", effectiveSize: 1e7, extraBases: 1e5, costPerBase: 1e-10,
});
const lowNeHazard = models.genomeLandscape({
  kind: "hazard", effectiveSize: 1e3, extraBases: 1e5, costPerBase: 1e-10,
});
assert.ok(highNeHazard.efficacy > 1 && lowNeHazard.efficacy < 1,
  "the same extra-DNA burden must cross the drift barrier as effective size changes");
assert.equal(models.genomeLandscape({
  kind: "repeat", repeatClass: "interspersed", readLength: 150, repeatLength: 6000,
}).uniqueAnchor, false, "a short read wholly inside a long identical repeat cannot identify its copy");
assert.equal(models.genomeLandscape({
  kind: "repeat", repeatClass: "interspersed", readLength: 7000, repeatLength: 6000,
}).uniqueAnchor, true, "a molecule longer than the repeat can reach a unique flank in the teaching fixture");
const numtFixture = models.genomeLandscape({
  kind: "heteroplasmy", mitochondrialReads: 180, numtReads: 20, alternateReads: 28,
});
assert.ok(numtFixture.observed > numtFixture.corrected,
  "NUMT-derived alternate support must inflate the naive heteroplasmy estimate");

const tenXCoverage = models.sequencer({ kind: "coverage", depth: 10, localDepth: 10, genomeBases: 3.1e9 });
assert.ok(Math.abs(tenXCoverage.uncoveredFraction - Math.exp(-10)) < 1e-18);
assert.ok(Math.abs(tenXCoverage.oneHaplotypeOnly - 2 / 1024) < 1e-15,
  "local depth 10 must leave a 2*(1/2)^10 one-haplotype-only probability");
const threePassConsensus = models.sequencer({ kind: "consensus", rawError: 0.1, passes: 3 });
assert.ok(Math.abs(threePassConsensus.consensusError - 0.028) < 1e-15,
  "three independent 10 percent-error passes must have a 2.8 percent majority error");
const somaticDilution = models.sequencer({
  kind: "somatic", tumourPurity: 0.5, cloneFraction: 0.2,
  copiesWithVariant: 0.5, depth: 126, minimumReads: 3,
});
assert.ok(Math.abs(somaticDilution.vaf - 0.05) < 1e-15 && somaticDilution.detection > 0.95,
  "the chapter's purity and clone fixture must yield 5 percent VAF and about 95 percent three-read detection at 126x");
const occupiedLibrary = models.sequencer({ kind: "duplicates", molecules: 200e6, reads: 310e6 });
assert.ok(occupiedLibrary.duplicateFraction > 0.48 && occupiedLibrary.duplicateFraction < 0.50,
  "310 million reads from 200 million molecules must reproduce about 49 percent duplicates");

const q30 = models.formatCoordinate({ kind: "phred", q: 30, offset: 33 });
assert.equal(q30.character, "?");
assert.ok(Math.abs(q30.error - 0.001) < 1e-15,
  "Q30 must encode a one-in-one-thousand error probability");
const flag163 = models.formatCoordinate({ kind: "flag", flag: 163 });
assert.deepEqual(flag163.labels, ["paired", "proper pair", "mate reverse", "second mate"],
  "SAM FLAG 163 must decode into its four set bits");
const chapterCigar = models.formatCoordinate({ kind: "cigar", cigar: "3S8M2D6M2I4M", start: 11 });
assert.equal(chapterCigar.queryLength, 23);
assert.equal(chapterCigar.referenceSpan, 20);
assert.equal(chapterCigar.end, 30,
  "the chapter CIGAR must consume 23 query bases and span chr20:11-30 inclusively");
const bedInterval = models.formatCoordinate({ kind: "coordinate", system: "bed", start: 10, end: 20 });
const gffInterval = models.formatCoordinate({ kind: "coordinate", system: "gff", start: bedInterval.targetStart, end: bedInterval.targetEnd });
assert.deepEqual([bedInterval.length, bedInterval.targetStart, bedInterval.targetEnd], [10, 11, 20]);
assert.deepEqual([gffInterval.targetStart, gffInterval.targetEnd, gffInterval.length], [10, 20, 10],
  "BED and GFF conversion must preserve the represented bases and interval length");
assert.match(models.formatCoordinate({ kind: "normalise", fixture: "homopolymer" }).operation, /left-align/);
assert.match(models.formatCoordinate({
  kind: "liftover", hasImage: true, unique: true, refMatches: false,
}).status, /reject/, "a lifted VCF REF mismatch must fail target-build validation");

const gattacaSearch = models.alignment({ kind: "bwt", text: "GATTACA", pattern: "TA" });
assert.equal(gattacaSearch.bwt.last, "ACTGA$TA");
assert.deepEqual(gattacaSearch.positions, [3]);
assert.equal(gattacaSearch.count, 1,
  "FM backward search must find TA once at zero-based position 3 in GATTACA");
const seedGuarantee = models.alignment({ kind: "seed", readLength: 150, errors: 2 });
assert.deepEqual([seedGuarantee.guaranteedSegments, seedGuarantee.guaranteedExactSeed], [3, 50],
  "a 150 bp read with at most two errors must contain one exact 50 bp segment");
const affineGap = models.alignment({
  kind: "affine", gapLength: 12, gapOpen: 6, gapExtend: 1, linearPenalty: 2,
});
assert.deepEqual([affineGap.affineCost, affineGap.linearCost, affineGap.repeatedOpenCost], [17, 24, 72],
  "affine gap cost must charge one opening plus eleven extensions");
const uniqueMapq = models.alignment({ kind: "mapq", scores: [100, 80], temperature: 4 });
const ambiguousMapq = models.alignment({ kind: "mapq", scores: [100, 100], temperature: 4 });
assert.ok(uniqueMapq.mapq > ambiguousMapq.mapq && ambiguousMapq.best === 0.5,
  "a tied placement must have lower MAPQ than a separated best score");
assert.equal(models.alignment({
  kind: "repeat", repeatLength: 6000, readLength: 150, insertSize: 450,
}).resolvable, false);
assert.equal(models.alignment({
  kind: "repeat", repeatLength: 6000, readLength: 150, insertSize: 7000,
}).resolvable, true);
assert.ok(models.alignment({
  kind: "bias", refScore: 100, altScore: 92, minimumScore: 82, temperature: 4,
}).observedAltBalance < 0.5,
"a systematic alternate-read score penalty must shift observed balance toward the reference");
assert.match(models.alignment({ kind: "failure", signature: "clips" }).diagnosis, /breakpoint/);

const decodedGene = models.annotation({
  kind: "hmm", motifEvidence: 0.7, shortEvidence: 0.6,
  longEvidence: 0.8, stayProbability: 0.4,
});
assert.deepEqual(decodedGene.path,
  ["intergenic", "exon", "exon", "intron", "exon", "intergenic"],
  "the default annotation fixture must decode a coherent exon-intron path bounded by intergenic sequence");
const weakAnnotation = models.annotation({
  kind: "evidence", abInitio: 0.5, shortRna: 0.2, longRna: 0.1, protein: 0,
});
const strongAnnotation = models.annotation({
  kind: "evidence", abInitio: 0.5, shortRna: 0.8, longRna: 0.9, protein: 0.4,
});
assert.ok(strongAnnotation.boundaryConfidence > weakAnnotation.boundaryConfidence,
  "observed transcript and protein evidence must strengthen a structural boundary call");
assert.equal(models.annotation({ kind: "transcript", transcript: "mane" }).consequence, "missense");
assert.equal(models.annotation({ kind: "transcript", transcript: "short" }).consequence, "3′ UTR");
assert.equal(models.annotation({ kind: "transcript", transcript: "retained" }).consequence, "retained-intron variant",
  "the retained-intron fixture must use the transcript-aware consequence instead of calling retained sequence simply intronic");
assert.equal(models.annotation({
  kind: "regulatory", cell: "hepatocyte", liverOpen: true, neuronOpen: false,
}).provesFunction, false, "a regulatory state label must never be promoted to proof of function");
const orthologueTransfer = models.annotation({
  kind: "homology", identity: 0.85, paralogueDistance: 0, contextMatch: 0.9,
});
const paralogueTransfer = models.annotation({
  kind: "homology", identity: 0.85, paralogueDistance: 0.8, contextMatch: 0.4,
});
assert.ok(orthologueTransfer.transferConfidence > paralogueTransfer.transferConfidence,
  "paralogy and context mismatch must attenuate homology-transfer confidence");

const fourBubbleGraph = models.pangenome({ kind: "graph", bubbles: 4, constrained: 1 });
assert.deepEqual([fourBubbleGraph.freeBubbles, fourBubbleGraph.pathCount], [3, 8],
  "one constrained choice in four independent graph bubbles must leave eight paths");
assert.ok(models.pangenome({
  kind: "bias", referenceMismatches: 1, alternateMismatches: 4,
  readLength: 100, matchScore: 2, mismatchPenalty: 4,
}).alternateMapShare < 0.5,
"extra mismatches against the represented linear path must reduce alternate-path support");
assert.match(models.pangenome({ kind: "coordinate", scheme: "projected" }).breaks, /insertions/);
const oneToManyLift = models.pangenome({
  kind: "liftover", sourceCopies: 1, targetCopies: 2, refFlip: false,
});
assert.equal(oneToManyLift.coordinateBijective, false,
  "a one-to-many assembly mapping cannot be a bijective coordinate liftover");
const alleleSwapLift = models.pangenome({
  kind: "liftover", sourceCopies: 1, targetCopies: 1, refFlip: true,
});
assert.equal(alleleSwapLift.coordinateBijective, true);
assert.equal(alleleSwapLift.allelesDirectlyPortable, false,
  "a one-to-one coordinate map can still require REF/ALT rewriting against the target reference");
assert.match(models.pangenome({
  kind: "referenceChoice", resources: 0.1, divergence: 0.9, structuralFocus: 0.9,
}).choice, /pangenome/, "high divergence and structural focus must route to a path-rich reference");

const heterozygousPosterior = models.variantCaller({
  kind: "posterior", refCount: 8, altCount: 6, quality: 30, altFrequency: 0.01,
});
assert.equal(heterozygousPosterior.genotype, "0/1");
assert.ok(heterozygousPosterior.posteriors[1] > 0.999,
  "balanced high-quality evidence must overwhelm a rare-allele prior and call a heterozygote");
const cohortPrior = models.variantCaller({
  kind: "joint", cohortAltAlleles: 12, cohortChromosomes: 2000,
  sampleAltReads: 1, sampleDepth: 3,
});
assert.ok(cohortPrior.priorFrequency > 0 && cohortPrior.priorFrequency < 0.01);
assert.equal(cohortPrior.genotype, "0/1");
assert.ok(Math.abs(cohortPrior.posteriors.reduce((total, value) => total + value, 0) - 1) < 1e-12,
  "joint genotyping must keep the cohort as a genotype prior and normalize the separate sample likelihood");
const filterFixture = models.variantCaller({
  kind: "filter", forwardAlt: 7, reverseAlt: 1,
  refCount: 12, altMapq: 35, refMapq: 60,
});
assert.ok(filterFixture.flags.includes("strand bias") && filterFixture.flags.includes("mapping-quality rank shift"),
  "one-sided low-MAPQ alternate evidence must raise strand and mapping flags");
const somaticThreshold = models.variantCaller({
  kind: "somatic", depth: 200, vaf: 0.03, errorRate: 0.001, threshold: 3,
});
assert.ok(somaticThreshold.sensitivity > somaticThreshold.falsePositive,
  "a 3 percent somatic process must pass a three-read threshold more often than a 0.1 percent error process");
assert.equal(models.variantCaller({
  kind: "callable", depth: 0, mapq: 60, included: true, referenceHasLocus: true,
}).status, "uncovered");
assert.equal(models.variantCaller({
  kind: "callable", depth: 30, mapq: 60, included: true, referenceHasLocus: false,
}).status, "not representable in this reference");

assert.equal(models.rnaSeq({
  kind: "design", assignment: ["control", "control", "treated", "treated"],
}).estimable, false, "condition perfectly nested in batch must be unidentifiable");
assert.equal(models.rnaSeq({
  kind: "design", assignment: ["control", "treated", "control", "treated"],
}).estimable, true, "condition represented in both batches must remain estimable");
const transcriptEm = models.rnaSeq({
  kind: "em", uniqueA: 60, uniqueB: 20, ambiguous: 40,
  lengthA: 1, lengthB: 1.5, iterations: 8,
});
assert.ok(Math.abs(transcriptEm.allocatedA + transcriptEm.allocatedB - 40) < 1e-12);
assert.ok(Math.abs(transcriptEm.fragmentFractionA + transcriptEm.fragmentFractionB - 1) < 1e-12);
assert.ok(Math.abs(transcriptEm.abundanceA + transcriptEm.abundanceB - 1) < 1e-12);
assert.ok(transcriptEm.allocatedA > transcriptEm.allocatedB,
  "ambiguous RNA-seq fragments must preferentially allocate to the better-supported fragment origin");
assert.ok(transcriptEm.abundanceA > transcriptEm.fragmentFractionA,
  "effective-length correction must raise the inferred molecule fraction of the shorter transcript after fragment allocation");
const compositionNormalisation = models.rnaSeq({
  kind: "normalisation", counts: [[100, 100], [100, 100], [100, 100], [100, 1000]],
});
assert.equal(compositionNormalisation.totalScale, 3.25);
assert.deepEqual(compositionNormalisation.sizeFactors, [1, 1],
  "median-ratio factors must keep three unchanged genes fixed when one transcript dominates a library");
assert.equal(models.rnaSeq({
  kind: "negativeBinomial", mean: 100, dispersion: 0.1,
}).variance, 1100, "negative-binomial variance must be mu + alpha*mu^2");
assert.equal(models.rnaSeq({
  kind: "composition", proportionA: 0.6, expressionA: 100, expressionB: 20,
}).bulk, 68);
assert.match(models.rnaSeq({ kind: "qc", signature: "rrna" }).diagnosis, /rRNA/);

const sameBulkSingleCell = models.singleCell({
  kind: "composition", proportionA: 0.6, expressionA: 100, expressionB: 25,
});
assert.equal(sameBulkSingleCell.bulk, 70);
const umiSaturation = models.singleCell({ kind: "umi", molecules: 60, reads: 180 });
assert.ok(umiSaturation.observed < 60 && umiSaturation.observed > 50,
  "UMI occupancy must saturate below the 60 original molecules as reads revisit tags");
assert.ok(Math.abs(models.singleCell({ kind: "zeros", mean: 0.1 }).zeroProbability - Math.exp(-0.1)) < 1e-15,
  "a mean of 0.1 captured molecules must yield about 90.5 percent ordinary sampling zeros");
assert.equal(models.singleCell({
  kind: "qc", minGenes: 500, cellGenes: 450, mitochondrialFraction: 0.08, maxMito: 0.15,
}).retained, false, "a fixed gene-count threshold must remove the low-RNA fixture despite acceptable mitochondrial fraction");
const donorDesign = models.singleCell({
  kind: "pseudoreplication", donors: 4, cellsPerDonor: 500, intraclass: 0.15,
});
assert.ok(donorDesign.effectiveCells < donorDesign.cells / 50,
  "within-donor correlation must collapse the nominal two-thousand-cell sample size");
const integrationFixture = models.singleCell({
  kind: "integration", batchStrength: 0.8, conditionStrength: 0.6, correction: 0.8,
});
assert.ok(integrationFixture.residualBatch < 0.8 && integrationFixture.retainedCondition < 0.6,
  "strong integration must remove both batch and some aligned condition signal");
assert.deepEqual(models.singleCell({
  kind: "spatial", cellA: [10, 2], cellB: [2, 10], proportionA: 0.5,
}).spot, [6, 6], "an equal two-cell-type spot must average the reference profiles");

const peakFixture = models.epigenome({ kind: "peak", chip: 90, control: 20, scale: 1 });
assert.equal(peakFixture.fold, 4.5);
assert.ok(peakFixture.z > 10,
  "the teaching peak must be strongly enriched relative to its matched background");
const fleetingFootprint = models.epigenome({
  kind: "footprint", occupancy: 0.8, residence: 0.1, cleavageBias: 0,
});
assert.ok(fleetingFootprint.biologicalDip < 0.1,
  "high occupancy with short residence must leave only a weak footprint");
const biasedFootprint = models.epigenome({
  kind: "footprint", occupancy: 0, residence: 0, cleavageBias: 0.4,
});
assert.equal(biasedFootprint.observedDip, 0.4,
  "enzyme sequence bias alone must be able to manufacture an apparent footprint");
const methylationFixture = models.epigenome({
  kind: "methylation", methylated: 14, unmethylated: 16, conversion: 0.98,
});
assert.ok(Math.abs(methylationFixture.beta - 14 / 30) < 1e-15);
assert.ok(methylationFixture.apparentBeta > methylationFixture.beta,
  "incomplete conversion must bias apparent methylation upward");
assert.equal(models.epigenome({
  kind: "composition", weightA: 0.5, betaA: 0.9, betaB: 0.1,
}).bulk, 0.5);
assert.match(models.epigenome({ kind: "assay", question: "transcription" }).assay, /PRO-seq/);
assert.match(models.epigenome({ kind: "causality", assay: "mpra" }).claim, /sufficient/);
assert.match(models.epigenome({ kind: "causality", assay: "crispr" }).claim, /necessary/);
assert.equal(models.epigenome({
  kind: "state", marks: { k4me3: 0.9, k4me1: 0.5, k27ac: 0.8, k36me3: 0.1, k27me3: 0.05 },
}).label, "active TSS", "the promoter-like emission fixture must receive the active-TSS human label");

/* Parts 9–10 control-space and boundary properties --------------------- */

for (const species of ["human", "onion", "pufferfish", "lungfish"]) {
  const composition = models.genomeLandscape({ kind: "composition", species });
  assert.ok(composition.coding >= 0 && composition.repeats >= 0 && composition.other >= 0);
  assert.ok(Math.abs(composition.coding + composition.repeats + composition.other - 1) < 1e-12,
    `${species} composition must remain a normalized partition`);
}
for (const mutations of [40, 70, 120]) {
  for (const deleteriousFraction of [0.05, 0.2, 0.8]) {
    for (const children of [2, 5, 12]) {
      const bound = models.genomeLandscape({ kind: "functionBound", mutations, deleteriousFraction, children });
      assert.ok(Number.isFinite(bound.functionalBound) && bound.functionalBound >= 0 && bound.functionalBound <= 1);
    }
  }
}
assert.ok(models.genomeLandscape({
  kind: "functionBound", mutations: 40, deleteriousFraction: 0.2, children: 5,
}).functionalBound > models.genomeLandscape({
  kind: "functionBound", mutations: 120, deleteriousFraction: 0.2, children: 5,
}).functionalBound, "more mutations must tighten the selected-effect upper bound");
assert.ok(models.genomeLandscape({
  kind: "hazard", effectiveSize: 1e8, extraBases: 1e5, costPerBase: 1e-10,
}).efficacy > models.genomeLandscape({
  kind: "hazard", effectiveSize: 1e2, extraBases: 1e5, costPerBase: 1e-10,
}).efficacy, "drift-barrier efficacy must rise with effective population size");

let previousBreadth = -1;
for (const depth of [0, 1, 5, 10, 30]) {
  const coverage = models.sequencer({ kind: "coverage", depth, localDepth: depth, genomeBases: 3.1e9 });
  assert.ok(coverage.breadth >= previousBreadth && coverage.breadth >= 0 && coverage.breadth <= 1);
  assert.ok(Math.abs(coverage.breadth + coverage.uncoveredFraction - 1) < 1e-12);
  previousBreadth = coverage.breadth;
}
for (const rawError of [0.005, 0.08, 0.25]) {
  let previousConsensus = Infinity;
  for (const passes of [1, 3, 5, 7, 15]) {
    const consensus = models.sequencer({ kind: "consensus", rawError, passes });
    assert.ok(consensus.consensusError <= previousConsensus + 1e-15 && consensus.consensusError >= 0 && consensus.consensusError <= 1);
    previousConsensus = consensus.consensusError;
  }
}
for (const molecules of [1, 50, 200, 1000]) {
  for (const reads of [1, 50, 310, 1000]) {
    const occupancy = models.sequencer({ kind: "duplicates", molecules, reads });
    assert.ok(occupancy.distinct >= 0 && occupancy.distinct <= Math.min(molecules, reads) + 1e-9);
    assert.ok(occupancy.duplicateFraction >= 0 && occupancy.duplicateFraction <= 1);
  }
}

let previousPhredError = Infinity;
for (let quality = 0; quality <= 50; quality += 1) {
  const decoded = models.formatCoordinate({ kind: "phred", q: quality, offset: 33 });
  assert.ok(decoded.error <= previousPhredError + 1e-15);
  assert.equal(decoded.character.charCodeAt(0), quality + 33);
  previousPhredError = decoded.error;
}
for (let start = 0; start <= 10; start += 1) {
  for (let end = start + 1; end <= 12; end += 1) {
    const bed = models.formatCoordinate({ kind: "coordinate", system: "bed", start, end });
    const gff = models.formatCoordinate({ kind: "coordinate", system: "gff", start: bed.targetStart, end: bed.targetEnd });
    assert.deepEqual([gff.targetStart, gff.targetEnd, gff.length], [start, end, end - start]);
  }
}
assert.equal(models.formatCoordinate({ kind: "coordinate", system: "gff", start: 0, end: 1 }).start, 1,
  "one-based coordinates must reject zero by clamping the teaching input to base one");

function overlappingCount(text, pattern) {
  let count = 0;
  for (let index = 0; index + pattern.length <= text.length; index += 1) {
    if (text.slice(index, index + pattern.length) === pattern) count += 1;
  }
  return count;
}
for (const pattern of ["A", "T", "TA", "ACA", "GAT", "GG", "GATTACA", "GATTACAA"]) {
  const search = models.alignment({ kind: "bwt", text: "GATTACA", pattern });
  assert.equal(search.count, overlappingCount("GATTACA", pattern), `FM search count must match naive search for ${pattern}`);
}
for (const readLength of [50, 150, 300]) {
  for (const errors of [0, 1, 2, 6]) {
    const seed = models.alignment({ kind: "seed", readLength, errors });
    assert.equal(seed.guaranteedSegments, errors + 1);
    assert.equal(seed.guaranteedExactSeed, Math.floor(readLength / (errors + 1)));
  }
}
for (const scores of [[100, 100], [100, 94, 86], [120, 30]]) {
  const mapped = models.alignment({ kind: "mapq", scores, temperature: 4 });
  assert.ok(Math.abs(mapped.probabilities.reduce((total, value) => total + value, 0) - 1) < 1e-12);
  assert.ok(Number.isFinite(mapped.mapq) && mapped.mapq >= 0);
}

for (const motifEvidence of [0, 0.5, 1]) {
  for (const shortEvidence of [0, 0.5, 1]) {
    for (const longEvidence of [0, 0.5, 1]) {
      for (const stayProbability of [0.4, 0.7, 0.9]) {
        const decoded = models.annotation({ kind: "hmm", motifEvidence, shortEvidence, longEvidence, stayProbability });
        assert.equal(decoded.path.length, 6);
        assert.ok(decoded.path.every((state) => ["intergenic", "exon", "intron"].includes(state)));
        assert.ok(Number.isFinite(decoded.logScore));
      }
    }
  }
}
for (let bubbles = 0; bubbles <= 6; bubbles += 1) {
  for (let constrained = 0; constrained <= bubbles; constrained += 1) {
    const graph = models.pangenome({ kind: "graph", bubbles, constrained });
    assert.equal(graph.pathCount, 2 ** (bubbles - constrained));
  }
}

for (const refCount of [0, 1, 10, 30]) {
  for (const altCount of [0, 1, 10, 30]) {
    for (const quality of [5, 30, 50]) {
      for (const altFrequency of [0.001, 0.1, 0.5]) {
        const posterior = models.variantCaller({ kind: "posterior", refCount, altCount, quality, altFrequency });
        assert.ok(Math.abs(posterior.posteriors.reduce((total, value) => total + value, 0) - 1) < 1e-12);
        assert.ok(posterior.posteriors.every((value) => Number.isFinite(value) && value >= 0 && value <= 1));
        assert.ok(Number.isFinite(posterior.genotypeQuality) && posterior.genotypeQuality >= 0);
      }
    }
  }
}
for (const sampleDepth of [1, 3, 12]) {
  for (let sampleAltReads = 0; sampleAltReads <= sampleDepth; sampleAltReads += 1) {
    const joint = models.variantCaller({
      kind: "joint", cohortAltAlleles: 12, cohortChromosomes: 2000, sampleAltReads, sampleDepth,
    });
    assert.ok(Math.abs(joint.posteriors.reduce((total, value) => total + value, 0) - 1) < 1e-12);
  }
}
for (const depth of [20, 200, 1000]) {
  for (const vaf of [0.001, 0.03, 0.2]) {
    const somatic = models.variantCaller({ kind: "somatic", depth, vaf, errorRate: 0.001, threshold: 3 });
    assert.ok(somatic.sensitivity >= 0 && somatic.sensitivity <= 1);
    assert.ok(somatic.falsePositive >= 0 && somatic.falsePositive <= 1);
  }
}

for (const uniqueA of [0, 20, 100]) {
  for (const uniqueB of [0, 20, 100]) {
    for (const ambiguous of [0, 40, 100]) {
      for (const iterations of [1, 8, 12]) {
        const em = models.rnaSeq({ kind: "em", uniqueA, uniqueB, ambiguous, lengthA: 1, lengthB: 1.5, iterations });
        assert.ok(Math.abs(em.allocatedA + em.allocatedB - ambiguous) < 1e-10);
        assert.ok(Math.abs(em.fragmentFractionA + em.fragmentFractionB - 1) < 1e-10);
        assert.ok(Math.abs(em.abundanceA + em.abundanceB - 1) < 1e-10);
        assert.equal(em.identifiable, uniqueA + uniqueB + ambiguous > 0);
      }
    }
  }
}
let previousZeroProbability = 1;
for (const mean of [0, 0.1, 1, 3]) {
  const zeros = models.singleCell({ kind: "zeros", mean });
  assert.ok(zeros.zeroProbability <= previousZeroProbability + 1e-15);
  assert.ok(Math.abs(zeros.zeroProbability + zeros.detectedProbability - 1) < 1e-12);
  previousZeroProbability = zeros.zeroProbability;
}
for (const molecules of [5, 60, 200]) {
  for (const reads of [0, 10, 180, 500]) {
    const umi = models.singleCell({ kind: "umi", molecules, reads });
    assert.ok(umi.observed >= 0 && umi.observed <= Math.min(molecules, reads) + 1e-9);
  }
}
for (const proportionA of [0.05, 0.25, 0.75, 0.95]) {
  for (const expressionA of [0, 100, 200]) {
    for (const expressionB of [0, 100, 200]) {
      const alternatives = models.singleCell({
        kind: "compositionAlternative", proportionA, expressionA, expressionB,
      });
      assert.ok(Math.abs(alternatives.alternativeProportion - proportionA) > 0.19);
      assert.ok(alternatives.alternativeA >= 0 && alternatives.alternativeA <= 200 + 1e-9);
      assert.ok(alternatives.alternativeB >= 0 && alternatives.alternativeB <= 200 + 1e-9);
      assert.ok(Math.abs(alternatives.current.bulk - alternatives.alternativeBulk) < 1e-10,
        "the single-cell composition lab's alternative story must preserve the bulk measurement across its full slider domain");
    }
  }
}

for (const methylated of [0, 14, 100]) {
  for (const unmethylated of [0, 16, 100]) {
    for (const conversion of [0.9, 0.98, 1]) {
      const methylation = models.epigenome({ kind: "methylation", methylated, unmethylated, conversion });
      assert.ok(Math.abs(methylation.expectedC + methylation.expectedT - methylation.depth) < 1e-10);
      assert.ok(methylation.apparentBeta >= methylation.beta - 1e-12 && methylation.apparentBeta <= 1);
    }
  }
}
for (const occupancy of [0, 0.5, 1]) {
  for (const residence of [0, 0.5, 1]) {
    for (const cleavageBias of [0, 0.4, 0.8]) {
      const footprint = models.epigenome({ kind: "footprint", occupancy, residence, cleavageBias });
      assert.ok(footprint.biologicalDip >= 0 && footprint.biologicalDip <= 1);
      assert.ok(footprint.observedDip >= footprint.biologicalDip - 1e-12 && footprint.observedDip <= 1);
      assert.ok(footprint.falseFraction >= 0 && footprint.falseFraction <= 1);
    }
  }
}

// Parts 11–12: human, statistical, clinical, applied, and societal genomics.
const recessiveProjection = models.gwas({ kind: "dosage", p: 0.05, a: 1, d: -1 });
assert.ok(Math.abs(recessiveProjection.additiveFraction - (0.10 / 1.05)) < 1e-12,
  "the additive-test power fraction for a fully recessive 5% allele must match 2p/(2p+q)");
const rawStructure = models.gwas({
  kind: "structure", w: 0.5, p1: 0.15, p2: 0.55, mu1: 0, mu2: 0.45,
  n: 50000, design: "none", capture: 0,
});
const siblingStructure = models.gwas({
  kind: "structure", w: 0.5, p1: 0.15, p2: 0.55, mu1: 0, mu2: 0.45,
  n: 50000, design: "sibling", capture: 0,
});
assert.ok(Math.abs(rawStructure.covariance - 2 * 0.5 * 0.5 * (0.15 - 0.55) * (0 - 0.45)) < 1e-12,
  "the ancestry-confounding covariance must reproduce the chapter derivation");
assert.equal(siblingStructure.bias, 0,
  "the idealised within-sibling contrast must remove shared ancestry confounding by construction");
for (const n of [1000, 10000, 100000]) {
  const result = models.gwas({
    kind: "structure", w: 0.5, p1: 0.15, p2: 0.55, mu1: 0, mu2: 0.45,
    n, design: "none", capture: 0,
  });
  assert.ok(Math.abs(result.bias - rawStructure.rawBias) < 1e-12,
    "sample size must not shrink a population-structure bias");
}
const cleanInflation = models.gwas({ kind: "inflation", n: 500000, h2: 0.4, variants: 1e6, ldScore: 100, confounding: 0 });
assert.equal(cleanInflation.intercept, 1,
  "a clean LD-score fixture must have intercept one even when polygenic signal inflates statistics");
assert.ok(cleanInflation.expectedChiSquare > 1,
  "polygenicity must raise expected chi-square with a clean intercept");
assert.ok(Math.abs(models.gwas({ kind: "threshold", effectiveTests: 1e6 }).threshold - 5e-8) < 1e-20,
  "one million effective tests must derive the canonical 5e-8 threshold");
const shrunkenWinner = models.gwas({ kind: "winner", observed: 0.12, se: 0.025, priorSd: 0.04 });
assert.ok(shrunkenWinner.posteriorMean > 0 && shrunkenWinner.posteriorMean < shrunkenWinner.observed,
  "normal-prior correction must shrink a selected discovery estimate toward zero");
const portableTag = models.gwas({ kind: "tag", r2: 0.9, targetR2: 0.3, causalEffect: 0.1 });
assert.ok(Math.abs(portableTag.markerEffect - Math.sqrt(0.9) * 0.1) < 1e-12);
assert.ok(Math.abs(portableTag.portabilityRatio - 1 / 3) < 1e-12);

const fineMap = models.mechanism({
  kind: "fineMap", z: [6, 5.9, 4], variances: [1, 1, 1], priors: [1 / 3, 1 / 3, 1 / 3], effectVariance: 1,
});
assert.ok(Math.abs(fineMap.pips.reduce((a, b) => a + b, 0) - 1) < 1e-12,
  "fine-mapping PIPs must normalise to one under the single-causal model");
assert.ok(fineMap.mass >= 0.95 && fineMap.mass <= 1 + 1e-12,
  "the credible set must be the first descending-PIP set to capture at least 95 percent mass");
assert.equal(models.mechanism({ kind: "resolution", r2: 1, varianceExplained: 0.0034, bayesFactor: 20 }).sampleSize, Infinity,
  "perfect LD must remain unresolvable at any sample size");
const resolution = models.mechanism({ kind: "resolution", r2: 0.9, varianceExplained: 0.0034, bayesFactor: 20 });
assert.ok(Math.abs(resolution.sampleSize - (2 * Math.log(20) / (0.1 * 0.0034))) < 1e-8);
const abc = models.mechanism({ kind: "abc", activities: [0.5, 0.8, 0.2], contacts: [0.4, 0.7, 0.1] });
assert.ok(Math.abs(abc.scores.reduce((a, b) => a + b, 0) - 1) < 1e-12,
  "ABC scores must normalise activity-contact products over competing elements");
assert.ok(models.mechanism({ kind: "coloc", scenario: "shared" }).conditionalShared > 0.9);
const validMr = models.mechanism({
  kind: "mr", exposureEffects: [0.04, 0.08, 0.12], outcomeEffects: [0.02, 0.04, 0.06],
});
assert.ok(Math.abs(validMr.originSlope - 0.5) < 1e-12 && Math.abs(validMr.eggerIntercept) < 1e-12,
  "proportional valid instruments must give the same half-unit IVW slope and zero Egger intercept");

const score = models.polygenic({ kind: "score", weights: [0.1, -0.2, 0.05], dosages: [2, 1, 0] });
assert.ok(Math.abs(score.score) < 1e-12,
  "the polygenic score must be the signed weighted dosage sum");
const ldOvercount = models.polygenic({ kind: "ld", tags: 20, r: 0.95, causalEffect: 0.1 });
assert.ok(Math.abs(ldOvercount.naive - 1.9) < 1e-12,
  "the one-causal-variant LD fixture must reproduce the chapter's 1.90 naive tag sum");
const prs95 = models.polygenic({ kind: "risk", prevalence: 0.05, liabilityR2: 0.10, score: 1.645 });
assert.ok(Math.abs(prs95.risk - 0.1179) < 0.0005,
  "the liability risk model must reproduce the chapter's approximately 11.79 percent 95th-percentile risk");
const prsAuc = models.polygenic({ kind: "auc", prevalence: 0.05, liabilityR2: 0.10 });
assert.ok(Math.abs(prsAuc.auc - 0.691) < 0.002,
  "the liability AUC model must reproduce the chapter table at K=5 percent and R2=10 percent");
for (const targetR of [-0.8, 0, 0.4, 0.8]) {
  const port = models.polygenic({ kind: "portability", trainR: 0.8, targetR, trainP: 0.3, targetP: 0.2 });
  assert.ok(port.signalRatio >= 0 && Number.isFinite(port.signalRatio));
  assert.equal(port.accuracyRatio, port.signalRatio,
    "the backwards-compatible portability field must remain an exact alias for the explicitly named signal proxy");
}
assert.equal(models.polygenic({
  kind: "portability", trainR: 0.8, targetR: -0.8, trainP: 0.3, targetP: 0.3,
}).direction, "reversed",
"a cross-population LD-phase flip must remain visible instead of being erased by r squared");
assert.equal(models.polygenic({
  kind: "portability", trainR: 0.8, targetR: 0, trainP: 0.3, targetP: 0.3,
}).direction, "no tagged signal",
"zero target LD must not be mislabelled as a retained or reversed score direction");

const rarePower = models.rareVariant({ kind: "power", p: 0.001, beta: 0.5 });
assert.ok(Math.abs(rarePower.sampleSize - 80080.08008008) < 1,
  "rare-variant power must reproduce approximately 80,000 samples for p=0.001 and beta=0.5");
assert.equal(models.rareVariant({ kind: "carrierFloor", carriers: 24 }).genomeWidePossible, false);
const carrier25 = models.rareVariant({ kind: "carrierFloor", carriers: 25 });
const carrier26 = models.rareVariant({ kind: "carrierFloor", carriers: 26 });
assert.equal(carrier25.genomeWidePossible, true,
  "25 all-case carriers can cross 5e-8 only for the favourable one-sided exact alternative");
assert.equal(carrier25.twoSidedGenomeWidePossible, false,
  "doubling the exact tail must keep 25 carriers above the conventional two-sided genome-wide threshold");
assert.equal(carrier26.twoSidedGenomeWidePossible, true,
  "26 all-case carriers must cross 5e-8 after the two-sided tail is included");
const rareTag = models.rareVariant({ kind: "tagging", rareFrequency: 0.001, tagFrequency: 0.30 });
assert.ok(Math.abs(rareTag.maxR2 - 0.001 * 0.7 / (0.3 * 0.999)) < 1e-15);
const frequencyFilter = models.rareVariant({ kind: "frequency", prevalence: 2e-5, penetrance: 1, heterogeneity: 0.05 });
assert.ok(Math.abs(frequencyFilter.dominant - 5e-7) < 1e-18);
assert.ok(Math.abs(frequencyFilter.recessive - 0.001) < 1e-15);
const deNovo = models.rareVariant({ kind: "deNovo", real: 70, sites: 3e9, artifactRate: 1e-6 });
assert.ok(deNovo.falseDiscoveryRate > 0.97,
  "a one-in-a-million systematic artefact across the genome must dominate naive de novo candidates");
assert.equal(models.rareVariant({ kind: "aggregate", effects: [1, -1, 1, -1], causalFraction: 1 }).burdenSignal, 0,
  "mixed equal and opposite effects must cancel in a burden statistic");
assert.ok(models.rareVariant({ kind: "aggregate", effects: [1, -1, 1, -1], causalFraction: 1 }).skatSignal > 0,
  "SKAT's squared scores must preserve mixed-direction signal");

assert.equal(models.clinical({ kind: "posterior", points: 10, prior: 0.10 }).tier, "Pathogenic");
assert.equal(models.clinical({ kind: "posterior", points: 6, prior: 0.10 }).tier, "Likely pathogenic");
assert.equal(models.clinical({ kind: "posterior", points: 0, prior: 0.10 }).tier, "Uncertain significance");
assert.equal(models.clinical({ kind: "posterior", points: -7, prior: 0.10 }).tier, "Benign");
const assayOdds = models.clinical({
  kind: "oddsPath", pathogenicControls: 20, benignControls: 20,
  abnormalPathogenic: 18, abnormalBenign: 2,
});
assert.ok(Math.abs(assayOdds.oddsPath - 9) < 1e-12,
  "90 percent sensitivity and 10 percent false-positive rate must yield OddsPath 9");
assert.equal(models.clinical({ kind: "segregation", meioses: 5 }).likelihoodRatio, 32);

const driverTrap = models.cancer({ kind: "recurrence", baseRate: 2e-6, length: 100000, samples: 1000, rateRatio: 3 });
assert.ok(Math.abs(driverTrap.expected - 200) < 1e-12);
assert.ok(Math.abs(driverTrap.observed - 600) < 1e-12);
assert.ok(Math.abs(driverTrap.z - 400 / Math.sqrt(200)) < 1e-12,
  "the local-background driver trap must reproduce the chapter's z=28.3 fixture");
const ccf = models.cancer({ kind: "ccf", purity: 0.65, vaf: 0.18, tumourCopyNumber: 2, normalCopyNumber: 2, multiplicity: 1 });
assert.ok(Math.abs(ccf.ccf - (0.18 * 2 / 0.65)) < 1e-12,
  "diploid CCF must correct VAF for tumour purity");
const beforeTreatment = models.cancer({ kind: "resistance", initialResistant: 0.01, cycles: 0, sensitiveFitness: -0.35, resistantFitness: 0.08 });
const afterTreatment = models.cancer({ kind: "resistance", initialResistant: 0.01, cycles: 20, sensitiveFitness: -0.35, resistantFitness: 0.08 });
assert.ok(Math.abs(beforeTreatment.resistantFraction - 0.01) < 1e-12);
assert.ok(afterTreatment.resistantFraction > beforeTreatment.resistantFraction,
  "treatment must select the pre-existing resistant lineage when its relative fitness is higher");
for (const mix of [0, 0.25, 0.5, 1]) {
  const signature = models.cancer({ kind: "signature", first: "age", second: "tobacco", mixture: mix });
  assert.ok(Math.abs(signature.profile.reduce((a, b) => a + b, 0) - 1) < 1e-12);
  assert.ok(signature.profile.every((value) => value >= 0));
}

const nipt = models.practice({ kind: "ppv", prevalence: 0.001, sensitivity: 0.997, specificity: 0.9996 });
assert.ok(Math.abs(nipt.ppv - 0.7141) < 0.002,
  "the NIPT fixture must yield about 71 percent PPV at one-in-one-thousand prevalence");
const forensic = models.practice({ kind: "posteriorOdds", prior: 1e-6, likelihoodRatio: 1e5 });
assert.ok(forensic.posterior > 0.09 && forensic.posterior < 0.10,
  "a large forensic LR must still be moderated by the source prior");
const composition = models.practice({ kind: "composition", aBefore: 100, bBefore: 100, aAfter: 200, bAfter: 100 });
assert.equal(composition.bBeforeShare, 0.5);
assert.ok(Math.abs(composition.bAfterShare - 1 / 3) < 1e-12,
  "an unchanged taxon must fall in relative abundance when another taxon doubles");
assert.equal(models.practice({ kind: "consumer", assayedVariants: 3, pathogenicVariants: 3000 }).missedVariants, 2997);

const uniquenessHalf = models.ethics({ kind: "uniqueness", maf: 0.5, population: 8e9 });
assert.equal(uniquenessHalf.snps, 24,
  "common variants at MAF 0.5 must need 24 independent SNPs for expected uniqueness among eight billion people");
assert.equal(models.ethics({ kind: "uniqueness", maf: 0.2, population: 8e9 }).snps, 35,
  "common variants at MAF 0.2 must need 35 independent SNPs for expected uniqueness among eight billion people");
assert.ok(uniquenessHalf.expectedOtherMatches < 1,
  "the reported independent-SNP count must put the expected number of unrelated matches below one");
for (const coverage of [0, 0.01, 0.02, 0.10]) {
  const findability = models.ethics({ kind: "findability", coverage, effectiveRelatives: 45 }).findability;
  assert.ok(findability >= 0 && findability <= 1);
}
let previousEmbryoGain = 0;
for (const embryos of [2, 3, 5, 8, 12]) {
  const gain = models.ethics({ kind: "embryo", embryos, withinFamilySd: 0.35 }).expectedGain;
  assert.ok(gain >= previousEmbryoGain - 1e-12,
    "the expected maximum score cannot decrease when more embryos are available");
  previousEmbryoGain = gain;
}

// Advanced statistics: definitions, limiting cases, and scale conversions.
const independentVariance = models.varianceRegression({
  kind: "variance", varX: 9, varY: 4, covariance: 0,
});
assert.deepEqual(independentVariance, {
  varX: 9, varY: 4, covariance: 0, covarianceBound: 6,
  crossTerm: 0, varianceSum: 13, independentSum: 13,
}, "independent variance contributions must add without adding their SDs");
const correlatedVariance = models.varianceRegression({
  kind: "variance", varX: 9, varY: 4, covariance: 3,
});
assert.equal(correlatedVariance.varianceSum, 19,
  "Var(X+Y) must retain the 2Cov(X,Y) cross-term");
assert.equal(models.varianceRegression({
  kind: "variance", varX: 9, varY: 4, covariance: 99,
}).covariance, 6, "covariance must not exceed the Cauchy-Schwarz bound");
const invertedV = models.varianceRegression({ kind: "dependence", fixture: "inverted" });
assert.equal(invertedV.correlation, 0,
  "the symmetric inverted-V fixture must be completely dependent with zero correlation");
assert.equal(invertedV.deterministic, true);
const exactRegression = models.varianceRegression({
  kind: "regression", slope: 2, noise: 0, intercept: 1,
});
assert.ok(Math.abs(exactRegression.fittedSlope - 2) < 1e-12);
assert.ok(Math.abs(exactRegression.fittedIntercept - 1) < 1e-12);
assert.equal(exactRegression.r2, 1,
  "a noiseless line must have R-squared one");
assert.equal(models.varianceRegression({
  kind: "heritability", h2: 0.6, parentZ: 2, predictor: "midparent",
}).expectedOffspringZ, 1.2);
assert.equal(models.varianceRegression({
  kind: "heritability", h2: 0.6, parentZ: 2, predictor: "single",
}).slope, 0.3, "single-parent slope must be one half of h-squared in the standard model");
assert.ok(Math.abs(models.varianceRegression({
  kind: "adjustment", betaX: 0.3, betaC: 0.8, correlationXC: 0.6,
}).marginal - 0.78) < 1e-12,
"the marginal coefficient must include the covariate-confounding component");
const rareRisk = models.varianceRegression({
  kind: "risk", baselineRisk: 0.01, exposedRisk: 0.02,
});
const commonRisk = models.varianceRegression({
  kind: "risk", baselineRisk: 0.4, exposedRisk: 0.6,
});
assert.ok(Math.abs(rareRisk.oddsRatio - rareRisk.riskRatio) < 0.03,
  "odds ratio must approximate risk ratio for rare outcomes");
assert.ok(commonRisk.oddsRatio > commonRisk.riskRatio,
  "odds ratio must pull further from one than risk ratio for common increasing risks");

const atMle = models.likelihoodBayes({ kind: "likelihood", n: 20, k: 5, p: 0.25 });
assert.equal(atMle.mle, 0.25);
assert.ok(Math.abs(atMle.relativeLikelihood - 1) < 1e-12,
  "relative likelihood must equal one at the MLE");
const awayFromMle = models.likelihoodBayes({ kind: "likelihood", n: 20, k: 5, p: 0.7 });
assert.ok(awayFromMle.relativeLikelihood < atMle.relativeLikelihood);
const boundaryMle = models.likelihoodBayes({ kind: "optimizer", n: 200, k: 0 });
assert.equal(boundaryMle.mle, 0);
assert.equal(boundaryMle.boundary, true,
  "zero observed copies must put the binomial MLE on its boundary");
assert.ok(boundaryMle.profileInterval[1] > 0,
  "a boundary MLE must retain a non-zero likelihood-based upper interval");
const lodThree = models.likelihoodBayes({
  kind: "evidence", logLikelihoodRatio: Math.log(1000),
});
assert.ok(Math.abs(lodThree.lod - 3) < 1e-12);
assert.ok(Math.abs(lodThree.likelihoodRatio - 1000) < 1e-9);
const betaUpdate = models.likelihoodBayes({
  kind: "posterior", n: 10, k: 3, priorA: 2, priorB: 6,
});
assert.deepEqual([betaUpdate.postA, betaUpdate.postB], [5, 13]);
assert.ok(Math.abs(betaUpdate.posteriorMean - 5 / 18) < 1e-12);
const sparseIntervals = models.likelihoodBayes({ kind: "interval", n: 20, k: 1 });
assert.ok(sparseIntervals.wald[0] < 0,
  "the sparse Wald fixture must expose its impossible negative lower bound");
assert.ok(sparseIntervals.wilson[0] >= 0 && sparseIntervals.credible[0] >= 0);
const modelFinderFixture = models.likelihoodBayes({
  kind: "selection", n: 17421, deltaK: 2, logLikelihoodGain: 8.088,
});
assert.equal(modelFinderFixture.aicWinner, "larger");
assert.equal(modelFinderFixture.bicWinner, "smaller");
assert.ok(Math.abs(modelFinderFixture.deltaAic + 12.176) < 1e-12);

assert.ok(models.highDimensional({
  kind: "multiplicity", m: 100, alpha: 0.05,
}).familyWiseAny > 0.99,
"one hundred null tests at 0.05 must make at least one false positive almost certain");
assert.ok(Math.abs(models.highDimensional({
  kind: "threshold", effectiveTests: 1e6,
}).threshold - 5e-8) < 1e-20,
"one million effective tests must yield the conventional GWAS threshold");
const bhFixture = models.highDimensional({
  kind: "bh", q: 0.05,
  pValues: [0.0005, 0.004, 0.009, 0.018, 0.027, 0.081, 0.19, 0.44, 0.71, 0.92],
});
assert.equal(bhFixture.rejected, 4,
  "the course BH fixture must stop at the fourth sorted p-value");
for (let index = 1; index < bhFixture.ordered.length; index += 1) {
  const previous = bhFixture.adjusted[bhFixture.ordered[index - 1].index];
  const current = bhFixture.adjusted[bhFixture.ordered[index].index];
  assert.ok(current >= previous - 1e-12,
    "BH adjusted p-values must be monotone in sorted order");
}
const cleanNullInflation = models.highDimensional({
  kind: "qq", confounding: 0, polygenic: 0,
});
assert.equal(cleanNullInflation.lambda, 1,
  "the null QQ fixture must have lambda GC one, not confuse mean chi-square one with its median");
assert.equal(cleanNullInflation.intercept, 1);
const separatedPca = models.highDimensional({ kind: "pca", separation: 2, within: 0.2 });
assert.ok(separatedPca.pc1Fraction > 0.9,
  "strong between-group separation must dominate PC1 variance in the fixture");
const pGreaterN = models.highDimensional({
  kind: "shrinkage", n: 100, p: 500, observed: 0.3, se: 0.15, priorSd: 0.08,
});
assert.equal(pGreaterN.rankCeiling, 99);
assert.equal(pGreaterN.unidentifiedDirections, 401);
assert.ok(Math.abs(pGreaterN.shrunken) < Math.abs(pGreaterN.observed));
const overdispersedCounts = models.highDimensional({
  kind: "counts", mu: 40, dispersion: 0.1,
});
assert.equal(overdispersedCounts.poissonVariance, 40);
assert.equal(overdispersedCounts.negativeBinomialVariance, 200);
const winner = models.highDimensional({
  kind: "winner", observed: 0.2, se: 0.08, priorSd: 0.06,
});
assert.ok(winner.corrected < winner.observed);
assert.ok(Math.abs(winner.squaredInflation - Math.pow(winner.observed / winner.corrected, 2)) < 1e-12,
  "squaring an inflated effect must square its inflation ratio");

// SCA12 specialisation: arithmetic plus epistemic boundaries.
assert.equal(models.neuronCerebellum({
  kind: "pacemaker", rateHz: 60, hours: 24,
}).spikesPerDay, 5_184_000,
"a 60 Hz intrinsic pacemaker must produce 5.184 million spikes per day");
assert.equal(models.neuronCerebellum({
  kind: "geometry", axonMetres: 1, transportMetresPerDay: 0.25,
}).oneWayDays, 4);
assert.equal(models.neuronCerebellum({
  kind: "circuit", perturbation: "purkinjeLoss",
}).nuclei, "disinhibited / mistimed");
assert.equal(models.neuronCerebellum({
  kind: "tremor", activation: "posture",
}).classification, "postural action tremor");

const halfSite = models.pp2a({
  kind: "occupancy", kinase: 1, phosphatase: 1, phosphataseFold: 1,
});
assert.equal(halfSite.baseline, 0.5);
assert.equal(halfSite.shifted, 0.5);
const doubledPhosphatase = models.pp2a({
  kind: "occupancy", kinase: 1, phosphatase: 1, phosphataseFold: 2,
});
assert.ok(Math.abs(doubledPhosphatase.shifted - 1 / 3) < 1e-12,
  "doubling phosphatase in the one-site model must move occupancy from one half to one third");
assert.equal(models.pp2a({ kind: "assembly", a: 2, c: 2, b: 15 }).baseCombinations, 60);
assert.equal(models.pp2a({ kind: "localisation", isoform: "b2" }).address,
  "outer mitochondrial membrane");
const competition = models.pp2a({ kind: "competition", fraction: 0.05, fold: 2 });
assert.ok(Math.abs(competition.boosted - 2 / 1.05) < 1e-12);
assert.ok(Math.abs(competition.others - 1 / 1.05) < 1e-12,
  "limiting-core model must produce a 4.76% loss across competing holoenzymes");

assert.ok(models.repeatExpansion({
  kind: "taxonomy", locus: "htt", size: 45,
}).mechanism.includes("translated polyglutamine"));
assert.ok(models.repeatExpansion({
  kind: "taxonomy", locus: "fmr1", size: 150,
}).mechanism.includes("premutation"));
assert.ok(models.repeatExpansion({
  kind: "taxonomy", locus: "fmr1", size: 220,
}).mechanism.includes("silencing"),
"FMR1 must switch mechanism above the full-mutation size convention");
const invisibleSCA12 = models.repeatExpansion({
  kind: "visibility", readLength: 150, anchorBases: 20, motifLength: 3, repeatCount: 51,
});
assert.equal(invisibleSCA12.maxSpanRepeats, 36);
assert.equal(invisibleSCA12.spans, false,
  "a 150 bp read with two 20 bp anchors cannot span a 51-CAG SCA12 allele");

assert.equal(models.sca12Mechanism({
  kind: "threshold", repeats: 31,
}).category, "agreed normal");
assert.equal(models.sca12Mechanism({
  kind: "threshold", repeats: 44,
}).category, "contested");
assert.equal(models.sca12Mechanism({
  kind: "threshold", repeats: 51,
}).category, "diagnostic convention");
assert.equal(models.sca12Mechanism({
  kind: "locus", build: "grch38",
}).geneStrand, "minus");
const inventedMatureCohort = models.sca12Mechanism({ kind: "cohort", stage: "mature" });
assert.equal(inventedMatureCohort.teachingFixture, true);
assert.ok(inventedMatureCohort.data.b1a < 0 && inventedMatureCohort.data.as1 > 0,
  "the worked cohort must preserve its maturity-dependent Bbeta1-down, AS1-up contrast");

const unaffectedThirty = models.sca12Dossier({
  kind: "risk", prior: 0.5, manifestedByAge: 0.05,
});
assert.ok(Math.abs(unaffectedThirty.posterior - 0.95 / 1.95) < 1e-12,
  "the SCA12 teaching-risk posterior must equal (1-f)/(2-f)");
assert.equal(models.sca12Dossier({
  kind: "referral", tested: 500, positive: 43,
}).referralFraction, 0.086);
assert.equal(models.sca12Dossier({
  kind: "founder", families: 20, shared: 20,
}).inference, "common ancestral expanded chromosome");
assert.ok(models.sca12Dossier({
  kind: "therapy", mechanism: "down", intervention: "senseKnockdown",
}).verdict.includes("hazard"),
"sense knockdown must reverse from plausible to hazardous when the assumed dosage direction flips");

const placement = require("./src/placement.json");
const registered = global.ReaderInteractionDefinitions;
const objectiveCoverage = global.ReaderInteractionCoverage;
const legacyRegistry = new Set([
  "strand-complement", "central-dogma", "meiosis-shuffle",
  "mutation-budget", "drift", "curriculum-map",
]);
for (const [documentId, widgets] of Object.entries(placement)) {
  if (!Array.isArray(widgets)) continue;
  for (const widget of widgets) {
    if (legacyRegistry.has(widget.id)) continue;
    assert.equal(typeof registered[widget.id], "function",
      `${documentId} places an unregistered interaction ${widget.id}`);
  }
}
const linkageTransferPlacement = placement["14-linkage-and-mapping"]
  .find((widget) => widget.id === "linkage-transfer-challenge");
assert.ok(linkageTransferPlacement,
  "Chapter 14 must place the changed-context transfer challenge after its worked example");
assert.deepEqual(linkageTransferPlacement.objectives,
  Object.keys(objectiveCoverage["linkage-transfer-challenge"]),
  "the Chapter 14 transfer placement must match its executable objective record");

const instabilityWidgets = [
  "mutation-forensics-lab", "repair-triage-lab",
  "recombination-mechanism-lab", "transposon-lifecycle-lab",
  "chromosome-workbench-lab", "microbial-genetics-lab",
];
const expectedInstabilityObjectives = [
  ...Array.from({ length: 7 }, (_, index) => `ch16-o${index + 1}`),
  ...Array.from({ length: 7 }, (_, index) => `ch17-o${index + 1}`),
  ...Array.from({ length: 7 }, (_, index) => `ch18-o${index + 1}`),
  ...Array.from({ length: 7 }, (_, index) => `ch19-o${index + 1}`),
  ...Array.from({ length: 7 }, (_, index) => `ch20-o${index + 1}`),
  ...Array.from({ length: 7 }, (_, index) => `ch20a-o${index + 1}`),
];
const coveredInstabilityObjectives = [];
for (const widgetId of instabilityWidgets) {
  assert.equal(typeof objectiveCoverage[widgetId], "object",
    `${widgetId} must publish an objective-to-active-state map`);
  const objectiveIds = Object.keys(objectiveCoverage[widgetId]);
  assert.equal(objectiveIds.length, 7,
    `${widgetId} must cover all seven stated chapter objectives`);
  for (const objectiveId of objectiveIds) {
    assert.ok(objectiveCoverage[widgetId][objectiveId].length >= 24,
      `${widgetId} ${objectiveId} needs a concrete active-state description`);
  }
  coveredInstabilityObjectives.push(...objectiveIds);
}
assert.deepEqual([...new Set(coveredInstabilityObjectives)].sort(), expectedInstabilityObjectives.sort(),
  "Part 3 coverage must contain every objective exactly once across its six Hero Labs");
assert.equal(coveredInstabilityObjectives.length, new Set(coveredInstabilityObjectives).size,
  "Part 3 objective IDs must not be duplicated across labs");

for (const [documentId, widgets] of Object.entries(placement)) {
  if (!Array.isArray(widgets)) continue;
  for (const widget of widgets) {
    if (!instabilityWidgets.includes(widget.id)) continue;
    assert.deepEqual(widget.objectives, Object.keys(objectiveCoverage[widget.id]),
      `${documentId} placement objectives must exactly match ${widget.id}'s executable coverage map`);
  }
}

const regulationWidgets = [
  "operon-circuit-lab", "enhancer-logic-lab", "epigenetic-memory-lab",
  "rna-regulation-lab", "network-dynamics-lab", "developmental-genetics-lab",
];
const expectedRegulationObjectives = [
  ...Array.from({ length: 7 }, (_, index) => `ch21-o${index + 1}`),
  ...Array.from({ length: 7 }, (_, index) => `ch22-o${index + 1}`),
  ...Array.from({ length: 7 }, (_, index) => `ch23-o${index + 1}`),
  ...Array.from({ length: 7 }, (_, index) => `ch24-o${index + 1}`),
  ...Array.from({ length: 6 }, (_, index) => `ch25-o${index + 1}`),
  ...Array.from({ length: 7 }, (_, index) => `ch25a-o${index + 1}`),
];
const expectedRegulationCounts = [7, 7, 7, 7, 6, 7];
const coveredRegulationObjectives = [];
regulationWidgets.forEach((widgetId, widgetIndex) => {
  assert.equal(typeof objectiveCoverage[widgetId], "object",
    `${widgetId} must publish an objective-to-active-state map`);
  const objectiveIds = Object.keys(objectiveCoverage[widgetId]);
  assert.equal(objectiveIds.length, expectedRegulationCounts[widgetIndex],
    `${widgetId} must cover every stated objective in its chapter`);
  for (const objectiveId of objectiveIds) {
    assert.ok(objectiveCoverage[widgetId][objectiveId].length >= 24,
      `${widgetId} ${objectiveId} needs a concrete active-state description`);
  }
  coveredRegulationObjectives.push(...objectiveIds);
});
assert.deepEqual([...new Set(coveredRegulationObjectives)].sort(), expectedRegulationObjectives.sort(),
  "Part 4 coverage must contain all 41 objectives across its six Hero Labs");
assert.equal(coveredRegulationObjectives.length, new Set(coveredRegulationObjectives).size,
  "Part 4 objective IDs must not be duplicated across labs");

for (const [documentId, widgets] of Object.entries(placement)) {
  if (!Array.isArray(widgets)) continue;
  for (const widget of widgets) {
    if (!regulationWidgets.includes(widget.id)) continue;
    assert.deepEqual(widget.objectives, Object.keys(objectiveCoverage[widget.id]),
      `${documentId} placement objectives must exactly match ${widget.id}'s executable coverage map`);
  }
}

const populationWidgets = [
  "hardy-weinberg-lab", "population-forces-lab",
  "structure-inbreeding-lab", "linkage-disequilibrium-lab",
];
const expectedPopulationObjectives = [
  ...Array.from({ length: 7 }, (_, index) => `ch26-o${index + 1}`),
  ...Array.from({ length: 7 }, (_, index) => `ch27-o${index + 1}`),
  ...Array.from({ length: 7 }, (_, index) => `ch28-o${index + 1}`),
  ...Array.from({ length: 7 }, (_, index) => `ch29-o${index + 1}`),
];
const coveredPopulationObjectives = [];
for (const widgetId of populationWidgets) {
  assert.equal(typeof objectiveCoverage[widgetId], "object",
    `${widgetId} must publish an objective-to-active-state map`);
  const objectiveIds = Object.keys(objectiveCoverage[widgetId]);
  assert.equal(objectiveIds.length, 7,
    `${widgetId} must cover all seven stated chapter objectives`);
  for (const objectiveId of objectiveIds) {
    assert.ok(objectiveCoverage[widgetId][objectiveId].length >= 24,
      `${widgetId} ${objectiveId} needs a concrete active-state description`);
  }
  coveredPopulationObjectives.push(...objectiveIds);
}
assert.deepEqual([...new Set(coveredPopulationObjectives)].sort(), expectedPopulationObjectives.sort(),
  "Part 5 coverage must contain all 28 objectives across its four Hero Labs");
assert.equal(coveredPopulationObjectives.length, new Set(coveredPopulationObjectives).size,
  "Part 5 objective IDs must not be duplicated across labs");

for (const [documentId, widgets] of Object.entries(placement)) {
  if (!Array.isArray(widgets)) continue;
  for (const widget of widgets) {
    if (!populationWidgets.includes(widget.id)) continue;
    assert.deepEqual(widget.objectives, Object.keys(objectiveCoverage[widget.id]),
      `${documentId} placement objectives must exactly match ${widget.id}'s executable coverage map`);
  }
}

const quantitativeWidgets = [
  "sampling-estimation-lab", "quantitative-traits-lab",
  "heritability-selection-lab", "qtl-mapping-lab",
];
const expectedQuantitativeObjectives = [
  ...Array.from({ length: 6 }, (_, index) => `s3-o${index + 1}`),
  ...Array.from({ length: 6 }, (_, index) => `ch30-o${index + 1}`),
  ...Array.from({ length: 7 }, (_, index) => `ch31-o${index + 1}`),
  ...Array.from({ length: 7 }, (_, index) => `ch32-o${index + 1}`),
];
const expectedQuantitativeCounts = [6, 6, 7, 7];
const coveredQuantitativeObjectives = [];
quantitativeWidgets.forEach((widgetId, widgetIndex) => {
  assert.equal(typeof objectiveCoverage[widgetId], "object",
    `${widgetId} must publish an objective-to-active-state map`);
  const objectiveIds = Object.keys(objectiveCoverage[widgetId]);
  assert.equal(objectiveIds.length, expectedQuantitativeCounts[widgetIndex],
    `${widgetId} must cover every stated objective in its chapter`);
  for (const objectiveId of objectiveIds) {
    assert.ok(objectiveCoverage[widgetId][objectiveId].length >= 24,
      `${widgetId} ${objectiveId} needs a concrete active-state description`);
  }
  coveredQuantitativeObjectives.push(...objectiveIds);
});
assert.deepEqual([...new Set(coveredQuantitativeObjectives)].sort(), expectedQuantitativeObjectives.sort(),
  "the S3 and quantitative-genetics wave must cover all 26 objectives across four Hero Labs");
assert.equal(coveredQuantitativeObjectives.length, new Set(coveredQuantitativeObjectives).size,
  "S3 and quantitative-genetics objective IDs must not be duplicated across labs");

for (const [documentId, widgets] of Object.entries(placement)) {
  if (!Array.isArray(widgets)) continue;
  for (const widget of widgets) {
    if (!quantitativeWidgets.includes(widget.id)) continue;
    assert.deepEqual(widget.objectives, Object.keys(objectiveCoverage[widget.id]),
      `${documentId} placement objectives must exactly match ${widget.id}'s executable coverage map`);
  }
}

const evolutionWidgets = [
  "hypothesis-testing-lab", "selection-inference-lab", "tree-inference-lab",
  "genome-evolution-lab", "speciation-conservation-lab",
];
const expectedEvolutionObjectives = [
  ...Array.from({ length: 6 }, (_, index) => `s4-o${index + 1}`),
  ...Array.from({ length: 7 }, (_, index) => `ch33-o${index + 1}`),
  ...Array.from({ length: 7 }, (_, index) => `ch34-o${index + 1}`),
  ...Array.from({ length: 7 }, (_, index) => `ch35-o${index + 1}`),
  ...Array.from({ length: 7 }, (_, index) => `ch35a-o${index + 1}`),
];
const expectedEvolutionCounts = [6, 7, 7, 7, 7];
const coveredEvolutionObjectives = [];
evolutionWidgets.forEach((widgetId, widgetIndex) => {
  assert.equal(typeof objectiveCoverage[widgetId], "object",
    `${widgetId} must publish an objective-to-active-state map`);
  const objectiveIds = Object.keys(objectiveCoverage[widgetId]);
  assert.equal(objectiveIds.length, expectedEvolutionCounts[widgetIndex],
    `${widgetId} must cover every stated objective in its module`);
  for (const objectiveId of objectiveIds) {
    assert.ok(objectiveCoverage[widgetId][objectiveId].length >= 24,
      `${widgetId} ${objectiveId} needs a concrete active-state description`);
  }
  coveredEvolutionObjectives.push(...objectiveIds);
});
assert.deepEqual([...new Set(coveredEvolutionObjectives)].sort(), expectedEvolutionObjectives.sort(),
  "the S4 and molecular-evolution wave must cover all 34 objectives across five Hero Labs");
assert.equal(coveredEvolutionObjectives.length, new Set(coveredEvolutionObjectives).size,
  "S4 and molecular-evolution objective IDs must not be duplicated across labs");

for (const [documentId, widgets] of Object.entries(placement)) {
  if (!Array.isArray(widgets)) continue;
  for (const widget of widgets) {
    if (!evolutionWidgets.includes(widget.id)) continue;
    assert.deepEqual(widget.objectives, Object.keys(objectiveCoverage[widget.id]),
      `${documentId} placement objectives must exactly match ${widget.id}'s executable coverage map`);
  }
}

const methodsWidgets = [
  "molecular-methods-lab", "genetic-screen-lab", "genome-editor-lab",
];
const expectedMethodsObjectives = [
  ...Array.from({ length: 7 }, (_, index) => `ch36-o${index + 1}`),
  ...Array.from({ length: 7 }, (_, index) => `ch37-o${index + 1}`),
  ...Array.from({ length: 7 }, (_, index) => `ch38-o${index + 1}`),
];
const coveredMethodsObjectives = [];
for (const widgetId of methodsWidgets) {
  assert.equal(typeof objectiveCoverage[widgetId], "object",
    `${widgetId} must publish an objective-to-active-state map`);
  const objectiveIds = Object.keys(objectiveCoverage[widgetId]);
  assert.equal(objectiveIds.length, 7,
    `${widgetId} must cover all seven stated chapter objectives`);
  for (const objectiveId of objectiveIds) {
    assert.ok(objectiveCoverage[widgetId][objectiveId].length >= 24,
      `${widgetId} ${objectiveId} needs a concrete active-state description`);
  }
  coveredMethodsObjectives.push(...objectiveIds);
}
assert.deepEqual([...new Set(coveredMethodsObjectives)].sort(), expectedMethodsObjectives.sort(),
  "Part 8 coverage must contain all 21 objectives across its three Hero Labs");
assert.equal(coveredMethodsObjectives.length, new Set(coveredMethodsObjectives).size,
  "Part 8 objective IDs must not be duplicated across labs");

for (const [documentId, widgets] of Object.entries(placement)) {
  if (!Array.isArray(widgets)) continue;
  for (const widget of widgets) {
    if (!methodsWidgets.includes(widget.id)) continue;
    assert.deepEqual(widget.objectives, Object.keys(objectiveCoverage[widget.id]),
      `${documentId} placement objectives must exactly match ${widget.id}'s executable coverage map`);
  }
}

const genomicsWidgets = [
  "genome-landscape-lab", "sequencer-simulator-lab",
  "format-coordinate-lab", "alignment-workbench-lab",
  "annotation-hmm-lab", "pangenome-path-lab",
  "variant-caller-lab", "rna-seq-lab",
  "single-cell-atlas-lab", "epigenome-assay-lab",
];
const expectedGenomicsObjectives = [
  ...Array.from({ length: 7 }, (_, index) => `ch39-o${index + 1}`),
  ...Array.from({ length: 7 }, (_, index) => `ch40-o${index + 1}`),
  ...Array.from({ length: 7 }, (_, index) => `ch41-o${index + 1}`),
  ...Array.from({ length: 7 }, (_, index) => `ch42-o${index + 1}`),
  ...Array.from({ length: 7 }, (_, index) => `ch44-o${index + 1}`),
  ...Array.from({ length: 7 }, (_, index) => `ch45-o${index + 1}`),
  ...Array.from({ length: 7 }, (_, index) => `ch46-o${index + 1}`),
  ...Array.from({ length: 7 }, (_, index) => `ch47-o${index + 1}`),
  ...Array.from({ length: 7 }, (_, index) => `ch48-o${index + 1}`),
  ...Array.from({ length: 7 }, (_, index) => `ch49-o${index + 1}`),
];
const coveredGenomicsObjectives = [];
for (const widgetId of genomicsWidgets) {
  assert.equal(typeof objectiveCoverage[widgetId], "object",
    `${widgetId} must publish an objective-to-active-state map`);
  const objectiveIds = Object.keys(objectiveCoverage[widgetId]);
  assert.equal(objectiveIds.length, 7,
    `${widgetId} must cover all seven stated chapter objectives`);
  for (const objectiveId of objectiveIds) {
    assert.ok(objectiveCoverage[widgetId][objectiveId].length >= 24,
      `${widgetId} ${objectiveId} needs a concrete active-state description`);
  }
  coveredGenomicsObjectives.push(...objectiveIds);
}
assert.deepEqual([...new Set(coveredGenomicsObjectives)].sort(), expectedGenomicsObjectives.sort(),
  "the Parts 9-10 wave must cover all 70 objectives across its ten new Hero Labs");
assert.equal(coveredGenomicsObjectives.length, new Set(coveredGenomicsObjectives).size,
  "Parts 9-10 objective IDs must not be duplicated across labs");

for (const [documentId, widgets] of Object.entries(placement)) {
  if (!Array.isArray(widgets)) continue;
  for (const widget of widgets) {
    if (!genomicsWidgets.includes(widget.id)) continue;
    assert.deepEqual(widget.objectives, Object.keys(objectiveCoverage[widget.id]),
      `${documentId} placement objectives must exactly match ${widget.id}'s executable coverage map`);
  }
}

const humanWidgets = [
  "gwas-failure-lab", "locus-mechanism-lab",
  "polygenic-score-clinic", "rare-variant-detective",
  "clinical-evidence-classifier", "cancer-evolution-lab",
  "genomics-practice-lab", "genomic-ethics-simulator",
];
const expectedHumanCounts = [7, 6, 6, 6, 7, 7, 7, 7];
const expectedHumanObjectives = [
  ...Array.from({ length: 7 }, (_, index) => `ch51-o${index + 1}`),
  ...Array.from({ length: 6 }, (_, index) => `ch52-o${index + 1}`),
  ...Array.from({ length: 6 }, (_, index) => `ch53-o${index + 1}`),
  ...Array.from({ length: 6 }, (_, index) => `ch54-o${index + 1}`),
  ...Array.from({ length: 7 }, (_, index) => `ch55-o${index + 1}`),
  ...Array.from({ length: 7 }, (_, index) => `ch56-o${index + 1}`),
  ...Array.from({ length: 7 }, (_, index) => `ch57-o${index + 1}`),
  ...Array.from({ length: 7 }, (_, index) => `ch58-o${index + 1}`),
];
const coveredHumanObjectives = [];
humanWidgets.forEach((widgetId, widgetIndex) => {
  assert.equal(typeof objectiveCoverage[widgetId], "object",
    `${widgetId} must publish an objective-to-active-state map`);
  const objectiveIds = Object.keys(objectiveCoverage[widgetId]);
  assert.equal(objectiveIds.length, expectedHumanCounts[widgetIndex],
    `${widgetId} must cover every stated objective in its chapter`);
  for (const objectiveId of objectiveIds) {
    assert.ok(objectiveCoverage[widgetId][objectiveId].length >= 24,
      `${widgetId} ${objectiveId} needs a concrete active-state description`);
  }
  coveredHumanObjectives.push(...objectiveIds);
});
assert.deepEqual([...new Set(coveredHumanObjectives)].sort(), expectedHumanObjectives.sort(),
  "the Parts 11-12 wave must cover all 53 objectives across its eight Hero Labs");
assert.equal(coveredHumanObjectives.length, new Set(coveredHumanObjectives).size,
  "Parts 11-12 objective IDs must not be duplicated across labs");

for (const [documentId, widgets] of Object.entries(placement)) {
  if (!Array.isArray(widgets)) continue;
  for (const widget of widgets) {
    if (!humanWidgets.includes(widget.id)) continue;
    assert.deepEqual(widget.objectives, Object.keys(objectiveCoverage[widget.id]),
      `${documentId} placement objectives must exactly match ${widget.id}'s executable coverage map`);
  }
}

const advancedStatisticsWidgets = [
  "regression-causality-lab", "likelihood-landscape-lab", "high-dimensional-microscope",
];
const expectedAdvancedStatisticsCounts = [7, 6, 7];
const expectedAdvancedStatisticsObjectives = [
  ...Array.from({ length: 7 }, (_, index) => `s5-o${index + 1}`),
  ...Array.from({ length: 6 }, (_, index) => `s6-o${index + 1}`),
  ...Array.from({ length: 7 }, (_, index) => `s7-o${index + 1}`),
];
const coveredAdvancedStatisticsObjectives = [];
advancedStatisticsWidgets.forEach((widgetId, widgetIndex) => {
  assert.equal(typeof objectiveCoverage[widgetId], "object",
    `${widgetId} must publish an objective-to-active-state map`);
  const objectiveIds = Object.keys(objectiveCoverage[widgetId]);
  assert.equal(objectiveIds.length, expectedAdvancedStatisticsCounts[widgetIndex],
    `${widgetId} must cover every stated statistics objective`);
  for (const objectiveId of objectiveIds) {
    assert.ok(objectiveCoverage[widgetId][objectiveId].length >= 24,
      `${widgetId} ${objectiveId} needs a concrete active-state description`);
  }
  coveredAdvancedStatisticsObjectives.push(...objectiveIds);
});
assert.deepEqual(
  [...new Set(coveredAdvancedStatisticsObjectives)].sort(),
  expectedAdvancedStatisticsObjectives.sort(),
  "S5-S7 must cover all 20 objectives across their three Hero Labs"
);
assert.equal(
  coveredAdvancedStatisticsObjectives.length,
  new Set(coveredAdvancedStatisticsObjectives).size,
  "S5-S7 objective IDs must not be duplicated across labs"
);

const sca12Widgets = [
  "neuron-cerebellum-systems-lab", "pp2a-flux-assembly-lab",
  "repeat-expansion-lab", "sca12-mechanism-board", "sca12-dossier-lab",
];
const expectedSca12Counts = [7, 6, 7, 7, 6];
const expectedSca12Objectives = [
  ...Array.from({ length: 7 }, (_, index) => `d1-o${index + 1}`),
  ...Array.from({ length: 6 }, (_, index) => `d2-o${index + 1}`),
  ...Array.from({ length: 7 }, (_, index) => `d3-o${index + 1}`),
  ...Array.from({ length: 7 }, (_, index) => `d4-o${index + 1}`),
  ...Array.from({ length: 6 }, (_, index) => `d5-o${index + 1}`),
];
const coveredSca12Objectives = [];
sca12Widgets.forEach((widgetId, widgetIndex) => {
  assert.equal(typeof objectiveCoverage[widgetId], "object",
    `${widgetId} must publish an objective-to-active-state map`);
  const objectiveIds = Object.keys(objectiveCoverage[widgetId]);
  assert.equal(objectiveIds.length, expectedSca12Counts[widgetIndex],
    `${widgetId} must cover every stated SCA12 objective`);
  for (const objectiveId of objectiveIds) {
    assert.ok(objectiveCoverage[widgetId][objectiveId].length >= 24,
      `${widgetId} ${objectiveId} needs a concrete active-state description`);
  }
  coveredSca12Objectives.push(...objectiveIds);
});
assert.deepEqual(
  [...new Set(coveredSca12Objectives)].sort(),
  expectedSca12Objectives.sort(),
  "D1-D5 must cover all 33 objectives across their five Hero Labs"
);
assert.equal(
  coveredSca12Objectives.length,
  new Set(coveredSca12Objectives).size,
  "D1-D5 objective IDs must not be duplicated across labs"
);

for (const [documentId, widgets] of Object.entries(placement)) {
  if (!Array.isArray(widgets)) continue;
  for (const widget of widgets) {
    if (!advancedStatisticsWidgets.includes(widget.id) && !sca12Widgets.includes(widget.id)) continue;
    assert.deepEqual(widget.objectives, Object.keys(objectiveCoverage[widget.id]),
      `${documentId} placement objectives must exactly match ${widget.id}'s executable coverage map`);
  }
}

// Selective changed-context portfolio. These checks defend the instructional
// contract as well as registration: three independent cases, three linked
// decisions per case, one defensible answer per decision, misconception-
// specific reveals, and an exact objective/placement match.
const expectedTransferObjectives = {
  "replication-transfer-challenge": ["ch04-o3"],
  "rna-processing-transfer-challenge": ["ch06-o3", "ch06-o5"],
  "translation-transfer-challenge": ["ch07-o1", "ch07-o7"],
  "meiosis-transfer-challenge": ["ch09-o4", "ch09-o6"],
  "genetic-inference-transfer-challenge": ["ch12-o1", "ch12-o2", "ch12-o3"],
  "pedigree-transfer-challenge": ["ch15-o2", "ch15-o4"],
  "dna-repair-transfer-challenge": ["ch17-o2", "ch17-o4", "ch17-o5"],
  "ld-transfer-challenge": ["ch29-o1", "ch29-o3", "ch29-o4"],
  "heritability-transfer-challenge": ["ch31-o5", "ch31-o7"],
  "formats-transfer-challenge": ["ch41-o2", "ch41-o3", "ch41-o4", "ch41-o5", "ch41-o7"],
  "alignment-transfer-challenge": ["ch42-o3", "ch42-o4", "ch42-o5"],
  "assembly-transfer-challenge": ["ch43-o1", "ch43-o3"],
  "variant-calling-transfer-challenge": ["ch46-o1", "ch46-o4", "ch46-o7"],
  "clinical-interpretation-transfer-challenge": ["ch55-o2", "ch55-o3", "ch55-o5", "ch55-o7"],
  "likelihood-bayes-transfer-challenge": ["s6-o1", "s6-o3", "s6-o4", "s6-o5"],
};
const transferPortfolio = models.transferPortfolio;
assert.ok(transferPortfolio, "changed-context portfolio must publish an executable audit API");
assert.deepEqual(transferPortfolio.ids(), Object.keys(expectedTransferObjectives).sort(),
  "the selective portfolio must contain exactly the fifteen approved additions");

const allPlacedTransferWidgets = Object.entries(placement).flatMap(([documentId, widgets]) =>
  (Array.isArray(widgets) ? widgets : [])
    .filter((widget) => widget.id.endsWith("-transfer-challenge"))
    .map((widget) => ({ documentId, widget }))
);
assert.equal(allPlacedTransferWidgets.length, 16,
  "the fifteen additions plus the existing Chapter 14 challenge must each be placed once");

let transferCases = 0;
let transferDecisions = 0;
for (const [widgetId, objectives] of Object.entries(expectedTransferObjectives)) {
  const audit = transferPortfolio.audit(widgetId);
  assert.deepEqual(audit.objectives, objectives,
    `${widgetId} must publish exactly its reviewed transfer objectives`);
  assert.deepEqual(Object.keys(objectiveCoverage[widgetId]), objectives,
    `${widgetId} coverage descriptions must match the audit`);
  objectives.forEach((objectiveId) => assert.ok(objectiveCoverage[widgetId][objectiveId].length >= 80,
    `${widgetId} ${objectiveId} must describe an observable learner performance`));
  assert.equal(audit.fixtures.length, 3, `${widgetId} must offer three independent cases`);
  assert.equal(new Set(audit.fixtures.map((fixture) => fixture.key)).size, 3,
    `${widgetId} case keys must be unique`);
  audit.fixtures.forEach((fixture) => {
    assert.ok(typeof fixture.ariaLabel === "string" && fixture.ariaLabel.length >= 30,
      `${widgetId}/${fixture.key} must give its scientific visual a useful non-visual description`);
    assert.equal(fixture.stepCount, 3, `${widgetId}/${fixture.key} must contain three linked decisions`);
    assert.equal(new Set(fixture.stepLabels).size, 3,
      `${widgetId}/${fixture.key} decision labels must describe three distinct moves`);
    assert.ok(fixture.prompts.every((prompt) => typeof prompt === "string" && prompt.length >= 20),
      `${widgetId}/${fixture.key} must ask a substantive question at every decision`);
    assert.ok(fixture.explanationLengths.every((length) => length >= 30),
      `${widgetId}/${fixture.key} must explain why every correct inference holds`);
    assert.ok(fixture.incorrectFeedbackLengths.every((lengths) =>
      lengths.length >= 2 && lengths.every((length) => length >= 20)),
    `${widgetId}/${fixture.key} must diagnose every incorrect alternative rather than only reject it`);
    assert.deepEqual(fixture.correctCounts, [1, 1, 1],
      `${widgetId}/${fixture.key} must have exactly one correct answer at every decision`);
    assert.ok(fixture.correctOptionIndexes.every((index, stepIndex) =>
      index >= 0 && index < fixture.optionCounts[stepIndex]),
    `${widgetId}/${fixture.key} must expose an in-range correct index for browser QA`);
    assert.ok(fixture.optionCounts.every((count) => count >= 3),
      `${widgetId}/${fixture.key} must have at least three plausible choices per decision`);
    assert.ok(fixture.reveals.every((reveal) => typeof reveal === "string" && reveal.length >= 3),
      `${widgetId}/${fixture.key} must progressively reveal meaningful evidence`);
    transferDecisions += fixture.stepCount;
  });
  transferCases += audit.fixtures.length;
  const placements = allPlacedTransferWidgets.filter(({ widget }) => widget.id === widgetId);
  assert.equal(placements.length, 1, `${widgetId} must be mounted exactly once`);
  assert.deepEqual(placements[0].widget.objectives, objectives,
    `${widgetId}'s placement must exactly match its executable coverage`);
  assert.ok(typeof placements[0].widget.after_heading === "string" && placements[0].widget.after_heading.length > 3,
    `${widgetId} must be deliberately anchored in its chapter`);
}
assert.equal(transferCases, 45, "the selective portfolio must expose forty-five changed-context cases");
assert.equal(transferDecisions, 135, "the selective portfolio must expose 135 linked decisions");

const transferFixture = (widgetId, fixtureKey) => {
  const fixture = transferPortfolio.audit(widgetId).fixtures.find((candidate) => candidate.key === fixtureKey);
  assert.ok(fixture, `${widgetId} must contain fixture ${fixtureKey}`);
  return fixture;
};

// Biology and inference checks for the exact new contexts. These deliberately
// recompute key answers through the chapter models (or an independent formula)
// instead of only trusting which option the UI marks correct.
assert.deepEqual(transferFixture("replication-transfer-challenge", "left-primase").reveals,
  ["lower template is lagging", "fragments grow right", "new lagging fragments stop initiating"]);
assert.deepEqual(transferFixture("replication-transfer-challenge", "right-ligase").reveals,
  ["upper template is lagging", "fragments grow left", "daughter strand retains nicks"]);
assert.equal(models.rnaProcessing({ kind: "nmd", stopNt: 100, lastJunctionNt: 194, stopInLastExon: false }).triggered, true,
  "a stop 94 nt before the final junction must trigger the teaching NMD rule");
assert.equal(models.rnaProcessing({ kind: "nmd", stopNt: 100, lastJunctionNt: 134, stopInLastExon: false }).triggered, false,
  "a stop 34 nt before the final junction must escape the teaching NMD rule");
assert.equal(models.rnaProcessing({ kind: "nmd", stopNt: 100, lastJunctionNt: 194, stopInLastExon: true }).triggered, false,
  "a last-exon stop must not acquire a downstream exon-junction trigger");
assert.deepEqual(transferFixture("rna-processing-transfer-challenge", "skip-nmd").reveals,
  ["the exon 2 invariant +1 donor base is broken", "Exon 1 joins exon 3; exon 4 remains downstream", "The transcript is targeted by NMD"],
  "the NMD fixture must retain a downstream exon 3–4 junction after exon 2 skipping");
assert.deepEqual(transferFixture("rna-processing-transfer-challenge", "last-exon-stop").reveals.slice(0, 2),
  ["splice signals remain intact", "Exons 1, 2, 3 and 4 remain joined in order"],
  "the last-exon fixture must preserve all four exons");

const mitochondrialFrame = models.translation({ kind: "frames", sequence: "ATATGAAGAGGG", code: "mitochondrial" });
assert.deepEqual(mitochondrialFrame.forward[0].slice(0, 3).map((codon) => codon.aa), ["M", "W", "*"],
  "vertebrate mitochondrial ATA, TGA and AGA must translate as Met, Trp and Stop");
assert.equal(models.translation({ kind: "mutation", sequence: "ATGGCTTGGTAA", frame: 0, code: "standard", mutation: "insertion", position: 4 }).effect, "frameshift",
  "one inserted base after nucleotide four must shift the downstream reading frame");
const editedInsertionFrame = models.translation({ kind: "frames", sequence: "ATGGACTTGGTAA", code: "standard" });
assert.deepEqual(editedInsertionFrame.forward[0].slice(0, 4).map((codon) => codon.aa), ["M", "D", "L", "V"],
  "the edited +A sequence must regroup to Met–Asp–Leu–Val before the incomplete trailing codon");
assert.deepEqual(transferFixture("translation-transfer-challenge", "coding-frameshift").reveals.slice(0, 2),
  ["5′–AUG GAC UUG GUA A…–3′", "Met–Asp–Leu–Val–…"],
  "the frameshift challenge must make the learner transcribe and translate the edited frame");
assert.equal(models.translation({ kind: "mutation", sequence: "ATGGAATTTTAA", frame: 0, code: "standard", mutation: "substitution", position: 3, alt: "T" }).effect, "nonsense",
  "GAA to TAA in the second codon must be classified as nonsense");

assert.deepEqual(transferFixture("meiosis-transfer-challenge", "mi").reveals.slice(0, 2), ["meiosis I", "heterodisomy"]);
assert.deepEqual(transferFixture("meiosis-transfer-challenge", "mii").reveals.slice(0, 2), ["meiosis II", "isodisomy plus two normal products"]);
assert.deepEqual(transferFixture("meiosis-transfer-challenge", "mitotic").reveals.slice(0, 2), ["post-zygotic mitosis", "mosaic lineages"]);

const chiSquare = (observed, expected) => observed.reduce((total, value, index) =>
  total + (value - expected[index]) ** 2 / expected[index], 0);
assert.ok(Math.abs(chiSquare([118, 42], [120, 40]) - 0.13333333333333333) < 1e-12);
assert.ok(Math.abs(chiSquare([70, 50, 30, 10], [90, 30, 30, 10]) - 17.77777777777778) < 1e-12);
assert.ok(Math.abs(chiSquare([64, 21, 15], [60, 25, 15]) - 0.9066666666666667) < 1e-12);
assert.deepEqual(transferFixture("genetic-inference-transfer-challenge", "fitted-parameter").reveals,
  ["df = 1", "class 2 drives the residual", "Do not reject the proposed ratio at α = 0.05"]);
assert.deepEqual(transferFixture("pedigree-transfer-challenge", "xld").reveals[2], "1/2 inherit the allele, either sex");
assert.deepEqual(transferFixture("pedigree-transfer-challenge", "ar").reveals[2], "2/3 carrier probability");

const brca2Break = models.repairTriage({ kind: "dsb", phase: "S", perturbation: "brca2Loss" });
assert.equal(brca2Break.resected, true);
assert.equal(brca2Break.rad51, false);
assert.equal(brca2Break.pathway, "failed HR / POLQ escape");
assert.deepEqual(transferFixture("dna-repair-transfer-challenge", "uv-xpc").reveals,
  ["Nucleotide excision repair", "Global-genome bulky-lesion recognition fails", "C→T at dipyrimidines"]);
assert.deepEqual(transferFixture("dna-repair-transfer-challenge", "o6mg-mgmt").reveals,
  ["Direct reversal by MGMT", "Methyl transfer cannot occur", "G:C→A:T transitions"]);

const ldStrong = models.linkageDisequilibrium({ kind: "table", AB: 45, Ab: 5, aB: 5, ab: 45 });
const ldRare = models.linkageDisequilibrium({ kind: "table", AB: 10, Ab: 0, aB: 40, ab: 50 });
const ldZero = models.linkageDisequilibrium({ kind: "table", AB: 25, Ab: 25, aB: 25, ab: 25 });
assert.ok(Math.abs(ldStrong.D - 0.2) < 1e-12 && Math.abs(ldStrong.r2 - 0.64) < 1e-12);
assert.ok(Math.abs(ldRare.dPrime - 1) < 1e-12 && Math.abs(ldRare.r2 - 1 / 9) < 1e-12 && Math.abs(ldRare.sampleFactor - 9) < 1e-12);
assert.equal(ldZero.D, 0);
assert.equal(ldZero.r2, 0);
assert.equal(ldZero.sampleFactor, Infinity);

const gardens = models.heritabilitySelection({ kind: "context", va: 20, veA: 5, veB: 80, meanA: 50, meanB: 70 });
const partition = models.heritabilitySelection({ kind: "partition", va: 20, vd: 20, vi: 0, ve: 10 });
assert.deepEqual([gardens.h2A, gardens.h2B], [0.8, 0.2]);
assert.deepEqual([partition.h2, partition.H2], [0.4, 0.8]);
assert.equal(partition.h2 * 10, 4);

const samFlag = models.formatCoordinate({ kind: "flag", flag: 99 });
const samCigar = models.formatCoordinate({ kind: "cigar", cigar: "5S10M2I5M3D4M6N8M", start: 101 });
const transferBedInterval = models.formatCoordinate({ kind: "coordinate", system: "bed", start: 99, end: 120 });
const phredQuestion = models.formatCoordinate({ kind: "phred", q: 30, offset: 33 });
const invalidLift = models.formatCoordinate({ kind: "liftover", hasImage: true, unique: true, refMatches: false });
assert.deepEqual(samFlag.labels, ["paired", "proper pair", "mate reverse", "first mate"]);
assert.deepEqual([samCigar.queryLength, samCigar.referenceSpan, samCigar.end], [34, 36, 136]);
assert.deepEqual([transferBedInterval.targetStart, transferBedInterval.targetEnd, transferBedInterval.length], [100, 120, 21]);
assert.equal(phredQuestion.character, "?");
assert.ok(Math.abs(phredQuestion.error - 0.001) < 1e-15);
assert.equal(models.formatCoordinate({ kind: "normalise", fixture: "trim" }).after, "chr2:211 A>G");
assert.equal(invalidLift.status, "reject: REF does not match target FASTA");

const equalPlacements = models.alignment({ kind: "mapq", scores: [0, 0], temperature: 1 });
const separatedPlacements = models.alignment({ kind: "mapq", scores: [45, 35], temperature: 1 });
const shortFragment = models.alignment({ kind: "repeat", repeatLength: 300, readLength: 100, insertSize: 150 });
assert.ok(Math.abs(equalPlacements.mapq - 3.010299956639812) < 1e-12);
assert.ok(separatedPlacements.best > 0.9999 && Math.abs(separatedPlacements.mapq - 43.42964535524354) < 1e-10);
assert.equal(shortFragment.resolvable, false);
assert.deepEqual(models.assembly("ATGCATG", 3).candidates, ["ATGCATG"]);

const cleanVariant = models.variantCaller({ kind: "posterior", refCount: 18, altCount: 17, quality: 35, altFrequency: 0.10 });
const biasedVariant = models.variantCaller({ kind: "filter", refCount: 30, forwardAlt: 8, reverseAlt: 0, altMapq: 20, refMapq: 60 });
const uncoveredVariant = models.variantCaller({ kind: "callable", depth: 0, mapq: 0, included: true, referenceHasLocus: true });
assert.equal(cleanVariant.genotype, "0/1");
assert.ok(Math.abs(biasedVariant.alleleBalance - 8 / 38) < 1e-12);
assert.deepEqual(biasedVariant.flags, ["strand bias", "mapping-quality rank shift"]);
assert.equal(uncoveredVariant.status, "uncovered");

assert.equal(models.clinical({ kind: "posterior", points: 1, prior: 0.10 }).tier, "Uncertain significance");
assert.equal(models.clinical({ kind: "posterior", points: 10, prior: 0.10 }).tier, "Pathogenic");
assert.equal(models.clinical({ kind: "posterior", points: -8, prior: 0.10 }).tier, "Benign");
const likelihoodEvidence = models.likelihoodBayes({ kind: "evidence", logLikelihoodRatio: Math.log(100) });
const transferBetaUpdate = models.likelihoodBayes({ kind: "posterior", n: 10, k: 8, priorA: 1, priorB: 1 });
const boundaryLikelihood = models.likelihoodBayes({ kind: "optimizer", n: 10, k: 0 });
assert.ok(Math.abs(likelihoodEvidence.lod - 2) < 1e-12);
assert.ok(Math.abs(likelihoodEvidence.deviance - 2 * Math.log(100)) < 1e-12);
assert.deepEqual([transferBetaUpdate.postA, transferBetaUpdate.postB, transferBetaUpdate.posteriorMean], [9, 3, 0.75]);
assert.equal(boundaryLikelihood.mle, 0);
assert.equal(boundaryLikelihood.boundary, true);
assert.ok(boundaryLikelihood.profileInterval[1] > 0.17 && boundaryLikelihood.profileInterval[1] < 0.18,
  "zero successes still leave positive profile-likelihood uncertainty");

console.log("PASSED — interaction model invariants");
