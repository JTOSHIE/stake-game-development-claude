# SESSION 6 BOOT: safety checks, orchestration, and the Plan of Record

Brief: `reports/briefs/FS_RECORD_TRUTH_Prompt.md`. Session runs UNATTENDED on `main`,
2026-07-31. Model Opus 5. This session holds the INTEGRATOR role (multi-track rule 1).

---

## 1. The four boot checks, as pasted command results

### `git status --porcelain`

```
$ git status --porcelain
$
```

Empty. Tree clean at boot, per unattended rule 3.

### `git rev-parse HEAD`

```
$ git rev-parse HEAD
97498136152aecf1f6bc2f4a4098c05f2c3343a3
```

Short form `9749813`, which is the HEAD the brief's premise block resolved against, so
every VERIFIED premise in that block was checked against the tree this session starts on.

### `gh run list --limit 1`

```
$ gh run list --limit 1
completed	success	fix(gates): assert the phase the requirement is about, and replace a …	checks	main	push	30554058958	4m18s	2026-07-30T14:54:44Z
```

GREEN. Protocol rule 10 is satisfied and a new job may start. The five most recent runs
are all `completed success`, so this is a settled green rather than one lucky run.

Run 30554058958 took 4m18s, which sits just above the 3.4 to 3.7 minute clean-run band
recorded in `CLAUDE.md` protocol rule 10 and well inside the range that rule tells a
session to judge against. Not an incident.

### `git diff --exit-code .claude/settings.json`

```
$ git diff --exit-code .claude/settings.json
$ echo $?
0
```

Clean. No lock lift is authorised by this brief, so this must still read 0 before every
commit this session makes, per unattended rule 5.

---

## 2. Premise recount, per protocol rule 16

Rule 16 says a session that acts on a premise without recounting it has converted somebody's
narration into an order. All six premises in the brief were recounted at boot. **The recount
is the point, not the agreement**, so the commands and their answers are recorded even where
they simply confirmed the brief.

| Premise | Recount command | Result |
|---|---|---|
| Ruling: remediation before discovery | `grep -n "Remediation before discovery" reports/FABLE_COMMS.md` | **HOLDS.** Line 1283, entry 026 ruling 1, exactly as cited |
| `build_diet_verify.mjs` is dead and unwired | `grep -n` over the script and `checks.yml` | **HOLDS.** `:47` defines `killPreview()` as `_server.close()`, `:206` calls `preview.kill()`, and `killPreview` has zero call sites. The single `checks.yml` hit is at `:698` and is prose inside a comment about gate 13e, not a wiring line |
| TR-059 reads `OPEN, mapped to JOB 2` | `sed -n '312p' docs/records/reviews/REVIEW_TRACKER.md` | **HOLDS.** Line 312 is the TR-059 row and its disposition column reads `OPEN, mapped to JOB 2` |
| The owner's dev server holds port 5173 | `lsof -nP -iTCP:5173 -sTCP:LISTEN` | **HOLDS.** `node` pid 24548, `TCP *:5173 (LISTEN)`. Untouchable for the whole session |
| Twelve answers are owed, not seven | `sed -n '1,40p' reports/FABLE_COMMS.md` | **HOLDS, and it is stated by the record itself.** Entry 034's overlap block reads *"So the true count of open questions is twelve and not fifteen"*: entry 031's seven asks plus five genuinely new rows, with S2-C014, S2-C015 and S2-C062 already inside the seven |
| Orchestration available to this session | Tool inventory, see section 3 | **SETTLED. Container orchestration IS available** |

One clarification the recount produced, recorded because it changes a JOB 1 detail rather
than a premise. The brief says TR-111 is "mapped to JOB 5" work; the tracker row at
`docs/records/reviews/REVIEW_TRACKER.md:292` does read `OPEN, mapped to JOB 5`. That is a
mapping to a job number in an EARLIER brief, not to this brief's JOB 5, which does not
exist. This session's JOB 1 is that row. Noted so a later reader does not try to reconcile
two unrelated numbering schemes.

---

## 3. Orchestration, and the wave cap

The brief marks this REPORTED and requires JOB 0 to settle it before any wave, because
`docs/skills/FULL_AUDIT_METHOD.md` 4.1 requires the container for any wave above about four
agents: a chat fan-out leaves no run id, no persisted script and no per-agent cache, so a
wave that dies mid-flight cannot be resumed and convention (q) has nothing to act on.

**SETTLED: this session HAS container orchestration.** The `Workflow` tool is present in the
inventory. It persists its script to the session directory, returns a run id, caches each
completed `agent()` call, and supports `resumeFromRunId`, which is precisely the durability
layer 4.1 names. Chat-spawned agents via the `Agent` tool are also available for small
counts.

**WAVE CAP: 15 agents**, which is this session's configured workflow size guideline rather
than a number chosen here. It binds nothing in this brief: the largest wave planned is JOB
2's seven, and JOB 3's is two.

**The routing rule this session will follow**, so it is decided once rather than per wave:

- JOB 2's wave of seven runs in the **container**, above the 4.1 threshold.
- JOB 3's wave of two runs in the container as well. It is under the threshold and could
  lawfully be chat-spawned, but by then the script pattern is already written and the
  durability is free.
- JOB 1's single reproduction agent is **chat-spawned**. One agent is below every threshold
  and re-issuing it costs less than authoring a script, which is exactly the carve-out 4.1
  states.

**Every agent returns a LOST marker rather than silence on failure**, per 4.1, so the marshal
can tell a document that was swept clean from one whose agent died.

---

## 4. PLAN OF RECORD, per protocol rule 15

Rule 15 requires this block BEFORE the first expensive spend, stating wave costs, expected
findings, **the verification cost computed at launch rather than discovered afterwards**, and
a FITS or DOES NOT FIT verdict. The session is graded against it at close.

### The budget line that actually binds

Per `docs/skills/AGENT_BUDGET_AND_SCHEDULING.md` 4.5, the binding constraint here is **main
loop context**, not tokens and not the clock. The brief sets it explicitly:

| Line | Figure |
|---|---|
| Window | about 1,000k |
| Less boot | about 60k |
| Less close reserve | about 200k |
| **WORKING BUDGET** | **about 740k** |

Stop lines, from the brief: no new wave below 300k, no new agents below 250k, close at 200k.

**The agent token line is not costed against a ceiling**, because the brief states agents are
cheap and the token line is not the constraint. Agent spend is reported at close as a measured
figure, not planned against a limit.

### Wave costs and expected findings

Document sizes are measured rather than estimated, by `wc -l -c`, because JOB 2's agent cost
is driven almost entirely by how much each agent must read.

| Job | Agents | Where | Main loop cost | Agent cost | Expected findings |
|---|---|---|---|---|---|
| JOB 0 | 0 | main loop | ~60k spent | 0 | 4 boot checks, 6 premises, this plan |
| JOB 1 | 1 | chat-spawn | ~80k | ~40k | 1 known defect, reproduced |
| JOB 2 | 7 | container | ~180k | ~0.9M | 20 to 55 stale claims |
| JOB 3 | 2 | container | ~40k | ~0.2M | citations closed, plus a literals census |
| JOB 4 | 0 | main loop | ~120k | 0 | close artefacts |
| **TOTAL** | **10** | | **~480k** | **~1.14M** | |

The seven JOB 2 documents, measured:

| Document | Lines | Bytes |
|---|---|---|
| `docs/records/reviews/REVIEW_TRACKER.md` | 370 | 276,944 |
| `SUBMISSION_DOSSIER.md` | 793 | 55,086 |
| `GAME_FACTS.md` | 403 | 23,393 |
| `BOOKS_MANIFEST.md` | 121 | 6,911 |
| `COMPLIANCE_WATCH.md` | 720 | 44,173 |
| `docs/QUALITY_CHARTER.md` | 530 | 51,488 |
| `reports/qa/stream_test/KNOWN_OPEN.md` | 85 | 11,622 |

`REVIEW_TRACKER.md` is 277kB across 370 lines, so its rows are very long and it is five
times the next largest document. It gets the largest agent and it is the one most likely to
return partial coverage; that risk is named here so a partial return is read as expected
rather than as a surprise.

### The verification cost, computed at launch

This is the figure rule 15 exists to force, and the reason the money-display sweep was
rejected: sized honestly, that sweep put discovery at about 13.6M against a 13.7M line, so
verification could not run at all.

**The arithmetic here, stated with what each term relies on:**

- Expected corrections: **20 to 55** across seven documents. The lower bound is 3 per
  document; the upper is 8. Both are estimates and are labelled as such. The one calibration
  point is TR-059, verified stale before launch.
- Verification per correction: the main loop re-checks the agent's cited line against HEAD
  before applying it. That is one `grep` or one narrow `Read` plus the edit itself, about
  **1.5k main loop tokens**.
- **Verification cost: 30k to 83k main loop tokens.**

That fits inside JOB 2's 180k main loop allocation with room, and the reason it is cheap is
structural rather than lucky. **Every JOB 2 claim is an OBSERVATION, not a DIAGNOSIS.** Per
`docs/skills/FULL_AUDIT_METHOD.md` 2.7, observations verified at 94 per cent and diagnoses at
19 per cent, and an observation of the form "this document says X, does the repository say X"
is settled by opening the file. A diagnosis would need reproduction or source derivation and
would cost multiples of this.

**This is the whole reason the subject was changed rather than the shape.** Same seven-agent
fan-out, same marshal, but a claim population whose verification is one command instead of a
reproduction.

### Verdict

**FITS.**

Main loop: ~480k planned against a ~740k working budget, leaving about 260k of headroom
against a close reserve already carved out. Verification is 30k to 83k of that and is
affordable at both bounds, which is the specific test the rejected sweep failed.

**Where it would stop being true.** If `REVIEW_TRACKER.md` alone returns more than about 25
corrections, JOB 2's main loop allocation is the line that goes first, not the agent line.
The response is stated in advance so it is not improvised at 3am: **apply that document's
corrections in severity order, commit at the boundary, and park the remainder with its
resume line in `reports/qa/session6/RESUME.md`.** Per the degradation order a parked
remainder is never half-attempted.

### Degradation order, restated as it will be executed

JOB 0, then 1, then 2, then 3, then 4. JOB 4's close is not droppable: rule 10 requires the
final push's remote result to be read and rule 12 requires the preview refresh, which is why
200k is reserved rather than spent.

---

## 5. Standing constraints this session operates under

Recorded here so every later commit can be checked against one list.

- **Port 5173 is the owner's and is LISTENING now.** Not bound, probed, restarted or killed.
  `pkill` is never used. Any browser work starts its own server on its own port.
- **No lock exceptions.** No deny line is named by the brief, so none is authorised.
  `.claude/settings.json` is untouched by any route, verified before every commit.
- **No money-path work.** TR-086, TR-109, TR-115 and the twelve owed answers are out of scope,
  including measuring one to propose a fix.
- **`locale_prose_conformance.mjs` is not wired into CI**, per JOB 3.
- **Gates are read as text by default.** A gate that is executed runs via `--self-test` or from
  a scratch copy outside the repository, and `git status --porcelain` is checked immediately
  after, per convention (h.1) and unattended rule 2.
- **No `git checkout -- .`, no `git clean`, no `rm -rf` of a repository path.** Restoration is
  per path and by name; deletion is renaming aside per `FULL_AUDIT_METHOD.md` 4.2.
- **Explicit-paths commits only**, per convention (k). Never `git add -A` or `git add .`.
- **Push early and read the remote result**, per unattended rule 7 and protocol rule 10. A red
  main stops all other work.
