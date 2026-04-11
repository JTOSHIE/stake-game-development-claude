# FUTURE SPINNER — DELETE OLD HUD TEXT (READ-FIRST DIAGNOSTIC)
## The old hardcoded balance/bet/win text in App.svelte must be found and deleted.
## April 2026

---

## PRE-AUTHORISATIONS
- ✅ Overwrite ANY file without asking
- ✅ Fix TypeScript errors autonomously
- ✅ Run build, tsc, npm, git without asking
**HARD LOCKS:** rgsService.ts, gameStore.ts, Math SDK — never touch.

---

## STEP 0 — READ THE FULL HUD AND PANEL SECTION OF APP.SVELTE

```bash
# Show every line in App.svelte that mentions balance, bet, win, hud, panel, USD, 999, 1234
grep -n "hud\|BALANCE\|balance\|BET\|bet-display\|WIN\|win-display\|USD\|999\|1234\|panel.*balance\|panel.*win\|BalanceDisplay\|WinDisplay\|WinPod\|multiplier" \
  ~/math-sdk/frontend/src/App.svelte

# Show lines 150–280 of App.svelte (the game layout section)
sed -n '150,280p' ~/math-sdk/frontend/src/App.svelte

# Show what's inside the .hud div specifically
grep -n "hud" ~/math-sdk/frontend/src/App.svelte
```

**Read the output carefully. Find:**
1. Any hardcoded `.hud` div with inline balance/bet/win text
2. Any `<div class="balance-display">` or similar raw HTML (not Svelte components)
3. Any placeholder numbers like `1,234,567.89` or `999.99`
4. The exact line range of the old HUD block

Report ALL findings with exact line numbers before making any changes.

---

## FIX 1 — Delete the entire old HUD block from App.svelte

Based on Step 0 findings, find the old HUD section — it will look
something like:

```svelte
<div class="hud">
  <div class="balance-display">
    <span class="label">BALANCE</span>
    <span class="value">USD ...</span>
    ...
  </div>
  <div class="win-display">
    <span class="label">WIN</span>
    ...
  </div>
</div>
```

Or it may be a `.panels` div, or `.info-bar`, or `.display-row`.
Whatever element contains the old hardcoded balance/bet/win text —
**DELETE THE ENTIRE ELEMENT AND ALL ITS CHILDREN.**

Do not hide it. Do not comment it out. Delete it completely.

The BalanceDisplay component and WinDisplay component handle all
balance/bet/win rendering. App.svelte must not have any duplicate.

After deletion, confirm App.svelte has EXACTLY:
- ONE `<BalanceDisplay />` component instance
- ONE `<WinDisplay />` component instance
- ONE `<WinPod />` component instance (inside .grid-wrapper)
- ONE `<WinBanner />` component instance (inside .grid-wrapper)

```bash
# Verify after deletion
grep -n "BalanceDisplay\|WinDisplay\|WinPod\|WinBanner" \
  ~/math-sdk/frontend/src/App.svelte
```

---

## FIX 2 — Remove old text from WinPod if still present

```bash
cat ~/math-sdk/frontend/src/lib/components/WinPod.svelte
```

The WinPod must have ONLY these two text elements when active:
```svelte
<div class="multiplier-value">{multiplierText}</div>
<div class="win-value">{amountText}</div>
```

If there is also a `.multiplier-overlay` div OR any other text div
from an older version — delete it. Keep only the two above.

---

## FIX 3 — Remove placeholder/dummy values from any CSS or HTML

```bash
# Check for hardcoded dummy values anywhere in the codebase
grep -rn "1,234,567\|1234567\|999.99\|173.13\|placeholder" \
  ~/math-sdk/frontend/src/ | grep -v ".svelte-kit\|node_modules"
```

Delete any found. These are old debug/placeholder values that should
not exist in production code.

---

## FIX 4 — Also check ControlBar for old balance/win inline text

```bash
grep -n "BALANCE\|balance\|USD\|173\|999\|BET.*display\|win.*display" \
  ~/math-sdk/frontend/src/lib/components/ControlBar.svelte | head -20
```

If ControlBar has inline balance/win text rendering (not just the
bet amount which belongs there), remove it.

The bet amount display in ControlBar is correct — keep that.
Balance and win amounts belong ONLY in BalanceDisplay and WinDisplay.

---

## FIX 5 — TSC + Build + Commit

```bash
cd ~/math-sdk/frontend
npx tsc --noEmit 2>&1
npm run build 2>&1

cp ~/math-sdk/FUTURE_SPINNER_PROJECT_STATUS.md \
   ~/Downloads/FUTURE_SPINNER_PROJECT_STATUS.md

cd ~/math-sdk && git add -A
git commit -m "fix: delete old hardcoded HUD text from App.svelte — no more overlay text"
git push origin main
```

---

## COMPLETION REPORT

═══════════════════════════════════════════════════════════════════
OLD HUD TEXT DELETED
═══════════════════════════════════════════════════════════════════

FIX 1 — Old HUD block deleted from App.svelte:      [ done ]
  Lines deleted: [ report line range ]

FIX 2 — WinPod old overlay removed:                 [ done ]

FIX 3 — Placeholder values removed:                 [ done ]

FIX 4 — ControlBar inline text checked:             [ done ]

FIX 5 — TSC + build + commit:                       [ done ]

REMAINING RENDERS:
  BalanceDisplay: [ 1 instance ]
  WinDisplay:     [ 1 instance ]
  WinPod:         [ 1 instance ]
  WinBanner:      [ 1 instance ]

TSC:    [ 0 errors ]
BUILD:  [ pass ]
COMMIT: [ pushed to main ]
═══════════════════════════════════════════════════════════════════
