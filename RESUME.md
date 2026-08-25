# Part D (SCA12 deep-dive track) build — COMPLETE 2026-08-25

The build described below finished: all 9 deliverables authored, adversarially
fact-checked (107 findings fixed in round 1), a completeness-critic patch round closed
10 further gaps (tremor mechanism honesty box, B55β neuronal-function section, hypothesis
A′′ translational-control row, clinical problems in ps-17, FXTAS/SCA27B differential,
TETRAS, somatic-mosaicism measurement, management section, label harmonisation), and a
diff-scoped re-verification caught and fixed 16 findings in the patches themselves.
Integration done: README, STUDY-GUIDE, GLOSSARY (21 terms), verified-facts (28 sections),
further-reading (82 papers), 6 back-links. Reader build + verify PASS (126 pages, 0 dead
links). All changes uncommitted, awaiting review. Known open items (annotated in place,
not resolved): the PPP2R2B gene-span GENCODE-vs-RefSeq disagreement; overlap between the
pre-existing SCA12-thresholds verified-facts section and the new per-source grids; the
contested pathogenic floor (51 vs ≥43 vs ≥46) is taught as contested, per the sources.
The section below is retained as the historical pause record.

---

# (historical) PAUSED: Part D (SCA12 deep-dive track) build — 2026-08-25

A second build is in progress and was paused mid-run (session usage limit). State:

**All 9 deliverables are drafted on disk** (uncommitted): `part-D-sca12/D1`–`D5`,
`labs/lab-11-repeat-genotyping.md`, `labs/lab-12-expression-and-isoforms.md` (+ 2 PNGs in
`labs/data/`), `problem-sets/ps-17-repeat-disorders-and-sca12.md`, `question-banks/qb-part-D.md`.
Web-verified fact sheets and the style/coverage contracts live in the session scratchpad:
`/private/tmp/claude-501/-Users-shnksi-learn-genomics/9764e46c-06d6-42e3-96b6-547a46f69f66/scratchpad/sca12/`
(FACTS-sca12, FACTS-repeat-disorders, FACTS-neuro-pp2a, FACTS-methods, STYLE-CONTRACT, COVERAGE).
Because /tmp is volatile, a durable copy was made at `.build-state/sca12-scratch/` (gitignored).
If the /tmp path is gone on resume, restore it first:
`mkdir -p <tmp-path> && cp .build-state/sca12-scratch/* <tmp-path>/` — the resume script's agents
read the /tmp path.

**Done:** scouts, all 4 research sheets, all 9 authors, most per-file verify+fix passes
(D5 confirmed fixed; a qb-part-D blocker about promoter-vs-5'UTR placement of the repeat was
found and was being fixed). `reference/verified-facts.md` has partial additions.

**Not done:** last few verify/fix stages (lab-12 verify was in flight), the completeness
critic, the link-integrity sweep, and the whole integration step (README, STUDY-GUIDE,
GLOSSARY, verified-facts/further-reading merge, back-links from Ch 11/16/48/54/55/57,
reader-prototype manifest check). Do not treat the drafts as verified until those run.

**To resume** (completed stages return instantly from cache; only unfinished work re-runs):
```
Workflow({
  scriptPath: "/Users/shnksi/.claude/projects/-Users-shnksi-learn-genomics/9764e46c-06d6-42e3-96b6-547a46f69f66/workflows/scripts/sca12-course-extension-wf_4af06f32-a34.js",
  resumeFromRunId: "wf_4af06f32-a34"
})
```
Journal of every completed agent result:
`/Users/shnksi/.claude/projects/-Users-shnksi-learn-genomics/9764e46c-06d6-42e3-96b6-547a46f69f66/subagents/workflows/wf_4af06f32-a34/journal.jsonl`

---

# Build complete

**This file can be deleted.** It tracked a multi-session build that is now finished. Kept only
as a record of what was verified and what to re-check as the field moves.

Completed 2026-08-13.

---

## What was built

| Deliverable | Count | Words |
|---|---:|---:|
| Chapters (00–58, 13 parts) | 59 | 369,933 |
| Problem sets, worked solutions | 11 | 45,196 |
| Computational labs | 11 | 34,094 |
| Question banks (839 Anki cards) | 13 | 69,319 |
| Glossary (397 terms) | 1 | 14,398 |
| Reference + front matter | 8 | 10,799 |
| **Total** | **102 files** | **543,739** |

## What was verified, and how

**Accuracy pass over every chapter.** All 59 adversarially fact-checked by independent agents
with web search, then corrected. **271 non-minor issues fixed. Zero chapters were clean on first
pass**, including the two written by hand.

**All problem-set arithmetic independently recomputed in Python** — not eyeballed. Every set had
a checker write and run a script recomputing every number in the file.

**Zero problem sets were clean on first pass. 37 arithmetic errors found and corrected:**

| Set | Errors | Set | Errors |
|---|---:|---|---:|
| ps-04 pedigrees and risk | 3 | ps-09 molecular evolution | 5 |
| ps-05 mutation and chromosomes | 5 | ps-10 genomics maths | 7 |
| ps-06 gene regulation | 4 | ps-11 statistical genomics | 6 |
| ps-08 quantitative genetics | 7 | | |

Plus one of mine caught the same way: Haldane(0.26) = 36.7 cM, not 32.7 — and the correction
turned out more instructive than the original, since Kosambi gives 28.8 and the additive map
29.0, so Haldane's over-correction becomes the teaching point.

The lesson generalises: **written arithmetic in a textbook is wrong at a rate of several errors
per problem set unless something recomputes it.** Reading through it does not catch this.

**All 11 labs were executed on this machine**, not merely written. Every number, timing and
tool output in them is real.

**Final structural check — all clean:**

| Check | Result |
|---|---|
| Internal links | **0 broken of 2,266** |
| Chapter numbering 00–58 | contiguous, no duplicates |
| Required sections per chapter | 59/59 complete |
| `<details>` balance | 0 unbalanced |
| Generation artifacts | 0 |
| Trailing newlines | 102/102 |
| Question banks through `to_anki.py` | 13/13, exit 0, 839 cards, 3 columns |
| Pinned numbers vs `verified-facts.md` | consistent throughout |

Full detail in [`reference/verification-report.md`](reference/verification-report.md).

> **If you rebuild the link checker, strip fenced code blocks AND inline code.** Otherwise it
> reports the verification report — which quotes broken-link examples — as broken itself.

## The three findings worth remembering

**1. A unit error propagated through four chapters and a problem set.** Replication fidelity is
~10⁻¹⁰ **per replication**; the germline rate 1.1–1.3 × 10⁻⁸ is **per generation**. They differ
~100× and are not comparable. Now pinned in `verified-facts.md` with a warning, and corrected
everywhere. This is the single easiest mistake to make in this subject.

**2. Reference choice dominates variant calling.** In [`lab-03`](labs/lab-03-variant-calling.md),
the same reads called against *E. coli* K-12 rather than the correct B str. REL606 give **19,209
variants instead of 14** — a 1,372-fold difference. The wrong run looks perfectly healthy: 93.68%
mapped, high QUAL, no warnings.

**3. Population stratification manufactures significance.** In [`lab-08`](labs/lab-08-gwas.md), a
phenotype simulated with **no genetic cause at all** produced **702 genome-wide significant hits**
at λ = 18.07. Adding ancestry PCs: **0 hits**, λ = 1.14.

## Environment

No conda, and none needed. Homebrew ships native arm64 bottles for the whole toolchain; `uv`
handles Python.

```bash
cd <repo-root> && source .venv/bin/activate && ./labs/verify_setup.sh
export PATH="$HOME/bin:$PATH"     # plink2, iqtree2 (not Homebrew formulae)
```

Python pinned to **3.12** — the system default 3.14 had no wheels for several packages.
`iqtree2` is an x86-64 build under Rosetta.

`labs/data/` holds ~900 MB of cached inputs and is gitignored. Safe to delete; every lab
documents how to re-fetch.

## What will rot first

Re-check these before relying on the curriculum a year from now. All are pinned with dates in
[`reference/verified-facts.md`](reference/verified-facts.md):

- **Sequencing platform specs** — vendor figures move constantly. Roche AXELIOS 1 (SBX) launched
  six weeks before this was written and had no independent benchmarks yet.
- **ACMG variant-interpretation guidelines** — v4 was in draft. When it publishes, Chapter 55
  needs revisiting.
- **HPRC pangenome releases** — Release 2 was current. Release 1 is described only historically.
- **Database versions** — gnomAD, GENCODE, ClinVar.

## Known open items

Minor, recorded rather than silently left:

- `ps-01` has 10 problems where most sets have 8. Deliberate — it is the foundational set.
- Chapter 28 Q3 states "~180 Mb autozygous"; a fix agent calculated ~150 Mb (12 × 14 cM ≈ 168 cM)
  and flagged it without a verified replacement. Worth checking.
- `verified-facts.md` has no pinned entry for haemophilia A incidence, which Chapter 26 cites.
- A fix agent raised — as commentary rather than a filed issue — that Chapter 00's claims about
  hierarchical chromatin coiling and the lactase/cattle-domestication story could use hedging.
