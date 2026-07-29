# SESSION 3 OF THE AUDIT, 2026-07-29: REMEDIATION. Fable's rulings transcribed, 79 unguarded requirements measured into 21 mechanisms, two gates shipped

Brief saved verbatim: `reports/briefs/FS_SESSION3_REMEDIATION_Prompt.md`, per conventions (b)
and (f). Opus 5, Ultra, on `main`, container orchestration only, no lock exceptions taken.

Australian English, no em dashes or en dashes.

## THE ONE-LINE ACCOUNT

**A rule created to stop premise decay had itself decayed before it landed.** Fable issued
PREMISE PROVENANCE on 2026-07-29, nobody transcribed it, and the next brief cited it as applying
while `CLAUDE.md` carried no such rule. Transcribing it was JOB 1 and it is done. Then the 79
requirements with nothing defending them were measured into **21 proof mechanisms**, which does
not fit the budget, so two were built to the coverage order and the other 65 requirements were
parked with reasons.

## PREMISES RECOUNTED BEFORE SIZING, per rule 16 applied to this session's own brief

| Premise | Brief said | Measured | Verdict |
|---|---|---|---|
| Upheld findings | 118 | **118** | confirmed exactly |
| Requirements with no proof path | 82 (65 nothing, 17 unwired) | **79** (61 nothing, 18 unwired) | **corrected, minus 3** |
| Frozen stale claims | 341 | **341** | confirmed exactly |
| Fable's five rulings in the record | absent | **absent** | confirmed |
| Entries 020, 023, 024, 025 unacknowledged | unacknowledged | **no COMMS-ACK on any** | confirmed |

The 82 does not live in `LEDGER.md` or `DISPOSITIONS.md` where the brief expected it. It lives
in the 23 walk shards, and a naive parse mis-columns 15 of the 194 rows because several
`impl_quote` cells contain markdown tables whose own pipes are unescaped. Those were resolved by
hand against their notes headings. Enumerated at `reports/qa/session3/NO_PROOF_SET.tsv`.

## WHAT LANDED, BY JOB

### JOB 1, the transcription (complete)

Fable's five rulings are in the record and in the protocol, **all transcribed from the owner's
summary rather than Fable's longhand, and each says so where it lands**, per convention (l.7)
and `WAYS_OF_WORKING.md` 6.4.

| Ruling | Landed at |
|---|---|
| The sequencing amendment | `reports/FABLE_COMMS.md` entry 026 |
| **PREMISE PROVENANCE** | **`CLAUDE.md` protocol rule 16**, mirrored in `WRS_MASTER_DOCUMENT.md` 3e |
| The permanent claim-type split | **`docs/skills/FULL_AUDIT_METHOD.md` 2.7**, caution written in as ordered |
| `WAYS_OF_WORKING.md` accepted with the cross-reference condition | condition **confirmed discharged**, not assumed |
| The gate approvals, phase 2 capped | cap verified intact at two documents |

**Checking ruling 4's condition earned itself immediately.** The document's own pointer read
"protocol rules 1 to 15" against a `CLAUDE.md` that now carries a rule 16, so the
cross-reference was stale inside the same day it was written.

**The transcription backlog was audited rather than guessed.** Entry 020's six decisions are
five-sixths visibly actioned in the tree (TR-088, TR-089, TR-091 and TR-092 all closed
2026-07-28; the round-three prompt now exists as `..._RATIFIED.md`; `games/` holds six entries,
not ten). **That an action landed is an OBSERVATION; that Fable ruled it is a DIAGNOSIS**, and
ruling 3 forbids promoting one to the other without reproduction. So the list was put to the
owner at entry 026 rather than resolved. Entry 024 carries two genuinely open items.

### JOB 2, the proof-mechanism survey (complete, and it decided the session)

7 disjoint survey squads plus a 3-seat adversarial panel. **10 agents, 10 COMPLETED, 0 LOST,
1,625,500 subagent tokens against 1.25M planned, plus 30 per cent.**

**40 raw mechanisms, 36 after the panel's duplicate merges, 21 after its 20 missed-merge
findings.** Twenty gates, one tracker-row family, six requirements genuinely unreachable. Every
one of the 79 appears exactly once, checked mechanically.

**The brief's hypothesis was right in direction and wrong in size.** Replay is exactly the
predicted collapse, eleven requirements to one driven session, the largest in the set. But ten
of the 21 mechanisms cover a single requirement each and no merge argument reaches them.

**VERDICT: DOES NOT FIT.** The squads priced their own work at 2.32M, which would have fitted.
That figure was not used: it is 3.4x to 6x optimistic against the currency gate, the only
seeded-gate cost this project had measured. At that floor the 20 gates are 8.0M against 3.0M.

**The panel earned its cost rather than confirming the squads:** 5 FATAL, 21 NEEDS_REDESIGN, 45
coverage challenges. **Four of the five FATALs are gates that could not go RED at all** for four
different structural reasons: a CI environment that cannot observe the condition, a fixture
already failing before any seed, an artefact that is not the one the requirement binds, and a
value derived from the thing it is checked against.

**And it caught REQ-040 assigned to nothing.** Seven squads covered 78 of 79; no squad held it;
it was in no mechanism and no unreachable list. HIGH severity, player visible. Found by counting.
The same mechanical check then caught two more that my own hand-transcription had dropped.

### JOB 3, build in coverage order (two of twenty built, sixty-five parked)

**M01, the replay contract gate** (`frontend/scripts/replay_contract_gate.mjs`). Eleven
requirements: REQ-077, 079, 080, 083, 085, 090, 091, 094, 098, 099, 132. Bet Replay is mandatory
per `CLAUDE.md`, so this was the highest-consequence gap Session 2 found.

The existing `replay_blocker_proof.mjs` could not have done this job: its only interception is
the glob `page.route('**/bet/replay/**')`, which fulfils ANY segment order, so hardcoding the
mode segment leaves it green. This gate captures every request and asserts the URL character for
character against the shape composed from the query string. **5 of 5 seeds caught, planted in
the shipped bundle rather than simulated.**

**M08, paytable and max-win parity** (`frontend/src/lib/config/paytable_parity.test.ts`).
REQ-040, REQ-074, REQ-140. All 24 symbol/length pays in both directions, the scatter awards, and
`FS_MAX_WIN_LABEL` against `_WINCAP`, plus every published lookup table topping out at that cap
per mode. **6 of 6 seeds caught**, including a parser-target rename, without which the gate
would go green the day someone reformats the SYMBOLS array.

**Both first runs corrected their gate, exactly as the brief predicted.** M01's twice, and both
corrections are recorded in the file because both would otherwise have shipped as evidence.

**65 requirements parked**, at `reports/qa/session3/PARKED_TRACKER.md`, with the three kinds of
park kept separate because they are different claims: 54 budget, 5 BLOCKED on a Fable ruling, 6
genuinely unreachable.

### JOB 4, the fix-down (the 27 re-derived; the 118 dispositioned)

4 squads, 4 COMPLETED, 0 LOST, 741,810 subagent tokens.

**Not one of the 27 recorded causes survived.** 13 REFUTED, 13 PARTIALLY_RIGHT, 1 UNTESTABLE,
**ACTUALLY_CORRECT zero**. Every symptom is real, 18 fully and 9 in part.

**The claim-type split now has three measurements:** diagnoses 19 per cent (Session 1),
observations 94 per cent (Session 2), **causes of already-upheld symptoms 0 per cent** (here).

Fixed: `scripts/kit_build.mjs` resolved the live walkthrough section AFTER deleting the existing
kit and copying in the bundle. `livePart()` throws by design, so the throw PRODUCED the thing it
exists to prevent: an unlabelled kit on the owner's Desktop with no README, no commit SHA and
none of the SINGLE USE warnings, plus a leaked clone. Moved above the build and the delete. Its
existing self-test is now wired, which nothing had run while sixteen other gates run theirs.

### JOB 5, the stale purge (baseline 341 to 334)

`DOC_CURRENCY_GATE_SPEC.md` carried five specimen citations inside a table describing the five
classes the gate hunts. The gate read all five as live citations and was right to. A
specification of a path-checker cannot show specimen paths in the form the checker hunts, in a
document the checker scans. **The ratchet's both-directions check then went red on seven rusted
entries, which is a fix landing without its entry being burned.** Burned in the same commit.
The BAD_PREDICATE class is now empty rather than merely smaller.

The gate's own SCOPE header was separately found stale: it named two exclusions against a code
list of five. Found by reading, because the gate reads citations and never the prose around
them, so **it cannot check its own header**.

## PLAN OF RECORD, GRADED

| | Planned | Actual | Variance |
|---|---|---|---|
| JOB 2 survey (agents) | 1.25M | **1.63M** | **plus 30 per cent** |
| JOB 4 re-derivation (agents) | 0.50M | **0.74M** | plus 48 per cent |
| Agents total | 2.75M | **2.37M** | minus 14 per cent |
| Mechanism count | unknown, to be measured | **21** | the conditional resolved to DOES NOT FIT |
| Gates built | about 7 at the assumed rate | **2** | see below, and it is the session's main miss |

**The honest grade is that the arithmetic was right and the ambition was wrong.** The plan said
seven or fewer mechanisms fits and more than seven does not; the measurement was 21 and the
verdict was called correctly and early. But the plan then assumed 0.4M per gate and **the real
figure this session measured is about 0.75M**, so the 3.0M allocation bought two gates rather
than the six the plan implied. **The verification cost was computed at launch as rule 15
requires; the CONSTRUCTION cost was not, and that is the gap.**

## THE MEASURED COST OF A SEEDED GATE, which nothing in the budget model recorded

JOB 6 was asked for this figure specifically. It is now measured rather than assumed.

| | M01 replay contract | M08 paytable parity |
|---|---|---|
| Requirements covered | 11 | 3 |
| Kind | wire and rewrite an existing proof | new file, parse both sides |
| Seeds | 5 | 6 |
| First-run corrections | **2** | 0 |
| Main-loop cost, measured | **about 1.0M** | **about 0.5M** |

**Use 0.75M per seeded, wired gate for planning, and 1.0M where the gate drives a browser.**
The prior figure of 0.4M came from `DOC_CURRENCY_GATE_SPEC.md` section 7 and is the cost of the
CHECKER, not of the delivered gate. The delivered figure in that same table was 0.7M once the
first run and the baseline were included, and 0.75M is consistent with it.

**The dominant cost is not writing the gate. It is the first run correcting it.** M01 cost twice
M08 and the difference is almost entirely two rebuilds of one assertion. Budget for the
correction, not just for the build.

## SELF-AUDIT, per the facts discipline point 4

- **Locked paths:** none touched. `locked_paths_gate.mjs` reports `0 sanctioned, 0 violation(s)`,
  the correct result. S2-C062 needs a `gameStore.ts` sanction and is **named, not touched**.
- **Lock exceptions:** none taken, as the brief required.
- **Phase 2:** not widened. Still the two approved documents.
- **Not started:** the four-gaps discovery, which is Session 4.
- **Not re-run:** the currency gate build and the phase 2 pilot, both discharged.
- **Every agent accounted for:** 14 of 14 COMPLETED, 0 LOST, across two workflow runs.
- **Explicit paths:** every commit staged by name, no `git add -A`.

## WHAT I GOT WRONG, recorded rather than smoothed

1. **Three requirements went missing in my own marshalling.** REQ-040 was dropped by all seven
   squads and REQ-147 and REQ-190 by my hand-transcription of the panel's merges. All three were
   caught by the same mechanical every-requirement-exactly-once check. **The marshal is the layer
   `WAYS_OF_WORKING.md` section 3 says the failures actually live in, and it was right.**
2. **M01's event-order assertion was wrong twice** before it was moved to the right instrument.
   The first version never pressed START REPLAY and compared two copies of the same screen.
3. **The construction cost was not computed at launch**, only the verification cost. Rule 15 asks
   for the verification figure by name and I supplied it; the gate-build figure was assumed from
   a spec estimate rather than derived, and it was wrong by roughly a factor of two.

## FOR THE NEXT SESSION

**Model and effort:** Opus 5, Ultra. 14 agents across two workflow runs, zero lost. Main loop did
all construction, per the brief, and that was correct.

**Approach:** transcribe first, because a fresh session boots on `CLAUDE.md`; recount every
REPORTED premise before sizing; measure the mechanism count before writing a gate; let the first
run correct the gate and record what it corrected; park the rest with reasons rather than
building unproven gates against a stop line.

**Alternatives tried and rejected:** wiring `replay_blocker_proof.mjs` instead of writing M01
(rejected, its glob route cannot see the defect class); asserting event order in the browser
(rejected after two attempts, the browser is the wrong instrument and it moved to the
interpreter); using the squads' own 2.32M cost estimate (rejected, 3.4x to 6x optimistic against
the one measured figure); widening `doc_currency_gate` phase 2 to cover M09 (rejected, Fable's
ruling 5 caps it and the brief forbids widening without a fresh ruling).

**Files touched:** 25 across 8 commits.

### SESSION 4'S PARAMETERS

Session 4 is the four gaps: audio, social, accessibility, animation. **But there is now a
competing claim on that budget and the owner should decide between them**, because 18 of the 21
measured mechanisms are still unbuilt and 54 requirements are parked on budget alone.

```
BUDGET: as allocated. Reserve 1.5M.
SCALE:  MEASURE equation, 15,000 + artefacts x 8,500 for discovery.
        GATE CONSTRUCTION: 0.75M per seeded and wired gate, 1.0M if it drives
        a browser. MEASURED by Session 3 across two gates, not estimated.
        The dominant cost is the first run correcting the gate, not writing it.
        Survey squads: 7 disjoint surfaces plus a 3-seat adversarial panel cost
        1.63M and the panel is where the value was. Do not trim the panel.
DEGRADE: [owner to set between the four gaps and the 18 unbuilt mechanisms]
DONE MEANS: [an end state, not an activity]
```

**Three things Session 4 should know before it starts.**

1. **The mechanism register is ready to build from.** `reports/qa/session3/MECHANISMS.md` ranks
   all 20 gates by coverage with the instrument, the existing asset, the seed form and the
   panel's objection for each. **M02 (8 requirements) and M03 (8) are next by coverage** and
   neither carries a FATAL. M03 is the cheapest large win: the four delivery files and their
   hashes are already committed and panel-verified.
2. **Five mechanisms are BLOCKED on rulings, not on budget**, and asking early costs nothing.
   M09 needs Fable to widen `doc_currency_gate` phase 2 beyond its two capped documents. It is
   requested at `FABLE_COMMS.md` entry 026 along with entry 024's two live items and the entry
   020 acknowledgement list.
3. **Do not act on any recorded cause in the Session 2 ledger.** That is not a caution any more,
   it is a measurement: 0 of 27 survived re-derivation. `reports/qa/session3/JOB4_CAUSE_REDERIVATION.md`
   holds the re-derived causes with their own citations and re-proof commands.

**Still open from this session, named rather than left to be rediscovered.**

- **24 of the 27 re-derived findings are SMALL fixes that were not applied.** They are fully
  specified with re-proof commands and are the cheapest verified work available anywhere in the
  backlog.
- **The negation-aware check was not built.** The measurement exists: of 407 gate occurrences,
  **72 are documents correctly REPORTING an absence** and 52 of those are in
  `REVIEW_TRACKER.md`. **99 more are upload-kit internals**, paths inside the produced artefact
  that will never resolve against the repository, and the honest fix is a declared external
  root rather than a scope retreat. Both need their own seeded self-tests.
- **`/Users/jt/` is hardcoded in 25 tracked scripts**, found while re-deriving S2-C068, and
  `doc_currency_gate.mjs`'s exemption for absolute paths was written for reports and silently
  covers scripts too.
- **Two owner decisions** are in `JOB4_CAUSE_REDERIVATION.md`: the root `LICENSE` grants MIT
  over this studio's own work while `README.md:102-103` says the repository carries no
  open-source licence grant; and REQ-006's scene character measures at roughly 3.7 head heights
  as a non-human mascot, which is a compliance reading rather than a builder ruling.

## Rule 10 closing, filled

The session's final push (`fe424ea`) ran remote CI as run **30441468973** and it is **green**:
https://github.com/JTOSHIE/stake-game-development-claude/actions/runs/30441468973

**Checked, not assumed**, per rule 10: `gh run view 30441468973` returns `conclusion: success`
on `headSha fe424eaced3baf9bca02a13833e76e568783cadd`. Both new gates were verified on the
remote runner specifically, which is the point of the rule: **`browser: replay contract` passed
as browser matrix leg 11**, and `static gates` carried the paytable parity self-test, the
paytable parity scan and the kit build self-test.

The session is two pushes, `2215ca1` to `8a52ede` and `8a52ede` to `fe424ea`. The first ran as
run 30436721728 and was also green. No expected-fail runs were declared or needed, per rule 9:
every seeded red ran locally, which is what that rule prefers.

Local `locked_paths_gate.mjs` PASS before both pushes, reporting `0 sanctioned, 0 violation(s)`,
the correct result for a session that touched no locked path.

## Rule 12 owner preview, filled

```
OWNER PREVIEW  |  v10 line, main  |  commit fe424ea  |  built 2026-07-29T19:53:17+10:00  |  started 2026-07-29T09:53:59.250Z  |  http://192.168.4.92:5173
```

**And the address was curled rather than believed**, per the rule's own earned clause that
printing a URL is not evidence the URL works: `HTTP 200`, 1,256 bytes, serving
`<title>Future Spinner</title>`.

**A finding produced by running the rule, small and worth recording.** `npm run owner:preview`
does not resolve from the repository root: there is no root `package.json`, and the script lives
in `frontend/package.json` as `node ../scripts/owner_preview.mjs`. Rule 12 states the command
without its working directory, so a session following the rule literally gets an `ENOENT` and
could reasonably conclude the preview cannot be refreshed. **Run it from `frontend/`.** This is
independently the same fact JOB 4 derived while re-deriving cluster S2-C098, where a Session 2
finding had asserted a root `package.json` that does not exist.

It is run once more as the LAST action of this close, after the final push, per the
one-commit-lag clause: the line quoted here is the earlier one, the address is the later one. A
reader finding them one docs commit apart has found the design, not a bug.
