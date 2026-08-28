# OUTSTANDING LEDGER, arc 2 — one authoritative list

> **AMENDED 2026-08-25 by R104.** A completion kit of 122 files arrived after this ledger was
> written. What it changed is in section 0A; the rest of the ledger stands. **Do not read the
> pre-R104 rows as though the kit does not exist.**

## 1A. R129 - THE TICK WAS THE IDLE, IT WAS TEMPORAL, AND THE FIX COST ZERO BYTES

**Branch `claude/r129-smoothness-hardening`.** Overnight, multi-agent. Full technical record at
`docs/design/HERO_SMOOTHNESS_R129.md`.

*** THE DIAGNOSIS NOBODY WOULD HAVE GUESSED FROM FRAME COUNTS. Milliseconds per frame and worst
neighbour step, measured at render size 206x407 before anything changed:
    idle   6f / 4400ms =  733ms/frame ( 1.4 fps)  worst step 18.74%
    win   16f / 1500ms =   94ms/frame (10.7 fps)  worst step 18.63%
    brace  7f / 1300ms =  186ms/frame ( 5.4 fps)  worst step 19.45%
**THE WIN AND THE IDLE TAKE THE SAME SIZE STEP. THE IDLE HOLDS IT 7.8x LONGER.** At 1.4 fps the eye
fully resolves each still and then watches it snap. The tick is TEMPORAL and it is the IDLE - the one
state on screen almost all the time. The reactions were never the problem. ***
*** TWO AGGRAVATING FACTS ABOUT THE IDLE STRIP: one step carries **100% of the 14px lateral range**
(head centroid per-step deltas -3, -4, **+14**, -4, -3), and **frame 06 is BYTE-IDENTICAL to frame
01**, so a LOOP spends 1466ms showing the same pixels back to back. ***
**ALL FIVE CANDIDATE CAUSES WERE MEASURED, NOT ASSUMED. Four cleared:** the sway is continuous not
stepped and beats deliberately at 7.2s; the banner covers hero rows 0..100 of 415 but only during a
win and the idle is never occluded; **NO ancestor clips the hero box** (both overflow:hidden
ancestors are 1280x720, hero at (22,295) 207x408 entirely inside); frame count alone is not it,
because the win has an identical worst step at 10.7 fps and does not tick.

*** SHIPPED: A DUAL-BUFFER CROSS-DISSOLVE ON THE IDLE, ZERO BYTES OF ASSET. Two stacked copies of the
same sheet: layer A (bottom) at full opacity always, layer B (top) exactly one frame ahead via
animation-delay calc(-1 * var(--hero-frame)), dissolving in over one frame period. --hero-frame is
computed in the markup from DURATION_MS/FRAMES so it CANNOT drift out of phase with the steps.
COMPOSITE measured, 45 samples at 100ms: max per-sample change **15.33 -> 4.15**, stdev 3.01 -> 0.67,
spikiness 11.67 -> 3.53, **spikes above 5.0: 5 -> 0**. ***
*** BUT "THE TICK IS GONE" WAS TOO STRONG AND THE ADVERSARIAL PASS OVERTURNED IT, CORRECTLY. Derived
exactly on the sheet, THE POPS ARE HALVED, NOT REMOVED: f3->f4 (the lurch) **18.74% -> 10.32%**, the
other four ~5.4% -> ~2.8%, and the f6->f1 SEAM stays **0.00% -> 0.00%** (those two frames are
byte-identical). The honest claim: a hard cut out of a HELD STILL became the end of a 733ms
CONTINUOUS MOVE at half the magnitude. ***
*** THE ADVERSARIAL PASS FOUND TWO REAL DEFECTS IN MY OWN FIX. (1) THE DROP-SHADOW WAS DRAWN TWICE -
both layers carried filter: drop-shadow, so it doubled on overlap, darkened 2.35x across each hold
and snapped back, producing a **3.269 pop at the seam that was previously a perfect no-op**. Moving
it to .hero-body fixes both; re-measured, the seam is 0.00% again. (2) IT IS NOT A TRUE CROSS-DISSOLVE
AND CANNOT BE: two stacked RGBA layers composite as aTop + aBottom(1-aTop), so holding alpha at 1
REQUIRES an opaque bottom layer, which is exactly what leaves the old silhouette in the composite at
the end of each dissolve. Fading both removes the union but drops alpha to **0.750** at every
midpoint - a 25% translucency pulse on the whole figure. THE ALGEBRA FORCES A CHOICE. Union chosen on
area: the dip is 25% wrong over 100% of the figure, the union 100% wrong over 2.8% of it = **2.4x to
9x less wrong**, and it decays rather than pulsing. ***
*** AND A REACHABLE ACCESSIBILITY DEFECT, ALSO ADVERSARIAL. `reduced` was read ONCE in onMount with no
change listener, so a live OS toggle went stale BOTH ways (ON: reactions kept firing at someone who
asked them to stop; OFF: the hero never reacted again all session). And
**.hero-body[data-motion='win'][data-tier='epic'] at (0,3,0) OUTRANKED the reduced-motion reset at
(0,2,0)**, so the epic tier escaped the override - reproduced at 1.9s of hero-punch-epic with 27.5px
travel while the media query said reduce=true, with big and brace correctly stilled. MY OWN data-tier
WORK THIS SESSION WIDENED THAT HOLE. Fixed with a matchMedia change listener (which also drops any
in-flight reaction at once) and **!important on the reduced-motion resets**, so the override is
unconditional instead of a specificity race every future tier rule must remember to lose. Verified:
the same epic now gives 1 distinct transform and 0px travel under reduce, and recovers on toggle-off. ***
*** FIVE COMMENT NUMBERS DID NOT REPRODUCE, CORRECTED. "4.4 and 7.2 re-align every 39.6s" - **LCM is
79.2s**; 39.6s is where the sway sits at the OPPOSITE extreme. The banner block, which R126 wrote AS A
CORRECTION, gave the hero box as y280.5..695.1 (a MID-PUNCH TRANSFORMED rect quoted as the resting
box; it is y294.98..702.02, height 407.04 = BOX_H) and quoted one tier's coverage against another
tier's rect - its own two shares summed to 99.4, which cannot be a two-way partition. Re-derived per
tier, each summing to exactly 100.00: big rows 0..73 = 12.68%, mega 0..85 = 17.83%, epic 0..101 =
29.44%. Chest band carries **40.07%**, not 39.00% (that is rows 106..170, an off-by-one). ***
*** MY FIRST VERSION OF THE FIX WAS WRONG AND I CAUGHT IT BEFORE SHIPPING. It faded A out while B
faded in, which is symmetrical and WRONG: two stacked semi-transparent layers do not composite back
to solid. For a pixel opaque in both, source-over gives t+(1-t)^2, which **dips to 0.750 at t=0.5** -
the hero would have gone 25% TRANSPARENT 1.4 times a second, a brightness pulse traded for a tick,
exactly the swap R126 was burned by. Bottom layer solid gives 1.000 at every t. ***
**GHOSTING TESTED BEFORE THE CODE WAS WRITTEN:** union-solid-in-one-frame per pair is 5.4, 5.4,
**18.7**, 5.5, 5.4 percent; even the leg swap leaves **81.3% common**, so it reads as one robot with
a softened limb. Rendered at 0/25/50/75/100% and inspected.
**THE REACTIONS DELIBERATELY DO NOT GET IT:** steps(n, jump-none) + forwards means a layer one frame
ahead runs off the END of the sheet and the hero would fade to nothing at every reaction's close.

*** SECOND DEFECT FOUND AND FIXED: THE EPIC WIN STALLED FOR 21.1% OF ITS RUNTIME. holdFor() returns
1900ms and the body runs 1.9s, but the sheet was pinned to 1.5s and **NOTHING COULD OVERRIDE IT
BECAUSE data-tier WAS ONLY ON THE OUTER DIV** - no selector could reach the sheet element for epic at
all. From 1500 to 1900ms the sprite sat FROZEN on its final frame while the transform slid it around,
and since win frame 16 is 0.00% from idle rest, the frozen image is the REST pose. data-tier now on
both sheet layers; verified reaching -3090px at 1899ms where it previously froze at 1500ms. ***

**AUDIT RESULTS.** Viewports desktop/compact/portrait: no collisions, no overflow, paytable 10/10
images at all three, zero console errors. **Two apparent defects re-verified as NOT defects:** the
compact 31px close target is the whole stage scaled by S=0.703 (App.svelte:2669) and portrait
deliberately drops that transform to get a true 44px; and my first pass called the compact paytable
images broken when I had simply sampled before decode. **PORTRAIT HAS NO HERO AT ALL** (SceneGroup
mounts landscape-only), so every smoothness gain here is landscape-only. Paytable/guide clean, bolt
still turbo-only. Anticipation CSS measured VISIBLE: forcing it changes **54.9% of the reel grid**.

**MY ORPHAN SCAN WAS WRONG FIRST TIME TOO:** a literal "name.png" grep flagged ten files; matching
the bare STEM showed all but two are referenced through interpolated templates like
`ui/win/{tier === 'big' ? 'burst_big' : ...}.png`. Genuine orphans: **frames/frame-1.png 169,689 B,
frames/frame-2.png 95,245 B, ui/subtitle.png 15,872 B = 280,806 B**, and they DO ship (the theme's
frames/ is not in PRUNED_PREFIXES, which lists only the root-level assets/frames/). Listed, not
deleted.

**GAUGE: DOCUMENTED, NOT FREELANCED, exactly as the brief's fallback directs.** The allowed
"point at the already-correct asset" path needs ui/gauge_base.png to EXIST; it does not, and has zero
refs in src/. Committed face still carries **1,276 red pixels**; the owner's uncommitted face carries
**0**. Exact file, reason and restore command are in the R129 SESSION_REPORT section 7. Do NOT run the
asset pipeline first: manifest.json still exports the whole master over that filename.

**BUDGET, BOTH VIEWS:** local 25,876,271 B = 24.678 MB (headroom **338,129 B**); clean/CI 23,772,508 B
= 22.671 MB (headroom **2,441,892 B**). R129 added ZERO bytes of asset. **All 30 owner WIP rasters
verified byte-identical to the session-start sha256 fingerprint.**

**WOULD A REVIEWER STILL CALL IT TICKING?** Not in the way they did: the five hard cuts out of held
stills are gone and the worst pop is halved. But the honest answer is that the idle still steps - at
2.8% typically and 10.3% at the lurch - and a reviewer looking for it would find it. That residual is
an ART-DENSITY limit (six frames, one of them a duplicate, with one step carrying the whole lateral
range), not a playback bug, and it is now measured rather than guessed.

**STILL OPEN AFTER R129.** **AUDIO REMAINS THE ONLY LARGE PUBLICATION GAP** (four R125 stems absent,
hooks wired and silent, forge runnable, blocker is the Stability licence decision). The two-needle
gauge, owner's to land. Portrait has no hero. 280,806 B of shipped orphans. Max win still covers the
hero (ten sessions). **Nothing in CI measures animation smoothness, reduced-motion conformance, or
the endpoint behaviour of a one-shot** - and this session found two defects of exactly those kinds.

## 0Z. R128 - TOOK NOTHING AGAIN, AND FOUND THAT REDUCED MOTION NEVER WORKED FOR THE HERO

**Branch `claude/r128-anticipation-symbol-lobby`.** 44 runtime candidates, **none shipped**. The
output is a one-line fix to an accessibility defect live since R121.

**BOTH BUDGETS RECORDED, AS THE BRIEF REQUIRED.** local/working-tree 25,875,180 B = 24.676 MB,
headroom **339,220 B**; clean/CI committed 23,771,417 B = 22.670 MB, headroom **2,442,983 B**.
Planned against the local one. Unchanged after the session (339,207 B; 13-byte build-info drift).

**THE WIP MAP CAME BACK EMPTY AND THAT IS THE WHOLE STORY.** Not one candidate targets an existing
file - there is no anticipation raster, no cell glow, no symbol flash, no pip, no lobby tile anywhere
in the shipped theme. Zero WIP-clobber risk AND no existing consumer: the same fact twice.

*** THE DEFECT: THE HERO'S IDLE FLIPBOOK KEPT ANIMATING FOR PLAYERS WHO ASKED FOR REDUCED MOTION. ***
HeroIdle's reduced-motion block reset a BARE `.hero-idle` at (0,1,0) while the state rule is
`.hero-idle[data-motion='idle']` at (0,2,0). The bare reset LOST. **This is the identical specificity
bug R121 found and fixed for the transform layer, one layer down, and the comment explaining it sits
THREE LINES BELOW the broken selector.** It survived R121 through R127. Measured in a real
reduced-motion context: BEFORE, animation-name `hero-cycle-idle`, background-position-x cycling
-618/-1030/-206 over 3.2s, identical to no-preference. AFTER, animation-name `none`,
getAnimations `[]`, position frozen at `0px` = frame 01, the rest pose. **Negative control: a
no-preference context still animates, so normal motion is untouched. Cost: ZERO BYTES.**
Swept every prefers-reduced-motion block in src/ for the same pattern: 3 further matches, **all three
false positives** (App.svelte:2632-2633, GameGrid.svelte:1727-1731, SceneGroup.svelte:254 each
already handle their qualified variant). HeroIdle was the only genuine instance.

**REFUSED, ALL SIX CATEGORIES.** *anticipation glows* (230,510 B): the anticipation system is real
and rich - escalation, .col-focus tremble, brightness dim, per-cell .scatter-charge bloom+scanline -
but is **entirely CSS, zero url(), no <canvas>, zero drawImage**. Today's cell glow is a `filter:` on
.tile-inner, not an element. Orphan glows. *anticipation-spark 4f* (22,042 B): the ONE raster slot,
`.edge-spark` at GameGrid.svelte:1222-1223, takes a SINGLE static image rendered at **22x22**; a
4-frame strip needs sheet+steps() markup that does not exist, and 128px into 22px is 5.8x
oversampled. *symbol-life* (367,441 B): the cell is **120x100** and the candidates are 240x240
SQUARE; every existing symbol effect is CSS with zero url(); and **selected-cell-pulse has no
consumer that could EVER exist - a slot has no cell-selection mechanic**. *feature accents*
(115,666 B): FOUR have no consumer - the retrigger moment is a TEXT div, spinsRemaining is a NUMBER,
and there is no band element for a streak. **THE FIFTH DOES, AND I FIRST SAID IT DID NOT.** The
spark burst fits `.entry-shockwave` (FreeSpinsPresentation.svelte:516, 260px box scaling to 2.2,
peak draw 572px) as a ONE-LINE src edit touching no WIP. Measured there: SHARPER (edge 17.403 vs
the owner's WIP 13.149, +32%, the real payoff of 256px into a 4.5x upscale) but **33% DIMMER**
(energy 25.35 vs 37.58), and a BURST where the slot is an expanding RING. Refused on quality and
semantics, not absence. *lobby tile* (4,625,603 B): READY RESIDUALS per the brief. **A REAL SLOT
EXISTS AND I UNDERSTATED IT:** `assets/portal/` at the REPO ROOT is OUTSIDE the bundle, costs ZERO
runtime budget, and already ships tile_background.jpg at EXACTLY 1920x1080 (318,504 B) plus a
1200x1200 foreground - the 2048x1152 in WRS_MASTER_DOCUMENT.md:123 is the MASTER, not the delivery.
So the candidate matches the slot exactly and neither the budget nor the size objection applies.
Refused on measurement instead: **4.3x DARKER (mean lum 17.1 vs 73.8) with HALF the contrast (sd
31.0 vs 61.3)**, a subject-free dark workshop against a vivid neon street scene, and 7.4x the bytes
(2,370,569 PNG vs 318,504 JPEG) against a recorded BG+FG <= 3MB combined cap. The 800x800 cutout is
a downgrade from the 1200x1200 incumbent. The store tile is outward-facing and the owner's call. *reduced-motion stills* (2,343,948 B): **byte-identical to the
hero-masters R127 refused**, and after the fix the fallback already shows that exact pose - IoU
0.9998, XOR 0.02%.

**THE ART IS GOOD AND THAT IS NOT THE PROBLEM.** On-palette cyan/magenta, centre-open for three of
four symbol families (win-cell-crown-glow is the exception at centre alpha 9.85-19.19, max 255, with
side spikes reaching down a 120x100 cell). Everything was refused on CONSUMER and GEOMETRY, not
quality.

**THREE MID-SESSION SELF-CORRECTIONS, none of which changed a verdict but all of which would have
been wrong in the record.** (1) I reported the anticipation path had no raster at all, from a
`url(` grep returning zero - wrong instrument, the edge sparks are `<img src>`, not CSS `url()`.
(2) I reported the feature accents had no consumer; one of five does. (3) I reported the lobby
candidate was smaller than the incumbent, having compared it to a MASTER rather than the delivered
file it matches exactly.

**WS8 HONOURED: the gauge and particles were NOT touched.** R127's findings stand and remain the
owner's to land - committed gauge_face still has its baked needle (1,723 red px) so main still ships
two needles, and the owner's uncommitted particles still beat the committed ones in all four cases.
No WIP file was written; none of the 30 rasters was committed.

**STILL OPEN AFTER R128.** **AUDIO REMAINS THE BIGGEST PUBLICATION GAP** (four R125 stems absent,
hooks wired and silent, forge runnable, blocker is the Stability licence decision). The two-needle
gauge. The 24-frame win (+3,353,011 B). The R126 brace variant (+521,988 B, needs endpoints
anchored). Max win still covers the hero (nine sessions). **Nothing in CI measures reduced-motion
conformance**, hero animation, particle punch or gauge correctness - and this session is the proof of
what that costs.

## 0Y. R127 - TOOK NOTHING, AND FOUND THAT THE BUDGET MEANS TWO THINGS AND main SHIPS TWO NEEDLES

**Branch `claude/r127-parallel-support`.** 47 runtime candidates arrived; **none shipped**. Two
findings that were not in the brief are the session's real output.

*** THE 25MB BUDGET MEANS TWO DIFFERENT THINGS AND THEY DIFFER BY 2 MB. *** `npm run build` copies
frontend/public/** off DISK, so a LOCAL build measures the WORKING TREE; CI checks out the committed
tree and measures what a deploy from main ships. With 30 uncommitted rasters in the tree they are
different builds reporting different numbers for the same commit:
  CI / committed tree  23,771,355 B = 22.67 MB, headroom **2,443,045 B**
  local / working tree 25,875,171 B = 24.68 MB, headroom **339,229 B**
  gap +2,103,763 B, entirely the owner's WIP art (scene_car alone is +1,133,466)
Confirmed against CI run 32970759158 on ca3b4818 (`distSizeBytes: 23771355`), predicted from file
deltas to within 53 bytes. **Plan against the smaller number**, because the WIP is meant to land.
R126 quoted the local number without saying which tree; corrected here, not by rewriting R126. The
trap is now documented at DIST_BUDGET_BYTES in build_diet_verify.mjs.

*** A DEPLOY FROM main RENDERS THE OVERDRIVE METER WITH TWO NEEDLES, TODAY. *** Red-pixel test:
the COMMITTED gauge_face.png carries **1,723** strongly-red lit pixels (a baked needle and arc,
x 51..366, y 119..229 of 464x464); the owner's working-tree face and the candidate both carry **0**.
BonusInstrumentColumn.svelte:85-88 and FreeSpinsPresentation.svelte:513-514 then stack a separately
rotating gauge_needle.png on top. **ROOT CAUSE IN ONE SENTENCE: the pipeline has always produced the
right file and the engine has always read the wrong one.** manifest.json already declares the correct
split (match_transform 'rotate(62 512 512)' to out_only, master-minus-needle to
out_base: ui/gauge_base.png) and build.py:90 emits it - but gauge_base.png has ZERO references in
src/, is not on disk, and was once deleted as unreferenced, which cemented the bug. Verified
first-hand at design-system/masters/H2_master_v31.svg:75. **REGENERATION HAZARD: running the asset
pipeline re-bakes the needle over the owner's uncommitted fix.** An inert _doc_R127_HAZARD note was
added at that manifest entry. NOT FIXED here: the fix is committing the owner's art or regenerating
into a tree full of it, both the owner's call under a fence that forbids sweeping placeholders.

**REFUSED, ALL FIVE CATEGORIES.** *features glyph* (56,261 B): genuinely a grille/intake and not a
bolt, but **no consumer** - R125 closed the guide with a live capture and the live control draws an
inline SVG grille; taking it ships unreferenced art. *compact banner* (585,411 B): the banner is
**full stage width 1280px**, not compact; its only raster slots are c1-tier-burst, c1-shockwave and
c1-coin, so bars and streaks have nowhere to go, and the 256px blooms that DO have a slot are weaker
in it (mega 21.56 vs incumbent 42.23, epic 24.71 vs 70.77) and would upscale into a 430-540px draw.
*particles* (102,278 B): all four live targets are owner WIP, and judged at the size each is actually
DRAWN the candidates lose - coin is worse than the owner's WIP, and shock_ring, the ONE genuinely
upscaled sprite (drawn 440-704px from 128px), is **72% fainter** with no resolution gain. *gauge*
(378,250 B): exceeds the entire headroom alone, targets owner WIP, and fixes what the owner already
fixed. *hero masters* (2,343,948 B): reference only; no live still is missing, asset_reference_gate
PASSES.

**WORTH THE OWNER KNOWING: their uncommitted particles beat what is committed in all four cases** -
spark energy 13.74 committed vs 34.09 in the tree; smoke_puff 11.82 vs 31.45, where the committed one
has peak luminance 0.0 and is effectively a black smudge. Committing them improves what ships.

**WS7: THE PUNCH DOES NOT FIGHT THE 16-FRAME WIN.** 31 composed captures, punch ON vs forced OFF:
per-step change mean 6.871 vs 4.828 (the punch ADDS 42.3%) and spikiness 3.54 vs 4.23 (it is LESS
lurchy). R122's fighting signature is excursion up with per-sample change DOWN; this is the opposite.
It also fills the still moments between discrete frames: punch off, 8 of 30 sampled steps show
almost no change; punch on, none do. **Left exactly as it is.**

*** THIRD INSTRUMENT FAILURE IN THREE SESSIONS, CAUGHT BY A CONTROL. *** The first run of the WS7
measurement returned 0.00 for every metric and a confident conclusion. Captures were fine and
stepping worked; the ANALYSIS was broken - omitBackground gave no transparency because the stage
behind the hero is opaque, so alpha covered 100% of the clip and every mask was all-true. Re-run on
RGB with an explicit control. **Second time a mask has silently measured nothing. Always assert the
instrument can see a difference before trusting that it found none.**

**STILL OPEN AFTER R127.** **AUDIO IS THE BIGGEST PUBLICATION GAP**: the four R125 stems still do not
exist, hooks wired and silent, route verified runnable, blocker is the Stability licence decision.
The two-needle gauge. The 24-frame win (+3,353,011 B, fits neither budget). The R126 brace variant
(+521,988 B, fits the committed-tree headroom but not the working-tree one, and needs endpoints
anchored). Max win still covers the hero (eight sessions). Nothing in CI measures hero animation,
particle punch or gauge correctness.

## 0X. R126 - THE WIN IS SMOOTH AT BOTH ENDS NOW, AND AN ADVERSARIAL PASS IS WHY

**Branch `claude/r126-hero-inbetween`.** Package delivered 68 runtime frames as claimed. **One strip
of five shipped.**

**THREE DIRECTORY NAMES LIE AND THE CONTENTS ARE RIGHT.** win-unfold-16/ holds 24 frames,
feature-brace-12/ holds 16, idle-12/ holds 12. 24+16+12+8+8 = 68.

**THE DEFECT WAS ONLY EVER IN THE WIN AND IT IS TWO FRAMES WIDE.** Live win neighbour jumps
`[2.08, 12.06, 26.28, 1.66, 26.68, 11.99, 2.12]`: the arms snap open at f3->f4 and shut at f5->f6.
The live brace is `[1.54, 19.14, 18.86, 19.45, 19.29, 1.59]`, four even steps and no pop; the live
idle is one 18.74% cross-over where the weight shift swaps legs in a single frame.

*** I SHIPPED A NEW DEFECT AND AN ADVERSARIAL PASS CAUGHT IT. READ THIS ONE. *** My first pick was
14 frames evenly spaced, and it met every headline number: max jump 26.68% -> 18.63%, pairs above
20% and 25% both 2 -> 0. It was committed and pushed. **It had dropped source frames 2 and 23, the
ease-IN and ease-OUT.** That made the strip's first step 13.02% and its last 12.77%, against the
incumbent's 2.08% and 2.12% - and because frames now hold 107ms instead of 188ms, that is **11.0x
and 10.5x the RATE**. I removed two mid-gesture pops and introduced two ENDPOINT pops the incumbent
never had, at exactly the seam where the strip hands back to the idle. **Max-jump alone hid it
completely, because 13.02% is nowhere near the maximum.** When you optimise a summary statistic,
check the places the statistic cannot see.

**SHIPPED: hero_win_reaction_16f.png, 16 of 24 frames**, anchored on rest / ease-in / peak /
ease-out / rest. **Entry 0.93%, exit 0.53% - both GENTLER than the live strip's 2.08% / 2.12%.** Max
jump 18.63%, pairs above 20% and 25% both zero, mean 11.10%. Peak pose slightly BIGGER than live
(chest 137->193 becomes 126->194, adding an anticipation crouch). Identity IoU 1.0000, edge 0,
ground drift 0, f1==fN exactly 0.0000, 194/206 in the box, 0 dirty px under alpha 0. Cost
**+1,410,649 B**. **dist 24.68 MB of 25, headroom 1.67 MB -> 0.32 MB.** At 14 frames the anchoring
costs max-jump (21.75%, two pairs back above 20%); only at 16 does the strip get both ends AND the
middle, which is why the sheet grew.

**THE 24-FRAME VERSION IS THE BEST ART IN THE PACKAGE AND IS REFUSED ON BUDGET ALONE**: +3,353,011 B
against 1,749,883 of headroom. Affordable again if ~2 MB is freed.

**A MINIMAX PICK BEAT THE FULL 24-FRAME STRIP AND WAS THROWN AWAY ON PURPOSE.** 12 frames chosen to
minimise the worst jump reached 15.01%, better than 24 frames at 15.58%, for a third of the bytes.
Gaps `1,1,4,1,3,1,2,3,1,1,5`. `steps()` plays frames at UNIFORM intervals, so it would linger on the
wind-up and snap through the settle. **Spatial smoothness bought with temporal distortion is not
smoothness.**

**THREE OF MY INSTRUMENTS WERE WRONG AND CONTROLS CAUGHT TWO.** A lighting-only detector fired on
LIVE glance 6f, already shipping - threshold wrong, not art (shipped strips move RGB 4.13 to 49.54
between real poses). Recalibrated, NO strip has a lighting-only frame. A flat-cut detector reported
326px on the candidate and 190px on the live incumbent; scale-normalised, 24.3% vs 24.4% of canvas
height, the same straight body edge. The third, the frame-selection error above, was caught by
someone else.

**REFUSED, FOUR.** *idle 12f*: weaker, peak 3.89% against 10.23%, 38% of the amplitude, a shallow
double bob against one weight shift - smooth by REMOVING motion, undoing what R122 fought for.
*brace 16f*: **my first stated reason was FALSE and is corrected.** I claimed no affordable variant
improves it; a 10-frame pick of source `[1,2,4,6,7,9,11,12,14,16]` reaches max 15.64% against live
19.45% for +521,988 B. I had tested only linspace and gap-capped picks and generalised. It is
refused on true grounds: the live brace has NO pair above 20% so there is no pop to fix, it does not
fit beside the corrected win (339,231 B left, needs 521,988), and that counterexample itself has a
**12.79% exit step against live 1.59%** - the very defect above. *approval nod 8f*: all seven pairs
under 1%, peak 1.63% against the live glance's 1.64%, not acting. *feature ambient 8f*: peak 2.01%,
nowhere to live.

**FOUR STALE COMMENT BLOCKS CORRECTED.** The idle called a "five-frame breathe" with "steps(5)"
(six since R122) and 0.88s cadence in two places (0.73s). The "why the cut does not show" figures
were entirely stale: claimed 34-54% / 36-48% / 36.2% vs 48.3%; re-derived they are **0.00-10.23% /
5.36-18.74% / 0.00% exactly**. And the banner geometry was wrong in a findable way: the comment read
`top:310px` as the banner's TOP when `WinBanner.svelte:398-399` pairs it with `translateY(-50%)`, so
310 is the CENTRE. Measured live twice: banner y240..380, hero y280.5..695.1, covering hero rows
**0..100 of 407**. **71.1% of the shipped strip's motion falls BELOW the banner**, 28.3% behind it.

**PROVED IN THE RUNNING GAME**: 16 distinct `background-position-x` values, 0 to -3090px in exact
206px steps. Hold 1501ms. 60.4 fps. Zero console errors. Reduced motion genuinely skips the reaction.

**STILL OPEN AFTER R126.** The 24-frame win, on budget. **The brace's affordable improving variant**,
which needs its endpoints anchored the way the win's were. The idle's 18.74% cross-over snap, which
needs in-betweens of the LIVE weight shift rather than a smaller motion. **Nothing in CI measures
hero animation at all** - not smoothness, not frame count, and specifically not the endpoint steps
this session shipped and then had to fix. **Headroom is down to 339,231 B**; the next asset change of
any size needs something freed first. Max win still covers the hero (seven sessions).

## 0W. R125 - THE GUIDE'S LAST PAINTED ROW IS GONE, AND THE AUDIO PATH IS MAPPED

**Branch `claude/r125-features-audio`.**

**THE FEATURES GUIDE ROW IS CLOSED.** Seven of the eight Interface Guide rows named files
captured from the live control by `regen_interface_guide_icons.mjs`; the Features row named
`feature_button.png`, built by `build.py` from an SVG master. The size headers gave it away
before anything rendered: the captures are 200x200, that badge is 224x224. It had actually
drifted, too, showing an ornate chrome and magenta machine plate where the live control is
a dark-glass pill with a car-grille glyph. `.fm-entry-pill` now joins the regenerator's
targets as `btn_features.png`. New file rather than an overwrite, because
`feature_button.png` is one of the owner's 30 WIP rasters AND still renders as the buy
dialog header art. Nothing orphaned, nothing of the owner's touched, all 30 verified
byte-identical across the path-scoped stash.

**THE CAPTURE NEEDED A NEW FIT MODE AND TWO ATTEMPTS WERE MEASURABLY WRONG BEFORE THE
THIRD.** Pad-to-square is right for a round button and wrong for a 2.95:1 pill: it would
have rendered the word FEATURES at about 3.7px. Native-height fit at the old margin rule
drowned the pill (50% fill); at an 8px margin it clipped the drop shadow (333 pixels on the
bottom edge). Shipped at 450x200, 82.0% fill, zero pixels on any edge. No scale
special-casing was needed because 82.0% sits between `spin_button` at 84.0% and `btn_turbo`
at 76.0%, so at the shared 44px height it renders a control the same visible size as its
neighbours. Slot 117px, narrower than the speed row's 132px that is already proven.

**THE FEATURES CONTROL HAD NO PRESS ANYWHERE, AND NO HOVER IN THREE OF FOUR LAYOUTS.** The
one control that opens a dialog was the only utility control in the shell that did not
answer a press. Fixed across all four triggers in one rule per state.

**AN OPEN STATE WAS WRITTEN AND DELETED, AND THAT IS THE MORE USEFUL FINDING.** While the
menu is open the trigger is not on screen: desktop and compact cover it with an 82%-opaque
scrim, portrait draws the panel's own content across it, sampled at five points per layout.
The rule would have been dead wiring that reads in review as a shipped affordance. Removed,
with the measurement recorded in the stylesheet where the next person will look.

**FOUR SOUND CUES NOW HAVE HOOKS THAT FIRE AND STAY SILENT.** `feature_enter`,
`retrigger`, `feature_end` and `win_max` have permanent call sites. Availability is
DECLARED rather than discovered, because `audio_verify.mjs` asserts
`zeroSoundRequestFailures` and building these the ordinary way would fire four 404s a
session and turn a green gate red for cues that are only honestly absent. Proven with a
dev-only `__pendingCueTrace`: `fired > 0, played: 0`, with the entry overlay confirmed on
screen at t=711ms where the hook fires. **No audio was generated and no placeholder was
committed.**

**MAX WIN WAS NEVER SILENT, WHICH THE "FOUR MISSING STEMS" FRAMING HID.** The wincap
reveal has played the epic stinger and its 800ms echo deliberately since R5. It lacks a cue
of its own, not a cue. `playMaxWin()` falls back to exactly that, so turning the stem on is
an upgrade and can never introduce a silence.

**THE ACQUISITION ROUTE IS NOT A PURCHASE, IT IS A TOOL IN THIS REPOSITORY THAT RUNS ON
THIS MACHINE TODAY.** The twelve shipped stems came from `tools/audio_forge/` (Stable Audio
3 open weights, deterministic mastering, per-file model/seed/prompt logged). Verified: venv
present, torch 2.7.1 with MPS, `stable_audio_tools` imports, all three model repos already
in the local Hugging Face cache. `docs/audio/AUDIO_TRUTH_MAP.md` section 5.2 is the
step-by-step, down to which two lines wire each cue on.

**AND IT CARRIES A CEILING THAT SUCCESS TRIGGERS, WHICH THE OWNER SHOULD DECIDE ON
KNOWINGLY.** The Stability AI Community License grants royalty-free commercial use but
requires registration with Stability, and TERMINATES above USD $1,000,000 annual revenue
for the licensee or its affiliates, regardless of whether that revenue comes from the
generated material at all. For a game intended to earn, the trigger condition is the game
working. Truth map section 5.4 sets out what a licence-clean alternative must grant.

**STILL OPEN AFTER R125.** Four stems still do not exist, and nothing but a decision is
blocking them. Max win still covers the hero (`MaxWinCelebration` is a full-screen modal,
six sessions running). `interface_guide_icon_proof.mjs` still asserts only byte-uniqueness
and renders the rest for a human to eyeball, which is exactly why the Features mismatch
survived as long as it did; a real similarity assertion is well-scoped and unstarted. The
bought-max-win reveal still sounds different from the spun one (truth map 4.5).

## 0V. WHAT R124 CHANGED (review-critical closure) AND THE FOUR REFUSALS

*** THE WIN UNFOLD FINALLY HAS BOTH THE GESTURE AND THE CONTAINMENT. v3 is the strip R123 asked for:
v1's arm swing with v2's margins. mean 5.03% (FIRST to clear the >5% floor), path 35.18%, XOR/rest
30.63%, CHEST 137->193px (+56) against R123's +3px. Edge-safe (0 px alpha>8 in col 0/679, smallest
canvas margin 20px), identity 0.9998, f1==fN, ground drift 0px, residual 0. FITS THE HERO BOX: 193px
of 206 with 6px each side. Cost only +33,746 bytes - a same-size drop-in. dist 23.31 MB, headroom
1.69 MB. ***
The shipped curve, chest width per frame: 137 137 140 **193 193** 140 137 137, with the ground line
at 399 on ALL EIGHT frames.
**THE HERO NOW CHANGES POSE IN EVERY STATE THAT MATTERS** - idle weight shift (R122), win unfold
(R124), feature brace (R123).

### FOUR REFUSALS, EACH WITH THE MEASUREMENT THAT DECIDED IT

*** 1. FEATURES GLYPH - REFUSED ON A SEMANTIC COLLISION, NOT AESTHETICS. It is a LIGHTNING BOLT, and
the bolt is already TURBO's mark: `<path d="M13 2 4 14h6l-1 8 9-12h-6z"/>` in HudOverlay, and it
already appears THREE TIMES in the same interface guide as btn_turbo/btn_turbo_2/btn_turbo_3. It
would put one mark on two controls in one list. It also does not match the live FEATURES control,
which is a GRILLE (FeatureMenu.svelte:196-199) and is what DESIGN_SYSTEM.md sanctions.
THE RIGHT FIX NEEDS NO NEW ART: every other guide row is a screenshot-crop of the live control via
regen_interface_guide_icons.mjs. The Features row is the ONLY painted raster, which is exactly why it
is the only one that mismatches. Add `.fm-entry-pill` to that script's TARGETS. ***

*** 2. THE THREE TIER BARS (1920x240) - REFUSED ON GEOMETRY. They pass every content test: text-free,
no amounts, no multipliers, centre band only 3.2% opaque. THEN: THE LIVE BANNER TEXT PLATE IS ONLY
522x28 AT (379,488) and sits INSIDE the reels box. Scaled to that width the bar covers 72% OF THE
REELS; at stage width it covers hero 53%, SPIN 77%, BET 46%, BALANCE 47%, HUD panel 78%, reels 56%.
NO PLACEMENT FRAMES THE TEXT WITHOUT BURYING SOMETHING. ***

3. **THE THREE 640x360 OVERLAYS - REFUSED AS FILLER.** They would replace tier art R113/R115 measured
and placed so the three banner tiers read as three things, and whose contrast was already fixed
(max headline 8.41 -> 11.05:1). Candidates carry far LESS centre light than the incumbents
(strong-burst 0.0040 vs burst_big 0.1684) - safer for text but solving a problem that does not exist,
and less presence is a presentation regression. quiet-settle is 0.1% opaque, effectively invisible.

4. **BOTH OPTIONAL HERO EXTRAS - REFUSED AS LIGHTING-ONLY.** approval-nod mean 0.23%, chest +0px,
XOR 1.33% - **WEAKER THAN THE LIVE GLANCE (0.34%)**. feature-active-ambient mean 0.66%, chest +0px.
Their own QA reports 1.316% and 2.110% max with 1px chest deltas, so the numbers are not in dispute.
The feature-active window is already filled by the R122 weight-shift idle.

**ONE ASSET INTAKEN FROM A 42-FILE PACKAGE.** 16 gates green, 60fps p95 16.8ms zero long frames, zero
console errors, paytable unchanged and green.

### STILL OPEN AFTER R124
1. **The Features guide row** - fixable with no new art, see refusal 1.
2. **Audio stems** - feature entry, retrigger, feature end, max win. Owner supply, unchanged since R117.
3. **MAX WIN STILL COVERS THE HERO.** MaxWinCelebration is a full-screen modal, so no hero reaction
   can be seen during the biggest moment. **FIVE sessions running.** A layout decision, not art.
4. **Nothing in CI measures hero animation.** Every number in R121-R124 came from session scripts.

## 0U. WHAT R123 CHANGED (pose strips v2) AND THE ONE COMPROMISE IN IT

*** THE CANVAS-EDGE DEFECT IS FIXED. Zero pixels with alpha>8 in column 0 or 679 on EVERY frame of
both strips; smallest margin 36px. The supplier ADDED the test R122 asked for and now publishes
per-frame min/max opaque x (my figures differ by 1px only because I threshold at alpha>127). ***

**BOTH SHIPPED, packed at 0.58 like R122**, drop-in (frame counts and filenames unchanged, NO code
change): hero_win_reaction_8f.png 1,918,408 bytes (+419,131) and hero_feature_trigger_7f.png
1,686,780 (+190,042). Net +609,173. dist **23.27 MB of 25**, headroom 1.73 MB. Residual RGB under
alpha 0 = 0 (one of seven brace frames carried fringe; zeroed before AND after resample).

> **R140 NOTE, 2026-08-28.** Both reaction sheets named in this document are de-backticked
> as of this session, because neither exists at HEAD any more: R140 replaced
> hero_win_reaction_16f.png with a 32-frame sheet and hero_feature_trigger_7f.png with a
> 16-frame one, deleting both incumbents rather than keeping them alongside. Every figure
> recorded above is left exactly as it was written, because it was true when written; only
> the path citations are softened, which is the same treatment and the same reason as the
> R126 note below. The R140 replacements measure a mean adjacent-frame step of 6.913% (win)
> and 8.256% (brace) at render size, against the 11.098% and 13.312% recorded here.

> **R126 NOTE, 2026-08-26.** The win filename above is de-backticked because that file no
> longer exists: R126 replaced it with a 14-frame sheet, hero_win_reaction_14f.png. The R123
> numbers are left exactly as they were recorded, because they were true when written; only
> the path citation is softened so the doc-currency gate stops reading a historical statement
> as a live claim. See section 0X.

**THE FEATURE BRACE BEATS EVEN THE BROKEN v1** while being edge-safe: mean 5.75% (floor >4.0), path
34.52%, XOR/rest 33.40%, chest width 137->184 (+47px). Incumbent was 0.44% / 2.61% / 3.19% / +1px.
**13x the incumbent's motion.**

*** THE WIN STRIP IS SHIPPED BELOW ITS STATED FLOOR, DELIBERATELY AND ON THE RECORD: mean 3.25%
against a >5% floor. THEY BOUGHT CONTAINMENT BY SHRINKING THE GESTURE - their own note says
"re-rendered with compact arm gestures". Chest width moves +3px where v1 moved +68px, and the
silhouette AREA change is EXACTLY 0 (the arms rearrange within the same envelope). Shipped anyway
because it is 10x the incumbent by path length, 6x by XOR-vs-rest, edge-safe, identity 0.9998, and at
true render size the arms visibly uncross. Leaving a lighting-only incumbent that moves the chest by
ONE PIXEL, to honour a metric I wrote myself, was the worse outcome. Reverts with one git checkout. ***

**METRIC CAUTION CARRIED FROM R122:** mean-change-per-consecutive-pair is DILUTED BY FRAME COUNT. v2
win has 8 frames; the same path over 6 would read 4.55%. Use PATH LENGTH to compare strips of
different lengths.

**BANNER OCCLUSION IMPROVED AS A SIDE EFFECT, and the reason is structural:** the incumbent's
"motion" was visor and chest-lamp GLOW concentrated in the head band, which is exactly what the
banner covers. A pose change puts motion in the torso. win hidden 86.0% -> 71.3% (visible 14.0% ->
**28.7%**, head band 63.0% -> 27.1%, chest 28.9% -> 54.9%); feature hidden 83.3% -> 77.5%.
**NO BOX CLIPPING:** max rendered width 159px (win) / 184px (feature) against the 206px .char-layer.

*** INSTRUMENT FAILURE THAT SUPERSEDES EARLIER NUMBERS: AN ELEMENT SCREENSHOT CAPTURES WHATEVER IS
PAINTED OVER THAT BOX, NOT JUST THE ELEMENT. Measuring the win reaction in-browser returned the
hero's box as FULLY OPAQUE - 83,842 px, identical every frame - because the win banner paints across
it. Three attempts to hide the offending elements by NAME failed (the selector list was a guess); a
visibility-based isolation removed the right elements but the capture stayed opaque because that
probe lacked the background-transparency rules its sibling had. THE FIX WAS TO STOP CAPTURING:
banner occlusion and box fit are deterministic functions of the shipped sheets plus geometry already
written down. **R122's 45.0% banner figure came from the same contaminated route and is superseded
by section 4 of the R123 report.** ***

### STILL OPEN
1. **The win gesture is a compromise.** v1 proved the wide unfold is renderable; v2 proved the
   containment is renderable; NOTHING HAS PROVED BOTH AT ONCE. Ask for v3 of the win strip only:
   v1's arm swing with v2's margins. There is room - v2's widest frame leaves 36px each side and v1
   needed about 90px more than it had.
2. **Max win still has no reaction** and cannot usefully have one while MaxWinCelebration is a
   full-screen modal over the hero. FOUR sessions running.
3. **Nothing in CI measures hero animation.** Every number in R121-R123 came from session scripts; a
   regression would not be caught.

## 0T. WHAT R122 CHANGED (pose-changing strip intake) AND WHY TWO OF THREE WERE REFUSED

**SHIPPED: `hero_crossed_idle_6f.png`** - 6 frames, packed at **0.58** common scale, 394x780/frame,
1,402,693 bytes replacing a 2,087,774-byte sheet: **net -685,081 bytes**. dist 23.47 -> **22.69 MB**,
headroom **2.31 MB**, better than the session started with.
THE IDLE FINALLY CHANGES POSE: planted-foot lateral weight shift, arms staying crossed. Silhouette
motion 0.278% (R120) -> 1.007% (R121 transform workaround) -> **1.866%** (shipped).

*** REFUSED, AND NOT ON A METRIC: `win-reaction-unfold` and `feature-brace` HAVE THE HERO'S ARMS CUT
OFF BY THE EDGE OF THEIR OWN 680x1344 CANVAS. Fully opaque pixels lying in the first/last column:
win frame 3 = 192px (y336-527), frame 4 = 176px (y346-534), frame 5 = 33px right, frame 6 = 24px
right; feature-brace frame 4 = 51px left AND 56px right (y531-631). A 192px run of solid material
flat against the boundary is a SEVERED LIMB - confirmed at 2x zoom, the forearm's tube ends in a hard
vertical cut. At render scale that is a ~58px flat edge on a 407px figure at stage x=22, against the
scene. THE PIXELS DO NOT EXIST IN THE SOURCE: packing cannot restore them, and insetting only moves
the amputation inboard, which is worse. idle-weight-shift is clear of both edges on all 6 frames. ***

*** THE PACKAGE'S OWN QA CANNOT SEE THIS. Its suite tests identity, first-frame-equals-last,
ground-line stability and silhouette change - ALL FOUR PASS on both broken strips. EDGE CONTACT IS
NOT AMONG THE THINGS IT LOOKS AT. Add to any future strip spec: for every frame, the count of pixels
with alpha > 8 in column 0 and in the last column must be ZERO. ***

**THE PACKAGE'S NUMBERS ARE SOUND, THE CONVENTION DIFFERS.** They report idle 10.742 / win 23.194 /
feature 24.599; I measured 8.13 / 9.17 / 9.60 as maxima. Reproduced their figures to within 0.7%:
they use **MAX XOR against the REST frame normalised by BODY pixels**; R121's floors were **MEAN
change between CONSECUTIVE frames normalised by FRAME area**. Both legitimate, not interchangeable,
theirs the more generous. Frame-count-independent path length: LIVE idle 2.05 / win 2.28 / energy
2.61 vs NEW idle 16.89 / win 28.48 / feature 32.35 - all three carry 8x-12x the motion.

**POSE-CHANGE TEST WORTH KEEPING:** crossed arms sit inside the torso, unfolded arms extend, so
CHEST-BAND SILHOUETTE WIDTH answers "does the pose change" directly. LIVE win 137->138px (+1px
across the whole reaction). NEW unfold 137->205px (+68px). NEW brace 137->203px (+66px). NEW idle
137->137 (+0, correct - arms stay crossed).

**SANITATION: ZERO RGB UNDER ALPHA 0 BOTH BEFORE *AND AFTER* THE RESAMPLE.** Before-only left a
residual of 18 - a windowed-sinc resampler mixes opaque neighbours into pixels that end up
transparent. The shipped sheet measures 0.

**PACKING SCALE IS NOW A MEASURED CHOICE, NOT A HABIT.** R117 used 0.70; this ships 0.58. Rendering
one master down to each realistic target, mean absolute error out of 255: at 206x407 (1x stage)
0.70/0.58/0.50 give 0.0020/0.0023/0.0028; at 618x1221 (a 1.5x stage on a 2x display)
0.0093/0.0140/0.0179. ALL are two orders of magnitude below visibility. **Source scale above 0.50
buys nothing for this hero.**

**THE R121 TRANSFORM WAS RETUNED, MEASURED:** a lateral rotation on top of a lateral weight shift is
the R115 double-bob on a different axis. new strip alone 1.525%/4.350%/13.29px; + full R121 sway
(1.05deg) 1.545%/7.025%/18.74px (per-sample silhouette FELL while excursion climbed - two motions
cancelling at some phases, stacking at others); **+ 0.32deg de-loop (SHIPPED) 1.866%/4.813%/14.99px**
- all three rise together. Kept, not removed, because the strip is a 6-frame loop on 4.4s and a 7.2s
rotation beats against it so the loop never lands the same way twice. Its job is now DE-LOOPING.

**MY OWN INSTRUMENT FAULTS:** (1) I stepped the TRANSFORM animation and left the FLIPBOOK running
free - they live on different elements (.hero-body vs .hero-idle) and BOTH must be paused and
stepped together; (2) my chest-width metric had a CEILING at the 206px capture box, so an overflowing
figure read as exactly 206.0 regardless of pose - an implausibly round number is what led me to check
the source canvas and find the severed limbs.

### THE RE-RENDER REQUEST
Both refused strips, same performance, arms inside the frame: **no opaque pixel touching column 0 or
the last column on any frame**. Everything else about them is already correct (identity IoU 0.9930,
f1==fN, ground drift 0px, 12x the incumbent motion) and must not change.

## 0S. WHAT R121 CHANGED (hero animation quality) AND THE FINDING THAT DECIDED IT

*** THE FACTORY HERO STRIPS CANNOT MOVE HIM, AND IT IS MEASURED. Silhouette change per frame pair,
at RENDER size (206x407): live idle 0.51%, win 0.33%, energy 0.44%, glance 0.34%; and all TEN
factory strips between 0.112% and 0.435%. They animate visor glow, chest lamps and ground bloom on
an IMMUTABLE POSE. The factory's own QA_PHASE.md says it: "Crossed arms, crossed-leg stance, hand
identity, and 680x1344 registration remain locked." THE BEST CANDIDATE (0.435%) IS ALREADY SHIPPED
and the live idle (0.51%) already beats every one of them. There was nothing to buy. ***

**ALL FOUR OF THE BRIEF'S PRIORITY CANDIDATES REFUSED ON ITS OWN RULE** ("refuse weaker-than-
incumbent strips"): 09-power-surge 0.397% (weaker than live energy 0.44%), 02-epic-win 0.325%
(already live), 08-approval-nod 0.173%, 01-max-win 0.434% (and still behind a full-screen modal -
now refused for the FOURTH session, on two independent grounds).

**THE FIX IS A TRANSFORM LAYER, ZERO NEW BYTES.** `.hero-body` wraps `.hero-idle`; the flipbook
plays untouched inside it while the wrapper moves the whole figure about its FEET.
MEASURED ON THE SHIPPED BUILD: silhouette motion 0.278% -> 1.007% (3.6x), excursion 0.646% ->
4.121% (6.4x), **head travel 1.29px -> 12.61px (9.8x)**. Feet stay pin-sharp.
Idle is ROTATION ONLY - no translateY - because R111 shipped a whole-body bob on top of the
breathing flipbook and R115 removed it as a double bob. Sway period 7.2s against the flipbook's
4.4s so they only re-align every 39.6s and never read as a metronome.

*** WORKSTREAM 4 CORRECTED MY OWN FIRST ATTEMPT. The win punch was rotation-led like the sway.
The banner mounts at stage top:310 over a hero at stage y295..702, so it covers HIS OWN ROWS
15..185. A rotation about the feet displaces each row IN PROPORTION TO ITS HEIGHT, so it is
head-weighted by construction: 77.1% of the reaction's motion was in the head band and only 29.5%
was visible. Rewritten TRANSLATION-LED, because a translation displaces every row EQUALLY:
hidden 70.5% -> 52.4%, visible 29.5% -> 47.6%, head band 77.1% -> 26.3%. Peak at 180ms, inside the
banner's own 0.6s entry. Ground line 400 -> 386 -> 400: a 15px hop that returns exactly. ***

**EPIC-CLASS WINS GET A BIGGER PUNCH** (27px / 1.9s vs 15px / 1.5s), keyed off EPIC_WIN_THRESHOLD.
No strip could deliver "a stronger epic reaction"; a larger transform costs nothing.

**SHIPPED MATRIX** (MutationObserver on data-motion, installed before the spin): dead time = sway +
glance at 21.3s; small win (<10x) = NO reaction; 16.2x = win/big 1504ms; 135.6x = win/epic 1902ms;
feature entry = energy 1302ms; reduced motion = animation-name none, transform none.
60fps, p95 16.8ms, ZERO frames over 20ms in 194 samples. dist 23.35 MB of 25, CSS only.

*** TWO BUGS I INTRODUCED, BOTH CAUGHT BY MEASURING:
 1. REDUCED MOTION WAS SILENTLY STILL ANIMATING. The state rules are
    `.hero-body[data-motion='idle']` = specificity (0,2,0); my reset was a bare `.hero-body` =
    (0,1,0) and LOST. The users who ask for less motion were the ones still getting it. A
    reduced-motion reset MUST match or beat the specificity of what it overrides.
 2. THE EPIC PUNCH WAS TRUNCATED AT 79%. Its curve is 1900ms but react() held the state for
    DURATION_MS['win'] = 1500ms, so data-motion flipped mid-curve and the figure SNAPPED from
    -6px to the idle sway. Found by timing the observed sequence against the CSS. ***

### THE REMAINING GAP IS A RENDERING GAP, NOT A CODE GAP - EXACT ART REQUEST

A transform moves the figure; it cannot change what the figure is DOING. The arms stay crossed in
every frame of every state. New renders needed, each holding the existing bar (identity IoU >0.95
vs the live rest frame, opaque-core ground drift 0px, f1==fN, RGB zeroed under alpha 0):
1. **A win reaction THAT CHANGES THE POSE** - arms unfolding to a fist-pump, returning to crossed.
   Target silhouette change **>5%** per frame pair against today's 0.33%.
2. **An idle with a real weight shift** - stance moving, not lighting. >2%.
3. **A feature brace where the stance widens.** >4%.
4. **Max-win stays pointless** until MaxWinCelebration stops being a full-screen modal over him.
The measurement script IS the acceptance test: point it at a frames/ directory and it reports
silhouette change per frame pair at render size.

## 0R. WHAT R120 CHANGED (the neighbour consistency pass) AND WHAT IT CORRECTED IN R119

**THE SHELL IS NOW ONE TOKEN LAYER FOR THE WHOLE STAGE.** The ten `--hud-*` tokens moved from
HudOverlay's four roots to `.game-wrapper` in `App.svelte`, so the paytable modal, the FEATURES bar
and the feature instrument column inherit them. Only the Overdrive accent flip stays HUD-scoped.
Proven a visual no-op on the HUD: **75 differing pixels across all ten control boxes, ZERO in
BALANCE / WIN / BET / SPIN / AUTO / steppers.**

*** THEY CANNOT LIVE ON `:root`, AND THE FAILURE IS SILENT. `--theme-primary` is declared on
`.game-wrapper`, and a custom property is substituted WHERE IT IS DECLARED, not where it is used.
`--hud-accent: var(--theme-primary, #00FFFF)` on `:root` resolves against an html element with no
`--theme-primary`, FREEZES AT THE FALLBACK and inherits that everywhere - the accent stops
following the palette. It is invisible because the fallback IS the current theme's cyan. MEASURED
in a browser with --theme-primary:#FF0000 -> `:root` gave rgb(0,255,255), `.game-wrapper` gave
rgb(255,0,0). ALWAYS TEST A TOKEN HOIST; the default theme will hide the bug. ***

**R119'S OWN RECORDED REASON WAS WRONG AND IS CORRECTED.** `HUD_SHELL_TEMPLATE.md` said `:root` was
avoided because "Svelte ... strips" an unmatched selector. Compiling `:root { --token: ... }` with
the project's OWN Svelte 5.53.0 shows it is neither scoped nor stripped and svelte-check raises
nothing. Right placement, wrong mechanism; the doc now carries both.

### WHAT WAS RESTYLED

**FEATURES: there are FOUR triggers, not one.** `.fm-entry-pill` (desktop), `.p-fm-entry`
(portrait), `.c-fm-entry` (compact), `.m-fm-entry` (mini). **The mini one is absent from
FeatureMenu's own token block**, so no `--sig-*` resolved on it and it used raw `#FF00FF` where the
others use `#ff2ec4`. All four: magenta border + 12px outer glow + 10px inset glow + magenta text
-> hairline + dark glass + near-white. OVERBOOST keeps a WARM signal deliberately: it is a COST
state, not decoration. Grille glyph, 44px floor and every handler preserved.

**INSTRUMENT COLUMN:** plate bezel (magenta->cyan->magenta gradient under a 7px magenta bloom) ->
neutral hairline; face -> sunken glass; rail (cyan->magenta + glow) -> neutral; desktop value
(gold #ffd54a + 10px glow) and the three portrait values (pink/cyan/gold, each glowing) -> one
near-white. FUNCTION UNTOUCHED, and worth recording: **the gauge NEEDLE is functional**
(`needleDeg = -110 + clamp01((multiplier-1)/15)*220`), **the dial behind it is ornament**.

**PAYTABLE:** its OWN COPY of the six-stop metal `.fs-plate` -> the shell (superseding R119's
scoping note in `CHROME_PRIMITIVES.md`); panel `--sig` gold -> the one accent; title gold-to-orange
gradient-clipped text -> near-white; headings, dividers, ways callout, ways diagram, knob bezel and
the guide rows all -> the shell. Content model untouched.

*** TWO LATENT DEFECTS FIXED IN PASSING: (1) the paytable TITLE was `background-clip:text` +
`-webkit-text-fill-color:transparent` WITH NO FALLBACK COLOUR - if the clip ever failed the word
PAYTABLE rendered INVISIBLE. (2) the CLOSE button was 38x38, under this project's own 44px floor;
HUD_SPEC rule 3 scopes to the HUD banner so the modal never came under it and NO GATE MEASURES IT.
Now 44x44. ***

### WS5: THE INTERFACE GUIDE WAS FIXED, NOT BLOCKED - R119'S RESIDUAL IS CLOSED

*** THE GUARD'S REFUSAL SET AND THE REGENERATOR'S WRITE SET ARE COMPLETELY DISJOINT. asset_guard
refuses on 30 tracked rasters under OUTPUT_ROOT; `regen_interface_guide_icons.mjs` writes exactly
NINE files and all nine were CLEAN. So the guard was satisfied LEGITIMATELY, not bypassed: stage
own work -> `git stash push --` the 30 raster paths only -> confirm OUTPUT_ROOT dirty count is 0 ->
run (the guard runs and PASSES) -> confirm exactly 9 files changed -> `git stash pop` -> verify all
30 byte-identical. ALLOW_ASSETS_OVERWRITE was never set and `asset_guard.py --self-test` passes. ***
**`feature_button.png` is a guide row that this script can NEVER refresh**: it is manifest-driven
from an SVG master via `build.py`, not screenshotted, and is also one of the 30 owner rasters.

### STILL OPEN AFTER R120

1. **The gauge dial is untouched and unjudgeable locally.** `gauge_face.png` and `gauge_needle.png`
   are both owner WIP, and HEAD vs worktree are not the same picture: HEAD is a ROUND chrome dial
   **with a red needle baked into the face** (the documented two-needle defect), worktree is a
   SQUARE carbon dial, baked needle angles 34 degrees apart.
2. **No `:active` or open state on ANY of the four FEATURES triggers**; `aria-expanded` is bound but
   nothing keys off it. Portrait, compact and mini have NO hover feedback at all, and quieting the
   resting glow removed the only affordance signal they had.
3. **The mini FEATURES trigger draws a different glyph** (three-bar mixer, not the grille).
4. **The mini-player HUD is outside the Overdrive accent flip.** Predates R119.
5. **`.fs-heading` carries inline `style="margin-bottom:..."` at all eight use sites**, three
   different values, none in the stylesheet.
6. **Nothing measures any of it**: no gate checks paytable touch targets, guide freshness against
   live chrome, or value legibility anywhere.

## 0Q. WHAT R119 CHANGED (the operator-standard HUD shell) AND WHAT IT LEFT OPEN

**THE HUD IS NOW A SHELL WITH A TOKEN LAYER.** Ten `--hud-*` tokens declared ONCE on
`.fs-hud, .p-hud, .c-hud, .m-hud` plus one accent flip for Overdrive. Declared on four roots
rather than `:root` because Svelte strips a scoped selector matching nothing and
`typecheck_baseline` fails on ANY rise in unused-selector warnings. Colour literals in
`HudOverlay.svelte`: **155 hex to 89**.

*** THERE ARE FOUR HUD LAYOUTS, NOT THREE. One {#if} chain: portrait :420, mini-player :588,
compact-landscape :698, desktop :849. `docs/HUD_SPEC.md` locks ONLY the fourth. `portrait` is
an ASPECT test (innerHeight > innerWidth), NOT a width breakpoint. A pass that edits only
`.fs-*` leaves three quarters of the player-facing HUD untouched. ***

**THE ACCENT DISCIPLINE, which is the reusable part.** Chrome at rest is neutral. The accent
is spent in exactly three places: SPIN, a live win, and active toggles. Before, three adjacent
plates carried three different neon rails (balance cyan, win magenta, bet gold) and the three
live values were three differently tinted whites. Spec: `docs/design/HUD_SHELL_TEMPLATE.md`.

**ZERO GEOMETRY MOVED.** `hud_banner_spec_check.mjs` re-measured: all seven gaps exactly 16px,
AUTO tangent to SPIN at 0, touch targets 82x82/48x48/44x44/44x52/84x84/48x48, autofit stress
asserts pass at $1,234,567.89 and $1,000,000.00. **No `font-size` was touched anywhere**,
which is what keeps autofit alive (the fitters rewrite it through `--autofit-scale`).

*** THE NUMBER NOBODY WAS LOOKING FOR: `turbo_intensity_gate` was passing at **1.253:1
against a 1.250:1 floor** - THREE THOUSANDTHS of margin, one rounding from a red CI run.
Measured by reverting the file, rebuilding and re-running. After the restyle it passes at
**1.292:1**, and the turbo-to-super step goes from 1.50-1.75 to 2.20-2.42, because an accent
escalating out of dark glass has more headroom than amber escalating out of amber. ***

**THE COMMITTED BANNER PAIR WAS KEPT.** `hud_banner.png` (63,873 bytes, the R105 pair) was
the TOPMOST panel layer painted over the glass; with dark plates its metal struts read as
debris between them. ONE line moves the glass above it. Asset, reference, guard coverage and
budget line all untouched.

### GATE MAP CORRECTIONS (read every gate this session)

*** `hud_banner_spec_check.mjs` IS NOT IN CI. Neither are `hud_reskin_proof.mjs`,
`interface_guide_icon_proof.mjs`, `hud_naming_uniformity_check.mjs` or
`hud_reel_size_check.mjs`. The geometry lock is real and documented and NOTHING RUNS IT
AUTOMATICALLY. ***
**Exactly ONE CI-blocking gate can be broken by a HUD restyle: `turbo_intensity_gate.mjs`.**
**Only TWO CI legs render the non-desktop layouts at all:** `layout_fit` and `turbo_intensity`.

### BLOCKED, WITH EXACT EVIDENCE

*** THE IN-GAME INTERFACE GUIDE IS NOW STALE. Eight shipped PNGs are screenshot-crops of the
LIVE controls, rendered by `PaytableModal.svelte`. `regen_interface_guide_icons.mjs` is
refused by `asset_guard.py --require-clean` because 30 tracked rasters under
`frontend/public/assets/themes/future-spinner` differ from HEAD (owner WIP). The only override
is `ALLOW_ASSETS_OVERWRITE=1` and "do not weaken asset guards" was in the R119 fence, so it was
NOT run. The bypass would very likely have been safe - the regenerator writes exactly nine
filenames and all nine are tracked and clean - but that is the exact reasoning the guard exists
to refuse. REMEDY, once the tree is clean: `node frontend/scripts/regen_interface_guide_icons.mjs`.
NOT a CI failure: `interface_guide_icon_proof` is not in CI and asserts only byte-uniqueness. ***

### THE BRIEF CONTRADICTED THE PROJECT'S OWN DESIGN LAW

`design-system/DESIGN_SYSTEM.md` states the material language is "polished chrome, brushed
gunmetal, warm gold accents" - exactly what R119 removes from the HUD. Resolved in the brief's
favour (it is the live owner instruction and explicitly a pivot), and **both documents amended
in the same commit rather than left to drift**: DESIGN_SYSTEM's material law now scopes to the
GAME WORLD; its "exactly two themed accents" law is marked superseded and was ALREADY stale
(it specifies turbocharger art with flames on TURBO, which FS VISUAL FIXPACK JOB 2 had already
replaced with the measured intensity escalation); `docs/design/CHROME_PRIMITIVES.md` is scoped
so its `.fs-` metal primitives remain canonical for the PAYTABLE only.

### STILL OPEN AFTER R119

1. **Three neighbouring surfaces now look loud beside the shell** and are each a token
   re-point, not a rewrite: `BonusInstrumentColumn.svelte` (magenta borders + gold values,
   sits directly beside the bar in every feature frame), `FeatureMenu.svelte` (the magenta
   FEATURES button), `PaytableModal.svelte` (its own copy of the metal `.fs-plate`).
2. **A pre-existing dead control**: the mini-player's AUTOPLAY menu item calls
   `toggleAutoMenu()` but the mini branch renders no `{#if showAutoMenu}` block, so it mounts
   nothing.
3. **`panel_balance.png` and `panel_win.png` ship with ZERO consumers** (~37 KB), plus seven
   dead `themeStore.ts` button keys.
4. **No gate measures HUD value legibility.** `contrast_gate` covers two portrait
   FEATURES-bar nodes only.

## 0P. WHAT R118 CHANGED (the perimeter tone-down) AND WHAT IT FOUND INSTEAD

**THE PERIMETER IS TONED, WITH A MEASURED ANCHOR.** Held opacity 0.75 to **0.50** in
frontend/src/App.svelte. R115 chose 0.75 by judgement and the archive says so outright, so there was
no measured incumbent to defend. The anchor used instead is the brief's own requirement that the
reels stay primary: **the perimeter band's mean relative luminance as a multiple of the reels'.** It
was **2.54x** at 0.75 and is **1.44x** at 0.50. Below about 0.35 it reaches parity with the reels and
stops reading as an energised edge, which is the floor.

**CLOSED BY R131, 2026-08-27: THE PERIMETER NO LONGER EXISTS.** The owner ruled the feature
border out for overlapping the hero and the car and making the stage too busy, so the element,
its CSS, both keyframes and the JavaScript settle state were all removed together and the raster
was pruned from the bundle. Everything below this line is therefore a DATED RECORD of tuning an
element that has since been deleted, kept because it is the evidence for why deleting it was the
answer: R118 had already taken the held opacity from 0.75 to 0.50 on measurement and the stage was
still too busy. **The symbol names below no longer resolve in `App.svelte` and are not meant to.**

**THREE DECLARATIONS HARD-CODED 0.75** (App.svelte:2601 enter-end, :2604 settle-start, :2609 the
reduced-motion branch **that no gate exercises**). All three moved together. **The 1.6s settle had a
JavaScript twin at App.svelte:586, 1600 ms** - the two had to stay equal or the element unmounted
mid-fade, so the duration was left alone. The settle FILTER
(`brightness(0.64) saturate(0.21)`) was also left alone because R115 genuinely measured it from the
kit's own settle accent, and that measurement was independently reproduced this session.

**ENTRY KEEPS ITS OLD STRENGTH.** The in-animation now blooms to 0.75 at its 45% keyframe and relaxes
to 0.50. Verified per animation frame: peak 0.746 at t=446ms, exactly 0.500 by t=926ms. Settle
verified at 1590ms, 0.500 to 0.017, then unmount.

**CLEARANCE, on HEAD art (the working-tree car is NOT HEAD's: silhouette IoU 0.6772, +0.0575 body
luminance, so HEAD's car was swapped into `dist` only and the owner's WIP raster never touched):**
hero wash cut **45.3%**, hero edge separation **-4.31% to -1.78%**; car wash cut 43.8% and the car
**gains** from the perimeter (+2.97% to +2.73%) because the ring lights the ground around it more
than the car itself.

**THE REELS WERE NEVER TOUCHED BY THE PERIMETER. Not reduced - exactly zero**, on both the raster and
the render. 100% of its light falls outside the `.game-frame` box. Its light dies completely beyond
90 stage px from the edge, with 48.9% of it in the 16-40px core.

**VIEWPORTS: 52.5-53.1% reduction at every landscape scale** (1920x1080, 1280x720, 1024x576,
800x450). At **mini-player 400x225 all four edges fall outside the screen** so it was never visible
there. **Portrait has no hero and no car** - `SceneGroup` is mounted only when `!portrait`, and
`portrait` is a pure aspect test (`innerHeight > innerWidth`), not a width breakpoint - so hero/car
clearance is a **landscape-only** question. Contrary to prediction, the perimeter IS visible in
portrait: 4.69% of a 390x844 screen, measured at page level.

### THE OPEN ITEM R118 RAISES AND DID NOT ACT ON

**THE PERIMETER IS THE ONLY OVERDRIVE LAYER WITH NO ROUTE COLOURWAY.** It takes only
`class:settling` - no `route-natural`, no `nitro-active` - so it stays teal-cyan (alpha-weighted RGB
36,87,103 over the hero box) while the default `natural` feature goes green and `nitro` goes deep
pink. **Dimming cannot fix a hue mismatch.** This is the strongest single explanation for the
perimeter reading as stuck on, and the fix is one class binding plus one filter rule mirroring
`.game-frame`. **Recommended as the next change.** Not done in R118 because the brief asked for a
tone-down, not a re-colour.

**THE TWO LARGEST FEATURE LAYERS ARE NOT THE PERIMETER.** (a) The entire 100vw x 100vh backdrop takes
`hue-rotate(-95deg) saturate(1.15)` on the default route, a measured -80.3 degree mean hue swing
behind the hero (App.svelte:3023-3025); by area this is the biggest change in the feature. **No
Overdrive backdrop route ADDS light - all three are darker than base** - so an "overbearing" reading
is a colour effect, not a brightness one. (b) The `.game-frame` pulse hue-rotates 185/280/305 degrees
and saturates 1.3-1.7x over 43.9% of its overlap with the car box, animated on a 3s loop
(App.svelte:3176-3205).

### GAPS CONFIRMED BY READING EVERY GATE

**NO GATE ANYWHERE MEASURES THE HERO OR THE CAR FOR LEGIBILITY, IN ANY STATE.** Every hero and car
change since R110 is unprotected against regression. Related: `money_fit_gate.mjs` is the **only** CI
gate that reaches a state where the perimeter exists at all; the retrigger gate drives the feature on
the **replay** route, where `ReplayMode` renders instead of the game tree and the perimeter does not
exist. `smallscreen_composition_gate.mjs` exists but **is not wired into CI**.

## 0B. WHAT R105 CHANGED (the runtime-true kit)

**THE BANNER PAIR IS COMMITTED.** Raster and CSS landed together, which is the only CI-safe
way either half could land: `asset_reference_gate.mjs` requires every referenced asset to exist
in dist, `build_diet_verify.mjs` fails any 404. Verified safe first: the path
`assets/themes/future-spinner/ui/` is not in PRUNED_PREFIXES and not under the fully-pruned
`assets/ui/` that KEEP_UI guards, 63,873 bytes against a 25 MB budget, and no CI gate measures
`.fs-panel`. **The six new finalists did not beat the placed one**, so no re-swap: it still wins
on accent neutrality at 2.98% cyan+magenta against 3.5% to 20.5%.

**FX-01 IS CLOSED IN ART.** The holo flicker sheet arrived at 1536x256, six frames of 256x256,
which is a **uniform 1.28x downscale to the required 1200x200 in six 200x200 frames, 0.00%
aspect drift**, with every frame boundary landing on an integer. Ingested and swapped
working-tree-only. **This is the first FX row closed after three art batches.**

| Ledger item | Was | Now |
|---|---|---|
| **R102-E2** banner | placed but uncommittable | **COMMITTED as a pair** |
| **R104-E1** banner pair unresolved | OPEN | **CLOSED**, option A taken |
| **FX-01** M3 overlay sheet | WRONG-SPEC across two batches | **INTAKEN**, working-tree |
| **FX-02** L2 fuse arc | WRONG-SPEC | **STILL OPEN.** The kit's 4-frame sheet fits the geometry EXACTLY but it is a reel-stop impact, not a fuse arc. Refused on intent, not on numbers |
| **FX-03** jet flame | WRONG-SPEC | **STILL OPEN.** Five frames at last, but 256x256 square against 240x120 landscape: 50% drift |
| **FX-05..08** particles | gap open after two batches | **STILL OPEN, and now precisely.** 24 sprites arrived at 32/64/96/128. Sizes are finally reachable; the DESIGNS are not: there is no coin, no ring and no smoke wisp among the six. The one plausible match, spark, measures saturation 0.20 against the incumbent's 0.94 |
| **R104-E5** shadows need a component | OPEN | **OPEN with the exact blocker named**: `.char-layer` carries a breathing transform, so a shadow inside it lifts off the ground |
| Paytable support art | homeless | **STILL HOMELESS, and now proven**: `PaytableModal.svelte` has 2 `<img>` tags and no `background-image url()` at all. There is no panel raster target to aim at |

**Two kit assets are fully opaque** and would black out whatever sits behind them: the
feature-rules card background and the side-panel texture strip.

## 0C. WHAT R106 CHANGED (the FX closure kit)

**THREE FX ROWS ARE NOW CLOSED. REPLACE COVERAGE 24 of 30, 80.0%**, up from 73.3%.

| Row | Outcome | Why |
|---|---|---|
| **FX-02** L2 filament arc | **CLOSED** | Exactly 800x200 in four 200x200 frames, **no resize needed**. Correct subject at last, a filament arc rather than the reel-stop impostor R105 refused. Hue 199 against the incumbent's 215, both cyan-family and matching the L2 electric-blue signature. Marginally denser than what it replaces, not weaker |
| **FX-07** smoke wisp | **CLOSED** | 64x64 to 56x56 is a uniform downscale. **The only particle that is genuinely better than its incumbent**: mean alpha 27.9 to 67.4. The incumbent is an amorphous smudge; this reads as smoke |
| **FX-03** jet flame | **REFUSED ON HUE**, and this is the finding of the session | Geometry is PERFECT: exactly 1200x120 in five 240x120 frames. **But the jet flame sheet is a FIXED GREEN ASSET BY DESIGN.** `FlameJets.svelte` recolours it per colourway with CSS `hue-rotate`: natural none, overdrive 60deg, nitro 215deg, implementing an owner-ruled contrast law. The candidate is cyan at hue 202. A green source yields green, cyan, magenta exactly as documented; a cyan source yields **cyan, violet, yellow**. All three colourways would be wrong |
| **FX-05** coin | REFUSED | The row is a **gold** coin; the candidate is a grey and magenta chrome token. Hue 51 to 240, saturation 0.75 to 0.26 |
| **FX-06** shock ring | REFUSED | Right subject, exactly 128x128, but saturation 0.94 to 0.26 and mean alpha 47.9 to 29.5. The incumbent is a bold pure-cyan ring; the candidate is sketchy and dual-hued. It is "the most reused particle" |
| **FX-08** spark | REFUSED | Stronger than the previous kit's attempt but still saturation 0.94 to 0.37, and visually a **dark** blue shard where a spark should be bright |

**THE SHADOW INSERTION POINT IS NOW EXACT.** The breathing animation sits on the LAYER, not the
image: `.car-layer` carries `car-hover` and `.char-layer` carries `char-idle`, both animating
`transform`. So a shadow inside either layer bobs with its hero. **`.scene-group` is the correct
parent**: it is `position:absolute; inset:0; pointer-events:none` and its own comment calls it a
"Non-stacking wrapper: no z-index/transform of its own". The snippet is in the session report.
Not implemented, because positioning a 680x240 shadow under a character inside an 860px
`object-fit: contain` box needs visual iteration that cannot be verified headlessly.

**FX-04 is coupled to FX-03** and cannot close while FX-03 is refused: it must be frame 3 of that
sheet, exported from it.

## 0D. WHAT R107 CHANGED (the final closure kit)

**REPLACE COVERAGE 27 of 30 = 90.0%**, from 80.0%. **SIX OF EIGHT FX ROWS CLOSED.** Only three
REPLACE rows remain uncovered in the entire manifest.

| Row | Outcome | Evidence |
|---|---|---|
| **FX-03** jet flame | **CLOSED** | Exactly 1200x120, five 240x120 frames, and **median hue 110.1 on every frame** — the green source the hue-rotate colourways require. R106 refused this row at perfect geometry for being cyan; the contract is now met |
| **FX-04** jet still | **CLOSED** | The kit shipped an explicit frame-3 export that is **byte-identical** to its own frame 3 and **pixel-identical** to frame 3 of the strip, which is exactly what the manifest demands |
| **FX-06** shock ring | **CLOSED** | meanA **47.9 to 51.1** and peak luma **148.6 to 170.6**: stronger AND brighter, at exactly 128x128, hue 185 |
| **FX-05** coin | **still open, but close** | It IS gold at last, hue 45, saturation 0.86 against the incumbent's 0.75. **Refused on brightness**: peak luma 177.4 to 114.1, a 36% dimming, and meanA 145 to 116. The rule is "clearly as strong or stronger" |
| **FX-08** spark | **still open** | Third attempt. Named "bright" and measures dimmer: peak luma 222.9 to 188.0, saturation **0.94 to 0.31** |

**THE THREE REMAINING REPLACE ROWS ARE:** SC-03 (blocked on the owner's target decision), FX-05
(coin, needs brightness), FX-08 (spark, needs brightness and saturation).

**THE BURST-OVERLAY RECOMMENDATION IS WITHDRAWN, and it was wrong for three sessions.** I have
been recommending a burst-overlay component since R103. **It already exists.**
`WinBanner.svelte` renders `c1-shockwave` from `ui/particles/shock_ring.png` for every win tier,
gated only by reduced motion, plus a chromatic flash and an epic-tier coin fountain. **This
session improved the very asset it draws.** What does NOT exist is celebration feedback BELOW the
10x big-win threshold, and those thresholds are deliberate: they are the same ones the
autoplay-pause uses. Adding a fourth tier under them is a game-feel decision, not minimal wiring.

**THE CONTACT SHADOWS HAVE A NEWLY FOUND BLOCKER, and it is not placement.** All the geometry is
now measured: character scale 0.3028, feet 27.7px above the stage bottom, shadow centroid at 49.9%
of its canvas so it needs 36.4px below the contact point, leaving 8.7px past the stage bottom.
Composited over the real backdrop it does ground the figure, shadow luminance 19.7 against a floor
of 32.2. **But `.car-img, .char-img` is a SHARED CSS rule carrying
`drop-shadow(0 6px 18px rgba(0,0,0,.5))`, which is already a contact shadow.** Adding a raster
shadow either doubles it, or requires removing the filter from a rule that also governs the car.
That is a coupled design decision and it is not a builder's to make.

## 0E. WHAT R108 CHANGED — THE ART ARC IS EFFECTIVELY COMPLETE

**REPLACE COVERAGE 29 of 30 = 96.7%. ALL EIGHT FX ROWS ARE CLOSED.**
**Exactly ONE REPLACE row remains uncovered in the entire manifest: SC-03**, which has been
blocked on an owner decision since the arc opened, not on art.

| Row | Outcome | Evidence |
|---|---|---|
| **FX-05** coin | **CLOSED** | Delivered at the **exact 40x40 runtime target**, gold at hue 45, saturation **0.75 to 0.82**, and **107.2%** of the incumbent's integrated light. Brighter, warmer and more saturated on every measure |
| **FX-08** spark | **CLOSED** | Exact 32x32, and **252.1% of the incumbent's integrated light** |

### The instrument that decided it, recorded because it reversed a refusal

R107 refused this spark's predecessor partly on **peak luminance**, the mean over opaque pixels.
On this candidate that measure again read DIMMER: 195.4 against the incumbent's 222.9, with
saturation 0.24 against 0.94. **Both readings were true and both were the wrong instrument.**

The incumbent spark is a **thin cross**: few opaque pixels, each very bright. The candidate is a
**fuller six-point burst**: more pixels at a slightly lower average. Per-pixel brightness favours
the cross; what the eye actually receives at 32px is the INTEGRATED LIGHT, the sum of alpha times
luminance over the whole sprite. On that measure the burst delivers **two and a half times more**.
The low saturation is likewise explained rather than damning: the core is white-hot, which is what
a bright spark looks like, and the spikes are still cyan.

**The lesson worth keeping: for a small sprite judged on "does it catch the eye", integrate
alpha x luminance over the canvas. Peak-over-opaque rewards thin bright shapes and punishes full
ones.**

### What is left

**Art: nothing, for the REPLACE set**, apart from SC-03 which needs a decision rather than a
picture. The remaining programme is owner decisions and component work, both already enumerated
in sections 0B, 0C and 0D.

## 0F. R109 — THE ANIMATION-PIPELINE RESTRICTION IS WITHDRAWN, AND THE BLOCKER MAP IS REBUILT

**OWNER RULING, 2026-08-25, quoted verbatim:**

> External development-stage artwork may be used in the Future Spinner animation pipeline,
> including character rigging and Spine, provided final shipped assets remain
> quality-controlled, provenance-recorded, and presentation-safe for Stake.

**Static-only treatment of the robot is no longer required.** Three conditions survive and are
not optional: **quality-controlled**, **provenance-recorded**, **presentation-safe for Stake**.
Unrequested external art is still prohibited. **Scope: Future Spinner.** Other WRS titles remain
under the superseded rule until the owner says otherwise.

**Documents amended** (six; every one keeps its superseded text rather than deleting it):
`design-system/DESIGN_SYSTEM.md` (the SYSTEM LAW itself), `CLAUDE.md` (condition 2 and test step
1), `COMPLIANCE_WATCH.md`, `GAME_FACTS.md`, `SUBMISSION_DOSSIER.md`,
`docs/design/SPINE_ROBOT_RIG_SETUP.md`, plus `docs/design/FX_REGENERATION_SPEC.md`.

**Dated records were NOT edited.** Session reports, archives, comms entries and saved briefs keep
the old law verbatim, per convention (s): history does not go stale, instructions do.

**TWO AUDIT-FACING DOCUMENTS NEEDED CARE, not just an edit.** `GAME_FACTS.md` states it is
compiled for external audit and `SUBMISSION_DOSSIER.md` is submission-facing. Both asserted
"symbols remain never externally designed". **That claim is now false as a RULE and still true as
a FACT about the shipped set**, because the externally generated symbol art is uncommitted and
under review. Both were amended to state the rule change AND to say plainly that the shipped-set
statement must be re-verified before any submission that adopts that art. **A reviewer must not
be shown a withdrawn rule, and must not be shown a false claim about what ships.**

### Rows this closes

| Row | Now |
|---|---|
| **R103-SPINE-LAW** external parts cannot be rigged | **CLOSED by ruling.** Route A is open and recommended |
| **R102-E4** parts not in the repository, nothing may cite them | **Reduced to ordinary adoption work.** Provenance is still required by the ruling's own condition |
| **R102-E5** visor baked into the head | **CLOSED.** Solved in art, and now in law |
| **R104-E2** route A needs a law amendment | **CLOSED** |

---

## 0G. THE BLOCKER MAP, REBUILT FROM ZERO UNDER THE NEW LAW

### A. Real Stake or product blockers

**None identified.** The one item touching the platform is R097-F35, submission-1 held on the
portal artefact, which is an owner-side hold rather than a defect. The AI-provenance scoring risk
recorded in the arc-2 handover is a QUALITY consideration the ruling's "presentation-safe"
condition now carries, not a gate.

### B. Internal outdated process residue

**Found and removed this session:**

| Item | Disposition |
|---|---|
| The animation-pipeline restriction | **WITHDRAWN** by owner ruling |
| Ledger rows marked "blocked in law" | **Updated** |
| The FX spec's "static art that animates nothing" distinction | **Withdrawn**; the distinction no longer exists |
| `CLAUDE.md` test step 1, "class decides admissibility" | **Amended**; class is now a labelling step, steps 2 to 5 are the whole test |

**Actively looked for and NOT found:** any rule blocking component work while placeholders are
dirty. The only match was a heading in the HUD commissioning spec categorising art-only versus
component work, which is a categorisation and not a prohibition.

**Examined and DELIBERATELY KEPT, because each has a real basis:**

| Rule | Why it stays |
|---|---|
| Kit packaging forbidden while any placeholder differs from HEAD | Packaging now would ship 30 unreviewed rasters. **Real safety, not residue** |
| The asset guards (7 writers) | They prevent silent destruction of the visual set, proven by execution |
| Locked-path sanction tokens | Money path and maths package |
| Convention (p) seeded self-tests, explicit-path commits, evidence hygiene | Ordinary engineering discipline |
| HUD control labels must stay CSS/SVG | **Real basis: sixteen locales.** Baked text cannot localise. This is scoped to labels, values, the accent colour and state animations, not to whole controls |

### C. Owner decisions still needed

1. **SC-03's target** — the last uncovered REPLACE row: author at the true 640x468 aspect, or change the call site.
2. **The shared `.car-img, .char-img` drop-shadow** — blocks the contact shadows; adding a raster shadow doubles it or changes the car too.
3. **`char-idle` versus a rigged idle** — NEW, from R109. The wrapper supplies the bob in CSS; a rig would supply it in the skeleton. Running both doubles it.
4. **Does the ruling cover SYMBOLS?** — surfaced per convention (n). Read literally it does, and that matches arc-2 practice. One sentence settles it.
5. **Whether sub-10x wins should celebrate** — the burst art exists; the thresholds are deliberate.
6. **Whether to commit the 30 working-tree placeholders**, which is what makes the audit-facing documents' shipped-set statements need re-verification.
7. The baked MAX in the guide icon; the background room; OpenAI pricing or a covered-plan exemption.

### D. Ordinary implementation work, cheapest first

1. **Visor, eye and chest overlays on the static hero.** No new dependency; the v2 layers register to the shipped hero canvas exactly, and `.visor-glint` already exists with its own keyframes and reduced-motion path.
2. **Contact shadows**, once C2 is answered. Fully measured in the R107 report.
3. **The OpenAI client**, then pricing.
4. **The Spine rig**, once C3 is answered. Needs a runtime dependency, an atlas loader, a render target and a reduced-motion path.
5. The small tooling debts: 7 truncated manifest notes, `BASELINE_WARNINGS`, four wrong `renders_in` citations, the unreferenced `_1x` variants.
6. **Paytable panel targets**, which do not exist at all.

## 0O. R117 - HERO UPGRADED, FEATURE AUDIBLE, AND THE RESIDUAL LIST IS NOW FOUR SOUND FILES

**SHIPPED:** three factory strips (of 799 candidates), two as REPLACEMENTS that are stronger AND
smaller, one as a new behaviour.

| Sheet | Frames | Replaces | Net bytes | Strength |
|---|---:|---|---:|---|
| hero_win_reaction_8f.png | 8 | the R114 win reaction | **-817 KB** | 61.5% vs 57.2% |
| hero_feature_trigger_7f.png | 7 | hero_energy_up_6f.png | **-231 KB** | 62.6% vs 56.5% |
| hero_glance_6f.png | 6 | nothing, NEW behaviour | +1616 KB | idle attract, 24s cadence |

**All three:** identity IoU 0.9542-0.9930 vs the LIVE rest frame, **opaque ground drift 0 px**,
f1==fN. **Sanitation was real:** 6/8, 5/7 and 4/6 frames carried RGB p99 255 under transparency;
zeroed BEFORE resample; **residual now 0**. Byte count barely moved because PNG compresses a bright
field like a black one, so this must be measured not eyeballed.

**HERO BEHAVIOUR MATRIX NOW LIVE**, from one real feature round:
`idle -> energy -> idle -> glance -> idle -> win -> idle`. Small wins and losses raise nothing.
Reduced motion skips every reaction.

**AUDIO FIXED, NO NEW STEMS:**
- **The win ladder was not a ladder.** `playWin()` hardcoded 0.4 for small and bypassed BASE, giving
  **+5.46 dB then +1.09 then +0.96** - three tiers that sounded like two. Now an even x1.284 ladder:
  **+2.20 / +2.12 / +2.17**, and the bypass is gone.
- **Audio thresholds were a FIFTH independent declaration** (literal 100/30/10). Now imported from
  winCountUp.ts, so audio tracks the visual tiers by construction.
- **The Overdrive feature had NO audio** (FreeSpinsPresentation imported none). Wired the same cue
  the base game plays for the same event: one landing per ordinary free spin, per-reel on retrigger
  ladders (mutually exclusive by guard). **Verified 5 -> 10 -> 13 -> 17 across twelve free spins.**

**TWO HARNESS BLIND SPOTS FOUND, and they invalidate earlier feature probes:**
1. The `.fs-overlay` element is a **hidden warm-mount instance** alive for the whole session carrying
   the same testids. Matching on it proves nothing.
2. The real feature **stalls on a "TAP TO CONTINUE" button** (`[data-testid="entry-continue"]`).
   Without pressing it the free-spin counter sits frozen and no feature code runs. **Every earlier
   session's feature probe only ever observed the ENTRY moment.**

**REFUSED:**
- **01-max-win-reaction**, strongest strip in the factory (63.5%), refused for the THIRD session:
  MaxWinCelebration is a full-screen modal that covers the hero.
- **09-power-surge-settle, 08-short-approval-nod**: good, but additions the budget could not carry
  alongside the glance. Dead time dominates a review session, so the glance won.
- **Anticipation and symbol-state** (85 + 133 files): architecture cost too high, as R116 predicted.
- **Factory feature/celebration frames**: same full-stage-vs-HUD problem R115 and R116 both refused.

---

### THE RESIDUAL LIST, REBUILT

**BLOCKED ON EXTERNAL DELIVERABLES (this is now the critical path):**
1. **FOUR AUDIO STEMS.** No file exists to play, so no code can fix these. At
   assets/themes/future-spinner/sounds/, snake_case, each needing a themeStore key and a BASE
   volume entry: feature_enter.mp3 (most conspicuous silence), win_max.mp3 (the most
   photographed screen is silent), feature_end.mp3, retrigger.mp3.
2. **Anticipation art with a consumer** - the reels have no tension build.

**BLOCKED ON OWNER DECISIONS:**
1. **WEBP.** dist is at **23.40 of 25 MB = 93.6%**. Every future intake is gated on this.
2. **The max-win modal.** Restaging it to leave the hero visible would unlock the factory's
   strongest strip.
3. `scene_character.png` (791 KB) still ships and cannot render; kept as the hero's escape hatch.
4. Six confirmed orphans (337,523 B), not swept because nine OTHER assets look like orphans to a
   grep but are built dynamically.

**CARRIED, STILL TRUE:** the win banner covers the hero's head during reactions, but 60.8% of the
motion is in the visible chest band; `winCountUpTier()` still has no external callers; the
win_big/win_medium file-name skew is unresolved (numbers agree, names do not).

---

## 0N. R116 - FACTORY AUDIT: 799 runtime candidates, 49 READY, 710 HOMELESS

**AUDIT ONLY. Nothing wired, no factory raster committed, working tree clean, 30 placeholders
untouched.**

**THE VERDICT: not bulk derivative filler, and not mostly usable. Real art without consumers.**

| Class | Count | Meaning |
|---|---:|---|
| READY | **49** | 6 hero strips passing identity AND beating/filling vs incumbent |
| WEAK | 28 | 4 hero idle variants weaker than the shipped idle (31.6-47.8% vs 60.0%) |
| WRONG-SPEC | 12 | fully blank frames at full byte cost (6.67MB delivered vs 0.07MB if empty) |
| HOMELESS | **710** | good on-brand art for systems the game does not have |
| SHEET-ONLY | 47 | review/QA sheets, correctly excluded by the factory itself |
| DUPLICATE | **0** | the near-duplicate hypothesis was tested and REFUTED |

**CLAIMS THAT VERIFY:** 798 runtime claimed / **799 measured**; **zero** dimension-filename
mismatches across 841 named files; **all 10 hero strips f1==fN pixel-identical**; 90.5% are
single-subject sprites, NOT atlas cutouts (my own grid heuristic's 35 hits were rendered and none
was a contact sheet).

**HERO IDENTITY GATE, all 10 strips vs the LIVE rest frame:** IoU 0.9488-0.9938, f1==fN 10/10,
**opaque-core ground drift 0 px 10/10**. (R114's accepted package: 0.9695-0.9932, 0 px.)

**STRONGER THAN LIVE:** 01-max-win 63.5% | 09-power-surge-settle 62.9% | 03-feature-trigger 62.6% |
02-epic-win 61.5%, against live win 57.2% / energy 56.5%.
**FILL A GAP:** 04-glance-to-reels 37.4%, 08-short-approval-nod 36.7%.
**WEAKER THAN THE IDLE (60.0%):** 06-second-idle 39.7%, 05-dead-spin-settle 34.5%, 07-third-idle
31.6%, 10-overdrive-active-life 47.8%.

**INTAKE QUEUE (next session, ranked by review impact):**
1. 03-feature-trigger-reaction + 09-power-surge-settle - beat the energy-up, and R115's Overdrive
   perimeter is already built for them to land beside. Highest impact per byte in the factory.
2. 02-epic-win-reaction - beats the live win reaction, pairs with R115's epic tier art.
3. 04-glance-to-reels - fills a real gap; R114/R115 both refused weaker glance strips.
4. 08-short-approval-nod - cheap small-win acknowledgement below the celebration threshold.
5. 01-max-win-reaction - strongest at 63.5% but ranked LAST ON PURPOSE: MaxWinCelebration is a
   full-screen modal that COVERS the hero. Only worth taking if that modal is restaged.

**TWO MANDATORY INTAKE CONDITIONS:**
- **Zero the RGB where alpha==0.** 53 of phase-07's 108 files carry bright RGB under transparency
  (mean 162-173, p99 255). This is a deviation from the project's own stated standard.
- **Budget.** Runtime set is 348MB against ~2.1MB headroom. Needs R114's 70% common-scale treatment
  or WebP (still the owner's outstanding decision).

**INSTRUMENT FAILURE WORTH REMEMBERING:** I tested whether the fringing bleeds on downscale and got
0.00 at every scale. Then I seeded the exact defect as a control and **my test reported 0.00 there
too** - Pillow's resize is alpha-aware and could never detect it. **Whether the fringe shows in a
BROWSER remains UNTESTED**, because testing it requires wiring, which this brief forbade.

**PHASE-11's 100 VARIANTS ARE GENUINE, NOT FILLER:** measured against their actual parents, median
94.9% of pixels differ, zero under 10%, integrated-light ratio 0.48x-2.22x.

**PHASE-06's "stock" FOLDER IS A REUSABLE-PIECE LIBRARY, not stock imagery:** 60 on-palette
cyan/magenta blooms, spark rains and gold coins matching the shipped coin.png. Quality is good.

---

## 0M. R115 - THE RESIDUAL LIST REBUILT FROM ZERO UNDER CURRENT REALITY

**SHIPPED THIS SESSION:** `ui/win/bloom_mega.png` (new, mega gets its own art), `ui/win/max_bloom.png`
(REPLACED with the purpose-built headline-safe bloom), `ui/win/overdrive_perimeter.png` (new,
Overdrive stage perimeter at z41: above the grade at z40, below the HUD at z50). Plus: WinDisplay's
tier boundary aligned to the shared table, two soundService stuck-state bugs fixed, and the R111 rig
path deleted for **1,091,408 bytes** recovered.

**CONTRAST, ALL RE-MEASURED:** big 9.96 | mega **6.40 -> 8.96** | epic 12.10 | max headline
**8.41 -> 11.05**. All pass WCAG AA. R113 had to compromise the max bloom's position and opacity to
recover from 4.73; the purpose-built asset removed the need.

---

### BLOCKED ON ART (nothing can proceed without new assets)

1. **Anticipation, symbol life, ambient scene life, base<->Overdrive transitions.** The brief's
   `chatgpt-overnight-review-closure-marathon` kit **IS NOT ON DISK**. No other kit carries this art.
2. **A feature-entry splash that fits a HUD-bearing border.** The kit's is a full-stage arch whose
   pillars land on the controls.
3. **Tier frames redrawn as THIN perimeters** if the framed look is wanted. The four full-stage
   primaries are refused: composited at stage size they bury the tier label, the multiplier, the BET
   window, the SPIN button and the hero.
4. **A hero glance/attention strip at reaction amplitude.** Both offered so far were ~31% peak
   against the win reaction's 57%.
5. **A stronger hero performance set** (arm unfold, turn toward the reels, lean) needs new RENDERS:
   every reaction kit so far is a lift/rotate/energy-ramp of ONE master.

### BLOCKED ON OWNER DECISIONS

1. **WEBP, still the biggest single lever.** ~5x on the hero sheets (678KB vs 3,492KB at q90);
   `previewServer.mjs:61` already serves it; but ZERO .webp files exist in the project, so it is a
   first for a submission-bound bundle. dist is at 91% of the 25MB budget.
2. **The `win_big` / `win_medium` name skew.** The NUMBERS agree exactly (10/30/100); only the file
   names are one slot out, so `win_big.mp3` plays at MEGA. Nothing records whether that was intended.
3. **`scene_character.png` (791,212 B) ships and cannot render.** The `'static'` branch is
   unreachable by the identical mechanism that made the rig unreachable: App.svelte:2159 never passes
   `heroMode`. KEPT DELIBERATELY as the hero's one-line escape hatch. Deleting it removes the
   fallback.
4. **Six confirmed orphan assets, 337,523 bytes.** Not removed this session: a reconnaissance pass
   warned that nine OTHER assets look like orphans to a basename grep but are built dynamically, and
   a careless sweep would delete 3.4MB of working audio plus six live sprites. Worth doing carefully,
   not quickly.

### AUDIO, NOW THE WEAKEST OF THE THREE REVIEW TAGS

- **The entire Overdrive feature is silent** apart from the music-bed crossfade.
  `FreeSpinsPresentation` imports zero audio. Largest single gap.
- **Nine moments have no cue:** spin-button press, slam-stop, feature trigger, feature entry,
  per-free-spin reel stops, retrigger, feature end, **max win**, hero reactions.
- **The loudness ladder is uneven:** small->medium 5.9 dB, medium->big and big->epic each under 2 dB,
  because one call site hardcodes a volume that bypasses the BASE table.
- Architecture: 12 hand-rolled HTMLAudioElements, no Web Audio, no pooling, cloneNode voicing.
  `soundService.ts` is NOT a locked path.

### CARRIED FORWARD, STILL TRUE

- The win banner covers the hero's head during reactions, but **60.8% of the reaction's motion is in
  the visible chest band** and only 17.1% is hidden at big tier. Measured, not worth a fix.
- `winCountUpTier()` still has ZERO external callers; every consumer re-implements the ternary.
  WinDisplay now at least imports the constants.
- Telemetry's `max` at 5000 is deliberate and documented. WinDisplay's `gold`/`green` bands are its
  own colour treatment, not celebration tiers, and were left alone.

---

## 0L. R114 - THE HERO REACTS TO WINS AND TO FEATURE ENTRY

**SHIPPED:** `HeroIdle.svelte` is now a three-state machine on one element: `idle` / `win` /
`energy`. Two one-shot reaction sheets in `ui/hero/` at a common 70% scale.

| Asset | Frames | Size | Bytes |
|---|---:|---|---:|
| hero_win_reaction_8f.png | 8 | 3800x940 | 2281 KB |
| hero_energy_up_6f.png | 6 | 2850x940 | 1692 KB |
| hero_crossed_idle_5f.png (re-packed) | 5 | 3500x940 | 2038 KB (was 3410) |

**THE IDLE RE-PACK WAS NOT OPTIONAL:** every hero sheet must share one resolution or the figure
changes sharpness at the cut. At true display size (1221 device px) a 70% source is **99.5% of full
sharpness**, mean pixel difference 2.42/255, and it returns 1.37 MB.

**TRIGGERS:** win on `$winMultiplier >= BIG_WIN_THRESHOLD` **imported** from `winCountUp.ts` (the
hero reacts exactly when the banner does, and this is deliberately not a fifth threshold
declaration); energy on the RISING EDGE of `overdriveVisual`. Round-latched so it fires once.
Reactions never interrupt each other. Reduced motion SKIPS them rather than damping.
**Max win deliberately shares the win path**: a wincap clears the same threshold, and
`MaxWinCelebration` is a full-screen modal that covers the hero, so a stronger hero path would
render behind an opaque overlay.

**IDENTITY GATE PASSED, all four strips.** The package derives every frame from one immutable
master whose sha256 IS the R112 crossed-arms master. IoU 0.9695-0.9932 vs the live rest frame;
every strip's f1 is pixel-identical to its fN.

**GROUND-LINE FALSE ALARM, and the instrument matters:** soft alpha drifts 16-18px below the feet,
mid alpha 1px, **opaque core 0px**. It is a reactive ground glow, not foot movement.

**REFUSED:**
- 04-crossed-arms-idle-b: **WEAKER than the shipped idle** (30.4% peak vs 59.0%; 2.2 src px head
  travel vs 6.6). R112's idle is RE-RENDERED per frame; this package's frames are TRANSFORMS of one
  master. A transform moves a sprite, only a re-render relights one.
- 02-attention-glance: 31.9% peak vs the win reaction's 57.1%; the package's own QA calls it
  "intentionally subtle". Skipped per the brief, and it would have cost ~1.5 MB.

**BUG CAUGHT ONLY BY SCREENSHOT, worth remembering:** the first build reported `idle -> win -> idle`
with zero errors and the correct sheet **and drew nothing**. (a) all three modes shared one
animation NAME, and CSS restarts on a name change not a duration change, so the reaction inherited
the idle's elapsed time and started at its end; (b) `steps(n)` + `forwards` holds a value one frame
PAST the sheet. Fixed with distinct keyframe names and `steps(n, jump-none)` over an (n-1)-frame
span. **A state machine reporting the right state is not evidence that anything was drawn.**

**MEASURED OCCLUSION, pre-existing but newly relevant:** the win banner (y310) covers the hero's
head (y295-390) during the reaction. **17.1% of the reaction's motion hidden at big, 23.7% mega,
30.2% epic.** 70-83% still reads, and the surviving part is the largest (the chest lift, 22.8% of
the motion). The feature reaction has no banner and is seen in full.

**OPEN - THE HIGHEST-VALUE ITEM ON THIS LEDGER: WEBP.**
`frontend/scripts/lib/previewServer.mjs:61` already declares `'.webp': 'image/webp'`. The hero idle
sheet as WebP q90 is **678 KB vs 3,492 KB as PNG (19.4%)**. But **zero .webp files exist in the
project**, so adopting it introduces a new format to a submission-bound bundle: an infrastructure
and compliance decision, not art work. **dist is at 23.08 of 25 MB = 92%.** This is the single
biggest lever available.

**OPEN - DEAD SHIPPED WEIGHT:** `SceneGroup` declares `heroMode: 'idle' | 'rig' | 'static'` but
`App.svelte:2159` mounts `<SceneGroup haze={hazeLevel} />` and never passes it, so the `'rig'`
branch ships **~1.1 MB of R111 robot parts that can never render**. Deleting returns 1.1 MB.

**NOT AUDITED, NEXT INTAKE:** this package's nine feature-presentation/ assets and four
support-accents/. The brief put the hero first and the budget was spent.

**WHAT BLOCKS A STRONGER HERO SET:** everything this package expresses is a lift, a rotate and an
energy ramp of ONE master. An arm unfold, a turn toward the reels or a lean needs new RENDERS, not
new transforms.

---

## 0K. R113 - CELEBRATION ART IS LIVE, AND SEVEN OF NINETEEN ASSETS ARE PERMANENTLY REFUSED

**SHIPPED:** four text-free rasters into `ui/win/` (2.21MB, 65% Lanczos downscale) wired as
additive layers. `WinBanner` gains `.c1-tier-burst` (first child of `.c1-plate-wrap`, z-index 0, so
it paints under the band while the existing shockwave at z-index 1 still bursts over the top).
`MaxWinCelebration` gains `.c1-max-surges` + `.c1-max-bloom` below the halo. Both `mix-blend-mode:
screen`, so they add light and can never darken text. **No threshold, string, layout or existing
behaviour changed.**

| Tier | Art | Size | Opacity |
|---|---|---|---|
| big | burst_big | 430px | 0.90 |
| mega | burst_epic | 400px | 0.62 |
| epic | burst_epic | 540px | 0.88 |
| MAX | max_bloom + max_surges | 66% / full-bleed | 0.42 / 0.85 |

**REFUSED PERMANENTLY, 7 ASSETS, ALL THE MAIN FRAMES.** They bake BIG WIN / EPIC WIN / MAX WIN /
5000x. Grounds, each verified first-hand:
- **16 locales**; tier labels are `t(locale, ...)` (`hudMaxWin` = 'MAX WIN' / 'أقصى فوز').
- **Manifest row UI-07** already marks `ui/panel_balance.png` DEAD for baking 'BALANCE': "cannot
  survive sixteen locales or the social swap to COINS ... If a plate is ever wanted again it must
  be text-free."
- **The number**: the cap ships as `FS_MAX_WIN.toLocaleString(locale) + ×`; the raster bakes
  `5000x` with no separator.
- **The glyph**: `multiplication_sign_gate` enforces U+00D7 over letter x (charter row Q-26).
- **NO GATE READS TEXT INSIDE AN IMAGE**, so this class can only ever be caught by judgement.

**CORRECTION TO A CLAIM RECEIVED:** baked text is NOT forbidden by a blanket art law. `CLAUDE.md:425`
says "front-facing **symbols** carry no baked-in text" - scoped to symbols. The refusal rests on
locales + UI-07 + the multiplication gate, not on that sentence.

**ALSO REFUSED ON GEOMETRY:** the 1920x1080 full-screen frames would replace a full-width band that
`WinBanner.svelte:4-8` records as an owner-audit outcome ("reels visible above and below, replaces
the prior centred box that blocked the grid"). Adopting them reverses an owner ruling.

**CONTRAST, MEASURED:** max headline 14.16 -> 4.73 on the first pass (bloom sat behind the headline)
-> **8.41** after moving it to 58%, narrowing and dimming to 0.42. big 10.07, mega 6.40, epic 12.11,
all essentially unchanged.

**STILL HOMELESS: 15 of 19.** 7 refused unless redrawn text-free; 8 READY but unwired (side accents,
chrome accents, banner backing 1400x360, spark cluster, side flares, centre bloom, vignette).

**BLOCKED RESIDUAL:** `support/05-shock-impact-ring` is better art than the shipped
`ui/particles/shock_ring.png` (blocky flat cyan, 128x128) but that file has THREE consumers -
WinBanner, FreeSpinsPresentation entry, and HeroSplash, where the manifest warns it is "a STEADY
presence at 42% opacity in screen blend over the emblem". Safe form: a new win-only asset, ~112KB.

**THE ART THAT WOULD UNBLOCK THE REST:** the same main frames with the wordmark region left empty.

**FOUND WHILE TRACING, NOT FIXED (brief forbids rebuilding tiers):**
- The tier numbers live in FOUR places and one disagrees: `winCountUp.ts` 10/30/100, but
  `WinDisplay.svelte:38-45` uses **mega at 50** with no epic band (verified first-hand).
  `soundService.ts` re-declares them as bare literals **with names offset one step** (>=30 plays
  `winBig` while the celebration calls 30 `mega`).
- The multiplier is **base bet, not total bet** despite the comments: the divisor is `betAmount`,
  never scaled by `MODE_COST`, so under OVERBOOST (1.25x) a 10x-base win is 8x total and fires BIG.

---

## 0J. R112 - THE CROSSED-ARMS HERO IS BACK AND ANIMATED, AND THE PACKAGE HOLDS TWO FIGURES

**DEFAULT HERO = the crossed-arms idle strip, played as a five-frame flipbook.**
`frontend/src/lib/components/HeroIdle.svelte`, sheet hero_crossed_idle_5f.png
(3400x1344), `steps(5)` over `background-position-x`, 4.4s loop, same idiom as `FlameJets.svelte`.
> **SUPERSEDED 2026-08-26 by R122**, recorded here rather than rewritten because this section is
> R112's dated record of what was true then. The sheet named above no longer exists: it was a
> lighting-only strip on a locked pose and is replaced by `ui/hero/hero_crossed_idle_6f.png`,
> six frames, `steps(6)`, a real planted-foot weight shift. See section 0T.
`SceneGroup` takes `heroMode: 'idle' | 'rig' | 'static'`, default `'idle'`.

**THE MASTER IS THE SHIPPED SPRITE.** `01-full-body-crossed-arms-master` vs
`ui/scene_character.png`: silhouette **IoU 0.9995**, mean RGB diff **0.90**. The crossed-arms pose
was never lost; R111 replaced it because modular parts cannot fold arms. The package's value is the
strip, not the master.

**THE PACKAGE CONTAINS TWO FIGURES, SEPARATED BY GROUND LINE:**

| Family | Ground | Contents |
|---|---|---|
| A = the shipped hero | y1321-1322 | crossed master, 13 coverage poses, strip 01, strip 06 |
| B = modular neutral | y1299 | assembled reference, head tilts, strips 02/03/04/05 |

Strip identity vs the shipped hero: **01 = 0.9997 (USE)**; 03 = 0.7453; 02/04/05 = 0.6812;
**06-win-reaction = 0.5097, a THIRD figure** (slimmer limbs, longer legs, smaller head).
**The assembly guide recommends mixing A and B**, which would jump the robot 23px and change its
stance. Four of five motions refused on that evidence.

**WHY STRIP > RIG:** head travel between frames is only 3.8 source px, yet 31-42% of pixels change,
because frames are RE-RENDERED not transformed, so everything relights. R111's rig: 17.96% between
extremes and ZERO below the waist. Flipbook: 21-30% across the whole body including legs.

**FRAME 06 DROPPED:** byte-identical to frame 01. steps(5) over 01..05 is the closed loop.

**DEFECT FIXED, PREDATES R111:** `.antenna-light` had ZERO overlap with the earpiece orb, centred
at layer (37.1, 97.7) against an orb at (65.3, 71.9). Base rule corrected once, serving both the
flipbook and the flat sprite; the rig keeps its own override (its head sits higher).
`.visor-glint` needed NO change: R110's energy sweep re-run on the strip returns top:11%.

**THE PACKAGE'S HAND PROOF IS INVALID EVIDENCE FOR A TRUE CLAIM.** It cites differing SHA-256 to
show the hands are not mirrored clones. A mirror changes the hash, so that proves nothing. Flip
test: mirrored IoU 0.752 vs as-delivered 0.847. Hands ARE distinct.

**OPEN - THE HERO DOES NOT REACT.** Identical breathing through a dead spin and a big win. The
package cannot close this: its win strip is the wrong figure. **EXACT ART SPEC:** win reaction
drawn as family A (crossed arms, crossed legs), 680x1344, ground **y1322**, 5-8 frames, starting
and ending on frame 01 of the idle so it enters and exits without a cut. Same spec for a
head-glance accent.

**NOT SHIPPED, AVAILABLE, MEASURED:** `05-soft-contact-shadow-680x240` (594px wide) and
`06-ground-reflection-plate-680x191` register correctly to the master.

**BYTES:** three hero modes ship about 5.3MB between them; dist 18.33MB of 25MB. Dropping `'rig'`
would return 1.1MB.

---

## 0I. R111 - THE HERO IS ARTICULATED, AND SPINE TURNED OUT NOT TO BE THE ANSWER

**The robot is non-static.** frontend/src/lib/components/RobotRig.svelte renders the eleven-part
kit as a nested bone hierarchy driven by CSS transforms, mounted in `.char-layer` where the flat
sprite was. Head, torso and both arms articulate; **pelvis and legs are deliberately not animated
so the feet stay planted**, verified as zero changed pixels across the bottom third of the figure.

**NO SPINE RUNTIME WAS ADDED AND NONE IS NEEDED FOR THIS.** Established before building: the repo
has no Spine package and **zero .atlas or .skel files**; pixi 7.4.3 is imported in one file
(`GameGrid.svelte`) for a 616x412 win overlay that cannot share a canvas with the hero's box; and
CSS carries the game's animation across 95 keyframe blocks. A child element's transform composes
with its parent's and `transform-origin` is the joint, so nesting gives real bone behaviour with
no dependency. **This closes the "first Spine idle rig" row by satisfying its intent, not by doing
the thing it named.**

**THE PART KIT IS VERIFIED GOOD.** 11/11 canvases match its document, corner alphas zero,
transparent RGB zeroed, 20px margins, and its published pivots assemble into a coherent figure
when rendered. Its document claims a review/ and a source-original/ directory; **neither
exists on disk**.

**GEOMETRY:** root `left 23.95px, top 9.09px, scale 0.27784`, derived by matching the assembled
subject (569x1400 source px) to the shipped hero's subject (504x1284). `.char-layer` still measures
exactly 206x407 design px with the rig mounted.

**MOTION POLICY:** `.char-layer.char-rigged { animation: none }`. Exactly one idle runs.
Reduced motion freezes every bone to the assembled rest pose, verified under emulation.

**OPEN, AND IT IS AN OWNER DECISION, NOT A DEFECT: THE POSE CHANGED.** Shipped hero = arms folded,
legs crossed, real attitude. Rig = neutral stance, arms at sides, wider shoulders. Same character
and same quality, less swagger. Folding is not possible from these parts. Options: commission
crossed-arm limb variants, or `rig={false}`.

**NEW ROW, PRE-EXISTING, NOT FIXED:** `.antenna-light` never overlapped the earpiece orb on the
FLAT sprite (independently confirmed twice). Fixed for the rig only; the flat path is untouched
because retiring it may be simpler than correcting it. Fix if wanted: `left: 25.6%; top: 11.3%`.

**NEW ROW, PRE-EXISTING, NOT FIXED:** the cohesion rim-light and scene-grading `filter` on
`.char-img` / `.car-img` is **dead in the shipped bundle**, overridden by a later equal-specificity
rule that re-declares `filter` wholesale.

**STILL OPEN FROM 0H:** the painted visor emissive still needs redrawing to the 10c spec; the
contact-shadow decision is still blocked by that same shared drop-shadow rule.

---

## 0H. R110 - THE PAINTED VISOR DOES NOT FIT, AND R109's REGISTRATION CLAIM WAS WRONG

**Nothing in the kit is a visor for this robot.** Measured against the shipped 680 x 1344
`ui/scene_character.png`, whose head spans y 40..300 with a maximum width of 297 px and whose lens
sits at x 185..568, y 37..319:

| Layer | Centroid y | Lands on | Fatal measurement |
|---|---|---|---|
| 40-visor-only-glow-layer-680x1344.png | 446 (33.2%) | chest and folded arms | 488 px wide, 1.64x the whole head |
| 41-eye-light-layer-680x1344.png | 404 (30.1%) | folded arms | 13 points low |
| 42-chest-energy-layer-680x1344.png | 700 (52.1%) | pelvis | 14 points low |
| 19-robot-visor-glow-layer.png (640x320) | n/a | floats above a different robot's dome | 44.3% on-body |

All three 680-family layers are displaced downward by a **consistent 13 to 16 percentage points**.
They are coherent with each other and with a differently framed reference figure. A translate does
not fix the visor: shifted up 211 px or 240 px it swallows the head and hides the real visor.

**CORRECTION TO SECTION 0F.** R109 recorded that these layers "register to the shipped hero canvas
exactly". **They do not.** The checks behind that claim were canvas dimensions and
percentage-of-pixels-on-silhouette, both true, neither answering the question: 93.9 per cent
on-body is fully compatible with being on the wrong body part. The 0F text stands with this
correction beside it, per convention (s).

**A REAL DEFECT WAS FOUND IN THE INCUMBENT AND FIXED.** `.visor-glint` at `top:17%` centred on
image y309, the neck pinch. Only **5.7 per cent** of the gradient's energy reached the lens and
**32.4 per cent** missed the sprite. Now `top:11%`: **56.4 per cent on lens, 3.6 per cent wasted**.
One declaration, one value to revert, keyframes and reduced-motion path untouched.

**WHAT IS NOW BLOCKED ON ART, WITH AN EXACT SPEC.** Canvas 680 x 1344 registered to
`scene_character.png`; lens x 185..568, y 37..319; emissive peak y 201..268; maximum width 297 px;
cyan to magenta left to right. Until that exists, the visor stays a CSS gradient.

**STILL OPEN, UNCHANGED BY THIS SESSION:** the contact-shadow decision, blocked by the shared
`.car-img, .char-img` drop-shadow rule; the coordinated idle policy that must precede any rig; the
first Spine idle rig itself.

---

## 0A. WHAT THE COMPLETION KIT CHANGED

**Of 24 top-level deliverables in the kit, ONE could be used.**

| Ledger item | Was | Now |
|---|---|---|
| **R102-E2** banner art missing | OPEN, art did not exist | **CLOSED IN ART.** Four 718x88 candidates arrived; variant B selected on measurement and PLACED working-tree-only, with its CSS wiring also working-tree-only. **Committing either would fail CI**, see below |
| **R102-E5** visor baked into the head | OPEN, needed an art request | **CLOSED 2026-08-25: solved in art AND in law, see 0F.** Historic text follows: The kit ships a visor-off head plus separate visor, eye and chest emissive layers. They are externally designed, so the ruling still gates them |
| **R103-SPINE-LAW** external parts illegal | OPEN | OPEN, and **route B was re-sized from medium to LARGE**: the in-house master is in the folded-arm hero pose and needs limb re-authoring, not just grouping. **Route A, one owner ruling, is now the cheapest path by a wide margin** |
| **R097-FX-SET** particle gap | OPEN | **STILL OPEN.** The kit's smallest asset is 128x160; the four particle rows need 40, 128, 56 and 32 px. Neither art flood has addressed them. A machine-ready commissioning prompt is now written |
| **FX-01 / FX-03 sheets** | WRONG-SPEC | **STILL WRONG-SPEC.** FX-01's frame COUNT is right at last (6), the frame SHAPE is not: 256x320 delivered against 200x200 required |
| **R097-SC03-UI04** | UI-04 closed at R103 | SC-03 still open; the kit's two bezel variants are both wrong for either reading of the target |
| **R103-E10** unused paytable import | OPEN | **CLOSED.** Removed; the function is still used by BuyBonus so the export stays |
| **R102-E1** guide misrepresented controls | CLOSED at R103 | **VERIFIED STILL CLOSED.** The six icons match HEAD |

**THE BANNER'S WIRING CANNOT BE COMMITTED, and the reason is a gate rather than a preference.**
`frontend/scripts/asset_reference_gate.mjs` asserts every asset path the code references exists
in dist, and `build_diet_verify.mjs` fails any 404. A committed `url()` pointing at an
uncommitted raster would fail both. **So the raster and its one CSS line both stay in the working
tree, together**, and the next session either commits both or reverts both.

**Two working-tree changes are live and deliberate**, and are recorded here so nobody finds them
cold: a new untracked hud_banner.png under the theme's ui directory, and one `background-image`
layer added to `.fs-panel` in `HudOverlay.svelte` (modified, uncommitted). (The raster's path is
deliberately written in prose rather than backticked, because it does not exist at HEAD and the
document currency gate correctly refuses a citation to a file that is not there. It refused this
very line once.)



**Built 2026-08-25 by R103 WORKSTREAM 1**, reconciling every escalation and open finding from
R086 through R102 into a single list, then correcting it against the repository at HEAD.

**How to read it.** "Owner?" means the item cannot be closed by a builder because it needs a
judgement, a wording choice, a spend, or new art. Everything marked NO is a builder task that
only needs scheduling. Evidence is a path, a line, or a measurement taken this session.

**This file supersedes the scattered ESCALATIONS sections as the place to look.** Those
sections stay where they are, because the record of what each session believed is evidence.

---

## 0. CORRECTED ASSUMPTIONS — read this first

These four statements are established, measured, and have been misread before. WORKSTREAM 1.2.

| # | Statement | Evidence |
|---|---|---|
| A1 | **Every live HUD control is CSS or inline SVG.** None is a raster. | `HudOverlay.svelte` has 0 `<img>` and 27 `<svg>`, counted at HEAD |
| A2 | **The button PNGs are Interface Guide captures, not live HUD art.** They are headless screenshots of the CSS controls. | `frontend/scripts/regen_interface_guide_icons.mjs` captures by CSS selector into the shipped ui directory; `docs/art/ART_HANDOVER_ARC2.md` section 3 names all ten |
| A3 | **Six placeholders were documentation icons**, so the Interface Guide stopped depicting the live controls. | spin_button, btn_turbo, btn_menu, btn_autoplay, btn_bet_plus, btn_bet_minus. Each: 0 live-HUD `<img>` refs, 1 PaytableModal ref, 1 regen-script target. **RESTORED to HEAD in the working tree by R103 W2.3.** |
| A4 | **The only safe live-HUD art target is the decorative banner panel** `.fs-panel`. | `pointer-events:none`, `z-index:59` against controls at 61, no accessible name, no locale text. Geometry verified 718x88 this session from the token arithmetic, not assumed |

**Anything in an earlier record that reads as "new HUD art exists but is not wired" is wrong in
its premise.** The art in question is a photograph of the thing it would replace.

---

## 1. SAFETY — all closed

| ID | Item | Status | Evidence | Owner? |
|---|---|---|---|---|
| R097-F23 | `npm run assets` silently reverts placeholders | **CLOSED** R101 | Guard refuses at exit 2; measured 16 overwrites, 17 recreations | No |
| R101-E1 | Three background scripts unguarded | **CLOSED** R102 | Exemption withdrawn; all three refuse | No |
| R102-C2 | `regen_interface_guide_icons.mjs` unguarded | **CLOSED** R102 | Guarded via `--require-clean` | No |
| R100-E2 | Client guard beyond brief's file list | **OPEN**, ratification only | `CLIENTS` + `require_client()` in generate.py | **Yes**, Fable ratifies |
| R097-TREE-GUARD | Kit packaging forbidden while placeholders differ from HEAD | **STANDING** | Operating constraint, not a task | No |

**Residual risk: none known.** All seven writers into the shipped asset tree are guarded.
`ingest.py` is NOT guarded and does not need to be: its `DEFAULT_OUT` is a gitignored scratch
path, verified this session, so it produces candidates rather than shipping them.

## 2. PROVIDER AND LEGAL

| ID | Item | Status | Evidence | Owner? | Next action |
|---|---|---|---|---|---|
| R099-E2 | Ticket 456254 rests on a transcription, no captured source | OPEN | No capture anywhere in repo, Desktop or Downloads | **Yes** | Archive the correspondence |
| R099-E3 | No committed credit price, so `cost_of` refuses | OPEN | `'gpt-image-1' has no committed credit price` | **Yes**, spend decision | Capture pricing, or rule a covered-plan exemption |
| R100-E1 | **No OpenAI client exists** | OPEN, **first blocker** | `generate.py` implements Stability only | No, builder task | Implement the client |
| R099-E1 | Mark changed on the owner's brief, gate comment asks for a Fable ruling | OPEN | provider_gate.json `_comment` | **Yes** | Ratify or revert, one field |
| R097-F34 | Provider ruling gates whether any placeholder can ship | **PARTIAL** | Ticket 456254 cleared artwork; generation still blocked by the above | **Yes** | Downstream of the three above |
| R097-F35 | submission-1 held on the portal artefact | OPEN, a hold | Owner-side | **Yes** | None available to a builder |

## 3. ART GAPS AND COMMISSIONING

| ID | Item | Status | Evidence | Owner? | Next action |
|---|---|---|---|---|---|
| R102-E2 | **Banner panel art does not exist** | OPEN | 718x88, aspect 8.159; nothing on disk within reach | **Yes** | Commission to the R103 spec |
| R097-FX-SET | The 8 P4 FX rows were the whole coverage gap | **PARTIAL**, see W3 | The 2026-08-25 FX set delivers no sprite under 480px; the four particle rows stay unfilled | **Yes** | Commission particle sprites at 40/128/56/32 px |
| R097-SC03-UI04 | SC-03 and UI-04 uncovered | **UI-04 CLOSED** R103 | Jet nozzle intaken, 0.00% aspect drift, bbox -7.6%/-9.5% | Partly | SC-03 still open, see 5 |
| R097-F19 | SC-01 background room: WORKSHOP taken as default, dyno-cell unreviewed | OPEN, longest-standing | R097 | **Yes** | Pick the room |
| R100-E7 | Background subject drifted: manifest says rain-soaked city, batches ban rain | OPEN | manifest SC-01 role vs batch records | **Yes** | Settle in the manifest |
| R097-F16 | Title lockup darker than what it replaced, 3.42:1 | OPEN | R097 | **Yes** | Accept or re-render |
| R097-F17 | Tile plate busier than the flat rectangle it replaced | OPEN | R097 | **Yes** | Accept or re-render |
| R097-F18 | Tile plate corner radius now comes from CSS, not the art | OPEN | R097 | Weak yes | Accept |
| R087-SCATTER-TUMBLE | Scatter placeholder may tumble under the restored 360 degree idle | OPEN | R087 | **Yes** | Look pass |
| R090-M2-NUDGE | M2 top edge to row 8-10 at the next re-render | OPEN | R090 | No | Fold into the next batch |
| R103-E5 | `feature_button.png` is now the only working-tree placeholder among the guide's ten | **NEW** | After the W2.3 restore | **Yes** | Revert it too, or accept |
| R103-E11 | `wild.png` carries a readable Latin W | **CLOSED, not a defect** | DESIGN_SYSTEM text-free law names "the machined W emblem inside the Wild" as its single exception | No | None |

## 4. WIRING AND HOMELESS ART

| ID | Item | Status | Evidence | Owner? | Next action |
|---|---|---|---|---|---|
| R097-F20 | ~9.65 MB of win/Overdrive art has no render site | OPEN | R097 | **Yes** | Decide: build the surface or drop the art |
| R097-F21 | Title states and character poses have no state machinery | OPEN | R097 | **Yes** | Same |
| R097-F22 | Seven swapped UI controls change the guide and buy screen, not the HUD | **SUPERSEDED** by A2/A3 | The premise is now understood | No | Closed by the W2.3 restore |
| R089-E3 | Four shortlist UI rows have no live raster target | **SUPERSEDED** by A1 | The HUD draws no rasters | No | — |
| R102-E3 | Eight dead asset paths in `themeStore.ts` | OPEN | Zero consumers outside their own definition | Weak yes | Wire or delete |
| R103-E7 | Paytable rebuilds asset paths itself rather than using the themeAssets helper | OPEN, no defect today | Lens finding | No | Tidy |
| R103-E9 | `data-testid="interface-guide"` also wraps the Bet Modes footnote | OPEN, no visual defect | Lens finding | No | Narrow the testid |
| R103-E10 | `maxWinVsBaseBetLabel` imported and unused in the paytable | OPEN | Lens finding | No | Delete the import |
| R097-F32 | Four dead CSS selectors outside the liveness gate's class | OPEN | R097 | No | Sweep |
| R093-LOGO-BOX | A blocky title lockup would need a `.logo-box` layout change | OPEN | R093 | **Yes** if the title shape changes | — |

## 5. TOOLING

| ID | Item | Status | Evidence | Owner? | Next action |
|---|---|---|---|---|---|
| R100-E5 | SC-03 crashed the composer | **HALF CLOSED** R103 | Crash fixed: now a clean `ComposerRefusal`, seeded 22/22. The TARGET is still ambiguous | **Yes** for the target | See the question in the report |
| R100-E6 | 7 of 30 manifest notes cut mid-token by `notes.split('.')[0]` | OPEN | Measured R100 | No | Sentence-split fix |
| R100-E4 | No per-row negative; UI-05 needs the opposite of the global one | OPEN | compose.py reads one `negative` | No | Add per-row override |
| R097-F24 | `ALPHA_SNAP_FLOOR` does not clear the alpha its docstring claims | OPEN | R097 | No | Fix |
| R097-F25 | `ingest.py` hardcodes quality 92 / subsampling 0 | OPEN | R097 | No | Add CLI override |
| R097-F26 | Aspect-refusal message advises a flag that squashes | OPEN | R097 | No | One-line message fix |
| R097-F27 | No `--compare-against-shipped`; the bbox test is hand-run every time | OPEN | R097; R103 ran it by hand again | No | Build it |
| R097-F28 | `BASELINE_WARNINGS` is 36 against a real count of 4 | OPEN | R097 | No | Constant change |
| R093-SC07-TRAP | `scripts/assets/manifest.json` still exports SC-07, whose art row is DEAD | OPEN | R101-E3 restates it | No | Manifest edit |
| R103-E8 | The manifest generates `_1x` symbol variants nothing references | **NEW** | 10 of the 17 recreated files are `_1x` | No | Stop generating them, or wire them |
| R086-E5 | The incoming art directory is live, so a snapshot can race a batch | OPEN | R086 | No | Structural answer already recorded |
| R087-E4 | Local preview cannot exercise a real board | OPEN | Environment constraint | No | — |
| R090-E4 / R096-E2 | Symbol and scene payload growth | OPEN, watch items | R090, R096 | No | Watch |

## 6. SPINE AND ANIMATION

| ID | Item | Status | Evidence | Owner? | Next action |
|---|---|---|---|---|---|
| **R103-SPINE-LAW** | ~~external robot parts cannot enter the animation pipeline~~ **CLOSED 2026-08-25 BY OWNER RULING, see 0F** | **CLOSED** | DESIGN_SYSTEM: anything the pipeline "positions or animates" is "NEVER externally designed. No exception, and no measurement changes that answer". External scene art is permitted *because* "it animates nothing" | **Yes** | Owner ruling, or the in-house route |
| R102-E4 | Parts are in a gitignored path, so nothing may cite them | OPEN, subsumed by the above | Convention (m) | **Yes** | — |
| R102-E5 | The visor is baked into the head part | OPEN | Measured R102, re-verified R103 | **Yes** | Three options recorded |
| R103-SVG-DORMANT | The in-house robot vector master exists, is tracked, and is DORMANT | **NEW** | `frontend/scripts/scene/scene_character.svg`, 340x672, one flat group of ~35 unnamed paths, zero live consumers | **Yes** | See the three routes in the Spine doc |
| R087-E1 | Idle excursion amplitudes to be judged by eye | OPEN | R087 | **Yes** | Look pass |

## 7. DOCUMENTATION DRIFT

| ID | Item | Status | Evidence | Owner? |
|---|---|---|---|---|
| R100-E3 / R086-E3 | M3 identity across three documents | **PART CLOSED** R103 | DESIGN_SYSTEM corrected with the prior text preserved. **FX-01's role still says booster flame and feeds a generation prompt, so it was escalated not edited** | **Yes** for FX-01 |
| R101-E2 | R097's "recreates 15" superseded by a measured 17 | OPEN | Recorded, not yet corrected in R097's own file | No |
| R102-E6 | R097's "only known command" superseded | OPEN | Same | No |
| R097-F29 | Four manifest `renders_in` citations point at wrong lines | OPEN | R097 | No |
| R097-F30 | DOC-10's note miscounts the regen targets | OPEN | R097 | No |
| R097-F31 | ART_HANDOVER carries two off-by-one counts | OPEN | R097 | No |
| R097-F33 / R089-E1-DISPOSITION | Escalation ledger stale and self-contradictory | **CLOSED by this file** | This ledger is now the single list | No |
| R087-R088-PACK | The R088 pack | **PART CLOSED** | Style register landed R100 | **Yes** for the rest |

## 8. PAYTABLE, TEXT AND LOCALE

| ID | Item | Status | Evidence | Owner? | Next action |
|---|---|---|---|---|---|
| R103-E1 | **`btn_max.png` bakes the English word MAX** while `hudMax` is localised | **NEW** | Guide icon carries baked type | **Yes** | It is a capture of a CSS control whose label is text; re-capture per locale is impossible, so the guide row needs a localised caption instead |
| R103-E3 | Symbol names WILD and SCAT reach the player as hardcoded literals | **NEW** | From a script-side table | **Yes** | Localise or rule them brand terms |
| R103-E2 | `RTP` is a bare hardcoded literal in paytable markup | **NEW** | Lens finding | No visible defect | Localise |
| R103-E4 | Overdrive award strings bypass the locale number convention | **NEW** | Lens finding | No visible defect today | Route through the formatter |
| R102-E1 | The guide misrepresented the live controls | **CLOSED** R103 W2.3 | Six icons restored to HEAD in the working tree | No | — |


### CI incident, 2026-08-25, recorded so the next session does not misdiagnose it

**R103's first run on `b305f9d9` concluded CANCELLED, and it was a runner incident, not a
defect and not a threshold.** The `what changed` job hit its `timeout-minutes: 5` at 5m01s
with EVERY step reporting success; its `Check out` step alone took **298 seconds**. Because
that job gates the browser matrix, the 28 browser gates never ran, so the run could not be
called green even though `static gates` had passed every step.

**The first diagnosis was wrong and the numbers corrected it.** The repository's pack is
1.37 GiB, of which `reports/` is 1,199 MiB (63%), so "the repo has grown past the timeout"
was an appealing story. It does not survive the data: the four preceding runs checked out the
same repository in **30s, 39s, 24s and 106s**, and the re-run of this very commit took **36s**
and went **30/30 green**. 298s is an outlier at roughly 3x the worst recent run, not a trend.

**This is the second recorded instance of the class**, the first being the 9m24s run whose
`Install frontend dependencies` step ran 320s against 9 to 22s elsewhere in the same run.
`CLAUDE.md` already draws the rule from it: **a slow run is a runner or npm incident until the
per-step timings say otherwise, and the way to tell is to read the step breakdown.** That rule
worked here.

**The residual fragility is real but is NOT a defect to fix on this evidence.** A 1.37 GiB
history makes a `fetch-depth: 0` job more exposed to a bad runner than a small repository would
be. If this recurs, the cheap fixes in order are: raise `timeout-minutes` on that one job; or
fetch only the merge-base rather than full history; or address the evidence volume in
`reports/`, which is the largest and riskiest option and rewrites history.

---

## The shortest true summary

**Nothing unsafe is outstanding.** Every command that could silently destroy the visual work is
guarded, and that was verified by execution rather than by reading.

**The programme is gated on five owner decisions**, in the order that unblocks the most work:
the OpenAI pricing or exemption; the banner panel commission; the Spine system-law question; the
homeless win and Overdrive art; and the background room. Everything else on this list is a
builder task waiting for a slot.
