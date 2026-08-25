# The reader

The whole course, compiled into a browsable site with the interactive layer that costs
nothing per chapter — because the course already wrote all of it.

```bash
cd reader-prototype && python3 build.py && python3 verify.py && open dist/index.html
```

No `npm install`, no virtualenv, no third-party Python packages. Python 3 and a browser.

| | |
|---|---|
| Input | 115 markdown documents, **read-only** — nothing in the course is ever written to |
| Output | 117 pages + assets, works from `file://` and from a GitHub Pages subpath |
| Source | 3,874 lines across seven files |
| Build | ~4 s, byte-reproducible |

```
documents  115        62 chapters · 7 statistics · 16 problem sets
                      11 labs · 14 question banks · 5 reference
glossary   413 linkable terms, 4,514 hovercards placed
links      3,038 cross-document links resolved, 0 dead
mentions   145 bare Ch/lab/Part references auto-linked
widgets    144 mounted across the course
```

---

## The floor

Every chapter gets four things, and none of them required new content:

| | Built from | Result |
|---|---|---|
| **Glossary hovercards** | `GLOSSARY.md` | 4,514 placed, first occurrence per section |
| **Misconception diagnostic** | that chapter's own misconceptions table | 643 rows became distractors |
| **Recall queue** | that chapter's folded Check-yourself answers | 348 Q/As, scheduled |
| **Navigation** | the `.md` links already in the prose, plus 145 bare mentions | 3,038 resolved, 0 dead |
| **Practice pointers** | labs' `Before this:` + `Covers Ch NN` lines | 41 pointers on 28 chapters — labs, problem sets, question banks |

Two of those surprised me. The chapters already cross-reference each other thousands of times,
so building every document at once turns those from decoration into the site's navigation with
no authoring at all.

And the practice pointers close a real gap. Every lab names the chapters it needs; every problem
set opens with `Covers Ch NN-NN`. But the pointer only ran one way — **not one of the 62 genetics
chapters linked to a lab or a problem set**, so reading straight through never surfaced either.
Inverting that mapping puts "Ready after this chapter" at the foot of the 25 chapters that earn
one, and tags the index with where each lab sits.

Chapter 00 additionally carries six bespoke widgets declared in `src/placement.json`. Every
other chapter runs on the floor alone — which is the point: **the floor is what scales.**

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
  recall ratings are scoped to the page they belong to; one shared position across 117 pages
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
                    dist/  117 pages, flat
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
after an exhaustive sweep of all 115 documents, because **Chapter 00 alone had exercised barely
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
| Well-formed markup, all 117 pages | **0 errors** |
| Literal `**` left in prose | **0** (was 531) |
| Residual backslash escapes | **0** |
| Unrendered `[text](url)` | **0** |
| Dead links | **0 of 3,038** |
| Distinct source words reaching the page | **99.77%** |

The 0.23% is tag names (`details`, `summary`), fence labels (`bash`), and the
`Before this · Time` header that moves into the top bar.

## Files

| File | Lines | |
|---|---:|---|
| `build.py` | 664 | Discovery, reading order, link/image resolution, page and index assembly |
| `verify.py` | 168 | Pre-publish gate: broken links, case slips, markup damage, licences |
| `render.py` | 779 | Markdown renderer, glossary linker, section extraction |
| `src/reader.css` | 671 | Reading surface, index, both themes |
| `src/reader.js` | 481 | TOC, progress, resume, practice mode, hovercards, maths, per-doc store |
| `src/widgets.js` | 1,056 | Predict mechanic, ledger, and the eight widgets |
| `src/placement.json` | 42 | Bespoke widgets, keyed by chapter |
| `vendor/` | — | mermaid, KaTeX + 20 woff2 faces — vendored so the build works offline |

## Extending it

**A widget:** write a function in `src/widgets.js`, register it in `REGISTRY`, add an entry to
`src/placement.json` under the chapter's filename stem. If it throws, it degrades to a message
in place and the page is unaffected.

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
- **No Pyodide.** Still the biggest unbuilt idea. It belongs in Ch 26's χ² test, Ch 27's drift
  and Ch 42's BWT.
- **The ledger counts every prediction equally**, and most are 1-in-4 choices, so a random
  clicker scores 25%. It is motivational, not diagnostic.
- **The maths heuristic** treats `$…$` as TeX unless the span contains a real word. It gets all
  743 observed spans right, including the one currency range in Ch 40, but it is a heuristic.
- **The drift widget uses haploid selection**, correct for Ch 00 but not for Part 5.
- **Only Chapter 00 has bespoke widgets.** The floor is uniform; depth is not.
