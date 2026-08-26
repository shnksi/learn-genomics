/* ── Gene-regulation interaction wave ────────────────────────────────────
   Objective-mapped Hero Labs for Chapters 21–25A. Each lab keeps the
   learner's intervention, the molecular mechanism, and the observable on one
   surface. Models remain pure so scientific fixtures can be tested without a
   browser; all views are local HTML/SVG and work from file://.
   ───────────────────────────────────────────────────────────────────────── */

(function (global) {
  "use strict";

  const definitions = {};
  const models = {};
  const coverage = {};
  const kit = global.ReaderInteractionKit;
  if (!kit) throw new Error("ReaderInteractionKit must load before gene-regulation labs");

  const {
    choiceRow: kitChoiceRow,
    tabs: kitTabs,
    causalRail,
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

  function define(id, objectiveMap, build) {
    if (definitions[id]) throw new Error("Duplicate interaction: " + id);
    definitions[id] = build;
    coverage[id] = objectiveMap;
  }

  function clamp(value, low, high) {
    return Math.max(low, Math.min(high, value));
  }

  function percent(value, digits) {
    return (value * 100).toFixed(digits == null ? 1 : digits) + "%";
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
      instrument: el("div", { class: "hero-lab regulation-lab", hidden: true }),
      tabHost: el("div"),
      visual: el("div", { class: "lab-visual regulation-visual" }),
      controls: el("div", { class: "lab-controls" }),
      rail: el("div"),
      explanation: el("div", { class: "callout", "aria-live": "polite" }),
    };
  }

  function finishLab(parts, body) {
    parts.instrument.append(
      parts.tabHost,
      parts.visual,
      parts.controls,
      parts.rail,
      parts.explanation
    );
    body.append(parts.instrument);
  }

  function statusStrip(el, items, label) {
    const strip = el("div", {
      class: "reg-status-strip",
      role: "img",
      "aria-label": label + ". " + items.map((item) => item.label + ": " + item.value).join(". "),
    });
    items.forEach((item) => strip.append(el("div", {
      class: "reg-status" + (item.tone ? " is-" + item.tone : ""),
    }, [
      el("span", { text: item.label }),
      el("strong", { text: String(item.value) }),
    ])));
    return strip;
  }

  function processBoard(el, steps, label) {
    const board = el("div", {
      class: "reg-process",
      role: "img",
      "aria-label": label + ". " + steps.map((step) => step.label + ": " + step.value).join(". "),
    });
    steps.forEach((step, index) => {
      board.append(el("div", {
        class: "reg-process-step" + (step.tone ? " is-" + step.tone : ""),
      }, [
        el("span", { class: "reg-process-index", text: String(index + 1).padStart(2, "0") }),
        el("span", { class: "reg-process-label", text: step.label }),
        el("strong", { text: String(step.value) }),
      ]));
    });
    return board;
  }

  function barBoard(el, rows, label, maximum) {
    const max = maximum || Math.max(1e-9, ...rows.map((row) => row.value));
    const board = el("div", {
      class: "reg-bars",
      role: "img",
      "aria-label": label + ". " + rows.map((row) =>
        row.label + " " + (row.display == null ? row.value : row.display)
      ).join(", "),
    });
    rows.forEach((row) => board.append(el("div", { class: "reg-bar-row" }, [
      el("span", { class: "reg-bar-name", text: row.label }),
      el("span", { class: "reg-bar-track", "aria-hidden": "true" }, [
        el("span", {
          class: "reg-bar-fill" + (row.tone ? " is-" + row.tone : ""),
          style: "width:" + clamp(100 * row.value / max, 0, 100).toFixed(2) + "%",
        }),
      ]),
      el("strong", { text: row.display == null ? String(row.value) : String(row.display) }),
    ])));
    return board;
  }

  function matrixBoard(el, columns, rows, label) {
    const board = el("div", {
      class: "reg-matrix",
      role: "img",
      "aria-label": label + ". " + rows.map((row) =>
        row.label + ": " + row.cells.map((cell, index) => columns[index] + " " + cell.value).join(", ")
      ).join(". "),
    });
    const header = el("div", { class: "reg-matrix-row is-head" });
    header.style.setProperty("--reg-columns", String(columns.length + 1));
    header.append(el("span", { class: "reg-matrix-corner", text: "state" }));
    columns.forEach((column) => header.append(el("strong", { class: "reg-matrix-head", text: column })));
    board.append(header);
    rows.forEach((row) => {
      const rowNode = el("div", { class: "reg-matrix-row" });
      rowNode.style.setProperty("--reg-columns", String(columns.length + 1));
      rowNode.append(el("strong", { class: "reg-matrix-label", text: row.label }));
      row.cells.forEach((cell, index) => rowNode.append(el("span", {
        class: "reg-matrix-cell" + (cell.tone ? " is-" + cell.tone : ""),
        text: String(cell.value),
        "data-label": columns[index],
      })));
      board.append(rowNode);
    });
    return board;
  }

  function textSvg(html, label, viewBox, extraClass) {
    return '<svg class="lab-diagram regulation-diagram ' + (extraClass || "") +
      '" viewBox="' + (viewBox || "0 0 520 300") + '" role="img" aria-label="' +
      label.replace(/"/g, "&quot;") + '">' + html + "</svg>";
  }

  function linePath(points, xScale, yScale) {
    return points.map((point, index) => (index ? "L" : "M") +
      xScale(point.x).toFixed(2) + " " + yScale(point.y).toFixed(2)).join(" ");
  }

  /* Ch 21 — operon circuit --------------------------------------------- */

  const LAC_COPY_FIXTURES = {
    wild: [
      { name: "chromosome", I: "+", P: "+", O: "+", Z: "+", Y: "+" },
    ],
    transRescue: [
      { name: "chromosome", I: "−", P: "+", O: "+", Z: "+", Y: "+" },
      { name: "F′", I: "+", P: "+", O: "+", Z: "−", Y: "−" },
    ],
    cisVisible: [
      { name: "chromosome", I: "+", P: "+", O: "c", Z: "+", Y: "+" },
      { name: "F′", I: "+", P: "+", O: "+", Z: "−", Y: "−" },
    ],
    cisHidden: [
      { name: "chromosome", I: "+", P: "+", O: "c", Z: "−", Y: "+" },
      { name: "F′", I: "+", P: "+", O: "+", Z: "+", Y: "−" },
    ],
    super: [
      { name: "chromosome", I: "s", P: "+", O: "+", Z: "+", Y: "+" },
      { name: "F′", I: "+", P: "+", O: "+", Z: "+", Y: "+" },
    ],
    worked: [
      { name: "chromosome", I: "−", P: "+", O: "c", Z: "−", Y: "+" },
      { name: "F′", I: "+", P: "−", O: "+", Z: "+", Y: "−" },
    ],
  };

  const BACTERIAL_SYSTEMS = {
    sigma: {
      label: "σ-factor swap", sensor: "anti-σ release or altered σ abundance",
      relay: "σ competes for shared core RNA polymerase", output: "whole regulon",
      timescale: "minutes", measurement: "cell programme and unmet demand",
    },
    twoComponent: {
      label: "two-component relay", sensor: "variable input domain",
      relay: "ATP → sensor His-P → response-regulator Asp-P", output: "usually a promoter set",
      timescale: "milliseconds to minutes", measurement: "the input domain's physical signal",
    },
    quorum: {
      label: "quorum loop", sensor: "extracellular autoinducer concentration",
      relay: "receptor activates output and more synthase", output: "cooperative public behavior",
      timescale: "minutes to generations", measurement: "density × confinement, not density alone",
    },
    phase: {
      label: "phase variation", sensor: "none — blind stochastic switching",
      relay: "DNA inversion or slipped repeat changes expression", output: "heritable subpopulation mix",
      timescale: "10⁻³–10⁻⁵ switches per generation", measurement: "no current signal; bet hedging",
    },
  };

  function operonCircuitModel(input) {
    if (input.kind === "lac") {
      const operatorFree = input.lactose ? (input.glucose ? 0.15 : 0.95) : 0.001;
      const crpOccupied = input.glucose ? 0.05 : 0.90;
      const activation = 0.03 + 0.97 * crpOccupied;
      const rawRate = operatorFree * activation;
      const maximum = 0.95 * (0.03 + 0.97 * 0.90);
      return {
        operatorFree, crpOccupied, activation,
        rate: rawRate / maximum,
        lacI: input.lactose ? "allolactose lowers LacI occupancy" : "LacI loops O1 to an auxiliary operator",
        crp: input.glucose ? "glucose transport lowers cAMP" : "cAMP–CRP recruits RNA polymerase",
        bootstrap: input.lactose
          ? "basal LacZ makes allolactose; basal LacY imports lactose"
          : "~10⁻³ operator-free fraction preserves inducibility",
      };
    }
    if (input.kind === "merodiploid") {
      const copies = LAC_COPY_FIXTURES[input.fixture].map((copy) => Object.assign({}, copy));
      const pool = copies.some((copy) => copy.I === "s")
        ? "superrepressor"
        : copies.some((copy) => copy.I === "+") ? "functional LacI" : "no functional LacI";
      const evaluated = copies.map((copy) => {
        const promoterWorks = copy.P === "+";
        const operatorEscapes = copy.O === "c";
        const repressorAllows = pool === "no functional LacI" ||
          (pool === "functional LacI" && input.inducer);
        const transcribed = promoterWorks && (operatorEscapes || repressorAllows);
        return Object.assign({}, copy, {
          transcribed,
          betaGal: transcribed && copy.Z === "+",
          permease: transcribed && copy.Y === "+",
          reason: !promoterWorks ? "P− blocks this copy" : operatorEscapes
            ? "Oᶜ escapes in cis" : repressorAllows ? "shared pool permits transcription" : "shared LacI pool represses",
        });
      });
      return {
        pool, copies: evaluated,
        betaGal: evaluated.some((copy) => copy.betaGal),
        permease: evaluated.some((copy) => copy.permease),
      };
    }
    if (input.kind === "attenuation") {
      if (input.context === "eukaryote") {
        return {
          ribosome: "separated from nascent nuclear RNA",
          fold: "no ribosome-coupled decision",
          transcript: "mechanism unavailable",
          reason: "the nuclear envelope separates transcription from translation",
        };
      }
      if (input.tryptophan === "scarce") {
        return {
          ribosome: "stalled on tandem Trp codons in segment 1",
          fold: "2:3 antiterminator",
          transcript: "trpEDCBA transcribed",
          reason: "segment 3 is unavailable for the 3:4 terminator",
        };
      }
      if (input.tryptophan === "none") {
        return {
          ribosome: "absent",
          fold: "1:2 and 3:4 form",
          transcript: "terminated",
          reason: "active stalling—not ribosome absence—is the ON signal",
        };
      }
      return {
        ribosome: "covers segment 2 after rapid translation",
        fold: "3:4 terminator",
        transcript: "terminated before trpE",
        reason: "charged tRNA-Trp lets the ribosome reach the leader stop",
      };
    }
    if (input.kind === "riboswitch") {
      const platforms = {
        terminator: { bound: "terminator stabilised", unbound: "read-through fold", output: "transcription elongation" },
        translation: { bound: "Shine–Dalgarno sequestered", unbound: "ribosome-binding site exposed", output: "translation initiation" },
        ribozyme: { bound: "glmS self-cleaves", unbound: "message remains intact", output: "mRNA stability" },
      };
      const platform = platforms[input.platform];
      return {
        fold: input.ligand ? platform.bound : platform.unbound,
        expression: input.ligand ? "lower" : "higher",
        output: platform.output,
        cis: "aptamer + expression platform are part of the regulated RNA",
      };
    }
    if (input.kind === "system") {
      const result = Object.assign({}, BACTERIAL_SYSTEMS[input.system]);
      const strength = clamp(input.signal / 100, 0, 1);
      if (input.system === "quorum") {
        result.activity = strength < 0.45 ? 0.08 * strength : Math.min(1, 0.08 + (strength - 0.45) * 1.68);
      } else if (input.system === "phase") {
        result.activity = 0.5;
      } else {
        result.activity = strength;
      }
      return result;
    }
    throw new Error("Unknown operon-circuit model");
  }
  models.operonCircuit = operonCircuitModel;

  /* Ch 22 — enhancer logic --------------------------------------------- */

  const ENHANCER_ASSAYS = {
    reporter: { question: "sufficiency", observes: "fragment can drive a reporter out of context", cannot: "native necessity or target gene" },
    crispri: { question: "necessity", observes: "endogenous element is required in this state", cannot: "whether a redundant partner masks loss" },
    chip: { question: "occupancy", observes: "factor or mark is present", cannot: "whether occupancy changes expression" },
    hic: { question: "contact", observes: "loci meet more often than background", cannot: "whether the contact is functional" },
  };

  function enhancerLogicModel(input) {
    if (input.kind === "domain") {
      const enhancer = 250;
      const geneA = 160;
      const geneB = 450;
      const distanceA = Math.abs(enhancer - geneA);
      const distanceB = Math.abs(enhancer - geneB);
      const base = (distance) => 1 / (1 + distance / 100);
      const rangeMultiplier = input.rangeExtender ? 1.8 : 1;
      const contactA = base(distanceA) * (input.boundaryIntact ? 0.08 : 1);
      const contactB = Math.min(1, base(distanceB) * rangeMultiplier);
      return {
        enhancer, geneA, geneB, distanceA, distanceB,
        contactA, contactB,
        target: contactA > contactB ? "nearest gene A" : "farther gene B",
        orientationEffect: "none",
        caveat: "contact opportunity narrows candidates; it does not prove promoter choice",
      };
    }
    if (input.kind === "motif") {
      const strands = 2;
      const genome = 3.1e9;
      const motifHits = strands * genome * 2 ** (-input.bits);
      const windows = genome / input.windowBp;
      const lambda = strands * input.windowBp * 2 ** (-input.bits);
      const atLeastOne = 1 - Math.exp(-lambda);
      const combined = windows * atLeastOne ** input.partners;
      const accessible = combined * input.accessibleFraction;
      return { motifHits, windows, lambda, atLeastOne, combined, accessible };
    }
    if (input.kind === "module") {
      const pioneer = input.factor === "pioneer";
      const accessible = input.chromatin === "open" || pioneer;
      const recruits = input.activationDomain === "activator"
        ? "remodeller + p300/CBP + Mediator"
        : "HDAC/NuRD + corepressor";
      return {
        binds: accessible,
        opens: pioneer && input.chromatin === "closed",
        recruits,
        transcription: accessible && input.activationDomain === "activator" ? "licensed" : "repressed",
        reason: pioneer ? "DBD can engage nucleosomal DNA" : "ordinary DBD needs prior accessibility",
      };
    }
    if (input.kind === "grammar") {
      const rules = {
        enhanceosome: {
          spacingShuffle: 0.05, siteLoss: 0.05, interfaceBreak: 0.05,
          label: "rigid cooperative assembly", evidence: "single-base spacing changes can abolish output",
        },
        billboard: {
          spacingShuffle: 0.90, siteLoss: 0.68, interfaceBreak: 0.82,
          label: "roughly additive motif content", evidence: "site order can diverge while output persists",
        },
        collective: {
          spacingShuffle: 0.82, siteLoss: 0.74, interfaceBreak: 0.18,
          label: "co-occupancy through protein/chromatin context", evidence: "protein interface matters more than rigid motif grammar",
        },
      };
      const rule = rules[input.grammar];
      return {
        activity: input.perturbation === "none" ? 1 : rule[input.perturbation],
        label: rule.label,
        evidence: rule.evidence,
      };
    }
    if (input.kind === "burst") {
      const kon = input.baseKon * input.enhancerStrength;
      const ksyn = input.baseKsyn * input.promoterStrength;
      const onFraction = kon / (kon + input.koff);
      const burstSize = ksyn / input.koff;
      const mean = (ksyn / input.decay) * onFraction;
      return { kon, ksyn, onFraction, burstSize, mean };
    }
    if (input.kind === "assay") return Object.assign({}, ENHANCER_ASSAYS[input.assay]);
    throw new Error("Unknown enhancer-logic model");
  }
  models.enhancerLogic = enhancerLogicModel;

  /* Ch 23 — epigenetic memory ------------------------------------------ */

  const CHROMATIN_MARKS = {
    acetyl: { label: "histone acetylation", q: 0.55, r: 0, reader: "bromodomain", writer: "p300/CBP", loop: false, chemistry: "neutralises lysine charge; loosens histone–DNA contact" },
    k27: { label: "H3K27me3", q: 0.05, r: 0.25, reader: "EED", writer: "EZH2/PRC2", loop: true, chemistry: "reader recruitment; no charge change" },
    k9: { label: "H3K9me3", q: 0.03, r: 0.18, reader: "HP1", writer: "SUV39H1", loop: true, chemistry: "reader recruitment; no charge change" },
    methyl: { label: "CpG 5mC", q: 0.02, r: 0.20, reader: "UHRF1", writer: "DNMT1 + DNMT3", loop: true, chemistry: "symmetric CpG creates a strand-copying cue" },
    cenpa: { label: "CENP-A", q: 0.02, r: 0.12, reader: "centromere assembly network", writer: "HJURP deposition", loop: true, chemistry: "histone variant templates locus identity" },
  };

  function iterateMark(start, q, r, divisions) {
    let value = start;
    const trace = [{ x: 0, y: value }];
    for (let division = 1; division <= divisions; division += 1) {
      value = value * (1 - q) + (1 - value) * r;
      trace.push({ x: division, y: value });
    }
    return { value, trace };
  }

  function epigeneticMemoryModel(input) {
    if (input.kind === "mark") {
      const mark = CHROMATIN_MARKS[input.mark];
      const result = iterateMark(1, mark.q, input.feedback ? mark.r : 0, input.divisions);
      return Object.assign({}, mark, result, {
        strictEpigenetic: mark.loop && input.feedback,
        stationary: input.feedback && mark.r ? mark.r / (mark.r + mark.q) : 0,
      });
    }
    if (input.kind === "maintenance") {
      const result = iterateMark(input.start, input.q, input.r, input.divisions);
      return Object.assign({}, result, {
        stationary: input.r / (input.r + input.q),
        relaxation: 1 / (input.r + input.q),
      });
    }
    if (input.kind === "methylation") {
      const contexts = {
        promoter: {
          methylated: "lower expression", unmethylated: "promoter accessible",
          mechanism: "CTCF/TF occlusion plus methyl-CpG readers recruit repression",
        },
        geneBody: {
          methylated: "tracks active transcription", unmethylated: "more cryptic initiation risk",
          mechanism: "H3K36me3 recruits DNMT3B behind elongating Pol II",
        },
        germline: {
          methylated: "elevated C→T mutation pressure", unmethylated: "CpG protected from 5mC deamination",
          mechanism: "5mC deaminates to legitimate thymine, leaving an ambiguous G:T pair",
        },
      };
      const context = contexts[input.context];
      return {
        outcome: input.methylated ? context.methylated : context.unmethylated,
        mechanism: context.mechanism,
        copyState: input.methylated ? "symmetric → hemimethylated after replication" : "unmethylated on both strands",
        maintenance: input.methylated ? "UHRF1 recruits DNMT1 to the new strand" : "no parental methyl cue",
      };
    }
    if (input.kind === "imprinting") {
      const igf2Copies = Number(input.maternalMethylated) + Number(input.paternalMethylated);
      const h19Copies = Number(!input.maternalMethylated) + Number(!input.paternalMethylated);
      return {
        igf2Copies, h19Copies,
        maternal: input.maternalMethylated ? "paternalised: CTCF blocked" : "maternal: CTCF insulator bound",
        paternal: input.paternalMethylated ? "paternal: enhancers reach IGF2" : "maternalised: CTCF insulator bound",
        phenotype: igf2Copies === 2 ? "overgrowth tendency" : igf2Copies === 0 ? "growth restriction tendency" : "balanced parent-of-origin dosage",
      };
    }
    if (input.kind === "identity") {
      if (input.system === "cenpa") {
        return {
          carrier: "CENP-A nucleosomes", scale: "one centromere locus",
          propagated: "kinetochore-forming position", sequenceRequirement: "alpha satellite is not sufficient; neocentromeres prove it",
        };
      }
      return {
        carrier: "XIST coating plus layered chromatin lock", scale: "one X chromosome",
        propagated: "which X remains inactive in that clone", sequenceRequirement: "two homologous X chromosomes can take different stable states",
      };
    }
    if (input.kind === "reprogramming") {
      const firstUnexposed = input.exposure === "pregnantFemale" ? 3 : 2;
      return {
        firstUnexposed,
        testedGeneration: input.generation,
        transgenerational: input.generation >= firstUnexposed,
        directReason: input.exposure === "pregnantFemale"
          ? "F1 fetus and its F2 germ cells are both directly exposed"
          : "F0 sperm are exposed, making F2 the first unexposed generation",
      };
    }
    if (input.kind === "clock") {
      const rawAcceleration = input.predictedAge - input.chronologicalAge;
      return {
        rawAcceleration,
        adjustedAcceleration: rawAcceleration - input.cellCompositionShift,
        interpretation: "a regression residual, not a molecular ageing rate",
      };
    }
    throw new Error("Unknown epigenetic-memory model");
  }
  models.epigeneticMemory = epigeneticMemoryModel;

  /* Ch 24 — RNA regulation --------------------------------------------- */

  const RNA_GUIDES = {
    mirna: { label: "miRNA", guide: "seed nt 2–8", pairing: "partial; seed-dominant", job: "deadenylation, decay, buffering", biogenesis: "Drosha → Exportin-5 → Dicer → Argonaute", defaultLength: 7 },
    sirna: { label: "siRNA", guide: "~21 nt guide", pairing: "near-perfect", job: "AGO2 slicing", biogenesis: "long dsRNA → Dicer → AGO2", defaultLength: 21 },
    pirna: { label: "piRNA", guide: "24–32 nt", pairing: "transposon-derived guides", job: "germline transposon defense", biogenesis: "Dicer-independent clusters + ping-pong", defaultLength: 26 },
  };

  const LNC_PERTURBATIONS = {
    aso: { label: "ASO / RNAi", removesRNA: true, removesTranscription: false, removesDNA: false },
    crispri: { label: "CRISPRi", removesRNA: true, removesTranscription: true, removesDNA: false },
    polyA: { label: "early poly(A) cassette", removesRNA: true, removesTranscription: "partial", removesDNA: false },
    deletion: { label: "locus deletion", removesRNA: true, removesTranscription: true, removesDNA: true },
    rescue: { label: "RNA rescue in trans", removesRNA: false, removesTranscription: false, removesDNA: false },
  };

  function rnaRegulationModel(input) {
    if (input.kind === "guide") {
      const guide = RNA_GUIDES[input.family];
      const length = input.length || guide.defaultLength;
      const chanceMatches = input.searchSpace / 4 ** length;
      return Object.assign({}, guide, { length, chanceMatches });
    }
    if (input.kind === "mirnaStage") {
      const stages = [
        { name: "pri-miRNA", place: "nucleus", enzyme: "Pol II", product: "capped/polyadenylated hairpin transcript" },
        { name: "pre-miRNA", place: "nucleus", enzyme: "Drosha–DGCR8", product: "~60–70 nt hairpin" },
        { name: "duplex", place: "cytoplasm", enzyme: "Exportin-5 then Dicer", product: "~22 nt duplex with 2-nt 3′ overhangs" },
        { name: "RISC", place: "target mRNA", enzyme: "Argonaute + guide", product: "seed-directed repression" },
      ];
      return { stages, selected: stages[clamp(input.stage, 0, stages.length - 1)] };
    }
    if (input.kind === "lnc") {
      const perturbation = LNC_PERTURBATIONS[input.perturbation];
      let phenotype = false;
      if (input.perturbation === "rescue") phenotype = input.mechanism === "rna";
      else if (input.mechanism === "rna") phenotype = perturbation.removesRNA;
      else if (input.mechanism === "transcription") phenotype = Boolean(perturbation.removesTranscription);
      else phenotype = perturbation.removesDNA;
      return Object.assign({}, perturbation, {
        phenotype,
        conclusion: input.perturbation === "rescue"
          ? (phenotype ? "RNA molecule is sufficient in trans" : "no rescue: local transcription or DNA remains plausible")
          : (phenotype ? "the perturbation hits the causal layer" : "the causal layer remains intact"),
      });
    }
    if (input.kind === "crispr") {
      const self = input.target === "array";
      const guideMatch = input.mismatches <= 1;
      const pam = input.pamPresent;
      return {
        self, guideMatch, pam,
        interrogated: pam,
        cleavage: pam && guideMatch,
        outcome: pam && guideMatch ? (self ? "self target cleaved — autoimmunity" : "foreign target cleaved") : self && !pam
          ? "self spacer ignored" : pam ? "mismatch releases target" : "no PAM: sequence not interrogated",
      };
    }
    if (input.kind === "decay") {
      const remaining = 2 ** (-input.minutes / input.halfLife);
      return {
        remaining,
        responded: 1 - remaining,
        timeConstant: input.halfLife / Math.log(2),
      };
    }
    if (input.kind === "atf4") {
      const stressed = input.stress !== "none";
      const kinase = { none: "none", er: "PERK", viral: "PKR", amino: "GCN2", heme: "HRI" }[input.stress];
      return {
        kinase,
        eif2Phosphorylated: stressed,
        ternaryComplex: stressed ? "scarce" : "plentiful",
        uorf2: stressed ? "skipped before reacquisition" : "translated",
        globalTranslation: stressed ? 0.2 : 1,
        atf4Translation: stressed ? 1 : 0.1,
      };
    }
    throw new Error("Unknown RNA-regulation model");
  }
  models.rnaRegulation = rnaRegulationModel;

  /* Ch 25 — network dynamics ------------------------------------------- */

  function simulateFeedback(input) {
    const dt = 0.025;
    const steps = 320;
    let x = input.initial;
    const trace = [{ x: 0, y: x }];
    for (let index = 1; index <= steps; index += 1) {
      let production;
      if (input.feedback === "none") production = 0.8;
      else if (input.feedback === "negative") production = 2.4 / (1 + (x / 0.65) ** 2);
      else production = 0.015 + input.signal + 1.45 * x ** input.n / (0.55 ** input.n + x ** input.n);
      x = clamp(x + dt * (production - x), 0, 2.2);
      if (index % 16 === 0) trace.push({ x: index * dt, y: x });
    }
    return { final: x, trace };
  }

  function networkDynamicsModel(input) {
    if (input.kind === "feedback") {
      const low = simulateFeedback(Object.assign({}, input, { initial: 0.01 }));
      const high = simulateFeedback(Object.assign({}, input, { initial: 1.8 }));
      return {
        selected: input.initialState === "high" ? high : low,
        lowFinal: low.final,
        highFinal: high.final,
        memory: Math.abs(low.final - high.final) > 0.35,
      };
    }
    if (input.kind === "ffl") {
      const points = [];
      let y = 0;
      let z = 0;
      const dt = 0.1;
      for (let index = 0; index <= 100; index += 1) {
        const time = index * dt;
        const x = time <= input.pulse ? 1 : 0;
        y += dt * (x - y) / 1.5;
        const target = input.loop === "coherent"
          ? (x > 0.5 && y > 0.55 ? 1 : 0)
          : x * (1 - clamp(y, 0, 1));
        z += dt * (target - z) / 0.35;
        points.push({ x: time, input: x, intermediate: y, output: z });
      }
      return {
        points,
        peak: Math.max(...points.map((point) => point.output)),
        final: points[points.length - 1].output,
        behavior: input.loop === "coherent" ? "persistence detector" : "pulse generator",
      };
    }
    if (input.kind === "stateMachine") {
      if (input.circuit === "toggle") {
        return {
          circuit: "mutual repression",
          state: input.pulse === "x" ? "X high · Y low" : input.pulse === "y" ? "X low · Y high" : "history retained",
          behavior: "two mutually exclusive stable states",
          requirement: "cooperative repression keeps either winner self-consistent",
        };
      }
      return {
        circuit: "delayed negative feedback",
        state: "repeating high → low → high",
        behavior: "limit-cycle oscillation",
        requirement: "delay + nonlinearity; estimated period " + (3 * input.delay).toFixed(1) + " time units",
      };
    }
    if (input.kind === "pattern") {
      const cells = Array.from({ length: 25 }, (_, index) => {
        const position = index / 24;
        const bicoid = Math.exp(-position / input.lambda);
        const hunchback = bicoid > 0.28 ? 1 : bicoid / 0.28;
        // For the stripe-2 enhancer, the relevant Giant input is its anterior
        // domain edge. Model that edge directly rather than as a symmetric
        // Gaussian, which would incorrectly create a second permissive window
        // at the anterior pole.
        const giant = 1 / (1 + Math.exp((position - 0.32) / 0.035));
        // Likewise, show the anterior edge of the central Krüppel domain: the
        // two facing repressor edges bound this enhancer's one stripe rather
        // than accidentally implying that one enhancer makes two stripes.
        const kruppel = 1 / (1 + Math.exp(-(position - 0.44) / 0.035));
        const stripe = bicoid > 0.24 && hunchback > 0.72 && giant < 0.42 && kruppel < 0.35;
        return { position, bicoid, hunchback, giant, kruppel, stripe };
      });
      return { cells, stripeCells: cells.filter((cell) => cell.stripe).length };
    }
    if (input.kind === "hox") {
      if (input.perturbation === "loss") {
        return { source: "posterior segment", destination: "more anterior identity", meaning: "identity selector lost; structure-building programme remains" };
      }
      if (input.perturbation === "ectopic") {
        return { source: "anterior segment", destination: "more posterior identity", meaning: "ectopic selector reroutes an existing structural programme" };
      }
      return { source: "ordered Hox domain", destination: "matched segment identity", meaning: "3′→5′ cluster order tracks anterior→posterior expression" };
    }
    if (input.kind === "attractor") {
      const drive = input.forcedFactors / 4;
      const barrier = input.barrier / 100;
      const probability = clamp(0.002 + drive ** 4 * (1 - barrier) * 0.18, 0, 1);
      return {
        probability,
        state: input.forcedFactors === 4 && probability > 0.01 ? "rare escape toward pluripotency" : "fibroblast attractor retained",
        genome: "unchanged and complete",
      };
    }
    if (input.kind === "buffer") {
      const redundant = input.shadowEnhancer;
      const stress = input.stress / 100;
      const coreLoss = input.variant === "coding" ? 0.8 : 0.32;
      const bufferedLoss = redundant ? coreLoss * stress : coreLoss;
      return {
        phenotypeLoss: clamp(bufferedLoss, 0, 1),
        pleiotropy: input.variant === "coding" ? "many tissues" : "one enhancer domain",
        hidden: redundant && stress < 0.25,
      };
    }
    throw new Error("Unknown network-dynamics model");
  }
  models.networkDynamics = networkDynamicsModel;

  /* Ch 25A — developmental genetics ------------------------------------ */

  const DEFECT_CLASSES = {
    gap: { label: "gap", geometry: "contiguous segment block missing", periodicity: "broad aperiodic domain", tier: "gap-gene tier" },
    pairRule: { label: "pair-rule", geometry: "alternate segments missing", periodicity: "two-segment periodicity", tier: "seven-stripe pair-rule tier" },
    polarity: { label: "segment polarity", geometry: "part of every segment missing or mirrored", periodicity: "one-segment periodicity", tier: "14-stripe boundary-maintenance tier" },
  };

  const GERM_LAYER_FIXTURES = {
    epidermis: { layer: "ectoderm", route: "surface ectoderm", note: "epidermis and appendages" },
    neuron: { layer: "ectoderm", route: "neural plate", note: "central nervous system" },
    heart: { layer: "mesoderm", route: "lateral plate mesoderm", note: "muscle and vasculature" },
    liver: { layer: "endoderm", route: "foregut endoderm", note: "gut-tube outgrowth" },
    melanocyte: { layer: "ectoderm", route: "neural crest", note: "migratory pigment lineage" },
    cranialBone: { layer: "ectoderm", route: "cranial neural crest", note: "bone tissue with ectodermal ancestry" },
    entericNeuron: { layer: "ectoderm", route: "vagal neural crest", note: "colon innervation" },
  };

  function developmentalGeneticsModel(input) {
    if (input.kind === "fate") {
      const positional = input.logic === "position";
      return {
        afterAblation: positional ? "neighbours repattern and fill the gap" : "that precursor's descendants are missing",
        afterTransplant: positional ? "adopts the destination fate" : "retains the inherited fate",
        scaling: positional ? "cell number per band scales with field size" : "fixed lineage yields fixed cell count",
        tradeoff: positional ? "error correction, but thresholds need sharpening" : "precision, but little repair after cell loss",
      };
    }
    if (input.kind === "origin") return Object.assign({}, GERM_LAYER_FIXTURES[input.tissue]);
    if (input.kind === "screen") return Object.assign({}, DEFECT_CLASSES[input.defect]);
    if (input.kind === "homeosis") {
      return input.perturbation === "loss"
        ? { transformation: "posterior → anterior", inference: "anterior identity is the default when selector function is lost" }
        : { transformation: "anterior → posterior", inference: "ectopic selector reroutes an already-present programme" };
    }
    if (input.kind === "epistasis") {
      const valid = input.alleles === "clamps" && input.phenotypes === "opposite" && input.relationship === "same";
      const epistatic = input.pathway === "switch" ? "downstream mutation" : "upstream mutation";
      return {
        valid,
        epistatic: valid ? epistatic : "not interpretable",
        doublePhenotype: valid
          ? (input.pathway === "switch" ? input.downstreamPhenotype : input.upstreamPhenotype)
          : "ambiguous",
        rule: input.pathway === "switch" ? "last clamp wins (argmax)" : "earliest block wins (argmin)",
      };
    }
    if (input.kind === "targeting") {
      const events = {
        none: { neo: false, tk: false, g418: false, ganciclovir: true, survivesBoth: false, result: "no DNA uptake" },
        correct: { neo: true, tk: false, g418: true, ganciclovir: true, survivesBoth: true, result: "homologous targeting candidate" },
        random: { neo: true, tk: true, g418: true, ganciclovir: false, survivesBoth: false, result: "random integration killed by negative selection" },
      };
      return Object.assign({}, events[input.event]);
    }
    if (input.kind === "conditional") {
      const active = input.driver && (!input.inducible || input.tamoxifen);
      const excision = input.orientation === "same";
      return {
        active,
        dnaOutcome: !active ? "floxed allele remains functional" : excision ? "intervening DNA excised" : "intervening DNA inverted",
        spatial: input.driver ? input.tissue : "no Cre-expressing lineage",
        temporal: input.inducible ? (input.tamoxifen ? "tamoxifen pulse" : "waiting for tamoxifen") : "driver onset",
        descendants: active ? "change inherited permanently by descendants" : "no lineage mark",
        mosaic: active ? "expect incomplete recombination; measure with a reporter" : "none generated",
      };
    }
    throw new Error("Unknown developmental-genetics model");
  }
  models.developmentalGenetics = developmentalGeneticsModel;

  /* Lab views and registrations ---------------------------------------- */

  function lacGateVisual(el, result, lactose, glucose) {
    const board = el("div", { class: "reg-stack" });
    board.append(processBoard(el, [
      { label: "lactose input", value: lactose ? "present" : "absent", tone: lactose ? "active" : "muted" },
      { label: "operator arm", value: result.lacI, tone: result.operatorFree > 0.5 ? "active" : "blocked" },
      { label: "glucose input", value: glucose ? "present" : "absent", tone: glucose ? "blocked" : "active" },
      { label: "promoter arm", value: result.crp, tone: result.crpOccupied > 0.5 ? "active" : "muted" },
      { label: "lacZYA rate", value: percent(result.rate, 2), tone: result.rate > 0.5 ? "active" : "muted" },
    ], "The lac gate integrates operator freedom and CRP recruitment"));
    board.append(barBoard(el, [
      { label: "operator free", value: result.operatorFree, display: percent(result.operatorFree, 1), tone: "active" },
      { label: "CRP occupied", value: result.crpOccupied, display: percent(result.crpOccupied, 1) },
      { label: "normalised firing", value: result.rate, display: percent(result.rate, 2), tone: result.rate > 0.5 ? "active" : "muted" },
    ], "Multiplicative lac promoter occupancies", 1));
    return board;
  }

  function merodiploidVisual(el, result) {
    const rows = result.copies.map((copy) => ({
      label: copy.name,
      cells: [
        { value: "I" + copy.I }, { value: "P" + copy.P }, { value: "O" + copy.O },
        { value: "Z" + copy.Z }, { value: "Y" + copy.Y },
        { value: copy.transcribed ? "transcribed" : "silent", tone: copy.transcribed ? "active" : "blocked" },
      ],
    }));
    const board = el("div", { class: "reg-stack" });
    board.append(matrixBoard(el, ["repressor", "promoter", "operator", "β-gal", "permease", "copy output"], rows,
      "Each cis element is evaluated on its own operon after pooling trans-acting repressors"));
    board.append(statusStrip(el, [
      { label: "shared trans pool", value: result.pool, tone: result.pool === "superrepressor" ? "blocked" : "active" },
      { label: "β-galactosidase", value: result.betaGal ? "present" : "absent", tone: result.betaGal ? "active" : "muted" },
      { label: "permease", value: result.permease ? "present" : "absent", tone: result.permease ? "active" : "muted" },
    ], "Merodiploid phenotype"));
    return board;
  }

  define("operon-circuit-lab", {
    "ch21-o1": "Lac gate and merodiploid states predict expression for sugar combinations and partial diploids, including basal bootstrap",
    "ch21-o2": "Lac gate exposes the analogue occupancy product underneath the approximate lactose AND NOT glucose truth table",
    "ch21-o3": "Merodiploid copy lanes pool trans products before evaluating promoter and operator states in cis",
    "ch21-o4": "Attenuation states place the ribosome on the nascent leader and remove the mechanism in a eukaryotic compartment",
    "ch21-o5": "Lac, trp, and riboswitch states separate regulator sign from inducible or repressible response",
    "ch21-o6": "System mode traces sigma competition, His-to-Asp relays, quorum feedback, and signal-free phase variation",
    "ch21-o7": "System mode compares control point, response time, measured quantity, and failure mode across bacterial strategies",
  }, function (api) {
    const { body, el, stat, predict } = api;
    const parts = labParts(el);
    let mode = "logic";
    let logicView = "gate";
    let lactose = false;
    let glucose = true;
    let fixture = "wild";
    let inducer = false;
    let couplingView = "attenuation";
    let tryptophan = "scarce";
    let context = "bacterium";
    let platform = "terminator";
    let ligand = false;
    let system = "sigma";
    let signal = 55;

    function render() {
      parts.tabHost.replaceChildren(tabs(el, [
        { label: "Lac logic", value: "logic" },
        { label: "Coupled sensing", value: "coupling" },
        { label: "System controllers", value: "systems" },
      ], mode, (value) => { mode = value; render(); }));

      if (mode === "logic") {
        const subTabs = el("div", { class: "lab-control-block compact-submode" }, [
          el("span", { class: "lab-control-label", text: "Bench" }),
          choiceRow(el, [
            { label: "Sugar gate", value: "gate" },
            { label: "Merodiploid", value: "merodiploid" },
          ], logicView, (value) => { logicView = value; render(); }, "Lac logic bench"),
        ]);
        if (logicView === "gate") {
          const result = operonCircuitModel({ kind: "lac", lactose, glucose });
          parts.visual.replaceChildren(lacGateVisual(el, result, lactose, glucose));
          parts.controls.replaceChildren(subTabs,
            el("div", { class: "lab-control-block" }, [
              el("span", { class: "lab-control-label", text: "Lactose" }),
              choiceRow(el, [
                { label: "Absent", value: false }, { label: "Present", value: true },
              ], lactose, (value) => { lactose = value; render(); }, "Lactose availability"),
            ]),
            el("div", { class: "lab-control-block" }, [
              el("span", { class: "lab-control-label", text: "Glucose" }),
              choiceRow(el, [
                { label: "Absent", value: false }, { label: "Present", value: true },
              ], glucose, (value) => { glucose = value; render(); }, "Glucose availability"),
            ]),
            el("div", { class: "readout" }, [
              stat(percent(result.operatorFree, 1), "operator free"),
              stat(percent(result.crpOccupied, 1), "CRP occupied"),
              stat(percent(result.rate, 2), "normalised expression"),
            ])
          );
          parts.rail.replaceChildren(causalRail(el, [
            { key: "you changed", value: (lactose ? "+ lactose" : "− lactose") + " · " + (glucose ? "+ glucose" : "− glucose") },
            { key: "mechanism", value: "operator freedom × CRP recruitment" },
            { key: "observable", value: percent(result.rate, 2) + " maximum lacZYA firing" },
          ]));
          parts.explanation.className = "callout " + (result.rate > 0.5 ? "callout-good" : "");
          parts.explanation.innerHTML = "<strong>The AND gate is an approximation to two occupancies multiplying.</strong> " + result.bootstrap + ". Glucose acts through transport, cAMP–CRP, and inducer exclusion; it does not bind the lac operon.";
          return;
        }

        const result = operonCircuitModel({ kind: "merodiploid", fixture, inducer });
        parts.visual.replaceChildren(merodiploidVisual(el, result));
        parts.controls.replaceChildren(subTabs,
          el("div", { class: "lab-control-block" }, [
            el("span", { class: "lab-control-label", text: "Partial-diploid fixture" }),
            choiceRow(el, [
              { label: "Wild type", value: "wild" },
              { label: "I− rescued", value: "transRescue" },
              { label: "Oᶜ visible", value: "cisVisible" },
              { label: "Oᶜ hidden from Z", value: "cisHidden" },
              { label: "Iˢ superrepressor", value: "super" },
              { label: "Worked trap", value: "worked" },
            ], fixture, (value) => { fixture = value; render(); }, "Merodiploid genotype fixture"),
          ]),
          el("div", { class: "lab-control-block" }, [
            el("span", { class: "lab-control-label", text: "Inducer" }),
            choiceRow(el, [
              { label: "Absent", value: false }, { label: "Present", value: true },
            ], inducer, (value) => { inducer = value; render(); }, "Inducer state"),
          ]),
          el("div", { class: "readout" }, [
            stat(result.pool, "pooled trans state"),
            stat(result.betaGal ? "present" : "absent", "β-galactosidase"),
            stat(result.permease ? "present" : "absent", "permease"),
          ])
        );
        parts.rail.replaceChildren(causalRail(el, [
          { key: "you changed", value: fixture + " · inducer " + (inducer ? "present" : "absent") },
          { key: "mechanism", value: "pool I products; evaluate P and O on each copy" },
          { key: "observable", value: "Z " + (result.betaGal ? "+" : "−") + " · Y " + (result.permease ? "+" : "−") },
        ]));
        parts.explanation.className = "callout";
        parts.explanation.innerHTML = "<strong>A cis mutation never reaches across to the other DNA molecule.</strong> The reporter can hide Oᶜ if the structural gene on that same copy is dead, so one enzyme assay does not uniquely identify the genotype.";
        return;
      }

      if (mode === "coupling") {
        const subTabs = el("div", { class: "lab-control-block compact-submode" }, [
          el("span", { class: "lab-control-label", text: "Sensor architecture" }),
          choiceRow(el, [
            { label: "trp attenuation", value: "attenuation" },
            { label: "Riboswitch", value: "riboswitch" },
          ], couplingView, (value) => { couplingView = value; render(); }, "Coupled sensor architecture"),
        ]);
        if (couplingView === "attenuation") {
          const result = operonCircuitModel({ kind: "attenuation", tryptophan, context });
          parts.visual.replaceChildren(processBoard(el, [
            { label: "charged tRNA-Trp", value: tryptophan === "scarce" ? "scarce" : tryptophan === "plentiful" ? "plentiful" : "not read", tone: tryptophan === "scarce" ? "blocked" : "active" },
            { label: "leader ribosome", value: result.ribosome, tone: context === "eukaryote" ? "muted" : "active" },
            { label: "RNA fold", value: result.fold },
            { label: "polymerase", value: result.transcript, tone: /transcribed/.test(result.transcript) ? "active" : "blocked" },
          ], "Tryptophan availability is measured by translation of the nascent leader"));
          parts.controls.replaceChildren(subTabs,
            el("div", { class: "lab-control-block" }, [
              el("span", { class: "lab-control-label", text: "Charged tRNA-Trp state" }),
              choiceRow(el, [
                { label: "Plentiful", value: "plentiful" },
                { label: "Scarce", value: "scarce" },
                { label: "No ribosome", value: "none" },
              ], tryptophan, (value) => { tryptophan = value; render(); }, "Tryptophan attenuation state"),
            ]),
            el("div", { class: "lab-control-block" }, [
              el("span", { class: "lab-control-label", text: "Compartment architecture" }),
              choiceRow(el, [
                { label: "Bacterium", value: "bacterium" },
                { label: "Eukaryote", value: "eukaryote" },
              ], context, (value) => { context = value; render(); }, "Cellular compartment architecture"),
            ]),
            el("div", { class: "readout" }, [
              stat(result.fold, "leader structure"),
              stat(result.transcript, "trp operon"),
            ])
          );
          parts.rail.replaceChildren(causalRail(el, [
            { key: "you changed", value: tryptophan + " · " + context },
            { key: "mechanism", value: result.ribosome + " → " + result.fold },
            { key: "observable", value: result.transcript },
          ]));
          parts.explanation.className = "callout " + (/transcribed/.test(result.transcript) ? "callout-good" : "");
          parts.explanation.innerHTML = "<strong>Attenuation asks whether a ribosome stalls while RNA polymerase is still nearby.</strong> " + result.reason + ". The nuclear envelope removes that ribosome-coupled mechanism from eukaryotes.";
          return;
        }

        const result = operonCircuitModel({ kind: "riboswitch", platform, ligand });
        parts.visual.replaceChildren(processBoard(el, [
          { label: "metabolite", value: ligand ? "bound to aptamer" : "absent", tone: ligand ? "active" : "muted" },
          { label: "mutually exclusive fold", value: result.fold },
          { label: "control point", value: result.output },
          { label: "expression", value: result.expression, tone: result.expression === "higher" ? "active" : "blocked" },
        ], "A cis RNA aptamer converts ligand occupancy into an expression-platform fold"));
        parts.controls.replaceChildren(subTabs,
          el("div", { class: "lab-control-block" }, [
            el("span", { class: "lab-control-label", text: "Expression platform" }),
            choiceRow(el, [
              { label: "Terminator", value: "terminator" },
              { label: "SD hairpin", value: "translation" },
              { label: "glmS ribozyme", value: "ribozyme" },
            ], platform, (value) => { platform = value; render(); }, "Riboswitch expression platform"),
          ]),
          el("div", { class: "lab-control-block" }, [
            el("span", { class: "lab-control-label", text: "Ligand" }),
            choiceRow(el, [
              { label: "Absent", value: false }, { label: "Bound", value: true },
            ], ligand, (value) => { ligand = value; render(); }, "Riboswitch ligand state"),
          ]),
          el("div", { class: "readout" }, [
            stat(result.output, "controlled level"),
            stat(result.expression, "expression"),
            stat("cis RNA", "sensor location"),
          ])
        );
        parts.rail.replaceChildren(causalRail(el, [
          { key: "you changed", value: platform + " · ligand " + (ligand ? "bound" : "absent") },
          { key: "mechanism", value: result.fold },
          { key: "observable", value: result.expression + " " + result.output },
        ]));
        parts.explanation.className = "callout";
        parts.explanation.innerHTML = "<strong>The aptamer is the sensor and the expression platform is the actuator.</strong> " + result.cis + "; the metabolite acts in trans.";
        return;
      }

      const result = operonCircuitModel({ kind: "system", system, signal });
      parts.visual.replaceChildren(processBoard(el, [
        { label: "input", value: result.sensor, tone: signal > 0 ? "active" : "muted" },
        { label: "interface", value: result.relay },
        { label: "actuator", value: result.output },
        { label: "what is measured", value: result.measurement, tone: system === "phase" ? "muted" : "active" },
      ], result.label + " regulatory path"));
      parts.controls.replaceChildren(
        el("div", { class: "lab-control-block" }, [
          el("span", { class: "lab-control-label", text: "Controller" }),
          choiceRow(el, [
            { label: "σ factor", value: "sigma" },
            { label: "His→Asp relay", value: "twoComponent" },
            { label: "Quorum loop", value: "quorum" },
            { label: "Phase variation", value: "phase" },
          ], system, (value) => { system = value; render(); }, "Bacterial system controller"),
        ]),
        rangeControl(el, "Input strength", signal, {
          min: 0, max: 100, step: 5, format: (value) => value + "%",
        }, (value) => { signal = value; render(); }),
        el("div", { class: "readout" }, [
          stat(result.timescale, "response time"),
          stat(percent(result.activity, 0), "output activity"),
          stat(result.output, "scope"),
        ])
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "you changed", value: result.label + " · input " + signal + "%" },
        { key: "mechanism", value: result.relay },
        { key: "observable", value: result.output + " at " + percent(result.activity, 0) },
      ]));
      parts.explanation.className = "callout";
      parts.explanation.innerHTML = system === "phase"
        ? "<strong>This controller deliberately ignores the current environment.</strong> Blind DNA switching creates a heritable minority state before selection arrives; it is bet hedging, not directed mutation."
        : "<strong>Ask what the sensor physically measures.</strong> Quorum autoinducer confounds density with confinement, while the heat-shock loop can measure unmet chaperone demand rather than temperature itself.";
    }

    predict(body, {
      widget: "operon-circuit-lab",
      question: "Lactose is present and glucose is absent. Which combination makes lacZYA strongly expressed?",
      hint: "The operator must be mostly free and CRP–cAMP must recruit polymerase.",
      options: [
        { label: "LacI bound; CRP absent" },
        { label: "LacI released; CRP–cAMP bound", correct: true },
        { label: "LacI bound; CRP–cAMP bound" },
        { label: "LacI released; CRP absent" },
      ],
    }, () => {
      mode = "logic";
      logicView = "gate";
      lactose = true;
      glucose = false;
      parts.instrument.hidden = false;
      render();
    });
    finishLab(parts, body);
  });

  function enhancerDomainSvg(result, boundaryIntact, orientation, rangeExtender) {
    const aWeight = Math.max(1.5, result.contactA * 10).toFixed(2);
    const bWeight = Math.max(1.5, result.contactB * 10).toFixed(2);
    const aOpacity = clamp(0.2 + result.contactA, 0.2, 1).toFixed(2);
    const bOpacity = clamp(0.2 + result.contactB, 0.2, 1).toFixed(2);
    return textSvg(
      '<text class="lab-svg-kicker" x="260" y="30" text-anchor="middle">CONTACT OPPORTUNITY, NOT TARGET PROOF</text>' +
      '<path class="reg-locus-axis" d="M42 164 L486 164"/>' +
      '<path class="reg-contact is-a" style="stroke-width:' + aWeight + ';opacity:' + aOpacity + '" d="M250 145 Q205 62 160 145"/>' +
      '<path class="reg-contact is-b" style="stroke-width:' + bWeight + ';opacity:' + bOpacity + '" d="M250 145 Q350 32 450 145"/>' +
      '<g class="reg-locus-mark"><rect x="137" y="145" width="46" height="38" rx="4"/><text x="160" y="202" text-anchor="middle">gene A</text><text class="lab-svg-label" x="160" y="226" text-anchor="middle"><tspan x="160">nearest</tspan><tspan x="160" dy="24">90 kb</tspan></text></g>' +
      '<g class="reg-enhancer-mark"><path d="M232 164 L250 142 L268 164 L250 186 Z"/><text x="250" y="286" text-anchor="middle">enhancer ' + (orientation === "forward" ? "→" : "←") + '</text><text class="lab-svg-label" x="250" y="310" text-anchor="middle">' + (rangeExtender ? "+ REX" : "native range") + '</text></g>' +
      '<g class="reg-locus-mark"><rect x="427" y="145" width="46" height="38" rx="4"/><text x="450" y="202" text-anchor="middle">gene B</text><text class="lab-svg-label" x="450" y="226" text-anchor="middle"><tspan x="450">farther</tspan><tspan x="450" dy="24">200 kb</tspan></text></g>' +
      '<g class="reg-boundary' + (boundaryIntact ? " is-active" : " is-open") + '"><path d="M205 128 L205 187"/><text class="lab-svg-label" x="205" y="114" text-anchor="middle">' + (boundaryIntact ? "CTCF boundary" : "boundary deleted") + '</text></g>' +
      '<text class="reg-domain-verdict" x="260" y="350" text-anchor="middle">favoured contact: ' + result.target + '</text>',
      "An enhancer contacts gene A with relative opportunity " + result.contactA.toFixed(2) +
        " and gene B with relative opportunity " + result.contactB.toFixed(2) +
        ". The favoured contact is " + result.target + ".",
      "0 0 520 368", "enhancer-domain-diagram"
    );
  }

  function burstBoard(el, result) {
    const board = el("div", {
      class: "reg-burst-board",
      role: "img",
      "aria-label": "Transcriptional bursts. ON fraction " + percent(result.onFraction, 1) +
        ", burst size " + result.burstSize.toFixed(1) + ", mean RNA " + result.mean.toFixed(1) + ".",
    });
    const track = el("div", { class: "reg-burst-track", "aria-hidden": "true" });
    const activeBins = Math.max(1, Math.round(result.onFraction * 20));
    for (let index = 0; index < 20; index += 1) {
      track.append(el("span", {
        class: "reg-burst-bin" + (index % Math.max(2, Math.round(20 / activeBins)) === 0 ? " is-on" : ""),
        style: "--burst-height:" + Math.max(10, Math.min(100, result.burstSize * 12 + (index % 3) * 9)) + "%",
      }));
    }
    board.append(el("span", { class: "reg-burst-label", text: "single-allele firing record" }), track);
    board.append(statusStrip(el, [
      { label: "burst frequency k_on", value: result.kon.toFixed(2), tone: "active" },
      { label: "burst size k_syn/k_off", value: result.burstSize.toFixed(1) },
      { label: "steady mean", value: result.mean.toFixed(1) + " RNA" },
    ], "Burst parameters"));
    return board;
  }

  define("enhancer-logic-lab", {
    "ch22-o1": "Specificity mode contrasts default-closed chromatin with an accessible promoter and shows the cost and benefit of that default",
    "ch22-o2": "Domain mode changes enhancer orientation, boundary state, and range support while keeping nearest gene and favoured contact separate",
    "ch22-o3": "Module mode swaps ordinary and pioneer DNA-binding domains independently of activation or repression domains",
    "ch22-o4": "Motif funnel calculates genome-wide chance matches and applies partner-motif and accessibility filters multiplicatively",
    "ch22-o5": "Grammar mode applies spacing, site, and protein-interface perturbations to enhanceosome, billboard, and collective models",
    "ch22-o6": "Burst mode independently changes enhancer-driven frequency and promoter-driven burst size and exposes the bulk mean",
    "ch22-o7": "Assay mode separates occupancy, contact, sufficiency, and necessity and names the unsupported inference for each",
  }, function (api) {
    const { body, el, stat, predict } = api;
    const parts = labParts(el);
    let mode = "domain";
    let boundaryIntact = true;
    let orientation = "forward";
    let rangeExtender = false;
    let specificityView = "funnel";
    let bits = 10;
    let partners = 3;
    let accessibleFraction = 0.015;
    let factor = "ordinary";
    let chromatin = "closed";
    let activationDomain = "activator";
    let evidenceView = "grammar";
    let grammar = "enhanceosome";
    let perturbation = "spacingShuffle";
    let enhancerStrength = 1;
    let promoterStrength = 1;
    let assay = "reporter";

    function render() {
      parts.tabHost.replaceChildren(tabs(el, [
        { label: "Distance & domains", value: "domain" },
        { label: "Specificity filters", value: "specificity" },
        { label: "Grammar & evidence", value: "evidence" },
      ], mode, (value) => { mode = value; render(); }));

      if (mode === "domain") {
        const result = enhancerLogicModel({ kind: "domain", boundaryIntact, orientation, rangeExtender });
        parts.visual.innerHTML = enhancerDomainSvg(result, boundaryIntact, orientation, rangeExtender);
        parts.controls.replaceChildren(
          el("div", { class: "lab-control-block" }, [
            el("span", { class: "lab-control-label", text: "Enhancer orientation" }),
            choiceRow(el, [
              { label: "Forward →", value: "forward" },
              { label: "Reverse ←", value: "reverse" },
            ], orientation, (value) => { orientation = value; render(); }, "Enhancer orientation"),
          ]),
          el("div", { class: "lab-control-block" }, [
            el("span", { class: "lab-control-label", text: "Domain boundary" }),
            choiceRow(el, [
              { label: "Intact", value: true },
              { label: "Deleted", value: false },
            ], boundaryIntact, (value) => { boundaryIntact = value; render(); }, "Enhancer domain boundary"),
          ]),
          el("div", { class: "lab-control-block" }, [
            el("span", { class: "lab-control-label", text: "Range support" }),
            choiceRow(el, [
              { label: "Native", value: false },
              { label: "+ range extender", value: true },
            ], rangeExtender, (value) => { rangeExtender = value; render(); }, "Enhancer range support"),
          ]),
          el("div", { class: "readout" }, [
            stat(result.target, "favoured contact"),
            stat(result.orientationEffect, "orientation effect"),
            stat(result.caveat, "inference boundary"),
          ])
        );
        parts.rail.replaceChildren(causalRail(el, [
          { key: "you changed", value: (boundaryIntact ? "intact boundary" : "deleted boundary") + " · " + orientation + (rangeExtender ? " · +REX" : "") },
          { key: "mechanism", value: "3D contact opportunity is constrained by domain and range" },
          { key: "observable", value: result.target + " has the stronger contact opportunity" },
        ]));
        parts.explanation.className = "callout";
        parts.explanation.innerHTML = "<strong>Looping solves distance, not specificity.</strong> Orientation leaves enhancer activity unchanged; a boundary changes the search space, and a range extender can change how far an enhancer acts. None of those facts alone proves its target promoter.";
        return;
      }

      if (mode === "specificity") {
        const subTabs = el("div", { class: "lab-control-block compact-submode" }, [
          el("span", { class: "lab-control-label", text: "Specificity problem" }),
          choiceRow(el, [
            { label: "Motif funnel", value: "funnel" },
            { label: "TF modules", value: "modules" },
          ], specificityView, (value) => { specificityView = value; render(); }, "Enhancer specificity view"),
        ]);
        if (specificityView === "funnel") {
          const result = enhancerLogicModel({ kind: "motif", bits, partners, accessibleFraction, windowBp: 300 });
          const maximum = Math.max(result.motifHits, result.combined, result.accessible);
          parts.visual.replaceChildren(barBoard(el, [
            { label: "motif matches", value: result.motifHits, display: result.motifHits.toExponential(2), tone: "muted" },
            { label: partners + " motifs / 300 bp", value: result.combined, display: result.combined.toExponential(2) },
            { label: "+ accessible chromatin", value: result.accessible, display: result.accessible.toExponential(2), tone: "active" },
          ], "Candidate regulatory elements after motif, combinatorial, and chromatin filters", maximum));
          parts.controls.replaceChildren(subTabs,
            rangeControl(el, "Motif information", bits, {
              min: 8, max: 15, step: 1, format: (value) => value + " bits",
            }, (value) => { bits = value; render(); }),
            rangeControl(el, "Required partner motifs", partners, {
              min: 1, max: 4, step: 1, format: (value) => String(value),
            }, (value) => { partners = value; render(); }),
            el("div", { class: "lab-control-block" }, [
              el("span", { class: "lab-control-label", text: "Accessible genome" }),
              choiceRow(el, [
                { label: "All DNA", value: 1 },
                { label: "15%", value: 0.15 },
                { label: "1.5%", value: 0.015 },
              ], accessibleFraction, (value) => { accessibleFraction = value; render(); }, "Accessible genome fraction"),
            ]),
            el("div", { class: "readout" }, [
              stat(result.motifHits.toExponential(2), "single-motif matches"),
              stat(result.combined.toExponential(2), "after combinatorics"),
              stat(result.accessible.toExponential(2), "after accessibility"),
            ])
          );
          parts.rail.replaceChildren(causalRail(el, [
            { key: "you changed", value: bits + " bits · " + partners + " motifs · " + percent(accessibleFraction, 1) + " open" },
            { key: "mechanism", value: "chance matches × partner requirement × chromatin access" },
            { key: "observable", value: result.accessible.toExponential(2) + " candidates remain" },
          ]));
          parts.explanation.className = "callout";
          parts.explanation.innerHTML = "<strong>A motif is a weak prior, not a functional site.</strong> The filters are a teaching approximation and not independent, but the order-of-magnitude result is the point: default-closed chromatin does most of the specificity work.";
          return;
        }

        const result = enhancerLogicModel({ kind: "module", factor, chromatin, activationDomain });
        parts.visual.replaceChildren(processBoard(el, [
          { label: "DNA-binding module", value: factor === "pioneer" ? "pioneer DBD" : "ordinary DBD", tone: result.binds ? "active" : "blocked" },
          { label: "substrate", value: chromatin + " chromatin" },
          { label: "recruited machinery", value: result.recruits },
          { label: "promoter", value: result.transcription, tone: result.transcription === "licensed" ? "active" : "blocked" },
        ], "DNA recognition and regulatory recruitment are separable transcription-factor modules"));
        parts.controls.replaceChildren(subTabs,
          el("div", { class: "lab-control-block" }, [
            el("span", { class: "lab-control-label", text: "DNA-binding domain" }),
            choiceRow(el, [
              { label: "Ordinary TF", value: "ordinary" },
              { label: "Pioneer TF", value: "pioneer" },
            ], factor, (value) => { factor = value; render(); }, "Transcription factor DNA-binding mode"),
          ]),
          el("div", { class: "lab-control-block" }, [
            el("span", { class: "lab-control-label", text: "Chromatin" }),
            choiceRow(el, [
              { label: "Closed", value: "closed" }, { label: "Open", value: "open" },
            ], chromatin, (value) => { chromatin = value; render(); }, "Chromatin accessibility"),
          ]),
          el("div", { class: "lab-control-block" }, [
            el("span", { class: "lab-control-label", text: "Effector domain" }),
            choiceRow(el, [
              { label: "Activation", value: "activator" }, { label: "Repression", value: "repressor" },
            ], activationDomain, (value) => { activationDomain = value; render(); }, "Transcription factor effector domain"),
          ]),
          el("div", { class: "readout" }, [
            stat(result.binds ? "yes" : "no", "factor can bind"),
            stat(result.opens ? "yes" : "no", "opens closed site"),
            stat(result.transcription, "transcription"),
          ])
        );
        parts.rail.replaceChildren(causalRail(el, [
          { key: "you changed", value: factor + " DBD · " + activationDomain + " domain" },
          { key: "mechanism", value: result.reason + "; recruits " + result.recruits },
          { key: "observable", value: result.transcription },
        ]));
        parts.explanation.className = "callout " + (result.opens ? "callout-good" : "");
        parts.explanation.innerHTML = "<strong>Binding and activation are different jobs.</strong> A pioneer factor solves the closed-chromatin bootstrap; its attached effector then recruits remodellers, modifiers, or corepressors rather than directly touching polymerase.";
        return;
      }

      const subTabs = el("div", { class: "lab-control-block compact-submode" }, [
        el("span", { class: "lab-control-label", text: "Evidence layer" }),
        choiceRow(el, [
          { label: "Enhancer grammar", value: "grammar" },
          { label: "Burst kinetics", value: "burst" },
          { label: "Assay claims", value: "assay" },
        ], evidenceView, (value) => { evidenceView = value; render(); }, "Enhancer evidence layer"),
      ]);
      if (evidenceView === "grammar") {
        const result = enhancerLogicModel({ kind: "grammar", grammar, perturbation });
        parts.visual.replaceChildren(processBoard(el, [
          { label: "grammar model", value: result.label },
          { label: "perturbation", value: perturbation.replace(/([A-Z])/g, " $1") },
          { label: "remaining output", value: percent(result.activity, 0), tone: result.activity > 0.5 ? "active" : "blocked" },
          { label: "diagnostic evidence", value: result.evidence },
        ], "Enhancer grammar perturbation"));
        parts.controls.replaceChildren(subTabs,
          el("div", { class: "lab-control-block" }, [
            el("span", { class: "lab-control-label", text: "Grammar hypothesis" }),
            choiceRow(el, [
              { label: "Enhanceosome", value: "enhanceosome" },
              { label: "Billboard", value: "billboard" },
              { label: "TF collective", value: "collective" },
            ], grammar, (value) => { grammar = value; render(); }, "Enhancer grammar hypothesis"),
          ]),
          el("div", { class: "lab-control-block" }, [
            el("span", { class: "lab-control-label", text: "Perturbation" }),
            choiceRow(el, [
              { label: "None", value: "none" },
              { label: "Shuffle spacing", value: "spacingShuffle" },
              { label: "Lose one site", value: "siteLoss" },
              { label: "Break TF interface", value: "interfaceBreak" },
            ], perturbation, (value) => { perturbation = value; render(); }, "Enhancer grammar perturbation"),
          ]),
          el("div", { class: "readout" }, [
            stat(percent(result.activity, 0), "relative activity"),
            stat(result.label, "model"),
          ])
        );
        parts.rail.replaceChildren(causalRail(el, [
          { key: "you changed", value: grammar + " · " + perturbation },
          { key: "mechanism", value: result.label },
          { key: "observable", value: percent(result.activity, 0) + " enhancer output" },
        ]));
        parts.explanation.className = "callout";
        parts.explanation.innerHTML = "<strong>The models make different perturbation predictions.</strong> Enhanceosomes are spacing-rigid, billboards retain output after rearrangement, and collectives depend most strongly on protein and chromatin context. Real enhancers occupy a continuum.";
        return;
      }

      if (evidenceView === "burst") {
        const result = enhancerLogicModel({
          kind: "burst", baseKon: 0.12, enhancerStrength,
          baseKsyn: 5, promoterStrength, koff: 1, decay: 0.2,
        });
        parts.visual.replaceChildren(burstBoard(el, result));
        parts.controls.replaceChildren(subTabs,
          rangeControl(el, "Enhancer strength", enhancerStrength, {
            min: 0.2, max: 3, step: 0.1, format: (value) => value.toFixed(1) + "× frequency",
          }, (value) => { enhancerStrength = value; render(); }),
          rangeControl(el, "Core-promoter strength", promoterStrength, {
            min: 0.2, max: 3, step: 0.1, format: (value) => value.toFixed(1) + "× synthesis",
          }, (value) => { promoterStrength = value; render(); }),
          el("div", { class: "readout" }, [
            stat(result.kon.toFixed(2), "k_on"),
            stat(result.burstSize.toFixed(1), "molecules per burst"),
            stat(result.mean.toFixed(1), "bulk mean RNA"),
          ])
        );
        parts.rail.replaceChildren(causalRail(el, [
          { key: "you changed", value: enhancerStrength.toFixed(1) + "× enhancer · " + promoterStrength.toFixed(1) + "× promoter" },
          { key: "mechanism", value: "enhancer changes k_on; promoter changes k_syn/k_off" },
          { key: "observable", value: result.mean.toFixed(1) + " mean RNA hides both parameters" },
        ]));
        parts.explanation.className = "callout";
        parts.explanation.innerHTML = "<strong>An enhancer raises how often an allele fires; the core promoter helps set how much each firing episode makes.</strong> Bulk expression collapses frequency and size into one mean, so different mechanisms can look identical.";
        return;
      }

      const result = enhancerLogicModel({ kind: "assay", assay });
      parts.visual.replaceChildren(processBoard(el, [
        { label: "assay", value: assay.toUpperCase(), tone: "active" },
        { label: "question answered", value: result.question },
        { label: "direct observation", value: result.observes },
        { label: "unsupported leap", value: result.cannot, tone: "blocked" },
      ], "Regulatory assay inference boundary"));
      parts.controls.replaceChildren(subTabs,
        el("div", { class: "lab-control-block" }, [
          el("span", { class: "lab-control-label", text: "Assay" }),
          choiceRow(el, [
            { label: "Reporter / MPRA", value: "reporter" },
            { label: "CRISPRi", value: "crispri" },
            { label: "ChIP", value: "chip" },
            { label: "Hi-C", value: "hic" },
          ], assay, (value) => { assay = value; render(); }, "Regulatory assay"),
        ]),
        el("div", { class: "readout" }, [
          stat(result.question, "claim type"),
          stat(result.observes, "supported"),
          stat(result.cannot, "not supported"),
        ])
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "you changed", value: assay },
        { key: "mechanism", value: "the assay directly measures " + result.question },
        { key: "observable", value: result.observes },
      ]));
      parts.explanation.className = "callout";
      parts.explanation.innerHTML = "<strong>Every assay has a verb.</strong> Occupies, contacts, can drive, and is required are four different claims. Keeping the verb prevents a regulatory association from silently becoming a mechanism.";
    }

    predict(body, {
      widget: "enhancer-logic-lab",
      question: "An enhancer is inverted in place without changing its sequence or domain. What is the usual expectation?",
      hint: "Orientation independence is part of the operational definition of an enhancer.",
      options: [
        { label: "It becomes a silencer" },
        { label: "Its target must switch to the nearest gene" },
        { label: "Its activity is largely retained", correct: true },
        { label: "The promoter reverses direction" },
      ],
    }, () => {
      mode = "domain";
      orientation = "reverse";
      boundaryIntact = true;
      parts.instrument.hidden = false;
      render();
    });
    finishLab(parts, body);
  });

  function memoryTraceSvg(result, divisions, label) {
    const xScale = (value) => 90 + (divisions ? value / divisions : 0) * 394;
    const yScale = (value) => 246 - value * 186;
    const stationaryY = yScale(result.stationary);
    const path = linePath(result.trace, xScale, yScale);
    return textSvg(
      '<text class="lab-svg-kicker" x="260" y="30" text-anchor="middle">STATE ACROSS CELL DIVISIONS</text>' +
      '<path class="reg-plot-axis" d="M90 54 L90 246 L486 246"/>' +
      '<path class="reg-memory-reference" d="M90 ' + stationaryY.toFixed(2) + ' L486 ' + stationaryY.toFixed(2) + '"/>' +
      '<path class="reg-memory-trace" d="' + path + '"/>' +
      '<circle class="reg-memory-point" cx="' + xScale(divisions).toFixed(2) + '" cy="' + yScale(result.value).toFixed(2) + '" r="6"/>' +
      '<text class="lab-svg-label" x="82" y="66" text-anchor="end">100%</text>' +
      '<text class="lab-svg-label" x="82" y="250" text-anchor="end">0%</text>' +
      '<text class="lab-svg-label" x="90" y="276">0 divisions</text>' +
      '<text class="lab-svg-label" x="486" y="276" text-anchor="end">' + divisions + ' divisions</text>' +
      '<text class="reg-trace-value" x="260" y="322" text-anchor="middle">final ' + percent(result.value, 1) + '</text>' +
      '<text class="lab-svg-label" x="474" y="' + Math.max(82, stationaryY - 10).toFixed(2) + '" text-anchor="end">set point ' + percent(result.stationary, 1) + '</text>',
      label + " starts fully marked and reaches " + percent(result.value, 1) + " after " + divisions +
        " divisions. The model set point is " + percent(result.stationary, 1) + ".",
      "0 0 520 338", "memory-trace-diagram"
    );
  }

  function imprintingBoard(el, result) {
    return matrixBoard(el, ["ICR state", "CTCF", "IGF2", "H19"], [
      {
        label: "maternal allele",
        cells: [
          { value: result.maternal },
          { value: /blocked/.test(result.maternal) ? "absent" : "bound", tone: /blocked/.test(result.maternal) ? "blocked" : "active" },
          { value: /blocked/.test(result.maternal) ? "ON" : "OFF", tone: /blocked/.test(result.maternal) ? "active" : "muted" },
          { value: /blocked/.test(result.maternal) ? "OFF" : "ON", tone: /blocked/.test(result.maternal) ? "muted" : "active" },
        ],
      },
      {
        label: "paternal allele",
        cells: [
          { value: result.paternal },
          { value: /bound/.test(result.paternal) ? "bound" : "absent", tone: /bound/.test(result.paternal) ? "active" : "blocked" },
          { value: /bound/.test(result.paternal) ? "OFF" : "ON", tone: /bound/.test(result.paternal) ? "muted" : "active" },
          { value: /bound/.test(result.paternal) ? "ON" : "OFF", tone: /bound/.test(result.paternal) ? "active" : "muted" },
        ],
      },
    ], "Parent-specific ICR methylation determines CTCF insulation and IGF2 versus H19 expression");
  }

  define("epigenetic-memory-lab", {
    "ch23-o1": "Memory mode removes the initiating signal and operationally tests persistence through divisions under the strict epigenetic definition",
    "ch23-o2": "Mark states separate acetylation chemistry from methyl-reader recruitment and expose which marks possess read-write feedback",
    "ch23-o3": "Methylation states move from symmetric CpG through hemimethylation and contrast promoter, gene-body, and germline consequences",
    "ch23-o4": "Imprinting mode changes each parental ICR independently and derives CTCF, IGF2, H19, and growth consequences",
    "ch23-o5": "Identity mode compares CENP-A locus inheritance with chromosome-wide XIST-mediated X-inactivation memory",
    "ch23-o6": "Reprogramming mode counts directly exposed generations and identifies the first unexposed generation for maternal and paternal exposure",
    "ch23-o7": "Clock mode calculates raw and cell-composition-adjusted age residuals while keeping prediction separate from mechanism",
  }, function (api) {
    const { body, el, stat, predict } = api;
    const parts = labParts(el);
    let mode = "memory";
    let memoryView = "marks";
    let mark = "methyl";
    let feedback = true;
    let divisions = 40;
    let q = 0.02;
    let r = 0.20;
    let methylView = "context";
    let methylContext = "promoter";
    let methylated = true;
    let maternalMethylated = false;
    let paternalMethylated = true;
    let resetView = "identity";
    let identitySystem = "cenpa";
    let exposure = "pregnantFemale";
    let generation = 2;
    let chronologicalAge = 55;
    let predictedAge = 62;
    let cellCompositionShift = 4;

    function render() {
      parts.tabHost.replaceChildren(tabs(el, [
        { label: "Memory loop", value: "memory" },
        { label: "Methylation & origin", value: "methylation" },
        { label: "Reset & clocks", value: "reset" },
      ], mode, (value) => { mode = value; render(); }));

      if (mode === "memory") {
        const subTabs = el("div", { class: "lab-control-block compact-submode" }, [
          el("span", { class: "lab-control-label", text: "Memory model" }),
          choiceRow(el, [
            { label: "Mark identity", value: "marks" },
            { label: "Copying arithmetic", value: "maintenance" },
          ], memoryView, (value) => { memoryView = value; render(); }, "Epigenetic memory model"),
        ]);
        if (memoryView === "marks") {
          const result = epigeneticMemoryModel({ kind: "mark", mark, feedback, divisions });
          parts.visual.innerHTML = memoryTraceSvg(result, divisions, result.label);
          parts.controls.replaceChildren(subTabs,
            el("div", { class: "lab-control-block" }, [
              el("span", { class: "lab-control-label", text: "Candidate carrier" }),
              choiceRow(el, [
                { label: "Acetylation", value: "acetyl" },
                { label: "H3K27me3", value: "k27" },
                { label: "H3K9me3", value: "k9" },
                { label: "CpG 5mC", value: "methyl" },
                { label: "CENP-A", value: "cenpa" },
              ], mark, (value) => { mark = value; render(); }, "Chromatin memory carrier"),
            ]),
            el("div", { class: "lab-control-block" }, [
              el("span", { class: "lab-control-label", text: "Reader-recruited restoration" }),
              choiceRow(el, [
                { label: "Intact", value: true },
                { label: "Disabled", value: false },
              ], feedback, (value) => { feedback = value; render(); }, "Read-write feedback state"),
            ]),
            rangeControl(el, "Cell divisions", divisions, {
              min: 1, max: 300, step: 1, format: (value) => String(value),
            }, (value) => { divisions = value; render(); }),
            el("div", { class: "readout" }, [
              stat(result.label, "candidate mark"),
              stat(result.reader + " → " + result.writer, "reader–writer link"),
              stat(result.strictEpigenetic ? "passes" : "fails", "strict memory test"),
              stat(percent(result.value, 1), "marked after divisions"),
            ])
          );
          parts.rail.replaceChildren(causalRail(el, [
            { key: "you changed", value: result.label + " · feedback " + (feedback ? "intact" : "off") },
            { key: "mechanism", value: result.reader + " recruits " + result.writer },
            { key: "observable", value: percent(result.value, 1) + " marked after " + divisions + " divisions" },
          ]));
          parts.explanation.className = "callout " + (result.strictEpigenetic ? "callout-good" : "");
          parts.explanation.innerHTML = "<strong>A mark is memory only if the state restores itself after replication and persists after the initiating signal is gone.</strong> " + result.chemistry + ". The numeric histone trajectories are illustrative; the read–write architecture is the tested claim.";
          return;
        }

        const result = epigeneticMemoryModel({ kind: "maintenance", start: 1, q, r, divisions });
        parts.visual.innerHTML = memoryTraceSvg(result, divisions, "two-state CpG maintenance chain");
        parts.controls.replaceChildren(subTabs,
          rangeControl(el, "Loss probability q", q, {
            min: 0.01, max: 0.08, step: 0.005, format: (value) => percent(value, 1),
          }, (value) => { q = value; render(); }),
          rangeControl(el, "Restoration probability r", r, {
            min: 0, max: 0.40, step: 0.01, format: (value) => percent(value, 0),
          }, (value) => { r = value; render(); }),
          rangeControl(el, "Cell divisions", divisions, {
            min: 1, max: 300, step: 1, format: (value) => String(value),
          }, (value) => { divisions = value; render(); }),
          el("div", { class: "readout" }, [
            stat(percent(result.stationary, 1), "feedback set point"),
            stat(result.relaxation.toFixed(1) + " divisions", "relaxation time"),
            stat(percent(result.value, 1), "current marked fraction"),
          ])
        );
        parts.rail.replaceChildren(causalRail(el, [
          { key: "you changed", value: "q " + percent(q, 1) + " · r " + percent(r, 0) },
          { key: "mechanism", value: "m′ = m(1−q) + (1−m)r" },
          { key: "observable", value: percent(result.value, 1) + " converges toward " + percent(result.stationary, 1) },
        ]));
        parts.explanation.className = "callout";
        parts.explanation.innerHTML = "<strong>The heritable object is a feedback equilibrium over a block, not an immortal methyl group on one cytosine.</strong> With q = 0.02 and r = 0.20, the set point is about 91% and perturbations relax in roughly five divisions.";
        return;
      }

      if (mode === "methylation") {
        const subTabs = el("div", { class: "lab-control-block compact-submode" }, [
          el("span", { class: "lab-control-label", text: "Methylation logic" }),
          choiceRow(el, [
            { label: "Genomic context", value: "context" },
            { label: "IGF2 / H19 imprint", value: "imprint" },
          ], methylView, (value) => { methylView = value; render(); }, "DNA methylation logic"),
        ]);
        if (methylView === "context") {
          const result = epigeneticMemoryModel({ kind: "methylation", context: methylContext, methylated });
          parts.visual.replaceChildren(processBoard(el, [
            { label: "CpG state", value: methylated ? "symmetrically methylated" : "unmethylated", tone: methylated ? "active" : "muted" },
            { label: "after S phase", value: result.copyState },
            { label: "maintenance cue", value: result.maintenance },
            { label: methylContext + " consequence", value: result.outcome, tone: /lower|risk/.test(result.outcome) ? "blocked" : "active" },
          ], "The same 5mC mark has context-dependent consequences"));
          parts.controls.replaceChildren(subTabs,
            el("div", { class: "lab-control-block" }, [
              el("span", { class: "lab-control-label", text: "Genomic context" }),
              choiceRow(el, [
                { label: "Promoter CpG island", value: "promoter" },
                { label: "Gene body", value: "geneBody" },
                { label: "Germline history", value: "germline" },
              ], methylContext, (value) => { methylContext = value; render(); }, "DNA methylation genomic context"),
            ]),
            el("div", { class: "lab-control-block" }, [
              el("span", { class: "lab-control-label", text: "CpG state" }),
              choiceRow(el, [
                { label: "Unmethylated", value: false },
                { label: "Methylated", value: true },
              ], methylated, (value) => { methylated = value; render(); }, "CpG methylation state"),
            ]),
            el("div", { class: "readout" }, [
              stat(result.outcome, "contextual outcome"),
              stat(result.maintenance, "copying rule"),
            ])
          );
          parts.rail.replaceChildren(causalRail(el, [
            { key: "you changed", value: methylContext + " · " + (methylated ? "5mC" : "unmethylated C") },
            { key: "mechanism", value: result.mechanism },
            { key: "observable", value: result.outcome },
          ]));
          parts.explanation.className = "callout";
          parts.explanation.innerHTML = "<strong>“Methylation means off” is only a promoter rule.</strong> Gene-body methylation tracks elongation and suppresses cryptic starts; germline 5mC also leaves a long-term C→T mutational fossil.";
          return;
        }

        const result = epigeneticMemoryModel({ kind: "imprinting", maternalMethylated, paternalMethylated });
        parts.visual.replaceChildren(imprintingBoard(el, result));
        parts.controls.replaceChildren(subTabs,
          el("div", { class: "lab-control-block" }, [
            el("span", { class: "lab-control-label", text: "Maternal ICR1" }),
            choiceRow(el, [
              { label: "Unmethylated", value: false }, { label: "Methylated", value: true },
            ], maternalMethylated, (value) => { maternalMethylated = value; render(); }, "Maternal ICR1 methylation"),
          ]),
          el("div", { class: "lab-control-block" }, [
            el("span", { class: "lab-control-label", text: "Paternal ICR1" }),
            choiceRow(el, [
              { label: "Unmethylated", value: false }, { label: "Methylated", value: true },
            ], paternalMethylated, (value) => { paternalMethylated = value; render(); }, "Paternal ICR1 methylation"),
          ]),
          el("div", { class: "readout" }, [
            stat(String(result.igf2Copies), "active IGF2 copies"),
            stat(String(result.h19Copies), "active H19 copies"),
            stat(result.phenotype, "dosage consequence"),
          ])
        );
        parts.rail.replaceChildren(causalRail(el, [
          { key: "you changed", value: "maternal " + (maternalMethylated ? "M" : "U") + " · paternal " + (paternalMethylated ? "M" : "U") },
          { key: "mechanism", value: "methylation blocks CTCF and lets shared enhancers reach IGF2" },
          { key: "observable", value: result.igf2Copies + " IGF2 copies · " + result.phenotype },
        ]));
        parts.explanation.className = "callout " + (result.igf2Copies === 1 ? "callout-good" : "");
        parts.explanation.innerHTML = "<strong>Parent of origin is converted into enhancer access.</strong> Maternal gain of methylation paternalises that allele and raises IGF2 dosage; paternal loss maternalises it and removes IGF2 expression.";
        return;
      }

      const subTabs = el("div", { class: "lab-control-block compact-submode" }, [
        el("span", { class: "lab-control-label", text: "Long-timescale claim" }),
        choiceRow(el, [
          { label: "Identity carriers", value: "identity" },
          { label: "Reprogramming", value: "reprogramming" },
          { label: "Clock residual", value: "clock" },
        ], resetView, (value) => { resetView = value; render(); }, "Epigenetic long-timescale claim"),
      ]);
      if (resetView === "identity") {
        const result = epigeneticMemoryModel({ kind: "identity", system: identitySystem });
        parts.visual.replaceChildren(processBoard(el, [
          { label: "carrier", value: result.carrier, tone: "active" },
          { label: "physical scale", value: result.scale },
          { label: "state propagated", value: result.propagated },
          { label: "sequence test", value: result.sequenceRequirement },
        ], "Strict epigenetic identity carrier"));
        parts.controls.replaceChildren(subTabs,
          el("div", { class: "lab-control-block" }, [
            el("span", { class: "lab-control-label", text: "Identity system" }),
            choiceRow(el, [
              { label: "CENP-A centromere", value: "cenpa" },
              { label: "XIST inactive X", value: "xist" },
            ], identitySystem, (value) => { identitySystem = value; render(); }, "Epigenetic identity system"),
          ]),
          el("div", { class: "readout" }, [
            stat(result.carrier, "memory carrier"),
            stat(result.scale, "scale"),
            stat(result.propagated, "inherited state"),
          ])
        );
        parts.rail.replaceChildren(causalRail(el, [
          { key: "you changed", value: identitySystem },
          { key: "mechanism", value: result.carrier },
          { key: "observable", value: result.propagated },
        ]));
        parts.explanation.className = "callout callout-good";
        parts.explanation.innerHTML = "<strong>Same sequence, different stable state is the decisive evidence.</strong> Neocentromeres show that alpha satellite is not sufficient for centromere position; random X inactivation gives homologous X chromosomes different clonally inherited states.";
        return;
      }

      if (resetView === "reprogramming") {
        const result = epigeneticMemoryModel({ kind: "reprogramming", exposure, generation });
        const generations = [0, 1, 2, 3].map((item) => ({
          label: "F" + item,
          value: item < result.firstUnexposed ? "directly exposed" : "unexposed test",
          tone: item === generation ? (result.transgenerational ? "active" : "blocked") : "muted",
        }));
        parts.visual.replaceChildren(statusStrip(el, generations, "Exposure counting across generations"));
        parts.controls.replaceChildren(subTabs,
          el("div", { class: "lab-control-block" }, [
            el("span", { class: "lab-control-label", text: "F0 exposure" }),
            choiceRow(el, [
              { label: "Pregnant female", value: "pregnantFemale" },
              { label: "Male before mating", value: "male" },
            ], exposure, (value) => { exposure = value; render(); }, "F0 exposure route"),
          ]),
          el("div", { class: "lab-control-block" }, [
            el("span", { class: "lab-control-label", text: "Generation claimed" }),
            choiceRow(el, [
              { label: "F1", value: 1 }, { label: "F2", value: 2 }, { label: "F3", value: 3 },
            ], generation, (value) => { generation = value; render(); }, "Generation tested"),
          ]),
          el("div", { class: "readout" }, [
            stat("F" + result.firstUnexposed, "first unexposed generation"),
            stat(result.transgenerational ? "eligible claim" : "direct exposure", "classification"),
            stat("two erasure waves", "mechanistic hurdle"),
          ])
        );
        parts.rail.replaceChildren(causalRail(el, [
          { key: "you changed", value: exposure + " · test F" + generation },
          { key: "mechanism", value: result.directReason },
          { key: "observable", value: result.transgenerational ? "first qualifies as transgenerational" : "does not test transgenerational inheritance" },
        ]));
        parts.explanation.className = "callout " + (result.transgenerational ? "callout-good" : "");
        parts.explanation.innerHTML = "<strong>Generation counting is only the entry ticket.</strong> A valid mammalian claim must also show a germline mark survives primordial-germ-cell erasure and post-fertilisation erasure, then causally changes phenotype.";
        return;
      }

      const result = epigeneticMemoryModel({ kind: "clock", chronologicalAge, predictedAge, cellCompositionShift });
      parts.visual.replaceChildren(processBoard(el, [
        { label: "methylation predictor", value: predictedAge + " y" },
        { label: "chronological reference", value: chronologicalAge + " y" },
        { label: "raw residual", value: (result.rawAcceleration >= 0 ? "+" : "") + result.rawAcceleration + " y", tone: result.rawAcceleration > 0 ? "blocked" : "active" },
        { label: "after cell-mixture adjustment", value: (result.adjustedAcceleration >= 0 ? "+" : "") + result.adjustedAcceleration + " y" },
      ], "Epigenetic age acceleration is a prediction residual"));
      parts.controls.replaceChildren(subTabs,
        rangeControl(el, "Chronological age", chronologicalAge, {
          min: 20, max: 90, step: 1, format: (value) => value + " y",
        }, (value) => { chronologicalAge = value; render(); }),
        rangeControl(el, "Clock-predicted age", predictedAge, {
          min: 20, max: 90, step: 1, format: (value) => value + " y",
        }, (value) => { predictedAge = value; render(); }),
        rangeControl(el, "Cell-composition contribution", cellCompositionShift, {
          min: -8, max: 8, step: 1, format: (value) => (value >= 0 ? "+" : "") + value + " y",
        }, (value) => { cellCompositionShift = value; render(); }),
        el("div", { class: "readout" }, [
          stat((result.rawAcceleration >= 0 ? "+" : "") + result.rawAcceleration + " y", "raw acceleration"),
          stat((result.adjustedAcceleration >= 0 ? "+" : "") + result.adjustedAcceleration + " y", "adjusted residual"),
          stat(result.interpretation, "meaning"),
        ])
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "you changed", value: "ages and cell-mixture contribution" },
        { key: "mechanism", value: "predicted age − chronological age − composition shift" },
        { key: "observable", value: result.adjustedAcceleration + " y adjusted residual" },
      ]));
      parts.explanation.className = "callout";
      parts.explanation.innerHTML = "<strong>A clock is a useful predictor, not an ageing mechanism.</strong> Its residual inherits confounding from blood-cell composition and correlated CpGs; changing the number does not by itself show that biological ageing was reversed.";
    }

    predict(body, {
      widget: "epigenetic-memory-lab",
      question: "An initiating signal is removed and histone acetylation turns over within minutes. Does that mark alone pass the strict epigenetic-memory test?",
      hint: "The strict test requires persistence through cell division without the initiating signal.",
      options: [
        { label: "Yes—every chromatin mark is epigenetic" },
        { label: "Yes—acetylation directly opens DNA" },
        { label: "No—it lacks a self-restoring read–write loop", correct: true },
        { label: "No—histones never survive replication" },
      ],
    }, () => {
      mode = "memory";
      memoryView = "marks";
      mark = "acetyl";
      feedback = false;
      divisions = 12;
      parts.instrument.hidden = false;
      render();
    });
    finishLab(parts, body);
  });

  function decaySvg(result, minutes, halfLife) {
    const points = Array.from({ length: 31 }, (_, index) => {
      const time = minutes * index / 30;
      return { x: time, y: 2 ** (-time / halfLife) };
    });
    const xScale = (value) => 90 + (minutes ? value / minutes : 0) * 394;
    const yScale = (value) => 242 - value * 178;
    return textSvg(
      '<text class="lab-svg-kicker" x="260" y="30" text-anchor="middle">MESSAGE AFTER TRANSCRIPTION STOPS</text>' +
      '<path class="reg-plot-axis" d="M90 58 L90 242 L484 242"/>' +
      '<path class="reg-decay-trace" d="' + linePath(points, xScale, yScale) + '"/>' +
      '<path class="reg-half-guide" d="M90 ' + yScale(0.5) + ' L' + xScale(Math.min(minutes, halfLife)) + ' ' + yScale(0.5) + '"/>' +
      '<circle class="reg-memory-point" cx="' + xScale(minutes) + '" cy="' + yScale(result.remaining) + '" r="6"/>' +
      '<text class="lab-svg-label" x="82" y="68" text-anchor="end">100%</text>' +
      '<text class="lab-svg-label" x="82" y="246" text-anchor="end">0%</text>' +
      '<text class="lab-svg-label" x="90" y="274">0 min</text>' +
      '<text class="lab-svg-label" x="484" y="274" text-anchor="end">' + minutes + ' min</text>' +
      '<text class="reg-trace-value" x="260" y="320" text-anchor="middle">' + percent(result.remaining, 1) + ' remains</text>',
      "A message with half-life " + halfLife + " minutes has " + percent(result.remaining, 1) +
        " remaining after " + minutes + " minutes.",
      "0 0 520 336", "rna-decay-diagram"
    );
  }

  function lncPerturbationBoard(el, result, mechanism) {
    return matrixBoard(el, ["RNA", "transcription", "DNA element", "phenotype"], [{
      label: result.label,
      cells: [
        { value: result.removesRNA ? "removed" : "retained", tone: result.removesRNA ? "blocked" : "active" },
        { value: result.removesTranscription === "partial" ? "truncated" : result.removesTranscription ? "stopped" : "retained", tone: result.removesTranscription ? "blocked" : "active" },
        { value: result.removesDNA ? "removed" : "retained", tone: result.removesDNA ? "blocked" : "active" },
        { value: result.phenotype ? "changes" : "unchanged", tone: result.phenotype ? "active" : "muted" },
      ],
    }], "Perturbation consequences when the true causal layer is " + mechanism);
  }

  define("rna-regulation-lab", {
    "ch24-o1": "Guide and molecule modes quantify chance pairing and regulator-to-target stoichiometry before accepting sponge or decoy claims",
    "ch24-o2": "miRNA pipeline states step from pri-miRNA through Drosha, export, Dicer, and loaded RISC, while guide mode calculates chance seed matches",
    "ch24-o3": "Guide-family states distinguish miRNA, siRNA, and piRNA by biogenesis, pairing extent, and biological job",
    "ch24-o4": "Molecule-or-locus mode crosses causal layer with ASO, CRISPRi, truncation, deletion, and trans rescue",
    "ch24-o5": "CRISPR mode changes PAM context and guide mismatch to derive self versus non-self discrimination",
    "ch24-o6": "Decay mode changes half-life and time since transcription stopped to expose response speed as a degradation property",
    "ch24-o7": "ATF4 mode sends four stress inputs through eIF2-alpha phosphorylation, ternary-complex scarcity, uORF2 bypass, and selective translation",
  }, function (api) {
    const { body, el, stat, predict } = api;
    const parts = labParts(el);
    let mode = "guides";
    let guideView = "families";
    let family = "mirna";
    let guideLength = 7;
    let stage = 0;
    let mechanism = "rna";
    let perturbation = "aso";
    let regulatorCopies = 80;
    let targetCopies = 1000;
    let responseView = "crispr";
    let crisprTarget = "phage";
    let pamPresent = true;
    let mismatches = 0;
    let halfLife = 30;
    let minutes = 90;
    let stress = "none";

    function render() {
      parts.tabHost.replaceChildren(tabs(el, [
        { label: "Guide economy", value: "guides" },
        { label: "Molecule or locus", value: "lnc" },
        { label: "Response timing", value: "response" },
      ], mode, (value) => { mode = value; render(); }));

      if (mode === "guides") {
        const subTabs = el("div", { class: "lab-control-block compact-submode" }, [
          el("span", { class: "lab-control-label", text: "Guide view" }),
          choiceRow(el, [
            { label: "Families & chance", value: "families" },
            { label: "miRNA assembly", value: "pipeline" },
          ], guideView, (value) => { guideView = value; render(); }, "RNA guide view"),
        ]);
        if (guideView === "families") {
          const result = rnaRegulationModel({ kind: "guide", family, length: guideLength, searchSpace: 23.3e6 });
          parts.visual.replaceChildren(processBoard(el, [
            { label: "source and processing", value: result.biogenesis },
            { label: "recognition", value: result.guide + " · " + result.pairing, tone: "active" },
            { label: "chance in 23.3 Mb", value: result.chanceMatches < 0.01 ? result.chanceMatches.toExponential(2) : Math.round(result.chanceMatches).toLocaleString() + " matches" },
            { label: "biological job", value: result.job },
          ], result.label + " guide economy"));
          parts.controls.replaceChildren(subTabs,
            el("div", { class: "lab-control-block" }, [
              el("span", { class: "lab-control-label", text: "Small-RNA family" }),
              choiceRow(el, [
                { label: "miRNA", value: "mirna" },
                { label: "siRNA", value: "sirna" },
                { label: "piRNA", value: "pirna" },
              ], family, (value) => {
                family = value;
                guideLength = RNA_GUIDES[value].defaultLength;
                render();
              }, "Small RNA guide family"),
            ]),
            rangeControl(el, "Effective matched length", guideLength, {
              min: 6, max: 30, step: 1, format: (value) => value + " nt",
            }, (value) => { guideLength = value; render(); }),
            el("div", { class: "readout" }, [
              stat(result.label, "family"),
              stat(result.pairing, "pairing"),
              stat(result.chanceMatches < 0.01 ? result.chanceMatches.toExponential(2) : Math.round(result.chanceMatches).toLocaleString(), "chance matches"),
              stat(result.job, "typical job"),
            ])
          );
          parts.rail.replaceChildren(causalRail(el, [
            { key: "you changed", value: result.label + " · " + guideLength + " matched nt" },
            { key: "mechanism", value: "expected chance matches = search space / 4^length" },
            { key: "observable", value: result.chanceMatches < 0.01 ? result.chanceMatches.toExponential(2) : Math.round(result.chanceMatches).toLocaleString() + " background matches" },
          ]));
          parts.explanation.className = "callout";
          parts.explanation.innerHTML = "<strong>Programmable specificity is cheap because the sequence is the parameter; short guides pay with a large chance-match background.</strong> A 7-mer in the human 3′UTR search space has about 1,400 chance sites, so a seed match is a ranking feature, not proof.";
          return;
        }

        const result = rnaRegulationModel({ kind: "mirnaStage", stage });
        parts.visual.replaceChildren(processBoard(el, result.stages.map((item, index) => ({
          label: item.name,
          value: item.place + " · " + item.enzyme,
          tone: index === stage ? "active" : index < stage ? "muted" : "",
        })), "miRNA biogenesis from Pol II transcript to Argonaute-loaded guide"));
        parts.controls.replaceChildren(subTabs,
          rangeControl(el, "Biogenesis stage", stage, {
            min: 0, max: 3, step: 1, format: (value) => ["pri-miRNA", "pre-miRNA", "duplex", "RISC"][value],
          }, (value) => { stage = value; render(); }),
          el("div", { class: "readout" }, [
            stat(result.selected.name, "current product"),
            stat(result.selected.place, "location"),
            stat(result.selected.enzyme, "machinery"),
            stat(result.selected.product, "structural result"),
          ])
        );
        parts.rail.replaceChildren(causalRail(el, [
          { key: "you changed", value: "stage " + (stage + 1) + " of 4" },
          { key: "mechanism", value: result.selected.enzyme },
          { key: "observable", value: result.selected.product },
        ]));
        parts.explanation.className = "callout";
        parts.explanation.innerHTML = "<strong>Drosha defines the nuclear hairpin, Exportin-5 moves it, Dicer defines the short duplex, and Argonaute retains one guide strand.</strong> Each transition changes both the molecule and the compartment.";
        return;
      }

      if (mode === "lnc") {
        const result = rnaRegulationModel({ kind: "lnc", mechanism, perturbation });
        const stoichiometric = regulatorCopies >= targetCopies;
        parts.visual.replaceChildren(
          lncPerturbationBoard(el, result, mechanism),
          statusStrip(el, [
            { label: "regulator copies", value: regulatorCopies },
            { label: "target / ligand copies", value: targetCopies },
            { label: "titration plausible", value: stoichiometric ? "yes" : "no", tone: stoichiometric ? "active" : "blocked" },
          ], "Stoichiometric test for an RNA decoy or sponge")
        );
        parts.controls.replaceChildren(
          el("div", { class: "lab-control-block" }, [
            el("span", { class: "lab-control-label", text: "True causal layer" }),
            choiceRow(el, [
              { label: "RNA molecule", value: "rna" },
              { label: "Act of transcription", value: "transcription" },
              { label: "DNA element", value: "dna" },
            ], mechanism, (value) => { mechanism = value; render(); }, "LncRNA causal layer"),
          ]),
          el("div", { class: "lab-control-block" }, [
            el("span", { class: "lab-control-label", text: "Experiment" }),
            choiceRow(el, [
              { label: "ASO / RNAi", value: "aso" },
              { label: "CRISPRi", value: "crispri" },
              { label: "Early poly(A)", value: "polyA" },
              { label: "Delete locus", value: "deletion" },
              { label: "Rescue RNA in trans", value: "rescue" },
            ], perturbation, (value) => { perturbation = value; render(); }, "LncRNA perturbation"),
          ]),
          rangeControl(el, "Regulator copies per cell", regulatorCopies, {
            min: 10, max: 3000, step: 10, format: (value) => value.toLocaleString(),
          }, (value) => { regulatorCopies = value; render(); }),
          rangeControl(el, "Target or ligand copies", targetCopies, {
            min: 10, max: 3000, step: 10, format: (value) => value.toLocaleString(),
          }, (value) => { targetCopies = value; render(); }),
          el("div", { class: "readout" }, [
            stat(result.phenotype ? "changes" : "unchanged", "phenotype"),
            stat(result.conclusion, "inference"),
            stat(stoichiometric ? "plausible" : "fails", "decoy stoichiometry"),
          ])
        );
        parts.rail.replaceChildren(causalRail(el, [
          { key: "you changed", value: perturbation + " under a " + mechanism + " mechanism" },
          { key: "mechanism", value: "experiment removes RNA/transcription/DNA in a specific combination" },
          { key: "observable", value: result.conclusion },
        ]));
        parts.explanation.className = "callout " + (perturbation === "rescue" && result.phenotype ? "callout-good" : "");
        parts.explanation.innerHTML = "<strong>Disagreement among perturbations is information.</strong> Deleting a locus removes three layers at once; only rescue in trans demonstrates that the RNA molecule itself is sufficient. A sponge or decoy must also pass the copy-number test.";
        return;
      }

      const subTabs = el("div", { class: "lab-control-block compact-submode" }, [
        el("span", { class: "lab-control-label", text: "Response mechanism" }),
        choiceRow(el, [
          { label: "CRISPR immunity", value: "crispr" },
          { label: "mRNA half-life", value: "decay" },
          { label: "ATF4 uORFs", value: "atf4" },
        ], responseView, (value) => { responseView = value; render(); }, "RNA response mechanism"),
      ]);
      if (responseView === "crispr") {
        const result = rnaRegulationModel({ kind: "crispr", target: crisprTarget, pamPresent, mismatches });
        parts.visual.replaceChildren(processBoard(el, [
          { label: "collision target", value: crisprTarget === "array" ? "own CRISPR array" : "phage protospacer" },
          { label: "PAM gate", value: pamPresent ? "present → interrogate" : "absent → skip", tone: pamPresent ? "active" : "muted" },
          { label: "guide pairing", value: mismatches + " mismatch" + (mismatches === 1 ? "" : "es"), tone: result.guideMatch ? "active" : "blocked" },
          { label: "outcome", value: result.outcome, tone: result.cleavage && result.self ? "blocked" : result.cleavage ? "active" : "muted" },
        ], "PAM-first CRISPR target search and self/non-self discrimination"));
        parts.controls.replaceChildren(subTabs,
          el("div", { class: "lab-control-block" }, [
            el("span", { class: "lab-control-label", text: "Sequence location" }),
            choiceRow(el, [
              { label: "Own spacer array", value: "array" },
              { label: "Invading phage", value: "phage" },
            ], crisprTarget, (value) => {
              crisprTarget = value;
              pamPresent = value === "phage";
              render();
            }, "CRISPR sequence location"),
          ]),
          el("div", { class: "lab-control-block" }, [
            el("span", { class: "lab-control-label", text: "Adjacent PAM" }),
            choiceRow(el, [
              { label: "Absent", value: false }, { label: "Present", value: true },
            ], pamPresent, (value) => { pamPresent = value; render(); }, "CRISPR PAM state"),
          ]),
          rangeControl(el, "Guide mismatches", mismatches, {
            min: 0, max: 4, step: 1, format: (value) => String(value),
          }, (value) => { mismatches = value; render(); }),
          el("div", { class: "readout" }, [
            stat(result.interrogated ? "yes" : "no", "duplex interrogated"),
            stat(result.guideMatch ? "passes" : "fails", "guide pairing"),
            stat(result.cleavage ? "yes" : "no", "cleavage"),
          ])
        );
        parts.rail.replaceChildren(causalRail(el, [
          { key: "you changed", value: crisprTarget + " · PAM " + (pamPresent ? "+" : "−") + " · " + mismatches + " mismatches" },
          { key: "mechanism", value: "PAM first, then seed/R-loop propagation" },
          { key: "observable", value: result.outcome },
        ]));
        parts.explanation.className = "callout " + (!result.cleavage ? "callout-good" : "");
        parts.explanation.innerHTML = "<strong>The guide sequence alone cannot distinguish the invader from the identical spacer stored in the array.</strong> Adjacent context does: the phage protospacer has a PAM; the repeat-flanked self spacer does not.";
        return;
      }

      if (responseView === "decay") {
        const result = rnaRegulationModel({ kind: "decay", halfLife, minutes });
        parts.visual.innerHTML = decaySvg(result, minutes, halfLife);
        parts.controls.replaceChildren(subTabs,
          rangeControl(el, "mRNA half-life", halfLife, {
            min: 5, max: 240, step: 5, format: (value) => value + " min",
          }, (value) => { halfLife = value; render(); }),
          rangeControl(el, "Time since transcription stopped", minutes, {
            min: 5, max: 360, step: 5, format: (value) => value + " min",
          }, (value) => { minutes = value; render(); }),
          el("div", { class: "readout" }, [
            stat(percent(result.remaining, 1), "message remaining"),
            stat(percent(result.responded, 1), "response completed"),
            stat(result.timeConstant.toFixed(1) + " min", "time constant"),
          ])
        );
        parts.rail.replaceChildren(causalRail(el, [
          { key: "you changed", value: halfLife + " min half-life · observe at " + minutes + " min" },
          { key: "mechanism", value: "first-order decay; response speed = ln2/k_deg" },
          { key: "observable", value: percent(result.remaining, 1) + " RNA remains" },
        ]));
        parts.explanation.className = "callout";
        parts.explanation.innerHTML = "<strong>Transcription rate changes the destination; degradation changes how quickly the message can leave its old state.</strong> Fast-response cytokine and immediate-early messages pay for bandwidth with short half-lives and continuous resynthesis.";
        return;
      }

      const result = rnaRegulationModel({ kind: "atf4", stress });
      parts.visual.replaceChildren(processBoard(el, [
        { label: "stress sensor", value: result.kinase, tone: stress === "none" ? "muted" : "active" },
        { label: "shared node", value: result.eif2Phosphorylated ? "eIF2α phosphorylated" : "eIF2α unmodified" },
        { label: "reinitiation timing", value: result.ternaryComplex + " ternary complex → uORF2 " + result.uorf2 },
        { label: "translation output", value: "global " + percent(result.globalTranslation, 0) + " · ATF4 " + percent(result.atf4Translation, 0), tone: stress === "none" ? "muted" : "active" },
      ], "ATF4 uORFs convert initiation-factor scarcity into selective translation"));
      parts.controls.replaceChildren(subTabs,
        el("div", { class: "lab-control-block" }, [
          el("span", { class: "lab-control-label", text: "Stress input" }),
          choiceRow(el, [
            { label: "None", value: "none" },
            { label: "ER stress", value: "er" },
            { label: "Viral dsRNA", value: "viral" },
            { label: "Amino-acid shortage", value: "amino" },
            { label: "Heme / mitochondrial", value: "heme" },
          ], stress, (value) => { stress = value; render(); }, "Integrated stress input"),
        ]),
        el("div", { class: "readout" }, [
          stat(result.kinase, "activated kinase"),
          stat(result.ternaryComplex, "ternary complex"),
          stat(result.uorf2, "uORF2"),
          stat(percent(result.atf4Translation, 0), "relative ATF4"),
        ])
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "you changed", value: stress + " stress" },
        { key: "mechanism", value: result.kinase + " → eIF2α-P → delayed ternary-complex reacquisition" },
        { key: "observable", value: "global translation " + percent(result.globalTranslation, 0) + " · ATF4 " + percent(result.atf4Translation, 0) },
      ]));
      parts.explanation.className = "callout " + (stress !== "none" ? "callout-good" : "");
      parts.explanation.innerHTML = "<strong>Scarce ternary complex makes ATF4 rise while most translation falls.</strong> The scanning ribosome misses inhibitory uORF2 before it reacquires initiation competence, so the next usable AUG is ATF4's.";
    }

    predict(body, {
      widget: "rna-regulation-lab",
      question: "Roughly how many perfect chance matches should one specific 7-mer have in about 23 million nucleotides of human 3′UTR sequence?",
      hint: "Divide the search space by 4⁷ = 16,384.",
      options: [
        { label: "About 1" },
        { label: "About 14" },
        { label: "About 1,400", correct: true },
        { label: "About 1.4 million" },
      ],
    }, () => {
      mode = "guides";
      guideView = "families";
      family = "mirna";
      guideLength = 7;
      parts.instrument.hidden = false;
      render();
    });
    finishLab(parts, body);
  });

  function feedbackSvg(result, feedback, n) {
    const xScale = (value) => 90 + value / 8 * 394;
    const yScale = (value) => 246 - value / 2.2 * 164;
    return textSvg(
      '<text class="lab-svg-kicker" x="260" y="24" text-anchor="middle"><tspan x="260">SAME PARAMETERS</tspan><tspan x="260" dy="24">DIFFERENT STARTING HISTORY</tspan></text>' +
      '<path class="reg-plot-axis" d="M90 76 L90 246 L484 246"/>' +
      '<path class="reg-feedback-low" d="' + linePath(result.low.trace, xScale, yScale) + '"/>' +
      '<path class="reg-feedback-high" d="' + linePath(result.high.trace, xScale, yScale) + '"/>' +
      '<text class="lab-svg-label" x="90" y="276">0 time</text>' +
      '<text class="lab-svg-label" x="484" y="274" text-anchor="end">8 time units</text>' +
      '<text class="reg-trace-value" x="260" y="322" text-anchor="middle">' + (result.memory ? "history retained" : "one attractor") + '</text>' +
      '<text class="lab-svg-label" x="104" y="104">low-start trace</text>' +
      '<text class="lab-svg-label" x="104" y="128">high-start trace</text>',
      feedback + " feedback with cooperativity n=" + n + ". A low start ends at " + result.lowFinal.toFixed(2) +
        " and a high start ends at " + result.highFinal.toFixed(2) + ". " +
        (result.memory ? "The system retains history." : "Both histories converge."),
      "0 0 520 338", "feedback-trace-diagram"
    );
  }

  function fflSvg(result, loop) {
    const xScale = (value) => 90 + value / 10 * 394;
    const yScale = (value) => 242 - value * 172;
    const input = result.points.map((point) => ({ x: point.x, y: point.input }));
    const intermediate = result.points.map((point) => ({ x: point.x, y: point.intermediate }));
    const output = result.points.map((point) => ({ x: point.x, y: point.output }));
    return textSvg(
      '<text class="lab-svg-kicker" x="260" y="30" text-anchor="middle">INPUT · INTERMEDIATE · OUTPUT</text>' +
      '<path class="reg-plot-axis" d="M90 58 L90 242 L484 242"/>' +
      '<path class="reg-ffl-input" d="' + linePath(input, xScale, yScale) + '"/>' +
      '<path class="reg-ffl-intermediate" d="' + linePath(intermediate, xScale, yScale) + '"/>' +
      '<path class="reg-ffl-output" d="' + linePath(output, xScale, yScale) + '"/>' +
      '<text class="lab-svg-label" x="104" y="82">input</text>' +
      '<text class="lab-svg-label" x="104" y="106">intermediate</text>' +
      '<text class="lab-svg-label" x="104" y="130">output</text>' +
      '<text class="lab-svg-label" x="90" y="274">0</text>' +
      '<text class="lab-svg-label" x="484" y="274" text-anchor="end">10 time units</text>' +
      '<text class="reg-trace-value" x="260" y="320" text-anchor="middle">' + result.behavior + '</text>',
      (loop === "coherent" ? "Coherent" : "Incoherent") + " feed-forward loop. Peak output " +
        result.peak.toFixed(2) + ". It behaves as a " + result.behavior + ".",
      "0 0 520 336", "ffl-trace-diagram"
    );
  }

  function patternBoard(el, result) {
    const board = el("div", {
      class: "reg-pattern-board",
      role: "img",
      "aria-label": "Twenty-five positions across a fly embryo. Bicoid decays anterior to posterior. " +
        result.stripeCells + " cells satisfy Bicoid and Hunchback activation while avoiding Giant and Kruppel repression.",
    });
    const rows = [
      { label: "Bicoid +", key: "bicoid", tone: "activation" },
      { label: "Hunchback +", key: "hunchback", tone: "activation" },
      { label: "Giant −", key: "giant", tone: "repression" },
      { label: "Krüppel −", key: "kruppel", tone: "repression" },
      { label: "eve stripe 2", key: "stripe", tone: "output" },
    ];
    rows.forEach((row) => {
      const lane = el("div", { class: "reg-pattern-lane" });
      lane.append(el("strong", { text: row.label }));
      const cells = el("div", { class: "reg-pattern-cells", "aria-hidden": "true" });
      result.cells.forEach((cell) => {
        const value = row.key === "stripe" ? (cell.stripe ? 1 : 0.04) : cell[row.key];
        cells.append(el("span", {
          class: "reg-pattern-cell is-" + row.tone + (row.key === "stripe" && cell.stripe ? " is-on" : ""),
          style: "opacity:" + clamp(0.08 + value * 0.92, 0.08, 1).toFixed(2),
        }));
      });
      lane.append(cells);
      board.append(lane);
    });
    board.append(el("div", { class: "reg-pattern-axis" }, [
      el("span", { text: "anterior" }), el("span", { text: "posterior" }),
    ]));
    return board;
  }

  define("network-dynamics-lab", {
    "ch25-o1": "Motif mode runs no-feedback, negative-feedback, cooperative positive-feedback, coherent and incoherent feed-forward, toggle, and oscillator states",
    "ch25-o2": "Positive-feedback traces start from low and high histories and expose the cooperativity requirement for separated attractors",
    "ch25-o3": "Pattern mode converts one maternal gradient through gap activators and repressors into a discrete eve stripe and names each cascade tier",
    "ch25-o4": "Hox mode changes loss versus ectopic selector expression and reads anterior or posterior homeotic transformation without treating Hox as a blueprint",
    "ch25-o5": "Attractor mode keeps genome content fixed while forced factors and barrier strength change the probability of rare reprogramming",
    "ch25-o6": "Buffer mode contrasts coding and modular enhancer perturbations, shadow-enhancer buffering, environmental stress, and pleiotropic cost",
  }, function (api) {
    const { body, el, stat, predict } = api;
    const parts = labParts(el);
    let mode = "motifs";
    let motifView = "feedback";
    let feedbackType = "positive";
    let cooperativity = 2;
    let signal = 0.02;
    let initialState = "low";
    let loop = "coherent";
    let pulse = 2;
    let stateCircuit = "toggle";
    let togglePulse = "x";
    let delay = 2;
    let patternView = "stripe";
    let lambda = 0.28;
    let hoxPerturbation = "loss";
    let identityView = "attractor";
    let forcedFactors = 4;
    let barrier = 90;
    let variant = "enhancer";
    let shadowEnhancer = true;
    let stress = 0;

    function render() {
      parts.tabHost.replaceChildren(tabs(el, [
        { label: "Motif dynamics", value: "motifs" },
        { label: "Patterning cascade", value: "pattern" },
        { label: "Attractors & evolution", value: "identity" },
      ], mode, (value) => { mode = value; render(); }));

      if (mode === "motifs") {
        const subTabs = el("div", { class: "lab-control-block compact-submode" }, [
          el("span", { class: "lab-control-label", text: "Circuit family" }),
          choiceRow(el, [
            { label: "Autoregulation", value: "feedback" },
            { label: "Feed-forward", value: "ffl" },
            { label: "Toggle / clock", value: "state" },
          ], motifView, (value) => { motifView = value; render(); }, "Network circuit family"),
        ]);
        if (motifView === "feedback") {
          const result = networkDynamicsModel({
            kind: "feedback", feedback: feedbackType, n: cooperativity,
            signal, initialState,
          });
          result.low = simulateFeedback({ feedback: feedbackType, n: cooperativity, signal, initial: 0.01 });
          result.high = simulateFeedback({ feedback: feedbackType, n: cooperativity, signal, initial: 1.8 });
          parts.visual.innerHTML = feedbackSvg(result, feedbackType, cooperativity);
          parts.controls.replaceChildren(subTabs,
            el("div", { class: "lab-control-block" }, [
              el("span", { class: "lab-control-label", text: "Feedback sign" }),
              choiceRow(el, [
                { label: "None", value: "none" },
                { label: "Negative", value: "negative" },
                { label: "Positive", value: "positive" },
              ], feedbackType, (value) => { feedbackType = value; render(); }, "Autoregulatory feedback sign"),
            ]),
            rangeControl(el, "Cooperativity n", cooperativity, {
              min: 1, max: 4, step: 1, format: (value) => String(value),
            }, (value) => { cooperativity = value; render(); }),
            rangeControl(el, "External input", signal, {
              min: 0, max: 0.30, step: 0.01, format: (value) => value.toFixed(2),
            }, (value) => { signal = value; render(); }),
            el("div", { class: "lab-control-block" }, [
              el("span", { class: "lab-control-label", text: "Displayed history" }),
              choiceRow(el, [
                { label: "Start low", value: "low" },
                { label: "Start high", value: "high" },
              ], initialState, (value) => { initialState = value; render(); }, "Feedback starting history"),
            ]),
            el("div", { class: "readout" }, [
              stat(result.lowFinal.toFixed(2), "low-start endpoint"),
              stat(result.highFinal.toFixed(2), "high-start endpoint"),
              stat(result.memory ? "yes" : "no", "history dependence"),
            ])
          );
          parts.rail.replaceChildren(causalRail(el, [
            { key: "you changed", value: feedbackType + " feedback · n=" + cooperativity + " · input " + signal.toFixed(2) },
            { key: "mechanism", value: "production curve intersects linear removal" },
            { key: "observable", value: result.memory ? "low and high histories remain separated" : "both histories converge" },
          ]));
          parts.explanation.className = "callout " + (result.memory ? "callout-good" : "");
          parts.explanation.innerHTML = result.memory
            ? "<strong>Two stable endpoints under the same current input are memory.</strong> Cooperativity makes the production curve sigmoidal; the unstable middle crossing separates the low and high basins and creates hysteresis."
            : "<strong>A positive arrow is not enough to make a switch.</strong> Without sufficient cooperativity the response remains graded and the two starting histories converge to one state.";
          return;
        }

        if (motifView === "ffl") {
          const result = networkDynamicsModel({ kind: "ffl", loop, pulse });
          parts.visual.innerHTML = fflSvg(result, loop);
          parts.controls.replaceChildren(subTabs,
            el("div", { class: "lab-control-block" }, [
              el("span", { class: "lab-control-label", text: "Feed-forward sign" }),
              choiceRow(el, [
                { label: "Coherent AND", value: "coherent" },
                { label: "Incoherent", value: "incoherent" },
              ], loop, (value) => { loop = value; render(); }, "Feed-forward loop sign"),
            ]),
            rangeControl(el, "Input pulse duration", pulse, {
              min: 0.5, max: 8, step: 0.5, format: (value) => value.toFixed(1),
            }, (value) => { pulse = value; render(); }),
            el("div", { class: "readout" }, [
              stat(result.behavior, "circuit behavior"),
              stat(result.peak.toFixed(2), "peak output"),
              stat(result.final.toFixed(2), "late output"),
            ])
          );
          parts.rail.replaceChildren(causalRail(el, [
            { key: "you changed", value: loop + " loop · pulse " + pulse.toFixed(1) },
            { key: "mechanism", value: loop === "coherent" ? "X and delayed Y must both be high" : "X activates immediately; delayed Y represses" },
            { key: "observable", value: result.behavior },
          ]));
          parts.explanation.className = "callout";
          parts.explanation.innerHTML = loop === "coherent"
            ? "<strong>The delayed arm rejects brief inputs.</strong> A sustained signal lets Y cross threshold, so output turns on late and turns off immediately when X disappears—a persistence detector."
            : "<strong>The direct arm wins first and the delayed repressor catches up.</strong> The output is a pulse even when the input is a step; miRNAs often implement the repressing arm.";
          return;
        }

        const result = networkDynamicsModel({ kind: "stateMachine", circuit: stateCircuit, pulse: togglePulse, delay });
        parts.visual.replaceChildren(processBoard(el, stateCircuit === "toggle" ? [
          { label: "X represses Y", value: togglePulse === "x" ? "pulse X" : "mutual edge" },
          { label: "Y represses X", value: togglePulse === "y" ? "pulse Y" : "mutual edge" },
          { label: "network state", value: result.state, tone: "active" },
          { label: "behavior", value: result.behavior },
        ] : [
          { label: "repressor rises", value: "target output falls" },
          { label: "delayed removal", value: delay.toFixed(1) + " time units" },
          { label: "repressor falls", value: "target output recovers" },
          { label: "behavior", value: result.behavior, tone: "active" },
        ], "Toggle and oscillator state-machine behavior"));
        parts.controls.replaceChildren(subTabs,
          el("div", { class: "lab-control-block" }, [
            el("span", { class: "lab-control-label", text: "State machine" }),
            choiceRow(el, [
              { label: "Mutual-repression toggle", value: "toggle" },
              { label: "Delayed negative clock", value: "oscillator" },
            ], stateCircuit, (value) => { stateCircuit = value; render(); }, "Network state machine"),
          ]),
          stateCircuit === "toggle"
            ? el("div", { class: "lab-control-block" }, [
              el("span", { class: "lab-control-label", text: "Transient pulse" }),
              choiceRow(el, [
                { label: "Pulse X", value: "x" },
                { label: "Pulse Y", value: "y" },
                { label: "No new pulse", value: "none" },
              ], togglePulse, (value) => { togglePulse = value; render(); }, "Toggle input pulse"),
            ])
            : rangeControl(el, "Feedback delay", delay, {
              min: 0.5, max: 5, step: 0.5, format: (value) => value.toFixed(1),
            }, (value) => { delay = value; render(); }),
          el("div", { class: "readout" }, [
            stat(result.circuit, "wiring"),
            stat(result.state, "current state"),
            stat(result.behavior, "behavior"),
            stat(result.requirement, "required feature"),
          ])
        );
        parts.rail.replaceChildren(causalRail(el, [
          { key: "you changed", value: stateCircuit === "toggle" ? "pulse " + togglePulse : "delay " + delay.toFixed(1) },
          { key: "mechanism", value: result.circuit },
          { key: "observable", value: result.behavior },
        ]));
        parts.explanation.className = "callout";
        parts.explanation.innerHTML = stateCircuit === "toggle"
          ? "<strong>Mutual repression makes two self-consistent states.</strong> A transient pulse can choose a winner; after the pulse disappears, each high repressor keeps the alternative low."
          : "<strong>Negative feedback stabilises only when it responds quickly.</strong> Add enough delay and nonlinearity, and correction overshoots repeatedly—a limit cycle such as the segmentation clock.";
        return;
      }

      if (mode === "pattern") {
        const subTabs = el("div", { class: "lab-control-block compact-submode" }, [
          el("span", { class: "lab-control-label", text: "Patterning view" }),
          choiceRow(el, [
            { label: "Gradient to stripe", value: "stripe" },
            { label: "Hox selector", value: "hox" },
          ], patternView, (value) => { patternView = value; render(); }, "Developmental patterning view"),
        ]);
        if (patternView === "stripe") {
          const result = networkDynamicsModel({ kind: "pattern", lambda });
          parts.visual.replaceChildren(patternBoard(el, result));
          parts.controls.replaceChildren(subTabs,
            rangeControl(el, "Bicoid decay length λ", lambda, {
              min: 0.15, max: 0.55, step: 0.01, format: (value) => value.toFixed(2) + " embryo lengths",
            }, (value) => { lambda = value; render(); }),
            el("div", { class: "readout" }, [
              stat(result.stripeCells + " of 25", "eve stripe-2 cells"),
              stat("Bcd + Hb + not Giant + not Krüppel", "enhancer query"),
              stat("independent stripe enhancer", "periodicity source"),
            ])
          );
          parts.rail.replaceChildren(causalRail(el, [
            { key: "you changed", value: "gradient decay length " + lambda.toFixed(2) },
            { key: "mechanism", value: "gap-domain activators and repressors are queried by one eve enhancer" },
            { key: "observable", value: result.stripeCells + " cells form a sharp stripe" },
          ]));
          parts.explanation.className = "callout";
          parts.explanation.innerHTML = "<strong>The gradient supplies a rough coordinate; the enhancer computes a narrow window.</strong> Seven independent stripe queries create periodic output from an aperiodic set of gap-gene domains—there is no stripe counter or upstream oscillator.";
          return;
        }

        const result = networkDynamicsModel({ kind: "hox", perturbation: hoxPerturbation });
        parts.visual.replaceChildren(processBoard(el, [
          { label: "cluster state", value: hoxPerturbation === "normal" ? "ordered domain" : hoxPerturbation + " selector perturbation" },
          { label: "segment receiving selector", value: result.source },
          { label: "identity chosen", value: result.destination, tone: hoxPerturbation === "normal" ? "active" : "blocked" },
          { label: "architectural inference", value: result.meaning },
        ], "Hox genes select identity without encoding the structure-building programme"));
        parts.controls.replaceChildren(subTabs,
          el("div", { class: "lab-control-block" }, [
            el("span", { class: "lab-control-label", text: "Hox perturbation" }),
            choiceRow(el, [
              { label: "Normal colinearity", value: "normal" },
              { label: "Loss of function", value: "loss" },
              { label: "Ectopic expression", value: "ectopic" },
            ], hoxPerturbation, (value) => { hoxPerturbation = value; render(); }, "Hox selector perturbation"),
          ]),
          el("div", { class: "readout" }, [
            stat(result.source, "starting segment"),
            stat(result.destination, "resulting identity"),
            stat(result.meaning, "what the phenotype shows"),
          ])
        );
        parts.rail.replaceChildren(causalRail(el, [
          { key: "you changed", value: hoxPerturbation },
          { key: "mechanism", value: "selector routes among pre-existing developmental subroutines" },
          { key: "observable", value: result.destination },
        ]));
        parts.explanation.className = "callout";
        parts.explanation.innerHTML = "<strong>A homeotic transformation changes identity, not the capacity to build.</strong> A leg in place of an antenna proves the leg programme was already available in the head; the Hox factor selected it.";
        return;
      }

      const subTabs = el("div", { class: "lab-control-block compact-submode" }, [
        el("span", { class: "lab-control-label", text: "Long-term network behavior" }),
        choiceRow(el, [
          { label: "Reprogramming", value: "attractor" },
          { label: "Buffering & evolution", value: "buffer" },
        ], identityView, (value) => { identityView = value; render(); }, "Long-term network behavior"),
      ]);
      if (identityView === "attractor") {
        const result = networkDynamicsModel({ kind: "attractor", forcedFactors, barrier });
        parts.visual.replaceChildren(processBoard(el, [
          { label: "starting attractor", value: "fibroblast" },
          { label: "forced nodes", value: forcedFactors + " of 4 Yamanaka factors", tone: forcedFactors === 4 ? "active" : "muted" },
          { label: "barrier strength", value: barrier + "%" },
          { label: "outcome", value: result.state + " · " + percent(result.probability, 2), tone: result.probability > 0.01 ? "active" : "blocked" },
        ], "Reprogramming changes network state while genome content remains complete"));
        parts.controls.replaceChildren(subTabs,
          rangeControl(el, "Forced reprogramming factors", forcedFactors, {
            min: 0, max: 4, step: 1, format: (value) => value + " of 4",
          }, (value) => { forcedFactors = value; render(); }),
          rangeControl(el, "Attractor barrier", barrier, {
            min: 20, max: 98, step: 1, format: (value) => value + "%",
          }, (value) => { barrier = value; render(); }),
          el("div", { class: "readout" }, [
            stat(result.genome, "genome content"),
            stat(result.state, "network outcome"),
            stat(percent(result.probability, 2), "illustrative conversion chance"),
          ])
        );
        parts.rail.replaceChildren(causalRail(el, [
          { key: "you changed", value: forcedFactors + " factors · barrier " + barrier + "%" },
          { key: "mechanism", value: "forced nodes push a cell out of a self-maintaining attractor" },
          { key: "observable", value: result.state },
        ]));
        parts.explanation.className = "callout";
        parts.explanation.innerHTML = "<strong>Nuclear transfer and iPSC induction show that differentiation does not discard the genome.</strong> The probability is explicitly illustrative; the experimentally load-bearing observation is rare, stochastic conversion despite unchanged sequence content.";
        return;
      }

      const result = networkDynamicsModel({ kind: "buffer", variant, shadowEnhancer, stress });
      parts.visual.replaceChildren(processBoard(el, [
        { label: "perturbation", value: variant === "coding" ? "shared protein-coding function" : "one tissue-specific enhancer" },
        { label: "redundancy", value: shadowEnhancer ? "shadow enhancer present" : "no backup", tone: shadowEnhancer ? "active" : "muted" },
        { label: "environmental load", value: stress + "%" },
        { label: "phenotype loss", value: percent(result.phenotypeLoss, 0) + " · " + result.pleiotropy, tone: result.phenotypeLoss > 0.25 ? "blocked" : "active" },
      ], "Network buffering changes the visible effect of the same perturbation"));
      parts.controls.replaceChildren(subTabs,
        el("div", { class: "lab-control-block" }, [
          el("span", { class: "lab-control-label", text: "Variant target" }),
          choiceRow(el, [
            { label: "Coding sequence", value: "coding" },
            { label: "Tissue enhancer", value: "enhancer" },
          ], variant, (value) => { variant = value; render(); }, "Developmental variant target"),
        ]),
        el("div", { class: "lab-control-block" }, [
          el("span", { class: "lab-control-label", text: "Shadow enhancer" }),
          choiceRow(el, [
            { label: "Present", value: true }, { label: "Absent", value: false },
          ], shadowEnhancer, (value) => { shadowEnhancer = value; render(); }, "Shadow enhancer state"),
        ]),
        rangeControl(el, "Environmental stress", stress, {
          min: 0, max: 100, step: 5, format: (value) => value + "%",
        }, (value) => { stress = value; render(); }),
        el("div", { class: "readout" }, [
          stat(percent(result.phenotypeLoss, 0), "phenotype loss"),
          stat(result.pleiotropy, "affected scope"),
          stat(result.hidden ? "yes" : "no", "buffered in easy assay"),
        ])
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "you changed", value: variant + " variant · shadow " + (shadowEnhancer ? "present" : "absent") + " · stress " + stress + "%" },
        { key: "mechanism", value: "redundant regulatory input absorbs perturbation until demand rises" },
        { key: "observable", value: percent(result.phenotypeLoss, 0) + " loss across " + result.pleiotropy },
      ]));
      parts.explanation.className = "callout";
      parts.explanation.innerHTML = "<strong>Modular enhancers give evolution a low-pleiotropy route.</strong> A coding change follows the factor into every deployment; a Pel-like enhancer deletion can remove one anatomical expression domain while leaving the protein and its other jobs intact.";
    }

    predict(body, {
      widget: "network-dynamics-lab",
      question: "Can positive autoregulation with Hill coefficient n = 1 create two stable expression states under the same input?",
      hint: "With n = 1 the production curve is concave and cannot make three intersections with linear removal.",
      options: [
        { label: "Yes—any positive feedback stores memory" },
        { label: "Yes—if transcription is fast enough" },
        { label: "No—cooperativity greater than one is required", correct: true },
        { label: "No—positive feedback can never be stable" },
      ],
    }, () => {
      mode = "motifs";
      motifView = "feedback";
      feedbackType = "positive";
      cooperativity = 1;
      signal = 0.02;
      parts.instrument.hidden = false;
      render();
    });
    finishLab(parts, body);
  });

  function defectBoard(el, result, defect) {
    const board = el("div", {
      class: "reg-defect-board",
      role: "img",
      "aria-label": result.label + " mutant. " + result.geometry + ". This predicts " + result.periodicity + ".",
    });
    board.append(el("span", { class: "reg-defect-title", text: "embryonic cuticle pattern" }));
    const strip = el("div", { class: "reg-segment-strip", "aria-hidden": "true" });
    for (let index = 0; index < 14; index += 1) {
      const missing = defect === "gap" ? index >= 4 && index <= 8
        : defect === "pairRule" ? index % 2 === 1
          : index % 1 === 0;
      const partial = defect === "polarity";
      strip.append(el("span", {
        class: "reg-segment" + (missing ? " is-missing" : "") + (partial ? " is-partial" : ""),
        text: String(index + 1),
      }));
    }
    board.append(strip);
    board.append(statusStrip(el, [
      { label: "phenotype class", value: result.label, tone: "active" },
      { label: "geometry", value: result.geometry },
      { label: "molecular prediction", value: result.periodicity },
      { label: "inferred tier", value: result.tier },
    ], "Mutant defect classification"));
    return board;
  }

  define("developmental-genetics-lab", {
    "ch25a-o1": "Fate mode changes lineage versus positional logic and predicts both cell-ablation and transplantation outcomes",
    "ch25a-o2": "Screen mode maps gap, pair-rule, and segment-polarity cuticle geometry to molecular periodicity and cascade tier",
    "ch25a-o3": "Homeosis mode uses the sign of loss and ectopic transformations to infer selector action and separable identity",
    "ch25a-o4": "Epistasis mode changes pathway type and all four validity conditions before translating a double-mutant phenotype into order",
    "ch25a-o5": "Origin mode classifies representative tissues and syndromic features by germ layer and neural-crest route",
    "ch25a-o6": "Targeting mode places neo inside and HSV-tk outside homology arms and derives survival under positive-negative selection",
    "ch25a-o7": "Conditional mode separates allele, spatial driver, temporal inducer, lox orientation, mosaicism, and lineage-tracing inheritance",
  }, function (api) {
    const { body, el, stat, predict } = api;
    const parts = labParts(el);
    let mode = "fate";
    let fateView = "ablation";
    let fateLogic = "lineage";
    let tissue = "melanocyte";
    let phenotypeView = "screen";
    let defect = "pairRule";
    let homeosisPerturbation = "loss";
    let pathway = "switch";
    let alleles = "clamps";
    let phenotypes = "opposite";
    let relationship = "same";
    let alleleView = "targeting";
    let targetingEvent = "correct";
    let driver = true;
    let tissueDriver = "intestinal stem cells";
    let inducible = true;
    let tamoxifen = true;
    let orientation = "same";
    let conditionalPurpose = "knockout";

    function render() {
      parts.tabHost.replaceChildren(tabs(el, [
        { label: "Fate logic", value: "fate" },
        { label: "Phenotype → pathway", value: "phenotype" },
        { label: "Build an allele", value: "allele" },
      ], mode, (value) => { mode = value; render(); }));

      if (mode === "fate") {
        const subTabs = el("div", { class: "lab-control-block compact-submode" }, [
          el("span", { class: "lab-control-label", text: "Developmental coordinate" }),
          choiceRow(el, [
            { label: "Ablate / transplant", value: "ablation" },
            { label: "Embryonic origin", value: "origin" },
          ], fateView, (value) => { fateView = value; render(); }, "Developmental fate view"),
        ]);
        if (fateView === "ablation") {
          const result = developmentalGeneticsModel({ kind: "fate", logic: fateLogic });
          parts.visual.replaceChildren(processBoard(el, [
            { label: "fate information", value: fateLogic === "lineage" ? "inherited determinant" : "received positional signal", tone: "active" },
            { label: "ablate one precursor", value: result.afterAblation },
            { label: "transplant elsewhere", value: result.afterTransplant },
            { label: "system trade-off", value: result.tradeoff },
          ], "Ablation and transplantation distinguish lineage-driven from positional specification"));
          parts.controls.replaceChildren(subTabs,
            el("div", { class: "lab-control-block" }, [
              el("span", { class: "lab-control-label", text: "Fate logic" }),
              choiceRow(el, [
                { label: "Lineage / mosaic", value: "lineage" },
                { label: "Position / regulative", value: "position" },
              ], fateLogic, (value) => { fateLogic = value; render(); }, "Developmental fate logic"),
            ]),
            el("div", { class: "readout" }, [
              stat(result.afterAblation, "after ablation"),
              stat(result.afterTransplant, "after transplant"),
              stat(result.scaling, "field scaling"),
            ])
          );
          parts.rail.replaceChildren(causalRail(el, [
            { key: "you changed", value: fateLogic + " fate logic" },
            { key: "mechanism", value: fateLogic === "lineage" ? "local asymmetric inheritance" : "neighbours re-read position" },
            { key: "observable", value: result.afterAblation },
          ]));
          parts.explanation.className = "callout";
          parts.explanation.innerHTML = "<strong>No cell reads a pedigree.</strong> Invariant lineage is an emergent output of local asymmetric divisions, and even C. elegans uses positional induction at the vulva. Every real embryo mixes both logics.";
          return;
        }

        const result = developmentalGeneticsModel({ kind: "origin", tissue });
        parts.visual.replaceChildren(processBoard(el, [
          { label: "observed tissue", value: tissue.replace(/([A-Z])/g, " $1"), tone: "active" },
          { label: "germ-layer ancestry", value: result.layer },
          { label: "developmental route", value: result.route },
          { label: "diagnostic note", value: result.note },
        ], "Embryonic ancestry connects anatomically separated tissues"));
        parts.controls.replaceChildren(subTabs,
          el("div", { class: "lab-control-block" }, [
            el("span", { class: "lab-control-label", text: "Adult tissue or cell" }),
            choiceRow(el, [
              { label: "Epidermis", value: "epidermis" },
              { label: "CNS neuron", value: "neuron" },
              { label: "Heart", value: "heart" },
              { label: "Liver", value: "liver" },
              { label: "Melanocyte", value: "melanocyte" },
              { label: "Cranial bone", value: "cranialBone" },
              { label: "Enteric neuron", value: "entericNeuron" },
            ], tissue, (value) => { tissue = value; render(); }, "Embryonic-origin fixture"),
          ]),
          el("div", { class: "readout" }, [
            stat(result.layer, "germ layer"),
            stat(result.route, "lineage route"),
            stat(result.note, "why it matters"),
          ])
        );
        parts.rail.replaceChildren(causalRail(el, [
          { key: "you changed", value: tissue.replace(/([A-Z])/g, " $1") },
          { key: "mechanism", value: result.route },
          { key: "observable", value: result.layer + " ancestry" },
        ]));
        parts.explanation.className = "callout";
        parts.explanation.innerHTML = "<strong>Germ layer describes ancestry, not material.</strong> Cranial neural crest can make bone while remaining ectodermal in origin; melanocytes, enteric neurons, and craniofacial structures share a lineage despite sharing little anatomy.";
        return;
      }

      if (mode === "phenotype") {
        const subTabs = el("div", { class: "lab-control-block compact-submode" }, [
          el("span", { class: "lab-control-label", text: "Genetic inference" }),
          choiceRow(el, [
            { label: "Cuticle screen", value: "screen" },
            { label: "Homeosis", value: "homeosis" },
            { label: "Double mutant", value: "epistasis" },
          ], phenotypeView, (value) => { phenotypeView = value; render(); }, "Developmental genetic inference"),
        ]);
        if (phenotypeView === "screen") {
          const result = developmentalGeneticsModel({ kind: "screen", defect });
          parts.visual.replaceChildren(defectBoard(el, result, defect));
          parts.controls.replaceChildren(subTabs,
            el("div", { class: "lab-control-block" }, [
              el("span", { class: "lab-control-label", text: "Geometry of missing pattern" }),
              choiceRow(el, [
                { label: "Contiguous block", value: "gap" },
                { label: "Every second segment", value: "pairRule" },
                { label: "Part of every segment", value: "polarity" },
              ], defect, (value) => { defect = value; render(); }, "Embryonic cuticle defect"),
            ]),
            el("div", { class: "readout" }, [
              stat(result.label, "mutant class"),
              stat(result.periodicity, "predicted expression"),
              stat(result.tier, "cascade tier"),
            ])
          );
          parts.rail.replaceChildren(causalRail(el, [
            { key: "you changed", value: result.geometry },
            { key: "mechanism", value: "defect periodicity reports the spatial scale of gene action" },
            { key: "observable", value: result.label + " class → " + result.periodicity },
          ]));
          parts.explanation.className = "callout callout-good";
          parts.explanation.innerHTML = "<strong>The phenotype class came before the molecule.</strong> Alternate missing segments predicted seven-stripe pair-rule expression years before even-skipped was cloned; the shape of the wreckage revealed the architecture.";
          return;
        }

        if (phenotypeView === "homeosis") {
          const result = developmentalGeneticsModel({ kind: "homeosis", perturbation: homeosisPerturbation });
          parts.visual.replaceChildren(processBoard(el, [
            { label: "selector perturbation", value: homeosisPerturbation === "loss" ? "Hox loss of function" : "ectopic Hox expression" },
            { label: "homeotic sign", value: result.transformation, tone: "blocked" },
            { label: "what remained", value: "structure-building programme" },
            { label: "inference", value: result.inference },
          ], "The sign of a homeotic transformation reveals selector action"));
          parts.controls.replaceChildren(subTabs,
            el("div", { class: "lab-control-block" }, [
              el("span", { class: "lab-control-label", text: "Selector perturbation" }),
              choiceRow(el, [
                { label: "Loss of function", value: "loss" },
                { label: "Ectopic expression", value: "ectopic" },
              ], homeosisPerturbation, (value) => { homeosisPerturbation = value; render(); }, "Homeotic selector perturbation"),
            ]),
            el("div", { class: "readout" }, [
              stat(result.transformation, "transformation"),
              stat(result.inference, "selector inference"),
            ])
          );
          parts.rail.replaceChildren(causalRail(el, [
            { key: "you changed", value: homeosisPerturbation },
            { key: "mechanism", value: "selector state is changed above an intact structural programme" },
            { key: "observable", value: result.transformation },
          ]));
          parts.explanation.className = "callout";
          parts.explanation.innerHTML = "<strong>Homeosis separates ‘which structure’ from ‘how to build it’.</strong> Loss pushes posterior tissue toward anterior default; ectopic expression pushes anterior tissue toward a posterior identity.";
          return;
        }

        const result = developmentalGeneticsModel({
          kind: "epistasis", pathway, alleles, phenotypes, relationship,
          upstreamPhenotype: "precursor / OFF", downstreamPhenotype: "product / ON",
        });
        parts.visual.replaceChildren(processBoard(el, [
          { label: "assay type", value: pathway === "switch" ? "regulatory state" : "accumulating substrate" },
          { label: "two mutations", value: alleles === "clamps" ? "null or constitutive clamps" : "at least one hypomorph", tone: alleles === "clamps" ? "active" : "blocked" },
          { label: "single phenotypes", value: phenotypes, tone: phenotypes === "opposite" ? "active" : "blocked" },
          { label: "double-mutant inference", value: result.epistatic + " · " + result.rule, tone: result.valid ? "active" : "blocked" },
        ], "Epistasis orders a pathway only when all inference conditions hold"));
        parts.controls.replaceChildren(subTabs,
          el("div", { class: "lab-control-block" }, [
            el("span", { class: "lab-control-label", text: "What the assay reads" }),
            choiceRow(el, [
              { label: "Switch output", value: "switch" },
              { label: "Substrate accumulation", value: "substrate" },
            ], pathway, (value) => { pathway = value; render(); }, "Epistasis pathway type"),
          ]),
          el("div", { class: "lab-control-block" }, [
            el("span", { class: "lab-control-label", text: "Allele quality" }),
            choiceRow(el, [
              { label: "True clamps", value: "clamps" },
              { label: "Hypomorph present", value: "hypomorph" },
            ], alleles, (value) => { alleles = value; render(); }, "Epistasis allele quality"),
          ]),
          el("div", { class: "lab-control-block" }, [
            el("span", { class: "lab-control-label", text: "Single-mutant phenotypes" }),
            choiceRow(el, [
              { label: "Opposite", value: "opposite" },
              { label: "Same", value: "same" },
            ], phenotypes, (value) => { phenotypes = value; render(); }, "Epistasis single-mutant phenotypes"),
          ]),
          el("div", { class: "lab-control-block" }, [
            el("span", { class: "lab-control-label", text: "Gene relationship" }),
            choiceRow(el, [
              { label: "Same pathway", value: "same" },
              { label: "Parallel pathways", value: "parallel" },
            ], relationship, (value) => { relationship = value; render(); }, "Epistasis gene relationship"),
          ]),
          el("div", { class: "readout" }, [
            stat(result.valid ? "yes" : "no", "ordering valid"),
            stat(result.doublePhenotype, "double phenotype"),
            stat(result.epistatic, "epistatic position"),
            stat(result.rule, "rule"),
          ])
        );
        parts.rail.replaceChildren(causalRail(el, [
          { key: "you changed", value: pathway + " · " + alleles + " · " + phenotypes + " · " + relationship },
          { key: "mechanism", value: result.rule },
          { key: "observable", value: result.valid ? result.epistatic : "no defensible ordering" },
        ]));
        parts.explanation.className = "callout " + (result.valid ? "callout-good" : "");
        parts.explanation.innerHTML = result.valid
          ? "<strong>The direction rule depends on what the assay measures.</strong> In a switch, the last clamp wins and the downstream mutation is epistatic; in a substrate chain, the earliest block wins and the upstream mutation is epistatic."
          : "<strong>This double mutant cannot order the genes.</strong> Both alleles must be full clamps, the single phenotypes must oppose, and the genes must share one pathway before epistasis becomes a positional inference.";
        return;
      }

      const subTabs = el("div", { class: "lab-control-block compact-submode" }, [
        el("span", { class: "lab-control-label", text: "Allele engineering" }),
        choiceRow(el, [
          { label: "Positive–negative selection", value: "targeting" },
          { label: "Conditional / lineage", value: "conditional" },
        ], alleleView, (value) => { alleleView = value; render(); }, "Allele engineering view"),
      ]);
      if (alleleView === "targeting") {
        const result = developmentalGeneticsModel({ kind: "targeting", event: targetingEvent });
        parts.visual.replaceChildren(matrixBoard(el, ["neo inside arms", "HSV-tk outside", "G418", "ganciclovir", "survives both"], [{
          label: targetingEvent,
          cells: [
            { value: result.neo ? "gained" : "absent", tone: result.neo ? "active" : "muted" },
            { value: result.tk ? "gained" : "absent", tone: result.tk ? "blocked" : "active" },
            { value: result.g418 ? "resistant" : "killed", tone: result.g418 ? "active" : "blocked" },
            { value: result.ganciclovir ? "resistant" : "killed", tone: result.ganciclovir ? "active" : "blocked" },
            { value: result.survivesBoth ? "YES" : "NO", tone: result.survivesBoth ? "active" : "blocked" },
          ],
        }], "Positive-negative selection distinguishes homologous targeting from random integration and no uptake"));
        parts.controls.replaceChildren(subTabs,
          el("div", { class: "lab-control-block" }, [
            el("span", { class: "lab-control-label", text: "Integration event" }),
            choiceRow(el, [
              { label: "No uptake", value: "none" },
              { label: "Correct targeting", value: "correct" },
              { label: "Random insertion", value: "random" },
            ], targetingEvent, (value) => { targetingEvent = value; render(); }, "Gene-targeting integration event"),
          ]),
          el("div", { class: "readout" }, [
            stat(result.result, "selection result"),
            stat(result.g418 ? "survives" : "dies", "G418"),
            stat(result.ganciclovir ? "survives" : "dies", "ganciclovir"),
            stat(result.survivesBoth ? "candidate" : "discard", "next step"),
          ])
        );
        parts.rail.replaceChildren(causalRail(el, [
          { key: "you changed", value: targetingEvent + " event" },
          { key: "mechanism", value: "positive selects DNA uptake; negative removes intact random insertions" },
          { key: "observable", value: result.result },
        ]));
        parts.explanation.className = "callout " + (result.survivesBoth ? "callout-good" : "");
        parts.explanation.innerHTML = "<strong>Marker position turns molecular geometry into a set difference.</strong> neo lies inside the arms and enters by either route; HSV-tk lies outside and enters only with the intact randomly integrated vector. Survival enriches—it does not prove—correct targeting.";
        return;
      }

      const result = developmentalGeneticsModel({
        kind: "conditional", driver, tissue: tissueDriver,
        inducible, tamoxifen, orientation,
      });
      parts.visual.replaceChildren(processBoard(el, [
        { label: "floxed allele", value: conditionalPurpose === "lineage" ? "lox-stop-lox reporter" : "essential exon between loxP sites" },
        { label: "spatial trigger", value: driver ? tissueDriver + " Cre" : "no Cre driver", tone: driver ? "active" : "muted" },
        { label: "temporal trigger", value: result.temporal },
        { label: "DNA outcome", value: result.dnaOutcome, tone: result.active ? "active" : "muted" },
        { label: "descendants", value: conditionalPurpose === "lineage" && result.active ? "reporter remains ON in every descendant" : result.descendants },
      ], "Conditional alleles separate what, where, and when"));
      parts.controls.replaceChildren(subTabs,
        el("div", { class: "lab-control-block" }, [
          el("span", { class: "lab-control-label", text: "Purpose" }),
          choiceRow(el, [
            { label: "Conditional knockout", value: "knockout" },
            { label: "Lineage trace", value: "lineage" },
          ], conditionalPurpose, (value) => { conditionalPurpose = value; render(); }, "Conditional allele purpose"),
        ]),
        el("div", { class: "lab-control-block" }, [
          el("span", { class: "lab-control-label", text: "Cre driver" }),
          choiceRow(el, [
            { label: "Absent", value: false }, { label: "Present", value: true },
          ], driver, (value) => { driver = value; render(); }, "Cre driver state"),
        ]),
        el("div", { class: "lab-control-block" }, [
          el("span", { class: "lab-control-label", text: "Driver lineage" }),
          choiceRow(el, [
            { label: "Intestinal stem cells", value: "intestinal stem cells" },
            { label: "T cells", value: "T cells" },
            { label: "Neural crest", value: "neural crest" },
          ], tissueDriver, (value) => { tissueDriver = value; render(); }, "Cre driver lineage"),
        ]),
        el("div", { class: "lab-control-block" }, [
          el("span", { class: "lab-control-label", text: "Temporal control" }),
          choiceRow(el, [
            { label: "Constitutive Cre", value: false },
            { label: "CreER inducible", value: true },
          ], inducible, (value) => { inducible = value; render(); }, "Cre temporal control"),
        ]),
        inducible ? el("div", { class: "lab-control-block" }, [
          el("span", { class: "lab-control-label", text: "Tamoxifen" }),
          choiceRow(el, [
            { label: "Absent", value: false }, { label: "Pulse", value: true },
          ], tamoxifen, (value) => { tamoxifen = value; render(); }, "Tamoxifen pulse"),
        ]) : el("span"),
        el("div", { class: "lab-control-block" }, [
          el("span", { class: "lab-control-label", text: "loxP orientation" }),
          choiceRow(el, [
            { label: "→ … → excise", value: "same" },
            { label: "→ … ← invert", value: "opposite" },
          ], orientation, (value) => { orientation = value; render(); }, "LoxP relative orientation"),
        ]),
        el("div", { class: "readout" }, [
          stat(result.active ? "yes" : "no", "Cre active"),
          stat(result.dnaOutcome, "DNA result"),
          stat(result.descendants, "lineage inheritance"),
          stat(result.mosaic, "experimental caution"),
        ])
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "you changed", value: conditionalPurpose + " · " + (driver ? tissueDriver : "no driver") + " · " + result.temporal },
        { key: "mechanism", value: "Cre reads loxP orientation and irreversibly recombines DNA" },
        { key: "observable", value: result.dnaOutcome },
      ]));
      parts.explanation.className = "callout";
      parts.explanation.innerHTML = conditionalPurpose === "lineage"
        ? "<strong>Read the same irreversible event forwards.</strong> Excising a stop cassette applies a permanent label at one moment; every descendant retains it even after Cre disappears, converting a driver into a lineage recorder."
        : "<strong>The floxed allele is intentionally functional until Cre acts.</strong> Spatial restriction comes from the promoter, temporal restriction from CreER plus tamoxifen, and incomplete recombination means the tissue must be measured as a mosaic—not assumed null.";
    }

    predict(body, {
      widget: "developmental-genetics-lab",
      question: "A fly embryo is missing every second segment. What did that phenotype predict before the gene was cloned?",
      hint: "The periodicity of the defect reports the periodicity of gene action.",
      options: [
        { label: "A broad gap-gene domain" },
        { label: "Seven pair-rule stripes", correct: true },
        { label: "Fourteen segment-polarity stripes" },
        { label: "A Hox coding mutation" },
      ],
    }, () => {
      mode = "phenotype";
      phenotypeView = "screen";
      defect = "pairRule";
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
