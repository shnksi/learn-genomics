/* ── Advanced-statistics interaction wave ────────────────────────────────
   Objective-mapped Hero Labs for S5–S7. The visual grammar keeps four
   objects separate: data, fitted model, uncertainty, and licensed claim.
   Every numerical result is produced by a pure function so the scientific
   invariants can be tested without relying on the browser renderer.
   ───────────────────────────────────────────────────────────────────────── */

(function (global) {
  "use strict";

  const definitions = {};
  const models = {};
  const coverage = {};
  const kit = global.ReaderInteractionKit;
  if (!kit) throw new Error("ReaderInteractionKit must load before advanced-statistics labs");

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
      instrument: el("div", { class: "hero-lab human-lab advanced-stats-lab", hidden: true }),
      tabHost: el("div"),
      visual: el("div", { class: "lab-visual human-visual advanced-stats-visual" }),
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

  function pointPlot(el, points, options) {
    const plot = el("div", {
      class: "human-point-plot advanced-point-plot",
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
    if (options.fit) {
      const span = xMax - xMin;
      const rise = options.fit.slope * span;
      const angle = -Math.atan2(rise / Math.max(1e-12, yMax - yMin), 1) * 180 / Math.PI;
      field.append(el("i", {
        class: "advanced-fit-line",
        style: "--fit-angle:" + angle.toFixed(2) + "deg;--fit-bottom:" +
          clamp(100 * (options.fit.intercept + options.fit.slope * xMin - yMin) /
            Math.max(1e-12, yMax - yMin), 0, 100).toFixed(2) + "%",
      }));
    }
    points.forEach((point) => {
      const xFraction = (point.x - xMin) / Math.max(1e-12, xMax - xMin);
      const edgeClass = xFraction <= 0.1 ? " is-edge-left" : xFraction >= 0.9 ? " is-edge-right" : "";
      field.append(el("i", {
      class: "human-point is-" + (point.tone || "active") + edgeClass +
        (point.labelClass ? " " + point.labelClass : ""),
      style: "left:" + clamp(100 * xFraction, 2, 98).toFixed(2) +
        "%;bottom:" + clamp(100 * (point.y - yMin) / Math.max(1e-12, yMax - yMin), 1, 99).toFixed(2) + "%",
      }, [point.short ? el("span", { text: point.short }) : null].filter(Boolean)));
    });
    return plot;
  }

  function rankedPlot(el, points, options) {
    const maxX = Math.max(1, ...points.map((point) => point.x));
    const maxY = Math.max(1e-9, ...points.map((point) => point.y), options.maxY || 0);
    const plot = el("div", {
      class: "advanced-ranked-plot",
      role: "img",
      "aria-label": options.label + ". " + points.map((point) =>
        point.label + " " + compact(point.y, 4)
      ).join(". "),
    });
    plot.append(el("span", { class: "advanced-ranked-y", text: options.yLabel }));
    const field = el("div", { class: "advanced-ranked-field", "aria-hidden": "true" });
    if (options.reference) {
      field.append(el("i", {
        class: "advanced-ranked-reference",
        style: "bottom:" + clamp(100 * options.reference / maxY, 0, 100).toFixed(2) + "%",
      }));
    }
    points.forEach((point) => field.append(el("i", {
      class: "advanced-ranked-mark is-" + (point.tone || "active"),
      style: "left:" + clamp(100 * (point.x - 0.5) / maxX, 1, 99).toFixed(2) +
        "%;bottom:" + clamp(100 * point.y / maxY, 1, 99).toFixed(2) + "%",
    })));
    plot.append(field, el("span", { class: "advanced-ranked-x", text: options.xLabel }));
    return plot;
  }

  function claimBoundary(el, measured, excluded, boundary) {
    return el("div", {
      class: "methods-claim-shutter human-claim-shutter",
      role: "img",
      "aria-label": "Measured: " + measured + ". Not established: " + excluded + ". " + boundary,
    }, [
      el("div", { class: "methods-claim-half is-open" }, [
        el("span", { text: "licensed" }), el("strong", { text: measured }),
      ]),
      el("div", { class: "methods-claim-gate", "aria-hidden": "true", text: "≠" }),
      el("div", { class: "methods-claim-half is-closed" }, [
        el("span", { text: "not licensed" }), el("strong", { text: excluded }),
      ]),
      el("p", { text: boundary }),
    ]);
  }

  /* Pure models -------------------------------------------------------- */

  function varianceRegressionModel(input) {
    if (input.kind === "variance") {
      const varX = Math.max(0, input.varX);
      const varY = Math.max(0, input.varY);
      const covarianceBound = Math.sqrt(varX * varY);
      const covariance = clamp(input.covariance, -covarianceBound, covarianceBound);
      const crossTerm = 2 * covariance;
      return {
        varX, varY, covariance, covarianceBound, crossTerm,
        varianceSum: varX + varY + crossTerm,
        independentSum: varX + varY,
      };
    }
    if (input.kind === "dependence") {
      const fixture = input.fixture || "inverted";
      const values = fixture === "linear"
        ? [[-2, -2], [-1, -1], [0, 0], [1, 1], [2, 2]]
        : fixture === "inverted"
          ? [[-2, 0], [-1, 1], [0, 2], [1, 1], [2, 0]]
          : [[-2, 1], [-1, -1], [0, 2], [1, 0], [2, -2]];
      const xs = values.map((pair) => pair[0]);
      const ys = values.map((pair) => pair[1]);
      const mx = mean(xs);
      const my = mean(ys);
      const covariance = mean(xs.map((x, i) => (x - mx) * (ys[i] - my)));
      const vx = mean(xs.map((x) => Math.pow(x - mx, 2)));
      const vy = mean(ys.map((y) => Math.pow(y - my, 2)));
      const correlation = vx && vy ? covariance / Math.sqrt(vx * vy) : 0;
      return {
        fixture, values, covariance, correlation,
        deterministic: fixture !== "cloud",
      };
    }
    if (input.kind === "regression") {
      const trueSlope = input.slope;
      const noise = Math.max(0, input.noise);
      const intercept = input.intercept == null ? 1 : input.intercept;
      const pattern = [-1.2, 0.7, -0.4, 1.1, -0.8, 0.5, -0.2, 0.9, -0.6];
      const points = pattern.map((residual, index) => {
        const x = index + 1;
        return [x, intercept + trueSlope * x + noise * residual];
      });
      const xs = points.map((point) => point[0]);
      const ys = points.map((point) => point[1]);
      const mx = mean(xs);
      const my = mean(ys);
      const sxx = sum(xs.map((x) => Math.pow(x - mx, 2)));
      const sxy = sum(xs.map((x, i) => (x - mx) * (ys[i] - my)));
      const fittedSlope = sxy / sxx;
      const fittedIntercept = my - fittedSlope * mx;
      const residuals = points.map((point) => point[1] - (fittedIntercept + fittedSlope * point[0]));
      const sse = sum(residuals.map((value) => value * value));
      const sst = sum(ys.map((value) => Math.pow(value - my, 2)));
      return {
        points, fittedSlope, fittedIntercept, residuals, sse,
        r2: sst ? 1 - sse / sst : 1,
      };
    }
    if (input.kind === "heritability") {
      const h2 = clamp(input.h2, 0, 1);
      const parentZ = input.parentZ;
      const predictor = input.predictor || "midparent";
      const slope = predictor === "midparent" ? h2 : h2 / 2;
      return {
        h2, parentZ, predictor, slope,
        expectedOffspringZ: slope * parentZ,
        movementToMean: parentZ - slope * parentZ,
      };
    }
    if (input.kind === "adjustment") {
      const betaX = input.betaX;
      const betaC = input.betaC;
      const correlationXC = clamp(input.correlationXC, -0.99, 0.99);
      const marginal = betaX + betaC * correlationXC;
      return {
        betaX, betaC, correlationXC,
        marginal, adjusted: betaX, movement: betaX - marginal,
      };
    }
    if (input.kind === "risk") {
      const exposedRisk = clamp(input.exposedRisk, 1e-9, 1 - 1e-9);
      const baselineRisk = clamp(input.baselineRisk, 1e-9, 1 - 1e-9);
      const riskRatio = exposedRisk / baselineRisk;
      const oddsExposed = exposedRisk / (1 - exposedRisk);
      const oddsBaseline = baselineRisk / (1 - baselineRisk);
      const oddsRatio = oddsExposed / oddsBaseline;
      return { exposedRisk, baselineRisk, riskRatio, oddsRatio, oddsExposed, oddsBaseline };
    }
    throw new Error("Unknown variance/regression model");
  }
  models.varianceRegression = varianceRegressionModel;

  function logChoose(n, k) {
    let value = 0;
    for (let index = 1; index <= k; index += 1) {
      value += Math.log(n - index + 1) - Math.log(index);
    }
    return value;
  }

  function binomialLogLikelihood(k, n, p, includeConstant) {
    if (p <= 0) return k === 0 ? (includeConstant ? logChoose(n, k) : 0) : -Infinity;
    if (p >= 1) return k === n ? (includeConstant ? logChoose(n, k) : 0) : -Infinity;
    return (includeConstant ? logChoose(n, k) : 0) + k * Math.log(p) + (n - k) * Math.log(1 - p);
  }

  function wilsonInterval(k, n, z) {
    const p = k / n;
    const z2 = z * z;
    const denominator = 1 + z2 / n;
    const centre = (p + z2 / (2 * n)) / denominator;
    const half = z * Math.sqrt(p * (1 - p) / n + z2 / (4 * n * n)) / denominator;
    return [clamp(centre - half, 0, 1), clamp(centre + half, 0, 1)];
  }

  function betaPosteriorGrid(a, b, steps) {
    const count = steps || 2000;
    const points = [];
    let maxLog = -Infinity;
    for (let index = 0; index <= count; index += 1) {
      const p = (index + 0.5) / (count + 1);
      const logDensity = (a - 1) * Math.log(p) + (b - 1) * Math.log(1 - p);
      maxLog = Math.max(maxLog, logDensity);
      points.push({ p, logDensity });
    }
    const weights = points.map((point) => Math.exp(point.logDensity - maxLog));
    const total = sum(weights);
    let cumulative = 0;
    let lower = points[0].p;
    let upper = points[points.length - 1].p;
    let gotLower = false;
    for (let index = 0; index < points.length; index += 1) {
      cumulative += weights[index] / total;
      if (!gotLower && cumulative >= 0.025) {
        lower = points[index].p;
        gotLower = true;
      }
      if (cumulative >= 0.975) {
        upper = points[index].p;
        break;
      }
    }
    return [lower, upper];
  }

  function likelihoodBayesModel(input) {
    if (input.kind === "likelihood") {
      const n = Math.max(1, Math.round(input.n));
      const k = clamp(Math.round(input.k), 0, n);
      const p = clamp(input.p, 0, 1);
      const mle = k / n;
      const logLikelihood = binomialLogLikelihood(k, n, p, false);
      const maxLogLikelihood = binomialLogLikelihood(k, n, mle, false);
      return {
        n, k, p, mle, logLikelihood, maxLogLikelihood,
        relativeLikelihood: Math.exp(logLikelihood - maxLogLikelihood),
      };
    }
    if (input.kind === "optimizer") {
      const n = Math.max(1, Math.round(input.n));
      const k = clamp(Math.round(input.k), 0, n);
      const mle = k / n;
      const points = [];
      const maximum = binomialLogLikelihood(k, n, mle, false);
      for (let index = 0; index <= 1000; index += 1) {
        const p = index / 1000;
        const ll = binomialLogLikelihood(k, n, p, false);
        if (Number.isFinite(ll) && 2 * (maximum - ll) <= 3.841459) points.push(p);
      }
      return {
        n, k, mle,
        profileInterval: points.length ? [points[0], points[points.length - 1]] : [mle, mle],
        boundary: k === 0 || k === n,
      };
    }
    if (input.kind === "evidence") {
      const logLikelihoodRatio = input.logLikelihoodRatio;
      const likelihoodRatio = Math.exp(logLikelihoodRatio);
      return {
        logLikelihoodRatio, likelihoodRatio,
        lod: logLikelihoodRatio / Math.log(10),
        deviance: 2 * logLikelihoodRatio,
      };
    }
    if (input.kind === "posterior") {
      const n = Math.max(0, Math.round(input.n));
      const k = clamp(Math.round(input.k), 0, n);
      const priorA = Math.max(0.01, input.priorA);
      const priorB = Math.max(0.01, input.priorB);
      const postA = priorA + k;
      const postB = priorB + n - k;
      return {
        n, k, priorA, priorB, postA, postB,
        priorMean: priorA / (priorA + priorB),
        mle: n ? k / n : NaN,
        posteriorMean: postA / (postA + postB),
        credibleInterval: betaPosteriorGrid(postA, postB, 1800),
      };
    }
    if (input.kind === "interval") {
      const n = Math.max(1, Math.round(input.n));
      const k = clamp(Math.round(input.k), 0, n);
      const estimate = k / n;
      const se = Math.sqrt(estimate * (1 - estimate) / n);
      const wald = [estimate - 1.96 * se, estimate + 1.96 * se];
      const wilson = wilsonInterval(k, n, 1.96);
      const credible = betaPosteriorGrid(k + 0.5, n - k + 0.5, 1800);
      return { n, k, estimate, wald, wilson, credible };
    }
    if (input.kind === "selection") {
      const n = Math.max(1, input.n);
      const deltaK = Math.max(0, input.deltaK);
      const logLikelihoodGain = input.logLikelihoodGain;
      const deltaAic = 2 * deltaK - 2 * logLikelihoodGain;
      const deltaBic = deltaK * Math.log(n) - 2 * logLikelihoodGain;
      return {
        n, deltaK, logLikelihoodGain, deltaAic, deltaBic,
        lrt: 2 * logLikelihoodGain,
        aicWinner: deltaAic < 0 ? "larger" : "smaller",
        bicWinner: deltaBic < 0 ? "larger" : "smaller",
      };
    }
    throw new Error("Unknown likelihood/Bayes model");
  }
  models.likelihoodBayes = likelihoodBayesModel;

  function benjaminiHochberg(pValues, q) {
    const m = pValues.length;
    const ordered = pValues.map((p, index) => ({ p: clamp(p, 0, 1), index }))
      .sort((a, b) => a.p - b.p);
    let largest = -1;
    ordered.forEach((item, index) => {
      if (item.p <= q * (index + 1) / m) largest = index;
    });
    const adjustedOrdered = new Array(m);
    let running = 1;
    for (let index = m - 1; index >= 0; index -= 1) {
      running = Math.min(running, ordered[index].p * m / (index + 1));
      adjustedOrdered[index] = running;
    }
    const adjusted = new Array(m);
    ordered.forEach((item, index) => { adjusted[item.index] = adjustedOrdered[index]; });
    return {
      ordered, adjusted,
      cutoff: largest >= 0 ? ordered[largest].p : 0,
      rejected: largest + 1,
    };
  }

  function highDimensionalModel(input) {
    if (input.kind === "multiplicity") {
      const m = Math.max(1, Math.round(input.m));
      const alpha = clamp(input.alpha, 1e-12, 1 - 1e-12);
      return {
        m, alpha,
        familyWiseAny: 1 - Math.pow(1 - alpha, m),
        expectedFalse: m * alpha,
        bonferroni: alpha / m,
      };
    }
    if (input.kind === "threshold") {
      const effectiveTests = Math.max(1, input.effectiveTests);
      return { effectiveTests, threshold: 0.05 / effectiveTests };
    }
    if (input.kind === "bh") {
      return benjaminiHochberg(input.pValues.slice(), clamp(input.q, 1e-9, 1));
    }
    if (input.kind === "qq") {
      const confounding = Math.max(0, input.confounding);
      const polygenic = Math.max(0, input.polygenic);
      const ldScores = [1, 1.3, 1.7, 2.2, 2.8, 3.5, 4.3, 5.2, 6.2, 7.3, 8.5, 9.8];
      const chiSquare = ldScores.map((ld, index) =>
        1 + confounding + polygenic * ld + 0.06 * ((index % 3) - 1)
      );
      // The LD-score panel uses expected mean chi-square (null intercept 1).
      // λGC instead rescales a median by the null median 0.4549364. This
      // teaching fixture gives both summaries the same confounding and
      // LD-linked components without treating a mean of 1 as that median.
      const medianLd = ldScores.slice().sort((a, b) => a - b)[Math.floor(ldScores.length / 2)];
      const medianChiSquare = 0.4549364 * (1 + confounding + polygenic * medianLd);
      return {
        ldScores, chiSquare, medianChiSquare,
        lambda: medianChiSquare / 0.4549364,
        intercept: 1 + confounding,
        slope: polygenic,
      };
    }
    if (input.kind === "pca") {
      const separation = Math.max(0, input.separation);
      const within = Math.max(0.05, input.within);
      const betweenVariance = separation * separation;
      const pc1 = betweenVariance + within * within;
      const pc2 = within * within;
      return {
        separation, within, pc1, pc2,
        pc1Fraction: pc1 / (pc1 + pc2 + within * within * 0.5),
        points: Array.from({ length: 16 }, (_, index) => {
          const group = index < 8 ? -1 : 1;
          const local = index % 8;
          return {
            x: group * separation + within * ((local % 4) - 1.5),
            y: within * (Math.floor(local / 4) * 2 - 1) + 0.12 * (local % 2),
            group,
          };
        }),
      };
    }
    if (input.kind === "shrinkage") {
      const n = Math.max(1, Math.round(input.n));
      const p = Math.max(1, Math.round(input.p));
      const observed = input.observed;
      const se = Math.max(1e-9, input.se);
      const priorSd = Math.max(1e-9, input.priorSd);
      const shrinkage = priorSd * priorSd / (priorSd * priorSd + se * se);
      return {
        n, p, observed, se, priorSd, shrinkage,
        rankCeiling: Math.min(n - 1, p),
        unidentifiedDirections: Math.max(0, p - Math.max(0, n - 1)),
        shrunken: observed * shrinkage,
      };
    }
    if (input.kind === "counts") {
      const mu = Math.max(0, input.mu);
      const dispersion = Math.max(0, input.dispersion);
      return {
        mu, dispersion,
        poissonVariance: mu,
        negativeBinomialVariance: mu + dispersion * mu * mu,
      };
    }
    if (input.kind === "winner") {
      const observed = input.observed;
      const se = Math.max(1e-9, input.se);
      const priorSd = Math.max(1e-9, input.priorSd);
      const shrinkage = priorSd * priorSd / (priorSd * priorSd + se * se);
      const corrected = observed * shrinkage;
      return {
        observed, se, priorSd, shrinkage, corrected,
        observedVariance: observed * observed,
        correctedVariance: corrected * corrected,
        squaredInflation: corrected ? Math.pow(observed / corrected, 2) : Infinity,
      };
    }
    throw new Error("Unknown high-dimensional model");
  }
  models.highDimensional = highDimensionalModel;

  /* S5 ---------------------------------------------------------------- */

  define("regression-causality-lab", makeObjectiveMap("s5", [
    "Compute variance and covariance from the definition and retain the covariance cross-term.",
    "Distinguish covariance, correlation, linear association, and dependence.",
    "Fit and interpret a least-squares line, its units, residuals, and R squared.",
    "Explain regression to the mean and read midparent versus single-parent heritability slopes.",
    "Interpret covariate adjustment geometrically and predict coefficient movement.",
    "Distinguish odds ratios from risk ratios and identify the rare-outcome approximation.",
    "Enumerate non-causal explanations and distinguish a confounder from a collider.",
  ]), function (api) {
    const { body, el, predict } = api;
    const parts = labParts(el);
    let mode = "variance";
    let varX = 9;
    let varY = 4;
    let covariance = 0;
    let dependenceFixture = "inverted";
    let slope = 1.5;
    let noise = 1;
    let h2 = 0.6;
    let parentZ = 2;
    let parentKind = "midparent";
    let betaX = 0.3;
    let betaC = 0.8;
    let corrXC = 0.6;
    let baselineRisk = 0.02;
    let exposedRisk = 0.04;
    let causalFixture = "confounding";

    const modes = [
      { label: "Variance ledger", value: "variance" },
      { label: "Dependence", value: "dependence" },
      { label: "Least squares", value: "regression" },
      { label: "Regression to mean", value: "heritability" },
      { label: "Adjustment", value: "adjustment" },
      { label: "Odds vs risk", value: "risk" },
      { label: "Causal audit", value: "causal" },
    ];

    function renderVariance() {
      const bound = Math.sqrt(varX * varY);
      covariance = clamp(covariance, -bound, bound);
      const result = varianceRegressionModel({ kind: "variance", varX, varY, covariance });
      parts.visual.replaceChildren(
        barBoard(el, [
          { label: "Var(X)", value: result.varX, display: result.varX.toFixed(1), tone: "active" },
          { label: "Var(Y)", value: result.varY, display: result.varY.toFixed(1) },
          { label: "2 Cov(X,Y)", value: result.crossTerm, display: (result.crossTerm >= 0 ? "+" : "") + result.crossTerm.toFixed(1), tone: result.crossTerm < 0 ? "warning" : "signal" },
          { label: "Var(X+Y)", value: result.varianceSum, display: result.varianceSum.toFixed(1), tone: "signal" },
        ], "Variance decomposition with covariance cross-term", Math.max(result.varX, result.varY, Math.abs(result.crossTerm), result.varianceSum)),
        statusStrip(el, [
          { label: "SD(X)", value: Math.sqrt(result.varX).toFixed(2) },
          { label: "SD(Y)", value: Math.sqrt(result.varY).toFixed(2) },
          { label: "independent sum", value: result.independentSum.toFixed(1) },
          { label: "actual sum", value: result.varianceSum.toFixed(1), tone: covariance ? "active" : "signal" },
        ], "Variance units and additivity")
      );
      parts.controls.replaceChildren(
        rangeControl(el, "Variance of X", varX, { min: 0, max: 16, step: 0.5, format: (v) => v.toFixed(1) }, (v) => { varX = v; render(); }),
        rangeControl(el, "Variance of Y", varY, { min: 0, max: 16, step: 0.5, format: (v) => v.toFixed(1) }, (v) => { varY = v; render(); }),
        rangeControl(el, "Covariance", covariance, { min: -bound, max: bound, step: 0.25, format: (v) => v.toFixed(2) }, (v) => { covariance = v; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "square", value: "Var(X) + Var(Y)" },
        { key: "dependence", value: "2Cov = " + result.crossTerm.toFixed(1) },
        { key: "sum", value: "Var(X+Y) = " + result.varianceSum.toFixed(1) },
      ]));
      parts.explanation.innerHTML = covariance === 0
        ? "<strong>With zero covariance, variances add; standard deviations still do not.</strong> Variance carries squared units because squaring is what exposes the additive ledger."
        : "<strong>Dropping the cross-term would be a biological assumption, not algebraic tidying.</strong> Linkage disequilibrium, shared ancestry, assortative mating, or gene–environment covariance can put the missing variance here.";
    }

    function renderDependence() {
      const result = varianceRegressionModel({ kind: "dependence", fixture: dependenceFixture });
      const points = result.values.map((pair, index) => ({
        x: pair[0], y: pair[1], label: "observation " + (index + 1), tone: dependenceFixture === "cloud" ? "muted" : "signal",
      }));
      parts.visual.replaceChildren(
        pointPlot(el, points, {
          label: "Dependence fixture", xLabel: "X", yLabel: "Y", xMin: -2.5, xMax: 2.5, yMin: -2.5, yMax: 2.5,
        }),
        statusStrip(el, [
          { label: "covariance", value: result.covariance.toFixed(2) },
          { label: "Pearson r", value: result.correlation.toFixed(2), tone: Math.abs(result.correlation) < 0.01 && result.deterministic ? "warning" : "signal" },
          { label: "knowing X fixes Y", value: result.deterministic ? "yes" : "no" },
        ], "Linear association versus dependence")
      );
      parts.controls.replaceChildren(choiceRow(el, [
        { label: "straight line", value: "linear" },
        { label: "inverted V", value: "inverted" },
        { label: "unstructured cloud", value: "cloud" },
      ], dependenceFixture, (v) => { dependenceFixture = v; render(); }, "Dependence shape"));
      parts.rail.replaceChildren(causalRail(el, [
        { key: "joint shape", value: dependenceFixture === "inverted" ? "perfectly deterministic, non-linear" : dependenceFixture },
        { key: "covariance", value: result.covariance.toFixed(2) },
        { key: "correlation", value: result.correlation.toFixed(2) },
        { key: "claim", value: Math.abs(result.correlation) < 0.01 ? "no linear trend" : "linear trend present" },
      ]));
      parts.explanation.innerHTML = dependenceFixture === "inverted"
        ? "<strong>Zero correlation does not mean independence.</strong> Here Y is completely determined by X, but the opposing slopes cancel in a straight-line summary. Plot first."
        : "<strong>Correlation is covariance divided by both standard deviations.</strong> It removes units and scale, but it still summarises only a linear trend.";
    }

    function renderRegression() {
      const result = varianceRegressionModel({ kind: "regression", slope, noise, intercept: 1 });
      const points = result.points.map((pair, index) => ({ x: pair[0], y: pair[1], label: "sample " + (index + 1), tone: "active" }));
      parts.visual.replaceChildren(
        pointPlot(el, points, {
          label: "Least-squares fit", xLabel: "dosage (copies)", yLabel: "expression (a.u.)", xMin: 0, xMax: 10,
          yMin: Math.min(-2, ...points.map((p) => p.y)) - 1, yMax: Math.max(12, ...points.map((p) => p.y)) + 1,
          fit: { slope: result.fittedSlope, intercept: result.fittedIntercept },
        }),
        statusStrip(el, [
          { label: "slope", value: result.fittedSlope.toFixed(2) + " expression units / copy", tone: "signal" },
          { label: "intercept", value: result.fittedIntercept.toFixed(2) + " expression units" },
          { label: "R²", value: percent(result.r2, 1), tone: result.r2 > 0.8 ? "signal" : "warning" },
          { label: "residual SSE", value: result.sse.toFixed(2) },
        ], "Least-squares readout")
      );
      parts.controls.replaceChildren(
        rangeControl(el, "Underlying slope", slope, { min: -2, max: 2, step: 0.1, format: (v) => v.toFixed(1) }, (v) => { slope = v; render(); }),
        rangeControl(el, "Residual noise", noise, { min: 0, max: 4, step: 0.1, format: (v) => v.toFixed(1) }, (v) => { noise = v; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "criterion", value: "minimise squared residuals" },
        { key: "coefficient", value: "Cov(x,y) / Var(x)" },
        { key: "units", value: "expression units per allele copy" },
        { key: "left over", value: "residuals; R² is not causality" },
      ]));
      parts.explanation.innerHTML = "<strong>The slope has units; R² is a fraction of outcome variance explained by this fitted line.</strong> Neither number establishes that dosage causes expression, and a high R² does not validate the model outside the observed range.";
    }

    function renderHeritability() {
      const result = varianceRegressionModel({ kind: "heritability", h2, parentZ, predictor: parentKind });
      const heritabilityPoints = Math.abs(parentZ) < 1e-9
        ? [{
          x: 0, y: 0,
          label: "population mean, parent, and expected offspring coincide",
          short: "mean = parent = child", tone: "signal",
        }]
        : Math.abs(parentZ - result.expectedOffspringZ) < 1e-9
          ? [
            { x: 0, y: 0, label: "population mean", short: "mean", tone: "muted" },
            {
              x: parentZ, y: parentZ,
              label: "parental and expected offspring deviations coincide",
              short: "parent = child", tone: "signal",
              labelClass: parentZ > 0 ? "is-label-above" : "",
            },
          ]
          : [
            { x: 0, y: 0, label: "population mean", short: "mean", tone: "muted" },
            {
              x: parentZ, y: parentZ, label: "parental deviation", short: "parent", tone: "warning",
              labelClass: parentZ > 0 ? "is-label-above" : "",
            },
            { x: parentZ, y: result.expectedOffspringZ, label: "expected offspring deviation", short: "child", tone: "signal" },
          ];
      parts.visual.replaceChildren(
        pointPlot(el, heritabilityPoints, {
          label: "Regression to the mean", xLabel: "parental phenotype (SD)", yLabel: "expected offspring phenotype (SD)",
          xMin: -3, xMax: 3, yMin: -3, yMax: 3, diagonal: true,
        }),
        statusStrip(el, [
          { label: "h²", value: result.h2.toFixed(2) },
          { label: parentKind + " slope", value: result.slope.toFixed(2), tone: "active" },
          { label: "parent", value: parentZ.toFixed(1) + " SD" },
          { label: "expected child", value: result.expectedOffspringZ.toFixed(2) + " SD", tone: "signal" },
        ], "Parent-offspring regression")
      );
      parts.controls.replaceChildren(
        choiceRow(el, [
          { label: "midparent", value: "midparent" }, { label: "single parent", value: "single" },
        ], parentKind, (v) => { parentKind = v; render(); }, "Parental predictor"),
        rangeControl(el, "Narrow-sense heritability", h2, { min: 0, max: 1, step: 0.05, format: (v) => v.toFixed(2) }, (v) => { h2 = v; render(); }),
        rangeControl(el, "Parental deviation", parentZ, { min: -3, max: 3, step: 0.1, format: (v) => v.toFixed(1) + " SD" }, (v) => { parentZ = v; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "imperfect resemblance", value: "slope " + result.slope.toFixed(2) },
        { key: "extreme parent", value: parentZ.toFixed(1) + " SD" },
        { key: "conditional mean", value: result.expectedOffspringZ.toFixed(2) + " SD" },
        { key: "interpretation", value: "a geometry of correlation, not a restoring force" },
      ]));
      parts.explanation.innerHTML = parentKind === "midparent"
        ? "<strong>With a midparent predictor, the offspring-on-parent slope estimates h² directly.</strong> Extremes regress because correlation is imperfect; no force pushes an individual toward the mean."
        : "<strong>A single-parent slope is h²/2 under the standard additive model.</strong> The other parent's unobserved breeding value contributes independent variation, so double this slope to estimate h².";
    }

    function renderAdjustment() {
      const result = varianceRegressionModel({ kind: "adjustment", betaX, betaC, correlationXC: corrXC });
      parts.visual.replaceChildren(
        barBoard(el, [
          { label: "unadjusted X coefficient", value: result.marginal, display: result.marginal.toFixed(2), tone: "warning" },
          { label: "direct X coefficient", value: result.adjusted, display: result.adjusted.toFixed(2), tone: "signal" },
          { label: "confounding component", value: betaC * corrXC, display: (betaC * corrXC).toFixed(2), tone: "active" },
        ], "Coefficient before and after residualising a shared cause", Math.max(0.1, Math.abs(result.marginal), Math.abs(result.adjusted), Math.abs(betaC * corrXC))),
        processBoard(el, [
          { label: "X residual", value: "remove the part predicted by C", tone: "active" },
          { label: "Y residual", value: "remove the part predicted by C" },
          { label: "adjusted slope", value: "regress residual Y on residual X", tone: "signal" },
        ], "Frisch–Waugh–Lovell geometry")
      );
      parts.controls.replaceChildren(
        rangeControl(el, "Direct X effect", betaX, { min: -1, max: 1, step: 0.05, format: (v) => v.toFixed(2) }, (v) => { betaX = v; render(); }),
        rangeControl(el, "Covariate effect on Y", betaC, { min: -1, max: 1, step: 0.05, format: (v) => v.toFixed(2) }, (v) => { betaC = v; render(); }),
        rangeControl(el, "Correlation of X and covariate", corrXC, { min: -0.9, max: 0.9, step: 0.05, format: (v) => v.toFixed(2) }, (v) => { corrXC = v; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "before", value: result.marginal.toFixed(2) },
        { key: "subtract C", value: (betaC * corrXC >= 0 ? "+" : "") + (betaC * corrXC).toFixed(2) + " shared component" },
        { key: "after", value: result.adjusted.toFixed(2) },
        { key: "claim", value: "conditional association, still design-dependent" },
      ]));
      parts.explanation.innerHTML = "<strong>Adjustment compares samples at the same covariate value by residualising both axes.</strong> The coefficient can rise, fall, or flip. Adjusting for a confounder can remove bias; adjusting for a collider can create it—the regression table cannot tell which graph you fitted.";
    }

    function renderRisk() {
      const result = varianceRegressionModel({ kind: "risk", baselineRisk, exposedRisk });
      parts.visual.replaceChildren(
        statusStrip(el, [
          { label: "unexposed risk", value: percent(result.baselineRisk, 1) },
          { label: "exposed risk", value: percent(result.exposedRisk, 1), tone: "active" },
          { label: "risk ratio", value: result.riskRatio.toFixed(2), tone: "signal" },
          { label: "odds ratio", value: result.oddsRatio.toFixed(2), tone: Math.abs(result.oddsRatio - result.riskRatio) > 0.2 ? "warning" : "signal" },
        ], "Risk and odds contrast"),
        barBoard(el, [
          { label: "risk ratio", value: result.riskRatio, display: result.riskRatio.toFixed(2), tone: "signal" },
          { label: "odds ratio", value: result.oddsRatio, display: result.oddsRatio.toFixed(2), tone: "warning" },
        ], "Odds-ratio approximation to risk ratio", Math.max(result.riskRatio, result.oddsRatio))
      );
      parts.controls.replaceChildren(
        rangeControl(el, "Unexposed risk", baselineRisk, { min: 0.005, max: 0.8, step: 0.005, format: (v) => percent(v, 1) }, (v) => { baselineRisk = Math.min(v, exposedRisk - 0.001); render(); }),
        rangeControl(el, "Exposed risk", exposedRisk, { min: 0.01, max: 0.95, step: 0.005, format: (v) => percent(v, 1) }, (v) => { exposedRisk = Math.max(v, baselineRisk + 0.001); render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "probability", value: percent(result.baselineRisk, 1) + " → " + percent(result.exposedRisk, 1) },
        { key: "risk ratio", value: result.riskRatio.toFixed(2) },
        { key: "odds transform", value: "p / (1−p)" },
        { key: "odds ratio", value: result.oddsRatio.toFixed(2) },
      ]));
      parts.explanation.innerHTML = result.baselineRisk < 0.1 && result.exposedRisk < 0.1
        ? "<strong>When both outcomes are rare, odds and risk are numerically close.</strong> That is an approximation caused by 1−p being near 1, not an identity."
        : "<strong>For common outcomes, the odds ratio pulls away from the risk ratio and exaggerates its numerical distance from 1.</strong> Logistic regression estimates log odds; do not silently relabel its exponentiated coefficient as relative risk.";
    }

    function renderCausal() {
      const fixtures = {
        chance: ["random tail event", "replication / multiplicity control", "association may disappear", "not a causal variable"],
        confounding: ["common cause of exposure and outcome", "family design, randomisation, valid adjustment", "blocks a backdoor path", "condition on it when measured well"],
        reverse: ["outcome changes the measured exposure", "prospective design / instrument", "time order is wrong", "association points backward"],
        selection: ["conditioning on entry or survival", "population sampling / inverse weighting", "opens a collider path", "do not adjust merely because recorded"],
        collider: ["common effect of exposure and outcome", "avoid conditioning on it", "creates association from independence", "sits downstream, not upstream"],
      };
      const f = fixtures[causalFixture];
      parts.visual.replaceChildren(
        processBoard(el, [
          { label: "structure", value: f[0], tone: causalFixture === "selection" || causalFixture === "collider" ? "warning" : "active" },
          { label: "design response", value: f[1], tone: "signal" },
          { label: "what happens", value: f[2] },
          { label: "decision rule", value: f[3], tone: "active" },
        ], "Association-to-causation audit"),
        claimBoundary(el, "an association conditional on the fitted design", "a causal effect", "Chance, confounding, reverse causation, and selection remain until the design addresses them.")
      );
      parts.controls.replaceChildren(choiceRow(el, [
        { label: "chance", value: "chance" },
        { label: "confounding", value: "confounding" },
        { label: "reverse causation", value: "reverse" },
        { label: "selection", value: "selection" },
        { label: "collider", value: "collider" },
      ], causalFixture, (v) => { causalFixture = v; render(); }, "Non-causal explanation"));
      parts.rail.replaceChildren(causalRail(el, [
        { key: "observed", value: "X associated with Y" },
        { key: "alternative", value: f[0] },
        { key: "design", value: f[1] },
        { key: "licensed claim", value: causalFixture === "confounding" ? "conditional association after measured C" : "depends on design success" },
      ]));
      parts.explanation.innerHTML = causalFixture === "collider"
        ? "<strong>A confounder is a common cause; a collider is a common effect.</strong> Conditioning on a common cause can close a spurious path. Conditioning on a common effect can open one. Their position in the causal graph—not their correlation—distinguishes them."
        : "<strong>An association is an observation, not a mechanism.</strong> Name the rival explanation and the design feature that would make it less plausible before promoting the coefficient to a causal claim.";
    }

    function render() {
      parts.tabHost.replaceChildren(tabs(el, modes, mode, (value) => { mode = value; render(); }));
      if (mode === "variance") renderVariance();
      else if (mode === "dependence") renderDependence();
      else if (mode === "regression") renderRegression();
      else if (mode === "heritability") renderHeritability();
      else if (mode === "adjustment") renderAdjustment();
      else if (mode === "risk") renderRisk();
      else renderCausal();
    }

    predict(body, {
      widget: "regression-causality-lab",
      question: "X and Y are perfectly related by an inverted V, but Pearson <em>r</em> is zero. Is that compatible with complete dependence?",
      hint: "Correlation summarises a straight-line component, not every possible relationship.",
      options: [
        { label: "No—zero r proves independence" },
        { label: "Yes—non-linear dependence can have r = 0", correct: true },
        { label: "Only with measurement error" },
        { label: "Only when sample size is one" },
      ],
    }, () => {
      mode = "dependence";
      parts.instrument.hidden = false;
      render();
    });
    finishLab(parts, body);
  });

  /* S6 ---------------------------------------------------------------- */

  define("likelihood-landscape-lab", makeObjectiveMap("s6", [
    "Distinguish a likelihood function over parameters from a probability distribution over outcomes.",
    "Find a numerical maximum likelihood estimate and diagnose boundary and optimiser failures.",
    "Translate among likelihood ratios, LOD scores, likelihood-ratio statistics, and Bayes factors without conflating them with p-values.",
    "Combine prior and likelihood into posteriors across genomic inference contexts.",
    "Distinguish confidence-interval coverage from credible-interval probability.",
    "Compare AIC, BIC, and likelihood-ratio model choices and explain principled disagreement.",
  ]), function (api) {
    const { body, el, predict } = api;
    const parts = labParts(el);
    let mode = "likelihood";
    let n = 20;
    let k = 5;
    let candidateP = 0.25;
    let lnLR = Math.log(1000);
    let priorFixture = "weak";
    let intervalK = 1;
    let intervalN = 20;
    let modelN = 17421;
    let deltaK = 2;
    let gain = 8.088;

    const modes = [
      { label: "Likelihood", value: "likelihood" },
      { label: "Numerical MLE", value: "optimizer" },
      { label: "Evidence units", value: "evidence" },
      { label: "Bayesian update", value: "posterior" },
      { label: "Interval meaning", value: "interval" },
      { label: "Model selection", value: "selection" },
    ];

    function likelihoodPoints() {
      const points = [];
      const mle = k / n;
      const maximum = binomialLogLikelihood(k, n, mle, false);
      for (let index = 1; index < 40; index += 1) {
        const p = index / 40;
        const relative = Math.exp(binomialLogLikelihood(k, n, p, false) - maximum);
        points.push({ x: index, y: relative, label: "p=" + p.toFixed(3), tone: Math.abs(p - candidateP) < 0.02 ? "signal" : "active" });
      }
      return points;
    }

    function renderLikelihood() {
      const result = likelihoodBayesModel({ kind: "likelihood", n, k, p: candidateP });
      parts.visual.replaceChildren(
        rankedPlot(el, likelihoodPoints(), {
          label: "Relative binomial likelihood over candidate allele frequencies", xLabel: "candidate allele frequency p", yLabel: "relative likelihood", maxY: 1,
        }),
        statusStrip(el, [
          { label: "data", value: k + " alt / " + n + " chromosomes" },
          { label: "candidate p", value: candidateP.toFixed(2) },
          { label: "MLE", value: result.mle.toFixed(2), tone: "signal" },
          { label: "relative likelihood", value: result.relativeLikelihood.toFixed(3), tone: result.relativeLikelihood < 0.1 ? "warning" : "active" },
        ], "Likelihood is data probability indexed by a candidate parameter")
      );
      parts.controls.replaceChildren(
        rangeControl(el, "Observed alt copies", k, { min: 0, max: n, step: 1, format: (v) => v.toFixed(0) }, (v) => { k = v; render(); }),
        rangeControl(el, "Candidate allele frequency", candidateP, { min: 0.01, max: 0.99, step: 0.01, format: (v) => v.toFixed(2) }, (v) => { candidateP = v; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "fixed", value: "observed data: " + k + "/" + n },
        { key: "varied", value: "candidate p" },
        { key: "height", value: "P(data | p), up to scaling" },
        { key: "not supplied", value: "P(p | data) needs a prior" },
      ]));
      parts.explanation.innerHTML = "<strong>A likelihood is not normalised over the parameter.</strong> Its absolute height can be rescaled without changing inference; ratios and the shape around the maximum carry the evidence. A posterior over p requires a prior.";
    }

    function renderOptimizer() {
      const result = likelihoodBayesModel({ kind: "optimizer", n, k });
      parts.visual.replaceChildren(
        processBoard(el, [
          { label: "search domain", value: "0 ≤ p ≤ 1", tone: "active" },
          { label: "maximum", value: "p̂ = " + result.mle.toFixed(3), tone: result.boundary ? "warning" : "signal" },
          { label: "profile 95% region", value: "[" + result.profileInterval[0].toFixed(3) + ", " + result.profileInterval[1].toFixed(3) + "]" },
          { label: "diagnostic", value: result.boundary ? "boundary maximum: Wald SE collapses" : "interior maximum" },
        ], "Numerical maximum and likelihood drop"),
        claimBoundary(el, "best-fitting p inside the chosen binomial model", "model adequacy or an unbiased small-sample estimate", "Inspect the surface, starting values, boundaries, convergence flags, and profile interval.")
      );
      parts.controls.replaceChildren(
        rangeControl(el, "Chromosomes", n, { min: 4, max: 100, step: 1, format: (v) => v.toFixed(0) }, (v) => { n = v; k = Math.min(k, n); render(); }),
        rangeControl(el, "Observed alt copies", k, { min: 0, max: n, step: 1, format: (v) => v.toFixed(0) }, (v) => { k = v; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "write", value: "log L(p)" },
        { key: "search", value: "maximise within 0…1" },
        { key: "verify", value: "profile surface + convergence" },
        { key: "report", value: "estimate + interval, not optimiser status alone" },
      ]));
      parts.explanation.innerHTML = result.boundary
        ? "<strong>The likelihood is behaving correctly; the point estimate is unhelpful.</strong> With zero or all events, the MLE lies on the boundary and the Wald interval can collapse. Report a likelihood/exact upper or lower bound."
        : "<strong>An optimiser finding a number is not evidence that it found the global maximum.</strong> Inspect the likelihood surface and profile nuisance parameters; flat ridges and parameter boundaries are scientific information, not software annoyances.";
    }

    function renderEvidence() {
      const result = likelihoodBayesModel({ kind: "evidence", logLikelihoodRatio: lnLR });
      parts.visual.replaceChildren(statusStrip(el, [
        { label: "likelihood ratio", value: compact(result.likelihoodRatio, 2), tone: "signal" },
        { label: "ln LR", value: result.logLikelihoodRatio.toFixed(3) },
        { label: "LOD = log₁₀ LR", value: result.lod.toFixed(3), tone: "active" },
        { label: "2 ln LR", value: result.deviance.toFixed(3) },
      ], "Same evidence in four units"), claimBoundary(el,
        "relative support for two specified models",
        "a tail probability or posterior odds without a prior",
        "A Bayes factor equals a likelihood ratio only for two simple, fully specified hypotheses; composite models require integration over priors."
      ));
      parts.controls.replaceChildren(rangeControl(el, "Natural-log likelihood ratio", lnLR, {
        min: -4, max: 12, step: 0.1, format: (v) => v.toFixed(1),
      }, (v) => { lnLR = v; render(); }));
      parts.rail.replaceChildren(causalRail(el, [
        { key: "two models", value: "M₁ versus M₀" },
        { key: "evidence", value: "L₁/L₀ = " + compact(result.likelihoodRatio, 2) },
        { key: "unit change", value: "LOD " + result.lod.toFixed(2) + " · 2lnLR " + result.deviance.toFixed(2) },
        { key: "decision", value: "threshold depends on prior odds and loss" },
      ]));
      parts.explanation.innerHTML = "<strong>LOD, ln LR, and 2 ln LR can encode the same pairwise evidence on different scales.</strong> A p-value instead asks for a tail probability under one null. Similar-looking thresholds do not make the objects interchangeable.";
    }

    function renderPosterior() {
      const priors = {
        flat: [1, 1, "uniform over p"],
        weak: [2, 6, "weak prior centred at 0.25"],
        rare: [0.5, 49.5, "rare-allele prior centred at 0.01"],
      };
      const prior = priors[priorFixture];
      const result = likelihoodBayesModel({ kind: "posterior", n, k, priorA: prior[0], priorB: prior[1] });
      parts.visual.replaceChildren(
        processBoard(el, [
          { label: "prior", value: "Beta(" + prior[0] + ", " + prior[1] + ") · mean " + result.priorMean.toFixed(3), tone: "active" },
          { label: "likelihood", value: k + " successes in " + n + " trials · MLE " + result.mle.toFixed(3) },
          { label: "posterior", value: "Beta(" + result.postA + ", " + result.postB + ")", tone: "signal" },
          { label: "posterior summary", value: result.posteriorMean.toFixed(3) + " · 95% [" + result.credibleInterval[0].toFixed(3) + ", " + result.credibleInterval[1].toFixed(3) + "]" },
        ], "Bayesian update as pseudo-count accounting"),
        barBoard(el, [
          { label: "prior mean", value: result.priorMean, display: result.priorMean.toFixed(3), tone: "active" },
          { label: "data MLE", value: result.mle, display: result.mle.toFixed(3) },
          { label: "posterior mean", value: result.posteriorMean, display: result.posteriorMean.toFixed(3), tone: "signal" },
        ], "Prior, likelihood centre, and posterior", 1)
      );
      parts.controls.replaceChildren(
        choiceRow(el, [
          { label: "flat", value: "flat" }, { label: "weak biological", value: "weak" }, { label: "rare allele", value: "rare" },
        ], priorFixture, (v) => { priorFixture = v; render(); }, "Prior fixture"),
        rangeControl(el, "Trials", n, { min: 4, max: 100, step: 1, format: (v) => v.toFixed(0) }, (v) => { n = v; k = Math.min(k, n); render(); }),
        rangeControl(el, "Successes", k, { min: 0, max: n, step: 1, format: (v) => v.toFixed(0) }, (v) => { k = v; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "prior information", value: prior[2] },
        { key: "new data", value: k + "/" + n },
        { key: "Bayes", value: "posterior ∝ prior × likelihood" },
        { key: "sensitivity", value: n < 30 ? "prior still visible" : "likelihood dominates this fixture" },
      ]));
      parts.explanation.innerHTML = "<strong>The prior does not alter the likelihood; it alters posterior odds.</strong> The same architecture underlies allele frequencies, carrier probabilities, genotype calling, variant pathogenicity, and fine-mapping—only the state space and likelihood change.";
    }

    function renderInterval() {
      const result = likelihoodBayesModel({ kind: "interval", n: intervalN, k: intervalK });
      const waldTone = result.wald[0] < 0 || result.wald[1] > 1 ? "warning" : "active";
      parts.visual.replaceChildren(
        statusStrip(el, [
          { label: "estimate", value: result.estimate.toFixed(3) },
          { label: "Wald 95%", value: "[" + result.wald[0].toFixed(3) + ", " + result.wald[1].toFixed(3) + "]", tone: waldTone },
          { label: "Wilson 95%", value: "[" + result.wilson[0].toFixed(3) + ", " + result.wilson[1].toFixed(3) + "]", tone: "signal" },
          { label: "Jeffreys credible 95%", value: "[" + result.credible[0].toFixed(3) + ", " + result.credible[1].toFixed(3) + "]", tone: "active" },
        ], "Three interval procedures"),
        claimBoundary(el,
          "confidence: long-run coverage of the procedure",
          "a 95% probability attached to this fixed frequentist parameter",
          "A credible interval licenses posterior probability only under its stated prior and likelihood. Similar endpoints do not erase different meanings."
        )
      );
      parts.controls.replaceChildren(
        rangeControl(el, "Chromosomes", intervalN, { min: 4, max: 200, step: 1, format: (v) => v.toFixed(0) }, (v) => { intervalN = v; intervalK = Math.min(intervalK, intervalN); render(); }),
        rangeControl(el, "Alt copies", intervalK, { min: 0, max: intervalN, step: 1, format: (v) => v.toFixed(0) }, (v) => { intervalK = v; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "data", value: intervalK + "/" + intervalN },
        { key: "frequentist", value: "procedure repeats; parameter fixed" },
        { key: "Bayesian", value: "posterior varies over parameter" },
        { key: "small n", value: "methods differ where genomics is sparse" },
      ]));
      parts.explanation.innerHTML = result.wald[0] < 0
        ? "<strong>The symmetric Wald interval has left the parameter space.</strong> This is a method failure near a boundary, not evidence for negative allele frequency. Wilson or likelihood intervals retain coverage; a Bayesian interval remains conditional on its prior."
        : "<strong>Numerical agreement does not make confidence and credible intervals synonymous.</strong> With more data a regular likelihood can overwhelm a weak prior, so distinct inferential statements often land on similar endpoints.";
    }

    function renderSelection() {
      const result = likelihoodBayesModel({ kind: "selection", n: modelN, deltaK, logLikelihoodGain: gain });
      parts.visual.replaceChildren(
        barBoard(el, [
          { label: "extra fit: −2ΔlogL", value: 2 * gain, display: "−" + (2 * gain).toFixed(2), tone: "signal" },
          { label: "AIC penalty", value: 2 * deltaK, display: "+" + (2 * deltaK).toFixed(2), tone: "active" },
          { label: "BIC penalty", value: deltaK * Math.log(modelN), display: "+" + (deltaK * Math.log(modelN)).toFixed(2), tone: "warning" },
        ], "Fit gain against complexity penalties", Math.max(2 * gain, deltaK * Math.log(modelN))),
        statusStrip(el, [
          { label: "LRT statistic", value: result.lrt.toFixed(2) },
          { label: "ΔAIC (large−small)", value: result.deltaAic.toFixed(2), tone: result.aicWinner === "larger" ? "signal" : "active" },
          { label: "AIC winner", value: result.aicWinner + " model" },
          { label: "ΔBIC / winner", value: result.deltaBic.toFixed(2) + " · " + result.bicWinner, tone: result.aicWinner !== result.bicWinner ? "warning" : "signal" },
        ], "Information-criterion decision")
      );
      parts.controls.replaceChildren(
        rangeControl(el, "Observations", modelN, { min: 20, max: 50000, step: 20, format: (v) => compact(v, 0) }, (v) => { modelN = v; render(); }),
        rangeControl(el, "Extra parameters", deltaK, { min: 1, max: 10, step: 1, format: (v) => v.toFixed(0) }, (v) => { deltaK = v; render(); }),
        rangeControl(el, "Log-likelihood gain", gain, { min: 0, max: 30, step: 0.1, format: (v) => v.toFixed(1) }, (v) => { gain = v; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "fit", value: "+" + gain.toFixed(2) + " log L" },
        { key: "AIC target", value: "predictive loss; 2 per parameter" },
        { key: "BIC target", value: "marginal-likelihood approximation; ln n per parameter" },
        { key: "report", value: result.aicWinner === result.bicWinner ? "criteria agree" : "principled disagreement" },
      ]));
      parts.explanation.innerHTML = result.aicWinner !== result.bicWinner
        ? "<strong>The criteria disagree because they answer different questions.</strong> At large n, BIC's ln(n) penalty can reject complexity that AIC accepts for prediction. State the criterion and ask whether the downstream conclusion changes."
        : "<strong>Adding parameters always raises maximised likelihood, so raw fit cannot choose model size.</strong> AIC, BIC, and an LRT attach different penalties or reference questions; agreement is reassuring, not guaranteed.";
    }

    function render() {
      parts.tabHost.replaceChildren(tabs(el, modes, mode, (value) => { mode = value; render(); }));
      if (mode === "likelihood") renderLikelihood();
      else if (mode === "optimizer") renderOptimizer();
      else if (mode === "evidence") renderEvidence();
      else if (mode === "posterior") renderPosterior();
      else if (mode === "interval") renderInterval();
      else renderSelection();
    }

    predict(body, {
      widget: "likelihood-landscape-lab",
      question: "A likelihood curve peaks at allele frequency 0.30. Does that curve, by itself, assign a probability that the true frequency is 0.30?",
      hint: "The data are fixed while candidate parameter values move along the horizontal axis.",
      options: [
        { label: "Yes—the peak is P(p = 0.30 | data)" },
        { label: "No—it is P(data | p), compared across p", correct: true },
        { label: "Yes, if the sample is large" },
        { label: "Only after taking log₁₀" },
      ],
    }, () => {
      parts.instrument.hidden = false;
      render();
    });
    finishLab(parts, body);
  });

  /* S7 ---------------------------------------------------------------- */

  define("high-dimensional-microscope", makeObjectiveMap("s7", [
    "Choose between family-wise error and false-discovery-rate control and state each guarantee.",
    "Derive the conventional GWAS threshold and vary the effective-test count by ancestry and assay.",
    "Implement and interpret the Benjamini–Hochberg step-up procedure and adjusted p-values.",
    "Read a QQ plot and genomic inflation factor while separating confounding from polygenic signal.",
    "Interpret PCA and scree plots and avoid reading global geometry from UMAP or t-SNE.",
    "Explain p-greater-than-n failure, negative-binomial overdispersion, and shrinkage in PGS and RNA-seq.",
    "Explain winner's curse and why reporting squared effects squares the inflation.",
  ]), function (api) {
    const { body, el, predict } = api;
    const parts = labParts(el);
    let mode = "multiplicity";
    let tests = 100;
    let alpha = 0.05;
    let thresholdFixture = "eur";
    let q = 0.05;
    let bhFixture = "mixed";
    let confounding = 0.1;
    let polygenic = 0.08;
    let separation = 1.5;
    let within = 0.35;
    let shrinkView = "rank";
    let sampleN = 100;
    let predictors = 500;
    let countMean = 40;
    let dispersion = 0.1;
    let observedEffect = 0.2;
    let winnerSe = 0.08;
    let winnerPrior = 0.06;

    const modes = [
      { label: "Error target", value: "multiplicity" },
      { label: "GWAS threshold", value: "threshold" },
      { label: "BH step-up", value: "bh" },
      { label: "QQ + λ", value: "qq" },
      { label: "PCA + embedding", value: "pca" },
      { label: "Shrinkage + counts", value: "shrinkage" },
      { label: "Winner's curse", value: "winner" },
    ];

    function renderMultiplicity() {
      const result = highDimensionalModel({ kind: "multiplicity", m: tests, alpha });
      parts.visual.replaceChildren(
        statusStrip(el, [
          { label: "tests", value: compact(result.m, 0) },
          { label: "per-test α", value: result.alpha.toFixed(3) },
          { label: "expected false positives", value: compact(result.expectedFalse, 2), tone: "warning" },
          { label: "P(at least one)", value: percent(result.familyWiseAny, 2), tone: result.familyWiseAny > 0.5 ? "warning" : "active" },
        ], "Many-test null arithmetic"),
        processBoard(el, [
          { label: "FWER target", value: "P(at least one false claim in the family)", tone: "active" },
          { label: "Bonferroni", value: "test each at " + compact(result.bonferroni, 2) },
          { label: "FDR target", value: "expected false fraction among rejections", tone: "signal" },
          { label: "choice follows use", value: "confirmatory hit versus screening list" },
        ], "Two error guarantees")
      );
      parts.controls.replaceChildren(
        rangeControl(el, "Number of tests", tests, { min: 1, max: 1000000, step: 1, format: (v) => compact(v, 0) }, (v) => { tests = v; render(); }),
        rangeControl(el, "Per-test alpha", alpha, { min: 0.001, max: 0.1, step: 0.001, format: (v) => v.toFixed(3) }, (v) => { alpha = v; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "one null test", value: percent(alpha, 1) + " false-positive rate" },
        { key: "repeat m times", value: compact(tests, 0) + " questions" },
        { key: "family", value: percent(result.familyWiseAny, 1) + " chance of ≥1" },
        { key: "decision", value: "control studies (FWER) or list purity (FDR)" },
      ]));
      parts.explanation.innerHTML = "<strong>FWER and FDR protect different objects.</strong> Five-percent FWER means one false claim in twenty whole null studies; five-percent FDR means an expected one false item in twenty reported discoveries. Neither is universally stricter in purpose.";
    }

    function renderThreshold() {
      const fixtures = {
        eur: [1e6, "common variants in European-ancestry LD", "5 × 10⁻⁸ convention"],
        afr: [2e6, "shorter LD in African-ancestry genomes", "illustrative stronger correction"],
        wgs: [5e6, "WGS including weakly correlated rare variants", "assay-specific proposals vary"],
        founder: [500000, "long founder haplotypes", "fewer effective dimensions"],
      };
      const f = fixtures[thresholdFixture];
      const result = highDimensionalModel({ kind: "threshold", effectiveTests: f[0] });
      parts.visual.replaceChildren(
        statusStrip(el, [
          { label: "nominal family α", value: "0.05" },
          { label: "effective tests", value: compact(result.effectiveTests, 0), tone: "active" },
          { label: "threshold", value: compact(result.threshold, 2), tone: "signal" },
          { label: "interpretation", value: f[2] },
        ], "Genome-wide Bonferroni threshold"),
        processBoard(el, [
          { label: "markers typed", value: "not the denominator" },
          { label: "LD eigen-dimensions", value: compact(result.effectiveTests, 0), tone: "active" },
          { label: "divide 0.05", value: compact(result.threshold, 2), tone: "signal" },
          { label: "population / assay", value: f[1] },
        ], "From correlated variants to effective questions")
      );
      parts.controls.replaceChildren(choiceRow(el, [
        { label: "European common", value: "eur" },
        { label: "African common", value: "afr" },
        { label: "whole genome", value: "wgs" },
        { label: "founder population", value: "founder" },
      ], thresholdFixture, (v) => { thresholdFixture = v; render(); }, "Effective-test fixture"));
      parts.rail.replaceChildren(causalRail(el, [
        { key: "dependence", value: "LD makes neighbouring tests redundant" },
        { key: "M_eff", value: compact(result.effectiveTests, 0) },
        { key: "Bonferroni", value: "0.05 / M_eff" },
        { key: "threshold", value: compact(result.threshold, 2) },
      ]));
      parts.explanation.innerHTML = "<strong>The familiar 5 × 10⁻⁸ prices roughly one million effective common-variant tests, not the number of rows in a VCF.</strong> LD architecture, ancestry, allele-frequency spectrum, and assay change that effective search space; the displayed alternatives are teaching scenarios, not universal replacement constants.";
    }

    function bhValues() {
      if (bhFixture === "null") return [0.012, 0.05, 0.11, 0.19, 0.31, 0.44, 0.58, 0.67, 0.82, 0.94];
      if (bhFixture === "strong") return [0.0001, 0.0004, 0.001, 0.003, 0.006, 0.018, 0.09, 0.24, 0.55, 0.88];
      return [0.0005, 0.004, 0.009, 0.018, 0.027, 0.081, 0.19, 0.44, 0.71, 0.92];
    }

    function renderBh() {
      const values = bhValues();
      const result = highDimensionalModel({ kind: "bh", pValues: values, q });
      const points = result.ordered.map((item, index) => ({
        x: index + 1, y: item.p, label: "rank " + (index + 1) + " p=" + item.p.toFixed(4), tone: index < result.rejected ? "signal" : "muted",
      }));
      parts.visual.replaceChildren(
        rankedPlot(el, points, {
          label: "Sorted p-values against the Benjamini-Hochberg step-up boundary", xLabel: "sorted rank i", yLabel: "p-value", maxY: 1,
        }),
        statusStrip(el, [
          { label: "tests", value: values.length },
          { label: "FDR target q", value: percent(q, 0) },
          { label: "largest passing p", value: result.cutoff ? result.cutoff.toFixed(4) : "none", tone: result.rejected ? "signal" : "warning" },
          { label: "rejections", value: result.rejected, tone: "active" },
        ], "Benjamini-Hochberg step-up result")
      );
      parts.controls.replaceChildren(
        choiceRow(el, [
          { label: "mostly null", value: "null" }, { label: "mixed", value: "mixed" }, { label: "strong signal", value: "strong" },
        ], bhFixture, (v) => { bhFixture = v; render(); }, "P-value fixture"),
        rangeControl(el, "FDR target q", q, { min: 0.01, max: 0.25, step: 0.01, format: (v) => percent(v, 0) }, (v) => { q = v; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "sort", value: "p(1) ≤ … ≤ p(m)" },
        { key: "boundary", value: "i·q/m" },
        { key: "step up", value: "largest passing rank = " + result.rejected },
        { key: "guarantee", value: "expected false share of the selected list" },
      ]));
      parts.explanation.innerHTML = "<strong>BH is a step-up rule: find the last p-value that outruns i·q/m, then take everything above it in rank.</strong> The running minimum used for adjusted p-values preserves their order. FDR does not make each selected gene individually 95% certain.";
    }

    function renderQq() {
      const result = highDimensionalModel({ kind: "qq", confounding, polygenic });
      const points = result.ldScores.map((ld, index) => ({ x: ld, y: result.chiSquare[index], label: "LD score " + ld, tone: "active" }));
      parts.visual.replaceChildren(
        pointPlot(el, points, {
          label: "Chi-square statistic by LD score", xLabel: "LD score", yLabel: "mean χ² fixture", xMin: 0, xMax: 11,
          yMin: 0, yMax: Math.max(3, ...result.chiSquare) + 0.5, fit: { slope: result.slope, intercept: result.intercept },
        }),
        statusStrip(el, [
          { label: "λGC", value: result.lambda.toFixed(2), tone: result.lambda > 1.2 ? "warning" : "active" },
          { label: "LD-score intercept", value: result.intercept.toFixed(2), tone: result.intercept > 1.1 ? "warning" : "signal" },
          { label: "LD-linked slope", value: result.slope.toFixed(2), tone: "signal" },
          { label: "λ alone distinguishes cause?", value: "no" },
        ], "Inflation decomposition fixture")
      );
      parts.controls.replaceChildren(
        rangeControl(el, "Confounding component", confounding, { min: 0, max: 1, step: 0.02, format: (v) => v.toFixed(2) }, (v) => { confounding = v; render(); }),
        rangeControl(el, "Polygenic LD-linked component", polygenic, { min: 0, max: 0.4, step: 0.01, format: (v) => v.toFixed(2) }, (v) => { polygenic = v; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "QQ departure", value: "many statistics above null" },
        { key: "λ", value: "median compression = " + result.lambda.toFixed(2) },
        { key: "LD-score intercept", value: result.intercept.toFixed(2) + " · LD-independent" },
        { key: "slope", value: result.slope.toFixed(2) + " · tracks tagging" },
      ]));
      parts.explanation.innerHTML = confounding > polygenic
        ? "<strong>Here most inflation is LD-independent, so the intercept flags model failure.</strong> In a real scan, ancestry, relatedness, batch, and cryptic structure are candidates—not conclusions from λ alone."
        : "<strong>A large, clean polygenic study can have λ well above one.</strong> True signal grows with sample size and LD score; dividing all statistics by λ would erase biology. The intercept and slope separate the patterns conceptually.";
    }

    function renderPca() {
      const result = highDimensionalModel({ kind: "pca", separation, within });
      const points = result.points.map((point, index) => ({
        x: point.x, y: point.y, label: (point.group < 0 ? "group A" : "group B") + " sample " + (index + 1), tone: point.group < 0 ? "active" : "signal",
      }));
      parts.visual.replaceChildren(
        pointPlot(el, points, {
          label: "Principal-component scores for two sample groups", xLabel: "PC1 score", yLabel: "PC2 score",
          xMin: -4, xMax: 4, yMin: -2, yMax: 2,
        }),
        statusStrip(el, [
          { label: "PC1 variance share", value: percent(result.pc1Fraction, 1), tone: "signal" },
          { label: "group separation", value: separation.toFixed(2) },
          { label: "within-group spread", value: within.toFixed(2) },
          { label: "UMAP inter-cluster distance", value: "not metric" , tone: "warning" },
        ], "Linear variance versus embedding geometry")
      );
      parts.controls.replaceChildren(
        rangeControl(el, "Between-group separation", separation, { min: 0, max: 3, step: 0.1, format: (v) => v.toFixed(1) }, (v) => { separation = v; render(); }),
        rangeControl(el, "Within-group spread", within, { min: 0.1, max: 1, step: 0.05, format: (v) => v.toFixed(2) }, (v) => { within = v; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "matrix", value: "samples × standardised features" },
        { key: "PCA", value: "orthogonal directions of maximum variance" },
        { key: "scree", value: "how much each linear direction carries" },
        { key: "embedding caveat", value: "UMAP/t-SNE preserve local neighbours, not global metres" },
      ]));
      parts.explanation.innerHTML = "<strong>PCA axes have a linear variance interpretation; scree values quantify it.</strong> UMAP and t-SNE optimise neighbourhoods. Cluster separation on their page is algorithmic layout, so distances and empty gaps between clusters are not biological effect sizes.";
    }

    function renderShrinkage() {
      const subTabs = choiceRow(el, [
        { label: "p > n geometry", value: "rank" },
        { label: "count overdispersion", value: "counts" },
        { label: "shared shrinkage", value: "shared" },
      ], shrinkView, (v) => { shrinkView = v; render(); }, "High-dimensional failure mode");
      if (shrinkView === "counts") {
        const result = highDimensionalModel({ kind: "counts", mu: countMean, dispersion });
        parts.visual.replaceChildren(
          barBoard(el, [
            { label: "Poisson variance", value: result.poissonVariance, display: result.poissonVariance.toFixed(1), tone: "active" },
            { label: "negative-binomial variance", value: result.negativeBinomialVariance, display: result.negativeBinomialVariance.toFixed(1), tone: result.dispersion ? "signal" : "active" },
            { label: "extra biological variance", value: result.negativeBinomialVariance - result.poissonVariance, display: (result.negativeBinomialVariance - result.poissonVariance).toFixed(1), tone: result.dispersion ? "warning" : "muted" },
          ], "RNA-seq count variance", result.negativeBinomialVariance),
          statusStrip(el, [
            { label: "mean μ", value: result.mu.toFixed(1) },
            { label: "dispersion α", value: result.dispersion.toFixed(2) },
            { label: "NB variance", value: "μ + αμ²" },
          ], "Count-generating model")
        );
        parts.controls.replaceChildren(subTabs,
          rangeControl(el, "Mean read count", countMean, { min: 1, max: 200, step: 1, format: (v) => v.toFixed(0) }, (v) => { countMean = v; render(); }),
          rangeControl(el, "Dispersion", dispersion, { min: 0, max: 1, step: 0.01, format: (v) => v.toFixed(2) }, (v) => { dispersion = v; render(); })
        );
        parts.rail.replaceChildren(causalRail(el, [
          { key: "Poisson", value: "Var = μ = " + result.poissonVariance.toFixed(1) },
          { key: "sample heterogeneity", value: "αμ² = " + (result.negativeBinomialVariance - result.poissonVariance).toFixed(1) },
          { key: "negative binomial", value: "Var = " + result.negativeBinomialVariance.toFixed(1) },
          { key: "stabilise", value: "shrink noisy gene-wise dispersions toward a shared trend" },
        ]));
        parts.explanation.innerHTML = "<strong>Biological replicate counts are typically overdispersed: variance grows faster than the mean.</strong> A Poisson model treats real between-sample heterogeneity as signal. RNA-seq methods estimate gene-wise dispersion, then shrink the noisiest estimates toward a mean–variance trend.";
        return;
      }
      const result = highDimensionalModel({ kind: "shrinkage", n: sampleN, p: predictors, observed: 0.3, se: 0.15, priorSd: 0.08 });
      parts.visual.replaceChildren(
        statusStrip(el, [
          { label: "samples n", value: result.n },
          { label: "predictors p", value: result.p, tone: result.p > result.n ? "warning" : "active" },
          { label: "design rank ceiling", value: result.rankCeiling },
          { label: "unidentified directions", value: result.unidentifiedDirections, tone: result.unidentifiedDirections ? "warning" : "signal" },
        ], "Predictor geometry"),
        barBoard(el, [
          { label: "unpenalised coefficient fixture", value: Math.abs(result.observed), display: result.observed.toFixed(2), tone: "warning" },
          { label: "shrunken coefficient", value: Math.abs(result.shrunken), display: result.shrunken.toFixed(2), tone: "signal" },
        ], "Borrowing strength toward a shared prior", Math.abs(result.observed))
      );
      parts.controls.replaceChildren(subTabs,
        rangeControl(el, "Samples n", sampleN, { min: 10, max: 1000, step: 10, format: (v) => v.toFixed(0) }, (v) => { sampleN = v; render(); }),
        rangeControl(el, "Predictors p", predictors, { min: 10, max: 2000, step: 10, format: (v) => v.toFixed(0) }, (v) => { predictors = v; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "p > n", value: result.unidentifiedDirections + " coefficient directions fit equally" },
        { key: "constraint", value: "ridge / lasso / prior" },
        { key: "information sharing", value: "large, stable signals shrink less" },
        { key: "same architecture", value: "PGS weights and RNA-seq dispersions" },
      ]));
      parts.explanation.innerHTML = shrinkView === "shared"
        ? "<strong>Polygenic scores shrink millions of noisy effects; RNA-seq shrinks thousands of noisy dispersions.</strong> The biological objects differ, but both borrow strength from an ensemble because each feature alone is weakly estimated."
        : "<strong>When p exceeds n, the data matrix cannot identify every coefficient direction.</strong> An unpenalised perfect fit is available even under noise. Shrinkage adds information—a penalty or prior—to choose stable solutions rather than pretending the data supplied uniqueness.";
    }

    function renderWinner() {
      const result = highDimensionalModel({ kind: "winner", observed: observedEffect, se: winnerSe, priorSd: winnerPrior });
      parts.visual.replaceChildren(
        barBoard(el, [
          { label: "selected observed effect", value: Math.abs(result.observed), display: result.observed.toFixed(3), tone: "warning" },
          { label: "shrunken replication target", value: Math.abs(result.corrected), display: result.corrected.toFixed(3), tone: "signal" },
          { label: "observed β²", value: result.observedVariance, display: result.observedVariance.toFixed(4), tone: "warning" },
          { label: "shrunken β²", value: result.correctedVariance, display: result.correctedVariance.toFixed(4), tone: "signal" },
        ], "Selection inflation before and after squaring", Math.max(result.observedVariance, Math.abs(result.observed))),
        statusStrip(el, [
          { label: "shrinkage weight", value: result.shrinkage.toFixed(3) },
          { label: "effect inflation", value: result.corrected ? (result.observed / result.corrected).toFixed(2) + "×" : "∞" },
          { label: "variance inflation", value: compact(result.squaredInflation, 2) + "×", tone: "warning" },
        ], "Winner's-curse amplification")
      );
      parts.controls.replaceChildren(
        rangeControl(el, "Selected observed effect", observedEffect, { min: 0.02, max: 0.8, step: 0.01, format: (v) => v.toFixed(2) }, (v) => { observedEffect = v; render(); }),
        rangeControl(el, "Standard error", winnerSe, { min: 0.01, max: 0.3, step: 0.01, format: (v) => v.toFixed(2) }, (v) => { winnerSe = v; render(); }),
        rangeControl(el, "Prior effect SD", winnerPrior, { min: 0.01, max: 0.3, step: 0.01, format: (v) => v.toFixed(2) }, (v) => { winnerPrior = v; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "screen", value: "retain estimates that cross a threshold" },
        { key: "selected noise", value: "positive errors are over-represented" },
        { key: "replication", value: "effect regresses toward " + result.corrected.toFixed(3) },
        { key: "variance report", value: "squaring turns " + (result.corrected ? (result.observed / result.corrected).toFixed(2) : "∞") + "× into " + compact(result.squaredInflation, 2) + "×" },
      ]));
      parts.explanation.innerHTML = "<strong>A discovery threshold selects variants whose true effect plus noise happened to look large.</strong> Replication removes the selection event and effects shrink. Reporting β² or variance explained squares the same exaggeration; re-estimate in independent data.";
    }

    function render() {
      parts.tabHost.replaceChildren(tabs(el, modes, mode, (value) => { mode = value; render(); }));
      if (mode === "multiplicity") renderMultiplicity();
      else if (mode === "threshold") renderThreshold();
      else if (mode === "bh") renderBh();
      else if (mode === "qq") renderQq();
      else if (mode === "pca") renderPca();
      else if (mode === "shrinkage") renderShrinkage();
      else renderWinner();
    }

    predict(body, {
      widget: "high-dimensional-microscope",
      question: "A clean, very large polygenic GWAS has λ<sub>GC</sub> = 1.35. Does λ alone prove confounding?",
      hint: "Real polygenic signal can raise the median statistic, especially as sample size grows.",
      options: [
        { label: "Yes—every λ above 1 is bias" },
        { label: "No—separate LD-linked signal from the intercept", correct: true },
        { label: "Yes, unless the p-values are Bonferroni-corrected" },
        { label: "No—λ never contains information" },
      ],
    }, () => {
      mode = "qq";
      parts.instrument.hidden = false;
      render();
    });
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
