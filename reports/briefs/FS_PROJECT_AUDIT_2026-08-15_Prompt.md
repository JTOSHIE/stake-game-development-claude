# Work order: stand-back project audit, 2026-08-15

Invoked as `/project-audit`. Not a pasted owner brief. This file is the work
order the session is executing, written before the first expensive spend.

Australian English, no em dashes or en dashes.

```
BUDGET:   agent cap 48 for the discovery plus verify container.
          Main loop does spot-verify, fix, report. Reserve 16 agent slots.

SCALE:    8 discovery lenses (analyst class), 1 marshal, up to 16 cluster
          verifiers. Per docs/skills/AGENT_BUDGET_AND_SCHEDULING.md section 5.

TOOLS:    workflow container, read-only explore agents, grep/read of the
          repository, the gate family as TEXT only. No Playwright capture in
          this pass. No project script that writes.

STOP LINES: no new discovery after the first wave. No new agents once
          verification of the first 16 clusters is in flight. Close after
          dispositions are written.

DEGRADATION ORDER: if short, deliver in this order: the 8 lens findings
          with dispositions, then cluster verification, then unlocked
          small fixes. Anything below fixes is PARKED with resume state.

DONE MEANS: every finding from this pass has a disposition (FIXED, PARKED
          with reason, or REVIEWED AND KEPT), the surfaces not swept are
          named, and a session report exists at reports/SESSION_REPORT.md.
```

## READ FIRST

- `CLAUDE.md` locked paths, standing mandate, conventions (a)(k)(l)(p)(q)(r)(t)
- `docs/skills/FULL_AUDIT_METHOD.md` the two-layer method and waves 2 to 5
- `docs/skills/AGENT_BUDGET_AND_SCHEDULING.md` cost equations
- `docs/QUALITY_CHARTER.md` section 5.3 (what the 2026-07-27 sweep did not cover)
- `docs/records/reviews/REVIEW_TRACKER.md` current OPEN rows
- `reports/audit/AUDIT_CLOSURE_2026-08-10.md` last full-estate close
- `reports/qa/stream_test/KNOWN_OPEN.md` dated stream-test register

**Artefacts this brief expects to EXIST and their exact paths:**

- `reports/qa/standback-2026-08-15/LEDGER.md` (create)
- `reports/qa/standback-2026-08-15/PLAN.md` (create)
- `.grok/workflows/project-audit.rhai` (create)

## PREMISES

| Premise | Status | How the session should check it |
|---|---|---|
| Wave 1 machine-tell sweep is complete and gated | **VERIFIED**, 2026-08-15, by direct read of `docs/QUALITY_CHARTER.md` section 5 and `docs/skills/FULL_AUDIT_METHOD.md` section 5 | already checked |
| Waves 2 to 5 (audio, social capture, a11y, animation quality) have never been run as quality sweeps | **VERIFIED**, 2026-08-15, same two documents section 5 / 5.3 | already checked |
| `reports/SESSION_REPORT.md` still opens as the 2026-07-25 platform-delta session | **VERIFIED**, 2026-08-15, `head -1 reports/SESSION_REPORT.md` | document-drift lens must treat this as a question to confirm, not as a new rule |
| Tracker still carries OPEN cells | **VERIFIED**, 2026-08-15, `grep -c '\| \*\*OPEN'` returned 20 | disposition lens recounts each |
| Maths package is locked and out of scope | **VERIFIED**, `CLAUDE.md` locked files and FULL_AUDIT_METHOD section 5 | do not edit |
| Another worktree exists at `.claude/worktrees/trusting-colden-055579` on `claude/trusting-colden-055579` | **VERIFIED**, `git worktree list` 2026-08-15 | do not touch that tree |
| Primary checkout is `main` at `90f21280`, clean | **VERIFIED**, `git status --porcelain` empty | stay on main for read-only discovery |

## THE JOBS

### JOB 1: discovery fan-out, eight lenses

- **Deliverable**: structured findings from the workflow, written to the ledger
- **Agents**: 8 x analyst, read-only, workflow container
- **Expected cost**: 8 x 99k
- **Depends on**: nothing
- **If short**: drop harness last

### JOB 2: cluster and adversarially verify

- **Deliverable**: verdict per cluster in the ledger
- **Agents**: 1 marshal + up to 16 verifiers, told to REFUTE
- **Expected cost**: 1.2M
- **Depends on**: JOB 1
- **If short**: verify the first 12 raw findings and log the drop

### JOB 3: dispositions and unlocked smalls

- **Deliverable**: ledger dispositions; unlocked small fixes in the main loop
- **Agents**: NONE
- **Depends on**: JOB 2
- **If short**: dispositions only, no fixes

### JOB 4: session report

- **Deliverable**: `reports/SESSION_REPORT.md` plus dated archive
- **Agents**: NONE
- **Depends on**: JOB 3

## PLAN OF RECORD

```
PLAN OF RECORD
  budget seen        : agent cap 48, fresh session
  waves planned      : 1 x 8 discovery, 1 marshal, <=16 cluster verifiers
  discovery cost     : 8 x 99k = 0.79M
  expected findings  : 8 x 6 = 48 max
  verification cost  : 16 x 70k = 1.12M
  fixes and re-proof : main loop, unlocked smalls only
  main loop          : plan, spot-verify, fix, report
  TOTAL              : ~2.0M agent plus main loop
  VERDICT            : FITS
```

## SURFACES THIS PASS DOES NOT SWEEP

Named so silence is not coverage.

- Audio quality (loudness, tails, bed swap, generic-AI tell)
- Social-mode capture of the full vocabulary swap
- Accessibility beyond the existing prohibited-terms gate (focus order, keyboard, screen reader)
- Animation quality and timing (as distinct from frame rate)
- Cross-surface capitalisation and button casing in the rendered DOM
- The locked maths package `games/future_spinner/**`
- Any edit of locked files `rgsService.ts`, `gameStore.ts`, `.claude/settings.json`
