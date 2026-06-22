# Future Spinner, Stake Engine Compliance and Quality Audit

**Game:** Future Spinner
**Studio:** We Roll Spinners (Joshua Thompson, JTOSHIE)
**Platform:** Stake Engine (Carrot RGS)
**Audit type:** Read only. No source file was modified. The only file created is this report.
**Australian English, metric, no em dashes.**

---

## 1. Header

| Field | Value |
|-------|-------|
| Audit date | 22 June 2026 |
| Current branch | `claude/math-sdk-replay-disclaimer-5l617m` |
| Current commit | `dbf462c` (feat(replay): add localized replay disclaimer banner) |
| Working tree | clean at audit start |
| Replay merged to main | NO. The replay implementation (commit `803f51a`) and the replay disclaimer (commit `dbf462c`) exist ONLY on `claude/math-sdk-replay-disclaimer-5l617m`. There is no local `main` branch and no merge has occurred. All replay findings below are read in the context of this branch. |

`git log --oneline -5` at audit time:

```
dbf462c feat(replay): add localized replay disclaimer banner (Stake Engine compliance)
803f51a feat(frontend): implement Stake Engine Bet Replay (mandatory requirement)
00dc23c fix(frontend): self-host Orbitron font for Stake Engine XSS compliance
5d132c2 fix(bgm): bgmStarted only set after play() resolves, click fallback now works
83496f2 fix(loading): wrap PixiJS init in try/catch, assetLoadProgress.set(100) always fires
```

Note on paths: the documented root `~/math-sdk/` is the repository root in this environment (`/home/user/stake-game-development-claude/`). The frontend lives at `frontend/`. All file references below are relative to the repository root.

---

## 2. Summary table

| Area | Topic | Result | Blockers | Quality |
|------|-------|--------|----------|---------|
| A | Currency and math integrity | PASS | 0 | 1 |
| B | Stateless compliance | PASS | 0 | 1 |
| C | RGS integration | FAIL | 1 | 0 |
| D | Bet Replay | PASS | 0 | 1 |
| E | Mandatory game disclaimer (7 points) | FAIL | 1 | 1 |
| F | Rules and paytable | PASS | 0 | 0 |
| G | UI components | FAIL | 1 | 3 |
| H | Static files and XSS policy | PASS | 0 | 0 |
| I | Viewport and responsive | UNKNOWN | 0 | 1 |
| J | Network and console hygiene | PASS | 0 | 1 |
| K | Localisation and social mode | PASS (loc), UNKNOWN (social) | 0 | 1 |
| L | Build and type health | PASS | 0 | 0 |
| **Totals** | | | **3** | **10** |

Three approval blockers and ten quality items.

---

## 3. Blockers list (would fail approval)

### BLOCKER 1, Area C, bet selector ignores RGS bet levels
- **Evidence:** `authenticate()` parses and converts the RGS bet levels: `frontend/src/lib/services/rgsService.ts:312` (`betLevels: raw.betLevels.map(microsToDisplay)`). However `initRGS()` only applies `balance` and `currency` to the stores and merely logs the bet levels: `frontend/src/lib/services/rgsService.ts:402-406`. The bet selector reads a hardcoded ladder instead: `frontend/src/lib/stores/gameStore.ts:7` (`export const BET_LEVELS = [0.10, 0.20, ... 100.00]`), consumed by `frontend/src/lib/components/ControlBar.svelte:7` and by `increaseBet` / `decreaseBet` / `canIncreaseBet` (`gameStore.ts:77`, `99-110`, `118-127`).
- **Impact:** The player can only select the hardcoded levels. If the RGS account is configured with different bet levels, they are unusable, which fails the requirement that all RGS returned bet levels are usable.
- **Constraint:** `gameStore.ts` is hard locked and `BET_LEVELS` is a `const`, so the fix cannot simply mutate it. The fix needs a non locked override layer (for example a new writable in a non locked store seeded from `auth.betLevels`, with `ControlBar` reading that writable, and `increaseBet` / `decreaseBet` logic relocated out of the locked store or driven by the new writable).
- **Fix recommendation:** Wire `auth.betLevels` from `initRGS` into a non locked `activeBetLevels` store and make `ControlBar` plus the increase and decrease handlers read it, falling back to `BET_LEVELS` only when the RGS list is absent (mock mode).

### BLOCKER 2, Area E, mandatory disclaimer missing 6 of 7 points
- **Evidence:** the rules and info surface is `frontend/src/lib/components/PaytableModal.svelte`. It contains a how to win banner, the symbol pay table, a five item rules list (`:94-100`) and an RTP row (`:104-107`). Only one of the seven mandatory disclaimer points is present. See Section per point detail below.
- **Impact:** the seven point game disclaimer is a Stake Engine approval requirement. Six points are absent.
- **Fix recommendation:** add a dedicated disclaimer block (the documented Page 5) to `PaytableModal.svelte` covering all seven points, localised through the i18n system, and make it reachable while a spin is in progress.

### BLOCKER 3, Area G, spacebar not mapped to the bet or spin button
- **Evidence:** a repository wide search for key handlers found only `frontend/src/lib/components/PaytableModal.svelte:30` (Escape to close) and `frontend/src/lib/components/MaxWinCelebration.svelte:61`. There is no `keydown` or `keyup` handler binding the spacebar to the spin action anywhere in `src`. `ControlBar.svelte` exposes the spin button via click only (`:104-120`).
- **Impact:** mapping the spacebar to the primary bet or spin button is a specific Stake Engine requirement.
- **Fix recommendation:** add a `svelte:window on:keydown` handler (most appropriately in `App.svelte` or `ControlBar.svelte`) that triggers the spin dispatch when the key is Space, the game is not loading, a spin is not already running, and no modal is open.

---

## 4. Quality list (affects the star grade)

### QUALITY 1, Area A, replay win uses an unfloored float currency multiply
- **Evidence:** `frontend/src/lib/components/ReplayMode.svelte:119`, `winAmount.set(microsToDisplay(response.payoutMultiplier * params.amount))`. `payoutMultiplier` is a float and `params.amount` is integer micros, and the product is not floored before division. By contrast `totalBetSpentMicros` correctly floors (`frontend/src/lib/services/replayService.ts:127`).
- **Impact:** display only, replay never settles money, so there is no wallet risk. It is an inconsistency in money handling.
- **Fix recommendation:** wrap the product in `Math.floor` (or `Math.round`) before `microsToDisplay`, matching `totalBetSpentMicros`.

### QUALITY 2, Area B, loose jackpot wording in a math comment
- **Evidence:** `games/future_spinner/game_config.py:251` comment describes the five scatter award as a "jackpot feature". The par sheet correctly states there is no progressive jackpot (`games/future_spinner/FUTURE_SPINNER_PAR_SHEET.md:245`).
- **Impact:** documentation wording only. The mechanic is an instant scatter multiplier and is stateless. No code path implements a jackpot. A reviewer skimming the config could misread the intent.
- **Fix recommendation:** reword the comment to "instant scatter multiplier" to avoid the term jackpot. This is in the locked math directory, so defer to a math owner.

### QUALITY 3, Area E, disclaimer and rules not reachable during a spin
- **Evidence:** the info button that opens `PaytableModal` is disabled while spinning, `frontend/src/lib/components/ControlBar.svelte:176` (`disabled={$isSpinning}`).
- **Impact:** the requirement is that the disclaimer is reachable at all times during play. During an active spin it is not.
- **Fix recommendation:** keep the info button enabled during spins, or expose the disclaimer through a surface that is always available.

### QUALITY 4, Area G, balance and bet hardcode the USD prefix
- **Evidence:** `frontend/src/lib/components/BalanceDisplay.svelte:9` and `:14` render `USD {value}`, and `frontend/src/lib/components/ControlBar.svelte:94` renders `USD {betAmount}`. The `currencyCode` store is populated from the RGS authenticate response (`rgsService.ts:404`) but is not used in these displays.
- **Impact:** clarity and correctness. A non USD account (for example JPY, or the social coin codes XGC and XSC) still shows USD.
- **Fix recommendation:** render `$currencyCode` (or a formatter keyed on it) instead of the literal USD.

### QUALITY 5, Area G, no dedicated button guide
- **Evidence:** buttons carry `aria-label` and `title` tooltips (for example `ControlBar.svelte:161-178`), but there is no short in game guide explaining the controls. The how to win banner in `PaytableModal` explains game play, not the buttons.
- **Impact:** the requirement asks for a short UI guide describing the buttons. Tooltips partially cover this but there is no consolidated guide.
- **Fix recommendation:** add a short controls legend, for example a panel inside `PaytableModal` listing each button and its function.

### QUALITY 6, Area I, fixed 800 px win banner may overflow the small popout
- **Evidence:** `frontend/src/lib/components/WinBanner.svelte:90-91` sets `width: 800px; height: 200px;` on an absolutely positioned element.
- **Impact:** at Popout S (400 x 225) an 800 px wide banner is twice the viewport width and is likely to overflow or clip.
- **Fix recommendation:** make the banner width responsive (for example `max-width: 100%` with a percentage or viewport based width) and verify at 400 x 225.

### QUALITY 7, Area J, replay logging leaks the URL and full response to the console
- **Evidence:** `frontend/src/lib/services/replayService.ts:98` `console.log('[replay] GET', url)` and `:112` `console.log('[replay] response:', data)`. The response includes the payout multiplier and full round state.
- **Impact:** console hygiene. The live game already gates its logging behind `import.meta.env.DEV` (`rgsService.ts:234`), but the replay service logs unconditionally. The benign `console.warn` for an asset fallback at `soundService.ts:15` is acceptable.
- **Fix recommendation:** gate the two replay `console.log` calls behind `import.meta.env.DEV` or remove them.

### QUALITY 8, Area K, social mode labels are not applied in the live game
- **Evidence:** `SOCIAL_OVERRIDES` exists (`frontend/src/lib/i18n/translations.ts:625-630`) remapping spin to PLAY, win to PRIZE, balance to COINS. The translate helper accepts a mode argument (`translations.ts:638`). Only `ReplayMode.svelte:156` passes that argument. Every live component calls `t($locale, key)` with the default `real` mode, so the social safe labels are never shown in the live game, even with `?social=true` or a social currency code.
- **Impact:** affects Stake.us social casino eligibility. Marked UNKNOWN because social mode is effectively not implemented in the live UI.
- **Fix recommendation:** detect social mode (URL `social` parameter or social currency code) at boot, store it, and pass it as the third argument to `t()` across the live components. Also resolves part of Quality 4.

---

## 5. Confirmed good list (passes with evidence)

### Area A, currency and math integrity (PASS)
- Single micros scale defined once: `rgsService.ts:20` `CURRENCY_SCALE = 1_000_000`, with `microsToDisplay` dividing by it (`:22-23`) and `dollarsToMicros` using `BigInt` integer maths (`:28`).
- All money fields are documented and carried as micros across the API boundary (`rgsService.ts:42-46`, `69-89`), converted to display dollars only at the edges (`:308-312`, `:346-374`, `:491`, `:501`).
- No floating point currency multiplication exists in the non locked live game. The only instance is the replay display path (Quality 1).
- Locked files `rgsService.ts` and `gameStore.ts` have an empty `git diff`.

### Area B, stateless compliance (PASS)
- No jackpot, gamble, double or nothing, cashout, carry over, continuation, or progressive logic exists in `frontend/src`. The only matches anywhere are documentation lines in the math directory, including an explicit "No progressive jackpot" statement (`FUTURE_SPINNER_PAR_SHEET.md:245`).

### Area C, round flow (PASS, the bet level wiring is the blocker)
- Flow is authenticate then play then end round: `rgsService.ts:300` (`/wallet/authenticate`), `:338` (`/wallet/play`), `:368` (`/wallet/end-round`, called on a win at `:448-451`). A mock path is used when launch parameters are absent (`:414`), otherwise the service is pointed at the real `rgs_url` from the launch URL.

### Area D, bet replay (PASS)
- `replayService.ts`, `replayStore.ts` and `ReplayMode.svelte` all exist.
- `App.svelte` branches on the replay parameter (`App.svelte:21` parse, `:184` `{#if isReplay}`). In replay mode the live HUD is not rendered: `BalanceDisplay`, `ControlBar` and the theme selector all sit inside the `{:else}` live branch (`App.svelte:255`, `:259`, `:264` region).
- `REPLAY_TEST_EVENTS.md` exists at the repository root. It is still a scaffold with placeholder event IDs pending a staging capture.

### Area E, the one disclaimer point that passes
- Point 1, malfunction voids all wins and plays: PASS, `PaytableModal.svelte:99` "Malfunctions void all pays and plays."

### Area F, rules and paytable (PASS)
- Game rules accessible from the UI: `PaytableModal.svelte:92-101`, opened from `ControlBar.svelte:62-65,173-179`.
- Theoretical RTP shown: `PaytableModal.svelte:104-107` (96.35%).
- Maximum win shown: `PaytableModal.svelte:98` (5,000x), constant `WINCAP = 5000` (`gameStore.ts:8`).
- Payout values for all standard symbols: `PaytableModal.svelte:16-27` and the rendered table `:63-89` (three, four and five of a kind).
- Scatter multipliers listed: `PaytableModal.svelte:80` and `:97` (three equals 5x, four equals 15x, five equals 50x).
- Bet mode cost description: not applicable, the game has a single BASE mode. No buy bonus button is rendered (the `buyBonus` strings and `canBuyBonus` store exist but are not used in the live UI).

### Area G, the UI items that pass
- Change bet size: `ControlBar.svelte:88-99` plus max bet `:77-85` (the underlying ladder is the Area C blocker).
- Current balance displayed: `BalanceDisplay.svelte:8-9`.
- Final win shown for non zero results: `WinDisplay.svelte:4` activates when `winAmount > 0`.
- Incremental count up to the final value: `WinDisplay.svelte:53-60` and `WinBanner.svelte:43-55` animate the amount up with `requestAnimationFrame`. This is a smooth count up to the final total rather than discrete per action steps, which satisfies the incremental display intent.
- Disable all sound: `ControlBar.svelte:58-60,165-171` toggles `isMuted`; `soundService.ts:61-65` mutes every sound including the background music (the BGM is part of the muted `sounds` set, `soundService.ts:39`).
- Autoplay requires explicit confirmation and does not place consecutive bets from a single click: the AUTO button opens a count menu (`ControlBar.svelte:135-150`) and the player must then choose a count to start (`:147` calls `startAuto`). Two distinct actions.

### Area H, static files and XSS (PASS)
- A production build was run and `dist` was scanned. There are no references to `fonts.googleapis.com`, `fonts.gstatic.com`, or any CDN host. The only external strings in `dist` are inert literals inside the bundled PixiJS library (a `https://pixijs.com` hello log and a `github.com` source comment), not resource loads.
- Fonts are self hosted via @fontsource and emitted locally (`dist/assets/orbitron-latin-*.woff2` and `.woff`). No external font, image, script or style origin is loaded.

### Area L, build and type health (PASS)
- `npx tsc --noEmit` exits 0 with zero errors.
- `npm run build` succeeds, 579 modules transformed, built in roughly 29 seconds, with no warnings or errors reported.

---

## 6. Audit blockers

None. Every check completed. The only check that could not be fully confirmed by inspection is the visual rendering at the six required viewport sizes (Area I), which needs a running browser. It is recorded as UNKNOWN rather than as a failed check, with the one concrete CSS risk noted as Quality 6.

---

## 7. Recommended fix batches

The findings group into four prompt sized batches.

### Batch 1, Disclaimer and rules (1 blocker, 1 quality)
- Add the seven point game disclaimer to `PaytableModal.svelte`, localised (Blocker 2).
- Keep the info button reachable during a spin (Quality 3).
- Self contained, touches one component plus the i18n strings.

### Batch 2, Input and controls (1 blocker, 1 quality)
- Map the spacebar to the spin or bet action (Blocker 3).
- Add a short controls legend or button guide (Quality 5).
- Touches `App.svelte` or `ControlBar.svelte` plus `PaytableModal.svelte`.

### Batch 3, RGS bet levels and currency display (1 blocker, 2 quality)
- Wire `auth.betLevels` into a non locked active bet levels store and have the selector use it (Blocker 1). Requires relocating the increase and decrease logic out of the locked store or driving it from the new store.
- Render `currencyCode` instead of the hardcoded USD in balance and bet displays (Quality 4).
- Apply social mode labels in the live game by passing the mode argument to `t()` (Quality 8).
- This is the largest batch and interacts with the locked `gameStore.ts`, so it needs careful design of the override layer.

### Batch 4, Polish and hygiene (3 quality)
- Floor the replay win multiply (Quality 1).
- Gate or remove the replay console logs (Quality 7).
- Make the win banner width responsive and verify the small popout (Quality 6).
- Optionally reword the math jackpot comment (Quality 2, locked directory, defer to math owner).

Suggested order: Batch 1 and Batch 2 first (highest approval value, lowest risk), then Batch 3 (the architectural one), then Batch 4.

---

## 8. Lock integrity confirmation

At the end of the audit, the three hard locked targets have an empty `git diff`:

```
git diff frontend/src/lib/services/rgsService.ts   -> empty
git diff frontend/src/lib/stores/gameStore.ts      -> empty
git diff games/future_spinner/                      -> empty
```

No source file was modified during this audit. The only new file is this report.
