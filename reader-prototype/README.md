# The reader

The whole course, compiled into a browsable site with the interactive layer that costs
nothing per chapter — because the course already wrote all of it.

```bash
cd reader-prototype
node verify_interactions.js
python3 build.py
python3 verify.py
open dist/index.html
```

No `npm install`, no virtualenv, no third-party Python packages. Python 3 and a browser.

| | |
|---|---|
| Input | 124 markdown documents, **read-only** — nothing in the course is ever written to |
| Output | 126 pages + assets, works from `file://` and from a GitHub Pages subpath |
| Source | 47,273 lines across twenty-one implementation and model-test files |
| Build | ~4 s, byte-reproducible |

```
documents  124        67 chapters · 7 statistics · 17 problem sets
                      13 labs · 15 question banks · 5 reference
glossary   434 linkable terms, 5,030 hovercards placed
links      3,558 cross-document links resolved, 0 dead
mentions   170 bare Ch/lab/Part references auto-linked
widgets    243 mounted across the course
```

---

## The floor

Every chapter gets four things, and none of them required new content:

| | Built from | Result |
|---|---|---|
| **Glossary hovercards** | `GLOSSARY.md` | 5,030 placed, first occurrence per section |
| **Misconception diagnostic** | that chapter's own misconceptions table | 694 rows became distractors |
| **Recall queue** | that chapter's folded Check-yourself answers | 372 Q/As, scheduled |
| **Navigation** | the `.md` links already in the prose, plus 170 bare mentions | 3,558 resolved, 0 dead |
| **Practice pointers** | labs' `Before this:` + `Covers Ch NN` lines | 45 pointers on 31 chapters — labs, problem sets, question banks |

Two of those surprised me. The chapters already cross-reference each other thousands of times,
so building every document at once turns those from decoration into the site's navigation with
no authoring at all.

And the practice pointers close a real gap. Every lab names the chapters it needs; every problem
set opens with `Covers Ch NN-NN`. But the pointer only ran one way — **not one of the 62 genetics
chapters linked to a lab or a problem set**, so reading straight through never surfaced either.
Inverting that mapping puts "Ready after this chapter" at the foot of the 31 chapters that earn
one, and tags the index with where each lab sits.

Chapter 00 carries the original six bespoke widgets. Seventy-three uncommitted review labs now add
a Hero Lab to every other chapter and statistics module—including S5–S7 and the five-module SCA12
deep dive—through the same sidecar placement system. Sixteen deliberately selected changed-context
challenges now add three independent transfer cases apiece where transfer practice has high
pedagogical leverage: Chapter 14's mapping challenge plus fifteen new challenges spanning molecular,
transmission, population, quantitative, genomic, clinical, and Bayesian reasoning. Together, those
95 authored interactions give all 74 chapter/statistics modules a substantial interactive experience
without forcing a redundant transfer quiz into every chapter. The current manifest exposes 410
explicit objective-to-state mappings across 70 objective-mapped interactions; the 19 earlier Hero
Labs remain incomplete. The original Chapter 00 interactions and course-wide floor also remain
outside that newer manifest. See
[`INTERACTIVE-CURRICULUM-PLAN.md`](INTERACTIVE-CURRICULUM-PLAN.md) for the complete coverage plan.

## Re-reading is a first-class case

Chapter 00 tells you outright to *"read it again after Part 4"*. So nothing here may punish a
second visit.

- **Resume is offered, never performed.** A bar appears saying where you got to, with
  *Jump back there* and *Start from the top*. Being thrown 4,000px down a chapter you
  deliberately reopened at the top is the most hostile thing a reader can do, and it is what
  the single-chapter version did automatically.
- **Practice mode** (`⟳` in the top bar, persists across the whole course) turns every
  prediction gate off and stops anything auto-starting. Widgets become tools you can just use.
- **A finished widget stays finished.** Return to a chapter whose diagnostic you completed and
  it shows *"5/5, scored 24 Aug"* with a *Run it again* button — it does not silently restart a
  quiz you already passed. Re-running draws **a different five claims**, so it keeps testing
  something.
- **State is per document.** Progress, scroll position, visit count, diagnostic score and
  recall ratings are scoped to the page they belong to; one shared position across 126 pages
  would be wrong on all of them.
- **The index shows all of it** — read / in-progress / revisit count / diagnostic score — so
  you can see where you have been before deciding where to go.

## How it works

```
part-*/  problem-sets/  labs/  question-banks/  reference/  GLOSSARY.md
                              │  (read-only)
                              ▼
   build.py ──▶ discover ──▶ render ──▶ extract ──▶ link glossary
                    │                                    │
              reading order                        resolve .md links
              (README schedule)                     resolve images
                              │
                              ▼
                    dist/  126 pages, flat
```

Output is flat — every page sits directly in `dist/` and reaches siblings and assets by bare
filename, which is what keeps it working from `file://`.

**Reading order** is computed, not hard-coded: chapters sort by number (with `20A` between
`20` and `21`), and the seven statistics chapters are inserted at the points `README.md`
schedules them. The result matches the published linear order exactly. Where a chapter
declares a statistics prerequisite the order has *not* yet supplied, the index flags it — the
mechanism for [REVIEW-STATE.md](../REVIEW-STATE.md) §A1. Against the currently declared
headers nothing is unmet, so nothing shows.

## The renderer

`render.py` covers exactly the subset of markdown the curriculum uses. Ten features were added
after an exhaustive sweep of all 124 documents, because **Chapter 00 alone had exercised barely
half the syntax in the course**:

| Added | Because |
|---|---|
| Ordered lists, nesting, indented continuation | 203 items across 43 files, rendered as loose paragraphs |
| **LaTeX maths** (KaTeX, vendored) | 205 display blocks + ~740 inline spans — the mathematical core of Parts 5–11 |
| CommonMark delimiter-run emphasis | `**2*s***` produced *crossed tags*; 531 stray asterisks course-wide |
| Backslash escapes | `CYP2D6\*4` printed its backslash and broke the surrounding bold |
| Multi-backtick code spans | 336 occurrences |
| Fence info-string rule | ` ```` ``` ```` ` was read as a fence opener and **inverted code and prose for a whole page** |
| Table cells: escaped and code-span pipes | `P(x \| y)` mis-columned an entire table |
| Bare `\|` lines | `\|D'\| is normalised` was **silently dropped** |
| Images | 6, now copied into `assets/img/` |
| Single-paragraph list unwrap | a greedy match produced `<li>a</p><p>b</li>` |

Two of those were content loss and one inverted an entire page. None was visible from
Chapter 00.

### Verified

| Check | Result |
|---|---|
| Well-formed markup, all 126 pages | **0 errors** |
| Literal `**` left in prose | **0** (was 531) |
| Residual backslash escapes | **0** |
| Unrendered `[text](url)` | **0** |
| Dead links | **0 of 3,558** |
| Distinct source words reaching the page | **99.77%** |

The 0.23% is tag names (`details`, `summary`), fence labels (`bash`), and the
`Before this · Time` header that moves into the top bar.

## Files

| File | Lines | |
|---|---:|---|
| `build.py` | 998 | Discovery, reading order, link/image resolution, page and index assembly |
| `verify.py` | 171 | Pre-publish gate: broken links, case slips, markup damage, licences |
| `render.py` | 779 | Markdown renderer, glossary linker, section extraction |
| `src/reader.css` | 5,952 | Reading surface, index, themes, and Hero Lab visual language |
| `src/reader.js` | 481 | TOC, progress, resume, practice mode, hovercards, maths, per-doc store |
| `src/interactions.js` | 2,114 | Shared interaction kit, four cross-domain pilots, and the three-stage Chapter 14 transfer challenge |
| `src/interactions-foundations.js` | 2,373 | Parts 0–1 and S1–S2 Hero Labs with pure scientific models |
| `src/interactions-transmission.js` | 1,767 | Part 2 Hero Labs for Chapters 09–13 and 15 |
| `src/interactions-instability.js` | 2,974 | Part 3 Hero Labs for Chapters 16–20A with pure scientific models |
| `src/interactions-regulation.js` | 2,990 | Part 4 Hero Labs for Chapters 21–25A with pure scientific models |
| `src/interactions-population.js` | 2,378 | Part 5 Hero Labs for Chapters 26–29 with pure scientific models |
| `src/interactions-quantitative.js` | 2,484 | S3 and Part 6 Hero Labs for sampling and Chapters 30–32 with pure scientific models |
| `src/interactions-evolution.js` | 2,893 | S4 and Part 7 Hero Labs for hypothesis testing and Chapters 33–35A |
| `src/interactions-methods.js` | 2,202 | Part 8 Hero Labs for molecular methods, genetic screens, and genome editing |
| `src/interactions-genomics.js` | 3,789 | Parts 9–10 Hero Labs for genome representation, sequencing, analysis, and functional genomics |
| `src/interactions-human.js` | 3,398 | Parts 11–12 Hero Labs for human, clinical, cancer, practice, and ethics topics |
| `src/interactions-advanced-stats.js` | 1,516 | S5–S7 Hero Labs for regression, likelihood, Bayes, multiplicity, and high-dimensional data |
| `src/interactions-sca12.js` | 1,891 | Part D Hero Labs for neuronal systems, PP2A, repeat expansion, SCA12 mechanisms, and clinical evidence |
| `src/interactions-transfer.js` | 1,549 | Fifteen selective changed-context challenges, 45 fixtures, shared progressive-evidence shell, and executable portfolio audit |
| `src/widgets.js` | 1,093 | Predict mechanic, ledger, floor widgets, and pilot registration API |
| `src/placement.json` | 865 | Bespoke widgets, keyed by chapter and exact heading |
| `verify_interactions.js` | 3,481 | Scientific invariants, control-space properties, and registration checks for all Hero Labs and all sixteen transfer challenges |
| `vendor/` | — | mermaid, KaTeX + 20 woff2 faces — vendored so the build works offline |

## Extending it

**A chapter lab:** register a definition in the relevant `src/interactions*.js` module, then add an
entry to `src/placement.json` under the chapter's filename stem. The reader supplies the shared
prediction, ledger, state, element and statistic helpers. If a lab throws, it degrades to a
message in place and the page is unaffected. The Python build copies the source modules as
ordinary local scripts, preserving the offline `file://` build.

**A floor widget:** add it to `src/widgets.js`; that file owns interactions intended to appear
throughout the reader rather than topic-specific scientific models.

**A chapter:** nothing to do. `discover()` walks the course; a new file appears on the index,
in the reading order, with the floor already on it.

## Publishing

`python3 verify.py` is the gate the deploy runs. It fails on an unresolved cross-reference, a
link whose case only works on macOS, a missing figure, markup damage from a renderer regression,
ill-formed HTML, an absolute path that would escape a project subpath, or a vendored licence gone
missing. Each check exists because something got through once. See [`../DEPLOY.md`](../DEPLOY.md)
for GitHub Pages.

## Known limits

- **localStorage only.** Progress and scheduled recall live in one browser. Real spaced
  repetition needs sync; this is the single biggest gap between what the recall queue gestures
  at and what would move retention.
- **No Pyodide.** The labs provide deterministic JavaScript models for HWE, drift, BWT/FM search,
  likelihoods, and count models, but notebook-style free-form computation remains unbuilt.
- **The ledger counts every prediction equally**, and most are 1-in-4 choices, so a random
  clicker scores 25%. It is motivational, not diagnostic.
- **The maths heuristic** treats `$…$` as TeX unless the span contains a real word. It gets all
  743 observed spans right, including the one currency range in Ch 40, but it is a heuristic.
- **The Chapter 00 drift widget uses haploid selection**, while the Part 5 sandbox now exposes
  diploid genotype fitness and dominance explicitly.
- **Bespoke depth is still under review.** Every module now has a substantial authored interaction,
  but the 73 new Hero Labs remain uncommitted pending course-owner review and learner testing.
