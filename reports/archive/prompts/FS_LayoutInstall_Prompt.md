# FS LAYOUT INSTALL: build the visible game per LAYOUT_SPEC.md (the dropped AssetForge Task 5)

Autonomy posture per CLAUDE.md (g). Hard locks unchanged; this pass needs no exception; stop and report if you conclude otherwise. Branch claude/layout-install from up-to-date main.

CONTEXT: design-system/LAYOUT_SPEC.md is committed law; every asset it needs already exists in frontend/public/assets/themes/future-spinner (symbol exports and tile_plate, ui/gauge_face.png, ui/gauge_needle.png, ui/brand_mark_glyph.png, ui/scene_character_car.png, plates.json, backgrounds). This pass builds and mounts the layout; it creates no new art.

1. BUILD new components and mount them from App.svelte per LAYOUT_SPEC positions, sizes and z-order, all scaled by the single stage factor S:
   - HudOverlay: the generic translucent panel exactly per spec: hamburger (opens the existing menu), BALANCE, WIN and BET boxes with the spec type sizes fitting $10,000.00, stacked cyan bet arrows fully visible, SPIN 84 at (970,604) using a clean generic treatment, AUTOPLAY 48 at (902,672) below the bar wired to the existing autoplay flow, TURBO 72 inside far left using the existing turbocharger art with a glow on engage, cycling the existing speed setting.
   - FeatureButton: the Grille export carrying the button (no plate box), about 128 wide, beside the frame upper left per spec, label centred beneath from translations (social-safe), opening the EXISTING buy confirm flow, hidden when jurisdiction disables buys.
   - SceneGroup: scene_character_car export placed per spec, car nose under the frame, gentle CSS idle breathing only.
   - BonusInstrumentColumn (Overdrive only): gauge_face at 232 with gauge_needle as a separate rotating sprite driven by the live meter value, the odometer spins window styled per spec showing remaining spins, MULTIPLIER and TOTAL WIN on the instrument plate export with live values from the existing bonus stores.
   - Logo top centre 380 at y 18; the banner restyled compact 380x96 centred over the grid, translucent, gold rim, z100.
   - Frame: switch the active frame to frame-2 per the owner-approved blueprint (one-line theme change; note it in the report for an easy revert if the owner's eye prefers frame-1).
2. RETIRE from the mounted tree (do not delete files): the old ControlBar, WinPod, and the old themed corner buttons including MAX BET (LAYOUT_SPEC is law and has no pod and no MAX); the buy flow, autoplay, turbo, menu, sound and info functions must all remain reachable through the new overlay or the menu. Symbols render on the tile plate with plates.json edge tinting if not already.
3. PROOF GATES, all repo-verifiable:
   a. Playwright screenshots at 1280x720 of the base state and a mock bonus state COMMITTED to reports/screens/layout-v1/ (base.png, bonus.png), plus the six compliance viewports committed to the same folder.
   b. DOM occlusion audit: programmatically assert zero bounding-box intersections between any two text-bearing HUD elements and between HUD text and the frame at every captured viewport; log the matrix in the session report; any intersection FAILS the pass.
   c. Position audit: assert the rendered spin button centre, HUD panel bounds, logo bounds and instrument column bounds match LAYOUT_SPEC within 2 px at 1280x720 (after S scaling); log measured values.
   d. Retirement audit: grep-verify WinPod and the old ControlBar are no longer imported by any mounted component.
   e. npx tsc --noEmit clean on edited files, npm run build clean, exact-total test 44/44.
4. Append to CLAUDE.md Session Conventions: (h) Visual proof: any pass that changes what renders commits before and after proof screenshots to reports/screens/<pass>/ so the independent verifier can review rendering from the repository.
5. Session report plus archive, commit explicit paths, push, PR into main via gh titled "Layout install: LAYOUT_SPEC v3.1 rendered, old HUD retired" with the report as description including the position and occlusion matrices.
