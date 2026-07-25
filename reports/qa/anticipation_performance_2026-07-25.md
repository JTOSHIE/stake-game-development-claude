# Scatter anticipation: performance record

Measured 2026-07-25 on the build machine, headless Chromium, 1280x720.

## The honest limitation, first

**This environment cannot verify the frame gate.** The gate requires avg fps >= 55 and zero
frames over 100ms. Measured here, the game **idles** between 34 and 43 fps across runs with
nothing happening at all. The ceiling is the environment, not the code, and single samples
drift by around 20% between runs.

So no pass or fail is claimed against the 55 fps threshold from this machine. The gate must
be run in the closing run's fresh environment for a verdict.

## What can be measured here: the ratio

Environmental drift cancels in a back-to-back ratio, so anticipation rounds are measured
against plain rounds within the same pass.

| Pass | plain fps | anticipation fps | ratio | frames >100ms |
|---|---|---|---|---|
| 0 | 40.5 | 31.9 | 0.788 | 0 |
| 1 | 39.4 | 32.0 | 0.811 | 1 (117ms) |
| 2 | 38.5 | 32.3 | 0.837 | 0 |

**Mean ratio 0.812.** Before the optimisations below it was **0.713** (30.1 against 42.2),
with 2 long frames in 10 rounds and a worst frame of 200ms.

## The two costs found, and what was done

**1. The tremble animated every cell of every anticipating reel.** The selector was
`.reel-strip.anticipate .symbol-cell`, which is 7 strip slots per reel and up to 35
independently animated elements once anticipation covers the remaining reels. It now
animates `.symbol-col`, one element per reel, which carries no transform of its own and so
cannot fight the strip's scroll transform. The column clips its strip, so shaking the
column shakes the whole reel: the effect reads the same at a seventh of the elements.

**2. A scaling `drop-shadow` on every tile.** The blur radius was interpolated from
`--escalation`, which re-rasterises the shadow for every tile on every level change. The
radius is now fixed; brightness and saturation still ramp, because they are cheap
colour-matrix operations and carry the escalation just as legibly.

**3. The expensive layers are now scoped to the FOCAL reel**, the one actually about to
decide, rather than every remaining reel. This is a direction decision as much as a
performance one: it puts the player's eye on the reel that matters instead of lighting them
all equally, and it is what the ship spec means by dropping sparks first under pressure.

## What is still open

The residual ~19% cost is inherent to running more visual layers during the most
interesting moment of the round, which is the point of the feature. Whether that fits inside
the real gate is a question for a machine that idles at 60 fps rather than 40.

**If the closing run fails the gate**, the drop order is already specified and the classes
are already separated to make it mechanical: sparks first (`.col-focus` only), then the
vignette, then the tremble. The flame gauge and the reel slowdown are dropped last, because
they carry the information.
