# Structural verification report

Run date: **2026-08-13** · repo root: the repository root

Every figure below came from a command executed against the working tree on the date above.
`.venv/`, `.git/` and `.gstack/` are excluded from every scan. 97 markdown files were in
scope.

**Headline.** One broken internal link (`README.md` → `GLOSSARY.md`, a file that has not
been written yet). Three labs are missing against the advertised count of eleven. Everything
else — chapter completeness, section structure, numbering, artifact hygiene, pinned numbers,
problem sets, question banks — passes clean.

---

## 1. Chapter completeness

**PASS.** All 59 chapters (00–58) are present across `part-00` … `part-12`, and every one of
them carries all six required sections.

```
chapters found: 59
missing numbers: []
duplicate numbers: []
min/max: 0 58

--- section gaps ---
chapters with gaps: 0
```

The six sections checked, as headings at any level, case-insensitively, with curly
apostrophes normalised to straight:

- `What you'll be able to do`
- `The core idea`
- `Common misconceptions`
- `Worked example`
- `Connections`
- `Check yourself`

Distribution across parts:

| Part | Chapters | Files |
|---|---|---|
| part-00-orientation | 00–01 | 2 |
| part-01-molecular-foundations | 02–08 | 7 |
| part-02-transmission-genetics | 09–15 | 7 |
| part-03-genome-instability | 16–20 | 5 |
| part-04-gene-regulation | 21–25 | 5 |
| part-05-population-genetics | 26–29 | 4 |
| part-06-quantitative-genetics | 30–32 | 3 |
| part-07-molecular-evolution | 33–35 | 3 |
| part-08-methods | 36–38 | 3 |
| part-09-genomics | 39–45 | 7 |
| part-10-functional-genomics | 46–50 | 5 |
| part-11-human-and-statistical-genomics | 51–56 | 6 |
| part-12-applications-and-ethics | 57–58 | 2 |
| **Total** | **00–58** | **59** |

---

## 2. Internal link check

A Python checker walked every `.md` file, skipped fenced code blocks, extracted both inline
links (bracketed text immediately followed by a parenthesised target) and reference
definitions of the form `[id]: target`, discarded `http(s):`,
`mailto:`, `ftp:`, `data:` and bare-anchor targets, stripped `#anchors`, URL-decoded the
remainder, resolved it against the containing file's directory with `os.path.normpath` (so
`../` is handled properly) and tested `os.path.exists`.

```
markdown files scanned: 97
total links found: 1870
relative links checked: 1831
BROKEN: 1

README.md:180	target=GLOSSARY.md	resolves_to=GLOSSARY.md
```

**1 broken link out of 1,831 relative links checked.** Every one of the several hundred
cross-part chapter links — the `../part-NN-.../NN-slug.md` form used throughout the
**Connections** sections, which is exactly where drift between independently written
chapters would show up — resolves correctly.

The single failure is `README.md:180`:

```
- [Glossary](GLOSSARY.md) — every term, defined once
```

`GLOSSARY.md` does not exist at the repo root. This is not a typo with a nearby correct
target, so it was **not** auto-fixed — see [Needs attention](#needs-attention).

---

## 3. Numbering contiguity

**PASS.** Chapter numbers run 00–58 with no gaps and no duplicates (see the script output in
§1). 59 numbered chapter files, 59 distinct numbers, `min = 0`, `max = 58`.

---

## 4. Artifact sweep

**PASS on all three checks.**

### Stray generation markers

```
$ grep -rn --include='*.md' -E '<invoke|<parameter name|antml:' . \
    --exclude-dir=.venv --exclude-dir=.git --exclude-dir=.gstack
RESUME.md:119:**Generation artifacts.** Fix agents found stray `<invoke name="...">` text and malformed
RESUME.md:124:grep -rn "<invoke\|<parameter name\|antml:" --include="*.md" .
```

Both hits are in `RESUME.md`, which documents the pattern deliberately, and both are inside
inline-code spans. **Zero real artifacts** in the 96 other files.

> Note for future sweeps: **this report is now a third deliberate-mention file**, alongside
> `RESUME.md`. Exclude `reference/verification-report.md` as well, or the grep will report
> itself.

### `<details>` / `</details>` balance

A naive count reports three mismatches — `README.md` (1/0), `STUDY-GUIDE.md` (1/0) and
`RESUME.md` (2/1). All are false positives: every occurrence is an inline-code mention of
the tag in prose, e.g.

```
README.md:62:      | 11 sets, worked solutions folded in `<details>` |
STUDY-GUIDE.md:54: Solutions are folded into `<details>` blocks. This is deliberate.
```

Re-running with inline-code spans stripped reports `files containing real <details>: 79` and
`mismatched (excluding inline-code mentions): 0`.

**79 files use real `<details>` blocks and all 79 balance.**

### Trailing newline

```
files without trailing newline: 0
```

All 97 files end in a newline. Nothing to fix.

---

## 5. Pinned-number consistency

Checked against [`verified-facts.md`](verified-facts.md). **PASS on all five.**

| Pinned figure | Verdict | Evidence |
|---|---|---|
| **19,442** protein-coding genes | Consistent | 27 occurrences across 12 files (ch 00, 03, 06, 08, 22, 24, 37, 39, 44, 54, qb-01, qb-09, ps-06, `formulas.md`, `verified-facts.md`). No competing exact count anywhere. |
| **58,195** non-coding genes | Consistent | 12 occurrences; every one either states it directly or shows the derivation `35,885 + 7,608 + 14,702 = 58,195`. |
| **59,291** must appear nowhere as fact | Satisfied | 4 occurrences, all four explicitly flagging it as the *wrong* value — see below. |
| **~46%** transposable elements | Consistent | ch 00 L459, ch 03 L237/L459, ch 19 L18, ch 35 L360, ch 39 L223/L352. No competing TE figure. |
| **gnomAD 730,947 exomes / 76,215 genomes** | Consistent | ch 55 L224 states both plus the 807,162 total; ch 51 L371, ch 58 L383 and ch 54 L137 cite 807,162. No other gnomAD size claim. |
| **HPRC Release 2, 460 haplotypes** | Consistent | ch 45 L175/L217/L295, qb-09 L263, ch 58 L383. Nothing describes Release 1 as current. |

### The 59,291 hits, in full

All four are the number being named in order to be rejected:

```
part-09-genomics/39-genome-landscapes.md:202: entities into the non-coding tally and returns 59,291 instead of the correct 58,195.
part-09-genomics/44-annotation.md:302:        obtained as 78,733 − 19,442 = 59,291, which quietly reclassifies the 1,096 IG/TR segments as
question-banks/qb-part-09.md:231:            A: Because 35,885 lncRNA + 7,608 small ncRNA + 14,702 pseudogenes = 58,195, whereas subtracting …
reference/verified-facts.md:41:                 **58,195**, not 59,291. The four categories above sum to 77,637, …
```

This is the correct treatment: the wrong number is taught *as* wrong.

### HPRC Release 1 mentions, in full

Three chapters mention Release 1. None presents it as current:

- `45-reference-genomes-and-pangenomes.md:175` — "Release 2 (May 2025) … roughly a fivefold
  expansion over Release 1's 47 individuals and 94 haplotypes … Descriptions of the 2023
  draft as 'the pangenome' are two years and a fivefold expansion out of date."
- `45-reference-genomes-and-pangenomes.md:221` — cites the Release 1 *paper*'s benchmark
  results (34% small-variant error reduction). A historical result, correctly attributed.
- `reference/further-reading.md:54` — Liao et al. 2023 listed as a landmark paper, with
  "note that HPRC has since moved to Release 2" appended.

### Two non-contradictions worth recording

Both were checked and neither is an error:

1. `part-01/03-genomes-chromosomes-chromatin.md:268` — a mermaid node reads
   `repetitive DNA ~50%+ of the human genome`. This is *repetitive DNA*, a broader category
   than TE-derived sequence, and L290 of the same file states "The class percentages come
   from different annotations and are approximate; the pinned total for TE-derived sequence
   is **~46%**." Correctly scoped.
2. `part-01/06-rna-processing.md:266` — "how do ~19,000 genes build a human". This is a
   rhetorical quotation of the question, two lines after the exact figure **19,442** is
   stated with a citation. Not a competing claim. The several `~20,000 genes` figures in
   ch 47, ch 56, qb-10 and ps-11 are multiple-testing denominators, where a round order-of-
   magnitude is the right thing to use.

---

## 6. Problem sets and labs

### Problem sets — 11 present, structurally sound, but the count per set varies

**11 of 11 present.** Every set has a `## Where you went wrong` section with a populated
table, and every solution `<details>` block is balanced.

| File | Problems | `<details>` open/close | "Where you went wrong" | WYWW table rows |
|---|---|---|---|---|
| ps-01-molecular-foundations | **10** | 10/10 | yes | 8 |
| ps-02-mendelian-genetics | 8 | 8/8 | yes | 9 |
| ps-03-linkage-and-mapping | **6** | 6/6 | yes | 8 |
| ps-04-pedigrees-and-risk | 8 | 8/8 | yes | 16 |
| ps-05-mutation-and-chromosomes | 8 | 8/8 | yes | 14 |
| ps-06-gene-regulation | 8 | 8/8 | yes | 15 |
| ps-07-population-genetics | 8 | 8/8 | yes | 10 |
| ps-08-quantitative-genetics | 8 | 8/8 | yes | 13 |
| ps-09-molecular-evolution | 8 | 8/8 | yes | 15 |
| ps-10-genomics-and-sequencing | 8 | 8/8 | yes | 14 |
| ps-11-statistical-genomics | 8 | 8/8 | yes | 15 |

Nine of eleven have exactly 8 problems. **ps-01 has 10 and ps-03 has 6.** Each still has one
worked solution per problem, so nothing is missing *within* a set — but if 8 is the intended
invariant, two sets do not meet it. Flagged below rather than edited.

### Labs — 8 present, 11 advertised

**FAIL.** `README.md:8` and `README.md:63` both promise "11 hands-on computational labs";
`STUDY-GUIDE.md:7` says "11 labs". The directory contains **8**:

```
labs/lab-00-setup.md               ## Check yourself  L225
labs/lab-01-sequences-and-fastq.md ## Check yourself  L205
labs/lab-02-alignment.md           ## Check yourself  L247
labs/lab-03-variant-calling.md     ## Check yourself  L249
labs/lab-05-assembly.md            ## Check yourself  L241
labs/lab-07-population-genetics.md ## Check yourself  L268
labs/lab-08-gwas.md                ## Check yourself  L226
labs/lab-10-phylogenetics.md       ## Check yourself  L217
```

Every lab that exists has a `## Check yourself` section — 8/8 pass that check. The gaps are
**lab-04, lab-06 and lab-09**, which the numbering leaves conspicuously empty. Nothing
anywhere in the repo links to them, so this produced no broken links; the only symptom is the
count mismatch against the README. See [Needs attention](#needs-attention).

---

## 7. Question banks

**PASS.** All 13 banks parse through `reference/to_anki.py` with exit code 0 and produce
exactly 3 tab-separated columns on every row.

| Bank | Exit | Cards | Rows with ≠ 3 columns |
|---|---|---|---|
| qb-part-00 | 0 | 51 | 0 |
| qb-part-01 | 0 | 60 | 0 |
| qb-part-02 | 0 | 63 | 0 |
| qb-part-03 | 0 | 69 | 0 |
| qb-part-04 | 0 | 59 | 0 |
| qb-part-05 | 0 | 86 | 0 |
| qb-part-06 | 0 | 55 | 0 |
| qb-part-07 | 0 | 73 | 0 |
| qb-part-08 | 0 | 61 | 0 |
| qb-part-09 | 0 | 82 | 0 |
| qb-part-10 | 0 | 55 | 0 |
| qb-part-11 | 0 | 67 | 0 |
| qb-part-12 | 0 | 58 | 0 |
| **Total** | **0** | **839** | **0** |

Whole-directory run, confirming the same total:

```
$ python3 reference/to_anki.py question-banks/ --out all.tsv
  …
wrote 839 cards to all.tsv
rows: 839
rows with !=3 cols: 0
```

`to_anki.py` raises `ParseError` on a question with no answer or an answer with no preceding
question, so exit 0 across all 13 banks also certifies that no `Q:` is orphaned and no `A:`
is dangling.

---

## 8. Word count by section

| Section | Files | Words |
|---|---:|---:|
| part-00-orientation | 2 | 6,808 |
| part-01-molecular-foundations | 7 | 39,632 |
| part-02-transmission-genetics | 7 | 38,925 |
| part-03-genome-instability | 5 | 27,972 |
| part-04-gene-regulation | 5 | 31,303 |
| part-05-population-genetics | 4 | 23,238 |
| part-06-quantitative-genetics | 3 | 16,077 |
| part-07-molecular-evolution | 3 | 18,985 |
| part-08-methods | 3 | 18,504 |
| part-09-genomics | 7 | 45,875 |
| part-10-functional-genomics | 5 | 36,810 |
| part-11-human-and-statistical-genomics | 6 | 48,040 |
| part-12-applications-and-ethics | 2 | 17,764 |
| **Chapters subtotal** | **59** | **369,933** |
| problem-sets | 11 | 45,831 |
| question-banks | 13 | 69,319 |
| labs | 8 | 14,587 |
| reference | 3 | 4,697 |
| root (README, RESUME, STUDY-GUIDE) | 3 | 3,364 |
| **Total** | **97** | **507,731** |

Mean chapter length ≈ **6,270 words**. Largest files: `58-ethics-and-society.md` (9,306),
`50-3d-genome.md` (9,160), `54-rare-variants-and-mendelian-disease.md` (9,149),
`56-cancer-genomics.md` (8,939).

---

## Fixes applied

**None.** Nothing in the trivially-fixable category was found:

- No file was missing a trailing newline.
- The one broken link has no obvious correct target — `GLOSSARY.md` simply does not exist
  yet, so pointing the link elsewhere would hide a real gap rather than fix it.
- No `<details>` block was actually unbalanced.
- No generation artifacts outside the file that documents them.

---

## Needs attention

Three items, none auto-fixable, in descending order of how visible they are to a reader.

### 1. `GLOSSARY.md` does not exist — the only broken link in the repo

`README.md:180` links to `GLOSSARY.md` from the Reference section. The file has never been
written. `RESUME.md` corroborates rather than contradicts this: line 20 lists `GLOSSARY.md`
as "in flight" and line 45 describes it as "in flight, 300–400 terms built from the
chapters."

Two honest resolutions, and picking between them is an editorial call:

- write the glossary, which is what the README already promises; or
- remove the bullet from `README.md:180` until it exists.

Silently repointing the link is not an option — the README's claim that every term is
"defined once" is currently unbacked.

### 2. Three labs are missing against the advertised eleven

`labs/` holds lab-00, 01, 02, 03, 05, 07, 08, 10 — eight files. `README.md:8`, `README.md:63`
and `STUDY-GUIDE.md:7` all state eleven. **lab-04, lab-06 and lab-09 do not exist.**

The numbering gaps look deliberate rather than accidental — the labs that exist map onto
chapter topics (alignment, variant calling, assembly, population genetics, GWAS,
phylogenetics), and the three absent numbers sit exactly where an RNA-seq lab, an
annotation/data-formats lab and a functional-genomics lab would go. So this reads as "three
labs still to write", not "three labs lost".

Either write them or correct the count in the two front-matter files. As it stands a reader
counts the directory and finds the README overstated by three.

### 3. Problem-set length is not uniform

Nine sets have 8 problems; `ps-01-molecular-foundations` has 10 and
`ps-03-linkage-and-mapping` has 6. Every problem in every set has a worked solution, so no
set is internally incomplete — this is only a defect if 8 was meant to be an invariant. If it
was, ps-03 is two problems short and ps-01 two over. Recording it rather than guessing at the
intent.

---

## Addendum — resolved after the report ran

This report is a point-in-time artifact and has deliberately not been rewritten. Recording what
changed afterwards instead:

| Item | Status at report time | Now |
|---|---|---|
| **1. `GLOSSARY.md` missing** | the only broken link in the repo | **Resolved.** 397 terms, 14,398 words, 26 A–Z sections. Every entry links to the chapter that develops it; all 397 links resolve; all 59 chapters and all 13 parts are referenced. `README.md:180` now resolves. |
| **3. ps-03 had 6 problems** | flagged as short of the apparent 8 invariant | **Resolved.** Two problems added (additive map building; sex differences and hotspot rate density), arithmetic independently recomputed. Now 8, `<details>` balanced 8/8. |
| **2. Three labs missing** | lab-04, 06, 09 absent against 11 advertised | **Partly resolved.** lab-04 and lab-09 written and executed; lab-06 outstanding. |

`ps-01` retains 10 problems by intent — it is the foundational set and carries the extra
strand/frame exercises the later sets build on. Eight is a norm, not an invariant.

**One correction to §2 of this report.** A re-run of the link check after `GLOSSARY.md` landed
reports a single "broken" link at `reference/verification-report.md:88` — which is this report
quoting the `- [Glossary](GLOSSARY.md)` line as evidence, inside a fenced code block. The
checker described below skips fenced blocks and does **not** produce this false positive; a
simpler line-based checker does. Worth knowing if you rebuild the tool: **skip code fences, or
this report will report itself.**

## Reproducing this report

The link checker used here is not committed to the repo. Its logic, restated so it can be
rebuilt: walk `*.md` excluding `.venv`/`.git`/`.gstack`, track fenced code blocks with a
```` ``` ````/`~~~` toggle and skip their contents, match
`\[(?:[^\]]*)\]\(\s*([^)\s]+)(?:\s+"[^"]*")?\s*\)` for inline links plus
`^\s{0,3}\[[^\]]+\]:\s*(\S+)` for reference definitions, skip targets matching
`^(https?:|ftp:|mailto:|tel:|data:|#|//)`, split off `#` fragments, `urllib.parse.unquote`
the rest, then `os.path.exists(os.path.normpath(os.path.join(dirname(src), target)))`.

The other checks are one-liners:

```bash
# artifacts
grep -rn --include='*.md' -E '<invoke|<parameter name|antml:' . \
  --exclude-dir=.venv --exclude-dir=.git --exclude-dir=.gstack

# details balance (strip inline code first, or you get 3 false positives)
python3 -c "import re,sys; t=re.sub(r'\`[^\`\n]*\`','',open(sys.argv[1]).read()); \
  print(t.count('<details'), t.count('</details>'))" FILE.md

# trailing newline
find . -name '*.md' -not -path './.venv/*' -exec sh -c \
  'tail -c1 "$1" | read -r _ || echo "$1"' _ {} \;

# question banks
python3 reference/to_anki.py question-banks/ --out /tmp/all.tsv
awk -F'\t' 'NF!=3' /tmp/all.tsv | wc -l
```
