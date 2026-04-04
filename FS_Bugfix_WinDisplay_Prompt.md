# FUTURE SPINNER — CLAUDE CODE BUGFIX: Win Display + Payout
## Document version: 1.0 | Created: April 2026

---

## PRE-AUTHORISATIONS — READ FIRST, APPLY FOR THE ENTIRE SESSION

All of the following are pre-authorised for this entire session:
- ✅ Overwrite ANY existing file without asking
- ✅ Create ANY new file without asking
- ✅ Fix TypeScript errors autonomously without asking
- ✅ Run `npm run build`, `npx tsc --noEmit` without asking
- ✅ Run `git add`, `git commit`, `git push` without asking

**Working directory:** `~/math-sdk/frontend/`
**Branch:** main

---

## STANDING PROTOCOL — UPDATE STATUS DOC AFTER EVERY TASK

After completing EACH task in this file, immediately update
`~/math-sdk/FUTURE_SPINNER_PROJECT_STATUS.md` with:
- What was just changed and why
- Which files were modified
- Current known issues (if any remain)
- What was confirmed working

This file is read by the human's AI assistant between sessions to track
live project state. It must always reflect reality. Never skip this step.

---

## STEP 0 — DIAGNOSE BEFORE TOUCHING ANYTHING

Read these files in full:

```bash
cat ~/math-sdk/frontend/src/lib/stores/gameStore.ts
cat ~/math-sdk/frontend/src/lib/components/WinDisplay.svelte
cat ~/math-sdk/frontend/src/lib/services/rgsService.ts
cat ~/math-sdk/frontend/src/App.svelte
```

Then write a short diagnosis block answering ALL of the following before
writing a single line of code:

**DIAGNOSIS REQUIRED:**
1. Where exactly is `winAmount` reset to 0? Which file, which line/function?
2. Does that reset happen BEFORE the 600ms count-up animation finishes?
3. What unit does `rgsService` return the win in — dollars, centibets
   (e.g. 550 = 5.5×), or micros (e.g. 5,500,000)?
4. What unit is `winAmount` stored in inside `gameStore`?
5. Is `winMultiplier` computed correctly as `winAmount / betAmount` with
   both values in the same unit?
6. What does `formatBalance` expect as its first argument — micros, dollars,
   or centibets?

Write the diagnosis as a numbered list matching the questions above.
Only proceed to Task 1 after the diagnosis is written.

---

## TASK 1 — Fix win display flickering

**Symptom:** Win amount flickers and disappears before the count-up
animation finishes.

**Root cause (expected):** `winAmount` is reset to 0 as part of the spin
cycle before the 600ms animation in `WinDisplay.svelte` completes.

**Fix:** In `WinDisplay.svelte`, decouple the display from the raw store
value. The component holds its own `targetValue` and only clears the
display after the animation fully completes — never mid-animation.

Replace the reactive block and `startCountUp` function with this pattern:

```typescript
let targetValue  = 0
let displayValue = 0
let animFrame: number
let animating    = false

// Start a new count-up only when winAmount goes positive
// Never reset mid-animation — wait until animation finishes
$: if ($winAmount > 0 && $winAmount !== targetValue) {
  targetValue = $winAmount
  startCountUp(targetValue)
} else if ($winAmount === 0 && !animating) {
  targetValue  = 0
  displayValue = 0
}

// Derive tier from current targetValue (not displayValue) so
// colour / label appears instantly at spin result, not at end of count-up
$: winTier = (() => {
  const mult = $betAmount > 0 ? targetValue / $betAmount : 0
  if (mult >= 50) return 'mega'
  if (mult >= 10) return 'big'
  if (mult >= 1)  return 'gold'
  if (mult > 0)   return 'green'
  return 'none'
})()

function startCountUp(target: number): void {
  cancelAnimationFrame(animFrame)
  animating      = true
  const start    = performance.now()
  const duration = 600

  function tick(now: number): void {
    const progress = Math.min((now - start) / duration, 1)
    const eased    = 1 - Math.pow(1 - progress, 3)
    displayValue   = target * eased
    if (progress < 1) {
      animFrame = requestAnimationFrame(tick)
    } else {
      displayValue = target
      animating    = false
    }
  }

  animFrame = requestAnimationFrame(tick)
}
```

**Important:** Use the actual store variable names as confirmed by the
diagnosis in Step 0. If the store uses different names than `winAmount`
or `betAmount`, use the correct names.

After applying the fix, verify in the browser:
- Spin and get a win — amount counts up smoothly from 0 to the final value
- Count-up does NOT flicker or disappear before reaching the target
- After the next spin starts, the display clears correctly

Update `FUTURE_SPINNER_PROJECT_STATUS.md` after this task.

---

## TASK 2 — Fix incorrect payout amounts

**Symptom:** Win amounts display the wrong number (too large, too small,
or wrong decimal places).

This is a unit mismatch. Based on your Step 0 diagnosis, apply the
correct fix from the cases below.

### Case A — rgsService returns centibets, winAmount stored in centibets
`formatBalance` expects micros. Conversion needed at display time:
```typescript
// In WinDisplay, when calling formatBalance:
formatBalance(Math.round(displayValue * CURRENCY_SCALE / 100), $currencyCode)
//                                    ^^^^^^^^^^^^^^^^^^^^^^^^^^
//                       centibets → dollars → micros
```

### Case B — rgsService returns centibets, winAmount stored as dollars
`formatBalance` expects micros:
```typescript
// winAmount was already converted: dollars = centibets / 100 * betDollars
// So displayValue is in dollars. Convert to micros for formatBalance:
formatBalance(Math.round(displayValue * CURRENCY_SCALE), $currencyCode)
```

### Case C — winAmount stored as dollars, formatBalance expects dollars
No CURRENCY_SCALE multiplication needed:
```typescript
`$${displayValue.toFixed(2)}`
// or if formatBalance accepts dollars directly:
formatBalance(displayValue, $currencyCode)
```

Apply whichever case matches the diagnosis. If uncertain, add a
`console.log` in the spin handler to print the raw win value and the
bet value, spin once, and read the console to confirm units before
applying the fix.

After applying the fix, verify:
- Spin a $1.00 bet and get a 2× win → display shows $2.00 (not $200 or $0.02)
- Spin a $0.10 bet and get a 3× win → display shows $0.30
- Balance decreases by the correct bet amount each spin

Update `FUTURE_SPINNER_PROJECT_STATUS.md` after this task.

---

## TASK 3 — Fix winMultiplier calculation

**Symptom:** BIG WIN / MEGA WIN labels appear at wrong thresholds, or
never appear.

After confirming units in Task 2, verify `winMultiplier` is computed as:

```
winMultiplier = winDollars / betDollars
```

Both must be in the same unit (dollars). If `winMultiplier` is derived
from mismatched units it will be orders of magnitude off.

Find where `winMultiplier` is set in `gameStore.ts` or `rgsService.ts`
and confirm the formula. Fix if incorrect.

Threshold check (these should trigger the correct labels):
- < 1×    → no label, green amount
- 1–9.9×  → no label, gold amount
- 10–49×  → "BIG WIN!" label, magenta amount
- 50×+    → "MEGA WIN!" label, cyan amount

Update `FUTURE_SPINNER_PROJECT_STATUS.md` after this task.

---

## TYPESCRIPT CHECK

```bash
cd ~/math-sdk/frontend
npx tsc --noEmit 2>&1
```

Must exit with 0 errors. Fix any errors autonomously.

---

## BUILD CHECK

```bash
cd ~/math-sdk/frontend
npm run build 2>&1
```

Must pass with zero errors.

---

## COMMIT AND PUSH

```bash
cd ~/math-sdk
git add -A
git commit -m "fix(frontend): win display flicker, payout units, winMultiplier threshold"
git push origin main
```

---

## FINAL STATUS DOC UPDATE

Update `~/math-sdk/FUTURE_SPINNER_PROJECT_STATUS.md` with the complete
current state of the project:

```markdown
# FUTURE SPINNER — PROJECT STATUS
## Last updated: [today's date] | Bugfix session complete

## CURRENT STATE
[One paragraph — what is working, what was fixed, what remains]

## COMPONENT STATUS

| Component | Status | Notes |
|-----------|--------|-------|
| Math SDK | ✅ LOCKED | 96.35% RTP validated |
| rgsService.ts | ✅ Working | Mock mode — unit: [dollars/centibets] |
| gameStore.ts | ✅ Working | winAmount unit: [dollars/centibets] |
| GameGrid.svelte | ✅ Complete | PNG sprites, scatter glow, win highlights |
| WinDisplay.svelte | ✅ Fixed | Count-up animation, no flicker, correct units |
| ControlBar.svelte | ✅ Working | Hover effects applied |
| BalanceDisplay.svelte | ✅ Working | |
| LoadingScreen.svelte | ✅ Working | Progress bar connected |
| App.svelte | ✅ Working | |
| translations.ts | ⚠ Partial | EN/DE/ES/JA only — 12 languages missing |

## CONFIRMED WIN DISPLAY BEHAVIOUR
- Unit flow: [describe the full chain — e.g. "rgsService → centibets → gameStore → dollars → WinDisplay → micros → formatBalance"]
- $1.00 bet × 2× win = $2.00 displayed: [✅ confirmed / ❌ not yet tested]
- BIG WIN threshold (10×+): [✅ working / ❌ broken]
- MEGA WIN threshold (50×+): [✅ working / ❌ broken]
- Flicker fixed: [✅ confirmed / ❌ still present]

## OUTSTANDING TASKS (Priority Order)
🟡 Visual Polish 4 — Loading screen logo + progress bar (LoadingScreen.svelte)
🟡 Visual Polish 5 — Cyberpunk frame image (App.svelte)
🟡 Visual Polish 6 — Background video loop (App.svelte)
🟡 Visual Polish 7 — Win celebration overlays (WinCelebration.svelte)
🟡 Visual Polish 8 — Reel tumble animation (GameGrid.svelte)
🟡 PAR Sheet PDF conversion
🟡 16 languages (12 missing)
🟡 Submission package

## SESSIONS LOG
| Session | Date | What was done |
|---------|------|--------------|
| Bugfix | [today] | Fixed win display flicker, payout units, winMultiplier |
| Symbol Integration | 2026-04-03 | PNG sprites, hover effects, count-up animation |

## REPOSITORY
- Repo: https://github.com/JTOSHIE/stake-game-development-claude
- Frontend: ~/math-sdk/frontend/
- Branch: main
- Last commit: [hash from git log --oneline -1]
```

---

## COMPLETION REPORT

Print this when done:

═══════════════════════════════════════════════════
FUTURE SPINNER — BUGFIX SESSION COMPLETE
═══════════════════════════════════════════════════

DIAGNOSIS:       [ written ]
TASK 1 Flicker:  [ fixed ]
TASK 2 Amounts:  [ fixed ]
TASK 3 Multip.:  [ fixed ]

TSC CHECK:       [ 0 errors ]
BUILD:           [ pass ]
COMMIT:          [ pushed to main ]
STATUS DOC:      [ updated ]

Win unit chain: [e.g. centibets → dollars → micros for display]
$1.00 × 2× = $2.00: [ ✅ confirmed ]

═══════════════════════════════════════════════════
