# Session Report - R071 ENDGAME CONSOLIDATION (2026-08-15)

Brief saved verbatim: `reports/briefs/FS_FABLE_R071_ENDGAME_Prompt.md`.
Branch: `main`, as integrator, per multi-track rule 1. Tip at close: **`8b5f71b6`**.
The eleven tasks first landed by `89373c0c`; two commits follow it and neither is new
scope, both being the fix for the one defect that commit's remote run found.
Locked paths untouched throughout: `rgsService.ts`, `gameStore.ts`, `games/future_spinner/`,
`.claude/settings.json`. `locked_paths_gate.mjs` PASS at every commit.

## Summary

**All eleven tasks landed. Nothing was degraded and nothing carried.** The close is green
at the tip: run **32250190643** on `8b5f71b6`, **30 of 30 jobs, 80 static steps**. The brief's
degradation order put TASKS 0 to 3 as the must-land core, 4 to 6 next, and 7 to 10 as
permitted to carry to an immediate follow-up. None of them did.

**The three owner decisions were applied as given and are not re-litigated anywhere in
this report**: the OVERBOOST wording is the recommended text, the banner row rebalances so
its contents' midpoint is the canvas centre, and the display face for money and counting
surfaces is Exo 2.

**The headline is not any single task. It is that the CI change in TASK 9 immediately
found five defects that the estate had been carrying invisibly, four of them this
session's own.** Ending the fail-fast masking was the ninth item on an eleven-item list
and it changed the character of the whole close: the first run after it landed reported
the true failing step instead of stopping at the first, and the four rounds that followed
surfaced a prohibited term on a stake.us surface, a broken accessibility floor, and two
gates that had quietly stopped measuring what they claimed. **Every one of those was a
consequence of work that had already passed locally.**

## What landed, task by task

**TASK 0, the merges.** PR #123 and #124 merged. #124 conflicted in
`reports/SESSION_REPORT.md` and was resolved **by concatenation per rule 8**, placing the
analysis addendum in true chronological order between the stand-back report and the revert
pass; nothing was discarded. PR #125 is CLOSED SUPERSEDED, after its font specimen
evidence and its own brief were committed to `main` as records first, so its citations
survive the branch.

**TASK 1, the precision law.** Every money display at HEAD was enumerated and conformed.
Payouts and wins widen to four places with a minimum of two; balances, costs, bets and
every other currency surface render at exactly two. `HudOverlay`'s balance and bet labels,
`BetSelector` and `FeatureMenu`'s cost readouts and `SessionPanel`'s NET all moved from
`formatWin` to `formatBalance`; TOTAL WON stays on `formatWin` because it is a payout.
`precision_law_gate.mjs` is new, wired into the static job, and carries **21 conformance
rows and three seeds**, including the brief's own three-place balance and four-place cost.

**TASK 2, the zero-decimal widening floor.** A non-zero amount below one unit of a
zero-decimal currency now WIDENS instead of rounding to a lying integer that shows the
player nothing where they hold something. `zeroDecimalDigits` is folded into
`formatBalance`'s widening path; conformance rows cover JPY, IDR, KRW, VND, CLP, ISK, UGX
and XOF; the silent-round state is the seed. **JPY 500000 micros renders as 0.5 and JPY 800
as 0.0008, while a whole unit is unchanged.**

**TASK 3, the fractional surfaces.** The seven-surface census was re-enumerated at HEAD and
each surface routed through the correct formatter. The autoplay loss-limit input, the last
one reaching the DOM raw, gained a formatter, a validation path and a formatted echo. Its
decimal count is DERIVED from what the shipped formatter renders for one unit rather than
assumed to be two, so a zero-decimal currency does not offer a 0.01 step.

**TASK 4, the face.** Exo 2 at 400, 700 and 900 with latin, latin-ext and cyrillic named
explicitly, self-hosted via `@fontsource` per the platform CDN rule. Orbitron remains the
brand and heading face. **Two properties, both measured, in one rule**: tabular figures,
which take the digit spread at weight 900 from 19.30px to exactly 0.00; and
`font-kerning: none`, **which was not in the brief and was found by the gate**, because Exo
2 kerns a digit against the following punctuation and left two amounts 5.62px apart with
every digit identical. The TR-089 per-digit boxes are retired, mechanism and CSS both.
Every counting readout is enumerated in TR-158. **Bundle 93 files, 12,467,332 bytes, 11.89
MB against the 25 MB cap**, a delta of +18 files and +265,838 bytes. Same-origin sweep
re-proven: 57 same-origin requests, 2 to the stubbed wallet, zero external origins.

**TASK 5, the OVERBOOST wording.** Seventeen sites, `prose.ts` twice and fifteen locales,
each text applied verbatim per locale. `kit_basis_gate` extends to pin both the new strings
and the absence of the superseded ones, with a fourth seed. **One deviation was surfaced
per (n) rather than taken quietly**: applying the supplied text verbatim produced 34
`multiplication_sign_gate` findings, so the GLYPH alone was converted to U+00D7, the form
the superseded string already used, with every word preserved.

**TASK 6, the banner rebalance.** The row's contents now centre on the canvas, and the
whole change reduces to ONE token value, `--fs-x-turbo` from 227px to 199px, once the
control rules were put on the token chain PR #125 had proposed. `control_row_symmetry_gate`
now ASSERTS the centring rather than printing it, and is wired into the browser matrix.
`HUD_SPEC.md` and `hud_banner_spec_check` moved with it. **MENU and AUTO did not move with
the row origin and the symmetry gate is what caught it**: both wrappers carried hand-set
lefts and have joined the chain.

**TASK 7, BET_LEVELS.** Traced at HEAD. Exactly one production module outside the locked
file imports the array, and only as fallback behind the authenticate-driven ladder; the six
locked functions that index it have zero production reads. **REGISTERED in
LOCKED_FILE_DEBTS with the trace, not fixed**, because the file is locked and this brief
carried no sanction. **The tension is surfaced per (n)**: the brief named two outcomes and
this is a third. A live path DOES read the array, so it is not dead, but it reads it only as
fallback, so it is not live behaviour either. A player on a platform that sends no
`betLevels` is on those ten rungs right now, which makes deleting the array a behaviour
change rather than a cleanup.

**TASK 8, records true at HEAD.** Frame **v8** supersedes v7 with the eight clauses
corrected, and it opens with a dated section naming each one WITH the evidence that
disproved it, rather than handing a reader a clean replacement to diff. v7 is archived
unedited with a prepended supersession line per (h). The canSpin LOCKED_FILE_DEBTS entry
landed. **Of the 68 stale status cells, sixteen closed themselves when PR #123 and #124
merged**, thirteen of those being LEDGER rows that were never wrong, only on a branch;
**the remaining fifty-two were swept by hand and EVERY ONE was re-verified first-hand
before its cell was touched**, per rule 16, because the register marked 62 of its 68 as
REPORTED. The fifty-one mapping is corrected: reviewers tick the checkboxes, 0 of 51 is the
expected state, and the old wording set up a job that does not exist. TR-148's gitignored
citation is replaced by a tracked recount. TR-096 and TR-059 are re-proved and closed.
**AUDIT_CLOSURE Q6 is honestly RE-OPENED**, not re-proved.

**TASK 9, CI hygiene.** All 71 gate steps in the static job report independently. Guarded on
`!cancelled()` AND the setup step each depends on, deliberately not `always()`, so a failed
`npm ci` does not produce sixty identical failures; `continue-on-error` is not used and the
workflow says why. The evidence-hygiene remainder pass came FIRST and then the gate was
wired: 138 scripts scanned, 0 writing to committed evidence, 0 frozen. The theme rasters are
DISPOSITIONED rather than pruned, with the reason below.

**TASK 10, the stray worktree.** Its one unique hunk, the CI wiring for
`owner_preview.mjs --self-test`, is adopted onto `main`. Its copy of the script was an
earlier draft that `main` has since superseded and was discarded rather than merged
backwards. Worktree and branch both removed.

## What the CI change found, which is the part worth reading

Five defects, in four rounds, every one on code that had passed locally.

1. **A PROHIBITED TERM on a stake.us surface.** The owner's OVERBOOST text was applied
   verbatim to the master string and to the social override alike. The master reads
   "Debits 1.25x every spin while ON", and **"Debits" names a real-money movement, which a
   social surface must not.** The social override now differs by exactly one word, "Costs",
   the word the superseded social blurb already used. **The instruction was followed
   exactly and still produced a defect**, and `prose.ts` already carried the rule that
   would have caught it while writing: a string reading identically in both modes is
   deliberately ABSENT rather than repeated, so writing an identical social override was
   itself the tell.
2. **A 44px touch target that was only a coincidence.** The IntroSplash Continue button met
   the accessibility floor as a side effect of padding plus Orbitron's line box. Exo 2's
   line box is shorter and the height fell to 39 at three profiles simultaneously, which is
   the signature of a shared cause. `min-height` now STATES the requirement.
3. **A REAL RENDERING DEFECT, reached through four wrong theories, and the wrong theories
   are the part worth keeping.** The count-up gate went red on the runner and green here on
   the same commit, four rounds running. **Theory one**: it measured a lone glyph's BOX
   where it meant the ADVANCE, since a lone glyph's box is its ink plus side bearings and
   side bearings are exactly what tabular figures do NOT equalise. True, fixed, still red.
   **Theory two**: the probe could not say which FACE it had measured, because
   `document.fonts.status === 'loaded'` means only that everything ASKED FOR has arrived and
   a detached probe at weight 900 may never have asked. Also true, also fixed, **also not
   the cause**: the runner printed "faces confirmed loaded" and stayed red. **Theory three**:
   `font-variant-numeric` was not reaching the shaper on that build, so the same feature is
   now asked for on both paths. Reasonable, harmless, **still not it.** What finally settled
   it was making the gate PRINT all ten widths instead of a verdict:
   `0=420 1=420 2=420 3=420 4=440 5=420 6=420 7=420 8=420 9=420`. **Nine digits agreeing
   exactly and the "4" alone 2px per glyph wider** is not a missing feature, because the
   feature demonstrably worked on nine of ten; and it is not rounding, which is at most one
   pixel. **It is the rasteriser's HINTER moving one specific glyph's advance**, which
   FreeType does and which Windows and macOS do not do the same way. `text-rendering:
   geometricPrecision` is the property that reaches it, and **it is a PLAYER fix rather than
   a CI accommodation**: a Linux browser with that hinting configuration would have jumped
   the counter 2px every time a 4 rolled past, and nobody would ever have seen it here.
   Three side effects of the chase are kept because each closes a real hole: the probe now
   takes the SHIPPED rule instead of restating it, so deleting that rule from `app.css`
   fails the gate where it used to pass; the rule's presence is asserted directly on all
   four declarations; and every width prints on every run. **Second time this arc a
   fonts-ready wait produced a false green, and the first time a verdict-only gate cost two
   wrong theories before it stopped.** **The confirmation is exact**: before the fix the
   runner reported whole-pixel widths, nine at 420 and one at 440; after it, it reports
   416.81 for all ten, **fractional, and identical to this machine to the hundredth of a
   pixel**. The integers were the hinter snapping advances, and with geometric metrics the
   two machines agree exactly.
4. **Two gates pinning the world before the ruling.** `currency_table_gate` required a
   zero-decimal currency to render 0.01 as the integer 0, which is the exact lying integer
   TASK 2 was ordered to close; its expectation now widens, by a DIFFERENT mechanism from
   the shipped formatter so the agreement means something under (l.4). Two
   `money_fit_gate` seeds had gone quiet because Exo 2 is narrower than Orbitron; both keep
   their mechanism and were retuned by measurement, written into the file beside them.

**A seed that has stopped catching its defect is the most dangerous artefact in this
estate**, because it reports PASS forever. A face change is exactly the kind of world
change that disarms a width-tuned seed, and nothing but the seeded run would have said so.

## What was dispositioned rather than actioned, and why

**The theme rasters.** `frontend/public/assets/themes` is 90 MB over four themes, of which
only `future-spinner` (17 MB, 66 files) ships. **The prune is already structural rather than
intended**: `vite.config.ts` strips the other three plus `themes/source` from the build,
`dist` carries 63 theme files and 11.89 MB in total, and `build_diet_verify.mjs` asserts
zero runtime requests to any pruned path. So the shipping question was answered before this
session and is machine-enforced. **What is left is 73 MB of dev-only commissioned art in the
repository, and deleting 442 files of it to save clone weight is an OWNER decision, not a
hygiene sweep.** Raised here, not actioned.

**BET_LEVELS**, registered rather than fixed, with the trace, per TASK 7 above.

**AUDIT_CLOSURE Q6**, re-opened rather than re-proved, with what is missing named precisely:
the SESSION-BEARING GAME url carrying `sessionID=` and `rgs_url=`, which exists only once
the game has been launched in the owner's own logged-in browser. **The portal address is not
it and cannot be made into it.** This is not a repository question and no amount of builder
work will close it; it is one paste. Recorded as UNKNOWN rather than open-and-being-worked,
because an owner-gated item sitting in a work queue reads as somebody's outstanding task.

**Forty-three consumers of `--fs-font-numeric` changed face**, and several are neither money
nor counting: the Continue button, the loading screen, the hero splash, the dev theme
selector. Nothing about it is broken. **Whether they belong on the display face is an ART
CALL and is left to the owner**, with the enumeration recorded in TR-164 so the question is
asked from evidence rather than rediscovered from a screenshot.

**One gate label disagrees with its own threshold**: `popout_conformance`'s assertion is
named "meets the 44px touch target" and tests `>= 40`. The fix satisfies both readings so
nothing is masked, and **the threshold is deliberately NOT changed in the same pass that
makes it pass**, because that is how a gate stops meaning anything.

## Self-audit against the brief and the conventions, per the facts discipline point 4

- **Australian English, no em dashes or en dashes**: verified by grep across every file
  this session wrote. The two dashes in `REVIEW_TRACKER.md` and the two in
  `COMPLIANCE_WATCH.md` are pre-existing and are verbatim platform quotes.
- **Explicit-path commits per (k)**: every commit stages named paths. One `git add -u` was
  used mid-session, reviewed against `git status`, then RESET and re-staged explicitly
  before committing, so no commit was made from a bulk staging step.
- **Locked paths per (f)**: `locked_paths_gate.mjs` PASS at every commit. No sanction token
  was needed because nothing touched a locked path.
- **Every gate ships a seeded self-test per (p)**: `precision_law_gate` three seeds,
  `kit_basis_gate` four, `money_fit_gate` five (two retuned, with the measurement recorded),
  `win_countup_steady_gate` one that reproduces at 28.36px, `currency_table_gate` nine plus
  a capture pin, `evidence_hygiene_gate` five plus four negative controls,
  `owner_preview.mjs` three plus four paired controls.
- **Gate chaining per (u.1)**: every close-sequence invocation used `&&` with the gate's
  exit code as the direct left operand. No semicolons, no pipes between a gate and the
  chain.
- **Rule 16 provenance**: the open register's 68 rows arrived REPORTED, not VERIFIED, and
  all fifty-two swept cells were recounted first-hand before being touched.
- **Rule 10**: every push's remote result was read, and the four red rounds were fixed at
  the cause rather than around the gate.

## Verification

**Gates run locally, all PASS at the tip.** `precision_law_gate` 21 rows and 3 seeds;
`currency_table_gate` 589 assertions across all 49 codes, self-test 21 checks with 9 module
seeds and the capture pin; `r057_subcent_proof` conformed to the precision law;
`money_fit_gate` 205 assertions plus all five seeds caught; `win_countup_steady_gate` spread
0.00px across ten digits with the seed reproducing at 28.36px; `layout_fit_gate` seven
presets; `popout_conformance` three viewports with real clicks; `social_string_conformance`
all checks; `locale_completeness_check`; `machine_tell_gate` source and dist clean;
`multiplication_sign_gate`; `dash_gate` source and dist clean; `kit_basis_gate` 24 phrases
across 7 files with four seeds; `evidence_hygiene_gate` 138 scripts, 0 writing to committed
evidence; `build_diet_verify` zero 404s, zero pruned-path requests, dist 11.89 MB under the
25 MB budget; `doc_currency_gate` PASS at 272 frozen; `locked_paths_gate` PASS;
`typecheck_baseline` PASS; `winPrecision` PASS.

**The frozen doc-currency baseline shrank 273 to 272 and did not grow.** Every citation this
session wrote was checked against the gate's rule that a backticked path is a claim the file
exists at HEAD, and several were deliberately UNBACKTICKED where the point of the sentence
was that the thing is absent or gitignored.

## The remote runs, recorded per rule 10

**RUN 32247203401, on `89373c0c`, FINAL VERDICT: FAILURE. Quoted as it stands, because it
is the run the close was waiting on and it did not go green.**

It took two attempts and both are on the record:

| Attempt | Jobs | Not green | What it meant |
|---|---|---|---|
| 1 | 30 | `browser: win count-up steady` **cancelled**, `browser: replay contract` **cancelled** | 28 green. Both legs were still running when the run ended; neither had reported a result. |
| 2 (final) | 30 | `browser: win count-up steady` **FAILURE** | 29 green. **This is the run's verdict.** |

**The failure was real and it was not a flake.** The leg printed
`0=420 1=420 2=420 3=420 4=440 5=420 6=420 7=420 8=420 9=420`: nine digit runs agreeing
exactly and the "4" alone 2px per glyph wider, on a build where the faces were confirmed
loaded and where two real amounts still rendered at one width. **That is the rasteriser's
hinter moving one specific glyph's advance**, which FreeType does and which Windows and
macOS do not do the same way, and it would have jumped a player's counter 2px every time a
4 rolled past on an affected browser.

**So `89373c0c` is not the tip and was never a green stopping point.** Two commits followed
it, and neither is new scope: `ffb41081` asks for tabular figures on both CSS paths and
makes the gate print all ten widths instead of a verdict, and `8b5f71b6` adds
`text-rendering: geometricPrecision`, which is the property that actually reaches the
hinter. **`main` is at `8b5f71b6`.**

**The confirmation on the runner is exact.** Before the fix it reported whole-pixel widths,
nine at 420 and one at 440. After it, all ten read **416.81**, fractional, and identical to
the development machine to the hundredth of a pixel. The integers were the hinter snapping
advances; with geometric metrics the two machines agree exactly.

### Every run this session produced, and what each one caught

Recorded in full rather than summarised, because **the point of this session's CI change is
that a red run now names its cause**, and a list of eight reds with eight distinct causes is
the evidence that it worked.

| Run | Commit | Verdict | The leg that reported, and what it found |
|---|---|---|---|
| 32232150425 | `dd1dc179` | failure | The baseline shrink, pre-fail-fast: one step reported and the rest were masked. |
| 32234729639 | `5900a97f` | failure | `static gates` and `browser: money fit`. The currency table gate was pinning the zero-decimal lying integer TASK 2 closed; two money-fit seeds had gone quiet under a narrower face. |
| 32236819626 | `daf84ce7` | cancelled | Superseded by the next push. |
| 32237102403 | `ef787233` | failure | `static gates` and `browser: popout conformance`. **The first run after the fail-fast change**, and it reported the TRUE failing step rather than stopping at the first: a hardcoded locale on a money formatter, and a 44px touch target that was only a coincidence. |
| 32239836000 | `ebc347b6` | failure | `static gates` alone: the win-precision allowlist, still treating `formatBalance` as the formatter to avoid. |
| 32240497823 | `250ad1d8` | failure | `browser: win count-up steady`: a lone glyph's box measured where the advance was meant. |
| 32242271451 | `6b1d61c6` | failure | `browser: social string conformance`: **a prohibited term on a stake.us surface.** The most player-facing defect of the session. |
| 32243985121 | `f0e04635` | failure | `browser: win count-up steady` again: the probe could not say which face it had measured. |
| 32245771243 | `464b601f` | cancelled | Superseded by the next push. |
| 32247203401 | `89373c0c` | **failure** | `browser: win count-up steady`, third form. **The diagnostic print landed here and named the cause.** |
| 32249483639 | `ffb41081` | cancelled | Superseded by the next push. |

### RUN 32250190643, on the tip `8b5f71b6`, FINAL VERDICT: SUCCESS

**30 of 30 jobs green, zero not-green, on attempt 2.** `static gates` carried **80 green
steps**, which is the figure the fail-fast change made meaningful: before it, a red at step
three meant the other seventy-seven were never asked. Every new leg this session added is in
that count and green: the static `precision law` pair, the static `evidence hygiene` pair,
the static `owner preview address` self-test, and the browser `control row symmetry` leg.

**Attempt 1 of the same run concluded `cancelled` and the reason is the timeout below, not a
defect**: five browser legs hit the 15-minute budget while nothing had reported a failure.
Re-run, all five green. **This is the run rule 10 is satisfied by**, and it is the tip, not
`89373c0c`.

### RUN 32253559815, on `9c83fba8`, the records commits' own push: SUCCESS

**Recorded per rule 10, which asks every session to verify its own FINAL push.** The report
above is itself a commit, so this run did not exist when the section was written; adding it
afterwards is the same one-commit lag rule 12 names for the preview, and the estate's own
practice is a follow-up record rather than a rewritten report.

**3 jobs: `what changed` green, `static gates` green at 80 steps, and the browser matrix
SKIPPED.** The skip is the correct result and not a gap: the `changes` job gates the matrix
on whether a push touched rendering, shipping or gate code, this push touched only record
files, and **the static job is never gated** because it carries the document currency gate,
the dash gate and the locked-paths gate. Filtering documents out of a documents-only push
would have disabled exactly the gates whose purpose is checking documents. A documents-only
push bills about 1.4 minutes against 24.1 for a full matrix.

### The 15-minute timeout, measured rather than guessed at, and NOT changed here

**Three of this session's eleven runs concluded `cancelled` and only one of those was a real
supersession.** `32236819626`, `32245771243` and `32249483639` were each superseded by the
next push, which is `concurrency: cancel-in-progress` working exactly as the workflow's own
comment says it will. **`32250190643` was not superseded by anything**, and its five
not-green legs tell a different story:

| Leg | Started | Ended | Elapsed |
|---|---|---|---|
| `browser: turbo intensity` | 11:59:39 | 12:14:54 | **15m 15s** |
| `browser: live settle failure` | 11:59:39 | 12:14:55 | **15m 16s** |
| `browser: retrigger moment` | 11:59:39 | 12:14:58 | **15m 19s** |
| `browser: popout conformance` | 12:01:04 | 12:16:20 | **15m 16s** |
| `browser: sub-cent display` | 12:01:22 | 12:16:42 | **15m 20s** |

**Five legs landing within five seconds of each other on a round number is not five slow
gates. It is one budget.** `checks.yml` sets `timeout-minutes: 15` on the browser matrix,
and **GitHub reports a timed-out job as `cancelled`, not as `failure`**, which is why this
reads at a glance like infrastructure noise. `browser: money fit` finished green in 8m 41s
in the same run, so the machine was working; the queue was heavily contended all session,
with waits of nineteen minutes observed between a run being created and its jobs starting.

**This is recorded and deliberately NOT fixed in this pass.** Raising a gate's time budget
in the same pass where the budget bit is the same anti-pattern as retuning a seed until it
passes, and this session refused that twice already on the money-fit seeds and on the
popout threshold. **It is named as an open thread instead**, with the measurement attached
so the next session does not have to rediscover that `cancelled` can mean `timed out`.

## The owner preview and the dist stamp, per rule 12 and the CLOSE

**The preview was refreshed BEFORE this report was written, which is what makes the line
evidence rather than an intention**, and its printed line at that point was:

```
OWNER PREVIEW  |  v10 line, main  |  commit 89373c0c  |  http://192.168.4.92:5173/
  address derived from interface en0 and confirmed reachable (1 candidate probed)
```

**That commit is one short of the tip and the reason is the design, not a fault.** Rule 12
records the one-commit lag in its own words: the report is itself a commit, so a preview
refreshed before the report is written is one behind the moment the report lands, and the
rule's answer is to run it once more as the LAST action of the close. **That is what
happens after this commit pushes**, and the address is unchanged either way because the
script derives it at run time and probes it rather than printing a remembered quad.

**The script refused a dirty tree while this report was being written**, listing the three
uncommitted record files and doing nothing, which is the behaviour convention (a) and rule
12 both ask for: a preview nobody has said is stale is worse than no preview.

**THE STAMP FOR THE OWNER'S SINGLE DIST SYNC.** The build at the tip:

```
v10  8b5f71b6  93 files  12,467,434 bytes  (11.89 MB against the 25 MB cap)
```

The upload source is `frontend/dist` directly, per convention (o.1); there is no Desktop
staging hop and no copy step to reconcile. **The build prunes 35 paths and 251.38 MB before
that figure**, which is what keeps the three dev-only theme trees and the concept-art source
out of the shipped artefact by construction rather than by anyone remembering.


## FOR THE NEXT SESSION

**Model and effort.** Opus, high effort, single session, integrator on `main` throughout.

**Approach.** Tasks in brief order with two deliberate departures. TASK 9's fail-fast change
was pulled forward in usefulness rather than in sequence: it landed ninth but every red
after it was legible in one run instead of one-per-round, and if a future brief mixes a CI
signal change with substantive work, **land the signal change first**. And the records sweep
in TASK 8 was done register by register with a first-hand recount before every cell, which
cost more than trusting the open register would have and is the only reason the sixteen
already-closed rows were not "corrected" into being wrong again.

**Alternatives tried and rejected.** (1) On the count-up gate, the first fix measured the
advance as a delta and was right but insufficient; the second found the probe had never
proved its face. **Both are kept in the record** because the first would have looked like
the whole answer to a later reader. (2) On the money-fit seeds, retuning by raising the
constraint until the gate went red was rejected; the seeds were retuned by MEASUREMENT with
the figures written beside them, because a seed tuned until it passes is not a seed.
(3) On BET_LEVELS, a casual fix inside the locked file was never on the table and the
disposition is a third case the brief did not name, surfaced rather than forced into one of
its two.

**Files touched.** Frontend source: `currency.ts`, `HudOverlay.svelte`, `BetSelector.svelte`,
`FeatureMenu.svelte`, `SessionPanel.svelte`, `WinBanner.svelte`,
`FreeSpinsPresentation.svelte`, `IntroSplash.svelte`, `app.css`, `main.ts`, `prose.ts`,
`package.json`. Gates: `precision_law_gate.mjs` (new), `currency_table_gate.mjs`,
`money_fit_gate.mjs`, `win_countup_steady_gate.mjs`, `control_row_symmetry_gate.mjs`,
`kit_basis_gate.mjs`, `hud_banner_spec_check.mjs`, `r057_subcent_proof.mjs`,
`social_string_conformance.mjs`, `winPrecision.test.ts`, `doc_currency_gate.mjs`.
Records: `CLAUDE.md`, `CLAUDE_PROJECT_INSTRUCTIONS_v8.md` (new, v7 archived),
`COMPLIANCE_WATCH.md`, `QUALITY_CHARTER.md`, `REVIEW_TRACKER.md`, `KNOWN_OPEN.md`,
`GUIDELINES_51_MAPPING_2026-08-13.md`, `AUDIT_CLOSURE_2026-08-10.md`, `HUD_SPEC.md`,
`checks.yml`.

**Open threads, in the order they are worth taking.**

1. **The owner's three decisions, all made, none pending.** Nothing in this session waits on
   a ruling that has already been given.
2. **Q6 is one paste** and nothing else will close it. Named in full above.
3. **The theme rasters**: 73 MB of dev-only art in the repository, an owner call on whether
   clone weight is worth deleting commissioned work that already cannot ship.
4. **The `--fs-font-numeric` consumers that are not money**: an art call, enumerated in
   TR-164.
5. **`popout_conformance`'s label and threshold disagree**, 44 named against 40 tested. A
   dedicated decision, deliberately not taken in the pass that made it pass.
6. **The locked-file debts now number six** and three of them are deletions waiting on the
   next sanctioned `gameStore.ts` pass: the four dead stores, the two dead derived stores,
   the six dead bet-ladder functions, and `canSpin`. `BET_LEVELS` itself STAYS.
7. **The browser matrix's 15-minute budget is too tight under contention**, and a timed-out
   job reports as `cancelled` rather than `failure`, so it reads as infrastructure noise.
   Five legs of run 32250190643 died within five seconds of each other on the round number.
   Measured and recorded above; deliberately not raised in the pass where it bit.
8. **The stale-record class is closed for now but has no gate.** Fifty-two cells went stale
   in about three weeks. Nothing in CI would say so today, and the four shapes are named in
   TR-163 if anyone wants to build one.

**Three branches await an owner decision rather than being deleted, and the reason is that
ruling (t.1) rule 2 covers AUTO-NAMED session heads and these are not auto-named.**
Recorded with their tips so any of them can be resurrected with `git branch <name> <tip>`:

| Branch | Tip | Unique commits vs main | State |
|---|---|---|---|
| `analysis/2026-08-15` | `aed054a1` | **0** | PR #124 MERGED. Nothing unique. |
| `track/standback-2026-08-15` | `7108da98` | **0** | PR #123 MERGED. Nothing unique. |
| `controlrow/2026-08-15` | `36562d54` | **3** | PR #125 CLOSED SUPERSEDED. Its intent is on main; the three commits are not. |

The first two are safe deletions by both the mechanical tests this estate uses, zero unique
commits AND tip is an ancestor of main. **The third is deliberately different**: its PR was
closed rather than merged, so its three commits exist nowhere else, and the
`collect-prototype` precedent in `CLAUDE.md` is exactly the warning against reading a closed
branch as disposable. **Deleting any of the three waits for the owner's OK in chat**, per
(t.1) rule 3.
