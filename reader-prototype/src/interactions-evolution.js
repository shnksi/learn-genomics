/* ── Hypothesis testing and molecular-evolution interaction wave ─────────
   Objective-mapped Hero Labs for S4 and Chapters 33–35A. The visual grammar
   keeps the null, historical event, or population boundary visible while the
   learner changes the evidence. Exact calculations are separated from chapter
   fixtures, schematic expected profiles, and model-dependent approximations.
   ───────────────────────────────────────────────────────────────────────── */

(function (global) {
  "use strict";

  const definitions = {};
  const models = {};
  const coverage = {};
  const kit = global.ReaderInteractionKit;
  if (!kit) throw new Error("ReaderInteractionKit must load before evolution labs");

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

  function probabilityThreshold(value) {
    return value > 0 && value < 0.001 ? value.toExponential(0) : String(value);
  }

  function sum(values) {
    return values.reduce((total, value) => total + value, 0);
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
      instrument: el("div", { class: "hero-lab evolution-lab", hidden: true }),
      tabHost: el("div"),
      visual: el("div", { class: "lab-visual evolution-visual" }),
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
    return '<svg class="lab-diagram evolution-diagram ' + (extraClass || "") +
      '" viewBox="' + (viewBox || "0 0 520 300") + '" role="img" aria-label="' +
      label.replace(/"/g, "&quot;") + '">' + html + "</svg>";
  }

  function svgKicker(lines) {
    return '<text class="lab-svg-kicker" text-anchor="middle">' + lines.map((line, index) =>
      '<tspan x="260" y="' + (index === 0 ? 22 : 48) + '">' + line + '</tspan>').join("") + '</text>';
  }

  function linePath(points, xScale, yScale) {
    return points.map((point, index) => (index ? "L" : "M") +
      xScale(point.x).toFixed(2) + " " + yScale(point.y).toFixed(2)).join(" ");
  }

  function chiSquareOneDfSurvival(value) {
    return 2 * (1 - normalCdf(Math.sqrt(Math.max(0, value))));
  }

  function powerOneDf(n, effect, alpha) {
    const delta = Math.sqrt(Math.max(1, n)) * Math.abs(effect);
    const critical = inverseNormal(1 - alpha / 2);
    return clamp(1 - normalCdf(critical - delta) + normalCdf(-critical - delta), 0, 1);
  }

  function hypothesisTestingModel(input) {
    if (input.kind === "hwe") {
      const observed = (input.observed || [166, 237, 100]).map((value) => Math.max(0, Math.round(value)));
      const n = sum(observed);
      const estimateP = input.estimateP !== false;
      const alleleP = estimateP ? (2 * observed[0] + observed[1]) / (2 * n) : clamp(input.p, 0.001, 0.999);
      const q = 1 - alleleP;
      const expected = [alleleP * alleleP * n, 2 * alleleP * q * n, q * q * n];
      const residuals = observed.map((value, index) => value - expected[index]);
      const statistic = observed.reduce((total, value, index) =>
        total + Math.pow(value - expected[index], 2) / Math.max(1e-12, expected[index]), 0);
      const df = 3 - 1 - (estimateP ? 1 : 0);
      const pValue = df === 1 ? chiSquareOneDfSurvival(statistic) : Math.exp(-statistic / 2);
      return {
        observed, expected, residuals, n, alleleP, statistic, df, pValue,
        estimatedParameters: estimateP ? 1 : 0,
        minimumExpected: Math.min(...expected),
        exactRequired: Math.min(...expected) < 5,
      };
    }

    if (input.kind === "power") {
      const n = Math.max(2, Math.round(input.n));
      const effect = clamp(Math.abs(input.effect), 0, 1);
      const alpha = clamp(input.alpha, 1e-12, 0.5);
      const criticalZ = inverseNormal(1 - alpha / 2);
      const noncentrality = n * effect * effect;
      const power = powerOneDf(n, effect, alpha);
      return { n, effect, alpha, criticalZ, noncentrality, power, beta: 1 - power };
    }

    if (input.kind === "baseRate") {
      const m = Math.max(1, Math.round(input.m));
      const prior = clamp(input.prior, 0, 1);
      const powerResult = hypothesisTestingModel({
        kind: "power", n: input.n, effect: input.effect, alpha: input.alpha,
      });
      const truePositive = m * prior * powerResult.power;
      const falsePositive = m * (1 - prior) * powerResult.alpha;
      const positivePredictiveValue = truePositive / Math.max(1e-12, truePositive + falsePositive);
      return Object.assign({}, powerResult, {
        m, prior, truePositive, falsePositive, positivePredictiveValue,
        falseDiscoveryFraction: 1 - positivePredictiveValue,
      });
    }

    if (input.kind === "histogram") {
      const profile = input.profile || "uniform";
      const fixtures = {
        uniform: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100],
        signal: [430, 180, 125, 105, 95, 90, 88, 86, 84, 82, 80, 78, 78, 76, 76, 74, 74, 72, 72, 70],
        inflated: [720, 270, 180, 140, 115, 100, 92, 86, 82, 78, 74, 72, 70, 68, 66, 64, 62, 60, 58, 56],
        conservative: [34, 45, 66, 92, 122, 145, 158, 170, 180, 186, 186, 180, 170, 158, 145, 122, 92, 66, 45, 34],
      };
      const descriptions = {
        uniform: "null calibrated: flat on [0,1]",
        signal: "mixture: a left spike over a flat null floor",
        inflated: "systematic null failure: broad excess near zero",
        conservative: "regularised or conservative: depleted tails, central bulge",
      };
      const bins = fixtures[profile] || fixtures.uniform;
      return { profile, bins: bins.slice(), total: sum(bins), description: descriptions[profile] };
    }

    if (input.kind === "multiplicity") {
      const loci = Math.max(1, Math.round(input.loci));
      const codings = Math.max(1, Math.round(input.codings));
      const populations = Math.max(1, Math.round(input.populations));
      const alpha = clamp(input.alpha, 1e-12, 0.5);
      const pathsPerLocus = codings * populations;
      const tests = loci * pathsPerLocus;
      return {
        loci, codings, populations, alpha, pathsPerLocus, tests,
        expectedFalsePositives: tests * alpha,
        perLocusFalsePositive: 1 - Math.pow(1 - alpha, pathsPerLocus),
        bonferroni: alpha / tests,
      };
    }

    throw new Error("Unknown hypothesis-testing model");
  }

  function jukesCantor(observed, length) {
    const p = clamp(observed, 0, 1);
    const saturated = p >= 0.75;
    const distance = saturated ? Infinity : -0.75 * Math.log(1 - 4 * p / 3);
    const variance = saturated ? Infinity : p * (1 - p) /
      (Math.max(1, length || 1) * Math.pow(1 - 4 * p / 3, 2));
    return { p, distance, variance, saturated };
  }

  function tajimaStatistic(n, segregatingSites, pi) {
    const sample = Math.max(3, Math.round(n));
    const s = Math.max(1, Math.round(segregatingSites));
    let a1 = 0;
    let a2 = 0;
    for (let index = 1; index < sample; index += 1) {
      a1 += 1 / index;
      a2 += 1 / (index * index);
    }
    const b1 = (sample + 1) / (3 * (sample - 1));
    const b2 = 2 * (sample * sample + sample + 3) / (9 * sample * (sample - 1));
    const c1 = b1 - 1 / a1;
    const c2 = b2 - (sample + 2) / (a1 * sample) + a2 / (a1 * a1);
    const e1 = c1 / a1;
    const e2 = c2 / (a1 * a1 + a2);
    const thetaW = s / a1;
    const variance = e1 * s + e2 * s * (s - 1);
    const d = (pi - thetaW) / Math.sqrt(Math.max(1e-12, variance));
    return { n: sample, s, pi, a1, a2, thetaW, variance, d };
  }

  function selectionEvidenceModel(input) {
    if (input.kind === "cancellation") {
      const n = Math.max(1, input.n);
      const mu = Math.max(0, input.mu);
      const entries = 2 * n * mu;
      const fixationProbability = 1 / (2 * n);
      return { n, mu, entries, fixationProbability, substitutionRate: entries * fixationProbability };
    }

    if (input.kind === "clock") {
      const mean = Math.max(1e-9, input.mean);
      const rateCv = Math.max(0, input.rateCv);
      const variance = mean + mean * mean * rateCv * rateCv;
      return { mean, rateCv, variance, dispersion: variance / mean };
    }

    if (input.kind === "driftBarrier") {
      const ne = Math.max(1, input.ne);
      const s = input.s;
      const strength = Math.abs(2 * ne * s);
      const regime = strength < 0.1 ? "effectively neutral" : strength > 10 ? "selection visible" : "drift–selection boundary";
      return { ne, s, strength, boundary: 1 / (2 * ne), regime };
    }

    if (input.kind === "distance") return jukesCantor(input.p, input.length);

    if (input.kind === "omega") {
      const nonsynonymous = jukesCantor(input.nonsynonymousChanges / input.nonsynonymousSites,
        input.nonsynonymousSites);
      const synonymous = jukesCantor(input.synonymousChanges / input.synonymousSites,
        input.synonymousSites);
      const omega = nonsynonymous.saturated || synonymous.saturated || synonymous.distance === 0 ?
        NaN : nonsynonymous.distance / synonymous.distance;
      return { nonsynonymous, synonymous, omega };
    }

    if (input.kind === "siteMixture") {
      const sites = Math.max(1, Math.round(input.sites));
      const positiveSites = clamp(Math.round(input.positiveSites), 0, sites);
      const positiveOmega = Math.max(0, input.positiveOmega);
      const backgroundOmega = Math.max(0, input.backgroundOmega);
      const geneWideOmega = (positiveSites * positiveOmega +
        (sites - positiveSites) * backgroundOmega) / sites;
      return { sites, positiveSites, positiveOmega, backgroundOmega, geneWideOmega };
    }

    if (input.kind === "tajima") return tajimaStatistic(input.n, input.s, input.pi);

    if (input.kind === "sfs") {
      const scenario = input.scenario || "neutral";
      const n = Math.max(6, Math.round(input.n || 10));
      const segregatingSites = Math.max(1, Math.round(input.segregatingSites || 16));
      const raw = [];
      for (let index = 1; index < n; index += 1) {
        let value = 1 / index;
        if (scenario === "expansion") value *= 1 + 100 * Math.exp(-(index - 1) / 0.2);
        if (scenario === "background") value *= 1 + 70 * Math.exp(-(index - 1) / 0.35);
        if (scenario === "sweep") value *= 1 + 500 * Math.exp(-(index - 1) / 0.2);
        if (scenario === "balancing") {
          value *= 1 + 30 * Math.exp(-Math.pow(index - n / 2, 2) / (2 * Math.pow(n / 10, 2)));
        }
        if (scenario === "sweep") {
          value += 10 * Math.exp(-Math.pow(index - 0.82 * n, 2) / (2 * Math.pow(n / 14, 2)));
        }
        raw.push({ x: index, y: value });
      }
      const rawTotal = sum(raw.map((point) => point.y));
      const bins = raw.map((point) => ({ x: point.x, y: segregatingSites * point.y / rawTotal }));
      const pi = bins.reduce((total, point) => total +
        2 * point.x * (n - point.x) / (n * (n - 1)) * point.y, 0);
      const statistic = tajimaStatistic(n, segregatingSites, pi);
      return { scenario, n, segregatingSites, bins, pi, statistic };
    }

    if (input.kind === "mk") {
      const dn = Math.max(0, input.dn);
      const ds = Math.max(0, input.ds);
      const pn = Math.max(0, input.pn);
      const ps = Math.max(0, input.ps);
      const alpha = dn * ps === 0 ? NaN : 1 - ds * pn / (dn * ps);
      const divergenceRatio = ds === 0 ? Infinity : dn / ds;
      const polymorphismRatio = ps === 0 ? Infinity : pn / ps;
      return { dn, ds, pn, ps, alpha, divergenceRatio, polymorphismRatio };
    }

    if (input.kind === "linked") {
      const scenario = input.scenario || "sweep";
      const points = [];
      for (let x = -50; x <= 50; x += 2) {
        const near = Math.exp(-Math.pow(x / 13, 2));
        let diversity = 1;
        let longHaplotype = 0.1;
        let highDerived = 0.05;
        if (scenario === "sweep") {
          diversity = 1 - 0.82 * near;
          longHaplotype = 0.12 + 0.82 * Math.exp(-Math.pow(x / 19, 2));
          highDerived = 0.06 + 0.68 * near;
        } else if (scenario === "soft") {
          diversity = 1 - 0.38 * Math.exp(-Math.pow(x / 17, 2));
          longHaplotype = 0.15 + 0.38 * Math.exp(-Math.pow(x / 21, 2));
          highDerived = 0.08 + 0.25 * near;
        } else if (scenario === "background") {
          diversity = 0.83 - 0.30 * Math.exp(-Math.pow(x / 27, 2));
          longHaplotype = 0.12 + 0.05 * near;
          highDerived = 0.06 + 0.06 * near;
        }
        points.push({ x, diversity, longHaplotype, highDerived });
      }
      return { scenario, points };
    }

    throw new Error("Unknown selection-evidence model");
  }

  function doubleFactorialBigInt(value) {
    let result = 1n;
    for (let current = BigInt(value); current > 1n; current -= 2n) result *= current;
    return result;
  }

  function scientificBigInt(value) {
    const digits = value.toString();
    if (digits.length <= 9) return Number(digits).toLocaleString("en-US");
    return digits[0] + "." + digits.slice(1, 3) + " × 10^" + (digits.length - 1);
  }

  function phylogenyInferenceModel(input) {
    if (input.kind === "topologies") {
      const n = clamp(Math.round(input.n), 3, 100);
      const unrooted = doubleFactorialBigInt(2 * n - 5);
      const rooted = doubleFactorialBigInt(2 * n - 3);
      return {
        n, unrooted, rooted,
        unrootedLabel: scientificBigInt(unrooted),
        rootedLabel: scientificBigInt(rooted),
        branches: 2 * n - 3,
      };
    }

    if (input.kind === "distance") return jukesCantor(input.q, input.length);

    if (input.kind === "longBranch") {
      const p = clamp(input.longChange, 0, 1);
      const q = clamp(input.internalChange, 0, 1);
      const truePattern = q;
      const misleadingPattern = p * p / 3;
      return {
        p, q, truePattern, misleadingPattern,
        winner: misleadingPattern > truePattern ? "wrong long-branch grouping" : "true internal split",
        ratio: misleadingPattern / Math.max(1e-12, truePattern),
      };
    }

    if (input.kind === "clock") {
      const sequenceLength = Math.max(10, Math.round(input.sequenceLength));
      const calibrationCv = Math.max(0, input.calibrationCv);
      const sequenceCv = 1 / Math.sqrt(sequenceLength * Math.max(1e-6, input.information || 0.02));
      const totalCv = Math.sqrt(sequenceCv * sequenceCv + calibrationCv * calibrationCv);
      return { sequenceLength, calibrationCv, sequenceCv, totalCv, asymptoticFloor: calibrationCv };
    }

    if (input.kind === "coalescent") {
      const n = Math.max(2, Math.round(input.n));
      const populationN = Math.max(1, input.populationN);
      const waits = [];
      for (let k = n; k >= 2; k -= 1) waits.push({ k, time: 4 * populationN / (k * (k - 1)) });
      const tmrca = 4 * populationN * (1 - 1 / n);
      const deepestFraction = waits[waits.length - 1].time / tmrca;
      const tau = Math.max(0, input.tau == null ? 1 : input.tau);
      return {
        n, populationN, waits, tmrca, deepestFraction, tau,
        discordantProbability: 2 / 3 * Math.exp(-tau),
        eachDiscordantProbability: 1 / 3 * Math.exp(-tau),
      };
    }

    if (input.kind === "patterson") {
      const abba = Math.max(0, input.abba);
      const baba = Math.max(0, input.baba);
      return { abba, baba, d: (abba - baba) / Math.max(1, abba + baba) };
    }

    throw new Error("Unknown phylogeny-inference model");
  }

  function genomeEvolutionModel(input) {
    if (input.kind === "duplication") {
      const mechanisms = {
        tandem: {
          label: "unequal crossing over / NAHR",
          copied: "gene plus neighbourhood",
          location: "adjacent, same orientation",
          signatures: ["introns retained", "promoter retained", "reciprocal deletion", "tandem synteny"],
        },
        retro: {
          label: "retrotransposition",
          copied: "processed mRNA only",
          location: "usually a new chromosome",
          signatures: ["no introns", "poly-A remnant", "target-site duplication", "promoter usually absent"],
        },
        wgd: {
          label: "whole-genome duplication",
          copied: "every chromosome at once",
          location: "doubled synteny blocks",
          signatures: ["genome-wide age cohort", "1:2 or 1:4 blocks", "complex dosage preserved", "rediploidisation"],
        },
      };
      return Object.assign({ mechanism: input.mechanism }, mechanisms[input.mechanism] || mechanisms.tandem);
    }

    if (input.kind === "fates") {
      const ne = Math.max(1, input.ne);
      const s = Math.max(0, input.s);
      const phi = Math.max(0, input.phi);
      const r = Math.max(0, input.r);
      const neoStrength = 4 * ne * s * phi;
      const pNeo = neoStrength / (neoStrength + 1);
      const pSub = 2 * r * r / Math.pow(1 + 2 * r, 2);
      return { ne, s, phi, r, neoStrength, pNeo, pSub };
    }

    if (input.kind === "ks") {
      const ks = Math.max(0, input.ks);
      const rate = Math.max(1e-15, input.rate);
      const ageYears = ks / (2 * rate);
      const backgroundAtPoint = Math.max(0, input.backgroundBase || 900) *
        Math.pow(0.5, Math.max(0, ks - 0.1) / Math.max(1e-9, input.halvingKs || 0.1));
      const observedAtPoint = Math.max(0, input.observedAtPoint || 3300);
      const peakAmplitude = Math.max(0, observedAtPoint - backgroundAtPoint);
      const points = [];
      for (let x = 0.05; x <= 1.2 + 1e-9; x += 0.05) {
        const background = (input.backgroundBase || 900) *
          Math.pow(0.5, Math.max(0, x - 0.1) / Math.max(1e-9, input.halvingKs || 0.1));
        const peak = peakAmplitude * Math.exp(-Math.pow((x - ks) / 0.075, 2) / 2);
        points.push({ x, background, total: background + peak });
      }
      return {
        ks, rate, ageYears, backgroundAtPoint, observedAtPoint,
        excess: observedAtPoint / Math.max(1e-12, backgroundAtPoint),
        saturated: ks >= 1.5, points,
      };
    }

    if (input.kind === "hazard") {
      const ne = Math.max(1, input.ne);
      const mutationRate = Math.max(1e-15, input.mutationRate);
      const criticalPositions = Math.max(0, input.criticalPositions);
      const selection = -mutationRate * criticalPositions;
      const strength = Math.abs(ne * selection);
      return {
        ne, mutationRate, criticalPositions, selection, strength,
        detectablePositions: 1 / (ne * mutationRate),
        visible: strength >= 1,
      };
    }

    if (input.kind === "pangenome") {
      const alpha = Math.max(0.01, input.alpha);
      const genomes = Math.max(1, Math.round(input.genomes));
      const k = Math.max(0, input.k);
      const initial = Math.max(0, input.initial);
      const total = Math.abs(alpha - 1) < 1e-9 ? initial + k * Math.log(genomes) :
        initial + k * (Math.pow(genomes, 1 - alpha) - 1) / (1 - alpha);
      const newGenes = k * Math.pow(genomes, -alpha);
      return { alpha, genomes, k, initial, total, newGenes, open: alpha < 1 };
    }

    if (input.kind === "pseudoorthology") {
      const q = clamp(input.singleCopyProbability, 0, 1);
      return { singleCopyProbability: q, reciprocalLossProbability: q * q / 2 };
    }

    throw new Error("Unknown genome-evolution model");
  }

  function speciationBoundaryModel(input) {
    if (input.kind === "concept") {
      const scenario = input.scenario || "hybridising";
      const concept = input.concept || "biological";
      const outcomes = {
        asexual: {
          biological: ["no answer", "interbreeding has no referent"],
          phylogenetic: ["lineages diagnosable", "tree operation works"],
          cluster: ["no answer", "requires sympatric sexual forms"],
        },
        fossil: {
          biological: ["no answer", "the cross cannot be performed"],
          phylogenetic: ["smallest diagnosable lineage", "characters place the specimen"],
          cluster: ["no answer", "no sympatric genotype distribution"],
        },
        allopatric: {
          biological: ["untestable", "potential interbreeding is counterfactual"],
          phylogenetic: ["split if diagnosable", "sequencing depth sets the scale"],
          cluster: ["no answer", "sympatry is required"],
        },
        hybridising: {
          biological: ["ambiguous", "some gene flow crosses the boundary"],
          phylogenetic: ["unstable split", "locus trees can disagree"],
          cluster: ["two species if bimodal", "few intermediates means clusters persist"],
        },
      };
      const result = (outcomes[scenario] || outcomes.hybridising)[concept];
      return { scenario, concept, outcome: result[0], boundary: result[1] };
    }

    if (input.kind === "barriers") {
      const barriers = (input.barriers || []).map((value) => clamp(value, 0, 1));
      let remaining = 1;
      const contributions = barriers.map((barrier) => {
        const contribution = remaining * barrier;
        remaining *= 1 - barrier;
        return contribution;
      });
      return { barriers, contributions, remaining, isolation: 1 - remaining };
    }

    if (input.kind === "dmi") {
      const substitutions = Math.max(0, Math.round(input.substitutions));
      const left = clamp(Math.round(input.left == null ? substitutions / 2 : input.left), 0, substitutions);
      const right = substitutions - left;
      const probability = clamp(input.probability, 0, 1);
      const untestedPairs = left * right;
      return { substitutions, left, right, probability, untestedPairs, expected: probability * untestedPairs };
    }

    if (input.kind === "haldane") {
      const dominance = clamp(input.dominance, 0, 1);
      return {
        dominance,
        heterogameticCost: 1,
        homogameticCost: 2 * dominance,
        rulePredicted: 2 * dominance < 1,
      };
    }

    if (input.kind === "cline") {
      const sigma = Math.max(1e-9, input.sigma);
      const width = Math.max(1e-9, input.width);
      const constants = { bazykin: 8, barton: 6.25, ecotone: 2.89 };
      const constant = constants[input.model] || constants.bazykin;
      const selection = constant * Math.pow(sigma / width, 2);
      const points = [];
      for (let x = -20; x <= 20; x += 1) {
        points.push({ x, p: 1 / (1 + Math.exp(4 * x / width)) });
      }
      return { sigma, width, model: input.model, constant, selection, points };
    }

    if (input.kind === "patterson") {
      const abba = Math.max(0, input.abba);
      const baba = Math.max(0, input.baba);
      return { abba, baba, d: (abba - baba) / Math.max(1, abba + baba) };
    }

    if (input.kind === "transplant") {
      const aa = input.aa;
      const ab = input.ab;
      const ba = input.ba;
      const bb = input.bb;
      return {
        aa, ab, ba, bb,
        localAtA: aa > ba,
        localAtB: bb > ab,
        locallyAdapted: aa > ba && bb > ab,
        homeAwayA: aa > ab,
        homeAwayB: bb > ba,
      };
    }

    if (input.kind === "conservation") {
      const males = Math.max(1, Math.round(input.males));
      const females = Math.max(1, Math.round(input.females));
      const ne = 4 * males * females / (males + females);
      const inbreedingRate = 1 / (2 * ne);
      const migrants = Math.max(0, input.migrants || 0);
      return { males, females, ne, inbreedingRate, nem: ne * migrants / (males + females) };
    }

    throw new Error("Unknown speciation-boundary model");
  }

  models.hypothesisTesting = hypothesisTestingModel;
  models.selectionEvidence = selectionEvidenceModel;
  models.phylogenyInference = phylogenyInferenceModel;
  models.genomeEvolution = genomeEvolutionModel;
  models.speciationBoundary = speciationBoundaryModel;

  function hweResidualSvg(result) {
    const labels = ["AA", "Aa", "aa"];
    const maximum = Math.max(...result.observed, ...result.expected) * 1.12;
    const y = (value) => 232 - value / maximum * 176;
    let html = '<path class="evo-axis" d="M58 232 H478 M58 42 V232"/>' +
      '<text class="lab-svg-kicker" x="58" y="22">observed bars · expected outlines</text>';
    labels.forEach((label, index) => {
      const x = 115 + index * 135;
      const observedY = y(result.observed[index]);
      const expectedY = y(result.expected[index]);
      html += '<rect class="evo-observed" x="' + (x - 25) + '" y="' + observedY.toFixed(2) +
        '" width="50" height="' + (232 - observedY).toFixed(2) + '"/>' +
        '<rect class="evo-expected" x="' + (x - 31) + '" y="' + expectedY.toFixed(2) +
        '" width="62" height="' + (232 - expectedY).toFixed(2) + '"/>' +
        '<path class="evo-residual" d="M' + (x + 38) + ' ' + observedY.toFixed(2) + ' V' + expectedY.toFixed(2) + '"/>' +
        '<text class="lab-svg-label" x="' + x + '" y="258" text-anchor="middle">' + label + '</text>' +
        '<text class="lab-svg-label" x="' + x + '" y="' + Math.max(40, Math.min(observedY, expectedY) - 10).toFixed(2) +
        '" text-anchor="middle">' + result.observed[index] + ' / ' + result.expected[index].toFixed(1) + '</text>';
    });
    return textSvg(html,
      "Hardy-Weinberg goodness-of-fit chart. Observed counts " + result.observed.join(", ") +
      "; expected counts " + result.expected.map((value) => value.toFixed(2)).join(", ") +
      "; chi-square " + result.statistic.toFixed(4) + " on " + result.df + " degrees of freedom.",
      "0 0 520 275", "evo-hwe");
  }

  function baseRateBoard(el, result) {
    const trueTiles = Math.round(100 * result.positivePredictiveValue);
    return el("div", {
      class: "evo-outcome-board",
      role: "img",
      "aria-label": "Among flagged results, " + percent(result.positivePredictiveValue, 1) +
        " are true positives and " + percent(result.falseDiscoveryFraction, 1) + " are false positives.",
    }, [
      el("div", { class: "evo-outcome-grid", "aria-hidden": "true" },
        Array.from({ length: 100 }, (_, index) => el("i", {
          class: index < trueTiles ? "is-true" : "is-false",
        }))),
      statusStrip(el, [
        { label: "true positives", value: compact(result.truePositive, 0), tone: "active" },
        { label: "false positives", value: compact(result.falsePositive, 0), tone: "warning" },
        { label: "P(real | flagged)", value: percent(result.positivePredictiveValue, 1), tone: "signal" },
      ], "Base-rate composition of flagged results"),
    ]);
  }

  function powerSvg(result) {
    const delta = Math.sqrt(result.noncentrality);
    const xmax = Math.max(4.5, delta + 3.5);
    const xScale = (value) => 58 + (value + 4) / (xmax + 4) * 414;
    const yScale = (value) => 226 - value / 0.42 * 170;
    const normalPdf = (value, centre) => Math.exp(-0.5 * Math.pow(value - centre, 2)) / Math.sqrt(2 * Math.PI);
    const nullPoints = [];
    const altPoints = [];
    for (let x = -4; x <= xmax + 1e-9; x += (xmax + 4) / 90) {
      nullPoints.push({ x, y: normalPdf(x, 0) });
      altPoints.push({ x, y: normalPdf(x, delta) });
    }
    const criticalX = xScale(result.criticalZ);
    const html = '<path class="evo-axis" d="M58 226 H472 M58 38 V226"/>' +
      '<path class="evo-null-line" d="' + linePath(nullPoints, xScale, (point) => yScale(point)) + '"/>' +
      '<path class="evo-alt-line" d="' + linePath(altPoints, xScale, (point) => yScale(point)) + '"/>' +
      '<path class="evo-critical-line" d="M' + criticalX.toFixed(2) + ' 38 V226"/>' +
      '<text class="lab-svg-kicker" x="58" y="20">sampling distributions of √N·F̂</text>' +
      '<text class="evo-null-label" x="' + xScale(0).toFixed(2) + '" y="66" text-anchor="middle">null</text>' +
      '<text class="evo-alt-label" x="' + xScale(delta).toFixed(2) + '" y="91" text-anchor="middle">true F</text>' +
      '<text class="lab-svg-label" x="' + clamp(criticalX + 8, 68, 432).toFixed(2) + '" y="214">reject tail</text>';
    return textSvg(html,
      "Null and alternative sampling distributions. Critical z " + result.criticalZ.toFixed(3) +
      ", noncentrality " + result.noncentrality.toFixed(3) + ", power " + percent(result.power, 1) + ".",
      "0 0 520 255", "evo-power");
  }

  function histogramSvg(result) {
    const maximum = Math.max(...result.bins) * 1.08;
    const width = 390 / result.bins.length;
    let html = '<path class="evo-axis" d="M64 226 H468 M64 34 V226"/>' +
      '<path class="evo-uniform-line" d="M64 ' + (226 - (result.total / result.bins.length) / maximum * 180).toFixed(2) +
      ' H468"/>' + svgKicker(["p-value diagnostic", "chapter-shaped fixtures"]);
    result.bins.forEach((count, index) => {
      const height = count / maximum * 180;
      html += '<rect class="evo-hist-bar" x="' + (70 + index * width).toFixed(2) + '" y="' +
        (226 - height).toFixed(2) + '" width="' + Math.max(2, width - 2).toFixed(2) + '" height="' +
        height.toFixed(2) + '"/>';
    });
    html += '<text class="lab-svg-label" x="70" y="250">0</text>' +
      '<text class="lab-svg-label" x="460" y="250" text-anchor="end">p = 1</text>';
    return textSvg(html, "P-value histogram: " + result.description + ".", "0 0 520 265", "evo-histogram");
  }

  function forkingBoard(el, result) {
    return el("div", {
      class: "evo-fork-board",
      role: "img",
      "aria-label": result.loci + " loci times " + result.codings + " codings times " +
        result.populations + " populations equals " + result.tests + " reachable tests.",
    }, [
      el("div", { class: "evo-fork-stage" }, [el("span", { text: "loci" }), el("strong", { text: compact(result.loci, 0) })]),
      el("span", { class: "evo-fork-op", text: "×" }),
      el("div", { class: "evo-fork-stage is-choice" }, [el("span", { text: "codings" }), el("strong", { text: result.codings })]),
      el("span", { class: "evo-fork-op", text: "×" }),
      el("div", { class: "evo-fork-stage is-choice" }, [el("span", { text: "populations" }), el("strong", { text: result.populations })]),
      el("span", { class: "evo-fork-op", text: "=" }),
      el("div", { class: "evo-fork-stage is-result" }, [el("span", { text: "analysis universe" }), el("strong", { text: compact(result.tests, 0) })]),
    ]);
  }

  function cancellationSvg(result) {
    const entryWidth = clamp(70 + 32 * Math.log10(Math.max(1, result.n)), 90, 255);
    const fixWidth = clamp(255 - 32 * Math.log10(Math.max(1, result.n)), 36, 220);
    const html = svgKicker(["neutral substitution", "two N-dependent terms cancel exactly"]) +
      '<rect class="evo-cancel-entry" x="54" y="66" width="' + entryWidth.toFixed(2) + '" height="58"/>' +
      '<text class="lab-svg-label" x="66" y="88">mutations entering</text>' +
      '<text class="evo-value-label" x="66" y="112">2Nμ = ' + compact(result.entries, 3) + '</text>' +
      '<text class="evo-cancel-times" x="260" y="174" text-anchor="middle">×</text>' +
      '<rect class="evo-cancel-fix" x="' + (466 - fixWidth).toFixed(2) + '" y="66" width="' + fixWidth.toFixed(2) + '" height="58"/>' +
      '<text class="lab-svg-label" x="454" y="88" text-anchor="end">chance each fixes</text>' +
      '<text class="evo-value-label" x="454" y="112" text-anchor="end">1/2N = ' + compact(result.fixationProbability, 3) + '</text>' +
      '<path class="evo-cancel-arrow" d="M92 154 H428"/>' +
      '<path class="evo-cancel-arrowhead" d="M428 154 l-12 -8 v16 z"/>' +
      '<rect class="evo-cancel-result" x="132" y="184" width="256" height="62"/>' +
      '<text class="lab-svg-label" x="260" y="207" text-anchor="middle">neutral substitutions / generation</text>' +
      '<text class="evo-result-label" x="260" y="234" text-anchor="middle">k = μ = ' + compact(result.substitutionRate, 3) + '</text>';
    return textSvg(html,
      "A population of " + compact(result.n, 0) + " diploids receives " + compact(result.entries, 4) +
      " neutral mutations per generation; each fixes with probability " + compact(result.fixationProbability, 4) +
      "; their product is " + compact(result.substitutionRate, 4) + ".",
      "0 0 520 270", "evo-cancellation");
  }

  function jcCurveSvg(result) {
    const xScale = (value) => 58 + value / 0.8 * 412;
    const yScale = (value) => 228 - clamp(value, 0, 3.2) / 3.2 * 164;
    const points = [];
    for (let p = 0; p <= 0.742; p += 0.008) points.push({ x: p, y: jukesCantor(p, 1000).distance });
    const dotX = xScale(Math.min(result.p, 0.75));
    const dotY = yScale(result.saturated ? 3.2 : result.distance);
    const html = '<path class="evo-axis" d="M58 228 H470 M58 58 V228"/>' +
      '<path class="evo-jc-line" d="' + linePath(points, xScale, yScale) + '"/>' +
      '<path class="evo-saturation-line" d="M' + xScale(0.75).toFixed(2) + ' 58 V228"/>' +
      '<circle class="evo-focus-dot" cx="' + dotX.toFixed(2) + '" cy="' + dotY.toFixed(2) + '" r="7"/>' +
      svgKicker(["hidden substitutions accumulate", "as p approaches the 0.75 ceiling"]) +
      '<text class="lab-svg-label" x="58" y="252">observed p-distance</text>' +
      '<text class="lab-svg-label" x="' + (xScale(0.75) - 7).toFixed(2) + '" y="82" text-anchor="end">signal ceiling</text>';
    return textSvg(html,
      result.saturated ? "Observed difference is at or above 0.75, so Jukes-Cantor distance is not identifiable from p-distance." :
        "Observed difference " + result.p.toFixed(3) + " corresponds to Jukes-Cantor distance " +
        result.distance.toFixed(3) + " substitutions per site.",
      "0 0 520 270", "evo-jc");
  }

  function omegaBoard(el, result, counts) {
    return el("div", { class: "evo-opportunity-board" }, [
      el("div", { class: "evo-opportunity is-n" }, [
        el("span", { text: "nonsynonymous" }),
        el("strong", { text: counts.nonsynonymousChanges + " / " + counts.nonsynonymousSites }),
        el("b", { text: "dN " + (result.nonsynonymous.saturated ? "not identifiable" : result.nonsynonymous.distance.toFixed(4)) }),
      ]),
      el("div", { class: "evo-opportunity-divider", text: "÷" }),
      el("div", { class: "evo-opportunity is-s" }, [
        el("span", { text: "synonymous" }),
        el("strong", { text: counts.synonymousChanges + " / " + counts.synonymousSites }),
        el("b", { text: "dS " + (result.synonymous.saturated ? "not identifiable" : result.synonymous.distance.toFixed(4)) }),
      ]),
      el("div", { class: "evo-opportunity-result" }, [
        el("span", { text: "ω = dN / dS" }),
        el("strong", { text: Number.isFinite(result.omega) ? result.omega.toFixed(3) : "not identifiable" }),
      ]),
    ]);
  }

  function sfsSvg(result) {
    const maximum = Math.max(...result.bins.map((point) => point.y)) * 1.08;
    const xScale = (value) => 62 + (value - 1) / Math.max(1, result.n - 2) * 400;
    const yScale = (value) => 226 - value / maximum * 180;
    let html = '<path class="evo-axis" d="M58 226 H470 M58 48 V226"/>' +
      svgKicker(["site-frequency spectrum", "derived allele count i"]);
    result.bins.forEach((point) => {
      const width = Math.max(4, 350 / result.bins.length);
      html += '<rect class="evo-sfs-bar" x="' + (xScale(point.x) - width / 2).toFixed(2) + '" y="' +
        yScale(point.y).toFixed(2) + '" width="' + width.toFixed(2) + '" height="' +
        (226 - yScale(point.y)).toFixed(2) + '"/>';
    });
    html += '<text class="lab-svg-label" x="62" y="250">rare</text>' +
      '<text class="lab-svg-label" x="462" y="250" text-anchor="end">high-frequency derived</text>';
    return textSvg(html, result.scenario + " site-frequency spectrum fixture.", "0 0 520 265", "evo-sfs");
  }

  function mkBoard(el, result) {
    return el("div", {
      class: "evo-matrix",
      role: "table",
      "aria-label": "McDonald-Kreitman table. Nonsynonymous fixed " + result.dn +
        ", nonsynonymous polymorphic " + result.pn + ", synonymous fixed " + result.ds +
        ", synonymous polymorphic " + result.ps + ". Alpha " + result.alpha.toFixed(3) + ".",
    }, [
      el("div", { class: "evo-matrix-cell is-corner", text: "effect × status" }),
      el("div", { class: "evo-matrix-cell is-head", text: "fixed" }),
      el("div", { class: "evo-matrix-cell is-head", text: "polymorphic" }),
      el("div", { class: "evo-matrix-cell is-head", text: "nonsynonymous" }),
      el("div", { class: "evo-matrix-cell is-value", text: String(result.dn) }),
      el("div", { class: "evo-matrix-cell is-value", text: String(result.pn) }),
      el("div", { class: "evo-matrix-cell is-head", text: "synonymous" }),
      el("div", { class: "evo-matrix-cell is-value", text: String(result.ds) }),
      el("div", { class: "evo-matrix-cell is-value", text: String(result.ps) }),
      el("div", { class: "evo-matrix-result" }, [
        el("span", { text: "adaptive fraction α" }), el("strong", { text: result.alpha.toFixed(3) }),
      ]),
    ]);
  }

  function linkedProfileSvg(result) {
    const xScale = (value) => 58 + (value + 50) / 100 * 412;
    const yScale = (value) => 226 - value * 154;
    const diversity = result.points.map((point) => ({ x: point.x, y: point.diversity }));
    const haplotype = result.points.map((point) => ({ x: point.x, y: point.longHaplotype }));
    const derived = result.points.map((point) => ({ x: point.x, y: point.highDerived }));
    const html = '<path class="evo-axis" d="M58 226 H470 M58 62 V226"/>' +
      '<path class="evo-diversity-line" d="' + linePath(diversity, xScale, yScale) + '"/>' +
      '<path class="evo-haplotype-line" d="' + linePath(haplotype, xScale, yScale) + '"/>' +
      '<path class="evo-derived-line" d="' + linePath(derived, xScale, yScale) + '"/>' +
      '<path class="evo-centre-line" d="M264 62 V226"/>' +
      svgKicker(["schematic linked evidence", "around the focal site"]) +
      '<text class="evo-diversity-label" x="66" y="84">diversity</text>' +
      '<text class="evo-haplotype-label" x="66" y="115">long haplotype</text>' +
      '<text class="evo-derived-label" x="66" y="146">high-derived alleles</text>' +
      '<text class="lab-svg-label" x="58" y="250">− distance</text>' +
      '<text class="lab-svg-label" x="470" y="250" text-anchor="end">+ distance</text>';
    return textSvg(html, result.scenario + " linked-selection signature with diversity, long-haplotype, and high-derived-allele profiles.",
      "0 0 520 265", "evo-linked");
  }

  function treeSvg(rotation, rootPosition) {
    const aY = rotation === "rotated" ? 100 : 62;
    const bY = rotation === "rotated" ? 62 : 100;
    const rootX = rootPosition === "outgroup" ? 92 : rootPosition === "midpoint" ? 255 : 178;
    const html = '<path class="evo-tree-edge" d="M92 170 H178 M178 81 V218 M178 81 H278 M278 ' + aY +
      ' V' + bY + ' M278 ' + aY + ' H390 M278 ' + bY + ' H390 M178 170 H330 M330 170 V218 M330 218 H390 M92 170 V258 H390"/>' +
      '<circle class="evo-tree-node" cx="178" cy="81" r="6"/><circle class="evo-tree-node" cx="278" cy="81" r="6"/>' +
      '<circle class="evo-root" cx="' + rootX + '" cy="170" r="10"/>' +
      '<text class="evo-tip-label" x="492" y="' + (aY + 5) + '" text-anchor="end">A</text>' +
      '<text class="evo-tip-label" x="492" y="' + (bY + 5) + '" text-anchor="end">B</text>' +
      '<text class="evo-tip-label" x="492" y="175" text-anchor="end">C</text>' +
      '<text class="evo-tip-label" x="492" y="223" text-anchor="end">D</text>' +
      '<text class="evo-tip-label" x="492" y="263" text-anchor="end">outgroup</text>' +
      svgKicker(["node rotation changes the drawing", "the split {A,B} stays the same"]);
    return textSvg(html,
      "A rooted tree in which A and B form a clade. Their display order is " + rotation +
      "; the marked root is placed by " + rootPosition + ".",
      "0 0 520 285", "evo-tree");
  }

  function alignmentBoard(el, defect) {
    const rows = defect === "clean" ? [
      ["human α", "ACGT-CTGACC"], ["mouse α", "ACGT-CTGACT"], ["fish α", "ACGT-CTAACC"],
    ] : defect === "paralog" ? [
      ["human α", "ACGT-CTGACC"], ["mouse β", "ATGAAC-GTCC"], ["fish α", "ACGT-CTAACC"],
    ] : [
      ["human α", "ACGTCT-GACC"], ["mouse α", "ACG-TCTGACT"], ["fish α", "ACGT--TAACC"],
    ];
    return el("div", {
      class: "evo-alignment " + (defect === "clean" ? "is-clean" : "is-defect"),
      role: "img",
      "aria-label": defect + " input alignment. " + rows.map((row) => row.join(" ")).join(". "),
    }, rows.map((row) => el("div", { class: "evo-alignment-row" }, [
      el("span", { text: row[0] }), el("code", { text: row[1] }),
    ])));
  }

  function longBranchSvg(result, method) {
    const methodLabel = method === "misspecified ML" ? "wrong-model ML" : method;
    const html = '<path class="evo-tree-edge is-long" d="M252 144 L92 62 M252 144 L428 62"/>' +
      '<path class="evo-tree-edge" d="M252 144 L132 232 M252 144 L388 232"/>' +
      '<circle class="evo-tree-node" cx="252" cy="144" r="7"/>' +
      '<text class="evo-tip-label" x="92" y="82" text-anchor="middle">A · long</text>' +
      '<text class="evo-tip-label" x="428" y="82" text-anchor="middle">C · long</text>' +
      '<text class="evo-tip-label" x="116" y="252" text-anchor="end">B</text>' +
      '<text class="evo-tip-label" x="404" y="252">D</text>' +
      '<path class="evo-wrong-link" d="M104 96 Q260 44 416 96"/>' +
      svgKicker([methodLabel + ": repeated change", "can mimic shared history"]) +
      '<text class="evo-warning-label" x="260" y="112" text-anchor="middle">misleading A+C pattern ' +
        result.misleadingPattern.toFixed(3) + '</text>' +
      '<text class="lab-svg-label" x="260" y="282" text-anchor="middle">true internal pattern ' +
        result.truePattern.toFixed(3) + '</text>';
    return textSvg(html,
      "Long-branch fixture. True split pattern frequency " + result.truePattern.toFixed(3) +
      "; misleading parallel-change pattern frequency " + result.misleadingPattern.toFixed(3) +
      "; " + result.winner + " is more frequent.",
      "0 0 520 300", "evo-long-branch");
  }

  function uncertaintySvg(result) {
    const max = Math.max(0.01, result.totalCv);
    const seqWidth = 330 * result.sequenceCv / max;
    const calWidth = 330 * result.calibrationCv / max;
    const html = svgKicker(["date uncertainty: sequence shrinks", "the calibration floor remains"]) +
      '<text class="lab-svg-label" x="58" y="82">sequence likelihood</text>' +
      '<rect class="evo-uncertainty-track" x="58" y="94" width="350" height="34"/>' +
      '<rect class="evo-uncertainty-seq" x="58" y="94" width="' + seqWidth.toFixed(2) + '" height="34"/>' +
      '<text class="evo-value-label" x="424" y="117">' + percent(result.sequenceCv, 1) + '</text>' +
      '<text class="lab-svg-label" x="58" y="166">calibration prior</text>' +
      '<rect class="evo-uncertainty-track" x="58" y="178" width="350" height="34"/>' +
      '<rect class="evo-uncertainty-cal" x="58" y="178" width="' + calWidth.toFixed(2) + '" height="34"/>' +
      '<text class="evo-value-label" x="424" y="201">' + percent(result.calibrationCv, 1) + '</text>' +
      '<text class="evo-result-label" x="58" y="252">combined width ' + percent(result.totalCv, 1) +
      ' · floor ' + percent(result.asymptoticFloor, 1) + '</text>';
    return textSvg(html,
      "Sequence uncertainty " + percent(result.sequenceCv, 1) + ", calibration uncertainty " +
      percent(result.calibrationCv, 1) + ", combined " + percent(result.totalCv, 1) +
      ", asymptotic floor " + percent(result.asymptoticFloor, 1) + ".",
      "0 0 520 275", "evo-uncertainty");
  }

  function coalescentSvg(result) {
    const displayed = result.waits.slice(-Math.min(9, result.waits.length));
    const maximum = Math.max(...displayed.map((row) => row.time));
    const width = 360 / displayed.length;
    let html = '<path class="evo-axis" d="M70 226 H466 M70 48 V226"/>' +
      svgKicker(["expected waiting time", "while k lineages remain"]);
    displayed.forEach((row, index) => {
      const height = row.time / maximum * 168;
      html += '<rect class="evo-coal-bar' + (row.k === 2 ? ' is-deepest' : '') + '" x="' +
        (82 + index * width).toFixed(2) + '" y="' + (226 - height).toFixed(2) + '" width="' +
        Math.max(8, width - 5).toFixed(2) + '" height="' + height.toFixed(2) + '"/>' +
        '<text class="lab-svg-label" x="' + (82 + index * width + Math.max(8, width - 5) / 2).toFixed(2) +
        '" y="250" text-anchor="middle">' + row.k + '</text>';
    });
    return textSvg(html,
      "Coalescent waiting times for a sample of " + result.n + ". Expected time to MRCA " +
      compact(result.tmrca, 0) + " generations; the final two-lineage interval is " +
      percent(result.deepestFraction, 1) + " of that time.",
      "0 0 520 270", "evo-coalescent");
  }

  function duplicationBoard(el, result) {
    const tracks = result.mechanism === "tandem" ? [
      ["parent", "gene", "gene"], ["reciprocal", "gene", "gap"],
    ] : result.mechanism === "retro" ? [
      ["source", "exon", "intron", "exon"], ["insert", "exon", "poly-A", "TSD"],
    ] : [
      ["genome A", "1", "2", "3", "4"], ["genome B", "1′", "2′", "3′", "4′"],
    ];
    return el("div", {
      class: "evo-duplication-board is-" + result.mechanism,
      role: "img",
      "aria-label": result.label + ". " + result.copied + ". " + result.location +
        ". Signatures: " + result.signatures.join(", ") + ".",
    }, [
      el("div", { class: "evo-genome-tracks", "aria-hidden": "true" }, tracks.map((track) =>
        el("div", { class: "evo-genome-track" }, track.map((item, index) =>
          el(index ? "i" : "span", { class: index ? "" : "evo-track-label", text: item }))))),
      processBoard(el, result.signatures.map((signature, index) => ({
        label: index === 0 ? "signature" : "plus", value: signature,
        tone: index === 0 ? "active" : index === 3 ? "signal" : "",
      })), result.label + " structural evidence"),
    ]);
  }

  function fateBoard(el, result) {
    return el("div", { class: "evo-fate-board" }, [
      el("div", { class: "evo-fate-race", role: "img", "aria-label":
        "Neofunctionalisation probability " + percent(result.pNeo, 1) +
        "; subfunctionalisation probability " + percent(result.pSub, 1) + "." }, [
        el("div", { class: "evo-fate-lane is-neo" }, [
          el("span", { text: "adaptive new function" }),
          el("strong", { text: percent(result.pNeo, 1) }),
          el("i", { style: "width:" + percent(result.pNeo, 2) }),
          el("b", { text: "depends on 4Nₑsφ" }),
        ]),
        el("div", { class: "evo-fate-lane is-sub" }, [
          el("span", { text: "complementary decay · DDC" }),
          el("strong", { text: percent(result.pSub, 1) }),
          el("i", { style: "width:" + percent(result.pSub, 2) }),
          el("b", { text: "independent of Nₑ" }),
        ]),
      ]),
      statusStrip(el, [
        { label: "4Nₑsφ", value: compact(result.neoStrength, 3), tone: "active" },
        { label: "P(neo)", value: percent(result.pNeo, 1) },
        { label: "P(sub)", value: percent(result.pSub, 1), tone: "signal" },
      ], "Competing duplicate-preservation routes"),
    ]);
  }

  function ksHistogramSvg(result) {
    const maximum = Math.max(...result.points.map((point) => point.total)) * 1.05;
    const xScale = (value) => 58 + value / 1.2 * 412;
    const yScale = (value) => 228 - value / maximum * 156;
    const totalPath = linePath(result.points.map((point) => ({ x: point.x, y: point.total })), xScale, yScale);
    const backgroundPath = linePath(result.points.map((point) => ({ x: point.x, y: point.background })), xScale, yScale);
    const html = '<path class="evo-axis" d="M58 228 H470 M58 62 V228"/>' +
      '<path class="evo-ks-background" d="' + backgroundPath + '"/>' +
      '<path class="evo-ks-total" d="' + totalPath + '"/>' +
      '<path class="evo-ks-pin" d="M' + xScale(result.ks).toFixed(2) + ' 62 V228"/>' +
      svgKicker(["schematic surviving pairs", "background + shared-age burst"]) +
      '<text class="evo-ks-label" x="' + clamp(xScale(result.ks) + 8, 70, 380).toFixed(2) + '" y="92">WGD cohort</text>' +
      '<text class="lab-svg-label" x="58" y="252">Kₛ = 0</text>' +
      '<text class="lab-svg-label" x="470" y="252" text-anchor="end">1.2</text>';
    return textSvg(html,
      "Schematic K-s histogram with exponential small-duplicate background and whole-genome-duplication peak at " +
      result.ks.toFixed(2) + ". The peak dates to " + compact(result.ageYears / 1e6, 1) + " million years.",
      "0 0 520 268", "evo-ks");
  }

  function familyTreeSvg(regime) {
    const speciesGrouping = regime === "concerted";
    const topA = speciesGrouping ? "human copy 1" : "human α";
    const topB = speciesGrouping ? "human copy 2" : "mouse α";
    const bottomA = speciesGrouping ? "mouse copy 1" : "human β";
    const bottomB = speciesGrouping ? "mouse copy 2" : "mouse β";
    const html = '<path class="evo-tree-edge" d="M82 145 H180 M180 82 V210 M180 82 H292 M292 78 V118 M292 78 H350 M292 118 H350 M180 210 H292 M292 190 V230 M292 190 H350 M292 230 H350"/>' +
      '<circle class="evo-event-node" cx="180" cy="145" r="9"/>' +
      '<text class="evo-event-label" x="180" y="151" text-anchor="middle">' + (speciesGrouping ? "S" : "D") + '</text>' +
      '<text class="evo-tip-label" x="492" y="83" text-anchor="end">' + topA + '</text>' +
      '<text class="evo-tip-label" x="492" y="123" text-anchor="end">' + topB + '</text>' +
      '<text class="evo-tip-label" x="492" y="195" text-anchor="end">' + bottomA + '</text>' +
      '<text class="evo-tip-label" x="492" y="235" text-anchor="end">' + bottomB + '</text>' +
      svgKicker(speciesGrouping ? ["concerted evolution", "copies cluster by species"] :
        ["birth-and-death evolution", "paralog lineages persist"]);
    return textSvg(html,
      speciesGrouping ? "Concerted-evolution tree groups copies within each species." :
        "Birth-and-death tree groups orthologous copies across species and marks the ancestral duplication.",
      "0 0 520 260", "evo-family-tree");
  }

  function pangenomeSvg(result) {
    const points = [];
    for (let n = 1; n <= result.genomes; n += Math.max(1, Math.round(result.genomes / 60))) {
      const current = genomeEvolutionModel({ kind: "pangenome", alpha: result.alpha, genomes: n, k: result.k, initial: result.initial });
      points.push({ x: n, y: current.total });
    }
    if (points[points.length - 1].x !== result.genomes) points.push({ x: result.genomes, y: result.total });
    const xScale = (value) => 62 + (value - 1) / Math.max(1, result.genomes - 1) * 398;
    const ymin = result.initial;
    const ymax = Math.max(...points.map((point) => point.y));
    const yScale = (value) => 226 - (value - ymin) / Math.max(1e-9, ymax - ymin) * 152;
    const html = '<path class="evo-axis" d="M58 226 H468 M58 62 V226"/>' +
      '<path class="evo-pangenome-line" d="' + linePath(points, xScale, yScale) + '"/>' +
      svgKicker(["schematic bacterial gene repertoire", "as genomes accumulate"]) +
      '<text class="evo-result-label" x="66" y="96">' + (result.open ? "open: α < 1" : "closed: α > 1") + '</text>' +
      '<text class="lab-svg-label" x="58" y="250">genomes sequenced</text>' +
      '<text class="lab-svg-label" x="460" y="250" text-anchor="end">' + result.genomes + '</text>';
    return textSvg(html,
      (result.open ? "Open" : "Closed") + " bacterial pan-genome with alpha " + result.alpha.toFixed(2) +
      "; after " + result.genomes + " genomes the model contains " + compact(result.total, 0) +
      " genes and the next genome contributes " + compact(result.newGenes, 1) + ".",
      "0 0 520 265", "evo-pangenome");
  }

  function conceptBoard(el, result) {
    return el("div", { class: "evo-concept-board" }, [
      el("div", { class: "evo-concept-scene is-" + result.scenario, role: "img", "aria-label":
        "Scenario " + result.scenario + ", applying the " + result.concept + " species concept gives " +
        result.outcome + "." }, Array.from({ length: 24 }, (_, index) => el("i", {
          class: index < 11 ? "is-a" : index > 13 ? "is-b" : "is-intermediate",
        }))),
      processBoard(el, [
        { label: "operation", value: result.concept === "biological" ? "perform a cross" :
          result.concept === "phylogenetic" ? "build a tree" : "measure sympatric clusters", tone: "active" },
        { label: "scenario", value: result.scenario },
        { label: "answer", value: result.outcome, tone: result.outcome.includes("no answer") || result.outcome === "untestable" ? "warning" : "signal" },
        { label: "boundary", value: result.boundary },
      ], "Species concepts are different operations"),
    ]);
  }

  function barrierBoard(el, result) {
    return el("div", {
      class: "evo-barrier-board",
      role: "img",
      "aria-label": "Sequential barriers " + result.barriers.map((barrier) => percent(barrier, 0)).join(", ") +
        ". Total reproductive isolation " + percent(result.isolation, 1) + ". Contributions " +
        result.contributions.map((value) => percent(value, 1)).join(", ") + ".",
    }, [
      el("div", { class: "evo-gene-flow", "aria-hidden": "true" }, result.barriers.map((barrier, index) =>
        el("div", { class: "evo-barrier-gate" }, [
          el("span", { text: "barrier " + (index + 1) }),
          el("i", { style: "height:" + percent(barrier, 1) }),
          el("strong", { text: percent(result.contributions[index], 1) + " of original" }),
        ]))),
      statusStrip(el, [
        { label: "combined isolation", value: percent(result.isolation, 1), tone: "active" },
        { label: "gene flow remaining", value: percent(result.remaining, 1), tone: "signal" },
      ], "Multiplicative reproductive isolation"),
    ]);
  }

  function dmiSvg(result) {
    const maxNodes = 12;
    const leftShown = Math.min(maxNodes, result.left);
    const rightShown = Math.min(maxNodes, result.right);
    let html = svgKicker(["derived alleles meet", "only after lineages merge"]) +
      '<path class="evo-lineage" d="M82 60 V228 M438 60 V228"/>';
    for (let index = 0; index < leftShown; index += 1) {
      const y = 70 + index * 150 / Math.max(1, leftShown - 1);
      html += '<circle class="evo-derived-node" cx="82" cy="' + y.toFixed(2) + '" r="7"/>';
    }
    for (let index = 0; index < rightShown; index += 1) {
      const y = 70 + index * 150 / Math.max(1, rightShown - 1);
      html += '<circle class="evo-derived-node is-b" cx="438" cy="' + y.toFixed(2) + '" r="7"/>';
    }
    const links = Math.min(18, leftShown * rightShown);
    for (let index = 0; index < links; index += 1) {
      const ly = 70 + (index % Math.max(1, leftShown)) * 150 / Math.max(1, leftShown - 1);
      const ry = 70 + (Math.floor(index / Math.max(1, leftShown)) % Math.max(1, rightShown)) * 150 / Math.max(1, rightShown - 1);
      html += '<path class="evo-untested-link" d="M89 ' + ly.toFixed(2) + ' L431 ' + ry.toFixed(2) + '"/>';
    }
    html += '<text class="evo-tip-label" x="82" y="254" text-anchor="middle" textLength="130" lengthAdjust="spacingAndGlyphs">lineage A · ' + result.left + '</text>' +
      '<text class="evo-tip-label" x="438" y="254" text-anchor="middle" textLength="130" lengthAdjust="spacingAndGlyphs">lineage B · ' + result.right + '</text>' +
      '<text class="evo-result-label" x="260" y="286" text-anchor="middle" textLength="450" lengthAdjust="spacingAndGlyphs">' + compact(result.untestedPairs, 0) +
      ' untested pairs · E[incompatibilities] ' + compact(result.expected, 2) + '</text>';
    return textSvg(html,
      result.left + " substitutions in lineage A and " + result.right + " in lineage B create " +
      result.untestedPairs + " cross-lineage pairs and " + result.expected.toFixed(2) +
      " expected incompatibilities at probability " + result.probability + ".",
      "0 0 520 305", "evo-dmi");
  }

  function haldaneBoard(el, result) {
    return el("div", { class: "evo-haldane-board" }, [
      el("div", { class: "evo-sex-card is-hetero" }, [
        el("span", { text: "heterogametic · XY or ZW" }),
        el("strong", { text: result.heterogameticCost.toFixed(2) }),
        el("b", { text: "1 hemizygous allele × full effect" }),
      ]),
      el("div", { class: "evo-sex-card is-homo" }, [
        el("span", { text: "homogametic · XX or ZZ" }),
        el("strong", { text: result.homogameticCost.toFixed(2) }),
        el("b", { text: "2 alleles × dominance h" }),
      ]),
      el("div", { class: "evo-haldane-result " + (result.rulePredicted ? "is-rule" : "is-reversed") }, [
        el("span", { text: "dominance prediction" }),
        el("strong", { text: result.rulePredicted ? "heterogametic sex worse" : "not sufficient" }),
        el("b", { text: result.rulePredicted ? "2h < 1" : "2h ≥ 1" }),
      ]),
    ]);
  }

  function clineSvg(result) {
    const xScale = (value) => 58 + (value + 20) / 40 * 412;
    const yScale = (value) => 228 - value * 160;
    const clinePoints = result.points.map((point) => ({ x: point.x, y: point.p }));
    const html = '<path class="evo-axis" d="M58 228 H470 M58 60 V228"/>' +
      '<path class="evo-cline-line" d="' + linePath(clinePoints, xScale, yScale) + '"/>' +
      '<path class="evo-centre-line" d="M264 60 V228"/>' +
      svgKicker(["named stationary-cline model", "width = inverse maximum gradient"]) +
      '<text class="lab-svg-label" x="58" y="252">population A</text>' +
      '<text class="lab-svg-label" x="470" y="252" text-anchor="end">population B</text>' +
      '<text class="evo-result-label" x="264" y="92" text-anchor="middle">s = ' + percent(result.selection, 1) + '</text>';
    return textSvg(html,
      "A cline of width " + result.width.toFixed(2) + " distance units with dispersal sigma " +
      result.sigma.toFixed(2) + " under the " + result.model + " model implies selection " +
      percent(result.selection, 2) + ".",
      "0 0 520 265", "evo-cline");
  }

  function transplantBoard(el, result) {
    const max = Math.max(result.aa, result.ab, result.ba, result.bb, 1);
    const cell = (population, site, value, local) => el("div", {
      class: "evo-transplant-cell" + (local ? " is-local" : ""),
    }, [
      el("span", { text: population + " at " + site }),
      el("i", { style: "height:" + percent(value / max, 2) }),
      el("strong", { text: value.toFixed(2) }),
    ]);
    return el("div", {
      class: "evo-transplant-board",
      role: "img",
      "aria-label": "Reciprocal transplant. Population A at site A " + result.aa +
        ", A at B " + result.ab + ", B at A " + result.ba + ", B at B " + result.bb +
        ". Local adaptation " + result.locallyAdapted + ".",
    }, [
      cell("pop A", "site A", result.aa, result.localAtA),
      cell("pop B", "site A", result.ba, false),
      cell("pop A", "site B", result.ab, false),
      cell("pop B", "site B", result.bb, result.localAtB),
      el("div", { class: "evo-transplant-result" }, [
        el("span", { text: "local versus foreign" }),
        el("strong", { text: result.locallyAdapted ? "crossing reaction norms: yes" : "not demonstrated" }),
      ]),
    ]);
  }

  /* S4 — Hypothesis testing -------------------------------------------- */

  define("hypothesis-testing-lab", {
    "s4-o1": "Test-anatomy mode keeps the null, observed data, statistic, and null distribution visible together and identifies the expected-count model as the risky component.",
    "s4-o2": "The Hardy-Weinberg fixture recomputes expected genotype counts, chi-square residuals, and degrees of freedom when allele frequency is fitted, then switches to an exact-test warning when an expected cell is sparse.",
    "s4-o3": "Base-rate mode turns P(data | null) into a million-test outcome field, making the prior rate, power, false positives, and P(real | flagged) separate quantities.",
    "s4-o4": "Power mode moves the alternative sampling distribution as effect size and sample size change, exposing beta and refusing to turn a low-power non-significant result into evidence for the null.",
    "s4-o5": "Scan mode reads flat, left-spiked, globally inflated, and centrally bulged p-value histograms as diagnostics of calibration, signal mixture, null failure, or regularisation.",
    "s4-o6": "The analysis-universe view multiplies loci by genetic codings and population subsets, then reports expected false positives, per-locus pathwise error, and the Bonferroni boundary.",
  }, ({ body, el, predict }) => {
    const parts = labParts(el);
    let mode = "test";
    let hweFixture = "chapter";
    let estimateAllele = true;
    let priorBad = 0.01;
    let baseAlpha = 0.05;
    let powerLogN = Math.log10(503);
    let powerEffect = 0.05;
    let powerAlpha = 0.05;
    let histogramProfile = "uniform";
    let lociLog = Math.log10(3564);
    let codings = 1;
    let populations = 1;

    function modeTabs() {
      return tabs(el, [
        { label: "Build the test", value: "test" },
        { label: "Reverse the conditional", value: "meaning" },
        { label: "Power before verdict", value: "power" },
        { label: "Scan & paths", value: "scan" },
      ], mode, (value) => { mode = value; render(); });
    }

    function renderTest() {
      const observed = hweFixture === "chapter" ? [166, 237, 100] : [90, 9, 1];
      const knownP = hweFixture === "chapter" ? 0.5656 : 0.95;
      const result = hypothesisTestingModel({
        kind: "hwe", observed, estimateP: estimateAllele, p: knownP,
      });
      parts.visual.innerHTML = hweResidualSvg(result);
      parts.visual.append(statusStrip(el, [
        { label: "χ²", value: result.statistic.toFixed(4), tone: "active" },
        { label: "df", value: result.df, tone: "signal" },
        { label: "p-value", value: compact(result.pValue, 4) },
        { label: "smallest expected", value: result.minimumExpected.toFixed(2), tone: result.exactRequired ? "warning" : "" },
      ], "Goodness-of-fit calculation"));
      parts.controls.replaceChildren(
        choiceRow(el, [
          { label: "503-person chapter SNP", value: "chapter" },
          { label: "rare-genotype fixture", value: "rare" },
        ], hweFixture, (value) => { hweFixture = value; render(); }, "Genotype-count fixture"),
        choiceRow(el, [
          { label: "estimate p from these counts", value: true },
          { label: "p known independently", value: false },
        ], estimateAllele, (value) => { estimateAllele = value; render(); }, "Allele-frequency treatment")
      );
      parts.rail.replaceChildren(causalRail(el, [
        { label: "genetic null", value: "p² : 2pq : q²" },
        { label: "expected counts", value: result.expected.map((value) => value.toFixed(1)).join(" · ") },
        { label: "residual statistic", value: "χ² = " + result.statistic.toFixed(3) },
        { label: "null tail", value: result.exactRequired ? "use exact conditional test" : "χ²(" + result.df + ")" },
      ]));
      parts.explanation.innerHTML = result.exactRequired ?
        "<strong>The arithmetic ran; the approximation did not earn trust.</strong> An expected genotype cell is below five, so a hand-rolled chi-square tail is not the test to report. Use an exact Hardy–Weinberg test. The modelling risk lives in the expected counts and null distribution, not in the summation symbol." :
        "<strong>Estimating one parameter spends one degree of freedom.</strong> Three classes provide two independent residual directions; fitting allele frequency from the same counts bends the expectations toward the data and leaves one. Supplying p independently restores df = 2 and answers a different experiment.";
    }

    function renderMeaning() {
      const result = hypothesisTestingModel({
        kind: "baseRate", m: 1000000, prior: priorBad, n: 2000, effect: 0.15, alpha: baseAlpha,
      });
      parts.visual.replaceChildren(baseRateBoard(el, result));
      parts.controls.replaceChildren(
        rangeControl(el, "Genuinely broken variants", priorBad, {
          min: 0.001, max: 0.05, step: 0.001, format: (value) => percent(value, 1),
        }, (value) => { priorBad = value; render(); }),
        choiceRow(el, [
          { label: "α = 0.05", value: 0.05 },
          { label: "α = 10⁻³", value: 0.001 },
          { label: "α = 10⁻⁶", value: 0.000001 },
        ], baseAlpha, (value) => { baseAlpha = value; render(); }, "Significance threshold")
      );
      parts.rail.replaceChildren(causalRail(el, [
        { label: "base rate", value: percent(result.prior, 1) + " truly broken" },
        { label: "test behaviour", value: percent(result.power, 1) + " power · α " + probabilityThreshold(result.alpha) },
        { label: "flagged set", value: compact(result.truePositive + result.falsePositive, 0) + " variants" },
        { label: "reverse conditional", value: "P(real | flag) " + percent(result.positivePredictiveValue, 1) },
      ]));
      parts.explanation.innerHTML = "<strong>A p-value is P(data this extreme | null), not P(null | data).</strong> The second quantity needs the prior prevalence and power shown here. At a permissive threshold, rare real failures can be outnumbered by ordinary variants even when the test detects every true failure.";
    }

    function renderPower() {
      const n = Math.round(Math.pow(10, powerLogN));
      const result = hypothesisTestingModel({ kind: "power", n, effect: powerEffect, alpha: powerAlpha });
      parts.visual.innerHTML = powerSvg(result);
      parts.visual.append(statusStrip(el, [
        { label: "noncentrality N·F²", value: result.noncentrality.toFixed(3), tone: "active" },
        { label: "power", value: percent(result.power, 1), tone: result.power >= 0.8 ? "signal" : "warning" },
        { label: "β", value: percent(result.beta, 1) },
        { label: "verdict boundary", value: result.power >= 0.8 ? "meaningful for this F" : "absence not tested" },
      ], "Power of the one-degree-of-freedom HWE test"));
      parts.controls.replaceChildren(
        rangeControl(el, "Sample size N", powerLogN, {
          min: 1.7, max: 4.5, step: 0.02, format: (value) => compact(Math.round(Math.pow(10, value)), 0),
        }, (value) => { powerLogN = value; render(); }),
        rangeControl(el, "True departure F", powerEffect, {
          min: 0.01, max: 0.30, step: 0.01, format: (value) => value.toFixed(2),
        }, (value) => { powerEffect = value; render(); }),
        choiceRow(el, [
          { label: "α = 0.05", value: 0.05 },
          { label: "α = 10⁻³", value: 0.001 },
          { label: "α = 10⁻⁶", value: 0.000001 },
        ], powerAlpha, (value) => { powerAlpha = value; render(); }, "Power threshold")
      );
      parts.rail.replaceChildren(causalRail(el, [
        { label: "effect", value: "F = " + result.effect.toFixed(2) },
        { label: "information", value: "N = " + compact(result.n, 0) },
        { label: "threshold", value: "|Z| > " + result.criticalZ.toFixed(2) },
        { label: "detection chance", value: percent(result.power, 1) },
      ]));
      parts.explanation.innerHTML = result.power < 0.8 ?
        "<strong>A non-significant result here cannot support equilibrium.</strong> This design usually misses the departure you selected. Report the effect estimate and interval, or state which effects the study had power to exclude." :
        "<strong>This design can meaningfully test the selected departure.</strong> Tightening α protects against false positives but moves the rejection boundary outward; sample size must then rise as roughly 1/F² to recover power.";
    }

    function renderScan() {
      const histogram = hypothesisTestingModel({ kind: "histogram", profile: histogramProfile });
      const multiplicity = hypothesisTestingModel({
        kind: "multiplicity", loci: Math.round(Math.pow(10, lociLog)), codings, populations, alpha: 0.05,
      });
      parts.visual.innerHTML = histogramSvg(histogram);
      parts.visual.append(forkingBoard(el, multiplicity));
      parts.controls.replaceChildren(
        choiceRow(el, [
          { label: "flat null", value: "uniform" },
          { label: "signal mixture", value: "signal" },
          { label: "global inflation", value: "inflated" },
          { label: "central bulge", value: "conservative" },
        ], histogramProfile, (value) => { histogramProfile = value; render(); }, "P-value histogram shape"),
        rangeControl(el, "Loci considered", lociLog, {
          min: 1, max: 6, step: 0.05, format: (value) => compact(Math.round(Math.pow(10, value)), 0),
        }, (value) => { lociLog = value; render(); }),
        choiceRow(el, [
          { label: "1 coding", value: 1 }, { label: "3 codings", value: 3 },
        ], codings, (value) => { codings = value; render(); }, "Genetic coding paths"),
        choiceRow(el, [
          { label: "1 population", value: 1 }, { label: "5 populations", value: 5 },
        ], populations, (value) => { populations = value; render(); }, "Population subset paths")
      );
      parts.rail.replaceChildren(causalRail(el, [
        { label: "reachable tests", value: compact(multiplicity.tests, 0) },
        { label: "nominal α", value: "0.05 each" },
        { label: "expected false hits", value: compact(multiplicity.expectedFalsePositives, 1) },
        { label: "family boundary", value: compact(multiplicity.bonferroni, 2) },
      ]));
      parts.explanation.innerHTML = "<strong>Flat is a calibrated null; shape is evidence about the machinery.</strong> A left spike can be real signal only when a flat floor remains. Broad inflation says the null failed globally; a central bulge says the pipeline regularised or became conservative. Every analysis path you were willing to take belongs in the testing universe, whether or not it reached the paper.";
    }

    function render() {
      parts.tabHost.replaceChildren(modeTabs());
      if (mode === "test") renderTest();
      else if (mode === "meaning") renderMeaning();
      else if (mode === "power") renderPower();
      else renderScan();
    }

    predict(body, {
      widget: "hypothesis-testing-lab",
      question: "One million variants are tested at α = 0.05. Only 1% are truly broken, and the test has essentially 100% power. Among flagged variants, which group is larger?",
      hint: "Apply α to the 99% of variants whose null is true before reversing the conditional.",
      options: [
        { label: "True failures—about 10,000" },
        { label: "False positives—about 49,500", correct: true },
        { label: "They are equal" },
        { label: "The p-value already answers this" },
      ],
    }, () => {
      mode = "meaning";
      priorBad = 0.01;
      baseAlpha = 0.05;
      parts.instrument.hidden = false;
      render();
    });
    finishLab(parts, body);
  });

  /* Ch 33 — Neutral theory and selection evidence --------------------- */

  define("selection-inference-lab", {
    "ch33-o1": "Neutral-cancellation mode scales mutation input and fixation probability in opposite directions as population size changes, leaving their exact product k = mu visibly invariant and listing the assumptions that permit it.",
    "ch33-o2": "Clock and drift-barrier states separate Poisson event noise from lineage-rate heterogeneity and place the same selection coefficient on the quantitative |2Ne s| visibility scale.",
    "ch33-o3": "Distance mode traces the Jukes-Cantor inverse from observed mismatch to hidden substitutions, carries its variance, and terminates honestly at the 0.75 saturation boundary.",
    "ch33-o4": "Omega mode divides corrected nonsynonymous and synonymous changes by their distinct site opportunities, while a site-mixture state shows genuine positive-selection residues diluted below gene-wide omega = 1.",
    "ch33-o5": "The SFS instrument reweights the same derived-count spectrum into Watterson theta and pi, computes Tajima's D exactly, and makes sweep, expansion, background selection, and balancing-selection confounds selectable.",
    "ch33-o6": "The McDonald-Kreitman table crosses effect with fixed-versus-polymorphic status and derives alpha, preserving its demographic cancellation and nearly-neutral limitation.",
    "ch33-o7": "Linked-selection profiles compare diversity, high-frequency-derived alleles, and long haplotypes for hard sweeps, soft sweeps, and background selection instead of treating a diversity trough as a unique signature.",
  }, ({ body, el, predict }) => {
    const parts = labParts(el);
    let mode = "neutral";
    let neutralView = "cancellation";
    let neutralLogN = 4;
    let neutralLogMu = -6;
    let clockMean = 8;
    let clockRateCv = 0;
    let selectionLog = -5;
    let distanceView = "jc";
    let observedDistance = 0.11;
    let positiveSites = 5;
    let evidenceView = "tajima";
    let sfsScenario = "sweep";
    let linkedScenario = "sweep";

    function modeTabs() {
      return tabs(el, [
        { label: "Neutral clock", value: "neutral" },
        { label: "Distance & ω", value: "distance" },
        { label: "SFS & MK", value: "polymorphism" },
        { label: "Linked evidence", value: "linked" },
      ], mode, (value) => { mode = value; render(); });
    }

    function renderNeutral() {
      const n = Math.round(Math.pow(10, neutralLogN));
      const mu = Math.pow(10, neutralLogMu);
      if (neutralView === "cancellation") {
        const result = selectionEvidenceModel({ kind: "cancellation", n, mu });
        parts.visual.innerHTML = cancellationSvg(result);
        parts.controls.replaceChildren(
          choiceRow(el, [
            { label: "N cancellation", value: "cancellation" },
            { label: "clock dispersion", value: "clock" },
            { label: "drift barrier", value: "barrier" },
          ], neutralView, (value) => { neutralView = value; render(); }, "Neutral-theory lens"),
          rangeControl(el, "Diploid population N", neutralLogN, {
            min: 2, max: 8, step: 0.05, format: (value) => compact(Math.round(Math.pow(10, value)), 0),
          }, (value) => { neutralLogN = value; render(); }),
          rangeControl(el, "Neutral mutation rate μ", neutralLogMu, {
            min: -10, max: -4, step: 0.1, format: (value) => "10^" + value.toFixed(1),
          }, (value) => { neutralLogMu = value; render(); })
        );
        parts.rail.replaceChildren(causalRail(el, [
          { label: "gene copies", value: "2N = " + compact(2 * n, 0) },
          { label: "new neutral mutants", value: "2Nμ = " + compact(result.entries, 3) },
          { label: "chance each fixes", value: "1/2N = " + compact(result.fixationProbability, 3) },
          { label: "substitution rate", value: "k = μ = " + compact(result.substitutionRate, 3) },
        ]));
        parts.explanation.innerHTML = "<strong>Population size cancels only for an exactly neutral mutation under drift.</strong> The result also assumes a stable neutral fraction and mutation rate, no linked hitchhiking, and an infinite-sites regime. Beneficial substitutions do not cancel: their fixation probability is approximately 2s, so their input still scales with N.";
        return;
      }

      if (neutralView === "clock") {
        const result = selectionEvidenceModel({ kind: "clock", mean: clockMean, rateCv: clockRateCv });
        parts.visual.replaceChildren(
          barBoard(el, [
            { label: "mean ticks", value: result.mean, display: result.mean.toFixed(1), tone: "active" },
            { label: "variance", value: result.variance, display: result.variance.toFixed(1), tone: result.dispersion > 1.05 ? "warning" : "signal" },
          ], "Molecular-clock mean and variance", Math.max(result.mean, result.variance)),
          statusStrip(el, [
            { label: "index Var/Mean", value: result.dispersion.toFixed(2), tone: result.dispersion > 1.05 ? "warning" : "signal" },
            { label: "Poisson expectation", value: "1.00" },
            { label: "rate heterogeneity CV", value: percent(result.rateCv, 0) },
          ], "Clock dispersion")
        );
        parts.controls.replaceChildren(
          choiceRow(el, [
            { label: "N cancellation", value: "cancellation" },
            { label: "clock dispersion", value: "clock" },
            { label: "drift barrier", value: "barrier" },
          ], neutralView, (value) => { neutralView = value; render(); }, "Neutral-theory lens"),
          rangeControl(el, "Mean substitutions", clockMean, {
            min: 1, max: 24, step: 1, format: (value) => value.toFixed(0),
          }, (value) => { clockMean = value; render(); }),
          rangeControl(el, "Lineage-rate CV", clockRateCv, {
            min: 0, max: 1.2, step: 0.05, format: (value) => percent(value, 0),
          }, (value) => { clockRateCv = value; render(); })
        );
        parts.rail.replaceChildren(causalRail(el, [
          { label: "Poisson noise", value: "variance = mean" },
          { label: "rates vary", value: "between lineages / epochs" },
          { label: "total variance", value: result.variance.toFixed(2) },
          { label: "clock diagnosis", value: result.dispersion > 1.05 ? "overdispersed" : "Poisson-like" },
        ]));
        parts.explanation.innerHTML = "<strong>A relaxed clock models rate variation; it does not erase uncertainty.</strong> The displayed variance uses the law of total variance for a Poisson process whose rate varies between lineages. Generation time, repair, changing constraint, and nearly neutral dynamics can all raise the index above one.";
        return;
      }

      const s = -Math.pow(10, selectionLog);
      const result = selectionEvidenceModel({ kind: "driftBarrier", ne: n, s });
      parts.visual.replaceChildren(processBoard(el, [
        { label: "lineage", value: "Nₑ = " + compact(result.ne, 0), tone: "active" },
        { label: "mutation effect", value: "s = " + compact(result.s, 2) },
        { label: "visibility", value: "|2Nₑs| = " + compact(result.strength, 3), tone: result.regime === "selection visible" ? "signal" : "warning" },
        { label: "regime", value: result.regime },
      ], "Nearly neutral drift barrier"));
      parts.controls.replaceChildren(
        choiceRow(el, [
          { label: "N cancellation", value: "cancellation" },
          { label: "clock dispersion", value: "clock" },
          { label: "drift barrier", value: "barrier" },
        ], neutralView, (value) => { neutralView = value; render(); }, "Neutral-theory lens"),
        rangeControl(el, "Effective population Nₑ", neutralLogN, {
          min: 2, max: 8, step: 0.05, format: (value) => compact(Math.round(Math.pow(10, value)), 0),
        }, (value) => { neutralLogN = value; render(); }),
        rangeControl(el, "Deleterious |s|", selectionLog, {
          min: -8, max: -2, step: 0.1, format: (value) => "10^" + value.toFixed(1),
        }, (value) => { selectionLog = value; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { label: "drift scale", value: "1/(2Nₑ) = " + compact(result.boundary, 2) },
        { label: "effect scale", value: "|s| = " + compact(Math.abs(result.s), 2) },
        { label: "comparison", value: "|2Nₑs| = " + compact(result.strength, 2) },
        { label: "fate regime", value: result.regime },
      ]));
      parts.explanation.innerHTML = "<strong>Nearly neutral is a quantitative relationship, not a vague category.</strong> The same mutation can drift in a small-Nₑ lineage and be removed in a large-Nₑ lineage. Slightly deleterious variants therefore inflate polymorphism more than divergence in small populations.";
    }

    function renderDistance() {
      if (distanceView === "jc") {
        const result = selectionEvidenceModel({ kind: "distance", p: observedDistance, length: 1200 });
        parts.visual.innerHTML = jcCurveSvg(result);
        parts.visual.append(statusStrip(el, [
          { label: "observed mismatch p", value: result.p.toFixed(3), tone: "active" },
          { label: "corrected distance d", value: result.saturated ? "not identifiable" : result.distance.toFixed(4), tone: result.saturated ? "warning" : "signal" },
          { label: "SE(d)", value: result.saturated ? "diverges" : Math.sqrt(result.variance).toFixed(4) },
        ], "Jukes-Cantor distance correction"));
        parts.controls.replaceChildren(
          choiceRow(el, [
            { label: "multiple hits", value: "jc" },
            { label: "dN/dS opportunities", value: "omega" },
            { label: "selected-site dilution", value: "mixture" },
          ], distanceView, (value) => { distanceView = value; render(); }, "Divergence lens"),
          rangeControl(el, "Observed p-distance", observedDistance, {
            min: 0, max: 0.8, step: 0.005, format: (value) => value.toFixed(3),
          }, (value) => { observedDistance = value; render(); })
        );
        parts.rail.replaceChildren(causalRail(el, [
          { label: "visible differences", value: percent(result.p, 1) },
          { label: "hidden reversals", value: result.saturated ? "unbounded" : compact(result.distance - result.p, 3) + " / site" },
          { label: "corrected path", value: result.saturated ? "not identifiable" : result.distance.toFixed(3) },
          { label: "information boundary", value: result.p >= 0.75 ? "saturated" : "below 0.75" },
        ]));
        parts.explanation.innerHTML = result.saturated ?
          "<strong>The formula stops because the historical signal is gone.</strong> At 75% mismatch, two equal-composition sequences are indistinguishable from random; a larger finite number would be invented precision." :
          "<strong>Observed difference compresses evolutionary distance.</strong> Reversals and repeated changes become increasingly invisible near saturation, so both the correction and its uncertainty accelerate upward. Richer models change the assumptions, not the existence of the boundary.";
        return;
      }

      if (distanceView === "omega") {
        const counts = { nonsynonymousChanges: 42, nonsynonymousSites: 900, synonymousChanges: 90, synonymousSites: 300 };
        const result = selectionEvidenceModel(Object.assign({ kind: "omega" }, counts));
        parts.visual.replaceChildren(omegaBoard(el, result, counts), statusStrip(el, [
          { label: "raw N:S changes", value: "42:90" },
          { label: "site opportunities", value: "900:300", tone: "active" },
          { label: "corrected ω", value: result.omega.toFixed(4), tone: "signal" },
        ], "Worked dN/dS fixture"));
        parts.controls.replaceChildren(choiceRow(el, [
          { label: "multiple hits", value: "jc" },
          { label: "dN/dS opportunities", value: "omega" },
          { label: "selected-site dilution", value: "mixture" },
        ], distanceView, (value) => { distanceView = value; render(); }, "Divergence lens"));
        parts.rail.replaceChildren(causalRail(el, [
          { label: "classify changes", value: "42 N · 90 S" },
          { label: "divide by sites", value: "900 N · 300 S" },
          { label: "correct hits", value: "dN .048 · dS .383" },
          { label: "ratio", value: "ω = " + result.omega.toFixed(3) },
        ]));
        parts.explanation.innerHTML = "<strong>Counts are not rates until divided by opportunity.</strong> Three times as many nonsynonymous sites make 42 versus 90 changes far more constrained than the raw ratio suggests. Correcting each class separately matters because synonymous sites are nearer saturation.";
        return;
      }

      const result = selectionEvidenceModel({
        kind: "siteMixture", sites: 400, positiveSites, positiveOmega: 3, backgroundOmega: 0.1,
      });
      parts.visual.replaceChildren(
        barBoard(el, [
          { label: "positively selected sites", value: result.positiveSites, display: result.positiveSites + " sites · ω 3", tone: "warning" },
          { label: "constrained sites", value: result.sites - result.positiveSites, display: (result.sites - result.positiveSites) + " sites · ω 0.1", tone: "active" },
        ], "Site classes inside one gene", result.sites),
        statusStrip(el, [
          { label: "gene-wide ω", value: result.geneWideOmega.toFixed(3), tone: result.geneWideOmega > 1 ? "signal" : "warning" },
          { label: "selected class exists", value: result.positiveSites > 0 ? "yes" : "no" },
          { label: "ω > 1 overall", value: result.geneWideOmega > 1 ? "yes" : "no" },
        ], "Averaging across codons")
      );
      parts.controls.replaceChildren(
        choiceRow(el, [
          { label: "multiple hits", value: "jc" },
          { label: "dN/dS opportunities", value: "omega" },
          { label: "selected-site dilution", value: "mixture" },
        ], distanceView, (value) => { distanceView = value; render(); }, "Divergence lens"),
        rangeControl(el, "Sites with ω = 3", positiveSites, {
          min: 0, max: 120, step: 1, format: (value) => value.toFixed(0) + " / 400",
        }, (value) => { positiveSites = value; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { label: "local process", value: result.positiveSites + " sites selected" },
        { label: "background", value: (result.sites - result.positiveSites) + " constrained" },
        { label: "gene average", value: result.geneWideOmega.toFixed(3) },
        { label: "valid inference", value: "ω < 1 does not exclude local selection" },
      ]));
      parts.explanation.innerHTML = "<strong>Averaging can hide genuine positive selection.</strong> Site and branch-site models ask whether a subset needs ω > 1; a gene-wide ratio asks a different question. Alignment error and recombination can still manufacture that subset, so the alignment remains part of the evidence.";
    }

    function renderPolymorphism() {
      if (evidenceView === "tajima") {
        const sfs = selectionEvidenceModel({
          kind: "sfs", scenario: sfsScenario, n: 10, segregatingSites: 16,
        });
        const result = sfs.statistic;
        parts.visual.innerHTML = sfsSvg(sfs);
        parts.visual.append(statusStrip(el, [
          { label: "π", value: result.pi.toFixed(3), tone: "active" },
          { label: "θW = S/a₁", value: result.thetaW.toFixed(3) },
          { label: "Tajima D", value: result.d.toFixed(3), tone: Math.abs(result.d) > 1.8 ? "warning" : "signal" },
          { label: "S", value: sfs.segregatingSites },
        ], "Tajima's D from two estimators of theta"));
        parts.controls.replaceChildren(
          choiceRow(el, [
            { label: "SFS / Tajima D", value: "tajima" }, { label: "MK table", value: "mk" },
          ], evidenceView, (value) => { evidenceView = value; render(); }, "Polymorphism evidence"),
          choiceRow(el, [
            { label: "neutral", value: "neutral" },
            { label: "hard sweep", value: "sweep" },
            { label: "expansion", value: "expansion" },
            { label: "background selection", value: "background" },
            { label: "balancing", value: "balancing" },
          ], sfsScenario, (value) => { sfsScenario = value; render(); }, "SFS-generating scenario")
        );
        parts.rail.replaceChildren(causalRail(el, [
          { label: "same spectrum", value: "derived-count bins ξᵢ" },
          { label: "flat site weight", value: "θW = " + result.thetaW.toFixed(2) },
          { label: "pair weight", value: "π = " + result.pi.toFixed(2) },
          { label: "standardised difference", value: "D = " + result.d.toFixed(2) },
        ]));
        parts.explanation.innerHTML = result.d < -1.8 ?
          "<strong>Negative D is not a sweep diagnosis.</strong> Sweep, expansion, ordinary purifying selection, and background selection all create an excess of rare variants. Selection is local while demography is genome-wide; use genomic context, high-frequency-derived alleles, and haplotypes to separate them." : result.d > 1.8 ?
          "<strong>Positive D also has multiple generators.</strong> Balancing selection, a bottleneck, or cryptic population structure can all enrich intermediate-frequency alleles. Tajima's null is simulated, not a z-table." :
          "<strong>Agreement of π and θW is a null-shaped spectrum, not proof of no selection.</strong> Different processes can cancel in this summary, and a local event can be invisible against sampling variation.";
        return;
      }

      const result = selectionEvidenceModel({ kind: "mk", dn: 42, ds: 90, pn: 8, ps: 42 });
      parts.visual.replaceChildren(mkBoard(el, result), statusStrip(el, [
        { label: "Dn/Ds", value: result.divergenceRatio.toFixed(3), tone: "active" },
        { label: "Pn/Ps", value: result.polymorphismRatio.toFixed(3) },
        { label: "adaptive α", value: percent(result.alpha, 1), tone: "signal" },
      ], "McDonald-Kreitman internally controlled ratios"));
      parts.controls.replaceChildren(choiceRow(el, [
        { label: "SFS / Tajima D", value: "tajima" }, { label: "MK table", value: "mk" },
      ], evidenceView, (value) => { evidenceView = value; render(); }, "Polymorphism evidence"));
      parts.rail.replaceChildren(causalRail(el, [
        { label: "within species", value: "Pn/Ps = " + result.polymorphismRatio.toFixed(3) },
        { label: "between species", value: "Dn/Ds = " + result.divergenceRatio.toFixed(3) },
        { label: "excess fixed N", value: compact(result.dn - result.ds * result.pn / result.ps, 2) },
        { label: "adaptive fraction", value: "α = " + result.alpha.toFixed(3) },
      ]));
      parts.explanation.innerHTML = "<strong>Demography largely cancels because synonymous and nonsynonymous sites share it.</strong> Slightly deleterious amino-acid variants do not cancel: they inflate Pn but rarely fix, biasing α downward. Frequency filtering or an explicit distribution of fitness effects addresses that limitation.";
    }

    function renderLinked() {
      const result = selectionEvidenceModel({ kind: "linked", scenario: linkedScenario });
      parts.visual.innerHTML = linkedProfileSvg(result);
      parts.controls.replaceChildren(choiceRow(el, [
        { label: "hard sweep", value: "sweep" },
        { label: "soft sweep", value: "soft" },
        { label: "background selection", value: "background" },
      ], linkedScenario, (value) => { linkedScenario = value; render(); }, "Linked-selection mechanism"));
      const endpoint = linkedScenario === "sweep" ? "sharp local trough + long high-frequency haplotype" :
        linkedScenario === "soft" ? "several rising haplotypes · weaker classical scar" :
          "broad diversity loss tied to low recombination and gene density";
      parts.rail.replaceChildren(causalRail(el, [
        { label: "selected event", value: linkedScenario },
        { label: "linked passengers", value: linkedScenario === "background" ? "removed repeatedly" : "rise with allele" },
        { label: "local profiles", value: "diversity · SFS · haplotype" },
        { label: "diagnostic combination", value: endpoint },
      ]));
      parts.explanation.innerHTML = linkedScenario === "background" ?
        "<strong>Background selection is the baseline, not an exotic alternative.</strong> It reduces diversity chronically in low-recombination, gene-dense regions and mildly skews the SFS, but it does not create the young high-frequency long haplotype of a recent hard sweep." : linkedScenario === "soft" ?
          "<strong>Adaptation can be real while the classical sweep is weak.</strong> Standing variation or recurrent mutation starts on several haplotypes, so diversity falls less and multiple long backgrounds coexist. Classical scans have poor power here." :
          "<strong>A hard-sweep claim needs a joint signature.</strong> A sharply local diversity trough plus high-frequency-derived alleles and an unexpectedly long high-frequency haplotype is stronger than any component alone; fit the background-selection and demographic baselines first.";
    }

    function render() {
      parts.tabHost.replaceChildren(modeTabs());
      if (mode === "neutral") renderNeutral();
      else if (mode === "distance") renderDistance();
      else if (mode === "polymorphism") renderPolymorphism();
      else renderLinked();
    }

    predict(body, {
      widget: "selection-inference-lab",
      question: "A diploid population becomes 100 times larger while its neutral mutation rate per copy stays fixed. What happens to the neutral substitution rate?",
      hint: "Track both the number of new mutants and the fixation probability of each.",
      options: [
        { label: "It becomes 100× faster" },
        { label: "It becomes 100× slower" },
        { label: "It stays equal to μ", correct: true },
        { label: "It becomes adaptive" },
      ],
    }, () => {
      mode = "neutral";
      neutralView = "cancellation";
      neutralLogN = 4;
      parts.instrument.hidden = false;
      render();
    });
    finishLab(parts, body);
  });

  /* Ch 34 — Phylogenetic inference ------------------------------------ */

  define("tree-inference-lab", {
    "ch34-o1": "Tree-grammar mode rotates a node without changing its split, moves an externally justified root, classifies the preserved clade, and grows the exact double-factorial topology space with taxon count.",
    "ch34-o2": "Input-audit mode swaps a clean ortholog alignment for a paralog or a progressive-alignment error and lets added sequence drive support toward a precise but wrong historical question.",
    "ch34-o3": "Substitution-model mode traces Jukes-Cantor saturation and makes each K80, HKY, GTR, Gamma, and invariant-site addition relax one named assumption rather than treating model names as a ladder of quality.",
    "ch34-o4": "Method-failure mode quantifies the Felsenstein zone p-squared/3 versus q and contrasts UPGMA's clock assumption, parsimony's repeated-change count, and model-based inference under misspecification.",
    "ch34-o5": "Support mode places bootstrap resampling and posterior conditioning side by side so identical percentages cannot be mistaken for identical probability statements or for protection against systematic error.",
    "ch34-o6": "Clock mode moves the root by outgroup or clock assumptions and shrinks sequence uncertainty against a calibration floor that remains nonzero as alignment length grows.",
    "ch34-o7": "Coalescent mode builds every expected waiting interval, exposes the dominance of the final pair, computes ILS discordance from branch length in coalescent units, and distinguishes symmetric ILS from asymmetric introgression, HGT, and duplication-loss signatures.",
  }, ({ body, el, predict }) => {
    const parts = labParts(el);
    let mode = "grammar";
    let rotation = "standard";
    let rootPosition = "outgroup";
    let topologyN = 10;
    let inputDefect = "clean";
    let inputLogLength = 3;
    let methodView = "models";
    let substitutionModel = "jc";
    let phyloDistance = 0.30;
    let method = "parsimony";
    let longChange = 0.35;
    let internalChange = 0.02;
    let inferenceView = "support";
    let calibrationCv = 0.15;
    let clockLogLength = 3;
    let coalSample = 10;
    let coalLogN = 4;
    let coalTau = 1;
    let discordanceCause = "ils";

    function modeTabs() {
      return tabs(el, [
        { label: "Read the tree", value: "grammar" },
        { label: "Audit the input", value: "input" },
        { label: "Methods & failure", value: "methods" },
        { label: "Support, time & genes", value: "inference" },
      ], mode, (value) => { mode = value; render(); });
    }

    function renderGrammar() {
      const result = phylogenyInferenceModel({ kind: "topologies", n: topologyN });
      parts.visual.innerHTML = treeSvg(rotation, rootPosition);
      parts.visual.append(statusStrip(el, [
        { label: "taxa", value: result.n, tone: "active" },
        { label: "unrooted topologies", value: result.unrootedLabel, tone: "warning" },
        { label: "branches / topology", value: result.branches },
        { label: "preserved split", value: "{A,B} | {C,D,outgroup}", tone: "signal" },
      ], "Tree topology and display state"));
      parts.controls.replaceChildren(
        choiceRow(el, [
          { label: "standard order", value: "standard" }, { label: "rotate A/B node", value: "rotated" },
        ], rotation, (value) => { rotation = value; render(); }, "Tree display rotation"),
        choiceRow(el, [
          { label: "outgroup root", value: "outgroup" },
          { label: "midpoint root", value: "midpoint" },
          { label: "arbitrary edge", value: "arbitrary" },
        ], rootPosition, (value) => { rootPosition = value; render(); }, "Root placement assumption"),
        rangeControl(el, "Number of taxa", topologyN, {
          min: 4, max: 53, step: 1, format: (value) => value.toFixed(0),
        }, (value) => { topologyN = value; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { label: "tips", value: "observed sequences" },
        { label: "topology", value: "which splits exist" },
        { label: "branch lengths", value: "substitutions / site" },
        { label: "root", value: rootPosition === "outgroup" ? "external evidence" : rootPosition === "midpoint" ? "clock assumption" : "not identified by reversible sequence model" },
      ]));
      parts.explanation.innerHTML = rootPosition === "arbitrary" ?
        "<strong>A time-reversible likelihood is identical wherever this root is placed.</strong> Sequence data identify the unrooted splits and branch lengths; ancestry direction requires an outgroup, a clock, dated tips, or another external assumption." :
        "<strong>Rotating a node changes the drawing, not the history.</strong> A clade is defined by a split—an ancestor plus all descendants—not by left-to-right order. The double-factorial topology count explains why practical searches are heuristic long before modern taxon counts.";
    }

    function renderInput() {
      const length = Math.round(Math.pow(10, inputLogLength));
      const systematic = inputDefect !== "clean";
      const support = systematic ? 1 - Math.exp(-length / 650) : 0.72 + 0.27 * (1 - Math.exp(-length / 1100));
      const question = inputDefect === "clean" ? "species split" : inputDefect === "paralog" ? "ancient duplication" : "guide-tree-shaped alignment";
      parts.visual.replaceChildren(
        alignmentBoard(el, inputDefect),
        processBoard(el, [
          { label: "rows chosen", value: inputDefect === "paralog" ? "ortholog + paralog mixed" : "same gene lineage", tone: systematic ? "warning" : "signal" },
          { label: "columns asserted", value: inputDefect === "misaligned" ? "early gaps frozen" : "homologous positions" },
          { label: "tree actually answers", value: question, tone: systematic ? "warning" : "active" },
          { label: "illustrative support", value: percent(support, 1) },
        ], "Illustrative pre-tree evidence chain")
      );
      parts.controls.replaceChildren(
        choiceRow(el, [
          { label: "curated orthologs", value: "clean" },
          { label: "mouse paralog", value: "paralog" },
          { label: "progressive gap error", value: "misaligned" },
        ], inputDefect, (value) => { inputDefect = value; render(); }, "Pre-tree input condition"),
        rangeControl(el, "Alignment columns", inputLogLength, {
          min: 2, max: 4.3, step: 0.05, format: (value) => compact(Math.round(Math.pow(10, value)), 0),
        }, (value) => { inputLogLength = value; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { label: "biological sampling", value: inputDefect === "paralog" ? "wrong homolog event" : "ortholog set" },
        { label: "alignment inference", value: inputDefect === "misaligned" ? "systematic column error" : "audited columns" },
        { label: "more sites", value: compact(length, 0) },
        { label: "precision", value: percent(support, 1) + (systematic ? " around wrong answer" : " for intended question") },
      ]));
      parts.explanation.innerHTML = systematic ?
        "<strong>Bootstrap cannot expose an error copied into every replicate.</strong> More columns repeat the paralog choice or alignment assertion and can drive support toward 100% for the wrong historical object. The percentage is an illustrative precision trajectory, not a bootstrap calculated from the three displayed rows; accuracy must be audited before precision is measured." :
        "<strong>The tree is only as meaningful as its rows and columns.</strong> Curated orthology makes the gene tree relevant to the species question; masked or statistically aligned uncertain columns keep the input uncertainty from masquerading as fixed data. The support trajectory is illustrative rather than estimated from this toy alignment.";
    }

    function renderMethods() {
      if (methodView === "models") {
        const result = phylogenyInferenceModel({ kind: "distance", q: phyloDistance, length: 1200 });
        const modelLabels = {
          jc: "JC69", k80: "K80", hky: "HKY", gtr: "GTR", gamma: "GTR+Γ", invariant: "GTR+Γ+I",
        };
        const additions = {
          jc: ["equal exchange rates", "equal base frequencies"],
          k80: ["transition/transversion ratio κ", "equal base frequencies"],
          hky: ["κ plus unequal base frequencies", "one rate across sites"],
          gtr: ["six reversible exchangeabilities", "one rate across sites"],
          gamma: ["GTR plus rate categories", "fast sites absorb hidden hits"],
          invariant: ["GTR+Γ plus invariant class", "+I trades off with low Γ rates"],
        };
        const distanceReadout = substitutionModel === "jc" ?
          (result.saturated ? "not identifiable at saturation" : "JC d = " + result.distance.toFixed(3)) :
          "q alone is insufficient";
        parts.visual.innerHTML = jcCurveSvg(result);
        parts.visual.append(processBoard(el, [
          { label: "model", value: modelLabels[substitutionModel], tone: "active" },
          { label: "adds", value: additions[substitutionModel][0], tone: "signal" },
          { label: "still assumes", value: additions[substitutionModel][1] },
          { label: "distance readout", value: distanceReadout },
        ], "Nested substitution-model assumptions; plotted curve is the JC69 reference"));
        parts.controls.replaceChildren(
          choiceRow(el, [
            { label: "model hierarchy", value: "models" }, { label: "failure arena", value: "failure" },
          ], methodView, (value) => { methodView = value; render(); }, "Method lesson"),
          choiceRow(el, [
            { label: "JC69", value: "jc" }, { label: "K80", value: "k80" },
            { label: "HKY", value: "hky" }, { label: "GTR", value: "gtr" },
            { label: "GTR+Γ", value: "gamma" },
            { label: "GTR+Γ+I", value: "invariant" },
          ], substitutionModel, (value) => { substitutionModel = value; render(); }, "Substitution model"),
          rangeControl(el, "Observed difference q", phyloDistance, {
            min: 0, max: 0.8, step: 0.005, format: (value) => value.toFixed(3),
          }, (value) => { phyloDistance = value; render(); })
        );
        parts.rail.replaceChildren(causalRail(el, [
          { label: "aligned sites", value: "observed q = " + result.p.toFixed(3) },
          { label: "rate matrix", value: modelLabels[substitutionModel] },
          { label: "multiple-hit inverse", value: substitutionModel === "jc" ?
            (result.saturated ? "not identifiable" : "JC d = " + result.distance.toFixed(3)) :
            "fit from full pattern counts" },
          { label: "model risk", value: additions[substitutionModel][1] },
        ]));
        parts.explanation.innerHTML = "<strong>Each model name is a bundle of assumptions.</strong> The plotted JC69 curve is a saturation reference: one mismatch fraction q cannot identify K80, HKY, GTR, Γ, or +I parameters. Those require the full substitution-pattern and base-frequency data. +I and low-rate Γ categories partly trade off, so richer is not synonymous with identifiable.";
        return;
      }

      if (method === "upgma") {
        parts.visual.replaceChildren(
          barBoard(el, [
            { label: "B–D · slow nonsisters", value: 0.15, display: "0.15 · closest", tone: "warning" },
            { label: "A–B · true sisters", value: 0.35, display: "0.35", tone: "active" },
            { label: "C–D · true sisters", value: 0.35, display: "0.35", tone: "signal" },
            { label: "A–C · long nonsisters", value: 0.65, display: "0.65" },
          ], "Chapter corrected-distance fixture for the UPGMA clock failure", 0.65),
          statusStrip(el, [
            { label: "UPGMA rule", value: "join closest pair", tone: "active" },
            { label: "first join", value: "B + D", tone: "warning" },
            { label: "true cherries", value: "A+B · C+D", tone: "signal" },
            { label: "failed assumption", value: "ultrametric clock" },
          ], "UPGMA failure on the chapter distance matrix")
        );
        parts.controls.replaceChildren(
          choiceRow(el, [
            { label: "model hierarchy", value: "models" }, { label: "failure arena", value: "failure" },
          ], methodView, (value) => { methodView = value; render(); }, "Method lesson"),
          choiceRow(el, [
            { label: "UPGMA", value: "upgma" },
            { label: "parsimony", value: "parsimony" },
            { label: "ML, model wrong", value: "ml" },
          ], method, (value) => { method = value; render(); }, "Tree-building method")
        );
        parts.rail.replaceChildren(causalRail(el, [
          { label: "true tree", value: "((A,B),(C,D))" },
          { label: "unequal rates", value: "B and D both evolve slowly" },
          { label: "smallest distance", value: "d(B,D) = 0.15" },
          { label: "UPGMA result", value: "wrong B+D grouping" },
        ]));
        parts.explanation.innerHTML = "<strong>UPGMA fails here because closeness is not sisterhood without a clock.</strong> B and D are slow nonsisters on opposite sides of the true tree, yet their corrected distance is smallest. Neighbour joining uses each taxon's distance to everything else and recovers the additive split without assuming ultrametricity.";
        return;
      }

      const result = phylogenyInferenceModel({ kind: "longBranch", longChange, internalChange });
      parts.visual.innerHTML = longBranchSvg(result, method === "parsimony" ? "parsimony" : "misspecified ML");
      parts.visual.append(statusStrip(el, [
        { label: "true pattern ≈ q", value: result.truePattern.toFixed(3), tone: "signal" },
        { label: "parallel pattern ≈ p²/3", value: result.misleadingPattern.toFixed(3), tone: result.ratio > 1 ? "warning" : "" },
        { label: "misleading / true", value: result.ratio.toFixed(2) + "×" },
        { label: "selected grouping", value: result.winner },
      ], "Long-branch failure fixture"));
      parts.controls.replaceChildren(
        choiceRow(el, [
          { label: "model hierarchy", value: "models" }, { label: "failure arena", value: "failure" },
        ], methodView, (value) => { methodView = value; render(); }, "Method lesson"),
        choiceRow(el, [
          { label: "UPGMA", value: "upgma" },
          { label: "parsimony", value: "parsimony" },
          { label: "ML, model wrong", value: "ml" },
        ], method, (value) => { method = value; render(); }, "Tree-building method"),
        rangeControl(el, "Visible change on long branch p", longChange, {
          min: 0.05, max: 0.60, step: 0.01, format: (value) => value.toFixed(2),
        }, (value) => { longChange = value; render(); }),
        rangeControl(el, "Internal-branch signal q", internalChange, {
          min: 0.005, max: 0.15, step: 0.005, format: (value) => value.toFixed(3),
        }, (value) => { internalChange = value; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { label: "true history", value: "short internal split" },
        { label: "repeated changes", value: "parallel hits on A and C" },
        { label: "method assumption", value: method === "upgma" ? "all tips clock-like" : method === "parsimony" ? "fewest visible changes" : "chosen model describes rates" },
        { label: "failure", value: result.winner },
      ]));
      parts.explanation.innerHTML = method === "parsimony" ?
        "<strong>More sites can make parsimony more certain of the wrong tree.</strong> When p²/3 exceeds q, misleading parallel patterns are genuinely more frequent than the true internal pattern; their ratio does not disappear with sample size." :
        "<strong>Likelihood is consistent under its model, not outside every model.</strong> A misspecified rate process can compress long branches and recreate attraction. Add taxa that break long branches, partition the alignment, and fit rate heterogeneity.";
    }

    function renderInference() {
      if (inferenceView === "support") {
        parts.visual.replaceChildren(el("div", { class: "evo-support-board" }, [
          el("div", { class: "evo-support-card is-bootstrap" }, [
            el("span", { text: "bootstrap · 95%" }),
            el("strong", { text: "Would resampled columns recover this split?" }),
            el("b", { text: "precision of site support · not P(correct)" }),
          ]),
          el("div", { class: "evo-support-card is-posterior" }, [
            el("span", { text: "posterior · 0.95" }),
            el("strong", { text: "P(split | data, model, prior)" }),
            el("b", { text: "probability only inside the fitted world" }),
          ]),
        ]), processBoard(el, [
          { label: "systematic input error", value: inputDefect === "clean" ? "none selected" : inputDefect, tone: inputDefect === "clean" ? "signal" : "warning" },
          { label: "bootstrap sees it?", value: "no · copied into each resample" },
          { label: "posterior escapes it?", value: "no · conditions on the same model" },
          { label: "required audit", value: "orthology · alignment · model" },
        ], "Support cannot rescue a wrong inferential object"));
        parts.controls.replaceChildren(
          choiceRow(el, [
            { label: "support", value: "support" }, { label: "clock floor", value: "clock" }, { label: "gene trees", value: "coalescent" },
          ], inferenceView, (value) => { inferenceView = value; render(); }, "Inference boundary"),
          choiceRow(el, [
            { label: "clean input", value: "clean" }, { label: "paralog", value: "paralog" }, { label: "misalignment", value: "misaligned" },
          ], inputDefect, (value) => { inputDefect = value; render(); }, "Shared systematic condition")
        );
        parts.rail.replaceChildren(causalRail(el, [
          { label: "bootstrap", value: "column-resampling stability" },
          { label: "posterior", value: "conditional model probability" },
          { label: "same number", value: "95% ≠ 0.95 statement" },
          { label: "accuracy", value: "external model/input checks" },
        ]));
        parts.explanation.innerHTML = "<strong>These support numbers answer different questions.</strong> Bootstrap measures how broadly the split's signal is distributed across columns. Posterior probability is conditional on the model and prior. Neither can discover a paralog or alignment error present in every replicate or sample.";
        return;
      }

      if (inferenceView === "clock") {
        const result = phylogenyInferenceModel({
          kind: "clock", sequenceLength: Math.round(Math.pow(10, clockLogLength)), calibrationCv, information: 0.02,
        });
        parts.visual.innerHTML = uncertaintySvg(result);
        parts.controls.replaceChildren(
          choiceRow(el, [
            { label: "support", value: "support" }, { label: "clock floor", value: "clock" }, { label: "gene trees", value: "coalescent" },
          ], inferenceView, (value) => { inferenceView = value; render(); }, "Inference boundary"),
          rangeControl(el, "Aligned sites", clockLogLength, {
            min: 2, max: 7, step: 0.05, format: (value) => compact(Math.round(Math.pow(10, value)), 0),
          }, (value) => { clockLogLength = value; render(); }),
          rangeControl(el, "Calibration uncertainty", calibrationCv, {
            min: 0.02, max: 0.50, step: 0.01, format: (value) => percent(value, 0),
          }, (value) => { calibrationCv = value; render(); })
        );
        parts.rail.replaceChildren(causalRail(el, [
          { label: "branch length", value: "rate × time" },
          { label: "more sequence", value: "likelihood width " + percent(result.sequenceCv, 1) },
          { label: "external calibration", value: percent(result.calibrationCv, 1) },
          { label: "asymptotic date floor", value: percent(result.asymptoticFloor, 1) },
        ]));
        parts.explanation.innerHTML = "<strong>Sequence identifies the product of rate and time.</strong> As sites approach infinity, branch-length sampling error vanishes but the fossil, tip-date, or rate calibration does not. The displayed quadrature is an illustrative independent-CV decomposition; real dating fits rate, tree, and calibrations jointly. A fossil is a minimum-age constraint with a tail, not the divergence date itself.";
        return;
      }

      const result = phylogenyInferenceModel({
        kind: "coalescent", n: coalSample, populationN: Math.round(Math.pow(10, coalLogN)), tau: coalTau,
      });
      const causes = {
        ils: ["symmetric discordance", "two alternative gene trees equally frequent"],
        introgression: ["asymmetric discordance", "one ABBA/BABA pattern is enriched"],
        hgt: ["deep single-gene displacement", "often atypical composition"],
        duplication: ["split too deep", "paralog loss masquerades as species history"],
      };
      parts.visual.innerHTML = coalescentSvg(result);
      parts.visual.append(statusStrip(el, [
        { label: "E[TMRCA]", value: compact(result.tmrca, 0) + " generations", tone: "active" },
        { label: "final-pair share", value: percent(result.deepestFraction, 1) },
        { label: "P(gene tree discordant)", value: percent(result.discordantProbability, 1), tone: "warning" },
        { label: "cause signature", value: causes[discordanceCause][0] },
      ], "Coalescent genealogy and discordance"));
      parts.controls.replaceChildren(
        choiceRow(el, [
          { label: "support", value: "support" }, { label: "clock floor", value: "clock" }, { label: "gene trees", value: "coalescent" },
        ], inferenceView, (value) => { inferenceView = value; render(); }, "Inference boundary"),
        rangeControl(el, "Sampled sequences n", coalSample, {
          min: 2, max: 50, step: 1, format: (value) => value.toFixed(0),
        }, (value) => { coalSample = value; render(); }),
        rangeControl(el, "Population N", coalLogN, {
          min: 2, max: 7, step: 0.05, format: (value) => compact(Math.round(Math.pow(10, value)), 0),
        }, (value) => { coalLogN = value; render(); }),
        rangeControl(el, "Internal branch τ", coalTau, {
          min: 0.1, max: 4, step: 0.05, format: (value) => value.toFixed(2) + " coalescent units",
        }, (value) => { coalTau = value; render(); }),
        choiceRow(el, [
          { label: "ILS", value: "ils" }, { label: "introgression", value: "introgression" },
          { label: "HGT", value: "hgt" }, { label: "duplication + loss", value: "duplication" },
        ], discordanceCause, (value) => { discordanceCause = value; render(); }, "Gene-tree discordance cause")
      );
      parts.rail.replaceChildren(causalRail(el, [
        { label: "trace backward", value: coalSample + " sampled lineages" },
        { label: "wait by k", value: "4N/[k(k−1)]" },
        { label: "cross speciation", value: "τ = " + coalTau.toFixed(2) },
        { label: "gene/species mismatch", value: causes[discordanceCause][1] },
      ]));
      parts.explanation.innerHTML = discordanceCause === "ils" ?
        "<strong>ILS is symmetric and can make most loci disagree on a rapid radiation.</strong> The two discordant topologies each receive one third of the lineages that fail to coalesce in the internal branch. More individuals barely deepen the genealogy because the final pair dominates." :
        "<strong>Different mechanisms leave different asymmetries.</strong> " + causes[discordanceCause][1] + ". Treat gene trees as population-history observations, not replicate estimates of one universal species tree.";
    }

    function render() {
      parts.tabHost.replaceChildren(modeTabs());
      if (mode === "grammar") renderGrammar();
      else if (mode === "input") renderInput();
      else if (mode === "methods") renderMethods();
      else renderInference();
    }

    predict(body, {
      widget: "tree-inference-lab",
      question: "A progressive alignment made the same systematic column error across a locus. You sequence ten times more sites and bootstrap columns. What is the dangerous outcome?",
      hint: "Every bootstrap replicate inherits the same alignment columns.",
      options: [
        { label: "Support must fall" },
        { label: "The error averages to zero" },
        { label: "High support for the wrong tree", correct: true },
        { label: "The root becomes identifiable" },
      ],
    }, () => {
      mode = "input";
      inputDefect = "misaligned";
      inputLogLength = 4;
      parts.instrument.hidden = false;
      render();
    });
    finishLab(parts, body);
  });

  /* Ch 35 — Genome evolution ------------------------------------------ */

  define("genome-evolution-lab", {
    "ch35-o1": "Duplication-origin mode performs tandem duplication, retrotransposition, or whole-genome duplication and leaves the intron, promoter, target-site, reciprocal-deletion, and synteny signatures on the resulting genome tracks.",
    "ch35-o2": "Duplicate-fate mode derives the competing neofunctionalisation race 4Nesphi/(4Nesphi+1) and the DDC probability 2r-squared/(1+2r)-squared, making only the adaptive route move with effective population size.",
    "ch35-o3": "The Ks clock overlays an exponential small-duplication background with a shared-age WGD cohort, dates the peak by Ks/(2rs), and marks the saturation boundary rather than extending the clock indefinitely.",
    "ch35-o4": "Family-history mode changes a tree between concerted and birth-and-death regimes, labels speciation versus duplication events, enumerates ortholog, in-paralog, out-paralog, ohnolog, and xenolog relationships, and quantifies reciprocal-best-hit pseudoorthology.",
    "ch35-o5": "Origin-claim mode requires chromosome integration, phylogeny, independent assembly, syntenic outgroups, and contamination controls before accepting eukaryotic HGT or de novo birth.",
    "ch35-o6": "Mutational-hazard mode evaluates Ne*u*k per lineage with lineage-specific mutation rates, showing the critical number of vulnerable positions selection can resolve.",
    "ch35-o7": "Pangenome mode integrates the power-law contribution of each bacterial genome and then contrasts gene-repertoire openness with the graph-reference meaning of the human pangenome.",
  }, ({ body, el, predict }) => {
    const parts = labParts(el);
    let mode = "origins";
    let duplicationMechanism = "tandem";
    let fateLogNe = 4;
    let fateS = 0.01;
    let fateLogPhi = -4;
    let fateR = 1;
    let ksValue = 0.85;
    let ksRateLog = Math.log10(6.1e-9);
    let genomeView = "relationships";
    let familyRegime = "birth";
    let singleCopyQ = 0.4;
    let originClaim = "hgt";
    let hazardLineage = "human";
    let hazardK = 30;
    let panAlpha = 0.7;
    let panGenomes = 100;

    function modeTabs() {
      return tabs(el, [
        { label: "Duplicate a genome", value: "origins" },
        { label: "Race duplicate fates", value: "fates" },
        { label: "Read the Kₛ clock", value: "clock" },
        { label: "Families & genome bulk", value: "families" },
      ], mode, (value) => { mode = value; render(); });
    }

    function renderOrigins() {
      const result = genomeEvolutionModel({ kind: "duplication", mechanism: duplicationMechanism });
      parts.visual.replaceChildren(duplicationBoard(el, result));
      parts.controls.replaceChildren(choiceRow(el, [
        { label: "unequal crossing over", value: "tandem" },
        { label: "retrotransposition", value: "retro" },
        { label: "whole-genome duplication", value: "wgd" },
      ], duplicationMechanism, (value) => { duplicationMechanism = value; render(); }, "Duplication mechanism"));
      parts.rail.replaceChildren(causalRail(el, [
        { label: "mechanism", value: result.label },
        { label: "material copied", value: result.copied },
        { label: "genomic placement", value: result.location },
        { label: "diagnostic trace", value: result.signatures[0] + " + " + result.signatures[3] },
      ]));
      parts.explanation.innerHTML = duplicationMechanism === "retro" ?
        "<strong>A retrocopy begins as a processed message, not a copied locus.</strong> It therefore lacks introns and usually a promoter, retains a poly-A remnant, and is flanked by target-site duplications. Expression requires capturing new regulation." : duplicationMechanism === "wgd" ?
          "<strong>WGD preserves dosage balance because every complex subunit doubles together.</strong> The evidence is genome-wide: same-age paralog cohorts and doubled syntenic blocks, followed by differential loss and rediploidisation." :
          "<strong>Tandem duplication copies regulatory neighbourhood as well as coding sequence.</strong> Adjacent same-orientation copies and a reciprocal deletion are the structural signature of misaligned crossing over or NAHR.";
    }

    function renderFates() {
      const result = genomeEvolutionModel({
        kind: "fates", ne: Math.round(Math.pow(10, fateLogNe)), s: fateS,
        phi: Math.pow(10, fateLogPhi), r: fateR,
      });
      parts.visual.replaceChildren(fateBoard(el, result));
      parts.controls.replaceChildren(
        rangeControl(el, "Effective population Nₑ", fateLogNe, {
          min: 3, max: 8, step: 0.05, format: (value) => compact(Math.round(Math.pow(10, value)), 0),
        }, (value) => { fateLogNe = value; render(); }),
        rangeControl(el, "Beneficial effect s", fateS, {
          min: 0.001, max: 0.05, step: 0.001, format: (value) => value.toFixed(3),
        }, (value) => { fateS = value; render(); }),
        rangeControl(el, "Useful/null target ratio φ", fateLogPhi, {
          min: -6, max: -2, step: 0.1, format: (value) => "10^" + value.toFixed(1),
        }, (value) => { fateLogPhi = value; render(); }),
        rangeControl(el, "Regulatory/coding null ratio r", fateR, {
          min: 0, max: 5, step: 0.1, format: (value) => value.toFixed(1),
        }, (value) => { fateR = value; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { label: "redundant pair", value: "neutral losses begin" },
        { label: "adaptive race", value: "4Nₑsφ = " + compact(result.neoStrength, 3) },
        { label: "complementary decay", value: "2r²/(1+2r)²" },
        { label: "retention route", value: result.pNeo > result.pSub ? "new-function route favoured" : "complementary-loss route favoured" },
      ]));
      parts.explanation.innerHTML = "<strong>Preservation by decay is neutral and therefore does not contain Nₑ.</strong> Neofunctionalisation must beat the null-mutation clock with a rare beneficial target, so it depends on 4Nₑsφ. DDC fixes complementary regulatory losses that make both degraded copies necessary.";
    }

    function renderClock() {
      const result = genomeEvolutionModel({
        kind: "ks", ks: ksValue, rate: Math.pow(10, ksRateLog), backgroundBase: 900,
        halvingKs: 0.1, observedAtPoint: 3300,
      });
      parts.visual.innerHTML = ksHistogramSvg(result);
      parts.visual.append(statusStrip(el, [
        { label: "Kₛ peak", value: result.ks.toFixed(2), tone: "active" },
        { label: "dated age", value: compact(result.ageYears / 1e6, 1) + " My", tone: "signal" },
        { label: "observed / background", value: compact(result.excess, 0) + "×" },
        { label: "clock status", value: result.saturated ? "saturated" : "within rough dating range", tone: result.saturated ? "warning" : "" },
      ], "Whole-genome-duplication peak fixture"));
      parts.controls.replaceChildren(
        rangeControl(el, "Kₛ peak position", ksValue, {
          min: 0.1, max: 1.8, step: 0.01, format: (value) => value.toFixed(2),
        }, (value) => { ksValue = value; render(); }),
        rangeControl(el, "Synonymous rate rₛ", ksRateLog, {
          min: -9.5, max: -8, step: 0.02, format: (value) => compact(Math.pow(10, value), 2) + " / site / year",
        }, (value) => { ksRateLog = value; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { label: "steady births + loss", value: "exponential Kₛ background" },
        { label: "shared-age excess", value: compact(result.excess, 0) + "× at Kₛ " + result.ks.toFixed(2) },
        { label: "two branches", value: "Kₛ = 2rₛt" },
        { label: "event date", value: compact(result.ageYears / 1e6, 1) + " million years" },
      ]));
      parts.explanation.innerHTML = result.saturated ?
        "<strong>This peak is too old for a dependable synonymous clock.</strong> Kₛ saturation around 1–1.5 blurs repeated changes, and gene conversion can pull paralog pairs spuriously toward zero. The cohort may support WGD while its calendar date remains weak." :
        "<strong>A monotone exponential background cannot create a shared-age peak.</strong> The peak is evidence for a duplication burst; its date uses the explicitly selected lineage rate. This curve is a schematic chapter fixture, not a fitted genome dataset.";
    }

    function renderFamilies() {
      if (genomeView === "relationships") {
        const pseudo = genomeEvolutionModel({ kind: "pseudoorthology", singleCopyProbability: singleCopyQ });
        parts.visual.innerHTML = familyTreeSvg(familyRegime);
        parts.visual.append(processBoard(el, [
          { label: "ortholog", value: "MRCA event = speciation", tone: "signal" },
          { label: "paralog", value: "MRCA event = duplication" },
          { label: "in- / out-paralog", value: "duplication after / before focal speciation" },
          { label: "xenolog / ohnolog", value: "HGT history / WGD origin" },
        ], "Relationships are defined by events, not percent identity"));
        parts.visual.append(statusStrip(el, [
          { label: "family regime", value: familyRegime === "concerted" ? "concerted" : "birth-and-death", tone: "active" },
          { label: "single-copy probability q", value: percent(pseudo.singleCopyProbability, 0) },
          { label: "RBH pseudoorthology", value: percent(pseudo.reciprocalLossProbability, 1), tone: "warning" },
        ], "Reciprocal-best-hit failure from differential loss"));
        parts.controls.replaceChildren(
          choiceRow(el, [
            { label: "family relationships", value: "relationships" },
            { label: "origin claims", value: "claims" },
            { label: "mutational hazard", value: "hazard" },
            { label: "two pangenomes", value: "pangenome" },
          ], genomeView, (value) => { genomeView = value; render(); }, "Genome-evolution evidence"),
          choiceRow(el, [
            { label: "birth-and-death", value: "birth" }, { label: "concerted", value: "concerted" },
          ], familyRegime, (value) => { familyRegime = value; render(); }, "Gene-family regime"),
          rangeControl(el, "Each lineage ends single-copy q", singleCopyQ, {
            min: 0, max: 1, step: 0.02, format: (value) => percent(value, 0),
          }, (value) => { singleCopyQ = value; render(); })
        );
        parts.rail.replaceChildren(causalRail(el, [
          { label: "gene-tree node", value: familyRegime === "concerted" ? "homogenisation by species" : "duplication then speciation" },
          { label: "event label", value: familyRegime === "concerted" ? "copy similarity reset" : "D versus S" },
          { label: "relationship", value: "event-defined homolog class" },
          { label: "RBH boundary", value: "one best score cannot recover one-to-many history" },
        ]));
        parts.explanation.innerHTML = familyRegime === "concerted" ?
          "<strong>Concerted evolution makes within-species copies look youngest.</strong> Gene conversion and unequal crossing over homogenise a tandem array faster than mutation differentiates it, so copies group by species rather than by positional orthology." :
          "<strong>Birth-and-death families preserve paralog lineages across species.</strong> Reciprocal best hit can still pair different ancestral paralogs after differential loss; synteny and tree reconciliation are needed to label the event history.";
        return;
      }

      if (genomeView === "claims") {
        const steps = originClaim === "hgt" ? [
          { label: "independent assembly", value: "same host-chromosome placement", tone: "active" },
          { label: "integration", value: "introns + host codon usage + flanking host DNA" },
          { label: "gene tree", value: "nested within donor lineage", tone: "signal" },
          { label: "contamination test", value: "coverage and sample provenance agree" },
        ] : [
          { label: "syntenic outgroups", value: "same locus is non-coding, not deleted", tone: "active" },
          { label: "lineage ORF", value: "intact and translated" },
          { label: "homology search", value: "no older coding ancestor" },
          { label: "young-gene pattern", value: "short, weak, tissue-restricted", tone: "signal" },
        ];
        parts.visual.replaceChildren(processBoard(el, steps, originClaim === "hgt" ? "Eukaryotic HGT evidence ladder" : "De novo gene-birth evidence ladder"));
        parts.controls.replaceChildren(
          choiceRow(el, [
            { label: "family relationships", value: "relationships" },
            { label: "origin claims", value: "claims" },
            { label: "mutational hazard", value: "hazard" },
            { label: "two pangenomes", value: "pangenome" },
          ], genomeView, (value) => { genomeView = value; render(); }, "Genome-evolution evidence"),
          choiceRow(el, [
            { label: "eukaryotic HGT", value: "hgt" }, { label: "de novo gene", value: "denovo" },
          ], originClaim, (value) => { originClaim = value; render(); }, "Origin claim")
        );
        parts.rail.replaceChildren(causalRail(el, [
          { label: "surprising claim", value: originClaim === "hgt" ? "foreign gene in eukaryote" : "coding gene from non-coding sequence" },
          { label: "high-risk alternative", value: originClaim === "hgt" ? "bacterial contamination" : "hidden homology or deletion" },
          { label: "orthogonal evidence", value: originClaim === "hgt" ? "integration + phylogeny" : "synteny + translation" },
          { label: "legitimate endpoint", value: "supported origin, not absence-of-hit alone" },
        ]));
        parts.explanation.innerHTML = originClaim === "hgt" ?
          "<strong>A surprising eukaryotic HGT claim starts with a low prior.</strong> A foreign-looking contig is insufficient; independent assembly, chromosomal integration, composition, coverage, and phylogenetic nesting must all survive contamination controls." :
          "<strong>De novo birth is established by the ancestral state at the same locus.</strong> An intact lineage-specific ORF must align to unambiguously non-coding syntenic sequence in outgroups and show translation; failure to find a homolog alone cannot distinguish birth from rapid divergence or deletion.";
        return;
      }

      if (genomeView === "hazard") {
        const lineage = hazardLineage === "human" ? { ne: 1e4, u: 1.3e-8 } : { ne: 1e8, u: 1e-10 };
        const result = genomeEvolutionModel({
          kind: "hazard", ne: lineage.ne, mutationRate: lineage.u, criticalPositions: hazardK,
        });
        parts.visual.replaceChildren(
          barBoard(el, [
            { label: "|Nₑs| from this insertion", value: result.strength, display: compact(result.strength, 4), tone: result.visible ? "signal" : "warning" },
            { label: "selection visibility boundary", value: 1, display: "1.000", tone: "active" },
          ], "Mutational-hazard strength", 1),
          statusStrip(el, [
            { label: "lineage", value: hazardLineage },
            { label: "Nₑu", value: compact(result.ne * result.mutationRate, 3), tone: "active" },
            { label: "vulnerable positions k", value: result.criticalPositions },
            { label: "k needed for |Nₑs|≈1", value: compact(result.detectablePositions, 0), tone: "signal" },
          ], "Mutational-hazard inequality")
        );
        parts.controls.replaceChildren(
          choiceRow(el, [
            { label: "family relationships", value: "relationships" },
            { label: "origin claims", value: "claims" },
            { label: "mutational hazard", value: "hazard" },
            { label: "two pangenomes", value: "pangenome" },
          ], genomeView, (value) => { genomeView = value; render(); }, "Genome-evolution evidence"),
          choiceRow(el, [
            { label: "human lineage", value: "human" }, { label: "bacterial lineage", value: "bacteria" },
          ], hazardLineage, (value) => { hazardLineage = value; render(); }, "Lineage-specific rate fixture"),
          rangeControl(el, "Harmful target positions k", hazardK, {
            min: 1, max: 10000, step: 1, format: (value) => compact(value, 0),
          }, (value) => { hazardK = value; render(); })
        );
        parts.rail.replaceChildren(causalRail(el, [
          { label: "extra sequence", value: hazardK + " vulnerable positions" },
          { label: "per-base mutation", value: compact(result.mutationRate, 2) },
          { label: "fitness cost", value: "s ≈ −u·k = " + compact(result.selection, 2) },
          { label: "selection sees it?", value: result.visible ? "yes · |Nₑs| ≥ 1" : "no · drift barrier" },
        ]));
        parts.explanation.innerHTML = "<strong>Use the mutation rate of the lineage, not a universal constant.</strong> Human per-generation mutation sums hundreds of germline divisions; a bacterial generation is one replication. Nₑ differs by roughly 10,000-fold, but u partly offsets it, leaving about a 100-fold difference in the mutational hazard selection can resolve.";
        return;
      }

      const result = genomeEvolutionModel({ kind: "pangenome", alpha: panAlpha, genomes: panGenomes, k: 450, initial: 3200 });
      parts.visual.innerHTML = pangenomeSvg(result);
      parts.visual.append(processBoard(el, [
        { label: "bacterial pan-genome", value: "core + strain-specific accessory genes", tone: "active" },
        { label: "power-law test", value: "new genes ∝ N^−α" },
        { label: "human pangenome", value: "graph reference of alternate haplotypes", tone: "signal" },
        { label: "shared word", value: "different biological and computational objects" },
      ], "Two meanings of pangenome"));
      parts.controls.replaceChildren(
        choiceRow(el, [
          { label: "family relationships", value: "relationships" },
          { label: "origin claims", value: "claims" },
          { label: "mutational hazard", value: "hazard" },
          { label: "two pangenomes", value: "pangenome" },
        ], genomeView, (value) => { genomeView = value; render(); }, "Genome-evolution evidence"),
        rangeControl(el, "Power-law exponent α", panAlpha, {
          min: 0.3, max: 1.5, step: 0.02, format: (value) => value.toFixed(2),
        }, (value) => { panAlpha = value; render(); }),
        rangeControl(el, "Genomes sequenced", panGenomes, {
          min: 2, max: 500, step: 1, format: (value) => value.toFixed(0),
        }, (value) => { panGenomes = value; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { label: "sequence strains", value: panGenomes + " genomes" },
        { label: "new-gene decay", value: "α = " + result.alpha.toFixed(2) },
        { label: "integrated repertoire", value: compact(result.total, 0) + " genes" },
        { label: "limit", value: result.open ? "open · continues growing" : "closed · converges" },
      ]));
      parts.explanation.innerHTML = "<strong>For bacteria, openness is a biological claim about gene content.</strong> α < 1 makes the integrated repertoire diverge as more strains are sampled; α > 1 gives a finite limit. The human pangenome instead is a graph data structure representing alternate haplotypes for less biased alignment.";
    }

    function render() {
      parts.tabHost.replaceChildren(modeTabs());
      if (mode === "origins") renderOrigins();
      else if (mode === "fates") renderFates();
      else if (mode === "clock") renderClock();
      else renderFamilies();
    }

    predict(body, {
      widget: "genome-evolution-lab",
      question: "For Nₑ = 10⁴, s = 0.01, φ = 10⁻⁴, and regulatory/coding null ratio r = 1, which duplicate-preservation route is more probable?",
      hint: "Compare 4Nₑsφ/(4Nₑsφ+1) with 2r²/(1+2r)².",
      options: [
        { label: "Neofunctionalisation ≈ 98%" },
        { label: "DDC ≈ 22%, versus neo ≈ 4%", correct: true },
        { label: "Both are exactly Nₑ-independent" },
        { label: "Neither can preserve duplicates" },
      ],
    }, () => {
      mode = "fates";
      fateLogNe = 4;
      fateS = 0.01;
      fateLogPhi = -4;
      fateR = 1;
      parts.instrument.hidden = false;
      render();
    });
    finishLab(parts, body);
  });

  /* Ch 35A — Speciation, ecological genetics, and conservation -------- */

  define("speciation-conservation-lab", {
    "ch35a-o1": "Species-concept mode applies a cross, a tree, or a sympatric genotype-cluster operation to asexual, fossil, allopatric, and hybridising fixtures and returns an explicit no-answer state where the operation is undefined.",
    "ch35a-o2": "Barrier mode passes surviving gene flow through ordered pre- and postzygotic gates, computes one minus the product of survival fractions, and separates reinforcement's direct premating advantage from postzygotic by-product evolution.",
    "ch35a-o3": "The DMI snowball splits derived substitutions between lineages, draws only cross-lineage untested pairs, and grows expected incompatibilities as p times k times K-minus-k rather than linearly.",
    "ch35a-o4": "Haldane mode compares hemizygous cost 1 with homogametic cost 2h and then tests dominance against ZW, unbalanced-female, and marsupial observations that require a composite mechanism.",
    "ch35a-o5": "Hybrid-zone mode fits a spatial cline, inverts width under named Bazykin, Barton, or ecotone constants, and pairs it with ABBA-BABA asymmetry while preserving ghost-lineage, ancestral-structure, and direction limits.",
    "ch35a-o6": "Reciprocal-transplant mode evaluates local-versus-foreign comparisons inside each site, while the outlier state manufactures high FST through isolation by distance, allele surfing, or background selection without local adaptation.",
    "ch35a-o7": "Conservation mode computes sex-ratio Ne, the per-generation inbreeding increment, and sustained migrant currency before applying an outbreeding-risk screen and distinguishing transient masking from durable rescue.",
  }, ({ body, el, predict }) => {
    const parts = labParts(el);
    let mode = "concepts";
    let speciesScenario = "hybridising";
    let speciesConcept = "cluster";
    let barrierView = "isolation";
    let barrierOne = 0.5;
    let barrierTwo = 0.5;
    let barrierThree = 0;
    let dmiSubstitutions = 20;
    let dmiProbability = 0.02;
    let haldaneH = 0.25;
    let haldaneEvidence = "zw";
    let zoneView = "cline";
    let clineSigma = 0.99;
    let clineWidth = 6.05;
    let clineModel = "bazykin";
    let abba = 120;
    let baba = 80;
    let managementView = "transplant";
    let transplantScenario = "local";
    let outlierCause = "adaptation";
    let rescueMales = 10;
    let rescueFemales = 90;
    let rescueMigrants = 2;
    let rescueRisk = "screened";

    function modeTabs() {
      return tabs(el, [
        { label: "Draw a species boundary", value: "concepts" },
        { label: "Stack barriers", value: "barriers" },
        { label: "Read a hybrid zone", value: "zones" },
        { label: "Adaptation & rescue", value: "management" },
      ], mode, (value) => { mode = value; render(); });
    }

    function renderConcepts() {
      const result = speciationBoundaryModel({ kind: "concept", scenario: speciesScenario, concept: speciesConcept });
      parts.visual.replaceChildren(conceptBoard(el, result));
      parts.controls.replaceChildren(
        choiceRow(el, [
          { label: "asexual lineage", value: "asexual" },
          { label: "fossil series", value: "fossil" },
          { label: "allopatric pair", value: "allopatric" },
          { label: "hybridising pair", value: "hybridising" },
        ], speciesScenario, (value) => { speciesScenario = value; render(); }, "Species-boundary scenario"),
        choiceRow(el, [
          { label: "biological · cross", value: "biological" },
          { label: "phylogenetic · tree", value: "phylogenetic" },
          { label: "genotypic · clusters", value: "cluster" },
        ], speciesConcept, (value) => { speciesConcept = value; render(); }, "Species concept operation")
      );
      parts.rail.replaceChildren(causalRail(el, [
        { label: "organisms supplied", value: speciesScenario },
        { label: "operation chosen", value: speciesConcept },
        { label: "evidence returned", value: result.outcome },
        { label: "scope boundary", value: result.boundary },
      ]));
      parts.explanation.innerHTML = "<strong>Species concepts are different operations, not rival wordings of one threshold.</strong> A cross asks whether gene pools merge, a tree asks whether a lineage is diagnosable, and a sympatric histogram asks whether genotype clusters fuse. Reporting no answer is more scientific than forcing an operation outside its domain.";
    }

    function renderBarriers() {
      if (barrierView === "isolation") {
        const result = speciationBoundaryModel({ kind: "barriers", barriers: [barrierOne, barrierTwo, barrierThree] });
        parts.visual.replaceChildren(barrierBoard(el, result));
        parts.controls.replaceChildren(
          choiceRow(el, [
            { label: "sequential isolation", value: "isolation" },
            { label: "DMI snowball", value: "dmi" },
            { label: "Haldane mechanisms", value: "haldane" },
          ], barrierView, (value) => { barrierView = value; render(); }, "Barrier mechanism"),
          rangeControl(el, "Prezygotic barrier", barrierOne, {
            min: 0, max: 1, step: 0.01, format: (value) => percent(value, 0),
          }, (value) => { barrierOne = value; render(); }),
          rangeControl(el, "Extrinsic postzygotic barrier", barrierTwo, {
            min: 0, max: 1, step: 0.01, format: (value) => percent(value, 0),
          }, (value) => { barrierTwo = value; render(); }),
          rangeControl(el, "Intrinsic postzygotic barrier", barrierThree, {
            min: 0, max: 1, step: 0.01, format: (value) => percent(value, 0),
          }, (value) => { barrierThree = value; render(); })
        );
        parts.rail.replaceChildren(causalRail(el, [
          { label: "encounters", value: "100% potential gene flow" },
          { label: "early gate", value: percent(barrierOne, 0) + " blocked first" },
          { label: "later gates", value: "act only on survivors" },
          { label: "combined RI", value: percent(result.isolation, 1) },
        ]));
        parts.explanation.innerHTML = "<strong>Barrier strengths multiply through what remains.</strong> Early barriers dominate the realised accounting because later barriers see less gene flow. Reinforcement can directly favour premating discrimination where low-fitness hybrids are encountered; selection cannot favour a mutation merely because it makes the hybrid carrying it die.";
        return;
      }

      if (barrierView === "dmi") {
        const result = speciationBoundaryModel({
          kind: "dmi", substitutions: dmiSubstitutions, left: Math.round(dmiSubstitutions / 2), probability: dmiProbability,
        });
        parts.visual.innerHTML = dmiSvg(result);
        parts.controls.replaceChildren(
          choiceRow(el, [
            { label: "sequential isolation", value: "isolation" },
            { label: "DMI snowball", value: "dmi" },
            { label: "Haldane mechanisms", value: "haldane" },
          ], barrierView, (value) => { barrierView = value; render(); }, "Barrier mechanism"),
          rangeControl(el, "Total derived substitutions K", dmiSubstitutions, {
            min: 2, max: 80, step: 2, format: (value) => value.toFixed(0),
          }, (value) => { dmiSubstitutions = value; render(); }),
          rangeControl(el, "Incompatibility probability p", dmiProbability, {
            min: 0.001, max: 0.10, step: 0.001, format: (value) => percent(value, 1),
          }, (value) => { dmiProbability = value; render(); })
        );
        parts.rail.replaceChildren(causalRail(el, [
          { label: "ancestor", value: "aabb · all existing pairs tested" },
          { label: "separate lineages", value: result.left + " A-side · " + result.right + " B-side derived alleles" },
          { label: "first hybrid", value: compact(result.untestedPairs, 0) + " novel cross-pairs" },
          { label: "snowball expectation", value: compact(result.expected, 2) + " incompatibilities" },
        ]));
        parts.explanation.innerHTML = "<strong>Both partners must be derived in different lineages.</strong> Otherwise their interaction was already tested inside an ancestor or one descendant population. The number of untested cross-lineage pairs is k(K−k), maximised at K²/4, so doubling divergence creates four times the opportunity for incompatibility.";
        return;
      }

      const result = speciationBoundaryModel({ kind: "haldane", dominance: haldaneH });
      const evidence = {
        zw: ["ZW birds and butterflies", "female heterogametic sex still fails", "rules out faster-male as a general explanation"],
        unbalanced: ["hemizygous hybrid females", "die at the same stage as hybrid males", "supports exposure of recessive X effects"],
        marsupial: ["both sexes functionally X-hemizygous", "male sterility persists", "dominance alone cannot explain sterility"],
      };
      parts.visual.replaceChildren(haldaneBoard(el, result), processBoard(el, [
        { label: "observation", value: evidence[haldaneEvidence][0], tone: "active" },
        { label: "pattern", value: evidence[haldaneEvidence][1] },
        { label: "mechanistic verdict", value: evidence[haldaneEvidence][2], tone: "signal" },
      ], "Evidence separates dominance from faster-male"));
      parts.controls.replaceChildren(
        choiceRow(el, [
          { label: "sequential isolation", value: "isolation" },
          { label: "DMI snowball", value: "dmi" },
          { label: "Haldane mechanisms", value: "haldane" },
        ], barrierView, (value) => { barrierView = value; render(); }, "Barrier mechanism"),
        rangeControl(el, "Dominance h", haldaneH, {
          min: 0, max: 1, step: 0.01, format: (value) => value.toFixed(2),
        }, (value) => { haldaneH = value; render(); }),
        choiceRow(el, [
          { label: "ZW taxa", value: "zw" },
          { label: "unbalanced females", value: "unbalanced" },
          { label: "marsupials", value: "marsupial" },
        ], haldaneEvidence, (value) => { haldaneEvidence = value; render(); }, "Discriminating observation")
      );
      parts.rail.replaceChildren(causalRail(el, [
        { label: "X/Z incompatibility", value: "partially recessive h = " + result.dominance.toFixed(2) },
        { label: "heterogametic cost", value: result.heterogameticCost.toFixed(2) },
        { label: "homogametic cost", value: result.homogameticCost.toFixed(2) },
        { label: "composite verdict", value: evidence[haldaneEvidence][2] },
      ]));
      parts.explanation.innerHTML = "<strong>Haldane's rule is composite.</strong> Dominance explains inviability and its symmetry across XY and ZW systems when h < 1/2. Faster-male contributes to sterility in male-heterogametic taxa; faster-X and meiotic drive can amplify both. Large-X is a separate claim about chromosome contribution and must control assay power.";
    }

    function renderZones() {
      if (zoneView === "cline") {
        const result = speciationBoundaryModel({
          kind: "cline", sigma: clineSigma, width: clineWidth, model: clineModel,
        });
        parts.visual.innerHTML = clineSvg(result);
        parts.visual.append(statusStrip(el, [
          { label: "dispersal σ", value: result.sigma.toFixed(2) + " km", tone: "active" },
          { label: "cline width w", value: result.width.toFixed(2) + " km" },
          { label: "model constant", value: result.constant.toFixed(2) },
          { label: "selection s", value: percent(result.selection, 1), tone: "signal" },
        ], "Diffusion-selection cline inversion"));
        parts.controls.replaceChildren(
          choiceRow(el, [
            { label: "cline balance", value: "cline" }, { label: "ABBA–BABA", value: "introgression" },
          ], zoneView, (value) => { zoneView = value; render(); }, "Hybrid-zone evidence"),
          rangeControl(el, "Dispersal σ", clineSigma, {
            min: 0.1, max: 3, step: 0.01, format: (value) => value.toFixed(2) + " km",
          }, (value) => { clineSigma = value; render(); }),
          rangeControl(el, "Observed cline width w", clineWidth, {
            min: 1, max: 20, step: 0.05, format: (value) => value.toFixed(2) + " km",
          }, (value) => { clineWidth = value; render(); }),
          choiceRow(el, [
            { label: "Bazykin · 8", value: "bazykin" },
            { label: "Barton · 2.5²", value: "barton" },
            { label: "ecotone · 1.7²", value: "ecotone" },
          ], clineModel, (value) => { clineModel = value; render(); }, "Cline selection model")
        );
        parts.rail.replaceChildren(causalRail(el, [
          { label: "dispersal", value: "spreads ancestry as σ√t" },
          { label: "selection", value: "removes hybrids over ~1/s" },
          { label: "stationary width", value: "w ∝ σ/√s" },
          { label: "model-specific inverse", value: "s = " + result.constant.toFixed(2) + "(σ/w)²" },
        ]));
        parts.explanation.innerHTML = "<strong>The scaling exponent is robust; the prefactor is a model choice.</strong> The chapter toad fixture gives about 21% under Bazykin, 17% under Barton, and a smaller ecotone estimate. Report the constant, and seek an independent LD-based estimate before trusting the fit.";
        return;
      }

      const result = speciationBoundaryModel({ kind: "patterson", abba, baba });
      parts.visual.replaceChildren(
        barBoard(el, [
          { label: "ABBA blocks", value: result.abba, display: compact(result.abba, 0), tone: "active" },
          { label: "BABA blocks", value: result.baba, display: compact(result.baba, 0), tone: "signal" },
        ], "Patterson pattern counts", Math.max(result.abba, result.baba)),
        statusStrip(el, [
          { label: "D", value: result.d.toFixed(3), tone: Math.abs(result.d) > 0.05 ? "warning" : "signal" },
          { label: "ILS expectation", value: "0 · symmetric" },
          { label: "valid endpoint", value: result.d === 0 ? "consistent with ILS symmetry" : "not ILS alone" },
        ], "ABBA-BABA asymmetry")
      );
      parts.controls.replaceChildren(
        choiceRow(el, [
          { label: "cline balance", value: "cline" }, { label: "ABBA–BABA", value: "introgression" },
        ], zoneView, (value) => { zoneView = value; render(); }, "Hybrid-zone evidence"),
        rangeControl(el, "ABBA blocks", abba, {
          min: 0, max: 300, step: 1, format: (value) => value.toFixed(0),
        }, (value) => { abba = value; render(); }),
        rangeControl(el, "BABA blocks", baba, {
          min: 0, max: 300, step: 1, format: (value) => value.toFixed(0),
        }, (value) => { baba = value; render(); })
      );
      parts.rail.replaceChildren(causalRail(el, [
        { label: "known topology", value: "(((P1,P2),P3),O)" },
        { label: "ILS null", value: "E[ABBA] = E[BABA]" },
        { label: "observed asymmetry", value: "D = " + result.d.toFixed(3) },
        { label: "boundary", value: "ghost lineages, ancestral structure, direction unresolved" },
      ]));
      parts.explanation.innerHTML = "<strong>D ≠ 0 rejects ILS alone; it does not narrate the transfer.</strong> A block jackknife supplies uncertainty because nearby sites are linked. Ghost lineages and ancestral structure can create the same asymmetry, and the sign does not identify direction without additional sampling.";
    }

    function renderManagement() {
      if (managementView === "transplant") {
        const fixtures = {
          local: { aa: 1.4, ab: 0.7, ba: 0.8, bb: 1.3 },
          site: { aa: 1.4, ab: 0.7, ba: 1.4, bb: 0.7 },
          superior: { aa: 1.4, ab: 1.2, ba: 1.0, bb: 0.9 },
        };
        const result = speciationBoundaryModel(Object.assign({ kind: "transplant" }, fixtures[transplantScenario]));
        parts.visual.replaceChildren(transplantBoard(el, result));
        parts.controls.replaceChildren(
          choiceRow(el, [
            { label: "reciprocal transplant", value: "transplant" },
            { label: "FST outlier", value: "outliers" },
            { label: "genetic rescue", value: "rescue" },
          ], managementView, (value) => { managementView = value; render(); }, "Ecological-genetics decision"),
          choiceRow(el, [
            { label: "local adaptation", value: "local" },
            { label: "site-quality effect", value: "site" },
            { label: "A superior everywhere", value: "superior" },
          ], transplantScenario, (value) => { transplantScenario = value; render(); }, "Transplant fixture")
        );
        parts.rail.replaceChildren(causalRail(el, [
          { label: "two populations", value: "A and B" },
          { label: "two environments", value: "site A and site B" },
          { label: "within-site contrasts", value: "local versus foreign" },
          { label: "definition", value: result.locallyAdapted ? "each local wins at home" : "local adaptation not established" },
        ]));
        parts.explanation.innerHTML = result.locallyAdapted ?
          "<strong>Crossing reaction norms give the required local-versus-foreign inequalities.</strong> Each genotype is compared with the foreign genotype inside the same site, so site quality cancels. A common generation is still needed to separate genetic effects from maternal carry-over." :
          "<strong>A G×E or home advantage is not automatically local adaptation.</strong> One population must beat the foreign population at site A and the other must win at site B. Non-crossing lines or a universally better site fail that definition.";
        return;
      }

      if (managementView === "outliers") {
        const causes = {
          adaptation: ["named environmental selection", "high FST plus genotype–environment association", "functional or transplant validation"],
          ibd: ["isolation by distance", "hierarchical covariance broadens the neutral tail", "fit spatial demographic null"],
          surfing: ["range expansion", "front allele rides serial founder events", "model colonisation history"],
          bgs: ["background selection", "low recombination lowers within-population diversity", "condition on recombination and gene density"],
        };
        parts.visual.replaceChildren(processBoard(el, [
          { label: "generator", value: causes[outlierCause][0], tone: outlierCause === "adaptation" ? "signal" : "warning" },
          { label: "why FST rises", value: causes[outlierCause][1] },
          { label: "required control", value: causes[outlierCause][2], tone: "active" },
          { label: "legitimate endpoint", value: outlierCause === "adaptation" ? "candidate local-adaptation locus" : "neutral outlier explained" },
        ], "FST outlier null-model audit"));
        parts.controls.replaceChildren(
          choiceRow(el, [
            { label: "reciprocal transplant", value: "transplant" },
            { label: "FST outlier", value: "outliers" },
            { label: "genetic rescue", value: "rescue" },
          ], managementView, (value) => { managementView = value; render(); }, "Ecological-genetics decision"),
          choiceRow(el, [
            { label: "local selection", value: "adaptation" },
            { label: "isolation by distance", value: "ibd" },
            { label: "allele surfing", value: "surfing" },
            { label: "background selection", value: "bgs" },
          ], outlierCause, (value) => { outlierCause = value; render(); }, "Outlier generator")
        );
        parts.rail.replaceChildren(causalRail(el, [
          { label: "genome scan", value: "upper FST tail" },
          { label: "candidate cause", value: causes[outlierCause][0] },
          { label: "null refinement", value: causes[outlierCause][2] },
          { label: "validation", value: "named environment + phenotype / function" },
        ]));
        parts.explanation.innerHTML = "<strong>An FST outlier is a hypothesis, not a selected gene.</strong> Spatial structure, serial founder events, and background selection all manufacture the upper tail under neutrality. Fit demography and genomic covariates, correct multiplicity, prefer a named environmental association, then validate experimentally.";
        return;
      }

      const result = speciationBoundaryModel({
        kind: "conservation", males: rescueMales, females: rescueFemales, migrants: rescueMigrants,
      });
      const risk = rescueRisk === "screened" ?
        ["same species · no fixed rearrangements", "similar environment · recent gene flow", "low screened risk; monitor through F3"] :
        ["different environment or rearrangement", "co-adapted combinations may break in F2/F3", "find a closer source or manage in situ"];
      parts.visual.replaceChildren(
        statusStrip(el, [
          { label: "breeding census", value: result.males + result.females },
          { label: "sex-ratio Nₑ", value: result.ne.toFixed(1), tone: "active" },
          { label: "ΔF / generation", value: percent(result.inbreedingRate, 2), tone: result.inbreedingRate > 0.01 ? "warning" : "signal" },
          { label: "Nₑm estimate", value: result.nem.toFixed(2), tone: result.nem >= 1 ? "signal" : "warning" },
        ], "Managed-population genetic arithmetic"),
        processBoard(el, [
          { label: "risk screen", value: risk[0], tone: rescueRisk === "screened" ? "signal" : "warning" },
          { label: "counter-risk", value: risk[1] },
          { label: "decision", value: risk[2], tone: "active" },
          { label: "mechanism", value: "heterozygosity masks load; it does not purge fixed load" },
        ], "Genetic-rescue decision")
      );
      parts.controls.replaceChildren(
        choiceRow(el, [
          { label: "reciprocal transplant", value: "transplant" },
          { label: "FST outlier", value: "outliers" },
          { label: "genetic rescue", value: "rescue" },
        ], managementView, (value) => { managementView = value; render(); }, "Ecological-genetics decision"),
        rangeControl(el, "Breeding males Nₘ", rescueMales, {
          min: 1, max: 100, step: 1, format: (value) => value.toFixed(0),
        }, (value) => { rescueMales = value; render(); }),
        rangeControl(el, "Breeding females Nf", rescueFemales, {
          min: 1, max: 100, step: 1, format: (value) => value.toFixed(0),
        }, (value) => { rescueFemales = value; render(); }),
        rangeControl(el, "Migrants per generation", rescueMigrants, {
          min: 0, max: 10, step: 1, format: (value) => value.toFixed(0),
        }, (value) => { rescueMigrants = value; render(); }),
        choiceRow(el, [
          { label: "low-risk source screened", value: "screened" },
          { label: "ecology/rearrangement mismatch", value: "risky" },
        ], rescueRisk, (value) => { rescueRisk = value; render(); }, "Outbreeding-depression screen")
      );
      parts.rail.replaceChildren(causalRail(el, [
        { label: "sex ratio", value: rescueMales + " males · " + rescueFemales + " females" },
        { label: "effective size", value: "Nₑ = " + result.ne.toFixed(1) },
        { label: "ongoing gene flow", value: rescueMigrants + " migrants · Nₑm " + result.nem.toFixed(2) },
        { label: "management endpoint", value: risk[2] },
      ]));
      parts.explanation.innerHTML = "<strong>One migrant can mask load briefly; rescue requires durable population arithmetic.</strong> Unequal sex ratio lowers Nₑ and raises inbreeding even without behavioural inbreeding. This teaching calculation approximates m as immigrant breeders divided by the breeding census; real reproductive contribution must be estimated. Sustained gene flow near Nₑm of order one is the useful currency, with the source screened for chromosomal, environmental, and historical mismatch and descendants monitored through F3.";
    }

    function render() {
      parts.tabHost.replaceChildren(modeTabs());
      if (mode === "concepts") renderConcepts();
      else if (mode === "barriers") renderBarriers();
      else if (mode === "zones") renderZones();
      else renderManagement();
    }

    predict(body, {
      widget: "speciation-conservation-lab",
      question: "Two reproductive barriers each block 50% of the gene flow that reaches them. What is their combined reproductive isolation?",
      hint: "The second barrier acts only on the half that passes the first.",
      options: [
        { label: "50%" },
        { label: "75%", correct: true },
        { label: "100%" },
        { label: "25%" },
      ],
    }, () => {
      mode = "barriers";
      barrierView = "isolation";
      barrierOne = 0.5;
      barrierTwo = 0.5;
      barrierThree = 0;
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
