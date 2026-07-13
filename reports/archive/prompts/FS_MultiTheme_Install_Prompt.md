# FUTURE SPINNER v2 — MULTI-THEME INSTALLATION & WIRING
## Read this file and execute all tasks in order without stopping.
## This is a major structural upgrade — read carefully before starting.
## April 2026

---

## PRE-AUTHORISATIONS
- ✅ Overwrite ANY file without asking
- ✅ Create ANY new file or directory without asking
- ✅ Fix TypeScript errors autonomously
- ✅ Run build, tsc, npm, git without asking
- ✅ Move, copy, rename files without asking
**HARD LOCKS:** rgsService.ts, gameStore.ts, Math SDK — never touch.
**Working directory:** ~/math-sdk/frontend/

---

## WHAT THIS SESSION DOES

This session installs and wires three new slot game themes into the
existing Future Spinner codebase. The math engine (RTP, reel strips,
win logic) is unchanged. Only the visual and audio layer swaps.

Three themes being installed:
- **trap-lane** (Greyhound Racing) — 5 concepts (A-E), 10 symbols each
- **oil-and-fire** (Geopolitical) — 5 concepts (A-E), 11 symbols each
- **beautiful-game** (Soccer) — 5 concepts (A-E), 11 symbols each

Each theme has 5 visual concepts. We install concept-A for each theme
as the active version. Concepts B-E are stored for future A/B selection.

The game now works like this:
1. Player opens game → Theme Selector screen
2. Player picks a theme → game loads with that theme's assets
3. Same math, same RTP — completely different visual experience

---

## STEP 0 — ORIENTATION & VERIFY SOURCE FILES

```bash
# Confirm theme ZIPs have been extracted to the right place
# These should already exist from the extract commands run before this prompt:
ls ~/math-sdk/frontend/public/assets/themes/source/theme-3-greyhounds/concept-A/symbols/ 2>/dev/null || \
  echo "SOURCE NOT FOUND — check extraction path"

ls ~/math-sdk/frontend/public/assets/themes/source/theme-4-geopolitical/concept-A/symbols/ 2>/dev/null || \
  echo "SOURCE NOT FOUND — check extraction path"

ls ~/math-sdk/frontend/public/assets/themes/source/theme-5-soccer/concept-A/symbols/ 2>/dev/null || \
  echo "SOURCE NOT FOUND — check extraction path"

# Also check current themes structure
ls ~/math-sdk/frontend/public/assets/themes/ 2>/dev/null

# Read current themes.ts config
cat ~/math-sdk/frontend/src/lib/config/themes.ts 2>/dev/null || echo "themes.ts not yet created"

# TSC baseline
cd ~/math-sdk/frontend && npx tsc --noEmit 2>&1
```

**If source files are not found at the path above, search for them:**
```bash
find ~/Downloads -name "t3a_h1*" 2>/dev/null | head -5
find ~/math-sdk -name "t3a_h1*" 2>/dev/null | head -5
```

Report exact paths found before continuing.

---

## TASK 1 — Create destination theme folder structure

Create the standardised theme asset directories:

```bash
# Create all theme directories with standard structure
for theme in trap-lane oil-and-fire beautiful-game; do
  mkdir -p ~/math-sdk/frontend/public/assets/themes/$theme/symbols
  mkdir -p ~/math-sdk/frontend/public/assets/themes/$theme/backgrounds
  mkdir -p ~/math-sdk/frontend/public/assets/themes/$theme/frames
  mkdir -p ~/math-sdk/frontend/public/assets/themes/$theme/ui
  mkdir -p ~/math-sdk/frontend/public/assets/themes/$theme/sounds
  # Store all 5 concepts for future use
  for concept in concept-A concept-B concept-C concept-D concept-E; do
    mkdir -p ~/math-sdk/frontend/public/assets/themes/$theme/concepts/$concept/symbols
    mkdir -p ~/math-sdk/frontend/public/assets/themes/$theme/concepts/$concept/backgrounds
    mkdir -p ~/math-sdk/frontend/public/assets/themes/$theme/concepts/$concept/frames
    mkdir -p ~/math-sdk/frontend/public/assets/themes/$theme/concepts/$concept/ui
  done
done

echo "Directory structure created"
ls ~/math-sdk/frontend/public/assets/themes/
```

Commit:
```bash
cd ~/math-sdk && git add -A
git commit -m "feat(themes): create theme directory structure for 3 new themes"
git push origin main
```

---

## TASK 2 — Install Greyhound (trap-lane) assets

The source files use naming convention: `t3[concept]_[symbol].png`
e.g. `t3a_h1_greyhound_champion.png`, `t3a_scatter.png`, `t3a_wild.png`

The destination uses standard names: `h1.png`, `h2.png`, `m1.png` etc.

**Determine the source base path first** by running:
```bash
find ~/Downloads ~/math-sdk -name "t3a_scatter.png" 2>/dev/null | head -3
```
Use whatever path is found as SOURCE_BASE.

**Install concept-A as the active theme (standard filenames):**
```bash
SRC="[SOURCE_BASE]/theme-3-greyhounds"

# Active symbols (concept-A → standard names)
cp "$SRC/concept-A/symbols/t3a_h1_greyhound_champion.png" \
   ~/math-sdk/frontend/public/assets/themes/trap-lane/symbols/h1.png
cp "$SRC/concept-A/symbols/t3a_h2_trainer.png" \
   ~/math-sdk/frontend/public/assets/themes/trap-lane/symbols/h2.png
cp "$SRC/concept-A/symbols/t3a_m1_starting_trap.png" \
   ~/math-sdk/frontend/public/assets/themes/trap-lane/symbols/m1.png
cp "$SRC/concept-A/symbols/t3a_m2_trophy.png" \
   ~/math-sdk/frontend/public/assets/themes/trap-lane/symbols/m2.png
cp "$SRC/concept-A/symbols/t3a_m3_race_card.png" \
   ~/math-sdk/frontend/public/assets/themes/trap-lane/symbols/m3.png
cp "$SRC/concept-A/symbols/t3a_l1_stopwatch.png" \
   ~/math-sdk/frontend/public/assets/themes/trap-lane/symbols/l1.png
cp "$SRC/concept-A/symbols/t3a_l2_betting_ticket.png" \
   ~/math-sdk/frontend/public/assets/themes/trap-lane/symbols/l2.png
cp "$SRC/concept-A/symbols/t3a_l3_lure.png" \
   ~/math-sdk/frontend/public/assets/themes/trap-lane/symbols/l3.png
cp "$SRC/concept-A/symbols/t3a_wild.png" \
   ~/math-sdk/frontend/public/assets/themes/trap-lane/symbols/wild.png
cp "$SRC/concept-A/symbols/t3a_scatter.png" \
   ~/math-sdk/frontend/public/assets/themes/trap-lane/symbols/scatter.png

# Active backgrounds (use first one as default)
cp "$SRC/concept-A/backgrounds/"*.jpg \
   ~/math-sdk/frontend/public/assets/themes/trap-lane/backgrounds/
# Rename to standard names
cd ~/math-sdk/frontend/public/assets/themes/trap-lane/backgrounds/
files=(*.jpg)
[ -f "${files[0]}" ] && mv "${files[0]}" bg-1.jpg
[ -f "${files[1]}" ] && mv "${files[1]}" bg-2.jpg
[ -f "${files[2]}" ] && mv "${files[2]}" bg-3.jpg
cd ~/math-sdk/frontend

# Active frames
cp "$SRC/concept-A/frames/t3a_frame_ornate.png" \
   ~/math-sdk/frontend/public/assets/themes/trap-lane/frames/frame-1.png
cp "$SRC/concept-A/frames/t3a_frame_minimal.png" \
   ~/math-sdk/frontend/public/assets/themes/trap-lane/frames/frame-2.png

# Active UI
cp "$SRC/concept-A/ui/t3a_logo.png" \
   ~/math-sdk/frontend/public/assets/themes/trap-lane/ui/logo.png
cp "$SRC/concept-A/ui/t3a_spin_btn.png" \
   ~/math-sdk/frontend/public/assets/themes/trap-lane/ui/spin_button.png
cp "$SRC/concept-A/ui/t3a_balance_display.png" \
   ~/math-sdk/frontend/public/assets/themes/trap-lane/ui/panel_balance.png
cp "$SRC/concept-A/ui/t3a_win_display.png" \
   ~/math-sdk/frontend/public/assets/themes/trap-lane/ui/panel_win.png
cp "$SRC/concept-A/ui/t3a_bet_btn.png" \
   ~/math-sdk/frontend/public/assets/themes/trap-lane/ui/btn_bet_minus.png
cp "$SRC/concept-A/ui/t3a_bet_btn.png" \
   ~/math-sdk/frontend/public/assets/themes/trap-lane/ui/btn_bet_plus.png
cp "$SRC/concept-A/ui/t3a_info_btn.png" \
   ~/math-sdk/frontend/public/assets/themes/trap-lane/ui/btn_menu.png

# Audio (theme-level, not concept-specific)
cp "$SRC/audio/t3a_bg_music.mp3" \
   ~/math-sdk/frontend/public/assets/themes/trap-lane/sounds/bgm_loop.mp3
cp "$SRC/audio/t3_spin_click.mp3" \
   ~/math-sdk/frontend/public/assets/themes/trap-lane/sounds/spin.mp3
cp "$SRC/audio/t3_win_jingle_small.mp3" \
   ~/math-sdk/frontend/public/assets/themes/trap-lane/sounds/win_small.mp3
cp "$SRC/audio/t3_win_jingle_big.mp3" \
   ~/math-sdk/frontend/public/assets/themes/trap-lane/sounds/win_big.mp3
cp "$SRC/audio/t3_bonus_fanfare.mp3" \
   ~/math-sdk/frontend/public/assets/themes/trap-lane/sounds/win_epic.mp3
cp "$SRC/audio/t3_scatter_trigger.mp3" \
   ~/math-sdk/frontend/public/assets/themes/trap-lane/sounds/scatter_land.mp3
cp "$SRC/audio/t3_crowd_ambience.mp3" \
   ~/math-sdk/frontend/public/assets/themes/trap-lane/sounds/bgm_tension.mp3
# Use the trap bell as reel stop sound
cp "$SRC/audio/t3_race_start_bell.mp3" \
   ~/math-sdk/frontend/public/assets/themes/trap-lane/sounds/reel_stop.mp3

# Copy remaining sounds from Future Spinner as fallbacks for missing files
for sound in reel_stop_anticipation win_medium anticipation_build ui_click; do
  cp ~/math-sdk/frontend/public/assets/sounds/${sound}.mp3 \
     ~/math-sdk/frontend/public/assets/themes/trap-lane/sounds/${sound}.mp3 2>/dev/null || true
done

# Store ALL 5 concepts for future use
for concept in concept-A concept-B concept-C concept-D concept-E; do
  letter=$(echo $concept | sed 's/concept-//' | tr '[:upper:]' '[:lower:]')
  cp "$SRC/$concept/symbols/"* \
     ~/math-sdk/frontend/public/assets/themes/trap-lane/concepts/$concept/symbols/ 2>/dev/null || true
  cp "$SRC/$concept/backgrounds/"* \
     ~/math-sdk/frontend/public/assets/themes/trap-lane/concepts/$concept/backgrounds/ 2>/dev/null || true
  cp "$SRC/$concept/frames/"* \
     ~/math-sdk/frontend/public/assets/themes/trap-lane/concepts/$concept/frames/ 2>/dev/null || true
  cp "$SRC/$concept/ui/"* \
     ~/math-sdk/frontend/public/assets/themes/trap-lane/concepts/$concept/ui/ 2>/dev/null || true
done
```

**Verify install:**
```bash
echo "=== trap-lane symbols ===" && ls ~/math-sdk/frontend/public/assets/themes/trap-lane/symbols/
echo "=== trap-lane sounds ===" && ls ~/math-sdk/frontend/public/assets/themes/trap-lane/sounds/
echo "=== trap-lane ui ===" && ls ~/math-sdk/frontend/public/assets/themes/trap-lane/ui/
```

Commit:
```bash
cd ~/math-sdk && git add public/assets/themes/trap-lane/
git commit -m "feat(assets): install trap-lane (greyhound) theme concept-A + all 5 concepts"
git push origin main
```

---

## TASK 3 — Install Geopolitical (oil-and-fire) assets

The source files use naming: `t4[concept]_h1.png`, `t4[concept]_h2.png` etc.
Note: Geopolitical has 11 symbols including h3. The game engine uses
H1/H2/M1/M2/M3/L1/L2/L3/W/S (10). Map h3 → m1 and shift others down.

**Find source:**
```bash
find ~/Downloads ~/math-sdk -name "t4a_h1.png" 2>/dev/null | head -3
```

**Install concept-A:**
```bash
SRC="[SOURCE_BASE]/theme-4-geopolitical"

# Symbol mapping (11 source → 10 game slots, h3 becomes m1, shift m1→m2, m2→m3, m3 dropped or use as l1)
cp "$SRC/concept-A/symbols/t4a_h1.png" \
   ~/math-sdk/frontend/public/assets/themes/oil-and-fire/symbols/h1.png
cp "$SRC/concept-A/symbols/t4a_h2.png" \
   ~/math-sdk/frontend/public/assets/themes/oil-and-fire/symbols/h2.png
cp "$SRC/concept-A/symbols/t4a_h3.png" \
   ~/math-sdk/frontend/public/assets/themes/oil-and-fire/symbols/m1.png
cp "$SRC/concept-A/symbols/t4a_m1.png" \
   ~/math-sdk/frontend/public/assets/themes/oil-and-fire/symbols/m2.png
cp "$SRC/concept-A/symbols/t4a_m2.png" \
   ~/math-sdk/frontend/public/assets/themes/oil-and-fire/symbols/m3.png
cp "$SRC/concept-A/symbols/t4a_m3.png" \
   ~/math-sdk/frontend/public/assets/themes/oil-and-fire/symbols/l1.png
cp "$SRC/concept-A/symbols/t4a_l1.png" \
   ~/math-sdk/frontend/public/assets/themes/oil-and-fire/symbols/l2.png
cp "$SRC/concept-A/symbols/t4a_l2.png" \
   ~/math-sdk/frontend/public/assets/themes/oil-and-fire/symbols/l3.png
cp "$SRC/concept-A/symbols/t4a_wild.png" \
   ~/math-sdk/frontend/public/assets/themes/oil-and-fire/symbols/wild.png
cp "$SRC/concept-A/symbols/t4a_scatter.png" \
   ~/math-sdk/frontend/public/assets/themes/oil-and-fire/symbols/scatter.png

# Backgrounds
cp "$SRC/concept-A/backgrounds/"*.jpg \
   ~/math-sdk/frontend/public/assets/themes/oil-and-fire/backgrounds/
cd ~/math-sdk/frontend/public/assets/themes/oil-and-fire/backgrounds/
files=(*.jpg); [ -f "${files[0]}" ] && mv "${files[0]}" bg-1.jpg
[ -f "${files[1]}" ] && mv "${files[1]}" bg-2.jpg
[ -f "${files[2]}" ] && mv "${files[2]}" bg-3.jpg
cd ~/math-sdk/frontend

# Frames
cp "$SRC/concept-A/frames/t4a_frame_ornate.png" \
   ~/math-sdk/frontend/public/assets/themes/oil-and-fire/frames/frame-1.png
cp "$SRC/concept-A/frames/t4a_frame_minimal.png" \
   ~/math-sdk/frontend/public/assets/themes/oil-and-fire/frames/frame-2.png

# UI
cp "$SRC/concept-A/ui/t4a_logo.png" \
   ~/math-sdk/frontend/public/assets/themes/oil-and-fire/ui/logo.png
cp "$SRC/concept-A/ui/t4a_spin_btn.png" \
   ~/math-sdk/frontend/public/assets/themes/oil-and-fire/ui/spin_button.png
cp "$SRC/concept-A/ui/t4a_balance_display.png" \
   ~/math-sdk/frontend/public/assets/themes/oil-and-fire/ui/panel_balance.png
cp "$SRC/concept-A/ui/t4a_win_display.png" \
   ~/math-sdk/frontend/public/assets/themes/oil-and-fire/ui/panel_win.png
cp "$SRC/concept-A/ui/t4a_bet_btn.png" \
   ~/math-sdk/frontend/public/assets/themes/oil-and-fire/ui/btn_bet_minus.png
cp "$SRC/concept-A/ui/t4a_bet_btn.png" \
   ~/math-sdk/frontend/public/assets/themes/oil-and-fire/ui/btn_bet_plus.png
cp "$SRC/concept-A/ui/t4a_info_btn.png" \
   ~/math-sdk/frontend/public/assets/themes/oil-and-fire/ui/btn_menu.png

# Audio
cp "$SRC/audio/t4a_bg_music.mp3" \
   ~/math-sdk/frontend/public/assets/themes/oil-and-fire/sounds/bgm_loop.mp3
cp "$SRC/audio/t4_spin_click.mp3" \
   ~/math-sdk/frontend/public/assets/themes/oil-and-fire/sounds/spin.mp3
cp "$SRC/audio/t4_win_jingle_small.mp3" \
   ~/math-sdk/frontend/public/assets/themes/oil-and-fire/sounds/win_small.mp3
cp "$SRC/audio/t4_win_jingle_big.mp3" \
   ~/math-sdk/frontend/public/assets/themes/oil-and-fire/sounds/win_big.mp3
cp "$SRC/audio/t4_bonus_fanfare.mp3" \
   ~/math-sdk/frontend/public/assets/themes/oil-and-fire/sounds/win_epic.mp3
cp "$SRC/audio/t4_scatter_trigger.mp3" \
   ~/math-sdk/frontend/public/assets/themes/oil-and-fire/sounds/scatter_land.mp3
cp "$SRC/audio/t4_tension_sting.mp3" \
   ~/math-sdk/frontend/public/assets/themes/oil-and-fire/sounds/bgm_tension.mp3
cp "$SRC/audio/t4_diplomatic_ambience.mp3" \
   ~/math-sdk/frontend/public/assets/themes/oil-and-fire/sounds/reel_stop.mp3 2>/dev/null || \
   cp ~/math-sdk/frontend/public/assets/sounds/reel_stop.mp3 \
      ~/math-sdk/frontend/public/assets/themes/oil-and-fire/sounds/reel_stop.mp3

# Fallbacks for missing sounds
for sound in reel_stop_anticipation win_medium anticipation_build ui_click; do
  cp ~/math-sdk/frontend/public/assets/sounds/${sound}.mp3 \
     ~/math-sdk/frontend/public/assets/themes/oil-and-fire/sounds/${sound}.mp3 2>/dev/null || true
done

# Store all 5 concepts
for concept in concept-A concept-B concept-C concept-D concept-E; do
  cp "$SRC/$concept/symbols/"* \
     ~/math-sdk/frontend/public/assets/themes/oil-and-fire/concepts/$concept/symbols/ 2>/dev/null || true
  cp "$SRC/$concept/backgrounds/"* \
     ~/math-sdk/frontend/public/assets/themes/oil-and-fire/concepts/$concept/backgrounds/ 2>/dev/null || true
  cp "$SRC/$concept/frames/"* \
     ~/math-sdk/frontend/public/assets/themes/oil-and-fire/concepts/$concept/frames/ 2>/dev/null || true
  cp "$SRC/$concept/ui/"* \
     ~/math-sdk/frontend/public/assets/themes/oil-and-fire/concepts/$concept/ui/ 2>/dev/null || true
done
```

Verify and commit:
```bash
echo "=== oil-and-fire symbols ===" && ls ~/math-sdk/frontend/public/assets/themes/oil-and-fire/symbols/
cd ~/math-sdk && git add public/assets/themes/oil-and-fire/
git commit -m "feat(assets): install oil-and-fire (geopolitical) theme concept-A + all 5 concepts"
git push origin main
```

---

## TASK 4 — Install Soccer (beautiful-game) assets

Same structure as geopolitical — 11 symbols, same mapping strategy.
Source naming: `t5[concept]_h1.png` etc.

```bash
find ~/Downloads ~/math-sdk -name "t5a_h1.png" 2>/dev/null | head -3
```

```bash
SRC="[SOURCE_BASE]/theme-5-soccer"

# Symbols (11→10 mapping: h3→m1, shift others)
cp "$SRC/concept-A/symbols/t5a_h1.png" ~/math-sdk/frontend/public/assets/themes/beautiful-game/symbols/h1.png
cp "$SRC/concept-A/symbols/t5a_h2.png" ~/math-sdk/frontend/public/assets/themes/beautiful-game/symbols/h2.png
cp "$SRC/concept-A/symbols/t5a_h3.png" ~/math-sdk/frontend/public/assets/themes/beautiful-game/symbols/m1.png
cp "$SRC/concept-A/symbols/t5a_m1.png" ~/math-sdk/frontend/public/assets/themes/beautiful-game/symbols/m2.png
cp "$SRC/concept-A/symbols/t5a_m2.png" ~/math-sdk/frontend/public/assets/themes/beautiful-game/symbols/m3.png
cp "$SRC/concept-A/symbols/t5a_m3.png" ~/math-sdk/frontend/public/assets/themes/beautiful-game/symbols/l1.png
cp "$SRC/concept-A/symbols/t5a_l1.png" ~/math-sdk/frontend/public/assets/themes/beautiful-game/symbols/l2.png
cp "$SRC/concept-A/symbols/t5a_l2.png" ~/math-sdk/frontend/public/assets/themes/beautiful-game/symbols/l3.png
cp "$SRC/concept-A/symbols/t5a_wild.png" ~/math-sdk/frontend/public/assets/themes/beautiful-game/symbols/wild.png
cp "$SRC/concept-A/symbols/t5a_scatter.png" ~/math-sdk/frontend/public/assets/themes/beautiful-game/symbols/scatter.png

# Backgrounds
cp "$SRC/concept-A/backgrounds/"*.jpg ~/math-sdk/frontend/public/assets/themes/beautiful-game/backgrounds/
cd ~/math-sdk/frontend/public/assets/themes/beautiful-game/backgrounds/
files=(*.jpg); [ -f "${files[0]}" ] && mv "${files[0]}" bg-1.jpg
[ -f "${files[1]}" ] && mv "${files[1]}" bg-2.jpg
[ -f "${files[2]}" ] && mv "${files[2]}" bg-3.jpg
cd ~/math-sdk/frontend

# Frames
cp "$SRC/concept-A/frames/t5a_frame_ornate.png" ~/math-sdk/frontend/public/assets/themes/beautiful-game/frames/frame-1.png
cp "$SRC/concept-A/frames/t5a_frame_minimal.png" ~/math-sdk/frontend/public/assets/themes/beautiful-game/frames/frame-2.png

# UI
cp "$SRC/concept-A/ui/t5a_logo.png"             ~/math-sdk/frontend/public/assets/themes/beautiful-game/ui/logo.png
cp "$SRC/concept-A/ui/t5a_spin_btn.png"         ~/math-sdk/frontend/public/assets/themes/beautiful-game/ui/spin_button.png
cp "$SRC/concept-A/ui/t5a_balance_display.png"  ~/math-sdk/frontend/public/assets/themes/beautiful-game/ui/panel_balance.png
cp "$SRC/concept-A/ui/t5a_win_display.png"      ~/math-sdk/frontend/public/assets/themes/beautiful-game/ui/panel_win.png
cp "$SRC/concept-A/ui/t5a_bet_btn.png"          ~/math-sdk/frontend/public/assets/themes/beautiful-game/ui/btn_bet_minus.png
cp "$SRC/concept-A/ui/t5a_bet_btn.png"          ~/math-sdk/frontend/public/assets/themes/beautiful-game/ui/btn_bet_plus.png
cp "$SRC/concept-A/ui/t5a_info_btn.png"         ~/math-sdk/frontend/public/assets/themes/beautiful-game/ui/btn_menu.png

# Audio — map soccer sounds to standard slots
cp "$SRC/audio/t5a_bg_music.mp3"      ~/math-sdk/frontend/public/assets/themes/beautiful-game/sounds/bgm_loop.mp3
cp "$SRC/audio/t5_spin_click.mp3"     ~/math-sdk/frontend/public/assets/themes/beautiful-game/sounds/spin.mp3
cp "$SRC/audio/t5_referee_whistle.mp3" ~/math-sdk/frontend/public/assets/themes/beautiful-game/sounds/reel_stop.mp3
cp "$SRC/audio/t5_win_jingle_small.mp3" ~/math-sdk/frontend/public/assets/themes/beautiful-game/sounds/win_small.mp3
cp "$SRC/audio/t5_win_jingle_big.mp3"  ~/math-sdk/frontend/public/assets/themes/beautiful-game/sounds/win_big.mp3
cp "$SRC/audio/t5_bonus_fanfare.mp3"   ~/math-sdk/frontend/public/assets/themes/beautiful-game/sounds/win_epic.mp3
cp "$SRC/audio/t5_scatter_trigger.mp3" ~/math-sdk/frontend/public/assets/themes/beautiful-game/sounds/scatter_land.mp3
cp "$SRC/audio/t5_crowd_roar.mp3"      ~/math-sdk/frontend/public/assets/themes/beautiful-game/sounds/bgm_tension.mp3
cp "$SRC/audio/t5_goal_horn.mp3"       ~/math-sdk/frontend/public/assets/themes/beautiful-game/sounds/anticipation_build.mp3

# Fallbacks
for sound in reel_stop_anticipation win_medium ui_click; do
  cp ~/math-sdk/frontend/public/assets/sounds/${sound}.mp3 \
     ~/math-sdk/frontend/public/assets/themes/beautiful-game/sounds/${sound}.mp3 2>/dev/null || true
done

# Store all 5 concepts
for concept in concept-A concept-B concept-C concept-D concept-E; do
  cp "$SRC/$concept/symbols/"* ~/math-sdk/frontend/public/assets/themes/beautiful-game/concepts/$concept/symbols/ 2>/dev/null || true
  cp "$SRC/$concept/backgrounds/"* ~/math-sdk/frontend/public/assets/themes/beautiful-game/concepts/$concept/backgrounds/ 2>/dev/null || true
  cp "$SRC/$concept/frames/"* ~/math-sdk/frontend/public/assets/themes/beautiful-game/concepts/$concept/frames/ 2>/dev/null || true
  cp "$SRC/$concept/ui/"* ~/math-sdk/frontend/public/assets/themes/beautiful-game/concepts/$concept/ui/ 2>/dev/null || true
done
```

Verify and commit:
```bash
echo "=== beautiful-game symbols ===" && ls ~/math-sdk/frontend/public/assets/themes/beautiful-game/symbols/
cd ~/math-sdk && git add public/assets/themes/beautiful-game/
git commit -m "feat(assets): install beautiful-game (soccer) theme concept-A + all 5 concepts"
git push origin main
```

---

## TASK 5 — Migrate future-spinner assets to themes/ folder

The existing Future Spinner assets need to move into the same
standardised themes/ folder so the theme system can reference them.

```bash
# Create future-spinner theme folder
mkdir -p ~/math-sdk/frontend/public/assets/themes/future-spinner/symbols
mkdir -p ~/math-sdk/frontend/public/assets/themes/future-spinner/backgrounds
mkdir -p ~/math-sdk/frontend/public/assets/themes/future-spinner/frames
mkdir -p ~/math-sdk/frontend/public/assets/themes/future-spinner/ui
mkdir -p ~/math-sdk/frontend/public/assets/themes/future-spinner/sounds

# Copy symbols with standardised names
cp ~/math-sdk/frontend/public/assets/symbols/h1_futuristic_rim_variant_02.png \
   ~/math-sdk/frontend/public/assets/themes/future-spinner/symbols/h1.png
cp ~/math-sdk/frontend/public/assets/symbols/h2_neon_turbocharger_variant_01.png \
   ~/math-sdk/frontend/public/assets/themes/future-spinner/symbols/h2.png
cp ~/math-sdk/frontend/public/assets/symbols/m1_holographic_grille_variant_09_original.png \
   ~/math-sdk/frontend/public/assets/themes/future-spinner/symbols/m1.png
cp ~/math-sdk/frontend/public/assets/symbols/m2_glowing_exhaust_variant_01.png \
   ~/math-sdk/frontend/public/assets/themes/future-spinner/symbols/m2.png
cp ~/math-sdk/frontend/public/assets/symbols/m3_holographic_steering_wheel_variant_03.png \
   ~/math-sdk/frontend/public/assets/themes/future-spinner/symbols/m3.png
cp ~/math-sdk/frontend/public/assets/symbols/l1_chrome_lug_nut_variant_05.png \
   ~/math-sdk/frontend/public/assets/themes/future-spinner/symbols/l1.png
cp ~/math-sdk/frontend/public/assets/symbols/l2_chrome_spark_plug_variant_05.png \
   ~/math-sdk/frontend/public/assets/themes/future-spinner/symbols/l2.png
cp ~/math-sdk/frontend/public/assets/symbols/l3_neon_piston_variant_08.png \
   ~/math-sdk/frontend/public/assets/themes/future-spinner/symbols/l3.png
cp ~/math-sdk/frontend/public/assets/symbols/wild_cyberpunk_logo_variant_04.png \
   ~/math-sdk/frontend/public/assets/themes/future-spinner/symbols/wild.png
cp ~/math-sdk/frontend/public/assets/symbols/scatter_energy_burst_variant_01.png \
   ~/math-sdk/frontend/public/assets/themes/future-spinner/symbols/scatter.png

# Frames
cp ~/math-sdk/frontend/public/assets/frames/frame_clean_ornate.png \
   ~/math-sdk/frontend/public/assets/themes/future-spinner/frames/frame-1.png
cp ~/math-sdk/frontend/public/assets/frames/frame_clean_minimal.png \
   ~/math-sdk/frontend/public/assets/themes/future-spinner/frames/frame-2.png

# Background video (use as bg-1)
cp ~/math-sdk/frontend/public/assets/videos/bg_rain_street_v2.mp4 \
   ~/math-sdk/frontend/public/assets/themes/future-spinner/backgrounds/bg-1.mp4

# UI
cp ~/math-sdk/frontend/public/assets/ui/logo_future_spinner.png \
   ~/math-sdk/frontend/public/assets/themes/future-spinner/ui/logo.png
cp ~/math-sdk/frontend/public/assets/ui/logo_we_roll_spinners.png \
   ~/math-sdk/frontend/public/assets/themes/future-spinner/ui/subtitle.png
cp ~/math-sdk/frontend/public/assets/ui/spin_button.png \
   ~/math-sdk/frontend/public/assets/themes/future-spinner/ui/spin_button.png
cp ~/math-sdk/frontend/public/assets/ui/panel_balance.png \
   ~/math-sdk/frontend/public/assets/themes/future-spinner/ui/panel_balance.png
cp ~/math-sdk/frontend/public/assets/ui/panel_win.png \
   ~/math-sdk/frontend/public/assets/themes/future-spinner/ui/panel_win.png
cp ~/math-sdk/frontend/public/assets/ui/btn_bet_minus_v2.png \
   ~/math-sdk/frontend/public/assets/themes/future-spinner/ui/btn_bet_minus.png
cp ~/math-sdk/frontend/public/assets/ui/btn_bet_plus_v2.png \
   ~/math-sdk/frontend/public/assets/themes/future-spinner/ui/btn_bet_plus.png
cp ~/math-sdk/frontend/public/assets/ui/btn_menu.png \
   ~/math-sdk/frontend/public/assets/themes/future-spinner/ui/btn_menu.png

# Sounds — copy all R5 sounds
cp ~/math-sdk/frontend/public/assets/sounds/*.mp3 \
   ~/math-sdk/frontend/public/assets/themes/future-spinner/sounds/
```

Commit:
```bash
cd ~/math-sdk && git add public/assets/themes/future-spinner/
git commit -m "feat(assets): migrate future-spinner assets into themes/ folder structure"
git push origin main
```

---

## TASK 6 — Create/update themes.ts config

Create or overwrite `src/lib/config/themes.ts` with all 4 active themes:

```typescript
// src/lib/config/themes.ts
// Theme registry — We Roll Spinners multi-theme system
// Adding a new theme: add entry here + drop assets in themes/[id]/ folder

export interface ThemeConfig {
  id: string
  name: string
  subtitle: string
  description: string
  palette: {
    primary: string
    secondary: string
    background: string
    text: string
  }
  assetBase: string
  videoBackground: boolean   // true = .mp4, false = .jpg
  available: boolean
  comingSoon?: boolean
}

export const THEMES: ThemeConfig[] = [
  {
    id: 'future-spinner',
    name: 'FUTURE SPINNER',
    subtitle: 'WE ROLL SPINNERS',
    description: 'Cyberpunk spinners in a rain-soaked neon megacity. High-octane automotive chaos.',
    palette: {
      primary:    '#00FFFF',
      secondary:  '#FF00FF',
      background: '#0a0a1a',
      text:       '#ffffff',
    },
    assetBase: 'assets/themes/future-spinner',
    videoBackground: true,
    available: true,
  },
  {
    id: 'trap-lane',
    name: 'TRAP LANE',
    subtitle: 'WE ROLL SPINNERS',
    description: 'Six greyhounds. One winner. The fastest sport on four legs. Your bet, your call.',
    palette: {
      primary:    '#39FF14',
      secondary:  '#FF6600',
      background: '#0a1a0a',
      text:       '#FFFDD0',
    },
    assetBase: 'assets/themes/trap-lane',
    videoBackground: false,
    available: true,
  },
  {
    id: 'oil-and-fire',
    name: 'OIL & FIRE',
    subtitle: 'WE ROLL SPINNERS',
    description: 'Black gold and global power. The world runs on who controls the straits.',
    palette: {
      primary:    '#FF6600',
      secondary:  '#C19A6B',
      background: '#1A0A00',
      text:       '#F5F5DC',
    },
    assetBase: 'assets/themes/oil-and-fire',
    videoBackground: false,
    available: true,
  },
  {
    id: 'beautiful-game',
    name: 'BEAUTIFUL GAME',
    subtitle: 'WE ROLL SPINNERS',
    description: 'Ninety minutes. One ball. The world\'s game on the biggest stage.',
    palette: {
      primary:    '#228B22',
      secondary:  '#FFD700',
      background: '#0a1a0a',
      text:       '#ffffff',
    },
    assetBase: 'assets/themes/beautiful-game',
    videoBackground: false,
    available: true,
  },
  {
    id: 'valhalla-rising',
    name: 'VALHALLA RISING',
    subtitle: 'WE ROLL SPINNERS',
    description: 'Norse gods and Viking warriors battle for glory. Enter the realm of Odin.',
    palette: {
      primary:    '#FFD700',
      secondary:  '#8B0000',
      background: '#1a0a0a',
      text:       '#F5F5DC',
    },
    assetBase: 'assets/themes/valhalla-rising',
    videoBackground: false,
    available: false,
    comingSoon: true,
  },
  {
    id: 'apex-racing',
    name: 'APEX RACING',
    subtitle: 'WE ROLL SPINNERS',
    description: 'The fastest machines on earth. Championship glory at 300km/h.',
    palette: {
      primary:    '#FF0000',
      secondary:  '#FFD700',
      background: '#0a0a0a',
      text:       '#ffffff',
    },
    assetBase: 'assets/themes/apex-racing',
    videoBackground: false,
    available: false,
    comingSoon: true,
  },
]

export const DEFAULT_THEME_ID = 'future-spinner'

export function getTheme(id: string): ThemeConfig {
  return THEMES.find(t => t.id === id) ?? THEMES[0]
}

export function getActiveTheme(): ThemeConfig {
  const saved = typeof localStorage !== 'undefined'
    ? localStorage.getItem('wrs_theme') ?? DEFAULT_THEME_ID
    : DEFAULT_THEME_ID
  return getTheme(saved)
}

export function saveTheme(id: string): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('wrs_theme', id)
  }
}
```

Commit:
```bash
cd ~/math-sdk && git add frontend/src/lib/config/themes.ts
git commit -m "feat(themes): register 4 active themes + 2 coming soon in themes.ts"
git push origin main
```

---

## TASK 7 — Create themeStore.ts

Create `src/lib/stores/themeStore.ts`:

```typescript
// themeStore.ts — Reactive theme state for We Roll Spinners

import { writable, derived } from 'svelte/store'
import {
  type ThemeConfig,
  getActiveTheme,
  saveTheme,
  getTheme,
  THEMES,
} from '../config/themes'

export const activeTheme = writable<ThemeConfig>(getActiveTheme())

// Derived asset paths — always points to the active theme's assets
export const themeAssets = derived(activeTheme, ($t) => ({
  symbols: {
    H1: `${$t.assetBase}/symbols/h1.png`,
    H2: `${$t.assetBase}/symbols/h2.png`,
    M1: `${$t.assetBase}/symbols/m1.png`,
    M2: `${$t.assetBase}/symbols/m2.png`,
    M3: `${$t.assetBase}/symbols/m3.png`,
    L1: `${$t.assetBase}/symbols/l1.png`,
    L2: `${$t.assetBase}/symbols/l2.png`,
    L3: `${$t.assetBase}/symbols/l3.png`,
    W:  `${$t.assetBase}/symbols/wild.png`,
    S:  `${$t.assetBase}/symbols/scatter.png`,
  },
  background:   `${$t.assetBase}/backgrounds/bg-1.${$t.videoBackground ? 'mp4' : 'jpg'}`,
  frame:        `${$t.assetBase}/frames/frame-1.png`,
  spinButton:   `${$t.assetBase}/ui/spin_button.png`,
  panelBalance: `${$t.assetBase}/ui/panel_balance.png`,
  panelWin:     `${$t.assetBase}/ui/panel_win.png`,
  btnMinus:     `${$t.assetBase}/ui/btn_bet_minus.png`,
  btnPlus:      `${$t.assetBase}/ui/btn_bet_plus.png`,
  btnMenu:      `${$t.assetBase}/ui/btn_menu.png`,
  logo:         `${$t.assetBase}/ui/logo.png`,
  sounds: {
    bgm:                  `${$t.assetBase}/sounds/bgm_loop.mp3`,
    bgmTension:           `${$t.assetBase}/sounds/bgm_tension.mp3`,
    spin:                 `${$t.assetBase}/sounds/spin.mp3`,
    reelStop:             `${$t.assetBase}/sounds/reel_stop.mp3`,
    reelStopAnticipation: `${$t.assetBase}/sounds/reel_stop_anticipation.mp3`,
    winSmall:             `${$t.assetBase}/sounds/win_small.mp3`,
    winMedium:            `${$t.assetBase}/sounds/win_medium.mp3`,
    winBig:               `${$t.assetBase}/sounds/win_big.mp3`,
    winEpic:              `${$t.assetBase}/sounds/win_epic.mp3`,
    scatterLand:          `${$t.assetBase}/sounds/scatter_land.mp3`,
    anticipationBuild:    `${$t.assetBase}/sounds/anticipation_build.mp3`,
    uiClick:              `${$t.assetBase}/sounds/ui_click.mp3`,
  },
}))

export const themePalette = derived(activeTheme, ($t) => $t.palette)

export function switchTheme(id: string): void {
  saveTheme(id)
  activeTheme.set(getTheme(id))
}

export { THEMES }
```

Commit:
```bash
cd ~/math-sdk && git add frontend/src/lib/stores/themeStore.ts
git commit -m "feat(themes): themeStore with derived asset paths for all themes"
git push origin main
```

---

## TASK 8 — Create ThemeSelector.svelte component

Create `src/lib/components/ThemeSelector.svelte`:

```svelte
<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { THEMES, type ThemeConfig } from '../config/themes'
  import { activeTheme, switchTheme } from '../stores/themeStore'

  const dispatch = createEventDispatcher<{ select: string; close: void }>()
  let selected = $activeTheme.id

  function handleSelect(theme: ThemeConfig): void {
    if (!theme.available) return
    selected = theme.id
  }

  function handleConfirm(): void {
    switchTheme(selected)
    dispatch('select', selected)
    // Full reload to reinitialise all assets cleanly
    setTimeout(() => window.location.reload(), 100)
  }
</script>

<div class="overlay" role="dialog" aria-modal="true" aria-label="Select game theme">
  <div class="panel">

    <header>
      <h2 class="title">SELECT THEME</h2>
      <p class="sub">Same game. New world.</p>
    </header>

    <div class="grid">
      {#each THEMES as theme}
        <button
          class="card"
          class:active={selected === theme.id}
          class:locked={!theme.available}
          on:click={() => handleSelect(theme)}
          disabled={!theme.available}
          style="--p: {theme.palette.primary}; --s: {theme.palette.secondary}; --bg: {theme.palette.background}"
        >
          <div class="card-img">
            <img
              src="{theme.assetBase}/backgrounds/bg-1.jpg"
              alt="{theme.name}"
              on:error={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
            />
            <div class="card-gradient"></div>
            {#if theme.comingSoon}
              <span class="badge">COMING SOON</span>
            {/if}
            {#if selected === theme.id}
              <span class="check">✓</span>
            {/if}
          </div>
          <div class="card-body">
            <h3 class="card-name" style="color: {theme.palette.primary}">{theme.name}</h3>
            <p class="card-desc">{theme.description}</p>
          </div>
        </button>
      {/each}
    </div>

    <footer>
      <button class="btn-cancel" on:click={() => dispatch('close')}>BACK</button>
      <button class="btn-confirm"
        style="--p: {THEMES.find(t=>t.id===selected)?.palette.primary ?? '#00ffff'}"
        on:click={handleConfirm}>
        PLAY THIS THEME
      </button>
    </footer>

  </div>
</div>

<style>
  .overlay {
    position: fixed; inset: 0; z-index: 1000;
    background: rgba(0,0,0,0.92);
    display: flex; align-items: center; justify-content: center;
    backdrop-filter: blur(4px);
  }
  .panel {
    width: min(96vw, 920px); max-height: 92vh; overflow-y: auto;
    background: rgba(8,8,20,0.98);
    border: 1px solid rgba(0,255,255,0.25); border-radius: 16px;
    padding: 1.75rem;
    box-shadow: 0 0 60px rgba(0,255,255,0.08);
  }
  header { text-align: center; margin-bottom: 1.5rem; }
  .title {
    font-family: 'Courier New', monospace; font-size: clamp(1.2rem,3vw,2rem);
    font-weight: 900; letter-spacing: 0.3em;
    color: #00ffff; text-shadow: 0 0 20px rgba(0,255,255,0.5);
    margin: 0 0 0.3rem;
  }
  .sub {
    font-family: 'Courier New', monospace; font-size: 0.7rem;
    letter-spacing: 0.25em; color: rgba(255,255,255,0.4); margin: 0;
  }
  .grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(220px,1fr));
    gap: 0.9rem; margin-bottom: 1.5rem;
  }
  .card {
    background: rgba(10,10,20,0.8);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px; overflow: hidden;
    cursor: pointer; text-align: left; padding: 0;
    transition: all 0.2s ease;
  }
  .card:hover:not(:disabled) {
    border-color: var(--p);
    box-shadow: 0 0 18px color-mix(in srgb, var(--p) 35%, transparent);
    transform: translateY(-2px);
  }
  .card.active {
    border: 2px solid var(--p);
    box-shadow: 0 0 24px color-mix(in srgb, var(--p) 45%, transparent);
  }
  .card.locked { opacity: 0.35; cursor: not-allowed; }
  .card-img {
    position: relative; height: 130px; overflow: hidden;
    background: var(--bg);
  }
  .card-img img {
    position: absolute; inset: 0; width: 100%; height: 100%;
    object-fit: cover; opacity: 0.65;
  }
  .card-gradient {
    position: absolute; inset: 0;
    background: linear-gradient(to bottom, transparent 50%, rgba(8,8,20,0.9));
  }
  .badge {
    position: absolute; top: 8px; right: 8px;
    background: rgba(0,0,0,0.75); color: rgba(255,255,255,0.55);
    font-family: 'Courier New', monospace; font-size: 0.5rem;
    font-weight: 700; letter-spacing: 0.15em; padding: 3px 8px;
    border-radius: 4px; border: 1px solid rgba(255,255,255,0.15);
  }
  .check {
    position: absolute; top: 8px; left: 8px;
    width: 22px; height: 22px; border-radius: 50%;
    background: var(--p); color: #000;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.8rem; font-weight: 900;
  }
  .card-body { padding: 0.65rem; }
  .card-name {
    font-family: 'Courier New', monospace; font-size: 0.75rem;
    font-weight: 900; letter-spacing: 0.2em; margin: 0 0 0.35rem;
  }
  .card-desc {
    font-family: 'Courier New', monospace; font-size: 0.6rem;
    color: rgba(255,255,255,0.5); margin: 0; line-height: 1.5;
  }
  footer { display: flex; gap: 0.75rem; justify-content: flex-end; }
  .btn-cancel {
    background: transparent; border: 1px solid rgba(255,255,255,0.15);
    color: rgba(255,255,255,0.45); padding: 0.7rem 1.5rem;
    border-radius: 8px; font-family: 'Courier New', monospace;
    font-size: 0.7rem; font-weight: 700; letter-spacing: 0.2em;
    cursor: pointer; transition: all 0.15s;
  }
  .btn-cancel:hover { border-color: rgba(255,255,255,0.35); color: rgba(255,255,255,0.75); }
  .btn-confirm {
    background: transparent; border: 2px solid var(--p);
    color: var(--p); padding: 0.7rem 2rem; border-radius: 8px;
    font-family: 'Courier New', monospace; font-size: 0.75rem;
    font-weight: 900; letter-spacing: 0.2em; cursor: pointer;
    box-shadow: 0 0 12px color-mix(in srgb, var(--p) 25%, transparent);
    transition: all 0.15s;
  }
  .btn-confirm:hover {
    background: color-mix(in srgb, var(--p) 12%, transparent);
    box-shadow: 0 0 28px color-mix(in srgb, var(--p) 45%, transparent);
  }
  @media (max-width: 560px) {
    .panel { padding: 1rem; }
    .grid { grid-template-columns: 1fr 1fr; gap: 0.6rem; }
    footer { flex-direction: column; }
    .btn-cancel, .btn-confirm { width: 100%; text-align: center; }
  }
</style>
```

Commit:
```bash
cd ~/math-sdk && git add frontend/src/lib/components/ThemeSelector.svelte
git commit -m "feat(themes): ThemeSelector component — 4 active themes with preview cards"
git push origin main
```

---

## TASK 9 — Wire theme system into App.svelte

Read `src/App.svelte` in full, then make these targeted changes:

**Add imports at the top of the script:**
```typescript
import { activeTheme, themeAssets } from './lib/stores/themeStore'
import ThemeSelector from './lib/components/ThemeSelector.svelte'
```

**Add state:**
```typescript
let showThemeSelector = false
```

**Update background video/image section.**
Find the `<video>` element. Update its source to use the theme store,
and handle both video (.mp4) and image (.jpg) backgrounds:

```svelte
<div class="bg-layer">
  {#if $activeTheme.videoBackground}
    <video class="bg-video" autoplay loop muted playsinline aria-hidden="true">
      <source src="{$themeAssets.background}" type="video/mp4" />
    </video>
  {:else}
    <img class="bg-video" src="{$themeAssets.background}" alt="" aria-hidden="true" />
  {/if}
  <div class="bg-overlay"></div>
</div>
```

**Update frame img src:**
```svelte
<img src="{$themeAssets.frame}" class="game-frame" alt="" aria-hidden="true" />
```

**Update logo:**
```svelte
<img src="{$themeAssets.logo}" class="game-logo" alt="{$activeTheme.name}" draggable="false" />
```

**Add THEME button** — find the utility button row in the control area
and add a theme selector button:
```svelte
<button class="theme-toggle-btn" on:click={() => showThemeSelector = true}
  aria-label="Change theme" title="Change theme">
  🎨
</button>
```

**Add ThemeSelector overlay** (just before closing tag of main wrapper):
```svelte
{#if showThemeSelector}
  <ThemeSelector on:close={() => showThemeSelector = false} />
{/if}
```

**Add CSS for bg-img fallback and theme button:**
```css
/* image background fallback for non-video themes */
.bg-video.bg-img-mode {
  object-fit: cover;
  opacity: 0.5;
}

.theme-toggle-btn {
  background: rgba(0,0,0,0.4);
  border: 1px solid rgba(0,255,255,0.2);
  border-radius: 50%;
  width: 36px; height: 36px;
  cursor: pointer; font-size: 1rem;
  display: flex; align-items: center; justify-content: center;
  transition: border-color 0.15s, filter 0.15s;
}
.theme-toggle-btn:hover {
  border-color: rgba(0,255,255,0.6);
  filter: drop-shadow(0 0 6px rgba(0,255,255,0.4));
}
```

Commit:
```bash
cd ~/math-sdk && git add frontend/src/App.svelte
git commit -m "feat(themes): wire theme selector into App.svelte — video/image bg, logo, frame"
git push origin main
```

---

## TASK 10 — Update GameGrid to load symbols from theme store

Read `src/lib/components/GameGrid.svelte` in full.

Find the `SYMBOL_TEXTURES` constant or wherever symbol file paths are
hard-coded. Replace with a function that reads from the theme store:

```typescript
import { get } from 'svelte/store'
import { themeAssets } from '../stores/themeStore'

function getSymbolTextures(): Record<string, string> {
  return get(themeAssets).symbols
}
```

In `_preloadTextures`, use:
```typescript
const SYMBOL_TEXTURES = getSymbolTextures()
const urls = Object.values(SYMBOL_TEXTURES)
```

In `_makeCell`, use:
```typescript
const SYMBOL_TEXTURES = getSymbolTextures()
const url = SYMBOL_TEXTURES[symbol]
```

This ensures when the theme changes and the page reloads, GameGrid
loads the new theme's symbols automatically.

Commit:
```bash
cd ~/math-sdk && git add frontend/src/lib/components/GameGrid.svelte
git commit -m "feat(themes): GameGrid loads symbols from active theme store"
git push origin main
```

---

## TASK 11 — Update soundService to load from theme store

Read `src/lib/services/soundService.ts` in full.

The audio BASE path is currently hard-coded. Update to read from theme:

```typescript
import { get } from 'svelte/store'
import { themeAssets } from '../stores/themeStore'

function buildSounds(): Record<string, HTMLAudioElement> {
  const paths = get(themeAssets).sounds
  const s: Record<string, HTMLAudioElement> = {
    bgm:                  new Audio(paths.bgm),
    bgmTension:           new Audio(paths.bgmTension),
    spin:                 new Audio(paths.spin),
    reelStop:             new Audio(paths.reelStop),
    reelStopAnticipation: new Audio(paths.reelStopAnticipation),
    winSmall:             new Audio(paths.winSmall),
    winMedium:            new Audio(paths.winMedium),
    winBig:               new Audio(paths.winBig),
    winEpic:              new Audio(paths.winEpic),
    scatterLand:          new Audio(paths.scatterLand),
    anticipationBuild:    new Audio(paths.anticipationBuild),
    uiClick:              new Audio(paths.uiClick),
  }
  s.bgm.loop = true
  s.bgm.volume = 0.30
  s.bgmTension.volume = 0.50
  s.spin.volume = 0.70
  s.reelStop.volume = 0.85
  s.reelStopAnticipation.volume = 0.90
  s.winSmall.volume = 0.65
  s.winMedium.volume = 0.75
  s.winBig.volume = 0.85
  s.winEpic.volume = 0.95
  s.scatterLand.volume = 0.80
  s.anticipationBuild.volume = 0.60
  s.uiClick.volume = 0.60
  return s
}

let sounds = buildSounds()
```

Keep all existing exported functions (playBGM, playSpin, playWin etc.)
but replace their reference to `sounds` with the rebuilt version.

The theme change triggers a full page reload (from ThemeSelector),
so sounds will be reinitialised automatically on next load.

Commit:
```bash
cd ~/math-sdk && git add frontend/src/lib/services/soundService.ts
git commit -m "feat(themes): soundService loads audio paths from active theme"
git push origin main
```

---

## TASK 12 — TSC + build + verify + status update

```bash
cd ~/math-sdk/frontend
npx tsc --noEmit 2>&1
npm run build 2>&1
```

Both must exit 0. Fix any TypeScript errors autonomously.

**Verify asset counts:**
```bash
echo "=== Asset counts per theme ==="
for theme in future-spinner trap-lane oil-and-fire beautiful-game; do
  sym=$(ls ~/math-sdk/frontend/public/assets/themes/$theme/symbols/ 2>/dev/null | wc -l)
  snd=$(ls ~/math-sdk/frontend/public/assets/themes/$theme/sounds/ 2>/dev/null | wc -l)
  echo "$theme: symbols=$sym, sounds=$snd"
done
```

**Log any missing assets:**
```bash
echo "=== Checking for missing required files ==="
for theme in trap-lane oil-and-fire beautiful-game; do
  for f in h1 h2 m1 m2 m3 l1 l2 l3 wild scatter; do
    path=~/math-sdk/frontend/public/assets/themes/$theme/symbols/${f}.png
    [ -f "$path" ] || echo "MISSING: $theme/symbols/${f}.png"
  done
  for f in logo spin_button panel_balance panel_win btn_bet_minus btn_bet_plus btn_menu; do
    path=~/math-sdk/frontend/public/assets/themes/$theme/ui/${f}.png
    [ -f "$path" ] || echo "MISSING: $theme/ui/${f}.png"
  done
done
echo "Check complete"
```

Update `~/math-sdk/FUTURE_SPINNER_PROJECT_STATUS.md` — add:

```markdown
## THEME SYSTEM STATUS
- ✅ 4 themes active: future-spinner, trap-lane, oil-and-fire, beautiful-game
- ✅ 2 coming soon: valhalla-rising, apex-racing
- ✅ ThemeSelector.svelte — preview grid, available/coming-soon states
- ✅ themeStore.ts — reactive asset paths
- ✅ themes.ts — 6-theme registry
- ✅ GameGrid loads symbols from theme store
- ✅ soundService loads audio from theme store
- ✅ App.svelte — video/image background switch, frame, logo all theme-driven
- ✅ All 5 concepts stored for each theme (A-E) for future A/B selection
- ⏳ All concepts selector (within-theme concept picker) — future feature
```

```bash
cp ~/math-sdk/FUTURE_SPINNER_PROJECT_STATUS.md \
   ~/Downloads/FUTURE_SPINNER_PROJECT_STATUS.md

cd ~/math-sdk && git add -A
git commit -m "chore: multi-theme system complete — 4 themes live, status updated"
git push origin main
```

---

## COMPLETION REPORT

═══════════════════════════════════════════════════════════════════
FUTURE SPINNER v2 — MULTI-THEME SYSTEM COMPLETE
═══════════════════════════════════════════════════════════════════

TASK 1  — Directory structure created:              [ done ]
TASK 2  — trap-lane (greyhound) installed:          [ done ]
TASK 3  — oil-and-fire (geopolitical) installed:    [ done ]
TASK 4  — beautiful-game (soccer) installed:        [ done ]
TASK 5  — future-spinner migrated to themes/:       [ done ]
TASK 6  — themes.ts — 4 active, 2 coming soon:      [ done ]
TASK 7  — themeStore.ts created:                    [ done ]
TASK 8  — ThemeSelector.svelte created:             [ done ]
TASK 9  — App.svelte wired:                         [ done ]
TASK 10 — GameGrid reads from theme store:          [ done ]
TASK 11 — soundService reads from theme store:      [ done ]
TASK 12 — Build passing, assets verified:           [ done ]

TSC:    [ 0 errors ]
BUILD:  [ pass ]
COMMIT: [ pushed to main ]
STATUS: [ copied to ~/Downloads/ ]

ACTIVE THEMES: future-spinner · trap-lane · oil-and-fire · beautiful-game
COMING SOON:   valhalla-rising · apex-racing

Player experience:
  → Hit 🎨 button → Theme Selector opens
  → Pick theme → "PLAY THIS THEME" → game reloads
  → Same RTP (96.35%), same math, new world

═══════════════════════════════════════════════════════════════════
