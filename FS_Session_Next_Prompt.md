# FUTURE SPINNER — CLAUDE CODE SESSION: Symbol Integration + Visual Polish (Tasks 1–3)
## We Roll Spinners | Stake Engine | Cyberpunk Slot Game
### Document version: 1.0 | Created: April 2026

---

## PRE-AUTHORISATIONS — READ FIRST, APPLY FOR THE ENTIRE SESSION

All of the following are pre-authorised. Do not stop or ask for confirmation on any of them at any point during this session:

- ✅ Overwrite ANY existing file without asking
- ✅ Create ANY new file without asking
- ✅ Run `npm install` for any package without asking
- ✅ Run `git add`, `git commit`, `git push` without asking
- ✅ Fix TypeScript errors autonomously without asking
- ✅ Continue past any build warning without asking
- ✅ Run `npm run build` and `npm run dev` without asking
- ✅ Update any component, style, or content without asking

**⚠ HARD LOCKS — never modify these under any circumstances:**
- Anything inside `~/math-sdk/games/future_spinner/` (Math SDK — LOCKED)
- `~/math-sdk/frontend/public/lookUpTable_base.csv` (Math data — READ ONLY)
- `~/math-sdk/library/publish_files/` (books, LUT, index.json — LOCKED)
- `FUTURE_SPINNER_PAR_SHEET.md` (LOCKED)
- `rgsService.ts` — do not touch during symbol or visual tasks
- `gameStore.ts` — do not touch during symbol tasks (only permitted in Task 4)

**Currency rule — mandatory, no exceptions:**
```typescript
// ONLY correct method — Integer Micros
const wagerMicros = Math.floor(wagerDollars * 1_000_000);
const winMicros   = Math.floor((wagerMicros * csvPayout) / 100);
const winDollars  = winMicros / 1_000_000; // display only — never do arithmetic on this
// NEVER: const win = wagerDollars * multiplier;
```

**Working directory:** `~/math-sdk/frontend/`
**Repo:** https://github.com/JTOSHIE/stake-game-development-claude
**Branch:** main

Execute every task below in order without stopping. If an error occurs, fix it autonomously and continue. Apply the Three-Strike Rule: if the same error persists after 3 attempts, stop and report the exact error state — do not attempt a 4th fix.

---

## STEP 0 — ORIENTATION (run this before touching anything)

```bash
# Read project state
cat ~/math-sdk/frontend/CLAUDE.md

# Confirm what symbol PNGs actually exist on disk
ls -la ~/math-sdk/frontend/public/assets/symbols/
ls -la ~/math-sdk/frontend/public/assets/frames/
ls -la ~/math-sdk/frontend/public/assets/videos/

# Read the current GameGrid.svelte to understand the existing _makeCell implementation
cat ~/math-sdk/frontend/src/lib/components/GameGrid.svelte

# TypeScript baseline — confirm starting state
cd ~/math-sdk/frontend
npx tsc --noEmit 2>&1
```

Report what you find:
- Which PNG files exist in `public/assets/symbols/` and their exact filenames
- Whether TypeScript passes clean (0 errors) before any changes
- The current `_makeCell` / placeholder rendering approach in `GameGrid.svelte`

---

## TASK 1 — Symbol Integration (GameGrid.svelte only)

**What this does:** Replaces the coloured rectangle placeholders in the PixiJS grid with the real cyberpunk PNG symbol sprites.

**File to modify:** `~/math-sdk/frontend/src/lib/components/GameGrid.svelte` ONLY.

### Symbol code → PNG filename map:

| Symbol Code | PNG Filename | Description |
|-------------|--------------|-------------|
| H1 | H1.png | Spinning Rim (High tier) |
| H2 | H2.png | Turbocharger (High tier) |
| M1 | M1.png | Car Grille (Medium tier) |
| M2 | M2.png | Exhaust Pipe (Medium tier) |
| M3 | M3.png | Hubcap (Medium tier) |
| L1 | L1.png | Dice (Low tier) |
| L2 | L2.png | Neon Sign (Low tier) |
| S  | S.png  | Scatter / Wild (Special) |

### Implementation requirements:

1. **Preload all assets on mount** using PixiJS v7 asset loader:
   ```typescript
   const SYMBOL_ASSETS: Record<string, string> = {
     H1: 'assets/symbols/H1.png',
     H2: 'assets/symbols/H2.png',
     M1: 'assets/symbols/M1.png',
     M2: 'assets/symbols/M2.png',
     M3: 'assets/symbols/M3.png',
     L1: 'assets/symbols/L1.png',
     L2: 'assets/symbols/L2.png',
     S:  'assets/symbols/S.png',
   };
   // Preload: await PIXI.Assets.load(Object.values(SYMBOL_ASSETS))
   ```

2. **Show the LoadingScreen** while assets are loading. Track progress 0–100% and pass it to the loading component.

3. **Replace placeholder Graphics** with `PIXI.Sprite`:
   ```typescript
   const texture = PIXI.Texture.from(SYMBOL_ASSETS[symbolCode]);
   const sprite = new PIXI.Sprite(texture);
   sprite.width = 128;   // fits within 140px cell with 6px padding each side
   sprite.height = 128;
   sprite.anchor.set(0.5); // centre anchor for animations
   ```

4. **Fallback handling:** If an asset fails to load, fall back to the coloured rectangle placeholder and log the error to console. Do not crash.

5. **Win highlighting update:** Replace the gold tint approach with:
   - Winning symbols: scale up to 1.1× over 200ms
   - Add white flash (alpha 0.6) then fade out over 300ms
   - Non-winning symbols: dim to 0.4 alpha

6. **Apply cyberpunk visual treatments:**
   - Add a `ColorMatrixFilter` to saturate all symbols by 20%
   - S (Scatter/Wild) symbol: apply a pulsing cyan/magenta glow using `PIXI.Ticker` (alpha between 0.6 and 1.0 over 1.5s loop)

7. **Cell sizing:** Each cell is 140×140px (700px wide ÷ 5 columns, 560px tall ÷ 4 rows). Sprite is 128×128px centred within the cell.

### Verification:
```bash
cd ~/math-sdk/frontend
npm run dev
# Open http://localhost:5174/ and confirm:
# - All 20 cells (5 columns × 4 rows) show symbol images
# - No broken image placeholders (coloured boxes appearing means PNG not found)
# - Scatter/Wild symbol has a pulsing glow
# - Loading screen appears briefly while assets load
# Ctrl+C to stop dev server
```

---

## TASK 2 — Button Hover Effects (App.svelte styles)

**What this does:** Adds cyberpunk hover states to all interactive buttons so they feel tactile and responsive.

**File to modify:** `~/math-sdk/frontend/src/App.svelte` (styles section only — do not change script or template logic).

### Requirements:

Apply these hover styles to the relevant button elements. Use CSS transitions — no JavaScript required.

**SPIN button (primary CTA):**
```css
.spin-button {
  transition: all 0.15s ease;
}
.spin-button:hover:not(:disabled) {
  transform: scale(1.04);
  box-shadow: 0 0 20px rgba(255, 0, 255, 0.7), 0 0 40px rgba(255, 0, 255, 0.3);
  filter: brightness(1.15);
}
.spin-button:active:not(:disabled) {
  transform: scale(0.97);
  transition-duration: 0.05s;
}
```

**BET + / BET − buttons:**
```css
.bet-button {
  transition: all 0.15s ease;
}
.bet-button:hover:not(:disabled) {
  transform: scale(1.06);
  box-shadow: 0 0 12px rgba(0, 255, 255, 0.5);
  color: #00ffff;
  border-color: #00ffff;
}
.bet-button:active:not(:disabled) {
  transform: scale(0.95);
  transition-duration: 0.05s;
}
```

**Any other buttons (info, settings, etc.):**
```css
.ui-button {
  transition: all 0.15s ease;
}
.ui-button:hover:not(:disabled) {
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.4);
  filter: brightness(1.1);
}
```

**Disabled state — all buttons:**
```css
button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  filter: grayscale(0.4);
}
```

Adapt the selectors to match the actual class names in App.svelte. If the existing selectors differ, use the existing ones — do not rename elements.

### Verification:
```bash
cd ~/math-sdk/frontend && npm run dev
# Open http://localhost:5174/
# Manually hover and click each button type — confirm:
# - SPIN button scales up and glows magenta on hover
# - BET buttons glow cyan on hover
# - Disabled state is visually obvious
# Ctrl+C to stop
```

---

## TASK 3 — Animated Win Count-up + Colour Coding (WinDisplay.svelte)

**What this does:** When a spin results in a win, the win amount counts up from 0 to the final value over 600ms, colour-coded by win size.

**File to modify:** `~/math-sdk/frontend/src/lib/components/WinDisplay.svelte`

### Requirements:

1. **Read `lastWin` from `gameStore`** (already connected — do not change the store).

2. **When `lastWin` changes to a non-zero value**, trigger the count-up animation:
   - Start from 0
   - Animate to the `lastWin` value over **600ms**
   - Use `requestAnimationFrame` — not `setInterval`
   - Easing: ease-out (fast start, slow finish)

3. **Colour coding by win size** (win size = `lastWin / currentBet` multiplier):
   ```
   0:          Hidden / invisible — display: none
   0× – 1×:   Green   #00cc44  — no glow
   1× – 10×:  Gold    #ffcc00  — mild glow: 0 0 8px rgba(255, 204, 0, 0.5)
   10× – 49×: Magenta #ff00ff  — strong pulse glow + "BIG WIN!" label above
   50×+:       Cyan    #00ffff  — intense pulse glow + "MEGA WIN!" label above
   ```

4. **"BIG WIN!" / "MEGA WIN!" labels:**
   - Appear above the win amount with a scale-in animation (0.3s, spring-like overshoot)
   - Font: bold, monospace, all caps
   - BIG WIN: magenta, text-shadow `0 0 20px #ff00ff`
   - MEGA WIN: cyan, text-shadow `0 0 30px #00ffff`

5. **Pulse glow animation** (for BIG WIN and MEGA WIN):
   - `@keyframes pulse-glow` cycling the text-shadow blur from 10px to 25px and back, 1.2s infinite

6. **Display format:** Show the win amount as a dollar value to 2 decimal places (e.g. `$12.50`). Read the currency symbol from a `currencySymbol` prop (default `'$'`).

7. **When `lastWin` is 0 or null**, the entire component is hidden (`display: none` or `visibility: hidden`).

Complete example structure:
```svelte
<script lang="ts">
  import { lastWin, currentBet } from '../stores/gameStore';
  import { onDestroy } from 'svelte';

  export let currencySymbol = '$';

  let displayValue = 0;
  let animFrame: number;

  // Reactive: watch lastWin and trigger count-up
  $: if ($lastWin > 0) {
    startCountUp($lastWin);
  } else {
    displayValue = 0;
  }

  // Derive multiplier for colour coding
  $: multiplier = $currentBet > 0 ? $lastWin / $currentBet : 0;
  $: winTier = multiplier >= 50 ? 'mega'
             : multiplier >= 10 ? 'big'
             : multiplier >= 1  ? 'gold'
             : multiplier > 0   ? 'green'
             : 'none';

  function startCountUp(target: number) {
    cancelAnimationFrame(animFrame);
    const start = performance.now();
    const duration = 600;
    const from = 0;

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      displayValue = from + (target - from) * eased;
      if (progress < 1) animFrame = requestAnimationFrame(tick);
      else displayValue = target;
    }

    animFrame = requestAnimationFrame(tick);
  }

  onDestroy(() => cancelAnimationFrame(animFrame));
</script>

{#if winTier !== 'none'}
  <div class="win-display win-{winTier}">
    {#if winTier === 'mega'}
      <div class="win-label mega">MEGA WIN!</div>
    {:else if winTier === 'big'}
      <div class="win-label big">BIG WIN!</div>
    {/if}
    <div class="win-amount">
      {currencySymbol}{displayValue.toFixed(2)}
    </div>
  </div>
{/if}

<style>
  .win-display {
    text-align: center;
    font-family: 'Courier New', monospace;
    font-weight: 900;
  }

  .win-amount {
    font-size: 2rem;
    transition: color 0.2s;
  }

  .win-green .win-amount  { color: #00cc44; }
  .win-gold .win-amount   { color: #ffcc00; text-shadow: 0 0 8px rgba(255,204,0,0.5); }
  .win-big .win-amount    { color: #ff00ff; text-shadow: 0 0 15px #ff00ff; animation: pulse-glow 1.2s infinite; }
  .win-mega .win-amount   { color: #00ffff; text-shadow: 0 0 20px #00ffff; animation: pulse-glow 1.2s infinite; }

  .win-label {
    font-size: 1.2rem;
    font-weight: 900;
    letter-spacing: 0.1em;
    animation: label-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  }
  .win-label.big  { color: #ff00ff; text-shadow: 0 0 20px #ff00ff; }
  .win-label.mega { color: #00ffff; text-shadow: 0 0 30px #00ffff; }

  @keyframes pulse-glow {
    0%, 100% { text-shadow: 0 0 10px currentColor; }
    50%       { text-shadow: 0 0 25px currentColor, 0 0 50px currentColor; }
  }

  @keyframes label-in {
    from { transform: scale(0.5); opacity: 0; }
    to   { transform: scale(1);   opacity: 1; }
  }
</style>
```

Adapt to match the actual store variable names in the project. If `lastWin` or `currentBet` use different names, use the correct names from `gameStore.ts`.

### Verification:
```bash
cd ~/math-sdk/frontend && npm run dev
# Open http://localhost:5174/
# Click SPIN several times in mock mode — verify:
# - Win amount counts up from 0 when a winning spin occurs
# - Colour changes correctly based on win size
# - BIG WIN / MEGA WIN labels appear for large wins
# - Component is hidden when lastWin = 0
# Ctrl+C to stop
```

---

## TYPESCRIPT CHECK

```bash
cd ~/math-sdk/frontend
npx tsc --noEmit 2>&1
```

Must exit with **0 errors**. Fix any errors autonomously before proceeding to build.

---

## BUILD CHECK

```bash
cd ~/math-sdk/frontend
npm run build 2>&1
```

Must complete with **0 errors**. Fix any errors autonomously.

---

## COMMIT AND PUSH

```bash
cd ~/math-sdk
git add -A
git commit -m "feat(frontend): symbol PNGs wired, hover effects, win count-up animation"
git push origin main
```

---

## UPDATE STATUS DOCUMENT

Update `~/math-sdk/FUTURE_SPINNER_PROJECT_STATUS.md`:

Change these lines:
- `GameGrid.svelte` → `✅ Complete` — Real PNG symbols rendering, loading screen, cyberpunk glow
- `Symbol PNGs` → `✅ Connected` — All 8 PNGs wired via PIXI.Sprite
- Add to Sessions Log: today's date, "Symbol integration, button hover effects, win count-up animation"
- Update "Last updated" date and session number

---

## COMPLETION REPORT

Print this exactly when all tasks are done:

═══════════════════════════════════════════════════
FUTURE SPINNER — SYMBOL INTEGRATION SESSION COMPLETE
═══════════════════════════════════════════════════

TASK 1 — Symbol Integration (GameGrid.svelte):  [ done ]
TASK 2 — Button Hover Effects (App.svelte):     [ done ]
TASK 3 — Win Count-up Animation (WinDisplay):   [ done ]

TSC CHECK:   [ 0 errors ]
BUILD:       [ pass ]
COMMIT:      [ pushed to main ]
DEV SERVER:  http://localhost:5174/

NEXT SESSION: Visual Polish Tasks 4–6
  → Loading screen logo + progress bar (LoadingScreen.svelte)
  → Cyberpunk frame image integration (App.svelte)
  → Animated background video (App.svelte)

═══════════════════════════════════════════════════
