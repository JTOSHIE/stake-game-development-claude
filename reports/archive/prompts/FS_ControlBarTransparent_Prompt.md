# FUTURE SPINNER — REMOVE CONTROL BAR BACKGROUND + UPDATE BUTTON MAPPING
## April 2026

---

## PRE-AUTHORISATIONS
- ✅ Overwrite ANY file without asking
- ✅ Fix TypeScript errors autonomously
- ✅ Run build, tsc, npm, git without asking
**HARD LOCKS:** rgsService.ts, gameStore.ts, Math SDK — never touch.

---

## WHAT THIS DOES

1. Removes the dark gradient/triangle panel behind the control buttons
   so buttons float over the game background
2. Updates themeStore to map separate images for btn_bet_minus,
   btn_bet_plus, and btn_autoplay (currently all use same file)
3. Updates ControlBar to use distinct images per button

---

## STEP 0 — READ BEFORE CHANGING

```bash
# Find the dark panel CSS in ControlBar and App
grep -n "background\|gradient\|rgba\|linear\|radial\|control\|bar\|panel\|bottom" \
  ~/math-sdk/frontend/src/App.svelte | grep -i "control\|bar\|bottom\|gradient" | head -20

grep -n "background\|gradient\|rgba\|linear" \
  ~/math-sdk/frontend/src/lib/components/ControlBar.svelte | head -30

# Show the full controls section in App.svelte
grep -n "controls\|control-bar\|control-panel\|footer\|bottom-bar" \
  ~/math-sdk/frontend/src/App.svelte | head -20
```

Report exact line numbers for the dark panel background.

---

## TASK 1 — Remove dark background from control bar

In App.svelte or ControlBar.svelte, find the CSS for the controls
container. It will have a `background` or `background-color` with
a dark rgba value or a linear-gradient creating the triangle/trapezoid
shape. Also look for a `clip-path` which creates the triangle shape.

Remove the background entirely — make it transparent:

```css
/* BEFORE — something like: */
.controls {
  background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 60%, transparent 100%);
  /* or */
  background: rgba(0, 0, 0, 0.7);
  /* or a clip-path triangle */
}

/* AFTER — fully transparent, buttons float over background */
.controls {
  background: transparent;
}
```

Also remove any `clip-path`, `backdrop-filter`, or `box-shadow` on
the controls container that creates the dark shading effect.

The buttons themselves should keep their individual backgrounds
(each button has its own dark backing) — only the CONTAINER
behind all the buttons becomes transparent.

Commit:
```bash
cd ~/math-sdk && git add -A
git commit -m "fix(ui): remove dark gradient panel behind control bar — buttons float over bg"
git push origin main
```

---

## TASK 2 — Update themeStore for distinct button images

Read `src/lib/stores/themeStore.ts`. Find the themeAssets derived store.

Update the button mappings so each button has its own distinct file:

```typescript
// In themeAssets derived store, update button paths:
btnMinus:     `${b}/ui/btn_bet_minus.png`,
btnPlus:      `${b}/ui/btn_bet_plus.png`,
btnAutoplay:  `${b}/ui/btn_autoplay.png`,
btnMenu:      `${b}/ui/btn_menu.png`,
```

These are already in the store — confirm they're present and pointing
to different filenames (not all pointing to the same `bet_btn.png`).

If the store currently maps all three to the same file, update them
to point to their distinct files as above. The files will exist once
Manus delivers the Round 3 buttons.

Commit:
```bash
cd ~/math-sdk && git add -A
git commit -m "fix(theme): distinct file paths for minus, plus, autoplay buttons"
git push origin main
```

---

## TASK 3 — Update ControlBar to use distinct button images

Read `src/lib/components/ControlBar.svelte`.

Find the decrease bet button, increase bet button, and autoplay button.
Ensure each uses its own distinct themeAssets reference:

```svelte
<!-- Decrease bet — uses btnMinus -->
<button class="nudge-btn"
  style="background-image: url('{$themeAssets.btnMinus}')"
  on:click={handleDecreaseBet}
  aria-label="Decrease bet">
  <span class="nudge-symbol">−</span>
</button>

<!-- Increase bet — uses btnPlus (different image) -->
<button class="nudge-btn"
  style="background-image: url('{$themeAssets.btnPlus}')"
  on:click={handleIncreaseBet}
  aria-label="Increase bet">
  <span class="nudge-symbol">+</span>
</button>

<!-- Autoplay — uses btnAutoplay (different image) -->
<button class="auto-btn"
  style="background-image: url('{$themeAssets.btnAutoplay}')"
  ...>
  <span class="auto-label">AUTO</span>
</button>
```

The text labels (−, +, AUTO) remain as CSS text overlaid on the button image.

For the MAX bet button — it currently reuses btnMinus. Keep this for now
as the MAX button uses the same coin/button aesthetic. This is acceptable.

Commit:
```bash
cd ~/math-sdk && git add -A
git commit -m "fix(buttons): each button uses its own distinct theme image"
git push origin main
```

---

## TASK 4 — Make individual buttons visually cleaner

Each button should have its image fill the button cleanly with no
background colour bleeding around the edges. Update the nudge-btn CSS:

```css
.nudge-btn {
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  background-color: transparent;  /* No fill — image provides the button look */
  border: none;                   /* Image provides the border */
  box-shadow: none;               /* Image provides any glow */
}

/* Keep hover effects — but as filter on the image, not background */
.nudge-btn:hover:not(:disabled) {
  transform: scale(1.08);
  filter: brightness(1.2) drop-shadow(0 0 8px color-mix(in srgb, var(--theme-primary, #00ffff) 50%, transparent));
}
```

Same for the autoplay and MAX buttons — transparent background,
`background-size: contain`, image fills the button shape.

Commit:
```bash
cd ~/math-sdk && git add -A
git commit -m "fix(buttons): transparent bg, contain sizing, image fills button shape"
git push origin main
```

---

## TASK 5 — TSC + build + status

```bash
cd ~/math-sdk/frontend
npx tsc --noEmit 2>&1
npm run build 2>&1
```

Both must exit 0.

```bash
cp ~/math-sdk/FUTURE_SPINNER_PROJECT_STATUS.md \
   ~/Downloads/FUTURE_SPINNER_PROJECT_STATUS.md

cd ~/math-sdk && git add -A
git commit -m "fix(ui): transparent control bar, distinct button images per theme"
git push origin main
```

---

## COMPLETION REPORT

═══════════════════════════════════════════════════════════════
UI TRANSPARENCY + BUTTON MAPPING FIXES COMPLETE
═══════════════════════════════════════════════════════════════

TASK 1 — Dark gradient removed from control bar:    [ done ]
TASK 2 — themeStore: distinct paths per button:     [ done ]
TASK 3 — ControlBar: each button its own image:     [ done ]
TASK 4 — Button CSS: transparent bg, contain size:  [ done ]
TASK 5 — Build clean:                               [ done ]

RESULT:
  → Buttons float over game background — no dark panel
  → − + AUTO buttons each have their own distinct image
  → Max/Turbo/Info/Sound remain generic (correct per brief)
  → TSC: 0 errors | Build: pass

═══════════════════════════════════════════════════════════════
