/* ── Changed-context transfer challenges ──────────────────────────────────
   These are deliberately not miniature copies of the Hero Labs. Each one
   presents an unfamiliar scientific specimen, asks for three linked decisions,
   and annotates the specimen only after the learner commits. The shared shell
   owns focus, progress, first-attempt recording, and retry behaviour; every
   chapter supplies its own data, visual representation, and misconception-
   specific feedback. No imports or runtime requests: the reader must work from
   file:// as well as from a hosted path.
   ───────────────────────────────────────────────────────────────────────── */

(function (global) {
  "use strict";

  const definitions = global.ReaderInteractionDefinitions ||
    (global.ReaderInteractionDefinitions = {});
  const models = global.ReaderInteractionModels ||
    (global.ReaderInteractionModels = {});
  const coverage = global.ReaderInteractionCoverage ||
    (global.ReaderInteractionCoverage = {});
  const kit = global.ReaderInteractionKit || {};
  const specs = {};

  const round = (value, digits) => Number(value.toFixed(digits));
  const nearNumber = (value, target, tolerance) =>
    Number.isFinite(value) && Number.isFinite(target) && Math.abs(value - target) <= tolerance;
  const percent = (value, digits) => (100 * value).toFixed(digits == null ? 0 : digits) + "%";
  const number = (value, digits) => Number(value).toLocaleString("en-GB", {
    minimumFractionDigits: digits || 0,
    maximumFractionDigits: digits || 0,
  });

  function answer(label, correct, feedback) {
    return { label, correct: !!correct, feedback };
  }

  function transferSpecimen(el, label, ariaLabel, children) {
    return el("figure", {
      class: "transfer-specimen",
      role: "img",
      "aria-label": ariaLabel,
    }, [
      el("figcaption", { class: "transfer-specimen-label", text: label }),
      el("div", { class: "transfer-specimen-body" }, children),
    ]);
  }

  function evidenceStrip(el, steps, solved) {
    return el("div", {
      class: "transfer-evidence-strip",
      "aria-label": "Evidence unlocked so far",
    }, steps.map((step, index) => el("span", {
      class: "transfer-evidence" + (index < solved ? " is-revealed" : ""),
      text: index < solved ? step.reveal : "evidence " + (index + 1),
    })));
  }

  function metricCards(el, metrics) {
    return el("div", { class: "transfer-metrics" }, metrics.map((metric) =>
      el("div", { class: "transfer-metric" + (metric.tone ? " is-" + metric.tone : "") }, [
        el("span", { text: metric.label }),
        el("strong", { text: String(metric.value) }),
      ])
    ));
  }

  function codeLine(el, label, text, tone) {
    return el("div", { class: "transfer-code-line" + (tone ? " is-" + tone : "") }, [
      el("span", { text: label }),
      el("code", { text }),
    ]);
  }

  function smallBar(el, label, value, maximum, display, tone) {
    return el("div", { class: "transfer-small-bar" }, [
      el("span", { text: label }),
      el("span", { class: "transfer-small-track", "aria-hidden": "true" }, [
        el("span", {
          class: "transfer-small-fill" + (tone ? " is-" + tone : ""),
          style: "width:" + (maximum ? Math.max(0, Math.min(100, value / maximum * 100)) : 0).toFixed(1) + "%",
        }),
      ]),
      el("strong", { text: display == null ? String(value) : String(display) }),
    ]);
  }

  function register(spec) {
    if (definitions[spec.id] || specs[spec.id]) {
      throw new Error("Duplicate transfer challenge: " + spec.id);
    }
    if (!Array.isArray(spec.fixtures) || spec.fixtures.length < 3) {
      throw new Error(spec.id + " needs at least three independent fixtures");
    }
    specs[spec.id] = spec;
    coverage[spec.id] = spec.coverage;
    definitions[spec.id] = (api) => buildTransferChallenge(api, spec);
  }

  function buildTransferChallenge(api, spec) {
    const { body, el, Ledger } = api;
    let fixtureIndex = 0;
    const instrument = el("div", {
      class: "hero-lab transfer-lab transfer-portfolio-lab",
      "data-transfer-id": spec.id,
    });

    function renderFixture() {
      const fixture = spec.fixtures[fixtureIndex];
      const steps = spec.steps(fixture, models);
      if (steps.length !== 3) throw new Error(spec.id + " fixtures must have exactly three decisions");
      let activeStep = 0;
      let solved = 0;
      const firstChecks = [true, true, true];

      instrument.dataset.fixture = fixture.key;
      const heading = el("div", { class: "transfer-heading" }, [
        el("span", { class: "lab-control-label", text:
          "Changed context · case " + (fixtureIndex + 1) + " of " + spec.fixtures.length
        }),
        el("strong", { text: fixture.title }),
        el("p", { class: "transfer-context", text: fixture.context }),
      ]);
      const progress = el("ol", {
        class: "transfer-progress",
        "aria-label": "Challenge progress",
      });
      const progressItems = steps.map((step, index) => {
        const item = el("li", {
          class: index === 0 ? "is-current" : "",
          text: (index + 1) + " · " + step.label,
          "aria-label": "Step " + (index + 1) + ", " + step.label +
            (index === 0 ? ", current" : ", not started"),
        });
        if (index === 0) item.setAttribute("aria-current", "step");
        progress.append(item);
        return item;
      });
      const visualHost = el("div", { class: "transfer-visual-host" });
      const evidenceHost = el("div");
      const stageHost = el("div");
      const solutionHost = el("div", {
        class: "transfer-solution",
        hidden: true,
        "aria-live": "polite",
      });

      function renderVisual() {
        visualHost.replaceChildren(spec.visual(el, fixture, solved, models));
        evidenceHost.replaceChildren(evidenceStrip(el, steps, solved));
      }

      function markStepComplete(index) {
        const item = progressItems[index];
        item.className = "is-complete";
        item.removeAttribute("aria-current");
        item.setAttribute("aria-label", "Step " + (index + 1) + ", " + steps[index].label + ", complete");
        if (index + 1 < progressItems.length) {
          const next = progressItems[index + 1];
          next.className = "is-current";
          next.setAttribute("aria-current", "step");
          next.setAttribute("aria-label", "Step " + (index + 2) + ", " + steps[index + 1].label + ", current");
        }
      }

      function showSolution() {
        const summary = spec.summary(fixture, models);
        solutionHost.hidden = false;
        progressItems[2].className = "is-complete";
        progressItems[2].removeAttribute("aria-current");
        progressItems[2].setAttribute("aria-label", "Step 3, " + steps[2].label + ", complete");
        const rail = kit.causalRail ? kit.causalRail(el, summary.rail) : el("p", { text: summary.takeaway });
        if (summary.rail.length === 4) rail.classList.add("has-4-steps");
        const next = el("button", {
          class: "btn",
          type: "button",
          text: fixtureIndex === spec.fixtures.length - 1 ? "Restart with case 1" : "Try another unseen case",
          "data-action": "next-transfer-case",
        });
        next.addEventListener("click", () => {
          fixtureIndex = (fixtureIndex + 1) % spec.fixtures.length;
          renderFixture();
          instrument.querySelector(".transfer-stage button")?.focus({ preventScroll: true });
        });
        solutionHost.replaceChildren(
          el("div", { class: "callout callout-good" }, [
            el("strong", { text: "Transfer complete. " }),
            el("span", { text: summary.takeaway }),
          ]),
          rail,
          el("div", { class: "btn-row transfer-next" }, [next])
        );
        next.focus({ preventScroll: true });
      }

      function renderStep() {
        const step = steps[activeStep];
        let selected = null;
        const feedback = el("div", {
          class: "transfer-feedback",
          "aria-live": "polite",
        });
        const row = el("div", {
          class: "transfer-option-grid",
          role: "group",
          "aria-label": step.prompt,
        });
        step.options.forEach((option, optionIndex) => {
          const button = el("button", {
            class: "btn transfer-option",
            type: "button",
            text: option.label,
            "aria-pressed": "false",
            "data-option": String(optionIndex),
          });
          button.addEventListener("click", () => {
            selected = option;
            row.querySelectorAll("button").forEach((candidate) =>
              kit.setButtonState ? kit.setButtonState(candidate, candidate === button) :
                candidate.setAttribute("aria-pressed", candidate === button ? "true" : "false")
            );
          });
          row.append(button);
        });
        const check = el("button", {
          class: "btn btn-primary",
          type: "button",
          text: "Check this inference",
          "data-action": "check-transfer-step",
        });
        check.addEventListener("click", () => {
          if (!selected) {
            feedback.setAttribute("role", "alert");
            feedback.replaceChildren(el("div", {
              class: "callout callout-bad",
              text: "Make a scientific call before checking it.",
            }));
            return;
          }
          if (firstChecks[activeStep]) {
            Ledger?.record(spec.id, selected.correct);
            firstChecks[activeStep] = false;
          }
          if (!selected.correct) {
            feedback.setAttribute("role", "alert");
            feedback.replaceChildren(el("div", { class: "callout callout-bad" }, [
              el("strong", { text: "That inference breaks here. " }),
              el("span", { text: selected.feedback }),
            ]));
            return;
          }

          row.querySelectorAll("button").forEach((button) => { button.disabled = true; });
          check.disabled = true;
          solved = activeStep + 1;
          markStepComplete(activeStep);
          renderVisual();
          const continueButton = el("button", {
            class: "btn",
            type: "button",
            text: activeStep === steps.length - 1 ? "Show the complete inference" : "Continue to " + steps[activeStep + 1].label,
            "data-action": "continue-transfer-step",
          });
          feedback.setAttribute("role", "status");
          feedback.replaceChildren(
            el("div", { class: "callout callout-good" }, [
              el("strong", { text: "That holds. " }),
              el("span", { text: step.explanation }),
            ]),
            el("div", { class: "btn-row" }, [continueButton])
          );
          continueButton.addEventListener("click", () => {
            if (activeStep === steps.length - 1) {
              stageHost.replaceChildren();
              showSolution();
              return;
            }
            activeStep += 1;
            renderStep();
            stageHost.querySelector(".transfer-option")?.focus({ preventScroll: true });
          });
          continueButton.focus({ preventScroll: true });
        });

        stageHost.replaceChildren(el("section", {
          class: "transfer-stage",
          "aria-labelledby": spec.id + "-step-" + activeStep,
        }, [
          el("div", { class: "transfer-stage-heading" }, [
            el("span", { class: "lab-control-label", text: "Decision " + (activeStep + 1) + " of 3" }),
            el("h5", { id: spec.id + "-step-" + activeStep, text: step.prompt }),
          ]),
          row,
          el("div", { class: "btn-row" }, [check]),
          feedback,
        ]));
      }

      instrument.replaceChildren(heading, progress, visualHost, evidenceHost, stageHost, solutionHost);
      renderVisual();
      renderStep();
    }

    renderFixture();
    body.append(instrument);
  }

  /* Visual specimens ----------------------------------------------------- */

  function forkVisual(el, fixture, solved) {
    const movingRight = fixture.direction === "right";
    const lagging = movingRight ? "upper" : "lower";
    const upperClass = solved >= 1 && lagging === "upper" ? " is-lagging" : solved >= 1 ? " is-leading" : "";
    const lowerClass = solved >= 1 && lagging === "lower" ? " is-lagging" : solved >= 1 ? " is-leading" : "";
    return transferSpecimen(el, fixture.label, fixture.aria ||
      "Replication fork moving " + fixture.direction + "; the " + lagging + " template is lagging.", [
        el("div", { class: "fork-transfer" }, [
          el("div", { class: "fork-transfer-arrow", text: movingRight ? "fork moves →" : "← fork moves" }),
          el("div", { class: "fork-transfer-strand" + upperClass }, [
            el("b", { text: "5′" }), el("span"), el("b", { text: "3′" }),
            solved >= 1 ? el("em", { text: lagging === "upper" ? "lagging template" : "leading template" }) : el("em", { text: "upper template" }),
          ]),
          el("div", { class: "fork-transfer-junction", "aria-hidden": "true", text: "Y" }),
          el("div", { class: "fork-transfer-strand" + lowerClass }, [
            el("b", { text: "3′" }), el("span"), el("b", { text: "5′" }),
            solved >= 1 ? el("em", { text: lagging === "lower" ? "lagging template" : "leading template" }) : el("em", { text: "lower template" }),
          ]),
          solved >= 2 ? el("div", { class: "fork-fragments", text:
            "Okazaki fragments grow " + (movingRight ? "← away from the fork" : "away from the fork →")
          }) : el("div", { class: "fork-fragments is-hidden", text: "fragment direction hidden" }),
        ]),
        solved >= 3 ? metricCards(el, [{ label: "perturbation", value: fixture.component }, { label: "observable", value: fixture.observable, tone: "warning" }]) : el("div"),
      ]);
  }

  function spliceVisual(el, fixture, solved) {
    const exons = fixture.product.split("–");
    const transcriptExons = fixture.exons || ["1", "2", "3", "4"];
    return transferSpecimen(el, fixture.label, fixture.aria, [
      el("div", { class: "splice-transfer" }, [
        ...transcriptExons.flatMap((name, index) => {
          const nodes = [el("span", {
            class: "splice-exon" + (name === "2" && fixture.donorBroken ? " is-threatened" : ""),
            text: "exon " + name,
          })];
          if (index < transcriptExons.length - 1) nodes.push(el("span", {
            class: "splice-intron",
            text: name === "2" && fixture.donorBroken ? "GU→AU" : "intron",
          }));
          return nodes;
        }),
      ]),
      solved >= 1 ? el("div", { class: "transfer-annotation", text: fixture.signal }) : el("div"),
      solved >= 2 ? el("div", { class: "splice-product" }, exons.map((name) => el("span", { text: "exon " + name }))) : el("div"),
      solved >= 3 ? metricCards(el, [
        { label: "stop → final junction", value: fixture.stopInLastExon ? "last exon" : fixture.distance + " nt" },
        { label: "RNA fate", value: fixture.nmd ? "NMD" : "escapes NMD", tone: fixture.nmd ? "warning" : "signal" },
      ]) : el("div"),
    ]);
  }

  function translationVisual(el, fixture, solved) {
    return transferSpecimen(el, fixture.label, fixture.aria, [
      codeLine(el, fixture.strandLabel, fixture.dna, "source"),
      solved >= 1 ? codeLine(el, "mRNA 5′→3′", fixture.mrna, "signal") : codeLine(el, "mRNA 5′→3′", "? ? ? ?", "muted"),
      solved >= 2 ? el("div", { class: "translation-peptide" }, fixture.peptide.map((aa) => el("span", { text: aa }))) : el("div"),
      solved >= 3 ? metricCards(el, [{ label: "changed rule", value: fixture.change }, { label: "consequence", value: fixture.effect, tone: "warning" }]) : el("div"),
    ]);
  }

  function meiosisVisual(el, fixture, solved) {
    return transferSpecimen(el, fixture.label, fixture.aria, [
      el("div", { class: "meiotic-products" }, fixture.products.map((product, index) =>
        el("div", { class: "meiotic-product" + (product === "∅" ? " is-null" : "") }, [
          el("span", { text: "product " + (index + 1) }),
          el("strong", { text: product }),
        ])
      )),
      solved >= 1 ? metricCards(el, [{ label: "origin", value: fixture.division }, { label: "copy pattern", value: fixture.signature, tone: "signal" }]) : el("div"),
      solved >= 2 ? el("div", { class: "transfer-annotation", text: fixture.markerMeaning }) : el("div"),
      solved >= 3 ? el("div", { class: "transfer-annotation is-conclusion", text: fixture.conclusion }) : el("div"),
    ]);
  }

  function chiSquareVisual(el, fixture, solved) {
    const maximum = Math.max(...fixture.observed, ...fixture.expected);
    return transferSpecimen(el, fixture.label, fixture.aria, [
      el("div", { class: "chi-transfer-table" }, fixture.observed.map((observed, index) =>
        el("div", { class: "chi-transfer-row" }, [
          el("strong", { text: fixture.classes[index] }),
          smallBar(el, "observed", observed, maximum, observed, "active"),
          smallBar(el, "expected", fixture.expected[index], maximum, number(fixture.expected[index], 1), "signal"),
          solved >= 2 ? el("span", { class: "chi-contribution", text:
            "χ² part " + (((observed - fixture.expected[index]) ** 2) / fixture.expected[index]).toFixed(2)
          }) : el("span"),
        ])
      )),
      solved >= 1 ? metricCards(el, [{ label: "classes", value: fixture.classes.length }, { label: "fitted parameters", value: fixture.estimated }, { label: "df", value: fixture.df, tone: "signal" }]) : el("div"),
      solved >= 3 ? metricCards(el, [{ label: "χ²", value: fixture.chi.toFixed(2) }, { label: "decision", value: fixture.reject ? "reject model" : "do not reject", tone: fixture.reject ? "warning" : "signal" }]) : el("div"),
    ]);
  }

  function pedigreeVisual(el, fixture, solved) {
    const personNode = (person) => el("div", {
      class: "pedigree-person " + person.sex + (person.affected ? " is-affected" : ""),
      title: person.label,
      "aria-label": person.label + (person.affected ? ", affected" : ", unaffected"),
    });
    const familyBlock = (label, parents, children, related) => {
      const parentRow = parents.length === 1
        ? el("div", { class: "pedigree-source-row" }, [personNode(parents[0])])
        : el("div", { class: "pedigree-parent-row" }, [
          personNode(parents[0]),
          el("span", { class: "pedigree-union" + (related ? " is-related" : ""), "aria-hidden": "true" }),
          personNode(parents[1]),
        ]);
      return el("div", { class: "pedigree-family-block" }, [
        el("strong", { class: "pedigree-family-label", text: label }),
        parentRow,
        el("div", { class: "pedigree-children" }, children.map((person) =>
          el("div", { class: "pedigree-child" }, [personNode(person)])
        )),
      ]);
    };
    const families = fixture.key === "mitochondrial"
      ? [
        familyBlock("maternal lineage", fixture.people.slice(0, 1), fixture.people.slice(1, 7), false),
        familyBlock("paternal lineage", fixture.people.slice(7, 8), fixture.people.slice(8), false),
      ]
      : [familyBlock("one sibship", fixture.people.slice(0, 2), fixture.people.slice(2), fixture.key === "ar")];
    return transferSpecimen(el, fixture.label, fixture.aria, [
      el("div", { class: "pedigree-transfer" + (families.length > 1 ? " has-two-families" : "") }, families),
      el("p", { class: "transfer-caption", text: fixture.pattern }),
      solved >= 1 ? metricCards(el, [{ label: "best-supported mode", value: fixture.mode, tone: "signal" }]) : el("div"),
      solved >= 2 ? el("div", { class: "transfer-annotation", text: fixture.decisive }) : el("div"),
      solved >= 3 ? el("div", { class: "transfer-annotation is-conclusion", text: fixture.riskConclusion }) : el("div"),
    ]);
  }

  function repairVisual(el, fixture, solved) {
    return transferSpecimen(el, fixture.label, fixture.aria, [
      el("div", { class: "repair-transfer" }, [
        el("div", { class: "repair-lesion-card" }, [el("span", { text: "lesion" }), el("strong", { text: fixture.lesion })]),
        el("span", { class: "repair-transfer-arrow", text: "→", "aria-hidden": "true" }),
        el("div", { class: "repair-lesion-card" }, [el("span", { text: "context" }), el("strong", { text: fixture.contextLabel })]),
        el("span", { class: "repair-transfer-arrow", text: "→", "aria-hidden": "true" }),
        el("div", { class: "repair-lesion-card" }, [el("span", { text: "defect" }), el("strong", { text: fixture.defect })]),
      ]),
      solved >= 1 ? metricCards(el, [{ label: "normal route", value: fixture.route, tone: "signal" }]) : el("div"),
      solved >= 2 ? el("div", { class: "transfer-annotation", text: fixture.failedStep }) : el("div"),
      solved >= 3 ? el("div", { class: "transfer-annotation is-conclusion", text: fixture.observable }) : el("div"),
    ]);
  }

  function ldVisual(el, fixture, solved, modelSet) {
    const result = modelSet.linkageDisequilibrium(Object.assign({ kind: "table" }, fixture.counts));
    return transferSpecimen(el, fixture.label, fixture.aria, [
      el("table", { class: "ld-transfer-table" }, [
        el("caption", { text: result.total + " phased chromosomes" }),
        el("thead", {}, [el("tr", {}, [el("th", { text: "haplotype" }), el("th", { text: "count" }), el("th", { text: "frequency" })])]),
        el("tbody", {}, Object.entries(result.counts).map(([label, count]) => el("tr", {}, [
          el("th", { scope: "row", text: label }), el("td", { text: String(count) }), el("td", { text: result.frequencies[label].toFixed(2) }),
        ]))),
      ]),
      solved >= 1 ? metricCards(el, [{ label: "D", value: result.D.toFixed(3), tone: result.D === 0 ? "muted" : "signal" }, { label: "phase", value: fixture.phase }]) : el("div"),
      solved >= 2 ? metricCards(el, [{ label: "D′", value: result.dPrime.toFixed(2) }, { label: "r²", value: result.r2.toFixed(2), tone: "signal" }]) : el("div"),
      solved >= 3 ? metricCards(el, [{ label: "sample-size cost", value: Number.isFinite(result.sampleFactor) ? result.sampleFactor.toFixed(2) + "×" : "not a usable tag", tone: "warning" }]) : el("div"),
    ]);
  }

  function heritabilityVisual(el, fixture, solved, modelSet) {
    if (fixture.kind === "partition") {
      const result = modelSet.heritabilitySelection(Object.assign({ kind: "partition" }, fixture.values));
      return transferSpecimen(el, fixture.label, fixture.aria, [
        el("div", { class: "variance-ledger" }, [
          smallBar(el, "Vₐ", result.va, result.vp, result.va, "active"),
          smallBar(el, "Vᴅ", result.vd, result.vp, result.vd, "warning"),
          smallBar(el, "Vᵢ", result.vi, result.vp, result.vi, "muted"),
          smallBar(el, "Vₑ", result.ve, result.vp, result.ve, "signal"),
        ]),
        solved >= 1 ? metricCards(el, [{ label: "h²", value: result.h2.toFixed(2) }, { label: "H²", value: result.H2.toFixed(2), tone: "signal" }]) : el("div"),
        solved >= 2 ? el("div", { class: "transfer-annotation", text: "Only Vₐ enters R = h²S predictably." }) : el("div"),
        solved >= 3 ? metricCards(el, [{ label: "S", value: fixture.selection }, { label: "R", value: (result.h2 * fixture.selection).toFixed(1), tone: "signal" }]) : el("div"),
      ]);
    }
    const result = modelSet.heritabilitySelection(Object.assign({ kind: "context" }, fixture.values));
    const gardenCard = (label, mean, h2, environmentalVariance) => {
      const total = result.va + environmentalVariance;
      return el("div", {}, [
        el("span", { text: label }),
        el("strong", { text: "mean " + mean }),
        el("div", { class: "garden-variance-track", title: "Additive variance " + result.va + "; environmental variance " + environmentalVariance }, [
          el("i", { class: "is-additive", style: "width:" + (100 * result.va / total).toFixed(1) + "%" }),
          el("i", { class: "is-environmental", style: "width:" + (100 * environmentalVariance / total).toFixed(1) + "%" }),
        ]),
        el("div", { class: "garden-variance-labels" }, [
          el("small", { text: "Vₐ " + result.va }),
          el("small", { text: "Vₑ " + environmentalVariance }),
        ]),
        el("em", { text: solved >= 1 ? "h² " + h2.toFixed(2) : "h² = ?" }),
      ]);
    };
    return transferSpecimen(el, fixture.label, fixture.aria, [
      el("div", { class: "garden-transfer" }, [
        gardenCard("environment A", result.meanA, result.h2A, result.veA),
        gardenCard("environment B", result.meanB, result.h2B, result.veB),
      ]),
      solved >= 1 ? metricCards(el, [{ label: "within A", value: result.h2A.toFixed(2) }, { label: "within B", value: result.h2B.toFixed(2) }]) : el("div"),
      solved >= 2 ? el("div", { class: "transfer-annotation", text: fixture.meanInference }) : el("div"),
      solved >= 3 ? metricCards(el, fixture.responseMetrics(result)) : el("div"),
    ]);
  }

  function formatVisual(el, fixture, solved) {
    return transferSpecimen(el, fixture.label, fixture.aria, [
      el("div", { class: "format-transfer-records" }, fixture.lines.map((line) => codeLine(el, line.label, line.text, line.tone))),
      solved >= 1 ? el("div", { class: "transfer-annotation", text: fixture.reveals[0] }) : el("div"),
      solved >= 2 ? el("div", { class: "transfer-annotation", text: fixture.reveals[1] }) : el("div"),
      solved >= 3 ? el("div", { class: "transfer-annotation is-conclusion", text: fixture.reveals[2] }) : el("div"),
    ]);
  }

  function alignmentVisual(el, fixture, solved) {
    return transferSpecimen(el, fixture.label, fixture.aria, [
      el("div", { class: "alignment-transfer" }, fixture.tracks.map((track) =>
        codeLine(el, track.label, track.text, track.tone)
      )),
      solved >= 1 ? metricCards(el, fixture.metrics.slice(0, 1)) : el("div"),
      solved >= 2 ? metricCards(el, fixture.metrics.slice(1, 2)) : el("div"),
      solved >= 3 ? el("div", { class: "transfer-annotation is-conclusion", text: fixture.limit }) : el("div"),
    ]);
  }

  function assemblyVisual(el, fixture, solved, modelSet) {
    const result = modelSet.assembly(fixture.sequence, fixture.k);
    return transferSpecimen(el, fixture.label, fixture.aria, [
      el("div", { class: "kmer-transfer-list" }, result.kmers.map((kmer) => el("code", { text: kmer }))),
      solved >= 1 ? el("div", { class: "assembly-transfer-graph" }, result.edges.map((edge) =>
        el("span", { text: edge.from + " → " + edge.to, title: edge.label })
      )) : el("div", { class: "transfer-annotation", text: "Classify each k-mer before the graph is drawn." }),
      solved >= 1 ? metricCards(el, [{ label: "nodes", value: result.nodes.length }, { label: "edges", value: result.edges.length }]) : el("div"),
      solved >= 2 ? el("div", { class: "assembly-candidates" }, result.candidates.map((candidate) => el("code", { text: candidate }))) : el("div"),
      solved >= 3 ? el("div", { class: "transfer-annotation is-conclusion", text: fixture.informationClaim }) : el("div"),
    ]);
  }

  function pileupVisual(el, fixture, solved) {
    const rows = fixture.reads || [];
    return transferSpecimen(el, fixture.label, fixture.aria, [
      rows.length ? el("div", { class: "pileup-transfer" }, rows.map((read) =>
        codeLine(el, read.label, read.sequence, read.tone)
      )) : metricCards(el, fixture.baseMetrics),
      solved >= 1 ? metricCards(el, fixture.revealedMetrics[0]) : el("div"),
      solved >= 2 ? metricCards(el, fixture.revealedMetrics[1]) : el("div"),
      solved >= 3 ? el("div", { class: "transfer-annotation is-conclusion", text: fixture.claim }) : el("div"),
    ]);
  }

  function clinicalVisual(el, fixture, solved, modelSet) {
    const result = modelSet.clinical({ kind: "posterior", points: fixture.points, prior: 0.10 });
    const posteriorLabel = percent(result.posterior, result.posterior < 0.001 ? 2 : 1);
    return transferSpecimen(el, fixture.label, fixture.aria, [
      el("div", { class: "clinical-ledger-transfer" }, fixture.evidence.map((item) =>
        el("div", { class: "clinical-evidence-card is-" + item.tone }, [
          el("span", { text: item.source }), el("strong", { text: item.observation }), el("b", { text: item.points }),
        ])
      )),
      solved >= 1 ? metricCards(el, [{ label: "independent evidence groups", value: fixture.groups }, { label: "correlated items collapsed", value: fixture.collapsed }]) : el("div"),
      solved >= 2 ? metricCards(el, [{ label: "net points", value: fixture.points > 0 ? "+" + fixture.points : fixture.points }, { label: "posterior", value: posteriorLabel }, { label: "tier", value: result.tier, tone: result.tier === "Uncertain significance" ? "warning" : "signal" }]) : el("div"),
      solved >= 3 ? el("div", { class: "transfer-annotation is-conclusion", text: fixture.action }) : el("div"),
    ]);
  }

  function likelihoodVisual(el, fixture, solved, modelSet) {
    if (fixture.kind === "evidence") {
      return transferSpecimen(el, fixture.label, fixture.aria, [
        el("div", { class: "transfer-evidence-equation" }, [
          el("div", { class: "transfer-evidence-term" }, [
            el("span", { text: "prior odds · M1:M0" }),
            el("strong", { text: "1:9" }),
          ]),
          el("b", { class: "transfer-evidence-operator", "aria-hidden": "true", text: "×" }),
          el("div", { class: "transfer-evidence-term" + (solved >= 1 ? " is-revealed" : "") }, [
            el("span", { text: "likelihood ratio" }),
            el("strong", { text: solved >= 1 ? "100" : "?" }),
          ]),
          el("b", { class: "transfer-evidence-operator", "aria-hidden": "true", text: "→" }),
          el("div", { class: "transfer-evidence-term" + (solved >= 2 ? " is-revealed" : "") }, [
            el("span", { text: "posterior odds · M1:M0" }),
            el("strong", { text: solved >= 2 ? "100:9" : "?" }),
          ]),
        ]),
        el("p", { class: "transfer-caption", text: fixture.caption }),
        solved >= 1 ? metricCards(el, fixture.revealedMetrics[0](modelSet)) : el("div"),
        solved >= 2 ? metricCards(el, fixture.revealedMetrics[1](modelSet)) : el("div"),
        solved >= 3 ? el("div", { class: "transfer-annotation is-conclusion", text: fixture.conclusion(modelSet) }) : el("div"),
      ]);
    }
    const points = [];
    for (let index = 0; index <= 40; index += 1) {
      const p = index / 40;
      const result = modelSet.likelihoodBayes({ kind: "likelihood", n: fixture.n, k: fixture.k, p });
      points.push([p, result.relativeLikelihood]);
    }
    const path = points.map(([p, value], index) =>
      (index ? "L" : "M") + (20 + p * 460).toFixed(1) + " " + (160 - value * 125).toFixed(1)
    ).join(" ");
    const curve = el("div", { html:
      '<svg class="likelihood-transfer-curve" viewBox="0 0 500 190" aria-hidden="true">' +
      '<path class="lab-grid-line" d="M20 160 H480 M20 35 V160"/>' +
      '<path class="lab-data-line" d="' + path + '"/>' +
      '<text class="lab-svg-label" x="20" y="182">0</text><text class="lab-svg-label" x="470" y="182">1 · parameter p</text>' +
      '</svg>'
    });
    return transferSpecimen(el, fixture.label, fixture.aria, [
      curve,
      el("p", { class: "transfer-caption", text: fixture.caption }),
      solved >= 1 ? metricCards(el, fixture.revealedMetrics[0](modelSet)) : el("div"),
      solved >= 2 ? metricCards(el, fixture.revealedMetrics[1](modelSet)) : el("div"),
      solved >= 3 ? el("div", { class: "transfer-annotation is-conclusion", text: fixture.conclusion(modelSet) }) : el("div"),
    ]);
  }

  /* Molecular and transmission transfer specifications ------------------ */

  register({
    id: "replication-transfer-challenge",
    coverage: {
      "ch04-o3": "An unfamiliar fork orientation requires the learner to derive leading and lagging synthesis from antiparallel templates and 5′→3′ polymerisation.",
    },
    fixtures: [
      { key: "left-primase", label: "Fork α", title: "Rebuild a left-moving fork", context: "The fork is already moving left when primase is acutely removed.", direction: "left", component: "primase removed", observable: "new lagging fragments stop initiating", aria: "Left-moving replication fork whose lower template is copied discontinuously before primase is removed." },
      { key: "right-ligase", label: "Fork β", title: "Follow unfinished fragments", context: "The fork moves right and DNA ligase is inactivated after synthesis begins.", direction: "right", component: "ligase inactive", observable: "daughter strand retains nicks", aria: "Right-moving replication fork whose upper template is copied discontinuously before ligase is inactivated." },
      { key: "left-proofreading", label: "Fork γ", title: "Separate synthesis from fidelity", context: "A left-moving fork uses a polymerase whose 3′→5′ exonuclease is disabled.", direction: "left", component: "proofreading lost", observable: "synthesis continues with more substitutions", aria: "Left-moving replication fork whose lower template is copied discontinuously by a polymerase without proofreading." },
    ],
    visual: forkVisual,
    steps(fixture) {
      const lagging = fixture.direction === "right" ? "upper" : "lower";
      const fragmentDirection = fixture.direction === "right" ? "left" : "right";
      const consequences = {
        "primase removed": "New Okazaki fragments cannot receive RNA primers; an already-primed leading strand can extend briefly.",
        "ligase inactive": "Polymerase can fill the fragments, but the phosphodiester backbone remains nicked between them.",
        "proofreading lost": "The fork still copies DNA, but the polymerase retains more misincorporated bases.",
      };
      return [
        {
          label: "orient",
          prompt: "Which parental template must be copied discontinuously?",
          reveal: lagging + " template is lagging",
          explanation: "To move with the fork, polymerase must read the template 3′→5′. The opposite template therefore has to be copied in pieces.",
          options: [
            answer("Upper template", lagging === "upper", "Trace the upper strand in the direction the fork moves. Polymerase can follow it continuously only if it encounters that template 3′→5′."),
            answer("Lower template", lagging === "lower", "Trace the lower strand in the direction the fork moves. Polymerase can follow it continuously only if it encounters that template 3′→5′."),
            answer("Both templates", false, "Both daughter strands grow 5′→3′, but antiparallel templates mean only one can grow continuously with a single moving fork."),
            answer("Neither template", false, "The fork can copy both templates; the constraint changes continuity, not whether synthesis is possible."),
          ],
        },
        {
          label: "construct",
          prompt: "In which direction do the new Okazaki fragments extend on the page?",
          reveal: "fragments grow " + fragmentDirection,
          explanation: "Each fragment still grows 5′→3′, which points away from this moving fork on the lagging template.",
          options: [
            answer("Left", fragmentDirection === "left", "Fragment direction follows 5′→3′ synthesis on the lagging template, not a fixed left-to-right drawing convention."),
            answer("Right", fragmentDirection === "right", "Fragment direction follows 5′→3′ synthesis on the lagging template, not a fixed left-to-right drawing convention."),
            answer("Alternating left and right", false, "Successive fragments begin at different positions, but every one has the same chemical 5′→3′ growth direction."),
            answer("Direction is undefined", false, "The labelled template ends and the fork direction are enough to determine the direction exactly."),
          ],
        },
        {
          label: "perturb",
          prompt: "What is the first diagnostic consequence of " + fixture.component + "?",
          reveal: fixture.observable,
          explanation: consequences[fixture.component],
          options: Object.entries(consequences).map(([component, explanation]) =>
            answer(explanation, component === fixture.component,
              component === "primase removed" ? "That is the primase phenotype: distinguish failure to start fragments from failure to join or proofread them." :
              component === "ligase inactive" ? "That is the ligase phenotype: synthesis and sealing are separate chemical jobs." :
              "That is the proofreading phenotype: fidelity can fail while strand synthesis continues.")
          ),
        },
      ];
    },
    summary(fixture) {
      const lagging = fixture.direction === "right" ? "upper" : "lower";
      return {
        rail: [
          { key: "geometry", value: fixture.direction + "-moving fork" },
          { key: "constraint", value: "5′→3′ synthesis" },
          { key: "strand", value: lagging + " copied in fragments" },
          { key: "perturbation", value: fixture.observable },
        ],
        takeaway: "The drawing can rotate, but the chemical rule does not. Template polarity determines continuity; the missing enzyme determines the observable defect.",
      };
    },
  });

  register({
    id: "rna-processing-transfer-challenge",
    coverage: {
      "ch06-o3": "A new exon fixture requires signal recognition and a mechanistic prediction of the mature splice product rather than recognition of the chapter diagram.",
      "ch06-o5": "The learner applies the exon-junction distance rule to decide whether a newly created premature stop triggers NMD or yields truncated protein.",
    },
    fixtures: [
      { key: "skip-nmd", label: "Transcript α", title: "Follow a donor variant into RNA fate", context: "In a four-exon human transcript, exon 2 loses the invariant +1 G of its 5′ donor. Skipping shifts the frame and creates a stop in exon 3, 94 nt before the final exon 3–4 junction.", exons: ["1", "2", "3", "4"], donorBroken: true, product: "1–3–4", signal: "the exon 2 invariant +1 donor base is broken", distance: 94, stopInLastExon: false, nmd: true, aria: "Four-exon human transcript with a broken exon 2 donor; exon 2 is skipped and a premature stop lies in exon 3, 94 nucleotides before the final exon 3 to 4 junction." },
      { key: "skip-escape", label: "Transcript β", title: "Use the NMD ruler, not the word premature", context: "In a four-exon human transcript, exon 2 loses its donor. Skipping creates a stop in exon 3 only 34 nt before the final exon 3–4 junction.", exons: ["1", "2", "3", "4"], donorBroken: true, product: "1–3–4", signal: "the exon 2 invariant donor is broken", distance: 34, stopInLastExon: false, nmd: false, aria: "Four-exon transcript whose exon 2 donor loss skips exon 2 and places a stop in exon 3, 34 nucleotides before the final exon 3 to 4 junction." },
      { key: "last-exon-stop", label: "Transcript γ", title: "Keep splicing and surveillance separate", context: "All splice signals in a four-exon transcript are intact, but a coding change creates a stop inside exon 4, the last exon.", exons: ["1", "2", "3", "4"], donorBroken: false, product: "1–2–3–4", signal: "splice signals remain intact", distance: 0, stopInLastExon: true, nmd: false, aria: "Normally spliced four-exon transcript with a premature stop in exon 4, the last exon." },
    ],
    visual: spliceVisual,
    steps(fixture) {
      const productLabel = fixture.product === "1–3–4" ?
        "Exon 1 joins exon 3; exon 4 remains downstream" :
        "Exons 1, 2, 3 and 4 remain joined in order";
      const fate = fixture.nmd ? "The transcript is targeted by NMD" : "The transcript escapes the canonical exon-junction NMD rule";
      return [
        {
          label: "locate",
          prompt: "What kind of information did the changed base alter?",
          reveal: fixture.signal,
          explanation: fixture.donorBroken ? "The +1 donor nucleotide is part of the splice signal, so its first consequence is on RNA recognition rather than amino-acid chemistry." : "The variant lies in coding sequence while donor, acceptor and branch signals remain intact.",
          options: [
            answer("The 5′ splice-donor signal", fixture.donorBroken, "A coding consequence is downstream here. The altered +1 base is read first by the splicing machinery."),
            answer("A coding base with splice signals intact", !fixture.donorBroken, "The fixture explicitly changes the invariant donor in this case; classify the molecular information before predicting the product."),
            answer("The poly(A) signal", false, "Polyadenylation occurs at the transcript end and does not explain the altered internal exon boundary."),
            answer("The translation start context", false, "The changed base is not near the initiation codon; the first affected reader is either the spliceosome or the coding frame."),
          ],
        },
        {
          label: "splice",
          prompt: "Which mature RNA is the specified human exon-definition fixture expected to make?",
          reveal: productLabel,
          explanation: fixture.donorBroken ? "Losing recognition of one boundary weakens definition of the whole internal exon, so exon 2 is skipped in this teaching fixture." : "With every splice signal intact, the mature RNA retains all three exons.",
          options: [
            answer("Exons 1–2–3–4", fixture.product === "1–2–3–4", "That product requires intact recognition of exon 2; the fixture states that its donor is lost."),
            answer("Exons 1–3–4", fixture.product === "1–3–4", "Do not skip exon 2 when the fixture says its splice boundaries remain intact."),
            answer("Exon 1 plus the retained intron", false, "That is a common yeast outcome. This fixture explicitly invokes human exon definition."),
            answer("No RNA is transcribed", false, "Splice-signal damage acts after transcription; it does not switch off RNA polymerase."),
          ],
        },
        {
          label: "surveil",
          prompt: "What does the canonical 50–55 nt exon-junction rule predict?",
          reveal: fate,
          explanation: fixture.nmd ? "A stop 94 nt upstream leaves a downstream exon-junction complex and is well beyond the 50–55 nt boundary, so NMD is expected." : fixture.stopInLastExon ? "A stop in the final exon has no downstream exon-junction complex to mark it as premature, so a truncated protein can be made." : "Thirty-four nucleotides is inside the boundary; the transcript can escape NMD and make a truncated product.",
          options: [
            answer("NMD degrades the transcript", fixture.nmd, "The word premature is not enough. Locate the stop relative to the last exon junction."),
            answer("It escapes NMD and may make truncated protein", !fixture.nmd, "A downstream junction more than 50–55 nt away is the key NMD trigger in this rule."),
            answer("The spliceosome removes the stop codon", false, "Splicing removes introns, not arbitrary coding stop codons in retained exons."),
            answer("Translation always reads through the stop", false, "Canonical termination still occurs; escaping NMD changes RNA abundance, not the meaning of the stop."),
          ],
        },
      ];
    },
    summary(fixture) {
      return {
        rail: [
          { key: "variant", value: fixture.signal },
          { key: "RNA", value: "exons " + fixture.product },
          { key: "stop geometry", value: fixture.stopInLastExon ? "last exon" : fixture.distance + " nt before final junction" },
          { key: "product", value: fixture.nmd ? "RNA degraded" : "truncated protein possible" },
        ],
        takeaway: "Signal recognition determines the isoform; exon-junction geometry then determines whether that isoform survives long enough to be translated.",
      };
    },
  });

  register({
    id: "translation-transfer-challenge",
    coverage: {
      "ch07-o1": "The learner converts a previously unseen strand into 5′→3′ mRNA, chooses the applicable reading frame, and translates the resulting codons.",
      "ch07-o7": "A changed sequence or translation table must be classified by its mechanistic coding consequence rather than by mutation-name recall.",
    },
    fixtures: [
      { key: "template-nonsense", label: "Sequence α", title: "Read the template in the productive direction", context: "The shown DNA is the template strand. A later edit changes the second mRNA codon from GAA to UAA.", strandLabel: "template DNA 3′→5′", dna: "3′–TAC CTT AAA ATT–5′", mrna: "5′–AUG GAA UUU UAA–3′", peptide: ["Met", "Glu", "Phe", "Stop"], change: "GAA → UAA", effect: "nonsense", aria: "Template DNA TAC CTT AAA ATT transcribes to AUG GAA UUU UAA and encodes methionine, glutamate, phenylalanine, stop." },
      { key: "coding-frameshift", label: "Sequence β", title: "Regroup after a one-base insertion", context: "The original coding strand was 5′–ATG GCT TGG TAA–3′. One A is inserted immediately after nucleotide 4; the edited coding strand is shown.", strandLabel: "edited coding DNA 5′→3′", dna: "5′–ATG GAC TTG GTA A…–3′", mrna: "5′–AUG GAC UUG GUA A…–3′", peptide: ["Met", "Asp", "Leu", "Val", "…"], change: "+A after base 4", effect: "frameshift", aria: "After one A is inserted after nucleotide four, edited coding DNA ATG GAC TTG GTA continues as mRNA AUG GAC UUG GUA and shifts every downstream codon." },
      { key: "mitochondrial-code", label: "Sequence γ", title: "Choose the biological translation table", context: "This open reading frame is from vertebrate mitochondrial DNA, not the nuclear genome.", strandLabel: "coding mtDNA 5′→3′", dna: "5′–ATA TGA AGA GGG–3′", mrna: "5′–AUA UGA AGA GGG–3′", peptide: ["Met", "Trp", "Stop"], change: "mitochondrial codon meanings", effect: "codon reassignment", aria: "Vertebrate mitochondrial coding sequence ATA TGA AGA uses ATA as methionine, TGA as tryptophan and AGA as stop." },
    ],
    visual: translationVisual,
    steps(fixture) {
      return [
        {
          label: "transcribe",
          prompt: "Which 5′→3′ mRNA follows from the labelled strand?",
          reveal: fixture.mrna,
          explanation: fixture.strandLabel.startsWith("template") ? "RNA polymerase reads the template 3′→5′ and builds the complementary RNA 5′→3′." : "The coding strand already matches the RNA sequence in the 5′→3′ direction, apart from T becoming U.",
          options: [
            answer(fixture.mrna, true, ""),
            answer("5′–UAC CUU AAA AUU–3′", false, "That copies the displayed letters without respecting whether the strand is coding or template."),
            answer("3′–AUG GAA UUU UAA–5′", false, "RNA is synthesised and translated in the 5′→3′ direction; reversing only the labels is not enough."),
            answer("5′–TAC CTT AAA ATT–3′", false, "An mRNA uses U rather than T and must be constructed from the labelled DNA strand relationship."),
          ],
        },
        {
          label: "translate",
          prompt: "What peptide is produced using the biologically appropriate code?",
          reveal: fixture.peptide.join("–"),
          explanation: fixture.effect === "codon reassignment" ? "In vertebrate mitochondria AUA encodes Met, UGA encodes Trp, and AGA is a stop, so the standard nuclear table gives the wrong peptide." : "Starting at AUG fixes the triplet grouping; translation stops at the first in-frame stop codon.",
          options: [
            answer(fixture.peptide.join("–"), true, ""),
            answer("Tyr–Leu–Lys–Ile", false, "Those meanings come from translating the complementary frame rather than the 5′→3′ mRNA shown."),
            answer("Met–Gly–Leu–Val", false, "Recheck the codon boundaries; amino acids are assigned to complete triplets from the chosen start."),
            answer("No peptide; every stop blocks initiation", false, "A downstream stop terminates an initiated peptide; it does not prevent the upstream AUG from being used."),
          ],
        },
        {
          label: "classify",
          prompt: "What is the mechanistic consequence of " + fixture.change + "?",
          reveal: fixture.effect,
          explanation: fixture.effect === "nonsense" ? "The substitution creates an in-frame stop, so it is nonsense rather than a frameshift." : fixture.effect === "frameshift" ? "One inserted base changes every downstream codon grouping because the code is read in non-overlapping triplets." : "The DNA is unchanged; the organelle-specific translation table changes what three codons mean.",
          options: [
            answer("Nonsense substitution", fixture.effect === "nonsense", "A nonsense change creates an in-frame stop; this fixture changes either the frame or the translation table."),
            answer("Frameshift", fixture.effect === "frameshift", "A frameshift requires an insertion or deletion not divisible by three."),
            answer("Mitochondrial codon reassignment", fixture.effect === "codon reassignment", "A different reading frame is not the issue here; the specified mitochondrial table reassigns codon meanings."),
            answer("Synonymous substitution", false, "The peptide or codon interpretation changes in every fixture; synonymous means the encoded amino acid is preserved under the same code."),
          ],
        },
      ];
    },
    summary(fixture) {
      return {
        rail: [
          { key: "labelled DNA", value: fixture.strandLabel },
          { key: "mRNA", value: fixture.mrna.replace(/^5′–|–3′$/g, "") },
          { key: "translation", value: fixture.peptide.join("–") },
          { key: "change", value: fixture.effect },
        ],
        takeaway: "Strand identity fixes the RNA, the start fixes the grouping, and the biological translation table fixes each codon meaning. Mutation class comes last.",
      };
    },
  });

  register({
    id: "meiosis-transfer-challenge",
    coverage: {
      "ch09-o4": "Unfamiliar marker-labelled products must be traced backwards through the two meiotic divisions rather than copied from a familiar chromosome drawing.",
      "ch09-o6": "The learner diagnoses meiosis-I, meiosis-II, or post-zygotic mitotic nondisjunction from allele-copy and mosaicism signatures.",
    },
    fixtures: [
      { key: "mi", label: "Products α", title: "Diagnose homolog nondisjunction", context: "The parent is A/a at a centromere-linked marker. The four meiotic products are shown.", products: ["A+a", "A+a", "∅", "∅"], division: "meiosis I", signature: "heterodisomy", markerMeaning: "Each disomic product contains both homolog alleles, so homologs travelled together before sisters separated.", conclusion: "Failure occurred at meiosis I; all four products are abnormal.", aria: "Four products: two contain both A and a homolog markers and two contain no copy." },
      { key: "mii", label: "Products β", title: "Diagnose sister nondisjunction", context: "The parent is A/a at a centromere-linked marker. One meiosis-II division fails.", products: ["A+A", "∅", "a", "a"], division: "meiosis II", signature: "isodisomy plus two normal products", markerMeaning: "The disomic product contains two copies of one homolog allele, while the other meiosis-I cell made two normal products.", conclusion: "Failure occurred at meiosis II; two of the four products are normal.", aria: "Four products: one contains two A copies, one none, and two contain one a copy." },
      { key: "mitotic", label: "Tissues γ", title: "Recognise a post-zygotic error", context: "One person has two sampled cell lineages: A/a diploid cells and A/A/a trisomic cells.", products: ["A/a", "A/a", "A/A/a", "A/A/a"], division: "post-zygotic mitosis", signature: "mosaic lineages", markerMeaning: "Normal and trisomic cells coexist in one individual, so the segregation error occurred after fertilisation.", conclusion: "This is mitotic mosaicism, not a uniform meiotic aneuploid conception.", aria: "Two normal diploid A a lineages and two trisomic A A a lineages coexist in one individual." },
    ],
    visual: meiosisVisual,
    steps(fixture) {
      return [
        {
          label: "diagnose",
          prompt: "At which division did the segregation error occur?",
          reveal: fixture.division,
          explanation: fixture.conclusion,
          options: [
            answer("Meiosis I", fixture.division === "meiosis I", "Meiosis-I failure sends different homologs together and leaves no normal meiotic products."),
            answer("Meiosis II", fixture.division === "meiosis II", "Meiosis-II failure affects sister chromatids in one of the two cells and therefore leaves two normal products."),
            answer("Post-zygotic mitosis", fixture.division === "post-zygotic mitosis", "A meiotic error is present from fertilisation and does not by itself produce normal and abnormal somatic lineages."),
            answer("DNA replication before meiosis", false, "Replication makes sister chromatids; the displayed dosage pattern requires a segregation error."),
          ],
        },
        {
          label: "read markers",
          prompt: "Which marker signature is decisive?",
          reveal: fixture.signature,
          explanation: fixture.markerMeaning,
          options: [
            answer("Both homolog alleles in each disomic product", fixture.signature === "heterodisomy", "That is heterodisomy and points to homologs failing at meiosis I."),
            answer("Two copies of one homolog plus two normal products", fixture.signature.startsWith("isodisomy"), "That pattern is produced when sister chromatids fail in one meiosis-II cell."),
            answer("Normal and aneuploid cell lineages in one person", fixture.signature === "mosaic lineages", "That is the defining evidence for a post-zygotic mitotic error."),
            answer("The total number of A alleles alone", false, "Allele identity across products, not only the total dose, distinguishes the division."),
          ],
        },
        {
          label: "predict",
          prompt: "What broader product pattern must follow?",
          reveal: fixture.conclusion,
          explanation: fixture.division === "meiosis I" ? "Both homologs enter one cell at meiosis I, so neither branch can make a normal gamete." : fixture.division === "meiosis II" ? "The unaffected meiosis-II division supplies two normal gametes while its sister division makes one disomic and one null product." : "The error occurs after the zygote has already founded more than one cell lineage, producing mosaicism.",
          options: [
            answer("All four gametes abnormal", fixture.division === "meiosis I", "That is the meiosis-I prediction; a meiosis-II error leaves an unaffected branch."),
            answer("Two normal, one disomic and one null gamete", fixture.division === "meiosis II", "That is the meiosis-II prediction; meiosis-I failure makes no normal gametes."),
            answer("Normal and abnormal somatic lineages", fixture.division === "post-zygotic mitosis", "That requires the error to occur after fertilisation."),
            answer("Four genetically identical normal products", false, "The displayed copy-number imbalance rules out normal segregation."),
          ],
        },
      ];
    },
    summary(fixture) {
      return {
        rail: [
          { key: "products", value: fixture.products.join(" · ") },
          { key: "marker signature", value: fixture.signature },
          { key: "failed separation", value: fixture.division },
          { key: "diagnosis", value: fixture.conclusion },
        ],
        takeaway: "Nondisjunction is diagnosed from which allele copies travel together and whether any normal products or cell lineages remain.",
      };
    },
  });

  const CHI_FIXTURES = [
    { key: "three-one", label: "Cross α", title: "Test a close-looking 3:1 result", context: "A monohybrid F₂ produces 118 dominant and 42 recessive offspring.", classes: ["dominant", "recessive"], observed: [118, 42], expected: [120, 40], estimated: 0, aria: "Observed counts 118 and 42 compared with expected counts 120 and 40." },
    { key: "dihybrid-distorted", label: "Cross β", title: "Find the class driving rejection", context: "A proposed 9:3:3:1 F₂ produces counts 70, 50, 30 and 10 out of 160.", classes: ["A_B_", "A_bb", "aaB_", "aabb"], observed: [70, 50, 30, 10], expected: [90, 30, 30, 10], estimated: 0, aria: "Observed dihybrid classes 70, 50, 30, 10 compared with 90, 30, 30, 10 expected." },
    { key: "fitted-parameter", label: "Cross γ", title: "Pay for a fitted parameter", context: "Three outcome classes have expected counts 60, 25 and 15 after one model parameter was estimated from these same data; observed counts are 64, 21 and 15.", classes: ["class 1", "class 2", "class 3"], observed: [64, 21, 15], expected: [60, 25, 15], estimated: 1, aria: "Three observed classes 64, 21, 15 and fitted expectations 60, 25, 15 with one estimated parameter." },
  ].map((fixture) => {
    const chi = fixture.observed.reduce((sum, value, index) => sum + (value - fixture.expected[index]) ** 2 / fixture.expected[index], 0);
    const df = fixture.classes.length - 1 - fixture.estimated;
    const critical = { 1: 3.841, 2: 5.991, 3: 7.815 }[df];
    const contributions = fixture.observed.map((value, index) => (value - fixture.expected[index]) ** 2 / fixture.expected[index]);
    return Object.assign(fixture, { chi, df, critical, reject: chi > critical, largest: contributions.indexOf(Math.max(...contributions)) });
  });

  register({
    id: "genetic-inference-transfer-challenge",
    coverage: {
      "ch12-o1": "A new count table must be translated into expected counts and a goodness-of-fit statistic under a stated genetic model.",
      "ch12-o2": "The learner subtracts both the probability-sum constraint and parameters estimated from the same data when determining degrees of freedom.",
      "ch12-o3": "The final decision distinguishes failure to reject from proof and rejection from identification of a biological mechanism.",
    },
    fixtures: CHI_FIXTURES,
    visual: chiSquareVisual,
    steps(fixture) {
      const decision = fixture.reject ? "Reject the proposed ratio at α = 0.05" : "Do not reject the proposed ratio at α = 0.05";
      return [
        {
          label: "specify",
          prompt: "How many degrees of freedom does this goodness-of-fit test have?",
          reveal: "df = " + fixture.df,
          explanation: "Start with " + fixture.classes.length + " classes, subtract one because probabilities sum to one" + (fixture.estimated ? ", and subtract one more for the parameter fitted from these data." : ". No parameter was fitted from these data."),
          options: [0, 1, 2, 3].map((value) => answer(String(value), value === fixture.df,
            "Use classes − 1 − parameters estimated from the same observations, not the sample size or number of hypotheses.")),
        },
        {
          label: "diagnose",
          prompt: "Which class contributes most to χ²?",
          reveal: fixture.classes[fixture.largest] + " drives the residual",
          explanation: "Contribution is (observed − expected)² / expected, so the same raw difference matters more in a smaller expected class.",
          options: fixture.classes.map((label, index) => answer(label, index === fixture.largest,
            "Compare squared residuals after dividing by each class's expected count; raw deviation alone is not the statistic.")).concat([
              answer("All classes contribute equally", false, "Equal raw differences do not contribute equally when their expected counts differ."),
              answer("The contribution cannot be localised", false, "The χ² sum retains a separate, inspectable contribution from every class."),
            ]),
        },
        {
          label: "interpret",
          prompt: "χ² = " + fixture.chi.toFixed(2) + " with df = " + fixture.df + ". What is the licensed conclusion at α = 0.05?",
          reveal: decision,
          explanation: fixture.reject ? "The statistic exceeds the df-specific critical value, so the stated ratio is inadequate. The test does not identify why." : "The statistic is below the critical value. These data are compatible with the model, but compatibility is not proof and may reflect limited power.",
          options: [
            answer("Reject the proposed ratio; the test does not identify the mechanism", fixture.reject, "A rejection says the specified expected multinomial is inadequate; it does not by itself name linkage, selection, scoring error or another cause."),
            answer("Do not reject; the data are compatible but do not prove the ratio", !fixture.reject, "A non-significant result is compatibility under the available power, not proof that the null is true."),
            answer("Accept the genetic hypothesis as proven", false, "A goodness-of-fit test never assigns probability one to the null model."),
            answer("The largest observed class alone decides", false, "Every class contributes through its expected count and the result is compared with a df-specific distribution."),
          ],
        },
      ];
    },
    summary(fixture) {
      return {
        rail: [
          { key: "model", value: fixture.expected.map((value) => number(value, 1)).join(" : ") },
          { key: "residual", value: fixture.classes[fixture.largest] + " contributes most" },
          { key: "test", value: "χ² " + fixture.chi.toFixed(2) + " · df " + fixture.df },
          { key: "claim", value: fixture.reject ? "ratio rejected; cause unresolved" : "compatible; not proven" },
        ],
        takeaway: "A genetic test begins with a fully specified expected distribution, pays for fitted parameters, and ends at a bounded statistical claim.",
      };
    },
  });

  register({
    id: "pedigree-transfer-challenge",
    coverage: {
      "ch15-o2": "An unfamiliar pedigree must be evaluated by decisive transmission constraints rather than matched to a memorised visual silhouette.",
      "ch15-o4": "A second-stage risk calculation updates a prior with unaffected status, offspring, or lineage-specific transmission evidence.",
    },
    fixtures: [
      { key: "xld", label: "Family α", title: "Use an affected father's transmissions", context: "The family is large enough that the displayed pattern is intended as the teaching fixture, not a single-child coincidence.", mode: "X-linked dominant", pattern: "Affected father + unaffected mother → four affected daughters and four unaffected sons.", decisive: "An affected father gives his X to every daughter and his Y to every son.", riskConclusion: "An affected heterozygous woman with an unaffected partner transmits the allele to 1/2 of children of either sex.", riskAnswer: "1/2 inherit the allele, either sex", aria: "Affected father and unaffected mother with four affected daughters and four unaffected sons.", people: [{ sex: "male", affected: true, label: "affected father" }, { sex: "female", affected: false, label: "unaffected mother" }, ...Array.from({ length: 4 }, (_, i) => ({ sex: "female", affected: true, label: "affected daughter " + (i + 1) })), ...Array.from({ length: 4 }, (_, i) => ({ sex: "male", affected: false, label: "unaffected son " + (i + 1) }))] },
      { key: "mitochondrial", label: "Family β", title: "Separate maternal transmission from penetrance", context: "Across two large sibships, an affected mother has six affected, variant-positive children; an affected father transmits the variant to none of five unaffected children.", mode: "mitochondrial", pattern: "Affected mother → all six children are affected and carry the variant; affected father → none of five children carry it.", decisive: "Mitochondria are transmitted through the oocyte, so paternal transmission is absent.", riskConclusion: "In this homoplasmic teaching fixture all children inherit the variant, but phenotype risk in a new family still depends on heteroplasmy, threshold and penetrance.", riskAnswer: "All inherit the variant; phenotype is not guaranteed", aria: "Maternal-only transmission across two large sibships.", people: [{ sex: "female", affected: true, label: "affected mother" }, ...Array.from({ length: 6 }, (_, i) => ({ sex: i % 2 ? "male" : "female", affected: true, label: "affected, variant-positive child " + (i + 1) })), { sex: "male", affected: true, label: "affected father" }, ...Array.from({ length: 5 }, (_, i) => ({ sex: i % 2 ? "female" : "male", affected: false, label: "unaffected, variant-negative child " + (i + 1) }))] },
      { key: "ar", label: "Family γ", title: "Update risk after an unaffected outcome", context: "Unaffected first-cousin parents have one affected son, one affected daughter, and one unaffected daughter.", mode: "autosomal recessive", pattern: "Unaffected related parents → affected children of both sexes.", decisive: "Two unaffected parents can share a recessive allele; both sexes are affected and consanguinity raises the shared-allele prior.", riskConclusion: "Conditional on being unaffected in an Aa × Aa family, the sister's carrier probability is 2/3, not 1/2.", riskAnswer: "2/3 carrier probability", aria: "Unaffected related parents with affected son, affected daughter and unaffected daughter.", people: [{ sex: "male", affected: false, label: "unaffected father" }, { sex: "female", affected: false, label: "unaffected mother" }, { sex: "male", affected: true, label: "affected son" }, { sex: "female", affected: true, label: "affected daughter" }, { sex: "female", affected: false, label: "unaffected daughter" }] },
    ],
    visual: pedigreeVisual,
    steps(fixture) {
      return [
        {
          label: "rank",
          prompt: "Which inheritance model best generates this complete fixture?",
          reveal: fixture.mode,
          explanation: fixture.decisive,
          options: ["autosomal recessive", "X-linked dominant", "mitochondrial", "autosomal dominant"].map((mode) =>
            answer(mode, mode === fixture.mode, "Apply the transmission constraints to every branch; do not match only the presence of affected males or females.")),
        },
        {
          label: "justify",
          prompt: "Which observation carries the most diagnostic weight?",
          reveal: fixture.decisive,
          explanation: fixture.decisive,
          options: [
            answer(fixture.decisive, true, ""),
            answer("The pedigree contains more than one affected person", false, "Multiple affected relatives support heritability but do not distinguish the transmission routes."),
            answer("At least one affected person is male", false, "Sex alone is suggestive; the direction of parent-to-child transmission is more decisive."),
            answer("The family is large", false, "Family size changes how surprising a pattern is, but the biological transmission constraint does the diagnostic work."),
          ],
        },
        {
          label: "update",
          prompt: "What risk statement follows for the specified relative?",
          reveal: fixture.riskAnswer,
          explanation: fixture.riskConclusion,
          options: [
            answer(fixture.riskAnswer, true, ""),
            answer("Exactly 100% phenotype risk", false, "Genotype transmission and phenotype expression are different probabilities whenever penetrance, heteroplasmy or an unaffected condition matters."),
            answer("Exactly 1/4 in every family", false, "One-quarter is the affected-child probability for an Aa × Aa recessive cross, not a universal pedigree risk."),
            answer("The pedigree determines the reproductive decision", false, "A risk estimate informs a decision; it does not determine values or choices."),
          ],
        },
      ];
    },
    summary(fixture) {
      const compactConstraint = {
        xld: "father's X → every daughter",
        mitochondrial: "maternal only; no paternal transmission",
        ar: "unaffected carrier parents; both sexes",
      }[fixture.key];
      return {
        rail: [
          { key: "pedigree", value: fixture.pattern },
          { key: "constraint", value: compactConstraint },
          { key: "mode", value: fixture.mode },
          { key: "updated risk", value: fixture.riskAnswer },
        ],
        takeaway: "Inheritance mode comes from transmission constraints. Risk then requires a separate conditional update for the particular relative and evidence.",
      };
    },
  });

  register({
    id: "dna-repair-transfer-challenge",
    coverage: {
      "ch17-o2": "The learner routes unfamiliar lesion chemistry to the pathway whose recognition and template strategy can actually repair it.",
      "ch17-o4": "A double-strand-break case requires cell-cycle and BRCA-state reasoning to determine resection, RAD51 loading, and pathway outcome.",
      "ch17-o5": "The final prediction connects repair dependence to mutation signature or synthetic-lethal drug sensitivity without treating pathway labels as isolated facts.",
    },
    fixtures: [
      { key: "uv-xpc", label: "Lesion α", title: "Route a bulky lesion before naming a gene", context: "A keratinocyte in G1 carries a UV pyrimidine dimer and lacks functional XPC.", contextLabel: "G1 keratinocyte", lesion: "UV dimer", defect: "XPC loss", route: "nucleotide excision repair", failedStep: "Global-genome bulky-lesion recognition fails, so UV dimers outside transcription-coupled repair persist.", observable: "UV-type C→T substitutions at dipyrimidines rise", correctRoute: "Nucleotide excision repair", correctFailure: "Global-genome bulky-lesion recognition fails", correctOutcome: "C→T at dipyrimidines", aria: "UV dimer in a G1 keratinocyte lacking XPC." },
      { key: "dsb-brca2", label: "Lesion β", title: "Follow a resected break without RAD51", context: "A double-strand break occurs in S phase in a BRCA2-null tumour cell treated with a PARP-trapping inhibitor.", contextLabel: "S phase · sister present", lesion: "double-strand break", defect: "BRCA2 loss", route: "homologous recombination", failedStep: "Resection can occur, but BRCA2 cannot load RAD51; repair falls into failed HR or deletion-prone escape.", observable: "PARP trapping creates selective HR-deficient killing", correctRoute: "Resect toward homologous recombination", correctFailure: "RAD51 loading fails after resection", correctOutcome: "Selective PARP-inhibitor sensitivity", aria: "S-phase double-strand break in a BRCA2-null tumour under PARP trapping." },
      { key: "o6mg-mgmt", label: "Lesion γ", title: "Use direct reversal before excision", context: "A replicating cell contains O6-methylguanine and has lost MGMT expression.", contextLabel: "replicating cell", lesion: "O6-methylguanine", defect: "MGMT absent", route: "direct reversal", failedStep: "The methyl group is not transferred to MGMT before replication, so O6-meG can pair with T.", observable: "G:C→A:T transition burden rises", correctRoute: "Direct reversal by MGMT", correctFailure: "Methyl transfer cannot occur", correctOutcome: "G:C→A:T transitions", aria: "O6-methylguanine in a replicating cell without MGMT." },
    ],
    visual: repairVisual,
    steps(fixture) {
      return [
        {
          label: "route",
          prompt: "Which normal repair strategy best matches this lesion and context?",
          reveal: fixture.correctRoute,
          explanation: "Pathway choice begins with lesion chemistry and template availability: " + fixture.route + " is the route that can resolve this substrate.",
          options: [
            answer(fixture.correctRoute, true, ""),
            answer("Mismatch repair", false, "Mismatch repair recognises replication mismatches in otherwise normal base pairs; it is not the generic answer to every altered base."),
            answer("Non-homologous end joining", false, "End joining acts on broken DNA ends and cannot remove an intact bulky or alkylated base."),
            answer("Translesion synthesis", false, "Tolerance can bypass a lesion to preserve a fork, but bypass is not repair of the lesion itself."),
          ],
        },
        {
          label: "breakpoint",
          prompt: "Where does the selected defect interrupt the mechanism?",
          reveal: fixture.correctFailure,
          explanation: fixture.failedStep,
          options: [
            answer(fixture.correctFailure, true, ""),
            answer("DNA polymerase loses all 5′→3′ synthesis", false, "The defect is pathway-specific; the core replication chemistry is still present."),
            answer("Every lesion is repaired by the homolog", false, "Template use differs by pathway and cell-cycle state; some lesions are directly reversed or excised from one strand."),
            answer("The checkpoint proves repair succeeded", false, "Damage signalling can arrest or kill a cell even when repair itself fails."),
          ],
        },
        {
          label: "predict",
          prompt: "Which downstream observation is the most mechanistically specific?",
          reveal: fixture.correctOutcome,
          explanation: fixture.observable + ". This follows when " + fixture.correctFailure.toLowerCase() + ".",
          options: [
            answer(fixture.correctOutcome, true, ""),
            answer("All mutation classes rise equally", false, "Different unrepaired lesions generate characteristic substitutions or dependencies rather than a uniform multiplier."),
            answer("The cell becomes mutation-free", false, "The observed mutation rate is the residual after incomplete repair; losing a route increases that residual."),
            answer("The phenotype is independent of cell-cycle phase", false, "Sister-template availability and CDK-controlled resection make phase central to double-strand-break outcomes."),
          ],
        },
      ];
    },
    summary(fixture) {
      return {
        rail: [
          { key: "substrate", value: fixture.lesion + " · " + fixture.contextLabel },
          { key: "normal route", value: fixture.route },
          { key: "defect", value: fixture.correctFailure },
          { key: "observable", value: fixture.observable },
        ],
        takeaway: "Repair pathways are causal strategies: lesion chemistry selects the route, cell state controls available templates, and the failed molecular step predicts the signature or dependency.",
      };
    },
  });

  /* Population and quantitative transfer specifications ----------------- */

  register({
    id: "ld-transfer-challenge",
    coverage: {
      "ch29-o1": "A phased chromosome table must be read as haplotypes, keeping chromosome-level combinations distinct from unphased diploid genotypes.",
      "ch29-o3": "The learner derives D, D′, and r² on new counts and uses each statistic for the question it actually answers.",
      "ch29-o4": "The final decision converts r² into tagging efficiency and sample-size cost, exposing why perfect D′ can still be a poor tag.",
    },
    fixtures: [
      { key: "strong-coupling", label: "Haplotypes α", title: "Measure strong but incomplete coupling", context: "One hundred phased chromosomes carry the four haplotypes below.", counts: { AB: 45, Ab: 5, aB: 5, ab: 45 }, phase: "AB and ab enriched", interpretation: "Strong correlation: the tag retains 64% of causal-allele information.", aria: "Haplotype counts AB 45, Ab 5, aB 5, ab 45." },
      { key: "perfect-dprime", label: "Haplotypes β", title: "Make D′ and r² disagree", context: "The rare A allele occurs only on B backgrounds, but B is common.", counts: { AB: 10, Ab: 0, aB: 40, ab: 50 }, phase: "A occurs only with B", interpretation: "D′ is 1 because one haplotype is absent, yet r² is only 0.11 and the tag costs about ninefold sample size.", aria: "Haplotype counts AB 10, Ab 0, aB 40, ab 50." },
      { key: "equilibrium", label: "Haplotypes γ", title: "Recognise linkage equilibrium", context: "All four haplotypes are equally frequent in one hundred phased chromosomes.", counts: { AB: 25, Ab: 25, aB: 25, ab: 25 }, phase: "no enriched allele pairing", interpretation: "D, D′ and r² are zero; neither marker predicts the other.", aria: "All four haplotype counts equal 25." },
    ],
    visual: ldVisual,
    steps(fixture, modelSet) {
      const result = modelSet.linkageDisequilibrium(Object.assign({ kind: "table" }, fixture.counts));
      const dLabel = result.D > 0 ? "Positive D: coupling haplotypes are enriched" : result.D < 0 ? "Negative D: repulsion haplotypes are enriched" : "D = 0: no allele pairing is enriched";
      const r2Label = "r² = " + result.r2.toFixed(2);
      const tagLabel = Number.isFinite(result.sampleFactor) ?
        "A tag study needs about " + result.sampleFactor.toFixed(2) + "× the causal-variant sample" :
        "This marker carries no tagging information at any finite sample size";
      return [
        {
          label: "phase",
          prompt: "What does the sign of D say about the observed allele pairing?",
          reveal: dLabel,
          explanation: "D compares observed AB frequency with pA × pB. Its sign identifies which phase is enriched; zero means independent pairing.",
          options: [
            answer("Positive D: coupling haplotypes are enriched", result.D > 0, "Positive D requires AB and ab to exceed their independence expectations."),
            answer("Negative D: repulsion haplotypes are enriched", result.D < 0, "Negative D requires Ab and aB to be enriched relative to independence."),
            answer("D = 0: no allele pairing is enriched", result.D === 0, "Equal marginal frequencies do not force D to zero; compare the joint AB frequency with pA × pB."),
            answer("The sign cannot be read from phased haplotypes", false, "A phased table is exactly the information needed to compute the sign of D."),
          ],
        },
        {
          label: "quantify",
          prompt: "What squared correlation do these haplotypes imply?",
          reveal: r2Label,
          explanation: "Using D²/[pA(1−pA)pB(1−pB)] gives " + result.r2.toFixed(3) + ". Unlike D′, r² measures predictability.",
          options: [0, 0.11, 0.64, 1].map((value) => answer("r² = " + value.toFixed(2), nearNumber(value, result.r2, 0.015),
            "Do not substitute D′ for r². Standardise D by both loci's allele-frequency variances, then square it.")),
        },
        {
          label: "apply",
          prompt: "What does this r² imply for a tag-SNP study?",
          reveal: tagLabel,
          explanation: fixture.interpretation,
          options: [
            answer(tagLabel, true, ""),
            answer("D′ alone guarantees perfect prediction", false, "D′ measures historical recombination relative to its frequency bound; it can equal one when a rare allele is still poorly predicted."),
            answer("More depth changes the population r² to one", false, "Depth estimates the existing haplotypes more precisely; it does not alter their population correlation."),
            answer("Genetic linkage and LD are the same property", false, "Physical linkage is a recombination-rate property; LD is a population association and can exist between unlinked loci."),
          ],
        },
      ];
    },
    summary(fixture, modelSet) {
      const result = modelSet.linkageDisequilibrium(Object.assign({ kind: "table" }, fixture.counts));
      return {
        rail: [
          { key: "haplotypes", value: Object.entries(fixture.counts).map(([key, value]) => key + " " + value).join(" · ") },
          { key: "departure", value: "D " + result.D.toFixed(3) + " · D′ " + result.dPrime.toFixed(2) },
          { key: "prediction", value: "r² " + result.r2.toFixed(2) },
          { key: "study cost", value: Number.isFinite(result.sampleFactor) ? result.sampleFactor.toFixed(2) + "× N" : "not taggable" },
        ],
        takeaway: "D gives direction, D′ normalises departure relative to the allele-frequency bound, and r² gives predictive information. They are not interchangeable.",
      };
    },
  });

  register({
    id: "heritability-transfer-challenge",
    coverage: {
      "ch31-o5": "A new variance or environment fixture must be converted into narrow-sense heritability and response R = h²S using only transmissible additive variance.",
      "ch31-o7": "The learner rejects malleability and between-group misreadings by separating within-population variance from mean differences and environmental intervention effects.",
    },
    fixtures: [
      { key: "two-environments", kind: "context", label: "Gardens α", title: "Keep heritability inside its environment", context: "The same breeding population has Vₐ = 20 in both gardens. Environmental variance is 5 in garden A and 80 in garden B; means are 50 and 70. Selection differential S = 10 in both.", values: { va: 20, veA: 5, veB: 80, meanA: 50, meanB: 70 }, selection: 10, meanInference: "The 20-unit mean difference is not partitioned by either within-garden h².", aria: "Same additive variance in two gardens with environmental variances 5 and 80 and means 50 and 70.", responseMetrics: (result) => [{ label: "R in A", value: (result.h2A * 10).toFixed(1) }, { label: "R in B", value: (result.h2B * 10).toFixed(1) }] },
      { key: "broad-narrow", kind: "partition", label: "Variance β", title: "Do not put dominance into the breeder's equation", context: "A trait has Vₐ = 20, Vᴅ = 20, Vᵢ = 0 and Vₑ = 10. The selected parents differ from the population mean by S = 10.", values: { va: 20, vd: 20, vi: 0, ve: 10 }, selection: 10, aria: "Variance components additive 20, dominance 20, epistatic zero and environmental 10." },
      { key: "environment-shift", kind: "context", label: "Cohorts γ", title: "Test the malleability claim", context: "Within each cohort Vₐ = 30 and Vₑ = 10, so h² is high. An environmental intervention moves cohort B's mean from 55 to 42 without changing genotypes. Use the post-intervention mean 42 below.", values: { va: 30, veA: 10, veB: 10, meanA: 40, meanB: 42 }, selection: 6, meanInference: "A large environmental intervention changed the mean despite h² = 0.75 within both cohorts.", aria: "Two cohorts both with heritability 0.75; an environmental intervention moves one mean close to the other.", responseMetrics: (result) => [{ label: "h² in both", value: result.h2A.toFixed(2) }, { label: "R if S = 6", value: (result.h2A * 6).toFixed(1) }] },
    ],
    visual: heritabilityVisual,
    steps(fixture, modelSet) {
      if (fixture.kind === "partition") {
        const result = modelSet.heritabilitySelection(Object.assign({ kind: "partition" }, fixture.values));
        return [
          {
            label: "partition", prompt: "What are narrow- and broad-sense heritability?", reveal: "h² " + result.h2.toFixed(2) + " · H² " + result.H2.toFixed(2), explanation: "Narrow h² uses Vₐ/Vₚ; broad H² includes additive, dominance and epistatic genetic variance.",
            options: [answer("h² = 0.40; H² = 0.80", true, ""), answer("h² = 0.80; H² = 0.40", false, "Broad-sense heritability cannot be smaller when it contains all of narrow-sense variance plus dominance."), answer("h² = H² = 0.80", false, "Dominance variance is genetic but does not enter narrow-sense heritability."), answer("h² = 0.20; H² = 1.00", false, "Both ratios use total phenotypic variance, including Vₑ, as the denominator.")],
          },
          {
            label: "transmit", prompt: "Which variance belongs in R = h²S?", reveal: "Vₐ only", explanation: "Average allelic effects are predictably transmitted; dominance combinations are broken and remade by segregation.",
            options: [answer("Additive variance Vₐ", true, ""), answer("All genetic variance Vₐ + Vᴅ + Vᵢ", false, "That is broad genetic variance, not the predictably transmitted component used by the breeder's equation."), answer("Environmental variance Vₑ", false, "Environmental variance affects the denominator but is not inherited response."), answer("Dominance variance Vᴅ alone", false, "Dominance describes within-genotype combinations and does not transmit as an average allele effect.")],
          },
          {
            label: "respond", prompt: "What first-generation response follows from S = 10?", reveal: "R = 4.0", explanation: "R = h²S = 0.40 × 10 = 4.0. Using H² would double-count non-additive variance.",
            options: [2, 4, 8, 10].map((value) => answer("R = " + value.toFixed(1), value === 4, "Use narrow-sense h², not broad H² or the full selection differential.")),
          },
        ];
      }
      const result = modelSet.heritabilitySelection(Object.assign({ kind: "context" }, fixture.values));
      const responseA = result.h2A * fixture.selection;
      const responseB = result.h2B * fixture.selection;
      return [
        {
          label: "estimate", prompt: "What is h² within each environment?", reveal: "A " + result.h2A.toFixed(2) + " · B " + result.h2B.toFixed(2), explanation: "The same Vₐ produces different h² when environmental variance changes the within-population denominator.",
          options: [
            answer("A " + result.h2A.toFixed(2) + "; B " + result.h2B.toFixed(2), true, ""),
            answer("Both equal the fraction of the mean caused by genes", false, "Heritability partitions variance among individuals, not the level of the population mean."),
            answer("A and B must match because the genotypes match", false, "Heritability is population- and environment-specific because Vₑ enters Vₚ."),
            answer("The larger mean has the larger h²", false, "Means do not appear in h² = Vₐ/Vₚ."),
          ],
        },
        {
          label: "bound claim", prompt: "What can these h² values say about the difference between means?", reveal: fixture.meanInference, explanation: fixture.meanInference,
          options: [answer("They do not apportion the between-group mean difference", true, ""), answer("The higher-h² group has the more genetic mean", false, "Within-group variance ratios do not decompose a difference between group means."), answer("High h² proves the trait cannot respond to environment", false, "Heritability and malleability answer different questions; an intervention can move the mean of a highly heritable trait."), answer("Every individual's phenotype is h² genetic", false, "A population variance fraction is not a decomposition of one person.")],
        },
        {
          label: "predict", prompt: "With S = " + fixture.selection + ", what first response is predicted?", reveal: "Rₐ " + responseA.toFixed(1) + " · Rᵦ " + responseB.toFixed(1), explanation: "Apply R = h²S separately inside each measured environment; do not import one population's estimate into the other.",
          options: [answer("A " + responseA.toFixed(1) + "; B " + responseB.toFixed(1), true, ""), answer("Both responses equal S", false, "That would require h² = 1 in both environments."), answer("Response equals the difference between group means", false, "The breeder's equation uses the selection differential, not an existing environmental mean difference."), answer("No response because environment matters", false, "Environmental variance reduces h² but does not erase additive genetic response when Vₐ remains positive.")],
        },
      ];
    },
    summary(fixture, modelSet) {
      if (fixture.kind === "partition") {
        const result = modelSet.heritabilitySelection(Object.assign({ kind: "partition" }, fixture.values));
        return { rail: [{ key: "variance", value: "Vₐ 20 · Vᴅ 20 · Vₑ 10" }, { key: "estimands", value: "h² " + result.h2.toFixed(2) + " · H² " + result.H2.toFixed(2) }, { key: "transmission", value: "Vₐ only" }, { key: "response", value: "R = 4.0" }], takeaway: "Genetic variance is not all predictably inherited. The breeder's equation uses narrow-sense heritability because additive effects survive segregation as average effects." };
      }
      const result = modelSet.heritabilitySelection(Object.assign({ kind: "context" }, fixture.values));
      return { rail: [{ key: "population", value: "same Vₐ in changed environments" }, { key: "within-group", value: "h² A " + result.h2A.toFixed(2) + " · B " + result.h2B.toFixed(2) }, { key: "between means", value: "not decomposed by h²" }, { key: "response", value: "R = h²S within context" }], takeaway: "Heritability belongs to a population in an environment. It predicts response from within-population additive variance; it does not assign causes to group means or individual phenotypes." };
    },
  });

  /* Genomics transfer specifications ------------------------------------ */

  register({
    id: "formats-transfer-challenge",
    coverage: {
      "ch41-o2": "A new FASTQ character is converted to Phred score and error probability without a reference sheet.",
      "ch41-o3": "The learner decodes an unfamiliar SAM FLAG and CIGAR, separating query-consuming from reference-consuming operations and computing the endpoint.",
      "ch41-o4": "A changed VCF representation must be normalised and distinguished from evidence supplied by a gVCF reference block.",
      "ch41-o5": "A novel interval is converted between half-open and inclusive coordinates while its biological length is preserved.",
      "ch41-o7": "The final claim keeps coordinate, reference build, and reference allele validation attached to the record.",
    },
    fixtures: [
      { key: "sam", kind: "sam", label: "Record α", title: "Decode one alignment without losing bases", context: "The SAM alignment starts at one-based POS 101 with FLAG 99 and CIGAR 5S10M2I5M3D4M6N8M.", lines: [{ label: "SAM", text: "r17  99  chr4  101  60  5S10M2I5M3D4M6N8M", tone: "source" }], reveals: ["FLAG 99: paired, proper pair, mate reverse, first in pair.", "CIGAR consumes 34 query bases and spans 36 reference bases, ending at 136.", "Insertions and soft clips consume query only; deletions and N consume reference."], aria: "SAM record flag 99 at position 101 with CIGAR 5S10M2I5M3D4M6N8M." },
      { key: "bed", kind: "bed", label: "Interval β", title: "Cross the coordinate boundary intact", context: "A BED row describes chr3 from start 99 to end 120.", lines: [{ label: "BED", text: "chr3  99  120  enhancer_7", tone: "source" }], reveals: ["BED is zero-based and half-open.", "The equivalent one-based inclusive interval is chr3:100–120.", "Both representations cover exactly 21 bases."], aria: "BED interval chromosome 3 start 99 end 120." },
      { key: "fastq-vcf", kind: "mixed", label: "Records γ", title: "Preserve meaning across two encodings", context: "A FASTQ base uses '?' with Phred+33. A GRCh37 VCF record encodes chr2:210 TAC>TGC. Its unique GRCh38 lift has target FASTA base C where the normalised REF would be A; a sample also has no ordinary VCF row at another locus.", lines: [{ label: "FASTQ", text: "base G · quality ? · Phred+33", tone: "source" }, { label: "GRCh37 VCF", text: "chr2  210  .  TAC  TGC", tone: "source" }, { label: "GRCh38 check", text: "unique lift · target FASTA REF = C, expected A", tone: "warning" }, { label: "absence", text: "no ordinary VCF row at chr8:500", tone: "warning" }], reveals: ["'?' is ASCII 63, so Q = 30 and error probability = 0.001.", "Normalise the source-build record to GRCh37 chr2:211 A>G.", "Reject the lifted record until its REF matches the target build; the missing row also proves nothing without callability evidence."], aria: "FASTQ quality character question mark, a GRCh37 VCF substitution TAC to TGC, a target-build reference mismatch, and a missing VCF row." },
    ],
    visual: formatVisual,
    steps(fixture, modelSet) {
      if (fixture.kind === "sam") {
        const flag = modelSet.formatCoordinate({ kind: "flag", flag: 99 });
        const cigar = modelSet.formatCoordinate({ kind: "cigar", cigar: "5S10M2I5M3D4M6N8M", start: 101 });
        return [
          { label: "flag", prompt: "What does FLAG 99 establish?", reveal: fixture.reveals[0], explanation: "The set bits are 1, 2, 32 and 64: paired, proper pair, mate reverse, first read.", options: [answer("Paired, proper pair, mate reverse, first in pair", flag.labels.length === 4, ""), answer("Unpaired secondary alignment", false, "Secondary alignment is bit 256 and unpaired would omit bit 1."), answer("Read unmapped; mate mapped", false, "Unmapped is bit 4; it is not set in 99."), answer("Duplicate and supplementary", false, "Duplicate 1024 and supplementary 2048 are not present.")] },
          { label: "span", prompt: "What query length and one-based reference endpoint follow from the CIGAR?", reveal: fixture.reveals[1], explanation: "Query consumes M/I/S/=X = 34 bases. Reference consumes M/D/N/=X = 36 bases, so end = 101 + 36 − 1 = 136.", options: [answer("34 query bases; reference ends at 136", cigar.queryLength === 34 && cigar.end === 136, ""), answer("36 query bases; reference ends at 134", false, "That swaps the query and reference operation sets."), answer("34 query bases; reference ends at 137", false, "One-based inclusive endpoints require subtracting one after adding the span."), answer("42 query bases; reference ends at 142", false, "Soft clips and insertions do not consume the reference; deletions and N do not consume the query.")] },
          { label: "explain", prompt: "Which operation bookkeeping rule is correct?", reveal: fixture.reveals[2], explanation: fixture.reveals[2], options: [answer("I and S consume query; D and N consume reference", true, ""), answer("Every CIGAR operation consumes both sequences", false, "Gaps and clips exist precisely because the two coordinate systems do not advance together."), answer("N consumes query because it is sequenced intron", false, "N is skipped reference sequence, commonly an intron absent from the RNA read."), answer("Soft clips advance POS", false, "POS locates the first aligned reference base; soft-clipped query bases lie outside the aligned reference span.")] },
        ];
      }
      if (fixture.kind === "bed") {
        const result = modelSet.formatCoordinate({ kind: "coordinate", system: "bed", start: 99, end: 120 });
        return [
          { label: "identify", prompt: "What coordinate convention does this BED row use?", reveal: fixture.reveals[0], explanation: "BED starts at zero and excludes its end coordinate.", options: [answer("Zero-based, half-open", true, ""), answer("One-based, inclusive", false, "That is the common GFF/VCF convention, not BED."), answer("Zero-based, inclusive", false, "BED excludes the end coordinate."), answer("One-based, half-open", false, "BED is zero-based at the start.")] },
          { label: "convert", prompt: "Which one-based inclusive interval names the same bases?", reveal: fixture.reveals[1], explanation: "Add one to the BED start and retain the BED end: 100–120.", options: [answer("chr3:100–120", result.targetStart === 100 && result.targetEnd === 120, ""), answer("chr3:99–120", false, "That leaves the zero-based start unconverted."), answer("chr3:100–121", false, "The excluded BED end becomes the included one-based end without adding one."), answer("chr3:99–119", false, "Subtracting from both ends changes the biological interval.")] },
          { label: "audit", prompt: "How many bases must both records cover?", reveal: fixture.reveals[2], explanation: "BED length is end − start = 21; inclusive length is 120 − 100 + 1 = 21.", options: [20, 21, 22, 120].map((value) => answer(value + " bases", value === 21, "Preserve interval length across the conversion; use the convention-specific length formula.")) },
        ];
      }
      return [
        { label: "quality", prompt: "What error probability does '?' encode under Phred+33?", reveal: fixture.reveals[0], explanation: "ASCII('?') = 63, so Q = 63 − 33 = 30 and P(error) = 10⁻³.", options: [answer("Q30; error probability 0.001", true, ""), answer("Q30; error probability 0.03", false, "Phred scores are logarithmic: Q30 means one error in one thousand, not 30%."), answer("Q63; error probability 10⁻⁶·³", false, "Subtract the declared ASCII offset before converting the score."), answer("Quality cannot be decoded", false, "The character and the Phred+33 offset fully determine it.")] },
        { label: "normalise", prompt: "What is the minimal source-build VCF representation?", reveal: fixture.reveals[1], explanation: "The T prefix and C suffix are shared, leaving A>G at the next base, position 211 on GRCh37.", options: [answer("GRCh37 chr2:211 A>G", true, ""), answer("GRCh37 chr2:210 A>G", false, "Trimming the shared prefix advances the position by one."), answer("GRCh38 chr2:211 TAC>TGC", false, "Normalisation does not silently change the reference build, and this leaves shared allele context untrimmed."), answer("The original is the only valid encoding", false, "VCF permits equivalent encodings; normalisation supplies a canonical comparison form.")] },
        { label: "bound claim", prompt: "Which final disposition preserves both reference-build and callability constraints?", reveal: fixture.reveals[2], explanation: "A unique coordinate lift is not enough: REF must match the target FASTA. Separately, ordinary VCF omission does not encode 0/0; an appropriate gVCF reference block or equivalent callability evidence is required.", options: [answer("Reject the REF-mismatched lift; treat the missing row as unknown without callability evidence", true, ""), answer("Accept the lift because its target coordinate is unique and call the missing row 0/0", false, "Coordinate uniqueness does not validate the target REF, and ordinary VCF omission is not a genotype."), answer("Rewrite target REF from A to C and keep ALT unchanged", false, "Changing REF without remapping the allele changes the biological variant; the representation must be re-derived and validated."), answer("Drop the build label after normalisation", false, "Coordinates and alleles only have meaning relative to a named reference assembly.")] },
      ];
    },
    summary(fixture) {
      const compactClaim = {
        sam: "query and reference operations stay distinct",
        bed: "same 21 biological bases",
        "fastq-vcf": "validate target REF; omission ≠ 0/0",
      }[fixture.key];
      return { rail: [{ key: "record", value: fixture.lines.map((line) => line.label).join(" + ") }, { key: "decode", value: fixture.reveals[0] }, { key: "transform", value: fixture.reveals[1] }, { key: "claim boundary", value: compactClaim }], takeaway: "A file record is a compact contract. Correct analysis preserves strand, coordinate convention, reference consumption, build, and the difference between missing data and reference evidence." };
    },
  });

  register({
    id: "alignment-transfer-challenge",
    coverage: {
      "ch42-o3": "A new gapped or splice alignment requires correct query/reference bookkeeping and a biologically appropriate affine or intron gap state.",
      "ch42-o4": "The learner converts candidate-score competition into an alignment-confidence statement without treating MAPQ as a universal score.",
      "ch42-o5": "Each case ends by separating an algorithmic limitation from an information limit imposed by read or fragment span.",
    },
    fixtures: [
      { key: "repeat", kind: "repeat", label: "Read α", title: "Stop an aligner at the information boundary", context: "A 100 bp read comes from one of two identical 300 bp repeats. Its paired fragment spans 150 bp, so neither end reaches unique flank.", tracks: [{ label: "locus 1", text: "unique—[ identical 300 bp repeat ]—unique", tone: "source" }, { label: "locus 2", text: "unique—[ identical 300 bp repeat ]—unique", tone: "source" }, { label: "fragment", text: "       <—— 150 bp ——>", tone: "warning" }], metrics: [{ label: "candidate placements", value: "2 equal" }, { label: "expected MAPQ", value: "≈3", tone: "warning" }], limit: "No scoring algorithm can identify the source from these molecules; a fragment spanning unique flank is new information.", aria: "Two identical 300 base repeats and a 150 base fragment contained entirely inside either copy." },
      { key: "splice", kind: "splice", label: "Read β", title: "Read an intron as skipped reference", context: "A 50 nt RNA-seq read aligns as 20M1000N30M across an annotated splice junction.", tracks: [{ label: "reference", text: "20 exonic bases — 1000 nt intron — 30 exonic bases", tone: "source" }, { label: "read", text: "20 matched bases ··········· 30 matched bases", tone: "signal" }, { label: "CIGAR", text: "20M1000N30M", tone: "active" }], metrics: [{ label: "query consumed", value: "50 nt" }, { label: "reference span", value: "1,050 nt", tone: "signal" }], limit: "An RNA-aware aligner needs an intron state; calling the 1000 nt gap a cheap deletion encodes the wrong biology.", aria: "Fifty nucleotide RNA read with CIGAR 20M1000N30M spanning a one thousand nucleotide intron." },
      { key: "mapq", kind: "mapq", label: "Read γ", title: "Turn score competition into confidence", context: "One aligner gives two candidate placements scores 45 and 35 at teaching temperature 1.", tracks: [{ label: "candidate A", text: "score 45 · best", tone: "signal" }, { label: "candidate B", text: "score 35 · alternative", tone: "muted" }], metrics: [{ label: "best-position probability", value: ">99.99%" }, { label: "teaching MAPQ", value: "≈43.4", tone: "signal" }], limit: "The calculation is meaningful only inside this aligner's candidate set, scoring model and calibration; MAPQ values are not universal across aligners.", aria: "Two alignment candidates with scores 45 and 35 under a softmax temperature of one." },
    ],
    visual: alignmentVisual,
    steps(fixture, modelSet) {
      if (fixture.kind === "repeat") {
        const result = modelSet.alignment({ kind: "repeat", repeatLength: 300, readLength: 100, insertSize: 150 });
        return [
          { label: "place", prompt: "How many equally supported genomic placements remain?", reveal: "two equal candidates", explanation: "Both molecules are identical across the entire fragment span, so the observed sequence has two sources.", options: [1, 2, 150, 300].map((value) => answer(String(value), value === 2, "Count placements compatible with the complete observed fragment, not bases or repeat length.")) },
          { label: "confidence", prompt: "What confidence should a calibrated aligner assign to the chosen one of two equal positions?", reveal: "low confidence · MAPQ about 3", explanation: "With two equal candidates, the best-position probability is 1/2 and −10log10(1−0.5) ≈ 3.", options: [answer("Low; MAPQ about 3", true, ""), answer("High; MAPQ 60", false, "A perfect sequence match is not unique evidence when another locus matches equally well."), answer("Zero because the read has errors", false, "Ambiguity here comes from repeated reference sequence, not read error."), answer("Confidence rises to 100% with more identical depth", false, "More molecules contained in the same repeat reproduce the ambiguity more precisely.")] },
          { label: "resolve", prompt: "What change can actually identify the source?", reveal: "span a unique flank", explanation: result.resolvable ? "The current fragment already spans the repeat." : "The current 150 bp span is shorter than the 300 bp repeat; longer molecules or links reaching unique flank add the missing information.", options: [answer("Use a molecule or pair spanning unique flank", true, ""), answer("Run the same seed search longer", false, "Computation cannot distinguish identical candidate strings."), answer("Sequence more 100 bp reads from the repeat interior", false, "Those reads add depth but not positional information."), answer("Raise the MAPQ threshold", false, "A threshold filters uncertainty; it does not resolve it.")] },
        ];
      }
      if (fixture.kind === "splice") {
        return [
          { label: "bookkeep", prompt: "How many query bases and reference bases are consumed?", reveal: "50 query · 1,050 reference", explanation: "M consumes both; N consumes reference only. Thus query = 20+30 and span = 20+1000+30.", options: [answer("50 query; 1,050 reference", true, ""), answer("1,050 query; 50 reference", false, "That reverses the sequence consumed by N."), answer("1,050 query and reference", false, "The intron is absent from the mature RNA read."), answer("50 query and reference", false, "N advances the reference coordinate by the skipped intron length.")] },
          { label: "encode", prompt: "Why should the 1000 nt operation be N rather than D?", reveal: "N encodes a splice gap", explanation: "An intron is a biologically expected skipped reference interval, not a thousand-base deletion in the RNA molecule.", options: [answer("N represents a splice junction skipped from mature RNA", true, ""), answer("D is always cheaper than N", false, "The aligner needs a separate intron state because the biological prior differs from an indel."), answer("N consumes query bases", false, "N consumes reference only."), answer("The letters are interchangeable", false, "Downstream tools interpret D as a deletion and N as skipped reference, so the distinction changes the biological record.")] },
          { label: "choose algorithm", prompt: "What capability must the aligner have?", reveal: "RNA-aware splice alignment", explanation: "Seed-and-extend alone is not enough if the dynamic program has no intron transition or splice-site model.", options: [answer("An intron-aware gap state and splice-site model", true, ""), answer("Only a larger mismatch penalty", false, "A mismatch penalty cannot jump a 1000 nt reference interval absent from the read."), answer("A shorter seed with no extension", false, "Seeds find candidate exons; extension must connect them across the intron."), answer("No reference genome", false, "The CIGAR and splice coordinates are defined relative to a reference.")] },
        ];
      }
      const result = modelSet.alignment({ kind: "mapq", scores: [45, 35], temperature: 1 });
      return [
        { label: "compete", prompt: "What is the approximate probability of the best placement under this two-candidate teaching softmax?", reveal: result.best > 0.9999 ? ">99.99%" : percent(result.best, 2), explanation: "Exponentiating scores relative to the maximum makes the 10-point lower candidate contribute e⁻¹⁰ of the best weight. The result is very close to, but not exactly, one.", options: [answer(">99.99%", result.best > 0.9999, ""), answer("90%", false, "A ten-unit score difference in this specified temperature is exponential, not a ten-percentage-point margin."), answer("50%", false, "The candidates do not have equal scores."), answer("Probability cannot depend on alternatives", false, "MAPQ is explicitly about competition among candidate positions.")] },
        { label: "convert", prompt: "What teaching MAPQ follows?", reveal: result.mapq.toFixed(1), explanation: "MAPQ = −10log10(1−Pbest) ≈ " + result.mapq.toFixed(1) + ".", options: [3, 10, 20, 43.4].map((value) => answer("MAPQ " + value, nearNumber(value, result.mapq, 0.2), "Convert the error probability 1−Pbest on the Phred scale.")) },
        { label: "bound claim", prompt: "Can MAPQ 43.4 be compared directly with another aligner's MAPQ 43.4?", reveal: "not without calibration context", explanation: "Candidate generation, scores, priors and calibration differ among aligners, so identical MAPQ numbers need not represent identical empirical error rates.", options: [answer("No; candidate set and calibration are aligner-specific", true, ""), answer("Yes; all aligners use the same posterior model", false, "The numeric convention is shared but its estimated probability is model-dependent."), answer("Yes, if read length matches", false, "Read length is only one input; candidate search and scoring still differ."), answer("MAPQ is an alignment score, so alternatives do not matter", false, "Alignment score measures fit; MAPQ measures uncertainty among placements.")] },
      ];
    },
    summary(fixture) {
      const compactBoundary = {
        repeat: "needs a unique-flank span",
        splice: "requires an intron-aware state",
        mapq: "aligner-specific calibration",
      }[fixture.kind];
      return { rail: [{ key: "read evidence", value: fixture.tracks.map((track) => track.text).join(" · ") }, { key: "candidate model", value: fixture.metrics[0].value }, { key: "confidence", value: fixture.metrics[1].value }, { key: "boundary", value: compactBoundary }], takeaway: "Alignment is inference over competing placements. Gap states encode biology, MAPQ encodes competition inside one model, and identical molecules impose an information limit no algorithm can cross." };
    },
  });

  register({
    id: "assembly-transfer-challenge",
    coverage: {
      "ch43-o1": "The learner builds and reads an unfamiliar de Bruijn graph from its k-mer multiset, treating k-mers as edges between prefix and suffix nodes.",
      "ch43-o3": "Multiple valid Eulerian walks must be recognised as non-identifiability caused by missing sequence span rather than an algorithm that has not searched hard enough.",
    },
    fixtures: [
      { key: "ambiguous-k3", label: "Graph α", title: "Find two genomes in one k-mer multiset", context: "The teaching genome AACAACACG is shredded into all 3-mers. Ignore sequencing error and use every edge exactly once.", sequence: "AACAACACG", k: 3, informationClaim: "Two distinct Eulerian walks use the same multiset. A longer molecule linking the repeated branches is required.", aria: "De Bruijn graph from all 3-mers of AACAACACG with two valid assemblies." },
      { key: "resolved-k4", label: "Graph β", title: "Change k and collapse the ambiguity", context: "The same genome AACAACACG is now represented by all 4-mers at adequate error-free coverage.", sequence: "AACAACACG", k: 4, informationClaim: "The longer k-mers preserve enough neighbouring context to leave one valid walk in this fixture.", aria: "De Bruijn graph from all 4-mers of AACAACACG with one valid assembly." },
      { key: "repeat-unique", label: "Graph γ", title: "Do not equate repetition with ambiguity", context: "The genome ATGCATG contains the 3-mer ATG twice. Use its complete 3-mer multiset.", sequence: "ATGCATG", k: 3, informationClaim: "A repeated k-mer creates a repeated edge, but the graph topology still permits only one complete walk here.", aria: "De Bruijn graph from 3-mers of ATGCATG with a repeated ATG edge and one valid assembly." },
    ],
    visual: assemblyVisual,
    steps(fixture, modelSet) {
      const result = modelSet.assembly(fixture.sequence, fixture.k);
      const candidateLabel = result.candidates.length + (result.candidates.length === 1 ? " valid assembly" : " valid assemblies");
      return [
        {
          label: "construct",
          prompt: "In the de Bruijn framing, what does each displayed k-mer represent?",
          reveal: "an edge from its (k−1)-prefix to its (k−1)-suffix",
          explanation: "For k = " + fixture.k + ", each " + fixture.k + "-mer edge connects two " + (fixture.k - 1) + "-mer nodes that overlap by " + (fixture.k - 2) + " bases.",
          options: [
            answer("An edge from its prefix node to its suffix node", true, ""),
            answer("A node with no direction", false, "In the Eulerian de Bruijn framing, (k−1)-mers are nodes and observed k-mers are directed edges."),
            answer("A complete read-overlap assembly", false, "One k-mer is local evidence, not a whole assembly."),
            answer("A sequencing error by definition", false, "Repeated or branching k-mers can come from real sequence; error status requires other evidence."),
          ],
        },
        {
          label: "walk",
          prompt: "How many complete sequences can use every observed edge exactly once?",
          reveal: candidateLabel,
          explanation: result.candidates.length === 1 ? "The directed edge multiplicities admit one complete Eulerian walk: " + result.candidates[0] + "." : "Both " + result.candidates.join(" and ") + " consume the same edges with the same multiplicities.",
          options: [1, 2, result.edges.length, result.nodes.length].filter((value, index, array) => array.indexOf(value) === index).map((value) =>
            answer(String(value), value === result.candidates.length, "A candidate must use every edge with its observed multiplicity; count complete valid walks, not nodes or edges.")),
        },
        {
          label: "identify limit",
          prompt: "What is the correct next action or conclusion?",
          reveal: fixture.informationClaim,
          explanation: fixture.informationClaim,
          options: [
            answer(result.candidates.length > 1 ? "Obtain longer-range sequence linking the branches" : "Report the unique walk for this idealised fixture", true, ""),
            answer("Run the same graph search longer until one answer wins", false, "Equivalent complete walks do not become unequal through more computation."),
            answer("Choose the lexicographically first sequence", false, "A naming convention is not biological evidence."),
            answer("Discard every repeated k-mer", false, "Real genomes contain repeats; deleting their edges destroys coverage and can invent gaps."),
          ],
        },
      ];
    },
    summary(fixture, modelSet) {
      const result = modelSet.assembly(fixture.sequence, fixture.k);
      return { rail: [{ key: "observations", value: result.kmers.join(" · ") }, { key: "graph", value: result.nodes.length + " nodes · " + result.edges.length + " edges" }, { key: "walks", value: result.candidates.length + " complete" }, { key: "claim", value: result.candidates.length > 1 ? "sequence not identified" : "unique in this model" }], takeaway: "Assembly is identified only when the observed edge multiset supports one complete walk. When two genomes generate the same data, longer-range evidence, not a cleverer search, resolves them." };
    },
  });

  register({
    id: "variant-calling-transfer-challenge",
    coverage: {
      "ch46-o1": "A new pileup must be evaluated with base-quality likelihoods and a genotype prior instead of an allele-count threshold.",
      "ch46-o4": "The learner diagnoses strand, mapping-quality, and allele-balance artefacts as distinct evidence rather than treating depth as automatic confirmation.",
      "ch46-o7": "The final claim distinguishes reference evidence, filtered or uncallable evidence, and complete absence of observation.",
    },
    fixtures: [
      { key: "clean-het", kind: "posterior", label: "Pileup α", title: "Call a balanced high-quality site", context: "At a callable diploid site, 18 Q35 reads support C and 17 Q35 reads support T. The teaching prior alt frequency is 0.10.", reads: [{ label: "reference", sequence: "…C…  ×18  · both strands · MAPQ 60", tone: "source" }, { label: "alternate", sequence: "…T…  ×17  · both strands · MAPQ 58", tone: "signal" }], revealedMetrics: [[{ label: "allele balance", value: "0.49", tone: "signal" }], [{ label: "technical flags", value: "none in fixture" }]], claim: "The data support a heterozygous 0/1 candidate at a callable site; genotype certainty still belongs to the stated model and prior.", aria: "Callable site with 18 high-quality reference reads and 17 high-quality alternate reads on both strands." },
      { key: "strand-artifact", kind: "filter", label: "Pileup β", title: "Reject depth that comes from one bad direction", context: "Thirty reference reads occur on both strands. Eight alternate reads are all forward-strand and have MAPQ 20 versus reference MAPQ 60.", reads: [{ label: "reference", sequence: "← …C… →  ×30  · MAPQ 60", tone: "source" }, { label: "alternate", sequence: "→ …T…     ×8   · MAPQ 20", tone: "warning" }], revealedMetrics: [[{ label: "alternate balance", value: "0.21" }], [{ label: "flags", value: "strand bias + mapping shift", tone: "warning" }]], claim: "This is artefact-dominated evidence. More copies of the same biased alignment do not turn it into an inherited heterozygous call.", aria: "Pileup with thirty bidirectional reference reads and eight forward-only low-MAPQ alternate reads." },
      { key: "uncovered", kind: "callable", label: "Locus γ", title: "Interpret an empty call correctly", context: "The reference contains the locus and the target interval was included, but the sample has depth 0. No ordinary VCF row is emitted.", reads: [], baseMetrics: [{ label: "reference locus", value: "present" }, { label: "target", value: "included" }, { label: "depth", value: "0", tone: "warning" }], revealedMetrics: [[{ label: "callability", value: "uncovered", tone: "warning" }], [{ label: "genotype likelihood", value: "not informed" }]], claim: "No-call is the only defensible genotype statement. A missing VCF row is not a confident reference genotype.", aria: "Representable included locus with zero sequencing depth and no VCF row." },
    ],
    visual: pileupVisual,
    steps(fixture, modelSet) {
      if (fixture.kind === "posterior") {
        const result = modelSet.variantCaller({ kind: "posterior", refCount: 18, altCount: 17, quality: 35, altFrequency: 0.10 });
        return [
          { label: "infer", prompt: "Which genotype has the highest posterior under the stated model?", reveal: result.genotype, explanation: "Balanced high-quality support for both alleles overwhelms the low population prior and favours 0/1.", options: ["0/0", "0/1", "1/1", "no-call"].map((genotype) => answer(genotype, genotype === result.genotype, "Use the read likelihoods for all observations and then apply the stated genotype prior.")) },
          { label: "audit", prompt: "Which technical pattern is most important in this supplied fixture?", reveal: "balanced strands, qualities and allele fraction", explanation: "The alternate observations occur on both strands, have mapping quality comparable to reference reads, and sit near the diploid heterozygous expectation.", options: [answer("No supplied artefact flag; evidence is balanced", true, ""), answer("Severe strand bias", false, "The fixture explicitly places both alleles on both strands."), answer("Low alternate mapping quality", false, "Alternate MAPQ is comparable with reference MAPQ in this case."), answer("No coverage", false, "Thirty-five reads cover the site.")] },
          { label: "bound claim", prompt: "What can the caller report?", reveal: "0/1 candidate at a callable site", explanation: fixture.claim, options: [answer("A high-support heterozygous candidate under this model", true, ""), answer("A universally certain biological truth", false, "Posterior confidence is conditional on the reference, alignments, error model and prior."), answer("No variant because the prior frequency is low", false, "A prior changes starting odds; sufficiently strong data can update away from it."), answer("Somatic origin is proven", false, "A germline-style pileup alone does not establish tissue origin or clonality.")] },
        ];
      }
      if (fixture.kind === "filter") {
        const result = modelSet.variantCaller({ kind: "filter", refCount: 30, forwardAlt: 8, reverseAlt: 0, altMapq: 20, refMapq: 60 });
        return [
          { label: "count", prompt: "What alternate allele balance is observed?", reveal: result.alleleBalance.toFixed(2), explanation: "Eight of 38 reads support the alternate: 8/38 = " + result.alleleBalance.toFixed(2) + ". Counts describe the pileup but do not yet validate it.", options: [0.08, 0.21, 0.27, 0.50].map((value) => answer(value.toFixed(2), nearNumber(value, result.alleleBalance, 0.01), "Divide alternate reads by total reads, not by reference reads alone.")) },
          { label: "diagnose", prompt: "Which evidence makes the call artefact-dominated?", reveal: result.flags.join(" + "), explanation: "All alternate support comes from one strand and its mappings are forty MAPQ units worse than reference support.", options: [answer("Strand bias plus a large mapping-quality shift", result.flags.includes("strand bias") && result.flags.includes("mapping-quality rank shift"), ""), answer("High balanced depth", false, "Depth is not independent support when the alternate observations share the same directional and mapping defect."), answer("A common population prior", false, "The fixture supplies technical evidence, not a population-frequency argument."), answer("Ti/Tv at one site", false, "Ti/Tv is a sample- or callset-level QC ratio, not the decisive signal in one pileup.")] },
          { label: "bound claim", prompt: "What is the correct disposition?", reveal: "reject or re-evaluate as likely artefact", explanation: fixture.claim, options: [answer("Re-evaluate or filter; do not call inherited 0/1 from this pileup", true, ""), answer("Call 0/1 because eight reads exceed a threshold", false, "A count threshold ignores the shared error mechanism visible in strand and mapping evidence."), answer("Call 1/1 because every alternate read agrees", false, "Most reads are reference and the alternate subset is technically biased."), answer("Declare the locus absent from the reference", false, "Reads aligned there; the problem is trust in the alternate observations, not locus representation.")] },
        ];
      }
      const result = modelSet.variantCaller({ kind: "callable", depth: 0, mapq: 0, included: true, referenceHasLocus: true });
      return [
        { label: "classify", prompt: "What is the site's callability state?", reveal: result.status, explanation: "The locus exists and was targeted, but zero molecules were observed, so it is uncovered.", options: [answer("Uncovered", result.status === "uncovered", ""), answer("Callable reference", false, "A reference call needs reads that support the reference under a caller model."), answer("Excluded before calling", false, "The fixture says the interval was included."), answer("Not representable", false, "The reference contains the locus.")] },
        { label: "infer", prompt: "What genotype likelihood information is present?", reveal: "none from sequence observations", explanation: "With zero depth, the data likelihood cannot discriminate 0/0, 0/1 and 1/1; only a prior would remain.", options: [answer("No sequence likelihood separates the genotypes", true, ""), answer("0/0 has probability one", false, "Absence of reads is absence of genotype evidence."), answer("0/1 is most likely because variants are omitted", false, "Ordinary VCF omission does not encode a genotype."), answer("1/1 is most likely because coverage failed", false, "Coverage failure is independent of which allele would have been present.")] },
        { label: "bound claim", prompt: "What should the report say?", reveal: "no-call", explanation: fixture.claim, options: [answer("No-call / insufficient coverage", true, ""), answer("Homozygous reference", false, "That would convert missing evidence into negative evidence."), answer("Variant absent", false, "Biological absence is not observed at an uncovered locus."), answer("Delete the locus from the reference", false, "The reference representation is not the cause of zero sample depth in this fixture.")] },
      ];
    },
    summary(fixture) {
      const compactObservation = fixture.kind === "posterior" ? "18 C / 17 T · Q35" : fixture.kind === "filter" ? "30 ref / 8 forward-only alt" : "included locus · depth 0";
      const compactClaim = fixture.kind === "posterior" ? "0/1 under stated model" : fixture.kind === "filter" ? "filter and re-evaluate" : "no-call, not 0/0";
      return { rail: [{ key: "observation", value: compactObservation }, { key: "quality audit", value: fixture.revealedMetrics[1][0].value }, { key: "call state", value: fixture.kind === "posterior" ? "0/1 supported" : fixture.kind === "filter" ? "artefact-dominated" : "uncovered" }, { key: "licensed claim", value: compactClaim }], takeaway: "Variant calling combines likelihood with priors and technical context. A count is not a genotype, a biased pileup is not independent evidence, and a missing call is not a reference call." };
    },
  });

  register({
    id: "clinical-interpretation-transfer-challenge",
    coverage: {
      "ch55-o2": "A fictional evidence dossier must be grouped by biological source, strength, and direction before applying a combining rule.",
      "ch55-o3": "The learner converts a signed point total into a Bayesian posterior and five-tier classification under the chapter's stated teaching calibration.",
      "ch55-o5": "Correlated computational predictors are collapsed into one calibrated observation rather than counted as independent votes.",
      "ch55-o7": "The final decision preserves the VUS action boundary and demonstrates how a dated classification changes when genuinely new evidence arrives.",
    },
    fixtures: [
      { key: "vus-predictors", label: "Dossier α", title: "Refuse to turn agreement into independence", context: "A fictional missense variant is absent from a well-covered population database. Three algorithms trained on overlapping features call it damaging; their calibrated score lies in the indeterminate interval. No informative family or functional evidence exists.", evidence: [{ source: "population", observation: "absent with coverage", points: "+1", tone: "signal" }, { source: "computational", observation: "3 correlated, indeterminate", points: "0", tone: "warning" }, { source: "family/function", observation: "none", points: "0", tone: "muted" }], groups: 2, collapsed: 3, points: 1, action: "This remains a VUS. It licenses neither disease-causing action nor benign reassurance; seek independent family or functional evidence.", aria: "Fictional variant dossier with one rarity point, three correlated indeterminate predictors and no family evidence." },
      { key: "lof-pathogenic", label: "Dossier β", title: "Combine independent strong evidence once", context: "A fictional null variant occurs in a gene where loss of function is an established disease mechanism. The affected transcript is biologically relevant; the allele is absent with adequate coverage and the phenotype is highly specific.", evidence: [{ source: "molecular consequence", observation: "established LoF mechanism", points: "+8", tone: "signal" }, { source: "population", observation: "absent with coverage", points: "+1", tone: "signal" }, { source: "phenotype", observation: "highly specific", points: "+1", tone: "signal" }], groups: 3, collapsed: 0, points: 10, action: "Under this bounded teaching calibration the dossier reaches Pathogenic. Clinical use still requires the correct patient, disease, transcript and date.", aria: "Fictional loss-of-function dossier with independent plus eight, plus one and plus one evidence." },
      { key: "reclassification", label: "Dossier γ", title: "Let new evidence move a dated classification", context: "A fictional variant has strong functional evidence (+4) and independent lack-of-segregation evidence (−4), initially net zero. A later definitive high-frequency population observation adds −8.", evidence: [{ source: "function", observation: "abnormal validated assay", points: "+4", tone: "signal" }, { source: "family", observation: "fails to segregate", points: "−4", tone: "warning" }, { source: "new population", observation: "definitive benign frequency", points: "−8 later", tone: "warning" }], groups: 3, collapsed: 0, points: -8, currentPoints: 0, action: "The old record was VUS at net 0. The new independent −8 evidence changes the dated classification to Benign; the record must be re-evaluated rather than treated as an intrinsic permanent label.", aria: "Conflicting functional and family evidence initially net zero, followed later by definitive negative eight benign population evidence." },
    ],
    visual: clinicalVisual,
    steps(fixture, modelSet) {
      const result = modelSet.clinical({ kind: "posterior", points: fixture.points, prior: 0.10 });
      const initial = fixture.currentPoints == null ? null : modelSet.clinical({ kind: "posterior", points: fixture.currentPoints, prior: 0.10 });
      return [
        {
          label: "group", prompt: "How should the dossier be counted before combining evidence?", reveal: fixture.groups + " independent groups; " + fixture.collapsed + " correlated items collapsed", explanation: fixture.key === "vus-predictors" ? "The three algorithms share features and training information. Their agreement is one computational observation, and this calibrated score is indeterminate." : "Each listed source represents a different biological observation in this teaching dossier; none should be silently duplicated.",
          options: [answer(fixture.key === "vus-predictors" ? "Collapse the three predictors; count no computational point" : "Count each listed independent biological source once", true, ""), answer("Count every tool or database label as independent", false, "Shared data, features or biological observations create correlated evidence and must not be multiplied."), answer("Discard all evidence because no item is perfect", false, "Bayesian evidence can be partial; the task is to calibrate and combine it without double-counting."), answer("Let the current ClinVar label replace the dossier", false, "A record label is a dated summary; the underlying evidence and review status must be read.")] },
        {
          label: "combine", prompt: fixture.currentPoints == null ? "What net points, posterior and tier follow under the chapter's teaching calibration?" : "After the new independent −8 observation, what tier follows?", reveal: (fixture.points > 0 ? "+" : "") + fixture.points + " points · " + result.tier, explanation: "Signed evidence adds on the log-odds scale. Here the net is " + fixture.points + ", giving posterior " + percent(result.posterior, 2) + " and tier " + result.tier + ".",
          options: [answer((fixture.points > 0 ? "+" : "") + fixture.points + " · " + result.tier, true, ""), answer("Every dossier is Pathogenic once one test is abnormal", false, "A single observation must be calibrated and weighed against independent benign and pathogenic evidence."), answer("Three agreeing algorithms automatically make Likely pathogenic", false, "Correlated predictors are not three likelihood ratios."), answer("The point total is a probability percentage", false, "Points encode log evidence; the prior and odds calibration convert them to posterior probability.")] },
        {
          label: "act", prompt: initial ? "What should happen to the older classification?" : "What action boundary follows from this tier?", reveal: fixture.action, explanation: fixture.action,
          options: [answer(initial ? "Re-evaluate and replace the dated record with the evidence-supported new tier" : result.tier === "Uncertain significance" ? "No pathogenic or benign clinical action from the VUS alone" : "Use only in the matching clinical context with the full evidence record", true, ""), answer("Treat the DNA change's label as permanent", false, "Classification belongs to a variant–gene–disease pair on a date and can move with evidence."), answer("Use a VUS for predictive testing of relatives", false, "A VUS is deliberately non-actionable because evidence does not cross either boundary."), answer("Ignore contradictory evidence after a laboratory has submitted a label", false, "The evidence, review status and date matter more than an isolated submitted label.")] },
      ];
    },
    summary(fixture, modelSet) {
      const result = modelSet.clinical({ kind: "posterior", points: fixture.points, prior: 0.10 });
      const compactAction = fixture.key === "vus-predictors" ? "VUS boundary held" : fixture.key === "lof-pathogenic" ? "Pathogenic in matching context" : "VUS → Benign; update record";
      const posteriorLabel = percent(result.posterior, result.posterior < 0.001 ? 2 : 1);
      return { rail: [{ key: "observations", value: fixture.groups + " independent sources" }, { key: "dependence audit", value: fixture.collapsed ? fixture.collapsed + " predictor outputs collapsed" : "no duplication" }, { key: "Bayes", value: fixture.points + " points → " + posteriorLabel }, { key: "dated action", value: compactAction }], takeaway: "Clinical classification is evidence accounting for one variant–gene–disease pair at one time. Independence, calibration and action boundaries matter more than the number of labels that agree." };
    },
  });

  register({
    id: "likelihood-bayes-transfer-challenge",
    coverage: {
      "s6-o1": "The learner reads a new binomial likelihood as a function over a fixed dataset and distinguishes it from a probability distribution over the parameter.",
      "s6-o3": "A likelihood ratio is converted into LOD and deviance units without treating any one scale as a posterior probability.",
      "s6-o4": "A stated prior is combined with new likelihood evidence to produce posterior odds or a beta posterior rather than silently changing the likelihood.",
      "s6-o5": "A boundary case distinguishes confidence-interval procedure behaviour from a credible interval's conditional probability statement.",
    },
    fixtures: [
      { key: "binomial", kind: "binomial", label: "Likelihood α", title: "Keep the observed data fixed", context: "Eight alternate alleles are observed among ten chromosomes. Compare possible population frequencies p and then use a uniform Beta(1,1) prior.", n: 10, k: 8, caption: "Observed data fixed at k = 8 of n = 10; curve height is relative likelihood as p varies.", aria: "Binomial relative-likelihood curve for eight successes in ten trials.", revealedMetrics: [(m) => { const r = m.likelihoodBayes({ kind: "likelihood", n: 10, k: 8, p: 0.8 }); return [{ label: "MLE", value: r.mle.toFixed(2), tone: "signal" }]; }, (m) => { const r = m.likelihoodBayes({ kind: "posterior", n: 10, k: 8, priorA: 1, priorB: 1 }); return [{ label: "posterior", value: "Beta(9,3)" }, { label: "posterior mean", value: r.posteriorMean.toFixed(2), tone: "signal" }]; }], conclusion: (m) => { const r = m.likelihoodBayes({ kind: "posterior", n: 10, k: 8, priorA: 1, priorB: 1 }); return "The likelihood peaks at 0.80. Multiplying by the uniform prior yields Beta(9,3), whose mean " + r.posteriorMean.toFixed(2) + " differs from the MLE."; } },
      { key: "boundary", kind: "boundary", label: "Likelihood β", title: "Catch an interval at the boundary", context: "Zero alternate alleles are observed among ten chromosomes. Compare the MLE, a profile-likelihood interval, and a uniform-prior posterior.", n: 10, k: 0, caption: "Observed data fixed at k = 0 of n = 10; the maximum lies on the boundary p = 0.", aria: "Binomial likelihood curve for zero successes in ten trials with maximum at zero.", revealedMetrics: [(m) => { const r = m.likelihoodBayes({ kind: "optimizer", n: 10, k: 0 }); return [{ label: "MLE", value: r.mle.toFixed(2) }, { label: "profile upper", value: r.profileInterval[1].toFixed(3), tone: "signal" }]; }, (m) => { const r = m.likelihoodBayes({ kind: "posterior", n: 10, k: 0, priorA: 1, priorB: 1 }); return [{ label: "posterior", value: "Beta(1,11)" }, { label: "posterior mean", value: r.posteriorMean.toFixed(3), tone: "signal" }]; }], conclusion: (m) => { const r = m.likelihoodBayes({ kind: "posterior", n: 10, k: 0, priorA: 1, priorB: 1 }); return "The MLE is zero, but uncertainty is not. The posterior mean is " + r.posteriorMean.toFixed(3) + ", and both profile and credible intervals retain positive upper uncertainty."; } },
      { key: "evidence", kind: "evidence", label: "Evidence γ", title: "Move between evidence units and posterior odds", context: "Model 1 has a likelihood ratio of 100 over Model 0. Before the data, prior odds favour Model 0 by 9:1.", n: 1, k: 1, caption: "Likelihood ratio 100; prior odds for Model 1 are 1:9.", aria: "Evidence comparison with likelihood ratio one hundred and prior odds one to nine.", revealedMetrics: [(m) => { const r = m.likelihoodBayes({ kind: "evidence", logLikelihoodRatio: Math.log(100) }); return [{ label: "LR", value: r.likelihoodRatio.toFixed(0) }, { label: "LOD", value: r.lod.toFixed(1), tone: "signal" }]; }, (m) => { const r = m.likelihoodBayes({ kind: "evidence", logLikelihoodRatio: Math.log(100) }); return [{ label: "2ΔlnL", value: r.deviance.toFixed(2) }, { label: "posterior odds", value: "100:9", tone: "signal" }]; }], conclusion: () => "The data multiply prior odds 1:9 by LR 100 to give posterior odds 100:9, or posterior probability 100/109 ≈ 0.917. LR, LOD and deviance are evidence units, not posterior probabilities." },
    ],
    visual: likelihoodVisual,
    steps(fixture, modelSet) {
      if (fixture.kind === "binomial") {
        const likelihood = modelSet.likelihoodBayes({ kind: "likelihood", n: fixture.n, k: fixture.k, p: 0.8 });
        const posterior = modelSet.likelihoodBayes({ kind: "posterior", n: fixture.n, k: fixture.k, priorA: 1, priorB: 1 });
        return [
          { label: "read function", prompt: "What varies along this likelihood curve?", reveal: "p varies; k = 8 and n = 10 stay fixed", explanation: "A likelihood treats the observed dataset as fixed and asks how well each parameter value would generate it.", options: [answer("The parameter p varies while the observed data stay fixed", true, ""), answer("The possible datasets vary and probabilities sum to one", false, "That describes a probability distribution at fixed p, not the likelihood function."), answer("The prior probability of p varies", false, "A likelihood contains no prior over p."), answer("The sample size changes along the curve", false, "n and k are fixed observations in this fixture.")] },
          { label: "maximise", prompt: "Where is the maximum likelihood estimate?", reveal: "p̂ = 0.80", explanation: "For a binomial model the MLE is k/n = 8/10 = " + likelihood.mle.toFixed(2) + ".", options: [0.2, 0.5, 0.75, 0.8].map((value) => answer(value.toFixed(2), value === 0.8, "The binomial MLE is the observed success fraction k/n.")) },
          { label: "update", prompt: "With a uniform Beta(1,1) prior, what posterior and mean follow?", reveal: "Beta(9,3), mean 0.75", explanation: "Conjugate updating adds k to α and n−k to β: Beta(9,3), mean 9/12 = " + posterior.posteriorMean.toFixed(2) + ".", options: [answer("Beta(9,3), mean 0.75", true, ""), answer("Beta(8,2), mean 0.80", false, "That reproduces the likelihood exponents but omits the prior counts."), answer("A point mass at 0.80", false, "Finite data leave posterior uncertainty."), answer("The likelihood renormalised with no prior assumption", false, "A posterior requires a prior; renormalising likelihood alone silently chooses one.")] },
        ];
      }
      if (fixture.kind === "boundary") {
        const opt = modelSet.likelihoodBayes({ kind: "optimizer", n: 10, k: 0 });
        const posterior = modelSet.likelihoodBayes({ kind: "posterior", n: 10, k: 0, priorA: 1, priorB: 1 });
        return [
          { label: "maximise", prompt: "Where is the MLE and what makes it special?", reveal: "p̂ = 0 at the boundary", explanation: "With no observed alternate alleles, the likelihood decreases from p = 0; the maximum is on the permitted parameter boundary.", options: [answer("p̂ = 0, a boundary estimate", opt.boundary, ""), answer("p̂ = 0.5 by symmetry", false, "The observed data are not symmetric: k is zero."), answer("p̂ is undefined", false, "The likelihood has a defined maximum at zero even though standard curvature approximations become unreliable."), answer("p̂ = 1 because all observations agree", false, "All observations are failures relative to the alternate allele, so p̂ is zero.")] },
          { label: "interval", prompt: "Why is a zero-width Wald interval at p = 0 misleading?", reveal: "boundary curvature approximation collapses", explanation: "The plug-in standard error is zero at p̂ = 0, but the profile likelihood still supports positive values up to about " + opt.profileInterval[1].toFixed(3) + ".", options: [answer("Its plug-in standard error collapses at the boundary despite positive uncertainty", true, ""), answer("Because every confidence interval is a posterior probability", false, "A confidence interval describes a repeated-sampling procedure, not probability over p after observing data."), answer("Because zero observations imply p = 0 exactly", false, "Zero successes in ten trials remain compatible with small positive p."), answer("Because profile likelihood must integrate to one", false, "Likelihood need not integrate to one over p.")] },
          { label: "update", prompt: "What does a uniform-prior posterior say?", reveal: "Beta(1,11), mean 0.083", explanation: "The posterior is Beta(1,11), with mean 1/12 = " + posterior.posteriorMean.toFixed(3) + " and a positive credible upper tail.", options: [answer("Beta(1,11), mean about 0.083", true, ""), answer("Probability one that p = 0", false, "A continuous prior and finite data do not create a point mass at zero."), answer("Beta(0,10), mean zero", false, "The prior contributes one pseudo-count to each beta parameter."), answer("The posterior must equal the MLE", false, "The posterior incorporates the prior and represents uncertainty, not only the maximising point.")] },
        ];
      }
      const evidence = modelSet.likelihoodBayes({ kind: "evidence", logLikelihoodRatio: Math.log(100) });
      return [
        { label: "convert", prompt: "Which evidence-unit conversions are correct?", reveal: "LR 100 · LOD 2 · deviance 9.21", explanation: "LOD = log10(LR) = 2 and 2ΔlnL = 2ln(100) = " + evidence.deviance.toFixed(2) + ".", options: [answer("LR 100; LOD 2; 2ΔlnL 9.21", true, ""), answer("LR 100; LOD 100; 2ΔlnL 200", false, "LOD and deviance are logarithmic transforms of the likelihood ratio."), answer("LR 2; LOD 100; 2ΔlnL 4.61", false, "This swaps the scales and omits the factor of two in deviance."), answer("All three numbers are posterior probabilities", false, "They express relative evidence on different scales, before applying prior odds.")] },
        { label: "update", prompt: "What posterior odds follow from prior odds 1:9?", reveal: "100:9 for Model 1", explanation: "Posterior odds = prior odds × likelihood ratio = (1/9) × 100 = 100/9.", options: [answer("100:9 for Model 1", true, ""), answer("100:1 for Model 1", false, "That ignores the prior odds against Model 1."), answer("1:900 for Model 1", false, "The likelihood favours Model 1 and therefore multiplies, rather than reverses, its prior odds."), answer("91:9 because probabilities add", false, "Bayesian updating multiplies odds by a likelihood ratio.")] },
        { label: "interpret", prompt: "What posterior probability corresponds to 100:9 odds?", reveal: "100/109 ≈ 0.917", explanation: "Convert odds a:b to probability a/(a+b): 100/(100+9) = 0.917.", options: [0.5, 0.9, 0.917, 0.99].map((value) => answer(value.toFixed(3), nearNumber(value, 100 / 109, 0.002), "Convert posterior odds to probability by dividing the favoured odds by the total odds.")) },
      ];
    },
    summary(fixture, modelSet) {
      const compactObservation = fixture.kind === "binomial" ? "k = 8 of n = 10" : fixture.kind === "boundary" ? "k = 0 of n = 10" : "LR 100 · prior odds 1:9";
      const compactClaim = fixture.kind === "binomial" ? "MLE 0.80 · posterior mean 0.75" : fixture.kind === "boundary" ? "MLE 0; positive upper uncertainty" : "posterior odds 100:9 · p 0.917";
      return { rail: [{ key: "fixed observation", value: compactObservation }, { key: "likelihood", value: fixture.revealedMetrics[0](modelSet).map((metric) => metric.label + " " + metric.value).join(" · ") }, { key: "update / interval", value: fixture.revealedMetrics[1](modelSet).map((metric) => metric.label + " " + metric.value).join(" · ") }, { key: "claim", value: compactClaim }], takeaway: "Likelihood measures relative support for parameters from fixed data. Priors change posterior odds, not the likelihood; interval statements inherit the procedure that produced them." };
    },
  });

  /* Executable portfolio audit used by verification. -------------------- */

  models.transferPortfolio = {
    ids() {
      return Object.keys(specs).sort();
    },
    audit(id) {
      const spec = specs[id];
      if (!spec) throw new Error("Unknown transfer challenge " + id);
      return {
        id,
        objectives: Object.keys(spec.coverage),
        fixtures: spec.fixtures.map((fixture) => {
          const steps = spec.steps(fixture, models);
          return {
            key: fixture.key,
            ariaLabel: fixture.aria,
            stepCount: steps.length,
            stepLabels: steps.map((step) => step.label),
            prompts: steps.map((step) => step.prompt),
            explanationLengths: steps.map((step) => step.explanation.length),
            incorrectFeedbackLengths: steps.map((step) => step.options
              .filter((option) => !option.correct)
              .map((option) => option.feedback.length)),
            correctCounts: steps.map((step) => step.options.filter((option) => option.correct).length),
            correctOptionIndexes: steps.map((step) => step.options.findIndex((option) => option.correct)),
            optionCounts: steps.map((step) => step.options.length),
            reveals: steps.map((step) => step.reveal),
          };
        }),
      };
    },
  };

  global.ReaderInteractionDefinitions = definitions;
  global.ReaderInteractionModels = models;
  global.ReaderInteractionCoverage = coverage;
})(window);
