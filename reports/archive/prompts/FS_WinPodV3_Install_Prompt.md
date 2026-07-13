# FUTURE SPINNER — INSTALL WIN POD V3
## Exact pixel coordinates provided by Manus QC report
## April 2026

---

## PRE-AUTHORISATIONS
- ✅ Overwrite ANY file without asking
- ✅ Run build, tsc, npm, git without asking
**HARD LOCKS:** rgsService.ts, gameStore.ts, Math SDK — never touch.

---

## STEP 0 — FIND AND EXTRACT THE ZIP

```bash
ls ~/Downloads/*.zip | grep -i "pod\|win.*pod\|v3"
```

Find the zip, then extract:
```bash
unzip ~/Downloads/[ZIPNAME].zip -d ~/Downloads/win-pod-v3/
find ~/Downloads/win-pod-v3/ -name "*.png" | sort
```

Confirm both files exist:
- win_pod_v3_active.png (expect ~81KB)
- win_pod_v3_idle.png (expect ~52KB)

---

## TASK 1 — Install the PNG files

```bash
cp ~/Downloads/win-pod-v3/win_pod_v3_active.png \
   ~/math-sdk/frontend/public/assets/ui/win_pod_v3_active.png

cp ~/Downloads/win-pod-v3/win_pod_v3_idle.png \
   ~/math-sdk/frontend/public/assets/ui/win_pod_v3_idle.png

echo "Active: $(wc -c < ~/math-sdk/frontend/public/assets/ui/win_pod_v3_active.png) bytes"
echo "Idle:   $(wc -c < ~/math-sdk/frontend/public/assets/ui/win_pod_v3_idle.png) bytes"
```

---

## TASK 2 — Rewrite WinPod.svelte with exact pixel coordinates

Zone coordinates from Manus QC report:
- Zone 1 (MULTIPLIER): top: 72px, left: 50px, width: 99px, height: 72px
- Zone 2 (WIN amount): top: 192px, left: 50px, width: 99px, height: 72px

```bash
cat > ~/math-sdk/frontend/src/lib/components/WinPod.svelte << 'SVELTE'
<script lang="ts">
  /**
   * WinPod.svelte — Side win display with transparent LED zones
   * Pod image has two cut-out zones (alpha=0) where CSS text shows through.
   * Zone 1 (top:72, left:50, 99×72): multiplier value
   * Zone 2 (top:192, left:50, 99×72): win amount
   * Hidden when no win is active.
   */
  import { winMultiplier, winAmount, isSpinning } from '../stores/gameStore'

  $: isActive = $winAmount > 0 && !$isSpinning
  $: multText = $winMultiplier > 0 ? `${$winMultiplier.toFixed(1)}×` : ''
  $: amtText  = $winAmount > 0 ? $winAmount.toFixed(2) : ''
</script>

{#if isActive}
  <div class="win-pod">
    <!-- Pod frame image with transparent LED zones -->
    <img
      class="pod-img"
      src="assets/ui/win_pod_v3_active.png"
      alt=""
      draggable="false"
      aria-hidden="true"
    />
    <!-- Zone 1: multiplier text — sits in the transparent cutout -->
    <div class="zone-mult">{multText}</div>
    <!-- Zone 2: win amount text — sits in the transparent cutout -->
    <div class="zone-amt">{amtText}</div>
  </div>
{:else}
  <!-- Idle state: show dim pod, no numbers -->
  <div class="win-pod idle">
    <img
      class="pod-img"
      src="assets/ui/win_pod_v3_idle.png"
      alt=""
      draggable="false"
      aria-hidden="true"
    />
  </div>
{/if}

<style>
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

  .win-pod.idle {
    opacity: 0.4;
  }

  .pod-img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
  }

  /* Zone 1 — MULTIPLIER readout (exact coordinates from Manus QC) */
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
    text-shadow:
      0 0 10px #00FFFF,
      0 0 20px rgba(0, 255, 255, 0.6);
    letter-spacing: 1px;
    white-space: nowrap;
  }

  /* Zone 2 — WIN amount readout (exact coordinates from Manus QC) */
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
    text-shadow:
      0 0 10px #FF00FF,
      0 0 20px rgba(255, 0, 255, 0.6);
    letter-spacing: 1px;
    white-space: nowrap;
  }
</style>
SVELTE
echo "WinPod.svelte written"
```

---

## TASK 3 — TSC + Build + Commit

```bash
cd ~/math-sdk/frontend
npx tsc --noEmit 2>&1
npm run build 2>&1

cp ~/math-sdk/FUTURE_SPINNER_PROJECT_STATUS.md \
   ~/Downloads/FUTURE_SPINNER_PROJECT_STATUS.md

cd ~/math-sdk && git add -A
git commit -m "feat(win-pod): v3 transparent LED zones — CSS text aligns to exact cutout coordinates"
git push origin main
```

---

## COMPLETION REPORT

═══════════════════════════════════════════════════════════════════
WIN POD V3 INSTALLED
═══════════════════════════════════════════════════════════════════

- win_pod_v3_active.png installed (transparent zones at exact coords)
- win_pod_v3_idle.png installed (dims to 40% opacity, no numbers)
- Zone 1 (multiplier): top:72 left:50 99×72px — cyan Orbitron
- Zone 2 (win amount): top:192 left:50 99×72px — magenta Orbitron
- Shows on win, idle pod shows when no win
- No baked-in numbers — all values live from stores
- No stray text outside pod bounds

TSC:    [ 0 errors ]
BUILD:  [ pass ]
COMMIT: [ pushed to main ]
═══════════════════════════════════════════════════════════════════
