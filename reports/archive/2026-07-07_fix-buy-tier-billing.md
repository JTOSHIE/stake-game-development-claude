# Session Report: Fix buy-tier billing bug (all buy cards were charging 100x bonus)

- **Date:** 2026-07-07
- **Model / effort:** Claude Sonnet 5, default effort.
- **Branch:** `claude/fix-buy-tier-billing` (off up-to-date `main`, in a dedicated worktree
  at `/Users/jt/math-sdk-buyfix`).
- **Source:** discovered mid-session while wiring telemetry into the paused "Pass B"
  recovery work (see `reports/archive/2026-07-07_compliance-rg-pass-a.md` for that
  context). Not from a pasted brief. The user was asked via a scoped question whether to
  fix immediately or continue Pass B first, and chose to fix immediately.

## The bug

FeatureMath v2 (see `reports/archive/2026-07-07_featuremath-v2.md`) shipped a real
`super` buy tier (NITRO OVERDRIVE, cost 400x) alongside the existing `bonus` tier (Buy
Overdrive, cost 100x), and `fsModes.ts` already listed both with correct per-mode costs.
But the frontend wiring between the FEATURES menu and the actual purchase never
threaded the clicked mode through:

- `FeatureMenu.svelte` correctly dispatched the clicked card's `serverMode` (`bonus` or
  `super`).
- `App.svelte`'s handler discarded it: `on:buy={() => buyBonusRef?.openConfirm()}` -
  always opened the confirm modal with no mode argument.
- `BuyBonus.svelte`'s `openConfirm()` took no mode argument and its price was hardcoded
  to `betAmount * 100`.
- `handleBuy()` in `App.svelte` was hardcoded to cost `bet * 100` and always set
  `selectedBetMode` to `'bonus'`.

Net effect: clicking NITRO OVERDRIVE (meant to cost 400x and serve a pre-revved `super`
round) actually charged 100x and served a `bonus` round. This is a real money/billing
correctness bug, not a display issue - it affects the actual debit taken from the
player's balance.

## The fix

- `frontend/src/lib/config/fsModes.ts`: added `MODE_COST`, a `Record<FsServerMode,
  number>` derived from `FS_MODES` (never duplicate the per-mode cost data - single
  source of truth, same philosophy as the rest of the file).
- `frontend/src/lib/components/BuyBonus.svelte`: `openConfirm(mode: BetMode = 'bonus')`
  and `open(mode)` now take and store the clicked mode; `priceMicros` now reads
  `MODE_COST[buyMode]` instead of a hardcoded `100`; `confirm()` dispatches the actual
  `buyMode`, not a bare event. Renamed the pre-existing i18n `mode` reactive (social/real
  locale switching) to `localeMode` throughout to avoid colliding with the new buy-tier
  `buyMode` concept. Also fixed a latent bug on the unused standalone trigger button:
  `on:click={open}` would have passed the click `Event` as `open`'s first (now `BetMode`-
  typed) argument; changed to `on:click={() => open()}`.
- `frontend/src/lib/mock/roundProvider.ts` (not locked - confirmed via its own header
  comment): widened `SampleEntry.mode`, `samplesFor`, `triggeredSamples`,
  `serveMockRound`, `serveCategory` from the old `'base'|'bonus'` union to the full
  `BetMode` type; the "is this a guaranteed-trigger buy" check is now
  `BUY_MODE_IDS.has(mode)` (a set derived from `BUY_MODES` in `fsModes.ts`) instead of a
  hardcoded `mode === 'bonus'` string compare, so a future buy tier gets correct
  guaranteed-trigger mock behaviour automatically.
- `frontend/src/App.svelte`: `handleBuy` is now `handleBuy(mode: BetMode = 'bonus')`,
  cost is `bet * (MODE_COST[mode] ?? 100)`, sets `selectedBetMode.set(mode)`, and the mock
  serving path calls `serveCategory(mode, ...)` / `serveMockRound(mode)` instead of a
  hardcoded `'bonus'`. Markup wiring: `FeatureMenu`'s `on:buy` now forwards `e.detail` to
  `openConfirm`, and `BuyBonus`'s `on:buy` now forwards `e.detail` to `handleBuy`.

**Real RGS path unaffected without touching the lock**: the locked `rgsService.ts`'s
`play()` function reads the mode straight from the `selectedBetMode` store (not from a
`SpinRequest.mode` parameter), so once `handleBuy` calls `selectedBetMode.set(mode)`
before spinning, the correct mode reaches the live wallet/RGS request with zero changes
to the locked file. Verified `git diff` against all three locked paths is empty
throughout.

## Verification

- `npm run build` and `npx svelte-check`: clean (only the 6 pre-existing `node_modules`
  errors present on `main` before this change).
- Playwright, dev server on a throwaway port, bet lowered to $0.10 via the FEATURES
  menu's own bet stepper:
  - Bonus card confirm price: **$10.00** (100x x $0.10). Screenshot:
    `reports/screens/fix-buy-tier-billing/02_confirm_bonus_10.png`.
  - Super card confirm price: **$40.00** (400x x $0.10) - exactly the 4:1 ratio expected
    from the 100x:400x cost ratio. Screenshot:
    `reports/screens/fix-buy-tier-billing/03_confirm_super_40.png`.
  - Confirmed the *actual purchase*, not just the display price: after confirming the
    super buy, balance went from $100.00 to $60.06 (100.00 - 40.00 cost + 0.06 win),
    proving the real debit is now the scaled 400x amount, not the old hardcoded 100x/
    $10.00. Screenshot: `reports/screens/fix-buy-tier-billing/04_after_super_buy.png`.
  - The board shown after the super buy is a generic (non-curated) layout rather than a
    curated feature-trigger demo. This is a known, already-documented limitation, not a
    regression: `sample_rounds.json` only curates `base`/`bonus` samples so far; `super`
    (and `cruise`/`antelite`) fall back to `_mockSpin`'s generic random board until
    samples are authored for them. The real RGS path does not depend on these samples.

## Needs owner / Fable attention
- None blocking. This is a frontend-only correctness fix; no maths/PAR changes, no
  locked-file changes.
- Curated mock samples for `super`/`cruise`/`antelite` remain a nice-to-have for offline
  dev/demo fidelity (not required for the real RGS path).

## FOR THE NEXT SESSION
- **Model/effort:** Claude Sonnet 5, default effort. **Approach:** diagnosed the bug by
  tracing the dispatched mode from `FeatureMenu` through `App.svelte` and `BuyBonus.svelte`
  down to `handleBuy`, found it discarded at three separate points, and used
  `MODE_COST`/`BUY_MODE_IDS` (both derived from `fsModes.ts`'s existing `FS_MODES` single
  source of truth) rather than adding a second table of per-mode costs anywhere.
- **Alternatives rejected:** patching only `handleBuy` and leaving `BuyBonus`'s displayed
  confirm price hardcoded (rejected - would show the wrong price on screen even if the
  eventual debit were fixed elsewhere, i.e. a UI/backend mismatch); threading `req.mode`
  through `rgsService.spin()` (rejected - unnecessary and would have required a locked-file
  edit; `play()` already reads the correct mode from the `selectedBetMode` store).
- **Files touched:** `frontend/src/lib/config/fsModes.ts`,
  `frontend/src/lib/components/BuyBonus.svelte`, `frontend/src/lib/mock/roundProvider.ts`,
  `frontend/src/App.svelte`. `frontend/dist` build noise restored to `HEAD` before commit.
  Locked files confirmed untouched (`rgsService.ts`, `gameStore.ts`, `games/future_spinner/**`).
- **Open threads:** "Pass B" (CellModifier + PF determinism test + telemetry +
  collection-meter recovery, parked uncommitted in worktree `/Users/jt/math-sdk-rgb`,
  branch `claude/compliance-rg-passb`) was paused for this fix and is still owed a resume
  decision from the user. PR #43 (compliance-rg Pass A) is still open, not yet merged.
  The two LUMEN-parity items flagged earlier (music/SFX volume sliders, paytable Interface
  Guide) are still open and not yet started. Fable is still reviewing audio.
