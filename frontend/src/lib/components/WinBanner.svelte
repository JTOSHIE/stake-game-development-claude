<script lang="ts">
  /**
   * WinBanner.svelte — LAYOUT_SPEC banner: compact 380x96, centred over the
   * grid at stage (450,262), translucent with a gold rim, z100. CSS-only
   * (no big_win_banner.png dependency). Appears on big/mega/epic wins.
   * Auto-dismisses after 4 seconds. Mounted as a stage-level sibling in
   * App.svelte, so its position here is in stage coordinates, not relative
   * to the grid.
   */
  import { onDestroy } from 'svelte'
  import { winMultiplier, winAmount, isSpinning } from '../stores/gameStore'

  const BIG_WIN_THRESHOLD = 10   // multiplier × bet to trigger banner

  let visible = false
  let displayAmount = 0
  let dismissTimer: ReturnType<typeof setTimeout> | null = null
  let countUpFrame: number | null = null
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

  function showBanner(winDollars: number): void {
    if (dismissTimer) clearTimeout(dismissTimer)
    if (countUpFrame) cancelAnimationFrame(countUpFrame)

    displayAmount = 0
    visible = true

    // Count up animation over 2 seconds
    const startTime = performance.now()
    const duration = 2000

    function countUp(): void {
      const elapsed = Math.min(performance.now() - startTime, duration)
      const progress = elapsed / duration
      // Ease-out so counting slows near the end
      displayAmount = winDollars * (1 - Math.pow(1 - progress, 3))
      if (progress < 1) {
        countUpFrame = requestAnimationFrame(countUp)
      } else {
        displayAmount = winDollars
        countUpFrame = null
      }
    }
    countUpFrame = requestAnimationFrame(countUp)

    // Auto-dismiss after 4 seconds
    dismissTimer = setTimeout(() => {
      visible = false
      displayAmount = 0
    }, 4000)
  }

  onDestroy(() => {
    if (dismissTimer) clearTimeout(dismissTimer)
    if (countUpFrame) cancelAnimationFrame(countUpFrame)
  })
</script>

{#if visible}
  <div class="big-win-banner" class:active={visible} data-testid="win-banner">
    <div class="win-amount">
      USD {displayAmount.toFixed(2)}
    </div>
  </div>
{/if}

<style>
  /* Compact 380x96, centred over the grid at stage (450,262), z100 */
  .big-win-banner {
    position: absolute;
    left: 450px;
    top: 262px;
    width: 380px;
    height: 96px;
    z-index: 100;
    pointer-events: none;
    border-radius: 14px;
    background: linear-gradient(135deg, rgba(10, 8, 0, 0.55) 0%, rgba(25, 20, 0, 0.45) 100%);
    border: 2px solid rgba(255, 215, 0, 0.75);
    box-shadow: 0 0 24px rgba(255, 215, 0, 0.35), inset 0 0 20px rgba(255, 215, 0, 0.08);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease-in;
  }

  .big-win-banner.active {
    opacity: 1;
    animation: bannerPulse 2s ease-in-out infinite;
  }

  @keyframes bannerPulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.03); }
  }

  .win-amount {
    font-family: 'Orbitron', 'Courier New', monospace;
    font-size: 2rem;
    font-weight: 900;
    color: #00FFFF;
    text-shadow: 0 0 15px #00FFFF, 0 0 30px #00FFFF;
    letter-spacing: 4px;
    white-space: nowrap;
  }
</style>
