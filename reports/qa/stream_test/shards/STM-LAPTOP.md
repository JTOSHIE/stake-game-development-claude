# STM-LAPTOP, motion residue (laptop, 1024x576, en, frames 053 to 104)

scope: every frame of the `laptop` session whose filename contains `transition_`, 18 frames:
053, 055, 057, 059, 060, 065, 066, 068, 071, 082, 084, 086, 088, 090, 092, 099, 101, 103.
Settled endpoints opened for comparison and NOT counted against the set: 054, 056, 058,
064, 067, 069, 072, 081, 085, 087, 089, 091, 093, 098, 100, 102, 104.

frames_read: 18 assigned, plus 17 settled endpoints.

Measurement note: no PIL, no numpy and no ImageMagick are present on this machine, so every
figure below was produced by a pure-python PNG decoder (zlib plus the five filter types)
reading the committed PNGs directly. Nothing was written anywhere except this shard.
Luminance is ITU-R 601, `(299R + 587G + 114B) / 1000`.

Two claims from my first pass were measured, found wrong, and retracted rather than
softened. They are in the signed absences at rows 2 and 11.

---

## STM-LAPTOP-01 STREAM The reel cell plates fade with reel velocity, so the street scene shows through the middle of the board while the reels accelerate

- Frames: `reports/screens/stream-test-2026-07-28/059_laptop_transition_reels_accelerating.png`.
  Endpoints, which do NOT contain this state: `058_laptop_base_idle.png` and
  `060_laptop_transition_reels_full_speed.png`.

- Claim: on the acceleration frame a large part of the reel window is transparent and the
  scene behind it, the car body and the wet street, is painted where the cells should be.
  It is not a darker board, it is an absent one.

  Scanline at `y=330`, row 3 of the grid, sampled every 20px from `x=320` to `x=540`,
  entirely inside the reel window:

  | | 058 idle | 059 accelerating | 060 full speed |
  |---|---|---|---|
  | all 12 samples | `(11, 15, 28)` | 12 different values | `(11, 15, 28)` |
  | range | flat | `(17, 85, 92)` to `(53, 48, 71)` | flat |

  Both endpoints return the identical flat cell colour `(11, 15, 28)` at all twelve points.
  The transition frame returns twelve different structured values, up to six times the
  luminance, which is scene content and not a cell. Over the lower half of the window,
  `x=315..720, y=255..388`, mean luminance is `24.25` at 058, `30.47` at 060 and `38.82`
  at 059: the transition is brighter than BOTH endpoints, which is the signature of a
  missing opaque layer rather than a dimmer one.

  Reels 4 and 5, still at rest, keep their cell plates; reels 1, 2 and 3, moving, have lost
  theirs. The hole is bounded exactly by the reels that have started.

  **The source says the same thing.** `frontend/src/lib/components/GameGrid.svelte:351`
  writes the per-reel velocity alpha, ``` strip.style.setProperty('--ta', (1 - 0.34 * m).toFixed(3)) ```
  where `m = Math.min(1, r.velocity / VMAX)` (`:349`). That variable is consumed at
  `frontend/src/lib/components/GameGrid.svelte:1273`, `opacity: var(--ta, 1)`, on
  `.tile-inner`, and `.tile-plate` (`:1276`) is a CHILD of `.tile-inner`. The plate's own
  fill is `background: rgba(28, 29, 46, 0.88)` (`:1259`). So at full velocity the cell
  backing composites at `0.88 * 0.66 = 0.58`, and there is no opaque plate behind the strip
  to catch it. The comment at `:1264` states the intent, *"Inner wrapper carries the
  velocity stretch / alpha so the strip geometry stays untouched"*: the alpha was meant for
  the symbol art and was attached to the wrapper that also carries the backing.

  This is on screen on EVERY spin, which is the most repeated moment in the game.

- Where fixable: `frontend/src/lib/components/GameGrid.svelte:1273` (the declaration), with
  `:351` as the writer and `:1276` as the layer that should be exempt. Not locked.

- Proposed fix: keep the cell plate opaque under motion, either by moving
  `opacity: var(--ta, 1)` off `.tile-inner` onto the symbol image layer only, or by adding
  `opacity: 1` to `.tile-plate` so the backing does not inherit the velocity alpha.

---

## STM-LAPTOP-02 HIGH The splash hands over to the rules card with no overlap, so the whole game screen flashes up brighter than either endpoint before the scrim arrives

- Frames: `reports/screens/stream-test-2026-07-28/055_laptop_transition_splash_to_rules.png`.
  Endpoints: `054_laptop_splash.png` (before) and `056_laptop_intro_rules.png` (after).

- Claim: mean luminance over three probes:

  | Probe | 054 splash | 055 transition | 056 settled rules |
  |---|---|---|---|
  | left scene `x40..300, y60..430` | `8.17` | `15.34` | `6.45` |
  | HUD bar `x250..800, y460..515` | `8.86` | `27.94` | `13.85` |
  | FEATURES button `x780..885, y190..228` | covered by splash | `13.66` | `6.21` |

  The transition frame is **1.88x** the splash and **2.38x** the settled rules on the scene,
  and **3.15x** the splash and **2.02x** the settled rules on the HUD bar. There is no
  reading of the endpoints on which this is an interpolation between them.

  What that buys a viewer, legible on 055 and on neither endpoint: `BALANCE` `$50,000.00`,
  `WIN` `$0.00`, `BET` `$1.00`, and the `FEATURES` button. The game boots to a black splash,
  flashes its entire interface up, then dims it away again.

  **Mechanism, from source.** `frontend/src/App.svelte:268-271`:

  ```
  function handleHeroSplashDismiss(): void {
    showHeroSplash = false
    if (!introSeen()) showIntroSplash = true
  ```

  `showHeroSplash = false` unmounts the hero splash in the same tick that mounts the rules
  card, and `frontend/src/lib/components/HeroSplash.svelte:40-43` dispatches `dismiss`
  immediately with no out transition. The incoming backdrop is
  `background: rgba(0, 0, 0, 0.86)` (`frontend/src/lib/components/IntroSplash.svelte:46`)
  animated by `animation: intro-fade-in 0.35s ease both` (`:49`), whose keyframes are
  `from { opacity: 0 }` (`:147`). So the composited dim over the game goes from 1.0 to 0
  instantly and then ramps back over 350ms. The bright window is that ramp.

- Where fixable: `frontend/src/App.svelte:268-271` and
  `frontend/src/lib/components/IntroSplash.svelte:49,147`. Neither locked.

- Proposed fix: overlap the two surfaces rather than butting them, either by holding
  `showHeroSplash` true until the intro backdrop has faded in (a Svelte `out:` transition on
  HeroSplash, or an `on:introend` handoff), or by starting `intro-fade-in` from the splash's
  own opacity instead of `0`.

---

## STM-LAPTOP-03 HIGH The win line highlight never moves while its caption cycles, so the drawn lines and the caption describe different wins

- Frames: `reports/screens/stream-test-2026-07-28/099_laptop_transition_feature_exit.png`
  and its settled endpoint `100_laptop_post_feature_base.png`.

- Claim: the two frames draw the same board and the same highlight polylines while the
  caption strip beneath the reels names two different combinations, of different sizes,
  for different money.

  | | 099 | 100 |
  |---|---|---|
  | caption | `SCATTER  x5  5 ways  $10.00` | `L2  x5  1 ways  $0.20` |
  | HUD `WIN` pod | `$353.01` | `$363.89` |
  | cyan highlight pixels in the reel interior `x312..722, y118..390` | 6682 | 6711 |
  | pixels common to both | 6675 | 6675 |
  | Jaccard overlap of the two highlight sets | **0.9936** | |
  | share of the whole reel interior differing by more than 10 | **0.678%** | |

  A highlight that is 99.36% identical between a caption saying `5 ways` and a caption
  saying `1 ways` cannot be describing both, so on every cycle step the lines are wrong for
  the caption under them and the breakdown never shows the player which symbols paid.

  **Mechanism, from source.** `frontend/src/lib/components/WinBreakdown.svelte:68-70` runs
  `cycleIndex = (cycleIndex + 1) % groups.length` on a 1400ms `setInterval`, and `:80`
  derives `current = groups[cycleIndex]`. Nothing in the component publishes `cycleIndex`.
  The grid computes its highlight from the WHOLE array instead:
  `frontend/src/lib/components/GameGrid.svelte:713` and `:882` both call
  `_winningCells(wins, board)` with `wins` read from `activeWins` in full (`:33` import,
  `:636` subscription, `:875` `get(activeWins)`). One surface is per-group and the other is
  all-groups, and they were never connected.

- Where fixable: `frontend/src/lib/components/WinBreakdown.svelte:44,68-70,80` (the cycle
  index, which needs to be published) and `frontend/src/lib/components/GameGrid.svelte:713,882`
  (the consumer, which needs to filter by it). Neither locked.

- Proposed fix: PARK(this is a shared-state change across two components, not a one-liner).
  The shape is a small store holding the cycled group index, written by WinBreakdown and
  read by GameGrid so `_winningCells` filters to the group currently named. The alternative,
  freezing the caption to a single all-wins summary, is an art call about whether the game
  wants a per-group cycle at all, so it goes to the owner.

---

## STM-LAPTOP-04 MEDIUM The HUD menu is the only overlay in the game that opens with neither a scrim nor an animation

- Frames: `reports/screens/stream-test-2026-07-28/068_laptop_transition_menu_opening.png`,
  manifest note `HUD menu mid-open`. Endpoint: `069_laptop_hud_menu.png`.

- Claim: two defects that share one cause, the menu being drawn with no backdrop layer and
  no entry transition.

  **It does not animate.** Over the panel rectangle `x311..513, y333..458` the maximum
  per-channel difference between the mid-open frame and the settled frame is **9**, and
  **0.02%** of pixels differ by more than 8. The `FEATURES` button region is identical to
  within **1**. The mid-open capture and the settled capture are the same picture.

  **It does not dim what is behind it.** Mean luminance of the `FEATURES` button region
  `x780..885, y190..228`, which sits well outside the panel:

  | Surface | Frame | FEATURES button |
  |---|---|---|
  | base game, no overlay | 058 | `34.61` |
  | HUD menu open | 069 | `33.70` |
  | rules card | 056 | `6.21` |
  | FEATURES menu | 085 | `10.02` |
  | buy confirm dialog | 087 | `13.18` |

  Every other modal darkens the game behind it by a factor of three to six. The HUD menu
  darkens it by 2.6%, which is scene animation, not a scrim. A consequence a viewer sees:
  the reel win caption `ways  $0.20` stays fully legible about 45px to the right of the
  panel's `Mute` row, at roughly `(505..560, 402)`, because nothing is dimming it.

  **Mechanism, from source.** `frontend/src/lib/components/HudOverlay.svelte:426-427` renders
  `<div class="hud-menu p-hud-menu" role="menu">` inside a bare `{#if showMenu}` with no
  Svelte `transition:` directive, and `.hud-menu` at `:1598-1608` carries no `animation` and
  no `transition` property. Separately, `HudOverlay.svelte` is the ONLY modal-bearing
  component in `frontend/src/` with no `fs-scrim` element: the eleven that have one are
  `LoadingScreen:72`, `ResumeOffer:51`, `ThemeSelector:22`, `HeroSplash:54`,
  `MaxWinCelebration:106`, `SessionPanel:97` and `:122`, `BetSelector:134`, `FeatureMenu:299`,
  `IntroSplash:23`, `PaytableModal:160` and `BuyBonus:90`.

- Where fixable: `frontend/src/lib/components/HudOverlay.svelte:426-427` and `:1598-1608`.
  Not locked.

- Proposed fix: add a scrim element carrying the shared `fs-scrim` class behind the menu, as
  the other eleven surfaces do, and give the panel a short scale-and-fade `transition:`
  matching the FEATURES menu.

---

## STM-LAPTOP-05 MEDIUM The paytable pops in and pops out, with no transition at either end

- Frames: `reports/screens/stream-test-2026-07-28/071_laptop_transition_paytable_opening.png`
  (manifest note `Paytable mid-open`) and
  `reports/screens/stream-test-2026-07-28/082_laptop_transition_paytable_closing.png`
  (manifest note `Paytable mid-close`). Endpoints: `072_laptop_paytable_top.png` and
  `081_laptop_paytable_09_disclaimer.png`.

- Claim: the mid-open frame IS the settled paytable. Over the paytable body
  `x40..990, y20..555` the maximum per-channel difference against 072 is **24** and
  **0.00%** of pixels differ by more than 8; whole-frame, `0.05%` differ by more than 8 with
  a maximum of `25`. The mid-close frame contains no paytable and no residual dim: the left
  scene on 082 reads `49.19` against `49.22` on the untouched base idle 058, a gap of
  **0.06%**. A surface covering all 1024x576 arrives and leaves between frames.

  **Mechanism, from source.** `frontend/src/lib/components/PaytableModal.svelte` contains
  **zero** occurrences of `animation:` or `transition:` in the entire file, and the modal is
  a bare `{#if}` around `:160`. There is nothing to see because nothing was written.

  Recorded beside STM-LAPTOP-04 because together they describe the game's motion language:
  the FEATURES menu (084 against 085, 6.20% of pixels differing, with a visible sub-pixel
  settle) and both buy dialogs (086/087 at 10.34%, 088/089 at 8.25%) do animate. Two of the
  five overlays in this session have no transition while three do.

- Where fixable: `frontend/src/lib/components/PaytableModal.svelte:160`. Not locked.

- Proposed fix: give `.fs-pt` the same fade-and-scale entry the other modals use, for
  example the `intro-fade-in` / `intro-card-in` pair at
  `frontend/src/lib/components/IntroSplash.svelte:147-148`, honouring the existing
  `prefers-reduced-motion` guard.

---

## STM-LAPTOP-06 MEDIUM The buy confirm dialog's price strip is drawn over the symbol row and truncates all five icons

- Frames: `reports/screens/stream-test-2026-07-28/086_laptop_transition_dialog_buy_overdrive_opening.png`
  and `reports/screens/stream-test-2026-07-28/088_laptop_transition_dialog_nitro_overdrive_opening.png`.
  Identical on the endpoints `087_laptop_dialog_buy_overdrive.png` and
  `089_laptop_dialog_nitro_overdrive.png`, so it is a layout defect the transition shows
  rather than a transition artefact. Flagged as such so it is not double-counted.

- Claim: the strip carrying `PRICE` `$100.00` / `RTP` `96.35%` / `MAX WIN` `5,000x base bet`
  is painted over the row of five symbol icons above it. A vertical profile through the
  second icon at `x=468` on 087 finds symbol content still present from `y=405` to `y=409`,
  then the strip's magenta top border at `y=410` reading `(220, 42, 190)`, then flat panel
  fill `(25, 33, 53)` from `y=411` down. Each of the five icons is cut off at its lower edge.

  Two further things are true of the same strip on all four frames, recorded here rather
  than opened as separate ids: `MAX WIN` wraps to `5,000x base` / `bet` across two lines
  inside a single-line pod, and the dialog carries no visible confirm or cancel control at
  1024x576, its bottom border sitting at about `y=490` with nothing between the strip and it.

- Where fixable: `frontend/src/lib/components/BuyBonus.svelte:122-135` (the
  `.buy-stats-row` markup) with its CSS at `:224`. Not locked. The exact declaration that
  produces the overlap was not isolated; the surrounding source read stopped at the frugality
  limit.

- Proposed fix: PARK(three symptoms on one dialog at this viewport, and the missing confirm
  control makes it a fit problem for the whole panel rather than one rule). It reads as the
  same class as TR-115 / TR-086, the shared fit-or-abbreviate work, and wants sizing at
  1024x576 rather than a nudge.

---

## STM-LAPTOP-07 MEDIUM The win caption pluralises a count of one, `1 ways`

- Frames: `reports/screens/stream-test-2026-07-28/066_laptop_transition_bigwin_countup_late.png`
  (`L3  x4  1 ways  $0.20`),
  `reports/screens/stream-test-2026-07-28/090_laptop_transition_feature_entry_fade.png` and
  `reports/screens/stream-test-2026-07-28/092_laptop_transition_feature_starting.png`
  (both `L2  x5  1 ways  $0.80`). Also on the endpoints 091, 100 and 104.

- Claim: the caption reads `1 ways`, which should read `1 way`. The word is `ways` in every
  case, confirmed glyph by glyph against the correct sibling: on 066 the digit `1` occupies
  `x502..503` and the word `x507..526` in three ink runs; on 067 the digit `8` occupies
  `x500..504` and the word `x508..527` in three ink runs of identical shape.

  Recorded explicitly so a later sweep does not chase it: this is NOT a missing-space
  defect. The digit-to-word gap is `3px` on both frames. The rendering at 6px cap height
  merely reads as `1ways` at 1:1.

  Source: `frontend/src/lib/components/WinBreakdown.svelte:94`,
  ``` <span class="wb-ways">{current.ways} ways</span> ```, a hardcoded plural with no
  count branch. Note for the marshal: the word `ways` is also hardcoded English here, in a
  component whose own header comment (`:10-14`) records that its WILD and SCATTER labels
  were moved to the `tr` layer under TR-091 while this one was left behind. That places it
  in the Q-16 park's class as well as this one.

- Where fixable: `frontend/src/lib/components/WinBreakdown.svelte:94`. Not locked.

- Proposed fix: branch the noun on the count and route it through `tr` like its siblings on
  the same line, for example `{current.ways} {$tr(current.ways === 1 ? 'wayOne' : 'wayMany')}`,
  adding the two keys to the sixteen locales.

---

## STM-LAPTOP-08 MEDIUM Two win totals disagree by a factor of 1,786 on screen as the max win overlay fades out

- Frames: `reports/screens/stream-test-2026-07-28/103_laptop_transition_maxwin_collect_fade.png`.
  Endpoints: `102_laptop_maxwin_celebration.png` and `104_laptop_post_collect_base.png`.

- Claim: while the max win overlay fades out after `COLLECT`, the free spins side panel has
  already been restored reading `TOTAL WIN` `$2.80`, about 120px to the right of the HUD
  `WIN` pod reading `$5,000.00`. Both are visible at once, both are labelled as a win total,
  and they differ by a factor of **1,786**. `OVERDRIVE FREE SPINS` reads `8` and
  `MULTIPLIER` reads `1x` beside them.

  The same pair is on the settled endpoint 104, so this is a state defect the transition
  exposes rather than a transition artefact, and the squad covering 104 should see it too.

  Recorded and NOT claimed as a defect on the same frame, because it is what a fade-out
  should look like: the warm bloom over the board centre, mean RGB `(77.4, 68.5, 14.2)` at
  `x430..590, y180..300` against `(65.0, 63.1, 58.7)` on 104, is the dismissed overlay's own
  glow at low opacity, correctly on its way out.

- Where fixable: `frontend/src/lib/components/BonusInstrumentColumn.svelte:52,72-73,99-100`
  is the surface that renders `TOTAL WIN`. Which of the two figures is wrong was not
  determined; the money path was deliberately not followed further, per the rule that
  maths-adjacent findings escalate rather than being ruled on by the finder.

- Proposed fix: PARK(escalate). This touches player money display, so per CLAUDE.md
  convention (l.8) it goes to the owner and Fable as a question with the frame attached
  rather than being decided here.

---

## STM-LAPTOP-09 LOW The splash has no entrance left to see by the time the entrance frame is taken

- Frames: `reports/screens/stream-test-2026-07-28/053_laptop_transition_splash_entrance.png`,
  manifest note `Splash mid-entrance, about 600ms after load`. Endpoint:
  `054_laptop_splash.png`.

- Claim: over the logo box `x380..650, y150..420` the two frames are **byte-identical**,
  maximum per-channel difference `0`. Only the `TAP TO CONTINUE` line differs (9.70% of its
  pixels, maximum `53`, its own pulse) and the drifting background streaks. At 600ms the
  hero mark is fully settled.

  Consistent with source: `frontend/src/lib/components/HeroSplash.svelte` carries only
  looping decoration on the emblem, `animation: emblem-glow-pulse 3.2s ease-in-out infinite`
  (`:114`) and `press-pulse 1.8s ease-in-out 1.4s infinite` (`:141`), with no one-shot
  entrance on the mark itself.

  Filed LOW and stated carefully, because timing is approximate by nature and one frame
  cannot distinguish a short entrance from an absent one. What is certain is that the frame
  the manifest reserved for showing the entrance shows no entrance.

- Where fixable: `frontend/src/lib/components/HeroSplash.svelte:114`. Not locked.

- Proposed fix: PARK(art call). Whether the brand mark should animate in at all is a design
  decision, not a defect to be patched; the frame is recorded so the owner can rule.

---

## Explicit absences, signed

Each of these was actively checked on the frames named and found NOT to be present, or was
claimed and then measured and withdrawn. I am signing the absence.

1. **No element caught mid-teleport.** Every transition frame was compared against both
   endpoints for a surface at a position neither endpoint holds. The only positional
   difference in the whole set is a sub-pixel vertical settle on the FEATURES menu between
   084 and 085, which is a legitimate ease and not a teleport.

2. **RETRACTED: no magenta or coloured full-screen wash on the buy dialogs.** This was my
   first reading of 086 and 088 and it was wrong. Mean RGB over the scene left of the
   dialog, `x30..300, y60..450`: 086 `(15.7, 20.2, 27.2)`, 087 `(15.7, 19.3, 26.3)`, 088
   `(15.3, 19.9, 26.8)`, 089 `(15.8, 19.8, 26.8)`; luminance `19.17`, `18.56`, `18.84`,
   `18.93`. There is no tint difference. What I read as a wash is the dialog's own border
   glow plus the rain layer moving between captures.

3. **No hard un-feathered edge on the max win light sweep.** Suspected on 101 from a bright
   near-vertical run at `x608..610`. A luminance profile at `y=335` from `x=596` to `x=624`
   returns the same step shape on 101 and on 102, so it is glyph antialiasing read at a
   threshold, not a shape edge. Retracted.

4. **No backdrop blur applied to the wrong layer** anywhere in the set. The three modals
   that dim (rules, FEATURES menu, buy dialogs) dim the whole scene uniformly; nothing is
   blurred selectively or at the wrong depth. `IntroSplash.svelte:47` applies
   `backdrop-filter: blur(3px)` to its own backdrop, which is the correct layer.

5. **No ghost of a dismissed surface incorrectly retained.** The one candidate, the warm
   bloom on 103, was measured and is the max win overlay legitimately mid-fade, as stated in
   STM-LAPTOP-08. The paytable close 082 leaves zero residue, `49.19` against base `49.22`.

6. **The max win overlay's backdrop was checked for the STM-LAPTOP-02 defect and does NOT
   clearly have it.** HUD pod region `x350..780, y465..510` mean luminance: 100 `45.18`,
   101 `47.33`, 102 `42.77`. The mid-fade frame is 4.8% brighter than the pre-overlay state,
   directionally the same anomaly but inside the noise of the overlay's own particle field.
   Not claimed.

7. **The multiplier glyph on the max win overlay could NOT be resolved between U+00D7 and
   U+0078 from pixels**, so it is not claimed either way. Zoomed at `x608..690, y318..362`
   on both 101 and 102: a symmetric cross, 12px wide and 16px tall spanning `y331..346`,
   with `BET` at `y345..357` and an 8px gap. That geometry fits either character. LEDGER
   MID-02 records `MaxWinCelebration.svelte` as already carrying `×` under charter row Q-12,
   so the presumption is this surface is correct and only the banner is not. A source read,
   not a pixel read, settles it, and that read was not in my budget.

8. **The feature start and feature run transitions could not be judged, and this is a
   capture problem rather than a finding.** The `TAP TO CONTINUE` entry gate is still fully
   up and unchanged on 092 (`Feature starting, entry card dismissing`) and on every frame
   the manifest calls the feature in flight, through to `098_laptop_feature_run_6.png`. The
   gate was evidently never dismissed during capture. I am NOT reporting a stuck overlay,
   because a harness that did not press the button and a game that ignored the press produce
   the same frame and I cannot tell them apart from frames. What IS visible and is worth the
   next capture pass knowing: the board content behind the gate changes between 091 and 092,
   and the caption beneath it changes from `L2  x5  1 ways  $0.80` to
   `SCATTER  x5  5 ways  $10.00` by 093, so something animates underneath a held modal gate.
   Flagged for re-capture, not filed as a defect.

9. **No z-order error that exists only mid-transition.** The one overlap defect found,
   STM-LAPTOP-06, is present on the settled endpoint as well and is labelled as such.

10. **`060`, `065` and `057` yielded nothing of their own.** 060's reel window is intact and
    opaque, which is what makes 059 a finding. 065's contribution is covered entirely by the
    two KNOWN rows below. 057 is a clean scrim fade-out, scene `46.48` against the settled
    `49.22`, a 5.6% gap in the correct direction.

11. **RETRACTED: no text rendered over text, and the HUD menu panel does NOT let the board
    show through in any way a viewer would notice.** I first claimed both from the
    downscaled image and both are wrong. Measured on 068 against the same coordinates on
    067: behind the panel at `(430, 420)` sits a bright cyan wheel reading `(44, 221, 228)`;
    through the panel it reads `(8, 15, 26)` against a plain panel fill of `(7, 9, 21)`, a
    residual of about **3 to 4 per cent**, which matches the declared
    `background: rgba(6, 6, 18, 0.96)` at `HudOverlay.svelte:1603` and is a faint ghost, not
    a legible symbol. The panel's right edge is at about `x=512` (at `y=430`, `x=508` reads
    `(16, 17, 28)` and `x=516` reads `(139, 147, 149)`, the reel bezel), so the caption at
    `x505..560` is beside the panel, not through it. The accurate finding, that the caption
    stays undimmed because there is no scrim, is folded into STM-LAPTOP-04.

---

## KNOWN matches

- KNOWN(MID-01): `reports/screens/stream-test-2026-07-28/065_laptop_transition_bigwin_countup_early.png`.
  Fresh laptop-session evidence for the ledger's predicted `065`/`067` pair. The banner
  reads `$10.29` while the HUD `WIN` pod reads `$15.96` at the same instant, on a win that
  settles at `$16.20` on both readouts by `066` and `067`. The two disagree by `$5.66` on a
  `$16.20` win. MID-01's derivation predicted `$15.96` for the pod at the banner's `$10.29`;
  this frame reads exactly `$15.96`, one cent above the desktop frame `013` the ledger cites,
  so the laptop capture confirms the derivation to the cent independently.

- KNOWN(MID-02): `reports/screens/stream-test-2026-07-28/065_laptop_transition_bigwin_countup_early.png`
  and `reports/screens/stream-test-2026-07-28/066_laptop_transition_bigwin_countup_late.png`.
  Both render the banner unit as `16x BET`. Two more of the 60 frames MID-02 counts.

- KNOWN(TR-104): `reports/screens/stream-test-2026-07-28/065_laptop_transition_bigwin_countup_early.png`
  and `066_laptop_transition_bigwin_countup_late.png`. The tier label renders `BIG WIN` and
  the unit `x BET` in English. Evidence only: this is the `en` session, so it confirms the
  source strings rather than the localisation gap, which the de and ar squads carry.

- KNOWN(Q-16 park), partial: `frontend/src/lib/components/WinBreakdown.svelte:94` renders the
  hardcoded English word `ways` on every win, visible on frames 066, 090 and 092 of this
  session. It is not in the park's enumerated list of about 35 keys. Raised here because
  Q-16's urgency depends on which parked strings reach stream frames, and this one reaches
  every winning spin. See STM-LAPTOP-07.

tree_after: `git status --porcelain`, run from `/Users/jt/math-sdk` at the end of this run,
verbatim:

```
?? reports/qa/stream_test/shards/STC-MOBILEL-B.md
?? reports/qa/stream_test/shards/STC-MOBILEM-A.md
?? reports/qa/stream_test/shards/STC-MOBILEM-B.md
?? reports/qa/stream_test/shards/STC-MOBILES-A.md
?? reports/qa/stream_test/shards/STC-MOBILES-B.md
?? reports/qa/stream_test/shards/STC-STRETCH-A.md
?? reports/qa/stream_test/shards/STC-STRETCH-B.md
?? reports/qa/stream_test/shards/STL-DE-A.md
?? reports/qa/stream_test/shards/STM-DESKTOP.md
?? reports/qa/stream_test/shards/STM-LAPTOP.md
?? reports/qa/stream_test/shards/STM-MOBILEM.md
?? reports/qa/stream_test/shards/STM-MOBILES.md
?? reports/qa/stream_test/shards/STM-POPOUTL.md
?? reports/qa/stream_test/shards/STM-POPOUTS.md
?? reports/qa/stream_test/shards/STM-STRETCH.md
?? reports/qa/stream_test/shards/STT-DESKTOP-A.md
?? reports/qa/stream_test/shards/STT-DESKTOP-B.md
?? reports/qa/stream_test/shards/STT-LAPTOP-B.md
?? reports/qa/stream_test/shards/STT-POPOUTS-A.md
?? reports/qa/stream_test/shards/STT-POPOUTS-B.md
```

All twenty entries are `??`, untracked. `reports/qa/stream_test/shards/STM-LAPTOP.md` is
mine. The other nineteen are other squads' shards, not mine and not my problem. **Nothing is
MODIFIED and nothing is DELETED.** The repository is otherwise clean.
