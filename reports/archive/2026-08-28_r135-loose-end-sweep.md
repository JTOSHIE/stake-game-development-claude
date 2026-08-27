# R135 - THE LOOSE-END SWEEP, AND TWO OF THE BRIEF'S OWN PREMISES WERE WRONG

Brief: `reports/briefs/FS_R135_LooseEndSweep_Prompt.md`, saved verbatim before any work. The pasted
message carried TWO briefs, R135 and the queued R136, plus the owner's closing note; it is saved
whole rather than split, because R136's text is part of what sets R135's scope.
Branch `claude/r135-loose-end-sweep`, review lane, pull request #175. Boot from main at 031aaaeb.
The owner's 30 WIP rasters were fingerprinted from the repo root with absolute paths before any file
operation, byte-identical to R134's fingerprint, and re-verified byte-identical at close.

Ten measurement agents built the ledger before anything was changed. That order is the reason two of
the brief's fourteen named items turned out not to be defects at all.

## 1. The premises that did not survive measurement, and one of the bad claims was mine

**BRIEF ITEM 1, THE GAMEGRID CLAMPS, IS NOT THE R134 DEFECT.** My own R134 report parked four of them
with the words "they are the same defect class: a negative there would jump a reel rather than show a
minus sign". That claim came from the regex SHAPE, `Math.min((now - start) / duration, 1)`, and not
from reading the call sites. Reading them refutes it:

- `:392` is a delta-time CAP between two rAF timestamps, which are monotonic. Not a progress clamp.
- `:471` and `:529` capture `performance.now()` and read `performance.now()` again inside the
  callback. ONE clock, later reading, so elapsed cannot be negative.
- `:507` IS the mixed-clock shape, and it is GUARDED on the line immediately above:
  `if (now < begin) { requestAnimationFrame(fall); return }`.

**CONFIRMED LIVE using R134's own forcing method**, performance.now() run 45ms ahead of the rAF clock,
six spins each: the painted reel range is IDENTICAL in the control and the forced run, translateY
-624.0 to -104.0 and scaleY 0.851 to 1.069, across 4,095 and 4,585 samples. -624.0 is exactly
`REST_Y - DROP_H` and -104.0 is exactly `REST_Y`. The detector's POWER was stated rather than assumed:
at t=-0.03 the squash would paint 0.7074, below its own 0.740 floor, so a negative there IS observable.

**AND THERE IS A STRUCTURAL REASON THE FALL COULD NEVER REWIND, WHICH IS THE PART WORTH KEEPING.**
`_dropReel` uses `f * f`, and a square is an EVEN function: f = -0.03 yields -623.53 against -624.0, a
0.47px FORWARD move. Even with the guard deleted, the shipping fall cannot go backwards. The defect
needed a mixed clock AND an odd-powered easing, and only the money count-ups had both.

**BRIEF ITEM 5, THE SHOCK RING: OPTION 3, leave it, with the reasoning recorded.** The premise measures
the CSS box rather than the painted pixels. Option 1 shrinks a signed-off celebration at three call
sites to reclaim 6,612 B against 2,456,204 B of headroom; option 2 is new visual design, which the
fence forbids. Recorded rather than actioned.

## 2. A new player-visible defect that nobody parked, and R133 caused it

Found while measuring the grid flash. **The free-spins "FEATURE COMPLETE" headline was being written
over by the win banner's own amount.**

Both are centred on the stage, so they occupy the same rows by construction. Until R133 that never
showed: `.fs-face` painted an OPAQUE gradient and the title was simply hidden behind the band. R133
made the face a translucent scrim so the tier ART could read through, measured exactly that, and
nobody measured what ELSE now reads through.

MEASURED at 1280x720 on a real NITRO super buy: title 440.5x48 at y336, band 1280x111 at y254.5,
amount 594.4x75.7 at y272.1. **61.5% of the title's area lies inside the band and 23.8% lies under the
amount itself.** At drawn size the headline read `F ... MPLETE`.

Fixed by MOVING the title rather than hiding it, so the player keeps both the amount and the fact that
the feature ended. 84px is derived, not dialled in: the band is centred on stage y=310 and its tallest
tier is 172px, so its lowest edge across every tier is y=396, and the title's top moves 336 to 420,
clearing it by 24px. Overlap after: **0px, 0.0%**, against both the band and the amount.

## 3. The grid flash, which corrects R132 twice

R132 section 11d recorded the 1x-10x flash playing under the feature overlay as "predates R132".

**IT DOES NOT. R132 CREATED IT.** On the pre-R132 build the flash and the overlay share ZERO frames,
the flash mounting 16ms AFTER the overlay unmounts. R132 moved the settle to the end-banner reveal and
dragged the flash under the overlay with it.

**AND R132 NAMED THE WRONG OCCLUDER.** R132 called the overlay opaque. It is a radial-gradient at alpha
0.72 to 0.92 and transmits **19.6%** of the flash's ink: toggling only the flash inside one frozen page
load, with a drift of 0 changed pixels, gives meanDelta 8.53 through the overlay against 43.60
unoccluded, which at 1:1 reads as "WIN!" ghosting behind "FEATURE COMPLETE". What actually hides it is
the feature-end WinBanner at z-index 100, whose band the flash sits entirely inside; counting the
banner drops transmission to 1.57%.

**So the flash was invisible only by ACCIDENT of an unrelated component's geometry**, and any change to
the band would have re-exposed it. Suppressed at the source with the flag already used for exactly this
purpose 29 lines below. After: 0 flash frames of 1730 on the feature round against 649 overlay frames,
and the base-game control still flashes 64 frames with no overlay.

## 4. Reduced motion may freeze or dim. It may not intensify.

`.booster-flicker` was the one element in its block with no replacement opacity, so killing its
animation left it at the base rule's 1 while its own animated range is 0.25 to 0.80. Measured with the
media feature toggled INSIDE one page load: no-preference 0.250 to 0.800 across 23 distinct values,
reduced pinned at 1.000 with `getAnimations()` empty, and the no-preference read repeated afterwards
returning an identical 23 values. **1.25x its own animated PEAK.** In pixels over its own rect, mean
luminance 86.09 to 108.33 and back to 85.07: a signal 22 times the 1.02 drift. Now 0.25, the keyframe's
own resting value. Five sibling accents held their declared values as positive controls throughout.

Two more of the same class: `.game-wrapper.shake` was (0,2,0) and lost to its three layout variants at
(0,3,0), so portrait, compact-landscape and mini-player still shook; and `.fs-cell.win` and
`.fs-spin-win` were both inert against later rules in their own file.

## 5. A guard that was claimed twice and true neither time

R130 wrote that `PRUNED_PREFIXES` guards the pruned hero glance sheet. R131 corrected that to "the real
guard is the STATIC asset_reference_gate". **THAT WAS FALSE TOO.** The gate matched only a LITERAL path
after the `assetBase` interpolation, and HeroIdle writes `{assetBase}/ui/hero/{SHEET[motion]}`, so the
FILENAME is itself an interpolation and `{` is not in the matcher's character class. Two live comments
claimed a guard that could not see the file either way round.

**CLOSED RATHER THAN RESTATED**, because R131's own lesson was that a claimed guard which does not
exist is worse than no guard. The gate now resolves one level of indirection through a same-file
`Record` literal. PROVED by seeding in a scratch copy, never the tree: with the glance restored to the
SHEET map the gate resolves `/ui/hero/hero_glance_6f.png`, that path is absent from dist, and the gate
goes red. Without the seed it resolves exactly the three live sheets.

**AND R129'S ORPHAN FIGURE WAS WRONG IN A WAY THAT WOULD HAVE DELETED A LIVE ASSET.** R129 listed three
files as "the genuine orphans ... 280,806 B total" and named `frame-2.png` among them. `frame-2.png` is
LIVE: `themeStore.ts:75` sets the theme's frame to it. The two real orphans are 185,561 B and are now
pruned; dist goes 22.66MB to 22.48MB. The wrong number survived five sessions because nobody
re-derived it.

## 6. WS6: two gates written, two declined

**A, money never negative: ALREADY CLOSED.** Two steps in the blocking static job, both green. Verified
rather than assumed. Nothing added.

**D, the feature perimeter raster: ALREADY COVERED**, and proved by seeding rather than reading. A
scratch fakeroot was built (a copy of src, a symlink to the real dist, an unmodified copy of the gate)
so the tree was never touched, the removed markup was re-added there, and `asset_reference_gate` went
red. Adding a second gate over a guarded file is duplication, and the brief says add only what catches
a real miss.

**C, `hero_idle_planted_gate.mjs`: WRITTEN.** Nothing guarded R130's ruling: a grep of all 140 scripts
for the hero terms returns one hit, and it is a prune entry. The gate keys on BEHAVIOUR rather than on
the five retired names, which is what makes it worth having: seed 2 restores exactly the same pendulum
under a BRAND-NEW name, and seed 7 hides the same rule inside an `@media` block. Seven seeds, all
caught, both negative controls clean.
**The comment trap is why it is shaped this way**: HeroIdle.svelte's own prose names all five retired
keyframes and quotes the banned declaration verbatim, so a grep-for-the-name gate is a permanent false
positive on the very file it guards. The component is split into CODE and PROSE and only CODE is
judged; every run prints how many of the five the real prose contains, so the immunity is evidenced
rather than asserted.

**`raf_clock_mixing_gate.mjs`: WRITTEN, and it is not one of the four the brief listed.** It
generalises R134's fix to the whole tree and it exists because of the mistake in section 1. It asserts
the CLOCK SOURCE and never the clamp shape, finds exactly three mixed-clock sites in frontend/src, and
requires each to be clamped or guarded. What it really protects is the one guard on the shipping reel
path, which looks redundant and is a one-token deletion away; the seeded self-test deletes exactly that
line. **It also FAILS if it finds ZERO sites**, because a detector that suddenly matches nothing is a
broken gate rather than a clean tree, and that failure shape has cost this project four sessions.

## 7. Dead code that looked alive

`.fs-entry`, `.fs-sub`, six `.scheme-*` rules across HudOverlay and PaytableModal, `.pm-value.pink`,
and the dead `playScatter` export are deleted. The build emitted FOUR `css_unused_selector` warnings
before and emits ZERO after.

`HeroSplash`'s `.ring-glow` layer painted ZERO pixels: the emblem on top of it is fully opaque and
covers it entirely, measured as 0 changed pixels against a 35,894 px positive control. The element, its
rules and the keyframes it solely consumed are gone. **Widening it to clear the emblem was the
alternative and was NOT taken**: that is a visible change to the boot screen and therefore the owner's
call, not a cleanup.

## 8. Doc drift

One item, found by reading rather than by an agent. `docs/HUD_SPEC.md`, a LOCKED spec, still recorded
that `popout_conformance.mjs` "labels its assertion 'meets the 44px touch target' and tests >= 40" and
that the threshold was "deliberately NOT moved", calling it "the one live item left on TR-164". **R075
moved it**: the assertion at HEAD is `geom.btnH >= 44` and the script's own comment records that it
read `>= 40` "from R14 until R075". Marked closed with the verification rather than silently edited,
because a stale status claim in a boot document is precisely the class convention (h.1) exists for.

`docs/design/HERO_SMOOTHNESS_R129.md` was checked and left alone: it is already correctly marked
SUPERSEDED IN PART BY R130, names exactly which machinery is gone, and says live state is read from the
component and never from the file. That is the convention working.

## 9. Left for the owner

| item | why it cannot move under this fence |
|---|---|
| Four audio stems (feature_enter, feature_end, retrigger, win_max) | The fence forbids audio generation and WS8 is inventory only. The blocker is a licence decision, unmoved since R125. |
| The two-needle gauge face | The fix is one of the owner's 30 uncommitted rasters, and the fence forbids committing them. |
| WIP particles, and whether to commit the rest of the 30 placeholders | Same. |
| `npm run assets` | **The guard already refuses.** The figure the owner should hold before ever overriding it: the override destroys 25 of the 30 uncommitted rasters and creates 17 files absent from HEAD. |
| SC-03, gameStore.ts debts, maths-package doc debts | Locked paths. This brief carries no lock sanction and the fence says do not change locked maths. |
| Max win still covers the hero (carried eleven sessions) | The payoff is an art intake the fence forbids, and the change is a restage of the most photographed screen in the game: a design decision, not a code defect. |

## 10. FOR THE NEXT SESSION

**Model and effort:** Opus 5, high effort, ultracode. One 12-agent inventory workflow, then hand
implementation in waves with per-wave verification. About 2.3M subagent tokens.

**Approach:** measure the whole class before fixing the reported instance, and re-derive every parked
claim against the tree instead of repeating its note. That is what turned up two non-defects, one new
defect, a wrong byte figure that would have deleted a live asset, and a guard claimed twice and true
neither time.

**Alternatives tried and rejected:** re-opaquing `.fs-face` to fix the title collision (reverts R133's
measured result); reordering FreeSpinsPresentation's two lines to make the overdrive banner reachable
(flips every feature round to pink/orange and sits on the R132 lockstep pin); shrinking the shock ring;
adding defensive clamps to the five safe GameGrid sites; and a static form of the reduced-motion gate,
which was prototyped and FAILED OPEN on the live defect because the defect is an ABSENT declaration
with nothing to compare.

**Not completed, and named rather than implied:** the reduced-motion no-intensify gate (WS6 B) is
designed and prototyped but not written, because the prototype proved it must be a browser gate and
that is a new instrument; the audio code defects (a warm mount firing feature cues on every page load,
a `played` counter incremented before playback starts, playMaxWin missing on the bought path) are
diagnosed with file:line but not fixed; and the remaining document corrections are listed in the
ledger at `scratchpad/r135/LEDGER.md`. All are code-only and inside a future fence.
