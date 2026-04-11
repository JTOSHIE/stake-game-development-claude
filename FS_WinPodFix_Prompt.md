# FUTURE SPINNER — FIX WIN POD TEXT OVERLAY
## One targeted fix only — WinPod.svelte
## April 2026

---

## PRE-AUTHORISATIONS
- ✅ Overwrite ANY file without asking
- ✅ Fix TypeScript errors autonomously
- ✅ Run build, tsc, npm, git without asking
**HARD LOCKS:** rgsService.ts, gameStore.ts, Math SDK — never touch.

---

## THE PROBLEM

The win pod image (win_pod_v2_active.png) has "2.5X" and "125.00"
baked into the artwork. Our CSS text "0.2x" and "0.00" renders on
top with a dark box background, creating an ugly overlay.

The fix is simple: the pod IMAGE already shows the baked values —
we don't need CSS text on top at all. The CSS text divs should be
REMOVED entirely from WinPod.svelte. The image handles the display.

The only remaining issue: the idle pod image shows even when there
is no win. The pod should be hidden when isActive is false.

---

## THE FIX — Rewrite WinPod.svelte completely

Replace the entire file with this clean version:

```svelte
<script lang="ts">
  /**
   * WinPod.svelte — Side win display pod
   * Shows win_pod_v2_active.png when there is a win.
   * Hidden completely when no win is active.
   * The pod image contains the multiplier and amount baked in.
   * No CSS text overlay needed — image handles all display.
   */
  import { winMultiplier, winAmount, isSpinning } from '../stores/gameStore'

  $: isActive = $winAmount > 0 && !$isSpinning
</script>

{#if isActive}
  <div class="win-pod">
    <img
      class="pod-img"
      src="assets/ui/win_pod_v2_active.png"
      alt="Win"
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
    animation: podGlow 1.5s ease-in-out infinite;
  }

  .pod-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
  }

  @keyframes podGlow {
    0%, 100% { filter: brightness(1); }
    50% { filter: brightness(1.12); }
  }
</style>
```

**Key changes:**
- No `.multiplier-value` or `.win-value` CSS text divs — removed entirely
- No dark background strips — removed entirely
- Pod only renders when `isActive` is true — hidden when no win
- When hidden, nothing shows on the right side of the frame

---

## WAIT — READ FIRST

Before writing the file, check what stores winAmount and winMultiplier
are actually called in gameStore.ts:

```bash
grep -n "export.*win\|export.*multiplier\|export.*amount" \
  ~/math-sdk/frontend/src/lib/stores/gameStore.ts | head -10
```

Use the exact exported store names. If winAmount is named differently
(e.g. lastWinAmount, currentWin), adapt the import accordingly.

---

## AFTER WRITING THE FILE

```bash
cd ~/math-sdk/frontend
npx tsc --noEmit 2>&1
npm run build 2>&1

cp ~/math-sdk/FUTURE_SPINNER_PROJECT_STATUS.md \
   ~/Downloads/FUTURE_SPINNER_PROJECT_STATUS.md

cd ~/math-sdk && git add frontend/src/lib/components/WinPod.svelte
git commit -m "fix(win-pod): remove CSS text overlay — pod image handles display, hidden when no win"
git push origin main
```

---

## COMPLETION REPORT

═══════════════════════════════════════════════════════════════════
WIN POD FIXED
═══════════════════════════════════════════════════════════════════

- CSS text divs removed (multiplier-value, win-value)
- Dark background strips removed
- Pod hidden when no win active
- Pod shows with glow animation when win is active
- Image artwork displays without interference

TSC:    [ 0 errors ]
BUILD:  [ pass ]
COMMIT: [ pushed to main ]
═══════════════════════════════════════════════════════════════════
