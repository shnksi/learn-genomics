# Review state — paused 2026-08-13

Paused mid-review at the user's request (usage limit). This file is the handoff.
Read `REVIEW-BRIEF.md` first for what the repo is; this file is what the *review* found and
what is still outstanding.

---

## 1. Findings confirmed so far

All of these were verified directly (mechanically or by reading the cited lines), not by an
agent whose output went unchecked. Confidence stated per item.

### A. Structural — the statistics retrofit damaged the reading order

**A1. Nine chapters require an S-chapter that the README/STUDY-GUIDE schedule places later.**
Confidence: certain (mechanical scan of every `> **Statistics needed:**` header against the
schedule asserted in `README.md` and `STUDY-GUIDE.md`).

| Chapter | Part | Demands | Scheduled at |
|---|---|---|---|
| Ch 12 | 2 | S4 | before Part 5 |
| Ch 14 | 2 | S6 | before Part 7 |
| Ch 15 | 2 | S6 | before Part 7 |
| Ch 28 | 5 | S5, S7 | before Part 6, Part 11 |
| Ch 29 | 5 | S5 | before Part 6 |
| Ch 32 | 6 | S6, S7 | before Part 7, Part 11 |
| Ch 47 | 10 | S7 | before Part 11 |
| Ch 48 | 10 | S7 | before Part 11 |
| Ch 49 | 10 | S7 | before Part 11 |

This is **not** a paperwork problem. Ch 15's stated core idea *is* a likelihood-and-posterior
argument ([15:23](part-02-transmission-genetics/15-pedigrees.md:23)); Ch 14 §8 is LOD scores.
A reader following the published schedule reaches both without S6.

**A2. `lab-07` is a tenth violation.** Requires S3, S4, S5, S7
([lab-07:3-8](labs/lab-07-population-genetics.md:3)) but its own "Before this" places it after
Ch 26–29 (Part 5). Separately, `README.md` says labs come "after Part 9" while lab-07 needs only
Part 5 and lab-10 only Ch 34 — so the lab placement guidance contradicts the labs themselves.
Confidence: certain.

**A3. Proposed corrected schedule** — removes all ten violations, splits only S6:

```
00, 01, 02–08, [S1, S2], 09–11, [S4], 12, 13, [S6 §§1–5], 14, 15,
16–20, 21–25, [S3, S5, S6 §§6–8], 26, 27, [S7], 28, 29, 30–32, 33–58
```

Verified against every chapter header: zero residual violations, and lab-07 is satisfied.

Why S6 must split rather than move whole: S6 §6 (credible vs confidence intervals) depends on S3
([S6:493](part-S-statistics/S6-likelihood-and-bayes.md:493)) and §3's bias correction cites S3
([S6:192](part-S-statistics/S6-likelihood-and-bayes.md:192)), but §§1–5 do not — and Ch 14/15
need only §§1–5. Checked: S7 §5 (PCA) needs S5, which the proposed order supplies before Ch 28.

**Not yet decided:** whether to adopt this, or instead keep whole-chapter reads and add
section-level "read S_n §§x–y now" pointers at the earlier points of need. The second preserves
the stated "read at the point where each idea is first needed" principle more literally. This is
a judgement call for the user.

**A4. Ch 12 §8 uses prior/posterior odds with no statistics pointer.**
[12:253-257](part-02-transmission-genetics/12-probability-and-testing.md:253). Header lists
S1, S2, S4 only. Severity: friction, not blocking — the paragraph is arithmetically
self-contained. Cheapest fix: point at **S1 §5** (Bayes for events), which the reader has already
read under the current schedule. Confidence: certain.

### B. Practice-material coverage gaps

**B1. Ten of 59 chapters have no problem set:** Ch 36–38 (Part 8), Ch 46–50 (Part 10),
Ch 57–58 (Part 12). Sets cover 02–35, 39–45, 51–56 only. Confidence: certain.

**B2. The S-track has no question bank and no problem set of its own.** 13 banks map to Parts
00–12. The newest, least-tested part of the curriculum is also the least practised.
Confidence: certain.

### C. Content

**C1. Ch 28 "~180 Mb autozygous" is wrong. Correct: ~145 Mb.**
[28:623](part-05-population-genetics/28-structure-and-inbreeding.md:623). Two independent routes
agree:
- from the definition: `F_ROH 0.05 × 2.88 Gb autosomal = 144 Mb`
- from the stated tracts: `12 × 14 cM = 168 cM × 0.847 Mb/cM = 142 Mb`
(168 cM / 3,400 cM map = F_ROH 0.049, so the question's own premises are self-consistent.)
Range 142–155 Mb depending on genome/map convention; **~145 Mb** is the honest round figure.
Confidence: certain.

**C2. The origin of that error is the thing the curriculum teaches against.** 180 ≈ 168 cM read
as Mb via `1 cM = 1 Mb` — which [Ch 14:575](part-02-transmission-genetics/14-linkage-and-mapping.md:575)
states as "never convert cM to Mb with a constant" and
[Ch 14:380](part-02-transmission-genetics/14-linkage-and-mapping.md:380) lists in its
misconception table. Worth fixing as a teaching moment, not just a number.
Confidence: certain.

**C3. The Part 00 question bank still carries the per-replication vs per-generation unit error**
that `RESUME.md` §"three findings worth remembering" claims was "corrected everywhere". The fix
propagated to the chapters but not to the banks. Flagged by the qb-part-00 agent as
`misconception_reinforced`, confidence `certain`, on the card "How is DNA replication fidelity of
~10^-8 per base achieved?". **Not yet independently re-verified by me** — it was pending the
adversarial verify stage when the run was stopped.

### D. Cosmetic

**D1.** All 7 S-chapters use `## Where this is used`; all 59 genetics chapters use
`## Connections`. Deliberate or drift — worth a decision. Confidence: certain.

**D2.** `game-prototypes/` ("Signal Room" browser game-feel tests) is orphaned — referenced from
nothing in README, STUDY-GUIDE or any chapter. Either link it or move it out.

---

## 2. What checks out — do not spend budget re-checking

- **Ch 00 and Ch 01 are genuinely good.** Read both in full. Well pitched for a programmer with
  no biology; the stochastic-collisions framing in Ch 01 §5 and the code-analogy failure table in
  Ch 00 are the strongest teaching in the repo. The on-ramp is not the weak point.
- **The retrofit pointers are accurate** in spot checks. S6 §7.2 reproduces Ch 15's 0.62%
  posterior exactly; Ch 14's "S6 §§1–4" and "S6 §5" both resolve to sections teaching exactly what
  is claimed. The *schedule* is broken, the *pointers* are not. (Sample was ~6; the systematic
  40-pointer check did not finish.)
- **`reference/verified-facts.md` is well built.**
- **STUDY-GUIDE self-claims verify exactly** — "variance appears in 35 of the 59 genetics
  chapters" is precisely right (35/59).
- **Ch 58's Lewontin/Edwards treatment does the right thing** — states Edwards (2003) "at full
  strength" then supplies arguments (a)–(e) that carry the actual weight
  ([58:412-483](part-12-applications-and-ethics/58-ethics-and-society.md:412)). Meets the
  "explain what is wrong rather than merely condemn" standard. (Full ethics audit did not finish.)
- **Learning-outcome bullets are mechanically well-formed**: 407 bullets across 66 chapters, all
  4–8 per chapter, zero weak verbs ("understand", "know", "appreciate", "be aware"). Whether they
  are *well sequenced* is a separate question that was not answered — see §3.
- Section conformance: 59/59 genetics chapters carry all six required sections.

---

## 3. Outstanding — what the paused runs were doing

Three workflows were stopped mid-flight. **All are resumable**: re-invoking with
`resumeFromRunId` replays completed agents from cache and only re-runs what did not finish.

### Run 1 — question banks (`wf_5833fb3b-27a`) — ~50% done
Script: `~/.claude/projects/-Users-shnksi-learn-genomics/bf6148bb-8fde-4d01-b7df-b136bbdfcb3a/workflows/scripts/qb-validate-wf_5833fb3b-27a.js`

**11 agent results salvaged to `review-artifacts/salvaged-results.json`** (211 KB) — do not lose
this file; it is ~10 banks of card-by-card findings that cost real budget to produce.

Validate stage finished for banks 00, 02, 03, 05, 06, 07, 08, 10, 11, 12. Findings ran ~5–8 per
bank on ~840 cards, so expect **60–90 raw findings, roughly 10% of cards touched**. Severity mix
skewed medium; a handful of `high`. **The adversarial verify stage had barely started, so none of
these are confirmed yet** — treat the salvaged JSON as leads, not conclusions. Banks 01, 04, 09
were never validated.

Resume:
```bash
Workflow({scriptPath: ".../qb-validate-wf_5833fb3b-27a.js", resumeFromRunId: "wf_5833fb3b-27a"})
```

### Run 2 — structure and sequencing (`wf_6fa6ff87-431`) — no results landed
Script: `.../structure-audit-wf_6fa6ff87-431.js`
13 per-part sequencing agents plus 6 cross-cutting agents (S-track integration, whether the
S-track actually lands at "basic statistics", 40-pointer accuracy sample, argument consistency
across LD/heritability/PCA/multiple-testing/epigenetics, syllabus coverage vs real universities,
difficulty curve). Agent transcripts exist under
`.../subagents/workflows/wf_6fa6ff87-431/` if partial work is worth mining.

**This is the run that most directly answers the user's question** and it is the one with nothing
to show. Restart it first.

### Run 3 — content accuracy (`wf_4fef8802-b4e`) — no results landed
Script: `.../content-accuracy-wf_4fef8802-b4e.js`
6 glossary blocks (397 terms, never validated) + 6 deep accuracy agents (clinical Ch 55/57 with
ACMG-v4 currency check, ethics Ch 58, molecular Ch 02–23, genomics currency Ch 40–48, popgen
derivations, practice material), each adversarially adjudicated.

### Never started at all
- Glossary content validation (397 terms) — largest remaining unexamined surface after the banks.
- Voice/register drift across ~150 writing agents (§4i of the brief).
- Coverage against a real third-year syllabus (§4h).

---

## 4. Method notes for whoever resumes

- The three workflow scripts on disk are good; edit and re-invoke rather than rewriting.
- Everything in `REVIEW-BRIEF.md` §6 "Traps" held true. Add one: a mechanical first-use scan for
  statistical terms produces **false positives on ordinary English** — "bootstrap" in Ch 21 is the
  lac operon bootstrapping induction, "variance" in Ch 03 is "the variance is enormous". Every
  mechanical hit needs a human read before it becomes a finding.
- `REVIEW-BRIEF.md` §7 is right and worth re-reading: on facts rather than consistency, search and
  cite or mark unverified. The agents were instructed accordingly and the adjudication stage
  exists for exactly that reason — which is why the unverified salvaged findings should not be
  actioned as-is.

## 5. Edits applied (session 2, after resume)

Three fixes applied — all independently verified, none dependent on the paused audits.
Re-verified after editing: `to_anki.py` exits 0 with 839 cards / 3 columns; 0 broken links in the
edited files.

| File | Change |
|---|---|
| [28:623](part-05-population-genetics/28-structure-and-inbreeding.md:623) | `~180 Mb` → `~145 Mb`, with the working shown and an explicit pointer to the cM≠Mb rule in Ch 14 |
| [qb-part-05:173](question-banks/qb-part-05.md:173) | same correction — the error had propagated to the question bank |
| [12:251](part-02-transmission-genetics/12-probability-and-testing.md:251) | added a `> **Statistics:**` box pointing at S1 §5, and flagging that the odds form and LOD arrive in Ch 14 §8 / S6 §§4–5 |

## 5b. Question banks — COMPLETE (validated and remediated)

Answers `REVIEW-BRIEF.md` §4a, the "single largest unexamined surface in the repo".

| Metric | Result |
|---|---|
| Cards validated | 839 (all) |
| Confirmed defects | 50 — 4 high, 17 medium, 29 low (**6.0% defect rate**) |
| Refuted by the adversarial pass | 31 of 81 raw findings (**38%**) |
| Coverage gaps identified | 240 chapter concepts with no card |
| Cards after remediation | **1,058** (+219) |

**The 38% refutation rate is the number to remember.** Two in five findings from a single-pass
reviewer on this repo are wrong. Any future pass here must keep an adversarial stage.

All 50 fixes applied, plus 8–12 gap-closing cards per bank, prioritising uncovered stated learning
outcomes and uncovered rows of chapters' own misconception tables.

Independently re-verified by me after remediation (not taken on the agents' word):
`to_anki.py` exit 0, 1,058 rows, 3 columns; Q/A counts equal in all 13 banks; 0 malformed cards;
0 non-ASCII in card text corpus-wide.

Spot-check of a correction, recomputed from scratch: qb-05:16's revised "11% power at N=200,
35% at N=1,000" is right (ncx2, λ=N·F², α=0.05, 1 df → 0.1090 and 0.3526), matches
[26:456](part-05-population-genetics/26-hardy-weinberg.md:456), and the old "under 10%" was false.

**Style drift found and fixed:** all 31 em dashes in card text were confined to `qb-part-07.md`;
the other twelve banks used ASCII `--`. A single writing agent diverged. Normalised. This is
`REVIEW-BRIEF.md` §4i (voice drift) in measurable form — worth checking the same way in chapters.

Full detail: `review-artifacts/qb-confirmed-full.json`.

## 5c. SCHEDULE FIX — APPLIED AND VERIFIED

The headline deliverable is done. **13 violations → 0**, verified mechanically after editing.

Adopted schedule (from the structure audit, which read chapter *bodies*; it beat my own
header-based proposal — see §6 for why):

```
00 01 · 02–08 · [S1 S2] · 09 10 11 · [S3 S4] · 12 13 14 15 · 16–20 · 21–25 ·
26 27 · [S5 S7] · 28 29 · 30 31 · [S6] · 32 · 33–58
```

Files edited: `README.md` (both schedule tables, the labs-placement row, the section heading),
`STUDY-GUIDE.md` (table, intro sentence, mermaid graph, linear order, Part-2 load note), all
seven S-chapter `Read before:` headers, and three over-claiming chapter headers
(Ch 14 dropped S6, Ch 15 S6→S2, Ch 32 dropped S7 and added S3).

Post-edit verification: **0 schedule violations** across all 59 chapters and all labs;
**0 broken links of 2,866** in curriculum content; markdown fences balanced.

## 5d. Content-accuracy audit — COMPLETE, remediation OUTSTANDING

All reports on disk under `review-artifacts/content/`. Each was adversarially adjudicated; the
adjudicators repeatedly caught first-pass agents proposing corrections their own cited sources
contradicted, so **use the `deep-*.md` (adjudicated) files, not `orig-*.md`.**

| Report | Confirmed | Headline |
|---|---|---|
| `deep-practice-material.md` | 12 | **Labs are not reproducible by anyone but the author** — see below |
| `deep-genomics-methods.md` | 6 | ONT/PacBio/10x figures 1–3 years stale |
| `deep-molecular.md` | 8 | Both Ch 00 known-open items confirmed; Ch 05 UP element understated 3× |
| `deep-ethics.md` | 9 | Erlich attribution wrong and propagated; Nagoya category error |
| `deep-popgen-quant.md` | 7 | Ch 32 CI 4× too narrow; `formulas.md:61` cM/Mb error |
| `deep-clinical.md` | 6 | ACMG 2015 confirmed **current** — Ch 55 needs no change |
| `gloss-*.md` (397 terms) | 63 HIGH | CTCF entry attributes a cohesin result to CTCF, etc. |

**The labs finding is the most serious in the whole review.** `RESUME.md` states "All 11 labs were
executed on this machine… Every number, timing and tool output in them is real", and
`REVIEW-BRIEF.md` §2 makes it a design principle ("The executed output is real and must not be
edited"). The adjudicator **re-executed** and found `lab-02 §3` prints a `flagstat` block spliced
from two different alignments. Also: all 11 labs `cd` to the author's home directory; `lab-04`
reads a file `lab-03` never creates; `lab-09` invokes three gitignored scripts that are never
printed; `lab-08 §5` and `lab-07 §6` print output with no producing command. A reader on a fresh
machine cannot run these.

**Do not "fix" lab output by editing numbers.** Re-run the commands. Environment:
`cd <repo-root> && source .venv/bin/activate && export PATH="$HOME/bin:$PATH"`

## 5e. Ch 28 autozygosity — fully resolved (refined a second time)

The audit improved on my own fix. The question's premises were internally inconsistent: person B
(350 × 0.5 = 175 cM) is exactly 0.05 of the chapter's 3,500 cM map, but person A (12 × 14 = 168 cM)
gives F = 0.048. Now: A is `12 tracts averaging 14.6 cM` (= 175.2 cM, F = 0.0501), the exposure is
**~144 Mb** (0.05 × 2,881 Mb autosome), and the cM≠Mb teaching point reads 175, not 168.
Ch 28 and `qb-part-05` synced; `to_anki` still exits 0 at 1,058 cards.

## 5f. Content remediation — COMPLETE. Lab integrity restored by re-execution.

Verdict: **PASS with 4 must-fix defects**, all since applied. Verifier's summary: "No fabricated
numbers. Every fact I re-checked against a primary source was correct."

**The lab-02 splice is fixed at its root, by re-running — not by editing output.**
`labs/data/aln.bam` was a stale **K-12** alignment (`@PG: bwa mem … ecoli.fa`, NC_000913.3) while
lab-02:47 documents building it from `rel606.fa`. So lab-02 §3 printed the *wrong-reference*
flagstat — 93.68%, the very number lab-03:212 cites as the K-12 failure case — while its
`samtools coverage` block ten lines later was REL606-derived. That is the splice, confirmed by
re-execution.

Rebuilt with lab-02's own documented command. Real numbers now printed: **99.28% mapped,
96.83% properly paired, 0.71% singletons**. Downstream chain re-verified: lab-03/lab-04 still
give **14 variants**, byte-identical on CHROM/POS/REF/ALT to the on-disk `filt606.vcf`.

Turned into a teaching point rather than a silent correction: lab-02 now tells the reader to hold
on to 99.28%, because lab-03's wrong reference still *looks* healthy at 93.68% — a five-point drop
is the only warning before 19,209 false variants.

**lab-01's coverage answer was wrong and is now better.** It blamed the 6.5×→6.0× gap on "6–7% of
reads not mapping". Measured: 99.27% of reads map; the gap is **soft-clipping** — 1,851,906 bases
(6.17% of 30,000,000), against only 217,650 bases in unmapped reads (0.73%). Rewritten around
*reads mapped ≠ bases aligned*, which is the more useful lesson.

**lab-10 mislabelled its macaque.** NC_002764 is *Macaca sylvanus* (Barbary), not *M. mulatta*
(rhesus, NC_005943) — confirmed against NCBI. The adjudicator was right that swapping the
accession would invalidate the executed output (16,586 bp *is* the stated upper bound). Relabelled
and **re-ran mafft + iqtree2**: 17,421 columns and branch 0.2832 are unchanged, proving it was
purely a naming defect. Added a note on checking accession against species name.

Also applied: MUST-FIX 2 (the cM/Mb error surviving in `ps-03`, now consistent across chapter,
glossary, formulas.md, ps-03 and qb-part-02), MUST-FIX 3 (GENCODE 1,096 residual misidentified in
4 files — now 412 IG/TR + 665 readthrough + 19 artifacts everywhere), MUST-FIX 4 (glossary
inversion), plus the disclosed-stale list: chromothripsis "uniform"→"spread evenly across all
four", the Ch 47 factor-of-2, the TE copy-number claim, generation time (qb-part-05 was on 25 and
28 years against the pinned 27), and both question-bank propagations that
`reference/verified-facts.md` was tracking as outstanding — that note is now closed.

## 5g. Final integrity — all green

`0` schedule violations · `0` broken links of 2,926 in curriculum content · `0` unbalanced
`<details>` · `0` missing trailing newlines · `0` hardcoded author paths in content · `0`
non-ASCII in card text · glossary 406 headwords, every entry blank-separated · `to_anki` exit 0,
1,058 cards, 3 columns · lab-02 flagstat and lab-03/04's 14 variants both reproduce on re-run.

## 5i. GENETICS REBALANCE + LEARNING OUTCOMES + PRACTICE — COMPLETE

### Three new genetics chapters, written and verified
| Chapter | Words | Closed |
|---|---|---|
| **Ch 20A** Bacterial and phage genetics | 7,486 | `Hfr` 0 files → taught; `interrupted mating`, `generalized transduction`, `prophage`, `Benzer`, `merodiploid` all 0 → taught |
| **Ch 25A** Developmental genetics and gene targeting | 7,440 | `gene targeting`, `knockout mouse`, `Cre-lox`, `gastrulation`, `germ layer`, `neural crest` all 0 → taught |
| **Ch 35A** Speciation and ecological genetics | 8,829 | `reproductive isolation`, `species concept`, `hybrid zone`, `genetic rescue` all 0 → taught |

Plus **tetrad analysis as Ch 14 §6** (`ditype` was 0 files repo-wide), which makes Ch 18 §5's gene
conversion directly observable rather than inferred. Ch 14 renumbered §§6–10; both inbound
`§8` references repointed.

Verification caught two real factual errors in the chapters that had never been checked —
25A listed *hairy* among Nüsslein-Volhard & Wieschaus's 15 loci (it is not in the 1980 list);
20A said "13 IS*2*, 6 IS*3*" where MG1655 carries 6 and 5 of ~37 IS elements. Both fixed, plus
E3–E11 (an *F*<sub>ST</sub> direction error stated twice, a minutes column computed from the wrong
end of the gene, a figure/worked-example mismatch, a false additivity claim, an arithmetic slip,
three uncovered sections given Check-yourself questions, and five undefined jargon terms).

### The rebalance — what it did and did not do
Recomputed from stated `**Time:**` headers: genomics (Parts 9–11) **34.3% → 32.5%**, classical
genetics (2+3+4) **26.6% → 28.8%**, evolutionary (5+6+7) **17.7% → 18.5%**.

**Genomics is still the largest single block.** Two prescriptions were offered and I rejected both,
on evidence:
- *A Part 2A chapter* — rejected as duplication. Non-Mendelian inheritance is already taught:
  mitochondrial inheritance, heteroplasmy, imprinting, UPD, X-inactivation, dosage compensation,
  anticipation, mosaicism, penetrance and expressivity all appear across Ch 11, 13 and 15.
- *Compressing Ch 41/42/43/45* — rejected as destroying good material. Those chapters teach
  genetics reasoning, not tool operation. Ch 45: *"the reference is simultaneously the thing that
  makes variation measurable and the thing that systematically hides some of it."*

**My position: the reading-time ratio is the wrong metric.** What matters is whether the genetics
is complete (it was genuinely broken; it is now fixed) and whether the genomics teaches genetics
(it always did). If the ratio is wanted regardless, the only honest route is cutting Parts 9–11 by
~214 min, and that is the author's call, not a defect to be fixed.

### Learning outcomes — Break 1, 2 and 3 closed
408 → **473 outcomes**; +71 added, 77 rewritten, 0 assessments deleted anywhere.
Residual assessed-but-unpromised sections: **~40 → 7 confirmed** (≤14 counting marginals).
Every chapter within 5–7 bullets; **zero banned verbs corpus-wide** (the pass left two `know`
occurrences, both since fixed). Part 0's eleven verb-less bullets rewritten — Ch 00 §6's
mutation-count computation and Ch 01 §5's fidelity decomposition were previously delivered but
unpromised, so a reader self-checking against the bullets passed while skipping the two hardest
arguments in Part 0.

One defect worth recording: the verifier proposed collapsing Ch 05's honest `10⁻⁴–10⁻⁶`
transcription error range to `10⁻⁵` to match two other statements. **That is backwards** — it
replaces a real hedge with false precision. The other three statements were made consistent with
§1's range instead.

### Practice material — every chapter now has some
**16 problem sets** (was 11). New: `ps-05A` (Ch 20A), `ps-09A` (Ch 36–38), `ps-10A` (Ch 46–50),
`ps-11A` (Ch 57–58), `ps-S` (S1–S7). The letter-suffix convention makes them sort into true
reading order without renumbering the existing eleven.

Independent recomputation wrote its own scripts and checked **911 numeric claims: 3 wrong, all
cosmetic** — the authors' Python discipline held, against a prior of ~37 errors per five sets.
The real defects were conceptual and are fixed: one problem with no correct answer as posed, one
solution contradicting itself, one under-specified part, one Phred-scale-as-linear slip.

**14 question banks, 1,219 cards** (was 13 / 839). Ch 20A, 25A and 35A carded; the S-track has a
bank for the first time (82 cards, every one grounded in a genetics application).

### Final integrity
`0` schedule violations · **`0` broken links of 3,226** across 131 curriculum files ·
`0` unbalanced `<details>` · `0` missing trailing newlines · `0` author paths in content ·
`0` non-ASCII in card text · `to_anki` exit 0, 1,219 cards, 3 columns ·
62 chapters / 16 problem sets / 14 banks / 422 glossary headwords.

Note: a `genomic-investigator/` directory with `node_modules` now sits in the repo. It is not part
of the curriculum and was not created by this review; it is excluded from all checks above.

## 5h. STILL OUTSTANDING — the honest list

1. **Learning outcomes, Break 2** (structure audit §4). ~40 sections are assessed by a chapter's
   own Check-yourself questions or misconception rows but promised by no bullet — worst is
   **Ch 28 §§8–11** (Lewontin/Edwards, PCA, ADMIXTURE, local ancestry: ~40% of the chapter and its
   most socially consequential material). The audit gives three mechanical rules and Part 0
   replacement bullets. Parallelisable, one pass over 59 chapters.
2. **Missing problem sets** for Ch 36–38, Ch 46–50, Ch 57–58 (10 of 59 chapters), and the S-track
   has no problem set or question bank of its own.
3. **Category C judgement calls** from the structure audit — including C1, its argument that the
   book has silently redefined "genetics" as "human statistical genomics". Worth a read; I would
   not action it without the author.
4. Minor stale items: `13-sex-linkage.md:387`'s symmetric "Y differ by one gene",
   `reference/verification-report.md:169`'s stale line number.

## 6. How the schedule decision was actually made (superseded proposals kept for the record)

Superseding §A3. The earlier proposal split S6 at §5; that was too optimistic —
**S6 §3 leans on S3's bias/variance/consistency vocabulary**
([S6:188-192](part-S-statistics/S6-likelihood-and-bayes.md:188)), so §§1–5 is not self-contained
without S3.

A no-split alternative is cleaner and tests clean. Mechanically verified against every chapter
header and every lab:

| Schedule | Violations |
|---|---|
| Current published | **13** (11 chapter–S pairs + 2 lab–S pairs) |
| **Candidate B (recommended)** | **0** |

```
00, 01, 02–08, [S1, S2], 09–11, [S4], 12, 13, [S3, S6], 14, 15,
16–25, [S5], 26, 27, [S7], 28–58
```

**Cost:** 35,512 words of statistics (S1, S2, S4, S3, S6) land before Part 2 finishes.
**Mitigation, and an argument it is actually better:** this names a real conceptual boundary that
the current structure hides. Part 2 splits naturally into **2a (Ch 09–13, classical crosses —
counting)** and **2b (Ch 14–15, linkage mapping and pedigree risk — inference)**. The statistics
block belongs at that seam because that is precisely where the subject changes method.

**Header edits this implies** (not yet applied — pending the structure audit, which reads chapter
*bodies* and may surface needs the headers do not declare):

| Chapter | `Read before:` now | becomes |
|---|---|---|
| S3 | Part 5 | Ch 14 |
| S4 | Part 5 | Ch 12 |
| S5 | Part 6 | Part 5 (Ch 26) |
| S6 | Part 7 | Ch 14 |
| S7 | Part 11 | Ch 28 |

Plus the schedule tables in `README.md` (two of them) and `STUDY-GUIDE.md` (one table and the
mermaid dependency graph).

**Deliberately not yet applied.** My analysis keys off *declared* `Statistics needed:` headers.
The running structure audit reads chapter bodies and may find undeclared dependencies. Apply once,
after reconciling.
