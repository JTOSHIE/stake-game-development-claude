# Session Report: Recover compliance-rg (Pass A - RG module + SessionPanel)

- **Date:** 2026-07-07
- **Model / effort:** Claude Opus 4.8 (1M context), High.
- **Branch:** `claude/compliance-rg-v2` (off up-to-date `main`, in a dedicated worktree).
- **Source:** `claude/compliance-rg` - a local-only branch (never pushed, never made into a PR)
  discovered during a LUMEN-vs-Future-Spinner feature review. It contained a full
  responsible-gambling module plus several other items (a mechanic-presentation overlay,
  a PF determinism test, a telemetry emitter, a stateless collection-meter maths primitive,
  and some now-superseded UI). Backed up to `origin/claude/compliance-rg` as a first step.

## Scoping decision

`claude/compliance-rg` branched off an OLD `main` (before the whole graphics-overhaul arc:
B1 HUD reskin, B3 paytable reskin, the unified `fsModes.ts` FEATURES menu, symbol-life
amplification, the scene/character pass) and bundles several unrelated things. Rather than a
raw `git merge`/rebase (which would conflict heavily and risk resurrecting dead UI), this
pass surgically ports forward only what is still genuinely relevant, re-integrating it BY
HAND into the current, reskinned files:

- **PORTED (this pass, "Pass A"):** the responsible-gambling module
  (`responsibleGambling.ts` + its test), `SessionPanel.svelte`, and their integration into
  the current `App.svelte`/`HudOverlay.svelte`.
- **NOT ported (superseded, left alone):** `ModeSelector.svelte`, `ModeLibrary.svelte`,
  `AnteToggle.svelte`, and the old `betMode.ts`/`PaytableModal.svelte` ante-mode edits - all
  fully superseded by the unified `fsModes.ts` FEATURES menu (PR #32) and FeatureMath v2
  (PR #42). Porting these forward would reintroduce dead UI.
- **DEFERRED to a follow-up pass ("Pass B", not in this commit):** the `CellModifier.svelte`
  mechanic-presentation overlay + its `GameGrid`/`roundInterpreter`/`cellMultipliers.ts`
  wiring, the PF determinism test, the telemetry emitter + `docs/TELEMETRY_TAXONOMY.md`, and
  the `future_spinner_collect` sibling maths package. All are valuable and self-contained but
  independent of the RG/compliance ask that motivated this recovery; scoping them separately
  keeps this change reviewable.
- **Noted, very low priority:** a small paytable content addition (the "where 1,024 comes
  from" ways-math worked example) also lives on `compliance-rg` and was never merged; it is
  a few lines, cheap to fold in later, not done here.

## What this delivers

### `frontend/src/lib/stores/responsibleGambling.ts` (new, copied verbatim)
Jurisdiction-flag-driven, off by default so the crypto/Stake model is unaffected:
- Autoplay stop conditions beyond bare count: stop on any win, single-win limit (x total
  bet), stop on feature, loss limit (session net).
- Minimum spin interval (UKGC 2.5s, enforced May 2026) via `rgSpinDelay`, applied even under
  turbo/super speed tiers.
- Session tracking (spins/wagered/won/net, integer micros) via `rgRecordSpin`.
- Reality-check due/acknowledge hooks.
Depends only on the existing `jurisdiction.ts` store (unchanged, already forward-compatible
via its `[k: string]: unknown` index signature) - no incompatibility with anything merged
since this branch diverged.

### `frontend/src/lib/stores/responsibleGambling.test.ts` (new, copied verbatim)
Pure-logic compliance gate, runnable via `npx tsx`. **12/12 PASS**, re-verified after full
integration (not just in isolation).

### `frontend/src/lib/components/SessionPanel.svelte` (new, copied verbatim)
Time played / spins / net win-loss (social "COINS" aware) + a reality-check reminder modal.
Shown where the jurisdiction enables RG, plus dev for testing.

### Integration into the CURRENT (post-reskin) files
- **`App.svelte`:** `rgRecordSpin` called after every resolved spin and buy (both the live
  and mock branches); `scheduleAutoSpin`'s delay now passes through `rgSpinDelay` so autoplay
  never drops below the jurisdiction minimum even at Turbo/Super speed; the autoplay
  continuation check gains `autoplayShouldStop(...)` as an ADDITIONAL stop condition
  alongside the existing count/wincap/win-tier-pause logic (added, not replaced - the
  existing epic-win-stops-entirely and mega/big/small win pause escalation are untouched);
  `SessionPanel` mounted inside the non-replay branch (so it is never shown in replay mode,
  matching the existing BalanceDisplay/ControlBar/ThemeSelector convention).
- **`HudOverlay.svelte`:** the existing autoplay `AUTO_OPTIONS`/`showAutoMenu`/`startAuto()`
  structure (untouched by the B1 reskin) gains three stop-condition checkboxes (Stop on win /
  Stop on feature, default on / Loss limit) plus a "Spins" separator above the existing
  10/25/50/100 picker; `startAuto()` now populates `autoplayLimits` from the toggles before
  starting; the whole autoplay control is hidden where `rgJurisdiction.autoplayDisabled`
  (UKGC autoplay ban). New CSS matches the existing gold/cyan chrome (cyan-accent checkboxes,
  gold uppercase separator) rather than the original branch's plain styling.

## Verification
- `responsibleGambling.test.ts`: **12/12 PASS**, both standalone and after full integration.
- `npm run build`: succeeds.
- `npx svelte-check`: 6 errors, 0 warnings - all 6 pre-existing `node_modules` `.d.ts`
  errors, zero new.
- Locked files (`rgsService.ts`, `gameStore.ts`, `games/future_spinner/**`): empty diff,
  untouched.
- Screenshots: `frontend/screens/rg_session_panel.png` (TIME/SPINS/NET, top-right, dev
  forced) and `frontend/screens/rg_autoplay_menu.png` (the three toggles + spin-count picker,
  matching the existing chrome). Both eyeballed and confirmed correct.

## Needs owner / Fable attention
- **Pass B** (CellModifier/multiplier-wild presentation, PF determinism test, telemetry,
  `future_spinner_collect`) is a natural next recovery pass from the same `compliance-rg`
  branch, now that it is safely backed up on origin.
- **SessionPanel's CSS is functional but not yet reskinned** to the full `.fs-plate` chrome
  vocabulary (it uses its own compact dark panel, which sits reasonably within the current
  theme but was not built against `docs/design/CHROME_PRIMITIVES.md`). A future chrome pass
  could bring it in line with the HUD/paytable/win-celebration reskins.
- **Real jurisdiction flags are untested** - `rgJurisdiction`'s fields (`minSpinMs`,
  `realityCheckMs`, `disabledAutoplay`, etc.) are read from whatever the RGS authenticate
  response supplies via `jurisdictionFlags`; nothing in this repo currently sets those flags
  to non-default values, so the RG UI has only been verified in its OFF (default/dev) state
  plus the pure-logic test. Worth a dedicated jurisdiction-flag smoke test before submission.

## FOR THE NEXT SESSION
- **Model/effort:** Opus 4.8 (1M), High. **Approach:** recovered a local-only, never-PR'd
  branch discovered during a routine feature-parity review; scoped the recovery to the
  RG-specific ask rather than a wholesale merge (the branch predates the whole graphics
  overhaul and bundles several already-superseded UI changes); hand-integrated rather than
  git-merged given how much `HudOverlay.svelte`/`App.svelte` have structurally changed since.
- **Alternatives rejected:** a raw `git merge`/rebase of the whole branch (rejected - would
  resurrect dead `ModeSelector`/`ModeLibrary`/`AnteToggle` UI already superseded by
  `fsModes.ts`, and conflict heavily against the reskinned chrome); porting everything in one
  pass (rejected - CellModifier/telemetry/PF-test/collection-meter are valuable but
  independent of the compliance ask; kept as a clean, separately reviewable Pass B).
- **Files touched:** `frontend/src/lib/stores/{responsibleGambling.ts,
  responsibleGambling.test.ts}` (new), `frontend/src/lib/components/SessionPanel.svelte`
  (new), `frontend/src/App.svelte`, `frontend/src/lib/components/HudOverlay.svelte`,
  `frontend/screens/rg_{session_panel,autoplay_menu}.png` (new).
- **Open threads:** Pass B (CellModifier/telemetry/PF-test/collection-meter); the small
  paytable ways-math addition; a SessionPanel chrome reskin; a real jurisdiction-flag smoke
  test; the two LUMEN-parity items from the earlier review (volume sliders, paytable
  Interface Guide) - still not started, deliberately sequenced after this RG recovery per the
  owner's "start with compliance-rg" instruction.
