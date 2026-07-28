# STM-STRETCH, motion residue (stretch, frames 364 to 415)

scope: every `stretch` frame whose filename contains `transition_`, 18 of them, at
viewport `1920x800`, lang `en`, build `d9bdf22`: 364, 366, 368, 370, 371, 376, 377,
379, 382, 393, 395, 397, 399, 401, 403, 410, 412, 414. Settled frames opened as
endpoints only, not counted against the set: 365, 367, 369, 372, 375, 378, 380, 383,
394, 396, 398, 400, 402, 404, 405, 409, 411, 413, 415.

frames_read: 18

Measurements below were taken with `ffmpeg -vf crop=...,signalstats` against the frame
files, read-only, after the visual observation and to confirm it, never to find it.
Source lines were located after every finding was already written to this shard.

## STM-STRETCH-01 STREAM Mid-spin the reel window is transparent: the street scene and the car show through cleared cells

- Frames: `reports/screens/stream-test-2026-07-28/370_stretch_transition_reels_accelerating.png`
  (manifest note `Reels accelerating, about 250ms after spin press`). Endpoints:
  `369_stretch_base_idle.png` and `372_stretch_dead_spin_1_settled.png`.
- Claim: at about 250 ms after the spin press, reel 1 holds three symbols, reel 2 holds
  two, reel 3 holds one, and reels 4 and 5 still hold the whole pre-spin board. **The six
  cells that have been cleared and not yet refilled are not dark cells, they are holes.**
  The city backdrop and the roofline of the parked car, which the reel window occludes in
  every settled frame, are painted straight through the play area at rows 3 and 4 of reels
  1 to 3.

  Measured to confirm the read, mean luma of the cell rectangle, `370` against the settled
  `369`, same crop in both:

  | Cell, crop `w:h:x:y` | `369` idle | `370` mid-spin |
  |---|---|---|
  | row 4 reel 1, `110:96:672:449` | `36.03` | `60.84` |
  | row 4 reel 2, `110:96:788:449` | `35.93` | `60.14` |
  | row 4 reel 3, `110:96:904:449` | `36.52` | `55.73` |
  | row 3 reel 3, `110:96:904:352` | `36.08` | `57.48` |
  | row 2 reel 3, `110:96:904:257` | `35.72` | `45.01` |
  | row 4 reel 4, `110:96:1020:449`, CONTROL, still filled | `36.98` | `37.02` |

  The control cell is the finding: a cell that still holds its symbol reads within `0.04`
  of the settled frame, while every cleared cell reads `1.25x` to `1.69x` brighter. That
  is scene light arriving through the grid, not a dimmer tile.

  **The geometry says the same thing exactly, and it was derived from the source rather
  than fitted to the frame.** The strip is `STRIP = ROWS + 3` slots
  (`frontend/src/lib/components/GameGrid.svelte:74`), so `7 * 104 = 728` px of tiles
  (`TILE` at `:73`), and the visible window is `CANVAS_H = 412` px (`:67`). At rest the
  strip sits at `REST_Y = -104` (`:75`). The drop starts at
  `startY = REST_Y - DROP_H` (`:501`) with `DROP_H = 520` (`:499`), that is `-624`. The
  bottom-most slot's lower edge is then at `-624 + 6*104 + 100 = 100`, so **only the top
  row of a four-row window has a tile over it and the other three are empty**. Full
  coverage needs `y >= -312`; with `y = startY + (REST_Y - startY) * f * f` (`:508`) that
  arrives at `f = sqrt(312/520) = 0.775`, which is `310 ms` of the `400 ms` `FALL` (`:500`)
  and `201 ms` of turbo's `260 ms`. A frame at about 250 ms is inside that window, which is
  why it caught it, and every spin passes through it.

  This is not a stagger artefact a viewer would forgive. It happens on the way into every
  spin, it is the largest surface on screen, and the thing showing through is the car the
  brand is built around.
- Where fixable: `frontend/src/lib/components/GameGrid.svelte:74` and
  `frontend/src/lib/components/GameGrid.svelte:499` (not locked).
- Proposed fix: widen the strip so it can cover the window from the drop's start height,
  `const STRIP = ROWS + 1 + Math.ceil(DROP_H / TILE)`, which is 10 slots for the current
  `DROP_H`; every loop over the strip is already written `i < STRIP`. Reducing `DROP_H` to
  `208` closes it too but costs the drop its height, so it is the second choice.

## STM-STRETCH-02 STREAM The free spins entry gate is still fully painted in the frame captured as "entry card dismissing", and in every frame of the documented feature run

- Frames: `reports/screens/stream-test-2026-07-28/403_stretch_transition_feature_starting.png`
  (manifest note `Feature starting, entry card dismissing`). Endpoint before:
  `402_stretch_feature_entry_card.png`. Corroborating settled frames after:
  `404_stretch_feature_run_1.png`, `405_stretch_feature_run_2.png`,
  `409_stretch_feature_run_6.png`, all six of which the manifest calls
  `Overdrive free spins in flight, interval frame N of 6`. Next base frame:
  `410_stretch_transition_feature_exit.png`.
- Claim: `403` shows the entry card at the same geometry and the same opacity as the
  settled `402`: heading `OVERDRIVE FREE SPINS`, the gauge, `+16 FREE SPINS` and the
  `TAP TO CONTINUE` button, all at full strength, with no fade, no scale and no dismissal
  of any kind in progress. The identical card is still fully painted in `404`, `405` and
  `409`, so it covers the whole window the manifest documents as the feature running.
  The board behind the card changes exactly once, between `402` and `403`, and then does
  not change again through `409`; the right hand panel reads `OVERDRIVE FREE SPINS 16`,
  `TOTAL WIN $10.80`, `MULTIPLIER 1x` unchanged in all of them. The only thing that moves
  across those eight frames is the win breakdown ticker, which alternates
  `L2  x5  1 ways  $0.80` and `SCATTER  x5  5 ways  $10.00`, the two components of the
  triggering spin.

  **Stated honestly, because the frames cannot separate the two readings** (facts
  discipline 3, convention l.6): either the continue gate does not dismiss when it is
  taken, and a viewer watches the whole feature play behind a card telling them to tap; or
  the capture harness's tap did not land and the game sat correctly at its gate. The
  single board change between `402` and `403` leans towards the first, because something
  did advance behind the card. This one needs a live re-run of the interaction rather than
  another look at the frames.

  **One candidate explanation was chased and RULED OUT**, recorded so nobody chases it
  again: the game mounts a second `FreeSpinsPresentation` at `frontend/src/App.svelte:1726`
  with `active={true}` and `skipContinueGate={true}`, a warm-up instance. It cannot be what
  is on screen. Its wrapper is `opacity: 0; z-index: -1`
  (`frontend/src/App.svelte:2162-2167`) and `visibility: hidden` once painted (`:2173`),
  and it passes `skipContinueGate`, so it would carry no `TAP TO CONTINUE` button. The card
  in the frames is the real instance at `frontend/src/App.svelte:1927`.
- Where fixable: UNKNOWN, and it stays UNKNOWN until the live re-run says which of the two
  readings is true. The gate itself lives in
  `frontend/src/lib/components/FreeSpinsPresentation.svelte` (not locked).
- Proposed fix: PARK(the diagnosis is not decidable from frames; re-run the feature entry
  live and watch the gate, then fix or close).

## STM-STRETCH-03 HIGH The base spin's win lines and win breakdown ticker read through the feature entry card

- Frames: `reports/screens/stream-test-2026-07-28/401_stretch_transition_feature_entry_fade.png`,
  `reports/screens/stream-test-2026-07-28/403_stretch_transition_feature_starting.png`.
  Endpoints: `402_stretch_feature_entry_card.png`, `415_stretch_post_collect_base.png`.
- Claim: the entry card dims the board behind it, and two surfaces belonging to the
  finished base spin are still legible across it:
  1. the cyan win lines of the triggering spin, thin bright diagonals that cross the card
     from about the bottom left of the reel window up through the `OVERDRIVE FREE SPINS`
     heading and past the gauge;
  2. the win breakdown chip, reading `L2  x5  1 ways  $0.80` in `401` and `403`, at full
     brightness across the bottom of the card.

  The mechanism is not a z-order inversion, it is a translucent scrim over surfaces that
  were never suppressed. `.fs-overlay` is `z-index: 80` with
  `background: radial-gradient(circle at center, rgba(8,8,26,0.72), rgba(4,4,14,0.92))`
  (`frontend/src/lib/components/FreeSpinsPresentation.svelte:543-546`), so it is between
  `0.72` and `0.92` opaque by design. The win line layer is `.pixi-overlay` at `z-index: 2`
  (`frontend/src/lib/components/GameGrid.svelte:1590-1596`, drawn at `:886-908`) and the
  ways chip is `z-index: 45` (`frontend/src/lib/components/WinBreakdown.svelte:114-121`);
  both are siblings mounted immediately before the overlay in the same
  `.grid-scale` block (`frontend/src/App.svelte:1918-1927`). Nothing turns them off, so
  they simply show through.

  The same defect is visible on the second entry card at `415`, where the chip reads
  `M3  x3  1 ways  $0.20`, so it is the surface and not one unlucky round. It matters more
  than it looks because the entry card is a HELD surface: it waits on the player, so a
  stream audience sits on it, and the chip is cycling under the card while they do.
- Where fixable: `frontend/src/App.svelte:1925` and
  `frontend/src/lib/components/GameGrid.svelte:874` (neither locked).
- Proposed fix: the suppression mechanism already exists and is already wired for the
  max-win case. `WinBreakdown` takes `export let suppressed = false`
  (`frontend/src/lib/components/WinBreakdown.svelte:42`) and is mounted as
  `<WinBreakdown suppressed={$isWincap} />`; widen that to the feature-active flag that
  `App.svelte` already holds. Clear the pixi win-line layer on feature entry with the
  existing `winHighlightLayer.clear()`.

## STM-STRETCH-04 HIGH The balance readout never moves, across ten rounds including a 5,000x max win

- Frames, mine: `reports/screens/stream-test-2026-07-28/370_stretch_transition_reels_accelerating.png`,
  `376_stretch_transition_bigwin_countup_early.png`, `377_stretch_transition_bigwin_countup_late.png`,
  `401_stretch_transition_feature_entry_fade.png`, `403_stretch_transition_feature_starting.png`,
  `410_stretch_transition_feature_exit.png`, `412_stretch_transition_maxwin_overlay_fade.png`,
  `414_stretch_transition_maxwin_collect_fade.png`. Endpoints that close the sequence:
  `369_stretch_base_idle.png`, `372`, `373`, `374`, `375`, `378`, `411`, `415`.
- Claim: `BALANCE` reads exactly `$50,000.00` in every one of those frames, at bet `$1.00`,
  through three dead spins, a `$3.90` win, a `$16.20` big win, a feature that settles at
  `WIN $363.89` in `411`, and a max win that settles at `WIN $5,000.00` in `415`. It is
  never debited by the stake and never credited by a win. The manifest records
  `"play": 70` and `"endRound": 70` wallet calls for the capture set
  (`reports/screens/stream-test-2026-07-28/MANIFEST.json`), so rounds were really settled.

  Recorded outside my lens on purpose, because it is in my frames and because a stream
  audience reads the balance pod before anything else. **The frames cannot tell a stubbed
  capture wallet from a real display defect**, and the honest disposition is that a
  money-surface squad confirms it against a live wallet rather than that either of us
  guesses.
- Where fixable: UNKNOWN, and note that the authoritative balance store is
  `frontend/src/lib/stores/gameStore.ts`, which is LOCKED, so if the defect is real and
  lives in the store rather than the display, the fix needs an owner sanction.
- Proposed fix: PARK(confirm against a live wallet first; the fix location depends on the
  answer and may be behind the lock).

## STM-STRETCH-05 MEDIUM The max win collect passes through an empty, glowing reel window that neither endpoint contains

- Frames: `reports/screens/stream-test-2026-07-28/414_stretch_transition_maxwin_collect_fade.png`
  (manifest note `Collect pressed, overlay mid-fade-out`). Endpoints:
  `413_stretch_maxwin_celebration.png` before, `415_stretch_post_collect_base.png` after.
- Claim: in `413` the window carries the celebration (`MAX WIN REACHED!`, `5,000`,
  `COLLECT`). In `415` it carries the next entry card (`OVERDRIVE FREE SPINS`, the gauge,
  `+8 FREE SPINS`, `TAP TO CONTINUE`) over a board of faint symbols. In `414`, between
  them, the reel window holds **nothing at all**: no celebration text, no card content, no
  symbol plates, just a soft warm gold bloom centred in the window, which is the
  celebration's own glow left behind after its text has gone. The feature chrome around it
  (red frame, green bulbs, gauge, and the panel reading `OVERDRIVE FREE SPINS 8`,
  `TOTAL WIN $2.80`, `MULTIPLIER 1x`) is fully present and fully lit.

  Consistent with the source: the celebration declares an entry animation only,
  `animation: c1-fadein 0.55s ease both`
  (`frontend/src/lib/components/MaxWinCelebration.svelte:201-203`), and the file declares
  no out transition of any kind, so the overlay leaves in a single frame while whatever
  paints the bloom does not. A glow outliving the element that cast it is the exact residue
  this lens exists to catch, and the blank box under it is a state the player is never
  meant to see.
- Where fixable: `frontend/src/lib/components/MaxWinCelebration.svelte:201-203` for the
  missing exit (not locked). The layer that owns the residual gold bloom is UNKNOWN; it is
  not declared in `MaxWinCelebration.svelte`.
- Proposed fix: give the overlay a symmetrical out transition and put the bloom layer on
  the same clock, so the two leave together and the window is never released to an empty
  state between the two overlays.

## STM-STRETCH-06 MEDIUM Two win figures disagree on screen at the same moment, `WIN` against `TOTAL WIN`

- Frames: `reports/screens/stream-test-2026-07-28/414_stretch_transition_maxwin_collect_fade.png`
  (HUD pod `WIN` `$5,000.00`, feature panel `TOTAL WIN` `$2.80`),
  `reports/screens/stream-test-2026-07-28/401_stretch_transition_feature_entry_fade.png` and
  `403_stretch_transition_feature_starting.png` (HUD pod `WIN` `$0.00`, feature panel
  `TOTAL WIN` `$10.80`, on a trigger that paid `$0.80` plus `$10.00`).
- Claim: two readouts labelled `WIN` and `TOTAL WIN` are on screen together, roughly
  600 px apart, and they disagree by `$4,997.20` in `414` and by `$10.80` in `401`. Each
  is presumably correct for its own scope, the round against the feature, but nothing on
  either surface says which scope it belongs to, and the pod that says plain `WIN` is the
  one showing the figure that is NOT the feature's. The two strings come from different
  components with no shared vocabulary: the pod label is `{$tr('win')}`
  (`frontend/src/lib/components/HudOverlay.svelte:392`, and again at `:689` and `:871`) and
  the panel figure is `totalWinLabel`
  (`frontend/src/lib/components/BonusInstrumentColumn.svelte:52`).

  Same class as `MID-01` (two surfaces showing one quantity and disagreeing) but a
  different pair of surfaces, so it is filed as its own id rather than folded into that
  row. If the marshal reads it as one class with `MID-01`, merging it is the right call.
- Where fixable: `frontend/src/lib/components/HudOverlay.svelte:392` and
  `frontend/src/lib/components/BonusInstrumentColumn.svelte:52` (neither locked).
- Proposed fix: scope the labels so the two cannot be read as the same quantity, for
  example `THIS SPIN` against `FEATURE TOTAL`, or blank the HUD pod while a feature panel
  owns the total. Note it is a sixteen-locale string change, so it is sized like `TR-104`
  rather than like a one-property fix.

## Explicit absences, signed

- **No pop found, and I am explicit that I could not have seen one on most surfaces.**
  Eight of my transition frames are geometrically and photometrically indistinguishable
  from their settled endpoint: `379` against `380`, `382` against `383`, `395` against
  `396`, `397` against `398`, `399` against `400`, `393` against the base state, `401`
  against `402`, `412` against `413`. Measured rather than eyeballed, backdrop crop
  `500:250:1360:80` and title crop `240:40:850:180`: `397` backdrop `26.59` against `398`
  `26.49`, titles `35.02` against `35.93`; `399` `26.59` against `400` `26.50`, titles
  `38.07` against `38.69`; `395` `21.08` against `396` `20.86`. Differences under half a
  per cent. That is consistent with a fast animation already finished at capture AND with
  no animation at all, and one frame cannot separate them, so I am NOT claiming a pop.
  What is needed to settle it is a capture at a shorter delay, not another reading.
- **No lagging scrim on modal entry.** I believed I had one at `366` against `367`, where
  the rules card is legible over a backdrop still bright enough to read `$50,000.00`,
  `$0.00` and `$1.00` in the HUD pods, and the reel frame's dividers show through the card
  body. Measurement refuted it: the card's own heading is at `55.46` mean luma against
  `64.96` settled and its Continue button at `121.74` against `135.89`, about `0.85` of
  final, while the backdrop is at `24.96` against `19.81`, about `1.26` of final. Those
  two move together, which is one uniform crossfade of scrim and card, the conventional
  behaviour. Recorded as a refuted candidate rather than dropped silently, per convention
  (l.2).
- **No ghost of a dismissed modal found anywhere else.** `393` (paytable mid-close) carries
  no paytable pixels, no scrim residue and no blur residue; `368` (rules to base) carries
  no rules card and no scrim; `410` (feature exit) carries no red frame, no green bulbs, no
  feature panel and no gauge. Checked by direct comparison against `369`, `394` and `411`.
- **No text rendered over text.** Checked every transition frame for overlapping type. The
  nearest miss is `379`, where the HUD menu panel covers the left part of the win
  breakdown chip and `ways  $0.20` protrudes past the panel's right edge; the panel is
  correctly above the chip and clips it rather than blending with it, so it is occlusion
  and not a defect.
- **No wrong backdrop blur layer.** The paytable at `382`, the features menu at `395` and
  both buy dialogs at `397` and `399` blur the scene behind and nothing else; no blur is
  applied over any dialog's own content or over the HUD in front of it.
- **No element caught mid-teleport.** No surface in the 18 frames appears at a position
  that is not on the straight path between its endpoint positions.
- **A coverage gap the marshal should know about, not a finding.** The stretch session has
  no frame that actually shows reels in motion at speed. `371`, the frame named
  `transition_reels_full_speed`, holds all twenty cells at exactly the symbols and exactly
  the row positions of the settled `372`, with no blur, no offset and no partial cell. So
  reel blur, streak quality and stop-bounce are UNAUDITED for this session; nothing here
  says they are good or bad. Note that `370` does show sub-cell vertical offsets (reel 2's
  two symbols sit about 20 px above their row centres, reel 3's about 13 px below), which
  is evidence the reels genuinely translate, so I make no claim that the spin is a
  cell-swap.

## KNOWN matches

- KNOWN(MID-01): `reports/screens/stream-test-2026-07-28/376_stretch_transition_bigwin_countup_early.png`,
  banner `$10.69` against HUD `WIN` pod `$15.95` at the same instant, on a win that settles
  at `$16.20` in `378_stretch_bigwin_settled.png`. Fresh evidence at `1920x800`; the ledger
  predicted the stretch sibling and the stretch sibling is here. The pod is at `98.5` per
  cent of final while the banner is at `66.0` per cent.
- KNOWN(MID-02): `376_stretch_transition_bigwin_countup_early.png` and
  `377_stretch_transition_bigwin_countup_late.png` both render the unit as `16x BET` with a
  letter x, on the widest viewport in the set.
- KNOWN(TR-104): the same two frames render `BIG WIN` and `x BET`; English session, so the
  locale defect is not observable here, recorded only to confirm the surface is the one the
  row names.

tree_after:

```
?? reports/qa/stream_test/shards/STC-MOBILEL-B.md
?? reports/qa/stream_test/shards/STC-MOBILEM-A.md
?? reports/qa/stream_test/shards/STC-MOBILEM-B.md
?? reports/qa/stream_test/shards/STC-MOBILES-A.md
?? reports/qa/stream_test/shards/STC-MOBILES-B.md
?? reports/qa/stream_test/shards/STC-STRETCH-A.md
?? reports/qa/stream_test/shards/STC-STRETCH-B.md
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
?? reports/qa/stream_test/shards/STT-POPOUTL-B.md
?? reports/qa/stream_test/shards/STT-POPOUTS-A.md
?? reports/qa/stream_test/shards/STT-POPOUTS-B.md
```

All 26 entries are untracked (`??`) shard files, other squads' and mine.
`STM-STRETCH.md` is mine. **Nothing is MODIFIED and nothing is DELETED.** No file
outside my shard path was written. Three of those shards (`STL-AR-B`, `STM-MOBILEL`,
`STT-MOBILEL-A`) landed between my first status check and this one, which is other
squads finishing, not tree movement.
