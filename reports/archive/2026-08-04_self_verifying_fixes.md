
# 2026-08-04: THE SELF-VERIFYING FIX SESSION, and the count was the finding

Brief saved verbatim: `reports/briefs/FS_SELF_VERIFYING_Prompt.md`.
Branch: `main`, single writer. Base HEAD `df04d8c`, final HEAD recorded below.
No lock exceptions taken. No money-path edits. `.claude/settings.json` untouched.

## THE HEADLINE, and it is a correction to the work order's own premise

**All 57 candidate rows carry a verdict. Fifty are STILL OPEN, seven are ALREADY CLOSED,
none returned UNKNOWN and none was lost.**

The work order was written on the belief that the backlog was "inflated by an unknown
amount" and that fixing before counting would "spend the session re-fixing closed rows".
**It is inflated by seven rows.** The reconciliation was still the right first job, because
it converted an unknown into a measured figure and that was the owner's stated priority,
but **it did not find the large hidden surplus that motivated it, and this report does not
present it as though it did.**

The seven already closed at HEAD: **S2-C006, S2-C017, S2-C067, S2-C073, S2-C074, S2-C087,
S2-C092.**

**The strongest validity signal is where the pass disagreed with the brief.** Six of the
eight rows the brief suspected were confirmed closed against source. The two that were not,
**S2-C009 and S2-C012**, are exactly the two the brief itself flagged as believed closed
"by inference from a commit message rather than from source". The pass reproduced the
brief's own stated weakness in the place the brief predicted it, which is far harder to
fake than agreement would have been. One row closed that nobody suspected: S2-C087.

**Sizing consequence for the next planner: the remaining work is 50 rows.** Any plan built
on the candidate set collapsing under reconciliation should be rebuilt on 50.

## PLAN OF RECORD, and the grading

Posted before the first expensive spend, per rule 15:

```
  budget seen        : main loop ~400k of ~740k working; agent line ~1.5M (not binding)
  waves planned      : 1 x 12 agents, container-orchestrated per (q), 4-5 rows each
  discovery cost     : 12 x ~120k = ~1.44M agent tokens
  expected findings  : 57 verdicts
  verification cost  : 0 extra agents, each verdict self-verifying by construction
  VERDICT            : FITS for JOB 1; JOBS 2 and 3 sized only after the count is known
```

**Graded: the arithmetic held on the agent line and was optimistic on the main loop.**
Actual agent spend was about 2.88M across both runs, roughly double the 1.44M planned,
because two shards died and were re-run and the retries carried full context. The agent
line was never the constraint, exactly as the plan said, so the overrun cost nothing.

**The main loop is where the plan was wrong, and it is worth naming.** The plan assumed
JOBS 2 and 3 would get most of the main-loop budget. In practice JOB 1's marshalling,
the two failure recoveries and the per-row fix work consumed it faster, and the session
reached its fix-stop line having landed three fix commits rather than the twenty-odd the
tier counts imply. That is the constraint `AGENT_BUDGET_AND_SCHEDULING.md` 4.5 describes,
behaving exactly as documented: **this was a construction session, so context bound and
tokens did not.**

## WHAT LANDED

| commit | scope | proof |
|---|---|---|
| `563c695` | brief saved verbatim, resume ledger opened | conventions (b) and (f) |
| `8970f0d` | JOB 1: `RECONCILED.tsv`, `RECONCILED_NOTES.md`, 12 shards | every verdict carries a file and line at HEAD; four spot-checked from the main loop |
| `8618180` | resume lines | rule 13 |
| `e8b7e4e` | JOB 2, S2-C077 and S2-C078 | seeded a false CHECK anchor, drove the doc currency gate RED, then PASS with real figures |
| `dce952b` | JOB 2, S2-C070 | `orphan_candidates.txt` has exactly 550 lines and regrouping it reproduces 439 / 33 / 19 |
| `7d3bccd` | JOB 4: ledger made true, additively and dated | old and new JSON compared key by key, no pre-existing content altered |
| `c1225e1` | resume line | rule 13 |

Context at each commit is recorded in `reports/qa/session7/RESUME.md`, per the brief.

## JOB 2 AND JOB 3: WHAT WAS NOT DONE, AND WHY

**JOB 2 landed 3 of 22 open documentation rows. JOB 3 landed none of its 19.** The
degradation order was 1, 2, 3, 4, 5, and JOB 4 was taken ahead of the remaining JOB 2 rows
deliberately: DONE MEANS requires the ledger to record the verdicts, and a session that
spent its last context on one more document correction while leaving seven rows still
reading PARKED would have reproduced the exact failure it was convened to stop.

**S2-C056 is PARKED, not skipped and not guessed.** It rewrites a sentence attributed to an
owner ruling and needs the owner to confirm the `future-spinner-3` destination first. The
brief is explicit that a row needing a ruling or an owner decision is parked.

**One coupling a later session must not miss.** S2-C077 part (b) asks that
`frontend/scripts/dist_hygiene_gate.mjs` derive its report filename from the run date
instead of the literal `2026-07-26`. That is gate-tier work, it belongs with S2-C079, and
it is **coupled to the two CHECK anchors added in `e8b7e4e`**: changing the filename breaks
both anchor paths and they must move in the same commit.

## THE CI CAVEAT, stated honestly as the brief demands

**This session's final push is documentation-only, so the twelve browser legs were skipped
by design, and reporting a bare green would be misleading.**

Run `30889187583` on `c1225e1`: **success**, static gates and "what changed" green, browser
matrix `skipped`. That is `checks.yml`'s intended behaviour: the filter at
`.github/workflows/checks.yml:172` gates the matrix on `frontend/`, `games/`,
`design-system/`, `scripts/`, `.github/workflows/`, `package.json` or `package-lock.json`,
and this session touched none of them.

**Which commit last exercised the browser matrix, and the answer is worse than expected.**
The last commit touching a matrix path is `6092335`, and **its run `30607097365` was
CANCELLED with only 1 of 13 browser legs succeeding.** Searching back, **the last run in
which the full browser matrix went green is `30600681036` on commit `3d068eb`, 13 of 13.**
So the true statement is: the browser matrix has not been seen fully green since `3d068eb`,
and every push since has either skipped it or had it cancelled. That is not this session's
doing and this session did not fix it, but a reader entitled to a green needs the real
date, not the most recent success badge on a documentation push.

## RULE 12, the owner preview

Refreshed before this report was written, per rule 12. The printed line:

```
OWNER PREVIEW  |  v10 line, main  |  commit c1225e1  |  built 2026-08-04T17:45:37+10:00  |  started 2026-08-04T07:47:18.447Z  |  http://192.168.4.92:5173
```

**Curled rather than believed**, per the rule's own earned warning that printing a URL is
not evidence the URL works: `HTTP 200` in 0.004s, serving the expected document. It is run
once more as the last action after the final push, so the owner's machine ends on the true
tip, and the one-commit lag between the line above and this report is the design rather
than a fault.

## FOR THE NEXT SESSION

**Model and effort.** Opus 5, high effort, single main-loop session on `main`. Twelve
workflow subagents plus two recovery agents, about 2.88M subagent tokens, 795 tool uses.

**Approach taken.** Reconcile first with disposable agent contexts, fix second in the main
loop. Payloads were generated to disk by script and passed to the workflow by file path, so
the 55k of row data never entered the main loop. Every fix carries a proof that does not
depend on the recorded cause.

**Alternatives tried and rejected.**
- *Giving agents the recorded cause.* Rejected. The brief only required telling them not to
  re-litigate it; `FULL_AUDIT_METHOD.md` 1.3b records that the prior pass was weakened by
  file layout rather than instruction, so the narrative was withheld as well as forbidden.
- *Trusting the agents' `self_verifying` column.* Rejected, and this is the most important
  handover note. 56 of 57 rows say YES. That is a prompt artefact: the first ten shards were
  asked loosely and returned YES on all 49 rows; the last two, asked a strict form naming
  the failure mode, immediately returned a NO. **The column records what the agents said and
  authorised nothing.** Scope came from the brief's tiers instead.
- *Re-running the ten loose shards with the strict question.* Rejected on budget. It would
  have cost roughly 1.2M agent tokens to relabel a column that was not being used to decide
  anything. Recorded as open work instead.
- *`json.dump` at default formatting for the ledger.* Rejected after seeing it: it
  reformatted all 118 rows into a 4120-line diff. The original serialisation was recovered
  by round-trip test (`indent=2, ensure_ascii=False`, byte-identical) so the committed diff
  shows the addition rather than a rewrite.

**Files touched.** `SUBMISSION_DOSSIER.md`, `reports/qa/file_census/CENSUS_MECHANICAL.md`,
`reports/qa/session4b/{LEDGER.md, DISPOSITIONS.tsv, waveA_raw.json}`,
`reports/qa/session7/**` (new), `reports/briefs/FS_SELF_VERIFYING_Prompt.md` (new).

**Open threads, in the order a next session should take them.**
1. **47 rows remain** after this session's three: 19 documentation, 19 gate or CI, 6
   component, 3 other. `reports/qa/session7/RECONCILED.tsv` carries each with its evidence.
2. **JOB 3 is entirely unstarted.** Its 19 rows are the ones where convention (p) supplies
   the proof directly, so they are the best value per commit remaining.
3. **The browser matrix has not been fully green since `3d068eb`.** Worth settling before
   anyone quotes a green CI state to a reviewer.
4. **S2-C056 needs an owner ruling** on the `future-spinner-3` destination.
5. **S2-C077 part (b) is coupled to the new CHECK anchors**, as described above.
6. Unchanged from the brief: the reviewers' named blocker, money-display integrity and
   localisation completeness, which the owner has ruled comes next and which no session has
   yet scoped; and the ten questions of entry 038.
