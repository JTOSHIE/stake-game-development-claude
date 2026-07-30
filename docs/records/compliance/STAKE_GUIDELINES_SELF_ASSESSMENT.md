# Stake Engine testing guidelines: our own self-assessment

**Source.** The 58-item "Reference checklist for testing" on the Future Spinner Math page,
captured and transcribed by the owner on 2026-07-26. The platform shows it as a manual
tick-list at **0 of 58**; nothing on the platform is ticked yet, and ticking it there is the
owner's action, not ours.

**Why this document exists.** Owner instruction, 2026-07-26: *"we should be working against
[these guidelines] as well, should be completing those guidelines prior to completing them
on stake engine"*. So this is our internal pass, run before the owner ticks anything. Each
row carries the evidence a reviewer could check, per (l.3).

**Status vocabulary, and it is deliberately strict:**

| Status | Meaning |
|---|---|
| **PASS** | Verified from code, a test, or a capture. Evidence cited. |
| **FAIL** | Verified as not meeting the requirement. Evidence cited. |
| **OBSERVE** | Cannot be settled from the repository. Needs a live DTT observation. |
| **CONFLICT** | Our implementation follows a first-party source that contradicts this guideline. Needs a ruling, not a fix. |
| **OWNER** | Not a build item. Portal, process or business action. |

**SUPERSEDED HEADLINE, kept because it dates the rest of this document. All four are CLOSED.**
**Items 15, 25 and 46 were fixed (TR-065, TR-066, TR-067) and item 12's conflict was settled in our
favour on the owner's 2026-07-28 live captures (TR-064), with no code change.** The current
position is `reports/FABLE_COMMS.md` entry 032, Fable's merged sheet, as corrected by entry 033.
**Two of its ticks did NOT survive verification: item 50 and item 53. Read entry 033 before
ticking anything.** The original headline read:

**Headline: 3 FAIL, 1 CONFLICT, and they are all cheap.** Nothing here threatens the maths
or the architecture.

---

## PreChecks

| # | Item | Status | Evidence |
|---|---|---|---|
| 1 | Game authenticates with RGS successfully on game launch | **PASS** | The published game launched, drew a real balance and played 143 live rounds settling against the wallet. Session panel reconciles to the balance exactly (see the QA artefact, part 2). |
| 2 | Game authentication fails correctly with an invalid `rgs_url` | **OBSERVE** | `normaliseRgsUrl()` and `handleRGSError()` exist in `rgsService.ts`, and there is a live guard that blocks betting without launch params, but failure behaviour against a deliberately bad URL has never been run. One DTT observation. |
| 3 | Clicking the bet button sends a successful play request | **PASS** | 143 settled rounds in the platform's own Bets panel, each with an Event ID, cost and payout. |

## Compliance Checks

| # | Item | Status | Evidence |
|---|---|---|---|
| 4 | Game title unique, no restricted terms | **PASS** | Trademark gate closed with documented searches (recorded in the tracker); "Future Spinner" carries no term from the 39-row prohibited list in `vocabulary.ts`. |
| 5 | Assets and imagery not offensive or inappropriate | **PASS** | All art produced in-house from vector masters or owner-approved enhancement; no third-party or generated-likeness content. |
| 6 | Sufficiently distinct from existing titles and series | **PASS** | Original IP, original mechanic naming (Overdrive Free Spins), no Stake branding anywhere in shipped assets or text. |

## Game Thumbnail

| # | Item | Status | Evidence |
|---|---|---|---|
| 7 | Thumbnail meets Stake artwork guidelines | **OWNER** | Composed in the Tile Editor from `03_branding/FutureSpinner-BG.jpg` and `-FG.png`. The portal still shows a "Design Thumbnail" placeholder in every capture, so this is **not yet done**. |

## RGS Requirements: Bet Levels

| # | Item | Status | Evidence |
|---|---|---|---|
| 8 | Dynamically uses all betting parameters from authenticate | **PASS** | `stores/betLadder.ts` drives both bet surfaces from `rgsBetLevels` with the hardcoded ladder as fallback only; pinned by `betLadder.test.ts` including the three arithmetic cases from the R5/TR-013 defect. |
| 9 | Active rounds restore the bet amount from authenticate | **OBSERVE** | `stores/sessionRecovery.ts` implements resume-and-settle and is unit-tested, but has never run against a real interrupted round. This is DTT check 5. |

## RGS Requirements: Currency Support

| # | Item | Status | Evidence |
|---|---|---|---|
| 10 | Supports and displays currencies correctly | **PASS** | `currency.test.ts` pins USD, XSC, XGC and the SC/GC aliases, including trailing placement. Live USD confirmed across 143 rounds. |
| 11 | Displays sub-cent payouts correctly | **OBSERVE** | Integer-micros throughout (`CURRENCY_SCALE = 1_000_000`, single declaration, drift-tested), so sub-cent values are representable. Not yet seen rendered at a real sub-cent payout. |

## RGS Requirements: RGS requests

| # | Item | Status | Evidence |
|---|---|---|---|
| 12 | **Zero-win bets do not send an end-round request** | **CONFLICT** | See TR-064. `rgsService.ts:797` reads `playResp.round ? playResp.active : playResp.winMicros > 0`. That gate was **deliberately changed** from `winMicros > 0` to the round's `active` flag under the JOB 4 sanction, on the official client's own instruction: *"Only call this API if Play() has returned an Active result"*. If the RGS returns `active: true` on a zero-win round we will send end-round and breach this guideline; if it returns `active: false` we comply and the guideline and the client agree. **The client documentation and this checklist cannot both be followed until we observe which it is.** One network capture on a zero-win spin settles it. |
| 13 | Insufficient balance bets do not send a play request | **PASS** | Two independent guards: the `canSpin` derived store, and `App.svelte:1003` `if (cost > bet && $balance < cost) return` for the per-tier buy cost. |

## Frontend Requirements

| # | Item | Status | Evidence |
|---|---|---|---|
| 14 | Space bar bound to the bet button | **PASS** | `App.svelte:1175` handles `Space`, routes through `handleSpin` and the same `canSpin` guard, is inert in replay mode and while a modal is open, and respects the jurisdiction `disabledSpacebar` flag. |
| 15 | **Main game frame should not be scrollable** | **FAIL** | See TR-065. `:global(body)` is correctly `overflow: hidden`, but `App.svelte:1821` gives `.game-wrapper.portrait`, `.game-wrapper.compact-landscape` and `.game-wrapper.mini-player` `overflow-y: auto`. A scrollbar is visible in the owner's captures at mobile portrait, Mobile S and Popout S, and is absent on desktop, which is exactly the class list. Confirmed from code and corroborated by three captures at three sizes. |

## Game Rules

| # | Item | Status | Evidence |
|---|---|---|---|
| 16 | RTP and Max Win clearly stated | **PASS** | `translations.ts:1254` `rulesOverdriveModes`, keyed in all 16 locales, plus `FS_RTP_LABEL` and `FS_MAX_WIN_LABEL` on the mode cards. Visible in the owner's paytable capture. |
| 17 | Payout information per symbol clearly communicated | **PASS** | Symbol payout grid, 3x/4x/5x per symbol, visible in the capture: H1 1.5/6/22, H2 0.8/3/10. Matches the PAR sheet. |
| 18 | Win combinations displayed in the rules | **PASS** | The 1,024 ways panel plus the reel-adjacency diagram (reels 1-2-3 highlighted) in `PaytableModal.svelte`. |
| 19 | Game modes include description and cost information | **PASS** in English, **see TR-059** | Every mode card carries a label, blurb and cost, and the live capture shows correct pricing (Buy Overdrive `100x, $50,000.00` at a $500 bet). The descriptions are English-only in every locale, which is TR-059. |
| 20 | Free game and re-trigger conditions clearly displayed | **PASS** | Scatter card states `3 / 4 / 5 = 1x / 3x / 10x + 8 / 12 / 16 free spins`; retrigger and the Overdrive meter are described in the rules block. |
| 21 | General disclaimer included in game information | **OBSERVE** | The replay disclaimer is keyed and rendering live (seen in the replay capture). Whether the platform means that one or a separate general disclaimer in the info panel is ambiguous; check against a reviewed title. |

## Responsive Checks

| # | Item | Status | Evidence |
|---|---|---|---|
| 22 | Functions correctly on Desktop/Laptop | **PASS** | Captures at Desktop 1200x675 and Laptop 1024x576: full HUD, correct balance, no clipping. |
| 23 | Functions correctly on Popout S/L | **PASS with a defect** | Both captured. Popout L renders the full landscape HUD; Popout S renders the mini strip with all seven controls. **The mini strip's WIN readout is clipped mid-glyph** in the capture, and item 15's scrollbar is present. See TR-065 and TR-066. |
| 24 | Functions correctly on Mobile | **PASS with a defect** | Mobile portrait and Mobile S captured and playable. Same scrollbar defect. |
| 25 | **Double tap to zoom is disabled on mobile** | **FAIL** | See TR-066. `frontend/index.html` viewport meta is `width=device-width, initial-scale=1.0, viewport-fit=cover` with no `maximum-scale` or `user-scalable=no`, and `touch-action` appears nowhere in `frontend/src`. Nothing disables double-tap zoom. |

## Auto Play

| # | Item | Status | Evidence |
|---|---|---|---|
| 26 | Auto-bet requires a confirmation step before starting | **OBSERVE** | `HudOverlay.svelte:150 startAuto()` starts immediately when a count is chosen. The AUTO menu is a two-step interaction (open, then choose a count with stop-conditions) which most reviewers accept, but there is no explicit confirm dialog. Needs a ruling on whether the menu counts. |
| 27 | High cost bet modes require confirmation before activation | **PASS** | `FeatureMenu.svelte activateBuy()` routes through a confirm dialog sharing `stores/buyAffordability.ts` with the card, so price and affordability cannot disagree (the TR-016 fix). |
| 28 | User interaction guide included in game information | **OBSERVE** | Rules and paytable are comprehensive; whether a separate controls guide is required is not clear from the wording. |

## Sounds / Music

| # | Item | Status | Evidence |
|---|---|---|---|
| 29 | Option to disable sounds | **PASS** | Audio panel with a mute toggle plus separate MUSIC and SOUND volume sliders, present in all four HUD profiles (`HudOverlay.svelte` lines 373, 499, 567, 721). |

## Multiple Language Support

| # | Item | Status | Evidence |
|---|---|---|---|
| 30 | Supports English language | **PASS** | Default locale, fully keyed. |
| 31 | Invalid language parameters do not break display | **OBSERVE** | `t()` falls back per key, so an unknown locale should degrade to English rather than blank. Never tested with a junk `lang=` value. One DTT observation. |
| 32 | Check 5 wins for each game mode against the Game Rules | **OWNER/OBSERVE** | Requires playing each of the five modes and reconciling wins to the paytable. The Bets panel's per-bet "Replay this bet" makes this straightforward now. |
| 33 | Mystery Mode probability values accurate | **N/A** | No Mystery Mode in this game. |

## Jurisdiction Requirements: Stake.US

| # | Item | Status | Evidence |
|---|---|---|---|
| 34 | Compliant with required translations for a social game | **PASS in mechanism** | `vocabulary.ts` carries all 39 prohibited terms verbatim from the jurisdiction mirror, with `sv()` substitution and a full-DOM `scanProhibited()` conformance scan. |
| 35 | Bet button does not display "Bet" | **PASS** | `sv('BET', $isSocial)` routing, pinned by `vocabulary.test.ts:124`. |
| 36 | Game Info contains no restricted word | **PASS** | Full-DOM scan, which is what caught TR-058 ("Prizes pay left to right"). |
| 37 | Bet amount field not labelled "Bet Amount" | **PASS** | Same substitution layer. |
| 38 | Auto-bet feature free of restricted "Bet" terminology | **PASS** | Same. |
| 39 | Bonus Buy label does not contain "BUY" | **PASS** | `socialLabel` per mode in `fsModes.ts`. |
| 40 | Confirmation step free of restricted terminology | **PASS** | Confirm dialog copy routed through `sv()`. |
| 41 | Insufficient funds error free of restricted words | **PASS** | Keyed and substituted. |
| 42 | Supports SC and GC currencies | **PASS** | `currency.test.ts:44-51` pins XSC, XGC and the SC/GC aliases. |
| 43 | Currency values do not display a "$" prefix | **PASS** | `formatBalance(1000 * S, 'XSC', 'en')` returns `1,000.00 SC`, trailing, no prefix. Tested. |
| 44 | Game mode naming follows Social Mode terminology | **PASS** | Per-mode `socialLabel` and `socialBlurb`. |
| 45 | Replay window free of restricted words | **PASS** | Replay disclaimer has a dedicated social phrasing (`translations.ts:1622`). |
| 46 | **English is the only supported language in Social Mode** | **FAIL** | See TR-067. `i18n/tr.ts:14` derives from `[locale, isSocial]` and uses `$locale` regardless: social mode switches the *vocabulary*, never the *language*. A social session launched with `lang=de` would render German. Nothing forces English. |

## Replay Support

| # | Item | Status | Evidence |
|---|---|---|---|
| 47 | Supports replay urls, loads and plays the desired event | **PASS** | Confirmed live: "Replay this bet" on Event ID 52121 opened the replay overlay with the correct mode, bet and currency, and the disclaimer rendering. |
| 48 | Supports optional parameters (currency, language, amount) | **PASS in code, OBSERVE live** | `replayService.ts` parses them and the overlay showed `Mode: base`, `Bet: $1.00`, `Currency: USD`. Language variation not yet exercised. |
| 49 | Replay allows replaying again after completion | **OBSERVE** | Not exercised in the captures. |
| 50 | UI clearly displays bet cost and applied multiplier | **PASS** | The replay overlay shows mode, bet and currency; the platform's own row shows `Cost multiplier x1.00`. |
| 51 | Supports Replays in Popout S view | **OBSERVE** | Replay confirmed at full size and the mini HUD confirmed separately, but not the two together. |

## Final approval checklist

| # | Item | Status | Evidence |
|---|---|---|---|
| 52 | Bet-level templates applied | **PASS** | Maths page: Bet Level Validator returns "Up to 1000x". |
| 53 | Provably Fair and Replay enabled | **OWNER, and DO NOT TICK YET** | Replay is demonstrably working. **The Provably Fair half is unproven in EITHER direction**: `grep -rn -iE "provably" reports/screens/` returns zero, so no committed frame shows the portal surface where such a setting would live. Entry 032's sheet claims no toggle exists; no artefact here supports that. **One look at the entry and one frame settles it**, including a frame showing there is none. |
| 54 | Front and Math requests approved | **OWNER** | Not started. Requires Start Approval. |
| 55 | Posted in the stake-engine-game-approved channel | **OWNER** | Post-approval. |
| 56 | Works on older mobile devices (Android and iOS) | **OBSERVE** | Only DTT viewport emulation so far, which is not a real device. |
| 57 | Approval request closed after live, emoji added | **OWNER** | Post-release. |
| 58 | Game Released | **OWNER** | Final step. |

---

## Summary

| Status | Count |
|---|---|
| PASS | 31 |
| OBSERVE | 14 |
| OWNER | **7 by the rows, not 8.** The rows carry OWNER on items 7, 53, 54, 55, 57, 58 plus item 32 as OWNER/OBSERVE. This summary said 8 and `OWNER_CHECKLIST.md` said 9; **all three figures disagreed and none had been recounted.** Corrected 2026-07-30 by counting the rows. |
| **FAIL** | **3** (items 15, 25, 46) |
| **CONFLICT** | **1** (item 12) |
| N/A | 1 |

**The three failures are all small, self-contained frontend changes**: one CSS rule, one
meta tag plus a `touch-action`, and one locale-forcing line in a derived store. None touches
a locked file. None touches the maths.

**The conflict is not a bug and must not be "fixed" without a ruling.** It is a genuine
disagreement between the official client's documented rule and this checklist, and the
correct move under (l.6) and (l.8) is to observe the RGS once and then follow the evidence.

**Fourteen OBSERVE items are the real remaining work**, and most of them fall out of the ten
DTT_PROTOCOL.md checks the owner has yet to run. The Bets panel's per-bet "Replay this bet"
button and the Local Testing redirect URL together make that session much cheaper than it
looked.
