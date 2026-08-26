/* ── Human, statistical, clinical, and societal genomics interaction wave ──
   Objective-mapped Hero Labs for Chapters 51–58. Every lab keeps four layers
   visibly separate:

        observation → model / design → inference → licensed claim

   The numerical pieces below are pure functions so limiting cases and
   chapter fixtures can be checked independently of the browser renderer.
   Rendering is dependency-free and remains usable from file://.
   ───────────────────────────────────────────────────────────────────────── */

(function (global) {
  "use strict";

  const definitions = {};
  const models = {};
  const coverage = {};
  const kit = global.ReaderInteractionKit;
  if (!kit) throw new Error("ReaderInteractionKit must load before human-genomics labs");

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

  function sum(values) {
    return values.reduce((total, value) => total + value, 0);
  }

  function mean(values) {
    return values.length ? sum(values) / values.length : NaN;
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

  // Abramowitz-Stegun erf approximation; maximum error is about 1.5e-7.
  function normalCdf(value) {
    const sign = value < 0 ? -1 : 1;
    const x = Math.abs(value) / Math.sqrt(2);
    const t = 1 / (1 + 0.3275911 * x);
    const polynomial = (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t
      - 0.284496736) * t + 0.254829592) * t;
    const erf = sign * (1 - polynomial * Math.exp(-x * x));
    return 0.5 * (1 + erf);
  }

  // Peter Acklam's inverse-normal approximation, adequate for teaching models.
  function inverseNormal(probability) {
    const p = clamp(probability, 1e-12, 1 - 1e-12);
    const a = [-39.69683028665376, 220.9460984245205, -275.9285104469687,
      138.357751867269, -30.66479806614716, 2.506628277459239];
    const b = [-54.47609879822406, 161.5858368580409, -155.6989798598866,
      66.80131188771972, -13.28068155288572];
    const c = [-0.007784894002430293, -0.3223964580411365, -2.400758277161838,
      -2.549732539343734, 4.374664141464968, 2.938163982698783];
    const d = [0.007784695709041462, 0.3224671290700398, 2.445134137142996,
      3.754408661907416];
    const low = 0.02425;
    const high = 1 - low;
    if (p < low) {
      const q = Math.sqrt(-2 * Math.log(p));
      return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
        ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
    }
    if (p > high) {
      const q = Math.sqrt(-2 * Math.log(1 - p));
      return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
        ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
    }
    const q = p - 0.5;
    const r = q * q;
    return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
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
      instrument: el("div", { class: "hero-lab human-lab", hidden: true }),
      tabHost: el("div"),
      visual: el("div", { class: "lab-visual human-visual" }),
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

  function matrixBoard(el, columns, rows, label) {
    const board = el("div", {
      class: "genomics-matrix human-matrix",
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

  function claimBoundary(el, measured, excluded, boundary) {
    return el("div", {
      class: "methods-claim-shutter human-claim-shutter",
      role: "img",
      "aria-label": "Measured: " + measured + ". Not measured: " + excluded + ". Claim boundary: " + boundary,
    }, [
      el("div", { class: "methods-claim-half is-open" }, [
        el("span", { text: "measured" }),
        el("strong", { text: measured }),
      ]),
      el("div", { class: "methods-claim-gate", "aria-hidden": "true", text: "≠" }),
      el("div", { class: "methods-claim-half is-closed" }, [
        el("span", { text: "not established" }),
        el("strong", { text: excluded }),
      ]),
      el("p", { text: boundary }),
    ]);
  }

  function pointPlot(el, points, options) {
    const plot = el("div", {
      class: "human-point-plot" + (options && options.className ? " " + options.className : ""),
      role: "img",
      "aria-label": options.label + ". " + points.map((point) =>
        point.label + " at " + compact(point.x, 2) + ", " + compact(point.y, 2)
      ).join(". "),
    });
    plot.append(
      el("span", { class: "human-axis-label is-y", text: options.yLabel }),
      el("span", { class: "human-axis-label is-x", text: options.xLabel }),
      el("div", { class: "human-point-field", "aria-hidden": "true" })
    );
    const field = plot.querySelector(".human-point-field");
    const xMin = options.xMin == null ? 0 : options.xMin;
    const xMax = options.xMax == null ? 1 : options.xMax;
    const yMin = options.yMin == null ? 0 : options.yMin;
    const yMax = options.yMax == null ? 1 : options.yMax;
    if (options.diagonal) field.append(el("i", { class: "human-diagonal" }));
    points.forEach((point) => field.append(el("i", {
      class: "human-point is-" + (point.tone || "active"),
      style: "left:" + clamp(100 * (point.x - xMin) / Math.max(1e-12, xMax - xMin), 1, 99).toFixed(2) +
        "%;bottom:" + clamp(100 * (point.y - yMin) / Math.max(1e-12, yMax - yMin), 1, 99).toFixed(2) + "%",
    }, [el("span", { text: point.short || point.label })])));
    return plot;
  }

  function probabilityGrid(el, truePositive, falsePositive, total, label) {
    const size = Math.max(1, Math.round(total));
    const tp = clamp(Math.round(truePositive), 0, size);
    const fp = clamp(Math.round(falsePositive), 0, size - tp);
    const grid = el("div", {
      class: "human-probability-grid",
      role: "img",
      "aria-label": label + ". " + tp + " true positives, " + fp + " false positives, " +
        (size - tp - fp) + " negative results in " + size + " people.",
      style: "--probability-columns:" + Math.ceil(Math.sqrt(size)),
    });
    for (let index = 0; index < size; index += 1) {
      const tone = index < tp ? "true" : index < tp + fp ? "false" : "negative";
      grid.append(el("i", { class: "is-" + tone, "aria-hidden": "true" }));
    }
    return grid;
  }

  function locusPlot(el, variants, label) {
    const max = Math.max(1e-12, ...variants.map((variant) => variant.value));
    const plot = el("div", {
      class: "human-locus-plot",
      role: "img",
      "aria-label": label + ". " + variants.map((variant) =>
        variant.label + " " + (variant.display || compact(variant.value, 3))
      ).join(". "),
    });
    plot.append(el("div", { class: "human-locus-axis", "aria-hidden": "true" }));
    variants.forEach((variant, index) => plot.append(el("div", {
      class: "human-locus-mark is-" + (variant.tone || "active"),
      style: "left:" + (8 + index * (84 / Math.max(1, variants.length - 1))).toFixed(2) + "%;" +
        // Reserve the upper third of the plot for value labels. Percentage
        // heights are relative to the entire plot, including its lower axis
        // gutter, so allowing stems near 100% clips the label above the mark.
        "--mark-height:" + clamp(14 + 38 * variant.value / max, 14, 52).toFixed(2) + "%",
    }, [
      variant.showValue === false ? null :
        el("span", { class: "human-locus-value", text: variant.display || compact(variant.value, 2) }),
      el("i", { "aria-hidden": "true" }),
      variant.showLabel === false ? null : el("strong", { text: variant.short || variant.label }),
    ].filter(Boolean))));
    return plot;
  }

  function branchBoard(el, root, branches, label) {
    const board = el("div", {
      class: "human-branch-board",
      role: "img",
      "aria-label": label + ". Root: " + root + ". " + branches.map((branch) =>
        branch.label + ": " + branch.value
      ).join(". "),
    });
    board.append(el("div", { class: "human-branch-root" }, [
      el("span", { text: "ancestor" }), el("strong", { text: root }),
    ]));
    const fork = el("div", { class: "human-branch-fork" });
    branches.forEach((branch) => fork.append(el("div", {
      class: "human-branch is-" + (branch.tone || "active"),
    }, [
      el("i", { "aria-hidden": "true" }),
      el("span", { text: branch.label }),
      el("strong", { text: branch.value }),
    ])));
    board.append(fork);
    return board;
  }

  /* Pure models -------------------------------------------------------- */

  function gwasModel(input) {
    if (input.kind === "dosage") {
      const p = clamp(input.p, 1e-9, 1 - 1e-9);
      const q = 1 - p;
      const a = input.a;
      const d = input.d;
      const alpha = a + d * (q - p);
      const additiveVariance = 2 * p * q * alpha * alpha;
      const dominanceVariance = Math.pow(2 * p * q * d, 2);
      const total = additiveVariance + dominanceVariance;
      return {
        p, q, alpha, additiveVariance, dominanceVariance,
        additiveFraction: total > 0 ? additiveVariance / total : 0,
      };
    }
    if (input.kind === "structure") {
      const w = clamp(input.w, 0, 1);
      const p1 = clamp(input.p1, 0, 1);
      const p2 = clamp(input.p2, 0, 1);
      const mu1 = input.mu1;
      const mu2 = input.mu2;
      const n = Math.max(1, input.n);
      const covariance = 2 * w * (1 - w) * (p1 - p2) * (mu1 - mu2);
      const eg = w * 2 * p1 + (1 - w) * 2 * p2;
      const within = w * 2 * p1 * (1 - p1) + (1 - w) * 2 * p2 * (1 - p2);
      const between = w * Math.pow(2 * p1 - eg, 2) + (1 - w) * Math.pow(2 * p2 - eg, 2);
      const genotypeVariance = within + between;
      const rawBias = genotypeVariance > 0 ? covariance / genotypeVariance : 0;
      let residualFraction = 1;
      if (input.design === "pc") residualFraction = 1 - clamp(input.capture, 0, 1);
      if (input.design === "mixed") residualFraction = 1 - clamp(input.capture, 0, 1);
      if (input.design === "sibling") residualFraction = 0;
      const bias = rawBias * residualFraction;
      const z = bias * Math.sqrt(n * Math.max(genotypeVariance, 1e-12));
      return { covariance, genotypeVariance, rawBias, residualFraction, bias, z };
    }
    if (input.kind === "inflation") {
      const n = Math.max(1, input.n);
      const h2 = clamp(input.h2, 0, 1);
      const variants = Math.max(1, input.variants);
      const ldScore = Math.max(0, input.ldScore);
      const confounding = Math.max(0, input.confounding);
      const polygenic = n * h2 * ldScore / variants;
      const intercept = 1 + n * confounding;
      const expectedChiSquare = 1 + polygenic + n * confounding;
      const attenuationRatio = expectedChiSquare > 1 ? (intercept - 1) / (expectedChiSquare - 1) : 0;
      return { polygenic, intercept, expectedChiSquare, attenuationRatio };
    }
    if (input.kind === "threshold") {
      const effectiveTests = Math.max(1, input.effectiveTests);
      return { effectiveTests, threshold: 0.05 / effectiveTests };
    }
    if (input.kind === "winner") {
      const observed = input.observed;
      const se = Math.max(1e-9, input.se);
      const priorSd = Math.max(1e-9, input.priorSd);
      const shrinkage = priorSd * priorSd / (priorSd * priorSd + se * se);
      return { observed, se, priorSd, shrinkage, posteriorMean: observed * shrinkage };
    }
    if (input.kind === "tag") {
      const r2 = clamp(input.r2, 0, 1);
      const targetR2 = clamp(input.targetR2 == null ? r2 : input.targetR2, 0, 1);
      const causalEffect = input.causalEffect;
      return {
        r2, targetR2, causalEffect,
        markerEffect: Math.sqrt(r2) * causalEffect,
        ncpFraction: r2,
        targetNcpFraction: targetR2,
        portabilityRatio: r2 > 0 ? targetR2 / r2 : 0,
      };
    }
    throw new Error("Unknown GWAS model");
  }
  models.gwas = gwasModel;

  function mechanismModel(input) {
    if (input.kind === "fineMap") {
      const z = input.z.slice();
      const variances = input.variances ? input.variances.slice() : z.map(() => 1);
      const priors = input.priors ? input.priors.slice() : z.map(() => 1 / z.length);
      const effectVariance = Math.max(1e-12, input.effectVariance == null ? 1 : input.effectVariance);
      const logWeights = z.map((score, index) => {
        const v = Math.max(1e-12, variances[index]);
        const shrink = effectVariance / (v + effectVariance);
        return Math.log(Math.max(1e-300, priors[index])) +
          0.5 * Math.log(v / (v + effectVariance)) + 0.5 * score * score * shrink;
      });
      const maxLog = Math.max(...logWeights);
      const weights = logWeights.map((value) => Math.exp(value - maxLog));
      const denominator = sum(weights);
      const pips = weights.map((value) => value / denominator);
      const order = pips.map((pip, index) => ({ index, pip })).sort((a, b) => b.pip - a.pip);
      let mass = 0;
      const credibleSet = [];
      for (const item of order) {
        credibleSet.push(item.index);
        mass += item.pip;
        if (mass >= 0.95) break;
      }
      return { pips, credibleSet, mass };
    }
    if (input.kind === "resolution") {
      const r2 = clamp(input.r2, 0, 1);
      const varianceExplained = Math.max(1e-12, input.varianceExplained);
      const bayesFactor = Math.max(1 + 1e-12, input.bayesFactor);
      return {
        r2, varianceExplained, bayesFactor,
        sampleSize: r2 >= 1 ? Infinity : 2 * Math.log(bayesFactor) / ((1 - r2) * varianceExplained),
      };
    }
    if (input.kind === "abc") {
      const activities = input.activities.map((value) => Math.max(0, value));
      const contacts = input.contacts.map((value) => Math.max(0, value));
      const products = activities.map((value, index) => value * contacts[index]);
      const denominator = sum(products);
      return { products, scores: products.map((value) => denominator > 0 ? value / denominator : 0) };
    }
    if (input.kind === "coloc") {
      const fixtures = {
        shared: [0.005, 0.01, 0.01, 0.075, 0.90],
        distinct: [0.005, 0.01, 0.01, 0.90, 0.075],
        underpowered: [0.58, 0.24, 0.12, 0.03, 0.03],
      };
      const posterior = fixtures[input.scenario] || fixtures.shared;
      const conditionalShared = posterior[3] + posterior[4] > 0
        ? posterior[4] / (posterior[3] + posterior[4]) : 0;
      return { posterior: posterior.slice(), conditionalShared };
    }
    if (input.kind === "mr") {
      const x = input.exposureEffects.slice();
      const y = input.outcomeEffects.slice();
      const originSlope = sum(x.map((value, index) => value * y[index])) /
        Math.max(1e-12, sum(x.map((value) => value * value)));
      const mx = mean(x);
      const my = mean(y);
      const centered = sum(x.map((value, index) => (value - mx) * (y[index] - my)));
      const spread = sum(x.map((value) => Math.pow(value - mx, 2)));
      const eggerSlope = spread > 0 ? centered / spread : 0;
      const eggerIntercept = my - eggerSlope * mx;
      return { originSlope, eggerSlope, eggerIntercept };
    }
    throw new Error("Unknown association-to-mechanism model");
  }
  models.mechanism = mechanismModel;

  function polygenicModel(input) {
    if (input.kind === "score") {
      const contributions = input.weights.map((weight, index) => weight * input.dosages[index]);
      return { contributions, score: sum(contributions) };
    }
    if (input.kind === "ld") {
      const tags = Math.max(0, Math.round(input.tags));
      const r = clamp(input.r, -1, 1);
      const causalEffect = input.causalEffect;
      const naive = tags * r * causalEffect;
      return { tags, r, causalEffect, marginalTagEffect: r * causalEffect, naive, overcount: causalEffect === 0 ? 0 : naive / causalEffect };
    }
    if (input.kind === "risk") {
      const prevalence = clamp(input.prevalence, 1e-9, 1 - 1e-9);
      const liabilityR2 = clamp(input.liabilityR2, 0, 1 - 1e-9);
      const score = input.score;
      const threshold = inverseNormal(1 - prevalence);
      const rho = Math.sqrt(liabilityR2);
      const risk = normalCdf((rho * score - threshold) / Math.sqrt(1 - liabilityR2));
      return { prevalence, liabilityR2, score, threshold, risk, relativeToPopulation: risk / prevalence };
    }
    if (input.kind === "auc") {
      const prevalence = clamp(input.prevalence, 1e-9, 1 - 1e-9);
      const r2 = clamp(input.liabilityR2, 0, 1 - 1e-9);
      const rho = Math.sqrt(r2);
      const threshold = inverseNormal(1 - prevalence);
      const density = Math.exp(-0.5 * threshold * threshold) / Math.sqrt(2 * Math.PI);
      const i = density / prevalence;
      const j = density / (1 - prevalence);
      const denominator = Math.sqrt((1 - r2 * i * (i - threshold)) +
        (1 - r2 * j * (j + threshold)));
      return { auc: normalCdf(rho * (i + j) / denominator), threshold };
    }
    if (input.kind === "portability") {
      const trainR = clamp(input.trainR, -1, 1);
      const targetR = clamp(input.targetR, -1, 1);
      const trainTagP = clamp(input.trainP, 1e-9, 1 - 1e-9);
      const targetTagP = clamp(input.targetP, 1e-9, 1 - 1e-9);
      // This deliberately compact proxy combines tagging magnitude with the
      // variance of the scored marker. It is not a transported-PRS accuracy
      // formula: a one-marker scaling cannot reproduce a whole-score R².
      const source = trainR * trainR * 2 * trainTagP * (1 - trainTagP);
      const target = targetR * targetR * 2 * targetTagP * (1 - targetTagP);
      const signalRatio = source > 0 ? target / source : 0;
      const direction = trainR === 0 || targetR === 0 ? "no tagged signal" :
        trainR * targetR > 0 ? "retained" : "reversed";
      return {
        source, target, signalRatio, direction,
        // Retain the earlier field as an API alias while making the displayed
        // semantics explicit at the call site.
        accuracyRatio: signalRatio,
      };
    }
    throw new Error("Unknown polygenic-score model");
  }
  models.polygenic = polygenicModel;

  function rareVariantModel(input) {
    if (input.kind === "balance") {
      const mutationRate = Math.max(0, input.mutationRate);
      const selection = Math.max(1e-12, input.selection);
      const dominance = clamp(input.dominance, 0, 1);
      return {
        dominantFrequency: dominance > 0 ? mutationRate / (dominance * selection) : Infinity,
        recessiveFrequency: Math.sqrt(mutationRate / selection),
      };
    }
    if (input.kind === "power") {
      const p = clamp(input.p, 1e-12, 1 - 1e-12);
      const beta = input.beta;
      const r2 = 2 * p * (1 - p) * beta * beta;
      return { r2, sampleSize: r2 > 0 ? 40 / r2 : Infinity };
    }
    if (input.kind === "carrierFloor") {
      const carriers = Math.max(0, Math.round(input.carriers));
      const minimumP = Math.pow(2, -carriers);
      const twoSidedMinimumP = Math.min(1, 2 * minimumP);
      return {
        carriers,
        minimumP,
        oneSidedMinimumP: minimumP,
        twoSidedMinimumP,
        genomeWidePossible: minimumP <= 5e-8,
        twoSidedGenomeWidePossible: twoSidedMinimumP <= 5e-8,
      };
    }
    if (input.kind === "tagging") {
      const p = clamp(input.rareFrequency, 1e-12, 1 - 1e-12);
      const q = clamp(input.tagFrequency, p, 1 - 1e-12);
      const maxR2 = p * (1 - q) / (q * (1 - p));
      return { maxR2, samplePenalty: maxR2 > 0 ? 1 / maxR2 : Infinity };
    }
    if (input.kind === "frequency") {
      const prevalence = Math.max(0, input.prevalence);
      const penetrance = clamp(input.penetrance, 1e-12, 1);
      const heterogeneity = clamp(input.heterogeneity, 0, 1);
      return {
        dominant: heterogeneity * prevalence / (2 * penetrance),
        recessive: Math.sqrt(heterogeneity * prevalence / penetrance),
      };
    }
    if (input.kind === "deNovo") {
      const real = Math.max(0, input.real);
      const sites = Math.max(0, input.sites);
      const artifactRate = Math.max(0, input.artifactRate);
      const falseCalls = sites * artifactRate;
      return { real, falseCalls, falseDiscoveryRate: real + falseCalls > 0 ? falseCalls / (real + falseCalls) : 0 };
    }
    if (input.kind === "aggregate") {
      const effects = input.effects.slice();
      const burdenSignal = effects.length ? Math.pow(sum(effects), 2) / effects.length : 0;
      const skatSignal = sum(effects.map((value) => value * value));
      const causalFraction = clamp(input.causalFraction == null ? 1 : input.causalFraction, 0, 1);
      return { burdenSignal, skatSignal, dilution: causalFraction };
    }
    throw new Error("Unknown rare-variant model");
  }
  models.rareVariant = rareVariantModel;

  function clinicalModel(input) {
    if (input.kind === "posterior") {
      const prior = clamp(input.prior == null ? 0.10 : input.prior, 1e-12, 1 - 1e-12);
      const veryStrongOdds = Math.max(1 + 1e-12, input.veryStrongOdds == null ? 350 : input.veryStrongOdds);
      const points = input.points;
      const oddsPath = Math.pow(veryStrongOdds, points / 8);
      const posterior = prior * oddsPath / (prior * oddsPath + (1 - prior));
      // The Tavtigian π=0.10, X=350 calibration puts six points at 0.89991;
      // the guideline's stated 0.90 boundary and integer point threshold are
      // the same after its published rounding, so retain that tolerance.
      const tier = posterior > 0.99 ? "Pathogenic" : posterior >= 0.8999 ? "Likely pathogenic" :
        posterior >= 0.10 ? "Uncertain significance" : posterior >= 0.001 ? "Likely benign" : "Benign";
      return { prior, veryStrongOdds, points, oddsPath, posterior, tier };
    }
    if (input.kind === "frequency") {
      return rareVariantModel(Object.assign({}, input, { kind: "frequency" }));
    }
    if (input.kind === "oddsPath") {
      const pathogenicControls = Math.max(1, input.pathogenicControls);
      const benignControls = Math.max(1, input.benignControls);
      const abnormalPathogenic = clamp(input.abnormalPathogenic, 0, pathogenicControls);
      const abnormalBenign = clamp(input.abnormalBenign, 0, benignControls);
      const sensitivity = abnormalPathogenic / pathogenicControls;
      const falsePositiveRate = abnormalBenign / benignControls;
      const oddsPath = falsePositiveRate === 0 ? Infinity : sensitivity / falsePositiveRate;
      const corrected = ((abnormalPathogenic + 0.5) / (pathogenicControls + 1)) /
        ((abnormalBenign + 0.5) / (benignControls + 1));
      return { sensitivity, falsePositiveRate, oddsPath, continuityCorrected: corrected };
    }
    if (input.kind === "segregation") {
      const meioses = Math.max(0, Math.round(input.meioses));
      const likelihoodRatio = Math.pow(2, meioses);
      return { meioses, likelihoodRatio, lod: Math.log10(likelihoodRatio) };
    }
    throw new Error("Unknown clinical-interpretation model");
  }
  models.clinical = clinicalModel;

  const SIGNATURE_PROFILES = {
    age: [0.05, 0.03, 0.72, 0.05, 0.10, 0.05],
    tobacco: [0.68, 0.06, 0.05, 0.08, 0.07, 0.06],
    uv: [0.03, 0.03, 0.78, 0.04, 0.07, 0.05],
    apobec: [0.03, 0.19, 0.44, 0.04, 0.24, 0.06],
  };

  function cancerModel(input) {
    if (input.kind === "recurrence") {
      const baseRate = Math.max(0, input.baseRate);
      const length = Math.max(0, input.length);
      const samples = Math.max(0, input.samples);
      const rateRatio = Math.max(0, input.rateRatio);
      const expected = baseRate * length * samples;
      const observed = rateRatio * expected;
      const z = expected > 0 ? (observed - expected) / Math.sqrt(expected) : 0;
      return { expected, observed, z };
    }
    if (input.kind === "ccf") {
      const purity = clamp(input.purity, 1e-9, 1);
      const vaf = clamp(input.vaf, 0, 1);
      const tumourCopyNumber = Math.max(0, input.tumourCopyNumber);
      const normalCopyNumber = Math.max(0, input.normalCopyNumber == null ? 2 : input.normalCopyNumber);
      const multiplicity = Math.max(1e-9, input.multiplicity);
      const ccf = vaf * (purity * tumourCopyNumber + (1 - purity) * normalCopyNumber) /
        (purity * multiplicity);
      return { ccf };
    }
    if (input.kind === "resistance") {
      const initialResistant = clamp(input.initialResistant, 0, 1);
      const cycles = Math.max(0, input.cycles);
      const sensitiveFitness = input.sensitiveFitness;
      const resistantFitness = input.resistantFitness;
      const sensitive = (1 - initialResistant) * Math.exp(sensitiveFitness * cycles);
      const resistant = initialResistant * Math.exp(resistantFitness * cycles);
      const total = sensitive + resistant;
      return { sensitiveFraction: total > 0 ? sensitive / total : 0, resistantFraction: total > 0 ? resistant / total : 0 };
    }
    if (input.kind === "signature") {
      const first = SIGNATURE_PROFILES[input.first] || SIGNATURE_PROFILES.age;
      const second = SIGNATURE_PROFILES[input.second] || SIGNATURE_PROFILES.tobacco;
      const mixture = clamp(input.mixture, 0, 1);
      return { profile: first.map((value, index) => mixture * value + (1 - mixture) * second[index]) };
    }
    if (input.kind === "twoHit") {
      const age = Math.max(0, input.age);
      const events = Math.max(1, Math.round(input.events));
      return { incidenceShape: events === 1 ? 1 : Math.pow(age, events - 1) };
    }
    throw new Error("Unknown cancer-genomics model");
  }
  models.cancer = cancerModel;

  function practiceModel(input) {
    if (input.kind === "ppv") {
      const prevalence = clamp(input.prevalence, 0, 1);
      const sensitivity = clamp(input.sensitivity, 0, 1);
      const specificity = clamp(input.specificity, 0, 1);
      const truePositive = sensitivity * prevalence;
      const falsePositive = (1 - specificity) * (1 - prevalence);
      return { truePositive, falsePositive, ppv: truePositive + falsePositive > 0 ? truePositive / (truePositive + falsePositive) : 0 };
    }
    if (input.kind === "posteriorOdds") {
      const prior = clamp(input.prior, 1e-15, 1 - 1e-15);
      const likelihoodRatio = Math.max(0, input.likelihoodRatio);
      const priorOdds = prior / (1 - prior);
      const posteriorOdds = priorOdds * likelihoodRatio;
      return { priorOdds, posteriorOdds, posterior: posteriorOdds / (1 + posteriorOdds) };
    }
    if (input.kind === "composition") {
      const aBefore = Math.max(0, input.aBefore);
      const bBefore = Math.max(0, input.bBefore);
      const aAfter = Math.max(0, input.aAfter);
      const bAfter = Math.max(0, input.bAfter);
      const beforeTotal = aBefore + bBefore;
      const afterTotal = aAfter + bAfter;
      return {
        aBeforeShare: beforeTotal > 0 ? aBefore / beforeTotal : 0,
        bBeforeShare: beforeTotal > 0 ? bBefore / beforeTotal : 0,
        aAfterShare: afterTotal > 0 ? aAfter / afterTotal : 0,
        bAfterShare: afterTotal > 0 ? bAfter / afterTotal : 0,
      };
    }
    if (input.kind === "consumer") {
      const pathogenicVariants = Math.max(1, input.pathogenicVariants);
      const assayedVariants = clamp(input.assayedVariants, 0, pathogenicVariants);
      return { coverageFraction: assayedVariants / pathogenicVariants, missedVariants: pathogenicVariants - assayedVariants };
    }
    throw new Error("Unknown genomics-in-practice model");
  }
  models.practice = practiceModel;

  function ethicsModel(input) {
    if (input.kind === "uniqueness") {
      const maf = clamp(input.maf, 1e-9, 1 - 1e-9);
      const p = 1 - maf;
      const perSnpMatch = Math.pow(p * p, 2) + Math.pow(2 * p * maf, 2) + Math.pow(maf * maf, 2);
      const population = Math.max(2, input.population);
      const otherPeople = population - 1;
      const snps = Math.ceil(Math.log(1 / otherPeople) / Math.log(perSnpMatch));
      return { perSnpMatch, snps, expectedOtherMatches: otherPeople * Math.pow(perSnpMatch, snps) };
    }
    if (input.kind === "findability") {
      const coverage = clamp(input.coverage, 0, 1);
      const effectiveRelatives = Math.max(0, input.effectiveRelatives);
      return { findability: 1 - Math.pow(1 - coverage, effectiveRelatives) };
    }
    if (input.kind === "embryo") {
      const embryos = Math.max(1, Math.round(input.embryos));
      const withinFamilySd = Math.max(0, input.withinFamilySd);
      const expectedMaximumZ = inverseNormal((embryos - 0.375) / (embryos + 0.25));
      return { embryos, expectedMaximumZ, expectedGain: withinFamilySd * expectedMaximumZ };
    }
    throw new Error("Unknown ethics model");
  }
  models.ethics = ethicsModel;

  /* Chapter 51 — GWAS ------------------------------------------------- */

  define("gwas-failure-lab", makeObjectiveMap("ch51", [
    "Dosage mode exposes the additive projection and the exact dominance variance that a 0/1/2 trend test cannot use.",
    "Structure mode manufactures a null association from ancestry gradients and contrasts adjustment with within-family randomisation.",
    "Inflation mode separates LD-dependent polygenic slope from LD-independent confounding in the LD-score intercept.",
    "Threshold mode derives genome-wide alpha from effective tests and keeps discovery multiplicity separate from replication.",
    "QC mode ties each filter to its artefact while the inflation view distinguishes confounding from genuine polygenicity.",
    "Winner and tag modes shrink selected estimates and keep a lead marker, causal variant, and mediated gene as different claims.",
    "Portability mode changes tag LD across samples and traces one recruitment imbalance through discovery and downstream inference.",
  ]), function (api) {
    const { body, el, predict } = api;
    const parts = labParts(el);
    let mode = "structure";
    let p = 0.10;
    let inheritance = "recessive";
    let design = "none";
    let capture = 0.90;
    let structureN = 50000;
    let confounding = 1e-7;
    let effectiveTests = 1e6;
    let qcFailure = "batch";
    let observedEffect = 0.12;
    let priorSd = 0.04;
    let discoveryR2 = 0.90;
    let targetR2 = 0.30;

    const modeChoices = [
      { label: "0/1/2 model", value: "dosage" },
      { label: "False hit", value: "structure" },
      { label: "λ vs intercept", value: "inflation" },
      { label: "5 × 10⁻⁸", value: "threshold" },
      { label: "QC autopsy", value: "qc" },
      { label: "Winner's curse", value: "winner" },
      { label: "Tag + portability", value: "tag" },
    ];

    function renderDosage() {
      const d = inheritance === "recessive" ? -1 : inheritance === "dominant" ? 1 : 0;
      const result = gwasModel({ kind: "dosage", p, a: 1, d });
      const values = inheritance === "recessive" ? [-1, -1, 1] :
        inheritance === "dominant" ? [-1, 1, 1] : [-1, 0, 1];
      parts.visual.replaceChildren(
        pointPlot(el, values.map((value, index) => ({
          label: ["0 copies", "1 copy", "2 copies"][index], x: index, y: value,
          short: ["0", "1", "2"][index], tone: index === 1 && inheritance !== "additive" ? "warning" : "active",
        })), {
          label: "Genotype dosage and true genotypic value",
          xLabel: "effect-allele dosage", yLabel: "true value", xMin: 0, xMax: 2, yMin: -1.2, yMax: 1.2,
        }),
        barBoard(el, [
          { label: "visible to additive test", value: result.additiveVariance, display: compact(result.additiveVariance, 3), tone: "active" },
          { label: "dominance variance missed", value: result.dominanceVariance, display: compact(result.dominanceVariance, 3), tone: "warning" },
        ], "Variance at the locus", result.additiveVariance + result.dominanceVariance)
      );
      parts.controls.replaceChildren(
        el("div", { class: "lab-control-block" }, [
          el("span", { class: "lab-control-label", text: "True genotype–phenotype map" }),
          choiceRow(el, [
            { label: "Additive", value: "additive" },
            { label: "Recessive", value: "recessive" },
            { label: "Dominant", value: "dominant" },
          ], inheritance, (value) => { inheritance = value; render(); }, "Inheritance map"),
        ]),
        rangeControl(el, "Effect-allele frequency", p, { min: 0.02, max: 0.5, step: 0.01, format: (value) => percent(value, 0) },
          (value) => { p = value; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "true map", value: inheritance },
        { key: "0/1/2 projection", value: "α = " + compact(result.alpha, 3) },
        { key: "usable locus variance", value: percent(result.additiveFraction, 1) },
        { key: "blind spot", value: compact(result.dominanceVariance, 3) + " dominance variance" },
      ]));
      parts.explanation.innerHTML = "<strong>Additive coding estimates the best linear allele-substitution effect; it does not assert additive biology.</strong> Its power follows V<sub>A</sub>. A rare recessive allele leaves most of this locus's variance in V<sub>D</sub>, while common recessive alleles project much better onto dosage.";
    }

    function renderStructure() {
      const result = gwasModel({
        kind: "structure", w: 0.5, p1: 0.15, p2: 0.55, mu1: 0, mu2: 0.45,
        n: structureN, design, capture,
      });
      parts.visual.replaceChildren(
        pointPlot(el, [
          { label: "ancestry 1 mean", x: 0.30, y: 0, short: "A", tone: "signal" },
          { label: "ancestry 2 mean", x: 1.10, y: 0.45, short: "B", tone: "warning" },
          { label: "pooled regression", x: 0.70, y: 0.225, short: "β", tone: "active" },
        ], {
          label: "Two ancestry groups have no within-group variant effect but different allele and phenotype means",
          xLabel: "mean dosage", yLabel: "mean phenotype", xMin: 0, xMax: 1.4, yMin: -0.05, yMax: 0.55, diagonal: true,
        }),
        statusStrip(el, [
          { label: "true within-group effect", value: "0" },
          { label: "pooled raw bias", value: compact(result.rawBias, 3), tone: "warning" },
          { label: "residual bias", value: compact(result.bias, 3), tone: result.bias === 0 ? "active" : "warning" },
          { label: "approx. |z|", value: compact(Math.abs(result.z), 1), tone: Math.abs(result.z) > 5.45 ? "warning" : "active" },
        ], "Population-structure false-positive fixture")
      );
      const controls = [
        el("div", { class: "lab-control-block" }, [
          el("span", { class: "lab-control-label", text: "Analysis design" }),
          choiceRow(el, [
            { label: "Unadjusted", value: "none" },
            { label: "PC covariates", value: "pc" },
            { label: "Mixed model", value: "mixed" },
            { label: "Sibling contrast", value: "sibling" },
          ], design, (value) => { design = value; render(); }, "GWAS structure defence"),
        ]),
        rangeControl(el, "Sample size", structureN, { min: 1000, max: 500000, step: 1000, format: (value) => compact(value, 0) },
          (value) => { structureN = value; render(); }),
      ];
      if (design === "pc" || design === "mixed") controls.push(
        rangeControl(el, "Confounding captured by model", capture, { min: 0, max: 1, step: 0.05, format: (value) => percent(value, 0) },
          (value) => { capture = value; render(); })
      );
      parts.controls.replaceChildren(...controls);
      parts.rail.replaceChildren(causalRail(el, [
        { key: "ancestry", value: "changes allele frequency" },
        { key: "same ancestry", value: "changes phenotype mean" },
        { key: "pooled scan", value: "manufactures covariance" },
        { key: "larger N", value: "shrinks SE, not bias" },
      ]));
      parts.explanation.innerHTML = design === "sibling"
        ? "<strong>Within siblings, parental alleles segregate as the randomised coin flip the population scan never had.</strong> Shared ancestry and family environment cancel, at the cost of power and a narrower direct-effect estimand."
        : "<strong>This is bias, not noise.</strong> The capture control means “fraction of this confounding represented by the fitted adjustment”; it is an assumption you can stress-test, not a claimed typical performance. Increase N and any residual bias becomes more significant.";
    }

    function renderInflation() {
      const scores = [20, 60, 100, 140, 180];
      const points = scores.map((ldScore) => {
        const result = gwasModel({ kind: "inflation", n: 500000, h2: 0.4, variants: 1e6, ldScore, confounding });
        return { label: "LD score " + ldScore, x: ldScore, y: result.expectedChiSquare, short: String(ldScore), tone: "active" };
      });
      const current = gwasModel({ kind: "inflation", n: 500000, h2: 0.4, variants: 1e6, ldScore: 100, confounding });
      parts.visual.replaceChildren(
        pointPlot(el, points, {
          label: "Expected chi-square rises with LD score from polygenicity while confounding raises the intercept",
          xLabel: "LD score ℓ", yLabel: "expected χ²", xMin: 0, xMax: 200, yMin: 0.9, yMax: Math.max(2, ...points.map((point) => point.y) * 1.05), diagonal: true,
        }),
        statusStrip(el, [
          { label: "intercept", value: compact(current.intercept, 3), tone: current.intercept > 1.05 ? "warning" : "active" },
          { label: "polygenic term at ℓ=100", value: compact(current.polygenic, 2), tone: "signal" },
          { label: "mean χ² fixture", value: compact(current.expectedChiSquare, 2) },
          { label: "attenuation ratio", value: percent(current.attenuationRatio, 1) },
        ], "LD-score regression components")
      );
      parts.controls.replaceChildren(rangeControl(el, "LD-independent confounding a", confounding, {
        min: 0, max: 0.0000006, step: 0.00000002, format: (value) => value.toExponential(1),
      }, (value) => { confounding = value; render(); }));
      parts.rail.replaceChildren(causalRail(el, [
        { key: "polygenicity", value: "χ² rises with LD score" },
        { key: "confounding", value: "adds regardless of LD" },
        { key: "regression slope", value: "heritability signal" },
        { key: "regression intercept", value: "non-genetic inflation" },
      ]));
      parts.explanation.innerHTML = "<strong>Genomic inflation reports how inflated the statistics are; the LD-score intercept asks how much inflation is independent of LD.</strong> A large clean study can have λ well above one because true polygenic signal lifts millions of statistics. Dividing all of them by λ would erase biology.";
    }

    function renderThreshold() {
      const result = gwasModel({ kind: "threshold", effectiveTests });
      parts.visual.replaceChildren(
        barBoard(el, [
          { label: "family-wise error budget", value: 0.05, display: "0.05", tone: "signal" },
          { label: "effective independent tests", value: Math.min(effectiveTests / 2e6, 1), display: compact(effectiveTests, 0), tone: "active" },
          { label: "per-test α", value: Math.min(result.threshold / 5e-8, 1), display: result.threshold.toExponential(2), tone: "warning" },
        ], "Bonferroni genome-wide threshold components", 1),
        claimBoundary(el, "one pre-specified genome scan", "every scan ever run on the biobank", "Replication with the same direction and a nominal test addresses the second claim; re-paying the whole discovery scan would discard valid replications.")
      );
      parts.controls.replaceChildren(rangeControl(el, "Effectively independent tests", effectiveTests, {
        min: 250000, max: 4000000, step: 250000, format: (value) => compact(value, 0),
      }, (value) => { effectiveTests = value; render(); }));
      parts.rail.replaceChildren(causalRail(el, [
        { key: "FWER", value: "0.05" },
        { key: "effective tests", value: compact(effectiveTests, 0) },
        { key: "discovery α", value: result.threshold.toExponential(2) },
        { key: "replication", value: "one directional hypothesis" },
      ]));
      parts.explanation.innerHTML = "<strong>The denominator is the population's effectively independent common-variant space, not the number of rows in a genotype file.</strong> Shorter LD blocks and weakly tagged rare variants raise that number; founder LD lowers it.";
    }

    function renderQc() {
      const fixtures = {
        batch: ["array / batch", "phenotype imbalance", "whole-genome false stripe", "include batch; re-cluster"],
        relatedness: ["duplicate / relatives", "non-independent rows", "deflated standard errors", "remove or model GRM"],
        strand: ["A/T or C/G allele", "strand cannot be inferred", "effect sign flips", "frequency-check or drop"],
        imputation: ["weak reference match", "uncertain dosage", "attenuated / ancestry-biased hit", "INFO filter; matched panel"],
        hwe: ["genotyping cluster", "heterozygote deficit/excess", "site-specific artefact", "inspect; HWE filter"],
      };
      const f = fixtures[qcFailure];
      parts.visual.replaceChildren(processBoard(el, [
        { label: "source", value: f[0], tone: "warning" },
        { label: "data distortion", value: f[1] },
        { label: "scan signature", value: f[2], tone: "warning" },
        { label: "defence", value: f[3], tone: "active" },
      ], "GWAS quality-control causal autopsy"));
      parts.controls.replaceChildren(el("div", { class: "lab-control-block" }, [
        el("span", { class: "lab-control-label", text: "Failure to autopsy" }),
        choiceRow(el, [
          { label: "Batch", value: "batch" },
          { label: "Relatives", value: "relatedness" },
          { label: "Strand", value: "strand" },
          { label: "Imputation", value: "imputation" },
          { label: "HWE", value: "hwe" },
        ], qcFailure, (value) => { qcFailure = value; render(); }, "GWAS QC failure"),
      ]));
      parts.rail.replaceChildren(causalRail(el, [
        { key: "filter", value: f[0] },
        { key: "prevents", value: f[1] },
        { key: "otherwise", value: f[2] },
        { key: "action", value: f[3] },
      ]));
      parts.explanation.innerHTML = "<strong>QC is not ritual deletion.</strong> Each rule is justified only by the artefact it blocks, and every exclusion can introduce its own bias. The correct response to a failed metric is to name the mechanism, inspect it, and document the resulting callable sample.";
    }

    function renderWinner() {
      const result = gwasModel({ kind: "winner", observed: observedEffect, se: 0.025, priorSd });
      parts.visual.replaceChildren(
        locusPlot(el, [
          { label: "selected discovery estimate", short: "discovery", value: Math.abs(result.observed), display: compact(result.observed, 3), tone: "warning" },
          { label: "shrunken posterior mean", short: "shrunken", value: Math.abs(result.posteriorMean), display: compact(result.posteriorMean, 3), tone: "active" },
          { label: "null", short: "0", value: 0, display: "0", tone: "muted" },
        ], "Discovery effect and shrinkage correction"),
        statusStrip(el, [
          { label: "observed β", value: compact(result.observed, 3), tone: "warning" },
          { label: "SE", value: "0.025" },
          { label: "prior SD", value: compact(result.priorSd, 3) },
          { label: "posterior mean", value: compact(result.posteriorMean, 3), tone: "active" },
        ], "Normal-prior winner's-curse correction")
      );
      parts.controls.replaceChildren(
        rangeControl(el, "Selected discovery effect", observedEffect, { min: 0.04, max: 0.22, step: 0.01, format: (value) => value.toFixed(2) },
          (value) => { observedEffect = value; render(); }),
        rangeControl(el, "Plausible effect-scale prior SD", priorSd, { min: 0.01, max: 0.15, step: 0.01, format: (value) => value.toFixed(2) },
          (value) => { priorSd = value; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "selection", value: "keeps |β̂/SE| in the tail" },
        { key: "conditional sample", value: "β̂ biased away from zero" },
        { key: "independent prior", value: "shrinks noisy extremes" },
        { key: "replication", value: "estimates without discovery selection" },
      ]));
      parts.explanation.innerHTML = "<strong>This is explicit normal-prior shrinkage, one principled winner's-curse correction—not a magic universal discount.</strong> A prior on plausible effects and an independent replication are visible assumptions; simply copying the selected discovery coefficient into a score preserves the bias.";
    }

    function renderTag() {
      const result = gwasModel({ kind: "tag", r2: discoveryR2, targetR2, causalEffect: 0.10 });
      parts.visual.replaceChildren(
        locusPlot(el, [
          { label: "causal variant", short: "causal", value: 1, display: "β 0.10", tone: "active" },
          { label: "discovery lead marker", short: "tag A", value: result.r2, display: "r² " + result.r2.toFixed(2), tone: "signal" },
          { label: "same marker in target sample", short: "tag B", value: result.targetR2, display: "r² " + result.targetR2.toFixed(2), tone: "warning" },
          { label: "nearest gene", short: "nearest", value: 0.35, display: "unproven", tone: "muted" },
        ], "Association locus from causal allele through population-specific tags to an unproven nearest gene"),
        statusStrip(el, [
          { label: "discovery NCP retained", value: percent(result.ncpFraction, 0), tone: "active" },
          { label: "target NCP retained", value: percent(result.targetNcpFraction, 0), tone: "warning" },
          { label: "target/discovery power signal", value: percent(result.portabilityRatio, 0) },
          { label: "gene mechanism", value: "not measured" },
        ], "Tagging and portability")
      );
      parts.controls.replaceChildren(
        rangeControl(el, "Discovery-sample tag r²", discoveryR2, { min: 0.05, max: 1, step: 0.05, format: (value) => value.toFixed(2) },
          (value) => { discoveryR2 = value; render(); }),
        rangeControl(el, "Target-sample tag r²", targetR2, { min: 0, max: 1, step: 0.05, format: (value) => value.toFixed(2) },
          (value) => { targetR2 = value; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "causal allele", value: "same molecular effect" },
        { key: "population history", value: "changes tag r²" },
        { key: "marginal GWAS", value: "tests the tag" },
        { key: "downstream", value: "fine-map + perturb; do not name nearest gene" },
      ]));
      parts.explanation.innerHTML = "<strong>A lead SNP is a population-specific proxy.</strong> Under-representation changes which variants are discovered, how tightly a locus can be fine-mapped, how a score transfers, and whether population frequency can classify a clinical variant. Genetic ancestry measures recombination history; race is not that covariate.";
    }

    function render() {
      parts.tabHost.replaceChildren(tabs(el, modeChoices, mode, (value) => { mode = value; render(); }));
      if (mode === "dosage") renderDosage();
      else if (mode === "structure") renderStructure();
      else if (mode === "inflation") renderInflation();
      else if (mode === "threshold") renderThreshold();
      else if (mode === "qc") renderQc();
      else if (mode === "winner") renderWinner();
      else renderTag();
    }

    predict(body, {
      widget: "gwas-failure-lab",
      question: "A null SNP differs in frequency between two ancestry groups whose phenotype means also differ. What happens as an unadjusted GWAS gets larger?",
      hint: "The ancestry covariance is bias; ask what sample size does to its standard error.",
      options: [
        { label: "The artefact averages to zero" },
        { label: "The same bias becomes more significant", correct: true },
        { label: "Only the effect estimate grows" },
        { label: "Bonferroni correction removes the bias" },
      ],
    }, () => {
      mode = "structure";
      parts.instrument.hidden = false;
      render();
    });
    finishLab(parts, body);
  });

  /* Chapter 52 — association to mechanism ----------------------------- */

  define("locus-mechanism-lab", makeObjectiveMap("ch52", [
    "Fine-map mode computes Wakefield approximate Bayes factors, PIPs, and a 95 percent credible set under an explicit one-causal-variant model.",
    "Resolution mode makes sample size diverge as LD approaches one and shows why cross-population LD contrast can add information.",
    "Gene, coloc, and prior modes rank distance, QTL, shared-causal, contact, TWAS, and perturbation evidence by the claim each supports.",
    "Perturbation mode separates episomal sequence sufficiency, endogenous element necessity, and allele-specific necessity.",
    "Context mode treats a missing baseline eQTL as compatible with cell-, state-, time-, and molecular-phenotype-specific regulation.",
    "MR mode fits through-origin IVW and free-intercept Egger views while keeping relevance, independence, and untestable exclusion visible.",
  ]), function (api) {
    const { body, el, predict } = api;
    const parts = labParts(el);
    let mode = "fine";
    let locusR2 = 0.96;
    let signalZ = 6.2;
    let resolutionR2 = 0.99;
    let locusVariance = 0.0034;
    let priorBoost = 8;
    let geneScenario = "skip";
    let colocScenario = "shared";
    let assay = "mpra";
    let context = "baseline";
    let mrScenario = "valid";

    const modeChoices = [
      { label: "Credible set", value: "fine" },
      { label: "LD limit", value: "resolution" },
      { label: "Functional prior", value: "prior" },
      { label: "Variant → gene", value: "gene" },
      { label: "Colocalisation", value: "coloc" },
      { label: "Perturb + context", value: "perturb" },
      { label: "MR assumptions", value: "mr" },
    ];

    function fineMapFixture(boost) {
      const z = [signalZ, signalZ * Math.sqrt(locusR2), signalZ * Math.sqrt(clamp(locusR2 - 0.08, 0, 1)), 3.2];
      const priors = [1, boost || 1, 1, 1];
      const priorTotal = sum(priors);
      return mechanismModel({
        kind: "fineMap", z, variances: z.map(() => 1), priors: priors.map((value) => value / priorTotal), effectVariance: 1,
      });
    }

    function renderFine() {
      const result = fineMapFixture(1);
      parts.visual.replaceChildren(
        locusPlot(el, result.pips.map((pip, index) => ({
          label: "variant " + (index + 1), short: "v" + (index + 1), value: pip,
          display: "PIP " + percent(pip, 1), tone: result.credibleSet.includes(index) ? "active" : "muted",
        })), "Posterior inclusion probabilities and the smallest set reaching 95 percent posterior mass"),
        statusStrip(el, [
          { label: "95% credible-set size", value: result.credibleSet.length, tone: "active" },
          { label: "mass captured", value: percent(result.mass, 1) },
          { label: "causal variants allowed", value: "exactly one", tone: "warning" },
          { label: "causal variant observed?", value: "assumed", tone: "warning" },
        ], "Fine-mapping model contract")
      );
      parts.controls.replaceChildren(
        rangeControl(el, "Lead |z|", signalZ, { min: 4, max: 10, step: 0.2, format: (value) => value.toFixed(1) },
          (value) => { signalZ = value; render(); }),
        rangeControl(el, "Best proxy r²", locusR2, { min: 0.3, max: 1, step: 0.01, format: (value) => value.toFixed(2) },
          (value) => { locusR2 = value; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "marginal z", value: "near-copies in LD" },
        { key: "ABF + prior", value: "posterior over candidates" },
        { key: "PIP", value: "configuration mass containing a variant" },
        { key: "95% set", value: "conditional model statement" },
      ]));
      parts.explanation.innerHTML = "<strong>The set—not every member—holds at least 95% posterior mass.</strong> That statement is conditional on correct sample LD, the causal allele being present, additive effects, and the one-causal-variant prior used here. PIP is model probability, not experimental validation.";
    }

    function renderResolution() {
      const result = mechanismModel({ kind: "resolution", r2: resolutionR2, varianceExplained: locusVariance, bayesFactor: 20 });
      const other = mechanismModel({ kind: "resolution", r2: Math.max(0, resolutionR2 - 0.30), varianceExplained: locusVariance, bayesFactor: 20 });
      parts.visual.replaceChildren(
        barBoard(el, [
          { label: "same-ancestry LD", value: Number.isFinite(result.sampleSize) ? Math.min(result.sampleSize, 2e6) : 2e6, display: compact(result.sampleSize, 0), tone: "warning" },
          { label: "contrasting LD history", value: Math.min(other.sampleSize, 2e6), display: compact(other.sampleSize, 0), tone: "active" },
        ], "Samples needed for Bayes factor 20 separation", 2e6),
        claimBoundary(el, "statistical separation under observed LD", "a molecular mechanism", "At r² = 1 the genotype columns are identical and no sample size can distinguish them; only new LD contrast or functional evidence can.")
      );
      parts.controls.replaceChildren(
        rangeControl(el, "Candidate r² with causal variant", resolutionR2, { min: 0.5, max: 1, step: 0.001, format: (value) => value.toFixed(3) },
          (value) => { resolutionR2 = value; render(); }),
        rangeControl(el, "Causal variance explained", locusVariance, { min: 0.0002, max: 0.006, step: 0.0002, format: (value) => percent(value, 2) },
          (value) => { locusVariance = value; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "candidate similarity", value: "r² " + resolutionR2.toFixed(3) },
        { key: "information gap", value: "N(1 − r²)" },
        { key: "BF 20 cost", value: compact(result.sampleSize, 0) + " samples" },
        { key: "efficient fix", value: "population with different LD" },
      ]));
      parts.explanation.innerHTML = "<strong>Sample size buys resolution linearly; LD costs it as 1/(1 − r²).</strong> Multi-ancestry fine-mapping is informative because recombination histories impose different correlation constraints—not because social race categories carry different biology.";
    }

    function renderPrior() {
      const neutral = fineMapFixture(1);
      const informed = fineMapFixture(priorBoost);
      parts.visual.replaceChildren(matrixBoard(el, ["Uniform prior PIP", "Annotated prior PIP", "Likelihood changed?"],
        informed.pips.map((pip, index) => ({
          label: "variant " + (index + 1),
          values: [percent(neutral.pips[index], 1), percent(pip, 1), "no"],
          tones: index === 1 ? ["muted", "active", "warning"] : ["muted", "signal", "warning"],
        })), "Functional annotation reweights a fixed likelihood"));
      parts.controls.replaceChildren(rangeControl(el, "Prior enrichment for variant 2", priorBoost, {
        min: 1, max: 30, step: 1, format: (value) => value.toFixed(0) + "×",
      }, (value) => { priorBoost = value; render(); }));
      parts.rail.replaceChildren(causalRail(el, [
        { key: "same GWAS", value: "unchanged likelihood" },
        { key: "annotation", value: priorBoost.toFixed(0) + "× prior for v2" },
        { key: "posterior", value: "ties reweighted" },
        { key: "dependency", value: "conditional on annotation model" },
      ]));
      parts.explanation.innerHTML = "<strong>A functional annotation is prior information, not new association data.</strong> It can break an LD tie but cannot create local information. If the likelihood is flat, the posterior simply repeats the prior; trait-derived annotations can also make the reasoning circular.";
    }

    function renderGene() {
      const fixtures = {
        nearest: { activities: [0.7, 0.5, 0.3], contacts: [0.8, 0.3, 0.1], genes: ["nearest", "skipped", "distant"] },
        skip: { activities: [0.4, 0.9, 0.5], contacts: [0.2, 0.85, 0.25], genes: ["nearest", "skipped", "distant"] },
        context: { activities: [0.2, 0.3, 0.95], contacts: [0.1, 0.2, 0.9], genes: ["nearest", "skipped", "state-specific"] },
      };
      const fixture = fixtures[geneScenario];
      const result = mechanismModel({ kind: "abc", activities: fixture.activities, contacts: fixture.contacts });
      parts.visual.replaceChildren(
        matrixBoard(el, ["Activity", "Contact", "ABC share"], fixture.genes.map((gene, index) => ({
          label: gene,
          values: [fixture.activities[index].toFixed(2), fixture.contacts[index].toFixed(2), percent(result.scores[index], 1)],
          tones: result.scores[index] === Math.max(...result.scores) ? ["active", "active", "active"] : ["muted", "muted", "muted"],
        })), "Activity-by-contact candidate-gene prioritisation"),
        claimBoundary(el, "candidate element–gene priority", "causal mediation", "Distance, eQTL, contact, TWAS, and ABC scores choose experiments; colocalisation and endogenous allele perturbation narrow the causal claim.")
      );
      parts.controls.replaceChildren(el("div", { class: "lab-control-block" }, [
        el("span", { class: "lab-control-label", text: "Locus architecture" }),
        choiceRow(el, [
          { label: "Nearest wins", value: "nearest" },
          { label: "Enhancer skips", value: "skip" },
          { label: "Context-specific", value: "context" },
        ], geneScenario, (value) => { geneScenario = value; render(); }, "Variant-to-gene scenario"),
      ]));
      parts.rail.replaceChildren(causalRail(el, [
        { key: "fine-mapped element", value: "candidate sequence" },
        { key: "activity × contact", value: "normalised competition" },
        { key: "candidate gene", value: fixture.genes[result.scores.indexOf(Math.max(...result.scores))] },
        { key: "next test", value: "allele edit in the relevant context" },
      ]));
      parts.explanation.innerHTML = "<strong>Nearest gene is a baseline, not a mechanism.</strong> Enhancers skip genes, contacts are frequent without regulation, eQTLs can tag distinct causal variants, and TWAS is a weighted GWAS screen. Each narrows priority; none replaces perturbation.";
    }

    function renderColoc() {
      const result = mechanismModel({ kind: "coloc", scenario: colocScenario });
      const labels = ["H0 neither", "H1 GWAS only", "H2 QTL only", "H3 distinct", "H4 shared"];
      parts.visual.replaceChildren(
        barBoard(el, result.posterior.map((value, index) => ({
          label: labels[index], value, display: percent(value, 1),
          tone: index === 4 ? "active" : index === 3 ? "warning" : "muted",
        })), "Illustrative coloc posterior fixture", 1),
        statusStrip(el, [
          { label: "PP4", value: percent(result.posterior[4], 1), tone: "active" },
          { label: "PP3", value: percent(result.posterior[3], 1), tone: "warning" },
          { label: "PP4 / (PP3 + PP4)", value: percent(result.conditionalShared, 1) },
          { label: "power adequate?", value: colocScenario === "underpowered" ? "no" : "yes" },
        ], "How to read coloc")
      );
      parts.controls.replaceChildren(el("div", { class: "lab-control-block" }, [
        el("span", { class: "lab-control-label", text: "Posterior pattern" }),
        choiceRow(el, [
          { label: "Shared signal", value: "shared" },
          { label: "Distinct signals", value: "distinct" },
          { label: "Underpowered", value: "underpowered" },
        ], colocScenario, (value) => { colocScenario = value; render(); }, "Colocalisation pattern"),
      ]));
      parts.rail.replaceChildren(causalRail(el, [
        { key: "two regional signals", value: "GWAS + molecular QTL" },
        { key: "explicit alternatives", value: "H0 through H4" },
        { key: "shared-causal evidence", value: "PP4 versus PP3" },
        { key: "claim", value: colocScenario === "shared" ? "shared variant, not proven mediation" : colocScenario === "distinct" ? "LD coincidence" : "insufficient power" },
      ]));
      parts.explanation.innerHTML = colocScenario === "underpowered"
        ? "<strong>Low PP3 and low PP4 is not evidence against colocalisation.</strong> Most mass sits on hypotheses where at least one trait lacks a resolved signal, so the correct conclusion is underpowered."
        : "<strong>Coloc asks shared causal variant versus distinct causal variants in the same LD block.</strong> Even high PP4 supports shared genetic signal, not the stronger claim that expression mediates the trait; priors and the one-signal assumption remain visible.";
    }

    function renderPerturb() {
      const assayClaims = {
        mpra: ["sequence is sufficient on a reporter", "endogenous necessity", "episomal context"],
        crispri: ["endogenous element is necessary here", "specific allele is causal", "KRAB spread / redundancy"],
        edit: ["specific allele is necessary in this context", "whole-organism mechanism", "editing efficiency / cell state"],
      };
      const claims = assayClaims[assay];
      const contexts = {
        baseline: "adult bulk tissue at baseline",
        stimulated: "stimulated relevant cell type",
        developmental: "developmental state",
      };
      parts.visual.replaceChildren(
        matrixBoard(el, ["Logical test", "Context", "Characteristic null"], [
          { label: "MPRA", values: ["sufficiency", "episome", "needs chromatin"], tones: assay === "mpra" ? ["active", "active", "warning"] : ["muted", "muted", "muted"] },
          { label: "CRISPRi", values: ["element necessity", "endogenous", "redundancy"], tones: assay === "crispri" ? ["active", "active", "warning"] : ["muted", "muted", "muted"] },
          { label: "base / prime edit", values: ["allele necessity", "endogenous", "wrong state"], tones: assay === "edit" ? ["active", "active", "warning"] : ["muted", "muted", "muted"] },
        ], "Sufficiency and necessity experiments"),
        claimBoundary(el, claims[0], claims[1], "A negative in " + contexts[context] + " can be a context mismatch rather than absence of regulation; cell type, stimulus, time, and molecular phenotype are part of the experiment.")
      );
      parts.controls.replaceChildren(
        el("div", { class: "lab-control-block" }, [
          el("span", { class: "lab-control-label", text: "Perturbation" }),
          choiceRow(el, [
            { label: "MPRA", value: "mpra" },
            { label: "CRISPRi", value: "crispri" },
            { label: "Allele edit", value: "edit" },
          ], assay, (value) => { assay = value; render(); }, "Perturbation assay"),
        ]),
        el("div", { class: "lab-control-block" }, [
          el("span", { class: "lab-control-label", text: "Biological context" }),
          choiceRow(el, [
            { label: "Adult baseline", value: "baseline" },
            { label: "Stimulated cell", value: "stimulated" },
            { label: "Development", value: "developmental" },
          ], context, (value) => { context = value; render(); }, "Regulatory context"),
        ])
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "candidate", value: "variant + element" },
        { key: "assay logic", value: claims[0] },
        { key: "context", value: contexts[context] },
        { key: "unresolved", value: claims[1] },
      ]));
      parts.explanation.innerHTML = "<strong>Sufficiency and necessity dissociate in both directions.</strong> Missing eQTL regulation can reflect the wrong cell, state, time, or molecular phenotype—and selection makes large common eQTL effects least likely near dosage-sensitive disease genes.";
    }

    function renderMr() {
      const fixtures = {
        valid: { x: [0.04, 0.07, 0.10, 0.13, 0.16], y: [0.02, 0.035, 0.05, 0.065, 0.08] },
        pleiotropy: { x: [0.04, 0.07, 0.10, 0.13, 0.16], y: [0.05, 0.065, 0.08, 0.095, 0.11] },
        outlier: { x: [0.04, 0.07, 0.10, 0.13, 0.16], y: [0.02, 0.035, 0.14, 0.065, 0.08] },
      };
      const fixture = fixtures[mrScenario];
      const result = mechanismModel({ kind: "mr", exposureEffects: fixture.x, outcomeEffects: fixture.y });
      parts.visual.replaceChildren(
        pointPlot(el, fixture.x.map((value, index) => ({
          label: "instrument " + (index + 1), x: value, y: fixture.y[index], short: "G" + (index + 1),
          tone: mrScenario === "outlier" && index === 2 ? "warning" : "active",
        })), {
          label: "Variant exposure effects plotted against variant outcome effects",
          xLabel: "βGX relevance", yLabel: "βGY outcome", xMin: 0, xMax: 0.18, yMin: 0, yMax: 0.16, diagonal: true,
        }),
        statusStrip(el, [
          { label: "equal-SE IVW slope", value: compact(result.originSlope, 3), tone: "active" },
          { label: "equal-SE Egger slope", value: compact(result.eggerSlope, 3) },
          { label: "equal-SE Egger intercept", value: compact(result.eggerIntercept, 3), tone: Math.abs(result.eggerIntercept) > 0.01 ? "warning" : "active" },
          { label: "exclusion restriction tested?", value: "no", tone: "warning" },
        ], "Mendelian-randomisation sensitivity view")
      );
      parts.controls.replaceChildren(el("div", { class: "lab-control-block" }, [
        el("span", { class: "lab-control-label", text: "Instrument pattern" }),
        choiceRow(el, [
          { label: "Consistent", value: "valid" },
          { label: "Directional pleiotropy", value: "pleiotropy" },
          { label: "One outlier", value: "outlier" },
        ], mrScenario, (value) => { mrScenario = value; render(); }, "MR instrument pattern"),
      ]));
      parts.rail.replaceChildren(causalRail(el, [
        { key: "IV1 relevance", value: "G predicts exposure" },
        { key: "IV2 independence", value: "no G–confounder path" },
        { key: "IV3 exclusion", value: "no direct G→outcome path" },
        { key: "evidence", value: "agreement under non-nested assumptions" },
      ]));
      parts.explanation.innerHTML = "<strong>MR is an observational instrumental-variable design, not a natural trial.</strong> All plotted instruments are assigned equal outcome standard errors, so the displayed regressions reduce to unweighted slopes; production IVW and MR-Egger use inverse-variance weights. Relevance is testable; independence is partly testable; exclusion is not, and no sensitivity analysis certifies IV3.";
    }

    function render() {
      parts.tabHost.replaceChildren(tabs(el, modeChoices, mode, (value) => { mode = value; render(); }));
      if (mode === "fine") renderFine();
      else if (mode === "resolution") renderResolution();
      else if (mode === "prior") renderPrior();
      else if (mode === "gene") renderGene();
      else if (mode === "coloc") renderColoc();
      else if (mode === "perturb") renderPerturb();
      else renderMr();
    }

    predict(body, {
      widget: "locus-mechanism-lab",
      question: "Two variants are in perfect LD in the study sample. What will a ten-times larger sample do?",
      hint: "Ask whether the two genotype columns contain any different observations.",
      options: [
        { label: "Resolve the causal base" },
        { label: "Make their PIPs equal to zero" },
        { label: "Leave them statistically indistinguishable", correct: true },
        { label: "Prove the nearest gene" },
      ],
    }, () => {
      mode = "resolution";
      resolutionR2 = 1;
      parts.instrument.hidden = false;
      render();
    });
    finishLab(parts, body);
  });

  /* Chapter 53 — polygenic scores ------------------------------------- */

  define("polygenic-score-clinic", makeObjectiveMap("ch53", [
    "Score mode evaluates a weighted allele-dosage sum and makes every signed per-variant contribution inspectable.",
    "LD mode counts one causal signal repeatedly while architecture mode treats C plus T, ridge, sparse, and continuous shrinkage as priors.",
    "Risk mode converts score percentile and liability variance into absolute risk before displaying any relative-risk framing.",
    "Risk mode also separates discrimination from calibration and computes the liability-model AUC ceiling for the chosen prevalence and R squared.",
    "Portability mode changes tagging LD and allele frequency continuously, separating ancestry distance from social race labels and fixed biology.",
    "Design mode holds the estimator constant while changing relatedness, phenotype precision, environment, and the target from one person to progeny mean.",
  ]), function (api) {
    const { body, el, predict } = api;
    const parts = labParts(el);
    let mode = "risk";
    let genotypePattern = "mixed";
    let tagCount = 12;
    let tagR = 0.90;
    let architecture = "dense";
    let split = "clean";
    let prevalence = 0.05;
    let liabilityR2 = 0.10;
    let scoreZ = 1.645;
    let trainR = 0.92;
    let targetR = 0.45;
    let targetP = 0.15;
    let design = "human";

    const modeChoices = [
      { label: "Weighted sum", value: "score" },
      { label: "LD double-count", value: "ld" },
      { label: "Priors", value: "prior" },
      { label: "Data split", value: "validation" },
      { label: "Risk + AUC", value: "risk" },
      { label: "Portability", value: "portability" },
      { label: "Cattle vs people", value: "design" },
    ];

    function renderScore() {
      const weights = [0.08, -0.05, 0.12, 0.03, -0.09];
      const patterns = {
        low: [0, 2, 0, 1, 2], mixed: [1, 1, 2, 0, 1], high: [2, 0, 2, 2, 0], missing: [1, 1.2, 2, 0, 1],
      };
      const dosages = patterns[genotypePattern];
      const result = polygenicModel({ kind: "score", weights, dosages });
      parts.visual.replaceChildren(
        matrixBoard(el, ["Dosage", "Weight", "Contribution"], weights.map((weight, index) => ({
          label: "variant " + (index + 1),
          values: [dosages[index].toFixed(1), (weight >= 0 ? "+" : "") + weight.toFixed(2), (result.contributions[index] >= 0 ? "+" : "") + result.contributions[index].toFixed(3)],
          tones: result.contributions[index] >= 0 ? ["muted", "active", "active"] : ["muted", "warning", "warning"],
        })), "Weighted allele-dosage sum"),
        statusStrip(el, [
          { label: "raw score", value: (result.score >= 0 ? "+" : "") + result.score.toFixed(3), tone: "active" },
          { label: "units", value: "model scale" },
          { label: "rank needs", value: "reference sample" },
          { label: "imputed dosage", value: genotypePattern === "missing" ? "1.2 = E[G|data]" : "none" },
        ], "Polygenic-score output")
      );
      parts.controls.replaceChildren(el("div", { class: "lab-control-block" }, [
        el("span", { class: "lab-control-label", text: "Genome fixture" }),
        choiceRow(el, [
          { label: "Lower score", value: "low" },
          { label: "Mixed", value: "mixed" },
          { label: "Higher score", value: "high" },
          { label: "Imputed call", value: "missing" },
        ], genotypePattern, (value) => { genotypePattern = value; render(); }, "Polygenic-score genotype fixture"),
      ]));
      parts.rail.replaceChildren(causalRail(el, [
        { key: "effect allele", value: "aligned dosage 0–2" },
        { key: "GWAS weight", value: "β or log OR" },
        { key: "sum", value: result.score.toFixed(3) },
        { key: "interpretation", value: "standardise in a named reference" },
      ]));
      parts.explanation.innerHTML = "<strong>A PRS is a fitted prediction, not a molecular measurement.</strong> Missing calls use expected dosage 2p—not zero—and strand/build/allele alignment determines every sign. The raw sum has meaning only after naming the model and reference distribution.";
    }

    function renderLd() {
      const result = polygenicModel({ kind: "ld", tags: tagCount, r: tagR, causalEffect: 0.10 });
      const displayedTags = Math.min(tagCount, 12);
      parts.visual.replaceChildren(
        locusPlot(el, [
          { label: "joint causal effect", short: "causal", value: 0.10, display: "0.10", tone: "active" },
          ...Array.from({ length: displayedTags }, (_, index) => {
            const labelAnchor = index === 0 || index === Math.floor((displayedTags - 1) / 2) || index === displayedTags - 1;
            const valueAnchor = index === Math.floor((displayedTags - 1) / 2) || index === displayedTags - 1;
            return {
              label: "marginal tag " + (index + 1),
              short: "t" + (index + 1),
              value: Math.abs(result.marginalTagEffect),
              display: result.marginalTagEffect.toFixed(3),
              tone: "warning",
              // The causal value already labels the left edge. In a dense
              // phone-width locus, repeating the first tag value beside it
              // creates an unreadable collision without adding information.
              showValue: displayedTags <= 5 || valueAnchor,
              showLabel: displayedTags <= 5 || labelAnchor,
            };
          }),
        ], "One causal signal repeated in correlated marginal GWAS estimates"),
        statusStrip(el, [
          { label: "one causal effect", value: "0.10", tone: "active" },
          { label: "each marginal tag", value: result.marginalTagEffect.toFixed(3), tone: "warning" },
          { label: "naive tag sum", value: result.naive.toFixed(2), tone: "warning" },
          { label: "over-count", value: result.overcount.toFixed(1) + "×" },
        ], "LD double-counting fixture")
      );
      parts.controls.replaceChildren(
        rangeControl(el, "Correlated tags included", tagCount, { min: 1, max: 20, step: 1, format: (value) => value.toFixed(0) },
          (value) => { tagCount = value; render(); }),
        rangeControl(el, "Tag–causal correlation r", tagR, { min: 0.1, max: 0.99, step: 0.01, format: (value) => value.toFixed(2) },
          (value) => { tagR = value; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "one causal allele", value: "joint β = 0.10" },
        { key: "LD", value: tagCount + " tags at r " + tagR.toFixed(2) },
        { key: "marginal GWAS", value: "each absorbs tagged signal" },
        { key: "regularisation", value: "recover joint weights without unstable inversion" },
      ]));
      parts.explanation.innerHTML = "<strong>Marginal effects are not independent ingredients.</strong> This standardised one-locus fixture deliberately gives each displayed tag the same genotype direction so you can see the over-count; real methods estimate joint effects with LD-aware shrinkage rather than trusting the naive sum.";
    }

    function renderPrior() {
      const fixtures = {
        sparse: ["C + T / lasso", "point mass at zero", "few non-zero effects", "delete or select"],
        dense: ["ridge / LDpred-inf", "normal", "all variants tiny", "global shrinkage"],
        mixed: ["LDpred / SBayesR", "point-normal / mixture", "nulls + several scales", "posterior mixture"],
        heavy: ["PRS-CS", "global–local heavy tail", "dense with rare large effects", "adaptive shrinkage"],
      };
      const f = fixtures[architecture];
      parts.visual.replaceChildren(
        matrixBoard(el, ["Assumption", "Best when", "LD/noise action"], [
          { label: f[0], values: [f[1], f[2], f[3]], tones: ["active", "active", "active"] },
          { label: "wrong prior", values: ["architecture mismatch", "bias–variance loss", "validate out of sample"], tones: ["warning", "warning", "warning"] },
        ], "Polygenic-score methods as biological priors"),
        claimBoundary(el, "prediction under this prior", "the true effect-size distribution", "Method complexity cannot choose its own prior honestly; tuning and final evaluation must happen in separate data.")
      );
      parts.controls.replaceChildren(el("div", { class: "lab-control-block" }, [
        el("span", { class: "lab-control-label", text: "Assumed architecture" }),
        choiceRow(el, [
          { label: "Sparse", value: "sparse" },
          { label: "Infinitesimal", value: "dense" },
          { label: "Mixture", value: "mixed" },
          { label: "Heavy-tailed", value: "heavy" },
        ], architecture, (value) => { architecture = value; render(); }, "Effect-size architecture"),
      ]));
      parts.rail.replaceChildren(causalRail(el, [
        { key: "marginal β̂ + LD", value: "ill-conditioned system" },
        { key: "prior", value: f[1] },
        { key: "regularised weights", value: f[3] },
        { key: "winner", value: "out-of-sample validation" },
      ]));
      parts.explanation.innerHTML = "<strong>Every method is a regularised answer to the same LD-contaminated linear system.</strong> C+T is not obsolete when the architecture is sparse; a sophisticated dense prior can lose. “Best method” is an empirical, trait- and cohort-specific result.";
    }

    function renderValidation() {
      const fixtures = {
        clean: ["train", "tune", "test", "unbiased final estimate"],
        tuneTest: ["train", "tune = test", "reported best", "optimism from repeated selection"],
        overlap: ["GWAS includes target", "tune", "test", "direct leakage / relatedness"],
      };
      const f = fixtures[split];
      parts.visual.replaceChildren(processBoard(el, [
        { label: "fit weights", value: f[0], tone: split === "overlap" ? "warning" : "active" },
        { label: "choose hyperparameters", value: f[1], tone: split === "tuneTest" ? "warning" : "signal" },
        { label: "lock model", value: f[2] },
        { label: "estimate performance", value: f[3], tone: split === "clean" ? "active" : "warning" },
      ], "Training, tuning, and testing independence"));
      parts.controls.replaceChildren(el("div", { class: "lab-control-block" }, [
        el("span", { class: "lab-control-label", text: "Evaluation design" }),
        choiceRow(el, [
          { label: "Clean three-way split", value: "clean" },
          { label: "Tune on test", value: "tuneTest" },
          { label: "Target in GWAS", value: "overlap" },
        ], split, (value) => { split = value; render(); }, "Polygenic-score validation design"),
      ]));
      parts.rail.replaceChildren(causalRail(el, [
        { key: "training", value: "estimate weights" },
        { key: "tuning", value: "select prior / threshold" },
        { key: "testing", value: "one locked evaluation" },
        { key: "claim", value: split === "clean" ? "transport estimate" : "optimistically biased" },
      ]));
      parts.explanation.innerHTML = "<strong>The test set is spent the first time it influences a choice.</strong> Participant overlap, close relatives across splits, or choosing the best model on the reported test all inflate R² without improving a future prediction.";
    }

    function renderRisk() {
      const result = polygenicModel({ kind: "risk", prevalence, liabilityR2, score: scoreZ });
      const auc = polygenicModel({ kind: "auc", prevalence, liabilityR2 });
      const discoveryRisk = polygenicModel({ kind: "risk", prevalence: 0.05, liabilityR2, score: scoreZ }).risk;
      const percentiles = [
        { label: "5th", z: -1.645 }, { label: "50th", z: 0 }, { label: "90th", z: 1.282 },
        { label: "95th", z: 1.645 }, { label: "99th", z: 2.326 },
      ];
      parts.visual.replaceChildren(
        locusPlot(el, percentiles.map((item) => {
          const risk = polygenicModel({ kind: "risk", prevalence, liabilityR2, score: item.z }).risk;
          return { label: item.label + " percentile", short: item.label, value: risk, display: percent(risk, 1), tone: item.z === scoreZ ? "active" : "signal" };
        }), "Absolute disease risk across score percentiles"),
        statusStrip(el, [
          { label: "selected absolute risk", value: percent(result.risk, 2), tone: "active" },
          { label: "relative to prevalence", value: result.relativeToPopulation.toFixed(2) + "×" },
          { label: "liability-model AUC", value: auc.auc.toFixed(3) },
          { label: "risk using 5% baseline", value: percent(discoveryRisk, 2), tone: Math.abs(discoveryRisk - result.risk) > 0.01 ? "warning" : "muted" },
        ], "Polygenic risk, discrimination, and calibration")
      );
      parts.controls.replaceChildren(
        rangeControl(el, "Target-population prevalence", prevalence, { min: 0.005, max: 0.30, step: 0.005, format: (value) => percent(value, 1) },
          (value) => { prevalence = value; render(); }),
        rangeControl(el, "Liability variance explained", liabilityR2, { min: 0.01, max: 0.30, step: 0.01, format: (value) => percent(value, 0) },
          (value) => { liabilityR2 = value; render(); }),
        rangeControl(el, "Score z", scoreZ, { min: -2.326, max: 2.326, step: 0.043, format: (value) => value.toFixed(2) },
          (value) => { scoreZ = value; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "score rank", value: "z = " + scoreZ.toFixed(2) },
        { key: "liability R²", value: percent(liabilityR2, 0) },
        { key: "baseline prevalence", value: percent(prevalence, 1) },
        { key: "absolute risk", value: percent(result.risk, 2) },
      ]));
      parts.explanation.innerHTML = "<strong>Discrimination ranks people; calibration supplies the number used in a decision.</strong> AUC survives any monotone rescaling, while absolute risk changes when prevalence changes. Re-estimate the target intercept—never transport a discovery baseline.";
    }

    function renderPortability() {
      const result = polygenicModel({ kind: "portability", trainR, targetR, trainP: 0.30, targetP });
      parts.visual.replaceChildren(
        matrixBoard(el, ["Tag–causal r", "Tag MAF", "r² × tag variance proxy"], [
          { label: "training sample", values: [trainR.toFixed(2), "0.30", compact(result.source, 3)], tones: ["active", "active", "active"] },
          { label: "target sample", values: [targetR.toFixed(2), targetP.toFixed(2), compact(result.target, 3)], tones: ["warning", "warning", "warning"] },
        ], "One-locus portability decomposition"),
        statusStrip(el, [
          { label: "target/source proxy", value: percent(result.signalRatio, 0), tone: result.signalRatio < 0.6 ? "warning" : "active" },
          { label: "causal biology changed?", value: "no" },
          { label: "LD phase in target", value: result.direction, tone: result.direction === "retained" ? "active" : "warning" },
          { label: "actual PRS accuracy?", value: "not estimated", tone: "warning" },
        ], "Portability boundary")
      );
      parts.controls.replaceChildren(
        rangeControl(el, "Training tag–causal r", trainR, { min: 0.1, max: 1, step: 0.02, format: (value) => value.toFixed(2) },
          (value) => { trainR = value; render(); }),
        rangeControl(el, "Target tag–causal r", targetR, { min: -1, max: 1, step: 0.02, format: (value) => value.toFixed(2) },
          (value) => { targetR = value; render(); }),
        rangeControl(el, "Target tag MAF", targetP, { min: 0.01, max: 0.5, step: 0.01, format: (value) => percent(value, 0) },
          (value) => { targetP = value; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "biased recruitment", value: "one LD history dominates" },
        { key: "GWAS weight", value: "fits its tag relationship" },
        { key: "target genome", value: "different LD + tag frequency" },
        { key: "fix", value: "representative recruitment + ancestry-aware LD" },
      ]));
      parts.explanation.innerHTML = "<strong>The displayed r² × 2p<sub>tag</sub>(1−p<sub>tag</sub>) ratio is a one-locus signal proxy, not a PRS accuracy formula.</strong> It isolates LD magnitude and tag variance; the separate phase readout catches a sign reversal that r² hides. Whole-score accuracy also depends on causal architecture, effect heterogeneity, environment, phenotype definition, calibration, and discovery confounding—and changes continuously with genetic distance, not at a race boundary.";
    }

    function renderDesign() {
      const rows = {
        human: ["weak / heterogeneous", "broad and shifting", "mostly unrelated", "one person's outcome", "limited"],
        cattle: ["standardised and repeated", "managed", "close pedigreed relatives", "mean of many progeny", "routine"],
      };
      const f = rows[design];
      parts.visual.replaceChildren(matrixBoard(el, ["Phenotype", "Environment", "Train ↔ target", "Prediction target", "Selection cycles"], [
        { label: design === "human" ? "human clinic" : "dairy breeding", values: f, tones: design === "cattle" ? ["active", "active", "active", "active", "active"] : ["warning", "warning", "warning", "warning", "muted"] },
      ], "Same weighted-dosage estimator under different study designs"));
      parts.controls.replaceChildren(el("div", { class: "lab-control-block" }, [
        el("span", { class: "lab-control-label", text: "Deployment" }),
        choiceRow(el, [
          { label: "Human clinical risk", value: "human" },
          { label: "Dairy breeding value", value: "cattle" },
        ], design, (value) => { design = value; render(); }, "Polygenic prediction deployment"),
      ]));
      parts.rail.replaceChildren(causalRail(el, [
        { key: "estimator", value: "Σ dosage × weight" },
        { key: "study design", value: design === "cattle" ? "matched, related, repeated" : "mismatched, heterogeneous" },
        { key: "target", value: f[3] },
        { key: "performance", value: design === "cattle" ? "high by design" : "bounded and context-sensitive" },
      ]));
      parts.explanation.innerHTML = "<strong>The biology is not simpler in cattle; the prediction problem is.</strong> Breeding programmes match training and target populations, measure phenotypes repeatedly, control environments, and predict a breeding value averaged across offspring. The identical estimator receives much cleaner information.";
    }

    function render() {
      parts.tabHost.replaceChildren(tabs(el, modeChoices, mode, (value) => { mode = value; render(); }));
      if (mode === "score") renderScore();
      else if (mode === "ld") renderLd();
      else if (mode === "prior") renderPrior();
      else if (mode === "validation") renderValidation();
      else if (mode === "risk") renderRisk();
      else if (mode === "portability") renderPortability();
      else renderDesign();
    }

    predict(body, {
      widget: "polygenic-score-clinic",
      question: "A top-decile group has 2.5× the population-average risk for a disease with 5% prevalence. Which number belongs in a clinical decision?",
      hint: "Relative risk cannot say how many people are expected to develop disease.",
      options: [
        { label: "The 2.5× ratio alone" },
        { label: "About 12.5% absolute risk, after target calibration", correct: true },
        { label: "A 95% probability of disease" },
        { label: "The score percentile as a diagnosis" },
      ],
    }, () => {
      mode = "risk";
      prevalence = 0.05;
      liabilityR2 = 0.10;
      scoreZ = 1.645;
      parts.instrument.hidden = false;
      render();
    });
    finishLab(parts, body);
  });

  /* Chapter 54 — rare variants and Mendelian disease ------------------ */

  define("rare-variant-detective", makeObjectiveMap("ch54", [
    "Spectrum mode derives dominant and recessive mutation-selection balance and populates the frequency-by-effect plane with its exceptions.",
    "Power mode combines variance-explained algebra, the carrier information floor, and the maximum LD tagging bound for rare alleles.",
    "Frequency mode derives dominant and recessive filters from prevalence, penetrance, and heterogeneity rather than using one rarity cutoff.",
    "Filter, trio, and phase modes turn a pedigree into an explicit decision procedure with genotype likelihood, artefact, and in-trans checks.",
    "Aggregation mode compares burden and SKAT signals under same- and mixed-direction effects and lets a contaminated mask dilute the hypothesis.",
    "Constraint mode treats depletion as gene-level prior information and exposes short-gene, recessive, and late-onset blind spots.",
  ]), function (api) {
    const { body, el, predict } = api;
    const parts = labParts(el);
    let mode = "phase";
    let selection = 0.5;
    let maf = 0.001;
    let effect = 0.5;
    let carriers = 24;
    let tagFrequency = 0.30;
    let diseaseModel = "dominant";
    let penetrance = 1;
    let heterogeneity = 0.05;
    let trioScenario = "clean";
    let phase = "trans";
    let effectDirection = "same";
    let causalFraction = 1;
    let constraintGene = "haplo";

    const modeChoices = [
      { label: "Frequency × effect", value: "spectrum" },
      { label: "GWAS hard floor", value: "power" },
      { label: "Frequency filter", value: "frequency" },
      { label: "Filtering funnel", value: "filter" },
      { label: "Trio artefacts", value: "trio" },
      { label: "Phase", value: "phase" },
      { label: "Burden vs SKAT", value: "aggregate" },
      { label: "Constraint prior", value: "constraint" },
    ];

    function renderSpectrum() {
      const balance = rareVariantModel({ kind: "balance", mutationRate: 1e-6, selection, dominance: 0.5 });
      parts.visual.replaceChildren(
        pointPlot(el, [
          { label: "common small effect", x: 0.30, y: 0.08, short: "GWAS", tone: "signal" },
          { label: "rare large effect", x: 0.01, y: 0.70, short: "rare", tone: "active" },
          { label: "private near-deterministic", x: 0.0001, y: 0.95, short: "de novo", tone: "active" },
          { label: "common large effect empty corner", x: 0.35, y: 0.90, short: "selected out", tone: "warning" },
        ], {
          label: "Allele frequency by effect-size architecture",
          xLabel: "population frequency", yLabel: "effect size", xMin: 0, xMax: 0.5, yMin: 0, yMax: 1,
        }),
        statusStrip(el, [
          { label: "dominant q*", value: compact(balance.dominantFrequency, 2), tone: "active" },
          { label: "recessive q*", value: compact(balance.recessiveFrequency, 2), tone: "signal" },
          { label: "late onset", value: "selection weak" },
          { label: "other exceptions", value: "balancing / founder drift" },
        ], "Mutation-selection balance for a gene-sized loss-of-function target")
      );
      parts.controls.replaceChildren(rangeControl(el, "Fitness selection s", selection, {
        min: 0.01, max: 1, step: 0.01, format: (value) => value.toFixed(2),
      }, (value) => { selection = value; render(); }));
      parts.rail.replaceChildren(causalRail(el, [
        { key: "new mutation", value: "μ = 10⁻⁶ per gene" },
        { key: "fitness effect", value: "s = " + selection.toFixed(2) },
        { key: "equilibrium", value: "dominant μ/(hs); recessive √(μ/s)" },
        { key: "architecture", value: "large effects remain rare" },
      ]));
      parts.explanation.innerHTML = "<strong>The common/large-effect corner is empty because it would be easiest to discover and hardest for selection to tolerate.</strong> Late onset, heterozygote advantage, and founder drift are exceptions because they weaken or redirect the selective premise.";
    }

    function renderPower() {
      const power = rareVariantModel({ kind: "power", p: maf, beta: effect });
      const floor = rareVariantModel({ kind: "carrierFloor", carriers });
      const tagging = rareVariantModel({ kind: "tagging", rareFrequency: maf, tagFrequency: Math.max(maf, tagFrequency) });
      parts.visual.replaceChildren(
        matrixBoard(el, ["Quantity", "Result", "Binding implication"], [
          { label: "single-variant power", values: ["R² = 2p(1−p)β²", compact(power.sampleSize, 0) + " samples", "N ∝ 1/(pβ²)"], tones: ["muted", "active", "warning"] },
          { label: "ideal one-sided carrier floor", values: [carriers + " carriers", "pmin " + floor.oneSidedMinimumP.toExponential(2), floor.genomeWidePossible ? "threshold possible" : "impossible"], tones: ["muted", floor.genomeWidePossible ? "active" : "warning", floor.genomeWidePossible ? "active" : "warning"] },
          { label: "common tag bound", values: ["r²max " + compact(tagging.maxR2, 4), compact(tagging.samplePenalty, 0) + "× N penalty", "observe the rare allele"], tones: ["muted", "warning", "active"] },
        ], "Three independent limits on rare-variant GWAS"));
      parts.controls.replaceChildren(
        rangeControl(el, "Rare-allele frequency", maf, { min: 0.00001, max: 0.02, step: 0.00001, format: (value) => percent(value, 3) },
          (value) => { maf = value; if (tagFrequency < value) tagFrequency = value; render(); }),
        rangeControl(el, "Per-allele effect (SD)", effect, { min: 0.05, max: 1, step: 0.05, format: (value) => value.toFixed(2) },
          (value) => { effect = value; render(); }),
        rangeControl(el, "Observed carriers", carriers, { min: 1, max: 40, step: 1, format: (value) => value.toFixed(0) },
          (value) => { carriers = value; render(); }),
        rangeControl(el, "Tag frequency", tagFrequency, { min: 0.01, max: 0.5, step: 0.01, format: (value) => percent(value, 0) },
          (value) => { tagFrequency = Math.max(value, maf); render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "variance", value: "shrinks with p" },
        { key: "information", value: "ideal one-sided: <25 cannot reach 5×10⁻⁸; two-sided needs 26" },
        { key: "tagging", value: "rare allele cannot strongly tag a common one" },
        { key: "design", value: "sequence + aggregate by gene" },
      ]));
      parts.explanation.innerHTML = "<strong>These are different obstructions.</strong> The 2<sup>−k</sup> floor is the most favourable one-sided exact result in a balanced binary case–control fixture: every carrier falls among cases. A two-sided tail doubles that p-value, so 25 carriers are only enough for the stated one-sided direction and 26 are needed two-sided. Denser common-marker arrays still cannot overcome the algebraic LD bound; ultra-rare analysis must observe the allele and aggregate evidence at the gene or family level.";
    }

    function renderFrequency() {
      const result = rareVariantModel({ kind: "frequency", prevalence: 2e-5, penetrance, heterogeneity });
      const threshold = diseaseModel === "dominant" ? result.dominant : result.recessive;
      parts.visual.replaceChildren(
        barBoard(el, [
          { label: "dominant single-allele maximum", value: result.dominant, display: result.dominant.toExponential(2), tone: diseaseModel === "dominant" ? "active" : "muted" },
          { label: "recessive causal-allele pool", value: result.recessive, display: result.recessive.toExponential(2), tone: diseaseModel === "recessive" ? "active" : "muted" },
        ], "Maximum credible allele frequencies", Math.max(result.recessive, 1e-12)),
        statusStrip(el, [
          { label: "selected model", value: diseaseModel },
          { label: "derived threshold", value: threshold.toExponential(2), tone: "active" },
          { label: "penetrance", value: percent(penetrance, 0) },
          { label: "maximum case share", value: percent(heterogeneity, 0) },
        ], "Disease-model frequency filter")
      );
      parts.controls.replaceChildren(
        el("div", { class: "lab-control-block" }, [
          el("span", { class: "lab-control-label", text: "Inheritance model" }),
          choiceRow(el, [{ label: "Dominant", value: "dominant" }, { label: "Recessive", value: "recessive" }], diseaseModel,
            (value) => { diseaseModel = value; render(); }, "Frequency-filter inheritance model"),
        ]),
        rangeControl(el, "Penetrance", penetrance, { min: 0.1, max: 1, step: 0.05, format: (value) => percent(value, 0) },
          (value) => { penetrance = value; render(); }),
        rangeControl(el, "Largest plausible share of cases", heterogeneity, { min: 0.01, max: 0.5, step: 0.01, format: (value) => percent(value, 0) },
          (value) => { heterogeneity = value; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "prevalence", value: "2 × 10⁻⁵" },
        { key: "case share", value: percent(heterogeneity, 0) },
        { key: "penetrance", value: percent(penetrance, 0) },
        { key: "maximum frequency", value: threshold.toExponential(2) },
      ]));
      parts.explanation.innerHTML = "<strong>“Rare” is not one clinical threshold.</strong> A dominant case frequency scales with q; a recessive one with the square of the summed causal-allele frequency. The same disease can therefore justify thresholds three orders of magnitude apart.";
    }

    function renderFilter() {
      const result = rareVariantModel({ kind: "frequency", prevalence: 2e-5, penetrance, heterogeneity });
      const threshold = diseaseModel === "dominant" ? result.dominant : result.recessive;
      const frequencySurvivors = diseaseModel === "dominant" ? 18 : 120;
      parts.visual.replaceChildren(processBoard(el, [
        { label: "called coding variants", value: "~21,000" },
        { label: "frequency ≤ " + threshold.toExponential(1), value: frequencySurvivors + " remain", tone: "active" },
        { label: "consequence + transcript", value: diseaseModel === "dominant" ? "7 remain" : "36 remain" },
        { label: "pedigree / inheritance", value: diseaseModel === "dominant" ? "1 de novo" : "2 genes with pairs", tone: "active" },
        { label: "gene + phenotype", value: "candidate, not verdict", tone: "warning" },
      ], "Rare-disease filtering as sequential evidence"));
      parts.controls.replaceChildren(el("div", { class: "lab-control-block" }, [
        el("span", { class: "lab-control-label", text: "Working disease model" }),
        choiceRow(el, [{ label: "De novo dominant", value: "dominant" }, { label: "Recessive", value: "recessive" }], diseaseModel,
          (value) => { diseaseModel = value; render(); }, "Rare-disease filtering model"),
      ]));
      parts.rail.replaceChildren(causalRail(el, [
        { key: "frequency", value: "compatible with prevalence" },
        { key: "consequence", value: "compatible with mechanism + transcript" },
        { key: "inheritance", value: "compatible with trio" },
        { key: "prior", value: "gene validity + phenotype match" },
      ]));
      parts.explanation.innerHTML = "<strong>Every filter is a likelihood-ratio question conditioned on the disease model.</strong> A candidate novel gene is not discarded for lacking prior literature; it moves to matchmaking, because an independent patient is the missing observation.";
    }

    function renderTrio() {
      const fixtures = {
        clean: { real: 70, sites: 3e9, rate: 1e-9, child: "0/1, balance 0.50", parents: "0/0 at 35×", region: "unique", result: "credible de novo" },
        mapping: { real: 70, sites: 3e9, rate: 1e-6, child: "0/1, balance 0.18", parents: "0/0", region: "segmental duplication", result: "artefact-dominated" },
        mosaic: { real: 70, sites: 3e9, rate: 2e-8, child: "alt fraction 0.12", parents: "0/0", region: "unique", result: "post-zygotic mosaic candidate" },
      };
      const f = fixtures[trioScenario];
      const result = rareVariantModel({ kind: "deNovo", real: f.real, sites: f.sites, artifactRate: f.rate });
      parts.visual.replaceChildren(
        matrixBoard(el, ["Proband", "Parents", "Region", "Interpretation"], [
          { label: "candidate", values: [f.child, f.parents, f.region, f.result], tones: ["active", "muted", trioScenario === "mapping" ? "warning" : "active", trioScenario === "mapping" ? "warning" : "active"] },
        ], "Trio de novo evidence"),
        statusStrip(el, [
          { label: "expected real de novos", value: compact(result.real, 0), tone: "active" },
          { label: "expected false candidates", value: compact(result.falseCalls, 0), tone: "warning" },
          { label: "pre-filter FDR", value: percent(result.falseDiscoveryRate, 1), tone: "warning" },
          { label: "clinical report", value: "orthogonal confirmation" },
        ], "De novo prior odds")
      );
      parts.controls.replaceChildren(el("div", { class: "lab-control-block" }, [
        el("span", { class: "lab-control-label", text: "Trio call" }),
        choiceRow(el, [
          { label: "Clean", value: "clean" },
          { label: "Mismapping", value: "mapping" },
          { label: "Mosaic", value: "mosaic" },
        ], trioScenario, (value) => { trioScenario = value; render(); }, "Trio de novo scenario"),
      ]));
      parts.rail.replaceChildren(causalRail(el, [
        { key: "child likelihood", value: f.child },
        { key: "parent likelihoods", value: f.parents },
        { key: "sequence context", value: f.region },
        { key: "claim", value: f.result },
      ]));
      parts.explanation.innerHTML = "<strong>“Heterozygous child, reference parents” is only the start.</strong> Billions of tested sites make tiny systematic error rates dominate the ~70 real de novos. Allele balance, depth, mappability, likelihoods, pedigree checks, and orthogonal confirmation supply the missing evidence; a low child fraction can be real mosaicism.";
    }

    function renderPhase() {
      const inTrans = phase === "trans";
      parts.visual.replaceChildren(
        matrixBoard(el, ["Maternal haplotype", "Paternal haplotype", "Functional copies"], [
          { label: inTrans ? "in trans" : "in cis", values: inTrans ? ["variant A", "variant B", "0 intact"] : ["variant A + B", "reference", "1 intact"], tones: inTrans ? ["warning", "warning", "active"] : ["warning", "active", "warning"] },
        ], "Compound-heterozygous phase"),
        claimBoundary(el, "two heterozygous genotypes", "which chromosome carries each", inTrans ? "Parental or read-backed phasing puts one damaging allele on each copy, satisfying a recessive genotype model." : "Both changes sit on one copy; the other is intact, so this pair does not explain a recessive disease.")
      );
      parts.controls.replaceChildren(el("div", { class: "lab-control-block" }, [
        el("span", { class: "lab-control-label", text: "Resolved phase" }),
        choiceRow(el, [{ label: "In trans", value: "trans" }, { label: "In cis", value: "cis" }], phase,
          (value) => { phase = value; render(); }, "Compound-heterozygous phase"),
      ]));
      parts.rail.replaceChildren(causalRail(el, [
        { key: "VCF genotypes", value: "0/1 at two sites" },
        { key: "phase source", value: "parents / spanning molecules" },
        { key: "haplotypes", value: inTrans ? "one hit per copy" : "two hits on one copy" },
        { key: "recessive claim", value: inTrans ? "compatible" : "rejected" },
      ]));
      parts.explanation.innerHTML = "<strong>An unphased VCF cannot make a compound-heterozygous diagnosis.</strong> Trio inheritance is strongest when one variant came from each parent; long reads can span distant sites. Population phasing is weakest exactly where these ultra-rare alleles lack shared haplotypes.";
    }

    function renderAggregate() {
      const effects = effectDirection === "same" ? [1, 1, 1, 1, 1, 1] : [1, -1, 1, -1, 1, -1];
      const result = rareVariantModel({ kind: "aggregate", effects, causalFraction });
      parts.visual.replaceChildren(
        barBoard(el, [
          { label: "burden directional signal", value: result.burdenSignal * result.dilution, display: compact(result.burdenSignal * result.dilution, 2), tone: result.burdenSignal > 0 ? "active" : "warning" },
          { label: "SKAT squared-score signal", value: result.skatSignal * result.dilution, display: compact(result.skatSignal * result.dilution, 2), tone: "signal" },
        ], "Teaching-scale relative non-centrality signals", 6),
        statusStrip(el, [
          { label: "effect directions", value: effectDirection },
          { label: "causal fraction in mask", value: percent(causalFraction, 0), tone: causalFraction < 0.5 ? "warning" : "active" },
          { label: "best pure test", value: effectDirection === "same" ? "burden" : "SKAT", tone: "active" },
          { label: "unknown direction", value: "SKAT-O" },
        ], "Rare-variant aggregation choice")
      );
      parts.controls.replaceChildren(
        el("div", { class: "lab-control-block" }, [el("span", { class: "lab-control-label", text: "Effect directions" }),
          choiceRow(el, [{ label: "Same", value: "same" }, { label: "Mixed", value: "mixed" }], effectDirection,
            (value) => { effectDirection = value; render(); }, "Rare-variant effect directions")]),
        rangeControl(el, "Causal variants inside mask", causalFraction, { min: 0.1, max: 1, step: 0.05, format: (value) => percent(value, 0) },
          (value) => { causalFraction = value; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "mask", value: percent(causalFraction, 0) + " causal" },
        { key: "burden", value: "sums signed effects" },
        { key: "SKAT", value: "squares variant scores" },
        { key: "hypothesis", value: "mechanism decides direction + mask" },
      ]));
      parts.explanation.innerHTML = "<strong>The mask is the biological hypothesis.</strong> Burden concentrates same-direction loss-of-function effects but cancels mixed directions; SKAT preserves mixed directions at a degrees-of-freedom cost. Adding non-causal missense variants dilutes either test rather than playing safe.";
    }

    function renderConstraint() {
      const fixtures = {
        haplo: ["long haploinsufficient gene", "low LOEUF", "strong LoF-intolerance prior", "fits dominant LoF"],
        short: ["short gene", "wide expected/observed interval", "absence of evidence", "low mutational target"],
        recessive: ["recessive disease gene", "heterozygous LoF tolerated", "ordinary LOEUF", "constraint blind spot"],
        late: ["late-onset disease gene", "small fitness cost", "ordinary LOEUF", "selection blind spot"],
      };
      const f = fixtures[constraintGene];
      parts.visual.replaceChildren(matrixBoard(el, ["Observed pattern", "Correct reading", "Failure mechanism"], [
        { label: f[0], values: [f[1], f[2], f[3]], tones: constraintGene === "haplo" ? ["active", "active", "active"] : ["warning", "active", "warning"] },
      ], "Gene constraint as population prior"), claimBoundary(el, "depletion of variant classes in populations", "pathogenicity of this patient's variant", "Constraint raises or lowers a gene-level prior; consequence, mechanism, phenotype, and case evidence remain separate."));
      parts.controls.replaceChildren(el("div", { class: "lab-control-block" }, [
        el("span", { class: "lab-control-label", text: "Gene architecture" }),
        choiceRow(el, [
          { label: "Haploinsufficient", value: "haplo" },
          { label: "Short gene", value: "short" },
          { label: "Recessive", value: "recessive" },
          { label: "Late onset", value: "late" },
        ], constraintGene, (value) => { constraintGene = value; render(); }, "Constraint-gene scenario"),
      ]));
      parts.rail.replaceChildren(causalRail(el, [
        { key: "mutation model", value: "expected pLoF count" },
        { key: "population sample", value: "observed pLoF count" },
        { key: "depletion", value: f[1] },
        { key: "clinical use", value: f[2] },
      ]));
      parts.explanation.innerHTML = "<strong>Constraint measures present-day selection on a variant class, not disease and not this variant.</strong> It is powerful independent prior information for dominant dosage-sensitive genes, but short genes lack power and recessive or late-onset mechanisms can remain unconstrained.";
    }

    function render() {
      parts.tabHost.replaceChildren(tabs(el, modeChoices, mode, (value) => { mode = value; render(); }));
      if (mode === "spectrum") renderSpectrum();
      else if (mode === "power") renderPower();
      else if (mode === "frequency") renderFrequency();
      else if (mode === "filter") renderFilter();
      else if (mode === "trio") renderTrio();
      else if (mode === "phase") renderPhase();
      else if (mode === "aggregate") renderAggregate();
      else renderConstraint();
    }

    predict(body, {
      widget: "rare-variant-detective",
      question: "A proband has two rare damaging heterozygous variants in one recessive gene. What must be established before the pair explains disease?",
      hint: "A recessive genotype must disable both physical copies of the gene.",
      options: [
        { label: "Both variants are absent from gnomAD" },
        { label: "They are on different parental haplotypes", correct: true },
        { label: "Three predictors call both damaging" },
        { label: "The gene has low LOEUF" },
      ],
    }, () => {
      mode = "phase";
      phase = "cis";
      parts.instrument.hidden = false;
      render();
    });
    finishLab(parts, body);
  });

  /* Chapter 55 — clinical variant interpretation ---------------------- */

  define("clinical-evidence-classifier", makeObjectiveMap("ch55", [
    "Tier mode maps posterior probability to the five ACMG and AMP classes and keeps VUS visibly non-actionable.",
    "Evidence mode groups criteria by biological source, applies signed strength points once, and contrasts the continuous Bayesian reconstruction with checklist rules.",
    "Posterior mode exposes prior odds, the geometric OddsPath ladder, additive log evidence, and the five probability boundaries.",
    "Frequency mode derives maximum credible dominant and recessive allele frequencies and distinguishes too common from informatively absent.",
    "Predictor mode collapses correlated algorithms into one calibrated likelihood-ratio observation with an explicit indeterminate interval.",
    "Assay mode computes sensitivity, false-positive rate, and OddsPath while capping confidence when a perfect-looking control set is small.",
    "Family and record modes quantify segregation, de novo and phase evidence, then read ClinVar review status, conflicts, date, and reclassification obligations.",
  ]), function (api) {
    const { body, el, predict } = api;
    const parts = labParts(el);
    let mode = "tier";
    let evidencePoints = 0;
    let evidenceBundle = "novel";
    let prior = 0.10;
    let diseaseModel = "dominant";
    let penetrance = 0.8;
    let heterogeneity = 0.05;
    let predictorScore = 0.70;
    let predictorCount = 3;
    let pathogenicControls = 20;
    let benignControls = 20;
    let abnormalPathogenic = 18;
    let abnormalBenign = 2;
    let meioses = 3;
    let phaseEvidence = "unknown";
    let record = "conflict";

    const modeChoices = [
      { label: "Five tiers", value: "tier" },
      { label: "Evidence ledger", value: "evidence" },
      { label: "Bayes engine", value: "posterior" },
      { label: "Frequency ceiling", value: "frequency" },
      { label: "Predictors", value: "predictor" },
      { label: "Assay validation", value: "assay" },
      { label: "Family evidence", value: "family" },
      { label: "ClinVar + time", value: "record" },
    ];

    function tierAction(tier) {
      if (tier === "Pathogenic" || tier === "Likely pathogenic") return "may support diagnosis / management in the right clinical context";
      if (tier === "Uncertain significance") return "no clinical action and no predictive testing of relatives";
      return "remove from causal consideration";
    }

    function renderTier() {
      const result = clinicalModel({ kind: "posterior", points: evidencePoints, prior });
      const tiers = [
        { label: "Benign", value: 0.001, display: "<0.1%", tone: result.tier === "Benign" ? "active" : "muted" },
        { label: "Likely benign", value: 0.10, display: "0.1–10%", tone: result.tier === "Likely benign" ? "active" : "muted" },
        { label: "VUS", value: 0.90, display: "10–90%", tone: result.tier === "Uncertain significance" ? "warning" : "muted" },
        { label: "Likely pathogenic", value: 0.99, display: "90–99%", tone: result.tier === "Likely pathogenic" ? "active" : "muted" },
        { label: "Pathogenic", value: 1, display: ">99%", tone: result.tier === "Pathogenic" ? "active" : "muted" },
      ];
      parts.visual.replaceChildren(
        locusPlot(el, tiers, "Five clinical classification probability tiers"),
        statusStrip(el, [
          { label: "posterior", value: percent(result.posterior, 2), tone: result.tier === "Uncertain significance" ? "warning" : "active" },
          { label: "tier", value: result.tier, tone: result.tier === "Uncertain significance" ? "warning" : "active" },
          { label: "licensed action", value: tierAction(result.tier) },
        ], "Current classification and action boundary")
      );
      parts.controls.replaceChildren(rangeControl(el, "Net evidence points", evidencePoints, {
        min: -10, max: 14, step: 1, format: (value) => (value > 0 ? "+" : "") + value.toFixed(0),
      }, (value) => { evidencePoints = value; render(); }));
      parts.rail.replaceChildren(causalRail(el, [
        { key: "variant + disease", value: "one dated classification context" },
        { key: "evidence", value: (evidencePoints >= 0 ? "+" : "") + evidencePoints + " points" },
        { key: "posterior", value: percent(result.posterior, 2) },
        { key: "action", value: tierAction(result.tier) },
      ]));
      parts.explanation.innerHTML = "<strong>A classification describes evidence for a variant–gene–disease pair on a date; it is not an intrinsic property of the DNA change.</strong> VUS is the evidence residual and licenses neither pathogenic action nor benign reassurance.";
    }

    function renderEvidence() {
      const bundles = {
        novel: { points: 1, rows: [
          ["population", "PM2 supporting", "+1", "absent at adequate coverage"],
          ["computational", "PP3", "0", "score lies in indeterminate interval"],
          ["family", "none", "0", "no informative meioses"],
        ] },
        strong: { points: 10, rows: [
          ["molecular consequence", "PVS1 very strong", "+8", "LoF is established disease mechanism"],
          ["population", "PM2 supporting", "+1", "rarity counted once"],
          ["phenotype", "PP4 supporting", "+1", "highly specific presentation"],
        ] },
        conflict: { points: 1, rows: [
          ["functional", "PS3 strong", "+4", "validated abnormal assay"],
          ["population", "BS1 strong", "−4", "too common for model"],
          ["segregation", "PP1 supporting", "+1", "limited family"],
        ] },
        duplicate: { points: 1, rows: [
          ["computational", "SIFT + PolyPhen + REVEL", "+1", "shared features: one calibrated observation"],
          ["computational", "not +3", "0", "conditional independence fails"],
          ["other evidence", "none", "0", "do not manufacture certainty"],
        ] },
      };
      const f = bundles[evidenceBundle];
      const result = clinicalModel({ kind: "posterior", points: f.points, prior });
      parts.visual.replaceChildren(
        matrixBoard(el, ["Criterion", "Points", "Why"], f.rows.map((row) => ({
          label: row[0], values: row.slice(1), tones: row[2].startsWith("−") ? ["warning", "warning", "warning"] : ["active", "active", "muted"],
        })), "Signed clinical evidence ledger"),
        statusStrip(el, [
          { label: "net points", value: (f.points >= 0 ? "+" : "") + f.points },
          { label: "Bayesian reconstruction", value: result.tier, tone: result.tier === "Uncertain significance" ? "warning" : "active" },
          { label: "posterior", value: percent(result.posterior, 2) },
          { label: "double-counted?", value: "no" },
        ], "Evidence combination")
      );
      parts.controls.replaceChildren(el("div", { class: "lab-control-block" }, [
        el("span", { class: "lab-control-label", text: "Evidence bundle" }),
        choiceRow(el, [
          { label: "Novel missense", value: "novel" },
          { label: "LoF + phenotype", value: "strong" },
          { label: "Conflicting", value: "conflict" },
          { label: "3 predictors", value: "duplicate" },
        ], evidenceBundle, (value) => { evidenceBundle = value; render(); }, "Clinical evidence bundle"),
      ]));
      parts.rail.replaceChildren(causalRail(el, [
        { key: "source categories", value: "population · function · family · phenotype" },
        { key: "strength", value: "supporting 1 · moderate 2 · strong 4 · very strong 8" },
        { key: "dependence audit", value: "shared observations counted once" },
        { key: "classification", value: result.tier },
      ]));
      parts.explanation.innerHTML = "<strong>The points are the Bayesian reconstruction of the strength ladder, not a replacement for disease-specific criteria or the 2015 combining rules.</strong> Evidence sources must be independent enough to multiply; contradictions remain visible instead of being averaged into false confidence.";
    }

    function renderPosterior() {
      const result = clinicalModel({ kind: "posterior", points: evidencePoints, prior });
      const ladder = [
        { label: "supporting", points: 1 }, { label: "moderate", points: 2 },
        { label: "strong", points: 4 }, { label: "very strong", points: 8 },
      ].map((item) => {
        const r = clinicalModel({ kind: "posterior", points: item.points, prior });
        return { label: item.label, value: r.oddsPath, display: compact(r.oddsPath, 2), tone: "active" };
      });
      parts.visual.replaceChildren(
        barBoard(el, ladder, "Geometric OddsPath evidence-strength ladder", 350),
        statusStrip(el, [
          { label: "prior", value: percent(prior, 1) },
          { label: "net points", value: (evidencePoints >= 0 ? "+" : "") + evidencePoints },
          { label: "combined OddsPath", value: compact(result.oddsPath, 2) },
          { label: "posterior", value: percent(result.posterior, 3), tone: result.tier === "Uncertain significance" ? "warning" : "active" },
        ], "Prior odds multiplied by evidence likelihood ratios")
      );
      parts.controls.replaceChildren(
        rangeControl(el, "Classification-queue prior", prior, { min: 0.01, max: 0.30, step: 0.01, format: (value) => percent(value, 0) },
          (value) => { prior = value; render(); }),
        rangeControl(el, "Net evidence points", evidencePoints, { min: -10, max: 14, step: 1, format: (value) => (value > 0 ? "+" : "") + value.toFixed(0) },
          (value) => { evidencePoints = value; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "prior odds", value: compact(prior / (1 - prior), 3) },
        { key: "likelihood ratio", value: compact(result.oddsPath, 2) },
        { key: "posterior odds", value: compact((prior / (1 - prior)) * result.oddsPath, 2) },
        { key: "tier", value: result.tier },
      ]));
      parts.explanation.innerHTML = "<strong>Supporting, Moderate, Strong, and Very Strong form a geometric likelihood-ratio ladder.</strong> The queue prior is a model choice, not the probability that a random genomic position is pathogenic. Conditional dependence is the skeleton's central weakness.";
    }

    function renderFrequency() {
      const result = clinicalModel({ kind: "frequency", prevalence: 2e-5, penetrance, heterogeneity });
      const selected = diseaseModel === "dominant" ? result.dominant : result.recessive;
      parts.visual.replaceChildren(
        matrixBoard(el, ["Formula", "Maximum frequency", "Clinical reading"], [
          { label: "dominant", values: ["cP/(2f)", result.dominant.toExponential(2), diseaseModel === "dominant" ? "active model" : "comparison"], tones: diseaseModel === "dominant" ? ["active", "active", "active"] : ["muted", "muted", "muted"] },
          { label: "recessive", values: ["√(cP/f)", result.recessive.toExponential(2), diseaseModel === "recessive" ? "active model" : "comparison"], tones: diseaseModel === "recessive" ? ["active", "active", "active"] : ["muted", "muted", "muted"] },
        ], "Maximum credible allele frequency from the disease model"),
        claimBoundary(el, "frequency relative to " + selected.toExponential(2), "pathogenicity by absence alone", "Above a well-supported ceiling can be benign evidence; absence is only supporting evidence when the database has enough callable chromosomes to resolve that ceiling.")
      );
      parts.controls.replaceChildren(
        el("div", { class: "lab-control-block" }, [el("span", { class: "lab-control-label", text: "Inheritance" }),
          choiceRow(el, [{ label: "Dominant", value: "dominant" }, { label: "Recessive", value: "recessive" }], diseaseModel,
            (value) => { diseaseModel = value; render(); }, "Clinical frequency model")]),
        rangeControl(el, "Penetrance", penetrance, { min: 0.1, max: 1, step: 0.05, format: (value) => percent(value, 0) },
          (value) => { penetrance = value; render(); }),
        rangeControl(el, "Maximum case share c", heterogeneity, { min: 0.01, max: 0.5, step: 0.01, format: (value) => percent(value, 0) },
          (value) => { heterogeneity = value; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "prevalence", value: "2 × 10⁻⁵" },
        { key: "penetrance", value: percent(penetrance, 0) },
        { key: "heterogeneity", value: percent(heterogeneity, 0) },
        { key: "ceiling", value: selected.toExponential(2) },
      ]));
      parts.explanation.innerHTML = "<strong>Population frequency can argue in both directions only against an explicit disease model.</strong> Read maximum ancestry-group frequency, allele number and homozygotes; a low global average can hide a common benign population variant, while a few observed alleles may still be compatible with disease.";
    }

    function predictorStrength(score) {
      if (score < 0.003) return ["benign very strong", -8];
      if (score < 0.016) return ["benign strong", -4];
      if (score < 0.183) return ["benign moderate", -2];
      if (score < 0.290) return ["benign supporting", -1];
      if (score < 0.644) return ["indeterminate", 0];
      if (score < 0.773) return ["pathogenic supporting", 1];
      if (score < 0.932) return ["pathogenic moderate", 2];
      return ["pathogenic strong", 4];
    }

    function renderPredictor() {
      const calibrated = predictorStrength(predictorScore);
      const result = clinicalModel({ kind: "posterior", points: calibrated[1], prior: 0.0441, veryStrongOdds: 1124 });
      parts.visual.replaceChildren(
        locusPlot(el, [
          { label: "benign evidence", short: "BP4", value: 0.29, display: "<0.290", tone: "signal" },
          { label: "indeterminate", short: "none", value: 0.644, display: "0.290–0.644", tone: "muted" },
          { label: "pathogenic evidence", short: "PP3", value: 1, display: ">0.644", tone: "active" },
        ], "Calibrated REVEL score intervals used as one example predictor"),
        statusStrip(el, [
          { label: "score", value: predictorScore.toFixed(3) },
          { label: "calibrated evidence", value: calibrated[0], tone: calibrated[1] === 0 ? "warning" : "active" },
          { label: "predictors consulted", value: predictorCount },
          { label: "independent evidence units", value: calibrated[1] === 0 ? 0 : 1, tone: "active" },
          { label: "illustrative posterior", value: percent(result.posterior, 2) },
        ], "Correlated computational evidence")
      );
      parts.controls.replaceChildren(
        rangeControl(el, "REVEL score fixture", predictorScore, { min: 0, max: 1, step: 0.001, format: (value) => value.toFixed(3) },
          (value) => { predictorScore = value; render(); }),
        rangeControl(el, "Agreeing predictors", predictorCount, { min: 1, max: 6, step: 1, format: (value) => value.toFixed(0) },
          (value) => { predictorCount = value; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "shared features", value: "conservation · structure · training labels" },
        { key: "calibration", value: calibrated[0] },
        { key: "count", value: "once, not " + predictorCount + " times" },
        { key: "limitation", value: "gene mechanism + training overlap" },
      ]));
      parts.explanation.innerHTML = "<strong>The displayed thresholds are the chapter's REVEL calibration example, not universal cutoffs for every predictor or gene.</strong> Agreement among tools built from the same alignments and labels is correlated evidence. Use one independently calibrated likelihood ratio, once, with an explicit no-evidence interval.";
    }

    function renderAssay() {
      const result = clinicalModel({
        kind: "oddsPath", pathogenicControls, benignControls, abnormalPathogenic, abnormalBenign,
      });
      parts.visual.replaceChildren(
        matrixBoard(el, ["Abnormal", "Normal", "Rate"], [
          { label: "known pathogenic", values: [abnormalPathogenic, pathogenicControls - abnormalPathogenic, percent(result.sensitivity, 0)], tones: ["active", "muted", "active"] },
          { label: "known benign", values: [abnormalBenign, benignControls - abnormalBenign, percent(result.falsePositiveRate, 0)], tones: ["warning", "active", "warning"] },
        ], "Functional-assay validation controls"),
        statusStrip(el, [
          { label: "OddsPath abnormal", value: compact(result.oddsPath, 2), tone: "active" },
          { label: "continuity-corrected estimate", value: compact(result.continuityCorrected, 2) },
          { label: "raw strength region", value: result.oddsPath >= 350 ? "very strong point estimate" : result.oddsPath >= 18.7 ? "strong" : result.oddsPath >= 4.3 ? "moderate" : result.oddsPath >= 2.1 ? "supporting" : "below supporting" },
          { label: "finite-control confidence", value: abnormalBenign === 0 ? "must cap / interval" : "still quantify interval", tone: "warning" },
        ], "Assay evidence strength")
      );
      parts.controls.replaceChildren(
        rangeControl(el, "Pathogenic controls called abnormal", abnormalPathogenic, { min: 0, max: pathogenicControls, step: 1, format: (value) => value.toFixed(0) + "/" + pathogenicControls },
          (value) => { abnormalPathogenic = value; render(); }),
        rangeControl(el, "Benign controls called abnormal", abnormalBenign, { min: 0, max: benignControls, step: 1, format: (value) => value.toFixed(0) + "/" + benignControls },
          (value) => { abnormalBenign = value; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "known controls", value: pathogenicControls + " pathogenic / " + benignControls + " benign" },
        { key: "sensitivity", value: percent(result.sensitivity, 0) },
        { key: "false-positive rate", value: percent(result.falsePositiveRate, 0) },
        { key: "OddsPath", value: compact(result.oddsPath, 2) },
      ]));
      parts.explanation.innerHTML = "<strong>OddsPath is sensitivity divided by false-positive rate for the abnormal result.</strong> A zero observed false-positive rate gives an infinite raw point estimate, not infinite knowledge; finite controls require uncertainty bounds and prevent a small perfect-looking assay from earning Very Strong evidence.";
    }

    function renderFamily() {
      const segregation = clinicalModel({ kind: "segregation", meioses });
      const phaseRows = {
        unknown: ["two heterozygotes", "phase unresolved", "no PM3"],
        trans: ["opposite parents", "in trans", "supports recessive model"],
        cis: ["same haplotype", "in cis", "BP2 / pair rejected"],
      };
      const f = phaseRows[phaseEvidence];
      parts.visual.replaceChildren(
        matrixBoard(el, ["Observation", "Resolved state", "Evidence"], [
          { label: "segregation", values: [meioses + " informative meioses", "LR " + compact(segregation.likelihoodRatio, 0), "LOD " + segregation.lod.toFixed(2)], tones: ["active", "active", "active"] },
          { label: "recessive phase", values: f, tones: phaseEvidence === "trans" ? ["active", "active", "active"] : phaseEvidence === "cis" ? ["warning", "warning", "warning"] : ["muted", "warning", "muted"] },
          { label: "de novo", values: ["phenotype specificity + confirmed parentage", "case-weighted points", "not a fixed label"], tones: ["muted", "active", "warning"] },
        ], "Family evidence and its scope"),
        claimBoundary(el, "co-segregating locus evidence", "the unique causal base", "Relatives share haplotypes, penetrance may be incomplete, and ascertainment enriches families that happened to segregate cleanly.")
      );
      parts.controls.replaceChildren(
        rangeControl(el, "Informative meioses", meioses, { min: 0, max: 10, step: 1, format: (value) => value.toFixed(0) },
          (value) => { meioses = value; render(); }),
        el("div", { class: "lab-control-block" }, [el("span", { class: "lab-control-label", text: "Recessive phase" }),
          choiceRow(el, [{ label: "Unknown", value: "unknown" }, { label: "In trans", value: "trans" }, { label: "In cis", value: "cis" }], phaseEvidence,
            (value) => { phaseEvidence = value; render(); }, "Clinical recessive phase evidence")])
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "meioses", value: String(meioses) },
        { key: "null probability", value: compact(Math.pow(0.5, meioses), 4) },
        { key: "segregation LR", value: compact(segregation.likelihoodRatio, 0) },
        { key: "scope", value: "locus, penetrance-conditioned" },
      ]));
      parts.explanation.innerHTML = "<strong>Each fully informative meiosis contributes a 2× likelihood ratio under the simple fully penetrant model, but clinical criteria are deliberately conservative.</strong> De novo strength also depends on phenotype specificity and confirmed parentage; phase can reverse a recessive conclusion.";
    }

    function renderRecord() {
      const fixtures = {
        old: ["1 star", "single submitter, 2016", "pathogenic", "case report + predictor", "read evidence; stale"],
        conflict: ["1 star", "conflicting submissions", "P / VUS / LB", "different dates and criteria", "do not average labels"],
        panel: ["3 stars", "expert panel", "likely pathogenic", "gene-specific specification", "strongest curated record"],
        reclass: ["amended", "VUS → likely benign", "new population frequency", "variant unchanged", "notify + version report"],
      };
      const f = fixtures[record];
      parts.visual.replaceChildren(
        matrixBoard(el, ["Review status", "Label", "Evidence / change", "Action"], [
          { label: f[0], values: f.slice(1), tones: record === "panel" ? ["active", "active", "active", "active"] : record === "reclass" ? ["signal", "active", "active", "warning"] : ["warning", "warning", "muted", "warning"] },
        ], "ClinVar record read as evidence rather than label"),
        claimBoundary(el, "submitted assertion with review metadata", "timeless truth", "A report is a snapshot. Re-evaluation and a callback path are part of the clinical system, not optional clerical work.")
      );
      parts.controls.replaceChildren(el("div", { class: "lab-control-block" }, [
        el("span", { class: "lab-control-label", text: "Record to inspect" }),
        choiceRow(el, [
          { label: "Old single submitter", value: "old" },
          { label: "Conflict", value: "conflict" },
          { label: "Expert panel", value: "panel" },
          { label: "Reclassification", value: "reclass" },
        ], record, (value) => { record = value; render(); }, "ClinVar record scenario"),
      ]));
      parts.rail.replaceChildren(causalRail(el, [
        { key: "submission", value: f[1] },
        { key: "assertion", value: f[2] },
        { key: "support", value: f[3] },
        { key: "responsibility", value: f[4] },
      ]));
      parts.explanation.innerHTML = "<strong>ClinVar is an archive of assertions, not a truth set.</strong> Star status, submitter, criteria, evidence and date determine how much to rely on a label. Most VUS reclassifications move toward benign as population databases grow; that asymmetry never licenses action on today's VUS.";
    }

    function render() {
      parts.tabHost.replaceChildren(tabs(el, modeChoices, mode, (value) => { mode = value; render(); }));
      if (mode === "tier") renderTier();
      else if (mode === "evidence") renderEvidence();
      else if (mode === "posterior") renderPosterior();
      else if (mode === "frequency") renderFrequency();
      else if (mode === "predictor") renderPredictor();
      else if (mode === "assay") renderAssay();
      else if (mode === "family") renderFamily();
      else renderRecord();
    }

    predict(body, {
      widget: "clinical-evidence-classifier",
      question: "Three missense predictors agree that a novel variant is damaging, but they use overlapping conservation features. How many independent evidence observations is that?",
      hint: "Naive Bayes can multiply only conditionally independent evidence.",
      options: [
        { label: "Three strong observations" },
        { label: "One calibrated observation", correct: true },
        { label: "A pathogenic classification" },
        { label: "No need for disease context" },
      ],
    }, () => {
      mode = "predictor";
      predictorCount = 3;
      parts.instrument.hidden = false;
      render();
    });
    finishLab(parts, body);
  });

  /* Chapter 56 — cancer genomics -------------------------------------- */

  define("cancer-evolution-lab", makeObjectiveMap("ch56", [
    "Evolution mode maps mutation, selection, drift, effective population size, and clonal inheritance onto a growing tissue population.",
    "Driver mode makes local background-rate misspecification more significant with cohort size and contrasts recurrence with internal controls.",
    "Pattern and two-hit modes read gain- versus loss-of-function selection from lollipops and derive one- versus two-event age-incidence shapes.",
    "Origin mode compares tumour and blood allele fractions without pretending tumour-only sequencing can resolve germline, somatic, and clonal-haematopoietic origins.",
    "Signature mode mixes non-negative mutation profiles and keeps a process inference short of proof of a named exposure.",
    "Clone mode converts VAF to cancer-cell fraction using purity, copy number, and multiplicity, then evolves pre-existing resistance under treatment.",
    "Treatment mode separates established biomarker-directed care from prognostic, assay-dependent, and investigational genomic uses.",
  ]), function (api) {
    const { body, el, predict } = api;
    const parts = labParts(el);
    let mode = "clone";
    let generation = 8;
    let backgroundRatio = 3;
    let recurrenceSamples = 1000;
    let genePattern = "oncogene";
    let eventModel = "sporadic";
    let originScenario = "somatic";
    let signatureFirst = "age";
    let signatureSecond = "tobacco";
    let signatureMix = 0.35;
    let purity = 0.65;
    let vaf = 0.18;
    let tumourCopyNumber = 2;
    let multiplicity = 1;
    let cycles = 0;
    let initialResistance = 0.01;
    let treatmentScenario = "targeted";

    const modeChoices = [
      { label: "Cell evolution", value: "evolution" },
      { label: "False driver", value: "driver" },
      { label: "Mutation pattern", value: "pattern" },
      { label: "Two hits", value: "twohit" },
      { label: "Variant origin", value: "origin" },
      { label: "Signatures", value: "signature" },
      { label: "CCF + resistance", value: "clone" },
      { label: "Genome → treatment", value: "treatment" },
    ];

    function renderEvolution() {
      const resistant = cancerModel({ kind: "resistance", initialResistant: 0.02, cycles: generation, sensitiveFitness: 0.05, resistantFitness: 0.18 });
      parts.visual.replaceChildren(
        branchBoard(el, "founding clone", [
          { label: "neutral passengers", value: compact(Math.pow(2, generation) * 0.55, 0) + " cells", tone: "muted" },
          { label: "selected driver clone", value: compact(Math.pow(2, generation) * resistant.resistantFraction, 0) + " cells", tone: "active" },
          { label: "lost lineages", value: "drift / competition", tone: "warning" },
        ], "A tumour as a branching somatic population"),
        matrixBoard(el, ["Tumour analogue", "Consequence"], [
          { label: "mutation", values: ["replication error / repair defect", "new heritable cell state"] },
          { label: "selection", values: ["division or survival advantage", "clone expands"] },
          { label: "drift + Ne", values: ["stem-cell niche / bottleneck", "lineages vanish by chance"] },
          { label: "linkage", values: ["no meiotic reshuffling", "passengers remain linked within a clone"] },
        ], "Evolutionary forces inside one body")
      );
      parts.controls.replaceChildren(rangeControl(el, "Cell generations", generation, { min: 1, max: 20, step: 1, format: (value) => value.toFixed(0) },
        (value) => { generation = value; render(); }));
      parts.rail.replaceChildren(causalRail(el, [
        { key: "variation", value: "somatic mutation + epigenetic state" },
        { key: "inheritance", value: "clonal, no recombination" },
        { key: "selection", value: "local cell fitness" },
        { key: "genome", value: "drivers + hitchhiking passengers" },
      ]));
      parts.explanation.innerHTML = "<strong>A tumour is a population, and its genome is a fossil record of that population.</strong> Mitotic lineages lack the routine meiotic recombination that reshuffles organismal populations, so passengers hitchhike with winning clones; copy-number change, gene conversion, and mitotic recombination can still restructure a cancer genome. Hallmarks are phenotypic solutions selection reaches, not a mutation checklist.";
    }

    function renderDriver() {
      const result = cancerModel({ kind: "recurrence", baseRate: 2e-6, length: 100000, samples: recurrenceSamples, rateRatio: backgroundRatio });
      parts.visual.replaceChildren(
        barBoard(el, [
          { label: "naive expected mutations", value: result.expected, display: compact(result.expected, 0), tone: "signal" },
          { label: "observed at true local rate", value: result.observed, display: compact(result.observed, 0), tone: "warning" },
        ], "Long-gene recurrence under a misspecified background", Math.max(result.observed, 1)),
        statusStrip(el, [
          { label: "rate misspecification", value: backgroundRatio.toFixed(1) + "×" },
          { label: "naive z", value: result.z.toFixed(1), tone: Math.abs(result.z) > 4.6 ? "warning" : "active" },
          { label: "more samples", value: "z grows as √N", tone: "warning" },
          { label: "fix", value: "local covariates or somatic dN/dS" },
        ], "False-driver significance")
      );
      parts.controls.replaceChildren(
        rangeControl(el, "Cohort size", recurrenceSamples, { min: 10, max: 5000, step: 10, format: (value) => compact(value, 0) },
          (value) => { recurrenceSamples = value; render(); }),
        rangeControl(el, "True / assumed local rate", backgroundRatio, { min: 0.5, max: 5, step: 0.1, format: (value) => value.toFixed(1) + "×" },
          (value) => { backgroundRatio = value; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "late replication / closed chromatin", value: "local μ differs" },
        { key: "naive constant μ", value: "wrong expectation" },
        { key: "larger cohort", value: "bias beats noise" },
        { key: "valid control", value: "context model or synonymous sites" },
      ]));
      parts.explanation.innerHTML = "<strong>A larger cohort makes a background-model error more significant.</strong> Length, replication timing, expression, chromatin, sequence context, patient burden, and mutation spectrum are load-bearing. Somatic dN/dS uses synonymous mutations in the same gene as an internal control for much of that structure.";
    }

    function renderPattern() {
      const fixtures = {
        oncogene: [
          { label: "codon 12", short: "G12", value: 0.95, display: "hotspot", tone: "active" },
          { label: "codon 13", short: "G13", value: 0.72, display: "hotspot", tone: "active" },
          { label: "codon 61", short: "Q61", value: 0.55, display: "hotspot", tone: "active" },
          { label: "other", short: "other", value: 0.05, display: "few", tone: "muted" },
        ],
        suppressor: [
          { label: "early truncation", short: "✕", value: 0.55, display: "stop", tone: "warning" },
          { label: "frameshift", short: "✕", value: 0.62, display: "frame", tone: "warning" },
          { label: "splice", short: "✕", value: 0.48, display: "splice", tone: "warning" },
          { label: "deletion", short: "del", value: 0.70, display: "loss", tone: "warning" },
        ],
        tp53: [
          { label: "R175", short: "R175", value: 0.86, display: "hotspot", tone: "warning" },
          { label: "R248", short: "R248", value: 0.98, display: "hotspot", tone: "warning" },
          { label: "R273", short: "R273", value: 0.90, display: "hotspot", tone: "warning" },
          { label: "truncation", short: "✕", value: 0.25, display: "also seen", tone: "muted" },
        ],
      };
      const variants = fixtures[genePattern];
      const reading = genePattern === "oncogene" ? "specific gain-of-function hotspots" : genePattern === "suppressor" ? "many routes to loss of function" : "suppressor with dominant-negative hotspot logic";
      parts.visual.replaceChildren(locusPlot(el, variants, "Mutation distribution across a cancer gene"),
        statusStrip(el, [
          { label: "pattern", value: reading, tone: "active" },
          { label: "cellular genetics", value: genePattern === "oncogene" ? "one activated allele can suffice" : "loss often needs biallelic inactivation" },
          { label: "pattern proves driver?", value: "no—selection evidence needed", tone: "warning" },
        ], "Mutation-pattern interpretation"));
      parts.controls.replaceChildren(el("div", { class: "lab-control-block" }, [
        el("span", { class: "lab-control-label", text: "Gene pattern" }),
        choiceRow(el, [
          { label: "KRAS-like", value: "oncogene" },
          { label: "Suppressor-like", value: "suppressor" },
          { label: "TP53 exception", value: "tp53" },
        ], genePattern, (value) => { genePattern = value; render(); }, "Cancer mutation pattern"),
      ]));
      parts.rail.replaceChildren(causalRail(el, [
        { key: "selective route", value: reading },
        { key: "sequence pattern", value: genePattern === "suppressor" ? "dispersed truncation" : "missense hotspots" },
        { key: "mechanism", value: genePattern === "oncogene" ? "gain" : genePattern === "suppressor" ? "loss" : "dominant-negative + loss" },
        { key: "validation", value: "background + recurrence + function" },
      ]));
      parts.explanation.innerHTML = "<strong>The lollipop shape is selected by mechanism.</strong> Few substitutions can create a new activity, while many can destroy one. TP53 warns against memorising labels: a tumour suppressor can form oncogene-like hotspots when mutant subunits poison a multimer.";
    }

    function renderTwoHit() {
      const events = eventModel === "hereditary" ? 1 : 2;
      const ages = [1, 2, 3, 4, 5];
      const values = ages.map((age) => cancerModel({ kind: "twoHit", age, events }).incidenceShape);
      parts.visual.replaceChildren(
        pointPlot(el, ages.map((age, index) => ({ label: "age " + age, x: age, y: values[index], short: String(age), tone: "active" })), {
          label: "Age-incidence shape for one versus two remaining rate-limiting events",
          xLabel: "age in susceptible window", yLabel: "relative age-specific incidence rate", xMin: 0, xMax: 6, yMin: 0, yMax: Math.max(...values) * 1.1,
        }),
        statusStrip(el, [
          { label: "form", value: eventModel },
          { label: "remaining somatic events", value: events },
          { label: "incidence shape", value: events === 1 ? "flat (t⁰)" : "linear (t¹)", tone: "active" },
          { label: "usual second hit", value: events === 1 ? "LOH of wild-type allele" : "two allelic losses" },
        ], "Knudson hazard derivation")
      );
      parts.controls.replaceChildren(el("div", { class: "lab-control-block" }, [
        el("span", { class: "lab-control-label", text: "Retinoblastoma form" }),
        choiceRow(el, [{ label: "Hereditary", value: "hereditary" }, { label: "Sporadic", value: "sporadic" }], eventModel,
          (value) => { eventModel = value; render(); }, "Two-hit disease form"),
      ]));
      parts.rail.replaceChildren(causalRail(el, [
        { key: "inherited state", value: eventModel === "hereditary" ? "first RB1 hit in every cell" : "no RB1 hit" },
        { key: "events left", value: String(events) },
        { key: "incidence", value: "∝ t^" + (events - 1) },
        { key: "phenotype", value: eventModel === "hereditary" ? "early, often bilateral / multifocal" : "later, usually unilateral" },
      ]));
      parts.explanation.innerHTML = "<strong>A germline cancer variant is a head start, not a tumour.</strong> Hereditary cells still need the somatic loss of the remaining allele; LOH is efficient because losing an arm or recombining a chromosome is more probable than one specific second base change.";
    }

    function renderOrigin() {
      const fixtures = {
        germline: ["~50%", "~50%", "germline compatible", "confirm in non-tumour tissue; family implications"],
        somatic: ["~30%", "absent", "tumour somatic compatible", "interpret purity / CN / clone"],
        chip: ["absent in solid tumour", "5%", "clonal haematopoiesis compatible", "blood is not a clean normal"],
        ambiguous: ["~48%", "not sequenced", "unresolved", "tumour-only cannot decide"],
      };
      const f = fixtures[originScenario];
      parts.visual.replaceChildren(matrixBoard(el, ["Tumour VAF", "Blood VAF", "Origin reading", "Required action"], [
        { label: "variant", values: f, tones: originScenario === "ambiguous" ? ["warning", "warning", "warning", "active"] : ["active", "active", "active", "active"] },
      ], "Tumour and matched-normal origin evidence"), claimBoundary(el, "allele fractions in sampled tissues", "heritable status from tumour alone", "Purity, copy number, clonal fraction, blood clones, and mosaicism create overlapping VAFs; origin is a paired-tissue inference."));
      parts.controls.replaceChildren(el("div", { class: "lab-control-block" }, [
        el("span", { class: "lab-control-label", text: "Observed pattern" }),
        choiceRow(el, [
          { label: "Both tissues ~50%", value: "germline" },
          { label: "Tumour only", value: "somatic" },
          { label: "Blood low VAF", value: "chip" },
          { label: "Tumour only assay", value: "ambiguous" },
        ], originScenario, (value) => { originScenario = value; render(); }, "Cancer variant-origin pattern"),
      ]));
      parts.rail.replaceChildren(causalRail(el, [
        { key: "tumour", value: f[0] },
        { key: "matched blood", value: f[1] },
        { key: "origin", value: f[2] },
        { key: "implication", value: f[3] },
      ]));
      parts.explanation.innerHTML = "<strong>VAF ranges overlap.</strong> A germline variant concerns the patient and relatives; a somatic one concerns the tumour; a blood clone can contaminate the matched normal or plasma. The word “compatible” matters until tissue origin is confirmed.";
    }

    function renderSignature() {
      const result = cancerModel({ kind: "signature", first: signatureFirst, second: signatureSecond, mixture: signatureMix });
      const classes = ["C>A", "C>G", "C>T", "T>A", "T>C", "T>G"];
      parts.visual.replaceChildren(
        barBoard(el, result.profile.map((value, index) => ({ label: classes[index], value, display: percent(value, 1), tone: index === result.profile.indexOf(Math.max(...result.profile)) ? "active" : "signal" })),
          "Six-class projection of a 96-channel non-negative signature mixture", 1),
        statusStrip(el, [
          { label: signatureFirst, value: percent(signatureMix, 0), tone: "active" },
          { label: signatureSecond, value: percent(1 - signatureMix, 0), tone: "signal" },
          { label: "negative mixture weights", value: "forbidden" },
          { label: "named exposure proven?", value: "no", tone: "warning" },
        ], "Mutational-process mixture")
      );
      parts.controls.replaceChildren(
        el("div", { class: "lab-control-block" }, [el("span", { class: "lab-control-label", text: "First process" }),
          choiceRow(el, [{ label: "Age / CpG", value: "age" }, { label: "Tobacco", value: "tobacco" }, { label: "UV", value: "uv" }, { label: "APOBEC", value: "apobec" }], signatureFirst,
            (value) => { signatureFirst = value; render(); }, "First mutation process")]),
        el("div", { class: "lab-control-block" }, [el("span", { class: "lab-control-label", text: "Second process" }),
          choiceRow(el, [{ label: "Age / CpG", value: "age" }, { label: "Tobacco", value: "tobacco" }, { label: "UV", value: "uv" }, { label: "APOBEC", value: "apobec" }], signatureSecond,
            (value) => { signatureSecond = value; render(); }, "Second mutation process")]),
        rangeControl(el, "First-process exposure", signatureMix, { min: 0, max: 1, step: 0.05, format: (value) => percent(value, 0) },
          (value) => { signatureMix = value; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "somatic mutations", value: "96-context counts" },
        { key: "non-negative factorisation", value: "profiles × exposures" },
        { key: "collapsed teaching view", value: "six substitution classes" },
        { key: "inference", value: "process evidence; cross-check context + strand bias" },
      ]));
      parts.explanation.innerHTML = "<strong>The graphic deliberately collapses 96 channels to six substitution classes; real attribution must use the full trinucleotide spectrum.</strong> Non-negativity is physical, but correlated signatures, low mutation counts, unrestricted catalogues, and an unstable choice of K make decompositions non-unique. A process profile is not proof of a named exposure.";
    }

    function renderClone() {
      const ccf = cancerModel({ kind: "ccf", purity, vaf, tumourCopyNumber, normalCopyNumber: 2, multiplicity });
      const resistance = cancerModel({ kind: "resistance", initialResistant: initialResistance, cycles, sensitiveFitness: -0.35, resistantFitness: 0.08 });
      parts.visual.replaceChildren(
        branchBoard(el, "founding tumour", [
          { label: "sensitive lineage", value: percent(resistance.sensitiveFraction, 1), tone: "signal" },
          { label: "pre-existing resistant lineage", value: percent(resistance.resistantFraction, 1), tone: "warning" },
        ], "Treatment selects between pre-existing tumour lineages"),
        statusStrip(el, [
          { label: "observed VAF", value: percent(vaf, 1) },
          { label: "purity", value: percent(purity, 0) },
          { label: "local tumour CN / mutant copies", value: tumourCopyNumber.toFixed(0) + " / " + multiplicity.toFixed(0) },
          { label: "inferred CCF", value: percent(ccf.ccf, 1), tone: ccf.ccf > 1.02 ? "warning" : "active" },
        ], "Variant allele fraction converted to cancer-cell fraction")
      );
      parts.controls.replaceChildren(
        rangeControl(el, "Tumour purity ρ", purity, { min: 0.15, max: 1, step: 0.05, format: (value) => percent(value, 0) },
          (value) => { purity = value; render(); }),
        rangeControl(el, "Observed VAF", vaf, { min: 0.01, max: 0.95, step: 0.01, format: (value) => percent(value, 0) },
          (value) => { vaf = value; render(); }),
        rangeControl(el, "Local tumour copy number", tumourCopyNumber, { min: 1, max: 6, step: 1, format: (value) => value.toFixed(0) },
          (value) => { tumourCopyNumber = value; if (multiplicity > value) multiplicity = value; render(); }),
        rangeControl(el, "Mutant multiplicity m", multiplicity, { min: 1, max: tumourCopyNumber, step: 1, format: (value) => value.toFixed(0) },
          (value) => { multiplicity = value; render(); }),
        rangeControl(el, "Treatment cycles", cycles, { min: 0, max: 24, step: 1, format: (value) => value.toFixed(0) },
          (value) => { cycles = value; render(); }),
        rangeControl(el, "Resistant fraction before treatment", initialResistance, { min: 0.001, max: 0.10, step: 0.001, format: (value) => percent(value, 1) },
          (value) => { initialResistance = value; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "mixture", value: "normal + tumour + subclones" },
        { key: "VAF correction", value: "purity + CN + multiplicity" },
        { key: "CCF", value: percent(ccf.ccf, 1) },
        { key: "drug", value: "changes relative fitness; resistant clone sweeps" },
      ]));
      parts.explanation.innerHTML = ccf.ccf > 1.02
        ? "<strong>An inferred CCF above 100% is a diagnostic, not a super-clone.</strong> The assumed purity, copy number, multiplicity, or VAF is inconsistent; revise the local copy-number state before building a phylogeny."
        : "<strong>VAF is an assay mixture; CCF is the evolutionary quantity.</strong> Treatment does not need to induce resistance: changing fitness can expand a rare pre-existing lineage. Multiple independent resistance routes in one patient are the signature of selection on standing variation.";
    }

    function renderTreatment() {
      const fixtures = {
        targeted: ["activating driver / fusion", "matched inhibitor in validated tumour context", "established for defined biomarkers", "same variant can behave differently by tissue"],
        hrd: ["biallelic HR defect / HRD evidence", "PARP synthetic lethality", "established in defined indications", "scar can persist after HR restoration"],
        immune: ["MSI-H / dMMR; some TMB-high", "neoantigen load + checkpoint release", "established but assay/context dependent", "10 mut/Mb is regulatory, not biological"],
        ctdna: ["tumour-derived plasma molecules", "genotype / resistance / MRD", "maturity depends on use", "negative can mean low shedding"],
        adaptive: ["pre-existing resistant cells", "preserve sensitive competition", "investigational", "do not present as standard care"],
      };
      const f = fixtures[treatmentScenario];
      parts.visual.replaceChildren(processBoard(el, [
        { label: "biomarker", value: f[0], tone: "active" },
        { label: "mechanism", value: f[1] },
        { label: "evidence maturity", value: f[2], tone: f[2] === "investigational" ? "warning" : "active" },
        { label: "claim boundary", value: f[3], tone: "warning" },
      ], "Genomic biomarker to treatment decision"));
      parts.controls.replaceChildren(el("div", { class: "lab-control-block" }, [
        el("span", { class: "lab-control-label", text: "Clinical use" }),
        choiceRow(el, [
          { label: "Targeted driver", value: "targeted" },
          { label: "HRD / PARP", value: "hrd" },
          { label: "MSI / TMB", value: "immune" },
          { label: "ctDNA", value: "ctdna" },
          { label: "Adaptive therapy", value: "adaptive" },
        ], treatmentScenario, (value) => { treatmentScenario = value; render(); }, "Cancer genomic clinical use"),
      ]));
      parts.rail.replaceChildren(causalRail(el, [
        { key: "measurement", value: f[0] },
        { key: "biological link", value: f[1] },
        { key: "clinical evidence", value: f[2] },
        { key: "boundary", value: f[3] },
      ]));
      parts.explanation.innerHTML = "<strong>Genotype-to-therapy is not a lookup table.</strong> Allele, clonality, tissue feedback, assay definition, prior therapy, and evidence maturity all matter. A positive plasma driver can be actionable; a negative plasma assay may only mean the tumour did not shed enough DNA.";
    }

    function render() {
      parts.tabHost.replaceChildren(tabs(el, modeChoices, mode, (value) => { mode = value; render(); }));
      if (mode === "evolution") renderEvolution();
      else if (mode === "driver") renderDriver();
      else if (mode === "pattern") renderPattern();
      else if (mode === "twohit") renderTwoHit();
      else if (mode === "origin") renderOrigin();
      else if (mode === "signature") renderSignature();
      else if (mode === "clone") renderClone();
      else renderTreatment();
    }

    predict(body, {
      widget: "cancer-evolution-lab",
      question: "A mutation has VAF 18% in a 65%-pure tumour. Can you call it present in 36% of cancer cells by doubling VAF?",
      hint: "The denominator includes normal cells and local tumour copy number; mutant multiplicity can also exceed one.",
      options: [
        { label: "Yes, CCF is always 2 × VAF" },
        { label: "No—purity, copy number and multiplicity are required", correct: true },
        { label: "Yes, if it is a driver" },
        { label: "No—VAF contains no clonal information" },
      ],
    }, () => {
      mode = "clone";
      parts.instrument.hidden = false;
      render();
    });
    finishLab(parts, body);
  });

  /* Chapter 57 — genomics in practice --------------------------------- */

  define("genomics-practice-lab", makeObjectiveMap("ch57", [
    "Diagnosis and screening modes trace a rare-disease workflow and compute PPV from prevalence, sensitivity, and specificity for a placental cfDNA screen.",
    "Pharmacogenomics mode connects five established gene-drug mechanisms to phenotype, workflow timing, representation, and action boundaries.",
    "Outbreak mode turns sequence distance into a phylogenetic constraint while keeping unsampled intermediates and within-host diversity outside a transmission claim.",
    "Breeding mode holds the weighted-dosage estimator constant and changes the matched design features that make genomic selection effective.",
    "Forensic mode multiplies prior odds by a likelihood ratio and prevents a random-match probability from becoming a posterior probability of guilt.",
    "Trace mode recognises ancient-DNA end damage and makes compositional microbiome changes compatible with no absolute change in a taxon.",
    "Consumer mode limits an array result to assayed common probes and makes ancestry percentages conditional on a reference panel and time depth.",
  ]), function (api) {
    const { body, el, predict } = api;
    const parts = labParts(el);
    let mode = "screen";
    let diagnosisStage = "genome";
    let prevalence = 0.001;
    let sensitivity = 0.997;
    let specificity = 0.9996;
    let pgxPair = "clopidogrel";
    let outbreak = "ambiguous";
    let practiceDesign = "human";
    let forensicPrior = 0.000001;
    let forensicLr = 100000;
    let trace = "composition";
    let aAfter = 200;
    let consumerPanel = "founder";

    const modeChoices = [
      { label: "Diagnostic path", value: "diagnosis" },
      { label: "Screen arithmetic", value: "screen" },
      { label: "Gene + drug", value: "pgx" },
      { label: "Outbreak tree", value: "outbreak" },
      { label: "Breeding design", value: "breeding" },
      { label: "Forensic LR", value: "forensic" },
      { label: "Ancient + microbiome", value: "trace" },
      { label: "Consumer array", value: "consumer" },
    ];

    function renderDiagnosis() {
      const stages = {
        phenotype: ["HPO terms + pedigree", "test not chosen", "prior sharpened", "phenotyping can change the candidate set"],
        exome: ["coding capture", "~23–35% cohort-scale yield", "misses repeat / regulatory / some SV", "negative is timestamped"],
        genome: ["more uniform whole genome", "modest yield gain over exome", "interpretation remains bottleneck", "reanalysis adds diagnoses"],
        rapid: ["trio genome + fast analysis", "hours to days", "critical infant decision", "speed changes utility, not variant evidence"],
      };
      const f = stages[diagnosisStage];
      parts.visual.replaceChildren(processBoard(el, [
        { label: "deep phenotype", value: "HPO + inheritance" },
        { label: "assay", value: f[0], tone: "active" },
        { label: "filter + classify", value: f[1] },
        { label: "current boundary", value: f[2], tone: "warning" },
        { label: "next iteration", value: f[3], tone: "active" },
      ], "Rare-disease case from phenotype to report"));
      parts.controls.replaceChildren(el("div", { class: "lab-control-block" }, [
        el("span", { class: "lab-control-label", text: "Workflow view" }),
        choiceRow(el, [
          { label: "Phenotype first", value: "phenotype" },
          { label: "Exome", value: "exome" },
          { label: "Genome", value: "genome" },
          { label: "Rapid trio", value: "rapid" },
        ], diagnosisStage, (value) => { diagnosisStage = value; render(); }, "Rare-disease diagnostic stage"),
      ]));
      parts.rail.replaceChildren(causalRail(el, [
        { key: "prior", value: "phenotype + pedigree" },
        { key: "measurement", value: f[0] },
        { key: "evidence", value: "frequency + consequence + segregation + gene fit" },
        { key: "report", value: f[2] },
      ]));
      parts.explanation.innerHTML = "<strong>A negative result means no causal variant was identified with this assay, coverage, pipeline, knowledge and date.</strong> Genome sequencing expands observation, but repeats, mosaicism, epigenetic causes, tissue-specific effects and novel genes keep interpretation—not raw base count—as the limiting step.";
    }

    function renderScreen() {
      const result = practiceModel({ kind: "ppv", prevalence, sensitivity, specificity });
      const positiveScale = 100;
      const trueAmongPositive = Math.round(result.ppv * positiveScale);
      parts.visual.replaceChildren(
        probabilityGrid(el, trueAmongPositive, positiveScale - trueAmongPositive, positiveScale, "Expected composition of one hundred positive screening results"),
        statusStrip(el, [
          { label: "prevalence", value: "1 in " + compact(1 / Math.max(prevalence, 1e-12), 0) },
          { label: "sensitivity", value: percent(sensitivity, 2) },
          { label: "specificity", value: percent(specificity, 3) },
          { label: "PPV", value: percent(result.ppv, 1), tone: "active" },
          { label: "tissue measured", value: "placental cfDNA", tone: "warning" },
        ], "Screen-positive posterior probability")
      );
      parts.controls.replaceChildren(
        rangeControl(el, "Condition prevalence", prevalence, { min: 0.0001, max: 0.02, step: 0.0001, format: (value) => "1 in " + compact(1 / value, 0) },
          (value) => { prevalence = value; render(); }),
        rangeControl(el, "Sensitivity", sensitivity, { min: 0.90, max: 1, step: 0.001, format: (value) => percent(value, 1) },
          (value) => { sensitivity = value; render(); }),
        rangeControl(el, "Specificity", specificity, { min: 0.98, max: 1, step: 0.0001, format: (value) => percent(value, 2) },
          (value) => { specificity = value; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "prior", value: percent(prevalence, 3) },
        { key: "test", value: "sensitivity / specificity" },
        { key: "positive result", value: "mixes true + false positives" },
        { key: "posterior PPV", value: percent(result.ppv, 1) },
      ]));
      parts.explanation.innerHTML = "<strong>A screen measures placental fragments and changes a probability; it does not diagnose the fetus.</strong> Confined placental mosaicism can be a technically correct measurement of the wrong tissue. Confirm an irreversible decision with a diagnostic sample.";
    }

    function renderPgx() {
      const pairs = {
        clopidogrel: ["CYP2C19", "clopidogrel", "loss-of-function reduces active metabolite", "poor response after PCI", "alternative antiplatelet in defined contexts"],
        abacavir: ["HLA-B*57:01", "abacavir", "drug peptide presentation triggers hypersensitivity", "potential severe reaction", "avoid if allele positive"],
        thiopurine: ["TPMT / NUDT15", "thiopurines", "reduced inactivation raises toxic metabolites", "myelosuppression", "reduce dose / alternative"],
        dpyd: ["DPYD", "fluoropyrimidines", "reduced catabolism increases exposure", "severe toxicity", "pre-emptive dose adjustment"],
        codeine: ["CYP2D6", "codeine", "conversion to morphine varies by phenotype", "inefficacy or toxicity", "avoid extreme phenotypes"],
      };
      const f = pairs[pgxPair];
      parts.visual.replaceChildren(processBoard(el, [
        { label: "genotype", value: f[0], tone: "active" },
        { label: "drug", value: f[1] },
        { label: "mechanism", value: f[2] },
        { label: "clinical consequence", value: f[3], tone: "warning" },
        { label: "action", value: f[4], tone: "active" },
      ], "Established pharmacogenomic gene–drug mechanism"),
      claimBoundary(el, "genotype-informed baseline phenotype", "current enzyme activity under all co-medications", "Inhibitors, inducers, organ function, adherence, ancestry-biased panels, timing, and EHR delivery can change the phenotype or prevent action."));
      parts.controls.replaceChildren(el("div", { class: "lab-control-block" }, [
        el("span", { class: "lab-control-label", text: "Gene–drug pair" }),
        choiceRow(el, [
          { label: "CYP2C19", value: "clopidogrel" },
          { label: "HLA-B*57:01", value: "abacavir" },
          { label: "TPMT / NUDT15", value: "thiopurine" },
          { label: "DPYD", value: "dpyd" },
          { label: "CYP2D6", value: "codeine" },
        ], pgxPair, (value) => { pgxPair = value; render(); }, "Pharmacogenomic pair"),
      ]));
      parts.rail.replaceChildren(causalRail(el, [
        { key: "test timing", value: "before prescribing" },
        { key: "mechanism", value: f[2] },
        { key: "action", value: f[4] },
        { key: "implementation", value: "panel + EHR + reimbursement + clinician workflow" },
      ]));
      parts.explanation.innerHTML = "<strong>These mechanisms are strong; implementation failed when the result arrived after the prescription, omitted population-relevant alleles, or could not trigger a workflow action.</strong> Genotype is stable, but drug–drug phenoconversion means it is not the whole phenotype.";
    }

    function renderOutbreak() {
      const fixtures = {
        compatible: ["A and B differ by 0–1 substitutions", "same sampled cluster", "direct transmission compatible", "direction and intermediate unresolved"],
        ambiguous: ["A, B, C form a tight clade", "one unsampled case plausible", "shared outbreak source", "tree is not a contact chain"],
        excluded: ["A and B separated by many substitutions", "MRCA predates outbreak window", "direct link implausible", "epidemiology still defines exposure"],
      };
      const f = fixtures[outbreak];
      parts.visual.replaceChildren(
        branchBoard(el, "inferred common ancestor", [
          { label: "patient A", value: outbreak === "excluded" ? "distant branch" : "0–1 changes", tone: "active" },
          { label: "patient B", value: outbreak === "excluded" ? "many changes" : "0–1 changes", tone: outbreak === "excluded" ? "warning" : "active" },
          { label: "unsampled lineage", value: outbreak === "compatible" ? "possible" : "required / possible", tone: "muted" },
        ], "Pathogen phylogeny with an unsampled intermediate"),
        matrixBoard(el, ["Sequence observation", "Licensed inference", "Not licensed"], [
          { label: "case pair", values: [f[0], f[2], f[3]], tones: ["active", "active", "warning"] },
        ], "Outbreak inference boundary")
      );
      parts.controls.replaceChildren(el("div", { class: "lab-control-block" }, [
        el("span", { class: "lab-control-label", text: "Sequence pattern" }),
        choiceRow(el, [
          { label: "Compatible pair", value: "compatible" },
          { label: "Tight cluster", value: "ambiguous" },
          { label: "Link excluded", value: "excluded" },
        ], outbreak, (value) => { outbreak = value; render(); }, "Pathogen sequence pattern"),
      ]));
      parts.rail.replaceChildren(causalRail(el, [
        { key: "samples", value: "consensus pathogen genomes" },
        { key: "tree", value: f[1] },
        { key: "epidemiology", value: "dates + contacts + location" },
        { key: "claim", value: f[2] },
      ]));
      parts.explanation.innerHTML = "<strong>A pathogen tree constrains transmission hypotheses; it does not draw who infected whom.</strong> Within-host diversity, transmission bottlenecks, unsampled intermediates, sequencing error, and coalescence before transmission all break the identity.";
    }

    function renderBreeding() {
      const f = practiceDesign === "cattle"
        ? ["pedigreed close relatives", "repeated standardised records", "managed", "offspring mean", "rapid recurrent selection"]
        : ["mostly unrelated", "heterogeneous clinical labels", "uncontrolled", "one person's outcome", "no breeding loop"];
      parts.visual.replaceChildren(matrixBoard(el, ["Train ↔ target", "Phenotype", "Environment", "Target", "Feedback"], [
        { label: practiceDesign === "cattle" ? "genomic selection" : "clinical PRS", values: f, tones: practiceDesign === "cattle" ? ["active", "active", "active", "active", "active"] : ["warning", "warning", "warning", "warning", "muted"] },
      ], "Why one weighted-dosage predictor succeeds differently"));
      parts.controls.replaceChildren(el("div", { class: "lab-control-block" }, [el("span", { class: "lab-control-label", text: "Application" }),
        choiceRow(el, [{ label: "Human clinic", value: "human" }, { label: "Dairy herd", value: "cattle" }], practiceDesign,
          (value) => { practiceDesign = value; render(); }, "Prediction design comparison") ]));
      parts.rail.replaceChildren(causalRail(el, [
        { key: "same estimator", value: "Σ dosage × fitted weight" },
        { key: "design", value: f[0] },
        { key: "measurement", value: f[1] },
        { key: "outcome", value: practiceDesign === "cattle" ? "high-value breeding decision" : "limited incremental clinical utility" },
      ]));
      parts.explanation.innerHTML = "<strong>Genomic selection works because the experiment is engineered around prediction.</strong> Training and target match, phenotypes are repeated, relatives share LD, environments are managed, and the target is a breeding value averaged over many progeny—not because livestock genetics uses a different estimator.";
    }

    function renderForensic() {
      const result = practiceModel({ kind: "posteriorOdds", prior: forensicPrior, likelihoodRatio: forensicLr });
      parts.visual.replaceChildren(
        barBoard(el, [
          { label: "prior odds", value: Math.min(result.priorOdds, 1), display: compact(result.priorOdds, 3), tone: "signal" },
          { label: "evidence LR", value: Math.min(forensicLr / 1e6, 1), display: compact(forensicLr, 0), tone: "active" },
          { label: "posterior odds", value: Math.min(result.posteriorOdds, 1), display: compact(result.posteriorOdds, 3), tone: "warning" },
        ], "Prior odds multiplied by forensic likelihood ratio", 1),
        statusStrip(el, [
          { label: "prior source probability", value: percent(forensicPrior, 5) },
          { label: "LR", value: compact(forensicLr, 0) },
          { label: "posterior under two source hypotheses", value: percent(result.posterior, 2), tone: "active" },
          { label: "probability of guilt", value: "not computed", tone: "warning" },
        ], "Forensic conditional probabilities")
      );
      parts.controls.replaceChildren(
        rangeControl(el, "Prior source probability", forensicPrior, { min: 0.000001, max: 0.01, step: 0.000001, format: (value) => percent(value, 4) },
          (value) => { forensicPrior = value; render(); }),
        rangeControl(el, "DNA likelihood ratio", forensicLr, { min: 1, max: 1000000, step: 1000, format: (value) => compact(value, 0) },
          (value) => { forensicLr = value; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "propositions", value: "named prosecution and defence sources" },
        { key: "DNA evidence", value: "LR " + compact(forensicLr, 0) },
        { key: "case prior", value: "independent non-DNA evidence" },
        { key: "posterior", value: "source probability, not guilt" },
      ]));
      parts.explanation.innerHTML = "<strong>The prosecutor's fallacy swaps P(evidence | alternative source) for P(alternative source | evidence).</strong> The displayed posterior additionally assumes the two named source propositions are mutually exclusive and exhaustive and that the prior came from evidence independent of the DNA profile. Relatives, dropout, stutter, contributor count, and sampling frame belong inside those propositions; guilt includes evidence the DNA model never saw.";
    }

    function renderTrace() {
      if (trace === "ancient") {
        parts.visual.replaceChildren(
          locusPlot(el, [
            { label: "5′ terminal C→T", short: "end", value: 0.32, display: "32%", tone: "active" },
            { label: "position 2", short: "2", value: 0.18, display: "18%", tone: "signal" },
            { label: "position 5", short: "5", value: 0.05, display: "5%", tone: "muted" },
            { label: "interior", short: "inside", value: 0.01, display: "1%", tone: "muted" },
          ], "Ancient-DNA terminal deamination gradient"),
          claimBoundary(el, "short fragments plus terminal C-to-T and complementary G-to-A damage", "age or authenticity from one read", "Authentication combines damage, fragment length, contamination estimates, library blanks, and archaeological context.")
        );
        parts.controls.replaceChildren();
        parts.rail.replaceChildren(causalRail(el, [
          { key: "post-mortem decay", value: "fragmentation + cytosine deamination" },
          { key: "read ends", value: "C→T / G→A enrichment" },
          { key: "library", value: "aggregate gradient" },
          { key: "claim", value: "authentic ancient molecules, with controls" },
        ]));
        parts.explanation.innerHTML = "<strong>Damage is useful because it is positioned, not merely elevated.</strong> A terminal decay gradient authenticates a library when paired with short fragments and contamination controls; it is not a timestamp and can be reduced by library chemistry.";
        return;
      }
      const composition = practiceModel({ kind: "composition", aBefore: 100, bBefore: 100, aAfter, bAfter: 100 });
      parts.visual.replaceChildren(
        matrixBoard(el, ["Before count", "After count", "Before share", "After share"], [
          { label: "taxon A", values: [100, aAfter, percent(composition.aBeforeShare, 0), percent(composition.aAfterShare, 0)], tones: ["active", "active", "active", "active"] },
          { label: "taxon B", values: [100, 100, percent(composition.bBeforeShare, 0), percent(composition.bAfterShare, 0)], tones: ["signal", "signal", "signal", composition.bAfterShare < composition.bBeforeShare ? "warning" : "signal"] },
        ], "Absolute abundance and compositional relative abundance"),
        statusStrip(el, [
          { label: "B absolute change", value: "0" },
          { label: "B relative change", value: percent(composition.bAfterShare - composition.bBeforeShare, 0), tone: composition.bAfterShare < composition.bBeforeShare ? "warning" : "active" },
          { label: "causality from association", value: "not established" },
        ], "Compositional microbiome trap")
      );
      parts.controls.replaceChildren(
        el("div", { class: "lab-control-block" }, [el("span", { class: "lab-control-label", text: "Trace type" }),
          choiceRow(el, [{ label: "Microbiome composition", value: "composition" }, { label: "Ancient DNA", value: "ancient" }], trace,
            (value) => { trace = value; render(); }, "Trace-data mode")]),
        rangeControl(el, "Taxon A after count", aAfter, { min: 10, max: 500, step: 10, format: (value) => value.toFixed(0) },
          (value) => { aAfter = value; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "absolute molecules", value: "A " + aAfter + " / B 100" },
        { key: "fixed read budget", value: "renormalises to 100%" },
        { key: "reported abundance", value: "B " + percent(composition.bAfterShare, 0) },
        { key: "claim", value: "relative change can occur with B unchanged" },
      ]));
      parts.explanation.innerHTML = "<strong>Sequencing returns compositions unless total load is measured.</strong> A rise in one taxon forces every unchanged taxon's percentage down. Spike-ins, cell counts, qPCR or another absolute-load measurement are needed before interpreting relative abundance as growth or loss.";
    }

    function renderConsumer() {
      const fixtures = {
        founder: [3, 3000, "three founder variants", "negative excludes only those probes"],
        common: [600000, 10000000, "common tagging array", "good for common ancestry/IBD, poor for rare disease"],
        raw: [1, 1, "one raw-data call", "confirm analytically and interpret clinically"],
      };
      const f = fixtures[consumerPanel];
      const result = practiceModel({ kind: "consumer", assayedVariants: f[0], pathogenicVariants: f[1] });
      parts.visual.replaceChildren(
        barBoard(el, [
          { label: "variants directly assayed", value: result.coverageFraction, display: compact(f[0], 0), tone: "active" },
          { label: "relevant variants not assayed", value: 1 - result.coverageFraction, display: compact(result.missedVariants, 0), tone: "warning" },
        ], "Array coverage of the stated variant universe", 1),
        claimBoundary(el, f[2], "complete gene or condition", f[3] + ". An ancestry percentage is likewise an estimate against the company's chosen reference panel and time depth, so it can move when that panel changes.")
      );
      parts.controls.replaceChildren(el("div", { class: "lab-control-block" }, [
        el("span", { class: "lab-control-label", text: "Consumer result" }),
        choiceRow(el, [
          { label: "Founder panel", value: "founder" },
          { label: "Common array", value: "common" },
          { label: "Raw-data hit", value: "raw" },
        ], consumerPanel, (value) => { consumerPanel = value; render(); }, "Consumer-genomics result"),
      ]));
      parts.rail.replaceChildren(causalRail(el, [
        { key: "platform", value: "pre-selected array probes" },
        { key: "observed", value: f[2] },
        { key: "unobserved", value: compact(result.missedVariants, 0) + " other variants in fixture" },
        { key: "medical action", value: "accredited confirmation first" },
      ]));
      parts.explanation.innerHTML = "<strong>An array cannot see what was never placed on the chip, and rare singleton calls cluster poorly.</strong> Relative matching by long IBD segments is technically stronger than most health interpretation—and it can reveal relatives, parentage, adoption and donor conception to people who never tested.";
    }

    function render() {
      parts.tabHost.replaceChildren(tabs(el, modeChoices, mode, (value) => { mode = value; render(); }));
      if (mode === "diagnosis") renderDiagnosis();
      else if (mode === "screen") renderScreen();
      else if (mode === "pgx") renderPgx();
      else if (mode === "outbreak") renderOutbreak();
      else if (mode === "breeding") renderBreeding();
      else if (mode === "forensic") renderForensic();
      else if (mode === "trace") renderTrace();
      else renderConsumer();
    }

    predict(body, {
      widget: "genomics-practice-lab",
      question: "A prenatal cfDNA screen is 99.7% sensitive and 99.96% specific for a condition present in 1 in 1,000 pregnancies. Is a positive result a diagnosis?",
      hint: "Compare true positives from the rare condition with false positives from the much larger unaffected group.",
      options: [
        { label: "Yes—more than 99% accurate" },
        { label: "No—PPV is about 71%, so diagnostic confirmation is required", correct: true },
        { label: "No—the test measures only maternal DNA" },
        { label: "Yes—specificity determines PPV alone" },
      ],
    }, () => {
      mode = "screen";
      prevalence = 0.001;
      sensitivity = 0.997;
      specificity = 0.9996;
      parts.instrument.hidden = false;
      render();
    });
    finishLab(parts, body);
  });

  /* Chapter 58 — ethics, privacy, and society ------------------------- */

  define("genomic-ethics-simulator", makeObjectiveMap("ch58", [
    "Identity mode derives common-SNP uniqueness while relatives mode shows why findability depends on joins and on people who never uploaded data.",
    "Consent mode contrasts specific, broad, dynamic, and group governance and makes shared lineage, future use, withdrawal, and recontact structurally visible.",
    "Law mode names the exact scope gaps in US GINA and the UK insurance code while separating observed discrimination from the normative choice to pool risk.",
    "Ancestry mode separates continuous genetic ancestry from social race and pinpoints the invalid leap from within-group heritability to between-group cause.",
    "Equity mode traces biased recruitment into weaker frequency evidence, more VUS, poorer fine-mapping, and degraded score portability without changing biology.",
    "Protection mode compares controlled access, federation, differential privacy, and encrypted computation by what each protects and what identifying outputs retain.",
    "Reproduction and governance modes quantify within-family embryo-score limits and keep heritable editing, gene drives, dual use, defaults, retention, and jurisdictional gaps outside a technical accuracy score.",
  ]), function (api) {
    const { body, el, predict } = api;
    const parts = labParts(el);
    let mode = "relatives";
    let identityMaf = 0.2;
    let population = 8e9;
    let databaseCoverage = 0.02;
    let effectiveRelatives = 45;
    let protection = "controlled";
    let law = "gina";
    let consent = "broad";
    let ancestryClaim = "heritability";
    let equityScenario = "skewed";
    let embryos = 5;
    let withinFamilySd = 0.35;
    let governanceScenario = "editing";

    const modeChoices = [
      { label: "Identity", value: "identity" },
      { label: "Relatives", value: "relatives" },
      { label: "Privacy tools", value: "protection" },
      { label: "Law + insurance", value: "law" },
      { label: "Consent + groups", value: "consent" },
      { label: "Ancestry ≠ race", value: "ancestry" },
      { label: "Sampling → inequity", value: "equity" },
      { label: "Embryo selection", value: "reproduction" },
      { label: "Editing + governance", value: "governance" },
    ];

    function renderIdentity() {
      const result = ethicsModel({ kind: "uniqueness", maf: identityMaf, population });
      parts.visual.replaceChildren(
        barBoard(el, [
          { label: "match probability at one SNP", value: result.perSnpMatch, display: result.perSnpMatch.toFixed(3), tone: "signal" },
          { label: "after 10 independent SNPs", value: Math.pow(result.perSnpMatch, 10), display: Math.pow(result.perSnpMatch, 10).toExponential(2), tone: "active" },
          { label: "after " + result.snps + " SNPs", value: Math.pow(result.perSnpMatch, result.snps), display: Math.pow(result.perSnpMatch, result.snps).toExponential(2), tone: "warning" },
        ], "Independent common-SNP genotype match probability", 1),
        statusStrip(el, [
          { label: "MAF", value: percent(identityMaf, 0) },
          { label: "population", value: compact(population, 0) },
          { label: "SNPs for <1 expected unrelated match", value: result.snps, tone: "active" },
          { label: "name column required?", value: "no", tone: "warning" },
        ], "Genome uniqueness derivation")
      );
      parts.controls.replaceChildren(
        rangeControl(el, "Minor-allele frequency", identityMaf, { min: 0.05, max: 0.5, step: 0.01, format: (value) => percent(value, 0) },
          (value) => { identityMaf = value; render(); }),
        rangeControl(el, "Population size", population, { min: 1000000, max: 10000000000, step: 1000000, format: (value) => compact(value, 0) },
          (value) => { population = value; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "one genotype", value: "three-valued common marker" },
        { key: "independent markers", value: "match probabilities multiply" },
        { key: "expected other matches", value: compact(result.expectedOtherMatches, 3) + " after " + result.snps + " SNPs" },
        { key: "re-identification", value: "join to genealogy / records / known sample" },
      ]));
      parts.explanation.innerHTML = "<strong>Removing names removes only the join the custodian planned to use.</strong> This toy calculation assumes Hardy–Weinberg proportions, unrelated people, and independent SNPs; real linkage reduces the independent count, and identical twins are an exception to exact germline uniqueness. A genotype is nevertheless a persistent familial identifier, and identifiability is a property of the data plus the outside world.";
    }

    function renderRelatives() {
      const result = ethicsModel({ kind: "findability", coverage: databaseCoverage, effectiveRelatives });
      parts.visual.replaceChildren(
        probabilityGrid(el, Math.round(result.findability * 100), 0, 100, "Schematic share of a population findable through uploaded relatives"),
        statusStrip(el, [
          { label: "database coverage", value: percent(databaseCoverage, 1) },
          { label: "effective detectable relatives", value: effectiveRelatives },
          { label: "schematic findability", value: percent(result.findability, 1), tone: "warning" },
          { label: "non-uploaders consulted?", value: "no", tone: "warning" },
        ], "Relative-mediated findability")
      );
      parts.controls.replaceChildren(
        rangeControl(el, "Population in database", databaseCoverage, { min: 0.001, max: 0.20, step: 0.001, format: (value) => percent(value, 1) },
          (value) => { databaseCoverage = value; render(); }),
        rangeControl(el, "Effective detectable relatives N", effectiveRelatives, { min: 5, max: 250, step: 5, format: (value) => value.toFixed(0) },
          (value) => { effectiveRelatives = value; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "one upload", value: "long IBD segments" },
        { key: "pedigree", value: "links cousins and descendants" },
        { key: "public records", value: "close the identity" },
        { key: "exposure", value: "extends beyond consenting uploader" },
      ]));
      parts.explanation.innerHTML = "<strong>The equation 1 − (1 − c)<sup>N</sup> is a shape argument, not a calibrated forecast.</strong> Relatives are correlated and detectability declines with distance, so N is an effective parameter. The robust conclusion is structural: a small participating fraction can expose a much larger non-participating population.";
    }

    function renderProtection() {
      const fixtures = {
        controlled: ["controlled access", "who can enter; contracts + audit", "does not cryptographically prevent authorised misuse", "governance quality"],
        federated: ["federated analysis", "raw genotypes remain with custodian", "outputs and model weights", "output review"],
        dp: ["differential privacy", "bounds one participant's influence", "fine genomic utility under many correlated queries", "privacy budget + release design"],
        he: ["homomorphic encryption / MPC", "plaintext during compute", "identifying result", "minimise output"],
      };
      const f = fixtures[protection];
      parts.visual.replaceChildren(matrixBoard(el, ["Protects", "Does not protect", "Operative control"], [
        { label: f[0], values: [f[1], f[2], f[3]], tones: ["active", "warning", "active"] },
      ], "Technical and governance privacy mitigations"), claimBoundary(el, f[1], f[2], "Encryption protects a pipeline. If the released answer is a genotype, per-variant statistic, score, or relative match, the answer can still identify."));
      parts.controls.replaceChildren(el("div", { class: "lab-control-block" }, [
        el("span", { class: "lab-control-label", text: "Protection layer" }),
        choiceRow(el, [
          { label: "Controlled", value: "controlled" },
          { label: "Federated", value: "federated" },
          { label: "Differential privacy", value: "dp" },
          { label: "Encrypted compute", value: "he" },
        ], protection, (value) => { protection = value; render(); }, "Genomic privacy mechanism"),
      ]));
      parts.rail.replaceChildren(causalRail(el, [
        { key: "input", value: "shared identifying sequence" },
        { key: "protection", value: f[0] },
        { key: "residual", value: f[2] },
        { key: "design policy", value: "defaults · matching · retention · rate limits · output granularity" },
      ]));
      parts.explanation.innerHTML = "<strong>Governance is not a weak substitute for cryptography; for identifying outputs it is the layer where the problem exists.</strong> Relative matching, release granularity, defaults, deletion and retention windows often dominate the cipher suite.";
    }

    function renderLaw() {
      const fixtures = {
        gina: ["US GINA", "health-plan genetic information + employers with ≥15 workers", "life, disability and long-term care; current symptoms or diagnosis rely on other law; employers <15; US military", "federal statute"],
        uk: ["UK Code on Genetic Testing and Insurance", "predictive results generally not requested", "Huntington disease for life cover above £500,000", "government–industry agreement, not statute"],
        canada: ["Canada GNDA", "requiring a test or disclosure for goods, services or contracts", "written-consent use; treating-practitioner and participant-research exceptions", "criminal prohibitions upheld 10 July 2020 (2020 SCC 17)"],
        australia: ["Australia life-insurance reform", "requesting or using adverse genetic test results for life-insurance decisions", "volunteered favourable results; signs, symptoms and diagnosed disease remain usable", "Act passed; commences 8 October 2026"],
      };
      const f = fixtures[law];
      parts.visual.replaceChildren(matrixBoard(el, ["Covers", "Gap / exception", "Instrument"], [
        { label: f[0], values: [f[1], f[2], f[3]], tones: ["active", "warning", "muted"] },
      ], "Genetic-discrimination protection by jurisdiction"), claimBoundary(el, "legal scope", "whether risk should be pooled or individually priced", "Observed adverse decisions, fear-driven testing avoidance, actuarial selection, and fairness are different empirical and normative questions."));
      parts.controls.replaceChildren(el("div", { class: "lab-control-block" }, [
        el("span", { class: "lab-control-label", text: "Jurisdictional example" }),
        choiceRow(el, [
          { label: "US GINA", value: "gina" },
          { label: "UK code", value: "uk" },
          { label: "Canada", value: "canada" },
          { label: "Australia", value: "australia" },
        ], law, (value) => { law = value; render(); }, "Genetic discrimination law"),
      ]));
      parts.rail.replaceChildren(causalRail(el, [
        { key: "instrument", value: f[0] },
        { key: "protected", value: f[1] },
        { key: "gap", value: f[2] },
        { key: "design implication", value: "state scope and date; never say 'genetic discrimination is illegal'" },
      ]));
      parts.explanation.innerHTML = "<strong>Protection is specific, jurisdictional and dated.</strong> Low observed discrimination can coexist with high deterrence if people avoid clinically useful testing. Whether insurance should pool unchosen risk or sort it is a normative choice the incidence data cannot settle.";
    }

    function renderConsent() {
      const fixtures = {
        specific: ["one named study", "clear purpose", "future re-consent at scale", "individual"],
        broad: ["a governed domain of future use", "long-lived research", "trust shifts to access committee", "individual + governance"],
        dynamic: ["revisable granular preferences", "ongoing autonomy", "burden and engaged-user bias", "individual relationship"],
        group: ["community authority + benefit sharing", "collective harms and stewardship", "may restrict open reuse", "group / lineage"],
      };
      const f = fixtures[consent];
      parts.visual.replaceChildren(matrixBoard(el, ["Agreement", "Buys", "Cost", "Unit represented"], [
        { label: consent, values: f, tones: ["active", "active", "warning", "active"] },
      ], "Consent and genomic governance models"), claimBoundary(el, "permission by one participant", "permission from relatives, descendants, or a community", "Shared sequence, future unknown uses, group narratives, data custody changes, and reclassification updates require governance beyond one signature."));
      parts.controls.replaceChildren(el("div", { class: "lab-control-block" }, [
        el("span", { class: "lab-control-label", text: "Governance model" }),
        choiceRow(el, [
          { label: "Specific", value: "specific" },
          { label: "Broad", value: "broad" },
          { label: "Dynamic", value: "dynamic" },
          { label: "Community / CARE", value: "group" },
        ], consent, (value) => { consent = value; render(); }, "Consent model"),
      ]));
      parts.rail.replaceChildren(causalRail(el, [
        { key: "data lifetime", value: "longer than project / company / consent regime" },
        { key: "shared identity", value: "relatives + descendants" },
        { key: "model", value: consent },
        { key: "accountability", value: f[3] },
      ]));
      parts.explanation.innerHTML = "<strong>Broad consent is honestly consent to a governance process, not to a knowable list of future studies.</strong> Individual forms cannot represent group harms such as unwanted population narratives; FAIR reuse and CARE authority are complementary axes with a real trade-off.";
    }

    function renderAncestry() {
      const fixtures = {
        heritability: ["Trait is heritable within each group", "therefore mean difference is genetic", "fails", "within-group variance says nothing about between-group cause"],
        prs: ["Group PRS means differ", "therefore causal burden differs", "unresolved", "stratification, LD, frequency and portability bias the weights"],
        proxy: ["Race predicts a clinical outcome", "therefore insert race correction", "fails", "measure genotype, ancestry, exposure or access that race proxies"],
        ancestry: ["Local ancestry differs along a genome", "use it for LD / frequency priors", "valid when measured", "continuous genomic history, not social race"],
      };
      const f = fixtures[ancestryClaim];
      parts.visual.replaceChildren(processBoard(el, [
        { label: "observation", value: f[0] },
        { label: "proposed inference", value: f[1], tone: "warning" },
        { label: "verdict", value: f[2], tone: f[2] === "valid when measured" ? "active" : "warning" },
        { label: "exact reason", value: f[3], tone: "active" },
      ], "Ancestry and race inference audit"));
      parts.controls.replaceChildren(el("div", { class: "lab-control-block" }, [
        el("span", { class: "lab-control-label", text: "Claim to audit" }),
        choiceRow(el, [
          { label: "Heritability leap", value: "heritability" },
          { label: "PRS means", value: "prs" },
          { label: "Race proxy", value: "proxy" },
          { label: "Measured ancestry", value: "ancestry" },
        ], ancestryClaim, (value) => { ancestryClaim = value; render(); }, "Ancestry and race claim"),
      ]));
      parts.rail.replaceChildren(causalRail(el, [
        { key: "genetic ancestry", value: "continuous segment history with uncertainty" },
        { key: "race", value: "social category with real environmental effects" },
        { key: "audit", value: f[2] },
        { key: "repair", value: f[3] },
      ]));
      parts.explanation.innerHTML = "<strong>Race and ancestry can correlate and remain different variables.</strong> A within-group heritability estimate cannot allocate a between-group mean difference; groups were not randomised into environments. Race-as-proxy also hides the actual genotype, ancestry, exposure or access variable a clinical model needs.";
    }

    function renderEquity() {
      const fixtures = {
        skewed: ["one ancestry dominates recruitment", "thin population-frequency evidence elsewhere", "larger credible sets + more VUS", "tag-based scores lose accuracy", "benefit follows existing data wealth"],
        balanced: ["community-governed representative recruitment", "group-relevant frequencies + LD", "better fine-mapping + fewer avoidable VUS", "weights validated across ancestry gradients", "benefit and capacity shared"],
        extractive: ["samples exported without authority", "technical diversity improves", "trust + group harm worsen", "future recruitment damaged", "scientific gain does not erase governance failure"],
      };
      const f = fixtures[equityScenario];
      parts.visual.replaceChildren(processBoard(el, [
        { label: "sampling design", value: f[0], tone: equityScenario === "balanced" ? "active" : "warning" },
        { label: "reference evidence", value: f[1] },
        { label: "classification / fine-map", value: f[2] },
        { label: "prediction", value: f[3] },
        { label: "distribution", value: f[4], tone: equityScenario === "balanced" ? "active" : "warning" },
      ], "Sampling design propagated through genomic inference"));
      parts.controls.replaceChildren(el("div", { class: "lab-control-block" }, [
        el("span", { class: "lab-control-label", text: "Recruitment and governance" }),
        choiceRow(el, [
          { label: "Historically skewed", value: "skewed" },
          { label: "Representative + governed", value: "balanced" },
          { label: "Diverse but extractive", value: "extractive" },
        ], equityScenario, (value) => { equityScenario = value; render(); }, "Genomic sampling scenario"),
      ]));
      parts.rail.replaceChildren(causalRail(el, [
        { key: "who is sampled", value: f[0] },
        { key: "what models learn", value: f[1] },
        { key: "who gets uncertainty", value: f[2] },
        { key: "fix", value: "recruitment + governance + benefit sharing" },
      ]));
      parts.explanation.innerHTML = "<strong>Higher VUS rates and lower PRS accuracy in under-represented groups mean the evidence is thinner, not that their genomes are more ambiguous.</strong> Diversity without community authority can improve an LD matrix while repeating the extraction that made participation scarce.";
    }

    function renderReproduction() {
      const result = ethicsModel({ kind: "embryo", embryos, withinFamilySd });
      parts.visual.replaceChildren(
        locusPlot(el, Array.from({ length: embryos }, (_, index) => {
          const quantile = (index + 0.625) / (embryos + 0.25);
          const value = withinFamilySd * inverseNormal(quantile);
          const anchor = index === 0 || index === Math.floor((embryos - 1) / 2) || index === embryos - 1;
          return {
            label: "embryo " + (index + 1),
            short: "e" + (index + 1),
            value: value - (-1),
            display: (value >= 0 ? "+" : "") + value.toFixed(2) + " SD",
            tone: index === embryos - 1 ? "active" : "muted",
            showValue: embryos <= 5 || anchor,
            showLabel: embryos <= 5 || anchor,
          };
        }), "Illustrative ordered within-family polygenic scores"),
        statusStrip(el, [
          { label: "viable embryos", value: embryos },
          { label: "within-family SD", value: withinFamilySd.toFixed(2) },
          { label: "expected best-vs-random gain", value: result.expectedGain.toFixed(2) + " score SD", tone: "active" },
          { label: "causal outcome gain", value: "smaller / uncertain", tone: "warning" },
        ], "Within-family embryo-selection limit")
      );
      parts.controls.replaceChildren(
        rangeControl(el, "Viable embryos", embryos, { min: 2, max: 12, step: 1, format: (value) => value.toFixed(0) },
          (value) => { embryos = value; render(); }),
        rangeControl(el, "Within-family score SD", withinFamilySd, { min: 0.1, max: 0.7, step: 0.05, format: (value) => value.toFixed(2) },
          (value) => { withinFamilySd = value; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "same parents", value: "restricted Mendelian variance" },
        { key: "few embryos", value: String(embryos) },
        { key: "between-family weights", value: "include effects that shrink within siblings" },
        { key: "selection", value: "small gain + pleiotropic trade-offs" },
      ]));
      parts.explanation.innerHTML = "<strong>The displayed expected maximum uses a named normal order-statistic approximation, not a promise of trait improvement.</strong> Within-family variance is smaller, viable embryos are few, population weights include between-family components, portability remains, and selecting one score moves correlated traits.";
    }

    function renderGovernance() {
      const fixtures = {
        editing: ["heritable embryo edit", "one lineage and all descendants", "no descendant consent or withdrawal", "national prohibition faces medical tourism", "better precision does not create unmet need or reversibility"],
        drive: ["gene-drive organism", "ecosystem across borders", "affected communities and states", "reversal or recall cannot be assumed", "geographic consent for mobile inheritance"],
        dual: ["synthesis / sequence capability", "research benefit + misuse", "publishability and screening chokepoints", "benchtop synthesis erodes provider control", "institutional review + customer / sequence screening"],
        product: ["relative-matching feature", "customers + non-consenting kin", "default, retention, deletion, police access", "company ownership can change", "design choices are policy before law arrives"],
      };
      const f = fixtures[governanceScenario];
      parts.visual.replaceChildren(processBoard(el, [
        { label: "intervention", value: f[0], tone: "active" },
        { label: "affected unit", value: f[1] },
        { label: "consent boundary", value: f[2], tone: "warning" },
        { label: "pacing gap", value: f[3], tone: "warning" },
        { label: "governance test", value: f[4], tone: "active" },
      ], "Genomic technology consequence map"));
      parts.controls.replaceChildren(el("div", { class: "lab-control-block" }, [
        el("span", { class: "lab-control-label", text: "Governance case" }),
        choiceRow(el, [
          { label: "Heritable editing", value: "editing" },
          { label: "Gene drive", value: "drive" },
          { label: "Dual use", value: "dual" },
          { label: "Relative matching", value: "product" },
        ], governanceScenario, (value) => { governanceScenario = value; render(); }, "Genomic governance case"),
      ]));
      parts.rail.replaceChildren(causalRail(el, [
        { key: "technical capability", value: f[0] },
        { key: "externalities", value: f[1] },
        { key: "jurisdiction", value: f[3] },
        { key: "decision", value: f[4] },
      ]));
      parts.explanation.innerHTML = "<strong>Ethical objections do not collapse into one accuracy score.</strong> Irreversibility, who bears risk, who can consent, alternatives, jurisdiction, benefit sharing, defaults and misuse remain even after off-target rates improve. Competent people can weigh them differently; the simulator keeps the consequences explicit.";
    }

    function render() {
      parts.tabHost.replaceChildren(tabs(el, modeChoices, mode, (value) => { mode = value; render(); }));
      if (mode === "identity") renderIdentity();
      else if (mode === "relatives") renderRelatives();
      else if (mode === "protection") renderProtection();
      else if (mode === "law") renderLaw();
      else if (mode === "consent") renderConsent();
      else if (mode === "ancestry") renderAncestry();
      else if (mode === "equity") renderEquity();
      else if (mode === "reproduction") renderReproduction();
      else renderGovernance();
    }

    predict(body, {
      widget: "genomic-ethics-simulator",
      question: "A person never uploads DNA, but several third cousins do. Can the person's genome become findable through long shared segments?",
      hint: "Genomic privacy is shared across a pedigree, not held by one account.",
      options: [
        { label: "No—consent follows the sample owner" },
        { label: "Yes—relatives can index non-participants", correct: true },
        { label: "Only if names remain in the genotype file" },
        { label: "Encryption prevents the relationship" },
      ],
    }, () => {
      mode = "relatives";
      databaseCoverage = 0.02;
      effectiveRelatives = 45;
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
