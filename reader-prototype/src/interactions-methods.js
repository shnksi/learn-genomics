/* ── Experimental-methods interaction wave ──────────────────────────────
   Objective-mapped Hero Labs for Chapters 36–38. The shared visual thesis is
   specimen → physical operation → signal → claim. Every mode keeps the blind
   spot beside the measurement so a learner cannot silently promote a readout
   into stronger evidence than the assay supplies.
   ───────────────────────────────────────────────────────────────────────── */

(function (global) {
  "use strict";

  const definitions = {};
  const models = {};
  const coverage = {};
  const kit = global.ReaderInteractionKit;
  if (!kit) throw new Error("ReaderInteractionKit must load before experimental-methods labs");

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

  function normalCdf(value) {
    const sign = value < 0 ? -1 : 1;
    const x = Math.abs(value) / Math.sqrt(2);
    const t = 1 / (1 + 0.3275911 * x);
    const polynomial = (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t -
      0.284496736) * t + 0.254829592) * t;
    const erf = sign * (1 - polynomial * Math.exp(-x * x));
    return 0.5 * (1 + erf);
  }

  function haldaneRecombination(distanceCm) {
    const distanceMorgans = Math.max(0, distanceCm) / 100;
    return 0.5 * (1 - Math.exp(-2 * distanceMorgans));
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
      instrument: el("div", { class: "hero-lab methods-lab", hidden: true }),
      tabHost: el("div"),
      visual: el("div", { class: "lab-visual methods-visual" }),
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
      class: "pop-status-strip methods-status-strip",
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
      class: "pop-process methods-process",
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
      class: "pop-bars methods-bars",
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

  function blindSpot(el, measured, excluded, boundary) {
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

  function textSvg(html, label, viewBox, extraClass) {
    return '<svg class="lab-diagram methods-diagram ' + (extraClass || "") +
      '" viewBox="' + (viewBox || "0 0 520 300") + '" role="img" aria-label="' +
      label.replace(/"/g, "&quot;") + '">' + html + "</svg>";
  }

  function linePath(points, xScale, yScale) {
    return points.map((point, index) => (index ? "L" : "M") +
      xScale(point.x).toFixed(2) + " " + yScale(point.y).toFixed(2)).join(" ");
  }

  function choose(n, k) {
    if (k < 0 || k > n) return 0;
    let value = 1;
    for (let index = 1; index <= k; index += 1) {
      value *= (n - index + 1) / index;
    }
    return value;
  }

  /* Pure models -------------------------------------------------------- */

  function molecularMethodsModel(input) {
    if (input.kind === "pcr") {
      const n0 = Math.max(1e-12, input.n0);
      const efficiency = clamp(input.efficiency, 0, 1);
      const cycles = clamp(Math.round(input.cycles), 0, 60);
      const capacity = Math.max(n0, input.capacity || 1e12);
      const threshold = clamp(input.threshold || 1e8, n0, capacity * 0.999999);
      const raw = n0 * Math.pow(1 + efficiency, cycles);
      const copies = Math.min(capacity, raw);
      const ct = Math.log(threshold / n0) / Math.log(1 + efficiency);
      const plateauCycle = Math.log(capacity / n0) / Math.log(1 + efficiency);
      return {
        n0, efficiency, cycles, capacity, threshold, raw, copies,
        ct, plateauCycle, plateau: raw >= capacity,
      };
    }

    if (input.kind === "qpcr") {
      const targetEfficiency = clamp(input.targetEfficiency, 0.01, 1);
      const referenceEfficiency = clamp(input.referenceEfficiency, 0.01, 1);
      const controlTarget = input.controlTarget;
      const controlReference = input.controlReference;
      const treatedTarget = input.treatedTarget;
      const treatedReference = input.treatedReference;
      const deltaCtControl = controlTarget - controlReference;
      const deltaCtTreated = treatedTarget - treatedReference;
      const deltaDeltaCt = deltaCtTreated - deltaCtControl;
      const idealFold = Math.pow(2, -deltaDeltaCt);
      const correctedFold = Math.pow(1 + targetEfficiency, controlTarget - treatedTarget) /
        Math.pow(1 + referenceEfficiency, controlReference - treatedReference);
      return {
        targetEfficiency, referenceEfficiency, controlTarget, controlReference,
        treatedTarget, treatedReference, deltaCtControl, deltaCtTreated,
        deltaDeltaCt, idealFold, correctedFold,
      };
    }

    if (input.kind === "dpcr") {
      const partitions = Math.max(2, Math.round(input.partitions));
      const positives = clamp(Math.round(input.positives), 0, partitions - 1);
      const positiveFraction = positives / partitions;
      const lambda = -Math.log(1 - positiveFraction);
      const copies = lambda * partitions;
      const multiplePositivePartitions = partitions * (1 - Math.exp(-lambda) * (1 + lambda));
      const volumeMicrolitres = partitions * Math.max(1e-9, input.partitionNl || 0.85) / 1000;
      return {
        partitions, positives, positiveFraction, lambda, copies,
        multiplePositivePartitions, volumeMicrolitres,
        concentration: copies / volumeMicrolitres,
        naiveUndercount: copies === 0 ? 0 : (copies - positives) / copies,
      };
    }

    if (input.kind === "gel") {
      const molecule = input.molecule || "dna";
      const matrix = input.matrix || "agarose";
      const lengths = (input.lengths || [100, 500, 1000, 3000, 10000]).map((value) => Math.max(1, value));
      const separatesByLength = molecule === "dna" ? matrix !== "free" : matrix === "sds";
      const distances = lengths.map((length) => separatesByLength ?
        clamp(95 - 31 * Math.log10(length / 100), 8, 95) : 48);
      return {
        molecule, matrix, lengths, distances, separatesByLength,
        mechanism: molecule === "dna" ?
          (matrix === "free" ? "charge and drag both scale with length" : "constant charge-to-mass plus a molecular sieve") :
          (matrix === "sds" ? "SDS imposes a near-constant negative charge-to-mass ratio" : "native charge and shape remain confounded"),
      };
    }

    if (input.kind === "assembly") {
      const method = input.method || "restriction";
      const fragments = clamp(Math.round(input.fragments), 1, 24);
      const internalSite = Boolean(input.internalSite);
      const junctionsUnique = input.junctionsUnique !== false;
      const overlap = clamp(Math.round(input.overlap || 25), 0, 80);
      let viable;
      let constraint;
      let scar;
      if (method === "restriction") {
        viable = !internalSite && fragments <= 3;
        constraint = internalSite ? "enzyme also cuts inside the insert" :
          (fragments > 3 ? "this two-enzyme teaching plan has no unique site pair for every junction" : "usable sites exist in vector and insert");
        scar = "recognition-site sequence remains";
      } else if (method === "gibson") {
        viable = junctionsUnique && overlap >= 20 && overlap <= 40;
        constraint = !junctionsUnique ? "reused overlap makes more than one product possible" :
          (overlap < 20 || overlap > 40 ? "designed overlaps are outside the teaching range" : "arbitrary unique overlap specifies every neighbour");
        scar = "seamless when overlap is designed into the product";
      } else {
        viable = !internalSite && junctionsUnique && fragments <= 20;
        constraint = internalSite ? "Type IIS site survives inside a part" :
          (!junctionsUnique ? "reused four-base overhang is not an address" :
            (fragments > 20 ? "this curated 20-overhang teaching library is exhausted" : "chosen overhangs encode order and the product loses the sites"));
        scar = "scar depends on chosen four-base junction";
      }
      return { method, fragments, internalSite, junctionsUnique, overlap, viable, constraint, scar };
    }

    if (input.kind === "orthogonal") {
      const firstError = clamp(input.firstError, 0, 1);
      const secondError = clamp(input.secondError, 0, 1);
      const sharedFraction = clamp(input.sharedFraction, 0, 1);
      const independentJointError = firstError * secondError;
      const jointError = sharedFraction * Math.min(firstError, secondError) +
        (1 - sharedFraction) * independentJointError;
      return { firstError, secondError, sharedFraction, independentJointError, jointError };
    }

    if (input.kind === "assay") {
      const assays = {
        length: {
          method: "agarose gel", signal: "migration distance", claim: "fragment length class",
          blind: "sequence identity", assumption: "matrix makes mobility depend mainly on length",
        },
        copies: {
          method: "digital PCR", signal: "positive partition count", claim: "absolute target copies",
          blind: "sequence outside the addressed amplicon", assumption: "partitions are independent and Poisson-distributed",
        },
        cells: {
          method: "FISH", signal: "probe spots per nucleus", claim: "copy or rearrangement state per cell",
          blind: "unprobed sequence", assumption: "probe binds only the intended locus",
        },
        binding: {
          method: "ChIP plus sequencing", signal: "enriched crosslinked fragments", claim: "population-average occupancy",
          blind: "direct binding in every cell", assumption: "antibody and crosslinking are sufficiently specific",
        },
        sufficiency: {
          method: "reporter assay", signal: "reporter output", claim: "fragment sufficiency in this construct and cell",
          blind: "necessity at the endogenous locus", assumption: "the artificial context answers the intended question",
        },
        interact: {
          method: "orthogonal interaction assays", signal: "Y2H, co-IP, or proximity readout", claim: "evidence consistent with association",
          blind: "a universal direct interaction", assumption: "independent failure directions are reconciled",
        },
        proteome: {
          method: "LC–MS/MS", signal: "peptide precursor and fragment masses", claim: "database-supported peptide evidence",
          blind: "unannotated, masked, or non-unique proteins", assumption: "peptides ionise, are sampled, and exist in the searched database",
        },
      };
      return assays[input.question] || assays.length;
    }

    if (input.kind === "interaction") {
      const assays = {
        y2h: {
          method: "yeast two-hybrid",
          over: "proteins forced into one yeast nucleus at high concentration; sticky or self-activating bait",
          under: "membrane proteins, missing modifications, or fusions that misfold",
          control: "localisation plus an endogenous assay with a different failure direction",
        },
        coip: {
          method: "co-immunoprecipitation",
          over: "abundant sticky proteins and complexes formed after lysis removes compartments",
          under: "transient or low-affinity partners lost during washing",
          control: "knockout-validated antibody, reciprocal pull-down, and living-cell evidence",
        },
        proximity: {
          method: "proximity labelling",
          over: "nearby proteins that never bind directly",
          under: "true partners with no accessible taggable residue",
          control: "spatial controls and direct biochemical follow-up",
        },
      };
      return assays[input.assay] || assays.y2h;
    }

    throw new Error("Unknown molecular-methods model");
  }

  function geneticScreenModel(input) {
    if (input.kind === "breeding") {
      const clones = Math.max(1, Math.round(input.clones));
      const recovery = 1 - Math.pow(0.75, clones);
      return { clones, recovery, miss: 1 - recovery };
    }

    if (input.kind === "saturation") {
      const recoveredGroups = Math.max(1, Math.round(input.recoveredGroups));
      const singletons = Math.max(0, Math.round(input.singletons));
      const doubletons = Math.max(1, Math.round(input.doubletons));
      const unseen = singletons * singletons / (2 * doubletons);
      const estimatedTotal = recoveredGroups + unseen;
      return {
        recoveredGroups, singletons, doubletons, unseen, estimatedTotal,
        saturation: recoveredGroups / estimatedTotal,
      };
    }

    if (input.kind === "bulk") {
      const selectedIndividuals = Math.max(2, Math.round(input.selectedIndividuals));
      const selectedChromosomes = 2 * selectedIndividuals;
      const distanceCm = clamp(input.distanceCm, 0, 120);
      const recombination = haldaneRecombination(distanceCm);
      const expectedFrequency = 1 - recombination;
      const poolSe = Math.sqrt(expectedFrequency * (1 - expectedFrequency) / selectedChromosomes);
      const depth = Math.max(2, Math.round(input.depth));
      const readSe = Math.sqrt(expectedFrequency * (1 - expectedFrequency) / depth);
      const breakpointFloorCm = 100 / selectedChromosomes;
      return {
        selectedIndividuals, selectedChromosomes, distanceCm, recombination,
        expectedFrequency, poolSe, depth, readSe,
        combinedSe: Math.sqrt(poolSe * poolSe + readSe * readSe), breakpointFloorCm,
        mappingFunction: "Haldane (Poisson crossovers; no interference)",
      };
    }

    if (input.kind === "pooled") {
      const cellsPerGuide = Math.max(2, Math.round(input.cellsPerGuide));
      const readsPerGuide = Math.max(2, Math.round(input.readsPerGuide));
      const log2Effect = input.log2Effect;
      const cellLogSe = 1 / Math.sqrt(cellsPerGuide);
      const readLogSe = 1 / Math.sqrt(readsPerGuide);
      const totalLogSe = Math.sqrt(cellLogSe * cellLogSe + readLogSe * readLogSe);
      const z = Math.abs(log2Effect) * Math.log(2) / totalLogSe;
      return {
        cellsPerGuide, readsPerGuide, log2Effect, cellLogSe, readLogSe,
        totalLogSe, z, relativeAbundance: Math.pow(2, log2Effect),
      };
    }

    if (input.kind === "epistasis") {
      const wa = clamp(input.wa, 0, 2);
      const wb = clamp(input.wb, 0, 2);
      const wab = clamp(input.wab, 0, 2);
      const expected = wa * wb;
      const epsilon = wab - expected;
      const className = epsilon < -0.05 ? "aggravating / synthetic sick" :
        (epsilon > 0.05 ? "alleviating / masking" : "approximately independent");
      return { wa, wb, wab, expected, epsilon, className };
    }

    if (input.kind === "negative") {
      const animalsPerGroup = Math.max(2, Math.round(input.animalsPerGroup));
      const trueEffectSd = Math.max(0, input.trueEffectSd);
      const detectable80 = (1.96 + 0.8416) * Math.sqrt(2 / animalsPerGroup);
      const zAlternative = trueEffectSd / Math.sqrt(2 / animalsPerGroup);
      const power = clamp(1 - normalCdf(1.96 - zAlternative) + normalCdf(-1.96 - zAlternative), 0, 1);
      return { animalsPerGroup, trueEffectSd, detectable80, power };
    }

    if (input.kind === "organism") {
      const question = input.question || "cell-cycle";
      const picks = {
        "cell-cycle": { best: "budding yeast", reason: "90-minute generations, conditional alleles, complete deletion collection", blind: "no tissues or development" },
        "vertebrate-development": { best: "zebrafish", reason: "transparent external embryos and large clutches", blind: "teleost duplicate genes can mask single knockouts" },
        "adaptive-immunity": { best: "mouse", reason: "intact mammalian immune physiology and engineered alleles", blind: "slow, expensive, one inbred background at a time" },
        "human-neuron": { best: "human iPSC organoid", reason: "human genotype with neuronal cell types and tissue-like architecture", blind: "immature, variable, and lacks circulation and a full immune system" },
      };
      return picks[question] || picks["cell-cycle"];
    }

    throw new Error("Unknown genetic-screen model");
  }

  function genomeEditingModel(input) {
    if (input.kind === "repair") {
      const phase = input.phase || "g1";
      const donor = Boolean(input.donor);
      const profiles = {
        g1: { nhej: 0.84, hdrWithDonor: 0.02, label: "G1 / quiescent dividing cell" },
        sg2: { nhej: 0.55, hdrWithDonor: 0.35, label: "S/G2 with a sister chromatid" },
        neuron: { nhej: 0.97, hdrWithDonor: 0.001, label: "post-mitotic neuron" },
      };
      const profile = profiles[phase] || profiles.g1;
      const hdr = donor ? profile.hdrWithDonor : 0;
      const nhej = profile.nhej;
      const unresolved = Math.max(0, 1 - nhej - hdr);
      const frameshift = nhej * 0.68;
      return { phase, donor, label: profile.label, nhej, hdr, unresolved, frameshift };
    }

    if (input.kind === "guide") {
      const mismatchPosition = clamp(Math.round(input.mismatchPosition), 1, 20);
      const mismatches = clamp(Math.round(input.mismatches || 1), 0, 5);
      const accessible = input.accessible !== false;
      const pam = input.pam !== false;
      const seed = mismatchPosition >= 13;
      let relativeCleavage = pam && accessible ? 1 : 0;
      if (mismatches > 0) relativeCleavage *= Math.pow(seed ? 0.08 : 0.58, mismatches);
      return { mismatchPosition, mismatches, accessible, pam, seed, relativeCleavage };
    }

    if (input.kind === "editor") {
      const goal = input.goal || "knockout";
      const dividing = input.dividing !== false;
      const bystanderFree = input.bystanderFree !== false;
      const choices = {
        knockout: { editor: "Cas9 nuclease", writes: "indel absorbing state", break: true, donor: false },
        transition: { editor: bystanderFree ? "base editor" : "prime editor", writes: bystanderFree ? "supported C→T/G→A or A→G/T→C transition" : "specified transition without bystanders", break: false, donor: false },
        transversion: { editor: "prime editor", writes: "specified transversion", break: false, donor: false },
        insertion: { editor: dividing ? "prime editor or nuclease + HDR" : "prime editor", writes: "small designed insertion", break: false, donor: false },
        replacement: { editor: dividing ? "nuclease + HDR" : "no efficient general route", writes: "large template-defined replacement", break: true, donor: true },
      };
      return Object.assign({ goal, dividing, bystanderFree }, choices[goal] || choices.knockout);
    }

    if (input.kind === "offTarget") {
      const maxMismatches = clamp(Math.round(input.maxMismatches), 0, 6);
      const genomeGb = Math.max(0.001, input.genomeGb || 3.1);
      let neighbourhood = 0;
      for (let distance = 0; distance <= maxMismatches; distance += 1) {
        neighbourhood += choose(20, distance) * Math.pow(3, distance);
      }
      const sequenceProbability = neighbourhood / Math.pow(4, 20);
      const candidatePamSites = genomeGb * 2e9 / 16;
      return {
        maxMismatches, genomeGb, neighbourhood, sequenceProbability, candidatePamSites,
        expectedCandidates: candidatePamSites * sequenceProbability,
      };
    }

    if (input.kind === "delivery") {
      const route = input.route || "rnp";
      const routes = {
        rnp: { cargoKb: Infinity, cargoLabel: "no viral-genome packaging ceiling", exposure: "hours", setting: "ex vivo", specificity: "highest of these routes", constraint: "cells must be harvested and electroporated" },
        lnp: { cargoKb: 20, cargoLabel: "formulation-dependent · ~20 kb teaching envelope", exposure: "days", setting: "in vivo, strongly liver-biased after IV dosing", specificity: "short transient exposure", constraint: "tropism and repeat dosing, not editor chemistry" },
        aav: { cargoKb: 4.7, cargoLabel: "≈4.7 kb", exposure: "months to years", setting: "in vivo", specificity: "long exposure accumulates off-target opportunity", constraint: "SpCas9 coding sequence alone is about 4.1 kb" },
      };
      return Object.assign({ route }, routes[route] || routes.rnp);
    }

    if (input.kind === "screen") {
      const copyNumber = Math.max(1, Math.round(input.copyNumber));
      const indelRate = clamp(input.indelRate, 0, 1);
      const frameshiftFraction = clamp(input.frameshiftFraction, 0, 1);
      const frameshiftAllele = indelRate * frameshiftFraction;
      const independentBiallelic = frameshiftAllele * frameshiftAllele;
      const cutBurden = copyNumber * indelRate;
      const cuttingDropout = 1 - Math.exp(-0.12 * cutBurden);
      return {
        copyNumber, indelRate, frameshiftFraction, frameshiftAllele,
        independentBiallelic, cutBurden, cuttingDropout,
      };
    }

    if (input.kind === "drive") {
      const p = clamp(input.driveFrequency, 0, 1);
      const q = 1 - p;
      const homing = clamp(input.homing, 0, 1);
      const resistance = clamp(input.resistance, 0, 1 - homing);
      const driveTransmission = 0.5 + 0.5 * homing;
      const resistantTransmission = 0.5 * resistance;
      const wildTransmission = 0.5 * (1 - homing - resistance);
      const driveNext = p * p + 2 * p * q * driveTransmission;
      const resistantNext = 2 * p * q * resistantTransmission;
      const wildNext = q * q + 2 * p * q * wildTransmission;
      const total = driveNext + resistantNext + wildNext;
      return {
        driveFrequency: p, homing, resistance, driveTransmission,
        driveNext: driveNext / total, resistantNext: resistantNext / total,
        wildNext: wildNext / total,
      };
    }

    throw new Error("Unknown genome-editing model");
  }

  models.molecularMethods = molecularMethodsModel;
  models.geneticScreen = geneticScreenModel;
  models.genomeEditing = genomeEditingModel;

  /* Shared views ------------------------------------------------------- */

  function amplificationSvg(resultA, resultB, cycles) {
    const pointsA = [];
    const pointsB = [];
    for (let cycle = 0; cycle <= cycles; cycle += 1) {
      const a = molecularMethodsModel(Object.assign({}, resultA, { kind: "pcr", cycles: cycle }));
      const b = molecularMethodsModel(Object.assign({}, resultB, { kind: "pcr", cycles: cycle }));
      pointsA.push({ x: cycle, y: Math.log10(Math.max(1, a.copies)) });
      pointsB.push({ x: cycle, y: Math.log10(Math.max(1, b.copies)) });
    }
    const xScale = (value) => 62 + 420 * value / Math.max(1, cycles);
    const yScale = (value) => 244 - 180 * clamp(value / 12, 0, 1);
    const thresholdY = yScale(Math.log10(resultA.threshold || 1e8));
    return textSvg(
      '<rect class="methods-plot-frame" x="62" y="54" width="420" height="190" rx="3" />' +
      '<line class="methods-axis" x1="62" y1="244" x2="482" y2="244" />' +
      '<line class="methods-axis" x1="62" y1="54" x2="62" y2="244" />' +
      '<line class="methods-threshold" x1="62" y1="' + thresholdY.toFixed(2) + '" x2="482" y2="' + thresholdY.toFixed(2) + '" />' +
      '<path class="methods-trace is-a" d="' + linePath(pointsA, xScale, yScale) + '" />' +
      '<path class="methods-trace is-b" d="' + linePath(pointsB, xScale, yScale) + '" />' +
      '<text class="lab-svg-kicker" text-anchor="middle"><tspan x="260" y="20">AMPLIFICATION IS INFORMATIVE</tspan><tspan x="260" y="44">BEFORE THE PLATEAU</tspan></text>' +
      '<text class="lab-svg-label" x="272" y="286" text-anchor="middle">cycle</text>' +
      '<text class="lab-svg-label" x="22" y="154" text-anchor="middle" transform="rotate(-90 22 154)">log₁₀ copies</text>' +
      '<text class="methods-value-label" x="475" y="77" text-anchor="end">plateau</text>' +
      '<text class="methods-value-label" x="475" y="' + (thresholdY - 7).toFixed(2) + '" text-anchor="end">fixed threshold</text>' +
      '<text class="methods-series-label is-a" x="72" y="82">sample A</text>' +
      '<text class="methods-series-label is-b" x="72" y="108">sample B</text>',
      "Two PCR amplification traces with different starting copy numbers, a fixed fluorescence threshold, and a shared plateau.",
      "0 0 520 300",
      "methods-amplification"
    );
  }

  function gelBoard(el, result) {
    const board = el("div", {
      class: "methods-gel-board",
      role: "img",
      "aria-label": result.separatesByLength ?
        "A molecular sieve separates the selected molecules by length." :
        "All molecules co-migrate because length is cancelled or confounded.",
    });
    board.append(el("div", { class: "methods-gel-wells", "aria-hidden": "true" },
      result.lengths.map(() => el("i"))));
    result.lengths.forEach((length, index) => board.append(el("span", {
      class: "methods-gel-band" + (result.separatesByLength ? " is-separated" : " is-collapsed"),
      style: "top:" + result.distances[index].toFixed(2) + "%; left:" + (10 + index * 18) + "%;",
      text: length >= 1000 ? (length / 1000).toFixed(length % 1000 ? 1 : 0) + "k" : compact(length, 0),
    })));
    board.append(el("div", { class: "methods-field-arrow", text: "electric field ↓" }));
    return board;
  }

  function dropletBoard(el, result) {
    const shown = 100;
    const positivesShown = Math.round(shown * result.positiveFraction);
    const board = el("div", {
      class: "methods-droplet-board",
      role: "img",
      "aria-label": positivesShown + " of 100 representative partitions are positive. Poisson correction estimates " +
        compact(result.copies, 0) + " templates in all " + compact(result.partitions, 0) + " partitions.",
    });
    for (let index = 0; index < shown; index += 1) {
      board.append(el("i", {
        class: "methods-droplet" + (index < positivesShown ? " is-positive" : ""),
        "aria-hidden": "true",
      }));
    }
    return board;
  }

  function assemblyBoard(el, result) {
    const board = el("div", {
      class: "methods-assembly-board",
      role: "img",
      "aria-label": result.fragments + " fragments using " + result.method + ". " +
        (result.viable ? "One intended assembly is addressable." : "The assembly is not uniquely viable.") +
        " Constraint: " + result.constraint,
    });
    for (let index = 0; index < Math.min(result.fragments, 12); index += 1) {
      board.append(el("div", {
        class: "methods-fragment" + (result.viable ? " is-addressed" : " is-conflicted"),
      }, [
        el("span", { text: String.fromCharCode(65 + index) }),
        el("i", { text: result.method === "gibson" ? "overlap " + (index + 1) :
          (result.method === "golden" ? "overhang " + (index + 1) : "site") }),
      ]));
    }
    if (result.fragments > 12) board.append(el("strong", { class: "methods-fragment-more", text: "+" + (result.fragments - 12) }));
    board.append(el("div", {
      class: "methods-assembly-result" + (result.viable ? " is-viable" : " is-blocked"),
      text: result.viable ? "one designed product" : "constraint blocks or branches the product",
    }));
    return board;
  }

  function organismBoard(el, question, result) {
    const organisms = [
      ["E. coli", "minutes", "enormous populations", "no nucleus"],
      ["budding yeast", "90 min", "precise replacement", "no tissues"],
      ["C. elegans", "3 d", "selfing + fixed lineage", "rewired pathways"],
      ["Drosophila", "10 d", "alleles + balancers", "insect physiology"],
      ["zebrafish", "3 mo", "live vertebrate embryos", "duplicate paralogues"],
      ["mouse", "10 wk", "mammalian physiology", "slow + costly"],
      ["human iPSC organoid", "weeks–months", "human tissue context", "immature + variable"],
    ];
    const board = el("div", {
      class: "methods-organism-board",
      role: "img",
      "aria-label": "Model-organism trade-off field. Best fit for " + question + ": " + result.best +
        ". Advantage: " + result.reason + ". Blind spot: " + result.blind,
    });
    organisms.forEach((row) => board.append(el("div", {
      class: "methods-organism-row" + (row[0] === result.best ? " is-selected" : ""),
    }, [
      el("strong", { text: row[0] }),
      el("span", { text: row[1] }),
      el("span", { text: row[2] }),
      el("span", { text: row[3] }),
    ])));
    return board;
  }

  function saturationBoard(el, result) {
    const total = Math.max(1, Math.round(result.estimatedTotal));
    const board = el("div", {
      class: "methods-saturation-board",
      role: "img",
      "aria-label": result.recoveredGroups + " recovered complementation groups and about " +
        compact(result.unseen, 1) + " estimated unseen groups, for " + percent(result.saturation, 1) + " saturation.",
    });
    for (let index = 0; index < Math.min(total, 60); index += 1) {
      board.append(el("i", {
        class: "methods-gene-well" + (index < result.recoveredGroups ? " is-hit" : " is-unseen"),
        text: index < result.recoveredGroups ? String(index + 1) : "?",
      }));
    }
    return board;
  }

  function bulkSegregantSvg(result) {
    const points = [];
    for (let distance = -120; distance <= 120; distance += 4) {
      points.push({ x: distance, y: 1 - haldaneRecombination(Math.abs(distance)) });
    }
    const xScale = (value) => 62 + 420 * (value + 120) / 240;
    const yScale = (value) => 244 - 170 * (value - 0.45) / 0.6;
    const selectedX = xScale(result.distanceCm);
    const selectedY = yScale(result.expectedFrequency);
    const focusLabel = '<text class="methods-value-label" x="' +
      (selectedX > 340 ? selectedX - 10 : selectedX + 10).toFixed(2) + '" y="' +
      (selectedY - 12).toFixed(2) + '" text-anchor="' + (selectedX > 340 ? "end" : "start") + '">' +
      result.expectedFrequency.toFixed(2) + ' at ' + result.distanceCm.toFixed(0) + ' cM</text>';
    return textSvg(
      '<rect class="methods-plot-frame" x="62" y="54" width="420" height="190" rx="3" />' +
      '<line class="methods-axis" x1="62" y1="244" x2="482" y2="244" />' +
      '<line class="methods-axis" x1="62" y1="54" x2="62" y2="244" />' +
      '<line class="methods-null-line" x1="62" y1="' + yScale(0.5).toFixed(2) + '" x2="482" y2="' + yScale(0.5).toFixed(2) + '" />' +
      '<path class="methods-trace is-a" d="' + linePath(points, xScale, yScale) + '" />' +
      '<circle class="methods-focus-point" cx="' + selectedX.toFixed(2) + '" cy="' + selectedY.toFixed(2) + '" r="7" />' +
      '<text class="lab-svg-kicker" text-anchor="middle"><tspan x="260" y="20">SELECTED MEIOSES DRAW</tspan><tspan x="260" y="44">THE MAPPING PEAK</tspan></text>' +
      '<text class="lab-svg-label" x="272" y="286" text-anchor="middle">distance from causal locus (cM)</text>' +
      '<text class="lab-svg-label" x="22" y="154" text-anchor="middle" transform="rotate(-90 22 154)">selected-parent frequency</text>' +
      '<text class="methods-value-label" x="72" y="226" text-anchor="start">unlinked = 0.5</text>' +
      focusLabel,
      "Bulk-segregant allele-frequency peak centred on the causal locus. Haldane mapping converts " +
        result.distanceCm + " centimorgans to recombination fraction " + result.recombination.toFixed(3) + ".",
      "0 0 520 300",
      "methods-bulk-plot"
    );
  }

  function sequenceBoard(el, result) {
    const sequence = "GACTTCAGCAGTACCGGACA";
    const board = el("div", {
      class: "methods-sequence-board",
      role: "img",
      "aria-label": "Twenty-base protospacer followed by NGG PAM. Cas9 cuts between protospacer positions 17 and 18. " +
        result.mismatches + " mismatch at position " + result.mismatchPosition +
        (result.seed ? " lies in the PAM-proximal seed." : " lies in the PAM-distal region."),
    });
    sequence.split("").forEach((base, index) => {
      const position = index + 1;
      board.append(el("span", {
        class: "methods-base" + (position === result.mismatchPosition && result.mismatches ? " is-mismatch" : "") +
          (position >= 13 ? " is-seed" : "") + (position === 17 ? " is-cut-after" : ""),
        text: base,
      }));
    });
    board.append(el("span", { class: "methods-pam", text: "TGG" }));
    board.append(el("div", { class: "methods-sequence-label is-guide", text: "20-nt guide pairing" }));
    board.append(el("div", { class: "methods-sequence-label is-seed", text: "PAM-proximal seed" }));
    board.append(el("div", { class: "methods-sequence-label is-cut", text: "cut ▲" }));
    return board;
  }

  function repairBoard(el, result) {
    return el("div", {
      class: "methods-repair-board",
      role: "img",
      "aria-label": "Illustrative repair-competition fixture in " + result.label + ". NHEJ " + percent(result.nhej, 1) +
        ", HDR " + percent(result.hdr, 1) + ", other or unresolved " + percent(result.unresolved, 1) + ".",
    }, [
      el("div", { class: "methods-break", text: "double-strand break" }),
      el("div", { class: "methods-repair-fork", "aria-hidden": "true" }, [el("i"), el("i"), el("i")]),
      el("div", { class: "methods-repair-outcomes" }, [
        el("div", { class: "methods-repair-outcome is-nhej", style: "border-bottom-width:" + (3 + 9 * result.nhej).toFixed(2) + "px", }, [
          el("span", { text: "NHEJ" }), el("strong", { text: percent(result.nhej, 1) }),
          el("small", { text: percent(result.frameshift, 1) + " frameshift in this fixture" }),
        ]),
        el("div", { class: "methods-repair-outcome is-hdr", style: "border-bottom-width:" + (3 + 9 * result.hdr).toFixed(2) + "px", }, [
          el("span", { text: "HDR" }), el("strong", { text: percent(result.hdr, 1) }),
          el("small", { text: result.donor ? "template-defined edit" : "no donor: unavailable" }),
        ]),
        el("div", { class: "methods-repair-outcome is-other", style: "border-bottom-width:" + (3 + 9 * result.unresolved).toFixed(2) + "px", }, [
          el("span", { text: "other / re-cut" }), el("strong", { text: percent(result.unresolved, 1) }),
          el("small", { text: "perfect repair can regenerate the target" }),
        ]),
      ]),
    ]);
  }

  function editorBoard(el, result) {
    const stages = [
      { label: "address", value: "guide RNA + PAM", tone: "active" },
      { label: "payload", value: result.editor, tone: result.editor.startsWith("no ") ? "warning" : "signal" },
      { label: "written outcome", value: result.writes },
      { label: "cell constraint", value: result.dividing ? "dividing cell" : "non-dividing cell" },
    ];
    return processBoard(el, stages, "Editor selection from desired sequence outcome and cell state");
  }

  function offTargetAssayBoard(el, selected) {
    const assays = [
      ["GUIDE-seq", "breaks in living cells", "tag uptake + rare events"],
      ["CIRCLE/CHANGE-seq", "sensitive cuts on naked DNA", "no chromatin context"],
      ["DISCOVER-seq", "MRE11 at breaks in cells/tissue", "repair-protein detection floor"],
      ["amplicon sequencing", "small outcomes between intact primers", "large deletion, LOH, translocation"],
    ];
    return el("div", {
      class: "methods-assay-board",
      role: "img",
      "aria-label": "Off-target assay comparison. Selected assay: " + selected + ".",
    }, assays.map((row) => el("div", {
      class: "methods-assay-row" + (row[0] === selected ? " is-selected" : ""),
    }, [el("strong", { text: row[0] }), el("span", { text: row[1] }), el("span", { text: row[2] })])));
  }

  function driveBoard(el, result) {
    return barBoard(el, [
      { label: "drive allele next generation", value: result.driveNext, display: percent(result.driveNext, 1), tone: "active" },
      { label: "resistant allele created", value: result.resistantNext, display: percent(result.resistantNext, 1), tone: "warning" },
      { label: "wild-type allele", value: result.wildNext, display: percent(result.wildNext, 1), tone: "signal" },
    ], "One-generation homing-drive teaching model", 1);
  }

  /* Chapter 36 — Core molecular methods ------------------------------- */

  define("molecular-methods-lab", {
    "ch36-o1": "The separation and assay modes contrast programmable nucleic-acid recognition with bespoke protein reagents, then expose dynamic range, peptide ambiguity, and annotation dependence as the three hard mass-spectrometry limits.",
    "ch36-o2": "The amplification console derives copy number from N0(1+E)^n, shows endpoint convergence, moves a fixed qPCR threshold, computes delta-delta-Ct and efficiency-corrected fold change, and inverts positive digital-PCR partitions with the Poisson model.",
    "ch36-o3": "The claim shutter keeps each gel, blot, FISH, reporter, interaction, and proteomic signal beside the stronger conclusion that the method cannot establish.",
    "ch36-o4": "The assembly bench changes fragment count, internal sites, overlap length, and junction uniqueness so restriction cloning, Gibson assembly, and Golden Gate expose their physical addressing constraints; finite capacity is explicitly scoped to the selected teaching libraries.",
    "ch36-o5": "The confirmation state varies shared error between a primary sequencing call and Sanger, demonstrating that orthogonality rather than nominal accuracy is what multiplies error down and naming mixed-template and low-mosaic blind spots.",
    "ch36-o6": "The assay-decision state predicts over-reporting and under-reporting boundaries for antibody occupancy, yeast two-hybrid, co-IP, proximity labelling, reporters, and database-searched mass spectrometry before presenting the controls.",
    "ch36-o7": "Seven question fixtures require a learner to choose the physical signal, method, assumption, legitimate claim, and blind spot as one causal chain rather than recalling technique names in isolation.",
  }, ({ body, el, predict }) => {
    const parts = labParts(el);
    let mode = "amplify";
    let amplificationMode = "pcr";
    let cycles = 40;
    let efficiency = 0.95;
    let initialALog = 1;
    let initialBLog = 6;
    let targetEfficiency = 0.995;
    let referenceEfficiency = 0.995;
    let positives = 4200;
    let partitions = 20000;
    let molecule = "dna";
    let matrix = "agarose";
    let buildView = "assembly";
    let assemblyMethod = "restriction";
    let fragments = 3;
    let internalSite = false;
    let junctionsUnique = true;
    let overlap = 25;
    let sharedError = 0.05;
    let assayQuestion = "length";
    let interactionAssay = "y2h";

    function modeTabs() {
      return tabs(el, [
        { label: "Amplify & count", value: "amplify" },
        { label: "Separate", value: "separate" },
        { label: "Build & confirm", value: "build" },
        { label: "Question → claim", value: "claim" },
      ], mode, (value) => { mode = value; render(); });
    }

    function renderPcr() {
      const common = { efficiency, cycles, capacity: 1e12, threshold: 1e8 };
      const resultA = molecularMethodsModel(Object.assign({ kind: "pcr", n0: Math.pow(10, initialALog) }, common));
      const resultB = molecularMethodsModel(Object.assign({ kind: "pcr", n0: Math.pow(10, initialBLog) }, common));
      parts.visual.innerHTML = amplificationSvg(
        Object.assign({ n0: resultA.n0 }, common),
        Object.assign({ n0: resultB.n0 }, common),
        40
      );
      parts.visual.append(statusStrip(el, [
        { label: "sample A at selected cycle", value: compact(resultA.copies, 2), tone: resultA.plateau ? "warning" : "active" },
        { label: "sample B at selected cycle", value: compact(resultB.copies, 2), tone: resultB.plateau ? "warning" : "signal" },
        { label: "Ct difference", value: Math.abs(resultA.ct - resultB.ct).toFixed(2) + " cycles" },
        { label: "endpoint verdict", value: resultA.plateau && resultB.plateau ? "input history erased" : "still input-sensitive" },
      ], "PCR amplification and plateau readout"));
      parts.controls.replaceChildren(
        choiceRow(el, [
          { label: "PCR plateau", value: "pcr" },
          { label: "qPCR ratios", value: "qpcr" },
          { label: "digital PCR", value: "dpcr" },
        ], amplificationMode, (value) => { amplificationMode = value; render(); }, "Amplification measurement"),
        rangeControl(el, "Selected cycle", cycles, {
          min: 0, max: 40, step: 1, format: (value) => value.toFixed(0),
        }, (value) => { cycles = value; render(); }),
        rangeControl(el, "Per-cycle efficiency E", efficiency, {
          min: 0.5, max: 1, step: 0.01, format: (value) => percent(value, 0),
        }, (value) => { efficiency = value; render(); }),
        rangeControl(el, "Sample A starting copies", initialALog, {
          min: 0, max: 7, step: 0.1, format: (value) => compact(Math.pow(10, value), 1),
        }, (value) => { initialALog = value; render(); }),
        rangeControl(el, "Sample B starting copies", initialBLog, {
          min: 0, max: 7, step: 0.1, format: (value) => compact(Math.pow(10, value), 1),
        }, (value) => { initialBLog = value; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "address", value: "two primers define one interval" },
        { key: "operation", value: "×" + (1 + efficiency).toFixed(2) + " per early cycle" },
        { key: "signal", value: "threshold at 10⁸ copies" },
        { key: "claim boundary", value: resultA.plateau && resultB.plateau ? "endpoint is presence, not starting quantity" : "early-cycle signal retains N₀" },
      ]));
      parts.explanation.innerHTML = resultA.plateau && resultB.plateau ?
        "<strong>The two inputs converge because the plateau is set by the reaction, not N₀.</strong> Quantitative information lives in the threshold cycle during exponential growth. The displayed traces use the chapter’s exact exponential law with an explicit carrying ceiling; the ceiling is a teaching fixture, not a mechanistic kinetic fit." :
        "<strong>Before the plateau, vertical separation preserves the starting-copy ratio.</strong> Changing efficiency moves Ct nonlinearly, which is why a standard-curve slope must be validated before interpreting ΔΔCt.";
    }

    function renderQpcr() {
      const result = molecularMethodsModel({
        kind: "qpcr", targetEfficiency, referenceEfficiency,
        controlTarget: 24.60, controlReference: 20.10,
        treatedTarget: 22.15, treatedReference: 20.05,
      });
      parts.visual.replaceChildren(
        processBoard(el, [
          { label: "control ΔCt", value: result.deltaCtControl.toFixed(2), tone: "active" },
          { label: "treated ΔCt", value: result.deltaCtTreated.toFixed(2), tone: "signal" },
          { label: "ΔΔCt", value: result.deltaDeltaCt.toFixed(2) },
          { label: "efficiency-corrected ratio", value: result.correctedFold.toFixed(2) + "×", tone: Math.abs(result.correctedFold - result.idealFold) > 0.25 ? "warning" : "signal" },
        ], "RT-qPCR normalization chain"),
        blindSpot(el,
          "target/reference ratio in two samples",
          "absolute target abundance",
          "The ratio is interpretable only if the reference is stable and each assay efficiency is measured."
        )
      );
      parts.controls.replaceChildren(
        choiceRow(el, [
          { label: "PCR plateau", value: "pcr" },
          { label: "qPCR ratios", value: "qpcr" },
          { label: "digital PCR", value: "dpcr" },
        ], amplificationMode, (value) => { amplificationMode = value; render(); }, "Amplification measurement"),
        rangeControl(el, "Target assay efficiency", targetEfficiency, {
          min: 0.65, max: 1, step: 0.005, format: (value) => percent(value, 1),
        }, (value) => { targetEfficiency = value; render(); }),
        rangeControl(el, "Reference assay efficiency", referenceEfficiency, {
          min: 0.65, max: 1, step: 0.005, format: (value) => percent(value, 1),
        }, (value) => { referenceEfficiency = value; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "within sample", value: "target Ct − reference Ct" },
        { key: "between samples", value: "treated ΔCt − control ΔCt" },
        { key: "efficiency model", value: "(1+E) raised to Ct differences" },
        { key: "reported ratio", value: result.correctedFold.toFixed(2) + "×" },
      ]));
      parts.explanation.innerHTML = Math.abs(result.correctedFold - result.idealFold) > 0.25 ?
        "<strong>The familiar 2<sup>−ΔΔCt</sup> answer is now materially wrong.</strong> It assumes both assays double perfectly. The displayed corrected ratio uses each selected efficiency; the remaining untested assumption is that ACTB itself did not respond to treatment." :
        "<strong>The chapter fixture reproduces a roughly 5.3-fold increase.</strong> Here both efficiencies are close enough to perfect that the ideal and corrected calculations agree. That agreement is earned by the standard curves, not granted by the formula.";
    }

    function renderDpcr() {
      const result = molecularMethodsModel({ kind: "dpcr", partitions, positives, partitionNl: 0.85 });
      parts.visual.replaceChildren(
        dropletBoard(el, result),
        statusStrip(el, [
          { label: "positive fraction", value: percent(result.positiveFraction, 2), tone: "active" },
          { label: "Poisson λ", value: result.lambda.toFixed(4) },
          { label: "corrected templates", value: compact(result.copies, 0), tone: "signal" },
          { label: "naive undercount", value: percent(result.naiveUndercount, 1), tone: result.naiveUndercount > 0.1 ? "warning" : "muted" },
        ], "Digital-PCR partition count")
      );
      parts.controls.replaceChildren(
        choiceRow(el, [
          { label: "PCR plateau", value: "pcr" },
          { label: "qPCR ratios", value: "qpcr" },
          { label: "digital PCR", value: "dpcr" },
        ], amplificationMode, (value) => { amplificationMode = value; render(); }, "Amplification measurement"),
        rangeControl(el, "Positive partitions k", positives, {
          min: 0, max: partitions - 1, step: 100, format: (value) => compact(value, 0),
        }, (value) => { positives = Math.min(value, partitions - 1); render(); }),
        choiceRow(el, [
          { label: "10,000 partitions", value: 10000 },
          { label: "20,000 partitions", value: 20000 },
          { label: "40,000 partitions", value: 40000 },
        ], partitions, (value) => {
          const fraction = positives / partitions;
          partitions = value;
          positives = Math.round(fraction * partitions);
          render();
        }, "Partition count")
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "partition", value: compact(partitions, 0) + " binary reactions" },
        { key: "endpoint signal", value: compact(result.positives, 0) + " positive" },
        { key: "Poisson inversion", value: "λ = −ln(empty fraction)" },
        { key: "absolute count", value: compact(result.copies, 0) + " templates" },
      ]));
      parts.explanation.innerHTML = "<strong>Digital PCR exploits the plateau instead of reading it quantitatively.</strong> Every occupied partition saturates to the same binary signal. Poisson inversion restores templates hidden when two or more entered one positive partition; no concentration standard is involved.";
    }

    function renderAmplify() {
      if (amplificationMode === "pcr") renderPcr();
      else if (amplificationMode === "qpcr") renderQpcr();
      else renderDpcr();
    }

    function renderSeparate() {
      const result = molecularMethodsModel({
        kind: "gel", molecule, matrix,
        lengths: molecule === "dna" ? [100, 500, 1000, 3000, 10000] : [15, 30, 60, 100, 180],
      });
      parts.visual.replaceChildren(
        gelBoard(el, result),
        blindSpot(el,
          result.separatesByLength ? "migration converted to apparent length" : "native mobility mixes uncontrolled properties",
          molecule === "dna" ? "sequence identity" : "protein identity and folded function",
          result.mechanism
        )
      );
      parts.controls.replaceChildren(
        choiceRow(el, [
          { label: "DNA", value: "dna" }, { label: "protein", value: "protein" },
        ], molecule, (value) => {
          molecule = value;
          matrix = value === "dna" ? "agarose" : "native";
          render();
        }, "Molecule class"),
        choiceRow(el, molecule === "dna" ? [
          { label: "free solution", value: "free" },
          { label: "agarose sieve", value: "agarose" },
        ] : [
          { label: "native gel", value: "native" },
          { label: "SDS-PAGE", value: "sds" },
        ], matrix, (value) => { matrix = value; render(); }, "Separation environment")
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "molecule", value: molecule === "dna" ? "constant phosphate charge density" : "composition-dependent charge + shape" },
        { key: "preparation", value: matrix === "sds" ? "denature + coat with SDS" : matrix },
        { key: "field + matrix", value: result.mechanism },
        { key: "observable", value: result.separatesByLength ? "ordered bands by length" : "no clean length ruler" },
      ]));
      parts.explanation.innerHTML = result.separatesByLength ?
        (molecule === "dna" ?
          "<strong>DNA supplies the constant charge-to-mass ratio; the gel supplies the sieve.</strong> A band at the expected position establishes length, not identity. Correctly sized off-target products remain possible." :
          "<strong>SDS manufactures the property proteins lack.</strong> It unfolds and coats proteins so migration mostly reports mass. A Western adds identity only through an antibody whose specificity must itself be validated.") :
        "<strong>Driving force and drag cancel for DNA in free solution; native proteins add charge and shape confounding.</strong> Without the missing physical operation, a length ladder is not recoverable from the migration pattern.";
    }

    function renderBuild() {
      if (buildView === "assembly") {
        const result = molecularMethodsModel({
          kind: "assembly", method: assemblyMethod, fragments, internalSite, junctionsUnique, overlap,
        });
        parts.visual.replaceChildren(
          assemblyBoard(el, result),
          blindSpot(el,
            result.viable ? "an addressable ordered construct" : "a constraint conflict",
            "correct base sequence after propagation",
            "Assembly establishes connectivity. Full-plasmid sequencing establishes identity."
          )
        );
        parts.controls.replaceChildren(
          choiceRow(el, [
            { label: "Assemble", value: "assembly" },
            { label: "Confirm independently", value: "confirm" },
          ], buildView, (value) => { buildView = value; render(); }, "Build-and-confirm view"),
          choiceRow(el, [
            { label: "restriction", value: "restriction" },
            { label: "Gibson", value: "gibson" },
            { label: "Golden Gate", value: "golden" },
          ], assemblyMethod, (value) => { assemblyMethod = value; render(); }, "Assembly method"),
          rangeControl(el, "Fragments", fragments, {
            min: 1, max: 24, step: 1, format: (value) => value.toFixed(0),
          }, (value) => { fragments = value; render(); }),
          choiceRow(el, [
            { label: "no internal enzyme site", value: false },
            { label: "internal enzyme site", value: true },
          ], internalSite, (value) => { internalSite = value; render(); }, "Internal-site constraint"),
          choiceRow(el, [
            { label: "unique junctions", value: true },
            { label: "reused junction", value: false },
          ], junctionsUnique, (value) => { junctionsUnique = value; render(); }, "Junction addressability"),
          ...(assemblyMethod === "gibson" ? [rangeControl(el, "Overlap length", overlap, {
            min: 8, max: 60, step: 1, format: (value) => value.toFixed(0) + " nt",
          }, (value) => { overlap = value; render(); })] : [])
        );
        parts.rail.replaceChildren(causalRail(el, [
          { key: "parts", value: fragments + " fragments" },
          { key: "address code", value: assemblyMethod === "restriction" ? "fixed recognition sites" : (assemblyMethod === "gibson" ? overlap + "-nt overlaps" : "chosen 4-nt overhangs") },
          { key: "constraint", value: result.constraint },
          { key: "product", value: result.viable ? "one intended order" : "blocked or ambiguous" },
        ]));
        parts.explanation.innerHTML = "<strong>Modern assembly moved specificity from an enzyme’s fixed alphabet into arbitrary designed sequence.</strong> " +
          result.constraint + ". Even a viable assembly remains a hypothesis until the propagated construct is sequenced.";
        return;
      }

      const result = molecularMethodsModel({
        kind: "orthogonal", firstError: 0.01, secondError: 0.02, sharedFraction: sharedError,
      });
      parts.visual.replaceChildren(
        processBoard(el, [
          { label: "primary call", value: "NGS error 1.0%", tone: "active" },
          { label: "second chemistry", value: "Sanger error 2.0%", tone: "signal" },
          { label: "shared failure", value: percent(result.sharedFraction, 0), tone: result.sharedFraction > 0.3 ? "warning" : "muted" },
          { label: "joint wrong call", value: percent(result.jointError, 3), tone: result.jointError < 0.001 ? "signal" : "warning" },
        ], "Orthogonal confirmation error model"),
        blindSpot(el,
          "an independent trace through the addressed amplicon",
          "sample swap, low mosaicism, or a mixture that defeats both paths",
          "Confirmation earns trust only to the extent that failure modes are independent."
        )
      );
      parts.controls.replaceChildren(
        choiceRow(el, [
          { label: "Assemble", value: "assembly" },
          { label: "Confirm independently", value: "confirm" },
        ], buildView, (value) => { buildView = value; render(); }, "Build-and-confirm view"),
        rangeControl(el, "Shared error fraction", sharedError, {
          min: 0, max: 1, step: 0.01, format: (value) => percent(value, 0),
        }, (value) => { sharedError = value; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "primary method", value: "massively parallel sequencing" },
        { key: "orthogonal path", value: "chain termination + capillary" },
        { key: "independence retained", value: percent(1 - sharedError, 0) },
        { key: "joint error", value: percent(result.jointError, 3) },
      ]));
      parts.explanation.innerHTML = sharedError < 0.2 ?
        "<strong>Sanger survives because its chemistry and analysis fail differently.</strong> Under independence, two modest error rates multiply. It still cannot resolve low-level mosaicism well, and a heterozygous indel superimposes everything downstream." :
        "<strong>Nominal accuracy cannot rescue shared failure.</strong> If both assays use the wrong sample or the same paralog-specific primers, the second trace repeats the first mistake instead of testing it.";
    }

    function renderClaim() {
      const result = molecularMethodsModel({ kind: "assay", question: assayQuestion });
      const visualChildren = [
        processBoard(el, [
          { label: "question", value: {
            length: "How long is this fragment?", copies: "How many target copies?", cells: "Which cells carry it?",
            binding: "Where was protein P?", sufficiency: "Can this fragment drive expression?",
            interact: "Do A and B associate?", proteome: "Which proteins are present?",
          }[assayQuestion], tone: "active" },
          { label: "instrument", value: result.method, tone: "signal" },
          { label: "physical signal", value: result.signal },
          { label: "assumption", value: result.assumption, tone: "warning" },
        ], "Question-to-method decision"),
        blindSpot(el, result.claim, result.blind, "Legitimate endpoint: " + result.claim + ".")
      ];
      if (assayQuestion === "proteome") {
        visualChildren.push(processBoard(el, [
          { label: "dynamic range", value: "sample spans ≥10 orders; one run sees roughly 4–5", tone: "warning" },
          { label: "protein inference", value: "shared peptides do not identify one parent protein" },
          { label: "modification occupancy", value: "substoichiometric forms need dedicated enrichment" },
          { label: "root constraint", value: "proteins cannot be amplified", tone: "active" },
        ], "Three hard proteomic limits"));
      }
      if (assayQuestion === "interact") {
        const interaction = molecularMethodsModel({ kind: "interaction", assay: interactionAssay });
        visualChildren.push(processBoard(el, [
          { label: "selected assay", value: interaction.method, tone: "active" },
          { label: "over-reports", value: interaction.over, tone: "warning" },
          { label: "under-reports", value: interaction.under },
          { label: "independent check", value: interaction.control, tone: "signal" },
        ], "Interaction-assay error direction"));
      }
      parts.visual.replaceChildren(...visualChildren);
      parts.controls.replaceChildren(choiceRow(el, [
        { label: "fragment length", value: "length" },
        { label: "absolute copies", value: "copies" },
        { label: "per-cell state", value: "cells" },
        { label: "protein occupancy", value: "binding" },
        { label: "regulatory sufficiency", value: "sufficiency" },
        { label: "protein association", value: "interact" },
        { label: "discovery proteome", value: "proteome" },
      ], assayQuestion, (value) => { assayQuestion = value; render(); }, "Scientific question"),
      ...(assayQuestion === "interact" ? [choiceRow(el, [
        { label: "yeast two-hybrid", value: "y2h" },
        { label: "co-IP", value: "coip" },
        { label: "proximity labelling", value: "proximity" },
      ], interactionAssay, (value) => { interactionAssay = value; render(); }, "Interaction assay")]: []));
      parts.rail.replaceChildren(causalRail(el, [
        { key: "question", value: {
          length: "length", copies: "absolute count", cells: "cell-resolved state", binding: "occupancy",
          sufficiency: "sufficiency", interact: "association", proteome: "discovery identity",
        }[assayQuestion] },
        { key: "method", value: result.method },
        { key: "readout", value: result.signal },
        { key: "claim", value: result.claim },
      ]));
      parts.explanation.innerHTML = "<strong>A method name is not an answer until its assumption is stated.</strong> " +
        result.assumption + ". The shutter keeps the unmeasured quantity visible so a signal cannot silently become mechanism, necessity, direct binding, or universal identity.";
    }

    function render() {
      parts.tabHost.replaceChildren(modeTabs());
      if (mode === "amplify") renderAmplify();
      else if (mode === "separate") renderSeparate();
      else if (mode === "build") renderBuild();
      else renderClaim();
    }

    predict(body, {
      widget: "molecular-methods-lab",
      question: "Two endpoint PCR tubes start with 10 and 1,000,000 target copies. After enough efficient cycles, which tube must contain proportionally more product?",
      hint: "Ask what sets the late plateau: the starting count, or the finite reaction capacity?",
      options: [
        { label: "The 1,000,000-copy tube, by 100,000×" },
        { label: "They converge toward a similar plateau", correct: true },
        { label: "The 10-copy tube, because it has more cycles left" },
        { label: "Endpoint yield gives the original ratio exactly" },
      ],
    }, () => {
      mode = "amplify";
      amplificationMode = "pcr";
      cycles = 40;
      initialALog = 1;
      initialBLog = 6;
      parts.instrument.hidden = false;
      render();
    });
    finishLab(parts, body);
  });

  /* Chapter 37 — Model organisms and genetic screens ------------------ */

  define("genetic-screen-lab", {
    "ch37-o1": "The direction switch starts either from an unindexed phenotype or a named gene, then keeps the hard downstream step visible: causal mapping for forward genetics and powered phenotyping for reverse genetics.",
    "ch37-o2": "The model-organism field chooses among microbial, invertebrate, vertebrate, and human systems from the biological question, generation time, genetic tractability, scorable phenotype, and explicit instrument distortion.",
    "ch37-o3": "The discovery mode builds dominant or recessive breeding logic, computes F2 clone recovery, changes mutagen properties, and estimates unseen target genes from the singleton–doubleton allele spectrum rather than declaring saturation from screen size.",
    "ch37-o4": "The complementation matrix groups recessive mutants while naming dominant-negative, intragenic-complementation, and unlinked-non-complementation failures; the mapping peak then separates selected-meiosis resolution from sequencing-depth precision.",
    "ch37-o5": "The double-mutant state calculates multiplicative expectation and epsilon, distinguishes aggravating, alleviating, and independent interactions, and keeps classical pathway ordering conditional on allele type and wiring sign.",
    "ch37-o6": "The pooled-screen state treats barcode change as differential abundance, varies cells and reads per guide independently, aggregates the causal noise floor at the construct level, and exposes copy-number cutting toxicity as a mismatched null.",
    "ch37-o7": "The no-phenotype audit converts sample size and effect into power while separately testing redundancy, conditionality, compensation, genetic background, and pseudoreplication before allowing a bounded negative claim.",
  }, ({ body, el, predict }) => {
    const parts = labParts(el);
    let mode = "choose";
    let organismQuestion = "cell-cycle";
    let direction = "forward";
    let discoveryView = "mutagen";
    let mutagen = "ems";
    let clones = 11;
    let recoveredGroups = 27;
    let singletons = 9;
    let doubletons = 7;
    let complementFixture = "clean";
    let selectedIndividuals = 50;
    let mappingDistance = 10;
    let depth = 20;
    let poolView = "abundance";
    let cellsPerGuide = 100;
    let readsPerGuide = 500;
    let log2Effect = -0.5;
    let wa = 0.8;
    let wb = 0.7;
    let wab = 0.3;
    let pathwayDouble = "constitutive";
    let pathwaySign = "positive";
    let animals = 8;
    let trueEffect = 0.5;
    let negativeCause = "power";

    function modeTabs() {
      return tabs(el, [
        { label: "Choose the instrument", value: "choose" },
        { label: "Discover genes", value: "discover" },
        { label: "Map the lesion", value: "map" },
        { label: "Pool & interact", value: "pool" },
        { label: "Audit ‘no phenotype’", value: "negative" },
      ], mode, (value) => { mode = value; render(); });
    }

    function renderChoose() {
      const result = geneticScreenModel({ kind: "organism", question: organismQuestion });
      const directionRecord = direction === "forward" ? {
        start: "phenotype", perturb: "random, unindexed variation", hard: "locate the causal lesion", reward: "components no prior hypothesis nominated",
      } : {
        start: "named gene", perturb: "targeted knockout or knockdown", hard: "choose a phenotype that touches its function", reward: "consequence of a selected component",
      };
      parts.visual.replaceChildren(
        organismBoard(el, organismQuestion, result),
        processBoard(el, [
          { label: "inference starts", value: directionRecord.start, tone: "active" },
          { label: "perturbation", value: directionRecord.perturb },
          { label: "hard step", value: directionRecord.hard, tone: "warning" },
          { label: "what it buys", value: directionRecord.reward, tone: "signal" },
        ], "Forward-versus-reverse inference direction")
      );
      parts.controls.replaceChildren(
        choiceRow(el, [
          { label: "forward: phenotype → gene", value: "forward" },
          { label: "reverse: gene → phenotype", value: "reverse" },
        ], direction, (value) => { direction = value; render(); }, "Genetic-inference direction"),
        choiceRow(el, [
          { label: "cell-cycle machinery", value: "cell-cycle" },
          { label: "vertebrate development", value: "vertebrate-development" },
          { label: "adaptive immunity", value: "adaptive-immunity" },
          { label: "human neuron", value: "human-neuron" },
        ], organismQuestion, (value) => { organismQuestion = value; render(); }, "Biological question")
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "question", value: organismQuestion.replaceAll("-", " ") },
        { key: "instrument", value: result.best },
        { key: "advantage", value: result.reason },
        { key: "distortion", value: result.blind },
      ]));
      parts.explanation.innerHTML = "<strong>A model organism is an instrument, not a miniature human.</strong> " +
        result.best + " wins this fixture because " + result.reason + ". The cost is " + result.blind +
        "; translational relevance must be re-argued rather than inherited from the species name.";
    }

    function complementationBoard() {
      const labels = ["m1", "m2", "m3", "m4"];
      const groups = complementFixture === "clean" ? [0, 0, 1, 2] :
        (complementFixture === "dominant" ? [0, 0, 0, 0] :
          (complementFixture === "unlinked" ? [0, 1, 2, 3] : [0, 1, 1, 2]));
      const board = el("div", {
        class: "methods-complement-board",
        role: "img",
        "aria-label": "Complementation matrix for four mutants. Wild-type progeny mark complementation and mutant progeny mark non-complementation. Fixture: " + complementFixture,
      });
      board.append(el("span", { class: "methods-matrix-corner", text: "×" }));
      labels.forEach((label) => board.append(el("strong", { class: "methods-matrix-head", text: label })));
      labels.forEach((rowLabel, rowIndex) => {
        board.append(el("strong", { class: "methods-matrix-head", text: rowLabel }));
        labels.forEach((columnLabel, columnIndex) => {
          const diagonal = rowIndex === columnIndex;
          let fails = groups[rowIndex] === groups[columnIndex];
          if (complementFixture === "intragenic" && rowIndex === 0 && columnIndex === 1) fails = false;
          if (complementFixture === "unlinked" &&
              ((rowIndex === 0 && columnIndex === 1) || (rowIndex === 1 && columnIndex === 0))) fails = true;
          board.append(el("span", {
            class: "methods-matrix-cell" + (fails ? " is-fail" : " is-pass") + (diagonal ? " is-diagonal" : ""),
            text: diagonal ? "—" : (fails ? "mutant" : "WT"),
          }));
        });
      });
      return board;
    }

    function renderDiscover() {
      const subTabs = choiceRow(el, [
        { label: "choose mutagen", value: "mutagen" },
        { label: "breed recessives", value: "breeding" },
        { label: "estimate saturation", value: "saturation" },
        { label: "group by complementation", value: "complement" },
      ], discoveryView, (value) => { discoveryView = value; render(); }, "Forward-screen stage");

      if (discoveryView === "mutagen") {
        const records = {
          ems: ["dense G:C→A:T point mutations", "allelic series: null, hypomorph, temperature-sensitive", "lesion carries no tag; map it"],
          xray: ["deletions and rearrangements from double-strand breaks", "clean nulls and interval-defining deletions", "multi-gene lesions complicate breeding"],
          transposon: ["tagged insertion with biased genomic landing", "recover flanking sequence to identify the locus", "some genes are structurally never hit"],
          crispr: ["designed indexed indels across a library", "forward phenotype with reverse-genetic bookkeeping", "only the sequences and PAMs you designed are searchable"],
        };
        const record = records[mutagen];
        parts.visual.replaceChildren(
          processBoard(el, [
            { label: "perturbation spectrum", value: record[0], tone: "active" },
            { label: "discovery advantage", value: record[1], tone: "signal" },
            { label: "cost paid later", value: record[2], tone: "warning" },
            { label: "dose rule", value: "about one lethal-equivalent per genome; maximise recoverable information, not damage" },
          ], "Forward-screen perturbation design"),
          blindSpot(el,
            "genes whose perturbation reaches the selected phenotype",
            "redundant, essential, pleiotropic, or unscored functions",
            "Saturation belongs to this screen and assay, never to the whole genome."
          )
        );
        parts.controls.replaceChildren(
          subTabs,
          choiceRow(el, [
            { label: "EMS", value: "ems" },
            { label: "X-ray / γ", value: "xray" },
            { label: "transposon insertion", value: "transposon" },
            { label: "CRISPR library", value: "crispr" },
          ], mutagen, (value) => { mutagen = value; render(); }, "Mutagen or perturbation")
        );
        parts.rail.replaceChildren(causalRail(el, [
          { key: "question", value: "find components of an unknown phenotype" },
          { key: "perturbation", value: record[0] },
          { key: "oracle", value: "scorable phenotype under named conditions" },
          { key: "causal recovery", value: record[2] },
        ]));
        parts.explanation.innerHTML = "<strong>Mutagen choice trades an allelic spectrum against identification cost and genomic reach.</strong> " +
          record[1] + ". The screen still needs a breeding scheme that exposes the allele and an oracle that can recognise the relevant phenotype.";
        return;
      }

      if (discoveryView === "breeding") {
        const result = geneticScreenModel({ kind: "breeding", clones });
        parts.visual.replaceChildren(
          processBoard(el, [
            { label: "mutagenised P gamete", value: "one new allele, heterozygous in F1", tone: "active" },
            { label: "F1 readout", value: "dominants visible; recessive loss hidden", tone: "warning" },
            { label: "selfed F2 clone", value: "1/4 homozygous at the locus" },
            { label: "recovery across clones", value: percent(result.recovery, 2), tone: result.recovery >= 0.95 ? "signal" : "warning" },
          ], "C. elegans recessive-screen breeding logic"),
          blindSpot(el,
            "recessive phenotype among homozygosed progeny",
            "redundant, earlier-lethal, pleiotropic, or unscored functions",
            "Breeding can expose an allele only if the phenotype oracle can see its consequence."
          )
        );
        parts.controls.replaceChildren(
          subTabs,
          rangeControl(el, "F2 clones from one heterozygous line", clones, {
            min: 1, max: 30, step: 1, format: (value) => value.toFixed(0),
          }, (value) => { clones = value; render(); })
        );
        parts.rail.replaceChildren(causalRail(el, [
          { key: "F1", value: "all candidate alleles heterozygous" },
          { key: "selfing", value: "each F2 has 1/4 homozygous probability" },
          { key: "sampling", value: clones + " independent clones" },
          { key: "at least one recovered", value: percent(result.recovery, 2) },
        ]));
        parts.explanation.innerHTML = result.recovery >= 0.95 ?
          "<strong>Eleven clones cross 95% recovery because 1 − (3/4)<sup>11</sup> ≈ 95.8%.</strong> The shortcut belongs to a selfing organism. A mouse needs the three-generation carrier/backcross scheme because no individual self-crosses." :
          "<strong>The allele can be present and still be missed by Mendelian sampling.</strong> Increase independent F2 clones; sequencing the same unrecovered brood more deeply cannot make a homozygote appear.";
        return;
      }

      if (discoveryView === "saturation") {
        const result = geneticScreenModel({
          kind: "saturation", recoveredGroups, singletons, doubletons,
        });
        parts.visual.replaceChildren(
          saturationBoard(el, result),
          statusStrip(el, [
            { label: "recovered groups", value: result.recoveredGroups, tone: "active" },
            { label: "estimated unseen", value: result.unseen.toFixed(1), tone: result.unseen > 2 ? "warning" : "muted" },
            { label: "estimated targetable total", value: result.estimatedTotal.toFixed(1) },
            { label: "screen saturation", value: percent(result.saturation, 1), tone: result.saturation >= 0.95 ? "signal" : "warning" },
          ], "Allele-spectrum saturation estimate")
        );
        parts.controls.replaceChildren(
          subTabs,
          rangeControl(el, "Recovered complementation groups", recoveredGroups, {
            min: 2, max: 50, step: 1, format: (value) => value.toFixed(0),
          }, (value) => { recoveredGroups = value; render(); }),
          rangeControl(el, "Singleton groups f₁", singletons, {
            min: 0, max: 25, step: 1, format: (value) => value.toFixed(0),
          }, (value) => { singletons = value; render(); }),
          rangeControl(el, "Doubleton groups f₂", doubletons, {
            min: 1, max: 25, step: 1, format: (value) => value.toFixed(0),
          }, (value) => { doubletons = value; render(); })
        );
        parts.rail.replaceChildren(causalRail(el, [
          { key: "allele spectrum", value: singletons + " singletons · " + doubletons + " doubletons" },
          { key: "unseen estimator", value: "f₁²/(2f₂) = " + result.unseen.toFixed(1) },
          { key: "targetable total", value: result.estimatedTotal.toFixed(1) + " groups" },
          { key: "coverage", value: percent(result.saturation, 1) },
        ]));
        parts.explanation.innerHTML = "<strong>Many singletons are evidence that discovery is still generating new classes.</strong> The estimator describes genes targetable by this phenotype in this background. Redundant, essential, pleiotropic, and unmeasured functions are outside its sampled universe.";
        return;
      }

      const failure = {
        clean: ["recessive loss-of-function alleles", "equivalence classes are plausible genes", "confirm each group by sequence"],
        dominant: ["dominant-negative allele", "fails to complement unrelated partners", "the equivalence relation collapses"],
        intragenic: ["two domains rescue in a multimer", "same-gene alleles appear to complement", "sequence reveals one locus"],
        unlinked: ["dosage-sensitive products from different genes", "different loci fail to complement", "sequence reveals unlinked non-complementation"],
      }[complementFixture];
      parts.visual.replaceChildren(
        complementationBoard(),
        processBoard(el, [
          { label: "fixture assumption", value: failure[0], tone: complementFixture === "clean" ? "signal" : "warning" },
          { label: "matrix consequence", value: failure[1] },
          { label: "required check", value: failure[2], tone: "active" },
        ], "Complementation-test validity audit")
      );
      parts.controls.replaceChildren(
        subTabs,
        choiceRow(el, [
          { label: "clean recessive LOF", value: "clean" },
          { label: "dominant-negative", value: "dominant" },
          { label: "intragenic complementation", value: "intragenic" },
          { label: "unlinked non-complementation", value: "unlinked" },
        ], complementFixture, (value) => { complementFixture = value; render(); }, "Complementation fixture")
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "cross", value: "m1/m1 × m2/m2" },
        { key: "trans-heterozygote", value: "m1/m2" },
        { key: "phenotype", value: complementFixture === "clean" ? "WT means different genes" : "assumption violated" },
        { key: "identity check", value: "sequence both lesions" },
      ]));
      parts.explanation.innerHTML = complementFixture === "clean" ?
        "<strong>For recessive loss-of-function alleles, non-complementation defines a candidate same-gene group.</strong> Sequence confirmation remains essential because dosage-sensitive partners can also produce unlinked non-complementation." :
        "<strong>The test is an inference conditional on allele behaviour.</strong> " + failure[1] + ". A complementation matrix is not a universal gene counter; it is reliable only when its recessive loss-of-function premise survives.";
    }

    function renderMap() {
      const result = geneticScreenModel({
        kind: "bulk", selectedIndividuals, distanceCm: mappingDistance, depth,
      });
      parts.visual.innerHTML = bulkSegregantSvg(result);
      parts.visual.append(statusStrip(el, [
        { label: "selected chromosomes", value: result.selectedChromosomes, tone: "active" },
        { label: "breakpoint floor", value: result.breakpointFloorCm.toFixed(2) + " cM", tone: "signal" },
        { label: "pool-composition SE", value: result.poolSe.toFixed(3), tone: result.poolSe > result.readSe ? "warning" : "muted" },
        { label: "read-sampling SE", value: result.readSe.toFixed(3) },
      ], "Bulk-segregant resolution and sampling limits"));
      parts.controls.replaceChildren(
        rangeControl(el, "Selected F2 individuals", selectedIndividuals, {
          min: 10, max: 500, step: 10, format: (value) => value.toFixed(0),
        }, (value) => { selectedIndividuals = value; render(); }),
        rangeControl(el, "Marker distance from lesion", mappingDistance, {
          min: 0, max: 120, step: 1, format: (value) => value.toFixed(0) + " cM",
        }, (value) => { mappingDistance = value; render(); }),
        rangeControl(el, "Sequencing depth", depth, {
          min: 5, max: 300, step: 5, format: (value) => value.toFixed(0) + "×",
        }, (value) => { depth = value; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "selected meioses", value: selectedIndividuals + " F2 × 2 = " + result.selectedChromosomes + " chromosomes" },
        { key: "map conversion", value: result.distanceCm.toFixed(0) + " cM → r = " + result.recombination.toFixed(3) + " under Haldane" },
        { key: "linked ancestry", value: "frequency = 1 − r = " + result.expectedFrequency.toFixed(2) },
        { key: "breakpoint floor", value: result.breakpointFloorCm.toFixed(2) + " cM" },
      ]));
      const samplingLesson = result.readSe < result.poolSe / 2
        ? " Read-sampling error is already below pool-composition error, while interval resolution is bounded by actual selected recombination breakpoints. Add independent meioses, not depth."
        : " Depth still contributes visible frequency noise, but it never creates a breakpoint. Raise depth only until window-averaged read noise is below finite-pool noise; then add selected meioses.";
      parts.explanation.innerHTML = "<strong>Map distance is not observed recombination percentage.</strong> " +
        "This no-interference fixture uses Haldane: 10 cM is close to 10% recombination, but multiple crossovers make r approach 0.5 rather than grow without bound." + samplingLesson;
    }

    function renderPool() {
      const subTabs = choiceRow(el, [
        { label: "pooled abundance", value: "abundance" },
        { label: "double-mutant interaction", value: "epistasis" },
        { label: "pathway order", value: "pathway" },
      ], poolView, (value) => { poolView = value; render(); }, "Screen readout");
      if (poolView === "abundance") {
        const result = geneticScreenModel({ kind: "pooled", cellsPerGuide, readsPerGuide, log2Effect });
        parts.visual.replaceChildren(
          barBoard(el, [
            { label: "cell-bottleneck log noise", value: result.cellLogSe, display: result.cellLogSe.toFixed(3), tone: result.cellLogSe >= result.readLogSe ? "warning" : "muted" },
            { label: "sequencing log noise", value: result.readLogSe, display: result.readLogSe.toFixed(3), tone: result.readLogSe > result.cellLogSe ? "warning" : "muted" },
            { label: "selected effect magnitude", value: Math.abs(log2Effect) * Math.log(2), display: Math.abs(log2Effect).toFixed(2) + " log₂", tone: "signal" },
          ], "Construct-level signal and two sampling floors", Math.max(result.cellLogSe, result.readLogSe, Math.abs(log2Effect) * Math.log(2))),
          statusStrip(el, [
            { label: "cells per guide", value: compact(cellsPerGuide, 0), tone: cellsPerGuide < 200 ? "warning" : "signal" },
            { label: "reads per guide", value: compact(readsPerGuide, 0) },
            { label: "expected abundance", value: percent(result.relativeAbundance, 1) + " of T₀" },
            { label: "signal / noise z", value: result.z.toFixed(2), tone: result.z >= 3 ? "signal" : "warning" },
          ], "Pooled-screen differential-abundance fixture")
        );
        parts.controls.replaceChildren(
          subTabs,
          rangeControl(el, "Cells carried per guide", cellsPerGuide, {
            min: 10, max: 1000, step: 10, format: (value) => compact(value, 0),
          }, (value) => { cellsPerGuide = value; render(); }),
          rangeControl(el, "Reads per guide", readsPerGuide, {
            min: 10, max: 2000, step: 10, format: (value) => compact(value, 0),
          }, (value) => { readsPerGuide = value; render(); }),
          rangeControl(el, "True guide effect", log2Effect, {
            min: -2, max: 1, step: 0.05, format: (value) => value.toFixed(2) + " log₂",
          }, (value) => { log2Effect = value; render(); })
        );
        parts.rail.replaceChildren(causalRail(el, [
          { key: "one perturbation per lineage", value: "low-MOI barcode" },
          { key: "biological resampling", value: cellsPerGuide + " cells / guide" },
          { key: "read resampling", value: readsPerGuide + " reads / guide" },
          { key: "gene evidence", value: "aggregate several concordant guides" },
        ]));
        parts.explanation.innerHTML = cellsPerGuide < 200 && readsPerGuide > cellsPerGuide ?
          "<strong>The screen is sequencing the bottleneck more precisely.</strong> Once lineages were lost during passage, extra reads cannot restore them. Maintain several hundred cells per construct and use non-targeting plus cut-number-matched controls for copy-number toxicity." :
          "<strong>Cells and reads are two distinct sampling stages.</strong> Guide-level replication estimates reagent noise; robust gene-level aggregation prevents two inert guides from cancelling six real ones, while copy-number-aware controls separate gene function from DSB burden.";
        return;
      }

      if (poolView === "pathway") {
        const interpretable = pathwaySign === "positive";
        const conclusion = !interpretable ? "slogan invalid: reason from signed wiring" :
          (pathwayDouble === "constitutive" ? "B acts downstream of A" : "B output still requires A; B is upstream of A");
        parts.visual.replaceChildren(
          processBoard(el, [
            { label: "a loss-of-function", value: "no response", tone: "warning" },
            { label: "b gain-of-function", value: "constitutive response", tone: "signal" },
            { label: "a(lf); b(gf) double", value: pathwayDouble === "constitutive" ? "constitutive" : "no response", tone: "active" },
            { label: "pathway conclusion", value: conclusion, tone: interpretable ? "signal" : "warning" },
          ], "Double-mutant pathway-order fixture"),
          blindSpot(el,
            interpretable ? conclusion : "an allele combination in signed wiring",
            "physical contact or order in an arbitrary branched pathway",
            "Ordering requires true null and constitutive alleles, opposite phenotypes, and known regulatory signs."
          )
        );
        parts.controls.replaceChildren(
          subTabs,
          choiceRow(el, [
            { label: "double is constitutive", value: "constitutive" },
            { label: "double has no response", value: "none" },
          ], pathwayDouble, (value) => { pathwayDouble = value; render(); }, "Double-mutant phenotype"),
          choiceRow(el, [
            { label: "linear positive chain", value: "positive" },
            { label: "contains a negative regulator", value: "negative" },
          ], pathwaySign, (value) => { pathwaySign = value; render(); }, "Pathway-sign assumption")
        );
        parts.rail.replaceChildren(causalRail(el, [
          { key: "model", value: pathwaySign === "positive" ? "cue → A → B → response" : "signed edge present" },
          { key: "single alleles", value: "a(lf) off · b(gf) on" },
          { key: "double phenotype", value: pathwayDouble === "constitutive" ? "on" : "off" },
          { key: "order", value: conclusion },
        ]));
        parts.explanation.innerHTML = interpretable ?
          (pathwayDouble === "constitutive" ?
            "<strong>Constitutive B bypasses the loss of A, so B is downstream in this positive chain.</strong> This is information-flow order, not evidence that A and B touch." :
            "<strong>B’s constitutive output still requires A, so B is upstream in this positive chain.</strong> The result orders defined allele effects, not generic gene names.") :
          "<strong>A negative regulator reverses the memorised ‘epistatic equals downstream’ slogan.</strong> Draw the signed wiring and propagate each allele’s effect; otherwise the double phenotype does not identify order.";
        return;
      }

      const result = geneticScreenModel({ kind: "epistasis", wa, wb, wab });
      parts.visual.replaceChildren(
        processBoard(el, [
          { label: "single A fitness", value: wa.toFixed(2), tone: "active" },
          { label: "single B fitness", value: wb.toFixed(2), tone: "active" },
          { label: "independent double WₐWᵦ", value: result.expected.toFixed(3) },
          { label: "observed double + epsilon", value: result.wab.toFixed(2) + " · ε " + result.epsilon.toFixed(3), tone: result.epsilon < -0.05 ? "warning" : "signal" },
        ], "Multiplicative genetic-interaction model"),
        blindSpot(el,
          result.className,
          "direct physical binding or universal pathway order",
          "Interaction profiles report functional dependence; classical ordering additionally needs defined alleles and signed wiring."
        )
      );
      parts.controls.replaceChildren(
        subTabs,
        rangeControl(el, "Single-mutant fitness Wₐ", wa, {
          min: 0, max: 1.2, step: 0.02, format: (value) => value.toFixed(2),
        }, (value) => { wa = value; render(); }),
        rangeControl(el, "Single-mutant fitness Wᵦ", wb, {
          min: 0, max: 1.2, step: 0.02, format: (value) => value.toFixed(2),
        }, (value) => { wb = value; render(); }),
        rangeControl(el, "Observed double fitness Wₐᵦ", wab, {
          min: 0, max: 1.2, step: 0.02, format: (value) => value.toFixed(2),
        }, (value) => { wab = value; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "null wiring", value: "independent effects multiply" },
        { key: "expected double", value: result.expected.toFixed(3) },
        { key: "observed double", value: result.wab.toFixed(3) },
        { key: "interaction", value: "ε = " + result.epsilon.toFixed(3) + " · " + result.className },
      ]));
      parts.explanation.innerHTML = result.epsilon < -0.05 ?
        "<strong>The double is worse than multiplicative independence: an aggravating interaction.</strong> The synthetic-lethal corner often reveals parallel buffering routes, but epsilon alone does not prove that the proteins bind." :
        (result.epsilon > 0.05 ?
          "<strong>The double is healthier than the multiplicative null: an alleviating interaction.</strong> Masking often appears within one pathway or complex, but signed pathway order still requires mechanistically defined alleles." :
          "<strong>The selected double is close to multiplicative independence.</strong> That is a quantitative null for fitness, not proof that the genes have no relationship under another condition or phenotype." );
    }

    function renderNegative() {
      const result = geneticScreenModel({ kind: "negative", animalsPerGroup: animals, trueEffectSd: trueEffect });
      const causes = {
        power: ["finite independent animals", "effect smaller than the powered detection limit", "report N, interval, and minimum detectable effect"],
        redundancy: ["a paralogue buffers loss", "single knockout looks normal", "build the double mutant or sensitised background"],
        condition: ["function is environment-specific", "rich laboratory conditions never call it", "apply the relevant stress, diet, infection, or age"],
        compensation: ["stable mutant adapts transcriptionally", "acute knockdown and knockout disagree", "compare acute depletion and decay-triggering alleles"],
        background: ["modifier alleles differ", "separate WT stock confounds the locus", "use same-background littermate controls"],
        pseudo: ["cells or wells counted as animals", "precision is inflated", "analyse the independent animal, litter, or infection unit"],
      };
      const cause = causes[negativeCause];
      parts.visual.replaceChildren(
        statusStrip(el, [
          { label: "independent animals / group", value: animals, tone: "active" },
          { label: "true effect fixture", value: trueEffect.toFixed(2) + " SD" },
          { label: "80% detectable effect", value: result.detectable80.toFixed(2) + " SD", tone: result.detectable80 > trueEffect ? "warning" : "signal" },
          { label: "approximate power", value: percent(result.power, 1), tone: result.power >= 0.8 ? "signal" : "warning" },
        ], "Two-group normal-approximation power audit"),
        processBoard(el, [
          { label: "hidden mechanism", value: cause[0], tone: negativeCause === "power" ? "active" : "warning" },
          { label: "observed null result", value: cause[1] },
          { label: "discriminating next step", value: cause[2], tone: "signal" },
        ], "No-phenotype alternative explanation")
      );
      parts.controls.replaceChildren(
        choiceRow(el, [
          { label: "low power", value: "power" },
          { label: "redundancy", value: "redundancy" },
          { label: "wrong condition", value: "condition" },
          { label: "compensation", value: "compensation" },
          { label: "background", value: "background" },
          { label: "pseudoreplication", value: "pseudo" },
        ], negativeCause, (value) => { negativeCause = value; render(); }, "Null-result explanation"),
        rangeControl(el, "Independent animals per group", animals, {
          min: 3, max: 100, step: 1, format: (value) => value.toFixed(0),
        }, (value) => { animals = value; render(); }),
        rangeControl(el, "True effect size", trueEffect, {
          min: 0, max: 2, step: 0.05, format: (value) => value.toFixed(2) + " SD",
        }, (value) => { trueEffect = value; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "assay universe", value: "named traits, condition, age, background" },
        { key: "independent N", value: animals + " animals / group" },
        { key: "power for chosen effect", value: percent(result.power, 1) },
        { key: "defensible claim", value: "no difference detected within these bounds" },
      ]));
      parts.explanation.innerHTML = result.power < 0.8 ?
        "<strong>‘No phenotype’ currently means ‘the experiment usually misses this effect.’</strong> The bounded statement must name assays, background, conditions, independent N, and the effect size the design could exclude." :
        "<strong>This design can exclude the selected effect in the measured assay, not every function of the gene.</strong> " +
          cause[2] + ". Negative evidence becomes useful only after its alternative explanations are actively separated.";
    }

    function render() {
      parts.tabHost.replaceChildren(modeTabs());
      if (mode === "choose") renderChoose();
      else if (mode === "discover") renderDiscover();
      else if (mode === "map") renderMap();
      else if (mode === "pool") renderPool();
      else renderNegative();
    }

    predict(body, {
      widget: "genetic-screen-lab",
      question: "A pooled CRISPR screen carries only 50 cells per guide through a passage, then sequences 500 reads per guide. Replicates disagree. Which resource most directly lowers the dominant noise?",
      hint: "A sequencer can recount surviving barcodes, but can it restore lineages lost before DNA extraction?",
      options: [
        { label: "Ten times more sequencing reads" },
        { label: "Several hundred cells per guide at every passage", correct: true },
        { label: "One guide instead of several per gene" },
        { label: "A larger reference genome" },
      ],
    }, () => {
      mode = "pool";
      poolView = "abundance";
      cellsPerGuide = 50;
      readsPerGuide = 500;
      parts.instrument.hidden = false;
      render();
    });
    finishLab(parts, body);
  });

  /* Chapter 38 — Genome editing --------------------------------------- */

  define("genome-editor-lab", {
    "ch38-o1": "Every state separates the programmable address, the attached payload, and the cell-written outcome, allowing older protein-engineered nucleases, guide-specified Cas systems, dCas9 payloads, and repair exploitation to be compared on the component each innovation changed.",
    "ch38-o2": "The repair fork changes G1, S/G2, and post-mitotic contexts with or without a donor, exposes NHEJ as the absorbing knockout route, and keeps exact rewriting conditional on competing HDR availability.",
    "ch38-o3": "The sequence runway labels the 20-nt protospacer, PAM-proximal seed, NGG self/non-self gate, R-loop direction, and blunt cut three bases upstream while mismatch position changes relative cleavage.",
    "ch38-o4": "The off-target audit computes the chapter’s Hamming-neighbourhood candidate bound, distinguishes seed from distal mismatches and chromatin access, compares orthogonal nomination assays, and shows why primer-spanning amplicons condition on large damage not occurring.",
    "ch38-o5": "The editor chooser maps knockout, transition, transversion, insertion, and large replacement goals onto nuclease, base, prime, or HDR routes while testing division state and bystander-free edit-window constraints.",
    "ch38-o6": "The screen and delivery states connect low-MOI guide counting to negative-binomial analysis, copy-number cutting toxicity, in-frame escape, cargo capacity, exposure duration, target tissue, and the ex-vivo quality-control checkpoint.",
    "ch38-o7": "The boundary mode distinguishes established somatic editing from heritable intervention, labels the chapter’s August 2026 governance snapshot, and models homing versus resistant-allele production without converting a community decision into a fake technical score.",
  }, ({ body, el, predict }) => {
    const parts = labParts(el);
    let mode = "target";
    let targetView = "mechanism";
    let targetingPlatform = "crispr";
    let mismatchPosition = 5;
    let mismatches = 0;
    let accessible = true;
    let pam = true;
    let phase = "g1";
    let donor = true;
    let editGoal = "knockout";
    let dividing = true;
    let bystanderFree = true;
    let maxMismatches = 3;
    let offTargetAssay = "GUIDE-seq";
    let limitsView = "delivery";
    let deliveryRoute = "rnp";
    let screenCopyNumber = 2;
    let screenIndelRate = 0.62;
    let screenFrameshift = 0.68;
    let driveFrequency = 0.1;
    let homing = 0.9;
    let resistance = 0.05;

    function modeTabs() {
      return tabs(el, [
        { label: "Aim & cut", value: "target" },
        { label: "Let the cell repair", value: "repair" },
        { label: "Choose an editor", value: "editor" },
        { label: "Audit damage", value: "risk" },
        { label: "Delivery & boundaries", value: "limits" },
      ], mode, (value) => { mode = value; render(); });
    }

    function renderTarget() {
      const subTabs = choiceRow(el, [
        { label: "compare targeting platforms", value: "platforms" },
        { label: "walk Cas9 recognition", value: "mechanism" },
      ], targetView, (value) => { targetView = value; render(); }, "Addressing view");

      if (targetView === "platforms") {
        const records = {
          meganuclease: ["redesign protein–DNA contacts", "native nuclease", "months; few reachable targets", "addressing protein re-engineered"],
          zfn: ["assemble context-dependent 3-bp zinc fingers in pairs", "FokI dimer cut", "weeks", "modular protein code, still recompiled"],
          talen: ["one TALE repeat per base in two arrays", "FokI dimer cut", "days; repetitive constructs", "one-to-one protein code"],
          crispr: ["20-nt guide RNA + PAM", "Cas nuclease cut", "hours; order an oligo", "binding energy moved to base pairing"],
          dcas9: ["20-nt guide RNA + PAM", "swappable non-cutting payload", "hours", "address became a reusable API"],
        };
        const record = records[targetingPlatform];
        parts.visual.replaceChildren(
          processBoard(el, [
            { label: "programmable address", value: record[0], tone: "active" },
            { label: "payload", value: record[1], tone: "signal" },
            { label: "cost per new target", value: record[2], tone: targetingPlatform === "crispr" || targetingPlatform === "dcas9" ? "signal" : "warning" },
            { label: "innovation", value: record[3] },
          ], "Addressing-versus-payload decomposition"),
          blindSpot(el,
            "a programmable molecular address plus attached operation",
            "the cell’s final repaired sequence",
            "Targeting innovations changed how an address is specified; nuclease platforms still delegate writing to repair."
          )
        );
        parts.controls.replaceChildren(
          subTabs,
          choiceRow(el, [
            { label: "meganuclease", value: "meganuclease" },
            { label: "zinc-finger nuclease", value: "zfn" },
            { label: "TALEN", value: "talen" },
            { label: "CRISPR–Cas9", value: "crispr" },
            { label: "dCas9 payload", value: "dcas9" },
          ], targetingPlatform, (value) => { targetingPlatform = value; render(); }, "Editing platform")
        );
        parts.rail.replaceChildren(causalRail(el, [
          { key: "address", value: record[0] },
          { key: "payload", value: record[1] },
          { key: "cell response", value: targetingPlatform === "dcas9" ? "no break; recruited effector acts locally" : "repair competes after the break" },
          { key: "scaling change", value: record[3] },
        ]));
        parts.explanation.innerHTML = targetingPlatform === "crispr" || targetingPlatform === "dcas9" ?
          "<strong>CRISPR changed the asymptotics by turning a new target into a sequence parameter.</strong> Base pairing supplies recognition energy; the reusable protein stays fixed. dCas9 makes that address a payload slot for repression, activation, chromatin writing, or imaging." :
          "<strong>This platform still recompiles a protein interface for each address.</strong> It can be specific, but multiplexing scales as repeated protein-engineering campaigns—the constraint CRISPR removed.";
        return;
      }

      const result = genomeEditingModel({
        kind: "guide", mismatchPosition, mismatches, accessible, pam,
      });
      parts.visual.replaceChildren(
        sequenceBoard(el, result),
        statusStrip(el, [
          { label: "PAM gate", value: result.pam ? "NGG present" : "absent", tone: result.pam ? "signal" : "warning" },
          { label: "mismatch location", value: mismatches ? "position " + mismatchPosition + (result.seed ? " · seed" : " · distal") : "perfect match" },
          { label: "chromatin", value: accessible ? "accessible" : "closed", tone: accessible ? "active" : "warning" },
          { label: "relative cleavage fixture", value: percent(result.relativeCleavage, 1), tone: result.relativeCleavage > 0.5 ? "signal" : "warning" },
        ], "Ordered Cas9 recognition fixture"),
        blindSpot(el,
          "guide-compatible, PAM-gated address recognition",
          "the final edited sequence",
          "Cas9 aims and cuts. Repair machinery, not the guide, writes the nuclease-editing outcome."
        )
      );
      parts.controls.replaceChildren(
        subTabs,
        rangeControl(el, "Mismatch position from PAM-distal end", mismatchPosition, {
          min: 1, max: 20, step: 1, format: (value) => value.toFixed(0),
        }, (value) => { mismatchPosition = value; render(); }),
        rangeControl(el, "Mismatch count in fixture", mismatches, {
          min: 0, max: 4, step: 1, format: (value) => value.toFixed(0),
        }, (value) => { mismatches = value; render(); }),
        choiceRow(el, [
          { label: "NGG present", value: true }, { label: "PAM absent", value: false },
        ], pam, (value) => { pam = value; render(); }, "PAM state"),
        choiceRow(el, [
          { label: "open chromatin", value: true }, { label: "closed chromatin", value: false },
        ], accessible, (value) => { accessible = value; render(); }, "Chromatin accessibility")
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "scan", value: "Cas9 interrogates PAMs first" },
        { key: "zipper", value: mismatches ? mismatches + " mismatch(es), " + (result.seed ? "seed-proximal" : "PAM-distal") : "20-base pairing" },
        { key: "licensed state", value: result.relativeCleavage ? "R-loop can activate HNH + RuvC" : "activation gate fails" },
        { key: "operation", value: result.relativeCleavage ? "blunt cut 3 bp upstream of PAM" : "no cut in this fixture" },
      ]));
      parts.explanation.innerHTML = !pam ?
        "<strong>No PAM, no interrogation.</strong> The PAM protects the bacterium’s own spacer archive because the matching CRISPR locus lacks the adjacent motif. For an engineer it is an addressability constraint." :
        (result.seed && mismatches ?
          "<strong>A PAM-proximal seed mismatch aborts zippering early in this qualitative fixture.</strong> Hamming distance alone is therefore the wrong risk model: position, bulges, chromatin, and exposure all matter." :
          "<strong>Recognition is ordered from PAM to seed to full R-loop.</strong> The relative-cleavage number is explicitly a teaching fixture for direction, not a calibrated guide-scoring model. Real guide activity must be measured in the target cell and delivery format.");
    }

    function renderRepair() {
      const result = genomeEditingModel({ kind: "repair", phase, donor });
      parts.visual.replaceChildren(
        repairBoard(el, result),
        statusStrip(el, [
          { label: "cell state", value: result.label, tone: "active" },
          { label: "indel route", value: percent(result.nhej, 1), tone: "signal" },
          { label: "template-defined route", value: percent(result.hdr, 2), tone: result.hdr < 0.05 ? "warning" : "signal" },
          { label: "frameshift allele fixture", value: percent(result.frameshift, 1) },
        ], "Illustrative pathway-competition outcome")
      );
      parts.controls.replaceChildren(
        choiceRow(el, [
          { label: "G1 / quiescent", value: "g1" },
          { label: "S/G2", value: "sg2" },
          { label: "post-mitotic neuron", value: "neuron" },
        ], phase, (value) => { phase = value; render(); }, "Cell-cycle context"),
        choiceRow(el, [
          { label: "donor template supplied", value: true },
          { label: "no donor", value: false },
        ], donor, (value) => { donor = value; render(); }, "Repair template")
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "payload", value: "double-strand break" },
        { key: "available biology", value: result.label + (donor ? " + donor" : " · no donor") },
        { key: "dominant route", value: result.nhej >= result.hdr ? "end joining" : "homology-directed copying" },
        { key: "likely product", value: result.hdr > 0.1 ? "some template-defined edits amid indels" : "indels dominate" },
      ]));
      parts.explanation.innerHTML = phase === "sg2" && donor ?
        "<strong>S/G2 supplies the homologous-repair machinery and a donor supplies the requested text.</strong> Even here end joining competes strongly, so a precise edit is a selected minority rather than the default output." :
        "<strong>Breaking is easy because indels are absorbing states.</strong> Perfect religation recreates the target and can be cut again; an indel destroys it. HDR needs a template and S/G2, so it collapses in a post-mitotic neuron. The percentages shown are labelled teaching fixtures, not universal efficiencies.";
    }

    function renderEditor() {
      const result = genomeEditingModel({
        kind: "editor", goal: editGoal, dividing, bystanderFree,
      });
      parts.visual.replaceChildren(
        editorBoard(el, result),
        blindSpot(el,
          result.writes,
          result.editor === "base editor" ? "transversions, large edits, and susceptible bystanders" :
            (result.editor === "prime editor" ? "large replacements and guaranteed high efficiency" :
              (result.editor === "Cas9 nuclease" ? "a specified repaired sequence" : "a route independent of cell state")),
          "Choose the payload from the desired sequence outcome and the repair capacity of the target cell."
        )
      );
      parts.controls.replaceChildren(
        choiceRow(el, [
          { label: "knock out a gene", value: "knockout" },
          { label: "install a transition", value: "transition" },
          { label: "install a transversion", value: "transversion" },
          { label: "small insertion", value: "insertion" },
          { label: "large replacement", value: "replacement" },
        ], editGoal, (value) => { editGoal = value; render(); }, "Desired sequence outcome"),
        choiceRow(el, [
          { label: "dividing target cells", value: true },
          { label: "non-dividing target cells", value: false },
        ], dividing, (value) => { dividing = value; render(); }, "Target-cell division"),
        ...(editGoal === "transition" ? [choiceRow(el, [
          { label: "clean edit window", value: true },
          { label: "susceptible bystander in window", value: false },
        ], bystanderFree, (value) => { bystanderFree = value; render(); }, "Base-editor window")] : [])
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "desired change", value: editGoal.replaceAll("-", " ") },
        { key: "cell context", value: dividing ? "dividing" : "non-dividing" },
        { key: "payload", value: result.editor },
        { key: "written outcome", value: result.writes },
      ]));
      parts.explanation.innerHTML = result.editor.startsWith("no ") ?
        "<strong>The desired large rewrite has no efficient general route in this cell state.</strong> Refusing to recommend an editor is part of correct experimental design; a nuclease plus donor does not make HDR available in a non-dividing cell." :
        "<strong>Address and payload are separate choices.</strong> " + result.editor + " fits because it can produce " + result.writes +
        (result.break ? ". It still delegates the final sequence to break repair." : ". It avoids a double-strand break but retains window, efficiency, delivery, and validation constraints.");
    }

    function renderRisk() {
      const candidates = genomeEditingModel({ kind: "offTarget", maxMismatches, genomeGb: 3.1 });
      const guide = genomeEditingModel({ kind: "guide", mismatchPosition, mismatches: Math.min(1, maxMismatches), accessible: true, pam: true });
      parts.visual.replaceChildren(
        offTargetAssayBoard(el, offTargetAssay),
        statusStrip(el, [
          { label: "20-mer set", value: compact(candidates.neighbourhood, 0), tone: "active" },
          { label: "random NGG-site expectation", value: candidates.expectedCandidates.toFixed(2), tone: candidates.expectedCandidates > 10 ? "warning" : "muted" },
          { label: "illustrative one-mismatch position", value: maxMismatches === 0 ? "none in this set" : mismatchPosition + (guide.seed ? " · seed" : " · distal") },
          { label: "relative cleavage fixture", value: percent(guide.relativeCleavage, 1) },
        ], "Candidate enumeration and empirical assay boundary"),
        blindSpot(el,
          offTargetAssay === "amplicon sequencing" ? "small alleles retaining both primer sites" : "one assay-specific set of nominated break sites",
          offTargetAssay === "amplicon sequencing" ? "large deletion, LOH, translocation, chromothripsis" : "a complete gold-standard off-target census",
          "Take the union of orthogonal nominations, validate in the actual cell and delivery format, and report a detection floor."
        )
      );
      parts.controls.replaceChildren(
        rangeControl(el, "Maximum Hamming mismatches enumerated", maxMismatches, {
          min: 0, max: 5, step: 1, format: (value) => value.toFixed(0),
        }, (value) => { maxMismatches = value; render(); }),
        rangeControl(el, "Single-mismatch position", mismatchPosition, {
          min: 1, max: 20, step: 1, format: (value) => value.toFixed(0),
        }, (value) => { mismatchPosition = value; render(); }),
        choiceRow(el, [
          { label: "GUIDE-seq", value: "GUIDE-seq" },
          { label: "CIRCLE/CHANGE-seq", value: "CIRCLE/CHANGE-seq" },
          { label: "DISCOVER-seq", value: "DISCOVER-seq" },
          { label: "amplicon sequencing", value: "amplicon sequencing" },
        ], offTargetAssay, (value) => { offTargetAssay = value; render(); }, "Off-target assay")
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "enumerate", value: "≤" + maxMismatches + " mismatch 20-mers beside NGG" },
        { key: "candidate bound", value: candidates.expectedCandidates.toFixed(2) + " expected in random 3.1 Gb sequence" },
        { key: "measure", value: offTargetAssay },
        { key: "evidence boundary", value: "candidate list + detection floor, never zero risk" },
      ]));
      parts.explanation.innerHTML = "<strong>The combinatorial result is a candidate burden, not a cut count.</strong> Genome sequence is non-random, mismatches are position-dependent, bulges escape fixed-length searches, chromatin filters access, and exposure integrates opportunity. Assays disagree because they measure different physical objects.";
    }

    function renderLimits() {
      const subTabs = choiceRow(el, [
        { label: "delivery", value: "delivery" },
        { label: "pooled CRISPR screen", value: "screen" },
        { label: "gene drive", value: "drive" },
        { label: "clinical + governance boundary", value: "boundary" },
      ], limitsView, (value) => { limitsView = value; render(); }, "Translation boundary");

      if (limitsView === "delivery") {
        const result = genomeEditingModel({ kind: "delivery", route: deliveryRoute });
        const cargo = result.cargoLabel || (Number.isFinite(result.cargoKb) ? result.cargoKb.toFixed(1) + " kb" : "no viral-genome packaging ceiling");
        parts.visual.replaceChildren(
          processBoard(el, [
            { label: "delivery package", value: deliveryRoute.toUpperCase(), tone: "active" },
            { label: "cargo envelope", value: cargo },
            { label: "editor exposure", value: result.exposure, tone: result.exposure.includes("years") ? "warning" : "signal" },
            { label: "reachable setting", value: result.setting },
          ], "Delivery-route constraint chain"),
          blindSpot(el,
            "editor exposure in a reachable tissue",
            "uniform delivery to every desired cell",
            result.constraint
          )
        );
        parts.controls.replaceChildren(
          subTabs,
          choiceRow(el, [
            { label: "RNP electroporation", value: "rnp" },
            { label: "LNP mRNA", value: "lnp" },
            { label: "AAV", value: "aav" },
          ], deliveryRoute, (value) => { deliveryRoute = value; render(); }, "Delivery route")
        );
        parts.rail.replaceChildren(causalRail(el, [
          { key: "cargo", value: cargo },
          { key: "tropism / setting", value: result.setting },
          { key: "exposure", value: result.exposure },
          { key: "dominant constraint", value: result.constraint },
        ]));
        parts.explanation.innerHTML = "<strong>Delivery, dose, duration, and tissue—not targeting chemistry—set the translational bottleneck.</strong> " +
          result.specificity + ". Ex vivo editing adds a quality-control checkpoint before reinfusion; in vivo delivery reaches otherwise inaccessible cells but removes that checkpoint.";
        return;
      }

      if (limitsView === "screen") {
        const result = genomeEditingModel({
          kind: "screen", copyNumber: screenCopyNumber,
          indelRate: screenIndelRate, frameshiftFraction: screenFrameshift,
        });
        parts.visual.replaceChildren(
          barBoard(el, [
            { label: "reads carrying any indel", value: result.indelRate, display: percent(result.indelRate, 1), tone: "active" },
            { label: "frameshift-allele frequency", value: result.frameshiftAllele, display: percent(result.frameshiftAllele, 1), tone: "signal" },
            { label: "independent biallelic frameshift cells", value: result.independentBiallelic, display: percent(result.independentBiallelic, 1), tone: "warning" },
            { label: "schematic cutting-only dropout", value: result.cuttingDropout, display: percent(result.cuttingDropout, 1), tone: screenCopyNumber > 4 ? "warning" : "muted" },
          ], "Editing rate, functional knockout, and copy-number cutting burden", 1),
          processBoard(el, [
            { label: "observed data", value: "guide × sample integer-count matrix", tone: "active" },
            { label: "sampling model", value: "negative binomial with shared dispersion" },
            { label: "gene evidence", value: "several concordant guides; rank aggregation or mixed model", tone: "signal" },
            { label: "required controls", value: "non-targeting plus cut-number-matched guides", tone: "warning" },
          ], "Pooled-screen count model and gene-level inference"),
          blindSpot(el,
            "guide abundance after selection",
            "gene function when amplified targets cause toxic numbers of breaks",
            "Use copy-number-aware models or CRISPRi, and aggregate several guides after preserving cells per guide."
          )
        );
        parts.controls.replaceChildren(
          subTabs,
          rangeControl(el, "Target copy number", screenCopyNumber, {
            min: 1, max: 30, step: 1, format: (value) => value.toFixed(0),
          }, (value) => { screenCopyNumber = value; render(); }),
          rangeControl(el, "Any-indel read fraction", screenIndelRate, {
            min: 0, max: 1, step: 0.01, format: (value) => percent(value, 0),
          }, (value) => { screenIndelRate = value; render(); }),
          rangeControl(el, "Indels that frameshift", screenFrameshift, {
            min: 0, max: 1, step: 0.01, format: (value) => percent(value, 0),
          }, (value) => { screenFrameshift = value; render(); })
        );
        parts.rail.replaceChildren(causalRail(el, [
          { key: "guide delivery", value: "low MOI, several guides per gene" },
          { key: "molecular editing", value: percent(result.indelRate, 0) + " any indel · " + percent(result.frameshiftAllele, 0) + " frameshift" },
          { key: "cell phenotype", value: percent(result.independentBiallelic, 1) + " independent biallelic fixture" },
          { key: "confound", value: screenCopyNumber + " target copies → cut burden " + result.cutBurden.toFixed(1) },
        ]));
        parts.explanation.innerHTML = screenCopyNumber > 4 ?
          "<strong>A whole amplified region can masquerade as essential.</strong> Every guide makes multiple toxic breaks, so neighbouring genes drop out without functional coherence. CRISPRi removes the DSB-count term; copy-number-aware normalization models it." :
          "<strong>‘62% editing’ is not ‘62% knockout cells.’</strong> Frameshifts are only a fraction of indels, alleles within a cell are correlated, and in-frame changes can spare functional domains. Target early constitutive exons and verify protein-level loss.";
        return;
      }

      if (limitsView === "drive") {
        const result = genomeEditingModel({
          kind: "drive", driveFrequency, homing, resistance,
        });
        parts.visual.replaceChildren(
          driveBoard(el, result),
          blindSpot(el,
            "one-generation allele accounting under random mating",
            "ecological spread, geography, species transfer, or community acceptability",
            "The model exposes the HDR/NHEJ trade-off; it is not a release forecast."
          )
        );
        parts.controls.replaceChildren(
          subTabs,
          rangeControl(el, "Current drive-allele frequency", driveFrequency, {
            min: 0.01, max: 0.9, step: 0.01, format: (value) => percent(value, 0),
          }, (value) => { driveFrequency = value; render(); }),
          rangeControl(el, "Homing probability", homing, {
            min: 0, max: 0.98, step: 0.01, format: (value) => percent(value, 0),
          }, (value) => {
            homing = value;
            resistance = Math.min(resistance, 1 - homing);
            render();
          }),
          rangeControl(el, "Resistance-producing repair", resistance, {
            min: 0, max: Math.max(0, 1 - homing), step: 0.01, format: (value) => percent(value, 0),
          }, (value) => { resistance = value; render(); })
        );
        parts.rail.replaceChildren(causalRail(el, [
          { key: "heterozygote", value: "drive cuts wild chromosome" },
          { key: "HDR", value: percent(homing, 0) + " copies drive" },
          { key: "end joining", value: percent(resistance, 0) + " creates resistant target" },
          { key: "next-generation drive", value: percent(result.driveNext, 1) },
        ]));
        parts.explanation.innerHTML = "<strong>The same repair competition that limits precise therapy creates evolutionary resistance.</strong> Homing raises transmission above 50%; end joining destroys the target and manufactures an allele selected to escape future conversion. Multiplexing changes that probability, not the governance problem.";
        return;
      }

      parts.visual.replaceChildren(
        processBoard(el, [
          { label: "somatic intervention", value: "affects the treated person; established clinical route", tone: "signal" },
          { label: "heritable intervention", value: "embryo or gamete; descendants inherit the change", tone: "warning" },
          { label: "technical asymmetry", value: "same reagents, radically different verification and reversibility" },
          { label: "chapter status", value: "August 2026 governance snapshot; heritable clinical use remains unacceptable", tone: "active" },
        ], "Clinical and governance evidence boundary"),
        blindSpot(el,
          "technical feasibility and documented somatic outcomes",
          "consent of descendants, reversible withdrawal, equitable access, or ecological recall",
          "These are stakeholder and governance questions. The lab does not assign them a fake scalar optimum."
        )
      );
      parts.controls.replaceChildren(subTabs);
      parts.rail.replaceChildren(causalRail(el, [
        { key: "target cell", value: "somatic versus embryo / gamete" },
        { key: "inheritance", value: "ends with patient versus enters descendants" },
        { key: "verification", value: "inspectable ex vivo product versus mosaic embryo inference" },
        { key: "decision authority", value: "patient + regulator versus affected future people and communities" },
      ]));
      parts.explanation.innerHTML = "<strong>Technical possibility does not collapse the decision into efficiency.</strong> Somatic editing can be consented to and followed in one patient. Heritable editing adds mosaic verification, irreversibility, descendants who cannot consent, and known trade-offs of altering pleiotropic genes; gene drives add transboundary ecological exposure.";
    }

    function render() {
      parts.tabHost.replaceChildren(modeTabs());
      if (mode === "target") renderTarget();
      else if (mode === "repair") renderRepair();
      else if (mode === "editor") renderEditor();
      else if (mode === "risk") renderRisk();
      else renderLimits();
    }

    predict(body, {
      widget: "genome-editor-lab",
      question: "You must correct one pathogenic transition in adult neurons. Why is Cas9 nuclease plus an HDR donor a poor default?",
      hint: "Which repair route needs S/G2 and a sister chromatid?",
      options: [
        { label: "Neurons divide too quickly for Cas9" },
        { label: "HDR is effectively unavailable; use a suitable base editor", correct: true },
        { label: "NHEJ copies the donor more accurately" },
        { label: "The PAM makes all point edits impossible" },
      ],
    }, () => {
      mode = "repair";
      phase = "neuron";
      donor = true;
      editGoal = "transition";
      dividing = false;
      parts.instrument.hidden = false;
      render();
    });
    finishLab(parts, body);
  });

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
