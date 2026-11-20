/**
 * Pure biological simulation engines & level definitions for the
 * Genetics & Genomics Companion Lab Games.
 *
 * Zero DOM dependencies — runs directly in the browser (UMD global
 * `window.GenomicsGamesCore`) and in Node unit tests (`node --test`).
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.GenomicsGamesCore = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  /* =========================================================================
     1. DNA / REPLICATION ENGINE (Game 1: Strand & Fork)
     ========================================================================= */

  const DNA_COMPLEMENT = { A: "T", T: "A", C: "G", G: "C" };
  const PURINES = new Set(["A", "G"]);
  const PYRIMIDINES = new Set(["C", "T"]);

  function cleanDna(seq) {
    return String(seq || "").toUpperCase().replace(/[^ACGT]/g, "");
  }

  function complementDna(seq) {
    return cleanDna(seq)
      .split("")
      .map((b) => DNA_COMPLEMENT[b] || "N")
      .join("");
  }

  function reverseComplement(seq) {
    return complementDna(seq).split("").reverse().join("");
  }

  /**
   * Evaluate base-pairing between a template strand and a candidate partner
   * aligned position-for-position (already antiparallel).
   */
  function evaluateDuplex(template, partner) {
    const t = cleanDna(template);
    const p = String(partner || "").toUpperCase();
    const pairs = [];
    let matches = 0;
    let mismatches = 0;
    let empty = 0;
    let hBonds = 0;
    let gcCount = 0;

    for (let i = 0; i < t.length; i++) {
      const tb = t[i];
      const pb = p[i] && DNA_COMPLEMENT[p[i]] ? p[i] : "";
      if (!pb) {
        empty++;
        pairs.push({ index: i, template: tb, partner: "", status: "empty", bonds: 0, note: "Unpaired base" });
        continue;
      }
      if (DNA_COMPLEMENT[tb] === pb) {
        const bonds = tb === "G" || tb === "C" ? 3 : 2;
        if (bonds === 3) gcCount++;
        hBonds += bonds;
        matches++;
        pairs.push({ index: i, template: tb, partner: pb, status: "match", bonds, note: `${tb}–${pb} (${bonds} H-bonds)` });
      } else {
        mismatches++;
        let note;
        if (PURINES.has(tb) && PURINES.has(pb)) {
          note = `Purine–purine bulge (${tb}–${pb} widens helix backbone)`;
        } else if (PYRIMIDINES.has(tb) && PYRIMIDINES.has(pb)) {
          note = `Pyrimidine–pyrimidine pinch (${tb}–${pb} narrows helix)`;
        } else {
          note = `H-bond donor/acceptor clash (${tb}–${pb} wobble mismatch)`;
        }
        pairs.push({ index: i, template: tb, partner: pb, status: "mismatch", bonds: 0, note });
      }
    }

    const complete = empty === 0 && mismatches === 0 && t.length > 0;
    const gcPercent = t.length ? Math.round((gcCount / t.length) * 100) : 0;
    const wallaceTm = complete ? 2 * (matches - gcCount) + 4 * gcCount : 0;

    return { pairs, matches, mismatches, empty, hBonds, gcPercent, wallaceTm, complete };
  }

  /**
   * Simulate PCR primer binding on a double-stranded target sequence (given as
   * top 5'->3' strand). Forward primer must match the top strand 5'->3' (binding
   * the bottom template); reverse primer must match the reverse complement of a
   * downstream region on the top strand so both 3'-OH ends converge.
   */
  function simulatePcr(topStrand5to3, forwardPrimer5to3, reversePrimer5to3) {
    const top = cleanDna(topStrand5to3);
    const fwd = cleanDna(forwardPrimer5to3);
    const rev = cleanDna(reversePrimer5to3);

    const fwdIdx = fwd ? top.indexOf(fwd) : -1;
    const revTargetOnTop = rev ? reverseComplement(rev) : "";
    const revIdx = revTargetOnTop ? top.indexOf(revTargetOnTop) : -1;

    // Detect classic mistakes for helpful biological feedback.
    const fwdIsRevComp = fwd && fwdIdx === -1 && top.indexOf(reverseComplement(fwd)) !== -1;
    const revMatchesTopDirectly = rev && revIdx === -1 && top.indexOf(rev) !== -1;
    const revNotReversed = rev && revIdx === -1 && top.indexOf(complementDna(rev)) !== -1;

    if (fwdIdx === -1) {
      return {
        amplifies: false,
        ampliconBp: 0,
        fwdIdx,
        revIdx,
        reason: fwdIsRevComp
          ? "Forward primer binds the top strand pointing left — its 3′-OH faces away from the exon."
          : "Forward primer does not match the 5′→3′ top strand (cannot anneal to the bottom template).",
      };
    }
    if (revIdx === -1) {
      if (revMatchesTopDirectly) {
        return {
          amplifies: false,
          ampliconBp: 0,
          fwdIdx,
          revIdx,
          reason: "Reverse primer matches the top strand directly — both primers point right, so no exponential amplicon forms.",
        };
      }
      if (revNotReversed) {
        return {
          amplifies: false,
          ampliconBp: 0,
          fwdIdx,
          revIdx,
          reason: "Classic polarity trap: you complemented the bases without reversing 5′→3′ order, so the primer is antiparallel-inverted.",
        };
      }
      return {
        amplifies: false,
        ampliconBp: 0,
        fwdIdx,
        revIdx,
        reason: "Reverse primer does not reverse-complement any region of the target sequence.",
      };
    }
    if (revIdx < fwdIdx + fwd.length) {
      return {
        amplifies: false,
        ampliconBp: 0,
        fwdIdx,
        revIdx,
        reason: "Primers face away from each other or overlap — 3′-OH ends must converge across the target region.",
      };
    }

    const ampliconBp = revIdx + rev.length - fwdIdx;
    return {
      amplifies: true,
      ampliconBp,
      fwdIdx,
      revIdx,
      reason: `Exponential PCR amplification succeeds! Converging 3′-OH ends produce a clean ${ampliconBp} bp amplicon.`,
    };
  }

  /**
   * Evaluate leading/lagging strand assignment at a fork unwinding left->right.
   * Top template runs 3'->5' left-to-right; bottom template runs 5'->3' left-to-right.
   */
  function evaluateReplicationFork({ topDir, topMode, bottomDir, bottomMode, laggingOrder }) {
    const errors = [];
    if (topDir !== "right") {
      errors.push("Top template is 3′→5′ left-to-right, so the new strand grows 5′→3′ to the RIGHT (into the fork).");
    }
    if (topMode !== "leading") {
      errors.push("Top strand synthesizes continuously toward the unwinding helicase — that is the LEADING strand.");
    }
    if (bottomDir !== "left") {
      errors.push("Bottom template is 5′→3′ left-to-right; antiparallel 5′→3′ synthesis MUST run to the LEFT (away from the fork).");
    }
    if (bottomMode !== "lagging") {
      errors.push("Because polymerase moves away from the fork on the bottom template, synthesis restarts in Okazaki fragments (LAGGING strand).");
    }
    if (laggingOrder !== "far-first") {
      errors.push("The Okazaki fragment farthest from the fork (leftmost) was exposed and primed FIRST; newer fragments initiate closer to the moving fork.");
    }
    return {
      ok: errors.length === 0,
      errors,
      summary:
        errors.length === 0
          ? "Fork geometry verified: DNA polymerase extends strictly 5′→3′ on both arms—continuously on the leading strand and via stitched Okazaki fragments on the lagging strand."
          : errors[0],
    };
  }

  /* =========================================================================
     2. TRANSCRIPTION, SPLICING & RIBOSOME ENGINE (Game 2: Ribosome Debugger)
     ========================================================================= */

  const CODON_TABLE = {
    UUU: "Phe", UUC: "Phe", UUA: "Leu", UUG: "Leu",
    UCU: "Ser", UCC: "Ser", UCA: "Ser", UCG: "Ser",
    UAU: "Tyr", UAC: "Tyr", UAA: "STOP", UAG: "STOP",
    UGU: "Cys", UGC: "Cys", UGA: "STOP", UGG: "Trp",
    CUU: "Leu", CUC: "Leu", CUA: "Leu", CUG: "Leu",
    CCU: "Pro", CCC: "Pro", CCA: "Pro", CCG: "Pro",
    CAU: "His", CAC: "His", CAA: "Gln", CAG: "Gln",
    CGU: "Arg", CGC: "Arg", CGA: "Arg", CGG: "Arg",
    AUU: "Ile", AUC: "Ile", AUA: "Ile", AUG: "Met",
    ACU: "Thr", ACC: "Thr", ACA: "Thr", ACG: "Thr",
    AAU: "Asn", AAC: "Asn", AAA: "Lys", AAG: "Lys",
    AGU: "Ser", AGC: "Ser", AGA: "Arg", AGG: "Arg",
    GUU: "Val", GUC: "Val", GUA: "Val", GUG: "Val",
    GCU: "Ala", GCC: "Ala", GCA: "Ala", GCG: "Ala",
    GAU: "Asp", GAC: "Asp", GAA: "Glu", GAG: "Glu",
    GGU: "Gly", GGC: "Gly", GGA: "Gly", GGG: "Gly",
  };

  const AA_CLASS = {
    Met: "start",
    Phe: "hydrophobic", Leu: "hydrophobic", Ile: "hydrophobic", Val: "hydrophobic",
    Ala: "hydrophobic", Trp: "hydrophobic", Pro: "hydrophobic",
    Ser: "polar", Thr: "polar", Tyr: "polar", Asn: "polar", Gln: "polar", Cys: "polar", Gly: "polar",
    Lys: "positive", Arg: "positive", His: "positive",
    Asp: "negative", Glu: "negative",
    STOP: "stop",
  };

  function cleanRna(seq) {
    return String(seq || "").toUpperCase().replace(/T/g, "U").replace(/[^ACGU]/g, "");
  }

  function translateMrna(mrna, forcedStart = null) {
    const seq = cleanRna(mrna);
    const startIndex = forcedStart !== null ? forcedStart : seq.indexOf("AUG");
    if (startIndex < 0 || startIndex + 3 > seq.length) {
      return { startIndex: -1, codons: [], peptide: [], stopped: false, stopCodon: null };
    }
    const codons = [];
    const peptide = [];
    let stopped = false;
    let stopCodon = null;

    for (let i = startIndex; i + 3 <= seq.length; i += 3) {
      const triplet = seq.slice(i, i + 3);
      const aa = CODON_TABLE[triplet] || "???";
      codons.push({ index: i, triplet, aa, aaClass: AA_CLASS[aa] || "polar" });
      if (aa === "STOP") {
        stopped = true;
        stopCodon = triplet;
        break;
      }
      peptide.push(aa);
    }
    return { startIndex, codons, peptide, stopped, stopCodon };
  }

  function splicePreMrna(preMrna, donorStart, acceptorEnd) {
    const seq = cleanRna(preMrna);
    if (donorStart < 0 || acceptorEnd > seq.length || acceptorEnd - donorStart < 4) {
      return {
        validSplice: false,
        donor: "",
        acceptor: "",
        intron: "",
        matureMrna: seq,
        reason: "Intron must be at least 4 nucleotides long with donor before acceptor.",
      };
    }
    const donor = seq.slice(donorStart, donorStart + 2);
    const acceptor = seq.slice(acceptorEnd - 2, acceptorEnd);
    const validSplice = donor === "GU" && acceptor === "AG";
    const intron = seq.slice(donorStart, acceptorEnd);
    const matureMrna = validSplice ? seq.slice(0, donorStart) + seq.slice(acceptorEnd) : seq;
    let reason = "Canonical GU–AG intron excised cleanly.";
    if (!validSplice) {
      reason = `Spliceosome rejected sites (${donor}…${acceptor}): canonical U2 introns begin with 5′ GU and end with 3′ AG.`;
    }
    return { validSplice, donor, acceptor, intron, matureMrna, reason };
  }

  function classifyRnaMutation(wtMrna, mutMrna) {
    const wt = cleanRna(wtMrna);
    const mut = cleanRna(mutMrna);
    if (wt === mut) return { kind: "unchanged", detail: "Sequence identical to wild-type." };

    const wtTr = translateMrna(wt);
    const mutTr = translateMrna(mut);

    if (wtTr.startIndex !== -1 && mutTr.startIndex === -1) {
      return { kind: "start-loss", detail: "Start codon (AUG) destroyed — ribosome cannot initiate." };
    }
    if ((mut.length - wt.length) % 3 !== 0) {
      return { kind: "frameshift", detail: "Non-multiple-of-3 indel shifted the downstream reading frame." };
    }
    if (mut.length !== wt.length) {
      const diffCodons = Math.abs(mut.length - wt.length) / 3;
      const op = mut.length > wt.length ? "insertion" : "deletion";
      return {
        kind: "in-frame-indel",
        detail: `In-frame ${op} of ${diffCodons} codon(s) preserves the reading frame while changing length.`,
      };
    }
    if (mutTr.stopped && wtTr.stopped && mutTr.peptide.length < wtTr.peptide.length) {
      return {
        kind: "nonsense",
        detail: `Premature ${mutTr.stopCodon} stop codon truncated the peptide from ${wtTr.peptide.length} to ${mutTr.peptide.length} aa.`,
      };
    }
    if (!mutTr.stopped && wtTr.stopped) {
      return { kind: "readthrough", detail: "Stop codon lost — ribosome reads past the normal terminus." };
    }
    if (wtTr.peptide.join("-") === mutTr.peptide.join("-")) {
      return { kind: "synonymous", detail: "Different codon, identical amino acid sequence (genetic code degeneracy)." };
    }
    const diffAt = wtTr.peptide.findIndex((aa, idx) => mutTr.peptide[idx] !== aa);
    return {
      kind: "missense",
      detail: `Amino acid substitution at residue ${diffAt + 1}: ${wtTr.peptide[diffAt] || "?"} → ${mutTr.peptide[diffAt] || "?"}.`,
    };
  }

  /* =========================================================================
     3. MENDELIAN & PEDIGREE ENGINE (Game 3: Mendel's Pedigree Lab)
     ========================================================================= */

  function makeRng(seed) {
    let a = (seed >>> 0) || 123456789;
    return function next() {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function autosomalGametes(geno) {
    if (!geno || geno.length !== 2) return [];
    if (geno[1] === "?") return [geno[0], geno[0].toLowerCase()];
    return [geno[0], geno[1]];
  }

  function possibleAutosomalChildren(g1, g2) {
    const sets1 = g1 === "A?" ? [["A", "A"], ["A", "a"]] : [autosomalGametes(g1)];
    const sets2 = g2 === "A?" ? [["A", "A"], ["A", "a"]] : [autosomalGametes(g2)];
    const out = new Set();
    for (const s1 of sets1) {
      for (const s2 of sets2) {
        for (const a1 of s1) {
          for (const a2 of s2) {
            const pair = [a1, a2].sort().join("");
            out.add(pair);
            if (pair === "AA" || pair === "Aa") out.add("A?");
          }
        }
      }
    }
    return out;
  }

  function possibleXLinkedChildren(mom, dad, childSex) {
    const momOpts = mom === "XAX?" ? [["XA", "XA"], ["XA", "Xa"]] :
      mom === "XAXA" ? [["XA", "XA"]] :
      mom === "XAXa" ? [["XA", "Xa"]] :
      mom === "XaXa" ? [["Xa", "Xa"]] : [];
    const dadX = dad === "XAY" ? "XA" : dad === "XaY" ? "Xa" : null;
    const out = new Set();
    if (!dadX) return out;

    for (const mAlleles of momOpts) {
      for (const mx of mAlleles) {
        if (childSex === "M") {
          out.add(mx + "Y");
        } else {
          const pair = mx === "XA" && dadX === "XA" ? "XAXA" :
            mx === "Xa" && dadX === "Xa" ? "XaXa" : "XAXa";
          out.add(pair);
          if (pair === "XAXA" || pair === "XAXa") out.add("XAX?");
        }
      }
    }
    return out;
  }

  /**
   * Validate a user's genotype assignments on a pedigree against:
   *  (1) phenotype consistency (recessive disease),
   *  (2) Mendelian parent->child segregation on every trio,
   *  (3) exact forced vs genuinely uncertain (A? / XAX?) precision.
   */
  function evaluatePedigree(pedigree, assignments) {
    const issues = [];
    const byId = Object.fromEntries(pedigree.nodes.map((n) => [n.id, n]));

    // 1. Completeness & phenotype match
    for (const node of pedigree.nodes) {
      const g = assignments[node.id];
      if (!g) {
        issues.push({ nodeId: node.id, message: `${node.id} still needs a genotype assignment.` });
        continue;
      }
      if (pedigree.mode === "autosomal-recessive") {
        if (node.affected && g !== "aa") {
          issues.push({ nodeId: node.id, message: `${node.id} is affected (recessive), so their genotype must be aa.` });
        } else if (!node.affected && g === "aa") {
          issues.push({ nodeId: node.id, message: `${node.id} is unaffected, so they cannot be aa.` });
        }
      } else if (pedigree.mode === "x-linked-recessive") {
        if (node.sex === "M") {
          if (node.affected && g !== "XaY") {
            issues.push({ nodeId: node.id, message: `Affected male ${node.id} must be XᵃY.` });
          } else if (!node.affected && g !== "XAY") {
            issues.push({ nodeId: node.id, message: `Unaffected male ${node.id} must be XᴬY (males are hemizygous).` });
          }
        } else {
          if (node.affected && g !== "XaXa") {
            issues.push({ nodeId: node.id, message: `Affected female ${node.id} must be XᵃXᵃ.` });
          } else if (!node.affected && g === "XaXa") {
            issues.push({ nodeId: node.id, message: `Unaffected female ${node.id} cannot be XᵃXᵃ.` });
          }
        }
      }
    }

    if (issues.length > 0) {
      return { ok: false, issues, summary: issues[0].message };
    }

    // 2. Mendelian transmission on every parent->child trio
    for (const node of pedigree.nodes) {
      if (!node.parents) continue;
      const [p1Id, p2Id] = node.parents;
      const g1 = assignments[p1Id];
      const g2 = assignments[p2Id];
      const gc = assignments[node.id];

      if (pedigree.mode === "autosomal-recessive") {
        const allowed = possibleAutosomalChildren(g1, g2);
        if (!allowed.has(gc)) {
          issues.push({
            nodeId: node.id,
            message: `Mendelian violation: ${p1Id} (${g1}) × ${p2Id} (${g2}) cannot produce ${node.id} (${gc}).`,
          });
        }
      } else {
        const momId = byId[p1Id].sex === "F" ? p1Id : p2Id;
        const dadId = byId[p1Id].sex === "M" ? p1Id : p2Id;
        const allowed = possibleXLinkedChildren(assignments[momId], assignments[dadId], node.sex);
        if (!allowed.has(gc)) {
          issues.push({
            nodeId: node.id,
            message: `X-linked violation: mother ${momId} (${assignments[momId]}) × father ${dadId} (${assignments[dadId]}) cannot produce ${node.id} (${gc}).`,
          });
        }
      }
    }

    if (issues.length > 0) {
      return { ok: false, issues, summary: issues[0].message };
    }

    // 3. Exact deduction precision (don't leave forced carriers as A?, don't over-claim uncertain ones)
    for (const node of pedigree.nodes) {
      const expected = node.expected;
      const g = assignments[node.id];
      if (g !== expected) {
        const isUnder = (expected === "Aa" && g === "A?") || (expected === "XAXa" && g === "XAX?");
        const isOver = (expected === "A?" && (g === "AA" || g === "Aa")) || (expected === "XAX?" && (g === "XAXA" || g === "XAXa"));
        let msg = `${node.id}: check whether this genotype is forced or genuinely uncertain.`;
        if (isUnder) {
          msg = `${node.id} is an OBLIGATE carrier (${expected}) — their family links force them to carry the recessive allele, not ${g}.`;
        } else if (isOver) {
          msg = `${node.id} cannot be pinned down to ${g} from phenotype alone — mark them ${expected} to avoid over-claiming.`;
        }
        issues.push({ nodeId: node.id, message: msg });
      }
    }

    return {
      ok: issues.length === 0,
      issues,
      summary:
        issues.length === 0
          ? "Every Mendelian edge checks out, and you cleanly separated obligate carriers from uncertain genotypes."
          : issues[0].message,
    };
  }

  /**
   * Simulate single-locus Mendelian cross (e.g. test cross P? x pp).
   */
  function simulateMonoCross(parent1, parent2, n = 40, seed = 42) {
    const rng = makeRng(seed);
    const g1 = autosomalGametes(parent1);
    const g2 = autosomalGametes(parent2);
    const counts = { purple: 0, white: 0, AA: 0, Aa: 0, aa: 0 };
    for (let i = 0; i < n; i++) {
      const a1 = g1[rng() < 0.5 ? 0 : 1];
      const a2 = g2[rng() < 0.5 ? 0 : 1];
      const geno = [a1, a2].sort().join("");
      counts[geno]++;
      if (geno === "aa") counts.white++;
      else counts.purple++;
    }
    return counts;
  }

  /**
   * Simulate 2-gene recessive epistasis:
   * Precursor --[Gene A]--> Pink --[Gene B]--> Purple
   * aa__ => white (4/16 in F2), A_bb => pink (3/16), A_B_ => purple (9/16).
   */
  function simulateEpistasisCross(p1, p2, n = 320, seed = 77) {
    const rng = makeRng(seed);
    const split2 = (g) => [autosomalGametes(g.slice(0, 2)), autosomalGametes(g.slice(2, 4))];
    const [p1A, p1B] = split2(p1);
    const [p2A, p2B] = split2(p2);
    const counts = { purple: 0, pink: 0, white: 0 };

    for (let i = 0; i < n; i++) {
      const a1 = p1A[rng() < 0.5 ? 0 : 1];
      const a2 = p2A[rng() < 0.5 ? 0 : 1];
      const b1 = p1B[rng() < 0.5 ? 0 : 1];
      const b2 = p2B[rng() < 0.5 ? 0 : 1];
      const hasA = a1 === "A" || a2 === "A";
      const hasB = b1 === "B" || b2 === "B";
      if (!hasA) counts.white++;
      else if (!hasB) counts.pink++;
      else counts.purple++;
    }
    return counts;
  }

  /* =========================================================================
     4. WRIGHT-FISHER POPULATION GENETICS ENGINE (Game 4: Drift & Selection)
     ========================================================================= */

  function sampleBinomial(n, p, rng) {
    if (p <= 0) return 0;
    if (p >= 1) return n;
    // Exact Bernoulli sum for moderate n, normal approximation for large n > 400
    if (n <= 400) {
      let k = 0;
      for (let i = 0; i < n; i++) {
        if (rng() < p) k++;
      }
      return k;
    }
    // Box-Muller normal approximation with continuity clamping
    const u1 = Math.max(1e-12, rng());
    const u2 = rng();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    const mean = n * p;
    const sd = Math.sqrt(n * p * (1 - p));
    return Math.max(0, Math.min(n, Math.round(mean + z * sd)));
  }

  /**
   * Run Wright-Fisher diploid population genetics simulation across multiple replicates.
   * Focal allele A starts at p0; genotype fitnesses are wAA, wAa, waa.
   */
  function runWrightFisher(opts) {
    const N = Math.max(2, Math.round(opts.N ?? 50));
    const p0 = Math.max(0, Math.min(1, opts.p0 ?? 0.2));
    const gens = Math.max(1, Math.round(opts.gens ?? 60));
    const reps = Math.max(1, Math.round(opts.reps ?? 12));
    const m = Math.max(0, Math.min(0.5, opts.m ?? 0));
    const pMig = opts.pMig ?? 0.5;
    const bottleneckGen = opts.bottleneckGen ?? -1;
    const bottleneckN = opts.bottleneckN ?? N;
    const bottleneckLen = opts.bottleneckLen ?? 5;

    // Fitnesses can be supplied explicitly or derived from (s, h)
    let wAA, wAa, waa;
    if (opts.wAA !== undefined && opts.wAa !== undefined && opts.waa !== undefined) {
      wAA = opts.wAA;
      wAa = opts.wAa;
      waa = opts.waa;
    } else {
      const s = opts.s ?? 0;
      const h = opts.h ?? 0.5;
      wAA = Math.max(0, 1 + s);
      wAa = Math.max(0, 1 + h * s);
      waa = 1;
    }

    const rng = makeRng(opts.seed ?? 1337);
    const trajectories = [];

    for (let r = 0; r < reps; r++) {
      const traj = [p0];
      let p = p0;
      for (let g = 1; g <= gens; g++) {
        const q = 1 - p;
        // 1. Diploid viability selection
        const wBar = p * p * wAA + 2 * p * q * wAa + q * q * waa;
        let pSel = wBar > 0 ? (p * p * wAA + p * q * wAa) / wBar : p;
        // 2. Mainland-island migration
        if (m > 0) {
          pSel = (1 - m) * pSel + m * pMig;
        }
        // 3. Genetic drift (binomial sampling of 2 * Ne alleles)
        const inBottleneck = bottleneckGen >= 0 && g >= bottleneckGen && g < bottleneckGen + bottleneckLen;
        const nCurr = inBottleneck ? bottleneckN : N;
        const k = sampleBinomial(2 * nCurr, pSel, rng);
        p = k / (2 * nCurr);
        traj.push(p);
      }
      trajectories.push(traj);
    }

    const finals = trajectories.map((t) => t[t.length - 1]);
    const fixedCount = finals.filter((p) => p >= 0.9999).length;
    const lostCount = finals.filter((p) => p <= 0.0001).length;
    const polyCount = reps - fixedCount - lostCount;
    const meanP = finals.reduce((acc, v) => acc + v, 0) / reps;
    const meanHe = finals.reduce((acc, v) => acc + 2 * v * (1 - v), 0) / reps;

    return { trajectories, finals, fixedCount, lostCount, polyCount, meanP, meanHe };
  }

  /* =========================================================================
     5. READ ALIGNMENT & VARIANT CALLING ENGINE (Game 5: Read Mapper)
     ========================================================================= */

  function alignUngapped(ref, read, pos) {
    const r = cleanDna(ref);
    const q = cleanDna(read);
    const clamped = Math.max(0, Math.min(r.length - q.length, pos));
    const cols = [];
    let mismatches = 0;
    for (let i = 0; i < q.length; i++) {
      const rb = r[clamped + i];
      const qb = q[i];
      const match = rb === qb;
      if (!match) mismatches++;
      cols.push({ refPos: clamped + i, refBase: rb, readBase: qb, match });
    }
    const score = (q.length - mismatches) * 2 - mismatches * 4;
    return { pos: clamped, cols, mismatches, score, cigar: `${q.length}M` };
  }

  /**
   * Align a read against ref starting at `pos`, optionally opening a deletion of
   * `delLen` reference bases after `delOffset` read bases.
   */
  function alignWithDeletion(ref, read, pos, delOffset, delLen) {
    const r = cleanDna(ref);
    const q = cleanDna(read);
    if (delLen <= 0 || delOffset <= 0 || delOffset >= q.length) {
      return alignUngapped(r, q, pos);
    }
    const span = q.length + delLen;
    const clamped = Math.max(0, Math.min(r.length - span, pos));
    const cols = [];
    let mismatches = 0;
    let ri = clamped;
    for (let qi = 0; qi < q.length; qi++) {
      if (qi === delOffset) {
        for (let d = 0; d < delLen; d++) {
          cols.push({ refPos: ri, refBase: r[ri], readBase: "-", match: false, isDel: true });
          ri++;
        }
      }
      const rb = r[ri];
      const qb = q[qi];
      const match = rb === qb;
      if (!match) mismatches++;
      cols.push({ refPos: ri, refBase: rb, readBase: qb, match, isDel: false });
      ri++;
    }
    const gapPenalty = 5 + delLen;
    const score = (q.length - mismatches) * 2 - mismatches * 4 - gapPenalty;
    const rightLen = q.length - delOffset;
    return { pos: clamped, cols, mismatches, score, cigar: `${delOffset}M${delLen}D${rightLen}M` };
  }

  function findExactHits(ref, read) {
    const r = cleanDna(ref);
    const q = cleanDna(read);
    const hits = [];
    let idx = r.indexOf(q);
    while (idx !== -1) {
      hits.push(idx);
      idx = r.indexOf(q, idx + 1);
    }
    const mapq = hits.length === 1 ? 60 : 0;
    return { hits, mapq };
  }

  function phredErrorProb(q) {
    return Math.pow(10, -q / 10);
  }

  /**
   * Summarize a sequencing pileup column after filtering bases below minQ.
   */
  function analyzePileup(reads, refBase, altBase, minQ = 0) {
    const kept = reads.filter((r) => r.qual >= minQ);
    let refCount = 0;
    let altCount = 0;
    let fwdAlt = 0;
    let revAlt = 0;
    let otherCount = 0;

    for (const r of kept) {
      if (r.base === refBase) refCount++;
      else if (r.base === altBase) {
        altCount++;
        if (r.strand === "+") fwdAlt++;
        else revAlt++;
      } else {
        otherCount++;
      }
    }
    const depth = kept.length;
    const altFreq = depth ? altCount / depth : 0;
    const strandBias = altCount >= 3 && (fwdAlt === 0 || revAlt === 0);

    let suggestedCall = "0/0";
    if (!strandBias && altCount >= 2) {
      if (altFreq >= 0.8) suggestedCall = "1/1";
      else if (altFreq >= 0.25) suggestedCall = "0/1";
    }

    return {
      depth,
      dropped: reads.length - depth,
      refCount,
      altCount,
      otherCount,
      altFreq,
      fwdAlt,
      revAlt,
      strandBias,
      suggestedCall,
    };
  }

  function filterClinicalVariants(variants, { maxAf, excludeSynonymous, requireSegregation }) {
    return variants.filter((v) => {
      if (v.gnomadAf > maxAf) return false;
      if (excludeSynonymous && v.consequence === "synonymous") return false;
      if (requireSegregation && !v.segregates) return false;
      return true;
    });
  }

  /* =========================================================================
     6. REPEAT INSTABILITY & SCA12 ENGINE (Game 6: SCA12 Capstone Board)
     ========================================================================= */

  /**
   * Simulate DNA polymerase slippage across a (CAG)_n repeat tract.
   * Hairpin on the newly synthesized (nascent) strand causes re-replication -> EXPANSION.
   * Hairpin on the template strand causes skipping -> CONTRACTION.
   */
  function simulateRepeatSlippage(initialRepeats, strandWithHairpin, loopRepeats = 4) {
    const base = Math.max(5, Math.round(initialRepeats));
    const loop = Math.max(1, Math.round(loopRepeats));
    if (strandWithHairpin === "nascent") {
      const next = base + loop;
      return {
        initialRepeats: base,
        finalRepeats: next,
        delta: +loop,
        outcome: "expansion",
        explanation: `Hairpin on the nascent strand lets polymerase re-copy ${loop} CAG units — after the next round of replication, the daughter duplex expands from ${base} to ${next} repeats.`,
      };
    }
    if (strandWithHairpin === "template") {
      const next = Math.max(2, base - loop);
      return {
        initialRepeats: base,
        finalRepeats: next,
        delta: -(base - next),
        outcome: "contraction",
        explanation: `Hairpin on the template strand causes polymerase to bypass ${loop} looped-out CAG units — the daughter duplex contracts from ${base} to ${next} repeats.`,
      };
    }
    return {
      initialRepeats: base,
      finalRepeats: base,
      delta: 0,
      outcome: "stable",
      explanation: `No hairpin slippage — polymerase faithfully preserves all ${base} CAG repeats.`,
    };
  }

  /**
   * Evaluate whether a sequencing read length can uniquely span a tandem repeat
   * plus flanking anchor bases on both sides.
   */
  function evaluateRepeatSpan(repeatCount, unitLen = 3, readLen = 150, flankAnchor = 15) {
    const tractBp = repeatCount * unitLen;
    const requiredBp = tractBp + 2 * flankAnchor;
    const spans = readLen >= requiredBp;
    return {
      repeatCount,
      tractBp,
      requiredBp,
      readLen,
      spans,
      status: spans ? "resolved" : "clipped",
      explanation: spans
        ? `${readLen} bp reads comfortably span the ${tractBp} bp repeat tract plus both ${flankAnchor} bp unique flanks (${requiredBp} bp needed) — exact allele length resolved.`
        : `${readLen} bp reads cannot bridge the ${tractBp} bp repeat tract + ${2 * flankAnchor} bp flanks (${requiredBp} bp needed). Reads terminate inside repetitive CAG sequence and soft-clip.`,
    };
  }

  /**
   * Course-verified SCA12 (PPP2R2B) CAG repeat interpretation regimes (Ch D4):
   *   <= 31 : agreed normal
   *   32-50 : disputed / uncertain gray zone
   *   >= 51 : diagnostic expansion*
   */
  function classifySca12Allele(repeats) {
    const n = Number(repeats);
    if (n <= 31) return "normal";
    if (n <= 50) return "gray-zone";
    return "diagnostic";
  }

  function classifySca12Genotype(allele1, allele2) {
    const maxAllele = Math.max(Number(allele1), Number(allele2));
    return classifySca12Allele(maxAllele);
  }

  /* =========================================================================
     GAME METADATA CATALOG (maps cleanly to live course chapters)
     ========================================================================= */

  const GAMES_CATALOG = [
    {
      id: "strand-fork",
      number: "01",
      title: "Strand & Fork",
      subtitle: "Antiparallel DNA, reverse complements, PCR primers & replication forks",
      domain: "molecular",
      levels: 5,
      minutes: "8–12 min",
      chapters: [
        { label: "Ch 02 · DNA Structure", href: "ch-02-dna-structure.html" },
        { label: "Ch 04 · DNA Replication", href: "ch-04-dna-replication.html" },
        { label: "Ch 17 · DNA Repair", href: "ch-17-dna-repair.html" },
        { label: "Ch 36 · Molecular Methods", href: "ch-36-core-molecular-methods.html" },
      ],
    },
    {
      id: "ribosome-debugger",
      number: "02",
      title: "Ribosome Debugger",
      subtitle: "Reading frames, wobble degeneracy, frameshifts & GU–AG splicing",
      domain: "molecular",
      levels: 5,
      minutes: "10–14 min",
      chapters: [
        { label: "Ch 05 · Transcription", href: "ch-05-transcription.html" },
        { label: "Ch 06 · RNA Processing", href: "ch-06-rna-processing.html" },
        { label: "Ch 07 · Genetic Code", href: "ch-07-genetic-code-and-translation.html" },
        { label: "Ch 16 · Mutation", href: "ch-16-mutation.html" },
      ],
    },
    {
      id: "pedigree-lab",
      number: "03",
      title: "Mendel's Pedigree Lab",
      subtitle: "Test crosses, SVG pedigree constraint solving, epistasis & carrier risk",
      domain: "transmission",
      levels: 5,
      minutes: "10–15 min",
      chapters: [
        { label: "Ch 10 · Mendelian Inheritance", href: "ch-10-mendelian-inheritance.html" },
        { label: "Ch 11 · Beyond Mendel", href: "ch-11-beyond-mendel.html" },
        { label: "Ch 13 · Sex Linkage", href: "ch-13-sex-linkage.html" },
        { label: "Ch 15 · Pedigrees", href: "ch-15-pedigrees.html" },
      ],
    },
    {
      id: "drift-arena",
      number: "04",
      title: "Drift & Selection Arena",
      subtitle: "Real-time Wright–Fisher populations, dominance shielding & bottlenecks",
      domain: "population",
      levels: 5,
      minutes: "10–14 min",
      chapters: [
        { label: "Ch 26 · Hardy–Weinberg", href: "ch-26-hardy-weinberg.html" },
        { label: "Ch 27 · The Four Forces", href: "ch-27-the-four-forces.html" },
        { label: "Ch 28 · Structure & Inbreeding", href: "ch-28-structure-and-inbreeding.html" },
        { label: "Ch 33 · Neutral Theory", href: "ch-33-neutral-theory-and-selection-tests.html" },
      ],
    },
    {
      id: "read-mapper",
      number: "05",
      title: "Read Mapper & Variant Detective",
      subtitle: "Seed-and-extend alignment, CIGAR indels, MAPQ repeats & exome triage",
      domain: "genomics",
      levels: 5,
      minutes: "10–15 min",
      chapters: [
        { label: "Ch 40 · Sequencing Tech", href: "ch-40-sequencing-technologies.html" },
        { label: "Ch 42 · Read Alignment", href: "ch-42-read-alignment.html" },
        { label: "Ch 46 · Variant Calling", href: "ch-46-variant-calling.html" },
        { label: "Ch 55 · Clinical Interpretation", href: "ch-55-clinical-variant-interpretation.html" },
      ],
    },
    {
      id: "sca12-lab",
      number: "06",
      title: "Repeat Instability & SCA12 Board",
      subtitle: "Hairpin slippage, short-read span walls & 32–50 CAG gray-zone discipline",
      domain: "sca12",
      levels: 4,
      minutes: "8–12 min",
      chapters: [
        { label: "Ch D3 · Repeat Disorders", href: "ch-D3-repeat-expansion-disorders.html" },
        { label: "Ch D4 · SCA12 Mechanism", href: "ch-D4-sca12-from-repeat-to-phenotype.html" },
        { label: "Ch D5 · SCA12 Clinic", href: "ch-D5-sca12-population-clinic-therapy.html" },
      ],
    },
  ];

  /* =========================================================================
     7. DRILL GENERATORS & COUNSELING EVALUATOR (Replayable Practice)
     ========================================================================= */

  const CODON_BY_AA = {};
  for (const [codon, aa] of Object.entries(CODON_TABLE)) {
    CODON_BY_AA[aa] = CODON_BY_AA[aa] || [];
    CODON_BY_AA[aa].push(codon);
  }

  /**
   * Generate a balanced DNA strand (35%-65% GC, never palindromic with itself)
   * for repeatable base-pairing and reverse-complement drills.
   */
  function generateDnaStrand(len = 8, seed = 101) {
    const bases = ["A", "C", "G", "T"];
    const rng = makeRng(seed);
    for (let attempt = 0; attempt < 30; attempt++) {
      let s = "";
      let gc = 0;
      for (let i = 0; i < len; i++) {
        const b = bases[Math.floor(rng() * 4)];
        if (b === "G" || b === "C") gc++;
        s += b;
      }
      const ratio = gc / len;
      if (ratio >= 0.35 && ratio <= 0.65 && s !== reverseComplement(s)) {
        return s;
      }
    }
    return "ATGCGATC";
  }

  /**
   * Generate a replicated duplex with `numErrors` planted polymerase mismatches
   * spanning different steric clash categories.
   */
  function generateMismatchDuplex(len = 10, numErrors = 3, seed = 202) {
    const rng = makeRng(seed);
    const template = generateDnaStrand(len, seed + 17);
    const trueComp = complementDna(template).split("");
    const daughter = trueComp.slice();
    const idxs = [];
    while (idxs.length < Math.min(numErrors, len)) {
      const idx = Math.floor(rng() * len);
      if (!idxs.includes(idx)) idxs.push(idx);
    }
    idxs.sort((a, b) => a - b);
    const allBases = ["A", "C", "G", "T"];
    for (const idx of idxs) {
      const wrongOpts = allBases.filter((b) => b !== trueComp[idx]);
      daughter[idx] = wrongOpts[Math.floor(rng() * wrongOpts.length)];
    }
    return { template, daughter: daughter.join(""), errorIndices: idxs };
  }

  /**
   * Generate a fresh 5-aa wild-type mRNA (AUG + 4 sense codons + UAA) and a
   * 1-bp deletion right after AUG that scrambles the downstream reading frame.
   */
  function generateFrameshiftPuzzle(seed = 303) {
    const rng = makeRng(seed);
    const pool = [
      "GCU", "UAC", "GGA", "AAA", "UGG", "GAU", "CCU", "AGC",
      "UUC", "CAC", "GAA", "CGG", "AUC", "ACG", "CAG", "GUG",
    ];
    const picked = [];
    while (picked.length < 4) {
      const c = pool[Math.floor(rng() * pool.length)];
      if (!picked.includes(c)) picked.push(c);
    }
    const wtMrna = "AUG" + picked.join("") + "UAA";
    const deleteIndex = 3; // first base of codon 2
    const deletedBase = wtMrna[deleteIndex];
    const mutantMrna = wtMrna.slice(0, deleteIndex) + wtMrna.slice(deleteIndex + 1);
    const wtTr = translateMrna(wtMrna);
    return {
      wtMrna,
      mutantMrna,
      targetPeptide: wtTr.peptide.join("-"),
      deletedBase,
      deleteIndex,
    };
  }

  /**
   * Generate a fresh 10-read sequencing pileup column for repeatable variant-calling drills.
   * kind: "het-snp" | "hom-alt" | "artifact"
   */
  function generatePileupLocus(kind = "het-snp", seed = 404) {
    const rng = makeRng(seed);
    const pairs = [["A", "G", "C"], ["C", "T", "A"], ["G", "A", "T"], ["T", "C", "G"]];
    const [ref, alt, noise] = pairs[Math.floor(rng() * pairs.length)];
    const reads = [];
    const randQ = (lo, hi) => lo + Math.floor(rng() * (hi - lo + 1));

    if (kind === "het-snp") {
      for (let i = 0; i < 5; i++) reads.push({ base: ref, qual: randQ(32, 38), strand: i % 2 === 0 ? "+" : "-" });
      for (let i = 0; i < 4; i++) reads.push({ base: alt, qual: randQ(32, 38), strand: i % 2 === 0 ? "+" : "-" });
      reads.push({ base: noise, qual: randQ(7, 11), strand: "+" });
      return { ref, alt, truth: "0/1", reads };
    }
    if (kind === "hom-alt") {
      for (let i = 0; i < 9; i++) reads.push({ base: alt, qual: randQ(32, 39), strand: i % 2 === 0 ? "+" : "-" });
      reads.push({ base: ref, qual: randQ(8, 12), strand: "-" });
      return { ref, alt, truth: "1/1", reads };
    }
    // "artifact": 6 clean ref reads + 4 low-Q strand-biased alt calls
    const biasStrand = rng() < 0.5 ? "+" : "-";
    for (let i = 0; i < 6; i++) reads.push({ base: ref, qual: randQ(33, 39), strand: i % 2 === 0 ? "+" : "-" });
    for (let i = 0; i < 4; i++) reads.push({ base: alt, qual: randQ(7, 12), strand: biasStrand });
    return { ref, alt, truth: "0/0", reads };
  }

  /**
   * Validate a numeric Hardy-Weinberg genetic counseling calculation for an
   * autosomal recessive disorder with prevalence q^2 = 1 / prevalenceDenom,
   * unaffected sibling of an affected individual (carrier prob 2/3), marrying
   * an unrelated general-population partner (carrier prob 2pq ≈ 2q).
   */
  function evaluateCarrierRisk(prevalenceDenom, qInput, carrierDenomInput, riskDenomInput) {
    const qTrue = 1 / Math.sqrt(prevalenceDenom);
    const pTrue = 1 - qTrue;
    const carrierExact = 2 * pTrue * qTrue;
    const carrierApprox = 2 * qTrue;
    const carrierDenomExact = 1 / carrierExact;
    const carrierDenomApprox = 1 / carrierApprox;
    const riskDenomExact = 1 / ((2 / 3) * carrierExact * 0.25);
    const riskDenomApprox = 1 / ((2 / 3) * carrierApprox * 0.25);

    const parseNum = (v) => {
      const s = String(v || "").trim().replace(/^1\s*\/\s*/, "").replace(/,/g, "");
      const n = Number(s);
      return Number.isFinite(n) && n > 0 ? n : NaN;
    };

    const qVal = Number(String(qInput || "").trim());
    const cDen = parseNum(carrierDenomInput);
    const rDen = parseNum(riskDenomInput);

    const within = (val, targetA, targetB, tol = 0.06) =>
      Number.isFinite(val) && (
        Math.abs(val - targetA) / targetA <= tol ||
        Math.abs(val - targetB) / targetB <= tol
      );

    const errors = [];
    if (!Number.isFinite(qVal) || Math.abs(qVal - qTrue) / qTrue > 0.04) {
      errors.push(`Step 1: q = √(1 / ${prevalenceDenom.toLocaleString()}) = ${qTrue.toFixed(4)} (not ${qInput || "blank"}).`);
    }
    if (!within(cDen, carrierDenomExact, carrierDenomApprox, 0.06)) {
      errors.push(`Step 2: Partner carrier frequency 2pq ≈ 2q = 1 in ${Math.round(carrierDenomApprox)} (exact 1 in ${carrierDenomExact.toFixed(1)}).`);
    }
    if (!within(rDen, riskDenomExact, riskDenomApprox, 0.06)) {
      errors.push(`Step 3: Child risk = (2/3) × (2pq) × (1/4) ≈ 1 in ${Math.round(riskDenomApprox)} (exact 1 in ${Math.round(riskDenomExact)}).`);
    }

    return {
      ok: errors.length === 0,
      errors,
      qTrue,
      carrierDenomApprox: Math.round(carrierDenomApprox),
      riskDenomApprox: Math.round(riskDenomApprox),
    };
  }

  return {
    GAMES_CATALOG,
    DNA_COMPLEMENT,
    CODON_TABLE,
    CODON_BY_AA,
    AA_CLASS,
    cleanDna,
    complementDna,
    reverseComplement,
    evaluateDuplex,
    simulatePcr,
    evaluateReplicationFork,
    cleanRna,
    translateMrna,
    splicePreMrna,
    classifyRnaMutation,
    makeRng,
    evaluatePedigree,
    simulateMonoCross,
    simulateEpistasisCross,
    runWrightFisher,
    alignUngapped,
    alignWithDeletion,
    findExactHits,
    phredErrorProb,
    analyzePileup,
    filterClinicalVariants,
    simulateRepeatSlippage,
    evaluateRepeatSpan,
    classifySca12Allele,
    classifySca12Genotype,
    generateDnaStrand,
    generateMismatchDuplex,
    generateFrameshiftPuzzle,
    generatePileupLocus,
    evaluateCarrierRisk,
  };
});
