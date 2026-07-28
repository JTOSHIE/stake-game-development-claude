# STT-POPOUTS-2, typography (popout-s, frames 174 to 190, 1600px upscaled)
supersedes: STT-POPOUTS-A.md and STT-POPOUTS-B.md, partially: only their findings falling inside frames 174 to 190. A covers 157 to 182 and B covers 183 to 207, so this squad's range straddles both and supersedes neither in full.
scope: the 17 `popout-s` frames numbered 174 to 190 inclusive, read from `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/`, lang en, native viewport 400x225
frames_read: 17

Two of the findings this squad wrote from the frames did not survive the source
pass and are recorded as WITHDRAWN below rather than deleted, because a claim
that dies at source is the same instrument reading as a claim that dies at full
resolution, and the brief asks for both.

## STT-POPOUTS-2-01 HIGH The paytable cuts a line of body text through its x-height on every section, with no mask and no visible scrollbar

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/176_popout-s_paytable_top.png`, `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/178_popout-s_paytable_02_ways_to_win.png`, `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/179_popout-s_paytable_03_symbol_payouts.png`, `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/180_popout-s_paytable_04_rules.png`, `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/182_popout-s_paytable_06_bet_modes.png`, `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/185_popout-s_paytable_09_disclaimer.png`
- Claim: `.fs-pt-body` is `overflow-y: auto` with `padding: 20px 30px 30px` and no mask of any kind (`frontend/src/lib/components/PaytableModal.svelte:593-600`), so at this viewport every section comes to rest cut through the letterforms rather than between lines. Transcribed from the surviving upper halves at 1600px: `178` ends on `which is a match read left to right from reel 1. Reels 4`; `180` ends on `number of ways times your bet.`; `185` ends on `plays and does not guarantee any result in a single`, which is the compliance disclaimer; `176` ends on `All matching symbol positions count,`; `179` cuts the second symbol card's label to the top of `SCAT`; `182` cuts the price line under `COST` to the top of `$1.00`. Six settled captures, six sections. No scrollbar thumb renders in any of the six even though `:602-603` styles one.
  Graded HIGH rather than STREAM after reading the superseded shard: `STT-POPOUTS-A-08` makes the correct source argument that a scroll region cutting content is lawful behaviour and not a container-fit bug. What 1600px adds is that the cut lands through the x-height and not below the descender, so it reads as broken text rather than as more content, and that it does so on the regulatory disclaimer.
- Resolution note: VISIBLE AT BOTH. `STT-POPOUTS-A-08` transcribed the same strings from the native frames. This pass confirms them character for character and adds frame `185`.
- Where fixable: `frontend/src/lib/components/PaytableModal.svelte:593` (not locked)
- Proposed fix: a bottom fade mask on `.fs-pt-body` at short viewports, plus a scrollbar thumb that actually renders at this profile. Both are contained changes in one rule, as A-08 proposed.

## STT-POPOUTS-2-02 HIGH The features menu cuts the `BUY FEATURES` section label in half and draws the footer rule against the cut

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/188_popout-s_features_menu.png`, `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/187_popout-s_transition_features_menu_opening.png`
- Claim: the second section label is `BUY FEATURES` (`frontend/src/lib/i18n/translations.ts:275`, rendered at `frontend/src/lib/components/FeatureMenu.svelte:459`), and it comes to rest bisected at the scroll boundary of `.fm-cards` (`overflow-y: auto`, `frontend/src/lib/components/FeatureMenu.svelte:874-876`), immediately above the footer strip carrying `All modes · RTP 96.35%` and the `BET MODES` button. Present in the settled frame `188`, so it is the menu's resting state, and it sits on the same frame as a fully rendered `SPIN MODES`: two instances of one component, one legible and one reduced to a row of yellow fragments.
  **My own misread, recorded because it is the point of this re-run.** From the surviving upper halves at 1600px I transcribed the label as `FULL FEATURES`. It is `BUY FEATURES`. Seven times the native pixel count was still not enough to read a bisected all caps line, and only the source settled it. That is a limit of the instrument, not of the finding.
- Resolution note: VISIBLE AT BOTH. `STT-POPOUTS-B-04` found it at native with magnification and correctly declined to read the word off the pixels. Graded MEDIUM there; raised to HIGH here because it is the resting state of the menu a streamer opens most often.
- Where fixable: `frontend/src/lib/components/FeatureMenu.svelte:874-876` (not locked)
- Proposed fix: `mask-image: linear-gradient(to bottom, #000 calc(100% - 14px), transparent)` on `.fm-cards`, so partial content reads as continuing rather than as cut.

## STT-POPOUTS-2-03 STREAM The buy dialog's only sentence is occluded by the stats panel, leaving the orphan fragment `bet?`

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/190_popout-s_dialog_buy_overdrive.png`, `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/189_popout-s_transition_dialog_buy_overdrive_opening.png`
- Claim: the string is `Start Overdrive Free Spins now at {cost}× your bet?` (`frontend/src/lib/i18n/translations.ts:1537`). What reaches the player at 400x225 is the fragment `bet?` protruding below the opaque magenta lower edge of the sticky stats row. There is no dialog title, no `CONFIRM` and no `CANCEL` on screen. The mechanism is `.buy-modal` at `max-height: 90dvh; overflow-y: auto` with a bottom padding (`frontend/src/lib/components/BuyBonus.svelte:174-175`) against `.buy-stats-row` at `position: sticky; bottom: 0` with an opaque background (`:224-233`), which leaves a narrow strip of scrollable prose visible beneath the pinned row. A dialog whose entire visible copy is the word `bet?` is the worst typographic moment in this frame set.
- Resolution note: VISIBLE AT BOTH. Only at 1600px is the surviving fragment legible as the word `bet?` rather than as an unidentified smudge, which is what distinguishes occlusion from a decorative element.
- Where fixable: `frontend/src/lib/components/BuyBonus.svelte:174` and `:230-232` (not locked)
- Proposed fix: move `padding-bottom` off `.buy-modal` onto an inner wrapper that ends above `.buy-stats-row` so no content strip can exist under the sticky row, and add `scroll-padding-bottom` equal to the row height. As `STT-POPOUTS-B-01` proposed; this pass confirms it independently.

## STT-POPOUTS-2-04 WITHDRAWN The paytable does NOT write its multipliers with a letter `x`

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/181_popout-s_paytable_05_overdrive_free_spins.png`, `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/182_popout-s_paytable_06_bet_modes.png`
- Claim, as written from the frames and now withdrawn: I read the marks in `1x` / `3x` (frame `181`) and `1x` / `5,000x` (frame `182`) as baseline-seated lowercase letters, against a raised centred mark on the features menu and buy dialog, and opened this as a new instance of the `KNOWN_OPEN` Q-26 and `LEDGER.md` MID-02 class on surfaces neither row enumerates.
  **Refuted at source, every instance.** `frontend/src/lib/components/PaytableModal.svelte:95-97` are `award: '1×'`, `'3×'`, `'10×'`; `:321` is `{m.cost}×`; `:233-235` are `3×`, `4×`, `5×`; `frontend/src/lib/config/fsModes.ts:139` is `FS_MAX_WIN_LABEL = '5,000×'`. All U+00D7. The features menu is `{m.cost}× {...}` at `frontend/src/lib/components/FeatureMenu.svelte:372`, `:427` and `:480`, also U+00D7, and the buy dialog draws its unit from `maxWinVsBaseBetLabel` (`frontend/src/lib/config/fsModes.ts:157-158`), which composes the same constant. There is no glyph split. What I read as two different marks is one mark at three different type sizes.
  `STT-POPOUTS-B` withdrew the identical claim from the native frames for the identical reason. Two independent passes at two resolutions both formed this false positive off the pixels, which says the frames cannot adjudicate this class at any resolution available here, and it should be adjudicated by grep. Recorded so a third pass does not spend the budget again.
- Resolution note: NEW AT 1600PX as a claim, REFUTED at source. The native pass could not have seen the mark at all; this pass saw it and read it wrongly.
- Where fixable: nothing to fix.
- Proposed fix: PARK(no defect). The one surviving real instance of the class is at STT-POPOUTS-2-14 below, and it is not on any of these surfaces.

## STT-POPOUTS-2-05 HIGH The OVERBOOST cost is set at 8.32px, and two careful readers disagree about whether its decimal point survives

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/188_popout-s_features_menu.png`, `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/187_popout-s_transition_features_menu_opening.png`
- Claim: `.fm-panel--mini .fm-cost { font-size: 0.52rem; }` (`frontend/src/lib/components/FeatureMenu.svelte:780`) is `8.32px` at the 16px root, against the `11px legibility floor` this same file names at `frontend/src/lib/components/FeatureMenu.svelte:227`. At 1600px I read the OVERBOOST row as `125x bet` and could not resolve a decimal separator; `STT-POPOUTS-B-03` read `1.25` off the native file at 11x magnification. The source literal is `{m.cost}×` with `m.cost` of `1.25`, so B's reading is the true one and mine is wrong.
  **The disagreement is the finding.** Two passes examining the same rendered token, one at native with magnification and one at seven times the pixel count, returned `1.25` and `125` for a disclosure figure that differs by a factor of a hundred. A number a reader can get wrong twice at inspection is one a player gets wrong on a moving screen. This is the consequence B-03 predicted from the type size, measured rather than argued.
  A refinement to B-03's own count: it reports *two* mini-profile styles at `0.52rem`. There are **three**: `:763` (`.fm-panel--mini .fm-spin-cost`), `:771` (`.fm-panel--mini .fm-section-label`) and `:780` (`.fm-panel--mini .fm-cost`). The third, `:763`, carries the `SPIN COST` disclosure strip.
- Resolution note: NEW AT 1600PX. The native pass established the source cause; this pass supplies the independent misreading that demonstrates the cost.
- Where fixable: `frontend/src/lib/components/FeatureMenu.svelte:763`, `:771` and `:780` (not locked)
- Proposed fix: raise all three to at least `0.6875rem` (11px) to meet the file's own stated floor, and let the mini panel drop a row rather than undercut it. If 11px will not fit, that is a composition decision to record, not a size to quietly undercut.

## STT-POPOUTS-2-06 HIGH The features menu prints the word `bet` from a hardcoded English literal two rows below printing the same word from the locale layer

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/188_popout-s_features_menu.png`, `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/187_popout-s_transition_features_menu_opening.png`
- Claim: the top strip renders `BET` from `{$tr('bet')}` (`frontend/src/lib/components/FeatureMenu.svelte:340`, value `bet: 'BET'` at `frontend/src/lib/i18n/translations.ts:207`). Two rows below, the same word renders three times as lowercase `bet` from a hardcoded English literal: `{m.cost}× {$isSocial ? 'per spin' : 'bet'}` at `frontend/src/lib/components/FeatureMenu.svelte:372` and `:427`. **Both ternary branches are English in all sixteen locales.**
  **This is the shape the same file already fixed, one element away.** The comment at `frontend/src/lib/components/FeatureMenu.svelte:335-339` records that `{$isSocial ? 'PLAY' : 'BET'}` on the bet label was *"a hand-rolled copy of a layer that already exists"*, that it *"reproduced the social swap and dropped the locale swap"*, and that *"Both branches were English in all sixteen locales"*, closed as TR-091. The identical construct 32 lines below it was not swept. `KNOWN_OPEN` records the gate blind spot that hides it: `locale_completeness_check.mjs` cannot see *literals beside interpolations*, and `{m.cost}× {ternary}` is exactly that.
  The typographic symptom that led here is the casing: one panel, one word, `BET` and `bet`, with no hierarchy reason for the difference. The defect underneath it is a localisation hole in the TR-104 family.
- Resolution note: NEW AT 1600PX. Case is not judgeable at 120 tokens, and neither superseded shard reports it.
- Where fixable: `frontend/src/lib/components/FeatureMenu.svelte:372` and `:427` (not locked)
- Proposed fix: replace both literals with the existing locale call, `t($locale, 'bet', $isSocial ? 'social' : 'real')`, which is the exact call `MaxWinCelebration.svelte:159` already makes for this word under TR-091, then settle the casing in one place. Escalate per convention (l.8) only if the owner wants the unit cased differently from the label.

## STT-POPOUTS-2-07 MEDIUM `SPIN COST $1.00 BET` reads as one run-on string

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/188_popout-s_features_menu.png`, `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/187_popout-s_transition_features_menu_opening.png`
- Claim: `.fm-spin-cost` carrying `SPIN COST` plus its value (`frontend/src/lib/components/FeatureMenu.svelte:334`, string `hudSpinCost: 'SPIN COST'` at `frontend/src/lib/i18n/translations.ts:231`) and `.fm-betlabel` carrying `BET` (`:340`) are adjacent inline children of one `.fs-face` flex row with nothing between them: no rule, no larger gap, no alignment change. The rendered result is the single phrase `SPIN COST $1.00 BET` on one baseline in three colours, in which the trailing `BET` in fact labels the stepper to its right. The value's own `margin-left: 0.3em` (`:852`) is smaller than the flex gap that follows it, so the grouping actively argues for the wrong reading.
- Resolution note: NEW AT 1600PX. The three tokens were a single grey bar at native resolution.
- Where fixable: `frontend/src/lib/components/FeatureMenu.svelte:334` and `:340` (not locked)
- Proposed fix: separate the two groups with a divider or a wider gap, or drop the `BET` label since the stepper already sits beside its own value.

## STT-POPOUTS-2-08 MEDIUM Two modal headers, two unrelated typographic systems, and the caps come from two different layers

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/174_popout-s_session_panel.png`, `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/176_popout-s_paytable_top.png`, `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/188_popout-s_features_menu.png`
- Claim: the session panel's header is `Session information`, sentence case, cyan, normal tracking, no rule beneath (`rgSessionTitle` at `frontend/src/lib/i18n/translations.ts:246`, rendered by `frontend/src/lib/components/SessionPanel.svelte:100`). The paytable's is `PAYTABLE` and the features menu's is `FEATURES`: all caps, orange to yellow, wide tracking, a rule beneath and a yellow spine at the left edge, from `.fs-heading` at `text-transform: uppercase; letter-spacing: 0.16em` (`frontend/src/lib/components/PaytableModal.svelte:605`). Three modals reached from the same six-item menu, one of them on a different design system. The close control differs too: a heavy X on a flat grey disc on the session panel against a thin x on a bevelled metal knob on the other two.
- Resolution note: VISIBLE AT BOTH. `STT-POPOUTS-A-04` found it at native and its diagnosis is correct; this pass confirms the tracking difference, which native resolution could not show, and the close-control split, which it did not report.
- Where fixable: `frontend/src/lib/components/SessionPanel.svelte:100` with `frontend/src/lib/i18n/translations.ts:246`, against `frontend/src/lib/components/PaytableModal.svelte:605` (not locked)
- Proposed fix: give the session panel's heading the same transform and tracking as `.fs-heading`, or lower `.fs-heading` to sentence case. One property either way; direction is an art call of the same shape as Q-34.

## STT-POPOUTS-2-09 MEDIUM Symbol card labels in one row are not on a shared baseline

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/179_popout-s_paytable_03_symbol_payouts.png`
- Claim: the two cards in the `SYMBOL PAYOUTS` row start at the same top edge, but `WILD` clears the panel cut while the second card's label sits roughly 25 upscaled pixels lower and is reduced to the top of `SCAT`. The labels are positioned by the height of the art above them rather than by a shared baseline. `.fs-sym-card > .fs-face` is `padding: 14px 10px; gap: 6px; align-items: center` and `.fs-sym-card img` is a fixed 78px square with `object-fit: contain` (`frontend/src/lib/components/PaytableModal.svelte:657-658`), which should hold them level and does not.
- Resolution note: VISIBLE AT BOTH. `STT-POPOUTS-A-07` measured the same offset at native as about 9px at a 225px viewport, which scales to the 25 upscaled pixels seen here. Independent agreement on the magnitude.
- Where fixable: `frontend/src/lib/components/PaytableModal.svelte:657-659` (not locked). Cause not isolated in either pass.
- Proposed fix: PARK(cause not isolated). The durable shape once it is: a fixed-height art slot in `.fs-sym-card > .fs-face` so labels share a baseline regardless of what the symbol art does.

## STT-POPOUTS-2-10 MEDIUM The RULES list hangs its markers on the left of centre-aligned text

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/180_popout-s_paytable_04_rules.png`
- Claim: `.fs-rules li` is `padding-left: 16px; position: relative` with `.fs-rules li::before { content: '›'; position: absolute; left: 0; }` (`frontend/src/lib/components/PaytableModal.svelte:667-669`), while the text itself is centred by inheritance. The marker therefore sits at the list item's left edge, which is the full column width, and the text floats in the middle: roughly 140 upscaled pixels of empty space between marker and first word, and no relationship at all on wrap lines, where `starting from reel 1.` centres under the middle of the panel with nothing above its left edge. A bulleted list whose bullets do not sit against their text is not a list.
- Resolution note: VISIBLE AT BOTH. `STT-POPOUTS-A-05` found it at native and correctly identified `.fs-rules` inheriting centring; this pass confirms and adds the measured gap.
- Where fixable: `frontend/src/lib/components/PaytableModal.svelte:667-669` (not locked)
- Proposed fix: add `text-align: left` to `.fs-rules`, matching `.intro-rules` at `frontend/src/lib/components/IntroSplash.svelte:97`, leaving section headings centred.

## STT-POPOUTS-2-11 MEDIUM Centred compliance paragraphs, with a one word widow

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/184_popout-s_paytable_08_responsible_play.png`, `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/185_popout-s_paytable_09_disclaimer.png`
- Claim: the `RESPONSIBLE PLAY` paragraph is set centred over five lines and ends on the single word `menu.` alone on its own line. The `DISCLAIMER` paragraph (`disclaimerText` from `$tr('disclaimerBody')`, `frontend/src/lib/components/PaytableModal.svelte:62`) is set the same way over six or more lines. The paytable's body copy rules are centred by convention throughout (`.fs-caption` and `.fs-sym-note`, `:647` and `:664`), and the paragraph classes inherit it. Centred setting for a long regulatory paragraph, with a widow at the end, is the specific machine-tell the standing mandate's inspection test names, and both paragraphs are copy a reviewer reads closely.
- Resolution note: NEW AT 1600PX. Line breaks and the widow are not countable in a thumbnail, and neither superseded shard reports them.
- Where fixable: `frontend/src/lib/components/PaytableModal.svelte:647` and `:664` for the centred body convention; the disclaimer paragraph's own rule was not isolated within the source budget, and `STT-POPOUTS-A-05` hit the same wall on the same ancestor.
- Proposed fix: left align long body paragraphs and keep centring for headings and one line captions. Same one-property change as 2-10 and best done with it.

## STT-POPOUTS-2-12 MEDIUM The interface guide teaches a control that is not the control on screen, and its swatch carries a sub-legible baked label

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/183_popout-s_paytable_07_interface_guide.png`, `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/186_popout-s_transition_paytable_closing.png`
- Claim: the guide row titled `Spin` shows a tile containing a teal ring, a play triangle and, beneath the triangle, a text label that resolves to an unreadable smear even at 1600px. The swatch is a raster: `<img class="fs-guide-img" src="{$themeAssets.assetBase}/ui/{f}">` at `frontend/src/lib/components/PaytableModal.svelte:369-373`, sized `width: 44px; height: 44px; object-fit: contain` at `:747`, so any text baked into the control art renders at 44px whatever it was authored at. The live spin control on frame `186` is a teal bordered rounded rectangle with a bare white triangle and no label at all, so the guide is illustrating a control the player cannot see. Illegible text on the one surface whose whole purpose is to explain the interface.
- Resolution note: NEW AT 1600PX. At native resolution the swatch is a single dark square and neither the baked label nor the mismatch is visible.
- Where fixable: `frontend/src/lib/components/PaytableModal.svelte:369-373` and `:747` (not locked)
- Proposed fix: point the guide at art with no baked text, or raise the swatch size so any label it carries clears the 11px floor the project sets for itself at `frontend/src/lib/components/FeatureMenu.svelte:227`. Either way the swatch and the live control should be the same object.

## STT-POPOUTS-2-13 HIGH The win breakdown strip writes its multiplier with an ASCII `x` and hardcodes the English word `ways`, and it is a SIXTH instance of a class two rows call enumerated

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/186_popout-s_transition_paytable_closing.png`
- Claim: the strip under the reel window is `WinBreakdown.svelte`, and it renders `<span class="wb-count">x{current.kind}</span>` at `frontend/src/lib/components/WinBreakdown.svelte:93`. **That `x` is ASCII U+0078**, not the U+00D7 the seventeen other files under `frontend/src/lib/` use, and it is not in `fsModes.ts` and not `WinBanner.svelte:205`. `KNOWN_OPEN` row Q-26 enumerates the survivors of the Q-12 sweep as *four more player-visible instances* in `fsModes.ts`; `LEDGER.md` MID-02 adds `WinBanner.svelte:205` as a fifth and says in terms that *the instrument that built Q-26's list evidently searched the config and prose layers and not the components*. This is a second component instance, and it corroborates MID-02's diagnosis from a different direction: the enumeration is still incomplete.
  The adjacent span at `:94` is `{current.ways} ways`, a hardcoded English literal beside an interpolation, which is both the same construct as 2-06 and the exact shape `KNOWN_OPEN` records `locale_completeness_check.mjs` cannot see. `LEDGER.md` records `STL-AR-A-01` reaching this surface from the Arabic session, so the English word reaches localised players.
  This strip is on screen for the whole of every win, which is most of what a stream shows.
  **Sub-claim withdrawn.** I also read the leading `H3` as a raw internal symbol code leaking to the player. It is a recorded intention, not a leak: `frontend/src/lib/components/WinBreakdown.svelte:10-14` states *"The tier symbols are IDs, identical in every language, so they stay a plain map"*, and `SYMBOL_IDS` at `:15-18` maps each id to itself. Noted for the owner rather than filed: the map enumerates `H1, H2, M1, M2, M3, L1, L2, L3` and does **not** contain `H3`, which frame `186` shows reaching the surface through the `?? raw` fallback at `:23`. Harmless today because the fallback returns the same string; stale nonetheless, and it means the map does not enumerate what it claims to.
- Resolution note: NEW AT 1600PX for the `x`. At native the whole run is a coloured smear; at 1600px the tokens separate, which is what sent me to the file.
- Where fixable: `frontend/src/lib/components/WinBreakdown.svelte:93` for the glyph, `:94` for the literal, `:15-18` for the stale map (not locked)
- Proposed fix: change `x{current.kind}` to `×{current.kind}`, route `ways` through the locale layer, and widen Q-26's enumeration to the whole component tree rather than the two files it searched, exactly as MID-02 asks. Re-proof from fresh frames, not from the old ledger.

## STT-POPOUTS-2-14 MEDIUM The max win unit was moved out of the value on the paytable and left in the value on the buy dialog

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/190_popout-s_dialog_buy_overdrive.png`, `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/189_popout-s_transition_dialog_buy_overdrive_opening.png`, `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/182_popout-s_paytable_06_bet_modes.png`, `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/188_popout-s_features_menu.png`
- Claim: the buy dialog sets `maxWinVsBaseBetLabel($isSocial)` as the stat VALUE (`frontend/src/lib/components/BuyBonus.svelte:135`), which composes `5,000× base bet` (`frontend/src/lib/config/fsModes.ts:157-158`), so the unit renders at the value's own weight, colour and near enough its size, wrapping to a second line on frame `190`. The paytable does the opposite for the same figure: `{maxWinStatLabel()}` in the label and bare `{FS_MAX_WIN_LABEL}` in the value (`frontend/src/lib/components/PaytableModal.svelte:337-338`), and the comment directly above it at `:333-336` records why, under TR-037: *"Rendering `5,000x base bet` as the value clipped it to `5,000x ba...` on every card, hiding the very figure the platform requires to be displayed."* The buy dialog is the surface that fix was never swept to, and it is a platform disclosure. The features menu is a third treatment again, `1× bet` with the unit smaller, dimmer and in a different colour (`frontend/src/lib/components/FeatureMenu.svelte:372`).
- Resolution note: NEW AT 1600PX. The two-line wrap and the relative weighting are not judgeable at native resolution, and neither superseded shard reports the unswept class.
- Where fixable: `frontend/src/lib/components/BuyBonus.svelte:135` against `frontend/src/lib/components/PaytableModal.svelte:337-338` (not locked)
- Proposed fix: use the same label-plus-bare-value split in the buy dialog that TR-037 established on the paytable, so one value-and-unit pattern serves all three surfaces.

## STT-POPOUTS-2-15 LOW The same column is `Cost` on one surface and `PRICE` on another, and one is capitalised by CSS while the other is capitalised by data

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/182_popout-s_paytable_06_bet_modes.png`, `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/190_popout-s_dialog_buy_overdrive.png`
- Claim: the paytable's bet modes card heads its first stat column `COST` and the buy dialog heads the identical column `PRICE`. `RTP` and `MAX WIN` are identical on both, so exactly one of three labels changes between two surfaces showing the same three column strip. Underneath, the two are capitalised by different layers: `costLabel: 'Cost'` is title case in the data (`frontend/src/lib/i18n/prose.ts:103`) and rendered upper by `.fs-mode-stat-label { text-transform: uppercase }` (`frontend/src/lib/components/PaytableModal.svelte:712-715`), while `buyPrice: 'PRICE'` is upper case in the data (`frontend/src/lib/i18n/translations.ts:1537`) and rendered by `.buy-stat-label`, which also carries `text-transform: uppercase` (`frontend/src/lib/components/BuyBonus.svelte:239`). They agree today by coincidence of two mechanisms and would diverge the moment either side is touched, which is the same one-layer-down split `STT-POPOUTS-A-04` recorded for the section headings.
- Resolution note: NEW AT 1600PX for the word difference; the source split is a step-3 finding either pass could have made.
- Where fixable: `frontend/src/lib/i18n/prose.ts:103` and `frontend/src/lib/i18n/translations.ts:1537` (not locked)
- Proposed fix: pick one word, and pick one layer to hold the case, across all sixteen locales at once.

## Native pass reconciliation

Both superseded shards were read AFTER this squad's own frame pass and after its
first shard write, per the brief's order of work. Only their findings inside
frames 174 to 190 are judged; the rest belong to sibling squads and no claim is
made about them.

### From STT-POPOUTS-A (frames 157 to 182)

| Native id | Verdict | Note |
|---|---|---|
| A-01 intro rules Continue button over body copy | OUT OF RANGE | Frame `160`, sibling squad's. |
| A-02 PAYTABLE menu item above the viewport | OUT OF RANGE | Frames `172` and `173`, sibling squad's. |
| A-03 HUD menu mixes title case and all caps | OUT OF RANGE | Frame `173`, sibling squad's. |
| A-04 two heading registers across three overlays | **CONFIRMED** | Frames `174`, `176`, `188`. Every element holds at 1600px: `Session information` is sentence case and untracked, the paytable and features headings are caps with visibly wide tracking. Carried as 2-08, which adds the letter-spacing difference native resolution could not show and the close-control split A-04 does not report. |
| A-05 bulleted rules prose centred in the paytable | **CONFIRMED** | Frame `180`. The `›` markers are visibly detached from centred text, and the wrap line `starting from reel 1.` centres exactly as described. Carried as 2-10. |
| A-06 balance frozen at `$50K` for the whole session | **REFINED, and partly out of range** | Only frames `174` and `186` of mine bear on it. `174` shows `Total won $20.10` and `Net result +$15.10` while `186` shows `BAL $50K`, which is consistent with A-06's observation. But the FORMAT half of the claim is refuted at source: the abbreviation is sanctioned, see the KNOWN section below. Whether the balance VALUE is stale is a state question this typography lens does not adjudicate, and I leave it to the composition squad rather than signing it. |
| A-07 two symbol payout cards, labels on different baselines | **CONFIRMED** | Frame `179`. A-07 measured about 9px at a 225px viewport; at 1600px the offset is about 25 upscaled pixels, which is the same offset. Independent agreement on magnitude. Carried as 2-09. |
| A-08 paytable scroll region bisects body text on every section | **CONFIRMED** | Frames `176`, `178`, `179`, `180`, `182`, plus `185` which A-08 does not list. Every transcribed string matches character for character at 1600px. A-08's severity reasoning is right and I have adopted it: carried as 2-01 at HIGH, not STREAM. |
| A-09 one HUD menu label out of the shared left edge | OUT OF RANGE | Frames `172` and `173`, sibling squad's. |
| A-10 two small-caps label treatments in one paytable | **CONFIRMED** | Frames `181` and `182`. At 1600px the gold `SCATTERS` / `FREE SPINS` / `INSTANT AWARD` header row and the grey `COST` / `RTP` / `MAX WIN` row are plainly two colours and two weights on consecutive scroll positions. A-10's LOW grade is right, they are genuinely two components. Not re-filed. |

### From STT-POPOUTS-B (frames 183 to 207)

| Native id | Verdict | Note |
|---|---|---|
| B-01 buy confirm dialog renders a slice of its prose and nothing else | **CONFIRMED** | Frames `189` and `190`. The fragment is legible as `bet?` at 1600px, and the source string at `translations.ts:1537` matches B-01's citation exactly. Carried as 2-03, at the same STREAM severity. |
| B-02 free spins instrument column cut at the right edge | OUT OF RANGE | Frames `193` to `207`, sibling squad's. |
| B-03 two mini-profile styles at 0.52rem, under the 11px floor | **CONFIRMED and REFINED** | Frames `187` and `188`. Refined twice: there are **three** such rules, not two, the third being `.fm-panel--mini .fm-spin-cost` at `FeatureMenu.svelte:763`; and this pass independently misread the OVERBOOST cost as `125x bet` where B-03 read `1.25` at 11x, which is the measured consequence of the size B-03 derived. Carried as 2-05. |
| B-04 `BUY FEATURES` label knife-cut at the scroll edge | **CONFIRMED** | Frame `188`, settled. B-04 was right to decline to read the word off the pixels: at 1600px I read it and got `FULL FEATURES`, which is wrong. Raised from B-04's MEDIUM to HIGH here. Carried as 2-02. |
| B-05 paytable DISCLAIMER ends mid-clause at the panel border | **CONFIRMED** | Frame `185`. Same terminal string, `plays and does not guarantee any result in a single`. B-05 signed a caveat that it had not read `PaytableModal.svelte` and could not say whether a scrollbar exists: it does, `:602-603` styles one, and it does not render in any of the six frames. Folded into 2-01. |
| B-06 max win unit sets `×` and `BET` at two sizes with no shared baseline | OUT OF RANGE | Frames `204` and `205`, sibling squad's. |
| B-07 mode names mix title case and full capitals | **CONFIRMED, and I have adopted its grade** | Frames `187`, `188`, plus `182` which B-07 does not list, where the paytable card also writes `Normal`. I had this open at HIGH from the frames alone. B-07's counter-evidence is decisive and I did not have it: `frontend/src/lib/i18n/prose.locales.ts:22` instructs translators to keep the case shape and never translate the product nouns, naming `OVERBOOST`, so its capitals are a recorded intention rather than a drift. Not re-filed as a finding; it belongs with Q-34 as one art call. |
| B-08 self-reported evidence damage | NOT A PRODUCT FINDING | Recorded, and heeded: this squad invoked no image tool against any committed path. See tree_after. |

### Both superseded shards' withdrawn `×` claims

B withdrew a KNOWN(Q-26) match on the features menu after finding U+00D7 at
source. This pass formed the SAME false positive from the 1600px frames, on the
paytable instead, and withdrew it for the same reason (2-04). **That is the
useful result: two passes at two resolutions both misread this glyph class off
pixels, so it is not frame-adjudicable and should be settled by grep.** The one
real instance found by either pass is `WinBreakdown.svelte:93`, which is new
here and is filed as 2-13.

## Explicit absences, signed

Checked across all 17 frames at 1600px, and NOT found, so each absence is a
signed claim rather than an omission.

- **No mixed straight and curly quotation marks, because there is no quotation mark or apostrophe of any kind.** The three prose surfaces in range are `183` (`Start a spin at the current bet.`), `184` and `185`, and none uses a possessive or a contraction. The only punctuation in play across all 17 frames is `.` `,` `;` `?` `(` `)` `%` `$` `:` `›` and the middle dot in `All modes · RTP 96.35%`.
- **No em dash and no en dash in player-visible prose.** Checked both full paragraphs (`184`, `185`), the RULES list (`180`), the guide row copy (`183`), and every label and button on `174` and `186` to `190`. The only horizontal strokes are the middle dot above and the minus glyph on the bet decrement control (`187`, `188`), which is a control, not prose.
- **No double space found, and the limit of that claim is stated.** The centred setting in `184` and `185` makes a doubled word space unusually visible because it distorts a centred line's balance; word gaps are uniform across all five lines of `184` and all six of `185`. This absence is signed against what the frames can show, not against the source.
- **No numeral width change on any surface.** `$1.00` holds identical digit widths and positions across `186`, `187` and `188`; `96.35%` across `182`, `188`, `189` and `190`; `$100.00` is identical between `189` and `190`; the session panel's `00:00:21`, `$5.00`, `$20.10` and `+$15.10` are a single capture. **No count-up runs anywhere in frames 174 to 190**, so `KNOWN_OPEN` TR-089's `.fs-num` carve-out was never engaged and the shimmy question does not arise in this range either way.
- **One zero glyph, everywhere.** Every zero on every frame in range is the slashed form: `00:00:21`, `$5.00`, `$20.10`, `+$15.10` (`174`), `$1.00` and `$50K` (`186` to `188`), `$100.00` and `5,000×` (`189`, `190`). No unslashed zero anywhere, so there is no numeral-family split between the session panel, the HUD, the paytable and the buy dialog.
- **No system font leaking through.** Two families are in use and the split is consistent across the 17: a wide display face on every heading, label, chip, button and numeral, and a narrower squared-terminal face on running prose and mode names. No heading uses the text face and no paragraph uses the display face. The non-ASCII glyphs that would be the likely fallback candidates, `·` on `187` and `188` and `›` on `180`, both render in the brand face; `KNOWN_OPEN` Q-07's allowlisted infinity glyph does not appear in this range.
- **No missing-glyph box, no placeholder string, no lorem text and no untranslated key** on any of the 17 frames.
- **No ellipsised string.** Every truncation in range is a hard cut or an occlusion, reported as 2-01, 2-02 and 2-03; none renders an ellipsis character.
- **Decimal and thousands formats agree** wherever both appear at full precision: `.` decimal and `,` thousands throughout, in `$100.00`, `5,000×`, `96.35%`, `$16.20`, `$20.10` and `+$15.10`. The single apparent disagreement, the abbreviated balance, is sanctioned; see below.
- **Not checked, and named so nobody reads coverage into silence:** the `de-desktop` and `ar-desktop` renderings of every surface above, all of which this squad's findings 2-06 and 2-13 predict will show English literals; and any frame outside 174 to 190.

## KNOWN matches

- **KNOWN(TR-115 / TR-086): claimed, then WITHDRAWN at source.** I opened this on `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/186_popout-s_transition_paytable_closing.png`, where `BAL $50K` sits beside `WIN $16.20` and a `$1.00` bet on one strip, as a currency-format disagreement in one view. It is not a fit failure and not a defect: `frontend/src/lib/utils/currency.ts:258-268` records Fable's ruling closing TR-066, allowing abbreviation in *"the 400x225 mini-player profile alone, for BALANCE and WIN alone, and only when the fully formatted value cannot fit its MEASURED slot at the legible floor"*, decided by measurement in `frontend/src/lib/actions/fitMoney.ts`. `popout-s` IS that profile, `BAL` and `WIN` ARE those two pods, and the bet pod correctly keeps full precision. **No unsanctioned money-fit failure appears in frames 174 to 190.** The `$1.00` cut on frame `182` is the paytable scroll cut of 2-01, not a fit failure.
- **KNOWN(Q-34)**, fresh evidence: `188_popout-s_features_menu.png` and `182_popout-s_paytable_06_bet_modes.png` write `Normal` and `Cruise` in title case on the features menu and the paytable card. The direction question should be ruled on together with `STT-POPOUTS-B-07`, whose counter-evidence at `frontend/src/lib/i18n/prose.locales.ts:22` this pass accepts.
- **KNOWN(Q-26)**, extended rather than matched: the class survives at `frontend/src/lib/components/WinBreakdown.svelte:93`, filed as 2-13. The paytable and features menu instances I suspected are refuted at source, filed as 2-04.
- **KNOWN(Q-16 park)**, recorded only because the park's urgency depends on it: the parked hardcoded English headings `Symbol Payouts`, `Interface Guide`, `Responsible Play` and `Disclaimer` are all visible on frames `179`, `183`, `184` and `185` of this English session, and this squad's 2-06 and 2-13 add `bet`, `per spin` and `ways` as further hardcoded English on stream-visible surfaces that the park does not enumerate. Only the de and ar squads can evidence the harm.
- **MID-01 and MID-02**: neither is visible in frames 174 to 190. This session's big win triple is frames `169` to `171`, outside this squad's range. 2-13 corroborates MID-02's DIAGNOSIS, that Q-26's enumeration missed the component layer, from a different surface.

tree_after:
```
?? reports/qa/stream_test/shards/STC-MOBILEL-1.md
?? reports/qa/stream_test/shards/STC-POPOUTS-1.md
?? reports/qa/stream_test/shards/STC-POPOUTS-2.md
?? reports/qa/stream_test/shards/STC-POPOUTS-3.md
?? reports/qa/stream_test/shards/STM-POPOUTS.md
?? reports/qa/stream_test/shards/STT-POPOUTS-1.md
?? reports/qa/stream_test/shards/STT-POPOUTS-2.md
?? reports/qa/stream_test/shards/STT-POPOUTS-3.md
```

Every entry is untracked (`??`). **Nothing shows as MODIFIED and nothing as
DELETED, so this squad did not dirty the tree.** `STT-POPOUTS-2.md` is mine; the
other seven are sibling squads' shards in the same wave, not mine and not my
concern. This squad wrote exactly one file, read the frames from
`.evidence-scratch/stream-test-upscaled-1600/` rather than from
`reports/screens/`, invoked no image tool against any path (heeding
`STT-POPOUTS-B-08`'s `sips` near-miss), and ran no project script.
