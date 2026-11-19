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

  /* ── Spaced repetition (SM-2 style, shared by chapters & index) ───────── */

  const SRS_RATINGS = ["again", "hard", "good", "easy"];

  const ReaderSRS = {
    RATINGS: SRS_RATINGS,

    computeNext(prev, rating, now = Date.now()) {
      const ease0 = typeof prev?.ease === "number" ? prev.ease : 2.5;
      const prevInt = typeof prev?.interval === "number" ? prev.interval : 0;
      const reps0 = typeof prev?.reps === "number" ? prev.reps : 0;
      let interval, ease = ease0, reps = reps0;

      if (rating === "again") {
        interval = 10 / 1440; // 10 minutes
        reps = 0;
        ease = Math.max(1.3, ease0 - 0.2);
      } else if (rating === "hard") {
        interval = prevInt > 0 ? Math.max(1, Math.round(prevInt * 1.2)) : 1;
        reps = reps0 + 1;
        ease = Math.max(1.3, ease0 - 0.15);
      } else if (rating === "good") {
        if (reps0 === 0) interval = 3;
        else if (reps0 === 1) interval = 7;
        else interval = Math.max(2, Math.round(Math.max(prevInt, 3) * ease0));
        reps = reps0 + 1;
      } else {
        // easy
        interval = reps0 === 0
          ? 6
          : Math.max(4, Math.round(Math.max(prevInt, 4) * ease0 * 1.3));
        reps = reps0 + 1;
        ease = Math.min(3.0, ease0 + 0.15);
      }

      return {
        rating,
        interval,
        ease: Math.round(ease * 100) / 100,
        reps,
        reviewedAt: new Date(now).toISOString(),
        due: new Date(now + interval * 86400000).toISOString(),
      };
    },

    isDue(entry, now = Date.now()) {
      if (!entry || !entry.due) return false;
      const t = new Date(entry.due).getTime();
      return Number.isFinite(t) && t <= now;
    },

    formatInterval(days) {
      if (days < 0.05) return "10 min";
      if (days <= 1.1) return "tomorrow";
      const d = Math.round(days);
      return `in ${d} days`;
    },

    formatDue(iso, now = Date.now()) {
      if (!iso) return "";
      const t = new Date(iso).getTime();
      if (!Number.isFinite(t)) return "";
      if (t <= now) return "due now";
      return new Date(t).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
    },

    dueCards(docsObj, recallIndex, now = Date.now()) {
      const due = [];
      for (const ch of recallIndex || []) {
        const rec = docsObj?.[ch.docId]?.recall;
        if (!rec) continue;
        ch.items.forEach((item, idx) => {
          const entry = rec[idx];
          if (ReaderSRS.isDue(entry, now)) {
            due.push({
              docId: ch.docId,
              out: ch.out,
              num: ch.num,
              title: ch.title,
              index: idx,
              question: item.question,
              answer: item.answer,
              entry,
            });
          }
        });
      }
      due.sort((a, b) => new Date(a.entry.due) - new Date(b.entry.due));
      return due;
    },
  };
  window.ReaderSRS = ReaderSRS;

  /* ── Maths (available on both index and chapter pages) ────────────────── */

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

  // Widgets and modals inject rendered chapter HTML after load — observe once.
  new MutationObserver((records) => {
    for (const r of records) {
      for (const node of r.addedNodes) {
        if (node.nodeType !== 1) continue;
        if (node.matches?.(".math-inline, .math-display")) typesetMath(node.parentNode);
        else if (node.querySelector?.(".math-inline, .math-display")) typesetMath(node);
      }
    }
  }).observe(document.body, { childList: true, subtree: true });

  /* ── Global search (Cmd+K / Ctrl+K / /) ───────────────────────────────── */

  function initGlobalSearch() {
    let modal = null;
    let input = null;
    let list = null;
    let countEl = null;
    let activeIdx = -1;
    let prevFocus = null;
    let currentHits = [];

    function esc(s) {
      return String(s).replace(/[&<>"']/g, (c) =>
        ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
      );
    }

    function ensureModal() {
      if (modal) return modal;
      modal = document.createElement("div");
      modal.id = "search-modal";
      modal.className = "modal-backdrop";
      modal.hidden = true;
      modal.innerHTML =
        '<div class="modal-dialog search-dialog" role="dialog" aria-modal="true" aria-label="Search course">' +
        '  <div class="search-head">' +
        '    <span class="search-ico" aria-hidden="true">⌕</span>' +
        '    <input id="search-input" type="search" autocomplete="off" spellcheck="false" ' +
        '           placeholder="Search chapters, sections, and 434 glossary terms…">' +
        '    <button type="button" class="icon-btn modal-close" aria-label="Close search">✕</button>' +
        '  </div>' +
        '  <div class="search-meta"><span id="search-count"></span><span>↑↓ navigate · ↵ open · Esc close</span></div>' +
        '  <ul id="search-results" class="search-results" role="listbox"></ul>' +
        '</div>';
      document.body.appendChild(modal);
      input = modal.querySelector("#search-input");
      list = modal.querySelector("#search-results");
      countEl = modal.querySelector("#search-count");

      modal.addEventListener("click", (e) => {
        if (e.target === modal || e.target.closest(".modal-close")) close();
      });
      input.addEventListener("input", () => runSearch(input.value));
      input.addEventListener("keydown", (e) => {
        if (e.key === "Escape") { e.preventDefault(); close(); return; }
        if (e.key === "ArrowDown") {
          e.preventDefault();
          if (currentHits.length) setActive((activeIdx + 1) % currentHits.length);
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          if (currentHits.length) setActive((activeIdx - 1 + currentHits.length) % currentHits.length);
        } else if (e.key === "Enter" && activeIdx >= 0 && currentHits[activeIdx]) {
          e.preventDefault();
          window.location.href = currentHits[activeIdx].href;
        }
      });
      return modal;
    }

    function setActive(i) {
      activeIdx = i;
      list.querySelectorAll("li").forEach((li, idx) => {
        li.classList.toggle("is-active", idx === i);
        if (idx === i) li.scrollIntoView({ block: "nearest" });
      });
    }

    function scoreText(hay, tokens) {
      const low = hay.toLowerCase();
      let score = 0;
      for (const tok of tokens) {
        const pos = low.indexOf(tok);
        if (pos === -1) return 0;
        score += pos === 0 ? 12 : (low[pos - 1] === " " || low[pos - 1] === "-" ? 8 : 4);
      }
      return score;
    }

    function runSearch(raw) {
      const idx = window.READER_SEARCH;
      if (!idx) {
        countEl.textContent = "Search index still loading…";
        list.innerHTML = "";
        return;
      }
      const q = raw.trim().toLowerCase();
      const tokens = q.split(/\s+/).filter(Boolean);
      const hits = [];

      if (!tokens.length) {
        // Show quick-jump highlights when empty
        for (const d of idx.docs.slice(0, 12)) {
          hits.push({
            score: 1,
            kind: d.kind,
            title: (d.num ? `${d.num} · ` : "") + d.title,
            sub: d.part || d.kind,
            href: d.out,
          });
        }
        countEl.textContent = `${idx.docs.length} documents · ${idx.glossary.length} glossary terms`;
      } else {
        for (const d of idx.docs) {
          const base = `${d.num} ${d.title} ${d.fullTitle} ${d.part} ${d.kind}`;
          const s = scoreText(base, tokens);
          if (s) {
            hits.push({
              score: s + 20,
              kind: d.kind,
              title: (d.num ? `${d.num} · ` : "") + d.title,
              sub: d.part || d.kind,
              href: d.out,
            });
          }
          for (const h of d.headings || []) {
            const hs = scoreText(`${h.text} ${d.num} ${d.title}`, tokens);
            if (hs && scoreText(h.text, tokens)) {
              hits.push({
                score: hs + 10,
                kind: "Section",
                title: h.text,
                sub: (d.num ? `${d.num} · ` : "") + d.title,
                href: `${d.out}#${h.id}`,
              });
            }
          }
        }
        for (const g of idx.glossary) {
          const ts = scoreText(g.term, tokens);
          const ds = ts ? ts + 16 : scoreText(`${g.term} ${g.def}`, tokens);
          if (ds) {
            hits.push({
              score: ds,
              kind: "Glossary",
              title: g.term,
              sub: g.def,
              href: g.out,
            });
          }
        }
        hits.sort((a, b) => b.score - a.score);
        countEl.textContent = `${hits.length} match${hits.length === 1 ? "" : "es"}`;
      }

      currentHits = hits.slice(0, 30);
      activeIdx = currentHits.length ? 0 : -1;
      if (!currentHits.length) {
        list.innerHTML = '<li class="search-empty">No matching chapters, headings, or glossary terms.</li>';
        return;
      }
      list.innerHTML = currentHits
        .map(
          (h, i) =>
            `<li class="${i === 0 ? "is-active" : ""}" role="option">` +
            `<a href="${esc(h.href)}">` +
            `<span class="search-kind">${esc(h.kind)}</span>` +
            `<span class="search-main"><strong>${esc(h.title)}</strong>` +
            (h.sub ? `<small>${esc(h.sub)}</small>` : "") +
            `</span></a></li>`
        )
        .join("");
    }

    function open() {
      prevFocus = document.activeElement;
      ensureModal().hidden = false;
      document.body.classList.add("modal-open");
      input.value = "";
      runSearch("");
      input.focus();
    }

    function close() {
      if (!modal || modal.hidden) return;
      modal.hidden = true;
      document.body.classList.remove("modal-open");
      if (prevFocus && typeof prevFocus.focus === "function") prevFocus.focus();
    }

    const btn = document.getElementById("search-btn");
    if (btn) btn.addEventListener("click", open);

    document.addEventListener("keydown", (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (modal && !modal.hidden) close();
        else open();
        return;
      }
      if (e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const tag = (e.target && e.target.tagName) || "";
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || e.target?.isContentEditable) return;
        e.preventDefault();
        open();
      }
    });
  }

  const TRACKS = [
    { id: "all", label: "All", note: "Complete curriculum in scheduled reading order." },
    { id: "core", label: "Computational Core", note: "Molecular, regulation, pop-gen, statistics, sequencing, functional & human genomics." },
    { id: "sca12", label: "SCA12 Sprint", note: "Direct prerequisite spine into Part D (neurobiology, PP2A, repeat expansions & SCA12)." },
    { id: "practice", label: "Practice & Reference", note: "Problem sets, computational labs, question banks & reference sheets." },
  ];
  let reviewModal = null;

  initGlobalSearch();

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

  function openReviewModal() {
    const queue = ReaderSRS.dueCards(Store.docs(), window.READER_RECALL || []);
    if (!queue.length) {
      window.toast("No recall cards are due right now.");
      return;
    }

    if (!reviewModal) {
      reviewModal = document.createElement("div");
      reviewModal.id = "review-modal";
      reviewModal.className = "modal-backdrop";
      reviewModal.hidden = true;
      reviewModal.innerHTML =
        '<div class="modal-dialog review-dialog" role="dialog" aria-modal="true" aria-label="Due recall review">' +
        '  <div class="review-head">' +
        '    <div class="review-progress" id="review-progress"></div>' +
        '    <button type="button" class="icon-btn modal-close" aria-label="Close review">✕</button>' +
        '  </div>' +
        '  <div class="review-body" id="review-body"></div>' +
        '</div>';
      document.body.appendChild(reviewModal);
      reviewModal.addEventListener("click", (e) => {
        if (e.target === reviewModal || e.target.closest(".modal-close")) closeReview();
      });
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && reviewModal && !reviewModal.hidden) closeReview();
      });
    }

    let pos = 0;
    let reviewed = 0;
    const bodyEl = reviewModal.querySelector("#review-body");
    const progEl = reviewModal.querySelector("#review-progress");

    function closeReview() {
      if (!reviewModal || reviewModal.hidden) return;
      reviewModal.hidden = true;
      document.body.classList.remove("modal-open");
      renderIndexState();
    }

    function renderCard() {
      if (pos >= queue.length) {
        progEl.textContent = "Session complete";
        bodyEl.innerHTML =
          `<div class="callout callout-good"><strong>Reviewed ${reviewed} card${reviewed === 1 ? "" : "s"}.</strong> ` +
          `All due recall items are rescheduled.</div>` +
          `<div class="btn-row" style="margin-top:.85rem"><button type="button" class="btn btn-primary" id="review-done">Done</button></div>`;
        bodyEl.querySelector("#review-done").addEventListener("click", closeReview);
        return;
      }

      const card = queue[pos];
      const badge = card.num ? (card.num.match(/^\d/) ? `Ch ${card.num}` : card.num) : "";
      progEl.innerHTML =
        `<span>Card <strong>${pos + 1}</strong> of ${queue.length}</span>` +
        `<a class="review-source" href="${card.out}">${badge ? badge + " · " : ""}${card.title} ↗</a>`;

      bodyEl.innerHTML = "";
      const qEl = document.createElement("div");
      qEl.className = "recall-q review-q";
      qEl.innerHTML = card.question;

      const aEl = document.createElement("div");
      aEl.className = "recall-a";
      aEl.innerHTML = card.answer;
      aEl.hidden = true;

      const rateRow = document.createElement("div");
      rateRow.className = "rate-row";
      rateRow.hidden = true;

      const label = document.createElement("span");
      label.className = "rate-label";
      label.textContent = "Rate recall:";
      rateRow.appendChild(label);

      for (const rating of ReaderSRS.RATINGS) {
        const preview = ReaderSRS.computeNext(card.entry, rating);
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "btn";
        btn.innerHTML =
          `${rating[0].toUpperCase() + rating.slice(1)} <small class="rate-hint">${ReaderSRS.formatInterval(preview.interval)}</small>`;
        btn.addEventListener("click", () => {
          const docState = Store.doc(card.docId);
          const rec = Object.assign({}, docState.recall || {});
          rec[card.index] = ReaderSRS.computeNext(rec[card.index], rating);
          Store.doc(card.docId, { recall: rec });
          reviewed += 1;
          pos += 1;
          renderCard();
        });
        rateRow.appendChild(btn);
      }

      const revealBtn = document.createElement("button");
      revealBtn.type = "button";
      revealBtn.className = "btn btn-primary";
      revealBtn.textContent = "Show answer";
      revealBtn.addEventListener("click", () => {
        aEl.hidden = false;
        rateRow.hidden = false;
        revealBtn.remove();
        typesetMath(aEl);
      });

      bodyEl.append(qEl, revealBtn, aEl, rateRow);
      typesetMath(qEl);
    }

    reviewModal.hidden = false;
    document.body.classList.add("modal-open");
    renderCard();
  }

  function exportProgress() {
    const payload = {
      app: "learn-genomics-reader",
      version: 1,
      exportedAt: new Date().toISOString(),
      data: Store.all(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `learn-genomics-progress-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    window.toast("Progress exported as JSON.");
  }

  function importProgressFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result || ""));
        const data = parsed && typeof parsed.data === "object" && parsed.app === "learn-genomics-reader"
          ? parsed.data
          : parsed;
        if (!data || typeof data !== "object" || (data.docs && typeof data.docs !== "object")) {
          throw new Error("invalid schema");
        }
        const existingDocs = Object.keys(Store.docs()).length;
        if (existingDocs > 0) {
          const ok = window.confirm(
            `Replace local progress (${existingDocs} tracked documents) with the imported file?`
          );
          if (!ok) return;
        }
        Store.save(data);
        renderIndexState();
        window.toast("Progress imported.");
      } catch {
        window.toast("Could not import progress — file is not a valid reader backup.");
      }
    };
    reader.readAsText(file);
  }

  function applyTrackFilter(trackId) {
    const active = TRACKS.some((t) => t.id === trackId) ? trackId : "all";
    Store.prefs({ track: active });

    const bar = document.getElementById("track-bar");
    if (bar) {
      bar.querySelectorAll("[data-track]").forEach((btn) => {
        const on = btn.dataset.track === active;
        btn.classList.toggle("is-active", on);
        btn.setAttribute("aria-selected", String(on));
      });
      const noteEl = bar.querySelector(".track-note");
      const meta = TRACKS.find((t) => t.id === active);
      if (noteEl && meta) noteEl.textContent = meta.note;
    }

    document.querySelectorAll(".doc-row, .aux-list li").forEach((li) => {
      const tracks = (li.dataset.tracks || "all").split(/\s+/);
      li.hidden = active !== "all" && !tracks.includes(active);
    });

    const docs = Store.docs();
    document.querySelectorAll(".part-block").forEach((sec) => {
      const visRows = Array.from(sec.querySelectorAll(".doc-row:not([hidden])"));
      sec.hidden = visRows.length === 0;
      const prog = sec.querySelector("[data-part-progress]");
      if (prog && visRows.length) {
        const done = visRows.filter((r) => docs[r.dataset.doc]?.done).length;
        const pct = Math.round((done / visRows.length) * 100);
        const fill = prog.querySelector(".part-progress-bar > span");
        const label = prog.querySelector(".part-progress-text");
        if (fill) fill.style.width = `${pct}%`;
        if (label) label.textContent = done ? `${done} / ${visRows.length} read` : `${visRows.length} ch`;
        prog.classList.toggle("is-complete", done === visRows.length);
      }
    });

    document.querySelectorAll("section.aux").forEach((sec) => {
      const anyVisible = !!sec.querySelector(".aux-list li:not([hidden])");
      sec.hidden = !anyVisible;
    });
  }

  function pickContinueTarget(docs, rows) {
    // 1. Most recently visited unfinished chapter
    let bestUnfinished = null;
    let bestDone = null;
    rows.forEach((row, idx) => {
      const id = row.dataset.doc;
      const s = docs[id];
      if (!s || !s.lastAt) return;
      const ts = new Date(s.lastAt).getTime();
      const link = row.querySelector("a");
      const num = row.querySelector(".doc-num")?.textContent?.trim() || "";
      const title = row.querySelector(".doc-title")?.textContent?.trim() || "";
      const item = { idx, href: link?.getAttribute("href") || "", num, title, ts, percent: s.percent || 0 };
      if (!s.done && (s.percent || 0) > 0) {
        if (!bestUnfinished || ts > bestUnfinished.ts) bestUnfinished = item;
      } else if (s.done) {
        if (!bestDone || ts > bestDone.ts) bestDone = item;
      }
    });

    if (bestUnfinished) {
      const prefix = bestUnfinished.num ? `${bestUnfinished.num} · ` : "";
      return {
        href: bestUnfinished.href,
        label: `Continue ${prefix}${bestUnfinished.title}`,
        meta: `${bestUnfinished.percent}% read`,
      };
    }
    if (bestDone && rows[bestDone.idx + 1]) {
      const nextRow = rows[bestDone.idx + 1];
      const num = nextRow.querySelector(".doc-num")?.textContent?.trim() || "";
      const title = nextRow.querySelector(".doc-title")?.textContent?.trim() || "";
      return {
        href: nextRow.querySelector("a")?.getAttribute("href") || "",
        label: `Up next: ${num ? num + " · " : ""}${title}`,
        meta: "next in reading order",
      };
    }
    const first = rows[0];
    if (first) {
      return {
        href: first.querySelector("a")?.getAttribute("href") || "ch-00-the-whole-story.html",
        label: "Start Chapter 00",
        meta: "the whole story first",
      };
    }
    return null;
  }

  function renderIndexState() {
    const docs = Store.docs();
    const rows = Array.from(document.querySelectorAll(".doc-row"));
    let read = 0, started = 0, called = 0, right = 0, scheduled = 0, dueTotal = 0;
    let nextDueTs = Infinity;

    rows.forEach((row) => {
      const s = docs[row.dataset.doc];
      const slot = row.querySelector("[data-state]");
      if (!slot) return;
      if (!s) {
        slot.innerHTML = "";
        return;
      }

      if (s.done) read += 1;
      else if (s.percent > 3) started += 1;
      if (s.ledger) {
        called += s.ledger.made || 0;
        right += s.ledger.right || 0;
      }
      let docDue = 0;
      if (s.recall) {
        for (const entry of Object.values(s.recall)) {
          scheduled += 1;
          if (ReaderSRS.isDue(entry)) {
            dueTotal += 1;
            docDue += 1;
          } else if (entry?.due) {
            const t = new Date(entry.due).getTime();
            if (Number.isFinite(t) && t < nextDueTs) nextDueTs = t;
          }
        }
      }

      const bits = [];
      if (s.done) bits.push('<span class="pill pill-done">read</span>');
      else if (s.percent > 3) bits.push(`<span class="pill">${s.percent}%</span>`);
      if (s.visits > 1) bits.push(`<span class="pill">×${s.visits}</span>`);
      if (docDue > 0) bits.push(`<span class="pill pill-warn">${docDue} due</span>`);
      if (s.diagnostic) {
        const d = s.diagnostic;
        const good = d.score === d.total;
        bits.push(
          `<span class="pill ${good ? "pill-good" : "pill-warn"}">${d.score}/${d.total}</span>`
        );
      }
      slot.innerHTML = bits.join("");
    });

    // Action bar: Continue CTA, Review due cards, Export / Import JSON
    const actionsEl = document.getElementById("index-actions");
    if (actionsEl) {
      const cont = pickContinueTarget(docs, rows);
      const dueList = ReaderSRS.dueCards(docs, window.READER_RECALL || []);
      const dueCount = dueList.length;

      actionsEl.innerHTML = "";
      if (cont && cont.href) {
        const a = document.createElement("a");
        a.className = "btn btn-primary index-cta";
        a.href = cont.href;
        a.innerHTML = `${cont.label} <span class="cta-meta">${cont.meta}</span>`;
        actionsEl.appendChild(a);
      }

      if (dueCount > 0) {
        const revBtn = document.createElement("button");
        revBtn.type = "button";
        revBtn.className = "btn btn-do";
        revBtn.textContent = `Review ${dueCount} due card${dueCount === 1 ? "" : "s"}`;
        revBtn.addEventListener("click", openReviewModal);
        actionsEl.appendChild(revBtn);
      } else if (scheduled > 0 && Number.isFinite(nextDueTs)) {
        const nextNote = document.createElement("span");
        nextNote.className = "pill";
        nextNote.textContent = `0 due today · next ${ReaderSRS.formatDue(new Date(nextDueTs).toISOString())}`;
        actionsEl.appendChild(nextNote);
      }

      const ioWrap = document.createElement("span");
      ioWrap.className = "index-io";

      const expBtn = document.createElement("button");
      expBtn.type = "button";
      expBtn.className = "btn btn-subtle";
      expBtn.title = "Download local reading progress and recall schedule as JSON";
      expBtn.textContent = "Export progress";
      expBtn.addEventListener("click", exportProgress);

      const impInput = document.createElement("input");
      impInput.type = "file";
      impInput.accept = "application/json,.json";
      impInput.hidden = true;
      impInput.addEventListener("change", () => {
        importProgressFile(impInput.files?.[0]);
        impInput.value = "";
      });

      const impBtn = document.createElement("button");
      impBtn.type = "button";
      impBtn.className = "btn btn-subtle";
      impBtn.title = "Restore reading progress from a previously exported JSON file";
      impBtn.textContent = "Import";
      impBtn.addEventListener("click", () => impInput.click());

      ioWrap.append(expBtn, impBtn, impInput);
      actionsEl.appendChild(ioWrap);
    }

    // Track filter bar (initialize buttons once)
    const trackBar = document.getElementById("track-bar");
    if (trackBar && !trackBar.dataset.ready) {
      trackBar.dataset.ready = "1";
      const tabs = document.createElement("div");
      tabs.className = "track-tabs";
      for (const t of TRACKS) {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "track-tab";
        b.role = "tab";
        b.dataset.track = t.id;
        b.textContent = t.label;
        b.addEventListener("click", () => applyTrackFilter(t.id));
        tabs.appendChild(b);
      }
      const note = document.createElement("p");
      note.className = "track-note";
      trackBar.append(tabs, note);
    }
    applyTrackFilter(Store.prefs().track || "all");

    const summary = document.getElementById("index-summary");
    if (!summary) return;
    if (!read && !started && !scheduled) {
      summary.innerHTML =
        '<p class="muted">Nothing read yet. Progress, diagnostic scores and scheduled ' +
        "recall cards will appear here as you go — all of it stored in this browser (and exportable above).</p>";
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
         <div class="stat"><span class="stat-val">${scheduled}${dueTotal ? " (" + dueTotal + " due)" : ""}</span>
           <span class="stat-key">recall cards scheduled</span></div>
       </div>`;
  }
})();
