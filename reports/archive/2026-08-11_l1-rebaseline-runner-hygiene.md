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

## R044 ADDENDUM, 2026-08-11: the STOP resolved, PR #122 merged, and Q6 settled the same hour

FABLE RULING BLOCK R044 arrived as an owner paste (review-lane authorisation),
saved verbatim at `reports/briefs/FS_FABLE_RULING_R044_Prompt.md`, and its
trailing paste carried the portal address that unlocked Q6.

**Items 1 and 2.** The two record notes appended exactly as ruled. The
DEAD_COMMIT check gained the second-chance resolver, and its mechanism was
MEASURED before it was written: `git fetch origin <sha>` is refused by GitHub
on BOTH transports today, even for a SHA that is a pull-head tip ("couldn't
find remote ref", https and ssh alike), so the targeted fetch is attempted
first per the ruling's letter and the rescue that actually works is a
once-per-run fetch of the pull-heads namespace into `refs/prefetch/pull/*`,
verified in a fresh anonymous https clone before shipping (one fetch, and
a5b51567 resolves). Convention (p), both sides, quoted from the self-test:

    caught  SEED 4   a commit SHA that does not resolve (no origin to rescue from)
    caught  SEED 4b  a SHA held only by the origin pull ref is RESCUED, not reported
    caught  SEED 4c  a fabricated SHA still fails through both fetch attempts

Self-test 28 of 28. The rescued case builds a REAL second repository playing
GitHub, its commit held only by `refs/pull/1/head`.

**Item 3, and one ordering call surfaced per convention (n).** The item 1-2
commit rode the PR #122 branch rather than a separate main push, because the
gate, once fixed, correctly flags the OTHER half of the situation: two record
documents already on main (`REVIEW_TRACKER.md:372`, `FABLE_COMMS.md:32`) cite
`frontend/scripts/README.md`, which existed only on the PR branch, so a
separate item-3 push could not have been green in ANY order, and the ruling's
stated goal is full green estate-wide. A correction to this session's own
record follows from the same finding: COMMS 049 attributed the 4a55eaf5 red
to the a5b51567 STOP alone, and the full finding set on that push also
carried these two README DEAD_DOCREFs, self-inflicted by the record commits
describing the PR's README before the PR merged. Stated here so the record
is exact.

**Item 4.** PR #122 round 2: 21 of 21 checks green, including the repaired
static leg (the resolver exercised in CI's own anonymous clone) and the three
newly wired browser legs. Merged by rebase; the session branch deleted on the
remote and locally, verified by `git ls-remote` count zero; TR-123 CLOSED on
the merge. Main took `86681bfd` (TR-123) and `76776601` (R044 items 1-2),
then `659a9229` (Q6, below) rebased on top and pushed.

**Q6, SETTLED.** The pasted portal address, opened in the browser, minted the
session-bearing game url (sessionID and rgs_url present; the launch=true
parameters auto-opened the play modal and the game iframe carried the full
url). `tools/capture_rgs_400.sh` ran against it: authenticate invalid 400,
authenticate real 200 (the control), play invalid 400, raw bodies committed
under `docs/stake-engine-live/captures/`, the three dated
2026-08-11 files, with the real session id redacted. **The answer: both 400 bodies are
`{"error":"ERR_VAL","message":"could not parse request json"}`. The
identifier field is top-level `error`; `handleRGSError` reads top-level
`code`; the VALUE vocabulary matches the known-codes table and the FIELD does
not, so on a real platform error the mapping never fires and the player gets
the generic branch.** OWNER_RULINGS section C is RESOLVED with the one-line
fix named and not made (locked file, no sanction; escalated per convention
l.8, LOCKED_FILE_DEBTS row queued for the next sanctioned CLAUDE.md pass).
The capture script now stamps the real capture date, convention (s) caught on
the instrument's first live run.

**Rule 10, including one red this session caused and caught.** PR run 21/21
green (recorded above); the merge push's own run was superseded seconds later
under cancel-in-progress, the documented deliberate trade. The Q6 push
(`659a9229`) then went RED on the static leg, and the cause was THIS
SESSION'S OWN SHORTHAND: OWNER_RULINGS cited the three capture files as
"`..._400_1.json` to `_3.json`", and the backticked `_3.json` is a path
claim naming no file, exactly the DEAD_PATH class the gate polices. Caught
by running the gate locally over the close-state tree before the close
commit; the wording is corrected here and in COMMS 050 (which carried the
sibling `1..3.json` form, never pushed), the close push carries the fix, and
its green run is recorded in the final close line. The gate judging its own
author's records within the hour of gaining the resolver is the system
working, and it is recorded as such rather than smoothed over.

**Environment note.** The Claude in Chrome extension was not connected, so
the portal was opened in the app's browser pane, which carried the portal
session; recorded so the next session knows both paths.
