# FUTURE SPINNER — CLAUDE CODE SESSION: Immediate Visual Fixes
## Document version: 1.0 | Created: April 2026

---

## PRE-AUTHORISATIONS — READ FIRST, APPLY FOR THE ENTIRE SESSION

- ✅ Overwrite ANY existing file without asking
- ✅ Create ANY new file without asking
- ✅ Fix TypeScript errors autonomously without asking
- ✅ Run `npm run build`, `npx tsc --noEmit`, `npm run dev` without asking
- ✅ Run `git add`, `git commit`, `git push` without asking

**⚠ HARD LOCKS — never modify:**
- `~/math-sdk/games/future_spinner/` (Math SDK)
- `~/math-sdk/frontend/public/lookUpTable_base.csv`
- `rgsService.ts`
- `gameStore.ts`

**Working directory:** `~/math-sdk/frontend/`
**Branch:** main

Execute every task in order without stopping. Three-Strike Rule applies.
Update `~/math-sdk/FUTURE_SPINNER_PROJECT_STATUS.md` after every task and commit.

---

## STEP 0 — ORIENTATION

```bash
# Read current App.svelte and WinDisplay in full
cat ~/math-sdk/frontend/src/App.svelte
cat ~/math-sdk/frontend/src/lib/components/WinDisplay.svelte
cat ~/math-sdk/frontend/src/lib/components/ControlBar.svelte
cat ~/math-sdk/frontend/src/lib/components/GameGrid.svelte

# Check what frame files exist
ls -la ~/math-sdk/frontend/public/assets/frames/

# Check symbol files
ls ~/math-sdk/frontend/public/assets/symbols/

# TSC baseline
cd ~/math-sdk/frontend && npx tsc --noEmit 2>&1
```

---

## TASK 1 — Switch frame to minimal variant + fix grid visibility

**Problem:** The current frame `1000062174.png` has "WIN" text baked into
all four sides and is cropping the grid so only 2 rows show instead of 4.

**Fix Part A — Switch to the minimal frame:**

In `App.svelte`, find the frame img tag and change to `1000062175.png`:
```svelte
<img
  src="assets/frames/1000062175.png"
  class="game-frame"
  alt=""
  aria-hidden="true"
/>
```

**Fix Part B — Fix grid-wrapper so frame does not crop the grid:**

The `.grid-wrapper` and `.game-frame` CSS must NOT constrain the height
of the PixiJS canvas. Read the current CSS and fix it so the frame image
overlays the full canvas area without clipping:

```css
.grid-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.game-frame {
  position: absolute;
  inset: -8px;          /* extend slightly beyond the canvas edge */
  width: calc(100% + 16px);
  height: calc(100% + 16px);
  object-fit: fill;
  pointer-events: none;
  z-index: 10;
  animation: frame-glow 3s ease-in-out infinite;
}

@keyframes frame-glow {
  0%, 100% { filter: drop-shadow(0 0 6px rgba(0,255,255,0.4)); }
  50%       { filter: drop-shadow(0 0 20px rgba(0,255,255,0.9)); }
}
```

**Verification:** All 4 rows of symbols (20 cells total) must be visible
with no cropping. The frame must sit around the grid, not over it.

Commit:
```bash
cd ~/math-sdk && git add -A && git commit -m "fix(frame): switch to minimal frame, fix grid visibility" && git push origin main
```

---

## TASK 2 — Fix all green borders and glows

**Problem:** Several UI elements have bright green borders/glows that
clash with the cyberpunk theme. These need to be identified and removed.

Read `App.svelte`, `WinDisplay.svelte`, and `ControlBar.svelte` and
find every instance of green colour. Green appears as:
- `#00ff00`, `#00cc00`, `#4eff91`, `green`, `lime`
- `rgba(0, 255, 0, ...)`, `rgba(78, 255, 145, ...)`
- Any `border-color`, `box-shadow`, `outline`, or `color` that produces
  a green visual on a container/panel (not on small win text — that
  can stay green as a colour tier indicator)

**Specific elements to fix:**

1. **Win display panel** (USD 3.20 box, top-right area) — the entire
   panel container must have NO green border or box-shadow. Only the
   amount text inside changes colour. Set on the panel:
   ```css
   border: none;
   box-shadow: none;
   outline: none;
   background: transparent;
   ```

2. **BET button / bet selector** (bottom-left, shows "BET USD 1.00") —
   remove any green border. Replace with either no border or a subtle
   cyan border: `border: 1px solid rgba(0,255,255,0.3)`.

3. **Buy Bonus button** — remove green hexagon styling. Replace with
   cyberpunk styling: dark background, cyan or magenta border glow.

4. **Any other element** with green that you find — remove or replace
   with cyan `#00ffff` or magenta `#ff00ff`.

After fixing, verify in browser: no element should have a green border,
background, or glow. The only green allowed is the small win amount text.

Commit:
```bash
cd ~/math-sdk && git add -A && git commit -m "fix(ui): remove all green borders, replace with cyberpunk colours" && git push origin main
```

---

## TASK 3 — Fix broken symbol (top-left missing image)

**Problem:** Top-left cell shows a broken image placeholder (white square).
One symbol is failing to load.

In `GameGrid.svelte`, read the `SYMBOL_TEXTURES` map and the
`_preloadTextures` function. Add a console.log to identify which symbol
is failing:

```typescript
async function _preloadTextures(): Promise<void> {
  const urls = Object.values(SYMBOL_TEXTURES)
  assetLoadProgress.set(0)
  try {
    await Assets.load(urls, (progress: number) => {
      assetLoadProgress.set(Math.round(progress * 100))
    })
  } catch (err) {
    console.warn('[GameGrid] Texture load error:', err)
    // Log each texture individually to find the broken one
    for (const [key, url] of Object.entries(SYMBOL_TEXTURES)) {
      try {
        await Assets.load(url)
        console.log(`[GameGrid] ✅ ${key}: ${url}`)
      } catch (e) {
        console.error(`[GameGrid] ❌ FAILED: ${key}: ${url}`, e)
      }
    }
  }
  assetLoadProgress.set(100)
}
```

Also check the actual files on disk match the SYMBOL_TEXTURES map:
```bash
ls ~/math-sdk/frontend/public/assets/symbols/
```

If any filename in SYMBOL_TEXTURES does not match a file on disk,
correct the filename in SYMBOL_TEXTURES to match what actually exists.

The fallback placeholder (coloured rectangle) must show for any missing
texture — no white broken image icon should ever appear.

Commit:
```bash
cd ~/math-sdk && git add -A && git commit -m "fix(symbols): resolve broken texture, fix fallback" && git push origin main
```

---

## TASK 4 — Improve spin button styling

**Problem:** The spin button is a plain grey circle with "SPIN" text —
no cyberpunk treatment.

In `ControlBar.svelte`, find the spin button element. Apply cyberpunk
styling while keeping it fully functional:

```css
.spin-btn {
  /* Cyberpunk spin button */
  background: radial-gradient(circle at 40% 35%,
    rgba(0, 255, 255, 0.15) 0%,
    rgba(157, 0, 255, 0.3) 50%,
    rgba(0, 0, 0, 0.8) 100%
  );
  border: 2px solid rgba(0, 255, 255, 0.6);
  box-shadow:
    0 0 20px rgba(0, 255, 255, 0.4),
    0 0 40px rgba(0, 255, 255, 0.2),
    inset 0 0 20px rgba(0, 255, 255, 0.1);
  color: #00ffff;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.8);
  letter-spacing: 0.15em;
  font-weight: 900;
  font-family: 'Courier New', monospace;
  transition: all 0.15s ease;
}

.spin-btn:hover:not(:disabled) {
  border-color: rgba(255, 0, 255, 0.8);
  box-shadow:
    0 0 30px rgba(255, 0, 255, 0.6),
    0 0 60px rgba(255, 0, 255, 0.3),
    inset 0 0 20px rgba(255, 0, 255, 0.15);
  color: #ff00ff;
  text-shadow: 0 0 15px rgba(255, 0, 255, 0.9);
  transform: scale(1.05);
}

.spin-btn:active:not(:disabled) {
  transform: scale(0.96);
  transition-duration: 0.05s;
}

.spin-btn:disabled {
  opacity: 0.4;
  filter: grayscale(0.6);
  cursor: not-allowed;
}
```

Adapt selectors to match the actual class names on the spin button in
ControlBar.svelte. Do not change the button's click handler or any logic.

Commit:
```bash
cd ~/math-sdk && git add -A && git commit -m "feat(ui): cyberpunk spin button styling" && git push origin main
```

---

## TASK 5 — Improve balance/bet/win panel styling

**Problem:** The balance and bet panels look basic and mismatched.
The win display panel needs to match the cyberpunk aesthetic.

**Balance/Bet panel** (in `BalanceDisplay.svelte`):
Replace any plain styling with:
```css
.balance-panel {
  background: linear-gradient(135deg,
    rgba(0, 0, 0, 0.8) 0%,
    rgba(10, 10, 30, 0.9) 100%
  );
  border: 1px solid rgba(0, 255, 255, 0.3);
  box-shadow:
    0 0 10px rgba(0, 255, 255, 0.2),
    inset 0 0 10px rgba(0, 0, 0, 0.5);
  border-radius: 8px;
  padding: 8px 16px;
}

.label {
  color: rgba(0, 255, 255, 0.6);
  font-size: 0.6rem;
  letter-spacing: 0.2em;
  font-family: 'Courier New', monospace;
}

.value {
  color: #ffffff;
  font-size: 1rem;
  font-weight: 700;
  font-family: 'Courier New', monospace;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.4);
}
```

**Win display panel** (in `WinDisplay.svelte`):
The win panel background-image (if it has one) should be kept.
If it has a plain background, replace with:
```css
.win-panel {
  background: linear-gradient(135deg,
    rgba(0, 0, 0, 0.85) 0%,
    rgba(20, 0, 40, 0.9) 100%
  );
  border: 1px solid rgba(157, 0, 255, 0.4);
  box-shadow: 0 0 12px rgba(157, 0, 255, 0.3);
  border-radius: 8px;
  padding: 8px 16px;
  /* Remove ALL green — explicitly */
  outline: none;
}
```

Adapt all selectors to match what actually exists in each file.
Do not remove the background-image if one exists — only add/override
border and box-shadow properties.

Commit:
```bash
cd ~/math-sdk && git add -A && git commit -m "feat(ui): cyberpunk panel styling for balance, bet, win display" && git push origin main
```

---

## TASK 6 — Final TSC + build + status doc update

```bash
cd ~/math-sdk/frontend
npx tsc --noEmit 2>&1
npm run build 2>&1
```

Both must exit 0. Fix any errors autonomously.

Update `~/math-sdk/FUTURE_SPINNER_PROJECT_STATUS.md` with full current state.

```bash
cd ~/math-sdk
git add -A
git commit -m "chore: immediate fixes complete — frame, green borders, symbols, UI polish"
git push origin main
```

---

## COMPLETION REPORT

Print when done:

═══════════════════════════════════════════════════
FUTURE SPINNER — IMMEDIATE FIXES COMPLETE
═══════════════════════════════════════════════════

TASK 1 — Frame switched + grid fully visible:   [ done ]
TASK 2 — All green borders removed:             [ done ]
TASK 3 — Broken symbol fixed:                   [ done ]
TASK 4 — Spin button cyberpunk styled:          [ done ]
TASK 5 — Balance/bet/win panels styled:         [ done ]
TASK 6 — Build passing:                         [ done ]

TSC:    [ 0 errors ]
BUILD:  [ pass ]
COMMIT: [ pushed to main ]

NOTE: New assets from Manus incoming — frame PNG,
UI panel images, spin button image. Next session
will wire those in once delivered.

═══════════════════════════════════════════════════
