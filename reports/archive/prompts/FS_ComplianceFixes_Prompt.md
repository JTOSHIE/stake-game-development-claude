# FUTURE SPINNER — CLAUDE CODE SESSION: Compliance Fixes + Frame + Audio Logic
## Document version: 1.0 | Created: April 2026

---

## PRE-AUTHORISATIONS — ENTIRE SESSION

- ✅ Overwrite ANY file without asking
- ✅ Create ANY new file without asking
- ✅ Fix TypeScript errors autonomously
- ✅ Run build, tsc, npm, git commands without asking

**⚠ HARD LOCKS:** `rgsService.ts`, `gameStore.ts`, Math SDK — never touch.
**Working directory:** `~/math-sdk/frontend/`
**Branch:** main

Update `~/math-sdk/FUTURE_SPINNER_PROJECT_STATUS.md` after every task and commit.

---

## STEP 0 — ORIENTATION

```bash
cat ~/math-sdk/FUTURE_SPINNER_PROJECT_STATUS.md
cat ~/math-sdk/frontend/src/lib/components/ControlBar.svelte
cat ~/math-sdk/frontend/src/App.svelte
cat ~/math-sdk/frontend/src/lib/services/soundService.ts
cd ~/math-sdk/frontend && npx tsc --noEmit 2>&1
```

---

## TASK 1 — COMPLIANCE: Remove Buy Bonus / Free Spins

**⚠ This is a Stake Engine hard requirement violation.**

Stake Engine strictly prohibits: jackpots, gamble features, continuation
mechanics, free spins, and early cashout. The "Buy Bonus" button creates
a paid continuation mechanic and must be **completely removed**.

**Step 1 — Read ControlBar.svelte in full.** Find every reference to:
- `buyBonus`, `buy-bonus`, `bonus`, `BuyBonus`, `canBuyBonus`
- Any button, variable, store subscription, or function related to bonus buying

**Step 2 — Remove from ControlBar.svelte:**
- Delete the Buy Bonus button element entirely from the template
- Delete any CSS for `.bonus-btn` or similar
- Delete any imports of `buyBonusActive`, `canBuyBonus`, `buyBonusActive`
  from gameStore — if these stores exist, remove the imports only
  (do not modify gameStore.ts itself)
- Delete any event handlers that call buy bonus functions

**Step 3 — Read App.svelte.** Find and remove:
- Any `buyBonusActive` store subscription or reactive statement
- Any CSS class that applies when `buyBonusActive` is true (e.g. `.bonus-bg`)
- Any bonus-related overlay or animation triggered in App.svelte

**Step 4 — Read WinCelebration.svelte if it exists.** Remove any
reference to bonus rounds, free spins, or continuation mechanics.

**Step 5 — Check the paytable modal if one exists** (PaytableModal.svelte
or similar). Remove any mention of "Buy Bonus", "Free Spins", or bonus
purchase from the UI text. The only bonus feature is the stateless
scatter multiplier (3 scatters = 5×, 4 = 15×, 5 = 50×).

After removing, verify TSC passes (0 errors).

**What to keep:** The scatter multiplier feature is compliant and must stay.
Only remove the "Buy Bonus" button and any paid entry to bonus rounds.

Commit:
```bash
cd ~/math-sdk && git add -A
git commit -m "fix(compliance): remove Buy Bonus button — violates Stake Engine stateless requirement"
git push origin main
```

---

## TASK 2 — Fix frame sizing so it sits OUTSIDE the grid

**Problem:** The frame image extends over the first and last symbol
columns. The frame should wrap around the outside of the canvas, not
over it.

Read `src/App.svelte`. Find the `.game-frame` CSS. The frame uses
`inset: -20px` which may be too aggressive, or the canvas width doesn't
match the frame's 800×640 aspect ratio.

**Fix approach:**

The PixiJS canvas has a fixed pixel size (read from GameGrid.svelte to
confirm CANVAS_W and CANVAS_H values). The frame image is 800×640.
The frame must be positioned so its transparent centre exactly matches
the canvas area.

Read `src/lib/components/GameGrid.svelte` to find the exact canvas
dimensions (look for `CANVAS_W`, `CANVAS_H`, `width:`, `height:` in the
Application constructor).

Then calculate the correct frame inset. The frame's opaque border is
approximately 70px wide on each side (the frame image is 800px wide,
with ~660px transparent centre = 70px border each side).

Set the frame so the transparent centre aligns with the canvas:

```css
.grid-wrapper {
  position: relative;
  display: inline-block;
}

.game-frame {
  position: absolute;
  /* Calculate: canvas is [CANVAS_W]×[CANVAS_H]px.
     Frame border is ~70px each side.
     So frame should extend 70px beyond each canvas edge. */
  inset: -70px;
  width: calc(100% + 140px);
  height: calc(100% + 140px);
  object-fit: fill;
  pointer-events: none;
  z-index: 10;
  animation: frame-pulse 3s ease-in-out infinite;
}
```

Adjust the `70px` value based on the actual canvas dimensions and visual
result. The goal: frame border sits outside all 5 columns and all 4 rows,
and the transparent centre shows all symbols clearly.

**Verification:** Open browser, confirm:
- All 5 columns of symbols visible with no frame overlap
- Frame corners sit cleanly outside the grid area
- The frame's decorative border (lightning bolts, corner pieces) is fully visible

Commit:
```bash
cd ~/math-sdk && git add -A
git commit -m "fix(frame): correct frame inset so it sits outside the symbol grid"
git push origin main
```

---

## TASK 3 — Increase background video opacity

**Problem:** The background video plays but is too subtle at 35% opacity.

In `src/App.svelte`, find `.bg-video` CSS and update:
```css
.bg-video {
  opacity: 0.5;  /* was 0.35 — increase visibility */
}

.bg-overlay {
  background: rgba(0, 0, 0, 0.55);  /* was 0.65 — slightly less dark */
}
```

This makes the cyberpunk city street scene noticeably more visible as
an atmospheric background without it competing with the game content.

Commit:
```bash
cd ~/math-sdk && git add -A
git commit -m "feat(video): increase background video opacity for better atmosphere"
git push origin main
```

---

## TASK 4 — Dynamic audio logic based on win size

**Problem:** The same win sound plays for every win regardless of size.
Dead spins (no win) should not trigger any win sound.
Different win sizes should trigger escalating audio responses.

Read `src/lib/services/soundService.ts` in full, then rewrite the
`playWin` function with proper tiered logic:

```typescript
/**
 * Play win sound based on win multiplier (winAmount / betAmount).
 * Dead spins: call playWin(0) — no sound plays.
 * Small wins (>0 to <2×): soft win chime
 * Medium wins (2× to <10×): regular win fanfare
 * Big wins (10× to <50×): scatter/celebration sound
 * Epic wins (50×+): scatter sound + repeat for emphasis
 */
export function playWin(multiplier: number): void {
  if (muted || multiplier <= 0) return  // dead spin — silence

  if (multiplier >= 50) {
    // Epic — play scatter twice with slight delay
    sounds.scatter.currentTime = 0
    sounds.scatter.play().catch(() => {})
    setTimeout(() => {
      if (!muted) {
        const echo = sounds.scatter.cloneNode() as HTMLAudioElement
        echo.volume = 0.6
        echo.play().catch(() => {})
      }
    }, 800)
  } else if (multiplier >= 10) {
    // Big win — scatter/celebration sound
    sounds.scatter.currentTime = 0
    sounds.scatter.play().catch(() => {})
  } else if (multiplier >= 2) {
    // Medium win — win fanfare
    sounds.win.currentTime = 0
    sounds.win.play().catch(() => {})
  } else {
    // Small win (>0 but <2×) — quiet win sound at lower volume
    const softWin = sounds.win.cloneNode() as HTMLAudioElement
    softWin.volume = 0.4
    softWin.play().catch(() => {})
  }
}
```

Also ensure `playWin` is being called correctly from `App.svelte` after
each spin resolves. Read App.svelte and find where spin results are
processed. Confirm `playWin` is called with the actual win multiplier
(`winAmount / betAmount`), NOT a string tier.

If `playWin` is currently called with a string like `'small'` or `'big'`,
update those call sites to pass the numeric multiplier instead.

Additionally, add ambient tension during spinning — the BGM should
continue playing during spin (it already does), but add a subtle
"spin building" effect by slightly increasing BGM volume during the
spin and returning to normal after:

```typescript
export function playSpinStart(): void {
  if (muted) return
  sounds.spin.currentTime = 0
  sounds.spin.play().catch(() => {})
  // Slightly duck then restore BGM
  sounds.bgm.volume = 0.15
  setTimeout(() => { sounds.bgm.volume = 0.3 }, 1500)
}
```

Export `playSpinStart` and update any call sites that currently call
`playSpin()` to call `playSpinStart()` instead — or rename `playSpin`
to `playSpinStart` if it's simpler.

Commit:
```bash
cd ~/math-sdk && git add -A
git commit -m "feat(audio): dynamic win sounds by multiplier tier, BGM duck on spin"
git push origin main
```

---

## TASK 5 — Final TSC + build + status update

```bash
cd ~/math-sdk/frontend
npx tsc --noEmit 2>&1
npm run build 2>&1
```

Both must exit 0. Fix any errors autonomously.

Update `~/math-sdk/FUTURE_SPINNER_PROJECT_STATUS.md`:

```markdown
# FUTURE SPINNER — PROJECT STATUS
## Last updated: 2026-04-04 | Compliance + polish session complete

## CURRENT STATE
Buy Bonus button removed (Stake Engine compliance — stateless requirement).
Frame repositioned to sit outside grid area. Background video opacity
increased. Audio now dynamic — dead spins silent, wins escalate by tier.
0 TypeScript errors, production build passing.

## COMPLIANCE STATUS (Stake Engine)
- ✅ Stateless design — no continuation mechanics
- ✅ Buy Bonus removed — no paid bonus entry
- ✅ No free spins
- ✅ No jackpots
- ✅ Win cap: 5,000× enforced
- ✅ RTP: 96.3500%
- ✅ 16 languages
- ✅ No Stake branding
- ✅ No underage appeal
- ⏳ IP/trademark review pending
- ⏳ Real RGS endpoint test pending
- ⏳ Google Drive artwork upload pending

## COMPONENT STATUS
[Update all component statuses to reflect current state]

## SESSIONS LOG
| Session | Date | What was done |
|---------|------|--------------|
| Compliance + polish | 2026-04-04 | Buy Bonus removed, frame fix, video opacity, dynamic audio |
| R2 wiring | 2026-04-04 | Clean frame, WILD fix, all UI panels, R2 sounds |
| Emergency frame | 2026-04-04 | CSS fallback frame |
| Immediate fixes | 2026-04-04 | Green→cyan, spin glow, panel styling |
| Asset wiring | 2026-04-04 | Video, sounds wired |
| Full polish | 2026-04-03 | All visual tasks |
| Bugfix | 2026-04-03 | Win display flicker |
| Symbol Integration | 2026-04-03 | PNG sprites |

## REPOSITORY
- Repo: https://github.com/JTOSHIE/stake-game-development-claude
- Frontend: ~/math-sdk/frontend/
- Branch: main
- Last commit: [git log --oneline -1]
```

```bash
cd ~/math-sdk && git add -A
git commit -m "chore: compliance + polish complete, status updated"
git push origin main
```

---

## COMPLETION REPORT

═══════════════════════════════════════════════════════════
FUTURE SPINNER — COMPLIANCE + POLISH SESSION COMPLETE
═══════════════════════════════════════════════════════════

TASK 1 — Buy Bonus removed (compliance):    [ done ]
TASK 2 — Frame repositioned outside grid:   [ done ]
TASK 3 — Video opacity increased:           [ done ]
TASK 4 — Dynamic audio by win tier:         [ done ]
TASK 5 — Build passing:                     [ done ]

TSC:    [ 0 errors ]
BUILD:  [ pass ]
COMMIT: [ pushed to main ]

COMPLIANCE: Buy Bonus / free spins — REMOVED ✅
Stake Engine stateless requirement: MET ✅

═══════════════════════════════════════════════════════════
