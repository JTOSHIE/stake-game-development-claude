## 2026-07-26h: CI TRIAGE, integrator session

Brief saved verbatim: `reports/briefs/FS_CI_TRIAGE_Prompt.md`, committed with
JOB 1. **This session held the INTEGRATOR role and ran on `main`.** No lock
exception; no locked path touched. Explicit paths on every commit. No em or en
dash written anywhere in this session's text.

### JOB 1: main is green again, in two acts

**Act one, the missing browser.** Root cause confirmed against the remote runs
before touching anything: `layout_fit_gate.mjs` and `contrast_gate.mjs` import
chromium and had been added to the deliberately browser-free static job, so
every push to `main` since they landed crashed at `chromium.launch()`. Runs
117, 118, 119 and 120 all failed at the same step, "layout fit gate, seven
presets", verified via `gh run view` on each. Fix per Fable's ruling:
`checks.yml` now has two jobs. "static gates" is unchanged minus the two
browser gates; the new blocking "browser gates" job installs the chromium
binary (`npx playwright install chromium --with-deps`) after `npm ci`, builds
dist (both gates serve it via `vite preview`), and runs gates 13c and 13d.
Same security posture: no secrets, `contents: read` only. Commit `5ef7783`.

**Act two, the hang after PASS (run 122, Fable's mid-session direction).**
Run 122's static job went green in place of four red predecessors, but the
browser gates job ran 18 minutes on what is a 2-minute job and was cancelled
on Fable's order. The step log is the diagnosis, and it rules OUT the WebGL
hypothesis: the layout gate measured all seven presets and printed
`LAYOUT FIT GATE: PASS` at 04:53:17, thirteen seconds after starting, and the
next line is the cancellation at 05:11:54. The gate did not stop after
chromium.launch, at page.goto or at a waitFor; it stopped at PROCESS EXIT.
Cause: `preview.kill()` signals only the `npx` wrapper, orphaning the real
vite preview child, whose inherited stdout pipe holds the node event loop
open, and the layout gate had no `process.exit` on success. The readiness
sentinel needed no change because readiness was never the problem; a black
canvas was indeed acceptable to both gates, which completed all their
measurements headless.

Repairs, commit `9c7a9a2`: `timeout-minutes: 10` on the browser gates job; a
4-minute hard watchdog inside both gates that fails red on any hang; explicit
`process.exit(0)` on success in both; and the preview now runs detached so
teardown signals the whole process group, reaching vite itself. Verified
locally before pushing: both gates PASS, exit promptly, and `pgrep` finds no
orphaned vite.

**Remote verification per rule 10: run 123 GREEN, BOTH JOBS.**
Run 123: https://github.com/JTOSHIE/stake-game-development-claude/actions/runs/30189093830 (static gates green; browser gates green, layout and contrast gates passing under the new watchdogs, job runtime back to minutes).

Runs 117 to 120 are CONFIRMED SUPERSEDED rather than re-run: a re-run replays
the workflow file as it stood at those commits, which is the broken
single-job file, so it can only fail again. Run 122 is recorded as cancelled
on Fable's order, static job green, browser job hung as diagnosed above.

### JOB 2: rule 10 in the protocol

Appended to THE MULTI-TRACK PROTOCOL in `CLAUDE.md` and mirrored in
`WRS_MASTER_DOCUMENT.md` section 3e: **(10) a red run on main stops the line.**
No new job starts until main is green; every session verifies its own final
push's remote CI result before closing and records the run link in its session
report; local gate results never substitute for the remote run. The corrected
account of runs 117 to 121 is recorded beside the rule: four consecutive
sessions pushed onto a red main because the same gates passed locally, and run
121 on the track/screenshot-analyst pull request failed the disjointness gate
(SA-013), a collision that track's manifest declared rather than hid.

### JOB 3: the analyst is unblocked (SA-013)

`docs/records/tracks/quality-sweep.manifest` narrowed `reports/qa/**` to
`reports/qa/*`. The glob language has no negation; `*` matches one segment, and
every file the sweep's gates write lands directly in `reports/qa/` (the
directory is flat, 50 files, zero subdirectories, verified), so the narrowing
costs quality-sweep nothing while releasing every subtree, `live_stats`
included, to the analyst's duty 6.

Disjointness re-proved twice: on main's two manifests, and again with
track/screenshot-analyst's manifest temporarily present, which is the pair
that actually collided:

```
DISJOINT: 3 manifest(s), 2495 tracked file(s), 0 file collision(s), 0 shared glob(s)
  docs-reskin: 8 glob(s)
  quality-sweep: 8 glob(s)
  screenshot-analyst: 8 glob(s)
```

**PR #115 is NOT merged**, per the brief: Fable verifies it first-hand next
check-in and rules on merge then.

### JOB 4: the modified evidence (SA-012)

The four uncommitted changed files under
`reports/screens/scatter-anticipation/` (trigger_3.png, trigger_4.png,
trigger_5-reduced.png, trigger_5.png, all mtime 01:11:23 on 2026-07-26) were
restored from HEAD with `git checkout --`; the directory is clean. Cause
identified: `frontend/scripts/anticipation_proof.mjs` line 19 points its
screenshot output at the committed evidence directory itself, so any re-run
rewrites committed evidence in place. The rule is recorded beside convention
(h) in `CLAUDE.md` as (h.1): proof and gate scripts write to scratch paths
only; committed evidence directories are never written outside a job that
explicitly regenerates evidence.

The pattern was then observed LIVE twice more in this very session: the local
verification runs of `layout_fit_gate.mjs` and `contrast_gate.mjs` rewrote
their committed reports/qa JSON and the contrast-2026-07-26 screenshots, which
were also restored from HEAD. Migrating the gate writers to scratch paths is
recorded in (h.1) as open work.

Also present in the working tree, left exactly as found because they belong to
other work and this brief does not touch them: an uncommitted one-line
docstring edit to `scripts/assets/backgrounds.py`, and untracked
`games/future_spinner_super/`, `sideproject/`, and
`reports/screens/cohesion-pass/char-enhanced-closeup.png`.

### FOR THE NEXT SESSION

Model and effort: Fable 5, integrator session. Five jobs in one session,
justified because four of the five are the same incident (the red main) and
splitting them would have left main red longer. Approach taken: verify the
remote failure first, fix, verify remote again; when run 122 hung, the step
log was read before any hypothesis was coded, which is what kept the WebGL
rework out of two measurement scripts whose committed evidence is cited
elsewhere. Alternatives rejected: re-running runs 117 to 120 (replays the
broken workflow file); the WebGL software-rendering args and DOM sentinel
rewrite (diagnosis showed the gates complete and pass headless as they are).
Files touched: `.github/workflows/checks.yml`,
`frontend/scripts/layout_fit_gate.mjs`, `frontend/scripts/contrast_gate.mjs`,
`CLAUDE.md`, `WRS_MASTER_DOCUMENT.md`,
`docs/records/tracks/quality-sweep.manifest`,
`reports/briefs/FS_CI_TRIAGE_Prompt.md`, this report and its archive copy.

Open threads:
- Fable verifies PR #115 first-hand and the green CI, and rules on merge.
- The owner's second visit gains one line: twenty cruise spins with a before
  and after balance frame for the analyst.
- The two prepared track briefs (`docs/records/tracks/docs-reskin_BRIEF.md`,
  `docs/records/tracks/quality-sweep_BRIEF.md`) remain ready to paste.
- The polish review follows the owner's visit.
- (h.1) open work: move the three gate writers' evidence output to scratch
  paths so a re-run can never dirty committed evidence.
- Remote CI link for this session's final push, per rule 10:
  filled by the closing commit after the remote run for this session's final push is verified green.
