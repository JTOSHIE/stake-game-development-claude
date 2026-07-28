# STT-STRETCH-B, typography (stretch, frames 390 to 415)
scope: every `stretch` session frame numbered 390 to 415 inclusive, 26 frames, viewport 1920x800, lang `en`, build HEAD `d9bdf22`. Every one opened with the Read tool and looked at.
frames_read: 26

## STT-STRETCH-B-01 HIGH The win line readout never singularises: it reads `1 ways`
- Frames: `reports/screens/stream-test-2026-07-28/394_stretch_autoplay_menu.png`, `401_stretch_transition_feature_entry_fade.png`, `402_stretch_feature_entry_card.png`, `403_stretch_transition_feature_starting.png`, `404_stretch_feature_run_1.png`, `409_stretch_feature_run_6.png`, `410_stretch_transition_feature_exit.png`, `415_stretch_post_collect_base.png`
- Claim: the win detail strip under the reels writes the ways count with an unconditional plural. Frame `394` reads `L3  x4  1 ways  $0.20`. Frames `401`, `402`, `403`, `404`, `409` and `410` read `L2  x5  1 ways  $0.80`. Frame `415` reads `M3  x3  1 ways  $0.20`. The same strip pluralises correctly only because the number happens to be greater than one: frames `405` to `408` and `411` read `SCATTER  x5  5 ways  $10.00`. So the string is built as `${ways} ways` with no singular branch, and every single way win in the session prints `1 ways`. This is the canonical machine generated tell the standing mandate names, on a surface that is on screen for most of the round.
- Where fixable: UNKNOWN
- Proposed fix: pluralise on the count, `${ways} ${ways === 1 ? 'way' : 'ways'}`, and route it through the locale layer rather than hardcoding either form.

## STT-STRETCH-B-02 HIGH The autoplay panel covers the FEATURES button and truncates its label to `FE`
- Frames: `reports/screens/stream-test-2026-07-28/394_stretch_autoplay_menu.png`
- Claim: with the autoplay menu open at 1920x800 the panel's left edge lands over the FEATURES button. The button, which renders its full label `FEATURES` in every other frame of this range (`393`, `397`, `398`, `399`, `400`, `410`, `411`), renders as `FE` in frame `394`, with the remaining six characters and the right half of the pill border hidden behind the panel. Nothing indicates the button is disabled or dismissed; it is simply sliced mid word. At the stretch viewport this is the only frame where a primary control's label is cut.
- Where fixable: UNKNOWN
- Proposed fix: give the autoplay panel a layout that reserves the FEATURES button's column at wide viewports, or hide the button while the panel is open rather than half covering it.

## STT-STRETCH-B-03 HIGH The letter `x` survives as the multiplication sign on three surfaces that charter row Q-26 does not enumerate, twice in the same view as a correct `×`
- Frames: `reports/screens/stream-test-2026-07-28/391_stretch_paytable_08_responsible_play.png`, `392_stretch_paytable_09_disclaimer.png`, `393_stretch_transition_paytable_closing.png`, `394_stretch_autoplay_menu.png`, `401_stretch_transition_feature_entry_fade.png`, `402_stretch_feature_entry_card.png`, `405_stretch_feature_run_2.png`, `409_stretch_feature_run_6.png`, `411_stretch_post_feature_base.png`, `414_stretch_transition_maxwin_collect_fade.png`, `415_stretch_post_collect_base.png`
- Claim: Q-26 (`docs/QUALITY_CHARTER.md:198`, per LEDGER MID-02) enumerates the survivors of the Q-12 glyph sweep as four instances in `fsModes.ts` (`1.6x`, `1.25x` twice, `5x`), and MID-02 adds a fifth at `WinBanner.svelte:205`. My range shows three further player visible surfaces, none of them in `fsModes.ts` and none of them the win banner:
  1. **The paytable stat pod.** Frames `391` and `392` render `MAX WIN` as `5,000x`. The same figure is written `5,000×` in `FS_MAX_WIN_LABEL` at `frontend/src/lib/config/fsModes.ts:139` per MID-02's own citation, and `5,000× base bet` in the buy dialogs on frames `398` and `400`.
  2. **The win detail strip under the reels.** Frame `393` reads `M3  x5  8 ways  $16.00`, frame `394` reads `L3  x4  1 ways  $0.20`, frame `415` reads `M3  x3  1 ways  $0.20`, frames `405` to `408` and `411` read `SCATTER  x5  5 ways  $10.00`.
  3. **The free spins rail MULTIPLIER pod.** Frames `401` to `409`, `414` and `415` render `MULTIPLIER` `1x`, while the buy dialog sentence describing that same meter on frames `398` and `400` reads `The Overdrive meter starts at 1× and rises +1× after every winning free spin`, and the features menu on frames `395` and `396` writes `1× bet` and `1.25× bet`.
  Items 1 and 3 put the two glyphs on the same screen or one screen apart within a single session. A row written to catch an incomplete sweep is still incompletely swept: the enumeration searched the config and one component and missed the paytable, the win strip and the free spins rail.
- Where fixable: UNKNOWN
- Proposed fix: replace the literal `x` with `×` at each of the three sites, then widen Q-26's enumeration from two files to the whole of `frontend/src/lib/` and add a seeded violation self test per convention (p) so the class is provably closed rather than asserted closed.

## STT-STRETCH-B-04 HIGH The same max win figure is written three different ways on three surfaces in one session
- Frames: `reports/screens/stream-test-2026-07-28/391_stretch_paytable_08_responsible_play.png`, `392_stretch_paytable_09_disclaimer.png`, `397_stretch_transition_dialog_buy_overdrive_opening.png`, `398_stretch_dialog_buy_overdrive.png`, `399_stretch_transition_dialog_nitro_overdrive_opening.png`, `400_stretch_dialog_nitro_overdrive.png`, `412_stretch_transition_maxwin_overlay_fade.png`, `413_stretch_maxwin_celebration.png`
- Claim: the 5,000x cap, the single most quoted number in the game, appears in three incompatible forms:
  - paytable stat pod (`391`, `392`): label `MAX WIN`, value `5,000x`, no unit word.
  - buy confirm dialogs (`397`, `398`, `399`, `400`): label `MAX WIN`, value `5,000× base` wrapping to `bet`, unit words lower case.
  - max win celebration (`412`, `413`): value `5,000` then `X` then `BET`, unit words upper case.
  Three glyphs (`x`, `×`, `X`), three unit strings (none, `base bet`, `BET`). On the celebration the unit is additionally set at two optical sizes: the `X` is roughly 1.6 times the cap height of `BET` and the two runs do not share a baseline, so at the game's most watched moment the unit reads as `5,000X` with `BET` dropped beside and below it, hard against the final `0` with no separating space. The celebration glyph itself is the MID-02 class and is recorded below as KNOWN; the three way disagreement between surfaces is not, and neither is the paytable form.
- Where fixable: UNKNOWN
- Proposed fix: PARK(the unit word choice across the three surfaces is an art call, not a mechanical one). The mechanical half is small and should go now: one shared max win label constant using `×`, consumed by the paytable pod and both buy dialogs. The celebration's two size unit and its baseline need an art decision on whether `X BET` is intended to be one run or two.

## STT-STRETCH-B-05 MEDIUM Mode titles render in two casings and two tracking values inside one component
- Frames: `reports/screens/stream-test-2026-07-28/395_stretch_transition_features_menu_opening.png`, `396_stretch_features_menu.png`, `397_stretch_transition_dialog_buy_overdrive_opening.png`, `398_stretch_dialog_buy_overdrive.png`, `399_stretch_transition_dialog_nitro_overdrive_opening.png`, `400_stretch_dialog_nitro_overdrive.png`
- Claim: in one features menu list (`395`, `396`) the five mode titles are `Normal`, `Cruise`, `OVERBOOST`, `Buy Overdrive` and `NITRO OVERDRIVE`. Three are Title Case with no visible tracking, two are all capitals with visible letter spacing. The two buy cards sit adjacent under the same `BUY FEATURES` heading and disagree with each other: `Buy Overdrive` against `NITRO OVERDRIVE`.
  The disagreement then repeats one level deeper. The confirm dialog title is `Buy Overdrive` on frames `397` and `398` and `NITRO OVERDRIVE` on frames `399` and `400`: same component, same slot, same magenta, two casings and two tracking values, in two dialogs a player opens back to back. This is a source string difference rather than a transform, since the tracking follows the capitals.
  Related to but distinct from KNOWN row Q-34, which is one mode reading two ways across surfaces via `text-transform`. This is different modes reading two ways within one surface.
- Where fixable: UNKNOWN
- Proposed fix: pick one casing convention for mode display names, store all five that way, and apply any capitalisation as a `text-transform` on the class so no future name can drift.

## STT-STRETCH-B-06 MEDIUM `Free Spins` and `free spins` appear in one visible block, and `Scatters` disagrees with `scatters` across surfaces
- Frames: `reports/screens/stream-test-2026-07-28/396_stretch_features_menu.png`, `397_stretch_transition_dialog_buy_overdrive_opening.png`, `398_stretch_dialog_buy_overdrive.png`, `399_stretch_transition_dialog_nitro_overdrive_opening.png`, `400_stretch_dialog_nitro_overdrive.png`
- Claim: the `WHAT YOU GET` block on frames `397` and `398` carries both casings of the same term, three lines apart and both visible at once:
  - `Buy a guaranteed Overdrive Free Spins entry.`
  - `3, 4 or 5 Scatters award 8, 12 or 16 free spins and pay an instant 1×, 3× or 10× total bet.`
  - `The Overdrive meter starts at 1× and rises +1× after every winning free spin, multiplying all later wins. It never resets during the feature.`
  So `Free Spins` and `free spins` and `free spin` in one block. The same block on frames `399` and `400` repeats it.
  `Scatters` is capitalised as a common noun in that middle line while the features menu Normal card on frame `396` writes `Standard play. Overdrive Free Spins trigger on 3+ scatters.` in lower case. Two casings of one word across two surfaces a player moves between in two clicks.
- Where fixable: UNKNOWN
- Proposed fix: settle one rule, most likely Title Case only for the proper feature name `Overdrive Free Spins` and lower case for the generic `free spins` and `scatters`, then sweep the dialog and menu copy to it.

## STT-STRETCH-B-07 MEDIUM The `MAX WIN` stat cell wraps and orphans `bet`, breaking the stat row
- Frames: `reports/screens/stream-test-2026-07-28/397_stretch_transition_dialog_buy_overdrive_opening.png`, `398_stretch_dialog_buy_overdrive.png`, `399_stretch_transition_dialog_nitro_overdrive_opening.png`, `400_stretch_dialog_nitro_overdrive.png`
- Claim: the buy dialog stat row has three cells. `PRICE` renders `$100.00` (`397`, `398`) or `$400.00` (`399`, `400`) on one line, `RTP` renders `96.35%` on one line, and `MAX WIN` renders `5,000× base` on line one with `bet` alone on line two. The third cell is therefore one line taller than its siblings, the row's values no longer share a baseline, and the two vertical divider rules between cells run past the shorter values. This is a non money string failing its container, so it is outside the TR-115 / TR-086 money fit class; the `$400.00` price beside it fits with room to spare.
- Where fixable: UNKNOWN
- Proposed fix: shorten the value to `5,000×` and move `base bet` into the cell label, or widen the third column, so all three cells are one line at every price.

## STT-STRETCH-B-08 MEDIUM The autoplay option labels are the only sentence case labels on the HUD layer, and are visibly lighter than their own panel heading
- Frames: `reports/screens/stream-test-2026-07-28/394_stretch_autoplay_menu.png`
- Claim: the four autoplay options read `Stop on win`, `Single win limit`, `Stop on feature` and `Loss limit`, in sentence case, at a normal weight and a narrower letterform than anything else on the HUD layer. Every other label rendered on that layer in this range is upper case in the brand display face with tracking: `BALANCE`, `WIN`, `BET`, `MAX`, `FEATURES`, `SPIN` (`393`, `394`), `OVERDRIVE FREE SPINS`, `TOTAL WIN`, `MULTIPLIER` (`401` to `409`, `414`, `415`), and `SPINS`, which sits inside this same autoplay panel about 40px below the fourth option and is upper case, tracked and coloured. One panel, two label systems.
  These four strings are also the ones KNOWN row Q-16 parks as hardcoded English; this frame is the evidence that they are visible on a stream frame rather than buried.
- Where fixable: UNKNOWN
- Proposed fix: bring the four option labels onto the HUD label class (upper case, tracked, brand face) so the panel reads as one component, or state in the charter that the autoplay options are deliberately sentence case and apply that to `SPINS` too.

## STT-STRETCH-B-09 LOW Two different input idioms in one session on one desktop viewport
- Frames: `reports/screens/stream-test-2026-07-28/401_stretch_transition_feature_entry_fade.png`, `402_stretch_feature_entry_card.png`, `403_stretch_transition_feature_starting.png`, `404_stretch_feature_run_1.png`, `405_stretch_feature_run_2.png`, `406_stretch_feature_run_3.png`, `407_stretch_feature_run_4.png`, `408_stretch_feature_run_5.png`, `409_stretch_feature_run_6.png`, `413_stretch_maxwin_celebration.png`, `415_stretch_post_collect_base.png`
- Claim: the free spins entry gate reads `TAP TO CONTINUE`, a touch idiom, on a 1920x800 desktop viewport where there is no touch input. Fourteen frames later the max win overlay on the same session and the same viewport reads `PRESS COLLECT OR HIT ENTER TO CONTINUE` (`413`), a keyboard idiom. Two continue gates, two mutually exclusive assumptions about the player's input device, both shown to the same player in one round.
- Where fixable: UNKNOWN
- Proposed fix: use one device neutral verb on both gates (`CONTINUE`, or `PRESS COLLECT OR HIT ENTER TO CONTINUE` shortened to match), or branch on pointer type so a desktop session never reads `TAP`.

## STT-STRETCH-B-10 LOW The NITRO OVERDRIVE blurb orphans `5x.` on its own line, on the card and in the dialog
- Frames: `reports/screens/stream-test-2026-07-28/395_stretch_transition_features_menu_opening.png`, `396_stretch_features_menu.png`, `399_stretch_transition_dialog_nitro_overdrive_opening.png`, `400_stretch_dialog_nitro_overdrive.png`
- Claim: `Buy a rich entry with the Overdrive meter pre-revved to 5x.` wraps after `to` in both places it is rendered, leaving `5x.` alone on line two. In the features card (`395`, `396`) the orphan sits directly beneath a line that fills the column, and it is the only two line blurb in the list; in the dialog (`399`, `400`) it is the only two line item in the `WHAT YOU GET` block whose second line is a single token.
- Where fixable: UNKNOWN
- Proposed fix: bind the last two words with a non breaking space, or shorten the blurb by two characters so it sets on one line at both widths.

## Explicit absences, signed

Each of the following was looked for on all 26 frames and is absent. Where I cannot claim absence, I say so rather than signing it.

- **No double spaces** in any player visible string. Checked every prose block in the range: the interface guide item descriptions (`390`, `391`, `392`), the `RESPONSIBLE PLAY` paragraph and the four line `DISCLAIMER` paragraph (`391`, `392`), all five mode blurbs (`395`, `396`), both `WHAT YOU GET` blocks (`397` to `400`), and the max win hint line (`412`, `413`).
- **No mixed straight and curly quotes.** There is no apostrophe and no quotation mark of any kind anywhere in these 26 frames, so the class cannot be violated here.
- **No em dashes and no en dashes in player visible prose.** The only long horizontal glyph in the range is the decrement control in the FEATURES bet stepper (`395`, `396`), which is a button glyph and not prose. `Double-chance:` (`395`, `396`) and `pre-revved` (`395`, `396`, `399`, `400`) use hyphens correctly.
- **No currency format disagreement.** Every money figure in the range is `$`, comma grouped integer part, `.`, exactly two decimals: `$50,000.00`, `$5,000.00`, `$1.00`, `$16.20`, `$16.00`, `$0.20`, `$0.80`, `$10.00`, `$10.80`, `$2.80`, `$348.34`, `$363.89`, `$100.00`, `$400.00`, `$1.25`. No figure disagrees with another on the same screen. `96.35%` carries no space before the percent sign on every one of its five appearances (`391`, `392`, `395`, `396`, `397`, `398`, `399`, `400`).
- **No money pod clipping, ellipsis or overflow at 1920x800 in this range**, so my frames yield no fresh evidence for TR-115 / TR-086. The widest figure rendered is `$50,000.00` in the BALANCE pod and it clears its border on both sides; `$363.89` and `$5,000.00` in the WIN pod likewise.
- **No fallback or missing glyph** other than the `∞` on the autoplay infinite option (`394`), which is KNOWN row Q-07, reviewed, kept and allowlisted, and is therefore not reported.
- **No placeholder or debug string.** No `Lorem`, `TODO`, `TBD`, `undefined`, `NaN`, `null`, `{0}`, `%s` or untranslated key appears on any of the 26 frames.
- **No button casing drift.** Every button label in the range is upper case: `SELECT`, `ACTIVE`, `OFF`, `ACTIVATE` twice, `BET MODES` (`395`, `396`), `CANCEL`, `BUY` (`397` to `400`), `TAP TO CONTINUE` (`401` to `409`, `415`), `COLLECT` (`412`, `413`), `MAX`, `FEATURES`, `SPIN` (`393`, `394`, `410`, `411`). The mode card titles are not buttons and are reported separately at STT-STRETCH-B-05.
- **No section header casing drift in the paytable.** `INTERFACE GUIDE` (`390`), `RESPONSIBLE PLAY` and `DISCLAIMER` (`391`, `392`), `SPIN MODES` and `BUY FEATURES` (`395`, `396`), and `WHAT YOU GET` (`397` to `400`) are all upper case, tracked, and coloured to their panel.
- **Numeral shimmy: partially signed, and the limit is stated.** Between consecutive frames of one settled state no numeric surface shifted horizontally: BALANCE held `$50,000.00` across `393` to `415` with no digit reflow, BET held `$1.00` throughout, the TOTAL WIN rail pod held `$10.80` across `401` to `409` and `$2.80` across `414` and `415`, and the free spins counter held `16` then `8`. **I cannot sign the absence of count-up shimmy on a non `.fs-num` surface**, because my 26 frames contain no mid count-up pair on one: the WIN pod is captured only at settled values (`$16.20`, `$0.00`, `$348.34`, `$363.89`, `$5,000.00`) and the only count-up surface captured mid flight in this range is the `.fs-num` max win figure, which is the fixed mechanism of TR-089 and out of scope. That absence belongs to whichever squad holds the big win triple `376`, `377`, `378`.
- **No fresh evidence for KNOWN row Q-34.** Normal was the active mode for the whole of my range, so the HUD mode badge never rendered `CRUISE`; frames `395` and `396` show only the features menu form `Cruise`. I checked and cannot corroborate the row from these frames.
- **No fresh evidence for KNOWN rows TR-104 or TR-114.** My session is `lang: en`, so TR-104's German and Arabic claim is not testable here, and no replay surface appears in the range.
- **Out of lens, recorded once so it is not lost**: frames `403`, `404`, `405`, `406`, `407`, `408`, `409` and `415` still show the `TAP TO CONTINUE` entry gate although the manifest notes say `Overdrive free spins in flight, interval frame N of 6` and `Back to base after collect, balance settled`, and frames `391` and `392` are pixel identical although the manifest gives them different section notes. I am not opening findings for these; they belong to a state or capture lens, not to typography.

## KNOWN matches
- KNOWN(Q-26): `reports/screens/stream-test-2026-07-28/395_stretch_transition_features_menu_opening.png` and `396_stretch_features_menu.png`, the OVERBOOST blurb `Double-chance: about 1.6x the feature trigger rate. Debits 1.25x every spin while ON.` sits four lines above that card's own `1.25× bet` and `1.25× per spin while ON · $1.25`, so both glyphs are in one view.
- KNOWN(Q-26): `reports/screens/stream-test-2026-07-28/399_stretch_transition_dialog_nitro_overdrive_opening.png` and `400_stretch_dialog_nitro_overdrive.png`, `pre-revved to 5x.` sits two lines below `Start Overdrive Free Spins now at 400× your bet?` in the same dialog.
- KNOWN(MID-02): `reports/screens/stream-test-2026-07-28/412_stretch_transition_maxwin_overlay_fade.png` and `413_stretch_maxwin_celebration.png`, the win banner unit renders as the letter `X` before `BET`, not the multiplication sign; these are two of the max win frames MID-02 counts in its 60.
- KNOWN(Q-07): `reports/screens/stream-test-2026-07-28/394_stretch_autoplay_menu.png`, the `∞` infinite autoplay option renders in its fallback face as designed. Recorded as seen, not as a finding.
- KNOWN(TR-089): `reports/screens/stream-test-2026-07-28/412_stretch_transition_maxwin_overlay_fade.png` and `413_stretch_maxwin_celebration.png`, `5,000` renders in the fixed per digit boxes. Recorded as seen, not as a finding.
- KNOWN(Q-16): `reports/screens/stream-test-2026-07-28/394_stretch_autoplay_menu.png` shows the parked strings `Stop on win`, `Single win limit`, `Stop on feature`, `Loss limit` and `Spins` on a stream frame, and `413_stretch_maxwin_celebration.png` shows `PRESS COLLECT OR HIT ENTER TO CONTINUE`. The park stays parked; recorded because the row says visibility changes its urgency.

tree_after: pending, run at close of this shard's session
