# FUTURE SPINNER — MANUS V1.1 DEVELOPER BRIEF FIXES
## Three targeted fixes from screen recording audit
## Do NOT touch buttons — Manus premium asset drop incoming
## April 2026

---

## PRE-AUTHORISATIONS
- ✅ Overwrite ANY file without asking
- ✅ Fix TypeScript errors autonomously
- ✅ Run build, tsc, npm, git without asking
**HARD LOCKS:** rgsService.ts, gameStore.ts, Math SDK — never touch.
**Working directory:** ~/math-sdk/frontend/

---

## CONTEXT — What was found in the screen recording

1. Old "CYBER SLOTS" cyberpunk background bleeding through on left
   side of viewport — old body background-image CSS is still active
2. Vertical gap between symbols and top/bottom inner edge of frame
3. Large yellow "0.8×" win text renders dead centre over the grid,
   obscuring the new win burst animations
4. Buttons look like wireframe placeholders — DO NOT TOUCH, Manus
   is delivering premium 3D replacements

---

## STEP 0 — DIAGNOSTIC READ

```bash
# Find the old body background CSS
grep -n "body\|bg1_main\|cyber\|CYBER\|background-image" \
  ~/math-sdk/frontend/src/App.svelte | head -20

# Find the grid wrapper / reel container padding
grep -n "padding\|margin\|gap\|grid-wrapper\|reel-container\|game-grid" \
  ~/math-sdk/frontend/src/App.svelte | head -20

# Find where the win multiplier text renders on the grid
grep -rn "winMultiplier\|win-banner\|multiplier\|WinBanner\|0\.8" \
  ~/math-sdk/frontend/src/App.svelte \
  ~/math-sdk/frontend/src/lib/components/WinBanner.svelte 2>/dev/null | head -20

# Find what renders at position top:50% or centred over the game grid
grep -rn "top.*50\|transform.*translate\|position.*absolute\|z-index" \
  ~/math-sdk/frontend/src/lib/components/WinBanner.svelte 2>/dev/null | head -20
```

Report exact line numbers before making any changes.

---

## FIX 1 — Remove old body background-image bleeding through

### What to find:
In App.svelte, there is a `:global(body)` CSS block that sets
`background-image` to a cyberpunk PNG (bg1_main_game_desktop or similar).
This shows on the left/edges of the viewport behind the video.

### What to do:
Find the `:global(body)` CSS in App.svelte. Remove the background-image
property entirely. Replace with a plain dark colour:

```css
/* BEFORE (something like): */
:global(body) {
  background-image: url('/assets/symbols/bg1_main_game_desktop_variant_01.png');
  background-size: cover;
  /* ... */
}

/* AFTER — plain dark colour only: */
:global(body) {
  background: #060610;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
```

Also ensure the `.bg-media` video CSS has `object-fit: cover` and
`width: 100vw; height: 100vh` so there are no black bars or edge gaps:

```css
.bg-media {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  object-fit: cover;
  z-index: -100;
  opacity: 0.85;
  pointer-events: none;
  display: block;
}
```

Commit:
```bash
cd ~/math-sdk && git add -A
git commit -m "fix(bg): remove old body background-image CSS — eliminates left-side bleed"
git push origin main
```

---

## FIX 2 — Tighten grid to fill frame window (remove top/bottom gap)

### Context:
The ornate frame PNG has a transparent window of approximately 620×460px.
The PixiJS/video grid is 616×412px. There is a vertical gap (about 1cm
visible) between the top row of symbols and the top inner edge of the frame.

### What to find:
In App.svelte or GameGrid.svelte, find the `.grid-wrapper` or
`.grid-container` or `.game-grid-area` CSS. Look for padding, margin-top,
or any vertical offset being applied.

Also check if the `.game-frame` img has CSS top offset that's pushing
the frame down relative to the grid.

### What to do:

**Option A — If there is padding/margin on the grid wrapper:**
```css
.grid-wrapper {
  padding: 0;    /* Remove any vertical padding */
  margin: 0;     /* Remove any vertical margin */
}
```

**Option B — Adjust the frame positioning:**
The frame PNG is positioned with negative inset to extend beyond the grid.
The current inset is -80px top/sides, -40px bottom (asymmetric from the
last fix). Try increasing the top extension to close the gap:

```css
.game-frame {
  position: absolute;
  top: -90px;     /* was -80px — extend further up to fill gap */
  left: -80px;
  right: -80px;
  bottom: -40px;
  width: calc(100% + 160px);
  height: calc(100% + 130px);  /* top 90 + bottom 40 */
  object-fit: fill;
  pointer-events: none;
  z-index: 10;
}
```

**Option C — Scale the grid to fill the frame window:**
If the frame window is 620×460px and the grid is 616×412px, the height
mismatch (48px) causes the gap. Scale the grid container to exactly
match the frame's transparent window:

In GameGrid.svelte CSS, update `.grid-container`:
```css
.grid-container {
  width: 620px;    /* match frame window width */
  height: 460px;   /* match frame window height */
}
```
Then the symbol cells will auto-resize to fill the space via CSS grid.

Test Option C first as it's the cleanest fix. If symbol cells become
distorted, fall back to Option B (frame repositioning).

**Z-index: symbols spin behind the frame border:**
The frame must act as a mask. Confirm in App.svelte:
```css
.game-frame {
  z-index: 10;   /* above the grid and PixiJS canvas */
}

.grid-wrapper {
  z-index: 1;    /* below the frame */
  overflow: hidden;  /* clips symbols that reach the edge */
}
```

The PixiJS overlay canvas (.pixi-overlay) should be z-index: 2 —
above the video cells but still below the frame PNG at z-index: 10.

Commit:
```bash
cd ~/math-sdk && git add -A
git commit -m "fix(grid): tighten symbol grid to fill frame window — no top/bottom gap"
git push origin main
```

---

## FIX 3 — Move win multiplier display off the grid entirely

### What is happening:
The WinBanner.svelte or WinDisplay.svelte renders the large "0.8×" /
"WIN" text centred over the grid at z-index above the symbols. This
completely covers the new win burst video animations.

### What to do:

**Step 3a — Read WinBanner.svelte to understand its current position:**
```bash
cat ~/math-sdk/frontend/src/lib/components/WinBanner.svelte
```

**Step 3b — Move the win banner to a side position:**

The win multiplier text must NOT render over the grid. Move it to
display as an animated element that appears to the RIGHT of the grid,
or remove it entirely if WinDisplay.svelte (the panel below) already
shows the win amount.

If WinBanner.svelte currently renders centred over the grid with
`position: fixed` or `position: absolute` in the game area:

Change its positioning to appear OUTSIDE the grid — either:
- Below the grid (above the control bar)
- To the right of the grid as a floating side element
- Or remove the centre-grid overlay entirely

The win amount is already shown in the WinDisplay panel (bottom right).
The large overlay text is redundant and now harmful — it covers the
win burst animations.

**Recommended approach — remove the centre-grid win text overlay:**
In App.svelte, find where `<WinBanner>` is rendered. Comment it out
or remove it:

```svelte
<!-- Win banner disabled — win amount shown in WinDisplay panel
     and large text was obscuring win burst symbol animations -->
<!-- <WinBanner /> -->
```

If the win multiplier is inside WinCelebration.svelte (big win overlay):
That is fine to keep — it only shows for big wins and goes fullscreen.

If there is a separate small win text (e.g. "0.8×" shown on ALL wins):
Remove it. Small win amounts are shown in the WinDisplay panel.

**Step 3c — Verify WinDisplay panel is visible and prominent:**
The WinDisplay panel (balance row, right side) should clearly show
the win amount. Confirm it updates correctly after wins.

Commit:
```bash
cd ~/math-sdk && git add -A
git commit -m "fix(ui): remove win multiplier overlay from grid — win amount in panel only"
git push origin main
```

---

## FIX 4 — DO NOT TOUCH BUTTONS

Per Manus developer brief v1.1:
> "Do not attempt to style the existing wireframe buttons.
>  Wait for the premium asset drop to replace them entirely."

The following components must NOT be modified in this session:
- ControlBar.svelte button styling
- The spin button appearance
- The bet +/− button appearance
- Any button CSS

---

## FIX 5 — TSC + Build

```bash
cd ~/math-sdk/frontend
npx tsc --noEmit 2>&1
npm run build 2>&1
```

Both must exit 0.

---

## FIX 6 — Status + commit

```bash
cp ~/math-sdk/FUTURE_SPINNER_PROJECT_STATUS.md \
   ~/Downloads/FUTURE_SPINNER_PROJECT_STATUS.md

cd ~/math-sdk && git add -A
git commit -m "fix(ui): background bleed, grid gap, win overlay — Manus v1.1 brief fixes"
git push origin main
```

---

## COMPLETION REPORT

═══════════════════════════════════════════════════════════════════
MANUS V1.1 BRIEF FIXES COMPLETE
═══════════════════════════════════════════════════════════════════

FIX 1 — Old body background-image removed:       [ done ]
  → No more CYBER SLOTS bleed on left edge
  → Body is plain #060610 dark

FIX 2 — Grid fills frame window:                 [ done ]
  → No top/bottom gap between symbols and frame
  → Symbols spin behind frame border (z-index correct)

FIX 3 — Win multiplier off the grid:             [ done ]
  → Large yellow text no longer covers win burst animations
  → Win amount shown in panel below — unobstructed grid

FIX 4 — Buttons untouched:                       [ held ]
  → Waiting for Manus premium 3D button asset drop

FIX 5 — TSC + build clean:                       [ done ]
FIX 6 — Status + commit:                         [ done ]

TSC:    [ 0 errors ]
BUILD:  [ pass ]
COMMIT: [ pushed to main ]

═══════════════════════════════════════════════════════════════════
