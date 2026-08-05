# Provider logo: the derivation, candidate f against candidate g

**Derived, not asked.** The brief set the rule and this document records the working:
the delivery goes to whichever candidate is measurably more legible at the smallest size
the platform renders. Produced by `frontend/scripts/provider_logo_derivation.mjs`.

**Verdict: candidate F wins at 32px, 3 of 3 measures, against candidate G alone.**

**This is a head-to-head ranking, not an absolute legibility claim.** The measurement
below compares exactly two candidates against each other on three measures and takes the
majority. It carries NO absolute floor: nothing here asserts that the winner is legible at
32px, only that it is the more legible of the two. An admissibility check against a stated
ceiling would be a different instrument and would need a ceiling nobody has yet derived.
See design-system/brand/provider_mark/README.md, which gates this sentence against the vote
rule in the generator.

## 1. What size does the platform actually render?

**The platform publishes no pixel size for the provider logo. Anywhere.**
`docs/stake-engine-live/game-tile-requirements.md:38` says only "Should be clear and
legible at small sizes": no width, no height, no safe area, no DPR note.

**And the provider logo is not drawn on the published game tile at all.** Live tiles
pulled from the public FAIR catalogue render the publisher as SET TEXT beneath the game
title, not as the supplied logo image
(`docs/stake-engine-live/2026-07-26/published-tile-geometry.md`). So the literal question
"how small does Stake render the provider mark" has no directly observable answer in
anything captured to date. That is stated rather than papered over, because the ladder
below is built on inference from three real anchors and a reader is entitled to know
which parts are measured and which are reasoned.

| Anchor | Size | Basis |
|---|---|---|
| Portal game-card thumbnail slot | **128 px** | MEASURED off `reports/screens/dtt-live-2026-07-26/03_files_page_math_380mb_13_files.png`: inner content box 128x160 device px, 132x164 including border, on a 2x-DPR capture. The smallest brand-image slot the platform is observed to render in our evidence. |
| External review, round one | **48 px** | EARNED. The shipped mark was called "nearly unreadable at 48px"; every TR-031 candidate comparison since has been built at 48. |
| The delivery's own floor | **32 px** | The smallest variant the owner's pack ships (`we_roll_spinners_32x32_transparent.png`) and the size its README names for the favicon. The studio's own stated smallest intended rendering. |

96 and 64 are filled in between so the trend is visible rather than three points.
**The decision is taken at 32px**, the smallest.

## 2. How the comparison was built

Each candidate is downscaled from **its own master** with high-quality smoothing, because
that is what a platform resampling the asset would do. The comparison sheet then draws
every export **1:1 with smoothing disabled**, so what a reviewer looks at is the real
pixels rather than a browser re-blur of them.

Both are composited over the **real portal surface, `#1d1d1d`**, sampled from the
page background of the capture above rather than chosen. This is load-bearing: candidate
f's own provenance records as an open risk that its structural colour `#0A0A14` is opaque
near-black and can dissolve on a dark surface, and measuring on white would have hidden
exactly the failure the platform's own surface causes.

| Measure | What it detects |
|---|---|
| `inkCoverage` | share of the frame carrying opaque ink |
| `rmsContrast` | global luminance variation; how much of anything survives |
| `edgeEnergy` | mean absolute Laplacian; INTERNAL detail, the difference between a readable mark and a blob |
| `toneLevels` | distinct luminance bins holding at least 0.5% of pixels; separable tonal regions |
| `invisibleInk` | share of opaque ink below a 1.5:1 contrast ratio against the portal surface: ink present in the file and not visible on the page |

## 3. The measurements

### Candidate f (`provider_mark_f-owner-transparent_master_1024.png`)

| Size | inkCoverage | rmsContrast | edgeEnergy | toneLevels | invisibleInk |
|---|---|---|---|---|---|
| 128 | 50.6% | 68.80 | 21.203 | 12 | 24.9% |
| 96 | 50.8% | 66.94 | 25.915 | 16 | 23.9% |
| 64 | 50.8% | 66.25 | 43.747 | 16 | 23.5% |
| 48 | 50.4% | 63.15 | 52.378 | 23 | 22.5% |
| 32 | 51.2% | 60.37 | 74.083 | 19 | 13.7% |

### Candidate g (`provider_mark_g-owner-pack_master_1206.png`)

| Size | inkCoverage | rmsContrast | edgeEnergy | toneLevels | invisibleInk |
|---|---|---|---|---|---|
| 128 | 62.6% | 45.99 | 53.201 | 23 | 41.5% |
| 96 | 62.7% | 45.67 | 71.467 | 23 | 42.0% |
| 64 | 62.7% | 39.97 | 57.932 | 20 | 36.7% |
| 48 | 62.6% | 40.43 | 73.349 | 21 | 36.0% |
| 32 | 61.9% | 31.77 | 45.815 | 18 | 31.7% |

### The crossover, which a reader will spot anyway

**Candidate g carries MORE internal detail than f at 128, 96, 64, 48px, and less at 32px.** That is not noise and it is not an argument against the verdict:
it is the whole shape of the problem. g is the richer piece of artwork, and at every size
down to 48px it has more to show. The crossover falls between 48px and 32px, and below it g's detail is what kills it: there
are no longer enough pixels to carry a text ring and a detailed wheel, so both average
toward a single mid tone. f is built the other way, three flat colours and large shapes,
which have nothing to lose and therefore lose nothing.

**The crossover does not change who wins, at any size on this ladder.** Internal detail is
one of three measures, and g leads on it alone while f leads on both of the others
everywhere. The full three-measure verdict at every size:

| Size | f takes | g takes | Winner |
|---|---|---|---|
| 128 | 2 | 1 | **f** |
| 96 | 2 | 1 | **f** |
| 64 | 2 | 1 | **f** |
| 48 | 2 | 1 | **f** |
| 32 | 3 | 0 | **f** |

So the decision does not rest on the choice of decision size. It would read the same at
any size on the ladder; taking it at the smallest is the rule the brief set, and the
smallest is also where the margins are widest.

## 4. The verdict at 32px

| Measure | f | g | Winner | Margin |
|---|---|---|---|---|
| internal detail retained (mean absolute Laplacian) | 74.0825 | 45.8149 | **f** | x1.62 |
| global contrast retained (RMS luminance) | 60.3722 | 31.7749 | **f** | x1.90 |
| ink below 1.5:1 against the portal surface (lower is better) | 0.1374 | 0.3170 | **f** | x2.31 |

**Candidate F takes 3 of the 3 measures at 32px** and is adopted as
`design-system/brand/delivery/WeRollSpinners-Logo.png`, delivered at its native
1024 resolution so the submitted asset has been through no resampling at all.

## 5. Evidence

| Artefact | What it shows |
|---|---|
| `reports/screens/provider-mark/f-vs-g-rendered-sizes.png` | f and g at true 128, 96, 64, 48 and 32, drawn 1:1 with smoothing off, over the measured portal surface |
| `reports/screens/provider-mark/48px-legibility-comparison.png` | the standing six-way 48px sheet, kept |
| `reports/screens/provider-mark/candidate-f-on-surfaces.png` | every candidate at true size over light, mid, dark and portal surfaces |

## 6. Delivered file

| Field | Value |
|---|---|
| Source master | `design-system/brand/provider_mark/provider_mark_f-owner-transparent_master_1024.png` |
| SHA-256 | `66c692daf309293568214bd57b350b02b930d610c6b7d09ecb181a35dc7a03c6` |
| Delivered as | `design-system/brand/delivery/WeRollSpinners-Logo.png` |
| Superseded | candidate g, kept on disk and kept in the comparison sheets per convention (h) |

## 7. What this derivation does not settle

The measures above are computed on pixels and they answer the question the brief asked.
They are not a judgement of which mark is the better piece of design, and they cannot be:
no metric here knows what the mark is meant to depict. If the owner looks at
`f-vs-g-rendered-sizes.png` and disagrees with the arithmetic, the eye-call outranks it,
and reversing the decision is one constant in this script and a re-run.
