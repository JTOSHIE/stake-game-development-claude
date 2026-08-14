# Analysis only pass, 2026-08-15

Archive copy of the addendum in `reports/SESSION_REPORT.md`, per convention (a).
Nothing is edited between the two.

## ANALYSIS ONLY PASS ADDENDUM, 2026-08-15: the money census, the open register, and two urgent items

Brief saved verbatim at `reports/briefs/FS_ANALYSIS_ONLY_2026-08-15_Prompt.md`.
Branch `analysis/2026-08-15`, cut from `main` at `90f21280`. **This pass wrote no
code, no gate and no tracker status cell.** All six jobs ran; nothing was cut, so
the degradation order was not reached.

Findings in full at `reports/qa/analysis-2026-08-15/FINDINGS.md`, the census at
`reports/qa/analysis-2026-08-15/MONEY_SURFACE_CENSUS.md`, the register at
`reports/qa/analysis-2026-08-15/OPEN_REGISTER.md`.

### Rule 11, and why this pass ran in a worktree

**The primary checkout at the repository root was on `track/standback-2026-08-15`
at `59c4c88e`, not on `main`.** Clean, and its tip equals the remote, so nothing
was at risk. Rule 11 says a session that finds the primary checkout on an
unexpected branch touches nothing and reports it, so this pass created
`worktrees/analysis-2026-08-15` off `main` and worked there. Recorded because the
brief asked for a fresh branch off `main` and the obvious reading, checking one
out at the root, is the one rule 11 forbids.

### The two urgent items, recorded and NOT actioned

**PR #123 replaces `reports/SESSION_REPORT.md` rather than appending to it**:
13,630 lines at `90f21280`, 109 at `59c4c88e`, a diffstat of 81 insertions and
13,602 deletions on that one file. JOB 3c then proved by content sweep, not by
filename, that the archive does not hold at least two of the addenda that would
go: both named headings return zero matching lines across all 244 files under
`reports/archive/`, and each addendum's archive sibling is a byte-exact copy that
stops on the line immediately before the heading. So the archive copies are
truncated as a class: an addendum appended after its archive copy was taken was
never carried across. 50 line citations point into that file and every one cites a
line above 109.

**And that commit's remote CI is RED.** Run 31815432853, the only run on
`59c4c88e`, failed twice: `static gates` at the locked-paths-and-track-scope step,
because a `track/` branch declares a track and no manifest exists for it, which
aborted the static job before the document currency scan could measure the citation
damage; and `browser: max-win hold` on the one assertion that the SPIN control is
disabled by state, which is plausibly a consequence of the PR's own `canSpin` to
`canAffordSpin` change and was deliberately not diagnosed further.

**A third item, about this project's own newest row.** TR-148 item 4, opened by
R070 yesterday, cites
`games/future_spinner/library/configs/config.json`. That path is gitignored twice
over and untracked, so the measurement is real but not reproducible from the
repository, which is what convention (m) forbids. The document currency gate
cannot catch it: it reports references into gitignored trees without judging them.
Not retracted, not edited, handed to a remediation pass.

### JOB 1 and JOB 2, the money surfaces

**Seven currency surfaces can render a value they cannot express**, of which the
PR fixes two. **Fable's count of five cost sites with two fixed is CONFIRMED** for
the cost-quote family, and the census adds two surfaces outside that frame, the
session ledger's TOTAL WAGERED and the replay view's TOTAL SPENT, plus the
autoplay LOSS LIMIT input, which reaches the DOM with no formatter on either side.

The mechanism is one line wide: `formatBalance` renders at the currency's own
precision, `formatWin` widens to the real precision, and every risk row is a stake
rendered through the first. **Exactly one mode makes a stake fractional**: antelite
at 1.25x. On the platform ladder four rungs do it (0.01, 0.02, 0.05, 0.10); on the
hardcoded ladder two do (0.10, 0.50), so the real ladder doubles the exposure.

**The premise above the Total Won row is falsified.** It says stakes are "bet
ladder values, whole currency units by construction". The row renders accumulated
`spinCostMicros`, so one antelite spin at the 0.10 rung adds 125,000 micros and
renders $0.13. Neither clause holds. The comment and the formatter were left
exactly as found.

**The sub-cent gate drives three surfaces**, the HUD win, the HUD balance and the
session sheet, in two currency legs. **Its own header claims a fourth**, the win
panel at a `WinDisplay.svelte` line that no longer carries that testid, and there
is no assertion against that component anywhere in the file.

### JOB 3b, the stray worktree

`.claude/worktrees/trusting-colden-055579` is on `claude/trusting-colden-055579`
at `65e4db45`, holds **zero commits not already on `origin/main`**, and is DIRTY:
`.github/workflows/checks.yml` and `scripts/owner_preview.mjs`, 349 insertions.
The script half is superseded, `main` carries a further developed version. **The
`checks.yml` hunk is not superseded and is not on `main`**: it wires
`owner_preview.mjs --self-test` into CI, and `main` has that self-test and never
runs it. Run locally here it passes 7 of 7 with 3 seeds and 4 paired controls.
Recommended disposition, for a remediation pass rather than this one: lift that
hunk into its own review-lane change, then remove the worktree and the branch.
**Nothing was deleted or modified.**

### JOB 4, the bet ladder

`BET_LEVELS` invents one level the platform does not list, 0.50, and omits 23 that
it does, including all three sub-ten-cent rungs. **The platform minimum 0.01 is not
in the fallback ladder**, whose minimum is ten times it. When authenticate omits
`betLevels`, `betLadder.ts` falls back to `BET_LEVELS` filtered to any supplied
minBet and maxBet envelope, and returns the unfiltered ladder rather than an empty
one if the envelope excludes everything. The filter is a comparison, so it cannot
catch an invented rung sitting inside the envelope, and the module's own comment
records that snapping to `stepBet` was deliberately left undone.

### JOB 5, the operating frame

39 clauses of `CLAUDE_PROJECT_INSTRUCTIONS_v7.md` read against HEAD. **Eight
misstate the repository**: Fable's two confirmed, six more found. The two
confirmed are exact: the LOCKED_FILE_DEBTS parenthesis names a canSpin debt that
`CLAUDE.md` does not record at all (`grep -c canSpin` returns 0) and calls it
unreachable when `App.svelte:1916` spins on it; and the money clause says
`Math.floor` where 36 of 37 conversions in `frontend/src` use `Math.round`, the
single floor being inside the locked `rgsService.ts`. **Which rounding is correct
is a money-path question and is not ruled here.**

### JOB 6, the consolidated register

**109 items, 68 whose recorded status does not match HEAD.** The dominant pattern
is work that landed and a row that never learned, including two rows that
contradict themselves inside their own cells. The stand-back ledger is the
exception and the register says so: it lives only on the unmerged branch and its
rows describe that branch, so they are pending rather than wrong.

### Verification and provenance

`node scripts/qa/locked_paths_gate.mjs` on this branch: **PASS**, "1 commit(s),
0 sanctioned, 0 violation(s)", with "branch analysis/2026-08-15 is not a track
branch, scope check not applicable". **No sanction token is present or needed:**
this pass touched no locked path. The document currency gate was run over the
close-state tree before the push.

**Remote CI, per rule 10: GREEN.** Run 31833605139 on `7d539f34`: "what changed"
success, "static gates" success, browser matrix correctly skipped on the
documents-only path. **A push to this branch alone produced NO run**, because
`checks.yml` triggers on `pull_request` and on pushes to `main` only, so PR #124
was opened to produce the run the brief asks to record. It is analysis output in
a record-only diff; the owner merges or closes it.

The document currency gate caught **33 dead citations in this pass's own three
documents** on its first run and none of them was a defect in the repository: a
backticked `track/` prefix, two symbol-and-file pairs where the symbol lives in a
different file, and thirty citations into the stand-back ledger and a deleted
component, both of which this pass names precisely BECAUSE they do not exist at
HEAD. All thirty-three were repaired by writing them the way the project's own
spec prescribes for a thing that is absent, unbackticked and without a line
number, rather than by adding a baseline entry. The gate then read 0 new.

Breadth was produced by a seven-agent read-only fan-out per rule 4, then curated.
Every census row was re-opened and its line re-read before publication, ten by
printing the exact source line. Six of the 68 register mismatches were re-verified
first hand and all six confirmed; **the other 62 are REPORTED at rule 16's
standard, not VERIFIED**, and each names where to look.

## FOR THE NEXT SESSION

Model and effort: Claude Fable 5, judgement tier, one session, read only, in a
worktree off `main`. Approach: verify the premises before using them, walk the
components before grepping them, and re-open every agent-surfaced claim before
publishing it. Alternatives rejected: checking a fresh branch out at the
repository root (rule 11 forbids it while another session's branch sits there);
running the money gates to see the defects render (this pass writes nothing and
drives nothing); and reporting the ledger's rows as errors (they describe the PR
branch, and the honest framing is pending-in-a-red-PR).

**What a remediation pass must decide FIRST, in this order:**

1. **What happens to `reports/SESSION_REPORT.md` in PR #123.** Nothing else in that
   PR can merge until this is settled, and the answer is not obvious: append the
   stand-back report and restore the history, or split the history into per-arc
   archive files first and then truncate deliberately. Either way the archive
   truncation class is repaired before, not after.
2. **Whether `track/standback-2026-08-15` gets a manifest or a rename.** A manifest
   at `docs/records/tracks/standback-2026-08-15.manifest` satisfies the gate as
   written; renaming the branch off the `track/` prefix sidesteps it. The first is
   the protocol's intent.
3. **Whether `browser: max-win hold` is red because of the PR or because of `main`.**
   Run it against both trees before touching either.
4. **`Math.round` against `Math.floor` for dollars to micros.** Both instruction
   documents say floor, the code rounds in 36 of 37 places, and every fractional
   stake in the census passes through that choice. This is a money-path ruling and
   the builder does not make it.
5. **Whether the five unfixed money surfaces are one change or five.** They share
   one mechanism, `formatBalance` where `formatWin` belongs, and two of them also
   carry a duplicated cost expression that `spinCostMicros` exists to prevent.
6. **Whether TR-148 item 4 is re-worded, evidenced by committing the file, or
   retracted.**

Then, and only then, the fifty-one walk, the one-timers and Start Approval on the
owner's word.
