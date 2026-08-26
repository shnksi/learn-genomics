/* ── Genome-instability interaction wave ─────────────────────────────────
   Objective-mapped Hero Labs for Chapters 16–20A. Scientific models are
   pure and exported for fixture tests; views are local SVG/HTML so the reader
   remains fully functional from file:// with no runtime requests.
   ───────────────────────────────────────────────────────────────────────── */

(function (global) {
  "use strict";

  const definitions = {};
  const models = {};
  const coverage = {};
  const kit = global.ReaderInteractionKit;
  if (!kit) throw new Error("ReaderInteractionKit must load before genome-instability labs");

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

  function mean(values) {
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }

  function sampleVariance(values) {
    const centre = mean(values);
    return values.reduce((sum, value) => sum + (value - centre) ** 2, 0) /
      Math.max(1, values.length - 1);
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
      instrument: el("div", { class: "hero-lab instability-lab", hidden: true }),
      tabHost: el("div"),
      visual: el("div", { class: "lab-visual instability-visual" }),
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

  function svgLines(className, x, y, lines, step, anchor) {
    const alignment = anchor ? ' text-anchor="' + anchor + '"' : "";
    const lineStep = Math.max(22, step || 18);
    return '<text class="' + className + '"' + alignment + ">" +
      lines.map((line, index) => '<tspan x="' + x + '" y="' +
        (y + index * lineStep) + '">' + line + "</tspan>").join("") +
      "</text>";
  }

  function wrapWords(value, limit) {
    const words = String(value).split(/\s+/);
    const lines = [];
    let line = "";
    words.forEach((word) => {
      const next = line ? line + " " + word : word;
      if (line && next.length > limit) {
        lines.push(line);
        line = word;
      } else {
        line = next;
      }
    });
    if (line) lines.push(line);
    return lines;
  }

  function textSvg(html, label, viewBox, extraClass) {
    return '<svg class="lab-diagram instability-diagram ' + (extraClass || "") +
      '" viewBox="' + (viewBox || "0 0 500 270") + '" role="img" aria-label="' +
      label + '">' + html + "</svg>";
  }

  function statusStrip(el, items, label) {
    const strip = el("div", {
      class: "instability-status-strip",
      role: "img",
      "aria-label": label + ". " + items.map((item) => item.label + ": " + item.value).join(". "),
    });
    items.forEach((item) => strip.append(el("div", {
      class: "instability-status" + (item.tone ? " is-" + item.tone : ""),
    }, [
      el("span", { text: item.label }),
      el("strong", { text: item.value }),
    ])));
    return strip;
  }

  function barBoard(el, rows, label, maximum) {
    const max = maximum || Math.max(1e-9, ...rows.map((row) => row.value));
    const board = el("div", {
      class: "instability-bars",
      role: "img",
      "aria-label": label + ". " + rows.map((row) =>
        row.label + " " + (row.display || percent(row.value, 1))
      ).join(", "),
    });
    rows.forEach((row) => board.append(el("div", { class: "instability-bar-row" }, [
      el("span", { class: "instability-bar-name", text: row.label }),
      el("span", { class: "instability-bar-track", "aria-hidden": "true" }, [
        el("span", {
          class: "instability-bar-fill" + (row.tone ? " is-" + row.tone : ""),
          style: "width:" + (100 * row.value / max).toFixed(2) + "%",
        }),
      ]),
      el("strong", { text: row.display || percent(row.value, 1) }),
    ])));
    return board;
  }

  /* Ch 16 — mutation forensics ------------------------------------------ */

  const MUTATION_FIXTURES = {
    uvDimer: {
      label: "UV links two adjacent pyrimidines before replication",
      permanence: "damage", lineage: "somatic skin cell", scale: "chemical lesion",
      molecular: "pyrimidine dimer", consequence: "sequence not changed yet",
      detection: "NER can still read the opposite strand",
    },
    cpgTransition: {
      label: "C:G becomes T:A in a gamete precursor",
      permanence: "mutation", lineage: "germline", scale: "1 bp SNV",
      molecular: "C→T transition", consequence: "depends on sequence",
      detection: "trio sequencing can find it in the child",
    },
    frameshift: {
      label: "one coding base is deleted in an early embryo",
      permanence: "mutation", lineage: "post-zygotic mosaic", scale: "1 bp indel",
      molecular: "deletion", consequence: "frameshift downstream",
      detection: "variant fraction differs between tissues",
    },
    aluInsertion: {
      label: "a 300 bp Alu inserts into a germ-cell intron",
      permanence: "mutation", lineage: "germline", scale: "structural variant",
      molecular: "mobile-element insertion", consequence: "may alter splicing",
      detection: "split/discordant reads; routine exome may miss it",
    },
    tumourSnv: {
      label: "one colon clone acquires a correctly paired APC SNV",
      permanence: "mutation", lineage: "somatic clone", scale: "1 bp SNV",
      molecular: "base substitution", consequence: "possible clonal advantage",
      detection: "tumour–normal subtraction is required",
    },
    trisomy: {
      label: "a gamete contributes two chromosome 21 homologues",
      permanence: "mutation", lineage: "germline conceptus", scale: "chromosomal",
      molecular: "aneuploid copy gain", consequence: "dosage of ~220 genes",
      detection: "karyotype, array, or sequencing copy number",
    },
  };

  const MUTATION_PROCESSES = {
    chance: {
      label: "uniform substitution null", profile: [1, 1, 1, 1, 1, 1],
      signature: "4 transition routes versus 8 transversion routes gives Ti/Tv = 0.5",
      context: "no sequence preference", ames: "no mutagen-specific tester response",
    },
    human: {
      label: "human germline mixture", profile: [0.09, 0.08, 0.40, 0.07, 0.277, 0.083],
      signature: "illustrative six-class mixture with Ti/Tv ≈ 2.1",
      context: "CpG plus general transition-favouring chemistry",
      ames: "a mixture, not one compound",
    },
    cpg: {
      label: "5-methyl-C deamination", profile: [0.02, 0.02, 0.90, 0.02, 0.02, 0.02],
      signature: "C→T concentrated at CpG",
      context: "T is a normal base, so repair must guess at G:T",
      ames: "base-substitution tester responds if exposure raises this lesion",
    },
    uv: {
      label: "UV", profile: [0.02, 0.03, 0.82, 0.03, 0.07, 0.03],
      signature: "C→T at dipyrimidines plus diagnostic CC→TT",
      context: "covalent pyrimidine dimers",
      ames: "base-substitution tester; direct irradiation does not need S9",
    },
    tobacco: {
      label: "tobacco adducts", profile: [0.68, 0.07, 0.08, 0.07, 0.05, 0.05],
      signature: "C→A (the reverse-complement view of G→T)",
      context: "bulky guanine adducts and oxidative damage",
      ames: "often stronger with liver S9 activation",
    },
    alkylator: {
      label: "alkylating agent", profile: [0.03, 0.03, 0.82, 0.03, 0.06, 0.03],
      signature: "G:C→A:T transition bias",
      context: "O6-alkylguanine pairs with T",
      ames: "base-substitution tester responds",
    },
    intercalator: {
      label: "intercalator", profile: [0, 0, 0, 0, 0, 0],
      signature: "±1 bp indels rather than a six-class substitution peak",
      context: "stacking distortion produces frameshifts",
      ames: "frameshift tester responds",
    },
    nonGenotoxic: {
      label: "non-genotoxic tumour promoter", profile: [0, 0, 0, 0, 0, 0],
      signature: "no direct substitution fingerprint",
      context: "carcinogenesis can act through proliferation or signalling rather than DNA damage",
      ames: "Ames-negative: mutagenicity is not identical to carcinogenicity",
    },
  };

  const MUTATION_CONTEXTS = {
    baseline: { label: "genome-wide mean", rate: 1, driverBias: "reference background" },
    cpg: { label: "methylated CpG", rate: 25, driverBias: "10–50× hotspot; sequence context must enter the null" },
    lateClosed: { label: "late, closed chromatin", rate: 2.4, driverBias: "large late genes can look recurrent without selection" },
    transcribed: { label: "actively transcribed strand", rate: 0.6, driverBias: "TC-NER depresses the local background" },
    recombining: { label: "high-recombination region", rate: 1.5, driverBias: "damage and GC-biased repair alter the local background" },
  };

  const FLUCTUATION_FIXTURES = {
    independent: [1, 0, 0, 7, 0, 303, 0, 1, 0, 48],
    aliquots: [29, 41, 35, 38, 30, 44, 36, 33, 40, 34],
  };

  function mutationForensicsModel(input) {
    if (input.kind === "classify") return Object.assign({}, MUTATION_FIXTURES[input.fixture]);
    if (input.kind === "spectrum") {
      const process = MUTATION_PROCESSES[input.process];
      const total = process.profile.reduce((sum, value) => sum + value, 0);
      const normalised = total ? process.profile.map((value) => value / total) : process.profile.slice();
      const transitions = normalised[2] + normalised[4];
      const transversions = normalised[0] + normalised[1] + normalised[3] + normalised[5];
      return Object.assign({}, process, {
        profile: normalised,
        titv: transversions ? transitions / transversions : null,
      });
    }
    if (input.kind === "deNovo") {
      const baseAt25 = input.rate * 6.2e9;
      const ageAdded = Math.max(0, input.paternalAge - 25) * 1.4;
      const trueCount = baseAt25 + ageAdded;
      return {
        baseAt25, ageAdded, trueCount,
        callableCount: trueCount * input.callableFraction,
        paternal: baseAt25 * 0.8 + ageAdded,
        maternal: baseAt25 * 0.2,
      };
    }
    if (input.kind === "fluctuation") {
      const counts = FLUCTUATION_FIXTURES[input.design].slice();
      const centre = mean(counts);
      const variance = sampleVariance(counts);
      return {
        counts, mean: centre, variance,
        dispersion: variance / centre,
        conclusion: input.design === "independent"
          ? "pre-existing mutation: independent histories create jackpots"
          : "Poisson-like sampling: all aliquots share one history",
      };
    }
    if (input.kind === "context") {
      return Object.assign({
        caveat: "illustrative relative scale; only the CpG range is treated as quantitative",
        failedAnalysis: "a uniform-background recurrence test inflates false driver calls",
      }, MUTATION_CONTEXTS[input.context]);
    }
    throw new Error("Unknown mutation-forensics model");
  }
  models.mutationForensics = mutationForensicsModel;

  /* Ch 17 — repair triage ----------------------------------------------- */

  const REPAIR_ROUTES = {
    o6mG: { lesion: "O6-methylguanine", chemistry: "small modified base", pathway: "direct reversal", sensor: "MGMT", patch: "0 nt", template: "none", result: "methyl transferred; one MGMT molecule consumed", diagramResult: "methyl removed; MGMT spent" },
    uracil: { lesion: "uracil in DNA", chemistry: "small base; helix not distorted", pathway: "base excision repair", sensor: "UNG", patch: "1 nt", template: "opposite strand", result: "AP site → fill C → ligate", diagramResult: "AP site → C fill → ligate" },
    uvDimer: { lesion: "UV pyrimidine dimer", chemistry: "bulky helix distortion", pathway: "nucleotide excision repair", sensor: "XPC or stalled RNA polymerase", patch: "24–32 nt", template: "opposite strand", result: "damaged oligomer excised", diagramResult: "damaged oligomer excised" },
    mismatch: { lesion: "G:T after replication", chemistry: "normal bases, wrong pairing", pathway: "mismatch repair", sensor: "MutSα", patch: "up to ~1 kb", template: "parental strand", result: "PCNA + nick mark the nascent eukaryotic strand", diagramResult: "PCNA + nick mark nascent strand" },
    stalledFork: { lesion: "fork stalled at unrepaired damage", chemistry: "replication obstacle", pathway: "damage tolerance", sensor: "RAD18–PCNA ubiquitin", patch: "lesion remains", template: "TLS or sister switch", result: "bypass preserves the fork; TLS can add mutations", diagramResult: "bypass preserves fork" },
    dsb: { lesion: "double-strand break", chemistry: "both strands severed", pathway: "NHEJ or HR", sensor: "Ku or MRN", patch: "0 to variable", template: "none or sister", result: "resection commits the break away from canonical NHEJ", diagramResult: "resection blocks c-NHEJ" },
  };

  function repairTriageModel(input) {
    if (input.kind === "route") return Object.assign({}, REPAIR_ROUTES[input.lesion]);
    if (input.kind === "budget") {
      const lineageDays = input.years * 365.25;
      const lesions = input.lesionsPerDay * lineageDays;
      const mutations = input.paternalMutations;
      return {
        lesions, mutations,
        residual: mutations / lesions,
        ordersRemoved: -Math.log10(mutations / lesions),
      };
    }
    if (input.kind === "region") {
      const multipliers = {
        openEarly: { rate: 0.65, access: "open chromatin + early replication", bias: "repair favoured" },
        transcribed: { rate: 0.50, access: "RNA polymerase recruits TC-NER", bias: "transcribed strand protected" },
        lateClosed: { rate: 2.40, access: "H3K9me3 + late replication", bias: "repair access/capacity reduced" },
        occupied: { rate: 1.75, access: "protein blocks lesion recognition", bias: "local NER shadow" },
      };
      return Object.assign({}, multipliers[input.region]);
    }
    if (input.kind === "response") {
      const states = {
        repairable: { signal: "ATM/ATR pulse", checkpoint: "CHK1/CHK2 slows the cycle", decision: "transient arrest → repair → resume", fate: "survival with checkpoint release" },
        persistent: { signal: "sustained ATM/ATR", checkpoint: "p53 stabilises p21", decision: "senescence", fate: "alive but permanently non-dividing" },
        catastrophic: { signal: "strong sustained damage", checkpoint: "p53 induces pro-apoptotic genes", decision: "apoptosis", fate: "damaged lineage removed" },
      };
      const result = Object.assign({}, states[input.damage]);
      if (!input.p53Intact && input.damage !== "repairable") {
        result.checkpoint = "p53-dependent transcription fails";
        result.decision = "checkpoint escape";
        result.fate = "division with unrepaired damage and genome instability";
      }
      result.p53Intact = input.p53Intact;
      return result;
    }
    if (input.kind === "dsb") {
      const sister = input.phase === "S" || input.phase === "G2";
      if (input.phase === "M") {
        return { sister: true, resected: true, rad51: false, pathway: "defer", fidelity: "break marked until G1", reason: "mitotic CDK blocks RAD51 loading" };
      }
      if (!sister) {
        return { sister: false, resected: false, rad51: false, pathway: "NHEJ", fidelity: "small junction indels possible", reason: "low CDK and no sister template" };
      }
      if (input.perturbation === "brca1Loss") {
        return { sister: true, resected: false, rad51: false, pathway: "NHEJ", fidelity: "end joining despite a sister", reason: "53BP1–shieldin blocks resection" };
      }
      if (input.perturbation === "brca2Loss") {
        return { sister: true, resected: true, rad51: false, pathway: "failed HR / POLQ escape", fidelity: "deletion-prone", reason: "BRCA2 cannot load RAD51 after resection" };
      }
      return { sister: true, resected: true, rad51: true, pathway: "homologous recombination", fidelity: "sister-templated restoration", reason: input.perturbation === "bp53Loss" ? "resection is unopposed" : "CDK + BRCA1 license resection" };
    }
    if (input.kind === "synthetic") {
      const hrLost = input.genotype !== "normal";
      const trapped = input.drug === "trapping";
      const catalytic = input.drug === "catalytic";
      let rescued = false;
      let rescueReason = "none";
      if (input.resistance === "reversion" && hrLost) {
        rescued = true; rescueReason = "BRCA reading frame restored";
      } else if (input.resistance === "bp53Loss" && input.genotype === "brca1Loss") {
        rescued = true; rescueReason = "resection restored upstream of BRCA2";
      } else if (input.resistance === "forkProtection" && hrLost) {
        rescued = true; rescueReason = "replication gaps protected";
      }
      let viabilityIndex = 1;
      if (trapped && hrLost && !rescued) viabilityIndex = 0;
      else if (catalytic && hrLost && !rescued) viabilityIndex = 0.5;
      else if (trapped && !hrLost) viabilityIndex = 0.75;
      else if (rescued) viabilityIndex = input.resistance === "forkProtection" ? 0.5 : 0.75;
      return {
        hrLost, trapped, rescued, rescueReason, viabilityIndex,
        outcome: viabilityIndex === 0 ? "selective tumour killing" : viabilityIndex < 1 ? "partial sensitivity" : "survival",
      };
    }
    throw new Error("Unknown repair-triage model");
  }
  models.repairTriage = repairTriageModel;

  /* Ch 18 — recombination mechanisms ----------------------------------- */

  function recombinationMechanismModel(input) {
    if (input.kind === "resolution") {
      const paths = {
        sdsa: { intermediate: "D-loop → strand ejection", crossover: false, conversion: true, products: ["broken: A-M-B", "donor: a-M-b"], note: "non-crossover; donor flanks stay linked" },
        sameCuts: { intermediate: "double Holliday junction; same cut sense", crossover: false, conversion: true, products: ["broken: A-M-B", "donor: a-M-b"], note: "resolved non-crossover" },
        oppositeCuts: { intermediate: "double Holliday junction; opposite cut sense", crossover: true, conversion: true, products: ["broken: A-M-b", "partner: a-[heteroduplex]-B"], note: "flanking markers exchanged; the partner tract depends on mismatch repair" },
        dissolution: { intermediate: "junction convergence + decatenation", crossover: false, conversion: true, products: ["broken: A-M-B", "donor: a-M-b"], note: "dissolution can only be non-crossover" },
      };
      const result = Object.assign({}, paths[input.path]);
      const context = input.context || "meiosis";
      Object.assign(result, context === "somatic" ? {
        context: "somatic S/G2 repair",
        breakSource: "accidental damage",
        templatePreference: "sister chromatid",
        outcomeBias: "non-crossover restoration; crossovers risk loss of heterozygosity",
      } : {
        context: "meiotic prophase I",
        breakSource: "programmed SPO11 break",
        templatePreference: "homolog",
        outcomeBias: "mostly non-crossovers, with an assured crossover subset",
      });
      result.gcTransmission = input.gcBias ? 0.68 : 0.50;
      result.gcCopiesPer100 = Math.round(result.gcTransmission * 100);
      return result;
    }
    if (input.kind === "assurance") {
      const lambda = input.crossovers / 23;
      const poissonZero = Math.exp(-lambda);
      const hotspotStates = {
        fresh: { motif: "PRDM9 motif recognised", break: "SPO11 cuts the bound homologue", inheritance: "repair copies the uncut, cold allele into the broken chromatid" },
        eroded: { motif: "current motif eroded", break: "binding and cutting collapse at this hotspot", inheritance: "the hotspot destroys its own target by biased repair" },
        newPrdm9: { motif: "new PRDM9 zinc-finger specificity", break: "a different motif becomes a hotspot", inheritance: "rapid PRDM9 evolution retargets the break landscape" },
      };
      let result;
      if (input.distribution === "assured") {
        result = { lambda, zeroPerBivalent: 0, expectedAchiasmate: 0, allChiasmate: 1, euploidFromThisCause: 1 };
      } else {
        result = {
          lambda,
          zeroPerBivalent: poissonZero,
          expectedAchiasmate: 23 * poissonZero,
          allChiasmate: (1 - poissonZero) ** 23,
          euploidFromThisCause: (1 - poissonZero / 2) ** 23,
        };
      }
      result.hotspot = Object.assign({}, hotspotStates[input.hotspotState || "fresh"]);
      return result;
    }
    if (input.kind === "nahr") {
      if (input.geometry === "directHomologs") return { alignment: "misaligned direct repeats", products: ["deletion", "reciprocal duplication"], homology: "hundreds of bp at a paralogous locus", recurrent: true };
      if (input.geometry === "invertedSame") return { alignment: "inverted repeats on one chromosome", products: ["inversion"], homology: "repeat copies face opposite directions", recurrent: true };
      if (input.geometry === "differentChromosomes") return { alignment: "repeats on non-homologous chromosomes", products: ["reciprocal translocation"], homology: "paralogous repeat, wrong chromosome", recurrent: true };
      if (input.geometry === "siteSpecific") return { alignment: "recombinase-bound recognition sites", products: ["precise integration, excision, or inversion"], homology: "short enzyme-recognition sites; no long homologous tract", recurrent: false };
      if (input.geometry === "transpositional") return { alignment: "element ends captured by transposase", products: ["new insertion", "target-site duplication"], homology: "none between donor and target", recurrent: false };
      return { alignment: "allelic homologues", products: ["crossover or conversion"], homology: "correct locus on homolog/sister", recurrent: false };
    }
    throw new Error("Unknown recombination-mechanism model");
  }
  models.recombinationMechanism = recombinationMechanismModel;

  /* Ch 19 — transposable elements -------------------------------------- */

  const ELEMENT_FIXTURES = {
    l1: { label: "LINE-1", className: "Class I · non-LTR", intermediate: "RNA", movement: "copy-and-paste", sourceStays: true, autonomous: true, humanCompetent: true, engine: "ORF1p + ORF2p", census: "~500,000 copies · ~80–100 competent" },
    alu: { label: "Alu", className: "Class I · SINE", intermediate: "RNA", movement: "copy-and-paste", sourceStays: true, autonomous: false, humanCompetent: true, engine: "borrows L1 ORF2p", census: "~1.1 million copies" },
    erv: { label: "endogenous retrovirus", className: "Class I · LTR", intermediate: "RNA", movement: "historical copy-and-paste", sourceStays: true, autonomous: false, humanCompetent: false, engine: "all human copies now inactive", census: "~8% including solo LTRs" },
    dna: { label: "DNA transposon", className: "Class II", intermediate: "DNA", movement: "historical cut-and-paste", sourceStays: false, autonomous: false, humanCompetent: false, engine: "ancestral transposase + terminal repeats; no active human source", census: "~3% fossils · none active for ~37 Myr" },
    pseudogene: { label: "processed pseudogene", className: "L1-mediated retrocopy", intermediate: "mRNA", movement: "copy-and-paste", sourceStays: true, autonomous: false, humanCompetent: true, engine: "hijacks L1 reverse transcriptase", census: "intronless copy + poly(A) + TSD" },
  };

  function transposonModel(input) {
    if (input.kind === "classify") {
      const element = Object.assign({}, ELEMENT_FIXTURES[input.element]);
      const hostStates = {
        active: { activity: 1, host: "silencing window open", meaning: "selfish replication" },
        silenced: { activity: 0.02, host: "piRNA · KRAB-ZFP/TRIM28 · methylation · APOBEC3", meaning: "fossil or suppressed copy" },
        domesticated: { activity: 0, host: "host regulatory control", meaning: "exaptation: syncytin, RAG, or MER41-like use" },
      };
      const state = Object.assign({}, hostStates[input.hostState]);
      if (input.hostState === "active" && element.humanCompetent && !element.autonomous) {
        state.meaning = "dependent copying using active L1 machinery";
      }
      if (!element.humanCompetent && input.hostState !== "domesticated") {
        state.activity = 0;
        state.host = "no competent human source";
        state.meaning = "historical mechanism; fossil in humans";
      }
      return Object.assign(element, state);
    }
    if (input.kind === "tprt") {
      const steps = {
        1: { label: "first-strand nick", made: "free genomic 3′-OH", polyA: false, tsd: false, truncation: false },
        2: { label: "poly(A) annealing", made: "RNA 3′ end primes at T-rich DNA", polyA: true, tsd: false, truncation: false },
        3: { label: "reverse transcription", made: "cDNA grows 3′ end first", polyA: true, tsd: false, truncation: true },
        4: { label: "second nick + fill", made: "completed insertion", polyA: true, tsd: true, truncation: input.completion < 1 },
      };
      const result = Object.assign({}, steps[input.step]);
      result.lengthKb = input.step < 3 ? 0 : 6 * input.completion;
      result.fivePrimeComplete = input.step === 4 && input.completion === 1;
      result.tsdBp = input.step === 4 ? input.nickSpacing : 0;
      return result;
    }
    if (input.kind === "evidence") {
      const event = input.event;
      const assay = input.assay;
      const table = {
        l1Insertion: {
          exome: { detected: false, confidence: "low", evidence: "soft clips filtered or outside capture", blind: "standard SNV/indel pipeline does not assemble the inserted sequence" },
          shortWgs: { detected: true, confidence: "medium", evidence: "paired soft clips + discordant mates + poly(A)", blind: "repeat source and full length remain ambiguous" },
          longWgs: { detected: true, confidence: "high", evidence: "one read spans both TSDs, poly(A), and truncation", blind: "very low-level mosaic insertions need depth" },
        },
        aluDeletion: {
          exome: { detected: "sometimes", confidence: "low", evidence: "reduced exon depth if captured", blind: "breakpoints sit in Alu repeats outside/at capture edges" },
          shortWgs: { detected: true, confidence: "medium", evidence: "half depth + deletion-spanning pairs", blind: "which Alu copy owns the breakpoint may be ambiguous" },
          longWgs: { detected: true, confidence: "high", evidence: "single molecules span the recombinant Alu junction", blind: "low mosaic fraction" },
        },
        aluExonisation: {
          exome: { detected: false, confidence: "low", evidence: "intronic donor-creating variant lies outside standard capture", blind: "DNA exome does not observe the new Alu-derived RNA exon" },
          shortWgs: { detected: "variant only", confidence: "medium", evidence: "G→C donor-creating SNV plus antisense intronic Alu context", blind: "DNA alone does not prove that the cryptic exon is included" },
          longWgs: { detected: "variant only", confidence: "high for locus", evidence: "phased variant and complete Alu context", blind: "RNA from an expressing tissue is still required to confirm exonisation" },
        },
        snv: {
          exome: { detected: true, confidence: "high in captured exon", evidence: "aligned base mismatch", blind: "non-coding sequence" },
          shortWgs: { detected: true, confidence: "high", evidence: "consistent mismatching bases", blind: "highly repetitive sequence" },
          longWgs: { detected: true, confidence: "high", evidence: "phased mismatching bases", blind: "very low variant fractions" },
        },
      };
      return Object.assign({ event, assay }, table[event][assay]);
    }
    throw new Error("Unknown transposon model");
  }
  models.transposon = transposonModel;

  /* Ch 20 — chromosome-scale workbench --------------------------------- */

  const CHROMOSOME_LOAD = {
    chr21: { chromosome: "21", lengthMb: 47, genes: 220, term: true },
    chr18: { chromosome: "18", lengthMb: 80, genes: 270, term: true },
    chr13: { chromosome: "13", lengthMb: 114, genes: 320, term: true },
    chr19: { chromosome: "19", lengthMb: 59, genes: 1400, term: false },
  };

  function chromosomeWorkbenchModel(input) {
    if (input.kind === "load") {
      const item = Object.assign({}, CHROMOSOME_LOAD[input.chromosome]);
      item.density = item.genes / item.lengthMb;
      item.dosageCopies = 3;
      item.expressionMultiplier = 1.5;
      return item;
    }
    if (input.kind === "origin") {
      const origins = {
        mi: { division: "maternal meiosis I", centromere: "M1 + M2 + P", markerClue: "both maternal centromere alleles retained", diagnosis: "maternal MI nondisjunction signature", lineages: "constitutional trisomy unless a later rescue creates mosaicism" },
        mii: { division: "maternal meiosis II", centromere: "M1 + M1 + P", markerClue: "duplicated maternal centromere allele", diagnosis: "maternal MII nondisjunction signature", lineages: "constitutional trisomy unless a later rescue creates mosaicism" },
        mitosis: { division: "post-zygotic mitosis", centromere: "47-cell line + sibling line", markerClue: "two or more cell lines in one individual", diagnosis: "somatic mosaicism", lineages: "fraction is lineage- and tissue-specific" },
      };
      const result = Object.assign({}, origins[input.origin]);
      result.abnormalFraction = input.origin === "mitosis" ? input.abnormalFraction : 1;
      result.cellsSampled = input.cellsSampled;
      result.abnormalCellsInSample = Math.round(result.abnormalFraction * input.cellsSampled);
      result.missProbability = (1 - result.abnormalFraction) ** input.cellsSampled;
      return result;
    }
    if (input.kind === "age") {
      const denominators = { 20: 1500, 25: 1300, 30: 900, 35: 350, 40: 100, 45: 27.5 };
      const geometries = {
        wellPlaced: { clamp: "arm chiasma + distal cohesion", firstFailure: "centromeric cohesion must still hold sisters through MI", hazard: "lowest of the displayed geometries" },
        absent: { clamp: "no chiasma", firstFailure: "homologues are already univalents", hazard: "segregation is vulnerable even before age-related cohesion loss" },
        distal: { clamp: "terminal chiasma", firstFailure: "small distal cohesion loss lets the exchange slide off", hazard: "age and placement compound" },
        pericentromeric: { clamp: "pericentromeric exchange", firstFailure: "centromeres can orient or disentangle incorrectly", hazard: "MI-origin risk is enriched" },
      };
      const geometry = geometries[input.crossover];
      return Object.assign({
        age: input.age,
        arrestYears: input.age,
        risk: 1 / denominators[input.age],
        riskDenominator: denominators[input.age],
        cohesion: "loaded before fetal-life arrest; not measurably replenished",
      }, geometry);
    }
    if (input.kind === "carrier") {
      if ((input.type === "paracentric" || input.type === "pericentric") && input.event === "outside") {
        return { configuration: "crossover outside inversion", products: ["normal", "normal", "inversion carrier", "inversion carrier"], balanced: 1, reproductive: "no imbalance from this exchange" };
      }
      if (input.type === "paracentric") {
        return { configuration: "one crossover inside paracentric loop", products: ["normal", "inversion carrier", "dicentric", "acentric"], balanced: 0.5, reproductive: "abnormal chromatids usually self-destruct" };
      }
      if (input.type === "pericentric") {
        return { configuration: "one crossover inside pericentric loop", products: ["normal", "inversion carrier", "duplication + deletion", "reciprocal duplication + deletion"], balanced: 0.5, reproductive: "unbalanced products retain centromeres" };
      }
      if (input.type === "robertsonian") {
        const robertsonian = {
          balancedPair: { products: ["normal", "balanced rob(14;21) carrier"], balanced: 1, reproductive: "alternate segregation is balanced" },
          trisomy21Pair: { products: ["translocation trisomy 21", "monosomy 21"], balanced: 0, reproductive: "one Down-syndrome route and one usually lethal monosomy" },
          trisomy14Pair: { products: ["translocation trisomy 14", "monosomy 14"], balanced: 0, reproductive: "both conceptions are usually lost" },
        };
        return Object.assign({ configuration: "rob(14;21) trivalent" }, robertsonian[input.event]);
      }
      const translocations = {
        alternate: { products: ["normal", "balanced carrier"], balanced: 1, reproductive: "alternate segregation is balanced" },
        adjacent1: { products: ["partial monosomy + trisomy", "reciprocal imbalance"], balanced: 0, reproductive: "unbalanced conceptions" },
        adjacent2: { products: ["homologous centromeres together", "reciprocal imbalance"], balanced: 0, reproductive: "rare and unbalanced" },
        threeOne: { products: ["three chromosomes", "one chromosome"], balanced: 0, reproductive: "severe imbalance" },
      };
      const result = Object.assign({}, translocations[input.event]);
      result.configuration = "reciprocal-translocation quadrivalent";
      return result;
    }
    if (input.kind === "rescue") {
      if (input.origin === "trisomy") return { copiesBefore: 3, rescue: "lose one of three", updProbability: 1 / 3, routeProbability: input.lost === "paternal" ? 1 / 3 : 2 / 3, disomy: input.lost === "paternal" ? "maternal heterodisomy" : "biparental", risks: input.lost === "paternal" ? ["imprinting", "parental-origin imbalance"] : ["ordinary biparental dosage"] };
      return { copiesBefore: 1, rescue: "duplicate the single homologue", updProbability: 1, routeProbability: 1, disomy: "isodisomy", risks: ["imprinting", "one carrier parent's recessive becomes homozygous"] };
    }
    if (input.kind === "assay") {
      const matrix = {
        balanced: {
          karyotype: [true, "visible balanced exchange above band resolution"],
          fish: ["targeted", "detects only if the correct probes were chosen"],
          array: [false, "copy number is unchanged"],
          shortWgs: [true, "split/discordant reads if breakpoints are uniquely mappable"],
          longWgs: [true, "spans balanced junctions and repeats"],
        },
        deletion200: {
          karyotype: [false, "200 kb is below 5–10 Mb band resolution"],
          fish: ["targeted", "detects a chosen 200 kb locus"],
          array: [true, "genome-wide copy loss"],
          shortWgs: [true, "depth and breakpoint evidence"],
          longWgs: [true, "direct breakpoint spanning"],
        },
        upd: {
          karyotype: [false, "copy number and chromosome shape are normal"],
          fish: [false, "copy count is normal"],
          array: ["with SNPs/trio", "isodisomy gives homozygosity; heterodisomy needs parental genotypes"],
          shortWgs: ["with trio/phasing", "sequence alone needs parental origin information"],
          longWgs: ["with trio/phasing", "long haplotypes help phase parental origin"],
        },
        mosaic10: {
          karyotype: ["sample-dependent", "30 matching-tissue cells give ~95.8% chance of seeing ≥1"],
          fish: ["targeted", "many interphase nuclei can quantify a chosen locus"],
          array: ["borderline", "10% log-ratio shift can sit near platform thresholds"],
          shortWgs: [true, "allele fraction and depth if coverage is adequate"],
          longWgs: ["depth-dependent", "long reads do not replace enough molecules"],
        },
        repeatJunction: {
          karyotype: [false, "event is below band resolution"],
          fish: ["targeted", "only a preselected locus"],
          array: [true, "detects imbalance but not the repeat-mediated junction"],
          shortWgs: ["often weak", "near-identical repeats defeat unique alignment"],
          longWgs: [true, "reads span repeat and unique flanks"],
        },
      };
      const [detected, explanation] = matrix[input.event][input.assay];
      return { detected, explanation };
    }
    if (input.kind === "cnv") {
      if (input.view === "dosage") {
        const states = {
          common: { copies: "population-variable", locus: "gene-poor common CNV", phenotype: "often healthy", interpretation: "reference difference alone is not pathogenicity" },
          pmp22One: { copies: 1, locus: "17p12 · PMP22", phenotype: "HNPP", interpretation: "deletion lowers dosage" },
          pmp22Two: { copies: 2, locus: "17p12 · PMP22", phenotype: "usual dosage", interpretation: "same protein sequence, normal copy count" },
          pmp22Three: { copies: 3, locus: "17p12 · PMP22", phenotype: "CMT1A", interpretation: "reciprocal duplication raises dosage" },
        };
        return Object.assign({ view: "dosage" }, states[input.state]);
      }
      const evidenceCount = Number(input.twoStates) + Number(input.clustered) + Number(input.randomJoins);
      return {
        view: "catastrophe",
        evidenceCount,
        diagnosis: evidenceCount === 3 ? "chromothripsis signature" : evidenceCount >= 2 ? "suggestive, incomplete" : "progressive rearrangement remains plausible",
        mechanism: evidenceCount === 3 ? "one chromosome shattered in a micronucleus and re-ligated once" : "the full one-event signature is not established",
      };
    }
    throw new Error("Unknown chromosome-workbench model");
  }
  models.chromosomeWorkbench = chromosomeWorkbenchModel;

  /* Ch 20A — bacterial and phage genetics ------------------------------- */

  const HFR_MARKERS = [
    { name: "thr", minute: 0 }, { name: "pro", minute: 5.6 },
    { name: "lac", minute: 7.9 }, { name: "gal", minute: 17.1 },
    { name: "trp", minute: 28.5 }, { name: "his", minute: 45.0 },
  ];

  function microbialGeneticsModel(input) {
    if (input.kind === "route") {
      if (input.dnaseBlocks) return { route: "transformation", courier: "naked DNA", ruledOut: "capsid/contact routes", decisive: "DNase destroys transfer" };
      if (input.filterBlocks) return { route: "conjugation", courier: "mating junction", ruledOut: "diffusible DNA and phage", decisive: "physical separation abolishes transfer" };
      if (input.filtrateTransfers) return { route: "transduction", courier: "phage particle", ruledOut: "contact and naked DNA", decisive: "cell-free, DNase-resistant filtrate transfers" };
      return { route: "unresolved", courier: "none established", ruledOut: "three canonical routes not uniquely supported", decisive: "test contamination, reversion, cross-feeding" };
    }
    if (input.kind === "plasmid") {
      const shared = input.control === "shared";
      return {
        coexist: !shared,
        controllerSees: shared ? "the sum of both plasmids" : "each replicon separately",
        outcome: shared ? "one lineage drifts to loss" : "stable coexistence is possible",
        principle: "incompatibility follows shared replication/partition control, not overall sequence identity",
      };
    }
    if (input.kind === "fprime") {
      const complements = input.relationship === "differentGenes";
      return {
        complements,
        recipient: "haploid chromosome: " + (input.relationship === "differentGenes" ? "lacZ− lacY+" : "lacZ− allele 1"),
        fprime: "F′ episome: " + (input.relationship === "differentGenes" ? "lacZ+ lacY−" : "lacZ− allele 2"),
        localPloidy: "two copies only across the F′-carried lac interval",
        phenotype: complements ? "Lac+ function restored in trans" : "Lac−; neither copy supplies the missing function",
        inference: complements ? "mutations affect different genes" : "mutations fall in the same complementation group",
      };
    }
    if (input.kind === "rFactor") {
      const transferred = input.contact;
      return {
        transferred,
        donor: "Enterobacterales donor",
        recipient: "different recipient species",
        module: "replicon + tra genes + transposon/integron resistance cassette",
        phenotype: transferred ? "recipient gains multi-drug resistance as one selected module" : "physical separation blocks conjugative transfer",
        implication: transferred ? "one mobile plasmid can cross species; its cassettes can then reshuffle" : "the resistance genes did not diffuse independently",
      };
    }
    if (input.kind === "hfr") {
      const delay = 6;
      const lambda = Math.log(10) / 45;
      const markers = HFR_MARKERS.map((marker) => {
        const distance = input.direction === "forward" ? marker.minute : (100 - marker.minute) % 100;
        const arrival = delay + distance;
        return {
          name: marker.name, distance, arrival,
          arrived: arrival <= input.time,
          plateau: 0.30 * Math.exp(-lambda * distance),
        };
      }).sort((a, b) => a.arrival - b.arrival);
      return { delay, lambda, markers, arrived: markers.filter((marker) => marker.arrived) };
    }
    if (input.kind === "cotransduction") {
      const informativeDistance = clamp(input.distance, 0, input.fragmentLength);
      const c = input.distance >= input.fragmentLength
        ? 0
        : (1 - informativeDistance / input.fragmentLength) ** 3;
      return {
        c,
        inferredDistance: input.fragmentLength * (1 - Math.cbrt(c)),
        saturated: input.distance >= input.fragmentLength,
        resolutionLimited: input.distance < 0.03 * input.fragmentLength,
      };
    }
    if (input.kind === "lambda") {
      if (input.genotype === "cIminus") return { state: "lysis", ci: 0, cro: 1, plaque: "clear", memory: "no cI maintenance" };
      if (input.genotype === "cIIminus") return { state: "lysis-biased", ci: 0.1, cro: 0.9, plaque: "mostly clear", memory: "cI is not efficiently established" };
      if (input.condition === "damage") return { state: "lysis", ci: 0, cro: 1, plaque: "clear after induction", memory: "RecA* stimulates cI self-cleavage" };
      if (input.condition === "highMoi") return { state: "lysogeny", ci: 1, cro: 0, plaque: "turbid", memory: "cI positive feedback restores the high-cI attractor" };
      return { state: "lysis", ci: 0.1, cro: 0.9, plaque: "clear", memory: "Cro blocks PRM before cI is established" };
    }
    if (input.kind === "benzer") {
      const differentFunctions = input.relationship === "differentCistrons";
      const effectiveDistanceBp = differentFunctions ? Math.max(1, input.distanceBp) : input.distanceBp;
      const rawOneEventFloor = 1 / input.progeny;
      const effectiveSelectionFloor = Math.max(rawOneEventFloor, 1e-8);
      return {
        complements: differentFunctions,
        recombines: effectiveDistanceBp > 0,
        effectiveDistanceBp,
        complementationQuestion: "same function?",
        recombinationQuestion: "same position?",
        rawOneEventFloor,
        detectionFloor: effectiveSelectionFloor,
        selectionGainOrders: Math.max(0, Math.log10(1e-4 / effectiveSelectionFloor)),
        mapResolutionBp: 0.02 * (168903 / 1600),
        canResolveRareEvent: effectiveDistanceBp > 0 && input.progeny >= 1e8,
      };
    }
    throw new Error("Unknown microbial-genetics model");
  }
  models.microbialGenetics = microbialGeneticsModel;

  /* Ch 16 view ----------------------------------------------------------- */

  function mutationClassSvg(result) {
    const scaleType = result.scale === "structural variant"
      ? "SV · " + result.molecular.replace("mobile-element insertion", "mobile insertion")
      : result.scale + " · " + result.molecular;
    const columns = [
      ["state", result.permanence],
      ["lineage", result.lineage],
      ["scale · type", scaleType],
      ["effect", result.consequence],
    ];
    const boxes = columns.map((column, index) => {
      const x = 12 + index * 122;
      const lines = wrapWords(column[1], 10).slice(0, 4);
      return '<g class="forensic-column' + (index === 0 ? " is-primary" : "") + '">' +
        '<rect x="' + x + '" y="78" width="110" height="146" rx="7"/>' +
        '<text class="lab-svg-kicker" x="' + (index === columns.length - 1 ? x + 100 : x + 10) +
          '" y="102"' + (index === columns.length - 1 ? ' text-anchor="end"' : "") + '>' +
          column[0] + "</text>" +
        svgLines("forensic-value", x + 55, 130, lines, 22, "middle") +
        "</g>" + (index < columns.length - 1
          ? '<path class="fault-arrow" d="M' + (x + 112) + ' 151 H' + (x + 122) + '"/>'
          : "");
    }).join("");
    return textSvg(
      svgLines("lab-svg-kicker", 18, 24, wrapWords(result.label, 40).slice(0, 2), 20) +
      '<path class="fault-line" d="M22 240 H478"/>' + boxes +
      '<text class="lab-svg-label" x="250" y="270" text-anchor="middle">' +
        result.detection + "</text>",
      result.label + ". It is " + result.permanence + " in a " + result.lineage +
        ", classified as " + result.scale + " and " + result.molecular +
        ". Consequence: " + result.consequence + ". " + result.detection + ".",
      "0 0 500 292",
      "mutation-class-diagram"
    );
  }

  function signatureBoard(el, result) {
    const labels = ["C>A", "C>G", "C>T", "T>A", "T>C", "T>G"];
    const max = Math.max(0.01, ...result.profile);
    const board = el("div", {
      class: "signature-board",
      role: "img",
      "aria-label": result.label + ". Six substitution classes: " + labels.map((label, index) =>
        label + " " + percent(result.profile[index], 1)
      ).join(", ") + ". " + result.signature + ".",
    });
    board.append(el("div", { class: "signature-columns", "aria-hidden": "true" },
      result.profile.map((value, index) => el("div", { class: "signature-column" }, [
        el("span", { class: "signature-value", text: value ? percent(value, 0) : "—" }),
        el("span", { class: "signature-track" }, [
          el("span", {
            class: "signature-fill" + (index === 2 || index === 4 ? " is-transition" : ""),
            style: "height:" + (100 * value / max).toFixed(2) + "%",
          }),
        ]),
        el("strong", { text: labels[index] }),
      ]))
    ));
    board.append(el("p", { class: "signature-context", text: result.signature }));
    return board;
  }

  function deNovoSvg(result, rate, paternalAge, callableFraction) {
    const trueWidth = Math.min(420, result.trueCount * 4.3);
    const calledWidth = trueWidth * callableFraction;
    return textSvg(
      svgLines("lab-svg-kicker", 18, 24, [
        "diploid genome · 6.2 Gb × " + rate.toExponential(1) + " per bp",
        "father age " + paternalAge + " · callable genome " + percent(callableFraction, 0),
      ], 20) +
      '<text class="mutation-rate-label" x="22" y="110">true de novo count</text>' +
      '<rect class="mutation-rate-track" x="22" y="124" width="420" height="38" rx="5"/>' +
      '<rect class="mutation-rate-true" x="22" y="124" width="' + trueWidth.toFixed(1) + '" height="38" rx="5"/>' +
      '<text class="mutation-rate-value" x="34" y="150">' + result.trueCount.toFixed(1) + "</text>" +
      '<text class="mutation-rate-label" x="22" y="196">short-read callable count</text>' +
      '<rect class="mutation-rate-track" x="22" y="210" width="420" height="38" rx="5"/>' +
      '<rect class="mutation-rate-called" x="22" y="210" width="' + calledWidth.toFixed(1) + '" height="38" rx="5"/>' +
      '<text class="mutation-rate-value" x="34" y="236">' + result.callableCount.toFixed(1) + "</text>",
      "At rate " + rate + " per base over 6.2 billion diploid bases and paternal age " +
        paternalAge + ", the model gives " + result.trueCount.toFixed(1) +
        " true de novo point mutations. At " + percent(callableFraction, 0) +
        " callable sequence, " + result.callableCount.toFixed(1) + " are reported.",
      "0 0 500 270",
      "mutation-rate-diagram"
    );
  }

  function fluctuationBoard(el, result, design) {
    const max = Math.max(...result.counts);
    const board = el("div", {
      class: "culture-board",
      role: "img",
      "aria-label": (design === "independent" ? "Ten independent cultures" : "Ten aliquots of one culture") +
        ". Resistant colony counts " + result.counts.join(", ") +
        ". Mean " + result.mean.toFixed(1) + ", sample variance " + result.variance.toFixed(1) +
        ", variance to mean " + result.dispersion.toFixed(2) + ".",
    });
    board.append(el("div", { class: "culture-columns", "aria-hidden": "true" },
      result.counts.map((value, index) => el("div", { class: "culture-column" }, [
        el("span", { class: "culture-count", text: String(value) }),
        el("span", { class: "culture-vial" }, [
          el("span", {
            class: "culture-fill" + (value > result.mean * 3 ? " is-jackpot" : ""),
            style: "height:" + (100 * value / Math.max(1, max)).toFixed(2) + "%",
          }),
        ]),
        el("small", { text: String(index + 1) }),
      ]))
    ));
    board.append(el("p", { class: "culture-conclusion", text: result.conclusion }));
    return board;
  }

  define("mutation-forensics-lab", {
    "ch16-o1": "Identity mode classifies every fixture by scale, molecular type, and consequence",
    "ch16-o2": "Spectrum mode compares the 0.5 null with the human and lesion-specific Ti/Tv mixtures",
    "ch16-o3": "De novo counter exposes genome size, callable fraction, and paternal-age arithmetic",
    "ch16-o4": "Identity mode separates damage/mutation and germline/somatic/mosaic lineages",
    "ch16-o5": "Spectrum states connect mutagens, lesion bias, Ames tester class, and S9",
    "ch16-o6": "Fluctuation mode holds the mean fixed and changes independent versus shared histories",
    "ch16-o7": "Genome-context submode changes the local null and exposes false driver calls from a uniform-background test",
  }, function (api) {
    const { body, el, stat, predict } = api;
    const parts = labParts(el);
    let mode = "identity";
    let fixture = "uvDimer";
    let spectrumView = "signature";
    let process = "human";
    let genomicContext = "cpg";
    let rate = 1.2e-8;
    let paternalAge = 30;
    let callableFraction = 0.85;
    let design = "independent";

    function render() {
      parts.tabHost.replaceChildren(tabs(el, [
        { label: "Mutation identity", value: "identity" },
        { label: "Spectrum & rate", value: "spectrum" },
        { label: "Fluctuation histories", value: "fluctuation" },
      ], mode, (next) => { mode = next; render(); }));

      if (mode === "identity") {
        const result = mutationForensicsModel({ kind: "classify", fixture });
        parts.visual.innerHTML = mutationClassSvg(result);
        parts.controls.replaceChildren(
          el("div", { class: "lab-control-block" }, [
            el("span", { class: "lab-control-label", text: "Observed event" }),
            choiceRow(el, [
              { label: "UV dimer", value: "uvDimer" },
              { label: "CpG C→T", value: "cpgTransition" },
              { label: "1 bp deletion", value: "frameshift" },
              { label: "Alu insertion", value: "aluInsertion" },
              { label: "Tumour SNV", value: "tumourSnv" },
              { label: "Trisomy 21", value: "trisomy" },
            ], fixture, (value) => { fixture = value; render(); }, "Mutation fixture"),
          ]),
          el("div", { class: "readout" }, [
            stat(result.permanence, "chemical state"),
            stat(result.lineage, "lineage"),
            stat(result.scale, "scale"),
          ])
        );
        parts.rail.replaceChildren(causalRail(el, [
          { key: "you changed", value: result.label },
          { key: "mechanism", value: result.molecular + " in " + result.lineage },
          { key: "observable", value: result.detection },
        ]));
        parts.explanation.className = "callout " + (result.permanence === "damage" ? "callout-good" : "");
        parts.explanation.innerHTML = result.permanence === "damage"
          ? "<strong>The sequence has not changed.</strong> A chemically abnormal strand still disagrees with an intact template, so repair has evidence. Replication past it can erase that evidence and fix a mutation."
          : "<strong>Three classifications answer different questions.</strong> Scale selects the assay, molecular type points to mechanism, consequence predicts phenotype, and lineage decides inheritance.";
        return;
      }

      if (mode === "spectrum") {
        const subTabs = el("div", { class: "lab-control-block compact-submode" }, [
          el("span", { class: "lab-control-label", text: "Evidence view" }),
          choiceRow(el, [
            { label: "Six-class fingerprint", value: "signature" },
            { label: "De novo accounting", value: "rate" },
            { label: "Genome context", value: "context" },
          ], spectrumView, (value) => { spectrumView = value; render(); }, "Spectrum evidence view"),
        ]);
        if (spectrumView === "signature") {
          const result = mutationForensicsModel({ kind: "spectrum", process });
          parts.visual.replaceChildren(signatureBoard(el, result));
          parts.controls.replaceChildren(subTabs,
            el("div", { class: "lab-control-block" }, [
              el("span", { class: "lab-control-label", text: "Data-generating process" }),
              choiceRow(el, [
                { label: "Uniform null", value: "chance" },
                { label: "Human germline", value: "human" },
                { label: "CpG", value: "cpg" },
                { label: "UV", value: "uv" },
                { label: "Tobacco", value: "tobacco" },
                { label: "Alkylator", value: "alkylator" },
                { label: "Intercalator", value: "intercalator" },
                { label: "Non-genotoxic carcinogen", value: "nonGenotoxic" },
              ], process, (value) => { process = value; render(); }, "Mutational process"),
            ]),
            el("div", { class: "readout" }, [
              stat(result.titv == null ? "not defined" : result.titv.toFixed(2), "Ti/Tv"),
              stat(result.context, "mechanistic context"),
              stat(result.ames, "Ames expectation"),
            ])
          );
          parts.rail.replaceChildren(causalRail(el, [
            { key: "you changed", value: result.label },
            { key: "mechanism", value: result.context },
            { key: "observable", value: result.signature },
          ]));
          parts.explanation.className = "callout";
          parts.explanation.innerHTML = "<strong>A signature is a joint distribution, not a magic label.</strong> These six channels are a deliberately compressed teaching view; real tumour signatures split them by both flanking bases into 96 channels and infer mixtures, not single causes.";
          return;
        }

        if (spectrumView === "context") {
          const contextKeys = ["baseline", "cpg", "lateClosed", "transcribed", "recombining"];
          const result = mutationForensicsModel({ kind: "context", context: genomicContext });
          const rows = contextKeys.map((key) => {
            const item = mutationForensicsModel({ kind: "context", context: key });
            return {
              label: item.label,
              value: item.rate,
              display: item.rate.toFixed(1) + "×",
              tone: key === genomicContext ? "active" : "muted",
            };
          });
          parts.visual.replaceChildren(barBoard(el, rows, "Illustrative local mutation-rate contexts", 25));
          parts.controls.replaceChildren(subTabs,
            el("div", { class: "lab-control-block" }, [
              el("span", { class: "lab-control-label", text: "Locus presented to a recurrence test" }),
              choiceRow(el, [
                { label: "Genome mean", value: "baseline" },
                { label: "Methylated CpG", value: "cpg" },
                { label: "Late + closed", value: "lateClosed" },
                { label: "Transcribed strand", value: "transcribed" },
                { label: "High recombination", value: "recombining" },
              ], genomicContext, (value) => { genomicContext = value; render(); }, "Genomic mutation context"),
            ]),
            el("div", { class: "readout" }, [
              stat(result.rate.toFixed(1) + "×", "illustrative local rate"),
              stat(result.driverBias, "uniform-null consequence"),
            ])
          );
          parts.rail.replaceChildren(causalRail(el, [
            { key: "you changed", value: result.label },
            { key: "mechanism", value: result.driverBias },
            { key: "observable", value: result.rate.toFixed(1) + "× versus the teaching baseline" },
          ]));
          parts.explanation.className = "callout " + (genomicContext === "baseline" ? "" : "callout-bad");
          parts.explanation.innerHTML = "<strong>A recurrence test needs a local null.</strong> " + result.failedAnalysis + ". The bars are an explicitly illustrative teaching scale; CpG is the only state assigned the chapter's quantitative 10–50× range.";
          return;
        }

        const result = mutationForensicsModel({
          kind: "deNovo", rate, paternalAge, callableFraction,
        });
        parts.visual.innerHTML = deNovoSvg(result, rate, paternalAge, callableFraction);
        parts.controls.replaceChildren(subTabs,
          el("div", { class: "lab-control-block" }, [
            el("span", { class: "lab-control-label", text: "Age-25 baseline point-mutation rate" }),
            choiceRow(el, [
              { label: "1.1 × 10⁻⁸", value: 1.1e-8 },
              { label: "1.2 × 10⁻⁸", value: 1.2e-8 },
              { label: "1.3 × 10⁻⁸", value: 1.3e-8 },
            ], rate, (value) => { rate = value; render(); }, "Mutation rate"),
          ]),
          rangeControl(el, "Paternal age", paternalAge, {
            min: 25, max: 50, step: 1, format: (value) => value + " years",
          }, (value) => { paternalAge = value; render(); }),
          rangeControl(el, "Callable fraction", callableFraction, {
            min: 0.70, max: 1, step: 0.05, format: (value) => percent(value, 0),
          }, (value) => { callableFraction = value; render(); }),
          el("div", { class: "readout" }, [
            stat(result.trueCount.toFixed(1), "true de novo SNVs"),
            stat(result.callableCount.toFixed(1), "reported by this callability"),
            stat(result.ageAdded.toFixed(1), "added since paternal age 25"),
          ])
        );
        parts.rail.replaceChildren(causalRail(el, [
          { key: "you changed", value: "rate, age, and callable genome" },
          { key: "mechanism", value: "multiply rate by 6.2 Gb, then add paternal-age slope" },
          { key: "observable", value: result.callableCount.toFixed(1) + " called of " + result.trueCount.toFixed(1) + " true" },
        ]));
        parts.explanation.className = "callout";
        parts.explanation.innerHTML = "<strong>The naive product estimates biology; callability estimates the paper.</strong> The 1.4-per-year paternal-age slope and 80:20 parental split are population averages, not an individual prediction.";
        return;
      }

      const result = mutationForensicsModel({ kind: "fluctuation", design });
      parts.visual.replaceChildren(fluctuationBoard(el, result, design));
      parts.controls.replaceChildren(
        el("div", { class: "lab-control-block" }, [
          el("span", { class: "lab-control-label", text: "Ten plates receive" }),
          choiceRow(el, [
            { label: "Ten independent culture histories", value: "independent" },
            { label: "Ten aliquots of one shared history", value: "aliquots" },
          ], design, (value) => { design = value; render(); }, "Fluctuation-test design"),
        ]),
        el("div", { class: "readout" }, [
          stat(result.mean.toFixed(1), "mean resistant colonies"),
          stat(result.variance.toFixed(1), "sample variance"),
          stat(result.dispersion.toFixed(2), "variance / mean"),
        ])
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "you changed", value: design === "independent" ? "independent growth histories" : "one shared growth history" },
        { key: "mechanism", value: design === "independent" ? "an early mutation seeds a jackpot clone" : "only plating noise differs" },
        { key: "observable", value: "same mean; dispersion " + result.dispersion.toFixed(2) },
      ]));
      parts.explanation.className = "callout " + (design === "independent" ? "callout-good" : "");
      parts.explanation.innerHTML = "<strong>Variance dates an event you never saw.</strong> The independent-culture jackpot rules out mutation induced independently at plating; it does not claim mutation is uniform or unaffected by stress.";
    }

    predict(body, {
      widget: "mutation-forensics-lab",
      question: "Ten cultures and ten aliquots have the same mean resistant-colony count. Which design should show jackpots if resistance mutations arose before phage exposure?",
      hint: "Ask whether each plate has its own growth history or inherits one shared history.",
      options: [
        { label: "Independent cultures", correct: true },
        { label: "Aliquots of one culture" },
        { label: "Both must be Poisson" },
        { label: "The means alone distinguish them" },
      ],
    }, () => {
      mode = "fluctuation";
      parts.instrument.hidden = false;
      render();
    });
    finishLab(parts, body);
  });

  /* Ch 17 view ----------------------------------------------------------- */

  function repairRouteSvg(result) {
    const values = [result.chemistry, result.pathway, result.template, result.diagramResult || result.result];
    const titles = ["lesion clue", "route", "redundancy", "outcome"];
    const stations = values.map((value, index) => {
      const x = 12 + index * 122;
      return '<g class="repair-station' + (index === 1 ? " is-route" : "") + '">' +
        '<circle cx="' + (x + 55) + '" cy="136" r="48"/>' +
        '<text class="lab-svg-kicker" x="' + (x + 55) + '" y="82" text-anchor="middle">' + titles[index] + "</text>" +
        svgLines("repair-value", x + 55, 120, wrapWords(value, 10).slice(0, 3), 22, "middle") +
        "</g>" + (index < values.length - 1
          ? '<path class="fault-arrow" d="M' + (x + 104) + ' 136 H' + (x + 128) + '"/>'
          : "");
    }).join("");
    return textSvg(
      svgLines("lab-svg-kicker", 18, 24, [result.lesion, result.sensor + " · patch " + result.patch], 20) +
      stations,
      result.lesion + " is routed to " + result.pathway + " by " + result.sensor +
        ". Patch " + result.patch + ", using " + result.template + ". " + result.result + ".",
      "0 0 500 220",
      "repair-route-diagram"
    );
  }

  function repairBudgetSvg(result, lesionsPerDay, years) {
    const residualWidth = Math.max(3, 430 * Math.min(1, result.residual * 1e7));
    return textSvg(
      svgLines("lab-svg-kicker", 18, 24, [
        lesionsPerDay.toLocaleString("en-GB") + " lesions/day × " + years + " years",
        "follow one paternal lineage",
        "not every body cell",
      ], 20) +
      '<path class="repair-funnel" d="M32 82 H468 L276 190 H224 Z"/>' +
      '<text class="repair-funnel-input" x="250" y="110" text-anchor="middle">' + result.lesions.toExponential(2) + " lesions</text>" +
      '<rect class="repair-residual-track" x="35" y="215" width="430" height="28" rx="4"/>' +
      '<rect class="repair-residual" x="35" y="215" width="' + residualWidth.toFixed(2) + '" height="28" rx="4"/>' +
      svgLines("repair-funnel-output", 250, 258, [
        "60 transmitted changes",
        "residual " + result.residual.toExponential(2),
      ], 20, "middle"),
      "A lineage exposed to " + result.lesions.toExponential(2) + " lesions leaves 60 transmitted changes, a residual of " +
        result.residual.toExponential(2) + " or about " + result.ordersRemoved.toFixed(1) + " orders removed.",
      "0 0 500 288",
      "repair-budget-diagram"
    );
  }

  function dsbChoiceSvg(result, phase, perturbation) {
    const resection = result.resected ? "resect" : "protect ends";
    const rad51 = result.rad51 ? "RAD51 loaded" : "RAD51 unavailable";
    return textSvg(
      svgLines("lab-svg-kicker", 18, 24, [phase + " phase · " + perturbation.replace(/([A-Z])/g, " $1").toLowerCase(), result.reason], 20) +
      '<path class="broken-dna" d="M40 108 H218 M282 108 H460"/>' +
      '<path class="broken-end" d="M218 93 L235 108 L218 123 M282 93 L265 108 L282 123"/>' +
      '<path class="fault-line" d="M250 128 V166 M115 166 H385"/>' +
      '<g class="dsb-branch' + (!result.resected ? " is-active" : "") + '"><rect x="40" y="180" width="180" height="70" rx="7"/><text x="130" y="207" text-anchor="middle">end protection</text><text class="lab-svg-label" x="130" y="232" text-anchor="middle">NHEJ</text></g>' +
      '<g class="dsb-branch' + (result.resected ? " is-active" : "") + '"><rect x="280" y="180" width="180" height="70" rx="7"/><text x="370" y="207" text-anchor="middle">' + resection + '</text><text class="lab-svg-label" x="370" y="232" text-anchor="middle">' + rad51 + "</text></g>" +
      svgLines("dsb-outcome", 250, 268, wrapWords(result.pathway + " · " + result.fidelity, 40).slice(0, 2), 22, "middle"),
      phase + " phase with " + perturbation + ": " + result.reason + ". The break follows " +
        result.pathway + " with " + result.fidelity + ".",
      "0 0 500 312",
      "dsb-choice-diagram"
    );
  }

  function syntheticBoard(el, result, genotype, drug) {
    const board = el("div", {
      class: "synthetic-board",
      role: "img",
      "aria-label": "Synthetic-lethality matrix. HR intact with PARP available survives. HR lost alone survives. PARP trapped with HR intact is stressed but usually survives. Selected state " +
        genotype + " with " + drug + " gives " + result.outcome + ".",
    });
    board.append(el("div", { class: "synthetic-axis top", text: "PARP1 / gap handling →" }));
    board.append(el("div", { class: "synthetic-axis side", text: "HR →" }));
    const cells = [
      ["HR intact", "PARP available", "viable", genotype === "normal" && drug === "none"],
      ["HR intact", "PARP trapped", "stressed", genotype === "normal" && drug === "trapping"],
      ["HR lost", "PARP available", "tumour exists", genotype !== "normal" && drug === "none"],
      ["HR lost", "PARP trapped", result.rescued ? "resistance" : "synthetic lethal", genotype !== "normal" && drug === "trapping"],
    ];
    board.append(el("div", { class: "synthetic-grid" }, cells.map((cell) =>
      el("div", { class: "synthetic-cell" + (cell[3] ? " is-selected" : "") }, [
        el("span", { text: cell[0] }),
        el("span", { text: cell[1] }),
        el("strong", { text: cell[2] }),
      ])
    )));
    board.append(el("p", { class: "synthetic-result", text: result.outcome }));
    return board;
  }

  define("repair-triage-lab", {
    "ch17-o1": "Repair-budget submode derives the residual from lineage lesions and transmitted mutations",
    "ch17-o2": "Lesion router maps chemical clues to six repair/tolerance pathways and templates",
    "ch17-o3": "Mismatch fixture exposes why the parental/nascent strand label is indispensable",
    "ch17-o4": "DSB mode manipulates phase, resection regulators, and RAD51 loading",
    "ch17-o5": "Synthetic-lethality matrix compares BRCA state, PARP trapping, and resistance routes",
    "ch17-o6": "Stalled-fork fixture separates tolerance from repair; response submode traces ATM/ATR through p53 to arrest, senescence, apoptosis, or escape",
    "ch17-o7": "Regional-access submode changes chromatin, transcription, timing, and occupancy",
  }, function (api) {
    const { body, el, stat, predict } = api;
    const parts = labParts(el);
    let mode = "route";
    let routeView = "pathway";
    let lesion = "uvDimer";
    let lesionsPerDay = 50000;
    let lineageYears = 30;
    let region = "lateClosed";
    let responseDamage = "persistent";
    let p53Intact = true;
    let phase = "G2";
    let perturbation = "normal";
    let genotype = "brca2Loss";
    let drug = "trapping";
    let resistance = "none";

    function render() {
      parts.tabHost.replaceChildren(tabs(el, [
        { label: "Lesion routing", value: "route" },
        { label: "Break decision", value: "dsb" },
        { label: "Synthetic lethality", value: "synthetic" },
      ], mode, (next) => { mode = next; render(); }));

      if (mode === "route") {
        const subTabs = el("div", { class: "lab-control-block compact-submode" }, [
          el("span", { class: "lab-control-label", text: "Repair evidence" }),
          choiceRow(el, [
            { label: "Route a lesion", value: "pathway" },
            { label: "Measure the residual", value: "budget" },
            { label: "Damage-response fate", value: "response" },
            { label: "Move genomic context", value: "region" },
          ], routeView, (value) => { routeView = value; render(); }, "Repair evidence view"),
        ]);
        if (routeView === "pathway") {
          const result = repairTriageModel({ kind: "route", lesion });
          parts.visual.innerHTML = repairRouteSvg(result);
          parts.controls.replaceChildren(subTabs,
            el("div", { class: "lab-control-block" }, [
              el("span", { class: "lab-control-label", text: "Lesion presented to the cell" }),
              choiceRow(el, [
                { label: "O6-methyl-G", value: "o6mG" },
                { label: "Uracil", value: "uracil" },
                { label: "UV dimer", value: "uvDimer" },
                { label: "G:T mismatch", value: "mismatch" },
                { label: "Stalled fork", value: "stalledFork" },
                { label: "Double-strand break", value: "dsb" },
              ], lesion, (value) => { lesion = value; render(); }, "DNA lesion"),
            ]),
            el("div", { class: "readout" }, [
              stat(result.pathway, "pathway"),
              stat(result.patch, "patch removed"),
              stat(result.template, "redundancy used"),
            ])
          );
          parts.rail.replaceChildren(causalRail(el, [
            { key: "you changed", value: result.lesion },
            { key: "mechanism", value: result.sensor + " reads " + result.chemistry },
            { key: "observable", value: result.pathway + " · " + result.patch },
          ]));
          parts.explanation.className = "callout";
          parts.explanation.innerHTML = lesion === "stalledFork"
            ? "<strong>Bypass is not repair.</strong> TLS moves the fork across a lesion and leaves the lesion behind; the cell trades mutation risk for avoiding fork collapse."
            : "<strong>Every correction needs an answer key.</strong> Single-strand lesions use the other strand; HR uses a sister; direct reversal and NHEJ act without a sequence template.";
          return;
        }
        if (routeView === "budget") {
          const result = repairTriageModel({ kind: "budget", lesionsPerDay, years: lineageYears, paternalMutations: 60 });
          parts.visual.innerHTML = repairBudgetSvg(result, lesionsPerDay, lineageYears);
          parts.controls.replaceChildren(subTabs,
            rangeControl(el, "Lesions per lineage cell per day", lesionsPerDay, {
              min: 10000, max: 100000, step: 10000,
              format: (value) => value.toLocaleString("en-GB"),
            }, (value) => { lesionsPerDay = value; render(); }),
            rangeControl(el, "Paternal lineage duration", lineageYears, {
              min: 20, max: 45, step: 1, format: (value) => value + " years",
            }, (value) => { lineageYears = value; render(); }),
            el("div", { class: "readout" }, [
              stat(result.lesions.toExponential(2), "lesions along lineage"),
              stat(result.residual.toExponential(2), "transmitted / lesion"),
              stat(result.ordersRemoved.toFixed(1), "orders removed"),
            ])
          );
          parts.rail.replaceChildren(causalRail(el, [
            { key: "you changed", value: "lesion flux and lineage time" },
            { key: "mechanism", value: "repair races replication along the transmitting chain" },
            { key: "observable", value: "~" + result.ordersRemoved.toFixed(1) + " orders between lesions and inherited changes" },
          ]));
          parts.explanation.className = "callout";
          parts.explanation.innerHTML = "<strong>This is an order-of-magnitude bound, not a repair assay.</strong> Damage estimates are uncertain and not every escaped lesion becomes mutagenic; the stable conclusion is that mutation rate is a residual after many filters.";
          return;
        }
        if (routeView === "response") {
          const result = repairTriageModel({ kind: "response", damage: responseDamage, p53Intact });
          parts.visual.replaceChildren(statusStrip(el, [
            { label: "sensor", value: result.signal },
            { label: "checkpoint", value: result.checkpoint },
            { label: "decision", value: result.decision, tone: result.decision === "checkpoint escape" ? "bad" : "active" },
            { label: "lineage fate", value: result.fate },
          ], "DNA damage-response decision"));
          parts.controls.replaceChildren(subTabs,
            el("div", { class: "lab-control-block" }, [
              el("span", { class: "lab-control-label", text: "Damage persistence" }),
              choiceRow(el, [
                { label: "Repairable pulse", value: "repairable" },
                { label: "Persistent", value: "persistent" },
                { label: "Catastrophic", value: "catastrophic" },
              ], responseDamage, (value) => { responseDamage = value; render(); }, "Damage persistence"),
            ]),
            el("div", { class: "lab-control-block" }, [
              el("span", { class: "lab-control-label", text: "p53 checkpoint" }),
              choiceRow(el, [
                { label: "Intact", value: true },
                { label: "Lost", value: false },
              ], p53Intact, (value) => { p53Intact = value; render(); }, "p53 state"),
            ]),
            el("div", { class: "readout" }, [
              stat(result.signal, "sensor signal"),
              stat(result.decision, "cell decision"),
              stat(result.fate, "outcome"),
            ])
          );
          parts.rail.replaceChildren(causalRail(el, [
            { key: "you changed", value: responseDamage + " damage · p53 " + (p53Intact ? "intact" : "lost") },
            { key: "mechanism", value: result.checkpoint },
            { key: "observable", value: result.decision },
          ]));
          parts.explanation.className = "callout " + (result.decision === "checkpoint escape" ? "callout-bad" : "");
          parts.explanation.innerHTML = "<strong>The damage response decides what the cell does; it does not itself restore DNA.</strong> ATM/ATR and CHK kinases buy time. Persistent p53 signalling converts that pause into senescence or apoptosis; p53 loss lets the lineage keep the damage.";
          return;
        }
        const rows = ["openEarly", "transcribed", "lateClosed", "occupied"].map((key) => {
          const item = repairTriageModel({ kind: "region", region: key });
          return { label: key.replace(/([A-Z])/g, " $1").toLowerCase(), value: item.rate, display: item.rate.toFixed(2) + "×", tone: key === region ? "active" : "muted" };
        });
        const result = repairTriageModel({ kind: "region", region });
        parts.visual.replaceChildren(barBoard(el, rows, "Relative instructional mutation background by repair context", 2.4));
        parts.controls.replaceChildren(subTabs,
          el("div", { class: "lab-control-block" }, [
            el("span", { class: "lab-control-label", text: "Genomic context" }),
            choiceRow(el, [
              { label: "Open + early", value: "openEarly" },
              { label: "Transcribed strand", value: "transcribed" },
              { label: "Late + closed", value: "lateClosed" },
              { label: "TF-occupied site", value: "occupied" },
            ], region, (value) => { region = value; render(); }, "Regional repair context"),
          ]),
          el("div", { class: "readout" }, [
            stat(result.rate.toFixed(2) + "×", "relative teaching rate"),
            stat(result.access, "repair access"),
            stat(result.bias, "expected bias"),
          ])
        );
        parts.rail.replaceChildren(causalRail(el, [
          { key: "you changed", value: result.access },
          { key: "mechanism", value: result.bias },
          { key: "observable", value: result.rate.toFixed(2) + "× local background in the toy comparison" },
        ]));
        parts.explanation.className = "callout";
        parts.explanation.innerHTML = "<strong>The relative values are a teaching scale, not universal fold changes.</strong> The causal ordering is real: repair access, transcriptional recruitment, replication timing, and protein occupancy make a genome-wide mean an invalid driver-gene null.";
        return;
      }

      if (mode === "dsb") {
        const result = repairTriageModel({ kind: "dsb", phase, perturbation });
        parts.visual.innerHTML = dsbChoiceSvg(result, phase, perturbation);
        parts.controls.replaceChildren(
          el("div", { class: "lab-control-block" }, [
            el("span", { class: "lab-control-label", text: "Cell-cycle phase" }),
            choiceRow(el, [
              { label: "G1", value: "G1" }, { label: "S", value: "S" },
              { label: "G2", value: "G2" }, { label: "M", value: "M" },
            ], phase, (value) => { phase = value; render(); }, "Cell-cycle phase"),
          ]),
          el("div", { class: "lab-control-block" }, [
            el("span", { class: "lab-control-label", text: "Pathway perturbation" }),
            choiceRow(el, [
              { label: "None", value: "normal" },
              { label: "BRCA1 loss", value: "brca1Loss" },
              { label: "BRCA2 loss", value: "brca2Loss" },
              { label: "53BP1 loss", value: "bp53Loss" },
            ], perturbation, (value) => { perturbation = value; render(); }, "DSB perturbation"),
          ]),
          el("div", { class: "readout" }, [
            stat(result.sister ? "available" : "absent", "sister template"),
            stat(result.resected ? "yes" : "no", "5′ resection"),
            stat(result.pathway, "outcome"),
          ])
        );
        parts.rail.replaceChildren(causalRail(el, [
          { key: "you changed", value: phase + " + " + perturbation.replace(/([A-Z])/g, " $1").toLowerCase() },
          { key: "mechanism", value: result.reason },
          { key: "observable", value: result.pathway + " · " + result.fidelity },
        ]));
        parts.explanation.className = "callout";
        parts.explanation.innerHTML = "<strong>Resection is the commitment step, but it is not the whole pathway.</strong> BRCA1 licenses resection; BRCA2 acts later to load RAD51. Losing 53BP1 can rescue BRCA1 loss, not BRCA2 loss.";
        return;
      }

      const result = repairTriageModel({ kind: "synthetic", genotype, drug, resistance });
      parts.visual.replaceChildren(syntheticBoard(el, result, genotype, drug));
      parts.controls.replaceChildren(
        el("div", { class: "lab-control-block" }, [
          el("span", { class: "lab-control-label", text: "Cell genotype" }),
          choiceRow(el, [
            { label: "HR intact", value: "normal" },
            { label: "BRCA1 lost", value: "brca1Loss" },
            { label: "BRCA2 lost", value: "brca2Loss" },
          ], genotype, (value) => { genotype = value; render(); }, "HR genotype"),
        ]),
        el("div", { class: "lab-control-block" }, [
          el("span", { class: "lab-control-label", text: "PARP intervention" }),
          choiceRow(el, [
            { label: "None", value: "none" },
            { label: "Catalytic inhibition", value: "catalytic" },
            { label: "Strong trapping", value: "trapping" },
          ], drug, (value) => { drug = value; render(); }, "PARP intervention"),
        ]),
        el("div", { class: "lab-control-block" }, [
          el("span", { class: "lab-control-label", text: "Tumour escape route" }),
          choiceRow(el, [
            { label: "None", value: "none" },
            { label: "BRCA reversion", value: "reversion" },
            { label: "53BP1 loss", value: "bp53Loss" },
            { label: "Fork protection", value: "forkProtection" },
          ], resistance, (value) => { resistance = value; render(); }, "Resistance mechanism"),
        ]),
        el("div", { class: "readout" }, [
          stat(result.hrLost ? "lost" : "intact", "HR"),
          stat(result.trapped ? "trapped" : drug === "catalytic" ? "inhibited" : "available", "PARP1"),
          stat(result.outcome, "qualitative outcome"),
        ])
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "you changed", value: genotype.replace(/([A-Z])/g, " $1") + " + " + drug },
        { key: "mechanism", value: result.rescued ? result.rescueReason : "two independent gap/HR safeguards removed" },
        { key: "observable", value: result.outcome },
      ]));
      parts.explanation.className = "callout " + (result.outcome === "selective tumour killing" ? "callout-good" : "");
      parts.explanation.innerHTML = "<strong>The matrix is qualitative, not a response probability.</strong> The therapeutic window comes from biallelic HR loss in tumour cells while normal heterozygous tissue retains HR; trapping potency, replication gaps, dose, and resistance set real clinical response.";
    }

    predict(body, {
      widget: "repair-triage-lab",
      question: "A tumour has lost both BRCA2 copies. Which intervention creates the synthetic-lethal state while sparing HR-proficient normal cells?",
      hint: "Remove the second route that lets a replication-associated lesion remain survivable.",
      options: [
        { label: "Strong PARP1 trapping", correct: true },
        { label: "Restore BRCA2" },
        { label: "Remove the lesion from both cell types" },
        { label: "Activate mismatch repair" },
      ],
    }, () => {
      mode = "synthetic";
      parts.instrument.hidden = false;
      render();
    });
    finishLab(parts, body);
  });

  /* Ch 18 view ----------------------------------------------------------- */

  function recombinationResolutionSvg(result, path) {
    const crossover = result.crossover;
    const headingLines = [
      ...wrapWords(result.intermediate, 44),
      ...wrapWords(result.note, 50),
    ].slice(0, 3);
    return textSvg(
      svgLines("lab-svg-kicker", 18, 20, headingLines, 18) +
      '<text class="chromatid-name" x="24" y="124">broken</text>' +
      '<path class="chromatid-line maternal" d="M92 118 H224 M276 118 H470"/>' +
      '<path class="conversion-tract" d="M224 118 H276"/>' +
      '<text class="chromatid-mark" x="120" y="108">A</text><text class="chromatid-mark" x="250" y="108">M</text><text class="chromatid-mark" x="430" y="108">' + (crossover ? "b" : "B") + "</text>" +
      '<text class="chromatid-name" x="24" y="198">partner</text>' +
      '<path class="chromatid-line paternal" d="M92 192 H470"/>' +
      '<text class="chromatid-mark" x="120" y="182">a</text><text class="chromatid-mark" x="250" y="182">' + (crossover ? "?" : "M") + '</text><text class="chromatid-mark" x="430" y="182">' + (crossover ? "B" : "b") + "</text>" +
      '<path class="fault-line" d="M250 216 V246"/>' +
      '<g class="resolution-outcome' + (crossover ? " is-crossover" : "") + '"><rect x="95" y="250" width="310" height="48" rx="7"/><text x="250" y="280" text-anchor="middle">' +
        (crossover ? "CROSSOVER + conversion" : "NON-CROSSOVER + conversion") + "</text></g>",
      result.intermediate + ". " + result.note + ". Products: " + result.products.join("; ") +
        ". GC transmission in the displayed conversion-bias setting is " + percent(result.gcTransmission, 0) + ".",
      "0 0 500 316",
      "recombination-resolution-diagram"
    );
  }

  function assuranceBoard(el, result, distribution) {
    const marked = Math.min(23, Math.round(result.expectedAchiasmate));
    const board = el("div", {
      class: "bivalent-board",
      role: "img",
      "aria-label": "Twenty-three bivalents under " + distribution + " crossover placement. Expected achiasmate bivalents " +
        result.expectedAchiasmate.toFixed(2) + ". Probability all receive at least one crossover " +
        percent(result.allChiasmate, 1) + ". Euploid from this crossover-placement component " +
        percent(result.euploidFromThisCause, 1) + ".",
    });
    board.append(el("div", { class: "bivalent-grid", "aria-hidden": "true" },
      Array.from({ length: 23 }, (_, index) => el("span", {
        class: "bivalent" + (index < marked ? " is-achiasmate" : ""),
        text: index < marked ? "∥" : "×",
      }))
    ));
    board.append(el("div", { class: "bivalent-legend" }, [
      el("span", { text: "× crossover-linked bivalent" }),
      el("span", { text: "∥ expected achiasmate count (rounded)" }),
    ]));
    return board;
  }

  function nahrSvg(result, geometry) {
    const deletion = result.products.includes("deletion");
    const inversion = result.products.includes("inversion");
    const translocation = result.products.includes("reciprocal translocation");
    const siteSpecific = geometry === "siteSpecific";
    const transpositional = geometry === "transpositional";
    const unitLabel = siteSpecific ? "SITE" : transpositional ? "TE" : "REP";
    const productLabel = result.products.join(" + ");
    const headingLines = [
      ...wrapWords(result.alignment, 46),
      ...wrapWords(result.homology, 46),
    ].slice(0, 3);
    const outcome = deletion ? "one product loses the interval; the reciprocal gains it"
      : inversion ? "the interval reverses orientation"
      : translocation ? "arms exchange between chromosomes"
      : siteSpecific ? "site orientation and molecule geometry choose the product"
      : transpositional ? "new target plus a duplicated target-site scar"
      : "allelic repair";
    return textSvg(
      svgLines("lab-svg-kicker", 18, 20, headingLines, 18) +
      '<g class="repeat-source"><path d="M35 102 H465"/><rect x="95" y="84" width="54" height="36" rx="4"/><rect x="350" y="84" width="54" height="36" rx="4"/><text x="122" y="108" text-anchor="middle">' + unitLabel + '</text><text x="377" y="108" text-anchor="middle">' + unitLabel + '</text></g>' +
      '<path class="nahr-cross" d="M122 132 C122 178 377 142 377 188 M377 132 C377 178 122 142 122 188"/>' +
      '<g class="nahr-product"><rect x="42" y="204" width="416" height="104" rx="7"/>' +
        svgLines("nahr-outcome", 250, 228, wrapWords(outcome, 38).slice(0, 2), 18, "middle") +
        '<text class="lab-svg-label" x="250" y="288" text-anchor="middle">' + productLabel + "</text></g>",
      result.alignment + " produces " + productLabel + ". " + result.homology +
        ". Breakpoints are " + (result.recurrent ? "recurrent inside the repeats" : "allelic") + ".",
      "0 0 500 326",
      "nahr-diagram"
    );
  }

  define("recombination-mechanism-lab", {
    "ch18-o1": "Resolution mode traces SDSA, double-junction cutting, dissolution, flanks, and conversion",
    "ch18-o2": "Cell-context control keeps the HR machine fixed while switching accidental/sister repair to programmed/homolog shuffling",
    "ch18-o3": "Resolution states keep conversion visible in crossover and non-crossover outcomes and expose 68% GC bias",
    "ch18-o4": "Assurance mode compares Poisson placement against a one-per-bivalent floor",
    "ch18-o5": "Hotspot-state control steps from PRDM9 binding through self-eroding biased repair to a retargeted PRDM9 allele",
    "ch18-o6": "Recombination-family mode contrasts long homology, short recognition sites, and no target homology",
    "ch18-o7": "NAHR geometry directly produces deletion/duplication, inversion, or translocation",
  }, function (api) {
    const { body, el, stat, predict } = api;
    const parts = labParts(el);
    let mode = "resolution";
    let path = "sdsa";
    let cellContext = "meiosis";
    let gcBias = true;
    let crossovers = 52;
    let distribution = "random";
    let hotspotState = "fresh";
    let geometry = "directHomologs";

    function render() {
      parts.tabHost.replaceChildren(tabs(el, [
        { label: "Break resolution", value: "resolution" },
        { label: "Crossover assurance", value: "assurance" },
        { label: "Recombination families", value: "nahr" },
      ], mode, (next) => { mode = next; render(); }));

      if (mode === "resolution") {
        const result = recombinationMechanismModel({ kind: "resolution", path, gcBias, context: cellContext });
        parts.visual.innerHTML = recombinationResolutionSvg(result, path);
        parts.controls.replaceChildren(
          el("div", { class: "lab-control-block" }, [
            el("span", { class: "lab-control-label", text: "Cellular use of homologous recombination" }),
            choiceRow(el, [
              { label: "Somatic S/G2 repair", value: "somatic" },
              { label: "Meiotic prophase I", value: "meiosis" },
            ], cellContext, (value) => { cellContext = value; render(); }, "Homologous-recombination context"),
          ]),
          el("div", { class: "lab-control-block" }, [
            el("span", { class: "lab-control-label", text: "Exit from the D-loop / junction" }),
            choiceRow(el, [
              { label: "SDSA", value: "sdsa" },
              { label: "dHJ · same cuts", value: "sameCuts" },
              { label: "dHJ · opposite cuts", value: "oppositeCuts" },
              { label: "Dissolution", value: "dissolution" },
            ], path, (value) => { path = value; render(); }, "Recombination resolution path"),
          ]),
          el("div", { class: "lab-control-block" }, [
            el("span", { class: "lab-control-label", text: "Heteroduplex mismatch repair" }),
            choiceRow(el, [
              { label: "Unbiased · 50% GC", value: false },
              { label: "Human gBGC fixture · 68% GC", value: true },
            ], gcBias, (value) => { gcBias = value; render(); }, "Gene-conversion bias"),
          ]),
          el("div", { class: "readout" }, [
            stat(result.crossover ? "yes" : "no", "flanking crossover"),
            stat(result.conversion ? "yes" : "no", "local conversion"),
            stat(result.templatePreference, "preferred template"),
            stat(result.gcCopiesPer100 + " / 100", "GC transmissions in fixture"),
          ])
        );
        parts.rail.replaceChildren(causalRail(el, [
          { key: "you changed", value: result.context + " · " + result.intermediate },
          { key: "mechanism", value: result.breakSource + " · " + result.templatePreference },
          { key: "observable", value: (result.crossover ? "flanks exchanged" : "flanks retained") + " · conversion remains" },
        ]));
        parts.explanation.className = "callout";
        parts.explanation.innerHTML = "<strong>The machine is shared; the operating policy changes.</strong> " + result.outcomeBias + ". Gene conversion remains the common local residue; the 68% GC fixture applies only when a conversion tract covers a GC/AT heterozygous site.";
        return;
      }

      if (mode === "assurance") {
        const result = recombinationMechanismModel({ kind: "assurance", crossovers, distribution, hotspotState });
        parts.visual.replaceChildren(
          assuranceBoard(el, result, distribution),
          statusStrip(el, [
            { label: "motif", value: result.hotspot.motif },
            { label: "break", value: result.hotspot.break },
            { label: "inheritance", value: result.hotspot.inheritance },
          ], "PRDM9 hotspot paradox state")
        );
        parts.controls.replaceChildren(
          rangeControl(el, "Crossovers per meiocyte", crossovers, {
            min: 23, max: 70, step: 1, format: (value) => String(value),
          }, (value) => { crossovers = value; render(); }),
          el("div", { class: "lab-control-block" }, [
            el("span", { class: "lab-control-label", text: "Placement rule across 23 bivalents" }),
            choiceRow(el, [
              { label: "Independent Poisson", value: "random" },
              { label: "Assured floor ≥1", value: "assured" },
            ], distribution, (value) => { distribution = value; render(); }, "Crossover placement rule"),
          ]),
          el("div", { class: "lab-control-block" }, [
            el("span", { class: "lab-control-label", text: "Hotspot paradox" }),
            choiceRow(el, [
              { label: "1 · fresh PRDM9 motif", value: "fresh" },
              { label: "2 · motif eroded", value: "eroded" },
              { label: "3 · new PRDM9 allele", value: "newPrdm9" },
            ], hotspotState, (value) => { hotspotState = value; render(); }, "PRDM9 hotspot state"),
          ]),
          el("div", { class: "readout" }, [
            stat(result.expectedAchiasmate.toFixed(2), "expected achiasmate bivalents"),
            stat(percent(result.allChiasmate, 1), "all 23 receive ≥1"),
            stat(percent(result.euploidFromThisCause, 1), "euploid from this component"),
          ])
        );
        parts.rail.replaceChildren(causalRail(el, [
          { key: "you changed", value: crossovers + " crossovers under " + distribution + " placement" },
          { key: "mechanism", value: distribution === "random" ? "Poisson leaves a zero class" : "assurance protects every bivalent first" },
          { key: "observable", value: result.expectedAchiasmate.toFixed(2) + " achiasmate expected · " + result.hotspot.motif },
        ]));
        parts.explanation.className = "callout " + (distribution === "assured" ? "callout-good" : "callout-bad");
        parts.explanation.innerHTML = distribution === "random"
          ? "<strong>The total is not enough.</strong> With 52 exchanges placed independently, about 2.4 bivalents would still receive none and this component alone would leave only about 29% euploid gametes."
          : "<strong>Assurance is a constraint on placement, not an extra crossover count.</strong> The hotspot strip shows the paradox: biased repair erodes the motif that recruited the break, while new PRDM9 alleles retarget the landscape and leave the one-per-bivalent floor intact.";
        return;
      }

      const result = recombinationMechanismModel({ kind: "nahr", geometry });
      parts.visual.innerHTML = nahrSvg(result, geometry);
      parts.controls.replaceChildren(
        el("div", { class: "lab-control-block" }, [
          el("span", { class: "lab-control-label", text: "Which repeated sequences pair" }),
          choiceRow(el, [
            { label: "Correct allelic copies", value: "allelic" },
            { label: "Misaligned direct repeats", value: "directHomologs" },
            { label: "Inverted repeats", value: "invertedSame" },
            { label: "Repeats on different chromosomes", value: "differentChromosomes" },
            { label: "Site-specific recombination", value: "siteSpecific" },
            { label: "Transposition", value: "transpositional" },
          ], geometry, (value) => { geometry = value; render(); }, "Repeat geometry"),
        ]),
        el("div", { class: "readout" }, [
          stat(result.alignment, "alignment"),
          stat(result.products.join(" + "), "product"),
          stat(result.recurrent ? "yes" : "no", "recurrent breakpoint family"),
        ])
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "you changed", value: result.alignment },
        { key: "mechanism", value: "homology search accepts " + result.homology },
        { key: "observable", value: result.products.join(" + ") },
      ]));
      parts.explanation.className = "callout";
      parts.explanation.innerHTML = geometry === "siteSpecific"
        ? "<strong>Site-specific recombination needs recognition sites, not a long homologous tract.</strong> A dedicated recombinase reads site identity and orientation, so the same chemistry can integrate, excise, or invert precisely."
        : geometry === "transpositional"
          ? "<strong>Transposition requires no homology between donor and target.</strong> The transposase recognises element ends; a staggered target cut leaves a target-site duplication after fill-in."
          : "<strong>NAHR is faithful homologous-recombination chemistry applied to the wrong address.</strong> Direct, inverted, and interchromosomal repeat geometry determines the product; repeat-defined breakpoints make unrelated cases recur.";
    }

    predict(body, {
      widget: "recombination-mechanism-lab",
      question: "A human meiocyte makes roughly 250 programmed breaks but only about 50 crossovers. What happens to most breaks?",
      hint: "A repaired break can copy a short tract without exchanging chromosome arms.",
      options: [
        { label: "They remain broken" },
        { label: "They become non-crossovers with gene conversion", correct: true },
        { label: "They are repaired by NHEJ" },
        { label: "They each make two crossovers" },
      ],
    }, () => {
      mode = "resolution";
      path = "sdsa";
      parts.instrument.hidden = false;
      render();
    });
    finishLab(parts, body);
  });

  /* Ch 19 view ----------------------------------------------------------- */

  function elementLifecycleSvg(result) {
    const sourceState = result.sourceStays ? "source remains" : "source excised";
    const active = result.activity > 0.5;
    const movementDisplay = result.movement === "historical copy-and-paste" ? "past copy/paste"
      : result.movement === "historical cut-and-paste" ? "past cut/paste"
      : result.movement;
    const headingLines = [
      ...wrapWords(result.label + " · " + result.className, 34),
      ...wrapWords(result.host, 34),
    ].slice(0, 4);
    return textSvg(
      svgLines("lab-svg-kicker", 18, 20, headingLines, 18) +
      '<g class="element-source"><rect x="30" y="92" width="130" height="76" rx="7"/><text x="95" y="120" text-anchor="middle">source locus</text><text class="lab-svg-label" x="95" y="146" text-anchor="middle">' + sourceState + "</text></g>" +
      '<path class="fault-arrow" d="M166 130 H210"/>' +
      '<g class="element-intermediate"><circle cx="250" cy="130" r="48"/><text x="250" y="124" text-anchor="middle">' + result.intermediate + '</text><text class="lab-svg-label" x="250" y="148" text-anchor="middle">' + movementDisplay + "</text></g>" +
      '<path class="fault-arrow" d="M298 130 H340"/>' +
      '<g class="element-destination' + (active ? " is-active" : "") + '"><rect x="346" y="92" width="124" height="76" rx="7"/><text x="408" y="120" text-anchor="middle">new locus</text><text class="lab-svg-label" x="408" y="146" text-anchor="middle">' + (active ? "copy possible" : "no movement") + "</text></g>" +
      '<path class="fault-line" d="M36 200 H464"/>' +
      svgLines("element-engine", 250, 220, wrapWords(result.engine, 32).slice(0, 3), 18, "middle") +
      '<text class="lab-svg-label" x="250" y="294" text-anchor="middle">' + result.census + "</text>",
      result.label + " is " + result.className + " using a " + result.intermediate +
        " intermediate and " + result.movement + ". " + sourceState + ". " +
        result.engine + ". Host state: " + result.host + ", interpreted as " + result.meaning + ".",
      "0 0 500 310",
      "element-lifecycle-diagram"
    );
  }

  function tprtSvg(result, step, completion) {
    const inserted = step >= 3;
    const width = Math.max(8, 250 * completion);
    return textSvg(
      svgLines("lab-svg-kicker", 18, 24, ["TPRT step " + step + " · " + result.label, result.made], 20) +
      '<path class="target-dna" d="M30 104 H470 M30 144 H470"/>' +
      '<path class="target-nick" d="M160 92 L177 104 L160 116"/>' +
      (result.polyA ? '<text class="polya-label" x="190" y="91">poly(A) · insert 3′ end</text><path class="rna-primer" d="M174 104 C205 120 216 168 246 180"/>' : "") +
      (inserted ? '<rect class="l1-insert' + (result.fivePrimeComplete ? " is-full" : "") + '" x="174" y="172" width="' + width.toFixed(1) + '" height="42" rx="5"/><text class="l1-length" x="' + (174 + width / 2).toFixed(1) + '" y="198" text-anchor="middle">' + result.lengthKb.toFixed(1) + " kb</text>" : "") +
      (result.tsd ? '<rect class="tsd-mark" x="144" y="230" width="52" height="28" rx="3"/><rect class="tsd-mark" x="' + (184 + width).toFixed(1) + '" y="230" width="52" height="28" rx="3"/><text class="lab-svg-label" x="250" y="278" text-anchor="middle">matching ' + result.tsdBp + " bp target-site duplications</text>" : svgLines("lab-svg-label", 250, 254, ["TSD forms only after the staggered", "second nick is filled"], 20, "middle")),
      "Target-primed reverse transcription step " + step + ": " + result.made +
        ". Poly A signature " + (result.polyA ? "present" : "not yet present") +
        ", target-site duplication " + (result.tsd ? result.tsdBp + " bp" : "not yet formed") +
        ", five-prime truncation " + (result.truncation ? "present" : "not determined") + ".",
      "0 0 500 296",
      "tprt-diagram"
    );
  }

  function readEvidenceBoard(el, result) {
    const detected = result.detected === true ? "detected" : result.detected === false ? "missed" : result.detected;
    const board = el("div", {
      class: "read-evidence-board",
      role: "img",
      "aria-label": result.event + " using " + result.assay + ": " + detected +
        " with " + result.confidence + " confidence. Evidence: " + result.evidence +
        ". Blind spot: " + result.blind + ".",
    });
    board.append(el("div", { class: "read-stack", "aria-hidden": "true" }, [
      el("span", { class: "reference-line" }),
      el("span", { class: "read-line read-one" }),
      el("span", { class: "read-line read-two" }),
      el("span", { class: "read-line read-three" }),
      el("span", { class: "read-break" }),
    ]));
    board.append(el("div", { class: "evidence-verdict" }, [
      el("span", { text: result.assay.replace(/([A-Z])/g, " $1") }),
      el("strong", { text: detected + " · " + result.confidence }),
      el("p", { text: result.evidence }),
    ]));
    return board;
  }

  define("transposon-lifecycle-lab", {
    "ch19-o1": "Element mode changes intermediate, source fate, autonomy, and class",
    "ch19-o2": "TPRT stepper derives poly(A), 5′ truncation, and target-site duplication",
    "ch19-o3": "Element census contrasts total L1, competent copies, and host activity state",
    "ch19-o4": "Evidence mode compares insertional inactivation, Alu–Alu NAHR, and Alu exonisation",
    "ch19-o5": "Assay switch changes soft clips, depth, discordant pairs, and breakpoint visibility",
    "ch19-o6": "Host-state control compares open activity with piRNA, KRAB-ZFP/TRIM28, methylation, and APOBEC3 silencing",
    "ch19-o7": "Domesticated state reframes element machinery as syncytin/RAG/regulatory exaptation",
  }, function (api) {
    const { body, el, stat, predict } = api;
    const parts = labParts(el);
    let mode = "element";
    let element = "l1";
    let hostState = "active";
    let step = 3;
    let completion = 0.55;
    let nickSpacing = 14;
    let event = "l1Insertion";
    let assay = "exome";

    function render() {
      parts.tabHost.replaceChildren(tabs(el, [
        { label: "Move or copy", value: "element" },
        { label: "Build an L1 insertion", value: "tprt" },
        { label: "Read the evidence", value: "evidence" },
      ], mode, (next) => { mode = next; render(); }));

      if (mode === "element") {
        const result = transposonModel({ kind: "classify", element, hostState });
        parts.visual.innerHTML = elementLifecycleSvg(result);
        parts.controls.replaceChildren(
          el("div", { class: "lab-control-block" }, [
            el("span", { class: "lab-control-label", text: "Mobile-sequence family" }),
            choiceRow(el, [
              { label: "LINE-1", value: "l1" },
              { label: "Alu", value: "alu" },
              { label: "ERV", value: "erv" },
              { label: "DNA transposon", value: "dna" },
              { label: "Processed pseudogene", value: "pseudogene" },
            ], element, (value) => { element = value; render(); }, "Mobile element family"),
          ]),
          el("div", { class: "lab-control-block" }, [
            el("span", { class: "lab-control-label", text: "Host relationship" }),
            choiceRow(el, [
              { label: "Silencing window open", value: "active" },
              { label: "Layered silencing", value: "silenced" },
              { label: "Domesticated by host", value: "domesticated" },
            ], hostState, (value) => { hostState = value; render(); }, "Host relationship"),
          ]),
          el("div", { class: "readout" }, [
            stat(result.className, "class"),
            stat(result.intermediate, "intermediate"),
            stat(result.autonomous ? "yes" : "no", "encodes its own engine"),
          ])
        );
        parts.rail.replaceChildren(causalRail(el, [
          { key: "you changed", value: result.label + " under " + result.host },
          { key: "mechanism", value: result.engine + " · " + result.movement },
          { key: "observable", value: result.meaning },
        ]));
        parts.explanation.className = "callout";
        parts.explanation.innerHTML = hostState === "domesticated"
          ? "<strong>Exaptation is retrospective.</strong> A viral fusion protein can become syncytin and a transposase can become RAG only after ordinary selection retains a useful accident; the element was not preserved for that future job."
          : "<strong>Copy number is not autonomy.</strong> Alu's million copies encode no protein; L1 supplies the only active human retrotransposition engine, while most of its own half-million copies are broken fossils.";
        return;
      }

      if (mode === "tprt") {
        const result = transposonModel({ kind: "tprt", step, completion, nickSpacing });
        parts.visual.innerHTML = tprtSvg(result, step, completion);
        parts.controls.replaceChildren(
          rangeControl(el, "Reaction step", step, {
            min: 1, max: 4, step: 1,
            format: (value) => ["", "first nick", "poly(A) priming", "reverse transcription", "second nick + fill"][value],
          }, (value) => { step = value; render(); }),
          rangeControl(el, "Fraction of a 6 kb L1 copied", completion, {
            min: 0.15, max: 1, step: 0.05, format: (value) => percent(value, 0),
          }, (value) => { completion = value; render(); }),
          rangeControl(el, "Stagger between nicks", nickSpacing, {
            min: 7, max: 20, step: 1, format: (value) => value + " bp",
          }, (value) => { nickSpacing = value; render(); }),
          el("div", { class: "readout" }, [
            stat(result.polyA ? "present" : "not yet", "poly(A) signature"),
            stat(result.tsd ? result.tsdBp + " bp" : "not yet", "target-site duplication"),
            stat(result.fivePrimeComplete ? "complete" : step >= 3 ? "truncated" : "not made", "5′ end"),
          ])
        );
        parts.rail.replaceChildren(causalRail(el, [
          { key: "you changed", value: "reaction reaches " + result.label },
          { key: "mechanism", value: result.made },
          { key: "observable", value: (result.polyA ? "poly(A)" : "no insert") + " · " + (result.tsd ? result.tsdBp + " bp TSD" : "no TSD yet") },
        ]));
        parts.explanation.className = "callout";
        parts.explanation.innerHTML = "<strong>Direction fixes the signature.</strong> Reverse transcription starts from the RNA 3′ poly(A) end, so interruption preferentially removes the L1 5′ promoter; staggered genomic nicks create the duplicated target sequence only after fill-in.";
        return;
      }

      const result = transposonModel({ kind: "evidence", event, assay });
      parts.visual.replaceChildren(readEvidenceBoard(el, result));
      parts.controls.replaceChildren(
        el("div", { class: "lab-control-block" }, [
          el("span", { class: "lab-control-label", text: "Underlying event" }),
          choiceRow(el, [
            { label: "New L1 insertion", value: "l1Insertion" },
            { label: "Alu–Alu deletion", value: "aluDeletion" },
            { label: "Alu exonisation", value: "aluExonisation" },
            { label: "Ordinary SNV", value: "snv" },
          ], event, (value) => { event = value; render(); }, "Genomic event"),
        ]),
        el("div", { class: "lab-control-block" }, [
          el("span", { class: "lab-control-label", text: "Sequencing assay / pipeline" }),
          choiceRow(el, [
            { label: "Standard exome", value: "exome" },
            { label: "Short-read WGS + SV caller", value: "shortWgs" },
            { label: "Long-read WGS", value: "longWgs" },
          ], assay, (value) => { assay = value; render(); }, "Sequencing assay"),
        ]),
        el("div", { class: "readout" }, [
          stat(result.detected === true ? "yes" : result.detected === false ? "no" : result.detected, "reported"),
          stat(result.confidence, "confidence"),
          stat(result.evidence, "evidence retained"),
        ])
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "you changed", value: assay.replace(/([A-Z])/g, " $1") + " on " + event.replace(/([A-Z])/g, " $1") },
        { key: "mechanism", value: result.evidence },
        { key: "observable", value: result.detected === true ? "event reported" : result.detected === false ? "false negative" : result.detected },
      ]));
      parts.explanation.className = "callout " + (result.detected === false ? "callout-bad" : "");
      parts.explanation.innerHTML = "<strong>Assay and pipeline are part of the phenotype.</strong> Exome capture and small-variant callers can both be present while an insertion remains invisible; repeat-defined breakpoints are exactly where longer molecules add information.";
    }

    predict(body, {
      widget: "transposon-lifecycle-lab",
      question: "L1 reverse transcription starts at the RNA's poly(A)-bearing 3′ end and stops early. Which end of the new genomic copy is usually missing?",
      hint: "The first sequence copied survives an interruption; the sequence reached last does not.",
      options: [
        { label: "The 3′ end" },
        { label: "The 5′ end", correct: true },
        { label: "Both ends equally often" },
        { label: "Only the target-site duplication" },
      ],
    }, () => {
      mode = "tprt";
      step = 3;
      completion = 0.55;
      parts.instrument.hidden = false;
      render();
    });
    finishLab(parts, body);
  });

  /* Ch 20 view ----------------------------------------------------------- */

  function chromosomeLoadSvg(selected) {
    const items = Object.values(CHROMOSOME_LOAD);
    const x = (length) => 62 + (length - 40) / 80 * 380;
    const y = (genes) => 244 - Math.min(1, genes / 1500) * 160;
    const points = items.map((item) => {
      const active = item.chromosome === selected.chromosome;
      return '<g class="load-point' + (item.term ? " is-term" : " is-lost") + (active ? " is-selected" : "") + '">' +
        '<circle cx="' + x(item.lengthMb).toFixed(1) + '" cy="' + y(item.genes).toFixed(1) + '" r="' + (active ? 13 : 9) + '"/>' +
        '<text x="' + (x(item.lengthMb) + 13).toFixed(1) + '" y="' + (y(item.genes) - 10).toFixed(1) + '">chr ' + item.chromosome + "</text></g>";
    }).join("");
    return textSvg(
      svgLines("lab-svg-kicker", 18, 22, ["autosomal trisomy", "size versus coding-gene load · chr " + selected.chromosome], 19) +
      '<path class="plot-axis" d="M56 62 V250 H470"/>' +
      '<text class="axis-label" x="265" y="286" text-anchor="middle">chromosome length (Mb) →</text>' +
      '<text class="axis-label" transform="translate(28 166) rotate(-90)" text-anchor="middle">protein-coding genes →</text>' +
      points +
      '<text class="load-verdict" x="468" y="22" text-anchor="end">' + (selected.term ? "seen at term" : "never at term") + "</text>",
      "Chromosome size and protein-coding gene load for trisomies 13, 18, 19, and 21. Selected chromosome " +
        selected.chromosome + " is " + selected.lengthMb + " megabases with about " + selected.genes +
        " genes and is " + (selected.term ? "seen" : "not seen") + " at term.",
      "0 0 500 304",
      "chromosome-load-diagram"
    );
  }

  function maternalAgeSvg(result) {
    const denominator = result.age === 45 ? "~1 in 25–30" : "~1 in " + result.riskDenominator;
    const clampDisplay = result.clamp === "arm chiasma + distal cohesion" ? "arm chiasma + distal clamp"
      : result.clamp === "pericentromeric exchange" ? "near centre exchange"
      : result.clamp;
    return textSvg(
      svgLines("lab-svg-kicker", 18, 20, [
        "maternal age " + result.age,
        denominator + " live-birth trisomy-21 risk",
        "mechanism chain, not an individual prediction",
      ], 18) +
      '<g class="age-station"><circle cx="72" cy="146" r="42"/><text x="72" y="139" text-anchor="middle">fetal life</text><text class="lab-svg-label" x="72" y="162" text-anchor="middle">cohesin loaded</text></g>' +
      '<path class="fault-arrow" d="M116 146 H158"/>' +
      '<g class="age-station is-arrest"><circle cx="207" cy="146" r="42"/><text x="207" y="139" text-anchor="middle">~' + result.arrestYears + ' years</text><text class="lab-svg-label" x="207" y="162" text-anchor="middle">prophase arrest</text></g>' +
      '<path class="fault-arrow" d="M251 146 H293"/>' +
      '<g class="age-station"><circle cx="342" cy="146" r="42"/><text x="342" y="126" text-anchor="middle">chiasma</text>' + svgLines("lab-svg-label", 342, 151, wrapWords(clampDisplay, 14).slice(0, 2), 22, "middle") + '</g>' +
      '<path class="fault-arrow" d="M386 146 H424"/>' +
      '<g class="age-outcome"><rect x="421" y="108" width="68" height="76" rx="7"/><text x="455" y="136" text-anchor="middle">MI</text><text class="lab-svg-label" x="455" y="160" text-anchor="middle">threshold</text></g>' +
      svgLines("age-hazard", 250, 228, wrapWords(result.hazard, 44).slice(0, 2), 18, "middle"),
      "At maternal age " + result.age + ", an oocyte has spent about " + result.arrestYears +
        " years in prophase-I arrest with cohesin loaded before arrest and not measurably replenished. " +
        result.clamp + ". First failure: " + result.firstFailure + ". Approximate live-birth trisomy-21 risk " + denominator + ".",
      "0 0 500 266",
      "maternal-age-diagram"
    );
  }

  function originTraceSvg(result) {
    const isMosaic = result.diagnosis === "somatic mosaicism";
    const samplingDescription = isMosaic
      ? " At " + percent(result.abnormalFraction, 0) + " abnormal fraction, a " +
        result.cellsSampled + "-cell tissue sample expects " + result.abnormalCellsInSample +
        " abnormal cells and has a " + percent(result.missProbability, 1) + " chance of missing the line."
      : "";
    const markerNodes = isMosaic
      ? '<circle cx="200" cy="132" r="34"/><circle cx="300" cy="132" r="34"/><text x="200" y="138" text-anchor="middle">47</text><text x="300" y="138" text-anchor="middle">45</text>'
      : '<circle cx="155" cy="132" r="34"/><circle cx="250" cy="132" r="34"/><circle cx="345" cy="132" r="34"/><text x="155" y="138" text-anchor="middle">' + result.centromere.split(" + ")[0] + '</text><text x="250" y="138" text-anchor="middle">' + result.centromere.split(" + ")[1] + '</text><text x="345" y="138" text-anchor="middle">' + result.centromere.split(" + ")[2] + '</text>';
    return textSvg(
      svgLines("lab-svg-kicker", 18, 24, [result.division, result.markerClue], 20) +
      '<g class="origin-marker">' + markerNodes + '</g>' +
      '<path class="fault-line" d="M50 194 H450"/>' +
      '<text class="origin-diagnosis" x="250" y="225" text-anchor="middle">' + result.diagnosis + '</text>' +
        svgLines("lab-svg-label", 250, 248, wrapWords(result.lineages, 38).slice(0, 2), 18, "middle"),
      result.division + ". Centromere-proximal marker display: " + result.centromere + ". " +
        result.markerClue + ", diagnosing " + result.diagnosis + ". " + result.lineages + "." +
        samplingDescription,
      "0 0 500 282",
      "origin-trace-diagram"
    );
  }

  function cnvBoard(el, result, evidence) {
    if (result.view === "dosage") {
      const dosageMarks = typeof result.copies === "number"
        ? "●".repeat(result.copies)
        : "varies among healthy people";
      return statusStrip(el, [
        { label: "locus", value: result.locus },
        { label: "copies", value: String(result.copies) },
        { label: "phenotype", value: result.phenotype, tone: result.phenotype === "usual dosage" || result.phenotype === "often healthy" ? "active" : "bad" },
        { label: "interpretation", value: result.interpretation },
        { label: "dosage marks", value: dosageMarks },
      ], "Copy-number dosage interpretation");
    }
    return statusStrip(el, [
      { label: "copy states", value: evidence.twoStates ? "two-state oscillation" : "many states" },
      { label: "breakpoints", value: evidence.clustered ? "clustered" : "dispersed" },
      { label: "join orientation", value: evidence.randomJoins ? "random over four classes" : "patterned" },
      { label: "verdict", value: result.diagnosis, tone: result.evidenceCount === 3 ? "active" : "bad" },
    ], "Chromothripsis diagnostic evidence");
  }

  function carrierProductBoard(el, result) {
    const board = el("div", {
      class: "carrier-product-board",
      role: "img",
      "aria-label": result.configuration + ". Products: " + result.products.join(", ") +
        ". Balanced fraction in this four-product or selected-segregation fixture " + percent(result.balanced, 0) +
        ". " + result.reproductive + ".",
    });
    board.append(el("div", { class: "carrier-cross", "aria-hidden": "true" }, [
      el("span", { class: "carrier-arm arm-one" }),
      el("span", { class: "carrier-arm arm-two" }),
      el("span", { class: "carrier-arm arm-three" }),
      el("span", { class: "carrier-arm arm-four" }),
    ]));
    board.append(el("div", { class: "carrier-products" }, result.products.map((product, index) =>
      el("div", { class: "carrier-product" + (index < Math.round(result.balanced * result.products.length) ? " is-balanced" : " is-unbalanced") }, [
        el("span", { text: String(index + 1) }),
        el("strong", { text: product }),
      ])
    )));
    return board;
  }

  function rescueSvg(result, origin, lost) {
    const copies = result.copiesBefore;
    return textSvg(
      svgLines("lab-svg-kicker", 18, 24, [origin + " rescue", result.rescue], 20) +
      '<g class="rescue-before">' + Array.from({ length: copies }, (_, index) =>
        '<circle cx="' + (190 + index * 60) + '" cy="118" r="24"/><text x="' + (190 + index * 60) + '" y="124" text-anchor="middle">' +
          (origin === "trisomy" ? ["M1", "M2", "P"][index] : "M") + "</text>"
      ).join("") + "</g>" +
      '<path class="fault-arrow" d="M250 153 V190"/>' +
      '<g class="rescue-after"><rect x="90" y="198" width="320" height="90" rx="7"/><text x="250" y="222" text-anchor="middle">' + result.disomy + '</text>' + svgLines("lab-svg-label", 250, 244, wrapWords(result.risks.join(" · "), 45).slice(0, 2), 22, "middle") + "</g>",
      origin + " rescue by " + result.rescue + " produces " + result.disomy +
        ". The selected outcome accounts for " + percent(result.routeProbability, 1) +
        " of this rescue fixture; UPD across random rescues is " + percent(result.updProbability, 1) +
        ". Risks: " + result.risks.join(", ") + ".",
      "0 0 500 302",
      "rescue-diagram"
    );
  }

  function assayBoard(el, result, event, assay) {
    const verdict = result.detected === true ? "detects" : result.detected === false ? "blind" : result.detected;
    return statusStrip(el, [
      { label: "hypothesis", value: event.replace(/([A-Z0-9])/g, " $1").trim() },
      { label: "assay", value: assay.replace(/([A-Z])/g, " $1") },
      { label: "verdict", value: verdict, tone: result.detected === false ? "bad" : "active" },
      { label: "why", value: result.explanation },
    ], "Chromosome assay decision");
  }

  define("chromosome-workbench-lab", {
    "ch20-o1": "Origin trace switches MI, MII, and post-zygotic marker signatures and quantifies tissue-limited mosaic sampling",
    "ch20-o2": "Gene-load plot makes chromosome 19 the decisive size-versus-content counterexample",
    "ch20-o3": "Maternal-age mechanism chain combines fetal cohesin loading, decades of arrest, crossover placement, and the chapter risk table",
    "ch20-o4": "Carrier mode enumerates inversion and translocation products and balanced fractions",
    "ch20-o5": "CNV submode separates harmless reference difference from PMP22 dosage and diagnoses the three-part chromothripsis signature",
    "ch20-o6": "Rescue mode derives one-third trisomy-rescue UPD and isodisomy recessive risk",
    "ch20-o7": "Assay ladder exposes resolution, targeting, balance, repeat, phasing, and mosaic blind spots",
  }, function (api) {
    const { body, el, stat, predict } = api;
    const parts = labParts(el);
    let mode = "load";
    let loadView = "genes";
    let chromosome = "chr19";
    let maternalAge = 35;
    let crossoverPlacement = "distal";
    let carrierType = "pericentric";
    let carrierEvent = "inside";
    let evidenceView = "assay";
    let originMode = "mi";
    let abnormalFraction = 0.4;
    let cellsSampled = 30;
    let rescueOrigin = "trisomy";
    let lost = "paternal";
    let assayEvent = "balanced";
    let assay = "array";
    let cnvView = "dosage";
    let cnvState = "pmp22Three";
    let twoStates = true;
    let clustered = true;
    let randomJoins = true;

    function carrierEvents() {
      return carrierType === "paracentric" || carrierType === "pericentric"
        ? [
            { label: "Crossover outside loop", value: "outside" },
            { label: "Crossover inside loop", value: "inside" },
          ]
        : carrierType === "robertsonian" ? [
            { label: "Balanced pair", value: "balancedPair" },
            { label: "Trisomy/monosomy 21 pair", value: "trisomy21Pair" },
            { label: "Trisomy/monosomy 14 pair", value: "trisomy14Pair" },
          ] : [
            { label: "Alternate", value: "alternate" },
            { label: "Adjacent-1", value: "adjacent1" },
            { label: "Adjacent-2", value: "adjacent2" },
            { label: "3:1", value: "threeOne" },
          ];
    }

    function render() {
      parts.tabHost.replaceChildren(tabs(el, [
        { label: "Dosage & age", value: "load" },
        { label: "Carrier meiosis", value: "carrier" },
        { label: "Rescue & detection", value: "evidence" },
      ], mode, (next) => { mode = next; render(); }));

      if (mode === "load") {
        const subTabs = el("div", { class: "lab-control-block compact-submode" }, [
          el("span", { class: "lab-control-label", text: "Aneuploidy question" }),
          choiceRow(el, [
            { label: "Which trisomies survive?", value: "genes" },
            { label: "Why maternal age?", value: "age" },
          ], loadView, (value) => { loadView = value; render(); }, "Aneuploidy mechanism view"),
        ]);
        if (loadView === "age") {
          const result = chromosomeWorkbenchModel({ kind: "age", age: maternalAge, crossover: crossoverPlacement });
          parts.visual.innerHTML = maternalAgeSvg(result);
          parts.controls.replaceChildren(subTabs,
            el("div", { class: "lab-control-block" }, [
              el("span", { class: "lab-control-label", text: "Maternal age at ovulation" }),
              choiceRow(el, [20, 25, 30, 35, 40, 45].map((age) => ({ label: String(age), value: age })), maternalAge, (value) => { maternalAge = value; render(); }, "Maternal age"),
            ]),
            el("div", { class: "lab-control-block" }, [
              el("span", { class: "lab-control-label", text: "Crossover geometry on this bivalent" }),
              choiceRow(el, [
                { label: "Well placed", value: "wellPlaced" },
                { label: "Absent", value: "absent" },
                { label: "Distal", value: "distal" },
                { label: "Pericentromeric", value: "pericentromeric" },
              ], crossoverPlacement, (value) => { crossoverPlacement = value; render(); }, "Crossover geometry"),
            ]),
            el("div", { class: "readout" }, [
              stat("~" + result.arrestYears + " years", "unmaintained prophase-I arrest"),
              stat(result.age === 45 ? "~1 in 25–30" : "~1 in " + result.riskDenominator, "trisomy-21 live-birth risk"),
              stat(result.firstFailure, "first mechanical failure"),
            ])
          );
          parts.rail.replaceChildren(causalRail(el, [
            { key: "you changed", value: "age " + maternalAge + " · " + crossoverPlacement },
            { key: "mechanism", value: result.cohesion + " · " + result.clamp },
            { key: "observable", value: result.hazard },
          ]));
          parts.explanation.className = "callout";
          parts.explanation.innerHTML = "<strong>The curve accelerates because two vulnerabilities multiply.</strong> Cohesin was loaded before fetal-life arrest and is not replenished; badly placed or absent crossovers begin with a weaker physical clamp. The displayed risks are the chapter's approximate live-birth rates, not patient-specific predictions.";
          return;
        }
        const result = chromosomeWorkbenchModel({ kind: "load", chromosome });
        parts.visual.innerHTML = chromosomeLoadSvg(result);
        parts.controls.replaceChildren(
          subTabs,
          el("div", { class: "lab-control-block" }, [
            el("span", { class: "lab-control-label", text: "Extra autosome" }),
            choiceRow(el, [
              { label: "Trisomy 21", value: "chr21" },
              { label: "Trisomy 18", value: "chr18" },
              { label: "Trisomy 13", value: "chr13" },
              { label: "Trisomy 19", value: "chr19" },
            ], chromosome, (value) => { chromosome = value; render(); }, "Autosomal trisomy"),
          ]),
          el("div", { class: "readout" }, [
            stat(result.lengthMb + " Mb", "physical length"),
            stat("~" + result.genes, "protein-coding genes"),
            stat(result.term ? "yes" : "no", "observed at term"),
          ])
        );
        parts.rail.replaceChildren(causalRail(el, [
          { key: "you changed", value: "extra chromosome " + result.chromosome },
          { key: "mechanism", value: "~" + result.genes + " genes shifted toward 1.5× dosage" },
          { key: "observable", value: result.term ? "compatible with some live births" : "not compatible with term" },
        ]));
        parts.explanation.className = "callout " + (!result.term ? "callout-bad" : "");
        parts.explanation.innerHTML = "<strong>Chromosome 19 breaks the size story.</strong> It is smaller than chromosome 13 but carries roughly four times as many coding genes; tolerability tracks dosage-sensitive gene load, not megabases alone.";
        return;
      }

      if (mode === "carrier") {
        const validEvents = carrierEvents();
        if (!validEvents.some((entry) => entry.value === carrierEvent)) carrierEvent = validEvents[0].value;
        const result = chromosomeWorkbenchModel({ kind: "carrier", type: carrierType, event: carrierEvent });
        parts.visual.replaceChildren(carrierProductBoard(el, result));
        parts.controls.replaceChildren(
          el("div", { class: "lab-control-block" }, [
            el("span", { class: "lab-control-label", text: "Balanced carrier" }),
            choiceRow(el, [
              { label: "Paracentric inversion", value: "paracentric" },
              { label: "Pericentric inversion", value: "pericentric" },
              { label: "Reciprocal translocation", value: "reciprocal" },
              { label: "Robertsonian", value: "robertsonian" },
            ], carrierType, (value) => {
              carrierType = value;
              carrierEvent = value === "paracentric" || value === "pericentric"
                ? "inside"
                : value === "robertsonian" ? "balancedPair" : "alternate";
              render();
            }, "Carrier rearrangement"),
          ]),
          el("div", { class: "lab-control-block" }, [
            el("span", { class: "lab-control-label", text: "Meiotic event / segregation" }),
            choiceRow(el, validEvents, carrierEvent, (value) => { carrierEvent = value; render(); }, "Meiotic carrier event"),
          ]),
          el("div", { class: "readout" }, [
            stat(percent(result.balanced, 0), "balanced in this enumeration"),
            stat(result.configuration, "pairing configuration"),
            stat(result.reproductive, "reproductive consequence"),
          ])
        );
        parts.rail.replaceChildren(causalRail(el, [
          { key: "you changed", value: result.configuration + " · " + carrierEvent },
          { key: "mechanism", value: "homologous regions must pair despite different layouts" },
          { key: "observable", value: result.products.join(" / ") },
        ]));
        parts.explanation.className = "callout";
        parts.explanation.innerHTML = "<strong>Balanced describes the carrier, not the pregnancy distribution.</strong> Fractions here enumerate the displayed chromatids or selected segregation class; real live-birth risk also depends on unequal segregation frequencies and selective loss after conception.";
        return;
      }

      const subTabs = el("div", { class: "lab-control-block compact-submode" }, [
        el("span", { class: "lab-control-label", text: "Evidence problem" }),
        choiceRow(el, [
          { label: "Trace the error", value: "origin" },
          { label: "Chromosome rescue", value: "rescue" },
          { label: "CNV or catastrophe", value: "cnv" },
          { label: "Choose an assay", value: "assay" },
        ], evidenceView, (value) => { evidenceView = value; render(); }, "Chromosome evidence view"),
      ]);
      if (evidenceView === "origin") {
        const result = chromosomeWorkbenchModel({
          kind: "origin", origin: originMode, abnormalFraction, cellsSampled,
        });
        parts.visual.innerHTML = originTraceSvg(result);
        parts.controls.replaceChildren(subTabs,
          el("div", { class: "lab-control-block" }, [
            el("span", { class: "lab-control-label", text: "Error being reconstructed" }),
            choiceRow(el, [
              { label: "Maternal MI", value: "mi" },
              { label: "Maternal MII", value: "mii" },
              { label: "Post-zygotic mitosis", value: "mitosis" },
            ], originMode, (value) => { originMode = value; render(); }, "Aneuploidy origin"),
          ]),
          ...(originMode === "mitosis" ? [
            rangeControl(el, "Abnormal fraction in this tissue", abnormalFraction, {
              min: 0.02, max: 0.95, step: 0.01, format: (value) => percent(value, 0),
            }, (value) => { abnormalFraction = value; render(); }),
            rangeControl(el, "Cells examined", cellsSampled, {
              min: 10, max: 100, step: 5, format: (value) => String(value),
            }, (value) => { cellsSampled = value; render(); }),
          ] : []),
          el("div", { class: "readout" }, [
            stat(result.markerClue, "centromere-proximal clue"),
            stat(result.diagnosis, "origin diagnosis"),
            stat(originMode === "mitosis" ? String(result.abnormalCellsInSample) : "all sampled cells", "expected abnormal cells"),
            stat(originMode === "mitosis" ? percent(result.missProbability, 1) : "0% in this constitutional fixture", "chance this sample misses the line"),
          ])
        );
        parts.rail.replaceChildren(causalRail(el, [
          { key: "you changed", value: result.division },
          { key: "mechanism", value: result.centromere },
          { key: "observable", value: result.markerClue + " · " + result.lineages },
        ]));
        parts.explanation.className = "callout";
        parts.explanation.innerHTML = "<strong>Use a centromere-proximal marker to minimise crossover ambiguity.</strong> MI retains both homologues; MII duplicates sisters. A post-zygotic error is diagnosed by cell lines, and its measured fraction belongs to the tissue sampled—not to the whole person.";
        return;
      }
      if (evidenceView === "rescue") {
        const result = chromosomeWorkbenchModel({ kind: "rescue", origin: rescueOrigin, lost });
        parts.visual.innerHTML = rescueSvg(result, rescueOrigin, lost);
        parts.controls.replaceChildren(subTabs,
          el("div", { class: "lab-control-block" }, [
            el("span", { class: "lab-control-label", text: "Starting conceptus" }),
            choiceRow(el, [
              { label: "Trisomic", value: "trisomy" },
              { label: "Monosomic", value: "monosomy" },
            ], rescueOrigin, (value) => { rescueOrigin = value; render(); }, "Rescue origin"),
          ]),
          ...(rescueOrigin === "trisomy" ? [el("div", { class: "lab-control-block" }, [
            el("span", { class: "lab-control-label", text: "Chromosome lost during rescue" }),
            choiceRow(el, [
              { label: "Paternal copy", value: "paternal" },
              { label: "One maternal copy", value: "maternal" },
            ], lost, (value) => { lost = value; render(); }, "Lost trisomic chromosome"),
          ])] : []),
          el("div", { class: "readout" }, [
            stat(percent(result.routeProbability, 1), "share of rescues with selected outcome"),
            stat(percent(result.updProbability, 1), "UPD across random rescues"),
            stat(result.disomy, "copy origin"),
            stat(result.risks.join(" + "), "specific hazard"),
          ])
        );
        parts.rail.replaceChildren(causalRail(el, [
          { key: "you changed", value: rescueOrigin + " rescue" },
          { key: "mechanism", value: result.rescue },
          { key: "observable", value: result.disomy + " · " + result.risks.join(" + ") },
        ]));
        parts.explanation.className = "callout";
        parts.explanation.innerHTML = "<strong>Normal copy count can retain abnormal ancestry.</strong> Trisomy rescue loses the lone other-parent homologue one time in three; monosomy rescue necessarily duplicates one chromosome and creates isodisomy.";
        return;
      }

      if (evidenceView === "cnv") {
        const cnvTabs = el("div", { class: "lab-control-block compact-submode" }, [
          el("span", { class: "lab-control-label", text: "Copy-number question" }),
          choiceRow(el, [
            { label: "Dosage spectrum", value: "dosage" },
            { label: "Chromothripsis test", value: "catastrophe" },
          ], cnvView, (value) => { cnvView = value; render(); }, "Copy-number interpretation"),
        ]);
        if (cnvView === "dosage") {
          const result = chromosomeWorkbenchModel({ kind: "cnv", view: "dosage", state: cnvState });
          parts.visual.replaceChildren(cnvBoard(el, result, {}));
          parts.controls.replaceChildren(subTabs, cnvTabs,
            el("div", { class: "lab-control-block" }, [
              el("span", { class: "lab-control-label", text: "Observed CNV" }),
              choiceRow(el, [
                { label: "Common gene-poor CNV", value: "common" },
                { label: "PMP22 · 1 copy", value: "pmp22One" },
                { label: "PMP22 · 2 copies", value: "pmp22Two" },
                { label: "PMP22 · 3 copies", value: "pmp22Three" },
              ], cnvState, (value) => { cnvState = value; render(); }, "CNV state"),
            ]),
            el("div", { class: "readout" }, [
              stat(String(result.copies), "copy state"),
              stat(result.phenotype, "phenotype"),
              stat(result.interpretation, "why"),
            ])
          );
          parts.rail.replaceChildren(causalRail(el, [
            { key: "you changed", value: result.locus + " · " + result.copies + " copies" },
            { key: "mechanism", value: result.interpretation },
            { key: "observable", value: result.phenotype },
          ]));
          parts.explanation.className = "callout";
          parts.explanation.innerHTML = "<strong>A CNV is a measurement, not a verdict.</strong> Healthy genomes contain extensive copy-number variation; pathogenicity follows gene content, dosage sensitivity, inheritance, and population frequency. PMP22 makes the reciprocal one/two/three-copy experiment unusually clean.";
          return;
        }
        const evidence = { twoStates, clustered, randomJoins };
        const result = chromosomeWorkbenchModel(Object.assign({ kind: "cnv", view: "catastrophe" }, evidence));
        parts.visual.replaceChildren(cnvBoard(el, result, evidence));
        parts.controls.replaceChildren(subTabs, cnvTabs,
          el("div", { class: "lab-control-block" }, [
            el("span", { class: "lab-control-label", text: "Whole-genome evidence" }),
            choiceRow(el, [
              { label: "Two copy states", value: true },
              { label: "Many copy states", value: false },
            ], twoStates, (value) => { twoStates = value; render(); }, "Copy-number state count"),
            choiceRow(el, [
              { label: "Breakpoints clustered", value: true },
              { label: "Breakpoints dispersed", value: false },
            ], clustered, (value) => { clustered = value; render(); }, "Breakpoint distribution"),
            choiceRow(el, [
              { label: "Join orientations random", value: true },
              { label: "Join orientations patterned", value: false },
            ], randomJoins, (value) => { randomJoins = value; render(); }, "Join orientations"),
          ]),
          el("div", { class: "readout" }, [
            stat(result.evidenceCount + " / 3", "one-event criteria present"),
            stat(result.diagnosis, "diagnosis"),
            stat(result.mechanism, "mechanistic interpretation"),
          ])
        );
        parts.rail.replaceChildren(causalRail(el, [
          { key: "you changed", value: result.evidenceCount + " of 3 chromothripsis criteria" },
          { key: "mechanism", value: result.mechanism },
          { key: "observable", value: result.diagnosis },
        ]));
        parts.explanation.className = "callout " + (result.evidenceCount === 3 ? "callout-good" : "");
        parts.explanation.innerHTML = "<strong>Chromothripsis is a joint signature.</strong> Two-state copy-number oscillation, locally clustered breakpoints, and random join orientations together support one catastrophic shatter-and-stitch event; no single feature proves it alone.";
        return;
      }

      const result = chromosomeWorkbenchModel({ kind: "assay", event: assayEvent, assay });
      parts.visual.replaceChildren(assayBoard(el, result, assayEvent, assay));
      parts.controls.replaceChildren(subTabs,
        el("div", { class: "lab-control-block" }, [
          el("span", { class: "lab-control-label", text: "Rearrangement hypothesis" }),
          choiceRow(el, [
            { label: "Balanced translocation", value: "balanced" },
            { label: "200 kb deletion", value: "deletion200" },
            { label: "Uniparental disomy", value: "upd" },
            { label: "10% mosaic trisomy", value: "mosaic10" },
            { label: "Repeat-mediated junction", value: "repeatJunction" },
          ], assayEvent, (value) => { assayEvent = value; render(); }, "Rearrangement hypothesis"),
        ]),
        el("div", { class: "lab-control-block" }, [
          el("span", { class: "lab-control-label", text: "Assay" }),
          choiceRow(el, [
            { label: "Karyotype", value: "karyotype" },
            { label: "FISH", value: "fish" },
            { label: "SNP microarray", value: "array" },
            { label: "Short-read WGS", value: "shortWgs" },
            { label: "Long-read WGS", value: "longWgs" },
          ], assay, (value) => { assay = value; render(); }, "Chromosome assay"),
        ]),
        el("div", { class: "readout" }, [
          stat(result.detected === true ? "detects" : result.detected === false ? "blind" : result.detected, "verdict"),
          stat(result.explanation, "reason"),
        ])
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "you changed", value: assay + " for " + assayEvent },
        { key: "mechanism", value: result.explanation },
        { key: "observable", value: result.detected === true ? "signal expected" : result.detected === false ? "normal result despite event" : result.detected },
      ]));
      parts.explanation.className = "callout " + (result.detected === false ? "callout-bad" : "");
      parts.explanation.innerHTML = "<strong>Choose by hypothesis, not by a single resolution number.</strong> Balance, parental origin, target selection, repeat mappability, tissue sampling, and molecule count create different blind spots.";
    }

    predict(body, {
      widget: "chromosome-workbench-lab",
      question: "Chromosome 19 is smaller than chromosome 13, yet trisomy 19 is never seen at term. Which variable best explains the difference?",
      hint: "An extra chromosome changes dosage for every gene it carries.",
      options: [
        { label: "Physical chromosome length" },
        { label: "Protein-coding gene load", correct: true },
        { label: "Centromere position alone" },
        { label: "Whether the chromosome is maternal" },
      ],
    }, () => {
      mode = "load";
      loadView = "genes";
      chromosome = "chr19";
      parts.instrument.hidden = false;
      render();
    });
    finishLab(parts, body);
  });

  /* Ch 20A view ---------------------------------------------------------- */

  function transferRouteSvg(result) {
    const ruledOutLines = wrapWords("rules out: " + result.ruledOut, 36).slice(0, 2);
    return textSvg(
      svgLines("lab-svg-kicker", 18, 24, [result.route, result.decisive], 20) +
      '<g class="bacterium donor"><rect x="30" y="94" width="118" height="72" rx="34"/><text x="89" y="136" text-anchor="middle">donor</text></g>' +
      '<path class="transfer-path" d="M154 130 H342"/>' +
      '<g class="courier"><circle cx="250" cy="130" r="44"/><text x="250" y="124" text-anchor="middle">' + result.courier + '</text><text class="lab-svg-label" x="250" y="149" text-anchor="middle">one-way</text></g>' +
      '<g class="bacterium recipient"><rect x="350" y="94" width="118" height="72" rx="34"/><text x="409" y="136" text-anchor="middle">recipient</text></g>' +
      '<path class="fault-line" d="M36 204 H464"/>' +
      svgLines("transfer-rule", 250, 226, ruledOutLines, 18, "middle"),
      "The transfer route is " + result.route + " using " + result.courier +
        ". Decisive control: " + result.decisive + ". This rules out " + result.ruledOut + ".",
      "0 0 500 256",
      "transfer-route-diagram"
    );
  }

  function plasmidControlSvg(result, control) {
    const headingLines = [
      control + " replication control",
      ...wrapWords(result.principle, 48),
    ].slice(0, 3);
    return textSvg(
      svgLines("lab-svg-kicker", 18, 20, headingLines, 18) +
      '<g class="plasmid-cell"><circle cx="250" cy="160" r="98"/><circle class="plasmid-one" cx="215" cy="150" r="34"/><circle class="plasmid-two" cx="290" cy="170" r="34"/><text x="215" y="155" text-anchor="middle">P1</text><text x="290" y="175" text-anchor="middle">P2</text></g>' +
      '<path class="controller-line" d="M215 113 Q250 77 290 133"/>' +
      '<text class="plasmid-verdict" x="250" y="286" text-anchor="middle">' + result.outcome + "</text>",
      "Two plasmids with " + control + " replication control. The controller sees " + result.controllerSees +
        ", so " + result.outcome + ". " + result.principle + ".",
      "0 0 500 294",
      "plasmid-control-diagram"
    );
  }

  function fprimeBoard(el, result) {
    return statusStrip(el, [
      { label: "chromosome", value: result.recipient },
      { label: "F′ episome", value: result.fprime },
      { label: "ploidy", value: result.localPloidy },
      { label: "phenotype", value: result.phenotype, tone: result.complements ? "active" : "bad" },
      { label: "inference", value: result.inference },
    ], "F-prime merodiploid complementation test");
  }

  function rFactorSvg(result) {
    const headingLines = [
      "R factor as a transferable module",
      ...wrapWords(result.module, 48),
    ].slice(0, 3);
    const phenotypeLines = wrapWords(result.phenotype, 40).slice(0, 2);
    return textSvg(
      svgLines("lab-svg-kicker", 18, 20, headingLines, 18) +
      '<g class="bacterium donor"><rect x="24" y="100" width="142" height="78" rx="38"/><text x="95" y="133" text-anchor="middle">donor species</text><circle class="r-plasmid" cx="96" cy="157" r="13"/></g>' +
      '<path class="transfer-path' + (result.transferred ? ' is-active' : '') + '" d="M172 139 H328"/>' +
      '<g class="courier"><circle cx="250" cy="139" r="42"/><text x="250" y="133" text-anchor="middle">R</text><text class="lab-svg-label" x="250" y="157" text-anchor="middle">tra + cassette</text></g>' +
      '<g class="bacterium recipient"><rect x="334" y="100" width="142" height="78" rx="38"/><text x="405" y="133" text-anchor="middle">recipient species</text><circle class="r-plasmid' + (result.transferred ? ' is-active' : '') + '" cx="406" cy="157" r="13"/></g>' +
      svgLines("transfer-rule", 250, 218, phenotypeLines, 18, "middle"),
      result.donor + " to " + result.recipient + ". " + result.module + ". " + result.phenotype + ". " + result.implication + ".",
      "0 0 500 254",
      "r-factor-diagram"
    );
  }

  function hfrSvg(result, time) {
    const x = (arrival) => 48 + arrival / 106 * 414;
    const markers = result.markers.map((marker, index) => {
      const nameY = [78, 100, 122][index % 3];
      const timeY = [220, 244, 268][index % 3];
      return '<g class="hfr-marker' + (marker.arrived ? " is-arrived" : "") + '"><line x1="' + x(marker.arrival).toFixed(1) + '" y1="132" x2="' + x(marker.arrival).toFixed(1) + '" y2="198"/><circle cx="' + x(marker.arrival).toFixed(1) + '" cy="165" r="10"/><text x="' + x(marker.arrival).toFixed(1) + '" y="' + nameY + '" text-anchor="middle">' + marker.name + '</text><text class="lab-svg-label" x="' + x(marker.arrival).toFixed(1) + '" y="' + timeY + '" text-anchor="middle">' + marker.arrival.toFixed(1) + "m</text></g>";
    }).join("");
    const timeX = x(time);
    const timeLabelX = timeX > 400 ? timeX - 8 : timeX + 8;
    const timeLabelAnchor = timeX > 400 ? "end" : "start";
    return textSvg(
      svgLines("lab-svg-kicker", 18, 24, [
        "constant-speed Hfr chromosome entry",
        "pair/initiation delay ≠ map distance",
      ], 20) +
      '<path class="hfr-axis" d="M48 165 H462"/>' + markers +
      '<path class="hfr-time" d="M' + timeX.toFixed(1) + ' 62 V282"/>' +
      '<text class="hfr-time-label" x="' + timeLabelX.toFixed(1) + '" y="298" text-anchor="' + timeLabelAnchor + '">blend at ' + time + " min</text>" +
      '<text class="lab-svg-label" x="250" y="330" text-anchor="middle">arrived: ' + (result.arrived.map((marker) => marker.name).join(" → ") || "none") + "</text>",
      "Interrupted mating at " + time + " minutes. Markers in time-of-entry order: " +
        result.markers.map((marker) => marker.name + " " + marker.arrival.toFixed(1)).join(", ") +
        ". Arrived markers: " + (result.arrived.map((marker) => marker.name).join(", ") || "none") + ".",
      "0 0 500 350",
      "hfr-map-diagram"
    );
  }

  function cotransductionSvg(result, distance, fragmentLength) {
    const scale = 360 / fragmentLength;
    const bx = 100 + Math.min(distance, fragmentLength) * scale;
    const markers = distance < 0.025
      ? '<g class="co-marker"><circle cx="100" cy="155" r="18"/><text x="100" y="160" text-anchor="middle">A+B</text></g>'
      : '<g class="co-marker"><circle cx="100" cy="155" r="14"/><text x="100" y="160" text-anchor="middle">A</text></g>' +
        '<g class="co-marker"><circle cx="' + bx.toFixed(1) + '" cy="155" r="14"/><text x="' + bx.toFixed(1) + '" y="160" text-anchor="middle">B</text></g>';
    return textSvg(
      svgLines("lab-svg-kicker", 18, 24, ["P1 headful L = " + fragmentLength.toFixed(1) + " min", "marker separation d = " + distance.toFixed(2) + " min"], 20) +
      '<path class="fragment-bracket" d="M70 86 V108 M70 96 H430 M430 86 V108"/>' +
      '<path class="bacterial-chromosome" d="M35 155 H465"/>' +
      markers +
      '<path class="cotransduction-window" d="M70 198 H430"/>' +
      '<text class="cotransduction-value" x="250" y="238" text-anchor="middle">C = (1 − d/L)³ = ' + percent(result.c, 1) + "</text>" +
      '<text class="lab-svg-label" x="250" y="266" text-anchor="middle">' + (result.saturated ? "saturated: all d ≥ L look identical" : result.resolutionLimited ? "near-one regime: sampling limits resolution" : "informative fragment geometry") + "</text>",
      "A and B are " + distance.toFixed(2) + " minutes apart in a fragment of length " +
        fragmentLength.toFixed(1) + ". Cotransduction is " + percent(result.c, 2) +
        ". Inverted distance is " + result.inferredDistance.toFixed(2) + " minutes. " +
        (result.saturated ? "The measurement is saturated." : result.resolutionLimited ? "The near-one regime is resolution limited." : "The distance is informative."),
      "0 0 500 284",
      "cotransduction-diagram"
    );
  }

  function lambdaBoard(el, result) {
    return barBoard(el, [
      { label: "cI repressor", value: result.ci, display: result.ci >= 0.8 ? "high" : result.ci <= 0.1 ? "low" : "mid", tone: "active" },
      { label: "Cro", value: result.cro, display: result.cro >= 0.8 ? "high" : result.cro <= 0.1 ? "low" : "mid", tone: "bad" },
    ], "Lambda operator state: " + result.state + ". " + result.memory, 1);
  }

  function benzerBoard(el, result, relationship, distanceBp, progeny) {
    return statusStrip(el, [
      { label: "lesions", value: relationship === "differentCistrons" ? "different functions" : "same function" },
      { label: "complementation", value: result.complements ? "yes" : "no", tone: result.complements ? "active" : "bad" },
      { label: "positions", value: result.effectiveDistanceBp === 0 ? "same site" : result.effectiveDistanceBp + " bp apart" },
      { label: "recombination", value: result.recombines ? "possible" : "none", tone: result.recombines ? "active" : "muted" },
      { label: "effective selected floor", value: "~" + result.detectionFloor.toExponential(1) },
      { label: "reliable map resolution", value: "~" + result.mapResolutionBp.toFixed(1) + " bp" },
    ], "Benzer complementation and recombination tests");
  }

  define("microbial-genetics-lab", {
    "ch20a-o1": "Route classifier changes DNase, contact-filter, and cell-free-filtrate evidence",
    "ch20a-o2": "Interrupted-mating clock reconstructs order, interval, transfer gradient, and direction",
    "ch20a-o3": "F′ submode creates a locus-limited merodiploid and tests same- versus different-gene complementation",
    "ch20a-o4": "Cotransduction ruler derives and inverts (1−d/L)^3 and exposes both saturation limits",
    "ch20a-o5": "Plasmid-control submode tests incompatibility; R-factor submode moves a composite resistance cassette across species",
    "ch20a-o6": "Lambda switch manipulates MOI, DNA damage, cI/cII, feedback, and plaque state",
    "ch20a-o7": "Benzer state reports selection floor and separately answers function versus position",
  }, function (api) {
    const { body, el, stat, predict } = api;
    const parts = labParts(el);
    let mode = "route";
    let routeView = "transfer";
    let routeFixture = "conjugation";
    let plasmidControl = "shared";
    let fprimeRelationship = "differentGenes";
    let rFactorContact = true;
    let mapView = "hfr";
    let direction = "forward";
    let time = 30;
    let distance = 1;
    let fragmentLength = 2;
    let phageView = "lambda";
    let condition = "highMoi";
    let phageGenotype = "normal";
    let relationship = "sameCistron";
    let distanceBp = 1;
    let progeny = 1e9;

    const routeInputs = {
      transformation: { dnaseBlocks: true, filterBlocks: false, filtrateTransfers: true },
      conjugation: { dnaseBlocks: false, filterBlocks: true, filtrateTransfers: false },
      transduction: { dnaseBlocks: false, filterBlocks: false, filtrateTransfers: true },
      unresolved: { dnaseBlocks: false, filterBlocks: false, filtrateTransfers: false },
    };

    function render() {
      parts.tabHost.replaceChildren(tabs(el, [
        { label: "Transfer controls", value: "route" },
        { label: "Fragment rulers", value: "mapping" },
        { label: "Phage logic", value: "phage" },
      ], mode, (next) => { mode = next; render(); }));

      if (mode === "route") {
        const subTabs = el("div", { class: "lab-control-block compact-submode" }, [
          el("span", { class: "lab-control-label", text: "Bacterial transfer problem" }),
          choiceRow(el, [
            { label: "Identify the courier", value: "transfer" },
            { label: "Build an F′ merodiploid", value: "fprime" },
            { label: "Test plasmid compatibility", value: "plasmid" },
            { label: "Move an R factor", value: "rfactor" },
          ], routeView, (value) => { routeView = value; render(); }, "Bacterial transfer submode"),
        ]);
        if (routeView === "transfer") {
          const inputs = routeInputs[routeFixture];
          const result = microbialGeneticsModel(Object.assign({ kind: "route" }, inputs));
          parts.visual.innerHTML = transferRouteSvg(result);
          parts.controls.replaceChildren(subTabs,
            el("div", { class: "lab-control-block" }, [
              el("span", { class: "lab-control-label", text: "Observed control pattern" }),
              choiceRow(el, [
                { label: "DNase blocks", value: "transformation" },
                { label: "Filter blocks", value: "conjugation" },
                { label: "Cell-free filtrate transfers", value: "transduction" },
                { label: "None decisive", value: "unresolved" },
              ], routeFixture, (value) => { routeFixture = value; render(); }, "Transfer-control pattern"),
            ]),
            el("div", { class: "readout" }, [
              stat(result.route, "route"),
              stat(result.courier, "courier"),
              stat(result.decisive, "decisive control"),
            ])
          );
          parts.rail.replaceChildren(causalRail(el, [
            { key: "you changed", value: result.decisive },
            { key: "mechanism", value: result.courier },
            { key: "observable", value: result.route },
          ]));
          parts.explanation.className = "callout";
          parts.explanation.innerHTML = "<strong>Each control disables one courier.</strong> DNase reaches naked DNA, a physical filter breaks contact, and a capsid preserves transfer in a cell-free DNase-resistant filtrate; reversion and cross-feeding remain controls.";
          return;
        }
        if (routeView === "fprime") {
          const result = microbialGeneticsModel({ kind: "fprime", relationship: fprimeRelationship });
          parts.visual.replaceChildren(fprimeBoard(el, result));
          parts.controls.replaceChildren(subTabs,
            el("div", { class: "lab-control-block" }, [
              el("span", { class: "lab-control-label", text: "Two recessive lac mutations placed together" }),
              choiceRow(el, [
                { label: "Same gene", value: "sameGene" },
                { label: "Different genes", value: "differentGenes" },
              ], fprimeRelationship, (value) => { fprimeRelationship = value; render(); }, "F-prime complementation pair"),
            ]),
            el("div", { class: "readout" }, [
              stat(result.localPloidy, "why the test is possible"),
              stat(result.complements ? "yes" : "no", "complements"),
              stat(result.inference, "gene inference"),
            ])
          );
          parts.rail.replaceChildren(causalRail(el, [
            { key: "you changed", value: fprimeRelationship.replace(/([A-Z])/g, " $1") },
            { key: "mechanism", value: result.localPloidy },
            { key: "observable", value: result.phenotype },
          ]));
          parts.explanation.className = "callout " + (result.complements ? "callout-good" : "");
          parts.explanation.innerHTML = "<strong>The F′ is the enabling trick.</strong> A haploid cannot ask whether two recessive alleles rescue one another in trans. The episome makes the recipient diploid only for the captured interval, so phenotype becomes a test of gene function rather than dominance.";
          return;
        }
        if (routeView === "rfactor") {
          const result = microbialGeneticsModel({ kind: "rFactor", contact: rFactorContact });
          parts.visual.innerHTML = rFactorSvg(result);
          parts.controls.replaceChildren(subTabs,
            el("div", { class: "lab-control-block" }, [
              el("span", { class: "lab-control-label", text: "Donor and recipient" }),
              choiceRow(el, [
                { label: "Direct contact", value: true },
                { label: "Separated by filter", value: false },
              ], rFactorContact, (value) => { rFactorContact = value; render(); }, "R-factor transfer contact"),
            ]),
            el("div", { class: "readout" }, [
              stat(result.transferred ? "yes" : "no", "R factor transferred"),
              stat(result.module, "mobile unit"),
              stat(result.phenotype, "recipient phenotype"),
            ])
          );
          parts.rail.replaceChildren(causalRail(el, [
            { key: "you changed", value: rFactorContact ? "cross-species cell contact" : "physical separation" },
            { key: "mechanism", value: result.module },
            { key: "observable", value: result.phenotype },
          ]));
          parts.explanation.className = "callout";
          parts.explanation.innerHTML = "<strong>Resistance moves as nested mobile modules.</strong> Conjugation moves the plasmid between cells and sometimes species; transposons and integrons move or reshuffle the resistance cassette within that replicon. Selection for one drug can retain the entire cassette.";
          return;
        }
        const result = microbialGeneticsModel({ kind: "plasmid", control: plasmidControl });
        parts.visual.innerHTML = plasmidControlSvg(result, plasmidControl);
        parts.controls.replaceChildren(subTabs,
          el("div", { class: "lab-control-block" }, [
            el("span", { class: "lab-control-label", text: "Replication/partition control" }),
            choiceRow(el, [
              { label: "Shared controller", value: "shared" },
              { label: "Independent controllers", value: "independent" },
            ], plasmidControl, (value) => { plasmidControl = value; render(); }, "Plasmid control relationship"),
          ]),
          el("div", { class: "readout" }, [
            stat(result.coexist ? "possible" : "unstable", "coexistence"),
            stat(result.controllerSees, "controller input"),
            stat(result.outcome, "long-run outcome"),
          ])
        );
        parts.rail.replaceChildren(causalRail(el, [
          { key: "you changed", value: plasmidControl + " replication control" },
          { key: "mechanism", value: result.controllerSees },
          { key: "observable", value: result.outcome },
        ]));
        parts.explanation.className = "callout";
        parts.explanation.innerHTML = "<strong>Incompatibility is shared feedback, not sequence similarity or entry exclusion.</strong> A controller that counts the combined pool cannot preserve each plasmid lineage, so partition noise eventually removes one.";
        return;
      }

      if (mode === "mapping") {
        const subTabs = el("div", { class: "lab-control-block compact-submode" }, [
          el("span", { class: "lab-control-label", text: "Mapping ruler" }),
          choiceRow(el, [
            { label: "Interrupted mating", value: "hfr" },
            { label: "Cotransduction", value: "cotransduction" },
          ], mapView, (value) => { mapView = value; render(); }, "Bacterial mapping ruler"),
        ]);
        if (mapView === "hfr") {
          const result = microbialGeneticsModel({ kind: "hfr", direction, time });
          parts.visual.innerHTML = hfrSvg(result, time);
          parts.controls.replaceChildren(subTabs,
            el("div", { class: "lab-control-block" }, [
              el("span", { class: "lab-control-label", text: "F integration orientation" }),
              choiceRow(el, [
                { label: "Forward", value: "forward" },
                { label: "Reverse", value: "reverse" },
              ], direction, (value) => { direction = value; render(); }, "Hfr transfer direction"),
            ]),
            rangeControl(el, "Blender interruption time", time, {
              min: 0, max: 106, step: 1, format: (value) => value + " min",
            }, (value) => { time = value; render(); }),
            el("div", { class: "readout" }, [
              stat(result.arrived.map((marker) => marker.name).join(" → ") || "none", "markers arrived"),
              stat(result.markers[0].name + " → " + result.markers[result.markers.length - 1].name, "entry order"),
              stat((result.markers[0].plateau * 100).toFixed(1) + "% → " + (result.markers[result.markers.length - 1].plateau * 100).toFixed(2) + "%", "transfer gradient"),
            ])
          );
          parts.rail.replaceChildren(causalRail(el, [
            { key: "you changed", value: direction + " transfer; blend at " + time + " min" },
            { key: "mechanism", value: "constant-rate one-way chromosome entry" },
            { key: "observable", value: result.arrived.map((marker) => marker.name).join(" → ") || "no marker yet" },
          ]));
          parts.explanation.className = "callout";
          parts.explanation.innerHTML = "<strong>Intervals are distance; the clock intercept is overhead.</strong> A six-minute pairing/initiation delay shifts every marker equally, so subtract entry times. Reversing F integration reverses the order around the circular chromosome.";
          return;
        }
        const result = microbialGeneticsModel({ kind: "cotransduction", distance, fragmentLength });
        parts.visual.innerHTML = cotransductionSvg(result, distance, fragmentLength);
        parts.controls.replaceChildren(subTabs,
          rangeControl(el, "Marker separation d", distance, {
            min: 0, max: 2.5, step: 0.05, format: (value) => value.toFixed(2) + " min",
          }, (value) => { distance = value; render(); }),
          rangeControl(el, "Headful length L", fragmentLength, {
            min: 1.5, max: 2.5, step: 0.1, format: (value) => value.toFixed(1) + " min",
          }, (value) => { fragmentLength = value; render(); }),
          el("div", { class: "readout" }, [
            stat(percent(result.c, 2), "cotransduction C"),
            stat(result.inferredDistance.toFixed(2) + " min", "inverted distance"),
            stat(result.saturated ? "C = 0 ceiling" : result.resolutionLimited ? "near-one floor" : "informative", "measurement regime"),
          ])
        );
        parts.rail.replaceChildren(causalRail(el, [
          { key: "you changed", value: "d/L to " + (distance / fragmentLength).toFixed(2) },
          { key: "mechanism", value: "span both markers + two crossover flanks" },
          { key: "observable", value: "C = " + percent(result.c, 2) },
        ]));
        parts.explanation.className = "callout";
        parts.explanation.innerHTML = "<strong>The cube has three geometric factors.</strong> One makes the fragment span both markers; two leave crossover room on the outer flanks. At C=0 every d≥L is indistinguishable, while values near one differ by less than sampling noise.";
        return;
      }

      const subTabs = el("div", { class: "lab-control-block compact-submode" }, [
        el("span", { class: "lab-control-label", text: "Phage question" }),
        choiceRow(el, [
          { label: "λ memory switch", value: "lambda" },
          { label: "Benzer's two tests", value: "benzer" },
        ], phageView, (value) => { phageView = value; render(); }, "Phage logic submode"),
      ]);
      if (phageView === "lambda") {
        const result = microbialGeneticsModel({ kind: "lambda", condition, genotype: phageGenotype });
        parts.visual.replaceChildren(lambdaBoard(el, result));
        parts.controls.replaceChildren(subTabs,
          el("div", { class: "lab-control-block" }, [
            el("span", { class: "lab-control-label", text: "Infection / host condition" }),
            choiceRow(el, [
              { label: "Low multiplicity", value: "lowMoi" },
              { label: "High multiplicity", value: "highMoi" },
              { label: "DNA damage · RecA*", value: "damage" },
            ], condition, (value) => { condition = value; render(); }, "Lambda condition"),
          ]),
          el("div", { class: "lab-control-block" }, [
            el("span", { class: "lab-control-label", text: "Phage genotype" }),
            choiceRow(el, [
              { label: "Wild type", value: "normal" },
              { label: "cI−", value: "cIminus" },
              { label: "cII−", value: "cIIminus" },
            ], phageGenotype, (value) => { phageGenotype = value; render(); }, "Lambda genotype"),
          ]),
          el("div", { class: "readout" }, [
            stat(result.state, "cell fate"),
            stat(result.plaque, "plaque phenotype"),
            stat(result.memory, "feedback explanation"),
          ])
        );
        parts.rail.replaceChildren(causalRail(el, [
          { key: "you changed", value: condition + " · " + phageGenotype },
          { key: "mechanism", value: result.memory },
          { key: "observable", value: result.state + " · " + result.plaque + " plaque" },
        ]));
        parts.explanation.className = "callout " + (result.state === "lysogeny" ? "callout-good" : "");
        parts.explanation.innerHTML = "<strong>Mutual repression chooses; positive cI feedback remembers.</strong> DNA damage activates RecA*, which stimulates cI self-cleavage and deliberately ejects λ from a failing host.";
        return;
      }

      const result = microbialGeneticsModel({ kind: "benzer", relationship, distanceBp, progeny });
      parts.visual.replaceChildren(benzerBoard(el, result, relationship, distanceBp, progeny));
      parts.controls.replaceChildren(subTabs,
        el("div", { class: "lab-control-block" }, [
          el("span", { class: "lab-control-label", text: "Mutant pair" }),
          choiceRow(el, [
            { label: "Same cistron", value: "sameCistron" },
            { label: "Different cistrons", value: "differentCistrons" },
          ], relationship, (value) => { relationship = value; render(); }, "Cistron relationship"),
        ]),
        rangeControl(el, "Distance between lesions", distanceBp, {
          min: relationship === "differentCistrons" ? 1 : 0,
          max: 10, step: 1, format: (value) => value + " bp",
        }, (value) => { distanceBp = value; render(); }),
        el("div", { class: "lab-control-block" }, [
          el("span", { class: "lab-control-label", text: "Selected phage progeny" }),
          choiceRow(el, [
            { label: "10⁴", value: 1e4 },
            { label: "10⁶", value: 1e6 },
            { label: "10⁸", value: 1e8 },
            { label: "10⁹", value: 1e9 },
          ], progeny, (value) => { progeny = value; render(); }, "Selected progeny"),
        ]),
        el("div", { class: "readout" }, [
          stat(result.complements ? "yes" : "no", "complement in one cell"),
          stat(result.recombines ? "yes" : "no", "different positions"),
          stat("~" + result.detectionFloor.toExponential(1), "effective selected floor"),
          stat(result.selectionGainOrders.toFixed(0), "orders beyond a 10⁴-organism cross"),
          stat("~" + result.mapResolutionBp.toFixed(1) + " bp", "reliable map resolution"),
        ])
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "you changed", value: relationship.replace(/([A-Z])/g, " $1") + " · " + result.effectiveDistanceBp + " bp" },
        { key: "mechanism", value: "complementation tests function; selection exposes rare positional exchange" },
        { key: "observable", value: (result.complements ? "function rescued" : "not rescued") + " · " + (result.recombines ? "positions separable" : "same site") },
      ]));
      parts.explanation.className = "callout";
      parts.explanation.innerHTML = "<strong>One pair can fail to complement and still recombine.</strong> The cistron is a unit of function; the recon is a unit of position. One plaque among N progeny is the raw counting floor, but the chapter's effective selected floor is about 10⁻⁸ and its independently derived reliable map resolution is about two base pairs—not a universal per-base recombination rate.";
    }

    predict(body, {
      widget: "microbial-genetics-lab",
      question: "Two markers are separated by half of a P1 headful. Under C = (1 − d/L)³, what cotransduction frequency should you expect?",
      hint: "Cube the fraction of the headful that remains after spanning the separation.",
      options: [
        { label: "50%" },
        { label: "25%" },
        { label: "12.5%", correct: true },
        { label: "0%" },
      ],
    }, () => {
      mode = "mapping";
      mapView = "cotransduction";
      distance = 1;
      fragmentLength = 2;
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
