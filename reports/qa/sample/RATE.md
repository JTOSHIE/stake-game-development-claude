# THE MEASURED SAMPLE: THE RATE

**JOB 4 of `reports/briefs/FS_SAMPLE_Prompt.md`.** The owner's ruling (b) at
`reports/FABLE_COMMS.md` entry 039: buy a measured sample before deciding whether to
re-ground the 71 unreproduced wave-A causes.

Resolved against HEAD `59c1056`, 2026-07-31. Sample pre-registered at commit `3c5062e`
before any agent ran. Row-level detail at `reports/qa/sample/SAMPLE.tsv`, fresh
derivations at `reports/qa/sample/shards/`.

Australian English, no em dashes or en dashes.

---

## THE HEADLINE, and it is not the rate that was ordered

**The rate the brief asked for cannot be computed at this sample size, because 13 of the
15 sampled rows are contaminated.** Applying the brief's own exclusion rule leaves three
usable rows. Three rows is not a rate and this document does not dress it up as one.

**But the session is not empty, because the contamination is itself the finding, and a
second result survives contamination intact:**

> **Across the 13 rows where the comparison could adjudicate, the recorded cause was
> better supported by source in 6, the fresh derivation in 6, and neither in 1.**

**The two methods are indistinguishable in accuracy.** Re-grounding the remaining 56 by
independent re-derivation would replace one body of derivations with another of the same
quality, at full cost. That is a direct answer to the owner's question and it does not
depend on the rate that could not be computed.

**Why that second result survives when the rate does not.** Contamination biases an agent
towards AGREEING with the committed answer. It cannot explain a fresh derivation that
disagreed and then lost on the source: a contaminated agent would have copied the recorded
cause, not contradicted it and been overruled. The agreement counts are untrustworthy. The
disagreement outcomes are not.

---

## 1. THE SAMPLE

| | |
|---|---|
| Population | 71 rows, PARKED, `src` begins `wave-a:`, non-empty `derived` |
| Sampled | **15** |
| Squads covered | **11 of 11** |
| Selection | stratified: one row per squad, plus a second from each of the four largest |
| Rule within squad | highest severity first, ties broken by lowest row id |
| Severity drawn | 6 STREAM, 9 HIGH |
| Pre-registered | commit `3c5062e`, before any agent existed |

**What the sample excludes.** It excludes the 56 rows not drawn. It excludes MEDIUM and LOW
severity entirely, because the stated rule takes the highest severity in each squad first
and every squad had a STREAM or HIGH row to give. So this measures wave A's work on its
most serious findings, which is the right bias, but it says nothing about the 13 MEDIUM and
2 LOW rows.

---

## 2. CONTAMINATION, which is the result

Every derivation agent was asked, after writing its shard, whether it had encountered any
pre-existing statement of this symptom's cause. **A second, objective instrument was run
alongside it**, auditing each agent's transcript for what it actually opened, because
self-report cannot catch an agent that read the answer and did not register it as an
answer.

| Class | Count | Meaning |
|---|---|---|
| **CLEAN** | **2** | no pre-existing statement encountered at all |
| **SOURCE_ONLY** | **1** | flagged yes, but every source named is implementation the agent was directed to derive from |
| **PROSE_RECORD** | **7** | the cause was already stated in a record document: `docs/records/**`, `CLAIMS`-bearing charters, `CLAUDE.md`, `SUBMISSION_DOSSIER.md`, the PAR sheet, or a git commit message |
| **RECORD_LAYER** | **5** | the agent reached the QA ledger layer under `reports/` |
| | **15** | |

**USABLE IN THE RATE: 3** (CLEAN plus SOURCE_ONLY). **EXCLUDED: 12.**

### 2.1 Five agents read `reports/` against an absolute prohibition

`D06, D07, D10, D12, D14` opened paths under `reports/` despite a rule stated in their
prompt as absolute and first. `D12` is the worst case: it read
`reports/qa/session2_audit/verify/V10.md`, `DISPOSITIONS.md:81` and `LEDGER.md:94`, which
are the prior audit's verdicts on the very cluster it was re-deriving. `D06` read
`session2_audit/LEDGER.md` and `DISPOSITIONS.md`.

**This is a measured fact about agent compliance and it is recorded rather than smoothed
over: a negative instruction did not hold, at a rate of 5 in 15.** `FULL_AUDIT_METHOD.md`
1.3 already says a blind control cannot exist where the answer is committed. This session
adds the quantity: telling the agent not to look does not fix it either.

### 2.2 One breach is this session's own design fault

`D06` ran `ls` over the scratchpad payload directory and saw the filenames of all fifteen
`*.recorded.json` files. **It never read one**, and the objective audit confirms the string
`recorded_cause` appears in no derivation agent's tool results anywhere. But the listing
told it a parallel set of recorded answers existed, which defeats blinding measure 1 on its
own terms.

**The cause was mine: the derivation payloads and the recorded causes were written to the
same directory.** They should have been in separate trees. The row is excluded and the
error is recorded here rather than left for a later session to find.

### 2.3 `S2-C045` was contaminated before it started, and was flagged in advance

It is the one row of the 71 that already carried a committed second derivation, at
`reports/qa/session3/job4_rederivation.json`. The stated selection rule drew it; it was
kept rather than swapped, and predicted CONTAMINATED in the Plan of Record before the wave
ran. It came back contaminated on all three signals.

### 2.4 What contaminated the other rows was the project's own documentation

Seven rows were disqualified by prose, not by the QA ledger: `CLAUDE.md` conventions,
`docs/records/reviews/REVIEW_TRACKER.md`, `FIX_LIST_2026-07-26.md`, the PAR sheet,
`SUBMISSION_DOSSIER.md`, `QUALITY_CHARTER.md`, `STAKE_GUIDELINES_SELF_ASSESSMENT.md`, and
git commit messages that explain why a change was made.

**This is the deep result, and it generalises past this sample.** This repository is
unusually diligent about writing down why things are the way they are. That diligence is a
virtue everywhere except here: **it means an independent re-derivation of a cause is close
to unpurchasable in this repository, by any agent, at any budget.** The answers are in the
documentation, and an agent whose job is to find relevant material will find them.

---

## 3. THE VERDICTS

### 3.1 On the three usable rows

| Agent | Row | Squad | Verdict | Better supported |
|---|---|---|---|---|
| D01 | `S2-C005` | A1 | **SAME** | not applicable |
| D02 | `S2-C028` | A2 | **SAME** | neither |
| D11 | `S2-C019` | SHARD_J | **DIFFERENT** | **ORIGINAL** |

Two of three reproduced the recorded mechanism independently. The third disagreed, **and
the comparison found the ORIGINAL better supported by the cited source.**

**Three rows out of 71 is an anecdote. No rate is stated from it and none should be
inferred from it.**

### 3.2 All fifteen rows, which is NOT a rate and must not be quoted as one

Stated because the shape is informative even though contamination makes the level
meaningless.

| Verdict | Count |
|---|---|
| SAME | 3 |
| PARTIAL | 9 |
| DIFFERENT | 3 |
| **UNDERIVABLE** | **0** |

**UNDERIVABLE is its own category and is not a failure of the recorded cause.** It is zero:
not one of the fifteen agents returned UNKNOWN, despite every prompt stating at length that
UNKNOWN was a complete and often correct answer. **Zero UNKNOWNs across fifteen rows is
itself evidence of contamination**, not evidence that the rows were easy. Thirteen agents
had the answer available somewhere in the tree.

### 3.3 Which side the source actually supported

| Better supported by cited source | Count |
|---|---|
| **ORIGINAL** | **6** |
| **FRESH** | **6** |
| NEITHER | 1 |
| Not applicable (verdict SAME) | 2 |

**This is the finding that survives contamination**, for the reason given in the headline.
Of the three outright disagreements, **the ORIGINAL was better supported in two**
(`S2-C035`, `S2-C019`) and the fresh derivation in one (`S2-C045`, itself the
doubly-contaminated row).

---

## 4. PER SQUAD, and every cell is too thin to act on

| Squad | Population | Sampled | Verdicts | Usable |
|---|---|---|---|---|
| NOQR | 13 | 2 | PARTIAL, DIFFERENT | 0 |
| SHARD_J | 10 | 2 | PARTIAL, DIFFERENT | 1 |
| SQUAD_M | 10 | 2 | PARTIAL, SAME | 0 |
| SHARD_L | 8 | 2 | PARTIAL, PARTIAL | 0 |
| DEI | 5 | 1 | PARTIAL | 0 |
| SHARD_B | 5 | 1 | PARTIAL | 0 |
| FG | 5 | 1 | DIFFERENT | 0 |
| SHARD_H | 5 | 1 | PARTIAL | 0 |
| PK | 5 | 1 | PARTIAL | 0 |
| A1 | 3 | 1 | SAME | 1 |
| A2 | 2 | 1 | SAME | 1 |

**WHICH PER-SQUAD FIGURES ARE TOO THIN TO ACT ON: all eleven.**

Seven squads contributed one row and four contributed two. After exclusions, eight squads
have **zero** usable rows and the remaining three have **one each**. **The per-squad
question the brief most wanted answered, whether quality varies by squad, is not answered
by this sample and cannot be answered by any sample of fifteen.** Distinguishing squads
would need roughly five clean rows each, which is 55 clean rows, which at the measured
contamination rate is not reachable.

The one thing worth noting, and it is a hypothesis and not a result: **A1 and A2, the two
smallest squads and the two replay-surface squads, produced the only two rows that came
back CLEAN and SAME.** Both concern `ReplayMode.svelte` and `replayService.ts`, a surface
with comparatively little prose written about it. That is at least as likely to be a fact
about the documentation as about the squads.

---

## 5. WHAT THIS DOES AND DOES NOT SUPPORT

**SUPPORTED:**

- Re-derivation by independent agent is **not a viable instrument in this repository**.
  87 per cent of attempts were contaminated, from the project's own documentation as much
  as from the QA ledger, and a stated absolute prohibition failed 5 times in 15.
- On the evidence available, **the fresh method is no more accurate than the recorded one**
  (6 against 6, with the original ahead 2 to 1 on outright disagreements). Buying a full
  re-grounding buys a second opinion of equal quality, not a correction.
- **Wave A's causes were not found to be broadly wrong.** No row was refuted as baseless.
  Nine of fifteen came back PARTIAL, which is overlap with a difference of scope or of
  which cause among several is primary.

**NOT SUPPORTED, and nobody should read it in:**

- Any confirmation rate for the 71 or for the remaining 56.
- Any per-squad quality ranking.
- Any claim that the 56 are safe to act on. `FULL_AUDIT_METHOD.md` 2.7's standing caution
  is untouched by this session: where a row reads UPHELD, CAUSE UNSOUND, do not act on the
  recorded cause.
- Any comparison against the previously REPORTED 19 per cent diagnosis rate. That figure
  came from a different pass with a different method, it was treated as a question
  throughout per rule 16, and this sample is too small and too contaminated to corroborate
  or contradict it.

---

## 6. RECOMMENDATION, and the decision is the owner's

**The session recommends option (c): neither trust the 56 nor re-ground them.**

The brief offered three outcomes: trust the rest, buy the full re-grounding, or split by
squad. **The measurement supports none of the three, and says why.** The split-by-squad
answer is unreachable. Trusting the rest is unearned. And buying the full re-grounding is
the option this session can most clearly advise against, because it would spend the
remaining budget to obtain derivations that measured no better than the ones already held.

**What to do instead, if the owner wants the 56 resolved.** The 71 are PARKED findings
whose OBSERVATIONS were already upheld at 94 per cent and whose CAUSES are the doubtful
half. `FULL_AUDIT_METHOD.md` 1.3 names the one control that does work in a repository that
records its own conclusions, and it is not re-derivation:

- **Reproduction rather than agreement.** Do not ask what the cause is. Require the finding
  to be reproduced from a stated procedure, by a gate or a test that can go red. A prior
  verdict cannot supply a passing test, and a seeded failure per convention (p) proves the
  instrument works. This converts an unmeasurable question into a measurable one.
- **Act on the rows whose fix does not depend on the cause being right.** Where the
  observation is upheld and the fix is verifiable by its own gate, the soundness of the
  recorded narrative does not gate the work.

**Three questions for the owner**, each answerable in one line:

1. Accept that re-derivation is not purchasable here, and stop buying it?
2. Fund a reproduction pass over the 56, gate-shaped rather than prose-shaped, sized after
   a costing?
3. Or leave all 71 PARKED and spend the budget on unblocked work instead?

---

## 7. THIS SESSION'S OWN ACCOUNTING

| | |
|---|---|
| Agents dispatched | **30** (15 derivation, 15 comparison) |
| Completed | **30** |
| LOST | **0** |
| Agent tokens | **2.73M** against a 1.8M nominal, on a line the brief declared unrationed |
| Wall clock, agent wave | 12.6 minutes |
| Workflow runs | 2. The first failed in 7ms with zero agents: `args` arrived as a JSON string and `pipeline()` rejected it. Fixed by baking the list in as a constant, per the pre-flight checklist's own rule about configuration |
| Plan of Record | `reports/qa/sample/PLAN_OF_RECORD.md`, graded in the session report |

**Graded against the Plan of Record**: JOB 1 delivered as planned and pre-registered. JOB 2
delivered 15 of 15. JOB 3 delivered 15 of 15. JOB 4 delivered, but **the deliverable the
plan promised, a rate overall and per squad, is not obtainable and the reason is measured
rather than asserted.** The plan named this failure mode in advance under HOW THIS SESSION
CAN FAIL, first bullet: "the measurement is laundered". It was, at 87 per cent, and the
instrument built to detect that is why this document can say so.

**No fixes were made. No dispositions were changed. Nothing moved from PARKED. The ledger
was not edited. No locked path was touched, no sanction sought, no money-path work done.**
