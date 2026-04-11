<script lang="ts">
  /**
   * GameGrid.svelte — two-state animated symbol system
   *
   * Symbol display: HTML5 <video> elements in a CSS flex grid.
   *   - Idle state : _idle.mp4 loops continuously
   *   - Win state  : _win.mp4 plays once (4.0 s), then reverts to idle
   *
   * Win overlay  : PixiJS canvas (transparent) draws gold cell borders
   *                and connecting lines on top of the video layer.
   *
   * Spin animation: CSS blur on column wrappers + sequential reel timing.
   * Public API  : animateSpin(board) called by App.svelte — unchanged contract.
   */
  import { onMount, onDestroy } from 'svelte'
  import { get } from 'svelte/store'
  import { Application, Graphics } from 'pixi.js'
  import { boardSymbols, activeWins, isSpinning, isTurbo } from '../stores/gameStore'
  import { assetLoadProgress } from '../stores/loadingStore'
  import { playSpinStart, playReelStop, playAnticipation, playScatterLand } from '../services/soundService'
  import { activeTheme } from '../stores/themeStore'

  // ── Theme-aware win line colour ───────────────────────────────────────────
  function hexToPixi(hex: string): number {
    return parseInt(hex.replace('#', ''), 16)
  }
  function getWinLineColour(): number {
    return hexToPixi(get(activeTheme).palette.primary)
  }

  // ── Layout constants — must match PixiJS canvas dimensions ───────────────
  const REELS    = 5
  const ROWS     = 4
  const CELL_W   = 120
  const CELL_H   = 100
  const GAP      = 4
  const CANVAS_W = REELS * CELL_W + (REELS - 1) * GAP   // 616
  const CANVAS_H = ROWS  * CELL_H + (ROWS  - 1) * GAP   // 412

  // ── Video symbol asset paths ──────────────────────────────────────────────
  const IDLE_BASE = 'assets/symbols/idle'
  const WIN_BASE  = 'assets/symbols/win'
  const PNG_IDLE  = 'assets/symbols/idle-png'

  const videoSupported = typeof HTMLVideoElement !== 'undefined'

  // ── State ─────────────────────────────────────────────────────────────────
  let pixiContainer: HTMLDivElement
  let app: Application
  let winHighlightLayer: Graphics
  let assetsReady = false

  // Video cell refs: videoRefs[col][row]
  let videoRefs: (HTMLVideoElement | null)[][] =
    Array.from({ length: REELS }, () => Array.from({ length: ROWS }, (): HTMLVideoElement | null => null))

  // Column wrapper refs for blur/bounce
  let colRefs: (HTMLDivElement | null)[] = Array.from({ length: REELS }, (): HTMLDivElement | null => null)

  // Win burst state
  let winBurstTimer: ReturnType<typeof setTimeout> | null = null

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  onMount(() => {
    // Transparent PixiJS canvas — win lines only, no symbol rendering
    app = new Application({
      width:           CANVAS_W,
      height:          CANVAS_H,
      backgroundAlpha: 0,
      antialias:       true,
    })
    pixiContainer.appendChild(app.view as HTMLCanvasElement)

    winHighlightLayer = new Graphics()
    app.stage.addChild(winHighlightLayer)

    assetsReady = true
    // No async texture loading — signal loading complete immediately
    assetLoadProgress.set(100)

    // Initialize all cells to idle L3
    for (let col = 0; col < REELS; col++) {
      for (let row = 0; row < ROWS; row++) {
        const vid = videoRefs[col][row]
        if (vid) {
          vid.setAttribute('data-symbol', 'L3')
          vid.src = getIdleSrc('L3')
          vid.loop = true
          vid.play().catch(() => {})
        }
      }
    }

    const unsubBoard = boardSymbols.subscribe(board => {
      if (assetsReady && board && board.length === REELS) _updateSymbolVideos(board)
    })

    const unsubWins = activeWins.subscribe(() => {
      if (assetsReady) _applyWinHighlights()
    })

    return () => { unsubBoard(); unsubWins() }
  })

  onDestroy(() => {
    if (winBurstTimer) clearTimeout(winBurstTimer)
    app?.destroy(true)
  })

  // ── Video path helpers ────────────────────────────────────────────────────
  function getIdleSrc(symbol: string): string {
    return `${IDLE_BASE}/${symbol.toUpperCase()}_idle.mp4`
  }

  function getWinSrc(symbol: string): string {
    return `${WIN_BASE}/${symbol.toUpperCase()}_win.mp4`
  }

  // ── Update all video cells to idle loop for given board ───────────────────
  function _updateSymbolVideos(board: string[][]): void {
    for (let col = 0; col < REELS; col++) {
      for (let row = 0; row < ROWS; row++) {
        const symbol = (board[col]?.[row] ?? 'L3').toUpperCase()
        const vid = videoRefs[col][row]
        if (!vid) continue
        if (vid.getAttribute('data-symbol') !== symbol) {
          vid.setAttribute('data-symbol', symbol)
          vid.src = getIdleSrc(symbol)
          vid.loop = true
          vid.load()
          vid.play().catch(() => {})
        }
        vid.style.opacity = '1'
      }
    }
  }

  // ── Win burst — swap winning cells to _win.mp4, dim non-winners ──────────
  function _triggerWinBurst(
    wins: Array<{ symbol: string; kind: number; ways: number; payout: number }>,
    board: string[][]
  ): void {
    if (winBurstTimer) clearTimeout(winBurstTimer)

    // Derive winning cell set — same scan logic as _applyWinHighlights
    const winningCells = new Set<string>()
    for (const win of wins) {
      const reelCount = win.kind ?? 3
      for (let r = 0; r < reelCount; r++) {
        const reelSymbols = board[r] ?? []
        for (let row = 0; row < ROWS; row++) {
          const sym = reelSymbols[row]
          if (sym === win.symbol || sym === 'W' || win.symbol === 'W') {
            winningCells.add(`${r},${row}`)
          }
        }
      }
    }

    for (let col = 0; col < REELS; col++) {
      for (let row = 0; row < ROWS; row++) {
        const symbol = board[col]?.[row]
        const vid = videoRefs[col][row]
        if (!vid || !symbol) continue
        const key = `${col},${row}`

        if (winningCells.has(key)) {
          // Swap to win burst video — plays once
          vid.style.opacity = '1'
          vid.loop = false
          vid.src = getWinSrc(symbol.toUpperCase())
          vid.load()
          vid.currentTime = 0
          vid.play().catch(() => {})
        } else {
          // Non-winning: pause idle and dim to 40%
          vid.pause()
          vid.style.opacity = '0.4'
        }
      }
    }

    // After 4.0 s: restore all to idle loop
    winBurstTimer = setTimeout(() => {
      const currentBoard = get(boardSymbols)
      if (currentBoard.length) _updateSymbolVideos(currentBoard)
      for (let col = 0; col < REELS; col++) {
        for (let row = 0; row < ROWS; row++) {
          const vid = videoRefs[col][row]
          if (vid) { vid.loop = true; vid.style.opacity = '1' }
        }
      }
    }, 4000)
  }

  // ── Reset all cells to idle (called at spin start) ────────────────────────
  function _resetToIdle(): void {
    if (winBurstTimer) { clearTimeout(winBurstTimer); winBurstTimer = null }
    for (let col = 0; col < REELS; col++) {
      for (let row = 0; row < ROWS; row++) {
        const vid = videoRefs[col][row]
        if (vid) { vid.loop = true; vid.style.opacity = '1' }
      }
    }
  }

  // ── CSS-based column blur (replaces PixiJS BlurFilter) ────────────────────
  function _blurCol(colIndex: number): void {
    const col = colRefs[colIndex]
    if (col) col.style.filter = 'blur(3px)'
  }

  function _clearColBlur(colIndex: number): void {
    const col = colRefs[colIndex]
    if (col) col.style.filter = ''
  }

  // ── CSS column bounce (replaces PixiJS container.y animation) ────────────
  function _bounceCol(colIndex: number): Promise<void> {
    return new Promise(resolve => {
      const col = colRefs[colIndex]
      if (!col) { resolve(); return }
      const OVERSHOOT = 8, DUR1 = 80, DUR2 = 40
      col.style.transform = `translateY(${OVERSHOOT}px)`
      const start = performance.now()
      const tick = () => {
        const t = Math.min((performance.now() - start) / DUR1, 1)
        if (t < 1) {
          col.style.transform = `translateY(${OVERSHOOT * (1 - t)}px)`
          requestAnimationFrame(tick)
        } else {
          col.style.transform = ''
          const start2 = performance.now()
          const tick2 = () => {
            const t2 = Math.min((performance.now() - start2) / DUR2, 1)
            if (t2 < 1) {
              col.style.transform = `translateY(${-2 * Math.sin(t2 * Math.PI)}px)`
              requestAnimationFrame(tick2)
            } else {
              col.style.transform = ''
              resolve()
            }
          }
          requestAnimationFrame(tick2)
        }
      }
      requestAnimationFrame(tick)
    })
  }

  // ── Scatter anticipation — glow on upcoming columns ───────────────────────
  function _scatterAnticipation(lastStoppedReel: number): void {
    for (let r = lastStoppedReel + 1; r < REELS; r++) {
      const col = colRefs[r]
      // Combine with existing blur so spin blur isn't lost
      if (col) col.style.filter = 'blur(3px) brightness(1.15) saturate(1.3)'
    }
  }

  // ── Anticipation check — true if reels 0–2 have near-matching high-value ──
  function _checkAnticipation(board: string[][]): boolean {
    const highValue = ['H1', 'H2', 'S']
    const isWild = (s: string | undefined) => s === 'W'
    const matches = (a: string | undefined, b: string | undefined) =>
      a !== undefined && b !== undefined && (a === b || isWild(a) || isWild(b))
    for (let row = 0; row < ROWS; row++) {
      const s0 = board[0]?.[row]
      const s1 = board[1]?.[row]
      const s2 = board[2]?.[row]
      if (s0 !== undefined && highValue.includes(s0) && matches(s0, s1) && matches(s0, s2)) return true
    }
    return false
  }

  // ── Win overlay — PixiJS draws gold borders + connecting lines ────────────
  function _applyWinHighlights(): void {
    if (!winHighlightLayer) return
    winHighlightLayer.clear()

    const wins  = get(activeWins)
    const board = get(boardSymbols)
    if (!wins.length || !board.length) return

    const STRIP_W = CELL_W + GAP
    const STRIP_H = CELL_H + GAP
    const wlc     = getWinLineColour()

    // Derive winning cells
    const winningCells = new Set<string>()
    for (const win of wins) {
      const reelCount = win.kind ?? 3
      for (let r = 0; r < reelCount; r++) {
        const reelSymbols = board[r] ?? []
        for (let row = 0; row < ROWS; row++) {
          const sym = reelSymbols[row]
          if (sym === win.symbol || sym === 'W' || win.symbol === 'W') {
            winningCells.add(`${r},${row}`)
          }
        }
      }
    }

    // Gold cell borders on winning cells
    for (const key of winningCells) {
      const [r, row] = key.split(',').map(Number)
      winHighlightLayer.lineStyle(2, wlc, 0.85)
      winHighlightLayer.beginFill(wlc, 0.08)
      winHighlightLayer.drawRoundedRect(
        r * STRIP_W + 2, row * STRIP_H + 2, CELL_W - 4, CELL_H - 4, 6
      )
      winHighlightLayer.endFill()
    }

    // Gold connecting lines through winning symbol centres
    for (const win of wins) {
      const reelCount = win.kind ?? 3
      const points: { x: number; y: number }[] = []
      for (let r = 0; r < reelCount; r++) {
        const reelSymbols = board[r] ?? []
        for (let row = 0; row < ROWS; row++) {
          const sym = reelSymbols[row]
          if (sym === win.symbol || sym === 'W') {
            points.push({ x: r * STRIP_W + CELL_W / 2, y: row * STRIP_H + CELL_H / 2 })
            break  // one point per reel
          }
        }
      }
      if (points.length >= 2) {
        // Inner solid line
        winHighlightLayer.lineStyle(2, wlc, 0.6)
        winHighlightLayer.moveTo(points[0].x, points[0].y)
        for (let i = 1; i < points.length; i++) winHighlightLayer.lineTo(points[i].x, points[i].y)
        // Outer glow line
        winHighlightLayer.lineStyle(6, wlc, 0.15)
        winHighlightLayer.moveTo(points[0].x, points[0].y)
        for (let i = 1; i < points.length; i++) winHighlightLayer.lineTo(points[i].x, points[i].y)
      }
    }

    // Trigger video win burst
    _triggerWinBurst(wins, board)
  }

  // ── Single-reel spin helper ───────────────────────────────────────────────
  function _spinReel(r: number, finalBoard: string[][], isT: boolean, extraMs = 0): Promise<void> {
    return new Promise<void>(resolve => {
      const startTime = performance.now()
      const duration  = (isT ? 150 + r * 50 : 500 + r * 150) + extraMs

      function tick(): void {
        const elapsed  = performance.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        // Clear blur 200 ms before landing so symbols are readable
        if (elapsed > duration - 200) _clearColBlur(r)
        if (progress < 1) {
          requestAnimationFrame(tick)
        } else {
          _clearColBlur(r)
          // Update this reel's video cells to the final symbols
          const reel = finalBoard[r] ?? []
          for (let row = 0; row < ROWS; row++) {
            const sym = (reel[row] ?? 'L3').toUpperCase()
            const vid = videoRefs[r][row]
            if (vid) {
              vid.setAttribute('data-symbol', sym)
              vid.src = getIdleSrc(sym)
              vid.loop = true
              vid.load()
              vid.play().catch(() => {})
              vid.style.opacity = '1'
            }
          }
          playReelStop(r)
          if ((finalBoard[r] ?? []).some(sym => sym === 'S')) playScatterLand()
          _bounceCol(r).then(resolve)
        }
      }

      requestAnimationFrame(tick)
    })
  }

  // ── Public API — called by App.svelte ─────────────────────────────────────
  export async function animateSpin(finalBoard: string[][]): Promise<void> {
    if (!assetsReady) return

    winHighlightLayer?.clear()
    _resetToIdle()

    isSpinning.set(true)
    playSpinStart()

    const isT = get(isTurbo)

    // Blur all reels at spin start
    for (let r = 0; r < REELS; r++) _blurCol(r)

    // Reels 0–1 land first
    await Promise.all([0, 1].map(r => _spinReel(r, finalBoard, isT)))

    // Scatter anticipation: 2+ scatters in first two reels → glow remaining
    const scattersLanded = [0, 1].reduce((acc, r) =>
      acc + (finalBoard[r] ?? []).filter(s => s === 'S').length, 0)
    if (scattersLanded >= 2) _scatterAnticipation(1)

    // Reels 2–3 land
    await Promise.all([2, 3].map(r => _spinReel(r, finalBoard, isT)))
    ;[2, 3].forEach(r => _clearColBlur(r))

    // Anticipation on reel 4: slow it by 600 ms if reels 0–2 near-match high-value
    const anticipate = !isT && _checkAnticipation(finalBoard)
    if (anticipate) playAnticipation()
    await _spinReel(4, finalBoard, isT, anticipate ? 600 : 0)
    _clearColBlur(4)

    isSpinning.set(false)
  }
</script>

<div class="grid-container">
  <!-- Symbol video grid — 5 columns × 4 rows, absolutely positioned -->
  <div class="symbol-grid">
    {#each Array(REELS) as _, col}
      <div class="symbol-col" bind:this={colRefs[col]} data-col={col}>
        {#each Array(ROWS) as _, row}
          <div class="symbol-cell" data-col={col} data-row={row}>
            {#if videoSupported}
              <video
                bind:this={videoRefs[col][row]}
                class="symbol-video"
                autoplay
                loop
                muted
                playsinline
                data-col={col}
                data-row={row}
              ></video>
            {:else}
              <!-- PNG fallback for devices that cannot play video -->
              <img
                class="symbol-img"
                src="{PNG_IDLE}/{($boardSymbols?.[col]?.[row] ?? 'L3').toUpperCase()}.png"
                alt=""
                draggable="false"
              />
            {/if}
          </div>
        {/each}
      </div>
    {/each}
  </div>

  <!-- PixiJS canvas — transparent overlay for win lines and cell borders -->
  <div bind:this={pixiContainer} class="pixi-overlay"></div>
</div>

<style>
  /* Outer container — fixed to match PixiJS canvas dimensions (616 × 412) */
  .grid-container {
    position: relative;
    width: 616px;
    height: 412px;
    border-radius: 12px;
    overflow: hidden;
    box-shadow:
      0 0 40px rgba(0, 100, 255, 0.25),
      0 0 80px rgba(80, 0, 180, 0.15),
      inset 0 0 60px rgba(0, 0, 30, 0.8);
  }

  /* Five-column flex row; column gap matches GAP=4 so win-line coords align */
  .symbol-grid {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: row;
    gap: 4px;
  }

  /* Each column: 120 px wide, 4 rows stacked, row gap 4 px */
  .symbol-col {
    display: flex;
    flex-direction: column;
    gap: 4px;
    will-change: transform, filter;
  }

  /* Each cell: 120 × 100 px — matches CELL_W / CELL_H */
  .symbol-cell {
    width: 120px;
    height: 100px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(9, 9, 20, 0.85);
    border-radius: 8px;
    overflow: hidden;
  }

  .symbol-video {
    width: 100%;
    height: 100%;
    object-fit: contain;
    transition: opacity 0.15s ease;
  }

  .symbol-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    transition: opacity 0.15s ease;
  }

  /* PixiJS canvas — transparent, drawn on top of the video grid */
  .pixi-overlay {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 2;
  }

  .pixi-overlay :global(canvas) {
    display: block;
  }
</style>
