# Session Report - THE BOOT SET AUDITED, AND THE DRIFT RATE MEASURED (2026-07-29)

**Session 5.** Brief saved verbatim: `reports/briefs/FS_BOOT_SET_REALITY_Prompt.md`.
Model Opus 5, main loop for all reading and checking, one adversarial verifier agent per
JOB 4. No lock exceptions. No player-visible code touched.

Australian English, no em dashes or en dashes.

## THE MEASUREMENT, which is the point of the session

**52 factual claims checked across the boot set. 13 wrong. 1 UNKNOWN. A drift rate of 25 per
cent.** The main loop checked 48 and found 9; the adversarial verifier found 4 more, one of
them committed by this pass itself. **The single-reader figure understated the drift by a
quarter**, which is what convention (l.4) predicts and is the argument for JOB 4 existing. Nothing in the budget model recorded how fast this project's documents go stale, and
now something does.

**The class is not the one the gate freezes.** `doc_currency_baseline.json` holds 333 frozen
DEAD REFERENCES and **not one of the 13 is among them**, because they are WRONG ASSERTIONS
rather than dead paths. The brief's REPORTED premise, that the wrong-assertion class is
invisible to the current gate, is **CONFIRMED**.

## PLAN OF RECORD, GRADED

| Line | Planned | Actual |
|---|---|---|
| JOB 1 calibration | 0.4M | all three found unaided, plus three more |
| JOB 2 core documents | 2.2M | delivered, see the coverage note below |
| JOB 2b registers | 0.7M | delivered, and produced the highest-reach finding |
| JOB 3 predicates | 0.4M | **delivered as evidence, not as annotations.** Reasoned below |
| JOB 4 verifier | 0.3M | 1 agent, adversarial, shared-nothing |
| JOB 5 negation check | 0.5M | **SHED at the stop line**, per the degradation order |
| JOB 6 close | 0.7M | delivered |

**VERDICT AT PLANNING: FITS with 1.0M margin. Outcome: it fitted, and JOB 5 shed as designed.**

## JOB 1: the calibration, and the method it validated

Four detectors were stated BEFORE use so the calibration could falsify them: **M1** numeric
assertion, **M2** enumeration, **M3** status assertion, **M4** cross-document contradiction.

| Target | Found unaided | What the method actually turned up |
|---|---|---|
| `QUALITY_CHARTER` Q-26 | **Yes, and worse than briefed** | The brief said the count was 5 not 4. The real defect is bigger: **the FILE is wrong.** `fsModes.ts` contains none of the strings. Recount: **51 instances across 16 locales**, not four |
| `M04:48` NZD | **Yes, plus a second stale cite** | `rgs.md:130` publishes `NZ$10.00`. The same paragraph cites `currency.ts:25`, which no longer holds the list |
| `FABLE_COMMS` 82 | **Yes, and the method disproved its own hypothesis** | M4 suspected 79 and 50 were different measures being conflated. Checking killed it: 29 held plus 50 parked is 79 exactly |

**M2 was the highest-yield detector, and the reason is worth keeping:** it insists on
re-running an enumeration rather than reading it. That is what exposed Q-26's wrong file, and
it is `FULL_AUDIT_METHOD.md` 2.5 in practice, a search that could not have returned the
answer.

**Recording that the method disproved one of its own suspicions matters as much as the finds.**
A method that only ever confirms is not a method.

## THE NINE

1. `QUALITY_CHARTER` Q-26: "four instances in `fsModes.ts`". Wrong file, and 51 not four.
2. `M04:48`: NZD "is not in the platform table at all". It is, and that inverted a
   disposition from scope-exclusion to Class A defect.
3. `M04:48`: cites `currency.ts:25` for a list that is no longer there.
4. `KNOWN_OPEN`: "the ledger holds 571 findings". `LEDGER.md` holds **two**, and says so in
   its own text. A session following that instruction would open it, find two rows, and
   conclude the corpus did not exist.
5. `KNOWN_OPEN` and `CLUSTERS`: **571 findings. It is 566.**
6. `CLUSTERS`: "over 55 active shards". It is **54**; the 55th `.md` is the index.
7. `doc_currency_baseline.json`: header declared 334 and 51 while the body held 333 and 50.
8. `DOC_CURRENCY_GATE_SPEC:207`: `REVIEW_TRACKER.md` at 59 entries. It is **58**.
9. `PARKED_TRACKER`: REQ-108 "CURRENTLY UNMET, 23 of 36". Met and gated the previous day.
   HELD moves 29 to 30 and PARKED 50 to **49**, so the "50 requirements unguarded" line every
   recent brief carries is now 49.

**Findings 7 and 9 were caused by the previous session, which was mine.** Burning a baseline
entry is exactly what the ratchet requires, and nothing ever made anyone recompute the
header. That is the argument for the structural fix rather than the patch.

**Finding 5 is the one with the most reach, and it is fully derived.** Counting finding
headings across the 54 active shards gives STREAM 60, HIGH 183, MEDIUM 242, LOW 81, total
**566**. `CLUSTERS.md` carried 571 **while its own four components summed to 566 on the same
line**, so the document contained the evidence against its own total. `KNOWN_OPEN`
independently recorded "506 are HIGH, MEDIUM or LOW", and 60 plus 506 is 566, which
corroborates from the other side with an input the first count does not share.

## THE STRUCTURAL FIX, which is finding 7's real answer

`frozen_count` and `by_class` were written by `--freeze` and never read again: every count the
gate prints is recomputed from the array. **They were the only numbers in a checked file that
nothing checked**, and they drifted within 24 hours and survived a green CI run.

`scripts/qa/doc_currency_gate.mjs` now fails when the baseline header disagrees with its
body. Seeded per convention (p) in the form it really occurred, an **off-by-one**, because
burning one entry is what produces one. Three seeds, three paired positives including a
baseline predating the header fields which must NOT be failed. Proven end to end locally
against the real file, red then green, per protocol rule 9. Self-test 18 cases to **24**.

## A CORRECTIVE TO THE BRIEF'S FRAMING

**Frozen entry count is not a proxy for staleness.** `docs/records/upload-kit/00_READ_ME_FIRST.md`
is the second largest baseline contributor at 23 entries and is **factually current**: it
carries a live `PART 9i: THE v10 VISIT` and marks every earlier part "(SUPERSEDED, DO NOT
RUN)". Its entries are dead paths to deleted kit directories it correctly reports as gone.

The documents that were WRONG were mostly not the ones with the most frozen entries. Aiming
the next pass by baseline contribution would aim it at the wrong files.

## JOB 3: delivered as evidence rather than as annotations, and why

**No new predicates were added.** The two in `SUBMISSION_DOSSIER.md` and two in
`GAME_FACTS.md` were verified to hold; `count=7` over the publish files is exactly right,
counting the 7 TRACKED files where the filesystem shows 12, the 5 book archives being
deliberately gitignored.

The remaining counts in the capped documents are DATED MEASUREMENTS, which
`DOC_CURRENCY_GATE_SPEC.md` section 4 explicitly says not to annotate: re-checking them
against a moved HEAD is the epoch trap. **Annotating for its own sake is precisely what made
the pilot verdict NOT PROVEN**, so the deliverable is the widening evidence, at
`reports/FABLE_COMMS.md` entry 029.

**The headline of that evidence: only 4 of the 9 findings are catchable with the four
predicates that exist**, 1 partly, and 4 not at all. Findings 4, 5, 7 and 8 are counts of
MATCHES or of records inside a file, and all four existing forms count or match FILES. A
fifth form, `grepcount=N`, is proposed with the exact predicate that would have failed the
moment 571 was written.

## A SELF-AUDIT CATCH, recorded because the brief forbade exactly this

Correcting `KNOWN_OPEN` and `CLUSTERS`, this session annotated both with phase 2 predicates.
**Fable capped phase 2 at two named documents, and the cap is POLICY: the gate evaluates
predicates in any tracked `.md`, so nothing would have stopped it.** Both were removed before
commit and adoption is back inside the cap.

Reported separately and NOT removed, because the cap is Fable's to rule on:
`reports/qa/session3/JOB4_CAUSE_REDERIVATION.md:281` carries a live predicate outside the two
named documents, and it predates this session.

## THE GATE CAUGHT THREE FINDINGS IN THIS SESSION'S OWN EDITS

Two DEAD_SYMBOL false pairings: the Q-26 cell carried exactly one `file:line` citation,
`WinBanner.svelte:7`, and the gate charges every backticked identifier on a line to its single
citation by design, because guessing which symbol belongs to which file would be a gate that
invents findings. Fixed by citing the prose files in full `file:line` form, which also reads
better. The third was a DEAD_DOCREF for this session's own brief, which resolved on staging.

## COVERAGE, stated honestly

**Audited in full:** `reports/qa/stream_test/KNOWN_OPEN.md`,
`reports/qa/stream_test/CLUSTERS.md`, `reports/qa/session3/PARKED_TRACKER.md` counts,
`docs/QUALITY_CHARTER.md` Q-26, `scripts/qa/doc_currency_baseline.json`,
`docs/records/DOC_CURRENCY_GATE_SPEC.md` section 8, `reports/qa/session4a/M04_CURRENCY_DIVERGENCE.md`.

**Audited by detector sweep rather than line by line:** `CLAUDE.md` (branches, dead stores,
em dashes, locked paths, convention range all CONFIRMED), `docs/records/WAYS_OF_WORKING.md`
(convention range CONFIRMED), `SUBMISSION_DOSSIER.md` (predicates and bundle figures),
`WRS_MASTER_DOCUMENT.md`.

**NOT swept, named explicitly:** `docs/records/reviews/REVIEW_TRACKER.md`, deferred by the
brief pending the negation check. `reports/qa/compliance_register/PROJECT_CLAIMS.md` and
`reports/qa/session3/MECHANISMS.md` were not reached. The 189 frozen entries outside the boot
set remain frozen and out of scope, as instructed.

## JOB 5: SHED at the stop line, with what was learned

The negation check was not built. The brief's own instruction governs: *"If it cannot be
seeded properly before a stop line, do not ship it. A gate that runs first in CI is the worst
place for an untested matcher."*

**What the next session should know before building it.** The class is real and large: 44
negation phrases in `REVIEW_TRACKER.md` alone. But this session found a second, cheaper
instance of the same root cause: the DEAD_SYMBOL pairing rule already narrows itself to lines
carrying exactly one citation, and its comment states the principle the negation check needs,
that guessing would be *"a gate that invents findings"*. **Build the negation check to that
same standard: narrow the trigger rather than widen the interpretation.** Both directions must
be seeded, and the harder direction is the second one, a document citing a dead path as though
live, which must still FAIL.

## SELF-AUDIT, per THE FACTS DISCIPLINE point 4

- **Brief followed?** Yes. The one departure is JOB 3 delivering evidence rather than
  annotations, reasoned above and consistent with the spec's own test.
- **Locked paths?** None touched. No commit carries a LOCK-SANCTION token, correctly.
- **`REVIEW_TRACKER.md`?** Not touched, as instructed.
- **Phase 2 cap?** Breached in draft, caught in self-audit, restored before commit, disclosed
  to Fable in entry 029.
- **Baseline entries outside the boot set?** None burned.
- **Judgements?** Q-26's sizing is contradicted by the evidence and was SURFACED for the
  owner, not re-decided. The original wording is preserved verbatim in the row.
- **Player-visible code?** Untouched.

## FOR THE NEXT SESSION

**Model and effort:** Opus 5, main loop for all reading and checking, one adversarial agent.
**Approach:** state the detectors BEFORE using them, calibrate against known-wrong claims,
then re-run every enumeration rather than reading it.

**Alternatives tried and rejected:**

- *Auditing by baseline contribution, largest first.* Rejected on evidence: the second
  largest contributor is factually current, and the documents that were wrong were mostly not
  the ones with the most frozen entries.
- *Adding predicates to the documents that produced findings.* Rejected: outside Fable's cap.
  The annotations were written, then removed in self-audit, and the widening request went to
  comms instead.
- *Correcting `FABLE_COMMS` entry 025's "82" in place.* Rejected: it is an append-only dated
  record and entry 026 already corrects it. Rewriting history to fix a stale read would
  destroy the evidence of the correction.
- *Changing `SHARD_INDEX`'s "47 shards".* Rejected: 46 files exist, none was ever deleted, and
  the discrepancy cannot be settled from the tree. Marked UNKNOWN with the derivation, which
  is a complete answer rather than a failure.

**Files touched:** `scripts/qa/doc_currency_gate.mjs`, `scripts/qa/doc_currency_baseline.json`,
`docs/QUALITY_CHARTER.md`, `docs/records/DOC_CURRENCY_GATE_SPEC.md`,
`reports/qa/session4a/M04_CURRENCY_DIVERGENCE.md`, `reports/qa/session3/PARKED_TRACKER.md`,
`reports/qa/stream_test/KNOWN_OPEN.md`, `reports/qa/stream_test/CLUSTERS.md`,
`reports/qa/stream_test/shards/SHARD_INDEX.md`, `reports/FABLE_COMMS.md`,
`reports/SESSION_REPORT.md`, `reports/briefs/FS_BOOT_SET_REALITY_Prompt.md`.

**COUNTS THIS SESSION VERIFIED, so they can be carried rather than re-derived. Every one is
reproducible by the command named beside it.**

| Figure | Value | How to re-check |
|---|---|---|
| Stream findings | **566**, not 571 | count `^## <id> (STREAM\|HIGH\|MEDIUM\|LOW) ` across `reports/qa/stream_test/shards/ST*.md` |
| Active shards | **54** | `ls reports/qa/stream_test/shards/*.md` minus `SHARD_INDEX.md` |
| Frames | **519** | `ls reports/screens/stream-test-2026-07-28/*.png` |
| Upheld findings | **118** = 78 + 27 + 13 | `reports/qa/session2_audit/DISPOSITIONS.md:14-16` |
| Requirements with no proof path | **79** | `reports/qa/session3/NO_PROOF_SET.tsv`, minus its header |
| HELD by a gate | **30**, was 29 | `reports/qa/session3/PARKED_TRACKER.md` counts table |
| **PARKED, the "unguarded" figure briefs quote** | **49**, was 50 | as above. 30 plus 49 is 79 |
| Frozen baseline entries | **333** | now machine-checked against the header on every run |
| Remaining `x` versus `×` instances | **51** across 16 locales | `prose.ts` and `prose.locales.ts` |
| Branches on the remote | **6** | `git ls-remote --heads origin` |

**Open threads this session created:**

1. **Comms 029 asks three things**: may phase 2 widen beyond two documents; may a fifth
   predicate `grepcount=N` be added, which is the one that would have caught the worst
   finding; and should the cap be enforced by the gate rather than by good intentions.
2. **Q-26 needs an owner re-sizing.** It was dispositioned "small and mechanical" against four
   English strings. The real set is 51 across 16 locales, which makes it translation-touching.
   The judgement was surfaced, not re-decided.
3. **No gate covers the `x` versus `×` class**, so it cannot regress noisily.
4. **The negation check is unbuilt**, with the design note above.
5. **`REVIEW_TRACKER.md` is unaudited**, 58 baseline entries and 44 negation phrases, and is
   the correct next target once the negation check exists.
6. **`PROJECT_CLAIMS.md` and `session3/MECHANISMS.md` were not reached.**
7. **C-12 is UNDISPOSITIONED**, found by the verifier. `CLUSTERS.md`'s table named 25 of 26
   clusters and C-12 was in none of the three rows. The arithmetic is corrected; the
   disposition is deliberately left open with its evidence recorded.
8. **`WAYS_OF_WORKING.md`'s "80 of 80 agents" is UNVERIFIED**, not confirmed. There is no
   consolidated agent ledger to recount it against, and the verifier said so rather than
   guessing.

**The true fixdown is the next programme, and the ledgers it reads are now audited**, with the
exception of `REVIEW_TRACKER.md` named above. **Re-verify the table of counts at boot anyway**:
this session found that two of the numbers it was handed had gone stale inside 24 hours, and
the whole argument of the pass is that a number nobody checks is a number that drifts.

## JOB 4: THE ADVERSARIAL VERIFIER, AND IT EARNED ITS KEEP

One agent, shared-nothing, instructed to REFUTE. **COMPLETED, none LOST.** 260k tokens,
82 tool calls.

**It confirmed all six corrections independently**, recomputing each rather than reading it:
566 across the four tiers, 54 shards, two entries in `LEDGER.md`, the 51 instances, the
30-plus-49 arithmetic, and the baseline header against its body. On the 51 it went further
than asked and swept every `.ts` and `.svelte` file under `frontend/src`, confirming every
hit outside the two prose files is inside a comment, including all seven in `fsModes.ts`.

**And it found four claims the single-reader pass missed. All four were verified again here
before being accepted, and all four were real.**

| # | Miss | Verified how |
|---|---|---|
| A | `PARKED_TRACKER.md:106` heading still said "PARKED, **50** requirements" while the counts table above it said 49 | **This was MY miss, made in this session.** I updated the table and not the heading, so the document disagreed with itself for one commit |
| B | `CLUSTERS.md` disposition table: the OWNER-PARKED row claimed **18** and its cell names **17**. 1 plus 17 plus 7 is **25 against 26 clusters**, and **C-12 is in none of the three rows** | Recomputed by expanding both ranges programmatically. C-12 is real, defined at `CLUSTERS.md:64` |
| C | `docs/QUALITY_CHARTER.md:479`: "A fresh clone shows **ten entries under `games/`**", present tense | `git ls-files games/` returns **two**. Commit `1e5f903` deleted the nine on 2026-07-28 under TR-088 |
| D | `SUBMISSION_DOSSIER.md:787`: "Current kit is **V6**" | `frontend/dist/build-info.json` stamps **v10** |

**Miss C is the one worth learning from, and it is the strongest argument in this report for
the verification pass being mandatory.** The audit's own first pass edited that exact file, in
the Q-26 row, and walked past a stale present-tense sentence twenty lines away. The reason is
`FULL_AUDIT_METHOD.md` 2.5 turned on the audit itself: **the instrument was grepping for
counts and enumerations, and "A fresh clone shows ten entries" is a status claim about a
directory, which did not match the shapes being searched for.** A search that could not have
returned the answer.

**C-12's disposition was NOT invented.** The arithmetic is corrected and the cluster is
recorded as UNDISPOSITIONED, with the evidence a dispositioner will want: this document pairs
C-12 with C-23 as "a METHOD fault rather than" a defect fault, and C-23 was sent to REOPENED.
That is an argument, not a ruling, and it is left as one.

**Miss D was corrected by removing the moving target rather than by chasing it.** A bundle
size changes on every build, so restating today's bytes would be stale tomorrow. The row now
points at `frontend/dist/build-info.json`, which stamps version, commit and byte count on
every build, and is named as the authority.

**Revised measurement: 48 claims checked by the main loop plus 4 misses found by the
verifier, 13 wrong out of 52. A drift rate of 25 per cent, not 19.** The single-reader figure
understated it by a quarter, which is exactly what convention (l.4) predicts of a pass that
reads the same documents with the same eyes all the way through.

**One claim the verifier could not settle, and it said so rather than guessing:**
`WAYS_OF_WORKING.md`'s "80 of 80 agents" completion figure has no consolidated agent ledger to
recount it against. Flagged UNVERIFIED, not confirmed.

**One document came back clean and it is worth naming:**
`reports/qa/compliance_register/REGISTER.md`. The verifier recomputed every headline count
from the underlying data, including the 254 raw rows reconciling exactly against seven shard
footers (61+53+50+26+24+1+39), and found nothing wrong.
