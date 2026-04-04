<script lang="ts">
  /**
   * GameGrid.svelte — PixiJS canvas wrapper for Future Spinner
   *
   * Renders a 5-reel × 4-row grid using the cyberpunk PNG assets.
   * Assets are preloaded with PIXI.Assets.load() before the grid builds.
   * Falls back to coloured placeholder rectangles if a texture is missing.
   *
   * Spin animation: reels scroll downward sequentially, stopping one-by-one.
   * Turbo mode halves all durations.
   * Win highlights: scale-up + white flash on winning cells; non-winners dimmed.
   * S symbol: pulsing cyan/magenta glow via PIXI Ticker.
   */
  import { onMount, onDestroy } from 'svelte'
  import { get } from 'svelte/store'
  import { Assets, Application, Container, Graphics, Sprite, Texture, Text, ColorMatrixFilter, Ticker, BlurFilter, BLEND_MODES } from 'pixi.js'
  import { boardSymbols, activeWins, isSpinning, isTurbo } from '../stores/gameStore'
  import { assetLoadProgress } from '../stores/loadingStore'
  import { playSpinStart, playReelStop, playAnticipation, playScatterLand } from '../services/soundService'

  // ── Layout constants ──────────────────────────────────────────────────────
  const REELS    = 5
  const ROWS     = 4
  const CELL_W   = 120
  const CELL_H   = 100
  const GAP      = 4
  const PADDING  = 8          // sprite inset within each cell
  const CANVAS_W = REELS * CELL_W + (REELS - 1) * GAP
  const CANVAS_H = ROWS  * CELL_H + (ROWS  - 1) * GAP

  // ── Symbol → asset filename map ───────────────────────────────────────────
  const SYMBOL_TEXTURES: Record<string, string> = {
    H1: 'assets/symbols/h1_futuristic_rim_variant_02.png',
    H2: 'assets/symbols/h2_neon_turbocharger_variant_01.png',
    M1: 'assets/symbols/m1_holographic_grille_variant_09_original.png',
    M2: 'assets/symbols/m2_glowing_exhaust_variant_01.png',
    M3: 'assets/symbols/m3_holographic_steering_wheel_variant_03.png',
    L1: 'assets/symbols/l1_chrome_lug_nut_variant_05.png',
    L2: 'assets/symbols/l2_chrome_spark_plug_variant_05.png',
    L3: 'assets/symbols/l3_neon_piston_variant_08.png',
    W:  'assets/symbols/wild_cyberpunk_logo_variant_04.png',
    S:  'assets/symbols/scatter_energy_burst_variant_01.png',
  }

  // Fallback colours — used if a texture fails to load
  const FALLBACK_COLOURS: Record<string, number> = {
    H1: 0xffd700, H2: 0xff6b35, M1: 0x4fc3f7, M2: 0x81c784,
    M3: 0xba68c8, L1: 0xe57373, L2: 0x4dd0e1, L3: 0xaed581,
    W:  0xffffff, S:  0xff4081,
  }

  // ── State ─────────────────────────────────────────────────────────────────
  let container: HTMLDivElement
  let app: Application
  let reelContainers: Container[] = []
  let cellContainers: Container[][] = []   // [reel][row]
  let winHighlightLayer: Graphics
  let assetsReady = false

  /** Live scatter sprites — pulsed by the scatter glow ticker */
  let scatterSprites: Sprite[] = []
  /** Ticker listener reference so we can remove it on destroy */
  let scatterTickerFn: ((dt: number) => void) | null = null

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  onMount(async () => {
    app = new Application({
      width:      CANVAS_W,
      height:     CANVAS_H,
      background: 0x0d0d1f,
      antialias:  true,
    })
    container.appendChild(app.view as HTMLCanvasElement)

    // Preload all symbol textures before building the grid
    await _preloadTextures()

    assetsReady = true
    _buildGrid()
    _startScatterGlow()

    // React to board store updates (called after spin resolves)
    const unsubBoard = boardSymbols.subscribe(board => {
      if (assetsReady && board && board.length === REELS) _updateBoard(board)
    })

    // React to win events — apply highlights after activeWins is updated
    const unsubWins = activeWins.subscribe(() => {
      if (assetsReady) _applyWinHighlights()
    })

    return () => {
      unsubBoard()
      unsubWins()
    }
  })

  onDestroy(() => {
    if (scatterTickerFn && app?.ticker) app.ticker.remove(scatterTickerFn)
    app?.destroy(true)
  })

  // ── Asset preloading ──────────────────────────────────────────────────────
  async function _preloadTextures(): Promise<void> {
    const urls = Object.values(SYMBOL_TEXTURES)
    assetLoadProgress.set(0)
    try {
      await Assets.load(urls, (progress: number) => {
        assetLoadProgress.set(Math.round(progress * 100))
      })
    } catch (err) {
      // Non-fatal: _makeCell falls back to placeholder for any missing texture
      console.warn('[GameGrid] Texture load error:', err)
      for (const [key, url] of Object.entries(SYMBOL_TEXTURES)) {
        try {
          await Assets.load(url)
          console.log(`[GameGrid] ✅ ${key}: ${url}`)
        } catch (e) {
          console.error(`[GameGrid] ❌ FAILED: ${key}: ${url}`, e)
        }
      }
    }
    assetLoadProgress.set(100)
  }

  // ── Scatter glow (PIXI Ticker) ─────────────────────────────────────────────
  function _startScatterGlow(): void {
    scatterTickerFn = () => {
      // Prune destroyed sprites
      scatterSprites = scatterSprites.filter(s => !s.destroyed)
      if (scatterSprites.length === 0) return

      // Pulse alpha 0.6 → 1.0 over 1.5 s loop
      const alpha = 0.6 + 0.4 * (0.5 + 0.5 * Math.sin((performance.now() / 1500) * Math.PI * 2))
      for (const s of scatterSprites) s.alpha = alpha
    }
    app.ticker.add(scatterTickerFn)
  }

  // ── Grid construction ─────────────────────────────────────────────────────
  function _buildGrid(): void {
    for (let r = 0; r < REELS; r++) {
      const rc = new Container()
      rc.x = r * (CELL_W + GAP)

      // Clip mask — symbols that scroll out of the reel window are hidden
      const mask = new Graphics()
      mask.beginFill(0xffffff)
      mask.drawRect(0, 0, CELL_W, ROWS * CELL_H + (ROWS - 1) * GAP)
      mask.endFill()
      rc.addChild(mask)
      rc.mask = mask

      reelContainers.push(rc)
      cellContainers.push([])

      for (let row = 0; row < ROWS; row++) {
        const cell = _makeCell('L3', false)
        cell.y = row * (CELL_H + GAP)
        rc.addChild(cell)
        cellContainers[r].push(cell)
      }

      app.stage.addChild(rc)
    }

    // Win highlight overlay — kept for potential future use; cleared each spin
    winHighlightLayer = new Graphics()
    app.stage.addChild(winHighlightLayer)
  }

  // ── Cell factory ──────────────────────────────────────────────────────────
  function _makeCell(symbol: string, highlighted: boolean): Container {
    const c = new Container()

    // Background panel — use low alpha so PNG symbols read against the city bg
    const bg = new Graphics()
    bg.beginFill(highlighted ? 0x1e1a00 : 0x090914, highlighted ? 0.82 : 0.45)
    bg.lineStyle(highlighted ? 2 : 1, highlighted ? 0xffd700 : 0x1e1e38, highlighted ? 1 : 0.7)
    bg.drawRoundedRect(0, 0, CELL_W, CELL_H, 8)
    bg.endFill()
    c.addChild(bg)

    // Symbol sprite (or fallback placeholder)
    const url = SYMBOL_TEXTURES[symbol]
    const tex  = url ? Assets.get<Texture>(url) : null

    if (tex && tex !== Texture.EMPTY) {
      const sprite = new Sprite(tex)

      // Scale to fit within the cell with padding, preserving aspect ratio
      const maxW  = CELL_W - PADDING * 2
      const maxH  = CELL_H - PADDING * 2
      const scale = Math.min(maxW / tex.width, maxH / tex.height)
      sprite.scale.set(scale)

      // Centre within the cell
      sprite.x = Math.round((CELL_W - sprite.width)  / 2)
      sprite.y = Math.round((CELL_H - sprite.height) / 2)

      // Cyberpunk saturation boost via ColorMatrixFilter
      const cmf = new ColorMatrixFilter()
      cmf.saturate(0.2, true)
      sprite.filters = [cmf]

      if (symbol === 'W') {
        // Draw a dark background panel behind the WILD sprite to mask white PNG background
        const wildMask = new Graphics()
        wildMask.beginFill(0x080818, 1.0)
        wildMask.drawRoundedRect(
          PADDING,
          PADDING,
          CELL_W - PADDING * 2,
          CELL_H - PADDING * 2,
          8
        )
        wildMask.endFill()
        c.addChild(wildMask)  // add before sprite so it sits behind
        // Clear any filters or blend modes
        sprite.filters = []
        sprite.blendMode = BLEND_MODES.NORMAL
        sprite.tint = 0xffffff
      }

      if (symbol === 'S') {
        // Scatter: cyan/magenta tint; alpha pulsed by scatter ticker
        sprite.tint = 0xff99ff
        scatterSprites.push(sprite)
      }

      c.addChild(sprite)
    } else {
      // Fallback: coloured circle + symbol name
      const dot = new Graphics()
      dot.beginFill(FALLBACK_COLOURS[symbol] ?? 0x666666)
      dot.drawCircle(CELL_W / 2, CELL_H / 2 - 10, 22)
      dot.endFill()
      c.addChild(dot)

      const label = new Text(symbol, {
        fontFamily: 'Arial', fontSize: 14, fontWeight: 'bold', fill: 0xffffff,
      })
      label.anchor.set(0.5)
      label.x = CELL_W / 2
      label.y = CELL_H / 2 + 20
      c.addChild(label)
    }

    return c
  }

  // ── Board update (called after spin resolves) ─────────────────────────────
  function _updateBoard(board: string[][]): void {
    for (let r = 0; r < REELS; r++) {
      for (let row = 0; row < ROWS; row++) {
        _replaceCell(r, row, board[r]?.[row] ?? 'L3', false)
      }
    }
    // Highlights are drawn separately when activeWins subscription fires
  }

  function _replaceCell(reel: number, row: number, symbol: string, highlighted: boolean): void {
    const old = cellContainers[reel][row]
    const y   = old.y
    const newCell = _makeCell(symbol, highlighted)
    newCell.y = y
    reelContainers[reel].addChild(newCell)
    reelContainers[reel].removeChild(old)
    // Destroy removes sprites from PixiJS; scatter ticker filters out destroyed sprites
    old.destroy({ children: true })
    cellContainers[reel][row] = newCell
  }

  // ── Win highlights — scale-up + white flash on winners; dim non-winners ───
  function _applyWinHighlights(): void {
    if (!winHighlightLayer) return
    winHighlightLayer.clear()

    const wins  = get(activeWins)
    const board = get(boardSymbols)

    // Reset all cells to full alpha and normal scale first
    for (let r = 0; r < REELS; r++) {
      for (let row = 0; row < ROWS; row++) {
        const cell = cellContainers[r]?.[row]
        if (cell) { cell.alpha = 1; cell.scale.set(1) }
      }
    }

    if (!wins.length || !board.length) return

    // Determine which cells are winning
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

    for (let r = 0; r < REELS; r++) {
      for (let row = 0; row < ROWS; row++) {
        const cell = cellContainers[r]?.[row]
        if (!cell) continue

        if (winningCells.has(`${r},${row}`)) {
          // Pulse scale 1.0 → 1.08 → 1.0 via Ticker (3 cycles), then white flash
          _pulseWinCell(cell)
          _flashCell(cell)
        } else {
          // Dim non-winners to 0.4
          _animateAlpha(cell, 1.0, 0.4, 150)
        }
      }
    }
  }

  function _animateScale(target: Container, from: number, to: number, duration: number): void {
    const start = performance.now()
    target.scale.set(from)
    function tick(): void {
      const progress = Math.min((performance.now() - start) / duration, 1)
      const eased    = 1 - Math.pow(1 - progress, 2)
      target.scale.set(from + (to - from) * eased)
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }

  function _animateAlpha(target: Container, from: number, to: number, duration: number): void {
    const start = performance.now()
    target.alpha = from
    function tick(): void {
      const progress = Math.min((performance.now() - start) / duration, 1)
      target.alpha = from + (to - from) * progress
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }

  function _pulseWinCell(cell: Container, duration = 600, repeats = 3): void {
    let elapsed = 0
    let count   = 0
    const ticker = new Ticker()
    ticker.add((delta) => {
      if (cell.destroyed) { ticker.destroy(); return }
      elapsed += delta * (1000 / 60)
      const t = (elapsed % duration) / duration
      const scale = 1.0 + 0.08 * Math.sin(t * Math.PI)
      cell.scale.set(scale)
      if (elapsed >= duration) {
        elapsed -= duration
        count++
        if (count >= repeats) {
          cell.scale.set(1.0)
          ticker.destroy()
        }
      }
    })
    ticker.start()
  }

  function _flashCell(cell: Container): void {
    const flash = new Graphics()
    flash.beginFill(0xffffff, 0.6)
    flash.drawRoundedRect(0, 0, CELL_W, CELL_H, 8)
    flash.endFill()
    cell.addChild(flash)

    const start    = performance.now()
    const duration = 300
    function tick(): void {
      const progress = Math.min((performance.now() - start) / duration, 1)
      flash.alpha = 0.6 * (1 - progress)
      if (progress < 1) {
        requestAnimationFrame(tick)
      } else {
        if (!cell.destroyed) cell.removeChild(flash)
        flash.destroy()
      }
    }
    requestAnimationFrame(tick)
  }

  // ── Blur helpers ──────────────────────────────────────────────────────────
  function _blurReel(reelIndex: number): void {
    const blur = new BlurFilter()
    blur.blurX = 0
    blur.blurY = 10
    reelContainers[reelIndex].filters = [blur]
  }

  function _clearBlur(reelIndex: number): void {
    reelContainers[reelIndex].filters = []
  }

  // ── Snap-back bounce helper ───────────────────────────────────────────────
  function _snapBounce(rc: Container, isT: boolean): Promise<void> {
    return new Promise(resolve => {
      const overshoot = isT ? 3 : 6
      const duration  = isT ? 40 : 80
      rc.y = overshoot
      const start = performance.now()

      function tick(): void {
        const p = Math.min((performance.now() - start) / duration, 1)
        rc.y = overshoot * (1 - p)
        if (p < 1) requestAnimationFrame(tick)
        else { rc.y = 0; resolve() }
      }

      requestAnimationFrame(tick)
    })
  }

  // ── Anticipation check — true if first 4 reels have ≥3 matching high-value symbols ──
  function _checkAnticipation(board: string[][]): boolean {
    const highValue = ['H1', 'H2', 'S']
    // Check any row across first 4 reels
    for (let row = 0; row < ROWS; row++) {
      const syms = [board[0]?.[row], board[1]?.[row], board[2]?.[row], board[3]?.[row]]
      for (const sym of highValue) {
        const count = syms.filter(s => s === sym || s === 'W').length
        if (count >= 3) return true
      }
    }
    return false
  }

  // ── Scatter anticipation glow ─────────────────────────────────────────────
  function _scatterAnticipation(lastStoppedReel: number): void {
    for (let r = lastStoppedReel + 1; r < REELS; r++) {
      const glow = new ColorMatrixFilter()
      glow.brightness(1.15, false)
      reelContainers[r].filters = [glow]
    }
  }

  // ── Single-reel spin helper ────────────────────────────────────────────────
  function _spinReel(r: number, finalBoard: string[][], isT: boolean, extraMs = 0): Promise<void> {
    const STRIP_H = CELL_H + GAP
    return new Promise<void>(resolve => {
      const startTime = performance.now()
      const duration  = (isT ? 150 + r * 50 : 500 + r * 150) + extraMs

      function tick(): void {
        const elapsed  = performance.now() - startTime
        const progress = Math.min(elapsed / duration, 1)

        for (let row = 0; row < ROWS; row++) {
          const cell  = cellContainers[r][row]
          const baseY = row * STRIP_H
          cell.y = baseY + ((elapsed * 0.35) % STRIP_H)
        }

        if (progress < 1) {
          requestAnimationFrame(tick)
        } else {
          const reel = finalBoard[r] ?? []
          for (let row = 0; row < ROWS; row++) {
            _replaceCell(r, row, reel[row] ?? 'L3', false)
            cellContainers[r][row].y = row * STRIP_H
          }

          _clearBlur(r)

          const snapStart = performance.now()
          const snapDur   = isT ? 40 : 80
          function snapTick(): void {
            const sp    = Math.min((performance.now() - snapStart) / snapDur, 1)
            const scale = 1 + 0.05 * Math.sin(sp * Math.PI)
            for (let row = 0; row < ROWS; row++) {
              const cell = cellContainers[r]?.[row]
              if (cell) cell.scale.set(scale)
            }
            if (sp < 1) requestAnimationFrame(snapTick)
            else {
              for (let row = 0; row < ROWS; row++) {
                const cell = cellContainers[r]?.[row]
                if (cell) cell.scale.set(1)
              }
            }
          }
          requestAnimationFrame(snapTick)

          _snapBounce(reelContainers[r], isT).then(() => {
            playReelStop(r)
            // Play scatter land sound if this reel contains a scatter
            if ((finalBoard[r] ?? []).some(sym => sym === 'S')) playScatterLand()
            resolve()
          })
        }
      }

      requestAnimationFrame(tick)
    })
  }

  // ── Public API — called by App.svelte ─────────────────────────────────────
  export async function animateSpin(finalBoard: string[][]): Promise<void> {
    if (!assetsReady) return

    // Clear previous win highlights; reset cell alpha/scale
    winHighlightLayer?.clear()
    for (let r = 0; r < REELS; r++) {
      for (let row = 0; row < ROWS; row++) {
        const cell = cellContainers[r]?.[row]
        if (cell) { cell.alpha = 1; cell.scale.set(1) }
      }
    }

    isSpinning.set(true)
    playSpinStart()

    const isT = get(isTurbo)

    // Apply vertical blur to all reels at spin start
    for (let r = 0; r < REELS; r++) _blurReel(r)

    // Reels 0–1 first so we can check scatter count before 2–4 land
    await Promise.all([0, 1].map(r => _spinReel(r, finalBoard, isT)))

    // Scatter anticipation: if reels 0–1 have 2 scatters, glow remaining reels gold
    const scattersLanded = [0, 1].reduce((acc, r) =>
      acc + (finalBoard[r] ?? []).filter(s => s === 'S').length, 0)
    if (scattersLanded >= 2) _scatterAnticipation(1)

    // Reels 2–3 spin in parallel
    await Promise.all([2, 3].map(r => _spinReel(r, finalBoard, isT)))
    // Clear any scatter glow on reel 2 and 3 as they stop
    ;[2, 3].forEach(r => { reelContainers[r].filters = [] })

    // Anticipation: if first 4 reels have a near-match, slow reel 4 by 600ms
    const anticipate = !isT && _checkAnticipation(finalBoard)
    if (anticipate) playAnticipation()
    await _spinReel(4, finalBoard, isT, anticipate ? 600 : 0)
    reelContainers[4].filters = []

    isSpinning.set(false)
  }
</script>

<div bind:this={container} class="game-grid"></div>

<style>
  .game-grid {
    display: flex;
    justify-content: center;
    border-radius: 12px;
    overflow: hidden;
    box-shadow:
      0 0 40px rgba(0, 100, 255, 0.25),
      0 0 80px rgba(80, 0, 180, 0.15),
      inset 0 0 60px rgba(0, 0, 30, 0.8);
  }

  .game-grid :global(canvas) {
    display: block;
  }
</style>
