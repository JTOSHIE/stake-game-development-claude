# WRS DESIGN SYSTEM: RECORD OF TRUTH
Future Spinner and all future We Roll Spinners games. July 2026.
This document plus the masters in design-system/masters/ carry the studio's
design capital. A session with only this directory and the repository can
regenerate every pending brief.

## SYSTEM LAWS
- One design output: every visual asset derives from vector masters in this
  directory. No external generation (Manus retired July 2026).
- Front facing, always. No perspective angles on symbols or UI objects.
- Text free artwork. Localised labels render in CSS Orbitron. Single exception:
  the machined W emblem inside the Wild.
- Material language: polished chrome, brushed gunmetal, warm gold accents.
  Emissives cyan #00FFFF and magenta #FF00FF together, gold #FFD700 sparingly,
  on deep navy #060610. Key light upper left. Rich saturation, never pastel.
- Masters are 1024x1024 SVG, filter free: glows are baked as layered stroke
  stacks so rendering is deterministic in any rasteriser (cairosvg or browser).
- Exports are rendered at exact display sizes from a manifest (npm run assets in
  AssetForge v2). Layered export planned: symbol part groups (spokes, needle,
  neon rings) export separately so the engine animates parts independently.
- Every symbol must read at 120x100 px, one reel cell.
- Signature colour identity per symbol: H1 cyan and magenta duo, H2 crimson
  #ff2d3d, M1 neon orange #ff9a2e, M2 neon violet #8a5cff, M3 acid green
  #5dff3c, L1 gold #ffd700, L2 electric blue #9adcff, L3 heat orange #ff7a2e,
  W magenta and cyan, S spectrum. Each symbol carries exactly one signature
  colour so the value ladder reads by hue.
- Silhouette-first differentiation: every symbol must be identifiable by
  outline alone before colour or detail resolve.
- Signature-colour tile plates behind every symbol: a dark tech plate #0b0f1c
  with the symbol's signature colour on its engine-tinted edge; the edge blooms
  on win.
- Standardised generic control overlay, reskin-free (identical structure across
  every WRS title), with exactly two themed accents: TURBO uses the existing
  turbocharger art with flames on engage, and FEATURE uses the Grille art
  carrying the button with no plate box.

## APPROVED SYMBOL LINEUP (art is skin level; maths IDs never change)
| ID | Object | Win animation | Master status |
|----|--------|---------------|---------------|
| H1 | Spinning Rim | spin up, neon flare | v2 approved (in masters/) |
| H2 | Boost Gauge (face of Overdrive) | needle slams to redline | v3.1 in masters/ (THE ANCHOR) |
| M1 | Steering Wheel | quick spin with glow | v3 in masters/ |
| M2 | Holographic Grille (EV fascia, neon violet #8a5cff) | LED bar surge, energy panel flare | in masters/ (M2_master_v2.svg) |
| M3 | Plasma Booster (acid green #5dff3c, flame with cyan shock diamonds) | plasma flame burst, cyan shock diamonds | in masters/ (M3_master_v3.svg) |
| L1 | Lug Nut | torque spin punch | in masters/ |
| L2 | Spark Plug | lightning burst | in masters/ |
| L3 | Piston | rapid pump, exhaust flash | in masters/ |
| W | Wild hub with machined W | core flare | approved (in masters/) |
| S | Energy Burst Scatter | rupture burst | approved v2 (in masters/), may iterate in game |
Idle animations: subtle mechanical motion per object (rotation, needle flicker,
pulse), breathing scale 1.000 to 1.015, periodic light sweep. Reference motion:
the H1 idle loops seamlessly over 72 degrees (five fold symmetry); the H2 win is
an ease out back slam with overshoot and a magenta redline flare. Owner taste
calibration of speeds is pending against the preview GIFs.

## SCENE, BRAND AND INSTRUMENT MASTERS (non-symbol)
- Scene group (scene_character_car.svg): the racer plus hover car, the game's
  identity character. The car is required (this is a car game). Placed left of
  the frame; idle breathing only until Motion Polish.
- Brand mark (brand_mark.svg): the WRS provider logo, a neon chrome rim whose
  inner layer spins independently.
- Instrument plate master (plate_instrument.svg): notched-corner cyberpunk tech
  frame used for the MULTIPLIER and TOTAL WIN plates and any future readouts.

## RETIREMENTS
- Win pod RETIRED.
- Themed spin and buy buttons RETIRED (replaced by the standardised generic
  control overlay with two themed accents above).

## BRAND LAYER (Phase B scope)
- WRS provider logo: square, transparent background, legible at small tile
  sizes, PNG up to 10 MB, uploaded once in portal Team Settings then Branding.
- Game tile background (environmental) and foreground hero (transparent PNG)
  for the portal Tile Editor.
- We Roll Spinners presents moment on every loading screen.
- Skin manifest reserves: brandLockup slot and bgmTracks list (the selectable
  soundtrack placeholder; the Future Spinner concept is a car radio).

## PENDING PASSES (scopes sufficient to regenerate their briefs)
1. Design batches (chat, art direction): complete H2 v3 and the six remaining
   symbols per the lineup, owner approving each batch by preview sheet.
2. AssetForge v2 (Claude Code): asset pipeline (masters plus size manifest plus
   npm run assets deterministic renderer), install all symbol exports, text free
   win pod and banner (banner as CSS), spin button matte fix, loading screen
   wordmark swap, tile and provider logo exports, skin package structure
   (tokens, masters, manifest with animation descriptors, sounds, brand slot).
3. Motion Polish v2 (Claude Code): engine driven symbol animation replacing the
   MP4 pipeline (PixiJS, layered sprites, pre blurred glow copies, no live blur
   filters), win choreography, tiered celebrations (2x, 10x, 50x thresholds,
   BIG to MEGA to EPIC staged count), scatter punch, anticipation staging,
   ambient life, all turbo aware, Overdrive presentation reskinned from
   temporary CSS to system art, plus the reel feel requirements and Overdrive
   transition in the addendum.
4. Build Diet v2 (Claude Code): reference scan, postbuild prune of dev only
   themes and retired videos, background video removed from the build (static
   backgrounds ship instead), dist gate under 25 MB, audio normalisation.
5. Compliance re validation (Claude Code): QA soak harness per the addendum,
   then full checklist against the final
   build; install stakecli (pinned release or source build; session cookie in
   keychain only) for the portal upload; generate REVIEW_EVENTS.md (event ids
   per mode: wincap round, 3/4/5 scatter triggers, retrigger, win tiers) from
   the books; headless capture of the remaining live docs pages
   (approval-guidelines/math-verification, docs/approval/checklist,
   docs/approval/game-tile, docs/math pages); liability metrics already
   verified: P(payout over 5000x) is zero in both modes by the hard cap.
Then the dossier section 5 protocol, then submit.

## ADDENDUM (July 2026): OWNER-RATIFIED LAWS AND SCOPES

### Visual hierarchy by pay tier
Premium symbols carry the most elaborate rendering and the richest animation.
Low tier symbols keep the identical palette and materials with simpler forms.
Order of elaboration: Gauge and Wild and Scatter above all, then H, then M,
then L. The player's eye must learn the value ladder without the paytable.

### The Boost Gauge is the design anchor
The Overdrive meter in the bonus IS the gauge, large and central. The H2 reel
symbol is its miniature. Win presentation borrows its language: needles,
redlines, flares. Everything else flows outward from it with less intensity.

### Static environment backgrounds
Backgrounds are premium static images, one base scene and one feature-state
variant per skin, with only whisper-level engine ambience (slow brightness
breathing). No background video ships. Future Spinner's pair derives from the
retired video: base hero graded to palette with a seating vignette, Overdrive
variant pushed magenta and darkened. Rationale: focus stays on the reels,
loops cannot betray us, and reskins need one image not one video.

### Brand layer (enriched)
We Roll Spinners plays on "we ride spinners" (spinning rim culture; the Soul
Plane nod). The brand mark is a neon chrome rim whose inner spins
independently, derived from the H1 master's layers. The standard loading
screen for EVERY WRS game: the rim spinning as the loader, the WE ROLL
SPINNERS wordmark above, the game logo slot beneath. Brand voice is playful;
generic "Studios/Gaming/Labs" tonality is forbidden.

### Intro splash (new standard screen)
After load, before the game: a feature explainer card in system style
(Overdrive rules in one glance: 3/4/5 scatters award 8/12/16 free spins, every
winning spin adds +1x to a meter that never resets, retrigger +5, feature
available for 100x where permitted) with a Continue control. Localised across
all 16 locales with social overrides. Counts toward the review clarity
criterion.

### Overdrive transition (concept of record)
Trigger: scatters flare, screen dips, the gauge slams into centre frame with
the needle ripping into the redline, a speed-line burst, background swaps to
the Overdrive variant, frame neon shifts hue, BGM shifts layer. Exit: reverse
behind the total win presentation.

### Reel feel requirements (Motion Polish v2 scope)
Ticker-driven transforms only, 60 fps, motion blur during spin, per-reel
staggered stops with overshoot slam and impact audio, the final reel extends
and holds under anticipation when two scatters are live, screen shake on
feature trigger and on 50x and above wins, reduced-motion aware. Jitter is a
defect class, not a style.

### QA programme
A repo soak harness (headless) plays 1,000+ mock spins across the locale,
social and turbo matrix asserting: integer micros balance arithmetic exact,
presented totals equal book payouts exactly, zero console errors, memory flat,
frame rate above floor. Runs as its own pass before compliance re-validation
and is inherited by every future skin. The community stake dev tool is
evaluated as a local RGS emulator. Post-deploy testing follows
SUBMISSION_DOSSIER.md section 5.
