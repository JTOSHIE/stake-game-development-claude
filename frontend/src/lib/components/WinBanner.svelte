<script lang="ts">
  /**
   * WinBanner.svelte — Compact Big Win banner
   * Sits at top of grid-wrapper above reel frame. Reels remain 100% visible.
   * Appears on big/mega/epic wins. Auto-dismisses after 4 seconds.
   * Uses big_win_banner.png (800x200) as background.
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
  <div class="big-win-banner" class:active={visible}>
    <img
      class="banner-bg"
      src="assets/ui/big_win_banner.png"
      alt="Big Win"
      draggable="false"
    />
    <div class="win-amount">
      USD {displayAmount.toFixed(2)}
    </div>
  </div>
{/if}

<style>
  .big-win-banner {
    position: absolute;
    top: -120px;          /* above the reel frame */
    left: 50%;
    transform: translateX(-50%);
    width: 800px;
    height: 200px;
    z-index: 100;
    pointer-events: none;
  }

  .banner-bg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
    opacity: 0;
    transition: opacity 0.3s ease-in;
  }

  .big-win-banner.active .banner-bg {
    opacity: 1;
    animation: bannerPulse 2s ease-in-out infinite;
  }

  @keyframes bannerPulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.03); }
  }

  /* Win amount in the LED readout zone at banner bottom */
  .win-amount {
    position: absolute;
    bottom: 18%;
    left: 50%;
    transform: translateX(-50%);
    font-family: 'Orbitron', 'Courier New', monospace;
    font-size: 2rem;
    font-weight: 900;
    color: #00FFFF;
    text-shadow: 0 0 15px #00FFFF, 0 0 30px #00FFFF;
    letter-spacing: 4px;
    white-space: nowrap;
  }
</style>
