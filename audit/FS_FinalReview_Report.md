# Future Spinner, Final Pre-Submission Deep Review

**Game:** Future Spinner
**Provider:** We Roll Spinners (Joshua Thompson, JTOSHIE)
**Platform:** Stake Engine (Carrot RGS)
**Reviewer stance:** Senior pre-release sign-off, adversarial. Judged against Stake's four pillars: functionality, clarity, communication, technical performance.

---

## 1. Header

| Field | Value |
|-------|-------|
| Date | 22 June 2026 |
| Branch | `claude/math-sdk-replay-disclaimer-5l617m` |
| Parent commit | `805e91e` |
| Build | tsc clean; vite build 582 modules, no warnings |

---

## 2. Summary

| Severity | Count |
|----------|------:|
| BLOCKER | 1 |
| QUALITY | 3 |
| NOTE | 7 |
| Fixed this pass (trivial) | 2 |

**Overall readiness call:** Not quite ready to merge. One BLOCKER (a spin lockup if the renderer fails to initialise) and one notable QUALITY issue (autoplay stop can place one extra bet) should be addressed first. Everything else is quality or cosmetic and can be triaged. The compliance work from prior passes (disclaimer, spacebar, bet levels, currency, scatter 1x/3x/10x, replay, social mode) all still holds and is internally consistent.

> **Update (post-review): B1 and Q1 are now FIXED.** Both were resolved in `App.svelte` (non-locked) and re-verified.
> - **B1:** `handleSpin` now releases the spin lock in a `finally` block, so the lock is always cleared even when `animateSpin` early-returns (assets not ready), `gridRef` is absent, or any step throws. No deadlock is possible after a spin.
> - **Q1:** the autoplay continuation timer is now tracked (`autoSpinTimer`) and cancelled the moment autoplay stops (a reactive guard on `isAutoPlay`), and cleared on destroy. Pressing STOP no longer fires an extra bet.
> - Re-verified live in headless Chromium: a normal spin disables during play and returns to ready (balance 100.00 to 99.00); autoplay started, then STOP left the balance unchanged over a 7 second window (no extra bet), with zero page errors. tsc clean, build 582 modules. With these resolved, the readiness call is now: ready to merge and submit, pending the remaining QUALITY/NOTE items, which are non-blocking.

> **Update (polish pass): Q2, Q3, and N5 now FIXED; N1, N2, N3, N4, N6 reported (not fixed); N7 deferred to live verification.**
> - **Q2 (currency consistency):** `BalanceDisplay.svelte` and `ControlBar.svelte` now render balance and bet through the shared `formatBalance` helper (`utils/currency.ts`), matching the win display. Verified live: balance "$100.00", bet "$1.00" on both surfaces (previously "USD 100.00"). The helper maps XGC to "GC", XSC to "SC", and shows any unmapped code as the code itself.
> - **Q3 (keyboard-first BGM):** `soundService.playBGM` now registers both a `click` and a `keydown` first-gesture listener; whichever fires first starts the music once and removes both listeners (one-shot, idempotent, gesture-gated). Spacebar-first players now get BGM. Verified by code review; headless audio playback is not reliably observable.
> - **N5 (dead audio wiring):** removed the never-played `bgmTension` audio element from `soundService` (the themeStore path constant is left in place, now unused but harmless, to avoid churn across the four theme definitions).
> - **Reported, not fixed (carry functional or replay or audio-behaviour risk):** N1 (replay amount NaN guard), N2 (social-by-currency init-order window), N3 (duplicate social resolution in replay), N4 (intentional `any` for dynamic RGS replay events), N6 (mute does not silence an already-playing one-shot clone). N7 (Popout S transform-scale) is left for the live viewport pass.

---

## 3. Fixed in this pass (trivial, non-functional)

| File and line | Fix |
|---------------|-----|
| `ControlBar.svelte:10` | Removed the unused `import { formatBalance, CURRENCY_SCALE } from '../utils/currency'` (dead code, no references in the file). |
| `App.svelte:16` | Removed the unused `switchTheme` from the themeStore import (dead code; `activeTheme` and `themeAssets` remain). |

Both re-verified: tsc clean, build succeeds (582 modules). No functional surface touched.

---

## 4. Findings to triage

### BLOCKER

**B1. First spin can lock the game if the renderer fails to initialise.**
- Evidence: `App.svelte:98` sets `isSpinning.set(true)` at the start of `handleSpin` and then relies on `GameGrid.animateSpin` to clear it (`GameGrid.svelte:500` `isSpinning.set(false)`). But `animateSpin` early-returns at `GameGrid.svelte:460` (`if (!assetsReady) return`) before reaching that reset. `assetsReady` is left false whenever the PixiJS `Application` constructor throws (`GameGrid.svelte:83-96`), and the loading screen is dismissed regardless because `assetLoadProgress.set(100)` always fires (`GameGrid.svelte:99`).
- Impact: in any environment where WebGL or the Pixi canvas fails to initialise, the loading screen clears, the player can press spin, `animateSpin` returns immediately, `isSpinning` stays true forever, and the game is locked (the spin button and spacebar are both gated by `isSpinning`). The reels also never animate, since the board subscription is guarded by `assetsReady` (`GameGrid.svelte:117`). This breaks the functionality pillar.
- Likelihood: conditional on a Pixi init failure, which the defensive try/catch was added to tolerate, so it is a real reachable path, not purely theoretical. Stake reviewers test in varied environments and the game gets one clean shot.
- Recommended fix (do not apply without sign-off, it touches the spin lifecycle): guarantee the lock is released regardless, for example wrap the spin body in `try/finally` in `App.handleSpin` and reset `isSpinning` in the finally, or have `animateSpin` clear `isSpinning` before its early return, or keep the loading screen up (or show a clear error) when `assetsReady` is false rather than dismissing it.

### QUALITY

**Q1. Stopping autoplay can still place one more bet.**
- Evidence: the next autoplay spin is scheduled with an untracked timer, `setTimeout(handleSpin, ...)` at `App.svelte:128, 131, 134, 137`. `stopAuto` in `ControlBar.svelte` sets `isAutoPlay` false and `autoPlayCount` 0 but does not cancel that pending timer, and `handleSpin` does not re-check `isAutoPlay` on entry (only `isSpinning`). So if the player presses STOP during the inter-spin delay, the queued `handleSpin` still fires one full spin (deducting a bet) before stopping. The timers are also never cleared on destroy.
- Impact: an unwanted wager after the player asked to stop. This touches the "cannot desync balance or bet" concern and the player-trust aspect of the functionality pillar.
- Recommended fix: store the timeout id and clear it in `stopAuto` (or have `App` react to `isAutoPlay` going false and cancel the pending timer), and clear it on destroy.

**Q2. Currency presentation is inconsistent and shows raw codes in the HUD.**
- Evidence: `BalanceDisplay.svelte` (balance and bet) and the ControlBar bet value render the raw code via `{$currencyCode || 'USD'}`, producing "USD 100.00" or, in social mode, "XGC 100.00" / "XSC 100.00". `WinDisplay.svelte:84` instead uses `formatBalance(...)`, which renders friendly forms ("$100.00", "GC 500", "SC 10.00") per `utils/currency.ts`.
- Impact: the win amount and the balance/bet use two different currency styles, and the social HUD shows the unfriendly "XGC"/"XSC" rather than the player-facing "GC"/"SC". Clarity pillar, and a minor social-presentation gap.
- Recommended fix: route balance and bet through `formatBalance` for one consistent, friendly currency presentation across the HUD.

**Q3. Background music never starts for a keyboard-only first interaction.**
- Evidence: `soundService.ts:70-83`. When autoplay of `bgm` is blocked, the fallback registers `document.addEventListener('click', ..., { once: true })`. It listens only for `click`. Since spacebar-to-spin is a supported first action, a player whose first interaction is the spacebar never satisfies the click fallback, so BGM never starts.
- Impact: silent game for keyboard-first players. Communication and polish.
- Recommended fix: also listen for `keydown` (and ideally `pointerdown`) in the once fallback, or start BGM from the spin entry point on first interaction.

### NOTE

**N1. Replay `amount` is not validated.** `replayService.ts:73` does `amount = rawAmount ? parseInt(rawAmount, 10) : CURRENCY_SCALE`. A non-numeric `amount` yields `NaN`, and the Start Replay button then renders "NaN". Low risk (Stake supplies valid values). Recommend a `Number.isFinite` guard falling back to `CURRENCY_SCALE`.

**N2. Social-by-currency has a brief stale window.** `socialMode.ts` derives `isSocial` partly from `currencyCode`, which is the default 'USD' until `initRGS` populates it. For a player identified as social only by currency (no `?social` flag), labels resolve to real mode until auth completes. In practice the loading screen masks this window (the HUD is not shown until `isLoading` clears post-auth), so there is no visible leak, but it is a latent ordering dependency worth noting.

**N3. Two independent social resolutions.** The live UI reads `socialMode.isSocial`; `ReplayMode.svelte:42,155` computes its own mode from the `social` URL parameter. They do not conflict (replay never renders the live HUD), but the logic is duplicated.

**N4. Untyped replay event parsing.** `ReplayMode.svelte:82-102` and the `catch (e: any)` blocks use `any` for the dynamic RGS replay state. Acceptable given the shape is supplied by the server, but flagged for type-safety awareness; a defined interface would be safer.

**N5. Dead audio wiring.** `soundService.ts` builds and volume-configures `bgmTension` (lines 26, 40) but never plays it (no call site). Minor.

**N6. Mute does not silence in-flight one-shot sounds.** `setMuted` (`soundService.ts:63-66`) mutes the base elements, but one-shot clones (reel stop, scatter, small win, epic echo) created via `cloneNode` are not tracked, so a sound already playing when mute is pressed continues. New sounds are correctly suppressed (each `play*` checks `muted` first), so the impact is limited to the single in-flight sound.

**N7. Responsive scaling uses transforms (live render not verified here).** `App.svelte:525-551` scales `.grid-wrapper` with `transform: scale(0.75 / 0.58 / 0.55)` at the breakpoints. CSS transforms do not change the layout box, so the scaled 616x412 grid (`GameGrid.svelte:562`) still reserves its full footprint in flow; at Popout S (400x225) the scaled grid is about 227px tall against a 225px viewport before the header, HUD, and control bar, which risks vertical overflow. I could not render the six required viewport sizes in this environment: the headless-browser viewport probe hung three times and was stopped under the three-strike rule. This is therefore a code-based observation, not a confirmed visual defect. Recommend verifying in the Stake play-modal viewport tester, and if it overflows, switching to a scaling approach that also reduces the layout footprint (a wrapper with fixed scaled dimensions, or container queries).

---

## 5. Audio and background-music state

- **First-interaction BGM:** `playBGM` is called on mount (`App.svelte:69`). Browser autoplay policy normally blocks it, so the code falls back to a one-time `click` listener that starts BGM on the first click or tap (`soundService.ts:74-82`). This works for mouse and touch. It does **not** start on a spacebar-only first interaction (finding Q3). So the previously known "BGM not firing on first click" issue is resolved for click and tap, but a keyboard-first player still gets silence until they click something.
- **Mute:** toggling the mute control flows through `isMuted` to `setMuted`, which mutes both music and effects for all subsequent sounds; an already-playing one-shot is the only exception (N6). Confirmed the BGM is included in the muted set.
- **Failed audio load:** `makeAudio` attaches a one-time error handler that swaps to a local fallback path, and every `play()` call is `.catch`-guarded, so a missing or failed audio file neither throws nor blocks gameplay.

---

## 6. Build health

- `npx tsc --noEmit`: passes, zero errors.
- `npm run build`: succeeds, 582 modules transformed, no warnings.
- Locked targets: empty `git diff` on `rgsService.ts`, `gameStore.ts`, and `games/future_spinner/`.

---

## 7. Spin lifecycle, parallel stores, and compliance re-confirmation (review notes)

- **Spin lifecycle:** the double-input lockout is sound in the normal path: `handleSpin` guards on `isSpinning` (`App.svelte:97`), sets it true before any async work, and `animateSpin` clears it at the end (`GameGrid.svelte:500`). The bet is captured before the await (`App.svelte:101`), so a mid-flight bet change cannot affect the in-progress spin. The one gap is the renderer-failure path (B1).
- **Win count-up:** `WinDisplay.svelte` count-up animates to the final total and cancels and restarts cleanly on a new win (the reactive guard at lines 16-22, `cancelAnimationFrame` on destroy at line 63). It reaches the final multiplier and is not left mid-count. Satisfies the Stake incremental-display requirement.
- **Bet selector and override store:** `ControlBar` derives `activeLevels` from `rgsBetLevels` with the `BET_LEVELS` fallback, snaps an out-of-ladder bet to the nearest level, and gates increase and max against `$balance`, so the selected bet cannot become unaffordable or unselectable. Before auth, `rgsBetLevels` is empty and the fallback covers it.
- **Parallel-files boundary:** the parallel stores read RGS-populated values (`currencyCode`, `rgsBetLevels`) that default safely before auth, and the UI window is masked by the loading screen (N2). No place was found where a parallel store and the locked store hold conflicting authoritative state.
- **Social mode error remap:** `App.svelte:44-49` triggers only when `$isSocial` is true, matches the two real-money RGS strings (ERR_VAL "bet", ERR_IPB "balance"), and leaves the other six error messages untouched, so it cannot mangle unrelated text.
- **Replay:** malformed or missing replay parameters cause `parseReplayParams` to throw, which `App.svelte:21-27` treats as replay so `ReplayMode` renders its error phase with the disclaimer and no live HUD. Graceful.
- **Compliance items still hold together:** seven-point disclaimer present and reachable during a spin (info button has no spin-disable), spacebar-to-spin with guards, RGS bet levels via the override store, live currency code (with the consistency caveat Q2), scatter display 1x/3x/10x, and replay all verified consistent with the new social mode.

---

## 8. Bottom line

The frontend is close, but I would not merge and submit as-is. Address the BLOCKER first: a renderer-init failure dismisses the loading screen and then deadlocks on the first spin because the spin lock is only released inside `animateSpin`, which early-returns when assets are not ready. Fix the autoplay-stop extra-bet (Q1) as well, since it can place a wager the player tried to cancel. The currency-presentation inconsistency (Q2) and the keyboard-first BGM gap (Q3) are worth doing for the clarity and polish pillars but are not blockers. The remaining notes are minor. Once B1 and Q1 are resolved and re-verified, the game is in good shape for the final submission, since the compliance surface is solid and internally consistent.
