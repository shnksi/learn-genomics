/* ── Reader — reading surface ────────────────────────────────────────────────
   Table of contents, reading progress, glossary hovercards, theme, and the
   per-document store the widgets read and write.

   Re-reading is a first-class case, not an afterthought. Chapter 00 tells you
   outright to "read it again after Part 4", so nothing here may punish a second
   visit:

     · resume is OFFERED, never performed. Being thrown 4,000px down a chapter
       you deliberately reopened at the top is the single most hostile thing a
       reader can do.
     · practice mode is a global switch that turns every gate off and stops
       anything auto-starting, so widgets become tools you can just use.
     · a finished widget stays finished. It reopens as a summary of what you
       scored last time with an explicit "run it again", rather than resetting
       itself and demanding the whole thing over.

   No framework, no build step.
   ───────────────────────────────────────────────────────────────────────── */

(function () {
  "use strict";

  const bootEl = document.getElementById("bootstrap");
  const BOOT = bootEl ? JSON.parse(bootEl.textContent) : { docId: "unknown" };
  const KEY = "learn-genomics.reader";
  const DOC = BOOT.docId || "unknown";
  const IS_INDEX = BOOT.kind === "index";

  /* ── Store ────────────────────────────────────────────────────────────────
     One key for the whole course, split into global preferences and per-document
     state. Per-document matters: a single shared scroll position across 110
     pages would send you to the wrong place on every one of them.
     ─────────────────────────────────────────────────────────────────────── */

  const Store = {
    all() {
      try {
        const v = JSON.parse(localStorage.getItem(KEY));
        return v && typeof v === "object" ? v : {};
      } catch {
        return {};
      }
    },
    save(v) {
      try {
        localStorage.setItem(KEY, JSON.stringify(v));
      } catch {
        /* private browsing — degrades to a single session */
      }
    },
    prefs(patch) {
      const v = this.all();
      if (patch) {
        Object.assign(v, patch);
        this.save(v);
      }
      return v;
    },
    doc(id, patch) {
      const v = this.all();
      v.docs = v.docs || {};
      v.docs[id] = v.docs[id] || {};
      if (patch) {
        Object.assign(v.docs[id], patch);
        this.save(v);
      }
      return v.docs[id];
    },
    docs() {
      return this.all().docs || {};
    },
    clearDoc(id) {
      const v = this.all();
      if (v.docs) delete v.docs[id];
      this.save(v);
    },
  };
  window.ReaderStore = Store;
  window.ReaderDoc = DOC;

  /* ── Toast ────────────────────────────────────────────────────────────── */

  const toastEl = document.getElementById("toast");
  let toastTimer;
  window.toast = function (message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (toastEl.hidden = true), 2800);
  };

  /* ── Preferences: theme, text size, practice mode ─────────────────────── */

  const prefs = Store.prefs();
  if (prefs.theme) document.documentElement.dataset.theme = prefs.theme;
  if (prefs.scale) document.documentElement.style.setProperty("--scale", prefs.scale);
  if (prefs.practice) document.documentElement.dataset.practice = "on";

  const themeBtn = document.getElementById("theme");
  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const now = document.documentElement.dataset.theme;
      const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const next = now ? (now === "dark" ? "light" : "dark") : dark ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      Store.prefs({ theme: next });
      if (window.remermaid) window.remermaid();
    });
  }

  const SCALES = [1, 1.12, 1.26, 0.92];
  const sizeBtn = document.getElementById("text-size");
  if (sizeBtn) {
    sizeBtn.addEventListener("click", () => {
      const current =
        parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--scale")) || 1;
      const idx = SCALES.findIndex((s) => Math.abs(s - current) < 0.01);
      const next = SCALES[(idx + 1) % SCALES.length];
      document.documentElement.style.setProperty("--scale", next);
      Store.prefs({ scale: next });
    });
  }

  // Practice mode: no gates, nothing auto-starts, everything usable as a tool.
  const practiceBtn = document.getElementById("practice");
  function syncPractice() {
    const on = !!Store.prefs().practice;
    document.documentElement.dataset.practice = on ? "on" : "";
    if (practiceBtn) practiceBtn.setAttribute("aria-pressed", String(on));
    return on;
  }
  window.isPracticeMode = () => !!Store.prefs().practice;
  if (practiceBtn) {
    practiceBtn.addEventListener("click", () => {
      const on = !Store.prefs().practice;
      Store.prefs({ practice: on });
      syncPractice();
      window.toast(
        on
          ? "Practice mode on — nothing is gated, nothing auto-starts. Reload to re-open widgets as tools."
          : "Practice mode off — widgets ask for a prediction first again."
      );
    });
  }
  syncPractice();

  if (IS_INDEX) {
    renderIndexState();
    return;
  }

  /* ── Visit accounting ─────────────────────────────────────────────────── */

  const state = Store.doc(DOC);
  const previous = {
    visits: state.visits || 0,
    scrollY: state.scrollY || 0,
    percent: state.percent || 0,
    done: !!state.done,
  };
  // A refresh is not a new visit; returning half an hour later is.
  const gap = state.lastAt ? Date.now() - new Date(state.lastAt).getTime() : Infinity;
  if (gap > 30 * 60 * 1000) {
    Store.doc(DOC, { visits: previous.visits + 1, lastAt: new Date().toISOString() });
  } else {
    Store.doc(DOC, { lastAt: new Date().toISOString() });
  }
  window.ReaderIsRevisit = previous.visits > 0;

  /* ── Table of contents ────────────────────────────────────────────────── */

  const tocEl = document.getElementById("toc");
  const toc = BOOT.toc || [];
  if (tocEl && toc.length) {
    tocEl.innerHTML =
      '<div class="toc-label">On this page</div><ol>' +
      toc.map((s) => `<li><a href="#${s.id}" data-id="${s.id}"></a></li>`).join("") +
      "</ol>";
    // Titles are set as text, never as markup — they come from rendered HTML.
    tocEl.querySelectorAll("a").forEach((a, i) => (a.textContent = toc[i].text));
  } else if (tocEl) {
    tocEl.hidden = true;
  }

  const mobile = window.matchMedia("(max-width: 60rem)");
  const tocToggle = document.getElementById("toc-toggle");
  function syncToc() {
    if (!tocEl || !toc.length) return;
    tocEl.hidden = mobile.matches && tocToggle?.getAttribute("aria-expanded") !== "true";
  }
  if (tocToggle) {
    tocToggle.addEventListener("click", () => {
      tocToggle.setAttribute(
        "aria-expanded",
        String(tocToggle.getAttribute("aria-expanded") !== "true")
      );
      syncToc();
    });
  }
  tocEl?.addEventListener("click", (e) => {
    if (e.target.matches("a") && mobile.matches) {
      tocToggle?.setAttribute("aria-expanded", "false");
      syncToc();
    }
  });
  mobile.addEventListener("change", syncToc);
  syncToc();

  /* ── Progress ─────────────────────────────────────────────────────────── */

  const bar = document.getElementById("progress-bar");
  const progressEl = document.querySelector(".progress");
  const links = tocEl ? Array.from(tocEl.querySelectorAll("a")) : [];
  const headings = toc.map((s) => document.getElementById(s.id)).filter(Boolean);

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? Math.min(100, Math.round((window.scrollY / max) * 100)) : 100;
      if (bar) bar.style.width = pct + "%";
      progressEl?.setAttribute("aria-valuenow", String(pct));

      let current = headings[0];
      for (const h of headings) if (h.getBoundingClientRect().top <= 120) current = h;
      links.forEach((a) => a.classList.toggle("current", a.dataset.id === current?.id));

      const patch = { scrollY: window.scrollY, percent: pct };
      if (pct >= 92) patch.done = true;
      Store.doc(DOC, patch);
      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  /* ── Resume: offered, never performed ─────────────────────────────────── */

  const resumeEl = document.getElementById("resume");
  if (resumeEl && previous.scrollY > 600 && previous.percent > 5 && previous.percent < 95) {
    const wrap = document.createElement("div");
    wrap.className = "resume-inner";

    const label = document.createElement("span");
    label.textContent = previous.done
      ? `You have read this before — last time you reached ${previous.percent}%.`
      : `Last visit you reached ${previous.percent}% of this chapter.`;

    const go = document.createElement("button");
    go.className = "btn btn-primary";
    go.textContent = "Jump back there";
    go.addEventListener("click", () => {
      window.scrollTo({ top: previous.scrollY, behavior: "instant" });
      resumeEl.hidden = true;
    });

    const top = document.createElement("button");
    top.className = "btn";
    top.textContent = "Start from the top";
    top.addEventListener("click", () => (resumeEl.hidden = true));

    const dismiss = document.createElement("button");
    dismiss.className = "icon-btn resume-x";
    dismiss.setAttribute("aria-label", "Dismiss");
    dismiss.textContent = "✕";
    dismiss.addEventListener("click", () => (resumeEl.hidden = true));

    wrap.append(label, go, top, dismiss);
    resumeEl.append(wrap);
    resumeEl.hidden = false;
  }

  /* ── Glossary hovercards ──────────────────────────────────────────────── */

  const card = document.getElementById("gloss-card");
  let anchor = null;

  function showCard(button) {
    const entry = (BOOT.terms || {})[button.dataset.term];
    if (!entry || !card) return;
    card.innerHTML =
      `<h4>${entry.term}</h4><p>${entry.definition}</p>` +
      (entry.chapter
        ? `<span class="gloss-src">Developed properly in ${entry.chapter}</span>`
        : "");
    card.hidden = false;

    const r = button.getBoundingClientRect();
    const w = Math.min(card.offsetWidth, window.innerWidth - 24);
    let left = Math.max(12, Math.min(
      r.left + window.scrollX + r.width / 2 - w / 2, window.innerWidth - w - 12));
    let top = r.bottom + window.scrollY + 8;
    if (r.bottom + card.offsetHeight + 24 > window.innerHeight) {
      top = r.top + window.scrollY - card.offsetHeight - 8;
    }
    card.style.left = left + "px";
    card.style.top = Math.max(8, top) + "px";
    anchor = button;
  }
  function hideCard() {
    if (card) card.hidden = true;
    anchor = null;
  }

  document.addEventListener("pointerover", (e) => {
    const b = e.target.closest?.(".gloss");
    if (b && b !== anchor) showCard(b);
  });
  document.addEventListener("pointerout", (e) => {
    const b = e.target.closest?.(".gloss");
    if (b && !card?.contains(e.relatedTarget) && e.relatedTarget !== b) {
      setTimeout(() => {
        if (!card?.matches(":hover")) hideCard();
      }, 120);
    }
  });
  document.addEventListener("click", (e) => {
    const b = e.target.closest?.(".gloss");
    if (b) {
      e.preventDefault();
      anchor === b ? hideCard() : showCard(b);
      return;
    }
    if (!e.target.closest?.("#gloss-card")) hideCard();
  });
  document.addEventListener("focusin", (e) => {
    const b = e.target.closest?.(".gloss");
    if (b) showCard(b);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") hideCard();
  });

  /* ── Links the build could not resolve ────────────────────────────────── */

  document.addEventListener("click", (e) => {
    const x = e.target.closest?.("a[data-dead]");
    if (!x) return;
    e.preventDefault();
    window.toast(`“${x.dataset.dead}” is not part of this build`);
  });

  /* ── Maths ────────────────────────────────────────────────────────────────
     The renderer emits the raw TeX inside a span/div and leaves it alone; KaTeX
     typesets it here. If KaTeX is missing the TeX stays visible as text, which
     is degraded but still readable — never an empty box.
     ─────────────────────────────────────────────────────────────────────── */

  function typesetMath(root) {
    const nodes = (root || document).querySelectorAll(
      ".math-inline:not([data-tex]), .math-display:not([data-tex])"
    );
    nodes.forEach((el) => {
      el.setAttribute("data-tex", "");        // also stops the observer re-entering
      if (typeof katex === "undefined") {
        el.classList.add("math-raw");
        return;
      }
      try {
        katex.render(el.textContent, el, {
          displayMode: el.classList.contains("math-display"),
          throwOnError: false,
          strict: false,
        });
      } catch {
        el.classList.add("math-raw");
      }
    });
  }
  window.typesetMath = typesetMath;
  typesetMath(document);

  // Widgets inject rendered chapter HTML long after this runs — recall answers,
  // diagnostic options — and that HTML carries maths of its own. Observing is
  // more reliable than remembering to call typesetMath at every injection site.
  new MutationObserver((records) => {
    for (const r of records) {
      for (const node of r.addedNodes) {
        if (node.nodeType !== 1) continue;
        if (node.matches?.(".math-inline, .math-display")) typesetMath(node.parentNode);
        else if (node.querySelector?.(".math-inline, .math-display")) typesetMath(node);
      }
    }
  }).observe(document.body, { childList: true, subtree: true });

  /* ── Mermaid ──────────────────────────────────────────────────────────── */

  if (BOOT.nativeMermaid) {
    window.remermaid = function () {};
  } else {
    const sources = new WeakMap();
    document.querySelectorAll(".mermaid").forEach((el) => sources.set(el, el.textContent));

    window.remermaid = function () {
      if (typeof mermaid === "undefined") return;
      const dark =
        document.documentElement.dataset.theme === "dark" ||
        (!document.documentElement.dataset.theme &&
          window.matchMedia("(prefers-color-scheme: dark)").matches);
      const nodes = document.querySelectorAll(".mermaid");
      nodes.forEach((el) => {
        el.removeAttribute("data-processed");
        el.textContent = sources.get(el);
      });
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: "strict",
        theme: dark ? "dark" : "neutral",
        fontFamily: "ui-sans-serif, -apple-system, Segoe UI, Roboto, sans-serif",
      });
      mermaid.run({ nodes }).catch(() => {
        nodes.forEach((el) => el.setAttribute("data-failed", ""));
      });
    };

    if (typeof mermaid === "undefined") {
      document.querySelectorAll(".mermaid").forEach((el) => el.setAttribute("data-failed", ""));
    } else {
      window.remermaid();
    }
  }

  /* ── Index page ───────────────────────────────────────────────────────── */

  function renderIndexState() {
    const docs = Store.docs();
    let read = 0, started = 0, called = 0, right = 0, scheduled = 0;

    document.querySelectorAll(".doc-row").forEach((row) => {
      const s = docs[row.dataset.doc];
      const slot = row.querySelector("[data-state]");
      if (!s || !slot) return;

      if (s.done) read += 1;
      else if (s.percent > 3) started += 1;
      if (s.ledger) {
        called += s.ledger.made || 0;
        right += s.ledger.right || 0;
      }
      if (s.recall) scheduled += Object.keys(s.recall).length;

      const bits = [];
      if (s.done) bits.push('<span class="pill pill-done">read</span>');
      else if (s.percent > 3) bits.push(`<span class="pill">${s.percent}%</span>`);
      if (s.visits > 1) bits.push(`<span class="pill">×${s.visits}</span>`);
      if (s.diagnostic) {
        const d = s.diagnostic;
        const good = d.score === d.total;
        bits.push(
          `<span class="pill ${good ? "pill-good" : "pill-warn"}">${d.score}/${d.total}</span>`
        );
      }
      slot.innerHTML = bits.join("");
    });

    const summary = document.getElementById("index-summary");
    if (!summary) return;
    if (!read && !started) {
      summary.innerHTML =
        '<p class="muted">Nothing read yet. Progress, diagnostic scores and scheduled ' +
        "recall cards will appear here as you go — all of it stored in this browser only.</p>";
      return;
    }
    summary.innerHTML =
      `<div class="readout">
         <div class="stat"><span class="stat-val">${read}</span>
           <span class="stat-key">chapters finished</span></div>
         <div class="stat"><span class="stat-val">${started}</span>
           <span class="stat-key">in progress</span></div>
         <div class="stat"><span class="stat-val">${called ? right + "/" + called : "—"}</span>
           <span class="stat-key">predictions called</span></div>
         <div class="stat"><span class="stat-val">${scheduled}</span>
           <span class="stat-key">recall cards scheduled</span></div>
       </div>`;
  }
})();
