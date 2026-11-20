/**
 * Genomics Lab Games — Shared Arcade Shell + Games 01–03
 * (Strand & Fork, Ribosome Debugger, Mendel's Pedigree Lab).
 *
 * Uses window.GenomicsGamesCore for all biological logic and registers
 * game renderers on window.GenomicsGamesRegistry.
 */
(function () {
  "use strict";

  const Core = window.GenomicsGamesCore;
  if (!Core) return;

  const STORE_KEY = "learn-genomics.games.v1";

  /* ── Progress Store ───────────────────────────────────────────────────── */

  const Progress = {
    load() {
      try {
        const raw = JSON.parse(localStorage.getItem(STORE_KEY));
        return raw && typeof raw === "object" ? raw : { solved: {} };
      } catch {
        return { solved: {} };
      }
    },
    save(data) {
      try {
        localStorage.setItem(STORE_KEY, JSON.stringify(data));
      } catch {
        /* ignore private-browsing storage errors */
      }
    },
    isSolved(gameId, levelId) {
      const d = this.load();
      return Boolean(d.solved && d.solved[`${gameId}:${levelId}`]);
    },
    markSolved(gameId, levelId) {
      const d = this.load();
      d.solved = d.solved || {};
      d.solved[`${gameId}:${levelId}`] = Date.now();
      this.save(d);
    },
    solvedCount(gameId) {
      const d = this.load();
      const prefix = `${gameId}:`;
      return Object.keys(d.solved || {}).filter((k) => k.startsWith(prefix)).length;
    },
    totalSolved() {
      const d = this.load();
      return Object.keys(d.solved || {}).length;
    },
    resetAll() {
      this.save({ solved: {} });
    },
  };

  /* ── Shared DOM Helpers ───────────────────────────────────────────────── */

  function el(tag, attrs, ...children) {
    const node = document.createElement(tag);
    if (attrs) {
      for (const [k, v] of Object.entries(attrs)) {
        if (v === undefined || v === null || v === false) continue;
        if (k === "class") node.className = v;
        else if (k === "html") node.innerHTML = v;
        else if (k.startsWith("on") && typeof v === "function") {
          node.addEventListener(k.slice(2).toLowerCase(), v);
        } else if (v === true) node.setAttribute(k, "");
        else node.setAttribute(k, String(v));
      }
    }
    for (const ch of children.flat()) {
      if (ch === null || ch === undefined || ch === false) continue;
      node.appendChild(typeof ch === "string" || typeof ch === "number" ? document.createTextNode(String(ch)) : ch);
    }
    return node;
  }

  function teleTile(label, value, tone = "") {
    return el("div", { class: "tele-tile" },
      el("span", { class: "tele-label" }, label),
      el("span", { class: `tele-val${tone ? " is-" + tone : ""}` }, value)
    );
  }

  function feedbackBox(tone, title, text) {
    return el("div", { class: `wb-feedback${tone ? " is-" + tone : ""}`, role: "status", "aria-live": "polite" },
      title ? el("strong", null, title + " ") : null,
      text
    );
  }

  function hintToggleBtn(open, onToggle) {
    return el("button", { type: "button", class: "g-btn g-btn-sm", onClick: onToggle }, open ? "Hide Hint" : "Show Hint");
  }

  function hintPanel(open, text) {
    return open ? el("div", { class: "hint-box" }, el("strong", null, "Hint: "), text) : null;
  }

  function codonTableDrawer(open) {
    if (!open) return null;
    const order = [
      "Met", "STOP", "Ala", "Arg", "Asn", "Asp", "Cys", "Gln", "Glu", "Gly",
      "His", "Ile", "Leu", "Lys", "Phe", "Pro", "Ser", "Thr", "Trp", "Tyr", "Val",
    ];
    return el("div", { class: "codon-drawer", "aria-label": "RNA genetic code reference table" },
      ...order.map((aa) =>
        el("div", { class: `codon-ref-item aa-${Core.AA_CLASS[aa] || "polar"}` },
          el("strong", null, aa),
          el("code", null, (Core.CODON_BY_AA[aa] || []).join(" "))
        )
      )
    );
  }

  function chapterFooter(gameMeta) {
    return el("div", { class: "wb-chapters-foot" },
      el("span", null, "Reinforces:"),
      ...gameMeta.chapters.map((c) => el("a", { class: "chapter-pill", href: c.href }, c.label))
    );
  }

  /* ── Registry so games-ui-advanced.js can plug in cleanly ─────────────── */

  const Registry = (window.GenomicsGamesRegistry = window.GenomicsGamesRegistry || {});
  window.GenomicsGamesHelpers = { el, teleTile, feedbackBox, hintToggleBtn, hintPanel, Progress };

  /* =========================================================================
     GAME 01: STRAND & FORK
     ========================================================================= */

  Registry["strand-fork"] = [
    {
      id: "wc-zip",
      name: "1. Watson–Crick Zip",
      render(root, ctx) {
        let drillSeed = 101;
        let template = "TACGGACT";
        let partner = Array(template.length).fill("");
        let cursor = 0;

        function newDrill() {
          drillSeed += 37;
          template = Core.generateDnaStrand(8, drillSeed);
          partner = Array(template.length).fill("");
          cursor = 0;
          draw();
        }

        function placeBase(b) {
          partner[cursor] = b;
          const nextEmpty = partner.findIndex((x, idx) => idx > cursor && !x);
          if (nextEmpty !== -1) cursor = nextEmpty;
          else if (cursor < template.length - 1) cursor++;
          draw();
        }

        function onKey(e) {
          const k = e.key.toUpperCase();
          if ("ACGT".includes(k) && k.length === 1) {
            placeBase(k);
          } else if (e.key === "Backspace") {
            if (partner[cursor]) partner[cursor] = "";
            else if (cursor > 0) { cursor--; partner[cursor] = ""; }
            draw();
          } else if (e.key === "ArrowRight" && cursor < template.length - 1) {
            cursor++; draw();
          } else if (e.key === "ArrowLeft" && cursor > 0) {
            cursor--; draw();
          }
        }
        ctx.onKey(onKey);

        function draw() {
          const ev = Core.evaluateDuplex(template, partner.join(""));
          if (ev.complete) ctx.solve();

          const badPair = ev.pairs.find((p) => p.status === "mismatch");
          let fbTone = "", fbTitle = "Tip:", fbMsg = "Click a base button below (or type A, C, G, T on your keyboard). Notice the template runs 3′→5′, so your new strand grows 5′→3′.";
          if (ev.complete) {
            fbTone = "good";
            fbTitle = "Duplex locked!";
            fbMsg = `All 8 base pairs satisfy Watson–Crick geometry (${ev.hBonds} H-bonds, Wallace Tm ≈ ${ev.wallaceTm}°C).`;
          } else if (badPair) {
            fbTone = "bad";
            fbTitle = `Steric clash at position ${badPair.index + 1}:`;
            fbMsg = badPair.note + ". Pair A=T (2 H-bonds) and G≡C (3 H-bonds).";
          }

          root.replaceChildren(
            el("div", { class: "wb-header" },
              el("div", null,
                el("h3", null, "Level 1 · Synthesize the Antiparallel Partner Strand"),
                el("p", { class: "wb-goal" }, "DNA polymerase reads the template 3′→5′ and builds the partner strand 5′→3′. Fill every slot with its Watson–Crick complement.")
              ),
              el("div", { class: "wb-actions" },
                el("button", { class: "g-btn g-btn-sm", type: "button", onClick: newDrill }, "New Random Strand"),
                el("button", { class: "g-btn g-btn-sm", type: "button", onClick: () => { partner = Array(template.length).fill(""); cursor = 0; draw(); } }, "Reset")
              )
            ),
            el("div", { class: "wb-telemetry" },
              teleTile("Paired", `${ev.matches} / ${template.length}`, ev.complete ? "good" : ""),
              teleTile("H-Bonds", String(ev.hBonds)),
              teleTile("GC Content", `${ev.gcPercent}%`),
              teleTile("Wallace Tm", ev.complete ? `${ev.wallaceTm} °C` : "—")
            ),
            el("div", { class: "strand-board" },
              el("div", { class: "strand-row" },
                el("span", { class: "strand-end" }, "3′"),
                ...template.split("").map((b) => el("span", { class: `base-tile is-colored base-${b}` }, b)),
                el("span", { class: "strand-end" }, "5′")
              ),
              el("div", { class: "bond-row" },
                el("span", { class: "strand-end" }, ""),
                ...ev.pairs.map((p) =>
                  el("span", {
                    class: `bond-cell${p.status === "match" ? " is-good" : p.status === "mismatch" ? " is-bad" : ""}`,
                    title: p.note,
                  }, p.status === "match" ? (p.bonds === 3 ? "⋮" : ":") : p.status === "mismatch" ? "✗" : "·")
                ),
                el("span", { class: "strand-end" }, "")
              ),
              el("div", { class: "strand-row" },
                el("span", { class: "strand-end" }, "5′"),
                ...ev.pairs.map((p, i) =>
                  el("button", {
                    type: "button",
                    class: `base-tile is-clickable${p.partner ? " base-" + p.partner : " is-empty"}${p.status === "match" ? " is-match" : p.status === "mismatch" ? " is-mismatch" : ""}${cursor === i ? " is-selected" : ""}`,
                    onClick: () => { cursor = i; draw(); },
                    "aria-label": `Position ${i + 1}: ${p.partner || "empty"}`,
                  }, p.partner || "?")
                ),
                el("span", { class: "strand-end" }, "3′")
              )
            ),
            el("div", { class: "base-palette" },
              el("span", { class: "game-meta" }, `Insert at pos ${cursor + 1}:`),
              ...["A", "T", "C", "G"].map((b) =>
                el("button", { type: "button", class: `palette-btn base-${b}`, onClick: () => placeBase(b) }, b)
              )
            ),
            feedbackBox(fbTone, fbTitle, fbMsg)
          );
        }
        draw();
      },
    },

    {
      id: "revcomp",
      name: "2. Reverse Complement",
      render(root, ctx) {
        let drillSeed = 202;
        let top5to3 = "ATGCGATC";
        let input = Array(top5to3.length).fill("");
        let cursor = 0;

        function newDrill() {
          drillSeed += 41;
          top5to3 = Core.generateDnaStrand(8, drillSeed);
          input = Array(top5to3.length).fill("");
          cursor = 0;
          draw();
        }

        function placeBase(b) {
          input[cursor] = b;
          const nextEmpty = input.findIndex((x, idx) => idx > cursor && !x);
          if (nextEmpty !== -1) cursor = nextEmpty;
          else if (cursor < top5to3.length - 1) cursor++;
          draw();
        }

        ctx.onKey((e) => {
          const k = e.key.toUpperCase();
          if ("ACGT".includes(k) && k.length === 1) placeBase(k);
          else if (e.key === "Backspace") {
            if (input[cursor]) input[cursor] = "";
            else if (cursor > 0) { cursor--; input[cursor] = ""; }
            draw();
          }
        });

        function draw() {
          const expected = Core.reverseComplement(top5to3);
          const justComp = Core.complementDna(top5to3);
          const candidate = input.join("");
          const filled = input.every(Boolean);
          // Align candidate antiparallel against top5to3 by reversing candidate!
          const alignedBottom3to5 = input.slice().reverse().join("");
          const ev = Core.evaluateDuplex(top5to3, alignedBottom3to5);
          const solved = filled && candidate === expected;
          if (solved) ctx.solve();

          let fbTone = "", fbTitle = "Bioinformatics rule:", fbMsg = "Sequences in FASTA/VCF/primers are ALWAYS written 5′→3′. To write the opposite strand in 5′→3′ order, complement every base AND reverse the order.";
          if (solved) {
            fbTone = "good";
            fbTitle = "Exact reverse complement!";
            fbMsg = `5′-${top5to3}-3′ pairs antiparallel with 5′-${expected}-3′ (${ev.hBonds} H-bonds).`;
          } else if (filled && candidate === justComp) {
            fbTone = "warn";
            fbTitle = "Classic #1 bioinformatics bug!";
            fbMsg = `You wrote ${justComp} — the complement WITHOUT reversing. Look at the antiparallel duplex preview below: reading 5′→3′ from the right means your first base pairs with the LAST base of the top strand!`;
          } else if (filled) {
            fbTone = "bad";
            fbTitle = `${ev.mismatches} antiparallel mismatch(es):`;
            fbMsg = "Remember: base 1 of your 5′→3′ reverse complement pairs with the rightmost 3′ base of the top strand.";
          }

          root.replaceChildren(
            el("div", { class: "wb-header" },
              el("div", null,
                el("h3", null, "Level 2 · Write the 5′→3′ Reverse Complement"),
                el("p", { class: "wb-goal" }, "Given a 5′→3′ coding strand, type its partner strand ALSO in standard 5′→3′ order. Watch the live antiparallel duplex preview update as you type.")
              ),
              el("div", { class: "wb-actions" },
                el("button", { class: "g-btn g-btn-sm", type: "button", onClick: newDrill }, "New Random Strand"),
                el("button", { class: "g-btn g-btn-sm", type: "button", onClick: () => { input = Array(top5to3.length).fill(""); cursor = 0; draw(); } }, "Reset")
              )
            ),
            el("div", { class: "strand-board" },
              el("div", { class: "game-meta", style: "margin-bottom:.45rem" }, "Given top strand (5′→3′):"),
              el("div", { class: "strand-row" },
                el("span", { class: "strand-end" }, "5′"),
                ...top5to3.split("").map((b) => el("span", { class: `base-tile is-colored base-${b}` }, b)),
                el("span", { class: "strand-end" }, "3′")
              ),
              el("div", { class: "game-meta", style: "margin:.85rem 0 .45rem" }, "Your partner strand written in 5′→3′ order:"),
              el("div", { class: "strand-row" },
                el("span", { class: "strand-end" }, "5′"),
                ...input.map((b, i) =>
                  el("button", {
                    type: "button",
                    class: `base-tile is-clickable${b ? " is-colored base-" + b : " is-empty"}${cursor === i ? " is-selected" : ""}`,
                    onClick: () => { cursor = i; draw(); },
                  }, b || "?")
                ),
                el("span", { class: "strand-end" }, "3′")
              ),
              el("div", { class: "game-meta", style: "margin:.95rem 0 .35rem" }, "Physical antiparallel alignment (your strand flipped 3′←5′ underneath):"),
              el("div", { class: "bond-row" },
                el("span", { class: "strand-end" }, "3′"),
                ...ev.pairs.map((p) =>
                  el("span", {
                    class: `bond-cell${p.status === "match" ? " is-good" : p.status === "mismatch" ? " is-bad" : ""}`,
                    title: p.note,
                  }, p.partner ? `${p.partner}${p.status === "match" ? "✓" : "✗"}` : "·")
                ),
                el("span", { class: "strand-end" }, "5′")
              )
            ),
            el("div", { class: "base-palette" },
              el("span", { class: "game-meta" }, `5′→3′ slot ${cursor + 1}:`),
              ...["A", "T", "C", "G"].map((b) =>
                el("button", { type: "button", class: `palette-btn base-${b}`, onClick: () => placeBase(b) }, b)
              )
            ),
            feedbackBox(fbTone, fbTitle, fbMsg)
          );
        }
        draw();
      },
    },

    {
      id: "proofread",
      name: "3. Proofreader's Eye",
      render(root, ctx) {
        let drillSeed = 303;
        let template = "GCTATCCGAT";
        // True complement: CGATAGGCTA; 3 planted mismatches at indices 3 (A-A bulge), 5 (C-C pinch), 7 (G-T wobble)
        let initialDaughter = "CGAAACGTTA".split("");
        let daughter = initialDaughter.slice();
        let selected = 3;

        function newDrill() {
          drillSeed += 53;
          const gen = Core.generateMismatchDuplex(10, 3, drillSeed);
          template = gen.template;
          initialDaughter = gen.daughter.split("");
          daughter = initialDaughter.slice();
          selected = gen.errorIndices[0] ?? 0;
          draw();
        }

        function draw() {
          const ev = Core.evaluateDuplex(template, daughter.join(""));
          if (ev.complete) ctx.solve();
          const cur = ev.pairs[selected];

          let fbTone = cur.status === "mismatch" ? "bad" : "", fbTitle = `Position ${selected + 1}:`, fbMsg = cur.note;
          if (ev.complete) {
            fbTone = "good";
            fbTitle = "3′→5′ exonuclease proofreading complete!";
            fbMsg = "All steric bulges, pinches, and wobble mismatches excised — fidelity restored.";
          }

          root.replaceChildren(
            el("div", { class: "wb-header" },
              el("div", null,
                el("h3", null, "Level 3 · Excise DNA Polymerase Mismatches"),
                el("p", { class: "wb-goal" }, "DNA polymerase made 3 incorporation errors on the newly synthesized daughter strand. Click each mismatched base to inspect its steric distortion and replace it.")
              ),
              el("div", { class: "wb-actions" },
                el("button", { class: "g-btn g-btn-sm", type: "button", onClick: newDrill }, "New Random Duplex"),
                el("button", { class: "g-btn g-btn-sm", type: "button", onClick: () => { daughter = initialDaughter.slice(); selected = 3; draw(); } }, "Reset")
              )
            ),
            el("div", { class: "wb-telemetry" },
              teleTile("Mismatches Left", String(ev.mismatches), ev.mismatches === 0 ? "good" : "bad"),
              teleTile("H-Bonds", String(ev.hBonds)),
              teleTile("Helix Distortion", ev.mismatches === 0 ? "Uniform 2 nm" : "Distorted", ev.mismatches === 0 ? "good" : "warn")
            ),
            el("div", { class: "strand-board" },
              el("div", { class: "strand-row" },
                el("span", { class: "strand-end" }, "3′"),
                ...template.split("").map((b) => el("span", { class: `base-tile is-colored base-${b}` }, b)),
                el("span", { class: "strand-end" }, "5′")
              ),
              el("div", { class: "bond-row" },
                el("span", { class: "strand-end" }, ""),
                ...ev.pairs.map((p) =>
                  el("span", { class: `bond-cell${p.status === "match" ? " is-good" : " is-bad"}` }, p.status === "match" ? (p.bonds === 3 ? "⋮" : ":") : "✗")
                ),
                el("span", { class: "strand-end" }, "")
              ),
              el("div", { class: "strand-row" },
                el("span", { class: "strand-end" }, "5′"),
                ...ev.pairs.map((p, i) =>
                  el("button", {
                    type: "button",
                    class: `base-tile is-clickable ${p.status === "match" ? "is-match" : "is-mismatch"}${selected === i ? " is-selected" : ""}`,
                    onClick: () => { selected = i; draw(); },
                  }, p.partner)
                ),
                el("span", { class: "strand-end" }, "3′")
              )
            ),
            el("div", { class: "base-palette" },
              el("span", { class: "game-meta" }, `Replace daughter base #${selected + 1} (template is ${template[selected]}):`),
              ...["A", "T", "C", "G"].map((b) =>
                el("button", { type: "button", class: `palette-btn base-${b}`, onClick: () => { daughter[selected] = b; draw(); } }, b)
              )
            ),
            feedbackBox(fbTone, fbTitle, fbMsg)
          );
        }
        draw();
      },
    },

    {
      id: "pcr-primers",
      name: "4. PCR Primer Pair",
      render(root, ctx) {
        const exon = "ATGCCGTAGGCTACGTTAGCAATGCCGGTA"; // 30 bp
        const fwdChoices = [
          { seq: "ATGCCG", note: "Matches left 5′ end of top strand" },
          { seq: "CGGCAT", note: "Reverse complement of left 5′ end" },
          { seq: "TACGGC", note: "Complement of left 5′ end (not reversed)" },
        ];
        const revChoices = [
          { seq: "CCGGTA", note: "Matches right 3′ end of top strand" },
          { seq: "GGCCAT", note: "Complement of right 3′ end (not reversed)" },
          { seq: "TACCGG", note: "Reverse complement of right 3′ end" },
        ];
        let fwd = "";
        let rev = "";
        let ran = false;

        function draw() {
          const sim = ran && fwd && rev ? Core.simulatePcr(exon, fwd, rev) : null;
          if (sim && sim.amplifies) ctx.solve();

          root.replaceChildren(
            el("div", { class: "wb-header" },
              el("div", null,
                el("h3", null, "Level 4 · Orient Converging PCR Primers"),
                el("p", { class: "wb-goal" }, "Amplify the full 30 bp target exon below. Remember: primers are ordered 5′→3′, and BOTH primers' 3′-OH ends must point inward toward each other.")
              )
            ),
            el("div", { class: "strand-board" },
              el("div", { class: "game-meta", style: "margin-bottom:.35rem" }, "Target double-stranded exon (30 bp):"),
              el("div", { style: "font-family:var(--font-mono);font-size:.9rem;letter-spacing:.08em;line-height:1.8;white-space:nowrap" },
                el("div", null, `5′- ${exon.slice(0, 6)} · ${exon.slice(6, 24)} · ${exon.slice(24)} -3′`),
                el("div", { style: "color:var(--ink-faint)" }, `3′- ${Core.complementDna(exon.slice(0, 6))} · ${Core.complementDna(exon.slice(6, 24))} · ${Core.complementDna(exon.slice(24))} -5′`)
              )
            ),
            el("div", null,
              el("div", { class: "tele-label", style: "margin-bottom:.45rem" }, "1. Choose Forward Primer (5′→3′)"),
              el("div", { class: "choice-grid" },
                ...fwdChoices.map((c) =>
                  el("button", {
                    type: "button",
                    class: `choice-card${fwd === c.seq ? " is-selected" : ""}`,
                    onClick: () => { fwd = c.seq; ran = false; draw(); },
                  }, el("code", null, `5′-${c.seq}-3′`), el("small", null, c.note))
                )
              )
            ),
            el("div", null,
              el("div", { class: "tele-label", style: "margin-bottom:.45rem" }, "2. Choose Reverse Primer (5′→3′)"),
              el("div", { class: "choice-grid" },
                ...revChoices.map((c) =>
                  el("button", {
                    type: "button",
                    class: `choice-card${rev === c.seq ? " is-selected" : ""}`,
                    onClick: () => { rev = c.seq; ran = false; draw(); },
                  }, el("code", null, `5′-${c.seq}-3′`), el("small", null, c.note))
                )
              )
            ),
            el("div", { class: "wb-actions" },
              el("button", {
                type: "button",
                class: "g-btn g-btn-primary",
                disabled: !(fwd && rev),
                onClick: () => { ran = true; draw(); },
              }, "Run 30 PCR Cycles")
            ),
            sim
              ? feedbackBox(sim.amplifies ? "good" : "bad", sim.amplifies ? `Amplicon: ${sim.ampliconBp} bp!` : "PCR failed:", sim.reason)
              : feedbackBox("", "Ready:", "Select both primers and run the thermal cycler to test whether polymerase converges across the exon.")
          );
        }
        draw();
      },
    },

    {
      id: "replication-fork",
      name: "5. Replication Fork",
      render(root, ctx) {
        const cfg = { topDir: "right", topMode: "leading", bottomDir: "right", bottomMode: "leading", laggingOrder: "near-first" };
        let checked = false;

        function draw() {
          const ev = checked ? Core.evaluateReplicationFork(cfg) : null;
          if (ev && ev.ok) ctx.solve();

          const topArrow = cfg.topDir === "right" ? "M 95 62 L 370 62" : "M 370 62 L 95 62";
          const botArrow = cfg.bottomDir === "right" ? "M 95 162 L 370 162" : "M 370 162 L 95 162";

          const forkSvg = `
            <svg viewBox="0 0 600 220" width="600" height="220" role="img" aria-label="DNA replication fork">
              <defs>
                <marker id="arr-teal" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--accent)"/>
                </marker>
                <marker id="arr-do" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--do)"/>
                </marker>
              </defs>
              <!-- Parental duplex on right -->
              <path d="M 410 102 L 560 102" stroke="var(--ink-soft)" stroke-width="4" stroke-linecap="round"/>
              <path d="M 410 122 L 560 122" stroke="var(--ink-soft)" stroke-width="4" stroke-linecap="round"/>
              <!-- Fork split -->
              <path d="M 410 102 C 375 102, 360 40, 320 40 L 60 40" fill="none" stroke="var(--ink-soft)" stroke-width="4"/>
              <path d="M 410 122 C 375 122, 360 184, 320 184 L 60 184" fill="none" stroke="var(--ink-soft)" stroke-width="4"/>
              <!-- Helicase ring -->
              <polygon points="392,90 426,112 392,134" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2.5"/>
              <text x="435" y="92" fill="var(--accent-ink)" font-family="var(--font-ui)" font-size="12" font-weight="700">Helicase unwinding →</text>
              <!-- Template polarity labels -->
              <text x="30" y="44" fill="var(--ink)" font-family="var(--font-mono)" font-size="13" font-weight="700">3′</text>
              <text x="566" y="106" fill="var(--ink)" font-family="var(--font-mono)" font-size="13" font-weight="700">5′</text>
              <text x="30" y="188" fill="var(--ink)" font-family="var(--font-mono)" font-size="13" font-weight="700">5′</text>
              <text x="566" y="126" fill="var(--ink)" font-family="var(--font-mono)" font-size="13" font-weight="700">3′</text>
              <!-- New Top strand -->
              ${cfg.topMode === "leading"
                ? `<path d="${topArrow}" stroke="var(--accent)" stroke-width="4" fill="none" marker-end="url(#arr-teal)"/>`
                : `<path d="${cfg.topDir === "right" ? "M 95 62 L 170 62 M 195 62 L 270 62 M 295 62 L 365 62" : "M 365 62 L 295 62 M 270 62 L 195 62 M 170 62 L 95 62"}" stroke="var(--do)" stroke-width="4" fill="none" marker-end="url(#arr-do)"/>`
              }
              <text x="100" y="83" fill="var(--ink-soft)" font-family="var(--font-ui)" font-size="11.5">Top daughter (${cfg.topMode}, ${cfg.topDir === "right" ? "5′→3′ right" : "5′→3′ left"})</text>
              <!-- New Bottom strand -->
              ${cfg.bottomMode === "leading"
                ? `<path d="${botArrow}" stroke="var(--accent)" stroke-width="4" fill="none" marker-end="url(#arr-teal)"/>`
                : `<path d="${cfg.bottomDir === "right" ? "M 95 162 L 170 162 M 195 162 L 270 162 M 295 162 L 365 162" : "M 365 162 L 295 162 M 270 162 L 195 162 M 170 162 L 95 162"}" stroke="var(--do)" stroke-width="4" fill="none" marker-end="url(#arr-do)"/>`
              }
              <text x="100" y="148" fill="var(--ink-soft)" font-family="var(--font-ui)" font-size="11.5">Bottom daughter (${cfg.bottomMode}, ${cfg.bottomDir === "right" ? "5′→3′ right" : "5′→3′ left"})</text>
            </svg>`;

          const toggle = (key, aVal, aLbl, bVal, bLbl) =>
            el("div", { class: "wb-actions" },
              el("button", { type: "button", class: `g-btn g-btn-sm${cfg[key] === aVal ? " g-btn-primary" : ""}`, onClick: () => { cfg[key] = aVal; checked = false; draw(); } }, aLbl),
              el("button", { type: "button", class: `g-btn g-btn-sm${cfg[key] === bVal ? " g-btn-primary" : ""}`, onClick: () => { cfg[key] = bVal; checked = false; draw(); } }, bLbl)
            );

          root.replaceChildren(
            el("div", { class: "wb-header" },
              el("div", null,
                el("h3", null, "Level 5 · Wire a Moving Replication Fork"),
                el("p", { class: "wb-goal" }, "Helicase unwinds this fork left-to-right. DNA polymerase can ONLY add nucleotides to a free 3′-OH (5′→3′). Configure both daughter strands and Okazaki fragment order.")
              )
            ),
            el("div", { class: "svg-stage", html: forkSvg }),
            el("div", { class: "choice-grid" },
              el("div", { class: "control-stack" },
                el("span", { class: "tele-label" }, "Top Arm (template 3′→5′)"),
                toggle("topDir", "right", "Grow 5′→3′ Right →", "left", "Grow 5′→3′ Left ←"),
                toggle("topMode", "leading", "Continuous (Leading)", "lagging", "Okazaki (Lagging)")
              ),
              el("div", { class: "control-stack" },
                el("span", { class: "tele-label" }, "Bottom Arm (template 5′→3′)"),
                toggle("bottomDir", "right", "Grow 5′→3′ Right →", "left", "Grow 5′→3′ Left ←"),
                toggle("bottomMode", "leading", "Continuous (Leading)", "lagging", "Okazaki (Lagging)")
              ),
              el("div", { class: "control-stack" },
                el("span", { class: "tele-label" }, "Lagging Fragment Chronology"),
                toggle("laggingOrder", "far-first", "Farthest from fork made 1st", "near-first", "Closest to fork made 1st")
              )
            ),
            el("div", { class: "wb-actions" },
              el("button", { type: "button", class: "g-btn g-btn-primary", onClick: () => { checked = true; draw(); } }, "Start Replisome")
            ),
            ev
              ? feedbackBox(ev.ok ? "good" : "bad", ev.ok ? "Replisome running!" : "Polarity violation:", ev.summary)
              : feedbackBox("", "Constraint:", "Both polymerases travel 5′→3′ while coupled at the same unwinding fork.")
          );
        }
        draw();
      },
    },
  ];

  /* =========================================================================
     GAME 02: RIBOSOME DEBUGGER
     ========================================================================= */

  function renderCodonStrip(tr) {
    if (!tr.codons.length) {
      return el("div", { class: "game-meta", style: "margin-top:.6rem" }, "No start codon (AUG) found — ribosome cannot initiate translation.");
    }
    return el("div", { class: "codon-strip" },
      ...tr.codons.map((c) =>
        el("div", { class: `codon-pill aa-${c.aaClass}` },
          el("span", { class: "c-tri" }, c.triplet),
          el("span", { class: "c-aa" }, c.aa)
        )
      )
    );
  }

  Registry["ribosome-debugger"] = [
    {
      id: "orf-scan",
      name: "1. Lock the Reading Frame",
      render(root, ctx) {
        const mrna = "CCAAUGGCUUGGAAAGAUUAAGGC";
        let frameStart = 0;
        let showCodons = false;

        function draw() {
          const tr = Core.translateMrna(mrna, frameStart);
          const isAug = mrna.slice(frameStart, frameStart + 3) === "AUG";
          const solved = isAug && tr.peptide.join("-") === "Met-Ala-Trp-Lys-Asp" && tr.stopped;
          if (solved) ctx.solve();

          let fbTone = "", fbTitle = "Ribosome scanner:", fbMsg = "Click the 5′ mRNA nucleotide where the ribosome initiates translation (the first AUG start codon).";
          if (solved) {
            fbTone = "good";
            fbTitle = "Open reading frame locked!";
            fbMsg = `Initiating at nucleotide ${frameStart + 1} (AUG) yields the exact 5-aa peptide Met–Ala–Trp–Lys–Asp and terminates cleanly at UAA.`;
          } else if (!isAug) {
            fbTone = "warn";
            fbTitle = `Frame +${frameStart % 3} (starts at ${mrna.slice(frameStart, frameStart + 3)}):`;
            fbMsg = "Ribosomes scan 5′→3′ for AUG (Met) — starting off-frame reads completely different triplets!";
          }

          root.replaceChildren(
            el("div", { class: "wb-header" },
              el("div", null,
                el("h3", null, "Level 1 · Find the True Reading Frame (ORF)"),
                el("p", { class: "wb-goal" }, "Three reading frames exist on any mRNA strand. Click any base to position the ribosome start site and watch how shifting by 1 nucleotide rewrites every codon.")
              ),
              el("button", { type: "button", class: "g-btn g-btn-sm", onClick: () => { showCodons = !showCodons; draw(); } }, showCodons ? "Hide Codon Table" : "Codon Table")
            ),
            codonTableDrawer(showCodons),
            el("div", { class: "wb-telemetry" },
              teleTile("Start Index", `nt ${frameStart + 1}`),
              teleTile("Initiation Codon", mrna.slice(frameStart, frameStart + 3) || "—", isAug ? "good" : "warn"),
              teleTile("Peptide Length", `${tr.peptide.length} aa`),
              teleTile("Stop Codon", tr.stopCodon || "None (readthrough)", tr.stopped ? "good" : "bad")
            ),
            el("div", { class: "strand-board" },
              el("div", { class: "strand-row" },
                el("span", { class: "strand-end" }, "5′"),
                ...mrna.split("").map((b, i) =>
                  el("button", {
                    type: "button",
                    class: `base-tile is-clickable is-colored base-${b}${i === frameStart ? " is-selected" : ""}`,
                    style: i >= frameStart && i < frameStart + 3 ? "background:var(--accent-soft)" : "",
                    onClick: () => { if (i <= mrna.length - 3) { frameStart = i; draw(); } },
                  }, b)
                ),
                el("span", { class: "strand-end" }, "3′")
              ),
              renderCodonStrip(tr)
            ),
            feedbackBox(fbTone, fbTitle, fbMsg)
          );
        }
        draw();
      },
    },

    {
      id: "wobble-vs-nonsense",
      name: "2. Silent vs. Lethal",
      render(root, ctx) {
        const wt = "AUGUACGCUUGGUAA"; // Met-Tyr-Ala-Trp-STOP
        let seq = wt.split("");
        let cursor = 5;
        let hitSyn = false;
        let hitNon = false;
        let showCodons = false;

        function draw() {
          const mut = seq.join("");
          const tr = Core.translateMrna(mut);
          const cls = Core.classifyRnaMutation(wt, mut);
          if (cls.kind === "synonymous") hitSyn = true;
          if (cls.kind === "nonsense") hitNon = true;
          if (hitSyn && hitNon) ctx.solve();

          root.replaceChildren(
            el("div", { class: "wb-header" },
              el("div", null,
                el("h3", null, "Level 2 · Engineer Both a Silent & a Nonsense Mutation"),
                el("p", { class: "wb-goal" }, "Click any base in the wild-type mRNA and substitute it. Complete BOTH goals: (1) trigger a synonymous wobble mutation, and (2) trigger a premature stop (nonsense) mutation.")
              ),
              el("div", { class: "wb-actions" },
                el("button", { type: "button", class: "g-btn g-btn-sm", onClick: () => { showCodons = !showCodons; draw(); } }, showCodons ? "Hide Codon Table" : "Codon Table"),
                el("button", { class: "g-btn g-btn-sm", type: "button", onClick: () => { seq = wt.split(""); draw(); } }, "Reset to Wild-Type")
              )
            ),
            codonTableDrawer(showCodons),
            el("div", { class: "wb-telemetry" },
              teleTile("Mutation Class", cls.kind.toUpperCase(), cls.kind === "synonymous" ? "good" : cls.kind === "nonsense" ? "bad" : ""),
              teleTile("Goal A · Synonymous", hitSyn ? "Done ✓" : "Pending", hitSyn ? "good" : "warn"),
              teleTile("Goal B · Nonsense", hitNon ? "Done ✓" : "Pending", hitNon ? "good" : "warn")
            ),
            el("div", { class: "strand-board" },
              el("div", { class: "strand-row" },
                el("span", { class: "strand-end" }, "5′"),
                ...seq.map((b, i) =>
                  el("button", {
                    type: "button",
                    class: `base-tile is-clickable is-colored base-${b}${cursor === i ? " is-selected" : ""}${b !== wt[i] ? " is-mismatch" : ""}`,
                    style: i > 0 && i % 3 === 0 ? "margin-left:.55rem" : "",
                    onClick: () => { cursor = i; draw(); },
                  }, b)
                ),
                el("span", { class: "strand-end" }, "3′")
              ),
              renderCodonStrip(tr)
            ),
            el("div", { class: "base-palette" },
              el("span", { class: "game-meta" }, `Mutate nt ${cursor + 1} (WT = ${wt[cursor]}):`),
              ...["A", "U", "C", "G"].map((b) =>
                el("button", { type: "button", class: `palette-btn base-${b}`, onClick: () => { seq[cursor] = b; draw(); } }, b)
              )
            ),
            feedbackBox(
              hitSyn && hitNon ? "good" : cls.kind === "unchanged" ? "" : "warn",
              hitSyn && hitNon ? "Both goals verified!" : `${cls.kind}:`,
              hitSyn && hitNon
                ? "Third-position wobble bases often preserve the amino acid (e.g. UAC→UAU = Tyr), while a single base flip can convert Tyr (UAC) or Trp (UGG) into UAA/UAG/UGA STOP."
                : cls.detail
            )
          );
        }
        draw();
      },
    },

    {
      id: "frameshift-repair",
      name: "3. Frameshift Rescue",
      render(root, ctx) {
        let drillSeed = 303;
        let puzzle = {
          wtMrna: "AUGGCUUACGGAAAAUAA",
          mutantMrna: "AUGCUUACGGAAAAUAA",
          targetPeptide: "Met-Ala-Tyr-Gly-Lys",
          deletedBase: "G",
          deleteIndex: 3,
        };
        let seq = puzzle.mutantMrna.split("");
        let cursor = 3;
        let showCodons = false;
        let showHint = false;

        function newDrill() {
          drillSeed += 47;
          puzzle = Core.generateFrameshiftPuzzle(drillSeed);
          seq = puzzle.mutantMrna.split("");
          cursor = puzzle.deleteIndex;
          showHint = false;
          draw();
        }

        function draw() {
          const curStr = seq.join("");
          const tr = Core.translateMrna(curStr);
          const got = tr.peptide.join("-");
          const solved = got === puzzle.targetPeptide && tr.stopped;
          if (solved) ctx.solve();

          const secondAa = puzzle.targetPeptide.split("-")[1];

          root.replaceChildren(
            el("div", { class: "wb-header" },
              el("div", null,
                el("h3", null, "Level 3 · Repair a 1-bp Frameshift Deletion"),
                el("p", { class: "wb-goal" }, `A single nucleotide was deleted right after AUG, scrambling every downstream codon. Use the Codon Table and insert the missing base to restore exact target peptide: ${puzzle.targetPeptide} + STOP.`)
              ),
              el("div", { class: "wb-actions" },
                el("button", { type: "button", class: "g-btn g-btn-sm", onClick: () => { showCodons = !showCodons; draw(); } }, showCodons ? "Hide Codon Table" : "Codon Table"),
                hintToggleBtn(showHint, () => { showHint = !showHint; draw(); }),
                el("button", { class: "g-btn g-btn-sm", type: "button", onClick: newDrill }, "New Random Frameshift"),
                el("button", { class: "g-btn g-btn-sm", type: "button", onClick: () => { seq = puzzle.mutantMrna.split(""); cursor = puzzle.deleteIndex; draw(); } }, "Reset")
              )
            ),
            codonTableDrawer(showCodons),
            hintPanel(showHint, `Look up ${secondAa} in the Codon Table — compare its codons against the two bases immediately after AUG (${puzzle.mutantMrna.slice(3, 5)}) to deduce the single missing first base!`),
            el("div", { class: "wb-telemetry" },
              teleTile("Length", `${seq.length} nt`),
              teleTile("Target", puzzle.targetPeptide),
              teleTile("Current", got || "—", solved ? "good" : "bad")
            ),
            el("div", { class: "strand-board" },
              el("div", { class: "strand-row" },
                el("span", { class: "strand-end" }, "5′"),
                ...seq.map((b, i) =>
                  el("button", {
                    type: "button",
                    class: `base-tile is-clickable is-colored base-${b}${cursor === i ? " is-selected" : ""}`,
                    style: i > 0 && i % 3 === 0 ? "margin-left:.45rem" : "",
                    onClick: () => { cursor = i; draw(); },
                  }, b)
                ),
                el("span", { class: "strand-end" }, "3′")
              ),
              renderCodonStrip(tr)
            ),
            el("div", { class: "base-palette" },
              el("span", { class: "game-meta" }, `Insert BEFORE nt ${cursor + 1}:`),
              ...["A", "U", "C", "G"].map((b) =>
                el("button", {
                  type: "button",
                  class: `palette-btn base-${b}`,
                  onClick: () => { if (seq.length < 24) { seq.splice(cursor, 0, b); draw(); } },
                }, `+${b}`)
              ),
              el("button", {
                type: "button",
                class: "g-btn g-btn-sm",
                onClick: () => { if (seq.length > 6) { seq.splice(cursor, 1); cursor = Math.min(cursor, seq.length - 1); draw(); } },
              }, `Delete nt ${cursor + 1}`)
            ),
            feedbackBox(
              solved ? "good" : "warn",
              solved ? "Reading frame restored!" : "Frameshifted:",
              solved
                ? `Restoring the missing nucleotide snapped codon 2 (${secondAa}) and every downstream triplet cleanly back into frame, recovering the terminal STOP codon.`
                : "A single 1-bp deletion shifts every downstream triplet out of register. Open the Codon Table to deduce which base completes codon 2."
            )
          );
        }
        draw();
      },
    },

    {
      id: "spliceosome",
      name: "4. Spliceosome Surgery",
      render(root, ctx) {
        // Exon 1 (0..6): AUGGCU | Intron (6..20): GUAAGUGCCUUUAG | Exon 2 (20..29): UGGAAAUAA
        const preMrna = "AUGGCUGUAAGUGCCUUUAGUGGAAAUAA";
        const targetPeptide = "Met-Ala-Trp-Lys";
        let donor = 10;    // decoy GU
        let acceptor = 11; // decoy AG
        let picking = "donor";
        let showCodons = false;
        let showHint = false;

        function draw() {
          const sp = Core.splicePreMrna(preMrna, donor, acceptor);
          const tr = Core.translateMrna(sp.matureMrna);
          const solved = sp.validSplice && tr.peptide.join("-") === targetPeptide && tr.stopped;
          if (solved) ctx.solve();

          root.replaceChildren(
            el("div", { class: "wb-header" },
              el("div", null,
                el("h3", null, "Level 4 · Excise the True GU…AG Intron"),
                el("p", { class: "wb-goal" }, `This pre-mRNA contains decoy GU and AG dinucleotides. Place the 5′ Donor (start of intron = GU) and 3′ Acceptor (end of intron = AG) so the spliced exons translate cleanly into ${targetPeptide} + STOP.`)
              ),
              el("div", { class: "wb-actions" },
                el("button", { type: "button", class: "g-btn g-btn-sm", onClick: () => { showCodons = !showCodons; draw(); } }, showCodons ? "Hide Codon Table" : "Codon Table"),
                hintToggleBtn(showHint, () => { showHint = !showHint; draw(); })
              )
            ),
            codonTableDrawer(showCodons),
            hintPanel(showHint, "Exon 1 already ends after Met–Ala (AUG GCU = nt 1–6). Look for the GU immediately after nt 6, and an AG followed immediately by Trp (UGG)!"),
            el("div", { class: "wb-actions" },
              el("button", { type: "button", class: `g-btn g-btn-sm${picking === "donor" ? " g-btn-primary" : ""}`, onClick: () => { picking = "donor"; draw(); } }, `Set 5′ Donor (GU) · now nt ${donor + 1}`),
              el("button", { type: "button", class: `g-btn g-btn-sm${picking === "acceptor" ? " g-btn-primary" : ""}`, onClick: () => { picking = "acceptor"; draw(); } }, `Set 3′ Acceptor End (AG) · now nt ${acceptor}`)
            ),
            el("div", { class: "wb-telemetry" },
              teleTile("Donor Site", sp.donor || "—", sp.donor === "GU" ? "good" : "bad"),
              teleTile("Acceptor Site", sp.acceptor || "—", sp.acceptor === "AG" ? "good" : "bad"),
              teleTile("Intron Removed", sp.validSplice ? `${sp.intron.length} nt` : "Rejected"),
              teleTile("Mature Peptide", tr.peptide.join("-") || "—", solved ? "good" : "warn")
            ),
            el("div", { class: "strand-board" },
              el("div", { class: "game-meta", style: "margin-bottom:.45rem" },
                picking === "donor"
                  ? "Click the G of a 5′ GU donor site:"
                  : "Click the G of a 3′ AG acceptor site (intron ends right after this G):"
              ),
              el("div", { class: "strand-row" },
                el("span", { class: "strand-end" }, "5′"),
                ...preMrna.split("").map((b, i) => {
                  const inIntron = i >= donor && i < acceptor;
                  const isEdge = i === donor || i === donor + 1 || i === acceptor - 2 || i === acceptor - 1;
                  return el("button", {
                    type: "button",
                    class: `base-tile is-clickable is-colored base-${b}${inIntron ? " intron-base" : ""}${isEdge ? " splice-marker" : ""}`,
                    onClick: () => {
                      if (picking === "donor") donor = i;
                      else acceptor = i + 1;
                      draw();
                    },
                  }, b);
                }),
                el("span", { class: "strand-end" }, "3′")
              ),
              el("div", { class: "game-meta", style: "margin-top:.85rem" }, `Mature mRNA (${sp.matureMrna.length} nt): ${sp.matureMrna}`),
              renderCodonStrip(tr)
            ),
            feedbackBox(
              solved ? "good" : sp.validSplice ? "warn" : "bad",
              solved ? "Clean exon junction!" : sp.validSplice ? "Valid GU–AG, wrong junction:" : "Spliceosome rejected:",
              solved
                ? "Excising nt 7–20 (14 nt intron) joins Exon 1 (AUG GCU) directly to Exon 2 (UGG AAA UAA) in-frame!"
                : sp.validSplice
                  ? "That GU–AG pair is chemically spliceable, but joining those coordinates frameshifts or retains intron sequence. Try another GU…AG pair!"
                  : sp.reason
            )
          );
        }
        draw();
      },
    },

    {
      id: "nonsense-rescue",
      name: "5. Prime-Edit Rescue",
      render(root, ctx) {
        // Mutant: AUG GCU UAG AAA GGU UAA (codon 3 is UAG premature stop instead of Tyr UAC/UAU)
        const mutant = "AUGGCUUAGAAAGGUUAA";
        const target = "Met-Ala-Tyr-Lys-Gly";
        let seq = mutant.split("");
        let cursor = 8;
        let showCodons = false;
        let showHint = false;

        function draw() {
          const cur = seq.join("");
          const tr = Core.translateMrna(cur);
          let edits = 0;
          for (let i = 0; i < mutant.length; i++) if (seq[i] !== mutant[i]) edits++;
          const solved = tr.peptide.join("-") === target && tr.stopped && edits === 1;
          if (solved) ctx.solve();

          root.replaceChildren(
            el("div", { class: "wb-header" },
              el("div", null,
                el("h3", null, "Level 5 · Rescue a Patient Nonsense Mutation"),
                el("p", { class: "wb-goal" }, `A patient carries a premature stop codon (UAG at codon 3) truncating a vital enzyme to 2 amino acids. Make exactly ONE single-base edit to restore ${target} + STOP.`)
              ),
              el("div", { class: "wb-actions" },
                el("button", { type: "button", class: "g-btn g-btn-sm", onClick: () => { showCodons = !showCodons; draw(); } }, showCodons ? "Hide Codon Table" : "Codon Table"),
                hintToggleBtn(showHint, () => { showHint = !showHint; draw(); }),
                el("button", { class: "g-btn g-btn-sm", type: "button", onClick: () => { seq = mutant.split(""); cursor = 8; draw(); } }, "Reset")
              )
            ),
            codonTableDrawer(showCodons),
            hintPanel(showHint, "Look up Tyrosine (Tyr) in the Codon Table and compare it to codon 3 (UAG) — only the 3rd nucleotide differs!"),
            el("div", { class: "wb-telemetry" },
              teleTile("Edits Made", String(edits), edits === 1 ? "good" : edits > 1 ? "warn" : ""),
              teleTile("Target", target),
              teleTile("Translated", tr.peptide.join("-") || "—", solved ? "good" : "bad")
            ),
            el("div", { class: "strand-board" },
              el("div", { class: "strand-row" },
                el("span", { class: "strand-end" }, "5′"),
                ...seq.map((b, i) =>
                  el("button", {
                    type: "button",
                    class: `base-tile is-clickable is-colored base-${b}${cursor === i ? " is-selected" : ""}${b !== mutant[i] ? " is-match" : ""}`,
                    style: i > 0 && i % 3 === 0 ? "margin-left:.5rem" : "",
                    onClick: () => { cursor = i; draw(); },
                  }, b)
                ),
                el("span", { class: "strand-end" }, "3′")
              ),
              renderCodonStrip(tr)
            ),
            el("div", { class: "base-palette" },
              el("span", { class: "game-meta" }, `Edit nt ${cursor + 1} (patient has ${mutant[cursor]}):`),
              ...["A", "U", "C", "G"].map((b) =>
                el("button", { type: "button", class: `palette-btn base-${b}`, onClick: () => { seq[cursor] = b; draw(); } }, b)
              )
            ),
            feedbackBox(
              solved ? "good" : edits > 1 ? "warn" : "",
              solved ? "Full-length enzyme rescued!" : "Clinical goal:",
              solved
                ? `Converting UAG → ${seq.slice(6, 9).join("")} (Tyr) with a single nucleotide change eliminates premature termination and restores all 5 residues.`
                : "Use the Codon Table to convert codon 3 (UAG) back into Tyrosine with exactly 1 base edit."
            )
          );
        }
        draw();
      },
    },
  ];

  /* =========================================================================
     GAME 03: MENDEL'S PEDIGREE LAB
     ========================================================================= */

  function renderPedigreeSvg(ped, assignments, selectedId, issueIds, onSelect) {
    const labelMap = {
      AA: "AA", Aa: "Aa", aa: "aa", "A?": "A?",
      XAXA: "XᴬXᴬ", XAXa: "XᴬXᵃ", XaXa: "XᵃXᵃ", XAY: "XᴬY", XaY: "XᵃY", "XAX?": "XᴬX?",
    };
    const byId = Object.fromEntries(ped.nodes.map((n) => [n.id, n]));
    const lines = [];

    // Marriage lines
    for (const [a, b] of ped.marriages) {
      const na = byId[a], nb = byId[b];
      lines.push(`<line x1="${na.x}" y1="${na.y}" x2="${nb.x}" y2="${nb.y}" stroke="var(--ink-soft)" stroke-width="2"/>`);
    }
    // Parent -> child lines
    for (const n of ped.nodes) {
      if (!n.parents) continue;
      const p1 = byId[n.parents[0]], p2 = byId[n.parents[1]];
      const mx = (p1.x + p2.x) / 2;
      const my = p1.y;
      const midY = (my + n.y) / 2;
      lines.push(`<path d="M ${mx} ${my} L ${mx} ${midY} L ${n.x} ${midY} L ${n.x} ${n.y - 24}" fill="none" stroke="var(--ink-soft)" stroke-width="2"/>`);
    }

    const shapes = ped.nodes.map((n) => {
      const g = assignments[n.id];
      const fill = n.affected ? "var(--ink)" : "var(--paper-raised)";
      const isBad = issueIds.has(n.id);
      const stroke = isBad ? "var(--bad)" : selectedId === n.id ? "var(--accent)" : "var(--ink)";
      const sw = isBad || selectedId === n.id ? 3.5 : 2;
      const shape = n.sex === "M"
        ? `<rect class="ped-shape" x="${n.x - 20}" y="${n.y - 20}" width="40" height="40" rx="4" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`
        : `<circle class="ped-shape" cx="${n.x}" cy="${n.y}" r="21" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
      const txtColor = n.affected ? "var(--paper-raised)" : "var(--ink)";
      return `
        <g class="ped-node" data-node="${n.id}" tabindex="0" role="button" aria-label="${n.id}, ${n.affected ? "affected" : "unaffected"} ${n.sex === "M" ? "male" : "female"}, assigned ${g || "unassigned"}">
          ${shape}
          <text x="${n.x}" y="${n.y + 4}" text-anchor="middle" fill="${txtColor}" font-family="var(--font-mono)" font-size="11.5" font-weight="700">${g ? labelMap[g] : "?"}</text>
          <text x="${n.x}" y="${n.y + 36}" text-anchor="middle" fill="var(--ink-faint)" font-family="var(--font-ui)" font-size="11" font-weight="600">${n.id}</text>
        </g>`;
    });

    const wrap = el("div", {
      class: "svg-stage",
      html: `<svg viewBox="0 0 560 285" width="560" height="285">${lines.join("")}${shapes.join("")}</svg>`,
    });
    wrap.querySelectorAll("[data-node]").forEach((g) => {
      g.addEventListener("click", () => onSelect(g.getAttribute("data-node")));
      g.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(g.getAttribute("data-node")); }
      });
    });
    return wrap;
  }

  Registry["pedigree-lab"] = [
    {
      id: "test-cross",
      name: "1. The Hidden Heterozygote",
      render(root, ctx) {
        let hiddenParent = "Aa";
        let tester = "aa";
        let seed = 101;
        let lastRun = null;
        let guessGeno = "";
        let guessTester = "";
        let submitted = false;
        let plantNum = 1;

        function newPlant() {
          plantNum++;
          seed += 31;
          hiddenParent = plantNum % 2 === 0 ? "AA" : "Aa";
          lastRun = null;
          guessGeno = "";
          guessTester = "";
          submitted = false;
          draw();
        }

        function runCross(n) {
          seed += 17;
          lastRun = { tester, n, counts: Core.simulateMonoCross(hiddenParent, tester, n, seed) };
          submitted = false;
          draw();
        }

        function draw() {
          const solved = submitted && Boolean(lastRun) && guessGeno === hiddenParent && guessTester === "aa";
          if (solved) ctx.solve();

          root.replaceChildren(
            el("div", { class: "wb-header" },
              el("div", null,
                el("h3", null, `Level 1 · Design a Diagnostic Test Cross (Plant #${plantNum})`),
                el("p", { class: "wb-goal" }, "You have a purple-flowered plant (dominant phenotype A_ — could be AA or Aa). Pick a tester plant, run simulated crosses, then submit your deduction.")
              ),
              el("button", { type: "button", class: "g-btn g-btn-sm", onClick: newPlant }, "New Mystery Plant")
            ),
            el("div", { class: "wb-actions" },
              el("span", { class: "game-meta" }, "Choose tester:"),
              ...[["AA", "AA (Purple)"], ["Aa", "Aa (Purple)"], ["aa", "aa (White)"]].map(([g, lbl]) =>
                el("button", { type: "button", class: `g-btn g-btn-sm${tester === g ? " g-btn-primary" : ""}`, onClick: () => { tester = g; draw(); } }, lbl)
              ),
              el("button", { type: "button", class: "g-btn g-btn-sm", onClick: () => runCross(40) }, "Breed 40 Progeny"),
              el("button", { type: "button", class: "g-btn g-btn-sm", onClick: () => runCross(200) }, "Breed 200 Progeny")
            ),
            lastRun
              ? el("div", { class: "wb-telemetry" },
                  teleTile("Cross Run", `Plant #${plantNum} × ${lastRun.tester} (n=${lastRun.n})`),
                  teleTile("Purple Offspring", `${lastRun.counts.purple} (${Math.round((lastRun.counts.purple / lastRun.n) * 100)}%)`),
                  teleTile("White Offspring", `${lastRun.counts.white} (${Math.round((lastRun.counts.white / lastRun.n) * 100)}%)`, lastRun.counts.white > 0 ? "good" : "warn")
                )
              : feedbackBox("", "Experiment first:", "Pick a tester genotype and breed progeny. Notice which tester reveals hidden recessive alleles with a clean 1:1 split!"),
            el("div", { class: "choice-grid" },
              el("div", { class: "control-stack" },
                el("span", { class: "tele-label" }, `Your Deduction · Plant #${plantNum} Genotype`),
                el("div", { class: "wb-actions" },
                  ...["AA", "Aa", "aa"].map((g) =>
                    el("button", { type: "button", class: `g-btn g-btn-chip${guessGeno === g ? " is-active" : ""}`, onClick: () => { guessGeno = g; submitted = false; draw(); } }, g)
                  )
                )
              ),
              el("div", { class: "control-stack" },
                el("span", { class: "tele-label" }, "Which Tester Always Distinguishes AA vs Aa?"),
                el("div", { class: "wb-actions" },
                  ...["AA", "Aa", "aa"].map((g) =>
                    el("button", { type: "button", class: `g-btn g-btn-chip${guessTester === g ? " is-active" : ""}`, onClick: () => { guessTester = g; submitted = false; draw(); } }, g)
                  )
                )
              )
            ),
            el("div", { class: "wb-actions" },
              el("button", {
                type: "button",
                class: "g-btn g-btn-primary",
                disabled: !(lastRun && guessGeno && guessTester),
                onClick: () => { submitted = true; draw(); },
              }, "Submit Deduction")
            ),
            submitted
              ? solved
                ? feedbackBox("good", "Deduction verified!", `Plant #${plantNum} is indeed ${hiddenParent}. Crossing against a homozygous recessive tester (aa) cleanly separates AA (100% purple) from Aa (~50% purple : 50% white).`)
                : feedbackBox("bad", "Re-check your cross:", `Verify with the recessive tester (aa) across 200 progeny — zero white progeny supports AA, while ~50% white proves Aa.`)
              : null
          );
        }
        draw();
      },
    },

    {
      id: "autosomal-recessive",
      name: "2. Autosomal Pedigree",
      render(root, ctx) {
        const ped = {
          mode: "autosomal-recessive",
          marriages: [["I-1", "I-2"], ["II-2", "II-3"]],
          nodes: [
            { id: "I-1",  sex: "M", affected: false, x: 180, y: 45,  expected: "Aa" },
            { id: "I-2",  sex: "F", affected: false, x: 320, y: 45,  expected: "Aa" },
            { id: "II-1", sex: "F", affected: false, x: 130, y: 145, parents: ["I-1", "I-2"], expected: "A?" },
            { id: "II-2", sex: "M", affected: true,  x: 270, y: 145, parents: ["I-1", "I-2"], expected: "aa" },
            { id: "II-3", sex: "F", affected: false, x: 410, y: 145, expected: "Aa" },
            { id: "III-1",sex: "M", affected: true,  x: 290, y: 240, parents: ["II-2", "II-3"], expected: "aa" },
            { id: "III-2",sex: "F", affected: false, x: 400, y: 240, parents: ["II-2", "II-3"], expected: "Aa" },
          ],
        };
        let assignments = { "II-2": "aa", "III-1": "aa" };
        let selected = "I-1";
        let result = null;

        function draw() {
          const issueIds = new Set((result && !result.ok ? result.issues : []).map((i) => i.nodeId));
          if (result && result.ok) ctx.solve();

          root.replaceChildren(
            el("div", { class: "wb-header" },
              el("div", null,
                el("h3", null, "Level 2 · Solve an Autosomal Recessive Pedigree"),
                el("p", { class: "wb-goal" }, "Shaded shapes are affected (aa). Click each family member to assign their genotype. Use A? ONLY when phenotype + family links leave AA vs Aa genuinely undetermined.")
              ),
              el("button", { class: "g-btn g-btn-sm", type: "button", onClick: () => { assignments = { "II-2": "aa", "III-1": "aa" }; result = null; draw(); } }, "Reset")
            ),
            renderPedigreeSvg(ped, assignments, selected, issueIds, (id) => { selected = id; draw(); }),
            el("div", { class: "wb-actions" },
              el("span", { class: "game-meta" }, `Assign ${selected}:`),
              ...["AA", "Aa", "aa", "A?"].map((g) =>
                el("button", {
                  type: "button",
                  class: `g-btn g-btn-chip${assignments[selected] === g ? " is-active" : ""}`,
                  onClick: () => { assignments[selected] = g; result = null; draw(); },
                }, g)
              ),
              el("button", {
                type: "button",
                class: "g-btn g-btn-primary",
                onClick: () => { result = Core.evaluatePedigree(ped, assignments); draw(); },
              }, "Verify Mendelian Tree")
            ),
            result
              ? feedbackBox(result.ok ? "good" : "bad", result.ok ? "Pedigree solved!" : "Check deduction:", result.summary)
              : feedbackBox("", "Tip:", "Squares = male, circles = female, shaded = affected (aa). Look carefully at III-2: their father II-2 is aa, so what allele MUST III-2 inherit?")
          );
        }
        draw();
      },
    },

    {
      id: "x-linked-recessive",
      name: "3. X-Linked Detective",
      render(root, ctx) {
        const ped = {
          mode: "x-linked-recessive",
          marriages: [["I-1", "I-2"], ["II-1", "II-3"]],
          nodes: [
            { id: "I-1",   sex: "M", affected: true,  x: 180, y: 45,  expected: "XaY" },
            { id: "I-2",   sex: "F", affected: false, x: 320, y: 45,  expected: "XAX?" },
            { id: "II-1",  sex: "F", affected: false, x: 200, y: 145, parents: ["I-1", "I-2"], expected: "XAXa" },
            { id: "II-2",  sex: "M", affected: false, x: 350, y: 145, parents: ["I-1", "I-2"], expected: "XAY" },
            { id: "II-3",  sex: "M", affected: false, x: 90,  y: 145, expected: "XAY" },
            { id: "III-1", sex: "M", affected: true,  x: 100, y: 240, parents: ["II-1", "II-3"], expected: "XaY" },
            { id: "III-2", sex: "F", affected: false, x: 210, y: 240, parents: ["II-1", "II-3"], expected: "XAX?" },
          ],
        };
        let assignments = { "I-1": "XaY", "III-1": "XaY" };
        let selected = "II-1";
        let result = null;

        const optsBySex = {
          M: [["XAY", "XᴬY"], ["XaY", "XᵃY"]],
          F: [["XAXA", "XᴬXᴬ"], ["XAXa", "XᴬXᵃ"], ["XaXa", "XᵃXᵃ"], ["XAX?", "XᴬX?"]],
        };

        function draw() {
          const issueIds = new Set((result && !result.ok ? result.issues : []).map((i) => i.nodeId));
          if (result && result.ok) ctx.solve();
          const selNode = ped.nodes.find((n) => n.id === selected);

          root.replaceChildren(
            el("div", { class: "wb-header" },
              el("div", null,
                el("h3", null, "Level 3 · Trace an X-Linked Recessive Pedigree"),
                el("p", { class: "wb-goal" }, "Fathers pass their X chromosome to ALL daughters and their Y to ALL sons. Assign each person's X-linked genotype, using XᴬX? when carrier status is undetermined.")
              ),
              el("button", { class: "g-btn g-btn-sm", type: "button", onClick: () => { assignments = { "I-1": "XaY", "III-1": "XaY" }; result = null; draw(); } }, "Reset")
            ),
            renderPedigreeSvg(ped, assignments, selected, issueIds, (id) => { selected = id; draw(); }),
            el("div", { class: "wb-actions" },
              el("span", { class: "game-meta" }, `Assign ${selected} (${selNode.sex === "M" ? "Male" : "Female"}):`),
              ...optsBySex[selNode.sex].map(([val, lbl]) =>
                el("button", {
                  type: "button",
                  class: `g-btn g-btn-chip${assignments[selected] === val ? " is-active" : ""}`,
                  onClick: () => { assignments[selected] = val; result = null; draw(); },
                }, lbl)
              ),
              el("button", {
                type: "button",
                class: "g-btn g-btn-primary",
                onClick: () => { result = Core.evaluatePedigree(ped, assignments); draw(); },
              }, "Verify X-Linked Tree")
            ),
            result
              ? feedbackBox(result.ok ? "good" : "bad", result.ok ? "X-linked transmission mastered!" : "Check X-linkage:", result.summary)
              : feedbackBox("", "Key clue:", "Affected grandfather I-1 (XᵃY) passes Xᵃ to daughter II-1 (making her an obligate carrier), who passes it to grandson III-1 — skipping a generation!")
          );
        }
        draw();
      },
    },

    {
      id: "epistasis-pathway",
      name: "4. Epistasis Pathway",
      render(root, ctx) {
        let seed = 200;
        let run = null;
        let step1 = "";
        let step2 = "";
        let submitted = false;
        let showHint = false;

        function breed(p1, p2, label) {
          seed += 13;
          run = { label, n: 320, counts: Core.simulateEpistasisCross(p1, p2, 320, seed) };
          submitted = false;
          draw();
        }

        function draw() {
          const solved = submitted && Boolean(run) && step1 === "A" && step2 === "B";
          if (solved) ctx.solve();

          root.replaceChildren(
            el("div", { class: "wb-header" },
              el("div", null,
                el("h3", null, "Level 4 · Deduce a 2-Gene Biochemical Pathway (9:3:4 Epistasis)"),
                el("p", { class: "wb-goal" }, "Two enzymes convert a white precursor → pink intermediate → purple pigment. Run crosses below, inspect which knockout masks the other, and submit Step 1 & Step 2.")
              ),
              hintToggleBtn(showHint, () => { showHint = !showHint; draw(); })
            ),
            hintPanel(showHint, "Test both homozygous knockouts (aaBB and AAbb). Whichever knockout stays completely white blocks the pathway BEFORE pink intermediate is ever made!"),
            el("div", { class: "wb-actions" },
              el("button", { type: "button", class: "g-btn g-btn-sm", onClick: () => breed("AaBb", "AaBb", "AaBb × AaBb (F2)") }, "Cross AaBb × AaBb"),
              el("button", { type: "button", class: "g-btn g-btn-sm", onClick: () => breed("aaBB", "aaBB", "aaBB × aaBB") }, "Test aaBB knockout"),
              el("button", { type: "button", class: "g-btn g-btn-sm", onClick: () => breed("AAbb", "AAbb", "AAbb × AAbb") }, "Test AAbb knockout")
            ),
            run
              ? el("div", { class: "wb-telemetry" },
                  teleTile("Cross", run.label),
                  teleTile("Purple", `${run.counts.purple} (${((run.counts.purple / run.n) * 16).toFixed(1)}/16)`),
                  teleTile("Pink", `${run.counts.pink} (${((run.counts.pink / run.n) * 16).toFixed(1)}/16)`),
                  teleTile("White", `${run.counts.white} (${((run.counts.white / run.n) * 16).toFixed(1)}/16)`)
                )
              : feedbackBox("", "Run an experiment:", "Start with the F2 dihybrid cross (AaBb × AaBb) and then test each single-gene homozygous knockout (aaBB vs AAbb)."),
            el("div", { class: "choice-grid" },
              el("div", { class: "control-stack" },
                el("span", { class: "tele-label" }, "Step 1 · White Precursor → Pink"),
                el("div", { class: "wb-actions" },
                  ...["A", "B"].map((g) =>
                    el("button", { type: "button", class: `g-btn g-btn-chip${step1 === g ? " is-active" : ""}`, onClick: () => { step1 = g; submitted = false; draw(); } }, `Gene ${g}`)
                  )
                )
              ),
              el("div", { class: "control-stack" },
                el("span", { class: "tele-label" }, "Step 2 · Pink Intermediate → Purple"),
                el("div", { class: "wb-actions" },
                  ...["A", "B"].map((g) =>
                    el("button", { type: "button", class: `g-btn g-btn-chip${step2 === g ? " is-active" : ""}`, onClick: () => { step2 = g; submitted = false; draw(); } }, `Gene ${g}`)
                  )
                )
              )
            ),
            el("div", { class: "wb-actions" },
              el("button", {
                type: "button",
                class: "g-btn g-btn-primary",
                disabled: !(run && step1 && step2),
                onClick: () => { submitted = true; draw(); },
              }, "Verify Pathway")
            ),
            submitted
              ? solved
                ? feedbackBox("good", "Pathway ordered!", "Because aaBB stays white (masking B entirely) while AAbb accumulates pink, Gene A acts upstream (White → Pink) and Gene B acts downstream (Pink → Purple), collapsing 9:3:3:1 into 9:3:4.")
                : feedbackBox("bad", "Check the knockout evidence:", "If aaBB is white even with functional B, which enzyme must be missing BEFORE pink pigment is ever made?")
              : null
          );
        }
        draw();
      },
    },

    {
      id: "hw-carrier-risk",
      name: "5. Carrier Risk (HWE)",
      render(root, ctx) {
        const scenarios = [
          { denom: 10000, label: "1 in 10,000 (PKU-like)" },
          { denom: 2500,  label: "1 in 2,500 (CF-like)" },
          { denom: 40000, label: "1 in 40,000 (Ultra-rare)" },
        ];
        let scenIdx = 0;
        let qInput = "";
        let carrierInput = "";
        let riskInput = "";
        let evaluation = null;
        let showHint = false;

        function draw() {
          const scen = scenarios[scenIdx];
          if (evaluation && evaluation.ok) ctx.solve();

          root.replaceChildren(
            el("div", { class: "wb-header" },
              el("div", null,
                el("h3", null, "Level 5 · Calculate Genetic Counseling Carrier Risk"),
                el("p", { class: "wb-goal" }, `An autosomal recessive disorder affects 1 in ${scen.denom.toLocaleString()} newborns (q²) in a Hardy–Weinberg population. Maya is the UNAFFECTED sister of an affected brother (both parents unaffected), and marries an unrelated partner. Compute all 3 values below.`)
              ),
              hintToggleBtn(showHint, () => { showHint = !showHint; draw(); })
            ),
            hintPanel(showHint, "Step 1: q = √(q²). Step 2: carrier frequency 2pq ≈ 2q (write N for '1 in N'). Step 3: P(Maya is Aa) = 2/3 (since aa is ruled out!), so child risk = (2/3) × (2pq) × (1/4)."),
            el("div", { class: "wb-actions" },
              el("span", { class: "game-meta" }, "Disease scenario:"),
              ...scenarios.map((s, i) =>
                el("button", {
                  type: "button",
                  class: `g-btn g-btn-sm${scenIdx === i ? " g-btn-primary" : ""}`,
                  onClick: () => { scenIdx = i; qInput = ""; carrierInput = ""; riskInput = ""; evaluation = null; draw(); },
                }, s.label)
              )
            ),
            el("div", { class: "wb-telemetry" },
              teleTile("Disease Prevalence q²", `1 / ${scen.denom.toLocaleString()}`),
              teleTile("Maya's Carrier Prob", "2 / 3 (not 1/2!)"),
              teleTile("If Both Aa → P(aa)", "1 / 4")
            ),
            el("div", { class: "choice-grid" },
              el("div", { class: "control-stack" },
                el("span", { class: "tele-label" }, "1. Recessive allele freq q = √(q²)"),
                el("div", { class: "num-field" },
                  el("span", null, "q ="),
                  el("input", {
                    type: "text",
                    class: "num-input",
                    placeholder: "e.g. 0.01",
                    value: qInput,
                    "aria-label": "Recessive allele frequency q",
                    onInput: (e) => { qInput = e.target.value; },
                  })
                )
              ),
              el("div", { class: "control-stack" },
                el("span", { class: "tele-label" }, "2. Partner carrier freq 2pq ≈ 2q"),
                el("div", { class: "num-field" },
                  el("span", null, "1 in"),
                  el("input", {
                    type: "text",
                    class: "num-input",
                    placeholder: "e.g. 50",
                    value: carrierInput,
                    "aria-label": "Partner carrier denominator",
                    onInput: (e) => { carrierInput = e.target.value; },
                  })
                )
              ),
              el("div", { class: "control-stack" },
                el("span", { class: "tele-label" }, "3. Affected child risk = (2/3)·2pq·(1/4)"),
                el("div", { class: "num-field" },
                  el("span", null, "1 in"),
                  el("input", {
                    type: "text",
                    class: "num-input",
                    placeholder: "e.g. 300",
                    value: riskInput,
                    "aria-label": "Affected child risk denominator",
                    onInput: (e) => { riskInput = e.target.value; },
                  })
                )
              )
            ),
            el("div", { class: "wb-actions" },
              el("button", {
                type: "button",
                class: "g-btn g-btn-primary",
                onClick: () => {
                  evaluation = Core.evaluateCarrierRisk(scen.denom, qInput, carrierInput, riskInput);
                  draw();
                },
              }, "Check Calculation")
            ),
            evaluation
              ? evaluation.ok
                ? feedbackBox("good", "Counseling math verified!", `For q² = 1/${scen.denom.toLocaleString()}: q = ${evaluation.qTrue}, healthy carriers are ~1 in ${evaluation.carrierDenomApprox} (far more common than affected births!), and Maya's child risk is ~1 in ${evaluation.riskDenomApprox}. Try another disease scenario above!`)
                : feedbackBox("bad", `${evaluation.errors.length} step(s) need fixing:`, evaluation.errors[0])
              : feedbackBox("", "Accepts both exact 2pq and 2q approximations:", "Enter your computed numbers and click Check Calculation.")
          );
        }
        draw();
      },
    },
  ];

  /* =========================================================================
     ARCADE ROUTER & SHELL
     ========================================================================= */

  function mountGamesApp() {
    const app = document.getElementById("games-app");
    if (!app) return;

    const totalLevels = Core.GAMES_CATALOG.reduce((acc, g) => acc + g.levels, 0);
    let activeGameId = null;
    let activeLevelIdx = 0;
    let keyListener = null;

    function detachKey() {
      if (keyListener) {
        window.removeEventListener("keydown", keyListener);
        keyListener = null;
      }
    }

    function openGame(gameId, levelIdx = 0) {
      activeGameId = gameId;
      activeLevelIdx = levelIdx;
      if (window.location.hash !== `#${gameId}`) {
        history.replaceState(null, "", `#${gameId}`);
      }
      render();
      window.scrollTo({ top: 0, behavior: "instant" });
    }

    function openHub() {
      detachKey();
      activeGameId = null;
      if (window.location.hash) {
        history.replaceState(null, "", window.location.pathname + window.location.search);
      }
      render();
      window.scrollTo({ top: 0, behavior: "instant" });
    }

    function renderHub() {
      const solvedAll = Progress.totalSolved();
      const pct = Math.round((solvedAll / totalLevels) * 100);

      app.replaceChildren(
        el("section", { class: "arcade-hero" },
          el("div", null,
            el("span", { class: "arcade-kicker" }, "Interactive Lab Arcade · 6 Runnable Engines"),
            el("h1", { class: "arcade-title" }, "Genomics Lab Games"),
            el("p", { class: "arcade-lede" }, "Six mechanic-first simulations built to complement the course where hands-on manipulation beats passive reading: antiparallel DNA & PCR, live ribosome translation & splicing, Mendelian pedigrees, Wright–Fisher evolution, read alignment & VCF triage, and SCA12 repeat instability.")
          ),
          el("div", { class: "arcade-score-pill" },
            el("span", { class: "arcade-score-num" }, `${solvedAll} / ${totalLevels}`),
            el("span", { class: "arcade-score-label" }, `Challenges mastered (${pct}%)`),
            el("div", { class: "arcade-meter" }, el("span", { style: `width:${pct}%` })),
            solvedAll > 0
              ? el("button", {
                  type: "button",
                  class: "g-btn g-btn-sm",
                  style: "margin-top:.35rem",
                  onClick: () => { Progress.resetAll(); render(); },
                }, "Reset progress")
              : null
          )
        ),
        el("div", { class: "arcade-grid" },
          ...Core.GAMES_CATALOG.map((g) => {
            const done = Progress.solvedCount(g.id);
            const allDone = done >= g.levels;
            return el("article", { class: "game-card" },
              el("div", { class: "game-card-top" },
                el("span", { class: "game-num" }, `LAB ${g.number}`),
                el("span", { class: `game-status-badge${allDone ? " is-done" : ""}` }, allDone ? "Mastered ✓" : `${done} / ${g.levels} solved`)
              ),
              el("h2", null, g.title),
              el("p", null, g.subtitle),
              el("div", { class: "game-chapters" },
                ...g.chapters.map((c) => el("a", { class: "chapter-pill", href: c.href }, c.label))
              ),
              el("div", { class: "game-card-foot" },
                el("span", { class: "game-meta" }, `${g.levels} levels · ${g.minutes}`),
                el("button", { type: "button", class: "g-btn g-btn-primary g-btn-sm", onClick: () => openGame(g.id, 0) }, done > 0 ? "Continue →" : "Play →")
              )
            );
          })
        )
      );
    }

    function renderGame(gameMeta) {
      detachKey();
      const levels = Registry[gameMeta.id] || [];
      const idx = Math.max(0, Math.min(levels.length - 1, activeLevelIdx));
      activeLevelIdx = idx;
      const lvl = levels[idx];
      const wbBody = el("div", { style: "display:flex;flex-direction:column;gap:1.1rem" });
      // Filter null/false/undefined children so conditional panels never render literal "null".
      wbBody.replaceChildren = function (...nodes) {
        return HTMLElement.prototype.replaceChildren.apply(
          this,
          nodes.flat().filter((n) => n !== null && n !== undefined && n !== false)
        );
      };
      const nextBtnSlot = el("div", { class: "wb-actions" });

      function updateNextButton() {
        const solvedNow = Progress.isSolved(gameMeta.id, lvl.id);
        nextBtnSlot.replaceChildren();
        if (solvedNow && idx < levels.length - 1) {
          nextBtnSlot.appendChild(
            el("button", {
              type: "button",
              class: "g-btn g-btn-primary",
              onClick: () => openGame(gameMeta.id, idx + 1),
            }, `Next: ${levels[idx + 1].name} →`)
          );
        } else if (solvedNow && idx === levels.length - 1) {
          nextBtnSlot.appendChild(
            el("button", {
              type: "button",
              class: "g-btn g-btn-primary",
              onClick: openHub,
            }, "Lab Complete · Back to All Games →")
          );
        }
      }

      const tabsEl = el("div", { class: "level-tabs", role: "tablist", "aria-label": "Levels" });
      const solvedBadge = el("span", { class: "game-status-badge" }, `${Progress.solvedCount(gameMeta.id)} / ${levels.length} solved`);
      function updateBadge() {
        const done = Progress.solvedCount(gameMeta.id);
        solvedBadge.textContent = done >= levels.length ? "Mastered ✓" : `${done} / ${levels.length} solved`;
        solvedBadge.className = `game-status-badge${done >= levels.length ? " is-done" : ""}`;
      }
      function renderTabs() {
        tabsEl.replaceChildren(
          ...levels.map((l, i) => {
            const done = Progress.isSolved(gameMeta.id, l.id);
            return el("button", {
              type: "button",
              role: "tab",
              "aria-selected": String(i === idx),
              class: `level-tab${i === idx ? " is-active" : ""}${done ? " is-solved" : ""}`,
              onClick: () => openGame(gameMeta.id, i),
            }, el("span", { class: "lvl-dot" }, done ? "✓" : String(i + 1)), l.name);
          })
        );
      }

      const ctx = {
        solve() {
          if (!Progress.isSolved(gameMeta.id, lvl.id)) {
            Progress.markSolved(gameMeta.id, lvl.id);
            renderTabs();
            updateBadge();
          }
          updateNextButton();
        },
        onKey(fn) {
          detachKey();
          keyListener = (e) => {
            if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
            if (e.metaKey || e.ctrlKey || e.altKey) return;
            fn(e);
          };
          window.addEventListener("keydown", keyListener);
        },
      };

      renderTabs();
      updateBadge();
      updateNextButton();
      lvl.render(wbBody, ctx);

      app.replaceChildren(
        el("div", { class: "game-stage-bar" },
          el("div", { class: "game-stage-left" },
            el("button", { type: "button", class: "g-btn g-btn-sm", onClick: openHub }, "← All Games"),
            el("span", { class: "game-num" }, `LAB ${gameMeta.number}`),
            el("h1", { class: "game-stage-title" }, gameMeta.title)
          ),
          solvedBadge
        ),
        tabsEl,
        el("section", { class: "workbench" },
          wbBody,
          nextBtnSlot,
          chapterFooter(gameMeta)
        )
      );
    }

    function render() {
      if (!activeGameId) {
        renderHub();
        return;
      }
      const meta = Core.GAMES_CATALOG.find((g) => g.id === activeGameId);
      if (!meta || !Registry[meta.id]) {
        activeGameId = null;
        renderHub();
        return;
      }
      renderGame(meta);
    }

    function syncFromHash() {
      const h = (window.location.hash || "").replace(/^#/, "");
      if (h && Core.GAMES_CATALOG.some((g) => g.id === h)) {
        activeGameId = h;
        activeLevelIdx = 0;
      } else {
        activeGameId = null;
      }
      render();
    }

    window.addEventListener("hashchange", syncFromHash);
    syncFromHash();
  }

  // Defer boot until games-ui-advanced.js has also registered its games.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountGamesApp);
  } else {
    setTimeout(mountGamesApp, 0);
  }
})();
