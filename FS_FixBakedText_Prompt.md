# FUTURE SPINNER — FIX BAKED-IN TEXT ON PANEL IMAGES
## The panel PNG images have text baked into the artwork.
## Solution: hide the panel background images, use CSS-only styled panels.
## The win pod image also has a number baked in — hide it too.
## April 2026

---

## PRE-AUTHORISATIONS
- ✅ Overwrite ANY file without asking
- ✅ Fix TypeScript errors autonomously
- ✅ Run build, tsc, npm, git without asking
**HARD LOCKS:** rgsService.ts, gameStore.ts, Math SDK — never touch.

---

## THE PROBLEM

The panel PNG images (panel_balance.png, panel_win.png) and the
win pod image (win_pod_v2_active.png) have text and numbers BAKED
INTO the artwork itself. When CSS text is overlaid, both show
simultaneously creating the double-text effect seen in screenshots.

The correct fix: stop using background-image for these panels.
Replace with pure CSS styling that looks premium without any PNG.
The win pod image is fine as a decorative frame — but it must NOT
show the baked-in number. Use CSS overflow:hidden or position to
hide the number zone of the pod image.

---

## FIX 1 — BalanceDisplay.svelte: replace PNG background with CSS panel

Remove the background-image entirely. Style the panel with CSS only:

Read the current BalanceDisplay.svelte then replace the panel div
and its CSS:

```svelte
<div class="balance-panel">
  <div class="field">
    <div class="led-label">{t($locale, 'balance')}</div>
    <div class="led-value cyan">USD {$balance.toFixed(2)}</div>
  </div>
  <div class="divider"></div>
  <div class="field">
    <div class="led-label">{t($locale, 'bet')}</div>
    <div class="led-value gold">USD {$betAmount.toFixed(2)}</div>
  </div>
</div>
```

Note: NO style attribute, NO background-image. CSS only.

CSS for the panel — dark glass look:
```css
.balance-panel {
  min-width: 280px;
  height: 90px;
  background: linear-gradient(135deg,
    rgba(0, 8, 20, 0.92) 0%,
    rgba(0, 20, 40, 0.88) 50%,
    rgba(0, 8, 20, 0.92) 100%
  );
  border: 1px solid rgba(0, 255, 255, 0.4);
  border-radius: 8px;
  box-shadow:
    0 0 12px rgba(0, 255, 255, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  padding: 0 1.4rem;
  gap: 0.8rem;
}

.field {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.divider {
  width: 1px;
  height: 55%;
  background: rgba(0, 255, 255, 0.15);
  flex-shrink: 0;
}

.led-label {
  font-family: 'Orbitron', 'Courier New', monospace;
  font-size: 0.5rem;
  font-weight: 700;
  letter-spacing: 0.25em;
  color: rgba(255, 255, 255, 0.4);
  text-transform: uppercase;
  display: block;
}

.led-value {
  font-family: 'Orbitron', 'Courier New', monospace;
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: 2px;
  display: block;
}

.led-value.cyan {
  color: #00FFFF;
  text-shadow: 0 0 8px #00FFFF, 0 0 16px rgba(0, 255, 255, 0.4);
}

.led-value.gold {
  color: #FFD700;
  text-shadow: 0 0 8px #FFD700, 0 0 16px rgba(255, 215, 0, 0.4);
}
```

Commit:
```bash
cd ~/math-sdk && git add frontend/src/lib/components/BalanceDisplay.svelte
git commit -m "fix(balance): CSS-only panel — removes PNG with baked-in text"
git push origin main
```

---

## FIX 2 — WinDisplay.svelte: replace PNG background with CSS panel

Same approach — no background-image, pure CSS dark glass panel:

Read WinDisplay.svelte. Find the win-panel div(s).
Remove the `style="background-image: url(...)..."` attribute entirely
from BOTH win-panel divs (the active win state and the win-idle state).

Then update the `.win-panel` CSS:

```css
.win-panel {
  min-width: 200px;
  height: auto;
  padding: 0 1.2rem;
  border-radius: 8px;

  /* CSS-only dark glass panel — no background image */
  background: linear-gradient(135deg,
    rgba(20, 0, 30, 0.92) 0%,
    rgba(40, 0, 50, 0.88) 50%,
    rgba(20, 0, 30, 0.92) 100%
  );
  border: 1px solid rgba(255, 0, 255, 0.4);
  box-shadow:
    0 0 12px rgba(255, 0, 255, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);

  font-family: 'Orbitron', 'Courier New', monospace;
  font-weight: 900;
  transition: filter 0.3s;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  min-height: 56px;
}
```

Also ensure win-amount uses magenta:
```css
.win-amount {
  font-family: 'Orbitron', 'Courier New', monospace;
  font-size: 1.1rem;
  font-weight: 900;
  color: #FF00FF;
  text-shadow: 0 0 8px #FF00FF, 0 0 16px rgba(255, 0, 255, 0.4);
  letter-spacing: 2px;
}
```

Commit:
```bash
cd ~/math-sdk && git add frontend/src/lib/components/WinDisplay.svelte
git commit -m "fix(win-panel): CSS-only panel — removes PNG with baked-in text"
git push origin main
```

---

## FIX 3 — WinPod.svelte: hide the baked-in number zone

The win_pod_v2_active.png image has a number baked into the artwork.
The solution: keep the pod frame image but hide the number zone
by clipping it with CSS overflow and adjusting what portion shows.

Read WinPod.svelte. Update the pod div:

```svelte
<div class="win-pod" class:active={isActive}>
  <!-- Pod frame image — decorative border only -->
  <!-- overflow:hidden on .pod-frame clips the baked-in number zone -->
  <div class="pod-frame">
    <img
      class="pod-bg"
      src={isActive ? 'assets/ui/win_pod_v2_active.png' : 'assets/ui/win_pod_v2_idle.png'}
      alt=""
      draggable="false"
      aria-hidden="true"
    />
  </div>

  <!-- Our CSS text — positioned OVER the image -->
  {#if isActive}
    <div class="multiplier-value">{multiplierText}</div>
    <div class="win-value">{amountText}</div>
  {/if}
</div>
```

The key insight: instead of hiding the pod image, use it as a
decorative frame. Position our text to render in the same zones
as the baked-in text, completely covering it:

```css
.win-pod {
  position: absolute;
  right: -220px;
  top: 50%;
  transform: translateY(-50%);
  width: 200px;
  height: 320px;
  z-index: 50;
  pointer-events: none;
}

.pod-frame {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.pod-bg {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

/* Upper LED zone — covers baked-in multiplier zone with our text */
.multiplier-value {
  position: absolute;
  top: 28%;
  left: 0;
  right: 0;
  text-align: center;
  transform: translateY(-50%);
  font-family: 'Orbitron', 'Courier New', monospace;
  font-size: 2.4rem;
  font-weight: 900;
  color: #FFD700;
  text-shadow:
    0 0 0 #1a1a00,          /* dark outline to cover baked text */
    0 0 0 #1a1a00,
    0 0 10px #FFD700,
    0 0 20px #FFD700;
  letter-spacing: 2px;
  white-space: nowrap;
  /* Paint over the baked number using a dark background stripe */
  background: rgba(10, 8, 0, 0.95);
  padding: 4px 8px;
  border-radius: 4px;
  margin: 0 16px;
}

/* Lower LED zone — covers baked-in win amount zone */
.win-value {
  position: absolute;
  top: 75%;
  left: 0;
  right: 0;
  text-align: center;
  transform: translateY(-50%);
  font-family: 'Orbitron', 'Courier New', monospace;
  font-size: 1.6rem;
  font-weight: 900;
  color: #FF00FF;
  text-shadow:
    0 0 10px #FF00FF,
    0 0 20px #FF00FF;
  letter-spacing: 2px;
  white-space: nowrap;
  /* Dark background stripe to cover baked text */
  background: rgba(10, 0, 12, 0.95);
  padding: 4px 8px;
  border-radius: 4px;
  margin: 0 16px;
}
```

The `background: rgba(...)` on the text divs paints a dark strip
over the baked-in numbers, then the Orbitron text renders on top.
This completely hides the PNG numbers without needing a new image.

Commit:
```bash
cd ~/math-sdk && git add frontend/src/lib/components/WinPod.svelte
git commit -m "fix(win-pod): dark bg strip covers baked-in numbers — CSS text renders cleanly"
git push origin main
```

---

## FIX 4 — ControlBar.svelte: remove bet_display.png background

The bet display panel also has baked-in text. Find the
`.bet-selector-panel` or `bet-display-panel` div in ControlBar.
Remove the `background-image: url('assets/ui/bet_display.png')` from
its inline style or CSS.

Replace with pure CSS:
```css
.bet-selector-panel {
  /* Remove background-image line entirely */
  background: linear-gradient(135deg,
    rgba(10, 8, 0, 0.92) 0%,
    rgba(25, 20, 0, 0.88) 50%,
    rgba(10, 8, 0, 0.92) 100%
  );
  border: 1px solid rgba(255, 215, 0, 0.4);
  border-radius: 6px;
  box-shadow:
    0 0 10px rgba(255, 215, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
  width: 148px;
  height: 48px;
  display: flex;
  align-items: center;
  gap: 0;
}
```

Commit:
```bash
cd ~/math-sdk && git add frontend/src/lib/components/ControlBar.svelte
git commit -m "fix(bet-display): CSS-only panel — removes bet_display.png with baked-in text"
git push origin main
```

---

## FIX 5 — TSC + Build + Final commit

```bash
cd ~/math-sdk/frontend
npx tsc --noEmit 2>&1
npm run build 2>&1

cp ~/math-sdk/FUTURE_SPINNER_PROJECT_STATUS.md \
   ~/Downloads/FUTURE_SPINNER_PROJECT_STATUS.md

cd ~/math-sdk && git add -A
git commit -m "fix: CSS-only panels replace PNG images with baked-in text"
git push origin main
```

---

## COMPLETION REPORT

═══════════════════════════════════════════════════════════════════
BAKED-IN TEXT FIXED
═══════════════════════════════════════════════════════════════════

FIX 1 — BalanceDisplay: CSS dark glass panel, no PNG    [ done ]
FIX 2 — WinDisplay: CSS dark glass panel, no PNG        [ done ]
FIX 3 — WinPod: dark strip covers baked numbers         [ done ]
FIX 4 — Bet display: CSS only, no bet_display.png       [ done ]
FIX 5 — TSC + build + commit                            [ done ]

RESULT:
  All panels now CSS-only — no baked-in artwork text
  Win pod frame kept — numbers covered by dark background strip
  Single source of truth: Orbitron CSS text only

TSC:    [ 0 errors ]
BUILD:  [ pass ]
COMMIT: [ pushed to main ]
═══════════════════════════════════════════════════════════════════
