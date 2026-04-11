# FUTURE SPINNER — INSTALL THREE NEW THEMES
## trap-lane, oil-and-fire, beautiful-game
## Source: ~/Desktop/wrs-all-themes/
## April 2026

---

## PRE-AUTHORISATIONS
- ✅ Overwrite ANY file without asking
- ✅ Run build, tsc, npm, git without asking
**HARD LOCKS:** rgsService.ts, gameStore.ts, Math SDK — never touch.

---

## STEP 0 — VERIFY SOURCE FILES

```bash
echo "=== TRAP-LANE ==="
ls ~/Desktop/wrs-all-themes/trap-lane/symbols/ | wc -l
ls ~/Desktop/wrs-all-themes/trap-lane/ui/ | wc -l
ls ~/Desktop/wrs-all-themes/trap-lane/sounds/ | wc -l

echo "=== OIL-AND-FIRE ==="
ls ~/Desktop/wrs-all-themes/oil-and-fire/symbols/ | wc -l
ls ~/Desktop/wrs-all-themes/oil-and-fire/ui/ | wc -l
ls ~/Desktop/wrs-all-themes/oil-and-fire/sounds/ | wc -l

echo "=== BEAUTIFUL-GAME ==="
ls ~/Desktop/wrs-all-themes/beautiful-game/symbols/ | wc -l
ls ~/Desktop/wrs-all-themes/beautiful-game/ui/ | wc -l
ls ~/Desktop/wrs-all-themes/beautiful-game/sounds/ | wc -l
```

Expected: 10 symbols, 8 UI, 12 sounds per theme. Report findings.

---

## TASK 1 — Create theme directories and install all assets

```bash
DEST=~/math-sdk/frontend/public/assets/themes
SRC=~/Desktop/wrs-all-themes

for THEME in trap-lane oil-and-fire beautiful-game; do
  echo "=== Installing $THEME ==="

  mkdir -p $DEST/$THEME/symbols
  mkdir -p $DEST/$THEME/ui
  mkdir -p $DEST/$THEME/backgrounds
  mkdir -p $DEST/$THEME/sounds

  # Symbols
  cp $SRC/$THEME/symbols/*.png $DEST/$THEME/symbols/

  # UI assets
  cp $SRC/$THEME/ui/*.png $DEST/$THEME/ui/

  # Background
  cp $SRC/$THEME/backgrounds/bg-1.jpg $DEST/$THEME/backgrounds/

  # Sounds
  cp $SRC/$THEME/sounds/*.mp3 $DEST/$THEME/sounds/

  echo "--- $THEME installed ---"
done

echo "=== VERIFY ALL THREE THEMES ==="
for THEME in trap-lane oil-and-fire beautiful-game; do
  sym=$(ls $DEST/$THEME/symbols/ | wc -l | tr -d ' ')
  ui=$(ls $DEST/$THEME/ui/ | wc -l | tr -d ' ')
  snd=$(ls $DEST/$THEME/sounds/ | wc -l | tr -d ' ')
  bg=$(ls $DEST/$THEME/backgrounds/ | wc -l | tr -d ' ')
  echo "$THEME: symbols=$sym ui=$ui sounds=$snd bg=$bg"
done
```

---

## TASK 2 — Register themes in themeStore.ts

Read the current themeStore.ts to see what's already registered:

```bash
cat ~/math-sdk/frontend/src/lib/stores/themeStore.ts
```

Add the three new themes to the themes array if not already present.
Each needs an id, name, and palette with primary/secondary/background colours.

Use these palette values based on each theme's visual identity:

**trap-lane** (greyhound racing — dark track, fast, electric):
```typescript
{
  id: 'trap-lane',
  name: 'Trap Lane',
  palette: {
    primary:    '#00FF88',   // electric green — racing track
    secondary:  '#FF6600',   // amber — stadium lights
    background: '#0A0A0A',
  }
}
```

**oil-and-fire** (ancient empires / geopolitical — dramatic, warm):
```typescript
{
  id: 'oil-and-fire',
  name: 'Oil & Fire',
  palette: {
    primary:    '#FF4400',   // flame orange-red
    secondary:  '#FFD700',   // gold
    background: '#1A0A00',
  }
}
```

**beautiful-game** (football / World Cup — stadium energy):
```typescript
{
  id: 'beautiful-game',
  name: 'Beautiful Game',
  palette: {
    primary:    '#00AA44',   // pitch green
    secondary:  '#FFFFFF',   // white — clean kit
    background: '#0A1A0A',
  }
}
```

---

## TASK 3 — Wire sounds in soundService.ts

Read soundService.ts to see how future-spinner sounds are loaded.
The service needs to load sounds from the active theme's sounds folder.

```bash
grep -n "sounds\|bgm\|spin\|reel\|win_\|scatter\|anticipation\|themeId\|activeTheme" \
  ~/math-sdk/frontend/src/lib/services/soundService.ts | head -30
```

If soundService already loads sounds dynamically from `$themeAssets.sounds`
or a theme-based path, confirm it works for the new themes and no changes needed.

If sounds are hardcoded to the future-spinner path, update the sound
loading to use the active theme's sounds directory:

```typescript
// Pattern to use — load sounds from active theme
const soundBase = `assets/themes/${themeId}/sounds`

sounds.bgmLoop = new Audio(`${soundBase}/bgm_loop.mp3`)
sounds.spin    = new Audio(`${soundBase}/spin.mp3`)
// etc for all 12 tracks
```

Note: The future-spinner theme uses its own R5 premium audio in
`public/assets/sounds/` — keep that path for future-spinner.
All other themes use `assets/themes/[id]/sounds/`.

---

## TASK 4 — TSC + Build

```bash
cd ~/math-sdk/frontend
npx tsc --noEmit 2>&1
npm run build 2>&1
```

Fix any TypeScript errors. Common issues:
- themeStore type may need updating if new palette fields are added
- soundService path logic if refactored

---

## TASK 5 — Git commit + status update

```bash
cd ~/math-sdk && git add -A

git commit -m "feat(themes): install trap-lane, oil-and-fire, beautiful-game — spec-compliant v1.0"
git push origin main

cat >> ~/math-sdk/FUTURE_SPINNER_PROJECT_STATUS.md << 'EOF'

## THREE NEW THEMES INSTALLED — 2026-04-12
- ✅ trap-lane: 10 symbols, 8 UI, 1 bg, 12 sounds
- ✅ oil-and-fire: 10 symbols, 8 UI, 1 bg, 12 sounds
- ✅ beautiful-game: 10 symbols, 8 UI, 1 bg, 12 sounds
- ✅ All registered in themeStore.ts
- ✅ TSC: 0 errors | Build: pass
EOF

cp ~/math-sdk/FUTURE_SPINNER_PROJECT_STATUS.md ~/Desktop/FUTURE_SPINNER_PROJECT_STATUS.md
```

---

## COMPLETION REPORT

═══════════════════════════════════════════════════════════════════
THREE THEMES INSTALLED
═══════════════════════════════════════════════════════════════════

trap-lane:       symbols=10 ui=8 sounds=12 bg=1    [ done ]
oil-and-fire:    symbols=10 ui=8 sounds=12 bg=1    [ done ]
beautiful-game:  symbols=10 ui=8 sounds=12 bg=1    [ done ]

themeStore:      3 new themes registered            [ done ]
soundService:    theme-aware audio loading          [ done ]
TSC:             0 errors                           [ done ]
BUILD:           pass                               [ done ]
COMMIT:          pushed to main                     [ done ]

Switch themes via the theme selector button in-game.
All 4 themes now available: future-spinner, trap-lane,
oil-and-fire, beautiful-game.

═══════════════════════════════════════════════════════════════════
