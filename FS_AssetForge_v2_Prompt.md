FS_AssetForge_v2_Prompt.md. Save this brief verbatim as FS_AssetForge_v2_Prompt.md. IMPORTANT: this is part one of two. The remaining appendix files are the PART TWO you already received in this session; append them verbatim to the saved brief, run the manifest check (ten master files across both parts, every BEGIN/END block real svg markup, zero bracketed placeholders), then execute the whole brief end to end.

# FS ASSETFORGE v2: MASTERS, LAYOUT LAW, PIPELINE, HUD REBUILD (one session, one PR)

## POSTURE AND LOCKS
Autonomy posture per CLAUDE.md convention (g): never pause for approval. Hard locks unchanged: rgsService.ts, gameStore.ts, games/future_spinner/**. This pass requires NO lock exception; if you conclude otherwise, stop and report rather than lifting anything.

## Task 0: Preconditions and housekeeping
- cd ~/math-sdk && git checkout main && git pull. HANDOVER.md, the autonomy settings and the DESIGN_SYSTEM ADDENDUM must all be on main (they are: PR 8 and PR 9 merged). git checkout -b claude/assetforge-v2
- Fix the CLAUDE.md cross-reference previously flagged: convention (g) must reference convention (e) (lock exceptions), not (d). One-word fix.

## Task 1: Commit the design capital
Create every file listed in APPENDIX A (below) and APPENDIX B (the PART TWO already received) at the exact paths given, byte-for-byte between their BEGIN and END markers. Then update design-system/DESIGN_SYSTEM.md:
- Lineup table: M2 becomes "Holographic Grille (EV fascia, neon violet #8a5cff)" master M2_master_v2.svg; M3 becomes "Plasma Booster (acid green #5dff3c, flame with cyan shock diamonds)" master M3_master_v3.svg; H2 status "v3.1 in masters/ (THE ANCHOR)"; M1 status "v3 in masters/"; L1, L2, L3 status "in masters/".
- Add under SYSTEM LAWS: signature colour identity per symbol (H1 cyan and magenta duo, H2 crimson #ff2d3d, M1 neon orange #ff9a2e, M2 neon violet #8a5cff, M3 acid green #5dff3c, L1 gold #ffd700, L2 electric blue #9adcff, L3 heat orange #ff7a2e, W magenta and cyan, S spectrum); silhouette-first differentiation; signature-colour tile plates behind every symbol (dark tech plate #0b0f1c, engine-tinted edge, edge blooms on win); the standardised generic control overlay, reskin-free, with exactly two themed accents (TURBO = existing turbocharger art with flames on engage, FEATURE = Grille art carrying the button, no plate box).
- Record retirements: win pod RETIRED; themed spin and buy buttons RETIRED.
- Add entries: scene group (racer plus hover car, scene_character_car.svg, the game's identity character, car required, idle breathing only until Motion Polish); brand mark (brand_mark.svg, provider logo, inner layer spins); instrument plate master (plate_instrument.svg, used for MULTIPLIER and TOTAL WIN plates and any future readouts).

## Task 2: Commit the layout law
Create design-system/LAYOUT_SPEC.md containing a title line "# LAYOUT_SPEC v3.1 (owner approved)" followed by the ENTIRE section 4 of HANDOVER.md copied verbatim (the repo copy is the source of truth; do not retype from memory).

## Task 3: Deterministic asset pipeline
- Python venv with cairosvg and pillow (brew install native cairo if missing).
- scripts/assets/manifest.json declaring every export (source master, output path under frontend/public/assets/themes/future-spinner/, exact pixel size) and scripts/assets/build.py executing it, wired as npm run assets. Reproducibility is a gate: run twice, outputs byte-identical (hash compare).
- Required exports: all ten symbols at 240x240 and 120x120 (masters: H1_master_v2, H2_master_v31, M1_master_v3, M2_master_v2, M3_master_v3, L1_master, L2_master, L3_master, W_master, S_master); neutral tile plate sprite 244x204 (dark #0b0f1c rounded rect radius 28, faint grid lines at 6% white) plus plates.json mapping symbol id to its signature colour for engine edge tinting; brand mark at 512 and 192; Grille feature button art at 224; gauge face at 464 from H2_master_v31; scene_character_car at 1200 wide; instrument plate at 524x119 and 262x59.
- Layered exports for animation: from H1_master_v2 rasterise TWO sprites, the rotating group (spokes, spokeShadows, hubBolts) alone on transparency, and the full master with those groups removed; from H2_master_v31 the needle group (the g with the rotate transform containing the needle paths) alone on transparency, and the face with the needle group removed. Implement by parsing the SVG text and isolating or deleting the named groups before rasterising.

## Task 4: Static backgrounds, video retired from the build
Produce bg_base.jpg and bg_overdrive.jpg exactly per the frame timestamps and grading parameters recorded in HANDOVER.md section 3 (static backgrounds entry), quality 88, into the theme backgrounds directory. Wire the game to render bg_base in the base state and bg_overdrive during Overdrive (simple state-driven swap with a short crossfade acceptable this pass). Exclude bg_animated_loop.mp4 from the served build and any preloads; keep the file in the repo for reference.

## Task 5: HUD and scene rebuild per LAYOUT_SPEC.md
Implement every position, size and z-index exactly as the spec states, using the new exports:
- Logo top centre 380 at y 18. Frame 640x468 at (320,84), grid inside, symbols rendered on tinted plates per plates.json.
- Generic overlay HUD panel with hamburger, BALANCE, WIN, BET (boxes and type sizes per spec, must fit $10,000.00), stacked cyan bet arrows fully visible, SPIN 84 at (970,604), AUTOPLAY 48 at (902,672), TURBO 72 inside far left using the existing turbocharger art with a flame treatment on engage (CSS or canvas glow acceptable this pass).
- FEATURE: the Grille export carries the button, about 128 wide, no plate box, label centred beneath, positioned beside the frame upper left above and right of the character, opens the existing buy flow, hidden when the jurisdiction disables buys.
- Scene group: scene_character_car export placed left per spec, car nose sliding under the frame, gentle CSS idle breathing only.
- Bonus instrument column per spec: gauge face export at 232 with the needle sprite rotating by meter value; the odometer spins window as a styled element at the spec coordinates (dark fill, gold bezel, crimson inner frame) showing remaining spins; MULTIPLIER and TOTAL WIN on the instrument plate export with label 12 and value 30, live values from the existing bonus stores.
- Compact banner 380x96 centred over the grid, translucent, gold rim, z100.
- OCCLUSION GATE (closes defect 1): screenshot the layout at 1280x720, 1024x576, 800x450, 400x225 and the six compliance viewports; no element may overlap another element's text or controls anywhere; fix and re-shoot until clean.
- All existing compliance behaviour (rules, paytable, disclaimer, social strings, replay) must remain untouched and passing.

## Task 6: Recon captures (reference only, never into the repo)
With Playwright and system Chrome, load https://valkyriestudio.gg/game/waylanders-forge, wait for the demo canvas, click its centre to spin, and capture 12 timestamped frames (6 at 250ms intervals across the spin, 6 across any win presentation) to ~/Desktop/reference/waylanders/. Nothing from this task is committed.

## Task 7: Verification and ship
- npx tsc --noEmit clean; npm run build clean; the exact-total interpreter test re-run PASSES 44 of 44; npm run assets reproducibility gate passes.
- Screenshots of the finished layout (base state, and bonus state with the instrument column live) at 1280x720 to ~/Desktop/FS_AssetForge_Screens/ for owner review.
- Update FUTURE_SPINNER_PROJECT_STATUS.md and copy to ~/Desktop/. Session report plus dated archive per convention. Commit with explicit paths, push, open the PR into main via gh titled "AssetForge v2: masters, layout law, pipeline, HUD rebuild" with the session report as description, reporting: files created, export manifest summary, background sizes, occlusion gate results per viewport, exact-total result, and recon capture count.

## APPENDIX A (part one): masters verbatim

--- BEGIN design-system/masters/M1_master_v3.svg ---
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ff9a2e" stop-opacity="0.16"/>
      <stop offset="60%" stop-color="#ff9a2e" stop-opacity="0.05"/>
      <stop offset="100%" stop-color="#ff9a2e" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="chromeU" x1="150" y1="150" x2="880" y2="880" gradientUnits="userSpaceOnUse">
      <stop offset="0%"  stop-color="#ffffff"/>
      <stop offset="20%" stop-color="#c8daea"/>
      <stop offset="40%" stop-color="#6d8098"/>
      <stop offset="52%" stop-color="#2e3a4c"/>
      <stop offset="66%" stop-color="#7d92aa"/>
      <stop offset="85%" stop-color="#e9f5ff"/>
      <stop offset="100%" stop-color="#8ea3ba"/>
    </linearGradient>
    <linearGradient id="gunmetal" x1="150" y1="150" x2="880" y2="880" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#8fa2b8"/>
      <stop offset="40%" stop-color="#39465c"/>
      <stop offset="65%" stop-color="#161d2c"/>
      <stop offset="100%" stop-color="#4a5a72"/>
    </linearGradient>
    <radialGradient id="barrel" cx="40%" cy="35%" r="75%">
      <stop offset="0%" stop-color="#232c40"/>
      <stop offset="55%" stop-color="#121828"/>
      <stop offset="100%" stop-color="#080c16"/>
    </radialGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fff0a0"/>
      <stop offset="45%" stop-color="#e0ac1c"/>
      <stop offset="100%" stop-color="#7d5a06"/>
    </linearGradient>
  </defs>
  <circle cx="512" cy="512" r="486" fill="url(#bgGlow)"/>
  <circle cx="512" cy="512" r="352" fill="none" stroke="url(#chromeU)" stroke-width="92"/>
  <circle cx="512" cy="512" r="398" fill="none" stroke="#0a0e16" stroke-width="5"/>
  <circle cx="512" cy="512" r="306" fill="none" stroke="#0a0e16" stroke-width="5"/>
  <circle cx="512" cy="512" r="330" fill="none" stroke="#131a29" stroke-width="30" opacity="0.85"/>
  <path d="M 200 330 A 366 366 0 0 1 496 148" fill="none" stroke="#ffffff" stroke-width="24" opacity="0.5" stroke-linecap="round"/>
  <circle cx="512" cy="512" r="352" fill="none" stroke="#ff9a2e" stroke-width="5" opacity="0.75" stroke-dasharray="6 26"/>
  <g id="revLeds">
    <g id="ledG"><circle cx="512" cy="182" r="11" fill="#35ff6a"/><circle cx="512" cy="182" r="20" fill="#35ff6a" opacity="0.25"/></g>
    <use href="#ledG" transform="rotate(-75 512 512)"/>
    <use href="#ledG" transform="rotate(-60 512 512)"/>
    <use href="#ledG" transform="rotate(-45 512 512)"/>
    <use href="#ledG" transform="rotate(-30 512 512)"/>
    <g id="ledA"><circle cx="512" cy="182" r="11" fill="#ffb84d"/><circle cx="512" cy="182" r="20" fill="#ffb84d" opacity="0.25"/></g>
    <use href="#ledA" transform="rotate(15 512 512)"/>
    <use href="#ledA" transform="rotate(30 512 512)"/>
    <g id="ledR"><circle cx="512" cy="182" r="11" fill="#ff3355"/><circle cx="512" cy="182" r="20" fill="#ff3355" opacity="0.25"/></g>
    <use href="#ledR" transform="rotate(60 512 512)"/>
    <use href="#ledR" transform="rotate(75 512 512)"/>
  </g>
  <g transform="rotate(-15 512 512)"><circle cx="512" cy="182" r="11" fill="#35ff6a"/><circle cx="512" cy="182" r="20" fill="#35ff6a" opacity="0.25"/></g>
  <g transform="rotate(45 512 512)"><circle cx="512" cy="182" r="11" fill="#ff3355"/><circle cx="512" cy="182" r="20" fill="#ff3355" opacity="0.25"/></g>
  <ellipse cx="222" cy="512" rx="28" ry="60" fill="url(#gunmetal)" stroke="#0a0e16" stroke-width="4"/>
  <ellipse cx="802" cy="512" rx="28" ry="60" fill="url(#gunmetal)" stroke="#0a0e16" stroke-width="4"/>
  <rect x="236" y="798" width="552" height="120" rx="34" fill="url(#gunmetal)" stroke="#0a0e16" stroke-width="5"/>
  <path d="M 262 812 L 762 812" stroke="url(#chromeU)" stroke-width="10" fill="none" stroke-linecap="round"/>
  <path d="M 300 862 L 724 862" stroke="#ff9a2e" stroke-width="4" opacity="0.6" fill="none" stroke-dasharray="6 22"/>
  <rect x="492" y="112" width="40" height="98" rx="10" fill="#e8273f" stroke="#5a0f18" stroke-width="4"/>
  <rect x="506" y="120" width="8" height="82" rx="4" fill="#ffd9de" opacity="0.85"/>
  <g id="sp">
    <path d="M 604 484 L 604 540 L 806 526 L 806 498 Z" fill="url(#gunmetal)" stroke="#0a0e16" stroke-width="4"/>
    <path d="M 612 494 L 612 530 L 794 520 L 794 504 Z" fill="url(#chromeU)"/>
  </g>
  <use href="#sp" transform="rotate(90 512 512)"/>
  <use href="#sp" transform="rotate(180 512 512)"/>
  <g>
    <circle cx="700" cy="497" r="11" fill="#00e5ff"/><circle cx="700" cy="497" r="19" fill="#00e5ff" opacity="0.25"/>
    <circle cx="700" cy="527" r="11" fill="#ff2bd6"/><circle cx="700" cy="527" r="19" fill="#ff2bd6" opacity="0.25"/>
    <circle cx="324" cy="497" r="11" fill="#ff2bd6"/><circle cx="324" cy="497" r="19" fill="#ff2bd6" opacity="0.25"/>
    <circle cx="324" cy="527" r="11" fill="#00e5ff"/><circle cx="324" cy="527" r="19" fill="#00e5ff" opacity="0.25"/>
  </g>
  <circle cx="512" cy="512" r="112" fill="url(#gunmetal)" stroke="#0a0e16" stroke-width="5"/>
  <circle cx="512" cy="512" r="112" fill="none" stroke="url(#gold)" stroke-width="7"/>
  <rect x="452" y="480" width="120" height="64" rx="12" fill="#0b111e" stroke="#ff9a2e" stroke-width="3.5"/>
  <g fill="#ff9a2e">
    <rect x="468" y="520" width="18" height="12" rx="3"/>
    <rect x="492" y="508" width="18" height="24" rx="3"/>
    <rect x="516" y="496" width="18" height="36" rx="3"/>
    <rect x="540" y="490" width="18" height="42" rx="3" opacity="0.5"/>
  </g>
  <ellipse cx="380" cy="300" rx="170" ry="70" fill="#ffffff" opacity="0.06" transform="rotate(-35 380 300)"/>
</svg>
--- END design-system/masters/M1_master_v3.svg ---

--- BEGIN design-system/masters/M2_master_v2.svg ---
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#8a5cff" stop-opacity="0.2"/>
      <stop offset="60%" stop-color="#8a5cff" stop-opacity="0.07"/>
      <stop offset="100%" stop-color="#8a5cff" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="chromeU" x1="150" y1="150" x2="880" y2="880" gradientUnits="userSpaceOnUse">
      <stop offset="0%"  stop-color="#ffffff"/>
      <stop offset="20%" stop-color="#c8daea"/>
      <stop offset="40%" stop-color="#6d8098"/>
      <stop offset="52%" stop-color="#2e3a4c"/>
      <stop offset="66%" stop-color="#7d92aa"/>
      <stop offset="85%" stop-color="#e9f5ff"/>
      <stop offset="100%" stop-color="#8ea3ba"/>
    </linearGradient>
    <linearGradient id="gunmetal" x1="150" y1="150" x2="880" y2="880" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#8fa2b8"/>
      <stop offset="40%" stop-color="#39465c"/>
      <stop offset="65%" stop-color="#161d2c"/>
      <stop offset="100%" stop-color="#4a5a72"/>
    </linearGradient>
    <linearGradient id="violetGlow" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#b490ff"/>
      <stop offset="50%" stop-color="#8a5cff"/>
      <stop offset="100%" stop-color="#4b1fae"/>
    </linearGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fff0a0"/>
      <stop offset="45%" stop-color="#e0ac1c"/>
      <stop offset="100%" stop-color="#7d5a06"/>
    </linearGradient>
  </defs>
  <circle cx="512" cy="512" r="486" fill="url(#bgGlow)"/>
  <rect x="92" y="232" width="840" height="560" rx="72" fill="url(#chromeU)" stroke="#0a0e16" stroke-width="6"/>
  <path d="M 150 262 L 560 250" stroke="#ffffff" stroke-width="16" opacity="0.5" stroke-linecap="round"/>
  <rect x="134" y="274" width="756" height="476" rx="52" fill="url(#gunmetal)" stroke="#0a0e16" stroke-width="5"/>
  <g fill="url(#gold)" stroke="#0a0e16" stroke-width="3">
    <circle cx="158" cy="298" r="12"/><circle cx="866" cy="298" r="12"/>
    <circle cx="158" cy="726" r="12"/><circle cx="866" cy="726" r="12"/>
  </g>
  <rect x="176" y="316" width="672" height="24" rx="12" fill="#00e5ff" opacity="0.25"/>
  <rect x="176" y="316" width="672" height="24" rx="12" fill="none" stroke="#5cffff" stroke-width="5" opacity="0.9"/>
  <rect x="196" y="322" width="632" height="12" rx="6" fill="#eaffff" opacity="0.9"/>
  <rect x="176" y="372" width="672" height="316" rx="26" fill="url(#violetGlow)" opacity="0.85"/>
  <rect x="176" y="372" width="672" height="316" rx="26" fill="none" stroke="#0a0e16" stroke-width="4"/>
  <g fill="url(#chromeU)" stroke="#0a0e16" stroke-width="4">
    <rect x="204" y="372" width="52" height="316"/>
    <rect x="290" y="372" width="52" height="316"/>
    <rect x="376" y="372" width="52" height="316"/>
    <rect x="596" y="372" width="52" height="316"/>
    <rect x="682" y="372" width="52" height="316"/>
    <rect x="768" y="372" width="52" height="316"/>
  </g>
  <g stroke="#ffffff" stroke-width="4" opacity="0.4">
    <line x1="212" y1="380" x2="212" y2="680"/>
    <line x1="298" y1="380" x2="298" y2="680"/>
    <line x1="384" y1="380" x2="384" y2="680"/>
    <line x1="604" y1="380" x2="604" y2="680"/>
    <line x1="690" y1="380" x2="690" y2="680"/>
    <line x1="776" y1="380" x2="776" y2="680"/>
  </g>
  <polygon points="512,412 588,530 512,648 436,530" fill="url(#gold)" stroke="#0a0e16" stroke-width="5"/>
  <polygon points="512,448 560,530 512,612 464,530" fill="url(#gunmetal)" stroke="#7d5a06" stroke-width="4"/>
  <circle cx="512" cy="530" r="88" fill="none" stroke="#00e5ff" stroke-width="4" opacity="0.8"/>
  <circle cx="512" cy="530" r="88" fill="none" stroke="#00e5ff" stroke-width="12" opacity="0.2"/>
  <g fill="#0b111e" stroke="#0a0e16" stroke-width="3">
    <rect x="286" y="712" width="130" height="22" rx="11"/>
    <rect x="447" y="712" width="130" height="22" rx="11"/>
    <rect x="608" y="712" width="130" height="22" rx="11"/>
  </g>
  <ellipse cx="330" cy="310" rx="180" ry="60" fill="#ffffff" opacity="0.06" transform="rotate(-18 330 310)"/>
</svg>
--- END design-system/masters/M2_master_v2.svg ---

--- BEGIN design-system/masters/M3_master_v3.svg ---
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bgGlow" cx="45%" cy="50%" r="55%">
      <stop offset="0%" stop-color="#5dff3c" stop-opacity="0.18"/>
      <stop offset="60%" stop-color="#5dff3c" stop-opacity="0.06"/>
      <stop offset="100%" stop-color="#5dff3c" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="chromeU" x1="150" y1="150" x2="880" y2="880" gradientUnits="userSpaceOnUse">
      <stop offset="0%"  stop-color="#ffffff"/>
      <stop offset="20%" stop-color="#c8daea"/>
      <stop offset="40%" stop-color="#6d8098"/>
      <stop offset="52%" stop-color="#2e3a4c"/>
      <stop offset="66%" stop-color="#7d92aa"/>
      <stop offset="85%" stop-color="#e9f5ff"/>
      <stop offset="100%" stop-color="#8ea3ba"/>
    </linearGradient>
    <linearGradient id="gunmetal" x1="150" y1="150" x2="880" y2="880" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#8fa2b8"/>
      <stop offset="40%" stop-color="#39465c"/>
      <stop offset="65%" stop-color="#161d2c"/>
      <stop offset="100%" stop-color="#4a5a72"/>
    </linearGradient>
    <radialGradient id="barrel" cx="40%" cy="35%" r="75%">
      <stop offset="0%" stop-color="#232c40"/>
      <stop offset="55%" stop-color="#121828"/>
      <stop offset="100%" stop-color="#080c16"/>
    </radialGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fff0a0"/>
      <stop offset="45%" stop-color="#e0ac1c"/>
      <stop offset="100%" stop-color="#7d5a06"/>
    </linearGradient>
  </defs>
  <circle cx="512" cy="512" r="486" fill="url(#bgGlow)"/>
  <ellipse cx="660" cy="512" rx="330" ry="180" fill="#5dff3c" opacity="0.10"/>
  <rect x="86" y="318" width="290" height="388" rx="44" fill="url(#gunmetal)" stroke="#0a0e16" stroke-width="6"/>
  <path d="M 110 344 L 340 336" stroke="#ffffff" stroke-width="12" opacity="0.45" stroke-linecap="round"/>
  <g fill="#0b111e" stroke="#0a0e16" stroke-width="3">
    <rect x="120" y="392" width="180" height="20" rx="10"/>
    <rect x="120" y="432" width="180" height="20" rx="10"/>
    <rect x="120" y="472" width="180" height="20" rx="10"/>
  </g>
  <g fill="url(#gold)" stroke="#0a0e16" stroke-width="3">
    <circle cx="116" cy="348" r="11"/><circle cx="346" cy="348" r="11"/>
    <circle cx="116" cy="676" r="11"/><circle cx="346" cy="676" r="11"/>
  </g>
  <rect x="120" y="600" width="180" height="70" rx="16" fill="#0b111e" stroke="#5dff3c" stroke-width="3.5"/>
  <g fill="#5dff3c">
    <rect x="136" y="642" width="14" height="16" rx="3"/>
    <rect x="158" y="630" width="14" height="28" rx="3"/>
    <rect x="180" y="618" width="14" height="40" rx="3"/>
    <rect x="202" y="612" width="14" height="46" rx="3" opacity="0.55"/>
  </g>
  <rect x="352" y="360" width="66" height="304" rx="20" fill="url(#chromeU)" stroke="#0a0e16" stroke-width="5"/>
  <circle cx="452" cy="512" r="152" fill="url(#chromeU)" stroke="#0a0e16" stroke-width="6"/>
  <circle cx="452" cy="512" r="112" fill="url(#barrel)" stroke="#0a0e16" stroke-width="5"/>
  <circle cx="452" cy="512" r="112" fill="none" stroke="url(#gold)" stroke-width="5"/>
  <circle cx="452" cy="512" r="78" fill="#031006"/>
  <circle cx="452" cy="512" r="78" fill="none" stroke="#5dff3c" stroke-width="6" opacity="0.9"/>
  <circle cx="452" cy="512" r="78" fill="none" stroke="#5dff3c" stroke-width="16" opacity="0.22"/>
  <path d="M 470 402 C 700 348 866 428 952 512 C 866 596 700 676 470 622 Z" fill="#5dff3c" opacity="0.22"/>
  <path d="M 478 434 C 686 398 826 458 908 512 C 826 566 686 626 478 590 Z" fill="#5dff3c" opacity="0.5"/>
  <path d="M 486 462 C 664 440 786 480 862 512 C 786 544 664 584 486 562 Z" fill="#b8ffa0" opacity="0.85"/>
  <path d="M 494 484 C 642 472 744 496 812 512 C 744 528 642 552 494 540 Z" fill="#ffffff" opacity="0.95"/>
  <g fill="#7dfcff" opacity="0.95">
    <polygon points="596,512 616,494 636,512 616,530"/>
    <polygon points="682,512 698,498 714,512 698,526"/>
    <polygon points="756,512 769,501 782,512 769,523"/>
  </g>
  <g fill="#5dff3c">
    <circle cx="900" cy="446" r="7" opacity="0.9"/>
    <circle cx="936" cy="540" r="6" opacity="0.8"/>
    <circle cx="884" cy="592" r="5" opacity="0.7"/>
  </g>
  <ellipse cx="240" cy="360" rx="120" ry="46" fill="#ffffff" opacity="0.06" transform="rotate(-22 240 360)"/>
</svg>
--- END design-system/masters/M3_master_v3.svg ---

--- BEGIN design-system/masters/L1_master.svg ---
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffd700" stop-opacity="0.16"/>
      <stop offset="60%" stop-color="#ffd700" stop-opacity="0.05"/>
      <stop offset="100%" stop-color="#ffd700" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="goldBody" x1="150" y1="150" x2="880" y2="880" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#fff3b0"/>
      <stop offset="35%" stop-color="#e8b422"/>
      <stop offset="60%" stop-color="#8a6508"/>
      <stop offset="100%" stop-color="#d9a81e"/>
    </linearGradient>
    <linearGradient id="gunmetal" x1="150" y1="150" x2="880" y2="880" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#8fa2b8"/>
      <stop offset="40%" stop-color="#39465c"/>
      <stop offset="65%" stop-color="#161d2c"/>
      <stop offset="100%" stop-color="#4a5a72"/>
    </linearGradient>
    <radialGradient id="bore" cx="42%" cy="38%" r="70%">
      <stop offset="0%" stop-color="#232c40"/>
      <stop offset="60%" stop-color="#0c111d"/>
      <stop offset="100%" stop-color="#05070d"/>
    </radialGradient>
  </defs>
  <circle cx="512" cy="512" r="486" fill="url(#bgGlow)"/>
  <polygon points="512,142 832,327 832,697 512,882 192,697 192,327" fill="url(#goldBody)" stroke="#0a0e16" stroke-width="6" stroke-linejoin="round"/>
  <polygon points="512,209 774,360 774,664 512,815 250,664 250,360" fill="url(#gunmetal)" stroke="#0a0e16" stroke-width="5" stroke-linejoin="round"/>
  <polygon points="512,142 832,327 774,360 512,209" fill="#ffffff" opacity="0.28"/>
  <polygon points="192,327 512,142 512,209 250,360" fill="#ffffff" opacity="0.14"/>
  <circle cx="512" cy="512" r="150" fill="url(#bore)" stroke="#0a0e16" stroke-width="6"/>
  <path d="M 420 470 A 120 120 0 0 1 560 420" fill="none" stroke="#5a6b80" stroke-width="7" opacity="0.7"/>
  <path d="M 412 540 A 128 128 0 0 1 470 428" fill="none" stroke="#5a6b80" stroke-width="5" opacity="0.5"/>
  <circle cx="512" cy="512" r="150" fill="none" stroke="#ffd700" stroke-width="22" opacity="0.18"/>
  <circle cx="512" cy="512" r="150" fill="none" stroke="#ffe66b" stroke-width="7" opacity="0.95"/>
  <ellipse cx="380" cy="300" rx="150" ry="60" fill="#ffffff" opacity="0.07" transform="rotate(-32 380 300)"/>
</svg>
--- END design-system/masters/L1_master.svg ---

--- BEGIN design-system/masters/L2_master.svg ---
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bgGlow" cx="50%" cy="58%" r="50%">
      <stop offset="0%" stop-color="#9adcff" stop-opacity="0.18"/>
      <stop offset="60%" stop-color="#9adcff" stop-opacity="0.05"/>
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
    <linearGradient id="ceramic" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="45%" stop-color="#e8eef6"/>
      <stop offset="100%" stop-color="#b9c6d6"/>
    </linearGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fff0a0"/>
      <stop offset="45%" stop-color="#e0ac1c"/>
      <stop offset="100%" stop-color="#7d5a06"/>
    </linearGradient>
  </defs>
  <circle cx="512" cy="560" r="470" fill="url(#bgGlow)"/>
  <rect x="484" y="118" width="56" height="70" rx="16" fill="url(#gold)" stroke="#0a0e16" stroke-width="4"/>
  <circle cx="512" cy="112" r="34" fill="url(#gold)" stroke="#0a0e16" stroke-width="4"/>
  <rect x="452" y="186" width="120" height="256" rx="42" fill="url(#ceramic)" stroke="#0a0e16" stroke-width="5"/>
  <g stroke="#8a99ab" stroke-width="5" fill="none" opacity="0.8">
    <path d="M 456 250 Q 512 268 568 250"/>
    <path d="M 456 316 Q 512 334 568 316"/>
    <path d="M 456 382 Q 512 400 568 382"/>
  </g>
  <rect x="418" y="440" width="188" height="164" rx="18" fill="url(#chromeU)" stroke="#0a0e16" stroke-width="5"/>
  <line x1="462" y1="446" x2="462" y2="598" stroke="#0a0e16" stroke-width="3" opacity="0.5"/>
  <line x1="562" y1="446" x2="562" y2="598" stroke="#0a0e16" stroke-width="3" opacity="0.5"/>
  <path d="M 430 452 L 430 592" stroke="#ffffff" stroke-width="8" opacity="0.5"/>
  <rect x="452" y="602" width="120" height="128" rx="10" fill="url(#chromeU)" stroke="#0a0e16" stroke-width="5"/>
  <g stroke="#1a2334" stroke-width="6">
    <line x1="454" y1="626" x2="570" y2="618"/>
    <line x1="454" y1="654" x2="570" y2="646"/>
    <line x1="454" y1="682" x2="570" y2="674"/>
    <line x1="454" y1="710" x2="570" y2="702"/>
  </g>
  <rect x="496" y="730" width="32" height="64" rx="8" fill="url(#chromeU)" stroke="#0a0e16" stroke-width="4"/>
  <path d="M 588 716 L 588 828 L 528 828" fill="none" stroke="url(#chromeU)" stroke-width="24" stroke-linecap="round"/>
  <path d="M 588 716 L 588 828 L 528 828" fill="none" stroke="#0a0e16" stroke-width="30" opacity="0.25"/>
  <g stroke-linecap="round" fill="none">
    <path d="M 512 798 L 500 812 L 522 818 L 512 826" stroke="#9adcff" stroke-width="18" opacity="0.25"/>
    <path d="M 512 798 L 500 812 L 522 818 L 512 826" stroke="#cfeeff" stroke-width="8" opacity="0.8"/>
    <path d="M 512 798 L 500 812 L 522 818 L 512 826" stroke="#ffffff" stroke-width="3"/>
  </g>
  <circle cx="512" cy="814" r="52" fill="#9adcff" opacity="0.18"/>
</svg>
--- END design-system/masters/L2_master.svg ---

--- BEGIN design-system/masters/L3_master.svg ---
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bgGlow" cx="50%" cy="40%" r="55%">
      <stop offset="0%" stop-color="#ff7a2e" stop-opacity="0.18"/>
      <stop offset="60%" stop-color="#ff7a2e" stop-opacity="0.05"/>
      <stop offset="100%" stop-color="#ff7a2e" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="gunmetal" x1="150" y1="150" x2="880" y2="880" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#8fa2b8"/>
      <stop offset="40%" stop-color="#39465c"/>
      <stop offset="65%" stop-color="#161d2c"/>
      <stop offset="100%" stop-color="#4a5a72"/>
    </linearGradient>
    <linearGradient id="chromeU" x1="150" y1="150" x2="880" y2="880" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="25%" stop-color="#c8daea"/>
      <stop offset="50%" stop-color="#6d8098"/>
      <stop offset="62%" stop-color="#2e3a4c"/>
      <stop offset="85%" stop-color="#dcebfa"/>
      <stop offset="100%" stop-color="#9fb2c8"/>
    </linearGradient>
    <linearGradient id="heat" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffd9a0"/>
      <stop offset="45%" stop-color="#ff7a2e"/>
      <stop offset="100%" stop-color="#ff7a2e" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <circle cx="512" cy="440" r="480" fill="url(#bgGlow)"/>
  <g stroke="#ff9a4d" stroke-width="6" fill="none" opacity="0.5" stroke-linecap="round">
    <path d="M 420 196 Q 432 172 420 148"/>
    <path d="M 512 184 Q 524 158 512 132"/>
    <path d="M 604 196 Q 616 172 604 148"/>
  </g>
  <rect x="332" y="238" width="360" height="152" rx="26" fill="url(#gunmetal)" stroke="#0a0e16" stroke-width="6"/>
  <rect x="332" y="238" width="360" height="36" rx="18" fill="url(#heat)" opacity="0.9"/>
  <path d="M 348 246 L 676 246" stroke="#ffe9c4" stroke-width="7" opacity="0.9" stroke-linecap="round"/>
  <g stroke="#0a0e16" stroke-width="6">
    <line x1="338" y1="308" x2="686" y2="308"/>
    <line x1="338" y1="342" x2="686" y2="342"/>
  </g>
  <path d="M 338 316 L 686 316" stroke="#ff7a2e" stroke-width="4" opacity="0.55"/>
  <rect x="368" y="390" width="288" height="86" rx="18" fill="url(#gunmetal)" stroke="#0a0e16" stroke-width="5"/>
  <circle cx="512" cy="470" r="42" fill="url(#chromeU)" stroke="#0a0e16" stroke-width="5"/>
  <path d="M 482 500 L 542 500 L 566 742 L 458 742 Z" fill="url(#chromeU)" stroke="#0a0e16" stroke-width="5"/>
  <path d="M 492 512 L 500 730" stroke="#ffffff" stroke-width="6" opacity="0.55" fill="none"/>
  <circle cx="512" cy="790" r="96" fill="url(#chromeU)" stroke="#0a0e16" stroke-width="6"/>
  <circle cx="512" cy="790" r="52" fill="#12060b"/>
  <circle cx="512" cy="790" r="52" fill="none" stroke="#ff7a2e" stroke-width="6" opacity="0.9"/>
  <circle cx="512" cy="790" r="52" fill="none" stroke="#ff7a2e" stroke-width="16" opacity="0.2"/>
  <ellipse cx="420" cy="280" rx="120" ry="30" fill="#ffffff" opacity="0.08" transform="rotate(-8 420 280)"/>
</svg>
--- END design-system/masters/L3_master.svg ---

END OF PART ONE. Combine with the PART TWO already received, run the manifest check, then execute.


===== PART TWO (appended verbatim, already received this session) =====

FS_AssetForge_v2_Prompt.md PART TWO. Append everything below verbatim to the saved brief, then execute the full brief end to end.

## APPENDIX B (part two): remaining masters verbatim

--- BEGIN design-system/masters/H2_master_v31.svg ---
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#4de3ff" stop-opacity="0.35"/>
      <stop offset="55%" stop-color="#b400ff" stop-opacity="0.14"/>
      <stop offset="100%" stop-color="#b400ff" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="chromeU" x1="150" y1="150" x2="880" y2="880" gradientUnits="userSpaceOnUse">
      <stop offset="0%"  stop-color="#ffffff"/>
      <stop offset="20%" stop-color="#c8daea"/>
      <stop offset="40%" stop-color="#6d8098"/>
      <stop offset="52%" stop-color="#2e3a4c"/>
      <stop offset="66%" stop-color="#7d92aa"/>
      <stop offset="85%" stop-color="#e9f5ff"/>
      <stop offset="100%" stop-color="#8ea3ba"/>
    </linearGradient>
    <radialGradient id="face" cx="42%" cy="36%" r="80%">
      <stop offset="0%" stop-color="#1d2536"/>
      <stop offset="55%" stop-color="#0e1424"/>
      <stop offset="100%" stop-color="#070a12"/>
    </radialGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fff0a0"/>
      <stop offset="45%" stop-color="#e0ac1c"/>
      <stop offset="100%" stop-color="#7d5a06"/>
    </linearGradient>
  </defs>
  <circle cx="512" cy="512" r="492" fill="url(#bgGlow)"/>
  <circle cx="512" cy="512" r="404" fill="none" stroke="url(#gold)" stroke-width="9" opacity="0.95"/>
  <circle cx="512" cy="512" r="404" fill="none" stroke="#0a0e16" stroke-width="2" opacity="0.6"/>
  <circle cx="512" cy="512" r="380" fill="url(#chromeU)" stroke="#0a0e16" stroke-width="5"/>
  <path d="M 212 336 A 352 352 0 0 1 502 162" fill="none" stroke="#ffffff" stroke-width="22" opacity="0.5" stroke-linecap="round"/>
  <g id="bezelBolts">
    <g id="bb"><circle cx="512" cy="164" r="13" fill="url(#chromeU)" stroke="#0a0e16" stroke-width="2.5"/><circle cx="508" cy="160" r="4.5" fill="#ffffff" opacity="0.9"/></g>
    <use href="#bb" transform="rotate(60 512 512)"/>
    <use href="#bb" transform="rotate(120 512 512)"/>
    <use href="#bb" transform="rotate(180 512 512)"/>
    <use href="#bb" transform="rotate(240 512 512)"/>
    <use href="#bb" transform="rotate(300 512 512)"/>
  </g>
  <circle cx="512" cy="512" r="318" fill="url(#face)" stroke="#0a0e16" stroke-width="6"/>
  <circle cx="512" cy="512" r="318" fill="none" stroke="url(#gold)" stroke-width="6"/>
  <circle cx="512" cy="512" r="288" fill="none" stroke="#2a3650" stroke-width="2" opacity="0.8"/>
  <g id="ticks" stroke="#bfe9ff" stroke-linecap="round">
    <g id="tickMaj"><line x1="512" y1="262" x2="512" y2="316" stroke-width="10"/></g>
    <use href="#tickMaj" transform="rotate(-135 512 512)"/>
    <use href="#tickMaj" transform="rotate(-90 512 512)"/>
    <use href="#tickMaj" transform="rotate(-45 512 512)"/>
    <use href="#tickMaj" transform="rotate(45 512 512)"/>
    <use href="#tickMaj" transform="rotate(90 512 512)"/>
    <use href="#tickMaj" transform="rotate(135 512 512)"/>
    <g id="tickMin" stroke-width="5" opacity="0.7">
      <line x1="512" y1="262" x2="512" y2="296" transform="rotate(-112 512 512)"/>
      <line x1="512" y1="262" x2="512" y2="296" transform="rotate(-67 512 512)"/>
      <line x1="512" y1="262" x2="512" y2="296" transform="rotate(-22 512 512)"/>
      <line x1="512" y1="262" x2="512" y2="296" transform="rotate(22 512 512)"/>
      <line x1="512" y1="262" x2="512" y2="296" transform="rotate(67 512 512)"/>
      <line x1="512" y1="262" x2="512" y2="296" transform="rotate(112 512 512)"/>
    </g>
  </g>
  <g fill="none">
    <path d="M 663 273 A 286 286 0 0 1 797 507" stroke="#ff2d3d" stroke-width="46" opacity="0.22"/>
    <path d="M 663 273 A 286 286 0 0 1 797 507" stroke="#ff4d5c" stroke-width="28" opacity="0.9"/>
    <path d="M 663 273 A 286 286 0 0 1 797 507" stroke="#ffd9a0" stroke-width="9" opacity="0.9"/>
  </g>
  <g stroke="#ffe2b0" stroke-width="6" stroke-linecap="round" opacity="0.95">
    <line x1="512" y1="268" x2="512" y2="306" transform="rotate(48 512 512)"/>
    <line x1="512" y1="268" x2="512" y2="306" transform="rotate(60 512 512)"/>
    <line x1="512" y1="268" x2="512" y2="306" transform="rotate(72 512 512)"/>
  </g>
  <g fill="none">
    <path d="M 227 507 A 286 286 0 0 1 361 273" stroke="#00ffff" stroke-width="18" opacity="0.15"/>
    <path d="M 227 507 A 286 286 0 0 1 361 273" stroke="#5cffff" stroke-width="7" opacity="0.7"/>
  </g>
  <g transform="rotate(62 512 512)">
    <path d="M 512 512 L 490 548 L 512 232 L 534 548 Z" fill="#ff2d3d" opacity="0.25"/>
    <path d="M 512 512 L 492 544 L 512 240 L 532 544 Z" fill="#ff2d3d" stroke="#5a0f18" stroke-width="4"/>
    <path d="M 506 300 L 512 244 L 518 300 Z" fill="#ffffff" opacity="0.95"/>
    <path d="M 496 540 L 512 585 L 528 540 Z" fill="#ff2d3d" stroke="#5a0f18" stroke-width="3"/>
  </g>
  <circle cx="512" cy="512" r="80" fill="url(#chromeU)" stroke="#0a0e16" stroke-width="4"/>
  <circle cx="512" cy="512" r="50" fill="url(#gold)" stroke="#0a0e16" stroke-width="3"/>
  <circle cx="512" cy="512" r="50" fill="none" stroke="#ffb84d" stroke-width="3" opacity="0.6"/>
  <circle cx="503" cy="501" r="12" fill="#ffffff" opacity="0.85"/>
  <path d="M 300 340 A 280 280 0 0 1 640 262" fill="none" stroke="#ffffff" stroke-width="30" opacity="0.10" stroke-linecap="round"/>
  <ellipse cx="400" cy="350" rx="190" ry="80" fill="#ffffff" opacity="0.05" transform="rotate(-33 400 350)"/>
</svg>
--- END design-system/masters/H2_master_v31.svg ---

--- BEGIN design-system/masters/brand_mark.svg ---
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="chromeB" x1="150" y1="150" x2="880" y2="880" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="25%" stop-color="#c8daea"/>
      <stop offset="50%" stop-color="#5a6b80"/>
      <stop offset="62%" stop-color="#2e3a4c"/>
      <stop offset="85%" stop-color="#e9f5ff"/>
      <stop offset="100%" stop-color="#9fb2c8"/>
    </linearGradient>
    <radialGradient id="tyreB" cx="42%" cy="36%" r="80%">
      <stop offset="0%" stop-color="#2a3346"/>
      <stop offset="60%" stop-color="#141a28"/>
      <stop offset="100%" stop-color="#070a12"/>
    </radialGradient>
    <radialGradient id="barrelB" cx="40%" cy="35%" r="75%">
      <stop offset="0%" stop-color="#232c40"/>
      <stop offset="55%" stop-color="#121828"/>
      <stop offset="100%" stop-color="#080c16"/>
    </radialGradient>
    <linearGradient id="goldB" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fff0a0"/>
      <stop offset="45%" stop-color="#e0ac1c"/>
      <stop offset="100%" stop-color="#7d5a06"/>
    </linearGradient>
  </defs>
  <circle cx="512" cy="512" r="470" fill="url(#tyreB)"/>
  <circle cx="512" cy="512" r="470" fill="none" stroke="#000208" stroke-width="8"/>
  <circle cx="512" cy="512" r="386" fill="url(#chromeB)"/>
  <circle cx="512" cy="512" r="386" fill="none" stroke="#0a0e16" stroke-width="7"/>
  <path d="M 196 322 A 366 366 0 0 1 502 146" fill="none" stroke="#ffffff" stroke-width="30" opacity="0.55" stroke-linecap="round"/>
  <circle cx="512" cy="512" r="322" fill="url(#barrelB)" stroke="#0a0e16" stroke-width="8"/>
  <circle cx="512" cy="512" r="272" fill="none" stroke="#ff00ff" stroke-width="30" opacity="0.2"/>
  <circle cx="512" cy="512" r="272" fill="none" stroke="#ff2bd6" stroke-width="11" opacity="0.95"/>
  <circle cx="512" cy="512" r="196" fill="none" stroke="#00ffff" stroke-width="26" opacity="0.22"/>
  <circle cx="512" cy="512" r="196" fill="none" stroke="#5cffff" stroke-width="10" opacity="0.95"/>
  <g id="bpair">
    <g>
      <path d="M 488 200 L 536 200 L 528 470 L 496 470 Z" fill="url(#chromeB)" stroke="#0a0e16" stroke-width="7" transform="rotate(-8 512 512)"/>
      <path d="M 488 200 L 536 200 L 528 470 L 496 470 Z" fill="url(#chromeB)" stroke="#0a0e16" stroke-width="7" transform="rotate(8 512 512)"/>
    </g>
  </g>
  <use href="#bpair" transform="rotate(72 512 512)"/>
  <use href="#bpair" transform="rotate(144 512 512)"/>
  <use href="#bpair" transform="rotate(216 512 512)"/>
  <use href="#bpair" transform="rotate(288 512 512)"/>
  <circle cx="512" cy="512" r="120" fill="url(#chromeB)" stroke="#0a0e16" stroke-width="7"/>
  <circle cx="512" cy="512" r="76" fill="url(#goldB)" stroke="#0a0e16" stroke-width="6"/>
  <circle cx="498" cy="496" r="16" fill="#ffffff" opacity="0.85"/>
</svg>
--- END design-system/masters/brand_mark.svg ---

--- BEGIN design-system/masters/plate_instrument.svg ---
<svg width="1024" height="232" viewBox="0 0 1024 232" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="plateBody" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1a2236"/>
      <stop offset="45%" stop-color="#0d1322"/>
      <stop offset="100%" stop-color="#080c16"/>
    </linearGradient>
    <linearGradient id="goldP" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fff0a0"/>
      <stop offset="50%" stop-color="#e0ac1c"/>
      <stop offset="100%" stop-color="#7d5a06"/>
    </linearGradient>
  </defs>
  <path id="pshape" d="M 44 10 L 940 10 L 1014 84 L 1014 222 L 84 222 L 10 148 L 10 10 Z" fill="url(#plateBody)"/>
  <path d="M 44 10 L 940 10 L 1014 84 L 1014 222 L 84 222 L 10 148 L 10 10 Z" fill="none" stroke="#ff00ff" stroke-width="26" opacity="0.14"/>
  <path d="M 44 10 L 940 10 L 1014 84 L 1014 222 L 84 222 L 10 148 L 10 10 Z" fill="none" stroke="#ff2bd6" stroke-width="9" opacity="0.95"/>
  <path d="M 54 24 L 934 24 L 1000 90 L 1000 208 L 90 208 L 24 142 L 24 24 Z" fill="none" stroke="url(#goldP)" stroke-width="3.5" opacity="0.9"/>
  <rect x="40" y="52" width="14" height="128" rx="6" fill="#ff2bd6"/>
  <rect x="40" y="52" width="14" height="128" rx="6" fill="none" stroke="#ff00ff" stroke-width="10" opacity="0.25"/>
  <g stroke="#ffffff" opacity="0.05" stroke-width="4">
    <line x1="80" y1="76" x2="990" y2="76"/>
    <line x1="80" y1="124" x2="990" y2="124"/>
    <line x1="80" y1="172" x2="990" y2="172"/>
  </g>
  <circle cx="962" cy="196" r="10" fill="url(#goldP)" stroke="#05070d" stroke-width="3"/>
  <circle cx="118" cy="40" r="10" fill="url(#goldP)" stroke="#05070d" stroke-width="3"/>
  <path d="M 940 10 L 1014 84" stroke="#ffd2f4" stroke-width="3" opacity="0.6"/>
</svg>
--- END design-system/masters/plate_instrument.svg ---

--- BEGIN design-system/masters/scene_character_car.svg ---
<svg width="1500" height="820" viewBox="0 0 1500 820" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="carBody" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#9fb2c8"/>
      <stop offset="28%" stop-color="#4a5a72"/>
      <stop offset="62%" stop-color="#1b2334"/>
      <stop offset="100%" stop-color="#0d1220"/>
    </linearGradient>
    <linearGradient id="glass" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#7de8ff" stop-opacity="0.9"/>
      <stop offset="45%" stop-color="#1b4b5e" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="#0a1a26"/>
    </linearGradient>
    <linearGradient id="suit" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3d4a63"/>
      <stop offset="55%" stop-color="#1c2437"/>
      <stop offset="100%" stop-color="#2a3550"/>
    </linearGradient>
    <linearGradient id="visor" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#9df4ff"/>
      <stop offset="45%" stop-color="#1e6c8f"/>
      <stop offset="75%" stop-color="#7a1f8f"/>
      <stop offset="100%" stop-color="#ff2bd6"/>
    </linearGradient>
    <linearGradient id="goldS" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fff0a0"/>
      <stop offset="50%" stop-color="#e0ac1c"/>
      <stop offset="100%" stop-color="#7d5a06"/>
    </linearGradient>
  </defs>
  <ellipse cx="740" cy="762" rx="640" ry="34" fill="#000000" opacity="0.5"/>
  <ellipse cx="420" cy="742" rx="150" ry="20" fill="#00e5ff" opacity="0.35"/>
  <ellipse cx="1080" cy="742" rx="150" ry="20" fill="#00e5ff" opacity="0.35"/>
  <circle cx="132" cy="520" r="52" fill="url(#carBody)" stroke="#05070d" stroke-width="6"/>
  <circle cx="132" cy="520" r="30" fill="#0a1408"/>
  <circle cx="132" cy="520" r="30" fill="none" stroke="#5dff3c" stroke-width="7" opacity="0.9"/>
  <path d="M 96 520 Q 40 520 18 508 Q 44 534 96 536 Z" fill="#5dff3c" opacity="0.5"/>
  <path d="M 128 566 C 96 500 130 448 260 428 L 430 404 C 540 336 800 326 930 368 L 1210 424 C 1352 452 1420 506 1396 566 L 1352 616 L 210 620 Z"
        fill="url(#carBody)" stroke="#05070d" stroke-width="7"/>
  <path d="M 260 432 L 430 408 C 540 342 796 332 926 372" fill="none" stroke="#e9f5ff" stroke-width="8" opacity="0.55" stroke-linecap="round"/>
  <path d="M 448 402 C 540 344 786 336 900 372 L 866 416 L 492 428 Z" fill="url(#glass)" stroke="#05070d" stroke-width="6"/>
  <path d="M 486 396 C 560 356 700 350 780 362" fill="none" stroke="#ffffff" stroke-width="9" opacity="0.55" stroke-linecap="round"/>
  <line x1="672" y1="344" x2="660" y2="424" stroke="#05070d" stroke-width="5" opacity="0.8"/>
  <path d="M 186 520 L 1330 502" stroke="#ff2bd6" stroke-width="20" opacity="0.16" fill="none"/>
  <path d="M 186 520 L 1330 502" stroke="#ff2bd6" stroke-width="7" opacity="0.95" fill="none"/>
  <path d="M 250 452 L 1240 448" stroke="url(#goldS)" stroke-width="4" opacity="0.9" fill="none"/>
  <path d="M 1352 470 L 1396 478 L 1394 494 L 1350 488 Z" fill="#7de8ff" stroke="#05070d" stroke-width="3"/>
  <line x1="560" y1="436" x2="548" y2="606" stroke="#05070d" stroke-width="4" opacity="0.6"/>
  <line x1="960" y1="430" x2="964" y2="606" stroke="#05070d" stroke-width="4" opacity="0.6"/>
  <path d="M 210 620 L 1352 616 L 1332 648 L 236 652 Z" fill="#0a0e1a" stroke="#05070d" stroke-width="5"/>
  <rect x="300" y="652" width="180" height="52" rx="22" fill="url(#carBody)" stroke="#05070d" stroke-width="5"/>
  <rect x="960" y="650" width="180" height="52" rx="22" fill="url(#carBody)" stroke="#05070d" stroke-width="5"/>
  <path d="M 310 700 Q 390 726 470 700" stroke="#00e5ff" stroke-width="8" fill="none" opacity="0.9"/>
  <path d="M 970 698 Q 1050 724 1130 698" stroke="#00e5ff" stroke-width="8" fill="none" opacity="0.9"/>
  <g id="racer" transform="rotate(-4 820 760)">
    <path d="M 792 726 L 852 726 L 862 762 L 782 762 Z" fill="#0c111e" stroke="#05070d" stroke-width="5"/>
    <path d="M 858 734 L 918 726 L 928 758 L 852 766 Z" fill="#0c111e" stroke="#05070d" stroke-width="5"/>
    <path d="M 788 742 L 856 742" stroke="#00e5ff" stroke-width="4" opacity="0.9"/>
    <path d="M 860 748 L 922 742" stroke="#ff2bd6" stroke-width="4" opacity="0.9"/>
    <path d="M 800 560 L 846 560 L 850 730 L 798 730 Z" fill="#141b2e" stroke="#05070d" stroke-width="5"/>
    <path d="M 772 556 L 816 566 L 894 730 L 852 744 Z" fill="#101728" stroke="#05070d" stroke-width="5"/>
    <line x1="826" y1="572" x2="828" y2="722" stroke="#00e5ff" stroke-width="3" opacity="0.6"/>
    <path d="M 742 372 L 906 372 L 896 576 L 762 576 Z" fill="url(#suit)" stroke="#05070d" stroke-width="6"/>
    <path d="M 742 376 L 762 572" stroke="#ff2bd6" stroke-width="5" opacity="0.9" fill="none"/>
    <path d="M 906 376 L 896 572" stroke="#ff2bd6" stroke-width="5" opacity="0.9" fill="none"/>
    <rect x="798" y="516" width="52" height="40" rx="8" fill="#0b111e" stroke="#00e5ff" stroke-width="3"/>
    <g fill="#00e5ff"><rect x="806" y="540" width="8" height="12" rx="2"/><rect x="818" y="532" width="8" height="20" rx="2"/><rect x="830" y="526" width="8" height="26" rx="2"/></g>
    <path d="M 742 380 L 906 380 L 898 402 L 748 402 Z" fill="#0f1526" stroke="#05070d" stroke-width="4"/>
    <path d="M 742 400 L 700 440 L 706 486 L 762 470 Z" fill="url(#suit)" stroke="#05070d" stroke-width="6"/>
    <path d="M 906 400 L 946 442 L 934 490 L 884 470 Z" fill="url(#suit)" stroke="#05070d" stroke-width="6"/>
    <path d="M 706 462 L 872 500 L 866 540 L 700 500 Z" fill="url(#suit)" stroke="#05070d" stroke-width="6"/>
    <path d="M 934 468 L 776 508 L 782 548 L 940 506 Z" fill="url(#suit)" stroke="#05070d" stroke-width="6"/>
    <path d="M 710 468 L 866 506" stroke="#ff2bd6" stroke-width="4" opacity="0.85" fill="none"/>
    <circle cx="770" cy="530" r="24" fill="#1a2233" stroke="#05070d" stroke-width="5"/>
    <circle cx="884" cy="520" r="24" fill="#1a2233" stroke="#05070d" stroke-width="5"/>
    <path d="M 796 356 L 852 356 L 848 386 L 800 386 Z" fill="#141b2e" stroke="#05070d" stroke-width="5"/>
    <circle cx="824" cy="272" r="86" fill="#10182c" stroke="#05070d" stroke-width="6"/>
    <path d="M 742 250 Q 760 178 830 182 Q 904 186 906 258 L 906 276 Q 872 262 824 262 Q 776 262 742 276 Z" fill="#1c2437" stroke="#05070d" stroke-width="6"/>
    <path d="M 748 262 Q 824 236 900 264 L 898 316 Q 824 348 750 314 Z" fill="url(#visor)" stroke="#05070d" stroke-width="6"/>
    <path d="M 762 272 Q 812 252 862 264" stroke="#ffffff" stroke-width="8" opacity="0.75" fill="none" stroke-linecap="round"/>
    <path d="M 788 336 Q 824 352 860 336 L 854 366 Q 824 378 794 366 Z" fill="#141b2e" stroke="#05070d" stroke-width="5"/>
    <circle cx="742" cy="286" r="20" fill="url(#goldS)" stroke="#05070d" stroke-width="4"/>
    <circle cx="742" cy="286" r="8" fill="#ff2bd6"/>
    <path d="M 736 268 L 700 236" stroke="#05070d" stroke-width="10" stroke-linecap="round"/>
    <path d="M 736 268 L 700 236" stroke="#8fa2b8" stroke-width="5" stroke-linecap="round"/>
    <circle cx="698" cy="232" r="7" fill="#00e5ff"/>
    <path d="M 852 190 L 872 148 L 892 156 L 876 198 Z" fill="#1c2437" stroke="#05070d" stroke-width="5"/>
    <path d="M 874 154 L 884 158" stroke="#ff2bd6" stroke-width="6" stroke-linecap="round"/>
    <path d="M 902 262 Q 918 272 906 292" stroke="#ff2bd6" stroke-width="6" fill="none" opacity="0.9"/>
  </g>
</svg>
--- END design-system/masters/scene_character_car.svg ---

END OF PART TWO. All appendices are now complete: nine master files across both parts. Execute the full brief now, end to end, per the autonomy posture.
