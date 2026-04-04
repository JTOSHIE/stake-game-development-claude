# FUTURE SPINNER — UI LAYOUT POLISH SESSION
## Read this file and execute all tasks in order without stopping.
## April 2026

---

## PRE-AUTHORISATIONS
- ✅ Overwrite ANY file without asking
- ✅ Fix TypeScript errors autonomously
- ✅ Run build, tsc, npm, git without asking
**HARD LOCKS:** rgsService.ts, gameStore.ts, Math SDK — never touch.
**Working directory:** ~/math-sdk/frontend/

---

## STEP 0 — READ BEFORE TOUCHING

```bash
cat ~/math-sdk/frontend/src/App.svelte
cat ~/math-sdk/frontend/src/lib/components/ControlBar.svelte
cat ~/math-sdk/frontend/src/lib/components/WinDisplay.svelte
cd ~/math-sdk/frontend && npx tsc --noEmit 2>&1
```

---

## TASK 1 — Header: Style "FUTURE SPINNER" as a logo treatment

The header currently shows plain yellow text. Make it look premium.

In `src/App.svelte`, find the `.game-header` section containing
"FUTURE SPINNER" and "WE ROLL SPINNERS". Update the CSS:

```css
.game-title {
  font-family: 'Courier New', 'Orbitron', monospace;
  font-size: clamp(1.6rem, 4vw, 2.4rem);
  font-weight: 900;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  /* Gradient text: gold to cyan */
  background: linear-gradient(90deg, #FFD700 0%, #00FFFF 50%, #FFD700 100%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  /* Glow effect via filter */
  filter: drop-shadow(0 0 8px rgba(0, 255, 255, 0.6))
          drop-shadow(0 0 20px rgba(255, 215, 0, 0.3));
  /* Shimmer animation */
  animation: title-shimmer 4s linear infinite;
  margin: 0;
  padding: 0;
}

@keyframes title-shimmer {
  0%   { background-position: 0% center; }
  100% { background-position: 200% center; }
}

.game-subtitle {
  font-family: 'Courier New', monospace;
  font-size: clamp(0.55rem, 1.5vw, 0.75rem);
  letter-spacing: 0.4em;
  text-transform: uppercase;
  color: rgba(0, 255, 255, 0.6);
  margin: 2px 0 0 0;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.4);
}
```

Find the actual class names for the title and subtitle in App.svelte
and apply to them. If they are just `<h1>` and `<p>` elements without
classes, add the classes first.

Commit:
```bash
cd ~/math-sdk && git add -A
git commit -m "feat(ui): logo treatment for FUTURE SPINNER header"
git push origin main
```

---

## TASK 2 — Fix Win display text colour (remove green)

The win amount (USD 0.80) is showing in bright green. For small wins
this might be intentional but it clashes. All win amount text should
use gold/cyan theming, not green.

In `src/lib/components/WinDisplay.svelte`:

Find the `.win-amount` colour for the small win tier and update:

```css
/* Small win — was green, now soft gold */
.win-green .win-amount {
  color: #ffd700;
  text-shadow: 0 0 8px rgba(255, 215, 0, 0.5);
}

/* Gold tier */
.win-gold .win-amount {
  color: #ffcc00;
  text-shadow: 0 0 12px rgba(255, 204, 0, 0.7);
}

/* Big win — magenta */
.win-big .win-amount {
  color: #ff00ff;
  text-shadow: 0 0 15px rgba(255, 0, 255, 0.8);
}

/* Mega win — cyan */
.win-mega .win-amount {
  color: #00ffff;
  text-shadow: 0 0 20px rgba(0, 255, 255, 0.9);
}
```

Commit:
```bash
cd ~/math-sdk && git add -A
git commit -m "fix(ui): win amount text gold/cyan theme, remove green"
git push origin main
```

---

## TASK 3 — Increase bet +/− button sizes

The − and + buttons are too small. Read ControlBar.svelte and find the
`.nudge-btn` CSS. Increase the minimum tap target and visual size:

```css
.nudge-btn {
  min-width: 52px;    /* was 44px */
  min-height: 52px;   /* was 44px */
  width: 52px;
  height: 52px;
  /* Keep existing background-image, background-size, etc. */
}
```

Also ensure the bet cluster is centred, not left-biased. Find the
`.bet-cluster` and add:
```css
.bet-cluster {
  align-items: center;
  justify-content: center;
}
```

And ensure the nudge row containing − display + is also centred:
```css
.nudge-row,
.bet-nudge-row,
[class*="nudge-row"] {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
```

Use actual class names from the file.

Commit:
```bash
cd ~/math-sdk && git add -A
git commit -m "feat(ui): increase bet +/- button size, centre bet cluster"
git push origin main
```

---

## TASK 4 — Fix Max Bet button (bigger, add label)

The MAX BET button is a tiny circle with no label. It needs to be
bigger and clearly labelled.

In ControlBar.svelte, find the `.maxbet-btn` element. Update the
template to include a label:

```svelte
<button class="maxbet-btn" on:click={handleMaxBet} ...>
  <img src="/assets/symbols/..." ... />
  <span class="maxbet-label">MAX</span>
</button>
```

Add CSS:
```css
.maxbet-btn {
  width: 56px;        /* was ~48px */
  height: 56px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  filter: drop-shadow(0 0 6px rgba(0, 255, 255, 0.35));
}

.maxbet-label {
  font-size: 0.5rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  color: rgba(0, 255, 255, 0.8);
  font-family: 'Courier New', monospace;
  text-transform: uppercase;
}
```

Commit:
```bash
cd ~/math-sdk && git add -A
git commit -m "feat(ui): max bet button larger with MAX label"
git push origin main
```

---

## TASK 5 — Fix Autoplay button (add AUTO label, increase size)

The autoplay button is a plain grey/dark circle with no label —
players don't know what it does.

In ControlBar.svelte, find the autoplay button template. Add a label:

```svelte
<button class="img-btn auto-btn" ...>
  <img src="/assets/ui/btn_menu.png" alt="Autoplay" ... />
  <span class="auto-label">AUTO</span>
</button>
```

Add CSS:
```css
.auto-btn {
  width: 56px;
  height: 56px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
}

.auto-label {
  font-size: 0.5rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  color: rgba(0, 255, 255, 0.7);
  font-family: 'Courier New', monospace;
  text-transform: uppercase;
}

/* Active state */
.auto-btn.active .auto-label {
  color: #00ffff;
  text-shadow: 0 0 6px rgba(0, 255, 255, 0.8);
}
```

Commit:
```bash
cd ~/math-sdk && git add -A
git commit -m "feat(ui): autoplay button with AUTO label, larger size"
git push origin main
```

---

## TASK 6 — Increase Turbo / Mute / Info button sizes and spacing

The ⚡ turbo, 🔊 mute, and ℹ️ info buttons in the top utility row are
too small and cramped.

In ControlBar.svelte, find the utility button row (the row containing
turbo/mute/info). Update their sizes and spacing:

```css
/* Utility button row */
.util-row,
.icon-row,
[class*="util-row"] {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;        /* was probably 6-8px */
  margin-bottom: 6px;
}

/* Individual utility buttons */
.turbo-btn,
.mute-btn,
.info-btn,
[class*="util-btn"] {
  min-width: 40px;
  min-height: 40px;
  font-size: 1.1rem;  /* larger icon */
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.15s, filter 0.15s;
}

.turbo-btn:hover,
.mute-btn:hover,
.info-btn:hover {
  border-color: rgba(0, 255, 255, 0.6);
  filter: drop-shadow(0 0 6px rgba(0, 255, 255, 0.4));
}
```

Use actual class names from the file.

Commit:
```bash
cd ~/math-sdk && git add -A
git commit -m "feat(ui): larger utility buttons (turbo/mute/info) with spacing"
git push origin main
```

---

## TASK 7 — Overall bottom control bar layout balance

The current layout has the bet cluster on the far left, the spin button
in the centre, and the autoplay button isolated on the far right — this
looks disconnected, especially since the autoplay button is just a plain
circle.

Read the full ControlBar template structure. Restructure the bottom area
so all elements feel part of one cohesive control bar:

The target layout (left to right):
```
[MAX]  [−] BET USD 1.00 [+]    [SPIN]    [AUTO]  [⚡] [🔊] [ℹ️]
```

Where:
- MAX is to the left of the bet cluster, same row
- The spin button is centred with enough padding (min 16px each side)
- AUTO is directly to the right of spin
- Turbo/Mute/Info are in a tighter group to the right of AUTO

If the current structure already approximates this, focus on:
1. Ensuring the right side (AUTO + utilities) is balanced with the
   left side (MAX + bet cluster) in visual weight
2. The entire bar should be max-width 640px, centred
3. No element should be isolated or appear to float alone

Commit:
```bash
cd ~/math-sdk && git add -A
git commit -m "feat(ui): control bar layout balance — all elements cohesive"
git push origin main
```

---

## TASK 8 — Fix 5th column symbol clipping

Some symbols on reel 5 (rightmost column) appear partially cut off by
the frame. Read GameGrid.svelte for CANVAS_W and the frame CSS inset.

If the canvas width is e.g. 700px but the frame's -70px inset is
pulling it into the canvas area on the right side, adjust:

```css
.game-frame {
  inset: -70px -60px -70px -70px; /* less on the right if needed */
}
```

Or alternatively confirm the canvas width in GameGrid.svelte and
ensure it matches the grid-wrapper width exactly.

Commit:
```bash
cd ~/math-sdk && git add -A
git commit -m "fix(layout): ensure reel 5 symbols not clipped by frame"
git push origin main
```

---

## TASK 9 — TSC + build + copy status to Downloads

```bash
cd ~/math-sdk/frontend
npx tsc --noEmit 2>&1
npm run build 2>&1
```

Both must exit 0. Fix any errors.

Update ~/math-sdk/FUTURE_SPINNER_PROJECT_STATUS.md with all changes.

```bash
cp ~/math-sdk/FUTURE_SPINNER_PROJECT_STATUS.md \
   ~/Downloads/FUTURE_SPINNER_PROJECT_STATUS.md
echo "Status doc copied to Downloads"
```

```bash
cd ~/math-sdk && git add -A
git commit -m "chore: UI polish complete — header, win colour, buttons, layout"
git push origin main
```

---

## COMPLETION REPORT

═══════════════════════════════════════════════════════
FUTURE SPINNER — UI POLISH SESSION COMPLETE
═══════════════════════════════════════════════════════

TASK 1 — FUTURE SPINNER logo header:        [ done ]
TASK 2 — Win text gold/cyan, no green:      [ done ]
TASK 3 — Bet +/- buttons larger:            [ done ]
TASK 4 — Max Bet button bigger + label:     [ done ]
TASK 5 — Auto button bigger + label:        [ done ]
TASK 6 — Utility buttons larger + spaced:   [ done ]
TASK 7 — Control bar layout balanced:       [ done ]
TASK 8 — Reel 5 clipping fixed:             [ done ]
TASK 9 — Build passing:                     [ done ]

TSC:    [ 0 errors ]
BUILD:  [ pass ]
COMMIT: [ pushed to main ]
STATUS: [ copied to ~/Downloads/ ]

═══════════════════════════════════════════════════════
