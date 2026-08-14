
---

# Session Report - THE TRUE FIXDOWN (2026-07-30)

Brief saved verbatim: `reports/briefs/FS_TRUE_FIXDOWN_Prompt.md`.
Branch: `main`, single writer, integrator role. Opus 5, Ultra.
No locked path edited by any commit; none carries a LOCK-SANCTION token.
`.claude/settings.json` untouched, diff verified empty.

Australian English, no em dashes or en dashes.

## Summary

**Two fixes landed with proof, nineteen findings were struck as not real, and all
118 now carry a disposition where 27 had a checked cause before.** The ruled lead,
MID-01, is closed. The session did not get through the fix batch, and section
"What ran out" says so plainly rather than calling it a scope decision.

The most useful output is not the fixes. It is that **only 10 of 92 recorded
causes survived re-derivation, 11 per cent**, and that the brief's inversion was
right: the 78 plain UPHELD rows were the unexamined ones, and 17 of the 19 struck
rows came from that population.

## Premise recount, per rule 16

Every figure in the brief was recounted before use, by the commands in
`reports/qa/session4b/PLAN_OF_RECORD.md` section 1. **The brief was correct on
every count**: 118 rows, 78/27/13 dispositions, 20/68/27/3 severities, 47 unlocked
`frontend/src` rows, 3 rows filed at locked paths, MID-01 still two clocks. The
recount reproduced it exactly, and `reports/qa/session4b/cluster.mjs` is committed
so the arithmetic is checkable rather than asserted.

Two refinements, neither changing a count, and **one of them turned out to matter
a great deal**: four further rows CITE a locked path while being filed at an
unlocked one, and the Plan of Record flagged that any of them could become a
sanction request. Two of them did.

**A defect found in a boot document.** `JOB4_CAUSE_REDERIVATION.md` contradicts
itself four lines apart: line 49 says one of the 27 needs a lock sanction, line 52
says none does. Line 49 is operative.

## What was done

**JOB 1, clustering across all tiers then filtering**, per
`AGENT_BUDGET_AND_SCHEDULING.md` 4.4. 18 surfaces over 118 rows, mechanically by
primary file, at `reports/qa/session4b/CLUSTER_MAP.tsv`. Labelled a HYPOTHESIS, as
4.4 requires, and squads were asked to report miscluster. They found real ones,
recorded in the ledger: four rows that are one row, two more that are one row, and
one row misfiled under the wrong family with its path anchored to a blank line.

**JOB 2, re-derivation.** 12 analyst squads in the workflow container per
convention (q), 92 findings (the 91 nobody had checked, plus one control).
**12 completed, 0 lost, 1,437,871 subagent tokens, 338 tool calls, 18.4 minutes.**
Against a Plan of Record estimate of 1.5M, so the estimate held.

**JOB 3, the fix batch.** MID-01 and Q-26. Detail below.

**JOB 4, the ledger.** `reports/qa/session4b/LEDGER.md` and `DISPOSITIONS.tsv`.
`CLUSTERS.md` and `KNOWN_OPEN.md` updated with before and after.

## The two fixes

**MID-01, the ruled lead** (commit `9ac424b`). `WinBanner.svelte` and
`HudOverlay.svelte` animated the same `$winAmount` on two frame loops with two
duration rules and identical easing, so they diverged smoothly and the HUD
revealed the total the celebration exists to reveal. Measured before: 872ms early
at 16x, 1936ms early at the epic tier. Now one shared source at
`stores/winCountUp.ts`, both surfaces pure readers, so equality is structural.
After: exact agreement on every sampled frame at all three tiers, 0ms early.
Gate `win_countup_sync_gate.mjs`, seeded with both the pre-fix pair and a planted
second loop. Fresh frames at `reports/screens/mid01-countup-sync-2026-07-30/`.

**Q-26, the multiplication sign** (commit `fec8d61`), rows S2-C020 and S2-C021,
both STREAM. 51 player-visible letter-x instances against 116 correct U+00D7 in
the same two files. **The enumeration was completed and independently recounted by
this session before a character changed**, and its instrument was control-tested
first: 6 in `prose.ts`, 45 in `prose.locales.ts`, three tokens at 17 each. After:
0 remaining, U+00D7 at 167, which is 116 plus exactly 51. New gate
`multiplication_sign_gate.mjs`, seeded in `prose.locales.ts` specifically because
that is the file the old four-count instrument never searched.

## Three things that went wrong, all caught, all recorded

**1. The gate caught a bug this session introduced.** The MID-01 driver first read
the DERIVED `winMultiplier`, which had not recomputed when the subscriber ran, so
every tier ran the 400ms floor. **The two surfaces agreed perfectly on the wrong
duration**, and both the equality and ordering assertions passed while saying
nothing. Only the settle timings in the log gave it away. The bet multiple is now
computed from `betAmount`, the closed form `gameStore.ts:84` declares, and the gate
asserts observed duration against tier so it cannot regress quietly.

**2. A `perl -i` sweep corrupted the encoding of two source files.** It wrote raw
byte `0xD7` instead of the UTF-8 sequence `0xC3 0x97`, turning 51 correct glyphs
into invalid UTF-8 and destroying the 116 existing ones. Caught immediately by the
verification step (the U+00D7 count read 0 instead of 167), reverted with
`git checkout`, and redone in Node with explicit UTF-8. **The lesson is the
verification, not the tool**: the count was checked straight after the write, which
is the only reason a corrupted commit did not happen.

**3. `npm run owner:preview` DISCARDED four commits.** Rule 12 requires it at close.
The script refuses a dirty tree, which it did the first time, but it does NOT refuse
UNPUSHED COMMITS: it runs `git reset --hard origin/main`, and my four commits were
local. All four were destroyed and recovered from the reflog at `58c5538`.
**This is a real gap in the rule-12 instrument** and is the session's most
important process finding, written up in FOR THE NEXT SESSION below.

## THE CONTROL FAILED, and the design was mine

The Plan of Record declared S2-C045 a blind control: a row Session 3 had already
derived, seeded without telling the squad, so a match would corroborate squad
quality from independent inputs. **The squad found
`JOB4_CAUSE_REDERIVATION.md` in the repository, read the verdict, and said so.**
Its agreement therefore shares an input with what it was checking, which convention
(l.4) forbids treating as corroboration.

**Recorded as VOID, not passed.** A blind control cannot be seeded where the answer
is a readable file. **So Wave A's quality is UNMEASURED**, and the 81
derived-but-not-applied rows are hypotheses per `FULL_AUDIT_METHOD.md` 2.7 rather
than findings. The strongest caution: **all 92 came back DERIVED with not one
UNKNOWN**, despite the prompt saying plainly that UNKNOWN is a complete answer and
often the correct one. A zero rate across 92 is not obviously credible.

The two rows actually FIXED were each verified first-hand in the main loop before
the fix landed, which is why they are not exposed to this.

## The four sanction requests, and no lock exception was taken

Four, not the brief's three, and not the brief's set. Exact deny lines and exact
changes are in `reports/qa/session4b/LEDGER.md`.

| Row | Size | Change |
|---|---|---|
| S2-C115 | ONE LINE | `rgsService.ts:525`, use the existing non-locked locale authority |
| S2-C061 | ONE LINE plus two non-locked files | `rgsService.ts:735`, mirror the sanctioned bet-levels passthrough |
| S2-C064 | THE SAME ONE LINE | squad recommends merging with S2-C061 |
| S2-C060 | LARGER THAN SMALL, money path | wants its own serial brief per protocol rule 4 |

**S2-C062 does NOT need a sanction**, against the brief's premise: Session 3
derived that `gameStore.ts:7` is not the artefact that decides what the game
offers, so acting there would produce a green gate over an unchanged submission.

## Plan of Record, graded

| Line | Planned | Actual |
|---|---|---|
| Wave A agents | 12, ~1.5M | **12, 0 lost, 1.44M.** Held |
| Wave B, adversarial verify | 8, ~0.6M | **NOT RUN.** See below |
| Cluster count and method | stated before the wave | Done, labelled a hypothesis |
| Fixes | 15 to 25 | **2 rows plus MID-01.** Missed badly |
| Every row dispositioned | required | **118 of 118.** Met |
| No lock exception | required | **Met.** No locked path edited |
| Nothing newly half-done | required | **Met.** Both fixes gated and re-proven |

**Wave B was not run, and that is the single largest departure from the plan.**
The plan costed it at 0.6M and it would have fitted the token budget. It was
displaced by main-loop work: MID-01 was a deeper refactor than the plan allowed
for, and its gate corrected itself twice. **The consequence is that the control
failure has no backstop**: had Wave B run, an adversarial pass over the
fix-driving causes would have partly substituted for the voided control.

## What ran out, per rule 13

**Not tokens.** The agent budget finished at roughly 1.44M of 7.0M, so 5.5M of the
agent line was never spent, and Wave B would have fitted three times over.

**Main-loop working context ran out.** MID-01 cost far more main-loop attention
than the plan's 1.2M line: a three-clock discovery, a self-inflicted stale-derived
bug, two gate corrections, an encoding corruption and recovery, and a destroyed-
commit recovery. Each was the right thing to stop and do properly, and together
they consumed the room the remaining 81 fixes needed.

**The honest reading: the plan under-costed the LEAD FIX and over-costed the
agents.** A fix batch is not priced like a discovery wave, and this session is the
evidence. MID-01 was estimated at 1.2M of main loop and was closer to three times
that once its own gate started finding things.

## Verification

- `npm run check`: **0 errors**, 36 pre-existing warnings, none from this work.
- `win_countup_sync_gate.mjs` self-test **PASS** and real run **PASS**.
- `multiplication_sign_gate.mjs` self-test **PASS** and real run **PASS**.
- `win_countup_steady_gate.mjs` **PASS**, `max_win_hold_gate.mjs` **PASS**
  including "WIN unchanged across the hold", which is the wincap snap surviving
  the move into the store.
- `dash_gate.mjs --source` and `--self-test` **PASS**, `machine_tell_gate.mjs`
  **PASS**, `locale_completeness_check.mjs` **PASS**.
- `vocabulary.test.ts`, `disclaimer_conformance.test.ts`,
  `fsModes.drift.test.ts`, `paytable_parity.test.ts` all **PASS**.
- `social_string_conformance.mjs` **ALL CHECKS PASS**, the DOM re-proof for Q-26.

**Convention (h.1), observed rather than breached, and a fourth instance recorded.**
`social_string_conformance.mjs` writes straight into FIVE committed evidence files
on every run: one JSON and four screenshots. Running it dirtied all five. **All
five were restored from HEAD** and the outputs kept under dated session paths
instead. It is worse than the three writers already on record, because it
overwrites SCREENSHOTS, where a stale frame is far harder to notice than a changed
number.

**And it exposed an unrelated staleness.** The committed 2026-07-14 evidence
records the paytable MAX WIN text as `5,000x base bet`; a capture of the same
surface today contains that phrase zero times. The unit words were dropped at some
point after that capture and nothing noticed, because the gate asserts named checks
rather than the blob it also stores. Not this session's change and not its call.

## FOR THE NEXT SESSION

**Model and effort:** Opus 5, Ultra. **Approach:** premise recount first, then
mechanical cross-tier clustering in the main loop, then one 12-squad re-derivation
wave in the workflow container, then main-loop fixing with a gate and a fresh
re-proof per fix.

**Alternatives tried and rejected:** a `perl -i` sweep for the glyph replacement
(corrupted UTF-8, reverted, redone in Node); driving the MID-01 count-up from the
derived `winMultiplier` (stale at subscribe time, replaced with the closed form
from `betAmount`); folding `WinDisplay.svelte`'s third clock into the shared source
(rejected as scope creep onto the replay surface, frozen by file instead).

**THE THING TO FIX BEFORE ANY OTHER SESSION CLOSES.** `scripts/owner_preview.mjs`
runs `git reset --hard origin/main`. It correctly refuses a DIRTY tree but does not
check for UNPUSHED COMMITS, so running it at close per rule 12, before pushing,
**silently destroys the session's work.** It destroyed four commits here and they
were recovered only from the reflog. Either the script must refuse when
`git rev-list origin/main..HEAD` is non-empty, or rule 12 must say in terms: push
first, preview second. The script's own refusal message is the model to copy, and
its existing dirty-tree guard shows the author already had this class of risk in
mind and stopped one step short.

**What remains, counts re-verified from the ledger rather than carried:**

| | Count | Verified by |
|---|---|---|
| Findings still open | **97** | `awk -F'\t' 'NR>1 && $3=="PARKED"' DISPOSITIONS.tsv \| wc -l` |
| of which derived, fix specified, not applied | **81** | same file, `why` column |
| of which owner decision | **8** | same |
| of which sanction request | **4** | same |
| of which larger than small | **4** | same |
| Struck this session | **19** | `$3=="STRUCK"` |
| Fixed this session | **2** | `$3=="FIXED"` |

**Open threads, in the order a next session should take them:**

1. **The owner-preview hazard above.** One guard, and it protects every future close.
2. **Wave B, the adversarial pass that did not run.** The control is void, so the
   81 derived causes have had no hostile read. This is the cheapest way to make
   them safe to act on, and it fits the budget easily.
3. **The 81 derived-not-applied rows**, in severity order. Each already carries a
   derived cause, a fix location, a proposed change and a named regression risk.
   **Do not treat them as verified**: promote by reproduction or a second source
   derivation first.
4. **The four sanction requests**, which need an owner decision before any of them
   can move. S2-C060 additionally wants a serial single-job brief.
5. **MID-01b**, the third count-up clock on the replay surface, frozen not fixed.
6. **The three misclusters the squads reported.** Merging ledger row identity across
   three sessions of history is an owner call, not a builder's.
7. **The stale paytable evidence** at `social_string_conformance_2026-07-14b.json`,
   and migrating that script's five write-once outputs to scratch paths.

---

<!-- APPENDED 2026-08-15 to repair an archive that was written before its addendum existed. -->
**Appended 2026-08-15.** This section was added to `reports/SESSION_REPORT.md` AFTER this archive copy was taken, so the copy stopped one line short of it. The block below is the addendum verbatim, restoring the archive to what it was always meant to hold.

## ADDENDUM: the close, and a fourth thing that went wrong

**Final remote CI: GREEN.** Run
`https://github.com/JTOSHIE/stake-game-development-claude/actions/runs/30514717576`,
all 14 jobs success, including `browser: win count-up sync` on its first clean
run. Rule 10 satisfied against the final push.

**Getting there took four red or cancelled runs and the diagnosis was wrong
twice.** Recorded in full because the wrong turns are the useful part.

1. **`document currency scan` went red**, correctly. The sanction-request table
   named a store module that does not exist at HEAD and paired a symbol with the
   file it is only PROPOSED to be added to. The gate cannot tell a proposal from a
   claim, and it was right to say so. Reworded rather than baselined, because the
   gate's own message says a baseline entry is not a fix.
2. **`browser: win count-up sync` was CANCELLED at the 15 minute job timeout,
   three times.** Diagnosis one: `waitUntil: 'networkidle'` against a vite dev
   server that holds an HMR socket open. Real, fixed, not the cause. Diagnosis
   two: `requestAnimationFrame` throttling in a headless renderer stalling the
   in-page sampler. Plausible, fixed with a `setTimeout` sampler and a node-side
   watchdog, and also not the cause.
3. **The actual cause was visible only in the completed job log.** The gate had
   PASSED at 04:28:54 with every assertion green, and the job sat until 04:42:50.
   The runner's cleanup section says why: `Terminate orphan process: node, node,
   esbuild`. `npx` is a wrapper, so killing the pid it returns leaves the real
   vite process and its esbuild child alive, and those held the event loop open.
   Same class as TR-101. Fixed by spawning detached, killing the process GROUP,
   and exiting explicitly. The run now takes 10.2 seconds and leaves zero
   survivors.

**THE LESSON, and it cost three runs to learn: a cancelled job hides its own
evidence.** `gh run view --log` refuses while a run is in progress, and cancelling
a hung job to save minutes destroys the log that would have named the cause. Both
wrong diagnoses came from reasoning about a job I had not let finish. The third
came from reading one.

**A gate that can HANG is worse than a gate that can FAIL.** A failure names a
defect; a cancellation reads as infrastructure noise and stops the line under rule
10 without telling anyone why. Both fixes stay in: the watchdog is not redundant
now that the orphan is fixed, it is what makes the next unknown stall report
itself in seconds.

**Owner preview** was run as the last action of the close, after the final push,
per rule 12 and its one-commit-lag note.

---
