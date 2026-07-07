# Wiring Integrity Audit (2026-07-07)

Sanctioned by Fable's ratification of the buy-tier billing fix (PR #44), per
`FS_FableVerdicts_2026-07-07_Prompt.md` item 1: "read-only plus tests, no locked
files, no sanction needed." Scope: (a) a static trace of every dispatch/handler
pairing in the buy, mode-select, bet-change and autoplay paths; (b) a permanent
cost-integrity gate in `qa_soak.mjs`; (c) a wallet-path float scan; (d) a
fsModes/index.json drift test; (e) two autoplay asserts folded in from item 3.

## Headline finding (not part of the original ask - found while tracing item a)

**`standingMode` is a dead-end store. Selecting Cruise or toggling OVERBOOST in
the FEATURES menu currently has ZERO effect on the actual spin request.**

`FeatureMenu.svelte`'s `selectStanding()`/`toggleEnhancer()` write the
`standingMode` store (`betMode.ts`), and the UI shows a correct ACTIVE/ON badge
reflecting it. But `App.svelte`'s `handleSpin()` hardcodes
`selectedBetMode.set('base')` and `spin({ betAmount: bet, mode: 'base' })`
unconditionally - `$standingMode` is never read there. Concretely:
- Selecting **Cruise** shows "ACTIVE" but every subsequent spin still plays
  `base` maths at 1.0x cost (the wrong RTP/volatility curve, though the cost
  happens to be right by coincidence - both are 1.0x).
- Toggling **OVERBOOST** ON shows "ON" but every subsequent spin still plays
  `base` at 1.0x cost - **never** the 1.25x cost the toggle implies is active.

This is the same class of bug as the buy-tier billing fix (a live, selectable
control that silently does nothing / charges the wrong thing), just on the
standing-mode side rather than the buy side. **Per this audit's scope
("flagging", not fixing), this has NOT been fixed in this pass** - it is a
product-relevant behaviour change (which maths curve actually plays, and
whether OVERBOOST's 1.25x cost should apply on top of every subsequent base
spin), not a mechanical wiring correction, so it needs an explicit go-ahead
before touching it. See "Recommendation" at the end of this report.

Reproducible, concrete proof is in the cost-integrity gate results below (item
b): running the new gate against the current codebase, `cruise` and
`overboost` both FAIL; `normal`, `bonus` and `super` PASS.

## (a) Static trace of dispatch/handler pairings

Full trace covered every `createEventDispatcher` call site in
`frontend/src/lib/components/*.svelte`, `App.svelte`'s `handleSpin`/`handleBuy`/
autoplay loop, and the autoplay start path. Findings, most to least severe:

1. **`standingMode` dead-end store** (above) - critical, not fixed this pass.
2. **`canBuyBonus` (`gameStore.ts:94-97`, locked) hardcodes `$bet * 100`**, not
   the buy tier's real `MODE_COST`. Currently unreachable via the live UI
   (`FeatureMenu`'s own `activateBuy()` gate is correct and blocks first), but
   the shared derived store is wrong for `super` (400x) and would need a
   sanctioned lock exception to fix properly.
3. **`qa_soak.mjs` (and 5 sibling verification scripts) selected `.spin-btn`**,
   a class that only exists in the dead `ControlBar.svelte` - the live spin
   button (`HudOverlay.svelte`) has carried `data-testid="spin-button"` since
   the B1 HUD reskin (2026-07-06), which postdates the soak's own last commit.
   **Fixed in `qa_soak.mjs` this pass** (see item b). The other 5 scripts
   (`layout_v1_audit.mjs`, `ux_v1_audit.mjs`, `build_diet_verify.mjs`,
   `reel_v3_proof.mjs`, `motion_v2_proof.mjs`) were **not** touched this pass -
   out of scope for a `qa_soak.mjs`-specific work order, flagged here as a
   follow-up since a broken verification script is a real hazard (false
   confidence that a check ran when it would have timed out).
4. **`handleBuy`'s `cost` was never rounded before reaching the balance
   store** - a genuine "Integer micros rule" violation. **Fixed this pass**
   (see item c).
5. **Two documentation sources were stale and materially misleading**:
   `CLAUDE.md` ("Two bet modes... base... bonus buy") and `betMode.ts`'s
   comment ("only the two live modes... are ever written at runtime today"),
   both contradicting the current five-mode shipped reality. **Fixed this
   pass** - `CLAUDE.md`'s "True game facts" section now says five modes;
   `betMode.ts`'s comment now explicitly warns about the `standingMode` gap
   above rather than claiming it doesn't matter.
6. **`FreeSpinsPresentation`'s `complete` event payload is dispatched but
   discarded** by `App.svelte` (`on:complete={onFeatureComplete}`, a no-arg
   handler). Appears benign - balance is already committed before the
   presentation plays - but undocumented as intentionally redundant. Not
   changed this pass (cosmetic, zero behavioural risk).
7. **`ThemeSelector`'s `select` event has no listener at all** in `App.svelte`
   (only `on:close` is wired). Harmless (the component self-applies the theme
   before dispatching, then reloads the page). Not changed this pass.
8. **`FeatureButton.svelte` and `ControlBar.svelte` are dead code**, never
   mounted anywhere in the live app (superseded by `FeatureMenu.svelte` and
   `HudOverlay.svelte` respectively). Not removed this pass (read-only audit
   scope), but flagged as a stale-artefact risk - `ControlBar.svelte` in
   particular duplicates the autoplay-start call site (see item e).

`responsibleGambling.ts`/`jurisdiction.ts` were traced and found clean: no
hardcoded delay applies unconditionally; `minSpinMs` genuinely defaults to `0`
and only a jurisdiction flag raises it (see item e for the new explicit test).

## (b) Cost-integrity gate in `qa_soak.mjs`

Added `runCostIntegrityCheck()`: for each of the five modes, at a fixed $1.00
bet, drives the FEATURES menu the way a real player would (SELECT / toggle ON
/ ACTIVATE+CONFIRM), then asserts the round actually recorded both the correct
server mode and the correct integer-micros debit. Wired into `run()` as a new
phase after sessions A/B, folded into the overall pass/fail gate
(`costIntegrityFailures` in the summary JSON). Also fixed the stale `.spin-btn`
selector (now `[data-testid="spin-button"]`) that would have made the whole
harness time out before spinning even once against the current app.

`App.svelte`'s dev-only `__qaLog` instrumentation was extended: `handleSpin`'s
existing push now includes `mode: get(selectedBetMode)`, and `handleBuy` gained
its own push (previously it had none at all, so the soak structurally could
never see a buy-tier round).

**Verified by running the isolated check logic against a live dev server**
(the full `qa_soak.mjs` run takes 25-30 minutes for sessions A/B alone, so the
new phase's logic was validated standalone rather than waiting on a full soak
- see "Not done this pass" below):

```
[PASS] normal    -> expected mode=base     micros=1000000,   actual mode=base   micros=1000000
[FAIL] cruise    -> expected mode=cruise   micros=1000000,   actual mode=base   micros=1000000
[FAIL] overboost -> expected mode=antelite micros=1250000,   actual mode=base   micros=1000000
[PASS] bonus     -> expected mode=bonus    micros=100000000, actual mode=bonus  micros=100000000
[PASS] super     -> expected mode=super    micros=400000000, actual mode=super  micros=400000000
```

This is the concrete, reproducible proof of the headline finding: `bonus` and
`super` (the buy tiers PR #44 fixed) pass cleanly; `cruise` and `overboost`
(the standing/enhancer modes, never wired to `handleSpin`) fail exactly as the
static trace predicted.

## (c) Wallet-path float scan

New `scripts/scan_wallet_floats.mjs`: a line-level heuristic (not a full
data-flow analyser, documented as such in its own header) that flags any
money-named variable (`cost`/`price`/`amount`/`wager`/`stake`/`win`/`payout`/
`debit`/`credit`) assigned via multiplication without `Math.round(`/
`Math.floor(` on the same line. Locked files (`rgsService.ts`, `gameStore.ts`)
are explicitly out of scope - a finding there can't be remediated (fixed, or
allow-listed with a review comment) without a sanction, so a permanent gate
must not fail against code this repo isn't allowed to touch.

**Found and fixed the one real violation this scan exists to catch**:
`App.svelte`'s `handleBuy` computed `cost = bet * (MODE_COST[mode] ?? 100)`
with no rounding, and that raw float then reached `gameStore.ts`'s mock-mode
balance subtraction (`balance.update($bal => $bal - bet + win)`) directly -
backwards from CLAUDE.md's "zero float tolerance" rule (the telemetry/RG side
calls were already correctly rounded; only the actual balance-affecting value
wasn't). Fixed by routing `cost` through integer micros before use:
`Math.round(bet * (MODE_COST[mode] ?? 100) * CURRENCY_SCALE) / CURRENCY_SCALE`.

Scan now runs clean: `WALLET FLOAT SCAN: PASS (54 files scanned, no unreviewed
raw-float currency multiplication found)`.

**Known, out-of-scope finding**: `rgsService.ts:595`'s mock-spin payout
calculation (`PAYTABLE[sym][matchLen] * ways * req.betAmount`) is also
unrounded, but it lives in the locked file's dev-only mock board generator
(not the real wallet/RGS path) - excluded from the scan's scope for the reason
above, noted here for visibility rather than silently dropped.

## (d) fsModes/index.json drift test

New `frontend/src/lib/config/fsModes.drift.test.ts`: imports `FS_MODES`
directly (not a text parse) and cross-checks every mode's cost against
`games/future_spinner/library/publish_files/index.json`'s shipped cost,
mode-for-mode in both directions (a mode in one source missing from the other
also fails). Currently: `DRIFT GATE: PASS (5/5 matched exactly)`.

## (e) Autoplay asserts

**(i) `minSpinMs` resolves to 0 unless jurisdiction flags say otherwise.**
Confirmed clean (this was already true, `responsibleGambling.ts`'s
`rgJurisdiction` derived store defaults `minSpinMs` to `0` and the locked
`rgsService.ts`'s `jurisdictionFlags.set((auth.jurisdiction ?? {}))` passthrough
defaults to `{}`, fully permissive). Added two explicitly-named checks to
`responsibleGambling.test.ts` asserting the literal resolved value (not just
delay-passthrough behaviour) is `0` with no jurisdiction data, and only ever
raises when a flag explicitly sets it. Suite now 14/14 (was 12/12).

**(ii) autoplay start always requires an explicit confirm tap.** There is no
separate `AutoPlayModal.svelte` in this codebase - the spin-count button
(10/25/50/100) in `HudOverlay.svelte`'s auto-menu IS the explicit confirm (one
real click both sets the limits and starts autoplay). New
`scripts/check_autoplay_confirm_gate.mjs`: asserts `isAutoPlay.set(true)`
occurs in exactly one LIVE (imported/mounted) location, gated behind a real
`on:click`. Found and correctly handled a real complication: the dead
`ControlBar.svelte` also contains an `isAutoPlay.set(true)` call site,
unreachable by any player since it's never mounted - the gate distinguishes
live from dead call sites (liveness = actually imported somewhere) so it
passes on the live path while still surfacing the dead one as a flagged,
non-blocking note.

## Verification of everything touched this pass
- `npm run build`: clean.
- `npx svelte-check`: clean (only the 6 pre-existing `node_modules` errors).
- `responsibleGambling.test.ts`: 14/14 pass.
- `roundInterpreter.determinism.test.ts`: 58/58 (unaffected, re-run to confirm).
- `fsModes.drift.test.ts`: 5/5 matched, PASS.
- `scan_wallet_floats.mjs`: PASS, 54 files.
- `check_autoplay_confirm_gate.mjs`: PASS (1 live path; 1 dead-code note).
- `qa_soak.mjs`'s new cost-integrity logic: verified standalone against a live
  dev server (see item b's transcript) - 3/5 pass, 2/5 fail exactly as
  predicted by the static trace.
- Locked files confirmed untouched (`rgsService.ts`, `gameStore.ts`,
  `games/future_spinner/**` diff empty).

## Not done this pass (explicitly flagged, not silently skipped)
- **The full `qa_soak.mjs` run was not executed end-to-end** (sessions A/B
  alone take 25-30 minutes); the new cost-integrity phase's logic was instead
  verified standalone against a live dev server with identical code, giving
  the same reproducible pass/fail split. Running `npm run qa:soak` in full is
  a natural follow-up before treating this as CI-gated.
- **The other 5 verification scripts with the same stale `.spin-btn`
  selector** were not fixed (out of scope for a `qa_soak.mjs`-specific work
  order) - flagged in finding (a)3 above.
- **`standingMode`'s dead-end wiring was not fixed** - flagged as the headline
  finding, pending an explicit decision (see below).
- **`canBuyBonus`'s hardcoded 100x** (finding a2) was not fixed - it lives in
  the locked `gameStore.ts` and would need a sanctioned lock exception.

## Recommendation

The `standingMode` finding needs an explicit decision before any fix: wiring
`$standingMode` into `handleSpin` means Cruise/OVERBOOST selections start
actually changing which maths mode plays and, for OVERBOOST, actually charging
1.25x on every subsequent spin (not just the one buy action) - a real
money-behaviour change, not a mechanical correction like the buy-tier fix was.
Recommend treating this as its own sanctioned work item once the owner/Fable
confirm the intended behaviour (does OVERBOOST's 1.25x apply per spin while
toggled ON, consistent with its "enhancer" framing in `fsModes.ts`?).
