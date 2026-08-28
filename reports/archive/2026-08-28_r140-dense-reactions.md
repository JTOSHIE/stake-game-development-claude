
---

# R140 - THE DENSE STRIPS FIT WHOLE, AND THE BUDGET ARITHMETIC WAS THE WHOLE PROBLEM (2026-08-28)

Sole live brief, unattended, review lane. Brief saved verbatim at
`reports/briefs/FS_R140_DenseWinUnfold_Prompt.md` per convention (f). Booted from
`main` at `4a9918e5`, which already carried R141's 0-degree needle: PR #178 was
MERGED before this session opened, so the needle is on main and was not reopened.

Owner's word: the float is accepted, the transitions still look amateur.

## What shipped

| | was | now |
|---|---|---|
| win unfold | `hero_win_reaction_16f.png`, 16 frames | **`hero_win_reaction_32f.png`, 32 frames** |
| feature brace | `hero_feature_trigger_7f.png`, 7 frames | **`hero_feature_trigger_16f.png`, 16 frames** |

**Frames shipped vs delivered: 32 of 32 and 16 of 16. Nothing was dropped.** The
brief's degradation ladder (32 to 24 to 16, never dropping frame 1 or last) was
authorised and was NOT needed, because option 1 of that ladder turned out to fit.

## WORKSTREAM 2 first, because the budget was the question the brief got wrong

The brief expected a 32-frame win to be expensive, and the naive arithmetic
agrees: two sheets at roughly double their current size against 2.63 MB of
standing headroom is hopeless. **That arithmetic is wrong in two independent
ways, and both had to be found before the art could be judged.**

**1. The sheets being replaced LEAVE the bundle.** The envelope is not the
standing headroom. It is

```
cap 26,214,400  -  (dist 23,455,710  -  the two old sheets 5,049,583)  =  7,808,273 bytes
```

**2. The delivered art compresses far better than the incumbent.** 32 new frames
cost 4,134,846 bytes where 16 live frames cost 3,362,803. Packed and measured on
real files, not estimated:

| | bytes |
|---|---|
| `hero_win_reaction_32f.png` (12608x780) | 4,134,846 |
| `hero_feature_trigger_16f.png` (6304x780) | 1,772,729 |
| **total** | **5,907,575 against an envelope of 7,808,273** |

Built dist is **24,313,711 bytes = 23.19 MB**, against the 25 MB cap, leaving
**1.81 MB**. Net change **+858,029 bytes, +0.82 MB**. The predicted figure was
24,313,702 and the build produced 24,313,739 on the first pass: 37 bytes apart,
which is `build-info.json` regenerating, the same discrepancy R126 recorded at
3 bytes.

**WHY THE COMPRESSION IS SO GOOD, AND IT IS NOT LUCK.** The delivered strips are
EXACT PALINDROMES. Frame i is byte-identical to frame 33-i for every i in the win
and 17-i in the brace, so 32 frames hold 16 unique images and 16 hold 8. One
sheet row is 12608 x 4 = 50,432 bytes and the mirrored half sits about 25,216
bytes away, INSIDE zlib's 32 KB window, so deflate matches the return leg against
the outgoing one. Measured: 16 unique poses packed alone cost 2,967,437 bytes and
a naive doubling would be 5,934,874, against the 4,134,846 actually observed.
**The mirror is saving 1,800,028 bytes.**

A palindrome could therefore have been played out-and-back from a half-size
sheet. **It was NOT done**, and the reason is recorded because it is the kind of
cleverness that costs later: `animation-direction: alternate` reverses BOTH
buffers, so on the return leg the crossfade's top buffer would lead toward the
frame just left rather than the one being approached, inverting the dissolve for
half of every reaction. The full sheet fits; storing the mirror is the cheaper
answer in every sense that matters.

## WORKSTREAM 1: the census, and the pack path proven rather than asserted

**THE PACK PATH IS CALIBRATED AGAINST A KNOWN ANSWER.** R126's provenance records
that PIL `save(PNG, optimize=True)` reproduces a shipped hero sheet byte for
byte. That claim was used as a CONTROL before any new sheet was built: re-packing
the live 16f sheet from its own recorded source selection, with LANCZOS and RGB
zeroed under alpha 0 before and after the resample, reproduces
`hero_win_reaction_16f.png` at **exactly 3,362,803 bytes with an identical
sha256**. Four other resamplers and the unsanitised variant all miss. The new
sheets are packed by that same proven path.

**IDENTITY, the primary refusal gate.** Delivered frame 01 is byte-identical to
the project's stated identity master (`44eeba57...`), and is the same file as win
frame 32, brace frame 01 and brace frame 16. Measured at render size 206x407,
alpha>127:

| | sym-diff vs live rest |
|---|---|
| new win frame 01 and frame 32 | **0.0061%** |
| new brace frame 01 and frame 16 | **0.0061%** |
| **the resample CONTROL** (live rest through a 680x1344 detour vs itself) | **0.0273%** |

The endpoints sit **four times closer to rest than the floor of the instrument
measuring them**. Against the incumbent's own master the silhouette IoU is
exactly **1.000000**, the two differing only by alpha <= 3 on invisible edge
pixels.

**Ground line: drift 0, and the honest reason is not craft.** Rows 1040-1343 of
every one of the 48 delivered frames are BYTE-IDENTICAL to frame 01, so the
contact line cannot drift. That is a paste, not animation, and it is reported
that way rather than as evidence of care. **The incumbent does exactly the same
thing** at the same proportional position (its rows 606-779 of 780 are likewise a
copy), so this is how this supplier family has always built a planted stance.

**Edge clip, and my first check was self-referential.** Columns 0 and 679 carry
alpha 0 in all 48 frames and the minimum margin across every frame is 12px at
render size. But that measures the supplier's own canvas, which proves nothing
about the box the art plays in, and an adversarial pass was right to say so. Done
properly, with the live keyframe transforms applied about `transform-origin
50% 97%`:

| state | old sheet | new sheet |
|---|---|---|
| `hero-punch-win` | 3.72px past the hero box | **2.54px** |
| `hero-punch-epic` | 11.43px | **9.41px** |
| `hero-brace-energy` | inside | **inside** |

**The overflow is pre-existing and R140 SHRINKS it**, because the new peak is a
slightly smaller gesture. And it clips nothing: `.char-layer` sits at `left:22px`
and the nearest ancestor with `overflow:hidden` starts at x=0, so the worst case
still has 12.59px of clearance. Confirmed live by seeking the epic punch and
reading the rects at five points: `clipped:false` throughout, minimum clearance
**2.05px** on the element box, with the painted pixels inset further still.

## The art is denser, and it is also slightly smaller

Measured at render size 206x407, alpha>127, symmetric difference over union:

| | mean step | max step | peak vs rest |
|---|---|---|---|
| LIVE win 16f | 11.098% | 18.629% | 27.043% |
| **NEW win 32f** | **6.913%** | **11.961%** | 24.317% |
| LIVE brace 7f | 13.312% | 19.450% | 27.988% |
| **NEW brace 16f** | **8.256%** | **13.514%** | 26.157% |

**About 38% smaller per-frame jumps on both.** Effective gesture frame rate goes
10.67 to 21.33 fps on the big win, 8.42 to 16.84 on the epic and 5.38 to 12.31 on
the brace.

**THE HONEST QUALIFICATION, surfaced by an adversarial pass and then re-derived
rather than repeated.** The new strips also MOVE LESS: the amplitude ratio is
**0.899** on the win and **0.935** on the brace, and that figure holds on two
independent denominators (union and frame area agree to 0.006). So part of the
smoothness is a slightly smaller performance, not only a finer one. The
adversary's figure for this was 0.75x and does NOT reproduce on either
denominator; 0.899 is the number that does.

Not lighting-only: the silhouette rises monotonically to 24.3% of union at the
win peak, so the figure genuinely moves rather than the lights changing.

## WORKSTREAM 3: every literal moved together

The component's own comment states the contract, and it is the failure R126
recorded: a stale count does not throw, it silently plays a truncated gesture.
Six literals plus an override had to move as one, and did: `FRAMES` (16->32,
7->16), both `steps()` counts (15->31, 6->15), both fade iteration counts, both
fade durations (100ms->48.387ms, 216.667ms->86.667ms) and the epic fade override
(126.667ms->61.29ms). The spans derive from `FRAMES` and needed no edit.

Nothing else changed: idle art untouched, R138's float untouched, R138's
crossfade geometry untouched, the gauge untouched.

## WORKSTREAM 4: QA, and the frame rate that was never the sheet

`hero_float_proof.mjs` was updated to the new clocks and given a new section C2.
Full run, 1280x720 and portrait 390x844: **every assertion green**, 60.0 fps
mean, **0 long frames**, 0 console errors, 0 page errors. Idle float preserved
exactly: 3px peak to peak, period 4999ms, pose held on frame 01 with no
animation of its own.

**C2 IS THE ASSERTION THAT MATTERS, AND IT SEEKS RATHER THAN SAMPLES.** It proves
all 32 frames actually paint: the bottom buffer takes exactly the 31 positions
0 to -6180px in 206px steps, the top buffer the 31 from -206 to -6386, and
between them the union is 32. The first draft SAMPLED computed style on rAF for
1460ms of a 1500ms reaction and captured 29 of 31 - not because a frame was
missing (every observed gap was exactly 206px) but because the trace window
closed before the last two steps and the buffer unmounts at 1500ms. **A
wall-clock sampler on a one-shot is a race with its own subject.** Pausing the
animation and seeking `currentTime` to each step midpoint reads all 31 with no
phase luck.

**THE FRAME RATE FAILED THREE TIMES AND IT WAS NEVER THE ART.** Readings of 50.6,
38.5 and worse looked exactly like a bigger texture costing compositor time. Two
things settled it. First an INTERLEAVED A/B - the new sheets on this branch
against the incumbents in a control worktree on `main`, same browser, same
viewport, alternating A,B,A,B so drifting load could not bias one side - returned
**new 24 fps median against old 22**, so the new art was not slower than the art
it replaces even while both were crawling. Then the cause: an orphaned headless
chromium from R137's `scratchpad/r137/ws2-guide/capture.mjs`, parented to launchd,
had been running **11 hours 22 minutes at 166% CPU**. Killing it took the same
measurement to **60.0 fps with zero long frames**. A worktree, never a stash, per
the R132 lesson.

## WORKSTREAM 5: does the dissolve still help, and what clunk is left

**The dissolve still helps, but its margin is thinner and that is worth saying.**
It smooths the arriving edge of each step, and the steps are now 38% smaller, so
it has less to do. Its ramp is now 48.387ms on a big win, which is **2.9 rendered
frames at 60fps** against about 6 before. It is still a blend rather than a cut,
and the flipbook underneath is now at 21.33 fps where 24 is the usual film
threshold, so the two together clear it comfortably. At this density the
crossfade has moved from load-bearing to insurance.

**THE CLUNK THAT IS STILL ART, and it is the one thing to take back to the
supplier.** The delivered strips are exact palindromes, so **the return leg is a
pixel-perfect retrace of the outgoing leg**. The incumbent's was not: the live
16-frame win holds 15 unique frames with an asymmetric return, and the live brace
6 of 7. A real gesture does not settle along the path it struck; a perfect
reverse can read as mechanical however many frames it has. That is now the
largest remaining artefact in the hero's acting, and no amount of density fixes
it.

**It is affordable to fix, and the number is known.** Redrawing the return leg as
16 genuinely new poses would forfeit the 1,800,028 bytes zlib currently saves on
the mirror, taking the win sheet to about 5,934,874 and dist to about 26,113,739
against a cap of 26,214,400 - **fitting, with roughly 100,661 bytes to spare.**
That is real but very thin, and it is an owner call rather than a builder one.

Second, smaller: the peak amplitude fell about 10% on the win. If the owner wants
the same reach as before AND the new density, that is a request to the supplier,
not something to fix by scaling art.

## An adversarial pass, and what it got right and wrong

A three-lens adversarial review was run against this session's own measurements
and raised six findings. Recorded because the ones it got right changed the work:

- **RIGHT, and acted on:** the identity gate as first run was tautological. Frames
  01 and 32 ARE the master, so testing them asks whether the master is the master.
  The 15 unique moving win poses and 7 moving brace poses were then tested
  properly: restricted to the head's own columns the IoU holds **0.938 to 0.990**,
  the head centroid moves at most 4.15px native (about **1.3 CSS px**), the
  planted band holds **0.993 minimum**, and the apparent head-band change is
  **+4,289 px arriving in columns outside the head span** - the raised fist, not
  head drift.
- **RIGHT, and acted on:** the edge-clip check measured the supplier's canvas
  rather than the live box. Redone above, with the live transforms and an old/new
  control.
- **RIGHT, and reported:** zero ground drift is entailed by a byte copy, not by
  craft.
- **RIGHT, and my error:** my resample control was asymmetric, carrying two
  resamples where the measurement carries one, so it inflates rather than bounds.
  The conclusion survives because the identity margin is 4x on the wrong side of
  the inequality and the strict comparison is 0 differing pixels.
- **WRONG:** that the peak leaves the hero box in "three of four live reaction
  states" was presented as a new defect. It is pre-existing, R140 shrinks it, and
  one of the four states it cites cannot occur - it applied the epic transform to
  the brace, and `data-tier` is only set when `motion === 'win'`.
- **WRONG in weight:** the row-1040 splice is real but invisible and not new.
  Visible change (alpha>32) ends at row **891**, 149 rows above the splice, and
  the incumbent has the identical structure at the same proportional position.

## FOR THE NEXT SESSION

Model and effort: Opus 5, high effort. A 10-agent census/budget/verify workflow
ran alongside first-hand measurement; its budget agents independently reproduced
the fit (1.80 to 1.95 MB spare against my 1.81) and its compression agent
independently confirmed the encoder parity, finding only 9 bytes available from
better lossless compression on this machine.

Approach: measure the delivered art first-hand, calibrate the pack path against a
known answer before building anything, compute the real envelope rather than the
standing headroom, then wire and prove. Alternatives tried and rejected: the
brief's frame-dropping ladder (unnecessary, option 1 fits); playing the palindrome
out-and-back from a half sheet (inverts the crossfade on the return leg); better
lossless compression (9 bytes); WebP (forbidden, and no `.webp` exists in the tree).

Files touched: the two new sheets, the two deleted ones,
`frontend/src/lib/components/HeroIdle.svelte`,
`frontend/scripts/hero_float_proof.mjs`,
`reports/OUTSTANDING_LEDGER_2026-08-25.md` (two citations de-backticked, the
R126 pattern), the brief save, this report and
`reports/screens/r140-dense-reactions/`.

Open threads: the palindromic return leg, above, with its price. The ~10% smaller
peak amplitude. Both are supplier questions. Also noted in passing and NOT acted
on: the R126 note at `reports/OUTSTANDING_LEDGER_2026-08-25.md` says R126 replaced
the win sheet with "a 14-frame sheet, hero_win_reaction_14f.png" while the same
document and R126's own provenance both say 16 frames - a dated note contradicting
itself, left for the owner rather than rewritten by me.

The owner preview was NOT refreshed: this session landed nothing on `main`
(review lane), so rule 12 does not fire. One housekeeping item: an orphaned
headless chromium from R137 was killed after 11h22m at 166% CPU; anything timed
on this machine earlier today was measured against that load.
