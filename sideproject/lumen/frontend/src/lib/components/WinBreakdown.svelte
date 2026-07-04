<script lang="ts">
  // WinBreakdown.svelte — Motion Polish v2, win presentation item 3: after the
  // win burst settles, cycle group by group through the interpreter's win
  // events (symbol, count, ways, pay), matching what actually paid.
  import { onDestroy } from 'svelte'
  import { activeWins, isSpinning, currencyCode } from '../stores/gameStore'
  import { formatBalance, CURRENCY_SCALE } from '../utils/currency'

  const SYMBOL_LABELS: Record<string, string> = {
    H1: 'H1', H2: 'H2', M1: 'M1', M2: 'M2', M3: 'M3',
    L1: 'L1', L2: 'L2', L3: 'L3', W: 'WILD', S: 'SCATTER',
  }

  let cycleIndex = 0
  let cycleTimer: ReturnType<typeof setInterval> | null = null
  let settleTimer: ReturnType<typeof setTimeout> | null = null
  let visible = false

  $: groups = $activeWins

  // Let the plate-bloom/particle burst read first (900ms), then start cycling.
  $: if (groups.length > 0 && !$isSpinning) {
    if (!visible && !settleTimer) {
      settleTimer = setTimeout(() => {
        settleTimer = null
        visible = true
        cycleIndex = 0
        startCycle()
      }, 900)
    }
  } else {
    stopAll()
  }

  function startCycle(): void {
    if (cycleTimer) clearInterval(cycleTimer)
    if (groups.length <= 1) return
    cycleTimer = setInterval(() => {
      cycleIndex = (cycleIndex + 1) % groups.length
    }, 1400)
  }

  function stopAll(): void {
    if (cycleTimer) { clearInterval(cycleTimer); cycleTimer = null }
    if (settleTimer) { clearTimeout(settleTimer); settleTimer = null }
    visible = false
    cycleIndex = 0
  }

  $: current = groups[cycleIndex] ?? null
  $: payLabel = current
    ? formatBalance(Math.round(current.payout * CURRENCY_SCALE), $currencyCode || 'USD')
    : ''

  onDestroy(stopAll)
</script>

{#if visible && current}
  <div class="win-breakdown" data-testid="win-breakdown">
    <span class="wb-symbol">{SYMBOL_LABELS[current.symbol.toUpperCase()] ?? current.symbol}</span>
    <span class="wb-count">×{current.kind}</span>
    <span class="wb-ways">{current.ways} ways</span>
    <span class="wb-pay">{payLabel}</span>
  </div>
{/if}

<style>
  .win-breakdown {
    position: absolute;
    left: 50%;
    bottom: 6px;
    transform: translateX(-50%);
    z-index: 45;
    display: flex;
    gap: 10px;
    align-items: center;
    padding: 6px 14px;
    background: rgba(4, 6, 18, 0.82);
    border: 1px solid rgba(0, 255, 255, 0.35);
    border-radius: 8px;
    font-family: 'Orbitron', 'Courier New', monospace;
    font-size: 0.7rem;
    font-weight: 700;
    color: #fff;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
    animation: wb-fade-in 0.25s ease both;
    pointer-events: none;
  }
  .wb-symbol { color: #00ffff; letter-spacing: 0.05em; }
  .wb-count  { color: rgba(255, 255, 255, 0.7); }
  .wb-ways   { color: rgba(160, 228, 255, 0.75); font-size: 0.62rem; }
  .wb-pay    { color: #ffd700; }

  @keyframes wb-fade-in {
    from { opacity: 0; transform: translate(-50%, 4px); }
    to   { opacity: 1; transform: translate(-50%, 0); }
  }

  @media (prefers-reduced-motion: reduce) {
    .win-breakdown { animation: none; }
  }
</style>
