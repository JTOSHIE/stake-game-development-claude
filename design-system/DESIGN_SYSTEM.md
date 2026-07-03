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

## APPROVED SYMBOL LINEUP (art is skin level; maths IDs never change)
| ID | Object | Win animation | Master status |
|----|--------|---------------|---------------|
| H1 | Spinning Rim | spin up, neon flare | v2 approved (in masters/) |
| H2 | Boost Gauge (face of Overdrive) | needle slams to redline | v2 concept approved; v3 fixes: remove stray cyan arc, aim needle into redline, heavier needle |
| M1 | Steering Wheel | quick spin with glow | to design |
| M2 | Gear | fast rotation, sparks | to design |
| M3 | Headlight | full beam flare | to design |
| L1 | Lug Nut | torque spin punch | to design |
| L2 | Spark Plug | lightning burst | to design |
| L3 | Piston | rapid pump, exhaust flash | to design |
| W | Wild hub with machined W | core flare | approved (in masters/) |
| S | Energy Burst Scatter | rupture burst | approved v2 (in masters/), may iterate in game |
Idle animations: subtle mechanical motion per object (rotation, needle flicker,
pulse), breathing scale 1.000 to 1.015, periodic light sweep. Reference motion:
the H1 idle loops seamlessly over 72 degrees (five fold symmetry); the H2 win is
an ease out back slam with overshoot and a magenta redline flare. Owner taste
calibration of speeds is pending against the preview GIFs.

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
   temporary CSS to system art.
4. Build Diet v2 (Claude Code): reference scan, postbuild prune of dev only
   themes and retired videos, background re encode to under 16 MB, audio
   normalisation, dist gate under 40 MB.
5. Compliance re validation (Claude Code): full checklist against the final
   build; install stakecli (pinned release or source build; session cookie in
   keychain only) for the portal upload; generate REVIEW_EVENTS.md (event ids
   per mode: wincap round, 3/4/5 scatter triggers, retrigger, win tiers) from
   the books; headless capture of the remaining live docs pages
   (approval-guidelines/math-verification, docs/approval/checklist,
   docs/approval/game-tile, docs/math pages); liability metrics already
   verified: P(payout over 5000x) is zero in both modes by the hard cap.
Then the dossier section 5 protocol, then submit.
