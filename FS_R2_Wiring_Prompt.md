# FUTURE SPINNER — CLAUDE CODE SESSION: Wire R2 Assets
## Document version: 1.0 | Created: April 2026

---

## PRE-AUTHORISATIONS — ENTIRE SESSION

- ✅ Overwrite ANY file without asking
- ✅ Create ANY new file without asking
- ✅ Fix TypeScript errors autonomously
- ✅ Run build, tsc, npm, git commands without asking

**⚠ HARD LOCKS:** `rgsService.ts`, `gameStore.ts`, Math SDK files — never touch.

**Working directory:** `~/math-sdk/frontend/`
**Branch:** main

Update `~/math-sdk/FUTURE_SPINNER_PROJECT_STATUS.md` after every task and commit.

---

## STEP 0 — ORIENTATION

```bash
# Confirm all R2 assets landed correctly
ls ~/math-sdk/frontend/public/assets/frames/
ls ~/math-sdk/frontend/public/assets/ui/
ls ~/math-sdk/frontend/public/assets/sounds/

# Read the files we are modifying
cat ~/math-sdk/frontend/src/App.svelte
cat ~/math-sdk/frontend/src/lib/components/ControlBar.svelte
cat ~/math-sdk/frontend/src/lib/components/BalanceDisplay.svelte
cat ~/math-sdk/frontend/src/lib/components/WinDisplay.svelte
cat ~/math-sdk/frontend/src/lib/components/GameGrid.svelte

cd ~/math-sdk/frontend && npx tsc --noEmit 2>&1
```

Report exact filenames found in frames/ and ui/ before proceeding.

---

## TASK 1 — Wire the clean frame PNG

The CSS-only neon border is the current fallback. Replace it with the
clean ornate frame PNG which has a verified transparent centre.

In `src/App.svelte`:

**Step 1 — Swap div back to img:**
Find:
```svelte
<div class="game-frame" aria-hidden="true"></div>
```
Replace with:
```svelte
<img
  src="assets/frames/frame_clean_ornate.png"
  class="game-frame"
  alt=""
  aria-hidden="true"
/>
```

**Step 2 — Update .game-frame CSS for img tag:**
Replace the entire `.game-frame` block and `@keyframes frame-pulse` with:
```css
.grid-wrapper {
  position: relative;
  display: inline-block;
}

.game-frame {
  position: absolute;
  inset: -20px;
  width: calc(100% + 40px);
  height: calc(100% + 40px);
  object-fit: fill;
  pointer-events: none;
  z-index: 10;
  animation: frame-pulse 3s ease-in-out infinite;
}

@keyframes frame-pulse {
  0%, 100% { filter: drop-shadow(0 0 8px rgba(0,255,255,0.5)); }
  50%       { filter: drop-shadow(0 0 20px rgba(0,255,255,0.9))
                      drop-shadow(0 0 40px rgba(157,0,255,0.4)); }
}
```

Also remove the `.game-frame::before`, `.game-frame::after` pseudo-element
blocks that were added for the CSS corner accents — they don't apply to
an `<img>` element.

**Verification:** Open browser, confirm:
- All 20 symbols visible through the transparent frame centre
- Frame decorates the outside/border area only
- Frame glows with the pulse animation

Commit:
```bash
cd ~/math-sdk && git add -A
git commit -m "feat(frame): wire clean ornate frame PNG with transparent centre"
git push origin main
```

---

## TASK 2 — Fix WILD symbol white background

The WILD symbol (`wild_cyberpunk_logo_variant_04.png`) is showing a
white box around it — the PNG has a white background instead of being
transparent.

In `src/lib/components/GameGrid.svelte`, find where sprites are created
in `_makeCell`. After creating the WILD sprite, apply a multiply blend
mode or use a ColorMatrixFilter to knock out the white:

```typescript
// Special handling for WILD — remove white background
if (symbol === 'W' || symbol === 'WILD') {
  sprite.blendMode = PIXI.BLEND_MODES.MULTIPLY
}
```

If PIXI.BLEND_MODES is not imported, add it to the import:
```typescript
import { ..., BLEND_MODES } from 'pixi.js'
```

And use:
```typescript
if (symbol === 'W' || symbol === 'WILD') {
  sprite.blendMode = BLEND_MODES.MULTIPLY
}
```

Also check the scatter symbol key — in the SYMBOL_TEXTURES map, confirm
whether the Wild is keyed as `'W'`, `'WILD'`, or another key. Use the
correct key.

**Alternative if blend mode doesn't work cleanly:**
Apply a ColorMatrixFilter that removes near-white pixels:
```typescript
if (symbol === 'W' || symbol === 'WILD') {
  const cmf = new ColorMatrixFilter()
  cmf.contrast(0.1, false)
  sprite.filters = [...(sprite.filters || []), cmf]
}
```

Test in browser. The WILD symbol should show on the dark grid background
without a white box.

Commit:
```bash
cd ~/math-sdk && git add -A
git commit -m "fix(symbols): remove white background from WILD symbol"
git push origin main
```

---

## TASK 3 — Wire spin button image

In `src/lib/components/ControlBar.svelte`:

Find the spin button. It currently uses an existing image or CSS styling.
Replace the button's inner content with the new spin_button.png:

If the spin button has an `<img>` tag inside it:
```svelte
<img src="assets/ui/spin_button.png" alt="SPIN" class="spin-img" />
```

If the spin button is CSS-only, add the image as a background:
```css
.spin-btn {
  background-image: url('/assets/ui/spin_button.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  background-color: transparent;
  border: none;
  /* Keep existing width/height/hover effects */
}
```

Keep all existing hover, active, disabled CSS states — just update the
visual source. The button's click handler must not be touched.

The spin button should be 96×96px or larger. If the existing size differs,
keep it — just update the visual.

Commit:
```bash
cd ~/math-sdk && git add -A
git commit -m "feat(ui): wire spin_button.png asset"
git push origin main
```

---

## TASK 4 — Wire balance panel image

In `src/lib/components/BalanceDisplay.svelte`:

Apply `panel_balance.png` as the background of the balance/bet panel:

```css
.balance-panel {
  background-image: url('/assets/ui/panel_balance.png');
  background-size: 100% 100%;
  background-repeat: no-repeat;
  /* Remove solid background colour — keep transparent so image shows */
  background-color: transparent;
  border: none;
  box-shadow: none;
  /* Keep existing padding and dimensions */
}
```

The text labels (BALANCE, BET, USD amounts) must remain visible on top
of the panel image. Ensure text colour is white or cyan so it reads
against the dark panel background.

Commit:
```bash
cd ~/math-sdk && git add -A
git commit -m "feat(ui): wire panel_balance.png for balance display"
git push origin main
```

---

## TASK 5 — Wire win panel image + fix green win display

In `src/lib/components/WinDisplay.svelte`:

**Step 1 — Apply panel_win.png as background:**
```css
.win-panel {
  background-image: url('/assets/ui/panel_win.png');
  background-size: 100% 100%;
  background-repeat: no-repeat;
  background-color: transparent;
  border: none;
  box-shadow: none;
  outline: none;
}
```

**Step 2 — Fix remaining green.** Read the full WinDisplay CSS carefully.
Find EVERY instance of green colour (`#00cc44`, `#4eff91`, `green`,
`rgba(0,204,68,...)`, `rgba(78,255,145,...)`).

For small wins (0–1×), the amount text colour can stay green — but
NOTHING on the panel container itself should be green. Add:

```css
.win-panel,
.win-panel.win-green,
.win-panel.win-idle {
  border: none !important;
  box-shadow: none !important;
  outline: none !important;
}
```

Commit:
```bash
cd ~/math-sdk && git add -A
git commit -m "feat(ui): wire panel_win.png, fix all green on win display"
git push origin main
```

---

## TASK 6 — Wire bet +/− button images

In `src/lib/components/ControlBar.svelte`:

Find the BET − and BET + buttons. Apply the new images.

For the decrease bet button:
```css
.nudge-btn.decrease,
[class*="bet-minus"],
[aria-label*="decrease"],
[aria-label*="minus"] {
  background-image: url('/assets/ui/btn_bet_minus.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  background-color: transparent;
  border: none;
}
```

For the increase bet button:
```css
.nudge-btn.increase,
[class*="bet-plus"],
[aria-label*="increase"],
[aria-label*="plus"] {
  background-image: url('/assets/ui/btn_bet_plus.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  background-color: transparent;
  border: none;
}
```

**IMPORTANT:** Read the actual ControlBar.svelte to find the exact class
names on these buttons before applying. Use the correct selectors.

Remove any green colour from these buttons and the Buy Bonus button.
For Buy Bonus, apply `btn_menu.png` as its background:
```css
.buy-bonus-btn,
[class*="bonus"] {
  background-image: url('/assets/ui/btn_menu.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  background-color: transparent;
  border: none;
}
```

Commit:
```bash
cd ~/math-sdk && git add -A
git commit -m "feat(ui): wire btn_bet_minus/plus and btn_menu assets, remove green"
git push origin main
```

---

## TASK 7 — Replace BGM and upgrade sounds

The new `bgm_loop.mp3` is a better quality dark cyberpunk track.
The files are already in `public/assets/sounds/` (overwriting the old ones).
No code changes needed — soundService.ts already points to these paths.

Verify the files are present:
```bash
ls -lh ~/math-sdk/frontend/public/assets/sounds/
```

Confirm `bgm_loop.mp3` is ~938KB (the new higher quality version).
If it shows the old 469KB version, the copy didn't complete — run:
```bash
cp ~/Downloads/r2/future-spinner-assets-r2/public/assets/sounds/* \
   ~/math-sdk/frontend/public/assets/sounds/
```

Commit the updated sounds:
```bash
cd ~/math-sdk && git add frontend/public/assets/sounds/
git commit -m "feat(sounds): upgrade bgm, spin, win, scatter to R2 versions"
git push origin main
```

---

## TASK 8 — Final TSC + build + full status update

```bash
cd ~/math-sdk/frontend
npx tsc --noEmit 2>&1
npm run build 2>&1
```

Both must exit 0. Fix any errors autonomously.

Write the final status to `~/math-sdk/FUTURE_SPINNER_PROJECT_STATUS.md`:

```markdown
# FUTURE SPINNER — PROJECT STATUS
## Last updated: 2026-04-04 | R2 asset wiring complete

## CURRENT STATE
All R2 assets wired. Clean ornate frame PNG active with transparent centre.
WILD white background fixed. All UI panels, buttons, and win display
now using Manus-generated image assets. Green removed throughout.
Production build passing with 0 TypeScript errors.

## COMPONENT STATUS

| Component | Status | Notes |
|-----------|--------|-------|
| Math SDK | ✅ LOCKED | 96.35% RTP, 100k sim |
| rgsService.ts | ✅ LOCKED | Mock mode |
| gameStore.ts | ✅ LOCKED | |
| GameGrid.svelte | ✅ Complete | PNG sprites, WILD blend fix, blur tumble |
| LoadingScreen.svelte | ✅ Complete | Logo, rings, progress bar |
| WinDisplay.svelte | ✅ Complete | panel_win.png, no green, count-up |
| WinCelebration.svelte | ✅ Complete | small/big/mega/epic + particles |
| ControlBar.svelte | ✅ Complete | spin_button.png, btn+/−, no green |
| BalanceDisplay.svelte | ✅ Complete | panel_balance.png |
| App.svelte | ✅ Complete | frame_clean_ornate.png, video BG, mobile |
| soundService.ts | ✅ Complete | R2 sounds — better BGM/spin/win/scatter |
| translations.ts | ✅ Complete | 16 languages |
| Background video | ✅ Wired | 1000062179.mp4 at 35% opacity |
| Frame overlay | ✅ Wired | frame_clean_ornate.png — transparent centre |
| Symbol PNGs | ✅ Wired | 10 symbols, WILD white bg fixed |
| UI assets | ✅ Wired | spin_button, panels, +/− buttons |
| Sounds | ✅ Wired | R2 versions active |
| PAR Sheet | ✅ Complete | submission-package/FUTURE_SPINNER_PAR_SHEET.html |
| Submission package | ✅ Complete | Checklist + blurb |

## OUTSTANDING (manual steps only)
1. Upload artwork to Google Drive/Dropbox with public link
2. Upload dist/ + math publish files to Stake Engine portal
3. IP/trademark review — "Future Spinner" / "We Roll Spinners"
4. Test against real RGS endpoint (currently mock mode)
5. Optional: brew install --cask basictex → PDF PAR sheet

## SESSIONS LOG
| Session | Date | What was done |
|---------|------|--------------|
| R2 wiring | 2026-04-04 | Clean frame, WILD fix, all UI panels, R2 sounds |
| Emergency frame | 2026-04-04 | Removed opaque frame, CSS fallback |
| Immediate fixes | 2026-04-04 | Green→cyan, spin glow, panel styling |
| Asset wiring | 2026-04-04 | Video, sounds, frame source tags |
| Full polish | 2026-04-03 | All visual tasks, reel tumble |
| Bugfix | 2026-04-03 | Win display flicker |
| Symbol Integration | 2026-04-03 | PNG sprites, hover, count-up |

## REPOSITORY
- Repo: https://github.com/JTOSHIE/stake-game-development-claude
- Frontend: ~/math-sdk/frontend/
- Branch: main
- Last commit: [git log --oneline -1]
```

```bash
cd ~/math-sdk && git add -A
git commit -m "chore: R2 wiring complete — all assets active, status updated"
git push origin main
```

---

## COMPLETION REPORT

═══════════════════════════════════════════════════════
FUTURE SPINNER — R2 ASSET WIRING COMPLETE
═══════════════════════════════════════════════════════

TASK 1 — Clean ornate frame wired:           [ done ]
TASK 2 — WILD white background fixed:        [ done ]
TASK 3 — Spin button image wired:            [ done ]
TASK 4 — Balance panel image wired:          [ done ]
TASK 5 — Win panel + green fixed:            [ done ]
TASK 6 — Bet +/− buttons + Buy Bonus:        [ done ]
TASK 7 — R2 sounds active:                   [ done ]
TASK 8 — Build passing:                      [ done ]

TSC:    [ 0 errors ]
BUILD:  [ pass ]
COMMIT: [ pushed to main ]

═══════════════════════════════════════════════════════
