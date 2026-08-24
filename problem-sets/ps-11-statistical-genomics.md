# Problem set 11 — Statistical genomics

Covers [Ch 51–56](../part-11-human-and-statistical-genomics/51-gwas.md).

**Attempt before revealing.** Every problem here is ten lines of code, and the point is that the
number surprises you. Reading the solution first replaces the surprise with a nod.

Roughly in order of difficulty. ★ marks the two worth the most time.

---

## 1. Where 5 × 10⁻⁸ comes from

**(a)** Derive it by Bonferroni from FWER 0.05 over ~1 × 10⁶ effectively independent common-variant
tests, and give the two-sided |Z| cut-off.
**(b)** Your array has 700,000 variants and you impute to 20 million. Should α be 0.05/(7 × 10⁵) or
0.05/(2 × 10⁷)? Neither — why?
**(c)** African-ancestry haplotype blocks are half as long, so *M*_eff roughly doubles. Compute the
threshold, and the *actual* FWER you incur by using 5 × 10⁻⁸ anyway.
**(d)** WGS pushes *M*_eff to ~10⁷. Compute the threshold, the FWER penalty, and the change in the Z
cut-off. Comment on the last one.

<details><summary>Solution</summary>

**(a)** α = FWER / M = 0.05 / 10⁶ = **5 × 10⁻⁸**

Two-sided, so Pr(Z > c) = α/2 = 2.5 × 10⁻⁸:

c = Φ⁻¹(1 − 2.5 × 10⁻⁸) = **5.4513**, equivalently χ²₁ = 5.4513² = **29.717**

**(b)** *M* is the number of **effectively independent tests** in the population's LD structure,
not rows in your file.

- 0.05/(7 × 10⁵) = 7.1 × 10⁻⁸ is too lax: the array **proxies** for everything it tags.
- 0.05/(2 × 10⁷) = 2.5 × 10⁻⁹ is too strict: 40 markers at r² > 0.95 are one test, not 40.

**Trap:** you cannot buy power by testing fewer variants — the truth about a variant does not depend
on what else you looked at, which is why candidate-gene studies did not replicate ([Ch 51 §5](../part-11-human-and-statistical-genomics/51-gwas.md)).

**(c)** α = 0.05 / (2 × 10⁶) = **2.5 × 10⁻⁸**, c = **5.5733**.

Using 5 × 10⁻⁸ over 2 × 10⁶ independent tests:

FWER = 1 − (1 − 5 × 10⁻⁸)^(2×10⁶) = 1 − e^(−0.1) = **0.0952**

The nominal 5% is really 9.5%. (Published proposals land nearer 1–2 × 10⁻⁸.) A fixed threshold is
**anti-conservative** for African-ancestry samples and conservative elsewhere — the group with most
to gain from discovery has its error controlled least well.

**(d)** α = 0.05 / 10⁷ = **5 × 10⁻⁹**, c = **5.8472**.

FWER at 5 × 10⁻⁸ = 1 − e^(−10⁷ × 5×10⁻⁸) = 1 − e^(−0.5) = **0.393**. Rare variants sit in weak LD
with everything, so each adds nearly a whole test — hence WGS proposals of 5 × 10⁻⁹ to 1 × 10⁻⁸.

The comment: a tenfold tightening of α moved the cut-off only from 5.4513 to 5.8472 — **0.396**, or
7%. The tail is thin enough that order-of-magnitude arguments about *M* barely move the number you
test against, which is how one round figure survived two decades. But the FWER moved by 2× and 8×
while Z moved 7%. It is a convention, not a constant.

</details>

---

## 2. LD from a haplotype table

Two SNPs, rs1 (*A*/*a*) and rs2 (*B*/*b*). 400 phased haplotypes:

```
              rs2 = B     rs2 = b     total
   rs1 = A       144          96        240
   rs1 = a        16         144        160
   total         160         240        400
```

**(a)** Haplotype and allele frequencies.
**(b)** Compute *D*, *D'*, *r*².
**(c)** With X = 1[carries *A*] and Y = 1[carries *B*], show by direct computation that *r*² is the
squared Pearson correlation of X and Y.
**(d)** rs2 is causal but you genotype only rs1. A study of 25,000 is adequately powered on rs2
directly; how many at the tag?
**(e)** Could a denser array find a *perfect* proxy for rs2 at rs1's allele frequency?

<details><summary>Solution</summary>

**(a)** Divide by 400: p_AB = 0.36, p_Ab = 0.24, p_aB = 0.04, p_ab = 0.36.

p_A = 0.36 + 0.24 = **0.60**, p_a = **0.40**; p_B = 0.36 + 0.04 = **0.40**, p_b = **0.60**

**(b)** D = p_AB − p_A p_B = 0.36 − (0.60)(0.40) = 0.36 − 0.24 = **0.12**

Cross-product check: (0.36)(0.36) − (0.24)(0.04) = 0.1296 − 0.0096 = 0.12 ✓

D > 0, so D_max = min(p_A p_b, p_a p_B) = min(0.36, 0.16) = 0.16:

D' = 0.12 / 0.16 = **0.75**
r² = D² / (p_A p_a p_B p_b) = 0.0144 / (0.60 × 0.40 × 0.40 × 0.60) = 0.0144 / 0.0576 = **0.25**, r = 0.50

**(c)** Both indicators are Bernoulli:

E[X] = 0.60, Var(X) = (0.60)(0.40) = 0.24
E[Y] = 0.40, Var(Y) = (0.40)(0.60) = 0.24
E[XY] = Pr(X=1, Y=1) = p_AB = 0.36

Cov(X, Y) = 0.36 − (0.60)(0.40) = **0.12 = D**

r = 0.12 / √(0.24 × 0.24) = 0.12/0.24 = 0.50, r² = **0.25** ✓

*D* is not *analogous* to a covariance; it **is** the covariance of the two columns of the haplotype
matrix — so r² is the fraction of variance in one column explained by the other, which is what (d)
uses.

**(d)** R²_tag = r²·R²_causal and λ ≈ N·R² ([Ch 29 §5](../part-05-population-genetics/29-linkage-disequilibrium.md)), so equal power needs

N_tag = 25,000 / 0.25 = **100,000**

Four times the cohort. The r² ≥ 0.8 array-design convention accepts 25% inflation and no more.

**(e) Trap.** No, and density cannot help. r² = 1 requires D² = p_A p_a p_B p_b, forcing p_A = p_B.
Here they are 0.60 and 0.40, so even at maximum LD:

r²_max = D_max² / 0.0576 = 0.0256 / 0.0576 = **0.444**

**A common variant can never be a perfect proxy for one of different frequency, however tightly
bound** — which is why D' = 1 is a terrible tagging criterion.

</details>

---

## 3. Population stratification, with no causal effect anywhere ★

A 50:50 mixture of two non-interbreeding subpopulations.

| | Subpop 1 | Subpop 2 |
|---|---|---|
| Individuals | 10,000 | 10,000 |
| Risk-allele frequency | 0.10 | 0.50 |
| Disease prevalence | 5% | 25% |

**Inside each subpopulation the variant has exactly zero effect.**

**(a)** Compute Cov(g, y) pooled, g the 0/1/2 dosage and y the 0/1 status; check against
2w(1−w)(p₁ − p₂)(μ₁ − μ₂).
**(b)** Build the pooled case/control allele table and compute the odds ratio.
**(c)** Compute χ² and comment on the p-value.
**(d)** Stratify: the odds ratio within each subpopulation.
**(e)** A collaborator proposes recruiting ten times as many people. What happens?

<details><summary>Solution</summary>

**(a)** Within a subpopulation g and y are independent, so E[gy] = E[g]E[y] there.

Subpop 1: E[g] = 2(0.10) = 0.20, E[y] = 0.05 → E[gy] = 0.010
Subpop 2: E[g] = 2(0.50) = 1.00, E[y] = 0.25 → E[gy] = 0.250

Pooled with w = 0.5: E[g] = 0.60, E[y] = 0.15, E[gy] = 0.5(0.010) + 0.5(0.250) = 0.130

Cov(g, y) = 0.130 − (0.60)(0.15) = **0.04**

Formula: 2(0.5)(0.5)(0.10 − 0.50)(0.05 − 0.25) = 0.5 × (−0.40)(−0.20) = **0.04** ✓

Non-zero because *both* differences are. Ancestry is a common cause of genotype and phenotype — a
confounder in the strict sense.

**(b)** Cases: 500 and 2,500 (3,000); controls 9,500 and 7,500 (17,000). With no effect each group
carries the allele at its own subpopulation's frequency.

Case risk alleles = 2(500)(0.10) + 2(2,500)(0.50) = 100 + 2,500 = 2,600 of 6,000
Control risk alleles = 2(9,500)(0.10) + 2(7,500)(0.50) = 1,900 + 7,500 = 9,400 of 34,000

```
            risk    other    total
  cases     2,600    3,400    6,000     freq 0.4333
  controls  9,400   24,600   34,000     freq 0.2765
```

OR = (2,600 × 24,600)/(3,400 × 9,400) = 63,960,000 / 31,960,000 = **2.001**

**(c)** χ² = N(ad − bc)² / [(a+b)(c+d)(a+c)(b+d)]

ad − bc = 63,960,000 − 31,960,000 = 3.2 × 10⁷, squared = 1.024 × 10¹⁵
Denominator = (6,000 × 34,000)(12,000 × 28,000) = (2.04 × 10⁸)(3.36 × 10⁸) = 6.8544 × 10¹⁶

χ² = 40,000 × 1.024 × 10¹⁵ / 6.8544 × 10¹⁶ = **597.6**, Z = 24.4, p ≈ **6 × 10⁻¹³²**

A hundred and twenty-four orders of magnitude past 5 × 10⁻⁸, for a variant with no effect on
anything. The p-value is not lying — genotype and phenotype *are* associated here — it just has no
opinion about why.

**(d)** Subpop 1: 100/1,000 vs 1,900/19,000 → OR = (100 × 17,100)/(900 × 1,900) = **1.000**
Subpop 2: 2,500/5,000 vs 7,500/15,000 → OR = (2,500 × 7,500)/(2,500 × 7,500) = **1.000**

χ² = 0 in each. The signal vanishes once the confounder is in the model, because the signal *was*
the confounder.

**(e) The trap.** It gets worse. Stratification is **bias, not variance**: the estimate does not
shrink with *n*, only the standard error does, so the non-centrality grows linearly in *N*.

χ² at 200,000 people = 597.6 × 10 = **5,976**

Every other error in genomics improves with more data. **A bigger study makes a stratification
artefact more significant, not less.** Campbell and colleagues (2005) reported p < 10⁻⁶ between a SNP
at *LCT* and height, in a panel that passed the stratification tests of the day: *LCT* frequency
varies steeply across Europe, and so does height.

</details>

---

## 4. Power, and where it goes when the allele gets rare

5,000 cases and 5,000 controls. The non-centrality of the 1-df test is

λ = N · φ(1−φ) · Var(g) · ln(OR)²

with N the total sample, φ the case fraction, Var(g) = 2p(1−p).

**(a)** Power to detect OR = 1.20 at MAF 0.30, α = 5 × 10⁻⁸.
**(b)** Repeat at MAF 0.05 and 0.005, holding OR and N fixed.
**(c)** At MAF 0.0005, how many minor-allele copies are in the study, and what is the smallest
p-value *any* test could return?
**(d)** Thirty loss-of-function variants in one gene, each at MAF 0.0005 with OR = 2.0 in the same
direction. Compare single-variant power with a burden test at α = 0.05/20,000.

<details><summary>Solution</summary>

**(a)** ln(1.20) = 0.182322, so ln(OR)² = 0.0332412. Balanced: φ(1−φ) = 0.25. Var(g) = 2(0.30)(0.70) = 0.42.

λ = 10,000 × 0.25 × 0.42 × 0.0332412 = 1,050 × 0.0332412 = **34.90**, E[Z] = √34.90 = **5.908**

Power = Pr(Z > 5.4513 | mean 5.908) = Pr(N(0,1) > −0.4566) = **0.676**

**(b)** Only Var(g) changes.

MAF 0.05: Var(g) = 0.095 → λ = 2,500 × 0.095 × 0.0332412 = **7.895**, E[Z] = 2.810,
power = Pr(N(0,1) > 2.641) = **0.0041**

MAF 0.005: Var(g) = 0.00995 → λ = 2,500 × 0.00995 × 0.0332412 = **0.827**, E[Z] = 0.909,
power = Pr(N(0,1) > 4.542) = **2.8 × 10⁻⁶**

So 68% → 0.41% → 0.0003%. Power scales essentially as *p*, since 2p(1−p) → 2p — but not gently. It
is a *tail* probability, √λ against a fixed 5.45, so a sixfold drop in MAF takes 68% to under half a
percent.

**(c)** Minor-allele copies = 2Np = 2 × 10,000 × 0.0005 = **10**. Under the null each carrier is a
case with probability ½, so the most extreme outcome conceivable is all 10 being cases:

p_min = 2⁻¹⁰ = **9.8 × 10⁻⁴**

Four orders short of 5 × 10⁻⁸ **whatever the effect size and whatever the test** — an information
bound ([Ch 54 §2](../part-11-human-and-statistical-genomics/54-rare-variants-and-mendelian-disease.md)), not a modelling weakness. Generally 2⁻ᵏ ≤ 5 × 10⁻⁸ requires k ≥ **25 carriers**.

**Trap:** at MAF 0.005 there are 100 carriers, past that floor, and power is still 0.0003%. Clearing
the floor is necessary, not sufficient.

**(d)** Single variant at MAF 0.0005, OR = 2.0: ln(2)² = 0.480453.

λ = 2,500 × 0.0009995 × 0.480453 = **1.201**, E[Z] = 1.096, power = **6.6 × 10⁻⁶**

Burden test: aggregate allele frequency = 30 × 0.0005 = 0.015, so Var = 2(0.015)(0.985) = **0.02955**
— **29.6×** any single component. Effects are same-signed, so the numerator (Σβⱼvⱼ)² accumulates
rather than cancels.

λ = 2,500 × 0.02955 × 0.480453 = **35.49**, E[Z] = **5.958**

The threshold also relaxes: ~20,000 genes, α = 2.5 × 10⁻⁶, two-sided c = **4.708**.

Power = Pr(Z > 4.708 − 5.958) = Pr(N(0,1) > −1.250) = **0.894**

From 0.0007% to 89% on the same 10,000 people: aggregation buys carriers (10 → 300 alleles), and
gene-level testing buys a threshold two orders cheaper. If half the masked variants had OR < 1 the
numerator would cancel to zero, which is why a bidirectional gene needs SKAT ([Ch 54 §7](../part-11-human-and-statistical-genomics/54-rare-variants-and-mendelian-disease.md)).

</details>

---

## 5. Winner's curse and the replication you did not budget for

Quantitative trait, SD 1. Discovery: N = 100,000, MAF 0.20, true effect β = 0.02 SD.

**(a)** Compute R², λ, E[Z], and power to reach 5 × 10⁻⁸.
**(b)** Given the variant *is* reported, compute the expected published effect, using
E[Z | Z > c] = μ + φ(c − μ)/(1 − Φ(c − μ)).
**(c)** How large must an independent replication be for 80% power at one-sided nominal 0.05, with
direction prespecified?
**(d)** A colleague powers the replication on the *published* effect. What N do they pick, what power
do they get, and how does the shortfall relate to (b)?

<details><summary>Solution</summary>

**(a)** Var(g) = 2(0.20)(0.80) = 0.32

R² = β²Var(g) = 0.0004 × 0.32 = **1.28 × 10⁻⁴** (0.0128% of trait variance)
λ = 100,000 × 1.28 × 10⁻⁴ = **12.80**, E[Z] = **3.5777**

Power = Pr(Z > 5.4513 | mean 3.5777) = Pr(N(0,1) > 1.8736) = **0.0305**

A typical common-variant effect, in 100,000 people, is found one time in thirty-three.

**(b)** That 3% is the mechanism: the estimate clears 5.4513 only when noise pushes it up, so
conditioning on discovery conditions on a favourable draw. With c − μ = 5.4513 − 3.5777 = **1.8736**:

φ(1.8736) = e^(−1.7552)/√(2π) = 0.17287/2.5066 = **0.068967**
1 − Φ(1.8736) = **0.030493** (the power from (a) — it must be)
Inverse Mills ratio = 0.068967/0.030493 = **2.2617**

E[Z | detected] = 3.5777 + 2.2617 = **5.8395**, inflation = 5.8395/3.5777 = **1.632**

Published β̂ ≈ 0.02 × 1.632 = **0.0326**; variance explained inflated by 1.632² = **2.66×**, since R²
goes as β². This is truncation, not p-hacking: it happens in a perfectly honest study with a correct
model, and bites hardest on the most marginal findings.

**(c)** The curse does not travel; in a fresh sample E[Z] returns to the truth and scales as √N.

Required E[Z] = 1.6449 + 0.8416 = **2.4865**
N_rep = 100,000 × (2.4865/3.5777)² = 100,000 × 0.48302 = **≈ 48,300**

Half the discovery cohort — which is why replication uses a nominal threshold and prespecified
direction rather than 5 × 10⁻⁸ twice, which would reject nearly every true finding.

**(d) The trap.** Powering on β̂ = 0.0326:

R̂² = (0.0326)² × 0.32 = 3.4008 × 10⁻⁴
N = 2.4865² / (3.4008 × 10⁻⁴) = 6.1827 / (3.4008 × 10⁻⁴) = **≈ 18,180**

The actual non-centrality at that N uses the *true* R²:

λ = 18,180 × 1.28 × 10⁻⁴ = 2.327, E[Z] = 1.5255
Actual power = Pr(Z > 1.6449 − 1.5255) = Pr(N(0,1) > 0.1194) = **0.452**

Forty-five percent, not eighty — and the study then "fails to replicate" something real. Exactly:

48,300 / 18,180 = **2.66 = (inflation)² = the inflation in variance explained**

**Effects inflate by 1.63, so replication sample sizes must inflate by 1.63² = 2.66**, since power
depends on β². Never power a replication on the discovery estimate, and shrink discovery betas before
building a polygenic score ([Ch 53 §2](../part-11-human-and-statistical-genomics/53-polygenic-scores.md)).

</details>

---

## 6. From a polygenic score to an actual number ★

Disease with lifetime prevalence K = 2%. A score standardised to N(0,1) explains ρ² = 0.16 of
variance in **liability**: affected if L = ρS + √(1−ρ²)·U exceeds T = Φ⁻¹(1−K), with U ~ N(0,1)
independent of S.

**(a)** Derive Pr(affected | S = s) and verify it integrates back to K.
**(b)** Compute absolute risk at the 50th, 90th and 99th percentiles. Taking the top-decile average
as 7.35%, express the top decile as a relative risk and an absolute risk, and state what fraction of
all cases it contains.
**(c)** The score is applied in an ancestry absent from training. Tag–causal LD is preserved
(r = 0.9) at 50% of loci, halved (r = 0.45) at 30%, destroyed (r = 0) at 20%. Compute the factor by
which R² falls, then recompute the top-decile risk. (Its average at the reduced ρ² is 5.01%.)
**(d)** Name the remaining mechanisms — three more in the tabulation, plus one easily forgotten —
and quantify the allele-frequency one.

<details><summary>Solution</summary>

**(a)** Affected means L > T:

Pr(ρs + √(1−ρ²)U > T) = Pr(U > (T − ρs)/√(1−ρ²)) = **Φ((ρs − T)/√(1−ρ²))**

ρ = 0.400, √(1−ρ²) = √0.84 = 0.916515, T = Φ⁻¹(0.98) = 2.053749.

a ≡ ρ/√(1−ρ²) = 0.400/0.916515 = **0.436436**
b ≡ T/√(1−ρ²) = 2.053749/0.916515 = **2.240824**

Pr(affected | S = s) = **Φ(0.436436 s − 2.240824)**

Check: E[Φ(aS − b)] = Φ(−b/√(1+a²)) = Φ(−2.240824/1.091089) = Φ(−2.053749) = **0.0200** ✓ — the
curve integrates back to the prevalence, which catches every sign error at once.

**(b)** s = 0, +1.2816, +2.3263 at the 50th, 90th and 99th percentiles:

50th: 0 − 2.240824 = −2.2408 → Φ = **1.25%**
90th: 0.436436(1.2816) − 2.240824 = 0.5593 − 2.2408 = −1.6815 → Φ = **4.63%**
99th: 0.436436(2.3263) − 2.240824 = 1.0153 − 2.2408 = −1.2255 → Φ = **11.02%**

Top decile at 7.35%:

- Relative risk vs population average = 7.35/2.00 = **3.67×**
- Absolute increase = 7.35% − 2.00% = **5.35 percentage points**
- **92.6% of the top decile never develop the disease**
- Cases falling in the top decile = 0.10 × 0.0735 / 0.02 = **36.7%**

"Nearly four times the average risk" and "screening this group still misses 63% of cases" describe
the same table.

**Trap:** do not evaluate the decile at its midpoint (95th percentile, 6.39%); Φ is convex there, so
the true average of 7.35% exceeds it. The same flatness makes rarer diseases give larger ratios
attached to smaller absolute risks.

**(c)** In standardised units the GWAS fits ŵⱼ = r_disc,j βⱼ on each tag. Applying those weights where
the tag–causal correlation is r_tgt,j, with tags approximately independent:

Cov(S, y)_target = Σ r_disc,j r_tgt,j βⱼ² ,  Var(S)_target = Σ r_disc,j² βⱼ²
R²_target / R²_discovery = [ mean(r_disc·r_tgt) / mean(r_disc²) ]²

mean(r_disc·r_tgt) = 0.9 × [0.50(0.90) + 0.30(0.45) + 0.20(0)] = 0.9 × 0.585 = **0.5265**
mean(r_disc²) = 0.81, ratio = 0.5265/0.81 = **0.65**, so R² falls by **0.65² = 0.4225**

New ρ² = 0.16 × 0.4225 = **0.0676**, ρ = 0.260, √(1−ρ²) = √0.9324 = 0.965609
a′ = 0.269260, b′ = 2.126896
90th percentile: Φ(0.269260 × 1.281552 − 2.126896) = Φ(−1.781825) = **3.74%** (was 4.63%)
Top decile **5.01%** (was 7.35%) → RR **2.51×** (was 3.67×), cases captured **25.1%** (was 36.7%)

Same disease, same score, different people. And where LD *phase* flips, r enters negatively and the
variant actively subtracts.

**(d) Allele-frequency differences.** A locus contributes wⱼ²·2pⱼ(1−pⱼ) to score variance. A tag at
MAF 0.20 contributes 2(0.20)(0.80) = 0.32; the same tag at MAF 0.02 contributes 2(0.02)(0.98) =
0.0392 — a factor of **0.1225**, an 88% collapse. Loci carrying 15% of discovery score variance now
carry 0.15 × 0.1225 = **1.8%**. The score's mean and variance shift, breaking **calibration** even
where ranking survives; recalibration makes the number honest, not more informative.

**Effect-size heterogeneity.** α = a + d(q − p) is frequency-dependent by construction
([Ch 30](../part-06-quantitative-genetics/30-quantitative-traits.md)), and G×E and epistasis push the
same way — the *estimand itself* differs, independent of measurement.

**Environment and trait definition.** Different exposure distributions, diagnostic thresholds,
ascertainment and access to care mean the thing being predicted is not the same trait, so even
perfect weights mispredict.

**And a fifth, easily forgotten.** Residual population stratification in the discovery GWAS puts a
non-causal component into the weights ([Ch 51](../part-11-human-and-statistical-genomics/51-gwas.md)).
It is a property of that cohort's structure, does not transfer, and can transfer with the wrong sign.

**The framing, routinely got wrong.** None of these says biology differs between groups; each is
a property of **whose genomes were in the training data**. Run the same pipeline on an
African-ancestry cohort and the score works there and degrades in Europeans
([Ch 53 §7](../part-11-human-and-statistical-genomics/53-polygenic-scores.md)).

</details>

---

## 7. Classifying a variant under ACMG 2015

**This case is constructed.** The variant and every observation are invented to exercise the
framework; nothing here is a claim about a real residue.

A proband with long QT syndrome. Panel sequencing returns one missense candidate in *KCNQ1*, a gene
with definitive validity for LQT1. Evidence:

- Absent from gnomAD v4 (0 of ~1.6 × 10⁶ alleles).
- REVEL = 0.85 — the ClinGen-calibrated Moderate bin is [0.773, 0.932).
- Segregates with disease through 3 informative meioses.
- Three other in-silico predictors also call it damaging.
- A 2011 case report calls it "likely disease-causing".

Points: Supporting 1, Moderate 2, Strong 4, Very Strong 8. Posterior = π·X^(N/8)/(π·X^(N/8) + 1 − π),
with π = 0.10, X = 350.

**(a)** Compute AF_max for LQTS via *KCNQ1* with D = 1/2,000, g = 0.35, a = 0.05, ψ = 0.6. Is absence
from gnomAD informative?
**(b)** Which codes apply, at what strength? Total the points.
**(c)** Compute the posterior and the class; confirm against the 2015 combining rules.
**(d)** Which two listed observations contribute **nothing**, and why?
**(e)** A calibrated deep mutational scan is abnormal at PS3_Moderate. Reclassify.

<details><summary>Solution</summary>

**(a)** For a dominant condition, AF_max = D·g·a/(2ψ):

AF_max = (5 × 10⁻⁴ × 0.35 × 0.05)/(2 × 0.6) = 8.75 × 10⁻⁶ / 1.2 = **7.29 × 10⁻⁶**

In 1.6 × 10⁶ alleles that is **≈ 11.7 alleles**, so the database *resolves* the maximum credible
frequency and zero observations means something: the rule-of-three bound on 0/(1.6 × 10⁶) is
3/(1.6 × 10⁶) = **1.9 × 10⁻⁶**, below AF_max.

Informative but weak, so ClinGen downgrades PM2 to **Supporting** — almost every variant is absent
from almost every database, and rarity is what benign and pathogenic rare variants share.

**(b)**

```
PM2_Supporting   absent from gnomAD, below AF_max      Supporting   +1
PP3_Moderate     REVEL 0.85, calibrated Moderate bin   Moderate     +2
PP1              segregation, 3 informative meioses    Supporting   +1
                                                                    ---
                                                                      4 points
```

**(c)** OddsPath = 350^(4/8) = 350^0.5 = **18.708**

Posterior = (0.10 × 18.708)/(0.10 × 18.708 + 0.90) = 1.8708/2.7708 = **0.675**

0.10 < 0.675 < 0.90 → **VUS**.

By the 2015 rules: 1 Moderate + 2 Supporting. Likely pathogenic needs ≥3 Moderate, or 2 Moderate +
≥2 Supporting, or 1 Moderate + ≥4 Supporting. None is met → **VUS** ✓ — the point ladder was
reverse-engineered from these rules ([Ch 55 §3](../part-11-human-and-statistical-genomics/55-clinical-variant-interpretation.md)), so this is not luck.

**A VUS licenses no clinical action and no testing of relatives.** "Being cautious" about a VUS is
acting on a VUS.

**(d) The two traps.**

**The three extra predictors contribute nothing.** They share training features and alignments and
are in several cases built from one another, so counting their agreement violates the conditional
independence that makes multiplying likelihood ratios legal. Use one calibrated predictor, once, at
its calibrated strength — which PP3_Moderate already is.

**The 2011 case report contributes nothing.** That is PP5, **withdrawn by ClinGen**: it launders
someone else's unexamined conclusion into your evidence, and if that conclusion rested on the same
prediction you already counted, you count it twice. BP6 is withdrawn symmetrically.

**(e)** Add PS3_Moderate, +2 → **6 points**.

OddsPath = 350^(6/8) = **80.92**, posterior = 8.092/8.992 = **0.900** → **Likely pathogenic** (the
0.90 boundary, essentially exactly). By the 2015 rules: 2 Moderate + 2 Supporting → LP ✓

One experiment, two different clinical reports, identical variant. Note the margin: drop either
Supporting criterion and it is 5 points, posterior 0.812, VUS again. A call on a tier boundary should
be reported as one.

**Currency note.** This is Richards et al. 2015 as refined by ClinGen SVI and expert panels, still
the operative standard. **ACMG v4 is in draft**, previewed at the 2025 Clinical Genomics Meeting: it
consolidates evidence codes so related observations cannot be double-counted structurally — exactly
the problem in (d) — and subdivides the VUS band. The five tiers survive, but a report issued today
against a draft standard is not interpretable by whoever receives it.

</details>

---

## 8. Clonal architecture from VAFs

Tumour with matched normal. **Purity ρ = 0.70**, all loci autosomal so CN_n = 2.

| Mutation | VAF | Local tumour CN | Coverage log₂ ratio |
|---|---:|---:|---:|
| *TP53* p.(Arg175His) | 0.35 | 2 | 0.00 |
| *KRAS* p.(Gly12Asp) | 0.34 | 2 | 0.00 |
| *CDKN2A* p.(Trp110Ter) | 0.54 | 1 | −0.62 |
| *SMAD4* p.(Arg361His) | 0.28 | 2 | 0.00 |
| *ARID1A* p.(Gln456fs) | 0.14 | 2 | 0.00 |

Use φ = VAF × [ρ·CN_t + (1−ρ)·CN_n] / (ρ·m), with *m* mutant copies per carrying cell.

**(a)** Compute φ for *TP53*, *KRAS*, *SMAD4*, *ARID1A* assuming m = 1. Clonal or subclonal?
**(b)** Compute φ for *CDKN2A* naively (CN_t = 2), then correctly. What does the naive answer tell
you, and how does the log₂ ratio decide between the two explanations?
**(c)** Reconstruct the clonal ordering, using the pigeonhole rule.
**(d)** The purity caller had returned ρ = 0.50. Show the data refute it.

<details><summary>Solution</summary>

**(a)** At a diploid locus the bracket is ρ(2) + (1−ρ)(2) = 2 regardless of ρ, so with m = 1,
φ = VAF × 2/0.70 = VAF × **2.857143**.

- *TP53*: 0.35 × 2.857143 = **1.000** → **clonal**
- *KRAS*: 0.34 × 2.857143 = **0.971** → **clonal** (within noise of 1)
- *SMAD4*: 0.28 × 2.857143 = **0.800** → **subclonal**, 80% of tumour cells
- *ARID1A*: 0.14 × 2.857143 = **0.400** → **subclonal**, 40% of tumour cells

*TP53* and *SMAD4* differ by seven points of VAF, yet one is in every tumour cell and the other in
four fifths. **VAF is not interpretable; CCF is.**

**(b)** Naive: φ = 0.54 × 2.857143 = **1.543**. A CCF above 1 is meaningless — a mutation cannot be
in more tumour cells than exist. Exactly two candidate fixes:

1. **m = 2** (copy-neutral LOH): φ = 0.54 × 2/(0.70 × 2) = **0.771**
2. **CN_t = 1** (wild-type copy deleted): bracket = 0.70(1) + 0.30(2) = 1.30, so
   φ = 0.54 × 1.30/0.70 = 0.54 × 1.857143 = **1.003**

The **log₂ ratio decides**. A hemizygous deletion at ρ = 0.70 gives observed copy number 1.30, so
log₂(1.30/2) = log₂(0.65) = **−0.62** — exactly what is reported; two retained copies would give
0.00. So φ(*CDKN2A*) = **1.00 → clonal**, second allele lost by deletion: Knudson's two hits ([Ch 56 §5](../part-11-human-and-statistical-genomics/56-cancer-genomics.md)).

**The lesson:** a CCF above 1 is not an error to clamp. It is the estimator telling you a copy-number
or multiplicity assumption is wrong, and which orthogonal measurement to read.

**(c)** Three clusters: **{1.00, 0.97, 1.00}**, **{0.80}**, **{0.40}**. The first is the founding
clone. Could *SMAD4* (0.80) and *ARID1A* (0.40) be sibling branches?

**Pigeonhole rule:** siblings occupy disjoint sets of cells, so their CCFs sum to at most 1.

0.80 + 0.40 = **1.20 > 1** → **not siblings.** One is nested inside the other, and the larger is
ancestral. The frequencies alone force the topology:

```
normal cell
   │  TP53 p.(Arg175His), KRAS p.(Gly12Asp),
   │  CDKN2A nonsense + deletion of the second allele
   ▼
founding clone      CCF = 1.00
   │  SMAD4 p.(Arg361His)
   ▼
subclone B          CCF = 0.80
   │  ARID1A p.(Gln456fs)
   ▼
subclone C          CCF = 0.40   (nested inside B)
```

Two caveats. This rests on the **infinite-sites assumption** — each position mutates at most once —
which fails at CpG hotspots and wherever LOH has erased a mutated allele. And it is one biopsy: bulk
sequencing cannot resolve subclones below ~5–10% CCF, precisely where a pre-existing resistant clone
sits before treatment selects for it.

**(d)** At ρ = 0.50 the diploid m = 1 factor becomes 2/0.50 = 4.000:

φ(*TP53*) = 0.35 × 4.000 = **1.40** — impossible
φ(*SMAD4*) = 0.28 × 4.000 = **1.12** — impossible

Two independent diploid loci above 1 is not a multiplicity coincidence, it is a purity error. At a
diploid locus with m = 1, VAF = ρφ/2 ≤ ρ/2, so

**ρ ≥ 2 × VAF_max** → here 2 × 0.35 = **0.70**

The highest-VAF clonal diploid mutation is a free purity calibrator.

</details>

---

## Where you went wrong

| Error pattern | What to re-read |
|---|---|
| Divided 0.05 by the number of variants in your file | 1(b) — the threshold prices the genome, not the file |
| Used 5 × 10⁻⁸ regardless of ancestry or assay | 1(c)–(d) — FWER 9.5% and 39% |
| Read *D'* = 1 as "good tag", or forgot the 1/r² penalty | 2(d)–(e) — r² = 1 needs matched frequencies |
| Believed a bigger sample fixes confounding | 3(e) — stratification is bias, not variance |
| Treated a tiny p-value as evidence of causation | 3(c) — p = 6 × 10⁻¹³² with zero causal effect |
| Assumed enough carriers means enough power | 4(c) — 100 carriers, power 0.0003% |
| Powered a replication on the published effect size | 5(d) — the penalty is the *square* of the inflation |
| Quoted a decile relative risk without the baseline | 6(b) — 3.67× is 5.35 percentage points |
| Called portability failure a biological difference | 6(d) — a property of the training data |
| Counted several in-silico predictors as separate evidence | 7(d) — not conditionally independent |
| Read a VAF as a cancer cell fraction, or clamped CCF to 1 | 8(a)–(b) — CCF > 1 tells you the copy state |
