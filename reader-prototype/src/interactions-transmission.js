/* ── Transmission-genetics interaction wave ───────────────────────────────
   Topic-specific Hero Labs for Chapters 09–13 and 15. Models are pure and
   exported for fixture tests; views reuse the reader's existing lab grammar
   and work without imports or runtime requests.
   ───────────────────────────────────────────────────────────────────────── */

(function (global) {
  "use strict";

  const definitions = {};
  const models = {};
  const kit = global.ReaderInteractionKit;
  if (!kit) throw new Error("ReaderInteractionKit must load before transmission labs");

  const { choiceRow, tabs, causalRail, fieldWithRange } = kit;

  function define(id, build) {
    if (definitions[id]) throw new Error("Duplicate interaction: " + id);
    definitions[id] = build;
  }

  function clamp(value, low, high) {
    return Math.max(low, Math.min(high, value));
  }

  function choose(n, k) {
    if (k < 0 || k > n) return 0;
    let value = 1;
    const short = Math.min(k, n - k);
    for (let i = 1; i <= short; i++) value *= (n - short + i) / i;
    return value;
  }

  function lcg(seed) {
    let state = seed >>> 0;
    return function () {
      state = (Math.imul(1664525, state) + 1013904223) >>> 0;
      return state / 4294967296;
    };
  }

  function binomialDraw(n, p, random) {
    let count = 0;
    for (let i = 0; i < n; i++) if (random() < p) count += 1;
    return count;
  }

  function percent(value, digits) {
    return (value * 100).toFixed(digits == null ? 1 : digits) + "%";
  }

  function rangeControl(el, label, value, options, onInput) {
    // Apply range constraints before the value. Browsers normalise a range
    // value as soon as its attribute is set, so fractional teaching values
    // would otherwise be rounded/clamped against the default 0–100, step-1
    // range before their real min/max/step attributes existed.
    const inputAttrs = Object.assign({ type: "range" }, options, {
      value: String(value),
      "data-focus-key": label,
    });
    delete inputAttrs.format;
    const input = el("input", inputAttrs);
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
      instrument: el("div", { class: "hero-lab transmission-lab", hidden: true }),
      tabHost: el("div"),
      visual: el("div", { class: "lab-visual transmission-visual" }),
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
    const lineStep = Math.max(step || 18, 22);
    return '<text class="' + className + '"' + alignment + ">" +
      lines.map((line, index) => '<tspan x="' + x + '" y="' +
        (y + index * lineStep) + '">' + line + "</tspan>").join("") +
      "</text>";
  }

  function textSvg(html, label, viewBox, extraClass) {
    return '<svg class="lab-diagram transmission-diagram ' + (extraClass || "") +
      '" viewBox="' + (viewBox || "0 0 500 260") + '" role="img" aria-label="' +
      label + '">' + html + "</svg>";
  }

  function probabilityBars(el, rows, label) {
    const maximum = Math.max(0.000001, ...rows.map((row) => row.value));
    const board = el("div", {
      class: "transmission-bars",
      role: "img",
      "aria-label": label + ". " + rows.map((row) =>
        row.label + " " + percent(row.value, 1)
      ).join(", "),
    });
    rows.forEach((row) => {
      board.append(el("div", { class: "transmission-bar-row" }, [
        el("span", { class: "transmission-bar-name", text: row.label }),
        el("span", { class: "transmission-bar-track", "aria-hidden": "true" }, [
          el("span", {
            class: "transmission-bar-fill" + (row.muted ? " is-muted" : ""),
            style: "width:" + (100 * row.value / maximum).toFixed(2) + "%",
          }),
        ]),
        el("strong", { text: percent(row.value, 1) }),
      ]));
    });
    return board;
  }

  /* Ch 09 — chromosome bookkeeping, one meiosis, and nondisjunction ------- */

  const CELL_STAGES = {
    g1: { label: "G1", chromosomes: 46, chromatids: 46, ploidy: "2n", dna: "2c", split: "none" },
    g2: { label: "G2 / metaphase", chromosomes: 46, chromatids: 92, ploidy: "2n", dna: "4c", split: "replicated" },
    mitoticAnaphase: { label: "mitotic anaphase", chromosomes: 92, chromatids: 92, ploidy: "4n", dna: "4c", split: "sisters" },
    mitoticDaughter: { label: "mitotic daughter", chromosomes: 46, chromatids: 46, ploidy: "2n", dna: "2c", split: "complete" },
    meiosisI: { label: "meiotic metaphase I", chromosomes: 46, chromatids: 92, ploidy: "2n", dna: "4c", split: "homologs poised" },
    afterMI: { label: "after meiosis I", chromosomes: 23, chromatids: 46, ploidy: "n", dna: "2c", split: "homologs" },
    gamete: { label: "gamete", chromosomes: 23, chromatids: 23, ploidy: "n", dna: "1c", split: "sisters" },
  };

  function chromosomeTimeModel(input) {
    if (input.kind === "stage") return Object.assign({}, CELL_STAGES[input.stage]);
    if (input.kind === "crossover") {
      return {
        products: input.crossover
          ? ["AB", "Ab", "aB", "ab"]
          : ["AB", "AB", "ab", "ab"],
        recombinantCount: input.crossover ? 2 : 0,
        alleleA: 2,
        allelea: 2,
      };
    }
    if (input.kind === "nondisjunction") {
      return input.division === "MI"
        ? {
            products: ["a + b", "a + b", "none", "none"],
            doses: [2, 2, 0, 0],
            signature: "heterodisomy",
            marker: "two different homolog alleles",
          }
        : {
            products: ["a + a", "none", "b", "b"],
            doses: [2, 0, 1, 1],
            signature: "isodisomy",
            marker: "two copies of one homolog allele",
          };
    }
    throw new Error("Unknown chromosome-time model");
  }
  models.chromosomeTime = chromosomeTimeModel;

  /* Ch 10 — crosses, product rules, and test-cross confidence ------------- */

  const GAMETES = { AA: ["A"], Aa: ["A", "a"], aa: ["a"] };

  function mendelianCross(parent1, parent2) {
    const outcomes = [];
    GAMETES[parent1].forEach((left) => GAMETES[parent2].forEach((right) => {
      outcomes.push([left, right].sort((a, b) => a === b ? 0 : a === "A" ? -1 : 1).join(""));
    }));
    const counts = { AA: 0, Aa: 0, aa: 0 };
    outcomes.forEach((genotype) => { counts[genotype] += 1; });
    return Object.fromEntries(Object.entries(counts).map(([key, count]) =>
      [key, count / outcomes.length]
    ));
  }

  function inheritanceModel(input) {
    if (input.kind === "cross") {
      const probabilities = mendelianCross(input.parent1, input.parent2);
      return {
        probabilities,
        dominantPhenotype: probabilities.AA + probabilities.Aa,
        recessivePhenotype: probabilities.aa,
      };
    }
    if (input.kind === "multiLocus") {
      const perLocus = input.target === "allRecessive" ? 0.25 : 0.75;
      return {
        perLocus,
        probability: perLocus ** input.loci,
        gridCellsAvoided: 4 ** input.loci,
      };
    }
    if (input.kind === "family") {
      const exactly = choose(input.children, input.affected) * input.p ** input.affected *
        (1 - input.p) ** (input.children - input.affected);
      return { exactly, atLeastOne: 1 - (1 - input.p) ** input.children };
    }
    if (input.kind === "testcross") {
      const confidence = 1 - 0.5 ** input.offspring;
      return { confidence, missedHeterozygote: 1 - confidence };
    }
    throw new Error("Unknown inheritance model");
  }
  models.inheritance = inheritanceModel;

  /* Ch 11 — phenotype assays, pathway ratios, and complementation -------- */

  const DIHYBRID_CLASSES = [
    { key: "A_B_", weight: 9 },
    { key: "A_bb", weight: 3 },
    { key: "aaB_", weight: 3 },
    { key: "aabb", weight: 1 },
  ];

  function pathwayGroup(topology, key) {
    if (topology === "recessiveEpistasis") {
      if (key === "A_B_") return "final product";
      if (key === "A_bb") return "intermediate";
      return "no product";
    }
    if (topology === "dominantEpistasis") {
      if (key.startsWith("A_")) return "blocked early";
      return key === "aaB_" ? "converted" : "precursor";
    }
    if (topology === "complementary") return key === "A_B_" ? "product" : "no product";
    return key === "aabb" ? "no product" : "product";
  }

  function pathwayGeneticsModel(input) {
    if (input.kind === "assay") {
      const amount = { AA: 100, Aa: 50, aa: 0 };
      return ["AA", "Aa", "aa"].map((genotype) => ({
        genotype,
        amount: amount[genotype],
        reading: input.assay === "threshold"
          ? (amount[genotype] >= 40 ? "dark" : "light")
          : input.assay === "amount"
          ? amount[genotype] + " units"
          : genotype === "AA" ? "A band" : genotype === "Aa" ? "A + a bands" : "a band",
      }));
    }
    if (input.kind === "epistasis") {
      const groups = {};
      DIHYBRID_CLASSES.forEach((entry) => {
        const group = pathwayGroup(input.topology, entry.key);
        groups[group] = (groups[group] || 0) + entry.weight;
      });
      return { groups, ratio: Object.values(groups).join(":") };
    }
    if (input.kind === "complementation") {
      return input.sameGene
        ? { rescued: false, f1: "mutant", inference: "mutations may be alleles of one gene" }
        : { rescued: true, f1: "wild type", inference: "each strain supplies the other's missing function" };
    }
    throw new Error("Unknown pathway-genetics model");
  }
  models.pathwayGenetics = pathwayGeneticsModel;

  /* Ch 12 — goodness of fit, power, and ascertainment -------------------- */

  const CHI_CRITICAL_05 = { 1: 3.841, 2: 5.991, 3: 7.815, 4: 9.488, 5: 11.07 };

  function chiSquare(observed, proportions, estimatedParameters) {
    const total = observed.reduce((sum, value) => sum + value, 0);
    const expected = proportions.map((value) => value * total);
    const statistic = observed.reduce((sum, value, index) =>
      sum + (value - expected[index]) ** 2 / expected[index], 0
    );
    const df = observed.length - 1 - (estimatedParameters || 0);
    return {
      total, expected, statistic, df,
      critical: CHI_CRITICAL_05[df],
      reject: statistic > CHI_CRITICAL_05[df],
    };
  }

  function geneticInferenceModel(input) {
    if (input.kind === "chiSquare") {
      const observed = input.hypothesis === "dihybrid"
        ? [90 + input.distortion, 30 - input.distortion, 30, 10]
        : [120 - input.distortion, 40 + input.distortion];
      return Object.assign({ observed }, chiSquare(
        observed,
        input.hypothesis === "dihybrid" ? [9 / 16, 3 / 16, 3 / 16, 1 / 16] : [0.75, 0.25],
        input.estimatedParameters || 0
      ));
    }
    if (input.kind === "power") {
      const random = lcg(input.seed);
      let rejected = 0;
      for (let run = 0; run < input.replicates; run++) {
        const dominant = binomialDraw(input.n, input.actualDominant, random);
        const test = chiSquare([dominant, input.n - dominant], [0.75, 0.25], 0);
        if (test.reject) rejected += 1;
      }
      return { rejected, power: rejected / input.replicates };
    }
    if (input.kind === "ascertainment") {
      const selected = 1 - (1 - input.p) ** input.children;
      const conditionalMean = input.children * input.p / selected;
      const distribution = [];
      for (let k = 1; k <= input.children; k++) {
        distribution.push({
          affected: k,
          probability: choose(input.children, k) * input.p ** k *
            (1 - input.p) ** (input.children - k) / selected,
        });
      }
      return {
        selected,
        conditionalMean,
        naiveAffectedFraction: conditionalMean / input.children,
        distribution,
      };
    }
    throw new Error("Unknown genetic-inference model");
  }
  models.geneticInference = geneticInferenceModel;

  /* Ch 13 — sex switches, X-linked crosses, and dosage compensation ------ */

  function sexSystemModel(input) {
    if (input.kind === "system") {
      if (input.organism === "mammal") {
        const hasSry = input.constitution === "XY" || input.constitution === "XX+SRY";
        return {
          sex: hasSry ? "testis pathway" : "ovary pathway",
          driver: hasSry ? "functional SRY pulse" : "no functional SRY",
          yRole: "SRY carries the switch; other Y genes support spermatogenesis",
        };
      }
      if (input.organism === "fly") {
        const ratio = input.constitution === "XX" || input.constitution === "XXY" ? 1 : 0.5;
        const hasY = input.constitution.includes("Y");
        return {
          sex: ratio >= 1 ? "female" : hasY ? "fertile male" : "sterile male",
          driver: "X-to-autosome ratio " + ratio.toFixed(1),
          yRole: "the Y supports male fertility but does not choose sex",
        };
      }
      return input.constitution === "XX"
        ? { sex: "hermaphrodite", driver: "X-to-autosome ratio 1.0", yRole: "no Y chromosome" }
        : { sex: "male", driver: "X-to-autosome ratio 0.5", yRole: "no Y chromosome" };
    }
    if (input.kind === "xCross") {
      const mother = input.mother === "noncarrier" ? ["A"] :
        input.mother === "carrier" ? ["A", "a"] : ["a"];
      const father = input.father === "healthy" ? ["A", "Y"] : ["a", "Y"];
      const daughters = [];
      const sons = [];
      mother.forEach((maternal) => father.forEach((paternal) => {
        if (paternal === "Y") sons.push({ affected: maternal === "a" });
        else daughters.push({
          affected: maternal === "a" && paternal === "a",
          carrier: (maternal === "a") !== (paternal === "a"),
        });
      }));
      const mean = (items, key) => items.filter((item) => item[key]).length / items.length;
      return {
        affectedSons: mean(sons, "affected"),
        affectedDaughters: mean(daughters, "affected"),
        carrierDaughters: mean(daughters, "carrier"),
      };
    }
    if (input.kind === "dosage") {
      const states = {
        mammal: { lineage: "mammal", highCopy: "XX", lowCopy: "XY", mechanism: "silence one X in XX cells", highOutput: 1, lowOutput: 1 },
        fly: { lineage: "fruit fly", highCopy: "XX", lowCopy: "XY", mechanism: "double the male X", highOutput: 2, lowOutput: 2 },
        worm: { lineage: "nematode", highCopy: "XX", lowCopy: "XO", mechanism: "halve both X chromosomes in XX", highOutput: 1, lowOutput: 1 },
      };
      return states[input.organism];
    }
    throw new Error("Unknown sex-system model");
  }
  models.sexSystem = sexSystemModel;

  /* Ch 15 — inheritance-mode evidence, carrier Bayes, and inbreeding ------ */

  const MODE_FIXTURES = {
    fatherDaughters: {
      label: "affected father · 2 affected daughters · 2 unaffected sons",
      likelihoods: { AD: 1 / 16, AR: 0, XLR: 0, XLD: 1, MT: 0 },
    },
    motherAll: {
      label: "affected mother · all 4 children affected",
      likelihoods: { AD: 1 / 16, AR: 0, XLR: 0, XLD: 1 / 16, MT: 1 },
    },
    smallFamily: {
      label: "unaffected parents · affected son · unaffected daughter",
      likelihoods: { AD: 0, AR: 3 / 16, XLR: 1 / 2, XLD: 0, MT: 0 },
    },
  };

  const INBREEDING_F = {
    unrelated: 0,
    secondCousins: 1 / 64,
    firstCousins: 1 / 16,
    halfSibs: 1 / 8,
    fullSibs: 1 / 4,
  };

  function pedigreeModel(input) {
    if (input.kind === "mode") {
      const fixture = MODE_FIXTURES[input.fixture];
      const total = Object.values(fixture.likelihoods).reduce((sum, value) => sum + value, 0);
      return {
        label: fixture.label,
        likelihoods: fixture.likelihoods,
        posterior: Object.fromEntries(Object.entries(fixture.likelihoods).map(([mode, value]) =>
          [mode, value / total]
        )),
      };
    }
    if (input.kind === "carrier") {
      const carrierJoint = input.prior * 0.5 ** input.unaffectedSons * (1 - input.sensitivity);
      const nonCarrierJoint = 1 - input.prior;
      const posterior = carrierJoint / (carrierJoint + nonCarrierJoint);
      return {
        carrierJoint,
        nonCarrierJoint,
        posterior,
        nextSonAffected: posterior / 2,
      };
    }
    if (input.kind === "inbreeding") {
      const f = INBREEDING_F[input.relationship];
      const outbred = input.q ** 2;
      const risk = f * input.q + (1 - f) * outbred;
      return { f, outbred, risk, fold: outbred === 0 ? 1 : risk / outbred };
    }
    throw new Error("Unknown pedigree model");
  }
  models.pedigree = pedigreeModel;

  /* Ch 09 view ------------------------------------------------------------ */

  function cellStageSvg(result) {
    const replicated = result.chromatids > result.chromosomes;
    const separated = result.label === "mitotic anaphase";
    const chromosome = (x, y, colour, index) => replicated && !separated
      ? '<g class="lineage-chromosome ' + colour + '"><path d="M' + (x - 13) + " " +
        (y - 34) + " L" + (x + 13) + " " + (y + 34) + '"/><path d="M' + (x + 13) +
        " " + (y - 34) + " L" + (x - 13) + " " + (y + 34) +
        '"/><circle cx="' + x + '" cy="' + y + '" r="5"/></g>'
      : '<g class="lineage-chromosome ' + colour + '"><path d="M' + x + " " +
        (y - 34) + " L" + x + " " + (y + 34) + '"/><circle cx="' + x +
        '" cy="' + y + '" r="5"/></g>';
    const figures = separated
      ? chromosome(155, 128, "maternal", 0) + chromosome(205, 128, "maternal", 1) +
        chromosome(295, 128, "paternal", 2) + chromosome(345, 128, "paternal", 3)
      : chromosome(205, 128, "maternal", 0) + chromosome(295, 128, "paternal", 1);
    return textSvg(
      svgLines("lab-svg-kicker", 18, 22, [result.label, "count centromeres, not arms"], 19) +
      '<circle class="cell-outline" cx="250" cy="130" r="104"/>' + figures +
      '<text class="lab-svg-label" x="250" y="246" text-anchor="middle">' +
        "schematic pair · whole-cell ledger " + result.ploidy + " " + result.dna + "</text>",
      result.label + ": " + result.chromosomes + " chromosomes, " + result.chromatids +
        " chromatids, " + result.ploidy + " and " + result.dna + ".",
      "0 0 500 270",
      "cell-state-diagram"
    );
  }

  function meiosisProductsSvg(result, crossover) {
    const rows = result.products.map((product, index) => {
      const recombinant = product === "Ab" || product === "aB";
      return '<g class="gamete-product' + (recombinant ? " is-recombinant" : "") + '">' +
        '<circle cx="' + (75 + index * 116) + '" cy="150" r="42"/>' +
        '<text x="' + (75 + index * 116) + '" y="157" text-anchor="middle">' +
          product + "</text></g>";
    }).join("");
    return textSvg(
      svgLines("lab-svg-kicker", 18, 22,
        [crossover ? "one crossover · two chromatids exchange" : "no crossover · sisters remain identical",
          "A : a remains exactly 2 : 2"], 19) +
      '<path class="lineage-spine" d="M250 62 V96 M75 96 H423"/>' + rows +
      '<text class="lab-svg-label" x="250" y="226" text-anchor="middle">' +
        result.recombinantCount + " recombinant products · 4 products total</text>",
      "Four products of one meiosis: " + result.products.join(", ") + ". " +
        result.recombinantCount + " are recombinant, and allele segregation is exactly two A to two a.",
      "0 0 500 248",
      "meiosis-products-diagram"
    );
  }

  function nondisjunctionSvg(result, division) {
    const products = result.products.map((product, index) => {
      const dose = result.doses[index];
      return '<g class="gamete-product dose-' + dose + '">' +
        '<circle cx="' + (75 + index * 116) + '" cy="146" r="42"/>' +
        '<text x="' + (75 + index * 116) + '" y="142" text-anchor="middle">' + product + "</text>" +
        '<text class="lab-svg-label" x="' + (75 + index * 116) +
        '" y="166" text-anchor="middle">' + (dose === 2 ? "n + 1" : dose === 0 ? "n − 1" : "n") +
        "</text></g>";
    }).join("");
    return textSvg(
      svgLines("lab-svg-kicker", 18, 22,
        [division === "MI" ? "meiosis I error · homologs together" :
          "meiosis II error · sisters together",
          result.signature + " at a pericentromeric marker"], 19) +
      '<path class="lineage-spine is-error" d="M250 62 V92 M75 92 H423"/>' + products +
      '<text class="lab-svg-label" x="250" y="226" text-anchor="middle">' +
        result.marker + "</text>",
      (division === "MI" ? "Meiosis one" : "Meiosis two") +
        " nondisjunction products: " + result.products.join(", ") + ". The signature is " +
        result.signature + ", " + result.marker + ".",
      "0 0 500 248",
      "nondisjunction-diagram"
    );
  }

  define("chromosome-time-lab", function (api) {
    const { body, el, stat, predict } = api;
    const parts = labParts(el);
    const stageKeys = ["g1", "g2", "mitoticAnaphase", "mitoticDaughter", "meiosisI", "afterMI", "gamete"];
    let mode = "stage";
    let stageIndex = 4;
    let crossover = true;
    let division = "MI";

    function render() {
      parts.tabHost.replaceChildren(tabs(el, [
        { label: "Cell-state ledger", value: "stage" },
        { label: "One meiosis", value: "meiosis" },
        { label: "Error diagnosis", value: "error" },
      ], mode, (next) => { mode = next; render(); }));

      if (mode === "stage") {
        const result = chromosomeTimeModel({ kind: "stage", stage: stageKeys[stageIndex] });
        parts.visual.innerHTML = cellStageSvg(result);
        parts.controls.replaceChildren(
          rangeControl(el, "Division stage", stageIndex, {
            min: 0, max: stageKeys.length - 1, step: 1,
            format: (value) => CELL_STAGES[stageKeys[value]].label,
          }, (value) => { stageIndex = value; render(); }),
          el("div", { class: "readout" }, [
            stat(String(result.chromosomes), "chromosomes / cell"),
            stat(String(result.chromatids), "chromatids / cell"),
            stat(result.ploidy + ", " + result.dna, "sets and DNA content"),
          ])
        );
        parts.rail.replaceChildren(causalRail(el, [
          { key: "you changed", value: "cell to " + result.label },
          { key: "mechanism", value: result.split === "sisters" ? "centromeres split" :
            result.split === "homologs" ? "homologs separated; sisters remain" :
            result.split === "replicated" ? "DNA copied; centromeres did not split" : "state boundary crossed" },
          { key: "observable", value: result.chromosomes + " chromosomes · " + result.dna },
        ]));
        parts.explanation.className = "callout";
        parts.explanation.innerHTML = "<strong>Chromosome number follows centromeres, not DNA molecules.</strong> " +
          "Replication doubles chromatids and DNA content without changing chromosome number. " +
          "Only a centromere split changes the count inside the still-undivided cell.";
        return;
      }

      if (mode === "meiosis") {
        const result = chromosomeTimeModel({ kind: "crossover", crossover });
        parts.visual.innerHTML = meiosisProductsSvg(result, crossover);
        parts.controls.replaceChildren(
          el("div", { class: "lab-control-block" }, [
            el("span", { class: "lab-control-label", text: "Exchange between A and B" }),
            choiceRow(el, [
              { label: "No crossover", value: false },
              { label: "One crossover", value: true },
            ], crossover, (value) => { crossover = value; render(); }, "Crossover state"),
          ]),
          el("div", { class: "readout" }, [
            stat(result.recombinantCount + " / 4", "recombinant products"),
            stat(result.alleleA + " : " + result.allelea, "A : a products"),
          ])
        );
        parts.rail.replaceChildren(causalRail(el, [
          { key: "you changed", value: crossover ? "one non-sister exchange" : "removed the exchange" },
          { key: "mechanism", value: crossover ? "two of four chromatids swap distal DNA" : "homologs segregate intact" },
          { key: "observable", value: result.recombinantCount + " recombinant; segregation stays 2:2" },
        ]));
        parts.explanation.className = "callout";
        parts.explanation.innerHTML = "<strong>A single meiosis is not a four-way coin toss.</strong> " +
          "A heterozygote produces exactly two A and two a products. Sampling which gametes fertilise " +
          "creates Mendel's noise; crossing over changes haplotypes, not the 2:2 allele invariant.";
        return;
      }

      const result = chromosomeTimeModel({ kind: "nondisjunction", division });
      parts.visual.innerHTML = nondisjunctionSvg(result, division);
      parts.controls.replaceChildren(
        el("div", { class: "lab-control-block" }, [
          el("span", { class: "lab-control-label", text: "Failed separation" }),
          choiceRow(el, [
            { label: "Meiosis I homologs", value: "MI" },
            { label: "Meiosis II sisters", value: "MII" },
          ], division, (value) => { division = value; render(); }, "Nondisjunction division"),
        ]),
        el("div", { class: "readout" }, [
          stat(result.signature, "proximal-marker signature"),
          stat(result.doses.join(" · "), "chromosome doses in four gametes"),
        ])
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "you changed", value: division === "MI" ? "homolog separation failed" : "sister separation failed" },
        { key: "mechanism", value: division === "MI" ? "both homologs enter one daughter" : "one homolog's sisters co-segregate" },
        { key: "observable", value: result.signature + " near the centromere" },
      ]));
      parts.explanation.className = "callout " + (division === "MI" ? "callout-bad" : "");
      parts.explanation.innerHTML = "<strong>Use a pericentromeric marker.</strong> " + result.marker +
        " distinguishes the visible division of origin. Distal markers can be reshuffled by a crossover, " +
        "so they cannot make this diagnosis alone.";
    }

    predict(body, {
      widget: "chromosome-time-lab",
      question: "At human anaphase I, before the cell divides, how many chromosomes and chromatids are present?",
      hint: "Ask whether the centromeres have split yet.",
      options: [
        { label: "23 chromosomes and 46 chromatids" },
        { label: "46 chromosomes and 92 chromatids", correct: true },
        { label: "92 chromosomes and 92 chromatids" },
        { label: "46 chromosomes and 46 chromatids" },
      ],
    }, () => {
      parts.instrument.hidden = false;
      render();
    });
    finishLab(parts, body);
  });

  /* Ch 10 view ------------------------------------------------------------ */

  function crossBoard(el, result, parent1, parent2) {
    const board = el("div", { class: "cross-ledger" });
    board.append(el("div", { class: "cross-parent-line" }, [
      el("span", { text: parent1 }),
      el("span", { text: "×", "aria-hidden": "true" }),
      el("span", { text: parent2 }),
      el("small", { text: "each allele is a gamete draw" }),
    ]));
    board.append(probabilityBars(el, [
      { label: "AA", value: result.probabilities.AA },
      { label: "Aa", value: result.probabilities.Aa },
      { label: "aa", value: result.probabilities.aa },
    ], parent1 + " by " + parent2 + " genotype distribution"));
    board.append(el("div", { class: "phenotype-collapse" }, [
      el("span", { text: "AA + Aa → dominant phenotype " + percent(result.dominantPhenotype, 0) }),
      el("span", { text: "aa → recessive phenotype " + percent(result.recessivePhenotype, 0) }),
    ]));
    return board;
  }

  function productRuleSvg(result, loci, target) {
    const width = 430 / loci;
    let boxes = "";
    for (let index = 0; index < loci; index++) {
      const x = 35 + index * width;
      boxes += '<g class="probability-factor"><rect x="' + x.toFixed(1) +
        '" y="92" width="' + Math.max(44, width - 12).toFixed(1) +
        '" height="62" rx="7"/><text x="' + (x + Math.max(44, width - 12) / 2).toFixed(1) +
        '" y="130" text-anchor="middle">' + (target === "allRecessive" ? "¼" : "¾") +
        "</text></g>";
      if (index < loci - 1) boxes += '<text class="product-sign" x="' +
        (x + width - 7).toFixed(1) + '" y="130">×</text>';
    }
    return textSvg(
      svgLines("lab-svg-kicker", 18, 22,
        [loci + " independent " + (loci === 1 ? "locus" : "loci"),
          target === "allRecessive" ? "all recessive → multiply ¼ each" :
            "all dominant → multiply ¾ each"], 19) + boxes +
      '<path class="lineage-spine" d="M250 164 V188"/>' +
      '<text class="product-answer" x="250" y="218" text-anchor="middle">' +
        percent(result.probability, 3) + "</text>" +
      '<text class="lab-svg-label" x="250" y="246" text-anchor="middle">instead of a ' +
        result.gridCellsAvoided.toLocaleString("en-GB") + "-cell Punnett grid</text>",
      loci + " independent per-locus probabilities multiply to " +
        percent(result.probability, 3) + ". This replaces a " + result.gridCellsAvoided +
        " cell Punnett grid.",
      "0 0 500 265",
      "product-rule-diagram"
    );
  }

  function familyDistributionSvg(children, selected, p) {
    const probabilities = [];
    let maximum = 0;
    for (let k = 0; k <= children; k++) {
      const value = choose(children, k) * p ** k * (1 - p) ** (children - k);
      probabilities.push(value);
      maximum = Math.max(maximum, value);
    }
    const gap = 390 / (children + 1);
    const barWidth = Math.max(8, gap - 5);
    const bars = probabilities.map((value, k) => {
      const height = 120 * value / maximum;
      const x = 65 + k * gap;
      return '<g class="family-bar' + (k === selected ? " is-selected" : "") + '">' +
        '<rect x="' + x.toFixed(1) + '" y="' + (185 - height).toFixed(1) +
        '" width="' + barWidth.toFixed(1) + '" height="' + height.toFixed(1) + '"/>' +
        '<text class="lab-svg-label" x="' + (x + barWidth / 2).toFixed(1) +
        '" y="210" text-anchor="middle">' + k + "</text></g>";
    }).join("");
    return textSvg(
      svgLines("lab-svg-kicker", 18, 22,
        [children + " children · p(affected) = " + percent(p, 0),
          "a distribution · never a quota"], 19) +
      '<path class="lab-axis" d="M52 185 H468"/>' + bars +
      '<text class="lab-svg-label" x="250" y="242" text-anchor="middle">number affected in this family</text>',
      "Binomial distribution for " + children + " children with affected probability " +
        percent(p, 0) + ". The selected outcome is " + selected + " affected with probability " +
        percent(probabilities[selected], 1) + ".",
      "0 0 500 260",
      "family-distribution-diagram"
    );
  }

  function testcrossCurveSvg(offspring, result) {
    let path = "";
    for (let n = 1; n <= 12; n++) {
      const x = 54 + ((n - 1) / 11) * 396;
      const y = 205 - (1 - 0.5 ** n) * 135;
      path += (n === 1 ? "M" : " L") + x.toFixed(1) + " " + y.toFixed(1);
    }
    const px = 54 + ((offspring - 1) / 11) * 396;
    const py = 205 - result.confidence * 135;
    const answerY = py < 90 ? py + 28 : py - 16;
    return textSvg(
      svgLines("lab-svg-kicker", 18, 22,
        ["Aa × aa · p(reveal aa) = ½ each",
          "confidence = at least one aa"], 19) +
      '<path class="lab-axis" d="M54 64 V205 H456"/>' +
      '<path class="confidence-curve" d="' + path + '"/>' +
      '<circle class="confidence-point" cx="' + px.toFixed(1) + '" cy="' + py.toFixed(1) + '" r="7"/>' +
      '<text class="product-answer" x="' + clamp(px, 118, 380).toFixed(1) + '" y="' +
        answerY.toFixed(1) + '" text-anchor="middle">' + percent(result.confidence, 1) + "</text>" +
      '<text class="lab-svg-label" x="54" y="232">1</text>' +
      '<text class="lab-svg-label" x="456" y="232" text-anchor="end">12 offspring</text>',
      "A heterozygous dominant parent testcrossed to aa has " + percent(result.confidence, 1) +
        " probability of revealing at least one recessive among " + offspring + " offspring.",
      "0 0 500 250",
      "testcross-diagram"
    );
  }

  define("inheritance-probability-lab", function (api) {
    const { body, el, stat, predict } = api;
    const parts = labParts(el);
    let mode = "cross";
    let parent1 = "Aa";
    let parent2 = "Aa";
    let loci = 3;
    let target = "allRecessive";
    let familyMode = "binomial";
    let children = 4;
    let affected = 1;
    let testcrossN = 5;

    function render() {
      parts.tabHost.replaceChildren(tabs(el, [
        { label: "Cross builder", value: "cross" },
        { label: "Scale without a grid", value: "product" },
        { label: "Family evidence", value: "family" },
      ], mode, (next) => { mode = next; render(); }));

      if (mode === "cross") {
        const result = inheritanceModel({ kind: "cross", parent1, parent2 });
        parts.visual.replaceChildren(crossBoard(el, result, parent1, parent2));
        parts.controls.replaceChildren(
          el("div", { class: "paired-controls" }, [
            el("div", { class: "lab-control-block" }, [
              el("span", { class: "lab-control-label", text: "Parent 1" }),
              choiceRow(el, ["AA", "Aa", "aa"].map((value) => ({ label: value, value })),
                parent1, (value) => { parent1 = value; render(); }, "Parent one genotype"),
            ]),
            el("div", { class: "lab-control-block" }, [
              el("span", { class: "lab-control-label", text: "Parent 2" }),
              choiceRow(el, ["AA", "Aa", "aa"].map((value) => ({ label: value, value })),
                parent2, (value) => { parent2 = value; render(); }, "Parent two genotype"),
            ]),
          ]),
          el("div", { class: "readout" }, [
            stat(percent(result.dominantPhenotype, 1), "dominant phenotype"),
            stat(percent(result.recessivePhenotype, 1), "recessive phenotype"),
          ])
        );
        parts.rail.replaceChildren(causalRail(el, [
          { key: "you changed", value: parent1 + " × " + parent2 },
          { key: "mechanism", value: "one allele drawn from each parent" },
          { key: "observable", value: percent(result.recessivePhenotype, 1) + " aa" },
        ]));
        parts.explanation.className = "callout";
        parts.explanation.innerHTML = "<strong>The grid is only an enumeration device.</strong> " +
          "The model is two independent gamete draws followed by a genotype-to-phenotype map. " +
          "Change the map and dominance changes; the transmission probabilities do not.";
        return;
      }

      if (mode === "product") {
        const result = inheritanceModel({ kind: "multiLocus", loci, target });
        parts.visual.innerHTML = productRuleSvg(result, loci, target);
        parts.controls.replaceChildren(
          rangeControl(el, "Independent heterozygous loci", loci, {
            min: 1, max: 6, step: 1, format: (value) => value + " loci",
          }, (value) => { loci = value; render(); }),
          el("div", { class: "lab-control-block" }, [
            el("span", { class: "lab-control-label", text: "Target phenotype" }),
            choiceRow(el, [
              { label: "Recessive at every locus", value: "allRecessive" },
              { label: "Dominant at every locus", value: "allDominant" },
            ], target, (value) => { target = value; render(); }, "Multilocus target"),
          ]),
          el("div", { class: "readout" }, [
            stat(percent(result.probability, 3), "target probability"),
            stat(result.gridCellsAvoided.toLocaleString("en-GB"), "Punnett cells avoided"),
          ])
        );
        parts.rail.replaceChildren(causalRail(el, [
          { key: "you changed", value: loci + " independent loci" },
          { key: "mechanism", value: "multiply one per-locus probability " + loci + " times" },
          { key: "observable", value: percent(result.probability, 3) + " match the target" },
        ]));
        parts.explanation.className = "callout callout-good";
        parts.explanation.innerHTML = "<strong>Abandon the Punnett square when the structure factorises.</strong> " +
          "Independence turns an exponential drawing task into one short product. Linked loci do not " +
          "factorise this way—that failure is exactly what Chapter 14 measures.";
        return;
      }

      const result = familyMode === "binomial"
        ? inheritanceModel({ kind: "family", children, affected, p: 0.25 })
        : inheritanceModel({ kind: "testcross", offspring: testcrossN });
      parts.visual.innerHTML = familyMode === "binomial"
        ? familyDistributionSvg(children, affected, 0.25)
        : testcrossCurveSvg(testcrossN, result);
      const modeControl = el("div", { class: "lab-control-block" }, [
        el("span", { class: "lab-control-label", text: "Evidence question" }),
        choiceRow(el, [
          { label: "Family composition", value: "binomial" },
          { label: "Testcross confidence", value: "testcross" },
        ], familyMode, (value) => { familyMode = value; render(); }, "Family evidence question"),
      ]);
      if (familyMode === "binomial") {
        parts.controls.replaceChildren(
          modeControl,
          rangeControl(el, "Children", children, {
            min: 1, max: 10, step: 1, format: (value) => String(value),
          }, (value) => { children = value; affected = Math.min(affected, children); render(); }),
          rangeControl(el, "Affected children", affected, {
            min: 0, max: children, step: 1, format: (value) => String(value),
          }, (value) => { affected = value; render(); }),
          el("div", { class: "readout" }, [
            stat(percent(result.exactly, 1), "exactly this composition"),
            stat(percent(result.atLeastOne, 1), "at least one affected"),
          ])
        );
      } else {
        parts.controls.replaceChildren(
          modeControl,
          rangeControl(el, "Testcross offspring", testcrossN, {
            min: 1, max: 12, step: 1, format: (value) => String(value),
          }, (value) => { testcrossN = value; render(); }),
          el("div", { class: "readout" }, [
            stat(percent(result.confidence, 1), "chance Aa is exposed"),
            stat(percent(result.missedHeterozygote, 1), "all-dominant miss chance"),
          ])
        );
      }
      parts.rail.replaceChildren(causalRail(el, [
        { key: "you changed", value: familyMode === "binomial" ? children + " independent births" : testcrossN + " testcross offspring" },
        { key: "mechanism", value: familyMode === "binomial" ? "repeat a Bernoulli draw with replacement" : "each Aa × aa offspring has ½ chance to reveal aa" },
        { key: "observable", value: familyMode === "binomial" ? percent(result.exactly, 1) + " for this family" : percent(result.confidence, 1) + " detection" },
      ]));
      parts.explanation.className = "callout";
      parts.explanation.innerHTML = familyMode === "binomial"
        ? "<strong>A recurrence risk is not a quota.</strong> Every birth redraws from the same distribution. Four children can all be affected or all unaffected without the model remembering earlier outcomes."
        : "<strong>An all-dominant testcross is evidence, not proof.</strong> A heterozygote can evade detection by chance; the miss probability halves with every additional offspring.";
    }

    predict(body, {
      widget: "inheritance-probability-lab",
      question: "For four independent children from an Aa × Aa mating, what is the probability exactly one is aa?",
      hint: "There are four positions for that one child; the other three must be unaffected.",
      options: [
        { label: "25%" },
        { label: "About 42.2%", correct: true },
        { label: "75%" },
        { label: "Exactly one child is guaranteed" },
      ],
    }, () => {
      parts.instrument.hidden = false;
      render();
    });
    finishLab(parts, body);
  });

  /* Ch 11 view ------------------------------------------------------------ */

  function assayBoard(el, rows, assay) {
    const board = el("div", {
      class: "assay-board",
      role: "img",
      "aria-label": "The same AA, Aa, and aa genotypes read through the " + assay +
        " assay as " + rows.map((row) => row.genotype + " " + row.reading).join(", "),
    });
    rows.forEach((row) => {
      board.append(el("div", { class: "assay-lane genotype-" + row.genotype }, [
        el("strong", { text: row.genotype }),
        el("span", { class: "assay-meter", "aria-hidden": "true" }, [
          el("span", { style: "width:" + row.amount + "%" }),
        ]),
        el("span", { text: row.reading }),
      ]));
    });
    return board;
  }

  function pathwaySvg(topology) {
    const labels = {
      recessiveEpistasis: ["A enables entry", "B converts intermediate", "9 : 3 : 4"],
      dominantEpistasis: ["dominant A blocks entry", "B acts only when aa", "12 : 3 : 1"],
      complementary: ["A and B are both required", "either missing stops output", "9 : 7"],
      duplicate: ["A or B is sufficient", "only aabb loses output", "15 : 1"],
    }[topology];
    const activeA = topology !== "dominantEpistasis";
    const branch = topology === "duplicate";
    return textSvg(
      svgLines("lab-svg-kicker", 18, 22, [labels[0], labels[1]], 19) +
      '<g class="pathway-node"><rect x="40" y="105" width="92" height="48" rx="7"/>' +
        '<text x="86" y="135" text-anchor="middle">precursor</text></g>' +
      '<path class="pathway-arrow' + (activeA ? "" : " is-blocked") + '" d="M132 129 H206"/>' +
      '<g class="pathway-enzyme"><circle cx="169" cy="91" r="22"/><text x="169" y="97" text-anchor="middle">A</text></g>' +
      '<g class="pathway-node"><rect x="206" y="105" width="92" height="48" rx="7"/>' +
        '<text x="252" y="135" text-anchor="middle">intermediate</text></g>' +
      '<path class="pathway-arrow" d="M298 129 H372"/>' +
      '<g class="pathway-enzyme"><circle cx="335" cy="91" r="22"/><text x="335" y="97" text-anchor="middle">B</text></g>' +
      '<g class="pathway-node is-product"><rect x="372" y="105" width="92" height="48" rx="7"/>' +
        '<text x="418" y="135" text-anchor="middle">product</text></g>' +
      (branch ? '<path class="pathway-arrow branch" d="M169 69 Q252 28 335 69"/>' : "") +
      '<text class="product-answer" x="250" y="218" text-anchor="middle">' + labels[2] + "</text>",
      labels[0] + ". " + labels[1] + ". The resulting F2 phenotype ratio is " + labels[2] + ".",
      "0 0 500 242",
      "pathway-diagram"
    );
  }

  function complementationSvg(result, sameGene) {
    return textSvg(
      svgLines("lab-svg-kicker", 18, 22,
        [sameGene ? "same gene · same missing function" :
          "different genes · missing A vs B",
          "F1 asks whether intact copies meet"], 19) +
      '<g class="mutant-strain"><rect x="45" y="92" width="120" height="72" rx="8"/>' +
        '<text x="105" y="118" text-anchor="middle">strain 1</text>' +
        '<text class="lab-svg-label" x="105" y="145" text-anchor="middle">' +
          (sameGene ? "A−" : "A− · B+") + "</text></g>" +
      '<text class="product-sign" x="190" y="134">×</text>' +
      '<g class="mutant-strain"><rect x="215" y="92" width="120" height="72" rx="8"/>' +
        '<text x="275" y="118" text-anchor="middle">strain 2</text>' +
        '<text class="lab-svg-label" x="275" y="145" text-anchor="middle">' +
          (sameGene ? "A−" : "A+ · B−") + "</text></g>" +
      '<path class="pathway-arrow" d="M338 128 H382"/>' +
      '<g class="f1-result' + (result.rescued ? " is-rescued" : " is-mutant") + '">' +
        '<circle cx="430" cy="128" r="44"/><text x="430" y="123" text-anchor="middle">F1</text>' +
        '<text class="lab-svg-label" x="430" y="148" text-anchor="middle">' + result.f1 + "</text></g>" +
      '<text class="lab-svg-label" x="250" y="225" text-anchor="middle">' + result.inference + "</text>",
      "A complementation cross between two mutant strains gives an F1 that is " + result.f1 +
        ". " + result.inference.charAt(0).toUpperCase() + result.inference.slice(1) + ".",
      "0 0 500 248",
      "complementation-diagram"
    );
  }

  define("pathway-genetics-lab", function (api) {
    const { body, el, stat, predict } = api;
    const parts = labParts(el);
    let mode = "epistasis";
    let assay = "threshold";
    let topology = "recessiveEpistasis";
    let sameGene = false;

    function render() {
      parts.tabHost.replaceChildren(tabs(el, [
        { label: "Assay changes dominance", value: "assay" },
        { label: "Pathway ratios", value: "epistasis" },
        { label: "Complementation", value: "complement" },
      ], mode, (next) => { mode = next; render(); }));

      if (mode === "assay") {
        const result = pathwayGeneticsModel({ kind: "assay", assay });
        parts.visual.replaceChildren(assayBoard(el, result, assay));
        parts.controls.replaceChildren(
          el("div", { class: "lab-control-block" }, [
            el("span", { class: "lab-control-label", text: "Phenotype measurement" }),
            choiceRow(el, [
              { label: "Threshold appearance", value: "threshold" },
              { label: "Product amount", value: "amount" },
              { label: "Allele-specific bands", value: "bands" },
            ], assay, (value) => { assay = value; render(); }, "Phenotype assay"),
          ]),
          el("div", { class: "readout" }, [
            stat(result[1].reading, "heterozygote Aa"),
            stat("unchanged", "underlying transmission"),
          ])
        );
        parts.rail.replaceChildren(causalRail(el, [
          { key: "you changed", value: "measured " + assay },
          { key: "mechanism", value: "one biochemical state crosses a different readout map" },
          { key: "observable", value: "Aa reads as " + result[1].reading },
        ]));
        parts.explanation.className = "callout";
        parts.explanation.innerHTML = "<strong>Dominance belongs to a phenotype definition.</strong> " +
          "The same heterozygote can look completely dominant by a threshold trait, intermediate " +
          "by product amount, and codominant in an allele-specific molecular assay.";
        return;
      }

      if (mode === "epistasis") {
        const result = pathwayGeneticsModel({ kind: "epistasis", topology });
        parts.visual.replaceChildren(
          el("div", { html: pathwaySvg(topology) }),
          probabilityBars(el, Object.entries(result.groups).map(([label, weight]) => ({
            label, value: weight / 16,
          })), "F2 phenotype groups with ratio " + result.ratio)
        );
        parts.controls.replaceChildren(
          el("div", { class: "lab-control-block" }, [
            el("span", { class: "lab-control-label", text: "Pathway topology" }),
            choiceRow(el, [
              { label: "Recessive epistasis", value: "recessiveEpistasis" },
              { label: "Dominant epistasis", value: "dominantEpistasis" },
              { label: "Both required", value: "complementary" },
              { label: "Either sufficient", value: "duplicate" },
            ], topology, (value) => { topology = value; render(); }, "Epistasis topology"),
          ]),
          el("div", { class: "readout" }, [
            stat(result.ratio, "derived phenotype ratio"),
            stat("9 · 3 · 3 · 1", "genotype-class weights stay fixed"),
          ])
        );
        parts.rail.replaceChildren(causalRail(el, [
          { key: "you changed", value: "genotype-to-pathway topology" },
          { key: "mechanism", value: "the same four genotype classes collapse differently" },
          { key: "observable", value: result.ratio + " phenotype ratio" },
        ]));
        parts.explanation.className = "callout callout-good";
        parts.explanation.innerHTML = "<strong>Never memorise the modified ratio.</strong> " +
          "The AaBb cross still produces 9, 3, 3, and 1 genotype-class weights. Trace which " +
          "classes make the same product, then add only those mutually exclusive weights.";
        return;
      }

      const result = pathwayGeneticsModel({ kind: "complementation", sameGene });
      parts.visual.innerHTML = complementationSvg(result, sameGene);
      parts.controls.replaceChildren(
        el("div", { class: "lab-control-block" }, [
          el("span", { class: "lab-control-label", text: "Two recessive mutant strains" }),
          choiceRow(el, [
            { label: "Mutations in different genes", value: false },
            { label: "Mutations in the same gene", value: true },
          ], sameGene, (value) => { sameGene = value; render(); }, "Mutation relationship"),
        ]),
        el("div", { class: "readout" }, [
          stat(result.f1, "F1 phenotype"),
          stat(result.rescued ? "complement" : "fail to complement", "test result"),
        ])
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "you changed", value: sameGene ? "both strains lose gene A" : "strains lose A versus B" },
        { key: "mechanism", value: result.rescued ? "intact copies share the F1 cell" : "no intact copy of A exists" },
        { key: "observable", value: "F1 is " + result.f1 },
      ]));
      parts.explanation.className = "callout " + (result.rescued ? "callout-good" : "");
      parts.explanation.innerHTML = "<strong>Complementation tests function, not physical distance.</strong> " +
        (result.rescued
          ? "Rescue supports different genes because each parent supplies the function the other lacks."
          : "Failure is consistent with alleles of one gene, but dominant mutations, deletions spanning two genes, and non-cell-autonomous effects are important exceptions.");
    }

    predict(body, {
      widget: "pathway-genetics-lab",
      question: "An AaBb F2 needs at least one functional A allele and one functional B allele to make pigment. What phenotype ratio follows?",
      hint: "Only the 9/16 A_B_ class completes both required steps.",
      options: [
        { label: "9:3:3:1" },
        { label: "9:7", correct: true },
        { label: "12:3:1" },
        { label: "15:1" },
      ],
    }, () => {
      parts.instrument.hidden = false;
      render();
    });
    finishLab(parts, body);
  });

  /* Ch 12 view ------------------------------------------------------------ */

  function chiSquareBoard(el, result, labels) {
    const board = el("div", {
      class: "chi-board",
      role: "img",
      "aria-label": "Observed and expected counts. " + labels.map((label, index) =>
        label + " observed " + result.observed[index] + ", expected " +
        result.expected[index].toFixed(1)
      ).join("; "),
    });
    const maximum = Math.max(...result.observed, ...result.expected);
    labels.forEach((label, index) => {
      board.append(el("div", { class: "chi-row" }, [
        el("strong", { text: label }),
        el("div", { class: "chi-tracks" }, [
          el("span", { class: "chi-track expected" }, [
            el("span", { style: "width:" + (100 * result.expected[index] / maximum).toFixed(2) + "%" }),
            el("small", { text: "expected " + result.expected[index].toFixed(1) }),
          ]),
          el("span", { class: "chi-track observed" }, [
            el("span", { style: "width:" + (100 * result.observed[index] / maximum).toFixed(2) + "%" }),
            el("small", { text: "observed " + result.observed[index] }),
          ]),
        ]),
      ]));
    });
    return board;
  }

  function powerBoard(el, result, actualDominant, n) {
    const board = el("div", {
      class: "power-board",
      role: "img",
      "aria-label": result.rejected + " of 200 fixed-seed experiments rejected the 3 to 1 null. " +
        "The true dominant fraction was " + percent(actualDominant, 0) + " and sample size " + n + ".",
    });
    board.append(el("div", { class: "power-dot-grid", "aria-hidden": "true" },
      Array.from({ length: 200 }, (_, index) => el("span", {
        class: index < result.rejected ? "is-rejected" : "",
      }))
    ));
    board.append(el("div", { class: "power-caption" }, [
      el("strong", { text: result.rejected + " / 200" }),
      el("span", { text: " experiments cross χ² = 3.841" }),
    ]));
    return board;
  }

  define("genetic-inference-lab", function (api) {
    const { body, el, stat, predict } = api;
    const parts = labParts(el);
    let mode = "fit";
    let hypothesis = "dihybrid";
    let distortion = 0;
    let estimatedParameters = 0;
    let actualDominant = 0.68;
    let sampleSize = 80;
    let sibship = 2;

    function render() {
      parts.tabHost.replaceChildren(tabs(el, [
        { label: "Goodness of fit", value: "fit" },
        { label: "Power by replay", value: "power" },
        { label: "Ascertainment lens", value: "ascertainment" },
      ], mode, (next) => { mode = next; render(); }));

      if (mode === "fit") {
        const result = geneticInferenceModel({
          kind: "chiSquare", hypothesis, distortion,
          estimatedParameters: hypothesis === "dihybrid" ? estimatedParameters : 0,
        });
        const labels = hypothesis === "dihybrid" ? ["A_B_", "A_bb", "aaB_", "aabb"] : ["dominant", "recessive"];
        parts.visual.replaceChildren(chiSquareBoard(el, result, labels));
        const controls = [
          el("div", { class: "lab-control-block" }, [
            el("span", { class: "lab-control-label", text: "Specified genetic null" }),
            choiceRow(el, [
              { label: "3:1 monohybrid", value: "monohybrid" },
              { label: "9:3:3:1 dihybrid", value: "dihybrid" },
            ], hypothesis, (value) => {
              hypothesis = value;
              distortion = 0;
              if (value === "monohybrid") estimatedParameters = 0;
              render();
            }, "Genetic null"),
          ]),
          rangeControl(el, "Move counts between the first two classes", distortion, {
            min: -20, max: 25, step: 1,
            format: (value) => (value > 0 ? "+" : "") + value,
          }, (value) => { distortion = value; render(); }),
        ];
        if (hypothesis === "dihybrid") {
          controls.push(el("div", { class: "lab-control-block" }, [
            el("span", { class: "lab-control-label", text: "Parameters learned from these counts" }),
            choiceRow(el, [
              { label: "None · fully specified", value: 0 },
              { label: "One fitted parameter", value: 1 },
            ], estimatedParameters, (value) => { estimatedParameters = value; render(); }, "Fitted parameters"),
          ]));
        }
        controls.push(el("div", { class: "readout" }, [
          stat(result.statistic.toFixed(2), "χ² statistic"),
          stat(String(result.df), "degrees of freedom"),
          stat(result.reject ? "reject" : "do not reject", "at α = 0.05"),
        ]));
        parts.controls.replaceChildren(...controls);
        parts.rail.replaceChildren(causalRail(el, [
          { key: "you changed", value: "observed counts and " + result.df + " df" },
          { key: "mechanism", value: "sum squared residuals scaled by expectation" },
          { key: "observable", value: "χ² " + result.statistic.toFixed(2) + " versus " + result.critical.toFixed(3) },
        ]));
        parts.explanation.className = "callout " + (result.reject ? "callout-bad" : "");
        parts.explanation.innerHTML = result.reject
          ? "<strong>These residuals are too large for the stated null at the 5% threshold.</strong> Rejection says the full data-generating model is inadequate; it does not identify which biological assumption failed."
          : "<strong>Do not reject is not accept.</strong> These counts are not unusually far from the stated expectation at this sample size. Power—not the p-value alone—sets how much disagreement could still be hiding.";
        return;
      }

      if (mode === "power") {
        const result = geneticInferenceModel({
          kind: "power", n: sampleSize, actualDominant,
          seed: 12012, replicates: 200,
        });
        parts.visual.replaceChildren(powerBoard(el, result, actualDominant, sampleSize));
        parts.controls.replaceChildren(
          el("div", { class: "lab-control-block" }, [
            el("span", { class: "lab-control-label", text: "True dominant fraction behind the samples" }),
            choiceRow(el, [
              { label: "75% · null true", value: 0.75 },
              { label: "68% · mild departure", value: 0.68 },
              { label: "60% · strong departure", value: 0.60 },
            ], actualDominant, (value) => { actualDominant = value; render(); }, "True dominant fraction"),
          ]),
          rangeControl(el, "Offspring per experiment", sampleSize, {
            min: 20, max: 500, step: 20, format: (value) => String(value),
          }, (value) => { sampleSize = value; render(); }),
          el("div", { class: "readout" }, [
            stat(percent(result.power, 1), "fixed-seed detection rate"),
            stat(String(result.rejected), "rejections / 200"),
          ])
        );
        parts.rail.replaceChildren(causalRail(el, [
          { key: "you changed", value: sampleSize + " offspring; truth " + percent(actualDominant, 0) },
          { key: "mechanism", value: "sampling noise competes with the real departure" },
          { key: "observable", value: percent(result.power, 1) + " of repeats reject 3:1" },
        ]));
        parts.explanation.className = "callout";
        parts.explanation.innerHTML = "<strong>Power is a property of a design against a particular alternative.</strong> " +
          "The seed holds the 200 random experiments fixed while sample size changes, so you can see " +
          "a real effect move from mostly hidden to reliably detected.";
        return;
      }

      const result = geneticInferenceModel({
        kind: "ascertainment", children: sibship, p: 0.25,
      });
      parts.visual.replaceChildren(probabilityBars(el,
        result.distribution.map((row) => ({
          label: row.affected + " affected", value: row.probability,
        })), "Distribution among families selected because at least one child is affected"
      ));
      parts.controls.replaceChildren(
        rangeControl(el, "Children per family", sibship, {
          min: 2, max: 6, step: 1, format: (value) => String(value),
        }, (value) => { sibship = value; render(); }),
        el("div", { class: "readout" }, [
          stat(percent(0.25, 1), "true per-child risk"),
          stat(result.conditionalMean.toFixed(2), "affected / selected family"),
          stat(percent(result.naiveAffectedFraction, 1), "naive selected-sample fraction"),
        ])
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "you changed", value: "kept only families with ≥1 affected child" },
        { key: "mechanism", value: "conditioned the binomial on the outcome" },
        { key: "observable", value: percent(result.naiveAffectedFraction, 1) + " appears affected, not 25%" },
      ]));
      parts.explanation.className = "callout callout-bad";
      parts.explanation.innerHTML = "<strong>The sampling process manufactured the excess.</strong> " +
        "Every family with zero affected children was made invisible. Fit the truncated distribution " +
        "or use a valid proband scheme; never treat an ascertained pedigree collection as a random sample.";
    }

    predict(body, {
      widget: "genetic-inference-lab",
      question: "A χ² test of a 3:1 cross is not significant. What has the experiment established?",
      hint: "A test measures surprise under a null; it does not prove equality.",
      options: [
        { label: "The 3:1 model is true" },
        { label: "The alleles assort independently" },
        { label: "The data are not unusually incompatible with 3:1 at the available power", correct: true },
        { label: "The observed and expected counts are equal" },
      ],
    }, () => {
      parts.instrument.hidden = false;
      render();
    });
    finishLab(parts, body);
  });

  /* Ch 13 view ------------------------------------------------------------ */

  function sexSwitchSvg(result, organism, constitution) {
    const species = organism === "mammal" ? "mammal" : organism === "fly" ? "fruit fly" : "nematode";
    const switchLabel = organism === "mammal"
      ? (result.driver === "functional SRY pulse" ? "SRY on" : "SRY off")
      : result.driver.replace("X-to-autosome ratio ", "X:A ");
    const outcomeLabel = result.sex.replace(" pathway", "");
    const roleLines = organism === "mammal"
      ? ["SRY chooses the pathway", "other Y genes support sperm production"]
      : organism === "fly"
      ? ["Y supports male fertility", "Y does not choose sex"]
      : ["this lineage has no Y chromosome"];
    return textSvg(
      svgLines("lab-svg-kicker", 18, 22,
        [species + " · constitution " + constitution,
          "switch ≠ chromosome label"], 19) +
      '<g class="sex-constitution"><rect x="42" y="98" width="116" height="70" rx="8"/>' +
        '<text x="100" y="140" text-anchor="middle">' + constitution + "</text></g>" +
      '<path class="pathway-arrow" d="M158 133 H226"/>' +
      '<g class="sex-switch"><circle cx="270" cy="133" r="48"/>' +
        '<text x="270" y="126" text-anchor="middle">switch</text>' +
        '<text class="lab-svg-label" x="270" y="149" text-anchor="middle">' + switchLabel + "</text></g>" +
      '<path class="pathway-arrow" d="M318 133 H376"/>' +
      '<g class="sex-outcome"><rect x="376" y="98" width="92" height="70" rx="8"/>' +
        '<text x="422" y="128" text-anchor="middle">outcome</text>' +
        '<text class="lab-svg-label" x="422" y="151" text-anchor="middle">' + outcomeLabel + "</text></g>" +
      svgLines("lab-svg-label", 18, 214, roleLines, 18),
      species + " with " + constitution + " has " + result.driver + " and develops through the " +
        result.sex + ". " + result.yRole + ".",
      "0 0 500 248",
      "sex-switch-diagram"
    );
  }

  function dosageSvg(result) {
    const max = Math.max(result.highOutput, result.lowOutput);
    const highWidth = 300 * result.highOutput / max;
    const lowWidth = 300 * result.lowOutput / max;
    return textSvg(
      svgLines("lab-svg-kicker", 18, 22,
        [result.lineage + " dosage solution",
          result.mechanism,
          "equal output between sexes"], 18) +
      '<text class="dosage-label" x="34" y="105">' + result.highCopy + "</text>" +
      '<rect class="dosage-track" x="112" y="78" width="330" height="38" rx="5"/>' +
      '<rect class="dosage-output" x="112" y="78" width="' + highWidth.toFixed(1) + '" height="38" rx="5"/>' +
      '<text class="dosage-value" x="' + (122 + highWidth).toFixed(1) + '" y="104">' + result.highOutput + "</text>" +
      '<text class="dosage-label" x="34" y="174">' + result.lowCopy + "</text>" +
      '<rect class="dosage-track" x="112" y="147" width="330" height="38" rx="5"/>' +
      '<rect class="dosage-output" x="112" y="147" width="' + lowWidth.toFixed(1) + '" height="38" rx="5"/>' +
      '<text class="dosage-value" x="' + (122 + lowWidth).toFixed(1) + '" y="173">' + result.lowOutput + "</text>" +
      '<text class="lab-svg-label" x="250" y="226" text-anchor="middle">relative X-linked output after compensation</text>',
      result.lineage + " dosage compensation uses " + result.mechanism + ". " + result.highCopy +
        " and " + result.lowCopy + " have equal relative X-linked output in this schematic.",
      "0 0 500 248",
      "dosage-diagram"
    );
  }

  define("sex-system-lab", function (api) {
    const { body, el, stat, predict } = api;
    const parts = labParts(el);
    let mode = "system";
    let organism = "mammal";
    let constitution = "XY";
    let mother = "carrier";
    let father = "healthy";
    let dosageOrganism = "mammal";
    const constitutions = {
      mammal: ["XX", "XY", "XX+SRY", "XY-SRY"],
      fly: ["XX", "XY", "XO", "XXY"],
      worm: ["XX", "XO"],
    };

    function render() {
      parts.tabHost.replaceChildren(tabs(el, [
        { label: "System switch", value: "system" },
        { label: "X-linked cross", value: "cross" },
        { label: "Dosage solutions", value: "dosage" },
      ], mode, (next) => { mode = next; render(); }));

      if (mode === "system") {
        const result = sexSystemModel({ kind: "system", organism, constitution });
        parts.visual.innerHTML = sexSwitchSvg(result, organism, constitution);
        parts.controls.replaceChildren(
          el("div", { class: "paired-controls" }, [
            el("div", { class: "lab-control-block" }, [
              el("span", { class: "lab-control-label", text: "Organismal system" }),
              choiceRow(el, [
                { label: "Mammal", value: "mammal" },
                { label: "Fruit fly", value: "fly" },
                { label: "C. elegans", value: "worm" },
              ], organism, (value) => {
                organism = value;
                constitution = constitutions[value][0];
                render();
              }, "Sex determination system"),
            ]),
            el("div", { class: "lab-control-block" }, [
              el("span", { class: "lab-control-label", text: "Chromosome constitution" }),
              choiceRow(el, constitutions[organism].map((value) => ({ label: value, value })),
                constitution, (value) => { constitution = value; render(); }, "Chromosome constitution"),
            ]),
          ]),
          el("div", { class: "readout" }, [
            stat(result.driver, "decision variable"),
            stat(result.sex, "developmental outcome"),
          ])
        );
        parts.rail.replaceChildren(causalRail(el, [
          { key: "you changed", value: organism + " " + constitution },
          { key: "mechanism", value: result.driver },
          { key: "observable", value: result.sex },
        ]));
        parts.explanation.className = "callout";
        parts.explanation.innerHTML = "<strong>There is no conserved universal sex chromosome switch.</strong> " +
          "Mammals read an SRY pulse; flies and nematodes read X-to-autosome dose. The Y can carry " +
          "a switch, support fertility without choosing sex, or be absent entirely.";
        return;
      }

      if (mode === "cross") {
        const result = sexSystemModel({ kind: "xCross", mother, father });
        parts.visual.replaceChildren(probabilityBars(el, [
          { label: "affected sons", value: result.affectedSons },
          { label: "affected daughters", value: result.affectedDaughters },
          { label: "carrier daughters", value: result.carrierDaughters },
        ], "X-linked recessive outcomes conditional on child sex"));
        parts.controls.replaceChildren(
          el("div", { class: "paired-controls" }, [
            el("div", { class: "lab-control-block" }, [
              el("span", { class: "lab-control-label", text: "Mother" }),
              choiceRow(el, [
                { label: "XA/XA", value: "noncarrier" },
                { label: "XA/Xa", value: "carrier" },
                { label: "Xa/Xa", value: "affected" },
              ], mother, (value) => { mother = value; render(); }, "Mother X-linked genotype"),
            ]),
            el("div", { class: "lab-control-block" }, [
              el("span", { class: "lab-control-label", text: "Father" }),
              choiceRow(el, [
                { label: "XA/Y", value: "healthy" },
                { label: "Xa/Y", value: "affected" },
              ], father, (value) => { father = value; render(); }, "Father X-linked genotype"),
            ]),
          ]),
          el("div", { class: "readout" }, [
            stat(percent(result.affectedSons, 0), "affected among sons"),
            stat(percent(result.affectedDaughters, 0), "affected among daughters"),
            stat(percent(result.carrierDaughters, 0), "carriers among daughters"),
          ])
        );
        parts.rail.replaceChildren(causalRail(el, [
          { key: "you changed", value: "parental X-linked genotypes" },
          { key: "mechanism", value: "sons receive their only X from mother; daughters receive father's X" },
          { key: "observable", value: percent(result.affectedSons, 0) + " sons vs " + percent(result.affectedDaughters, 0) + " daughters affected" },
        ]));
        parts.explanation.className = "callout";
        parts.explanation.innerHTML = "<strong>Condition on sex before reading the probability.</strong> " +
          "A son never inherits his father's X, so father-to-son transmission excludes X linkage. " +
          "An affected father passes his X to every daughter, whether or not that allele is expressed.";
        return;
      }

      const result = sexSystemModel({ kind: "dosage", organism: dosageOrganism });
      parts.visual.innerHTML = dosageSvg(result);
      parts.controls.replaceChildren(
        el("div", { class: "lab-control-block" }, [
          el("span", { class: "lab-control-label", text: "Lineage" }),
          choiceRow(el, [
            { label: "Mammal", value: "mammal" },
            { label: "Fruit fly", value: "fly" },
            { label: "Nematode", value: "worm" },
          ], dosageOrganism, (value) => { dosageOrganism = value; render(); }, "Dosage compensation lineage"),
        ]),
        el("div", { class: "readout" }, [
          stat(result.mechanism, "compensation strategy"),
          stat(result.highOutput + " = " + result.lowOutput, "balanced X output units"),
        ])
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "you changed", value: result.lineage },
        { key: "mechanism", value: result.mechanism },
        { key: "observable", value: result.highCopy + " and " + result.lowCopy + " output match" },
      ]));
      parts.explanation.className = "callout callout-good";
      parts.explanation.innerHTML = "<strong>Evolution solved the same dose imbalance three incompatible ways.</strong> " +
        "Mammals subtract one female X, flies amplify the male X, and nematodes halve both " +
        "hermaphrodite X chromosomes. The equal bars are the shared outcome, not a shared mechanism.";
    }

    predict(body, {
      widget: "sex-system-lab",
      question: "A functional SRY gene is translocated onto one X chromosome in an otherwise XX mammalian embryo. What does the switch model predict?",
      hint: "Test whether the developmental switch follows the Y chromosome as a whole or the functional SRY signal.",
      options: [
        { label: "The ovary pathway because there is no Y" },
        { label: "The testis pathway because functional SRY is present", correct: true },
        { label: "A fruit-fly-like X:A calculation" },
        { label: "No gonadal development is possible" },
      ],
    }, () => {
      parts.instrument.hidden = false;
      render();
    });
    finishLab(parts, body);
  });

  /* Ch 15 view ------------------------------------------------------------ */

  function pedigreeFixtureSvg(fixture, label) {
    const symbols = [];
    const titleLines = fixture === "fatherDaughters"
      ? ["affected father", "2 affected daughters · 2 unaffected sons"]
      : fixture === "motherAll"
      ? ["affected mother", "all 4 children affected"]
      : ["unaffected parents", "affected son · unaffected daughter"];
    function person(x, y, sex, affected) {
      if (sex === "male") {
        symbols.push('<rect class="ped-symbol' + (affected ? " is-affected" : "") +
          '" x="' + (x - 16) + '" y="' + (y - 16) + '" width="32" height="32"/>');
      } else {
        symbols.push('<circle class="ped-symbol' + (affected ? " is-affected" : "") +
          '" cx="' + x + '" cy="' + y + '" r="16"/>');
      }
    }
    if (fixture === "fatherDaughters") {
      person(210, 90, "male", true); person(290, 90, "female", false);
      person(145, 184, "female", true); person(215, 184, "female", true);
      person(285, 184, "male", false); person(355, 184, "male", false);
    } else if (fixture === "motherAll") {
      person(210, 90, "male", false); person(290, 90, "female", true);
      person(145, 184, "female", true); person(215, 184, "male", true);
      person(285, 184, "female", true); person(355, 184, "male", true);
    } else {
      person(210, 90, "male", false); person(290, 90, "female", false);
      person(215, 184, "male", true); person(285, 184, "female", false);
    }
    return textSvg(
      svgLines("lab-svg-kicker", 18, 22, titleLines, 19) +
      '<path class="ped-line" d="M226 90 H274 M250 90 V132 M145 132 H355"/>' +
      (fixture === "smallFamily" ? '<path class="ped-line is-mask" d="M145 132 H195 M305 132 H355"/>' : "") +
      '<path class="ped-line" d="' + (fixture === "smallFamily"
        ? "M215 132 V168 M285 132 V168"
        : "M145 132 V168 M215 132 V168 M285 132 V168 M355 132 V168") + '"/>' +
      symbols.join("") +
      '<text class="lab-svg-label" x="250" y="235" text-anchor="middle">filled = affected · square = male · circle = female</text>',
      "Pedigree fixture: " + label + ". Filled symbols are affected; squares are male and circles female.",
      "0 0 500 255",
      "pedigree-diagram"
    );
  }

  function carrierBayesBoard(el, result, sons, sensitivity) {
    const total = result.carrierJoint + result.nonCarrierJoint;
    return el("div", {
      class: "carrier-bayes-board",
      role: "img",
      "aria-label": "Carrier update from a one half prior, " + sons +
        " unaffected sons, and a negative test with " + percent(sensitivity, 0) +
        " sensitivity. Posterior carrier probability " + percent(result.posterior, 2) + ".",
    }, [
      el("div", { class: "bayes-update-head" }, [
        el("span", { text: "hypothesis" }),
        el("span", { text: "prior" }),
        el("span", { text: "evidence likelihood" }),
        el("span", { text: "joint" }),
      ]),
      el("div", { class: "bayes-update-row is-carrier" }, [
        el("strong", { text: "carrier" }),
        el("span", { text: "½" }),
        el("span", { text: "(½)^" + sons + " × " + percent(1 - sensitivity, 0) }),
        el("span", { text: result.carrierJoint.toFixed(5) }),
      ]),
      el("div", { class: "bayes-update-row" }, [
        el("strong", { text: "not carrier" }),
        el("span", { text: "½" }),
        el("span", { text: "1 × 100%" }),
        el("span", { text: result.nonCarrierJoint.toFixed(5) }),
      ]),
      el("div", { class: "bayes-update-result" }, [
        el("span", { text: "normalise by " + total.toFixed(5) }),
        el("strong", { text: percent(result.posterior, 2) + " carrier" }),
      ]),
    ]);
  }

  function inbreedingSvg(result, relationship, q) {
    const maximum = Math.max(result.risk, result.outbred, 1e-8);
    const outbredWidth = 350 * result.outbred / maximum;
    const relatedWidth = 350 * result.risk / maximum;
    return textSvg(
      svgLines("lab-svg-kicker", 18, 22,
        [relationship.replace(/([A-Z])/g, " $1").toLowerCase() + " · F = " + result.f.toFixed(4),
          "recessive allele frequency q = " + percent(q, 2)], 19) +
      '<text class="risk-label" x="30" y="111">outbred q²</text>' +
      '<rect class="risk-track" x="132" y="82" width="350" height="38" rx="5"/>' +
      '<rect class="risk-output" x="132" y="82" width="' + outbredWidth.toFixed(2) + '" height="38" rx="5"/>' +
      '<rect class="risk-value-bg" x="136" y="87" width="126" height="28" rx="4"/>' +
      '<text class="risk-value" x="142" y="108">' + percent(result.outbred, 4) + "</text>" +
      '<text class="risk-label" x="30" y="178">with IBD</text>' +
      '<rect class="risk-track" x="132" y="149" width="350" height="38" rx="5"/>' +
      '<rect class="risk-output is-related" x="132" y="149" width="' + relatedWidth.toFixed(2) + '" height="38" rx="5"/>' +
      '<rect class="risk-value-bg" x="136" y="154" width="126" height="28" rx="4"/>' +
      '<text class="risk-value" x="142" y="175">' + percent(result.risk, 4) + "</text>" +
      '<text class="lab-svg-label" x="250" y="229" text-anchor="middle">Fq + (1 − F)q² · absolute risk, not a diagnosis</text>',
      "For " + relationship + " parents, F is " + result.f.toFixed(4) +
        ". At recessive allele frequency " + percent(q, 2) + ", outbred homozygous risk is " +
        percent(result.outbred, 4) + " and risk with IBD is " + percent(result.risk, 4) + ".",
      "0 0 500 252",
      "inbreeding-diagram"
    );
  }

  define("pedigree-detective-lab", function (api) {
    const { body, el, stat, predict } = api;
    const parts = labParts(el);
    let mode = "evidence";
    let fixture = "fatherDaughters";
    let unaffectedSons = 3;
    let sensitivity = 0.95;
    let relationship = "firstCousins";
    let q = 0.005;

    function render() {
      parts.tabHost.replaceChildren(tabs(el, [
        { label: "Mode evidence", value: "evidence" },
        { label: "Carrier update", value: "carrier" },
        { label: "IBD risk", value: "inbreeding" },
      ], mode, (next) => { mode = next; render(); }));

      if (mode === "evidence") {
        const result = pedigreeModel({ kind: "mode", fixture });
        parts.visual.replaceChildren(
          el("div", { html: pedigreeFixtureSvg(fixture, result.label) }),
          probabilityBars(el, Object.entries(result.posterior).map(([label, value]) => ({
            label, value,
          })), "Normalised inheritance-mode likelihoods under equal priors and the displayed parental assumptions")
        );
        parts.controls.replaceChildren(
          el("div", { class: "lab-control-block" }, [
            el("span", { class: "lab-control-label", text: "Observed nuclear-family pattern" }),
            choiceRow(el, [
              { label: "Affected father → daughters", value: "fatherDaughters" },
              { label: "Affected mother → everyone", value: "motherAll" },
              { label: "One affected son", value: "smallFamily" },
            ], fixture, (value) => { fixture = value; render(); }, "Pedigree fixture"),
          ]),
          el("div", { class: "readout" }, Object.entries(result.posterior)
            .sort((a, b) => b[1] - a[1]).slice(0, 2)
            .map(([label, value]) => stat(percent(value, 1), label + " equal-prior weight")))
        );
        const winner = Object.entries(result.posterior).sort((a, b) => b[1] - a[1])[0];
        parts.rail.replaceChildren(causalRail(el, [
          { key: "you changed", value: result.label },
          { key: "mechanism", value: "each mode assigns a probability to every transmission" },
          { key: "observable", value: winner[0] + " carries " + percent(winner[1], 1) + " of equal-prior weight" },
        ]));
        parts.explanation.className = "callout";
        parts.explanation.innerHTML = "<strong>This is a likelihood comparison, not a diagnosis.</strong> " +
          "The bars assume the parental genotypes shown by each model, complete penetrance, no de novo event, " +
          "and equal mode priors. Relax any assumption and zeroes can become non-zero; molecular data must finish the job.";
        return;
      }

      if (mode === "carrier") {
        const result = pedigreeModel({
          kind: "carrier", prior: 0.5, unaffectedSons, sensitivity,
        });
        parts.visual.replaceChildren(carrierBayesBoard(el, result, unaffectedSons, sensitivity));
        parts.controls.replaceChildren(
          rangeControl(el, "Unaffected sons past age of onset", unaffectedSons, {
            min: 0, max: 5, step: 1, format: (value) => String(value),
          }, (value) => { unaffectedSons = value; render(); }),
          rangeControl(el, "Carrier-test sensitivity", sensitivity, {
            min: 0.5, max: 0.99, step: 0.01, format: (value) => percent(value, 0),
          }, (value) => { sensitivity = value; render(); }),
          el("div", { class: "readout" }, [
            stat(percent(result.posterior, 2), "posterior carrier risk"),
            stat(percent(result.nextSonAffected, 2), "next son affected"),
          ])
        );
        parts.rail.replaceChildren(causalRail(el, [
          { key: "you changed", value: unaffectedSons + " unaffected sons + negative " + percent(sensitivity, 0) + " test" },
          { key: "mechanism", value: "multiply genotype-specific evidence likelihoods" },
          { key: "observable", value: percent(result.posterior, 2) + " carrier posterior" },
        ]));
        parts.explanation.className = "callout callout-good";
        parts.explanation.innerHTML = "<strong>Unaffected relatives are data.</strong> " +
          "Each unaffected son halves the likelihood of carrier status before the assay is applied. " +
          "This teaching table assumes perfect specificity and no germline mosaicism, so clinical counselling retains a separate residual-risk floor.";
        return;
      }

      const result = pedigreeModel({ kind: "inbreeding", relationship, q });
      parts.visual.innerHTML = inbreedingSvg(result, relationship, q);
      parts.controls.replaceChildren(
        el("div", { class: "lab-control-block" }, [
          el("span", { class: "lab-control-label", text: "Relationship of the parents" }),
          choiceRow(el, [
            { label: "Unrelated", value: "unrelated" },
            { label: "Second cousins", value: "secondCousins" },
            { label: "First cousins", value: "firstCousins" },
            { label: "Half siblings", value: "halfSibs" },
            { label: "Full siblings", value: "fullSibs" },
          ], relationship, (value) => { relationship = value; render(); }, "Parental relationship"),
        ]),
        rangeControl(el, "Recessive allele frequency q", q, {
          min: 0.001, max: 0.02, step: 0.001,
          format: (value) => percent(value, 1),
        }, (value) => { q = value; render(); }),
        el("div", { class: "readout" }, [
          stat(result.f.toFixed(4), "expected inbreeding coefficient F"),
          stat(percent(result.risk, 4), "locus-specific aa risk"),
          stat(result.fold.toFixed(1) + "×", "relative to q²"),
        ])
      );
      parts.rail.replaceChildren(causalRail(el, [
        { key: "you changed", value: "IBD probability to F = " + result.f.toFixed(4) },
        { key: "mechanism", value: "an ancestral allele can arrive down both pedigree paths" },
        { key: "observable", value: "aa risk " + percent(result.risk, 4) + " at this locus" },
      ]));
      parts.explanation.className = "callout";
      parts.explanation.innerHTML = "<strong>Consanguinity creates no allele.</strong> " +
        "It adds the linear Fq route to homozygosity for alleles already present in the family. " +
        "This is one locus-specific model; counselling about total pregnancy risk needs the population baseline and family history too.";
    }

    predict(body, {
      widget: "pedigree-detective-lab",
      question: "An affected father and unaffected mother have two affected daughters and two unaffected sons. Under complete penetrance, what does that pattern do?",
      hint: "Compare a deterministic father-to-daughter X transmission with four independent 1/2 autosomal transmissions.",
      options: [
        { label: "It proves autosomal dominant inheritance" },
        { label: "It strongly favours X-linked dominant, but autosomal dominant remains possible", correct: true },
        { label: "It proves mitochondrial inheritance" },
        { label: "It contains no inheritance information" },
      ],
    }, () => {
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
})(typeof window !== "undefined" ? window : globalThis);
