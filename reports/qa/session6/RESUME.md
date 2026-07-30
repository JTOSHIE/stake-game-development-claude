# SESSION 6 RESUME LINE

Brief: `reports/briefs/FS_RECORD_TRUTH_Prompt.md`. One line per commit, newest last, so a
session picking this up mid-flight knows exactly where the last one stopped.

The brief's rule: **if a stop line is reached mid-job, stop at the last commit boundary and
write the resume line.** A half-applied document is worse than an untouched one.

Context figures are the main loop's own budget line per
`docs/skills/AGENT_BUDGET_AND_SCHEDULING.md` 4.5. They are ESTIMATES read from the session's
own accounting rather than from an instrument, and are labelled as such so a later brief
sizes from a measurement it can see the provenance of.

| # | Commit | Job | What landed | Remote CI | Main loop context, estimated |
|---|---|---|---|---|---|
| 1 | `1bc6b5c` | JOB 0 | Brief saved verbatim, BOOT.md with the four boot checks, the premise recount, orchestration settled, and the Plan of Record | **RED**, run 30572358384 | ~75k |
| 2 | `b8d8012` | JOB 0 | This file, created because commit 1 cited it before it existed | GREEN, run 30572609221 | ~95k |
| 3 | `de2fa23` | JOB 1 | TR-111 closed: the gate runs, ships a seeded self-test proven red on a planted defect, and is wired into the browser matrix. Shard at `reports/qa/session6/shards/JOB1_TR111.md` | GREEN, run 30573360277 | ~185k |
| 4 | `ba4ce67` | JOB 2 | Resume record brought current before the seven-agent wave returns | GREEN, run 30573931019 | ~205k |
| 5 | `e16bee0` | JOB 2 | The seven recount shards, committed as evidence before any diff was applied | (superseded by 9bb88c6 below) | ~370k |
| 6 | `9bb88c6` | JOB 2 | Two PROSE_SOCIAL references given a form that matches their meaning, after the shard commit surfaced a latent gate false positive | GREEN, run 30575807242 | ~430k |
| 7 | `9164183` | JOB 2 + 3 | TR-059 narrowed to the three cited strings that actually survive; `shards/LOCALISATION.md` | GREEN, run 30576110947 | ~500k |
| 8 | this commit | JOB 2 | `RECORD_DELTA.tsv` and this parking record | | ~530k |

## Where the session is now: JOBS 0, 1 and 3 COMPLETE. JOB 2 PARTLY APPLIED.

JOB 0, JOB 1 and JOB 3 are complete, committed, pushed and green on the remote.

**JOB 2 discovery is COMPLETE and committed. JOB 2 APPLICATION is deliberately PARTIAL.**

All seven agents ran, all seven shards are committed with their evidence, and one document's
corrections have been applied. **The other six are PARKED, not half-attempted**, which is the
brief's own instruction: a half-applied document is worse than an untouched one.

**The resource that ran out is MAIN LOOP CONTEXT**, per protocol rule 13's requirement that a
stopping session names what was actually exhausted. Not tokens: the agent line spent about
1.4M against a budget that was never the constraint. Not the clock: the owner has ruled ready
when it is right. The session stopped applying at the brief's stop line so that the close
itself, which rule 10 and rule 12 make non-droppable, could be done properly rather than
rushed. This is exactly the constraint
`docs/skills/AGENT_BUDGET_AND_SCHEDULING.md` 4.5 predicts for a session whose main loop
constructs and marshals rather than delegating, and the Plan of Record named it as the
binding line before the first spend.

### PARKED, with the resume line for each

Every one of these has a committed shard holding the finding, the command that proves it, and
in most cases the exact replacement text. **The reading is done; only the applying is left.**

| Document | Shard | State |
|---|---|---|
| `SUBMISSION_DOSSIER.md` | `shards/SUBMISSION_DOSSIER.md` | PARTIAL recount, proposals ready. **Highest consequence of the six**: it is what an external reviewer reads. Two known items: its section 5a description of `build_diet_verify.mjs` predates that gate becoming a real CI leg today, and its "Current measured size" is a present-tense phrase on a moving value (convention (s)) |
| `COMPLIANCE_WATCH.md` | `shards/COMPLIANCE_WATCH.md` | PARTIAL recount, proposals ready |
| `docs/QUALITY_CHARTER.md` | `shards/QUALITY_CHARTER.md` | Complete shard. Its agent's structured return was LOST; the shard is intact and carries a specific Q-01 recount |
| `GAME_FACTS.md` | `shards/GAME_FACTS.md` | Complete shard. Structured return also LOST, shard intact. Note its UNKNOWNs are maths-adjacent and escalate under convention (l.8) rather than being applied |
| `BOOKS_MANIFEST.md` | `shards/BOOKS_MANIFEST.md` | COMPLETE recount, proposals ready |
| `reports/qa/stream_test/KNOWN_OPEN.md` | `shards/KNOWN_OPEN.md` | COMPLETE recount, proposals ready |
| `docs/records/reviews/REVIEW_TRACKER.md` | `shards/REVIEW_TRACKER.md` | TR-059 and TR-111 APPLIED. Four further line-reference corrections remain proposed, all LOW or MEDIUM: `HudOverlay.svelte` gates, `machine_tell_gate.mjs`, `layout_fit_gate.mjs`, `locale_completeness_check.mjs` |

**How to resume**: read a shard, verify its `oldText` still appears exactly once in the target
document, apply, commit that document on its own, push, read the remote result. One commit per
document. Do not batch them, and do not trust a shard's proposed text without re-running the
command beside it: the shards were written against `de2fa23` and the tree has moved since.

**Do NOT resume the workflow** (`wf_7f395b29-515`). Its discovery is complete and committed,
and convention (q)'s epoch warning applies with force: the tree has changed underneath it, so
a replay would concatenate two epochs. The shards on disk are the durable artefact.

### Carried forward as questions, not as work

- **The gate does not detect a successful external request** (`shards/JOB1_TR111.md` section
  5). Escalated under convention (l.8) because two external reviews graded a "no external
  resource loading" requirement PASS on its output. A submission claim; the builder does not
  rule on it.
- **`locale_prose_conformance.mjs` wiring** (`shards/LOCALISATION.md` section 3). Deliberately
  not wired. It detects a LEAK, not an ABSENCE, so it would not catch the three surviving
  strings. Left for a ruling.
- **A doc currency gate whose findings depend on which OTHER documents exist** (commit
  `9bb88c6`). Adding seven unrelated shards made two untouched rows start failing. Not
  explained, and deliberately not guessed at.

## The red on commit 1, recorded rather than smoothed over

`scripts/qa/doc_currency_gate.mjs` failed `BOOT.md:207` as a `DEAD_DOCREF`: that line cited
this file before this file existed. The gate was right and the document was wrong. Fixed
forward by creating the file rather than by reverting.

Worth keeping for the next session, because it is an argument rather than an anecdote: this
session exists to find claims that have drifted from HEAD, and it shipped one in its own first
commit. The gate caught it in sixty seconds because the brief required pushing early instead
of batching pushes to the end.
