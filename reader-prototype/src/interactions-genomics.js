/* ── Genomics and functional-genomics interaction wave ──────────────────
   Objective-mapped Hero Labs for the ten previously uncovered modules in
   Parts 9–10: Chapters 39–42 and 44–49. The shared visual thesis is

        molecule / specimen → representation → inference → claim boundary

   Scientific models remain pure so their limiting cases can be checked in
   verify_interactions.js. Rendering stays dependency-free and works from
   file:// with the rest of the reader.
   ───────────────────────────────────────────────────────────────────────── */

(function (global) {
  "use strict";

  const definitions = {};
  const models = {};
  const coverage = {};
  const kit = global.ReaderInteractionKit;
  if (!kit) throw new Error("ReaderInteractionKit must load before genomics labs");

  const {
    choiceRow: kitChoiceRow,
    tabs: kitTabs,
    causalRail: kitCausalRail,
    fieldWithRange,
  } = kit;

  function preserveButtonFocus(onChange) {
    return (value) => {
      const active = document.activeElement;
      const widget = active && active.closest ? active.closest(".widget") : null;
      const group = active && active.closest ? active.closest('[role="group"]') : null;
      const groupLabel = group && group.getAttribute("aria-label");
      const buttonLabel = active && active.tagName === "BUTTON" ? active.textContent.trim() : "";
      onChange(value);
      if (!widget || !groupLabel || !buttonLabel) return;
      const replacementGroup = [...widget.querySelectorAll('[role="group"]')]
        .find((candidate) => candidate.getAttribute("aria-label") === groupLabel);
      const replacement = replacementGroup && [...replacementGroup.querySelectorAll("button")]
        .find((candidate) => candidate.textContent.trim() === buttonLabel);
      if (replacement) replacement.focus({ preventScroll: true });
    };
  }

  function choiceRow(el, choices, selected, onChange, ariaLabel) {
    return kitChoiceRow(el, choices, selected, preserveButtonFocus(onChange), ariaLabel);
  }

  function tabs(el, choices, selected, onChange) {
    return kitTabs(el, choices, selected, preserveButtonFocus(onChange));
  }

  function causalRail(el, items) {
    const rail = kitCausalRail(el, items);
    rail.classList.add("has-" + items.length + "-steps");
    return rail;
  }

  function define(id, objectiveMap, build) {
    if (definitions[id]) throw new Error("Duplicate interaction: " + id);
    definitions[id] = build;
    coverage[id] = objectiveMap;
  }

  function clamp(value, low, high) {
    return Math.max(low, Math.min(high, value));
  }

  function sum(values) {
    return values.reduce((total, value) => total + value, 0);
  }

  function median(values) {
    const ordered = values.filter(Number.isFinite).slice().sort((a, b) => a - b);
    if (!ordered.length) return NaN;
    const middle = Math.floor(ordered.length / 2);
    return ordered.length % 2 ? ordered[middle] : (ordered[middle - 1] + ordered[middle]) / 2;
  }

  function percent(value, digits) {
    return (100 * value).toFixed(digits == null ? 1 : digits) + "%";
  }

  function compact(value, digits) {
    if (!Number.isFinite(value)) return "—";
    const absolute = Math.abs(value);
    if (absolute !== 0 && (absolute < 0.001 || absolute >= 100000)) {
      return value.toExponential(digits == null ? 2 : digits);
    }
    return value.toLocaleString("en-US", {
      maximumFractionDigits: digits == null ? 3 : digits,
      minimumFractionDigits: 0,
    });
  }

  function choose(n, k) {
    if (k < 0 || k > n) return 0;
    let value = 1;
    for (let index = 1; index <= k; index += 1) {
      value *= (n - index + 1) / index;
    }
    return value;
  }

  function binomialProbability(n, k, p) {
    return choose(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
  }

  function binomialTail(n, threshold, p) {
    let probability = 0;
    for (let k = Math.max(0, threshold); k <= n; k += 1) {
      probability += binomialProbability(n, k, p);
    }
    return clamp(probability, 0, 1);
  }

  function logSumExp(values) {
    const maximum = Math.max(...values);
    return maximum + Math.log(sum(values.map((value) => Math.exp(value - maximum))));
  }

  function normaliseLogs(logValues) {
    const denominator = logSumExp(logValues);
    return logValues.map((value) => Math.exp(value - denominator));
  }

  function rangeControl(el, label, value, options, onInput) {
    const attrs = Object.assign({ type: "range" }, options, {
      value: String(value),
      "data-focus-key": label,
    });
    delete attrs.format;
    const input = el("input", attrs);
    const valueNode = el("span", {
      class: "val",
      text: options.format ? options.format(value) : String(value),
    });
    input.addEventListener("input", () => {
      const widget = input.closest(".widget");
      onInput(Number(input.value));
      const replacement = widget && [...widget.querySelectorAll('input[type="range"]')]
        .find((candidate) => candidate.dataset.focusKey === label);
      if (replacement) replacement.focus({ preventScroll: true });
    });
    return fieldWithRange(el, label, valueNode, input);
  }

  function labParts(el) {
    return {
      instrument: el("div", { class: "hero-lab genomics-lab", hidden: true }),
      tabHost: el("div"),
      visual: el("div", { class: "lab-visual genomics-visual" }),
      controls: el("div", { class: "lab-controls" }),
      rail: el("div"),
      explanation: el("div", { class: "callout", "aria-live": "polite" }),
    };
  }

  function finishLab(parts, body) {
    parts.instrument.append(parts.tabHost, parts.visual, parts.controls, parts.rail, parts.explanation);
    body.append(parts.instrument);
  }

  function statusStrip(el, items, label) {
    const strip = el("div", {
      class: "pop-status-strip genomics-status-strip",
      role: "img",
      "aria-label": label + ". " + items.map((item) => item.label + ": " + item.value).join(". "),
    });
    items.forEach((item) => strip.append(el("div", {
      class: "pop-status" + (item.tone ? " is-" + item.tone : ""),
    }, [
      el("span", { text: item.label }),
      el("strong", { text: String(item.value) }),
    ])));
    return strip;
  }

  function processBoard(el, steps, label) {
    const board = el("div", {
      class: "pop-process genomics-process",
      role: "img",
      "aria-label": label + ". " + steps.map((step) => step.label + ": " + step.value).join(". "),
    });
    steps.forEach((step, index) => board.append(el("div", {
      class: "pop-process-step" + (step.tone ? " is-" + step.tone : ""),
    }, [
      el("span", { class: "pop-process-index", text: String(index + 1).padStart(2, "0") }),
      el("span", { class: "pop-process-label", text: step.label }),
      el("strong", { text: String(step.value) }),
    ])));
    return board;
  }

  function barBoard(el, rows, label, maximum) {
    const max = maximum || Math.max(1e-12, ...rows.map((row) => Math.abs(row.value)));
    const board = el("div", {
      class: "pop-bars genomics-bars",
      role: "img",
      "aria-label": label + ". " + rows.map((row) =>
        row.label + " " + (row.display == null ? row.value : row.display)
      ).join(", "),
    });
    rows.forEach((row) => board.append(el("div", { class: "pop-bar-row" }, [
      el("span", { class: "pop-bar-name", text: row.label }),
      el("span", { class: "pop-bar-track", "aria-hidden": "true" }, [
        el("span", {
          class: "pop-bar-fill" + (row.tone ? " is-" + row.tone : ""),
          style: "width:" + clamp(100 * Math.abs(row.value) / max, 0, 100).toFixed(2) + "%",
        }),
      ]),
      el("strong", { text: row.display == null ? String(row.value) : String(row.display) }),
    ])));
    return board;
  }

  function claimBoundary(el, measured, excluded, boundary) {
    return el("div", {
      class: "methods-claim-shutter",
      role: "img",
      "aria-label": "Measured: " + measured + ". Not measured: " + excluded + ". Claim boundary: " + boundary,
    }, [
      el("div", { class: "methods-claim-half is-open" }, [
        el("span", { text: "measured" }),
        el("strong", { text: measured }),
      ]),
      el("div", { class: "methods-claim-gate", "aria-hidden": "true", text: "≠" }),
      el("div", { class: "methods-claim-half is-closed" }, [
        el("span", { text: "not measured" }),
        el("strong", { text: excluded }),
      ]),
      el("p", { text: boundary }),
    ]);
  }

  function matrixBoard(el, columns, rows, label) {
    const board = el("div", {
      class: "genomics-matrix",
      role: "img",
      "aria-label": label + ". " + rows.map((row) => row.label + ": " + row.values.join(", ")).join(". "),
      style: "--matrix-columns:" + (columns.length + 1),
    });
    board.append(el("span", { class: "genomics-matrix-corner", text: "" }));
    columns.forEach((column) => board.append(el("strong", { class: "genomics-matrix-head", text: column })));
    rows.forEach((row) => {
      board.append(el("strong", { class: "genomics-matrix-row", text: row.label }));
      row.values.forEach((value, index) => board.append(el("span", {
        class: "genomics-matrix-cell" + (row.tones && row.tones[index] ? " is-" + row.tones[index] : ""),
        text: String(value),
      })));
    });
    return board;
  }

  function sequenceBoard(el, rows, label) {
    const board = el("div", {
      class: "genomics-sequence-board",
      role: "img",
      "aria-label": label + ". " + rows.map((row) => row.label + " " + row.sequence).join(". "),
    });
    rows.forEach((row) => board.append(el("div", { class: "genomics-sequence-row" }, [
      el("span", { text: row.label }),
      el("code", { class: row.tone ? "is-" + row.tone : "", text: row.sequence }),
      row.note ? el("small", { text: row.note }) : null,
    ].filter(Boolean))));
    return board;
  }

  function dotField(el, points, label) {
    const field = el("div", {
      class: "genomics-dot-field",
      role: "img",
      "aria-label": label,
    });
    points.forEach((point) => field.append(el("i", {
      class: "genomics-dot is-" + (point.tone || "muted"),
      style: "left:" + clamp(point.x, 2, 98) + "%;top:" + clamp(point.y, 2, 98) + "%",
      "aria-hidden": "true",
    })));
    return field;
  }

  function makeObjectiveMap(prefix, descriptions) {
    const map = {};
    descriptions.forEach((description, index) => {
      map[prefix + "-o" + (index + 1)] = description;
    });
    return map;
  }

  /* Pure models -------------------------------------------------------- */

  const GENOME_FIXTURES = {
    human: { label: "Human", genomeGb: 3.1, genes: 20000, coding: 0.015, repeats: 0.52, otherGenic: 0.39 },
    onion: { label: "Onion", genomeGb: 16.3, genes: 27000, coding: 0.003, repeats: 0.82, otherGenic: 0.16 },
    pufferfish: { label: "Pufferfish", genomeGb: 0.39, genes: 19000, coding: 0.11, repeats: 0.10, otherGenic: 0.71 },
    lungfish: { label: "Lungfish", genomeGb: 43, genes: 23000, coding: 0.001, repeats: 0.90, otherGenic: 0.08 },
  };

  function genomeLandscapeModel(input) {
    if (input.kind === "composition") {
      const fixture = GENOME_FIXTURES[input.species] || GENOME_FIXTURES.human;
      const coding = fixture.coding;
      const repeats = fixture.repeats;
      const other = Math.max(0, 1 - coding - repeats);
      return Object.assign({}, fixture, { coding, repeats, other });
    }
    if (input.kind === "functionBound") {
      const mutations = Math.max(1e-9, input.mutations);
      const deleteriousFraction = clamp(input.deleteriousFraction, 1e-9, 1);
      const children = Math.max(2, input.children);
      const mutationLoadLimit = Math.log(children / 2);
      const functionalBound = clamp(mutationLoadLimit / (mutations * deleteriousFraction), 0, 1);
      return { mutations, deleteriousFraction, children, mutationLoadLimit, functionalBound };
    }
    if (input.kind === "hazard") {
      const effectiveSize = Math.max(1, input.effectiveSize);
      const extraBases = Math.max(0, input.extraBases);
      const costPerBase = Math.max(0, input.costPerBase);
      const selectionCost = Math.min(1, extraBases * costPerBase);
      const efficacy = 2 * effectiveSize * selectionCost;
      return {
        effectiveSize, extraBases, costPerBase, selectionCost, efficacy,
        regime: efficacy >= 10 ? "selection efficiently removes the burden" :
          efficacy >= 1 ? "selection and drift both matter" : "drift can hide the burden",
      };
    }
    if (input.kind === "repeat") {
      const readLength = Math.max(1, input.readLength);
      const repeatLength = Math.max(1, input.repeatLength);
      const copies = Math.max(1, input.copies || 2);
      const uniqueAnchor = readLength > repeatLength;
      const className = input.repeatClass || "interspersed";
      const failure = className === "tandem" ? "assembly path length" :
        className === "segmental" ? "paralogous mapping and NAHR" : "mapping uniqueness";
      return { readLength, repeatLength, copies, uniqueAnchor, failure };
    }
    if (input.kind === "heteroplasmy") {
      const mitochondrialReads = Math.max(0, input.mitochondrialReads);
      const numtReads = Math.max(0, input.numtReads);
      const alternateReads = clamp(input.alternateReads, 0, mitochondrialReads + numtReads);
      const observed = alternateReads / Math.max(1, mitochondrialReads + numtReads);
      const corrected = clamp((alternateReads - numtReads) / Math.max(1, mitochondrialReads), 0, 1);
      return { mitochondrialReads, numtReads, alternateReads, observed, corrected };
    }
    throw new Error("Unknown genome-landscape model kind");
  }

  const PLATFORM_FIXTURES = {
    sanger: { label: "Sanger", signal: "fluorescent chain termination", molecule: "amplified locus", read: "~700 bp", error: 0.001, strength: "one-locus confirmation" },
    illumina: { label: "Illumina", signal: "reversible-terminator fluorescence", molecule: "clonal cluster", read: "150–300 bp", error: 0.001, strength: "cheap, deep short reads" },
    pacbio: { label: "PacBio HiFi", signal: "polymerase pulse timing", molecule: "one circular template, repeated", read: "15–25 kb consensus", error: 0.001, strength: "accurate long haplotypes" },
    nanopore: { label: "Nanopore", signal: "ionic-current disruption", molecule: "one native strand", read: ">100 kb possible", error: 0.05, strength: "ultra-long and modified bases" },
  };

  function sequencerModel(input) {
    if (input.kind === "platform") return PLATFORM_FIXTURES[input.platform] || PLATFORM_FIXTURES.illumina;
    if (input.kind === "coverage") {
      const depth = Math.max(0, input.depth);
      const genomeBases = Math.max(1, input.genomeBases || 3.1e9);
      const uncoveredFraction = Math.exp(-depth);
      const breadth = 1 - uncoveredFraction;
      const localDepth = Math.max(0, Math.round(input.localDepth == null ? depth : input.localDepth));
      const oneHaplotypeOnly = localDepth === 0 ? 1 : Math.min(1, 2 * Math.pow(0.5, localDepth));
      return { depth, genomeBases, uncoveredFraction, breadth, uncoveredBases: genomeBases * uncoveredFraction, localDepth, oneHaplotypeOnly };
    }
    if (input.kind === "consensus") {
      const rawError = clamp(input.rawError, 0, 0.5);
      const passes = Math.max(1, Math.round(input.passes));
      const errorsNeeded = Math.floor(passes / 2) + 1;
      const consensusError = binomialTail(passes, errorsNeeded, rawError);
      return { rawError, passes, errorsNeeded, consensusError };
    }
    if (input.kind === "somatic") {
      const tumourPurity = clamp(input.tumourPurity, 0, 1);
      const cloneFraction = clamp(input.cloneFraction, 0, 1);
      const copiesWithVariant = clamp(input.copiesWithVariant == null ? 0.5 : input.copiesWithVariant, 0, 1);
      const depth = Math.max(0, Math.round(input.depth));
      const minimumReads = Math.max(1, Math.round(input.minimumReads || 3));
      const vaf = tumourPurity * cloneFraction * copiesWithVariant;
      const expectedReads = depth * vaf;
      const detection = binomialTail(depth, minimumReads, vaf);
      return { tumourPurity, cloneFraction, copiesWithVariant, depth, minimumReads, vaf, expectedReads, detection };
    }
    if (input.kind === "duplicates") {
      const molecules = Math.max(1, input.molecules);
      const reads = Math.max(1, input.reads);
      const distinct = molecules * (1 - Math.exp(-reads / molecules));
      const duplicateFraction = clamp(1 - distinct / reads, 0, 1);
      return { molecules, reads, distinct, duplicateFraction };
    }
    throw new Error("Unknown sequencer model kind");
  }

  const FLAG_BITS = [
    [1, "paired"], [2, "proper pair"], [4, "unmapped"], [8, "mate unmapped"],
    [16, "reverse strand"], [32, "mate reverse"], [64, "first mate"],
    [128, "second mate"], [256, "secondary"], [512, "QC fail"],
    [1024, "duplicate"], [2048, "supplementary"],
  ];

  function formatCoordinateModel(input) {
    if (input.kind === "phred") {
      const q = clamp(Math.round(input.q), 0, 62);
      const offset = input.offset === 64 ? 64 : 33;
      return { q, offset, error: Math.pow(10, -q / 10), accuracy: 1 - Math.pow(10, -q / 10), character: String.fromCharCode(q + offset) };
    }
    if (input.kind === "flag") {
      const flag = Math.max(0, Math.round(input.flag));
      return { flag, labels: FLAG_BITS.filter(([bit]) => (flag & bit) !== 0).map(([, label]) => label) };
    }
    if (input.kind === "cigar") {
      const cigar = String(input.cigar || "");
      const operations = [...cigar.matchAll(/(\d+)([MIDNSHP=X])/g)].map((match) => ({ length: Number(match[1]), op: match[2] }));
      if (!operations.length || operations.map((item) => item.length + item.op).join("") !== cigar) throw new Error("Invalid CIGAR");
      const queryOps = new Set(["M", "I", "S", "=", "X"]);
      const referenceOps = new Set(["M", "D", "N", "=", "X"]);
      const queryLength = sum(operations.filter((item) => queryOps.has(item.op)).map((item) => item.length));
      const referenceSpan = sum(operations.filter((item) => referenceOps.has(item.op)).map((item) => item.length));
      const start = Math.max(1, Math.round(input.start || 1));
      return { cigar, operations, queryLength, referenceSpan, start, end: start + referenceSpan - 1 };
    }
    if (input.kind === "coordinate") {
      const start = input.system === "bed"
        ? Math.max(0, Math.round(input.start))
        : Math.max(1, Math.round(input.start));
      const end = Math.max(start, Math.round(input.end));
      if (input.system === "bed") return { source: "BED", target: "GFF/VCF", start, end, targetStart: start + 1, targetEnd: end, length: end - start };
      return { source: "GFF/VCF", target: "BED", start, end, targetStart: Math.max(0, start - 1), targetEnd: end, length: end - start + 1 };
    }
    if (input.kind === "normalise") {
      const fixture = input.fixture || "homopolymer";
      if (fixture === "homopolymer") return { before: "chr1:104 AA>A", after: "chr1:101 AA>A", operation: "left-align through equivalent A run" };
      if (fixture === "trim") return { before: "chr2:210 TAC>TGC", after: "chr2:211 A>G", operation: "trim shared prefix and suffix" };
      return { before: "chr3:88 A>C,G", after: "split into two biallelic records", operation: "decompose multiallelic alleles" };
    }
    if (input.kind === "liftover") {
      const hasImage = !!input.hasImage;
      const refMatches = !!input.refMatches;
      const unique = !!input.unique;
      return {
        hasImage, refMatches, unique,
        status: !hasImage ? "unmapped: no target interval" : !unique ? "ambiguous: multiple target intervals" : !refMatches ? "reject: REF does not match target FASTA" : "usable after target-build validation",
      };
    }
    throw new Error("Unknown format-coordinate model kind");
  }

  function buildBwt(text) {
    const terminated = text.includes("$") ? text : text + "$";
    const rotations = Array.from({ length: terminated.length }, (_, index) => ({
      rotation: terminated.slice(index) + terminated.slice(0, index),
      suffix: index,
    })).sort((a, b) => a.rotation.localeCompare(b.rotation));
    return {
      text: terminated,
      rotations,
      first: rotations.map((row) => row.rotation[0]).join(""),
      last: rotations.map((row) => row.rotation[terminated.length - 1]).join(""),
      suffixArray: rotations.map((row) => row.suffix),
    };
  }

  function backwardSearch(text, pattern) {
    const bwt = buildBwt(text);
    const alphabet = [...new Set(bwt.first)].sort();
    const counts = {};
    let total = 0;
    alphabet.forEach((character) => {
      counts[character] = total;
      total += [...bwt.first].filter((value) => value === character).length;
    });
    function occ(character, index) {
      let count = 0;
      for (let cursor = 0; cursor < index; cursor += 1) if (bwt.last[cursor] === character) count += 1;
      return count;
    }
    let low = 0;
    let high = bwt.last.length;
    const trace = [];
    for (const character of [...pattern].reverse()) {
      if (counts[character] == null) {
        low = 0;
        high = 0;
      } else {
        low = counts[character] + occ(character, low);
        high = counts[character] + occ(character, high);
      }
      trace.push({ character, low, high, matches: Math.max(0, high - low) });
      if (low >= high) break;
    }
    return { bwt, pattern, low, high, count: Math.max(0, high - low), positions: bwt.suffixArray.slice(low, high), trace };
  }

  function alignmentModel(input) {
    if (input.kind === "scale") {
      const reads = Math.max(1, input.reads);
      const genomeBases = Math.max(1, input.genomeBases);
      const readLength = Math.max(1, input.readLength);
      const comparisons = reads * genomeBases * readLength;
      const coreYears = comparisons / Math.max(1, input.comparisonsPerSecond || 1e9) / (365.25 * 24 * 3600);
      return { reads, genomeBases, readLength, comparisons, coreYears };
    }
    if (input.kind === "bwt") return backwardSearch(String(input.text || "GATTACA"), String(input.pattern || "TA"));
    if (input.kind === "seed") {
      const readLength = Math.max(1, Math.round(input.readLength));
      const errors = Math.max(0, Math.round(input.errors));
      const guaranteedSegments = errors + 1;
      const guaranteedExactSeed = Math.floor(readLength / guaranteedSegments);
      return { readLength, errors, guaranteedSegments, guaranteedExactSeed };
    }
    if (input.kind === "affine") {
      const gapLength = Math.max(1, Math.round(input.gapLength));
      const gapOpen = Math.max(0, input.gapOpen);
      const gapExtend = Math.max(0, input.gapExtend);
      const linearPenalty = Math.max(0, input.linearPenalty);
      return {
        gapLength, gapOpen, gapExtend, linearPenalty,
        affineCost: gapOpen + gapExtend * (gapLength - 1),
        linearCost: linearPenalty * gapLength,
        repeatedOpenCost: gapOpen * gapLength,
      };
    }
    if (input.kind === "mapq") {
      const scores = input.scores.map(Number);
      const temperature = Math.max(1e-9, input.temperature || 1);
      const maximum = Math.max(...scores);
      const weights = scores.map((score) => Math.exp((score - maximum) / temperature));
      const probabilities = weights.map((weight) => weight / sum(weights));
      const best = Math.max(...probabilities);
      const mapq = -10 * Math.log10(Math.max(1e-12, 1 - best));
      return { scores, temperature, probabilities, best, mapq };
    }
    if (input.kind === "repeat") {
      const repeatLength = Math.max(1, input.repeatLength);
      const readLength = Math.max(1, input.readLength);
      const insertSize = Math.max(readLength, input.insertSize || readLength);
      const span = Math.max(readLength, insertSize);
      return { repeatLength, readLength, insertSize, span, resolvable: span > repeatLength };
    }
    if (input.kind === "bias") {
      const refScore = input.refScore;
      const altScore = input.altScore;
      const temperature = Math.max(1e-9, input.temperature || 4);
      const refMap = 1 / (1 + Math.exp(-(refScore - input.minimumScore) / temperature));
      const altMap = 1 / (1 + Math.exp(-(altScore - input.minimumScore) / temperature));
      const observedAltBalance = altMap / Math.max(1e-12, refMap + altMap);
      return { refScore, altScore, refMap, altMap, observedAltBalance };
    }
    if (input.kind === "failure") {
      const signatures = {
        insert: "library-size or structural-variant signal",
        mapq: "repeat, contamination, or reference mismatch",
        clips: "breakpoint, splice junction, or adapter sequence",
        coverage: "capture, GC, mappability, or copy-number shift",
      };
      return { signature: input.signature, diagnosis: signatures[input.signature] || signatures.coverage };
    }
    throw new Error("Unknown alignment model kind");
  }

  function annotationModel(input) {
    if (input.kind === "hmm") {
      const evidence = [
        { motif: 0.1, short: 0.05, long: 0.02 },
        { motif: 0.95, short: 0.35, long: 0.3 },
        { motif: 0.3, short: 0.9, long: 0.95 },
        { motif: 0.2, short: 0.12, long: 0.92 },
        { motif: 0.85, short: 0.78, long: 0.96 },
        { motif: 0.1, short: 0.04, long: 0.03 },
      ];
      const states = ["intergenic", "exon", "intron"];
      const shortWeight = clamp(input.shortEvidence, 0, 1);
      const longWeight = clamp(input.longEvidence, 0, 1);
      const motifWeight = clamp(input.motifEvidence, 0, 1);
      const stay = clamp(input.stayProbability == null ? 0.4 : input.stayProbability, 0.34, 0.99);
      const transition = (from, to) => Math.log(from === to ? stay : (1 - stay) / 2);
      const score = (observation, state) => {
        const observedShort = observation.short * shortWeight;
        const observedLong = observation.long * longWeight;
        const observedMotif = observation.motif * motifWeight;
        const potentials = {
          intergenic: 0.05 + 4 * (1 - Math.max(observedShort, observedLong, observedMotif)),
          exon: 0.05 + 7 * observedMotif + observedShort + observedLong,
          intron: 0.05 + 8 * observedLong * (1 - observedShort) * (1 - observedMotif),
        };
        const normalizer = sum(states.map((candidate) => potentials[candidate]));
        return Math.log(potentials[state] / normalizer);
      };
      const dp = [Object.fromEntries(states.map((state) => [state, { value: Math.log(1 / 3) + score(evidence[0], state), path: [state] }]))];
      for (let index = 1; index < evidence.length; index += 1) {
        const layer = {};
        for (const state of states) {
          const candidates = states.map((previous) => ({
            value: dp[index - 1][previous].value + transition(previous, state) + score(evidence[index], state),
            path: dp[index - 1][previous].path.concat(state),
          }));
          layer[state] = candidates.sort((a, b) => b.value - a.value)[0];
        }
        dp.push(layer);
      }
      const winner = states.map((state) => dp[dp.length - 1][state]).sort((a, b) => b.value - a.value)[0];
      return { path: winner.path, logScore: winner.value, shortWeight, longWeight, motifWeight, stay };
    }
    if (input.kind === "evidence") {
      const abInitio = clamp(input.abInitio, 0, 1);
      const shortRna = clamp(input.shortRna, 0, 1);
      const longRna = clamp(input.longRna, 0, 1);
      const protein = clamp(input.protein, 0, 1);
      const boundaryConfidence = clamp(0.15 * abInitio + 0.25 * shortRna + 0.4 * longRna + 0.2 * protein, 0, 1);
      return { abInitio, shortRna, longRna, protein, boundaryConfidence };
    }
    if (input.kind === "transcript") {
      const transcript = input.transcript || "mane";
      const consequences = {
        mane: { transcript: "MANE Select", consequence: "missense", coding: true },
        short: { transcript: "short coding isoform", consequence: "3′ UTR", coding: false },
        retained: { transcript: "intron-retained isoform", consequence: "retained-intron variant", coding: false },
      };
      return consequences[transcript] || consequences.mane;
    }
    if (input.kind === "regulatory") {
      const cell = input.cell || "hepatocyte";
      const open = cell === "hepatocyte" ? !!input.liverOpen : !!input.neuronOpen;
      const label = open ? "candidate active enhancer state" : "quiescent in this cell fixture";
      return { cell, open, label, provesFunction: false };
    }
    if (input.kind === "homology") {
      const identity = clamp(input.identity, 0, 1);
      const paralogueDistance = clamp(input.paralogueDistance, 0, 1);
      const contextMatch = clamp(input.contextMatch, 0, 1);
      const transferConfidence = clamp(identity * (0.45 + 0.55 * contextMatch) * (1 - 0.6 * paralogueDistance), 0, 1);
      return { identity, paralogueDistance, contextMatch, transferConfidence };
    }
    throw new Error("Unknown annotation model kind");
  }

  function pangenomeModel(input) {
    if (input.kind === "bias") {
      const referenceMismatches = Math.max(0, input.referenceMismatches);
      const alternateMismatches = Math.max(0, input.alternateMismatches);
      const mismatchPenalty = Math.max(0, input.mismatchPenalty || 4);
      const matchScore = Math.max(0, input.matchScore || 2);
      const readLength = Math.max(1, input.readLength);
      const score = (mismatches) => (readLength - mismatches) * matchScore - mismatches * mismatchPenalty;
      const referenceScore = score(referenceMismatches);
      const alternateScore = score(alternateMismatches);
      const referenceWeight = Math.exp(referenceScore - Math.max(referenceScore, alternateScore));
      const alternateWeight = Math.exp(alternateScore - Math.max(referenceScore, alternateScore));
      return { referenceMismatches, alternateMismatches, readLength, referenceScore, alternateScore, alternateMapShare: alternateWeight / (referenceWeight + alternateWeight) };
    }
    if (input.kind === "graph") {
      const bubbles = clamp(Math.round(input.bubbles), 0, 20);
      const constrained = clamp(Math.round(input.constrained), 0, bubbles);
      return { bubbles, constrained, freeBubbles: bubbles - constrained, pathCount: Math.pow(2, bubbles - constrained) };
    }
    if (input.kind === "coordinate") {
      const scheme = input.scheme || "node";
      const fixtures = {
        node: { stable: "inside an unchanged node", breaks: "meaningless biological order across branches" },
        path: { stable: "along one named haplotype path", breaks: "changes when that path changes" },
        projected: { stable: "compatible with linear-reference tools", breaks: "novel insertions have no unique projected base" },
      };
      return Object.assign({ scheme }, fixtures[scheme] || fixtures.node);
    }
    if (input.kind === "liftover") {
      const sourceCopies = Math.max(0, Math.round(input.sourceCopies));
      const targetCopies = Math.max(0, Math.round(input.targetCopies));
      const refFlip = !!input.refFlip;
      const coordinateBijective = sourceCopies === 1 && targetCopies === 1;
      const allelesDirectlyPortable = coordinateBijective && !refFlip;
      return { sourceCopies, targetCopies, refFlip, coordinateBijective, allelesDirectlyPortable };
    }
    if (input.kind === "referenceChoice") {
      const resources = clamp(input.resources, 0, 1);
      const divergence = clamp(input.divergence, 0, 1);
      const structuralFocus = clamp(input.structuralFocus, 0, 1);
      const graphScore = 0.45 * divergence + 0.4 * structuralFocus + 0.15 * (1 - resources);
      return { resources, divergence, structuralFocus, graphScore, choice: graphScore > 0.55 ? "pangenome / matched assembly" : "GRCh38-compatible linear workflow" };
    }
    throw new Error("Unknown pangenome model kind");
  }

  function variantCallerModel(input) {
    if (input.kind === "posterior") {
      const refCount = Math.max(0, Math.round(input.refCount));
      const altCount = Math.max(0, Math.round(input.altCount));
      const q = clamp(input.quality, 0, 60);
      const error = Math.pow(10, -q / 10);
      const altFrequency = clamp(input.altFrequency, 1e-6, 1 - 1e-6);
      const refFrequency = 1 - altFrequency;
      const priors = [refFrequency * refFrequency, 2 * refFrequency * altFrequency, altFrequency * altFrequency];
      const correct = 1 - error;
      const wrong = error / 3;
      const refLikelihood = [correct, 0.5 * (correct + wrong), wrong];
      const altLikelihood = [wrong, 0.5 * (correct + wrong), correct];
      const logs = priors.map((prior, index) => Math.log(prior) + refCount * Math.log(refLikelihood[index]) + altCount * Math.log(altLikelihood[index]));
      const posteriors = normaliseLogs(logs);
      const labels = ["0/0", "0/1", "1/1"];
      const bestIndex = posteriors.indexOf(Math.max(...posteriors));
      return { refCount, altCount, q, error, altFrequency, priors, posteriors, genotype: labels[bestIndex], genotypeQuality: -10 * Math.log10(Math.max(1e-12, 1 - posteriors[bestIndex])) };
    }
    if (input.kind === "joint") {
      const cohortChromosomes = Math.max(1, input.cohortChromosomes);
      const cohortAltAlleles = clamp(Math.max(0, input.cohortAltAlleles), 0, cohortChromosomes);
      const sampleDepth = Math.max(0, input.sampleDepth);
      const sampleAltReads = clamp(Math.max(0, input.sampleAltReads), 0, sampleDepth);
      const priorFrequency = (cohortAltAlleles + 1) / (cohortChromosomes + 2);
      const samplePosterior = variantCallerModel({
        kind: "posterior",
        refCount: sampleDepth - sampleAltReads,
        altCount: sampleAltReads,
        quality: input.quality == null ? 30 : input.quality,
        altFrequency: priorFrequency,
      });
      return {
        cohortAltAlleles, cohortChromosomes, sampleAltReads, sampleDepth, priorFrequency,
        genotype: samplePosterior.genotype,
        posteriors: samplePosterior.posteriors,
        genotypeQuality: samplePosterior.genotypeQuality,
      };
    }
    if (input.kind === "filter") {
      const forwardAlt = Math.max(0, input.forwardAlt);
      const reverseAlt = Math.max(0, input.reverseAlt);
      const refCount = Math.max(0, input.refCount);
      const altCount = forwardAlt + reverseAlt;
      const alleleBalance = altCount / Math.max(1, refCount + altCount);
      const strandImbalance = Math.abs(forwardAlt - reverseAlt) / Math.max(1, altCount);
      const mappingDelta = input.altMapq - input.refMapq;
      const flags = [];
      if (strandImbalance > 0.7) flags.push("strand bias");
      if (Math.abs(alleleBalance - 0.5) > 0.3) flags.push("allele balance");
      if (mappingDelta < -15) flags.push("mapping-quality rank shift");
      return { forwardAlt, reverseAlt, refCount, altCount, alleleBalance, strandImbalance, mappingDelta, flags };
    }
    if (input.kind === "somatic") {
      const depth = Math.max(0, Math.round(input.depth));
      const vaf = clamp(input.vaf, 0, 1);
      const errorRate = clamp(input.errorRate, 0, 1);
      const threshold = Math.max(1, Math.round(input.threshold));
      const sensitivity = binomialTail(depth, threshold, vaf);
      const falsePositive = binomialTail(depth, threshold, errorRate);
      return { depth, vaf, errorRate, threshold, sensitivity, falsePositive };
    }
    if (input.kind === "callable") {
      const depth = Math.max(0, input.depth);
      const mapq = Math.max(0, input.mapq);
      const included = !!input.included;
      const referenceHasLocus = !!input.referenceHasLocus;
      const status = !referenceHasLocus ? "not representable in this reference" : !included ? "excluded before calling" : depth === 0 ? "uncovered" : mapq < 10 ? "covered but not uniquely mappable" : "callable";
      return { depth, mapq, included, referenceHasLocus, status };
    }
    throw new Error("Unknown variant-caller model kind");
  }

  function rnaSeqModel(input) {
    if (input.kind === "design") {
      const batches = input.assignment || ["control", "control", "treated", "treated"];
      const first = batches.slice(0, Math.ceil(batches.length / 2));
      const second = batches.slice(Math.ceil(batches.length / 2));
      const confounded = new Set(first).size === 1 && new Set(second).size === 1 && first[0] !== second[0];
      return { assignment: batches, confounded, estimable: !confounded };
    }
    if (input.kind === "em") {
      const uniqueA = Math.max(0, input.uniqueA);
      const uniqueB = Math.max(0, input.uniqueB);
      const ambiguous = Math.max(0, input.ambiguous);
      const lengthA = Math.max(1, input.lengthA || 1);
      const lengthB = Math.max(1, input.lengthB || 1);
      const iterations = Math.max(1, Math.round(input.iterations || 1));
      let fragmentFractionA = 0.5;
      let fragmentFractionB = 0.5;
      let allocatedA = ambiguous / 2;
      const identifiable = uniqueA + uniqueB + ambiguous > 0;
      for (let index = 0; index < iterations; index += 1) {
        allocatedA = ambiguous * fragmentFractionA / Math.max(1e-12, fragmentFractionA + fragmentFractionB);
        const countA = uniqueA + allocatedA;
        const countB = uniqueB + ambiguous - allocatedA;
        const fragmentTotal = countA + countB;
        if (fragmentTotal > 0) {
          fragmentFractionA = countA / fragmentTotal;
          fragmentFractionB = countB / fragmentTotal;
        }
      }
      const lengthCorrectedA = fragmentFractionA / lengthA;
      const lengthCorrectedB = fragmentFractionB / lengthB;
      const abundanceTotal = Math.max(1e-12, lengthCorrectedA + lengthCorrectedB);
      const abundanceA = lengthCorrectedA / abundanceTotal;
      const abundanceB = lengthCorrectedB / abundanceTotal;
      return {
        uniqueA, uniqueB, ambiguous, lengthA, lengthB, iterations,
        allocatedA, allocatedB: ambiguous - allocatedA,
        fragmentFractionA, fragmentFractionB, abundanceA, abundanceB, identifiable,
      };
    }
    if (input.kind === "normalisation") {
      const counts = input.counts || [[100, 100], [100, 100], [100, 100], [100, 1000]];
      const libraryTotals = [sum(counts.map((row) => row[0])), sum(counts.map((row) => row[1]))];
      const totalScale = libraryTotals[1] / Math.max(1e-12, libraryTotals[0]);
      const geometricMeans = counts.map((row) => Math.sqrt(Math.max(1e-12, row[0] * row[1])));
      const ratiosA = counts.map((row, index) => row[0] / geometricMeans[index]);
      const ratiosB = counts.map((row, index) => row[1] / geometricMeans[index]);
      const sizeFactors = [median(ratiosA), median(ratiosB)];
      return { counts, libraryTotals, totalScale, sizeFactors };
    }
    if (input.kind === "negativeBinomial") {
      const mean = Math.max(0, input.mean);
      const dispersion = Math.max(0, input.dispersion);
      return { mean, dispersion, poissonVariance: mean, variance: mean + dispersion * mean * mean };
    }
    if (input.kind === "composition") {
      const proportionA = clamp(input.proportionA, 0, 1);
      const expressionA = Math.max(0, input.expressionA);
      const expressionB = Math.max(0, input.expressionB);
      return { proportionA, expressionA, expressionB, bulk: proportionA * expressionA + (1 - proportionA) * expressionB };
    }
    if (input.kind === "qc") {
      const diagnoses = {
        threePrime: "RNA degradation or oligo-dT priming bias",
        rrna: "rRNA depletion / selection failure",
        genomic: "genomic DNA carryover; inspect intronic and intergenic signal",
        global: "composition or global RNA-output shift breaks total-count scaling",
      };
      return { signature: input.signature, diagnosis: diagnoses[input.signature] || diagnoses.threePrime };
    }
    throw new Error("Unknown RNA-seq model kind");
  }

  function singleCellModel(input) {
    if (input.kind === "composition") {
      const proportionA = clamp(input.proportionA, 0, 1);
      const expressionA = Math.max(0, input.expressionA);
      const expressionB = Math.max(0, input.expressionB);
      return { proportionA, expressionA, expressionB, bulk: proportionA * expressionA + (1 - proportionA) * expressionB };
    }
    if (input.kind === "compositionAlternative") {
      const current = singleCellModel({
        kind: "composition",
        proportionA: input.proportionA,
        expressionA: input.expressionA,
        expressionB: input.expressionB,
      });
      const increaseA = current.proportionA <= 0.75;
      const alternativeProportion = increaseA ? current.proportionA + 0.2 : current.proportionA - 0.2;
      const alternativeA = increaseA
        ? (current.bulk - (1 - alternativeProportion) * current.expressionB) / alternativeProportion
        : current.expressionA;
      const alternativeB = increaseA
        ? current.expressionB
        : (current.bulk - alternativeProportion * current.expressionA) / (1 - alternativeProportion);
      return {
        current,
        alternativeProportion,
        alternativeA,
        alternativeB,
        alternativeBulk: alternativeProportion * alternativeA + (1 - alternativeProportion) * alternativeB,
      };
    }
    if (input.kind === "umi") {
      const molecules = Math.max(1, input.molecules);
      const reads = Math.max(0, input.reads);
      const observed = molecules * (1 - Math.exp(-reads / molecules));
      return { molecules, reads, observed, duplicateReads: Math.max(0, reads - observed) };
    }
    if (input.kind === "zeros") {
      const mean = Math.max(0, input.mean);
      return { mean, zeroProbability: Math.exp(-mean), detectedProbability: 1 - Math.exp(-mean) };
    }
    if (input.kind === "qc") {
      const minGenes = Math.max(0, input.minGenes);
      const cellGenes = Math.max(0, input.cellGenes);
      const mitochondrialFraction = clamp(input.mitochondrialFraction, 0, 1);
      const maxMito = clamp(input.maxMito == null ? 0.15 : input.maxMito, 0, 1);
      const retained = cellGenes >= minGenes && mitochondrialFraction <= maxMito;
      return { minGenes, cellGenes, mitochondrialFraction, maxMito, retained };
    }
    if (input.kind === "pseudoreplication") {
      const donors = Math.max(1, input.donors);
      const cellsPerDonor = Math.max(1, input.cellsPerDonor);
      const intraclass = clamp(input.intraclass, 0, 1);
      const cells = donors * cellsPerDonor;
      const designEffect = 1 + (cellsPerDonor - 1) * intraclass;
      const effectiveCells = cells / designEffect;
      return { donors, cellsPerDonor, intraclass, cells, designEffect, effectiveCells };
    }
    if (input.kind === "integration") {
      const batchStrength = clamp(input.batchStrength, 0, 1);
      const conditionStrength = clamp(input.conditionStrength, 0, 1);
      const correction = clamp(input.correction, 0, 1);
      return { batchStrength, conditionStrength, correction, residualBatch: batchStrength * (1 - correction), retainedCondition: conditionStrength * (1 - 0.7 * correction) };
    }
    if (input.kind === "spatial") {
      const cellA = input.cellA || [10, 2];
      const cellB = input.cellB || [2, 10];
      const proportionA = clamp(input.proportionA, 0, 1);
      return { proportionA, spot: cellA.map((value, index) => proportionA * value + (1 - proportionA) * cellB[index]) };
    }
    throw new Error("Unknown single-cell model kind");
  }

  function epigenomeModel(input) {
    if (input.kind === "peak") {
      const chip = Math.max(0, input.chip);
      const control = Math.max(0, input.control);
      const scale = Math.max(1e-12, input.scale || 1);
      const expectedBackground = control * scale;
      const fold = chip / Math.max(1e-12, expectedBackground);
      const z = (chip - expectedBackground) / Math.sqrt(Math.max(1, expectedBackground));
      return { chip, control, scale, expectedBackground, fold, z };
    }
    if (input.kind === "footprint") {
      const occupancy = clamp(input.occupancy, 0, 1);
      const residence = clamp(input.residence, 0, 1);
      const cleavageBias = clamp(input.cleavageBias, 0, 1);
      const biologicalDip = occupancy * residence;
      const observedDip = clamp(biologicalDip + cleavageBias * (1 - biologicalDip), 0, 1);
      return { occupancy, residence, cleavageBias, biologicalDip, observedDip, falseFraction: observedDip ? cleavageBias * (1 - biologicalDip) / observedDip : 0 };
    }
    if (input.kind === "methylation") {
      const methylated = Math.max(0, input.methylated);
      const unmethylated = Math.max(0, input.unmethylated);
      const depth = methylated + unmethylated;
      const beta = depth ? methylated / depth : 0;
      const se = depth ? Math.sqrt(beta * (1 - beta) / depth) : 0;
      const conversion = clamp(input.conversion == null ? 0.99 : input.conversion, 0, 1);
      const expectedC = methylated + unmethylated * (1 - conversion);
      const expectedT = unmethylated * conversion;
      const apparentBeta = depth ? expectedC / depth : 0;
      return { methylated, unmethylated, depth, beta, se, conversion, expectedC, expectedT, apparentBeta };
    }
    if (input.kind === "composition") {
      const weightA = clamp(input.weightA, 0, 1);
      const betaA = clamp(input.betaA, 0, 1);
      const betaB = clamp(input.betaB, 0, 1);
      return { weightA, betaA, betaB, bulk: weightA * betaA + (1 - weightA) * betaB };
    }
    if (input.kind === "assay") {
      const question = input.question || "binding";
      const assays = {
        binding: { assay: "CUT&RUN / CUT&Tag", signal: "antibody-tethered cleavage", blind: "antibody specificity and occupancy timing" },
        access: { assay: "ATAC-seq", signal: "Tn5 insertion", blind: "accessibility is not regulatory function" },
        methylation: { assay: "bisulfite or native long-read", signal: "C/T conversion or current shift", blind: "bulk composition and chemistry-specific errors" },
        transcription: { assay: "PRO-seq", signal: "engaged polymerase active sites", blind: "steady-state RNA stability" },
      };
      return assays[question] || assays.binding;
    }
    if (input.kind === "causality") {
      const assay = input.assay || "mpra";
      const fixtures = {
        mpra: { claim: "sequence is sufficient in an episomal reporter", failure: "native chromatin, distance, and partners are absent" },
        crispr: { claim: "element is necessary in this endogenous context", failure: "redundancy and perturbation spread hide or blur effects" },
      };
      return Object.assign({ assay }, fixtures[assay] || fixtures.mpra);
    }
    if (input.kind === "state") {
      const marks = input.marks || {};
      const scores = {
        "active TSS": 0.45 * (marks.k4me3 || 0) + 0.35 * (marks.k27ac || 0) + 0.2 * (marks.k4me1 || 0),
        enhancer: 0.45 * (marks.k4me1 || 0) + 0.4 * (marks.k27ac || 0) + 0.15 * (1 - (marks.k4me3 || 0)),
        transcribed: 0.8 * (marks.k36me3 || 0) + 0.2 * (1 - (marks.k27me3 || 0)),
        Polycomb: 0.85 * (marks.k27me3 || 0) + 0.15 * (1 - (marks.k27ac || 0)),
      };
      const label = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
      return { marks, scores, label };
    }
    throw new Error("Unknown epigenome model kind");
  }

  models.genomeLandscape = genomeLandscapeModel;
  models.sequencer = sequencerModel;
  models.formatCoordinate = formatCoordinateModel;
  models.alignment = alignmentModel;
  models.annotation = annotationModel;
  models.pangenome = pangenomeModel;
  models.variantCaller = variantCallerModel;
  models.rnaSeq = rnaSeqModel;
  models.singleCell = singleCellModel;
  models.epigenome = epigenomeModel;

  /* Chapter 39 — Genome landscapes ------------------------------------ */

  define("genome-landscape-lab", makeObjectiveMap("ch39", [
    "Compare genome size with organismal complexity and reject the C-value hypothesis using cross-species counterexamples.",
    "Compare gene number with organismal complexity and locate the deeper G-value puzzle in regulation rather than gene count.",
    "Decompose genomes into coding, repetitive, and other sequence while keeping fractions normalized and quantitatively visible.",
    "Separate causal-role activity from selected-effect function and calculate a mutation-load upper bound with assumptions exposed.",
    "Diagnose how tandem repeats, interspersed repeats, and segmental duplications break different genomic measurements.",
    "Place extra DNA above or below the drift barrier by manipulating effective size and its per-base fitness burden.",
    "Distinguish compact and repeat-expanded organellar genomes and expose NUMT contamination as a heteroplasmy failure mode.",
  ]), function (api) {
    const { body, el, predict } = api;
    const parts = labParts(el);
    let mode = "scale";
    let species = "human";
    let mutations = 70;
    let deleteriousFraction = 0.2;
    let children = 5;
    let repeatClass = "interspersed";
    let readLength = 150;
    let repeatLength = 6000;
    let logNe = 4;
    let extraKb = 100;
    let costExponent = -10;
    let mitochondrialReads = 180;
    let numtReads = 20;
    let alternateReads = 28;

    const modeChoices = [
      { label: "Scale & composition", value: "scale" },
      { label: "Function bound", value: "function" },
      { label: "Repeat failures", value: "repeat" },
      { label: "Mutational hazard", value: "hazard" },
      { label: "Organelle trap", value: "organelle" },
    ];

    function renderScale() {
      const result = genomeLandscapeModel({ kind: "composition", species });
      parts.visual.replaceChildren(
        matrixBoard(el, ["Genome", "Genes"], Object.entries(GENOME_FIXTURES).map(([key, fixture]) => ({
          label: fixture.label + (key === species ? " •" : ""),
          values: [compact(fixture.genomeGb, 2) + " Gb", compact(fixture.genes, 0)],
          tones: key === species ? ["active", "active"] : ["muted", "muted"],
        })), "Cross-species genome sizes and protein-coding gene counts"),
        barBoard(el, [
          { label: "Protein-coding sequence", value: result.coding, display: percent(result.coding, 1), tone: "active" },
          { label: "Repetitive sequence", value: result.repeats, display: percent(result.repeats, 1), tone: "signal" },
          { label: "Other non-coding sequence", value: result.other, display: percent(result.other, 1), tone: "muted" },
        ], result.label + " genome composition", 1)
      );
      parts.controls.replaceChildren(el("div", { class: "lab-control-block" }, [
        el("span", { class: "lab-control-label", text: "Inspect one genome" }),
        choiceRow(el, Object.entries(GENOME_FIXTURES).map(([value, fixture]) => ({ label: fixture.label, value })), species, (value) => {
          species = value;
          render();
        }, "Genome fixture"),
      ]));
      parts.rail.replaceChildren(causalRail(el, [
        { key: "organism", value: result.label },
        { key: "genome", value: compact(result.genomeGb, 2) + " Gb" },
        { key: "repeat load", value: percent(result.repeats, 0) },
        { key: "gene count", value: "~" + compact(result.genes, 0) },
      ]));
      parts.explanation.innerHTML = "<strong>Genome size and gene number are separate observables.</strong> The onion and lungfish expand mainly by repeats; the pufferfish compresses its genome while retaining roughly the same animal gene inventory. Complexity therefore cannot be read from either bar alone.";
    }

    function renderFunction() {
      const result = genomeLandscapeModel({ kind: "functionBound", mutations, deleteriousFraction, children });
      const encodeLoad = mutations * 0.8 * deleteriousFraction;
      parts.visual.replaceChildren(
        statusStrip(el, [
          { label: "allowed deleterious load U", value: compact(result.mutationLoadLimit, 3), tone: "signal" },
          { label: "selected-effect bound", value: percent(result.functionalBound, 1), tone: "active" },
          { label: "load if f = 80%", value: compact(encodeLoad, 2), tone: encodeLoad > result.mutationLoadLimit ? "warning" : "signal" },
        ], "Mutation-load upper-bound calculation"),
        barBoard(el, [
          { label: "maximum selected-effect fraction", value: result.functionalBound, display: percent(result.functionalBound, 1), tone: "active" },
          { label: "biochemical activity claim", value: 0.8, display: "80%", tone: "warning" },
        ], "Selected-effect bound compared with an 80 percent biochemical-activity interpretation", 1),
        claimBoundary(el,
          "a mutation-load bound on sequence maintained by selection",
          "all biochemical activity or sequence whose presence matters but exact bases do not",
          "This arithmetic tests an interpretation of activity; it does not deny the measured activity."
        )
      );
      parts.controls.replaceChildren(
        rangeControl(el, "New mutations per zygote", mutations, { min: 40, max: 120, step: 1, format: (value) => compact(value, 0) }, (value) => { mutations = value; render(); }),
        rangeControl(el, "Deleterious fraction inside functional sequence", deleteriousFraction, { min: 0.05, max: 0.8, step: 0.05, format: (value) => percent(value, 0) }, (value) => { deleteriousFraction = value; render(); }),
        rangeControl(el, "Maximum completed family size", children, { min: 2, max: 12, step: 1, format: (value) => compact(value, 0) }, (value) => { children = value; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "mutation input", value: compact(mutations, 0) + " per zygote" },
        { key: "fitness-relevant share", value: "f × " + percent(deleteriousFraction, 0) },
        { key: "replacement bound", value: "U ≤ ln(" + compact(children / 2, 1) + ")" },
        { key: "upper bound on f", value: percent(result.functionalBound, 1) },
      ]));
      parts.explanation.innerHTML = "<strong>The conclusion belongs to the assumptions.</strong> Larger permitted families or a smaller deleterious fraction relax the ceiling; multiplicative independent fitness effects make it stricter. The useful inference is that an 80% selected-effect claim cannot be equated with an 80% activity measurement.";
    }

    function renderRepeat() {
      const result = genomeLandscapeModel({ kind: "repeat", repeatClass, readLength, repeatLength, copies: 4 });
      const repeated = "ACGTTGCA".repeat(7);
      parts.visual.replaceChildren(
        sequenceBoard(el, [
          { label: "unique flank", sequence: "…CCTGACCA", tone: "active", note: "anchors a placement" },
          { label: repeatClass + " repeat", sequence: repeated.slice(0, 42) + "…", tone: result.uniqueAnchor ? "signal" : "warning", note: compact(repeatLength, 0) + " bp repeat" },
          { label: "read / span", sequence: "─".repeat(Math.max(4, Math.min(34, Math.round(readLength / 250)))) + "▶", tone: result.uniqueAnchor ? "signal" : "warning", note: compact(readLength, 0) + " bp" },
        ], "Repeat and read-span comparison"),
        statusStrip(el, [
          { label: "failure mode", value: result.failure, tone: "warning" },
          { label: "unique flank reached?", value: result.uniqueAnchor ? "yes" : "no", tone: result.uniqueAnchor ? "signal" : "warning" },
          { label: "more depth fixes it?", value: result.uniqueAnchor ? "not needed" : "no — same ambiguity", tone: "active" },
        ], "Repeat-induced genomic tool failure")
      );
      parts.controls.replaceChildren(
        el("div", { class: "lab-control-block" }, [
          el("span", { class: "lab-control-label", text: "Repeat class" }),
          choiceRow(el, [
            { label: "Tandem array", value: "tandem" },
            { label: "Interspersed", value: "interspersed" },
            { label: "Segmental duplication", value: "segmental" },
          ], repeatClass, (value) => { repeatClass = value; render(); }, "Repeat class"),
        ]),
        rangeControl(el, "Read or molecule span", readLength, { min: 100, max: 12000, step: 100, format: (value) => compact(value, 0) + " bp" }, (value) => { readLength = value; render(); }),
        rangeControl(el, "Repeat length", repeatLength, { min: 200, max: 10000, step: 100, format: (value) => compact(value, 0) + " bp" }, (value) => { repeatLength = value; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "sequence class", value: repeatClass },
        { key: "information span", value: compact(readLength, 0) + " bp" },
        { key: "ambiguity", value: result.uniqueAnchor ? "unique flank reached" : "copies remain equivalent" },
        { key: "observed failure", value: result.failure },
      ]));
      parts.explanation.innerHTML = result.uniqueAnchor
        ? "<strong>The molecule crosses a repeat boundary.</strong> A unique flank can now assign this copy. The extra information came from span, not from merely sampling the same short sequence more deeply."
        : "<strong>This is an information limit.</strong> Every read fits several copies equally well. Tandem arrays tangle assembly length, interspersed copies erase mapping uniqueness, and segmental duplications add paralog confusion plus NAHR risk.";
    }

    function renderHazard() {
      const effectiveSize = Math.pow(10, logNe);
      const costPerBase = Math.pow(10, costExponent);
      const result = genomeLandscapeModel({ kind: "hazard", effectiveSize, extraBases: extraKb * 1000, costPerBase });
      parts.visual.replaceChildren(
        statusStrip(el, [
          { label: "effective size Ne", value: compact(effectiveSize, 0), tone: "signal" },
          { label: "fitness cost s", value: compact(result.selectionCost, 4), tone: "active" },
          { label: "2Ne·s", value: compact(result.efficacy, 2), tone: result.efficacy < 1 ? "warning" : "signal" },
        ], "Mutational-hazard drift-barrier calculation"),
        processBoard(el, [
          { label: "extra sequence arrives", value: compact(extraKb, 0) + " kb" },
          { label: "weak aggregate burden", value: "s = " + compact(result.selectionCost, 4) },
          { label: "population filter", value: "2Ne·s = " + compact(result.efficacy, 2), tone: result.efficacy < 1 ? "warning" : "signal" },
          { label: "regime", value: result.regime, tone: result.efficacy < 1 ? "warning" : "active" },
        ], "Extra-DNA burden crossing the drift barrier")
      );
      parts.controls.replaceChildren(
        rangeControl(el, "log10 effective population size", logNe, { min: 2, max: 8, step: 0.25, format: (value) => "10^" + compact(value, 2) }, (value) => { logNe = value; render(); }),
        rangeControl(el, "Extra sequence", extraKb, { min: 10, max: 1000, step: 10, format: (value) => compact(value, 0) + " kb" }, (value) => { extraKb = value; render(); }),
        rangeControl(el, "log10 fitness cost per base", costExponent, { min: -12, max: -7, step: 0.25, format: (value) => "10^" + compact(value, 2) }, (value) => { costExponent = value; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "extra DNA", value: compact(extraKb, 0) + " kb" },
        { key: "selection coefficient", value: compact(result.selectionCost, 4) },
        { key: "drift barrier", value: "2Ne·s " + (result.efficacy < 1 ? "< 1" : "≥ 1") },
        { key: "outcome", value: result.regime },
      ]));
      parts.explanation.innerHTML = "<strong>The same molecular burden can be visible to selection in one lineage and effectively invisible in another.</strong> This is a regime illustration, not a calibrated genome-size predictor: deletion bias, transposon input, recombination and ecology also matter.";
    }

    function renderOrganelle() {
      const maxAlt = mitochondrialReads + numtReads;
      alternateReads = Math.min(alternateReads, maxAlt);
      const result = genomeLandscapeModel({ kind: "heteroplasmy", mitochondrialReads, numtReads, alternateReads });
      parts.visual.replaceChildren(
        processBoard(el, [
          { label: "true mtDNA molecules", value: compact(mitochondrialReads, 0), tone: "signal" },
          { label: "NUMT look-alikes", value: compact(numtReads, 0), tone: numtReads ? "warning" : "muted" },
          { label: "alternate-support reads", value: compact(alternateReads, 0), tone: "active" },
          { label: "naive heteroplasmy", value: percent(result.observed, 1), tone: "warning" },
        ], "Nuclear mitochondrial sequence contamination of a heteroplasmy estimate"),
        barBoard(el, [
          { label: "naive alternate fraction", value: result.observed, display: percent(result.observed, 1), tone: "warning" },
          { label: "NUMT-subtracted teaching bound", value: result.corrected, display: percent(result.corrected, 1), tone: "active" },
        ], "Observed and contamination-adjusted alternate fractions", 1),
        claimBoundary(el,
          "alternate-supporting reads among molecules aligned to an mtDNA-like locus",
          "proof that every read originated in a mitochondrion",
          "Real pipelines need nuclear-aware alignment, molecule context, strand evidence, and validated NUMT catalogues."
        )
      );
      parts.controls.replaceChildren(
        rangeControl(el, "True mitochondrial reads", mitochondrialReads, { min: 20, max: 300, step: 10, format: (value) => compact(value, 0) }, (value) => { mitochondrialReads = value; alternateReads = Math.min(alternateReads, mitochondrialReads + numtReads); render(); }),
        rangeControl(el, "NUMT-derived look-alikes", numtReads, { min: 0, max: 100, step: 5, format: (value) => compact(value, 0) }, (value) => { numtReads = value; alternateReads = Math.min(alternateReads, mitochondrialReads + numtReads); render(); }),
        rangeControl(el, "Alternate-support reads", alternateReads, { min: 0, max: maxAlt, step: 1, format: (value) => compact(value, 0) }, (value) => { alternateReads = value; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "organelle genome", value: "compact mtDNA" },
        { key: "captured copies", value: compact(numtReads, 0) + " NUMT-like reads" },
        { key: "alignment", value: "origin is ambiguous" },
        { key: "reported fraction", value: percent(result.observed, 1) + " naive" },
      ]));
      parts.explanation.innerHTML = "<strong>Organelle sequence can escape into the nuclear genome.</strong> A short read that matches mtDNA is not automatically mitochondrial. This deliberately conservative subtraction shows the direction of bias, not a production estimator.";
    }

    function render() {
      parts.tabHost.replaceChildren(tabs(el, modeChoices, mode, (value) => { mode = value; render(); }));
      if (mode === "scale") renderScale();
      else if (mode === "function") renderFunction();
      else if (mode === "repeat") renderRepeat();
      else if (mode === "hazard") renderHazard();
      else renderOrganelle();
    }

    predict(body, {
      widget: "genome-landscape-lab",
      question: "An onion has about five times as much DNA as a human. Which quantity should increase roughly fivefold if genome size encoded organismal complexity directly?",
      hint: "Separate the old hypothesis from the observation that rejected it.",
      options: [
        { label: "Protein-coding gene number" },
        { label: "Organismal complexity" },
        { label: "Neither — repeat load can expand independently", correct: true },
        { label: "Per-base mutation rate" },
      ],
    }, () => {
      species = "onion";
      parts.instrument.hidden = false;
      render();
    });
    finishLab(parts, body);
  });

  /* Chapter 40 — Sequencing technologies ------------------------------- */

  define("sequencer-simulator-lab", makeObjectiveMap("ch40", [
    "Connect each sequencing platform to the physical signal it measures and the error profile produced by that measurement.",
    "Distinguish independent molecules from repeated observations of one molecule and quantify majority-consensus error under stated assumptions.",
    "Derive Lander–Waterman breadth from mean depth and contrast touched bases with heterozygote and callability requirements.",
    "Calculate somatic variant allele fraction and detection probability from tumour purity, clone fraction, depth, and a read threshold.",
    "Treat PCR duplicates as an occupancy problem and distinguish nominal reads from distinct sampled molecules.",
    "Choose WGS, exome, or panel scope and short- or long-read technology from the biological question and its information span.",
    "Require orthogonal confirmation to fail differently from the primary assay and keep confirmation inside the original claim boundary.",
  ]), function (api) {
    const { body, el, predict } = api;
    const parts = labParts(el);
    let mode = "signal";
    let platform = "illumina";
    let rawError = 0.08;
    let passes = 7;
    let depth = 15;
    let localDepth = 10;
    let tumourPurity = 0.5;
    let cloneFraction = 0.2;
    let somaticDepth = 120;
    let molecules = 200;
    let reads = 310;
    let question = "germline";

    const modeChoices = [
      { label: "Physical signal", value: "signal" },
      { label: "Consensus", value: "consensus" },
      { label: "Coverage", value: "coverage" },
      { label: "Somatic depth", value: "somatic" },
      { label: "Library occupancy", value: "library" },
      { label: "Choose & confirm", value: "design" },
    ];

    function renderSignal() {
      const result = sequencerModel({ kind: "platform", platform });
      const wave = platform === "nanopore" ? "▁▃▇▅▂▆▃▁▅▇▂▃" : platform === "sanger" ? "▁▁▂▃▇▂▁▁▅▂▁▇" : "▁▃▆▇▅▃▂▅▇▆▃▁";
      parts.visual.replaceChildren(
        el("div", { class: "genomics-signal-board", role: "img", "aria-label": result.label + " signal trace representing " + result.signal }, [
          el("span", { text: result.label + " instrument signal" }),
          el("strong", { text: wave }),
          el("small", { text: result.signal }),
        ]),
        processBoard(el, [
          { label: "physical input", value: result.molecule },
          { label: "measured signal", value: result.signal, tone: "signal" },
          { label: "decoded read", value: result.read, tone: "active" },
          { label: "best use", value: result.strength },
        ], result.label + " molecule-to-read pathway")
      );
      parts.controls.replaceChildren(el("div", { class: "lab-control-block" }, [
        el("span", { class: "lab-control-label", text: "Sequencing platform" }),
        choiceRow(el, Object.entries(PLATFORM_FIXTURES).map(([value, fixture]) => ({ label: fixture.label, value })), platform, (value) => { platform = value; render(); }, "Sequencing platform"),
      ]));
      parts.rail.replaceChildren(causalRail(el, [
        { key: "molecule", value: result.molecule },
        { key: "physics", value: result.signal },
        { key: "representative read error", value: "e ≈ " + percent(result.error, 1) },
        { key: "information span", value: result.read },
      ]));
      parts.explanation.innerHTML = "<strong>A platform name is shorthand for a physical measurement.</strong> Depth averages independent molecules; circular consensus repeatedly measures one molecule; long span crosses repeats and phases variants. The error figures are representative teaching values because chemistry and basecalling continue to change.";
    }

    function renderConsensus() {
      const result = sequencerModel({ kind: "consensus", rawError, passes });
      const observations = Array.from({ length: passes }, (_, index) => index < Math.round(rawError * passes) ? "×" : "A").join(" ");
      parts.visual.replaceChildren(
        sequenceBoard(el, [
          { label: "passes", sequence: observations, tone: "signal", note: passes + " observations of one molecule" },
          { label: "consensus", sequence: "A", tone: "active", note: "majority call" },
        ], "Repeated observations and majority consensus"),
        statusStrip(el, [
          { label: "raw error per pass", value: percent(result.rawError, 2), tone: "warning" },
          { label: "wrong votes needed", value: result.errorsNeeded + " of " + result.passes, tone: "signal" },
          { label: "independent-error consensus", value: percent(result.consensusError, 5), tone: "active" },
        ], "Majority-consensus error calculation"),
        claimBoundary(el,
          "error reduction when pass errors are independent and identically distributed",
          "systematic context errors shared across every pass",
          "Consensus cannot average away a bias that repeats in the same direction."
        )
      );
      parts.controls.replaceChildren(
        rangeControl(el, "Raw error probability", rawError, { min: 0.005, max: 0.25, step: 0.005, format: (value) => percent(value, 1) }, (value) => { rawError = value; render(); }),
        rangeControl(el, "Passes over the same molecule", passes, { min: 1, max: 15, step: 2, format: (value) => compact(value, 0) }, (value) => { passes = value; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "same molecule", value: passes + " passes" },
        { key: "raw error", value: percent(rawError, 1) + " each" },
        { key: "vote", value: result.errorsNeeded + "+ wrong passes overturn" },
        { key: "consensus error", value: percent(result.consensusError, 5) },
      ]));
      parts.explanation.innerHTML = "<strong>Redundancy within a molecule answers a different question from depth.</strong> It improves the call for that molecule. More independent molecules instead improve sampling of alleles, clones, and library diversity.";
    }

    function renderCoverage() {
      const result = sequencerModel({ kind: "coverage", depth, localDepth, genomeBases: 3.1e9 });
      const bases = Array.from({ length: 48 }, (_, index) => ({
        x: 3 + (index % 12) * 8.5,
        y: 8 + Math.floor(index / 12) * 28,
        tone: index < Math.round(48 * result.breadth) ? "active" : "warning",
      }));
      parts.visual.replaceChildren(
        dotField(el, bases, "Genome bases touched at mean depth " + depth + ". Untouched fraction " + percent(result.uncoveredFraction, 3)),
        statusStrip(el, [
          { label: "Poisson breadth", value: percent(result.breadth, 5), tone: "active" },
          { label: "expected untouched bases", value: compact(result.uncoveredBases, 2), tone: result.uncoveredBases > 1 ? "warning" : "signal" },
          { label: "one haplotype only at local d", value: percent(result.oneHaplotypeOnly, 3), tone: "warning" },
        ], "Coverage breadth and heterozygote-sampling limits")
      );
      parts.controls.replaceChildren(
        rangeControl(el, "Mean genome depth", depth, { min: 0, max: 30, step: 1, format: (value) => compact(value, 0) + "×" }, (value) => { depth = value; render(); }),
        rangeControl(el, "Local depth at one heterozygous site", localDepth, { min: 0, max: 30, step: 1, format: (value) => compact(value, 0) + " reads" }, (value) => { localDepth = value; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "random starts", value: "mean C = " + depth + "×" },
        { key: "zero-read probability", value: "e^-C = " + percent(result.uncoveredFraction, 4) },
        { key: "breadth", value: percent(result.breadth, 4) },
        { key: "callability", value: "also needs both alleles + unique mapping" },
      ]));
      parts.explanation.innerHTML = "<strong>Touched is not callable.</strong> The Poisson model predicts breadth under uniform sampling. Real GC bias and mappability thicken the low-depth tail, while a heterozygote can still be missed when every local read samples the same chromosome.";
    }

    function renderSomatic() {
      const result = sequencerModel({ kind: "somatic", tumourPurity, cloneFraction, copiesWithVariant: 0.5, depth: somaticDepth, minimumReads: 3 });
      parts.visual.replaceChildren(
        processBoard(el, [
          { label: "tumour purity", value: percent(tumourPurity, 0) },
          { label: "clone fraction", value: percent(cloneFraction, 0) },
          { label: "one altered copy", value: "½ of tumour-clone alleles" },
          { label: "expected VAF", value: percent(result.vaf, 2), tone: "active" },
        ], "Somatic dilution from specimen to observed variant fraction"),
        statusStrip(el, [
          { label: "depth", value: compact(result.depth, 0) + "×", tone: "signal" },
          { label: "expected alternate reads", value: compact(result.expectedReads, 2), tone: "active" },
          { label: "P(at least 3 reads)", value: percent(result.detection, 1), tone: result.detection < 0.95 ? "warning" : "signal" },
        ], "Somatic read-detection probability")
      );
      parts.controls.replaceChildren(
        rangeControl(el, "Tumour purity", tumourPurity, { min: 0.1, max: 1, step: 0.05, format: (value) => percent(value, 0) }, (value) => { tumourPurity = value; render(); }),
        rangeControl(el, "Fraction of tumour cells in clone", cloneFraction, { min: 0.02, max: 1, step: 0.02, format: (value) => percent(value, 0) }, (value) => { cloneFraction = value; render(); }),
        rangeControl(el, "Sequencing depth", somaticDepth, { min: 20, max: 500, step: 10, format: (value) => compact(value, 0) + "×" }, (value) => { somaticDepth = value; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "specimen mixture", value: percent(tumourPurity, 0) + " tumour" },
        { key: "subclone", value: percent(cloneFraction, 0) + " of tumour" },
        { key: "observed VAF", value: percent(result.vaf, 2) },
        { key: "sampling power", value: percent(result.detection, 1) + " for ≥3" },
      ]));
      parts.explanation.innerHTML = "<strong>Somatic depth is driven by dilution, not a universal convention.</strong> This fixture assumes a diploid, copy-neutral locus with one altered copy; copy-number change and loss of heterozygosity alter the expected VAF. Below the molecular-input floor, additional reads revisit the same originals.";
    }

    function renderLibrary() {
      const result = sequencerModel({ kind: "duplicates", molecules: molecules * 1e6, reads: reads * 1e6 });
      parts.visual.replaceChildren(
        barBoard(el, [
          { label: "read pairs sequenced", value: result.reads, display: compact(result.reads / 1e6, 0) + " M", tone: "signal" },
          { label: "distinct molecules observed", value: result.distinct, display: compact(result.distinct / 1e6, 1) + " M", tone: "active" },
          { label: "duplicate reads", value: result.reads - result.distinct, display: compact((result.reads - result.distinct) / 1e6, 1) + " M", tone: "warning" },
        ], "Library occupancy and duplicate reads", result.reads),
        statusStrip(el, [
          { label: "library complexity M", value: compact(result.molecules / 1e6, 0) + " M" },
          { label: "sampling intensity N/M", value: compact(result.reads / result.molecules, 2), tone: "signal" },
          { label: "duplicate fraction", value: percent(result.duplicateFraction, 1), tone: result.duplicateFraction > 0.4 ? "warning" : "active" },
        ], "Duplicate fraction from occupancy")
      );
      parts.controls.replaceChildren(
        rangeControl(el, "Distinct library molecules", molecules, { min: 50, max: 1000, step: 10, format: (value) => compact(value, 0) + " M" }, (value) => { molecules = value; render(); }),
        rangeControl(el, "Read pairs sampled", reads, { min: 50, max: 1000, step: 10, format: (value) => compact(value, 0) + " M" }, (value) => { reads = value; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "input library", value: compact(molecules, 0) + " M molecules" },
        { key: "sampling", value: compact(reads, 0) + " M draws" },
        { key: "collisions", value: percent(result.duplicateFraction, 1) + " duplicates" },
        { key: "independent depth", value: compact(result.distinct / 1e6, 1) + " M molecules" },
      ]));
      parts.explanation.innerHTML = "<strong>Duplicate reads are not independent evidence.</strong> High duplication can mean the library contained too few distinct molecules; sequencing harder cannot recreate molecules that never entered the tube.";
    }

    function renderDesign() {
      const designs = {
        germline: { label: "small germline SNVs", scope: "PCR-free WGS", platform: "Illumina", confirmation: "Sanger or independent long-read locus", boundary: "short-read-inaccessible regions remain outside the negative result" },
        repeat: { label: "repeat expansion and phasing", scope: "whole-genome long-read", platform: "PacBio HiFi or nanopore", confirmation: "repeat-primed PCR / Southern or second long-read chemistry", boundary: "blood length may not equal affected-tissue somatic length" },
        tumour: { label: "low-VAF tumour hotspot", scope: "UMI-tagged deep panel", platform: "short-read consensus", confirmation: "independent extraction and error-suppressed assay", boundary: "panel-negative means negative only in targeted callable loci" },
        methylation: { label: "haplotype-resolved methylation", scope: "native long-read WGS", platform: "nanopore", confirmation: "conversion-based assay at selected loci", boundary: "current-derived modification calls remain model-dependent" },
      };
      const design = designs[question];
      parts.visual.replaceChildren(
        processBoard(el, [
          { label: "question", value: design.label },
          { label: "scope", value: design.scope, tone: "signal" },
          { label: "measurement", value: design.platform, tone: "active" },
          { label: "orthogonal check", value: design.confirmation },
        ], "Question-to-platform design"),
        claimBoundary(el,
          "the sequence or modification class reachable by the chosen scope and platform",
          design.boundary,
          "Confirmation is orthogonal only when its failure mode is not inherited from the primary assay."
        )
      );
      parts.controls.replaceChildren(el("div", { class: "lab-control-block" }, [
        el("span", { class: "lab-control-label", text: "Biological question" }),
        choiceRow(el, [
          { label: "Germline SNVs", value: "germline" },
          { label: "Repeat expansion", value: "repeat" },
          { label: "Low-VAF tumour", value: "tumour" },
          { label: "Native methylation", value: "methylation" },
        ], question, (value) => { question = value; render(); }, "Sequencing design question"),
      ]));
      parts.rail.replaceChildren(causalRail(el, [
        { key: "question", value: design.label },
        { key: "required information", value: design.scope },
        { key: "platform", value: design.platform },
        { key: "negative-result boundary", value: design.boundary },
      ]));
      parts.explanation.innerHTML = "<strong>Choose by the missing information, not by brand.</strong> Depth buys independent sampling, molecule consensus buys per-molecule accuracy, and physical span buys access through repeats and haplotypes.";
    }

    function render() {
      parts.tabHost.replaceChildren(tabs(el, modeChoices, mode, (value) => { mode = value; render(); }));
      if (mode === "signal") renderSignal();
      else if (mode === "consensus") renderConsensus();
      else if (mode === "coverage") renderCoverage();
      else if (mode === "somatic") renderSomatic();
      else if (mode === "library") renderLibrary();
      else renderDesign();
    }

    predict(body, {
      widget: "sequencer-simulator-lab",
      question: "A 6 kb repeat is identical at four loci. Which change can make one molecule placeable?",
      hint: "More observations and more span are not the same resource.",
      options: [
        { label: "Sequence more 150 bp reads" },
        { label: "Raise every short-read quality score" },
        { label: "Use molecules long enough to reach a unique flank", correct: true },
        { label: "Convert read depth to breadth" },
      ],
    }, () => {
      platform = "pacbio";
      parts.instrument.hidden = false;
      render();
    });
    finishLab(parts, body);
  });

  /* Chapter 41 — Data formats and coordinates -------------------------- */

  define("format-coordinate-lab", makeObjectiveMap("ch41", [
    "Trace one molecule through FASTA, FASTQ, SAM, VCF, BED, and GFF3 and distinguish sequence, evidence, alignment, and annotation records.",
    "Convert Phred quality to error probability and printable encoding while detecting the asymmetric legacy-offset trap.",
    "Decode SAM FLAG bitfields and CIGAR operations, including query length, reference span, and inclusive alignment end.",
    "Normalise equivalent VCF records by trimming, decomposing, and left-aligning instead of treating text identity as variant identity.",
    "Convert exactly between zero-based half-open and one-based inclusive intervals without changing the represented bases.",
    "Connect block compression and hierarchical binning to random access over genomic intervals rather than whole-file decompression.",
    "Reject unsafe coordinate transfer when a build has no unique image or the lifted REF allele disagrees with the target FASTA.",
  ]), function (api) {
    const { body, el, predict } = api;
    const parts = labParts(el);
    let mode = "records";
    let q = 30;
    let offset = 33;
    let flag = 163;
    let cigar = "3S8M2D6M2I4M";
    let coordinateSystem = "bed";
    let intervalStart = 10;
    let intervalEnd = 20;
    let normaliseFixture = "homopolymer";
    let hasImage = true;
    let unique = true;
    let refMatches = true;

    const modeChoices = [
      { label: "Record chain", value: "records" },
      { label: "Phred decoder", value: "phred" },
      { label: "FLAG + CIGAR", value: "sam" },
      { label: "VCF normaliser", value: "vcf" },
      { label: "Intervals", value: "coordinates" },
      { label: "Index + build", value: "build" },
    ];

    function renderRecords() {
      parts.visual.replaceChildren(
        sequenceBoard(el, [
          { label: "FASTA", sequence: ">molecule_42  ACGTTGCA", tone: "muted", note: "named sequence; no qualities" },
          { label: "FASTQ", sequence: "@molecule_42  ACGTTGCA  +  IIIIH?5+", tone: "signal", note: "one confidence character per base" },
          { label: "SAM", sequence: "read42  163  chr20  11  60  8M", tone: "active", note: "placement hypothesis plus confidence" },
          { label: "VCF", sequence: "chr20  14  .  T  G  52  PASS", tone: "warning", note: "difference from a named reference build" },
          { label: "BED", sequence: "chr20  10  20  target", tone: "signal", note: "0-based half-open interval" },
          { label: "GFF3", sequence: "chr20  .  exon  11  20  .  +", tone: "active", note: "1-based inclusive annotation" },
        ], "One molecule represented in common genomics formats"),
        claimBoundary(el,
          "a file-format record and the coordinate/reference assumptions declared with it",
          "the biological truth of the sequence, placement, variant, or annotation",
          "Each downstream format adds an inference. Parsing a record is not the same as validating its claim."
        )
      );
      parts.controls.replaceChildren(processBoard(el, [
        { label: "sequence", value: "FASTA" },
        { label: "measurement", value: "FASTQ" },
        { label: "alignment", value: "SAM/BAM/CRAM" },
        { label: "difference / feature", value: "VCF or BED/GFF3", tone: "active" },
      ], "Representation chain from molecule to downstream record"));
      parts.rail.replaceChildren(causalRail(el, [
        { key: "molecule", value: "ACGTTGCA" },
        { key: "measurement", value: "bases + Phred qualities" },
        { key: "hypothesis", value: "alignment to chr20" },
        { key: "derived record", value: "variant or annotated interval" },
      ]));
      parts.explanation.innerHTML = "<strong>The same letters acquire different meanings as metadata accumulates.</strong> FASTQ reports a measurement, SAM a placement hypothesis, VCF a difference from one build, and BED/GFF an interval under an explicit coordinate convention.";
    }

    function renderPhred() {
      const result = formatCoordinateModel({ kind: "phred", q, offset });
      const interpretedQ = result.character.charCodeAt(0) - (offset === 33 ? 64 : 33);
      parts.visual.replaceChildren(
        statusStrip(el, [
          { label: "quality Q", value: compact(result.q, 0), tone: "signal" },
          { label: "P(error)", value: compact(result.error, 6), tone: "active" },
          { label: "accuracy", value: percent(result.accuracy, 4) },
          { label: "stored character", value: result.character, tone: "warning" },
        ], "Phred quality encoding"),
        sequenceBoard(el, [
          { label: "sequence", sequence: "ACGTTGCA", tone: "active" },
          { label: "quality", sequence: result.character.repeat(8), tone: "signal", note: "ASCII code " + result.character.charCodeAt(0) + " = Q " + result.q + " + offset " + result.offset },
        ], "FASTQ base qualities aligned one-to-one with sequence"),
        statusStrip(el, [
          { label: "if decoded with wrong offset", value: "Q " + interpretedQ, tone: "warning" },
          { label: "direction of failure", value: offset === 64 ? "old +64 read as +33 → overconfident" : "modern +33 read as +64 → negative / crash", tone: "warning" },
        ], "Legacy FASTQ offset trap")
      );
      parts.controls.replaceChildren(
        rangeControl(el, "Phred quality", q, { min: 0, max: 50, step: 1, format: (value) => "Q" + compact(value, 0) }, (value) => { q = value; render(); }),
        el("div", { class: "lab-control-block" }, [
          el("span", { class: "lab-control-label", text: "Encoding offset" }),
          choiceRow(el, [{ label: "Phred+33", value: 33 }, { label: "legacy Phred+64", value: 64 }], offset, (value) => { offset = value; render(); }, "FASTQ quality encoding"),
        ])
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "caller uncertainty", value: "P(error) = " + compact(result.error, 5) },
        { key: "log transform", value: "Q = −10 log10 P" },
        { key: "byte encoding", value: "Q + " + result.offset },
        { key: "FASTQ glyph", value: result.character },
      ]));
      parts.explanation.innerHTML = "<strong>Ten Phred points are a tenfold change in error probability.</strong> The printable character is storage, not evidence. A wrong legacy offset silently turns weak bases into apparently excellent ones in the dangerous direction.";
    }

    function renderSam() {
      const flagResult = formatCoordinateModel({ kind: "flag", flag });
      const cigarResult = formatCoordinateModel({ kind: "cigar", cigar, start: 11 });
      parts.visual.replaceChildren(
        sequenceBoard(el, [
          { label: "SAM record", sequence: "read42  " + flag + "  chr20  11  60  " + cigar, tone: "active" },
          { label: "FLAG bits", sequence: flagResult.labels.join(" · ") || "none", tone: "signal" },
          { label: "CIGAR ops", sequence: cigarResult.operations.map((item) => item.length + item.op).join("  "), tone: "warning" },
        ], "Decoded SAM FLAG and CIGAR record"),
        statusStrip(el, [
          { label: "query-consuming length", value: compact(cigarResult.queryLength, 0) + " bp", tone: "signal" },
          { label: "reference span", value: compact(cigarResult.referenceSpan, 0) + " bp", tone: "active" },
          { label: "inclusive reference interval", value: cigarResult.start + "–" + cigarResult.end, tone: "warning" },
        ], "CIGAR query and reference accounting")
      );
      parts.controls.replaceChildren(
        el("div", { class: "lab-control-block" }, [
          el("span", { class: "lab-control-label", text: "FLAG fixture" }),
          choiceRow(el, [
            { label: "163 paired", value: 163 },
            { label: "16 reverse", value: 16 },
            { label: "4 unmapped", value: 4 },
            { label: "2064 supplementary", value: 2064 },
          ], flag, (value) => { flag = value; render(); }, "SAM FLAG fixture"),
        ]),
        el("div", { class: "lab-control-block" }, [
          el("span", { class: "lab-control-label", text: "CIGAR fixture" }),
          choiceRow(el, [
            { label: "8M", value: "8M" },
            { label: "3S8M2D6M2I4M", value: "3S8M2D6M2I4M" },
            { label: "12M90N18M", value: "12M90N18M" },
          ], cigar, (value) => { cigar = value; render(); }, "CIGAR fixture"),
        ])
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "bitfield", value: String(flag) },
        { key: "record state", value: flagResult.labels.join(", ") || "no flags" },
        { key: "alignment operations", value: cigar },
        { key: "reference interval", value: cigarResult.start + "–" + cigarResult.end },
      ]));
      parts.explanation.innerHTML = "<strong>Query length and reference span are different ledgers.</strong> Soft clips and insertions consume the read; deletions and introns consume the reference. FLAG is additive binary state, not one categorical code.";
    }

    function renderVcf() {
      const result = formatCoordinateModel({ kind: "normalise", fixture: normaliseFixture });
      parts.visual.replaceChildren(
        sequenceBoard(el, [
          { label: "input", sequence: result.before, tone: "warning", note: "valid but non-canonical representation" },
          { label: "operation", sequence: result.operation, tone: "signal" },
          { label: "canonical", sequence: result.after, tone: "active", note: "compare variants only after normalization" },
        ], "VCF normalization transformation"),
        claimBoundary(el,
          "one canonical text representation relative to this reference build",
          "a build-independent biological object",
          "REF, coordinate, and left-alignment all depend on the chosen reference sequence."
        )
      );
      parts.controls.replaceChildren(el("div", { class: "lab-control-block" }, [
        el("span", { class: "lab-control-label", text: "Normalization fixture" }),
        choiceRow(el, [
          { label: "Left-align indel", value: "homopolymer" },
          { label: "Trim shared bases", value: "trim" },
          { label: "Split multiallelic", value: "multi" },
        ], normaliseFixture, (value) => { normaliseFixture = value; render(); }, "VCF normalization fixture"),
      ]));
      parts.rail.replaceChildren(causalRail(el, [
        { key: "equivalent allele", value: result.before },
        { key: "normalization", value: result.operation },
        { key: "canonical record", value: result.after },
        { key: "comparison", value: "now text identity is meaningful" },
      ]));
      parts.explanation.innerHTML = "<strong>One biological indel can have many valid VCF strings.</strong> Normalize before joining callsets, annotating, or counting concordance; otherwise representation differences masquerade as biological disagreement.";
    }

    function renderCoordinates() {
      const safeStart = coordinateSystem === "bed" ? Math.max(0, intervalStart) : Math.max(1, intervalStart);
      intervalStart = safeStart;
      intervalEnd = Math.max(intervalStart + (coordinateSystem === "bed" ? 1 : 0), intervalEnd);
      const result = formatCoordinateModel({ kind: "coordinate", system: coordinateSystem, start: intervalStart, end: intervalEnd });
      const cells = Array.from({ length: 12 }, (_, index) => {
        const baseOne = index + 1;
        const included = coordinateSystem === "bed"
          ? index >= result.start && index < result.end
          : baseOne >= result.start && baseOne <= result.end;
        return { x: 4 + index * 8.2, y: 48, tone: included ? "active" : "muted" };
      });
      parts.visual.replaceChildren(
        dotField(el, cells, "Twelve bases with the represented interval highlighted"),
        statusStrip(el, [
          { label: "source", value: result.source + " " + result.start + "–" + result.end, tone: "signal" },
          { label: "length", value: compact(result.length, 0) + " bases", tone: "active" },
          { label: "converted", value: result.target + " " + result.targetStart + "–" + result.targetEnd, tone: "warning" },
        ], "Coordinate-system conversion preserving the same bases")
      );
      parts.controls.replaceChildren(
        el("div", { class: "lab-control-block" }, [
          el("span", { class: "lab-control-label", text: "Source convention" }),
          choiceRow(el, [{ label: "BED 0-based half-open", value: "bed" }, { label: "GFF/VCF 1-based inclusive", value: "gff" }], coordinateSystem, (value) => {
            if (value !== coordinateSystem) {
              const current = formatCoordinateModel({ kind: "coordinate", system: coordinateSystem, start: intervalStart, end: intervalEnd });
              intervalStart = current.targetStart;
              intervalEnd = current.targetEnd;
            }
            coordinateSystem = value;
            render();
          }, "Coordinate system"),
        ]),
        rangeControl(el, "Interval start", intervalStart, { min: coordinateSystem === "bed" ? 0 : 1, max: 10, step: 1, format: (value) => compact(value, 0) }, (value) => { intervalStart = value; intervalEnd = Math.max(intervalEnd, value + (coordinateSystem === "bed" ? 1 : 0)); render(); }),
        rangeControl(el, "Interval end", intervalEnd, { min: intervalStart + (coordinateSystem === "bed" ? 1 : 0), max: 12, step: 1, format: (value) => compact(value, 0) }, (value) => { intervalEnd = value; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "same physical bases", value: compact(result.length, 0) + " highlighted" },
        { key: "source", value: result.source },
        { key: "boundary rule", value: coordinateSystem === "bed" ? "start included, end excluded" : "both ends included" },
        { key: "target", value: result.targetStart + "–" + result.targetEnd },
      ]));
      parts.explanation.innerHTML = "<strong>Convert the boundary, not the biology.</strong> BED [10,20) and GFF 11–20 name the same ten bases. Length is the invariant that exposes most off-by-one errors.";
    }

    function renderBuild() {
      const result = formatCoordinateModel({ kind: "liftover", hasImage, unique, refMatches });
      parts.visual.replaceChildren(
        processBoard(el, [
          { label: "compressed blocks", value: "BGZF-compatible chunks" },
          { label: "binning index", value: "coarse-to-fine genomic bins", tone: "signal" },
          { label: "seek", value: "read only overlapping blocks", tone: "active" },
          { label: "coordinate payload", value: "still tied to one build" },
        ], "Random-access indexing pipeline"),
        statusStrip(el, [
          { label: "target image exists", value: hasImage ? "yes" : "no", tone: hasImage ? "signal" : "warning" },
          { label: "mapping unique", value: unique ? "yes" : "no", tone: unique ? "signal" : "warning" },
          { label: "REF matches target", value: refMatches ? "yes" : "no", tone: refMatches ? "signal" : "warning" },
          { label: "liftover verdict", value: result.status, tone: result.status.startsWith("usable") ? "active" : "warning" },
        ], "Build-transfer validation")
      );
      parts.controls.replaceChildren(
        el("div", { class: "lab-control-block" }, [
          el("span", { class: "lab-control-label", text: "Does the interval have a target image?" }),
          choiceRow(el, [{ label: "Image exists", value: true }, { label: "No target image", value: false }], hasImage, (value) => { hasImage = value; render(); }, "Target image existence"),
        ]),
        el("div", { class: "lab-control-block" }, [
          el("span", { class: "lab-control-label", text: "Is the image unique?" }),
          choiceRow(el, [{ label: "Unique", value: true }, { label: "Multiple targets", value: false }], unique, (value) => { unique = value; render(); }, "Liftover uniqueness"),
        ]),
        el("div", { class: "lab-control-block" }, [
          el("span", { class: "lab-control-label", text: "Target FASTA check" }),
          choiceRow(el, [{ label: "REF matches", value: true }, { label: "REF mismatch", value: false }], refMatches, (value) => { refMatches = value; render(); }, "Target reference check"),
        ])
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "source coordinate", value: "build A" },
        { key: "chain map", value: hasImage ? (unique ? "one image" : "multiple images") : "no image" },
        { key: "target FASTA", value: refMatches ? "REF confirmed" : "REF disagrees" },
        { key: "decision", value: result.status },
      ]));
      parts.explanation.innerHTML = "<strong>Liftover is a partial mapping, not a renaming operation.</strong> Indexes accelerate access inside one coordinate space; they do not repair a build mismatch. Recheck REF against the target sequence every time.";
    }

    function render() {
      parts.tabHost.replaceChildren(tabs(el, modeChoices, mode, (value) => { mode = value; render(); }));
      if (mode === "records") renderRecords();
      else if (mode === "phred") renderPhred();
      else if (mode === "sam") renderSam();
      else if (mode === "vcf") renderVcf();
      else if (mode === "coordinates") renderCoordinates();
      else renderBuild();
    }

    predict(body, {
      widget: "format-coordinate-lab",
      question: "BED interval chr1:10–20 and GFF3 interval chr1:11–20 describe how many bases?",
      hint: "BED excludes its end; GFF includes both endpoints.",
      options: [
        { label: "9" },
        { label: "10", correct: true },
        { label: "11" },
        { label: "They cannot describe the same interval" },
      ],
    }, () => {
      mode = "coordinates";
      coordinateSystem = "bed";
      intervalStart = 10;
      intervalEnd = 20;
      parts.instrument.hidden = false;
      render();
    });
    finishLab(parts, body);
  });

  /* Chapter 42 — Read alignment --------------------------------------- */

  define("alignment-workbench-lab", makeObjectiveMap("ch42", [
    "Quantify why naive genome scanning is computationally impossible and execute backward search over a hand-built BWT/FM index.",
    "Use the pigeonhole guarantee to choose exact seeds for approximate alignment and distinguish indexing from seed-and-extend.",
    "Compare linear and affine gap costs and connect one gap-opening event plus extension to the biology of an indel or intron.",
    "Turn competing alignment scores into a softmax placement probability and Phred-scaled MAPQ while preserving aligner dependence.",
    "Separate algorithmic failures from information limits by comparing molecule span with the length of an identical repeat.",
    "Predict the direction and persistence of reference bias when alternate-bearing reads receive systematically worse scores.",
    "Diagnose BAM failure signatures from insert size, MAPQ, soft clipping, and coverage instead of treating each as generic low quality.",
  ]), function (api) {
    const { body, el, predict } = api;
    const parts = labParts(el);
    let mode = "scale";
    let readsMillions = 600;
    let readLength = 150;
    let bwtPattern = "TA";
    let allowedErrors = 2;
    let gapLength = 12;
    let gapOpen = 6;
    let gapExtend = 1;
    let bestScore = 100;
    let runnerScore = 94;
    let repeatLength = 6000;
    let insertSize = 450;
    let altPenalty = 8;
    let failureSignature = "clips";

    const modeChoices = [
      { label: "Search scale", value: "scale" },
      { label: "FM index", value: "fm" },
      { label: "Seeds", value: "seed" },
      { label: "Gap biology", value: "gap" },
      { label: "MAPQ + repeats", value: "mapq" },
      { label: "Bias", value: "bias" },
      { label: "BAM signatures", value: "bam" },
    ];

    function renderScale() {
      const result = alignmentModel({ kind: "scale", reads: readsMillions * 1e6, genomeBases: 3.1e9, readLength, comparisonsPerSecond: 1e9 });
      parts.visual.replaceChildren(
        statusStrip(el, [
          { label: "reads", value: compact(result.reads, 1), tone: "signal" },
          { label: "candidate starts", value: "3.1 Gb each" },
          { label: "base comparisons", value: compact(result.comparisons, 2), tone: "warning" },
          { label: "at 10^9 comparisons/s", value: compact(result.coreYears, 2) + " core-years", tone: "warning" },
        ], "Naive read-alignment complexity"),
        processBoard(el, [
          { label: "naive scan", value: "every read × every genome start" },
          { label: "string index", value: "reuse reference structure", tone: "signal" },
          { label: "seed", value: "find plausible loci" },
          { label: "extend", value: "score biological differences", tone: "active" },
        ], "Complexity reduction from scanning to seed-and-extend")
      );
      parts.controls.replaceChildren(
        rangeControl(el, "Read pairs", readsMillions, { min: 10, max: 1000, step: 10, format: (value) => compact(value, 0) + " M" }, (value) => { readsMillions = value; render(); }),
        rangeControl(el, "Read length", readLength, { min: 50, max: 300, step: 10, format: (value) => compact(value, 0) + " bp" }, (value) => { readLength = value; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "input", value: compact(readsMillions, 0) + " M × " + readLength + " bp" },
        { key: "naive candidates", value: "3.1 billion/read" },
        { key: "work", value: compact(result.comparisons, 2) + " comparisons" },
        { key: "solution", value: "index once, seed, then extend" },
      ]));
      parts.explanation.innerHTML = "<strong>The index changes repeated search, not the biology.</strong> Exact lookup can run with pattern length, but real reads contain errors and variants; seed-and-extend restricts the expensive alignment to plausible loci.";
    }

    function renderFm() {
      const result = alignmentModel({ kind: "bwt", text: "GATTACA", pattern: bwtPattern });
      parts.visual.replaceChildren(
        matrixBoard(el, ["sorted rotation", "last L"], result.bwt.rotations.map((row, index) => ({
          label: String(index),
          values: [row.rotation, row.rotation[row.rotation.length - 1]],
          tones: index >= result.low && index < result.high ? ["active", "active"] : ["muted", "muted"],
        })), "Burrows-Wheeler matrix for GATTACA with matching suffix-array interval highlighted"),
        statusStrip(el, [
          { label: "BWT last column", value: result.bwt.last, tone: "signal" },
          { label: "query", value: result.pattern, tone: "active" },
          { label: "FM interval", value: "[" + result.low + ", " + result.high + ")" },
          { label: "matches", value: compact(result.count, 0), tone: result.count ? "active" : "warning" },
        ], "Backward-search result")
      );
      parts.controls.replaceChildren(el("div", { class: "lab-control-block" }, [
        el("span", { class: "lab-control-label", text: "Search pattern" }),
        choiceRow(el, [{ label: "TA", value: "TA" }, { label: "ACA", value: "ACA" }, { label: "GAT", value: "GAT" }, { label: "GG", value: "GG" }], bwtPattern, (value) => { bwtPattern = value; render(); }, "FM-index pattern"),
      ]));
      parts.rail.replaceChildren(causalRail(el, [
        { key: "pattern", value: bwtPattern },
        { key: "read backwards", value: [...bwtPattern].reverse().join(" → ") },
        { key: "LF intervals", value: result.trace.map((step) => "[" + step.low + "," + step.high + ")").join(" → ") },
        { key: "suffix positions", value: result.positions.length ? result.positions.join(", ") : "none" },
      ]));
      parts.explanation.innerHTML = "<strong>Backward search shrinks a suffix-array interval one character at a time.</strong> The BWT makes identical preceding characters contiguous, so C and Occ update the interval without scanning the original text.";
    }

    function renderSeed() {
      const result = alignmentModel({ kind: "seed", readLength, errors: allowedErrors });
      const segmentText = Array.from({ length: result.guaranteedSegments }, (_, index) => "S" + (index + 1) + ":" + result.guaranteedExactSeed).join(" | ");
      parts.visual.replaceChildren(
        sequenceBoard(el, [
          { label: "read partition", sequence: segmentText, tone: "signal", note: result.guaranteedSegments + " segments for at most " + allowedErrors + " errors" },
          { label: "guarantee", sequence: "at least one segment has 0 errors", tone: "active" },
        ], "Pigeonhole seed guarantee"),
        statusStrip(el, [
          { label: "read length", value: compact(readLength, 0) + " bp" },
          { label: "allowed errors", value: compact(allowedErrors, 0), tone: "warning" },
          { label: "exact segments", value: compact(result.guaranteedSegments, 0), tone: "signal" },
          { label: "guaranteed seed length", value: compact(result.guaranteedExactSeed, 0) + " bp", tone: "active" },
        ], "Exact-seed guarantee under bounded errors")
      );
      parts.controls.replaceChildren(
        rangeControl(el, "Read length", readLength, { min: 50, max: 300, step: 10, format: (value) => compact(value, 0) + " bp" }, (value) => { readLength = value; render(); }),
        rangeControl(el, "Maximum substitutions or indels", allowedErrors, { min: 0, max: 6, step: 1, format: (value) => compact(value, 0) }, (value) => { allowedErrors = value; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "read", value: readLength + " bp" },
        { key: "error budget", value: allowedErrors + " differences" },
        { key: "partition", value: result.guaranteedSegments + " segments" },
        { key: "exact anchor", value: "≥ " + result.guaranteedExactSeed + " bp" },
      ]));
      parts.explanation.innerHTML = "<strong>With e errors, split into e+1 segments: at least one must be exact.</strong> Shorter seeds find more candidates; longer seeds are more unique but lose sensitivity when an error lands inside them.";
    }

    function renderGap() {
      const result = alignmentModel({ kind: "affine", gapLength, gapOpen, gapExtend, linearPenalty: 2 });
      parts.visual.replaceChildren(
        sequenceBoard(el, [
          { label: "reference", sequence: "ACGTTGCA" + "─".repeat(Math.min(20, gapLength)) + "GGTAC", tone: "muted" },
          { label: "read", sequence: "ACGTTGCA" + " ".repeat(Math.min(20, gapLength)) + "GGTAC", tone: "active", note: gapLength + " bp deletion / skipped interval" },
        ], "One biological gap represented as an alignment event"),
        barBoard(el, [
          { label: "affine: open + extensions", value: result.affineCost, display: compact(result.affineCost, 1), tone: "active" },
          { label: "linear per-base cost", value: result.linearCost, display: compact(result.linearCost, 1), tone: "signal" },
          { label: "re-open for every base", value: result.repeatedOpenCost, display: compact(result.repeatedOpenCost, 1), tone: "warning" },
        ], "Gap-penalty models", Math.max(result.linearCost, result.repeatedOpenCost))
      );
      parts.controls.replaceChildren(
        rangeControl(el, "Gap length", gapLength, { min: 1, max: 100, step: 1, format: (value) => compact(value, 0) + " bp" }, (value) => { gapLength = value; render(); }),
        rangeControl(el, "Gap-open cost", gapOpen, { min: 1, max: 15, step: 1, format: (value) => compact(value, 0) }, (value) => { gapOpen = value; render(); }),
        rangeControl(el, "Gap-extension cost", gapExtend, { min: 0, max: 3, step: 0.25, format: (value) => compact(value, 2) }, (value) => { gapExtend = value; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "biological event", value: "one " + gapLength + " bp gap" },
        { key: "initiation", value: "open cost " + gapOpen },
        { key: "continuation", value: (gapLength - 1) + " × " + gapExtend },
        { key: "affine cost", value: compact(result.affineCost, 2) },
      ]));
      parts.explanation.innerHTML = "<strong>Affine penalties encode that one long indel is likelier than many independent one-base indels.</strong> Spliced aligners go further: a canonical intron is a separate biological state, not merely a cheap deletion.";
    }

    function renderMapq() {
      const result = alignmentModel({ kind: "mapq", scores: [bestScore, runnerScore, runnerScore - 8], temperature: 4 });
      const repeat = alignmentModel({ kind: "repeat", repeatLength, readLength, insertSize });
      parts.visual.replaceChildren(
        barBoard(el, result.probabilities.map((probability, index) => ({
          label: "candidate " + (index + 1) + " · score " + result.scores[index],
          value: probability,
          display: percent(probability, 1),
          tone: index === 0 ? "active" : "muted",
        })), "Softmax probability across candidate alignments", 1),
        statusStrip(el, [
          { label: "best-placement probability", value: percent(result.best, 2), tone: "signal" },
          { label: "MAPQ", value: compact(result.mapq, 1), tone: "active" },
          { label: "molecule span", value: compact(repeat.span, 0) + " bp" },
          { label: "repeat resolved?", value: repeat.resolvable ? "yes" : "no — information limit", tone: repeat.resolvable ? "signal" : "warning" },
        ], "Placement confidence and repeat-span limit")
      );
      parts.controls.replaceChildren(
        rangeControl(el, "Best alignment score", bestScore, { min: 50, max: 120, step: 1, format: (value) => compact(value, 0) }, (value) => { bestScore = value; runnerScore = Math.min(runnerScore, bestScore); render(); }),
        rangeControl(el, "Runner-up score", runnerScore, { min: 30, max: bestScore, step: 1, format: (value) => compact(value, 0) }, (value) => { runnerScore = value; render(); }),
        rangeControl(el, "Identical repeat length", repeatLength, { min: 100, max: 10000, step: 100, format: (value) => compact(value, 0) + " bp" }, (value) => { repeatLength = value; render(); }),
        rangeControl(el, "Paired-end molecule span", insertSize, { min: readLength, max: 5000, step: 50, format: (value) => compact(value, 0) + " bp" }, (value) => { insertSize = value; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "candidate scores", value: bestScore + " vs " + runnerScore },
        { key: "relative support", value: percent(result.best, 1) + " best" },
        { key: "MAPQ transform", value: compact(result.mapq, 1) },
        { key: "physical limit", value: repeat.resolvable ? "unique flank spanned" : "repeat exceeds span" },
      ]));
      parts.explanation.innerHTML = "<strong>MAPQ is confidence among the candidates an aligner considered.</strong> Its calibration depends on scoring and search heuristics. No algorithm can uniquely place a molecule that contains no distinguishing sequence.";
    }

    function renderBias() {
      const result = alignmentModel({ kind: "bias", refScore: 100, altScore: 100 - altPenalty, minimumScore: 82, temperature: 4 });
      parts.visual.replaceChildren(
        barBoard(el, [
          { label: "reference-bearing reads retained", value: result.refMap, display: percent(result.refMap, 1), tone: "signal" },
          { label: "alternate-bearing reads retained", value: result.altMap, display: percent(result.altMap, 1), tone: "warning" },
          { label: "observed alternate balance", value: result.observedAltBalance, display: percent(result.observedAltBalance, 1), tone: "active" },
        ], "Reference-dependent read-retention probability", 1),
        claimBoundary(el,
          "allele balance after reference-dependent alignment and reporting",
          "the pre-alignment 50:50 molecular mixture",
          "More depth estimates the biased balance more precisely; it does not restore reads that were preferentially lost."
        )
      );
      parts.controls.replaceChildren(rangeControl(el, "Extra score penalty on alternate-bearing reads", altPenalty, { min: 0, max: 24, step: 1, format: (value) => "−" + compact(value, 0) }, (value) => { altPenalty = value; render(); }));
      parts.rail.replaceChildren(causalRail(el, [
        { key: "true molecules", value: "50% reference / 50% alternate" },
        { key: "reference match", value: "score 100" },
        { key: "alternate mismatch", value: "score " + (100 - altPenalty) },
        { key: "reported balance", value: percent(result.observedAltBalance, 1) + " alternate" },
      ]));
      parts.explanation.innerHTML = "<strong>Reference bias shifts heterozygous balance toward the reference.</strong> It is systematic missingness: additional observations repeat the same selection mechanism unless the reference or scoring representation changes.";
    }

    function renderBam() {
      const result = alignmentModel({ kind: "failure", signature: failureSignature });
      const signatures = {
        insert: ["normal pair", "normal pair", "wide pair", "inverted pair"],
        mapq: ["60", "60", "0", "3", "0"],
        clips: ["150M", "82M68S", "81M69S", "80M70S"],
        coverage: ["30×", "31×", "29×", "4×", "0×"],
      };
      parts.visual.replaceChildren(
        sequenceBoard(el, [
          { label: failureSignature, sequence: signatures[failureSignature].join(" · "), tone: "warning", note: "coherent distribution, not one bad record" },
          { label: "diagnosis", sequence: result.diagnosis, tone: "active" },
        ], "BAM failure-signature diagnosis"),
        processBoard(el, [
          { label: "observe distribution", value: failureSignature },
          { label: "locate coordinate pattern", value: "global, regional, or one breakpoint" },
          { label: "connect mechanism", value: result.diagnosis, tone: "signal" },
          { label: "test with orthogonal evidence", value: "mate, split-read, depth, or assembly", tone: "active" },
        ], "BAM diagnosis sequence")
      );
      parts.controls.replaceChildren(el("div", { class: "lab-control-block" }, [
        el("span", { class: "lab-control-label", text: "Observed BAM signature" }),
        choiceRow(el, [
          { label: "Insert sizes", value: "insert" },
          { label: "MAPQ collapse", value: "mapq" },
          { label: "Soft-clip pile-up", value: "clips" },
          { label: "Coverage trough", value: "coverage" },
        ], failureSignature, (value) => { failureSignature = value; render(); }, "BAM failure signature"),
      ]));
      parts.rail.replaceChildren(causalRail(el, [
        { key: "observable", value: failureSignature },
        { key: "pattern", value: signatures[failureSignature].join(" / ") },
        { key: "candidate mechanism", value: result.diagnosis },
        { key: "next evidence", value: "seek an independent signature" },
      ]));
      parts.explanation.innerHTML = "<strong>A BAM is a set of alignment hypotheses with structured failure modes.</strong> A coordinated soft-clip pile-up at one coordinate is breakpoint evidence; scattered clipping is a different problem. Always read the distribution and its genomic localization together.";
    }

    function render() {
      parts.tabHost.replaceChildren(tabs(el, modeChoices, mode, (value) => { mode = value; render(); }));
      if (mode === "scale") renderScale();
      else if (mode === "fm") renderFm();
      else if (mode === "seed") renderSeed();
      else if (mode === "gap") renderGap();
      else if (mode === "mapq") renderMapq();
      else if (mode === "bias") renderBias();
      else renderBam();
    }

    predict(body, {
      widget: "alignment-workbench-lab",
      question: "A 150 bp read lies entirely inside two identical 6 kb repeats. Which aligner setting can make its placement unique?",
      hint: "Ask whether the molecule contains any distinguishing information.",
      options: [
        { label: "A wider dynamic-programming band" },
        { label: "A smaller mismatch penalty" },
        { label: "No setting — the molecule itself is ambiguous", correct: true },
        { label: "A higher reported MAPQ" },
      ],
    }, () => {
      mode = "mapq";
      repeatLength = 6000;
      readLength = 150;
      insertSize = 450;
      parts.instrument.hidden = false;
      render();
    });
    finishLab(parts, body);
  });

  /* Chapter 44 — Annotation -------------------------------------------- */

  define("annotation-hmm-lab", makeObjectiveMap("ch44", [
    "Separate structural annotation from functional annotation and keep gene boundaries distinct from claims about molecular role.",
    "Decode a simplified generalized gene model with emissions and transition persistence instead of equating one motif with one gene.",
    "Rank ab-initio, short-read, long-read, and protein evidence by the gene-model boundary each can actually support.",
    "Show how two defensible annotation sets alter counts and downstream results on unchanged reads without making either one universally true.",
    "Recompute a variant consequence across transcripts and use MANE Select to make the chosen transcript explicit rather than invisible.",
    "Treat chromatin-state and lncRNA annotations as cell-contextual hypotheses rather than direct proofs of function.",
    "Attenuate homology-transfer confidence for paralogy and context mismatch and expose background-universe and study-bias inflation in enrichment.",
  ]), function (api) {
    const { body, el, predict } = api;
    const parts = labParts(el);
    let mode = "boundary";
    let claim = "structure";
    let motifEvidence = 0.7;
    let shortEvidence = 0.6;
    let longEvidence = 0.8;
    let stayProbability = 0.4;
    let abInitio = 0.45;
    let proteinEvidence = 0.2;
    let annotationSet = "gencode";
    let transcript = "mane";
    let cell = "hepatocyte";
    let liverOpen = true;
    let neuronOpen = false;
    let identity = 0.82;
    let paralogueDistance = 0.35;
    let contextMatch = 0.55;

    const modeChoices = [
      { label: "Claim boundary", value: "boundary" },
      { label: "HMM decoder", value: "hmm" },
      { label: "Evidence stack", value: "evidence" },
      { label: "Versions", value: "versions" },
      { label: "Transcript consequence", value: "transcript" },
      { label: "Regulatory context", value: "regulatory" },
      { label: "Homology transfer", value: "homology" },
    ];

    function renderBoundary() {
      const fixtures = {
        structure: {
          question: "Where are the exons and transcript boundaries?",
          evidence: "splice junctions, transcript ends, ORF continuity",
          output: "gene / transcript model",
          excluded: "what the gene does",
        },
        function: {
          question: "What process or molecular role is supported?",
          evidence: "orthology, domains, perturbations, curated experiments",
          output: "functional claim with provenance",
          excluded: "proof that every predicted transcript exists",
        },
      };
      const result = fixtures[claim];
      parts.visual.replaceChildren(
        processBoard(el, [
          { label: "question", value: result.question },
          { label: "evidence", value: result.evidence, tone: "signal" },
          { label: "annotation", value: result.output, tone: "active" },
          { label: "not implied", value: result.excluded, tone: "warning" },
        ], "Structural versus functional annotation boundary"),
        claimBoundary(el, result.output, result.excluded, "Structural and functional annotation can support one another, but they answer different questions.")
      );
      parts.controls.replaceChildren(el("div", { class: "lab-control-block" }, [
        el("span", { class: "lab-control-label", text: "Annotation question" }),
        choiceRow(el, [{ label: "Structural", value: "structure" }, { label: "Functional", value: "function" }], claim, (value) => { claim = value; render(); }, "Annotation claim family"),
      ]));
      parts.rail.replaceChildren(causalRail(el, [
        { key: "question", value: result.question },
        { key: "observations", value: result.evidence },
        { key: "model output", value: result.output },
        { key: "claim boundary", value: result.excluded },
      ]));
      parts.explanation.innerHTML = "<strong>Annotation is an inference layer, not sequence decoration.</strong> A precise transcript boundary can still have unknown function; a conserved molecular role does not prove a particular isoform is expressed in this sample.";
    }

    function renderHmm() {
      const result = annotationModel({ kind: "hmm", motifEvidence, shortEvidence, longEvidence, stayProbability });
      const pathLabels = result.path.map((state, index) => ({
        label: "bin " + (index + 1),
        values: [state],
        tones: [state === "exon" ? "active" : state === "intron" ? "signal" : "muted"],
      }));
      parts.visual.replaceChildren(
        matrixBoard(el, ["Viterbi state"], pathLabels, "Decoded hidden gene states across six genomic bins"),
        sequenceBoard(el, [
          { label: "observations", sequence: "quiet · start motif · RNA · bridge · splice+RNA · quiet", tone: "signal" },
          { label: "decoded path", sequence: result.path.join(" → "), tone: "active" },
        ], "Observed signals and most likely hidden annotation path"),
        statusStrip(el, [
          { label: "motif weight", value: percent(result.motifWeight, 0) },
          { label: "short-RNA weight", value: percent(result.shortWeight, 0) },
          { label: "long-RNA weight", value: percent(result.longWeight, 0), tone: "signal" },
          { label: "state persistence", value: percent(result.stay, 0), tone: "active" },
        ], "HMM evidence and transition settings")
      );
      parts.controls.replaceChildren(
        rangeControl(el, "Motif evidence weight", motifEvidence, { min: 0, max: 1, step: 0.05, format: (value) => percent(value, 0) }, (value) => { motifEvidence = value; render(); }),
        rangeControl(el, "Short-read transcript evidence", shortEvidence, { min: 0, max: 1, step: 0.05, format: (value) => percent(value, 0) }, (value) => { shortEvidence = value; render(); }),
        rangeControl(el, "Long-read transcript evidence", longEvidence, { min: 0, max: 1, step: 0.05, format: (value) => percent(value, 0) }, (value) => { longEvidence = value; render(); }),
        rangeControl(el, "Probability of staying in a state", stayProbability, { min: 0.4, max: 0.9, step: 0.02, format: (value) => percent(value, 0) }, (value) => { stayProbability = value; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "emissions", value: "motif + RNA evidence per bin" },
        { key: "transitions", value: percent(stayProbability, 0) + " state persistence" },
        { key: "decoding", value: "best whole path, not best bin alone" },
        { key: "gene model", value: result.path.join(" / ") },
      ]));
      parts.explanation.innerHTML = "<strong>A motif is evidence, not a gene.</strong> Viterbi decoding chooses one coherent path through emissions and transitions. Generalized HMMs add explicit duration distributions because exons and introns do not have memoryless lengths.";
    }

    function renderEvidence() {
      const result = annotationModel({ kind: "evidence", abInitio, shortRna: shortEvidence, longRna: longEvidence, protein: proteinEvidence });
      parts.visual.replaceChildren(
        barBoard(el, [
          { label: "ab-initio sequence model", value: result.abInitio, display: percent(result.abInitio, 0), tone: "muted" },
          { label: "short-read junction support", value: result.shortRna, display: percent(result.shortRna, 0), tone: "signal" },
          { label: "full-length transcript support", value: result.longRna, display: percent(result.longRna, 0), tone: "active" },
          { label: "protein evidence", value: result.protein, display: percent(result.protein, 0), tone: "warning" },
        ], "Evidence sources for one transcript model", 1),
        statusStrip(el, [
          { label: "teaching boundary score", value: percent(result.boundaryConfidence, 1), tone: "active" },
          { label: "full isoform observed?", value: longEvidence > 0.7 ? "strongly supported" : "still assembled from fragments", tone: longEvidence > 0.7 ? "signal" : "warning" },
          { label: "function proven?", value: "no", tone: "warning" },
        ], "Integrated structural-annotation confidence")
      );
      parts.controls.replaceChildren(
        rangeControl(el, "Ab-initio support", abInitio, { min: 0, max: 1, step: 0.05, format: (value) => percent(value, 0) }, (value) => { abInitio = value; render(); }),
        rangeControl(el, "Short-read RNA support", shortEvidence, { min: 0, max: 1, step: 0.05, format: (value) => percent(value, 0) }, (value) => { shortEvidence = value; render(); }),
        rangeControl(el, "Long-read transcript support", longEvidence, { min: 0, max: 1, step: 0.05, format: (value) => percent(value, 0) }, (value) => { longEvidence = value; render(); }),
        rangeControl(el, "Protein support", proteinEvidence, { min: 0, max: 1, step: 0.05, format: (value) => percent(value, 0) }, (value) => { proteinEvidence = value; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "prediction", value: percent(abInitio, 0) + " ab-initio" },
        { key: "observed fragments", value: percent(shortEvidence, 0) + " short RNA" },
        { key: "molecule-spanning evidence", value: percent(longEvidence, 0) + " long RNA" },
        { key: "teaching boundary score", value: percent(result.boundaryConfidence, 1) },
      ]));
      parts.explanation.innerHTML = "<strong>Long reads changed the latent variable from assembled fragments to observed molecule paths.</strong> The displayed weighted score is illustrative, not a calibrated posterior. Protein evidence can confirm translation but is sparse; absence of peptide evidence is weak evidence of absence.";
    }

    function renderVersions() {
      const sets = {
        gencode: { name: "GENCODE", genes: 62700, transcripts: 252000, feature: "broad transcript catalogue" },
        refseq: { name: "RefSeq", genes: 58900, transcripts: 175000, feature: "more conservative curation" },
        mane: { name: "MANE intersection", genes: 19000, transcripts: 19000, feature: "one matched clinical transcript per coding gene" },
      };
      const selected = sets[annotationSet];
      parts.visual.replaceChildren(
        matrixBoard(el, ["Genes", "Transcripts", "Design emphasis"], Object.entries(sets).map(([key, item]) => ({
          label: item.name + (key === annotationSet ? " •" : ""),
          values: [compact(item.genes, 0), compact(item.transcripts, 0), item.feature],
          tones: key === annotationSet ? ["active", "active", "active"] : ["muted", "muted", "muted"],
        })), "Illustrative annotation-set counts and design emphases"),
        claimBoundary(el,
          "the features present in " + selected.name + " under its release policy",
          "a final context-free count of biological genes or isoforms",
          "Counts are illustrative teaching fixtures; production analyses must record exact release identifiers."
        )
      );
      parts.controls.replaceChildren(el("div", { class: "lab-control-block" }, [
        el("span", { class: "lab-control-label", text: "Annotation set" }),
        choiceRow(el, Object.entries(sets).map(([value, item]) => ({ label: item.name, value })), annotationSet, (value) => { annotationSet = value; render(); }, "Annotation set"),
      ]));
      parts.rail.replaceChildren(causalRail(el, [
        { key: "unchanged reads", value: "same experiment" },
        { key: "feature catalogue", value: selected.name },
        { key: "count assignment", value: compact(selected.transcripts, 0) + " transcript models" },
        { key: "downstream result", value: "counts and consequences can move" },
      ]));
      parts.explanation.innerHTML = "<strong>Changing annotation alone can move a result.</strong> Disagreement reflects different evidence, release timing, and curation policy. Record the exact release and do not compare derived counts as if the feature universe were fixed.";
    }

    function renderTranscript() {
      const result = annotationModel({ kind: "transcript", transcript });
      parts.visual.replaceChildren(
        sequenceBoard(el, [
          { label: "genomic variant", sequence: "chr7:117,559,593 C>T", tone: "warning", note: "one coordinate and allele" },
          { label: result.transcript, sequence: result.consequence, tone: result.coding ? "active" : "signal", note: result.coding ? "changes a translated codon" : "same variant, different transcript context" },
        ], "Transcript-dependent variant consequence"),
        matrixBoard(el, ["Consequence", "Coding?"], ["mane", "short", "retained"].map((key) => {
          const item = annotationModel({ kind: "transcript", transcript: key });
          return { label: item.transcript + (key === transcript ? " •" : ""), values: [item.consequence, item.coding ? "yes" : "no"], tones: key === transcript ? ["active", "active"] : ["muted", "muted"] };
        }), "One genomic variant annotated against three transcript models")
      );
      parts.controls.replaceChildren(el("div", { class: "lab-control-block" }, [
        el("span", { class: "lab-control-label", text: "Transcript used for consequence" }),
        choiceRow(el, [
          { label: "MANE Select", value: "mane" },
          { label: "Short coding isoform", value: "short" },
          { label: "Intron-retained isoform", value: "retained" },
        ], transcript, (value) => { transcript = value; render(); }, "Transcript consequence fixture"),
      ]));
      parts.rail.replaceChildren(causalRail(el, [
        { key: "variant", value: "one genomic coordinate" },
        { key: "transcript", value: result.transcript },
        { key: "feature overlap", value: result.coding ? "coding exon" : result.consequence },
        { key: "reported consequence", value: result.consequence },
      ]));
      parts.explanation.innerHTML = "<strong>Consequence is a function of variant and transcript.</strong> MANE Select does not make biology single-isoform; it makes one clinically useful transcript choice explicit and synchronized across major resources.";
    }

    function renderRegulatory() {
      const result = annotationModel({ kind: "regulatory", cell, liverOpen, neuronOpen });
      parts.visual.replaceChildren(
        matrixBoard(el, ["Accessibility", "H3K27ac", "State label"], [
          { label: "Hepatocyte" + (cell === "hepatocyte" ? " •" : ""), values: [liverOpen ? "open" : "closed", liverOpen ? "high" : "low", liverOpen ? "candidate active enhancer" : "quiescent"], tones: cell === "hepatocyte" ? ["active", "active", "active"] : ["muted", "muted", "muted"] },
          { label: "Neuron" + (cell === "neuron" ? " •" : ""), values: [neuronOpen ? "open" : "closed", neuronOpen ? "high" : "low", neuronOpen ? "candidate active enhancer" : "quiescent"], tones: cell === "neuron" ? ["active", "active", "active"] : ["muted", "muted", "muted"] },
        ], "Cell-type-specific regulatory annotation"),
        claimBoundary(el,
          result.label + " from a mark pattern in " + cell,
          "necessity, sufficiency, target gene, or activity in another cell type",
          "A chromatin-state name is a human interpretation of emissions, not an experimental perturbation."
        )
      );
      parts.controls.replaceChildren(
        el("div", { class: "lab-control-block" }, [
          el("span", { class: "lab-control-label", text: "Cell type" }),
          choiceRow(el, [{ label: "Hepatocyte", value: "hepatocyte" }, { label: "Neuron", value: "neuron" }], cell, (value) => { cell = value; render(); }, "Regulatory cell type"),
        ]),
        el("div", { class: "lab-control-block" }, [
          el("span", { class: "lab-control-label", text: "Hepatocyte state" }),
          choiceRow(el, [{ label: "Open", value: true }, { label: "Closed", value: false }], liverOpen, (value) => { liverOpen = value; render(); }, "Hepatocyte accessibility"),
        ]),
        el("div", { class: "lab-control-block" }, [
          el("span", { class: "lab-control-label", text: "Neuron state" }),
          choiceRow(el, [{ label: "Open", value: true }, { label: "Closed", value: false }], neuronOpen, (value) => { neuronOpen = value; render(); }, "Neuron accessibility"),
        ])
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "cell context", value: cell },
        { key: "mark pattern", value: result.open ? "open + acetylated" : "quiet" },
        { key: "annotation", value: result.label },
        { key: "function claim", value: "requires perturbation" },
      ]));
      parts.explanation.innerHTML = "<strong>Regulatory annotations are conditional on cell type.</strong> A union registry means active somewhere, not active here. The same caution applies to provisional lncRNA models: transcription and annotation are not proof of selected function.";
    }

    function renderHomology() {
      const result = annotationModel({ kind: "homology", identity, paralogueDistance, contextMatch });
      parts.visual.replaceChildren(
        processBoard(el, [
          { label: "sequence identity", value: percent(identity, 0), tone: "signal" },
          { label: "orthology uncertainty", value: percent(paralogueDistance, 0), tone: paralogueDistance > 0.5 ? "warning" : "muted" },
          { label: "cellular-context match", value: percent(contextMatch, 0) },
          { label: "transfer confidence", value: percent(result.transferConfidence, 1), tone: "active" },
        ], "Functional homology-transfer confidence"),
        claimBoundary(el,
          "support that homologous sequence may share a molecular role",
          "identical phenotype, expression context, substrate, or disease mechanism",
          "Paralogues can retain sequence while partitioning or changing function; enrichment inherits annotation and study bias."
        )
      );
      parts.controls.replaceChildren(
        rangeControl(el, "Sequence identity", identity, { min: 0.2, max: 1, step: 0.05, format: (value) => percent(value, 0) }, (value) => { identity = value; render(); }),
        rangeControl(el, "Paralogy / duplication uncertainty", paralogueDistance, { min: 0, max: 1, step: 0.05, format: (value) => percent(value, 0) }, (value) => { paralogueDistance = value; render(); }),
        rangeControl(el, "Cellular-context match", contextMatch, { min: 0, max: 1, step: 0.05, format: (value) => percent(value, 0) }, (value) => { contextMatch = value; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "homologue", value: percent(identity, 0) + " identity" },
        { key: "gene history", value: percent(paralogueDistance, 0) + " duplication uncertainty" },
        { key: "context", value: percent(contextMatch, 0) + " matched" },
        { key: "transfer", value: percent(result.transferConfidence, 1) + " teaching score" },
      ]));
      parts.explanation.innerHTML = "<strong>Similarity supports a hypothesis; it does not copy a function label.</strong> GO enrichment compounds this problem when well-studied genes have denser annotations or the tested universe omits genes that could never have been selected.";
    }

    function render() {
      parts.tabHost.replaceChildren(tabs(el, modeChoices, mode, (value) => { mode = value; render(); }));
      if (mode === "boundary") renderBoundary();
      else if (mode === "hmm") renderHmm();
      else if (mode === "evidence") renderEvidence();
      else if (mode === "versions") renderVersions();
      else if (mode === "transcript") renderTranscript();
      else if (mode === "regulatory") renderRegulatory();
      else renderHomology();
    }

    predict(body, {
      widget: "annotation-hmm-lab",
      question: "A single strong splice-donor motif appears in genomic DNA with no transcript evidence. What has been established?",
      hint: "A signal is one emission, not a complete hidden path.",
      options: [
        { label: "A complete expressed gene" },
        { label: "One piece of structural evidence, not a gene model", correct: true },
        { label: "The gene's molecular function" },
        { label: "A clinically preferred transcript" },
      ],
    }, () => {
      mode = "hmm";
      motifEvidence = 1;
      shortEvidence = 0;
      longEvidence = 0;
      parts.instrument.hidden = false;
      render();
    });
    finishLab(parts, body);
  });

  /* Chapter 45 — Reference genomes and pangenomes --------------------- */

  define("pangenome-path-lab", makeObjectiveMap("ch45", [
    "Treat a reference genome as a coordinate and comparison object rather than a normal, healthy, or population-typical haplotype.",
    "Calculate how mismatch-score arithmetic preferentially loses reads carrying alleles absent from the chosen linear reference.",
    "Identify the sequence classes completed or corrected by T2T-CHM13 and why a nearly homozygous CHM source simplified assembly.",
    "Read segments, links, paths, and walks in a small pangenome graph and count paths after evidence constrains some bubbles.",
    "Compare node, path-offset, and reference-projected coordinates by the invariants and failure modes each representation creates.",
    "Explain why graph indexing searches observed paths or haplotypes rather than imposing one total order over all graph nodes.",
    "Choose a reference for a project from divergence, structural scope, and resource compatibility and enumerate switch costs explicitly.",
  ]), function (api) {
    const { body, el, predict } = api;
    const parts = labParts(el);
    let mode = "object";
    let referenceMismatches = 1;
    let alternateMismatches = 4;
    let graphBubbles = 4;
    let constrainedBubbles = 1;
    let coordinateScheme = "path";
    let sourceCopies = 1;
    let targetCopies = 1;
    let refFlip = false;
    let resources = 0.9;
    let divergence = 0.2;
    let structuralFocus = 0.2;

    const modeChoices = [
      { label: "Reference object", value: "object" },
      { label: "Bias arithmetic", value: "bias" },
      { label: "T2T completion", value: "t2t" },
      { label: "Graph paths", value: "graph" },
      { label: "Coordinates", value: "coordinates" },
      { label: "Graph index", value: "index" },
      { label: "Choose reference", value: "choice" },
    ];

    function graphSvg(bubbles, constrained) {
      const count = Math.min(6, bubbles);
      const width = 520;
      const step = 420 / Math.max(1, count);
      let paths = '<path class="genomics-graph-edge" d="M32 130 L70 130"/>';
      let nodes = '<circle class="genomics-graph-node is-start" cx="30" cy="130" r="16"/><text class="genomics-graph-label" x="30" y="135">S</text>';
      for (let index = 0; index < count; index += 1) {
        const x = 80 + index * step;
        const next = x + step - 18;
        const fixed = index < constrained;
        paths += '<path class="genomics-graph-edge is-upper" d="M' + (x - 10) + ' 130 Q' + (x + step / 2 - 10) + ' 60 ' + next + ' 130"/>';
        paths += '<path class="genomics-graph-edge is-lower' + (fixed ? ' is-muted' : '') + '" d="M' + (x - 10) + ' 130 Q' + (x + step / 2 - 10) + ' 200 ' + next + ' 130"/>';
        nodes += '<circle class="genomics-graph-node is-upper" cx="' + (x + step / 2 - 10) + '" cy="84" r="13"/>';
        nodes += '<circle class="genomics-graph-node is-lower' + (fixed ? ' is-muted' : '') + '" cx="' + (x + step / 2 - 10) + '" cy="176" r="13"/>';
        nodes += '<text class="genomics-graph-label" x="' + (x + step / 2 - 10) + '" y="88">' + (index + 1) + 'a</text>';
        nodes += '<text class="genomics-graph-label" x="' + (x + step / 2 - 10) + '" y="180">' + (index + 1) + 'b</text>';
      }
      paths += '<path class="genomics-graph-edge" d="M' + (width - 70) + ' 130 L' + (width - 32) + ' 130"/>';
      nodes += '<circle class="genomics-graph-node is-end" cx="' + (width - 30) + '" cy="130" r="16"/><text class="genomics-graph-label" x="' + (width - 30) + '" y="135">E</text>';
      return '<svg class="lab-diagram genomics-diagram" viewBox="0 0 520 250" role="img" aria-label="Pangenome graph with ' + bubbles + ' bubbles, ' + constrained + ' constrained by evidence">' + paths + nodes + '</svg>';
    }

    function renderObject() {
      parts.visual.replaceChildren(
        processBoard(el, [
          { label: "coordinate scaffold", value: "named chromosomes and positions", tone: "signal" },
          { label: "sequence comparator", value: "REF allele for differences", tone: "active" },
          { label: "donor history", value: "mosaic segments; not one haplotype" },
          { label: "not implied", value: "normal, healthy, major, or ancestral allele", tone: "warning" },
        ], "What a human reference genome is and is not"),
        matrixBoard(el, ["Reference can provide", "Reference cannot guarantee"], [
          { label: "coordinate", values: ["stable address within a release", "same biological locus after a build switch"], tones: ["active", "warning"] },
          { label: "allele", values: ["comparison base", "population-major or benign allele"], tones: ["signal", "warning"] },
          { label: "haplotype", values: ["one linear path", "a diploid person or typical population path"], tones: ["signal", "warning"] },
        ], "Reference-genome capabilities and limits")
      );
      parts.controls.replaceChildren(processBoard(el, [
        { label: "GRCh38", value: "mosaic linear reference" },
        { label: "T2T-CHM13", value: "near-complete hydatidiform-mole-derived path" },
        { label: "pangenome", value: "many observed haplotype paths" },
      ], "Reference representations"));
      parts.rail.replaceChildren(causalRail(el, [
        { key: "reference", value: "chosen comparison object" },
        { key: "read", value: "scored against its sequence" },
        { key: "coordinate", value: "address inside that release" },
        { key: "claim boundary", value: "reference ≠ normal" },
      ]));
      parts.explanation.innerHTML = "<strong>Reference means addressable, not normal.</strong> It is a haploid coordinate representation, may carry minor or disease-reported alleles, and its mosaic donor segments do not form a naturally occurring person-level haplotype.";
    }

    function renderBias() {
      const result = pangenomeModel({ kind: "bias", referenceMismatches, alternateMismatches, readLength: 100, matchScore: 2, mismatchPenalty: 4 });
      parts.visual.replaceChildren(
        sequenceBoard(el, [
          { label: "reference-like read", sequence: "ACGTTGCA…  mismatches=" + referenceMismatches, tone: "signal", note: "score " + compact(result.referenceScore, 0) },
          { label: "alternate-path read", sequence: "ACGTCATA…  mismatches=" + alternateMismatches, tone: "warning", note: "score " + compact(result.alternateScore, 0) },
        ], "Read scores against one linear reference path"),
        barBoard(el, [
          { label: "reference-path support", value: 1 - result.alternateMapShare, display: percent(1 - result.alternateMapShare, 2), tone: "signal" },
          { label: "alternate-path support", value: result.alternateMapShare, display: percent(result.alternateMapShare, 2), tone: "warning" },
        ], "Relative alignment support under one-reference scoring", 1),
        claimBoundary(el,
          "which read fits this chosen linear path better",
          "which allele was equally abundant before alignment",
          "This two-candidate softmax is a teaching model; aligner search and reporting thresholds can make loss even more discontinuous."
        )
      );
      parts.controls.replaceChildren(
        rangeControl(el, "Mismatches on reference-like read", referenceMismatches, { min: 0, max: 10, step: 1, format: (value) => compact(value, 0) }, (value) => { referenceMismatches = value; render(); }),
        rangeControl(el, "Mismatches on alternate-path read", alternateMismatches, { min: 0, max: 10, step: 1, format: (value) => compact(value, 0) }, (value) => { alternateMismatches = value; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "true mixture", value: "equal path molecules" },
        { key: "linear reference", value: "one path represented" },
        { key: "score gap", value: compact(result.referenceScore - result.alternateScore, 0) },
        { key: "retained alternate support", value: percent(result.alternateMapShare, 2) },
      ]));
      parts.explanation.innerHTML = "<strong>Reference bias is arithmetic before it is politics.</strong> Reads carrying unrepresented sequence accumulate mismatches, lose MAPQ, clip, or disappear. Divergence from the reference's donors therefore creates unequal callability.";
    }

    function renderT2t() {
      parts.visual.replaceChildren(
        matrixBoard(el, ["GRCh38 representation", "T2T-CHM13 change", "Why hard"], [
          { label: "centromeres", values: ["gaps / models", "assembled arrays", "megabase near-identical repeats"], tones: ["warning", "active", "muted"] },
          { label: "acrocentric short arms", values: ["incomplete", "substantially resolved", "segmental duplication and rDNA"], tones: ["warning", "active", "muted"] },
          { label: "segmental duplications", values: ["some collapsed", "expanded / corrected", "copy-specific placement"], tones: ["warning", "active", "muted"] },
          { label: "haplotype mixture", values: ["mosaic donors", "nearly homozygous CHM source", "heterozygosity tangles assembly"], tones: ["muted", "signal", "active"] },
        ], "Sequence classes changed by the telomere-to-telomere reference"),
        claimBoundary(el,
          "a far more complete linear human assembly",
          "human diversity or a diploid population reference",
          "CHM13 resolves one essentially homozygous path exceptionally well; pangenomes address representation across paths."
        )
      );
      parts.controls.replaceChildren(processBoard(el, [
        { label: "long molecules", value: "span repeat boundaries" },
        { label: "high-fidelity consensus", value: "distinguish near-identical copies" },
        { label: "nearly homozygous source", value: "removes most heterozygous bubbles" },
        { label: "assembly", value: "one telomere-to-telomere path", tone: "active" },
      ], "Information sources that made T2T assembly tractable"));
      parts.rail.replaceChildren(causalRail(el, [
        { key: "old gap", value: "repeat-rich missing sequence" },
        { key: "new evidence", value: "long accurate molecules" },
        { key: "simplified graph", value: "nearly homozygous source" },
        { key: "result", value: "complete linear path, not population diversity" },
      ]));
      parts.explanation.innerHTML = "<strong>T2T changed the missing-data boundary.</strong> It also corrected collapsed and misassembled regions, but it remains one essentially homozygous path. Completion and population representation are different axes.";
    }

    function renderGraph() {
      constrainedBubbles = Math.min(constrainedBubbles, graphBubbles);
      const result = pangenomeModel({ kind: "graph", bubbles: graphBubbles, constrained: constrainedBubbles });
      parts.visual.innerHTML = graphSvg(result.bubbles, result.constrained);
      parts.visual.append(
        statusStrip(el, [
          { label: "variant bubbles", value: compact(result.bubbles, 0), tone: "signal" },
          { label: "fixed by sample evidence", value: compact(result.constrained, 0), tone: "active" },
          { label: "free bubbles", value: compact(result.freeBubbles, 0) },
          { label: "compatible paths", value: compact(result.pathCount, 0), tone: result.pathCount > 8 ? "warning" : "active" },
        ], "Pangenome graph path count")
      );
      parts.controls.replaceChildren(
        rangeControl(el, "Independent graph bubbles", graphBubbles, { min: 0, max: 6, step: 1, format: (value) => compact(value, 0) }, (value) => { graphBubbles = value; constrainedBubbles = Math.min(constrainedBubbles, value); render(); }),
        rangeControl(el, "Bubbles constrained by this sample", constrainedBubbles, { min: 0, max: graphBubbles, step: 1, format: (value) => compact(value, 0) }, (value) => { constrainedBubbles = value; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "segments + links", value: graphBubbles + " bubbles" },
        { key: "sample evidence", value: constrainedBubbles + " choices fixed" },
        { key: "remaining combinations", value: "2^" + result.freeBubbles },
        { key: "compatible paths", value: compact(result.pathCount, 0) },
      ]));
      parts.explanation.innerHTML = "<strong>A graph stores alternatives without pretending they have one total order.</strong> Segment records and links define the topology; named paths or walks select ordered traversals. Evidence reduces compatible paths by constraining bubbles.";
    }

    function renderCoordinates() {
      const coordinate = pangenomeModel({ kind: "coordinate", scheme: coordinateScheme });
      const lift = pangenomeModel({ kind: "liftover", sourceCopies, targetCopies, refFlip });
      parts.visual.replaceChildren(
        matrixBoard(el, ["Stable for", "Breaks when"], ["node", "path", "projected"].map((scheme) => {
          const item = pangenomeModel({ kind: "coordinate", scheme });
          return { label: scheme + (scheme === coordinateScheme ? " •" : ""), values: [item.stable, item.breaks], tones: scheme === coordinateScheme ? ["active", "warning"] : ["muted", "muted"] };
        }), "Coordinate choices on a sequence graph"),
        statusStrip(el, [
          { label: "source copies", value: compact(sourceCopies, 0) },
          { label: "target copies", value: compact(targetCopies, 0) },
          { label: "target REF changes?", value: refFlip ? "yes" : "no", tone: refFlip ? "warning" : "signal" },
          { label: "record directly portable?", value: lift.allelesDirectlyPortable ? "yes" : "no", tone: lift.allelesDirectlyPortable ? "active" : "warning" },
        ], "Coordinate multiplicity and target-reference allele validation")
      );
      parts.controls.replaceChildren(
        el("div", { class: "lab-control-block" }, [
          el("span", { class: "lab-control-label", text: "Coordinate representation" }),
          choiceRow(el, [{ label: "Node ID", value: "node" }, { label: "Path offset", value: "path" }, { label: "Reference projected", value: "projected" }], coordinateScheme, (value) => { coordinateScheme = value; render(); }, "Graph coordinate scheme"),
        ]),
        rangeControl(el, "Copies in source assembly", sourceCopies, { min: 0, max: 3, step: 1, format: (value) => compact(value, 0) }, (value) => { sourceCopies = value; render(); }),
        rangeControl(el, "Copies in target assembly", targetCopies, { min: 0, max: 3, step: 1, format: (value) => compact(value, 0) }, (value) => { targetCopies = value; render(); }),
        el("div", { class: "lab-control-block" }, [
          el("span", { class: "lab-control-label", text: "Target-build reference allele" }),
          choiceRow(el, [{ label: "Same REF allele", value: false }, { label: "Former ALT is target REF", value: true }], refFlip, (value) => { refFlip = value; render(); }, "Target-build reference allele"),
        ])
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "coordinate scheme", value: coordinateScheme },
        { key: "invariant", value: coordinate.stable },
        { key: "failure", value: coordinate.breaks },
        { key: "liftover", value: !lift.coordinateBijective ? "lossy / ambiguous" : lift.allelesDirectlyPortable ? "one-to-one and REF-valid" : "one-to-one; rewrite alleles" },
      ]));
      parts.explanation.innerHTML = "<strong>Coordinate multiplicity and allele validity are separate checks.</strong> A one-to-one coordinate map can still require strand-aware reverse complementation or REF/ALT rewriting against the target FASTA. A graph has no universal left-to-right position, and round-tripping is not guaranteed to recover the input.";
    }

    function renderIndex() {
      parts.visual.replaceChildren(
        processBoard(el, [
          { label: "linear index", value: "suffixes of one string" },
          { label: "graph problem", value: "exponentially many possible walks", tone: "warning" },
          { label: "practical restriction", value: "observed haplotype paths / local graph neighborhoods", tone: "signal" },
          { label: "query", value: "seed against indexed path evidence, then align to graph", tone: "active" },
        ], "From string indexing to practical graph indexing"),
        claimBoundary(el,
          "fast search over the indexed subset of paths and graph neighborhoods",
          "enumeration of every combinatorial walk through the graph",
          "Path indexes are useful precisely because biology and population panels constrain the graph's combinatorial space."
        )
      );
      parts.controls.replaceChildren(processBoard(el, [
        { label: "minimizer", value: "compact seed from a read" },
        { label: "path index", value: "candidate observed haplotypes" },
        { label: "graph extension", value: "score alternatives near candidates" },
      ], "Practical graph-mapping path"));
      parts.rail.replaceChildren(causalRail(el, [
        { key: "read seed", value: "minimizer" },
        { key: "search space", value: "indexed observed paths" },
        { key: "local topology", value: "nearby graph branches" },
        { key: "placement", value: "path-aware alignment" },
      ]));
      parts.explanation.innerHTML = "<strong>Indexing a graph is not indexing one string with extra punctuation.</strong> Practical methods constrain the path universe using observed haplotypes and searchable local structure.";
    }

    function renderChoice() {
      const result = pangenomeModel({ kind: "referenceChoice", resources, divergence, structuralFocus });
      parts.visual.replaceChildren(
        statusStrip(el, [
          { label: "legacy resource compatibility", value: percent(resources, 0), tone: "signal" },
          { label: "distance from linear donors", value: percent(divergence, 0), tone: divergence > 0.5 ? "warning" : "muted" },
          { label: "structural-variation priority", value: percent(structuralFocus, 0), tone: "active" },
          { label: "heuristic representation", value: result.choice, tone: "active" },
        ], "Illustrative reference-choice trade-off"),
        processBoard(el, [
          { label: "choose before analysis", value: result.choice },
          { label: "lock build + contig naming", value: "sample, intervals, annotations, databases" },
          { label: "if switching", value: "realign and re-call; do not only lift variants", tone: "warning" },
          { label: "recalibrate", value: "coverage, MAPQ, QC, callable masks", tone: "signal" },
        ], "Reference switch consequences")
      );
      parts.controls.replaceChildren(
        rangeControl(el, "Need for GRCh38-keyed resources", resources, { min: 0, max: 1, step: 0.05, format: (value) => percent(value, 0) }, (value) => { resources = value; render(); }),
        rangeControl(el, "Expected divergence from linear-reference donors", divergence, { min: 0, max: 1, step: 0.05, format: (value) => percent(value, 0) }, (value) => { divergence = value; render(); }),
        rangeControl(el, "Structural-variation and repeat priority", structuralFocus, { min: 0, max: 1, step: 0.05, format: (value) => percent(value, 0) }, (value) => { structuralFocus = value; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "project constraints", value: "resources " + percent(resources, 0) },
        { key: "representation gap", value: "divergence " + percent(divergence, 0) },
        { key: "target variation", value: "SV priority " + percent(structuralFocus, 0) },
        { key: "choice", value: result.choice },
      ]));
      parts.explanation.innerHTML = "<strong>Reference choice is a systems decision.</strong> The score is an illustrative prompt, not a universal decision rule. Capture intervals, annotations, population frequencies, PRS weights, blacklists, and QC distributions are all keyed to the chosen reference.";
    }

    function render() {
      parts.tabHost.replaceChildren(tabs(el, modeChoices, mode, (value) => { mode = value; render(); }));
      if (mode === "object") renderObject();
      else if (mode === "bias") renderBias();
      else if (mode === "t2t") renderT2t();
      else if (mode === "graph") renderGraph();
      else if (mode === "coordinates") renderCoordinates();
      else if (mode === "index") renderIndex();
      else renderChoice();
    }

    predict(body, {
      widget: "pangenome-path-lab",
      question: "A pangenome graph contains four independent two-allele bubbles and no sample path is known. How many paths connect its ends?",
      hint: "Choose one branch at each independent bubble.",
      options: [
        { label: "4" },
        { label: "8" },
        { label: "16", correct: true },
        { label: "24" },
      ],
    }, () => {
      mode = "graph";
      graphBubbles = 4;
      constrainedBubbles = 0;
      parts.instrument.hidden = false;
      render();
    });
    finishLab(parts, body);
  });

  /* Chapter 46 — Variant calling -------------------------------------- */

  define("variant-caller-lab", makeObjectiveMap("ch46", [
    "Compute genotype posteriors from base-quality likelihoods and allele-frequency priors rather than thresholding alternate-read counts.",
    "Show why local haplotype assembly changes the latent object from independent pileup columns to coherent candidate sequences around an indel.",
    "Use cohort allele evidence as a prior for low-depth samples while keeping sample reads and cohort information conceptually separate.",
    "Diagnose strand, allele-balance, and mapping-quality artefacts and distinguish transparent hard filters from trained recalibration.",
    "Read Ti/Tv, contamination, sex, and relatedness as complementary sample-QC signals with different blind spots.",
    "Compare germline, structural, and somatic evidence and calculate sensitivity versus background-error false positives at a read threshold.",
    "Classify no-call states by coverage, mapping, filters, representation, and callable-region exclusions instead of reporting absence of variation.",
  ]), function (api) {
    const { body, el, predict } = api;
    const parts = labParts(el);
    let mode = "posterior";
    let refCount = 8;
    let altCount = 6;
    let baseQuality = 30;
    let altFrequency = 0.01;
    let haplotypeFixture = "indel";
    let cohortAlt = 12;
    let cohortChromosomes = 2000;
    let lowDepthAlt = 1;
    let lowDepth = 3;
    let forwardAlt = 7;
    let reverseAlt = 1;
    let altMapq = 35;
    let refMapq = 60;
    let qcSignal = "titv";
    let somaticDepth = 200;
    let somaticVaf = 0.03;
    let errorRate = 0.001;
    let threshold = 3;
    let callableDepth = 18;
    let callableMapq = 45;
    let callableIncluded = true;
    let referenceHasLocus = true;

    const modeChoices = [
      { label: "Genotype posterior", value: "posterior" },
      { label: "Local haplotypes", value: "haplotype" },
      { label: "Joint genotyping", value: "joint" },
      { label: "Call filters", value: "filter" },
      { label: "Sample QC + SV", value: "qc" },
      { label: "Somatic threshold", value: "somatic" },
      { label: "Callable absence", value: "callable" },
    ];

    function renderPosterior() {
      const result = variantCallerModel({ kind: "posterior", refCount, altCount, quality: baseQuality, altFrequency });
      parts.visual.replaceChildren(
        sequenceBoard(el, [
          { label: "pileup", sequence: "R ".repeat(refCount) + "A ".repeat(altCount), tone: "signal", note: refCount + " reference, " + altCount + " alternate observations" },
          { label: "base model", sequence: "Q" + baseQuality + " → e=" + compact(result.error, 5), tone: "active" },
        ], "Biallelic pileup and per-base error model"),
        barBoard(el, ["0/0", "0/1", "1/1"].map((label, index) => ({
          label,
          value: result.posteriors[index],
          display: percent(result.posteriors[index], 3),
          tone: label === result.genotype ? "active" : "muted",
        })), "Posterior probability over genotypes", 1),
        statusStrip(el, [
          { label: "best genotype", value: result.genotype, tone: "active" },
          { label: "genotype quality", value: compact(result.genotypeQuality, 1), tone: "signal" },
          { label: "alternate prior frequency", value: percent(result.altFrequency, 2) },
        ], "Genotype posterior result")
      );
      parts.controls.replaceChildren(
        rangeControl(el, "Reference-supporting reads", refCount, { min: 0, max: 30, step: 1, format: (value) => compact(value, 0) }, (value) => { refCount = value; render(); }),
        rangeControl(el, "Alternate-supporting reads", altCount, { min: 0, max: 30, step: 1, format: (value) => compact(value, 0) }, (value) => { altCount = value; render(); }),
        rangeControl(el, "Base quality", baseQuality, { min: 5, max: 50, step: 1, format: (value) => "Q" + compact(value, 0) }, (value) => { baseQuality = value; render(); }),
        rangeControl(el, "Population alternate frequency", altFrequency, { min: 0.001, max: 0.5, step: 0.001, format: (value) => percent(value, 2) }, (value) => { altFrequency = value; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "base evidence", value: refCount + " R / " + altCount + " A at Q" + baseQuality },
        { key: "likelihood", value: "P(reads | genotype)" },
        { key: "prior", value: "AF " + percent(altFrequency, 2) },
        { key: "posterior call", value: result.genotype + " · GQ " + compact(result.genotypeQuality, 1) },
      ]));
      parts.explanation.innerHTML = "<strong>Counting discards the confidence attached to every observation.</strong> The model assumes conditionally independent reads; local assembly and learned pileup models repair violations caused by correlated errors, alignment context, and haplotypes.";
    }

    function renderHaplotype() {
      const fixtures = {
        indel: {
          reads: ["ACGTT—GCA", "ACGTT—GCA", "ACGTTAGCA", "ACGTTAGCA"],
          pileup: "mismatches and gaps shift across adjacent columns",
          haplotypes: ["ACGTTGCA", "ACGTTAGCA"],
          verdict: "two coherent local haplotypes",
        },
        repeat: {
          reads: ["ACACACAC", "ACAC—CAC", "ACACACAC", "ACAC—CAC"],
          pileup: "equivalent gap placements disagree",
          haplotypes: ["ACACACAC", "ACACAC"],
          verdict: "assembly compares full repeat-length alleles",
        },
        snv: {
          reads: ["ACGTTGCA", "ACGTAGCA", "ACGTTGCA", "ACGTAGCA"],
          pileup: "one isolated biallelic column",
          haplotypes: ["ACGTTGCA", "ACGTAGCA"],
          verdict: "pileup and haplotype agree",
        },
      };
      const fixture = fixtures[haplotypeFixture];
      parts.visual.replaceChildren(
        sequenceBoard(el, fixture.reads.map((read, index) => ({ label: "read " + (index + 1), sequence: read, tone: index % 2 ? "signal" : "active" })), "Reads around a candidate variant"),
        sequenceBoard(el, [
          { label: "column view", sequence: fixture.pileup, tone: "warning" },
          { label: "candidate H1", sequence: fixture.haplotypes[0], tone: "signal" },
          { label: "candidate H2", sequence: fixture.haplotypes[1], tone: "active" },
          { label: "comparison", sequence: fixture.verdict, tone: "active" },
        ], "Pileup versus local haplotype representation")
      );
      parts.controls.replaceChildren(el("div", { class: "lab-control-block" }, [
        el("span", { class: "lab-control-label", text: "Local variant fixture" }),
        choiceRow(el, [{ label: "Indel", value: "indel" }, { label: "Short tandem repeat", value: "repeat" }, { label: "SNV", value: "snv" }], haplotypeFixture, (value) => { haplotypeFixture = value; render(); }, "Local haplotype fixture"),
      ]));
      parts.rail.replaceChildren(causalRail(el, [
        { key: "aligned reads", value: fixture.reads.length + " overlapping observations" },
        { key: "column problem", value: fixture.pileup },
        { key: "latent object", value: "candidate local sequences" },
        { key: "call", value: fixture.verdict },
      ]));
      parts.explanation.innerHTML = "<strong>Local assembly changes what is being inferred.</strong> Instead of deciding each pileup column independently, the caller scores whole candidate haplotypes that explain the reads coherently.";
    }

    function renderJoint() {
      const result = variantCallerModel({ kind: "joint", cohortAltAlleles: cohortAlt, cohortChromosomes, sampleAltReads: lowDepthAlt, sampleDepth: lowDepth });
      parts.visual.replaceChildren(
        processBoard(el, [
          { label: "sample evidence", value: lowDepthAlt + " alternate of " + lowDepth + " reads" },
          { label: "cohort evidence", value: cohortAlt + " of " + cohortChromosomes + " chromosomes", tone: "signal" },
          { label: "cohort-informed prior", value: percent(result.priorFrequency, 3), tone: "active" },
          { label: "sample genotype posterior", value: result.genotype + " at " + percent(Math.max(...result.posteriors), 1) },
        ], "Cohort-informed genotype prior combined with a separate sample likelihood"),
        claimBoundary(el,
          "a stronger allele-frequency prior and shared site discovery across samples",
          "pooled reads or permission to erase sample-specific genotype uncertainty",
          "Joint genotyping combines evidence at the model level; each sample keeps its own likelihood."
        )
      );
      parts.controls.replaceChildren(
        rangeControl(el, "Cohort alternate alleles", cohortAlt, { min: 0, max: 100, step: 1, format: (value) => compact(value, 0) }, (value) => { cohortAlt = value; render(); }),
        rangeControl(el, "Cohort chromosomes", cohortChromosomes, { min: 100, max: 5000, step: 100, format: (value) => compact(value, 0) }, (value) => { cohortChromosomes = value; cohortAlt = Math.min(cohortAlt, value); render(); }),
        rangeControl(el, "Sample alternate reads", lowDepthAlt, { min: 0, max: lowDepth, step: 1, format: (value) => compact(value, 0) }, (value) => { lowDepthAlt = value; render(); }),
        rangeControl(el, "Sample depth", lowDepth, { min: 1, max: 12, step: 1, format: (value) => compact(value, 0) }, (value) => { lowDepth = value; lowDepthAlt = Math.min(lowDepthAlt, value); render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "gVCF evidence", value: "likelihoods including reference blocks" },
        { key: "cohort", value: percent(result.priorFrequency, 3) + " allele prior" },
        { key: "sample", value: lowDepthAlt + "/" + lowDepth + " alternate reads" },
        { key: "inference", value: result.genotype + " · GQ " + compact(result.genotypeQuality, 1) },
      ]));
      parts.explanation.innerHTML = "<strong>Joint genotyping improves consistency and low-depth sensitivity without pooling people into one specimen.</strong> A gVCF preserves evidence at variant and non-variant positions so the cohort model can revisit a site discovered elsewhere.";
    }

    function renderFilter() {
      const result = variantCallerModel({ kind: "filter", forwardAlt, reverseAlt, refCount: 12, altMapq, refMapq });
      parts.visual.replaceChildren(
        barBoard(el, [
          { label: "reference reads", value: result.refCount, display: compact(result.refCount, 0), tone: "signal" },
          { label: "alternate forward", value: result.forwardAlt, display: compact(result.forwardAlt, 0), tone: "active" },
          { label: "alternate reverse", value: result.reverseAlt, display: compact(result.reverseAlt, 0), tone: "warning" },
        ], "Strand and allele-balance evidence", result.refCount + result.altCount),
        statusStrip(el, [
          { label: "allele balance", value: percent(result.alleleBalance, 1) },
          { label: "strand imbalance", value: percent(result.strandImbalance, 1), tone: result.strandImbalance > 0.7 ? "warning" : "signal" },
          { label: "alternate−reference MAPQ", value: compact(result.mappingDelta, 0), tone: result.mappingDelta < -15 ? "warning" : "signal" },
          { label: "flags", value: result.flags.length ? result.flags.join("; ") : "none", tone: result.flags.length ? "warning" : "active" },
        ], "Variant-call artefact diagnostics")
      );
      parts.controls.replaceChildren(
        rangeControl(el, "Forward alternate reads", forwardAlt, { min: 0, max: 20, step: 1, format: (value) => compact(value, 0) }, (value) => { forwardAlt = value; render(); }),
        rangeControl(el, "Reverse alternate reads", reverseAlt, { min: 0, max: 20, step: 1, format: (value) => compact(value, 0) }, (value) => { reverseAlt = value; render(); }),
        rangeControl(el, "Reference-read mean MAPQ", refMapq, { min: 0, max: 60, step: 1, format: (value) => compact(value, 0) }, (value) => { refMapq = value; render(); }),
        rangeControl(el, "Alternate-read mean MAPQ", altMapq, { min: 0, max: 60, step: 1, format: (value) => compact(value, 0) }, (value) => { altMapq = value; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "candidate", value: result.altCount + " alternate reads" },
        { key: "direction", value: forwardAlt + " forward / " + reverseAlt + " reverse" },
        { key: "mapping context", value: "ΔMAPQ " + result.mappingDelta },
        { key: "filter evidence", value: result.flags.length ? result.flags.join(", ") : "clean fixture" },
      ]));
      parts.explanation.innerHTML = "<strong>A filter is evidence about an error mechanism, not a moral label on a variant.</strong> Hard filters are transparent thresholds; recalibration learns a multivariate boundary and must be trained on representative truth.";
    }

    function renderQc() {
      const fixtures = {
        titv: { observable: "Ti/Tv = 1.2", mechanism: "excess transversions or context mix", blind: "sample swaps with otherwise plausible spectra", next: "stratify known/novel and genomic context" },
        contamination: { observable: "heterozygous allele balance compressed", mechanism: "mixture of genomes", blind: "closely related contaminant can look subtle", next: "cross-sample genotype mixture model" },
        sex: { observable: "X/Y depth and heterozygosity mismatch", mechanism: "sample label or ploidy error", blind: "mosaicism and aneuploidy need richer models", next: "ploidy-aware depth and karyotype evidence" },
        relatedness: { observable: "kinship inconsistent with pedigree", mechanism: "swap, duplicate, or pedigree error", blind: "identical ancestry can inflate naive similarity", next: "IBD segment and population-aware estimate" },
        sv: { observable: "split reads + discordant pairs + depth shift", mechanism: "structural rearrangement", blind: "short-read repeats hide breakpoints", next: "local assembly or long-read validation" },
      };
      const fixture = fixtures[qcSignal];
      parts.visual.replaceChildren(
        processBoard(el, [
          { label: "observable", value: fixture.observable, tone: "warning" },
          { label: "candidate mechanism", value: fixture.mechanism, tone: "signal" },
          { label: "blind spot", value: fixture.blind },
          { label: "next evidence", value: fixture.next, tone: "active" },
        ], "Sample-level QC or structural-variant diagnosis"),
        claimBoundary(el, fixture.observable, "a unique diagnosis by itself", "QC metrics are complementary because each collapses different biology and technical errors.")
      );
      parts.controls.replaceChildren(el("div", { class: "lab-control-block" }, [
        el("span", { class: "lab-control-label", text: "QC / variant evidence" }),
        choiceRow(el, [
          { label: "Ti/Tv", value: "titv" },
          { label: "Contamination", value: "contamination" },
          { label: "Sex/ploidy", value: "sex" },
          { label: "Relatedness", value: "relatedness" },
          { label: "Structural variant", value: "sv" },
        ], qcSignal, (value) => { qcSignal = value; render(); }, "Sample QC evidence"),
      ]));
      parts.rail.replaceChildren(causalRail(el, [
        { key: "summary", value: fixture.observable },
        { key: "mechanism", value: fixture.mechanism },
        { key: "what it misses", value: fixture.blind },
        { key: "confirmation", value: fixture.next },
      ]));
      parts.explanation.innerHTML = "<strong>No single QC number certifies a sample.</strong> Structural variants are likewise not oversized SNVs: their evidence is a pattern across split reads, pairs, depth, assembly, and molecule span.";
    }

    function renderSomatic() {
      threshold = Math.min(threshold, somaticDepth);
      const result = variantCallerModel({ kind: "somatic", depth: somaticDepth, vaf: somaticVaf, errorRate, threshold });
      parts.visual.replaceChildren(
        barBoard(el, [
          { label: "true variant: P(pass threshold)", value: result.sensitivity, display: percent(result.sensitivity, 2), tone: "active" },
          { label: "background error: P(pass threshold)", value: result.falsePositive, display: percent(result.falsePositive, 4), tone: "warning" },
        ], "Somatic sensitivity and background-error tail", 1),
        statusStrip(el, [
          { label: "depth", value: compact(result.depth, 0) + "×", tone: "signal" },
          { label: "true VAF", value: percent(result.vaf, 2), tone: "active" },
          { label: "per-read error", value: percent(result.errorRate, 3) },
          { label: "minimum alternate reads", value: compact(result.threshold, 0), tone: "warning" },
        ], "Somatic threshold inputs")
      );
      parts.controls.replaceChildren(
        rangeControl(el, "Depth", somaticDepth, { min: 20, max: 1000, step: 10, format: (value) => compact(value, 0) + "×" }, (value) => { somaticDepth = value; threshold = Math.min(threshold, value); render(); }),
        rangeControl(el, "Variant allele fraction", somaticVaf, { min: 0.001, max: 0.2, step: 0.001, format: (value) => percent(value, 2) }, (value) => { somaticVaf = value; render(); }),
        rangeControl(el, "Background error probability", errorRate, { min: 0.0001, max: 0.02, step: 0.0001, format: (value) => percent(value, 3) }, (value) => { errorRate = value; render(); }),
        rangeControl(el, "Alternate-read threshold", threshold, { min: 1, max: Math.min(20, somaticDepth), step: 1, format: (value) => compact(value, 0) }, (value) => { threshold = value; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "variant process", value: percent(somaticVaf, 2) + " VAF" },
        { key: "error process", value: percent(errorRate, 3) + " per read" },
        { key: "decision", value: "≥" + threshold + " alternate reads" },
        { key: "trade-off", value: percent(result.sensitivity, 1) + " sensitivity / " + percent(result.falsePositive, 3) + " error tail" },
      ]));
      parts.explanation.innerHTML = "<strong>Somatic calling compares two rare-event processes.</strong> Raising the threshold suppresses errors and loses low-VAF truth. Duplex or UMI consensus changes the error model; depth alone does not.";
    }

    function renderCallable() {
      const result = variantCallerModel({ kind: "callable", depth: callableDepth, mapq: callableMapq, included: callableIncluded, referenceHasLocus });
      parts.visual.replaceChildren(
        processBoard(el, [
          { label: "reference representation", value: referenceHasLocus ? "locus exists" : "locus absent", tone: referenceHasLocus ? "signal" : "warning" },
          { label: "analysis mask", value: callableIncluded ? "included" : "excluded", tone: callableIncluded ? "signal" : "warning" },
          { label: "usable evidence", value: callableDepth + "× at MAPQ " + callableMapq },
          { label: "negative-result class", value: result.status, tone: result.status === "callable" ? "active" : "warning" },
        ], "Callable-region decision chain"),
        claimBoundary(el,
          result.status === "callable" ? "sufficient evidence to evaluate this represented locus" : "why this locus was not evaluated",
          "proof that the sample contains no variant",
          "A no-call, filtered call, excluded interval, and confident homozygous-reference genotype are not interchangeable."
        )
      );
      parts.controls.replaceChildren(
        el("div", { class: "lab-control-block" }, [el("span", { class: "lab-control-label", text: "Reference representation" }), choiceRow(el, [{ label: "Locus represented", value: true }, { label: "Locus absent", value: false }], referenceHasLocus, (value) => { referenceHasLocus = value; render(); }, "Reference locus representation")]),
        el("div", { class: "lab-control-block" }, [el("span", { class: "lab-control-label", text: "Analysis mask" }), choiceRow(el, [{ label: "Included", value: true }, { label: "Excluded", value: false }], callableIncluded, (value) => { callableIncluded = value; render(); }, "Callable analysis mask")]),
        rangeControl(el, "Depth", callableDepth, { min: 0, max: 60, step: 1, format: (value) => compact(value, 0) + "×" }, (value) => { callableDepth = value; render(); }),
        rangeControl(el, "Mapping quality", callableMapq, { min: 0, max: 60, step: 1, format: (value) => compact(value, 0) }, (value) => { callableMapq = value; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "representation", value: referenceHasLocus ? "present" : "missing" },
        { key: "analysis scope", value: callableIncluded ? "included" : "excluded" },
        { key: "read evidence", value: callableDepth + "× / MAPQ " + callableMapq },
        { key: "interpretation", value: result.status },
      ]));
      parts.explanation.innerHTML = "<strong>Absence of a VCF record is not evidence of absence.</strong> Report callable regions with the result so a negative statement names exactly where the assay could have found the requested class of variant.";
    }

    function render() {
      parts.tabHost.replaceChildren(tabs(el, modeChoices, mode, (value) => { mode = value; render(); }));
      if (mode === "posterior") renderPosterior();
      else if (mode === "haplotype") renderHaplotype();
      else if (mode === "joint") renderJoint();
      else if (mode === "filter") renderFilter();
      else if (mode === "qc") renderQc();
      else if (mode === "somatic") renderSomatic();
      else renderCallable();
    }

    predict(body, {
      widget: "variant-caller-lab",
      question: "A locus has no VCF record. Which conclusion is justified without a callable-region record?",
      hint: "Separate a confident reference genotype from an unexamined position.",
      options: [
        { label: "The sample is homozygous reference" },
        { label: "No variant exists in the sample" },
        { label: "None — the locus may be uncovered, unmappable, filtered, excluded, or absent from the reference", correct: true },
        { label: "The caller's sensitivity is 100%" },
      ],
    }, () => {
      mode = "callable";
      callableDepth = 0;
      parts.instrument.hidden = false;
      render();
    });
    finishLab(parts, body);
  });

  /* Chapter 47 — RNA-seq ---------------------------------------------- */

  define("rna-seq-lab", makeObjectiveMap("ch47", [
    "Balance biological condition across batches so the design matrix can separate the requested effect from technical variation.",
    "Choose poly-A selection, rRNA depletion, strandedness, and UMIs as measurement decisions with explicit transcript and molecule boundaries.",
    "Iterate expectation–maximisation to allocate ambiguous fragments, then convert expected fragment shares to transcript fractions with effective-length correction.",
    "Demonstrate why total-count scaling fails under composition shifts and recover a stable factor from genes that do not all move together.",
    "Connect negative-binomial overdispersion, shrinkage, and multiple testing to differential-expression uncertainty rather than only a fold change.",
    "Decompose bulk expression into cell-type proportions and within-cell expression so identical bulk values can encode different biological stories.",
    "Diagnose three-prime bias, rRNA carryover, genomic-DNA carryover, and global-shift artefacts from their characteristic QC patterns.",
  ]), function (api) {
    const { body, el, predict } = api;
    const parts = labParts(el);
    let mode = "design";
    let design = "balanced";
    let library = "polya";
    let stranded = true;
    let umi = false;
    let uniqueA = 60;
    let uniqueB = 20;
    let ambiguous = 40;
    let emIterations = 1;
    let compositionShift = true;
    let nbMean = 100;
    let nbDispersion = 0.1;
    let proportionA = 0.6;
    let expressionA = 100;
    let expressionB = 20;
    let qcSignature = "threePrime";

    const modeChoices = [
      { label: "Design", value: "design" },
      { label: "Library", value: "library" },
      { label: "Isoform EM", value: "em" },
      { label: "Normalization", value: "normalisation" },
      { label: "NB inference", value: "nb" },
      { label: "Bulk composition", value: "composition" },
      { label: "QC signatures", value: "qc" },
    ];

    function renderDesign() {
      const assignments = design === "balanced" ? ["control", "treated", "control", "treated"] : ["control", "control", "treated", "treated"];
      const result = rnaSeqModel({ kind: "design", assignment: assignments });
      parts.visual.replaceChildren(
        matrixBoard(el, ["Batch 1", "Batch 2"], [
          { label: "lane A", values: [assignments[0], assignments[2]], tones: [assignments[0] === "treated" ? "active" : "signal", assignments[2] === "treated" ? "active" : "signal"] },
          { label: "lane B", values: [assignments[1], assignments[3]], tones: [assignments[1] === "treated" ? "active" : "signal", assignments[3] === "treated" ? "active" : "signal"] },
        ], "Condition assignment across two RNA-seq batches"),
        statusStrip(el, [
          { label: "condition separable from batch?", value: result.estimable ? "yes" : "no", tone: result.estimable ? "active" : "warning" },
          { label: "replication unit", value: "biological sample / donor", tone: "signal" },
          { label: "depth substitute for replication?", value: "no" },
        ], "RNA-seq design identifiability")
      );
      parts.controls.replaceChildren(el("div", { class: "lab-control-block" }, [
        el("span", { class: "lab-control-label", text: "Condition-to-batch assignment" }),
        choiceRow(el, [{ label: "Balanced", value: "balanced" }, { label: "Confounded", value: "confounded" }], design, (value) => { design = value; render(); }, "RNA-seq batch design"),
      ]));
      parts.rail.replaceChildren(causalRail(el, [
        { key: "samples", value: "control + treated replicates" },
        { key: "batch assignment", value: design },
        { key: "design matrix", value: result.estimable ? "full-rank for condition" : "condition = batch" },
        { key: "claim", value: result.estimable ? "condition effect estimable" : "effect unidentified" },
      ]));
      parts.explanation.innerHTML = result.estimable
        ? "<strong>Condition varies within each batch.</strong> The model can estimate both effects. Additional biological replicates improve dispersion and generalization more than extra reads on the same libraries."
        : "<strong>No analysis can separate condition from batch here.</strong> A covariate cannot rescue perfect confounding because there is no within-batch condition contrast.";
    }

    function renderLibrary() {
      const fixtures = {
        polya: { input: "polyadenylated RNA", captures: "mature mRNA and many poly-A lncRNAs", misses: "non-polyadenylated RNA; 3′ degradation bias", use: "standard eukaryotic gene expression" },
        ribo: { input: "total RNA after rRNA depletion", captures: "coding + non-coding + many immature RNAs", misses: "residual rRNA; deeper sequencing needed", use: "degraded samples and broad transcriptomes" },
        small: { input: "size-selected small RNA", captures: "miRNA / siRNA-sized molecules", misses: "ordinary long transcripts", use: "small-RNA biology" },
      };
      const fixture = fixtures[library];
      parts.visual.replaceChildren(
        processBoard(el, [
          { label: "input", value: fixture.input },
          { label: "captured molecules", value: fixture.captures, tone: "signal" },
          { label: "characteristic loss", value: fixture.misses, tone: "warning" },
          { label: "best use", value: fixture.use, tone: "active" },
        ], "RNA-seq library measurement boundary"),
        statusStrip(el, [
          { label: "stranded?", value: stranded ? "yes — antisense separable" : "no — overlapping strands collapse", tone: stranded ? "signal" : "warning" },
          { label: "UMIs?", value: umi ? "yes — PCR descendants collapsible" : "no — reads remain amplification-weighted", tone: umi ? "active" : "muted" },
        ], "RNA-seq library bookkeeping choices")
      );
      parts.controls.replaceChildren(
        el("div", { class: "lab-control-block" }, [el("span", { class: "lab-control-label", text: "Library selection" }), choiceRow(el, [{ label: "Poly-A", value: "polya" }, { label: "rRNA depletion", value: "ribo" }, { label: "Small RNA", value: "small" }], library, (value) => { library = value; render(); }, "RNA library selection")]),
        el("div", { class: "lab-control-block" }, [el("span", { class: "lab-control-label", text: "Strand information" }), choiceRow(el, [{ label: "Stranded", value: true }, { label: "Unstranded", value: false }], stranded, (value) => { stranded = value; render(); }, "RNA-seq strandedness")]),
        el("div", { class: "lab-control-block" }, [el("span", { class: "lab-control-label", text: "Molecule tags" }), choiceRow(el, [{ label: "UMIs", value: true }, { label: "No UMIs", value: false }], umi, (value) => { umi = value; render(); }, "RNA-seq UMI use")])
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "sample RNA", value: fixture.input },
        { key: "selection", value: library },
        { key: "bookkeeping", value: (stranded ? "strand" : "no strand") + " + " + (umi ? "UMI" : "read") },
        { key: "measured universe", value: fixture.captures },
      ]));
      parts.explanation.innerHTML = "<strong>Library preparation defines the molecule universe before statistics begin.</strong> Strandedness resolves overlapping antisense transcription; UMIs collapse amplification descendants and estimate originals, subject to tag collisions and sequencing errors.";
    }

    function renderEm() {
      const result = rnaSeqModel({ kind: "em", uniqueA, uniqueB, ambiguous, lengthA: 1, lengthB: 1.5, iterations: emIterations });
      parts.visual.replaceChildren(
        barBoard(el, [
          { label: "unique to isoform A", value: uniqueA, display: compact(uniqueA, 0), tone: "signal" },
          { label: "ambiguous allocated to A", value: result.allocatedA, display: compact(result.allocatedA, 1), tone: "active" },
          { label: "ambiguous allocated to B", value: result.allocatedB, display: compact(result.allocatedB, 1), tone: "warning" },
          { label: "unique to isoform B", value: uniqueB, display: compact(uniqueB, 0), tone: "signal" },
        ], "Expectation-maximisation allocation of transcript-compatible reads", uniqueA + uniqueB + ambiguous),
        statusStrip(el, [
          { label: "expected fragment share A", value: result.identifiable ? percent(result.fragmentFractionA, 1) : "not identified", tone: "active" },
          { label: "expected fragment share B", value: result.identifiable ? percent(result.fragmentFractionB, 1) : "not identified", tone: "signal" },
          { label: "length-corrected transcript A", value: result.identifiable ? percent(result.abundanceA, 1) : "not identified", tone: "active" },
          { label: "length-corrected transcript B", value: result.identifiable ? percent(result.abundanceB, 1) : "not identified", tone: "signal" },
        ], "Transcript EM state")
      );
      parts.controls.replaceChildren(
        rangeControl(el, "Reads unique to isoform A", uniqueA, { min: 0, max: 100, step: 5, format: (value) => compact(value, 0) }, (value) => { uniqueA = value; render(); }),
        rangeControl(el, "Reads unique to isoform B", uniqueB, { min: 0, max: 100, step: 5, format: (value) => compact(value, 0) }, (value) => { uniqueB = value; render(); }),
        rangeControl(el, "Reads compatible with both", ambiguous, { min: 0, max: 100, step: 5, format: (value) => compact(value, 0) }, (value) => { ambiguous = value; render(); }),
        rangeControl(el, "EM iterations", emIterations, { min: 1, max: 12, step: 1, format: (value) => compact(value, 0) }, (value) => { emIterations = value; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "compatibility", value: ambiguous + " reads fit A or B" },
        { key: "fragment-origin model", value: result.identifiable ? percent(result.fragmentFractionA, 0) + " A" : "no fragments — unidentifiable" },
        { key: "expectation", value: compact(result.allocatedA, 1) + " ambiguous → A" },
        { key: "output", value: result.identifiable ? percent(result.abundanceA, 0) + " transcript A after length correction" : "no abundance estimate" },
      ]));
      parts.explanation.innerHTML = "<strong>EM preserves uncertainty rather than inventing unique placements.</strong> In this equal-compatibility fixture, the E-step allocates ambiguous fragments by current fragment-origin probability and the M-step updates that probability. Effective length is then used to convert expected fragment shares into transcript fractions; production models also include fragment length, bias, and alignment likelihood.";
    }

    function renderNormalisation() {
      const counts = compositionShift
        ? [[100, 100], [100, 100], [100, 100], [100, 1000]]
        : [[100, 200], [100, 200], [100, 200], [100, 200]];
      const result = rnaSeqModel({ kind: "normalisation", counts });
      parts.visual.replaceChildren(
        matrixBoard(el, ["Sample A", "Sample B"], counts.map((row, index) => ({ label: "gene " + (index + 1), values: row.map((value) => compact(value, 0)), tones: index === 3 ? ["muted", "active"] : ["signal", "signal"] })), "RNA-seq gene counts before normalization"),
        statusStrip(el, [
          { label: "total-count scale B/A", value: compact(result.totalScale, 3), tone: compositionShift ? "warning" : "signal" },
          { label: "robust size factor A", value: compact(result.sizeFactors[0], 3), tone: "active" },
          { label: "robust size factor B", value: compact(result.sizeFactors[1], 3), tone: "active" },
          { label: "truth fixture", value: compositionShift ? "one gene changed" : "all genes doubled" },
        ], "Total-count and median-ratio normalization")
      );
      parts.controls.replaceChildren(el("div", { class: "lab-control-block" }, [
        el("span", { class: "lab-control-label", text: "Count-matrix fixture" }),
        choiceRow(el, [{ label: "One dominant gene changes", value: true }, { label: "Every gene doubles", value: false }], compositionShift, (value) => { compositionShift = value; render(); }, "RNA-seq composition fixture"),
      ]));
      parts.rail.replaceChildren(causalRail(el, [
        { key: "count matrix", value: compositionShift ? "one transcript dominates B" : "global twofold RNA output" },
        { key: "total-count assumption", value: "same total output" },
        { key: "robust reference", value: "median gene ratio" },
        { key: "identifiable claim", value: compositionShift ? "unchanged genes stay unchanged" : "global shift needs spike-ins / cell counts" },
      ]));
      parts.explanation.innerHTML = compositionShift
        ? "<strong>Total-count scaling makes unchanged genes look lower when one transcript consumes the library.</strong> A robust size factor relies on most genes not moving together."
        : "<strong>No relative normalization can discover that every transcript doubled.</strong> The count matrix is compositional; external spike-ins, cell numbers, or another absolute reference are required.";
    }

    function renderNb() {
      const result = rnaSeqModel({ kind: "negativeBinomial", mean: nbMean, dispersion: nbDispersion });
      const rawFold = 2.4;
      const shrink = 1 / (1 + 30 / Math.max(1, nbMean));
      const shrunkenFold = 1 + (rawFold - 1) * shrink;
      parts.visual.replaceChildren(
        barBoard(el, [
          { label: "Poisson variance μ", value: result.poissonVariance, display: compact(result.poissonVariance, 1), tone: "muted" },
          { label: "negative-binomial variance μ + αμ²", value: result.variance, display: compact(result.variance, 1), tone: "warning" },
        ], "Count variance under Poisson and negative-binomial models", Math.max(result.variance, result.poissonVariance)),
        statusStrip(el, [
          { label: "mean", value: compact(result.mean, 1) },
          { label: "dispersion α", value: compact(result.dispersion, 3), tone: "signal" },
          { label: "raw fold change", value: compact(rawFold, 2) + "×", tone: "warning" },
          { label: "illustrative shrunken fold", value: compact(shrunkenFold, 2) + "×", tone: "active" },
        ], "Differential-expression uncertainty and shrinkage")
      );
      parts.controls.replaceChildren(
        rangeControl(el, "Mean count", nbMean, { min: 1, max: 1000, step: 5, format: (value) => compact(value, 0) }, (value) => { nbMean = value; render(); }),
        rangeControl(el, "Dispersion", nbDispersion, { min: 0, max: 1, step: 0.01, format: (value) => compact(value, 2) }, (value) => { nbDispersion = value; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "replicate counts", value: "mean " + compact(nbMean, 0) },
        { key: "biological overdispersion", value: "α = " + compact(nbDispersion, 2) },
        { key: "uncertainty", value: "variance " + compact(result.variance, 1) },
        { key: "inference", value: "GLM + fitted shrinkage + FDR" },
      ]));
      parts.explanation.innerHTML = "<strong>RNA-seq variability grows faster than the mean.</strong> Dispersion is learned across genes and replicates. The displayed shrinkage is a teaching curve; production methods fit priors from the experiment. FDR addresses the fact that thousands of genes are tested together.";
    }

    function renderComposition() {
      const result = rnaSeqModel({ kind: "composition", proportionA, expressionA, expressionB });
      parts.visual.replaceChildren(
        barBoard(el, [
          { label: "cell type A contribution", value: proportionA * expressionA, display: compact(proportionA * expressionA, 1), tone: "active" },
          { label: "cell type B contribution", value: (1 - proportionA) * expressionB, display: compact((1 - proportionA) * expressionB, 1), tone: "signal" },
        ], "Cell-type contributions to bulk expression", Math.max(1, result.bulk)),
        statusStrip(el, [
          { label: "A proportion", value: percent(proportionA, 0) },
          { label: "A per-cell expression", value: compact(expressionA, 0) },
          { label: "B per-cell expression", value: compact(expressionB, 0) },
          { label: "bulk measurement", value: compact(result.bulk, 1), tone: "active" },
        ], "Bulk composition and state mixture")
      );
      parts.controls.replaceChildren(
        rangeControl(el, "Cell type A proportion", proportionA, { min: 0, max: 1, step: 0.05, format: (value) => percent(value, 0) }, (value) => { proportionA = value; render(); }),
        rangeControl(el, "Expression per A cell", expressionA, { min: 0, max: 200, step: 5, format: (value) => compact(value, 0) }, (value) => { expressionA = value; render(); }),
        rangeControl(el, "Expression per B cell", expressionB, { min: 0, max: 200, step: 5, format: (value) => compact(value, 0) }, (value) => { expressionB = value; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "mixture", value: percent(proportionA, 0) + " type A" },
        { key: "cell states", value: expressionA + " A / " + expressionB + " B" },
        { key: "weighted sum", value: compact(result.bulk, 1) },
        { key: "ambiguity", value: "many mixtures produce the same bulk" },
      ]));
      parts.explanation.innerHTML = "<strong>A bulk change can be composition, state, or both.</strong> The weighted sum is underdetermined without cell proportions or single-cell/reference information; differential expression alone cannot identify the story.";
    }

    function renderQc() {
      const result = rnaSeqModel({ kind: "qc", signature: qcSignature });
      const patterns = {
        threePrime: "5′ ▁▁▂▃▄▅▆▇█ 3′",
        rrna: "rRNA ████████  genes ██",
        genomic: "exon ███  intron ███  intergenic ██",
        global: "most genes shift together; totals remain fixed",
      };
      parts.visual.replaceChildren(
        sequenceBoard(el, [
          { label: "QC pattern", sequence: patterns[qcSignature], tone: "warning" },
          { label: "diagnosis", sequence: result.diagnosis, tone: "active" },
        ], "RNA-seq failure signature"),
        claimBoundary(el,
          "a characteristic pattern consistent with " + result.diagnosis,
          "a unique root cause without library metadata and orthogonal QC",
          "Inspect sample-level distributions and whether the pattern co-varies with condition before testing genes."
        )
      );
      parts.controls.replaceChildren(el("div", { class: "lab-control-block" }, [
        el("span", { class: "lab-control-label", text: "Observed QC signature" }),
        choiceRow(el, [
          { label: "3′ coverage rise", value: "threePrime" },
          { label: "rRNA-dominated", value: "rrna" },
          { label: "Intergenic/intronic excess", value: "genomic" },
          { label: "Global shift", value: "global" },
        ], qcSignature, (value) => { qcSignature = value; render(); }, "RNA-seq QC signature"),
      ]));
      parts.rail.replaceChildren(causalRail(el, [
        { key: "matrix / coverage", value: patterns[qcSignature] },
        { key: "signature", value: qcSignature },
        { key: "mechanism", value: result.diagnosis },
        { key: "action", value: "fix design/model or bound the claim" },
      ]));
      parts.explanation.innerHTML = "<strong>Failure modes announce themselves before the differential-expression table.</strong> PCA, library composition, gene-body coverage, strandedness, and genomic distribution are model checks, not decorative QC.";
    }

    function render() {
      parts.tabHost.replaceChildren(tabs(el, modeChoices, mode, (value) => { mode = value; render(); }));
      if (mode === "design") renderDesign();
      else if (mode === "library") renderLibrary();
      else if (mode === "em") renderEm();
      else if (mode === "normalisation") renderNormalisation();
      else if (mode === "nb") renderNb();
      else if (mode === "composition") renderComposition();
      else renderQc();
    }

    predict(body, {
      widget: "rna-seq-lab",
      question: "All controls were prepared in batch 1 and all treated samples in batch 2. Can a model containing both condition and batch estimate the treatment effect?",
      hint: "Look for any within-batch condition contrast.",
      options: [
        { label: "Yes, if sequencing depth is high enough" },
        { label: "Yes, after total-count normalization" },
        { label: "No — condition and batch are perfectly confounded", correct: true },
        { label: "Only if every gene is significant" },
      ],
    }, () => {
      design = "confounded";
      mode = "design";
      parts.instrument.hidden = false;
      render();
    });
    finishLab(parts, body);
  });

  /* Chapter 48 — Single-cell and spatial genomics ---------------------- */

  define("single-cell-atlas-lab", makeObjectiveMap("ch48", [
    "Construct identical bulk measurements from different cell proportions and per-cell expression states to expose the composition-state confound.",
    "Trace a transcript through cell barcode, UMI, sequencing reads, and a count matrix while separating ambient, doublet, and empty-droplet artefacts.",
    "Derive the expected zero fraction from ordinary Poisson sampling and distinguish UMI count sparsity from an automatic zero-inflation claim.",
    "Read a UMAP as a local-neighbour visualization whose global distance, orientation, and gaps change with layout settings while cluster labels change separately with clustering resolution.",
    "Treat donors rather than cells as independent condition replicates and avoid testing markers on clusters selected from the same unsplit counts.",
    "Show how batch integration can remove a real condition axis and why trajectory or velocity direction requires time-resolved validation.",
    "Invert a spatial spot mixture into cell-type proportions and compare capture-based breadth with imaging-based molecular resolution.",
  ]), function (api) {
    const { body, el, predict } = api;
    const parts = labParts(el);
    let mode = "composition";
    let proportionA = 0.6;
    let expressionA = 100;
    let expressionB = 25;
    let molecules = 60;
    let reads = 180;
    let artifact = "ambient";
    let zeroMean = 0.1;
    let minGenes = 500;
    let cellGenes = 450;
    let mitoFraction = 0.08;
    let neighbors = 15;
    let clusterResolution = 0.8;
    let layoutSeed = 1;
    let donors = 4;
    let cellsPerDonor = 500;
    let intraclass = 0.15;
    let correction = 0.6;
    let spatialA = 0.55;

    const modeChoices = [
      { label: "Bulk confound", value: "composition" },
      { label: "Barcode + UMI", value: "molecule" },
      { label: "Droplet artefacts", value: "artifacts" },
      { label: "Zeros + QC", value: "zeros" },
      { label: "UMAP + clusters", value: "umap" },
      { label: "Donors + integration", value: "testing" },
      { label: "Spatial inverse", value: "spatial" },
    ];

    function renderComposition() {
      const alternatives = singleCellModel({ kind: "compositionAlternative", proportionA, expressionA, expressionB });
      const result = alternatives.current;
      parts.visual.replaceChildren(
        matrixBoard(el, ["Type A fraction", "A expression", "B expression", "Bulk"], [
          { label: "current story", values: [percent(proportionA, 0), compact(expressionA, 1), compact(expressionB, 1), compact(result.bulk, 1)], tones: ["active", "active", "signal", "active"] },
          { label: "same-bulk alternative", values: [percent(alternatives.alternativeProportion, 0), compact(alternatives.alternativeA, 1), compact(alternatives.alternativeB, 1), compact(alternatives.alternativeBulk, 1)], tones: ["warning", "warning", "signal", "active"] },
        ], "Two cell mixtures producing the same bulk expression"),
        barBoard(el, [
          { label: "A contribution", value: proportionA * expressionA, display: compact(proportionA * expressionA, 1), tone: "active" },
          { label: "B contribution", value: (1 - proportionA) * expressionB, display: compact((1 - proportionA) * expressionB, 1), tone: "signal" },
        ], "Current bulk-expression contributions", Math.max(1, result.bulk))
      );
      parts.controls.replaceChildren(
        rangeControl(el, "Type A proportion", proportionA, { min: 0.05, max: 0.95, step: 0.05, format: (value) => percent(value, 0) }, (value) => { proportionA = value; render(); }),
        rangeControl(el, "Expression per A cell", expressionA, { min: 0, max: 200, step: 5, format: (value) => compact(value, 0) }, (value) => { expressionA = value; render(); }),
        rangeControl(el, "Expression per B cell", expressionB, { min: 0, max: 200, step: 5, format: (value) => compact(value, 0) }, (value) => { expressionB = value; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "cell proportions", value: percent(proportionA, 0) + " A" },
        { key: "per-cell state", value: expressionA + " A / " + expressionB + " B" },
        { key: "weighted average", value: compact(result.bulk, 1) },
        { key: "identifiability", value: "bulk alone cannot choose the story" },
      ]));
      parts.explanation.innerHTML = "<strong>Composition and state are mathematically interchangeable inside one bulk average.</strong> Single-cell or measured composition adds the missing dimensions; it does not make sampling and design problems disappear.";
    }

    function renderMolecule() {
      const result = singleCellModel({ kind: "umi", molecules, reads });
      const barcode = "CELL-A7";
      parts.visual.replaceChildren(
        processBoard(el, [
          { label: "droplet", value: "one cell + barcoded bead" },
          { label: "cell barcode", value: barcode, tone: "signal" },
          { label: "UMI", value: "one random tag per captured molecule", tone: "active" },
          { label: "matrix entry", value: "unique UMIs per gene × cell" },
        ], "Transcript-to-single-cell-count pathway"),
        barBoard(el, [
          { label: "sequencing reads", value: result.reads, display: compact(result.reads, 0), tone: "signal" },
          { label: "distinct molecules observed", value: result.observed, display: compact(result.observed, 1), tone: "active" },
          { label: "PCR / resampling duplicates", value: result.duplicateReads, display: compact(result.duplicateReads, 1), tone: "warning" },
        ], "Reads collapsed by UMI to original molecules", Math.max(1, result.reads))
      );
      parts.controls.replaceChildren(
        rangeControl(el, "Captured molecules for one gene", molecules, { min: 5, max: 200, step: 5, format: (value) => compact(value, 0) }, (value) => { molecules = value; render(); }),
        rangeControl(el, "Reads from those molecules", reads, { min: 0, max: 500, step: 10, format: (value) => compact(value, 0) }, (value) => { reads = value; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "partition", value: barcode },
        { key: "molecule labels", value: molecules + " possible originals" },
        { key: "sequencing", value: reads + " reads" },
        { key: "count matrix", value: compact(result.observed, 1) + " UMI molecules" },
      ]));
      parts.explanation.innerHTML = "<strong>Cell barcodes answer where; UMIs estimate how many original molecules were captured.</strong> Once every captured molecule has been seen, additional reads mostly revisit existing UMIs. Real counting must also handle UMI collisions, tag errors, and capture inefficiency.";
    }

    function renderArtifacts() {
      const fixtures = {
        ambient: { droplet: "one real cell + free soup RNA", matrix: "low-level markers from abundant lysed cell types", diagnosis: "ambient contamination", test: "empty droplets estimate the soup profile" },
        doublet: { droplet: "two cells in one partition", matrix: "incompatible lineage markers co-occur at high counts", diagnosis: "doublet / multiplet", test: "loading-rate model plus synthetic doublet neighbors" },
        empty: { droplet: "barcoded bead, no cell", matrix: "low counts matching the ambient pool", diagnosis: "empty droplet", test: "distinguish count knee from ambient statistical test" },
      };
      const fixture = fixtures[artifact];
      const droplets = Array.from({ length: 30 }, (_, index) => ({ x: 7 + (index % 10) * 9.5, y: 15 + Math.floor(index / 10) * 34, tone: index === 12 ? "warning" : index % 4 === 0 ? "active" : "muted" }));
      parts.visual.replaceChildren(
        dotField(el, droplets, "Droplet field with one selected artefact fixture"),
        processBoard(el, [
          { label: "partition contents", value: fixture.droplet },
          { label: "matrix signature", value: fixture.matrix, tone: "warning" },
          { label: "diagnosis", value: fixture.diagnosis, tone: "active" },
          { label: "evidence", value: fixture.test, tone: "signal" },
        ], "Single-cell droplet artefact diagnosis")
      );
      parts.controls.replaceChildren(el("div", { class: "lab-control-block" }, [
        el("span", { class: "lab-control-label", text: "Droplet artefact" }),
        choiceRow(el, [{ label: "Ambient RNA", value: "ambient" }, { label: "Doublet", value: "doublet" }, { label: "Empty droplet", value: "empty" }], artifact, (value) => { artifact = value; render(); }, "Droplet artefact"),
      ]));
      parts.rail.replaceChildren(causalRail(el, [
        { key: "droplet", value: fixture.droplet },
        { key: "observed counts", value: fixture.matrix },
        { key: "latent error", value: fixture.diagnosis },
        { key: "diagnostic evidence", value: fixture.test },
      ]));
      parts.explanation.innerHTML = "<strong>These artefacts change different axes of the matrix.</strong> Ambient RNA adds foreign molecules, a doublet merges two real cells, and an empty droplet contains no cell at all. One universal count threshold cannot solve all three.";
    }

    function renderZeros() {
      const zero = singleCellModel({ kind: "zeros", mean: zeroMean });
      const qc = singleCellModel({ kind: "qc", minGenes, cellGenes, mitochondrialFraction: mitoFraction, maxMito: 0.15 });
      parts.visual.replaceChildren(
        barBoard(el, [
          { label: "zero UMI count", value: zero.zeroProbability, display: percent(zero.zeroProbability, 1), tone: "warning" },
          { label: "one or more molecules", value: zero.detectedProbability, display: percent(zero.detectedProbability, 1), tone: "active" },
        ], "Poisson sampling outcome for one gene in one cell", 1),
        statusStrip(el, [
          { label: "expected molecules λ", value: compact(zero.mean, 2), tone: "signal" },
          { label: "cell genes detected", value: compact(cellGenes, 0) },
          { label: "QC minimum", value: compact(minGenes, 0) },
          { label: "cell retained?", value: qc.retained ? "yes" : "no", tone: qc.retained ? "active" : "warning" },
        ], "Sampling zeros and cell-quality filter")
      );
      parts.controls.replaceChildren(
        rangeControl(el, "Expected captured molecules for this gene", zeroMean, { min: 0, max: 3, step: 0.05, format: (value) => compact(value, 2) }, (value) => { zeroMean = value; render(); }),
        rangeControl(el, "Minimum detected genes", minGenes, { min: 100, max: 2000, step: 50, format: (value) => compact(value, 0) }, (value) => { minGenes = value; render(); }),
        rangeControl(el, "Genes detected in selected cell", cellGenes, { min: 100, max: 3000, step: 50, format: (value) => compact(value, 0) }, (value) => { cellGenes = value; render(); }),
        rangeControl(el, "Mitochondrial read fraction", mitoFraction, { min: 0, max: 0.5, step: 0.01, format: (value) => percent(value, 0) }, (value) => { mitoFraction = value; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "true mean", value: compact(zeroMean, 2) + " captured molecules" },
        { key: "sampling", value: "Poisson" },
        { key: "zero probability", value: "e^-λ = " + percent(zero.zeroProbability, 1) },
        { key: "QC consequence", value: qc.retained ? "cell retained" : "cell type may be filtered" },
      ]));
      parts.explanation.innerHTML = "<strong>A sparse UMI matrix is the expected consequence of shallow molecular sampling.</strong> Fixed gene-count thresholds can preferentially delete small or low-RNA cell types, turning technical QC into biological selection.";
    }

    function renderUmap() {
      const angle = layoutSeed * 0.71;
      const separation = 18 + (50 - neighbors) * 0.45;
      const points = [];
      for (let index = 0; index < 48; index += 1) {
        const group = index < 24 ? -1 : 1;
        const local = index % 24;
        const radius = 5 + (local % 6) * 2.2;
        const theta = local * 1.7 + angle;
        const baseX = 50 + group * separation;
        const baseY = 50 + group * (neighbors - 15) * 0.45;
        points.push({
          x: baseX + radius * Math.cos(theta) * Math.cos(angle) - radius * Math.sin(theta) * Math.sin(angle),
          y: baseY + radius * Math.cos(theta) * Math.sin(angle) + radius * Math.sin(theta) * Math.cos(angle),
          tone: group < 0 ? "active" : "signal",
        });
      }
      const apparentClusters = Math.max(2, Math.round(1 + clusterResolution * 4));
      parts.visual.replaceChildren(
        dotField(el, points, "Two local-neighbour groups embedded with UMAP-like layout seed " + layoutSeed + ", neighbor setting " + neighbors + ", and cluster resolution " + clusterResolution),
        statusStrip(el, [
          { label: "n_neighbors", value: compact(neighbors, 0), tone: "signal" },
          { label: "layout seed", value: compact(layoutSeed, 0) },
          { label: "clustering resolution", value: compact(clusterResolution, 2), tone: "active" },
          { label: "teaching cluster count", value: compact(apparentClusters, 0), tone: "warning" },
        ], "Embedding and clustering choices")
      );
      parts.controls.replaceChildren(
        rangeControl(el, "UMAP neighbor count", neighbors, { min: 5, max: 50, step: 5, format: (value) => compact(value, 0) }, (value) => { neighbors = value; render(); }),
        rangeControl(el, "Layout seed", layoutSeed, { min: 1, max: 9, step: 1, format: (value) => compact(value, 0) }, (value) => { layoutSeed = value; render(); }),
        rangeControl(el, "Clustering resolution", clusterResolution, { min: 0.2, max: 2, step: 0.1, format: (value) => compact(value, 1) }, (value) => { clusterResolution = value; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "expression matrix", value: "high-dimensional distances" },
        { key: "neighbor graph", value: neighbors + " neighbors" },
        { key: "2D layout", value: "seed " + layoutSeed + " controls arbitrary orientation; neighbors alter gaps" },
        { key: "cluster call", value: apparentClusters + " at chosen resolution" },
      ]));
      parts.explanation.innerHTML = "<strong>Trust local neighborhoods more than global geometry.</strong> Axis direction, rotation, gap width, and between-cluster distance depend on the embedding. Clustering resolution changes labels on the neighbor graph; it does not physically push UMAP points apart.";
    }

    function renderTesting() {
      const pseudo = singleCellModel({ kind: "pseudoreplication", donors, cellsPerDonor, intraclass });
      const integration = singleCellModel({ kind: "integration", batchStrength: 0.8, conditionStrength: 0.6, correction });
      parts.visual.replaceChildren(
        statusStrip(el, [
          { label: "donors", value: compact(donors, 0), tone: "active" },
          { label: "cells", value: compact(pseudo.cells, 0), tone: "signal" },
          { label: "within-donor correlation", value: compact(intraclass, 2) },
          { label: "effective independent cells", value: compact(pseudo.effectiveCells, 1), tone: "warning" },
        ], "Pseudoreplication design effect"),
        barBoard(el, [
          { label: "residual batch axis", value: integration.residualBatch, display: percent(integration.residualBatch, 0), tone: "warning" },
          { label: "retained condition axis", value: integration.retainedCondition, display: percent(integration.retainedCondition, 0), tone: "active" },
        ], "Illustrative integration trade-off: removing batch and correlated condition signal", 1),
        claimBoundary(el,
          "condition differences replicated across independent donors",
          "thousands of independent biological replicates or causal trajectory direction from one snapshot",
          "Use donor-level models or pseudobulk; validate trajectories with perturbation, lineage tracing, or time series."
        )
      );
      parts.controls.replaceChildren(
        rangeControl(el, "Independent donors", donors, { min: 2, max: 20, step: 1, format: (value) => compact(value, 0) }, (value) => { donors = value; render(); }),
        rangeControl(el, "Cells per donor", cellsPerDonor, { min: 50, max: 2000, step: 50, format: (value) => compact(value, 0) }, (value) => { cellsPerDonor = value; render(); }),
        rangeControl(el, "Within-donor correlation", intraclass, { min: 0, max: 0.8, step: 0.05, format: (value) => compact(value, 2) }, (value) => { intraclass = value; render(); }),
        rangeControl(el, "Integration correction strength", correction, { min: 0, max: 1, step: 0.05, format: (value) => percent(value, 0) }, (value) => { correction = value; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "sampling unit", value: donors + " donors" },
        { key: "nested observations", value: cellsPerDonor + " cells/donor" },
        { key: "correction", value: percent(correction, 0) },
        { key: "risk", value: "pseudo-replication + erased condition" },
      ]));
      parts.explanation.innerHTML = "<strong>Cells inherit donor-level biology and are not independent treatment replicates.</strong> Integration is also a modeling choice: when batch and condition align, removing one can remove the other. Marker testing requires held-out counts or selection-aware methods.";
    }

    function renderSpatial() {
      const result = singleCellModel({ kind: "spatial", cellA: [10, 2], cellB: [2, 10], proportionA: spatialA });
      parts.visual.replaceChildren(
        matrixBoard(el, ["Marker A", "Marker B"], [
          { label: "cell type A reference", values: ["10", "2"], tones: ["active", "muted"] },
          { label: "cell type B reference", values: ["2", "10"], tones: ["muted", "signal"] },
          { label: "observed spatial spot", values: result.spot.map((value) => compact(value, 2)), tones: ["active", "signal"] },
        ], "Spatial spot as a mixture of two cell-type reference profiles"),
        statusStrip(el, [
          { label: "inferred type A fraction", value: percent(spatialA, 0), tone: "active" },
          { label: "type B fraction", value: percent(1 - spatialA, 0), tone: "signal" },
          { label: "capture-based strength", value: "whole transcriptome" },
          { label: "imaging-based strength", value: "subcellular molecule positions" },
        ], "Spatial assay and mixture trade-off")
      );
      parts.controls.replaceChildren(rangeControl(el, "Type A fraction in spot", spatialA, { min: 0, max: 1, step: 0.05, format: (value) => percent(value, 0) }, (value) => { spatialA = value; render(); }));
      parts.rail.replaceChildren(causalRail(el, [
        { key: "spot", value: "mixed capture area" },
        { key: "reference profiles", value: "A=[10,2], B=[2,10]" },
        { key: "inverse problem", value: "solve non-negative proportions" },
        { key: "composition", value: percent(spatialA, 0) + " A / " + percent(1 - spatialA, 0) + " B" },
      ]));
      parts.explanation.innerHTML = "<strong>Spot deconvolution is the bulk-composition problem run backwards.</strong> Capture-based assays trade cellular resolution for breadth; imaging assays trade breadth and segmentation complexity for true molecular coordinates.";
    }

    function render() {
      parts.tabHost.replaceChildren(tabs(el, modeChoices, mode, (value) => { mode = value; render(); }));
      if (mode === "composition") renderComposition();
      else if (mode === "molecule") renderMolecule();
      else if (mode === "artifacts") renderArtifacts();
      else if (mode === "zeros") renderZeros();
      else if (mode === "umap") renderUmap();
      else if (mode === "testing") renderTesting();
      else renderSpatial();
    }

    predict(body, {
      widget: "single-cell-atlas-lab",
      question: "A gene has mean capture λ = 0.1 molecule per cell. Under ordinary Poisson sampling, roughly what fraction of cells have zero counts?",
      hint: "P(0) = e^−λ.",
      options: [
        { label: "10%" },
        { label: "37%" },
        { label: "90%", correct: true },
        { label: "100%, proving zero inflation" },
      ],
    }, () => {
      mode = "zeros";
      zeroMean = 0.1;
      parts.instrument.hidden = false;
      render();
    });
    finishLab(parts, body);
  });

  /* Chapter 49 — Chromatin and epigenome profiling -------------------- */

  define("epigenome-assay-lab", makeObjectiveMap("ch49", [
    "Choose a chromatin assay from the biological question and keep the physical signal and characteristic artefact beside the result.",
    "Compute ChIP enrichment against a scaled control and treat peak strength, reproducibility, FRiP, NSC, RSC, and IDR as distinct evidence.",
    "Separate accessibility from regulatory function and decompose an apparent footprint into residence-dependent protection and enzyme sequence bias.",
    "Calculate methylation beta and sampling error while exposing conversion failure, reduced sequence complexity, and native-read alternatives.",
    "Reconstruct a bulk methylation change from cell-composition weights and distinguish it from a within-cell-type epigenetic change.",
    "Contrast reporter sufficiency with endogenous CRISPR necessity and name the characteristic false positive and false negative of each.",
    "Decode a multivariate chromatin-state emission pattern while keeping the human state label distinct from a fitted hidden-state identifier and function claim.",
  ]), function (api) {
    const { body, el, predict } = api;
    const parts = labParts(el);
    let mode = "assay";
    let assayQuestion = "binding";
    let chipReads = 90;
    let controlReads = 20;
    let occupancy = 0.8;
    let residence = 0.5;
    let cleavageBias = 0.2;
    let methylated = 14;
    let unmethylated = 16;
    let conversion = 0.99;
    let methWeightA = 0.65;
    let betaA = 0.85;
    let betaB = 0.15;
    let causalityAssay = "mpra";
    const marks = { k4me3: 0.9, k4me1: 0.5, k27ac: 0.8, k36me3: 0.1, k27me3: 0.05 };

    const modeChoices = [
      { label: "Choose assay", value: "assay" },
      { label: "Peak + control", value: "peak" },
      { label: "Footprint trap", value: "footprint" },
      { label: "Methylation", value: "methylation" },
      { label: "Composition", value: "composition" },
      { label: "Sufficiency / necessity", value: "causality" },
      { label: "State decoder", value: "state" },
    ];

    function renderAssay() {
      const result = epigenomeModel({ kind: "assay", question: assayQuestion });
      parts.visual.replaceChildren(
        processBoard(el, [
          { label: "biological question", value: assayQuestion },
          { label: "assay", value: result.assay, tone: "active" },
          { label: "physical signal", value: result.signal, tone: "signal" },
          { label: "blind spot", value: result.blind, tone: "warning" },
        ], "Question-to-epigenome-assay choice"),
        claimBoundary(el, result.signal, result.blind, "The assay reports a physical consequence of chromatin state; interpretation needs controls and often perturbation.")
      );
      parts.controls.replaceChildren(el("div", { class: "lab-control-block" }, [
        el("span", { class: "lab-control-label", text: "Biological question" }),
        choiceRow(el, [
          { label: "Protein binding", value: "binding" },
          { label: "Accessibility", value: "access" },
          { label: "DNA methylation", value: "methylation" },
          { label: "Engaged transcription", value: "transcription" },
        ], assayQuestion, (value) => { assayQuestion = value; render(); }, "Epigenome assay question"),
      ]));
      parts.rail.replaceChildren(causalRail(el, [
        { key: "question", value: assayQuestion },
        { key: "physical operation", value: result.assay },
        { key: "signal", value: result.signal },
        { key: "claim boundary", value: result.blind },
      ]));
      parts.explanation.innerHTML = "<strong>Assays measure different physical shadows of regulation.</strong> Binding, accessibility, methylation, and engaged polymerase are not interchangeable; choose the operation whose failure mode is acceptable for the question.";
    }

    function renderPeak() {
      const result = epigenomeModel({ kind: "peak", chip: chipReads, control: controlReads, scale: 1 });
      parts.visual.replaceChildren(
        barBoard(el, [
          { label: "ChIP / CUT signal", value: result.chip, display: compact(result.chip, 0), tone: "active" },
          { label: "scaled control expectation", value: result.expectedBackground, display: compact(result.expectedBackground, 0), tone: "signal" },
        ], "Observed signal versus matched background", Math.max(1, result.chip, result.expectedBackground)),
        statusStrip(el, [
          { label: "fold enrichment", value: compact(result.fold, 2) + "×", tone: "active" },
          { label: "Poisson teaching z", value: compact(result.z, 2), tone: "signal" },
          { label: "FRiP asks", value: "fraction of reads in called peaks" },
          { label: "IDR asks", value: "replicate reproducibility", tone: "warning" },
        ], "Peak strength and distinct QC questions")
      );
      parts.controls.replaceChildren(
        rangeControl(el, "Immunoprecipitated / tethered-cut reads", chipReads, { min: 0, max: 200, step: 5, format: (value) => compact(value, 0) }, (value) => { chipReads = value; render(); }),
        rangeControl(el, "Matched-control reads", controlReads, { min: 0, max: 100, step: 2, format: (value) => compact(value, 0) }, (value) => { controlReads = value; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "target library", value: chipReads + " reads" },
        { key: "background model", value: controlReads + " control reads" },
        { key: "enrichment", value: compact(result.fold, 2) + "×" },
        { key: "claim", value: "candidate occupied / marked region" },
      ]));
      parts.explanation.innerHTML = "<strong>The control is part of the peak model, not optional decoration.</strong> Open chromatin, copy number, fragmentation, and mappability enrich both target and control. FRiP, strand cross-correlation, and IDR answer different quality questions.";
    }

    function renderFootprint() {
      const result = epigenomeModel({ kind: "footprint", occupancy, residence, cleavageBias });
      parts.visual.replaceChildren(
        barBoard(el, [
          { label: "residence-weighted biological dip", value: result.biologicalDip, display: percent(result.biologicalDip, 1), tone: "active" },
          { label: "observed dip including enzyme bias", value: result.observedDip, display: percent(result.observedDip, 1), tone: "warning" },
          { label: "fraction of dip attributable to bias", value: result.falseFraction, display: percent(result.falseFraction, 1), tone: "warning" },
        ], "Observed accessibility footprint decomposition", 1),
        claimBoundary(el,
          "a local depletion of cleavage events under this enzyme and digestion condition",
          "absence or occupancy of a transcription factor without residence-time and bias models",
          "Fast-binding factors can leave no footprint; enzyme sequence preference can manufacture one at the motif itself."
        )
      );
      parts.controls.replaceChildren(
        rangeControl(el, "True occupancy", occupancy, { min: 0, max: 1, step: 0.05, format: (value) => percent(value, 0) }, (value) => { occupancy = value; render(); }),
        rangeControl(el, "Residence-time detectability", residence, { min: 0, max: 1, step: 0.05, format: (value) => percent(value, 0) }, (value) => { residence = value; render(); }),
        rangeControl(el, "Cleavage-bias dip", cleavageBias, { min: 0, max: 0.8, step: 0.05, format: (value) => percent(value, 0) }, (value) => { cleavageBias = value; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "binding", value: percent(occupancy, 0) + " occupied" },
        { key: "kinetics", value: percent(residence, 0) + " detectable residence" },
        { key: "enzyme preference", value: percent(cleavageBias, 0) + " bias dip" },
        { key: "observed footprint", value: percent(result.observedDip, 1) },
      ]));
      parts.explanation.innerHTML = "<strong>Accessibility is necessary for many regulatory events, not sufficient for function.</strong> Footprint absence can reflect short residence, and footprint presence can reflect the enzyme's sequence preference.";
    }

    function renderMethylation() {
      const result = epigenomeModel({ kind: "methylation", methylated, unmethylated, conversion });
      parts.visual.replaceChildren(
        sequenceBoard(el, [
          { label: "genomic", sequence: "A C G T A C G A A C G T", tone: "muted" },
          { label: "converted", sequence: "A C G T A T G A A C G T", tone: "signal", note: "unmethylated C → T; protected 5mC remains C" },
        ], "Bisulfite conversion turning epigenetic state into sequence difference"),
        statusStrip(el, [
          { label: "depth", value: compact(result.depth, 0) + " reads" },
          { label: "true beta", value: percent(result.beta, 1), tone: "active" },
          { label: "binomial sampling SE", value: percent(result.se, 1), tone: "signal" },
          { label: "apparent beta with conversion failure", value: percent(result.apparentBeta, 1), tone: result.conversion < 0.98 ? "warning" : "active" },
        ], "Methylation proportion and conversion error")
      );
      parts.controls.replaceChildren(
        rangeControl(el, "Underlying methylated molecules", methylated, { min: 0, max: 100, step: 1, format: (value) => compact(value, 0) }, (value) => { methylated = value; render(); }),
        rangeControl(el, "Underlying unmethylated molecules", unmethylated, { min: 0, max: 100, step: 1, format: (value) => compact(value, 0) }, (value) => { unmethylated = value; render(); }),
        rangeControl(el, "Conversion efficiency", conversion, { min: 0.9, max: 1, step: 0.002, format: (value) => percent(value, 1) }, (value) => { conversion = value; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "chemical state", value: methylated + " methylated / " + unmethylated + " unmethylated" },
        { key: "conversion", value: percent(conversion, 1) + " unmethylated C→T" },
        { key: "expected sequencing", value: compact(result.expectedC, 2) + " C / " + compact(result.expectedT, 2) + " T" },
        { key: "beta estimate", value: percent(result.apparentBeta, 1) },
      ]));
      parts.explanation.innerHTML = "<strong>Conversion makes methylation countable by damaging sequence complexity.</strong> Mapping becomes harder, strands cease to be complements, incomplete conversion looks exactly like methylation, and ordinary bisulfite cannot separate 5mC from 5hmC. Native long reads avoid conversion and retain haplotype phase.";
    }

    function renderComposition() {
      const result = epigenomeModel({ kind: "composition", weightA: methWeightA, betaA, betaB });
      const shiftedWeightA = methWeightA >= 0.1 ? methWeightA - 0.1 : methWeightA + 0.1;
      const shifted = epigenomeModel({ kind: "composition", weightA: shiftedWeightA, betaA, betaB });
      parts.visual.replaceChildren(
        matrixBoard(el, ["Cell fraction", "Within-cell beta", "Contribution"], [
          { label: "cell type A", values: [percent(methWeightA, 0), percent(betaA, 0), percent(methWeightA * betaA, 1)], tones: ["active", "active", "active"] },
          { label: "cell type B", values: [percent(1 - methWeightA, 0), percent(betaB, 0), percent((1 - methWeightA) * betaB, 1)], tones: ["signal", "signal", "signal"] },
        ], "Cell-type contributions to bulk methylation"),
        statusStrip(el, [
          { label: "current bulk beta", value: percent(result.bulk, 1), tone: "active" },
          { label: "bulk beta after 10-point composition shift", value: percent(shifted.bulk, 1), tone: "warning" },
          { label: "within-cell beta changed?", value: "no" },
        ], "Composition-only differential-methylation fixture")
      );
      parts.controls.replaceChildren(
        rangeControl(el, "Cell type A fraction", methWeightA, { min: 0, max: 1, step: 0.05, format: (value) => percent(value, 0) }, (value) => { methWeightA = value; render(); }),
        rangeControl(el, "Methylation beta in type A", betaA, { min: 0, max: 1, step: 0.05, format: (value) => percent(value, 0) }, (value) => { betaA = value; render(); }),
        rangeControl(el, "Methylation beta in type B", betaB, { min: 0, max: 1, step: 0.05, format: (value) => percent(value, 0) }, (value) => { betaB = value; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "cell-type betas", value: percent(betaA, 0) + " A / " + percent(betaB, 0) + " B" },
        { key: "mixture", value: percent(methWeightA, 0) + " A" },
        { key: "bulk beta", value: percent(result.bulk, 1) },
        { key: "confound", value: "composition shift mimics epigenetic change" },
      ]));
      parts.explanation.innerHTML = "<strong>Bulk methylation is a composition-weighted average, and cell-type differences are often enormous.</strong> Measure or deconvolve composition before interpreting a disease, age, smoking, or treatment association as within-cell epigenetic regulation.";
    }

    function renderCausality() {
      const result = epigenomeModel({ kind: "causality", assay: causalityAssay });
      parts.visual.replaceChildren(
        matrixBoard(el, ["Question", "Context", "Characteristic failure"], [
          { label: "MPRA / STARR", values: ["sufficient?", "episomal reporter", "native context absent"], tones: causalityAssay === "mpra" ? ["active", "active", "warning"] : ["muted", "muted", "muted"] },
          { label: "CRISPR tiling", values: ["necessary?", "endogenous locus", "redundancy / perturbation spread"], tones: causalityAssay === "crispr" ? ["active", "active", "warning"] : ["muted", "muted", "muted"] },
        ], "Regulatory sufficiency and necessity assays"),
        claimBoundary(el, result.claim, result.failure, "Sufficiency and necessity can dissociate in both directions; neither alone proves the complete endogenous mechanism.")
      );
      parts.controls.replaceChildren(el("div", { class: "lab-control-block" }, [
        el("span", { class: "lab-control-label", text: "Perturbation assay" }),
        choiceRow(el, [{ label: "MPRA / STARR-seq", value: "mpra" }, { label: "CRISPR tiling", value: "crispr" }], causalityAssay, (value) => { causalityAssay = value; render(); }, "Regulatory causality assay"),
      ]));
      parts.rail.replaceChildren(causalRail(el, [
        { key: "sequence / element", value: "candidate regulator" },
        { key: "perturbation context", value: causalityAssay === "mpra" ? "reporter" : "endogenous locus" },
        { key: "measured claim", value: result.claim },
        { key: "failure", value: result.failure },
      ]));
      parts.explanation.innerHTML = "<strong>Reporter activity asks whether sequence is sufficient outside its native context.</strong> Endogenous CRISPR asks whether the element is necessary here, but redundancy can hide real enhancers and repressive spread limits resolution.";
    }

    function renderState() {
      const result = epigenomeModel({ kind: "state", marks });
      parts.visual.replaceChildren(
        barBoard(el, [
          { label: "H3K4me3", value: marks.k4me3, display: percent(marks.k4me3, 0), tone: "active" },
          { label: "H3K4me1", value: marks.k4me1, display: percent(marks.k4me1, 0), tone: "signal" },
          { label: "H3K27ac", value: marks.k27ac, display: percent(marks.k27ac, 0), tone: "active" },
          { label: "H3K36me3", value: marks.k36me3, display: percent(marks.k36me3, 0), tone: "muted" },
          { label: "H3K27me3", value: marks.k27me3, display: percent(marks.k27me3, 0), tone: "warning" },
        ], "Multivariate chromatin-mark emission vector", 1),
        statusStrip(el, [
          { label: "highest toy-score label", value: result.label, tone: "active" },
          { label: "model output", value: "hidden state + emission probabilities", tone: "signal" },
          { label: "function proven?", value: "no", tone: "warning" },
          { label: "cell type", value: "this fitted context only" },
        ], "Chromatin-state interpretation boundary")
      );
      parts.controls.replaceChildren(
        rangeControl(el, "H3K4me3", marks.k4me3, { min: 0, max: 1, step: 0.05, format: (value) => percent(value, 0) }, (value) => { marks.k4me3 = value; render(); }),
        rangeControl(el, "H3K4me1", marks.k4me1, { min: 0, max: 1, step: 0.05, format: (value) => percent(value, 0) }, (value) => { marks.k4me1 = value; render(); }),
        rangeControl(el, "H3K27ac", marks.k27ac, { min: 0, max: 1, step: 0.05, format: (value) => percent(value, 0) }, (value) => { marks.k27ac = value; render(); }),
        rangeControl(el, "H3K36me3", marks.k36me3, { min: 0, max: 1, step: 0.05, format: (value) => percent(value, 0) }, (value) => { marks.k36me3 = value; render(); }),
        rangeControl(el, "H3K27me3", marks.k27me3, { min: 0, max: 1, step: 0.05, format: (value) => percent(value, 0) }, (value) => { marks.k27me3 = value; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "mark vector", value: "five emissions" },
        { key: "hidden-state model", value: "joint recurring pattern" },
        { key: "human interpretation", value: result.label },
        { key: "claim boundary", value: "label ≠ demonstrated function" },
      ]));
      parts.explanation.innerHTML = "<strong>The HMM never heard the words promoter or enhancer.</strong> This weighted score is only a teaching stand-in for learned emissions and transitions; humans label fitted states afterward. K, binning, cell context, and label assignment remain modeling choices.";
    }

    function render() {
      parts.tabHost.replaceChildren(tabs(el, modeChoices, mode, (value) => { mode = value; render(); }));
      if (mode === "assay") renderAssay();
      else if (mode === "peak") renderPeak();
      else if (mode === "footprint") renderFootprint();
      else if (mode === "methylation") renderMethylation();
      else if (mode === "composition") renderComposition();
      else if (mode === "causality") renderCausality();
      else renderState();
    }

    predict(body, {
      widget: "epigenome-assay-lab",
      question: "An ATAC-seq motif shows no footprint. Which conclusion is justified?",
      hint: "Footprint detectability depends on binding kinetics and enzyme bias.",
      options: [
        { label: "The factor never binds" },
        { label: "The element has no regulatory function" },
        { label: "Neither — short residence can erase a real footprint", correct: true },
        { label: "The locus must be methylated" },
      ],
    }, () => {
      mode = "footprint";
      occupancy = 0.8;
      residence = 0.1;
      parts.instrument.hidden = false;
      render();
    });
    finishLab(parts, body);
  });

  /* Additional Part 9–10 labs are inserted above this registration block. */

  global.ReaderInteractionDefinitions = Object.assign(
    global.ReaderInteractionDefinitions || {},
    definitions
  );
  global.ReaderInteractionModels = Object.assign(
    global.ReaderInteractionModels || {},
    models
  );
  global.ReaderInteractionCoverage = Object.assign(
    global.ReaderInteractionCoverage || {},
    coverage
  );
})(typeof window !== "undefined" ? window : globalThis);
