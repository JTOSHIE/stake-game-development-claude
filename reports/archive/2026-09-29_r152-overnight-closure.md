# R152 - THE OVERNIGHT CLOSURE PASS: COUNTS AGREE, SCATTERS FIRE ON LANDING, NO PAID WIN IS DROPPED, FOUR DEAD RASTERS GONE (2026-09-29)

Review lane, unattended. Brief saved verbatim at `reports/briefs/FS_R152_OvernightClosurePass_Prompt.md` (commit
86874db7) per convention (f). Branch `claude/r152-overnight-closure`, cut from main at 542246cf. Ultracode on: three
workflows. Wave 1 measured every brief item on a frozen production build of main (14 agents, 5,444,481 subagent
tokens, 1,972 tool calls, 7 h 35 min). Wave 2 adversarially verified the first cut on a frozen candidate build (13
agents, 4,210,578 tokens, 1,481 tool calls, 4 h 31 min). Wave 3 was the brief's five-lens self-audit plus three
timing re-verifications (8 agents, 2,737,518 tokens, 906 tool calls, 2 h 37 min). 35 agents, 12,392,577 tokens,
none lost. Every figure below was measured or re-derived in this session; where a wave's figure disagreed with a
commit message, the correction is in this report (commit messages cannot be amended).

## Preconditions (Phase 0)

1. **#187 (R151) was already merged by the owner** at 2026-09-28T13:53:57Z, merge commit
   542246cfb8adc7bc975fac51a21be12011735e40, so there was nothing to merge. **Main CI on it, per rule 10:** run
   36431928991 (push) on 542246cfb8adc7bc975fac51a21be12011735e40, conclusion success (re-read at close). Its merged
   head `claude/r151-presentation-motion` (tip ca7dbd5192aa39452dc1ae3c5a40e24818e7be80: 0 unique commits, an
   ancestor of main, PR #187's merge commit on main) was deleted from the remote under ruling (t.1) rule 2; its tip
   stays fetchable at refs/pull/187/head.
2. **arc2-baseline resolves:** an annotated tag (object b11163e4) at 618b711eebcaed7682aca4f63b16b24911d5c456, present
   locally and on the remote.
3. **audio_verify:** the seam self-test PASS, and the full run ALL CHECKS PASS, with bgm_loop reported "SEAM EXEMPT
   ... OWNER ACCEPTED AT HASH" at 4.11 dB (webm) and 4.16 dB (mp3), the 2.0 dB limit unchanged. No sound was
   re-encoded, EQ'd, widened or replaced.
4. **Own servers, never 5173:** every measurement served a frozen copy of a built dist in-process
   (`previewServer.mjs`) on a free port. Identity was proved on every load by hashing the served entry script
   against the built file (logo.png is byte-identical across builds, so it proves nothing; wave 2 caught that).
   **5173 was never bound, stopped or requested, and `npm run assets` was never run.** At close nothing listens on
   5173 (lsof); the owner's own server there at R151's close is not this session's to account for.
5. **Dist against 26,214,400 B:** main's build, 104 files and 18,629,310 B excluding build-info.json; the final tip
   (d506e710), 100 files and 17,802,215 B excluding it, 101 files and 17,802,641 B whole, so **8,411,759 B of
   headroom**. The difference, 827,095 B, is the four pruned rasters (834,973 B) less 7,878 B of code growth.
6. **Fingerprint at start:** 2,737 tracked rasters (png, jpg, jpeg, webp, gif, avif), 539 files under the theme
   directory, and all 36 files under sounds/ (20 tracked, 16 gitignored masters), each hashed (sha256). The close assertion is below.

## Phase 1: copy and chrome

1. **"1 ways" and every count noun (commits 9a3de4e5, 7656311f; tests d506e710).** The win chip printed "1 ways" in
   en and **eight** other locales (de, es, fi, fr, hi, pl, pt, ru; the commit said nine, wave 3 NUM-02) on 18.56% of
   base spins (a one-way group, weighted by lookUpTable_base_0.csv). ru and pl were also wrong at every "few" count
   real rounds reach (2 to 4, 24, 32, 54, 64, 72, 144 and 162 in base spins) and ru at 81; ar at 2 to 10 and 108. A
   wrong chip was on 27.5% of base spins in ru and pl and 23.0% in ar (NUM-03). There was no plural infrastructure:
   t() now resolves ICU-style plural blocks through Intl.PluralRules for the locale whose table supplied the string.
   The chip no longer gives a scatter win a ways count, and is hidden under the feature. "+N FREE SPINS" and the
   retrigger's "+5" use a new count-agreeing key. Fixed-count literals corrected: replay scatter3/4/5 (8 locales),
   the paytable "1,024" ways label (ru, ar) and the resume offer (ar, ru, hi). The paytable's bare ways heading got
   its own key after wave 2 found the agreeing form wrong as a heading in ar and ru (fi and tr also get their
   nominative plural). New CI steps: plural.test.ts (seeded red on the shipped "{n} ways"; pins at counts real
   rounds reach, ru 81, pl 24 and 6 after wave 3 found the first pins unreachable; the heading split pinned in ar,
   ru, fi, tr) and scatterCount.test.ts. **Verified:** 0 disagreeing renders in 16 locales on the final candidate.
   **Native review is on the owner list:** the forms come from CLDR categories, not a speaker.
2. **Space and Enter on the boot splash (6441c44a, 7656311f).** Space and Enter started the bed and left the splash
   up (its listener was on an element a player who has not clicked never focuses). The listener is on the window;
   one Space dismisses and does not also spin; the rules card answers Enter and Space; the game is inert under both
   screens (Tab used to reach SPIN behind the splash and Enter placed an unseen bet). Measured: dismissal in 3 to 7
   ms, 0 bets (the commit's "5 ms" and "four gates" were not re-derivable, NUM-12; splash calm, scrim coverage, bet
   selector and max-win hold, which boot through the splash, are green). Wave 2 found the fix let a key
   HELD through the splash answer the resume offer; the offer now ignores and cancels auto-repeats (verified).
3. **Scatter celebration early (e2381b59).** The escalation beat, the securing scatter's charge and the flame gauge
   fired when a reel was RELEASED, a whole fall before the scatter reached the window: -417 to -399 ms at Normal,
   -267 at Turbo on books_base id 78 (the brief's 460 ms is the strip mode's deceleration clamp, the same defect).
   They now wait for the reel's landing frame, where scatter_land already sounded; a reel that settles without a
   landing frame still resolves, so no wait can hang (89 slam scenarios and 19 others, none hung). **Corrections
   (wave 3):** the pacing moves one fall later, +400 to +417 ms at Normal and +267 to +283 ms at Turbo and Super, on
   the 0.25% of base spins whose pulse falls on reels 1 to 4 (the commit said +250 and 0.54%, NUM-04); and the
   commit's title overstates: the SECURED, fourth and fifth beats, the charge and the gauge fire on landing, but the
   two-scatter tease (riser, dim, tremble, sparks) still starts one stagger after the second scatter's reel is
   released, about 305 ms before that scatter lands at Normal and 200 ms at Turbo and Super. That predates R152 and
   is the anticipation the brief kept; it is on the owner list (NUM-09).
4. **Bought feature first action (bebd70a6, 29c27850).** A bought round never wrote a base board, so the grid showed
   the twenty-L3 placeholder (itself a 1,024-way deal), the previous round's board, or under a capped buy's MAX WIN
   hold the cosmetic pre-spin board beside WIN $5,000.00. Every bought book carries one basegame reveal (200,000 of
   200,000); the grid now shows it before the settle, as Bet Replay already did, and the same for a recovered
   triggered round. A guard keeps the pre-spin board from standing beside a win. Wave 2 found a buy inside the
   previous win's 4 s teardown carried that win's highlights onto the real board (20 cells; up to 22.8 s under a
   capped hold); a cleared win list now resets the grid and the per-cell burst timers are cancellable. **Verified:**
   13 of 13 scenarios, 0 stale cells, planted control red.
5. **Win latch during the feature brace (245939f5, 29c27850).** The literal case, a paid win inside the brace, is
   unreachable on every path (WL-03). What did drop a paid win's hero reaction was win-on-win: a 10x-plus settle
   before the previous reaction ended (measured at Normal, Turbo, Super and by autoplay). A refused win is now queued
   and plays when the in-flight reaction ends: late by +269 to +1,215 ms across the R152 runs (at most the remaining
   hold, 1,500 ms or 1,900 ms behind an epic, less the settle gap, plus two frames; the commit said 282 to 918 ms,
   NUM-01), never skipped. Siblings fixed: lowering the bet after a sub-10x win raised a phantom MEGA banner, a hero
   punch, a shake and a small-win flash with no new round; each now decides once per settled amount. Two identical
   wins both shake. The queue cost braces that played before (3 of 3 at Super Turbo); a brace refused by a LATE
   reaction now goes to the front (10 of 10).
6. **Title halo (954ec600) KEPT.** Softness at 0 of 12 size and DPR configurations on the production build with a
   native device scale factor. Under Playwright's deviceScaleFactor emulation a classifier fired at 2 of 12
   (844x390@3, 932x430@3) identically with the halo, without it and with the pre-954ec600 markup: an emulation
   artefact, not the halo. The instrument's planted blur and a runtime positive control read soft every time.
7. **Four dead rasters (9b2703ce).** hero_icon_96.png (23,135 B), panel_balance.png (17,912 B), panel_win.png
   (19,113 B) and scene_character.png (774,813 B), 834,973 B in all, were requested 0 times in 14 production
   contexts; each had a static reference in dead code, deleted in the same commit (an img in the unimported
   LoadingScreen.svelte, which stays; two unread themeStore fields; SceneGroup's unreachable 'static' hero branch).
   Sources stay tracked. **Convention (n):** the ledger had kept that branch as Path 1's escape hatch, so Path 1 is
   now a revert of that hunk, never a re-render. hud_banner.png stays (requested and painted). The car stays pruned.
8. **overdrive_perimeter.png:** unreferenced and already pruned from dist since R131 (vite.config.ts LEGACY_FILES).
   Nothing to do.
9. **Cousins:** spin/spins and way/ways are the count keys above; "SCATTERs" in the English rules prose reads
   "SCATTER symbols" (real and social). The paytable still spells the scatter four ways and mixes serial-comma
   styles on one screen (owner list, copy).

## Phase 2: motion residue

- **A and B, idle phase offsets and Turbo holds (30cc3751, comment d506e710).** Re-derived after item 3 moved each
  pulse to its reel's landing, on a model recalibrated on the GPU (every landing within a frame; both positive
  controls red). Normal and Super now have no side-by-side same-class pair under 50 ms on any spin in any mode.
  Turbo is 0.0068% (base), 0.0054% (Cruise), 0.0121% (OVERBOOST), and no column step clears it without losing the
  Normal zero (proved over every step): **residual recorded, per the brief.** Column 5 moved -3.714 s to -3.035 s so
  the Normal zero survives a landing-to-release overhead up to 38 ms at 60 Hz (46.6 at 120 Hz), where it held only
  to 21.6 ms; the overhead measured 5.7 to 12.6 ms. The 90, 131 and 93 ms separations are kept.
- **C, the "+N FREE SPINS" settle (2df78dac).** R151's shrink-fade held, but the 70 ms settle moved 0.19 to 0.23 of
  scale per frame at Turbo and Super; it shrinks to 0.85 there (0.06 a frame). Normal keeps 0.5. Verified at all
  three speeds with a control.
- **D, banner exit:** opacity 0 before removal and centre drift at most 1 px at BIG, MEGA and EPIC, 1280 and 390, and
  a cut under reduced motion. It already passed at start and still passes after the slam-in change below.
- **The banner slam-in (Phase 4 item 1's transient; 2df78dac superseded by 29c27850).** The overshoot peaked at scale
  1.1685 and at 1280 pushed a live FEATURE PRICE and the tier word off screen for about 180 ms. 2df78dac's 1.04 key
  (peak 1.1026, "under the 1.1034 that keeps the row on screen") was wrong: that bound ignored the win shake, which
  moves the stage up to 7 px in the same frames, and wave 2 measured the price's last glyph cut by up to 4 px for 3
  frames (NUM-10). At 1.02 the peak is 1.0806 against a bound of (640 - 7) / 580 = 1.0914, and it measured 0 frames
  past the edge at 960, 1280, 1440 and 1920, at least 6.2 px to spare at 1280. It still reads as a slam.
- **E, phone SPIN:** press scale 0.96 and arrows turning; under reduced motion the press stays and the arrows stop.
  Passed at start and after.
- **F, shock ring, H1 spoke, scatter scanline:** live in the built CSS and running on the production DOM with a real
  computed change, both positive controls caught. The repository's css liveness gate passes but does not cover these
  three (owner list, gates).
- **G, hero blink:** 0 blank frames in 15 wins and 5 braces on the final candidate, every seeded one-frame hide
  caught, and the known-bad control (R151's warm layers removed) blinks 20 of 20. No HeroIdle change was needed for
  this item. A one-frame backward step in the crossfade at the brace's end (not a blank) is parked (G5).
- **H, parked with evidence:** the band over the hero's head during his reaction, the max-win overlay burying his
  epic, the sub-10x policy and SC-03's target. Owner list.

## Phase 3: R147 D2, D4 and D5 (533debeb)

soundService.ts only; no stem, graph node or duck number changed; loopBed.ts untouched. The spin duck's restore was
an anonymous 1,800 ms setTimeout. **D4 CLOSED:** it lifted the bed to full about 1.6 s into the anticipation riser
and left it there for the riser's last 2.8 s on the natural trigger, on 58% of riser spins at Normal (3.3% of all
base spins; wave 3 NUM-05 corrected the commit's "2.8 s into"); an earlier spin's timer also ended the next spin's
duck at Turbo. The riser now cancels the restore (soundService.ts, `playAnticipation` calls `cancelSpinDuckTimer`).
**D2 CLOSED:** a feature started inside the duck ramped the tension bed to the ducked level and held it there for the
whole feature; a feature start now cancels the restore and enters at the slider level (`setOverdriveBed`, the
`if (active)` branch). Verified by slam, buy and the D4 cousin, with negative controls unchanged and an ordinary
spin's duck still lifting at about +1,800 ms. **D5 NOT CLOSED:** every win tier sits under the unducked bed at
default sliders; the heard-level table is unchanged, and it is a listening question with no fence-compatible code
fix. Owner list. Heard side effect: at Turbo autoplay the bed now stays ducked for the whole run (I2).

## Phase 4: locales, widths, Bet Replay, reduced motion

- **Settled clips:** none of any live value or label in en, ja, zh or ar at 1280x800, 390x844 and 844x390.
- **Baked English:** the paytable Interface Guide showed SPIN, FEATURES and MAX as captures with English in the
  pixels, to every locale (OCR in ja, zh, ar), and "SPIN" to a social player whose button says PLAY. They are
  replicas in markup now, carrying the live translated words and, after wave 2, the live label's typography
  (2c6d7b54, 7656311f). No raster made. The three captures still ship, unrequested (owner list).
- **Parked, with evidence:** the feature-end win band sits over the bonus instrument column's first plate at 1280 and
  844x390 (L3); the studio emblem on the splash carries words (L5); at 844x390 the buy confirm's price row opens
  below the fold (L6); the buy confirm's max-win value autofits to 8.11 px in ar at 390, under the 9 px floor (L7);
  the free-spin counter reads 1 on the end card (L8).
- **Bet Replay:** the r043 replay audio proof 11 of 11 (self-test PASS); the Web Audio idle bed runs in replay and is
  silent under mute; replay values equal the booked round for base.bigWin, bonus.feature and super.feature in both
  envelope shapes. Fixed (05635db2, 29c27850): the multiplier at booked precision (toFixed(1) misread 84% of winning
  base weight; a 0.25x round, 208 base book rows, read "0.3×", and the replay gate's synthetic 4,999.99x envelope
  read "5000.0×"; no published round pays between 4,779.70x and the cap); one set of tier words (a 171.1x replay
  said EPIC then MEGA), decided on a centibet-rounded multiple so an exactly-100x round cannot split; the popup's
  lost space. Parked: the end banner's whole-number multiplier (R5), no base-game celebration banner in replay (R6).
- **Reduced motion:** hero float, title pulse, symbol idles, feature frame flashing and the spin glyph all off or
  static. The frame's route colours are the opposite of their code comments in both settings (owner list).

## Phase 5: docs and git

- **Dated notes only (0045c26b, 85b077c1, d506e710):** the live upload walkthrough (PART 9i) and its step 5, CLAUDE.md
  (above (o.1) on the kit-versus-frontend/dist tension, per convention (n); above the R147 audio note),
  GAME_FACTS.md, SUBMISSION_DOSSIER.md, RESKIN_BOUNDARY's July audio sizes, the audio truth map (R149 to R152),
  SPINE_ROBOT_RIG_SETUP.md, the ledger's older sections that list scene_character.png as shipping, the R147 estate
  audit, and OWNER_CHECKLIST. Wave 3 caught one row I had extended in place (the stale kits row, which then
  contradicted its own "not done"); it is restored to its 86874db7 text with a dated note above the table.
- **The sounds README is deliberately not edited:** the brief fingerprints every sounds/ file; wave 3 confirmed it
  already states the bed, the exemption at its hash, the retired circular bed and the 140 ms edit's licence line.
- **Branches:** one merged session head deleted (item 1 of the preconditions). analysis/2026-08-15 (aed054a1) and
  track/standback-2026-08-15 (7108da98) meet every mechanical condition but CLAUDE.md reserves them for the owner;
  left. Every head with unique commits is intact. 64 local heads remain (clutter, not in scope).
- **uploads/.env:** tracked, 27 bytes, two keys with empty values, and no value in any historical version. Nothing
  added.
- **Kit:** not built, nothing uploaded. The owner's exact rebuild sequence is in the owner list.

## Tooling fixed on the way (b98b930e, 44355957, 6ddd7dfb)

- **Vite ran the build-diet plugin's closeBundle when a DEV server closed**, so stopping any dev server pruned and
  restamped frontend/dist/build-info.json (vite.config.ts's own comment said it never did; wave 3 CI-9). The plugin is
  build-only now and prunes and stamps the resolved outDir. Control: a dev server opened and closed with the old
  config restamped build-info.json; with the new one it did not. A production build is file-for-file identical but
  for the stamp text.
- **The retrigger proof's self-test would have gone red in CI:** the moment gained a max-width, so the seed squeezed
  its box to zero while the nowrap text painted past it. The proof measures the union of the box and the text's
  range rect. Control on the same build: the old script's self-test FAIL (seed missed); the new one PASS, and the
  real proof PASS at desktop, mobile-s and popout-s.
- **The look-pass harness** adds 844x390, treats an asset answered with HTML (the preview server's SPA fallback) as
  missing, refuses a dirty boot line, and refuses a win shot unless the banner is on screen at 0.9 opacity or more.

## Incidents

- Wave 1's halo agent ran `git revert --no-commit 954ec600` in the checkout; aborted within about a minute, tree
  verified clean.
- Wave 1's max-win hold self-test restamped the frozen base build's build-info.json (commit "unknown"); identity
  thereafter rested on the entry script, and the payload totals still match the build log to the byte. The Vite
  fix above removes the mechanism.
- A wave 2 verifier seeded the frozen candidate's index.html for 92 s, then restored it and verified it
  byte-identical.
- An early look-pass run on a loaded machine (load about 267 during wave 2) photographed the compact layout after its
  banner had gone and passed; the harness now refuses that shot.

## Local CI at the tip

Both suites replayed from checks.yml at d506e710, each from its own clean build (build-info commit d506e710,
cleanTree true). **Static: 85 pass, 0 fail**, one step skipped (`npm ci`, which would reinstall node_modules under
any dev server running from this checkout). **Browser matrix: 28 pass, 0 fail of 28.** Every new gate was seeded red
before it was trusted: plural.test (the shipped form), scatterCount.test (the old interpreter, "got 3, want 2"),
replay_contract_gate's exact multiplier (red on main's panel), build_diet_verify's four new prefixes, max_win_hold's
widened rule, and the retrigger proof's seed (above).

## Look-pass screens

`frontend/scripts/look_pass_capture.mjs` on a clean build of d506e710 (build-info cleanTree true), committed as
`reports/screens/r152-look-pass/` (commit c2a7080c): idle, a real 16.2x win at the banner's peak and the natural
feature entry at 1280x800, 390x844 and 844x390, nine shots, 0 refusals. **The boot line the build prints: "Future
Spinner v10 build d506e710"**, no dirty mark (the harness refuses one). No shipped file in that build comes from an
untracked or gitignored source (checked file by file against the build, with a gitignored master as the positive
control), so no shot can show scratch art. Each shot was looked at. Against R151's set: the chip reads "L3 x4 1 way
$0.20" where it read "1 ways", and it is hidden at the feature entry. Visible and pre-existing, both on the owner
list: the win band crosses the hero's head at 844x390, and the entry shows HUD WIN $0.00 beside TOTAL WIN $10.80.

## Fence at close

Re-hashed after the screens were committed: **2,737 of 2,737 start rasters unchanged; the only new tracked rasters
are the nine look-pass screens** (2,746 now); 539 of 539 theme files unchanged, and no file added under the theme
directory; all 36 sounds/ files byte-identical, none added or removed. A copy of the raster manifest with one hash
flipped reads MISMATCH (positive control). No committed audio, raster, SVG or Spine file on the branch outside the
screens directory; no maths, no locked path (rgsService.ts, gameStore.ts, games/future_spinner/,
.claude/settings.json), no HUD geometry and no token colour changed (wave 3 FN-01 to FN-08; locked paths, maths and
loopBed.ts re-checked here by diff at the screens commit, locked_paths_gate PASS). No image generation, no Spine, no Path 1 rest-pose swap, no kit, no upload. Not merged.

## Restore

Each change is its own commit: revert the one you do not want (copy 9a3de4e5, splash 6441c44a, scatter e2381b59,
bought board bebd70a6, win latch 245939f5, dead pixels 9b2703ce, audio 533debeb, motion 2df78dac, guide 2c6d7b54,
replay 05635db2, docs 0045c26b, harness 44355957 and 6ddd7dfb, verification fixes 7656311f and 29c27850, offsets
30cc3751, docs 85b077c1, tooling b98b930e, corrections d506e710, screens c2a7080c, and the records commit that carries this report).
Several later commits amend earlier ones (7656311f and 29c27850 fix the first cut), so revert those with their
parents. Once merged: revert the merge. **Owner preview NOT refreshed:** the brief forbids touching 5173.

## OWNER LIST

1. **Kit rebuild. Next: you, after merging this PR.** Not built here (forbidden). On a clean checkout of main that
   contains the merge:
   `git switch main`, `git pull --ff-only origin main`, `node scripts/kit_build.mjs --self-test` (expect PASS),
   `node scripts/kit_build.mjs --check` (expect "checks pass, nothing built"), then `node scripts/kit_build.mjs`,
   and check that `~/Desktop/FS_UPLOAD_KIT/BUILD_INFO.json` names the commit `git log -1` printed. Upload the
   CONTENTS of `02_frontend_upload` to the entry future-spinner, publish, do not press Start Approval, and open it in
   a new private window: the first console line must read "Future Spinner v10 build <sha>" with that commit. There
   is no zip step. Do not expect kit_manifest_gate.mjs to pass against a kit_build kit (two builds of one commit
   always differ); do not follow PART 9i's old folder name or entry. The kit on the Desktop now was built at
   b4455850, 82 commits behind main at 542246cf, and kit_build overwrites it.
2. **Cover art and a 30 s or shorter muted hover clip (Hayden). Next: you.** Not started: no image generation this
   session. The look-pass harness can capture real gameplay frames if you want a clip cut from the build.
3. **win_max is 1.81 s** (the shipped mp3; the master is 2.34 s) against the 5.0 s spec and the 2.6 s max-win
   reveal. **Next: you, a longer stem.**
4. **Phone floor on the dual-mono idle bed:** 4.41% of its energy is at or above 200 Hz (FFT of the master at
   hash 99643c41, the accepted one; a 4th-order high-pass split gives 3.88%), so a phone speaker carries little of it. **Next: your ear, on a
   phone.**
5. **Parked layout items. Next: your ruling picks one per pair.** The band over the hero's head during his reaction;
   the max-win overlay burying his epic (the two proposed fixes conflict); the feature-end band over the bonus
   column's first plate at 1280 and 844x390; the band over the Overdrive odometer; the sub-10x policy; SC-03's
   target.
6. **Which folder is canonical for upload. Next: your ruling.** CLAUDE.md (o.1) and DOSSIER 5b say frontend/dist;
   your path since R137 is the kit. Dated notes surface the tension; neither rule was rewritten.
7. **Three guide captures ship unrequested:** spin_button.png 30,127 B, btn_features.png 25,075 B, btn_max.png 8,408 B
   (63,610 B). **Next: your authorisation to prune them from dist** (sources stay).
8. **Native review of the plural forms. Next: a speaker per locale.** ar and hi above all, then pl, fi and ru; the
   ja, zh and ko counter words; ar at one way still reads "1 طريقة" (unchanged); fi and hi guide FEATURES rows name
   a different word than their replica; replay labels keep the loanword where a locale names the symbol otherwise.
9. **The two-scatter tease opens before the second scatter lands** (about 305 ms at Normal, 200 ms at Turbo and
   Super). **Next: your ruling** on whether anticipation should also wait for landing.
10. **D5, heard win levels** under the unducked bed. **Next: your ear.**
11. **Hero timing residue. Next: a code brief.** A bought feature's hero and tier stinger fire at the end banner's
    dismissal, 4.2 to 13.7 s after the reveal; a brace is refused after COLLECT within 1.9 s of a max win; queued
    reactions play over the next spin; a one-frame backward step in the crossfade at the brace's end.
12. **A recovered feature leaves HUD WIN at $0.00 with no hero reaction** (pre-existing). **Next: a code brief.**
13. **Live play's payoutMultiplier scale** differs between the harness and the wallet contract (WL-14); proving it
    needs a test against rgsService.ts, which is locked. **Next: your LOCK-SANCTION or a ruling.**
14. **Keyboard residue. Next: your ruling.** A HELD Space through the splash spins on auto-repeat once the rules card
    was seen; Enter with focus on RESTART answers RESUME; the resume offer is sometimes never raised because the
    warm mount clears the TR-099 checkpoint.
15. **Replay and banner parity. Next: a code brief.** The end banner's multiplier is Math.round (it overstates about
    half the time, live and replay); replay shows no base-game celebration banner; the feature-end banner's whole
    number sits beside the panel's exact one.
16. **Small layout and art items. Next: your ruling.** The frame's route colours are the opposite of their comments;
    the studio emblem carries words; the ar buy confirm's max-win value at 8.11 px; the end card's free-spin counter
    reads 1; the 844x390 buy confirm's price below the fold.
17. **Copy style. Next: the text lane.** Scatter spelled four ways and mixed serial commas on one paytable screen;
    the chip's letter x beside the × elsewhere; bigWin and megaWin now unread in all sixteen locales.
18. **Audio behaviours noticed, not changed. Next: your ear.** At Turbo autoplay the bed stays ducked for the whole
    run; an unmute during a feature brings the base bed back at full with no fade; a feature starting while the
    riser still runs would enter at the riser duck (not exercised).
19. **Gate holes. Next: a gates brief.** Neither the asset reference gate nor build_diet_verify can see a missing
    CSS-background raster (the look-pass harness now can); the css liveness gate does not cover the shock ring, H1
    spoke or scanline; the typecheck baseline is 36 where the real count is 3; build_diet_verify's intermittent
    media-abort flake; no gate covers the hero queue or the three new latches; CI leg durations against the 15-minute
    job timeout were not measured.
20. **Turbo idle residual** 0.0068 / 0.0054 / 0.0121% (base, Cruise, OVERBOOST), provably not removable without
    losing the Normal zero. **Next: none unless you want Turbo over Normal.**
21. **Branches. Next: your word.** analysis/2026-08-15 and track/standback-2026-08-15 (0 unique commits, PRs #124
    and #123 merged) are yours to delete; 64 local heads are clutter.

## FOR THE NEXT SESSION

**Model and effort:** Opus 5.5, ultracode, unattended. Three workflows: wave 1 measure (14 agents, 5,444,481 tokens),
wave 2 adversarial verify (13 agents, 4,210,578), wave 3 self-audit and timing re-verify (8 agents, 2,737,518); none
lost. **Plan of record:** the brief's phases in order; wave 1 decided what to change, wave 2 what to keep, wave 3 what
the messages and comments may claim.

**Approach:** preconditions; fingerprint; frozen builds of main and of each candidate, served in-process with the
entry script hashed; wave 1 measured every item with a planted positive control; implement; build a candidate; wave 2
re-ran every instrument on it against main's build; fix what failed; second candidate; wave 3's five lenses; fix
and correct; clean tip build; both local suites; look-pass; records; PR.

**Alternatives rejected:** a neutral placeholder board for a bought round (it reads as a 1,024-way win); clearing the
hero queue on the next spin (it skips the win again); an unconditional brace queue (it lands 1.9 s into the entry);
the 1.04 slam-in key (the bound ignored the shake); an offset set giving a Turbo zero (every one loses Normal);
editing the sounds README (fingerprinted).

**Lessons worth keeping:** a count noun is a plural rule, not a string, so test it at counts real rounds reach and pin
where a table's two uses differ; an effect keyed on a store that a bet change re-derives fires with no new round, so
latch on the settled amount; a comment's "measured" range must come from the widest run, and a number that only ends
the tested range is a floor, not a limit; a box-only bounds check is blind to nowrap text painting past a squeezed
box; Vite runs closeBundle when a dev server closes, so a build-only plugin must say apply: 'build'; and a byte-equal
logo proves nothing about which build is served.
