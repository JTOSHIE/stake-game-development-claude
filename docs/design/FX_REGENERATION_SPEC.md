# FX REGENERATION SPEC — hand these straight to a generator

**R104 WORKSTREAM 3.4 and 3.5.** Two art floods have now produced FX that cannot ship, both
times for the same reason: **the frame geometry is not a preference, it is compiled into CSS.**
This document states every number exactly so the next batch lands.

**Read this first.** The sheets are stepped by a CSS `steps(N)` animation over a
`background-size`. If the frame count is wrong the animation desyncs; if the frame aspect is
wrong every frame is squashed. Neither is fixable by resizing afterwards.

---

## 1. The three sheet slots, with their CSS contracts

| Row | Shipped path | Sheet | Frames | Frame | CSS that locks it |
|---|---|---|---|---|---|
| **FX-01** | symbols/m3_flame_sheet.png | **1200x200** | **6** | **200x200** | `GameGrid.svelte:1373-1374` `background-size:492px 82px; animation: fx-flame-cycle 0.66s steps(6)` |
| **FX-02** | symbols/l2_fuse_sheet.png | **800x200** | **4** | **200x200** | `GameGrid.svelte:1379-1380` `background-size:328px 82px; animation: fx-arc-cycle 0.34s steps(4)` |
| **FX-03** | ui/jet_flame_sheet.png | **1200x120** | **5** | **240x120** | `FlameJets.svelte:206` `animation: flame-cycle 0.42s steps(5)` |
| **FX-04** | ui/jet_flame_static.png | **240x120** | 1 | 240x120 | the reduced-motion still; **must be frame 3 of FX-03**, exported from the same sheet |

**What the two batches delivered instead:**

| Batch asset | Frames | Frame size | Against | Failure |
|---|---|---|---|---|
| 2026-08-25 FX set, jet flame | 4 | 512x512 | FX-03 wants 5 x 240x120 | count AND aspect |
| 2026-08-25 FX set, holo dash | 4 | 512x512 | FX-01 wants 6 x 200x200 | count |
| completion kit, jet flame | **8** | 256x512 | FX-03 wants 5 x 240x120 | count AND aspect |
| completion kit, holo dash | **6** correct | **256x320** | FX-01 wants 6 x **200x200** | **count right at last, frame aspect still wrong** |

The completion kit got the FX-01 frame COUNT right. It is the frame SHAPE that is still wrong:
**200x200 is square. 256x320 is portrait.**

## 2. Machine-ready prompts

Copy these verbatim. Every number is load-bearing.

### FX-01, the M3 holographic dash overlay

```
One horizontal sprite strip, EXACTLY 1200 x 200 pixels, RGBA PNG with true transparency.
EXACTLY 6 frames, each EXACTLY 200 x 200 pixels, packed left to right in ONE row with
ZERO padding, ZERO margin and NO divider lines. Frame 1 starts at x=0, frame 2 at x=200,
frame 3 at 400, frame 4 at 600, frame 5 at 800, frame 6 at 1000.
Content: a holographic scan-and-flicker loop for the M3 Holographic Dash Readout symbol,
cyan and magenta emissive over dark, designed to overlay the symbol without hiding it.
The loop must be seamless: frame 6 leads back into frame 1.
Transparent background. All four corner pixels fully transparent. Zeroed RGB in transparent
pixels. NO text, NO numerals, NO watermark, NO baked outer glow, NO frame borders.
```

### FX-02, the L2 fuse arc overlay

```
One horizontal sprite strip, EXACTLY 800 x 200 pixels, RGBA PNG with true transparency.
EXACTLY 4 frames, each EXACTLY 200 x 200 pixels, packed left to right in ONE row with
ZERO padding and NO divider lines. Frames start at x=0, 200, 400, 600.
Content: a filament arc blink loop for the L2 Blade Fuse symbol, electric blue emissive.
Seamless loop. Transparent background, corners fully transparent, zeroed RGB where clear.
NO text, NO watermark, NO baked outer glow.
```

### FX-03, the jet flame sheet

```
One horizontal sprite strip, EXACTLY 1200 x 120 pixels, RGBA PNG with true transparency.
EXACTLY 5 frames, each EXACTLY 240 x 120 pixels (LANDSCAPE, twice as wide as tall),
packed left to right in ONE row with ZERO padding and NO divider lines.
Frames start at x=0, 240, 480, 720, 960.
Content: a jet exhaust flame loop, ignition through full power and back, reading correctly
when rotated to any angle because the engine rotates the whole sprite.
ALSO deliver frame 3 alone as a separate 240 x 120 PNG, pixel-identical to the strip's
third frame, for the reduced-motion still.
Transparent background, corners fully transparent. NO text, NO watermark.
```

## 3. The particle set, which two audits have now found missing

**R097 named the four particle rows as the whole P4 coverage gap. Neither art batch has
addressed them, because both delivered large overlays instead of small sprites.** The 2026-08-25
FX set's smallest asset was 480x480 and the completion kit's is 128x160. **The targets are
between 32 and 128 pixels.**

These are LIVE and consumed today:

| Row | Path | Size | Consumed by |
|---|---|---|---|
| **FX-05** | ui/particles/coin.png | **40x40** | `WinBanner.svelte:306` |
| **FX-06** | ui/particles/shock_ring.png | **128x128** | `WinBanner.svelte:295`, `FreeSpinsPresentation.svelte:485` |
| **FX-07** | ui/particles/smoke_puff.png | **56x56** | `FreeSpinsPresentation.svelte:478-479` |
| **FX-08** | ui/particles/spark.png | **32x32** | `GameGrid.svelte:1222-1223` |

### The commissioning prompt

```
FOUR separate small sprite PNGs, RGBA with true transparency, in the Future Spinner arc-2
style register (dimensional painted cyberpunk-automotive, gunmetal and carbon, upper-left
key, cyan and magenta emissive, never pastel):

  1. coin.png        EXACTLY 40 x 40    a single struck metal token, edge-on glint
  2. shock_ring.png  EXACTLY 128 x 128  one expanding impact ring, thin, centred, hollow
  3. smoke_puff.png  EXACTLY 56 x 56    one soft exhaust wisp, no hard edge
  4. spark.png       EXACTLY 32 x 32    one hot spark point with a short tail

EACH IS A SINGLE STILL, not a strip and not a sheet. They are drawn many times at small
scale by the particle system, so each must read at its stated size with no detail below
2 pixels. Centre the subject with a 2 to 3 pixel transparent margin. Corners fully
transparent, zeroed RGB where clear. NO text, NO baked glow, NO background.
```

**Do not deliver these as one contact sheet or one strip.** Four files, four exact sizes.

## 4. The homeless art, and what each would need

None of the following has a manifest row or a render site. **Art quality is not the issue;
the game has nowhere to draw them.** Listed with the smallest job first.

| Asset | Size | Needs |
|---|---|---|
| robot contact shadow | 680x240 | an `<img>` layer under `.char-img` in `SceneGroup.svelte`; the width already matches `scene_character.png` |
| car contact shadow | 2840x300 | the same, under `.car-img`; width already matches `scene_car.png` |
| hero floor reflection | 1920x540 | the same layer, or a third |
| medium win burst | 1536x384, 6f | a burst-overlay component keyed to a win tier |
| large energy bloom | 1536x384, 6f | the same component, premium tier |
| scatter collect pulse | 1536x384, 6f | a scatter-feedback hook |
| reel stop shockwave | 1024x320, 4f | a reel-stop hook in `GameGrid` |
| ambient dust embers | 1536x320, 6f | an ambient layer plus a reduced-motion path |
| residual glow chips | 1024x160, 8f | the same ambient layer |
| paytable panels, 5 assets | various | paytable component work; the paytable is CSS today |
| corner connectors, side panel, thin bezel | various | frame-level component work |
| robot head/visor/eye/chest layers | various | **BLOCKED BY SYSTEM LAW**, see the Spine document |

**The two contact shadows are the best value in the whole set**: the art exists, the widths
already match their heroes exactly, and the change is two `<img>` tags plus a reduced CSS
drop-shadow. They are also, unlike the robot part layers, static art that animates nothing,
so they sit on the permitted side of the external-art law.
