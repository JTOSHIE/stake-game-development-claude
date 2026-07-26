
## 2026-07-26i: RULE 11, PR #115 MERGED, AND THE (h.1) MIGRATION COMPLETED

Brief saved verbatim: `reports/briefs/FS_RULE11_MERGE115_Prompt.md`. INTEGRATOR
session, on `main`. Five jobs, which is more than rule 4's default of one, so it
justifies itself here as rule 4 requires: JOBS 1, 3 and 5 are independent
mechanical edits with no shared reasoning, and JOB 2 is a merge that cannot start
until its own CI is green. The judgement in the session is concentrated in one
place, the gate defect found under JOB 2, and it got a fresh head rather than the
tail end of a long run.

No lock exception taken and none needed. Explicit paths at every commit. Zero em
or en dashes across every file written.

### JOB 1: rule 11, a working tree per session

Appended to THE MULTI-TRACK PROTOCOL in `CLAUDE.md` and mirrored in
`WRS_MASTER_DOCUMENT.md`. Concurrent sessions never share a working tree: every
track session creates its own git worktree at `worktrees/<track>/` at boot and
removes it at close, the path is gitignored so a worktree can never be committed
or reach a build, the primary checkout belongs to the integrator alone, and a
session finding the primary checkout on an unexpected branch touches nothing and
reports it.

The near-miss that earned it is recorded beside the rule, because it is the
argument. `track/screenshot-analyst` returned for a second intake and found the
primary checkout switched to `main` by the CI triage session with uncommitted
work in progress on three files. Checking out its own branch there would have
pulled the checkout from under a live writer. That track used a worktree
unprompted and reported the gap. **Rule 1 made `main` single-writer for the
BRANCH and never covered the working tree**, which is a shared mutable resource
it does not protect.

**Recorded, not tidied away: there is no rule 9**, in either document. Rule 10
came from the CI triage session and 11 from this one, and neither found a 9 to
follow. It is left as a gap rather than renumbered, because 10 and 11 are already
cited by number in session reports, tracker rows and commit messages, and
shifting them would make those citations wrong. The owner's call whether to fill
it.

### JOB 2: the merge, and the gate defect that had to be fixed first

**PR #115 was red, and rule 10 says a red run stops the line.** It failed TRACK
SCOPE on `reports/SESSION_REPORT.md` and `reports/archive/2026-07-26h_ci-triage.md`,
two files that track had never touched. Both exist only on `main`, added by
`e67ea04`. So the gate was wrong, not the track, and merging around it was not
available.

**The defect.** Actions checks out a pull request's MERGE ref: the head branch
with the base branch as it is NOW merged in. `GITHUB_SHA` is that merge commit.
`github.event.pull_request.base.sha` is the base branch as it WAS when the event
fired. Once `main` moves after the event, `base.sha..merge-ref` contains main's
own newer commits and the gate attributes them to the track.

**The half-fix that looks right and is not.** Taking the merge base of `base.sha`
and the merge ref does nothing at all: `base.sha` is always an ancestor of the
merge ref, and the merge base of a commit and its own ancestor is that ancestor.
This was written first, the seeded self-test case stayed red, and it is kept as a
permanent test case because it is convincing and wrong. **A fix that stopped
there would have shipped the bug with a green gate over it**, which is the exact
shape convention (p) exists to catch, and this is the first time in this project
that the seeded test caught the fix rather than the defect.

**The fix.** Range against the head BRANCH tip, `pull_request.head.sha`, which
does not carry the base branch's later commits. The merge base is still taken for
the case where `base.sha` is not an ancestor of the head branch.
`GITHUB_HEAD_SHA` is now passed in `checks.yml`.

**Why it matters beyond one red run.** A false TRACK SCOPE failure blocks a
correct pull request, and the temptation it creates is to widen the manifest to
make the gate green, which would silently break rule 3's disjointness for a
defect that was never in the track. The same mis-ranging feeds `commitsIn`, so a
locked-path commit belonging to main could be judged as if it belonged to the
pull request.

Per convention (p) the self-test plants all three forms in a real git repository
with a real base branch that advances after the branch point and a real merge
commit: the defect fails, the half-fix fails, the fix passes, and a genuine
out-of-scope change still fails so the gate is not merely blunted.

**Then the merge.** `main` merged into the track branch through a worktree, per
the rule written an hour earlier; CI re-run green on both jobs
(`https://github.com/JTOSHIE/stake-game-development-claude/actions/runs/30189878160`);
PR #115 merged **un-squashed** at 05:54:36Z as `bdc6771`. Seven commits of
distinct evidence work, and a squash would have flattened the reasoning into one
line.

**Promotion.** Three rows added to `docs/records/reviews/REVIEW_TRACKER.md` from
the track's ledger, with the SA numbers kept so the two records stay traceable:

- **TR-073**, the 5,000x max win fired live and the celebration overlay it should
  present has never been captured. **PARKED as an evidence gap, not as a
  suspected defect.** The specification says it should have shown and the wincap
  flag is computed against the bet level, which the round cleared exactly, so the
  expected reading is that it fired and was collected in the twelve seconds
  before the capture. That is inference, and a submission claim about the max-win
  presentation should not rest on it. Worth flagging that this overlaps TR-072,
  which translated `maxWinReached` and `collect` across sixteen locales without
  anyone having seen the surface those strings render on.
- **TR-074**, the scene shows through unfilled reel cells mid-spin while the idle
  board is opaque. An observation, explicitly not a defect finding.
- **TR-075**, `cruise` is the one mode whose wallet debit has never been
  measured, confirmed at display level by inference from two other results.

**TR-013 gains a closure note rather than a new row**, per the tracker's own
rule. The bet levels observed live are 450, 500, 750 and 1,000, none of which the
hardcoded fallback array can express since it tops out at 100. A ladder that
array cannot express is driving the game, which is only possible if both
bet-changing surfaces read `rgsBetLevels` through the non-locked `betLadder.ts`,
as the fix intended. Recorded because **a fix confirmed only by its own test is a
fix confirmed by its author.**

Twelve of the ledger's sixteen rows are deliberately not promoted: nine are
NOT-A-DEFECT answers to closed questions, two were process rows already resolved
by the CI triage session, one concerns another directory entirely.

### JOB 3: two observations for the owner

`docs/records/upload-kit/00_READ_ME_FIRST.md` Part 9b goes from five observations
to seven, written in the walkthrough's own voice.

**Observation 6** has the owner open the `EUR 3,750,000.00` round on the Bets
panel and press **Replay this bet**, watching for the three-star MAX WIN overlay
with its 5,000x and COLLECT button, and screenshotting it BEFORE pressing
COLLECT. It says explicitly that no celebration appearing is the more important
answer, so the owner is not primed to report what we expect.

**Observation 7** brackets twenty `cruise` spins with a Session information
screenshot before AND after. The instruction leads with the before, because the
before is the one that gets skipped and its absence is exactly why TR-075 is
still open.

### JOB 5: convention (h.1) completed

**The sweep found seven scripts, not the three the triage session named.**
Searching by output-directory CONSTANT found five. Searching by WRITE SITE found
seven: `layout_fit_gate.mjs` and `dist_hygiene_gate.mjs` both name their output
`QA`, which no search for `SHOTS`, `SCREENS`, `OUT` or `OUT_DIR` would have
found. Both run in CI on every push. The lesson is the one convention (p) keeps
teaching: search for the behaviour, not for the shape you expect it to take.

The seven: `anticipation_proof.mjs` (the original SA-012 mechanism),
`contrast_gate.mjs`, `layout_fit_gate.mjs`, `dist_hygiene_gate.mjs`,
`mini_player_proof.mjs`, `locale_launch_conformance.mjs`,
`feature_price_proof.mjs`.

**The fix is one module, not seven edits.** `frontend/scripts/lib/evidencePaths.mjs`
resolves every evidence path. By default it returns a path under
`.evidence-scratch/`, gitignored and mirroring the committed tree exactly.
`FS_WRITE_EVIDENCE=1` returns the real committed location, which is the explicit
regeneration convention (h.1) allows, and it is an opt-in a human has to type
rather than a default anyone can trip over. Every run announces its mode. A rule
that lives in seven copies of a path expression is a rule that comes back.

**Proven, not asserted.** All seven re-run: seven exit 0, thirty files written to
`.evidence-scratch/`, and `git status` over `reports/` and `docs/` reports
nothing. **The four `scatter-anticipation/trigger_*.png` files that SA-012 was
about are among the thirty**, which is the direct proof: the exact files that
used to be overwritten now land in scratch.

**Not migrated, and deliberately.** The six `evidence_*.mjs` scripts,
`layout_v1_audit.mjs` and the three `provider_mark_*` scripts write to committed
evidence because regenerating evidence is what they are for. Convention (h.1)
carves out exactly that, and migrating them would break the jobs the carve-out
exists for.

### FOR THE OWNER: a keep-or-discard call, not decided here

Four things sit in the working tree that this session did not create and will not
rule on. Listing them rather than deciding, because two of them look like
somebody's work in progress and discarding another session's work is precisely
what rule 11 was written to prevent.

1. **`scripts/assets/backgrounds.py`**, modified and uncommitted. Present since
   before this session and before the previous two. Either an unfinished edit or
   a stray one.
2. **`games/future_spinner_super/`**, untracked, a complete second maths package
   with its own `game_config.py`, `gamestate.py`, `reels/` and `library/`.
   `CLAUDE.md` says prototypes live on their own branch and never on `main`,
   because a second maths package beside the shipping one is the stale-artefact
   misread that has previously cost a star at external audit. It is untracked so
   it is not on `main`, and convention (o) keeps it out of the staging bundle
   since that is built from a fresh clone. Contained, but it is on the machine
   the captures are taken from.
3. **`sideproject/`**, untracked.
4. **`reports/screens/cohesion-pass/char-enhanced-closeup.png`**, untracked, a
   single capture sitting in a committed evidence directory.

The question for each is keep or discard. This session has not touched any of
them.

### Verification, measured

    node scripts/qa/locked_paths_gate.mjs --self-test        PASS, including four new range cases
    node scripts/qa/locked_paths_gate.mjs --check-disjoint   3 manifests, 0 collisions
    seven migrated gates re-run                              7 exit 0, working tree clean
    dash check across every file written                     0 em or en dashes

PR #115 CI, both jobs green:
`https://github.com/JTOSHIE/stake-game-development-claude/actions/runs/30189878160`


Rule 10 closing link, this session's final push (`c03089b`), BOTH JOBS GREEN:
`https://github.com/JTOSHIE/stake-game-development-claude/actions/runs/30190220946`
  static gates: success
  browser gates: success

The PR #115 merge commit `bdc6771` also ran green on `main` in its own right:
`https://github.com/JTOSHIE/stake-game-development-claude/actions/runs/30190146930`
Recorded separately because a merge that is green on the branch and red on
`main` is exactly the case rule 10 exists for, and it is worth showing it was
checked rather than assumed.

### FOR THE NEXT SESSION

**Model and effort.** Opus 5 at high effort. The gate defect was the judgement
work: the half-fix was written, tested, and rejected by its own seeded case,
which is the sequence convention (p) is for.

**Approach.** Derive before measuring throughout. The gate fix was reasoned from
what GitHub actually checks out before any code changed, and the self-test was
written to distinguish three candidate fixes rather than to confirm one.

**Alternatives tried and rejected.**

- *Merging PR #115 red, since Fable had approved it.* Rejected on rule 10.
- *Widening the screenshot-analyst manifest to make the gate green.* Rejected,
  and it is the tempting wrong answer: the track had not touched either file, so
  widening would have broken rule 3 disjointness to hide a gate defect.
- *Taking the merge base against the merge ref.* Written, tested, rejected by its
  own seeded case. Kept as a permanent test case.
- *Migrating the `evidence_*.mjs` scripts along with the gates.* Rejected:
  regenerating evidence is what they are for.
- *Deciding the keep-or-discard question on the four working-tree items.*
  Rejected as not this session's call.

**Files touched.** `CLAUDE.md`, `WRS_MASTER_DOCUMENT.md`, `.gitignore`,
`.github/workflows/checks.yml`, `scripts/qa/locked_paths_gate.mjs`,
`docs/records/reviews/REVIEW_TRACKER.md`,
`docs/records/upload-kit/00_READ_ME_FIRST.md`,
`frontend/scripts/lib/evidencePaths.mjs` (new), seven migrated scripts under
`frontend/scripts/`, `reports/briefs/FS_RULE11_MERGE115_Prompt.md`, this report
and its archive copy.

**Open threads.** TR-073, TR-074 and TR-075 all close on captures the owner takes
during the second portal visit, and all three are now written into the
walkthrough. The rule 9 gap. The four keep-or-discard items above.
