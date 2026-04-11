# FUTURE SPINNER — FIX WIN POD POSITIONING + BIG WIN AMOUNT
## April 2026

---

## PRE-AUTHORISATIONS
- ✅ Overwrite ANY file without asking
- ✅ Run build, tsc, npm, git without asking
**HARD LOCKS:** rgsService.ts, gameStore.ts, Math SDK — never touch.

---

## STEP 0 — READ CURRENT STATE

```bash
cat ~/math-sdk/frontend/src/lib/components/WinPod.svelte
grep -n "winAmount\|showBanner\|targetMicros\|toFixed\|displayAmount" \
  ~/math-sdk/frontend/src/lib/components/WinBanner.svelte
```

---

## FIX 1 — WinPod: add position:relative to parent, use v3 images

The absolute-positioned zone divs are escaping the pod container
because the parent `.win-pod` div is missing `position: relative`.
Also confirm v3 images are referenced.

Rewrite WinPod.svelte completely:

```bash
cat > ~/math-sdk/frontend/src/lib/components/WinPod.svelte << 'SVELTE'
<script lang="ts">
  import { winMultiplier, winAmount, isSpinning } from '../stores/gameStore'

  $: isActive = $winAmount > 0 && !$isSpinning
  $: multText = $winMultiplier > 0 ? `${$winMultiplier.toFixed(1)}×` : ''
  $: amtText  = $winAmount > 0 ? $winAmount.toFixed(2) : ''
</script>

{#if isActive}
  <div class="win-pod">
    <img class="pod-img"
      src="assets/ui/win_pod_v3_active.png"
      alt="" draggable="false" aria-hidden="true"
    />
    <div class="zone-mult">{multText}</div>
    <div class="zone-amt">{amtText}</div>
  </div>
{:else}
  <div class="win-pod idle">
    <img class="pod-img"
      src="assets/ui/win_pod_v3_idle.png"
      alt="" draggable="false" aria-hidden="true"
    />
  </div>
{/if}

<style>
  .win-pod {
    position: absolute;   /* MUST be absolute relative to .grid-wrapper */
    right: -220px;
    top: 50%;
    transform: translateY(-50%);
    width: 200px;
    height: 320px;
    z-index: 50;
    pointer-events: none;
    /* CRITICAL: position:relative so child absolute divs stay inside */
    /* Note: we use position:absolute for placement but the children
       with absolute positioning use the nearest positioned ancestor.
       Since .win-pod is position:absolute it IS a containing block. */
  }

  .win-pod.idle {
    opacity: 0.35;
  }

  .pod-img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
  }

  /* Zone 1 — MULTIPLIER: top:72 left:50 w:99 h:72 (from Manus QC) */
  .zone-mult {
    position: absolute;
    top: 72px;
    left: 50px;
    width: 99px;
    height: 72px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Orbitron', 'Courier New', monospace;
    font-size: 1.8rem;
    font-weight: 900;
    color: #00FFFF;
    text-shadow: 0 0 10px #00FFFF, 0 0 20px rgba(0,255,255,0.6);
    letter-spacing: 1px;
    white-space: nowrap;
    z-index: 2;
  }

  /* Zone 2 — WIN: top:192 left:50 w:99 h:72 (from Manus QC) */
  .zone-amt {
    position: absolute;
    top: 192px;
    left: 50px;
    width: 99px;
    height: 72px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Orbitron', 'Courier New', monospace;
    font-size: 1.4rem;
    font-weight: 900;
    color: #FF00FF;
    text-shadow: 0 0 10px #FF00FF, 0 0 20px rgba(255,0,255,0.6);
    letter-spacing: 1px;
    white-space: nowrap;
    z-index: 2;
  }
</style>
SVELTE
echo "WinPod written"
```

---

## FIX 2 — WinBanner: fix USD 0.00 (win amount not reaching count-up)

Read WinBanner.svelte. The issue is the reactive statement:

```typescript
$: if ($winMultiplier >= BIG_WIN_THRESHOLD && !$isSpinning) {
  showBanner($winAmount)
}
```

This fires when winMultiplier changes BUT winAmount may not have
updated yet at the same moment. Fix by watching winAmount directly:

```typescript
// Replace the reactive statement with:
let lastShownWin = 0

$: if ($winAmount > 0 && !$isSpinning && $winMultiplier >= BIG_WIN_THRESHOLD) {
  if ($winAmount !== lastShownWin) {
    lastShownWin = $winAmount
    showBanner($winAmount)
  }
}

$: if ($isSpinning) {
  visible = false
  displayAmount = 0
  lastShownWin = 0
}
```

Also confirm `showBanner` receives dollars not micros:
```bash
grep -n "winAmount\|CURRENCY_SCALE\|1_000_000\|micros" \
  ~/math-sdk/frontend/src/lib/stores/gameStore.ts | head -10
```

If winAmount is in dollars, `targetDollars = targetMicros` (rename param).
If winAmount is in micros, keep the division: `targetDollars = targetMicros / 1_000_000`.

Fix the showBanner function parameter name to avoid confusion:

```typescript
function showBanner(winDollars: number): void {
  if (dismissTimer) clearTimeout(dismissTimer)
  if (countUpFrame) cancelAnimationFrame(countUpFrame)

  displayAmount = 0
  visible = true

  const startTime = performance.now()
  const duration = 2000

  function countUp(): void {
    const elapsed = Math.min(performance.now() - startTime, duration)
    const progress = elapsed / duration
    displayAmount = winDollars * (1 - Math.pow(1 - progress, 3))
    if (progress < 1) {
      countUpFrame = requestAnimationFrame(countUp)
    } else {
      displayAmount = winDollars
      countUpFrame = null
    }
  }
  countUpFrame = requestAnimationFrame(countUp)

  dismissTimer = setTimeout(() => {
    visible = false
    displayAmount = 0
  }, 4000)
}
```

---

## FIX 3 — TSC + Build + Commit

```bash
cd ~/math-sdk/frontend
npx tsc --noEmit 2>&1
npm run build 2>&1

cp ~/math-sdk/FUTURE_SPINNER_PROJECT_STATUS.md ~/Downloads/FUTURE_SPINNER_PROJECT_STATUS.md

cd ~/math-sdk && git add -A
git commit -m "fix(win-pod): position:absolute is containing block, v3 images, zone text inside bounds; fix(win-banner): correct win amount count-up"
git push origin main
```

---

## COMPLETION REPORT

═══════════════════════════════════════════════════════════════════
WIN POD + BIG WIN BANNER FIXED
═══════════════════════════════════════════════════════════════════

FIX 1 — WinPod: zone text now inside pod bounds     [ done ]
  position:absolute IS a containing block for children
  v3 images referenced correctly
  zone-mult at top:72 left:50 99×72
  zone-amt at top:192 left:50 99×72

FIX 2 — WinBanner: correct amount in count-up       [ done ]
  lastShownWin guard prevents double-fire
  winAmount correctly passed as dollars
  count-up animates to real win value

TSC:    [ 0 errors ]
BUILD:  [ pass ]
COMMIT: [ pushed to main ]
═══════════════════════════════════════════════════════════════════
