# Session Report - THE REPLAY BLOCKER, RULE 9, AND THE WORKING-TREE RELOCATIONS (2026-07-26)

Brief saved verbatim: `reports/briefs/FS_REPLAY_BLOCKER_Prompt.md`. Fresh session on
`main`, integrator role, explicit paths, one commit per job, no lock exceptions and none
needed: no locked path was touched or required. Multi-job justified per rule 4: one
substantial job (the blocker) plus three small hygiene items, exactly as the brief
recorded.

## JOB 1. The replay blocker, TR-076, fixed and proven

**The defect, as the owner saw it on the live platform:** the Replay panel launches the
game, the board renders static, START REPLAY sits at the bottom as an unclickable shadow,
and nothing plays. Reproduced on `super` event 22975 (EUR) and on a fresh bet. Bet Replay
is a mandatory approval requirement, so this was filed as a BLOCKER.

**Reproduced locally BEFORE any code was read as guilty.** The production build was served
and driven by Playwright at the exact live parameter shape (every documented query
parameter from `docs/stake-engine-live/game-replay-requirements.md`: `replay=true`, game
UUID, `version=1`, `mode=SUPER`, `event=22975`, `rgs_url=rgs.stake-engine.com`,
`currency=EUR`, `amount=10000000` micros, `lang=en`, `device=desktop`), with the public
RGS replay endpoint served the shipped `super` cap book round. The real click on START
REPLAY timed out, and `document.elementFromPoint` at the button's centre returned
`.bg-still-container`.

**Root cause, the brief's suspect 1 confirmed with a named element:** `App.svelte`'s
`.bg-layer` is `position: fixed` at `z-index: 0`, and a positioned layer at z-index 0
paints and hit-tests ABOVE unpositioned content. `ReplayMode`'s `.replay-container` was
unpositioned, so the entire replay UI sat under the backdrop: visible only as a shadow
through the dark overlay, and unclickable because the backdrop swallowed every hit. In
normal play `.game-stage` (z-index 2) covers the backdrop, which is why only replay mode
was exposed. Third appearance of the full-viewport-layer-intercepts-input class
(HeroSplash was the first).

**Fixed at root, in both directions, no locked file:**

- `.bg-layer` now carries `pointer-events: none`. The backdrop is decoration and can
  never take a hit again, in any mode, whatever the stacking order does next.
- `.replay-container` is now `position: relative; z-index: 2`, the same relationship to
  the backdrop the game stage has.

**Proof: `frontend/scripts/replay_blocker_proof.mjs`, 7 of 7 green.** Three passes:

1. **Seeded, convention (p):** the exact shipped CSS is re-injected into the served page
   (backdrop hit-testable, replay container unpositioned) and the proof goes RED: the
   real click is intercepted by `.bg-still-container` again. Frame
   `01_seeded_defect_start_replay_shadowed.png` shows the owner's exact symptom.
2. **Base win at the live shape, EUR:** real click lands; the presentation actually runs
   (Replaying round status, reveal animation, the win counting up across 6 distinct
   sampled frames to a non-zero total, `€3,900.00`); euro formatting asserted on the
   button (`Bet: €10.00`, symbol not code, no NaN).
3. **Super cap round:** `MaxWinCelebration` presents (MAX WIN REACHED!, 5,000x BET) and
   its COLLECT is dismissed by a real click.

Evidence committed to `reports/screens/replay-blocker/` (six frames, this job explicitly
regenerates evidence so (h.1) is satisfied), inventoried in
`reports/screens/EVIDENCE_INVENTORY.md`. Gates re-run: dash gate PASS (source and dist),
`npm run check` 0 errors, CI gate 13 (`replayRounds.test.ts`) PASS, production build
clean.

**TR-073 closed with the pass-3 capture.** The brief says "closing TR-075 with the
capture"; TR-075 is the cruise wallet-debit row, and the wincap-celebration evidence gap
the brief describes is TR-073. Recorded in both tracker rows rather than silently
renumbered, per convention (n)'s surface-the-tension rule. **What the capture is not:** a
replay of live event 22975 itself. The real game UUID lives only in the owner's portal,
not the repository, so the round served was the shipped `super` cap fixture, a real book
round of identical shape through the identical component and interpreter path. The
owner's one-click live confirmation via the Bets panel Replay button after the next
frontend upload stays listed below as belt and braces.

## JOB 2. Rule 9 filled

The empty rule 9 slot in the multi-track protocol now carries its originally intended
content: seeded-failure proofs run locally where possible; a genuinely required red run
against origin uses a branch named `test/expected-fail-<topic>`, a commit message opening
EXPECTED FAIL, the branch deleted after, and the session report naming the run BEFORE the
owner can meet the notification; an unexplained red on any other branch is treated as
real. Recorded beside it that the slot was skipped because the rule's brief was issued
but never executed. Mirrored in `WRS_MASTER_DOCUMENT.md`; both numbering notes updated to
record the fill; rules 10 and 11 keep their numbers so every existing citation stays
correct.

## JOB 3. Working-tree relocations, nothing discarded

1. **`scripts/assets/backgrounds.py`** (one-line docstring edit): committed to a new
   branch `chore/wip-backgrounds` (commit `88df4f9`, pushed) via its own worktree per
   rule 11; the primary working tree restored to HEAD.
2. **`games/future_spinner_super/`** (450MB loose on the capture machine): the existing
   `claude/fs-super-prototype` branch was found to ALREADY carry the entire package,
   byte-identical to the loose copy (verified by `diff -rq`, differing only in
   `__pycache__` and `.DS_Store`). Nothing needed committing; the loose copy was removed
   from the working tree. The horizon material is preserved exactly where the brief
   wanted it.
3. **`reports/screens/cohesion-pass/char-enhanced-closeup.png`**: referenced only in
   session-report disposition lists, never cited as evidence by any tracker row, gate or
   document, so it was moved to scratch per (h.1) rather than committed.
4. **`sideproject/`**: left untouched, listed for the owner below.

## JOB 4. Close

Working tree at close: clean except `sideproject/` (untouched by instruction). Locked
paths untouched; `git diff .claude/settings.json` empty throughout. Remote CI result for
the final push is recorded in the closing commit per rule 10.

**Self-audit per THE FACTS DISCIPLINE item 4:** brief re-read against the work; every
number above carries its artefact (proof output, tracker row, diff); the one
non-executable item (live replay of event 22975 by its real id) is parked with its reason
(the game UUID is portal-only) rather than approximated; conventions (b), (f), (h),
(h.1), (k), (n), (p), rules 4, 9, 10, 11 all consciously applied.

### FOR THE OWNER

**`sideproject/`** sits untracked at the repository root (contains a `lumen/` directory
with `docs` and `frontend` inside; not inspected further). Say **LUMEN-branch** (it is
committed to a LUMEN branch) or **off-repo** (it moves out of the repository entirely).

### FOR THE NEXT SESSION

Model and effort: Fable 5, integrator session, four jobs per the brief's own
justification. Approach taken: reproduce at the live parameter shape before reading any
code as guilty; the reproduction named the intercepting element in one run, which made
the fix two CSS declarations rather than a redesign. Alternatives considered and
rejected: raising only the replay container without neutering the backdrop's hit-testing
(fixes replay but leaves the interception class armed for the next unpositioned surface);
fixing only pointer-events without positioning the container (fixes the click but leaves
the replay UI painting under the backdrop as a shadow).

Files touched: `frontend/src/App.svelte`, `frontend/src/lib/components/ReplayMode.svelte`,
`frontend/scripts/replay_blocker_proof.mjs` (new), `reports/screens/replay-blocker/`
(new, six frames), `docs/records/reviews/REVIEW_TRACKER.md` (TR-076 new, TR-073 closed),
`reports/screens/EVIDENCE_INVENTORY.md`, `CLAUDE.md`, `WRS_MASTER_DOCUMENT.md`,
`reports/briefs/FS_REPLAY_BLOCKER_Prompt.md` (new), this report and its archive copy;
plus `chore/wip-backgrounds` (one commit, pushed) off-main.

Open threads:

1. **The owner re-tests replay on the live platform after the next frontend upload.**
   The fix is in main and proven locally at the live parameter shape; the deployed
   bundle still carries the defect until re-uploaded. Event 22975 via the Bets panel
   Replay button is the one-click confirmation, and it doubles as the belt-and-braces
   live sighting of MaxWinCelebration for TR-073.
2. **The cruise bracketed run stands** (TR-075 proper: one short cruise session with the
   session panel captured before and after), along with the remaining PART 9b
   observations.
3. **Fable's polish review follows the owner's visit**, per the retro mechanism.
4. **`sideproject/`** awaits the owner's LUMEN-branch or off-repo call, above.
