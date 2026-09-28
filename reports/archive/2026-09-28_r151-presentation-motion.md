# R151 - THE PRESENTATION MOTION PASS: WHAT WAS ON SCREEN NOW MOVES LIKE A SHIPPED SLOT, MEASURED BEFORE AND AFTER (2026-09-28)

Review lane, unattended. Brief saved verbatim at `reports/briefs/FS_R151_PresentationMotionPass_Prompt.md` per
convention (f). Branch `claude/r151-presentation-motion`. Ultracode on: four workflows (a motion inventory, 6
agents; three before-and-after verification rounds, 37, 21 and 12 agents; 76 agents, about 18.5M subagent tokens),
then session-run measurements of the last two changes. Every finding the workflows raised was re-derived or
re-measured before it was acted on or recorded, and every failure they found is in this report.

## Preconditions

1. **#186 (R150) was already merged by the owner** (2026-09-28T01:01:58Z, merge 28fd1a423b6c7679391f6c11d05b217035a95173),
   so there was nothing to merge; HEAD contains 7edf9ea5. **R150's remote CI, recorded here as R150's report said
   it would be:** PR run 36335124618 (pull_request) on 7edf9ea5a973f672559d0daba70618e5eddeee03, 30 of 30 green;
   main run 36364403701 (push) on 28fd1a42, 30 of 30 green, confirmed before this branch was pushed (rule 10). The
   merged head `claude/r150-drum-machine-idle-bed` (tip 7edf9ea5, an ancestor of main, no unique commit) was deleted
   under ruling (t.1) rule 2.
2. **Fingerprint:** 2,731 tracked rasters hashed (png, jpg, jpeg, webp, gif, avif); bgm_loop is the R150 take
   (master 99643c41, webm b999dd17, mp3 ca1b051e); the sounds directory hashed. **At close: 2,731 of 2,731 start rasters unchanged, and the only new tracked rasters are the six look-pass screens (evidence, not game art); in the sounds directory every audio file is byte-identical (35 of 36 files), the 36th being the README, which carries the dated R151 note.****
3. **Dist:** 105 files, 18,712,591 B at the start (headroom 7,501,809 B under 26,214,400 B); at the code tip
   8eedc53f, 104 files, 18,629,310 B (headroom 7,585,090 B): the dead raster in workstream 3 (91,802 B) left and
   the CSS and JS grew 8,521 B. Both figures are build-info's own count, which excludes build-info.json.
4. **Own preview:** `vite preview` of dist on port 4611 through the preview tool (a launch.json entry
   fs-r151-dist); identity proved by hashing a shipped asset served there (bgm_loop.webm b999dd17) against this tree
   and HEAD's blob. **5173 was never bound, stopped or refreshed**; it carried the owner's own dev server (pid 42866)
   throughout. Every measurement served a frozen copy of a built dist in-process on free ports; nothing used 5173,
   5174 or 4611 except that preview.

## Workstream 5 first: the owner's R150 ruling is enforced, not just recorded

- **audio_verify applies the seam exemption at bgm_loop's hash (commit eb00bd9d).** The owner accepted the
  exemption "at this master's hash" and ruled the 2.0 dB limit must not loosen. The seam check now hashes the bytes
  it decodes and exempts exactly bgm_loop's committed encodes of master 99643c41 (webm b999dd17..., mp3 ca1b051e...).
  An exempt file is still measured and reported; any other bytes, or that hash on another row, fail against the
  unchanged 2.0 dB. Seeded self-test (`--self-test`, 8 cases) passes, and a mutant that ignores the hash fails it on
  three. Full run: **ALL CHECKS PASS**, bgm_loop reported "SEAM EXEMPT ... OWNER ACCEPTED AT HASH" at 4.11 / 4.16 dB,
  the other two beds within 2.0 dB on their own. audio_verify is not in CI.
- **Records (commit 11cb54da), dated notes only:** the sounds README (the R150 section and the Licence section),
  GAME_FACTS.md and SUBMISSION_DOSSIER.md record OWNER ACCEPTED AT HASH 99643c41ae7cfd1e4e11ea8cc114d4fa234606525ade4c739b51766f4ae16d19,
  and the owner's licence line for the 140 ms ChatGPT idle edit: an owner-commissioned development-stage cue,
  pending written audio terms; Ticket 456254 remains images-only. The ledger's 1F OPEN ruling is closed in 1G.

## Workstream 1: the motion inventory, measured on the production build

Measured by a 6-agent workflow on the production build (in-process server, real committed book rounds from the
replay fixtures, GPU for any timing: the default headless renderer is SwiftShader and distorts frame pacing, which
the hero lens proved). Every row is a measurement; the source file:line and the scripts are in the inventory
output kept in the session scratch. First 10 s means after the splash and rules card are dismissed.

| Surface | What moves | Cycle | Amplitude | Reduced motion | First 10 s |
|---|---|---|---|---|---|
| Hero idle float | the whole figure, translateY only | 5,000 ms loop | 3 px (car 6 px) | off | yes, subtle (desktop, landscape phone 1.3 px; no hero in portrait) |
| Hero idle pose | nothing: the R130 frozen frame 01 | still | 0 | same | yes, still |
| Hero accents | antenna orb, visor glint, chest lamp | 2,800 / 6,000 / 7,400 ms | opacity and small scale | held still | yes |
| Hero win unfold (big) | two buffers through the 32-frame strip, body punch | 1,500 ms, 31 steps of 48.4 ms (20.7 Hz) | punch -15 px, 1.03, 1.2 deg | no reaction | only on a 10x+ win |
| Hero win unfold (epic) | same, stretched | 1,900 ms, 61.3 ms steps | -27 px, 1.05, 2 deg | no reaction | no |
| Hero feature brace | two buffers through 16 frames, body sink and rise | 1,300 ms, 86.7 ms steps (11.5 Hz) | +4 / -5 px | no reaction | only if the first spin triggers |
| Per-symbol idles (R087 set) | ten classes, all LIVE in the build (scoped, keyframes present, running) | 1.2 to 3.4 s; flipbooks 9.1 and 11.8 fps; scatter rays 12 s | 1 to 7 px, brightness and glow | off | **before R151: no** (see below) |
| Scatter and wild emphasis | scatter charge bloom, orbiting spark, scanline, reel tremble; wild joins the win flash | 500 / 900 / 700 ms | bloom 12 to 26 px | off | only on 2+ scatters |
| Reel stop (drop) | 520 px fall, squash and overshoot, 95 ms stagger | 400 ms fall (Turbo 260), 135 ms squash | 440 px on screen, squash 0.78 to 0.89 | **squash ran unchanged** (fixed) | on a spin |
| Win flash | pre-charge, pop, pulse, plate bloom, particles, left-to-right sweep | 250 ms, 500 ms, 900 ms loop | pop to 1.22 | off, losers dim still | on a win |
| Shock ring | the 5th scatter's ring | 700 ms | **clipped to four corner slivers at its peak** (fixed) | off | no |
| Win banner BIG / MEGA / EPIC | plate slam-in with overshoot, tier burst, shockwave, particles, coins (epic), pulse and breathe | 600 ms entry; life 3.6 / 4.2 / 5.0 s | band 111 / 141 / 172 px tall at 1280 | 0 animations, art still | only on a 10x+ win |
| Banner contrast | amount on the band mean | | 13.2 to 16.1:1 (binding text the MEGA label, 6.0:1) | | |
| Max-win overlay vs hero | full-viewport scrim at z150 over the hero's epic reaction | 550 ms fade, 1.9 s epic | **buries him: 1.2% transmission for about 1.6 of 1.9 s** | same | no |
| Feature entry | flare, dip, gauge slam and needle, title, ring, smoke, burst text, gate; **no perimeter ring** (absent from DOM, network and dist) | about 1,010 ms to the gate | gauge 0.4 to 1 scale | transitions off | only if triggered |
| Turbo and spin press | desktop SPIN hover 1.05, press 0.96, arrows 700 ms a turn; **phone SPINs: none** (fixed); Turbo and AUTO no press | 120 ms | 4% | desktop press kept | on press |
| Title lockup (logo.png) | **fully static** before R151 (0 animations on it and six ancestors) | | 0 | | yes, static |
| Ambient | reel frame glow (the most visible idle motion), car hover, underglow, neon, booster, rain (barely perceptible) | 1.2 to 7.4 s | frame glow 8 to 20 px | off | yes |

**Surfaces the inventory's own critic added:** the small-win flash (1x to under 10x, most of the 29.11% hit rate;
1.2 s, rises 36 px) and the win breakdown chip (swaps text every 1.4 s). The chip reads "1 ways" on a one-way win,
a missing singular (a text-lane item on the owner list).

## Workstream 2: cheap motion from existing assets, each measured before and after

Every change is CSS or a retune of what was wired, on existing rasters; no new raster, no HUD geometry, no audio
graph change, no maths. Before and after on frozen production builds; three verification rounds re-measured every
item, and each round failed something of mine that the next fixed.

**C, the hero (commit 159041a6).** The hero **blinked out of the presented frames at every reaction's sheet swap**
(1 to 4 frames at the start, 1 at the end; frames showing the car with no robot), in 15 of 15 reactions. Static 1%
warm layers keep the three shipped sheets painted: **0 blank frames in 22 win and 4 brace reactions**; an isolating
factorial shows the warm layers, not the retune, are the fix. The dissolve retune (the brief's own C): boundary
against mid-step change, **win 3.25x to 0.86x, brace 5.72x to 0.92x, epic 3.94x to 0.89x**, interior holes 0. The
first-use hitch is gone. hero_idle_planted_gate now judges the warm layers, with two new seeds. The idle flipbook
stays frozen and no frame was added.

**A, the symbols (commit 43b95411).** No idle class was dead (so the liveness restore was not needed), but **the first
thing a player saw was twenty identical L3 pistons pumping in one phase**; nine of ten idles appeared only after a
spin, a defect already visible in committed evidence from July. Now:

- A fixed, non-winning display board (every symbol, no way, two scatters) is painted through the existing
  `_updateSymbols`, display only, no store write; the first real board replaces it. Its plate tints repaint when
  plates.json arrives (it had shown the fallback cyan on 17 of 20 cells). Not in Bet Replay, whose ready card must
  not show a dealt-looking board; and not after a bought feature that is the session's first round (that round
  writes no base board, so the grid returns to the old neutral placeholder rather than sit beside the win as if it
  had paid it), which also covers a recovered open bought feature at boot.
- Idle phases are offset per column and row. The offsets were searched reel boundary by reel boundary against every
  landing gap the drop and escalation code can produce (all scatter patterns, all three speeds, whole frames), then
  weighted by the real books:

| Regime | Before R151 | Now |
|---|---|---|
| Together-start (pre-spin, img idles after a win's teardown): same-class neighbours | locked, 0 ms apart | at least 90 ms apart |
| Plain landing stagger, side by side | the stagger itself | at least 131 ms |
| Stacked pairs | 0 ms | at least 93 ms |
| Across an anticipation hold, side by side under 50 ms, share of paid spins (base / Cruise / OVERBOOST) | Normal 1.04 / 1.07 / 0.86%; Turbo 0%; Super 1.05 / 1.07 / 0.87% | Normal 0.001 / 0 / 0.002%; Turbo 0.007 / 0.005 / 0.012%; Super at most 0.018 / 0.012 / 0.03% |

  So at Turbo the offsets introduce a residual that did not exist before, at most 0.012% of paid spins; at Normal and
  Super the share fell from about 1% to at most 0.03%. The live probe's hand-picked worst case (book 78, a Turbo
  trigger with reels 4 and 5 both on the long hold) measured one pair at 22.9 ms: that residual, seen. Three earlier
  offset sets each failed one regime in verification (every stacked booster flame locked; reels 4 and 5 locked in
  live play; Turbo holds at 1.0 to 1.8%) and were replaced.
- The escalation shock ring fits the frame at its peak; the scatter scanline sweeps (its gradient was the box, so it
  never moved); the H1 spoke is a full turn over 40 s with no seam (72 degrees is not a symmetry of the sprite);
  the M1 and M2 idles move about 2 px at 1280 (they were under a screen pixel); particle bursts share the pool
  across every winner (5 of 10 bigWin cells used to get none); reduced motion skips the landing squash. Comments that
  promised motion that does not exist now describe what runs.

**B, the win banner, and the feature (commit 2ac6afd2).** The band still read as a slab across its own tier art.
My first fix, a second copy of the raster inside the band, **never painted** (a relative URL inside a CSS custom
property resolves against the stylesheet: it requested /assets/assets/..., a 404 on a CDN) and, fixed, would have
doubled the image during the entry and taken the MEGA label under 4.5:1. It was removed. **The scrim is lighter,
.66/.82**: band texture 12 to 20 luma SD became 18 to 25, the tier art's share inside the band 11 to 20% became 20 to
34%, and contrast on the band mean stays at least 12.6:1 (amount), **5.56:1 (the binding MEGA label at 390)** and
9.4:1 (multiplier). No 1920 rail was added.

- **The exit.** The band used to leave in one frame at full opacity. It now fades inside the last 280 ms before the
  unchanged dismiss timer. My first exit replaced the banner's translateY(-50%) centring and dropped it by half its
  height on its first frame; the root now animates opacity only and the plate scale, and the centring holds on
  every leaving frame (largest drift 0.10 to 0.14 px in 23 timed runs). The first fade used the whole 280 ms and
  was still at 0.17 to 0.26 at removal (a transition clock starts frames after the class change); 230 ms left under
  one frame of margin (0.094 in 1 of 22 steady runs); the committed fade runs 200 ms. Measured on the committed build in 10 steady timed runs on the GPU (BIG at 1280, 390 and 844, MEGA and EPIC, twice each): the root reaches 0 two or three frames before removal in all 10, where the 230 ms control reached 0 only on the last frame; centring drift at most 0.14 px; under reduced motion it holds full opacity and leaves in one frame, as before. The dismiss
  moment is unchanged at every tier.
- **Phone tier ladder:** BIG, MEGA and EPIC now step up at 390, and every amount still fits.
- **FEATURE COMPLETE** was sliced by the feature-end band (its 84 px offset was 71 stage px inside `.grid-scale`);
  130 px clears the tallest band at every layout and stays in the reel window.
- **Feature entry:** the settle fades now end 50 ms before the stage is removed. The gauge used to leave at 0.78 to
  0.95 opacity at Turbo and Super; fades sized to the stage still measured 6 to 15%. A timing model that matched every
  measured value puts the residue under 0.3% at steady frames; a late frame can still leave a few percent (0.055 in
  one steady Super run, the same in the previous build). The '+16 FREE SPINS' text shrinks as it fades (my first cut
  snapped it to half size in one frame on every entry; the second verification caught it), the needle holds at 0
  degrees, smoke and ring finish instead of being cut, the ring scales with Turbo, and reduced motion no longer zooms
  the gauge at settle.

**D, the title (commit 954ec600).** One restrained emissive pulse: a theme-cyan glow whose opacity alone animates,
4.6 s, off beat with the reel frame's 3 s glow. The image stays static. Two versions failed first: a drop-shadow
animated on the image re-rasterised the letters at five of ten sizes, and a glow layer BEHIND the image made
Chromium give the image its own layer ("Overlap") and rasterise it softer at four configurations, deterministically.
The committed glow sits ABOVE the image with the letters cut out of its mask (mask-composite exclude). The third
verification, at twelve size and DPR settings: the image gets no layer of its own; its letter raster equals BEFORE
at rest; interior letter pixels are never touched at any phase; near the peak the glow reaches the anti-aliased rim
(up to 78 rim pixels at 667 DPR2, up to 21 of 255 levels; at 932 DPR3 and 412 DPR2.625 one or two rim pixels the
image draws opaque gain 9 to 10 levels of cyan, because the mask rasterises logo.png a hair differently from the
image). No halo under reduced motion.

**Open on D, and disclosed rather than smoothed over:** the third verification saw the lockup lettering go SOFT
(visibly blurred, the whole letter area) three times in about 24 DPR3 landscape loads of the candidate and never in
about 25 baseline loads: twice under a 1-minute load of 63 to 77 at the halo's trough, after its instrument paused and
seeked every animation, and once after it removed and restored the halo's animation, which no player can do. It did
not reproduce in 16 later candidate loads (rotation, lifecycle freeze, animation removal) or 6 runs under generated
stress, and the image had no layer of its own in any of them. This session reran it interleaved: 16 loads each of the committed build and the baseline at 844x390 and 932x430 DPR3, through the same steps (live, every animation paused and seeked, resumed, a rotation, a lifecycle freeze, and on the halo build the halo's animation removed and restored). **0 soft shots in 112 on the halo build and 0 in 80 on the baseline.** A positive control, the rejected halo-behind build at 844 DPR1, read soft on every step except the one with its animation removed, so the instrument sees the defect. The one known way a halo softens these letters (the image getting its own layer) is absent in every load. Not reproduced, not explained: it is its own commit (954ec600), so it can be dropped alone.

**E, reduced motion (commit 0ca05aa0).** The squash and the entry gauge zoom (above), and the feature frame colour,
which reduced motion used to lose entirely: the route recolour lived only in the pulse keyframes (180 degrees on
16,009 of 16,009 px); each route now holds its keyframe's resting filter, so the picture is the same minus the
movement.

**Also: phone SPIN (commit c97b863d).** The portrait, compact and mini SPIN buttons gave no press feedback and a still
glyph while spinning; they now take the desktop's press and arrow rotation. Transform only; resting geometry
identical; the .m-spin border fade kept; under reduced motion they match the desktop (press kept, arrows still).

**Refused, as the brief says:** Spine, a Path 1 rest-pose swap, new pose strips, the perimeter ring, the Features bolt
glyph, H2/M3 re-ingest. **Not done, parked with evidence (owner list):** scatter beats firing 440 to 480 ms before
their scatter lands (a pacing change); the band over the hero's head and the max-win overlay burying his epic (both
fixes change reaction timing, and the two lenses' fixes conflict); the band over the Overdrive odometer; preloading
the tier art (bandwidth); the max-win exit (its root is an aria-modal dialog); the feature frame hue per route
(colour, not motion); the rain; Super Turbo speed.

## Workstream 3: dead pixels (commit 060cab1c)

scene_character_car.png (91,802 B) no longer ships: only a comment mentions it, it was requested 0 times across 10
production contexts and 16 real rounds, no gate lists it, and it is already recorded dead (art_manifest_arc2.csv
SC-07). Pruned by name in vite.config.ts, listed in build_diet_verify's pruned paths; the source stays. The others
need a code deletion or an owner ruling (owner list): hero_icon_96.png 23,135 B (only the unimported
LoadingScreen.svelte uses it), panel_balance.png and panel_win.png 37,025 B (dead themeStore fields, baked English),
scene_character.png 774,813 B (owner-held Path 1 target), hud_banner.png 63,873 B (loaded, 92% hidden, owner-held),
and the idle sheet's five never-drawn frames (cropping would be a new raster). Conditionally live rasters a filename
sweep would wrongly call dead are listed in the inventory so no later pass prunes them.

## Workstream 4: the look-pass harness (commit 8eedc53f) and its screens (commit 7752e57e)

`frontend/scripts/look_pass_capture.mjs`: the production build, 1280x800 and 390x844, idle, a real 16.2x win at the
banner peak, and the natural feature entry gate. It refuses a shot, and fails red, on any undecoded image, any 404,
or a text fallback of the lockup, so no placeholder art can reach a committed screen. The committed set is
`reports/screens/r151-look-pass/`, six shots and captures.json, captured from a clean build of 8eedc53f (build-info
cleanTree true). **The version string the build shows: "Future Spinner v10 build 8eedc53f"**, v10 and the short SHA as the brief expects;
it is the console boot line, and nothing on screen renders it. The screens show two things this PR does not touch:
the chip's "1 ways" and, at the feature entry, TOTAL WIN beside a HUD WIN of 0.00.

## Evidence: what each verification round found

| Round | Agents | Built from | Failed, and what changed |
|---|---|---|---|
| 1 | 37 | 11cb54da plus the first cut | the in-band art never painted; the exit dropped the band by half its height; the lockup drop-shadow re-rasterised letters; display-board tints cyan; every stacked flame locked; the display board on Bet Replay; the entry settle left the gauge visible; .m-spin lost its border fade. All fixed. |
| 2 | 21 | 28b955fb | the burst text snapped to half size (major); reels 4 and 5 locked in live play; the display board beside a bought first round's win; the halo behind the image promoted it at four configurations; the exit still at 0.17 to 0.26 at removal. All fixed. The hero lens passed every item. |
| 3 | 12 | 28b955fb plus the third-round fixes | Turbo holds at 1.0 to 1.8% under 50 ms (the advisory offsets); the exit margin under one frame at 230 ms; the rim tint and the soft-lettering events on D (above). The offsets and the exit were changed again; D is disclosed. |
| Session | | the final code | the per-boundary offsets through the exposure model and a live pixel probe at Normal and Turbo; the 200 ms exit, 10 steady runs, 0 at removal in all 10 with 2 or 3 frames to spare; the soft lettering, 0 of 112 halo shots and 0 of 80 baseline, positive control soft |

Smoke across every round: 0 console errors, 0 page errors, 0 HTTP 400+, no /assets/assets/ request, across idle, a
3.9x win, the 16.2x bigWin exit, a bought MEGA, the natural 363.89x feature, the 5,000x cap overlay and Bet Replay, at
1280x800, 390x844 and 844x390; nothing new moves under reduced motion.

## Local CI at the code tip

Static job replayed from checks.yml: **82 pass, 0 fail**, one step skipped: `npm ci`, because the owner's dev server on
5173 runs from this checkout's node_modules and a clean install would pull them from under it. Browser matrix:
**28 pass, 0 fail of 28.** Both suites ran at e58b5b4c. The branch was then re-cut to give the halo its own commit: the final code tree is identical by tree hash to the one both suites ran on, and the rebuilt bundle differs only in the SHA and build time the boot line inlines (checked after normalising both), so every measurement above holds for it.

## Self-audit

The verification rounds were the self-audit, and they changed the work: five of my changes were wrong in ways a
player would have seen (the dead in-band art, the half-height exit drop, the re-rasterised lettering twice, the burst
text snap), and several were incomplete (plate tints, three offset sets, the Bet Replay and bought-first boards, the
settle and exit margins). Each was re-measured by a skeptic before I acted, then fixed and re-measured. Claims in
the commit messages were rewritten to the final code before the push. Fence: no raster, audio file, maths, HUD
geometry, loopBed or soundService change; no locked path; no ChatGPT; no image generation; no kit.

## Restore

Each change is its own commit: revert the one you do not want (hero 159041a6, symbols 43b95411, banner and feature
2ac6afd2, reduced-motion frame colour 0ca05aa0, title halo 954ec600, phone SPIN c97b863d, dead pixels 060cab1c,
harness 8eedc53f, screens 7752e57e, exemption eb00bd9d, records 11cb54da). Once merged: revert the merge.

**Owner preview NOT refreshed:** the brief says do not refresh 5173, and nothing landed on main.

## OWNER LIST

1. **Kit rebuild (owner).** Forbidden in this session; once this merges and you ask, the kit's manifest will differ
   from the last kit by the dropped scene_character_car.png and the changed bundle. *Owner.*
2. **Cover art and a 30 s or shorter muted hover clip** (the brief's item, "Hayden code"). Not started in R151: this
   brief forbade image generation. The look-pass harness can capture real gameplay frames if a clip is to be cut from
   the build. *Owner.*
3. **win_max stem length: still 1.81 s** (the master is 2.34 s) against the 5.0 s spec and the 2.6 s max-win reveal.
   *Owner, a longer stem.*
4. **Phone floor on the dual-mono idle:** 4.41% of energy above 200 Hz, so a phone speaker carries little of it;
   accepted in R150's brief unless you say otherwise. *Owner ear.*
5. **Warm-up and pre-loader items from R147 not closed by R148:** R147 D2 (the tension bed stays ducked if a feature
   starts inside the spin duck), D4 (the spin duck's timer lifts the bed mid-riser), D5 (the heard win levels), and
   the splash's keyboard focus (Space and Enter start the bed but leave the splash up). R148 closed D1 and D3. *Code,
   own brief.*
6. **The title halo (D), your look:** keep it, or revert 954ec600 alone. The evidence for and against is in
   workstream 2 D above. *Owner.*
7. **Motion items parked with evidence:** scatter beats firing about 460 ms before their scatter lands (pacing); the
   band over the hero's head during his reaction and the max-win overlay burying his epic (reaction timing; the two
   proposed fixes conflict); the band over the Overdrive odometer; FEATURE COMPLETE under the tier burst while the
   banner is up; preloading the tier art (bandwidth); the max-win exit (an aria-modal dialog); the route frame colours
   (natural reads red, the comments say green); the rain (barely perceptible); Super Turbo no faster than Turbo; the
   burst text's 93 px drop at settle (pre-existing); settle and exit residue under a late frame or a spam-tapped
   CONTINUE (timer-based removal). *Owner rulings.*
8. **Dead rasters needing a code deletion or a ruling:** hero_icon_96.png with LoadingScreen.svelte, the two panel
   rasters with their themeStore fields, scene_character.png (the Path 1 target), hud_banner.png. About 0.9 MB in all.
   *Owner.*
9. **Text lane:** the win chip reads "1 ways" (no singular). *Code, text lane.*
10. **Carried:** the Vite build-info restamp and build_diet_verify's unnamed media-abort flake (task chips), the
   provenance-posture sweep (now the owner's licence line exists for the 140 ms edit), loopBed.ts's stale comments,
   iOS device checks. *As recorded.*

## FOR THE NEXT SESSION

**Model and effort:** Opus 5.5, ultracode, unattended. Workflows: the inventory (6 agents, about 1.88M subagent
tokens), verification 1 (37 agents, about 7.65M), verification 2 (21 agents, about 5.36M), verification 3 (12 agents,
about 3.58M), none lost. **Plan of record:** the brief's order; the inventory decided what workstream 2 did, and the
verification rounds decided what it kept.

**Approach:** preconditions; the ruling made operative in the gate; inventory by workflow; implement the cheap set;
verify before and after on frozen builds with skeptics and a known-defect control on every item; fix what failed;
verify again, three times; recommit with messages rewritten to the final code; clean build; look-pass; both local
suites; PR.

**Alternatives rejected:** a second copy of the tier art inside the band (never painted, and fixed it doubles the
image); animating a filter on the lockup image; a glow layer behind it; the first three phase-offset sets; exit fades
of 280 and 230 ms; a Spine or new-frame route to hero life (refused by the brief).

**Lessons worth keeping:** a relative url() inside a CSS custom property resolves against the stylesheet, not the
document; an animation that sets transform replaces a centring transform on the same element; animating a filter on
an image changes how Chromium rasterises it even at the keyframe that equals the static value, and a composited layer
BELOW an image promotes the image, so put an animated glow ABOVE it with the image cut out of its mask; a phase
offset set must be searched against the landing gaps the code really produces, not only against the periods, since
an offset that separates cells starting together can lock cells that start one reel apart; an exit timer and a
transition clock do not start together, so a fade must end at least a frame or two before its removal; and a
verifier's instrument that hard-codes build names can fail every run silently, so read its exit codes.
