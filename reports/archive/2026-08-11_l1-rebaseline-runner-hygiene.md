# Session Report - FABLE BRIEF L1: LOCAL RE-BASELINE, RUNNER HYGIENE, Q6, OWNER PREVIEW (2026-08-11)

Brief saved verbatim: `reports/briefs/FS_FABLE_L1_REBASELINE_Prompt.md` (commit
`a5154d94`). Run locally on the owner's Mac in the primary checkout, as the
brief orders. Model: Claude Fable 5. No locked path read for writing, none
written; `.claude/settings.json` untouched.

## PHASE 0, baseline parity: the line, and one STOP

Tree confirmed clean before anything was touched (two old stashes exist,
stashed not dirty, untouched). GitHub records PR #118's merge SHA as
`9ba934bd`; origin/main had advanced five commits to `267ba392`, and
`git diff 9ba934bd..267ba392 --stat` shows those five touch documents and
records only, so the baseline was taken at origin/main, estate-identical to
the merge SHA and the only base later pushes can build on.

**PARITY: 9ba934bd (baselined at 267ba392, five record-only commits past it,
docs-only by diff) | kit 77/12,330,182 vs closure 77/12,330,182, byte delta
ZERO because `build-info.json` excludes itself from its own counts, so the
commit stamp never reaches the tallied bytes | gates: every closure-named gate
reproduced PASS except ONE, the document currency scan, FAIL: STOP, reported
not fixed.**

The estate was reconstructed at CI-step granularity because no committed suite
runner exists: 99 sequential runs (69 static-job steps including npm ci and
the rebuild, the 16 browser matrix legs, 14 non-wired proofs named by the
closure register), 18 minutes wall-clock, driver and per-run logs in the
session scratchpad. Closure's 71 counts the same estate at register
granularity; the comparison that matters, every gate result, matched on all
but the one below.

**THE STOP, diagnosed not guessed.** `doc_currency_gate` now reports 2 new
DEAD_COMMIT findings: `a5b51567` at `CLAUDE.md:302` and
`docs/records/BRANCH_HYGIENE_2026-08-11.md:28`. Cause: the two owner-approved
branch deletions those documents record as PENDING have since been executed on
the remote (verified: `git ls-remote` shows neither branch), so the deleted
tip no longer resolves in any fresh clone. CI checks out at fetch-depth 0 and
sees the same absence, so EVERY push now reds the static leg until the two
lines are ruled on. The tension, stated per convention (n) rather than decided
quietly: the documents are dated records that deliberately keep the
resurrection SHA; the gate rejects an unresolvable SHA; the gate's own output
forbids the baseline route; and the fix is a CLAUDE.md edit, which convention
(t) keeps in review lane. Reported, not fixed, exactly as the brief orders.
Both reds this session carried their explanation in advance (PR #122's body
and the brief-save commit message).

Two environment notes, honestly: local Node is 24.14.1 against CI's 22
(gate results identical); `npm ci` ran plain where CI uses
`--ignore-scripts`, per the brief's own words. One driver error corrected in
place: the r041 stall banner proof was first invoked with `node` per its own
stale header and died at an extensionless TypeScript import; under `npx tsx`
it PASSES, exit 0. The header lied about the runner, which is precisely the
class PHASE 1 closes.

## PHASE 1, TR-123: four runners under one exit contract, three new CI legs

Delivered on `fix/tr123-proof-runner-exits`, PR #122, review lane, one
commit (`67d12fac`), explicit paths. What changed: explicit exit 0 on PASS
and non-zero on FAIL in all four; the three browser proofs spawn vite
DETACHED and kill it as a process group, because the npx wrapper's surviving
grandchild held each process open on its inherited pipes after the verdict
printed (the R043 closure observation, reproduced first-hand by PHASE 0,
where all three printed PASS and had to be reaped); runner documented as
`npx tsx` atop each and in the new `frontend/scripts/README.md` (ports, env,
measured durations, and the port-4541 concurrency note TR-123 asked for);
the stale checks.yml claim that popout stays out of CI on purpose superseded
as a dated record; three new browser legs wired.

**Convention (p), the deliberately failing invocations, verbatim from the
verification log (full log in the scratchpad, quoted lines exact):**

- kit_basis, planted superseded phrase in dist: `KIT BASIS GATE: FAIL, 1
  finding(s) over 8 kit files` then `exit=1`; seed removed, PASS, `exit=0`.
- popout, FS_SEED_VIOLATION=1: `caught  seeded off-viewport Continue turned
  the gate red` / `exited  the failing invocation exited non-zero (status 1)`.
- social_string, seeded Buy in the social cards: red, `FAIL social.no_Buy`
  named, status 1.
- social_dom, seeded "bet" from the app's own vocabulary table: red,
  `FAIL social.zeroProhibitedTerms` with the phrase in its printed hits,
  status 1.

Each browser proof's `--self-test` re-invokes the gate seeded in a child and
demands the red AND a real non-zero exit within a timeout, so the
lingering-handle class is machine-caught if it ever returns. Real runs after
the fix: all four PASS, exit 0, terminating in 4 to 61 seconds. Process
hygiene proven both directions: zero leaks across this session's ten server
launches, while four unowned vite servers from 2026-08-09/10 pre-fix runs
were found still alive on the owner's machine and reaped (pids 26676, 27169,
44636, 82563 with their node children; the owner preview on 5173 was
tracked, owned, and deliberately left alone).

**Rule 10, the honest state.** Run 31450235846 on PR #122: the three new
legs GREEN on real runners, `browser: popout conformance` 1m33s,
`browser: social DOM conformance` 2m11s, `browser: social string
conformance` 1m28s, terminating well inside the timeout; the static leg RED
on exactly the pre-existing document currency STOP (failed step verified by
the job's step list, nothing else red in it). The brief's "full CI matrix
green" is therefore BLOCKED by the PHASE 0 STOP and by it alone; the two
lines it names are the whole distance to green.

## PHASE 2, Q6: SKIPPED, OWNER-GATED

No session-bearing launch URL (sessionID= and rgs_url=) was pasted this
session. `tools/capture_rgs_400.sh` stays armed; OWNER_RULINGS section C
stays OPEN, OWNER-GATED, unchanged. The ask remains one paste of the game
url from the owner's logged-in browser.

## PHASE 3, owner preview: served and verified

Run before this report per rule 12, quoted: `OWNER PREVIEW  |  v10 line,
main  |  commit a5154d94  |  built 2026-08-11T11:45:39+10:00  |  started
2026-08-11T01:45:58.691Z  |  http://192.168.4.95:5173/`. The address was
curled, not trusted: HTTP 200, `<title>Future Spinner</title>`. The previous
tracked instance (pid 59250) was stopped by the script's own pidfile
mechanism. Serving continues until the owner ends the session; refreshed
once more as the last action of the close, after the final push, per the
one-commit-lag design. **Owner reminder, per the brief: German locale, the
rules screen, and two minutes of play for the mix.**

## DONE MEANS, accounted

- Parity line printed and TRUE, carrying its one STOP: yes.
- Four runners exit correctly with seeded proof: yes, shown above.
- CI green including the newly wired legs: the three new legs green
  individually; full green BLOCKED by the pre-existing STOP, reported.
- Capture committed or SKIPPED OWNER-GATED recorded: SKIPPED, OWNER-GATED.
- Preview served: yes, curl-verified.
- Tree clean: verified at close.

## FOR THE NEXT SESSION (convention i)

Model Claude Fable 5, default effort. Approach: estate reconstructed from
checks.yml plus the closure register rather than trusting any summary;
Phase 1 shipped as one review-lane PR; records direct to main under (t.1).
Alternatives rejected: editing the two DEAD_COMMIT lines (forbidden by the
brief's STOP clause and review lane); an in-process self-test for the three
proofs (would prove detection but not the exit contract, and the exit
contract is what TR-123 is about). Files touched: the four runners,
checks.yml, frontend/scripts/README.md (PR #122); this report, its archive,
FABLE_COMMS, REVIEW_TRACKER TR-123 row, the verbatim brief (records, main).
Open threads: **external audit refresh is next per the brief**; the
two-line document currency ruling (unblocks every future green); PR #122
awaiting Fable verification; Q6 still owner-gated; B14 still with the owner.
