# STC-STRETCH-B, composition (stretch, frames 390 to 415)

scope: every `stretch` frame numbered 390 to 415 inclusive, 26 frames, viewport
`1920x800`, lang `en`, per `reports/screens/stream-test-2026-07-28/MANIFEST.json`.
frames_read: 26

All pixel figures below were measured from the committed PNGs by decoding them
directly (pure python zlib PNG decode in memory, no file written, no project
script run). Every frame is exactly `1920x800`, so image coordinates are viewport
coordinates and the horizontal centre line is `x = 959.5`.

**The stage scale, derived once because four findings depend on it.**
`frontend/src/App.svelte:2200` puts the whole game stage behind
`transform: scale(var(--S, 1))`. Two independent element pairs give the same
factor at this viewport: `PaytableModal.svelte:547` declares
`max-width: 1178px` and the paytable measures `1309px` wide (`1309/1178 =
1.1112`); `FeatureMenu.svelte:704` declares `max-width: 560px` and the features
panel measures `622px` wide (`622/560 = 1.1107`). So `S` is about `1.111` at
`1920x800`, and any length a component expresses in viewport units rather than
stage units is multiplied a second time.

## STC-STRETCH-B-01 HIGH The FEATURES modal is jammed against the top and bottom viewport edges while carrying 649px of margin on each side

- Frames: `reports/screens/stream-test-2026-07-28/396_stretch_features_menu.png`,
  `reports/screens/stream-test-2026-07-28/395_stretch_transition_features_menu_opening.png`
- Claim: at `1920x800` the FEATURES modal measures left edge `x=649`, right edge
  `x=1271` (width `622`), top border `y=9`, bottom `y=785` (the gold left accent
  bar at `x=657` runs to `y=785` and is dark from `y=786`). That is a top margin
  of `9px` and a bottom margin of about `14px` against side margins of `649px`
  and `648px`. The side inset is roughly forty-five times the vertical inset, so
  the panel reads as a portrait column rammed into the top and bottom of a
  landscape frame with two large dead bands beside it. The same session's
  paytable modal at the same viewport is inset correctly: left `x=305`, right
  `x=1614` (margins `305` and `306`), top border `y=33`, bottom `y=767` (margins
  `33` and `32`), measured on
  `reports/screens/stream-test-2026-07-28/391_stretch_paytable_08_responsible_play.png`.
  Two modal surfaces in the same game at the same viewport use two different
  vertical inset rules, and only one of them breathes.
  **The cause is a unit mismatch, and it is arithmetic rather than taste.**
  `FeatureMenu.svelte:706-707` caps the panel at `max-height: 88dvh` and
  `:712-713` repeats it on the face. `dvh` is measured against the true viewport,
  `800px`, giving `704` stage px, which the stage transform at `App.svelte:2200`
  then multiplies by `S = 1.111` to `782` device px, that is `98%` of the
  viewport height. Measured `776`. The paytable does not have the problem because
  `PaytableModal.svelte:549` caps it in stage px (`max-height: 662px`, rendering
  `662 x 1.111 = 735`, measured `734`). Nothing is cut off: the footer row
  (`All modes · RTP 96.35%` text bbox `x676..841, y760..768`, `BET MODES` button
  bbox `x1122..1243, y750..779`) renders fully. The defect is the cramping.
- Where fixable: `frontend/src/lib/components/FeatureMenu.svelte:706-707` and
  `:712-713`, against the working precedent at
  `frontend/src/lib/components/PaytableModal.svelte:547-549`. Neither is locked.
- Proposed fix: express the panel cap in stage px as the paytable does (or divide
  the `dvh` cap by `--S`), so the FEATURES modal keeps a real vertical margin at
  short viewports instead of growing past its own `88%` intent.

## STC-STRETCH-B-02 HIGH The autoplay panel lands on top of the FEATURES button and slices its label to `FE`

- Frames: `reports/screens/stream-test-2026-07-28/394_stretch_autoplay_menu.png`
  (collision), `reports/screens/stream-test-2026-07-28/393_stretch_transition_paytable_closing.png`
  (the unobstructed control, same session, same viewport)
- Claim: the autoplay panel's left edge measures `x=1388` at `y=300` in frame
  `394`. The floating FEATURES pill reaches `x=1480` in frame `393`. The panel
  therefore covers `92px` of the pill and the label renders as `FE` with the
  remaining glyphs hidden behind the panel edge. Two interactive controls occupy
  the same pixels with no offset, no dismissal and no reflow, and the visible
  result is a truncated word against a hard panel edge. This is on screen for as
  long as the autoplay menu is open, which on stream is every time a streamer
  sets a spin count.
- Where fixable: the pill is the single FEATURES entry knob documented at
  `frontend/src/lib/components/FeatureMenu.svelte:252` (`Single FEATURES entry
  (right of the frame, old FeatureButton spot)`, echoed at `:3`); the autoplay
  panel lives in `frontend/src/lib/components/HudOverlay.svelte` (its state is at
  `:37` and `:183-184`). I did not locate the panel's own positioning rule inside
  that file, so the exact CSS line is UNKNOWN. Neither file is locked.
- Proposed fix: hide the FEATURES pill while the autoplay panel is open (the
  panel already registers with `modalGuard`, per `HudOverlay.svelte:165`), or
  anchor the panel so its left edge clears `x=1480` at this viewport.

## STC-STRETCH-B-03 HIGH The base game win-line ticker keeps running inside the reel window underneath the feature entry gate

- Frames: `reports/screens/stream-test-2026-07-28/401_stretch_transition_feature_entry_fade.png`,
  `402_stretch_feature_entry_card.png`, `403_stretch_transition_feature_starting.png`,
  `404_stretch_feature_run_1.png`, `405_stretch_feature_run_2.png`,
  `406_stretch_feature_run_3.png`, `407_stretch_feature_run_4.png`,
  `408_stretch_feature_run_5.png`, `409_stretch_feature_run_6.png`,
  `415_stretch_post_collect_base.png` (all under
  `reports/screens/stream-test-2026-07-28/`)
- Claim: while the `OVERDRIVE FREE SPINS` entry card and its `TAP TO CONTINUE`
  call to action are displayed, the base game's win-line ticker continues to
  render in the same framed reel window, `10px` below the card, and its content
  keeps changing. Measured in `402`: ticker text bbox `x894..1027, y552..562`,
  centred at `x=960.5`; the reel window's bottom neon border is at `y=572`. The
  string cycles across the run: `L2  x5  1 ways  $0.80` in `401` to `404`,
  `SCATTER  x5  5 ways  $10.00` in `405` to `408`, back to
  `L2  x5  1 ways  $0.80` in `409`, and `M3  x3  1 ways  $0.20` in `415`. The
  celebration surface does not own the window it occupies: a modal gate with a
  live, mutating readout ticking away beneath it reads as two screens drawn on
  top of each other rather than one composed moment.
- Where fixable: `frontend/src/App.svelte:1925`, `<WinBreakdown
  suppressed={$isWincap} />`. The ticker markup is
  `frontend/src/lib/components/WinBreakdown.svelte:94` (`{current.ways} ways`)
  and the suppression flag is declared at `:42`. Not locked. **The component's own
  header already names this class of miss** at
  `WinBreakdown.svelte:36-41`: the line above its mount,
  `<WinCelebration winMultiplier={$isWincap ? 0 : $winMultiplier} />`, carries the
  comment about suppressing the standard celebration while the max win overlay is
  active, and the note records that WinBreakdown *sat next to it and was never
  given the same treatment*. The wincap case was subsequently fixed; the feature
  entry gate is the same shape and was not.
- Proposed fix: widen the `suppressed` expression at `App.svelte:1925` to cover
  the feature entry gate as well as `$isWincap`, so one overlay owns the reel
  window at a time.

## STC-STRETCH-B-04 MEDIUM On the max win celebration the hero amount is the only element in the stack that is not on the centre line

- Frames: `reports/screens/stream-test-2026-07-28/413_stretch_maxwin_celebration.png`,
  `reports/screens/stream-test-2026-07-28/412_stretch_transition_maxwin_overlay_fade.png`
- Claim: measured ink centroids in `413`, against a viewport centre of `x=959.5`:
  `MAX WIN` `959.5`, `REACHED!` `956.6`, the `COLLECT` button `959.7`, and the
  amount row `915.5`. The stars sit at bbox `x919..999`, centre `959.0`. The
  amount row's bounding box is nominally centred (`x722..1195`, box centre
  `958.5`), but the row is a `369px` wide numeral `5,000` (bbox `x722..1091`)
  followed by a small `×BET` unit (bbox `x1104..1195`), so almost all of the ink
  sits left of the box centre. Four elements in a tight vertical stack are on the
  axis and the largest and brightest one is `44px` left of it, on the single
  most-watched frame in the game.
- Where fixable: `frontend/src/lib/components/MaxWinCelebration.svelte:150-160`,
  the `.c1-max-multwrap multiplier-wrap` block holding
  `<span class="c1-max-mult fs-num">5,000</span>`, `<span class="c1-max-x">×</span>`
  and `<span class="c1-max-betlabel">`. Not locked.
- Proposed fix: centre `.c1-max-mult` on the axis and set the `×` plus bet label
  as an absolutely positioned or negative-margin suffix, so the hero figure rather
  than the figure plus suffix defines the optical centre.

## STC-STRETCH-B-05 MEDIUM The bottom control band's mass sits well right of the reel column, which is dead centred

- Frames: `reports/screens/stream-test-2026-07-28/411_stretch_post_feature_base.png`,
  `393_stretch_transition_paytable_closing.png`, `410_stretch_transition_feature_exit.png`,
  `415_stretch_post_collect_base.png` (all under
  `reports/screens/stream-test-2026-07-28/`)
- Claim: in `411` the reel frame's outer edges measure `x=611` and `x=1308`, a
  centre of `959.5`, exactly the viewport centre. The band below it does not
  share that axis. The three money pods run from the `BALANCE` pod's cyan left
  bar at `x=748` to the `BET` pod's right edge at `x=1304`, a centre of `1026`,
  which is `66.5px` right of the reel column's centre. The rightmost HUD chrome
  (the autoplay circle) ends at `x=1535`, overhanging the reel column's right
  edge by `227px`, while the leftmost element I could isolate cleanly, the `MAX`
  pill, starts at `x=623`, only `12px` inside the reel column's left edge. The
  right margin also carries the lone floating `FEATURES` pill (right edge
  `x=1480` in `393`) with nothing at that height on the left. Every mass outside
  the reel column leans right, and at `1920` wide the lean is visible against a
  perfectly centred reel frame directly above it.
- Where fixable: `frontend/src/lib/components/HudOverlay.svelte` (control band)
  and `frontend/src/lib/components/FeatureMenu.svelte:252` (the floating pill),
  inside the stage laid out by `frontend/src/App.svelte`. The specific rule that
  sets the band's horizontal distribution is UNKNOWN; I stopped the source pass
  before opening HudOverlay's stylesheet. Nothing here is locked.
- Proposed fix: PARK(the correct answer is an art call: either centre the whole
  control band on `959.5` and accept a shorter reach to the spin control, or
  declare the right lean intentional and mirror it with a left-hand element so
  the band reads as composed rather than as overflow.)

## STC-STRETCH-B-06 MEDIUM The autoplay panel stacks a flush-left block on top of a centred block, and the two blocks' centres are 22px apart

- Frames: `reports/screens/stream-test-2026-07-28/394_stretch_autoplay_menu.png`
- Claim: the panel spans `x=1388` to `x=1631`, so its own axis is `x=1509.5`. The
  four option rows are all flush left at `x=1407`: `Stop on win` `x1407..1536`,
  `Single win limit` `x1407..1559`, `Stop on feature` `x1407..1568`, `Loss limit`
  `x1407..1517`. That block's centre is `1487.5`, `22px` left of the panel axis,
  and its gutters are `19px` on the left against `63px` on the right of the
  longest row. Directly below, the `SPINS` heading (`x1488..1530`) and every
  option (`10` `x1499..1519`, `25` `x1496..1523`, `50` `x1496..1523`, `100`
  `x1492..1527`, the infinity glyph `x1502..1517`) are centred on `1509` to
  `1509.5`, exactly the panel axis. One small panel uses two alignment schemes,
  and the seam between them shows as a `22px` step in the optical centre.
- Where fixable: `frontend/src/lib/components/HudOverlay.svelte`, the autoplay
  panel block (state at `:37`, `:90-94`, `:106`, `:183-184`). The exact CSS lines
  for the two blocks are UNKNOWN; not locked.
- Proposed fix: pick one scheme for the panel. Either centre the option rows too,
  or left-align the `SPINS` block to the same `x=1407` edge and let the panel
  width follow its content.

## STC-STRETCH-B-07 MEDIUM The buy dialogs' three-column stat strip breaks its single-line rhythm because `5,000× base bet` wraps and orphans the word `bet`

- Frames: `reports/screens/stream-test-2026-07-28/398_stretch_dialog_buy_overdrive.png`,
  `397_stretch_transition_dialog_buy_overdrive_opening.png`,
  `400_stretch_dialog_nitro_overdrive.png`,
  `399_stretch_transition_dialog_nitro_overdrive_opening.png` (all under
  `reports/screens/stream-test-2026-07-28/`)
- Claim: the confirm dialog's stat strip is three equal columns, `PRICE`, `RTP`
  and `MAX WIN`. `PRICE` renders `$100.00` (`398`) or `$400.00` (`400`) on one
  line and `RTP` renders `96.35%` on one line, but `MAX WIN` renders
  `5,000× base bet` across two lines with `bet` alone on the second, centred
  under the first. The strip is consequently one and a half lines tall, the two
  single-line values float above its optical centre, and the column separators
  run past the values they separate. This is NOT an instance of TR-115 / TR-086:
  that row is scoped to money display fit failures (clip, ellipsis, overflow) and
  this value is a static multiplier label that wraps, so the shared
  fit-or-abbreviate mechanism JOB 3 is chartered to build would not touch it.
  Recorded because the same string is already known to misbehave elsewhere:
  `frontend/src/lib/components/PaytableModal.svelte:334` carries a comment about
  rendering `5,000x base bet` as a value having clipped.
- Where fixable: `frontend/src/lib/config/fsModes.ts:158`, which returns
  `` `${FS_MAX_WIN_LABEL} base play` `` or `` `${FS_MAX_WIN_LABEL} base bet` ``,
  described at `:147` as used by the two buy confirmation dialogs. Not locked
  (`games/future_spinner/**` is locked; `frontend/src/lib/config/fsModes.ts` is
  not).
- Proposed fix: give the dialog the value `5,000×` with `base bet` as a caption
  under it, or widen the third column, so all three stats sit on one baseline.

## STC-STRETCH-B-08 LOW The max win unit `×BET` is aligned to neither the numeral's baseline nor its centre

- Frames: `reports/screens/stream-test-2026-07-28/413_stretch_maxwin_celebration.png`,
  `reports/screens/stream-test-2026-07-28/412_stretch_transition_maxwin_overlay_fade.png`
- Claim: in `413` the numeral `5,000` has bbox `x722..1091, y421..514` and the
  unit `×BET` has bbox `x1104..1195, y461..496`. Neither glyph group carries a
  descender, so a shared baseline would put both bottoms on the same row. The
  unit's bottom sits `18px` above the numeral's bottom, and the unit's vertical
  centre (`478.5`) sits `11px` below the numeral's vertical centre (`467.5`). It
  is off both of the two alignments a designer could have intended, which is what
  makes it read as unplaced rather than as a deliberate offset.
- Where fixable: `frontend/src/lib/components/MaxWinCelebration.svelte:150-160`,
  the same `.c1-max-multwrap` block as finding 04. Not locked.
- Proposed fix: pick one. Baseline-align `.c1-max-x` and `.c1-max-betlabel` to
  `.c1-max-mult`, or centre them on its optical centre, and state which in the
  component.

## STC-STRETCH-B-09 LOW Paytable sections 08 and 09 render a pixel-identical modal, so the `DISCLAIMER` step produces no visible change

- Frames: `reports/screens/stream-test-2026-07-28/391_stretch_paytable_08_responsible_play.png`,
  `reports/screens/stream-test-2026-07-28/392_stretch_paytable_09_disclaimer.png`
- Claim: comparing the two frames pixel by pixel, only `415` pixels differ by
  more than `8` in any channel, and every one of them lies in the bounding box
  `x249..305, y389..581`, entirely OUTSIDE the modal, whose left edge is `x=305`.
  The difference is background scene animation. The modal itself, including its
  scroll position, is identical. The scroll has bottomed out, so the last two
  named sections share one screenful and stepping from `RESPONSIBLE PLAY` to
  `DISCLAIMER` moves nothing. Not a rendering fault, but the paytable's section
  navigation silently stops responding at the end of the list.
- Where fixable: `frontend/src/lib/components/PaytableModal.svelte` (the scroll
  container that `:547-549` sizes). Exact line UNKNOWN. Not locked.
- Proposed fix: PARK(cosmetic, and arguably correct behaviour for a clamped
  scroll; worth a decision only if the paytable gains section indicators.)

## STC-STRETCH-B-10 LOW The whole game surface drifts 4.5px left and grows 3px wider during the max win collect fade

- Frames: `reports/screens/stream-test-2026-07-28/414_stretch_transition_maxwin_collect_fade.png`,
  `reports/screens/stream-test-2026-07-28/415_stretch_post_collect_base.png`
- Claim: measured at `y=350`, the reel frame's outer edges are `x=605` and
  `x=1305` in `414` (width `700`, centre `955`) against `x=611` and `x=1308` in
  `415` (width `697`, centre `959.5`). A pure scale about the element centre would
  hold the centre; it moves by `4.5px`, so the transform origin is not the element
  centre. Recorded because the sequence lens asks for it, and flagged LOW
  honestly: `4.5px` on a `1920` canvas during a fade is below the threshold at
  which a viewer would see it.
- Where fixable: the stage transform at `frontend/src/App.svelte:2200`
  (`transform: scale(var(--S, 1))`) and whatever transition drives the collect
  fade. Exact rule UNKNOWN. Not locked.
- Proposed fix: PARK(below perceptual threshold; fix only if the same transform
  origin is found to move a larger element elsewhere.)

## Explicit absences, signed

Signed by STC-STRETCH-B for the 26 frames listed above, at viewport `1920x800`.

- **No element is cut off by a viewport edge in any of the 26 frames.** Checked by
  measuring the outer bounds of every modal and overlay that appears: the
  paytable modal (`x305..1614, y33..767`), the FEATURES modal (`x649..1271,
  y9..785`), the two buy confirm dialogs, the autoplay panel (`x1388..1631`), the
  feature entry card, the right hand feature pod stack and the max win overlay.
  The FEATURES modal comes within `9px` of the top edge, which is finding 01, but
  its border and its footer row both render inside the viewport.
- **The paytable modal is correctly centred and correctly padded at this
  viewport.** Left margin `305`, right margin `306`, top `33`, bottom `32`. No
  finding.
- **The max win celebration stack is centred.** `MAX WIN` centroid `959.5`,
  `REACHED!` `956.6`, `COLLECT` `959.7`, stars box centre `959.0`, against a
  viewport centre of `959.5`. The `2.9px` spread on `REACHED!` is glyph asymmetry
  from the exclamation mark, not a layout fault. Only the amount row deviates,
  which is finding 04.
- **The reel column is dead centred in every settled frame.** Outer frame edges
  `x=611` and `x=1308` in `411`, centre `959.5`. Same geometry in `393`, `410`
  and `415`.
- **No large dead region reads as unfinished.** The wide bands either side of the
  reel column at `1920` wide are filled by the scene art (character, car, city)
  in every base frame and by the dimmed scene behind the scrim in every modal
  frame. The empty black reel window in `414` is a fade in progress, not an
  unfilled region.
- **No HUD crowding at this viewport.** The three money pods and the bet, spin
  and autoplay controls keep clear gaps at every value observed, including the
  widest: `$50,000.00` in the balance pod, `$348.34` and `$363.89` in the win pod
  (`410`, `411`), `$5,000.00` in `414` and `415`. Nothing clips, ellipsises or
  collides inside the HUD band. The band's position relative to the reels is
  finding 05; its internal spacing is clean.
- **No layout jump between adjacent settled frames.** `410` to `411`, `402`
  through `409`, and `413` to `415` hold their geometry. The only measured
  inter-frame movement is the `4.5px` drift in transition frame `414`, finding 10.
- **I cannot sign anything about the composition of the feature while it is
  actually spinning, because no frame in my range shows it.** The manifest notes
  for `404` to `409` read `Overdrive free spins in flight, interval frame 1 of 6`
  through `6 of 6`, but all six frames render the `TAP TO CONTINUE` entry gate
  with the reels still holding the pre-feature board. The six-frame interval
  sample of the running feature does not exist in this session at this viewport.
  Stated loudly because a later reader would otherwise assume the in-flight
  feature was swept and cleared here. It was not.
- **Related capture gap, same class:** frame `393`, manifest note `Paytable
  mid-close`, shows the base game fully restored with no trace of the paytable or
  its scrim, so the paytable close transition is also unobserved. I used the frame
  as a clean base-game control instead, which is what findings 02 and 05 cite it
  for.

## KNOWN matches

- KNOWN(Q-26): `reports/screens/stream-test-2026-07-28/396_stretch_features_menu.png`,
  the OVERBOOST card renders `about 1.6x the feature trigger rate`, `Debits 1.25x
  every spin while ON` and `1.25x per spin while ON · $1.25` with the ASCII letter
  while the same card's right hand rail renders `1.25× bet` and the Normal and
  Cruise rows render `1× bet` with the multiplication sign, so both glyphs are
  visible in a single view. Also
  `399_stretch_transition_dialog_nitro_overdrive_opening.png` and
  `400_stretch_dialog_nitro_overdrive.png`, `Buy a rich entry with the Overdrive
  meter pre-revved to 5x.` Fresh evidence that all four enumerated survivors reach
  a stream frame at `1920x800`.
- KNOWN(Q-34): `reports/screens/stream-test-2026-07-28/396_stretch_features_menu.png`
  and `395_stretch_transition_features_menu_opening.png` render the mode as
  `Cruise` in title case on the features menu, the surface the row says disagrees
  with the HUD badge's `CRUISE`.
- KNOWN(Q-16 park): the parked hardcoded English strings that reach my frames are
  `INTERFACE GUIDE` (`390_stretch_paytable_07_interface_guide.png`),
  `RESPONSIBLE PLAY` and `DISCLAIMER`
  (`391_stretch_paytable_08_responsible_play.png`,
  `392_stretch_paytable_09_disclaimer.png`), `Stop on win`, `Single win limit`,
  `Stop on feature`, `Loss limit` and `SPINS` (`394_stretch_autoplay_menu.png`),
  and `PRESS COLLECT OR HIT ENTER TO CONTINUE`
  (`412_stretch_transition_maxwin_overlay_fade.png`,
  `413_stretch_maxwin_celebration.png`). This is an `en` session so none of them
  is a defect here; recorded only as evidence of which parked surfaces actually
  reach the screen, which is what the de and ar squads' listings will be compared
  against.
- **No MID-01 or MID-02 match, and the negative is deliberate.** The big win
  banner triple for this session is frames `376` to `378`, another squad's range,
  and I did not open them. MID-02 states that its `60` frames include *every
  session's big-win triple plus its max-win frames*, so my max win frames `412`
  and `413` were the obvious candidate. They are not a match:
  `frontend/src/lib/components/MaxWinCelebration.svelte:155` renders
  `<span class="c1-max-x">×</span>`, the multiplication sign U+00D7, and the
  comment above it at `:151-154` records that this surface was already corrected
  under Q-12. The max win overlay is a different component from
  `WinBanner.svelte:205` and it is already right.

tree_after: verbatim `git status --porcelain` at the end of this run:

```
 M reports/screens/stream-test-2026-07-28/188_popout-s_features_menu.png
?? reports/qa/stream_test/shards/STC-MOBILEL-B.md
?? reports/qa/stream_test/shards/STC-MOBILEM-B.md
?? reports/qa/stream_test/shards/STC-MOBILES-A.md
?? reports/qa/stream_test/shards/STC-MOBILES-B.md
?? reports/qa/stream_test/shards/STC-STRETCH-A.md
?? reports/qa/stream_test/shards/STC-STRETCH-B.md
?? reports/qa/stream_test/shards/STM-DESKTOP.md
?? reports/qa/stream_test/shards/STM-LAPTOP.md
?? reports/qa/stream_test/shards/STM-MOBILEM.md
?? reports/qa/stream_test/shards/STM-MOBILES.md
?? reports/qa/stream_test/shards/STM-POPOUTS.md
?? reports/qa/stream_test/shards/STM-STRETCH.md
?? reports/qa/stream_test/shards/STT-DESKTOP-A.md
?? reports/qa/stream_test/shards/STT-DESKTOP-B.md
?? reports/qa/stream_test/shards/STT-LAPTOP-B.md
?? reports/qa/stream_test/shards/STT-POPOUTS-A.md
?? reports/qa/stream_test/shards/STT-POPOUTS-B.md
```

**SAYING THIS LOUDLY, AS THE BRIEF REQUIRES.** One line is not a shard and is not
untracked:

```
 M reports/screens/stream-test-2026-07-28/188_popout-s_features_menu.png
```

A COMMITTED EVIDENCE PNG IS MODIFIED IN THE WORKING TREE. It is not mine: my
assigned range is frames 390 to 415 of the `stretch` session, frame `188` belongs
to `popout-s`, and the only file this squad wrote is this shard. I opened the
frames with the Read tool only and ran no project script, per the brief.

This is the exact shape of the failure convention (h.1) was written for
(`CLAUDE.md`, SA-012, 2026-07-26): a script writing straight into a committed
evidence directory, so that a casual re-run silently modifies committed proof.
The recorded precedent there is `frontend/scripts/anticipation_proof.mjs`
overwriting four committed PNGs at 01:11 on 2026-07-26, with the ruling that
*evidence that a casual re-run can overwrite is not evidence*. The same note
names `layout_fit_gate.mjs` and `contrast_gate.mjs` as still writing to committed
paths.

Recommended handling, for the marshal rather than for me, since restoring another
squad's file is outside my read-only remit: check `git diff` on that path, restore
it from HEAD as the 2026-07-26 session did, and establish which process wrote it
during this wave. Until that is known, frame `188` should not be treated as
capture evidence by any squad holding the `popout-s` range.
