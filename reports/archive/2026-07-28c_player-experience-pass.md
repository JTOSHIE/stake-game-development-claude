# 2026-07-28c: THE PLAYER EXPERIENCE PASS, four owner-ordered jobs

**Brief:** `reports/briefs/FS_PLAYER_EXPERIENCE_PASS_Prompt.md`, saved verbatim and
committed with JOB 1 per conventions (b) and (f).

**Posture:** fresh session on `main`, integrator, explicit paths, commit per job, no lock
exceptions taken and one requested. Four jobs, ordered by the brief so that an honest stop
leaves whole work, which is exactly what happened: three shipped in the first pass, and the fourth was designed, then built on the
owner's instruction once the design was on the record.

**Multi-track rule 4 asks a multi-job session to justify itself.** JOB 1 gates the owner's
trust in everything after it, JOBS 2 and 3 are single named player surfaces with their own
gates, and JOB 4 was written to be stopped at, which is why its design was committed and reviewed
before a line of it was built.

| Job | Commit | Gate added |
|---|---|---|
| 1, V7 reconciliation | `7d1c6b1` | (document) |
| 2, max-win hold | `86d2833` | `max_win_hold_gate.mjs` |
| 3, bet selector | `3610eb7` | `bet_selector_gate.mjs` |
| 3 fix, green main | `576e276` | (markup fix + design doc) |
| 4, feature resume | `5b8471b` | two model and flow suites |
| 5, close | this report | |

## Headline

**Nothing player-facing had changed since kit V7 was built**, and that is now proved rather
than assumed: `git diff --name-only 6e9e4739..HEAD` returned fifteen files and not one was
under `frontend/`. Every player-visible fix the repository knew about was already in the kit
on the owner's desktop.

**The max-win celebration held correctly and six things moved behind it**, one of which
placed a real wallet bet from a keystroke and dismissed the celebration with no COLLECT.

**The BET window became a control**, driven by the platform's own ladder, proven at three
viewports against a ladder sharing no value with ours.

**Four new tracker rows came out of running the existing suites rather than out of the
briefed work**, and one of them, TR-096, is a responsible-gambling control failing open.

## JOB 1: the V7 reconciliation ledger

`docs/records/V7_RECONCILIATION.md`. Sixty six findings reconciled against the kit V7 build
SHA `6e9e4739` by evidence: Q-01 to Q-34, TR-086 to TR-092, the nineteen formerly frozen
locale entries, and the five visual fixpack rows. **47 SHIPPED IN V7, 1 FIXED POST-V7, 11
OPEN, 7 NOT A DEFECT.**

**Method, and the three things it refused to do.** Ancestry alone never earned a SHIPPED
verdict: the fixed form had to be present in the V7 tree and the defective form absent, and
where the two disagreed the tree won (FROZEN-19 is the worked case). Every verdict was
adversarially re-checked by an agent instructed to refute it, which changed a verdict,
corrected line numbers and quoted strings in a dozen rows, and caught a multiplication sign
transcribed as a letter `x`. And two verifier runs reached OPPOSITE verdicts on Q-29, which
was settled by reading the source rather than by vote.

**Q-29 is the finding worth the pass.** It recorded three loose claims in the quality charter
and closed with "the sentence is what is qualified". The sentence at
`docs/QUALITY_CHARTER.md:424` is not qualified, and that file is unchanged since V7, so
HEAD's state is V7's state. **Q-29 reproduced the exact defect it names in Q-20**, a
disposition that describes a state as if it were an action. Raised as **TR-093**, the only
finding in the set whose fix is not on main.

**The frozen-entry count that three documents give three ways** is recorded rather than
picked: the committed `KNOWN_DEBT` set holds eighteen, its `DEV_ONLY` sibling holds the
nineteenth, and the comment above the set says twenty. Eighteen plus one is the nineteen the
brief and TR-091 both name; the comment does not describe the list it introduces.

**Convention (q) was applied.** The workflow reported two dead verifiers on a usage limit and
was RESUMED before anything else was done, per the standing rule. The epoch was checked first
and was intact. The resume cost nothing and the layer that came back is the layer that
changed a verdict, which is precisely the argument the convention is built on.

**Read-only discipline held.** All sixteen agents ran git and grep only, ran no project
script, and reported `git status --porcelain` in their own output schema. All sixteen
reported clean.

## JOB 2: the max win holds, and the six things behind it

**The overlay was never the problem.** `MaxWinCelebration` carries no timer, and
`waitForWincapCollect()` is resolved by nothing but the collect handler.

**The worst finding came from the adversarial layer, after the hunting agent had looked at
the same code and concluded the scrim was a sufficient barrier.** A scrim stops a pointer and
nothing else. `isSpinning` is already false while the celebration holds, the balance has just
been credited a 5,000x win so `canSpin` is true, and the SPIN button is `disabled=false` and
still tabbable under the z150 scrim. SPACE on a focused button is activated by the BROWSER,
and App.svelte's keydown handler cannot prevent it because every guard returns before
`e.preventDefault()`.

**Measured, not argued.** The gate focuses SPIN mid-hold and presses SPACE. Before the fix
that produced one `/wallet/play`, one `/wallet/end-round`, WIN reset from `$5,000.00` to
`$0.00`, and the celebration GONE with no COLLECT, because the new round's settle calls
`isWincap.set(false)` unconditionally. The first round's promise was then left with no
resolver, so that round could never finish. Guarded at the ACTION rather than at each
control, plus the control disabled by state at all four layout branches.

The other five: the App-level WinBanner firing and self-dismissing under the overlay on every
capped round; WinBreakdown cycling a 1400ms interval with no natural end; GameGrid's 4000ms
win-burst teardown firing 1.4s INTO the hold and stripping the board the celebration sits
over; ReplayMode re-raising the celebration after the player collected and then running a
2000ms settle and the phase change behind it; and the HUD win count-up ticking underneath,
measured at `$3,841.92` on mount and `$5,000.00` thirty seconds later.

**The banner fix is a round-long flag, not `$isWincap`**, and the difference matters: the
collect handler clears that store before resolving, so an `$isWincap` guard would have moved
the banner to just after COLLECT rather than removing it.

**The big and epic banners are deliberately untouched**, per the brief's own condition that
the guarantee extends to them only if they already gate on input. They do not: `WinBanner`
has no `on:click`, no `on:keydown`, no window listener, no `role` and no `tabindex`, and its
single exit is the dismiss timer at `:181` (3.6s, 4.2s and 5.0s by tier).

**The measured assertion the brief asked for**, from the passing run: celebration mounted, 30
seconds elapsed, still mounted, no banner across sixty samples, BALANCE and WIN
byte-identical, no `/wallet/play` and no `/wallet/end-round` including after the SPACE probe,
then a real COLLECT click proceeds cleanly.

**The gate corrected two of my own errors on the way**, which is the best argument for
building it before believing the fix: it caught that ENTER legitimately collects, so pressing
it in the probe was testing the rule's positive half, and that focus now sits on COLLECT, so
SPACE there is a player collecting. Ten static seeds and two runtime seeds, all watched
failing before the PASS was believed.

## JOB 3: the BET window opens a denomination picker

Tapping the BET readout opens a panel listing every level the platform authorised. **The
ladder is never hardcoded**: it renders `activeBetLevels`, the same single source
`betLadder.ts` already gives the arrows, so the panel and the arrows cannot disagree, which
is the R5/TR-013 defect class. The arrows are unchanged and remain the fine adjustment.

**minStep holds by construction**, and the claim is deliberately narrow: the panel cannot
express a value that is not already on the ladder, and `setBetLevel()` refuses anything
`activeBetLevels` does not contain. Nothing rounds, interpolates or synthesises an amount.

**Effective cost: plain levels**, with the reasoning recorded rather than just the choice.
The list IS the ladder and those numbers are what `play` sends as `amount`, so printing 1.25
beside a level of 1.00 puts a figure in the list the player cannot select and the RGS never
sees; two money figures per row differing by a quiet 1.25x is exactly the "formats that
disagree" tell the standing mandate names; and the readout has carried the ante-adjusted
figure since the 2026-07-07 cost-visibility ruling. The panel states the multiplier once, in
a footer shown only while one is in force.

**One measured surprise, and it is why the touch-target claim is worth anything.** The first
run reported the level buttons at **41.3px against a 44px floor** despite `min-height: 44px`.
`.game-wrapper` carries `transform: scale(S)`, making it the containing block for fixed
descendants AND scaling them: 44 x 0.9375 = 41.25. The panel now counter-scales by
`--scrim-scale` and measures 44.0px at all three profiles. A `min-height` alone would have
shipped a floor that was not a floor.

## The red main, and the gate that measured the wrong element

Run 30299061427 went red on `browser: layout fit`. **Nothing was clipping.**
`layout_fit_gate.mjs:199` picks the deepest text-bearing node with
`querySelector('.m-stat-val, .stat-value, span, div') || el`. Promoting the BET readout from
a `<span>` to a `<button>` matched none of those four, so the gate silently stopped measuring
the value and started measuring the whole container, whose 99px `scrollWidth` is the two bet
steppers each carrying 32px of SVG in a 22px box, pre-existing geometry the gate had never
looked at.

Confirmed at both commits rather than argued: at `86d2833` Popout S reports `controls=8
clipped=0` and passes; with JOB 3 it reports `controls=9 clipped=1`. Fixed in the markup so
the gate gets back the text node it looks for. **The gate itself is still wrong and that half
is open as TR-098**, the same shape as TR-091's regex blind spot.

**A near-miss worth recording.** Diagnosing it used `git checkout 86d2833 -- frontend/src` to
measure the pre-JOB-3 build. That command writes to the INDEX as well as the working tree, so
after restoring the working tree from a backup, `translations.ts` and `betLadder.ts` sat with
the pre-JOB-3 content STAGED: a commit at that moment would have silently reverted 69 lines
of JOB 3, including the sixteen locales' new keys. Caught by reading `git diff --cached
--stat` before committing rather than trusting `git status`'s two-column output. **A
diagnostic checkout of a tracked path is an index write, and the check that catches it is
looking at what is actually staged.**

## JOB 4: feature resume, designed then built

`docs/design/FEATURE_RESUME_DESIGN.md` first, unchanged by the build, then
**TR-099 shipped on the owner's instruction.**

**The design in one sentence:** persist a presentation CURSOR, never presentation
CONTENT, keyed by `betID`; on recovery of an active round whose `betID` matches, offer RESUME
and play the canonical script forward from that cursor.

**The single idea that makes it safe** is that what is stored is an INDEX. Every number the
player then sees is read out of `script.freeSpins[i]`, freshly interpreted on the recovering
boot, because `FreeSpinsPresentation.nextSpin()` already derives the meter, the running total
and the spins remaining from the script. Divergence from the round's true figures is
therefore structurally impossible rather than carefully avoided, and that is what makes
localStorage acceptable at all: the store is player-editable, and the worst a forged
checkpoint can do is skip part of an animation of the player's own round. The persisted
totals are kept only as a checksum, never rendered.

**Five pieces:** the non-locked `stores/presentationCheckpoint.ts`; `startFrom(index)` on
`FreeSpinsPresentation`; checkpoint writes at the entry gate and at every spin boundary,
cleared on end, on finish and on settle; `ResumeOffer.svelte`; and the offer threaded through
`recoverSession` as an injectable callback so the flow stays testable.

**The matrix is green, and it is two suites on purpose**, both added to CI.
`presentationCheckpoint.test.ts` proves the validator REFUSES what it should, against a real
triggered round from the shipped book, and **each case asserts WHICH guard fired**, because a
validator that rejects everything for the wrong reason passes a boolean test and is still
broken. `featureResume.test.ts` proves `recoverSession` does the right thing with that
answer, **asserted by call ORDER rather than by independent spies**: the offer is made before
anything is presented, and the round is presented before it is settled, resumed or not.

**Three things the build added that the design did not anticipate.** `$tr` never passed
interpolation params through, although `t()` has always interpolated `{name}` placeholders,
so a sentence with a value in it had to be assembled in markup, which is how a player-visible
string ends up half translated. `checkpointBetID` defaults to NULL, disabling checkpointing,
because the warm mount, Bet Replay and mock rounds all present a script that is not a live
open round. And a recovered feature now checkpoints as it plays, so a player who reloads a
SECOND time in the same round resumes again rather than being sent back to spin one.

**One existing assertion updated rather than deleted.** `sessionRecovery.test.ts` pinned the
exact three-argument call. Its intent is that recovery is not silently a no-op, and that
intent is now LARGER: both callbacks default to a no-op, so a missing argument is not a
compile error but a silently dead feature. Both are named.

**Mid-ordinary-spin keeps the existing resume-and-settle**, per the brief: a base spin is one
reveal, and there is no "where you left off" to return to.

## Four rows that came out of running the existing suites

None of these was in the brief, and all four came from checking the work against the suites
already in the repository.

- **TR-096, and it is the serious one.** The infinite-autoplay option stays visible when a
  jurisdiction caps autoplay, while the committed evidence records it hidden. **Attributed by
  measurement**: a standalone probe was run twice against a dev server, once with this pass's
  source and once with `git stash push -- frontend/src` so the tree was HEAD, and both
  returned `capped: true, pass: false` byte for byte. **PRE-EXISTING.** A responsible
  gambling control failing open, escalated per convention (l.8) rather than ruled on here.
  Not caught by CI, because that suite is not one of the nine jobs `checks.yml` runs.
- **TR-097.** TR-090 names two scripts that write into committed evidence. There are at least
  two more: running `popout_conformance.mjs` and `portrait_layout_conformance.mjs` once each
  modified **eleven committed files**. All restored from HEAD, none committed.
- **TR-098.** The layout fit gate's element-selection fallback, above.
- **TR-099.** The feature-resume park.

**Also measured and left alone:** the frame gates in the portrait suite are load-sensitive.
`splashFrameGate` failed on one run and passed on the next with no code change, `sampleCount`
fell from 85 to 36 under contention, and `reducedMotionFrameGate` was already failing at
HEAD. They are not attributed to this pass and are not claimed clean either.

## Self-audit against the brief (facts discipline point 4)

| The brief asked | Done |
|---|---|
| Brief saved verbatim to `reports/briefs/` and committed | Yes, with JOB 1 |
| On main, explicit paths, commit per job | Yes, four commits, every path staged by name |
| No em or en dashes | Verified zero in every file this pass wrote |
| No lock exceptions; anything needing a locked file parked with a NAMED sanction request | Yes. One requested: `frontend/src/lib/services/rgsService.ts`, one additive line publishing `stepBet`, in TR-095 |
| Stop between jobs, never inside one | Yes. Every commit is one whole job; JOB 4 stopped at its design boundary, and the build resumed from there as its own job |
| JOB 1 verdicts by evidence, owner section listing only FIXED POST-V7 and OPEN | Yes |
| Any finding whose fix is not on main becomes a tracker row | Yes, TR-093 |
| JOB 2 measured assertion, seeded per convention (p) | Yes, twelve seeds watched failing |
| JOB 3 captures at three viewports, ladder-driven test, conformance suites green | Yes, with two pre-existing suite failures attributed by measurement and recorded |
| JOB 4 designed before built | Yes. The design was committed and reviewed first, then built against unchanged |

**One deviation, recorded in the ledger itself:** the brief scoped Q-01 through Q-29 and the
ledger carries Q-01 through Q-34, because sections 4.2c and 4.2d hold five further findings
in the same numbering and two of them are OPEN. Dropping real findings to match a stated
range is the incompleteness Q-29 and Q-33 exist to correct.

### FOR THE NEXT SESSION

**Model and effort.** Opus 5 at high effort, integrator on `main`.

**Kit V8 is BUILT**, at `e0c30611`, carrying JOBS 2, 3 and 4. See the records pass section
above. What remains is the owner's: upload it and run PART 9g, whose LOOK half is the live
confirmation TR-099 is waiting on.

**TR-099, feature resume, is DONE.** Designed, built, both matrices green and in CI. What
remains on it is the owner's: live confirmation at the portal, below.

**Ahead of it in severity, TR-096**, the infinite-autoplay option failing open under a
jurisdiction cap. It is a responsible-gambling control, it is pre-existing, it is not covered
by CI, and convention (l.8) sends it to the owner and Fable with the evidence attached rather
than to a builder's judgement.

**Cheap and worth doing together:** TR-097 (two more scripts writing into committed evidence,
a one-pass migration to `evidenceDir()`), TR-098 (the layout fit gate's silent fallback), and
TR-093 (one sentence in the quality charter, or a reworded disposition).

**Owner actions unchanged and still the highest value.** `OWNER_CHECKLIST.md` item 1b, the
publish-and-read-the-SHA visit that ends "which build is live". And per the brief, **live
confirmation of feature resume at the portal is the owner's next-visit item** when that job
lands; `DTT_PROTOCOL.md` item 5 is the slot.

**Alternatives tried and rejected.**

- *Suppressing the win banner on `$isWincap`.* Rejected after tracing the ordering: the
  collect handler clears that store before resolving, so it would have moved the banner to
  just after COLLECT rather than removing it. A round-long flag instead.
- *Making the whole BET box a button.* Rejected: the portrait, mini and compact profiles put
  the steppers inside that box, and a button inside a button is invalid.
- *Ante-adjusted figures beside each level.* Rejected on three grounds, recorded in TR-095.
- *`inert` on the stage during the max-win hold.* Rejected for this pass: `MaxWinCelebration`
  is inside `.game-wrapper`, so the attribute would have to go on its siblings rather than on
  one container, and that is an accessibility change across a surface this job did not
  otherwise touch. Focus is moved to COLLECT instead, which makes ENTER unambiguous, and the
  full trap is recorded in TR-094.
- *Widening the layout fit gate to accept a `<button>`.* Rejected as the immediate fix:
  relaxing an instrument to match new markup is how a gate stops meaning anything. The markup
  gives it back the text node it looks for, and the gate's real defect is recorded separately
  as TR-098 so it is fixed as a gate question rather than as a side effect.
- *Building JOB 4 before its design was committed.* Rejected: the brief said designed before
  built, and the design is what the build was then judged against rather than the other way
  round. It went in unchanged, which is the argument for the order.

## The records pass: kit V8

Assembled after the merge, as the brief's FOR THE NEXT SESSION said it would be.

`~/Desktop/FS_UPLOAD_KIT_V8/`, built by `scripts/kit_build.mjs --version 8` from a FRESH
CLONE per convention (o), at `e0c30611`, clean tree. **110 files, 15,633,567 bytes.** All
three dist gates run IN THE CLONE and green.

**Verified independently of the builder's own report**, because a builder that reports its
own success is one number rather than two: measured on disk at 110 files and 15,633,567
bytes, and the bundle's own `build-info.json` says 109 files and 15,633,186 bytes EXCLUDING
ITSELF, which reconciles exactly once its own 381 bytes are added back.

**All four player-visible commits of this pass are ancestors of the kit commit**, confirmed
by `git merge-base --is-ancestor`. `docs/records/V7_RECONCILIATION.md` section 1 listed what
V7 could not show; this kit closes the two largest entries by shipping rather than by
argument.

**THE DEFECT FOUND WHILE ASSEMBLING.** `kit_build.mjs` wrote the literal `PART 9e` into every
kit README and had done since V5. The walkthrough moved to PART 9f with V7, and 9f's own
heading now reads SUPERSEDED, DO NOT RUN. **So V5, V6 and V7 each handed the owner a README
pointing at a section the document itself says not to run**, and nobody noticed because a
README looks correct until somebody follows it. Fixed at the cause: the part is DERIVED from
the walkthrough in the clone, and it THROWS rather than falling back, because a kit whose
README cannot name its own visit is worse than no kit. Four new convention (p) seeds, nine
in total, all watched failing. TR-100.

**PART 9g is the V8 visit.** It keeps 9f's full-kit reconcile and SHA capture, then adds a
two-minute LOOK half, because this is the first kit whose changes a player can see: tap the
BET window and check the levels are the platform's own for that currency, and leave a bonus
half way through and reload. **That reload is the live confirmation TR-099 is waiting on.**
The walkthrough says plainly that the prompt NOT appearing is the useful result rather than a
failure, and that the round settles and pays either way. An owner told what a negative result
means reports one; an owner told only what success looks like assumes they did it wrong.

**Left for the owner, deliberately:** `~/Desktop/FS_UPLOAD_KIT/` and `FS_UPLOAD_KIT_V7/` are
both still on the Desktop and both dead. Not deleted by this pass, because that is the
owner's machine; PART 9g asks for it at step 7.


## What was still running at the end, and why it is on the record

Asked at close: what is still going. The answer for this session's own work is **nothing**,
and `git status` was clean throughout, so no committed evidence was touched. But auditing it
found something worth a row.

**Every browser gate leaks its `vite preview` server.** They spawn it detached and reap it
with a process-GROUP `SIGTERM`, and the group signal does not reliably reach it. Measured at
close: **seven leaked preview servers, fourteen processes, holding eighteen ports**, plus two
orphaned chromium groups. Both gates this pass added copied the pattern from the existing
ones, so it is a defect in the gate FAMILY rather than in any one script.

**The worse half is already documented in the codebase as a symptom without being recognised
as a cause.** `layout_fit_gate.mjs`'s hard-timeout comment says it exactly: killing the `npx`
wrapper orphans the real vite child, whose inherited stdout pipe holds the process's event
loop open. So a gate that FAILS mid-run can hang forever. Found running: a
`portrait_layout_conformance.mjs` process from a PREVIOUS session, **hung for 1 day 9 hours**
with five chromium attached, whose log last wrote two days earlier and ends in a
`TimeoutError`. Dead for two days, still holding a browser.

**This is probably part of the frame-gate noise this pass recorded and could not attribute.**
`sampleCount` fell from 85 to 36 and `splashFrameGate` flipped between two runs with no code
change. A gate whose result depends on how many corpses are on the machine reports noise, and
some of those corpses were ours. TR-101, with the three fix options; serving `dist/` from a
`node:http` server inside the gate process is the one that removes the class rather than the
instance.

Cleaned up on the owner's instruction: the hung run, its chromium, every leaked preview and
the orphaned chromium groups terminated; the two `vite --host` dev servers deliberately left
alone. Nothing in the repository changed.


## TR-101 resolved: the orphanable child is deleted, not managed

Fable ruled option (c) on the preview leak. `frontend/scripts/lib/previewServer.mjs` serves
`dist/` over `node:http` from inside the gate process. No `npx`, no vite child, no process
group, nothing that can survive the script. **Adopted across the whole family, all eighteen
scripts, in one pass.**

**Port-reaping was never written.** The ruling approved it only as a temporary guard during a
staged migration, to be removed by the pass that completed it. This completed in one pass, so
there was no window for it to cover, and adding then deleting it would have been ceremony.
Recorded because the ruling named it: its absence is deliberate.

**Two further defects found while migrating, both now impossible rather than fixed.** Three
scripts never called `killPreview` at all and leaked on every run; under option (c) forgetting
to close costs nothing, because the server dies with the process. And four hardcoded a fixed
port, so two running at once fought over it and the second died on `--strictPort`; the kernel
now picks and reports, which also deletes the old `getFreePort()` race where a socket was
opened, closed, and the number handed to a process that bound it a second later.

**The assertion asserts and does not clean up**, because killing there would hide the defect
it reports. It carries a two second grace, since `browser.close()` resolves when playwright
has told chromium to go rather than when the kernel has reaped it, and a gate that goes red at
random teaches everyone to ignore it. Two seconds cannot hide a leak that lasts hours.

**MEASURED AFTER THE MIGRATION: fourteen gate runs, ZERO leaked processes.** Before it, every
run leaked one.


## Rule 10 closing

**Final push, run 30300598617 on `576e276`, GREEN on all ten jobs.**
https://github.com/JTOSHIE/stake-game-development-claude/actions/runs/30300598617

    static gates                    78s      browser: contrast            80s
    browser: bet selector           72s      browser: layout fit          78s
    browser: win count-up steady    76s      browser: turbo intensity    105s
    browser: paytable card fill    115s      browser: max-win hold       130s
    browser: splash calm           153s      browser: scrim coverage     168s

**Ten jobs now, up from eight**, the two additions being this pass's own gates. Browser
wall-clock 168 seconds, at the fast end of the 2.9 to 4.6 minute range recorded beside rule
10, so the two new legs cost nothing measurable: they run in parallel with the rest and
neither is the slowest. `max-win hold` holds a real capped round for thirty seconds and still
lands at 130s, well inside the pack, because the hold overlaps every other leg.

**Every run this session accounted for, including the red.**

- 30295533947 on `86d2833`, GREEN on nine, JOBS 1 and 2.
- 30299061427 on `3610eb7`, **RED on `browser: layout fit`**, JOB 3. Diagnosed as a false
  positive from the gate's own element-selection fallback, root-caused by measuring at both
  commits, fixed in `576e276`, and recorded as TR-098. **The line stopped until it was
  green**, and no new job was started in between.
- 30300598617 on `576e276`, GREEN on ten. The closing run.

- 30300914468 on `3635615`, GREEN on ten. The first close of this pass.
- 30303248840 on `5b8471b`, GREEN on ten, **JOB 4 built**. `static gates` 76s, carrying the
  two new feature-resume suites; browser wall-clock 166s, unchanged, because the additions
  are node suites in the static leg rather than browser legs.

**The closing run is verified after the push rather than assumed, which is what rule 10
actually asks for.**

The red is on the record rather than tidied away, because rule 10's whole value is that a red
run means something.
