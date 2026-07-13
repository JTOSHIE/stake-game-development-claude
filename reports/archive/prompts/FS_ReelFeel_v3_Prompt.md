# FS REEL FEEL v3 + SYMBOL LIFE v2: the mechanic itself (run at Opus 4.8 High)

READ FIRST: reports/SESSION_REPORT.md and its FOR THE NEXT SESSION block, reports/archive/2026-07-04_audit-remediation.md, design-system/LAYOUT_SPEC.md through v3.5, DESIGN_SYSTEM.md. Context: the current spin is a fixed-cell texture noise cycle (GameGrid _cycleColumnRandom); this session replaces the mechanic with true travelling tiles. Autonomy posture per CLAUDE.md (g). Hard locks unchanged; no exception granted; stop and report if you conclude one is needed. Branch claude/reel-feel-v3 from up-to-date main.

## Task 1: Tile-strip reel engine (the core rebuild)
Rebuild each reel as a wrapped vertical strip of TILE UNITS, where a tile is one container holding the plate sprite and its symbol (and the symbol's animation layers) moving together. Motion profile per spin: accelerate 140ms cubic-in to cruise; cruise at a per-tier velocity with velocity-scaled vertical stretch on the travelling tiles (up to 1.18) and a subtle alpha trail; populate passing tiles from a weighted random pool; decelerate cubic-out into an index-aligned stop landing the book's result row exactly, with 22px overshoot and a spring settle; per-reel stagger 90 to 140ms left to right. Slam-stop (spin pressed mid-spin) collapses to a fast deceleration, never a teleport. Scatter anticipation extends the final reel's cruise under the existing glow, honouring the 300ms floor at every tier. Speed tiers scale velocity and durations; Super Turbo lands near-instant but still travels. The noise-cycle code path is deleted, not bypassed.

## Task 2: Drop mode, owner eye test
Behind a dev toggle fs_reel_mode with values strip (default) and drop (localStorage plus the dev theme flag surface): the same tile units instead fall from above the frame per row with gravity easing, per-column stagger, and a squash-and-settle landing, result rows identical. Both modes share the tile unit system; the toggle switches choreography only. Commit one GIF of each mode.

## Task 3: Symbol Life v2, the Set A language at gameplay scale
Idles run on settled tiles and pause while travelling. Implement per symbol with amplitudes tuned to read at 120px: H1 spoke layer continuous rotation, one revolution per 8s; H2 nitro crimson charge halo breathing over 2.4s with valve hiss opacity flicker; M1 rim dash stream via stroke offset animation on its export plus a rev LED chase at 1.8s (pipeline exports an LED overlay strip if needed); M2 coil highlight chasing down the spring at 1.4s with a 3px body bob; M3 booster flame as a 6-frame flipbook at 9fps; L1 facet glint sweep every 3s with bore ring pulse; L2 arc flicker at random 120 to 400ms intervals; L3 crown pump 6px over 2.2s; W dual rings pulsing in opposite phase; S rays rotating one revolution per 12s with core pulse. Implementation: engine tweens on the existing layered exports wherever possible, plus pipeline extensions exporting deterministic flipbook frames for the booster flame (6) and fuse arc (4), packed as sprite sheets and played via AnimatedSprite. All idles respect prefers-reduced-motion (static frame).

## Task 4: Charge states, the Set B language
Scatter anticipation: while the final reel travels with two scatters live, landed scatter tiles run the charge loop, signature glow bloom, three orbiting sparks, scanline sweep. Win pre-burst: 250ms of charge on winning tiles before the existing plate bloom and particle burst fires. Pooled sprites, zero per-frame allocation.

## Task 5: Cold-start eliminated, persistent mount authorised
Replace the warm-then-unmount with a PERSISTENT hidden mount of the Overdrive entry overlay and BonusInstrumentColumn (mounted once at load, opacity 0, visibility hidden, aria-hidden, pointer-events none, kept mounted for the session). Re-measure; the 182.8ms first-entry frame must be gone.

## Task 6: Gates, all repo-verifiable
motion proof harness on a fresh page: average fps 55 or better across 20 spins including a first bonus entry, ZERO frames over 100ms (now a hard gate), p95 and p99 reported; three committed GIFs to reports/screens/reel-v3/ (strip cycle, drop cycle, idle plus charge showcase), each under 3MB; occlusion audit re-run clean; exact-total 58/58; npm run assets byte-identical twice; build and svelte-check clean.

## Task 7: Ship
Session report with the motion profile constants table, per-tier effective timings, fps log, and the FOR THE NEXT SESSION block (expected remainder: owner strip-versus-drop verdict and recording review, audio delivery, compliance re-validation, portal one-timers, dossier section 5); archive; commit explicit paths; push; PR into main via gh titled "Reel Feel v3: travelling tile strip, drop mode, symbol life, charge states" with the report as description.
