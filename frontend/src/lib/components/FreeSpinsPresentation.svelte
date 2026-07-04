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
  import { themeAssets } from '../stores/themeStore'
  import type { PresentationScript, PresentedSpin } from '../services/roundInterpreter'

  export let script: PresentationScript | null = null
  export let active = false

  const dispatch = createEventDispatcher<{ complete: { totalWin: number } }>()

  let phase: 'idle' | 'entry' | 'spin' | 'end' = 'idle'
  // Overdrive transition sub-stages within 'entry' (Motion Polish v2): scatter
  // flare, screen dip, gauge slam-to-centre with the needle ripping to the
  // redline, spin-count text burst, then settle (fades, revealing the real
  // BonusInstrumentColumn already sitting in its column position underneath).
  let entryStage: 'flare' | 'dip' | 'gauge' | 'burst' | 'settle' = 'flare'
  let spinIndex = -1
  // Free spins awarded SO FAR (initial award, growing on each retrigger). Used
  // for the odometer so it never shows the post-retrigger total before it lands.
  let awardedTotal = 0
  let currentSpin: PresentedSpin | null = null
  // Exported (bindable) so BonusInstrumentColumn (LAYOUT_SPEC HUD) can drive
  // its gauge/odometer/plates from the same live values this overlay shows.
  export let displayMeter = 1
  export let spinsRemaining = 0
  export let runningTotalCentibets = 0
  // Bindable so App.svelte can drive the background crossfade and frame neon
  // hue-shift; false again once the 'end' phase starts, so the reverse shift
  // plays out behind the total-win summary rather than after it.
  export let overdriveVisualActive = false
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
    if (!script) { finish(); return }
    if (!script.triggered) {
      // Wincap walkthrough for a round that never entered the feature (a
      // plain base-game win reaching the cap): "how it happened" is just the
      // base spin's board, so show that, then the same total-win summary.
      phase = 'spin'
      currentSpin = script.baseSpin
      displayMeter = 1
      spinsRemaining = 0
      runningTotalCentibets = script.baseSpin.runningTotalCentibets
      showRetrigger = false
      timer = setTimeout(toEnd, dur(1800))
      return
    }
    phase = 'entry'
    spinIndex = -1
    displayMeter = 1
    runningTotalCentibets = script.baseSpin.runningTotalCentibets
    spinsRemaining = script.initialFreeSpins
    awardedTotal = script.initialFreeSpins
    showRetrigger = false
    overdriveVisualActive = true
    runEntrySequence()
  }

  /** Overdrive transition (DESIGN_SYSTEM concept of record): scatter flare,
   *  screen dip, gauge slam to centre with the needle ripping to the redline,
   *  spin-count text burst, then settle. Every step is turbo-aware via dur(). */
  function runEntrySequence(): void {
    entryStage = 'flare'
    timer = setTimeout(() => {
      entryStage = 'dip'
      timer = setTimeout(() => {
        entryStage = 'gauge'
        timer = setTimeout(() => {
          entryStage = 'burst'
          timer = setTimeout(() => {
            entryStage = 'settle'
            timer = setTimeout(nextSpin, dur(450))
          }, dur(700))
        }, dur(450))
      }, dur(200))
    }, dur(250))
  }

  function nextSpin() {
    if (!script) return finish()
    spinIndex += 1
    if (spinIndex >= script.freeSpins.length) { toEnd(); return }
    phase = 'spin'
    currentSpin = script.freeSpins[spinIndex]
    displayMeter = currentSpin.meterBefore
    // Grow the awarded total when this spin retriggered, then show spins
    // remaining (this spin included) against the total awarded so far, so the
    // odometer matches what the player has actually been given at this point.
    if (currentSpin.retrigger) awardedTotal = currentSpin.retrigger.newTotal
    spinsRemaining = Math.max(0, awardedTotal - spinIndex)
    runningTotalCentibets = currentSpin.runningTotalCentibets
    showRetrigger = !!currentSpin.retrigger

    // After a winning spin, animate the meter increment. Bigger wins dwell
    // longer so the connection (and, in a wincap round, the spin that reaches
    // the cap) is actually seen; small wins still move fast.
    const willInc = currentSpin.meterAfter > currentSpin.meterBefore
    const winMult = currentSpin.spinWinCentibets / 100
    const holdWin = winMult > 0 ? Math.min(3200, 700 + winMult * 24) : 500
    timer = setTimeout(() => {
      if (willInc) displayMeter = currentSpin!.meterAfter
      timer = setTimeout(nextSpin, dur(willInc ? 450 : 150))
    }, dur(holdWin))
  }

  function toEnd() {
    phase = 'end'
    currentSpin = null
    // Reverse the bg-crossfade/frame-hue shift behind the total win summary,
    // not after it.
    overdriveVisualActive = false
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

  // Free-spin board cells show the real symbol art (same exports the main reel
  // uses), not the id text. W/S map to the wild/scatter filenames.
  const SYM_FILE: Record<string, string> = { W: 'wild', S: 'scatter' }
  function symImg(sym: string): string {
    const f = SYM_FILE[sym] ?? sym.toLowerCase()
    return `${$themeAssets.assetBase}/symbols/${f}.png`
  }

  function visibleRows(board: PresentedSpin['board']): string[][] {
    // Board reels include padding rows; show the middle 4 where present.
    return board.map((reel) => {
      const names = reel.map((c) => c?.name ?? '')
      return names.length >= 6 ? names.slice(1, 5) : names.slice(0, 4)
    })
  }

  // ── Win-connection story: which cells make up the spin's wins ─────────────
  // A ways win with symbol S over `kind` reels lights every cell holding S (or a
  // wild) on reels 0..kind-1 — so the player sees the connection across reels.
  function winningCells(rows: string[][], wins: PresentedSpin['wins']): Set<string> {
    const cells = new Set<string>()
    for (const win of wins) {
      const reels = Math.min(win.kind, rows.length)
      for (let r = 0; r < reels; r++) {
        for (let row = 0; row < rows[r].length; row++) {
          const sym = rows[r][row]
          if (sym === win.symbol || sym === 'W' || win.symbol === 'W') cells.add(`${r},${row}`)
        }
      }
    }
    return cells
  }
  // Recompute per shown spin so the highlight lands with the board.
  $: vrows = currentSpin ? visibleRows(currentSpin.board) : []
  $: winCells = currentSpin ? winningCells(vrows, currentSpin.wins) : new Set<string>()
  $: hasWin = !!currentSpin && currentSpin.wins.length > 0 && currentSpin.spinWinCentibets > 0

  onDestroy(clear)
</script>

{#if active && script}
  <div class="fs-overlay" data-testid="freespins-overlay" role="dialog" aria-label="Overdrive Free Spins">
    {#if phase === 'entry'}
      <div class="fs-entry-stage stage-{entryStage}" data-testid="overdrive-entry">
        <div class="entry-scatter-flare" aria-hidden="true"></div>
        <div class="entry-dip" aria-hidden="true"></div>
        <div class="entry-gauge-wrap" aria-hidden="true">
          <img class="entry-gauge-face" src="{$themeAssets.assetBase}/ui/gauge_face.png" alt="" />
          <img class="entry-gauge-needle" src="{$themeAssets.assetBase}/ui/gauge_needle.png" alt="" />
        </div>
        <div class="entry-title">{t(lang, 'overdriveFreeSpins', mode)}</div>
        <div class="entry-burst-text">+{script.initialFreeSpins} {t(lang, 'freeSpins', mode)}</div>
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
        <div class="fs-board" class:has-win={hasWin}>
          {#each vrows as reel, reelIdx}
            <div class="fs-reel">
              {#each reel as sym, rowIdx}
                <div
                  class="fs-cell"
                  class:scatter={sym === 'S'}
                  class:wild={sym === 'W'}
                  class:win={winCells.has(reelIdx + ',' + rowIdx)}
                  class:dim={hasWin && !winCells.has(reelIdx + ',' + rowIdx)}
                >
                  <img src={symImg(sym)} alt={sym} draggable="false" />
                </div>
              {/each}
            </div>
          {/each}
          <!-- Win value pops over the highlighted connection (what you just won
               this spin); the running TOTAL WIN stays in the right column. -->
          {#if hasWin}
            {#key spinIndex}
              <div class="fs-spin-win">
                {fmt(currentSpin.spinWinCentibets)}{#if currentSpin.meterBefore > 1}<span class="fs-spin-mult"> ×{currentSpin.meterBefore}</span>{/if}
              </div>
            {/key}
          {/if}
        </div>
        <!-- Running total and multiplier live in the instrument column under the
             gauge on the right; only the retrigger notice shows below the board. -->
        {#if showRetrigger}
          <div class="fs-retrigger">+5 {t(lang, 'freeSpins', mode)}</div>
        {/if}
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

  /* ── Overdrive transition (Motion Polish v2) — staged entry sequence ───── */
  .fs-entry-stage { position: relative; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }

  .entry-scatter-flare {
    position: absolute; inset: -20%; border-radius: 50%; pointer-events: none;
    background: radial-gradient(circle, rgba(255, 215, 0, 0.55) 0%, rgba(255, 215, 0, 0.15) 40%, transparent 70%);
    opacity: 0; transition: opacity 0.25s ease;
  }
  .stage-flare .entry-scatter-flare, .stage-dip .entry-scatter-flare { opacity: 1; }

  .entry-dip {
    position: absolute; inset: 0; background: #000; opacity: 0; pointer-events: none;
    transition: opacity 0.3s ease;
  }
  .stage-dip .entry-dip { opacity: 0.55; }

  .entry-gauge-wrap {
    position: relative; width: 240px; height: 240px; opacity: 0; transform: scale(0.4);
    transition: opacity 0.35s ease, transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .stage-gauge .entry-gauge-wrap, .stage-burst .entry-gauge-wrap { opacity: 1; transform: scale(1); }
  .stage-settle .entry-gauge-wrap { opacity: 0; transform: scale(1.18); transition: opacity 0.5s ease, transform 0.5s ease; }

  .entry-gauge-face, .entry-gauge-needle {
    position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain;
  }
  .entry-gauge-needle {
    transform-origin: 50% 50%; transform: rotate(-75deg);
    transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .stage-gauge .entry-gauge-needle, .stage-burst .entry-gauge-needle { transform: rotate(0deg); }

  .entry-title {
    position: absolute; top: 12%; left: 0; right: 0;
    font-size: 1.5rem; font-weight: 900; letter-spacing: 0.15em;
    color: var(--theme-primary, #16f2e0); text-shadow: 0 0 18px var(--theme-primary, #16f2e0);
    opacity: 0; transition: opacity 0.3s ease;
  }
  .stage-flare .entry-title, .stage-dip .entry-title, .stage-gauge .entry-title, .stage-burst .entry-title { opacity: 1; }
  .stage-settle .entry-title { opacity: 0; }

  .entry-burst-text {
    position: absolute; bottom: 10%; left: 0; right: 0;
    font-size: 2.1rem; font-weight: 900; color: #ffd700;
    text-shadow: 0 0 20px rgba(255, 215, 0, 0.9);
    opacity: 0; transform: scale(0.5);
    transition: opacity 0.3s ease, transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .stage-burst .entry-burst-text { opacity: 1; transform: scale(1); }
  .stage-settle .entry-burst-text { opacity: 0; }

  @media (prefers-reduced-motion: reduce) {
    .entry-scatter-flare, .entry-dip, .entry-gauge-wrap, .entry-gauge-needle, .entry-title, .entry-burst-text {
      transition: none;
    }
    .fs-cell.win { animation: none; }
    .fs-spin-win { animation: none; }
  }
  .fs-stage { display: flex; flex-direction: column; align-items: center; gap: 12px; width: min(92vw, 560px); }
  .fs-meter-slot { position: absolute; top: 12px; right: 12px; }
  /* Shifted left of centre so the top-right Overdrive meter box clears the
     board's top-right tile (off-centre is fine per owner). */
  .fs-board { position: relative; display: flex; gap: 10px; transform: translateX(-52px); }
  .fs-reel { display: flex; flex-direction: column; gap: 10px; }
  .fs-cell {
    position: relative;
    width: 72px; height: 72px; display: flex; align-items: center; justify-content: center;
    border-radius: 8px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.14);
    font-size: 1.1rem; font-weight: 700; color: #cfe;
    transition: opacity 0.2s ease;
  }
  .fs-cell img { width: 92%; height: 92%; object-fit: contain; display: block; }
  .fs-cell.scatter { border-color: var(--theme-secondary, #ff2ec4); box-shadow: 0 0 10px var(--theme-secondary, #ff2ec4); }
  .fs-cell.wild { border-color: var(--theme-primary, #16f2e0); }
  /* Win-connection story: winners light up + pulse, non-winners dim back so the
     connecting symbols across the reels read clearly. */
  .fs-cell.dim { opacity: 0.26; }
  .fs-cell.win {
    border-color: #ffd54a; z-index: 2;
    box-shadow: 0 0 16px 2px rgba(255, 213, 74, 0.8), inset 0 0 12px rgba(255, 213, 74, 0.4);
    animation: fs-win-pulse 0.7s ease-in-out infinite;
  }
  .fs-cell.win img { filter: brightness(1.15) drop-shadow(0 0 7px rgba(255, 213, 74, 0.85)); }
  @keyframes fs-win-pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.07); } }
  /* Win value callout on the connection (what you won this spin). */
  .fs-spin-win {
    position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);
    z-index: 5; pointer-events: none;
    font-family: 'Orbitron', 'Courier New', monospace;
    font-size: 2.1rem; font-weight: 900; color: #ffd54a;
    text-shadow: 0 0 14px rgba(255, 180, 0, 0.95), 0 2px 5px rgba(0, 0, 0, 0.9);
    padding: 0.15em 0.5em; border-radius: 10px;
    background: radial-gradient(ellipse at center, rgba(8, 6, 18, 0.7) 0%, rgba(8, 6, 18, 0) 72%);
    animation: fs-winpop 0.42s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  }
  .fs-spin-mult { color: var(--theme-secondary, #ff2ec4); font-size: 1.4rem; }
  @keyframes fs-winpop {
    0%   { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
    100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
  }
  .fs-retrigger { font-size: 1.3rem; font-weight: 900; color: var(--theme-secondary, #ff2ec4); animation: rtpop 0.5s ease; }
  .fs-endtotal { font-size: 2.4rem; font-weight: 900; color: #ffd54a; text-shadow: 0 0 20px #ffb300; }
  @keyframes rtpop { 0% { transform: scale(0.6); opacity: 0; } 60% { transform: scale(1.25); opacity: 1; } 100% { transform: scale(1); } }
</style>
