# FUTURE SPINNER — CLAUDE CODE: Emergency Frame Fix
## Document version: 1.0 | Created: April 2026

---

## PRE-AUTHORISATIONS
- ✅ Overwrite ANY file without asking
- ✅ Fix TypeScript errors autonomously
- ✅ Run build, tsc, git commands without asking

**Working directory:** `~/math-sdk/frontend/`

---

## THE PROBLEM

The frame PNG (`1000062175.png`) has a non-transparent centre — it is
covering the PixiJS canvas completely. The game grid is invisible.

The frame image itself cannot be fixed in code — its centre pixels are
not transparent. We need to wait for Manus to deliver a clean frame.

Until the new clean frame arrives from Manus, remove the frame image
entirely and replace it with a pure CSS neon border effect that looks
good and does NOT block the game grid.

---

## TASK 1 — Remove frame image, replace with CSS-only border

In `src/App.svelte`:

**Step 1 — Remove the img tag entirely:**

Find:
```svelte
<div class="grid-wrapper">
  <GameGrid bind:this={gridRef} />
  <img
    src="assets/frames/1000062175.png"
    class="game-frame"
    alt=""
    aria-hidden="true"
  />
</div>
```

Replace with:
```svelte
<div class="grid-wrapper">
  <GameGrid bind:this={gridRef} />
  <div class="game-frame" aria-hidden="true"></div>
</div>
```

**Step 2 — Replace the .game-frame CSS with a pure CSS neon border:**

Find and replace the entire `.game-frame` CSS block and its keyframe
with:

```css
.grid-wrapper {
  position: relative;
  display: inline-block;
}

.game-frame {
  position: absolute;
  inset: -12px;
  pointer-events: none;
  z-index: 10;
  border-radius: 16px;
  /* Layered neon border — cyan inner, magenta outer */
  border: 3px solid rgba(0, 255, 255, 0.7);
  box-shadow:
    0 0 0 1px rgba(255, 0, 255, 0.3),
    0 0 20px rgba(0, 255, 255, 0.5),
    0 0 40px rgba(0, 255, 255, 0.2),
    0 0 80px rgba(157, 0, 255, 0.15),
    inset 0 0 20px rgba(0, 255, 255, 0.05);
  animation: frame-pulse 3s ease-in-out infinite;
}

/* Corner accent markers */
.game-frame::before,
.game-frame::after {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  border-color: #00ffff;
  border-style: solid;
  opacity: 0.8;
}

.game-frame::before {
  top: -3px;
  left: -3px;
  border-width: 3px 0 0 3px;
  border-radius: 4px 0 0 0;
}

.game-frame::after {
  bottom: -3px;
  right: -3px;
  border-width: 0 3px 3px 0;
  border-radius: 0 0 4px 0;
}

@keyframes frame-pulse {
  0%, 100% {
    border-color: rgba(0, 255, 255, 0.6);
    box-shadow:
      0 0 0 1px rgba(255, 0, 255, 0.2),
      0 0 15px rgba(0, 255, 255, 0.4),
      0 0 30px rgba(0, 255, 255, 0.15),
      inset 0 0 15px rgba(0, 255, 255, 0.03);
  }
  50% {
    border-color: rgba(0, 255, 255, 0.95);
    box-shadow:
      0 0 0 1px rgba(255, 0, 255, 0.5),
      0 0 25px rgba(0, 255, 255, 0.7),
      0 0 60px rgba(0, 255, 255, 0.3),
      0 0 100px rgba(157, 0, 255, 0.2),
      inset 0 0 25px rgba(0, 255, 255, 0.08);
  }
}
```

This CSS frame:
- Has NO image — cannot block the game grid
- Uses layered box-shadow for depth and glow
- Pulses between cyan/magenta
- Has corner accent markers
- Sits OUTSIDE the canvas (inset: -12px extends beyond the canvas edge)

---

## TASK 2 — Verify game grid is fully visible

Run the dev server and confirm:

```bash
cd ~/math-sdk/frontend && npm run dev
```

Open http://localhost:5173/ and confirm:
- All 20 symbol cells (5×4 grid) are visible
- No image is blocking the grid
- The neon border glows around the outside of the grid
- Background video is visible behind the game

---

## TASK 3 — TSC + build + commit

```bash
cd ~/math-sdk/frontend && npx tsc --noEmit 2>&1
npm run build 2>&1
```

```bash
cd ~/math-sdk
git add -A
git commit -m "fix(frame): remove opaque frame PNG, replace with CSS neon border until clean frame delivered"
git push origin main
```

Update `~/math-sdk/FUTURE_SPINNER_PROJECT_STATUS.md`:
- Frame overlay: CSS-only neon border (Manus clean frame PNG pending)

---

## COMPLETION REPORT

═══════════════════════════════════════════════════
FUTURE SPINNER — EMERGENCY FRAME FIX COMPLETE
═══════════════════════════════════════════════════

Frame image removed — CSS neon border active: [ done ]
Game grid fully visible:                      [ done ]
TSC:                                          [ 0 errors ]
BUILD:                                        [ pass ]
COMMIT:                                       [ pushed ]

WAITING ON MANUS: clean frame PNG with
transparent centre → will wire in next session

═══════════════════════════════════════════════════
