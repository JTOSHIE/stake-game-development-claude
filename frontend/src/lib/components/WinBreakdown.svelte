<script lang="ts">
  // WinBreakdown.svelte - Motion Polish v2, win presentation item 3: after the
  // win burst settles, cycle group by group through the interpreter's win
  // events (symbol, count, ways, pay), matching what actually paid.
  import { onDestroy } from 'svelte'
  import { tr } from '../i18n/tr'
  import { activeWins, isSpinning, currencyCode } from '../stores/gameStore'
  import { formatBalance, CURRENCY_SCALE, formatWin } from '../utils/currency'

  // The tier symbols are IDs, identical in every language, so they stay a plain
  // map. WILD and SCATTER are words, and they used to sit in this same record as
  // hardcoded English: being a local constant rather than markup, they were
  // invisible to the locale gate until TR-091 widened it. They now come from the
  // tr layer like every other player-visible word.
  const SYMBOL_IDS: Record<string, string> = {
    H1: 'H1', H2: 'H2', M1: 'M1', M2: 'M2', M3: 'M3',
    L1: 'L1', L2: 'L2', L3: 'L3',
  }
  const symbolLabel = (raw: string, t: (k: 'symbolWild' | 'symbolScatter') => string): string => {
    const id = (raw || '').toUpperCase()
    if (id === 'W') return t('symbolWild')
    if (id === 'S') return t('symbolScatter')
    return SYMBOL_IDS[id] ?? raw
  }

  /**
   * Stop cycling and stay down. MAX-WIN HOLD (owner's order, 2026-07-28).
   *
   * This component cycles its win groups on a 1400ms `setInterval` that has no
   * natural end: it runs for as long as `activeWins` is non-empty and the reels
   * are not spinning, and BOTH of those hold for the whole of a max-win hold.
   * So a capped round left an interval ticking underneath the celebration for
   * as long as the player looked at it, which is the owner's "nothing
   * progresses behind it" rule broken by a component the overlay hides.
   *
   * The precedent is one line above this component's own mount in App.svelte:
   * `<WinCelebration winMultiplier={$isWincap ? 0 : $winMultiplier} />` already
   * carries the comment "Suppress standard celebration while the max-win
   * overlay is active". WinBreakdown sat next to it and was never given the
   * same treatment.
   */
  export let suppressed = false

  let cycleIndex = 0
  let cycleTimer: ReturnType<typeof setInterval> | null = null
  let settleTimer: ReturnType<typeof setTimeout> | null = null
  let visible = false

  $: groups = $activeWins

  // Let the plate-bloom/particle burst read first (900ms), then start cycling.
  $: if (groups.length > 0 && !$isSpinning && !suppressed) {
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
    ? formatWin(Math.round(current.payout * CURRENCY_SCALE), $currencyCode || 'USD')
    : ''

  onDestroy(stopAll)
</script>

{#if visible && current}
  <div class="c1-win win-breakdown fs-plate" data-testid="win-breakdown">
    <span class="fs-rail"></span>
    <div class="fs-face">
      <span class="wb-symbol">{symbolLabel(current.symbol, $tr)}</span>
      <span class="wb-count">x{current.kind}</span>
      <span class="wb-ways">{current.ways} ways</span>
      <span class="wb-pay fs-num">{payLabel}</span>
    </div>
  </div>
{/if}

<style>
  /* ── 5 signature tokens (canonical, from CHROME_PRIMITIVES.md) ─────────── */
  .c1-win {
    --sig-cyan: var(--theme-primary, #00FFFF);
    --sig-magenta: var(--theme-secondary, #FF00FF);
    --sig-pink: #FF2EC4;
    --sig-gold: #FFD700;
    --sig-orange: #FF9A2E;
    --sig-green: #4EFF91;
    --acc: var(--sig-cyan);
    --acc2: var(--sig-pink);
  }

  /* ── Thin chrome chip: fs-plate primitive (verbatim canonical) ────────── */
  .win-breakdown {
    position: absolute;
    left: 50%;
    bottom: 6px;
    transform: translateX(-50%);
    z-index: 45;
    pointer-events: none;
    animation: wb-fade-in 0.25s ease both;
  }
  .fs-plate {
    position: relative; --sig: var(--sig-cyan); padding: 2px;
    clip-path: polygon(0 0, calc(100% - 13px) 0, 100% 13px, 100% 100%, 13px 100%, 0 calc(100% - 13px));
    background: linear-gradient(150deg, #eef5fa, #b3c6d2 15%, #63737f 37%, #2b363f 52%, #8499a8 72%, #dceaf2);
    box-shadow: 0 3px 10px rgba(0,0,0,.6), 0 0 9px color-mix(in srgb, var(--sig) 20%, transparent), inset 0 1px 0 rgba(255,255,255,.35);
  }
  .fs-plate > .fs-face {
    position: relative; display: flex; flex-direction: row; align-items: center; justify-content: center;
    gap: 10px; padding: 6px 16px 6px 18px; white-space: nowrap;
    clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px));
    background: linear-gradient(160deg, color-mix(in srgb, var(--sig) 12%, transparent), transparent 44%), linear-gradient(180deg, #111a2b, #070b16);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.07), inset 0 -8px 18px rgba(0,0,0,.6);
    font-family: var(--fs-font-display);
    font-size: 0.7rem; font-weight: 700; color: #fff;
  }
  .fs-rail {
    position: absolute; left: 2px; top: 9px; bottom: 9px; width: 3px; border-radius: 2px; z-index: 2;
    background: var(--sig); box-shadow: 0 0 8px var(--sig);
  }
  .fs-num { font-variant-numeric: tabular-nums; -webkit-font-smoothing: antialiased; text-rendering: geometricPrecision; }

  .wb-symbol { color: var(--acc); letter-spacing: 0.05em; }
  .wb-count  { color: rgba(255, 255, 255, 0.7); }
  .wb-ways   { color: color-mix(in srgb, var(--sig-cyan) 75%, #ffffff); font-size: 0.62rem; }
  .wb-pay    { color: var(--sig-gold); }

  @keyframes wb-fade-in {
    from { opacity: 0; transform: translate(-50%, 4px); }
    to   { opacity: 1; transform: translate(-50%, 0); }
  }

  @media (prefers-reduced-motion: reduce) {
    .win-breakdown { animation: none; }
  }
</style>
