# Session Report - FS VISUAL FIXPACK, four owner-reported visual defects (2026-07-27)

**Brief:** `reports/briefs/FS_VISUAL_FIXPACK_Prompt.md`, saved verbatim and
committed with JOB 1 per conventions (b) and (f).

**Posture:** fresh session on `main`, integrator, explicit paths, commit per job,
no lock exceptions and none needed. Six jobs in one session, which multi-track
rule 4 asks be justified: every one is a single named defect with a single named
surface, three of the four share the same verification harness, and JOB 5 cannot
start until the other four are green because it builds from what they produced.

**Headline.** Four owner-reported defects, each root-caused by measurement rather
than by reading, each fixed at the class rather than at the instance, each held
by a new gate that was watched failing on the real defect before it was believed.
Three of the four turned out to be one wrong thing affecting more surfaces than
the report named: the paytable fix also repaired the mode cards, the scrim fix
replaced ten hand-rolled implementations with one, and the speed control needed
its Popout S surface reworked after measurement said the first attempt was flat.

| Job | Commit | Gate added |
|---|---|---|
| 1, splash motion | `03672d9` | `splash_calm_gate.mjs` |
| 2, turbo control | `f8fc733` | `turbo_intensity_gate.mjs` |
| 3, paytable card fill | `ee6eb60` | `paytable_card_fill_gate.mjs` |
| 4, blackout coverage | `f332d52` | `scrim_coverage_gate.mjs` |
| 5, KIT V6 | `7d5d4e4`, `14b6506` | kit builder self-test, 5 of 5 |
| 6, close | this report | |

---

## JOB 1: the load screen's logo stops spinning

**The owner reported** the We Roll Spinners logo jumping around and starting to
spin, and ruled the boot calm: still logo with a gentle pulse, raindrops, TAP TO
CONTINUE, nothing else moving.

**First finding, and it redirected the job.** The SPLASH was already correct.
Measured across ten seconds at 250ms, `HeroSplash`'s emblem moved 0.00px, and
every animation on that screen was opacity-only. The defect is on the LOAD
screen, which the owner reasonably calls the same thing because they meet them
back to back.

**Root cause, which is the owner's own hypothesis confirmed.** `LoadingScreen`
used to draw the mark as two layers: a static chrome rim (`brand_mark_base.png`)
with an inner five-fold blade (`brand_mark_spin.png`) over it. Only the blade
carried `animation: brand-spin 2.6s linear infinite`, so the mark's outline never
moved. `DESIGN_SYSTEM.md` describes exactly that: "a neon chrome rim whose inner
layer spins independently". Commit `54544e4` (OWNER AUDIT ROUND 3 item 1, logo
canonicalisation) replaced both layers with ONE image, `hero_icon_96.png`, and
left the rotation sitting on it. The animation was keyed to a layer that no
longer existed.

**The jumping and the spinning are one defect, not two.** The canonical artwork
is not radially symmetric, so rotating it swings its axis-aligned bounding box.

| Preset | Box excursion before | After |
|---|---|---|
| Desktop 1200x675 | 77.25px | 0.00px |
| Mobile L 425x812 | 57.96px | 0.00px |
| Popout S 400x225 | 97.66px | 0.00px |

**Fixed.** The mark sits still and its glow breathes as a FILTER pulse rather
than a scale. That choice is load-bearing rather than stylistic: a scale pulse
moves the box, and the gate could then only assert "moved a little", which is not
a property. The two entry fades drop their `translateY(-8px)`, which is what slid
the wordmark and the game logo into place on every load. The splash emblem's glow
gains a matching OPACITY pulse, so "logo sitting still with its gentle pulse" is
true on both screens. The loader gains the same `RainLayer` the splash uses, so
the two boot screens read as one calm presentation rather than a stark loader
cutting to a rainy splash.

**Proof:** `reports/screens/splash-calm-2026-07-27/`, 72 captures, before and
after, two surfaces by three presets by six points across the first ten seconds.

**Gate:** `splash_calm_gate.mjs`. Samples every 250ms for ten seconds at three
presets and asserts three independent things: zero geometry variance, no rotation
or translation in the computed matrix, and no running animation writing
`transform`. The third is the structural one. Geometry alone would pass a
rotation that happened to be radially symmetric, and a future asset swap could
reintroduce this exact defect behind a symmetric image and then break the day the
art changed again. It went red on the real unseeded defect at HEAD, 21 findings,
before the fix existed.

---

## JOB 2: the speed control is the bolt alone

**Owner-specified.** The control showed the bolt with a 0.5rem "1x / 2x / 4x"
caption the owner called too small and silly. The numeral is gone at all four
surfaces that render this control, and the three speeds now say which they are by
the control INTENSIFYING.

**Why this could not be a pure deletion.** The control lit on a single boolean,
`.engaged`, so Turbo and Super Turbo were styled IDENTICALLY and the numeral was
the only thing separating them. Removing it without replacing that encoding would
have shipped two speeds a player cannot tell apart at all.

**Luminance, not hue.** Every step raises brightness. A hue-only encoding fails
WCAG 1.4.1 for a colour-blind player and fails again on a phone in daylight, and
it would also be unmeasurable. The accessibility property and the measured
property are therefore the same property.

**Popout S needed a second look, and only measurement said so.** At 400x225 the
control lives only in the mini-player menu, so the menu item IS the control. With
the intensity on the 16px bolt alone, the adjacent steps measured 1.014:1 and
1.030:1, effectively flat, because the bolt is a few percent of a row a player
reads whole. The row's fill and leading edge now intensify with it.

| Preset | normal to turbo | turbo to super |
|---|---|---|
| Desktop | 1.34 | 1.70 |
| Laptop | 1.31 | 1.67 |
| Popout S | 1.35 | 1.53 |
| Popout L | 1.43 | 1.70 |
| Mobile L | 1.46 | 1.75 |
| Mobile M | 1.46 | 1.75 |
| Mobile S | 1.39 | 1.65 |

**The bar is 1.25:1 and it is NOT borrowed from WCAG.** SC 1.4.11's 3:1 governs a
component against its ADJACENT COLOURS, and says nothing about two states of one
component, so quoting it here would be borrowing authority the figure does not
have. Every measured figure is in `reports/qa/turbo_intensity_gate_2026-07-27.json`
so the owner can raise the bar knowing exactly what headroom the shipped design
has.

**The flame animation is removed, deliberately.** It swung brightness 1.0 to 1.28
twice a second on any engaged tier. Once intensity IS the state, something that
changes intensity makes the state ambiguous: a pulsing Turbo passes through Super
Turbo's brightness on every cycle.

**Unchanged:** three speeds, their behaviour, and the `disabledTurbo` /
`disabledSuperTurbo` jurisdiction gating. Presentation only, as specified.

**Paytable Interface Guide:** the row shows all three captures in order rather
than one, because the whole design is the progression. They are real crops of the
live control at each speed, and the row's name and description stay routed
through `sv()`, the social vocabulary layer.

**Proof:** `reports/screens/turbo-control-2026-07-27/`, the three speeds side by
side at Desktop, Mobile L and Popout S with each state's measured luminance
printed underneath.

**Two broken scripts found and fixed, because JOB 2 could not be done without
them.** `regen_interface_guide_icons.mjs` and `interface_guide_icon_proof.mjs`
were both broken, identically. A dedup pass inserted
`import { dismissIntro } ...` at a byte offset rather than a statement boundary,
and in both files that offset was inside the PYTHON source string each one
builds. Each threw "dismissIntro is not defined" before it ran, and its python
would not have parsed if it had. Those two are the only files in `scripts/` that
embed python, which is why those two were hit. `interface_guide_icon_proof.mjs`
was also migrated to `evidencePaths` per convention (h.1): it wrote its proof
grid straight into committed evidence.

---

## JOB 3: a paytable card's fill follows its frame

**The owner reported** the WILD and SCAT cards' background fill stopping short,
so the chrome shows below their text while every other card is clean.

**Root cause.** The card primitive is two elements: `.fs-plate` is the brushed
chrome FRAME and its `.fs-face` child is the dark FILL carrying the content. The
frame was a BLOCK container, so the fill was only ever as tall as its own
content. That is invisible wherever the frame is content-sized too, and wrong the
moment something else stretches the frame. `.fs-sym-grid` is a grid, and grid
items stretch to their row.

| Card | Frame | Fill | Chrome exposed |
|---|---|---|---|
| H1, H2, M1, M2 | 197.36px | 193.6px | 0 |
| WILD | 197.36px | 170.35px | **23.14px** |
| SCAT | 197.36px | 156.59px | **36.89px** |
| Mode cards | 173.83px | 154.54px | **15.42px**, unreported |

**So it was never about WILD and SCAT.** It is about any card whose content is
shorter than its row, in any locale, forever. Padding those two would have been
wrong the next time a translation changed a line count. The frame is now a flex
container and the fill a stretching item.

**Gate:** 374 cards over 22 runs. Asserts BOTH directions, because a fix can fail
either way: the fill covers the frame (the shipped defect), AND every text box
and image sits inside the fill (the defect that pinning the fill to a fixed
height would introduce instead, which is the cause the brief itself suspected).
The sixteen locales are DERIVED from the shipped `Locale` union rather than
listed, so a seventeenth is covered the day it lands.

**Nothing was reconstructed, and this matters.** The brief says the owner's
screenshot "is committed as the spec". It is not in the repository. Convention
(m) says a missing input is named and waited for, never reconstructed, so nothing
was inferred from it: the defect above was reproduced independently and measured
here, and the before capture in the evidence directory is this session's own.
Named as comms item 4 below.

---

## JOB 4: ten hand-rolled scrims become one

**The owner reported** the full-screen dark overlay not always covering the whole
screen, with the corners showing through at some sizes.

**Root cause, and "at some sizes" is the tell.** On desktop, `.game-wrapper` is a
1280x720 box carrying `transform: scale(var(--S))`, and a transform makes an
element the containing block for its `position: fixed` DESCENDANTS. Every dialog
scrim lives inside it, so `inset: 0` resolved to the STAGE and not to the
viewport. `PaytableModal`'s own comment said so approvingly: it "covers the stage
exactly". Covering the stage exactly is invisible while the window happens to be
16:9, because then the stage IS the viewport, and it leaves the letterbox bands
bare at every other shape. The corners are simply where a player's eye meets the
two bands.

| Window | Scrim rendered | Uncovered | Edge points missed |
|---|---|---|---|
| 1600x600 | 1066.67x600 | 266.67px each side | 26 of 40 |
| 900x900 | 900x506.25 | 196.88px top and bottom | 30 of 40 |
| 1100x980 | 1100x618.75 | 180.63px top and bottom | 30 of 40 |

**All seven platform presets passed**, which is why this survived every existing
gate: Desktop is 1200x675, exactly 16:9. The defect only exists away from the
aspect ratio the stage was designed at, and no gate had ever looked there.

**Ten scrims, one implementation.** `.fs-scrim` in `src/app.css`, the global
sheet, which is the point: Svelte scopes a component's styles to that component,
so ten components carrying "the same" rule is ten rules that only look identical,
and this project was bitten by that shape twice in this one session (the
duplicated `dismissIntro` import, the duplicated `.fs-plate` primitive). A
component now supplies only its own paint and layout.

It covers the viewport from inside a scaled ancestor by anchoring to the
wrapper's centre, which `.game-stage` guarantees is the viewport's centre, and
sizing to the viewport DIVIDED by the stage scale. `--scrim-scale` is
deliberately not `--S`: the three native-HUD modes set `transform: none` while
`--S` keeps its computed value, so dividing by `--S` there would be dividing by a
scale nothing is applying.

**Safe-area insets, stated honestly rather than overclaimed.** The shared rule
sizes from `100vw` and `100dvh`, which span the whole visual viewport INCLUDING
the inset regions, and the gate asserts the rule contains no `env(safe-area-inset`
reference, because respecting one here is the regression a well-meaning later
edit would make. Headless chromium reports every inset as zero, so no run here
exercises a real notch and this does not pretend to; the property asserted is the
one that makes insets a non-issue.

**Gate:** 50 measurements, five scrims at seven presets and three swept sizes
chosen to maximise letterboxing. Coverage is asserted by rect AND by hit-testing
forty points one pixel inside every edge, because the rect test alone would pass
a correctly sized scrim that an ancestor clips. It also reads the SOURCE and
fails any component that hand-rolls scrim geometry, since "one implementation" is
a property of what is written, not of what happens to render today.

**Also fixed:** `dismissIntro`'s rules-modal half took a single instantaneous look
100ms after dismissing the splash, while its splash half polls for exactly the
reason the comment above it gives. The rules modal is mounted BY that dismissal,
so any run where Svelte had not yet painted left a full-screen modal over every
control the caller was about to drive.

---

## JOB 5: KIT V6

`~/Desktop/FS_UPLOAD_KIT_V6/`, built from a fresh clone at `14b6506d`, frontend
only, single use. **110 files, 15,601,767 bytes (14.88 MB).** All three dist
gates run IN THE CLONE and passed: dist hygiene, dash gate dist scan, mock
containment. The kit's own refusal self-test passed first, 5 of 5.

**Verified in the built kit rather than assumed:** 110 files in
`02_frontend_upload`; the three speed-control icons present; PART 9e present in
the shipped walkthrough; no maths folder; `BUILD_INFO.json` stamping the commit
and the three gate results. The count went 108 to 110 and the two are the two new
speed-control captures, which is a figure that reconciles rather than one to
take on trust.

**`00_READ_ME_FIRST.md` gains PART 9e, the V6 visit**, and PART 9d is marked
superseded rather than deleted. It is the short flow the brief asks for: upload
and publish V6, then four things to look at, each written as a question rather
than a claim. The speed one is asked as "can you tell the three apart at a
glance, without studying them", because the gate measuring a 1.30:1 step is not
the same as an eye saying so.

**A stale figure fixed on the way.** The walkthrough said "108 files" in three
places including "if it reads fewer than 108, stop", which would have had the
owner halt a correct 110-file upload and report a fault that was not there. 108
was right when written, and that is the problem: the count changes every release
and the page cannot know it. It now points at the kit's own `README.md` and
`BUILD_INFO.json`, which are generated from the clone that produced the bundle
and so cannot be stale by construction.

---

## Comms items for one ruling block (facts discipline item 6)

1. **`DESIGN_SYSTEM.md` still states the WRS standard loading screen is "the rim
   spinning as the loader"**, for every WRS title. This brief's ruling is the
   later and better-informed instrument and therefore governs (convention n), so
   the mark is still. The design-system line was NOT edited on the builder's own
   authority. Amend it to describe a still mark with a breathing glow, or restore
   the spin as a deliberate exception. Surfacing rather than choosing quietly is
   the expected move here, not an escalation.
2. **The ruling says "nothing else moving" and the loader's progress bar still
   moves.** It was kept because it is a readout of real load progress rather than
   decoration, and a loading screen with no progress indication is a product
   decision rather than a defect fix. If the owner wants it gone, that is one
   line.
3. **`OWNER_CHECKLIST.md` is not in the repository.** JOB 5's brief says the
   remaining owner list is in it. No commit in the history adds it and no file of
   that name exists in the tree. Per convention (m) it is named and waited for,
   never reconstructed: PART 9e carries the brief's own four eyeball items and
   nothing was invented to stand in for the rest. Send the file and it becomes
   PART 9f.
4. **The owner's paytable screenshot said to be "committed as the spec" is not in
   the repository either.** Not blocking, because the defect was reproduced and
   measured independently, and the before capture in evidence is this session's
   own. Recorded so nobody later believes a supplied spec was worked from.
5. **Removing the speed numeral leaves brightness and the title tooltip as the
   state cues.** Brightness, not hue, is deliberate and is what the gate
   measures, so the encoding survives colour blindness and a washed-out screen.
   Flagged in case the owner wants a text affordance somewhere else in the
   interface as well; the Interface Guide row now names all three speeds.
6. **Five kits now sit on the Desktop**: `FS_UPLOAD_KIT` (dead), `_V3`, `_V4`,
   `_V5` and the live `_V6`. That is the TR-062 configuration and it is now one
   worse than when the V5 session flagged it. Deleting the owner's Desktop
   folders is not a call a session should make unasked, but it needs asking.

---

## Self-audit before reporting, per the facts discipline item 4

- **Brief followed as written.** Four defects, each fixed at root with a measured
  proof; commit per job; explicit paths at every commit; no minor-defer
  disposition used anywhere.
- **No lock exceptions, and none needed.** All four locked paths clean in
  `git status` at every commit; `git diff .claude/settings.json` empty; nothing
  written to a locked path by any route including Bash. The one place a locked
  path was relevant, `gameStore.isTurbo`, was read and left alone: JOB 2 changed
  presentation only and `speedMode.ts` already keeps the locked boolean in sync.
- **Nothing that appeared to need a locked path arose**, so nothing was parked on
  that ground.
- **No em or en dashes** in any file written this session, checked per file and
  by the dash gate's source and dist scans.
- **Every number in this report is either a gate's own output or a measurement in
  `reports/qa/`**, and each is reproducible by re-running the named script.
- **Every gate added ships a convention (p) self-test** that plants the defect in
  the form it really occurs and is confirmed red on it, with an unseeded control
  confirmed green. Two of the three went red on the REAL unseeded defect at HEAD
  before the fix existed, which is stronger than a seed.
- **Derive before measuring, convention (l).** Three of the four root causes were
  read out of the source first and then confirmed by measurement rather than
  discovered by it: the two-layer-to-one-layer asset swap, the block-container
  plate, and the transform-creates-a-containing-block rule. The fourth, the
  turbo step sizes, has no specification to derive from and is honestly empirical.

---

## FOR THE NEXT SESSION

**Model and effort.** Opus 5 at high effort. The judgement was in four places:
recognising that the splash the owner named was already correct and the defect
was one screen earlier; distrusting the first turbo design when the gate reported
a flat 1.014:1 at Popout S rather than adjusting the threshold to fit it;
choosing to fix the plate primitive rather than the two named cards; and reading
the scrim defect as a containing-block problem rather than a sizing one, which is
what made a single shared rule possible instead of ten patches.

**Alternatives tried and rejected.**

- *Making the boot logo's pulse a `scale()`.* Rejected. It reads the same and it
  would have made the assertion unstateable: a moving box cannot be asserted to
  be still, so the gate could only have said "not much", which is not a property.
- *Keeping the flame animation on the engaged speed tiers.* Rejected once
  intensity became the state. A pulsing Turbo passes through Super Turbo's
  brightness on every cycle, so the two stop being distinguishable at exactly the
  moment the owner asked they be.
- *Lowering the turbo step threshold to accommodate the first Popout S result.*
  Rejected outright. The measurement was correct and the design was weak; moving
  the bar to fit a weak design is how a gate becomes a formality.
- *Padding the WILD and SCAT cards.* Rejected on the general case: it is wrong
  the next time a translation changes a line count, and it would have left the
  mode cards broken since nobody had reported those.
- *Portalling the scrims to `document.body` to escape the transform.* Rejected.
  It escapes the transform and also escapes `--theme-primary` and the scheme
  tokens, which are set on `.game-wrapper`, so every modal would have lost its
  theming to fix its geometry.
- *Moving the scale off `.game-wrapper` onto an inner element, as the native-HUD
  modes already do.* This is arguably the deeper fix and it was rejected on
  blast radius, not on merit: desktop layout, the layout fit gate, the contrast
  gate and the composition gate all measure against that box. Recorded here
  because it is the right thing to do when there is a session for it.
- *Deleting the stale Desktop kits.* Rejected as not this session's call, and
  raised as comms item 6 instead.

**Open work this session did not close.**

- **`modal_safety_proof.mjs` fails at HEAD and still fails.** Not caused by this
  session: verified by stashing every source change and reproducing it at
  `f8fc733`. It times out clicking the FEATURES button. Directly measured and NOT
  a player-visible defect: the button is present, enabled, `pointer-events:
  auto`, unobstructed at its own centre, and disabled only for the duration of a
  spin exactly as designed. Parked per multi-track rule 6 rather than solved in
  the margins of another job. It is local-only and not in CI. The `dismissIntro`
  polling fix in JOB 4 was found while chasing it and stands on its own merits.
- **`popout_conformance.mjs` overwrites committed evidence** in
  `reports/screens/audit-remediation-v1/`, found by running it and watching three
  PNGs go dirty. Restored from HEAD. That is the same (h.1) hazard as the four
  already named in CLAUDE.md; this session migrated
  `interface_guide_icon_proof.mjs`, so the remaining set is
  `layout_fit_gate.mjs`, `contrast_gate.mjs` and `popout_conformance.mjs`. Worth
  doing as one pass rather than opportunistically.
- **The `.fs-plate` primitive is copied into four components**
  (`PaytableModal`, `FeatureMenu`, `WinBreakdown`, `WinBanner`). Only
  `PaytableModal`'s was fixed, because only its cards sit in a stretching grid
  today and changing what is not broken is not free. The duplication itself is
  the hazard and it is the same shape as the scrim duplication JOB 4 removed.
- **Em and en dashes remain in `frontend/scripts/*.mjs` comments.** The dash gate
  scans `src/` and `dist/` by design, so these never reach a player, but
  CLAUDE.md's header says "anywhere". Cosmetic, and a mechanical sweep.

**What the V6 visit is expected to return.** Four eye-calls, all on things
already measured, so a disagreement is information rather than a failure: does
the mark hold still for ten seconds, can the three speeds be told apart at a
glance, do the WILD and SCAT panels reach the bottom of their cards, and does the
darkening reach every edge with the window deliberately the wrong shape. Carried
over from V5 and still open: the twenty bracketed Cruise spins and the Guidelines
ticks, both written out in full in PART 9d, neither blocked by anything in V6.
