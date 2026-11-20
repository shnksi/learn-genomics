/**
 * Genomics Lab Games (v2) — Games 04–06
 * (Drift & Selection Arena, Read Mapper & Variant Detective, Repeat Instability & SCA12 Board).
 *
 * Every classification/tuning level requires an explicit commit/verification
 * action rather than auto-solving on passive clicks or slider drags.
 */
(function () {
  "use strict";

  const Core = window.GenomicsGamesCore;
  const H = window.GenomicsGamesHelpers;
  const Registry = window.GenomicsGamesRegistry;
  if (!Core || !H || !Registry) return;

  const { el, teleTile, feedbackBox, hintToggleBtn, hintPanel } = H;

  /* =========================================================================
     GAME 04: DRIFT & SELECTION ARENA (Live Canvas Wright-Fisher Simulator)
     ========================================================================= */

  const TRAJ_PALETTE = [
    "#0d8a7b", "#2563eb", "#d97706", "#e11d48", "#7c3aed", "#0891b2",
    "#15803d", "#ea580c", "#4f46e5", "#be123c", "#0f766e", "#b45309",
  ];

  function drawTrajectoriesCanvas(canvas, sim, opts = {}) {
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth || 560;
    const height = canvas.clientHeight || 290;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);

    const styles = getComputedStyle(document.documentElement);
    const inkFaint = styles.getPropertyValue("--ink-faint").trim() || "#64748b";
    const rule = styles.getPropertyValue("--rule").trim() || "#dde5f0";
    const paper = styles.getPropertyValue("--paper-raised").trim() || "#ffffff";

    ctx.fillStyle = paper;
    ctx.fillRect(0, 0, width, height);

    const pad = { l: 42, r: 16, t: 16, b: 30 };
    const pw = width - pad.l - pad.r;
    const ph = height - pad.t - pad.b;
    const gens = sim.trajectories[0].length - 1;

    ctx.strokeStyle = rule;
    ctx.lineWidth = 1;
    for (const yv of [0, 0.25, 0.5, 0.75, 1]) {
      const y = pad.t + ph * (1 - yv);
      ctx.beginPath();
      ctx.moveTo(pad.l, y);
      ctx.lineTo(pad.l + pw, y);
      ctx.stroke();

      ctx.fillStyle = inkFaint;
      ctx.font = "11px ui-monospace, monospace";
      ctx.textAlign = "right";
      ctx.fillText(yv.toFixed(2), pad.l - 6, y + 4);
    }

    if (opts.bottleneckGen >= 0) {
      const x1 = pad.l + (opts.bottleneckGen / gens) * pw;
      const x2 = pad.l + ((opts.bottleneckGen + (opts.bottleneckLen || 5)) / gens) * pw;
      ctx.fillStyle = "rgba(225, 29, 72, 0.10)";
      ctx.fillRect(x1, pad.t, Math.max(4, x2 - x1), ph);
      ctx.fillStyle = "#e11d48";
      ctx.font = "10.5px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("Bottleneck", x1 + 3, pad.t + 12);
    }

    ctx.fillStyle = inkFaint;
    ctx.font = "11px ui-monospace, monospace";
    ctx.textAlign = "center";
    for (let t = 0; t <= 4; t++) {
      const g = Math.round((t / 4) * gens);
      const x = pad.l + (g / gens) * pw;
      ctx.fillText(`g${g}`, x, height - 10);
    }

    sim.trajectories.forEach((traj, idx) => {
      ctx.strokeStyle = TRAJ_PALETTE[idx % TRAJ_PALETTE.length];
      ctx.lineWidth = 1.9;
      ctx.globalAlpha = 0.86;
      ctx.beginPath();
      traj.forEach((p, g) => {
        const x = pad.l + (g / gens) * pw;
        const y = pad.t + ph * (1 - p);
        if (g === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    });
    ctx.globalAlpha = 1;
  }

  function sliderControl(label, min, max, step, value, fmt, onChange) {
    const input = el("input", {
      type: "range",
      min,
      max,
      step,
      value,
      onInput: (e) => onChange(Number(e.target.value)),
    });
    return el("label", { class: "slider-row" },
      el("span", { class: "slider-head" }, el("span", null, label), el("strong", null, fmt(value))),
      input
    );
  }

  Registry["drift-arena"] = [
    {
      id: "drift-floor",
      name: "1. The Drift Floor",
      render(root, ctx) {
        let N = 20;
        let seed = 42;
        const s = 0.12;
        const p0 = 0.2;
        let verifyRes = null;

        function verify() {
          const check = Core.runWrightFisher({ N, p0, s, h: 0.5, gens: 60, reps: 24, seed: seed + 999 });
          const ok = check.meanP >= 0.75 && check.lostCount <= 1;
          verifyRes = { ok, check };
          if (ok) ctx.solve();
          draw();
        }

        function draw() {
          const sim = Core.runWrightFisher({ N, p0, s, h: 0.5, gens: 60, reps: 12, seed });
          const twoNes = 2 * N * s;
          const canvas = el("canvas", { "aria-label": "Allele frequency trajectories across 12 populations" });

          root.replaceChildren(
            el("div", { class: "wb-header" },
              el("div", null,
                el("h3", null, "Level 1 · Beat the Genetic Drift Floor (2Ne·s)"),
                el("p", { class: "wb-goal" }, "A beneficial allele (s = +0.12) starts at p₀ = 0.20. At Ne = 20, random sampling noise still drives it to loss. Tune Ne on the live 12-population preview, then verify your setting across 24 independent populations (target: mean final p ≥ 0.75 and ≤ 1 loss).")
              ),
              el("button", { type: "button", class: "g-btn g-btn-sm", onClick: () => { seed += 11; verifyRes = null; draw(); } }, "Re-roll Drift")
            ),
            el("div", { class: "wb-telemetry" },
              teleTile("2·Ne·s", twoNes.toFixed(1), twoNes >= 20 ? "good" : "warn"),
              teleTile("Preview Mean p", sim.meanP.toFixed(2), sim.meanP >= 0.75 ? "good" : "warn"),
              teleTile("Preview Lost", `${sim.lostCount} / 12`, sim.lostCount <= 1 ? "good" : "bad"),
              teleTile("Preview Fixed", `${sim.fixedCount} / 12`)
            ),
            el("div", { class: "sim-grid" },
              el("div", { class: "canvas-frame" }, canvas),
              el("div", { class: "control-stack" },
                sliderControl("Effective Population Size (Ne)", 10, 400, 10, N, (v) => `${v} diploids`, (v) => { N = v; verifyRes = null; draw(); }),
                el("div", { class: "game-meta" }, "Fixed parameters: p₀ = 0.20 · s = +0.12 · h = 0.5 · 60 generations."),
                el("button", { type: "button", class: "g-btn g-btn-primary", onClick: verify }, "Verify on 24 Independent Populations")
              )
            ),
            verifyRes
              ? verifyRes.ok
                ? feedbackBox("good", "Selection overcomes drift!", `Across 24 fresh populations at Ne = ${N} (2Ne·s = ${twoNes.toFixed(1)}), mean final p = ${verifyRes.check.meanP.toFixed(2)} with ${verifyRes.check.lostCount}/24 losses.`)
                : feedbackBox("bad", "Not robust enough yet:", `Across 24 fresh populations at Ne = ${N}, mean final p was ${verifyRes.check.meanP.toFixed(2)} with ${verifyRes.check.lostCount}/24 losses. Increase Ne so 2Ne·s comfortably exceeds the drift floor.`)
              : feedbackBox("", "Explore then verify:", "Drag Ne to observe how drift variance collapses as 1/(2Ne), then click Verify to test your setting on 24 fresh populations.")
          );
          requestAnimationFrame(() => drawTrajectoriesCanvas(canvas, sim));
        }
        draw();
      },
    },

    {
      id: "recessive-shield",
      name: "2. Recessive Shield",
      render(root, ctx) {
        let h = 0.0;
        let seed = 73;
        const N = 400;
        const s = -0.85;
        const p0 = 0.15;
        let verifyRes = null;

        function verify() {
          const check = Core.runWrightFisher({ N, p0, s, h, gens: 35, reps: 24, seed: seed + 777 });
          const ok = check.meanP < 0.015 && h > 0;
          verifyRes = { ok, check };
          if (ok) ctx.solve();
          draw();
        }

        function draw() {
          const sim = Core.runWrightFisher({ N, p0, s, h, gens: 35, reps: 12, seed });
          const canvas = el("canvas", { "aria-label": "Deleterious allele purging trajectories" });

          root.replaceChildren(
            el("div", { class: "wb-header" },
              el("div", null,
                el("h3", null, "Level 2 · Why Recessive Disease Alleles Refuse to Vanish"),
                el("p", { class: "wb-goal" }, "This severely deleterious allele (s = −0.85) starts at p₀ = 0.15. When completely recessive (h = 0), heterozygotes shield rare copies from selection. Tune dominance h and verify that 24 independent populations purge mean final p below 0.015 within 35 generations.")
              ),
              el("button", { type: "button", class: "g-btn g-btn-sm", onClick: () => { seed += 7; verifyRes = null; draw(); } }, "Re-roll")
            ),
            el("div", { class: "wb-telemetry" },
              teleTile("Dominance (h)", h.toFixed(2)),
              teleTile("Het Fitness wAa", (1 + h * s).toFixed(2)),
              teleTile("Preview Mean p", sim.meanP.toFixed(3), sim.meanP < 0.015 ? "good" : "warn"),
              teleTile("Preview Purged", `${sim.lostCount} / 12`)
            ),
            el("div", { class: "sim-grid" },
              el("div", { class: "canvas-frame" }, canvas),
              el("div", { class: "control-stack" },
                sliderControl("Dominance coefficient (h)", 0, 1, 0.05, h, (v) => v === 0 ? "0.00 (pure recessive)" : v === 1 ? "1.00 (dominant)" : v.toFixed(2), (v) => { h = v; verifyRes = null; draw(); }),
                el("div", { class: "game-meta" }, "At p = 0.05, homozygotes (p² = 0.25%) are nearly 40× rarer than healthy carriers (2pq = 9.5%)."),
                el("button", { type: "button", class: "g-btn g-btn-primary", onClick: verify }, "Verify on 24 Independent Populations")
              )
            ),
            verifyRes
              ? verifyRes.ok
                ? feedbackBox("good", "Exposed to selection — purged!", `Across 24 populations at h = ${h.toFixed(2)} (wAa = ${(1 + h * s).toFixed(2)}), mean final p dropped to ${verifyRes.check.meanP.toFixed(4)} (${verifyRes.check.lostCount}/24 completely purged).`)
                : feedbackBox("bad", "Still shielded in heterozygotes:", `Mean final p across 24 populations was ${verifyRes.check.meanP.toFixed(3)}. Raise h so carriers feel stronger purifying selection.`)
              : feedbackBox("", "Notice the curve at h = 0:", "Even a nearly lethal recessive (s = −0.85) stalls in a stubborn tail when hidden in heterozygotes. Raise h and verify.")
          );
          requestAnimationFrame(() => drawTrajectoriesCanvas(canvas, sim));
        }
        draw();
      },
    },

    {
      id: "balancing-selection",
      name: "3. Balancing Selection",
      render(root, ctx) {
        let wAA = 1.0;
        let waa = 1.0;
        const wAa = 1.0;
        let seed = 109;
        let verifyRes = null;

        function verify() {
          const check = Core.runWrightFisher({ N: 250, p0: 0.5, wAA, wAa, waa, gens: 70, reps: 24, seed: seed + 555 });
          const inBand = check.finals.filter((p) => p >= 0.2 && p <= 0.8).length;
          const overdominant = wAa > wAA && wAa > waa;
          const ok = overdominant && inBand >= 20;
          verifyRes = { ok, inBand, check };
          if (ok) ctx.solve();
          draw();
        }

        function draw() {
          const sim = Core.runWrightFisher({ N: 250, p0: 0.5, wAA, wAa, waa, gens: 70, reps: 12, seed });
          const inBand = sim.finals.filter((p) => p >= 0.2 && p <= 0.8).length;
          const overdominant = wAa > wAA && wAa > waa;
          const s1 = 1 - wAA;
          const s2 = 1 - waa;
          const eqP = overdominant ? (s2 / (s1 + s2)).toFixed(2) : "None";
          const canvas = el("canvas", { "aria-label": "Balancing selection trajectories" });

          root.replaceChildren(
            el("div", { class: "wb-header" },
              el("div", null,
                el("h3", null, "Level 3 · Stabilize Polymorphism via Heterozygote Advantage"),
                el("p", { class: "wb-goal" }, "Like sickle-cell trait in malaria regions, overdominance (wAa > wAA and wAa > waa) creates a restoring force toward an interior equilibrium p*. Tune wAA and waa, then verify ≥ 20/24 independent populations stay polymorphic (0.20 ≤ p ≤ 0.80) at gen 70.")
              ),
              el("button", { type: "button", class: "g-btn g-btn-sm", onClick: () => { seed += 19; verifyRes = null; draw(); } }, "Re-roll")
            ),
            el("div", { class: "wb-telemetry" },
              teleTile("wAA / wAa / waa", `${wAA.toFixed(2)} / 1.00 / ${waa.toFixed(2)}`),
              teleTile("Predicted p*", eqP),
              teleTile("Preview Poly (0.2–0.8)", `${inBand} / 12`, inBand >= 10 ? "good" : "warn"),
              teleTile("Preview Mean He", sim.meanHe.toFixed(2))
            ),
            el("div", { class: "sim-grid" },
              el("div", { class: "canvas-frame" }, canvas),
              el("div", { class: "control-stack" },
                sliderControl("Homozygote AA fitness (wAA)", 0.5, 1.0, 0.05, wAA, (v) => v.toFixed(2), (v) => { wAA = v; verifyRes = null; draw(); }),
                sliderControl("Homozygote aa fitness (waa)", 0.5, 1.0, 0.05, waa, (v) => v.toFixed(2), (v) => { waa = v; verifyRes = null; draw(); }),
                el("div", { class: "game-meta" }, "Heterozygote fitness is anchored at wAa = 1.00."),
                el("button", { type: "button", class: "g-btn g-btn-primary", onClick: verify }, "Verify on 24 Independent Populations")
              )
            ),
            verifyRes
              ? verifyRes.ok
                ? feedbackBox("good", "Balanced polymorphism locked in!", `${verifyRes.inBand}/24 populations remained polymorphic near p* = ${eqP} (mean He = ${verifyRes.check.meanHe.toFixed(2)}).`)
                : feedbackBox("bad", "Restoring force too weak:", `${verifyRes.inBand}/24 populations stayed in [0.20, 0.80]. Lower BOTH wAA and waa below wAa = 1.00 so heterozygote advantage strongly resists drift.`)
              : feedbackBox("", "Tip:", "Set both homozygote fitnesses below 1.00 so neither allele can sweep to fixation, then run the 24-population check.")
          );
          requestAnimationFrame(() => drawTrajectoriesCanvas(canvas, sim));
        }
        draw();
      },
    },

    {
      id: "bottleneck-rescue",
      name: "4. Bottleneck & Gene Flow",
      render(root, ctx) {
        let m = 0.0;
        let seed = 211;
        let verifyRes = null;

        function verify() {
          const check = Core.runWrightFisher({ N: 180, p0: 0.5, s: 0, h: 0.5, m, pMig: 0.5, gens: 60, reps: 24, bottleneckGen: 15, bottleneckN: 5, bottleneckLen: 8, seed: seed + 444 });
          const ok = check.meanHe >= 0.38 && check.fixedCount + check.lostCount === 0;
          verifyRes = { ok, check };
          if (ok) ctx.solve();
          draw();
        }

        function draw() {
          const opts = { N: 180, p0: 0.5, s: 0, h: 0.5, m, pMig: 0.5, gens: 60, reps: 12, bottleneckGen: 15, bottleneckN: 5, bottleneckLen: 8, seed };
          const sim = Core.runWrightFisher(opts);
          const canvas = el("canvas", { "aria-label": "Bottleneck and migration rescue trajectories" });

          root.replaceChildren(
            el("div", { class: "wb-header" },
              el("div", null,
                el("h3", null, "Level 4 · Survive a Founder Bottleneck with Gene Flow"),
                el("p", { class: "wb-goal" }, "At generations 15–23, a severe bottleneck shrinks the island population to Ne = 5 diploids. Tune mainland migration rate m (mainland p = 0.5) and verify across 24 populations that 0 fix/lose the allele and mean He ≥ 0.38.")
              ),
              el("button", { type: "button", class: "g-btn g-btn-sm", onClick: () => { seed += 13; verifyRes = null; draw(); } }, "Re-roll")
            ),
            el("div", { class: "wb-telemetry" },
              teleTile("Migration Rate m", `${(m * 100).toFixed(1)}% / gen`),
              teleTile("Preview Mean He", sim.meanHe.toFixed(2), sim.meanHe >= 0.38 ? "good" : "warn"),
              teleTile("Preview Fixed/Lost", `${sim.fixedCount + sim.lostCount} / 12`, sim.fixedCount + sim.lostCount === 0 ? "good" : "bad")
            ),
            el("div", { class: "sim-grid" },
              el("div", { class: "canvas-frame" }, canvas),
              el("div", { class: "control-stack" },
                sliderControl("Migration rate (m)", 0, 0.15, 0.01, m, (v) => `${(v * 100).toFixed(0)}%`, (v) => { m = v; verifyRes = null; draw(); }),
                el("div", { class: "game-meta" }, "Even a modest trickle of migrants (Nm > 1) counteracts bottleneck allele loss."),
                el("button", { type: "button", class: "g-btn g-btn-primary", onClick: verify }, "Verify on 24 Independent Populations")
              )
            ),
            verifyRes
              ? verifyRes.ok
                ? feedbackBox("good", "Genetic rescue verified!", `At m = ${(m * 100).toFixed(0)}%, 0/24 populations lost polymorphism and mean heterozygosity recovered to He = ${verifyRes.check.meanHe.toFixed(2)}.`)
                : feedbackBox("bad", "Diversity still lost:", `Across 24 populations, mean He = ${verifyRes.check.meanHe.toFixed(2)} and ${verifyRes.check.fixedCount + verifyRes.check.lostCount}/24 fixed or lost the allele. Increase m.`)
              : feedbackBox("", "Observe the red bottleneck zone:", "At m = 0, Ne = 5 shatters diversity permanently. Tune m upward and click Verify.")
          );
          requestAnimationFrame(() => drawTrajectoriesCanvas(canvas, sim, opts));
        }
        draw();
      },
    },

    {
      id: "evo-forensics",
      name: "5. Evolutionary Forensics",
      render(root, ctx) {
        const cases = [
          {
            id: "A",
            label: "Dataset A",
            answer: "drift",
            sim: Core.runWrightFisher({ N: 18, p0: 0.5, s: 0, gens: 60, reps: 10, seed: 301 }),
          },
          {
            id: "B",
            label: "Dataset B",
            answer: "sweep",
            sim: Core.runWrightFisher({ N: 250, p0: 0.12, s: 0.22, h: 0.5, gens: 60, reps: 10, seed: 302 }),
          },
          {
            id: "C",
            label: "Dataset C",
            answer: "balancing",
            sim: Core.runWrightFisher({ N: 250, p0: 0.15, wAA: 0.72, wAa: 1.0, waa: 0.78, gens: 60, reps: 10, seed: 303 }),
          },
        ];
        let activeCase = 0;
        const guesses = { A: "", B: "", C: "" };
        let submitted = false;

        function draw() {
          const cur = cases[activeCase];
          const allAnswered = cases.every((c) => guesses[c.id]);
          const correctCount = cases.filter((c) => guesses[c.id] === c.answer).length;
          const allRight = submitted && correctCount === cases.length;
          if (allRight) ctx.solve();

          const canvas = el("canvas", { "aria-label": `Blind evolutionary trajectories for ${cur.label}` });

          root.replaceChildren(
            el("div", { class: "wb-header" },
              el("div", null,
                el("h3", null, "Level 5 · Diagnose 3 Blind Evolutionary Regimes"),
                el("p", { class: "wb-goal" }, "Inspect all three simulated datasets (A, B, C), assign each to Neutral Drift, Directional Sweep, or Balancing Selection, and submit your diagnosis.")
              )
            ),
            el("div", { class: "wb-actions" },
              ...cases.map((c, idx) =>
                el("button", {
                  type: "button",
                  class: `g-btn g-btn-sm${activeCase === idx ? " g-btn-primary" : ""}`,
                  onClick: () => { activeCase = idx; draw(); },
                }, `${c.label}${guesses[c.id] ? " (" + guesses[c.id] + ")" : ""}`)
              )
            ),
            el("div", { class: "wb-telemetry" },
              teleTile("Viewing", cur.label),
              teleTile("Mean Final p", cur.sim.meanP.toFixed(2)),
              teleTile("Fixed / Lost / Poly", `${cur.sim.fixedCount} / ${cur.sim.lostCount} / ${cur.sim.polyCount}`),
              teleTile("Mean He", cur.sim.meanHe.toFixed(2))
            ),
            el("div", { class: "canvas-frame" }, canvas),
            el("div", { class: "choice-grid" },
              ...cases.map((c) =>
                el("div", { class: "control-stack" },
                  el("span", { class: "tele-label" }, `Classify ${c.label}`),
                  el("div", { class: "wb-actions" },
                    ...[["drift", "Neutral Drift"], ["sweep", "Directional Sweep"], ["balancing", "Balancing Selection"]].map(([val, lbl]) =>
                      el("button", {
                        type: "button",
                        class: `g-btn g-btn-sm${guesses[c.id] === val ? " g-btn-primary" : ""}`,
                        onClick: () => { guesses[c.id] = val; activeCase = cases.indexOf(c); submitted = false; draw(); },
                      }, lbl)
                    )
                  )
                )
              )
            ),
            el("div", { class: "wb-actions" },
              el("button", {
                type: "button",
                class: "g-btn g-btn-primary",
                disabled: !allAnswered,
                onClick: () => { submitted = true; draw(); },
              }, "Submit Classifications")
            ),
            submitted
              ? allRight
                ? feedbackBox("good", "All 3 evolutionary signatures diagnosed!", "Dataset A fans symmetrically to BOTH 0 and 1 (pure drift in small N); Dataset B sweeps deterministically to fixation (directional selection); Dataset C rises from 0.15 and locks around ~0.44 without fixing (balancing selection).")
                : feedbackBox("bad", `${correctCount} / 3 correct:`, "Check the hallmarks: Drift loses AND fixes alleles symmetrically; Sweeps drive nearly all replicates to 1.0; Balancing converges on an intermediate frequency (~0.4–0.6) with zero fixation.")
              : feedbackBox("", "Inspect all 3 datasets:", "Switch between A, B, and C above, assign all three regimes, and click Submit Classifications.")
          );
          requestAnimationFrame(() => drawTrajectoriesCanvas(canvas, cur.sim));
        }
        draw();
      },
    },
  ];

  /* =========================================================================
     GAME 05: READ MAPPER & VARIANT DETECTIVE
     ========================================================================= */

  Registry["read-mapper"] = [
    {
      id: "seed-align",
      name: "1. Seed & Align",
      render(root, ctx) {
        const ref  = "CCGTATGCTAGCATCGGATACCTAGGTTACGCTAGCAATGCT"; // 42 bp
        const read = "CGGATATCTAGGTT"; // true locus pos 14, 1 SNP C>T at offset 6
        let pos = 0;

        function draw() {
          const aln = Core.alignUngapped(ref, read, pos);
          const solved = pos === 14 && aln.mismatches === 1;
          if (solved) ctx.solve();

          const leftSeed = Core.findExactHits(ref, read.slice(0, 5)).hits;
          const rightSeed = Core.findExactHits(ref, read.slice(read.length - 5)).hits.map((h) => h - (read.length - 5));

          root.replaceChildren(
            el("div", { class: "wb-header" },
              el("div", null,
                el("h3", null, "Level 1 · Seed-and-Extend Short Read Alignment"),
                el("p", { class: "wb-goal" }, "Slide the 14-bp sequencing read across the reference (or jump straight to a 5-mer seed hit!) to maximize alignment score. One true SNP differs from the reference.")
              )
            ),
            el("div", { class: "wb-telemetry" },
              teleTile("Reference Pos", `chr1:${pos + 1}`),
              teleTile("Mismatches", String(aln.mismatches), aln.mismatches <= 1 ? "good" : "bad"),
              teleTile("Alignment Score", String(aln.score), solved ? "good" : ""),
              teleTile("CIGAR", aln.cigar)
            ),
            el("div", { class: "wb-actions" },
              el("span", { class: "game-meta" }, "Jump to 5-mer seed:"),
              ...leftSeed.map((h) => el("button", { type: "button", class: "g-btn g-btn-sm", onClick: () => { pos = h; draw(); } }, `Seed "${read.slice(0, 5)}" @ pos ${h + 1}`)),
              ...rightSeed.filter((h) => h >= 0 && !leftSeed.includes(h)).map((h) => el("button", { type: "button", class: "g-btn g-btn-sm", onClick: () => { pos = h; draw(); } }, `Seed "${read.slice(-5)}" @ pos ${h + 1}`))
            ),
            sliderControl("Slide read position along reference", 0, ref.length - read.length, 1, pos, (v) => `pos ${v + 1}`, (v) => { pos = v; draw(); }),
            el("div", { class: "igv-track" },
              el("div", { class: "igv-row" },
                el("span", { class: "igv-label" }, "Reference"),
                ...ref.split("").map((b, i) =>
                  el("span", { class: `igv-cell is-ref${i >= pos && i < pos + read.length ? "" : " is-dim"}` }, b)
                )
              ),
              el("div", { class: "igv-row" },
                el("span", { class: "igv-label" }, "Read (14 bp)"),
                ...ref.split("").map((_, i) => {
                  const qi = i - pos;
                  if (qi < 0 || qi >= read.length) return el("span", { class: "igv-cell" }, "");
                  const col = aln.cols[qi];
                  return el("span", { class: `igv-cell ${col.match ? "is-hit" : "is-mm"}` }, col.readBase);
                })
              )
            ),
            feedbackBox(
              solved ? "good" : "",
              solved ? "Optimal alignment locked (score +22)!" : "How mappers avoid O(N·M) scans:",
              solved
                ? "Jumping directly to the 5-mer seed landed at chr1:15 with 13 matches and 1 true C>T SNP (CIGAR 14M)."
                : "Notice how a single 5-mer exact seed instantly locates the true coordinate without sliding across every position."
            )
          );
        }
        draw();
      },
    },

    {
      id: "indel-trap",
      name: "2. The Indel Trap",
      render(root, ctx) {
        const ref = "ATGCTAGCTAAGCTTGC";
        const read = "ATGCTATAAGCTT";
        let delOffset = 0;
        let delLen = 0;
        let showHint = false;

        function draw() {
          const aln = Core.alignWithDeletion(ref, read, 0, delOffset, delLen);
          const solved = aln.mismatches === 0 && aln.cigar === "6M2D7M";
          if (solved) ctx.solve();

          root.replaceChildren(
            el("div", { class: "wb-header" },
              el("div", null,
                el("h3", null, "Level 2 · Open a Gapped Alignment (CIGAR Deletion)"),
                el("p", { class: "wb-goal" }, "Without a gap, a single deletion shifts the rest of the read out of register, creating 6 fake mismatches! Open a deletion gap at the right offset and length to collapse mismatches to 0.")
              ),
              el("div", { class: "wb-actions" },
                hintToggleBtn(showHint, () => { showHint = !showHint; draw(); }),
                el("button", { type: "button", class: "g-btn g-btn-sm", onClick: () => { delOffset = 0; delLen = 0; draw(); } }, "Ungapped")
              )
            ),
            hintPanel(showHint, "Count the exact green matching bases from the left (1..6) until mismatches abruptly start at base 7 — then test how many reference bases (1D, 2D, 3D) are missing from the read."),
            el("div", { class: "wb-telemetry" },
              teleTile("Mismatches", String(aln.mismatches), aln.mismatches === 0 ? "good" : "bad"),
              teleTile("CIGAR String", aln.cigar, solved ? "good" : "warn"),
              teleTile("Alignment Score", String(aln.score), solved ? "good" : "")
            ),
            el("div", { class: "choice-grid" },
              sliderControl("Gap start offset (bases into read)", 0, read.length - 1, 1, delOffset, (v) => v === 0 ? "Off" : `after base ${v}`, (v) => { delOffset = v; if (v > 0 && delLen === 0) delLen = 1; draw(); }),
              sliderControl("Deletion length (bp skipped in ref)", 0, 4, 1, delLen, (v) => `${v}D`, (v) => { delLen = v; if (v > 0 && delOffset === 0) delOffset = 6; draw(); })
            ),
            el("div", { class: "igv-track" },
              el("div", { class: "igv-row" },
                el("span", { class: "igv-label" }, "Reference"),
                ...aln.cols.map((c) => el("span", { class: "igv-cell is-ref" }, c.refBase))
              ),
              el("div", { class: "igv-row" },
                el("span", { class: "igv-label" }, "Read"),
                ...aln.cols.map((c) =>
                  el("span", { class: `igv-cell ${c.isDel ? "is-del" : c.match ? "is-hit" : "is-mm"}` }, c.readBase)
                )
              )
            ),
            feedbackBox(
              solved ? "good" : "warn",
              solved ? "CIGAR 6M2D7M — zero mismatches!" : `${aln.mismatches} apparent mismatches:`,
              solved
                ? "Paying one gap-open penalty eliminated 6 false SNPs in a row — exactly why Smith–Waterman affine gap penalties beat ungapped matching around indels."
                : "Notice how an unaligned deletion causes every single downstream base to mismatch."
            )
          );
        }
        draw();
      },
    },

    {
      id: "repeat-mapq",
      name: "3. Repeat Blindspot",
      render(root, ctx) {
        // Duplicated 7-mer "CGTACGT" sits at index 2 (followed by AAA) and index 15 (followed by CC)
        const ref = "AACGTACGTAAATTTCGTACGTCC";
        const fullReadFromCopy2 = "CGTACGTCC"; // 7bp repeat + 2bp unique right flank
        let readLen = 6;
        let submitted = false;

        function draw() {
          const curRead = fullReadFromCopy2.slice(0, readLen);
          const res = Core.findExactHits(ref, curRead);
          // Exact minimum read length to break the 7-bp repeat tie is 8 bp ("CGTACGTC" -> 1 hit!)
          const solved = submitted && readLen === 8 && res.mapq === 60;
          if (solved) ctx.solve();

          root.replaceChildren(
            el("div", { class: "wb-header" },
              el("div", null,
                el("h3", null, "Level 3 · Find the Exact Minimum Read Length to Break a Repeat Tie"),
                el("p", { class: "wb-goal" }, "This reference contains a duplicated 7-bp repeat (CGTACGT). Extend the read length one base at a time until it crosses into the unique flank — then lock in the EXACT MINIMUM read length that achieves MAPQ = 60.")
              )
            ),
            el("div", { class: "wb-telemetry" },
              teleTile("Read Length", `${readLen} bp`),
              teleTile("Read Sequence", curRead),
              teleTile("Exact Hits", String(res.hits.length), res.hits.length === 1 ? "good" : "bad"),
              teleTile("MAPQ", String(res.mapq), res.mapq === 60 ? "good" : "bad")
            ),
            sliderControl("Read length extending from Copy #2", 5, 9, 1, readLen, (v) => `${v} bp`, (v) => { readLen = v; submitted = false; draw(); }),
            el("div", { class: "igv-track" },
              el("div", { class: "igv-row" },
                el("span", { class: "igv-label" }, "Reference"),
                ...ref.split("").map((b, i) => {
                  const inAnyHit = res.hits.some((h) => i >= h && i < h + curRead.length);
                  return el("span", { class: `igv-cell ${inAnyHit ? (res.hits.length > 1 ? "is-del" : "is-hit") : "is-ref"}` }, b);
                })
              ),
              ...res.hits.map((h, idx) =>
                el("div", { class: "igv-row" },
                  el("span", { class: "igv-label" }, `Hit #${idx + 1} @${h + 1}`),
                  ...ref.split("").map((_, i) =>
                    el("span", { class: `igv-cell ${i >= h && i < h + curRead.length ? (res.hits.length > 1 ? "is-del" : "is-hit") : ""}` },
                      i >= h && i < h + curRead.length ? curRead[i - h] : "")
                  )
                )
              )
            ),
            el("div", { class: "wb-actions" },
              el("button", { type: "button", class: "g-btn g-btn-primary", onClick: () => { submitted = true; draw(); } }, `Lock In ${readLen} bp as Minimum`)
            ),
            submitted
              ? solved
                ? feedbackBox("good", "Exact boundary found (8 bp = repeat + 1 unique flank base)!", "At 7 bp, CGTACGT still hits both copies equally (MAPQ = 0). Adding the 8th base (C vs A) immediately breaks the paralog tie and lifts MAPQ to 60.")
                : res.hits.length > 1
                  ? feedbackBox("bad", `Still ambiguous at ${readLen} bp (MAPQ = 0):`, `Your read still fits completely inside the duplicated 7-bp repeat (${res.hits.length} identical hits). Extend past the repeat boundary!`)
                  : feedbackBox("warn", `${readLen} bp maps uniquely, but is it the MINIMUM?`, "Try 1 bp shorter to find the exact threshold where MAPQ jumps from 0 to 60.")
              : feedbackBox("", "Physical rule:", "A read can only resolve a repeat once it is strictly longer than the repeat unit and anchors into at least 1 differentiating flanking base.")
          );
        }
        draw();
      },
    },

    {
      id: "pileup-caller",
      name: "4. Pileup Caller",
      render(root, ctx) {
        let drillSeed = 404;
        let loci = [
          {
            id: "locusA",
            name: "Locus A (chr7:117559590 · Ref A / Alt G)",
            ref: "A", alt: "G", truth: "0/1",
            reads: [
              { base: "A", qual: 37, strand: "+" }, { base: "A", qual: 35, strand: "-" },
              { base: "A", qual: 36, strand: "+" }, { base: "A", qual: 34, strand: "-" },
              { base: "G", qual: 36, strand: "+" }, { base: "G", qual: 35, strand: "-" },
              { base: "G", qual: 34, strand: "+" }, { base: "G", qual: 33, strand: "-" },
              { base: "A", qual: 35, strand: "+" }, { base: "C", qual: 9,  strand: "+" },
            ],
          },
          {
            id: "locusB",
            name: "Locus B (chr12:25245350 · Ref C / Alt T)",
            ref: "C", alt: "T", truth: "0/0",
            reads: [
              { base: "C", qual: 38, strand: "+" }, { base: "C", qual: 36, strand: "-" },
              { base: "C", qual: 37, strand: "+" }, { base: "C", qual: 35, strand: "-" },
              { base: "C", qual: 36, strand: "+" }, { base: "C", qual: 34, strand: "-" },
              { base: "T", qual: 8,  strand: "+" }, { base: "T", qual: 10, strand: "+" },
              { base: "T", qual: 11, strand: "+" }, { base: "T", qual: 9,  strand: "+" },
            ],
          },
        ];
        let activeIdx = 0;
        let minQ = 0;
        let calls = { locusA: "", locusB: "" };
        let submitted = false;

        function newBlindDrill() {
          drillSeed += 71;
          const kinds = ["het-snp", "hom-alt", "artifact"];
          const kA = kinds[drillSeed % 3];
          const kB = kinds[(drillSeed + 1) % 3];
          const gA = Core.generatePileupLocus(kA, drillSeed);
          const gB = Core.generatePileupLocus(kB, drillSeed + 19);
          loci = [
            { id: "locusA", name: `Blind Locus A (Ref ${gA.ref} / Alt ${gA.alt})`, ...gA },
            { id: "locusB", name: `Blind Locus B (Ref ${gB.ref} / Alt ${gB.alt})`, ...gB },
          ];
          calls = { locusA: "", locusB: "" };
          minQ = 0;
          submitted = false;
          draw();
        }

        function draw() {
          const loc = loci[activeIdx];
          const stats = Core.analyzePileup(loc.reads, loc.ref, loc.alt, minQ);
          const allCalled = Boolean(calls.locusA && calls.locusB);
          const rightA = calls.locusA === loci[0].truth;
          const rightB = calls.locusB === loci[1].truth;
          const solved = submitted && rightA && rightB;
          if (solved) ctx.solve();

          root.replaceChildren(
            el("div", { class: "wb-header" },
              el("div", null,
                el("h3", null, "Level 4 · Call True SNPs vs. Low-Q Sequencing Artifacts"),
                el("p", { class: "wb-goal" }, "Inspect both pileup columns below. Raise the Phred quality filter (Q ≥ 20 drops ≥1% error bases) and check strand balance (+ vs −), then submit your diploid calls for both loci.")
              ),
              el("button", { type: "button", class: "g-btn g-btn-sm", onClick: newBlindDrill }, "New Blind Loci")
            ),
            el("div", { class: "wb-actions" },
              ...loci.map((l, i) =>
                el("button", {
                  type: "button",
                  class: `g-btn g-btn-sm${activeIdx === i ? " g-btn-primary" : ""}`,
                  onClick: () => { activeIdx = i; draw(); },
                }, `${l.id === "locusA" ? "Locus A" : "Locus B"}${calls[l.id] ? " [" + calls[l.id] + "]" : ""}`)
              )
            ),
            sliderControl("Minimum Base Quality Filter (Phred Q)", 0, 30, 5, minQ, (v) => `Q ≥ ${v} (P_err ≤ ${(Core.phredErrorProb(v) * 100).toFixed(2)}%)`, (v) => { minQ = v; draw(); }),
            el("div", { class: "wb-telemetry" },
              teleTile("Kept Depth", `${stats.depth} / ${loc.reads.length}`),
              teleTile(`Ref (${loc.ref}) / Alt (${loc.alt})`, `${stats.refCount} / ${stats.altCount}`),
              teleTile("Alt Strand (+ / −)", `${stats.fwdAlt} / ${stats.revAlt}`, stats.strandBias ? "bad" : "good"),
              teleTile("Alt Allele Freq", `${Math.round(stats.altFreq * 100)}%`)
            ),
            el("div", { class: "igv-track" },
              el("div", { class: "game-meta", style: "margin-bottom:.35rem" }, loc.name),
              ...loc.reads.map((r, i) => {
                const kept = r.qual >= minQ;
                const cls = !kept ? "is-dim is-ref" : r.base === loc.ref ? "is-ref" : r.base === loc.alt ? "is-del" : "is-mm";
                return el("div", { class: "igv-row" },
                  el("span", { class: "igv-label" }, `Read ${i + 1} (${r.strand})`),
                  el("span", { class: `igv-cell ${cls}` }, r.base),
                  el("span", { class: "game-meta", style: "margin-left:.65rem" }, `Q${r.qual}${!kept ? " · filtered out" : ""}`)
                );
              })
            ),
            el("div", { class: "choice-grid" },
              ...loci.map((l) =>
                el("div", { class: "control-stack" },
                  el("span", { class: "tele-label" }, `Call ${l.id === "locusA" ? "Locus A" : "Locus B"}`),
                  el("div", { class: "wb-actions" },
                    ...[["0/0", "0/0 (Hom Ref)"], ["0/1", "0/1 (Het SNP)"], ["1/1", "1/1 (Hom Alt)"]].map(([g, lbl]) =>
                      el("button", {
                        type: "button",
                        class: `g-btn g-btn-sm${calls[l.id] === g ? " g-btn-primary" : ""}`,
                        onClick: () => { calls[l.id] = g; activeIdx = loci.indexOf(l); submitted = false; draw(); },
                      }, lbl)
                    )
                  )
                )
              )
            ),
            el("div", { class: "wb-actions" },
              el("button", {
                type: "button",
                class: "g-btn g-btn-primary",
                disabled: !allCalled,
                onClick: () => { submitted = true; draw(); },
              }, "Submit Genotype Calls")
            ),
            submitted
              ? solved
                ? feedbackBox("good", "Both variant calls verified!", `Locus A = ${loci[0].truth}, Locus B = ${loci[1].truth}. Filtering Q ≥ 20 and checking +/− strand balance cleanly separates true SNPs from low-quality strand-biased artifacts.`)
                : feedbackBox("bad", `${(rightA ? 1 : 0) + (rightB ? 1 : 0)} / 2 correct:`, "Set the Phred filter to Q ≥ 20 on both Locus A and Locus B and check whether the alternate allele survives on BOTH + and − strands!")
              : feedbackBox("", "Tip:", "Adjust Phred Q on both tabs, pick each diploid genotype, and click Submit Genotype Calls.")
          );
        }
        draw();
      },
    },

    {
      id: "clinical-triage",
      name: "5. Exome VCF Triage",
      render(root, ctx) {
        const variants = [
          { gene: "APOE",   change: "p.Cys130Arg",  consequence: "missense",   gnomadAf: 0.15,    segregates: true },
          { gene: "TTN",    change: "p.Ala14210=",  consequence: "synonymous", gnomadAf: 0.0002,  segregates: true },
          { gene: "BRCA2",  change: "p.Lys3326*",   consequence: "nonsense",   gnomadAf: 0.009,   segregates: false },
          { gene: "KCNQ2",  change: "p.Val210Met",  consequence: "missense",   gnomadAf: 0.0001,  segregates: false },
          { gene: "SCN9A",  change: "p.Arg896*",    consequence: "nonsense",   gnomadAf: 0.00001, segregates: true },
          { gene: "RYR1",   change: "p.Leu488=",    consequence: "synonymous", gnomadAf: 0.00005, segregates: true },
        ];
        const filters = { maxAf: 1.0, excludeSynonymous: false, requireSegregation: false };
        let pickedGene = "";
        let submitted = false;

        function draw() {
          const kept = Core.filterClinicalVariants(variants, filters);
          if (pickedGene && !kept.some((v) => v.gene === pickedGene)) pickedGene = "";
          const solved = submitted && kept.length === 1 && pickedGene === "SCN9A";
          if (solved) ctx.solve();

          root.replaceChildren(
            el("div", { class: "wb-header" },
              el("div", null,
                el("h3", null, "Level 5 · Isolate & Report the Causal Rare Disease Variant"),
                el("p", { class: "wb-goal" }, "A child has a rare dominant Mendelian neuropathy (prevalence < 1 in 50,000). Filter the VCF table down to the single causal candidate, click its row to select it, and file the clinical report.")
              )
            ),
            el("div", { class: "wb-actions" },
              el("span", { class: "game-meta" }, "Max gnomAD AF:"),
              ...[[1.0, "No filter"], [0.01, "≤ 1%"], [0.001, "≤ 0.1%"]].map(([af, lbl]) =>
                el("button", { type: "button", class: `g-btn g-btn-sm${filters.maxAf === af ? " g-btn-primary" : ""}`, onClick: () => { filters.maxAf = af; submitted = false; draw(); } }, lbl)
              ),
              el("button", {
                type: "button",
                class: `g-btn g-btn-sm${filters.excludeSynonymous ? " g-btn-primary" : ""}`,
                onClick: () => { filters.excludeSynonymous = !filters.excludeSynonymous; submitted = false; draw(); },
              }, filters.excludeSynonymous ? "✓ Exclude Synonymous" : "Exclude Synonymous"),
              el("button", {
                type: "button",
                class: `g-btn g-btn-sm${filters.requireSegregation ? " g-btn-primary" : ""}`,
                onClick: () => { filters.requireSegregation = !filters.requireSegregation; submitted = false; draw(); },
              }, filters.requireSegregation ? "✓ Require Family Segregation" : "Require Family Segregation")
            ),
            el("div", { class: "strand-board" },
              el("table", { class: "vcf-table" },
                el("thead", null,
                  el("tr", null, el("th", null, "Gene"), el("th", null, "Variant"), el("th", null, "Consequence"), el("th", null, "gnomAD AF"), el("th", null, "Segregates?"))
                ),
                el("tbody", null,
                  ...variants.map((v) => {
                    const pass = kept.includes(v);
                    const picked = pickedGene === v.gene;
                    return el("tr", {
                      class: !pass ? "is-filtered" : solved ? "is-winner" : picked ? "is-selectable is-picked" : "is-selectable",
                      onClick: () => { if (pass) { pickedGene = v.gene; submitted = false; draw(); } },
                    },
                      el("td", null, el("strong", null, v.gene)),
                      el("td", null, el("code", null, v.change)),
                      el("td", null, v.consequence),
                      el("td", null, v.gnomadAf.toString()),
                      el("td", null, v.segregates ? "Yes" : "No")
                    );
                  })
                )
              )
            ),
            el("div", { class: "wb-actions" },
              el("button", {
                type: "button",
                class: "g-btn g-btn-primary",
                disabled: !pickedGene,
                onClick: () => { submitted = true; draw(); },
              }, pickedGene ? `Report ${pickedGene} as Causal` : "Select a Surviving Row Above")
            ),
            submitted
              ? solved
                ? feedbackBox("good", "Clinical report verified: SCN9A p.Arg896*!", "Ultra-rare in gnomAD (0.00001), protein-truncating nonsense mutation, and co-segregates with affected relatives — and all 5 benign/non-segregating decoys were cleanly filtered out.")
                : feedbackBox("bad", "Filter & isolate cleanly:", kept.length > 1
                    ? `${kept.length} variants still survive your filters. Tighten gnomAD AF, consequence, and segregation filters until only the single causal variant remains.`
                    : `${pickedGene} does not satisfy rare-disease causality criteria.`)
              : feedbackBox("", `${kept.length} candidate(s) surviving:`, "Apply the right VCF filters until only 1 causal variant survives, click its row, and click Report.")
          );
        }
        draw();
      },
    },
  ];

  /* =========================================================================
     GAME 06: REPEAT INSTABILITY & SCA12 BOARD (Capstone)
     ========================================================================= */

  Registry["sca12-lab"] = [
    {
      id: "hairpin-slippage",
      name: "1. Hairpin Slippage",
      render(root, ctx) {
        const cases = [
          { id: "exp", label: "Case A · Expansion (22 → 29 CAG)", start: 22, target: 29, truthStrand: "nascent", truthLoop: 7 },
          { id: "con", label: "Case B · Contraction (44 → 38 CAG)", start: 44, target: 38, truthStrand: "template", truthLoop: 6 },
        ];
        let caseIdx = 0;
        let strand = "none";
        let loopUnits = 4;
        const doneCases = { exp: false, con: false };
        let lastSim = null;

        function runSim() {
          const c = cases[caseIdx];
          lastSim = Core.simulateRepeatSlippage(c.start, strand, loopUnits);
          if (lastSim.finalRepeats === c.target && strand === c.truthStrand) {
            doneCases[c.id] = true;
          }
          if (doneCases.exp && doneCases.con) ctx.solve();
          draw();
        }

        function draw() {
          const c = cases[caseIdx];
          const preview = Core.simulateRepeatSlippage(c.start, strand, loopUnits);
          const allDone = doneCases.exp && doneCases.con;

          const hairpinSvg = `
            <svg viewBox="0 0 580 185" width="580" height="185" role="img" aria-label="CAG repeat hairpin slippage diagram">
              <path d="${strand === "template"
                ? "M 40 62 L 245 62 C 260 62, 265 18, 290 18 C 315 18, 320 62, 335 62 L 540 62"
                : "M 40 62 L 540 62"}" fill="none" stroke="var(--ink)" stroke-width="4" stroke-linecap="round"/>
              <text x="40" y="48" fill="var(--ink-faint)" font-family="var(--font-ui)" font-size="11.5" font-weight="600">Parental template: (GTC) × ${c.start}</text>
              ${strand === "template" ? `<text x="290" y="13" text-anchor="middle" fill="var(--do)" font-family="var(--font-mono)" font-size="11" font-weight="700">Template hairpin (−${loopUnits} skipped)</text>` : ""}
              <path d="${strand === "nascent"
                ? "M 40 112 L 245 112 C 260 112, 265 162, 290 162 C 315 162, 320 112, 335 112 L 500 112"
                : "M 40 112 L 500 112"}" fill="none" stroke="var(--accent)" stroke-width="4" stroke-linecap="round"/>
              <text x="40" y="136" fill="var(--accent-ink)" font-family="var(--font-ui)" font-size="11.5" font-weight="600">Target daughter allele: ${c.target} CAG</text>
              ${strand === "nascent" ? `<text x="290" y="178" text-anchor="middle" fill="var(--bad)" font-family="var(--font-mono)" font-size="11" font-weight="700">Nascent hairpin (+${loopUnits} re-copied)</text>` : ""}
              <rect x="488" y="95" width="48" height="34" rx="10" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
              <text x="512" y="116" text-anchor="middle" fill="var(--accent-ink)" font-family="var(--font-mono)" font-size="11" font-weight="700">Pol</text>
            </svg>`;

          root.replaceChildren(
            el("div", { class: "wb-header" },
              el("div", null,
                el("h3", null, "Level 1 · Reverse-Engineer Repeat Expansion & Contraction"),
                el("p", { class: "wb-goal" }, "Reproduce BOTH observed parent→child repeat transmissions below by choosing which strand forms the hairpin AND the exact loop size in CAG units, then clicking Simulate Replication.")
              )
            ),
            el("div", { class: "wb-actions" },
              ...cases.map((cs, i) =>
                el("button", {
                  type: "button",
                  class: `g-btn g-btn-sm${caseIdx === i ? " g-btn-primary" : ""}`,
                  onClick: () => { caseIdx = i; strand = "none"; lastSim = null; draw(); },
                }, `${doneCases[cs.id] ? "✓ " : ""}${cs.label}`)
              )
            ),
            el("div", { class: "wb-telemetry" },
              teleTile("Parental Allele", `${c.start} CAG`),
              teleTile("Target Offspring", `${c.target} CAG`),
              teleTile("Case A (Expand)", doneCases.exp ? "Reproduced ✓" : "Pending", doneCases.exp ? "good" : "warn"),
              teleTile("Case B (Contract)", doneCases.con ? "Reproduced ✓" : "Pending", doneCases.con ? "good" : "warn")
            ),
            el("div", { class: "svg-stage", html: hairpinSvg }),
            el("div", { class: "wb-actions" },
              ...[["none", "No Hairpin"], ["nascent", "Hairpin on Nascent Strand"], ["template", "Hairpin on Template Strand"]].map(([val, lbl]) =>
                el("button", { type: "button", class: `g-btn g-btn-sm${strand === val ? " g-btn-primary" : ""}`, onClick: () => { strand = val; lastSim = null; draw(); } }, lbl)
              )
            ),
            sliderControl("Hairpin loop size (CAG units)", 2, 12, 1, loopUnits, (v) => `${v} CAG (${v * 3} bp)`, (v) => { loopUnits = v; lastSim = null; draw(); }),
            el("div", { class: "wb-actions" },
              el("button", { type: "button", class: "g-btn g-btn-primary", onClick: runSim }, "Simulate Replication")
            ),
            lastSim
              ? lastSim.finalRepeats === c.target
                ? feedbackBox("good", allDone ? "Both slippage mechanisms mastered!" : `Reproduced ${c.start} → ${c.target} CAG!`, lastSim.explanation + (allDone ? "" : " Now switch to the other case tab above."))
                : feedbackBox("bad", `Produced ${lastSim.finalRepeats} CAG (target is ${c.target}):`, lastSim.explanation)
              : feedbackBox("", "Mechanistic rule:", `Choose which strand loops out and set the loop size (${preview.delta === 0 ? "no change" : (preview.delta > 0 ? "+" : "") + preview.delta + " CAG"}), then click Simulate Replication.`)
          );
        }
        draw();
      },
    },

    {
      id: "read-span-wall",
      name: "2. The Repeat Wall",
      render(root, ctx) {
        const alleles = [
          { id: "a36", label: "Allele A · 36 CAG (108 bp tract)", repeats: 36, cheapestSpan: 150 },
          { id: "a58", label: "Allele B · 58 CAG (174 bp tract)", repeats: 58, cheapestSpan: 250 },
          { id: "a95", label: "Allele C · 95 CAG (285 bp tract)", repeats: 95, cheapestSpan: 10000 },
        ];
        const chemistries = [
          { len: 100,   label: "100 bp Short-Read ($)" },
          { len: 150,   label: "150 bp Illumina ($$)" },
          { len: 250,   label: "250 bp Paired-End ($$$)" },
          { len: 10000, label: "10 kb PacBio HiFi ($$$$)" },
        ];
        let alleleIdx = 0;
        const picks = { a36: 0, a58: 0, a95: 0 };
        let submitted = false;

        function draw() {
          const cur = alleles[alleleIdx];
          const chosenLen = picks[cur.id] || 100;
          const ev = Core.evaluateRepeatSpan(cur.repeats, 3, chosenLen, 15);
          const allPicked = alleles.every((a) => picks[a.id] > 0);
          const exactCount = alleles.filter((a) => picks[a.id] === a.cheapestSpan).length;
          const solved = submitted && exactCount === alleles.length;
          if (solved) ctx.solve();

          const tractPx = Math.min(300, Math.round(cur.repeats * 3.1));
          const readPx = Math.min(460, Math.round((chosenLen / 320) * 320));
          const spanSvg = `
            <svg viewBox="0 0 580 140" width="580" height="140" role="img" aria-label="Read span comparison for ${cur.repeats} CAG">
              <rect x="25" y="34" width="95" height="24" rx="4" fill="var(--paper-raised)" stroke="var(--ink)" stroke-width="1.5"/>
              <text x="72" y="50" text-anchor="middle" fill="var(--ink)" font-family="var(--font-ui)" font-size="10.5" font-weight="600">15 bp flank</text>
              <rect x="122" y="34" width="${tractPx}" height="24" rx="4" fill="var(--do-soft)" stroke="var(--do)" stroke-width="1.8"/>
              <text x="${122 + tractPx / 2}" y="50" text-anchor="middle" fill="var(--do)" font-family="var(--font-mono)" font-size="11" font-weight="700">(CAG)${cur.repeats} = ${ev.tractBp} bp</text>
              <rect x="${124 + tractPx}" y="34" width="95" height="24" rx="4" fill="var(--paper-raised)" stroke="var(--ink)" stroke-width="1.5"/>
              <text x="${171 + tractPx}" y="50" text-anchor="middle" fill="var(--ink)" font-family="var(--font-ui)" font-size="10.5" font-weight="600">15 bp flank</text>
              <rect x="80" y="84" width="${readPx}" height="24" rx="5" fill="${ev.spans ? "var(--good-soft)" : "var(--bad-soft)"}" stroke="${ev.spans ? "var(--good)" : "var(--bad)"}" stroke-width="2"/>
              <text x="${80 + readPx / 2}" y="100" text-anchor="middle" fill="${ev.spans ? "var(--good)" : "var(--bad)"}" font-family="var(--font-mono)" font-size="11" font-weight="700">${chosenLen} bp · ${ev.spans ? "SPANS BOTH FLANKS ✓" : "CLIPPED INSIDE REPEAT ✗"}</text>
            </svg>`;

          root.replaceChildren(
            el("div", { class: "wb-header" },
              el("div", null,
                el("h3", null, "Level 2 · Select the Minimum Spanning Sequencing Chemistry"),
                el("p", { class: "wb-goal" }, "To size a tandem repeat directly, a single read must span the entire repeat tract (3 bp × CAG count) PLUS 15 bp of unique anchor on EACH flank (+30 bp). Pick the cheapest chemistry that resolves EACH of the 3 alleles, then run the assay.")
              )
            ),
            el("div", { class: "wb-actions" },
              ...alleles.map((a, i) =>
                el("button", {
                  type: "button",
                  class: `g-btn g-btn-sm${alleleIdx === i ? " g-btn-primary" : ""}`,
                  onClick: () => { alleleIdx = i; draw(); },
                }, `${a.label}${picks[a.id] ? " [" + picks[a.id] + " bp]" : ""}`)
              )
            ),
            el("div", { class: "wb-telemetry" },
              teleTile("Repeat Tract", `${ev.tractBp} bp`),
              teleTile("Min Span Needed", `${ev.requiredBp} bp`),
              teleTile("Selected Read", picks[cur.id] ? `${picks[cur.id]} bp` : "None"),
              teleTile("Sizing Status", picks[cur.id] ? (ev.spans ? "Resolved ✓" : "Clipped ✗") : "—", picks[cur.id] ? (ev.spans ? "good" : "bad") : "")
            ),
            el("div", { class: "svg-stage", html: spanSvg }),
            el("div", { class: "choice-grid" },
              ...alleles.map((a) =>
                el("div", { class: "control-stack" },
                  el("span", { class: "tele-label" }, a.label),
                  el("div", { style: "display:flex;flex-direction:column;gap:.35rem" },
                    ...chemistries.map((ch) =>
                      el("button", {
                        type: "button",
                        class: `g-btn g-btn-sm${picks[a.id] === ch.len ? " g-btn-primary" : ""}`,
                        onClick: () => { picks[a.id] = ch.len; alleleIdx = alleles.indexOf(a); submitted = false; draw(); },
                      }, ch.label)
                    )
                  )
                )
              )
            ),
            el("div", { class: "wb-actions" },
              el("button", {
                type: "button",
                class: "g-btn g-btn-primary",
                disabled: !allPicked,
                onClick: () => { submitted = true; draw(); },
              }, "Run Sequencing Assay")
            ),
            submitted
              ? solved
                ? feedbackBox("good", "Optimal assay selection verified!", "36 CAG (138 bp needed) → 150 bp Illumina; 58 CAG (204 bp needed) → 250 bp reads; 95 CAG (315 bp needed) breaks every short-read assay and requires long-read HiFi (or RP-PCR).")
                : feedbackBox("bad", `${exactCount} / 3 optimal:`, "Compute required span = (3 × repeats) + 30 bp for each allele, then choose the cheapest chemistry ≥ that length (don't under-span or needlessly overspend!).")
              : feedbackBox("", "Formula:", "Required read length = (CAG repeats × 3 bp) + 30 bp flanks. Select a chemistry for all 3 alleles and click Run Sequencing Assay.")
          );
        }
        draw();
      },
    },

    {
      id: "gray-zone",
      name: "3. Contested Gray Zone",
      render(root, ctx) {
        const patients = [
          { id: "P1", geno: [10, 14], label: "Patient 1 · 10 / 14 CAG" },
          { id: "P2", geno: [10, 39], label: "Patient 2 · 10 / 39 CAG" },
          { id: "P3", geno: [12, 48], label: "Patient 3 · 12 / 48 CAG" },
          { id: "P4", geno: [11, 58], label: "Patient 4 · 11 / 58 CAG" },
        ];
        const choices = { P1: "", P2: "", P3: "", P4: "" };
        const tiers = [
          ["normal", "Agreed Normal (≤31)"],
          ["gray-zone", "Disputed Gray Zone (32–50)"],
          ["diagnostic", "Diagnostic Expansion* (≥51)"],
        ];
        let submitted = false;

        function draw() {
          const allChosen = patients.every((p) => choices[p.id]);
          const rightCount = patients.filter((p) => choices[p.id] === Core.classifySca12Genotype(p.geno[0], p.geno[1])).length;
          const solved = submitted && rightCount === patients.length;
          if (solved) ctx.solve();

          root.replaceChildren(
            el("div", { class: "wb-header" },
              el("div", null,
                el("h3", null, "Level 3 · Clinical Discipline in the 32–50 CAG Gray Zone"),
                el("p", { class: "wb-goal" }, "SCA12 is autosomal dominant, so interpretation follows the LONGER allele — yet boundaries between 32 and 50 CAG remain contested across cohorts. Classify all 4 patients and submit without over-calling uncertain alleles.")
              )
            ),
            el("div", { class: "choice-grid" },
              ...patients.map((p) =>
                el("div", { class: "control-stack" },
                  el("span", { class: "tele-label" }, p.label),
                  el("div", { style: "display:flex;flex-direction:column;gap:.4rem" },
                    ...tiers.map(([val, lbl]) =>
                      el("button", {
                        type: "button",
                        class: `g-btn g-btn-sm${choices[p.id] === val ? " g-btn-primary" : ""}`,
                        onClick: () => { choices[p.id] = val; submitted = false; draw(); },
                      }, lbl)
                    )
                  )
                )
              )
            ),
            el("div", { class: "wb-actions" },
              el("button", {
                type: "button",
                class: "g-btn g-btn-primary",
                disabled: !allChosen,
                onClick: () => { submitted = true; draw(); },
              }, "Submit Clinical Classifications")
            ),
            submitted
              ? solved
                ? feedbackBox("good", "Epistemic discipline verified!", "10/14 is unambiguously normal; 10/39 and 12/48 sit inside the contested 32–50 gray zone where calling them definitively pathogenic overstates the literature; 11/58 meets the diagnostic expansion threshold.")
                : feedbackBox("bad", `${rightCount} / 4 correct:`, "Check the LONGER allele of each pair against the 3 regimes: ≤31 agreed normal, 32–50 disputed gray zone, ≥51 diagnostic expansion*.")
              : feedbackBox("", "Reminder:", "Always evaluate the LONGER allele, assign all 4 patients, and click Submit.")
          );
        }
        draw();
      },
    },

    {
      id: "evidence-audit",
      name: "4. Mechanism Audit",
      render(root, ctx) {
        const claims = [
          {
            id: "C1",
            text: "The SCA12 CAG repeat lies in a 5′-UTR / regulatory region of PPP2R2B rather than a standard long polyglutamine coding tract.",
            truth: "established",
          },
          {
            id: "C2",
            text: "Whether neurodegeneration is driven primarily by PPP2R2B isoform misregulation, RNA gain-of-function, or RAN translation is completely settled.",
            truth: "open",
          },
          {
            id: "C3",
            text: "Routine short-read exome sequencing (WES) can miss large non-coding 5′-UTR CAG expansions unless specialized repeat callers or long-read/RP-PCR assays are used.",
            truth: "established",
          },
          {
            id: "C4",
            text: "Every patient with late-onset action tremor and a 38-CAG PPP2R2B allele has a definitive, uncontested SCA12 diagnosis.",
            truth: "open",
          },
        ];
        const answers = { C1: "", C2: "", C3: "", C4: "" };
        let submitted = false;

        function draw() {
          const allDone = claims.every((c) => answers[c.id]);
          const rightCount = claims.filter((c) => answers[c.id] === c.truth).length;
          const solved = submitted && rightCount === claims.length;
          if (solved) ctx.solve();

          root.replaceChildren(
            el("div", { class: "wb-header" },
              el("div", null,
                el("h3", null, "Level 4 · Separate Established Facts from Open Hypotheses"),
                el("p", { class: "wb-goal" }, "Real genomics research requires knowing where solid evidence ends and open questions begin. Audit all 4 SCA12 claims and submit your evaluation.")
              )
            ),
            el("div", { style: "display:flex;flex-direction:column;gap:.75rem" },
              ...claims.map((c) =>
                el("div", { class: "control-stack" },
                  el("div", { style: "font-family:var(--font-ui);font-size:.88rem;color:var(--ink)" }, c.text),
                  el("div", { class: "wb-actions" },
                    el("button", { type: "button", class: `g-btn g-btn-sm${answers[c.id] === "established" ? " g-btn-primary" : ""}`, onClick: () => { answers[c.id] = "established"; submitted = false; draw(); } }, "Established Fact"),
                    el("button", { type: "button", class: `g-btn g-btn-sm${answers[c.id] === "open" ? " g-btn-primary" : ""}`, onClick: () => { answers[c.id] = "open"; submitted = false; draw(); } }, "Open / Contested / Overstated")
                  )
                )
              )
            ),
            el("div", { class: "wb-actions" },
              el("button", {
                type: "button",
                class: "g-btn g-btn-primary",
                disabled: !allDone,
                onClick: () => { submitted = true; draw(); },
              }, "Submit Evidence Audit")
            ),
            submitted
              ? solved
                ? feedbackBox("good", "Capstone complete!", "You cleanly separated solid locus/assay facts (5′-UTR location in PPP2R2B, WES repeat blindspot) from active research questions (relative weights of regulatory vs RNA/RAN mechanisms, and contested 32–50 CAG pathogenicity).")
                : feedbackBox("bad", `${rightCount} / 4 correct:`, "Notice which claims assert false certainty about unresolved mechanisms or gray-zone (38 CAG) pathogenicity.")
              : feedbackBox("", "Research standard:", "Evaluate all 4 claims and click Submit Evidence Audit.")
          );
        }
        draw();
      },
    },
  ];
})();
