<script lang="ts">
  /**
   * GameGrid.svelte — PixiJS canvas wrapper for Future Spinner
   *
   * Renders a 5-reel × 4-row grid using the cyberpunk PNG assets.
   * Assets are preloaded with PIXI.Assets.load() before the grid builds.
   * Falls back to coloured placeholder rectangles if a texture is missing.
   *
   * Spin animation: reels scroll downward sequentially, stopping one-by-one.
   */
  import { onMount, onDestroy } from 'svelte'
  import { Assets, Application, Container, Graphics, Sprite, Texture, Text } from 'pixi.js'
  import { boardSymbols, activeWins, isSpinning } from '../stores/gameStore'

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
  let assetsReady = false

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

    // React to board store updates (called after spin resolves)
    const unsubBoard = boardSymbols.subscribe(board => {
      if (assetsReady && board && board.length === REELS) _updateBoard(board)
    })

    return unsubBoard
  })

  onDestroy(() => {
    app?.destroy(true)
  })

  // ── Asset preloading ──────────────────────────────────────────────────────
  async function _preloadTextures(): Promise<void> {
    const urls = Object.values(SYMBOL_TEXTURES)
    try {
      await Assets.load(urls)
    } catch (err) {
      // Non-fatal: _makeCell falls back to placeholder for any missing texture
      console.warn('[GameGrid] Some textures failed to load:', err)
    }
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
  }

  // ── Cell factory ──────────────────────────────────────────────────────────
  function _makeCell(symbol: string, highlighted: boolean): Container {
    const c = new Container()

    // Background panel
    const bg = new Graphics()
    bg.beginFill(highlighted ? 0x1e1a00 : 0x111120, highlighted ? 1 : 0.85)
    bg.lineStyle(highlighted ? 2 : 1, highlighted ? 0xffd700 : 0x22224a)
    bg.drawRoundedRect(0, 0, CELL_W, CELL_H, 8)
    bg.endFill()
    c.addChild(bg)

    // Glow border on highlighted (win) cells
    if (highlighted) {
      const glow = new Graphics()
      glow.lineStyle(4, 0xffd700, 0.35)
      glow.drawRoundedRect(-2, -2, CELL_W + 4, CELL_H + 4, 10)
      c.addChild(glow)
    }

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

      // Scatter: subtle pulse tint to draw attention
      if (symbol === 'S') sprite.tint = highlighted ? 0xffd7ff : 0xff99ff

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
    _applyWinHighlights()
  }

  function _replaceCell(reel: number, row: number, symbol: string, highlighted: boolean): void {
    const old = cellContainers[reel][row]
    const y   = old.y
    const newCell = _makeCell(symbol, highlighted)
    newCell.y = y
    reelContainers[reel].addChild(newCell)
    reelContainers[reel].removeChild(old)
    old.destroy({ children: true })
    cellContainers[reel][row] = newCell
  }

  function _applyWinHighlights(): void {
    // activeWins contains { symbol, kind, ways, payout }
    // Highlight every cell whose symbol matches a winning combination
    import('../stores/gameStore').then(({ activeWins: aw }) => {
      const wins = (aw as typeof activeWins)
      const board = (boardSymbols as typeof boardSymbols)
      // Use store values directly via module re-import
    })
  }

  // ── Public API — called by App.svelte ─────────────────────────────────────
  export async function animateSpin(finalBoard: string[][]): Promise<void> {
    if (!assetsReady) return

    isSpinning.set(true)

    // Staggered reel stop — reel r stops at (500 + r×150) ms
    const spinPromises = reelContainers.map((rc, r) =>
      new Promise<void>(resolve => {
        const startTime = performance.now()
        const duration  = 500 + r * 150

        const STRIP_H = CELL_H + GAP

        function tick(): void {
          const elapsed  = performance.now() - startTime
          const progress = Math.min(elapsed / duration, 1)

          // Scroll cells downward during spin
          for (let row = 0; row < ROWS; row++) {
            const cell  = cellContainers[r][row]
            const baseY = row * STRIP_H
            cell.y = baseY + ((elapsed * 0.35) % STRIP_H)
          }

          if (progress < 1) {
            requestAnimationFrame(tick)
          } else {
            // Snap to final symbols with a tiny elastic bounce
            const reel = finalBoard[r] ?? []
            for (let row = 0; row < ROWS; row++) {
              _replaceCell(r, row, reel[row] ?? 'L3', false)
              cellContainers[r][row].y = row * STRIP_H
            }

            // Brief overshoot then snap back
            reelContainers[r].y = 6
            setTimeout(() => {
              if (reelContainers[r]) reelContainers[r].y = 0
            }, 80)

            resolve()
          }
        }

        requestAnimationFrame(tick)
      })
    )

    await Promise.all(spinPromises)
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
