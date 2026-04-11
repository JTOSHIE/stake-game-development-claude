# FUTURE SPINNER — FIX DUPLICATE COMPONENT RENDERS
## Single focused fix — remove old component instances from App.svelte
## April 2026

---

## PRE-AUTHORISATIONS
- ✅ Overwrite ANY file without asking
- ✅ Fix TypeScript errors autonomously
- ✅ Run build, tsc, npm, git without asking
**HARD LOCKS:** rgsService.ts, gameStore.ts, Math SDK — never touch.

---

## STEP 0 — READ EXACTLY WHAT IS RENDERING

```bash
# Show every component used in App.svelte
grep -n "BalanceDisplay\|WinDisplay\|WinPod\|WinBanner\|WinCelebration\|Balance\|WinPanel\|multiplier-overlay\|multiplier_overlay" \
  ~/math-sdk/frontend/src/App.svelte

# Show the full HUD / bottom panel section of App.svelte
grep -n "hud\|panel\|balance\|win-display\|control" \
  ~/math-sdk/frontend/src/App.svelte | head -30

# Check WinPod for any old multiplier-overlay class still present
grep -n "multiplier-overlay\|multiplier_overlay\|multiplier-value\|win-value" \
  ~/math-sdk/frontend/src/lib/components/WinPod.svelte

# Check if there is an old inline HUD balance/win render in App.svelte
grep -n "USD\|balance\|173\|999\|1234" \
  ~/math-sdk/frontend/src/App.svelte | head -20
```

Report the exact line numbers of EVERY BalanceDisplay, WinDisplay,
and WinPod render in App.svelte. There should be exactly ONE of each.

---

## FIX 1 — Remove duplicate component instances in App.svelte

The screenshot shows double rendering of:
- Balance/Bet panel (old + new stacked)
- Win panel (old + new stacked)
- Win pod multiplier text (old overlay + new LED text stacked)

**Based on Step 0 findings, delete ALL but ONE instance of each.**

There should be exactly:
- ONE `<BalanceDisplay />` in App.svelte
- ONE `<WinDisplay />` in App.svelte
- ONE `<WinPod />` in App.svelte (inside .grid-wrapper)
- ONE `<WinBanner />` in App.svelte (inside .grid-wrapper)

**Also check if App.svelte has any inline balance/win HTML** — sometimes
old code renders balance/win as raw HTML divs directly in App.svelte
rather than through components. Delete any such inline HTML if found.

Look specifically for patterns like:
```svelte
<div class="hud">
  <div class="balance-display">...</div>
  <div class="win-display">...</div>
</div>
```
or
```svelte
<div class="balance-panel">
  USD {$balance}
</div>
```

Delete these entirely — the components handle all display.

Commit:
```bash
cd ~/math-sdk && git add frontend/src/App.svelte
git commit -m "fix: remove duplicate BalanceDisplay/WinDisplay/WinPod renders from App.svelte"
git push origin main
```

---

## FIX 2 — Remove old multiplier-overlay from WinPod

Read WinPod.svelte. Check if it still has a `.multiplier-overlay` CSS
class or div from the old version alongside the new `.multiplier-value`
and `.win-value` divs.

The component must have ONLY these text elements when active:
```svelte
<div class="multiplier-value">{multiplierText}</div>
<div class="win-value">{amountText}</div>
```

No `.multiplier-overlay`. No old text div. Delete anything else.

```bash
cat ~/math-sdk/frontend/src/lib/components/WinPod.svelte
```

If any old overlay div exists alongside the new ones, remove it.

Commit:
```bash
cd ~/math-sdk && git add frontend/src/lib/components/WinPod.svelte
git commit -m "fix(win-pod): remove old multiplier-overlay — only new LED zones remain"
git push origin main
```

---

## FIX 3 — Check BalanceDisplay for duplicate text elements

Read BalanceDisplay.svelte completely:
```bash
cat ~/math-sdk/frontend/src/lib/components/BalanceDisplay.svelte
```

It must contain ONLY:
- One `.field` div with `.led-label` and `.led-value.cyan` for balance
- One divider
- One `.field` div with `.led-label` and `.led-value.gold` for bet

If there are also `.text-pill`, `.value`, `.label` (old classes) — delete them.

The rendered HTML must be:
```
balance-panel
  field → led-label "BALANCE" + led-value cyan "USD 173.13"
  divider
  field → led-label "BET" + led-value gold "USD 2.00"
```

Nothing else. No old elements.

---

## FIX 4 — Check WinDisplay for duplicate text elements

Read WinDisplay.svelte completely:
```bash
cat ~/math-sdk/frontend/src/lib/components/WinDisplay.svelte
```

It must show ONLY:
- `.win-label` (WIN text label)
- `.win-amount` (the amount in magenta)

No old `.multiplier` div. No old `.text-pill`. No duplicate amounts.

---

## FIX 5 — TSC + Build + Commit

```bash
cd ~/math-sdk/frontend
npx tsc --noEmit 2>&1
npm run build 2>&1

cp ~/math-sdk/FUTURE_SPINNER_PROJECT_STATUS.md \
   ~/Downloads/FUTURE_SPINNER_PROJECT_STATUS.md

cd ~/math-sdk && git add -A
git commit -m "fix: duplicate panel renders eliminated — single source of truth for all displays"
git push origin main
```

---

## COMPLETION REPORT

═══════════════════════════════════════════════════════════════════
DUPLICATE RENDER FIX COMPLETE
═══════════════════════════════════════════════════════════════════

FIX 1 — App.svelte: single instance per component   [ done ]
FIX 2 — WinPod: old overlay removed                 [ done ]
FIX 3 — BalanceDisplay: only LED elements remain     [ done ]
FIX 4 — WinDisplay: only LED elements remain         [ done ]
FIX 5 — TSC + build + commit                         [ done ]

RESULT:
  Balance panel → single render, cyan USD amount
  Win panel     → single render, magenta USD amount
  Win Pod       → single render, gold multiplier + magenta win amount
  No overlapping text from old and new components

TSC:    [ 0 errors ]
BUILD:  [ pass ]
COMMIT: [ pushed to main ]
═══════════════════════════════════════════════════════════════════
