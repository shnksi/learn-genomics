/* ── SCA12 specialisation interaction wave ───────────────────────────────
   Objective-mapped Hero Labs for D1–D5. The disease mechanism is unresolved,
   so these views encode provenance and confidence as part of the science:
   patient observation, human tissue, patient-derived cells, overexpression
   systems, analogy, and conjecture never collapse into one undifferentiated
   arrow.
   ───────────────────────────────────────────────────────────────────────── */

(function (global) {
  "use strict";

  const definitions = {};
  const models = {};
  const coverage = {};
  const kit = global.ReaderInteractionKit;
  if (!kit) throw new Error("ReaderInteractionKit must load before SCA12 labs");

  const {
    choiceRow: kitChoiceRow,
    tabs: kitTabs,
    causalRail: kitCausalRail,
    fieldWithRange,
  } = kit;

  function preserveButtonFocus(onChange) {
    return (value) => {
      const active = typeof document !== "undefined" ? document.activeElement : null;
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

  function makeObjectiveMap(prefix, descriptions) {
    const map = {};
    descriptions.forEach((description, index) => {
      map[prefix + "-o" + (index + 1)] = description;
    });
    return map;
  }

  function clamp(value, low, high) {
    return Math.max(low, Math.min(high, value));
  }

  function percent(value, digits) {
    return (100 * value).toFixed(digits == null ? 1 : digits) + "%";
  }

  function compact(value, digits) {
    if (!Number.isFinite(value)) return value === Infinity ? "∞" : "—";
    const absolute = Math.abs(value);
    if (absolute !== 0 && (absolute < 0.001 || absolute >= 100000)) {
      return value.toExponential(digits == null ? 2 : digits);
    }
    return value.toLocaleString("en-US", {
      maximumFractionDigits: digits == null ? 3 : digits,
      minimumFractionDigits: 0,
    });
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

  function labParts(el, extra) {
    return {
      instrument: el("div", { class: "hero-lab human-lab sca12-lab " + (extra || ""), hidden: true }),
      tabHost: el("div"),
      visual: el("div", { class: "lab-visual human-visual sca12-visual" }),
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
      class: "pop-status-strip human-status-strip",
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
      class: "pop-process human-process",
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
      class: "pop-bars human-bars",
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
      class: "methods-claim-shutter human-claim-shutter",
      role: "img",
      "aria-label": "Observed: " + measured + ". Not established: " + excluded + ". " + boundary,
    }, [
      el("div", { class: "methods-claim-half is-open" }, [
        el("span", { text: "observed" }), el("strong", { text: measured }),
      ]),
      el("div", { class: "methods-claim-gate", "aria-hidden": "true", text: "≠" }),
      el("div", { class: "methods-claim-half is-closed" }, [
        el("span", { text: "not established" }), el("strong", { text: excluded }),
      ]),
      el("p", { text: boundary }),
    ]);
  }

  function networkBoard(el, nodes, edges, label) {
    const board = el("div", {
      class: "sca-network",
      role: "img",
      "aria-label": label + ". " + nodes.map((node) => node.label + ": " + node.value).join(". ") +
        ". Connections: " + edges.map((edge) => edge.from + " " + edge.sign + " " + edge.to).join("; "),
    });
    const lane = el("div", { class: "sca-network-lane" });
    nodes.forEach((node, index) => {
      lane.append(el("div", {
        class: "sca-node is-" + (node.tone || "active"),
      }, [
        el("span", { text: node.label }),
        el("strong", { text: node.value }),
      ]));
      if (index < nodes.length - 1) {
        const edge = edges[index] || { sign: "→" };
        lane.append(el("span", {
          class: "sca-edge is-" + (edge.tone || "active"),
          text: edge.sign,
          "aria-hidden": "true",
        }));
      }
    });
    board.append(lane);
    return board;
  }

  function evidenceBoard(el, rows, label) {
    const board = el("div", {
      class: "sca-evidence-board",
      role: "img",
      "aria-label": label + ". " + rows.map((row) =>
        row.claim + ": " + row.level + "; " + row.system
      ).join(". "),
    });
    rows.forEach((row) => board.append(el("div", {
      class: "sca-evidence-row is-" + row.level.toLowerCase(),
    }, [
      el("span", { class: "sca-evidence-level", text: row.level }),
      el("strong", { text: row.claim }),
      el("span", { text: row.system }),
    ])));
    return board;
  }

  function repeatBand(el, count, label) {
    const category = count <= 31 ? "normal" : count >= 51 ? "diagnostic" : "contested";
    const board = el("div", {
      class: "sca-repeat-band",
      role: "img",
      "aria-label": label + ". Selected allele " + count + " CAG repeats, " + category +
        ". Agreed normal range through 31; disputed 32 through 50; conventionally diagnostic from 51 in a compatible phenotype.",
    });
    board.append(el("div", { class: "sca-repeat-track", "aria-hidden": "true" }, [
      el("span", { class: "is-normal", text: "≤31 agreed normal" }),
      el("span", { class: "is-contested", text: "32–50 disputed" }),
      el("span", { class: "is-diagnostic", text: "≥51 diagnostic*" }),
      el("i", { style: "left:" + clamp((count / 80) * 100, 1, 99).toFixed(2) + "%" }),
    ]));
    board.append(el("strong", { text: count + " CAG repeats · " + category }));
    return board;
  }

  function readSpanBoard(el, result, repeatCount) {
    const board = el("div", {
      class: "sca-read-span",
      role: "img",
      "aria-label": "Short-read spanning limit. " + result.readLength + " base read minus " +
        result.anchorBases * 2 + " bases of unique anchors leaves " + result.repeatBases +
        " repeat bases, enough for " + result.maxSpanRepeats + " full trinucleotide repeats. The selected " +
        repeatCount + " repeat allele " + (result.spans ? "can" : "cannot") + " be spanned.",
    });
    board.append(el("div", { class: "sca-read-ruler", "aria-hidden": "true" }, [
      el("span", { class: "is-anchor", text: result.anchorBases + " bp anchor" }),
      el("span", { class: "is-repeat", text: result.maxSpanRepeats + " × CAG max" }),
      el("span", { class: "is-anchor", text: result.anchorBases + " bp anchor" }),
    ]));
    board.append(el("strong", {
      text: repeatCount + " repeats need " + (repeatCount * 3 + result.anchorBases * 2) + " bp · " +
        (result.spans ? "span possible in this idealised read" : "longer than the anchored read"),
    }));
    return board;
  }

  /* Pure models -------------------------------------------------------- */

  function neuronCerebellumModel(input) {
    if (input.kind === "pacemaker") {
      const rateHz = clamp(input.rateHz, 0, 500);
      const hours = clamp(input.hours == null ? 24 : input.hours, 0, 24);
      const spikes = rateHz * hours * 3600;
      return { rateHz, hours, spikes, spikesPerDay: rateHz * 86400 };
    }
    if (input.kind === "geometry") {
      const axonMetres = Math.max(0, input.axonMetres);
      const transportMetresPerDay = Math.max(1e-9, input.transportMetresPerDay);
      return {
        axonMetres, transportMetresPerDay,
        oneWayDays: axonMetres / transportMetresPerDay,
        replacementDays: 2 * axonMetres / transportMetresPerDay,
      };
    }
    if (input.kind === "circuit") {
      const perturbation = input.perturbation || "normal";
      const fixtures = {
        normal: { purkinje: "timed inhibition", nuclei: "calibrated output", sign: "coordinated" },
        purkinjeLoss: { purkinje: "less inhibition", nuclei: "disinhibited / mistimed", sign: "dysmetria + ataxia" },
        climbingNoise: { purkinje: "conflicting error teaching", nuclei: "miscalibrated timing", sign: "learning error" },
        mossyDelay: { purkinje: "late context estimate", nuclei: "late correction", sign: "decomposition + dysmetria" },
      };
      return Object.assign({ perturbation }, fixtures[perturbation]);
    }
    if (input.kind === "internal") {
      const command = input.command;
      const gain = input.gain;
      const delayMs = Math.max(0, input.delayMs);
      const achieved = command * gain;
      return {
        command, gain, delayMs, achieved,
        amplitudeError: achieved - command,
        timingErrorFraction: delayMs / 200,
      };
    }
    if (input.kind === "headroom") {
      const demand = Math.max(0, input.demand);
      const reserve = Math.max(0, input.reserve);
      return { demand, reserve, headroom: reserve - demand, failure: demand > reserve };
    }
    if (input.kind === "tremor") {
      const activation = input.activation || "posture";
      const labels = {
        rest: ["rest tremor", "present in a fully supported, relaxed body part"],
        posture: ["postural action tremor", "emerges while maintaining a position against gravity"],
        kinetic: ["kinetic action tremor", "appears during voluntary movement"],
        intention: ["intention tremor", "worsens as a visually guided target is approached"],
      };
      return { activation, classification: labels[activation][0], definition: labels[activation][1] };
    }
    if (input.kind === "outcome") {
      const fixtures = {
        sara: ["SARA", "ataxia severity across gait, stance, speech and limb coordination", "not a tremor-specific scale"],
        tetras: ["TETRAS", "tremor performance and daily-life impact", "symptom scale, not neuronal survival"],
        mri: ["MRI", "regional atrophy and structural support", "normal imaging does not exclude early SCA12"],
        accelerometry: ["accelerometry", "objective tremor amplitude / frequency under tested positions", "does not replace functional or disease-modifying outcomes"],
      };
      const item = fixtures[input.measure || "sara"];
      return { name: item[0], measures: item[1], caveat: item[2] };
    }
    throw new Error("Unknown neuron/cerebellum model");
  }
  models.neuronCerebellum = neuronCerebellumModel;

  function pp2aModel(input) {
    if (input.kind === "occupancy") {
      const kinase = Math.max(0, input.kinase);
      const phosphatase = Math.max(0, input.phosphatase);
      const phosphataseFold = Math.max(0, input.phosphataseFold == null ? 1 : input.phosphataseFold);
      const baseline = kinase + phosphatase ? kinase / (kinase + phosphatase) : 0;
      const shifted = kinase + phosphatase * phosphataseFold
        ? kinase / (kinase + phosphatase * phosphataseFold) : 0;
      return { kinase, phosphatase, phosphataseFold, baseline, shifted, change: shifted - baseline };
    }
    if (input.kind === "architecture") {
      const serThrKinases = Math.max(0, input.serThrKinases == null ? 428 : input.serThrKinases);
      const serThrCatalytic = Math.max(1, input.serThrCatalytic == null ? 30 : input.serThrCatalytic);
      return { serThrKinases, serThrCatalytic, ratio: serThrKinases / serThrCatalytic };
    }
    if (input.kind === "assembly") {
      const a = Math.max(1, input.a == null ? 2 : input.a);
      const c = Math.max(1, input.c == null ? 2 : input.c);
      const b = Math.max(1, input.b == null ? 15 : input.b);
      return { a, c, b, baseCombinations: a * c * b };
    }
    if (input.kind === "localisation") {
      const isoform = input.isoform || "b1";
      return isoform === "b2"
        ? { isoform, address: "outer mitochondrial membrane", tail: "divergent N-terminal targeting sequence", catalysis: "same PP2A core chemistry" }
        : { isoform, address: "cytosol", tail: "Bβ1 N terminus", catalysis: "same PP2A core chemistry" };
    }
    if (input.kind === "competition") {
      const fraction = clamp(input.fraction, 0, 1);
      const fold = Math.max(0, input.fold);
      const denominator = 1 + (fold - 1) * fraction;
      return {
        fraction, fold, denominator,
        boosted: denominator ? fold / denominator : 0,
        others: denominator ? 1 / denominator : 0,
        displacedFraction: denominator ? 1 - 1 / denominator : 0,
      };
    }
    if (input.kind === "evidence") {
      const scenario = input.scenario || "core";
      const records = {
        core: ["limiting A–C core", "not measured in a human neuron", "quantitative A-subunit interaction proteomics across a Bβ dosage series"],
        dosage: ["expanded repeat changes endogenous Bβ1", "direction differs by model and maturation stage", "isogenic patient-derived neurons with isoform-resolved RNA and protein"],
        b2: ["Bβ2 drives mitochondrial fission when overexpressed", "repeat is not in the Bβ2 first exon", "endogenous Bβ2 and DRP1-pSer637 in SCA12 neurons"],
        tau: ["total PP2A is a major brain tau phosphatase", "B55β-specific tau action and net sign are unmeasured", "phospho-tau panel in SCA12 neurons and tissue"],
      };
      return { scenario, claim: records[scenario][0], gap: records[scenario][1], experiment: records[scenario][2] };
    }
    throw new Error("Unknown PP2A model");
  }
  models.pp2a = pp2aModel;

  function repeatExpansionModel(input) {
    if (input.kind === "taxonomy") {
      const fixtures = {
        htt: ["CAG", "coding exon", "Class I · translated polyglutamine protein"],
        fmr1: ["CGG", "5′ UTR", input.size > 200 ? "Class II · methylation and silencing" : "premutation · RNA toxicity / RAN routes"],
        dmpk: ["CTG", "3′ UTR", "Class III · toxic CUG RNA foci"],
        fxn: ["GAA", "intron 1", "Class II′ · transcriptional blockade"],
        c9: ["GGGGCC", "intron/promoter", "Classes III + IV · RNA foci and RAN products"],
        sca12: ["CAG", "promoter/5′ UTR depending transcript", "Class V · regulatory mis-setting; RNA/RAN hypotheses also live"],
      };
      const item = fixtures[input.locus || "sca12"];
      return { motif: item[0], location: item[1], mechanism: item[2] };
    }
    if (input.kind === "somatic") {
      const repeats = Math.max(0, input.repeats);
      const repairDrive = Math.max(0, input.repairDrive);
      const years = Math.max(0, input.years);
      const threshold = Math.max(0, input.threshold == null ? 35 : input.threshold);
      const relativePressure = Math.max(0, repeats - threshold) * repairDrive;
      return {
        repeats, repairDrive, years, threshold, relativePressure,
        expectedShiftFixture: relativePressure * years / 250,
      };
    }
    if (input.kind === "modifier") {
      const repair = input.repair || "MSH3-high";
      const records = {
        "MSH3-high": ["more MutSβ-associated expansion pressure", "earlier onset direction in repeat-disease modifier logic"],
        "MSH3-low": ["less expansion pressure", "later onset direction"],
        "FAN1-high": ["more repeat protection in HD modifier studies", "later onset direction"],
        "FAN1-low": ["less repeat protection", "earlier onset direction"],
      };
      return { repair, molecular: records[repair][0], onsetDirection: records[repair][1] };
    }
    if (input.kind === "allele") {
      const locus = input.locus || "htt";
      const repeats = Math.max(0, input.repeats);
      if (locus === "htt") {
        return { locus, repeats, category: repeats <= 26 ? "normal" : repeats <= 35 ? "intermediate: carrier unaffected, transmission risk" : repeats <= 39 ? "reduced penetrance" : "full-penetrance convention" };
      }
      if (locus === "fmr1") {
        return { locus, repeats, category: repeats <= 44 ? "normal" : repeats <= 54 ? "grey zone" : repeats <= 200 ? "premutation: FXTAS/FXPOI risk and expansion risk" : "full mutation: silencing / fragile X syndrome" };
      }
      return { locus, repeats, category: repeats <= 31 ? "agreed normal" : repeats >= 51 ? "diagnostic convention in compatible SCA12 phenotype" : "contested range" };
    }
    if (input.kind === "anticipation") {
      const parent = input.parent;
      const child = input.child;
      const onsetSlope = input.onsetSlope;
      return { parent, child, delta: child - parent, onsetShiftFixture: -(child - parent) * onsetSlope };
    }
    if (input.kind === "visibility") {
      const readLength = Math.max(1, Math.round(input.readLength));
      const anchorBases = Math.max(0, Math.round(input.anchorBases));
      const motifLength = Math.max(1, Math.round(input.motifLength || 3));
      const repeatBases = Math.max(0, readLength - 2 * anchorBases);
      return {
        readLength, anchorBases, motifLength, repeatBases,
        maxSpanRepeats: Math.floor(repeatBases / motifLength),
        spans: Math.floor(repeatBases / motifLength) >= input.repeatCount,
      };
    }
    if (input.kind === "pedigree") {
      const parent = input.parent;
      const children = input.children.slice();
      return {
        parent, children,
        deltas: children.map((child) => child - parent),
        transmitted: children.filter((child) => child >= 35).length,
        range: [Math.min(...children), Math.max(...children)],
      };
    }
    throw new Error("Unknown repeat-expansion model");
  }
  models.repeatExpansion = repeatExpansionModel;

  function sca12MechanismModel(input) {
    if (input.kind === "locus") {
      const builds = {
        grch38: ["GRCh38.p14", "chr5:146,878,728–146,878,759", "1-based inclusive course rendering"],
        grch37: ["GRCh37/hg19", "chr5:146,258,291–146,258,322", "1-based inclusive course rendering"],
        t2t: ["T2T-CHM13", "chr5:147,414,734–147,414,765", "1-based inclusive course rendering"],
      };
      const item = builds[input.build || "grch38"];
      return {
        build: item[0], coordinates: item[1], convention: item[2],
        geneStrand: "minus", plusMotif: "CTG / GCT rotation", senseMotif: "CAG / AGC rotation",
        region: "promoter-proximal or 5′ UTR, depending transcript start site",
      };
    }
    if (input.kind === "threshold") {
      const repeats = Math.max(0, Math.round(input.repeats));
      let category = "contested";
      let report = "in a range where pathogenicity has been reported but is not established";
      if (repeats <= 31) {
        category = "agreed normal";
        report = "within the agreed normal range in the sources compared";
      } else if (repeats >= 51) {
        category = "diagnostic convention";
        report = "supports SCA12 in a compatible phenotype; penetrance still depends on length and age";
      }
      return { repeats, category, report };
    }
    if (input.kind === "hypothesis") {
      const records = {
        a: ["A · Bβ1 dosage up", "reporter + transfected-cell support", "direction conflicts with mature patient-neuron RNA and one brain", "isogenic mature neurons: Bβ1 RNA + protein across time"],
        ap: ["A′ · Bβ1 dosage down", "mature patient-neuron RNA; one brain cerebellum", "small samples; protein direction unresolved", "same experiment, with protein and maturation series"],
        b: ["B · Bβ2 → DRP1 fission", "established when Bβ2 is experimentally overexpressed", "repeat is not in Bβ2's first exon; endogenous Bβ2 unmeasured", "endogenous Bβ2 + DRP1-pSer637 in isogenic neurons"],
        c1: ["C1 · sense CAG RNA foci", "patient-derived neural stem cells", "presence is not toxicity; no brain demonstration", "length-series foci plus partner depletion/rescue"],
        c2: ["C2 · antisense CUG RNA", "cell-line foci, apoptosis, antisense RAN result", "transcript 5′ end unresolved; neuronal/tissue evidence thin", "strand-specific knockdown leaving sense RNA intact"],
        c3: ["C3 · RAN translation", "HEK293T constructs + patient-derived neural cells", "frames differ between labs; not shown in human brain", "frame-specific blinded brain immunohistochemistry"],
        d: ["D · altered PP2A → phospho-tau", "analogy to total PP2A tau phosphatase activity", "never measured in SCA12; net sign not predictable", "phospho-tau panel in neurons and available tissue"],
      };
      const item = records[input.hypothesis || "a"];
      return { name: item[0], support: item[1], weakness: item[2], falsifier: item[3] };
    }
    if (input.kind === "cohort") {
      const stage = input.stage || "immature";
      const data = stage === "immature"
        ? { total: 0.77, b1a: 1.13, b1b: 0.55, b2: 0.11, as1: 2.00 }
        : { total: -0.81, b1a: -1.09, b1b: -0.61, b2: -0.15, as1: 1.40 };
      return { stage, data, teachingFixture: true };
    }
    if (input.kind === "arrow") {
      const arrows = {
        mutation: ["expanded CAG → altered promoter/5′-UTR behaviour", "Established", "reporter activity rises with repeat length"],
        expression: ["altered region → Bβ1 amount", "Supported / disputed", "up in reporter/transfected systems; most isoforms down in mature patient neurons"],
        foci: ["expanded transcript → RNA foci", "Supported", "patient-derived neural stem cells"],
        ran: ["expanded transcript → RAN products", "Supported", "constructs and patient-derived neural cells; no human brain"],
        core: ["Bβ1 amount → PP2A core redistribution", "Conjectured", "limiting-core premise unmeasured in neurons"],
        neurons: ["molecular routes → selective neuronal loss", "Conjectured", "no route closes the chain in patient tissue"],
        phenotype: ["neuronal loss → SCA12 clinical pattern", "Associated", "cohorts and autopsy; tremor mechanism remains open"],
      };
      const item = arrows[input.arrow || "mutation"];
      return { arrow: item[0], level: item[1], basis: item[2] };
    }
    throw new Error("Unknown SCA12 mechanism model");
  }
  models.sca12Mechanism = sca12MechanismModel;

  function sca12DossierModel(input) {
    if (input.kind === "founder") {
      const families = Math.max(1, Math.round(input.families));
      const shared = clamp(Math.round(input.shared), 0, families);
      return {
        families, shared,
        sharedFraction: shared / families,
        inference: shared === families ? "common ancestral expanded chromosome" : "mixture or recurrent origins requires resolution",
      };
    }
    if (input.kind === "referral") {
      const tested = Math.max(1, Math.round(input.tested));
      const positive = clamp(Math.round(input.positive), 0, tested);
      return { tested, positive, referralFraction: positive / tested };
    }
    if (input.kind === "diagnostic") {
      const visibility = repeatExpansionModel({
        kind: "visibility", readLength: input.readLength, anchorBases: input.anchorBases,
        motifLength: 3, repeatCount: input.repeatCount,
      });
      const category = sca12MechanismModel({ kind: "threshold", repeats: input.repeatCount });
      return { visibility, category };
    }
    if (input.kind === "risk") {
      const prior = clamp(input.prior == null ? 0.5 : input.prior, 0, 1);
      const manifestedByAge = clamp(input.manifestedByAge, 0, 1);
      const carrierUnaffected = 1 - manifestedByAge;
      const jointCarrier = prior * carrierUnaffected;
      const jointNoncarrier = 1 - prior;
      return {
        prior, manifestedByAge, carrierUnaffected,
        posterior: jointCarrier / (jointCarrier + jointNoncarrier),
      };
    }
    if (input.kind === "therapy") {
      const mechanism = input.mechanism || "up";
      const intervention = input.intervention || "senseKnockdown";
      const records = {
        up: {
          senseKnockdown: ["directionally plausible", "lower excess Bβ1, but normal-function floor and isoform specificity matter"],
          as1Knockdown: ["sign unknown", "removing antisense RNA may also de-repress sense PPP2R2B"],
          stabilise: ["upstream prevention plausible", "slowing further expansion may not reverse established damage"],
        },
        down: {
          senseKnockdown: ["directionally hazardous", "would push an already-low normal protein further down"],
          as1Knockdown: ["potentially helpful if it raises sense output", "must first measure the sign on Bβ1 protein"],
          stabilise: ["upstream prevention plausible", "mechanism-agnostic but delivery and timing remain"],
        },
        rna: {
          senseKnockdown: ["could remove toxic repeat RNA", "also removes normal sense transcript"],
          as1Knockdown: ["plausible only for antisense toxicity", "sense-expression sign and in-tissue target existence remain"],
          stabilise: ["prevents substrate growth", "does not directly clear existing toxic RNA/products"],
        },
      };
      const item = records[mechanism][intervention];
      return { mechanism, intervention, verdict: item[0], caveat: item[1] };
    }
    if (input.kind === "study") {
      const aim = input.aim || "direction";
      const records = {
        direction: ["Is endogenous Bβ1 up or down in mature SCA12 neurons?", "isogenic repeat-edited neurons; time-series isoform RNA + protein", "direction and maturation interaction", "no difference despite adequate power"],
        history: ["What is the annualised clinical progression rate?", "multi-site prospective cohort; annual SARA, TETRAS, gait, cognition", "repeatable slope and variance for trial power", "instrument ceiling or site drift obscures slope"],
        tissue: ["Which cell types and isoforms carry PPP2R2B signal?", "single-nucleus plus 5′/long-read isoform assay and spatial validation", "Purkinje versus cortical cell-type expression", "dropout prevents isoform resolution"],
        ran: ["Do RAN products exist in SCA12 human brain?", "blinded frame-specific staining with interrupted-repeat specificity controls", "repeat-frame signal in affected regions", "non-specific antibody staining"],
      };
      const item = records[aim];
      return { aim, gap: item[0], design: item[1], discriminating: item[2], uninformative: item[3] };
    }
    throw new Error("Unknown SCA12 dossier model");
  }
  models.sca12Dossier = sca12DossierModel;

  /* D1 ---------------------------------------------------------------- */

  define("neuron-cerebellum-systems-lab", makeObjectiveMap("d1", [
    "Explain the maintenance constraints of post-mitotic, metre-scale, continuously active neurons.",
    "Quantify the lifelong energetic and calcium burden of Purkinje-cell intrinsic pacemaking.",
    "Trace mossy, granule, parallel, climbing, Purkinje, and deep-nuclear signals through the cerebellar circuit.",
    "Derive dysmetria, intention tremor, ataxia, and dysarthria from mistimed or mis-scaled correction while leaving SCA12's presenting tremor open.",
    "Compare candidate explanations for selective vulnerability without promoting any to an established cause.",
    "Classify tremor by activation condition using Movement Disorder Society vocabulary.",
    "Match SARA, TETRAS, MRI, and objective motion measures to their domains and caveats.",
  ]), function (api) {
    const { body, el, predict } = api;
    const parts = labParts(el, "neuron-lab");
    let mode = "pacemaker";
    let rateHz = 60;
    let axonLength = 1;
    let transportSpeed = 0.25;
    let circuitPerturbation = "normal";
    let movementGain = 1.15;
    let delayMs = 40;
    let demand = 80;
    let reserve = 100;
    let vulnerabilityFixture = "energy";
    let tremorActivation = "posture";
    let outcomeMeasure = "sara";

    const modes = [
      { label: "Neuron lifetime", value: "lifetime" },
      { label: "Pacemaker load", value: "pacemaker" },
      { label: "Circuit", value: "circuit" },
      { label: "Internal model", value: "internal" },
      { label: "Vulnerability", value: "vulnerability" },
      { label: "Tremor classifier", value: "tremor" },
      { label: "Outcome measures", value: "outcomes" },
    ];

    function renderLifetime() {
      const result = neuronCerebellumModel({ kind: "geometry", axonMetres: axonLength, transportMetresPerDay: transportSpeed });
      parts.visual.replaceChildren(
        networkBoard(el, [
          { label: "nucleus", value: "one post-mitotic cell body", tone: "active" },
          { label: "axon", value: axonLength.toFixed(2) + " m of maintained membrane" },
          { label: "terminal", value: "proteins, vesicles, mitochondria", tone: "signal" },
        ], [{ from: "nucleus", to: "axon", sign: "anterograde →" }, { from: "axon", to: "terminal", sign: "delivery →" }], "Neuron geometry and supply chain"),
        statusStrip(el, [
          { label: "one-way transport", value: result.oneWayDays.toFixed(2) + " days" },
          { label: "round-trip fixture", value: result.replacementDays.toFixed(2) + " days" },
          { label: "cell-cycle escape", value: "none" , tone: "warning" },
          { label: "maintenance horizon", value: "decades" },
        ], "Long-lived neuron maintenance constraints")
      );
      parts.controls.replaceChildren(
        rangeControl(el, "Axon length", axonLength, { min: 0.01, max: 1.2, step: 0.01, format: (v) => v.toFixed(2) + " m" }, (v) => { axonLength = v; render(); }),
        rangeControl(el, "Illustrative transport speed", transportSpeed, { min: 0.05, max: 1, step: 0.05, format: (v) => v.toFixed(2) + " m/day" }, (v) => { transportSpeed = v; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "geometry", value: "distant compartments" },
        { key: "continuous work", value: "ion gradients + trafficking + proteostasis" },
        { key: "no dilution", value: "damage cannot be shed by cell division" },
        { key: "failure", value: "small chronic imbalance accumulates" },
      ]));
      parts.explanation.innerHTML = "<strong>The transport time is an explicit scale fixture, not a universal axonal-transport rate.</strong> The durable lesson is geometric: a neuron must maintain distant membrane and synapses for decades without replacing itself by division, so trafficking, energy, calcium, and proteostasis errors accumulate in one irreplaceable cell.";
    }

    function renderPacemaker() {
      const result = neuronCerebellumModel({ kind: "pacemaker", rateHz, hours: 24 });
      parts.visual.replaceChildren(
        barBoard(el, [
          { label: "spikes per second", value: result.rateHz, display: result.rateHz.toFixed(0) + " Hz", tone: "active" },
          { label: "spikes per minute", value: result.rateHz * 60, display: compact(result.rateHz * 60, 0) },
          { label: "spikes per day", value: result.spikesPerDay, display: compact(result.spikesPerDay, 0), tone: "signal" },
        ], "Intrinsic pacemaker event count", result.spikesPerDay),
        processBoard(el, [
          { label: "intrinsic firing", value: rateHz.toFixed(0) + " action potentials every second", tone: "active" },
          { label: "each cycle", value: "Na⁺/K⁺ and Ca²⁺ flux" },
          { label: "restoration", value: "ATP-dependent pumps + buffering", tone: "signal" },
          { label: "lifetime", value: "billions of cycles before a year passes" },
        ], "Purkinje pacemaker burden")
      );
      parts.controls.replaceChildren(rangeControl(el, "Intrinsic firing rate", rateHz, {
        min: 30, max: 150, step: 1, format: (v) => v.toFixed(0) + " Hz",
      }, (v) => { rateHz = v; render(); }));
      parts.rail.replaceChildren(causalRail(el, [
        { key: "pacemaker", value: rateHz.toFixed(0) + " Hz" },
        { key: "daily cycles", value: compact(result.spikesPerDay, 0) },
        { key: "homeostasis", value: "pump ions, buffer Ca²⁺, replace channels" },
        { key: "headroom", value: "small reserve loss can become chronic failure" },
      ]));
      parts.explanation.innerHTML = "<strong>Purkinje cells fire intrinsically even without synaptic input.</strong> The slider stays within the chapter's 30–150 Hz range and counts events only; it does not pretend every spike has one universal ATP cost. The key is relentless flux and calcium control, not a single energy number.";
    }

    function renderCircuit() {
      const result = neuronCerebellumModel({ kind: "circuit", perturbation: circuitPerturbation });
      parts.visual.replaceChildren(
        networkBoard(el, [
          { label: "mossy fibre", value: "context + command copy", tone: circuitPerturbation === "mossyDelay" ? "warning" : "active" },
          { label: "granule / parallel", value: "expanded basis of context" },
          { label: "Purkinje cell", value: result.purkinje, tone: circuitPerturbation === "purkinjeLoss" ? "warning" : "signal" },
          { label: "deep nucleus", value: result.nuclei, tone: result.sign === "coordinated" ? "signal" : "warning" },
        ], [
          { from: "mossy", to: "granule", sign: "+ →" },
          { from: "parallel", to: "Purkinje", sign: "+ →" },
          { from: "Purkinje", to: "nucleus", sign: "−|", tone: "warning" },
        ], "Cerebellar cortical circuit; Purkinje cells provide the sole cortical output and it is inhibitory"),
        statusStrip(el, [
          { label: "climbing fibre", value: circuitPerturbation === "climbingNoise" ? "noisy error-teaching signal" : "sparse powerful error signal", tone: circuitPerturbation === "climbingNoise" ? "warning" : "active" },
          { label: "Purkinje output sign", value: "inhibitory" },
          { label: "deep-nuclear result", value: result.nuclei },
          { label: "clinical consequence", value: result.sign, tone: result.sign === "coordinated" ? "signal" : "warning" },
        ], "Cerebellar signal signs")
      );
      parts.controls.replaceChildren(choiceRow(el, [
        { label: "intact circuit", value: "normal" },
        { label: "Purkinje loss", value: "purkinjeLoss" },
        { label: "noisy climbing input", value: "climbingNoise" },
        { label: "delayed mossy context", value: "mossyDelay" },
      ], circuitPerturbation, (v) => { circuitPerturbation = v; render(); }, "Circuit perturbation"));
      parts.rail.replaceChildren(causalRail(el, [
        { key: "input", value: circuitPerturbation === "mossyDelay" ? "late context" : "context + error teaching" },
        { key: "cortical computation", value: "parallel-fibre patterns shape Purkinje timing" },
        { key: "sole cortical output", value: "Purkinje inhibition" },
        { key: "motor correction", value: result.sign },
      ]));
      parts.explanation.innerHTML = "<strong>Purkinje cells are inhibitory and are the sole output of cerebellar cortex; deep nuclei also receive excitatory collaterals.</strong> Losing Purkinje timing therefore disinhibits and mistimes downstream output rather than simply turning the whole cerebellum off.";
    }

    function renderInternal() {
      const result = neuronCerebellumModel({ kind: "internal", command: 1, gain: movementGain, delayMs });
      parts.visual.replaceChildren(
        networkBoard(el, [
          { label: "intended command", value: "1.00 target unit", tone: "active" },
          { label: "internal prediction", value: "gain " + movementGain.toFixed(2) + " · delay " + delayMs.toFixed(0) + " ms" },
          { label: "achieved movement", value: result.achieved.toFixed(2) + " units", tone: Math.abs(result.amplitudeError) > 0.1 ? "warning" : "signal" },
          { label: "sensory correction", value: "arrives after movement starts" },
        ], [
          { from: "command", to: "prediction", sign: "copy →" },
          { from: "prediction", to: "movement", sign: "scale →" },
          { from: "movement", to: "correction", sign: "feedback ↺" },
        ], "Forward-model scaling and timing fixture"),
        statusStrip(el, [
          { label: "amplitude error", value: (result.amplitudeError >= 0 ? "+" : "") + result.amplitudeError.toFixed(2), tone: Math.abs(result.amplitudeError) > 0.1 ? "warning" : "signal" },
          { label: "timing delay", value: delayMs.toFixed(0) + " ms" },
          { label: "derived sign", value: result.amplitudeError > 0.05 ? "overshoot / hypermetria" : result.amplitudeError < -0.05 ? "undershoot / hypometria" : "scaled" },
          { label: "rhythmic tremor explained?", value: "not by this alone", tone: "warning" },
        ], "Movement error interpretation")
      );
      parts.controls.replaceChildren(
        rangeControl(el, "Internal gain", movementGain, { min: 0.5, max: 1.5, step: 0.01, format: (v) => v.toFixed(2) }, (v) => { movementGain = v; render(); }),
        rangeControl(el, "Correction delay", delayMs, { min: 0, max: 200, step: 5, format: (v) => v.toFixed(0) + " ms" }, (v) => { delayMs = v; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "mis-scaled correction", value: result.amplitudeError.toFixed(2) + " target units" },
        { key: "limb result", value: result.amplitudeError > 0 ? "overshoot" : "undershoot" },
        { key: "repeated movement", value: "decomposition + ataxia" },
        { key: "SCA12 caveat", value: "presenting postural/action tremor needs an oscillation mechanism still unresolved" },
      ]));
      parts.explanation.innerHTML = "<strong>Mis-scaled and delayed correction naturally yields dysmetria, decomposed movement, gait ataxia, intention tremor, and dysarthria.</strong> It does not automatically generate SCA12's characteristic early action/postural tremor; that last oscillatory step remains conjectural.";
    }

    function renderVulnerability() {
      const candidates = {
        energy: ["pacemaker energy / calcium", "continuous high-frequency ion flux", "measure cell-type ATP and Ca²⁺ reserve under endogenous perturbation"],
        arbor: ["enormous dendritic arbor", "large membrane/proteostasis burden", "normalise vulnerability against surface area and turnover"],
        circuit: ["network position", "sole cortical output creates functional sensitivity", "separate early dysfunction from later cell death"],
        isoform: ["cell-type / isoform exposure", "toxic species may be expressed only in vulnerable cells", "single-nucleus + isoform-resolved spatial assay"],
      };
      const f = candidates[vulnerabilityFixture];
      const result = neuronCerebellumModel({ kind: "headroom", demand, reserve });
      parts.visual.replaceChildren(
        barBoard(el, [
          { label: "illustrative chronic demand", value: result.demand, display: result.demand.toFixed(0), tone: "active" },
          { label: "illustrative reserve", value: result.reserve, display: result.reserve.toFixed(0), tone: result.failure ? "warning" : "signal" },
          { label: "headroom", value: Math.abs(result.headroom), display: (result.headroom >= 0 ? "+" : "−") + Math.abs(result.headroom).toFixed(0), tone: result.failure ? "warning" : "signal" },
        ], "Relative demand-and-reserve teaching fixture", Math.max(result.demand, result.reserve)),
        processBoard(el, [
          { label: "candidate", value: f[0], tone: "active" },
          { label: "why plausible", value: f[1] },
          { label: "discriminating test", value: f[2], tone: "signal" },
          { label: "status in SCA12", value: "candidate; none established", tone: "warning" },
        ], "Selective-vulnerability hypothesis audit")
      );
      parts.controls.replaceChildren(
        choiceRow(el, [
          { label: "energy / calcium", value: "energy" }, { label: "arbor burden", value: "arbor" },
          { label: "circuit position", value: "circuit" }, { label: "isoform exposure", value: "isoform" },
        ], vulnerabilityFixture, (v) => { vulnerabilityFixture = v; render(); }, "Vulnerability candidate"),
        rangeControl(el, "Relative chronic demand", demand, { min: 20, max: 140, step: 1, format: (v) => v.toFixed(0) }, (v) => { demand = v; render(); }),
        rangeControl(el, "Relative homeostatic reserve", reserve, { min: 20, max: 140, step: 1, format: (v) => v.toFixed(0) }, (v) => { reserve = v; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "baseline", value: "cell types start with different demand and reserve" },
        { key: "shared insult", value: "same molecular perturbation" },
        { key: "headroom", value: result.headroom.toFixed(0) + " relative units" },
        { key: "claim boundary", value: "fixture explains a possibility, not why SCA12 selects these cells" },
      ]));
      parts.explanation.innerHTML = "<strong>The demand/reserve numbers are explicitly uncalibrated; they expose the headroom concept only.</strong> Pacemaking, arbor size, circuit position, calcium handling, proteostasis, and isoform expression are compatible candidates. None currently closes the selective-vulnerability chain in SCA12.";
    }

    function renderTremor() {
      const result = neuronCerebellumModel({ kind: "tremor", activation: tremorActivation });
      parts.visual.replaceChildren(
        processBoard(el, [
          { label: "activation condition", value: tremorActivation, tone: "active" },
          { label: "formal label", value: result.classification, tone: "signal" },
          { label: "definition", value: result.definition },
          { label: "SCA12 use", value: tremorActivation === "posture" ? "common presenting action tremor pattern" : "part of the examination, not the defining early pattern" },
        ], "Tremor classification by when it appears"),
        claimBoundary(el, "phenomenology: when the oscillation appears", "the molecular generator of that oscillation", "A clinical label is reproducible description. It does not identify which feedback loop is unstable.")
      );
      parts.controls.replaceChildren(choiceRow(el, [
        { label: "fully at rest", value: "rest" },
        { label: "holding posture", value: "posture" },
        { label: "moving", value: "kinetic" },
        { label: "approaching target", value: "intention" },
      ], tremorActivation, (v) => { tremorActivation = v; render(); }, "Tremor activation condition"));
      parts.rail.replaceChildren(causalRail(el, [
        { key: "observe", value: "when tremor emerges" },
        { key: "classify", value: result.classification },
        { key: "measure", value: "amplitude, frequency, task, body part" },
        { key: "do not infer", value: "pathway or disease from label alone" },
      ]));
      parts.explanation.innerHTML = "<strong>‘Action tremor’ is an umbrella: postural, kinetic, and intention tremors are classified by activation condition.</strong> SCA12 is notable for early action/postural hand tremor, often before clear gait ataxia; classification sharpens the phenotype without solving its generator.";
    }

    function renderOutcomes() {
      const result = neuronCerebellumModel({ kind: "outcome", measure: outcomeMeasure });
      parts.visual.replaceChildren(
        processBoard(el, [
          { label: "instrument", value: result.name, tone: "active" },
          { label: "domain", value: result.measures, tone: "signal" },
          { label: "blind spot", value: result.caveat, tone: "warning" },
          { label: "best use", value: outcomeMeasure === "mri" ? "support pattern / longitudinal structure" : "repeatable clinical or quantitative change" },
        ], "Outcome-measure domain and boundary"),
        claimBoundary(el, result.measures, result.caveat, "Use convergent outcomes rather than asking one scale to stand in for disease mechanism, daily function, and neurodegeneration at once.")
      );
      parts.controls.replaceChildren(choiceRow(el, [
        { label: "SARA", value: "sara" }, { label: "TETRAS", value: "tetras" },
        { label: "MRI", value: "mri" }, { label: "accelerometry", value: "accelerometry" },
      ], outcomeMeasure, (v) => { outcomeMeasure = v; render(); }, "Outcome measure"));
      parts.rail.replaceChildren(causalRail(el, [
        { key: "question", value: result.measures },
        { key: "instrument", value: result.name },
        { key: "repeat", value: "track change with known reliability" },
        { key: "caveat", value: result.caveat },
      ]));
      parts.explanation.innerHTML = "<strong>Choose the instrument from the outcome, not from disease familiarity.</strong> SARA measures ataxia, TETRAS measures tremor, accelerometry objectifies motion in specified tasks, and MRI supports regional structure. A normal MRI is not an SCA12 rule-out.";
    }

    function render() {
      parts.tabHost.replaceChildren(tabs(el, modes, mode, (v) => { mode = v; render(); }));
      if (mode === "lifetime") renderLifetime();
      else if (mode === "pacemaker") renderPacemaker();
      else if (mode === "circuit") renderCircuit();
      else if (mode === "internal") renderInternal();
      else if (mode === "vulnerability") renderVulnerability();
      else if (mode === "tremor") renderTremor();
      else renderOutcomes();
    }

    predict(body, {
      widget: "neuron-cerebellum-systems-lab",
      question: "Purkinje cells are the sole output of cerebellar cortex. Is that output excitatory or inhibitory?",
      hint: "The deep nuclei receive other excitatory collaterals, but cerebellar cortex speaks through one cell type.",
      options: [
        { label: "Excitatory" }, { label: "Inhibitory", correct: true },
        { label: "Hormonal" }, { label: "It changes sign with movement" },
      ],
    }, () => { mode = "circuit"; parts.instrument.hidden = false; render(); });
    finishLab(parts, body);
  });

  /* D2 ---------------------------------------------------------------- */

  define("pp2a-flux-assembly-lab", makeObjectiveMap("d2", [
    "Derive phosphosite occupancy from competing kinase and phosphatase fluxes.",
    "Explain why phosphatase specificity is distributed into regulatory subunits rather than catalytic-subunit count.",
    "Assemble PP2A A, C, and B subunits into functionally distinct heterotrimers.",
    "Distinguish Bβ1 and Bβ2 by localisation while preserving their shared catalytic chemistry.",
    "Calculate limiting-core competition after changing one B-subunit abundance and state the assumption.",
    "Separate established, inferred, and unknown PPP2R2B dosage claims and design a discriminating experiment.",
  ]), function (api) {
    const { body, el, predict } = api;
    const parts = labParts(el, "pp2a-lab");
    let mode = "flux";
    let kinase = 1;
    let phosphatase = 1;
    let phosphataseFold = 1.9;
    let isoform = "b1";
    let bFraction = 0.05;
    let bFold = 2;
    let evidenceScenario = "core";

    const modes = [
      { label: "Flux balance", value: "flux" },
      { label: "Specificity", value: "specificity" },
      { label: "Heterotrimer", value: "assembly" },
      { label: "Isoform address", value: "localisation" },
      { label: "Core competition", value: "competition" },
      { label: "Evidence audit", value: "evidence" },
    ];

    function renderFlux() {
      const result = pp2aModel({ kind: "occupancy", kinase, phosphatase, phosphataseFold });
      parts.visual.replaceChildren(
        networkBoard(el, [
          { label: "unphosphorylated site", value: percent(1 - result.shifted, 1) },
          { label: "kinase write flux", value: kinase.toFixed(2), tone: "active" },
          { label: "phosphorylated site", value: percent(result.shifted, 1), tone: "signal" },
          { label: "phosphatase erase flux", value: (phosphatase * phosphataseFold).toFixed(2), tone: "warning" },
        ], [
          { from: "unphosphorylated", to: "phosphorylated", sign: "+P →" },
          { from: "kinase", to: "site", sign: "balance ↔" },
          { from: "site", to: "phosphatase", sign: "−P →" },
        ], "Steady-state phosphosite occupancy is set by opposing fluxes"),
        statusStrip(el, [
          { label: "baseline occupancy", value: percent(result.baseline, 1) },
          { label: "phosphatase fold", value: result.phosphataseFold.toFixed(2) + "×" },
          { label: "new occupancy", value: percent(result.shifted, 1), tone: "signal" },
          { label: "absolute shift", value: (100 * result.change).toFixed(1) + " percentage points", tone: result.change < 0 ? "active" : "warning" },
        ], "First-order one-site flux model")
      );
      parts.controls.replaceChildren(
        rangeControl(el, "Kinase rate", kinase, { min: 0.05, max: 5, step: 0.05, format: (v) => v.toFixed(2) }, (v) => { kinase = v; render(); }),
        rangeControl(el, "Baseline phosphatase rate", phosphatase, { min: 0.05, max: 5, step: 0.05, format: (v) => v.toFixed(2) }, (v) => { phosphatase = v; render(); }),
        rangeControl(el, "Relevant phosphatase fold", phosphataseFold, { min: 0.2, max: 3, step: 0.05, format: (v) => v.toFixed(2) + "×" }, (v) => { phosphataseFold = v; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "write", value: "kK = " + kinase.toFixed(2) },
        { key: "erase", value: "kP = " + (phosphatase * phosphataseFold).toFixed(2) },
        { key: "steady state", value: "φ = kK/(kK+kP)" },
        { key: "occupancy", value: percent(result.shifted, 1) },
      ]));
      parts.explanation.innerHTML = "<strong>No enzyme owns a phosphosite: occupancy is the ratio of opposing fluxes.</strong> This one-kinase/one-phosphatase, first-order model preserves the direction and baseline dependence. Saturation, parallel enzymes, indirect paths, and substrate targeting can change the magnitude or even the net biological sign.";
    }

    function renderSpecificity() {
      const result = pp2aModel({ kind: "architecture" });
      parts.visual.replaceChildren(
        barBoard(el, [
          { label: "human Ser/Thr kinases", value: result.serThrKinases, display: compact(result.serThrKinases, 0), tone: "active" },
          { label: "Ser/Thr phosphatase catalytic subunits", value: result.serThrCatalytic, display: "~" + result.serThrCatalytic, tone: "warning" },
        ], "Catalytic-subunit count asymmetry", result.serThrKinases),
        processBoard(el, [
          { label: "kinase specificity", value: "many dedicated catalytic domains" },
          { label: "phosphatase core", value: "few shared catalytic subunits" },
          { label: "targeting layer", value: "regulatory subunits + localisation + docking", tone: "signal" },
          { label: "functional enzyme", value: "core chemistry at a specific address" },
        ], "Combinatorial phosphatase specificity")
      );
      parts.controls.replaceChildren();
      parts.rail.replaceChildren(causalRail(el, [
        { key: "count asymmetry", value: result.ratio.toFixed(1) + "× more Ser/Thr kinase catalytic genes" },
        { key: "constraint", value: "few phosphatase cores cannot encode all substrate identity" },
        { key: "solution", value: "regulatory subunits assemble specificity" },
        { key: "consequence", value: "‘PP2A activity’ is not one biological operation" },
      ]));
      parts.explanation.innerHTML = "<strong>The approximate counts motivate architecture, not a one-to-one census.</strong> PP2A specificity comes from which B subunit assembles, where the holoenzyme localises, which substrates dock, and when assembly is permitted. Catalytic-site inhibition erases that information.";
    }

    function renderAssembly() {
      const result = pp2aModel({ kind: "assembly", a: 2, c: 2, b: 15 });
      parts.visual.replaceChildren(
        networkBoard(el, [
          { label: "A scaffold", value: result.a + " genes", tone: "active" },
          { label: "C catalytic", value: result.c + " genes" },
          { label: "B regulatory", value: result.b + " genes + splice variants", tone: "signal" },
          { label: "holoenzyme", value: "substrate + address + catalytic core" },
        ], [
          { from: "A", to: "C", sign: "+" },
          { from: "C", to: "B", sign: "+" },
          { from: "B", to: "holoenzyme", sign: "→" },
        ], "PP2A heterotrimer assembly"),
        statusStrip(el, [
          { label: "base gene combinations", value: result.baseCombinations, tone: "active" },
          { label: "B families", value: "B55, B56, B72, striatin" },
          { label: "functional diversity", value: "higher after isoforms / state" },
          { label: "shared chemistry", value: "C subunit alone does not name substrate" },
        ], "PP2A combinatorial repertoire")
      );
      parts.controls.replaceChildren();
      parts.rail.replaceChildren(causalRail(el, [
        { key: "scaffold", value: "A holds the complex" },
        { key: "catalysis", value: "C removes phosphate" },
        { key: "specificity", value: "B selects location and substrate" },
        { key: "unit of function", value: "assembled heterotrimer" },
      ]));
      parts.explanation.innerHTML = "<strong>‘PP2A’ names a family of holoenzymes, not one interchangeable activity.</strong> The 2×2×15 = 60 figure is a base gene-level product; splice variants, expression, modification, localisation, and assembly state expand or restrict the realised repertoire.";
    }

    function renderLocalisation() {
      const result = pp2aModel({ kind: "localisation", isoform });
      parts.visual.replaceChildren(
        networkBoard(el, [
          { label: "PPP2R2B transcript", value: isoform === "b2" ? "alternative first exon" : "repeat-containing Bβ1 first exon", tone: "active" },
          { label: "N-terminal tail", value: result.tail },
          { label: "address", value: result.address, tone: "signal" },
          { label: "encountered substrates", value: "defined by compartment" },
        ], [
          { from: "transcript", to: "tail", sign: "splice →" },
          { from: "tail", to: "address", sign: "target →" },
          { from: "address", to: "substrate", sign: "meet →" },
        ], "Alternative first exons route the same catalytic machinery to different addresses"),
        statusStrip(el, [
          { label: "isoform", value: isoform === "b2" ? "Bβ2" : "Bβ1" },
          { label: "localisation", value: result.address, tone: "signal" },
          { label: "core chemistry", value: result.catalysis },
          { label: "repeat in its 5′ region?", value: isoform === "b1" ? "yes" : "no", tone: isoform === "b2" ? "warning" : "active" },
        ], "Same enzyme, different address")
      );
      parts.controls.replaceChildren(choiceRow(el, [
        { label: "Bβ1", value: "b1" }, { label: "Bβ2", value: "b2" },
      ], isoform, (v) => { isoform = v; render(); }, "PPP2R2B isoform"));
      parts.rail.replaceChildren(causalRail(el, [
        { key: "alternative first exon", value: isoform === "b2" ? "Bβ2-specific targeting tail" : "Bβ1 repeat-containing exon" },
        { key: "localisation", value: result.address },
        { key: "substrate access", value: "different molecular neighbourhood" },
        { key: "SCA12 boundary", value: isoform === "b2" ? "disease repeat does not sit in this transcript's first exon" : "directly repeat-linked transcript" },
      ]));
      parts.explanation.innerHTML = isoform === "b2"
        ? "<strong>Bβ2 can drive mitochondrial fission and apoptosis when experimentally overexpressed, but the SCA12 repeat is not in Bβ2's first exon.</strong> A disease mechanism through Bβ2 therefore needs an unmeasured trans route from the repeat to endogenous Bβ2 abundance."
        : "<strong>Bβ1 is the predominant cytosolic isoform and its first exon contains the repeat region.</strong> This structural link makes Bβ1 the direct dosage candidate, while its direction in mature patient neurons remains contested.";
    }

    function renderCompetition() {
      const result = pp2aModel({ kind: "competition", fraction: bFraction, fold: bFold });
      parts.visual.replaceChildren(
        barBoard(el, [
          { label: "boosted B-subunit abundance", value: bFold, display: bFold.toFixed(2) + "×", tone: "active" },
          { label: "its holoenzyme", value: result.boosted, display: result.boosted.toFixed(3) + "×", tone: "signal" },
          { label: "every competing holoenzyme", value: result.others, display: result.others.toFixed(3) + "×", tone: "warning" },
        ], "Limiting-core redistribution", Math.max(bFold, result.boosted, result.others)),
        statusStrip(el, [
          { label: "starting pool share", value: percent(result.fraction, 1) },
          { label: "abundance change", value: result.fold.toFixed(2) + "×" },
          { label: "boosted complex", value: (100 * (result.boosted - 1)).toFixed(1) + "%" },
          { label: "others displaced", value: (100 * result.displacedFraction).toFixed(1) + "%", tone: "warning" },
        ], "Shared-core mass-action fixture")
      );
      parts.controls.replaceChildren(
        rangeControl(el, "Initial share of B-subunit pool", bFraction, { min: 0.01, max: 0.5, step: 0.01, format: (v) => percent(v, 0) }, (v) => { bFraction = v; render(); }),
        rangeControl(el, "B-subunit abundance fold", bFold, { min: 0.2, max: 3, step: 0.05, format: (v) => v.toFixed(2) + "×" }, (v) => { bFold = v; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "premise", value: "A–C cores saturated and limiting" },
        { key: "mass action", value: "one B species changes from " + percent(bFraction, 0) + " by " + bFold.toFixed(2) + "×" },
        { key: "gain arm", value: result.boosted.toFixed(3) + "× its holoenzyme" },
        { key: "loss arm", value: result.others.toFixed(3) + "× all competitors" },
      ]));
      parts.explanation.innerHTML = "<strong>Under a limiting shared core, dosage is a redistribution rather than a private dial.</strong> The formula is exact for this mass-action fixture. Whether the premise holds in a human neuron is unknown; quantitative A-subunit interactomics across a dosage series would decide it.";
    }

    function renderEvidence() {
      const result = pp2aModel({ kind: "evidence", scenario: evidenceScenario });
      parts.visual.replaceChildren(
        processBoard(el, [
          { label: "claim", value: result.claim, tone: "active" },
          { label: "current gap", value: result.gap, tone: "warning" },
          { label: "discriminating experiment", value: result.experiment, tone: "signal" },
        ], "PPP2R2B dosage evidence audit"),
        claimBoundary(el, result.claim, result.gap, "Keep biochemical plausibility, model-system evidence, and endogenous patient-neuron evidence in separate columns.")
      );
      parts.controls.replaceChildren(choiceRow(el, [
        { label: "core limitation", value: "core" }, { label: "dosage direction", value: "dosage" },
        { label: "Bβ2 route", value: "b2" }, { label: "tau route", value: "tau" },
      ], evidenceScenario, (v) => { evidenceScenario = v; render(); }, "Evidence claim"));
      parts.rail.replaceChildren(causalRail(el, [
        { key: "established adjacent fact", value: result.claim },
        { key: "SCA12-specific joint", value: result.gap },
        { key: "test", value: result.experiment },
        { key: "decision", value: "hypothesis survives only if the joint moves" },
      ]));
      parts.explanation.innerHTML = "<strong>The most useful experiment is the one that can kill the proposed arrow.</strong> General PP2A biology can make a route plausible, but only endogenous, isoform-resolved measurements in a disease-relevant comparison establish whether the route operates in SCA12.";
    }

    function render() {
      parts.tabHost.replaceChildren(tabs(el, modes, mode, (v) => { mode = v; render(); }));
      if (mode === "flux") renderFlux();
      else if (mode === "specificity") renderSpecificity();
      else if (mode === "assembly") renderAssembly();
      else if (mode === "localisation") renderLocalisation();
      else if (mode === "competition") renderCompetition();
      else renderEvidence();
    }

    predict(body, {
      widget: "pp2a-flux-assembly-lab",
      question: "If a B subunit is doubled while a shared A–C core is limiting, must its assembled holoenzyme double?",
      hint: "The added subunit also competes with itself and with every other regulatory subunit for the shared core.",
      options: [
        { label: "Yes—protein fold equals holoenzyme fold" },
        { label: "No—the gain is sublinear and competitors fall", correct: true },
        { label: "No—assembled holoenzyme must fall to zero" },
        { label: "Only kinases compete for cores" },
      ],
    }, () => { mode = "competition"; parts.instrument.hidden = false; render(); });
    finishLab(parts, body);
  });

  /* D3 ---------------------------------------------------------------- */

  define("repeat-expansion-lab", makeObjectiveMap("d3", [
    "Classify repeat disorders by motif, genomic location, and mechanism while retaining exceptions.",
    "Explain expansion in non-dividing neurons and the role of structure-forming repair intermediates.",
    "Interpret Mendelian-disease onset-modifier GWAS as evidence for DNA-repair control of the disease clock.",
    "Distinguish intermediate, premutation, reduced-penetrance, and full-mutation categories by carrier and offspring consequences.",
    "Interpret anticipation and parent-of-origin effects while separating biology from ascertainment.",
    "Derive short-read invisibility and choose repeat-specific or long-read assays.",
    "Infer transmission instability from a sized pedigree while naming penetrance and future-expansion risks that sizes alone cannot provide.",
  ]), function (api) {
    const { body, el, predict } = api;
    const parts = labParts(el, "repeat-lab");
    let mode = "taxonomy";
    let taxonomyLocus = "sca12";
    let taxonomySize = 60;
    let repeatLength = 50;
    let repairDrive = 1;
    let years = 30;
    let repairFixture = "MSH3-high";
    let alleleLocus = "htt";
    let alleleRepeats = 38;
    let parentRepeat = 42;
    let childRepeat = 48;
    let readLength = 150;
    let anchors = 20;
    let targetRepeat = 51;

    const modes = [
      { label: "Mechanism taxonomy", value: "taxonomy" },
      { label: "Somatic clock", value: "somatic" },
      { label: "Repair modifiers", value: "modifiers" },
      { label: "Allele classes", value: "alleles" },
      { label: "Anticipation", value: "anticipation" },
      { label: "Diagnostic blind spot", value: "visibility" },
      { label: "Sized pedigree", value: "pedigree" },
    ];

    function renderTaxonomy() {
      const result = repeatExpansionModel({ kind: "taxonomy", locus: taxonomyLocus, size: taxonomySize });
      const labels = { htt: "HTT", fmr1: "FMR1", dmpk: "DMPK", fxn: "FXN", c9: "C9orf72", sca12: "PPP2R2B" };
      parts.visual.replaceChildren(
        networkBoard(el, [
          { label: "locus", value: labels[taxonomyLocus], tone: "active" },
          { label: "motif", value: result.motif },
          { label: "address", value: result.location, tone: "signal" },
          { label: "available mechanism", value: result.mechanism, tone: taxonomyLocus === "sca12" || taxonomyLocus === "c9" ? "warning" : "active" },
        ], [
          { from: "locus", to: "motif", sign: "contains →" },
          { from: "motif", to: "address", sign: "at →" },
          { from: "address", to: "mechanism", sign: "licenses →" },
        ], "Repeat mechanism is constrained by genomic address and size"),
        claimBoundary(el, "a mechanism class suggested by motif, size, and location", "the one true disease mechanism", "Overlapping genes, bidirectional transcription, RAN translation, interruptions, methylation, and size-dependent switches create real exceptions.")
      );
      parts.controls.replaceChildren(
        choiceRow(el, [
          { label: "HTT", value: "htt" }, { label: "FMR1", value: "fmr1" },
          { label: "DMPK", value: "dmpk" }, { label: "FXN", value: "fxn" },
          { label: "C9orf72", value: "c9" }, { label: "SCA12", value: "sca12" },
        ], taxonomyLocus, (v) => { taxonomyLocus = v; render(); }, "Repeat locus"),
        ...(taxonomyLocus === "fmr1" ? [rangeControl(el, "FMR1 repeat size", taxonomySize, { min: 20, max: 260, step: 1, format: (v) => v.toFixed(0) }, (v) => { taxonomySize = v; render(); })] : [])
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "motif", value: result.motif },
        { key: "location", value: result.location },
        { key: "product / blockade", value: result.mechanism },
        { key: "exception check", value: taxonomyLocus === "fmr1" ? "same address, mechanism switches with size" : taxonomyLocus === "sca12" ? "regulatory route plus live RNA/RAN hypotheses" : "ask about overlapping transcripts and interruptions" },
      ]));
      parts.explanation.innerHTML = "<strong>The mutation class is shared; the molecular crime is chosen largely by address.</strong> Coding CAG can make polyQ, a 3′-UTR CTG can poison RNA, intronic GAA can block transcription, and promoter/5′-UTR CAG can reset regulation. Exceptions are the test of the rule, not trivia.";
    }

    function renderSomatic() {
      const result = repeatExpansionModel({ kind: "somatic", repeats: repeatLength, repairDrive, years, threshold: 35 });
      parts.visual.replaceChildren(
        barBoard(el, [
          { label: "starting repeat", value: result.repeats, display: result.repeats.toFixed(0), tone: "active" },
          { label: "relative expansion pressure", value: result.relativePressure, display: result.relativePressure.toFixed(1), tone: "warning" },
          { label: "illustrative somatic shift", value: result.expectedShiftFixture, display: "+" + result.expectedShiftFixture.toFixed(2) + " repeats", tone: "signal" },
        ], "Uncalibrated length-by-repair somatic expansion fixture", Math.max(result.repeats, result.relativePressure, result.expectedShiftFixture)),
        processBoard(el, [
          { label: "non-dividing neuron", value: "no genome replication required" },
          { label: "transcription / repair", value: "transient single-stranded repeat folds" },
          { label: "hairpin survives repair", value: "misaligned DNA is copied", tone: "warning" },
          { label: "directional bias", value: "expansion when loop is retained in the copied strand" },
        ], "Somatic expansion without cell division")
      );
      parts.controls.replaceChildren(
        rangeControl(el, "Starting repeat length", repeatLength, { min: 20, max: 100, step: 1, format: (v) => v.toFixed(0) }, (v) => { repeatLength = v; render(); }),
        rangeControl(el, "Relative repair drive", repairDrive, { min: 0, max: 3, step: 0.05, format: (v) => v.toFixed(2) }, (v) => { repairDrive = v; render(); }),
        rangeControl(el, "Years", years, { min: 0, max: 80, step: 1, format: (v) => v.toFixed(0) }, (v) => { years = v; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "structure", value: "CAG/CTG hairpin" },
        { key: "recognition", value: "repair machinery binds the loop" },
        { key: "misrepair", value: "repeat length can increase" },
        { key: "mosaic tissue", value: "cells diverge across a lifetime" },
      ]));
      parts.explanation.innerHTML = "<strong>The displayed shift is deliberately an uncalibrated teaching fixture, not a patient forecast.</strong> It makes the feedback visible: longer tracts form stable structures more readily, and repair—not S phase—can copy a slipped intermediate in a post-mitotic neuron.";
    }

    function renderModifiers() {
      const result = repeatExpansionModel({ kind: "modifier", repair: repairFixture });
      parts.visual.replaceChildren(
        processBoard(el, [
          { label: "Mendelian cause", value: "pathogenic repeat already present", tone: "active" },
          { label: "GWAS phenotype", value: "residual age at onset after repeat length" },
          { label: "modifier", value: repairFixture + " · " + result.molecular, tone: "signal" },
          { label: "direction", value: result.onsetDirection },
        ], "Modifier GWAS of a Mendelian disease"),
        evidenceBoard(el, [
          { level: "Established", claim: "repeat length explains much onset variance", system: "human Mendelian cohorts" },
          { level: "Supported", claim: "replicated modifiers cluster in DNA-repair genes", system: "HD onset-modifier GWAS" },
          { level: "Inference", claim: "ongoing somatic expansion is part of the disease clock", system: "modifier direction + tissue studies" },
          { level: "Boundary", claim: "the exact transfer to SCA12 is not established", system: "SCA12 tissue pattern is sparse and atypical" },
        ], "Evidence chain from repair modifier to disease timing")
      );
      parts.controls.replaceChildren(choiceRow(el, [
        { label: "MSH3 high", value: "MSH3-high" }, { label: "MSH3 low", value: "MSH3-low" },
        { label: "FAN1 high", value: "FAN1-high" }, { label: "FAN1 low", value: "FAN1-low" },
      ], repairFixture, (v) => { repairFixture = v; render(); }, "DNA-repair modifier fixture"));
      parts.rail.replaceChildren(causalRail(el, [
        { key: "inherited repeat", value: "necessary Mendelian allele" },
        { key: "repair genotype", value: repairFixture },
        { key: "somatic expansion", value: result.molecular },
        { key: "onset", value: result.onsetDirection },
      ]));
      parts.explanation.innerHTML = "<strong>A GWAS can modify when a fully Mendelian disease appears rather than whether its causal allele exists.</strong> The concentration of replicated HD modifiers in DNA-repair genes is powerful evidence for an active somatic clock. Applying the same modifier map to SCA12 remains a hypothesis, especially because one SCA12 brain showed least instability in cerebellum.";
    }

    function renderAlleles() {
      const result = repeatExpansionModel({ kind: "allele", locus: alleleLocus, repeats: alleleRepeats });
      const categoryView = alleleLocus === "sca12"
        ? repeatBand(el, alleleRepeats, "SCA12 allele-category evidence band")
        : statusStrip(el, [
          { label: "locus", value: alleleLocus.toUpperCase() },
          { label: "repeat units", value: alleleRepeats.toFixed(0) },
          { label: "locus-specific category", value: result.category, tone: result.category.includes("reduced") || result.category.includes("premutation") ? "warning" : "signal" },
        ], "Locus-specific repeat category");
      parts.visual.replaceChildren(
        categoryView,
        processBoard(el, [
          { label: "locus", value: alleleLocus.toUpperCase(), tone: "active" },
          { label: "repeat size", value: alleleRepeats.toFixed(0) },
          { label: "category", value: result.category, tone: result.category.includes("contested") || result.category.includes("reduced") ? "warning" : "signal" },
          { label: "question to ask", value: result.category.includes("intermediate") || result.category.includes("premutation") ? "carrier consequence differs from offspring transmission risk" : "penetrance and age still belong beside the label" },
        ], "Locus-specific allele class")
      );
      parts.controls.replaceChildren(
        choiceRow(el, [
          { label: "HTT", value: "htt" }, { label: "FMR1", value: "fmr1" }, { label: "SCA12", value: "sca12" },
        ], alleleLocus, (v) => { alleleLocus = v; alleleRepeats = v === "fmr1" ? 90 : v === "sca12" ? 44 : 38; render(); }, "Allele-class locus"),
        rangeControl(el, "Repeat units", alleleRepeats, { min: 1, max: alleleLocus === "fmr1" ? 260 : 80, step: 1, format: (v) => v.toFixed(0) }, (v) => { alleleRepeats = v; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "continuous length", value: alleleRepeats.toFixed(0) + " repeats" },
        { key: "clinical convention", value: result.category },
        { key: "carrier", value: alleleLocus === "fmr1" && alleleRepeats <= 200 && alleleRepeats >= 55 ? "premutation can itself confer adult risk" : "penetrance depends on locus and band" },
        { key: "children", value: "transmission instability is a separate axis" },
      ]));
      parts.explanation.innerHTML = "<strong>Intermediate, premutation, and reduced-penetrance are not synonyms.</strong> An intermediate allele can leave its carrier unaffected yet expand in descendants; an FMR1 premutation can itself cause adult disease and expand to a different disease; a reduced-penetrance allele is already in a disease-associated range but does not guarantee lifetime expression.";
    }

    function renderAnticipation() {
      const result = repeatExpansionModel({ kind: "anticipation", parent: parentRepeat, child: childRepeat, onsetSlope: 0.7 });
      parts.visual.replaceChildren(
        networkBoard(el, [
          { label: "parent allele", value: parentRepeat.toFixed(0) + " repeats", tone: "active" },
          { label: "transmission", value: (result.delta >= 0 ? "+" : "") + result.delta.toFixed(0) + " repeats", tone: result.delta > 0 ? "warning" : "signal" },
          { label: "child allele", value: childRepeat.toFixed(0) + " repeats" },
          { label: "onset prediction", value: result.onsetShiftFixture.toFixed(1) + " years · illustrative only" },
        ], [
          { from: "parent", to: "transmission", sign: "meiosis →" },
          { from: "transmission", to: "child", sign: "size →" },
          { from: "child", to: "onset", sign: "association →" },
        ], "Anticipation separates molecular expansion from observed onset"),
        claimBoundary(el, "a parent-to-child repeat-size change", "anticipation in SCA12", "Anticipation additionally requires a demonstrated generation shift in onset or severity after accounting for ascertainment. SCA12 evidence is insufficient.")
      );
      parts.controls.replaceChildren(
        rangeControl(el, "Parent repeat", parentRepeat, { min: 20, max: 100, step: 1, format: (v) => v.toFixed(0) }, (v) => { parentRepeat = v; render(); }),
        rangeControl(el, "Child repeat", childRepeat, { min: 20, max: 120, step: 1, format: (v) => v.toFixed(0) }, (v) => { childRepeat = v; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "molecular", value: result.delta.toFixed(0) + " repeat change" },
        { key: "clinical", value: "earlier onset must be measured, not assumed" },
        { key: "parent-of-origin", value: "locus-specific direction; not a universal repeat rule" },
        { key: "bias audit", value: "late parents are selected to have early observed children" },
      ]));
      parts.explanation.innerHTML = "<strong>The onset conversion shown is a labelled toy slope, not an SCA12 estimate.</strong> Anticipation is a quantitative generation effect, and ascertainment can imitate it. Parent-of-origin directions are locus-specific; current SCA12 sources do not justify an anticipation correction.";
    }

    function renderVisibility() {
      const result = repeatExpansionModel({ kind: "visibility", readLength, anchorBases: anchors, motifLength: 3, repeatCount: targetRepeat });
      parts.visual.replaceChildren(
        readSpanBoard(el, result, targetRepeat),
        processBoard(el, [
          { label: "short-read genome", value: result.spans ? "ideal anchored span possible" : "full allele cannot be anchored", tone: result.spans ? "signal" : "warning" },
          { label: "inside-repeat reads", value: "ambiguous origin or low mapping quality" },
          { label: "replacement assay", value: "repeat-primed PCR / locus-aware caller / long read", tone: "signal" },
          { label: "negative result", value: "assay-class statement, not patient exclusion" },
        ], "Why standard variant pipelines miss expansions")
      );
      parts.controls.replaceChildren(
        rangeControl(el, "Read length", readLength, { min: 75, max: 500, step: 5, format: (v) => v.toFixed(0) + " bp" }, (v) => { readLength = v; render(); }),
        rangeControl(el, "Unique anchor on each side", anchors, { min: 5, max: 50, step: 1, format: (v) => v.toFixed(0) + " bp" }, (v) => { anchors = v; render(); }),
        rangeControl(el, "Target allele", targetRepeat, { min: 10, max: 120, step: 1, format: (v) => v.toFixed(0) + " repeats" }, (v) => { targetRepeat = v; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "read budget", value: readLength + " bp" },
        { key: "anchors", value: "−" + (2 * anchors) + " bp" },
        { key: "repeat capacity", value: result.maxSpanRepeats + " trinucleotides" },
        { key: "target", value: targetRepeat + " repeats · " + (result.spans ? "span" : "invisible to a simple spanning read") },
      ]));
      parts.explanation.innerHTML = "<strong>This is the generous case: one read must contain both unique flanks and the entire repeat.</strong> Repeat-only reads are not length-informative because they do not anchor. Paired-end and specialised graph callers can add evidence, but a standard SNV/indel pipeline does not become a validated expansion assay by covering the flanks.";
    }

    function renderPedigree() {
      const result = repeatExpansionModel({ kind: "pedigree", parent: parentRepeat, children: [childRepeat, parentRepeat - 2, parentRepeat + 4, 22] });
      parts.visual.replaceChildren(
        networkBoard(el, [
          { label: "affected parent", value: parentRepeat.toFixed(0) + " repeats", tone: "active" },
          { label: "child A", value: childRepeat.toFixed(0) + " (Δ " + (childRepeat - parentRepeat) + ")", tone: childRepeat >= 35 ? "warning" : "signal" },
          { label: "child B", value: (parentRepeat - 2).toFixed(0) + " (Δ −2)" },
          { label: "child C", value: (parentRepeat + 4).toFixed(0) + " (Δ +4)", tone: "warning" },
          { label: "child D", value: "22 · other parental allele", tone: "signal" },
        ], [
          { from: "parent", to: "A", sign: "↘" }, { from: "A", to: "B", sign: "↘" },
          { from: "B", to: "C", sign: "↘" }, { from: "C", to: "D", sign: "↘" },
        ], "Sized pedigree with unstable transmissions"),
        statusStrip(el, [
          { label: "child range", value: result.range[0] + "–" + result.range[1] },
          { label: "expanded transmissions", value: result.transmitted + "/4" },
          { label: "direction among expanded", value: result.deltas.slice(0, 3).join(", ") },
          { label: "not supplied by sizes", value: "penetrance / exact onset / future change", tone: "warning" },
        ], "Pedigree sizing inference")
      );
      parts.controls.replaceChildren(
        rangeControl(el, "Parent expanded allele", parentRepeat, { min: 35, max: 100, step: 1, format: (v) => v.toFixed(0) }, (v) => { parentRepeat = v; render(); }),
        rangeControl(el, "Child A allele", childRepeat, { min: 20, max: 120, step: 1, format: (v) => v.toFixed(0) }, (v) => { childRepeat = v; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "observe", value: "molecular sizes in each person" },
        { key: "infer", value: "transmission + instability direction" },
        { key: "cannot infer", value: "lifetime penetrance or a precise onset age" },
        { key: "next", value: "size the consultand's own allele; do not copy the parent's number" },
      ]));
      parts.explanation.innerHTML = "<strong>A sized pedigree reveals which allele was transmitted and how its length changed.</strong> It does not supply a penetrance curve, future somatic expansion, or a universal parent-of-origin rule. Near a disputed boundary, a few repeat units can change the report without settling the biology.";
    }

    function render() {
      parts.tabHost.replaceChildren(tabs(el, modes, mode, (v) => { mode = v; render(); }));
      if (mode === "taxonomy") renderTaxonomy();
      else if (mode === "somatic") renderSomatic();
      else if (mode === "modifiers") renderModifiers();
      else if (mode === "alleles") renderAlleles();
      else if (mode === "anticipation") renderAnticipation();
      else if (mode === "visibility") renderVisibility();
      else renderPedigree();
    }

    predict(body, {
      widget: "repeat-expansion-lab",
      question: "Can a CAG/CTG repeat keep expanding inside a neuron that will never divide again?",
      hint: "DNA repair and transcription also expose single-stranded repeat DNA and copy repair intermediates.",
      options: [
        { label: "No—expansion requires chromosome replication" },
        { label: "Yes—repair can drive somatic expansion", correct: true },
        { label: "Only if the neuron becomes cancerous" },
        { label: "Only through RNA editing" },
      ],
    }, () => { mode = "somatic"; parts.instrument.hidden = false; render(); });
    finishLab(parts, body);
  });

  /* D4 ---------------------------------------------------------------- */

  define("sca12-mechanism-board", makeObjectiveMap("d4", [
    "Separate SCA12 discovery, diagnostic association, cohort phenotype, and unresolved mechanism.",
    "Locate and orient the PPP2R2B repeat by assembly, strand, motif rotation, transcript, and regulatory context.",
    "Report source-disputed allele ranges and interpret a 44-repeat result without a false binary label.",
    "Eliminate incompatible repeat-mechanism classes while retaining live RNA, RAN, and regulatory hypotheses.",
    "Compare SCA12 hypotheses by support, weakest joint, and falsifying experiment.",
    "Distinguish direct SCA12 evidence from analogies to other repeat diseases and PP2A biology.",
    "Update mechanistic belief from an isoform-resolved cohort while checking stage, controls, and invented-teaching-data provenance.",
  ]), function (api) {
    const { body, el, predict } = api;
    const parts = labParts(el, "sca12-mechanism-lab");
    let mode = "locus";
    let genomeBuild = "grch38";
    let repeatCount = 44;
    let eliminationClass = "I";
    let hypothesis = "a";
    let evidenceLayer = "direct";
    let cohortStage = "immature";
    let arrow = "expression";

    const modes = [
      { label: "Discovery → clinic", value: "discovery" },
      { label: "Locus map", value: "locus" },
      { label: "Threshold", value: "threshold" },
      { label: "Class elimination", value: "elimination" },
      { label: "Hypothesis board", value: "hypotheses" },
      { label: "Analogy audit", value: "analogy" },
      { label: "New cohort", value: "cohort" },
    ];

    function renderDiscovery() {
      parts.visual.replaceChildren(
        evidenceBoard(el, [
          { level: "Established", claim: "expanded PPP2R2B-region CAG segregates with SCA12", system: "families, repeat sizing, independent cohorts" },
          { level: "Established", claim: "clinical pattern includes early action tremor and later ataxia", system: "patient cohorts" },
          { level: "Supported", claim: "Purkinje loss and cerebral-predominant pathology occur", system: "small autopsy series" },
          { level: "Conjectured", claim: "one molecular path connects repeat to selective loss", system: "several incompatible or coexisting models" },
        ], "What gene discovery solved and what it did not"),
        claimBoundary(el, "a diagnostic locus and reproducible phenotype", "a settled molecular mechanism", "Discovery can make a clinical test before it explains the path from repeat to neuron loss.")
      );
      parts.controls.replaceChildren();
      parts.rail.replaceChildren(causalRail(el, [
        { key: "1999 discovery", value: "expanded repeat linked to dominant ataxia" },
        { key: "cohorts", value: "phenotype and disputed length bands" },
        { key: "mechanism studies", value: "dosage, RNA foci, RAN, mitochondrial routes" },
        { key: "current state", value: "diagnosis solid; middle arrows unresolved" },
      ]));
      parts.explanation.innerHTML = "<strong>Finding the locus solves association and enables repeat testing; it does not identify which transcript, protein, RNA species, or cell process causes degeneration.</strong> The board keeps that difference visible so chronology is not mistaken for mechanism.";
    }

    function renderLocus() {
      const result = sca12MechanismModel({ kind: "locus", build: genomeBuild });
      parts.visual.replaceChildren(
        networkBoard(el, [
          { label: "assembly", value: result.build, tone: "active" },
          { label: "interval", value: result.coordinates },
          { label: "gene orientation", value: result.geneStrand + " strand; transcription right-to-left" },
          { label: "same repeat", value: result.plusMotif + " · " + result.senseMotif, tone: "signal" },
        ], [
          { from: "assembly", to: "interval", sign: "locates →" },
          { from: "interval", to: "strand", sign: "orient →" },
          { from: "strand", to: "motif", sign: "read 5′→3′ →" },
        ], "PPP2R2B repeat coordinate and strand discipline"),
        statusStrip(el, [
          { label: "coordinate convention", value: result.convention },
          { label: "sense clinical motif", value: "CAG" },
          { label: "plus-reference motif", value: "CTG" },
          { label: "regulatory context", value: result.region, tone: "warning" },
        ], "One locus, multiple legitimate descriptions")
      );
      parts.controls.replaceChildren(choiceRow(el, [
        { label: "GRCh38", value: "grch38" }, { label: "GRCh37", value: "grch37" }, { label: "T2T-CHM13", value: "t2t" },
      ], genomeBuild, (v) => { genomeBuild = v; render(); }, "Genome assembly"));
      parts.rail.replaceChildren(causalRail(el, [
        { key: "assembly", value: result.build },
        { key: "coordinate", value: result.coordinates },
        { key: "minus-strand gene", value: "CAG on sense, CTG on plus reference" },
        { key: "transcript context", value: "promoter-proximal to one TSS; 5′ UTR in current transcript annotation" },
      ]));
      parts.explanation.innerHTML = "<strong>Coordinates require an assembly and interval convention; motifs require a strand and phase.</strong> CAG, CTG, AGC, and GCT can all describe rotations/orientations of this same trinucleotide element. Alternative first exons make ‘promoter’ versus ‘5′ UTR’ transcript-dependent rather than mutually exclusive.";
    }

    function renderThreshold() {
      const result = sca12MechanismModel({ kind: "threshold", repeats: repeatCount });
      parts.visual.replaceChildren(
        repeatBand(el, repeatCount, "SCA12 evidence band"),
        processBoard(el, [
          { label: "allele", value: repeatCount + " pure CAG units on the sense strand", tone: "active" },
          { label: "classification", value: result.category, tone: result.category === "contested" ? "warning" : "signal" },
          { label: "report wording", value: result.report },
          { label: "source history", value: "classical ≥51; published arguments down to 43; symptomatic 40/42 reports; unaffected 39 carriers" },
        ], "Source-aware repeat report")
      );
      parts.controls.replaceChildren(rangeControl(el, "Reported CAG units", repeatCount, {
        min: 4, max: 80, step: 1, format: (v) => v.toFixed(0),
      }, (v) => { repeatCount = v; render(); }));
      parts.rail.replaceChildren(causalRail(el, [
        { key: "measurement", value: repeatCount + " CAG repeats" },
        { key: "source bands", value: "≤31 agreed · 32–50 disputed · ≥51 diagnostic convention" },
        { key: "phenotype + age", value: "still required for penetrance and interpretation" },
        { key: "report", value: result.report },
      ]));
      parts.explanation.innerHTML = repeatCount === 44
        ? "<strong>A 44-repeat result is neither safely ‘negative’ nor securely ‘positive’.</strong> Report both alleles, assay method, strand/unit, transcript or catalogue, threshold source/date, and that pathogenicity has been reported in this range but is not established."
        : "<strong>A threshold is a clinical convention drawn through age-dependent, length-dependent penetrance.</strong> Name the source rather than presenting one cut-point as a physical constant, and preserve uncertainty around the disputed interval.";
    }

    function renderElimination() {
      const classes = {
        I: ["Class I · canonical coding polyQ", "repeat is outside the canonical PPP2R2B coding frame; autopsy inclusions polyQ-negative", "eliminated as canonical route; RAN polyQ remains separate"],
        II: ["Class II · methylation silencing", "reporter activity rises with repeat length", "eliminated as simple whole-locus silencing; one-brain methylation/down-expression result keeps tissue-specific loss live"],
        IIp: ["Class II′ · elongation blockade", "repeat is promoter/5′-UTR territory and disease is dominant", "poor fit to FXN-style intronic GAA blockade"],
        III: ["Class III · RNA foci / sequestration", "foci shown in patient-derived neural stem cells", "live hypothesis; toxicity and tissue presence not established"],
        IV: ["Class IV · RAN translation", "repeat-frame products shown in constructs and patient-derived neural cells", "live hypothesis; frames differ and human-brain evidence absent"],
        V: ["Class V · regulatory mis-setting", "repeat-containing fragment has length-dependent promoter activity", "best-established class-level fit; direction and disease path unresolved"],
      };
      const f = classes[eliminationClass];
      parts.visual.replaceChildren(processBoard(el, [
        { label: "candidate class", value: f[0], tone: "active" },
        { label: "SCA12 observation", value: f[1] },
        { label: "verdict", value: f[2], tone: f[2].startsWith("live") || eliminationClass === "V" ? "signal" : "warning" },
      ], "Repeat-mechanism elimination test"), claimBoundary(el,
        f[1],
        "exclusive proof that no second route contributes",
        "SCA12 can combine regulatory, RNA, and RAN mechanisms; eliminating a canonical class does not eliminate every molecule associated with it."
      ));
      parts.controls.replaceChildren(choiceRow(el, [
        { label: "I polyQ", value: "I" }, { label: "II silencing", value: "II" }, { label: "II′ blockade", value: "IIp" },
        { label: "III RNA foci", value: "III" }, { label: "IV RAN", value: "IV" }, { label: "V regulation", value: "V" },
      ], eliminationClass, (v) => { eliminationClass = v; render(); }, "Mechanism class"));
      parts.rail.replaceChildren(causalRail(el, [
        { key: "requirements", value: f[0] },
        { key: "locus facts", value: f[1] },
        { key: "decision", value: f[2] },
        { key: "residue", value: "regulatory mis-setting plus live RNA/RAN routes" },
      ]));
      parts.explanation.innerHTML = "<strong>Elimination is valuable only when its requirement is explicit.</strong> The canonical coding-polyQ mechanism fails because of location, not because CAG can never yield a protein here; non-AUG translation is a distinct route with a different evidentiary burden.";
    }

    function renderHypotheses() {
      const result = sca12MechanismModel({ kind: "hypothesis", hypothesis });
      parts.visual.replaceChildren(
        processBoard(el, [
          { label: "hypothesis", value: result.name, tone: "active" },
          { label: "strongest support", value: result.support, tone: "signal" },
          { label: "weakest joint", value: result.weakness, tone: "warning" },
          { label: "experiment that can kill it", value: result.falsifier },
        ], "SCA12 hypothesis under adversarial review"),
        evidenceBoard(el, [
          { level: "Established", claim: "repeat locus and clinical association", system: "families + cohorts" },
          { level: "Supported", claim: result.support, system: "named model class" },
          { level: "Boundary", claim: result.weakness, system: "missing joint" },
          { level: "Falsifier", claim: result.falsifier, system: "discriminating experiment" },
        ], "Evidence, gap, and falsifier")
      );
      parts.controls.replaceChildren(choiceRow(el, [
        { label: "A: Bβ1 up", value: "a" }, { label: "A′: Bβ1 down", value: "ap" },
        { label: "B: Bβ2/DRP1", value: "b" }, { label: "C1: sense RNA", value: "c1" },
        { label: "C2: antisense RNA", value: "c2" }, { label: "C3: RAN", value: "c3" },
        { label: "D: tau", value: "d" },
      ], hypothesis, (v) => { hypothesis = v; render(); }, "SCA12 mechanism hypothesis"));
      parts.rail.replaceChildren(causalRail(el, [
        { key: "mutation", value: "expanded repeat" },
        { key: "proposed route", value: result.name },
        { key: "weak joint", value: result.weakness },
        { key: "next decision", value: result.falsifier },
      ]));
      parts.explanation.innerHTML = "<strong>Hypotheses are not ranked by how many adjacent facts they can cite.</strong> Rank them by the weakest unmeasured joint and whether a feasible experiment can reverse belief. Several routes may coexist; coexistence still requires each arrow to be demonstrated.";
    }

    function renderAnalogy() {
      const layers = {
        direct: ["Direct SCA12 evidence", "repeat segregation; reporter length response; patient-cell foci/RAN; small autopsy/cohort observations", "licenses claims about this locus within the measured system"],
        cell: ["SCA12 model-system evidence", "transfected SK-N-MC/HEK293T, iPSC-derived NSCs and pan-neurons", "supports possibility; maturation, background, construct, and tissue remain"],
        analogy: ["Analogy", "HTT somatic expansion, DMPK RNA foci, FMR1 size switch, C9orf72 RAN, general PP2A/tau", "generates tests; cannot fill a missing SCA12 arrow"],
        tissue: ["Human SCA12 tissue", "few brains: Purkinje loss, cortical atrophy, negative stains; one-brain regional instability/expression", "closest to disease but severely sample-limited"],
      };
      const f = layers[evidenceLayer];
      parts.visual.replaceChildren(
        processBoard(el, [
          { label: "evidence layer", value: f[0], tone: "active" },
          { label: "examples", value: f[1] },
          { label: "licensed use", value: f[2], tone: evidenceLayer === "analogy" ? "warning" : "signal" },
        ], "Provenance-aware evidence layer"),
        claimBoundary(el, f[1], evidenceLayer === "analogy" ? "operation of that mechanism in SCA12" : "unmeasured steps outside the system", f[2])
      );
      parts.controls.replaceChildren(choiceRow(el, [
        { label: "direct SCA12", value: "direct" }, { label: "SCA12 cell models", value: "cell" },
        { label: "other-disease analogy", value: "analogy" }, { label: "human SCA12 tissue", value: "tissue" },
      ], evidenceLayer, (v) => { evidenceLayer = v; render(); }, "Evidence provenance"));
      parts.rail.replaceChildren(causalRail(el, [
        { key: "source", value: f[0] },
        { key: "observation", value: f[1] },
        { key: "transfer step", value: evidenceLayer === "analogy" ? "unmeasured at SCA12 locus" : "bounded by system and sample" },
        { key: "claim", value: f[2] },
      ]));
      parts.explanation.innerHTML = "<strong>Analogy is a hypothesis generator, not missing data.</strong> HTT, DMPK, FMR1, and C9orf72 demonstrate what repeats can do; total PP2A biology demonstrates what some holoenzymes can do. Neither establishes that a particular route runs in SCA12 neurons.";
    }

    function renderCohort() {
      const result = sca12MechanismModel({ kind: "cohort", stage: cohortStage });
      const d = result.data;
      parts.visual.replaceChildren(
        barBoard(el, [
          { label: "PPP2R2B total", value: Math.abs(d.total), display: (d.total >= 0 ? "+" : "") + d.total.toFixed(2) + " log₂FC", tone: d.total >= 0 ? "signal" : "warning" },
          { label: "Bβ1 7B7D", value: Math.abs(d.b1a), display: (d.b1a >= 0 ? "+" : "") + d.b1a.toFixed(2), tone: d.b1a >= 0 ? "signal" : "warning" },
          { label: "Bβ1 7C7D", value: Math.abs(d.b1b), display: (d.b1b >= 0 ? "+" : "") + d.b1b.toFixed(2), tone: d.b1b >= 0 ? "signal" : "warning" },
          { label: "Bβ2", value: Math.abs(d.b2), display: (d.b2 >= 0 ? "+" : "") + d.b2.toFixed(2), tone: "active" },
          { label: "PPP2R2B-AS1", value: Math.abs(d.as1), display: "+" + d.as1.toFixed(2), tone: "signal" },
        ], "Invented isoform-resolved teaching cohort", Math.max(Math.abs(d.total), Math.abs(d.b1a), Math.abs(d.b1b), Math.abs(d.b2), Math.abs(d.as1))),
        statusStrip(el, [
          { label: "stage", value: cohortStage },
          { label: "Bβ1 direction", value: d.b1a >= 0 ? "up" : "down", tone: d.b1a >= 0 ? "signal" : "warning" },
          { label: "Bβ2 direction", value: Math.abs(d.b2) < 0.2 ? "near-flat" : d.b2 > 0 ? "up" : "down" },
          { label: "provenance", value: "invented worked-example data", tone: "warning" },
        ], "Cohort update and provenance")
      );
      parts.controls.replaceChildren(choiceRow(el, [
        { label: "day 30 / immature", value: "immature" }, { label: "day 90 / mature", value: "mature" },
      ], cohortStage, (v) => { cohortStage = v; render(); }, "Neuron maturation stage"));
      parts.rail.replaceChildren(causalRail(el, [
        { key: "design", value: "8 carriers + 8 controls · long-read teaching scenario" },
        { key: "stage", value: cohortStage },
        { key: "observation", value: "Bβ1 " + (d.b1a >= 0 ? "up" : "down") + " · Bβ2 near-flat · AS1 up" },
        { key: "update", value: cohortStage === "mature" ? "simple constitutive-overexpression model weakens" : "early-stage upregulation remains compatible" },
      ]));
      parts.explanation.innerHTML = "<strong>Every number in this cohort is invented in the chapter's worked example.</strong> The reasoning is the product: check the paralogue/control, resolve isoforms, test maturation interaction, and refuse to average a sign flip into ‘no effect’. The real 2024 patient-derived study was much smaller and reported most PPP2R2B isoforms down in mature pan-neurons, with selected isoforms up at progenitor stages.";
    }

    function render() {
      parts.tabHost.replaceChildren(tabs(el, modes, mode, (v) => { mode = v; render(); }));
      if (mode === "discovery") renderDiscovery();
      else if (mode === "locus") renderLocus();
      else if (mode === "threshold") renderThreshold();
      else if (mode === "elimination") renderElimination();
      else if (mode === "hypotheses") renderHypotheses();
      else if (mode === "analogy") renderAnalogy();
      else renderCohort();
    }

    predict(body, {
      widget: "sca12-mechanism-board",
      question: "A laboratory measures 44 CAG repeats at <em>PPP2R2B</em>. Is ‘negative for SCA12 because the threshold is 51’ a defensible complete report?",
      hint: "Published sources disagree across the 32–50 band, and the proposed floor has moved downward.",
      options: [
        { label: "Yes—51 is a fixed biological boundary" },
        { label: "No—44 lies in a contested pathogenicity band", correct: true },
        { label: "Yes, if the patient has tremor" },
        { label: "No—every allele above 31 is fully penetrant" },
      ],
    }, () => { mode = "threshold"; repeatCount = 44; parts.instrument.hidden = false; render(); });
    finishLab(parts, body);
  });

  /* D5 ---------------------------------------------------------------- */

  define("sca12-dossier-lab", makeObjectiveMap("d5", [
    "Explain founder effect, endogamy, and drift for a dominant allele without invoking recessive inbreeding logic.",
    "State what a shared founder haplotype proves and why referral fractions do not supply prevalence.",
    "Design and audit a repeat-expansion diagnostic pathway, assay, and report.",
    "Run a Bayesian predictive-risk sensitivity analysis while preserving the missing SCA12 penetrance input and threshold uncertainty.",
    "Choose therapy direction only after specifying the mechanism and expose sign reversals for sense and antisense interventions.",
    "Turn an open question into a falsifiable study and a provenance-aware SCA12 dossier.",
  ]), function (api) {
    const { body, el, predict } = api;
    const parts = labParts(el, "sca12-dossier-lab");
    let mode = "founder";
    let families = 20;
    let shared = 20;
    let referralTested = 500;
    let referralPositive = 43;
    let diagnosticRepeat = 51;
    let diagnosticRead = 150;
    let diagnosticAnchor = 20;
    let manifested = 0.05;
    let parentAllele = 57;
    let mechanism = "up";
    let intervention = "senseKnockdown";
    let studyAim = "direction";

    const modes = [
      { label: "Founder", value: "founder" },
      { label: "Referral ≠ prevalence", value: "prevalence" },
      { label: "Diagnostic pathway", value: "diagnostic" },
      { label: "Predictive risk", value: "risk" },
      { label: "Therapy sign", value: "therapy" },
      { label: "Study + dossier", value: "study" },
    ];

    function renderFounder() {
      const result = sca12DossierModel({ kind: "founder", families, shared });
      parts.visual.replaceChildren(
        networkBoard(el, [
          { label: "ancestral chromosome", value: "one expanded allele + flanking haplotype", tone: "active" },
          { label: "endogamous mating pool", value: "restricted gene flow; its own drift unit" },
          { label: "unrelated families", value: shared + "/" + families + " share the marker block", tone: "signal" },
          { label: "inference", value: result.inference },
        ], [
          { from: "ancestor", to: "pool", sign: "founder →" },
          { from: "pool", to: "families", sign: "drift + descent →" },
          { from: "families", to: "inference", sign: "haplotype →" },
        ], "Founder haplotype and restricted mating pool"),
        statusStrip(el, [
          { label: "families typed", value: result.families },
          { label: "shared haplotype", value: result.shared + " · " + percent(result.sharedFraction, 0), tone: "signal" },
          { label: "dominant disease", value: "inbreeding coefficient is not the mechanism" },
          { label: "what remains unknown", value: "founder age and place" , tone: "warning" },
        ], "Founder inference boundary")
      );
      parts.controls.replaceChildren(
        rangeControl(el, "Families typed", families, { min: 2, max: 50, step: 1, format: (v) => v.toFixed(0) }, (v) => { families = v; shared = Math.min(shared, families); render(); }),
        rangeControl(el, "Families sharing haplotype", shared, { min: 0, max: families, step: 1, format: (v) => v.toFixed(0) }, (v) => { shared = v; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "founder", value: "one ancestral expansion" },
        { key: "endogamy", value: "keeps the allele in a restricted pool" },
        { key: "drift", value: "changes frequency within that smaller pool" },
        { key: "not inbreeding", value: "SCA12 is dominant; homozygosity is not the enrichment mechanism" },
      ]));
      parts.explanation.innerHTML = "<strong>A shared flanking haplotype across unrelated families supports common descent of their expanded chromosomes.</strong> It does not date the event, locate it geographically, prove a mutational hotspot, or restrict diagnosis to one community. Endogamy matters by closing the drift unit, not by exposing a recessive allele.";
    }

    function renderPrevalence() {
      const result = sca12DossierModel({ kind: "referral", tested: referralTested, positive: referralPositive });
      parts.visual.replaceChildren(
        statusStrip(el, [
          { label: "tertiary referrals tested", value: compact(result.tested, 0) },
          { label: "SCA12-positive referrals", value: result.positive },
          { label: "referral fraction", value: percent(result.referralFraction, 2), tone: "active" },
          { label: "population prevalence", value: "not identified", tone: "warning" },
        ], "Referral denominator versus population denominator"),
        claimBoundary(el,
          percent(result.referralFraction, 2) + " of this selected clinic sample",
          "cases per 100,000 people",
          "Referral, diagnostic fame, phenotype, geography, test ordering, and access all sit between the clinic denominator and a population rate."
        )
      );
      parts.controls.replaceChildren(
        rangeControl(el, "Referrals tested", referralTested, { min: 20, max: 2000, step: 10, format: (v) => v.toFixed(0) }, (v) => { referralTested = v; referralPositive = Math.min(referralPositive, referralTested); render(); }),
        rangeControl(el, "SCA12-positive referrals", referralPositive, { min: 0, max: referralTested, step: 1, format: (v) => v.toFixed(0) }, (v) => { referralPositive = v; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "denominator", value: "people reaching a tertiary ataxia genetics service" },
        { key: "selection", value: "phenotype, access, awareness, community, referral" },
        { key: "observed", value: percent(result.referralFraction, 2) + " referral fraction" },
        { key: "not licensed", value: "population prevalence; none published" },
      ]));
      parts.explanation.innerHTML = "<strong>No honest per-100,000 SCA12 prevalence follows from a referral cohort.</strong> The sliders show how a precise clinic fraction can remain irrelevant to a population denominator. Founder-enriched is not population-measured and not founder-restricted.";
    }

    function renderDiagnostic() {
      const result = sca12DossierModel({ kind: "diagnostic", readLength: diagnosticRead, anchorBases: diagnosticAnchor, repeatCount: diagnosticRepeat });
      parts.visual.replaceChildren(
        readSpanBoard(el, result.visibility, diagnosticRepeat),
        processBoard(el, [
          { label: "phenotype", value: "action tremor + later ataxia + dominant family history", tone: "active" },
          { label: "standard short-read result", value: result.visibility.spans ? "possible span in ideal fixture" : "negative is non-exclusion", tone: result.visibility.spans ? "signal" : "warning" },
          { label: "next assay", value: "flanking + repeat-primed PCR, validated caller, or long-read span", tone: "signal" },
          { label: "report", value: result.category.report },
        ], "SCA12 diagnostic pathway")
      );
      parts.controls.replaceChildren(
        rangeControl(el, "Read length", diagnosticRead, { min: 75, max: 500, step: 5, format: (v) => v.toFixed(0) + " bp" }, (v) => { diagnosticRead = v; render(); }),
        rangeControl(el, "Unique anchor each side", diagnosticAnchor, { min: 5, max: 50, step: 1, format: (v) => v.toFixed(0) + " bp" }, (v) => { diagnosticAnchor = v; render(); }),
        rangeControl(el, "Measured allele", diagnosticRepeat, { min: 4, max: 100, step: 1, format: (v) => v.toFixed(0) + " CAG" }, (v) => { diagnosticRepeat = v; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "suspect", value: "phenotype + pedigree" },
        { key: "assay boundary", value: result.visibility.maxSpanRepeats + " repeats in ideal anchored read" },
        { key: "repeat-specific test", value: "size both alleles + detect non-amplifying expansions" },
        { key: "interpret", value: result.category.category + " · source-aware wording" },
      ]));
      parts.explanation.innerHTML = "<strong>A good report names both allele sizes or explains non-detection, the repeat unit and strand, assay, transcript/catalogue, and threshold source.</strong> One fragment-analysis peak can mean homozygosity or allelic dropout; repeat-primed PCR exists to distinguish them.";
    }

    function renderRisk() {
      const result = sca12DossierModel({ kind: "risk", prior: 0.5, manifestedByAge: manifested });
      const threshold = sca12MechanismModel({ kind: "threshold", repeats: parentAllele });
      parts.visual.replaceChildren(
        statusStrip(el, [
          { label: "Mendelian prior", value: "50.0%" },
          { label: "assumed carriers manifest by this age", value: percent(manifested, 1), tone: "warning" },
          { label: "posterior after being unaffected", value: percent(result.posterior, 2), tone: "signal" },
          { label: "published SCA12 penetrance curve", value: "missing", tone: "warning" },
        ], "Predictive-risk sensitivity calculation"),
        processBoard(el, [
          { label: "parent allele", value: parentAllele + " repeats · " + threshold.category, tone: threshold.category === "contested" ? "warning" : "active" },
          { label: "prior", value: "heterozygous affected parent → 1/2 inheritance" },
          { label: "evidence", value: "unaffected at age a → likelihood 1−f if carrier" },
          { label: "posterior", value: "(1−f)/(2−f) = " + percent(result.posterior, 2), tone: "signal" },
        ], "Bayes table with the missing input kept symbolic")
      );
      parts.controls.replaceChildren(
        rangeControl(el, "Teaching assumption f: carriers manifest by age", manifested, { min: 0, max: 0.5, step: 0.01, format: (v) => percent(v, 0) }, (v) => { manifested = v; render(); }),
        rangeControl(el, "Affected parent's repeat count", parentAllele, { min: 35, max: 80, step: 1, format: (v) => v.toFixed(0) }, (v) => { parentAllele = v; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "prior", value: "0.5" },
        { key: "likelihood", value: "P(unaffected | carrier) = " + (1 - manifested).toFixed(2) },
        { key: "normalise", value: percent(result.posterior, 2) },
        { key: "clinical boundary", value: "f is not published for SCA12; do not quote the teaching number to a patient" },
      ]));
      parts.explanation.innerHTML = parentAllele <= 50
        ? "<strong>The calculation cannot settle whether inheriting this contested-range allele means inheriting disease risk.</strong> The penetrance function is missing and the pathogenicity category is disputed. Saying the calculation cannot be completed is the correct output."
        : "<strong>At young ages, being unaffected changes the 50% inheritance prior little because onset before then is uncommon in reported cohorts.</strong> The sweep is useful; the single f value is not. No published SCA12 age-at-onset survival curve supplies the needed input.";
    }

    function renderTherapy() {
      const result = sca12DossierModel({ kind: "therapy", mechanism, intervention });
      const mechanismLabels = { up: "pathology is excess Bβ1", down: "pathology is insufficient Bβ1", rna: "pathology is toxic repeat RNA / RAN" };
      const interventionLabels = { senseKnockdown: "knock down sense PPP2R2B", as1Knockdown: "knock down PPP2R2B-AS1", stabilise: "stabilise repeat / repair drive" };
      parts.visual.replaceChildren(
        networkBoard(el, [
          { label: "assumed mechanism", value: mechanismLabels[mechanism], tone: "active" },
          { label: "intervention", value: interventionLabels[intervention] },
          { label: "directional verdict", value: result.verdict, tone: result.verdict.includes("hazard") ? "warning" : "signal" },
          { label: "blocking caveat", value: result.caveat, tone: "warning" },
        ], [
          { from: "mechanism", to: "intervention", sign: "chooses →" },
          { from: "intervention", to: "verdict", sign: "moves →" },
          { from: "verdict", to: "caveat", sign: "but →" },
        ], "Therapy sign depends on mechanism direction"),
        claimBoundary(el, result.verdict, "clinical efficacy or safety", result.caveat)
      );
      parts.controls.replaceChildren(
        choiceRow(el, [
          { label: "Bβ1 too high", value: "up" }, { label: "Bβ1 too low", value: "down" }, { label: "toxic RNA / RAN", value: "rna" },
        ], mechanism, (v) => { mechanism = v; render(); }, "Assumed disease mechanism"),
        choiceRow(el, [
          { label: "sense knockdown", value: "senseKnockdown" }, { label: "antisense-transcript knockdown", value: "as1Knockdown" },
          { label: "repeat stabilisation", value: "stabilise" },
        ], intervention, (v) => { intervention = v; render(); }, "Intervention direction")
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "unknown arrow", value: mechanismLabels[mechanism] },
        { key: "drug action", value: interventionLabels[intervention] },
        { key: "predicted sign", value: result.verdict },
        { key: "go/no-go measurement", value: "endogenous isoform RNA + protein and toxic species in patient-relevant cells/tissue" },
      ]));
      parts.explanation.innerHTML = "<strong>The same ASO can be rational, neutral, or harmful when the causal arrow changes sign.</strong> An antisense transcript can be both a toxic species and a regulator of the sense gene. Measure the intervention's effect on Bβ1 protein and the proposed toxic species before calling it target engagement.";
    }

    function renderStudy() {
      const result = sca12DossierModel({ kind: "study", aim: studyAim });
      parts.visual.replaceChildren(
        processBoard(el, [
          { label: "gap", value: result.gap, tone: "active" },
          { label: "design", value: result.design },
          { label: "discriminating result", value: result.discriminating, tone: "signal" },
          { label: "uninformative failure", value: result.uninformative, tone: "warning" },
        ], "Falsifiable SCA12 study aim"),
        evidenceBoard(el, [
          { level: "Provenance", claim: "source + system + sample size on every claim", system: "dossier requirement" },
          { level: "Direction", claim: "patient tissue, patient cells, constructs, and analogy separated", system: "evidence table" },
          { level: "Contradiction", claim: "both expression directions remain visible", system: "no recency voting" },
          { level: "Falsifier", claim: "support, kill, and uninformative outcomes predeclared", system: "mock grant aim" },
        ], "Strong-dossier quality controls")
      );
      parts.controls.replaceChildren(choiceRow(el, [
        { label: "expression direction", value: "direction" }, { label: "natural history", value: "history" },
        { label: "cell-type isoforms", value: "tissue" }, { label: "RAN in brain", value: "ran" },
      ], studyAim, (v) => { studyAim = v; render(); }, "Open question"));
      parts.rail.replaceChildren(causalRail(el, [
        { key: "open question", value: result.gap },
        { key: "experiment", value: result.design },
        { key: "decision", value: result.discriminating },
        { key: "design out", value: result.uninformative },
      ]));
      parts.explanation.innerHTML = "<strong>A strong dossier preserves uncertainty in a form that supports a decision.</strong> It records provenance, direction, sample size, contradictions, what could not be verified, and the result that would falsify each live claim—then chooses the study whose outcome changes the next action.";
    }

    function render() {
      parts.tabHost.replaceChildren(tabs(el, modes, mode, (v) => { mode = v; render(); }));
      if (mode === "founder") renderFounder();
      else if (mode === "prevalence") renderPrevalence();
      else if (mode === "diagnostic") renderDiagnostic();
      else if (mode === "risk") renderRisk();
      else if (mode === "therapy") renderTherapy();
      else renderStudy();
    }

    predict(body, {
      widget: "sca12-dossier-lab",
      question: "A tertiary ataxia clinic finds SCA12 in 8.6% of its genetically tested referrals. Is 8.6% a population prevalence?",
      hint: "Ask who entered the denominator and why they reached that clinic.",
      options: [
        { label: "Yes—genetic confirmation removes selection bias" },
        { label: "No—it is a selected referral fraction", correct: true },
        { label: "Yes, but only for dominant disease" },
        { label: "No—prevalence must always be 50%" },
      ],
    }, () => { mode = "prevalence"; parts.instrument.hidden = false; render(); });
    finishLab(parts, body);
  });

  global.ReaderInteractionDefinitions = Object.assign(
    global.ReaderInteractionDefinitions || {}, definitions
  );
  global.ReaderInteractionModels = Object.assign(
    global.ReaderInteractionModels || {}, models
  );
  global.ReaderInteractionCoverage = Object.assign(
    global.ReaderInteractionCoverage || {}, coverage
  );
})(typeof window !== "undefined" ? window : globalThis);
