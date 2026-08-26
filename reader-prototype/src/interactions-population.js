/* ── Population-genetics interaction wave ───────────────────────────────
   Objective-mapped Hero Labs for Chapters 26–29. The population—not an
   individual—is the state: genotype mixtures, replicate trajectories,
   ancestry tracts, and haplotype correlations remain visible while learners
   change the process that moves them. Models are pure and deterministic when
   seeded so the scientific claims can be fixture-tested without a browser.
   ───────────────────────────────────────────────────────────────────────── */

(function (global) {
  "use strict";

  const definitions = {};
  const models = {};
  const coverage = {};
  const kit = global.ReaderInteractionKit;
  if (!kit) throw new Error("ReaderInteractionKit must load before population-genetics labs");

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
      instrument: el("div", { class: "hero-lab population-lab", hidden: true }),
      tabHost: el("div"),
      visual: el("div", { class: "lab-visual population-visual" }),
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
    const max = maximum || Math.max(1e-12, ...rows.map((row) => row.value));
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
          style: "width:" + clamp(100 * row.value / max, 0, 100).toFixed(2) + "%",
        }),
      ]),
      el("strong", { text: row.display == null ? String(row.value) : String(row.display) }),
    ])));
    return board;
  }

  function beadField(el, groups, label, total) {
    const n = total || 100;
    const normalized = [];
    let cursor = 0;
    groups.forEach((group, index) => {
      const end = index === groups.length - 1
        ? n
        : Math.round(cursor + group.value * n);
      for (let i = cursor; i < end; i += 1) normalized.push(group);
      cursor = end;
    });
    while (normalized.length < n) normalized.push(groups[groups.length - 1]);
    const field = el("div", {
      class: "pop-bead-field",
      role: "img",
      "aria-label": label + ". " + groups.map((group) =>
        group.label + " " + percent(group.value, 1)
      ).join(", "),
    });
    normalized.slice(0, n).forEach((group) => field.append(el("span", {
      class: "pop-bead is-" + (group.tone || "neutral"),
      text: group.symbol || "•",
      "aria-hidden": "true",
    })));
    return field;
  }

  function textSvg(html, label, viewBox, extraClass) {
    return '<svg class="lab-diagram population-diagram ' + (extraClass || "") +
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

  function binomial(n, probability, random) {
    let count = 0;
    for (let index = 0; index < n; index += 1) {
      if (random() < probability) count += 1;
    }
    return count;
  }

  function hweExactPValue(observedHets, observedHomA, observedHoma) {
    const n = observedHets + observedHomA + observedHoma;
    const rareHom = Math.min(observedHomA, observedHoma);
    const rareCopies = 2 * rareHom + observedHets;
    if (!n || rareCopies === 0 || rareCopies === 2 * n) return 1;

    const probabilities = new Array(rareCopies + 1).fill(0);
    let midpoint = Math.floor(rareCopies * (2 * n - rareCopies) / (2 * n));
    if ((midpoint & 1) !== (rareCopies & 1)) midpoint += 1;

    let heterozygotes = midpoint;
    let rareHomozygotes = (rareCopies - midpoint) / 2;
    let commonHomozygotes = n - heterozygotes - rareHomozygotes;
    probabilities[midpoint] = 1;
    let total = 1;

    while (heterozygotes > 1) {
      probabilities[heterozygotes - 2] = probabilities[heterozygotes] *
        heterozygotes * (heterozygotes - 1) /
        (4 * (rareHomozygotes + 1) * (commonHomozygotes + 1));
      total += probabilities[heterozygotes - 2];
      heterozygotes -= 2;
      rareHomozygotes += 1;
      commonHomozygotes += 1;
    }

    heterozygotes = midpoint;
    rareHomozygotes = (rareCopies - midpoint) / 2;
    commonHomozygotes = n - heterozygotes - rareHomozygotes;
    while (heterozygotes <= rareCopies - 2) {
      probabilities[heterozygotes + 2] = probabilities[heterozygotes] *
        4 * rareHomozygotes * commonHomozygotes /
        ((heterozygotes + 2) * (heterozygotes + 1));
      total += probabilities[heterozygotes + 2];
      heterozygotes += 2;
      rareHomozygotes -= 1;
      commonHomozygotes -= 1;
    }

    const observedProbability = probabilities[observedHets] / total;
    let pValue = 0;
    probabilities.forEach((probability) => {
      const normalized = probability / total;
      if (normalized <= observedProbability + 1e-12) pValue += normalized;
    });
    return clamp(pValue, 0, 1);
  }

  function hardyWeinbergModel(input) {
    if (input.kind === "reunion") {
      const p = clamp(input.p, 0, 1);
      const q = 1 - p;
      const departure = clamp(input.departure, -1, 1);
      const negativeBound = Math.min(p * p, q * q);
      const d = departure >= 0 ? departure * p * q : departure * negativeBound;
      const parental = {
        AA: p * p + d,
        Aa: 2 * p * q - 2 * d,
        aa: q * q + d,
      };
      const offspring = { AA: p * p, Aa: 2 * p * q, aa: q * q };
      return {
        p, q, d, parental, offspring,
        alleleFromParents: parental.AA + parental.Aa / 2,
        alleleFromOffspring: offspring.AA + offspring.Aa / 2,
      };
    }

    if (input.kind === "assumption") {
      const p = clamp(input.p, 0.001, 0.999);
      const q = 1 - p;
      const strength = clamp(input.strength, 0, 1);
      if (input.assumption === "mating") {
        const F = 0.25 * strength;
        return {
          mechanism: "the two gamete draws are correlated",
          genotype: "heterozygosity × " + (1 - F).toFixed(3),
          allele: "p unchanged",
          scale: "F = " + F.toFixed(3),
          frequencyStage: "Mating-structured adult genotype frequencies",
          frequencies: { AA: p * p + F * p * q, Aa: 2 * p * q * (1 - F), aa: q * q + F * p * q },
        };
      }
      if (input.assumption === "selection") {
        const s = strength;
        const meanFitness = 1 - s * q * q;
        const qAfter = meanFitness ? q * (p + q * (1 - s)) / meanFitness : 0;
        return {
          mechanism: "aa viability is multiplied by " + (1 - s).toFixed(2),
          genotype: "census is no longer the zygote pool",
          allele: "q → " + qAfter.toFixed(4),
          scale: "Δq = " + (qAfter - q).toExponential(2),
          qAfter,
          frequencyStage: "Post-selection adult genotype frequencies",
          frequencies: { AA: p * p / meanFitness, Aa: 2 * p * q / meanFitness, aa: q * q * (1 - s) / meanFitness },
        };
      }
      if (input.assumption === "mutation") {
        const mu = strength * 1e-5;
        const qAfter = q + mu * p;
        const pAfter = 1 - qAfter;
        return {
          mechanism: "A mutates to a at μ = " + mu.toExponential(1),
          genotype: "next zygote pool follows the shifted q",
          allele: "q → " + qAfter.toFixed(6),
          scale: "Δq = " + (qAfter - q).toExponential(2),
          qAfter,
          frequencyStage: "Next zygote genotype frequencies after mutation",
          frequencies: { AA: pAfter * pAfter, Aa: 2 * pAfter * qAfter, aa: qAfter * qAfter },
        };
      }
      if (input.assumption === "migration") {
        const m = 0.1 * strength;
        const sourceQ = 0.9;
        const qAfter = (1 - m) * q + m * sourceQ;
        const pAfter = 1 - qAfter;
        return {
          mechanism: percent(m, 1) + " of the pool comes from q = 0.90",
          genotype: "pooling can also create a Wahlund deficit",
          allele: "q → " + qAfter.toFixed(4),
          scale: "Δq = " + (qAfter - q).toFixed(4),
          qAfter,
          frequencyStage: "Next zygote genotype frequencies after migration",
          frequencies: { AA: pAfter * pAfter, Aa: 2 * pAfter * qAfter, aa: qAfter * qAfter },
        };
      }
      const n = Math.max(10, Math.round(1010 - strength * 1000));
      return {
        mechanism: "2N alleles are a finite binomial sample",
        genotype: "expected HWE conditional on realised p",
        allele: "E[q′] = q",
        scale: "SD(q′) = " + Math.sqrt(p * q / (2 * n)).toFixed(4),
        frequencyStage: "Expected genotype frequencies conditional on realised allele frequency",
        frequencies: { AA: p * p, Aa: 2 * p * q, aa: q * q },
      };
    }

    if (input.kind === "test") {
      const observed = {
        AA: Math.max(0, Math.round(input.AA)),
        Aa: Math.max(0, Math.round(input.Aa)),
        aa: Math.max(0, Math.round(input.aa)),
      };
      const n = observed.AA + observed.Aa + observed.aa;
      const p = n ? (2 * observed.AA + observed.Aa) / (2 * n) : 0;
      const q = 1 - p;
      const expected = { AA: n * p * p, Aa: n * 2 * p * q, aa: n * q * q };
      let chiSquare = 0;
      Object.keys(observed).forEach((key) => {
        if (expected[key] > 0) chiSquare += Math.pow(observed[key] - expected[key], 2) / expected[key];
      });
      const pq = p * q;
      const d = n ? observed.AA / n - p * p : 0;
      const F = pq ? d / pq : 0;
      const exactP = hweExactPValue(observed.Aa, observed.AA, observed.aa);
      const minExpected = Math.min(expected.AA, expected.Aa, expected.aa);
      const diagnosis = F > 1e-9
        ? "heterozygote deficit: inspect dropout, structure, or inbreeding"
        : F < -1e-9
          ? "heterozygote excess: inspect paralogues, CNV, or contamination"
          : "no directional departure";
      return {
        observed, expected, n, p, q, d, F, chiSquare, exactP, minExpected,
        recommendedTest: minExpected < 5 ? "exact test" : "χ² approximation",
        diagnosis,
        nFor80: Math.abs(F) > 1e-12 ? 7.85 / (F * F) : Infinity,
      };
    }

    if (input.kind === "xLinked") {
      let female = clamp(input.female, 0, 1);
      let male = clamp(input.male, 0, 1);
      const conserved = (2 * female + male) / 3;
      const series = [{ generation: 0, female, male }];
      for (let generation = 1; generation <= input.generations; generation += 1) {
        const nextMale = female;
        const nextFemale = (female + male) / 2;
        female = nextFemale;
        male = nextMale;
        series.push({ generation, female, male });
      }
      return {
        series, female, male, conserved,
        difference: female - male,
        predictedDifference: Math.pow(-0.5, input.generations) *
          (input.female - input.male),
      };
    }

    if (input.kind === "risk") {
      const incidence = clamp(input.incidence, 1e-12, 0.99);
      const q = Math.sqrt(incidence);
      const p = 1 - q;
      const carrier = 2 * p * q;
      const shortcut = 2 * q;
      return {
        incidence, p, q, carrier, shortcut,
        shortcutRelativeError: shortcut / carrier - 1,
        carriersPerAffected: carrier / incidence,
        fractionHidden: p,
      };
    }

    throw new Error("Unknown Hardy-Weinberg model");
  }
  models.hardyWeinberg = hardyWeinbergModel;

  function selectionStep(q, s, h) {
    const boundedQ = clamp(q, 0, 1);
    const p = 1 - boundedQ;
    const wAA = 1;
    const wAa = Math.max(0, 1 - h * s);
    const waa = Math.max(0, 1 - s);
    const meanFitness = p * p * wAA + 2 * p * boundedQ * wAa + boundedQ * boundedQ * waa;
    if (!meanFitness) return { q: boundedQ, meanFitness: 0, delta: 0 };
    const next = boundedQ * (boundedQ * waa + p * wAa) / meanFitness;
    return { q: clamp(next, 0, 1), meanFitness, delta: next - boundedQ };
  }

  function fixationProbability(p, ne, advantage) {
    const alpha = 4 * ne * advantage;
    if (Math.abs(alpha) < 1e-8) return p;
    if (alpha > 50) return 1 - Math.exp(-alpha * p);
    if (alpha < -50) {
      const magnitude = -alpha;
      if (magnitude > 700) return 0;
      return Math.exp(Math.log(Math.expm1(magnitude * p)) - Math.log(Math.expm1(magnitude)));
    }
    return Math.expm1(-alpha * p) / Math.expm1(-alpha);
  }

  function populationForcesModel(input) {
    if (input.kind === "trajectory") {
      const replicates = Math.max(1, Math.round(input.replicates || 1));
      const generations = Math.max(1, Math.round(input.generations));
      const trajectories = [];
      for (let replicate = 0; replicate < replicates; replicate += 1) {
        const random = mulberry32((input.seed || 1) + replicate * 104729);
        let q = clamp(input.q, 0, 1);
        const values = [q];
        for (let generation = 0; generation < generations; generation += 1) {
          q = selectionStep(q, input.s || 0, input.h == null ? 0.5 : input.h).q;
          q = q * (1 - (input.nu || 0)) + (1 - q) * (input.mu || 0);
          q = (1 - (input.m || 0)) * q + (input.m || 0) * (input.sourceQ == null ? q : input.sourceQ);
          if (input.ne) q = binomial(2 * Math.round(input.ne), clamp(q, 0, 1), random) /
            (2 * Math.round(input.ne));
          values.push(clamp(q, 0, 1));
        }
        trajectories.push(values);
      }
      const finalValues = trajectories.map((values) => values[values.length - 1]);
      const mean = finalValues.reduce((sum, value) => sum + value, 0) / finalValues.length;
      const variance = finalValues.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) /
        finalValues.length;
      return {
        trajectories, mean, variance,
        fixed: finalValues.filter((value) => value === 1).length,
        lost: finalValues.filter((value) => value === 0).length,
      };
    }

    if (input.kind === "balance") {
      const mu = Math.max(0, input.mu || 0);
      const s = Math.max(1e-12, input.s || 0);
      if (input.regime === "recessive") {
        return { equilibrium: Math.sqrt(mu / s), stability: "stable", formula: "√(μ/s)" };
      }
      if (input.regime === "dominant") {
        const h = Math.max(1e-9, input.h == null ? 1 : input.h);
        return { equilibrium: mu / (h * s), stability: "stable", formula: "μ/(hs)" };
      }
      if (input.regime === "overdominance") {
        const s1 = Math.max(0, input.s1);
        const s2 = Math.max(0, input.s2);
        return {
          equilibrium: s1 + s2 ? s1 / (s1 + s2) : 0.5,
          stability: "stable",
          formula: "s₁/(s₁+s₂)",
        };
      }
      return { equilibrium: 0.5, stability: "unstable threshold", formula: "fitness-valley separatrix" };
    }

    if (input.kind === "migration") {
      const migrants = Math.max(0, input.n * input.m);
      return {
        migrants,
        fst: 1 / (1 + 4 * migrants),
        next: (1 - input.m) * input.q + input.m * input.sourceQ,
      };
    }

    if (input.kind === "effectiveSize") {
      const history = input.history.map((value) => Math.max(2, value));
      const harmonic = history.length / history.reduce((sum, value) => sum + 1 / value, 0);
      const maleFraction = clamp(input.maleFraction, 0.001, 0.999);
      const femaleFraction = 1 - maleFraction;
      const sexFactor = 4 * maleFraction * femaleFraction;
      const varianceFactor = 4 / (Math.max(0, input.offspringVariance) + 2);
      const rawAdjusted = harmonic * sexFactor * varianceFactor;
      const adjusted = Math.max(1, rawAdjusted);
      const scaled = adjusted * input.s;
      const magnitude = Math.abs(scaled);
      const category = magnitude < 0.1 ? "effectively neutral"
        : magnitude >= 10 ? (scaled > 0 ? "selection efficiently favours" : "selection efficiently purges")
          : "nearly neutral: drift and selection compete";
      const newMutationP = 1 / (2 * adjusted);
      return {
        harmonic, sexFactor, varianceFactor, rawAdjusted, adjusted, scaled, category,
        approximationFloored: rawAdjusted < 1,
        newMutationP,
        driftRate: 1 / (2 * adjusted),
        fixation: fixationProbability(newMutationP, adjusted, input.s),
      };
    }

    throw new Error("Unknown population-forces model");
  }
  models.populationForces = populationForcesModel;

  const PEDIGREE_FIXTURES = {
    unrelated: { label: "unrelated", paths: 0, n1: 0, n2: 0, F: 0, meioses: Infinity },
    firstCousins: { label: "first cousins", paths: 2, n1: 2, n2: 2, F: 1 / 16, meioses: 6 },
    secondCousins: { label: "second cousins", paths: 2, n1: 3, n2: 3, F: 1 / 64, meioses: 8 },
    halfSibs: { label: "half siblings", paths: 1, n1: 1, n2: 1, F: 1 / 8, meioses: 4 },
    fullSibs: { label: "full siblings", paths: 2, n1: 1, n2: 1, F: 1 / 4, meioses: 4 },
    doubleFirst: { label: "double first cousins", paths: 4, n1: 2, n2: 2, F: 1 / 8, meioses: 6 },
  };

  const STRUCTURE_METHODS = {
    pca: {
      measures: "dominant axes of the genetic relationship matrix",
      output: "continuous relatedness gradients",
      trap: "sampling a cline discretely can manufacture clusters; long-range LD can own a PC",
    },
    admixture: {
      measures: "a constrained low-rank genotype factorisation G ≈ QF",
      output: "ancestry proportions under a chosen K",
      trap: "cross-validation chooses predictive K, not a true number of populations",
    },
    fst: {
      measures: "among-group allele-frequency variance relative to total variance",
      output: "a locus or genome-wide differentiation ratio",
      trap: "demography and background selection manufacture heavy outlier tails",
    },
    local: {
      measures: "ancestry state along a recombining chromosome",
      output: "a mosaic and a tract-length clock",
      trap: "reference-panel mismatch changes emissions and erases unrepresented ancestry",
    },
  };

  function structureInbreedingModel(input) {
    if (input.kind === "pedigree") {
      const fixture = PEDIGREE_FIXTURES[input.relationship];
      const q = clamp(input.q, 1e-6, 0.999999);
      const p = 1 - q;
      const F = fixture.F;
      const baseline = q * q;
      const risk = q * q + F * p * q;
      const meanTractCm = Number.isFinite(fixture.meioses) ? 100 / fixture.meioses : 0;
      return {
        fixture, p, q, F, baseline, risk,
        relativeRisk: risk / baseline,
        absoluteExcess: risk - baseline,
        genotypes: { AA: p * p + F * p * q, Aa: 2 * p * q * (1 - F), aa: risk },
        meanTractCm,
        expectedTracts: meanTractCm ? F * 3500 / meanTractCm : 0,
      };
    }

    if (input.kind === "roh") {
      const meanLengthCm = clamp(input.meanLengthCm, 0.1, 50);
      const F = clamp(input.F, 0, 0.5);
      const generations = 50 / meanLengthCm;
      const totalCm = F * 3500;
      const tracts = meanLengthCm ? totalCm / meanLengthCm : 0;
      const interpretation = meanLengthCm >= 12
        ? "recent pedigree loop"
        : meanLengthCm >= 2
          ? "distant shared ancestry or endogamy"
          : "ancient background autozygosity";
      return { meanLengthCm, F, generations, totalCm, tracts, interpretation };
    }

    if (input.kind === "wahlund") {
      const weight = clamp(input.weight, 0, 1);
      const p1 = clamp(input.p1, 0, 1);
      const p2 = clamp(input.p2, 0, 1);
      const pbar = weight * p1 + (1 - weight) * p2;
      const qbar = 1 - pbar;
      const variance = weight * Math.pow(p1 - pbar, 2) +
        (1 - weight) * Math.pow(p2 - pbar, 2);
      const ht = 2 * pbar * qbar;
      const hs = weight * 2 * p1 * (1 - p1) + (1 - weight) * 2 * p2 * (1 - p2);
      const fst = ht ? variance / (pbar * qbar) : 0;
      const fis = clamp(input.fis || 0, -0.9, 0.9);
      const hi = hs * (1 - fis);
      const fit = ht ? 1 - hi / ht : 0;
      return {
        pbar, variance, ht, hs, hi, fst, fis, fit,
        chainedFit: 1 - (1 - fis) * (1 - fst),
        heterozygoteDeficit: ht - hs,
      };
    }

    if (input.kind === "confounding") {
      const w = clamp(input.weight, 0.001, 0.999);
      const p1 = clamp(input.p1, 0.001, 0.999);
      const p2 = clamp(input.p2, 0.001, 0.999);
      const mean1 = input.mean1;
      const mean2 = input.mean2;
      const residualVariance = Math.pow(input.residualSd || 1, 2);
      const covariance = 2 * w * (1 - w) * (p1 - p2) * (mean1 - mean2);
      const genotypeVariance = w * 2 * p1 * (1 - p1) +
        (1 - w) * 2 * p2 * (1 - p2) + 4 * w * (1 - w) * Math.pow(p1 - p2, 2);
      const phenotypeVariance = residualVariance + w * (1 - w) * Math.pow(mean1 - mean2, 2);
      const correlation = covariance / Math.sqrt(genotypeVariance * phenotypeVariance);
      const n = Math.max(4, Math.round(input.n));
      const t = Math.abs(correlation) * Math.sqrt((n - 2) / Math.max(1e-12, 1 - correlation * correlation));
      return {
        covariance, genotypeVariance, phenotypeVariance, correlation, t,
        slope: covariance / genotypeVariance,
        withinGroupSlope: 0,
      };
    }

    if (input.kind === "method") return STRUCTURE_METHODS[input.method];
    throw new Error("Unknown structure/inbreeding model");
  }
  models.structureInbreeding = structureInbreedingModel;

  function linkageDisequilibriumModel(input) {
    if (input.kind === "table") {
      const counts = {
        AB: Math.max(0, input.AB), Ab: Math.max(0, input.Ab),
        aB: Math.max(0, input.aB), ab: Math.max(0, input.ab),
      };
      const total = counts.AB + counts.Ab + counts.aB + counts.ab;
      const frequencies = Object.fromEntries(Object.entries(counts).map(([key, value]) =>
        [key, total ? value / total : 0]));
      const pA = frequencies.AB + frequencies.Ab;
      const pB = frequencies.AB + frequencies.aB;
      const pa = 1 - pA;
      const pb = 1 - pB;
      const D = frequencies.AB - pA * pB;
      const bound = D >= 0 ? Math.min(pA * pb, pa * pB) : Math.min(pA * pB, pa * pb);
      const dPrime = bound ? D / bound : 0;
      const denominator = pA * pa * pB * pb;
      const r2 = denominator ? D * D / denominator : 0;
      return {
        counts, frequencies, total, pA, pB, pa, pb, D, dPrime, r2,
        sampleFactor: r2 ? 1 / r2 : Infinity,
        absentHaplotypes: Object.entries(counts).filter((entry) => entry[1] === 0).map((entry) => entry[0]),
      };
    }

    if (input.kind === "decay") {
      const c = clamp(input.c, 0, 0.5);
      const generations = Math.max(0, input.generations);
      const factor = Math.pow(1 - c, generations);
      return {
        c, generations, d: input.d0 * factor, r2: input.r20 * factor * factor,
        dFactor: factor, r2Factor: factor * factor,
        halfLifeD: c ? Math.log(0.5) / Math.log(1 - c) : Infinity,
        halfLifeR2: c ? Math.log(0.5) / (2 * Math.log(1 - c)) : Infinity,
      };
    }

    if (input.kind === "admixture") {
      const m = clamp(input.m, 0, 1);
      const d0 = m * (1 - m) * (input.pA1 - input.pA2) * (input.pB1 - input.pB2);
      const remaining = d0 * Math.pow(1 - clamp(input.c, 0, 0.5), input.generations || 0);
      return { d0, remaining };
    }

    if (input.kind === "sved") {
      const ne = Math.max(1, input.ne);
      const c = clamp(input.c, 0, 0.5);
      return { r2: 1 / (1 + 4 * ne * c), ne, c };
    }

    if (input.kind === "tag") {
      const r2 = clamp(input.r2, 1e-6, 1);
      return {
        r2,
        causalN: input.causalN,
        tagN: input.causalN / r2,
        effectiveN: input.studyN * r2,
        effectVarianceRetained: r2,
      };
    }

    throw new Error("Unknown linkage-disequilibrium model");
  }
  models.linkageDisequilibrium = linkageDisequilibriumModel;

  function simplexPoint(frequencies) {
    const vertices = { AA: [58, 270], Aa: [260, 34], aa: [462, 270] };
    return {
      x: frequencies.AA * vertices.AA[0] + frequencies.Aa * vertices.Aa[0] + frequencies.aa * vertices.aa[0],
      y: frequencies.AA * vertices.AA[1] + frequencies.Aa * vertices.Aa[1] + frequencies.aa * vertices.aa[1],
    };
  }

  function hweSimplexSvg(result) {
    const curve = [];
    for (let index = 0; index <= 50; index += 1) {
      const p = index / 50;
      curve.push(simplexPoint({ AA: p * p, Aa: 2 * p * (1 - p), aa: Math.pow(1 - p, 2) }));
    }
    const parent = simplexPoint(result.parental);
    const child = simplexPoint(result.offspring);
    const low = simplexPoint(hardyWeinbergModel({ kind: "reunion", p: result.p, departure: -1 }).parental);
    const high = simplexPoint(hardyWeinbergModel({ kind: "reunion", p: result.p, departure: 1 }).parental);
    return textSvg(
      '<defs><marker id="pop-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 Z" class="pop-arrow-head"/></marker></defs>' +
      '<path class="pop-simplex-fill" d="M58 270 L260 34 L462 270 Z"/>' +
      '<path class="pop-simplex-edge" d="M58 270 L260 34 L462 270 Z"/>' +
      '<path class="pop-constant-line" d="M' + low.x.toFixed(2) + " " + low.y.toFixed(2) + " L" +
        high.x.toFixed(2) + " " + high.y.toFixed(2) + '"/>' +
      '<path class="pop-hwe-curve" d="' + linePath(curve, (x) => x, (y) => y) + '"/>' +
      '<path class="pop-reset-arrow" marker-end="url(#pop-arrow)" d="M' + parent.x.toFixed(2) + " " +
        parent.y.toFixed(2) + " L" + child.x.toFixed(2) + " " + child.y.toFixed(2) + '"/>' +
      '<circle class="pop-parent-point" cx="' + parent.x.toFixed(2) + '" cy="' + parent.y.toFixed(2) + '" r="9"/>' +
      '<circle class="pop-child-point" cx="' + child.x.toFixed(2) + '" cy="' + child.y.toFixed(2) + '" r="9"/>' +
      '<text class="pop-vertex" x="37" y="294">100% AA</text>' +
      '<text class="pop-vertex" x="260" y="80" text-anchor="middle">100% Aa</text>' +
      '<text class="pop-vertex" x="483" y="294" text-anchor="end">100% aa</text>' +
      '<text class="pop-parent-label" x="32" y="20">● parental mix</text>' +
      '<text class="pop-child-label" x="488" y="20" text-anchor="end">● offspring · HWE</text>' +
      '<text class="pop-curve-label" x="345" y="108">HWE curve</text>',
      "Genotype-frequency simplex. The parental mixture moves along a constant-allele-frequency line to the Hardy-Weinberg curve in one generation.",
      "0 0 520 310",
      "pop-simplex"
    );
  }

  function trajectorySvg(trajectories, label, highlightMean) {
    const generations = trajectories[0].length - 1;
    const xScale = (value) => 44 + value / Math.max(1, generations) * 448;
    const yScale = (value) => 250 - value * 214;
    let paths = "";
    trajectories.forEach((values) => {
      const points = values.map((value, generation) => ({ x: generation, y: value }));
      const end = values[values.length - 1];
      paths += '<path class="pop-trajectory' + (end === 1 ? " is-fixed" : end === 0 ? " is-lost" : "") +
        '" d="' + linePath(points, xScale, yScale) + '"/>';
    });
    if (highlightMean && trajectories.length > 1) {
      const means = trajectories[0].map((_, index) => ({
        x: index,
        y: trajectories.reduce((sum, values) => sum + values[index], 0) / trajectories.length,
      }));
      paths += '<path class="pop-trajectory-mean" d="' + linePath(means, xScale, yScale) + '"/>';
    }
    return textSvg(
      '<path class="pop-plot-axis" d="M44 28 L44 250 L500 250"/>' +
      '<path class="pop-midline" d="M44 143 L500 143"/>' + paths +
      '<text class="lab-svg-label" x="28" y="42">1.0</text>' +
      '<text class="lab-svg-label" x="28" y="148">0.5</text>' +
      '<text class="lab-svg-label" x="31" y="254">0</text>' +
      '<text class="lab-svg-label" x="44" y="278">generation 0</text>' +
      '<text class="lab-svg-label" x="500" y="278" text-anchor="end">generation ' + generations + "</text>" +
      '<text class="lab-svg-kicker" x="44" y="22">allele frequency q</text>',
      label,
      "0 0 520 292",
      "pop-trajectory-plot"
    );
  }

  function xLinkedSvg(series) {
    const generations = series.length - 1;
    const xScale = (value) => 44 + value / Math.max(1, generations) * 448;
    const yScale = (value) => 244 - value * 202;
    const female = series.map((point) => ({ x: point.generation, y: point.female }));
    const male = series.map((point) => ({ x: point.generation, y: point.male }));
    return textSvg(
      '<path class="pop-plot-axis" d="M44 30 L44 244 L500 244"/>' +
      '<path class="pop-x-female" d="' + linePath(female, xScale, yScale) + '"/>' +
      '<path class="pop-x-male" d="' + linePath(male, xScale, yScale) + '"/>' +
      series.map((point) => '<circle class="pop-x-point is-female" cx="' + xScale(point.generation).toFixed(2) +
        '" cy="' + yScale(point.female).toFixed(2) + '" r="4"/><circle class="pop-x-point is-male" cx="' +
        xScale(point.generation).toFixed(2) + '" cy="' + yScale(point.male).toFixed(2) + '" r="4"/>').join("") +
      '<text class="lab-svg-kicker" x="44" y="22">X-allele frequency</text>' +
      '<text class="lab-svg-label" x="35" y="45">1</text><text class="lab-svg-label" x="35" y="248">0</text>' +
      '<text class="pop-x-label is-female" x="492" y="50" text-anchor="end">female XX</text>' +
      '<text class="pop-x-label is-male" x="492" y="90" text-anchor="end">male XY</text>' +
      '<text class="lab-svg-label" x="44" y="275">generation 0</text><text class="lab-svg-label" x="500" y="275" text-anchor="end">generation ' +
        generations + "</text>",
      "X-linked allele frequencies in females and males alternate around their conserved weighted mean while the difference halves each generation.",
      "0 0 520 288",
      "pop-x-plot"
    );
  }

  function rohBoard(el, result) {
    const board = el("div", {
      class: "pop-roh-board",
      role: "img",
      "aria-label": "A genome with " + compact(result.tracts, 1) + " expected runs of homozygosity averaging " +
        compact(result.meanLengthCm, 1) + " centimorgans, indicating " + result.interpretation + ".",
    });
    const lanes = [1, 2, 3, 4];
    lanes.forEach((chromosome, laneIndex) => {
      const lane = el("div", { class: "pop-roh-lane" }, [
        el("span", { text: "chr " + chromosome }),
        el("div", { class: "pop-roh-track" }),
      ]);
      const track = lane.lastChild;
      const count = Math.min(5, Math.max(0, Math.round(result.tracts / 4)));
      for (let index = 0; index < count; index += 1) {
        const left = 5 + ((index * 23 + laneIndex * 17) % 78);
        const width = clamp(4 + result.meanLengthCm / 2.2, 4, 28);
        track.append(el("span", {
          class: "pop-roh-segment",
          style: "left:" + left + "%;width:" + Math.min(width, 96 - left) + "%",
          "aria-hidden": "true",
        }));
      }
      board.append(lane);
    });
    return board;
  }

  function pedigreeSvg(result) {
    const loops = result.fixture.paths;
    let ancestors = "";
    const positions = loops === 4 ? [82, 190, 330, 438] : loops === 2 ? [160, 360] : loops === 1 ? [260] : [];
    positions.forEach((x, index) => {
      ancestors += '<circle class="pop-ancestor" cx="' + x + '" cy="54" r="18"/>' +
        '<text class="pop-node-label" x="' + x + '" y="59" text-anchor="middle">A' + (index + 1) + "</text>" +
        '<path class="pop-descent-path" d="M' + x + ' 72 L170 160 L260 238 M' + x + ' 72 L350 160 L260 238"/>';
    });
    return textSvg(
      ancestors +
      '<circle class="pop-parent-node" cx="170" cy="160" r="24"/><circle class="pop-parent-node" cx="350" cy="160" r="24"/>' +
      '<circle class="pop-child-node" cx="260" cy="238" r="26"/>' +
      '<text class="pop-node-label" x="170" y="165" text-anchor="middle">P₁</text>' +
      '<text class="pop-node-label" x="350" y="165" text-anchor="middle">P₂</text>' +
      '<text class="pop-node-label" x="260" y="243" text-anchor="middle">child</text>' +
      (loops ? "" : '<text class="lab-svg-label" x="260" y="85" text-anchor="middle">no shared ancestor in the declared base population</text>') +
      '<text class="pop-pedigree-result" x="260" y="292" text-anchor="middle">' + loops + " path" + (loops === 1 ? "" : "s") +
        " · F = " + result.F.toFixed(4) + "</text>",
      "Pedigree path-counting diagram for " + result.fixture.label + ". " + loops + " shared-ancestor paths give F " + result.F.toFixed(4) + ".",
      "0 0 520 310",
      "pop-pedigree"
    );
  }

  function ldDecaySvg(d0, r20, c, maxGenerations) {
    const pointsD = [];
    const pointsR2 = [];
    const steps = 50;
    for (let index = 0; index <= steps; index += 1) {
      const generation = index / steps * maxGenerations;
      const result = linkageDisequilibriumModel({ kind: "decay", d0, r20, c, generations: generation });
      pointsD.push({ x: generation, y: d0 ? Math.abs(result.d / d0) : 0 });
      pointsR2.push({ x: generation, y: r20 ? result.r2 / r20 : 0 });
    }
    const xScale = (value) => 44 + value / Math.max(1, maxGenerations) * 448;
    const yScale = (value) => 244 - value * 202;
    return textSvg(
      '<path class="pop-plot-axis" d="M44 30 L44 244 L500 244"/>' +
      '<path class="pop-decay-d" d="' + linePath(pointsD, xScale, yScale) + '"/>' +
      '<path class="pop-decay-r2" d="' + linePath(pointsR2, xScale, yScale) + '"/>' +
      '<text class="lab-svg-kicker" x="44" y="22">fraction of starting association</text>' +
      '<text class="lab-svg-label" x="35" y="45">1</text><text class="lab-svg-label" x="35" y="248">0</text>' +
      '<text class="pop-decay-label is-d" x="482" y="54" text-anchor="end">D or r</text>' +
      '<text class="pop-decay-label is-r2" x="482" y="94" text-anchor="end">r² / power</text>' +
      '<text class="lab-svg-label" x="44" y="275">now</text><text class="lab-svg-label" x="500" y="275" text-anchor="end">' +
        compact(maxGenerations, 0) + " generations</text>",
      "Recombination decay. D and r fall by one factor of one minus c per generation; r squared and association power fall by its square.",
      "0 0 520 288",
      "pop-ld-decay"
    );
  }

  /* Ch 26 — Hardy-Weinberg population simplex -------------------------- */

  const HWE_TEST_FIXTURES = {
    fit: { label: "textbook fit", AA: 250, Aa: 500, aa: 250 },
    excess: { label: "collapsed paralogues", AA: 210, Aa: 580, aa: 210 },
    deficit: { label: "allele dropout", AA: 300, Aa: 400, aa: 300 },
    wahlund: { label: "two pooled groups", AA: 340, Aa: 320, aa: 340 },
    rare: { label: "rare-variant trap", AA: 991, Aa: 8, aa: 1 },
  };

  define("hardy-weinberg-lab", {
    "ch26-o1": "Simplex mode converts arbitrary genotype mixtures to allele frequency and makes the reverse direction visibly non-unique until a mating model is applied.",
    "ch26-o2": "The constant-p chord, gamete pool, HWE curve, and second-generation readout demonstrate random union, p²:2pq:q², one-generation attainment, and persistence.",
    "ch26-o3": "Assumption mode removes random mating, selection, mutation, migration, or infinite size individually and quantifies the specific term each changes.",
    "ch26-o4": "QC mode computes expected counts, one-degree-of-freedom chi-square, an enumerated exact p-value, minimum expected count, and the sample size implied by NF².",
    "ch26-o5": "QC fixtures use the sign of F-hat to route heterozygote deficit toward dropout, structure, or inbreeding and excess toward paralogues, CNV, or contamination.",
    "ch26-o6": "X mode iterates female and male X frequencies, preserves the two-thirds weighted mean, and exposes the alternating one-half decay of the sex difference.",
    "ch26-o7": "Carrier mode converts recessive incidence to q and exact 2pq, compares the 2q shortcut, and counts how many disease alleles remain hidden in carriers.",
  }, ({ body, el, stat, predict }) => {
    const parts = labParts(el);
    let mode = "simplex";
    let p = 0.5;
    let departure = 1;
    let assumption = "mating";
    let assumptionStrength = 0.4;
    let testFixture = "excess";
    let xView = "x";
    let femaleX = 0.9;
    let maleX = 0.3;
    let xGenerations = 6;
    let incidenceLog = -4;

    function modeTabs() {
      return tabs(el, [
        { label: "One-generation reset", value: "simplex" },
        { label: "Break an assumption", value: "assumptions" },
        { label: "HWE quality control", value: "qc" },
        { label: "X & carrier risk", value: "xRisk" },
      ], mode, (value) => { mode = value; render(); });
    }

    function renderSimplex() {
      const result = hardyWeinbergModel({ kind: "reunion", p, departure });
      parts.visual.replaceChildren(
        el("div", { class: "pop-visual-stack", html: hweSimplexSvg(result) }),
        statusStrip(el, [
          { label: "allele A in parents", value: percent(result.alleleFromParents, 1) },
          { label: "departure D", value: result.d.toFixed(3), tone: Math.abs(result.d) > 1e-8 ? "signal" : "muted" },
          { label: "offspring heterozygotes", value: percent(result.offspring.Aa, 1), tone: "active" },
          { label: "allele A after mating", value: percent(result.alleleFromOffspring, 1) },
        ], "The genotype mixture changes but allele frequency does not")
      );
      parts.controls.replaceChildren(
        rangeControl(el, "Allele A frequency p", p, {
          min: 0.05, max: 0.95, step: 0.01, format: (value) => Number(value).toFixed(2),
        }, (value) => { p = value; render(); }),
        rangeControl(el, "Parental pairing departure", departure, {
          min: -1, max: 1, step: 0.05,
          format: (value) => value < 0 ? "heterozygote excess " + Number(value).toFixed(2)
            : value > 0 ? "heterozygote deficit +" + Number(value).toFixed(2) : "on HWE curve",
        }, (value) => { departure = value; render(); }),
        el("div", { class: "readout" }, [
          stat(percent(result.parental.AA, 1), "parents AA"),
          stat(percent(result.parental.Aa, 1), "parents Aa"),
          stat(percent(result.parental.aa, 1), "parents aa"),
          stat("p stays " + result.p.toFixed(2), "one-generation invariant"),
        ])
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "you changed", value: "where the population sits on its constant-p chord" },
        { key: "mechanism", value: "two independent draws from one gamete pool" },
        { key: "observable", value: "the point lands on p² : 2pq : q² in one generation" },
      ]));
      parts.explanation.className = "callout callout-good";
      parts.explanation.innerHTML = "<strong>The arrow is a change of genotype coordinates, not evolution.</strong> Every point on the thin chord has the same allele frequency. Random mating discards the parental pairing history, lands on the curved Hardy–Weinberg fixed point, and leaves <em>p</em> exactly unchanged.";
    }

    function renderAssumptions() {
      const result = hardyWeinbergModel({
        kind: "assumption", assumption, p, strength: assumptionStrength,
      });
      const names = {
        mating: "random mating", selection: "no selection", mutation: "no mutation",
        migration: "no migration", finite: "infinite population",
      };
      parts.visual.replaceChildren(
        processBoard(el, [
          { label: "assumption removed", value: names[assumption], tone: "signal" },
          { label: "derivation step affected", value: result.mechanism },
          { label: "genotype consequence", value: result.genotype },
          { label: "allele consequence", value: result.allele, tone: assumption === "mating" || assumption === "finite" ? "muted" : "active" },
        ], "Each Hardy-Weinberg assumption licenses a different step"),
        barBoard(el, [
          { label: "AA", value: result.frequencies.AA, display: percent(result.frequencies.AA, 1), tone: "active" },
          { label: "Aa", value: result.frequencies.Aa, display: percent(result.frequencies.Aa, 1), tone: "signal" },
          { label: "aa", value: result.frequencies.aa, display: percent(result.frequencies.aa, 1) },
        ], result.frequencyStage, 1)
      );
      parts.controls.replaceChildren(
        el("div", { class: "lab-control-block" }, [
          el("span", { class: "lab-control-label", text: "Remove one assumption" }),
          choiceRow(el, [
            { label: "Random mating", value: "mating" },
            { label: "No selection", value: "selection" },
            { label: "No mutation", value: "mutation" },
            { label: "No migration", value: "migration" },
            { label: "Infinite size", value: "finite" },
          ], assumption, (value) => { assumption = value; render(); }, "Hardy-Weinberg assumption to violate"),
        ]),
        rangeControl(el, "Starting allele A frequency p", p, {
          min: 0.05, max: 0.95, step: 0.01, format: (value) => Number(value).toFixed(2),
        }, (value) => { p = value; render(); }),
        rangeControl(el, "Violation strength", assumptionStrength, {
          min: 0, max: 1, step: 0.05, format: (value) => percent(value, 0),
        }, (value) => { assumptionStrength = value; render(); }),
        el("div", { class: "readout" }, [
          stat(result.scale, "quantified effect"),
          stat(assumption === "finite" ? "variance" : assumption === "mating" ? "pairing" : "directional", "kind of departure"),
          stat(assumption === "mating" || assumption === "finite" ? "no" : "yes", "moves allele frequency?"),
        ])
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "you changed", value: names[assumption] },
        { key: "mechanism", value: result.mechanism },
        { key: "observable", value: result.scale },
      ]));
      parts.explanation.className = "callout";
      parts.explanation.innerHTML = assumption === "finite"
        ? "<strong>Finite size changes the realised allele frequency, not the conditional expectation.</strong> Drift gives Var(<em>p′</em>) = <em>pq</em>/(2<em>N</em>); given the realised <em>p</em>, expected genotype proportions are still Hardy–Weinberg."
        : assumption === "mating"
          ? "<strong>Non-random mating is the large within-generation exception.</strong> It repackages the same alleles into more or fewer heterozygotes. Inbreeding therefore changes genotype frequencies immediately while leaving <em>p</em> untouched."
          : "<strong>The assumption tells you which equality was licensed.</strong> Mutation and migration alter the gamete pool; viability selection separates the zygote pool from the later census. The model is robust because realistic per-generation terms are usually small.";
    }

    function renderQc() {
      const fixture = HWE_TEST_FIXTURES[testFixture];
      const result = hardyWeinbergModel(Object.assign({ kind: "test" }, fixture));
      const rows = [];
      ["AA", "Aa", "aa"].forEach((genotype) => {
        rows.push({ label: genotype + " observed", value: result.observed[genotype] / result.n, display: compact(result.observed[genotype], 0), tone: "signal" });
        rows.push({ label: genotype + " expected", value: result.expected[genotype] / result.n, display: compact(result.expected[genotype], 1), tone: "active" });
      });
      parts.visual.replaceChildren(
        barBoard(el, rows, "Observed and Hardy-Weinberg expected genotype counts", 1),
        statusStrip(el, [
          { label: "F-hat sign", value: result.F > 1e-9 ? "+ deficit" : result.F < -1e-9 ? "− excess" : "zero", tone: result.F ? "signal" : "active" },
          { label: "minimum expected cell", value: compact(result.minExpected, 3), tone: result.minExpected < 5 ? "warning" : "active" },
          { label: "use", value: result.recommendedTest },
          { label: "diagnostic route", value: result.diagnosis },
        ], "Hardy-Weinberg quality-control diagnosis")
      );
      parts.controls.replaceChildren(
        el("div", { class: "lab-control-block" }, [
          el("span", { class: "lab-control-label", text: "Genotyped cohort" }),
          choiceRow(el, Object.entries(HWE_TEST_FIXTURES).map(([value, valueFixture]) => ({
            label: valueFixture.label, value,
          })), testFixture, (value) => { testFixture = value; render(); }, "Hardy-Weinberg test fixture"),
        ]),
        el("div", { class: "readout" }, [
          stat(result.p.toFixed(4), "estimated p"),
          stat(result.F.toFixed(4), "F-hat"),
          stat(result.chiSquare.toFixed(3), "χ² · 1 df"),
          stat(result.exactP < 0.001 ? result.exactP.toExponential(2) : result.exactP.toFixed(3), "exact p"),
          stat(Number.isFinite(result.nFor80) ? compact(result.nFor80, 0) : "∞", "N for 80% power at this F"),
        ])
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "you changed", value: fixture.label + " genotype counts" },
        { key: "mechanism", value: "estimate p from the same counts, leaving one degree of freedom" },
        { key: "observable", value: result.diagnosis },
      ]));
      parts.explanation.className = "callout " + (testFixture === "fit" ? "callout-good" : "");
      parts.explanation.innerHTML = testFixture === "rare"
        ? "<strong>The rare-homozygote cell breaks the χ² approximation.</strong> Its expectation is " + compact(result.minExpected, 3) + "; the exact test conditions on the observed minor-allele count and enumerates heterozygote counts instead of trusting an asymptotic tail."
        : "<strong>The sign is more useful than significance alone.</strong> A deficit points toward allele dropout, pooled ancestry, or inbreeding. An excess cannot be caused by either of the latter and instead raises collapsed paralogues, copy number, or contamination.";
    }

    function renderXRisk() {
      const subTabs = choiceRow(el, [
        { label: "X-linked oscillation", value: "x" },
        { label: "Incidence → carriers", value: "risk" },
      ], xView, (value) => { xView = value; render(); }, "X-linked or carrier calculation");
      if (xView === "x") {
        const result = hardyWeinbergModel({
          kind: "xLinked", female: femaleX, male: maleX, generations: xGenerations,
        });
        parts.visual.innerHTML = xLinkedSvg(result.series);
        parts.visual.append(statusStrip(el, [
          { label: "weighted equilibrium", value: result.conserved.toFixed(4), tone: "active" },
          { label: "female after t", value: result.female.toFixed(4) },
          { label: "male after t", value: result.male.toFixed(4) },
          { label: "sex difference", value: result.difference.toFixed(4), tone: "signal" },
        ], "X-linked frequencies approach their conserved equilibrium by damped oscillation"));
        parts.controls.replaceChildren(
          subTabs,
          rangeControl(el, "Female X frequency at generation 0", femaleX, {
            min: 0, max: 1, step: 0.05, format: (value) => Number(value).toFixed(2),
          }, (value) => { femaleX = value; render(); }),
          rangeControl(el, "Male X frequency at generation 0", maleX, {
            min: 0, max: 1, step: 0.05, format: (value) => Number(value).toFixed(2),
          }, (value) => { maleX = value; render(); }),
          rangeControl(el, "Generations", xGenerations, {
            min: 1, max: 10, step: 1, format: (value) => String(Math.round(value)),
          }, (value) => { xGenerations = value; render(); }),
          el("div", { class: "readout" }, [
            stat("dₜ = (−½)ᵗd₀", "recursion"),
            stat(result.predictedDifference.toFixed(4), "predicted d at t"),
            stat(result.difference.toFixed(4), "iterated d at t"),
          ])
        );
        parts.rail.replaceChildren(causalRail(el, [
          { key: "you changed", value: "female and male starting X frequencies" },
          { key: "mechanism", value: "sons copy maternal X; daughters average both parents" },
          { key: "observable", value: "the difference flips sign and halves each generation" },
        ]));
        parts.explanation.className = "callout callout-good";
        parts.explanation.innerHTML = "<strong>The two-thirds female plus one-third male mean is conserved.</strong> Unlike an autosome, the X does not erase sex-specific history in one generation. It alternates around the fixed mean with multiplier −½ and approaches equilibrium without reaching it in finite time.";
        return;
      }

      const incidence = Math.pow(10, incidenceLog);
      const result = hardyWeinbergModel({ kind: "risk", incidence });
      parts.visual.replaceChildren(
        beadField(el, [
          { label: "disease alleles hidden in carriers", value: result.fractionHidden, tone: "active", symbol: "a" },
          { label: "disease alleles exposed in affected homozygotes", value: 1 - result.fractionHidden, tone: "warning", symbol: "aa" },
        ], "Where recessive disease alleles reside", 100),
        processBoard(el, [
          { label: "observed incidence", value: "q² = " + result.incidence.toExponential(2) },
          { label: "allele frequency", value: "q = √incidence = " + result.q.toFixed(4) },
          { label: "exact carriers", value: "2pq = " + percent(result.carrier, 3), tone: "active" },
          { label: "small-q shortcut", value: "2q = " + percent(result.shortcut, 3), tone: result.shortcutRelativeError > 0.05 ? "warning" : "muted" },
        ], "Disease incidence to carrier frequency")
      );
      parts.controls.replaceChildren(
        subTabs,
        rangeControl(el, "Recessive incidence (log10)", incidenceLog, {
          min: -6, max: -1, step: 0.1,
          format: (value) => "1 in " + compact(1 / Math.pow(10, value), 0),
        }, (value) => { incidenceLog = value; render(); }),
        el("div", { class: "readout" }, [
          stat("1 in " + compact(1 / result.carrier, 0), "exact carrier frequency"),
          stat(percent(result.shortcutRelativeError, 1), "2q relative overstatement"),
          stat(compact(result.carriersPerAffected, 1) + " : 1", "carriers per affected"),
          stat(percent(result.fractionHidden, 1), "a alleles in carriers"),
        ])
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "you changed", value: "observed recessive incidence" },
        { key: "mechanism", value: "assume incidence = q², then count heterozygotes exactly" },
        { key: "observable", value: percent(result.carrier, 3) + " carriers" },
      ]));
      parts.explanation.className = "callout";
      parts.explanation.innerHTML = "<strong>The square root is where every assumption enters.</strong> Consanguinity, structure, incomplete penetrance, or missed cases all break incidence = <em>q</em>². The 2<em>q</em> shortcut then adds a second approximation; it overstates 2<em>pq</em> by exactly 1/(1−<em>q</em>).";
    }

    function render() {
      parts.tabHost.replaceChildren(modeTabs());
      if (mode === "simplex") renderSimplex();
      else if (mode === "assumptions") renderAssumptions();
      else if (mode === "qc") renderQc();
      else renderXRisk();
    }

    predict(body, {
      widget: "hardy-weinberg-lab",
      question: "A founding population is 50% AA and 50% aa, with no heterozygotes. Allele A is at 50%. After one generation of random mating, what genotype mixture appears?",
      hint: "The offspring draw two alleles independently from a pool with p = q = 0.5.",
      options: [
        { label: "50% AA · 0% Aa · 50% aa" },
        { label: "25% AA · 50% Aa · 25% aa", correct: true },
        { label: "0% AA · 100% Aa · 0% aa" },
        { label: "It needs many generations to approach equilibrium" },
      ],
    }, () => {
      mode = "simplex";
      p = 0.5;
      departure = 1;
      parts.instrument.hidden = false;
      render();
    });
    finishLab(parts, body);
  });

  /* Ch 27 — four forces and effective population size ------------------ */

  const FORCE_PRESETS = {
    mutation: {
      label: "mutation", mu: 0.003, nu: 0, s: 0, h: 0.5, m: 0, sourceQ: 0, ne: 0,
      rule: "Δq = μp − νq", note: "Directional but glacial at real per-locus rates",
    },
    selection: {
      label: "selection", mu: 0, nu: 0, s: 0.18, h: 0.5, m: 0, sourceQ: 0, ne: 0,
      rule: "fitness-weight genotypes, then recount alleles", note: "Direction depends on fitness and visibility through h",
    },
    migration: {
      label: "migration", mu: 0, nu: 0, s: 0, h: 0.5, m: 0.035, sourceQ: 0.8, ne: 0,
      rule: "q′ = (1−m)q + mqₘ", note: "A fast geometric pull toward the source population",
    },
    drift: {
      label: "drift", mu: 0, nu: 0, s: 0, h: 0.5, m: 0, sourceQ: 0, ne: 45,
      rule: "E[q′] = q; Var(q′) = pq/(2Nₑ)", note: "No direction—only replicate populations spreading",
    },
    combined: {
      label: "all four", mu: 0.0004, nu: 0, s: 0.06, h: 0.5, m: 0.008, sourceQ: 0.75, ne: 80,
      rule: "deterministic terms + finite sampling", note: "One population is one draw from a stochastic process",
    },
  };

  function equilibriumRuler(el, equilibrium, stability, label) {
    const ruler = el("div", {
      class: "pop-equilibrium-board",
      role: "img",
      "aria-label": label + ". Equilibrium q " + compact(equilibrium, 4) + ", " + stability + ".",
    });
    ruler.append(
      el("div", { class: "pop-equilibrium-track" }, [
        el("span", { class: "pop-equilibrium-tick is-zero", text: "0" }),
        el("span", { class: "pop-equilibrium-tick is-one", text: "1" }),
        el("span", {
          class: "pop-equilibrium-point " + (stability.startsWith("stable") ? "is-stable" : "is-unstable"),
          style: "left:" + clamp(100 * equilibrium, 1, 99) + "%",
          text: stability.startsWith("stable") ? "●" : "◆",
        }),
        el("span", {
          class: "pop-equilibrium-arrow is-left",
          style: "right:" + clamp(100 * (1 - equilibrium) + 2, 3, 99) + "%",
          text: stability.startsWith("stable") ? "→" : "←",
        }),
        el("span", {
          class: "pop-equilibrium-arrow is-right",
          style: "left:" + clamp(100 * equilibrium + 2, 3, 99) + "%",
          text: stability.startsWith("stable") ? "←" : "→",
        }),
      ]),
      el("strong", { text: "q̂ = " + compact(equilibrium, 5) + " · " + stability })
    );
    return ruler;
  }

  define("population-forces-lab", {
    "ch27-o1": "Force arena exposes mutation, selection, and migration as directional one-generation terms while seeded Wright-Fisher replicates expose drift only through variance.",
    "ch27-o2": "Balance mode computes recessive and dominant mutation-selection balance, overdominant equilibrium, and an underdominant separatrix with stable-versus-unstable arrows.",
    "ch27-o3": "Dominance controls compare the q-squared hiding of a rare recessive against geometric exposure of dominant copies and show how the equilibrium formula changes.",
    "ch27-o4": "Island mode holds absolute migrants Nm on the control surface, derives FST = 1/(1+4Nm), and independently shows frequency homogenisation.",
    "ch27-o5": "Effective-size mode computes Ne-s, classifies effectively neutral, nearly neutral, or efficiently selected behaviour, and compares fixation against the neutral 1/(2Ne) baseline.",
    "ch27-o6": "Effective-size fixtures calculate sex-ratio, offspring-variance, and harmonic-mean corrections and expose how a single crash dominates surrounding large generations.",
    "ch27-o7": "The human deep-time fixture separates an approximately ten-thousand drift-equivalent history from an eight-billion present census and states what the summary can and cannot mean.",
  }, ({ body, el, stat, predict }) => {
    const parts = labParts(el);
    let mode = "forces";
    let force = "drift";
    let startingQ = 0.25;
    let generations = 60;
    let driftNe = 45;
    let seed = 19;
    let regime = "recessive";
    let mutationLog = -5;
    let selectionStrength = 0.8;
    let dominance = 0;
    let s1 = 0.11;
    let s2 = 0.8;
    let islandN = 500;
    let migrants = 1;
    let sourceQ = 0.8;
    let neScenario = "bottleneck";
    let census = 1000;
    let maleFraction = 0.5;
    let offspringVariance = 2;
    let bottleneck = 10;
    let selectionLog = -4;

    function modeTabs() {
      return tabs(el, [
        { label: "Four-force arena", value: "forces" },
        { label: "Dominance & balance", value: "balance" },
        { label: "Migration islands", value: "islands" },
        { label: "Effective size", value: "ne" },
      ], mode, (value) => { mode = value; render(); });
    }

    function renderForces() {
      const preset = Object.assign({}, FORCE_PRESETS[force]);
      if (force === "drift" || force === "combined") preset.ne = driftNe;
      const replicates = preset.ne ? 12 : 1;
      const result = populationForcesModel(Object.assign({
        kind: "trajectory", q: startingQ, generations, replicates, seed,
      }, preset));
      const p = 1 - startingQ;
      const selection = selectionStep(startingQ, preset.s, preset.h);
      const mutationDelta = p * preset.mu - startingQ * preset.nu;
      const migrationDelta = preset.m * (preset.sourceQ - startingQ);
      const driftVariance = preset.ne ? p * startingQ / (2 * preset.ne) : 0;
      parts.visual.innerHTML = trajectorySvg(
        result.trajectories,
        replicates + " population " + (replicates === 1 ? "trajectory" : "trajectories") +
          " under " + preset.label,
        true
      );
      parts.visual.append(statusStrip(el, [
        { label: "mutation Δq", value: mutationDelta.toExponential(2), tone: mutationDelta ? "active" : "muted" },
        { label: "selection Δq", value: selection.delta.toExponential(2), tone: selection.delta ? "signal" : "muted" },
        { label: "migration Δq", value: migrationDelta.toExponential(2), tone: migrationDelta ? "active" : "muted" },
        { label: "drift Var(q′)", value: driftVariance.toExponential(2), tone: driftVariance ? "warning" : "muted" },
      ], "One-generation terms in the selected force fixture"));
      parts.controls.replaceChildren(
        el("div", { class: "lab-control-block" }, [
          el("span", { class: "lab-control-label", text: "Process applied each generation" }),
          choiceRow(el, Object.entries(FORCE_PRESETS).map(([value, item]) => ({ label: item.label, value })),
            force, (value) => { force = value; render(); }, "Evolutionary force fixture"),
        ]),
        rangeControl(el, "Starting allele frequency q", startingQ, {
          min: 0.02, max: 0.98, step: 0.01, format: (value) => Number(value).toFixed(2),
        }, (value) => { startingQ = value; render(); }),
        (force === "drift" || force === "combined") ? rangeControl(el, "Effective population size", driftNe, {
          min: 10, max: 300, step: 5, format: (value) => "Nₑ = " + Math.round(value),
        }, (value) => { driftNe = value; render(); }) : el("span"),
        rangeControl(el, "Generations", generations, {
          min: 10, max: 100, step: 5, format: (value) => String(Math.round(value)),
        }, (value) => { generations = value; render(); }),
        (force === "drift" || force === "combined") ? el("div", { class: "lab-control-block" }, [
          el("span", { class: "lab-control-label", text: "Replay the same stochastic experiment" }),
          choiceRow(el, [
            { label: "Seed 19", value: 19 }, { label: "Seed 71", value: 71 }, { label: "Seed 211", value: 211 },
          ], seed, (value) => { seed = value; render(); }, "Drift replay seed"),
        ]) : el("span"),
        el("div", { class: "readout" }, [
          stat(result.mean.toFixed(3), "mean final q"),
          stat(result.variance.toFixed(4), "among-population variance"),
          stat(result.fixed + " / " + replicates, "fixed"),
          stat(result.lost + " / " + replicates, "lost"),
        ])
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "you changed", value: preset.label + " and its population context" },
        { key: "mechanism", value: preset.rule },
        { key: "observable", value: replicates > 1 ? "replicate paths disagree while their mean carries the deterministic term" : "one directional frequency path" },
      ]));
      parts.explanation.className = "callout";
      parts.explanation.innerHTML = force === "drift"
        ? "<strong>Do not read the grey paths as forces pointing in different directions.</strong> They are finite samples from the same unbiased transition: E[<em>q′</em>] = <em>q</em>. Dispersion grows, then probability accumulates at the absorbing boundaries even while the ensemble mean stays near its start."
        : "<strong>Direction and noise are separate terms.</strong> " + preset.note + ". The combined fixture applies selection, mutation, and migration first, then samples 2<em>N</em><sub>e</sub> alleles; changing the seed changes the realised history without changing the biology.";
    }

    function renderBalance() {
      const mu = Math.pow(10, mutationLog);
      const result = populationForcesModel({
        kind: "balance", regime, mu, s: selectionStrength, h: dominance, s1, s2,
      });
      const hiddenAtOnePercent = regime === "recessive" ? 0.99 : regime === "dominant" ? 0 : null;
      parts.visual.replaceChildren(
        equilibriumRuler(el, clamp(result.equilibrium, 0, 1), result.stability,
          "Allele-frequency equilibrium under " + regime + " selection"),
        processBoard(el, [
          { label: "new deleterious copies", value: "μ = " + mu.toExponential(1) },
          { label: "homozygous cost", value: "s = " + selectionStrength.toFixed(2) },
          { label: "heterozygote exposure", value: regime === "overdominance" ? "heterozygote is the fitness peak" : regime === "underdominance" ? "heterozygote is the fitness valley" : "h = " + dominance.toFixed(2) },
          { label: "balance", value: result.formula + " = " + compact(result.equilibrium, 5), tone: result.stability.startsWith("stable") ? "active" : "warning" },
        ], "Mutation, dominance, and selection set the equilibrium geometry")
      );
      parts.controls.replaceChildren(
        el("div", { class: "lab-control-block" }, [
          el("span", { class: "lab-control-label", text: "Fitness regime" }),
          choiceRow(el, [
            { label: "Recessive cost", value: "recessive" },
            { label: "Dominant cost", value: "dominant" },
            { label: "Overdominance", value: "overdominance" },
            { label: "Underdominance", value: "underdominance" },
          ], regime, (value) => {
            regime = value;
            if (value === "recessive") dominance = 0;
            if (value === "dominant") dominance = 1;
            render();
          }, "Selection dominance regime"),
        ]),
        (regime === "recessive" || regime === "dominant") ? rangeControl(el, "Mutation rate log10 μ", mutationLog, {
          min: -8, max: -3, step: 0.25, format: (value) => Math.pow(10, value).toExponential(1),
        }, (value) => { mutationLog = value; render(); }) : el("span"),
        rangeControl(el, "Selection coefficient s", selectionStrength, {
          min: 0.05, max: 1, step: 0.05, format: (value) => Number(value).toFixed(2),
        }, (value) => { selectionStrength = value; render(); }),
        regime === "overdominance" ? el("div", { class: "paired-controls" }, [
          rangeControl(el, "AA cost s₁", s1, {
            min: 0.01, max: 0.9, step: 0.01, format: (value) => Number(value).toFixed(2),
          }, (value) => { s1 = value; render(); }),
          rangeControl(el, "aa cost s₂", s2, {
            min: 0.01, max: 0.9, step: 0.01, format: (value) => Number(value).toFixed(2),
          }, (value) => { s2 = value; render(); }),
        ]) : el("span"),
        el("div", { class: "readout" }, [
          stat(compact(result.equilibrium, 6), "equilibrium q"),
          stat(result.stability, "local behaviour"),
          stat(result.formula, "governing expression"),
          stat(hiddenAtOnePercent == null ? "depends on side of threshold" : percent(hiddenAtOnePercent, 0), "copies hidden at q = 0.01"),
        ])
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "you changed", value: regime + " fitness geometry" },
        { key: "mechanism", value: result.formula },
        { key: "observable", value: result.stability + " point at q = " + compact(result.equilibrium, 4) },
      ]));
      parts.explanation.className = "callout";
      parts.explanation.innerHTML = regime === "recessive"
        ? "<strong>A rare recessive hides from selection.</strong> At <em>q</em> = 0.01, 99% of copies are in heterozygotes; Δ<em>q</em> scales as −<em>sq</em>². Even a lethal allele therefore slows as it becomes rare, and mutation–selection balance sits at √(μ/<em>s</em>) rather than μ/(<em>hs</em>)."
        : regime === "dominant"
          ? "<strong>Every rare dominant copy is exposed.</strong> The decline is geometric in <em>q</em>, while continual mutation recreates copies at μ; their balance is μ/(<em>hs</em>). A dominant lethal can vanish in one generation and still recur every generation."
          : regime === "overdominance"
            ? "<strong>The interior point is maintained, but it is costly.</strong> Both sides flow toward q̂ = s₁/(s₁+s₂) because the heterozygote is best. The population pays the two homozygote costs every generation; variation is maintained rather than optimised away."
            : "<strong>The interior point is a separatrix, not an attractor.</strong> With the heterozygote least fit, populations on either side climb toward a different homozygote. Selection cannot cross the fitness valley from one peak to the other.";
    }

    function renderIslands() {
      const m = migrants / islandN;
      const result = populationForcesModel({
        kind: "migration", n: islandN, m, q: 0.1, sourceQ,
      });
      const trajectory = populationForcesModel({
        kind: "trajectory", q: 0.1, generations: 100, replicates: 1, seed: 1,
        mu: 0, nu: 0, s: 0, h: 0.5, m, sourceQ, ne: 0,
      });
      parts.visual.innerHTML = trajectorySvg(
        trajectory.trajectories,
        "Island allele frequency pulled from q 0.1 toward source frequency " + sourceQ.toFixed(2),
        false
      );
      parts.visual.append(statusStrip(el, [
        { label: "population size N", value: compact(islandN, 0) },
        { label: "migration fraction m", value: m.toExponential(2) },
        { label: "absolute migrants Nm", value: compact(result.migrants, 2), tone: "active" },
        { label: "equilibrium FST", value: result.fst.toFixed(3), tone: result.fst > 0.5 ? "warning" : "signal" },
      ], "Island-model migration and differentiation"));
      parts.controls.replaceChildren(
        rangeControl(el, "Island population N", islandN, {
          min: 50, max: 5000, step: 50, format: (value) => compact(value, 0),
        }, (value) => { islandN = value; render(); }),
        rangeControl(el, "Migrants per generation Nm", migrants, {
          min: 0.05, max: 10, step: 0.05, format: (value) => Number(value).toFixed(2),
        }, (value) => { migrants = value; render(); }),
        rangeControl(el, "Source allele frequency", sourceQ, {
          min: 0.1, max: 0.95, step: 0.05, format: (value) => Number(value).toFixed(2),
        }, (value) => { sourceQ = value; render(); }),
        el("div", { class: "readout" }, [
          stat(result.fst.toFixed(3), "FST ≈ 1/(1+4Nm)"),
          stat(result.next.toFixed(4), "island q after one generation"),
          stat(compact(Math.log(0.5) / Math.log(1 - m), 1), "frequency half-life · generations"),
          stat(result.migrants.toFixed(2), "the parameter drift sees"),
        ])
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "you changed", value: compact(migrants, 2) + " migrants, not a percentage" },
        { key: "mechanism", value: "migration erases the IBD that drift creates" },
        { key: "observable", value: "FST ≈ " + result.fst.toFixed(3) + " at equilibrium" },
      ]));
      parts.explanation.className = "callout callout-good";
      parts.explanation.innerHTML = "<strong>Hold <em>Nm</em> fixed and move <em>N</em>: F<sub>ST</sub> does not change.</strong> A larger island receives a smaller migrant fraction, but it also drifts more slowly by the matching factor. One migrant per generation gives F<sub>ST</sub> ≈ 0.20; it prevents runaway divergence without making the demes identical.";
    }

    function applyNeScenario(value) {
      neScenario = value;
      if (value === "ideal") {
        census = 1000; maleFraction = 0.5; offspringVariance = 2; bottleneck = 1000;
      } else if (value === "harem") {
        census = 1000; maleFraction = 0.01; offspringVariance = 10; bottleneck = 1000;
      } else if (value === "bottleneck") {
        census = 1000; maleFraction = 0.5; offspringVariance = 2; bottleneck = 10;
      } else if (value === "managed") {
        census = 500; maleFraction = 0.5; offspringVariance = 0; bottleneck = 500;
      } else {
        census = 10000; maleFraction = 0.5; offspringVariance = 2; bottleneck = 10000;
      }
    }

    function renderNe() {
      const history = neScenario === "bottleneck"
        ? [census, census, bottleneck, census, census]
        : [census, census, census, census, census];
      const s = -Math.pow(10, selectionLog);
      const result = populationForcesModel({
        kind: "effectiveSize", history, maleFraction, offspringVariance, s,
      });
      const historyRows = history.map((value, index) => ({
        label: "generation " + (index + 1), value, display: compact(value, 0),
        tone: value === Math.min(...history) ? "warning" : "active",
      }));
      parts.visual.replaceChildren(
        barBoard(el, historyRows, "Census-size history whose reciprocal average sets drift", Math.max(...history)),
        processBoard(el, [
          { label: "time correction", value: "harmonic N = " + compact(result.harmonic, 1), tone: history.some((value) => value < census) ? "warning" : "active" },
          { label: "sex-ratio correction", value: "× " + result.sexFactor.toFixed(3) },
          { label: "offspring-variance correction", value: "× " + result.varianceFactor.toFixed(3) },
          { label: "drift-equivalent size", value: "Nₑ ≈ " + compact(result.adjusted, 1), tone: "signal" },
          { label: "selection visibility", value: "Nₑs = " + result.scaled.toFixed(3) + " · " + result.category },
        ], "Effective size is the ideal population with the same rate of drift")
      );
      parts.controls.replaceChildren(
        el("div", { class: "lab-control-block" }, [
          el("span", { class: "lab-control-label", text: "Population history fixture" }),
          choiceRow(el, [
            { label: "Ideal population", value: "ideal" },
            { label: "Harem + high variance", value: "harem" },
            { label: "One-generation crash", value: "bottleneck" },
            { label: "Managed equal families", value: "managed" },
            { label: "Human deep-time scale", value: "human" },
          ], neScenario, (value) => { applyNeScenario(value); render(); }, "Effective population-size fixture"),
        ]),
        neScenario !== "human" ? rangeControl(el, "Typical census N", census, {
          min: 50, max: 5000, step: 50, format: (value) => compact(value, 0),
        }, (value) => { census = value; if (neScenario !== "bottleneck") bottleneck = value; render(); }) : el("span"),
        neScenario === "bottleneck" ? rangeControl(el, "Crash-generation census", bottleneck, {
          min: 2, max: 200, step: 2, format: (value) => compact(value, 0),
        }, (value) => { bottleneck = value; render(); }) : el("span"),
        (neScenario === "ideal" || neScenario === "harem" || neScenario === "managed") ? rangeControl(el, "Male fraction among breeders", maleFraction, {
          min: 0.01, max: 0.5, step: 0.01, format: (value) => percent(value, 0),
        }, (value) => { maleFraction = value; render(); }) : el("span"),
        (neScenario === "ideal" || neScenario === "harem" || neScenario === "managed") ? rangeControl(el, "Variance in offspring number Vk", offspringVariance, {
          min: 0, max: 20, step: 0.5, format: (value) => Number(value).toFixed(1),
        }, (value) => { offspringVariance = value; render(); }) : el("span"),
        rangeControl(el, "Deleterious effect log10 |s|", selectionLog, {
          min: -7, max: -2, step: 0.25, format: (value) => Math.pow(10, value).toExponential(1),
        }, (value) => { selectionLog = value; render(); }),
        el("div", { class: "readout" }, [
          stat(compact(result.adjusted, 1), "effective population Nₑ"),
          stat(result.newMutationP.toExponential(2), "neutral P(fix) = 1/(2Nₑ)"),
          stat(result.fixation.toExponential(2), "selected P(fix) for new allele"),
          stat(result.scaled.toFixed(3), "Nₑs"),
          stat(result.category, "allele regime"),
          stat(neScenario === "human" ? "8 billion now" : compact(census, 0), "census is not Nₑ"),
        ])
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "you changed", value: neScenario + " demographic history" },
        { key: "mechanism", value: "drift accumulates as a sum of reciprocal population sizes" },
        { key: "observable", value: "Nₑ ≈ " + compact(result.adjusted, 1) + " makes Nₑs " + result.scaled.toFixed(3) },
      ]));
      parts.explanation.className = "callout";
      const approximationNote = result.approximationFloored
        ? " <strong>This extreme slider combination pushes the multiplicative approximation below one ideal diploid.</strong> The display floors N<sub>e</sub> at 1; interpret the direction, not the extrapolated magnitude."
        : "";
      parts.explanation.innerHTML = (neScenario === "human"
        ? "<strong>Human N<sub>e</sub> ≈ 10⁴ is a drift-equivalent deep-time summary, not a head count.</strong> Small, structured ancestral epochs dominate a harmonic-mean-like statistic; the recent expansion to billions contributes almost nothing. It does not claim that only ten thousand humans were ever alive."
        : neScenario === "bottleneck"
          ? "<strong>The crash owns the average because drift adds reciprocals.</strong> Replace the arithmetic mean with 1/N<sub>e</sub> = mean(1/N<sub>t</sub>): large generations approach zero in reciprocal space while the smallest generation remains enormous. A population remembers its worst moment."
          : "<strong>N<sub>e</sub> is defined by an observable rate, not by breeding-adult count.</strong> A rare sex and highly variable family size reduce independent gene-pool contributions; exceptionally even reproduction can make variance N<sub>e</sub> exceed census N.") + approximationNote;
    }

    function render() {
      parts.tabHost.replaceChildren(modeTabs());
      if (mode === "forces") renderForces();
      else if (mode === "balance") renderBalance();
      else if (mode === "islands") renderIslands();
      else renderNe();
    }

    predict(body, {
      widget: "population-forces-lab",
      question: "The same mildly deleterious mutation has s = −10⁻⁵ in humans (Nₑ ≈ 10⁴) and fruit flies (Nₑ ≈ 10⁶). In which population can selection reliably see it?",
      hint: "Compare |Nₑs|, not the molecular consequence alone.",
      options: [
        { label: "Humans only" },
        { label: "Fruit flies only", correct: true },
        { label: "Both equally" },
        { label: "Neither; deleterious alleles always drift" },
      ],
    }, () => {
      mode = "ne";
      applyNeScenario("human");
      selectionLog = -5;
      parts.instrument.hidden = false;
      render();
    });
    finishLab(parts, body);
  });

  /* Ch 28 — structure, inbreeding, and confounding --------------------- */

  function structureMethodVisual(el, method) {
    const board = el("div", {
      class: "pop-method-board is-" + method,
      role: "img",
      "aria-label": STRUCTURE_METHODS[method].output + ". Main caution: " + STRUCTURE_METHODS[method].trap,
    });
    if (method === "pca") {
      const field = el("div", { class: "pop-pca-field", "aria-hidden": "true" });
      for (let index = 0; index < 28; index += 1) {
        const x = 7 + index * 86 / 27;
        const y = 55 + 29 * Math.sin(index * 0.61) + 8 * Math.cos(index * 1.7);
        field.append(el("span", {
          class: "pop-pca-dot " + (index < 9 ? "is-one" : index > 18 ? "is-two" : "is-mixed"),
          style: "left:" + x.toFixed(1) + "%;top:" + clamp(y, 12, 88).toFixed(1) + "%",
        }));
      }
      board.append(field, el("div", { class: "pop-method-axis", text: "continuous relatedness gradient →" }));
      return board;
    }
    if (method === "admixture") {
      const bars = el("div", { class: "pop-admixture-bars", "aria-hidden": "true" });
      [0, 0.05, 0.12, 0.25, 0.38, 0.5, 0.62, 0.75, 0.88, 0.95, 1].forEach((fraction) => {
        bars.append(el("span", { class: "pop-admixture-person" }, [
          el("i", { class: "is-one", style: "height:" + (fraction * 100) + "%" }),
          el("i", { class: "is-two", style: "height:" + ((1 - fraction) * 100) + "%" }),
        ]));
      });
      board.append(bars, el("div", { class: "pop-method-axis", text: "Q proportions under the K you chose—not discovered kinds" }));
      return board;
    }
    if (method === "fst") {
      const scan = el("div", { class: "pop-fst-scan", "aria-hidden": "true" });
      [18, 24, 15, 31, 22, 39, 28, 20, 84, 33, 25, 46, 19, 29, 37, 23, 42, 27, 21, 35].forEach((height, index) => {
        scan.append(el("span", {
          class: "pop-fst-column" + (height > 70 ? " is-outlier" : ""),
          style: "height:" + height + "%",
        }, [el("i", { text: index === 8 ? "?" : "" })]));
      });
      board.append(scan, el("div", { class: "pop-method-axis", text: "an extreme locus needs a demographic null before it becomes adaptation" }));
      return board;
    }
    const mosaic = el("div", { class: "pop-local-mosaic", "aria-hidden": "true" });
    [[18, 14, 27, 9, 32], [7, 31, 12, 26, 24]].forEach((segments, laneIndex) => {
      const lane = el("div", { class: "pop-ancestry-lane" });
      segments.forEach((width, index) => lane.append(el("span", {
        class: "is-" + ((index + laneIndex) % 2 ? "two" : "one"),
        style: "width:" + width + "%",
      })));
      mosaic.append(lane);
    });
    board.append(mosaic, el("div", { class: "pop-method-axis", text: "recombination turns source chromosomes into a tract-length clock" }));
    return board;
  }

  define("structure-inbreeding-lab", {
    "ch28-o1": "Pedigree mode counts independent common-ancestor paths, applies the path-length exponent, and keeps the declared base population visible in the interpretation of F.",
    "ch28-o2": "Pedigree risk mode transforms F into p²+Fpq, 2pq(1−F), and q²+Fpq and reports baseline, relative, and absolute recessive risk together.",
    "ch28-o3": "ROH mode treats recombination breakpoints as a tract clock, inverts mean length to generations, and separates recent long runs from ancient numerous short runs.",
    "ch28-o4": "Structure algebra mode computes the exact Wahlund deficit, HI-HS-HT, FIS-FST-FIT, and verifies their multiplicative chain numerically.",
    "ch28-o5": "The FST interpretation fixture partitions frequency variance while explicitly separating variance share, sequence difference, continuous ancestry, and multi-locus classification.",
    "ch28-o6": "Method mode gives PCA, ADMIXTURE, FST scans, and local ancestry their own data representation, measured object, output, and characteristic artefact.",
    "ch28-o7": "GWAS confounding mode sets the true within-group effect to zero, computes the pooled omitted-variable covariance, and shows fixed bias becoming more significant as N grows.",
  }, ({ body, el, stat, predict }) => {
    const parts = labParts(el);
    let mode = "pedigree";
    let relationship = "firstCousins";
    let diseaseLog = -3;
    let rohF = 0.0625;
    let rohLength = 16.7;
    let structureFixture = "worked";
    let p1 = 0.1;
    let p2 = 0.5;
    let groupWeight = 0.5;
    let fis = 0;
    let methodsView = "method";
    let method = "pca";
    let confoundNLog = 4;
    let phenotypeGap = 0.7;

    function modeTabs() {
      return tabs(el, [
        { label: "Pedigree loops", value: "pedigree" },
        { label: "ROH clock", value: "roh" },
        { label: "Structure algebra", value: "structure" },
        { label: "Methods & GWAS", value: "methods" },
      ], mode, (value) => { mode = value; render(); });
    }

    function renderPedigree() {
      const q = Math.pow(10, diseaseLog);
      const result = structureInbreedingModel({ kind: "pedigree", relationship, q });
      parts.visual.innerHTML = pedigreeSvg(result);
      parts.visual.append(barBoard(el, [
        { label: "AA", value: result.genotypes.AA, display: percent(result.genotypes.AA, 3), tone: "active" },
        { label: "Aa", value: result.genotypes.Aa, display: percent(result.genotypes.Aa, 3), tone: "signal" },
        { label: "aa", value: result.genotypes.aa, display: percent(result.genotypes.aa, 4), tone: "warning" },
      ], "Genotype frequencies after pedigree inbreeding", 1));
      parts.controls.replaceChildren(
        el("div", { class: "lab-control-block" }, [
          el("span", { class: "lab-control-label", text: "Parents' relationship" }),
          choiceRow(el, Object.entries(PEDIGREE_FIXTURES).map(([value, fixture]) => ({
            label: fixture.label, value,
          })), relationship, (value) => { relationship = value; render(); }, "Pedigree relationship"),
        ]),
        rangeControl(el, "Recessive allele frequency log10 q", diseaseLog, {
          min: -5, max: -0.5, step: 0.1, format: (value) => Math.pow(10, value).toExponential(1),
        }, (value) => { diseaseLog = value; render(); }),
        el("div", { class: "readout" }, [
          stat(result.F.toFixed(4), "pedigree F"),
          stat("1 in " + compact(1 / result.baseline, 0), "unrelated baseline"),
          stat("1 in " + compact(1 / result.risk, 0), "offspring risk"),
          stat(compact(result.relativeRisk, 1) + "×", "relative risk"),
          stat(percent(result.absoluteExcess, 4), "absolute excess · this locus"),
        ])
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "you changed", value: result.fixture.label + " · " + result.fixture.paths + " shared-ancestor paths" },
        { key: "mechanism", value: "both inherited alleles can copy one ancestral allele" },
        { key: "observable", value: "q² + Fpq = " + result.risk.toExponential(3) },
      ]));
      parts.explanation.className = "callout";
      parts.explanation.innerHTML = "<strong>Quote relative and absolute risk together.</strong> For a rare recessive, 1 + F(1−q)/q can be a large multiplier on a tiny baseline. Inbreeding creates no mutation and does not move q; it converts hidden heterozygous copies into homozygotes that selection and clinical observation can see.";
    }

    function renderRoh() {
      const result = structureInbreedingModel({ kind: "roh", F: rohF, meanLengthCm: rohLength });
      parts.visual.replaceChildren(
        rohBoard(el, result),
        processBoard(el, [
          { label: "realised autozygosity", value: "FROH = " + result.F.toFixed(4) },
          { label: "mean unbroken tract", value: compact(result.meanLengthCm, 1) + " cM", tone: result.meanLengthCm >= 12 ? "warning" : "active" },
          { label: "recombination clock", value: "g ≈ 50/L = " + compact(result.generations, 1) + " generations" },
          { label: "history", value: result.interpretation, tone: "signal" },
        ], "ROH amount and ROH length answer different questions")
      );
      parts.controls.replaceChildren(
        rangeControl(el, "Genome fraction in ROH", rohF, {
          min: 0.005, max: 0.25, step: 0.0025, format: (value) => percent(value, 2),
        }, (value) => { rohF = value; render(); }),
        rangeControl(el, "Mean ROH length", rohLength, {
          min: 0.5, max: 35, step: 0.5, format: (value) => Number(value).toFixed(1) + " cM",
        }, (value) => { rohLength = value; render(); }),
        el("div", { class: "readout" }, [
          stat(compact(result.totalCm, 1) + " cM", "total autozygous map"),
          stat(compact(result.tracts, 1), "expected tract count"),
          stat(compact(result.generations, 1), "shared ancestor · generations"),
          stat(result.interpretation, "history readout"),
        ])
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "you changed", value: "the same F into few long or many short tracts" },
        { key: "mechanism", value: "breakpoints accumulate once per Morgan per meiosis" },
        { key: "observable", value: result.interpretation },
      ]));
      parts.explanation.className = "callout callout-good";
      parts.explanation.innerHTML = "<strong>F is an amount; tract length is a clock.</strong> Two genomes can both have F<sub>ROH</sub> = 0.05 while one records a recent cousin union and the other a century of small-community ancestry. Pedigree F predicts the mean; only the chromosome reveals the realised draw.";
    }

    function applyStructureFixture(value) {
      structureFixture = value;
      if (value === "worked") { p1 = 0.1; p2 = 0.5; groupWeight = 0.5; }
      if (value === "subtle") { p1 = 0.4; p2 = 0.5; groupWeight = 0.5; }
      if (value === "humanLens") {
        p1 = (1 - Math.sqrt(0.12)) / 2;
        p2 = (1 + Math.sqrt(0.12)) / 2;
        groupWeight = 0.5;
      }
    }

    function renderStructure() {
      const result = structureInbreedingModel({ kind: "wahlund", p1, p2, weight: groupWeight, fis });
      parts.visual.replaceChildren(
        el("div", { class: "pop-pool-pair" }, [
          el("div", { class: "pop-pool" }, [
            el("strong", { text: "group 1 · p = " + p1.toFixed(2) }),
            beadField(el, [
              { label: "A", value: p1, tone: "active", symbol: "A" },
              { label: "a", value: 1 - p1, tone: "signal", symbol: "a" },
            ], "Allele pool in group 1", 40),
          ]),
          el("div", { class: "pop-pool" }, [
            el("strong", { text: "group 2 · p = " + p2.toFixed(2) }),
            beadField(el, [
              { label: "A", value: p2, tone: "active", symbol: "A" },
              { label: "a", value: 1 - p2, tone: "signal", symbol: "a" },
            ], "Allele pool in group 2", 40),
          ]),
        ]),
        barBoard(el, [
          { label: "HI observed in people", value: result.hi, display: result.hi.toFixed(3), tone: "warning" },
          { label: "HS expected within groups", value: result.hs, display: result.hs.toFixed(3), tone: "signal" },
          { label: "HT expected after pooling", value: result.ht, display: result.ht.toFixed(3), tone: "active" },
        ], "Nested heterozygosities", Math.max(result.ht, result.hs, result.hi, 0.001))
      );
      parts.controls.replaceChildren(
        el("div", { class: "lab-control-block" }, [
          el("span", { class: "lab-control-label", text: "Structure fixture" }),
          choiceRow(el, [
            { label: "Worked example", value: "worked" },
            { label: "Subtle frequency gap", value: "subtle" },
            { label: "FST = 0.12 lens", value: "humanLens" },
            ...(structureFixture === "custom" ? [{ label: "Custom slider values", value: "custom" }] : []),
          ], structureFixture, (value) => { applyStructureFixture(value); render(); }, "Population-structure fixture"),
        ]),
        rangeControl(el, "Group 1 allele frequency", p1, {
          min: 0.02, max: 0.98, step: 0.01, format: (value) => Number(value).toFixed(2),
        }, (value) => { p1 = value; structureFixture = "custom"; render(); }),
        rangeControl(el, "Group 2 allele frequency", p2, {
          min: 0.02, max: 0.98, step: 0.01, format: (value) => Number(value).toFixed(2),
        }, (value) => { p2 = value; structureFixture = "custom"; render(); }),
        rangeControl(el, "Within-group FIS", fis, {
          min: -0.2, max: 0.4, step: 0.01, format: (value) => Number(value).toFixed(2),
        }, (value) => { fis = value; render(); }),
        el("div", { class: "readout" }, [
          stat(result.heterozygoteDeficit.toFixed(3), "Wahlund deficit HT−HS"),
          stat(result.fis.toFixed(3), "FIS"),
          stat(result.fst.toFixed(3), "FST"),
          stat(result.fit.toFixed(3), "FIT"),
          stat((result.fit - result.chainedFit).toExponential(1), "chain residual"),
        ])
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "you changed", value: "allele-frequency variance among groups" },
        { key: "mechanism", value: "average of squares exceeds square of the average" },
        { key: "observable", value: "FST = Var(p)/(p̄q̄) = " + result.fst.toFixed(3) },
      ]));
      parts.explanation.className = "callout";
      parts.explanation.innerHTML = structureFixture === "humanLens"
        ? "<strong>F<sub>ST</sub> = 0.12 is a variance ratio, not 12% sequence difference and not a proof of discrete groups.</strong> Most allele-frequency variance remains within groups, while small differences correlated over many loci still make ancestry accurately inferable. Human variation is largely clinal; sampling and model K can draw boxes on that continuum."
        : "<strong>At one locus, pooled structure and inbreeding are algebraically indistinguishable.</strong> Both replace independent draws with correlated ancestry and reduce heterozygosity by the same factor. Across the genome, long contiguous ROH points to inbreeding; low-rank covariance across people points to structure.";
    }

    function renderMethods() {
      const subTabs = choiceRow(el, [
        { label: "Choose a structure tool", value: "method" },
        { label: "Manufacture a GWAS hit", value: "confounding" },
      ], methodsView, (value) => { methodsView = value; render(); }, "Structure method or GWAS confounding");
      if (methodsView === "method") {
        const result = structureInbreedingModel({ kind: "method", method });
        parts.visual.replaceChildren(
          structureMethodVisual(el, method),
          processBoard(el, [
            { label: "method", value: method === "local" ? "local ancestry HMM" : method.toUpperCase(), tone: "active" },
            { label: "actually measures", value: result.measures },
            { label: "legitimate output", value: result.output, tone: "signal" },
            { label: "characteristic trap", value: result.trap, tone: "warning" },
          ], "Use each structure method inside its evidence boundary")
        );
        parts.controls.replaceChildren(
          subTabs,
          el("div", { class: "lab-control-block" }, [
            el("span", { class: "lab-control-label", text: "Analysis" }),
            choiceRow(el, [
              { label: "PCA", value: "pca" },
              { label: "ADMIXTURE", value: "admixture" },
              { label: "FST outlier scan", value: "fst" },
              { label: "Local ancestry", value: "local" },
            ], method, (value) => { method = value; render(); }, "Population-structure analysis"),
          ]),
          el("div", { class: "readout" }, [
            stat(result.output, "what you may conclude"),
            stat(result.trap, "what can fake it"),
          ])
        );
        parts.rail.replaceChildren(causalRail(el, [
          { key: "you changed", value: method + " representation" },
          { key: "mechanism", value: result.measures },
          { key: "observable", value: result.output },
        ]));
        parts.explanation.className = "callout";
        parts.explanation.innerHTML = "<strong>A plot is not the generative history.</strong> PCA is an eigendecomposition of relatedness; ADMIXTURE is a constrained factorisation at a chosen K; F<sub>ST</sub> outliers inherit their demographic null; local ancestry is an HMM whose answer depends on its reference panels.";
        return;
      }

      const n = Math.round(Math.pow(10, confoundNLog));
      const result = structureInbreedingModel({
        kind: "confounding", weight: 0.5, p1: 0.2, p2: 0.7,
        mean1: 0, mean2: phenotypeGap, residualSd: 1, n,
      });
      const evidenceRows = [1000, 10000, 100000, 500000].map((sampleSize) => {
        const value = structureInbreedingModel({
          kind: "confounding", weight: 0.5, p1: 0.2, p2: 0.7,
          mean1: 0, mean2: phenotypeGap, residualSd: 1, n: sampleSize,
        });
        return { label: "N = " + compact(sampleSize, 0), value: value.t, display: "|t| " + value.t.toFixed(1), tone: sampleSize === n ? "warning" : "active" };
      });
      parts.visual.replaceChildren(
        processBoard(el, [
          { label: "within each group", value: "true SNP effect = 0", tone: "active" },
          { label: "ancestry → genotype", value: "p₁ = 0.20 · p₂ = 0.70" },
          { label: "ancestry → phenotype", value: "mean gap = " + phenotypeGap.toFixed(2) },
          { label: "pooled omitted-variable bias", value: "Cov(g,y) = " + result.covariance.toFixed(4), tone: "warning" },
        ], "Ancestry is a common cause of genotype and phenotype"),
        barBoard(el, evidenceRows, "The same fixed bias becomes more statistically decisive as sample size grows")
      );
      parts.controls.replaceChildren(
        subTabs,
        rangeControl(el, "Study size log10 N", confoundNLog, {
          min: 3, max: Math.log10(500000), step: 0.05, format: (value) => compact(Math.pow(10, value), 0),
        }, (value) => { confoundNLog = value; render(); }),
        rangeControl(el, "Phenotype mean difference between groups", phenotypeGap, {
          min: 0, max: 2, step: 0.05, format: (value) => Number(value).toFixed(2) + " SD",
        }, (value) => { phenotypeGap = value; render(); }),
        el("div", { class: "readout" }, [
          stat("0", "true within-group slope"),
          stat(result.slope.toFixed(4), "biased pooled slope"),
          stat(result.correlation.toFixed(4), "pooled correlation"),
          stat(result.t.toFixed(1), "apparent |t| at selected N"),
        ])
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "you changed", value: "sample size while holding confounding fixed" },
        { key: "mechanism", value: "bias stays constant; standard error shrinks as 1/√N" },
        { key: "observable", value: "an increasingly significant false association" },
      ]));
      parts.explanation.className = "callout callout-bad";
      parts.explanation.innerHTML = "<strong>Bigger cohorts amplify stratification artifacts.</strong> This is bias, not variance: the fitted effect does not approach zero, while its uncertainty collapses. PCs and mixed models approximate the missing ancestry variable; within-family transmission removes it by design.";
    }

    function render() {
      parts.tabHost.replaceChildren(modeTabs());
      if (mode === "pedigree") renderPedigree();
      else if (mode === "roh") renderRoh();
      else if (mode === "structure") renderStructure();
      else renderMethods();
    }

    predict(body, {
      widget: "structure-inbreeding-lab",
      question: "Two equally sized groups are each in perfect Hardy–Weinberg equilibrium, but their allele frequencies are p = 0.1 and p = 0.5. What happens when you pool them and test them as one population?",
      hint: "Compare the average of p² with the square of the average p.",
      options: [
        { label: "The pooled sample remains exactly in HWE" },
        { label: "It shows a heterozygote deficit", correct: true },
        { label: "It shows a heterozygote excess" },
        { label: "Allele frequency becomes undefined" },
      ],
    }, () => {
      mode = "structure";
      applyStructureFixture("worked");
      parts.instrument.hidden = false;
      render();
    });
    finishLab(parts, body);
  });

  /* Ch 29 — haplotypes and linkage disequilibrium ---------------------- */

  const LD_FIXTURES = {
    worked: { label: "worked table", AB: 90, Ab: 10, aB: 30, ab: 70 },
    rare: { label: "rare allele · D′ trap", AB: 10, Ab: 90, aB: 0, ab: 100 },
    equilibrium: { label: "linkage equilibrium", AB: 50, Ab: 50, aB: 50, ab: 50 },
    negative: { label: "repulsion association", AB: 10, Ab: 90, aB: 70, ab: 30 },
  };

  function phaseSvg(phase, linked, cause) {
    const top = phase === "coupling" ? ["A", "B"] : ["A", "b"];
    const bottom = phase === "coupling" ? ["a", "b"] : ["a", "B"];
    const secondX = linked ? 380 : 455;
    return textSvg(
      '<path class="pop-haplotype-line is-one" d="M65 92 L455 92"/><path class="pop-haplotype-line is-two" d="M65 190 L455 190"/>' +
      '<circle class="pop-haplotype-locus is-one" cx="140" cy="92" r="20"/><circle class="pop-haplotype-locus is-one" cx="' + secondX + '" cy="92" r="20"/>' +
      '<circle class="pop-haplotype-locus is-two" cx="140" cy="190" r="20"/><circle class="pop-haplotype-locus is-two" cx="' + secondX + '" cy="190" r="20"/>' +
      '<text class="pop-haplotype-allele" x="140" y="98" text-anchor="middle">' + top[0] + '</text><text class="pop-haplotype-allele" x="' + secondX + '" y="98" text-anchor="middle">' + top[1] + "</text>" +
      '<text class="pop-haplotype-allele" x="140" y="196" text-anchor="middle">' + bottom[0] + '</text><text class="pop-haplotype-allele" x="' + secondX + '" y="196" text-anchor="middle">' + bottom[1] + "</text>" +
      '<text class="lab-svg-kicker" x="65" y="28">same unphased genotype: A/a · B/b</text>' +
      '<text class="lab-svg-label" x="65" y="58">physical chromosomes reveal ' +
        (phase === "coupling" ? "AB / ab" : "Ab / aB") + "</text>" +
      '<path class="pop-distance-bracket" d="M140 238 L' + secondX + ' 238 M140 230 L140 246 M' + secondX + ' 230 L' + secondX + ' 246"/>' +
      '<text class="lab-svg-label" x="' + ((140 + secondX) / 2) + '" y="268" text-anchor="middle">' +
        (linked ? "same chromosome · linkage slows decay" : "different chromosomes · c = 0.5") + "</text>" +
      '<text class="pop-phase-verdict" x="260" y="300" text-anchor="middle">current LD source: ' + cause + "</text>",
      "Two possible haplotype phases for a double heterozygote. The genotype is unchanged. The loci are " +
        (linked ? "linked" : "unlinked") + ", and the current population association comes from " + cause + ".",
      "0 0 520 316",
      "pop-phase"
    );
  }

  function ldTableBoard(el, result) {
    const board = el("div", {
      class: "pop-ld-table",
      role: "table",
      "aria-label": "Haplotype count table. AB " + result.counts.AB + ", Ab " + result.counts.Ab +
        ", aB " + result.counts.aB + ", ab " + result.counts.ab + ".",
    });
    [
      { label: "AB", key: "AB", tone: "one" },
      { label: "Ab", key: "Ab", tone: "two" },
      { label: "aB", key: "aB", tone: "three" },
      { label: "ab", key: "ab", tone: "four" },
    ].forEach((cell) => board.append(el("div", {
      class: "pop-ld-cell is-" + cell.tone,
      role: "cell",
    }, [
      el("span", { text: cell.label }),
      el("strong", { text: compact(result.counts[cell.key], 0) }),
      el("small", { text: percent(result.frequencies[cell.key], 1) }),
    ])));
    return board;
  }

  function tagBlockBoard(el, ancestry, r2) {
    const variantCount = ancestry === "African ancestry" ? 28 : 20;
    const causal = Math.floor(variantCount * 0.56);
    const board = el("div", {
      class: "pop-tag-board",
      role: "img",
      "aria-label": ancestry + " haplotype block with " + variantCount +
        " common variants. The causal variant is untyped; tag correlation r squared is " + r2.toFixed(2) + ".",
    });
    const lane = el("div", { class: "pop-tag-lane", "aria-hidden": "true" });
    for (let index = 0; index < variantCount; index += 1) {
      lane.append(el("span", {
        class: "pop-tag-variant" + (index === causal ? " is-causal" : index % 5 === 1 ? " is-tag" : ""),
        text: index === causal ? "C" : index % 5 === 1 ? "T" : "·",
      }));
    }
    board.append(
      el("strong", { text: ancestry + " · " + (ancestry === "African ancestry" ? "shorter ~11 kb blocks" : "longer ~22 kb blocks") }),
      lane,
      el("div", { class: "pop-tag-legend" }, [
        el("span", { text: "T = assayed tag" }),
        el("span", { text: "C = untyped causal site" }),
        el("span", { text: "· = predicted neighbour" }),
      ])
    );
    return board;
  }

  define("linkage-disequilibrium-lab", {
    "ch29-o1": "Phase mode keeps the identical A/a B/b genotype above two alternative physical chromosome arrangements and shows why genotype data alone cannot choose between them.",
    "ch29-o2": "Phase mode independently toggles physical linkage and population association, including linked equilibrium and unlinked admixture LD fixtures.",
    "ch29-o3": "Haplotype-table mode derives marginals, D, the sign-specific D maximum, D-prime, and r-squared from the same four counts.",
    "ch29-o4": "The D-prime trap and tag bench make r-squared a dosage correlation and convert it directly into effective sample size and the 1/r-squared sample penalty.",
    "ch29-o5": "Decay mode iterates D_t = D_0(1-c)^t, squares the factor for r-squared, reports both half-lives, and maps recombination distance to an association clock.",
    "ch29-o6": "Origins mode contrasts mutation, finite-population drift, admixture including unlinked loci, and rapid selected sweeps against recombination as the eroding process.",
    "ch29-o7": "Tag and imputation mode turns block length into assay density, compares ancestry-specific block structure, and makes reference-panel haplotype copying and its failure explicit.",
  }, ({ body, el, stat, predict }) => {
    const parts = labParts(el);
    let mode = "phase";
    let phase = "coupling";
    let linked = true;
    let phaseCause = "new mutation";
    let ldFixture = "worked";
    let origin = "recombination";
    let distanceLogKb = 2;
    let decayGenerations = 100;
    let driftNeLd = 10000;
    let tagView = "tag";
    let tagR2 = 0.8;
    let causalN = 10000;
    let studyN = 20000;
    let ancestry = "European ancestry";
    let panelMatch = true;

    function modeTabs() {
      return tabs(el, [
        { label: "Phase ≠ linkage ≠ LD", value: "phase" },
        { label: "D · D′ · r²", value: "metrics" },
        { label: "Origins & decay", value: "decay" },
        { label: "Tags & imputation", value: "tags" },
      ], mode, (value) => { mode = value; render(); });
    }

    function renderPhase() {
      parts.visual.innerHTML = phaseSvg(phase, linked, phaseCause);
      parts.visual.append(processBoard(el, [
        { label: "genotype observation", value: "A/a at locus 1 · B/b at locus 2" },
        { label: "physical phase", value: phase === "coupling" ? "AB / ab" : "Ab / aB", tone: "signal" },
        { label: "linkage", value: linked ? "same chromosome; c < 0.5" : "different chromosomes; c = 0.5" },
        { label: "population LD", value: phaseCause + " creates an association now", tone: "active" },
      ], "Three different claims that are often collapsed into one word"));
      parts.controls.replaceChildren(
        el("div", { class: "lab-control-block" }, [
          el("span", { class: "lab-control-label", text: "Unobserved phase" }),
          choiceRow(el, [
            { label: "Coupling AB / ab", value: "coupling" },
            { label: "Repulsion Ab / aB", value: "repulsion" },
          ], phase, (value) => { phase = value; render(); }, "Haplotype phase"),
        ]),
        el("div", { class: "lab-control-block" }, [
          el("span", { class: "lab-control-label", text: "Physical genome" }),
          choiceRow(el, [
            { label: "Linked", value: true },
            { label: "Unlinked", value: false },
          ], linked, (value) => { linked = value; render(); }, "Physical linkage"),
        ]),
        el("div", { class: "lab-control-block" }, [
          el("span", { class: "lab-control-label", text: "Why the population is associated now" }),
          choiceRow(el, [
            { label: "New mutation", value: "new mutation" },
            { label: "Recent admixture", value: "recent admixture" },
            { label: "Bottleneck drift", value: "bottleneck drift" },
            { label: "Selected sweep", value: "selected sweep" },
            { label: "Nothing · D = 0", value: "nothing" },
          ], phaseCause, (value) => { phaseCause = value; render(); }, "Linkage-disequilibrium source"),
        ]),
        el("div", { class: "readout" }, [
          stat("underdetermined", "phase from this genotype"),
          stat(linked ? "slow decay" : "halves each generation", "linkage controls"),
          stat(phaseCause === "nothing" ? "D = 0" : "D may be non-zero", "population state"),
        ])
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "you changed", value: "phase, physical distance, and demographic cause independently" },
        { key: "mechanism", value: "linkage only sets the recombination brake" },
        { key: "observable", value: phaseCause === "nothing" ? "linked loci can be at equilibrium" : (!linked ? "unlinked loci can still be in LD" : "standing LD decays slowly") },
      ]));
      parts.explanation.className = "callout callout-good";
      parts.explanation.innerHTML = "<strong>Linkage is a chromosome property; LD is a population statistic.</strong> Tight linkage cannot manufacture an association, and unlinked loci can be correlated immediately after admixture. Phase is a third question: standard genotype calls lose which alleles share one physical chromosome.";
    }

    function renderMetrics() {
      const fixture = LD_FIXTURES[ldFixture];
      const result = linkageDisequilibriumModel(Object.assign({ kind: "table" }, fixture));
      parts.visual.replaceChildren(
        ldTableBoard(el, result),
        beadField(el, [
          { label: "AB", value: result.frequencies.AB, tone: "active", symbol: "AB" },
          { label: "Ab", value: result.frequencies.Ab, tone: "signal", symbol: "Ab" },
          { label: "aB", value: result.frequencies.aB, tone: "good", symbol: "aB" },
          { label: "ab", value: result.frequencies.ab, tone: "warning", symbol: "ab" },
        ], "Haplotype copies in the population", 100),
        statusStrip(el, [
          { label: "D = covariance", value: result.D.toFixed(4) },
          { label: "D′ = historical maximum", value: result.dPrime.toFixed(3), tone: Math.abs(result.dPrime) > 0.8 ? "signal" : "muted" },
          { label: "r² = prediction", value: result.r2.toFixed(3), tone: result.r2 >= 0.8 ? "active" : "warning" },
          { label: "tag sample penalty", value: Number.isFinite(result.sampleFactor) ? result.sampleFactor.toFixed(2) + "×" : "infinite" },
        ], "Three summaries of the same haplotype table")
      );
      parts.controls.replaceChildren(
        el("div", { class: "lab-control-block" }, [
          el("span", { class: "lab-control-label", text: "Haplotype table" }),
          choiceRow(el, Object.entries(LD_FIXTURES).map(([value, item]) => ({ label: item.label, value })),
            ldFixture, (value) => { ldFixture = value; render(); }, "Linkage-disequilibrium table fixture"),
        ]),
        el("div", { class: "readout" }, [
          stat(result.pA.toFixed(3), "pA"),
          stat(result.pB.toFixed(3), "pB"),
          stat(result.D.toFixed(4), "D = pAB−pApB"),
          stat(result.dPrime.toFixed(3), "signed D′"),
          stat(result.r2.toFixed(3), "r²"),
          stat(result.absentHaplotypes.length ? result.absentHaplotypes.join(", ") : "none", "absent haplotypes"),
        ])
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "you changed", value: fixture.label + " four-haplotype table" },
        { key: "mechanism", value: "D is covariance; D′ divides by the feasible bound; r² divides by both variances" },
        { key: "observable", value: "one tag retains " + percent(result.r2, 1) + " of causal-variant information" },
      ]));
      parts.explanation.className = "callout";
      parts.explanation.innerHTML = ldFixture === "rare"
        ? "<strong>Perfect D′ can be a useless proxy.</strong> One haplotype is absent, so |D′| = 1: the younger rare allele has not been separated from its background. But the allele frequencies are mismatched, capping r² near 0.05 and imposing roughly a nineteen-fold sample penalty."
        : "<strong>D, D′, and r² answer different questions.</strong> D is the raw departure from independence. D′ asks how much historical separation is possible at these marginals. r² is squared Pearson correlation—the quantity that transfers directly into prediction, power, and sample size.";
    }

    function renderDecay() {
      const distanceKb = Math.pow(10, distanceLogKb);
      const c = clamp(distanceKb * 1e-5, 0, 0.5);
      const decay = linkageDisequilibriumModel({
        kind: "decay", d0: 0.15, r20: 0.375, c, generations: decayGenerations,
      });
      const maxGenerations = Math.max(decayGenerations, Number.isFinite(decay.halfLifeD) ? decay.halfLifeD * 2 : 100);
      if (origin === "drift") {
        const distances = [10, 100, 1000].map((kb) => {
          const value = linkageDisequilibriumModel({ kind: "sved", ne: driftNeLd, c: kb * 1e-5 });
          return { label: kb + " kb", value: value.r2, display: "E[r²] " + value.r2.toFixed(3), tone: kb === 100 ? "signal" : "active" };
        });
        parts.visual.replaceChildren(
          barBoard(el, distances, "Drift-recombination equilibrium linkage disequilibrium", 1),
          processBoard(el, [
            { label: "creator", value: "finite haplotype sampling creates covariance", tone: "signal" },
            { label: "eraser", value: "recombination at c" },
            { label: "balance", value: "E[r²] ≈ 1/(1+4Nₑc)" },
            { label: "time slice", value: "short-distance LD reaches deeper population history" },
          ], "Drift continually regenerates LD while recombination removes it")
        );
      } else if (origin === "selection") {
        const sweepGenerations = 300;
        const neutralGenerations = 40000;
        const sweepSurvival = Math.pow(1 - c, sweepGenerations);
        const neutralSurvival = Math.pow(1 - c, neutralGenerations);
        parts.visual.replaceChildren(
          barBoard(el, [
            { label: "rapid selected rise · 300 generations", value: sweepSurvival, display: percent(sweepSurvival, 3), tone: "active" },
            { label: "neutral rise · ~40,000 generations", value: neutralSurvival, display: percent(neutralSurvival, 6), tone: "muted" },
          ], "Probability the selected interval survives without a separating crossover", 1),
          processBoard(el, [
            { label: "observation", value: "high allele frequency + unusually long shared haplotype", tone: "signal" },
            { label: "neutral expectation", value: "common alleles are old; old haplotypes are short" },
            { label: "selection explanation", value: "frequency rose before recombination could erase the background", tone: "active" },
          ], "A long common haplotype is a clock violation")
        );
      } else {
        parts.visual.innerHTML = ldDecaySvg(0.15, 0.375, c, maxGenerations);
        const extra = origin === "admixture"
          ? linkageDisequilibriumModel({
            kind: "admixture", m: 0.5, pA1: 0.9, pA2: 0.1, pB1: 0.8, pB2: 0.2,
            c, generations: decayGenerations,
          })
          : null;
        parts.visual.append(processBoard(el, [
          { label: "creator", value: origin === "admixture" ? "mixing covariance m(1−m)ΔpAΔpB" : "a new mutation begins on one intact background", tone: "signal" },
          { label: "initial D", value: origin === "admixture" ? extra.d0.toFixed(4) : "D′ = 1 at birth" },
          { label: "eraser", value: "multiply D by (1−c) each generation" },
          { label: "after t", value: origin === "admixture" ? "D = " + extra.remaining.toFixed(4) : "D retains " + percent(decay.dFactor, 1), tone: "active" },
        ], "LD is created by history and eroded by recombination")
        );
      }

      parts.controls.replaceChildren(
        el("div", { class: "lab-control-block" }, [
          el("span", { class: "lab-control-label", text: "What created the association?" }),
          choiceRow(el, [
            { label: "New mutation", value: "recombination" },
            { label: "Finite-population drift", value: "drift" },
            { label: "Admixture", value: "admixture" },
            { label: "Selected sweep", value: "selection" },
          ], origin, (value) => { origin = value; render(); }, "Source of linkage disequilibrium"),
        ]),
        rangeControl(el, "Locus separation", distanceLogKb, {
          min: 1, max: Math.log10(50000), step: 0.05,
          format: (value) => compact(Math.pow(10, value), 0) + " kb · c ≈ " +
            Math.min(0.5, Math.pow(10, value) * 1e-5).toFixed(4),
        }, (value) => { distanceLogKb = value; render(); }),
        (origin === "recombination" || origin === "admixture") ? rangeControl(el, "Generations since creation", decayGenerations, {
          min: 0, max: 2000, step: 10, format: (value) => compact(value, 0),
        }, (value) => { decayGenerations = value; render(); }) : el("span"),
        origin === "drift" ? rangeControl(el, "Effective population size Nₑ", driftNeLd, {
          min: 1000, max: 50000, step: 1000, format: (value) => compact(value, 0),
        }, (value) => { driftNeLd = value; render(); }) : el("span"),
        el("div", { class: "readout" }, [
          stat(c.toFixed(5), "recombination fraction c"),
          stat(Number.isFinite(decay.halfLifeD) ? compact(decay.halfLifeD, 1) : "∞", "D half-life · generations"),
          stat(Number.isFinite(decay.halfLifeR2) ? compact(decay.halfLifeR2, 1) : "∞", "r² half-life · generations"),
          stat(percent(decay.r2Factor, 2), "association power retained at t"),
        ])
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "you changed", value: origin + " history at " + compact(distanceKb, 0) + " kb" },
        { key: "mechanism", value: "recombination multiplies D by 1−c and r² by (1−c)²" },
        { key: "observable", value: origin === "selection" ? "long haplotype at high frequency" : origin === "drift" ? "distance-dependent equilibrium r²" : percent(decay.r2Factor, 2) + " of starting power" },
      ]));
      parts.explanation.className = "callout";
      parts.explanation.innerHTML = origin === "admixture"
        ? "<strong>Admixture creates LD genome-wide—even for c = 0.5.</strong> The initial covariance is m(1−m)Δp<sub>A</sub>Δp<sub>B</sub>; unlinked LD then halves every generation, while nearby loci retain it long enough to date the mixture."
        : origin === "selection"
          ? "<strong>Selection is inferred from an age mismatch, not from long haplotypes alone.</strong> A common allele should normally be old enough for recombination to shorten its background. High frequency plus exceptional length says the rise was recent and fast."
          : origin === "drift"
            ? "<strong>Finite sampling prevents a population from settling at D = 0.</strong> Drift continually generates haplotype covariance; recombination removes it. Their equilibrium depends on N<sub>e</sub>c, so smaller populations carry longer-range LD."
            : "<strong>Every mutation is born at |D′| = 1 and usually tiny r².</strong> It occupies one background but starts rare; recombination then removes one fraction c of the remaining covariance each generation. The squared correlation—and therefore GWAS power—decays twice as fast.";
    }

    function renderTags() {
      const subTabs = choiceRow(el, [
        { label: "Tag-SNP array", value: "tag" },
        { label: "Haplotype imputation", value: "imputation" },
      ], tagView, (value) => { tagView = value; render(); }, "Tag-SNP or imputation view");
      if (tagView === "tag") {
        const result = linkageDisequilibriumModel({ kind: "tag", r2: tagR2, causalN, studyN });
        parts.visual.replaceChildren(
          tagBlockBoard(el, ancestry, tagR2),
          processBoard(el, [
            { label: "causal variant", value: "not directly assayed" },
            { label: "tag correlation", value: "r² = " + result.r2.toFixed(2), tone: result.r2 >= 0.8 ? "active" : "warning" },
            { label: "information retained", value: percent(result.effectVarianceRetained, 0) },
            { label: "cohort required", value: compact(result.tagN, 0) + " instead of " + compact(result.causalN, 0), tone: "signal" },
          ], "A tag is a lossy measurement of the causal dosage")
        );
        parts.controls.replaceChildren(
          subTabs,
          el("div", { class: "lab-control-block" }, [
            el("span", { class: "lab-control-label", text: "Population block structure" }),
            choiceRow(el, [
              { label: "European ancestry", value: "European ancestry" },
              { label: "African ancestry", value: "African ancestry" },
            ], ancestry, (value) => { ancestry = value; render(); }, "Ancestry-specific haplotype block"),
          ]),
          rangeControl(el, "Tag-to-causal r²", tagR2, {
            min: 0.02, max: 1, step: 0.01, format: (value) => Number(value).toFixed(2),
          }, (value) => { tagR2 = value; render(); }),
          rangeControl(el, "Samples needed if causal site were typed", causalN, {
            min: 1000, max: 50000, step: 1000, format: (value) => compact(value, 0),
          }, (value) => { causalN = value; render(); }),
          rangeControl(el, "Current study size", studyN, {
            min: 1000, max: 100000, step: 1000, format: (value) => compact(value, 0),
          }, (value) => { studyN = value; render(); }),
          el("div", { class: "readout" }, [
            stat((1 / result.r2).toFixed(2) + "×", "sample-size penalty"),
            stat(compact(result.tagN, 0), "samples required at tag"),
            stat(compact(result.effectiveN, 0), "causal-equivalent N in this study"),
            stat(ancestry === "African ancestry" ? "shorter blocks · more tags" : "longer blocks · fewer tags", "array consequence"),
          ])
        );
        parts.rail.replaceChildren(causalRail(el, [
          { key: "you changed", value: "tag r² and ancestry-specific block structure" },
          { key: "mechanism", value: "the tag captures r² of the causal dosage variance" },
          { key: "observable", value: (1 / result.r2).toFixed(2) + "× cohort inflation" },
        ]));
        parts.explanation.className = "callout";
        parts.explanation.innerHTML = "<strong>A shorter LD block can improve inference while increasing assay cost.</strong> African-ancestry genomes require denser tag arrays because more historical recombination separates neighbours, but those same sharper correlations narrow fine-mapping credible sets more efficiently.";
        return;
      }

      parts.visual.replaceChildren(
        el("div", { class: "pop-imputation-board", role: "img", "aria-label": panelMatch
          ? "Target chromosome is copied as a mosaic of close ancestry-matched reference haplotypes; posterior states are concentrated."
          : "Target chromosome has no close reference haplotype; copying switches often, posterior states are diffuse, and absent rare variants cannot be recovered." }, [
          el("div", { class: "pop-imputation-target" }, [
            el("span", { text: "target" }),
            el("i", { class: "is-one" }), el("i", { class: "is-two" }), el("i", { class: "is-one" }),
          ]),
          el("div", { class: "pop-imputation-arrow", text: "copy from reference haplotypes ↓" }),
          ...[0, 1, 2, 3].map((row) => el("div", {
            class: "pop-imputation-reference" + ((panelMatch && row === 1) ? " is-match" : ""),
          }, [
            el("span", { text: "H" + (row + 1) }),
            el("i", { class: row % 2 ? "is-two" : "is-one" }),
            el("i", { class: row === 1 ? "is-two" : "is-one" }),
            el("i", { class: row > 1 ? "is-two" : "is-one" }),
          ])),
        ]),
        processBoard(el, [
          { label: "hidden state", value: "which reference haplotype is being copied" },
          { label: "transition", value: "switch rate follows genetic distance" },
          { label: "emission", value: "observed typed markers" },
          { label: "posterior", value: panelMatch ? "one close mosaic path; untyped common alleles recoverable" : "diffuse path; absent rare alleles unrecoverable", tone: panelMatch ? "active" : "warning" },
        ], "Imputation uses haplotype structure as a codec")
      );
      parts.controls.replaceChildren(
        subTabs,
        el("div", { class: "lab-control-block" }, [
          el("span", { class: "lab-control-label", text: "Reference panel" }),
          choiceRow(el, [
            { label: "Ancestry-matched", value: true },
            { label: "Mismatched", value: false },
          ], panelMatch, (value) => { panelMatch = value; render(); }, "Imputation reference-panel match"),
        ]),
        el("div", { class: "readout" }, [
          stat(panelMatch ? "concentrated" : "diffuse", "copying posterior"),
          stat(panelMatch ? "represented" : "first to fail", "rare population-specific alleles"),
          stat(panelMatch ? "longer matching segments" : "excess switches", "mosaic fit"),
          stat("never creates an allele absent from the panel", "hard boundary"),
        ])
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "you changed", value: panelMatch ? "an ancestry-matched reference panel" : "a mismatched reference panel" },
        { key: "mechanism", value: "copy a target chromosome as a recombining mosaic of panel haplotypes" },
        { key: "observable", value: panelMatch ? "concentrated untyped-allele posterior" : "uncertain calls and missing rare variation" },
      ]));
      parts.explanation.className = "callout " + (panelMatch ? "callout-good" : "callout-bad");
      parts.explanation.innerHTML = panelMatch
        ? "<strong>Imputation works because nearby chromosomes are copies of a small set of ancestral haplotypes.</strong> Typed markers identify the copying path; forward–backward inference fills the untyped alleles carried by that path."
        : "<strong>A panel cannot impute what it never observed.</strong> Population-specific rare alleles fail first. Then poor long-range matches force frequent haplotype switches, flatten the posterior, and inject ancestry-patterned noise into association tests.";
    }

    function render() {
      parts.tabHost.replaceChildren(modeTabs());
      if (mode === "phase") renderPhase();
      else if (mode === "metrics") renderMetrics();
      else if (mode === "decay") renderDecay();
      else renderTags();
    }

    predict(body, {
      widget: "linkage-disequilibrium-lab",
      question: "A marker has D′ = 1 but r² = 0.05 with a causal variant. Is it a powerful tag?",
      hint: "One statistic asks whether a haplotype is missing; the other asks how much dosage variance is predicted.",
      options: [
        { label: "Yes—D′ = 1 means perfect prediction" },
        { label: "No—it retains only 5% of information and costs about 20× the sample", correct: true },
        { label: "Yes, but only if the loci are unlinked" },
        { label: "The two statistics cannot differ that much" },
      ],
    }, () => {
      mode = "metrics";
      ldFixture = "rare";
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
