FS_OpusElevate_Prompt.md. Save this brief verbatim and commit it with this session per convention.

# FS OPUS ELEVATE: review Sonnet's motion work, install the final lineup, flame jets, UI corrections

READ FIRST, in order: reports/SESSION_REPORT.md, reports/archive/2026-07-04_motion-polish-v2.md, the ux-polish and layout-install archives, design-system/LAYOUT_SPEC.md including AMENDMENT v3.2, design-system/DESIGN_SYSTEM.md, HANDOVER.md. Context: every pass since AssetForge ran on Sonnet; you are Opus 4.8 at High effort; your job is to REVIEW AND ELEVATE, never to redo what is already strong. Autonomy posture per CLAUDE.md (g). Hard locks unchanged; no exception expected; stop and report if you conclude otherwise. Branch claude/opus-elevate from up-to-date main.

## Task 0: Conventions
Append to CLAUDE.md Session Conventions: (i) Handover block: every session report ends with FOR THE NEXT SESSION, stating the model and effort used, the approach taken, alternatives tried and rejected, files touched, and open threads; and every brief opens with a READ FIRST list of the repo documents that carry its context.

## Task 1: Final lineup installed (maths untouched, art only)
Create the three masters in APPENDIX A at design-system/masters/ (H2_reel_nitro.svg, M2_reel_coilover.svg, L2_reel_fuse.svg). The instrument masters remain in place and in their UI roles: H2_master_v31.svg stays the bonus gauge, M2_master_v2.svg stays the feature button art. Update DESIGN_SYSTEM.md lineup: H2 reel art = Nitro Canister (crimson #ff2d3d), M2 reel art = Coilover (neon violet #8a5cff), L2 reel art = Blade Fuse (electric blue #9adcff); record the gauge and grille as UI-exclusive. Update scripts/assets/manifest.json so the h2, m2 and l2 reel exports (240, 120 and paytable sizes) rasterise from the new masters, run npm run assets, and verify the reels, paytable and buy preview all render the new art (served-bytes hash check as in the wiring pass). plates.json colours are unchanged.

## Task 2: Critical review of Motion Polish v2, then elevate
Play the game headless and judge every Motion v2 item against the energy bar (the old win videos in git history) and the committed GIFs: reel travel weight and stop slam, win punch and particle richness, ways cycling clarity, celebration escalation, Overdrive transition drama, idle life. For each item verdict GOOD (leave alone) or ELEVATE (strengthen with concrete choreography changes). Elevations must feel hand-tuned: curves over linear ramps, anticipation before impact, follow-through after. Commit BEFORE and AFTER GIFs for every elevated item to reports/screens/opus-elevate/ and document each verdict with reasoning in the session report.

## Task 3: Buy modal presentation
The buy preview currently shows text labels; replace with real symbol images at readable scale inside the modal grid. Elevate the modal itself: scale-in entrance with glow, the Grille art as its header, the price on an instrument-plate styled element. Jurisdiction hiding and social behaviour unchanged.

## Task 4: Flame jets (owner concept)
Extend the pipeline to export the M3 booster nozzle and a short flame frame sequence as separate sprites. Mount jet nozzles around the frame edges (two per side minimum, positions recorded as LAYOUT_SPEC v3.3 entries) that IGNITE during the Overdrive entry transition, burn with a continuous flicker loop for the entire bonus, and extinguish on exit. Pooled sprites, no per-frame allocation, reduced-motion shows static glow instead of animated flame.

## Task 5: LAYOUT_SPEC v3.3 amendment (append, then implement)
(a) FEATURE button relocates to the RIGHT side of the frame, about 160 wide, vertically centred on the frame; during Overdrive it is hidden and the bonus instrument column owns that zone. (b) MAX BET returns: a MAX chip at a FIXED position beside the bet arrows (arrows shift to x 906, MAX chip x 938, width 40), wired to the existing max bet logic, tabular numerals, never repositioned by content. (c) The theme selector button is removed from production UI, gated behind a dev-only flag.

## Task 6: Paytable elevation
Review the full-page paytable as a designer: consistent section header treatment, an even spacing grid, aligned symbol cells, polished ways diagram, typographic hierarchy. Improve and commit before and after screenshots.

## Task 7: Proof gates, all repo-verifiable
Occlusion and position audits re-run against v3.3 with stress values including the MAX chip, all viewports, committed to reports/screens/opus-elevate/; before and after GIFs per Task 2 and a flame-jet bonus GIF, each under 3MB; headless fps across 20 spins INCLUDING a full bonus with jets burning averages 55 or better; exact-total test passes on the full pool; tsc and build clean.

## Task 8: Ship
Session report with the Task 2 verdict table, fps log, audit matrices and the new (i) FOR THE NEXT SESSION block; archive copy; commit explicit paths; push; PR into main via gh titled "Opus elevate: final lineup, motion review, flame jets, UI corrections" with the report as description.

## APPENDIX A: masters verbatim

--- BEGIN design-system/masters/H2_reel_nitro.svg ---
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ff2d3d" stop-opacity="0.18"/>
      <stop offset="60%" stop-color="#ff2d3d" stop-opacity="0.06"/>
      <stop offset="100%" stop-color="#ff2d3d" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="chromeU" x1="150" y1="150" x2="880" y2="880" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="22%" stop-color="#c8daea"/>
      <stop offset="45%" stop-color="#6d8098"/>
      <stop offset="58%" stop-color="#2e3a4c"/>
      <stop offset="80%" stop-color="#a9bed4"/>
      <stop offset="100%" stop-color="#e9f5ff"/>
    </linearGradient>
    <linearGradient id="gunmetal" x1="150" y1="150" x2="880" y2="880" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#8fa2b8"/>
      <stop offset="40%" stop-color="#39465c"/>
      <stop offset="65%" stop-color="#161d2c"/>
      <stop offset="100%" stop-color="#4a5a72"/>
    </linearGradient>
    <linearGradient id="nitroBody" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ff8089"/>
      <stop offset="30%" stop-color="#e01f2f"/>
      <stop offset="70%" stop-color="#a4121f"/>
      <stop offset="100%" stop-color="#6e0a13"/>
    </linearGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fff0a0"/>
      <stop offset="45%" stop-color="#e0ac1c"/>
      <stop offset="100%" stop-color="#7d5a06"/>
    </linearGradient>
  </defs>
  <circle cx="512" cy="512" r="486" fill="url(#bgGlow)"/>
  <ellipse cx="512" cy="530" rx="220" ry="330" fill="#ff2d3d" opacity="0.10"/>
  <rect x="496" y="112" width="32" height="64" rx="9" fill="url(#chromeU)" stroke="#0a0e16" stroke-width="4"/>
  <rect x="458" y="124" width="108" height="24" rx="12" fill="url(#gold)" stroke="#0a0e16" stroke-width="4"/>
  <g stroke="#ffffff" stroke-width="5" stroke-linecap="round" opacity="0.8">
    <line x1="576" y1="122" x2="604" y2="108"/>
    <line x1="582" y1="140" x2="614" y2="136"/>
  </g>
  <rect x="428" y="170" width="168" height="88" rx="34" fill="url(#chromeU)" stroke="#0a0e16" stroke-width="5"/>
  <rect x="392" y="240" width="240" height="564" rx="62" fill="url(#nitroBody)" stroke="#0a0e16" stroke-width="6"/>
  <path d="M 412 262 L 412 780" stroke="#ffb9be" stroke-width="14" opacity="0.55" stroke-linecap="round"/>
  <rect x="430" y="262" width="24" height="520" rx="12" fill="#ffffff" opacity="0.8"/>
  <rect x="332" y="468" width="360" height="92" rx="22" fill="url(#gunmetal)" stroke="#0a0e16" stroke-width="5"/>
  <circle cx="362" cy="514" r="13" fill="url(#gold)" stroke="#0a0e16" stroke-width="3"/>
  <circle cx="662" cy="514" r="13" fill="url(#gold)" stroke="#0a0e16" stroke-width="3"/>
  <polygon points="548,300 470,470 522,470 486,640 588,438 530,438" fill="#ffffff" stroke="#7a0d16" stroke-width="5"/>
  <rect x="398" y="792" width="228" height="46" rx="20" fill="url(#chromeU)" stroke="#0a0e16" stroke-width="5"/>
  <ellipse cx="452" cy="330" rx="40" ry="90" fill="#ffffff" opacity="0.12" transform="rotate(-8 452 330)"/>
</svg>
--- END design-system/masters/H2_reel_nitro.svg ---

--- BEGIN design-system/masters/M2_reel_coilover.svg ---
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#8a5cff" stop-opacity="0.2"/>
      <stop offset="60%" stop-color="#8a5cff" stop-opacity="0.07"/>
      <stop offset="100%" stop-color="#8a5cff" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="chromeU" x1="150" y1="150" x2="880" y2="880" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="22%" stop-color="#c8daea"/>
      <stop offset="45%" stop-color="#6d8098"/>
      <stop offset="58%" stop-color="#2e3a4c"/>
      <stop offset="80%" stop-color="#a9bed4"/>
      <stop offset="100%" stop-color="#e9f5ff"/>
    </linearGradient>
    <linearGradient id="gunmetal" x1="150" y1="150" x2="880" y2="880" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#8fa2b8"/>
      <stop offset="40%" stop-color="#39465c"/>
      <stop offset="65%" stop-color="#161d2c"/>
      <stop offset="100%" stop-color="#4a5a72"/>
    </linearGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fff0a0"/>
      <stop offset="45%" stop-color="#e0ac1c"/>
      <stop offset="100%" stop-color="#7d5a06"/>
    </linearGradient>
  </defs>
  <circle cx="512" cy="512" r="486" fill="url(#bgGlow)"/>
  <rect x="400" y="128" width="224" height="56" rx="16" fill="url(#gunmetal)" stroke="#0a0e16" stroke-width="5"/>
  <polygon points="512,138 542,155 542,173 512,190 482,173 482,155" fill="url(#chromeU)" stroke="#0a0e16" stroke-width="4"/>
  <rect x="492" y="184" width="40" height="190" rx="12" fill="url(#chromeU)" stroke="#0a0e16" stroke-width="5"/>
  <rect x="440" y="356" width="144" height="392" rx="30" fill="url(#gunmetal)" stroke="#0a0e16" stroke-width="6"/>
  <g stroke="#0a0e16" stroke-width="4" opacity="0.7">
    <line x1="446" y1="560" x2="578" y2="560"/>
    <line x1="446" y1="590" x2="578" y2="590"/>
    <line x1="446" y1="620" x2="578" y2="620"/>
    <line x1="446" y1="650" x2="578" y2="650"/>
    <line x1="446" y1="680" x2="578" y2="680"/>
  </g>
  <rect x="426" y="366" width="172" height="48" rx="14" fill="url(#gold)" stroke="#0a0e16" stroke-width="5"/>
  <g fill="none">
    <g stroke="#8a5cff" stroke-width="46" opacity="0.16">
      <ellipse cx="512" cy="246" rx="152" ry="36"/>
      <ellipse cx="512" cy="322" rx="152" ry="36"/>
      <ellipse cx="512" cy="398" rx="152" ry="36"/>
      <ellipse cx="512" cy="474" rx="152" ry="36"/>
      <ellipse cx="512" cy="550" rx="152" ry="36"/>
      <ellipse cx="512" cy="626" rx="152" ry="36"/>
      <ellipse cx="512" cy="702" rx="152" ry="36"/>
    </g>
    <g stroke="#a37dff" stroke-width="24">
      <ellipse cx="512" cy="246" rx="152" ry="36"/>
      <ellipse cx="512" cy="322" rx="152" ry="36"/>
      <ellipse cx="512" cy="398" rx="152" ry="36"/>
      <ellipse cx="512" cy="474" rx="152" ry="36"/>
      <ellipse cx="512" cy="550" rx="152" ry="36"/>
      <ellipse cx="512" cy="626" rx="152" ry="36"/>
      <ellipse cx="512" cy="702" rx="152" ry="36"/>
    </g>
    <g stroke="#0a0e16" stroke-width="3" opacity="0.8">
      <ellipse cx="512" cy="246" rx="152" ry="36"/>
      <ellipse cx="512" cy="322" rx="152" ry="36"/>
      <ellipse cx="512" cy="398" rx="152" ry="36"/>
      <ellipse cx="512" cy="474" rx="152" ry="36"/>
      <ellipse cx="512" cy="550" rx="152" ry="36"/>
      <ellipse cx="512" cy="626" rx="152" ry="36"/>
      <ellipse cx="512" cy="702" rx="152" ry="36"/>
    </g>
    <g stroke="#e6d9ff" stroke-width="7" opacity="0.85" stroke-linecap="round">
      <path d="M 400 236 A 152 36 0 0 1 624 236"/>
      <path d="M 400 312 A 152 36 0 0 1 624 312"/>
      <path d="M 400 388 A 152 36 0 0 1 624 388"/>
      <path d="M 400 464 A 152 36 0 0 1 624 464"/>
      <path d="M 400 540 A 152 36 0 0 1 624 540"/>
      <path d="M 400 616 A 152 36 0 0 1 624 616"/>
      <path d="M 400 692 A 152 36 0 0 1 624 692"/>
    </g>
  </g>
  <circle cx="512" cy="812" r="56" fill="url(#chromeU)" stroke="#0a0e16" stroke-width="6"/>
  <circle cx="512" cy="812" r="24" fill="#0c111d" stroke="#0a0e16" stroke-width="4"/>
  <ellipse cx="470" cy="300" rx="60" ry="140" fill="#ffffff" opacity="0.08" transform="rotate(-10 470 300)"/>
</svg>
--- END design-system/masters/M2_reel_coilover.svg ---

--- BEGIN design-system/masters/L2_reel_fuse.svg ---
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#9adcff" stop-opacity="0.2"/>
      <stop offset="60%" stop-color="#9adcff" stop-opacity="0.06"/>
      <stop offset="100%" stop-color="#9adcff" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="chromeU" x1="150" y1="150" x2="880" y2="880" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="22%" stop-color="#c8daea"/>
      <stop offset="45%" stop-color="#6d8098"/>
      <stop offset="58%" stop-color="#2e3a4c"/>
      <stop offset="80%" stop-color="#a9bed4"/>
      <stop offset="100%" stop-color="#e9f5ff"/>
    </linearGradient>
    <linearGradient id="fuseBody" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#b9e9ff"/>
      <stop offset="45%" stop-color="#5da8d6"/>
      <stop offset="100%" stop-color="#2c6a96"/>
    </linearGradient>
  </defs>
  <circle cx="512" cy="512" r="486" fill="url(#bgGlow)"/>
  <rect x="446" y="690" width="36" height="180" rx="10" fill="url(#chromeU)" stroke="#0a0e16" stroke-width="5"/>
  <rect x="542" y="690" width="36" height="180" rx="10" fill="url(#chromeU)" stroke="#0a0e16" stroke-width="5"/>
  <rect x="372" y="252" width="280" height="70" rx="26" fill="#2c6a96" stroke="#0a0e16" stroke-width="6"/>
  <g stroke="#0a0e16" stroke-width="4" opacity="0.6">
    <line x1="452" y1="262" x2="452" y2="312"/>
    <line x1="512" y1="262" x2="512" y2="312"/>
    <line x1="572" y1="262" x2="572" y2="312"/>
  </g>
  <rect x="372" y="316" width="280" height="400" rx="42" fill="url(#fuseBody)" opacity="0.92" stroke="#0a0e16" stroke-width="6"/>
  <rect x="372" y="316" width="280" height="400" rx="42" fill="none" stroke="#9adcff" stroke-width="18" opacity="0.2"/>
  <rect x="390" y="332" width="26" height="368" rx="13" fill="#ffffff" opacity="0.5"/>
  <rect x="416" y="352" width="192" height="322" rx="24" fill="#0c1622" stroke="#0a0e16" stroke-width="5"/>
  <path d="M 512 368 L 512 430 L 466 470 L 558 532 L 512 572 L 512 656" fill="none" stroke="url(#chromeU)" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M 512 368 L 512 430 L 466 470 L 558 532 L 512 572 L 512 656" fill="none" stroke="#ffffff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" opacity="0.9"/>
  <circle cx="512" cy="500" r="46" fill="#9adcff" opacity="0.22"/>
  <circle cx="512" cy="500" r="20" fill="#e8f8ff" opacity="0.8"/>
  <ellipse cx="440" cy="380" rx="34" ry="90" fill="#ffffff" opacity="0.14" transform="rotate(-6 440 380)"/>
</svg>
--- END design-system/masters/L2_reel_fuse.svg ---
