# STT-MOBILEM-B, typography (mobile-m, frames 286 to 311)
scope: frames 286 to 311 inclusive of the `mobile-m` session (viewport 375x667, lang en), 26 frames, every one opened
frames_read: 26

Two claims written in the step 2 shard were CORRECTED at step 3 because the source
refuted them, and the correction is recorded rather than quietly dropped. Both are
noted inline at STT-MOBILEM-B-03 and STT-MOBILEM-B-07.

## STT-MOBILEM-B-01 STREAM The FEATURES panel bet stepper wraps, putting the minus and the plus of one control on different rows

- Frames: `reports/screens/stream-test-2026-07-28/291_mobile-m_transition_features_menu_opening.png`, `reports/screens/stream-test-2026-07-28/292_mobile-m_features_menu.png`
- Claim: at 375x667 the cost row at the top of the FEATURES panel breaks across two lines. Line one carries `SPIN COST` `$1.00` `BET` and the boxed decrement control; line two carries `$1.00` and the boxed increment control. The two halves of one stepper therefore sit on different rows, the label `BET` is separated from the value it labels, and `$1.00` appears twice in the same row group at two sizes and two colours (the small gold value beside `SPIN COST`, the large gold value on line two). It is present in the settled state (`292`), not only mid-open, so it is not a transition artefact. The cause is in the CSS rather than the content: `frontend/src/lib/components/FeatureMenu.svelte:847` declares `.fm-betbar > .fs-face { flex-direction: row; align-items: center; gap: 0.7rem; padding: 8px 16px; flex-wrap: wrap; }`, and the five children at `:334` to `:343` (`SPIN COST` plus value, `BET`, `-`, value, `+`) exceed 375px minus padding, so they wrap. The `--mini` variant at `frontend/src/lib/components/FeatureMenu.svelte:760-761` sets `flex-wrap: nowrap` for exactly this reason, but this viewport does not take that branch.
- Where fixable: `frontend/src/lib/components/FeatureMenu.svelte:847` (not locked)
- Proposed fix: change `flex-wrap: wrap` to `nowrap` on `:847` and let the existing `--mini` type-size reductions carry the narrow case, or wrap the `-` value `+` trio in one `flex-wrap: nowrap` group so the row can only break between the cost text and the stepper.

## STT-MOBILEM-B-02 HIGH The five bet-mode names use two different casing conventions, and the two instances of the buy-confirm dialog title disagree

- Frames: `reports/screens/stream-test-2026-07-28/291_mobile-m_transition_features_menu_opening.png`, `reports/screens/stream-test-2026-07-28/292_mobile-m_features_menu.png`, `reports/screens/stream-test-2026-07-28/293_mobile-m_transition_dialog_buy_overdrive_opening.png`, `reports/screens/stream-test-2026-07-28/294_mobile-m_dialog_buy_overdrive.png`, `reports/screens/stream-test-2026-07-28/295_mobile-m_transition_dialog_nitro_overdrive_opening.png`, `reports/screens/stream-test-2026-07-28/296_mobile-m_dialog_nitro_overdrive.png`
- Claim: one component, the buy-confirm dialog, renders its title as `Buy Overdrive` in Title Case on `293`/`294` and as `NITRO OVERDRIVE` in full upper case on `295`/`296`. Same position, same colour, same face, same size, two casings. The same split runs through the mode list on `291`/`292`, where `Normal` and `Cruise` are Title Case and `OVERBOOST` is upper case. The naming set is authored that way and the frames only show it: `frontend/src/lib/i18n/prose.ts:85` `modeNormalLabel: 'Normal'`, `:87` `modeCruiseLabel: 'Cruise'`, `:89` `modeOverboostLabel: 'OVERBOOST'`, `:91` `modeBonusLabel: 'Buy Overdrive'`, `:93` `modeSuperLabel: 'NITRO OVERDRIVE'`. Three Title Case, two upper case, one set. This is NOT KNOWN(Q-34): Q-34 is one mode rendered two ways on different surfaces via a stray `text-transform`; this is five sibling names authored in two conventions and visible without leaving the FEATURES flow.
- Where fixable: `frontend/src/lib/i18n/prose.ts:85,87,89,91,93`, and the same five keys repeated per locale in `frontend/src/lib/i18n/prose.locales.ts` (for example `:47` `modeSuperLabel: 'NITRO OVERDRIVE'`). Not locked.
- Proposed fix: PARK(the direction is an art call and the edit is sixteen locales wide). The two options for the owner: author all five in Title Case and let a single surface class upper-case them where the design wants shouting, or author all five upper case. Either is mechanical once chosen; choosing is not the builder's call, and `prose.locales.ts:23` already records that mode names are deliberately left untranslated, so whichever way it goes it goes sixteen times.

## STT-MOBILEM-B-03 HIGH The max win figure carries three different qualifiers across three surfaces, and the celebration sets its unit with effectively no word space

- Frames: `reports/screens/stream-test-2026-07-28/287_mobile-m_paytable_08_responsible_play.png`, `reports/screens/stream-test-2026-07-28/288_mobile-m_paytable_09_disclaimer.png`, `reports/screens/stream-test-2026-07-28/293_mobile-m_transition_dialog_buy_overdrive_opening.png`, `reports/screens/stream-test-2026-07-28/294_mobile-m_dialog_buy_overdrive.png`, `reports/screens/stream-test-2026-07-28/295_mobile-m_transition_dialog_nitro_overdrive_opening.png`, `reports/screens/stream-test-2026-07-28/296_mobile-m_dialog_nitro_overdrive.png`, `reports/screens/stream-test-2026-07-28/308_mobile-m_transition_maxwin_overlay_fade.png`, `reports/screens/stream-test-2026-07-28/309_mobile-m_maxwin_celebration.png`
- Claim: the same 5,000x cap is written three ways in one session. The paytable pod reads `5,000×` with no qualifier at all (`287`, `288`, from `FS_MAX_WIN_LABEL` at `frontend/src/lib/config/fsModes.ts:139`, rendered at `frontend/src/lib/components/PaytableModal.svelte:389`). The buy dialogs read `5,000×` with `base bet` in lower case beneath it (`293` to `296`, from `frontend/src/lib/config/fsModes.ts:158`, `` `${FS_MAX_WIN_LABEL} base bet` ``). The max win celebration reads `5,000` then `×` then `BET` in upper case (`308`, `309`), and the `×` and `BET` are butted together so the lockup reads `5,000×BET`. The spacing is mechanical, not a rendering accident: `frontend/src/lib/components/MaxWinCelebration.svelte:155-159` puts the three parts in three sibling spans with no whitespace between them, and the only separation is `gap: 0.1em` on the flex parent at `:295-299`, computed against the WRAP's inherited font-size while the children are set at 96px, 46px and 22px (`:301-322`, dropping to 50px, 24px and 13px at the narrow rule `:367-369`). A 0.1em gap on the parent is around one or two pixels against a 46px multiplication sign, which is why the frames show no space. So one figure, three qualifiers, and two casings of the word bet (`base bet` against `BET`), with the tightest setting on the most-watched surface in the game.
- CORRECTION recorded: the step 2 shard claimed the paytable pod used a letter `x` where the dialogs used `×`. `fsModes.ts:139` is `'5,000×'` with U+00D7 and `PaytableModal.svelte:389` renders that same constant, so the glyph is identical on both and only the qualifier differs. The glyph half of that claim is withdrawn.
- Where fixable: `frontend/src/lib/components/MaxWinCelebration.svelte:295-299` for the spacing; `frontend/src/lib/config/fsModes.ts:158` and `frontend/src/lib/components/PaytableModal.svelte:389` for the qualifier. Neither locked.
- Proposed fix: give `.c1-max-multwrap` a gap sized against the unit rather than the wrap (or a left margin on `.c1-max-betlabel` of about `0.4em` at its own size), and settle one qualifier form so the paytable, the dialogs and the celebration say the same thing.

## STT-MOBILEM-B-04 MEDIUM `Features` and `FEATURES` in one paytable card, and two label-casing systems across two panels

- Frames: `reports/screens/stream-test-2026-07-28/286_mobile-m_paytable_07_interface_guide.png`, `reports/screens/stream-test-2026-07-28/289_mobile-m_transition_paytable_closing.png`, `reports/screens/stream-test-2026-07-28/290_mobile-m_autoplay_menu.png`
- Claim: on `286` the interface guide row is titled `Features` and its own body immediately below reads `Open the FEATURES menu to pick a bet mode or buy the feature.` The same word appears twice in one card in two casings, and a third time as the HUD button label `FEATURES` on `289`. The pair is adjacent in the source: `frontend/src/lib/i18n/prose.ts:128` `guideFeaturesName: 'Features'` and `:129` `guideFeaturesDesc: 'Open the FEATURES menu to pick a bet mode or buy the feature.'`, with the social variant repeating the split at `:204`. Separately the two panels use two label systems for one class of thing: the guide labels are Title Case (`Spin`, `Increase Bet`, `Decrease Bet`, `Features`, `Autoplay`, `Menu`, `prose.ts:122-132`) while the autoplay panel labels on `290` are sentence case (`Stop on win`, `Single win limit`, `Stop on feature`, `Loss limit`).
- Where fixable: `frontend/src/lib/i18n/prose.ts:128-129` and `:204` (not locked). The autoplay label side is part of the Q-16 parked set and stays parked.
- Proposed fix: make the guide row name match the control it documents (`FEATURES`), or lower-case the reference in the prose; one string pair, two edits.

## STT-MOBILEM-B-05 MEDIUM Feature vocabulary changes capitalisation between adjacent paragraphs of one dialog and between the dialog and the menu behind it

- Frames: `reports/screens/stream-test-2026-07-28/291_mobile-m_transition_features_menu_opening.png`, `reports/screens/stream-test-2026-07-28/292_mobile-m_features_menu.png`, `reports/screens/stream-test-2026-07-28/293_mobile-m_transition_dialog_buy_overdrive_opening.png`, `reports/screens/stream-test-2026-07-28/294_mobile-m_dialog_buy_overdrive.png`, `reports/screens/stream-test-2026-07-28/295_mobile-m_transition_dialog_nitro_overdrive_opening.png`, `reports/screens/stream-test-2026-07-28/296_mobile-m_dialog_nitro_overdrive.png`
- Claim: inside the buy dialog body (`293` to `296`) the first paragraph reads `Buy a guaranteed Overdrive Free Spins entry.` and the paragraph directly under it reads `3, 4 or 5 Scatters award 8, 12 or 16 free spins and pay an instant 1×, 3× or 10× total bet.`, so `Free Spins` is Title Case in one line and `free spins` is lower case in the next, and `Scatters` is capitalised mid-sentence. The Normal mode card behind the dialog writes `Standard play. Overdrive Free Spins trigger on 3+ scatters.` (`frontend/src/lib/i18n/prose.ts:86`) with `scatters` in lower case. Three casings of two feature nouns inside one flow.
- Where fixable: `frontend/src/lib/i18n/prose.ts:86` and `:92` (`modeBonusBlurb`) carry the located half. The `3, 4 or 5 Scatters award ...` string was not located within the step 3 budget: UNKNOWN for that line, and it is somewhere in the `prose.ts` / `translations.ts` string layer rather than in a component, since every other string on that dialog is.
- Proposed fix: fix the house style for `Overdrive Free Spins`, `free spins` and `scatter` once, and sweep the mode blurbs and dialog bodies to it. Small, but it is sixteen locales wide in `prose.locales.ts`, so scope it before starting.

## STT-MOBILEM-B-06 MEDIUM The two full-screen continue gates in one session use different registers, and the max win one names a keyboard key on a touch viewport

- Frames: `reports/screens/stream-test-2026-07-28/297_mobile-m_transition_feature_entry_fade.png`, `reports/screens/stream-test-2026-07-28/298_mobile-m_feature_entry_card.png`, `reports/screens/stream-test-2026-07-28/308_mobile-m_transition_maxwin_overlay_fade.png`, `reports/screens/stream-test-2026-07-28/309_mobile-m_maxwin_celebration.png`, `reports/screens/stream-test-2026-07-28/311_mobile-m_post_collect_base.png`
- Claim: the feature entry gate is a gold button reading `TAP TO CONTINUE` (`297`, `298`, `311`), correctly touch-worded, from `frontend/src/lib/i18n/translations.ts:1548` `featureContinue: 'TAP TO CONTINUE'`. The max win gate on the same 375x667 touch session is a gold `COLLECT` button with the line `PRESS COLLECT OR HIT ENTER TO CONTINUE` beneath it (`308`, `309`), from `frontend/src/lib/i18n/prose.ts:83` `maxWinHint: 'Press COLLECT or hit Enter to continue'`, which names a key the device does not have. It is also rendered fully upper case by a transform, so the authored distinction between the button name `COLLECT` and the key name `Enter` is flattened and `ENTER` no longer reads as a key. Two continue gates, two registers, one wrong for the viewport. The localisation half of this string is already recorded as KNOWN(Q-16 park); the touch mismatch and the flattening are not, which is why this is opened as new.
- Where fixable: `frontend/src/lib/i18n/prose.ts:83` for the string, plus the surface class applying the upper-case transform in `frontend/src/lib/components/MaxWinCelebration.svelte`. Not locked.
- Proposed fix: branch the hint on pointer type so coarse pointers get tap wording, and drop the blanket upper-case transform on that line so the button and key names keep their distinction.

## STT-MOBILEM-B-07 MEDIUM The two feature HUD pods put their values on different baselines because one label wraps and the other does not

- Frames: `reports/screens/stream-test-2026-07-28/297_mobile-m_transition_feature_entry_fade.png`, `reports/screens/stream-test-2026-07-28/298_mobile-m_feature_entry_card.png`, `reports/screens/stream-test-2026-07-28/300_mobile-m_feature_run_1.png`, `reports/screens/stream-test-2026-07-28/305_mobile-m_feature_run_6.png`, `reports/screens/stream-test-2026-07-28/310_mobile-m_transition_maxwin_collect_fade.png`, `reports/screens/stream-test-2026-07-28/311_mobile-m_post_collect_base.png`
- Claim: the feature HUD row holds two matched pods side by side (`frontend/src/lib/components/BonusInstrumentColumn.svelte:66-75`). The left label `OVERDRIVE FREE SPINS` wraps to two lines while the right label `TOTAL WIN` stays on one, and the cell has no fixed height, so the left value (`16` on `297` to `305`, `8` on `310`/`311`) sits one line lower than the right value (`$10.80`, then `$2.80`). Two values of one component in one row, on two different baselines. The wrap is deliberate and commented at `frontend/src/lib/components/BonusInstrumentColumn.svelte:253-256`, but the consequence for the sibling pod's alignment is not addressed there. The comparison that makes it read as wrong is the pod row directly beneath it, `BALANCE` `$50,000.00` beside `WIN` `$0.00`, whose labels both fit on one line and whose values do share a baseline.
- CORRECTION recorded: the step 2 shard also claimed the two values were set at different type sizes. They are not. Both are `.pm-value` at `font-size: 15px` (`frontend/src/lib/components/BonusInstrumentColumn.svelte:261-263`), differing only in colour class at `:272-273`. That half of the claim is withdrawn; the apparent size difference in the frames is the gold glow on the right value, not type size. The baseline offset is real and remains.
- Where fixable: `frontend/src/lib/components/BonusInstrumentColumn.svelte:232-260` (the `.pm-cell` and `.pm-label` rules). Not locked.
- Proposed fix: give `.pm-cell` `justify-content: space-between` with a fixed label block height, or use the shorter `freeSpins` key (`translations.ts:1534` already carries `FREE SPINS`) at this breakpoint so neither label wraps.

## STT-MOBILEM-B-08 MEDIUM The win-line strip pluralises `ways` unconditionally and shows `1 ways`

- Frames: `reports/screens/stream-test-2026-07-28/297_mobile-m_transition_feature_entry_fade.png`, `reports/screens/stream-test-2026-07-28/298_mobile-m_feature_entry_card.png`, `reports/screens/stream-test-2026-07-28/302_mobile-m_feature_run_3.png`, `reports/screens/stream-test-2026-07-28/303_mobile-m_feature_run_4.png`, `reports/screens/stream-test-2026-07-28/304_mobile-m_feature_run_5.png`, `reports/screens/stream-test-2026-07-28/307_mobile-m_post_feature_base.png`, `reports/screens/stream-test-2026-07-28/311_mobile-m_post_collect_base.png`
- Claim: the strip under the reels reads `L2  x5  1 ways  $0.80` on `297`, `298`, `302`, `303`, `304` and `307`, and `M3  x3  1 ways  $0.20` on `311`. The correct singular is `1 way`. The plural is right above one, so the same surface reads `8 ways` on `289_mobile-m_transition_paytable_closing.png` and `5 ways` on `299_mobile-m_transition_feature_starting.png`. The source is a bare concatenation with no singular branch and no locale route: `frontend/src/lib/components/WinBreakdown.svelte:94` is `<span class="wb-ways">{current.ways} ways</span>`. It is on screen for the whole free-spins run and the post-feature base state.
- Where fixable: `frontend/src/lib/components/WinBreakdown.svelte:94` (not locked)
- Proposed fix: route the unit through the string layer with a singular branch, `{current.ways} {current.ways === 1 ? $tr('way') : $tr('ways')}`; note the literal is also hardcoded English, so the same edit closes a Q-16-shaped gap on this surface.

## STT-MOBILEM-B-09 LOW The win-line strip writes its match count with a letter `x` and mixes casing inside one string

- Frames: `reports/screens/stream-test-2026-07-28/289_mobile-m_transition_paytable_closing.png`, `reports/screens/stream-test-2026-07-28/299_mobile-m_transition_feature_starting.png`, `reports/screens/stream-test-2026-07-28/305_mobile-m_feature_run_6.png`, `reports/screens/stream-test-2026-07-28/306_mobile-m_transition_feature_exit.png`, `reports/screens/stream-test-2026-07-28/311_mobile-m_post_collect_base.png`
- Claim: the strip renders `M3  x5  8 ways  $16.00` (`289`), `SCATTER  x5  5 ways  $10.00` (`299`, `305`, `306`) and `M3  x3  1 ways  $0.20` (`311`). The count prefix is an ASCII lower-case `x`, confirmed at source: `frontend/src/lib/components/WinBreakdown.svelte:93` is `<span class="wb-count">x{current.kind}</span>`. Every other multiplier on the same session's surfaces uses U+00D7 (`1×`, `3×`, `10×`, `100×`, `400×`, `1.25×`, `5,000×` on `291` to `296`). The strip also mixes an upper-case token (`SCATTER`, `M3`, `L2`) with a lower-case unit word (`ways`) inside one 7px string. Same class as Q-26 and MID-02 but a sixth site, in neither the string layer nor `WinBanner.svelte`, so it is opened as new per the MID-02 precedent; the marshal may prefer to fold it into a widened Q-26.
- Where fixable: `frontend/src/lib/components/WinBreakdown.svelte:93` (not locked)
- Proposed fix: change the literal to `×{current.kind}`, one character, alongside the STT-MOBILEM-B-08 edit on the next line.

## Explicit absences, signed

Each of the following was looked for on all 26 frames and is signed absent.

- **Em dashes and en dashes in player-visible prose: none.** Checked the two long prose blocks (`RESPONSIBLE PLAY` and `DISCLAIMER` on `287` and `288`, about 120 words), the three mode blurbs on `291`/`292`, both buy dialog bodies on `293` to `296`, and all six interface guide rows on `286`. Only hyphens appear, in `Double-chance` and `pre-revved`, and both are correct hyphens in compound words.
- **Mixed straight and curly quotes: none, because no quotation mark or apostrophe appears at all** in any player-visible string across the 26 frames. There is nothing to be inconsistent about on this session.
- **Double spaces: none detected** at 1x in any prose block on `286`, `287`, `288`, `291`, `292`, `293`, `294`, `295`, `296`.
- **Numeral shimmy on a non-count-up surface: none observed.** `BALANCE` held `$50,000.00` at identical glyph width and identical x-origin across `289`, `297` to `307` and `311`; `WIN` moved `$324.86` on `306` to `$363.89` on `307` with no change in advance width; `TOTAL WIN` held `$10.80` across `297` to `305`. No non-`.fs-num` count-up was caught mid-flight in this range, so TR-089's carve-out was not needed and no shimmy finding is available either way. Source is consistent with the observation: `BonusInstrumentColumn.svelte:266` sets `font-variant-numeric: tabular-nums` on the pod values.
- **Money pod clipping, ellipsis or overflow: not re-observed in this range**, so no fresh TR-115 / TR-086 evidence from frames 286 to 311. `$50,000.00` fits the `BALANCE` pod, `$5,000.00` fits the `WIN` pod on `310`/`311`, `$400.00` fits the `PRICE` cell on `295`/`296`. The `BALANCE` value is occluded by the autoplay panel on `290`, which is an overlay above it and not a fit failure. The one fit failure found, STT-MOBILEM-B-01, is a control row wrapping rather than a pod clipping, which is why it is filed new; if the marshal classes a stepper wrap as money-display fit it folds into TR-115 / TR-086.
- **System font leakage: none beyond the allowlisted case.** The only glyph in the range plainly not in the brand face is the infinity mark on the autoplay spin list, `290`, which is Q-07, reviewed and kept. `™` and `©` on `287`/`288` render inside the body face with no family break, and no tofu, notdef box or substituted glyph appears anywhere in the 26 frames.
- **Placeholder strings: none.** No `lorem`, `TODO`, `undefined`, `NaN`, `null` or unresolved `{token}` on any frame.
- **Text tearing or double-rendered strings mid-transition: none.** Checked all nine transition frames in the range, `289`, `291`, `293`, `295`, `297`, `299`, `306`, `308` and `310`; every string is fully composited and none is drawn twice or half-drawn.
- **Currency and decimal format disagreement on one screen: none.** Every money figure in the range is two decimal places with a comma thousands separator and a leading `$`, on `287` through `311`; percentages are consistently two decimal places (`96.35%`) on `291` to `296`.
- **Letter-spacing or weight differing between two instances of one component: none found beyond what is filed above.** Compared the two buy dialogs (`293`/`294` against `295`/`296`) header by header and stat cell by stat cell: `WHAT YOU GET`, `PRICE`, `RTP`, `MAX WIN` are identical in tracking and weight on both. Compared the two feature HUD pods and the two money pods on `297` to `311`; the only difference is the baseline offset filed at STT-MOBILEM-B-07.

## KNOWN matches

- KNOWN(Q-26): `reports/screens/stream-test-2026-07-28/291_mobile-m_transition_features_menu_opening.png` and `292_mobile-m_features_menu.png`, the OVERBOOST card writes `Double-chance: about 1.6x the feature trigger rate. Debits 1.25x every spin while ON.` and the highlight line `1.25x per spin while ON · $1.25`, all with a letter `x`, while the same card's own right-hand label reads `1.25× bet` with U+00D7, so one card shows the same quantity `1.25` with two different glyphs.
- KNOWN(Q-26): `reports/screens/stream-test-2026-07-28/295_mobile-m_transition_dialog_nitro_overdrive_opening.png` and `296_mobile-m_dialog_nitro_overdrive.png`, `Buy a rich entry with the Overdrive meter pre-revved to 5x.` sits four lines above `5,000×` in the same dialog.
- **CORRECTION TO THE Q-26 ROW ITSELF, for the marshal.** `KNOWN_OPEN.md:20` locates Q-26 in `fsModes.ts`. That location is now stale: `grep -n "1\.6x\|1\.25x\|5x" frontend/src/lib/config/fsModes.ts` returns **nothing**, and all four survivors live in the string layer, at `frontend/src/lib/i18n/prose.ts:90` (`about 1.6x`, `Debits 1.25x every spin`) and `:94` (`pre-revved to 5x`), with the social overrides repeating them at `:189` (`Costs 1.25x`) and `:192`. A fix aimed at the cited file would find nothing to change and could be recorded as done. This is the MID-02 shape a second time: a row written to catch an incomplete sweep is itself pointing at the wrong tree.
- KNOWN(Q-34): `reports/screens/stream-test-2026-07-28/291_mobile-m_transition_features_menu_opening.png` and `292_mobile-m_features_menu.png` render the mode as `Cruise` in Title Case on the features menu, from `frontend/src/lib/i18n/prose.ts:87`. The HUD badge that renders `CRUISE` is not in this frame range, so this is the menu half of the pair only.
- KNOWN(Q-07): `reports/screens/stream-test-2026-07-28/290_mobile-m_autoplay_menu.png`, the infinity option renders in a fallback family as allowlisted. Recorded as confirmation, not as a finding.
- KNOWN(Q-16 park): the parked hardcoded English strings VISIBLE in this range are `Stop on win`, `Single win limit`, `Stop on feature`, `Loss limit` and `SPINS` on `290`; `INTERFACE GUIDE` on `286`; `RESPONSIBLE PLAY` and `DISCLAIMER` on `287` and `288`; and `PRESS COLLECT OR HIT ENTER TO CONTINUE` on `308` and `309`. This session is `en`, so nothing is mis-rendered here; the list is recorded so the de and ar squads' visibility argument has an English control. One string on this session is Q-16-shaped and NOT in the parked enumeration: the literal `ways` at `frontend/src/lib/components/WinBreakdown.svelte:94`, filed above at STT-MOBILEM-B-08.
- MID-01 and MID-02: neither is observable in this range. The banner and HUD pod count-up pair does not appear on frames 286 to 311, and no `x BET` banner unit is rendered here. The max win celebration unit on `308`/`309` is a separate component (`MaxWinCelebration.svelte:155`, already `×` under Q-12) and is filed under STT-MOBILEM-B-03 for spacing and qualifier, not for glyph.

tree_after: `git status --porcelain` at the end of the run, verbatim. Every line is `??`, untracked. NOTHING shows as MODIFIED and NOTHING shows as DELETED. The only path this squad wrote is `reports/qa/stream_test/shards/STT-MOBILEM-B.md`; every other row is another squad's shard.

```
?? reports/qa/stream_test/shards/STC-MOBILEL-B.md
?? reports/qa/stream_test/shards/STC-MOBILEM-A.md
?? reports/qa/stream_test/shards/STC-MOBILEM-B.md
?? reports/qa/stream_test/shards/STC-MOBILES-A.md
?? reports/qa/stream_test/shards/STC-MOBILES-B.md
?? reports/qa/stream_test/shards/STC-STRETCH-A.md
?? reports/qa/stream_test/shards/STC-STRETCH-B.md
?? reports/qa/stream_test/shards/STL-AR-A.md
?? reports/qa/stream_test/shards/STL-AR-B.md
?? reports/qa/stream_test/shards/STL-DE-A.md
?? reports/qa/stream_test/shards/STL-DE-B.md
?? reports/qa/stream_test/shards/STM-DESKTOP.md
?? reports/qa/stream_test/shards/STM-LAPTOP.md
?? reports/qa/stream_test/shards/STM-MOBILEL.md
?? reports/qa/stream_test/shards/STM-MOBILEM.md
?? reports/qa/stream_test/shards/STM-MOBILES.md
?? reports/qa/stream_test/shards/STM-POPOUTL.md
?? reports/qa/stream_test/shards/STM-POPOUTS.md
?? reports/qa/stream_test/shards/STM-STRETCH.md
?? reports/qa/stream_test/shards/STT-DESKTOP-A.md
?? reports/qa/stream_test/shards/STT-DESKTOP-B.md
?? reports/qa/stream_test/shards/STT-LAPTOP-A.md
?? reports/qa/stream_test/shards/STT-LAPTOP-B.md
?? reports/qa/stream_test/shards/STT-MOBILEL-A.md
?? reports/qa/stream_test/shards/STT-MOBILEL-B.md
?? reports/qa/stream_test/shards/STT-MOBILEM-A.md
?? reports/qa/stream_test/shards/STT-MOBILEM-B.md
?? reports/qa/stream_test/shards/STT-MOBILES-A.md
?? reports/qa/stream_test/shards/STT-POPOUTL-A.md
?? reports/qa/stream_test/shards/STT-POPOUTL-B.md
?? reports/qa/stream_test/shards/STT-POPOUTS-A.md
?? reports/qa/stream_test/shards/STT-POPOUTS-B.md
?? reports/qa/stream_test/shards/STT-STRETCH-A.md
?? reports/qa/stream_test/shards/STV-REST.md
```
