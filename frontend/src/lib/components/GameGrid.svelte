<script lang="ts">
  /**
   * GameGrid.svelte — themed vector symbol grid (Motion Polish v2)
   *
   * Symbol display: two stacked <img> layers per cell — a base layer (the
   *   full symbol, or the layered "base" export for H1/H2) and an overlay
   *   layer used only by H1 (rotating spoke sprite) and H2 (needle sprite);
   *   every other symbol leaves the overlay hidden and gets a CSS idle class
   *   on the base layer instead (lineup-table micro-motion).
   * Reel feel: ticker-driven (PixiJS app.ticker, 60fps) column motion —
   *   velocity-scaled vertical stretch + rapid symbol-cycling substitutes for
   *   a live CSS blur filter (none used), per-reel staggered stops with an
   *   overshoot/settle bounce, scatter-count anticipation glow that extends
   *   the final reel, and a cancellable slam-stop for mid-spin SPIN presses.
   * Win state: winning cells brighten (others dim), the tile plate edge
   *   blooms in the symbol's signature colour, the symbol punches in scale,
   *   and a pooled Pixi particle burst fires in that colour (no per-frame
   *   allocations — a fixed-size particle array is reused across bursts).
   * Win overlay: PixiJS canvas (transparent) draws gold cell borders and
   *   connecting lines, plus the particle layer, on top of the symbol layer.
   * Public API: animateSpin(board) and slamStop() — called by App.svelte /
   *   HudOverlay.
   */
  import { onMount, onDestroy } from 'svelte'
  import { get } from 'svelte/store'
  import { Application, Graphics } from 'pixi.js'
  import { boardSymbols, activeWins, isSpinning, isTurbo } from '../stores/gameStore'
  import { speedTier } from '../stores/speedMode'
  import { assetLoadProgress } from '../stores/loadingStore'
  import { playSpinStart, playReelStop, playAnticipation, playScatterLand } from '../services/soundService'
  import { activeTheme, themeAssets } from '../stores/themeStore'

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

  // ── Symbol asset paths — reactive to active theme ─────────────────────────
  let _assetBase  = ''
  let SYMBOL_BASE = ''
  $: _assetBase  = $themeAssets.assetBase
  $: SYMBOL_BASE = `${_assetBase}/symbols`

  // ── Tile plate edge tinting — plates.json maps symbol id to its signature
  // colour for the engine-tinted plate behind every symbol (LAYOUT_SPEC law).
  let tilePlateSrc = ''
  let plateColours: Record<string, string> = {}
  let _platesLoadedFor = ''
  $: tilePlateSrc = _assetBase ? `${_assetBase}/symbols/tile_plate.png` : ''
  $: if (_assetBase && _assetBase !== _platesLoadedFor) loadPlates(_assetBase)

  async function loadPlates(base: string): Promise<void> {
    _platesLoadedFor = base
    try {
      const res = await fetch(`${base}/plates.json`)
      const data = await res.json()
      plateColours = data.colours ?? {}
    } catch {
      plateColours = {}
    }
  }

  function plateTint(symbol: string): string {
    const key = _symNameMap[symbol.toUpperCase()] ?? symbol.toLowerCase()
    return plateColours[key] ?? '#00ffff'
  }

  // ── Lineup-table idle micro-motion (Motion Polish v2, DESIGN_SYSTEM) ──────
  // Grille sweep (M2), booster flicker (M3), piston shimmer (L3), plug blink
  // (L2); every other symbol gets the generic gentle breathing pulse. H1/H2
  // get their own overlay-sprite motion (below) in addition to breathing.
  const IDLE_CLASS: Record<string, string> = {
    H2: 'idle-charge',
    M2: 'idle-sweep',
    M3: 'idle-flicker',
    L3: 'idle-shimmer',
    L2: 'idle-blink',
  }
  function idleClass(symbol: string | undefined): string {
    return IDLE_CLASS[(symbol ?? '').toUpperCase()] ?? 'idle-breathe'
  }

  // ── Layered sprites — H1 rotating spoke sprite ───────────────────────────
  // (H2 was a gauge with an isolated needle; the H2 reel symbol is now the
  // Nitro Canister with no separable part, so it renders with no overlay and
  // gets its idle micro-motion on the base layer like the other symbols.)
  const LAYERED_OVERLAY: Record<string, { base: string; overlay: string }> = {
    H1: { base: 'h1_base', overlay: 'h1_spin' },
  }

  function overlayClass(symbol: string | undefined): string {
    const key = (symbol ?? '').toUpperCase()
    if (key === 'H1') return 'h1-overlay'
    return 'overlay-hidden'
  }

  // ── State ─────────────────────────────────────────────────────────────────
  let pixiContainer: HTMLDivElement
  let app: Application
  let winHighlightLayer: Graphics
  let particleLayer: Graphics
  let assetsReady = false

  // Cell refs — cellRefs for the plate-bloom class, imgRefs the base symbol
  // layer, overlayRefs the H1/H2 spoke-or-needle layer (hidden otherwise).
  let cellRefs: (HTMLDivElement | null)[][] =
    Array.from({ length: REELS }, () => Array.from({ length: ROWS }, (): HTMLDivElement | null => null))
  let imgRefs: (HTMLImageElement | null)[][] =
    Array.from({ length: REELS }, () => Array.from({ length: ROWS }, (): HTMLImageElement | null => null))
  let overlayRefs: (HTMLImageElement | null)[][] =
    Array.from({ length: REELS }, () => Array.from({ length: ROWS }, (): HTMLImageElement | null => null))

  // Column wrapper refs for the spin stretch/cycle and bounce
  let colRefs: (HTMLDivElement | null)[] = Array.from({ length: REELS }, (): HTMLDivElement | null => null)

  // Spin overlay refs — one per column, covers column during spin
  let spinOverlayRefs: (HTMLDivElement | null)[] = Array.from({ length: REELS }, (): HTMLDivElement | null => null)

  // Win burst state
  let winBurstTimer: ReturnType<typeof setTimeout> | null = null

  // ── Ticker-driven column spin motion (60fps via app.ticker) ──────────────
  const CYCLE_POOL = ['H1', 'H2', 'M1', 'M2', 'M3', 'L1', 'L2', 'L3', 'W', 'S']
  const CYCLE_INTERVAL_MS = 60
  let spinningCols: boolean[] = Array(REELS).fill(false)
  let cycleTimers: number[] = Array(REELS).fill(0)
  let tickerFn: (() => void) | null = null

  function symbolCycleSrc(symbol: string): string {
    // Smaller variant for the rapid noise-cycle — decode cost matters here,
    // not detail (the column is stretched/dimmed throughout).
    const fname = _symNameMap[symbol.toUpperCase()] ?? symbol.toLowerCase()
    return `${SYMBOL_BASE}/${fname}_1x.png`
  }

  function _cycleColumnRandom(col: number): void {
    for (let row = 0; row < ROWS; row++) {
      const img = imgRefs[col]?.[row]
      if (!img) continue
      img.src = symbolCycleSrc(CYCLE_POOL[Math.floor(Math.random() * CYCLE_POOL.length)])
    }
  }

  // ── Pooled Pixi particle burst — fixed-size array, no per-frame allocation
  interface Particle {
    active: boolean
    x: number; y: number
    vx: number; vy: number
    life: number; maxLife: number
    color: number; size: number
  }
  const PARTICLE_POOL_SIZE = 90
  const particles: Particle[] = Array.from({ length: PARTICLE_POOL_SIZE }, () => ({
    active: false, x: 0, y: 0, vx: 0, vy: 0, life: 0, maxLife: 0, color: 0xffffff, size: 0,
  }))

  function spawnBurst(x: number, y: number, colorHex: string, count = 16): void {
    const color = hexToPixi(colorHex)
    let spawned = 0
    for (const p of particles) {
      if (spawned >= count) break
      if (p.active) continue
      const angle = Math.random() * Math.PI * 2
      const speed = 70 + Math.random() * 110
      p.active  = true
      p.x = x; p.y = y
      p.vx = Math.cos(angle) * speed
      p.vy = Math.sin(angle) * speed
      p.life = 0
      p.maxLife = 450 + Math.random() * 350
      p.color = color
      p.size = 2 + Math.random() * 3
      spawned++
    }
  }

  function _tickParticles(deltaMS: number): void {
    if (!particleLayer) return
    particleLayer.clear()
    for (const p of particles) {
      if (!p.active) continue
      p.life += deltaMS
      if (p.life >= p.maxLife) { p.active = false; continue }
      const dtS = deltaMS / 1000
      p.x += p.vx * dtS
      p.y += p.vy * dtS
      p.vy += 160 * dtS // gentle gravity
      const t = p.life / p.maxLife
      particleLayer.beginFill(p.color, 1 - t)
      particleLayer.drawCircle(p.x, p.y, p.size * (1 - t * 0.5))
      particleLayer.endFill()
    }
  }

  function _startTicker(): void {
    if (tickerFn || !app) return
    tickerFn = () => {
      const dtMs = app.ticker.deltaMS
      for (let c = 0; c < REELS; c++) {
        if (!spinningCols[c]) continue
        cycleTimers[c] += dtMs
        if (cycleTimers[c] >= CYCLE_INTERVAL_MS) {
          cycleTimers[c] = 0
          _cycleColumnRandom(c)
        }
      }
      _tickParticles(dtMs)
    }
    app.ticker.add(tickerFn)
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  onMount(() => {
    // Transparent PixiJS canvas — win lines + particles only, no symbol rendering
    try {
      app = new Application({
        width:           CANVAS_W,
        height:          CANVAS_H,
        backgroundAlpha: 0,
        antialias:       true,
      })
      pixiContainer.appendChild(app.view as HTMLCanvasElement)
      winHighlightLayer = new Graphics()
      particleLayer = new Graphics()
      app.stage.addChild(winHighlightLayer)
      app.stage.addChild(particleLayer)
      assetsReady = true
      _startTicker()
    } catch (err) {
      console.error('[GameGrid] PixiJS init failed — win lines disabled:', err)
    }

    // Always signal loading complete — must not stay stuck at 0%
    assetLoadProgress.set(100)

    const unsubBoard = boardSymbols.subscribe(board => {
      if (assetsReady && board && board.length === REELS) _updateSymbols(board)
    })

    const unsubWins = activeWins.subscribe(() => {
      if (assetsReady) _applyWinHighlights()
    })

    return () => { unsubBoard(); unsubWins() }
  })

  onDestroy(() => {
    if (winBurstTimer) clearTimeout(winBurstTimer)
    if (tickerFn) app?.ticker.remove(tickerFn)
    app?.destroy(true)
  })

  // ── Symbol path helpers ───────────────────────────────────────────────────
  const _symNameMap: Record<string, string> = {
    'H1': 'h1', 'H2': 'h2',
    'M1': 'm1', 'M2': 'm2', 'M3': 'm3',
    'L1': 'l1', 'L2': 'l2', 'L3': 'l3',
    'W':  'wild', 'S': 'scatter'
  }

  function symbolSrc(symbol: string): string {
    const fname = _symNameMap[symbol.toUpperCase()] ?? symbol.toLowerCase()
    return `${SYMBOL_BASE}/${fname}.png`
  }

  function symbolBaseSrc(symbol: string): string {
    const key = symbol.toUpperCase()
    const layered = LAYERED_OVERLAY[key]
    return layered ? `${SYMBOL_BASE}/${layered.base}.png` : symbolSrc(symbol)
  }

  function symbolOverlaySrc(symbol: string): string | null {
    const layered = LAYERED_OVERLAY[symbol.toUpperCase()]
    return layered ? `${SYMBOL_BASE}/${layered.overlay}.png` : null
  }

  function _setCellSymbol(col: number, row: number, symbol: string): void {
    const img = imgRefs[col]?.[row]
    if (img) {
      img.src = symbolBaseSrc(symbol)
      img.style.opacity = '1'
    }
    const overlay = overlayRefs[col]?.[row]
    if (overlay) {
      const overlaySrc = symbolOverlaySrc(symbol)
      if (overlaySrc) {
        overlay.src = overlaySrc
        overlay.style.display = 'block'
      } else {
        overlay.style.display = 'none'
      }
    }
  }

  // ── Update all symbol cells to idle state for given board ─────────────────
  function _updateSymbols(board: string[][]): void {
    for (let col = 0; col < REELS; col++) {
      for (let row = 0; row < ROWS; row++) {
        _setCellSymbol(col, row, (board[col]?.[row] ?? 'L3').toUpperCase())
      }
    }
  }

  // ── Win burst — highlight winning cells, dim non-winners, plate bloom,
  // punch scale, particle burst, H1 spin-up / H2 redline slam ──────────────
  function _triggerWinBurst(
    wins: Array<{ symbol: string; kind: number; ways: number; payout: number }>,
    board: string[][]
  ): void {
    if (winBurstTimer) clearTimeout(winBurstTimer)

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

    const STRIP_W = CELL_W + GAP
    const STRIP_H = CELL_H + GAP

    for (let col = 0; col < REELS; col++) {
      for (let row = 0; row < ROWS; row++) {
        const symbol = board[col]?.[row]
        if (!symbol) continue
        const key = `${col},${row}`
        const img     = imgRefs[col]?.[row]
        const overlay = overlayRefs[col]?.[row]
        const cell    = cellRefs[col]?.[row]
        if (!img) continue

        if (winningCells.has(key)) {
          img.style.opacity = '1'
          img.classList.add('win-flash')
          cell?.classList.add('plate-bloom')
          const upperSym = symbol.toUpperCase()
          if (upperSym === 'H1') overlay?.classList.add('win-spin-fast')
          spawnBurst(col * STRIP_W + CELL_W / 2, row * STRIP_H + CELL_H / 2, plateTint(symbol))
        } else {
          img.style.opacity = '0.35'
        }
      }
    }

    // After 4.0 s: restore all to idle
    winBurstTimer = setTimeout(() => {
      for (let col = 0; col < REELS; col++) {
        for (let row = 0; row < ROWS; row++) {
          const img     = imgRefs[col]?.[row]
          const overlay = overlayRefs[col]?.[row]
          const cell    = cellRefs[col]?.[row]
          if (img) { img.style.opacity = '1'; img.classList.remove('win-flash') }
          overlay?.classList.remove('win-spin-fast')
          cell?.classList.remove('plate-bloom')
        }
      }
    }, 4000)
  }

  // ── Reset all cells to idle (called at spin start) ────────────────────────
  function _resetToIdle(): void {
    if (winBurstTimer) { clearTimeout(winBurstTimer); winBurstTimer = null }
    for (let col = 0; col < REELS; col++) {
      for (let row = 0; row < ROWS; row++) {
        const img     = imgRefs[col]?.[row]
        const overlay = overlayRefs[col]?.[row]
        const cell    = cellRefs[col]?.[row]
        if (img) { img.style.opacity = '1'; img.classList.remove('win-flash') }
        overlay?.classList.remove('win-spin-fast')
        cell?.classList.remove('plate-bloom')
      }
    }
  }

  // ── Spin motion — velocity-scaled vertical stretch + ticker symbol cycling.
  // No CSS blur() filter is used anywhere (Motion Polish v2 requirement).
  function _blurCol(colIndex: number): void {
    const col = colRefs[colIndex]
    const overlay = spinOverlayRefs[colIndex]
    spinningCols[colIndex] = true
    cycleTimers[colIndex] = 0
    if (col) {
      col.style.transform = 'scaleY(1.18)'
      col.style.filter = 'brightness(0.55)'
    }
    if (overlay) {
      overlay.style.opacity = '0.28'
      overlay.style.animation = 'spin-scroll 0.08s linear infinite'
    }
    // Layered overlays (H1 spoke / H2 needle) only apply once a reel lands.
    for (let row = 0; row < ROWS; row++) {
      const ov = overlayRefs[colIndex]?.[row]
      if (ov) ov.style.display = 'none'
    }
  }

  function _clearColBlur(colIndex: number): void {
    const col = colRefs[colIndex]
    const overlay = spinOverlayRefs[colIndex]
    spinningCols[colIndex] = false
    if (col) {
      col.style.transition = 'transform 0.15s ease-out, filter 0.15s ease-out'
      col.style.transform = ''
      col.style.filter = ''
      setTimeout(() => { if (col) col.style.transition = '' }, 180)
    }
    if (overlay) {
      overlay.style.opacity = '0'
      overlay.style.animation = ''
      overlay.style.filter = ''
    }
  }

  // ── Overshoot slam + settle bounce (rAF-driven, ticker-style) ─────────────
  function _bounceCol(colIndex: number, fast: boolean): Promise<void> {
    return new Promise(resolve => {
      const col = colRefs[colIndex]
      if (!col) { resolve(); return }
      const OVERSHOOT = fast ? 3 : 10
      const DUR1 = fast ? 20 : 90
      const DUR2 = fast ? 12 : 45
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

  // ── Scatter anticipation — glow tint on spinning overlay of upcoming columns
  function _scatterAnticipation(lastStoppedReel: number): void {
    for (let r = lastStoppedReel + 1; r < REELS; r++) {
      const overlay = spinOverlayRefs[r]
      if (overlay) overlay.style.filter = 'brightness(1.6) saturate(1.8) drop-shadow(0 0 10px rgba(0,255,255,0.6))'
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

    for (const key of winningCells) {
      const [r, row] = key.split(',').map(Number)
      winHighlightLayer.lineStyle(2, wlc, 0.85)
      winHighlightLayer.beginFill(wlc, 0.08)
      winHighlightLayer.drawRoundedRect(
        r * STRIP_W + 2, row * STRIP_H + 2, CELL_W - 4, CELL_H - 4, 6
      )
      winHighlightLayer.endFill()
    }

    for (const win of wins) {
      const reelCount = win.kind ?? 3
      const points: { x: number; y: number }[] = []
      for (let r = 0; r < reelCount; r++) {
        const reelSymbols = board[r] ?? []
        for (let row = 0; row < ROWS; row++) {
          const sym = reelSymbols[row]
          if (sym === win.symbol || sym === 'W') {
            points.push({ x: r * STRIP_W + CELL_W / 2, y: row * STRIP_H + CELL_H / 2 })
            break
          }
        }
      }
      if (points.length >= 2) {
        winHighlightLayer.lineStyle(2, wlc, 0.6)
        winHighlightLayer.moveTo(points[0].x, points[0].y)
        for (let i = 1; i < points.length; i++) winHighlightLayer.lineTo(points[i].x, points[i].y)
        winHighlightLayer.lineStyle(6, wlc, 0.15)
        winHighlightLayer.moveTo(points[0].x, points[0].y)
        for (let i = 1; i < points.length; i++) winHighlightLayer.lineTo(points[i].x, points[i].y)
      }
    }

    _triggerWinBurst(wins, board)
  }

  // ── Land a single reel — update symbols, sounds, bounce ──────────────────
  async function _landReel(r: number, finalBoard: string[][]): Promise<void> {
    _clearColBlur(r)

    const reel = finalBoard[r] ?? []
    for (let row = 0; row < ROWS; row++) {
      _setCellSymbol(r, row, (reel[row] ?? 'L3').toUpperCase())
    }

    playReelStop(r)
    if ((finalBoard[r] ?? []).some(sym => sym === 'S')) playScatterLand()
    await _bounceCol(r, slamRequested)
  }

  // ── Slam-stop — cancellable wait, resolved instantly on request ─────────
  let slamRequested = false
  let pendingWaitAbort: (() => void) | null = null

  function wait(ms: number): Promise<void> {
    if (slamRequested) return Promise.resolve()
    return new Promise<void>((resolve) => {
      const t = setTimeout(() => { pendingWaitAbort = null; resolve() }, ms)
      pendingWaitAbort = () => { clearTimeout(t); pendingWaitAbort = null; resolve() }
    })
  }

  /** Pressing SPIN mid-spin slam-stops all reels instantly (outcome unchanged). */
  export function slamStop(): void {
    if (!get(isSpinning) || slamRequested) return
    slamRequested = true
    for (let c = 0; c < REELS; c++) spinningCols[c] = false
    if (pendingWaitAbort) pendingWaitAbort()
  }

  // ── Public API — called by App.svelte ─────────────────────────────────────
  export async function animateSpin(finalBoard: string[][]): Promise<void> {
    if (!assetsReady) return

    winHighlightLayer?.clear()
    _resetToIdle()
    slamRequested = false

    isSpinning.set(true)
    playSpinStart()

    const isT = get(isTurbo)
    // Speed tiers: Normal 1x, Turbo 0.5x, Super Turbo 0.16x (near-instant).
    // isTurbo (locked gameStore) still gates the plain turbo halving above it;
    // speedTier layers the Super Turbo reduction on top, non-locked.
    const tier = get(speedTier)
    const speedFactor = tier === 'super' ? 0.16 : isT ? 0.5 : 1

    for (let r = 0; r < REELS; r++) {
      _blurCol(r)
    }

    // Normal: 600 / 900 / 1200 / 1500 ms   Turbo: half   Super Turbo: ~1/6
    const BASE_STOPS = [600, 900, 1200, 1500]
    let scattersLandedCount = 0
    let anticipationGlowApplied = false

    for (let r = 0; r < 4; r++) {
      const dur = BASE_STOPS[r] * speedFactor
      await wait(dur)
      await _landReel(r, finalBoard)

      scattersLandedCount += (finalBoard[r] ?? []).filter(s => s === 'S').length
      if (scattersLandedCount >= 2 && !anticipationGlowApplied) {
        anticipationGlowApplied = true
        _scatterAnticipation(r)
      }
    }

    // Final reel — extended anticipation hold when 2+ scatters are already
    // landed (owner priority: scatter-driven anticipation), or the legacy
    // near-miss check as a secondary trigger. Slam-stop skips this entirely.
    const scatterAnticipate = scattersLandedCount >= 2
    const nearMissAnticipate = !isT && !scatterAnticipate && _checkAnticipation(finalBoard)
    if (scatterAnticipate || nearMissAnticipate) {
      if (!anticipationGlowApplied) _scatterAnticipation(3)
      playAnticipation()
      const holdMs = (scatterAnticipate ? 900 : 600) * speedFactor
      await wait(holdMs)
    }
    await _landReel(4, finalBoard)

    isSpinning.set(false)
  }
</script>

<div class="grid-container">
  <!-- Symbol grid — 5 columns × 4 rows, absolutely positioned -->
  <div class="symbol-grid">
    {#each Array(REELS) as _, col}
      <div class="symbol-col" bind:this={colRefs[col]} data-col={col}>
        {#each Array(ROWS) as _, row}
          <div
            class="symbol-cell"
            bind:this={cellRefs[col][row]}
            data-col={col}
            data-row={row}
            style="--plate-tint: {plateTint($boardSymbols?.[col]?.[row] ?? 'L3')};"
          >
            <!-- Tile plate — signature-colour edge tint per plates.json -->
            {#if tilePlateSrc}
              <img class="tile-plate" src={tilePlateSrc} alt="" draggable="false" aria-hidden="true" />
            {/if}
            <!-- Base symbol layer (idle micro-motion class, reactive to settled board) -->
            <img
              bind:this={imgRefs[col][row]}
              class="symbol-img {idleClass($boardSymbols?.[col]?.[row])}"
              src={symbolBaseSrc($boardSymbols?.[col]?.[row] ?? 'L3')}
              alt={$boardSymbols?.[col]?.[row] ?? 'L3'}
              draggable="false"
            />
            <!-- Overlay layer — H1 rotating spoke sprite / H2 needle sprite only -->
            <img
              bind:this={overlayRefs[col][row]}
              class="symbol-overlay {overlayClass($boardSymbols?.[col]?.[row])}"
              src={symbolOverlaySrc($boardSymbols?.[col]?.[row] ?? '') ?? ''}
              alt=""
              aria-hidden="true"
              draggable="false"
            />
          </div>
        {/each}
        <!-- Spin overlay — covers entire column during spin, fades out on land -->
        <div
          class="spin-overlay"
          bind:this={spinOverlayRefs[col]}
          aria-hidden="true"
        ></div>
      </div>
    {/each}
  </div>

  <!-- PixiJS canvas — transparent overlay for win lines, particles and cell borders -->
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
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 4px;
    will-change: transform, filter;
    overflow: hidden;
    transform-origin: 50% 50%;
  }

  /* Spin overlay — covers entire column, animates to simulate scrolling */
  .spin-overlay {
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
      to bottom,
      rgba(0, 10, 30, 0.85) 0px,
      rgba(10, 20, 50, 0.75) 8px,
      rgba(0, 200, 255, 0.08) 12px,
      rgba(0, 10, 30, 0.85) 16px
    );
    opacity: 0;
    transition: opacity 0.15s ease;
    pointer-events: none;
    z-index: 3;
  }

  @keyframes spin-scroll {
    0%   { background-position: 0 0; }
    100% { background-position: 0 -32px; }
  }

  /* Each cell: 120 × 100 px — matches CELL_W / CELL_H */
  .symbol-cell {
    position: relative;
    width: 120px;
    height: 100px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(9, 9, 20, 0.85);
    border-radius: 8px;
    overflow: visible; /* particle burst / bloom glow may extend past the cell */
    box-shadow: inset 0 0 10px 1px color-mix(in srgb, var(--plate-tint, #00ffff) 55%, transparent);
  }

  .tile-plate {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: fill;
    pointer-events: none;
    border-radius: 8px;
    overflow: hidden;
  }

  .symbol-img {
    position: absolute;
    top: 9%;
    left: 9%;
    width: 82%;
    height: 82%;
    object-fit: contain;
    transition: opacity 0.15s ease;
  }

  /* H1 spoke / H2 needle — stacked on top of the base layer, hidden for
     every other symbol (overlay-hidden, also enforced imperatively during spin). */
  .symbol-overlay {
    position: absolute;
    top: 9%;
    left: 9%;
    width: 82%;
    height: 82%;
    object-fit: contain;
    pointer-events: none;
    transform-origin: 50% 50%;
  }
  .symbol-overlay.overlay-hidden { display: none; }

  /* ── Lineup-table idle micro-motion ───────────────────────────────────── */
  @keyframes idle-breathe {
    0%, 100% { transform: scale(1); }
    50%      { transform: scale(1.015); }
  }
  @keyframes idle-sweep {
    0%, 100% { filter: brightness(1); }
    45%, 55%  { filter: brightness(1.28) drop-shadow(0 0 6px rgba(138, 92, 255, 0.6)); }
  }
  @keyframes idle-flicker {
    0%, 100% { filter: brightness(1) saturate(1); transform: scale(1); }
    50%      { filter: brightness(1.18) saturate(1.3); transform: scale(1.015); }
  }
  @keyframes idle-shimmer {
    0%, 100% { filter: brightness(1); }
    50%      { filter: brightness(1.12) drop-shadow(0 0 5px rgba(255, 122, 46, 0.45)); }
  }
  @keyframes idle-blink {
    0%, 88%, 100% { filter: brightness(1); }
    92%            { filter: brightness(1.7) drop-shadow(0 0 8px rgba(154, 220, 255, 0.9)); }
    96%            { filter: brightness(1); }
  }
  .idle-breathe { animation: idle-breathe 3.4s ease-in-out infinite; }
  .idle-sweep   { animation: idle-sweep 3.2s ease-in-out infinite; }
  .idle-flicker { animation: idle-flicker 0.9s steps(2, jump-none) infinite; }
  .idle-shimmer { animation: idle-shimmer 2.2s ease-in-out infinite; }
  .idle-blink   { animation: idle-blink 3s linear infinite; }
  /* H2 Nitro Canister — crimson charge-glow pulse (Opus elevate, Task 2 idle
     life): the premium reel symbol reads as "charged" rather than inert. */
  @keyframes idle-charge {
    0%, 100% { filter: brightness(1) drop-shadow(0 0 2px rgba(255, 45, 61, 0.35)); }
    50%      { filter: brightness(1.12) drop-shadow(0 0 9px rgba(255, 45, 61, 0.85)); }
  }
  .idle-charge  { animation: idle-charge 2.6s ease-in-out infinite; }

  /* H1 — continuous idle rotation (5-fold symmetry loops seamlessly every
     72deg), spins up fast on wins. */
  @keyframes h1-idle-spin { to { transform: rotate(72deg); } }
  @keyframes h1-win-spin  { from { transform: rotate(0deg); } to { transform: rotate(720deg); } }
  .symbol-overlay.h1-overlay { animation: h1-idle-spin 4s linear infinite; }
  .symbol-overlay.h1-overlay.win-spin-fast { animation: h1-win-spin 0.6s cubic-bezier(0.2, 0.8, 0.3, 1) 1; }

  /* ── Win state — brighten, plate bloom, punch scale ──────────────────── */
  @keyframes plate-bloom-pulse {
    0%, 100% { box-shadow: inset 0 0 10px 1px color-mix(in srgb, var(--plate-tint, #00ffff) 55%, transparent); }
    50%      {
      box-shadow:
        inset 0 0 22px 4px color-mix(in srgb, var(--plate-tint, #00ffff) 95%, transparent),
        0 0 16px 3px color-mix(in srgb, var(--plate-tint, #00ffff) 70%, transparent);
    }
  }
  .symbol-cell.plate-bloom { animation: plate-bloom-pulse 0.7s ease-in-out infinite; z-index: 5; }

  @keyframes win-flash-pulse {
    0%, 100% { filter: brightness(1) drop-shadow(0 0 8px rgba(0, 255, 255, 0.8)); transform: scale(1); }
    30%      { transform: scale(1.16); }
    50%      { filter: brightness(1.35) drop-shadow(0 0 16px rgba(0, 255, 255, 1)); transform: scale(1.05); }
  }
  .symbol-img:global(.win-flash) {
    animation: win-flash-pulse 0.6s ease-in-out infinite;
  }

  /* PixiJS canvas — transparent, drawn on top of the symbol grid */
  .pixi-overlay {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 2;
  }

  .pixi-overlay :global(canvas) {
    display: block;
  }

  @media (prefers-reduced-motion: reduce) {
    .idle-breathe, .idle-sweep, .idle-flicker, .idle-shimmer, .idle-blink, .idle-charge,
    .symbol-overlay.h1-overlay,
    .symbol-img:global(.win-flash), .symbol-cell.plate-bloom {
      animation: none !important;
    }
  }
</style>
