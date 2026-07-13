# FUTURE SPINNER — MASTER THEME INSTALL
## Installs all three themes completely in one session.
## T3-B Classic Greyhound | T4-E Ancient Empires | T5-C World Cup
## April 2026

---

## PRE-AUTHORISATIONS
- ✅ Overwrite ANY file without asking
- ✅ Create ANY directory without asking
- ✅ Fix TypeScript errors autonomously
- ✅ Run build, tsc, npm, git without asking
**HARD LOCKS:** rgsService.ts, gameStore.ts, Math SDK — never touch.
**Working directory:** ~/math-sdk/frontend/

---

## SOURCES — Where each asset comes from

```
SOURCE A: ~/math-sdk/frontend/public/assets/themes/source/theme-3-greyhounds/
SOURCE B: ~/math-sdk/frontend/public/assets/themes/source/theme-4-geopolitical/
SOURCE C: ~/math-sdk/frontend/public/assets/themes/source/theme-5-soccer/
SOURCE R1: ~/Downloads/manus-ui/oil-and-fire-concept-E/     (Round 1 Manus UI)
SOURCE R1S: ~/Downloads/manus-ui/beautiful-game-concept-C/  (Round 1 Manus UI)
SOURCE R3: ~/Downloads/round3/oil-and-fire-concept-E/       (Round 3 corrections)
SOURCE R3S: ~/Downloads/round3/beautiful-game-concept-C/    (Round 3 corrections)
```

---

## STEP 0 — VERIFY ALL SOURCES EXIST

```bash
echo "=== Checking all source directories ==="

# Source ZIPs (already extracted)
ls ~/math-sdk/frontend/public/assets/themes/source/theme-3-greyhounds/concept-B/symbols/ \
  | wc -l | xargs echo "T3-B symbols (expect 10):"

ls ~/math-sdk/frontend/public/assets/themes/source/theme-4-geopolitical/concept-E/symbols/ \
  | wc -l | xargs echo "T4-E symbols (expect 11):"

ls ~/math-sdk/frontend/public/assets/themes/source/theme-5-soccer/concept-C/symbols/ \
  | wc -l | xargs echo "T5-C symbols (expect 11):"

# Round 1 Manus UI
ls ~/Downloads/manus-ui/oil-and-fire-concept-E/*.png 2>/dev/null \
  | wc -l | xargs echo "Round1 T4-E UI files:"

ls ~/Downloads/manus-ui/beautiful-game-concept-C/*.png 2>/dev/null \
  | wc -l | xargs echo "Round1 T5-C UI files:"

# Round 3 Manus corrections
ls ~/Downloads/round3/oil-and-fire-concept-E/*.png 2>/dev/null \
  | wc -l | xargs echo "Round3 T4-E files:"

ls ~/Downloads/round3/beautiful-game-concept-C/*.png 2>/dev/null \
  | wc -l | xargs echo "Round3 T5-C files:"
```

If Round 1 or Round 3 directories are not found in ~/Downloads/, search:
```bash
find ~/Downloads -name "t4e_logo.png" 2>/dev/null | head -3
find ~/Downloads -name "t4e_bet_minus.png" 2>/dev/null | head -3
```
Report found paths and adjust SOURCE variables accordingly before continuing.

---

## TASK 1 — Install Trap Lane (T3-B Classic)

```bash
SRC=~/math-sdk/frontend/public/assets/themes/source/theme-3-greyhounds/concept-B
DST=~/math-sdk/frontend/public/assets/themes/trap-lane

mkdir -p $DST/symbols $DST/backgrounds $DST/frames $DST/ui $DST/sounds

# SYMBOLS
cp "$SRC/symbols/t3b_h1_greyhound_champion.png" $DST/symbols/h1.png
cp "$SRC/symbols/t3b_h2_trainer.png"            $DST/symbols/h2.png
cp "$SRC/symbols/t3b_m1_starting_trap.png"      $DST/symbols/m1.png
cp "$SRC/symbols/t3b_m2_trophy.png"             $DST/symbols/m2.png
cp "$SRC/symbols/t3b_m3_race_card.png"          $DST/symbols/m3.png
cp "$SRC/symbols/t3b_l1_stopwatch.png"          $DST/symbols/l1.png
cp "$SRC/symbols/t3b_l2_betting_ticket.png"     $DST/symbols/l2.png
cp "$SRC/symbols/t3b_l3_lure.png"               $DST/symbols/l3.png
cp "$SRC/symbols/t3b_wild.png"                  $DST/symbols/wild.png
cp "$SRC/symbols/t3b_scatter.png"               $DST/symbols/scatter.png

# BACKGROUNDS
cp "$SRC/backgrounds/t3b_bg1_classic_stadium.jpg" $DST/backgrounds/bg-1.jpg
cp "$SRC/backgrounds/t3b_bg2_betting_paddock.jpg"  $DST/backgrounds/bg-2.jpg
cp "$SRC/backgrounds/t3b_bg3_race_action.jpg"      $DST/backgrounds/bg-3.jpg

# FRAMES
cp "$SRC/frames/t3b_frame_ornate.png"  $DST/frames/frame-1.png
cp "$SRC/frames/t3b_frame_minimal.png" $DST/frames/frame-2.png

# UI — T3-B has one bet_btn used for minus/plus/autoplay
cp "$SRC/ui/t3b_logo.png"            $DST/ui/logo.png
cp "$SRC/ui/t3b_spin_btn.png"        $DST/ui/spin_button.png
cp "$SRC/ui/t3b_balance_display.png" $DST/ui/panel_balance.png
cp "$SRC/ui/t3b_win_display.png"     $DST/ui/panel_win.png
cp "$SRC/ui/t3b_bet_btn.png"         $DST/ui/btn_bet_minus.png
cp "$SRC/ui/t3b_bet_btn.png"         $DST/ui/btn_bet_plus.png
cp "$SRC/ui/t3b_bet_btn.png"         $DST/ui/btn_autoplay.png
cp "$SRC/ui/t3b_info_btn.png"        $DST/ui/btn_menu.png

# AUDIO — concept-B specific BGM
ASRC=~/math-sdk/frontend/public/assets/themes/source/theme-3-greyhounds/audio
cp "$ASRC/t3b_bg_music.mp3"        $DST/sounds/bgm_loop.mp3
cp "$ASRC/t3_crowd_ambience.mp3"   $DST/sounds/bgm_tension.mp3
cp "$ASRC/t3_spin_click.mp3"       $DST/sounds/spin.mp3
cp "$ASRC/t3_race_start_bell.mp3"  $DST/sounds/reel_stop.mp3
cp "$ASRC/t3_win_jingle_small.mp3" $DST/sounds/win_small.mp3
cp "$ASRC/t3_win_jingle_big.mp3"   $DST/sounds/win_big.mp3
cp "$ASRC/t3_bonus_fanfare.mp3"    $DST/sounds/win_epic.mp3
cp "$ASRC/t3_scatter_trigger.mp3"  $DST/sounds/scatter_land.mp3

# Fallbacks from future-spinner for missing sounds
FS=~/math-sdk/frontend/public/assets/themes/future-spinner/sounds
for s in reel_stop_anticipation win_medium anticipation_build ui_click; do
  [ -f "$FS/${s}.mp3" ] && cp "$FS/${s}.mp3" $DST/sounds/${s}.mp3 || true
done

echo "=== T3-B VERIFY ==="
echo "Symbols: $(ls $DST/symbols/*.png | wc -l) (expect 10)"
echo "UI files: $(ls $DST/ui/*.png | wc -l) (expect 8)"
echo "Frame size: $(wc -c < $DST/frames/frame-1.png) bytes"
echo "Logo size: $(wc -c < $DST/ui/logo.png) bytes"
```

Commit:
```bash
cd ~/math-sdk && git add public/assets/themes/trap-lane/
git commit -m "feat(assets): trap-lane T3-B classic greyhound — complete install"
git push origin main
```

---

## TASK 2 — Install Oil & Fire (T4-E Ancient Empires)

```bash
SRC_SYM=~/math-sdk/frontend/public/assets/themes/source/theme-4-geopolitical/concept-E
SRC_R1=~/Downloads/manus-ui/oil-and-fire-concept-E
SRC_R3=~/Downloads/round3/oil-and-fire-concept-E
DST=~/math-sdk/frontend/public/assets/themes/oil-and-fire

mkdir -p $DST/symbols $DST/backgrounds $DST/frames $DST/ui $DST/sounds

# SYMBOLS (11 source → 10 slots: h3 becomes m1, shift others down)
cp "$SRC_SYM/symbols/t4e_h1.png"      $DST/symbols/h1.png
cp "$SRC_SYM/symbols/t4e_h2.png"      $DST/symbols/h2.png
cp "$SRC_SYM/symbols/t4e_h3.png"      $DST/symbols/m1.png
cp "$SRC_SYM/symbols/t4e_m1.png"      $DST/symbols/m2.png
cp "$SRC_SYM/symbols/t4e_m2.png"      $DST/symbols/m3.png
cp "$SRC_SYM/symbols/t4e_m3.png"      $DST/symbols/l1.png
cp "$SRC_SYM/symbols/t4e_l1.png"      $DST/symbols/l2.png
cp "$SRC_SYM/symbols/t4e_l2.png"      $DST/symbols/l3.png
cp "$SRC_SYM/symbols/t4e_wild.png"    $DST/symbols/wild.png
cp "$SRC_SYM/symbols/t4e_scatter.png" $DST/symbols/scatter.png

# BACKGROUNDS (Colosseum, Roman Senate, Roman Forum)
cp "$SRC_SYM/backgrounds/t4e_bg1_colosseum.jpg"    $DST/backgrounds/bg-1.jpg
cp "$SRC_SYM/backgrounds/t4e_bg2_roman_senate.jpg" $DST/backgrounds/bg-2.jpg
cp "$SRC_SYM/backgrounds/t4e_bg3_roman_forum.jpg"  $DST/backgrounds/bg-3.jpg

# FRAMES — ornate from Round 1, minimal from Round 3 (corrected)
cp "$SRC_R1/t4e_frame_ornate.png"  $DST/frames/frame-1.png
cp "$SRC_R3/t4e_frame_minimal.png" $DST/frames/frame-2.png

# UI — logo/spin/info from Round 1, panels/buttons from Round 3
cp "$SRC_R1/t4e_logo.png"            $DST/ui/logo.png
cp "$SRC_R1/t4e_spin_btn.png"        $DST/ui/spin_button.png
cp "$SRC_R1/t4e_info_btn.png"        $DST/ui/btn_menu.png
cp "$SRC_R3/t4e_balance_display.png" $DST/ui/panel_balance.png
cp "$SRC_R3/t4e_win_display.png"     $DST/ui/panel_win.png
cp "$SRC_R3/t4e_bet_minus.png"       $DST/ui/btn_bet_minus.png
cp "$SRC_R3/t4e_bet_plus.png"        $DST/ui/btn_bet_plus.png
cp "$SRC_R3/t4e_btn_autoplay.png"    $DST/ui/btn_autoplay.png

# AUDIO
ASRC=~/math-sdk/frontend/public/assets/themes/source/theme-4-geopolitical/audio
cp "$ASRC/t4e_bg_music.mp3"          $DST/sounds/bgm_loop.mp3
cp "$ASRC/t4_tension_sting.mp3"      $DST/sounds/bgm_tension.mp3
cp "$ASRC/t4_spin_click.mp3"         $DST/sounds/spin.mp3
cp "$ASRC/t4_diplomatic_ambience.mp3" $DST/sounds/reel_stop.mp3
cp "$ASRC/t4_win_jingle_small.mp3"   $DST/sounds/win_small.mp3
cp "$ASRC/t4_win_jingle_big.mp3"     $DST/sounds/win_big.mp3
cp "$ASRC/t4_bonus_fanfare.mp3"      $DST/sounds/win_epic.mp3
cp "$ASRC/t4_scatter_trigger.mp3"    $DST/sounds/scatter_land.mp3
FS=~/math-sdk/frontend/public/assets/themes/future-spinner/sounds
for s in reel_stop_anticipation win_medium anticipation_build ui_click; do
  [ -f "$FS/${s}.mp3" ] && cp "$FS/${s}.mp3" $DST/sounds/${s}.mp3 || true
done

echo "=== T4-E VERIFY ==="
echo "Symbols: $(ls $DST/symbols/*.png | wc -l) (expect 10)"
echo "UI files: $(ls $DST/ui/*.png | wc -l) (expect 8)"
for f in logo spin_button panel_balance panel_win btn_bet_minus btn_bet_plus btn_autoplay btn_menu; do
  size=$(wc -c < "$DST/ui/${f}.png" 2>/dev/null || echo 0)
  [ "$size" -lt 2000 ] && echo "  ⚠️  ${f}.png: ${size}B (may be blank)" || echo "  ✅ ${f}.png: ${size}B"
done
echo "Frame-1 size: $(wc -c < $DST/frames/frame-1.png) bytes"
```

Commit:
```bash
cd ~/math-sdk && git add public/assets/themes/oil-and-fire/
git commit -m "feat(assets): oil-and-fire T4-E ancient empires — complete install"
git push origin main
```

---

## TASK 3 — Install Beautiful Game (T5-C World Cup)

```bash
SRC_SYM=~/math-sdk/frontend/public/assets/themes/source/theme-5-soccer/concept-C
SRC_R1=~/Downloads/manus-ui/beautiful-game-concept-C
SRC_R3=~/Downloads/round3/beautiful-game-concept-C
DST=~/math-sdk/frontend/public/assets/themes/beautiful-game

mkdir -p $DST/symbols $DST/backgrounds $DST/frames $DST/ui $DST/sounds

# SYMBOLS (11 source → 10 slots)
cp "$SRC_SYM/symbols/t5c_h1.png"      $DST/symbols/h1.png
cp "$SRC_SYM/symbols/t5c_h2.png"      $DST/symbols/h2.png
cp "$SRC_SYM/symbols/t5c_h3.png"      $DST/symbols/m1.png
cp "$SRC_SYM/symbols/t5c_m1.png"      $DST/symbols/m2.png
cp "$SRC_SYM/symbols/t5c_m2.png"      $DST/symbols/m3.png
cp "$SRC_SYM/symbols/t5c_m3.png"      $DST/symbols/l1.png
cp "$SRC_SYM/symbols/t5c_l1.png"      $DST/symbols/l2.png
cp "$SRC_SYM/symbols/t5c_l2.png"      $DST/symbols/l3.png
cp "$SRC_SYM/symbols/t5c_wild.png"    $DST/symbols/wild.png
cp "$SRC_SYM/symbols/t5c_scatter.png" $DST/symbols/scatter.png

# BACKGROUNDS (World Cup stadium, ceremony, city)
cp "$SRC_SYM/backgrounds/t5c_bg1_world_cup_stadium.jpg"  $DST/backgrounds/bg-1.jpg
cp "$SRC_SYM/backgrounds/t5c_bg2_world_cup_ceremony.jpg" $DST/backgrounds/bg-2.jpg
cp "$SRC_SYM/backgrounds/t5c_bg3_world_cup_city.jpg"     $DST/backgrounds/bg-3.jpg

# FRAMES
cp "$SRC_R1/t5c_frame_ornate.png"  $DST/frames/frame-1.png
cp "$SRC_R3/t5c_frame_minimal.png" $DST/frames/frame-2.png

# UI
cp "$SRC_R1/t5c_logo.png"            $DST/ui/logo.png
cp "$SRC_R1/t5c_spin_btn.png"        $DST/ui/spin_button.png
cp "$SRC_R1/t5c_info_btn.png"        $DST/ui/btn_menu.png
cp "$SRC_R3/t5c_balance_display.png" $DST/ui/panel_balance.png
cp "$SRC_R3/t5c_win_display.png"     $DST/ui/panel_win.png
cp "$SRC_R3/t5c_bet_minus.png"       $DST/ui/btn_bet_minus.png
cp "$SRC_R3/t5c_bet_plus.png"        $DST/ui/btn_bet_plus.png
cp "$SRC_R3/t5c_btn_autoplay.png"    $DST/ui/btn_autoplay.png

# AUDIO
ASRC=~/math-sdk/frontend/public/assets/themes/source/theme-5-soccer/audio
cp "$ASRC/t5c_bg_music.mp3"          $DST/sounds/bgm_loop.mp3
cp "$ASRC/t5_crowd_roar.mp3"         $DST/sounds/bgm_tension.mp3
cp "$ASRC/t5_spin_click.mp3"         $DST/sounds/spin.mp3
cp "$ASRC/t5_referee_whistle.mp3"    $DST/sounds/reel_stop.mp3
cp "$ASRC/t5_win_jingle_small.mp3"   $DST/sounds/win_small.mp3
cp "$ASRC/t5_win_jingle_big.mp3"     $DST/sounds/win_big.mp3
cp "$ASRC/t5_bonus_fanfare.mp3"      $DST/sounds/win_epic.mp3
cp "$ASRC/t5_goal_horn.mp3"          $DST/sounds/anticipation_build.mp3
FS=~/math-sdk/frontend/public/assets/themes/future-spinner/sounds
cp "$FS/scatter_land.mp3"            $DST/sounds/scatter_land.mp3
for s in reel_stop_anticipation win_medium ui_click; do
  [ -f "$FS/${s}.mp3" ] && cp "$FS/${s}.mp3" $DST/sounds/${s}.mp3 || true
done

echo "=== T5-C VERIFY ==="
echo "Symbols: $(ls $DST/symbols/*.png | wc -l) (expect 10)"
echo "UI files: $(ls $DST/ui/*.png | wc -l) (expect 8)"
for f in logo spin_button panel_balance panel_win btn_bet_minus btn_bet_plus btn_autoplay btn_menu; do
  size=$(wc -c < "$DST/ui/${f}.png" 2>/dev/null || echo 0)
  [ "$size" -lt 2000 ] && echo "  ⚠️  ${f}.png: ${size}B (may be blank)" || echo "  ✅ ${f}.png: ${size}B"
done
```

Commit:
```bash
cd ~/math-sdk && git add public/assets/themes/beautiful-game/
git commit -m "feat(assets): beautiful-game T5-C world cup — complete install"
git push origin main
```

---

## TASK 4 — Update themeStore for new panel sizes

The win panel is now 360×100px (was 280×80). Update themeStore if it
has hard-coded panel dimensions anywhere. Check:

```bash
grep -n "280\|360\|panelWin\|panel_win\|win_display" \
  ~/math-sdk/frontend/src/lib/stores/themeStore.ts
grep -n "280\|360\|panelWin\|panel_win\|win_display" \
  ~/math-sdk/frontend/src/lib/components/WinDisplay.svelte | head -10
```

If WinDisplay.svelte has a hard-coded `min-width: 160px` or similar,
update to accommodate the new larger panel:

```css
.win-panel {
  min-width: 200px;   /* was 160px */
  height: auto;       /* let the background image determine height */
  padding: 0 1.2rem;
}
```

Commit:
```bash
cd ~/math-sdk && git add -A
git commit -m "fix(ui): win panel CSS accommodates new 360x100 panel size"
git push origin main
```

---

## TASK 5 — FULL INTEGRITY CHECK

```bash
echo "================================================"
echo "MASTER INTEGRITY CHECK — ALL THEMES"
echo "================================================"
FAIL=0

for theme in future-spinner trap-lane oil-and-fire beautiful-game; do
  echo ""
  echo "--- $theme ---"
  BASE=~/math-sdk/frontend/public/assets/themes/$theme

  # Symbols
  for sym in h1 h2 m1 m2 m3 l1 l2 l3 wild scatter; do
    f="$BASE/symbols/${sym}.png"
    size=$(wc -c < "$f" 2>/dev/null || echo 0)
    if [ "$size" -lt 5000 ]; then
      echo "  ❌ symbols/${sym}.png: ${size}B"
      FAIL=$((FAIL+1))
    else
      echo "  ✅ symbols/${sym}.png: ${size}B"
    fi
  done

  # UI — every file must be real (>2KB)
  for ui in logo spin_button panel_balance panel_win \
             btn_bet_minus btn_bet_plus btn_autoplay btn_menu; do
    f="$BASE/ui/${ui}.png"
    size=$(wc -c < "$f" 2>/dev/null || echo 0)
    if [ "$size" -lt 2000 ]; then
      echo "  ❌ ui/${ui}.png: ${size}B (blank/missing)"
      FAIL=$((FAIL+1))
    else
      echo "  ✅ ui/${ui}.png: ${size}B"
    fi
  done

  # Frame
  size=$(wc -c < "$BASE/frames/frame-1.png" 2>/dev/null || echo 0)
  [ "$size" -lt 50000 ] && { echo "  ⚠️  frame-1.png: ${size}B (may be placeholder)"; } \
                         || echo "  ✅ frame-1.png: ${size}B"

  # Background
  size=$(wc -c < "$BASE/backgrounds/bg-1.jpg" 2>/dev/null || echo 0)
  [ "$size" -lt 10000 ] && { echo "  ❌ bg-1.jpg: MISSING"; FAIL=$((FAIL+1)); } \
                         || echo "  ✅ bg-1.jpg: ${size}B"
done

echo ""
echo "================================================"
[ $FAIL -eq 0 ] && echo "ALL CHECKS PASSED ✅" || echo "$FAIL FAILURES ❌ — fix before build"
echo "================================================"
```

**If FAIL > 0, fix the missing files before continuing.**

---

## TASK 6 — TSC + Build

```bash
cd ~/math-sdk/frontend
npx tsc --noEmit 2>&1
npm run build 2>&1
```

Both must exit 0.

---

## TASK 7 — Update status doc + final commit

Update `~/math-sdk/FUTURE_SPINNER_PROJECT_STATUS.md`:

```markdown
## ACTIVE THEME INSTALLATIONS (2026-04-05)

| Theme | Concept | Symbols | UI | Frame | Status |
|-------|---------|---------|-----|-------|--------|
| future-spinner | Original cyberpunk | ✅ | ✅ | ✅ | Complete |
| trap-lane | B — Classic Greyhound | ✅ | ✅ T3-B | ✅ | Complete |
| oil-and-fire | E — Ancient Empires | ✅ | ✅ R1+R3 | ✅ R1+R3 | Complete |
| beautiful-game | C — World Cup | ✅ | ✅ R1+R3 | ✅ R1+R3 | Complete |

UI asset sources:
- trap-lane: T3-B source ZIP (all UI)
- oil-and-fire: Round 1 (logo, spin, info, frame_ornate) + Round 3 (panels, distinct buttons, frame_minimal)
- beautiful-game: Round 1 (logo, spin, info, frame_ornate) + Round 3 (panels, distinct buttons, frame_minimal)
```

```bash
cp ~/math-sdk/FUTURE_SPINNER_PROJECT_STATUS.md \
   ~/Downloads/FUTURE_SPINNER_PROJECT_STATUS.md

cd ~/math-sdk && git add -A
git commit -m "feat(themes): master install complete — T3-B, T4-E, T5-C all themes fully installed"
git push origin main
```

---

## COMPLETION REPORT

═══════════════════════════════════════════════════════════════════
MASTER THEME INSTALL COMPLETE
═══════════════════════════════════════════════════════════════════

TASK 1 — Trap Lane T3-B Classic:          [ done ]
TASK 2 — Oil & Fire T4-E Ancient Empires: [ done ]
TASK 3 — Beautiful Game T5-C World Cup:   [ done ]
TASK 4 — Win panel CSS updated:           [ done ]
TASK 5 — Integrity check: 0 failures:     [ done ]
TASK 6 — TSC + build clean:               [ done ]
TASK 7 — Status + commit:                 [ done ]

TSC:    [ 0 errors ]
BUILD:  [ pass ]
COMMIT: [ pushed to main ]
STATUS: [ copied to ~/Downloads/ ]

INSTALLED THEMES:
  future-spinner → cyberpunk automotive (video bg)
  trap-lane      → T3-B classic greyhound (stadium bg)
  oil-and-fire   → T4-E ancient empires (Colosseum bg)
  beautiful-game → T5-C world cup (stadium ceremony bg)

═══════════════════════════════════════════════════════════════════
