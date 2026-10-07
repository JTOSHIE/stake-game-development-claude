# R153 - THE BET BAR IS AN OPERATOR STRIP, THE HERO IS ONE STILL, AND THE GAUGE IS OUT OF THE BAR (2026-10-07)

**NOTE 2026-10-07 (R154), the records commit, written above the record rather than into it.** R153 closed without
committing this report: the owner stopped the session at the pull request, so the text below lived only in PR #189's
body. R154's TASK 1 (`reports/briefs/FS_R154_MergeRuleWinBanner_Prompt.md`) commits it here and to
`reports/archive/2026-10-07_r153-operator-strip-hero-still.md`, byte for byte as the PR body held it from its own
heading down, with the PR's opening summary and footer left off. Everything below is the record as R153 wrote it, in
its own tense; four facts arrived after it was written, VERIFIED 2026-10-07 by `gh pr view` and `gh run list`:

- **PR #189 merged** at 07:27:59Z by the owner, head afa58195, merge commit c9319124. Its PR run 37586404158 on
  afa58195 and main's run 37587486483 on c9319124 both completed success. "Remote CI on the PR: pending at PR open"
  below was true when written.
- **The owner's three rulings** (`reports/briefs/FS_R153_OwnerRulings_Prompt.md`) arrived after the PR opened: the
  gauge is the flame jets and the clip stays, with the speedometer dial above SPIN; the still stays and the strips are
  not restored; the eight unused guide captures leave the build and stay in the repository.
- **Ruling 3 landed after the merge.** Commit 4395afef reached the branch once #189 had already merged, so it rode a
  second PR, #190, which the owner merged at 07:52:58Z as 2ffae8ef. Its PR run 37588106781 completed success. A
  correction comment on #189 records that an earlier comment there wrongly said the merge was still the owner's.
- **"Not merged" and "the checkout is left on this branch"** in the PR's opening summary were true at PR open and are
  not carried here; R154 branched from main at 2ffae8ef.

Brief: `reports/briefs/FS_R153_OperatorStripHeroStill_Prompt.md`, saved verbatim first (a162480e). Review lane,
unattended. Branch `claude/r153-operator-strip-hero-still` from main at 895815b9 (PR #188 merged by the owner; main
CI on it green, run 36560999697). Port 5173 untouched: the dev server ran on 5174 and every proof served its own build
on a free port.

**Bar structure, in one line, as the brief asks:** label BALANCE / WIN / BET at 10px tracked caps in 60% white, value
in white Exo 2 with tabular figures read live from the stores, one stroked chevron pair beside BET, and a 2px ring on
the spin circle, the only colour on the bar.

**A win no longer waits on the hero:** in a five-spin session on the production build, pressed the moment SPIN
re-enabled each time, the hero was the same single still at all ten press and settle points, nothing ran on him but
the float and its three light accents, and no request reached `ui/hero/`. The same session on main's build found a
win reaction running at every press after the first big win.

**Fence:** zero rasters staged, zero rasters generated (`git diff main..HEAD --name-only` carries no image, audio,
Spine or data file).

## Preconditions

- Session-start protocol: CLAUDE.md read, brief saved first, checkout clean on main at 895815b9 (PR #188's merge),
  main CI green. No dirty rasters (fingerprint: `git status` empty at start).
- The owner's 5173 was not running and was not started. The R153 dev server was `fs-dev` on 5174.
- Wave 1, mapping (workflow r153-understand, 4 agents, none lost): the hero render path, every gate that reads the
  HUD, the paytable and feature entry buttons and the gauge candidates, and the HUD's own style block.

## TASK 1: the operator strip (71788941, review fixes 7e8ca921)

**What the bar is now, at every profile.** One plate, `rgba(18, 20, 26, 0.9)` with 8px corners and nothing else:
no `hud_banner.png` (the bracket texture), no gradient, no bezel, no shadow, no rail, no per-field colour. Six
`--op-*` tokens on App.svelte's `.game-wrapper` carry the brief's numbers once (plate, 60% label, white value, 86%
glyph, 32% and 72% hairlines). BALANCE, WIN and BET sit straight on the plate as a 10px label (0.16em tracking,
uppercase, 60% white) over an 18px value (white, Exo 2, `tabular-nums`, the markup's own text fed by the stores).
BET changes with one stroked chevron pair; the chrome caps and filled triangles are gone, from the control and from
the paytable guide. MAX, MENU, TURBO and AUTO are 1px hairline circles on the plate (TURBO's three speeds are three
white luminance steps: an outlined bolt, a 40% white face with a solid bolt, a white disc with the bolt cut out); SPIN is the plate inside a 2px
ring in `--hud-accent` (cyan, magenta under Overdrive), with a white glyph and word. Portrait, compact landscape and
the 400x225 mini strip take the same treatment; their values moved from Orbitron, which ships no tabular figures, to
Exo 2. The mini strip keeps 7px labels, the one place under 10px, because at 400x225 a 10px label measured cutting
the value (R2R-R JOB C); the brief's proof sizes are 1280 and 390.

**Geometry stayed inside the locked spec.** Paint only: `hud_banner_spec_check.mjs` PASS on every locked box,
centre-Y 604, all seven 16px gaps, AUTO tangent to SPIN, every target at least 44, and a $1,234,567.89 balance and a
$1,000,000.00 win still fit. `docs/HUD_SPEC.md` carries a dated note. TURBO keeps its 82x82 box and draws a 48px
circle, the size of MAX and AUTO, so the speed control does not read as a second SPIN; the circle sits at the box's
right edge (233..281), 16px from MAX like every other visible gap and flush with the strip's left end as SPIN is with
its right. (The first cut centred it and left a visible 33px gap; the review caught it.)

**Touch targets at or above 44px, per control rather than per column.** Each desktop chevron key was 44x24 (only the
44x52 column was ever measured); each now takes a 44x44 press, its hit area extended 20px away from the other key,
column unchanged. The desktop BET readout was a 104x20 click target, and this layout is also what a landscape tablet
gets, scaled; its press now covers the whole 120x62 BET box through a `::after` on the button. The hamburger menu's
items, PAYTABLE first and the paytable's only entry, measured about 32px and are now 44px (the mini menu keeps its
measured compressed rows).

**The gauge is out of the bar.** Nothing with a dial sits in the strip: the Overdrive dial column ends 16px above it
at 1280. What did sit in it is the flame gauge: FlameJets.svelte calls its jets the "TENSION GAUGE (the owner's
idea)", and its two bottom jets sit on the frame's bottom edge (stage y 552) and fire down into the strip's box
(281..999 x 560..648). At rest they were under the plate, which now lets 10% through; during every retrigger beat
App.svelte lifts them to z90 and they painted straight over BALANCE, WIN and BET. On the desktop layout an even-odd
clip now cuts the locked panel rectangle out of everything the jets draw, with the holder pinned at z15 so the stage
order is exactly what it was (a clip-path alone would have dropped the jets under the frame they are mounted on).
Measured at a real retrigger beat with every animation paused: 0 pixels of the strip change when the jets are hidden,
against 2,056 on main's build. In portrait the Overdrive meter is the gauge component's compact form; it sits above the
strip on its own plate (its pink per-cell glow is gone), not in it.

**Entry surfaces on the same plate.** The four FEATURES triggers are the plate with white type (the compact and mini
ones hairline circles), and OVERBOOST engaged reads as a solid white edge and a white OVERBOOST tag rather than orange;
the 20-second idle attract is kept as a white hairline that breathes rather than a cyan bloom, and it keeps the
OVERBOOST edge while it breathes. The hamburger menu that holds PAYTABLE (its Popout S speed rows included, which
still glowed in the accent in the first cut), the autoplay menu (it was gold) and the bet picker the BET value opens
(it was navy with cyan, gold and orange glows) are the plate with white type. The three instrument
plates above SPIN during a feature are the plate with a 10px label (they were chamfered with a rail). The paytable's
Interface Guide rows for bet up, bet down, autoplay, menu and the three speeds are live markup replicas of the new
controls, as R152 did for SPIN, FEATURES and MAX; recapturing them would have committed rasters.

**Removed from the bundle, kept in the repository:** `hud_banner.png` (63,873 B, the texture) and
`btn_bet_plus.png` and `btn_bet_minus.png` (17,466 B, the plus/minus artwork), 81,339 B; the five themeStore button
fields that nothing read are gone. The first cut also pruned the other eight guide captures; that went past what the
brief orders and past R152's owner item 7, so it was withdrawn (7e8ca921) and the eight still ship unread, on the
owner list.

**Found in passing and closed:** the desktop OVERBOOST/Cruise badge anchor had been hand-set at `left:831px`, the BET
box's position before R071 moved the row 28px left, so the badge had floated 28px right of BET since 2026-08-15; it
now reads `--fs-x-bet`. The volume sliders had `outline: none` and no replacement, so keyboard focus on MUSIC or SOUND
was invisible; they now carry the same ring as every other control.

## TASK 2: the hero is one still (dd573727, review fixes 7e8ca921)

**What renders.** HeroIdle.svelte draws `ui/scene_character.png` as one `<img>` (680x1344, the owner's R145 Astra
still, the only committed single-frame raster of the pilot) with the drop-shadow the body always had. It has no
state, reads no store, sets no timer and emits nothing. The win unfold (32 frames), the feature brace (16), the R138
crossfade buffer and the R151 warm layers, which kept both reaction sheets painted at 1% even at idle, are deleted;
the old header stays below a dated note as the record. The glance had been off the path since R130. No ambient
strip exists in the tree or its history (the hero map searched both); the six-frame idle sheet was the strip still
on the path, drawn at frame 01, and it goes too. The float on SceneGroup's `.char-layer` (translateY 0 to -3px over
5s) is unchanged and is the ceiling.

**Why this still and not the idle sheet's frame 01:** frame 01 is one frame of a six-frame strip, so drawing it still
fetches and paints the strip, and cutting it out would be a raster commit. Measured in the 206x407 box against frame
01 (alpha > 127): silhouette IoU 0.9565, the same x extent (27..178), the crown 1px and the feet 3px higher.

**The overlays were measured, not re-pinned, because they still sit.** The orb, visor and lamp features move at most
1.9px on the still (orb -0.4/-1.3, lamp bars -0.2/-1.9), and the same centroid method puts the old pin 1.0px off the
orb on the frame it was pinned to, so a re-pin would move each light by less than the method's own residual. Measured
as CSS renders them (farthest-corner gradients, the stops as written, the border-radius clip, figure = alpha > 127),
the share of each glow on the figure is antenna 73.7%, visor 96.5%, lamp 100% on the still against 77.7%, 97.8% and
100% on frame 01. **Correction:** dd573727's message and the first header quoted 91.3/99.9/100 from a simplified
falloff, which the review could not reproduce; the figures above replace them, and the antenna's share fell rather
than rose. The brief's underglow is the car's (`.underglow` inside `.car-layer`); the car did not
change, so it was not touched. The `:has()` rule that cut the accents during a reaction could never match again and
is deleted with a note.

**The bundle:** the idle, win and brace sheets (7,310,268 B) are pruned, `scene_character.png` (774,813 B) returns,
and the prune now also removes a directory its file prunes leave empty (`ui/hero/` shipped empty otherwise). The
sheets stay in the repository: reinstating the reactions is a revert of HeroIdle.svelte plus the prune lines.

**The gate.** `hero_idle_planted_gate.mjs` is rewritten to this ruling: one `<img>` of scene_character.png; no
`ui/hero/` path or sheet name anywhere in `src` outside comments; no import, reactive statement, timer, frame
callback, lifecycle hook, dispatcher or store write in HeroIdle; no binding or handler on its mount; the R138 float
fence unchanged; reduced motion still stops the float. The review reproduced four bypasses of the first cut (an
inline style on the still, a wrapper around its mount, motion targeted at it from app.css, a strip url() in a .css
file), and 7e8ca921 closes all four: attributes whitelisted, the mount a direct child of `.char-layer`, every
stylesheet checked for motion on the still, `.css` files and `index.html` scanned. Eighteen seeds caught, two
controls clean, in CI's static job.

## TASK 3: proof

`frontend/scripts/r153_operator_strip_proof.mjs` (031faba5) serves real committed book rounds at the wallet boundary
of the PRODUCTION build, as the look-pass harness does, with no DEV hook. On the clean build of afa58195 (boot line
"Future Spinner v10 build afa58195"):

- **S, the strip is a control, at 1280x800 and 390x844:** the plate is `rgba(18, 20, 26, 0.9)`, 8px, no image,
  gradient, shadow or border; the three labels are 10px, uppercase, tracked, `rgba(255, 255, 255, 0.6)`; the three
  values white, Exo 2, `tabular-nums`, with digits from the live stores; exactly one stroked chevron pair; the ring
  2px and round; no `<img>` and no raster or gradient background anywhere in the HUD; the ring the only chromatic
  paint on any visible HUD element; every HUD control a 44px press (box at least 44, centre and four axis points
  hitting it). PASS at both sizes.
- **H, a five-spin session never waits on the hero, at 1280x800:** rounds 3.9x, 16.2x, loss, 16.2x, 3.9x, each
  pressed the moment SPIN re-enabled (0 to 1 ms after it did). At all ten press and settle points the hero was the
  same decoded still of `ui/scene_character.png` with no reaction state and no strip; nothing on him ran but the float
  and its three accents; zero requests reached `ui/hero/`; no page errors. Press to settle: 1,264, 1,071, 1,071,
  1,075 and 1,082 ms.
- **G, the gauge is out of the bar, at 1280x800:** at the natural retrigger beat of the base feature fixture, every
  animation paused, 0 of 63,184 strip pixels change between the jets shown and hidden (noise floor 0).
- **Positive control** (`--expect head`, the same proof against main's build, 895815b9): S finds main's bar failing
  the contract at both sizes; H finds the win reaction running at every press and settle after the first big win
  (spins 3, 4 and 5 all pressed while it played, the second 16.2x queued behind the first) and three strip requests;
  G finds 1,857 strip pixels of gauge at the beat (2,056 in an earlier run). PASS, so each section can see the
  defect where it exists.

**Look-pass** (`look_pass_capture.mjs` on the same clean build): nine shots at 1280x800, 390x844 and 844x390 (idle, a
real 16.2x win at the banner's peak, the feature entry), no placeholder art, no dirty mark, PASS. Written to scratch
and **not committed**: the brief fences rasters ("zero rasters staged"), which governs convention (h)'s
before-and-after screenshots under convention (n). The four the brief names (1280 and 390, idle and win) were sent to
you with this report; the before set is the same harness on main's build.

**Kill tests.** Cover the reels and the bar is a control, not a designed object: a flat plate, three labelled values,
a chevron pair, hairline circles and one ringed SPIN, and S proves the paint. A five-spin session never waits on the
hero: H, with the control showing that main's did.

## What verification found, and what changed because of it

- **Adversarial review** (workflow r153-review: five lenses, brief conformance, regressions, gates, records and the
  hero, each followed by a refuting verifier; 10 agents). Confirmed and fixed in 7e8ca921: the Popout S menu's
  speed rows still glowed in the accent; TURBO's centred circle left a visible 33px gap; the idle attract wiped the
  OVERBOOST edge; AUTO's hover outranked its running edge; the bet picker was still neon; the first cut pruned
  eight captures the brief did not order (withdrawn); the empty-directory prune ran before the .DS_Store strip; four
  bypasses of the hero gate; and a run of comments and documents that R153 had made false (dated notes in a7dfdb22,
  three agents on disjoint files). Refuted as defects, kept on the owner list: the volume sliders' 4px tracks
  (unchanged since before R153). Taken to the owner rather than decided: which gauge (owner item 1).
- **turbo intensity, twice.** The first cut's engaged face (22% white) stepped 1.165:1 on Desktop against the gate's
  1.25 floor; at 40% it is 1.31. The Popout S row then measured 1.246:1 at an 18% wash; at 28% it is 1.44 (ae270cc9).
  Worst adjacent step across the seven presets now 1.290:1.
- **money fit, a latent defect that R153's timing exposed (afa58195).** Red twice in three local runs on the
  paytable's Bet Modes prices (CA$100,000.00 +6px, CA$400,000.00 +9px), while main passed the same gate under the
  same load, side by side. Measured: the prices are Orbitron 600, served by the 700 face. On main, opening the
  hamburger menu (the only way to PAYTABLE) rendered MUSIC and SOUND in Orbitron 700 and so fetched the face early;
  R153 set those labels in Exo 2, so the face arrived with the paytable, after `autofitText` had measured, and the
  action never re-measured. Forced with the face delayed 2 s: the pre-fix tip and main both overflow by exactly 6
  and 9px; with the fix both re-fit to 0. The fix is in the action (one `loadingdone` listener re-fits every live
  autofit node), not Orbitron put back in the menu, so a slow network on main's code path is covered too.
- **Instrument faults of my own, caught before they counted:** the proof's first touch probe sampled the corners of
  a 44px square, which no circle under 62px contains; its hero allowlist used bare keyframe names where Svelte
  scopes them; its first gauge diff counted the scene animating behind the 90% plate (fixed by pausing every
  animation for the pair, then 0 against main's 2,056); and my first `kill` of a stopped replay did nothing,
  because zsh does not word-split an unquoted variable (re-run per process, no survivors).

## Local CI at the tip

At afa58195, each suite replayed from `.github/workflows/checks.yml` against its own clean build (build-info commit
afa58195, cleanTree true, 95 files, 11,170,532 B against main's 100 files, 17,802,215 B): **static job 85 of 85
green** (`npm ci` skipped: it would reinstall node_modules under the 5174 dev server); **browser matrix 28 of 28
green**, two legs at a time. Local-only: `hud_banner_spec_check.mjs` PASS (every locked box, centre-Y 604, the seven
16px gaps, AUTO tangent, every target at least 44, stress values fit). `portrait_layout_conformance.mjs` (local, not in CI): **NOT COMPLETED.** Its first run stopped on its third profile when a DEV random mock round reached the max-win overlay, which covered the OVERBOOST button the script clicks; the re-run was stopped on the owner's instruction before it finished. Neither run reached a verdict, so it is recorded as not completed, not as a failure. Remote CI on the PR: pending at PR open.

## Fence at close

**Zero rasters staged, zero generated.** Every tracked raster's blob id is identical at main and at the tip (2,746 of
2,746, `git ls-tree` compared line by line; a copy with one id flipped reads MISMATCH, the positive control), and
`git diff main..HEAD --name-only` carries no image, audio, Spine or data file. No locked path changed
(`locked_paths_gate.mjs` PASS in the static job), no maths, no audio, no HUD coordinate (`hud_banner_spec_check.mjs`
PASS). Port 5173 was never started; the session's dev server ran on 5174 and every proof served its own build on a
free port. No image generation, no kit build, no upload. The checkout is left on the branch, as the brief asks.

## Restore

Every change is its own commit on `claude/r153-operator-strip-hero-still`: brief a162480e, TASK 2 (the still)
dd573727, TASK 1 (the strip) 71788941, the proof 031faba5, the review fixes 7e8ca921 (they amend both tasks), the
dated record notes a7dfdb22, the Popout S turbo wash ae270cc9, the autofit font re-fit afa58195, and the records
commit that carries this report. afa58195 stands on its own and is worth keeping whatever else is reverted: it closes
a defect main also carries.
Revert the hero with dd573727 and the hero parts of 7e8ca921 together (HeroIdle, SceneGroup, the gate); revert the
strip with 71788941, 7e8ca921 and ae270cc9 together. Once merged: revert the merge. Not merged here (review lane).
**Owner preview NOT refreshed:** nothing landed on main, and the brief reserves 5173 for you.

## OWNER LIST

1. **Which gauge did you mean? Next: your ruling.** The code calls the flame jets the "TENSION GAUGE (the owner's
   idea)", and their bottom pair painted over the strip at every retrigger beat; that is what R153 took out of the bar
   (0 strip pixels at the beat, against 2,056 on main). Your own briefs (R137, R141) call the Overdrive tachometer "the
   gauge". It never entered the strip: its column ends 16px above SPIN and AUTO at 1280. But it stacks directly on
   them, and R153 gave its three plates the strip's plate, which can read as the bar rising into the gauge. Options:
   (a) keep as shipped; (b) lift the column 32px for a 48px gap; (c) give the column a treatment of its own; (d) drop
   its plates and carry FREE SPINS and the multiplier elsewhere.
2. **The still is your R145 Astra scene_character.png, not the idle frame 01 the stage showed since R130.** Silhouette
   IoU 0.9565, crown 1px and feet 3px higher. **Next: your eye.** Going back is a revert of dd573727 whole.
3. **The three light accents stay on the still** (antenna blink, which carries a small scale pulse; the visor glint;
   the chest lamp), because measured they still sit. If "the float as the ceiling" means nothing else on him may
   move, they are three rules to delete. **Next: your ruling.**
4. **Popout S (400x225) keeps 7px labels and has no BET label.** Measured this session: a 10px label shrinks the
   balance slot from 64 to 58px, so $50,000.00 no longer fits and $1,234,567.89 falls back to $1.234M. **Next: your
   ruling,** keep 7px or take 10px with abbreviated values.
5. **Eight unread guide captures still ship, 177,434 B** (R152 item 7, widened): spin_button 30,127, btn_features
   25,075, btn_max 8,408, btn_autoplay 15,527, btn_menu 12,496, btn_turbo 14,042, btn_turbo_2 29,632, btn_turbo_3
   42,127. Nothing reads them since R153. **Next: your authorisation to prune them from dist** (sources stay).
6. **OVERBOOST's cost state is white, not orange** (the bet badge, the FEATURES edge and its tag). The word and the
   1.25x BET value carry it. **Next: your eye;** the warm colour is a small revert if you want it back.
7. **SPIN keeps its word** inside the ring (10px, 60% white; PLAY in social), where the reference has a glyph only.
   **Next: your eye.**
8. **The paytable modal's own body** still wears the R119 shell (chamfered plates, --hud-* tokens). The brief named
   its entry, which is on the plate; the modal was not restyled. **Next: your word** if it should follow.
9. **The volume sliders are 4px tracks with a 12px thumb,** under the 44px floor, as before R153 (not changed).
   **Next: a code brief if wanted.**
10. **The typecheck baseline is 36 where the real count is 3** (R152 item 19, still open). **Next: a gates brief.**
11. **Kit rebuild after merging. Next: you.** Not built here. The R152 list's item 1 has the exact commands.
12. **hero_float_proof.mjs now fails at its first selector by design** (dated note at its head); retire or retarget.
    **Next: a gates brief.**
13. **Still open from R152's list:** items 2 to 4, 6, 8 to 10 and 12 to 21 as written there (item 11's hero timing
    residue is closed by TASK 2: there are no reactions left to queue).

## FOR THE NEXT SESSION

**Model and effort:** Opus 5.5, ultracode, unattended. Three workflows: r153-understand (4 agents, 1,205,214
tokens), r153-review (10 agents, 2,426,904) and r153-docs (3 agents, 583,354); none lost.

**Approach:** session-start protocol; brief saved; before screens of main's build; map the hero path, the HUD gates,
the entry buttons and gauge candidates, and the HUD CSS in parallel; measure the still against frame 01 and the
accents on it; implement in CSS with no coordinate moved; a production-bundle proof with a positive control on main's
build; a five-lens adversarial review with a refuting verifier per lens; fix; dated notes where docs went stale;
both local suites at the committed tip; look-pass; records; PR.

**Alternatives rejected:** frame 01 of the idle sheet as the still (drawing it still fetches and paints the strip,
and cutting it out is a raster commit); re-pinning the accents (they moved less than the method's own residual); an
82px TURBO circle (a second primary beside SPIN); a centred 48px TURBO (a visible 33px gap); pruning all eleven
rasters (past the brief and past R152's parked item); removing the bottom jets (the perimeter chase is ordered over
eight); moving the tachometer (an owner ruling, item 1); 10px labels at Popout S (measured truncation).

**Lessons worth keeping:** a glow-share figure must be measured with the geometry CSS renders (farthest-corner, the
stops, the border-radius clip), not a simplified falloff: mine reported the antenna improving when it worsened. A
44px corner probe fails every circle under 62px across; the project's rule is the box plus axis points. Svelte scopes
keyframe names (svelte-hash-name), so an allowlist of bare names calls the float a reaction. A clip-path makes a
stacking context: pin the z-index or the layer drops under the frame it is mounted on. An all-clean proof needs the
old build as a positive control: main showed 2,056 px of gauge on the strip and a reaction at every press. Do not
prune what a previous session parked for the owner, however dead it is. A dead-pixel prune can leave an empty
directory behind, and a Finder .DS_Store keeps it alive unless the empty pass runs after the strip.
