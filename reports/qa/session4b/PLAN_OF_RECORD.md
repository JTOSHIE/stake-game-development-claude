# PLAN OF RECORD: the true fixdown

`reports/briefs/FS_TRUE_FIXDOWN_Prompt.md`, posted before the first agent spend per protocol
rule 15. Australian English, no em dashes or en dashes.

## 1. Premise recount, per rule 16

Every figure below was recounted on 2026-07-30 from `reports/qa/session3/UPHELD_118.tsv`
by this session, not carried from the brief.

| Premise | Method | Result | Verdict on the brief |
|---|---|---|---|
| Row count | `awk -F'\t' 'NR>1 && $1 ~ /^S2-C/'` | **118** | CONFIRMED |
| Disposition split | `awk` over column 4 | **78 UPHELD, 27 CAUSE UNSOUND, 13 ENUMERATION INCOMPLETE** | CONFIRMED |
| Severity split | `awk` over column 2 | **20 STREAM, 68 HIGH, 27 MEDIUM, 3 LOW** | CONFIRMED |
| Unlocked `frontend/src` rows | cluster script, primary-file extraction | **47** | CONFIRMED |
| Rows filed at a locked path | same script, matched against the four `deny` lines | **3**: S2-C060, S2-C115 (`rgsService.ts`), S2-C062 (`gameStore.ts`) | CONFIRMED |
| MID-01 still two clocks | direct read of both components | **YES** | CONFIRMED |

The recount reproduces the brief exactly. The script is at
`reports/qa/session4b/cluster.mjs` so the arithmetic is checkable rather than asserted.

### Two refinements the recount adds, neither of which changes a count

1. **Four further rows CITE a locked path while being FILED at an unlocked one.** S2-C061
   and S2-C064 are filed at `frontend/src/lib/stores/betLadder.ts` and cite
   `rgsService.ts` (S2-C064 also cites `gameStore.ts`, both marked "read as text").
   S2-C014 and S2-C027 cite `games/future_spinner/`. **The brief's count of three is
   correct** on the "filed at" reading its own command uses. The risk this records is
   that if re-derivation shows any of the four needs a locked EDIT rather than a locked
   READ, it becomes a fourth or fifth sanction request, exactly as the brief provides for.

2. **MID-01's cited figures are one worked instance, and the general case is worse.**
   `WinBanner.svelte:79` is `{ big: 1400, mega: 2000, epic: 2800 }`; `HudOverlay.svelte:312`
   is `min(800, 400 + min(400, multiplier * 8))`. The brief's "1400 ms and 528 ms" is
   exactly a big-tier win at 16x, and both easings are `1 - (1 - p)^3` at
   `WinBanner.svelte:171` and `HudOverlay.svelte:318`, so the brief is right on every
   figure. At epic tier the divergence is **2800 ms against a HUD saturated at 800 ms**:
   the HUD settles two full seconds before the celebration it is supposed to trail.

### One defect found in a boot document

`reports/qa/session3/JOB4_CAUSE_REDERIVATION.md` contradicts itself four lines apart.
Line 49: *"One of the 27 needs a lock sanction (S2-C062, `gameStore.ts`)"*. Line 52:
*"Not one of the 27 needs a lock sanction"*. Recorded here, corrected in JOB 4 of this
session. The operative reading is line 49, because S2-C062 is filed at a locked path and
its own disposition row gives fix size PARK.

## 2. JOB 1 result: the cluster map, across all tiers then filtered

Per `AGENT_BUDGET_AND_SCHEDULING.md` 4.4, clustered across **all four severity tiers at
once** and filtered afterwards, because tier-at-a-time clustering hid corroboration twice
before. Method: mechanical grouping by primary file, extracted from the path column by
regex, then grouped into eighteen coherent surfaces.

**18 surfaces over 118 rows.** Full map at `reports/qa/session4b/CLUSTER_MAP.tsv`.

| Surface | Rows | Code rows | Surface | Rows | Code rows |
|---|---|---|---|---|---|
| A-REPLAY | 15 | 11 | K-KIT-BUILD | 4 | 0 |
| B-CURRENCY | 5 | 5 | L-BRAND-ASSETS | 12 | 0 |
| C-PROSE-I18N | 8 | 8 | M-DOSSIER | 11 | 0 |
| D-APP-CSS | 3 | 3 | N-COMPLIANCE-WATCH | 7 | 0 |
| E-HUD-BANNER | 3 | 3 | O-MASTER-OWNER | 8 | 0 |
| F-PAYTABLE | 3 | 3 | P-QA-ARTEFACTS | 7 | 0 |
| G-MODES-COST | 4 | 4 | Q-BOOKS-MATH | 3 | 0 |
| H-BET-LADDER-RGS | 7 | 7 | R-OTHER-DOCS | 6 | 0 |
| I-GRID-GEOMETRY | 1 | 1 | J-APP-BUILD-CI | 11 | 5 |

**THIS COUNT IS A HYPOTHESIS, NOT EVIDENCE**, and it is labelled one per 4.4, which
measured 6 of 26 clusters carrying a fault. The specific risks here: grouping by primary
file **fuses unrelated defects that share a file** (surface J mixes `App.svelte` boot
ordering with `checks.yml` gate wiring), and it **splits one defect across two files**
where a symptom and its cause live apart. Wave A squads are instructed to report both
kinds of miscluster back.

## 3. The scope arithmetic, and what it means

- **118 rows.** 27 already re-derived by Session 3. **91 have never had their cause
  checked** (78 plain UPHELD, 13 ENUMERATION INCOMPLETE).
- **47 rows are code-fixable** in unlocked `frontend/src`. The other 71 are documents, CI
  configuration, locked paths or carry no file.
- The brief scopes JOB 3 to **unlocked frontend only**. So the 71 non-code rows receive a
  **disposition**, not a fix, and that is a scope decision recorded here rather than a
  shortfall discovered at close.

## 4. The waves, costed at launch

Verification cost is computed here rather than discovered afterwards, which is the
specific failure rule 15 exists to prevent.

| Wave | Agents | Class | Per agent | Total |
|---|---|---|---|---|
| **A: cause re-derivation** | 12 | Analyst, tool calls capped at 30 | ~120k | **1.5M** |
| **B: adversarial verify of fix-driving causes** | 8 | Verifier, call-capped | ~75k | **0.6M** |
| **Agent total** | 20 | | | **2.1M against 7.0M** |

Wave A is priced on the LOOK equation with a call cap rather than the MEASURE equation,
per 4.3: capping calls held measure-squads to 95k against 232k uncapped, at no cost in
quality. Twelve squads, each one coherent surface, 4 to 13 findings each.

| Main loop line | Estimate |
|---|---|
| Boot, premise recount, clustering (spent) | 0.35M |
| Marshalling Wave A and B output | 0.40M |
| MID-01 refactor, its gate, its seeded self-test | 1.20M |
| Remaining code fixes | 1.50M |
| Capture re-proof runs | 0.40M |
| JOB 4 ledger and JOB 5 report | 1.00M |
| Gate runs, commits, remote CI check | 0.50M |
| **Main loop total** | **5.35M against 6.0M** |

**Total 7.45M against 14.5M usable, with 1.5M reserved. VERDICT: FITS**, with roughly 5.5M
of headroom against the agent line, which is deliberate: if Wave A returns a high UNKNOWN
rate the correct response is a second derivation round, and that is what the headroom is
for.

## 5. Expected findings

- 92 re-derivations returned (91 unchecked rows plus one control, below).
- Of the 47 code rows, **MID-01 leads and is RULED**. Realistic fix set is **15 to 25
  rows**, bounded by main-loop capacity rather than by the derivation.
- Expected UNKNOWN rate: high. Session 3 re-derived 27 causes and **0 of 27** recorded
  causes survived. UNKNOWN is a complete answer and squads are told so explicitly.

### The control, declared in advance

**S2-C045 is a blind control.** It is one of the 27 Session 3 already derived, and it is
seeded into shard NOQR without the squad being told the answer exists. Its shard carries
no hint beyond its own disposition label. If the squad's derivation matches
`JOB4_CAUSE_REDERIVATION.md:65`, that is corroboration from genuinely independent inputs
in the sense convention (l.4) requires: a different session, a different agent, the same
source. If it diverges, this session's whole Wave A output is suspect and the divergence
is reported rather than buried. Cost of the control: one finding slot.

## 6. Stop lines and degradation, restated as this session will apply them

- No new waves at **4.0M left**; no new agents at **2.5M left**; close at **1.5M left**.
- Degradation order: cluster, cause re-derivation, STREAM fixes, HIGH fixes, the rest.
- **No fix is applied to a cause nobody has checked.** A fix without its re-proof is
  reverted rather than left half-proven.
- **No lock exception, for any reason.** The three known locked rows park with a named
  sanction request naming the exact deny lines. A fourth parks the same way.

## 7. How this plan will be graded at close

Against section 4's arithmetic and section 5's expectation, stated as an end state:
every one of the 118 carries FIXED with a proof path, PARKED with a reason, or STRUCK with
the re-derivation that killed it; every fix carries a re-proof from freshly captured
evidence and a green gate run; and nothing is newly half-done.
