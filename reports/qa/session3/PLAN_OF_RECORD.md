# SESSION 3 PLAN OF RECORD

**Posted before the first expensive spend, per protocol rule 15.** Brief at
`reports/briefs/FS_SESSION3_REMEDIATION_Prompt.md`. Opus 5, Ultra, on `main`, container
orchestration only, no lock exceptions.

Australian English, no em dashes or en dashes.

---

## 1. PREMISE RECOUNT, done before sizing because the brief ordered it

The brief carried four premises. Three were VERIFIED by its author. The fourth was REPORTED
and told this session to recount it. Both counts were recounted from the artefacts.

| Premise | Brief said | This session measured | Verdict |
|---|---|---|---|
| Upheld findings | 118 | **118** | **CONFIRMED EXACTLY** |
| Requirements with no proof path | 82 (65 nothing, 17 unwired script) | **80** (62 nothing, 18 unwired script) | **CORRECTED, minus 2** |
| Frozen stale claims | 341 | **341** | **CONFIRMED EXACTLY** |
| Fable's five rulings absent from the record | absent | **absent** | **CONFIRMED** |

### 1.1 The 118, confirmed exactly

Counted from `reports/qa/session2_audit/DISPOSITIONS.md`, 311 ledger rows, 126 sent to
verification:

```
grep "^| S2-C[0-9]" DISPOSITIONS.md | awk -F'|' '{print $6}' | sort | uniq -c
  78  UPHELD
  27  UPHELD, CAUSE UNSOUND
  13  UPHELD, ENUMERATION INCOMPLETE
   6  STRUCK, single seat refuted
```

78 + 27 + 13 = **118 upheld**. The remaining 8 of 126 are 6 struck at a single seat, 1 struck
by panel majority (S2-C018) and 1 unresolved. **No correction needed.**

### 1.2 The 82 is really 80, and the split is 62/18 rather than 65/17

The count does not live in `LEDGER.md` or `DISPOSITIONS.md` as the brief expected. It lives in
the 23 walk shards at `reports/qa/compliance_register/walk_shards/`, one row per requirement,
with a `proof_kind` column. That is the authoritative artefact and it was recounted from there.

**A parsing trap had to be cleared first, and it is why the recount was not a one-liner.**
Naive splitting on the pipe character mis-columns 15 of the 194 rows, because several
`impl_quote` cells contain markdown tables whose own pipes are unescaped. A left-anchored
count returns 61 NONE; a right-anchored count returns different rows again. The rows were
resolved individually against their `### REQ-NNN` notes headings.

| proof_kind | Count |
|---|---|
| CI_GATE | 66 |
| **NONE** | **62** |
| EVIDENCE | 39 |
| **SCRIPT_UNWIRED** | **18** |
| TRACKER_ROW | 8 |
| Unresolvable by parse, settled by hand (REQ-003) | 1, resolves to EVIDENCE (partial) |

**62 + 18 = 80 requirements with no proof path.** One of the 62 is the single `N_A` row, out of
scope by definition, so **79 are actionable**.

The reported 65/17 and the measured 62/18 differ by three and one. The difference is not
material to the session's shape and no attempt was made to reconcile it further: the
membership of the set is what sizes the work, and the membership is now enumerated at
`reports/qa/session3/NO_PROOF_SET.tsv`.

**Six further rows carry a PARTIAL proof** (`CI_GATE (partial, animation only)`,
`EVIDENCE (partial)`, `CI_GATE (one of four named 1-star causes only)` and three more). They
are NOT counted in the 80. They are named here because a partial proof is not the same as a
proof and they are the obvious next tier if budget survives.

### 1.3 The transcription backlog, confirmed by absence of a token

`COMMS-ACK` appears against entries 022, 019, 015, 013, 011, 009, 005, 004 and 003.
**It appears against 020, 023, 024 and 025 nowhere.** Entry 021 is a report, not a request, so
it is correctly unacknowledged. `CLAUDE.md` protocol rules run 1 to 15 with no rule 16 and the
string PREMISE PROVENANCE does not occur in it. **All confirmed.**

---

## 2. THE SHAPE THIS PRODUCES

The session's shape depends on JOB 2's answer, which does not exist yet. So this plan is posted
in two parts, as the brief requires: everything sized now, and **the mechanism count reported
into this document before a single gate is written.**

| Job | Where | Estimate | Notes |
|---|---|---|---|
| Boot and premise recount | main loop | **0.35M** | spent |
| JOB 1 transcription | main loop | 0.55M | five rulings, four documents, plus the open-items audit |
| JOB 2 proof-mechanism survey | **agents** | 1.25M | 6 survey squads plus a 3-seat grouping verification |
| JOB 2 marshal | main loop | 0.30M | consolidation is deterministic, not an agent job |
| JOB 3 build gates in coverage order | main loop | 3.00M | **conditional, see 2.1** |
| JOB 3 gate verification | agents | 1.00M | adversarial read of each shipped gate |
| JOB 4 fix-down of the 118 | main loop | 1.00M | |
| JOB 4 re-derivation of the 27 unsound causes | agents | 0.50M | cause re-derived from source, never from the ledger |
| JOB 5 stale purge against the 341 | main loop | 0.80M | |
| JOB 6 close | main loop | 0.50M | |

| | Budgeted | Planned | Headroom |
|---|---|---|---|
| **Main loop** | 7.00M | **6.50M** | 0.50M |
| **Agents** | 5.00M | **2.75M** | 2.25M |
| Reserve | 1.50M | untouched | |

**VERDICT: FITS**, with one conditional named below rather than buried.

### 2.1 The conditional, stated as arithmetic rather than as a hope

`DOC_CURRENCY_GATE_SPEC.md` section 7 sizes a phase 1 checker plus its seeded self-test at
**0.4M of main loop**, and that estimate was borne out: the currency gate was built for roughly
that by one main loop with zero agents. It is the only measured cost of a seeded gate this
project holds, and JOB 6 is required to replace it with a better one.

At 0.4M per gate, **JOB 3's 3.0M buys about seven seeded, wired gates.**

- **If JOB 2 returns seven mechanisms or fewer: FITS**, everything is built.
- **If JOB 2 returns more than seven: DOES NOT FIT**, and the degradation order decides. Gates
  are built in coverage order, highest first, until the JOB 3 allocation is spent. Every
  requirement no built mechanism reaches gets an owner-parked tracker row naming why, which the
  brief states plainly is a complete answer and not a failure.

**The number that decides this does not exist yet.** That is the whole reason JOB 2 runs before
JOB 3, and this plan will be amended with the measured count in section 4 below before any gate
is written.

### 2.2 Where this plan deliberately underspends

**2.25M of the agent allowance is unallocated and that is intentional, not slack.** The brief is
explicit that this is a construction session and that construction is main-loop work: the
currency gate, five classes plus four predicates plus eighteen self-test cases, was built by one
main loop with zero agents. Spending the agent budget because it exists would be the error the
brief names. It is held for two contingencies:

1. **JOB 3's first runs.** Every gate this project has shipped produced false positives on its
   first run, and every one was a design flaw rather than an exception. Triage of a large first
   run is main-loop work, but an adversarial read of a gate's matcher is not.
2. **The negation-aware check** at JOB 5, if no stop line has been reached.

---

## 3. STOP LINES AND THE DEGRADATION ORDER, restated as this session will apply them

- **No new waves at 4.0M left.**
- **No new agents at 2.5M left.**
- **Close at 1.5M left.**

Degradation order, highest priority first, verification above fixes within every tier:

1. Transcription
2. The proof-mechanism survey
3. Gates in coverage order
4. The fix-down of the 118
5. The stale purge

**A gate without its seeded self-test does not ship.** If the seeds are not red at a stop line,
that gate is reverted rather than wired unproven.

---

## 4. THE MEASURED MECHANISM COUNT

*This section is filled by JOB 2 before JOB 3 begins. It is empty on posting, deliberately: a
plan that guessed the number would be pre-empting the survey that exists to measure it.*

---

## 5. DONE MEANS, restated as the end state this session will be graded against

- [ ] Fable's five rulings are in the record and in the protocol
- [ ] The unguarded requirements are grouped into a STATED number of proof mechanisms
- [ ] Every mechanism built is seeded and wired
- [ ] Every requirement not covered carries an owner-parked tracker row naming why
- [ ] The 118 upheld findings are dispositioned
- [ ] The stale baseline is smaller by the claims corrected
