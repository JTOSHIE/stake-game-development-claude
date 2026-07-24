# Bet-level compliance verification, Future Spinner, 2026-07-25

Two-computer verification. Fable pre-computed every figure independently from the
shipped lookup tables. This document is the second computer: figures below were
produced by `scripts/qa/bet_level_compliance.py`, written for this pass without
reference to Fable's working, then reconciled.

- **Source tables:** `games/future_spinner/library/publish_files/lookUpTable_<mode>_0.csv`,
  the frozen publish set, read-only throughout. 100,000 rows per mode, five modes.
- **Limits source:** `docs/stake-engine-live/2026-07-25/math-verification.md`, captured
  live this pass.
- **Raw output:** `reports/qa/bet_level_compliance_raw_2026-07-25.json`.
- **Arithmetic:** exact rational and 40-digit decimal throughout. No floating point
  anywhere in the accumulation path.

## 1. Reconciliation against Fable's independent figures

| Figure | Fable | This computer | Agrees |
|---|---|---|---|
| Base SD | 17.28 | 17.2841 | yes |
| Cruise SD | 11.29 | 11.2897 | yes |
| OVERBOOST SD | 20.32 | 20.3234 | yes |
| Buy Overdrive SD | 206.63 | 206.6329 | yes |
| NITRO SD | 539.16 | 539.1618 | yes |
| P(>=5000x) base | 1.0e-5 | 1.000000e-05 | yes |
| P(>=5000x) cruise | 4.0e-6 | 4.000000e-06 | yes |
| P(>=5000x) antelite | 1.25e-5 | 1.250000e-05 | yes |
| P(>=5000x) bonus | 1.0e-3 | 1.000000e-03 | yes |
| P(>=5000x) super | 4.0e-3 | 4.000000e-03 | yes |
| P(>=10000x) all modes | 0 | 0 | yes |
| ETL(>10000x) all modes | 0 | 0 | yes |
| ETL(40x cost) base | 0.524 | 0.5239 | yes |
| ETL(40x cost) cruise | 0.333 | **0.3351** | **NO, see below** |
| ETL(40x cost) antelite | 0.665 | 0.6654 | yes |
| ETL(40x cost) bonus | 0.052 | 0.0519 | yes |
| ETL(40x cost) super | 0.000 | 0.0000 | yes |
| CVaR99 base | 61.9 | 61.9559 | yes |

Nineteen of twenty figures reconcile. The twentieth is resolved below rather than
left as a discrepancy.

### 1.1 The one divergence, root-caused

Cruise ETL(40x cost): Fable 0.333, this computer 0.3351. Difference 0.0018.

Cause is **threshold inclusivity**, not an arithmetic error on either side:

| Mode | Threshold | Rows exactly on threshold | ETL inclusive (x >= T) | ETL exclusive (x > T) | Difference |
|---|---|---|---|---|---|
| base | 40.0x | 2 | 0.523882 | 0.523847 | 0.000034 |
| cruise | 40.0x | 2 | 0.335083 | 0.333293 | **0.001791** |
| antelite | 50.0x | 1 | 0.665376 | 0.665340 | 0.000036 |
| bonus | 4000.0x | 0 | 0.051910 | 0.051910 | 0 |
| super | 16000.0x | 0 | 0.000000 | 0.000000 | 0 |

Cruise carries two simulations sitting exactly on its 40.00x threshold with a combined
weight of 48,564,670,106, worth 0.001791 of total RTP. It is the only mode where the
two conventions are distinguishable at three decimal places: base and antelite also
have threshold atoms, but theirs are roughly fifty times lighter and both conventions
round to the same published figure.

Fable's 0.333 matches the **exclusive** computation exactly (0.333293). This computer
used **inclusive**.

**Resolution: inclusive is correct.** The published definition reads "wins **>= 40x**
Cost-Multiplier", which is at-or-above on its face. The figure carried forward in this
document is therefore 0.3351 for cruise.

**Materiality: none.** Cruise is not the binding mode on this constraint under either
convention. The worst case across modes is OVERBOOST at 0.6654, and cruise sits far
below it either way. No verdict anywhere in this document changes.

## 2. Per-mode measured values

| Mode | Cost | RTP | Max win | SD (raw) | P(>=5000x) | Cost scale | P scaled | ETL(40x cost) |
|---|---|---|---|---|---|---|---|---|
| base | 1.0x | 96.350000% | 5,000x | 17.2841 | 1.000000e-05 | 1.0 | 1.000000e-05 | 0.5239 |
| cruise | 1.0x | 96.350000% | 5,000x | 11.2897 | 4.000000e-06 | 1.0 | 4.000000e-06 | 0.3351 |
| antelite | 1.25x | 96.350000% | 5,000x | 20.3234 | 1.250000e-05 | 1.0 | 1.250000e-05 | 0.6654 |
| bonus | 100.0x | 96.350000% | 5,000x | 206.6329 | 1.000000e-03 | 1.0 | 1.000000e-03 | 0.0519 |
| super | 400.0x | 96.350000% | 5,000x | 539.1618 | 4.000000e-03 | 0.8 | 3.200000e-03 | 0.0000 |

RTP spread across all five modes: **0.000000 pp** against a 0.5% allowance.

Two structural facts worth stating explicitly because they carry several limits at once:

- **P(>=10000x) is structurally zero in every mode.** Every table's maximum payout is
  exactly 5,000x. This is not a small measured probability, it is an impossibility
  given the hard cap, and it therefore also forces ETL(P>10000) to zero everywhere.
- **NITRO's ETL(40x cost) is structurally zero.** Its threshold is 40 x 400 = 16,000x,
  which the 5,000x cap puts permanently out of reach. Nothing can qualify.

Only NITRO (400x) earns tail-probability relief, landing in the published 200-to-500
band at scale 0.8. Buy Overdrive at 100x sits below the lowest published band and takes
**no** relief, scale 1.0.

## 3. Compliance table with margins

Target tier is 3 stars. The 2-star column is carried because a rounded reviewer average
can land there, and two constraints tighten materially if it does.

| Constraint | Our value | 3-star limit | Used | 2-star limit | Used | Verdict |
|---|---|---|---|---|---|---|
| RTP range | 96.3500% | 90.0 to 96.70% | 99.64% of ceiling | same | same | PASS, **flagged** |
| RTP spread across modes | 0.0000 pp | 0.5 pp | 0.00% | same | same | PASS |
| Maximum Payout Multiplier | 5,000x | 100,000x | 5.00% | 25,000x | 20.00% | PASS |
| Maximum Cost Multiplier | 400x | 1,500x | 26.67% | 1,000x | 40.00% | PASS |
| Minimum Base SD | 17.2841 | 0.6 | 28.8x above floor | 0.6 | 28.8x above floor | PASS |
| Maximum Base SD | 17.2841 | 60.0 | 28.81% | 50.0 | 34.57% | PASS |
| P(>=5000x), worst scaled | 3.200000e-03 | 1e-2 | 32.00% | 1e-2 | 32.00% | PASS |
| P(>=10000x), worst | 0 | 2e-2 | 0.00% | 8e-2 | 0.00% | PASS |
| ETL(>=40x cost), worst | 0.6654 | 0.9 | 73.93% | 0.8 | **83.17%** | PASS, **flagged** |
| ETL(P>10000x), worst | 0 | 0.8 | 0.00% | 0.6 | 0.00% | PASS |
| CVaR, normalised | 205.7406 | 800 | 25.72% | 700 | 29.39% | PASS, definition open |
| Maximum Exposure | not determinable here | $50,000,000 | n/a | $10,000,000 | n/a | see 3.1 |

### 3.1 Maximum Exposure, why it is not computed here

Exposure is a currency amount, not a multiplier, so it is a function of the maximum bet
the operator permits multiplied by our 5,000x cap. Bet levels arrive from the
authenticate response at runtime and are not ours to set. What is fixed on our side is
the 5,000x cap and the 400x top cost multiplier. This constraint is therefore recorded
as platform-side and confirmed against the ACP screen at upload, not asserted here.

### 3.2 Flags, anything within 20 percent of a limit

Two items sit inside the brief's 20 percent flagging band.

**Flag 1, RTP headroom. 0.35pp below the ceiling.** At 96.3500% against a 96.70%
ceiling we use 99.64% of the permitted range. In proportional terms this is the
tightest number in the whole table. It is a deliberate commercial position rather than
an accident, and it passes, but it has two consequences worth stating: any future
change that lifts RTP even slightly breaches, and the public GitHub docs still
advertise the old 98.0% ceiling, so a reader working from them would badly misjudge the
available room. Recorded in `COMPLIANCE_WATCH.md` this pass.

**Flag 2, ETL(>=40x cost) at 2-star. 83.17% of the limit.** OVERBOOST's 0.6654 is
comfortable against the 3-star limit of 0.9 (73.93%) but sits inside the 20 percent
band against the 2-star limit of 0.8. This only binds if the rounded reviewer average
lands us at 2 stars rather than 3. It still passes in that case, with 16.8% headroom,
but it is the constraint that would move first if the maths were ever revisited. No
action proposed. Recorded so it is not rediscovered cold.

Nothing else is within 20 percent of any limit on either tier.

## 4. The open CVaR question, recorded verbatim with its resolution path

**This is the one place where the published documentation does not determine our pass
or fail status, and the range of possible answers is wide enough to matter.**

The published definition states the worst **0.1%** of outcomes. Fable's independent
pre-computation is stated as **CVaR99**, the worst **1%**. Those are different
statistics. The published limit (800 at 3-star, 700 at 2-star) is given with no units
and no statement of which of the two published variants it applies to, and the
worst-case-across-modes rule is stated explicitly for the tail probabilities but not
for CVaR.

Three unknowns, none resolvable from the documentation:

1. Is the tested quantile 0.1% (CVaR99.9) or 1% (CVaR99)?
2. Is the limit compared against the **normalised** value (CVaR / bet cost) or the
   **un-normalised** absolute value?
3. Is the worst-case-across-modes rule applied, or is CVaR assessed on base mode only?

Because the answer is not derivable, every reading is computed and reported:

| Reading | Worst mode | Value | Against 800 (3-star) | Verdict |
|---|---|---|---|---|
| CVaR99, normalised | antelite | 72.6376 | 9.08% | PASS |
| CVaR99.9, normalised | antelite | 205.7406 | 25.72% | PASS |
| CVaR99, un-normalised | super | 3,523.8721 | 440.48% | **FAIL** |
| CVaR99.9, un-normalised | bonus | 5,000.0000 | 625.00% | **FAIL** |
| CVaR99, un-normalised, base only | base | 61.9559 | 7.74% | PASS |
| CVaR99.9, un-normalised, base only | base | 182.3557 | 22.79% | PASS |

Per-mode CVaR, both quantiles, both normalisations:

| Mode | CVaR99 raw | CVaR99 norm | CVaR99.9 raw | CVaR99.9 norm |
|---|---|---|---|---|
| base | 61.9559 | 61.9559 | 182.3557 | 182.3557 |
| cruise | 47.2279 | 47.2279 | 111.0739 | 111.0739 |
| antelite | 90.7970 | 72.6376 | 257.1757 | 205.7406 |
| bonus | 1,250.4467 | 12.5045 | 5,000.0000 | 50.0000 |
| super | 3,523.8721 | 8.8097 | 5,000.0000 | 12.5000 |

**Assessment, offered as reasoning and not as a finding.** The un-normalised
across-modes reading is almost certainly not what the platform applies, because under
it any game shipping a large buy mode fails automatically: a 400x buy that can pay
5,000x has an absolute tail expectation in the thousands by construction, whatever the
underlying maths does. A limit that no buy-feature game could ever satisfy is not a
plausible reading of a document that elsewhere goes out of its way to grant high-cost
modes relief. The normalised reading passes comfortably at both quantiles, and the
base-only reading passes too. **We are most likely well inside this limit. That is not
the same as knowing it, and this pass does not claim to know it.**

### 4.1 Resolution path, recorded as a mechanism rather than an intention

The ACP computes these figures itself and displays them. The resolution is therefore
procedural, not analytical:

> After the math upload, and **BEFORE** requesting review, the ACP **Math Distribution
> and Summary** screen is read and screenshotted into dossier evidence. Our
> independently computed values are reconciled against the platform's own displayed
> values. Where they disagree, the platform's figures are definitive and ours are
> corrected to match. If the platform's displayed CVaR shows us outside a limit, the
> submission does not proceed to review until it is resolved.

This is added as a formal staging step in `SUBMISSION_DOSSIER.md` section 5 this pass,
so it cannot be skipped on the path to submission. Both quantiles and both
normalisations are on file above, so whichever definition the ACP turns out to use, the
comparison figure already exists and no recomputation is needed at that point.

## 5. Method notes

- Probabilities are weight over total weight, computed as exact integer ratios. Total
  weights are approximately 1.1259e15 per mode.
- The mean and variance are accumulated in exact decimal over the full 100,000 rows.
  No sampling anywhere.
- Expected shortfall is the coherent form: outcomes sorted by payout descending, atoms
  consumed in order, and the final atom **partially** consumed so the tail mass is
  exactly 1% or 0.1%. A naive "average the top N rows" would drift with atom size,
  particularly on bonus and super where a single wincap atom dominates the tail.
- The 5,000x cap is verified present in all five tables as the exact maximum, which is
  what makes P(>=10000x) and ETL(P>10000) structurally rather than empirically zero.
- Mode costs are read from the shipped `index.json`, not hardcoded, so a table-to-cost
  mismatch cannot pass silently.

## 6. Bottom line

Every automated bet-level constraint that can be determined from the shipped tables
**passes on both star tiers**, most of them by a wide margin. Two items are flagged for
proximity (RTP headroom at 0.35pp, ETL at 83.17% of the 2-star limit) and neither
requires action. The single genuine open item is the CVaR definition, where the
plausible reading passes comfortably and the implausible reading fails badly. That is
resolved by reading the platform's own numbers at upload, now a mandatory gate in the
dossier rather than an intention.
