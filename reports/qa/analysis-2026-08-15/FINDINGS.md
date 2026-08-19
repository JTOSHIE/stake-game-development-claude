# Analysis only pass, 2026-08-15: findings

Branch `analysis/2026-08-15`, cut from `main` at `90f21280`. Read only. Nothing in this
pass was fixed, no gate was written or modified, no tracker status cell was changed.
Australian English, no em dashes or en dashes.

---

## HEADING: URGENT

Two items. Both are recorded and NOT actioned, per the brief's stop line. "Stop" is read
here as stop before remediation, not stop the analysis, so the remaining jobs were
completed and are reported below.

### URGENT 1. PR #123 deletes 13,602 lines of session history, and the archive does not hold them

`reports/SESSION_REPORT.md` is **13,630 lines at `90f21280`** and **109 lines at the PR
head `59c4c88e`**. The diffstat is `81 insertions, 13,602 deletions` on that one file.
The PR does not append its report; it REPLACES the file with its own 109-line report.
VERIFIED 2026-08-15 by `git show 90f21280:reports/SESSION_REPORT.md | wc -l`,
`git show 59c4c88e:...` and `git diff --numstat 90f21280 59c4c88e`.

**The material is not safe in the archive.** JOB 3c set out to prove content coverage for
two named headings and proved the opposite, by a fixed-string sweep of every line of 30
characters or more against all 244 files under `reports/archive/`:

- `## ADDENDUM: REMOTE CI AND OWNER PREVIEW, per rule 10 and rule 12`
  (`reports/SESSION_REPORT.md:8580`): **NOT FOUND** in the archive. Its archive sibling
  `reports/archive/2026-07-29d_session3_remediation.md` is a byte-exact copy of the
  session block that ENDS on the line immediately before this heading.
- `## ADDENDUM: the close, and a fourth thing that went wrong`
  (`reports/SESSION_REPORT.md:9500`): **NOT FOUND**, zero matching lines anywhere.
  `reports/archive/2026-07-30_true-fixdown.md` stops one line before it too.

Confirmed first hand by this session: both headings exist at those lines, and
`grep -rc "30447461123\|30514717576\|zero survivors\|Terminate orphan process"` over
`reports/archive/` returns zero hits in all 244 files.

**So the pattern is systemic rather than a single miss**: an addendum appended AFTER a
session's archive copy was taken was never carried across, and at least two are held
only in `reports/SESSION_REPORT.md`. Merging PR #123 as it stands removes the only copy
in the tree. The commits remain in git history, so this is recoverable rather than
destroyed, but multi-track rule 8 is explicit that report conflicts are resolved "by
concatenation, never by discarding a section", and 412 headings live in the file at HEAD.

**Collateral, measured rather than asserted:** 50 line-numbered citations point into
`reports/SESSION_REPORT.md` across the tree, and every one of them cites a line above
109. Three sit in live documents rather than dated evidence families:
`docs/records/V7_RECONCILIATION.md:91` (cites `:5316`),
`reports/briefs/FS_ATOMIC_PASS_Prompt.md:115` (cites `:7349`), and one self-citation
inside the report itself at `:10646`.

**And the PR's own CI never measured this**, because its static job aborted earlier (see
URGENT 2), so the document currency scan that would have counted the newly stale line
citations did not run.

**A note on this pass's own brief, recorded because the same trap was in front of it.**
This brief's COMMIT block lists `reports/SESSION_REPORT.md` under "Create only". That
was read as APPEND, and this session appended an addendum, precisely because writing the
file is what produced the finding above.

### URGENT 2. PR #123's head is RED, and rule 10 is not satisfied for that commit

`59c4c88e` has exactly one workflow run, **31815432853**, event `pull_request`,
conclusion **failure**. There is no green run for that commit. Two jobs failed:

1. **`static gates`**, at the step `locked paths and track scope`. The locked path check
   itself passed ("1 commit(s) in `90f21280..59c4c88e`, 0 sanctioned, 0 violation(s)").
   What failed is TRACK SCOPE, quoted from the run log: *"branch
   track/standback-2026-08-15 declares a track, and
   docs/records/tracks/standback-2026-08-15.manifest does not exist. A track without a
   committed manifest is not a track"*. That is multi-track rule 2 working as designed.
   **The failure is at step 3 of the static job, so every later static step, including
   the document currency scan, the dash gate, the supply chain gate, typecheck and the
   build, never ran on this commit.** A red at step 3 hides the state of the rest.
2. **`browser: max-win hold`**, one assertion, quoted from the log: *"the SPIN control is
   disabled by state during the hold, not merely covered (a scrim stops a pointer and
   nothing else, so the control has to be unavailable by state)"*. Every other assertion
   in that gate passed, including the balance and win hold and the absence of
   `/wallet/play` and `/wallet/end-round` during the hold. **This gate reads `canSpin`'s
   disabled binding, and PR #123 replaces `canSpin` with a new `canAffordSpin` at those
   exact bindings** (`git diff` shows five `disabled={...!$canSpin}` bindings changed),
   so the failing assertion is plausibly a consequence of the PR's own change rather
   than a pre-existing defect on `main`. **Not diagnosed further and not fixed**, per the
   stop line: a remediation pass should run that gate against both trees before ruling.

For comparison, this analysis branch does not carry the track prefix, and
`node scripts/qa/locked_paths_gate.mjs` on it returns "LOCKED PATHS: PASS" with
"branch analysis/2026-08-15 is not a track branch, scope check not applicable".

---

## Premises, each tagged as checked

| Premise | Tag |
|---|---|
| `main` is at `90f2128` and PR #123 is unmerged | **VERIFIED 2026-08-15** by `git ls-remote origin main` (`90f212807ed5...`) and `gh pr view 123` (state OPEN, head `59c4c88e684c...`, mergeable). It has not moved |
| `BET_LEVELS` is `[0.10, 0.20, 0.50, 1.00, 2.00, 5.00, 10.00, 20.00, 50.00, 100.00]` | **VERIFIED** by direct read, `frontend/src/lib/stores/gameStore.ts:7` |
| The real platform ladder, 32 levels from 0.01 to 100.00 | **REPORTED**, from an owner screenshot. Nothing in the repository carries it, so it is used below as the stated input to a calculation and never as a verified fact |
| `MODE_COST` is base 1, cruise 1, antelite 1.25, bonus 100, super 400 | **VERIFIED** two ways: `frontend/src/lib/config/fsModes.ts:73,83,93,103,113`, and `games/future_spinner/library/publish_files/index.json`, which agrees mode for mode |
| **NEW, and it changes how this pass ran**: the primary checkout at `/Users/jt/math-sdk` is on `track/standback-2026-08-15` at `59c4c88e`, not on `main` | **VERIFIED** by `git branch --show-current` and `git worktree list`. The tree is clean and the branch tip equals its remote, so nothing is at risk. Per multi-track rule 11 this session touched nothing there and worked in its own worktree at `worktrees/analysis-2026-08-15` instead |

---

## A correction to the newest tracker row, found by trying to reproduce it

**TR-148 item 4, opened yesterday by R070, cites a file that is not in the repository.**

The row escalates that three lookup-table hashes in
`games/future_spinner/library/configs/config.json` disagree with the shipped CSVs. **That
path is gitignored and untracked.** VERIFIED 2026-08-15 three ways: it does not exist in
this worktree; `git ls-tree -r 90f21280` returns nothing under `library/configs/`; and
`git check-ignore -v` names `.gitignore:9`, `**/library/**`, with `:10`, `**/configs/*`,
catching it a second time. Only nine files under `games/future_spinner/library/` are
tracked at all: the statistics workbook, `statistics_summary.json` and the seven
`publish_files`.

**What that means for the row, stated precisely rather than retracted wholesale.** The
measurement itself was real: it was taken first hand on the owner's machine, where the
file exists as a local build artefact. What is wrong is the row's implicit claim to be
reproducible from the repository. Fable cannot open it, a reviewer cannot open it, and
convention (m) is explicit that work does not cite a document that is not physically in
the repository.

**Why nothing caught it**: the document currency gate reports references into gitignored
trees separately and does not judge them, printing "735 reference(s) into gitignored
trees, reported not judged" on the run this session made. So the citation is invisible to
the one instrument that exists to catch dead citations.

**Not actioned.** The row is not edited and no status cell is touched. A remediation pass
decides whether to re-word TR-148 item 4 as a local-machine observation, to commit the
config file, or to retract the item.

---

## JOB 1. Money surface census

Full table at `reports/qa/analysis-2026-08-15/MONEY_SURFACE_CENSUS.md`. The result in
one paragraph:

**Seven currency surfaces at `90f21280` can render a value they cannot express**, of
which the PR fixes two. Five are pre-spin cost quotes, which **CONFIRMS Fable's count of
five with two fixed**; the census adds two the cost-site frame could not see, the session
ledger's TOTAL WAGERED (`SessionPanel.svelte:116`) and the replay view's TOTAL SPENT
(`ReplayMode.svelte:614`), plus one surface that reaches the DOM with no formatter on
either side, the autoplay LOSS LIMIT number input (`HudOverlay.svelte:512`, `:759`,
`:976`).

The mechanism is one line wide: `formatBalance` renders at the currency's own precision
and `formatWin` widens to the real precision, and every risk row is a cost or stake
rendered through the first. **Exactly one mode makes a stake fractional**: antelite at
1.25x. On the real ladder four bet levels do it (0.01, 0.02, 0.05, 0.10); on the
hardcoded ladder two do (0.10, 0.50). So the platform's own ladder DOUBLES the exposure.

---

## JOB 2. TR-136 gate coverage delta

**What `frontend/scripts/r057_subcent_proof.mjs` actually drives**, read line by line:
five assertions over three surfaces, in two currency legs (USD and XSC), on one fixture
round (book 47, the 0.08x minimum way win) at one bet (the $0.10 rung):

| Assertion | Selector | Surface |
|---|---|---|
| the HUD win readout carries the widened value | `[data-testid="hud-win"]` | HUD WIN |
| the HUD balance carries the settled value | `[data-testid="hud-balance"]` | HUD BALANCE |
| the ledger's Total Won carries the real precision | `[data-testid="session-panel-sheet"]` | session ledger |
| the ledger's Net carries the real precision | same sheet | session ledger |
| the raw currency code never reaches a player | same sheet | session ledger |

**Its own header overstates its coverage by one surface.** Lines 20 to 33 claim the proof
covers "the win panel" and cite `src/lib/components/WinDisplay.svelte:92`. There is no
assertion against `WinDisplay` anywhere in the file, and the testid at that component is
`win-amount-row` at line 106, not line 92. A reader trusting the header would believe the
WIN panel is gated for sub-cent precision. It is not.

**THE DELTA, every money surface that can render a fractional value and is asserted by NO
gate:**

| Surface | Why no gate reaches it |
|---|---|
| `BetSelector.svelte:75` effective BET | Sub-cent gate drives three testids and this is not one. No `data-money` marker, so `money_fit_gate.mjs` (which scans `[data-money]`, line 222) cannot see it either. Fixed on PR #123 only |
| `FeatureMenu.svelte:98` THIS SPIN COSTS | As above, no marker, not driven. Fixed on PR #123 only |
| `FeatureMenu.svelte:86` at `:440`, the OVERBOOST resolved cost | As above. Not fixed anywhere |
| `FeatureMenu.svelte:513` shortfall tooltip | Lives in a `title` attribute, which no gate reads at all |
| `PaytableModal.svelte:162` at `:341`, the Bet Modes COST sub value | Carries `data-money="cur"`, so the FIT gate measures its box, but no gate checks its VALUE. Fit coverage is not precision coverage |
| `SessionPanel.svelte:116` TOTAL WAGERED | The sub-cent gate opens this very sheet and asserts Total Won and Net beside it, and does not assert Wagered |
| `ReplayMode.svelte:614` TOTAL SPENT | Replay legs exist (`replay contract`, `replay fit`) and neither asserts money precision |
| `HudOverlay.svelte:512`, `:759`, `:976` loss limit input | An `<input>` value, outside every text-node scan |

**The premise above the Total Won row, quoted from `SessionPanel.svelte:120-122`:**

> Wagered stays formatBalance because stakes are bet ladder values, whole currency
> units by construction.

**Antelite at 1.25x FALSIFIES it, and the falsification does not need the platform
ladder.** The row renders `wageredMicros`, which accumulates the REAL debit
(`responsibleGambling.ts:176` taking `costMicros` from `App.svelte:808`, `:812`, `:1713`,
computed by `spinCostMicros` at `App.svelte:732`), so one antelite spin at the 0.10 rung
adds 125,000 micros and the row renders $0.13. Neither clause of the premise holds: the
value is not a ladder value, and 0.125 is not a whole currency unit. The comment and the
formatter were both left exactly as found.

---

## JOB 3. The three unreachable checks

**3a** is under URGENT 2 above.

**3b. `.claude/worktrees/trusting-colden-055579`, inspected and not modified.**

| Question | Answer, VERIFIED 2026-08-15 |
|---|---|
| Branch | `claude/trusting-colden-055579`, tip `65e4db45` |
| Dirty? | **YES**: `.github/workflows/checks.yml` and `scripts/owner_preview.mjs`, 349 insertions across the two |
| Commits not on any pushed branch? | **NO.** `git rev-list --count origin/main..claude/trusting-colden-055579` returns 0, and `git branch -r --contains 65e4db45` lists `origin/main`. Nothing committed is at risk |
| Is the dirty work already on `main`? | **Mostly.** `main`'s `scripts/owner_preview.mjs` already carries the address prover and a `--self-test`, and its version is FURTHER developed than the worktree's draft (639 diff lines apart; `main` seeds three defects with four paired controls, the draft seeds one). The worktree is an earlier draft of work that landed by another route |

**One thing in it is NOT on `main`, and it is the reason not to delete it blind.** The
uncommitted `checks.yml` hunk wires `node scripts/owner_preview.mjs --self-test` into the
static job. **`main` has the self-test and never runs it**: `grep -n "owner_preview"
.github/workflows/checks.yml` at HEAD returns nothing. Run locally in this pass it passes
7 of 7 with 3 seeds and 4 paired controls, in about two seconds. So convention (p)'s
"a gate that has never been seen to fail is not evidence" holds for this one only by
somebody remembering to run it, which is the same class as the local-only currency
conformance harness recorded in R066.

**RECOMMENDED DISPOSITION, for a remediation pass to decide, not executed here:** lift
that one `checks.yml` hunk into a review-lane change on its own, confirm the leg green,
then `git worktree remove .claude/worktrees/trusting-colden-055579` and delete the
branch, which carries no unique commits. **Nothing was deleted or modified by this pass.**

**3c** is under URGENT 1 above: both headings are NOT covered in the archive, proven by
content sweep rather than by filename.

---

## JOB 4. Bet ladder divergence

Comparing `BET_LEVELS` (`gameStore.ts:7`) against the reported platform ladder:

- **Invented, present in ours and absent from the platform's: `0.50`.** One level.
- **Missing, present on the platform's and absent from ours: 23 levels**: 0.01, 0.02,
  0.05, 0.40, 0.60, 0.80, 1.20, 1.40, 1.60, 1.80, 3, 4, 6, 7, 8, 9, 12, 14, 16, 18, 30,
  40, 75.
- **The platform minimum 0.01 is NOT in the fallback ladder.** Our minimum is 0.10, ten
  times the platform's.

**What actually reaches the player when authenticate omits `betLevels`**, traced through
`frontend/src/lib/stores/betLadder.ts:40-66`:

1. `activeBetLevels` sees an empty `rgsBetLevels` and falls back to `BET_LEVELS`.
2. If `rgsBetConfig` supplied a `minBet` or `maxBet`, the fallback is FILTERED to that
   envelope. This is a comparison only; the module's own comment (lines 52 to 55) records
   that snapping to `stepBet` was deliberately left undone because it is float arithmetic
   on display units.
3. If the envelope excludes every rung, the unfiltered `BET_LEVELS` is returned rather
   than an empty ladder, deliberately, so a player is never left unable to bet.

**What breaks, stated as consequences rather than as a fix:**

- **The three sub-ten-cent rungs are unreachable.** The platform's own RGS page says new
  submissions "should incorporate small denomination bets, which are not yet industry
  standard, these are levels (in USD): [$0.01, $0.02, $0.05, ...]"
  (`docs/stake-engine-live/2026-08-15/rgs.md:287`). On the fallback path the player cannot
  select any of them.
- **`0.50` is offered and is not on the platform's ladder.** The envelope filter cannot
  catch it, because 0.50 sits INSIDE any plausible min and max. Whether the platform
  rejects an off-template amount is a platform question this pass cannot answer from the
  repository.
- **The fallback path is not hypothetical for the fractional stake analysis**: it is the
  path on which antelite's fractional products are the two larger ones (0.125 and 0.625)
  rather than the four smaller ones.

---

## JOB 5. Operating frame accuracy

`CLAUDE_PROJECT_INSTRUCTIONS_v7.md` read clause by clause against HEAD, 39 clauses
checked. **Eight misstate the repository.** Fable's two are confirmed and six more are
found. Nothing in the document was edited.

| Clause | v7 line | What it claims | What HEAD holds |
|---|---|---|---|
| **3(f)** HARD LOCKS, the debts parenthesis | 21 | LOCKED_FILE_DEBTS holds "canBuyBonus 100x and canSpin 1x affordability checks, both compensated and unreachable via live UI" | **CONFIRMED MISSTATEMENT.** `grep -c canSpin CLAUDE.md` returns **0**: the canSpin debt is recorded nowhere. And it is not unreachable: `canSpin` (`gameStore.ts:88-91`) is `$bal >= $bet` with no mode cost, and `App.svelte:1916` calls `handleSpin()` on it while the SPIN control's `disabled` binds to it. PR #123 replaces those bindings with a new `canAffordSpin` precisely because it IS reachable. The real section runs `CLAUDE.md:137-258` and carries nine bullets, not two |
| **3(g)** money maths, the rounding function | 22 | "integer micros, Math.floor(dollars x 1_000_000)" | **CONFIRMED MISSTATEMENT.** In `frontend/src` at HEAD, 36 sites convert with `Math.round(... CURRENCY_SCALE)` and exactly **one** uses `Math.floor`, at `frontend/src/lib/services/rgsService.ts:125`, inside a LOCKED file. So every non-locked money conversion, including the spin cost helper, rounds. **Which of the two is correct is a money-path question and is NOT ruled here** (convention l.8). `CLAUDE.md`'s own integer-micros block carries the same `Math.floor` example, so both instruction documents say floor while the code rounds |
| **3(g)** money maths, the helper claim | 22 | "all currency arithmetic flows through the micros helpers" | **MISSTATES.** There is no dollars-to-micros helper in `frontend/src/lib/utils/currency.ts`; it exports the scale and the formatters, and each call site multiplies and rounds inline |
| **3(g)** money maths, the soak gate | 22 | "a permanent cost-integrity gate in the QA soak asserts exact per-mode debits" | **MISSTATES by one word.** The assertions exist (`frontend/scripts/qa_soak.mjs:656`, `:719`, `:764`), but `checks.yml:18` records `qa_soak` as deliberately OUT of CI. It is real and it is not permanent: it runs when somebody runs it |
| **2** session start protocol | 13 | The read-in-order list | **MISSTATES.** It omits `reports/FABLE_COMMS.md`, the append-only file whose own first lines say "Fable fetches this file directly from the repository at each check-in" and which now holds 70 entries. `grep FABLE_COMMS` on v7 line 13 returns 0 |
| **5** platform reality, the review model | 33 | "three anonymous reviewers score on a fractional scale (0 to 3 in about 0.33 steps); the rounded average is the star tier" | **MISSTATES its own stated source.** Section 5 says it was mined from the approval docs mirrored under `docs/stake-engine-live/`. The current capture, `docs/stake-engine-live/2026-08-15/approval_guidelines_game_quality_rankings.md`, publishes integer star tiers only and says nothing about three reviewers, 0.33 steps or a rounded average |
| **5** platform reality, the ranking cadence | 33 | "re-rank every Friday, Australian time" | **MISSTATES its provenance.** `grep -rn Friday` across the repository returns v7 itself, `WRS_MASTER_DOCUMENT.md:40` and `:223`, and the superseded v6. No platform capture carries it |
| **7** owner standing items | 39 | Owner items are tracked "in the current handover and WRS_MASTER_DOCUMENT.md" | **MISSTATES.** `OWNER_CHECKLIST.md` exists at the repository root and calls itself "the anti-forgetting document", and v7 line 39 does not name it |
| **1** the triad, the builder role | 10 | "the only writer, in a persistent conversation" | **MISSTATES the governing protocol.** `CLAUDE.md`'s multi-track protocol makes only `main` single-writer, with concurrent sessions on branches and worktrees. This pass is itself an instance |

---

## JOB 6. Consolidated open register

Full table at `reports/qa/analysis-2026-08-15/OPEN_REGISTER.md`.

---

## Method and provenance, stated so the reader can weigh each claim

Everything under URGENT, and every premise, every JOB 2 assertion, every JOB 3 answer,
every JOB 4 figure and every JOB 5 row above was opened first hand by this session and
carries its command or its `file:line`.

The breadth work, the component walk behind JOB 1 and the row-by-row register behind
JOB 6, was run as a seven-agent read-only fan-out per multi-track rule 4, then curated.
**Every JOB 1 census row was re-opened and its line reference re-read by this session
before it was published**, and ten were spot-checked by printing the exact source line.
For JOB 6, six of the 31 flagged mismatches were re-verified first hand (TR-096, TR-097,
TR-122, Q-34, TR-087 and the two social CI legs) and all six confirmed; **the remaining
25 are REPORTED at the level of provenance rule 16 defines, not VERIFIED**, and each
carries the `file:line` a remediation pass would open to settle it.

## Stop line

The pass stopped at analysis. No file under `frontend/src/`, `i18n/`,
`games/future_spinner/`, no locked file, no gate and no tracker status cell was touched.
The only files created are the six named in the brief's COMMIT block, with
`reports/SESSION_REPORT.md` appended rather than replaced for the reason under URGENT 1.
