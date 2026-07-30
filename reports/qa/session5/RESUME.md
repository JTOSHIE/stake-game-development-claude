# SESSION 5 RESUME LEDGER

Brief: `reports/briefs/FS_ATOMIC_PASS_Prompt.md`. Session opened on `main` at HEAD `a2e2509`.

**Why this file exists.** Protocol rule 13 makes an honest stop lawful only at a wave boundary,
and a prose-and-gate session has no waves. The brief therefore defines the boundary as one
commit per row, with one line appended here after each. A stop after any commit below is
lawful, and the next session resumes from the first job not listed as DONE.

## PLAN OF RECORD, posted before the first spend, per rule 15

| Line | Figure |
|---|---|
| Working context budget | about 740k |
| Boot, orientation and anchor verification | about 70k, with two delegated reads keeping about 178k of agent work out of the main loop |
| JOB 1 5k, JOB 2 15k, JOB 3 120k, JOB 4 95k, JOB 5 three rows at 25k, JOB 6 15k, JOB 7 20k, JOB 8 50k | 395k |
| Close reserve, not optional | 200k |
| Total | 665k against 740k |

**VERDICT: FITS**, with two declared risks. The brief itself predicts JOB 3 runs over, and JOB 8
must not start below 250k. If JOB 3 overruns, JOB 8 parks first and then JOB 5 rows beyond the
third. The degradation order belongs to the owner and this session is not changing it.

**ON THE CONTEXT FIGURES BELOW.** A session cannot read its own context meter, so every figure
recorded per commit is an ESTIMATE derived from the transcript, not a measurement. It is marked
as such rather than presented as instrumented, per rule 16. The next brief should size from the
shape of these numbers and not from their precision.

## COMMITTED ROWS

| # | Job | Row | Commit | Context estimate at commit | State |
|---|---|---|---|---|---|
| 1 | JOB 1 | Eight ruling-blocked rows into one comms entry | `f60ac3c` | about 80k of 740k | **DONE.** Entry 034 appended, newest first. Doc currency gate 0 new, dash gate PASS |
| 2 | JOB 2 | Seed-scoring hole in the replay gate | `0dc7eca` | about 150k of 740k | **DONE.** UNAPPLIED is now a third scoring class, exit 3. Self-test 6/6 caught, 0 missed, 0 unapplied, 10/10 assertions, exit 0. Real run 15/15, exit 0 |
| 3 | JOB 3 | S2-C006, replay figures persist past the ready phase | `d1cd0c3` | about 300k of 740k | **DONE.** Figures hoisted out of the phase branch. Two new assertions plus the `figures-lost-after-play` seed. 12 before and after frames committed. Self-test 7/7 caught 0 missed 0 unapplied, real run 17/17, exit 0. **Found and recorded a PRE-EXISTING defect this did not cause and does not fix: `frontend/src/app.css:125` puts the replay compliance disclaimer above the fold at six of eight presets. See the commit body.** |
| 4 | JOB 4 | S2-C009, the social leg on the replay gate | (this commit) | about 360k of 740k | **DONE.** Social assertion plus its real-money control plus the `social-label-not-swapped` seed. Self-test 8/8 caught 0 missed 0 unapplied, real run 19/19, exit 0. Social renders `Token: EUR`, real money `Currency: EUR` |
