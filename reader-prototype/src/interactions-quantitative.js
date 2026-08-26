/* ── Sampling and quantitative-genetics interaction wave ────────────────
   Objective-mapped Hero Labs for S3 and Chapters 30–32. Each instrument
   keeps the quantity being inferred visible: repeated samples orbit a fixed
   truth, genotypic classes are projected onto a breeding-value regression,
   selection writes a trajectory across generations, and QTL evidence sits on
   the chromosome whose recombination history created it. Scientific models
   are pure and seeded where stochastic fixtures are useful.
   ───────────────────────────────────────────────────────────────────────── */

(function (global) {
  "use strict";

  const definitions = {};
  const models = {};
  const coverage = {};
  const kit = global.ReaderInteractionKit;
  if (!kit) throw new Error("ReaderInteractionKit must load before quantitative-genetics labs");

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

  function mean(values) {
    return values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length);
  }

  function variance(values, sample) {
    if (values.length < 2) return 0;
    const centre = mean(values);
    return values.reduce((sum, value) => sum + Math.pow(value - centre, 2), 0) /
      (sample ? values.length - 1 : values.length);
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
      instrument: el("div", { class: "hero-lab quantitative-lab", hidden: true }),
      tabHost: el("div"),
      visual: el("div", { class: "lab-visual quantitative-visual" }),
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
      class: "pop-status-strip",
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
      class: "pop-process",
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
      class: "pop-bars",
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

  function textSvg(html, label, viewBox, extraClass) {
    return '<svg class="lab-diagram quantitative-diagram ' + (extraClass || "") +
      '" viewBox="' + (viewBox || "0 0 520 310") + '" role="img" aria-label="' +
      label.replace(/"/g, "&quot;") + '">' + html + "</svg>";
  }

  function linePath(points, xScale, yScale) {
    return points.map((point, index) => (index ? "L" : "M") +
      xScale(point.x).toFixed(2) + " " + yScale(point.y).toFixed(2)).join(" ");
  }

  function mulberry32(seed) {
    let state = seed >>> 0;
    return function random() {
      state += 0x6D2B79F5;
      let value = state;
      value = Math.imul(value ^ (value >>> 15), value | 1);
      value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
      return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    };
  }

  function normalRandom(random) {
    const u = Math.max(1e-12, random());
    const v = Math.max(1e-12, random());
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  function binomialDraw(n, probability, random) {
    let count = 0;
    for (let index = 0; index < n; index += 1) {
      if (random() < probability) count += 1;
    }
    return count;
  }

  function normalPdf(value) {
    return Math.exp(-0.5 * value * value) / Math.sqrt(2 * Math.PI);
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

  function inverseNormal(probability) {
    const p = clamp(probability, 1e-12, 1 - 1e-12);
    const a = [-39.6968302866538, 220.946098424521, -275.928510446969,
      138.357751867269, -30.6647980661472, 2.50662827745924];
    const b = [-54.4760987982241, 161.585836858041, -155.698979859887,
      66.8013118877197, -13.2806815528857];
    const c = [-0.00778489400243029, -0.322396458041136, -2.40075827716184,
      -2.54973253934373, 4.37466414146497, 2.93816398269878];
    const d = [0.00778469570904146, 0.32246712907004, 2.445134137143,
      3.75440866190742];
    const low = 0.02425;
    const high = 1 - low;
    let q;
    let r;
    if (p < low) {
      q = Math.sqrt(-2 * Math.log(p));
      return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
        ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
    }
    if (p > high) {
      q = Math.sqrt(-2 * Math.log(1 - p));
      return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
        ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
    }
    q = p - 0.5;
    r = q * q;
    return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  }

  function binomialProbabilities(n, probability) {
    if (probability <= 0) return Array.from({ length: n + 1 }, (_, index) => index === 0 ? 1 : 0);
    if (probability >= 1) return Array.from({ length: n + 1 }, (_, index) => index === n ? 1 : 0);
    const weights = new Array(n + 1).fill(0);
    const mode = Math.floor((n + 1) * probability);
    weights[mode] = 1;
    for (let x = mode; x > 0; x -= 1) {
      weights[x - 1] = weights[x] * x / (n - x + 1) * (1 - probability) / probability;
    }
    for (let x = mode; x < n; x += 1) {
      weights[x + 1] = weights[x] * (n - x) / (x + 1) * probability / (1 - probability);
    }
    const total = weights.reduce((sum, value) => sum + value, 0);
    return weights.map((value) => value / total);
  }

  function wilsonInterval(successes, trials, z) {
    const level = z || 1.96;
    if (!trials) return { low: 0, high: 1 };
    const p = successes / trials;
    const denominator = 1 + level * level / trials;
    const centre = (p + level * level / (2 * trials)) / denominator;
    const half = level / denominator * Math.sqrt(p * (1 - p) / trials +
      level * level / (4 * trials * trials));
    return { low: clamp(centre - half, 0, 1), high: clamp(centre + half, 0, 1) };
  }

  function samplingEstimationModel(input) {
    if (input.kind === "sampling") {
      const targetP = clamp(input.targetP, 0.0001, 0.9999);
      const frameP = clamp(input.frameP == null ? targetP : input.frameP, 0.0001, 0.9999);
      const n = Math.max(2, Math.round(input.n));
      const replicates = Math.max(5, Math.round(input.replicates || 40));
      const random = mulberry32(input.seed || 1);
      const estimates = [];
      for (let index = 0; index < replicates; index += 1) {
        estimates.push(binomialDraw(2 * n, frameP, random) / (2 * n));
      }
      return {
        targetP, frameP, n, estimates,
        estimateMean: mean(estimates),
        empiricalSe: Math.sqrt(variance(estimates, true)),
        formulaSe: Math.sqrt(frameP * (1 - frameP) / (2 * n)),
        genotypeSd: Math.sqrt(2 * frameP * (1 - frameP)),
        bias: frameP - targetP,
      };
    }

    if (input.kind === "heterozygosity") {
      const p = clamp(input.p, 0.001, 0.999);
      const n = Math.max(2, Math.round(input.n));
      const truth = 2 * p * (1 - p);
      const naiveExpectation = truth * (1 - 1 / (2 * n));
      const correction = 2 * n / (2 * n - 1);
      return {
        p, n, truth, naiveExpectation, correction,
        correctedExpectation: naiveExpectation * correction,
        naiveBias: naiveExpectation - truth,
      };
    }

    if (input.kind === "varianceEstimators") {
      const n = Math.max(3, Math.round(input.n));
      const truth = input.truth == null ? 4 : Math.max(1e-9, input.truth);
      const ssDf = n - 1;
      const rows = [n - 1, n, n + 1].map((divisor) => {
        const expected = truth * ssDf / divisor;
        const estimatorVariance = 2 * truth * truth * ssDf / (divisor * divisor);
        const bias = expected - truth;
        return { divisor, expected, bias, variance: estimatorVariance, mse: bias * bias + estimatorVariance };
      });
      return { n, truth, rows };
    }

    if (input.kind === "coverage") {
      const p = clamp(input.p, 1e-6, 1 - 1e-6);
      const n = Math.max(2, Math.round(input.n));
      const trials = 2 * n;
      const probabilities = binomialProbabilities(trials, p);
      let waldCoverage = 0;
      let wilsonCoverage = 0;
      probabilities.forEach((probability, successes) => {
        const observed = successes / trials;
        const se = Math.sqrt(observed * (1 - observed) / trials);
        const wald = { low: observed - 1.96 * se, high: observed + 1.96 * se };
        const wilson = wilsonInterval(successes, trials, 1.96);
        if (wald.low <= p && p <= wald.high) waldCoverage += probability;
        if (wilson.low <= p && p <= wilson.high) wilsonCoverage += probability;
      });
      const expectedCopies = trials * p;
      return {
        p, n, trials, probabilities, waldCoverage, wilsonCoverage,
        zeroProbability: Math.pow(1 - p, trials),
        expectedCopies,
        relativeSe: Math.sqrt((1 - p) / Math.max(1e-12, trials * p)),
        ruleOfThree: 3 / trials,
      };
    }

    if (input.kind === "bootstrap") {
      const unit = input.unit || "people";
      const blockLength = Math.max(1, Math.round(input.blockLength || 50));
      const blockFixtures = [
        { length: 1, se: 0.00149 },
        { length: 10, se: 0.00299 },
        { length: 50, se: 0.00463 },
        { length: 200, se: 0.00519 },
      ];
      let se;
      if (unit === "people") se = 0.00234;
      else if (unit === "both") se = 0.00284;
      else if (unit === "snps") se = 0.00150;
      else {
        const upperIndex = blockFixtures.findIndex((row) => row.length >= blockLength);
        if (upperIndex <= 0) se = blockFixtures[0].se;
        else if (upperIndex < 0) se = blockFixtures[blockFixtures.length - 1].se;
        else {
          const low = blockFixtures[upperIndex - 1];
          const high = blockFixtures[upperIndex];
          const weight = (Math.log(blockLength) - Math.log(low.length)) /
            (Math.log(high.length) - Math.log(low.length));
          se = low.se + weight * (high.se - low.se);
        }
      }
      const estimate = 0.0647658;
      return {
        unit, blockLength, estimate, se,
        low: estimate - 1.96 * se,
        high: estimate + 1.96 * se,
        question: unit === "people" ? "different recruited people"
          : unit === "both" ? "different people and genomic region"
            : unit === "block" ? "a different set of linked genomic blocks"
              : "a different set of SNPs treated as independent",
      };
    }

    if (input.kind === "bias") {
      const truth = clamp(input.p == null ? 0.4205 : input.p, 0.001, 0.999);
      const dropout = clamp(input.dropout == null ? 0.05 : input.dropout, 0, 1);
      const n = Math.max(5, Math.round(input.n));
      const biasedMean = truth - dropout * truth * (1 - truth);
      const se = Math.sqrt(biasedMean * (1 - biasedMean) / (2 * n));
      const coverage = normalCdf((truth + 1.96 * se - biasedMean) / se) -
        normalCdf((truth - 1.96 * se - biasedMean) / se);
      return {
        truth, dropout, n, biasedMean, bias: biasedMean - truth, se,
        intervalWidth: 3.92 * se, coverage: clamp(coverage, 0, 1),
      };
    }

    throw new Error("Unknown sampling-estimation model");
  }
  models.samplingEstimation = samplingEstimationModel;

  function binomialClasses(trials, probability) {
    return binomialProbabilities(trials, probability).map((frequency, copies) => ({ copies, frequency }));
  }

  function quantitativeTraitsModel(input) {
    if (input.kind === "polygenic") {
      const loci = Math.max(1, Math.round(input.loci));
      const p = clamp(input.p == null ? 0.5 : input.p, 0.01, 0.99);
      const environmentSd = Math.max(0.08, input.environmentSd);
      const span = input.span == null ? 6 : Math.max(0.5, input.span);
      const classes = binomialClasses(2 * loci, p).map((row) => ({
        copies: row.copies,
        frequency: row.frequency,
        value: -span / 2 + span * row.copies / (2 * loci),
      }));
      const curve = [];
      for (let index = 0; index <= 100; index += 1) {
        const x = -span / 2 - 3 * environmentSd +
          index / 100 * (span + 6 * environmentSd);
        const density = classes.reduce((sum, row) => sum + row.frequency *
          normalPdf((x - row.value) / environmentSd) / environmentSd, 0);
        curve.push({ x, y: density });
      }
      return {
        loci, p, environmentSd, span, classes, curve,
        geneticMean: 2 * loci * p,
        geneticVariance: 2 * loci * p * (1 - p) * Math.pow(span / (2 * loci), 2),
        extremeFrequency: Math.pow(p, 2 * loci),
      };
    }

    if (input.kind === "liability") {
      const prevalence = clamp(input.prevalence, 0.0001, 0.49);
      const caseFraction = clamp(input.caseFraction, 0.01, 0.99);
      const observedH2 = clamp(input.observedH2, 0, 1);
      const threshold = inverseNormal(1 - prevalence);
      const density = normalPdf(threshold);
      const meanAffected = density / prevalence;
      const conversion = Math.pow(prevalence * (1 - prevalence), 2) /
        (caseFraction * (1 - caseFraction) * density * density);
      return {
        prevalence, caseFraction, observedH2, threshold, density, meanAffected,
        conversion, liabilityH2: observedH2 * conversion,
      };
    }

    if (input.kind === "variance") {
      const vg = Math.max(0, input.vg);
      const ve = Math.max(0, input.ve);
      const rho = clamp(input.rho, -0.95, 0.95);
      const gxe = Math.max(0, input.gxe);
      const covariance = rho * Math.sqrt(vg * ve);
      const vp = Math.max(1e-9, vg + ve + 2 * covariance + gxe);
      return { vg, ve, rho, gxe, covariance, vp };
    }

    if (input.kind === "locus") {
      const p = clamp(input.p, 0.001, 0.999);
      const q = 1 - p;
      const a = input.a;
      const d = input.d;
      const populationMean = a * (p - q) + 2 * p * q * d;
      const alpha = a + d * (q - p);
      const va = 2 * p * q * alpha * alpha;
      const vd = Math.pow(2 * p * q * d, 2);
      const genotypes = [
        { label: "A₂A₂", count: 0, frequency: q * q, value: -a },
        { label: "A₁A₂", count: 1, frequency: 2 * p * q, value: d },
        { label: "A₁A₁", count: 2, frequency: p * p, value: a },
      ].map((row) => {
        const breeding = alpha * (row.count - 2 * p);
        return Object.assign(row, {
          breeding,
          dominance: row.value - populationMean - breeding,
          fitted: populationMean + breeding,
        });
      });
      const vg = genotypes.reduce((sum, row) => sum + row.frequency *
        Math.pow(row.value - populationMean, 2), 0);
      return { p, q, a, d, populationMean, alpha, va, vd, vg, genotypes };
    }

    if (input.kind === "correlation") {
      const frequencies = [0.5, 0.25];
      const effectsX = [1, 0.7];
      const effectsY = [input.y1, input.y2];
      const weights = frequencies.map((p) => 2 * p * (1 - p));
      const contributions = weights.map((weight, index) => ({
        locus: index + 1,
        p: frequencies[index],
        weight,
        x: effectsX[index],
        y: effectsY[index],
        covariance: weight * effectsX[index] * effectsY[index],
      }));
      const covA = contributions.reduce((sum, row) => sum + row.covariance, 0);
      const vaX = contributions.reduce((sum, row) => sum + row.weight * row.x * row.x, 0);
      const vaY = contributions.reduce((sum, row) => sum + row.weight * row.y * row.y, 0);
      const rG = covA / Math.sqrt(Math.max(1e-12, vaX * vaY));
      const veX = 1;
      const veY = 1;
      const environmentalCovariance = input.environmentalCorrelation * Math.sqrt(veX * veY);
      const rP = (covA + environmentalCovariance) /
        Math.sqrt((vaX + veX) * (vaY + veY));
      return { contributions, covA, vaX, vaY, veX, veY, rG, rP, environmentalCovariance };
    }

    if (input.kind === "relatives") {
      const fixtures = {
        parent: { label: "parent–offspring", r: 0.5, u: 0, k: [0, 1, 0] },
        fullSibs: { label: "full sibs", r: 0.5, u: 0.25, k: [0.25, 0.5, 0.25] },
        halfSibs: { label: "half sibs", r: 0.25, u: 0, k: [0.5, 0.5, 0] },
        mz: { label: "MZ twins", r: 1, u: 1, k: [0, 0, 1] },
        cousins: { label: "first cousins", r: 0.125, u: 0, k: [0.875, 0.125, 0] },
      };
      const fixture = fixtures[input.relationship] || fixtures.parent;
      const additive = fixture.r * input.va;
      const dominance = fixture.u * input.vd;
      const epistatic = fixture.r * fixture.r * input.vaa;
      return {
        fixture, additive, dominance, epistatic,
        covariance: additive + dominance + epistatic,
      };
    }

    throw new Error("Unknown quantitative-traits model");
  }
  models.quantitativeTraits = quantitativeTraitsModel;

  function heritabilitySelectionModel(input) {
    if (input.kind === "partition") {
      const va = Math.max(0, input.va);
      const vd = Math.max(0, input.vd);
      const vi = Math.max(0, input.vi);
      const ve = Math.max(0, input.ve);
      const vp = Math.max(1e-12, va + vd + vi + ve);
      return { va, vd, vi, ve, vp, h2: va / vp, H2: (va + vd + vi) / vp };
    }

    if (input.kind === "relativeMethod") {
      const va = Math.max(0, input.va);
      const vd = Math.max(0, input.vd);
      const vaa = Math.max(0, input.vaa);
      const ve = Math.max(0, input.ve);
      const common = Math.max(0, input.common);
      const vp = Math.max(1e-12, va + vd + vaa + ve + common);
      const trueH2 = va / vp;
      const methods = {
        midparent: {
          label: "offspring on midparent",
          estimate: (va + 0.5 * vaa + 2 * common) / vp,
          estimand: "narrow h² when environment, G×E, LD, and scale assumptions hold",
          trap: "shared environment and epistatic leakage enter the slope",
        },
        fullSibs: {
          label: "twice the full-sib correlation",
          estimate: (va + 0.5 * vd + 0.5 * vaa + 2 * common) / vp,
          estimand: "an upper bound on h²",
          trap: "dominance and common environment are counted as additive",
        },
        halfSibs: {
          label: "four times the half-sib correlation",
          estimate: (va + 0.25 * vaa) / vp,
          estimand: "mostly Vₐ, with little epistatic leakage",
          trap: "maternal effects can replace the common-environment term",
        },
        twins: {
          label: "Falconer 2(rMZ−rDZ)",
          estimate: (va + 1.5 * vd + 1.5 * vaa) / vp,
          estimand: "h² only if dominance, epistasis, and EEA violations vanish",
          trap: "non-additive variance inflates MZ much more than DZ resemblance",
        },
        greml: {
          label: "common-SNP GREML",
          estimate: input.tagFraction * va / vp,
          estimand: "additive variance tagged by the measured SNPs",
          trap: "rare and low-LD causal variants are invisible",
        },
        ldsc: {
          label: "LD score regression",
          estimate: input.tagFraction * va / vp,
          estimand: "summary-statistic h²SNP from the LD-score slope",
          trap: "the intercept diagnoses inflation; the slope needs its effect-size model",
        },
      };
      return { va, vd, vaa, ve, common, vp, trueH2, method: methods[input.method] || methods.midparent };
    }

    if (input.kind === "selection") {
      const vp0 = Math.max(1e-6, input.vp);
      const h20 = clamp(input.h2, 0, 0.99);
      const selectedFraction = clamp(input.selectedFraction, 0.001, 0.5);
      const generations = Math.max(1, Math.round(input.generations));
      const threshold = inverseNormal(1 - selectedFraction);
      const intensity = normalPdf(threshold) / selectedFraction;
      const k = intensity * (intensity - threshold);
      const residual = vp0 * (1 - h20);
      const baseVa = vp0 * h20;
      let va = baseVa;
      let populationMean = input.mean || 0;
      const trajectory = [{ generation: 0, mean: populationMean, va, h2: h20, response: 0 }];
      for (let generation = 1; generation <= generations; generation += 1) {
        const vp = va + residual;
        const h2 = va / vp;
        const response = intensity * h2 * Math.sqrt(vp);
        populationMean += response;
        trajectory.push({ generation, mean: populationMean, va, h2, response });
        va = baseVa * (1 - 0.5 * k * h2);
      }
      return {
        vp0, h20, selectedFraction, generations, threshold, intensity, k,
        trajectory, firstResponse: trajectory[1].response,
        finalMean: trajectory[trajectory.length - 1].mean,
        realisedH2: trajectory.slice(1).reduce((sum, row) => sum + row.response, 0) /
          Math.max(1e-12, generations * intensity * Math.sqrt(vp0)),
      };
    }

    if (input.kind === "plateau") {
      const cause = input.cause || "exhaustion";
      const generations = Math.max(8, Math.round(input.generations || 30));
      const replicates = [];
      for (let replicate = 0; replicate < 5; replicate += 1) {
        const random = mulberry32(71 + replicate * 97);
        const line = [];
        let value = 0;
        for (let generation = 0; generation <= generations; generation += 1) {
          if (generation === 0) value = 0;
          else if (cause === "exhaustion") {
            value = 9 * (1 - Math.exp(-generation / 6)) + 0.08 * replicate;
          } else if (cause === "drift") {
            const remaining = Math.max(0, 1 - generation / 16);
            value += 0.45 * remaining + 0.55 * normalRandom(random);
          } else if (cause === "opposition") {
            value = 6.5 * (1 - Math.exp(-generation / 5)) + 0.08 * replicate;
          } else {
            value = 4.2 * (1 - Math.exp(-generation / 3.5)) + 0.04 * replicate;
          }
          line.push({ generation, value });
        }
        replicates.push(line);
      }
      const diagnostics = {
        exhaustion: {
          mechanism: "favourable alleles approach fixation; Vₐ tends to zero",
          signature: "replicates converge; reverse selection also fails",
          reverse: "no stored variance to recover",
        },
        drift: {
          mechanism: "small Nₑ fixes different alleles by chance",
          signature: "replicate lines plateau at different means",
          reverse: "line-specific and erratic",
        },
        opposition: {
          mechanism: "fertility or viability cost cancels artificial selection",
          signature: "response stops while Vₐ remains",
          reverse: "relaxation causes regression toward the start",
        },
        limit: {
          mechanism: "a physical boundary truncates one direction",
          signature: "strong asymmetry between high and low selection",
          reverse: "the unconstrained direction still responds",
        },
      };
      return { cause, generations, replicates, diagnostic: diagnostics[cause] };
    }

    if (input.kind === "context") {
      const va = Math.max(0, input.va);
      const veA = Math.max(0.001, input.veA);
      const veB = Math.max(0.001, input.veB);
      return {
        va, veA, veB,
        h2A: va / (va + veA),
        h2B: va / (va + veB),
        meanA: input.meanA,
        meanB: input.meanB,
        betweenDifference: input.meanB - input.meanA,
      };
    }

    throw new Error("Unknown heritability-selection model");
  }
  models.heritabilitySelection = heritabilitySelectionModel;

  function qtlMappingModel(input) {
    if (input.kind === "attenuation") {
      const distanceCm = clamp(input.distanceCm, 0, 100);
      const distanceM = distanceCm / 100;
      const r = (1 - Math.exp(-2 * distanceM)) / 2;
      const additiveFactor = 1 - 2 * r;
      const dominanceFactor = additiveFactor * additiveFactor;
      return {
        distanceCm, r, additiveFactor, dominanceFactor,
        observedAdditive: input.additive * additiveFactor,
        observedDominance: input.dominance * dominanceFactor,
        pveRetained: additiveFactor * additiveFactor,
        sampleMultiplier: 1 / Math.max(1e-12, additiveFactor * additiveFactor),
      };
    }

    if (input.kind === "scan") {
      const fixture = input.fixture || "single";
      const method = input.method || "interval";
      const points = [];
      const truePositions = fixture === "single" ? [52] : [36, 64];
      for (let position = 0; position <= 100; position += 2) {
        let lod;
        if (fixture === "single") {
          lod = 0.3 + 7.8 * Math.exp(-Math.pow(position - 52, 2) / (2 * 11 * 11));
        } else if (method === "interval") {
          lod = 0.35 + 7.2 * Math.exp(-Math.pow(position - 50, 2) / (2 * 15 * 15));
        } else {
          lod = 0.3 + 5.8 * Math.exp(-Math.pow(position - 36, 2) / (2 * 7 * 7)) +
            5.2 * Math.exp(-Math.pow(position - 64, 2) / (2 * 7 * 7));
        }
        points.push({ x: position, y: lod });
      }
      const peak = points.reduce((best, point) => point.y > best.y ? point : best, points[0]);
      return { fixture, method, points, truePositions, peak };
    }

    if (input.kind === "design") {
      const design = input.design || "f2";
      const n = Math.max(20, Math.round(input.n));
      const replicates = Math.max(1, Math.round(input.replicates || 1));
      const generations = Math.max(2, Math.round(input.generations || 20));
      const vg = Math.max(0.01, input.vg == null ? 1 : input.vg);
      const ve = Math.max(0.01, input.ve == null ? 2 : input.ve);
      let mapExpansion = 1;
      let environmentalVariance = ve;
      let scope = "whole-genome scan";
      if (design === "ril") {
        mapExpansion = input.rilMethod === "sib" ? 4 : 2;
        environmentalVariance = ve / replicates;
      } else if (design === "ail") {
        mapExpansion = generations / 2;
      } else if (design === "nil") {
        mapExpansion = 12;
        environmentalVariance = ve / replicates;
        scope = "one preselected interval only";
      }
      const baseInterval = 18;
      return {
        design, n, replicates, generations, mapExpansion, environmentalVariance, scope,
        lineMeanH2: vg / (vg + environmentalVariance),
        intervalCm: baseInterval / mapExpansion,
        relativeBreakpoints: 2 * n * mapExpansion,
      };
    }

    if (input.kind === "threshold") {
      const markers = Math.max(50, Math.round(input.markers));
      const effectiveTests = Math.round(700 * (1 - Math.exp(-markers / 700)));
      const alpha = 0.05 / markers;
      const z = inverseNormal(1 - alpha / 2);
      const bonferroniLod = z * z / 4.605170186;
      const permutationLod = 3.4;
      return { markers, effectiveTests, bonferroniLod, permutationLod };
    }

    if (input.kind === "resolution") {
      const n = Math.max(50, Math.round(input.n));
      const effectSd = Math.max(0.05, input.effectSd);
      const thresholdLod = Math.max(1, input.thresholdLod || 3.4);
      const truePve = clamp(input.truePve, 0.0001, 0.8);
      const intervalCm = 1500 / (n * effectSd * effectSd);
      const detectionFloor = thresholdLod * 4.605170186 / n;
      const trueEffect = Math.sqrt(truePve);
      const thresholdEffect = Math.sqrt(detectionFloor);
      const effectSe = 1 / Math.sqrt(n);
      const z = (thresholdEffect - trueEffect) / effectSe;
      const detectedMeanEffect = trueEffect + effectSe * normalPdf(z) /
        Math.max(1e-12, 1 - normalCdf(z));
      return {
        n, effectSd, thresholdLod, truePve, intervalCm, detectionFloor,
        power: 1 - normalCdf(z),
        detectedPve: detectedMeanEffect * detectedMeanEffect,
        inflation: detectedMeanEffect * detectedMeanEffect / truePve,
      };
    }

    if (input.kind === "human") {
      const method = input.method || "linkage";
      const fixtures = {
        linkage: {
          label: "pedigree linkage",
          recombination: "dozens of observed family crossovers",
          effect: "rare, large, cleanly segregating",
          resolution: "10–20 cM",
          outcome: "interval, then sequence",
          failure: "tiny effects and locus heterogeneity erase co-segregation",
        },
        association: {
          label: "population association",
          recombination: "millions of ancestral crossovers",
          effect: "common or aggregated rare effects",
          resolution: "LD-block scale",
          outcome: "association, then fine-map and test mechanism",
          failure: "confounding and tagging do not identify a causal gene",
        },
        omnigenic: {
          label: "omnigenic proposal",
          recombination: "heritability spread broadly across the genome",
          effect: "many tiny peripheral effects reaching core pathways",
          resolution: "a network hypothesis, not a mapping resolution",
          outcome: "measured polygenicity; proposed core/peripheral explanation",
          failure: "the distinction is hard to identify and may add no prediction",
        },
      };
      return fixtures[method] || fixtures.linkage;
    }

    throw new Error("Unknown QTL-mapping model");
  }
  models.qtlMapping = qtlMappingModel;

  /* Shared quantitative-genetics visual grammar ------------------------- */

  function samplingRainSvg(result) {
    const xScale = (value) => 46 + clamp((value - 0.24) / 0.36, 0, 1) * 430;
    const truthLabelX = clamp(xScale(result.targetP), 112, 408);
    const frameLabelX = clamp(xScale(result.frameP), 112, 398);
    const ticks = [0.25, 0.35, 0.45, 0.55];
    let marks = ticks.map((tick) =>
      '<path class="quant-grid" d="M' + xScale(tick) + ' 34 V242"/>' +
      '<text class="lab-svg-label" x="' + xScale(tick) + '" y="266" text-anchor="middle">' +
        tick.toFixed(2) + '</text>'
    ).join("");
    result.estimates.forEach((estimate, index) => {
      const y = 50 + (index % 10) * 18;
      const lane = Math.floor(index / 10);
      marks += '<circle class="quant-sample-dot" cx="' + (xScale(estimate) + lane * 2.5) +
        '" cy="' + y + '" r="4"/>';
    });
    marks += '<path class="quant-truth-line" d="M' + xScale(result.targetP) + ' 26 V244"/>' +
      '<text class="quant-truth-label" x="' + truthLabelX + '" y="22" text-anchor="middle">target truth</text>' +
      '<path class="quant-frame-line" d="M' + xScale(result.frameP) + ' 34 V240"/>' +
      '<text class="quant-frame-label" x="' + frameLabelX + '" y="235" text-anchor="middle">sampling frame</text>';
    return textSvg(marks,
      "Repeated allele-frequency estimates. The target truth is " + result.targetP.toFixed(3) +
      ", the sampling-frame mean is " + result.frameP.toFixed(3) + ", and the standard error is " +
      result.formulaSe.toFixed(4) + ".", "0 0 520 280", "quant-sampling-rain");
  }

  function estimatorBoard(el, result) {
    const maximum = Math.max(...result.rows.map((row) => row.mse));
    return el("div", {
      class: "quant-estimator-board",
      role: "img",
      "aria-label": "Bias variance and mean squared error for three variance estimators. " +
        result.rows.map((row) => "divide by " + row.divisor + ", bias " + row.bias.toFixed(3) +
          ", MSE " + row.mse.toFixed(3)).join(". "),
    }, result.rows.map((row) => el("div", {
      class: "quant-estimator-card" + (row.divisor === result.n - 1 ? " is-reference" : ""),
    }, [
      el("span", { class: "quant-mini-kicker", text: "divide SS by" }),
      el("strong", { class: "quant-estimator-divisor", text: String(row.divisor) }),
      el("div", { class: "quant-mse-meter", "aria-hidden": "true" }, [
        el("i", { style: "width:" + (100 * row.mse / maximum).toFixed(2) + "%" }),
      ]),
      el("span", { text: "bias " + (row.bias >= 0 ? "+" : "") + row.bias.toFixed(3) }),
      el("span", { text: "variance " + row.variance.toFixed(3) }),
      el("b", { text: "MSE " + row.mse.toFixed(3) }),
    ])));
  }

  function intervalRainSvg(input, method) {
    const random = mulberry32(9321);
    const trials = 2 * input.n;
    const intervals = [];
    for (let index = 0; index < 28; index += 1) {
      const successes = binomialDraw(trials, input.p, random);
      const observed = successes / trials;
      let interval;
      if (method === "wilson") interval = wilsonInterval(successes, trials, 1.96);
      else {
        const se = Math.sqrt(observed * (1 - observed) / trials);
        interval = { low: observed - 1.96 * se, high: observed + 1.96 * se };
      }
      intervals.push({ observed, low: interval.low, high: interval.high,
        covers: interval.low <= input.p && input.p <= interval.high });
    }
    const xMax = Math.max(0.12, input.p * 5);
    const xScale = (value) => 58 + clamp(value / xMax, 0, 1) * 420;
    let html = '<path class="quant-grid" d="M58 20 V252 M268 20 V252 M478 20 V252"/>' +
      '<text class="lab-svg-label" x="58" y="272" text-anchor="middle">0</text>' +
      '<text class="lab-svg-label" x="268" y="272" text-anchor="middle">' + (xMax / 2).toFixed(3) + '</text>' +
      '<text class="lab-svg-label" x="478" y="272" text-anchor="middle">' + xMax.toFixed(3) + '</text>' +
      '<path class="quant-truth-line" d="M' + xScale(input.p) + ' 12 V254"/>';
    intervals.forEach((interval, index) => {
      const y = 24 + index * 8;
      html += '<path class="quant-interval ' + (interval.covers ? "is-cover" : "is-miss") +
        '" d="M' + xScale(interval.low) + ' ' + y + ' H' + xScale(interval.high) + '"/>' +
        '<circle class="quant-interval-point ' + (interval.covers ? "is-cover" : "is-miss") +
        '" cx="' + xScale(interval.observed) + '" cy="' + y + '" r="2.5"/>';
    });
    return textSvg(html,
      method + " intervals from 28 fixed repeated samples; lines that cover the true frequency are teal and misses are red.",
      "0 0 520 282", "quant-interval-rain");
  }

  function bootstrapBoard(el, result) {
    const blocks = Array.from({ length: 24 }, (_, index) => el("i", {
      class: "quant-bootstrap-tile" + (index % 4 === 0 ? " is-anchor" : ""),
      text: String((index % 8) + 1),
      "aria-hidden": "true",
    }));
    return el("div", {
      class: "quant-bootstrap-board",
      role: "img",
      "aria-label": "Bootstrap fixture resampling " + result.question +
        ". Its standard error is " + result.se.toFixed(5) + ".",
    }, [
      el("div", { class: "quant-bootstrap-genome" }, blocks),
      el("div", { class: "quant-bootstrap-arrow", text: "resample the independent unit ↓" }),
      processBoard(el, [
        { label: "question", value: result.question, tone: "signal" },
        { label: "fixture estimate", value: "FST = " + result.estimate.toFixed(5) },
        { label: "bootstrap SE", value: result.se.toFixed(5), tone: "active" },
      ], "Bootstrap units define the uncertainty question"),
    ]);
  }

  function polygenicSvg(result) {
    const xMin = result.curve[0].x;
    const xMax = result.curve[result.curve.length - 1].x;
    const yMax = Math.max(...result.curve.map((point) => point.y),
      ...result.classes.map((row) => row.frequency * 1.8));
    const xScale = (value) => 48 + (value - xMin) / (xMax - xMin) * 430;
    const yScale = (value) => 238 - value / Math.max(1e-9, yMax) * 196;
    let html = '<path class="quant-axis" d="M48 238 H478"/>';
    result.classes.forEach((row) => {
      html += '<path class="quant-class-stem" d="M' + xScale(row.value) + ' 238 V' +
        yScale(row.frequency * 1.8) + '"/>' +
        '<circle class="quant-class-dot" cx="' + xScale(row.value) + '" cy="' +
        yScale(row.frequency * 1.8) + '" r="4"/>';
    });
    html += '<path class="quant-density-line" d="' + linePath(result.curve, xScale, yScale) + '"/>' +
      '<text class="lab-svg-kicker" x="48" y="22">' + (2 * result.loci + 1) +
      ' genetic classes → environmental mixture</text>' +
      '<text class="lab-svg-label" x="48" y="263">low phenotype</text>' +
      '<text class="lab-svg-label" x="478" y="263" text-anchor="end">high phenotype</text>';
    return textSvg(html,
      result.loci + " additive diploid loci create " + (2 * result.loci + 1) +
      " genotype classes. Environmental spread of " + result.environmentSd.toFixed(2) +
      " blends them into the displayed phenotype density.", "0 0 520 278", "quant-polygenic");
  }

  function liabilitySvg(result) {
    const xMin = -3.7;
    const xMax = 4.1;
    const xScale = (value) => 45 + (value - xMin) / (xMax - xMin) * 435;
    const yScale = (value) => 232 - value / 0.42 * 184;
    const points = [];
    for (let index = 0; index <= 130; index += 1) {
      const x = xMin + index / 130 * (xMax - xMin);
      points.push({ x, y: normalPdf(x) });
    }
    const affected = points.filter((point) => point.x >= result.threshold);
    const fill = affected.length ? "M" + xScale(affected[0].x) + " 232 " +
      affected.map((point) => "L" + xScale(point.x).toFixed(2) + " " + yScale(point.y).toFixed(2)).join(" ") +
      " L" + xScale(affected[affected.length - 1].x) + " 232 Z" : "";
    const thresholdLabelX = clamp(xScale(result.threshold), 112, 400);
    const affectedLabelX = clamp(xScale(result.meanAffected), 126, 382);
    const html = '<path class="quant-axis" d="M45 232 H480"/>' +
      '<path class="quant-liability-tail" d="' + fill + '"/>' +
      '<path class="quant-density-line" d="' + linePath(points, xScale, yScale) + '"/>' +
      '<path class="quant-truth-line" d="M' + xScale(result.threshold) + ' 30 V234"/>' +
      '<text class="quant-truth-label" x="' + thresholdLabelX + '" y="22" text-anchor="middle">threshold ' +
      result.threshold.toFixed(2) + '</text>' +
      '<circle class="quant-affected-mean" cx="' + xScale(result.meanAffected) + '" cy="184" r="6"/>' +
      '<text class="lab-svg-label" x="' + affectedLabelX + '" y="170" text-anchor="middle">mean affected ' +
      result.meanAffected.toFixed(2) + '</text>';
    return textSvg(html,
      "Continuous standard-normal liability with disease threshold " + result.threshold.toFixed(3) +
      ". The affected tail is " + percent(result.prevalence, 2) + " and its mean liability is " +
      result.meanAffected.toFixed(3) + ".", "0 0 520 270", "quant-liability");
  }

  function varianceLedger(el, result) {
    const terms = [
      { symbol: "Vᴳ", value: result.vg, tone: "active" },
      { symbol: "Vᴇ", value: result.ve, tone: "signal" },
      { symbol: "2Cov(G,E)", value: 2 * result.covariance, tone: result.covariance < 0 ? "warning" : "neutral" },
      { symbol: "Vᴳ×ᴇ", value: result.gxe, tone: "muted" },
    ];
    return el("div", {
      class: "quant-ledger",
      role: "img",
      "aria-label": "Phenotypic variance ledger. " + terms.map((term) => term.symbol + " " +
        term.value.toFixed(2)).join(", ") + ", total " + result.vp.toFixed(2) + ".",
    }, [
      el("div", { class: "quant-ledger-equation" }, terms.flatMap((term, index) => [
        index ? el("span", { class: "quant-ledger-op", text: term.value < 0 ? "−" : "+" }) : null,
        el("div", { class: "quant-ledger-term is-" + term.tone }, [
          el("span", { text: term.symbol }),
          el("strong", { text: Math.abs(term.value).toFixed(2) }),
        ]),
      ].filter(Boolean))),
      el("div", { class: "quant-ledger-total" }, [
        el("span", { text: "Vᴘ" }), el("strong", { text: result.vp.toFixed(2) }),
      ]),
    ]);
  }

  function locusRegressionSvg(result) {
    const values = result.genotypes.flatMap((row) => [row.value, row.fitted]);
    const yMin = Math.min(...values, -result.a) - 3;
    const yMax = Math.max(...values, result.a) + 3;
    const xScale = (count) => 96 + count * 165;
    const yScale = (value) => 226 - (value - yMin) / (yMax - yMin) * 176;
    let html = '<path class="quant-axis" d="M72 226 H454 M72 38 V226"/>' +
      '<path class="quant-regression-line" d="M' + xScale(0) + ' ' + yScale(result.genotypes[0].fitted) +
      ' L' + xScale(2) + ' ' + yScale(result.genotypes[2].fitted) + '"/>';
    result.genotypes.forEach((row) => {
      const x = xScale(row.count);
      html += '<path class="quant-residual" d="M' + x + ' ' + yScale(row.value) + ' V' + yScale(row.fitted) + '"/>' +
        '<circle class="quant-genotype-point" cx="' + x + '" cy="' + yScale(row.value) + '" r="' +
        (6 + 12 * row.frequency) + '"/>' +
        '<circle class="quant-breeding-point" cx="' + x + '" cy="' + yScale(row.fitted) + '" r="4"/>' +
        '<text class="lab-svg-label" x="' + x + '" y="250" text-anchor="middle">' + row.label + '</text>';
    });
    html += '<text class="lab-svg-kicker" x="78" y="22">● genotype · ◆ fitted value</text>' +
      '<text class="lab-svg-label" x="446" y="56" text-anchor="end">slope α = ' + result.alpha.toFixed(2) + '</text>';
    return textSvg(html,
      "Weighted regression of genotypic value on allele count. Point areas encode genotype frequency; the fitted slope alpha is " +
      result.alpha.toFixed(3) + ". Vertical residuals are dominance deviations.", "0 0 520 270", "quant-locus-regression");
  }

  function ibdBoard(el, result) {
    const labels = ["share 0 alleles IBD", "share 1 allele IBD", "share 2 alleles IBD"];
    return el("div", {
      class: "quant-ibd-board",
      role: "img",
      "aria-label": result.fixture.label + ". IBD probabilities " + result.fixture.k.join(", ") +
        ". Covariance " + result.covariance.toFixed(2) + ".",
    }, [
      el("div", { class: "quant-ibd-strip" }, result.fixture.k.map((value, index) => el("span", {
        class: "is-k" + index,
        style: "flex-grow:" + Math.max(0.001, value),
        text: value ? percent(value, 0) : "",
        title: labels[index],
      }))),
      processBoard(el, [
        { label: "additive", value: result.fixture.r.toFixed(3) + "Vᴀ = " + result.additive.toFixed(2), tone: "active" },
        { label: "dominance", value: result.fixture.u.toFixed(3) + "Vᴅ = " + result.dominance.toFixed(2) },
        { label: "additive×additive", value: result.fixture.r.toFixed(3) + "²Vᴀᴀ = " + result.epistatic.toFixed(2) },
        { label: "relative covariance", value: result.covariance.toFixed(2), tone: "signal" },
      ], "Allele sharing turns variance components into resemblance"),
    ]);
  }

  function contextPotsBoard(el, result) {
    function pot(label, meanValue, environmentVariance, h2, tone) {
      return el("div", { class: "quant-pot is-" + tone }, [
        el("span", { class: "quant-pot-sun", text: tone === "a" ? "same genes" : "same genes" }),
        el("div", { class: "quant-pot-plant", "aria-hidden": "true" }, [
          el("i"), el("i"), el("i"), el("b"),
        ]),
        el("strong", { text: label }),
        el("span", { text: "mean " + meanValue.toFixed(1) }),
        el("span", { text: "Vᴇ " + environmentVariance.toFixed(1) + " · h² " + h2.toFixed(2) }),
      ]);
    }
    return el("div", {
      class: "quant-pots",
      role: "img",
      "aria-label": "Two environments with the same additive variance. Environment A heritability " +
        result.h2A.toFixed(2) + ", environment B heritability " + result.h2B.toFixed(2) +
        ", and group mean difference " + result.betweenDifference.toFixed(1) + ".",
    }, [
      pot("garden A", result.meanA, result.veA, result.h2A, "a"),
      el("div", { class: "quant-pot-gap" }, [
        el("span", { text: "between-group shift" }),
        el("strong", { text: (result.betweenDifference >= 0 ? "+" : "") + result.betweenDifference.toFixed(1) }),
      ]),
      pot("garden B", result.meanB, result.veB, result.h2B, "b"),
    ]);
  }

  function trajectorySvg(trajectories, options) {
    const lines = Array.isArray(trajectories[0]) ? trajectories : [trajectories];
    const flat = lines.flat();
    const xMax = Math.max(1, ...flat.map((point) => point.generation));
    const values = flat.map((point) => point.mean == null ? point.value : point.mean);
    const yMin = Math.min(0, ...values);
    const yMax = Math.max(1, ...values);
    const xScale = (value) => 52 + value / xMax * 420;
    const yScale = (value) => 232 - (value - yMin) / Math.max(1e-9, yMax - yMin) * 190;
    let html = '<path class="quant-axis" d="M52 232 H472 M52 36 V232"/>' +
      '<text class="lab-svg-label" x="52" y="258">generation 0</text>' +
      '<text class="lab-svg-label" x="472" y="258" text-anchor="end">generation ' + xMax + '</text>';
    lines.forEach((line, index) => {
      const points = line.map((point) => ({ x: point.generation, y: point.mean == null ? point.value : point.mean }));
      html += '<path class="quant-trajectory is-line-' + index + '" d="' + linePath(points, xScale, yScale) + '"/>';
    });
    return textSvg(html, options.label, "0 0 520 270", "quant-trajectory-chart");
  }

  function attenuationSvg(result) {
    const qtlX = 76;
    const markerX = 76 + result.distanceCm / 100 * 370;
    const bridgeWidth = Math.max(3, result.additiveFactor * 18);
    const html = '<path class="quant-chromosome" d="M62 138 H458"/>' +
      '<circle class="quant-qtl" cx="' + qtlX + '" cy="138" r="14"/>' +
      '<text class="quant-qtl-label" x="' + qtlX + '" y="143" text-anchor="middle">Q</text>' +
      '<path class="quant-marker" d="M' + markerX + ' 108 V168"/>' +
      '<text class="lab-svg-label" x="' + markerX + '" y="94" text-anchor="middle">marker</text>' +
      '<path class="quant-attenuation-bridge" style="stroke-width:' + bridgeWidth.toFixed(2) + 'px" d="M' +
        (qtlX + 18) + ' 138 H' + (markerX - 5) + '"/>' +
      '<text class="lab-svg-kicker" x="52" y="24">QTL → recombination → noisy marker</text>' +
      '<text class="quant-attenuation-factor" x="260" y="216" text-anchor="middle">1−2r = e⁻²ᵈ = ' +
        result.additiveFactor.toFixed(3) + '</text>' +
      '<text class="lab-svg-label" x="260" y="242" text-anchor="middle">PVE retained ' +
        percent(result.pveRetained, 1) + ' · sample cost ' + result.sampleMultiplier.toFixed(2) + '×</text>';
    return textSvg(html,
      "QTL and marker separated by " + result.distanceCm.toFixed(1) + " centimorgans. Recombination fraction " +
      result.r.toFixed(3) + ", additive attenuation " + result.additiveFactor.toFixed(3) +
      ", dominance attenuation " + result.dominanceFactor.toFixed(3) + ".",
      "0 0 520 270", "quant-attenuation");
  }

  function lodScanSvg(result, threshold) {
    const xScale = (value) => 54 + value / 100 * 418;
    const yMax = Math.max(9, ...result.points.map((point) => point.y));
    const yScale = (value) => 232 - value / yMax * 190;
    let html = '<path class="quant-axis" d="M54 232 H472 M54 36 V232"/>' +
      '<path class="quant-threshold-line" d="M54 ' + yScale(threshold) + ' H472"/>' +
      '<text class="lab-svg-label" x="468" y="' + (yScale(threshold) - 7) + '" text-anchor="end">threshold</text>' +
      '<path class="quant-lod-line" d="' + linePath(result.points, xScale, yScale) + '"/>';
    result.truePositions.forEach((position) => {
      html += '<path class="quant-qtl-pin" d="M' + xScale(position) + ' 28 V232"/>' +
        '<circle class="quant-qtl" cx="' + xScale(position) + '" cy="28" r="8"/>';
    });
    html += '<circle class="quant-peak-dot" cx="' + xScale(result.peak.x) + '" cy="' + yScale(result.peak.y) + '" r="5"/>' +
      '<text class="lab-svg-kicker" x="54" y="22">schematic expected LOD profile</text>' +
      '<text class="lab-svg-label" x="54" y="258">0 cM</text><text class="lab-svg-label" x="472" y="258" text-anchor="end">100 cM</text>';
    return textSvg(html,
      "Schematic " + result.method + " scan with true QTL positions at " + result.truePositions.join(" and ") +
      " centimorgans. The peak is at " + result.peak.x + " centimorgans with LOD " + result.peak.y.toFixed(2) + ".",
      "0 0 520 270", "quant-lod-scan");
  }

  function designBoard(el, result) {
    const count = Math.min(96, Math.max(12, Math.round(result.mapExpansion * 12)));
    return el("div", {
      class: "quant-design-board",
      role: "img",
      "aria-label": result.design.toUpperCase() + " design, about " + result.relativeBreakpoints.toFixed(0) +
        " relative breakpoints, interval scale " + result.intervalCm.toFixed(2) + " centimorgans, " + result.scope + ".",
    }, [
      el("div", { class: "quant-design-mosaic", "aria-hidden": "true" },
        Array.from({ length: count }, (_, index) => el("i", { class: index % 2 ? "is-b" : "is-a" }))),
      statusStrip(el, [
        { label: "map expansion", value: result.mapExpansion.toFixed(1) + "×", tone: "active" },
        { label: "interval scale", value: result.intervalCm.toFixed(2) + " cM", tone: "signal" },
        { label: "line-mean h²", value: percent(result.lineMeanH2, 1) },
        { label: "scope", value: result.scope },
      ], "Design buys power and resolution with different currencies"),
    ]);
  }

  function evidenceBoundaryBoard(el, result) {
    return processBoard(el, [
      { label: "recombination record", value: result.recombination, tone: "signal" },
      { label: "effect regime", value: result.effect },
      { label: "resolution or claim", value: result.resolution, tone: "active" },
      { label: "legitimate endpoint", value: result.outcome },
      { label: "hard boundary", value: result.failure, tone: "warning" },
    ], result.label + " evidence chain");
  }

  /* S3 — Sampling, estimation, and error ------------------------------- */

  define("sampling-estimation-lab", {
    "s3-o1": "Repeated-study mode keeps the target population and the sampling frame as separate vertical references, so every estimate visibly answers a population-specific question.",
    "s3-o2": "Estimator mode compares bias, variance, and MSE and derives the finite-sample heterozygosity correction instead of treating unbiasedness as an automatic optimum.",
    "s3-o3": "Sampling rain distinguishes the spread of individual allele counts from the spread of repeated sample estimates and shows the inverse-square-root standard-error law.",
    "s3-o4": "Coverage mode enumerates the exact binomial sampling distribution and audits Wald versus Wilson procedures across rare and common frequencies.",
    "s3-o5": "Bootstrap mode changes the resampling unit among people, SNPs, linked blocks, and both axes using the chapter FST fixture.",
    "s3-o6": "Bias mode grows sample size while holding allele dropout fixed, narrowing intervals around the wrong value; rare-variant readouts expose zero counts, relative error, and the rule of three.",
  }, ({ body, el, stat, predict }) => {
    const parts = labParts(el);
    let mode = "sampling";
    let targetP = 0.4205;
    let frameOffset = 0;
    let sampleN = 50;
    let estimatorView = "heterozygosity";
    let estimatorN = 20;
    let estimatorP = 0.42;
    let intervalMethod = "wald";
    let rareLogP = Math.log10(0.005);
    let rareN = 50;
    let errorView = "bootstrap";
    let bootstrapUnit = "people";
    let blockLength = 50;
    let dropout = 0.05;
    let biasLogN = Math.log10(50);

    function modeTabs() {
      return tabs(el, [
        { label: "Repeated studies", value: "sampling" },
        { label: "Judge estimators", value: "estimators" },
        { label: "Coverage & rarity", value: "coverage" },
        { label: "Bootstrap & bias", value: "errors" },
      ], mode, (value) => { mode = value; render(); });
    }

    function renderSampling() {
      const frameP = clamp(targetP + frameOffset, 0.001, 0.999);
      const result = samplingEstimationModel({
        kind: "sampling", targetP, frameP, n: sampleN, replicates: 40, seed: 31415,
      });
      parts.visual.replaceChildren(
        el("div", { class: "quant-visual-stack", html: samplingRainSvg(result) }),
        statusStrip(el, [
          { label: "individual allele-count SD", value: result.genotypeSd.toFixed(3) },
          { label: "estimate SE", value: result.formulaSe.toFixed(4), tone: "active" },
          { label: "frame bias", value: (result.bias >= 0 ? "+" : "") + result.bias.toFixed(3), tone: Math.abs(result.bias) > 1e-9 ? "warning" : "muted" },
          { label: "40-study mean", value: result.estimateMean.toFixed(3), tone: "signal" },
        ], "Standard deviation and standard error refer to different distributions")
      );
      parts.controls.replaceChildren(
        rangeControl(el, "Target-population allele frequency", targetP, {
          min: 0.26, max: 0.54, step: 0.005, format: (value) => Number(value).toFixed(3),
        }, (value) => { targetP = value; render(); }),
        rangeControl(el, "Sampling-frame shift", frameOffset, {
          min: -0.10, max: 0.10, step: 0.005,
          format: (value) => (value >= 0 ? "+" : "") + Number(value).toFixed(3),
        }, (value) => { frameOffset = value; render(); }),
        rangeControl(el, "Diploid people per study", sampleN, {
          min: 10, max: 1000, step: 10, format: (value) => compact(value, 0),
        }, (value) => { sampleN = value; render(); }),
        el("div", { class: "readout" }, [
          stat(result.formulaSe.toFixed(4), "formula SE = √[p(1−p)/(2n)]"),
          stat(result.empiricalSe.toFixed(4), "seeded 40-study SE"),
          stat((1.96 * result.formulaSe).toFixed(4), "95% margin, normal approximation"),
          stat(frameP.toFixed(3), "population actually sampled"),
        ])
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "you changed", value: sampleN + " people from a frame at p = " + frameP.toFixed(3) },
        { key: "random mechanism", value: "draw 2n allele copies repeatedly" },
        { key: "sampling result", value: "SE " + result.formulaSe.toFixed(4) + " around the frame, not necessarily the target" },
      ]));
      parts.explanation.className = "callout " + (Math.abs(result.bias) > 0.02 ? "callout-bad" : "callout-good");
      parts.explanation.innerHTML = Math.abs(result.bias) > 1e-9
        ? "<strong>The dots converge on the sampling frame, not the target.</strong> Increasing <em>n</em> shrinks random scatter around p = " + frameP.toFixed(3) + ", while the " + Math.abs(result.bias).toFixed(3) + " frame error survives. The statistical population is the one the sampling mechanism can actually reach."
        : "<strong>SD describes people; SE describes repeated estimates.</strong> The allele-count SD stays on the individual scale. The estimate SE divides the allele-frequency variance by 2n and therefore shrinks only as 1/√n.";
    }

    function renderEstimators() {
      const subTabs = choiceRow(el, [
        { label: "Heterozygosity correction", value: "heterozygosity" },
        { label: "Bias–variance–MSE", value: "mse" },
      ], estimatorView, (value) => { estimatorView = value; render(); }, "Estimator lesson");
      if (estimatorView === "heterozygosity") {
        const result = samplingEstimationModel({ kind: "heterozygosity", p: estimatorP, n: estimatorN });
        parts.visual.replaceChildren(
          processBoard(el, [
            { label: "population quantity", value: "H = 2p(1−p) = " + result.truth.toFixed(5), tone: "signal" },
            { label: "plug-in expectation", value: "H(1−1/2n) = " + result.naiveExpectation.toFixed(5), tone: "warning" },
            { label: "finite-sample correction", value: "2n/(2n−1) = " + result.correction.toFixed(5) },
            { label: "corrected expectation", value: result.correctedExpectation.toFixed(5), tone: "active" },
          ], "The plug-in estimator reuses an estimated allele frequency"),
          barBoard(el, [
            { label: "population H", value: result.truth, display: result.truth.toFixed(5), tone: "signal" },
            { label: "naive plug-in", value: result.naiveExpectation, display: result.naiveExpectation.toFixed(5), tone: "warning" },
            { label: "corrected", value: result.correctedExpectation, display: result.correctedExpectation.toFixed(5), tone: "active" },
          ], "Finite-sample heterozygosity estimators", result.truth)
        );
        parts.controls.replaceChildren(
          subTabs,
          rangeControl(el, "Allele frequency p", estimatorP, {
            min: 0.02, max: 0.5, step: 0.01, format: (value) => Number(value).toFixed(2),
          }, (value) => { estimatorP = value; render(); }),
          rangeControl(el, "Diploid sample size n", estimatorN, {
            min: 2, max: 200, step: 1, format: (value) => compact(value, 0),
          }, (value) => { estimatorN = value; render(); }),
          el("div", { class: "readout" }, [
            stat(result.naiveBias.toFixed(6), "naive bias"),
            stat(result.correction.toFixed(5), "multiplier"),
            stat("0", "corrected expectation minus truth"),
          ])
        );
        parts.rail.replaceChildren(causalRail(el, [
          { key: "finite sample", value: "p̂ is estimated from the same 2n copies" },
          { key: "Jensen / reuse", value: "E[2p̂(1−p̂)] falls short by H/(2n)" },
          { key: "repair", value: "multiply by 2n/(2n−1)" },
        ]));
        parts.explanation.className = "callout";
        parts.explanation.innerHTML = "<strong>Unbiasedness here is engineered, not magical.</strong> The plug-in statistic is predictably low because p̂ itself varies. The correction exactly restores its expectation under independent sampling; it does not remove sampling variance or rescue an unrepresentative frame.";
        return;
      }
      const result = samplingEstimationModel({ kind: "varianceEstimators", n: estimatorN, truth: 4 });
      parts.visual.replaceChildren(estimatorBoard(el, result));
      parts.controls.replaceChildren(
        subTabs,
        rangeControl(el, "Sample size n", estimatorN, {
          min: 3, max: 100, step: 1, format: (value) => compact(value, 0),
        }, (value) => { estimatorN = value; render(); }),
        el("div", { class: "readout" }, result.rows.map((row) =>
          stat(row.mse.toFixed(3), "MSE when dividing by " + row.divisor)
        ))
      );
      const lowest = result.rows.reduce((best, row) => row.mse < best.mse ? row : best, result.rows[0]);
      parts.rail.replaceChildren(causalRail(el, [
        { key: "estimator error", value: "bias² + variance" },
        { key: "trade", value: "a small bias can purchase a larger variance reduction" },
        { key: "decision", value: "minimum fixture MSE divides by " + lowest.divisor },
      ]));
      parts.explanation.className = "callout";
      parts.explanation.innerHTML = "<strong>Unbiasedness is one property, not the goal.</strong> For normal data, dividing the sum of squares by n−1 makes sample variance unbiased. A slightly biased divisor can nevertheless have lower mean-squared error. Consistency asks the separate question: does the error vanish as n grows?";
    }

    function renderCoverage() {
      const p = Math.pow(10, rareLogP);
      const result = samplingEstimationModel({ kind: "coverage", p, n: rareN });
      const shownCoverage = intervalMethod === "wald" ? result.waldCoverage : result.wilsonCoverage;
      parts.visual.replaceChildren(
        el("div", { class: "quant-visual-stack", html: intervalRainSvg(result, intervalMethod) }),
        statusStrip(el, [
          { label: intervalMethod + " exact coverage", value: percent(shownCoverage, 1), tone: shownCoverage >= 0.9 ? "active" : "warning" },
          { label: "expected minor copies", value: result.expectedCopies.toFixed(2), tone: result.expectedCopies < 5 ? "warning" : "signal" },
          { label: "P(zero copies)", value: percent(result.zeroProbability, 1) },
          { label: "relative SE", value: percent(result.relativeSe, 0) },
        ], "Rare data expose whether an interval procedure actually covers")
      );
      parts.controls.replaceChildren(
        el("div", { class: "lab-control-block" }, [
          el("span", { class: "lab-control-label", text: "Confidence-interval procedure" }),
          choiceRow(el, [
            { label: "Wald p̂ ± 1.96SE", value: "wald" },
            { label: "Wilson score", value: "wilson" },
          ], intervalMethod, (value) => { intervalMethod = value; render(); }, "Interval procedure"),
        ]),
        rangeControl(el, "Allele frequency (log₁₀)", rareLogP, {
          min: -4, max: Math.log10(0.3), step: 0.05,
          format: (value) => Math.pow(10, value).toPrecision(2),
        }, (value) => { rareLogP = value; render(); }),
        rangeControl(el, "Diploid sample size", rareN, {
          min: 20, max: 1000, step: 10, format: (value) => compact(value, 0),
        }, (value) => { rareN = value; render(); }),
        el("div", { class: "readout" }, [
          stat(percent(result.waldCoverage, 1), "exact Wald coverage"),
          stat(percent(result.wilsonCoverage, 1), "exact Wilson coverage"),
          stat(result.ruleOfThree.toPrecision(3), "zero-count 95% upper bound ≈ 3/(2n)"),
          stat(result.expectedCopies.toFixed(2), "2np information budget"),
        ])
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "repeat", value: "enumerate every X ~ Binomial(2n,p) outcome" },
        { key: "procedure", value: intervalMethod === "wald" ? "plug p̂ into a symmetric normal interval" : "invert the score test without zero-width collapse" },
        { key: "long-run audit", value: percent(shownCoverage, 1) + " of intervals contain fixed p" },
      ]));
      parts.explanation.className = "callout " + (shownCoverage < 0.9 ? "callout-bad" : "callout-good");
      parts.explanation.innerHTML = shownCoverage < 0.9
        ? "<strong>A nominal 95% label does not guarantee 95% coverage.</strong> With rare alleles, p̂ = 0 is common; the Wald standard error then becomes zero and its interval misses every positive truth. This is why rare-variant filters are information filters, not aesthetic preferences."
        : "<strong>Confidence belongs to the procedure.</strong> Across every possible binomial sample, this procedure contains the one fixed p about " + percent(shownCoverage, 1) + " of the time. Any particular realised interval either contains p or it does not.";
    }

    function renderErrors() {
      const subTabs = choiceRow(el, [
        { label: "Choose bootstrap unit", value: "bootstrap" },
        { label: "Grow biased data", value: "bias" },
      ], errorView, (value) => { errorView = value; render(); }, "Sampling or systematic error lesson");
      if (errorView === "bootstrap") {
        const result = samplingEstimationModel({ kind: "bootstrap", unit: bootstrapUnit, blockLength });
        parts.visual.replaceChildren(bootstrapBoard(el, result));
        parts.controls.replaceChildren(
          subTabs,
          el("div", { class: "lab-control-block" }, [
            el("span", { class: "lab-control-label", text: "What is resampled?" }),
            choiceRow(el, [
              { label: "People", value: "people" },
              { label: "Single SNPs", value: "snps" },
              { label: "Linked blocks", value: "block" },
              { label: "People + blocks", value: "both" },
            ], bootstrapUnit, (value) => { bootstrapUnit = value; render(); }, "Bootstrap resampling unit"),
          ]),
          bootstrapUnit === "block" ? rangeControl(el, "Block length (SNPs)", blockLength, {
            min: 1, max: 200, step: 1, format: (value) => compact(value, 0),
          }, (value) => { blockLength = value; render(); }) : el("span"),
          el("div", { class: "readout" }, [
            stat(result.estimate.toFixed(5), "chapter FST fixture"),
            stat(result.se.toFixed(5), "bootstrap SE"),
            stat("[" + result.low.toFixed(4) + ", " + result.high.toFixed(4) + "]", "normal 95% interval"),
            stat(result.question, "uncertainty being estimated"),
          ])
        );
        parts.rail.replaceChildren(causalRail(el, [
          { key: "scientific repeat", value: result.question },
          { key: "resampling unit", value: bootstrapUnit === "block" ? blockLength + "-SNP linked blocks" : bootstrapUnit },
          { key: "fixture uncertainty", value: "SE " + result.se.toFixed(5) },
        ]));
        parts.explanation.className = "callout";
        parts.explanation.innerHTML = "<strong>The bootstrap answers the repeat you encode.</strong> These are the chapter’s fixed F<sub>ST</sub> resampling results, not universal constants. Single-SNP resampling pretends linked sites are independent; blocks preserve local dependence, and two-way resampling asks whether the result generalises across both people and genome.";
        return;
      }
      const n = Math.round(Math.pow(10, biasLogN));
      const result = samplingEstimationModel({ kind: "bias", p: targetP, dropout, n });
      parts.visual.replaceChildren(
        processBoard(el, [
          { label: "target truth", value: result.truth.toFixed(4), tone: "signal" },
          { label: "allele dropout", value: percent(result.dropout, 1), tone: result.dropout ? "warning" : "muted" },
          { label: "large-sample centre", value: result.biasedMean.toFixed(4), tone: "warning" },
          { label: "95% interval width", value: result.intervalWidth.toFixed(5), tone: "active" },
        ], "More data narrows random error around the data-generating bias"),
        barBoard(el, [
          { label: "interval coverage of target", value: result.coverage, display: percent(result.coverage, 2), tone: result.coverage > 0.8 ? "active" : "warning" },
          { label: "nominal target", value: 0.95, display: "95%", tone: "muted" },
        ], "Coverage collapses as precision exposes a fixed bias", 1)
      );
      parts.controls.replaceChildren(
        subTabs,
        rangeControl(el, "Allele dropout", dropout, {
          min: 0, max: 0.15, step: 0.005, format: (value) => percent(value, 1),
        }, (value) => { dropout = value; render(); }),
        rangeControl(el, "Sample size (log₁₀)", biasLogN, {
          min: 1.3, max: 5, step: 0.05,
          format: (value) => compact(Math.round(Math.pow(10, value)), 0),
        }, (value) => { biasLogN = value; render(); }),
        el("div", { class: "readout" }, [
          stat(compact(n, 0), "people"),
          stat((result.bias >= 0 ? "+" : "") + result.bias.toFixed(5), "fixed bias"),
          stat(result.se.toFixed(6), "sampling SE"),
          stat(percent(result.coverage, 2), "coverage of target"),
        ])
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "you grew", value: "n to " + compact(n, 0) + " while dropout stayed " + percent(dropout, 1) },
        { key: "sampling error", value: "SE shrinks as 1/√n" },
        { key: "systematic error", value: "centre remains displaced by " + Math.abs(result.bias).toFixed(5) },
      ]));
      parts.explanation.className = "callout " + (dropout ? "callout-bad" : "callout-good");
      parts.explanation.innerHTML = dropout
        ? "<strong>More biased data can make you more confidently wrong.</strong> The interval tightens around " + result.biasedMean.toFixed(4) + " until coverage of the target falls to " + percent(result.coverage, 2) + ". Sample size cures sampling error; only design, measurement, or modelling can cure this bias."
        : "<strong>With the systematic mechanism removed, precision behaves as promised.</strong> The estimate remains centred on the target while its standard error falls as 1/√n.";
    }

    function render() {
      parts.tabHost.replaceChildren(modeTabs());
      if (mode === "sampling") renderSampling();
      else if (mode === "estimators") renderEstimators();
      else if (mode === "coverage") renderCoverage();
      else renderErrors();
    }

    predict(body, {
      widget: "sampling-estimation-lab",
      question: "You increase an independently sampled cohort from n to 100n, but keep a 5% allele-dropout mechanism. What changes?",
      hint: "Separate random scatter around the sampling mechanism from displacement of that mechanism’s centre.",
      options: [
        { label: "SE becomes 100× smaller and bias vanishes" },
        { label: "SE becomes 10× smaller; the bias stays", correct: true },
        { label: "SD and SE both become 10× smaller" },
        { label: "Nothing changes because dropout dominates" },
      ],
    }, () => {
      mode = "errors";
      errorView = "bias";
      dropout = 0.05;
      biasLogN = 4.7;
      parts.instrument.hidden = false;
      render();
    });
    finishLab(parts, body);
  });

  /* Ch 30 — Quantitative traits and variance --------------------------- */

  define("quantitative-traits-lab", {
    "ch30-o1": "Polygenic mode builds exact binomial class frequencies for any locus count and then convolves each class with environmental variation to show continuity emerging from Mendelian segregation.",
    "ch30-o2": "Liability mode places a prevalence-defined threshold on a standard-normal latent trait, locates the mean affected liability, and converts observed-scale heritability for an ascertained sample.",
    "ch30-o3": "Variance-ledger mode retains V_G, V_E, 2Cov(G,E), and V_GxE as signed visible terms and states the randomisation assumptions needed to drop them.",
    "ch30-o4": "One-locus mode performs the frequency-weighted regression of genotypic value on allele count and separates breeding values from dominance residuals to compute alpha, V_A, and V_D.",
    "ch30-o5": "Genetic-correlation mode sums signed per-locus covariance contributions and contrasts r_G with a phenotypic correlation after environmental covariance is added.",
    "ch30-o6": "Relative mode exposes k0:k1:k2 sharing, then derives additive, dominance, and additive-by-additive covariance coefficients for each relationship.",
  }, ({ body, el, stat, predict }) => {
    const parts = labParts(el);
    let mode = "polygenic";
    let traitView = "polygenic";
    let loci = 3;
    let alleleFrequency = 0.5;
    let environmentSd = 0.35;
    let prevalenceLog = -2;
    let caseFraction = 0.5;
    let observedH2 = 0.10;
    let ledgerVg = 2;
    let ledgerVe = 2;
    let ledgerRho = 0;
    let ledgerGxe = 0.5;
    let locusP = 0.6;
    let locusA = 10;
    let locusD = 4;
    let covarianceView = "correlation";
    let y1 = 1;
    let y2 = -1.4;
    let environmentalCorrelation = 0.45;
    let relationship = "fullSibs";
    let relativeVa = 4;
    let relativeVd = 2;
    let relativeVaa = 1;

    function modeTabs() {
      return tabs(el, [
        { label: "Mendelian → continuous", value: "polygenic" },
        { label: "Full variance ledger", value: "variance" },
        { label: "One locus as regression", value: "locus" },
        { label: "Covariance & relatives", value: "covariance" },
      ], mode, (value) => { mode = value; render(); });
    }

    function renderPolygenic() {
      const subTabs = choiceRow(el, [
        { label: "Measured trait", value: "polygenic" },
        { label: "Binary threshold trait", value: "liability" },
      ], traitView, (value) => { traitView = value; render(); }, "Quantitative trait type");
      if (traitView === "polygenic") {
        const result = quantitativeTraitsModel({ kind: "polygenic", loci, p: alleleFrequency, environmentSd, span: 6 });
        parts.visual.replaceChildren(
          el("div", { class: "quant-visual-stack", html: polygenicSvg(result) }),
          statusStrip(el, [
            { label: "genetic classes", value: String(2 * loci + 1), tone: "active" },
            { label: "most extreme class", value: percent(result.extremeFrequency, 3), tone: "signal" },
            { label: "genetic variance", value: result.geneticVariance.toFixed(3) },
            { label: "environmental blur σE", value: environmentSd.toFixed(2) },
          ], "Small Mendelian effects create many overlapping phenotype classes")
        );
        parts.controls.replaceChildren(
          subTabs,
          rangeControl(el, "Equal-effect diploid loci", loci, {
            min: 1, max: 12, step: 1, format: (value) => compact(value, 0),
          }, (value) => { loci = value; render(); }),
          rangeControl(el, "Effect-allele frequency", alleleFrequency, {
            min: 0.05, max: 0.95, step: 0.01, format: (value) => Number(value).toFixed(2),
          }, (value) => { alleleFrequency = value; render(); }),
          rangeControl(el, "Environmental SD", environmentSd, {
            min: 0.08, max: 1.4, step: 0.02, format: (value) => Number(value).toFixed(2),
          }, (value) => { environmentSd = value; render(); }),
          el("div", { class: "readout" }, [
            stat(String(2 * loci + 1), "distinct additive scores"),
            stat(percent(result.classes[0].frequency, 3), "all-zero class"),
            stat(percent(result.classes[result.classes.length - 1].frequency, 3), "all-effect class"),
            stat("Binomial(2L,p)", "exact genetic class law"),
          ])
        );
        parts.rail.replaceChildren(causalRail(el, [
          { key: "segregation", value: loci + " loci create " + (2 * loci + 1) + " additive scores" },
          { key: "combinatorics", value: "middle scores have many more genotype routes" },
          { key: "environment", value: "each score becomes an overlapping distribution" },
        ]));
        parts.explanation.className = "callout callout-good";
        parts.explanation.innerHTML = "<strong>Continuity does not require non-Mendelian inheritance.</strong> Independent loci make binomial score classes—1:4:6:4:1 for two loci and 1:6:15:20:15:6:1 for three. Environmental scatter then blends those discrete classes into a smooth phenotype distribution.";
        return;
      }
      const prevalence = Math.pow(10, prevalenceLog);
      const result = quantitativeTraitsModel({ kind: "liability", prevalence, caseFraction, observedH2 });
      parts.visual.replaceChildren(
        el("div", { class: "quant-visual-stack", html: liabilitySvg(result) }),
        statusStrip(el, [
          { label: "population prevalence K", value: percent(prevalence, 2), tone: "signal" },
          { label: "liability threshold t", value: result.threshold.toFixed(3), tone: "active" },
          { label: "mean affected liability", value: result.meanAffected.toFixed(3) },
          { label: "liability h²", value: result.liabilityH2.toFixed(3) },
        ], "A binary observation can be a thresholded continuous liability")
      );
      parts.controls.replaceChildren(
        subTabs,
        rangeControl(el, "Population prevalence (log₁₀)", prevalenceLog, {
          min: -4, max: Math.log10(0.3), step: 0.05,
          format: (value) => percent(Math.pow(10, value), 2),
        }, (value) => { prevalenceLog = value; render(); }),
        rangeControl(el, "Cases in analysed sample", caseFraction, {
          min: 0.05, max: 0.95, step: 0.01, format: (value) => percent(value, 0),
        }, (value) => { caseFraction = value; render(); }),
        rangeControl(el, "Observed-scale h²", observedH2, {
          min: 0, max: 0.8, step: 0.01, format: (value) => Number(value).toFixed(2),
        }, (value) => { observedH2 = value; render(); }),
        el("div", { class: "readout" }, [
          stat(result.threshold.toFixed(3), "Φ⁻¹(1−K)"),
          stat(result.density.toFixed(4), "normal density at threshold z"),
          stat(result.conversion.toFixed(3) + "×", "observed → liability multiplier"),
          stat(result.liabilityH2.toFixed(3), "converted h² liability"),
        ])
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "latent trait", value: "standard-normal liability" },
        { key: "threshold", value: "top " + percent(prevalence, 2) + " becomes affected" },
        { key: "ascertainment", value: percent(caseFraction, 0) + " cases in sample changes observed scale" },
      ]));
      parts.explanation.className = "callout";
      parts.explanation.innerHTML = "<strong>The disease label discards distance from the threshold.</strong> At K = " + percent(prevalence, 2) + ", the cutoff is " + result.threshold.toFixed(3) + " SD and affected individuals average " + result.meanAffected.toFixed(3) + " SD. Liability conversion explicitly restores population prevalence after case–control ascertainment.";
    }

    function renderVariance() {
      const result = quantitativeTraitsModel({
        kind: "variance", vg: ledgerVg, ve: ledgerVe, rho: ledgerRho, gxe: ledgerGxe,
      });
      parts.visual.replaceChildren(
        varianceLedger(el, result),
        processBoard(el, [
          { label: "P = G + E + G×E contribution", value: "individual-level model" },
          { label: "association of genotype with environment", value: "ρGE = " + ledgerRho.toFixed(2), tone: Math.abs(ledgerRho) > 0.05 ? "warning" : "muted" },
          { label: "reaction-norm differences", value: "VG×E = " + ledgerGxe.toFixed(2), tone: ledgerGxe ? "signal" : "muted" },
          { label: "population variance", value: "VP = " + result.vp.toFixed(2), tone: "active" },
        ], "Variance algebra keeps the terms that design must justify dropping")
      );
      parts.controls.replaceChildren(
        rangeControl(el, "Genetic variance Vᴳ", ledgerVg, {
          min: 0, max: 6, step: 0.1, format: (value) => Number(value).toFixed(1),
        }, (value) => { ledgerVg = value; render(); }),
        rangeControl(el, "Environmental variance Vᴇ", ledgerVe, {
          min: 0, max: 6, step: 0.1, format: (value) => Number(value).toFixed(1),
        }, (value) => { ledgerVe = value; render(); }),
        rangeControl(el, "Genotype–environment correlation ρ", ledgerRho, {
          min: -0.9, max: 0.9, step: 0.05, format: (value) => Number(value).toFixed(2),
        }, (value) => { ledgerRho = value; render(); }),
        rangeControl(el, "G×E variance", ledgerGxe, {
          min: 0, max: 4, step: 0.1, format: (value) => Number(value).toFixed(1),
        }, (value) => { ledgerGxe = value; render(); }),
        el("div", { class: "readout" }, [
          stat(result.covariance.toFixed(3), "Cov(G,E)"),
          stat((2 * result.covariance).toFixed(3), "term entering VP"),
          stat(result.vp.toFixed(3), "full VP"),
          stat((ledgerVg / result.vp).toFixed(3), "VG/VP in this context"),
        ])
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "randomise / sample", value: "determine whether genotype reaches environments independently" },
        { key: "test reaction norms", value: "determine whether genotype effects change by environment" },
        { key: "only then simplify", value: "VP = VG + VE is a conclusion, not a definition" },
      ]));
      parts.explanation.className = "callout " + (Math.abs(ledgerRho) > 0.1 || ledgerGxe > 0.5 ? "callout-bad" : "");
      parts.explanation.innerHTML = "<strong>Variance components belong to a population and design.</strong> Random assignment can justify Cov(G,E) = 0. Replicated genotypes across environments can estimate G×E. Without those design facts, dropping either term silently changes the biological claim.";
    }

    function renderLocus() {
      const result = quantitativeTraitsModel({ kind: "locus", p: locusP, a: locusA, d: locusD });
      parts.visual.replaceChildren(
        el("div", { class: "quant-visual-stack", html: locusRegressionSvg(result) }),
        statusStrip(el, [
          { label: "population mean M", value: result.populationMean.toFixed(2) },
          { label: "average effect α", value: result.alpha.toFixed(2), tone: "active" },
          { label: "additive VA", value: result.va.toFixed(2), tone: "signal" },
          { label: "dominance VD", value: result.vd.toFixed(2) },
        ], "Additive variance is the variance of fitted breeding values")
      );
      parts.controls.replaceChildren(
        rangeControl(el, "A₁ allele frequency p", locusP, {
          min: 0.01, max: 0.99, step: 0.01, format: (value) => Number(value).toFixed(2),
        }, (value) => { locusP = value; render(); }),
        rangeControl(el, "Homozygote half-difference a", locusA, {
          min: 0, max: 20, step: 0.5, format: (value) => Number(value).toFixed(1),
        }, (value) => { locusA = value; render(); }),
        rangeControl(el, "Heterozygote dominance d", locusD, {
          min: -15, max: 15, step: 0.5, format: (value) => Number(value).toFixed(1),
        }, (value) => { locusD = value; render(); }),
        el("div", { class: "readout" }, [
          stat(result.alpha.toFixed(3), "α = a + d(q−p)"),
          stat(result.va.toFixed(4), "VA = 2pqα²"),
          stat(result.vd.toFixed(4), "VD = (2pqd)²"),
          stat((result.va + result.vd).toFixed(4), "VA + VD"),
        ])
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "genotypic values", value: "−a, d, +a with frequency q², 2pq, p²" },
        { key: "weighted regression", value: "fit value on A₁ count; slope α = " + result.alpha.toFixed(2) },
        { key: "partition", value: "fitted spread is VA; residual spread is VD" },
      ]));
      parts.explanation.className = "callout callout-good";
      parts.explanation.innerHTML = "<strong>‘Additive’ describes a population regression, not a molecular mechanism.</strong> Even with complete dominance, a rare allele mostly occurs in heterozygotes, so substituting one copy predicts phenotype well and most variance can be additive. Change p and watch α—and therefore VA—change while a and d stay fixed.";
    }

    function renderCovariance() {
      const subTabs = choiceRow(el, [
        { label: "Two-trait genetic correlation", value: "correlation" },
        { label: "Relative resemblance", value: "relatives" },
      ], covarianceView, (value) => { covarianceView = value; render(); }, "Covariance lesson");
      if (covarianceView === "correlation") {
        const result = quantitativeTraitsModel({
          kind: "correlation", y1, y2, environmentalCorrelation,
        });
        parts.visual.replaceChildren(
          barBoard(el, result.contributions.map((row) => ({
            label: "locus " + row.locus + " signed CovA",
            value: Math.abs(row.covariance),
            display: (row.covariance >= 0 ? "+" : "") + row.covariance.toFixed(3),
            tone: row.covariance >= 0 ? "active" : "warning",
          })), "Signed per-locus contributions to additive genetic covariance"),
          processBoard(el, [
            { label: "sum locus terms", value: "CovA = " + result.covA.toFixed(3), tone: "signal" },
            { label: "standardise genetically", value: "rG = " + result.rG.toFixed(3), tone: Math.abs(result.rG) > 0.7 ? "active" : "muted" },
            { label: "add environmental covariance", value: result.environmentalCovariance.toFixed(3) },
            { label: "observed correlation", value: "rP = " + result.rP.toFixed(3), tone: Math.abs(result.rP) < 0.15 && Math.abs(result.rG) > 0.7 ? "warning" : "neutral" },
          ], "Phenotypic and genetic correlations can cancel")
        );
        parts.controls.replaceChildren(
          subTabs,
          rangeControl(el, "Trait-Y effect at locus 1", y1, {
            min: -2, max: 2, step: 0.05, format: (value) => Number(value).toFixed(2),
          }, (value) => { y1 = value; render(); }),
          rangeControl(el, "Trait-Y effect at locus 2", y2, {
            min: -2, max: 2, step: 0.05, format: (value) => Number(value).toFixed(2),
          }, (value) => { y2 = value; render(); }),
          rangeControl(el, "Environmental correlation (Vᴇ = 1 for each trait)", environmentalCorrelation, {
            min: -0.9, max: 0.9, step: 0.05, format: (value) => Number(value).toFixed(2),
          }, (value) => { environmentalCorrelation = value; render(); }),
          el("div", { class: "readout" }, [
            stat(result.covA.toFixed(3), "additive genetic covariance"),
            stat(result.rG.toFixed(3), "genetic correlation rG"),
            stat(result.environmentalCovariance.toFixed(3), "environmental covariance (Vᴇ = 1 each)"),
            stat(result.rP.toFixed(3), "phenotypic correlation rP"),
          ])
        );
        parts.rail.replaceChildren(causalRail(el, [
          { key: "pleiotropic effects", value: "multiply αX by αY at each locus" },
          { key: "weight", value: "2p(1−p) determines each contribution" },
          { key: "sum and standardise", value: "rG = " + result.rG.toFixed(3) + ", distinct from rP = " + result.rP.toFixed(3) },
        ]));
        parts.explanation.className = "callout";
        parts.explanation.innerHTML = "<strong>Near-zero phenotype correlation need not mean near-zero shared genetics.</strong> Signed pleiotropic effects determine Cov<sub>A</sub>; environmental covariance enters the observed phenotype separately and can conceal or reverse the genetic relationship.";
        return;
      }
      const result = quantitativeTraitsModel({
        kind: "relatives", relationship, va: relativeVa, vd: relativeVd, vaa: relativeVaa,
      });
      parts.visual.replaceChildren(ibdBoard(el, result));
      parts.controls.replaceChildren(
        subTabs,
        el("div", { class: "lab-control-block" }, [
          el("span", { class: "lab-control-label", text: "Relationship" }),
          choiceRow(el, [
            { label: "Parent–offspring", value: "parent" },
            { label: "Full sibs", value: "fullSibs" },
            { label: "Half sibs", value: "halfSibs" },
            { label: "MZ twins", value: "mz" },
            { label: "First cousins", value: "cousins" },
          ], relationship, (value) => { relationship = value; render(); }, "Relationship type"),
        ]),
        rangeControl(el, "Additive variance VA", relativeVa, {
          min: 0, max: 10, step: 0.2, format: (value) => Number(value).toFixed(1),
        }, (value) => { relativeVa = value; render(); }),
        rangeControl(el, "Dominance variance VD", relativeVd, {
          min: 0, max: 10, step: 0.2, format: (value) => Number(value).toFixed(1),
        }, (value) => { relativeVd = value; render(); }),
        rangeControl(el, "Additive×additive variance VAA", relativeVaa, {
          min: 0, max: 6, step: 0.2, format: (value) => Number(value).toFixed(1),
        }, (value) => { relativeVaa = value; render(); }),
        el("div", { class: "readout" }, [
          stat(result.fixture.k.join(" : "), "k₀ : k₁ : k₂"),
          stat(result.fixture.r.toFixed(3), "additive relationship r"),
          stat(result.fixture.u.toFixed(3), "two-allele-sharing coefficient"),
          stat(result.covariance.toFixed(3), "predicted covariance"),
        ])
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "inheritance path", value: result.fixture.label + " IBD probabilities" },
        { key: "one-allele sharing", value: "weights additive deviations" },
        { key: "two-allele sharing", value: "lets full sibs—but not parent–offspring—share dominance" },
      ]));
      parts.explanation.className = "callout";
      parts.explanation.innerHTML = "<strong>Equal additive relatedness does not imply equal total covariance.</strong> Parent–offspring and full sibs both carry r = 1/2 for VA. Full sibs can additionally share both alleles IBD with probability 1/4, contributing 1/4 VD; a parent and child cannot.";
    }

    function render() {
      parts.tabHost.replaceChildren(modeTabs());
      if (mode === "polygenic") renderPolygenic();
      else if (mode === "variance") renderVariance();
      else if (mode === "locus") renderLocus();
      else renderCovariance();
    }

    predict(body, {
      widget: "quantitative-traits-lab",
      question: "A rare allele is completely dominant at one locus. Must most of that locus’s population variance be dominance variance?",
      hint: "Additive variance is a frequency-weighted regression property, not a synonym for molecular additivity.",
      options: [
        { label: "Yes—complete dominance means VD must exceed VA" },
        { label: "No—a rare dominant allele can have mostly additive variance", correct: true },
        { label: "Only if the environment has zero variance" },
        { label: "VA and VD must be equal" },
      ],
    }, () => {
      mode = "locus";
      locusP = 0.05;
      locusA = 10;
      locusD = 10;
      parts.instrument.hidden = false;
      render();
    });
    finishLab(parts, body);
  });

  /* Ch 31 — Heritability and response to selection -------------------- */

  define("heritability-selection-lab", {
    "ch31-o1": "Partition mode separates V_A, V_D, and V_I inside V_G, places h2 and H2 on the same ledger, and identifies breeding value as the transmitted regression component.",
    "ch31-o2": "Relative-estimator mode reconstructs the offspring–midparent slope and makes shared-environment, epistatic, and assortative-design assumptions visible beside the target estimand.",
    "ch31-o3": "The estimator switch compares parent, full-sib, half-sib, and Falconer-style twin estimators and shows exactly which non-additive or common-environment terms leak into each.",
    "ch31-o4": "GREML and LD-score views restrict the result to additive variance tagged by measured SNPs and distinguish an individual-level relationship likelihood from a summary-statistic LD slope.",
    "ch31-o5": "Selection mode converts a retained fraction to intensity, derives R = h2S, and traces a seeded multi-generation Bulmer approximation as VA and h2 erode.",
    "ch31-o6": "Plateau mode presents five replicate trajectories plus reverse-selection diagnostics for VA exhaustion, drift, opposing natural selection, and a physiological boundary.",
    "ch31-o7": "Two-garden mode holds genetic variance fixed while environmental variance and group means move independently, directly refuting malleability and between-group interpretations of heritability.",
  }, ({ body, el, stat, predict }) => {
    const parts = labParts(el);
    let mode = "meaning";
    let meaningView = "context";
    let partitionVa = 1.8;
    let partitionVd = 0.8;
    let partitionVi = 0.4;
    let partitionVe = 1;
    let contextVa = 4;
    let contextVeA = 0.25;
    let contextVeB = 0.25;
    let contextMeanA = 5;
    let contextMeanB = 12;
    let relativeMethod = "midparent";
    let methodVa = 1.8;
    let methodVd = 0.6;
    let methodVaa = 0.2;
    let methodVe = 1.2;
    let methodCommon = 0;
    let tagFraction = 0.65;
    let selectionVp = 4;
    let selectionH2 = 0.45;
    let selectedFraction = 0.10;
    let selectionGenerations = 8;
    let plateauCause = "exhaustion";

    function modeTabs() {
      return tabs(el, [
        { label: "What h² means", value: "meaning" },
        { label: "Relative estimators", value: "estimators" },
        { label: "Selection response", value: "selection" },
        { label: "Why response stops", value: "plateau" },
      ], mode, (value) => { mode = value; render(); });
    }

    function renderMeaning() {
      const subTabs = choiceRow(el, [
        { label: "Two heritabilities", value: "partition" },
        { label: "Two gardens", value: "context" },
      ], meaningView, (value) => { meaningView = value; render(); }, "Heritability meaning lesson");
      if (meaningView === "partition") {
        const result = heritabilitySelectionModel({
          kind: "partition", va: partitionVa, vd: partitionVd, vi: partitionVi, ve: partitionVe,
        });
        parts.visual.replaceChildren(
          barBoard(el, [
            { label: "VA · breeding values", value: result.va, display: result.va.toFixed(2), tone: "active" },
            { label: "VD · dominance deviations", value: result.vd, display: result.vd.toFixed(2), tone: "signal" },
            { label: "VI · epistasis", value: result.vi, display: result.vi.toFixed(2) },
            { label: "VE · environment", value: result.ve, display: result.ve.toFixed(2), tone: "muted" },
          ], "Phenotypic variance partition", result.vp),
          statusStrip(el, [
            { label: "VP", value: result.vp.toFixed(2) },
            { label: "narrow h² = VA/VP", value: result.h2.toFixed(3), tone: "active" },
            { label: "broad H² = VG/VP", value: result.H2.toFixed(3), tone: "signal" },
            { label: "transmitted predictor", value: "breeding value A" },
          ], "Broad and narrow heritability answer different questions")
        );
        parts.controls.replaceChildren(
          subTabs,
          rangeControl(el, "Additive variance VA", partitionVa, {
            min: 0, max: 5, step: 0.1, format: (value) => Number(value).toFixed(1),
          }, (value) => { partitionVa = value; render(); }),
          rangeControl(el, "Dominance variance VD", partitionVd, {
            min: 0, max: 5, step: 0.1, format: (value) => Number(value).toFixed(1),
          }, (value) => { partitionVd = value; render(); }),
          rangeControl(el, "Epistatic variance VI", partitionVi, {
            min: 0, max: 5, step: 0.1, format: (value) => Number(value).toFixed(1),
          }, (value) => { partitionVi = value; render(); }),
          rangeControl(el, "Environmental variance VE", partitionVe, {
            min: 0, max: 5, step: 0.1, format: (value) => Number(value).toFixed(1),
          }, (value) => { partitionVe = value; render(); }),
          el("div", { class: "readout" }, [
            stat(result.h2.toFixed(3), "h² predicts parent–offspring regression and R"),
            stat(result.H2.toFixed(3), "H² measures repeatable genetic differences"),
            stat((result.H2 - result.h2).toFixed(3), "non-additive genetic share"),
          ])
        );
        parts.rail.replaceChildren(causalRail(el, [
          { key: "genotypic value", value: "regress on allele substitutions to obtain A" },
          { key: "transmission", value: "parents transmit alleles, not intact dominance combinations" },
          { key: "prediction", value: "VA—not all VG—sets short-term response" },
        ]));
        parts.explanation.className = "callout";
        parts.explanation.innerHTML = "<strong>H² and h² divide the same population variance differently.</strong> Broad sense includes every genetic departure. Narrow sense keeps the variance of breeding values—the linear allele-substitution predictor that survives reshuffling into offspring.";
        return;
      }
      const result = heritabilitySelectionModel({
        kind: "context", va: contextVa, veA: contextVeA, veB: contextVeB,
        meanA: contextMeanA, meanB: contextMeanB,
      });
      parts.visual.replaceChildren(contextPotsBoard(el, result));
      parts.controls.replaceChildren(
        subTabs,
        rangeControl(el, "Shared additive variance", contextVa, {
          min: 0.2, max: 8, step: 0.1, format: (value) => Number(value).toFixed(1),
        }, (value) => { contextVa = value; render(); }),
        rangeControl(el, "Environmental variance · garden A", contextVeA, {
          min: 0.05, max: 8, step: 0.05, format: (value) => Number(value).toFixed(2),
        }, (value) => { contextVeA = value; render(); }),
        rangeControl(el, "Environmental variance · garden B", contextVeB, {
          min: 0.05, max: 8, step: 0.05, format: (value) => Number(value).toFixed(2),
        }, (value) => { contextVeB = value; render(); }),
        rangeControl(el, "Environmental mean shift B−A", contextMeanB - contextMeanA, {
          min: -10, max: 10, step: 0.5,
          format: (value) => (value >= 0 ? "+" : "") + Number(value).toFixed(1),
        }, (value) => { contextMeanB = contextMeanA + value; render(); }),
        el("div", { class: "readout" }, [
          stat(result.h2A.toFixed(3), "within-garden h² A"),
          stat(result.h2B.toFixed(3), "within-garden h² B"),
          stat(result.betweenDifference.toFixed(1), "difference of group means"),
          stat("not identified by h²", "cause of the mean difference"),
        ])
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "within each garden", value: "h² ranks causes of individual differences" },
        { key: "between gardens", value: "a mean shift is a different estimand" },
        { key: "intervention", value: "change environment; means move even when h² ≈ 1" },
      ]));
      parts.explanation.className = "callout callout-good";
      parts.explanation.innerHTML = "<strong>High heritability does not mean immutability or genetic group differences.</strong> Both gardens can have h² near one because individual rankings are genetic within each garden, while their entire " + Math.abs(result.betweenDifference).toFixed(1) + "-unit mean difference is imposed environmentally.";
    }

    function renderEstimators() {
      const result = heritabilitySelectionModel({
        kind: "relativeMethod", method: relativeMethod, va: methodVa, vd: methodVd,
        vaa: methodVaa, ve: methodVe, common: methodCommon, tagFraction,
      });
      const cappedEstimate = clamp(result.method.estimate, 0, 1.4);
      parts.visual.replaceChildren(
        barBoard(el, [
          { label: "target narrow h²", value: result.trueH2, display: result.trueH2.toFixed(3), tone: "active" },
          { label: result.method.label, value: cappedEstimate, display: result.method.estimate.toFixed(3), tone: Math.abs(result.method.estimate - result.trueH2) > 0.08 ? "warning" : "signal" },
        ], "Estimator versus additive target", 1.4),
        processBoard(el, [
          { label: "design", value: result.method.label, tone: "signal" },
          { label: "intended estimand", value: result.method.estimand },
          { label: "leakage or boundary", value: result.method.trap, tone: "warning" },
          { label: "fixture estimate", value: result.method.estimate.toFixed(3), tone: "active" },
        ], "Every heritability estimate is a design plus assumptions")
      );
      parts.controls.replaceChildren(
        el("div", { class: "lab-control-block" }, [
          el("span", { class: "lab-control-label", text: "Estimator" }),
          choiceRow(el, [
            { label: "Midparent", value: "midparent" },
            { label: "Full sibs", value: "fullSibs" },
            { label: "Half sibs", value: "halfSibs" },
            { label: "Twins", value: "twins" },
            { label: "GREML", value: "greml" },
            { label: "LD score", value: "ldsc" },
          ], relativeMethod, (value) => { relativeMethod = value; render(); }, "Heritability estimator"),
        ]),
        rangeControl(el, "VA", methodVa, {
          min: 0, max: 5, step: 0.1, format: (value) => Number(value).toFixed(1),
        }, (value) => { methodVa = value; render(); }),
        rangeControl(el, "VD", methodVd, {
          min: 0, max: 4, step: 0.1, format: (value) => Number(value).toFixed(1),
        }, (value) => { methodVd = value; render(); }),
        rangeControl(el, "VAA", methodVaa, {
          min: 0, max: 3, step: 0.1, format: (value) => Number(value).toFixed(1),
        }, (value) => { methodVaa = value; render(); }),
        rangeControl(el, "Shared-environment variance", methodCommon, {
          min: 0, max: 3, step: 0.1, format: (value) => Number(value).toFixed(1),
        }, (value) => { methodCommon = value; render(); }),
        (relativeMethod === "greml" || relativeMethod === "ldsc") ? rangeControl(el, "Causal VA tagged by SNPs", tagFraction, {
          min: 0.1, max: 1, step: 0.01, format: (value) => percent(value, 0),
        }, (value) => { tagFraction = value; render(); }) : el("span"),
        el("div", { class: "readout" }, [
          stat(result.vp.toFixed(2), "fixture VP"),
          stat(result.trueH2.toFixed(3), "true VA/VP"),
          stat(result.method.estimate.toFixed(3), "reported estimate"),
          stat((result.method.estimate - result.trueH2 >= 0 ? "+" : "") +
            (result.method.estimate - result.trueH2).toFixed(3), "difference from target"),
        ])
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "observed resemblance", value: result.method.label },
        { key: "coefficient model", value: result.method.estimand },
        { key: "audit", value: result.method.trap },
      ]));
      parts.explanation.className = "callout " + (Math.abs(result.method.estimate - result.trueH2) > 0.08 ? "callout-bad" : "");
      if (relativeMethod === "greml") {
        parts.explanation.innerHTML = "<strong>GREML estimates SNP-tagged additive variance among nominally unrelated people.</strong> It fits phenotype covariance to a genomic relationship matrix. Rare or poorly tagged causal alleles sit outside this estimand, so h²<sub>SNP</sub> can be lower without pedigree or twin estimates being wrong.";
      } else if (relativeMethod === "ldsc") {
        parts.explanation.innerHTML = "<strong>LD score regression reaches a related SNP estimand from summary statistics.</strong> The slope links association χ² to LD score; the intercept absorbs inflation not correlated with LD. It does not recover dominance, rare untagged effects, or the broad-sense twin quantity.";
      } else {
        parts.explanation.innerHTML = "<strong>The coefficient is not self-interpreting.</strong> Under the clean additive model, the relationship design maps covariance to h². Non-additive sharing and common rearing can enter with different weights; the fixture deliberately exposes that leakage. The shared-environment terms here are a teaching sensitivity model, not universal pedigree coefficients.";
      }
    }

    function renderSelection() {
      const result = heritabilitySelectionModel({
        kind: "selection", vp: selectionVp, h2: selectionH2,
        selectedFraction, generations: selectionGenerations, mean: 8,
      });
      const sigma0 = Math.sqrt(selectionVp);
      const naiveResponse = result.intensity * selectionH2 * sigma0;
      const naive = Array.from({ length: selectionGenerations + 1 }, (_, generation) => ({
        generation, mean: 8 + generation * naiveResponse,
      }));
      parts.visual.replaceChildren(
        el("div", { class: "quant-visual-stack", html: trajectorySvg([result.trajectory, naive], {
          label: "Selected-population mean under a one-generation Bulmer approximation, compared with a dashed naive line that reapplies starting h squared.",
        }) }),
        statusStrip(el, [
          { label: "truncation x", value: result.threshold.toFixed(3) },
          { label: "intensity i", value: result.intensity.toFixed(3), tone: "signal" },
          { label: "first response R1", value: result.firstResponse.toFixed(3), tone: "active" },
          { label: "generation 2 response", value: result.trajectory[2] ? result.trajectory[2].response.toFixed(3) : "—", tone: "warning" },
        ], "Selection intensity and additive variance jointly determine response")
      );
      parts.controls.replaceChildren(
        rangeControl(el, "Starting phenotypic variance VP", selectionVp, {
          min: 0.5, max: 10, step: 0.1, format: (value) => Number(value).toFixed(1),
        }, (value) => { selectionVp = value; render(); }),
        rangeControl(el, "Starting h²", selectionH2, {
          min: 0.02, max: 0.9, step: 0.01, format: (value) => Number(value).toFixed(2),
        }, (value) => { selectionH2 = value; render(); }),
        rangeControl(el, "Top fraction retained", selectedFraction, {
          min: 0.01, max: 0.5, step: 0.01, format: (value) => percent(value, 0),
        }, (value) => { selectedFraction = value; render(); }),
        rangeControl(el, "Generations", selectionGenerations, {
          min: 2, max: 20, step: 1, format: (value) => compact(value, 0),
        }, (value) => { selectionGenerations = value; render(); }),
        el("div", { class: "readout" }, [
          stat((result.intensity * sigma0).toFixed(3), "selection differential S"),
          stat(result.firstResponse.toFixed(3), "R1 = h²S"),
          stat(result.trajectory[1].va.toFixed(3), "starting VA"),
          stat(result.trajectory[2] ? result.trajectory[2].va.toFixed(3) : "—", "VA entering generation 2"),
          stat(result.finalMean.toFixed(3), "modelled final mean"),
        ])
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "truncate", value: "retain top " + percent(selectedFraction, 0) + "; i = " + result.intensity.toFixed(3) },
        { key: "select parents", value: "S = iσP = " + (result.intensity * sigma0).toFixed(3) },
        { key: "transmit regression", value: "R1 = h²S = " + result.firstResponse.toFixed(3) },
        { key: "next generation", value: "negative LD lowers VA and h²" },
      ]));
      parts.explanation.className = "callout";
      parts.explanation.innerHTML = "<strong>Selection changes the distribution that made h².</strong> The solid trajectory reapplies the chapter’s one-generation Bulmer approximation; the dashed line naively freezes starting h². At the worked fixture VP = 4, h² = 0.45, top 10%, it reproduces i = 1.755, R₁ ≈ 1.58, VA₁ ≈ 1.463, and R₂ ≈ 1.34. This is an approximation, not a full finite-locus selection simulation.";
    }

    function renderPlateau() {
      const result = heritabilitySelectionModel({ kind: "plateau", cause: plateauCause, generations: 30 });
      const labels = {
        exhaustion: "VA exhaustion", drift: "drift", opposition: "opposing natural selection", limit: "physiological limit",
      };
      parts.visual.replaceChildren(
        el("div", { class: "quant-visual-stack", html: trajectorySvg(result.replicates, {
          label: "Five schematic replicate selection lines under " + labels[plateauCause] + ".",
        }) }),
        processBoard(el, [
          { label: "mechanism", value: result.diagnostic.mechanism, tone: "signal" },
          { label: "replicate signature", value: result.diagnostic.signature, tone: "active" },
          { label: "reverse selection", value: result.diagnostic.reverse },
        ], "Plateau causes are separated by interventions and replicate lines")
      );
      parts.controls.replaceChildren(
        el("div", { class: "lab-control-block" }, [
          el("span", { class: "lab-control-label", text: "Candidate plateau mechanism" }),
          choiceRow(el, [
            { label: "VA exhausted", value: "exhaustion" },
            { label: "Drift", value: "drift" },
            { label: "Natural selection opposes", value: "opposition" },
            { label: "Physiological limit", value: "limit" },
          ], plateauCause, (value) => { plateauCause = value; render(); }, "Selection plateau cause"),
        ]),
        el("div", { class: "readout" }, [
          stat(labels[plateauCause], "hypothesis"),
          stat(result.diagnostic.signature, "replicate test"),
          stat(result.diagnostic.reverse, "reverse-selection test"),
          stat(plateauCause === "drift" ? "≈ 2Ne × R1" : plateauCause === "limit" ? "direction-specific" : plateauCause === "opposition" ? "fitness cost rises" : "VA → 0", "signature shorthand"),
        ])
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "observation", value: "mean response has flattened" },
        { key: "discriminator 1", value: "compare independent replicate lines" },
        { key: "discriminator 2", value: "reverse or relax selection" },
        { key: "diagnosis", value: labels[plateauCause] },
      ]));
      parts.explanation.className = "callout";
      parts.explanation.innerHTML = "<strong>A flat mean is not a mechanism.</strong> These trajectories are schematic diagnostic signatures. Replicate divergence points to drift; retained VA plus regression after relaxation points to opposing fitness; directional asymmetry points to a physical bound; failure of reverse selection supports exhausted standing VA.";
    }

    function render() {
      parts.tabHost.replaceChildren(modeTabs());
      if (mode === "meaning") renderMeaning();
      else if (mode === "estimators") renderEstimators();
      else if (mode === "selection") renderSelection();
      else renderPlateau();
    }

    predict(body, {
      widget: "heritability-selection-lab",
      question: "Two gardens each show h² ≈ 1 for plant height, yet their mean heights differ greatly. What can you conclude about the mean difference?",
      hint: "Heritability partitions individual differences inside a specified population and environment.",
      options: [
        { label: "The mean difference must be genetic" },
        { label: "The mean difference can be entirely environmental", correct: true },
        { label: "The plants cannot respond to fertiliser" },
        { label: "Environmental variance must be identical in both gardens" },
      ],
    }, () => {
      mode = "meaning";
      meaningView = "context";
      contextVa = 4;
      contextVeA = 0.2;
      contextVeB = 0.2;
      contextMeanA = 5;
      contextMeanB = 12;
      parts.instrument.hidden = false;
      render();
    });
    finishLab(parts, body);
  });

  /* Ch 32 — Mapping quantitative traits -------------------------------- */

  define("qtl-mapping-lab", {
    "ch32-o1": "Attenuation mode derives r from Haldane distance, then applies 1−2r = exp(−2d) to additive effects and its square to dominance and variance explained.",
    "ch32-o2": "Scan mode contrasts a single QTL with a two-QTL ghost peak and shows how correctly placed composite cofactors split the expected profile.",
    "ch32-o3": "Threshold mode compares phenotype-permuted family-wise control with a marker-wise Bonferroni calculation and states that cofactor selection must be repeated inside every permutation.",
    "ch32-o4": "Design mode ranks F2, RIL, AIL, and NIL crosses by accumulated recombination, replication-based environmental averaging, genomic scope, and interval scale.",
    "ch32-o5": "Resolution mode evaluates the 1500/(N d-squared) support-interval approximation and demonstrates why marker density cannot replace informative recombinants.",
    "ch32-o6": "The same mode derives the experiment-specific detection floor from LOD and N and conditions on detection to visualise winner's-curse inflation.",
    "ch32-o7": "Human-mapping mode contrasts family linkage with historical-recombination association, then separates measured polygenicity from the harder-to-identify omnigenic core/peripheral proposal.",
  }, ({ body, el, stat, predict }) => {
    const parts = labParts(el);
    let mode = "attenuation";
    let distanceCm = 8;
    let qtlAdditive = 0.822;
    let qtlDominance = 0.4;
    let mapView = "scan";
    let scanFixture = "ghost";
    let scanMethod = "interval";
    let design = "f2";
    let designN = 400;
    let designReplicates = 4;
    let designGenerations = 20;
    let inferenceView = "threshold";
    let markerLog = Math.log10(1500);
    let resolutionN = 400;
    let effectSd = 0.52;
    let truePve = 0.02;
    let humanMethod = "linkage";

    function modeTabs() {
      return tabs(el, [
        { label: "Marker attenuation", value: "attenuation" },
        { label: "Scans & cross designs", value: "mapping" },
        { label: "Threshold & resolution", value: "inference" },
        { label: "Humans & evidence", value: "human" },
      ], mode, (value) => { mode = value; render(); });
    }

    function renderAttenuation() {
      const result = qtlMappingModel({
        kind: "attenuation", distanceCm, additive: qtlAdditive, dominance: qtlDominance,
      });
      parts.visual.replaceChildren(
        el("div", { class: "quant-visual-stack", html: attenuationSvg(result) }),
        statusStrip(el, [
          { label: "recombination r", value: result.r.toFixed(4) },
          { label: "additive factor", value: result.additiveFactor.toFixed(4), tone: "active" },
          { label: "dominance factor", value: result.dominanceFactor.toFixed(4), tone: "signal" },
          { label: "PVE retained", value: percent(result.pveRetained, 1), tone: result.pveRetained < 0.5 ? "warning" : "muted" },
        ], "Linkage attenuates the marker contrast without moving the QTL")
      );
      parts.controls.replaceChildren(
        rangeControl(el, "Marker–QTL distance", distanceCm, {
          min: 0, max: 60, step: 0.5, format: (value) => Number(value).toFixed(1) + " cM",
        }, (value) => { distanceCm = value; render(); }),
        rangeControl(el, "True additive QTL effect", qtlAdditive, {
          min: 0.05, max: 2, step: 0.01, format: (value) => Number(value).toFixed(2) + " SD",
        }, (value) => { qtlAdditive = value; render(); }),
        rangeControl(el, "True dominance effect", qtlDominance, {
          min: -1.5, max: 1.5, step: 0.05, format: (value) => Number(value).toFixed(2) + " SD",
        }, (value) => { qtlDominance = value; render(); }),
        el("div", { class: "readout" }, [
          stat(result.additiveFactor.toFixed(4), "1−2r = e⁻²ᵈ"),
          stat(result.observedAdditive.toFixed(3), "observed marker additive effect"),
          stat(result.observedDominance.toFixed(3), "observed marker dominance effect"),
          stat(result.sampleMultiplier.toFixed(2) + "×", "sample cost for equal power"),
        ])
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "hidden cause", value: "QTL effect " + qtlAdditive.toFixed(2) + " SD" },
        { key: "noisy proxy", value: "marker separated by " + distanceCm.toFixed(1) + " cM" },
        { key: "mixture", value: percent(result.r, 1) + " recombinant chromosomes reverse the contrast" },
        { key: "observable", value: "marker effect " + result.observedAdditive.toFixed(3) + " SD" },
      ]));
      parts.explanation.className = "callout";
      parts.explanation.innerHTML = "<strong>One marker contrast contains two unknowns: effect and distance.</strong> Recombination swaps the QTL background in fraction r, leaving (1−r)−r = 1−2r of the additive contrast. Under Haldane, that is e<sup>−2d</sup>. Interval mapping resolves the ambiguity by combining flanking-marker mixture probabilities across positions.";
    }

    function renderMapping() {
      const subTabs = choiceRow(el, [
        { label: "Expected LOD scan", value: "scan" },
        { label: "Cross-design currencies", value: "design" },
      ], mapView, (value) => { mapView = value; render(); }, "QTL mapping lesson");
      if (mapView === "scan") {
        const result = qtlMappingModel({ kind: "scan", fixture: scanFixture, method: scanMethod });
        parts.visual.replaceChildren(
          el("div", { class: "quant-visual-stack", html: lodScanSvg(result, 3.4) }),
          processBoard(el, scanFixture === "ghost" ? [
            { label: "truth", value: "two linked QTL at 36 and 64 cM", tone: "signal" },
            { label: "one-QTL interval model", value: scanMethod === "interval" ? "one broad maximum near 50 cM" : "condition on the alternate linked QTL" },
            { label: "current profile", value: scanMethod === "interval" ? "ghost peak between causes" : "two separated peaks", tone: scanMethod === "interval" ? "warning" : "active" },
            { label: "threshold audit", value: "repeat cofactor selection inside each phenotype permutation" },
          ] : [
            { label: "truth", value: "one QTL at 52 cM", tone: "signal" },
            { label: "flanking markers", value: "infer position-specific QTL-genotype probabilities" },
            { label: "likelihood comparison", value: "LOD = log10 L(QTL)/L(no QTL)" },
            { label: "profile", value: "peak localises the expected evidence, not the causal base", tone: "active" },
          ], "Expected scan logic")
        );
        parts.controls.replaceChildren(
          subTabs,
          el("div", { class: "lab-control-block" }, [
            el("span", { class: "lab-control-label", text: "Genetic fixture" }),
            choiceRow(el, [
              { label: "One QTL", value: "single" },
              { label: "Two linked QTL", value: "ghost" },
            ], scanFixture, (value) => { scanFixture = value; render(); }, "QTL scan fixture"),
          ]),
          scanFixture === "ghost" ? el("div", { class: "lab-control-block" }, [
            el("span", { class: "lab-control-label", text: "Mapping model" }),
            choiceRow(el, [
              { label: "Interval mapping", value: "interval" },
              { label: "Composite + cofactors", value: "composite" },
            ], scanMethod, (value) => { scanMethod = value; render(); }, "QTL mapping method"),
          ]) : el("span"),
          el("div", { class: "readout" }, [
            stat(result.truePositions.join(" & ") + " cM", "simulated causal positions"),
            stat(result.peak.x + " cM", "expected profile peak"),
            stat(result.peak.y.toFixed(2), "peak schematic LOD"),
            stat("illustrative expected profile", "status of curve"),
          ])
        );
        parts.rail.replaceChildren(causalRail(el, [
          { key: "genotype uncertainty", value: "mixture weights from flanking markers" },
          { key: "scan", value: "refit a QTL model at each position" },
          { key: "linked background", value: scanFixture === "ghost" && scanMethod === "interval" ? "unmodelled second effect bends the profile" : "conditioned or absent" },
          { key: "evidence", value: "maximum expected LOD at " + result.peak.x + " cM" },
        ]));
        parts.explanation.className = "callout " + (scanFixture === "ghost" && scanMethod === "interval" ? "callout-bad" : "");
        parts.explanation.innerHTML = scanFixture === "ghost" && scanMethod === "interval"
          ? "<strong>A peak need not sit on a QTL.</strong> This curve is a labelled schematic expected one-QTL scan: two linked effects can be fit best by one ghost position between them. Composite interval mapping conditions on the alternate region, but cofactor choice becomes part of the test and must be rerun within every permutation."
          : "<strong>A LOD profile is an evidence surface, not a photograph of a locus.</strong> The displayed curve is schematic. In real mapping, each position integrates uncertain QTL genotype from flanking markers and compares a QTL likelihood with the no-QTL model.";
        return;
      }
      const result = qtlMappingModel({
        kind: "design", design, n: designN, replicates: designReplicates,
        generations: designGenerations, vg: 1, ve: 2, rilMethod: "self",
      });
      parts.visual.replaceChildren(designBoard(el, result));
      parts.controls.replaceChildren(
        subTabs,
        el("div", { class: "lab-control-block" }, [
          el("span", { class: "lab-control-label", text: "Mapping population" }),
          choiceRow(el, [
            { label: "F2", value: "f2" },
            { label: "RIL", value: "ril" },
            { label: "AIL", value: "ail" },
            { label: "NIL", value: "nil" },
          ], design, (value) => { design = value; render(); }, "QTL cross design"),
        ]),
        rangeControl(el, "Individuals or lines", designN, {
          min: 50, max: 1200, step: 25, format: (value) => compact(value, 0),
        }, (value) => { designN = value; render(); }),
        (design === "ril" || design === "nil") ? rangeControl(el, "Phenotype replicates per line", designReplicates, {
          min: 1, max: 20, step: 1, format: (value) => compact(value, 0),
        }, (value) => { designReplicates = value; render(); }) : el("span"),
        design === "ail" ? rangeControl(el, "Random-mating generations", designGenerations, {
          min: 4, max: 80, step: 2, format: (value) => compact(value, 0),
        }, (value) => { designGenerations = value; render(); }) : el("span"),
        el("div", { class: "readout" }, [
          stat(result.mapExpansion.toFixed(1) + "×", "relative map length"),
          stat(compact(result.relativeBreakpoints, 0), "relative breakpoint budget"),
          stat(percent(result.lineMeanH2, 1), "heritability of line mean"),
          stat(result.intervalCm.toFixed(2) + " cM", "illustrative interval scale"),
        ])
      );
      const currencies = {
        f2: "fast whole-genome scan; one meiosis gives modest resolution and no line replication",
        ril: "inbreeding fixes mosaics; repeated phenotyping buys power and extra recombination expands the map",
        ail: "many random-mating generations buy recombination and resolution, but each animal remains unique",
        nil: "many recombinants plus replication buy fine resolution inside one preselected interval only",
      };
      parts.rail.replaceChildren(causalRail(el, [
        { key: "design", value: design.toUpperCase() },
        { key: "power currency", value: design === "ril" || design === "nil" ? "replicate stable genotypes to shrink VE" : "phenotype more individuals" },
        { key: "resolution currency", value: "accumulate informative recombination: " + result.mapExpansion.toFixed(1) + "× map" },
        { key: "scope cost", value: result.scope },
      ]));
      parts.explanation.className = "callout";
      parts.explanation.innerHTML = "<strong>Power and resolution are bought with different currencies.</strong> " + currencies[design] + ". The mosaic and interval outputs are transparent scaling illustrations; they are not universal design guarantees.";
    }

    function renderInference() {
      const subTabs = choiceRow(el, [
        { label: "Genome-wide threshold", value: "threshold" },
        { label: "Support interval & Beavis", value: "resolution" },
      ], inferenceView, (value) => { inferenceView = value; render(); }, "QTL inference lesson");
      if (inferenceView === "threshold") {
        const markers = Math.round(Math.pow(10, markerLog));
        const result = qtlMappingModel({ kind: "threshold", markers });
        parts.visual.replaceChildren(
          barBoard(el, [
            { label: "phenotype-permutation threshold", value: result.permutationLod, display: result.permutationLod.toFixed(2), tone: "active" },
            { label: "marker-wise Bonferroni", value: result.bonferroniLod, display: result.bonferroniLod.toFixed(2), tone: "warning" },
          ], "Genome-wide LOD thresholds", Math.max(result.bonferroniLod, 6)),
          processBoard(el, [
            { label: "hold fixed", value: "genotypes, LD, missingness, kinship, covariates", tone: "signal" },
            { label: "break", value: "phenotype–genotype pairing under the null" },
            { label: "each permutation", value: "repeat the entire scan and record max LOD" },
            { label: "pipeline rule", value: "repeat cofactor selection inside the loop", tone: "warning" },
          ], "Permutation preserves the experiment's dependence structure")
        );
        parts.controls.replaceChildren(
          subTabs,
          rangeControl(el, "Typed markers (log₁₀)", markerLog, {
            min: Math.log10(50), max: Math.log10(100000), step: 0.05,
            format: (value) => compact(Math.round(Math.pow(10, value)), 0),
          }, (value) => { markerLog = value; render(); }),
          el("div", { class: "readout" }, [
            stat(compact(markers, 0), "typed markers"),
            stat(compact(result.effectiveTests, 0), "illustrative correlated-test count"),
            stat(result.bonferroniLod.toFixed(3), "Bonferroni LOD approximation"),
            stat(result.permutationLod.toFixed(2), "chapter permutation fixture"),
          ])
        );
        parts.rail.replaceChildren(causalRail(el, [
          { key: "multiple scan", value: compact(markers, 0) + " correlated marker tests" },
          { key: "Bonferroni", value: "pretends each typed marker adds an independent opportunity" },
          { key: "permutation", value: "measures the null maximum of this actual genome and design" },
        ]));
        parts.explanation.className = "callout";
        parts.explanation.innerHTML = "<strong>Permutation preserves what Bonferroni discards.</strong> Genotype correlation, family structure, missingness, and the scan algorithm remain intact while phenotype labels are broken under the null. The 3.4 LOD value is the chapter’s worked fixture; a real study must generate its own null distribution.";
        return;
      }
      const result = qtlMappingModel({
        kind: "resolution", n: resolutionN, effectSd, thresholdLod: 3.4, truePve,
      });
      parts.visual.replaceChildren(
        barBoard(el, [
          { label: "true PVE", value: result.truePve, display: percent(result.truePve, 2), tone: "signal" },
          { label: "minimum reportable PVE", value: result.detectionFloor, display: percent(result.detectionFloor, 2), tone: "warning" },
          { label: "mean PVE among detected hits", value: Math.min(result.detectedPve, 1), display: percent(result.detectedPve, 2), tone: "active" },
        ], "Selection on significance inflates reported effects", Math.max(0.1, result.detectedPve)),
        statusStrip(el, [
          { label: "support interval", value: result.intervalCm.toFixed(1) + " cM", tone: "signal" },
          { label: "detection floor", value: percent(result.detectionFloor, 2), tone: "warning" },
          { label: "approximate power", value: percent(result.power, 1) },
          { label: "winner's-curse factor", value: result.inflation.toFixed(2) + "×", tone: result.inflation > 1.3 ? "warning" : "muted" },
        ], "Sample size sets both localisation and the smallest publishable effect")
      );
      parts.controls.replaceChildren(
        subTabs,
        rangeControl(el, "Mapping individuals N", resolutionN, {
          min: 100, max: 3000, step: 50, format: (value) => compact(value, 0),
        }, (value) => { resolutionN = value; render(); }),
        rangeControl(el, "Standardised substitution effect d", effectSd, {
          min: 0.1, max: 1.2, step: 0.02, format: (value) => Number(value).toFixed(2) + " SD",
        }, (value) => { effectSd = value; render(); }),
        rangeControl(el, "True PVE", truePve, {
          min: 0.002, max: 0.2, step: 0.002, format: (value) => percent(value, 1),
        }, (value) => { truePve = value; render(); }),
        el("div", { class: "readout" }, [
          stat(result.intervalCm.toFixed(2) + " cM", "1500/(N d²) support interval"),
          stat(percent(result.detectionFloor, 2), "4.605 × LOD/N detection floor"),
          stat(percent(result.power, 1), "normal-approximation detection power"),
          stat(percent(result.detectedPve, 2), "conditional mean reported PVE"),
        ])
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "informative events", value: compact(resolutionN, 0) + " meioses and effect d = " + effectSd.toFixed(2) },
        { key: "localisation", value: "interval ≈ " + result.intervalCm.toFixed(1) + " cM; denser markers do not add recombinants" },
        { key: "publication filter", value: "only estimates above about " + percent(result.detectionFloor, 1) + " PVE cross LOD 3.4" },
        { key: "conditioned report", value: result.inflation.toFixed(2) + "× average inflation in this approximation" },
      ]));
      parts.explanation.className = "callout " + (result.inflation > 1.3 ? "callout-bad" : "");
      parts.explanation.innerHTML = "<strong>Genotyping density cannot manufacture crossovers.</strong> The support-interval formula contracts with N and d², not marker count once recombinants are located. The winner’s-curse panel uses a labelled normal detection approximation: when true effects sit below the experiment’s floor, only upward-noise realisations are reported.";
    }

    function renderHuman() {
      const result = qtlMappingModel({ kind: "human", method: humanMethod });
      parts.visual.replaceChildren(evidenceBoundaryBoard(el, result));
      parts.controls.replaceChildren(
        el("div", { class: "lab-control-block" }, [
          el("span", { class: "lab-control-label", text: "Evidence frame" }),
          choiceRow(el, [
            { label: "Pedigree linkage", value: "linkage" },
            { label: "Population association", value: "association" },
            { label: "Omnigenic proposal", value: "omnigenic" },
          ], humanMethod, (value) => { humanMethod = value; render(); }, "Human complex-trait evidence frame"),
        ]),
        el("div", { class: "readout" }, [
          stat(result.recombination, "historical information"),
          stat(result.effect, "effect regime"),
          stat(result.resolution, "resolution or inferential status"),
          stat(result.failure, "claim boundary"),
        ])
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "available recombination", value: result.recombination },
        { key: "detectable architecture", value: result.effect },
        { key: "legitimate inference", value: result.outcome },
        { key: "do not overclaim", value: result.failure },
      ]));
      parts.explanation.className = "callout";
      if (humanMethod === "linkage") {
        parts.explanation.innerHTML = "<strong>Linkage solved Mendelian disease because families offer high signal per recombination.</strong> A rare, penetrant allele co-segregates cleanly even though resolution is broad. Thousands of tiny heterogeneous effects do not create repeatable within-family peaks, so complex-trait linkage stalled.";
      } else if (humanMethod === "association") {
        parts.explanation.innerHTML = "<strong>GWAS trades effect size for historical recombination and cohort size.</strong> Millions of ancestral meioses can localise common tagged effects to LD blocks, but association is still not a causal gene. Stratification, allelic heterogeneity, and G×E need separate designs and interaction tests with much larger samples.";
      } else {
        parts.explanation.innerHTML = "<strong>Broad polygenicity is measured; the omnigenic mechanism remains a proposal.</strong> Heritability is demonstrably distributed across many loci. The further claim—that peripheral genes act through a smaller core set—is harder to identify, and a useful model must add testable prediction beyond saying that networks are connected.";
      }
    }

    function render() {
      parts.tabHost.replaceChildren(modeTabs());
      if (mode === "attenuation") renderAttenuation();
      else if (mode === "mapping") renderMapping();
      else if (mode === "inference") renderInference();
      else renderHuman();
    }

    predict(body, {
      widget: "qtl-mapping-lab",
      question: "An F2 marker 8 cM from a QTL shows a 0.70 SD additive contrast. Is the QTL’s true effect smaller, equal, or larger?",
      hint: "Recombinants make marker groups less different than the hidden causal genotypes.",
      options: [
        { label: "Smaller—about 0.60 SD" },
        { label: "Equal—0.70 SD" },
        { label: "Larger—about 0.82 SD", correct: true },
        { label: "Distance affects only dominance" },
      ],
    }, () => {
      mode = "attenuation";
      distanceCm = 8;
      qtlAdditive = 0.822;
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
