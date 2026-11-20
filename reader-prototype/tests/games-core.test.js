const test = require("node:test");
const assert = require("node:assert/strict");
const Core = require("../src/games-core.js");

test("DNA complement, reverse complement, duplex evaluation & steric clashes", () => {
  assert.equal(Core.complementDna("ATGCGATC"), "TACGCTAG");
  assert.equal(Core.reverseComplement("ATGCGATC"), "GATCGCAT");

  const ok = Core.evaluateDuplex("TACGGACT", "ATGCCTGA");
  assert.equal(ok.complete, true);
  assert.equal(ok.mismatches, 0);
  assert.equal(ok.gcPercent, 50);
  assert.equal(ok.hBonds, 20); // 4 AT * 2 + 4 GC * 3
  assert.equal(ok.wallaceTm, 24);

  const bad = Core.evaluateDuplex("AAAA", "AGTT");
  assert.equal(bad.complete, false);
  assert.equal(bad.mismatches, 2);
  assert.match(bad.pairs[0].note, /Purine–purine bulge/);
  assert.match(bad.pairs[1].note, /Purine–purine bulge/);

  const pinch = Core.evaluateDuplex("CC", "TT");
  assert.match(pinch.pairs[0].note, /Pyrimidine–pyrimidine pinch/);
});

test("PCR simulation catches polarity traps and computes amplicon size", () => {
  const exon = "ATGCCGTAGGCTACGTTAGCAATGCCGGTA";
  const fwd = "ATGCCG";
  const revGood = Core.reverseComplement("CCGGTA"); // TACCGG
  const res = Core.simulatePcr(exon, fwd, revGood);
  assert.equal(res.amplifies, true);
  assert.equal(res.ampliconBp, 30);

  // Classic mistake: complement without reversing
  const revNotReversed = Core.complementDna("CCGGTA"); // GGCCAT
  const trap = Core.simulatePcr(exon, fwd, revNotReversed);
  assert.equal(trap.amplifies, false);
  assert.match(trap.reason, /without reversing/);

  // Same-strand mistake
  const sameStrand = Core.simulatePcr(exon, fwd, "CCGGTA");
  assert.equal(sameStrand.amplifies, false);
  assert.match(sameStrand.reason, /both primers point right/);
});

test("Replication fork enforces 5'->3' synthesis on leading and lagging strands", () => {
  const pass = Core.evaluateReplicationFork({
    topDir: "right",
    topMode: "leading",
    bottomDir: "left",
    bottomMode: "lagging",
    laggingOrder: "far-first",
  });
  assert.equal(pass.ok, true);

  const fail = Core.evaluateReplicationFork({
    topDir: "right",
    topMode: "leading",
    bottomDir: "right",
    bottomMode: "leading",
    laggingOrder: "far-first",
  });
  assert.equal(fail.ok, false);
  assert.ok(fail.errors.length >= 2);
});

test("Ribosome translation, GU-AG splicing & mutation classification", () => {
  const tr = Core.translateMrna("CCAAUGGCUUGGAAAGAUUAAGGC");
  assert.equal(tr.startIndex, 3);
  assert.deepEqual(tr.peptide, ["Met", "Ala", "Trp", "Lys", "Asp"]);
  assert.equal(tr.stopped, true);
  assert.equal(tr.stopCodon, "UAA");

  // Wobble synonymous vs nonsense
  const wt = "AUGUACGCUUGGUAA";
  assert.equal(Core.classifyRnaMutation(wt, "AUGUAUGCUUGGUAA").kind, "synonymous");
  assert.equal(Core.classifyRnaMutation(wt, "AUGUAAGCUUGGUAA").kind, "nonsense");
  assert.equal(Core.classifyRnaMutation(wt, "AUGCACGCUUGGUAA").kind, "missense"); // Tyr -> His
  assert.equal(Core.classifyRnaMutation(wt, "AUGGCUUGGUAA").kind, "in-frame-indel");
  assert.equal(Core.classifyRnaMutation(wt, "AUGACGCUUGGUAA").kind, "frameshift");

  // Spliceosome GU..AG excision
  const pre = "AUGGCUGUAAGUGCCUUUAGUGGAAAUAA";
  const goodSplice = Core.splicePreMrna(pre, 6, 20);
  assert.equal(goodSplice.validSplice, true);
  assert.equal(goodSplice.matureMrna, "AUGGCUUGGAAAUAA");
  assert.deepEqual(Core.translateMrna(goodSplice.matureMrna).peptide, ["Met", "Ala", "Trp", "Lys"]);

  const badSplice = Core.splicePreMrna(pre, 7, 20);
  assert.equal(badSplice.validSplice, false);
});

test("Pedigree solver enforces Mendelian segregation and obligate carriers", () => {
  const ped = {
    mode: "autosomal-recessive",
    nodes: [
      { id: "I-1", sex: "M", affected: false, expected: "Aa" },
      { id: "I-2", sex: "F", affected: false, expected: "Aa" },
      { id: "II-1", sex: "F", affected: false, parents: ["I-1", "I-2"], expected: "A?" },
      { id: "II-2", sex: "M", affected: true, parents: ["I-1", "I-2"], expected: "aa" },
    ],
  };

  const valid = Core.evaluatePedigree(ped, { "I-1": "Aa", "I-2": "Aa", "II-1": "A?", "II-2": "aa" });
  assert.equal(valid.ok, true);

  const violation = Core.evaluatePedigree(ped, { "I-1": "AA", "I-2": "Aa", "II-1": "A?", "II-2": "aa" });
  assert.equal(violation.ok, false);
  assert.match(violation.summary, /Mendelian violation/);

  const overclaim = Core.evaluatePedigree(ped, { "I-1": "Aa", "I-2": "Aa", "II-1": "Aa", "II-2": "aa" });
  assert.equal(overclaim.ok, false);
  assert.match(overclaim.summary, /over-claiming/);

  // Epistasis 9:3:4 F2 ratio check
  const f2 = Core.simulateEpistasisCross("AaBb", "AaBb", 1600, 99);
  assert.ok(f2.purple > f2.white && f2.white > f2.pink);
});

test("Wright-Fisher engine models drift, selection, and overdominance", () => {
  // Strong positive selection in large N fixes reliably
  const sweep = Core.runWrightFisher({ N: 500, p0: 0.2, s: 0.25, h: 0.5, gens: 80, reps: 10, seed: 7 });
  assert.ok(sweep.meanP > 0.9);

  // Overdominance keeps polymorphism alive
  const bal = Core.runWrightFisher({ N: 400, p0: 0.5, wAA: 0.7, wAa: 1.0, waa: 0.7, gens: 60, reps: 12, seed: 11 });
  assert.equal(bal.polyCount, 12);
  assert.ok(bal.meanP > 0.35 && bal.meanP < 0.65);

  // Lethal recessive hides in heterozygotes when h=0
  const rec = Core.runWrightFisher({ N: 600, p0: 0.1, s: -1.0, h: 0.0, gens: 25, reps: 8, seed: 19 });
  assert.ok(rec.meanP > 0.01); // still persists at low frequency!
});

test("Read mapper CIGAR indels, MAPQ repeat blindspot, pileup & VCF triage", () => {
  const ref = "CGATGCTAGCTAAGCTTGCAT";
  const delRead = "CGATGCAAGCTTG"; // 6M2D7M (CT deleted at index 6..7 -> Wait: CGATGC + (TA) + GCTAAG -> let's test exact substring!)
  const delRef = "ATGCTAGCTAAGCTT";
  // ATGCTA + (GC deleted) + TAAGCTT => ATGCTATAAGCTT
  const aln = Core.alignWithDeletion(delRef, "ATGCTATAAGCTT", 0, 6, 2);
  assert.equal(aln.mismatches, 0);
  assert.equal(aln.cigar, "6M2D7M");

  const repRef = "AACGTACGTAAATTTCGTACGTCC";
  assert.equal(Core.findExactHits(repRef, "CGTACGT").mapq, 0);
  assert.equal(Core.findExactHits(repRef, "TTCGTACGTCC").mapq, 60);

  const pileup = [
    { base: "A", qual: 36, strand: "+" },
    { base: "A", qual: 34, strand: "-" },
    { base: "G", qual: 35, strand: "+" },
    { base: "G", qual: 33, strand: "-" },
    { base: "G", qual: 8, strand: "+" },
  ];
  const res = Core.analyzePileup(pileup, "A", "G", 20);
  assert.equal(res.depth, 4);
  assert.equal(res.dropped, 1);
  assert.equal(res.suggestedCall, "0/1");
  assert.equal(res.strandBias, false);
});

test("SCA12 slippage, read-span wall & 32-50 CAG gray-zone classification", () => {
  assert.equal(Core.simulateRepeatSlippage(20, "nascent", 5).finalRepeats, 25);
  assert.equal(Core.simulateRepeatSlippage(20, "template", 5).finalRepeats, 15);

  assert.equal(Core.evaluateRepeatSpan(58, 3, 150, 15).spans, false); // needs 174 + 30 = 204 bp
  assert.equal(Core.evaluateRepeatSpan(58, 3, 10000, 15).spans, true);

  assert.equal(Core.classifySca12Allele(14), "normal");
  assert.equal(Core.classifySca12Allele(31), "normal");
  assert.equal(Core.classifySca12Allele(32), "gray-zone");
  assert.equal(Core.classifySca12Allele(50), "gray-zone");
  assert.equal(Core.classifySca12Allele(51), "diagnostic");
  assert.equal(Core.classifySca12Genotype(10, 41), "gray-zone");
});

test("V2 drill generators & Hardy-Weinberg numeric counseling evaluator", () => {
  const s1 = Core.generateDnaStrand(8, 101);
  const s2 = Core.generateDnaStrand(8, 202);
  assert.equal(s1.length, 8);
  assert.notEqual(s1, Core.reverseComplement(s1));
  assert.notEqual(s1, s2);

  const mm = Core.generateMismatchDuplex(10, 3, 555);
  const ev = Core.evaluateDuplex(mm.template, mm.daughter);
  assert.equal(ev.mismatches, 3);
  assert.equal(mm.errorIndices.length, 3);

  const fs = Core.generateFrameshiftPuzzle(777);
  assert.equal(fs.wtMrna.length, 18);
  assert.equal(fs.mutantMrna.length, 17);
  assert.equal(Core.classifyRnaMutation(fs.wtMrna, fs.mutantMrna).kind, "frameshift");
  // Restoring deletedBase recovers exact WT peptide
  const fixed = fs.mutantMrna.slice(0, fs.deleteIndex) + fs.deletedBase + fs.mutantMrna.slice(fs.deleteIndex);
  assert.equal(Core.translateMrna(fixed).peptide.join("-"), fs.targetPeptide);

  const het = Core.generatePileupLocus("het-snp", 11);
  assert.equal(Core.analyzePileup(het.reads, het.ref, het.alt, 20).suggestedCall, "0/1");
  const art = Core.generatePileupLocus("artifact", 22);
  assert.equal(Core.analyzePileup(art.reads, art.ref, art.alt, 20).suggestedCall, "0/0");

  // Numeric carrier risk checks (accepts both 2q and 2pq exact)
  assert.equal(Core.evaluateCarrierRisk(10000, "0.01", "50", "300").ok, true);
  assert.equal(Core.evaluateCarrierRisk(10000, "0.01", "1/50.5", "1/303").ok, true);
  assert.equal(Core.evaluateCarrierRisk(2500, "0.02", "25", "150").ok, true);
  assert.equal(Core.evaluateCarrierRisk(10000, "0.0001", "50", "300").ok, false);
  assert.ok(Core.CODON_BY_AA.Tyr.includes("UAC") && Core.CODON_BY_AA.Tyr.includes("UAU"));
});
