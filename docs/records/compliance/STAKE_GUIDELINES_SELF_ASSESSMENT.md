# Stake Engine testing guidelines: our own self-assessment

**Source.** The 58-item "Reference checklist for testing" on the Future Spinner Math page,
captured and transcribed by the owner on 2026-07-26. The platform shows it as a manual
tick-list at **0 of 58**; nothing on the platform is ticked yet, and ticking it there is the
owner's action, not ours.

> **PROVENANCE, added 2026-08-05 per protocol rule 16. The 58 item texts below are
> REPORTED, not VERIFIED, and there is no mirror of them anywhere in this repository.**
> Their single source is the owner's transcription of 2026-07-26. **No capture exists and
> none can be made by this seat**: the criteria page is login-gated, recorded under the
> `submission-checklist` bullet of `COMPLIANCE_WATCH.md`, and every capture attempt has
> stored the login wall instead of the page.
>
> **What that does and does not put in doubt.** The EVIDENCE column is ours and is verified
> or observed as each row says. What rests on a single unmirrored source is the WORDING of
> each requirement. If a guideline was transcribed loosely, a row could be assessed against
> a requirement the platform did not write, and nothing in this repository would catch it.
> Capturing the authenticated page is an owner action on his next portal login, and it is
> the only thing that upgrades this block to VERIFIED.

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
| 7 | Thumbnail meets Stake artwork guidelines | **PASS** | **CLOSED 2026-08-09 by the platform's own assertion, which is better evidence than a visual read.** The pre-submission checklist at the approval screen reports **"Thumbnail is set"** with a green tick. The Tile Editor separately shows the composed tile rendering: robot, FUTURE SPINNER, WE ROLL SPINNERS on the neon city background. **A note on what the platform actually stores:** the Tile Editor composes from SEPARATE layers, a background image, a foreground element, a gradient and a game title, rather than from our single pre-composed master. So `design-system/brand/delivery/FutureSpinner-Tile.png` at 408x546 is the reference and the record of geometry, not necessarily the bytes the portal holds. The old text said the portal still showed a Design Thumbnail placeholder in every capture; that predates the tile rework and is superseded. ORIGINAL FINDING, retained: | Composed in the Tile Editor from `03_branding/FutureSpinner-BG.jpg` and `-FG.png`. The portal still shows a "Design Thumbnail" placeholder in every capture, so this is **not yet done**. |

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
| 12 | **Zero-win bets do not send an end-round request** | **PASS** | **Re-derived 2026-08-05: CLOSED by observation, no code change, TR-064 in `REVIEW_TRACKER.md` is CLOSED.** The owner's live captures of 2026-07-28 settle it as a matched pair: `reports/screens/owner-session-2026-07-28/152145_frame.png` shows the Network tab filtered on wallet across eight consecutive settled zero-win rounds with nine rows, every one `play` and no `end-round`; `152225_frame.png` from the same session forty seconds later interleaves four `end-round` rows, proving the filter does show them when emitted. So the RGS returns `active: false` on a zero-win round, the gate does not fire, and the guideline is met by the code as it stands. **The two first-party sources never actually conflicted in practice.** Retained for the record: `rgsService.ts:799` reads `playResp.round ? playResp.active : playResp.winMicros > 0`. That gate was **deliberately changed** from `winMicros > 0` to the round's `active` flag under the JOB 4 sanction, on the official client's own instruction: *"Only call this API if Play() has returned an Active result"*. If the RGS returns `active: true` on a zero-win round we will send end-round and breach this guideline; if it returns `active: false` we comply and the guideline and the client agree. **The client documentation and this checklist cannot both be followed until we observe which it is.** One network capture on a zero-win spin settles it. |
| 13 | Insufficient balance bets do not send a play request | **PASS** | Two independent guards: the `canSpin` derived store, and `App.svelte:1003` `if (cost > bet && $balance < cost) return` for the per-tier buy cost. |

## Frontend Requirements

| # | Item | Status | Evidence |
|---|---|---|---|
| 14 | Space bar bound to the bet button | **PASS** | `App.svelte:1175` handles `Space`, routes through `handleSpin` and the same `canSpin` guard, is inert in replay mode and while a modal is open, and respects the jurisdiction `disabledSpacebar` flag. |
| 15 | **Main game frame should not be scrollable** | **PASS** | **FIXED 2026-08-05.** `App.svelte`'s wrapper rule now sets `overflow-y: hidden` on `.game-wrapper.portrait`, `.compact-landscape` and `.mini-player`. Measured before changing rather than assumed: the wrapper's scrollHeight equals its clientHeight at every preset except Popout S, where it exceeded it by ONE pixel, which is exactly enough for `auto` to render a scrollbar. Safe to hide because `layout_fit_gate.mjs` reports offscreen 0, clipped 0 and every control reachable at all seven presets both before and after, so nothing was put out of reach. Re-measured after: `overflow-y` reads `hidden` at all four affected presets and the gate still passes. ORIGINAL FINDING, retained: | See TR-065. `:global(body)` is correctly `overflow: hidden`, but `App.svelte:2311` gives `.game-wrapper.portrait`, `.game-wrapper.compact-landscape` and `.game-wrapper.mini-player` `overflow-y: auto`. A scrollbar is visible in the owner's captures at mobile portrait, Mobile S and Popout S, and is absent on desktop, which is exactly the class list. Confirmed from code and corroborated by three captures at three sizes. **RE-DERIVED 2026-08-05 AND STILL FAILING**: the `overflow-y: auto` is unchanged at `App.svelte:2311`, inside the rule that opens on the three wrapper classes. The line reference is corrected here from `:1821`, which had drifted; the row that asked for this correction proposed `:2265`, which is also wrong. |

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
| 25 | **Double tap to zoom is disabled on mobile** | **PASS** | **Re-derived 2026-08-05: FIXED.** `frontend/src/app.css` now sets `touch-action: manipulation`, under a header naming this guideline item and JOB 3(c) as the pass that closed it. Its comment records why that is the correct instrument rather than the obvious one: a `maximum-scale` or `user-scalable=no` viewport meta is ignored by mobile Safari, so a gate reading the meta tag would show green while a player could still double-tap the reels and zoom the board. `manipulation` removes the double-tap-to-zoom delay while leaving panning and PINCH zoom intact, so a player who needs to magnify the paytable still can. The old FAIL text described `frontend/index.html`'s viewport meta, which is unchanged and is deliberately not the fix. |

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
| 46 | **English is the only supported language in Social Mode** | **PASS** | **THE FAIL VERDICT WAS WRONG, AND SO WAS THE RE-DERIVATION OF 2026-08-05 THAT UPHELD IT.** Both looked at `i18n/tr.ts`, saw `$locale` passed through untouched, and concluded nothing forces English. That is the wrong LAYER. `tr.ts` translates into whatever locale is set; the enforcement sits upstream at the locale store. Two routes, both in `frontend/src/lib/stores/socialLocale.ts`: its launch resolver checks social FIRST, so the URL route cannot produce a non-English social session before first paint; and its social-English enforcer, called from `frontend/src/App.svelte`, subscribes to the social store and sets the locale to English whenever social turns on, which covers the authenticate route where social arrives after paint. `REVIEW_TRACKER.md` TR-067 already reads CLOSED. **PROVEN EMPIRICALLY 2026-08-05 against a real build rather than by reading**: `?lang=de` renders German ("Spiel nicht verfuegbar"), while `?lang=de&social=true`, `?lang=fr&social=true` and `?lang=ja&social=true` all render English ("Game unavailable"), with the social vocabulary also applied (COINS rather than BALANCE). ORIGINAL FINDING, retained because the correction is the record: | See TR-067. `i18n/tr.ts:14` derives from `[locale, isSocial]` and uses `$locale` regardless: social mode switches the *vocabulary*, never the *language*. A social session launched with `lang=de` would render German. Nothing forces English. **RE-DERIVED 2026-08-05 AND STILL FAILING**: `tr.ts` still reads `derived([locale, isSocial], ([$locale, $social]) => t($locale, key, $social ? 'social' : 'real', params))`. The social flag still selects the VOCABULARY argument only, and `$locale` is still passed through untouched. |

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
| 59 | **Game should not contain the Stake Engine Loader** | **PASS** | **ADDED 2026-08-09. This requirement is on the platform's published checklist as a PreCheck and had never been assessed here**, found by diffing the first capture of that page, mirrored at `docs/stake-engine-live/2026-08-09/submission-checklist.md`, against our rows. It PASSES, and provably: `grep` for the loader across `frontend/src` and the built bundle returns nothing, no loader symbol survives into `frontend/dist`, and the game ships its own loading surfaces rather than the platform's. **A related observation, not a breach:** `frontend/package.json` declares `stake-engine: github:StakeEngine/ts-client` and NOTHING imports it. It appears only in comments recording where the wire contract was transcribed from, so it is tree-shaken out and reaches no artefact, but it is a dependency the game does not use. |
| 53 | Provably Fair and Replay enabled | **PASS** | **CLOSED 2026-08-09 by an owner capture, and it closed in the direction nobody had checked.** This row said the Provably Fair half was unproven in EITHER direction and that one frame would settle it, INCLUDING a frame showing there is none. That is the frame that arrived. The game Settings pane contains, in its entirety: a General block with Game Name and URL Slug, an Update game button, and a Danger Zone with Delete Game. **There is no Provably Fair setting at game level.** The Replay half was already demonstrable. So the item is satisfied by the platform not offering the toggle rather than by us enabling it, and the earlier claim that no toggle exists now rests on an artefact instead of an assertion. The same capture independently confirms the URL Slug reads `future-spinner`, with no numeric suffix. ORIGINAL FINDING, retained: | Replay is demonstrably working. **The Provably Fair half is unproven in EITHER direction**: `grep -rn -iE "provably" reports/screens/` returns zero, so no committed frame shows the portal surface where such a setting would live. Entry 032's sheet claims no toggle exists; no artefact here supports that. **One look at the entry and one frame settles it**, including a frame showing there is none. |
| 54 | Front and Math requests approved | **OWNER** | Not started. Requires Start Approval. |
| 55 | Posted in the stake-engine-game-approved channel | **OWNER** | Post-approval. |
| 56 | Works on older mobile devices (Android and iOS) | **OBSERVE** | Only DTT viewport emulation so far, which is not a real device. |
| 57 | Approval request closed after live, emoji added | **OWNER** | Post-release. |
| 58 | Game Released | **OWNER** | Final step. |

---

## Summary

**RECOUNTED 2026-08-05, S2-C045, AND THE COUNTING RULE IS NOW WRITTEN DOWN**, because the
old figures could not be reproduced from the rows by any stated rule and summed to 57
against 58 items.

**The rule: count each row by the FIRST word of its Status cell.** Seven rows carry a
qualified status and are listed below so nothing hides inside a bucket.

| Status | Count | Which |
|---|---|---|
| PASS | **40** | 31 plain, plus items 19, 23, 24, 34 and 48 whose status begins PASS with a qualifier, plus items 12, 15, 25 and 46 promoted by this pass |
| OBSERVE | **10** | plain OBSERVE only; item 32 counts under OWNER and item 48 under PASS, by the first-word rule |
| OWNER | **7** | items 7, 53, 54, 55, 57, 58, plus item 32 as OWNER/OBSERVE. Recounted 2026-07-30 against a summary saying 8 and an `OWNER_CHECKLIST.md` saying 9. **S2-C045 asked for this to be restated as 8; that was checked against the rows and refused, because 7 is what the rows say.** |
| **FAIL** | **0** | **Items 15 and 46 both closed 2026-08-05.** 15 was a real defect and is fixed; 46 was never a defect and the FAIL verdict is corrected, with the empirical proof in the row. |
| CONFLICT | **0** | item 12 is closed by observation |
| N/A | 1 | |

**40 + 10 + 7 + 0 + 0 + 1 = 58**, which is the number of items. The previous figures did
not reconcile and that is why they were replaced rather than adjusted.

**THE ROW THAT ASKED FOR THIS WANTED FAIL 0 AND CONFLICT 0. TWO ITEMS STILL FAIL**, both
re-derived from source today and both recorded above: item 15's `overflow-y: auto` is
unchanged, and item 46 still passes `$locale` through regardless of social mode. Escalated
per convention (l.8) rather than restated as closed.

**The seven qualified rows**, so the first-word rule is auditable: 19, 23, 24, 32, 34, 48,
53.

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
