/* ── Chapter interaction pilots ─────────────────────────────────────────────
   Four deliberately different Hero Labs. The reader owns mounting, persistence
   and prediction scoring in widgets.js; this file owns topic-specific models
   and views. No imports or runtime requests: the built reader must work from
   file:// as well as from a hosted path.
   ───────────────────────────────────────────────────────────────────────── */

(function (global) {
  "use strict";

  const definitions = {};
  const models = {};
  const coverage = {};
  const SVG_NS = "http://www.w3.org/2000/svg";

  function define(id, build) {
    if (definitions[id]) throw new Error("Duplicate interaction: " + id);
    definitions[id] = build;
  }

  function svgNode(tag, attrs) {
    const node = document.createElementNS(SVG_NS, tag);
    for (const [key, value] of Object.entries(attrs || {})) {
      node.setAttribute(key, value);
    }
    return node;
  }

  function setButtonState(button, active) {
    button.setAttribute("aria-pressed", active ? "true" : "false");
    button.classList.toggle("is-active", active);
  }

  function choiceRow(el, choices, selected, onPick, label) {
    const row = el("div", {
      class: "lab-choice-row",
      role: "group",
      "aria-label": label,
    });
    choices.forEach((choice) => {
      const button = el("button", {
        class: "btn lab-choice",
        type: "button",
        text: choice.label,
      });
      button.addEventListener("click", () => {
        const widget = button.closest(".widget");
        const groupLabel = row.getAttribute("aria-label");
        const buttonLabel = button.textContent.trim();
        onPick(choice.value);
        const replacementGroup = widget && [...widget.querySelectorAll('[role="group"]')]
          .find((candidate) => candidate.getAttribute("aria-label") === groupLabel);
        const replacement = replacementGroup && [...replacementGroup.querySelectorAll("button")]
          .find((candidate) => candidate.textContent.trim() === buttonLabel);
        if (replacement) replacement.focus({ preventScroll: true });
      });
      const active = typeof selected === "function" ? selected(choice) : choice.value === selected;
      setButtonState(button, active);
      row.append(button);
    });
    return row;
  }

  function tabs(el, choices, selected, onPick) {
    return choiceRow(el, choices, selected, onPick, "Lab mode");
  }

  function causalRail(el, items) {
    const rail = el("div", {
      class: "causal-rail",
      "aria-live": "polite",
      "aria-label": "Current causal chain",
    });
    items.forEach((item, index) => {
      rail.append(el("div", { class: "causal-step" }, [
        el("span", { class: "causal-key", text: item.key }),
        el("strong", { text: item.value }),
      ]));
      if (index < items.length - 1) {
        rail.append(el("span", {
          class: "causal-arrow",
          text: "→",
          "aria-hidden": "true",
        }));
      }
    });
    return rail;
  }

  function fieldWithRange(el, label, valueNode, input) {
    return el("label", { class: "field" }, [
      el("span", { class: "field-label" }, [
        el("span", { text: label }),
        valueNode,
      ]),
      input,
    ]);
  }

  function bindRerenderingRange(input, focusKey, onInput) {
    input.dataset.focusKey = focusKey;
    input.addEventListener("input", () => {
      const widget = input.closest(".widget");
      onInput(input.value);
      const replacement = widget && [...widget.querySelectorAll('input[type="range"]')]
        .find((candidate) => candidate.dataset.focusKey === focusKey);
      if (replacement) replacement.focus({ preventScroll: true });
    });
  }

  function replicationModel(input) {
    if (input.kind === "fork") {
      const lagging = input.direction === "right" ? "upper" : "lower";
      return {
        lagging,
        leading: lagging === "upper" ? "lower" : "upper",
      };
    }
    if (input.kind === "origins") {
      const minutes = input.hours * 60;
      const genomeKb = input.genomeMb * 1000;
      const coveredPerOriginKb = 2 * input.speedKbMin * minutes;
      return {
        minimum: Math.ceil(genomeKb / coveredPerOriginKb),
        coveredPerOriginKb,
      };
    }
    if (input.kind === "fidelity") {
      let rate = 1;
      if (input.selection) rate *= 1e-5;
      if (input.proofreading) rate *= 1e-2;
      if (input.mismatchRepair) rate *= 1e-3;
      return {
        rate,
        perBillion: rate * 1e9,
      };
    }
    throw new Error("Unknown replication model");
  }
  models.replication = replicationModel;

  function replicationForkSvg(direction, reveal) {
    const right = direction === "right";
    const forkX = right ? 426 : 94;
    const movement = right ? "fork moves →" : "← fork moves";
    const upperParent = right
      ? "M70 72 L426 72 L449 112"
      : "M450 72 L94 72 L71 112";
    const lowerParent = right
      ? "M70 152 L426 152 L449 112"
      : "M450 152 L94 152 L71 112";
    const actual = replicationModel({ kind: "fork", direction });
    let synthesis = "";

    if (reveal && right) {
      synthesis =
        '<path class="lab-new continuous" d="M112 166 L398 166"/>' +
        '<text class="lab-svg-label" text-anchor="middle">' +
          '<tspan x="260" y="214">leading · continuous</tspan>' +
          '<tspan x="260" y="238">5′→3′ toward fork</tspan></text>' +
        '<path class="lab-new fragment" d="M386 58 L326 58"/>' +
        '<path class="lab-new fragment" d="M302 58 L242 58"/>' +
        '<path class="lab-new fragment" d="M218 58 L158 58"/>' +
        '<text class="lab-svg-label" text-anchor="middle">' +
          '<tspan x="260" y="102">lagging · new primers</tspan>' +
          '<tspan x="260" y="126">fragments grow away</tspan></text>';
    } else if (reveal) {
      synthesis =
        '<path class="lab-new continuous" d="M408 58 L122 58"/>' +
        '<text class="lab-svg-label" text-anchor="middle">' +
          '<tspan x="260" y="102">leading · continuous</tspan>' +
          '<tspan x="260" y="126">5′→3′ toward fork</tspan></text>' +
        '<path class="lab-new fragment" d="M134 166 L194 166"/>' +
        '<path class="lab-new fragment" d="M218 166 L278 166"/>' +
        '<path class="lab-new fragment" d="M302 166 L362 166"/>' +
        '<text class="lab-svg-label" text-anchor="middle">' +
          '<tspan x="260" y="214">lagging · new primers</tspan>' +
          '<tspan x="260" y="238">fragments grow away</tspan></text>';
    } else {
      synthesis =
        '<path class="lab-slot-line" d="M118 58 L398 58"/>' +
        '<path class="lab-slot-line" d="M118 166 L398 166"/>' +
        '<text class="lab-svg-label" text-anchor="middle">' +
          '<tspan x="252" y="103">choose the template that must</tspan>' +
          '<tspan x="252" y="127">be copied in fragments</tspan>' +
        '</text>';
    }

    return (
      '<svg class="lab-diagram fork-diagram" viewBox="0 0 520 252" role="img" ' +
      'aria-label="Replication fork moving ' + direction + '. The ' + actual.lagging +
      ' template is copied discontinuously.">' +
        '<text class="lab-svg-kicker" x="18" y="24">' + movement + '</text>' +
        '<path class="lab-dna-parent" d="' + upperParent + '"/>' +
        '<path class="lab-dna-parent" d="' + lowerParent + '"/>' +
        '<text class="lab-svg-label" x="' + (right ? 68 : 80) + '" y="62">5′</text>' +
        '<text class="lab-svg-label" x="' + (right ? forkX - 14 : 452) + '" y="62">3′</text>' +
        '<text class="lab-svg-label" x="' + (right ? 68 : 80) + '" y="174">3′</text>' +
        '<text class="lab-svg-label" x="' + (right ? forkX - 14 : 452) + '" y="174">5′</text>' +
        '<circle class="lab-machine" cx="' + forkX + '" cy="112" r="17"/>' +
        '<text class="lab-machine-label" x="' + forkX + '" y="116">H</text>' +
        synthesis +
      '</svg>'
    );
  }

  function originSvg(minimum) {
    const visible = 7;
    let marks = "";
    for (let i = 0; i < visible; i++) {
      const x = 42 + i * 68;
      marks +=
        '<circle class="origin-mark" cx="' + x + '" cy="72" r="5"/>' +
        '<path class="origin-bubble" d="M' + (x - 25) + ' 72 Q' + x +
        ' 34 ' + (x + 25) + ' 72"/>' +
        '<path class="origin-bubble" d="M' + (x - 25) + ' 72 Q' + x +
        ' 110 ' + (x + 25) + ' 72"/>';
    }
    return (
      '<svg class="lab-diagram origin-diagram" viewBox="0 0 500 166" role="img" ' +
      'aria-label="Many bidirectional origins copy a chromosome in parallel.">' +
        '<path class="lab-dna-parent" d="M18 72 L482 72"/>' +
        marks +
        '<text class="lab-svg-label"><tspan x="18" y="126">drawing shows 7 of at least ' +
        minimum.toLocaleString("en-GB") + '</tspan><tspan x="18" y="152">simultaneous origins</tspan></text>' +
      '</svg>'
    );
  }

  define("replication-fork-lab", function (api) {
    const { body, el, stat, predict } = api;
    let mode = "fork";
    let direction = "right";
    let assignedLagging = "upper";
    let forkRun = false;
    const originState = { genomeMb: 6200, speedKbMin: 1.5, hours: 8 };
    const filters = { selection: true, proofreading: true, mismatchRepair: true };

    const instrument = el("div", { class: "hero-lab", hidden: true });
    const tabHost = el("div");
    const visual = el("div", { class: "lab-visual" });
    const controls = el("div", { class: "lab-controls" });
    const explanation = el("div", { class: "callout", "aria-live": "polite" });
    const railHost = el("div");

    function renderTabs() {
      tabHost.replaceChildren(tabs(el, [
        { label: "Fork direction", value: "fork" },
        { label: "Origin race", value: "origins" },
        { label: "Fidelity filters", value: "fidelity" },
      ], mode, (next) => {
        mode = next;
        render();
      }));
    }

    function renderFork() {
      const answer = replicationModel({ kind: "fork", direction });
      visual.innerHTML = replicationForkSvg(direction, forkRun);
      controls.replaceChildren(
        el("div", { class: "lab-control-block" }, [
          el("span", { class: "lab-control-label", text: "Fork movement" }),
          choiceRow(el, [
            { label: "← left", value: "left" },
            { label: "right →", value: "right" },
          ], direction, (next) => {
            direction = next;
            forkRun = false;
            renderFork();
          }, "Fork movement"),
        ]),
        el("div", { class: "lab-control-block" }, [
          el("span", { class: "lab-control-label",
            text: "Which parental template gets Okazaki fragments?" }),
          choiceRow(el, [
            { label: "Upper template", value: "upper" },
            { label: "Lower template", value: "lower" },
          ], assignedLagging, (next) => {
            assignedLagging = next;
            forkRun = false;
            renderFork();
          }, "Choose the lagging-strand template"),
        ]),
        el("button", {
          class: "btn btn-primary",
          type: "button",
          text: "Run this fork",
          onclick: () => {
            forkRun = true;
            renderFork();
          },
        })
      );

      if (!forkRun) {
        explanation.className = "callout";
        explanation.innerHTML =
          "Assign the discontinuous side, then run the fork. Reverse movement afterwards: " +
          "the chemistry stays fixed, so the strand roles must swap.";
      } else if (assignedLagging === answer.lagging) {
        explanation.className = "callout callout-good";
        explanation.innerHTML =
          "<strong>The fork works.</strong> Polymerase can extend only 5′→3′, which means it " +
          "reads a template 3′→5′. The <strong>" + answer.leading +
          "</strong> template can therefore be followed continuously toward this fork; the <strong>" +
          answer.lagging + "</strong> template must be repeatedly primed and copied away from it.";
      } else {
        explanation.className = "callout callout-bad";
        explanation.innerHTML =
          "<strong>This assignment requires 3′→5′ synthesis.</strong> Follow the parental " +
          "template toward the fork: only the template encountered 3′→5′ can support continuous " +
          "5′→3′ extension. Reverse your assignment or reverse the fork.";
      }

      railHost.replaceChildren(causalRail(el, [
        { key: "you changed", value: "fork moves " + direction },
        { key: "constraint", value: "new DNA grows 5′→3′" },
        { key: "observable", value: answer.lagging + " template becomes lagging" },
      ]));
    }

    function renderOrigins() {
      const result = replicationModel({
        kind: "origins",
        genomeMb: originState.genomeMb,
        speedKbMin: originState.speedKbMin,
        hours: originState.hours,
      });
      visual.innerHTML = originSvg(result.minimum);

      const genome = el("input", {
        type: "range", min: "50", max: "6500", step: "50",
        value: String(originState.genomeMb),
      });
      const speed = el("input", {
        type: "range", min: "0.5", max: "3", step: "0.1",
        value: String(originState.speedKbMin),
      });
      const hours = el("input", {
        type: "range", min: "2", max: "16", step: "0.5",
        value: String(originState.hours),
      });
      const genomeVal = el("span", {
        class: "val", text: originState.genomeMb.toLocaleString("en-GB") + " Mb",
      });
      const speedVal = el("span", {
        class: "val", text: originState.speedKbMin.toFixed(1) + " kb/min",
      });
      const hoursVal = el("span", {
        class: "val", text: originState.hours.toFixed(1) + " h",
      });

      function bind(input, key, parse) {
        bindRerenderingRange(input, key, (value) => {
          originState[key] = parse(value);
          renderOrigins();
        });
      }
      bind(genome, "genomeMb", Number);
      bind(speed, "speedKbMin", Number);
      bind(hours, "hours", Number);

      controls.replaceChildren(
        fieldWithRange(el, "DNA to copy", genomeVal, genome),
        fieldWithRange(el, "Fork speed", speedVal, speed),
        fieldWithRange(el, "S-phase time", hoursVal, hours),
        el("div", { class: "readout" }, [
          stat(result.minimum.toLocaleString("en-GB"), "ideal minimum origins"),
          stat(Math.round(result.coveredPerOriginKb).toLocaleString("en-GB") + " kb",
            "maximum covered per origin"),
        ])
      );
      explanation.className = "callout";
      explanation.innerHTML =
        "<strong>This is a lower bound.</strong> It assumes every origin fires at time zero, " +
        "every fork runs for the full S phase, and no forks stall or meet early. Human cells " +
        "therefore fire roughly 30,000–50,000 origins rather than merely this arithmetic minimum.";
      railHost.replaceChildren(causalRail(el, [
        { key: "you changed", value: originState.genomeMb.toLocaleString("en-GB") + " Mb in " +
            originState.hours.toFixed(1) + " h" },
        { key: "mechanism", value: "two forks leave every origin" },
        { key: "observable", value: "at least " +
            result.minimum.toLocaleString("en-GB") + " origins" },
      ]));
    }

    function renderFidelity() {
      const result = replicationModel({
        kind: "fidelity",
        selection: filters.selection,
        proofreading: filters.proofreading,
        mismatchRepair: filters.mismatchRepair,
      });
      const filterRows = [
        ["selection", "Base selection", "×10⁻⁵"],
        ["proofreading", "Proofreading", "×10⁻²"],
        ["mismatchRepair", "Mismatch repair", "×10⁻³"],
      ];

      visual.replaceChildren(el("div", { class: "filter-stack" },
        filterRows.map(([key, label, factor]) =>
          el("div", { class: "filter-stage" + (filters[key] ? "" : " is-off") }, [
            el("span", { class: "filter-state", text: filters[key] ? "ON" : "OFF" }),
            el("strong", { text: label }),
            el("span", { class: "filter-factor", text: factor }),
          ])
        )
      ));

      controls.replaceChildren(
        el("span", { class: "lab-control-label", text: "Active fidelity filters" }),
        choiceRow(el, filterRows.map(([key, label]) => ({
          label: (filters[key] ? "✓ " : "○ ") + label,
          value: key,
        })), (choice) => filters[choice.value], (key) => {
          filters[key] = !filters[key];
          renderFidelity();
        }, "Toggle fidelity filters"),
        el("div", { class: "readout" }, [
          stat(result.rate.toExponential(0), "errors per incorporated base"),
          stat(result.perBillion < 1
            ? result.perBillion.toFixed(1)
            : Math.round(result.perBillion).toLocaleString("en-GB"),
          "errors per billion bases"),
        ])
      );
      explanation.className = result.rate <= 1e-10
        ? "callout callout-good" : "callout callout-bad";
      explanation.innerHTML =
        result.rate <= 1e-10
          ? "<strong>No single enzyme is this accurate.</strong> The observed rate emerges because " +
            "three imperfect filters act in series and their error fractions multiply."
          : "<strong>Removing one filter is multiplicative, not additive.</strong> The remaining " +
            "steps still work, but they now receive far more errors than the complete cascade.";
      railHost.replaceChildren(causalRail(el, [
        { key: "you changed", value: filterRows.filter(([key]) => !filters[key]).length
            ? "removed a fidelity filter" : "kept all three filters" },
        { key: "mechanism", value: "independent error fractions multiply" },
        { key: "observable", value: result.rate.toExponential(0) + " errors/base" },
      ]));
    }

    function render() {
      renderTabs();
      if (mode === "fork") renderFork();
      else if (mode === "origins") renderOrigins();
      else renderFidelity();
    }

    predict(body, {
      widget: "replication-fork-lab",
      question:
        "The upper parental template runs <strong>5′→3′ from left to right</strong>, and the " +
        "fork is moving right. How must the new strand copied from that template be made?",
      hint: "Polymerase can add only to a 3′ end; every new piece therefore grows 5′→3′.",
      options: [
        { label: "Continuously toward the fork" },
        { label: "In fragments away from the fork", correct: true },
        { label: "Continuously away from the fork" },
        { label: "In fragments toward the fork" },
      ],
    }, () => {
      instrument.hidden = false;
      render();
    });

    instrument.append(tabHost, visual, controls, railHost, explanation);
    body.append(instrument);
  });

  function linkageModel(distanceCm, phase, offspring) {
    const morgans = distanceCm / 100;
    const recombination = 0.5 * (1 - Math.exp(-2 * morgans));
    const parental = phase === "coupling" ? ["AB", "ab"] : ["Ab", "aB"];
    const recombinant = phase === "coupling" ? ["Ab", "aB"] : ["AB", "ab"];
    const order = ["AB", "Ab", "aB", "ab"];
    // Integerise the biological event first, then split each reciprocal pair.
    // Rounding all four classes independently can report a theoretical 1.0%
    // while drawing zero recombinant offspring in a family of 100.
    const recombinantTotal = Math.round(recombination * offspring);
    const parentalTotal = offspring - recombinantTotal;
    const countsByName = {};
    parental.forEach((name, index) => {
      countsByName[name] = index === 0
        ? Math.ceil(parentalTotal / 2)
        : Math.floor(parentalTotal / 2);
    });
    recombinant.forEach((name, index) => {
      countsByName[name] = index === 0
        ? Math.ceil(recombinantTotal / 2)
        : Math.floor(recombinantTotal / 2);
    });

    return {
      recombination,
      observedRecombination: recombinantTotal / offspring,
      parental,
      recombinant,
      counts: Object.fromEntries(order.map((name) => [name, countsByName[name]])),
    };
  }
  models.linkage = linkageModel;

  function reciprocalGamete(label) {
    return label.split("").map((letter) =>
      letter === letter.toUpperCase() ? letter.toLowerCase() : letter.toUpperCase()
    ).join("");
  }

  function reciprocalPairKey(label) {
    return [label, reciprocalGamete(label)].sort().join("|");
  }

  function threePointLinkageModel(counts) {
    const genes = ["A", "B", "C"];
    const labels = ["ABC", "ABc", "AbC", "Abc", "aBC", "aBc", "abC", "abc"];
    const supplied = Object.keys(counts || {}).sort();
    if (supplied.length !== labels.length || supplied.some((label, index) => label !== labels.slice().sort()[index])) {
      throw new Error("A three-point testcross needs all eight A/B/C gamete classes");
    }
    labels.forEach((label) => {
      if (!Number.isFinite(counts[label]) || counts[label] < 0) {
        throw new Error("Three-point testcross counts must be finite and non-negative");
      }
    });

    const total = labels.reduce((sum, label) => sum + counts[label], 0);
    if (!total) throw new Error("A three-point testcross needs at least one offspring");

    const pairMap = {};
    labels.forEach((label) => {
      const key = reciprocalPairKey(label);
      if (!pairMap[key]) pairMap[key] = { key, labels: key.split("|"), total: 0 };
      pairMap[key].total += counts[label];
    });
    const pairs = Object.values(pairMap).sort((left, right) => left.key.localeCompare(right.key));
    const parentalPair = pairs.reduce((best, pair) => pair.total > best.total ? pair : best);
    const dcoPair = pairs.reduce((best, pair) => pair.total < best.total ? pair : best);

    function hamming(left, right) {
      return left.split("").reduce((distance, letter, index) =>
        distance + (letter === right[index] ? 0 : 1), 0);
    }

    const middleCandidates = dcoPair.labels.map((dco) => {
      const closestParent = parentalPair.labels.reduce((best, parent) =>
        hamming(dco, parent) < hamming(dco, best) ? parent : best
      );
      const differences = genes.map((_, index) => index)
        .filter((index) => dco[index] !== closestParent[index]);
      return differences.length === 1 ? differences[0] : -1;
    });
    if (middleCandidates.some((index) => index < 0) ||
        middleCandidates.some((index) => index !== middleCandidates[0])) {
      throw new Error("The rarest reciprocal pair does not identify one middle locus");
    }

    const middleIndex = middleCandidates[0];
    const flankIndexes = [0, 1, 2].filter((index) => index !== middleIndex);
    const orderIndexes = [flankIndexes[0], middleIndex, flankIndexes[1]];
    const order = orderIndexes.map((index) => genes[index]);
    const parentalReference = parentalPair.labels[0];
    const alleleState = (label, index) => label[index] === label[index].toUpperCase();
    const parentalRelationship = (leftIndex, rightIndex) =>
      alleleState(parentalReference, leftIndex) === alleleState(parentalReference, rightIndex);
    const recombinantIn = (label, leftIndex, rightIndex) =>
      (alleleState(label, leftIndex) === alleleState(label, rightIndex)) !==
        parentalRelationship(leftIndex, rightIndex);

    const intervalIndexes = [
      [orderIndexes[0], orderIndexes[1]],
      [orderIndexes[1], orderIndexes[2]],
    ];
    const intervals = intervalIndexes.map(([leftIndex, rightIndex]) => {
      const recombinantLabels = labels.filter((label) => recombinantIn(label, leftIndex, rightIndex));
      const recombinantCount = recombinantLabels.reduce((sum, label) => sum + counts[label], 0);
      const recombination = recombinantCount / total;
      return {
        genes: [genes[leftIndex], genes[rightIndex]],
        label: genes[leftIndex] + "–" + genes[rightIndex],
        recombinantLabels,
        recombinantCount,
        singleCrossoverCount: recombinantCount - dcoPair.total,
        recombination,
        centimorgans: recombination * 100,
      };
    });

    const outerIndexes = [orderIndexes[0], orderIndexes[2]];
    const outerRecombinantLabels = labels.filter((label) =>
      recombinantIn(label, outerIndexes[0], outerIndexes[1])
    );
    const outerRecombinantCount = outerRecombinantLabels.reduce((sum, label) => sum + counts[label], 0);
    const outerRecombination = outerRecombinantCount / total;
    const expectedDco = intervals[0].recombination * intervals[1].recombination * total;
    const coefficientOfCoincidence = expectedDco ? dcoPair.total / expectedDco : 0;
    const interference = 1 - coefficientOfCoincidence;

    const roleByLabel = {};
    labels.forEach((label) => {
      const key = reciprocalPairKey(label);
      if (key === parentalPair.key) roleByLabel[label] = "parental";
      else if (key === dcoPair.key) roleByLabel[label] = "double crossover";
      else if (recombinantIn(label, intervalIndexes[0][0], intervalIndexes[0][1])) {
        roleByLabel[label] = "single crossover in " + intervals[0].label;
      } else {
        roleByLabel[label] = "single crossover in " + intervals[1].label;
      }
    });

    return {
      labels,
      total,
      pairs,
      parentalPair,
      dcoPair,
      middleGene: genes[middleIndex],
      order,
      intervals,
      roleByLabel,
      outerGenes: outerIndexes.map((index) => genes[index]),
      outerRecombinantLabels,
      outerRecombinantCount,
      outerRecombination,
      additiveDistance: intervals.reduce((sum, interval) => sum + interval.centimorgans, 0),
      outerShortfall: intervals.reduce((sum, interval) => sum + interval.recombination, 0) - outerRecombination,
      expectedDco,
      coefficientOfCoincidence,
      interference,
    };
  }
  models.threePointLinkage = threePointLinkageModel;

  coverage["linkage-transfer-challenge"] = {
    "ch14-o4": "A changed-context three-point testcross requires the learner to infer parental and double-crossover pairs, identify the middle gene, calculate both interval distances, coefficient of coincidence and interference, and explain the hidden outer-marker double crossovers across three independent fixtures.",
  };

  function makeThreePointFixture(order, parentalLabel, pairCounts) {
    const genes = ["A", "B", "C"];
    const parental = Object.fromEntries(genes.map((gene, index) => [gene,
      parentalLabel[index] === parentalLabel[index].toUpperCase()
    ]));
    const reciprocal = Object.fromEntries(genes.map((gene) => [gene, !parental[gene]]));
    const gamete = (states) => genes.map((gene) =>
      states[gene] ? gene : gene.toLowerCase()
    ).join("");
    const pair = (leftStates, rightStates, values) => ({
      [gamete(leftStates)]: values[0],
      [gamete(rightStates)]: values[1],
    });
    const [left, middle, right] = order;
    const singleLeft = Object.assign({}, reciprocal, { [left]: parental[left] });
    const singleLeftReciprocal = Object.assign({}, parental, { [left]: reciprocal[left] });
    const singleRight = Object.assign({}, parental, { [right]: reciprocal[right] });
    const singleRightReciprocal = Object.assign({}, reciprocal, { [right]: parental[right] });
    const double = Object.assign({}, parental, { [middle]: reciprocal[middle] });
    const doubleReciprocal = Object.assign({}, reciprocal, { [middle]: parental[middle] });
    return Object.assign(
      {},
      pair(parental, reciprocal, pairCounts.parental),
      pair(singleLeft, singleLeftReciprocal, pairCounts.left),
      pair(singleRight, singleRightReciprocal, pairCounts.right),
      pair(double, doubleReciprocal, pairCounts.double)
    );
  }

  const THREE_POINT_FIXTURES = [
    {
      id: "dataset-1",
      counts: makeThreePointFixture(["A", "B", "C"], "ABC", {
        parental: [421, 407], left: [39, 35], right: [49, 45], double: [2, 2],
      }),
    },
    {
      id: "dataset-2",
      counts: makeThreePointFixture(["C", "A", "B"], "AbC", {
        parental: [349, 341], left: [61, 58], right: [91, 86], double: [7, 7],
      }),
    },
    {
      id: "dataset-3",
      counts: makeThreePointFixture(["B", "C", "A"], "ABc", {
        parental: [376, 364], left: [59, 55], right: [67, 63], double: [8, 8],
      }),
    },
  ];

  function linkageCurveSvg(distanceCm, recombination) {
    const points = [];
    for (let distance = 0; distance <= 120; distance += 2) {
      const rf = linkageModel(distance, "coupling", 1000).recombination;
      const x = 40 + (distance / 120) * 430;
      const y = 154 - (rf / 0.5) * 118;
      points.push((distance ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1));
    }
    const dotX = 40 + (distanceCm / 120) * 430;
    const dotY = 154 - (recombination / 0.5) * 118;
    const labelOnRight = dotX > 360;
    const labelX = labelOnRight ? dotX - 10 : dotX + 9;
    return (
      '<svg class="lab-diagram linkage-curve" viewBox="0 0 500 184" role="img" ' +
      'aria-label="Recombination fraction approaches but never exceeds fifty per cent as map distance grows.">' +
        '<path class="lab-grid-line" d="M40 36 L470 36"/>' +
        '<path class="lab-axis" d="M40 154 L470 154 M40 30 L40 154"/>' +
        '<path class="lab-data-line" d="' + points.join(" ") + '"/>' +
        '<circle class="lab-data-point" cx="' + dotX.toFixed(1) + '" cy="' +
          dotY.toFixed(1) + '" r="6"/>' +
        '<text class="lab-svg-label" x="44" y="28">50% ceiling</text>' +
        '<text class="lab-svg-label" x="40" y="176">0 cM</text>' +
        '<text class="lab-svg-label" x="468" y="176" text-anchor="end">120 cM</text>' +
        '<text class="lab-svg-kicker" x="' + labelX.toFixed(1) + '" y="' +
          Math.max(dotY - 10, 18).toFixed(1) + '"' +
          (labelOnRight ? ' text-anchor="end"' : "") + '>' +
          (recombination * 100).toFixed(1) + '% recombinant</text>' +
      '</svg>'
    );
  }

  define("linkage-map-lab", function (api) {
    const { body, el, stat, predict } = api;
    let phase = "coupling";
    let distance = 21;
    let offspring = 1000;
    let fixture = 0;

    const symbolSets = [
      { A: "A", a: "a", B: "B", b: "b", name: "A/a and B/b" },
      { A: "R", a: "r", B: "W", b: "w", name: "R/r and W/w" },
    ];

    const instrument = el("div", { class: "hero-lab", hidden: true });
    const visual = el("div", { class: "lab-visual" });
    const controls = el("div", { class: "lab-controls" });
    const railHost = el("div");
    const explanation = el("div", { class: "callout", "aria-live": "polite" });

    function displayName(name) {
      const symbols = symbolSets[fixture];
      return name.split("").map((letter) => symbols[letter]).join("");
    }

    function renderChromosomes(result) {
      const haplotypes = phase === "coupling"
        ? [["A", "B"], ["a", "b"]]
        : [["A", "b"], ["a", "B"]];
      const crossoverOpacity = Math.min(1, result.recombination * 2 + 0.08);
      return el("div", { class: "linkage-chromosomes",
        role: "img",
        "aria-label": "Homologous chromosomes in " + phase + " phase: " +
          displayName(haplotypes[0].join("")) + " and " +
          displayName(haplotypes[1].join("")) }, [
        el("div", { class: "chromosome-map" }, [
          el("span", { class: "locus-marker locus-one", text: symbolSets[fixture][haplotypes[0][0]] }),
          el("span", { class: "locus-marker locus-two", text: symbolSets[fixture][haplotypes[0][1]] }),
        ]),
        el("div", { class: "crossover-mark", style: "opacity:" + crossoverOpacity.toFixed(2),
          text: "×", "aria-label": "Crossovers become more likely as map distance increases" }),
        el("div", { class: "chromosome-map homolog-two" }, [
          el("span", { class: "locus-marker locus-one", text: symbolSets[fixture][haplotypes[1][0]] }),
          el("span", { class: "locus-marker locus-two", text: symbolSets[fixture][haplotypes[1][1]] }),
        ]),
      ]);
    }

    function renderBars(result) {
      const max = Math.max(...Object.values(result.counts));
      const order = ["AB", "Ab", "aB", "ab"];
      const bars = el("div", {
        class: "gamete-bars",
        role: "img",
        "aria-label": "Integerised testcross offspring counts in " + phase + " phase: " +
          order.map((name) => displayName(name) + " " + result.counts[name]).join(", "),
      });
      order.forEach((name) => {
        const isParental = result.parental.includes(name);
        const count = result.counts[name];
        bars.append(el("div", { class: "gamete-row" }, [
          el("strong", { class: "gamete-name", text: displayName(name) }),
          el("div", { class: "gamete-track" }, [
            el("span", {
              class: "gamete-fill " + (isParental ? "is-parental" : "is-recombinant"),
              style: "width:" + ((count / max) * 100).toFixed(1) + "%",
            }),
          ]),
          el("span", { class: "gamete-count", text: count.toLocaleString("en-GB") }),
          el("span", {
            class: "gamete-kind",
            text: isParental ? "parental" : "recombinant",
          }),
        ]));
      });
      return bars;
    }

    function render() {
      const result = linkageModel(distance, phase, offspring);
      visual.replaceChildren(
        renderChromosomes(result),
        renderBars(result),
        el("div", { html: linkageCurveSvg(distance, result.recombination) })
      );

      const distanceInput = el("input", {
        type: "range", min: "0", max: "120", step: "1", value: String(distance),
      });
      const offspringInput = el("input", {
        type: "range", min: "100", max: "2000", step: "100", value: String(offspring),
      });
      const distanceVal = el("span", { class: "val", text: distance + " cM" });
      const offspringVal = el("span", {
        class: "val", text: offspring.toLocaleString("en-GB"),
      });
      bindRerenderingRange(distanceInput, "linkage-distance", (value) => {
        distance = Number(value);
        render();
      });
      bindRerenderingRange(offspringInput, "linkage-offspring", (value) => {
        offspring = Number(value);
        render();
      });

      controls.replaceChildren(
        el("div", { class: "lab-control-block" }, [
          el("span", { class: "lab-control-label", text: "Haplotype phase" }),
          choiceRow(el, [
            { label: displayName("AB") + " / " + displayName("ab"), value: "coupling" },
            { label: displayName("Ab") + " / " + displayName("aB"), value: "repulsion" },
          ], phase, (next) => {
            phase = next;
            render();
          }, "Haplotype phase"),
        ]),
        fieldWithRange(el, "True map distance", distanceVal, distanceInput),
        fieldWithRange(el, "Testcross offspring", offspringVal, offspringInput),
        el("div", { class: "btn-row" }, [
          el("button", {
            class: "btn",
            type: "button",
            text: "Change trait symbols",
            onclick: () => {
              fixture = fixture ? 0 : 1;
              render();
            },
          }),
        ]),
        el("div", { class: "readout" }, [
          stat((result.observedRecombination * 100).toFixed(1) + "%",
            "recombination in these offspring"),
          stat(result.parental.map(displayName).join(" + "), "largest classes"),
        ])
      );

      const distant = distance >= 50;
      explanation.className = "callout" + (distant ? " callout-bad" : "");
      explanation.innerHTML = distant
        ? "<strong>Distance and recombination fraction have separated.</strong> Multiple " +
          "crossovers can restore the parental arrangement, so an arbitrarily long interval " +
          "approaches 50% recombinant rather than exceeding it. The curve uses Haldane's " +
          "no-interference model."
        : "<strong>Read the offspring backwards.</strong> The two largest classes preserve the " +
          "parental phase; the two smaller classes require a crossover. At short distances, " +
          "recombination percentage is close to centimorgans because multiple crossovers are rare.";

      railHost.replaceChildren(causalRail(el, [
        { key: "you changed", value: distance + " cM, " + phase + " phase" },
        { key: "mechanism", value: "crossovers exchange homologous chromatids" },
        { key: "observable", value: (result.observedRecombination * 100).toFixed(1) +
            "% recombinant offspring" },
      ]));
    }

    predict(body, {
      widget: "linkage-map-lab",
      question:
        "A testcross gives <code>AB: 421</code>, <code>ab: 409</code>, " +
        "<code>Ab: 88</code>, and <code>aB: 82</code>. Which haplotypes were together " +
        "in the heterozygous parent's chromosomes?",
      hint: "A crossover is rarer than no crossover for linked loci.",
      options: [
        { label: "AB / ab", correct: true },
        { label: "Ab / aB" },
        { label: "AA / bb" },
        { label: "The phase is unknowable" },
      ],
    }, () => {
      instrument.hidden = false;
      render();
    });

    instrument.append(visual, controls, railHost, explanation);
    body.append(instrument);
  });

  define("linkage-transfer-challenge", function (api) {
    const { body, el, stat, Ledger } = api;
    let fixtureIndex = 0;

    const instrument = el("div", { class: "hero-lab transfer-lab" });

    function near(value, target, tolerance) {
      return Number.isFinite(value) && Math.abs(value - target) <= tolerance;
    }

    function renderFixture() {
      const fixture = THREE_POINT_FIXTURES[fixtureIndex];
      const result = threePointLinkageModel(fixture.counts);
      const answer = { parental: null, dco: null, middle: null, mechanism: null };
      const firstChecks = { classification: true, calculation: true, explanation: true };
      const maxCount = Math.max(...result.labels.map((label) => fixture.counts[label]));
      const progress = el("ol", { class: "transfer-progress", "aria-label": "Challenge progress" }, [
        el("li", { class: "is-current", text: "1 · classify", "aria-current": "step", "aria-label": "Step 1, classify, current" }),
        el("li", { text: "2 · calculate", "aria-label": "Step 2, calculate, not started" }),
        el("li", { text: "3 · explain", "aria-label": "Step 3, explain, not started" }),
      ]);
      const progressSteps = progress.querySelectorAll("li");
      const classificationFeedback = el("div", { class: "transfer-feedback", "aria-live": "polite" });
      const calculationFeedback = el("div", { class: "transfer-feedback", "aria-live": "polite" });
      const roleCells = {};
      const rows = el("tbody");

      result.labels.forEach((label) => {
        const count = fixture.counts[label];
        const role = el("span", { class: "transfer-role", text: "unclassified" });
        roleCells[label] = role;
        rows.append(el("tr", { "data-gamete": label }, [
          el("th", { scope: "row" }, [el("code", { text: label })]),
          el("td", { class: "text-end", text: count.toLocaleString("en-GB") }),
          el("td", {}, [
            el("span", { class: "transfer-count-track", "aria-hidden": "true" }, [
              el("span", {
                class: "transfer-count-fill",
                style: "width:" + ((count / maxCount) * 100).toFixed(1) + "%",
              }),
            ]),
          ]),
          el("td", {}, [role]),
        ]));
      });

      const table = el("div", { class: "transfer-table-wrap" }, [
        el("table", { class: "transfer-table" }, [
          el("caption", { text: "Constructed teaching dataset · " + result.total.toLocaleString("en-GB") + " testcross offspring" }),
          el("thead", {}, [el("tr", {}, [
            el("th", { scope: "col", text: "Gamete" }),
            el("th", { scope: "col", class: "text-end", text: "Count" }),
            el("th", { scope: "col", text: "Frequency" }),
            el("th", { scope: "col", text: "Evidence" }),
          ])]),
          rows,
        ]),
      ]);

      function selectionGroup(title, key, options, label) {
        const row = el("div", { class: "lab-choice-row", role: "group", "aria-label": label });
        options.forEach((option) => {
          const button = el("button", {
            class: "btn lab-choice",
            type: "button",
            text: option.label,
            "aria-pressed": "false",
            "data-choice": option.value,
          });
          button.addEventListener("click", () => {
            answer[key] = option.value;
            row.querySelectorAll("button").forEach((candidate) =>
              setButtonState(candidate, candidate === button)
            );
          });
          row.append(button);
        });
        return el("div", { class: "lab-control-block" }, [
          el("span", { class: "lab-control-label", text: title }),
          row,
        ]);
      }

      const pairOptions = result.pairs.map((pair) => ({
        label: pair.labels.join(" + "), value: pair.key,
      }));
      const classification = el("div", { class: "transfer-stage" }, [
        el("p", { class: "transfer-prompt", text:
          "Without copying the worked example, classify the reciprocal pairs and infer the middle locus."
        }),
        selectionGroup("Parental pair", "parental", pairOptions, "Choose the parental reciprocal pair"),
        selectionGroup("Double-crossover pair", "dco", pairOptions, "Choose the double-crossover reciprocal pair"),
        selectionGroup("Middle locus", "middle", ["A", "B", "C"].map((gene) => ({
          label: gene, value: gene,
        })), "Choose the middle locus"),
      ]);
      const checkClassification = el("button", {
        class: "btn btn-primary",
        type: "button",
        text: "Check classification",
        "data-action": "check-classification",
      });
      classification.append(el("div", { class: "btn-row" }, [checkClassification]), classificationFeedback);

      function numberField(label, suffix, key, step) {
        const input = el("input", {
          class: "transfer-answer",
          type: "number",
          inputmode: "decimal",
          step: step,
          min: "0",
          "data-answer": key,
          "aria-label": label,
        });
        return {
          input,
          field: el("label", { class: "transfer-field" }, [
            el("span", { text: label }),
            el("span", { class: "transfer-input-row" }, [
              input,
              el("span", { class: "transfer-unit", text: suffix }),
            ]),
          ]),
        };
      }

      const firstInterval = numberField(result.intervals[0].label + " distance", "cM", "interval-1", "0.1");
      const secondInterval = numberField(result.intervals[1].label + " distance", "cM", "interval-2", "0.1");
      const coc = numberField("Coefficient of coincidence", "0–1", "coc", "0.01");
      const interference = numberField("Interference", "0–1", "interference", "0.01");
      const inputs = [firstInterval.input, secondInterval.input, coc.input, interference.input];
      const checkMap = el("button", {
        class: "btn btn-primary",
        type: "button",
        text: "Check my map",
        "data-action": "check-map",
      });
      const calculation = el("div", { class: "transfer-stage", hidden: true }, [
        el("p", { class: "transfer-prompt", text:
          "Now calculate both intervals, the coefficient of coincidence, and interference. Enter distances to one decimal place and proportions to two decimals."
        }),
        el("div", { class: "transfer-answer-grid" }, [
          firstInterval.field, secondInterval.field, coc.field, interference.field,
        ]),
        el("div", { class: "btn-row" }, [checkMap]),
        calculationFeedback,
      ]);

      const explanationFeedback = el("div", { class: "transfer-feedback", "aria-live": "polite" });
      const explanationOptions = [
        {
          value: "restored",
          label: "Each DCO is recombinant in both adjacent intervals but restores the parental outer-marker arrangement.",
          correct: true,
          feedback: "",
        },
        {
          value: "outer-recombinant",
          label: "Each DCO is counted once as an outer-marker recombinant.",
          correct: false,
          feedback: "A double crossover switches the outer-marker association twice, so the outer pair looks parental rather than recombinant.",
        },
        {
          value: "single-cancel",
          label: "The two single-crossover classes cancel one another in the outer pair.",
          correct: false,
          feedback: "A single crossover in either adjacent interval changes the outer-marker association and remains visible to the outer pair.",
        },
        {
          value: "sampling",
          label: "The shortfall is only rounding noise from a finite family.",
          correct: false,
          feedback: "The displayed shortfall is deterministic from the eight class counts: it equals exactly twice the observed DCO fraction.",
        },
      ];
      const explanationChoices = el("div", {
        class: "transfer-option-grid",
        role: "group",
        "aria-label": "Choose why double crossovers are hidden from the outer markers",
      });
      explanationOptions.forEach((option) => {
        const button = el("button", {
          class: "btn transfer-option",
          type: "button",
          text: option.label,
          "aria-pressed": "false",
          "data-mechanism": option.value,
        });
        button.addEventListener("click", () => {
          answer.mechanism = option;
          explanationChoices.querySelectorAll("button").forEach((candidate) =>
            setButtonState(candidate, candidate === button)
          );
        });
        explanationChoices.append(button);
      });
      const checkExplanation = el("button", {
        class: "btn btn-primary",
        type: "button",
        text: "Check the mechanism",
        "data-action": "check-outer-marker-mechanism",
      });
      const explanation = el("div", { class: "transfer-stage", hidden: true }, [
        el("p", { class: "transfer-prompt", text:
          "The adjacent intervals add to " + result.additiveDistance.toFixed(1) +
          " cM, but the outer markers show only " + (result.outerRecombination * 100).toFixed(1) +
          "% recombination. What creates the exact shortfall?"
        }),
        explanationChoices,
        el("div", { class: "btn-row" }, [checkExplanation]),
        explanationFeedback,
      ]);

      const solution = el("div", { class: "transfer-solution", hidden: true, "aria-live": "polite" });

      function feedback(host, good, messages) {
        host.setAttribute("role", good ? "status" : "alert");
        host.replaceChildren(el("div", {
          class: "callout " + (good ? "callout-good" : "callout-bad"),
        }, [
          el("strong", { text: good ? "Classification holds. " : "Revise this inference. " }),
          el("span", { text: messages.join(" ") }),
        ]));
      }

      checkClassification.addEventListener("click", () => {
        if (!answer.parental || !answer.dco || !answer.middle) {
          feedback(classificationFeedback, false, ["Make all three calls before checking."]);
          return;
        }
        const messages = [];
        if (answer.parental !== result.parentalPair.key) {
          if (answer.parental === result.dcoPair.key) {
            messages.push("You reversed the parental and double-crossover pairs: no crossover should be much more common than two crossovers.");
          } else {
            messages.push("The parental pair must contain the two most abundant reciprocal classes because most gametes experience no crossover in either interval.");
          }
        }
        if (answer.dco !== result.dcoPair.key) {
          if (answer.dco === result.parentalPair.key) {
            messages.push("The most abundant pair cannot be the double crossover; look for the reciprocal pair produced by two rare exchanges.");
          } else {
            messages.push("The double-crossover pair is the least abundant reciprocal pair, not merely a pair below the mean.");
          }
        }
        if (answer.middle !== result.middleGene) {
          messages.push("Compare each proposed DCO class with its closest parental class: exactly one locus changes case, and that locus must be in the middle.");
        }
        if (firstChecks.classification) {
          Ledger?.record("linkage-transfer-challenge", messages.length === 0);
          firstChecks.classification = false;
        }
        if (messages.length) {
          feedback(classificationFeedback, false, messages);
          return;
        }

        feedback(classificationFeedback, true, [
          result.parentalPair.labels.join(" + ") + " are the largest classes; " +
          result.dcoPair.labels.join(" + ") + " are the smallest, and only " +
          result.middleGene + " switches relative to the matching parental class."
        ]);
        classification.querySelectorAll("button").forEach((button) => { button.disabled = true; });
        checkClassification.disabled = true;
        result.labels.forEach((label) => {
          const row = rows.querySelector('[data-gamete="' + label + '"]');
          const role = result.roleByLabel[label];
          roleCells[label].textContent = role;
          row.classList.add(role === "parental" ? "is-parental" :
            role === "double crossover" ? "is-double" : "is-single");
        });
        progressSteps[0].className = "is-complete";
        progressSteps[0].removeAttribute("aria-current");
        progressSteps[0].setAttribute("aria-label", "Step 1, classify, complete");
        progressSteps[1].className = "is-current";
        progressSteps[1].setAttribute("aria-current", "step");
        progressSteps[1].setAttribute("aria-label", "Step 2, calculate, current");
        calculation.hidden = false;
        firstInterval.input.focus({ preventScroll: true });
      });

      function markInput(input, correct) {
        input.classList.toggle("is-correct", correct);
        input.classList.toggle("is-wrong", !correct);
        input.setAttribute("aria-invalid", correct ? "false" : "true");
      }

      function solvedMap() {
        const map = el("div", {
          class: "transfer-map",
          role: "img",
          "aria-label": "Solved genetic map: " + result.order[0] + " to " + result.order[1] +
            " is " + result.intervals[0].centimorgans.toFixed(1) + " centimorgans; " +
            result.order[1] + " to " + result.order[2] + " is " +
            result.intervals[1].centimorgans.toFixed(1) + " centimorgans.",
        });
        result.order.forEach((gene, index) => {
          map.append(el("span", { class: "transfer-gene", text: gene }));
          if (index < result.intervals.length) {
            map.append(el("span", { class: "transfer-interval" }, [
              el("span", { class: "transfer-map-line", "aria-hidden": "true" }),
              el("strong", { text: result.intervals[index].centimorgans.toFixed(1) + " cM" }),
            ]));
          }
        });

        const parentalExample = result.parentalPair.labels[0];
        const matchingDco = result.dcoPair.labels.reduce((best, label) =>
          label.split("").filter((letter, index) => letter !== parentalExample[index]).length <
          best.split("").filter((letter, index) => letter !== parentalExample[index]).length ? label : best
        );
        const mechanism = el("div", {
          class: "transfer-mechanism",
          role: "img",
          "aria-label": "A double crossover converts parental " + parentalExample + " to " +
            matchingDco + " by switching only the middle locus " + result.middleGene + ".",
        }, [
          el("code", { text: parentalExample }),
          el("span", { text: "two crossovers flip only " + result.middleGene }),
          el("code", { text: matchingDco }),
        ]);

        return el("div", {}, [
          map,
          mechanism,
          el("div", { class: "readout" }, [
            stat(result.additiveDistance.toFixed(1) + " cM", "additive three-point map"),
            stat((result.outerRecombination * 100).toFixed(1) + "%", "observed outer-pair RF"),
            stat(result.coefficientOfCoincidence.toFixed(2), "coefficient of coincidence"),
            stat(result.interference.toFixed(2), "interference"),
          ]),
          el("div", { class: "callout callout-good" }, [
            el("strong", { text: "The map predicts the data. " }),
            el("span", { text:
              "The two intervals add to " + result.additiveDistance.toFixed(1) + " cM, but the outer markers report only " +
              (result.outerRecombination * 100).toFixed(1) + "% recombinant. The " +
              (result.outerShortfall * 100).toFixed(1) + "-point shortfall is exactly twice the " +
              result.dcoPair.total + " double crossovers divided by " + result.total.toLocaleString("en-GB") +
              ", because each double crossover restores the parental outer-marker arrangement."
            }),
          ]),
        ]);
      }

      function showSolution() {
        progressSteps[2].className = "is-complete";
        progressSteps[2].removeAttribute("aria-current");
        progressSteps[2].setAttribute("aria-label", "Step 3, explain, complete");
        solution.hidden = false;
        solution.replaceChildren(solvedMap());
        const next = el("button", {
          class: "btn",
          type: "button",
          text: fixtureIndex === THREE_POINT_FIXTURES.length - 1 ? "Restart with dataset 1" : "Try another unseen dataset",
          "data-action": "next-dataset",
        });
        next.addEventListener("click", () => {
          fixtureIndex = (fixtureIndex + 1) % THREE_POINT_FIXTURES.length;
          renderFixture();
          instrument.querySelector('[role="group"] button')?.focus({ preventScroll: true });
        });
        solution.append(el("div", { class: "btn-row transfer-next" }, [next]));
        next.focus({ preventScroll: true });
      }

      checkExplanation.addEventListener("click", () => {
        if (!answer.mechanism) {
          explanationFeedback.setAttribute("role", "alert");
          explanationFeedback.replaceChildren(el("div", {
            class: "callout callout-bad",
            text: "Choose a mechanistic explanation before checking it.",
          }));
          return;
        }
        if (firstChecks.explanation) {
          Ledger?.record("linkage-transfer-challenge", answer.mechanism.correct);
          firstChecks.explanation = false;
        }
        if (!answer.mechanism.correct) {
          explanationFeedback.setAttribute("role", "alert");
          explanationFeedback.replaceChildren(el("div", { class: "callout callout-bad" }, [
            el("strong", { text: "That mechanism cannot generate the observed shortfall. " }),
            el("span", { text: answer.mechanism.feedback }),
          ]));
          return;
        }
        explanationChoices.querySelectorAll("button").forEach((button) => { button.disabled = true; });
        checkExplanation.disabled = true;
        explanationFeedback.setAttribute("role", "status");
        explanationFeedback.replaceChildren(el("div", { class: "callout callout-good" }, [
          el("strong", { text: "The mechanism closes the map. " }),
          el("span", { text:
            "Each DCO contributes to both adjacent intervals but zero outer-marker recombinants, so the additive-minus-outer shortfall is twice the DCO fraction."
          }),
        ]));
        showSolution();
      });

      checkMap.addEventListener("click", () => {
        const values = inputs.map((input) => Number(input.value));
        const empty = inputs.map((input) => input.value.trim() === "");
        if (empty.some(Boolean)) {
          inputs.forEach((input, index) => {
            if (empty[index]) markInput(input, false);
          });
          calculationFeedback.setAttribute("role", "alert");
          calculationFeedback.replaceChildren(el("div", {
            class: "callout callout-bad",
            text: "Complete all four calculations before checking the map.",
          }));
          return;
        }

        const targets = [
          result.intervals[0].centimorgans,
          result.intervals[1].centimorgans,
          result.coefficientOfCoincidence,
          result.interference,
        ];
        const tolerances = [0.051, 0.051, 0.015, 0.015];
        const correct = values.map((value, index) => near(value, targets[index], tolerances[index]));
        inputs.forEach((input, index) => markInput(input, correct[index]));
        if (firstChecks.calculation) {
          Ledger?.record("linkage-transfer-challenge", correct.every(Boolean));
          firstChecks.calculation = false;
        }

        if (correct.every(Boolean)) {
          inputs.forEach((input) => { input.disabled = true; });
          checkMap.disabled = true;
          calculationFeedback.setAttribute("role", "status");
          calculationFeedback.replaceChildren(el("div", {
            class: "callout callout-good",
            html: "<strong>The map holds.</strong> Your inferred order and calculations reproduce all eight offspring classes. Now explain the outer-marker discrepancy.",
          }));
          progressSteps[1].className = "is-complete";
          progressSteps[1].removeAttribute("aria-current");
          progressSteps[1].setAttribute("aria-label", "Step 2, calculate, complete");
          progressSteps[2].className = "is-current";
          progressSteps[2].setAttribute("aria-current", "step");
          progressSteps[2].setAttribute("aria-label", "Step 3, explain, current");
          explanation.hidden = false;
          explanationChoices.querySelector("button")?.focus({ preventScroll: true });
          return;
        }

        const messages = [];
        const swapped = near(values[0], targets[1], tolerances[0]) &&
          near(values[1], targets[0], tolerances[1]) && targets[0] !== targets[1];
        if (swapped) {
          messages.push("You found both interval values but attached them to the opposite gene pairs.");
        } else {
          [0, 1].forEach((index) => {
            if (correct[index]) return;
            const interval = result.intervals[index];
            const withoutDco = (interval.singleCrossoverCount / result.total) * 100;
            if (near(values[index], withoutDco, 0.051)) {
              messages.push(interval.label + " omits the double-crossover progeny; those offspring experienced a crossover in both intervals.");
            } else if (near(values[index] * 100, interval.centimorgans, 0.051)) {
              messages.push(interval.label + " is entered as a fraction, but this field asks for centimorgans.");
            } else {
              messages.push("For " + interval.label + ", count its single crossovers plus every double crossover, divide by " + result.total.toLocaleString("en-GB") + ", then convert to cM.");
            }
          });
        }
        if (!correct[2]) {
          if (near(values[2], result.expectedDco, 0.051)) {
            messages.push("You entered the expected DCO count; the coefficient of coincidence is observed DCO divided by that expected count.");
          } else if (near(values[2] / 100, result.coefficientOfCoincidence, 0.015)) {
            messages.push("Enter the coefficient as a proportion, not a percentage.");
          } else {
            messages.push("Coefficient of coincidence = observed DCO ÷ expected DCO, where expected DCO = r₁ × r₂ × N.");
          }
        }
        if (!correct[3]) {
          if (near(values[3], result.coefficientOfCoincidence, 0.015)) {
            messages.push("You copied the coefficient of coincidence; interference is 1 minus that coefficient.");
          } else if (near(values[3] / 100, result.interference, 0.015)) {
            messages.push("Enter interference as a proportion, not a percentage.");
          } else {
            messages.push("Interference is the fraction of expected double crossovers that were suppressed: 1 − coefficient of coincidence.");
          }
        }
        calculationFeedback.setAttribute("role", "alert");
        calculationFeedback.replaceChildren(el("div", { class: "callout callout-bad" }, [
          el("strong", { text: "The map does not yet generate the observed classes. " }),
          el("span", { text: messages.join(" ") }),
        ]));
      });

      const datasetHeading = el("div", { class: "transfer-heading" }, [
        el("span", { class: "lab-control-label", text:
          "Changed context · dataset " + (fixtureIndex + 1) + " of " + THREE_POINT_FIXTURES.length
        }),
        el("strong", { text: "Can you reconstruct the chromosome map from unfamiliar offspring?" }),
      ]);
      instrument.replaceChildren(datasetHeading, progress, table, classification, calculation, explanation, solution);
    }

    renderFixture();
    body.append(instrument);
  });

  function assemblyModel(sequence, k) {
    const kmers = [];
    for (let i = 0; i <= sequence.length - k; i++) {
      kmers.push(sequence.slice(i, i + k));
    }
    const edges = kmers.map((label, index) => ({
      id: index,
      label,
      from: label.slice(0, -1),
      to: label.slice(1),
    }));
    const nodes = [...new Set(edges.flatMap((edge) => [edge.from, edge.to]))].sort();
    const degree = Object.fromEntries(nodes.map((node) => [node, { in: 0, out: 0 }]));
    edges.forEach((edge) => {
      degree[edge.from].out += 1;
      degree[edge.to].in += 1;
    });
    const forcedStarts = nodes.filter((node) => degree[node].out - degree[node].in === 1);
    const starts = forcedStarts.length
      ? forcedStarts
      : nodes.filter((node) => degree[node].out > 0);
    const candidates = new Set();
    const used = new Array(edges.length).fill(false);

    function walk(node, assembled, usedCount) {
      if (candidates.size >= 24) return;
      if (usedCount === edges.length) {
        candidates.add(assembled);
        return;
      }
      edges.forEach((edge, index) => {
        if (!used[index] && edge.from === node) {
          used[index] = true;
          walk(edge.to, assembled + edge.to.slice(-1), usedCount + 1);
          used[index] = false;
        }
      });
    }

    starts.forEach((start) => walk(start, start, 0));
    const counts = {};
    kmers.forEach((kmer) => { counts[kmer] = (counts[kmer] || 0) + 1; });
    return {
      k,
      kmers,
      counts,
      edges,
      nodes,
      candidates: [...candidates].sort(),
    };
  }
  models.assembly = assemblyModel;

  function buildAssemblyGraph(model, activeKey) {
    const svg = svgNode("svg", {
      class: "lab-diagram assembly-graph",
      viewBox: "0 0 500 250",
      role: "img",
      "aria-label": "De Bruijn graph with " + model.nodes.length + " nodes and " +
        model.edges.length + " k-mer edges",
    });
    const defs = svgNode("defs");
    const marker = svgNode("marker", {
      id: "assembly-arrow",
      markerWidth: "8",
      markerHeight: "8",
      refX: "7",
      refY: "4",
      orient: "auto",
      markerUnits: "strokeWidth",
    });
    marker.append(svgNode("path", { d: "M0,0 L8,4 L0,8 z", class: "graph-arrow" }));
    defs.append(marker);
    svg.append(defs);

    const centre = { x: 250, y: 122 };
    const radiusX = 168;
    const radiusY = 78;
    const positions = {};
    model.nodes.forEach((node, index) => {
      const angle = -Math.PI / 2 + (index / model.nodes.length) * Math.PI * 2;
      positions[node] = {
        x: centre.x + Math.cos(angle) * radiusX,
        y: centre.y + Math.sin(angle) * radiusY,
      };
    });

    const grouped = {};
    model.edges.forEach((edge) => {
      const key = edge.from + "|" + edge.to;
      grouped[key] = grouped[key] || { from: edge.from, to: edge.to, labels: [] };
      grouped[key].labels.push(edge.label);
    });

    Object.entries(grouped).forEach(([key, edge], edgeIndex) => {
      const start = positions[edge.from];
      const end = positions[edge.to];
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const length = Math.max(1, Math.hypot(dx, dy));
      const sx = start.x + (dx / length) * 29;
      const sy = start.y + (dy / length) * 22;
      const ex = end.x - (dx / length) * 32;
      const ey = end.y - (dy / length) * 24;
      const reverseExists = grouped[edge.to + "|" + edge.from];
      const bend = reverseExists ? (edgeIndex % 2 ? -24 : 24) : 0;
      const mx = (sx + ex) / 2 - (dy / length) * bend;
      const my = (sy + ey) / 2 + (dx / length) * bend;
      const path = svgNode("path", {
        d: "M" + sx.toFixed(1) + " " + sy.toFixed(1) +
          " Q" + mx.toFixed(1) + " " + my.toFixed(1) +
          " " + ex.toFixed(1) + " " + ey.toFixed(1),
        class: "graph-edge" + (activeKey === key ? " is-active" : ""),
        "marker-end": "url(#assembly-arrow)",
      });
      svg.append(path);
      const uniqueLabels = [...new Set(edge.labels)];
      const labelText = uniqueLabels.join(",") +
        (edge.labels.length > 1 ? " ×" + edge.labels.length : "");
      // Label near the source rather than at the geometric midpoint. Midpoint
      // labels collide exactly where independent graph edges cross, even when
      // the paths themselves remain readable. The compact 3-mer fixture is
      // dense enough to need deliberately staggered callouts at phone width.
      const compactLabelPositions = ({
        3: {
          "AA|AC": { x: 326, y: 58 },
          "AC|CA": { x: 382, y: 158 },
          "CA|AA": { x: 210, y: 142 },
          "CA|AC": { x: 322, y: 202 },
          "AC|CG": { x: 284, y: 104 },
        },
        4: {
          // Separate the two left-hand diagonals: their computed callouts
          // otherwise land on the same point once the SVG is phone-sized.
          "AAC|ACA": { x: 360, y: 58 },
          "CAA|AAC": { x: 175, y: 155 },
          "CAC|ACG": { x: 155, y: 95 },
        },
        5: {
          // Keep the return edge and final diagonal visually distinct.
          "AACA|ACAA": { x: 355, y: 58 },
          "CAAC|AACA": { x: 170, y: 158 },
          "ACAC|CACG": { x: 292, y: 160 },
        },
      })[model.k] || {};
      const labelT = 0.32;
      const oneMinusT = 1 - labelT;
      const computedLabelX = oneMinusT * oneMinusT * sx +
        2 * oneMinusT * labelT * mx + labelT * labelT * ex;
      const computedLabelY = oneMinusT * oneMinusT * sy +
        2 * oneMinusT * labelT * my + labelT * labelT * ey;
      const placement = compactLabelPositions[key];
      const labelX = placement ? placement.x : computedLabelX;
      const labelY = placement ? placement.y : computedLabelY - 8;
      const label = svgNode("text", {
        x: labelX.toFixed(1),
        y: labelY.toFixed(1),
        class: "graph-edge-label",
        "text-anchor": "middle",
      });
      label.textContent = labelText;
      svg.append(label);
    });

    model.nodes.forEach((node) => {
      const position = positions[node];
      const circle = svgNode("circle", {
        cx: position.x.toFixed(1),
        cy: position.y.toFixed(1),
        r: "27",
        class: "graph-node",
      });
      const text = svgNode("text", {
        x: position.x.toFixed(1),
        y: (position.y + 5).toFixed(1),
        class: "graph-node-label",
        "text-anchor": "middle",
      });
      text.textContent = node;
      svg.append(circle, text);
    });
    return svg;
  }

  define("assembly-graph-lab", function (api) {
    const { body, el, stat, predict } = api;
    const source = "AACAACACG";
    let k = 3;
    let candidateIndex = 0;
    let walkStep = 0;

    const instrument = el("div", { class: "hero-lab", hidden: true });
    const visual = el("div", { class: "lab-visual" });
    const controls = el("div", { class: "lab-controls" });
    const railHost = el("div");
    const explanation = el("div", { class: "callout", "aria-live": "polite" });

    function render() {
      const model = assemblyModel(source, k);
      if (candidateIndex >= model.candidates.length) candidateIndex = 0;
      const candidate = model.candidates[candidateIndex] || "";
      const candidateKmers = [];
      for (let i = 0; i <= candidate.length - k; i++) {
        candidateKmers.push(candidate.slice(i, i + k));
      }
      const activeKmer = walkStep > 0 ? candidateKmers[walkStep - 1] : null;
      const activeKey = activeKmer
        ? activeKmer.slice(0, -1) + "|" + activeKmer.slice(1)
        : null;

      const graph = buildAssemblyGraph(model, activeKey);
      const kmerList = el("div", {
        class: "kmer-list",
        "aria-label": "Observed k-mers and multiplicities",
      });
      Object.entries(model.counts).sort().forEach(([label, count]) => {
        kmerList.append(el("span", {
          class: "kmer-chip",
          text: label + (count > 1 ? " ×" + count : ""),
        }));
      });

      const candidateRow = el("div", {
        class: "candidate-row",
        role: "group",
        "aria-label": "Valid genome reconstructions",
      });
      model.candidates.forEach((sequence, index) => {
        const button = el("button", {
          class: "btn candidate-sequence",
          type: "button",
          text: sequence,
          onclick: () => {
            candidateIndex = index;
            walkStep = 0;
            render();
          },
        });
        setButtonState(button, index === candidateIndex);
        candidateRow.append(button);
      });

      const assembled = candidate
        ? candidate.slice(0, k - 1) +
          candidateKmers.slice(0, walkStep).map((item) => item.slice(-1)).join("")
        : "";
      const walk = el("div", { class: "assembly-walk" }, [
        el("span", { class: "lab-control-label", text: "Eulerian walk" }),
        el("code", { class: "assembled-sequence",
          text: assembled || "Choose a reconstruction" }),
        el("span", { class: "walk-count",
          text: walkStep + " of " + model.edges.length + " edges used" }),
      ]);

      visual.replaceChildren(
        el("div", { class: "lab-figure-label", text: "Observed k-mer multiset" }),
        kmerList,
        graph,
        el("div", { class: "lab-figure-label", text: "All sequences that use every edge" }),
        candidateRow,
        walk
      );

      controls.replaceChildren(
        el("div", { class: "lab-control-block" }, [
          el("span", { class: "lab-control-label", text: "Context length k" }),
          choiceRow(el, [
            { label: "k = 3", value: 3 },
            { label: "k = 4", value: 4 },
            { label: "k = 5", value: 5 },
          ], k, (next) => {
            k = next;
            candidateIndex = 0;
            walkStep = 0;
            render();
          }, "K-mer length"),
        ]),
        el("div", { class: "btn-row" }, [
          el("button", {
            class: "btn btn-primary",
            type: "button",
            text: walkStep < model.edges.length ? "Walk next edge" : "Walk complete",
            disabled: walkStep >= model.edges.length,
            onclick: () => {
              walkStep = Math.min(model.edges.length, walkStep + 1);
              render();
            },
          }),
          el("button", {
            class: "btn",
            type: "button",
            text: "Restart walk",
            onclick: () => {
              walkStep = 0;
              render();
            },
          }),
        ]),
        el("div", { class: "readout" }, [
          stat(String(model.nodes.length), "(k−1)-mer nodes"),
          stat(String(model.edges.length), "observed edges"),
          stat(model.candidates.length >= 24 ? "24+" : String(model.candidates.length),
            "valid reconstructions"),
        ])
      );

      const ambiguous = model.candidates.length > 1;
      explanation.className = "callout " +
        (ambiguous ? "callout-bad" : "callout-good");
      explanation.innerHTML = ambiguous
        ? "<strong>The graph is faithful and the answer is still ambiguous.</strong> Each listed " +
          "sequence uses exactly the same multiset of k-mer edges. No graph algorithm can select " +
          "the hidden source without longer-range information. Increase k and watch extra context " +
          "resolve the branch."
        : "<strong>The longer context resolves this fixture.</strong> Only one Eulerian walk now " +
          "uses every edge. In a real genome, increasing k also reduces effective coverage and " +
          "allows sequencing errors to survive, so larger is not free.";

      railHost.replaceChildren(causalRail(el, [
        { key: "you changed", value: "k from reads to " + k },
        { key: "mechanism", value: "nodes remember " + (k - 1) + " bases of context" },
        { key: "observable", value: model.candidates.length === 1
            ? "one genome remains" : model.candidates.length + " genomes fit" },
      ]));
    }

    predict(body, {
      widget: "assembly-graph-lab",
      question:
        "The sequences <code>AACAACACG</code> and <code>AACACAACG</code> produce exactly " +
        "the same multiset of 3-mers. If those 3-mers are all the assembler receives, which " +
        "genome should it return?",
      hint: "An assembler cannot use information that the reads did not preserve.",
      options: [
        { label: "AACAACACG" },
        { label: "AACACAACG" },
        { label: "Whichever is lexicographically first" },
        { label: "It cannot distinguish them", correct: true },
      ],
    }, () => {
      instrument.hidden = false;
      render();
    });

    instrument.append(visual, controls, railHost, explanation);
    body.append(instrument);
  });

  function contactModel(orientation, perturbation) {
    const bins = 12;
    const compartments = Array.from({ length: bins }, (_, index) =>
      Math.floor(index / 3) % 2 ? "B" : "A"
    );
    const hasCohesin = perturbation !== "rad21";
    const hasCtcF = perturbation !== "ctcf";
    let activeLoop = null;
    let domain = null;
    let tadStrength = 0;
    let compartmentStrength = 0.18;

    if (hasCohesin && hasCtcF) {
      if (perturbation === "wapl") {
        activeLoop = [3, 10];
        domain = [1, 10];
        tadStrength = 0.14;
        compartmentStrength = 0.07;
      } else {
        activeLoop = orientation === "normal" ? [3, 8] : [3, 10];
        domain = activeLoop.slice();
        tadStrength = 0.34;
      }
    } else if (!hasCohesin) {
      compartmentStrength = 0.34;
    }

    const raw = [];
    let maximum = 0;
    for (let row = 0; row < bins; row++) {
      raw[row] = [];
      for (let col = 0; col < bins; col++) {
        const distance = Math.abs(row - col);
        let value = 1 / (1 + distance * 0.62);
        if (compartments[row] === compartments[col]) value += compartmentStrength;
        if (domain && row >= domain[0] && row <= domain[1] &&
            col >= domain[0] && col <= domain[1]) {
          value += tadStrength;
        }
        if (activeLoop &&
            ((row === activeLoop[0] && col === activeLoop[1]) ||
             (row === activeLoop[1] && col === activeLoop[0]))) {
          value += 1.35;
        }
        raw[row][col] = value;
        maximum = Math.max(maximum, value);
      }
    }
    return {
      bins,
      compartments,
      activeLoop,
      domain,
      matrix: raw.map((row) => row.map((value) => value / maximum)),
      compartmentStrength,
      tadStrength,
    };
  }
  models.contact = contactModel;

  function contactStripSvg(orientation, perturbation, model) {
    const middle = orientation === "normal" ? "←" : "→";
    const arc = model.activeLoop
      ? '<path class="contact-loop" d="M' + (42 + model.activeLoop[0] * 36) +
        ' 98 Q' + (42 + ((model.activeLoop[0] + model.activeLoop[1]) / 2) * 36) +
        ' 48 ' + (42 + model.activeLoop[1] * 36) + ' 98"/>' : "";
    const status = perturbation === "normal"
      ? ["cohesin extrudes until an oriented", "barrier stops it"]
      : perturbation === "rad21"
      ? ["RAD21 depleted · no extrusion"]
      : perturbation === "ctcf"
      ? ["CTCF depleted · extrusion has no", "oriented barriers"]
      : ["WAPL depleted · cohesin residence", "and loop reach increase"];
    const accessibleState = model.activeLoop
      ? "Chromatin strip with an active extruded loop from bin " +
        (model.activeLoop[0] + 1) + " to bin " + (model.activeLoop[1] + 1) + "."
      : perturbation === "rad21"
      ? "RAD21 is depleted; cohesin extrusion and anchored loops are absent."
      : "CTCF is depleted; extrusion lacks oriented barriers and no anchored loop is present.";
    const statusText = status.map((line, index) =>
      '<tspan x="18" y="' + (18 + index * 24) + '">' + line + '</tspan>'
    ).join("");
    return (
      '<svg class="lab-diagram contact-strip" viewBox="0 0 500 190" role="img" ' +
      'aria-label="' + accessibleState + '">' +
        '<text class="lab-svg-kicker">' + statusText + '</text>' +
        '<path class="chromatin-fibre" d="M32 98 L468 98"/>' +
        arc +
        '<text class="ctcf-site" x="' + (42 + 3 * 36) + '" y="128">→</text>' +
        '<text class="ctcf-site ' + (orientation === "normal" ? "" : "is-edited") +
          '" x="' + (42 + 8 * 36) + '" y="128">' + middle + '</text>' +
        '<text class="ctcf-site" x="' + (42 + 10 * 36) + '" y="128">←</text>' +
        '<text class="lab-svg-label" x="' + (28 + 3 * 36) + '" y="156">left anchor</text>' +
        '<text class="lab-svg-label" x="' + (18 + 8 * 36) + '" y="156">edited site</text>' +
        '<text class="lab-svg-label" x="' + (18 + 10 * 36) + '" y="184">next barrier</text>' +
      '</svg>'
    );
  }

  function buildContactMatrix(model) {
    const cell = 17;
    const left = 42;
    const top = 26;
    const size = model.bins * cell;
    const svg = svgNode("svg", {
      class: "lab-diagram contact-matrix",
      viewBox: "0 0 280 280",
      role: "img",
      "aria-label": "Population contact matrix. Darker cells have higher contact frequency.",
    });
    const title = svgNode("text", { x: "42", y: "16", class: "lab-svg-kicker" });
    title.textContent = "population contact frequency";
    svg.append(title);
    for (let row = 0; row < model.bins; row++) {
      for (let col = 0; col < model.bins; col++) {
        const active = model.activeLoop &&
          ((row === model.activeLoop[0] && col === model.activeLoop[1]) ||
           (row === model.activeLoop[1] && col === model.activeLoop[0]));
        const rect = svgNode("rect", {
          x: String(left + col * cell),
          y: String(top + row * cell),
          width: String(cell - 1),
          height: String(cell - 1),
          class: "contact-cell" + (active ? " is-loop" : ""),
          "fill-opacity": String((0.08 + model.matrix[row][col] * 0.9).toFixed(3)),
        });
        svg.append(rect);
      }
    }
    [0, 3, 7, 11].forEach((index) => {
      const xLabel = svgNode("text", {
        x: String(left + index * cell + cell / 2),
        y: String(top + size + 18),
        class: "lab-svg-label",
        "text-anchor": "middle",
      });
      xLabel.textContent = String(index + 1);
      const yLabel = svgNode("text", {
        x: String(left - 10),
        y: String(top + index * cell + 12),
        class: "lab-svg-label",
        "text-anchor": "end",
      });
      yLabel.textContent = String(index + 1);
      svg.append(xLabel, yLabel);
    });
    const xAxis = svgNode("text", {
      x: String(left + size / 2),
      y: "274",
      class: "lab-svg-label",
      "text-anchor": "middle",
    });
    xAxis.textContent = "genomic bin";
    svg.append(xAxis);
    return svg;
  }

  function buildSingleCellView(model) {
    const hasLoop = !!model.activeLoop;
    const svg = svgNode("svg", {
      class: "lab-diagram single-cell-domains",
      viewBox: "0 0 500 320",
      role: "img",
      "aria-label": hasLoop
        ? "Sixteen individual nuclei with variable domain boundaries and one illustrative complete loop."
        : "Sixteen individual nuclei with variable domain boundaries and no anchored loop in this perturbation.",
    });
    const title = svgNode("text", { x: "18", y: "20", class: "lab-svg-kicker" });
    const titleLineOne = svgNode("tspan", { x: "18", y: "20" });
    titleLineOne.textContent = "16 nuclei · variable boundaries";
    const titleLineTwo = svgNode("tspan", { x: "18", y: "44" });
    titleLineTwo.textContent = "the average is not one structure";
    title.append(titleLineOne, titleLineTwo);
    svg.append(title);
    const preferred = model.domain ? model.domain[0] : null;
    const offsets = [0, 1, -1, 0, 2, 0, -2, 1, 0, -1, 3, 0, 1, -2, 0, 2];
    offsets.forEach((offset, index) => {
      const column = index % 2;
      const row = Math.floor(index / 2);
      const x = 28 + column * 240;
      const y = 72 + row * 26;
      const line = svgNode("path", {
        d: "M" + x + " " + y + " L" + (x + 198) + " " + y,
        class: "cell-chromatin",
      });
      svg.append(line);
      const baseBoundary = preferred == null ? 1 + ((index * 3) % 9) : preferred;
      const boundaryBin = Math.max(1, Math.min(10, baseBoundary + offset));
      const bx = x + (boundaryBin / 11) * 198;
      const boundary = svgNode("path", {
        d: "M" + bx.toFixed(1) + " " + (y - 7) + " L" + bx.toFixed(1) + " " + (y + 7),
        class: "cell-boundary",
      });
      svg.append(boundary);
      if (index === 0 && model.activeLoop) {
        const start = x + (model.activeLoop[0] / 11) * 198;
        const end = x + (model.activeLoop[1] / 11) * 198;
        const loop = svgNode("path", {
          d: "M" + start.toFixed(1) + " " + y + " Q" +
            ((start + end) / 2).toFixed(1) + " " + (y - 18) + " " +
            end.toFixed(1) + " " + y,
          class: "cell-loop",
        });
        svg.append(loop);
      }
    });
    const note = svgNode("text", { x: "18", y: "284", class: "lab-svg-label" });
    const noteLineOne = svgNode("tspan", { x: "18", y: "284" });
    noteLineOne.textContent = "Boundaries vary across cells.";
    const noteLineTwo = svgNode("tspan", { x: "18", y: "308" });
    noteLineTwo.textContent = hasLoop
      ? "One illustrative loop is shown in nucleus 1."
      : "No anchored loop after perturbation.";
    note.append(noteLineOne, noteLineTwo);
    svg.append(note);
    return svg;
  }

  define("loop-extrusion-lab", function (api) {
    const { body, el, stat, predict } = api;
    let orientation = "normal";
    let perturbation = "normal";
    let view = "matrix";

    const instrument = el("div", { class: "hero-lab", hidden: true });
    const visual = el("div", { class: "lab-visual" });
    const controls = el("div", { class: "lab-controls" });
    const railHost = el("div");
    const explanation = el("div", { class: "callout", "aria-live": "polite" });

    function resultCopy(model) {
      if (perturbation === "rad21") {
        return "<strong>Extrusion is gone.</strong> TADs and anchored loops disappear, but " +
          "compartments persist and strengthen because extrusion no longer mixes chromatin states.";
      }
      if (perturbation === "ctcf") {
        return "<strong>The motor still runs but the oriented stops are gone.</strong> " +
          "CTCF-anchored loops and most insulation disappear; compartments remain.";
      }
      if (perturbation === "wapl") {
        return "<strong>Cohesin stays on longer.</strong> Loops extend past normal boundaries, " +
          "insulation blurs, and compartmentalisation weakens as extrusion mixes more chromatin.";
      }
      if (orientation === "inverted") {
        return "<strong>One direction changed, so one partner changed.</strong> The edited middle " +
          "site no longer presents its blocking face to cohesin arriving from the left. Extrusion " +
          "continues to the next convergent site and the enriched matrix pixel shifts with it.";
      }
      return "<strong>Convergent sites trap the extruder.</strong> The loop appears as a local " +
        "enrichment away from the diagonal. Compartments are present too, but arise from a " +
        "separate affinity-driven mechanism.";
    }

    function render() {
      const model = contactModel(orientation, perturbation);
      const strip = el("div", { html: contactStripSvg(orientation, perturbation, model) });
      visual.replaceChildren(strip,
        view === "matrix" ? buildContactMatrix(model) : buildSingleCellView(model));

      controls.replaceChildren(
        el("div", { class: "lab-control-block" }, [
          el("span", { class: "lab-control-label", text: "Middle CTCF site" }),
          choiceRow(el, [
            { label: "← original", value: "normal" },
            { label: "→ invert in place", value: "inverted" },
          ], orientation, (next) => {
            orientation = next;
            render();
          }, "Middle CTCF orientation"),
        ]),
        el("div", { class: "lab-control-block" }, [
          el("span", { class: "lab-control-label", text: "Acute perturbation" }),
          choiceRow(el, [
            { label: "None", value: "normal" },
            { label: "RAD21 loss", value: "rad21" },
            { label: "CTCF loss", value: "ctcf" },
            { label: "WAPL loss", value: "wapl" },
          ], perturbation, (next) => {
            perturbation = next;
            render();
          }, "Acute protein perturbation"),
        ]),
        el("div", { class: "lab-control-block" }, [
          el("span", { class: "lab-control-label", text: "Measurement view" }),
          choiceRow(el, [
            { label: "Population matrix", value: "matrix" },
            { label: "16 nuclei", value: "cells" },
          ], view, (next) => {
            view = next;
            render();
          }, "Contact measurement view"),
        ]),
        el("div", { class: "readout" }, [
          stat(model.activeLoop
            ? (model.activeLoop[0] + 1) + " ↔ " + (model.activeLoop[1] + 1)
            : "none", "anchored loop"),
          stat(perturbation === "wapl" ? "weaker" :
            perturbation === "rad21" ? "stronger" : "preserved",
          "A/B compartments"),
        ])
      );

      explanation.className = "callout " +
        (perturbation === "normal" ? "callout-good" : "");
      explanation.innerHTML = resultCopy(model);
      const changed = perturbation !== "normal"
        ? perturbation.toUpperCase() + " perturbation"
        : orientation === "normal" ? "convergent CTCF" : "one CTCF inversion";
      const mechanism = perturbation === "rad21"
        ? "cohesin cannot extrude"
        : perturbation === "ctcf"
        ? "cohesin has no oriented barrier"
        : perturbation === "wapl"
        ? "cohesin residence increases"
        : "cohesin stops at convergent barriers";
      railHost.replaceChildren(causalRail(el, [
        { key: "you changed", value: changed },
        { key: "mechanism", value: mechanism },
        { key: "observable", value: model.activeLoop
            ? "matrix loop at bins " + (model.activeLoop[0] + 1) + " and " +
              (model.activeLoop[1] + 1)
            : "anchored loop disappears" },
      ]));
    }

    predict(body, {
      widget: "loop-extrusion-lab",
      question:
        "A loop is anchored by <code>→ … ←</code> CTCF sites. You invert the right site in " +
        "place, producing <code>→ … → … ←</code>, with another convergent site farther " +
        "downstream. What should happen if loop extrusion is the mechanism?",
      hint: "The edit preserves position and binding affinity; only direction changes.",
      options: [
        { label: "The same loop becomes stronger" },
        { label: "The loop shifts to the downstream site", correct: true },
        { label: "All A/B compartments disappear" },
        { label: "Nothing can change because the sequence still binds CTCF" },
      ],
    }, () => {
      // Open on the exact causal edit the learner just predicted. They can
      // restore the original orientation for the counterfactual.
      orientation = "inverted";
      instrument.hidden = false;
      render();
    });

    instrument.append(visual, controls, railHost, explanation);
    body.append(instrument);
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
  // Later curriculum waves share the same small, dependency-free authoring
  // grammar. Exposing helpers here keeps each scientific module focused on its
  // own model while all chapters retain identical controls and causal rails.
  global.ReaderInteractionKit = Object.assign(
    global.ReaderInteractionKit || {},
    { svgNode, setButtonState, choiceRow, tabs, causalRail, fieldWithRange }
  );
})(window);
