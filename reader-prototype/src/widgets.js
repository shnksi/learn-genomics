/* ── Reader prototype — widgets ──────────────────────────────────────────────
   Eight interactions, each anchored to the passage that motivates it.

   The contract is predict-then-reveal, not read-then-confirm. Wherever the
   chapter is about to tell you an outcome, the widget asks you to commit to one
   first. Committing and being wrong is what makes the correction stick; being
   shown a demonstration you already agreed with does very little.

   Every prediction goes to the Ledger, so by the end of the chapter you have a
   record of what you actually called correctly rather than an impression of
   having followed along.

   Two widgets author nothing: build.py extracts the diagnostic from the
   chapter's misconceptions table, the recall queue from its folded answers, and
   the curriculum map from its own mermaid source.
   ───────────────────────────────────────────────────────────────────────── */

(function () {
  "use strict";

  const BOOT = JSON.parse(document.getElementById("bootstrap").textContent);
  const Store = window.ReaderStore;
  const DOC = window.ReaderDoc;

  // Per-document state. Every widget's memory is scoped to the page it is on,
  // so finishing Ch 26's diagnostic never marks Ch 27's as done.
  const st = (patch) => Store.doc(DOC, patch);
  const practice = () => !!window.isPracticeMode?.();
  const revisit = () => !!window.ReaderIsRevisit;

  /* ── Small helpers ────────────────────────────────────────────────────── */

  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (k === "class") node.className = v;
      else if (k === "text") node.textContent = v;
      else if (k === "html") node.innerHTML = v; // build-time trusted only
      else if (k.startsWith("on")) node.addEventListener(k.slice(2), v);
      else if (v === true) node.setAttribute(k, "");
      else if (v !== false && v != null) node.setAttribute(k, v);
    }
    for (const c of children || []) node.append(c);
    return node;
  }

  function shuffle(list, seed) {
    // Deterministic per position so a reload does not reshuffle mid-answer.
    const a = list.slice();
    let s = seed;
    for (let i = a.length - 1; i > 0; i--) {
      s = (s * 1103515245 + 12345) & 0x7fffffff;
      const j = s % (i + 1);
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  const fmt = (n) => n.toLocaleString("en-GB");
  const rint = (n) => Math.floor(Math.random() * n);

  /* ── The Ledger ───────────────────────────────────────────────────────────
     One number, in the top bar, for the whole chapter: how many calls you made
     and how many were right. It is the only running score, and it counts
     predictions — never reading, never time spent.
     ─────────────────────────────────────────────────────────────────────── */

  const Ledger = {
    mount: null,
    read() {
      const s = st().ledger;
      return s && typeof s.made === "number" ? s : { made: 0, right: 0, byWidget: {} };
    },
    record(widget, wasRight) {
      const s = this.read();
      s.made += 1;
      if (wasRight) s.right += 1;
      s.byWidget[widget] = s.byWidget[widget] || { made: 0, right: 0 };
      s.byWidget[widget].made += 1;
      if (wasRight) s.byWidget[widget].right += 1;
      st({ ledger: s });
      this.render();
      return s;
    },
    render() {
      if (!this.mount) return;
      const s = this.read();
      this.mount.hidden = s.made === 0;
      this.mount.textContent = `${s.right}/${s.made} called`;
      this.mount.title =
        `${s.right} of ${s.made} predictions correct across this chapter`;
    },
  };
  window.Ledger = Ledger;

  /* ── Predict-then-reveal ──────────────────────────────────────────────────
     The shared mechanic. Renders a forced choice, locks it in, then hands
     control back so the caller can show what actually happened.
     ─────────────────────────────────────────────────────────────────────── */

  function predict(host, { widget, question, options, hint }, onCommit) {
    // Practice mode: this is a tool now, not a test. Open it immediately and
    // record nothing — a reader coming back for the third time to check one
    // number should not have to answer a quiz to reach it.
    if (practice()) {
      const skip = el("div", { class: "predict predict-skipped" }, [
        el("p", { class: "predict-hint", html:
          "<strong>Practice mode.</strong> The prediction step is off — this is open as a tool. " +
          "Turn practice mode off in the top bar to be asked first." }),
      ]);
      host.append(skip);
      // Defer by a microtask. In the gated path onCommit fires from a click,
      // long after the caller's `const`s exist; firing it synchronously here
      // instead runs it DURING the widget's own setup, and any callback that
      // touches a binding declared further down hits the temporal dead zone.
      queueMicrotask(() => onCommit({ label: "(practice)" }, null, skip));
      return skip;
    }

    const box = el("div", { class: "predict" });
    box.append(el("p", { class: "predict-q", html: question }));
    if (hint) box.append(el("p", { class: "predict-hint", html: hint }));

    const row = el("div", { class: "btn-row" });
    options.forEach((opt) => {
      row.append(
        el("button", {
          class: "btn predict-opt", type: "button", text: opt.label,
          onclick: () => {
            const right = !!opt.correct;
            Ledger.record(widget, right);
            box.replaceChildren(
              el("div", {
                class: "callout " + (right ? "callout-good" : "callout-bad"),
                html:
                  (right ? "<strong>Called it.</strong> " : "<strong>Not quite.</strong> ") +
                  `You said <strong>${opt.label}</strong>.`,
              })
            );
            onCommit(opt, right, box);
          },
        })
      );
    });
    box.append(row);
    host.append(box);
    return box;
  }

  /* ── Genetic code ─────────────────────────────────────────────────────── */

  const CODONS = {};
  (function buildCodonTable() {
    const bases = "TCAG";
    const aa = "FFLLSSSSYY**CC*WLLLLPPPPHHQQRRRRIIIMTTTTNNKKSSRRVVVVAAAADDEEGGGG";
    let i = 0;
    for (const b1 of bases)
      for (const b2 of bases)
        for (const b3 of bases) CODONS[b1 + b2 + b3] = aa[i++];
  })();

  const THREE = {
    A: "Ala", R: "Arg", N: "Asn", D: "Asp", C: "Cys", E: "Glu", Q: "Gln", G: "Gly",
    H: "His", I: "Ile", L: "Leu", K: "Lys", M: "Met", F: "Phe", P: "Pro", S: "Ser",
    T: "Thr", W: "Trp", Y: "Tyr", V: "Val", "*": "■",
  };

  const COMPLEMENT = { A: "T", T: "A", G: "C", C: "G" };
  const clean = (s) => s.toUpperCase().replace(/[^ACGT]/g, "");

  function translate(dna) {
    const peptide = [];
    for (let i = 0; i + 3 <= dna.length; i += 3) {
      const aa = CODONS[dna.slice(i, i + 3)];
      peptide.push(aa || "?");
      if (aa === "*") break;
    }
    return peptide;
  }

  /* ── 1. Write the other strand ────────────────────────────────────────────
     The objective says "write the other". So you write it — one base at a time,
     graded as you go. Watching a complement appear teaches nothing; producing
     one wrong and being told which column is wrong teaches the pairing rule.
     ─────────────────────────────────────────────────────────────────────── */

  function strandComplement(body) {
    let top = "ATGCGTAC";
    let typed = "";
    let done = false;

    const stage = el("div");
    const feedback = el("div", { class: "callout" });
    const keys = el("div", { class: "btn-row", style: "margin-top:.75rem" });

    function expected() {
      return top.split("").map((b) => COMPLEMENT[b]).join("");
    }

    function line(left, cells, right) {
      const div = el("div", { class: "seq" }, [el("span", { class: "end", text: left })]);
      for (const c of cells) div.append(c);
      div.append(el("span", { class: "end", text: right }));
      return div;
    }

    function render() {
      const want = expected();
      const topCells = top.split("").map((ch) =>
        el("span", { class: "cell base base-" + ch, text: ch })
      );
      const bars = top.split("").map((_, i) =>
        el("span", { class: "cell pairbar", text: i < typed.length ? "|" : "·" })
      );
      const botCells = top.split("").map((_, i) => {
        if (i >= typed.length) {
          return el("span", {
            class: "cell slot" + (i === typed.length ? " slot-next" : ""), text: "_",
          });
        }
        const ch = typed[i];
        const ok = ch === want[i];
        return el("span", {
          class: "cell base base-" + ch + (ok ? " typed-ok" : " typed-bad"), text: ch,
        });
      });

      stage.replaceChildren(
        el("div", { class: "seq-label", text: "given — top strand, 5'→3'" }),
        line("5'—", topCells, "—3'"),
        line("", bars, ""),
        line("3'—", botCells, "—5'"),
        el("div", { class: "seq-label", style: "margin-top:.3rem",
                    text: "you write — bottom strand, 3'→5'" })
      );

      const wrong = typed.split("").filter((c, i) => c !== want[i]).length;
      if (!typed.length) {
        feedback.className = "callout";
        feedback.innerHTML =
          "Type the base that pairs with each one above, left to right. " +
          "Use the keys below or your keyboard.";
      } else if (typed.length < top.length) {
        feedback.className = "callout" + (wrong ? " callout-bad" : "");
        feedback.innerHTML = wrong
          ? `<strong>${wrong} wrong so far.</strong> Red columns are mispaired — A goes with T, G with C.`
          : `${typed.length} of ${top.length}, all correct so far.`;
      } else if (wrong) {
        feedback.className = "callout callout-bad";
        feedback.innerHTML =
          `<strong>${wrong} of ${top.length} mispaired.</strong> Fix them, or clear and try again. ` +
          `Every red column is a position where the strand is no longer a recipe for the other.`;
      } else {
        feedback.className = "callout callout-good";
        const revcomp = want.split("").reverse().join("");
        feedback.innerHTML =
          `<strong>Correct.</strong> Now the point the chapter is making: written the ` +
          `conventional way — every strand 5'→3' — that same bottom strand reads ` +
          `<code>${revcomp}</code>, its <strong>reverse complement</strong>. Same molecule, ` +
          `read from the other end. This is why a coordinate on the reverse strand needs care.`;
        if (!done) {
          done = true;
          Ledger.record("strand-complement", true);
        }
      }
    }

    function type(ch) {
      if (typed.length >= top.length) return;
      typed += ch;
      render();
    }

    for (const b of "ACGT") {
      keys.append(el("button", { class: "btn key-btn", text: b, onclick: () => type(b) }));
    }
    keys.append(
      el("button", { class: "btn", text: "⌫", title: "Backspace", onclick: () => {
        typed = typed.slice(0, -1); render();
      }}),
      el("button", { class: "btn", text: "New sequence", onclick: () => {
        const n = 8 + rint(3);
        top = Array.from({ length: n }, () => "ACGT"[rint(4)]).join("");
        typed = ""; done = false; render();
      }})
    );

    body.tabIndex = 0;
    body.addEventListener("keydown", (e) => {
      const k = e.key.toUpperCase();
      if ("ACGT".includes(k) && k.length === 1) { e.preventDefault(); type(k); }
      else if (e.key === "Backspace") { e.preventDefault(); typed = typed.slice(0, -1); render(); }
    });

    body.append(stage, feedback, keys);
    render();
  }

  /* ── 2. Call the mutation before you make it ──────────────────────────────
     Same sequence as before, but you name the consequence first. The chapter
     asserts that most mutations do nothing; predicting a few and getting them
     wrong is what turns that from a sentence into a calibrated expectation.
     ─────────────────────────────────────────────────────────────────────── */

  function centralDogma(body) {
    const REFERENCE = "ATGGCTAGCAAGGGCTTTACCTAA";
    const refPeptide = translate(REFERENCE);
    let dna = REFERENCE;
    let pending = null;   // index awaiting a prediction
    let armed = true;     // predict-first mode

    const stage = el("div");
    const panel = el("div");
    const verdict = el("div", { class: "callout" });

    const nextBase = (ch) => "ACGT"["ACGT".indexOf(ch) + 1 === 4 ? 0 : "ACGT".indexOf(ch) + 1];

    function outcomeOf(seq) {
      const p = translate(seq);
      const same = p.length === refPeptide.length && p.every((a, i) => a === refPeptide[i]);
      if (same) return "silent";
      if (!p.includes("*")) return "stop lost";
      if (p.length < refPeptide.length) return "nonsense";
      return "missense";
    }

    function explain(kind, seq) {
      const p = translate(seq);
      if (kind === "silent")
        return "The DNA changed and the protein did not. 64 codons encode 20 amino acids, " +
               "so the code is redundant and most third-position changes are absorbed. This " +
               "is the single biggest reason most mutations do nothing.";
      if (kind === "nonsense")
        return `A codon became a stop. The protein truncates at ${p.length - 1} residues ` +
               `instead of ${refPeptide.length - 1} — usually a dead protein, and often a ` +
               `destroyed transcript.`;
      if (kind === "stop lost")
        return "The terminator is gone, so the ribosome reads on past the intended end into " +
               "whatever sequence follows.";
      const at = p.findIndex((a, i) => a !== refPeptide[i]);
      return `Residue ${at + 1} changed from ${THREE[refPeptide[at]]} to ${THREE[p[at]]}. ` +
             `Whether that matters depends on where it sits in the folded shape — which is ` +
             `why predicting the effect of a missense variant is genuinely unsolved.`;
    }

    function apply(i) {
      dna = dna.slice(0, i) + nextBase(dna[i]) + dna.slice(i + 1);
    }

    function ask(i) {
      pending = i;
      const preview = dna.slice(0, i) + nextBase(dna[i]) + dna.slice(i + 1);
      const truth = outcomeOf(preview);
      const codonNo = Math.floor(i / 3) + 1;
      const posInCodon = (i % 3) + 1;

      panel.replaceChildren();
      predict(
        panel,
        {
          widget: "central-dogma",
          question:
            `You are about to change position <strong>${i + 1}</strong> — base ` +
            `<strong>${posInCodon}</strong> of codon <strong>${codonNo}</strong> — from ` +
            `<code>${dna[i]}</code> to <code>${nextBase(dna[i])}</code>. What reaches the protein?`,
          options: [
            { label: "Silent", correct: truth === "silent" },
            { label: "Missense", correct: truth === "missense" },
            { label: "Nonsense", correct: truth === "nonsense" },
            { label: "Stop lost", correct: truth === "stop lost" },
          ],
        },
        (opt, right, box) => {
          apply(pending);
          pending = null;
          render();
          box.append(
            el("div", { class: "callout", html:
              `<strong>${truth[0].toUpperCase() + truth.slice(1)}.</strong> ${explain(truth, dna)}` })
          );
          box.append(
            el("div", { class: "btn-row", style: "margin-top:.7rem" }, [
              el("button", { class: "btn", text: "Keep going", onclick: () => {
                panel.replaceChildren(); render();
              }}),
              el("button", { class: "btn", text: "Reset sequence", onclick: () => {
                dna = REFERENCE; panel.replaceChildren(); render();
              }}),
            ])
          );
        }
      );
    }

    function cellClick(i) {
      if (pending !== null) return;
      if (armed) ask(i);
      else { apply(i); render(); }
    }

    function codonRow(label, seq, opts) {
      const line = el("div", { class: "seq" });
      for (let i = 0; i < seq.length; i++) {
        if (i > 0 && i % 3 === 0) line.append(el("span", { class: "codon-gap" }));
        const ch = seq[i];
        const attrs = { class: "cell base base-" + ch, text: ch };
        if (opts.clickable) {
          Object.assign(attrs, {
            role: "button", tabindex: "0",
            title: `Position ${i + 1} — ${armed ? "predict, then change" : "change"}`,
            onclick: () => cellClick(i),
            onkeydown: (e) => {
              if (e.key === "Enter" || e.key === " ") { e.preventDefault(); cellClick(i); }
            },
          });
        }
        const span = el("span", attrs);
        if (opts.diffAgainst && opts.diffAgainst[i] !== ch) span.classList.add("mutated");
        line.append(span);
      }
      return el("div", { class: "seq-row" }, [
        el("div", { class: "seq-label", text: label }), line,
      ]);
    }

    function peptideRow(peptide) {
      const line = el("div", { class: "seq" });
      peptide.forEach((aa, i) => {
        const span = el("span", { class: "aa", text: THREE[aa] || "???" });
        if (refPeptide[i] !== aa) span.classList.add("mutated");
        line.append(span);
      });
      return el("div", { class: "seq-row" }, [
        el("div", { class: "seq-label", text: "protein" }), line,
      ]);
    }

    function render() {
      stage.replaceChildren(
        codonRow(
          `DNA — coding strand, 5'→3'  (${armed ? "click a base to call it" : "click a base"})`,
          dna, { clickable: true, diffAgainst: REFERENCE }
        ),
        codonRow("mRNA — the disposable working copy", dna.replace(/T/g, "U"),
                 { diffAgainst: REFERENCE.replace(/T/g, "U") }),
        peptideRow(translate(dna))
      );

      const changed = dna !== REFERENCE;
      verdict.className = "callout";
      verdict.innerHTML = changed
        ? `Currently <strong>${outcomeOf(dna)}</strong> relative to the original. Reset to start clean.`
        : "Unmutated. Pick any base — you call the outcome before it happens.";
    }

    const modeRow = el("div", { class: "btn-row", style: "margin-top:.85rem" }, [
      el("button", { class: "btn", text: "Free play (no prediction)", onclick: (e) => {
        armed = !armed;
        e.target.textContent = armed ? "Free play (no prediction)" : "Predict first";
        panel.replaceChildren();
        render();
      }}),
      el("button", { class: "btn", text: "Reset sequence", onclick: () => {
        dna = REFERENCE; panel.replaceChildren(); render();
      }}),
    ]);

    body.append(stage, verdict, panel, modeRow);
    render();
  }

  /* ── 3. Make a gamete ─────────────────────────────────────────────────── */

  function meiosisShuffle(body) {
    const PAIRS = 23, SEGMENTS = 44, combos = Math.pow(2, PAIRS);
    const assortment = el("div", { class: "chrom" });
    const recomb = el("div");
    const stats = el("div", { class: "readout" });
    let made = st().gametes || 0;

    function render(draw) {
      assortment.replaceChildren();
      for (const from of draw) {
        assortment.append(el("span", { class: from ? "mat" : "pat",
          title: from ? "maternal copy" : "paternal copy" }));
      }
      const crossovers = 1 + rint(3);
      const points = Array.from({ length: crossovers }, () => 1 + rint(SEGMENTS - 2))
        .sort((a, b) => a - b);
      const strip = el("div", { class: "chrom" });
      let side = draw[0] ? 1 : 0;
      for (let i = 0; i < SEGMENTS; i++) {
        if (points.includes(i)) side = 1 - side;
        strip.append(el("span", { class: side ? "mat" : "pat" }));
      }
      recomb.replaceChildren(
        el("div", { class: "seq-label", text:
          `chromosome 1, at higher resolution — ${crossovers} crossover${crossovers > 1 ? "s" : ""}` }),
        strip
      );
      stats.replaceChildren(
        stat(fmt(combos), "2²³ whole-chromosome combinations"),
        stat(fmt(made), "gametes you have made"),
        stat("≈ 0", "chance of ever repeating one")
      );
    }

    function draw() {
      made += 1;
      st({ gametes: made });
      render(Array.from({ length: PAIRS }, () => Math.random() < 0.5));
    }

    body.append(
      el("div", { class: "legend" }, [
        el("span", { class: "legend-item" }, [
          el("span", { class: "swatch mat" }), el("span", { text: "from your mother" })]),
        el("span", { class: "legend-item" }, [
          el("span", { class: "swatch pat" }), el("span", { text: "from your father" })]),
      ]),
      el("div", { class: "seq-label", text: "23 pairs — one member of each, chosen independently" }),
      assortment,
      el("div", { style: "height:.7rem" }),
      recomb,
      stats,
      el("div", { class: "callout", html:
        "The top row is <strong>independent assortment</strong> — 2²³ outcomes. The strip below " +
        "is <strong>recombination</strong>, and it is why the chromosome you pass on is a mosaic " +
        "rather than one you were handed. Multiply the two and the number of distinct gametes " +
        "you can make is, for practical purposes, unbounded." }),
      el("div", { class: "btn-row", style: "margin-top:.85rem" }, [
        el("button", { class: "btn btn-primary", text: "Make a gamete", onclick: draw }),
      ])
    );
    draw();
  }

  function stat(value, key) {
    return el("div", { class: "stat" }, [
      el("span", { class: "stat-val", text: value }),
      el("span", { class: "stat-key", text: key }),
    ]);
  }

  /* ── 4. The mutation budget ───────────────────────────────────────────────
     Guess the order of magnitude before the sliders appear. Almost everyone
     guesses far too low, and that gap is the thing worth having.
     ─────────────────────────────────────────────────────────────────────── */

  function mutationBudget(body) {
    const GENOME = 6.2e9;
    const tools = el("div", { hidden: true });

    predict(
      body,
      {
        widget: "mutation-budget",
        question:
          "Before you compute it — roughly how many mutations does a newborn carry that " +
          "<em>neither parent had</em>?",
        hint: "The genome is 6.2 billion bases, copied with very high but not perfect fidelity.",
        options: [
          { label: "~1" }, { label: "~70", correct: true },
          { label: "~5,000" }, { label: "~2 million" },
        ],
      },
      () => { tools.hidden = false; }
    );

    const rate = el("input", { type: "range", min: "1.0", max: "1.5", step: "0.05", value: "1.2" });
    const callable = el("input", { type: "range", min: "80", max: "100", step: "1", value: "87" });
    const rateVal = el("span", { class: "val" });
    const callVal = el("span", { class: "val" });
    const stats = el("div", { class: "readout" });
    const note = el("div", { class: "callout" });

    function render() {
      const r = parseFloat(rate.value) * 1e-8;
      const frac = parseInt(callable.value, 10) / 100;
      const naive = r * GENOME;
      const observed = naive * frac;
      rateVal.textContent = `${parseFloat(rate.value).toFixed(2)} × 10⁻⁸`;
      callVal.textContent = `${callable.value}%`;
      stats.replaceChildren(
        stat(naive.toFixed(0), "naive product — rate × 6.2 Gb"),
        stat(observed.toFixed(0), "what a trio study would call"),
        stat((naive - observed).toFixed(0), "real, and invisible to short reads")
      );
      const ok = naive >= 68 && naive <= 81 && observed >= 60 && observed <= 70;
      note.className = "callout " + (ok ? "callout-good" : "");
      note.innerHTML =
        `The chapter reports a naive product of <strong>68–81</strong> and trio studies finding ` +
        `<strong>~60–70</strong>. You are at <strong>${naive.toFixed(0)}</strong> and ` +
        `<strong>${observed.toFixed(0)}</strong>` +
        (ok ? " — both inside the reported bands." : " — drag until both land inside those bands.") +
        `<br><br>The gap is not a correction for over-counting. Those mutations are really there; ` +
        `short reads simply cannot call variants across the 10–15% of the genome too repetitive ` +
        `to map into. The measurement is missing them, not the biology.`;
    }

    rate.addEventListener("input", render);
    callable.addEventListener("input", render);

    tools.append(
      el("label", { class: "field" }, [
        el("span", { class: "field-label" }, [
          el("span", { text: "Mutation rate, per base pair per generation" }), rateVal]),
        rate,
      ]),
      el("label", { class: "field" }, [
        el("span", { class: "field-label" }, [
          el("span", { text: "Fraction of the genome short reads can call" }), callVal]),
        callable,
      ]),
      stats, note
    );
    body.append(tools);
    render();
  }

  /* ── 5. Run the four forces ───────────────────────────────────────────────
     The first widget here with genuinely emergent behaviour: identical settings
     give different answers, and that IS the lesson. Twelve Wright–Fisher
     populations run side by side, so drift is visible as spread rather than
     asserted as a word. A beneficial allele being lost anyway is the single
     most useful surprise in the chapter.
     ─────────────────────────────────────────────────────────────────────── */

  function driftSim(body) {
    const GENS = 100, REPS = 12;
    const tools = el("div", { hidden: true });

    predict(
      body,
      {
        widget: "drift",
        question:
          "A brand-new mutation appears in a population of 50, and it is <strong>beneficial</strong> " +
          "— carriers leave 10% more offspring. What usually happens to it?",
        hint: "It starts as one copy in one individual.",
        options: [
          { label: "Spreads to everyone" },
          { label: "Settles at a middle frequency" },
          { label: "Is usually lost", correct: true },
          { label: "Stays at one copy" },
        ],
      },
      () => {
        // Open on exactly the scenario just predicted: one new copy in 50
        // individuals (1% of 100 alleles), carrying a 10% advantage.
        popN.value = "50"; sel.value = "10"; start.value = "1";
        tools.hidden = false;
        runAll();
      }
    );

    const popN = el("input", { type: "range", min: "10", max: "2000", step: "10", value: "50" });
    const sel = el("input", { type: "range", min: "-10", max: "10", step: "1", value: "10" });
    const start = el("input", { type: "range", min: "1", max: "99", step: "1", value: "1" });
    const popVal = el("span", { class: "val" });
    const selVal = el("span", { class: "val" });
    const startVal = el("span", { class: "val" });
    const plot = el("div", { class: "plot" });
    const stats = el("div", { class: "readout" });
    const note = el("div", { class: "callout" });

    function oneRun(N, s, p0) {
      const path = [p0];
      let p = p0;
      for (let g = 0; g < GENS; g++) {
        // Selection first: shift the expected frequency, then sample 2N gametes.
        const w = p * (1 + s) + (1 - p);
        const pSel = w > 0 ? (p * (1 + s)) / w : 0;
        let copies = 0;
        for (let i = 0; i < 2 * N; i++) if (Math.random() < pSel) copies++;
        p = copies / (2 * N);
        path.push(p);
        if (p <= 0 || p >= 1) { while (path.length <= GENS) path.push(p); break; }
      }
      return path;
    }

    function runAll() {
      const N = parseInt(popN.value, 10);
      const s = parseInt(sel.value, 10) / 100;
      const p0 = parseInt(start.value, 10) / 100;
      popVal.textContent = fmt(N);
      selVal.textContent = (s >= 0 ? "+" : "") + (s * 100).toFixed(0) + "%";
      startVal.textContent = (p0 * 100).toFixed(0) + "%";

      const runs = Array.from({ length: REPS }, () => oneRun(N, s, p0));
      const W = 320, H = 150;
      const x = (g) => (g / GENS) * W;
      const y = (p) => H - p * H;

      const paths = runs.map((r) => {
        const fixed = r[r.length - 1] >= 1, lost = r[r.length - 1] <= 0;
        const d = r.map((p, g) => `${g ? "L" : "M"}${x(g).toFixed(1)},${y(p).toFixed(1)}`).join("");
        const cls = fixed ? "traj fixed" : lost ? "traj lost" : "traj";
        return `<path class="${cls}" d="${d}"/>`;
      }).join("");

      plot.innerHTML =
        `<svg viewBox="0 0 ${W} ${H}" role="img" preserveAspectRatio="none"
              aria-label="Allele frequency across ${GENS} generations in ${REPS} populations">
           <line class="axis" x1="0" y1="${H}" x2="${W}" y2="${H}"/>
           <line class="axis" x1="0" y1="0" x2="${W}" y2="0"/>
           <line class="axis mid" x1="0" y1="${y(p0)}" x2="${W}" y2="${y(p0)}"/>
           ${paths}
         </svg>
         <div class="plot-axis"><span>0 generations</span><span>${GENS}</span></div>`;

      const finals = runs.map((r) => r[r.length - 1]);
      const fixed = finals.filter((p) => p >= 1).length;
      const lost = finals.filter((p) => p <= 0).length;
      stats.replaceChildren(
        stat(`${fixed}/${REPS}`, "reached fixation"),
        stat(`${lost}/${REPS}`, "lost entirely"),
        stat(`${REPS - fixed - lost}/${REPS}`, "still segregating")
      );

      const strongSel = Math.abs(s) >= 0.05;
      note.className = "callout";
      note.innerHTML = N <= 100
        ? `<strong>Small population.</strong> Every line started identically and they have already ` +
          `disagreed. Nothing distinguishes them but sampling — that spread <em>is</em> genetic ` +
          `drift. Notice how often a beneficial allele (${selVal.textContent}) is lost anyway: ` +
          `selection is a bias in a sampling process, not a guarantee.`
        : strongSel
        ? `<strong>Large population, strong selection.</strong> The lines now travel together — ` +
          `sampling noise scales as 1/2N, so at this size selection dominates and the outcome ` +
          `becomes close to deterministic. This is the regime textbooks draw.`
        : `<strong>Large population, weak selection.</strong> Frequencies barely move in 100 ` +
          `generations. Most molecular evolution looks like this — drift acting on variants that ` +
          `hardly matter, which is the whole content of the neutral theory in Ch 33.`;
    }

    [popN, sel, start].forEach((r) => r.addEventListener("input", runAll));

    tools.append(
      el("label", { class: "field" }, [
        el("span", { class: "field-label" }, [
          el("span", { text: "Population size N" }), popVal]), popN]),
      el("label", { class: "field" }, [
        el("span", { class: "field-label" }, [
          el("span", { text: "Selection on the allele" }), selVal]), sel]),
      el("label", { class: "field" }, [
        el("span", { class: "field-label" }, [
          el("span", { text: "Starting frequency" }), startVal]), start]),
      plot, stats, note,
      el("div", { class: "btn-row", style: "margin-top:.85rem" }, [
        el("button", { class: "btn btn-primary", text: "Run 12 more populations", onclick: runAll }),
        el("button", { class: "btn", text: "Small N, no selection", onclick: () => {
          popN.value = "20"; sel.value = "0"; start.value = "50"; runAll();
        }}),
        el("button", { class: "btn", text: "Large N, strong selection", onclick: () => {
          popN.value = "2000"; sel.value = "10"; start.value = "10"; runAll();
        }}),
      ])
    );
    body.append(tools);
  }

  /* ── 6. What depends on what ──────────────────────────────────────────────
     The chapter calls itself "the map" and then draws a static picture. The
     same graph, made interrogable, answers the question a reader actually has:
     if I want Part 11, what must I have read first?
     ─────────────────────────────────────────────────────────────────────── */

  function curriculumMap(body) {
    const { nodes, edges } = BOOT.widgets.map;
    if (!nodes.length) return;

    const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
    const grid = el("div", { class: "map-grid" });
    const detail = el("div", { class: "callout" });
    let selected = null;

    // Everything upstream, transitively — the real prerequisite set.
    function ancestors(id, seen = new Set()) {
      for (const [a, b] of edges) {
        if (b === id && !seen.has(a)) { seen.add(a); ancestors(a, seen); }
      }
      return seen;
    }
    function descendants(id, seen = new Set()) {
      for (const [a, b] of edges) {
        if (a === id && !seen.has(b)) { seen.add(b); descendants(b, seen); }
      }
      return seen;
    }

    function select(id) {
      selected = selected === id ? null : id;
      const needs = selected ? ancestors(selected) : new Set();
      const unlocks = selected ? descendants(selected) : new Set();

      [...grid.children].forEach((cell) => {
        const cid = cell.dataset.id;
        cell.classList.toggle("is-selected", cid === selected);
        cell.classList.toggle("is-need", needs.has(cid));
        cell.classList.toggle("is-unlock", unlocks.has(cid));
        cell.classList.toggle("is-dim",
          !!selected && cid !== selected && !needs.has(cid) && !unlocks.has(cid));
      });

      if (!selected) {
        detail.className = "callout";
        detail.innerHTML =
          "Click any part. The chapter says the dependency structure is real — this is that " +
          "structure, read straight out of the diagram above.";
        return;
      }
      const n = byId[selected];
      const list = (s) => [...s].map((i) => byId[i].part).join(", ") || "nothing";
      detail.className = "callout callout-good";
      detail.innerHTML =
        `<strong>${n.part} — ${n.title}.</strong> ${n.blurb}<br><br>` +
        `<strong>Read first:</strong> ${list(needs)}.<br>` +
        `<strong>Unlocks:</strong> ${list(unlocks)}.`;
    }

    nodes.forEach((n) => {
      grid.append(
        el("button", { class: "map-cell", type: "button", "data-id": n.id,
                       onclick: () => select(n.id) }, [
          el("span", { class: "map-part", text: n.part }),
          el("span", { class: "map-title", text: n.title }),
        ])
      );
    });

    body.append(grid, detail);
    select(null);
  }

  /* ── 7. Misconception diagnostic ──────────────────────────────────────── */

  function misconceptionCheck(body) {
    const rows = BOOT.widgets.misconceptions;
    if (!rows.length) return;

    // A re-run must draw a DIFFERENT five, or "run it again" just replays the
    // same questions and stops testing anything.
    let runs = st().diagnosticRuns || 0;
    let picked = shuffle(rows.map((_, i) => i), 7 + runs * 13).slice(0, 5);
    let index = 0, correct = 0;
    let missed = [];
    const stage = el("div");

    function reset() {
      runs += 1;
      st({ diagnosticRuns: runs });
      picked = shuffle(rows.map((_, i) => i), 7 + runs * 13).slice(0, 5);
      index = 0; correct = 0; missed = [];
      renderQuestion();
    }

    // Returning to a chapter you have already worked through should show you
    // what you scored, not silently restart a five-question quiz you finished.
    function start() {
      const prior = st().diagnostic;
      if (prior && !practice()) return renderPrior(prior);
      if (practice()) return renderQuestion();
      renderQuestion();
    }

    function renderPrior(prior) {
      const when = new Date(prior.at).toLocaleDateString("en-GB",
        { day: "numeric", month: "short" });
      const perfect = prior.score === prior.total;
      stage.replaceChildren(
        el("div", { class: "readout" }, [
          stat(`${prior.score}/${prior.total}`, `scored ${when}`),
        ]),
        el("div", { class: "callout " + (perfect ? "callout-good" : ""), html:
          perfect
            ? "You cleared this last time. Running it again draws five different claims."
            : "You have already run this. Running it again draws five different claims " +
              "from the same table, not a replay of these." }),
        el("div", { class: "btn-row", style: "margin-top:.75rem" }, [
          el("button", { class: "btn btn-primary", text: "Run it again", onclick: reset }),
        ])
      );
    }

    function renderQuestion() {
      if (index >= picked.length) return renderSummary();
      const row = rows[picked[index]];
      const decoys = shuffle(rows.filter((r) => r !== row), 13 + index).slice(0, 2);
      const options = shuffle([row, ...decoys], 29 + index);

      stage.replaceChildren(
        el("div", { class: "quiz-progress", text: `Claim ${index + 1} of ${picked.length}` }),
        el("p", { class: "quiz-q",
                  html: `Someone tells you: “${row.belief}.” What is the correction?` })
      );

      options.forEach((opt) => {
        const button = el("button", { class: "opt", type: "button", html: opt.truth });
        if (opt === row) button.dataset.right = "1";
        button.addEventListener("click", () => {
          const right = opt === row;
          if (right) correct += 1; else missed.push(row);
          Ledger.record("misconception-check", right);
          stage.querySelectorAll(".opt").forEach((b) => {
            b.disabled = true;
            if (b === button) b.classList.add(right ? "picked-right" : "picked-wrong");
            else if (b.dataset.right === "1") b.classList.add("was-right");
          });
          stage.append(
            el("div", { class: "callout " + (right ? "callout-good" : "callout-bad"), html:
              right ? "<strong>Right.</strong> That is the correction this chapter gives."
                    : `<strong>Not this one.</strong> That answers a different misconception. ` +
                      `The correction is: ${row.truth}` }),
            el("div", { class: "btn-row", style: "margin-top:.75rem" }, [
              el("button", { class: "btn btn-primary",
                text: index + 1 < picked.length ? "Next claim" : "See result",
                onclick: () => { index += 1; renderQuestion(); } }),
            ])
          );
        });
        stage.append(button);
      });
    }

    function renderSummary() {
      st({ diagnostic: { score: correct, total: picked.length, at: new Date().toISOString() } });
      stage.replaceChildren(
        el("div", { class: "readout" }, [stat(`${correct}/${picked.length}`, "corrections identified")]),
        el("div", { class: "callout " + (missed.length ? "" : "callout-good"), html:
          missed.length
            ? `<strong>Worth rereading:</strong> ${missed.map((m) => `“${m.belief}”`).join("; ")}. ` +
              `In the full reader a miss here would route you back to the section that treats it, ` +
              `and re-ask in a fortnight.`
            : "<strong>All five.</strong> In the full reader these would enter the " +
              "spaced-repetition queue at a long interval rather than being re-asked." }),
        el("div", { class: "btn-row", style: "margin-top:.75rem" }, [
          el("button", { class: "btn", text: "Run it again", onclick: reset }),
        ])
      );
    }

    body.append(stage);
    start();
  }

  /* ── 8. Recall queue ──────────────────────────────────────────────────── */

  const INTERVALS = { again: [10 / 1440, "10 minutes"], hard: [1, "tomorrow"],
                      good: [3, "in 3 days"], easy: [6, "in 6 days"] };

  function recallQueue(body) {
    const items = BOOT.widgets.recall;
    if (!items.length) return;
    const state = st().recall || {};
    const summary = el("div", { class: "callout" });

    function updateSummary() {
      const saved = st().recall || {};
      const rated = Object.keys(saved).length;
      const due = Object.values(saved).map((r) => r.due).sort()[0];
      const led = Ledger.read();
      summary.innerHTML =
        `<strong>${rated} of ${items.length}</strong> rated.` +
        (due ? ` Next card due ${new Date(due).toLocaleDateString("en-GB",
          { day: "numeric", month: "short" })}.` : "") +
        (led.made ? ` Across this chapter you called <strong>${led.right} of ${led.made}</strong> ` +
          `predictions correctly.` : "") +
        ` The whole course already contains <strong>475</strong> questions like these plus ` +
        `<strong>1,219</strong> question-bank pairs. Scheduling them is a delivery decision, ` +
        `not an authoring one.`;
    }

    items.forEach((item, i) => {
      const card = el("div", { class: "recall-card" });
      const answer = el("div", { class: "recall-a", html: item.answer, hidden: true });
      const rateRow = el("div", { class: "rate-row", hidden: true });
      const status = el("span", { class: "scheduled" });
      const reveal = el("button", { class: "btn", text: "Show answer", onclick: () => {
        answer.hidden = false; rateRow.hidden = false; reveal.remove();
      }});

      rateRow.append(el("span", { class: "rate-label", text: "How did that go?" }));
      for (const [key, [days, label]] of Object.entries(INTERVALS)) {
        rateRow.append(el("button", { class: "btn", text: key[0].toUpperCase() + key.slice(1),
          onclick: () => {
            const saved = st().recall || {};
            saved[i] = { rating: key, due: new Date(Date.now() + days * 86400000).toISOString() };
            st({ recall: saved });
            status.textContent = `Scheduled ${label}.`;
            rateRow.querySelectorAll(".btn").forEach((b) => (b.disabled = true));
            updateSummary();
          }}));
      }
      rateRow.append(status);

      if (state[i]) {
        answer.hidden = false; rateRow.hidden = false;
        status.textContent = `Rated “${state[i].rating}” — due ${
          new Date(state[i].due).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}.`;
        rateRow.querySelectorAll(".btn").forEach((b) => (b.disabled = true));
      }

      card.append(
        el("p", { class: "recall-q", html: `${i + 1}. ${item.question}` }),
        state[i] ? el("span") : reveal, answer, rateRow
      );
      body.append(card);
    });

    body.append(summary);
    updateSummary();
  }

  /* ── Mount ────────────────────────────────────────────────────────────── */

  const REGISTRY = {
    "strand-complement": strandComplement,
    "central-dogma": centralDogma,
    "meiosis-shuffle": meiosisShuffle,
    "mutation-budget": mutationBudget,
    "drift": driftSim,
    "curriculum-map": curriculumMap,
    "misconception-check": misconceptionCheck,
    "recall-queue": recallQueue,
  };

  Ledger.mount = document.getElementById("ledger");
  Ledger.render();

  document.querySelectorAll(".widget").forEach((mount) => {
    const build = REGISTRY[mount.dataset.widget];
    const head = el("div", { class: "widget-head" }, [
      el("h4", { text: mount.dataset.title || mount.dataset.widget }),
    ]);
    if (mount.dataset.note) {
      head.append(el("span", { class: "widget-note", text: mount.dataset.note }));
    }
    const body = el("div", { class: "widget-body" });
    mount.append(head, body);

    if (!build) {
      body.append(el("p", { class: "muted",
        text: `No implementation for “${mount.dataset.widget}”.` }));
      return;
    }
    try {
      build(body);
    } catch (err) {
      body.replaceChildren(
        el("p", { class: "muted", text: `This widget failed to start: ${err.message}` })
      );
    }
  });
})();
