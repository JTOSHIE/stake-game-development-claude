# Session Report - THE MEASURED SAMPLE (2026-07-31)

Brief saved verbatim: `reports/briefs/FS_SAMPLE_Prompt.md`.
Branch: `main`, single-writer, from `59c1056`. Opus 5, container orchestration per
convention (q) and `docs/skills/FULL_AUDIT_METHOD.md` 4.1.
No locked path touched, no sanction sought, no money-path work, no fixes of any kind.

## Summary

The owner ruled option (b) at `reports/FABLE_COMMS.md` entry 039: buy a measured sample
before deciding whether to re-ground the 71 unreproduced wave-A causes. This session bought
it. **The measurement came back saying the measurement cannot be bought.**

**13 of the 15 sampled rows are contaminated.** Applying the brief's own exclusion rule
leaves three usable rows, which is an anecdote and is not reported as a rate. The full
result is at `reports/qa/sample/RATE.md`.

**The contamination is the finding, and it generalises.** The rows were not spoiled mainly
by the QA ledger. Seven were spoiled by the project's own documentation: `CLAUDE.md`
conventions, `docs/records/reviews/REVIEW_TRACKER.md`, `FIX_LIST_2026-07-26.md`, the PAR
sheet, `SUBMISSION_DOSSIER.md`, `QUALITY_CHARTER.md`, and git commit messages that explain
why a change was made. This repository writes down why things are the way they are, which is
a virtue everywhere except in a blind re-derivation. **An independent re-derivation of a
cause is close to unpurchasable here, by any agent, at any budget.**

**A second result survives contamination intact and answers the owner's question directly.**
Across the 13 rows where the comparison could adjudicate, the recorded cause was better
supported by source in **6**, the fresh derivation in **6**, and neither in **1**. Of the
three outright disagreements the ORIGINAL won two. Contamination biases an agent towards
agreeing with the committed answer; it cannot explain a fresh derivation that disagreed and
then lost on the source. **So the fresh method is no better than the recorded one, and a
full re-grounding would buy a second opinion of equal quality at full cost.**

**Recommendation: neither trust the 56 nor re-ground them.** Fund a REPRODUCTION pass
instead, gate-shaped rather than prose-shaped, per `FULL_AUDIT_METHOD.md` 1.3's one control
that works where the answer is committed. Three one-line questions for the owner are at
`RATE.md` section 6. **The decision is the owner's; this session states the evidence.**

## What was delivered

| Artefact | Path | State |
|---|---|---|
| The brief, verbatim | `reports/briefs/FS_SAMPLE_Prompt.md` | committed |
| Plan of Record, per rule 15 | `reports/qa/sample/PLAN_OF_RECORD.md` | committed before the first spend |
| The sample, pre-registered | `reports/qa/sample/SAMPLE.tsv` | committed at `3c5062e` BEFORE any agent ran, then extended with verdicts |
| 15 independent derivations | `reports/qa/sample/shards/D01..D15.json` | 15 of 15, all valid |
| The measurement | `reports/qa/sample/RATE.md` | committed |

**DONE MEANS, graded.** Every sampled row carries an independent derivation, a verdict
against the recorded one, and a contamination flag: **met, 15 of 15.** The rate file states
the sample size and what it excludes: **met.** It states the rate overall and per squad:
**NOT met, and the reason is measured rather than asserted.** Twelve of fifteen rows are
excluded, so no honest rate exists at this sample size. Reporting one anyway would have been
the single worst outcome available, because it would have laundered an unmeasured population
as a measured one, which is precisely the failure `FULL_AUDIT_METHOD.md` 1.3 was written
about.

## Two design facts the brief could not have known

Both resolved in the Plan of Record before the first agent ran, rather than silently.

**1. There is no symptom field.** `waveA_raw.json`'s `symptom` column is a three-character
`YES`/`PARTIAL` reproduction flag; `why` is disposition rationale; `derived` is one unbroken
paragraph blending specification, observation and cause, so it cannot be handed to a
derivation agent at all. The symptom text was taken from the `finding` column of
`reports/qa/session3/UPHELD_118.tsv`, the observation layer that `FULL_AUDIT_METHOD.md` 2.7
keeps permanently split from the diagnosis. All 71 rows are present in it. It is hard
truncated at 240 characters, which is stated rather than hidden; agents received the
truncated observation plus exact `file:line` and resolved it by reading source.

**2. The main loop must read what the agents are forbidden**, or JOB 1 and JOB 3 cannot run.
Read as scoped to the derivation agents, and honoured more strictly than asked: the
`derived` field never entered main-loop context at any point, being piped from JSON straight
to disk for the comparison agents alone; and derivation agents were barred from the whole of
`reports/` rather than the four named paths, because `UPHELD_118.tsv` links onward to
`session2_audit/` where the causes are.

## Findings about the method itself, which are worth more than the rate

- **A stated absolute prohibition failed 5 times in 15.** `D06, D07, D10, D12, D14` opened
  paths under `reports/` despite a rule given first and marked absolute. `D12` read the prior
  audit's verdicts on the very cluster it was re-deriving. `FULL_AUDIT_METHOD.md` 1.3 says a
  blind control cannot exist where the answer is committed; this session adds the quantity,
  and the finding that telling the agent not to look does not fix it either.
- **Self-report alone would have been insufficient, and would also have been too harsh.** A
  second objective instrument audited every agent transcript for what it actually opened. It
  caught one breach the agent did not name, and it cleared two agents whose honest yes named
  only the implementation files they were told to derive from.
- **Zero of fifteen returned UNKNOWN**, despite every prompt stating at length that UNKNOWN
  was a complete and often correct answer. That is evidence of contamination, not of easy
  rows.
- **One breach was this session's own fault**, and is recorded rather than left to be found:
  the derivation payloads and the recorded causes were written to the same scratch directory,
  so `D06`'s `ls` revealed that recorded answers existed. It never read one, and the string
  `recorded_cause` appears in no derivation agent's tool results anywhere. They should have
  been separate trees.

## Accounting, graded against the Plan of Record

| | |
|---|---|
| Agents dispatched | 30 (15 derivation, 15 comparison), **0 LOST** |
| Agent tokens | 2.73M against a 1.8M nominal, on a line the brief declared unrationed |
| Wall clock, agent wave | 12.6 minutes |
| Workflow runs | 2. The first failed in 7ms with zero agents: `args` arrived as a JSON string and `pipeline()` rejected it. Fixed by baking the list in as a constant, per the pre-flight checklist's own rule that configuration is baked in rather than passed |
| Premises recounted per rule 16 | all three VERIFIED premises recount exactly: 71 rows, 11 squads at 13/10/10/8/5/5/5/5/5/3/2, severity 11/45/13/2 |
| REPORTED premise | the 19 per cent diagnosis figure was treated as a question throughout and is used nowhere; this sample is too small and too contaminated to corroborate or contradict it |

The plan named this exact failure mode in advance, under HOW THIS SESSION CAN FAIL, first
bullet: "the measurement is laundered". It was, at 87 per cent, and the instrument built to
detect it is why this report can say so.

## Surfaces NOT swept, named explicitly

- The 56 rows not sampled. Nothing here licenses any claim about them.
- MEDIUM and LOW severity entirely. The stated selection rule takes the highest severity in
  each squad first, and every squad had a STREAM or HIGH row to give, so the 13 MEDIUM and 2
  LOW rows are untouched.
- Per-squad quality. All eleven cells are too thin to act on; eight have zero usable rows.

**Files touched**: `reports/briefs/FS_SAMPLE_Prompt.md`, `reports/qa/sample/**`,
`reports/SESSION_REPORT.md`, `reports/archive/2026-07-31b_measured-sample.md`. Nothing else.
No fixes, no disposition changes, nothing moved from PARKED, the ledger not edited.

## FOR THE NEXT SESSION

1. **The owner's decision on the remaining 56**, now informed by a measurement that says the
   re-derivation instrument does not work here. The three one-line questions are at
   `reports/qa/sample/RATE.md` section 6: accept that re-derivation is not purchasable and
   stop buying it; fund a reproduction pass sized after a costing; or leave all 71 PARKED and
   spend the budget on unblocked work.
2. **If a reproduction pass is funded**, it is gate-shaped, not prose-shaped: require each
   finding to be reproduced from a stated procedure by something that can go red, with a
   seeded failure per convention (p) proving the instrument works. A prior verdict cannot
   supply a passing test, which is the whole point.
3. **The ten questions of entry 038 stand**, of which two are the owner's referrals to the
   Product Owner and eight await his next check-in. Still owed by the owner: Blurb B text,
   the park-class signature, the panel tick.
4. **A standing caution for every future audit in this repository**, and it is the most
   reusable thing here: **this project's documentation discipline makes blind re-derivation
   unpurchasable.** Any future design that depends on an agent not knowing something already
   written down should be costed as impossible and replaced with reproduction or adversarial
   framing before it is launched, not after.
