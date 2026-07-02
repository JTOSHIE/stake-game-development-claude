# Future Spinner, Pre-Submission Compliance Report

**Game:** Future Spinner
**Provider:** We Roll Spinners (Joshua Thompson, JTOSHIE)
**Platform:** Stake Engine (Carrot RGS)
**Scope:** Wire social mode through the live UI for stake.us eligibility, finalise two polish items, and re-verify all prior compliance fixes. No locked file changed.

---

## 1. Header

| Field | Value |
|-------|-------|
| Date | 22 June 2026 |
| Branch | `claude/math-sdk-replay-disclaimer-5l617m` |
| Parent commit | `5396eaf` |
| Build | tsc clean, vite build 582 modules |
| Verification | headless Chromium (Playwright) against the built `dist/` |

Note on the references: the Stake Engine approval-guidelines and jurisdiction-requirements pages are client-rendered, so they could not be fetched as text in this environment. The social-language mapping was therefore taken from the project's own established source of truth, the `SOCIAL_OVERRIDES` map in `translations.ts` (bet to play, win to prize, balance to coins), and applied consistently across every visible label.

---

## 2. Social mode (Part A)

### A0, current state (documented)
- Social flag: the `?social=true` URL parameter (also accepts `1`), the same flag the replay flow and the Stake Engine play-modal toggle use.
- Helper: `t(locale, key, mode = 'real')`; in `'social'` mode it returns `SOCIAL_OVERRIDES[key]` when present.
- Before this change, `SOCIAL_OVERRIDES` held only three keys (spin to PLAY, win to PRIZE, balance to COINS) and was never read by the live UI; only ReplayMode passed a mode.

### A1, single source of truth
- New non-locked store `frontend/src/lib/stores/socialMode.ts` resolves social mode once at boot from the URL flag, and also infers it when the RGS returns a social currency code (XGC, XSC, SC, GC). It exposes one boolean, `isSocial`.
- New shared store `frontend/src/lib/i18n/tr.ts` binds the active locale and `isSocial` to the helper, so components call `$tr('key')` and automatically get the social variant. This is the single shared read; components carry no bespoke social logic.

### A2, applied everywhere
- `SOCIAL_OVERRIDES` was extended to cover every gambling-framed key: bet, betMin, betMax, maxBet, minBet (to PLAY forms), wincap, bigWin, hugeWin, megaWin (to PRIZE forms), buyBonus and buyBonusDesc (to feature/play forms), insufficientBalance (to coins), gamblingLimitReached (to "Play limit reached"), and replayDisclaimer (social phrasing). These apply across all sixteen locales via `t()`.
- Components rewired to `$tr`: ControlBar (bet, maxBet, spin, autoPlay, paytable), BalanceDisplay (balance, bet), WinDisplay (win, wincap, scatter, and the previously hardcoded MEGA/BIG labels), PaytableModal (paytable, close, rules).
- Hardcoded gambling text made social-aware via `isSocial`: WinCelebration ("WIN!" to "PRIZE!"), MaxWinCelebration ("MAX WIN" to "MAX PRIZE", "BET" to "PLAY"), and PaytableModal prose (ways label, the rules list, and the seven-point disclaimer, swapping win/wins/winnings to prize and bet to play while keeping the disclaimer's meaning intact).
- The currency code display is dynamic: balance and bet show `$currencyCode` (falling back to USD), so in social mode they render whatever social currency the RGS returns.
- The locked `rgsService.ts` holds two real-money error strings (ERR_VAL "Invalid bet amount...", ERR_IPB "Insufficient balance..."). Since the file is locked, the error banner in `App.svelte` now applies a non-locked, display-only social remap (balance to coins, bet to play) so those messages do not leak gambling terms in social mode.

### A3 and A4, leak audit and verification
Verified in headless Chromium against the built bundle, loading the live game with and without `?social=true`, opening the paytable in each.

| Surface | Real mode | Social mode |
|---------|-----------|-------------|
| HUD labels | BALANCE, BET | COINS, PLAY |
| Bet label | BET | PLAY |
| Win label | WIN | PRIZE |
| Ways callout | WAYS TO WIN | WAYS |
| Rule 1 | "Wins pay left to right..." | "Prizes pay left to right..." |
| Scatter rule | "...to your total bet win." | "...to your total play prize." |
| Max rule | "Maximum win per spin... total bet." | "Maximum prize per play... total play." |
| Disclaimer | "...voids all wins and plays... Winnings are settled..." | "...voids all prizes and plays... Prizes are settled..." |

An automated scan of every visible label, rule, and the disclaimer in social mode for the prohibited stems (BET, WIN, WAGER, BALANCE, GAMBL) returned **no prohibited terms**. Toggling the flag off restores the standard labels (table above, left column). Screenshots captured: social and real, full page.

Residual note: aria-labels on the plus/minus nudge buttons ("Increase bet", "Decrease bet") and "Stop autoplay" are not visible text (screen-reader only) and were left as-is; they are not player-visible surfaces. The win-celebration prize labels (PRIZE!, MAX PRIZE, BIG/MEGA PRIZE) are wired through the same `$tr`/`isSocial` mechanism but only appear during a winning spin, which the static verification did not trigger.

---

## 3. Polish (Part B)

### B1, production console
- The two replay logs (`replayService.ts` lines 98 and 112) are already wrapped in `if (import.meta.env.DEV) { ... }`, so they are stripped from the production build. A repository sweep found no other ungated `console.log/debug/info` that dumps game state, balances, wallet data, or the replay URL. The only remaining non-error console call is `soundService.ts` `console.warn` for an asset-load fallback, which carries no game state and is allowed. `App.svelte` uses `console.error('[Spin error]', err)`, genuine error reporting that does not dump full state. Result: PASS, no change needed.

### B2, WinBanner responsive
- `WinBanner.svelte` previously set a fixed `width: 800px; height: 200px`. It now uses `width: min(800px, 90vw)` with `aspect-ratio: 4 / 1` and `height: auto`, so it caps at the 800px design width but shrinks to fit and never exceeds the viewport. At Popout S (400 x 225) the banner is about 360px wide and 90px tall, fully visible and undistorted; at 800 x 450 and 1200 x 675 it renders at the design size. The inner image keeps `width: 100%`, `object-fit: contain`, so the art scales within the container.

---

## 4. Compliance re-verification

| Item | Result | Evidence |
|------|--------|----------|
| Seven-point disclaimer present and reachable at all times, including during a spin | PASS | `PaytableModal.svelte` disclaimer block (verified rendered, real and social); the info button in `ControlBar.svelte` (around line 213) has no `disabled={$isSpinning}`, so it opens mid-spin. |
| Spacebar triggers the spin with the correct guards | PASS | `App.svelte:150` `handleKeydown`, bound at `:180` `<svelte:window on:keydown>`; acts only on Space, ignores typing and open modals, respects `canSpin`. |
| RGS bet levels via override store, with fallback and snap-to-nearest | PASS | `ControlBar.svelte` `activeLevels` from `rgsBetLevels` with `BET_LEVELS` fallback and `nearestLevel` snap; fed by the sanctioned passthrough in `rgsService`. |
| Balance and bet show the live currency code | PASS | `BalanceDisplay.svelte` renders `{ccy}` from `$currencyCode`; `ControlBar.svelte` bet value uses `$currencyCode`. |
| Scatter award reads 1x/3x/10x everywhere shipped | PASS | `PaytableModal.svelte` shows "3× = 1× · 4× = 3× · 5× = 10×" and "1×, 3×, or 10×" (verified rendered); i18n scatter keys are 1/3/10 in all sixteen locales. |
| Replay loads from URL and hides the live HUD | PASS | `App.svelte` `isReplay` branch renders `ReplayMode` only; HUD components sit in the live `{:else}` branch. |
| Social mode switches all labels, no prohibited-term leaks | PASS | Section 2 (A4): browser-verified, leak scan clean. |
| Stateless: no jackpot, gamble, continuation, early cashout in the frontend | PASS | Repository grep for those terms in `src` returns nothing. |
| No external origins in the built dist | PASS | `dist` grep finds no googleapis, gstatic, or CDN host; only inert PixiJS and SVG namespace strings. Fonts are self-hosted via @fontsource. |
| No Stake branding in shipped assets | PASS | `dist/index.html` has no "stake"; the only "Stake Engine" mentions are developer code comments referencing the platform spec, not player-visible branding or logos. |

---

## 5. Build health

- `npx tsc --noEmit`: passes, zero errors.
- `npm run build`: succeeds, **582 modules** transformed (up from 580; two new source files), no warnings or errors.
- Locked files: empty `git diff` on `rgsService.ts`, `gameStore.ts`, and `games/future_spinner/`.

---

## 6. Readiness

**Yes, the frontend is ready for the merge to main and the final review pass.** Social mode now switches every player-visible gambling-framed label to its compliant social form (verified in a real browser with the flag on and off, leak scan clean), which is what qualifies the game for automatic stake.us publication. The two polish items are closed: production logging is gated, and the win banner is fluid and undistorted down to the smallest popout. All seven previously fixed compliance items still hold, the game is stateless, the build is clean with no external origins or Stake branding, and no locked file was touched.

Two small follow-ups for awareness, neither blocking: the social label overrides are English across all locales (the project's existing design; non-English social play shows English social terms for the overridden labels, while everything else stays localised), and the two RGS error strings in the locked `rgsService.ts` are reconciled for social mode only by a display-time remap in `App.svelte` rather than at source. Both can be revisited if a future change to the locked service is sanctioned.
