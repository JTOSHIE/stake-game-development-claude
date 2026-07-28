# STT-STRETCH-B, typography (stretch, frames 390 to 415)
scope: every `stretch` session frame numbered 390 to 415 inclusive, 26 frames, viewport 1920x800, lang `en`, build HEAD `d9bdf22`. Every one opened with the Read tool and looked at.
frames_read: 26

A note on method, because it changed three of the findings below. The first pass of this
shard was written straight off the frames, before any source was read, per the mandated
order. Three glyph claims in it were wrong: at the sizes these surfaces render, `×`
(U+00D7) and `x` (U+0078) are not reliably separable by eye in a 1920x800 PNG. Every glyph
claim that survives below is confirmed at `file:line`, and the three that did not survive
are recorded under "Withdrawn on source check" so no later squad spends its budget
rediscovering them.

## STT-STRETCH-B-01 HIGH The win line readout never singularises: it reads `1 ways`
- Frames: `reports/screens/stream-test-2026-07-28/394_stretch_autoplay_menu.png`, `401_stretch_transition_feature_entry_fade.png`, `402_stretch_feature_entry_card.png`, `403_stretch_transition_feature_starting.png`, `404_stretch_feature_run_1.png`, `409_stretch_feature_run_6.png`, `410_stretch_transition_feature_exit.png`, `415_stretch_post_collect_base.png`
- Claim: the win detail strip under the reels writes the ways count with an unconditional plural. Frame `394` reads `L3  x4  1 ways  $0.20`. Frames `401`, `402`, `403`, `404`, `409` and `410` read `L2  x5  1 ways  $0.80`. Frame `415` reads `M3  x3  1 ways  $0.20`. The strip reads correctly only when the number happens to exceed one: frames `405` to `408` and `411` read `SCATTER  x5  5 ways  $10.00`.
  Confirmed at source: `frontend/src/lib/components/WinBreakdown.svelte:94` is ``` <span class="wb-ways">{current.ways} ways</span> ```, with no singular branch and no locale route. Eight of my 26 frames carry it, and it is on screen for most of a base round.
- Where fixable: `frontend/src/lib/components/WinBreakdown.svelte:94` (not locked)
- Proposed fix: branch on the count and take the word from the locale layer rather than the markup, since the literal `ways` is also hardcoded English here.

## STT-STRETCH-B-02 HIGH The autoplay panel covers the FEATURES button and truncates its label to `FE`
- Frames: `reports/screens/stream-test-2026-07-28/394_stretch_autoplay_menu.png`
- Claim: with the autoplay menu open at 1920x800 the panel lands over the FEATURES trigger. The button renders its full label `FEATURES` in every other frame of this range (`393`, `397`, `398`, `399`, `400`, `410`, `411`); in frame `394` it renders as `FE`, with the remaining six characters and the right half of its pill border hidden behind the opaque panel. Nothing marks the button disabled or dismissed. It is sliced mid word.
  The geometry follows from the two rules. `frontend/src/lib/components/HudOverlay.svelte:1770-1782` positions the desktop `.auto-menu` as ``` position: absolute; bottom: calc(100% + 10px); left: 50%; transform: translateX(-50%); ``` at ``` z-index: 65 ``` with ``` min-width: 220px ``` and no right hand bound, so it centres on the autoplay button near the right end of the HUD bar and grows outward. `frontend/src/App.svelte:1979` pins the desktop FEATURES trigger to the right of the reel frame, in that same band. At 1920 wide the two occupy overlapping columns and the panel, being later and higher, wins.
- Where fixable: `frontend/src/lib/components/HudOverlay.svelte:1770-1782` (the desktop `.auto-menu` rule) with `frontend/src/App.svelte:1979` (the pinned FEATURES trigger). Neither locked.
- Proposed fix: give the panel a right hand bound at wide viewports so it opens inside the HUD column, or hide the FEATURES trigger while the autoplay menu is open rather than half covering it.

## STT-STRETCH-B-03 MEDIUM The win strip writes the symbol count with an ASCII `x`, in prefix form, beside a pod that writes `×` in suffix form
- Frames: `reports/screens/stream-test-2026-07-28/393_stretch_transition_paytable_closing.png`, `394_stretch_autoplay_menu.png`, `401_stretch_transition_feature_entry_fade.png`, `402_stretch_feature_entry_card.png`, `403_stretch_transition_feature_starting.png`, `404_stretch_feature_run_1.png`, `405_stretch_feature_run_2.png`, `406_stretch_feature_run_3.png`, `407_stretch_feature_run_4.png`, `408_stretch_feature_run_5.png`, `409_stretch_feature_run_6.png`, `410_stretch_transition_feature_exit.png`, `411_stretch_post_feature_base.png`, `415_stretch_post_collect_base.png`
- Claim: `frontend/src/lib/components/WinBreakdown.svelte:93` is ``` <span class="wb-count">x{current.kind}</span> ```. The `x` is ASCII U+0078, and it is written as a PREFIX. Every other multiplicative figure in the game is U+00D7 and a SUFFIX, and three of them are confirmed at source: `frontend/src/lib/config/fsModes.ts:139` ``` FS_MAX_WIN_LABEL = '5,000×' ```, `frontend/src/lib/components/BonusInstrumentColumn.svelte:105` ``` {multiplier}× ```, and `frontend/src/lib/i18n/translations.ts:1540` ``` an instant 1×, 3× or 10× total bet ```.
  On frames `401` to `409` and `415` the two forms are in one view: the strip reads `x5` under the reels while the MULTIPLIER plate about 350px to its right reads `1×`. This is a fourteenth of my 26 frames short of all of them.
  Recorded honestly: `x5` here means five of a kind, a count rather than a multiplier, and a prefix `x` is a defensible gaming idiom for a count. The finding is not that `x5` is meaningless, it is that this is the one surface in the game using a different glyph and a different word order for the same visual token, and Q-26 does not enumerate it.
- Where fixable: `frontend/src/lib/components/WinBreakdown.svelte:93` (not locked)
- Proposed fix: PARK(the prefix versus suffix half is an art call). The glyph half is one character: make it `×` so the strip agrees with the plate beside it. If the prefix form is kept deliberately, say so in the charter beside Q-26 so it stops reading as a survivor.

## STT-STRETCH-B-04 MEDIUM Mode display names carry two casings at source, so one list and two consecutive dialogs disagree with themselves
- Frames: `reports/screens/stream-test-2026-07-28/395_stretch_transition_features_menu_opening.png`, `396_stretch_features_menu.png`, `397_stretch_transition_dialog_buy_overdrive_opening.png`, `398_stretch_dialog_buy_overdrive.png`, `399_stretch_transition_dialog_nitro_overdrive_opening.png`, `400_stretch_dialog_nitro_overdrive.png`
- Claim: the five names are stored in two casings, in adjacent lines of one object, at `frontend/src/lib/i18n/prose.ts:85-93`:
  - `:85` ``` modeNormalLabel:    'Normal', ```
  - `:87` ``` modeCruiseLabel:    'Cruise', ```
  - `:89` ``` modeOverboostLabel: 'OVERBOOST', ```
  - `:91` ``` modeBonusLabel:     'Buy Overdrive', ```
  - `:93` ``` modeSuperLabel:     'NITRO OVERDRIVE', ```
  Frames `395` and `396` render all five in one list, so `Buy Overdrive` and `NITRO OVERDRIVE` sit adjacent under the same `BUY FEATURES` heading in Title Case and capitals respectively, with visible letter spacing on the capitals and none on the Title Case. The disagreement then repeats one level deeper: the confirm dialog title is `Buy Overdrive` on frames `397` and `398` and `NITRO OVERDRIVE` on frames `399` and `400`. Same component, same slot, same magenta, two casings and two tracking values, in two dialogs a player opens back to back.
  Because the capitals are in the stored string rather than applied by transform, they are replicated into every locale: `frontend/src/lib/i18n/prose.locales.ts:43` and `:119` both carry ``` modeOverboostLabel: 'OVERBOOST' ```.
  Related to but distinct from KNOWN row Q-34, which is one mode reading two ways across surfaces via `text-transform`. This is different modes reading two ways within one surface.
- Where fixable: `frontend/src/lib/i18n/prose.ts:85-93` and the same keys throughout `frontend/src/lib/i18n/prose.locales.ts`. Neither locked.
- Proposed fix: PARK(sixteen locales, so larger than small, and the direction is an art call exactly as Q-34's is). Store all five in one casing and apply any capitalisation as a `text-transform` on the card and dialog title classes, so no future name can drift and Q-34 closes in the same edit.

## STT-STRETCH-B-05 MEDIUM `Scatters` and `scatters`, `Free Spins` and `free spins`, across two surfaces and inside one visible block
- Frames: `reports/screens/stream-test-2026-07-28/396_stretch_features_menu.png`, `397_stretch_transition_dialog_buy_overdrive_opening.png`, `398_stretch_dialog_buy_overdrive.png`, `399_stretch_transition_dialog_nitro_overdrive_opening.png`, `400_stretch_dialog_nitro_overdrive.png`
- Claim: two strings, both English, both player visible, disagree on the casing of the same two terms.
  `frontend/src/lib/i18n/translations.ts:1540` is ``` rulesOverdriveTrigger: '3, 4 or 5 Scatters award 8, 12 or 16 free spins and pay an instant 1×, 3× or 10× total bet.' ```
  `frontend/src/lib/i18n/prose.ts:86` is ``` modeNormalBlurb: 'Standard play. Overdrive Free Spins trigger on 3+ scatters.' ```
  So `Scatters` against `scatters`, on two surfaces a player crosses in two clicks (features menu to buy dialog). The same pair of strings also puts `Free Spins` and `free spins` in one rendered block: on frames `397` and `398` the `WHAT YOU GET` panel reads `Buy a guaranteed Overdrive Free Spins entry.` on line one and `... 8, 12 or 16 free spins ...` on line two, both visible at once and about 28px apart.
  A third form exists in the same tree, so the sweep target is wider than these two lines: `frontend/src/lib/i18n/prose.ts:100` is ``` wildSubstitutes: 'Substitutes for all symbols except SCATTER' ```.
- Where fixable: `frontend/src/lib/i18n/translations.ts:1540` and `frontend/src/lib/i18n/prose.ts:86` and `:100` (none locked), plus their sixteen locale siblings.
- Proposed fix: settle one rule, most plausibly Title Case only for the proper feature name `Overdrive Free Spins` and lower case for the generic `free spins` and `scatters`, and add it to the charter's cross-surface capitalisation class, which the KNOWN register already records as gated nowhere.

## STT-STRETCH-B-06 MEDIUM The `MAX WIN` stat cell wraps and orphans `bet`, in the same class the TR-037 comment says was already fixed once
- Frames: `reports/screens/stream-test-2026-07-28/397_stretch_transition_dialog_buy_overdrive_opening.png`, `398_stretch_dialog_buy_overdrive.png`, `399_stretch_transition_dialog_nitro_overdrive_opening.png`, `400_stretch_dialog_nitro_overdrive.png`
- Claim: the buy dialog stat row has three cells. `PRICE` renders `$100.00` (`397`, `398`) or `$400.00` (`399`, `400`) on one line, `RTP` renders `96.35%` on one line, and `MAX WIN` renders `5,000× base` on line one with `bet` alone on line two. The third cell is one line taller than its siblings, the three values no longer share a baseline, and the vertical divider rules between cells outrun the shorter values.
  The string is `frontend/src/lib/config/fsModes.ts:157-158`, ``` return social ? `${FS_MAX_WIN_LABEL} base play` : `${FS_MAX_WIN_LABEL} base bet` ```. The comment directly above it, `fsModes.ts:162-175`, records TR-037: this exact phrase as a stat VALUE ``` clipped it to "5,000x ba..." on every card at 1280x720 ```, and the recorded fix moved the qualifier out of the value on the paytable mode cards. The buy dialogs still consume the qualified form, so the class survived in the surface the fix did not cover, and at 1920x800 it wraps instead of clipping.
  This is a non money string failing its container, so it is outside the TR-115 / TR-086 money fit class. The `$400.00` price two cells to its left fits with room to spare.
- Where fixable: `frontend/src/lib/config/fsModes.ts:157-158`, or the buy dialog's stat cell width. Neither locked.
- Proposed fix: apply TR-037's own remedy to the second consumer, value `5,000×` with `base bet` in the label or in the existing footnote (`maxWinFootnote`, `fsModes.ts:189-192`), so all three cells set on one line at every price.

## STT-STRETCH-B-07 MEDIUM The autoplay option labels are the only sentence case labels on the HUD layer, and disagree with their own panel heading
- Frames: `reports/screens/stream-test-2026-07-28/394_stretch_autoplay_menu.png`
- Claim: the four options read `Stop on win`, `Single win limit`, `Stop on feature` and `Loss limit`, in sentence case, at a lighter weight and a narrower letterform than anything else on that layer. Every other label rendered on the HUD layer in this range is upper case and tracked: `BALANCE`, `WIN`, `BET`, `MAX`, `FEATURES`, `SPIN` (`393`, `394`), and `OVERDRIVE FREE SPINS`, `TOTAL WIN`, `MULTIPLIER` (`401` to `409`, `414`, `415`). The disagreement is inside one panel: `SPINS` sits about 40px below the fourth option, and it is upper case, tracked and coloured.
  Source: the four come from `frontend/src/lib/components/HudOverlay.svelte:503`, `:504`, `:508`, `:509` via `$tr('stopOnWin')`, `$tr('singleWinLimit')`, `$tr('stopOnFeature')`, `$tr('lossLimit')`, while the heading beside them is a bare literal at `HudOverlay.svelte:513`, ``` <div class="auto-menu-sep">Spins</div> ```, rendered upper case by its class. The same five strings are duplicated at `:739`, `:740`, `:744`, `:745`, `:749` and again at `:945`, `:946` and following, one set per layout template.
  These five are also the strings KNOWN row Q-16 parks as hardcoded English. This frame is the evidence that they reach a stream frame rather than sitting somewhere unseen; the row says visibility changes the park's urgency.
- Where fixable: `frontend/src/lib/components/HudOverlay.svelte:503-513`, and the two duplicate blocks at `:739-749` and `:945` onward. Not locked.
- Proposed fix: put the four options on the HUD label class so the panel reads as one component, and note that whichever direction is chosen has to be applied to all three duplicated template blocks or the panel will disagree with itself by viewport.

## STT-STRETCH-B-08 LOW Two mutually exclusive input idioms in one session on one desktop viewport
- Frames: `reports/screens/stream-test-2026-07-28/401_stretch_transition_feature_entry_fade.png`, `402_stretch_feature_entry_card.png`, `403_stretch_transition_feature_starting.png`, `404_stretch_feature_run_1.png`, `405_stretch_feature_run_2.png`, `406_stretch_feature_run_3.png`, `407_stretch_feature_run_4.png`, `408_stretch_feature_run_5.png`, `409_stretch_feature_run_6.png`, `413_stretch_maxwin_celebration.png`, `415_stretch_post_collect_base.png`
- Claim: the free spins entry gate reads `TAP TO CONTINUE`, a touch idiom, on a 1920x800 desktop viewport with no touch input, on ten of my 26 frames. Twelve frames later the max win overlay on the same session and the same viewport reads `PRESS COLLECT OR HIT ENTER TO CONTINUE` (`413`), a keyboard idiom. Two continue gates, two incompatible assumptions about the player's device, both shown in one round.
  Source: `frontend/src/lib/i18n/translations.ts:1548` ``` featureContinue: 'TAP TO CONTINUE', ``` and `:1557` ``` splashPressAnywhere: 'TAP TO CONTINUE', ```, both in the `en` block that opens at `:1533`. The max win hint is the `maxWinHint` key consumed at `frontend/src/lib/components/MaxWinCelebration.svelte:166`, and its English value is the string KNOWN row Q-16 parks as `Press COLLECT or hit Enter to continue`.
- Where fixable: `frontend/src/lib/i18n/translations.ts:1548` and `:1557` (not locked); the max win hint side is inside the Q-16 park.
- Proposed fix: one device neutral verb on both gates, or branch on pointer type so a desktop session never reads `TAP`. Small on the `translations.ts` side, and it should be taken with the Q-16 park rather than half done.

## STT-STRETCH-B-09 LOW The NITRO OVERDRIVE blurb orphans `5x.` on its own line, on the card and in the dialog
- Frames: `reports/screens/stream-test-2026-07-28/395_stretch_transition_features_menu_opening.png`, `396_stretch_features_menu.png`, `399_stretch_transition_dialog_nitro_overdrive_opening.png`, `400_stretch_dialog_nitro_overdrive.png`
- Claim: `frontend/src/lib/i18n/prose.ts:94`, ``` modeSuperBlurb: 'Buy a rich entry with the Overdrive meter pre-revved to 5x.' ```, wraps after `to` in both places it renders, leaving `5x.` alone on line two. On frames `395` and `396` it is the only two line blurb in the mode list; on frames `399` and `400` it is the only item in the `WHAT YOU GET` block whose second line is a single token.
- Where fixable: `frontend/src/lib/i18n/prose.ts:94`, and its social twin `frontend/src/lib/i18n/prose.ts:192` (`'Get a rich entry with the Overdrive meter pre-revved to 5x.'`). Neither locked.
- Proposed fix: bind the last two words with a non breaking space, or shorten the blurb by two characters so it sets on one line at both widths. Note the `5x` in this same string is a KNOWN(Q-26) instance, so fix both in one edit.

## Withdrawn on source check

Three claims were in the first pass of this shard, written from the frames alone, and did
not survive verification. They are recorded rather than deleted so no later squad pays for
them twice, and because two of them narrow what MID-02 can be said to cover.

- **"The paytable stat pod writes `5,000x` with an ASCII x."** WRONG. `frontend/src/lib/config/fsModes.ts:139` is ``` FS_MAX_WIN_LABEL = '5,000×' ```, consumed by the paytable at `frontend/src/lib/components/PaytableModal.svelte:338` and `:389`. The glyph is U+00D7. What made it read as an `x` in frames `391` and `392` is that the value carries the `fs-num` class, so the `×` is boxed at digit width beside four digits and a comma.
- **"The free spins MULTIPLIER plate writes `1x` with an ASCII x."** WRONG. `frontend/src/lib/components/BonusInstrumentColumn.svelte:105` is ``` {multiplier}× ```.
- **"The max win celebration renders the unit as a letter `X`, and `X` and `BET` are mismatched runs."** WRONG on both halves. `frontend/src/lib/components/MaxWinCelebration.svelte:155` is ``` <span class="c1-max-mult fs-num">5,000</span><span class="c1-max-x">×</span> ```, with a comment on the four lines above recording that this surface was moved to U+00D7 under Q-12. The size difference between the `×` and `BET` is deliberate: `.c1-max-x` and `.c1-max-betlabel` are separate classes with separate `font-size` rules (`MaxWinCelebration.svelte:309` and the breakpoint override at `:368`).

The consequence for the ledger: **my two max win frames do not corroborate MID-02.** MID-02
states that its 60 affected frames are *every session's big-win triple plus its max-win
frames*. The max win overlay in frames `412` and `413` is `MaxWinCelebration.svelte`, which
uses `×`, not `WinBanner.svelte:205`, which uses `x`. My range contains no big win banner
frame (`376`, `377` and `378` belong to another squad), so I can neither confirm nor refute
the finding itself; I can only report that the max-win half of its frame count is not
evidenced here. That is a non-corroboration, not a refutation, and it is for the marshal.

## Explicit absences, signed

Each of the following was looked for on all 26 frames and is absent. Where I cannot claim
absence, I say so rather than signing it.

- **No double spaces** in any player visible string. Checked every prose block in the range: the interface guide item descriptions (`390`, `391`, `392`), the `RESPONSIBLE PLAY` paragraph and the four line `DISCLAIMER` paragraph (`391`, `392`), all five mode blurbs (`395`, `396`), both `WHAT YOU GET` blocks (`397` to `400`), and the max win hint (`412`, `413`).
- **No mixed straight and curly quotes.** There is no apostrophe and no quotation mark of any kind anywhere in these 26 frames, so the class cannot be violated here.
- **No em dashes and no en dashes in player visible prose.** The only long horizontal glyph in the range is the decrement control in the FEATURES bet stepper (`395`, `396`), a button glyph and not prose. `Double-chance:` (`395`, `396`) and `pre-revved` (`395`, `396`, `399`, `400`) use hyphens correctly.
- **No currency format disagreement.** Every money figure in the range is `$`, comma grouped integer part, `.`, exactly two decimals: `$50,000.00`, `$5,000.00`, `$1.00`, `$16.20`, `$16.00`, `$0.20`, `$0.80`, `$10.00`, `$10.80`, `$2.80`, `$348.34`, `$363.89`, `$100.00`, `$400.00`, `$1.25`. No figure disagrees with another on the same screen. `96.35%` carries no space before the percent sign on all of its appearances (`391`, `392`, `395`, `396`, `397`, `398`, `399`, `400`).
- **No money pod clipping, ellipsis or overflow at 1920x800 in this range**, so my frames yield no fresh evidence for TR-115 / TR-086. The widest figure rendered is `$50,000.00` in the BALANCE pod and it clears its border on both sides; `$363.89` and `$5,000.00` in the WIN pod likewise. The one container failure I did find is a non money string and is STT-STRETCH-B-06.
- **No fallback or missing glyph** other than the `∞` on the autoplay infinite option (`394`, source `frontend/src/lib/components/HudOverlay.svelte:518`), which is KNOWN row Q-07, reviewed, kept and allowlisted, and is therefore not reported.
- **No placeholder or debug string.** No `Lorem`, `TODO`, `TBD`, `undefined`, `NaN`, `null`, `{0}`, `%s` or raw translation key appears on any of the 26 frames.
- **No button casing drift.** Every button label in the range is upper case: `SELECT`, `ACTIVE`, `OFF`, `ACTIVATE` twice, `BET MODES` (`395`, `396`), `CANCEL`, `BUY` (`397` to `400`), `TAP TO CONTINUE` (`401` to `409`, `415`), `COLLECT` (`412`, `413`), `MAX`, `FEATURES`, `SPIN` (`393`, `394`, `410`, `411`). Mode card titles are not buttons and are reported at STT-STRETCH-B-04.
- **No section header casing drift.** `INTERFACE GUIDE` (`390`), `RESPONSIBLE PLAY` and `DISCLAIMER` (`391`, `392`), `SPIN MODES` and `BUY FEATURES` (`395`, `396`), `WHAT YOU GET` (`397` to `400`) and `SPINS` (`394`) are all upper case, tracked, and coloured to their panel.
- **No system font leakage found.** Every string in the range renders in the brand display face or its lighter body weight. The autoplay option labels differ in CASE and WEIGHT, which is STT-STRETCH-B-07; on source check they carry no `font-family` of their own and inherit the panel's, so the family half of that suspicion is withdrawn.
- **Numeral shimmy: partially signed, and the limit is stated.** Between consecutive frames of one settled state no numeric surface shifted horizontally: BALANCE held `$50,000.00` across `393` to `415` with no digit reflow, BET held `$1.00` throughout, the TOTAL WIN plate held `$10.80` across `401` to `409` and `$2.80` across `414` and `415`, and the free spins counter held `16` then `8`. **I cannot sign the absence of count-up shimmy on a non `fs-num` surface**, because my 26 frames contain no mid count-up pair on one: the WIN pod is captured only at settled values (`$16.20`, `$0.00`, `$348.34`, `$363.89`, `$5,000.00`), and the only count-up surface captured mid flight here is the `fs-num` max win figure, which is the fixed mechanism of TR-089 and out of scope. That absence belongs to whichever squad holds the big win triple `376`, `377`, `378`. `frontend/src/lib/components/HudOverlay.svelte:6-7` states the pods use tabular numerals, which is consistent with what I observed but is not the same as observing a count-up.
- **No fresh evidence for KNOWN row Q-34.** Normal was the active mode for the whole of my range, so the HUD mode badge never rendered `CRUISE`; frames `395` and `396` show only the features menu form `Cruise`. I checked and cannot corroborate the row from these frames.
- **No fresh evidence for KNOWN rows TR-104, TR-114 or TR-112.** My session is `lang: en`, so TR-104's German and Arabic claim is not testable here; no replay surface appears in the range; TR-112 is not frame auditable.
- **Out of lens, recorded once so it is not lost.** Frames `403` to `409` and `415` still show the `TAP TO CONTINUE` entry gate although the manifest notes read `Overdrive free spins in flight, interval frame N of 6` and `Back to base after collect, balance settled`; and frames `391` and `392` are visually identical although the manifest gives them different section notes. I am not opening findings for these. They belong to a state or capture lens, not to typography.

## KNOWN matches
- KNOWN(Q-26): `reports/screens/stream-test-2026-07-28/395_stretch_transition_features_menu_opening.png` and `396_stretch_features_menu.png`. The OVERBOOST blurb renders `Double-chance: about 1.6x the feature trigger rate. Debits 1.25x every spin while ON.` four lines above that same card's `1.25× bet` and `1.25× per spin while ON · $1.25`, so both glyphs are in one view. **Two corrections to the row, from source rather than from the frame.** First, its recorded LOCATION is stale: at HEAD `d9bdf22` the blurbs are not in `fsModes.ts`, they are at `frontend/src/lib/i18n/prose.ts:90` and `:94`. Second, its COUNT of *four more player-visible instances* is short: the social override block repeats all three at `frontend/src/lib/i18n/prose.ts:189` (`about 1.6x ... Costs 1.25x every spin while ON.`) and `:192` (`pre-revved to 5x.`), so the real-money and social forms together carry at least six, not four. A row that exists to record an incomplete sweep is itself both mislocated and undercounted.
- KNOWN(Q-26): `reports/screens/stream-test-2026-07-28/399_stretch_transition_dialog_nitro_overdrive_opening.png` and `400_stretch_dialog_nitro_overdrive.png`. `pre-revved to 5x.` sits two lines below `Start Overdrive Free Spins now at 400× your bet?` inside one dialog, so the same screen carries both glyphs.
- KNOWN(Q-07): `reports/screens/stream-test-2026-07-28/394_stretch_autoplay_menu.png`. The `∞` infinite autoplay option renders in its fallback face as designed (`frontend/src/lib/components/HudOverlay.svelte:518`). Recorded as seen, not as a finding.
- KNOWN(TR-089): `reports/screens/stream-test-2026-07-28/412_stretch_transition_maxwin_overlay_fade.png` and `413_stretch_maxwin_celebration.png`. `5,000` renders through the fixed per digit `fs-num` boxes (`frontend/src/lib/components/MaxWinCelebration.svelte:155`). Recorded as seen, not as a finding.
- KNOWN(Q-16): `reports/screens/stream-test-2026-07-28/394_stretch_autoplay_menu.png` shows the parked strings `Stop on win`, `Single win limit`, `Stop on feature`, `Loss limit` and `Spins` on a stream frame; `413_stretch_maxwin_celebration.png` shows `PRESS COLLECT OR HIT ENTER TO CONTINUE`; frames `390`, `391` and `392` show the parked paytable section headers `INTERFACE GUIDE`, `RESPONSIBLE PLAY` and `DISCLAIMER`. The park stays parked. Recorded because the row says visibility changes its urgency, and eight of my 26 frames carry at least one parked string.
- KNOWN(MID-02): **not corroborated by this range, and the reason matters.** See "Withdrawn on source check" above. The max win overlay in frames `412` and `413` is `MaxWinCelebration.svelte:155`, which writes `×`, not `WinBanner.svelte:205`, which writes `x`. MID-02's frame count claims the max-win frames among its 60; my two max-win frames do not show its defect. My range holds no big win banner frame, so this is a non-corroboration of the frame count, not a refutation of the finding.

tree_after:

```
 M reports/qa/stream_test/shards/STT-MOBILES-B.md
 M reports/qa/stream_test/shards/STT-POPOUTL-A.md
 M reports/qa/stream_test/shards/STT-STRETCH-B.md
```

**Read this before reading it as an alarm.** The brief's expectation was that my shard would
show as UNTRACKED. It shows as MODIFIED, and so do two other squads' shards. The reason is
benign and verified rather than assumed: `git show HEAD:reports/qa/stream_test/shards/STT-STRETCH-B.md`
returns 21,102 bytes that are exactly my own STEP 2 content, so a commit landed between my
step 2 write and my step 3 rewrite and captured the step 2 shards. HEAD therefore holds my
step 2 version and the working tree holds the step 3 rewrite that supersedes it. Nothing of
mine or anyone else's was overwritten or lost.

**No source file, no evidence directory and no document outside `shards/` is modified or
deleted.** The three lines above are the entire working tree delta. I wrote exactly one
file, the path assigned to me, and ran no project script.

