# Briefing for a reviewing agent

You are reviewing a genetics & genomics curriculum built at the repository root.
This document exists so you spend your effort where it will actually find something.

**Read this before you read anything else, including the README.**

---

## 1. What this is

| | | Words |
|---|---|---|
| Genetics chapters | 59, numbered 00–58 across `part-00` … `part-12` | 372,640 |
| Statistics track | 7, `S1`–`S7` in `part-S-statistics/` | 50,198 |
| Problem sets | 11, worked solutions in `<details>` | 45,534 |
| Labs | 11, executed on real data | 41,709 |
| Question banks | 13, 839 Anki cards | 69,319 |
| Glossary | 397 terms | — |
| **Total** | **110 files** | **605,080** |

**Target reader:** can program well, has **only basic statistics**, knows **no biology**.
Target level: roughly third-year undergraduate.

Note the reader model was **revised late**. The whole curriculum was originally written assuming
strong statistics; that assumption was withdrawn and the `S1`–`S7` track plus ~267 inline pointers
were retrofitted. **That retrofit is the newest and least-tested thing in the repo.**

## 2. Design intent — review against this, not against your own idea of a course

Judge the work against what it was trying to be. The deliberate choices:

- **Misconceptions are first-class.** Every chapter has a `Common misconceptions` table. The claim
  is that knowing why a plausible belief is wrong is what separates third-year from first-year
  understanding. If you think a chapter's misconceptions are the wrong ones, say so — that is a
  substantive finding, not a nitpick.
- **Derive, don't assert.** Formulas are supposed to be motivated or derived, not stated.
- **Intuition before detail.** Every chapter opens `The core idea` in plain language before any
  mechanism.
- **Ch 00 is a deliberate low-resolution pass over the entire subject**, read before anything else.
  Ch 01 and the S-track are scoped primers — "the chemistry you actually need", "the statistics
  you actually need" — deliberately incomplete, and they say so.
- **Labs teach through real failure.** They use real data and several are built around a genuine
  mistake (aligning to the wrong reference; manufacturing 702 false positives from a phenotype with
  no genetic cause). The executed output is real and must not be edited.
- **Statistics track is parallel, not inserted.** `S1`–`S7` sit outside the 00–58 numbering because
  inserting them would have renumbered everything and broken ~2,800 verified links. Reading order
  is enforced by prerequisite headers instead.

## 3. Already verified — do NOT spend time redoing these

All of these were checked mechanically and pass. Re-running them wastes your budget.

| Check | Status |
|---|---|
| Internal links | **0 broken of 2,852** |
| Chapter numbering 00–58 | contiguous, no gaps or duplicates |
| Required sections present in every chapter | 59/59 |
| `<details>` balance | 0 unbalanced across 110 files |
| Stray generation artifacts (`<invoke>` etc.) | 0 |
| Trailing newlines | 110/110 |
| Question banks parse via `reference/to_anki.py` | 13/13, exit 0, 839 cards, 3 columns |
| Problem-set arithmetic | every number recomputed in Python |
| Lab commands and output | all 11 executed on this machine |
| Statistics-track code | all 7 chapters execute cleanly, cumulatively |
| Pinned numbers vs `reference/verified-facts.md` | consistent throughout |
| Section pointers (`S6 §7.1` etc.) resolve | 174/174 |

Detail in [`reference/verification-report.md`](reference/verification-report.md).

**Error density found so far: 271 chapter errors, 37 problem-set arithmetic errors, 28
statistics-track errors — and nothing was clean on first pass.** That tells you the incoming error
rate was high. It does **not** tell you the residual rate. Nobody knows the residual rate.

## 4. Never checked — this is where your effort belongs

Ordered by how likely I think you are to find something real.

**a) Question bank content — 839 cards, never validated.** The workflow that generated them had a
validation stage; every validation agent died in a spend-limit failure. The files were written and
only ever *parse*-checked. A 3-card spot check was consistent with the chapters. That is 3 of 839.
**This is the single largest unexamined surface in the repo.**

**b) Glossary content — 397 terms, never validated.** Written by one agent. Links verified, content
not. Check especially the entries flagged as misconception-carrying: *dominant*, *heritability*,
*linkage disequilibrium* vs *linkage*, *epigenetics*, *bootstrap support*, *VUS*, *MAPQ*, *N50*,
*genetic ancestry* vs *race*.

**c) Does the statistics track actually land at "basic statistics"?** It was written to a spec, by
agents that know statistics well. Nobody has checked whether a reader with genuinely basic
statistics could follow it. Look for unexplained jargon, unmotivated notation, and steps that
assume fluency the reader was just told they don't need.

**d) Are the retrofit pointers accurate?** ~267 inline pointers say things like "the negative
binomial and why Poisson is inadequate are covered in S2 §5". I verified the *sections exist*. I did
**not** verify each section actually teaches what the pointer claims. Sample 20–30 and check.

**e) Pedagogical sequencing.** The dependency graph in `STUDY-GUIDE.md` and the "read S5 before
Part 6" ordering are **asserted, never validated**. Does anything use a concept before it is
introduced? Work forward through the intended reading order and flag every forward dependency.

**f) Difficulty curve and cognitive load.** Mean chapter is ~6,300 words. Some are 9,000+. Nobody
has assessed whether the ramp is sane, whether any chapter is doing too much, or whether the
worked examples actually *teach* rather than merely demonstrate.

**g) Cross-chapter redundancy and contradiction of ARGUMENT.** Numbers were checked for
consistency; *arguments* were not. Linkage disequilibrium is discussed in 16 chapters. Do they
tell a consistent story, or does one chapter's framing contradict another's? Look at heavily
recurring topics: LD, PCA, multiple testing, epigenetics, heritability.

**h) Coverage against a real syllabus.** "Third-year undergraduate level" is my assertion. It was
never checked against an actual university curriculum or learning-outcomes framework. Is anything
important missing? Is anything well beyond level?

**i) Voice and level consistency.** Roughly 150 different writing agents produced this. Chapters
were written to a shared style brief, but drift is likely — especially in register and in how much
prior knowledge each assumes.

**j) The clinical and ethical chapters.** Ch 55 (variant interpretation) and Ch 57 (genomics in
practice) are where being wrong has consequences. Ch 58 (ethics) is where *framing* matters as much
as facts — check that competing positions are presented fairly and that the refutation of scientific
racism explains what is wrong rather than merely condemning.

## 5. Known-open items — a lower bound, not a list

These are flagged and unresolved. Finding only these means you have not looked hard enough.

- **Ch 28**: states "~180 Mb autozygous"; a checker computed ~150 Mb (12 × 14 cM ≈ 168 cM) but
  supplied no verified replacement.
- **Ch 05**: σ⁵⁴ and UP-element quantitative claims were questioned; no correction was supplied.
- **Ch 00**: hierarchical chromatin coiling and the lactase/cattle-domestication story were flagged
  as needing hedging; never actioned.
- **`verified-facts.md`** has no pinned entry for haemophilia A incidence, which Ch 26 cites.
- **`ps-01`** has 10 problems where most sets have 8 (deliberate — it is the foundational set).

## 6. Traps in this specific repo

- **A link checker must strip BOTH fenced code blocks and inline code.** `reference/verification-report.md`
  and `RESUME.md` deliberately quote broken-link examples and `<invoke>` patterns. A naive checker
  reports them as defects. This has already caused two false alarms.
- **Path conventions differ between S-chapters.** Some use `labs/data/x`, others bare `x` with
  `cd labs/data`. Code runs either way *within* a chapter but not across them. Worth flagging as an
  inconsistency; it is not currently a bug.
- **Statistics-track code is cumulative.** Blocks depend on earlier blocks in the same chapter.
  Testing them in isolation produces false failures — that mistake cost me an hour. Run them
  accumulated, from the chapter's own working directory.
- **`labs/data/` (~900 MB) is gitignored and required** by several S-chapters and all labs. Do not
  delete it. Every lab documents how to re-fetch.
- **Do not edit executed lab output.** The value of the labs is that the numbers are real. If you
  believe a number is wrong, re-run the command rather than changing the text. Environment:
  `cd <repo-root> && source .venv/bin/activate && export PATH="$HOME/bin:$PATH"`

## 7. The thing that limits both of us

**Every accuracy pass on this repo was an LLM checking an LLM.** You are the same kind of system as
the writers. You share their training data and therefore their blind spots. A misconception that is
common in the genomics literature was probably reproduced by the writer, missed by the checker, and
will be missed by you.

Two practical consequences:

**You are good at:** internal consistency, sequencing and dependency errors, pedagogical structure,
things that contradict each other, code that does not run, claims that contradict a stated source,
and places where the prose assumes knowledge the reader was told they don't need. **These are worth
your time.**

**You are unreliable at:** independently confirming a mechanistic claim in molecular biology that
sounds right. Where you are checking a fact rather than a consistency, **use web search and cite
what you found**, or mark it as unverified. Do not simply agree.

**Checkers here have been wrong before.** One flagged a correct claim about ChromEMT as fabricated;
verification showed the original was right. Another proposed a fix that a downstream agent correctly
rejected. **When you find something, state your confidence and your evidence.** A confident wrong
correction is worse than a flagged uncertainty.

## 8. Suggested plan

1. Read `README.md`, `STUDY-GUIDE.md`, `reference/verified-facts.md`, Ch 00, Ch 01, and one
   S-chapter. That is enough to know what the thing is trying to be.
2. Validate the **question banks** against their source chapters — largest unexamined surface (§4a).
3. Walk the **intended reading order** and flag every forward dependency (§4e).
4. Sample the **retrofit pointers** for accuracy (§4d).
5. Deep-read the **clinical and ethics chapters** with web verification (§4j).
6. Assess **structure and teaching method** across the whole: difficulty curve, redundancy,
   consistency of argument, whether worked examples teach (§4f, §4g, §4i).

**Report findings with file, line, evidence and confidence.** Separate "this is wrong" from "this is
unverified" from "this is a judgement call I would make differently". All three are useful;
conflating them is not.
