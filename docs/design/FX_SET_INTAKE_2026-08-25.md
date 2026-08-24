# FX SET INTAKE, 2026-08-25 — what landed, what is homeless, and why

**R103 WORKSTREAM 3.** Twelve FX and support assets were generated into the incoming art
review area. One was intaken. Eleven were not, and the reasons are worth more than the count.

**Where they are.** A gitignored art-review folder outside the repository. Nothing in this
document cites them as repository paths, per convention (m); the measurements are transcribed.

---

## 1. Inventory, measured

All twelve are RGBA with genuine transparency. Corner alpha is zero on eleven of them; the
Overdrive surge reads 28 at a corner, which is correct for a full-frame overlay.

| # | Asset | Canvas | Ink | Intended use | Row | Status |
|---|---|---|---|---|---|---|
| 01 | reel bezel outer frame | 1600x1000 | 33.3% | reel-window bezel overlay | SC-03 | **WRONG-SPEC** |
| 02 | inner cell emphasis frame | 732x612 | 25.5% | selected-cell focus overlay | none | **NO-ROW, HOMELESS** |
| 03 | jet nozzle | 480x480 | 59.4% | jet nozzle at the frame edges | UI-04 | **READY, INTAKEN** |
| 04 | jet flame sheet, 4 frames | 2048x512 | 11.3% | flame loop | FX-03 | **WRONG-SPEC** |
| 05 | holo dash flicker sheet, 4 frames | 2048x512 | 28.2% | M3 dash scan loop | FX-01 | **WRONG-SPEC** |
| 06 | win spark burst | 960x960 | 22.0% | small and medium win impact | none | **NO-ROW, HOMELESS** |
| 07 | premium energy burst | 1200x1200 | 49.0% | premium win impact | none | **NO-ROW, HOMELESS** |
| 08 | soft residual particles | 1200x1200 | 1.4% | ambient ember field | none | **NO-ROW, HOMELESS** |
| 09 | overdrive surge accent | 1920x1080 | 38.4% | feature transition | none | **NO-ROW, HOMELESS** |
| 10 | scatter collect pulse | 960x960 | 27.9% | scatter feedback | none | **NO-ROW, HOMELESS** |
| 11 | robot ground shadow | 680x240 | 17.7% | hero robot contact shadow | none | **NO-ROW, HOMELESS** |
| 12 | car ground shadow | 2840x300 | 4.3% | hero car contact shadow | none | **NO-ROW, HOMELESS** |

**1 ready, 3 wrong-spec, 8 homeless.**

## 2. The one that landed

**UI-04, the jet nozzle.** It met every condition and each was measured rather than assumed:

- 480x480 into a 160x160 target is an exact **3.00x** downscale at **0.00% aspect drift**,
  well inside the ingest gate's 1% tolerance on the source.
- The row is a live REPLACE row with a real shipped path, and the asset is genuinely rendered:
  `FlameJets.svelte:134` draws it as eight nozzles during scatter escalation.
- Subject bounding box moved **-7.6% wide, -9.5% tall**, inside the precedent band this project
  set at R096, where -8.9% / -7.9% was accepted, and far from R094's refused -40.3% / -20.7%.
- **Nothing is anchored to its silhouette.** The nozzle sits at `left:-80px; top:-80px`, centred
  on the jet origin, and the flame sprite anchors to that same origin with `transform-origin:0 0`.
  So a smaller nozzle cannot drag the flame out of place, which was the R094 failure mode.
- The engine supplies the glow through a `--nozzle-glow` custom property per colourway, so the
  art correctly carries no baked glow.

**One honest observation recorded rather than buried: opaque mass fell 20.2 points, 79.6% to
59.4%, and mean luminance fell 12.2.** The new nozzle is a lighter, less solid shape. Nothing
measures it and nothing breaks; whether it reads strongly enough at the frame edge is a look
judgement for the owner.

## 3. Why the three wrong-spec assets were refused

**The two sheets fail on frame count, which no resize can fix.**

| Row | Manifest demands | Delivered | Verdict |
|---|---|---|---|
| FX-03 jet flame | **5** frames of 240x120, total 1200x120 | **4** frames of 512x512, total 2048x512 | frame count AND frame aspect both wrong; sheet aspect drift 60% |
| FX-01 M3 overlay | **6** frames of 200x200, total 1200x200 | **4** frames of 512x512 | frame aspect is right, **frame count is wrong**; sheet aspect drift 33% |

The arc-2 handover states the sheet layout is "not negotiable" and the engine walks the strip by
frame index. **A four-frame sheet in a six-frame slot does not look slightly wrong, it desyncs.**

**01, the reel bezel**, is 1600x1000, aspect 1.600. Its row SC-03 currently carries an
unparseable target of "800x640 source", and neither candidate reading rescues it: against
800x640 the drift is 28%, against the 640x468 the handover recommends it is 17%. Both are more
than an order of magnitude outside the 1% gate. **So the SC-03 target ambiguity does not block
this asset; the asset is wrong for either answer.**

**A note that matters for the M3 question.** Asset 05 is described by its own batch record as a
flicker loop "for the M3 dash family". The batch has therefore already adopted the CORRECTED M3
identity, the holographic dash readout, while the arc-2 manifest's FX-01 role still reads
"6-frame flipbook of the M3 booster flame". That is independent corroboration of the R086
correction, not authority for it.

## 4. Why eight are homeless, and what each would need

**Homeless does not mean bad. It means the game has nowhere to draw it.** These were checked
against the runtime rather than guessed at.

- **06, 07, 10 (win burst, premium burst, scatter pulse).** A particle runtime EXISTS and is
  live: `ui/particles/` sprites are referenced from GameGrid, HeroSplash, FreeSpinsPresentation,
  WinBanner and MaxWinCelebration. But it draws SMALL SPRITES at 32 to 128 px, not single large
  overlay images at 960 to 1200 px. **Needs:** a burst-overlay component that positions and
  fades one large image over the grid on a win tier.
- **08, soft residual particles.** Same shape of problem, plus it is an ambient field at 1.4%
  ink, which is an idle overlay rather than an event. **Needs:** an ambient layer with a
  reduced-motion path.
- **09, overdrive surge.** 1920x1080 full-frame transition art. `FreeSpinsPresentation` exists
  but has no surge slot. **Needs:** a transition layer in the feature entry sequence.
- **02, inner cell emphasis.** There is a per-cell overlay container, `.cell-mod-overlay`, but
  it positions CellModifier multiplier badges from the `cellMultipliers` store. `.col-focus` is
  a COLUMN class applied to `strip.parentElement`, not a cell. **There is no selected-cell
  concept in this game.** Needs a game reason first, then a component.
- **11 and 12, the ground shadows.** These are dimensionally deliberate: 680 wide matches
  `scene_character.png`, 2840 wide matches `scene_car.png`. But `SceneGroup.svelte` currently
  separates the hero art from the backdrop with a **CSS `drop-shadow()` filter**, not a shadow
  layer. **Needs:** two `<img>` layers under the hero images, plus a decision about whether the
  CSS drop-shadow is then removed or kept. This is the smallest component job of the eight and
  the one with the clearest visual payoff.

**The four particle REPLACE rows remain unfilled.** FX-05 coin 40x40, FX-06 shock ring 128x128,
FX-07 smoke puff 56x56, FX-08 spark 32x32. **This FX set contains no asset smaller than 480x480**,
so it does not address the coverage gap R097 identified. That gap is still open and still needs
sprites authored at the four target sizes.

## 5. The next implementation brief

In value order, cheapest first:

1. **Hero ground shadows.** Two `<img>` layers in `SceneGroup.svelte` under the existing hero
   images, sized from the assets' own widths, with the CSS drop-shadow reduced to compensate.
   Two assets already exist and already match the hero widths. Smallest job, clearest gain.
2. **Win burst overlay.** One component, one image, one tier mapping, a reduced-motion path.
   Unlocks 06, 07 and 10 together, and the win surfaces are where R097 found 9.65 MB of art
   already waiting for a render site.
3. **Commission the four particle sprites** at 40, 128, 56 and 32 px. Not a component job; an
   art job that closes the P4 coverage gap properly.
4. **Re-render the two sheets to the manifest layout**, 5 frames of 240x120 and 6 frames of
   200x200, at which point both drop straight into existing live slots.

**Everything above is additive.** None of it touches a control, a locked coordinate, an
accessible name or a localised string.
