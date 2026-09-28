R151: PRESENTATION MOTION PASS. Review lane. Opus. Unattended.

Owner ruling from R150: ACCEPT the bgm_loop seam exemption at
this master's hash. Do not loosen the 2.0 dB limit. Do not
re-encode audio. Do not generate images. 5173 untouched.

PRECONDITIONS
1. If PR #186 is open and green, merge it (merge commit).
   Checkout main. Confirm HEAD contains 7edf9ea5 or its merge.
2. Fingerprint rasters. Confirm sounds/bgm_loop is the R150
   take. Leave audio files byte-identical.
3. Build dist. Record size vs 26,214,400 B cap.
4. Own preview on a port that is not 5173. Prove identity by
   hashing a known shipped asset against this tree.

FENCE
No new rasters. No ChatGPT. No maths. No HUD geometry.
No loopBed / soundService audio graph changes except if a
mute or reduced-motion path is already broken.
Kit packaging forbidden until this PR merges and the owner
asks for a kit.

GOAL
Reviewer tags left: poor animations, low-quality assets.
Assets are in. This session makes what is already on screen
move like a shipped slot, using art that already exists.

WORKSTREAM 1 — motion inventory (measure, do not guess)
For each live surface, record in the report: what moves,
fps of the cycle, amplitude in px or %, reduced-motion
behaviour, and whether a player sees it in the first 10 s.

Must cover:
- Hero idle float (car-class bob)
- Hero win unfold + feature brace (frame count, dissolve)
- Per-symbol CSS idles (the R087 set; prove they still
  survive Svelte scoping)
- Scatter / wild emphasis
- Reel stop, win flash, shock ring
- Win banner (big / mega / epic) — geometry, duration,
  contrast of the live amount
- Max-win overlay vs hero (does it bury him)
- Feature entry (no perimeter ring — R131 removed it)
- Turbo / spin press feedback
- Title lockup (logo.png) — static or not

WORKSTREAM 2 — cheap motion only, from existing assets
Implement only what is already wired or is a CSS/GSAP
change on existing rasters. Ranked:

A. Symbol life: if any idle class is dead again, restore
   the liveness gate pattern. Do not commission overlays.
B. Win banner: the live bar is the small in-reel band,
   not a 1920×240 rail. If the current banner still reads
   as a flat colour slab, use the text-free blooms already
   in ui/win that R115 placed — do not import refused
   1920 rails. Contrast of the amount must stay ≥ 4.5:1
   on the mean of the band.
C. Hero: do not unfreeze the idle flipbook. Keep the float.
   If the win unfold still ticks, only retune the dual-
   buffer dissolve already in HeroIdle.svelte. No new
   frames.
D. Title: one restrained emissive pulse on the lockup if
   it is fully static and the pulse cannot bake text.
E. Drop anything that fights reduced-motion.

Refuse: Spine, Path 1 rest-pose swap, new pose strips,
perimeter ring, Features bolt glyph, H2/M3 re-ingest.

WORKSTREAM 3 — dead pixels
List every theme raster in dist that no component loads.
Exclude them from the Vite include list if safe and if
the saving is real. Do not delete sources.

WORKSTREAM 4 — look-pass harness
At 1280 and 390, capture idle, a ≥10x win, and feature
entry. No placeholder art in committed screens. Report
version string the UI shows (expect v10 + short SHA).

WORKSTREAM 5 — records
Dated notes only. audio_verify seam exemption recorded
as OWNER ACCEPTED AT HASH <r150 bgm_loop hash>.
Licence line for the 140 ms ChatGPT idle edit: owner
commissioned development-stage cue, pending written
audio terms; Ticket 456254 remains images-only.

CLOSE
Self-audit the diff. Local static + browser matrix.
PR review lane. Do not merge. Do not refresh 5173.

OWNER LIST at the end, numbered:
- Kit rebuild (owner)
- Cover art + ≤30 s muted hover clip (Hayden code)
- win_max stem length (still 1.81 s)
- Phone-floor on this dual-mono idle
- Warm-up / pre-loader items still open from R147 if
  not already closed by R148
