<script lang="ts">
  // FreeSpinsPresentation.svelte — plays back an Overdrive Free Spins round from
  // a PresentationScript (produced by roundInterpreter over the round events).
  // Temporary CSS presentation; final art/animation arrive in AssetForge v2 and
  // Motion Polish v2. Drives its own timed sequence; turbo shortens every step.
  //
  // Emits 'complete' with the total win (dollars) when the sequence finishes.
  import { createEventDispatcher, onDestroy } from 'svelte'
  import OverdriveMeter from './OverdriveMeter.svelte'
  import { betAmount, currencyCode, isTurbo, locale } from '../stores/gameStore'
  import { isSocial } from '../stores/socialMode'
  import { formatBalance, CURRENCY_SCALE } from '../utils/currency'
  import { t, type GameMode } from '../i18n/translations'
  import type { PresentationScript, PresentedSpin } from '../services/roundInterpreter'

  export let script: PresentationScript | null = null
  export let active = false

  const dispatch = createEventDispatcher<{ complete: { totalWin: number } }>()

  let phase: 'idle' | 'entry' | 'spin' | 'end' = 'idle'
  let spinIndex = -1
  let currentSpin: PresentedSpin | null = null
  // Exported (bindable) so BonusInstrumentColumn (LAYOUT_SPEC HUD) can drive
  // its gauge/odometer/plates from the same live values this overlay shows.
  export let displayMeter = 1
  export let spinsRemaining = 0
  export let runningTotalCentibets = 0
  let showRetrigger = false
  let endTotalDisplay = 0
  let timer: ReturnType<typeof setTimeout> | null = null

  $: mode = ($isSocial ? 'social' : 'real') as GameMode
  $: lang = $locale

  function dur(ms: number): number {
    return $isTurbo ? Math.max(120, Math.round(ms * 0.4)) : ms
  }

  function centibetsToMicros(cb: number): number {
    // cb = bet-multiple x 100; dollar win = (cb/100) * bet; micros = *SCALE
    return Math.round((cb / 100) * $betAmount * CURRENCY_SCALE)
  }
  function fmt(cb: number): string {
    return formatBalance(centibetsToMicros(cb), $currencyCode || 'USD')
  }

  function clear() {
    if (timer) { clearTimeout(timer); timer = null }
  }

  export function start() {
    clear()
    if (!script || !script.triggered) { finish(); return }
    phase = 'entry'
    spinIndex = -1
    displayMeter = 1
    runningTotalCentibets = script.baseSpin.runningTotalCentibets
    spinsRemaining = script.initialFreeSpins
    showRetrigger = false
    timer = setTimeout(nextSpin, dur(1100))
  }

  function nextSpin() {
    if (!script) return finish()
    spinIndex += 1
    if (spinIndex >= script.freeSpins.length) { toEnd(); return }
    phase = 'spin'
    currentSpin = script.freeSpins[spinIndex]
    displayMeter = currentSpin.meterBefore
    spinsRemaining = Math.max(0, script.totalFreeSpinsAwarded - spinIndex - 1)
    runningTotalCentibets = currentSpin.runningTotalCentibets
    showRetrigger = !!currentSpin.retrigger

    // After a winning spin, animate the meter increment.
    const willInc = currentSpin.meterAfter > currentSpin.meterBefore
    const holdWin = currentSpin.spinWinCentibets > 0 ? 900 : 500
    timer = setTimeout(() => {
      if (willInc) displayMeter = currentSpin!.meterAfter
      timer = setTimeout(nextSpin, dur(willInc ? 450 : 150))
    }, dur(holdWin))
  }

  function toEnd() {
    phase = 'end'
    currentSpin = null
    // count-up the total
    const target = centibetsToMicros(script!.totalWinCentibets)
    const steps = 24
    let i = 0
    const stepMs = dur(900) / steps
    endTotalDisplay = 0
    const tick = () => {
      i += 1
      endTotalDisplay = Math.round((target * i) / steps)
      if (i < steps) { timer = setTimeout(tick, stepMs) }
      else { endTotalDisplay = target; timer = setTimeout(finish, dur(1400)) }
    }
    timer = setTimeout(tick, stepMs)
  }

  function finish() {
    clear()
    phase = 'idle'
    const totalWin = script ? (script.totalWinCentibets / 100) * $betAmount : 0
    dispatch('complete', { totalWin })
  }

  // Start automatically when activated with a script.
  $: if (active && script && phase === 'idle') start()

  function visibleRows(board: PresentedSpin['board']): string[][] {
    // Board reels include padding rows; show the middle 4 where present.
    return board.map((reel) => {
      const names = reel.map((c) => c?.name ?? '')
      return names.length >= 6 ? names.slice(1, 5) : names.slice(0, 4)
    })
  }

  onDestroy(clear)
</script>

{#if active && script && script.triggered}
  <div class="fs-overlay" data-testid="freespins-overlay" role="dialog" aria-label="Overdrive Free Spins">
    {#if phase === 'entry'}
      <div class="fs-entry">
        <div class="fs-title">{t(lang, 'overdriveFreeSpins', mode)}</div>
        <div class="fs-sub">{script.initialFreeSpins} {t(lang, 'freeSpins', mode)}</div>
      </div>
    {:else if phase === 'spin' && currentSpin}
      <div class="fs-stage">
        <div class="fs-meter-slot">
          <OverdriveMeter
            multiplier={displayMeter}
            spinsRemaining={spinsRemaining}
            label={t(lang, 'overdrive', mode)}
            spinsLabel={t(lang, 'freeSpins', mode)}
          />
        </div>
        <div class="fs-board">
          {#each visibleRows(currentSpin.board) as reel}
            <div class="fs-reel">
              {#each reel as sym}
                <div class="fs-cell" class:scatter={sym === 'S'} class:wild={sym === 'W'}>{sym}</div>
              {/each}
            </div>
          {/each}
        </div>
        <div class="fs-winline">
          {#if currentSpin.spinWinCentibets > 0}
            <span class="fs-win">{fmt(currentSpin.spinWinCentibets)}</span>
            {#if currentSpin.meterBefore > 1}<span class="fs-mult">×{currentSpin.meterBefore}</span>{/if}
          {/if}
        </div>
        {#if showRetrigger}
          <div class="fs-retrigger">+5 {t(lang, 'freeSpins', mode)}</div>
        {/if}
        <div class="fs-running">{t(lang, 'totalWin', mode)}: {fmt(runningTotalCentibets)}</div>
      </div>
    {:else if phase === 'end'}
      <div class="fs-end">
        <div class="fs-title">{t(lang, 'featureComplete', mode)}</div>
        <div class="fs-endtotal">{formatBalance(endTotalDisplay, $currencyCode || 'USD')}</div>
      </div>
    {/if}
  </div>
{/if}

<style>
  .fs-overlay {
    position: absolute; inset: 0; z-index: 80;
    display: flex; align-items: center; justify-content: center;
    background: radial-gradient(circle at center, rgba(8,8,26,0.72), rgba(4,4,14,0.92));
    font-family: 'Orbitron', sans-serif; color: #fff; text-align: center;
  }
  .fs-entry, .fs-end { display: flex; flex-direction: column; gap: 10px; }
  .fs-title { font-size: 2rem; font-weight: 900; color: var(--theme-primary, #16f2e0); letter-spacing: 3px; text-shadow: 0 0 18px var(--theme-primary, #16f2e0); }
  .fs-sub { font-size: 1.2rem; color: var(--theme-secondary, #ff2ec4); }
  .fs-stage { display: flex; flex-direction: column; align-items: center; gap: 12px; width: min(92vw, 560px); }
  .fs-meter-slot { position: absolute; top: 12px; right: 12px; }
  .fs-board { display: flex; gap: 6px; }
  .fs-reel { display: flex; flex-direction: column; gap: 6px; }
  .fs-cell {
    width: 46px; height: 46px; display: flex; align-items: center; justify-content: center;
    border-radius: 6px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.14);
    font-size: 0.8rem; font-weight: 700; color: #cfe;
  }
  .fs-cell.scatter { border-color: var(--theme-secondary, #ff2ec4); color: var(--theme-secondary, #ff2ec4); box-shadow: 0 0 10px var(--theme-secondary, #ff2ec4); }
  .fs-cell.wild { border-color: var(--theme-primary, #16f2e0); color: var(--theme-primary, #16f2e0); }
  .fs-winline { min-height: 2rem; display: flex; gap: 8px; align-items: center; justify-content: center; }
  .fs-win { font-size: 1.6rem; font-weight: 900; color: #ffd54a; }
  .fs-mult { font-size: 1.2rem; color: var(--theme-secondary, #ff2ec4); }
  .fs-retrigger { font-size: 1.3rem; font-weight: 900; color: var(--theme-secondary, #ff2ec4); animation: rtpop 0.5s ease; }
  .fs-running { font-size: 0.9rem; opacity: 0.85; }
  .fs-endtotal { font-size: 2.4rem; font-weight: 900; color: #ffd54a; text-shadow: 0 0 20px #ffb300; }
  @keyframes rtpop { 0% { transform: scale(0.6); opacity: 0; } 60% { transform: scale(1.25); opacity: 1; } 100% { transform: scale(1); } }
</style>
