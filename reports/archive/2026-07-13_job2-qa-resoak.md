# Session Report: JOB 2 - QA re-soak, all five modes, frame-gate attribution

- **Date:** 2026-07-13
- **Model / effort:** Claude Sonnet 5, default effort.
- **Branch:** `claude/qa-resoak-job2` (off up-to-date `main`, with `claude/audio-integration-job1`
  merged in - JOB 2 depends on JOB 1 per the work order).
- **Source:** `FS_ConsolidatedWorkOrder_2026-07-13_Prompt.md`, JOB 2.

## What this delivers

### Pre-existing gates re-verified (not new, confirmed still correct)
`qa_soak.mjs` already had the cost-integrity gate (all five modes, exact integer-micros
debit), the cost-visibility gate (HUD badge + effective bet figure for non-base
standingMode), and the buy-affordability boundary gate (150x bet: Buy Overdrive enabled,
NITRO OVERDRIVE blocked) from the earlier Wiring Integrity Audit. All three re-ran clean
this pass - **zero failures across all three**, full results in
`reports/qa/cost-integrity-result.json`, `cost-visibility-result.json`,
`buy-affordability-boundary-result.json`.

### New: frame gate with attribution
`qa_soak.mjs`'s fps sampler previously only tracked frame deltas for an aggregate
avg-fps-vs-55 floor. Added: absolute timestamps per frame sample, a `logAction()` marker
pushed at every spin click and buy-confirm click, and `attributeLongFrames()` - for every
sampled frame gap over 100ms, finds the nearest logged action by absolute time and
reports the delta. Written to `reports/qa/frame-gate-attribution-2026-07-13.json`.

**Result this run: 5 frames over 100ms, none tightly coupled to a buy action.** The one
frame nearest in *magnitude* to the previously-observed ~150ms buy-moment hitch (149ms,
at t=198157ms) is 227ms away from its nearest logged spin-click - not a tight temporal
correlation. The one frame whose nearest logged event actually *was* a buy-confirm
(`buy-confirm-bonus`) is 3,421ms away from it - clearly unrelated, not the same hitch.
Three of the five (tMs 2929, 2177, 2512) land in the first ~3 seconds of their respective
page sessions, consistent with page-load/font-settling jank, not a gameplay-transaction
hitch. **Read plainly: the previously-flagged buy-moment hitch does not reproduce here in
a way attributable to any buy action** - this run's long frames look like generic,
low-frequency page-warm-up jank instead. Not claiming "fixed" (no rendering code was
touched to fix anything) - reporting the attribution data as measured.

### New: reduced-motion pass + reel-mode-toggle absence (both in `build_diet_verify.mjs`)
- Reel-mode toggle: `[data-testid="reel-mode-toggle"]` count asserted zero against the
  actual production `dist/` bundle (via `vite preview`) - it's gated behind the same
  `import.meta.env.DEV` block as the theme selector, so a real production build is the
  correct place to check its absence, not a dev-server assumption.
- Reduced-motion: `page.emulateMedia({ reducedMotion: 'reduce' })`, then asserts (a) the
  shipped CSS still contains the `prefers-reduced-motion` media query (not stripped by
  the build) and (b) a full spin completes with zero console errors under that
  preference. GameGrid.svelte's particle bursts are Pixi-drawn (canvas), not assertable
  via a DOM selector, so this checks the app functions correctly with the preference
  active rather than asserting a canvas-internal detail.
- **Both pass.** `reelModeToggleAbsentFromProdBundle: true`,
  `reducedMotion: { cssRulePresent: true, spinCompletedWithNoErrors: true }`.

### Refreshed: `layout_v1_audit.mjs`'s stale expected position values
Previous "expected" reference values dated to LAYOUT_SPEC v3.1, before the B1 HUD reskin
moved the panel/spin button - re-measured from the current build and updated:
`hudPanel` x 320->296, width 640->688; `spinCentre` x 970->1004; `instrumentColumn` height
added (376) and x corrected by 2px (1000->998, within normal rendering jitter). Occlusion
remains the only hard gate (unchanged) - these are reference numbers for a human comparing
deltas, not asserted against.

### Folded in: JOB 1's audio asserts
Re-ran `audio_verify.mjs` (built in JOB 1) fresh against this branch's merged build -
still ALL CHECKS PASS (spin/reel-stop/win sounds fire, bed swap fires on bonus buy and
reverts after the feature, every `/sounds/` request 200, zero console errors).

## Real bug found and fixed: vite dev-mode banner regex

`qa_soak.mjs`'s `startIsolatedDevServer()` waits for `/Local:/` in the spawned vite
process's stdout to know the server is ready. **This never matched, on any timeout
length** - inspected the raw stdout bytes and found vite 7.3.1's dev banner bolds "Local"
and resets *before* the colon: the literal bytes are `\x1b[1mLocal\x1b[22m:`. First
suspected a timing/contention issue (extended the timeout 15s -> 60s as a first attempt),
but the isolated server's own log showed vite printing "ready in 933ms" well inside even
the original 15s window on a run that still failed - proving the regex itself was the
problem, not the timeout. Fixed to `/Local/` (matching the same fix already applied to
`build_diet_verify.mjs` for `vite preview`'s banner - a different command, the same class
of bug, apparently introduced by whichever vite upgrade changed the banner's ANSI
styling). Kept the extended 60s timeout too since a longer wait is harmless on a
successful fast start and only helps under genuine contention.

## Full soak results

```
totalSpins: 1300, totalRoundsChecked: 1300
exactTotalMismatches: 0, balanceDrifts: 0, consoleErrors: 0
heapGrowthPct: 0 (19,300,000 bytes at both the 100th and 1,000th spin)
avgFpsSessionA: 58.79, avgFpsSessionB: 58.15, avgFpsOverall: 58.47 (floor: 55)
costIntegrityFailures: 0, costVisibilityFailures: 0, buyAffordabilityBoundaryOk: true
framesOver100ms: 5 (none tightly buy-attributed - see above)
```
`QA SOAK: ALL GATES PASS`. Matrix: 4 locales x 3 speed tiers x 2 social-mode settings,
drop reel mode (the shipping default) throughout.

## Verification

| Check | Result |
|---|---|
| `qa_soak.mjs` full run | ALL GATES PASS (1,300 spins) |
| `build_diet_verify.mjs` (reel-mode absence + reduced-motion) | ALL CHECKS PASS |
| `layout_v1_audit.mjs` | ALL OCCLUSION CHECKS PASS, positions refreshed |
| `audio_verify.mjs` (JOB 1, re-run fresh) | ALL CHECKS PASS |
| Locked-file diff | empty |

## Needs owner / Fable attention

- The frame-gate-attribution data suggests the previously-flagged ~150ms buy-moment hitch
  may have been session/environment noise rather than a reproducible transaction-specific
  cost - worth keeping an eye on in future soaks rather than treating as fully closed,
  since a 5-sample night isn't a large enough sample to rule out a rare recurrence.
- The vite dev-banner regex bug means `qa_soak.mjs`'s isolated-server startup had likely
  been silently broken (always falling through to the timeout) since whichever vite
  upgrade changed the banner styling - worth checking whether any other scripts in this
  repo have the same latent `/Local:/`-without-checking-raw-bytes assumption.

## FOR THE NEXT SESSION

- **Model/effort:** Claude Sonnet 5, default effort. **Approach:** rather than accepting
  "increase the timeout" as the fix once the first attempt still failed at 60s, inspected
  the raw stdout bytes directly (`repr()` of the log file) to find the actual ANSI-code
  root cause - the same discipline that found the `vite preview` version of this bug in an
  earlier session. Along the way, found and cleaned up several zombie `audio_verify.mjs`
  processes from earlier (apparently-completed) runs that were still running in the
  background consuming resources and contributing to the contention that first pointed
  toward a timing explanation.
- **Alternatives rejected:** stopping at the 60s-timeout fix once it didn't immediately
  resolve the issue on the very next attempt (rejected - re-checked the isolated server's
  own log first, which proved vite was ready well within even the original 15s, making a
  timeout-only explanation impossible); asserting reduced-motion behaviour via a DOM
  selector for the Pixi-drawn particle burst (rejected - not observable that way; checked
  CSS-rule presence and functional correctness under the preference instead, an honest
  proxy rather than a fabricated assertion).
- **Files touched:** `frontend/scripts/qa_soak.mjs` (frame-gate attribution +
  `logAction()`, the real `/Local/` regex fix, 60s startup timeout),
  `frontend/scripts/build_diet_verify.mjs` (reel-mode-toggle absence + reduced-motion
  pass), `frontend/scripts/layout_v1_audit.mjs` (refreshed expected positions),
  `reports/qa/{soak-1-summary.json, soak-1.log, session-a-result.json,
  session-b-result.json, cost-integrity-result.json, cost-visibility-result.json,
  buy-affordability-boundary-result.json, frame-gate-attribution-2026-07-13.json,
  isolated-server-a.log, build-diet-network-log.json}`, `reports/screens/layout-v1/*`
  (refreshed screenshots + audit-results.json), this report + its dated archive copy.
  Locked files untouched.
- **Open threads:** JOB 3 (compliance re-validation) is next, independent of JOBS 1/2;
  the buy-moment-hitch sample size is small (worth revisiting in a future soak, not
  claimed definitively resolved); worth auditing other scripts for the same vite-banner
  regex assumption.
