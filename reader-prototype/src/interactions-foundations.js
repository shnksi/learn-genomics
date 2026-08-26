/* ── Foundations interaction wave ──────────────────────────────────────────
   Topic-specific Hero Labs for Ch 01–03, 05–08 and Statistics S1–S2.
   Models are pure and exported for fixture tests; views use the shared reader
   authoring kit and require no network, package loader, canvas, or build step.
   ───────────────────────────────────────────────────────────────────────── */

(function (global) {
  "use strict";

  const definitions = {};
  const models = {};
  const kit = global.ReaderInteractionKit;
  if (!kit) throw new Error("ReaderInteractionKit must load before foundations labs");

  const { svgNode, choiceRow, tabs, causalRail, fieldWithRange } = kit;

  function define(id, build) {
    if (definitions[id]) throw new Error("Duplicate interaction: " + id);
    definitions[id] = build;
  }

  function clamp(value, low, high) {
    return Math.max(low, Math.min(high, value));
  }

  function wrapWords(text, maximumCharacters) {
    const lines = [];
    let current = "";
    text.split(/\s+/).forEach((word) => {
      const candidate = current ? current + " " + word : word;
      if (current && candidate.length > maximumCharacters) {
        lines.push(current);
        current = word;
      } else {
        current = candidate;
      }
    });
    if (current) lines.push(current);
    return lines;
  }

  function formatNumber(value, digits) {
    return Number(value).toLocaleString("en-GB", {
      maximumFractionDigits: digits == null ? 1 : digits,
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

  function labParts(el) {
    return {
      instrument: el("div", { class: "hero-lab foundations-lab", hidden: true }),
      tabHost: el("div"),
      visual: el("div", { class: "lab-visual foundation-visual" }),
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

  function textSvg(html, label, viewBox) {
    return '<svg class="lab-diagram foundation-diagram" viewBox="' +
      (viewBox || "0 0 500 240") + '" role="img" aria-label="' + label + '">' +
      html + "</svg>";
  }

  function lcg(seed) {
    let state = seed >>> 0;
    return function () {
      state = (Math.imul(1664525, state) + 1013904223) >>> 0;
      return state / 4294967296;
    };
  }

  function binomialDraw(n, p, random) {
    let total = 0;
    for (let i = 0; i < n; i++) if (random() < p) total += 1;
    return total;
  }

  function choose(n, k) {
    if (k < 0 || k > n) return 0;
    let result = 1;
    const short = Math.min(k, n - k);
    for (let i = 1; i <= short; i++) result *= (n - short + i) / i;
    return result;
  }

  function factorial(n) {
    let result = 1;
    for (let i = 2; i <= n; i++) result *= i;
    return result;
  }

  /* Ch 01 — stochastic binding, expression noise, and catalysis ------------ */

  function molecularForcesModel(input) {
    if (input.kind === "binding") {
      const occupancy = input.concentrationNm /
        (input.concentrationNm + input.kdNm);
      return {
        occupancy,
        boundSites: Math.round(input.sites * occupancy),
        dwellRatio: input.kdNm === 0 ? Infinity : input.concentrationNm / input.kdNm,
      };
    }
    if (input.kind === "enzyme") {
      const rt = 0.001987 * (input.temperatureC + 273.15);
      const loweredBy = input.enzyme ? input.loweredByKcal : 0;
      return {
        barrierKcal: input.barrierKcal - loweredBy,
        speedup: Math.exp(loweredBy / rt),
        deltaG: input.deltaGKcal,
        equilibriumRatio: Math.exp(-input.deltaGKcal / rt),
      };
    }
    if (input.kind === "bursts") {
      const random = lcg(input.seed);
      const counts = [];
      for (let cell = 0; cell < input.cells; cell++) {
        let on = random() < input.onFraction;
        let molecules = 0;
        for (let step = 0; step < input.steps; step++) {
          if (on && random() < input.offRate) on = false;
          else if (!on && random() < input.onRate) on = true;
          if (on) molecules += input.production;
          molecules *= 1 - input.decay;
        }
        counts.push(Math.round(molecules));
      }
      const mean = counts.reduce((sum, count) => sum + count, 0) / counts.length;
      const variance = counts.reduce((sum, count) => sum + (count - mean) ** 2, 0) /
        counts.length;
      return { counts, mean, variance };
    }
    throw new Error("Unknown molecular-forces model");
  }
  models.molecularForces = molecularForcesModel;

  /* Ch 02 — pairing, nearest-neighbour stacking, and topology -------------- */

  const BASE_CLASS = { A: "purine", G: "purine", C: "pyrimidine", T: "pyrimidine" };
  const COMPLEMENT = { A: "T", T: "A", G: "C", C: "G" };
  const STACK_DG37 = {
    AA: 1.00, TT: 1.00, AT: 0.88, TA: 0.58,
    CA: 1.45, TG: 1.45, GT: 1.44, AC: 1.44,
    CT: 1.28, AG: 1.28, GA: 1.30, TC: 1.30,
    CG: 2.17, GC: 2.24, GG: 1.84, CC: 1.84,
  };

  function dnaGeometryModel(input) {
    if (input.kind === "pair") {
      const pair = input.left + input.right;
      const canonical = COMPLEMENT[input.left] === input.right;
      return {
        canonical,
        bonds: pair === "AT" || pair === "TA" ? 2 :
          pair === "GC" || pair === "CG" ? 3 : 0,
        width: BASE_CLASS[input.left] === BASE_CLASS[input.right]
          ? (BASE_CLASS[input.left] === "purine" ? "too wide" : "too narrow")
          : "constant width",
      };
    }
    if (input.kind === "stacking") {
      const seq = input.sequence.toUpperCase().replace(/[^ACGT]/g, "");
      let strength = 0;
      for (let i = 0; i + 1 < seq.length; i++) strength += STACK_DG37[seq.slice(i, i + 2)];
      const gc = [...seq].filter((base) => base === "G" || base === "C").length;
      return { sequence: seq, gcFraction: gc / seq.length, stackingStrength: strength };
    }
    if (input.kind === "topology") {
      const baseline = input.baselineTwist;
      if (input.endsLocked) {
        const twist = baseline - input.turnsUnwound;
        const writhe = input.turnsUnwound;
        return { linking: baseline, twist, writhe, stressStored: true };
      }
      return {
        linking: baseline - input.turnsUnwound,
        twist: baseline - input.turnsUnwound,
        writhe: 0,
        stressStored: false,
      };
    }
    throw new Error("Unknown DNA-geometry model");
  }
  models.dnaGeometry = dnaGeometryModel;

  /* Ch 03 — packaging arithmetic, repeats, and mtDNA bottlenecks ----------- */

  function binomialProbability(n, k, p) {
    return choose(n, k) * (p ** k) * ((1 - p) ** (n - k));
  }

  function genomeScaleModel(input) {
    if (input.kind === "packaging") {
      const bp = input.genomeGb * 1e9;
      return {
        bp,
        contourMetres: bp * 0.34e-9,
        nucleosomes: bp / input.repeatLengthBp,
        wrappedFraction: 147 / input.repeatLengthBp,
      };
    }
    if (input.kind === "heteroplasmy") {
      const p = input.loadPercent / 100;
      const thresholdCopies = Math.ceil((input.thresholdPercent / 100) * input.bottleneck);
      let aboveThreshold = 0;
      for (let k = thresholdCopies; k <= input.bottleneck; k++) {
        aboveThreshold += binomialProbability(input.bottleneck, k, p);
      }
      const random = lcg(input.seed);
      const oocytes = Array.from({ length: input.samples }, () =>
        (100 * binomialDraw(input.bottleneck, p, random)) / input.bottleneck
      );
      return { aboveThreshold, oocytes, thresholdCopies };
    }
    if (input.kind === "repeat") {
      return input.arrangement === "interspersed"
        ? { brokenTool: "short-read alignment", signature: "many equally plausible origins" }
        : { brokenTool: "short-read assembly", signature: "a repeat cycle longer than the read" };
    }
    throw new Error("Unknown genome-scale model");
  }
  models.genomeScale = genomeScaleModel;

  /* Ch 05 — strand reading, CTD state, enhancer contact, and timing -------- */

  function reverseComplement(sequence) {
    return sequence.toUpperCase().split("").reverse().map((base) => COMPLEMENT[base] || "N").join("");
  }

  function transcriptionModel(input) {
    if (input.kind === "strand") {
      const top = input.top5to3.toUpperCase().replace(/[^ACGT]/g, "");
      const coding = input.direction === "right" ? top : reverseComplement(top);
      return {
        coding5to3: coding,
        template3to5: coding.split("").map((base) => COMPLEMENT[base]).join(""),
        rna5to3: coding.replace(/T/g, "U"),
      };
    }
    if (input.kind === "ctd") {
      const states = {
        initiation: { ser5: "high", ser2: "low", recruits: "5′ capping enzymes" },
        elongation: { ser5: "falling", ser2: "high", recruits: "splicing and 3′-end factors" },
        recycle: { ser5: "off", ser2: "off", recruits: "a new pre-initiation complex" },
      };
      return states[input.stage];
    }
    if (input.kind === "timing") {
      return {
        elongationMinutes: input.lengthKb / input.speedKbMin,
        totalMinutes: input.pauseMinutes + input.lengthKb / input.speedKbMin,
      };
    }
    if (input.kind === "enhancer") {
      return input.boundaryIntact
        ? { target: "gene B", nearest: "gene A", constrained: true }
        : { target: "gene A", nearest: "gene A", constrained: false };
    }
    throw new Error("Unknown transcription model");
  }
  models.transcription = transcriptionModel;

  /* Ch 06 — exon definition, splice choice, and NMD ----------------------- */

  function rnaProcessingModel(input) {
    if (input.kind === "donor") {
      if (input.donorIntact) return { product: "exons 1–2–3", consequence: "normal splicing" };
      return input.organism === "human"
        ? { product: "exons 1 + 3", consequence: "exon 2 skipped" }
        : { product: "exon 1–intron–exon 2", consequence: "intron retained" };
    }
    if (input.kind === "choice") {
      const score = input.sr - input.hnrnp + (input.slowPolymerase ? 0.7 : -0.2);
      const psi = 1 / (1 + Math.exp(-score));
      return { psi, score };
    }
    if (input.kind === "nmd") {
      const distance = input.lastJunctionNt - input.stopNt;
      const triggered = !input.stopInLastExon && distance > 55;
      return {
        distance,
        triggered,
        outcome: triggered ? "transcript degraded by NMD" : "truncated protein can be made",
      };
    }
    throw new Error("Unknown RNA-processing model");
  }
  models.rnaProcessing = rnaProcessingModel;

  /* Ch 07 — six-frame translation and code reassignment ------------------- */

  const CODON_AA = {};
  (function buildCodonTable() {
    const bases = "TCAG";
    const amino = "FFLLSSSSYY**CC*WLLLLPPPPHHQQRRRRIIIMTTTTNNKKSSRRVVVVAAAADDEEGGGG";
    let index = 0;
    for (const first of bases) for (const second of bases) for (const third of bases) {
      CODON_AA[first + second + third] = amino[index++];
    }
  })();

  const AA_NAME = {
    A: "Ala", R: "Arg", N: "Asn", D: "Asp", C: "Cys", E: "Glu", Q: "Gln",
    G: "Gly", H: "His", I: "Ile", L: "Leu", K: "Lys", M: "Met", F: "Phe",
    P: "Pro", S: "Ser", T: "Thr", W: "Trp", Y: "Tyr", V: "Val", "*": "Stop",
  };

  function codonMeaning(codon, code) {
    if (code === "mitochondrial") {
      if (codon === "ATA") return "M";
      if (codon === "TGA") return "W";
      if (codon === "AGA" || codon === "AGG") return "*";
    }
    return CODON_AA[codon] || "?";
  }

  function translateFrame(sequence, offset, code) {
    const codons = [];
    for (let i = offset; i + 2 < sequence.length; i += 3) {
      const codon = sequence.slice(i, i + 3);
      codons.push({ codon, aa: codonMeaning(codon, code), start: i });
    }
    return codons;
  }

  function translationModel(input) {
    if (input.kind === "frames") {
      const forward = input.sequence.toUpperCase().replace(/[^ACGT]/g, "");
      const reverse = reverseComplement(forward);
      return {
        forward: [0, 1, 2].map((offset) => translateFrame(forward, offset, input.code)),
        reverse: [0, 1, 2].map((offset) => translateFrame(reverse, offset, input.code)),
        reverseComplement: reverse,
      };
    }
    if (input.kind === "mutation") {
      const before = translateFrame(input.sequence, input.frame, input.code);
      let mutated = input.sequence;
      if (input.mutation === "insertion") {
        mutated = input.sequence.slice(0, input.position) + "A" + input.sequence.slice(input.position);
      } else {
        mutated = input.sequence.slice(0, input.position) + input.alt + input.sequence.slice(input.position + 1);
      }
      const after = translateFrame(mutated, input.frame, input.code);
      if (input.mutation === "insertion") return { before, after, mutated, effect: "frameshift" };
      const codonIndex = Math.floor((input.position - input.frame) / 3);
      const beforeAa = before[codonIndex] && before[codonIndex].aa;
      const afterAa = after[codonIndex] && after[codonIndex].aa;
      const effect = beforeAa === afterAa ? "synonymous" : afterAa === "*" ? "nonsense" : "missense";
      return { before, after, mutated, effect };
    }
    throw new Error("Unknown translation model");
  }
  models.translation = translationModel;

  /* Ch 08 — folding context, turnover, and dominant-negative poisoning ----- */

  function proteinFateModel(input) {
    if (input.kind === "substitution") {
      let severity = "context dependent";
      let mechanism = "surface chemistry changes";
      if (input.site === "core" && input.to !== "hydrophobic") {
        severity = "high";
        mechanism = "a polar or charged side chain is buried in the hydrophobic core";
      } else if (input.to === "proline" && input.site === "helix") {
        severity = "high";
        mechanism = "proline breaks the backbone hydrogen-bond geometry of the helix";
      } else if (input.site === "surface" && input.to === "hydrophobic") {
        severity = "moderate";
        mechanism = "an exposed hydrophobic patch promotes aggregation";
      }
      return { severity, mechanism };
    }
    if (input.kind === "turnover") {
      const decay = Math.log(2) / input.halfLifeHours;
      const steady = input.synthesisPerHour / decay;
      const amount = steady * (1 - Math.exp(-decay * input.hours));
      return { decay, steady, amount };
    }
    if (input.kind === "dominantNegative") {
      const wildTypeFraction = 1 - input.mutantFraction;
      return {
        functionalComplexFraction: wildTypeFraction ** input.subunits,
        deletionOutputFraction: wildTypeFraction,
      };
    }
    throw new Error("Unknown protein-fate model");
  }
  models.proteinFate = proteinFateModel;

  /* S1 — explicit sample spaces and Bayes tables -------------------------- */

  function probabilityModel(input) {
    if (input.kind === "cross") {
      const gametes = { AA: ["A"], Aa: ["A", "a"], aa: ["a"] };
      const left = gametes[input.parent1];
      const right = gametes[input.parent2];
      const outcomes = [];
      left.forEach((a) => right.forEach((b) => {
        const genotype = [a, b].sort((x, y) => x === y ? 0 : x === "A" ? -1 : 1).join("");
        outcomes.push(genotype);
      }));
      const counts = { AA: 0, Aa: 0, aa: 0 };
      outcomes.forEach((outcome) => { counts[outcome] += 1; });
      return {
        outcomes,
        probabilities: Object.fromEntries(Object.entries(counts).map(([key, count]) =>
          [key, count / outcomes.length]
        )),
      };
    }
    if (input.kind === "bayesTest") {
      const affected = input.population * input.prevalence;
      const unaffected = input.population - affected;
      const truePositive = affected * input.sensitivity;
      const falsePositive = unaffected * (1 - input.specificity);
      return {
        truePositive,
        falsePositive,
        positivePredictiveValue: truePositive / (truePositive + falsePositive),
      };
    }
    if (input.kind === "conditionalCarrier") {
      return { prior: 0.5, posteriorGivenUnaffected: 2 / 3 };
    }
    if (input.kind === "simulate") {
      const random = lcg(input.seed);
      const successes = Array.from({ length: input.families }, () =>
        binomialDraw(input.children, input.p, random)
      );
      return { successes };
    }
    throw new Error("Unknown probability model");
  }
  models.probability = probabilityModel;

  /* S2 — distributions as generating processes --------------------------- */

  function logGamma(z) {
    const coefficients = [
      676.5203681218851, -1259.1392167224028, 771.32342877765313,
      -176.61502916214059, 12.507343278686905, -0.13857109526572012,
      9.9843695780195716e-6, 1.5056327351493116e-7,
    ];
    if (z < 0.5) return Math.log(Math.PI) - Math.log(Math.sin(Math.PI * z)) - logGamma(1 - z);
    let x = 0.99999999999980993;
    const shifted = z - 1;
    coefficients.forEach((coefficient, index) => { x += coefficient / (shifted + index + 1); });
    const t = shifted + coefficients.length - 0.5;
    return 0.5 * Math.log(2 * Math.PI) + (shifted + 0.5) * Math.log(t) - t + Math.log(x);
  }

  function distributionModel(input) {
    if (input.kind === "binomial") {
      const points = [];
      for (let k = 0; k <= input.n; k++) {
        points.push({ x: k, p: choose(input.n, k) * input.p ** k * (1 - input.p) ** (input.n - k) });
      }
      return { points, mean: input.n * input.p, variance: input.n * input.p * (1 - input.p) };
    }
    if (input.kind === "poisson") {
      const maximum = Math.max(12, Math.ceil(input.lambda + 5 * Math.sqrt(input.lambda)));
      const points = [];
      for (let k = 0; k <= maximum; k++) {
        points.push({ x: k, p: Math.exp(-input.lambda) * input.lambda ** k / factorial(k) });
      }
      return { points, mean: input.lambda, variance: input.lambda, zero: Math.exp(-input.lambda) };
    }
    if (input.kind === "negativeBinomial") {
      const mean = input.mean;
      const size = input.dispersion;
      const success = size / (size + mean);
      const maximum = Math.max(20, Math.ceil(mean + 6 * Math.sqrt(mean + mean ** 2 / size)));
      const points = [];
      for (let k = 0; k <= maximum; k++) {
        const logP = logGamma(k + size) - logGamma(size) - logGamma(k + 1) +
          size * Math.log(success) + k * Math.log(1 - success);
        points.push({ x: k, p: Math.exp(logP) });
      }
      return { points, mean, variance: mean + mean ** 2 / size };
    }
    if (input.kind === "normal") {
      const points = [];
      for (let step = -40; step <= 40; step++) {
        const x = input.mean + (step / 10) * input.sd;
        const z = (x - input.mean) / input.sd;
        points.push({ x, p: Math.exp(-0.5 * z * z) / (input.sd * Math.sqrt(2 * Math.PI)) });
      }
      return { points, mean: input.mean, variance: input.sd ** 2 };
    }
    throw new Error("Unknown distribution model");
  }
  models.distribution = distributionModel;

  /* Ch 01 — Molecular Forces Playground view ------------------------------ */

  function bindingFieldSvg(model, concentration, kd) {
    const sites = Array.from({ length: 12 }, (_, index) => {
      const x = 42 + (index % 6) * 82;
      const y = 75 + Math.floor(index / 6) * 105;
      const bound = index < Math.round(model.occupancy * 12);
      return '<g class="binding-site' + (bound ? " is-bound" : "") + '">' +
        '<path d="M' + (x - 20) + " " + y + " Q" + x + " " + (y - 18) + " " +
          (x + 20) + " " + y + '"/>' +
        (bound ? '<circle cx="' + x + '" cy="' + (y - 13) + '" r="10"/>' : "") +
      "</g>";
    }).join("");
    return textSvg(
      '<text class="lab-svg-kicker" x="18" y="22">random collisions → reversible binding</text>' +
      sites +
      '<text class="lab-svg-label" x="18" y="224">' + concentration +
        " nM ligand · Kd " + kd + " nM · " + (model.occupancy * 100).toFixed(1) +
        "% occupied</text>",
      "Twelve molecular binding sites. " + Math.round(model.occupancy * 12) +
        " are occupied at equilibrium; occupancy is concentration divided by concentration plus Kd.",
      "0 0 540 245"
    );
  }

  function svgLines(className, x, y, lines, step, anchor) {
    const alignment = anchor ? ' text-anchor="' + anchor + '"' : "";
    const lineStep = Math.max(step || 16, 22);
    return '<text class="' + className + '"' + alignment + ">" +
      lines.map((line, index) => '<tspan x="' + x + '" y="' +
        (y + index * lineStep) + '">' + line + "</tspan>").join("") +
      "</text>";
  }

  function burstFieldSvg(model) {
    const max = Math.max(1, ...model.counts);
    const cells = model.counts.map((count, index) => {
      const col = index % 8;
      const row = Math.floor(index / 8);
      const x = 45 + col * 61;
      const y = 63 + row * 61;
      const radius = 13 + (count / max) * 13;
      return '<g><circle class="expression-cell" cx="' + x + '" cy="' + y +
        '" r="24"/><circle class="expression-signal" cx="' + x + '" cy="' + y +
        '" r="' + radius.toFixed(1) + '"/><text class="cell-count" x="' + x +
        '" y="' + (y + 4) + '" text-anchor="middle">' + count + "</text></g>";
    }).join("");
    return textSvg(
      '<text class="lab-svg-kicker" x="18" y="22">24 genetically identical cells</text>' +
      cells +
      '<text class="lab-svg-label" x="18" y="242">bulk mean ' + model.mean.toFixed(1) +
        " molecules · single-cell range " + Math.min(...model.counts) + "–" +
        Math.max(...model.counts) + "</text>",
      "Twenty-four identical cells with different molecule counts generated by stochastic promoter bursts.",
      "0 0 540 260"
    );
  }

  function energyBarrierSvg(model, enzyme) {
    const peak = enzyme ? 86 : 42;
    const original = enzyme
      ? '<path class="energy-reference" d="M45 180 C125 180 160 42 250 42 C340 42 375 205 470 205"/>'
      : "";
    return textSvg(
      '<text class="lab-svg-kicker" x="18" y="22">free-energy landscape</text>' +
      '<path class="lab-axis" d="M42 218 L476 218 M42 30 L42 218"/>' +
      original +
      '<path class="energy-curve" d="M45 180 C125 180 160 ' + peak + " 250 " + peak +
        " C340 " + peak + ' 375 205 470 205"/>' +
      '<line class="energy-barrier" x1="250" y1="180" x2="250" y2="' + peak + '"/>' +
      '<text class="lab-svg-label" x="54" y="172">reactants</text>' +
      '<text class="lab-svg-label" x="402" y="198">products</text>' +
      '<text class="lab-svg-label" x="262" y="' + (peak + 18) + '">activation barrier</text>' +
      '<text class="lab-svg-label" x="180" y="232">reaction progress</text>',
      (enzyme ? "Enzyme present. " : "No enzyme. ") +
        "The activation barrier is " + model.barrierKcal.toFixed(1) +
        " kilocalories per mole while reactant and product energies are unchanged."
    );
  }

  define("molecular-forces-lab", function (api) {
    const { body, el, stat, predict } = api;
    const parts = labParts(el);
    let mode = "energy";
    let concentration = 20;
    let kd = 20;
    let enzyme = false;
    let temperature = 37;
    let burstiness = 0.18;

    function render() {
      parts.tabHost.replaceChildren(tabs(el, [
        { label: "Binding", value: "binding" },
        { label: "Single cells", value: "bursts" },
        { label: "Energy barrier", value: "energy" },
      ], mode, (next) => { mode = next; render(); }));

      if (mode === "binding") {
        const result = molecularForcesModel({
          kind: "binding", concentrationNm: concentration, kdNm: kd, sites: 100,
        });
        parts.visual.innerHTML = bindingFieldSvg(result, concentration, kd);
        parts.controls.replaceChildren(
          rangeControl(el, "Free ligand concentration", concentration, {
            min: 1, max: 100, step: 1, format: (value) => value + " nM",
          }, (value) => { concentration = value; render(); }),
          rangeControl(el, "Dissociation constant Kd", kd, {
            min: 1, max: 100, step: 1, format: (value) => value + " nM",
          }, (value) => { kd = value; render(); }),
          el("div", { class: "readout" }, [
            stat((result.occupancy * 100).toFixed(1) + "%", "sites occupied"),
            stat(result.boundSites + " / 100", "expected bound sites"),
          ])
        );
        parts.rail.replaceChildren(causalRail(el, [
          { key: "you changed", value: concentration + " nM ligand versus Kd " + kd + " nM" },
          { key: "mechanism", value: "collisions bind; thermal motion releases" },
          { key: "observable", value: (result.occupancy * 100).toFixed(1) + "% occupancy" },
        ]));
        parts.explanation.className = "callout";
        parts.explanation.innerHTML = "<strong>No molecule is called by name.</strong> " +
          "Concentration controls how often partners collide; Kd packages how long the right " +
          "partner tends to remain bound. At concentration = Kd, half the sites are occupied.";
        return;
      }

      if (mode === "bursts") {
        const result = molecularForcesModel({
          kind: "bursts", seed: 1701, cells: 24, steps: 70,
          onFraction: 0.15, onRate: 0.08, offRate: burstiness,
          production: 4, decay: 0.08,
        });
        parts.visual.innerHTML = burstFieldSvg(result);
        parts.controls.replaceChildren(
          rangeControl(el, "Promoter switch-off probability", burstiness, {
            min: 0.04, max: 0.4, step: 0.01,
            format: (value) => value.toFixed(2) + " / step",
          }, (value) => { burstiness = value; render(); }),
          el("div", { class: "readout" }, [
            stat(result.mean.toFixed(1), "bulk mean"),
            stat(result.variance.toFixed(1), "cell-to-cell variance"),
          ])
        );
        parts.rail.replaceChildren(causalRail(el, [
          { key: "you changed", value: "how long promoter bursts persist" },
          { key: "mechanism", value: "random on/off intervals create pulses" },
          { key: "observable", value: "one bulk mean hides 24 cell states" },
        ]));
        parts.explanation.className = "callout";
        parts.explanation.innerHTML = "<strong>Same genome, same environment, different instant.</strong> " +
          "Bulk expression is a time-and-cell average. The fixed seed holds every other random " +
          "event constant while you change burst duration.";
        return;
      }

      const result = molecularForcesModel({
        kind: "enzyme", temperatureC: temperature, barrierKcal: 18,
        loweredByKcal: 6, deltaGKcal: -3, enzyme,
      });
      parts.visual.innerHTML = energyBarrierSvg(result, enzyme);
      parts.controls.replaceChildren(
        el("div", { class: "lab-control-block" }, [
          el("span", { class: "lab-control-label", text: "Catalyst" }),
          choiceRow(el, [
            { label: "No enzyme", value: false },
            { label: "Enzyme present", value: true },
          ], enzyme, (value) => { enzyme = value; render(); }, "Catalyst state"),
        ]),
        rangeControl(el, "Temperature", temperature, {
          min: 20, max: 42, step: 1, format: (value) => value + " °C",
        }, (value) => { temperature = value; render(); }),
        el("div", { class: "readout" }, [
          stat(result.barrierKcal.toFixed(1) + " kcal/mol", "activation barrier"),
          stat(result.deltaG.toFixed(1) + " kcal/mol", "reaction ΔG"),
          stat(enzyme ? formatNumber(result.speedup, 0) + "×" : "1×", "relative rate"),
        ])
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "you changed", value: enzyme ? "added an enzyme" : "removed the enzyme" },
        { key: "mechanism", value: "activation barrier " + (enzyme ? "falls" : "returns") },
        { key: "observable", value: "rate changes; equilibrium does not" },
      ]));
      parts.explanation.className = "callout " + (enzyme ? "callout-good" : "");
      parts.explanation.innerHTML = "<strong>The endpoints do not move.</strong> A catalyst " +
        "provides a lower-barrier path in both directions. It changes how quickly equilibrium " +
        "is reached, never which side equilibrium favours.";
    }

    predict(body, {
      widget: "molecular-forces-lab",
      question: "An enzyme is added to a reversible reaction already at equilibrium. What changes?",
      hint: "Separate the height of the route from the energies of its endpoints.",
      options: [
        { label: "The reaction runs faster in both directions", correct: true },
        { label: "More product is favoured at equilibrium" },
        { label: "The reaction's ΔG becomes more negative" },
        { label: "Only the forward reaction accelerates" },
      ],
    }, () => {
      parts.instrument.hidden = false;
      render();
    });
    finishLab(parts, body);
  });

  /* Ch 02 — DNA Geometry and Topology Bench view -------------------------- */

  function pairGeometrySvg(left, right, model) {
    const leftClass = BASE_CLASS[left];
    const rightClass = BASE_CLASS[right];
    const leftRadius = leftClass === "purine" ? 54 : 42;
    const rightRadius = rightClass === "purine" ? 54 : 42;
    const bondLines = Array.from({ length: Math.max(1, model.bonds) }, (_, index) => {
      const y = 105 + (index - (Math.max(1, model.bonds) - 1) / 2) * 18;
      return '<line class="pair-bond' + (model.canonical ? "" : " is-mismatch") +
        '" x1="235" y1="' + y + '" x2="305" y2="' + y + '"/>';
    }).join("");
    return textSvg(
      '<text class="lab-svg-kicker" x="18" y="22">pairing is a geometry constraint</text>' +
      '<ellipse class="base-shape base-left" cx="175" cy="115" rx="' + leftRadius +
        '" ry="58"/><ellipse class="base-shape base-right" cx="365" cy="115" rx="' +
        rightRadius + '" ry="58"/>' + bondLines +
      '<text class="base-letter" x="175" y="126" text-anchor="middle">' + left + "</text>" +
      '<text class="base-letter" x="365" y="126" text-anchor="middle">' + right + "</text>" +
      '<text class="lab-svg-label" x="18" y="215">' + model.width + " · " +
        (model.canonical ? model.bonds + " hydrogen bonds" : "donor/acceptor pattern fails") +
        "</text>",
      left + " paired with " + right + ". " + (model.canonical
        ? "This is a canonical constant-width pair with " + model.bonds + " hydrogen bonds."
        : "This mismatch has " + model.width + " geometry and does not satisfy canonical hydrogen bonding."),
      "0 0 540 235"
    );
  }

  function stackingSvg(sequence, result, comparison) {
    const bases = [...sequence].map((base, index) => {
      const x = 44 + index * 39;
      return '<rect class="stack-base base-' + base + '" x="' + x + '" y="76" width="33" height="70" rx="5"/>' +
        '<text class="stack-letter" x="' + (x + 16.5) + '" y="118" text-anchor="middle">' + base + "</text>";
    }).join("");
    return textSvg(
      '<text class="lab-svg-kicker" x="18" y="22">same composition ≠ same neighbour stack</text>' +
      bases +
      '<text class="lab-svg-label" x="18" y="180">GC ' +
        (result.gcFraction * 100).toFixed(0) + "% · relative stacking strength " +
        result.stackingStrength.toFixed(2) + " kcal/mol</text>" +
      '<text class="lab-svg-label" x="18" y="207">paired fixture: ' + comparison.sequence +
        " · " + comparison.stackingStrength.toFixed(2) + " kcal/mol</text>",
      "A duplex sequence with " + (result.gcFraction * 100).toFixed(0) +
        " percent GC and relative nearest-neighbour stacking strength " +
        result.stackingStrength.toFixed(2) + " kilocalories per mole.",
      "0 0 540 225"
    );
  }

  function topologySvg(model, turns, locked) {
    const coils = Array.from({ length: Math.max(1, Math.abs(turns)) }, (_, index) => {
      const x = 150 + index * (210 / Math.max(1, Math.abs(turns) - 1));
      return '<path class="writhe-coil" d="M' + x + ' 126 c-22 -35 -22 35 0 0 c22 -35 22 35 0 0"/>';
    }).join("");
    return textSvg(
      '<text class="lab-svg-kicker" x="18" y="22">Lk = Tw + Wr</text>' +
      '<path class="dna-domain" d="M65 126 C130 55 190 195 255 126 C320 55 380 195 455 126"/>' +
      (locked ? coils : '<path class="released-end" d="M455 126 l35 -24 m-35 24 l35 24"/>') +
      '<circle class="domain-clamp' + (locked ? " is-locked" : "") + '" cx="65" cy="126" r="16"/>' +
      '<circle class="domain-clamp' + (locked ? " is-locked" : "") + '" cx="455" cy="126" r="16"/>' +
      '<text class="lab-svg-label" x="18" y="205">Lk ' + model.linking.toFixed(1) +
        " = Tw " + model.twist.toFixed(1) + " + Wr " + model.writhe.toFixed(1) + "</text>",
      "DNA topological domain. Linking number " + model.linking.toFixed(1) +
        " equals twist " + model.twist.toFixed(1) + " plus writhe " + model.writhe.toFixed(1) +
        (locked ? ". Both ends are constrained." : ". An open end permits rotation."),
      "0 0 540 225"
    );
  }

  define("dna-geometry-lab", function (api) {
    const { body, el, stat, predict } = api;
    const parts = labParts(el);
    let mode = "topology";
    let left = "A";
    let right = "T";
    let sequenceIndex = 0;
    let turns = 3;
    let locked = true;
    const stackFixtures = ["GCGCGCAAATTT", "GGGCCCAAATTT"];

    function render() {
      parts.tabHost.replaceChildren(tabs(el, [
        { label: "Base geometry", value: "pair" },
        { label: "Stacking", value: "stack" },
        { label: "Topology", value: "topology" },
      ], mode, (next) => { mode = next; render(); }));

      if (mode === "pair") {
        const result = dnaGeometryModel({ kind: "pair", left, right });
        parts.visual.innerHTML = pairGeometrySvg(left, right, result);
        parts.controls.replaceChildren(
          el("div", { class: "paired-controls" }, [
            el("div", { class: "lab-control-block" }, [
              el("span", { class: "lab-control-label", text: "Left base" }),
              choiceRow(el, ["A", "C", "G", "T"].map((base) => ({ label: base, value: base })),
                left, (value) => { left = value; render(); }, "Left base"),
            ]),
            el("div", { class: "lab-control-block" }, [
              el("span", { class: "lab-control-label", text: "Right base" }),
              choiceRow(el, ["A", "C", "G", "T"].map((base) => ({ label: base, value: base })),
                right, (value) => { right = value; render(); }, "Right base"),
            ]),
          ]),
          el("div", { class: "readout" }, [
            stat(result.canonical ? "canonical" : "mismatch", "pair status"),
            stat(result.width, "helix width"),
          ])
        );
        parts.rail.replaceChildren(causalRail(el, [
          { key: "you changed", value: left + " opposite " + right },
          { key: "constraint", value: "one large + one small base keeps width fixed" },
          { key: "observable", value: result.canonical ? result.bonds + " aligned bonds" : result.width },
        ]));
        parts.explanation.className = "callout" + (result.canonical ? " callout-good" : " callout-bad");
        parts.explanation.innerHTML = result.canonical
          ? "<strong>Geometry and chemistry both fit.</strong> Purine–pyrimidine pairing keeps the backbone separation constant; the donor and acceptor pattern selects A·T or G·C."
          : "<strong>Size alone is insufficient.</strong> Some mismatches combine one purine and one pyrimidine yet still put hydrogen-bond donors opposite donors or acceptors opposite acceptors.";
        return;
      }

      if (mode === "stack") {
        const selected = dnaGeometryModel({ kind: "stacking", sequence: stackFixtures[sequenceIndex] });
        const other = dnaGeometryModel({ kind: "stacking", sequence: stackFixtures[1 - sequenceIndex] });
        parts.visual.innerHTML = stackingSvg(stackFixtures[sequenceIndex], selected, other);
        parts.controls.replaceChildren(
          el("div", { class: "lab-control-block" }, [
            el("span", { class: "lab-control-label", text: "Same-length, same-GC duplex" }),
            choiceRow(el, stackFixtures.map((sequence, index) => ({ label: sequence, value: index })),
              sequenceIndex, (value) => { sequenceIndex = value; render(); }, "Duplex sequence"),
          ]),
          el("div", { class: "readout" }, [
            stat((selected.gcFraction * 100).toFixed(0) + "%", "GC content"),
            stat(selected.stackingStrength.toFixed(2), "nearest-neighbour ΔG magnitude"),
          ])
        );
        parts.rail.replaceChildren(causalRail(el, [
          { key: "you changed", value: "base order, not composition" },
          { key: "mechanism", value: "each dinucleotide stack has a different energy" },
          { key: "observable", value: "duplex stability changes at fixed GC" },
        ]));
        parts.explanation.className = "callout";
        parts.explanation.innerHTML = "<strong>Hydrogen-bond counting misses the sequence order.</strong> " +
          "The readout sums standard 37 °C nearest-neighbour stacking free-energy magnitudes; " +
          "salt and strand concentration are held fixed, so this is a relative comparison, not a clinical Tm calculator.";
        return;
      }

      const result = dnaGeometryModel({
        kind: "topology", baselineTwist: 20, turnsUnwound: turns, endsLocked: locked,
      });
      parts.visual.innerHTML = topologySvg(result, turns, locked);
      parts.controls.replaceChildren(
        rangeControl(el, "Local turns unwound", turns, {
          min: 0, max: 6, step: 1, format: (value) => value + " turns",
        }, (value) => { turns = value; render(); }),
        el("div", { class: "lab-control-block" }, [
          el("span", { class: "lab-control-label", text: "Domain ends" }),
          choiceRow(el, [
            { label: "Topologically locked", value: true },
            { label: "One end free", value: false },
          ], locked, (value) => { locked = value; render(); }, "Topological constraint"),
        ]),
        el("div", { class: "readout" }, [
          stat(result.linking.toFixed(1), "linking number Lk"),
          stat(result.twist.toFixed(1), "twist Tw"),
          stat(result.writhe.toFixed(1), "writhe Wr"),
        ])
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "you changed", value: turns + " turns unwound; ends " + (locked ? "locked" : "free") },
        { key: "constraint", value: locked ? "Lk cannot change" : "an end rotates, so Lk can change" },
        { key: "observable", value: locked ? "lost twist reappears as writhe" : "torsional stress escapes" },
      ]));
      parts.explanation.className = "callout " + (locked && turns ? "callout-bad" : "");
      parts.explanation.innerHTML = locked
        ? "<strong>Topology keeps the books.</strong> With no strand break or free end, Lk is fixed. Locally removing twist therefore stores an equal amount as writhe elsewhere; topoisomerases are the enzymes that change Lk."
        : "<strong>The swivel releases the bookkeeping constraint.</strong> Rotation changes Lk, so unwinding need not be stored as supercoiling.";
    }

    predict(body, {
      widget: "dna-geometry-lab",
      question: "A polymerase unwinds three turns inside a DNA domain whose ends cannot rotate. Where does that change go?",
      hint: "For a closed domain, use <code>Lk = Tw + Wr</code> and decide which term is fixed.",
      options: [
        { label: "It appears as writhe elsewhere in the domain", correct: true },
        { label: "The linking number simply falls by three" },
        { label: "The DNA loses three base pairs" },
        { label: "Nothing changes until the strands separate fully" },
      ],
    }, () => {
      parts.instrument.hidden = false;
      render();
    });
    finishLab(parts, body);
  });

  /* Ch 03 — Genome Scale Zoomer view -------------------------------------- */

  const SCALE_STOPS = [
    { label: "one base-pair step", size: "0.34 nm", nm: 0.34, detail: "chemical information" },
    { label: "DNA double helix", size: "2 nm wide", nm: 2, detail: "charged, twisted polymer" },
    { label: "nucleosome", size: "11 nm", nm: 11, detail: "147 bp wrapped around a histone octamer" },
    { label: "chromatin loop", size: "~0.1–1 μm", nm: 300,
      detail: "dynamic contacts spanning tens to hundreds of kb, not a 30 nm fibre" },
    { label: "metaphase chromosome", size: "~1–10 μm", nm: 5000,
      detail: "maximally compact for segregation" },
    { label: "nucleus", size: "~6 μm", nm: 6000,
      detail: "6.2 Gb and roughly two metres of DNA" },
  ];

  function scaleZoomVisual(index, packaging) {
    const rows = SCALE_STOPS.map((stop, row) => {
      const active = row === index;
      const logPosition = (Math.log10(stop.nm) - Math.log10(0.34)) /
        (Math.log10(6000) - Math.log10(0.34));
      const lineEnd = 55 + logPosition * 65;
      return '<g class="scale-stop' + (active ? " is-active" : "") + '" transform="translate(0 ' +
        (60 + row * 34) + ')">' +
        '<line x1="42" y1="0" x2="' + lineEnd.toFixed(1) + '" y2="0"/>' +
        '<circle cx="42" cy="0" r="6"/>' +
        '<text class="scale-name" x="140" y="4">' + stop.label + "</text>" +
        '<text class="scale-size" x="482" y="4" text-anchor="end">' + stop.size + "</text>" +
      "</g>";
    }).join("");
    const stop = SCALE_STOPS[index];
    const detailLines = wrapWords(stop.label + " · " + stop.detail, 29);
    const summaryY = 270 + detailLines.length * 22 + 8;
    const viewHeight = summaryY + 51;
    return textSvg(
      svgLines("lab-svg-kicker", 18, 18,
        ["six physical scales of packaging", "never one rigid fibre"], 20) +
      rows +
      svgLines("lab-svg-label", 18, 270, detailLines, 22) +
      svgLines("lab-svg-label", 18, summaryY,
        ["diploid contour length " + packaging.contourMetres.toFixed(2) + " m",
          formatNumber(packaging.nucleosomes, 0) + " nucleosome repeat units"], 22),
      "Genome packaging scale from a base pair to a nucleus. Selected level: " +
        stop.label + ", " + stop.size + ". " + stop.detail + ".",
      "0 0 500 " + viewHeight
    );
  }

  function repeatFailureVisual(arrangement, result) {
    const repeated = arrangement === "interspersed"
      ? '<g class="repeat-track">' + [42, 138, 266, 404].map((x) =>
          '<rect x="' + x + '" y="88" width="52" height="32" rx="5"/>'
        ).join("") +
        '<path class="read-ambiguity" d="M190 190 Q105 138 68 120 M190 190 Q160 140 164 120 ' +
          'M190 190 Q285 140 292 120 M190 190 Q410 145 430 120"/>' +
        '<rect class="read-chip" x="162" y="184" width="56" height="24" rx="4"/>' +
        '<text class="read-label" x="190" y="201" text-anchor="middle">150 bp</text></g>'
      : '<g class="repeat-track"><path d="M42 105 H458"/>' +
        Array.from({ length: 9 }, (_, index) =>
          '<rect x="' + (48 + index * 44) + '" y="86" width="35" height="38" rx="3"/>'
        ).join("") +
        '<path class="assembly-cycle" d="M160 178 C210 135 300 135 350 178 C300 222 210 222 160 178"/>' +
        '<text class="read-label" x="255" y="183" text-anchor="middle">unresolved copy count</text></g>';
    return textSvg(
      svgLines("lab-svg-kicker", 18, 20,
        ["repeat arrangement decides", "which algorithm fails"], 20) +
      repeated +
      svgLines("lab-svg-label", 18, 238,
        ["breaks " + result.brokenTool, result.signature], 22),
      (arrangement === "interspersed" ? "Interspersed" : "Tandem") +
        " repeats break " + result.brokenTool + " because they create " + result.signature + ".",
      "0 0 500 282"
    );
  }

  function heteroplasmyVisual(result, threshold) {
    const columns = result.oocytes.map((load, index) => {
      const x = 30 + index * 23;
      const height = load * 1.55;
      const y = 207 - height;
      return '<rect class="heteroplasmy-bar' + (load >= threshold ? " is-over" : "") +
        '" x="' + x + '" y="' + y.toFixed(1) + '" width="15" height="' +
        height.toFixed(1) + '"/><title>Oocyte ' + (index + 1) + ": " + load.toFixed(0) + "% mutant</title>";
    }).join("");
    const thresholdY = 207 - threshold * 1.55;
    return textSvg(
      '<text class="lab-svg-kicker" x="18" y="22">same mother · sampled mtDNA bottleneck</text>' +
      '<path class="lab-axis" d="M28 207 H470 M28 42 V207"/>' + columns +
      '<path class="threshold-line" d="M28 ' + thresholdY.toFixed(1) + ' H470"/>' +
      '<rect class="threshold-label-bg" x="28" y="' + (thresholdY - 27).toFixed(1) +
        '" width="305" height="25" rx="4"/>' +
      '<text class="lab-svg-label" x="34" y="' + (thresholdY - 7).toFixed(1) + '">' +
        threshold + "% biochemical threshold</text>" +
      '<text class="lab-svg-label" x="28" y="232">20 fixed-seed oocyte samples</text>',
      "Twenty oocyte samples from the same maternal heteroplasmy. Bars above " + threshold +
        " percent cross the illustrative biochemical threshold.",
      "0 0 500 248"
    );
  }

  define("genome-scale-lab", function (api) {
    const { body, el, stat, predict } = api;
    const parts = labParts(el);
    let mode = "scale";
    let scaleIndex = 2;
    let arrangement = "interspersed";
    let load = 55;
    let bottleneck = 30;
    let threshold = 70;

    function render() {
      parts.tabHost.replaceChildren(tabs(el, [
        { label: "Scale zoom", value: "scale" },
        { label: "Repeat failure", value: "repeats" },
        { label: "mtDNA bottleneck", value: "mt" },
      ], mode, (next) => { mode = next; render(); }));

      if (mode === "scale") {
        const result = genomeScaleModel({ kind: "packaging", genomeGb: 6.2, repeatLengthBp: 200 });
        parts.visual.innerHTML = scaleZoomVisual(scaleIndex, result);
        parts.controls.replaceChildren(
          rangeControl(el, "Magnification", scaleIndex, {
            min: 0, max: SCALE_STOPS.length - 1, step: 1,
            format: (value) => SCALE_STOPS[value].label,
          }, (value) => { scaleIndex = value; render(); }),
          el("div", { class: "readout" }, [
            stat(result.contourMetres.toFixed(2) + " m", "diploid DNA contour"),
            stat(formatNumber(result.nucleosomes, 0), "~200 bp repeat units"),
            stat((result.wrappedFraction * 100).toFixed(1) + "%", "DNA wrapped in cores"),
          ])
        );
        parts.rail.replaceChildren(causalRail(el, [
          { key: "you changed", value: "scale to " + SCALE_STOPS[scaleIndex].label },
          { key: "constraint", value: "compact, remain locally readable, segregate" },
          { key: "observable", value: SCALE_STOPS[scaleIndex].detail },
        ]));
        parts.explanation.className = "callout";
        parts.explanation.innerHTML = "<strong>The famous ‘two metres into six micrometres’ line is incomplete.</strong> " +
          "Bare DNA occupies only a minority of nuclear volume. The hard problem is topology and controlled access: compacting it while permitting local reading and accurate segregation.";
        return;
      }

      if (mode === "repeats") {
        const result = genomeScaleModel({ kind: "repeat", arrangement });
        parts.visual.innerHTML = repeatFailureVisual(arrangement, result);
        parts.controls.replaceChildren(
          el("div", { class: "lab-control-block" }, [
            el("span", { class: "lab-control-label", text: "Repeat arrangement" }),
            choiceRow(el, [
              { label: "Interspersed copies", value: "interspersed" },
              { label: "Tandem array", value: "tandem" },
            ], arrangement, (value) => { arrangement = value; render(); }, "Repeat arrangement"),
          ]),
          el("div", { class: "readout" }, [
            stat(arrangement === "interspersed" ? "alignment" : "assembly", "first tool to fail"),
            stat(arrangement === "interspersed" ? "MAPQ 0" : "copy count ?", "failure signature"),
          ])
        );
        parts.rail.replaceChildren(causalRail(el, [
          { key: "you changed", value: arrangement + " repeat arrangement" },
          { key: "information limit", value: result.signature },
          { key: "observable", value: result.brokenTool + " fails" },
        ]));
        parts.explanation.className = "callout callout-bad";
        parts.explanation.innerHTML = arrangement === "interspersed"
          ? "<strong>Many places, one read.</strong> A short read inside an Alu-like copy has many plausible genomic origins; more coverage repeats the ambiguity rather than resolving it."
          : "<strong>One place, unknown length.</strong> If a tandem array exceeds the read or molecule span, a graph can recover the repeat unit but not how many times it occurs.";
        return;
      }

      const result = genomeScaleModel({
        kind: "heteroplasmy", loadPercent: load, bottleneck,
        thresholdPercent: threshold, seed: 305, samples: 20,
      });
      parts.visual.innerHTML = heteroplasmyVisual(result, threshold);
      parts.controls.replaceChildren(
        rangeControl(el, "Maternal mutant load", load, {
          min: 5, max: 95, step: 5, format: (value) => value + "%",
        }, (value) => { load = value; render(); }),
        rangeControl(el, "Effective bottleneck sample", bottleneck, {
          min: 10, max: 80, step: 5, format: (value) => value + " molecules",
        }, (value) => { bottleneck = value; render(); }),
        rangeControl(el, "Illustrative tissue threshold", threshold, {
          min: 50, max: 90, step: 5, format: (value) => value + "%",
        }, (value) => { threshold = value; render(); }),
        el("div", { class: "readout" }, [
          stat((result.aboveThreshold * 100).toFixed(1) + "%", "oocytes expected above threshold"),
          stat(Math.min(...result.oocytes).toFixed(0) + "–" +
            Math.max(...result.oocytes).toFixed(0) + "%", "fixed-seed sample range"),
        ])
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "you changed", value: bottleneck + "-molecule germline sample" },
        { key: "mechanism", value: "random segregation amplifies sampling variance" },
        { key: "observable", value: "siblings inherit different mutant loads" },
      ]));
      parts.explanation.className = "callout";
      parts.explanation.innerHTML = "<strong>This is a sampling distribution, not a Mendelian quarter.</strong> " +
        "The bars reuse one random seed, so changing the bottleneck isolates its effect. " +
        "The clinical threshold is deliberately labelled illustrative because it varies by mutation and tissue.";
    }

    predict(body, {
      widget: "genome-scale-lab",
      question: "Bare human DNA would occupy only a minority of nuclear volume. What is the deeper packaging problem?",
      hint: "The genome must be used and segregated, not merely stored.",
      options: [
        { label: "Controlling topology, access, and segregation at once", correct: true },
        { label: "Finding enough empty nuclear volume" },
        { label: "Making every chromosome a permanent 30 nm fibre" },
        { label: "Keeping all genes equally accessible" },
      ],
    }, () => {
      parts.instrument.hidden = false;
      render();
    });
    finishLab(parts, body);
  });

  /* Ch 05 — Transcription Engine view ------------------------------------- */

  function transcriptionStrandsSvg(top, direction, result) {
    const arrow = direction === "right" ? "→" : "←";
    const bottom = top.split("").map((base) => COMPLEMENT[base]).join("");
    return textSvg(
      svgLines("lab-svg-kicker", 18, 20,
        ["promoter points " + arrow, "polymerase reads template 3′→5′"], 17) +
      '<text class="strand-end" x="35" y="74">5′</text><text class="strand-sequence" x="78" y="74">' + top +
        '</text><text class="strand-end" x="450" y="74">3′</text>' +
      '<text class="pair-marks" x="78" y="101">' + "| ".repeat(top.length) + "</text>" +
      '<text class="strand-end" x="35" y="130">3′</text><text class="strand-sequence" x="78" y="130">' + bottom +
        '</text><text class="strand-end" x="450" y="130">5′</text>' +
      '<path class="polymerase-arrow" d="M' + (direction === "right" ? "82 166 H430" : "430 166 H82") + '"/>' +
      '<text class="rna-sequence" x="78" y="205">RNA 5′—' + result.rna5to3 + "—3′</text>",
      "A DNA duplex with promoter direction " + direction + ". The coding strand reads " +
        result.coding5to3 + " and the RNA reads " + result.rna5to3 + " from 5 prime to 3 prime.",
      "0 0 500 228"
    );
  }

  function ctdStateSvg(stage, result) {
    const phosphates = stage === "initiation" ? [0, 2, 4, 6, 8] :
      stage === "elongation" ? [1, 3, 5, 7, 9, 11] : [];
    const tail = Array.from({ length: 12 }, (_, index) => {
      const x = 150 + index * 25;
      const marked = phosphates.includes(index);
      return '<g><circle class="ctd-repeat' + (marked ? " is-phosphorylated" : "") +
        '" cx="' + x + '" cy="145" r="9"/>' +
        (marked ? '<text class="phosphate-mark" x="' + x + '" y="120" text-anchor="middle">P</text>' : "") +
        "</g>";
    }).join("");
    return textSvg(
      svgLines("lab-svg-kicker", 18, 20,
        ["Pol II CTD is a moving", "recruitment surface"], 17) +
      '<circle class="polymerase-body" cx="95" cy="120" r="48"/>' +
      '<text class="polymerase-name" x="95" y="126" text-anchor="middle">Pol II</text>' +
      '<path class="ctd-tail" d="M137 136 H445"/>' + tail +
      svgLines("lab-svg-label", 18, 201,
        [stage + " · Ser5P " + result.ser5 + " · Ser2P " + result.ser2,
          "recruits " + result.recruits], 17),
      "RNA polymerase two in the " + stage + " state. Serine 5 phosphorylation is " +
        result.ser5 + ", serine 2 phosphorylation is " + result.ser2 +
        ", recruiting " + result.recruits + ".",
      "0 0 500 238"
    );
  }

  function enhancerContactSvg(model, boundary) {
    const targetX = model.target === "gene A" ? 72 : model.target === "gene B" ? 310 : 425;
    const geneAClass = model.target === "gene A" ? "gene-block is-target" : "gene-block";
    const geneBClass = model.target === "gene B" ? "gene-block is-target" : "gene-block";
    const geneCClass = model.target === "gene C" ? "gene-block is-target" : "gene-block";
    return textSvg(
      svgLines("lab-svg-kicker", 18, 20,
        ["linear distance does not", "choose the target"], 17) +
      '<path class="chromatin-fibre" d="M40 165 H460"/>' +
      '<g class="' + geneAClass + '"><rect x="46" y="151" width="52" height="28"/><text x="72" y="171" text-anchor="middle">A</text></g>' +
      '<rect class="enhancer-block" x="152" y="146" width="46" height="38" rx="6"/>' +
      '<text class="feature-label" x="175" y="137" text-anchor="middle">enhancer</text>' +
      '<g class="' + geneBClass + '"><rect x="284" y="151" width="52" height="28"/><text x="310" y="171" text-anchor="middle">B</text></g>' +
      '<g class="' + geneCClass + '"><rect x="399" y="151" width="52" height="28"/><text x="425" y="171" text-anchor="middle">C</text></g>' +
      (boundary ? '<path class="boundary-mark" d="M122 126 V195"/><text class="feature-label" x="122" y="116" text-anchor="middle">boundary</text>' : "") +
      '<path class="enhancer-loop" d="M175 146 Q' + ((175 + targetX) / 2) + ' 62 ' + targetX + ' 151"/>' +
      '<text class="lab-svg-label" x="18" y="222">nearest gene A · contacted target ' + model.target + "</text>",
      "An enhancer is nearest to gene A but loops to " + model.target +
        (boundary ? " while a domain boundary constrains contacts." : " after the boundary is removed."),
      "0 0 500 240"
    );
  }

  function geneClockSvg(result, length, speed, pause) {
    const elongationWidth = Math.min(390, (result.elongationMinutes / Math.max(1, result.totalMinutes)) * 390);
    const pauseWidth = 390 - elongationWidth;
    return textSvg(
      svgLines("lab-svg-kicker", 18, 20,
        ["one transcript occupies a polymerase", "for real time"], 17) +
      '<rect class="clock-pause" x="55" y="92" width="' + pauseWidth.toFixed(1) + '" height="44"/>' +
      '<rect class="clock-elongation" x="' + (55 + pauseWidth).toFixed(1) + '" y="92" width="' +
        elongationWidth.toFixed(1) + '" height="44"/>' +
      '<text class="feature-label" x="55" y="78">promoter pause</text>' +
      '<text class="feature-label" x="445" y="78" text-anchor="end">elongation</text>' +
      '<path class="lab-axis" d="M55 154 H445"/>' +
      '<text class="lab-svg-label" x="55" y="178">0 min</text>' +
      '<text class="lab-svg-label" x="445" y="178" text-anchor="end">' + result.totalMinutes.toFixed(1) + " min</text>" +
      '<text class="lab-svg-label" x="18" y="218">' + length + " kb at " + speed +
        " kb/min + " + pause + " min pause</text>",
      "A " + length + " kilobase gene transcribed at " + speed +
        " kilobases per minute with a " + pause + " minute promoter pause takes " +
        result.totalMinutes.toFixed(1) + " minutes total.",
      "0 0 500 235"
    );
  }

  define("transcription-engine-lab", function (api) {
    const { body, el, stat, predict } = api;
    const parts = labParts(el);
    let mode = "strand";
    let direction = "right";
    let fixture = 0;
    let stage = "initiation";
    let boundary = true;
    let length = 250;
    let speed = 1.5;
    let pause = 3;
    const sequences = ["ATGCCGTAACGT", "GATTACCGTTAG"];

    function render() {
      parts.tabHost.replaceChildren(tabs(el, [
        { label: "Strand reader", value: "strand" },
        { label: "CTD state", value: "ctd" },
        { label: "Enhancer contact", value: "enhancer" },
        { label: "Gene clock", value: "timing" },
      ], mode, (next) => { mode = next; render(); }));

      if (mode === "strand") {
        const top = sequences[fixture];
        const result = transcriptionModel({ kind: "strand", top5to3: top, direction });
        parts.visual.innerHTML = transcriptionStrandsSvg(top, direction, result);
        parts.controls.replaceChildren(
          el("div", { class: "lab-control-block" }, [
            el("span", { class: "lab-control-label", text: "Promoter direction" }),
            choiceRow(el, [
              { label: "transcribe right →", value: "right" },
              { label: "← transcribe left", value: "left" },
            ], direction, (value) => { direction = value; render(); }, "Promoter direction"),
          ]),
          el("button", {
            class: "btn", type: "button", text: "Change duplex fixture",
            onclick: () => { fixture = 1 - fixture; render(); },
          }),
          el("div", { class: "readout" }, [
            stat(result.coding5to3, "coding strand 5′→3′"),
            stat(result.rna5to3, "RNA 5′→3′"),
          ])
        );
        parts.rail.replaceChildren(causalRail(el, [
          { key: "you changed", value: "promoter points " + (direction === "right" ? "right" : "left") },
          { key: "mechanism", value: "polymerase reads the antiparallel template 3′→5′" },
          { key: "observable", value: "RNA matches coding strand, U for T" },
        ]));
        parts.explanation.className = "callout";
        parts.explanation.innerHTML = "<strong>Template is a role, not a permanently named strand.</strong> " +
          "Reverse the promoter and the other physical strand becomes template. The transcript is always written 5′→3′ and resembles the coding strand.";
        return;
      }

      if (mode === "ctd") {
        const result = transcriptionModel({ kind: "ctd", stage });
        parts.visual.innerHTML = ctdStateSvg(stage, result);
        parts.controls.replaceChildren(
          el("div", { class: "lab-control-block" }, [
            el("span", { class: "lab-control-label", text: "Polymerase stage" }),
            choiceRow(el, [
              { label: "Initiation / Ser5P", value: "initiation" },
              { label: "Productive elongation / Ser2P", value: "elongation" },
              { label: "Dephosphorylated recycle", value: "recycle" },
            ], stage, (value) => { stage = value; render(); }, "CTD stage"),
          ]),
          el("div", { class: "readout" }, [
            stat(result.ser5, "Ser5 phosphorylation"),
            stat(result.ser2, "Ser2 phosphorylation"),
            stat(result.recruits, "recruited machinery"),
          ])
        );
        parts.rail.replaceChildren(causalRail(el, [
          { key: "you changed", value: "Pol II to " + stage },
          { key: "mechanism", value: "CTD phosphorylation rewrites docking sites" },
          { key: "observable", value: result.recruits + " arrive" },
        ]));
        parts.explanation.className = "callout";
        parts.explanation.innerHTML = "<strong>The CTD makes transcription a coupled pipeline.</strong> " +
          "The RNA-processing enzymes are recruited by the moving polymerase at the stage when their substrate appears.";
        return;
      }

      if (mode === "enhancer") {
        const result = transcriptionModel({ kind: "enhancer", boundaryIntact: boundary });
        parts.visual.innerHTML = enhancerContactSvg(result, boundary);
        parts.controls.replaceChildren(
          el("div", { class: "lab-control-block" }, [
            el("span", { class: "lab-control-label", text: "Domain boundary" }),
            choiceRow(el, [
              { label: "Boundary intact", value: true },
              { label: "Boundary deleted", value: false },
            ], boundary, (value) => { boundary = value; render(); }, "Boundary state"),
          ]),
          el("div", { class: "readout" }, [
            stat("gene A", "nearest gene"),
            stat(result.target, "contacted target"),
          ])
        );
        parts.rail.replaceChildren(causalRail(el, [
          { key: "you changed", value: boundary ? "kept the domain boundary" : "deleted the boundary" },
          { key: "mechanism", value: "3D contact opportunities are rewired" },
          { key: "observable", value: result.target + " receives enhancer input" },
        ]));
        parts.explanation.className = "callout " + (boundary ? "" : "callout-bad");
        parts.explanation.innerHTML = boundary
          ? "<strong>Nearest is not a mechanism.</strong> Gene A is closest in base pairs but lies across the boundary; the enhancer and gene B share the contact domain in this fixture."
          : "<strong>Deleting the boundary rewires opportunity, not affinity by decree.</strong> The fixture now permits contact with nearby gene A, illustrating why structural-variant interpretation must test the altered 3D neighbourhood.";
        return;
      }

      const result = transcriptionModel({
        kind: "timing", lengthKb: length, speedKbMin: speed, pauseMinutes: pause,
      });
      parts.visual.innerHTML = geneClockSvg(result, length, speed, pause);
      parts.controls.replaceChildren(
        rangeControl(el, "Gene length", length, {
          min: 10, max: 1000, step: 10, format: (value) => value + " kb",
        }, (value) => { length = value; render(); }),
        rangeControl(el, "Elongation speed", speed, {
          min: 1, max: 2, step: 0.1, format: (value) => value.toFixed(1) + " kb/min",
        }, (value) => { speed = value; render(); }),
        rangeControl(el, "Promoter pause", pause, {
          min: 0, max: 10, step: 1, format: (value) => value + " min",
        }, (value) => { pause = value; render(); }),
        el("div", { class: "readout" }, [
          stat(result.elongationMinutes.toFixed(1) + " min", "elongation alone"),
          stat(result.totalMinutes.toFixed(1) + " min", "first full transcript"),
        ])
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "you changed", value: length + " kb at " + speed.toFixed(1) + " kb/min" },
        { key: "mechanism", value: "polymerase must physically traverse every base" },
        { key: "observable", value: result.totalMinutes.toFixed(1) + " min to first complete RNA" },
      ]));
      parts.explanation.className = "callout";
      parts.explanation.innerHTML = "<strong>Gene length is a response-time constraint.</strong> " +
        "At 1–2 kb/min, a megabase-scale gene takes many hours. A promoter can fire repeatedly, but no downstream analysis can see a full transcript before elongation finishes.";
    }

    predict(body, {
      widget: "transcription-engine-lab",
      question: "A promoter points right on a duplex whose top strand is written 5′→3′ left-to-right. Which strand will the RNA resemble?",
      hint: "Polymerase reads its template 3′→5′ while synthesising RNA 5′→3′.",
      options: [
        { label: "The top coding strand, with U in place of T", correct: true },
        { label: "The bottom template exactly, including T" },
        { label: "Whichever strand has more GC" },
        { label: "Both strands are copied into one RNA" },
      ],
    }, () => {
      parts.instrument.hidden = false;
      render();
    });
    finishLab(parts, body);
  });

  /* Ch 06 — Spliceosome Editor view --------------------------------------- */

  function spliceOutcomeSvg(result, donorIntact, organism) {
    const exon2 = result.product.includes("2")
      ? '<rect class="rna-exon exon-two" x="220" y="112" width="92" height="44" rx="5"/>' +
        '<text class="exon-label" x="266" y="140" text-anchor="middle">exon 2</text>'
      : '<rect class="rna-exon is-skipped" x="220" y="112" width="92" height="44" rx="5"/>' +
        '<path class="skip-mark" d="M225 117 L307 151 M307 117 L225 151"/>';
    const retained = result.consequence === "intron retained"
      ? '<rect class="rna-intron is-retained" x="150" y="112" width="230" height="44" rx="5"/>'
      : '<path class="splice-arc" d="M150 112 Q266 28 380 112"/>';
    return textSvg(
      svgLines("lab-svg-kicker", 18, 20,
        ["exon definition interprets", "a local signal as a larger unit"], 17) +
      '<text class="feature-label" x="18" y="74">' + organism +
        " · donor " + (donorIntact ? "intact" : "broken") + "</text>" +
      retained +
      '<rect class="rna-exon" x="54" y="112" width="92" height="44" rx="5"/>' +
      exon2 +
      '<rect class="rna-exon" x="384" y="112" width="92" height="44" rx="5"/>' +
      '<text class="exon-label" x="100" y="140" text-anchor="middle">exon 1</text>' +
      '<text class="exon-label" x="430" y="140" text-anchor="middle">exon 3</text>' +
      '<text class="lab-svg-label" x="18" y="210">mature product: ' + result.product +
        " · " + result.consequence + "</text>",
      organism + " RNA with a " + (donorIntact ? "working" : "broken") +
        " donor site produces " + result.product + "; " + result.consequence + ".",
      "0 0 530 230"
    );
  }

  function spliceChoiceSvg(result) {
    const included = result.psi;
    const includedWidth = 430 * included;
    return textSvg(
      svgLines("lab-svg-kicker", 18, 20,
        ["splice choice is a balance", "not a binary motif lookup"], 17) +
      '<rect class="psi-track" x="45" y="87" width="430" height="54" rx="9"/>' +
      '<rect class="psi-fill" x="45" y="87" width="' + includedWidth.toFixed(1) +
        '" height="54" rx="9"/>' +
      '<rect class="psi-value-bg" x="205" y="96" width="110" height="36" rx="6"/>' +
      '<text class="psi-value" x="260" y="122" text-anchor="middle">PSI ' +
        (included * 100).toFixed(0) + "%</text>" +
      '<text class="lab-svg-label" x="45" y="170">excluded</text>' +
      '<text class="lab-svg-label" x="475" y="170" text-anchor="end">included</text>' +
      '<path class="factor-arrow sr" d="M120 205 H230"/><text class="feature-label" x="112" y="210" text-anchor="end">SR support</text>' +
      '<path class="factor-arrow hnrnp" d="M400 205 H290"/><text class="feature-label" x="492" y="210" text-anchor="end">hnRNP repression</text>',
      "Alternative exon percent-spliced-in is " + (included * 100).toFixed(0) +
        " percent under the current SR protein, hnRNP, and polymerase-speed settings.",
      "0 0 520 235"
    );
  }

  function nmdRulerSvg(stop, junction, result, lastExon) {
    const left = 55;
    const width = 400;
    const stopX = left + (stop / 300) * width;
    const junctionX = left + (junction / 300) * width;
    const boundaryX = left + ((junction - 55) / 300) * width;
    return textSvg(
      '<text class="lab-svg-kicker" x="18" y="22">the ribosome leaves a positional record</text>' +
      '<rect class="rna-exon" x="55" y="102" width="400" height="38" rx="5"/>' +
      (!lastExon ? '<line class="junction-mark" x1="' + junctionX.toFixed(1) + '" y1="79" x2="' +
        junctionX.toFixed(1) + '" y2="163"/><text class="feature-label" x="' + junctionX.toFixed(1) +
        '" y="70" text-anchor="middle">last exon junction</text>' : "") +
      (!lastExon ? '<line class="nmd-boundary" x1="' + boundaryX.toFixed(1) + '" y1="92" x2="' +
        boundaryX.toFixed(1) + '" y2="151"/><text class="lab-svg-label" x="' + boundaryX.toFixed(1) +
        '" y="177" text-anchor="middle">55 nt</text>' : "") +
      '<path class="stop-pin' + (result.triggered ? " is-nmd" : "") + '" d="M' +
        stopX.toFixed(1) + ' 89 V153"/><text class="stop-label" x="' + stopX.toFixed(1) +
        '" y="83" text-anchor="middle">STOP</text>' +
      '<text class="lab-svg-label" x="18" y="216">' + result.outcome + "</text>",
      "Premature stop at nucleotide " + stop + (lastExon ? " in the last exon" :
        ", " + result.distance + " nucleotides upstream of the final exon junction") +
        ". Outcome: " + result.outcome + ".",
      "0 0 510 232"
    );
  }

  define("spliceosome-editor-lab", function (api) {
    const { body, el, stat, predict } = api;
    const parts = labParts(el);
    let mode = "donor";
    let donorIntact = false;
    let organism = "human";
    let sr = 1.2;
    let hnrnp = 0.7;
    let slow = false;
    let stop = 120;
    let lastExon = false;
    const junction = 240;

    function render() {
      parts.tabHost.replaceChildren(tabs(el, [
        { label: "Donor mutation", value: "donor" },
        { label: "Exon choice", value: "choice" },
        { label: "NMD ruler", value: "nmd" },
      ], mode, (next) => { mode = next; render(); }));

      if (mode === "donor") {
        const result = rnaProcessingModel({ kind: "donor", donorIntact, organism });
        parts.visual.innerHTML = spliceOutcomeSvg(result, donorIntact, organism);
        parts.controls.replaceChildren(
          el("div", { class: "paired-controls" }, [
            el("div", { class: "lab-control-block" }, [
              el("span", { class: "lab-control-label", text: "5′ donor" }),
              choiceRow(el, [
                { label: "GU intact", value: true },
                { label: "GU→AU broken", value: false },
              ], donorIntact, (value) => { donorIntact = value; render(); }, "Donor state"),
            ]),
            el("div", { class: "lab-control-block" }, [
              el("span", { class: "lab-control-label", text: "Recognition regime" }),
              choiceRow(el, [
                { label: "Human exon definition", value: "human" },
                { label: "Yeast intron definition", value: "yeast" },
              ], organism, (value) => { organism = value; render(); }, "Organism"),
            ]),
          ]),
          el("div", { class: "readout" }, [
            stat(result.product, "mature product"),
            stat(result.consequence, "primary consequence"),
          ])
        );
        parts.rail.replaceChildren(causalRail(el, [
          { key: "you changed", value: donorIntact ? "restored the donor" : "destroyed the exon-2 donor" },
          { key: "mechanism", value: organism === "human" ? "recognition spans the exon" : "recognition spans the short intron" },
          { key: "observable", value: result.consequence },
        ]));
        parts.explanation.className = "callout " + (donorIntact ? "callout-good" : "callout-bad");
        parts.explanation.innerHTML = donorIntact
          ? "<strong>Both boundaries support the unit.</strong> Exon 2 is recognised and joined into the mature message."
          : organism === "human"
          ? "<strong>The mutation removes the upstream exon from recognition.</strong> In long-intron vertebrate genes, splice-site pairing commonly spans the exon, so a broken downstream donor makes exon 2 disappear as a unit."
          : "<strong>The short intron remains visible as the failed unit.</strong> In budding yeast, recognition commonly spans the intron, so a failed boundary more often yields retention.";
        return;
      }

      if (mode === "choice") {
        const result = rnaProcessingModel({ kind: "choice", sr, hnrnp, slowPolymerase: slow });
        parts.visual.innerHTML = spliceChoiceSvg(result);
        parts.controls.replaceChildren(
          rangeControl(el, "SR-protein support", sr, {
            min: 0, max: 3, step: 0.1, format: (value) => value.toFixed(1),
          }, (value) => { sr = value; render(); }),
          rangeControl(el, "hnRNP repression", hnrnp, {
            min: 0, max: 3, step: 0.1, format: (value) => value.toFixed(1),
          }, (value) => { hnrnp = value; render(); }),
          el("div", { class: "lab-control-block" }, [
            el("span", { class: "lab-control-label", text: "Pol II elongation" }),
            choiceRow(el, [
              { label: "Fast", value: false },
              { label: "Slow", value: true },
            ], slow, (value) => { slow = value; render(); }, "Polymerase speed"),
          ]),
          el("div", { class: "readout" }, [
            stat((result.psi * 100).toFixed(0) + "%", "percent spliced in"),
            stat(result.psi >= 0.5 ? "included" : "skipped", "major isoform"),
          ])
        );
        parts.rail.replaceChildren(causalRail(el, [
          { key: "you changed", value: "enhancer/repressor balance and elongation" },
          { key: "mechanism", value: "competing factors alter exon-recognition probability" },
          { key: "observable", value: (result.psi * 100).toFixed(0) + "% PSI" },
        ]));
        parts.explanation.className = "callout";
        parts.explanation.innerHTML = "<strong>Consensus motifs are necessary but not sufficient.</strong> " +
          "The logistic response is an instructional model of a competition: SR proteins, hnRNPs, chromatin and elongation kinetics jointly change the probability that one exon is included.";
        return;
      }

      const result = rnaProcessingModel({
        kind: "nmd", stopNt: stop, lastJunctionNt: junction, stopInLastExon: lastExon,
      });
      parts.visual.innerHTML = nmdRulerSvg(stop, junction, result, lastExon);
      parts.controls.replaceChildren(
        rangeControl(el, "Premature-stop position", stop, {
          min: 40, max: 290, step: 5, format: (value) => "nt " + value,
        }, (value) => { stop = value; render(); }),
        el("div", { class: "lab-control-block" }, [
          el("span", { class: "lab-control-label", text: "Stop context" }),
          choiceRow(el, [
            { label: "Junction remains downstream", value: false },
            { label: "Stop lies in last exon", value: true },
          ], lastExon, (value) => { lastExon = value; render(); }, "Stop context"),
        ]),
        el("div", { class: "readout" }, [
          stat(lastExon ? "no downstream EJC" : result.distance + " nt", "distance to last junction"),
          stat(result.triggered ? "NMD" : "escape", "predicted surveillance outcome"),
        ])
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "you changed", value: "stop at nt " + stop + (lastExon ? " in final exon" : "") },
        { key: "mechanism", value: result.triggered ? "translation ends >55 nt before a retained EJC" : "no qualifying downstream EJC remains" },
        { key: "observable", value: result.outcome },
      ]));
      parts.explanation.className = "callout " + (result.triggered ? "callout-bad" : "");
      parts.explanation.innerHTML = "<strong>The 50–55 nt rule is a positional heuristic.</strong> " +
        "A premature stop well upstream of a remaining exon-junction complex usually triggers decay; a stop in the last exon or close to the final junction often escapes and can make a truncated protein.";
    }

    predict(body, {
      widget: "spliceosome-editor-lab",
      question: "In a typical human gene, a variant destroys the 5′ donor immediately after exon 2. What is the most direct splicing consequence?",
      hint: "Vertebrate splice-site recognition commonly pairs signals across an exon.",
      options: [
        { label: "Exon 2 is skipped", correct: true },
        { label: "Only the downstream intron is shortened" },
        { label: "Every intron in the transcript is retained" },
        { label: "The coding sequence cannot change because the variant is intronic" },
      ],
    }, () => {
      parts.instrument.hidden = false;
      render();
    });
    finishLab(parts, body);
  });

  /* Ch 07 — Ribosome and Reading-Frame Lab view --------------------------- */

  function frameRowsHtml(sequence, frames) {
    function row(label, codons) {
      return '<div class="frame-row"><span class="frame-label">' + label + '</span><span class="frame-codons">' +
        codons.map((item) => '<span class="frame-codon' + (item.aa === "*" ? " is-stop" : "") +
          '"><b>' + item.codon.replace(/T/g, "U") + '</b><small>' + (AA_NAME[item.aa] || "?") +
          "</small></span>").join("") + "</span></div>";
    }
    return '<div class="translation-board" role="img" aria-label="Six translations of DNA sequence ' +
      sequence + '"><div class="sequence-ruler">5′ ' + sequence + " 3′</div>" +
      frames.forward.map((codons, index) => row("+" + (index + 1), codons)).join("") +
      '<div class="sequence-ruler reverse">5′ ' + frames.reverseComplement + " 3′</div>" +
      frames.reverse.map((codons, index) => row("−" + (index + 1), codons)).join("") +
      "</div>";
  }

  function codeSwitchHtml(sequence, standard, mitochondrial, selected) {
    function codonCards(items, code) {
      return items.map((item) => '<div class="codon-card' + (item.aa === "*" ? " is-stop" : "") + '">' +
        '<strong>' + item.codon.replace(/T/g, "U") + '</strong><span>' +
        (AA_NAME[item.aa] || "?") + "</span><small>" + code + "</small></div>").join("");
    }
    const current = selected === "standard" ? standard : mitochondrial;
    return '<div class="code-switch-board" role="img" aria-label="Translation under the ' + selected +
      ' genetic code"><div class="sequence-ruler">5′ ' + sequence.replace(/T/g, "U") +
      ' 3′</div><div class="codon-card-row">' + codonCards(current, selected) +
      '</div><div class="code-difference"><span>standard: ' + standard.map((x) => x.aa).join("–") +
      '</span><span>mitochondrial: ' + mitochondrial.map((x) => x.aa).join("–") +
      "</span></div></div>";
  }

  function mutationBoardHtml(beforeSequence, result, position) {
    function peptide(items) {
      return items.map((item) => AA_NAME[item.aa] || "?").join(" – ");
    }
    const pointer = " ".repeat(position) + "▲";
    return '<div class="mutation-board" role="img" aria-label="Sequence before and after a ' + result.effect +
      ' mutation"><span class="lab-control-label">before</span><code>' + beforeSequence +
      '</code><code class="mutation-pointer">' + pointer + '</code><p>' + peptide(result.before) +
      '</p><span class="lab-control-label">after</span><code class="mutated-line">' + result.mutated +
      '</code><p>' + peptide(result.after) + '</p><strong class="effect-badge">' + result.effect +
      "</strong></div>";
  }

  define("reading-frame-lab", function (api) {
    const { body, el, stat, predict } = api;
    const parts = labParts(el);
    let mode = "mutation";
    let sequence = "ATGGCCATATGATTT";
    let code = "standard";
    let mutation = "insertion";
    let position = 4;
    let alt = "T";

    function render() {
      parts.tabHost.replaceChildren(tabs(el, [
        { label: "Six frames", value: "frames" },
        { label: "Code switch", value: "code" },
        { label: "Mutation consequence", value: "mutation" },
      ], mode, (next) => { mode = next; render(); }));

      if (mode === "frames") {
        const result = translationModel({ kind: "frames", sequence, code });
        parts.visual.innerHTML = frameRowsHtml(sequence, result);
        parts.controls.replaceChildren(
          el("button", {
            class: "btn", type: "button", text: "Use changed sequence fixture",
            onclick: () => {
              sequence = sequence === "ATGGCCATATGATTT" ? "GGGATGAAACCGTAA" : "ATGGCCATATGATTT";
              render();
            },
          }),
          el("div", { class: "readout" }, [
            stat("6", "possible frames"),
            stat(sequence.length + " nt", "sequence length"),
          ])
        );
        parts.rail.replaceChildren(causalRail(el, [
          { key: "you changed", value: "which strand and offset is read" },
          { key: "constraint", value: "no separators; start fixes groups of three" },
          { key: "observable", value: "six different peptide interpretations" },
        ]));
        parts.explanation.className = "callout";
        parts.explanation.innerHTML = "<strong>The frame is not visible in the letters.</strong> " +
          "It is imposed by where initiation occurs. Three offsets on each strand create six interpretations; promoter context, start context and evolutionary conservation identify the biological one.";
        return;
      }

      if (mode === "code") {
        const standard = translateFrame(sequence, 0, "standard");
        const mitochondrial = translateFrame(sequence, 0, "mitochondrial");
        parts.visual.innerHTML = codeSwitchHtml(sequence, standard, mitochondrial, code);
        parts.controls.replaceChildren(
          el("div", { class: "lab-control-block" }, [
            el("span", { class: "lab-control-label", text: "Translation table" }),
            choiceRow(el, [
              { label: "Standard nuclear code", value: "standard" },
              { label: "Vertebrate mitochondrial", value: "mitochondrial" },
            ], code, (value) => { code = value; render(); }, "Genetic code"),
          ]),
          el("div", { class: "readout" }, [
            stat(code === "standard" ? "UGA = Stop" : "UGA = Trp", "UGA meaning"),
            stat(code === "standard" ? "AUA = Ile" : "AUA = Met", "AUA meaning"),
          ])
        );
        parts.rail.replaceChildren(causalRail(el, [
          { key: "you changed", value: code + " translation table" },
          { key: "mechanism", value: "organelle tRNAs decode reassigned codons" },
          { key: "observable", value: (code === "standard" ? standard : mitochondrial).map((x) => x.aa).join("–") },
        ]));
        parts.explanation.className = "callout " + (code === "mitochondrial" ? "callout-bad" : "");
        parts.explanation.innerHTML = "<strong>Near-universal is not universal.</strong> " +
          "For vertebrate mtDNA, AUA encodes Met and UGA encodes Trp, while AGA and AGG are stop signals. Applying the nuclear table can invent a truncation that the mitochondrion never makes.";
        return;
      }

      const result = translationModel({
        kind: "mutation", sequence, frame: 0, code,
        mutation, position, alt,
      });
      parts.visual.innerHTML = mutationBoardHtml(sequence, result, position);
      parts.controls.replaceChildren(
        el("div", { class: "lab-control-block" }, [
          el("span", { class: "lab-control-label", text: "Edit type" }),
          choiceRow(el, [
            { label: "Single-base substitution", value: "substitution" },
            { label: "Insert one base", value: "insertion" },
          ], mutation, (value) => { mutation = value; render(); }, "Mutation type"),
        ]),
        rangeControl(el, "Edit position", position, {
          min: 1, max: sequence.length - 2, step: 1, format: (value) => "base " + (value + 1),
        }, (value) => { position = value; render(); }),
        mutation === "substitution" ? el("div", { class: "lab-control-block" }, [
          el("span", { class: "lab-control-label", text: "Replacement base" }),
          choiceRow(el, ["A", "C", "G", "T"].map((base) => ({ label: base, value: base })),
            alt, (value) => { alt = value; render(); }, "Replacement base"),
        ]) : el("span"),
        el("div", { class: "readout" }, [
          stat(result.effect, "coding consequence"),
          stat(result.after.length + " codons", "downstream grouping shown"),
        ])
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "you changed", value: mutation + " at base " + (position + 1) },
        { key: "mechanism", value: mutation === "insertion" ? "all downstream triplet boundaries shift" : "one codon is replaced" },
        { key: "observable", value: result.effect },
      ]));
      parts.explanation.className = "callout " + (result.effect === "synonymous" ? "" : "callout-bad");
      parts.explanation.innerHTML = result.effect === "frameshift"
        ? "<strong>There is no delimiter at which translation can resynchronise.</strong> A one-base insertion changes every downstream codon until a new stop appears. Insert three bases and the original frame would return."
        : result.effect === "synonymous"
        ? "<strong>The amino acid is unchanged, not necessarily the biology.</strong> Splicing motifs, RNA structure, codon speed and overlapping regulatory information can still change."
        : "<strong>A substitution usually stays local at the code level.</strong> Its severity then depends on the changed amino acid, protein context and any overlapping RNA-level information.";
    }

    predict(body, {
      widget: "reading-frame-lab",
      question: "One nucleotide is inserted near the start of an open reading frame. What happens downstream?",
      hint: "The code has no commas and no automatic resynchronisation marker.",
      options: [
        { label: "Every downstream triplet boundary shifts", correct: true },
        { label: "Only the codon containing the insertion changes" },
        { label: "The ribosome skips the extra nucleotide" },
        { label: "The effect is always synonymous because the code is degenerate" },
      ],
    }, () => {
      parts.instrument.hidden = false;
      render();
    });
    finishLab(parts, body);
  });

  /* Ch 08 — Protein Fate Lab view ----------------------------------------- */

  function proteinSurfaceSvg(site, replacement, result) {
    const residues = [
      [122, 102, "hydrophobic"], [166, 78, "polar"], [214, 104, "hydrophobic"],
      [262, 75, "charged"], [310, 106, "hydrophobic"], [354, 80, "polar"],
      [142, 151, "charged"], [196, 160, "hydrophobic"], [248, 143, "hydrophobic"],
      [302, 160, "polar"], [350, 145, "charged"],
    ];
    const selected = site === "core" ? 8 : site === "surface" ? 6 : 3;
    const dots = residues.map((residue, index) => {
      const type = index === selected ? replacement : residue[2];
      return '<circle class="residue-dot residue-' + type + (index === selected ? " is-edited" : "") +
        '" cx="' + residue[0] + '" cy="' + residue[1] + '" r="18"/><title>' +
        (index === selected ? "edited " : "") + type + " residue</title>";
    }).join("");
    const footerLines = wrapWords(site + " site → " + replacement +
      " · predicted impact " + result.severity, 42);
    const footerY = 228;
    const viewHeight = footerY + footerLines.length * 24 + 8;
    return textSvg(
      svgLines("lab-svg-kicker", 18, 20,
        ["a linear substitution changes", "a three-dimensional surface"], 17) +
      '<path class="protein-outline" d="M85 135 C98 56 176 38 236 65 C294 24 402 67 408 137 ' +
        'C414 201 326 220 264 187 C195 223 101 199 85 135 Z"/>' + dots +
      svgLines("lab-svg-label", 18, footerY, footerLines, 24),
      "Folded protein with an edited " + site + " residue changed to " + replacement +
        ". Predicted impact is " + result.severity + " because " + result.mechanism + ".",
      "0 0 500 " + viewHeight
    );
  }

  function turnoverSvg(result, halfLife, synthesis) {
    const points = [];
    for (let hour = 0; hour <= 24; hour++) {
      const state = proteinFateModel({ kind: "turnover", halfLifeHours: halfLife,
        synthesisPerHour: synthesis, hours: hour });
      const x = 48 + (hour / 24) * 420;
      const y = 194 - (state.amount / Math.max(1, result.steady)) * 135;
      points.push((hour ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1));
    }
    return textSvg(
      svgLines("lab-svg-kicker", 18, 20,
        ["abundance = synthesis", "opposed by degradation"], 17) +
      '<path class="lab-axis" d="M48 194 H470 M48 45 V194"/>' +
      '<path class="turnover-curve" d="' + points.join(" ") + '"/>' +
      '<path class="steady-line" d="M48 59 H470"/>' +
      '<text class="lab-svg-label" x="250" y="242" text-anchor="middle">steady state ' +
        result.steady.toFixed(1) + " molecules</text>" +
      '<text class="lab-svg-label" x="48" y="218">0 h</text><text class="lab-svg-label" x="470" y="218" text-anchor="end">24 h</text>',
      "Protein amount rises toward a steady state of " + result.steady.toFixed(1) +
        " molecules with a half-life of " + halfLife + " hours and synthesis of " +
        synthesis + " molecules per hour.",
      "0 0 500 258"
    );
  }

  function dominantNegativeSvg(result, subunits) {
    const complexes = Array.from({ length: 16 }, (_, index) => {
      const functional = index < Math.round(result.functionalComplexFraction * 16);
      const x = 55 + (index % 8) * 56;
      const y = 82 + Math.floor(index / 8) * 82;
      const pieces = Array.from({ length: subunits }, (_, part) => {
        const angle = (part / subunits) * Math.PI * 2;
        return '<circle class="complex-subunit' + (!functional && part === 0 ? " is-mutant" : "") +
          '" cx="' + (x + Math.cos(angle) * 12).toFixed(1) + '" cy="' +
          (y + Math.sin(angle) * 12).toFixed(1) + '" r="7"/>';
      }).join("");
      return '<g class="protein-complex' + (functional ? " is-functional" : " is-poisoned") + '">' +
        pieces + "</g>";
    }).join("");
    return textSvg(
      '<text class="lab-svg-kicker" x="18" y="22">one mutant subunit can poison a multimer</text>' + complexes +
      svgLines("lab-svg-label", 18, 198,
        ["random assembly · 50% mutant subunits", subunits + " subunits per complex"], 24) +
      svgLines("lab-svg-label", 18, 250,
        ["functional complexes " + (result.functionalComplexFraction * 100).toFixed(1) + "%",
          "versus 50% after a simple deletion"], 24),
      "Sixteen schematic " + subunits + "-subunit protein complexes. " +
        (result.functionalComplexFraction * 100).toFixed(1) +
        " percent are expected to contain only wild-type subunits when half the pool is mutant.",
      "0 0 500 292"
    );
  }

  define("protein-fate-lab", function (api) {
    const { body, el, stat, predict } = api;
    const parts = labParts(el);
    let mode = "dominant";
    let site = "core";
    let replacement = "charged";
    let halfLife = 4;
    let synthesis = 20;
    let hours = 8;
    let subunits = 4;

    function render() {
      parts.tabHost.replaceChildren(tabs(el, [
        { label: "Folded surface", value: "surface" },
        { label: "Turnover", value: "turnover" },
        { label: "Dominant negative", value: "dominant" },
      ], mode, (next) => { mode = next; render(); }));

      if (mode === "surface") {
        const result = proteinFateModel({ kind: "substitution", site, to: replacement });
        parts.visual.innerHTML = proteinSurfaceSvg(site, replacement, result);
        parts.controls.replaceChildren(
          el("div", { class: "paired-controls" }, [
            el("div", { class: "lab-control-block" }, [
              el("span", { class: "lab-control-label", text: "Residue context" }),
              choiceRow(el, [
                { label: "Hydrophobic core", value: "core" },
                { label: "Exposed surface", value: "surface" },
                { label: "α-helix", value: "helix" },
              ], site, (value) => { site = value; render(); }, "Residue context"),
            ]),
            el("div", { class: "lab-control-block" }, [
              el("span", { class: "lab-control-label", text: "Replacement chemistry" }),
              choiceRow(el, [
                { label: "Hydrophobic", value: "hydrophobic" },
                { label: "Polar", value: "polar" },
                { label: "Charged", value: "charged" },
                { label: "Proline", value: "proline" },
              ], replacement, (value) => { replacement = value; render(); }, "Replacement chemistry"),
            ]),
          ]),
          el("div", { class: "readout" }, [
            stat(result.severity, "structural concern"),
            stat(result.mechanism, "most direct mechanism"),
          ])
        );
        parts.rail.replaceChildren(causalRail(el, [
          { key: "you changed", value: site + " residue to " + replacement },
          { key: "mechanism", value: result.mechanism },
          { key: "observable", value: result.severity + " structural concern" },
        ]));
        parts.explanation.className = "callout " + (result.severity === "high" ? "callout-bad" : "");
        parts.explanation.innerHTML = "<strong>Amino-acid identity is not enough; location supplies the mechanism.</strong> " +
          "The same charged replacement may be tolerated on a solvent-exposed surface and strongly destabilising in a hydrophobic core.";
        return;
      }

      if (mode === "turnover") {
        const result = proteinFateModel({
          kind: "turnover", halfLifeHours: halfLife, synthesisPerHour: synthesis, hours,
        });
        parts.visual.innerHTML = turnoverSvg(result, halfLife, synthesis);
        parts.controls.replaceChildren(
          rangeControl(el, "Synthesis rate", synthesis, {
            min: 1, max: 50, step: 1, format: (value) => value + " molecules/h",
          }, (value) => { synthesis = value; render(); }),
          rangeControl(el, "Protein half-life", halfLife, {
            min: 0.5, max: 12, step: 0.5, format: (value) => value.toFixed(1) + " h",
          }, (value) => { halfLife = value; render(); }),
          rangeControl(el, "Time since synthesis began", hours, {
            min: 0, max: 24, step: 1, format: (value) => value + " h",
          }, (value) => { hours = value; render(); }),
          el("div", { class: "readout" }, [
            stat(result.amount.toFixed(1), "molecules now"),
            stat(result.steady.toFixed(1), "steady-state level"),
            stat(halfLife.toFixed(1) + " h", "response half-time"),
          ])
        );
        parts.rail.replaceChildren(causalRail(el, [
          { key: "you changed", value: "half-life to " + halfLife.toFixed(1) + " h" },
          { key: "mechanism", value: "degradation opposes constant synthesis" },
          { key: "observable", value: "level and response time change together" },
        ]));
        parts.explanation.className = "callout";
        parts.explanation.innerHTML = "<strong>Stability buys abundance at the cost of responsiveness.</strong> " +
          "At fixed synthesis, a longer half-life raises the steady state but makes the protein slower to clear when conditions change.";
        return;
      }

      const result = proteinFateModel({
        kind: "dominantNegative", mutantFraction: 0.5, subunits,
      });
      parts.visual.innerHTML = dominantNegativeSvg(result, subunits);
      parts.controls.replaceChildren(
        rangeControl(el, "Subunits per functional complex", subunits, {
          min: 2, max: 6, step: 1, format: (value) => value + " subunits",
        }, (value) => { subunits = value; render(); }),
        el("div", { class: "readout" }, [
          stat((result.deletionOutputFraction * 100).toFixed(0) + "%", "simple deletion output"),
          stat((result.functionalComplexFraction * 100).toFixed(1) + "%", "dominant-negative output"),
        ])
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "you changed", value: "complex size to " + subunits },
        { key: "mechanism", value: "one mutant subunit poisons the assembled complex" },
        { key: "observable", value: (result.functionalComplexFraction * 100).toFixed(1) + "% fully wild-type complexes" },
      ]));
      parts.explanation.className = "callout callout-bad";
      parts.explanation.innerHTML = "<strong>A missense allele can be worse than no allele.</strong> " +
        "The 0.5<sup>n</sup> calculation assumes random assembly and complete poisoning by any mutant subunit. Real proteins differ, but this is the causal signature of a dominant-negative mechanism.";
    }

    predict(body, {
      widget: "protein-fate-lab",
      question: "Why can one missense allele be more severe than deletion of that same copy in a multimeric protein?",
      hint: "Ask whether the altered product merely fails to work or enters complexes made by the normal allele.",
      options: [
        { label: "Its product can poison complexes containing normal subunits", correct: true },
        { label: "Missense variants always make more protein" },
        { label: "A deletion necessarily increases transcription" },
        { label: "Multimeric proteins ignore dosage" },
      ],
    }, () => {
      parts.instrument.hidden = false;
      render();
    });
    finishLab(parts, body);
  });

  /* S1 — Probability Workbench view --------------------------------------- */

  function crossGridHtml(parent1, parent2, result) {
    const gametes = { AA: ["A"], Aa: ["A", "a"], aa: ["a"] };
    const left = gametes[parent1];
    const right = gametes[parent2];
    const cells = [];
    left.forEach((a) => right.forEach((b) => {
      const genotype = [a, b].sort((x, y) => x === y ? 0 : x === "A" ? -1 : 1).join("");
      cells.push('<div class="sample-cell"><span>' + a + " × " + b + "</span><strong>" +
        genotype + "</strong><small>1 / " + result.outcomes.length + "</small></div>");
    }));
    return '<div class="sample-space" role="img" aria-label="Explicit sample space for ' + parent1 +
      " by " + parent2 + '"><div class="sample-space-head"><span>parent 1 gamete</span>' +
      '<span>parent 2 gamete</span><span>offspring</span></div><div class="sample-cell-grid">' +
      cells.join("") + '</div><div class="event-sums">' +
      Object.entries(result.probabilities).map(([genotype, probability]) =>
        '<span><b>' + genotype + "</b> " + (probability * 100).toFixed(0) + "%</span>"
      ).join("") + "</div></div>";
  }

  function bayesTableHtml(model, population, prevalence, sensitivity, specificity) {
    const negative = population * (1 - prevalence) * specificity;
    const falseNegative = population * prevalence * (1 - sensitivity);
    function cell(kind, label, value) {
      return '<div class="bayes-cell ' + kind + '"><span>' + label + "</span><strong>" +
        formatNumber(value, 1) + "</strong></div>";
    }
    return '<div class="bayes-board" role="img" aria-label="Expected testing outcomes in ' +
      formatNumber(population, 0) + ' people"><div class="bayes-axis disease">condition present</div>' +
      '<div class="bayes-axis healthy">condition absent</div><div class="bayes-axis positive">test positive</div>' +
      '<div class="bayes-axis negative">test negative</div>' +
      cell("true-positive", "true positive", model.truePositive) +
      cell("false-positive", "false positive", model.falsePositive) +
      cell("false-negative", "false negative", falseNegative) +
      cell("true-negative", "true negative", negative) +
      '<div class="bayes-posterior">Among positive tests: <strong>' +
        (model.positivePredictiveValue * 100).toFixed(2) + "% truly affected</strong></div></div>";
  }

  function familyHistogramSvg(successes, children, p) {
    const counts = Array(children + 1).fill(0);
    successes.forEach((value) => { counts[value] += 1; });
    const max = Math.max(...counts);
    const bars = counts.map((count, index) => {
      const width = 340 / counts.length;
      const x = 70 + index * width;
      const height = (count / max) * 130;
      return '<rect class="distribution-bar" x="' + (x + 5).toFixed(1) + '" y="' +
        (190 - height).toFixed(1) + '" width="' + (width - 10).toFixed(1) + '" height="' +
        height.toFixed(1) + '"/><text class="distribution-x" x="' +
        (x + width / 2).toFixed(1) + '" y="211" text-anchor="middle">' + index + "</text>";
    }).join("");
    return textSvg(
      svgLines("lab-svg-kicker", 18, 22,
        ["500 families · fixed seed", "probability is not a quota"], 22) +
      '<path class="lab-axis" d="M70 190 H410 M70 50 V190"/>' + bars +
      svgLines("lab-svg-label", 18, 234,
        ["affected children in a " + children + "-child family",
          "p = " + p.toFixed(2) + " independently for each child"], 22),
      "Histogram of affected-child counts across 500 simulated families, each with " +
        children + " children and independent probability " + p.toFixed(2) + ".",
      "0 0 480 276"
    );
  }

  define("probability-workbench", function (api) {
    const { body, el, stat, predict } = api;
    const parts = labParts(el);
    let mode = "bayes";
    let parent1 = "Aa";
    let parent2 = "Aa";
    let prevalenceLog = -4;
    let sensitivity = 0.99;
    let specificity = 0.99;
    let children = 4;
    let childRisk = 0.25;
    const population = 100000;

    function render() {
      parts.tabHost.replaceChildren(tabs(el, [
        { label: "Sample space", value: "cross" },
        { label: "Base-rate test", value: "bayes" },
        { label: "Repeated families", value: "families" },
      ], mode, (next) => { mode = next; render(); }));

      if (mode === "cross") {
        const result = probabilityModel({ kind: "cross", parent1, parent2 });
        parts.visual.innerHTML = crossGridHtml(parent1, parent2, result);
        parts.controls.replaceChildren(
          el("div", { class: "paired-controls" }, [
            el("div", { class: "lab-control-block" }, [
              el("span", { class: "lab-control-label", text: "Parent 1" }),
              choiceRow(el, ["AA", "Aa", "aa"].map((value) => ({ label: value, value })),
                parent1, (value) => { parent1 = value; render(); }, "Parent 1 genotype"),
            ]),
            el("div", { class: "lab-control-block" }, [
              el("span", { class: "lab-control-label", text: "Parent 2" }),
              choiceRow(el, ["AA", "Aa", "aa"].map((value) => ({ label: value, value })),
                parent2, (value) => { parent2 = value; render(); }, "Parent 2 genotype"),
            ]),
          ]),
          el("div", { class: "readout" }, Object.entries(result.probabilities).map(([genotype, probability]) =>
            stat((probability * 100).toFixed(0) + "%", genotype)
          ))
        );
        parts.rail.replaceChildren(causalRail(el, [
          { key: "you changed", value: parent1 + " × " + parent2 },
          { key: "mechanism", value: "each meiosis emits one listed gamete" },
          { key: "observable", value: "event probability is the sum of matching cells" },
        ]));
        parts.explanation.className = "callout";
        parts.explanation.innerHTML = "<strong>A Punnett square is an explicit probability dictionary.</strong> " +
          "Each equally likely gamete pair is one outcome. Multiply along independent choices; sum across different outcomes that satisfy the event.";
        return;
      }

      if (mode === "bayes") {
        const prevalence = 10 ** prevalenceLog;
        const result = probabilityModel({
          kind: "bayesTest", population, prevalence, sensitivity, specificity,
        });
        parts.visual.innerHTML = bayesTableHtml(result, population, prevalence, sensitivity, specificity);
        parts.controls.replaceChildren(
          rangeControl(el, "Prevalence", prevalenceLog, {
            min: -4, max: -1, step: 0.1,
            format: (value) => (100 * 10 ** value).toFixed(value < -2 ? 3 : 1) + "%",
          }, (value) => { prevalenceLog = value; render(); }),
          rangeControl(el, "Sensitivity", sensitivity, {
            min: 0.9, max: 1, step: 0.001,
            format: (value) => (value * 100).toFixed(1) + "%",
          }, (value) => { sensitivity = value; render(); }),
          rangeControl(el, "Specificity", specificity, {
            min: 0.9, max: 0.9999, step: 0.0001,
            format: (value) => (value * 100).toFixed(2) + "%",
          }, (value) => { specificity = value; render(); }),
          el("div", { class: "readout" }, [
            stat(formatNumber(result.truePositive, 1), "true positives"),
            stat(formatNumber(result.falsePositive, 1), "false positives"),
            stat((result.positivePredictiveValue * 100).toFixed(2) + "%", "P(condition | positive)"),
          ])
        );
        parts.rail.replaceChildren(causalRail(el, [
          { key: "you changed", value: "base rate to " + (prevalence * 100).toFixed(3) + "%" },
          { key: "mechanism", value: "false positives arise from the much larger unaffected group" },
          { key: "observable", value: (result.positivePredictiveValue * 100).toFixed(2) + "% PPV" },
        ]));
        parts.explanation.className = "callout " +
          (result.positivePredictiveValue < 0.5 ? "callout-bad" : "callout-good");
        parts.explanation.innerHTML = "<strong>Sensitivity answers P(positive | condition), not P(condition | positive).</strong> " +
          "The latter needs the prevalence and specificity. At a rare base rate, even a small false-positive fraction can outnumber all true cases.";
        return;
      }

      const result = probabilityModel({
        kind: "simulate", seed: 4101, families: 500, children, p: childRisk,
      });
      const mean = result.successes.reduce((sum, value) => sum + value, 0) / result.successes.length;
      parts.visual.innerHTML = familyHistogramSvg(result.successes, children, childRisk);
      parts.controls.replaceChildren(
        rangeControl(el, "Children per family", children, {
          min: 1, max: 8, step: 1, format: (value) => value + " children",
        }, (value) => { children = value; render(); }),
        rangeControl(el, "Risk for each child", childRisk, {
          min: 0.05, max: 0.5, step: 0.05, format: (value) => (value * 100).toFixed(0) + "%",
        }, (value) => { childRisk = value; render(); }),
        el("div", { class: "readout" }, [
          stat((children * childRisk).toFixed(2), "expected affected / family"),
          stat(mean.toFixed(2), "fixed-seed simulated mean"),
        ])
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "you changed", value: children + " independent children at p=" + childRisk.toFixed(2) },
        { key: "mechanism", value: "each family samples the same binomial process" },
        { key: "observable", value: "families vary around expectation" },
      ]));
      parts.explanation.className = "callout";
      parts.explanation.innerHTML = "<strong>A 25% risk does not promise one affected child in every four.</strong> " +
        "It describes a long-run sampling process. The seed is held fixed so counterfactual changes compare the same underlying random draws.";
    }

    predict(body, {
      widget: "probability-workbench",
      question: "A condition affects 1 in 10,000 people. A test is 99% sensitive and 99% specific. Is a positive result about 99% likely to be a true case?",
      hint: "Lay out expected true and false positives in a large population.",
      options: [
        { label: "No — false positives vastly outnumber the rare true cases", correct: true },
        { label: "Yes — sensitivity is the posterior probability" },
        { label: "Yes — sensitivity and specificity can simply be averaged" },
        { label: "It is unknowable even if prevalence is given" },
      ],
    }, () => {
      parts.instrument.hidden = false;
      render();
    });
    finishLab(parts, body);
  });

  /* S2 — Distribution Zoo view -------------------------------------------- */

  function distributionSvg(kind, result, story) {
    const points = result.points;
    const maximumP = Math.max(...points.map((point) => point.p));
    const left = 54;
    const right = 470;
    const baseline = 202;
    const top = 52;
    let marks = "";
    if (kind === "normal") {
      const path = points.map((point, index) => {
        const x = left + (index / (points.length - 1)) * (right - left);
        const y = baseline - (point.p / maximumP) * (baseline - top);
        return (index ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1);
      }).join(" ");
      marks = '<path class="distribution-curve" d="' + path + '"/>';
    } else {
      const visible = points.length > 70 ? points.filter((_, index) => index % 2 === 0) : points;
      const width = (right - left) / visible.length;
      marks = visible.map((point, index) => {
        const height = (point.p / maximumP) * (baseline - top);
        const x = left + index * width;
        return '<rect class="distribution-bar" x="' + (x + 1).toFixed(1) + '" y="' +
          (baseline - height).toFixed(1) + '" width="' + Math.max(2, width - 2).toFixed(1) +
          '" height="' + height.toFixed(1) + '"/>';
      }).join("");
    }
    const minX = points[0].x;
    const maxX = points[points.length - 1].x;
    const storyLines = {
      binomial: ["fixed independent trials", "count successes"],
      poisson: ["constant-rate rare arrivals", "count per window"],
      negativeBinomial: ["count arrivals while", "the biological rate varies"],
      normal: ["sum many small approximately", "independent effects"],
    }[kind];
    return textSvg(
      svgLines("lab-svg-kicker", 18, 20, storyLines, 17) +
      '<path class="lab-axis" d="M54 202 H470 M54 45 V202"/>' + marks +
      '<text class="lab-svg-label" x="54" y="224">' + formatNumber(minX, 1) + "</text>" +
      '<text class="lab-svg-label" x="470" y="224" text-anchor="end">' + formatNumber(maxX, 1) + "</text>" +
      '<text class="lab-svg-label" x="18" y="248">mean ' + formatNumber(result.mean, 2) +
        " · variance " + formatNumber(result.variance, 2) + "</text>",
      story + ". Distribution mean " + formatNumber(result.mean, 2) +
        " and variance " + formatNumber(result.variance, 2) + ".",
      "0 0 500 265"
    );
  }

  define("distribution-zoo", function (api) {
    const { body, el, stat, predict } = api;
    const parts = labParts(el);
    let kind = "negativeBinomial";
    let n = 4;
    let p = 0.25;
    let lambda = 6;
    let mean = 12;
    let dispersion = 3;
    let normalMean = 100;
    let sd = 15;
    const stories = {
      binomial: "fixed independent trials · count successes",
      poisson: "constant-rate rare arrivals · count per window",
      negativeBinomial: "count arrivals while the biological rate varies",
      normal: "sum many small approximately independent effects",
    };

    function render() {
      parts.tabHost.replaceChildren(tabs(el, [
        { label: "Binomial family", value: "binomial" },
        { label: "Poisson coverage", value: "poisson" },
        { label: "Negative-binomial counts", value: "negativeBinomial" },
        { label: "Normal trait", value: "normal" },
      ], kind, (next) => { kind = next; render(); }));

      let result;
      if (kind === "binomial") {
        result = distributionModel({ kind, n, p });
        parts.controls.replaceChildren(
          rangeControl(el, "Independent trials n", n, {
            min: 1, max: 20, step: 1, format: (value) => String(value),
          }, (value) => { n = value; render(); }),
          rangeControl(el, "Success probability p", p, {
            min: 0.05, max: 0.95, step: 0.05, format: (value) => value.toFixed(2),
          }, (value) => { p = value; render(); })
        );
      } else if (kind === "poisson") {
        result = distributionModel({ kind, lambda });
        parts.controls.replaceChildren(
          rangeControl(el, "Mean coverage λ", lambda, {
            min: 0.5, max: 20, step: 0.5, format: (value) => value.toFixed(1) + "×",
          }, (value) => { lambda = value; render(); })
        );
      } else if (kind === "negativeBinomial") {
        result = distributionModel({ kind, mean, dispersion });
        parts.controls.replaceChildren(
          rangeControl(el, "Mean count μ", mean, {
            min: 2, max: 40, step: 1, format: (value) => String(value),
          }, (value) => { mean = value; render(); }),
          rangeControl(el, "Dispersion size k", dispersion, {
            min: 0.5, max: 20, step: 0.5, format: (value) => value.toFixed(1),
          }, (value) => { dispersion = value; render(); })
        );
      } else {
        result = distributionModel({ kind, mean: normalMean, sd });
        parts.controls.replaceChildren(
          rangeControl(el, "Trait mean", normalMean, {
            min: 50, max: 150, step: 5, format: (value) => String(value),
          }, (value) => { normalMean = value; render(); }),
          rangeControl(el, "Standard deviation", sd, {
            min: 5, max: 30, step: 1, format: (value) => String(value),
          }, (value) => { sd = value; render(); })
        );
      }

      parts.visual.innerHTML = distributionSvg(kind, result, stories[kind]);
      const extraStats = kind === "poisson"
        ? [stat((result.zero * 100).toFixed(2) + "%", "expected zero-coverage fraction")]
        : kind === "negativeBinomial"
        ? [stat((result.variance / result.mean).toFixed(2) + "×", "variance / mean")]
        : [];
      parts.controls.append(el("div", { class: "readout" }, [
        stat(formatNumber(result.mean, 2), "mean"),
        stat(formatNumber(result.variance, 2), "variance"),
        ...extraStats,
      ]));
      const causal = {
        binomial: ["n and p", "fixed independent trials", "success-count distribution"],
        poisson: ["constant mean rate λ", "rare arrivals occur independently", "mean = variance; P(0)=e⁻λ"],
        negativeBinomial: ["mean and dispersion", "the underlying rate varies", "variance exceeds the mean"],
        normal: ["mean and spread", "many small effects add", "approximately bell-shaped total"],
      }[kind];
      parts.rail.replaceChildren(causalRail(el, [
        { key: "you changed", value: causal[0] },
        { key: "generating process", value: causal[1] },
        { key: "observable", value: causal[2] },
      ]));
      parts.explanation.className = "callout " +
        (kind === "negativeBinomial" && result.variance > result.mean ? "callout-good" : "");
      parts.explanation.innerHTML = kind === "binomial"
        ? "<strong>Fixed n, fixed p, independent tries.</strong> That sentence is the model. Family composition and allele counts fit only when those assumptions are defensible."
        : kind === "poisson"
        ? "<strong>Poisson says the rate is constant across the window.</strong> Mean equals variance and P(0)=e<sup>−λ</sup>. GC bias and duplicates violate that constant-rate claim."
        : kind === "negativeBinomial"
        ? "<strong>Biological rates vary.</strong> Mixing Poisson-like counts drawn at different underlying rates makes variance exceed the mean. The negative binomial represents that overdispersion; larger k approaches Poisson."
        : "<strong>Normality comes from addition, not from ‘continuous data’.</strong> A trait influenced by many small effects can be approximately normal even when none of its causes is normal.";
    }

    predict(body, {
      widget: "distribution-zoo",
      question: "Biological replicate RNA-seq counts have variance far larger than their mean because the underlying expression rate varies. Which model matches that generating process?",
      hint: "Poisson requires one constant rate and therefore variance = mean.",
      options: [
        { label: "Negative binomial", correct: true },
        { label: "Poisson" },
        { label: "Bernoulli" },
        { label: "Uniform" },
      ],
    }, () => {
      parts.instrument.hidden = false;
      render();
    });
    finishLab(parts, body);
  });

  // Keeping the export at the end ensures all labs are visible to widgets.js
  // before it builds the registry.

  global.ReaderInteractionDefinitions = Object.assign(
    global.ReaderInteractionDefinitions || {}, definitions
  );
  global.ReaderInteractionModels = Object.assign(
    global.ReaderInteractionModels || {}, models
  );
})(window);
