# Lab 08 — GWAS, and manufacturing 702 false positives

> **Time:** ~40 min · **Before this:** [lab-07](lab-07-population-genetics.md), [Ch 51](../part-11-human-and-statistical-genomics/51-gwas.md)

You will run a genome-wide association study on a phenotype you **know has no genetic cause
whatsoever**, get hundreds of genome-wide significant hits, and then make them all disappear.

This is the most important lab in the sequence. Population stratification is not a footnote in
GWAS methodology — it is the thing the entire methodology exists to defend against, and the only
way to believe that is to generate the artefact yourself.

All numbers are real, from this machine.

The statistics this lab leans on — logistic regression, the genome-wide threshold, genomic
inflation, principal components as covariates — are taught in
[S4](../part-S-statistics/S4-hypothesis-testing.md),
[S5](../part-S-statistics/S5-variance-and-regression.md) and
[S7](../part-S-statistics/S7-high-dimensional-data.md). You do not need them loaded in advance:
short boxes along the way say what each number means and point at the chapter that derives it.

```bash
# GENOMICS is exported in lab-00. In a fresh shell, set it again:
#   export GENOMICS=/path/to/learn-genomics
cd "$GENOMICS" && source .venv/bin/activate && cd labs/data
export PATH="$HOME/bin:$PATH"
```

Uses the QC'd 1000 Genomes data built in [lab-07](lab-07-population-genetics.md): 3,564 variants
× 2,503 samples on chr22:20–21 Mb.

---

## 1. Simulate a phenotype with no genetic basis

Assign case/control status by a coin flip whose *bias depends only on super-population*. Nothing
about anyone's genotype enters:

```bash
python - <<'PY'
import random
random.seed(42)
pop = {}
for i, row in enumerate(open('panel.txt')):
    if i == 0: continue
    f = row.split()
    if len(f) >= 3: pop[f[0]] = f[2]

# Prevalence differs by ancestry group. This is the ONLY structure in the phenotype.
risk = {'AFR': 0.70, 'EUR': 0.30, 'EAS': 0.30, 'SAS': 0.30, 'AMR': 0.30}

ids = [l.split()[0] for i, l in enumerate(open('chr22_qc.psam')) if i > 0]
with open('pheno_strat.txt', 'w') as fh:
    fh.write("#IID\tstrat\n")
    for s in ids:
        sp = pop.get(s)
        if not sp: continue
        fh.write(f"{s}\t{2 if random.random() < risk[sp] else 1}\n")   # 2=case 1=control
PY
```

999 cases, 1,504 controls.

**Be clear about what has just been built.** The phenotype is a function of ancestry label and a
random number. No genotype was consulted. In a real study this is the situation where a disease
is more common in one group for environmental, social, or diagnostic reasons — which is the
common case, not an exotic one.

The correct number of true genetic associations here is **zero**.

## 2. Run the naive GWAS

```bash
plink2 --pfile chr22_qc --pheno pheno_strat.txt --pheno-name strat \
       --glm allow-no-covars --out gwas_naive
```

`allow-no-covars` is PLINK2 requiring you to say out loud that you are running without
covariates. It is trying to warn you.

> **The statistics here.** `--glm` fits one **logistic regression** per variant: the log-odds of
> being a case is modelled as linear in allele dosage (0/1/2), so the coefficient is a per-allele
> log odds ratio and exp(β) is an odds ratio
> ([S5 §7](../part-S-statistics/S5-variance-and-regression.md)). That model assumes the effect is
> additive in dosage, that samples are independent, and — the assumption this lab is about to
> break — that anything else affecting the phenotype is either in the model or uncorrelated with
> genotype. Read the `P` column as the answer to one narrow question: *if this variant had no
> effect, how often would a coefficient this far from zero arise?* It is not the probability the
> variant does nothing, and on its own it says nothing about how large an effect is
> ([S4 §3](../part-S-statistics/S4-hypothesis-testing.md)).

## 3. Count the damage

Write this as a file rather than a heredoc — §5 runs it again on the corrected scan:

```bash
cat > gwas_summary.py <<'PY'
import sys
from math import erfc, sqrt

def p_to_chi2_1(p):                 # invert the chi2(1) survival function
    lo, hi = 0.0, 2000.0
    for _ in range(300):
        mid = (lo + hi) / 2
        if erfc(sqrt(mid / 2)) > p: lo = mid
        else: hi = mid
    return (lo + hi) / 2

def summarise(path, label):
    ps = []
    with open(path) as fh:
        hdr = fh.readline().rstrip('\n').split('\t')
        iP = hdr.index('P')
        for line in fh:
            f = line.rstrip('\n').split('\t')
            try: p = float(f[iP])
            except (ValueError, IndexError): continue
            if 0 < p <= 1: ps.append(p)
    ps.sort()
    med = ps[len(ps) // 2]
    print(f"{label}")
    print(f"  variants   : {len(ps)}")
    print(f"  p < 5e-8   : {sum(1 for p in ps if p < 5e-8)}")
    print(f"  median p   : {med:.4f}   (null expectation ~0.5)")
    print(f"  lambda_GC  : {p_to_chi2_1(med)/0.4549:.3f}   (well-controlled ~1.0)")

summarise(sys.argv[1], sys.argv[2])
PY

python gwas_summary.py gwas_naive.strat.glm.logistic.hybrid 'NAIVE — no ancestry covariates'
```

```
NAIVE — no ancestry covariates
  variants   : 3564
  p < 5e-8   : 702
  median p   : 0.0041   (null expectation ~0.5)
  lambda_GC  : 18.070   (well-controlled ~1.0)
```

**702 of 3,564 variants — one in five — reach genome-wide significance at p < 5 × 10⁻⁸.**

Every one is false. The phenotype has no genetic component.

Read the diagnostics rather than the hit count:

- **Median p = 0.0041.** Under a true null the median p-value is 0.5. Getting 0.0041 means the
  bulk of the distribution has shifted, not that a few loci stand out.
- **λ_GC = 18.07.** The genomic inflation factor is the ratio of the observed median test
  statistic to its null expectation. Values above ~1.05 warrant investigation; 18 is a
  catastrophe. On a QQ plot every point would lie far above the diagonal from the very first
  quantile — the signature of systematic inflation rather than real signal, which lifts only the
  extreme tail.

> **The statistics here.** Two numbers worth knowing how to read. **5 × 10⁻⁸** is Bonferroni's
> α/*m* with *m* ≈ 10⁶ — not the number of variants in your file, but the number of *effectively
> independent* common-variant tests in the genome, which LD makes far smaller than the marker
> count ([S7 §2](../part-S-statistics/S7-high-dimensional-data.md)). It is fixed in advance and
> does not get more generous because you happened to test only 3,564 variants. **λ_GC** converts
> every p-value back into a χ²₁ statistic — the distribution a 1-degree-of-freedom test follows
> under the null ([S2 §4](../part-S-statistics/S2-distributions.md)) — and divides the observed
> median by the null median 0.4549. Read it as a ratio: 1.0 says the middle of your test
> statistics behaves exactly as the null predicts, 18.07 says the typical statistic is eighteen
> times too large. Because it is built from the *median*, it is a claim about the bulk of the
> scan rather than its tail, which is precisely why it catches a broken model
> ([S7 §4](../part-S-statistics/S7-high-dimensional-data.md)).

## 4. Why it happens

The mechanism is worth stating precisely, because "confounding" is often waved at without a
mechanism.

Take any variant whose allele frequency differs between AFR and non-AFR samples — on chr22
that is most of them. AFR individuals are 70% cases; everyone else is 30%. So:

- the variant's frequency differs between groups, **and**
- case/control status differs between the same groups,

therefore the variant's frequency differs between cases and controls. A regression sees exactly
what it was asked to look for: an allele that predicts the phenotype. It has no way to know the
prediction runs through ancestry rather than biology.

**This is confounding in its purest form**: an unmeasured variable causing both the exposure and
the outcome. It has nothing to do with sample size — bigger samples make the false positives
*more* significant, not less. And it does not require dramatically different populations; a
subtle gradient produces the same effect at lower magnitude, which is harder to notice.

> **The statistics here.** The formal name is **omitted-variable bias**, and it has a closed form.
> If the truth is *y* = β*x* + γ*z* + ε and you leave the confounder *z* out, you do not estimate
> β but β + γδ, where γ is the confounder's effect on the phenotype and δ is the slope of *z* on
> the genotype. [S5 §6](../part-S-statistics/S5-variance-and-regression.md) runs the arithmetic on
> one SNP from this very scan: γ = +0.41, δ = −0.68, and the product accounts for the whole
> apparent effect. Read the consequence rather than the algebra — the estimate is off by a
> *fixed* amount that has nothing to do with how many samples you collected, so the standard error
> shrinks with *n* while the bias sits still. That asymmetry is why every p-value in this scan is
> both correctly computed and useless.

## 5. Fix it with principal components

The PCs from [lab-07](lab-07-population-genetics.md) capture the ancestry axes. Include them as
covariates so the model asks a different question: *given ancestry, does genotype predict the
phenotype?*

```bash
plink2 --pfile chr22_qc --pheno pheno_strat.txt --pheno-name strat \
       --covar chr22_pca.eigenvec --covar-variance-standardize \
       --glm hide-covar --out gwas_pcs
```

Then run the same diagnostics on the new result file:

```bash
python gwas_summary.py gwas_pcs.strat.glm.logistic.hybrid 'CORRECTED — 10 PCs as covariates'
```

```
CORRECTED — 10 PCs as covariates
  variants   : 3361
  p < 5e-8   : 0
  median p   : 0.4711   (null expectation ~0.5)
  lambda_GC  : 1.142   (well-controlled ~1.0)
```

| | naive | + 10 PCs |
|---|---|---|
| hits at p < 5 × 10⁻⁸ | **702** | **0** |
| median p | 0.0041 | 0.4711 |
| λ_GC | **18.07** | **1.14** |

Every false positive is gone, the median p-value is back where the null says it should be, and
λ has fallen from 18.07 to 1.14.

> **The statistics here.** Principal components are the eigenvectors of the genetic relationship
> matrix — the axes along which individuals differ most, each eigenvalue being the variance
> captured along its axis ([S7 §5](../part-S-statistics/S7-high-dimensional-data.md)). They assume
> the structure you care about is *linear* and lives in the leading few directions, which is why
> LD pruning matters: an unpruned long haplotype block can out-vary continental ancestry and take
> a PC for itself. Putting them in as covariates changes the question the regression answers,
> because a coefficient in a multiple regression is the slope of the phenotype on *the part of the
> genotype the covariates cannot explain* (Frisch–Waugh–Lovell,
> [S5 §6](../part-S-statistics/S5-variance-and-regression.md)). So read a corrected p-value as
> "given where this person sits on the ancestry axes, does dosage still predict case status?" —
> and read the leftover λ = 1.14 as the honest part: adjustment removes only the component of the
> confounder your covariates measure, never the confounder itself. That is the argument for mixed
> models, which use the whole relationship matrix instead of ten summary axes
> ([S7 §8](../part-S-statistics/S7-high-dimensional-data.md)).

Two details worth noticing rather than skipping:

**The variant count dropped from 3,564 to 3,361.** Adding ten covariates costs degrees of
freedom, and some variants no longer support a stable fit — typically low-MAF variants nearly
collinear with an ancestry axis. Losing variants to covariate adjustment is normal; losing a
*lot* suggests your covariates are capturing the same thing as your genotypes.

**λ = 1.14 is still not 1.00.** Ten PCs from one megabase do not fully capture ancestry. Residual
inflation is expected, and in a real study you would use more PCs, or a linear mixed model with
a genetic relatedness matrix, which handles structure and cryptic relatedness together.

## 6. λ alone cannot tell you what is wrong

A raised λ has two very different causes, and treating them alike is a serious error:

| Cause | What it means | What to do |
|---|---|---|
| **Confounding** | structure, relatedness, batch effects | fix the model |
| **True polygenicity** | thousands of real small effects genuinely lift the statistics | nothing — this is signal |

A large, well-conducted GWAS of a highly polygenic trait can legitimately show λ around 1.1–1.2
with no confounding at all. Naively "correcting" by dividing test statistics by λ would then
throw away real findings.

**LD-score regression** separates the two. Regress test statistics on LD score:

- a raised **intercept** ⇒ confounding (inflation that does not track LD)
- a raised **slope** with intercept ≈ 1 ⇒ genuine polygenic heritability

This is why λ_GC has been largely superseded by the LD-score intercept as the reported
diagnostic ([Ch 51](../part-11-human-and-statistical-genomics/51-gwas.md)).

> **The statistics here.** λ collapses a whole scan into one median-based ratio, and a median
> cannot distinguish a model that is wrong everywhere from a trait that is genuinely affected
> everywhere — both lift the middle of the χ² distribution. LD-score regression breaks the tie by
> bringing in a second variable, how much each variant tags, and assuming that confounding
> inflates every statistic equally while polygenic signal inflates a variant in proportion to what
> it tags. Read the two fitted numbers separately: the slope estimates heritability, the intercept
> estimates the inflation that does *not* track LD. An intercept near 1 alongside λ = 1.35 is a
> large clean polygenic study; an intercept well above 1 is a model to fix
> ([S7 §4](../part-S-statistics/S7-high-dimensional-data.md)).

## 7. What this lab does not show

Honesty about scope, since a simulation can mislead in the other direction:

- **PCs are not a complete fix.** They handle continuous ancestry variation well and cryptic
  relatedness poorly. Mixed models are the better default.
- **Correcting for ancestry can remove real signal** if a causal variant's frequency genuinely
  tracks ancestry — you cannot separate them by statistics alone.
- **Within-family designs are the gold standard**, because siblings are matched on ancestry by
  construction. They cost power and are worth it where feasible.
- **Our λ = 18 is extreme by design.** Real stratification is usually subtle — λ of 1.05–1.15 —
  which is far more dangerous, because it produces a handful of plausible-looking false
  positives rather than an obviously broken result.

---

## Check yourself

**1. Your GWAS has λ = 1.9 and 40 genome-wide significant hits. What do you conclude?**

<details><summary>Answer</summary>

Not that you have 40 findings. λ = 1.9 means test statistics are inflated nearly twofold
genome-wide, which is far beyond what polygenicity plausibly produces.

The likely causes are uncontrolled structure, cryptic relatedness, or a batch effect correlated
with case status (a classic: cases and controls genotyped on different arrays or in different
years).

Diagnose before rescuing: run LD-score regression and look at the **intercept** — if it is well
above 1, the inflation is confounding rather than signal. Check PCs against case status. Check
genotyping batch against case status. Only then interpret hits, and do not simply divide by λ,
which is a cosmetic fix that discards real signal along with the artefact.

</details>

**2. Why does increasing sample size not fix stratification?**

<details><summary>Answer</summary>

Because it is **bias**, not noise. The association between ancestry-differentiated alleles and a
phenotype whose prevalence differs by ancestry is a genuine statistical association in the
population — it is simply not causal.

More samples estimate that biased quantity more precisely, so the p-values get *smaller* and the
false positives more significant. Increasing n moves you further from the truth with greater
confidence.

The distinction generalises: sample size cures variance, never bias. Only a change of design or
model addresses confounding.

</details>

**3. Adding covariates dropped your variant count from 3,564 to 3,361. Is that a problem?**

<details><summary>Answer</summary>

Not at this magnitude — about 6%. Each covariate costs a degree of freedom, and variants that
are low-MAF or nearly collinear with an ancestry axis no longer support a stable fit, so the
regression fails to converge and PLINK omits them.

It *would* concern me if the loss were large, which would suggest the covariates are explaining
much the same variation as the genotypes — and then adjustment removes real signal along with
confounding. Check which variants dropped: if they cluster in one region or at one frequency
range, understand why before proceeding.

</details>

**4. A collaborator proposes analysing each ancestry group separately and meta-analysing, instead of using PCs. Good idea?**

<details><summary>Answer</summary>

It is a legitimate strategy with real trade-offs, not a straightforward improvement.

**In its favour:** stratified analysis removes between-group confounding by construction, and
meta-analysis handles effect-size heterogeneity explicitly rather than assuming a single shared
effect. Trans-ancestry meta-analysis also improves fine-mapping, because differing LD patterns
narrow credible sets ([Ch 52](../part-11-human-and-statistical-genomics/52-association-to-mechanism.md)).

**Against:** it does not address structure *within* each group, which can be substantial — "EUR"
is not homogeneous. It costs power when effects are genuinely shared. And it needs enough
samples per group, which is exactly what under-represented ancestries lack.

In practice the two are combined: within-group association with PCs or a mixed model, then
trans-ancestry meta-analysis across groups.

</details>
