FS_AutonomyHandover_Prompt.md. Save this brief verbatim as FS_AutonomyHandover_Prompt.md and commit it with this session per convention.

On a new branch claude/autonomy-handover from up-to-date main, do all of the following, then write reports/SESSION_REPORT.md plus a dated archive copy, commit everything with explicit paths, push, and open a PR into main via gh titled "Autonomy profile and handover state capture" with the session report as description.

TASK 1: Replace .claude/settings.json with exactly:
{
  "permissions": {
    "defaultMode": "acceptEdits",
    "additionalDirectories": ["/Users/jt/Desktop"],
    "allow": ["Bash", "WebFetch", "WebSearch"],
    "ask": [],
    "deny": [
      "Edit(frontend/src/lib/services/rgsService.ts)",
      "Write(frontend/src/lib/services/rgsService.ts)",
      "Edit(frontend/src/lib/stores/gameStore.ts)",
      "Write(frontend/src/lib/stores/gameStore.ts)",
      "Edit(games/future_spinner/**)",
      "Write(games/future_spinner/**)",
      "Bash(git push * --force*)",
      "Bash(sudo *)"
    ]
  }
}

TASK 2: Append to the CLAUDE.md Session Conventions: (g) Autonomy posture: the owner pre-authorises all commands, network access and Desktop writes for every session; never pause to request approval for anything the settings permit; the deny rules are the only boundary and remain machine-enforced; owner-sanctioned lock exceptions continue to follow convention (d).

TASK 3: Create HANDOVER.md in the repo root with EXACTLY the content between the BEGIN and END markers.

--- BEGIN HANDOVER.md ---
# FUTURE SPINNER: HANDOVER AND STATE CAPTURE
Date: 2026-07-03 (post Stage 2, pre AssetForge). Supersedes prior handovers.
A fresh session with the pinned project instructions plus this repository can
resume from here without asking the owner anything.

## 1. ORIENTATION
Roles per pinned instructions: Claude in chat is strategist, art director and
independent verifier reading this repo directly; Claude Code is the only
writer. Conventions live in CLAUDE.md. Compliance posture in
COMPLIANCE_WATCH.md. Submission frame in SUBMISSION_DOSSIER.md. Latest session
detail in reports/SESSION_REPORT.md and reports/archive/.

## 2. MERGED AND VERIFIED STATE
- PR 1: compliance foundation (disclaimer, social mode 16 locales, replay,
  responsive six viewports, paytable fix). PR 2: canonical base-only package.
- PR 3: workflow conventions (.claude/settings.json machine locks, session
  reports, compliance watch, live docs captures, v5 manual).
- PR 4: Overdrive Free Spins two-mode maths. Both modes EXACTLY 96.3500% RTP
  at 4dp (base 96.3499998727%, bonus 96.3499999962% at 10dp), base hit 29.11%,
  SD 17.28x, trigger 1 in 184.7, buy 100x fair (avg 96.35x), hard cap 5,000x
  both modes, zero rounds over cap. Independently verified by chat Claude via
  integer recomputation. PAR v2 documents the two-mode game.
- PR 5: SUBMISSION_DOSSIER.md committed, checklist retired. Blurb v2 in its
  section 3 is OWNER APPROVED.
- PR 6: Stage 2 feature frontend. Round interpreter with exact-total gate
  PASSING 44 of 44 sample rounds (verified first-hand by chat Claude running
  the test); free spins presentation; bonus buy with jurisdiction hiding;
  272 social-safe strings across 16 locales; bonus replay with 100x cost
  display; one sanctioned additive rgsService.ts change (mode in play request,
  jurisdiction flags store, raw round events store), lock re-armed and
  verified intact in every commit.
- PR 7: design system seed (design-system/DESIGN_SYSTEM.md plus four masters:
  W, S, H1_v2, H2_v2).
- Design system ADDENDUM (hierarchy law, gauge anchor, static backgrounds,
  brand layer, intro splash, Overdrive transition, reel feel, QA programme):
  executed as a brief; VERIFY ITS MERGE STATUS at session start.

## 3. APPROVED BUT NOT YET COMMITTED (the at-risk design capital)
The full ten-symbol set, batch 4 direction and layout are OWNER APPROVED in
chat but the new masters exist only in the art session, scheduled for
verbatim embedding in the AssetForge mega-brief. If that brief is never
delivered, rebuild from these binding specifications (all: 1024 SVG,
filter-free baked glow stacks, front-facing, text-free, chrome and gunmetal
and gold materials on deep navy, silhouette-first, one signature colour each):
- H1 Spinning Rim: cyan plus magenta duo hero (committed as H1_master_v2).
- H2 Boost Gauge v3.1 THE ANCHOR: crimson dial (#ff2d3d), gold outer trim
  (no outer neon ring), chrome bezel six bolts, extended redline arc with
  white hash ticks, heavy crimson needle at 62 degrees with counterweight
  tail, thin cyan low-range arc, gold hub. The in-bonus meter is this master
  large with the remaining-spins readout integrated into the face artwork.
- M1 Steering Wheel v3: neon orange #ff9a2e, open silhouette, chrome torus,
  flat-bottom bar, crimson centring stripe, rev LED arc greens to amber to
  red, thumb grips, three spokes (left, right, down) with F1 buttons,
  gunmetal hub, gold ring, amber digital dash.
- M2 Holographic Grille: neon violet #8a5cff, landscape EV fascia, chrome
  frame with gold corner bolts, cyan LED light bar, chrome slats over violet
  energy panel, centre gold rhombus badge ringed cyan, lower vents.
- M3 Plasma Booster: acid green #5dff3c, horizontal burst, gunmetal housing
  with green readout, chrome collar, nozzle with plasma ring, layered green
  flame with white core, three cyan shock diamonds, sparks.
- L1 Lug Nut: gold hexagon, gunmetal facet, dark bore with gold neon ring.
- L2 Spark Plug: electric blue #9adcff, vertical, gold terminal, ribbed
  ceramic, chrome hex, threads, bent electrode with blue-white arc at gap.
- L3 Piston: heat orange #ff7a2e, vertical, gunmetal crown with ring grooves
  and heat-glow top edge with shimmer, rod down to chrome big-end with ember
  bore. W and S committed in PR 7.
- Tile plates law: every symbol on a dark tech plate #0b0f1c edged in its
  signature colour with faint circuit grid; one plate sprite engine-tinted;
  edge blooms on win.
- Brand mark (provider logo): bold simplified WRS rim, five chunky twin-blade
  spokes, magenta ring 272, cyan ring 196, gold hub; square, transparent,
  legible small; inner layer spins.
- Character: DIRECTION APPROVED, full-cartoon sci-fi character (not
  humanised), future street racer with head communicator rig and visor,
  neon-trimmed suit, standing LEFT of frame LEANING ON A FUTURISTIC HOVER
  CAR (low-slung coupe, underglow); the car is REQUIRED, this is a car game.
  Chat Claude produces the vector version first; external generation is the
  fallback if the owner's eye says pivot.
- Static backgrounds APPROVED from
  frontend/public/assets/videos/bg_animated_loop.mp4: BASE = flying-cars
  frame (t=22s), grade contrast 1.08, colour 1.18, blue x1.06, vignette
  0.38; OVERDRIVE = street-racers frame (t=7s), grade contrast 1.14, colour
  1.30, R x1.18, B x1.12, G x0.92, brightness 0.94, vignette 0.5. Video then
  removed from the served build.
- Win pod RETIRED. Themed spin and buy buttons RETIRED for a standardised
  generic control overlay with exactly two themed accents: TURBO = existing
  turbocharger art (themes/future-spinner/symbols/h2.png) with flames on
  engage; FEATURE = Grille art top left, no box, art carries the button.
- Designed instrument plates PENDING ART: MULTIPLIER and TOTAL WIN plates
  and the meter spins readout are placeholders until chat Claude delivers
  notched-corner cyberpunk tech frames in system language.

## 4. LAYOUT_SPEC v3.1 (owner-corrected)
Reference 1280x720, S = min(vw/1280, vh/720), whole stage scales together,
safe margin 24. LOGO top centre 380 wide y 18. FRAME 640x468 at (320,84);
GRID 522x349 centred inside; cells canonical 120x100 canvas space. FEATURE
button: Grille art carrying the button (no plate box), about 128 wide,
positioned beside the frame upper left, just above and right of the
character, label centred beneath. HUD panel x 320 to 960, y 560 to 648,
translucent deep navy, radius 18, one baseline cy 604: TURBO 72 far left
INSIDE the panel (themed, flames on engage); hamburger; BALANCE box 170 and
WIN box 140 pulled close together, values 18, labels 12, sized to fit
$10,000.00; BET with fully visible stacked cyan arrows given the freed
width; SPIN 84 centred (970,604) clear of the bet arrows; AUTOPLAY 48 at
(902,672) below the bar. CHARACTER with hover car: left scene group, taller
(about 560 character height), set further back, clear of the turbo. BONUS
INSTRUMENT COLUMN (Overdrive only): gauge 232 at (1018,96) with the spins
readout integrated in the face art; designed MULTIPLIER and TOTAL WIN
instrument plates stacked beneath (1000 to 1262). BANNER compact 380x96
centred over grid at (450,262), translucent, gold rim. Z-ORDER LAW:
background 0, frame 10, grid 20, symbols 30, win FX 40, HUD and meter 60,
banner 100, modals 200, splash 300; HUD never beneath the frame. Speed
tiers Normal, Turbo, Super Turbo; spin pressed mid-spin slam-stops reels,
outcome unchanged.

## 5. DEFECT REGISTER (from the owner's 85s recording, frame-verified)
1. Control bar values occluded by frame: fixed structurally by LAYOUT_SPEC.
2. Wincap buy round jumps straight to MAX WIN banner: capped rounds MUST
   present their full sequence first.
3. Ways-win visualisation missing: winning symbols highlight with pay
   breakdown cycling per group after settle.
4. Spin motion jittery: ticker-driven 60fps, motion blur, staggered stops
   with overshoot slam, anticipation hold on the final reel with two
   scatters live; three speed tiers; slam-stop.
5. Old win videos in the repo set the ENERGY BAR for new engine win states.

## 6. SEQUENCE FROM HERE
1. Chat Claude art turn: character v3 with hover car, designed instrument
   plates, meter face with integrated spins readout, layout mock v4; owner
   eye-pass.
2. ONE AssetForge mega-brief (single session): embed all uncommitted masters;
   commit LAYOUT_SPEC.md from section 4; DESIGN_SYSTEM.md lineup and law
   updates; asset pipeline (npm run assets, deterministic exact-size exports
   from a manifest, layered exports for H1 spokes and H2 needle); install
   symbols and plates; produce both static backgrounds per parameters and
   retire the video from the build; rebuild HUD and scene per LAYOUT_SPEC;
   headless recon captures of one Valkyrie demo to ~/Desktop (reference
   only, never the repo).
3. Motion Polish v2 (one session): engine symbol animation via layered
   sprites, landing choreography, tiered celebrations at the energy bar,
   defects 2 to 5, Overdrive transition (needle slams, gauge flares, awarded
   spins fire out as a burst), intro splash, WRS loading screen (brand mark
   as the spinning loader).
4. Build Diet v2 plus QA soak harness (one session): video gone, dist under
   25 MB; harness plays 1,000 plus mock spins across locale, social and
   turbo matrix asserting exact totals, integer micros, zero console errors,
   flat memory, fps floor.
5. Compliance re-validation (one session): full checklist on the final
   build; stakecli pinned install (session cookie keychain only);
   REVIEW_EVENTS.md event ids per mode (wincap, 3, 4, 5 scatter triggers,
   retrigger, win tiers); headless capture of
   stake-engine.com/docs/approval-guidelines/math-verification, the
   interactive approval checklist, game-tile guidelines and docs/math pages;
   restage the Desktop bundle with fresh hashes.
6. Owner one-timers: portal profile, payment, provider logo upload, public
   high-res asset link; then SUBMISSION_DOSSIER section 5 protocol; submit.

## 7. INTEL AND VERIFIED FACTS
- New Stake automated maths gates (CVaR, ETL, cumulative probability):
  PRE-VERIFIED CLEAN from our lookup tables: P(payout over 5,000x) exactly
  zero in both modes; P(at or above 5,000x) 1 in 100,000 base, 1 in 1,000
  bonus; ES99 base 61.96x; bonus tail capped at 50x of cost. Platform RTP
  ceiling about 98%.
- Valkyrie Studio is the benchmark: 98% RTP flagships, generic control
  overlay identical across titles, per-symbol colour identity on tile
  plates, character beside the frame.
- Owner taste: heavy and punchy win motion; blurb approved; backgrounds
  approved (flying cars BASE, street racers OVERDRIVE); character direction
  full-cartoon sci-fi with the hover car required.
--- END HANDOVER.md ---
