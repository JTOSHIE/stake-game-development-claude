<script lang="ts">
  /**
   * GameGrid.svelte — PixiJS canvas wrapper for Future Spinner
   *
   * Renders a 5-reel × 4-row grid. Each cell draws a coloured placeholder
   * rectangle with the symbol name until real PNG assets are dropped into
   * public/assets/symbols/.
   *
   * Spin animation: reels scroll downward sequentially, stopping one-by-one
   * with a small elastic overshoot.
   */
  import { onMount, onDestroy } from 'svelte'
  import * as PIXI from 'pixi.js'
  import { boardSymbols, activeWins, isSpinning } from '../stores/gameStore'

  // ── Layout constants ──────────────────────────────────────────────────────
  const REELS       = 5
  const ROWS        = 4
  const CELL_W      = 120
  const CELL_H      = 100
  const GAP         = 4
  const CANVAS_W    = REELS * CELL_W + (REELS - 1) * GAP
  const CANVAS_H    = ROWS  * CELL_H + (ROWS  - 1) * GAP

  // ── Symbol colours (placeholder) ─────────────────────────────────────────
  const SYMBOL_COLOURS: Record<string, number> = {
    H1: 0xffd700,  // gold
    H2: 0xff6b35,  // orange
    M1: 0x4fc3f7,  // light blue
    M2: 0x81c784,  // green
    M3: 0xba68c8,  // purple
    L1: 0xe57373,  // red
    L2: 0x4dd0e1,  // cyan
    L3: 0xaed581,  // lime
    W:  0xffffff,  // white (wild)
    S:  0xff4081,  // pink (scatter)
  }

  let container: HTMLDivElement
  let app: PIXI.Application
  let reelContainers: PIXI.Container[] = []
  let cellSprites: PIXI.Container[][] = []   // [reel][row]

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  onMount(() => {
    app = new PIXI.Application({
      width:      CANVAS_W,
      height:     CANVAS_H,
      background: 0x0d0d1f,
      antialias:  true,
    })
    container.appendChild(app.view as HTMLCanvasElement)

    _buildGrid()

    // Subscribe to board updates
    const unsubBoard = boardSymbols.subscribe(board => {
      if (board && board.length === REELS) _updateBoard(board)
    })

    return unsubBoard
  })

  onDestroy(() => {
    app?.destroy(true)
  })

  // ── Grid construction ─────────────────────────────────────────────────────
  function _buildGrid() {
    for (let r = 0; r < REELS; r++) {
      const rc = new PIXI.Container()
      rc.x = r * (CELL_W + GAP)

      // Mask so symbols don't overflow the reel window
      const mask = new PIXI.Graphics()
      mask.beginFill(0xffffff)
      mask.drawRect(0, 0, CELL_W, ROWS * CELL_H + (ROWS - 1) * GAP)
      mask.endFill()
      rc.addChild(mask)
      rc.mask = mask

      reelContainers.push(rc)
      cellSprites.push([])

      for (let row = 0; row < ROWS; row++) {
        const cell = _makeCell('L3', false)
        cell.y = row * (CELL_H + GAP)
        rc.addChild(cell)
        cellSprites[r].push(cell)
      }

      app.stage.addChild(rc)
    }
  }

  function _makeCell(symbol: string, highlighted: boolean): PIXI.Container {
    const c = new PIXI.Container()

    const bg = new PIXI.Graphics()
    bg.beginFill(highlighted ? 0x2a2a00 : 0x1a1a2e)
    bg.lineStyle(highlighted ? 2 : 1, highlighted ? 0xffd700 : 0x333355)
    bg.drawRoundedRect(0, 0, CELL_W, CELL_H, 8)
    bg.endFill()
    c.addChild(bg)

    // Colour dot
    const dot = new PIXI.Graphics()
    dot.beginFill(SYMBOL_COLOURS[symbol] ?? 0x666666)
    dot.drawCircle(CELL_W / 2, CELL_H / 2 - 12, 24)
    dot.endFill()
    c.addChild(dot)

    // Symbol label
    const label = new PIXI.Text(symbol, {
      fontFamily: 'Arial',
      fontSize:   16,
      fontWeight: 'bold',
      fill:       0xffffff,
    })
    label.anchor.set(0.5)
    label.x = CELL_W / 2
    label.y = CELL_H / 2 + 20
    c.addChild(label)

    return c
  }

  // ── Board update ──────────────────────────────────────────────────────────
  function _updateBoard(board: string[][]) {
    for (let r = 0; r < REELS; r++) {
      for (let row = 0; row < ROWS; row++) {
        const sym = board[r]?.[row] ?? 'L3'
        const old = cellSprites[r][row]
        const y   = old.y
        const newCell = _makeCell(sym, false)
        newCell.y = y
        reelContainers[r].addChild(newCell)
        reelContainers[r].removeChild(old)
        cellSprites[r][row] = newCell
      }
    }
    // Highlight wins
    _applyHighlights()
  }

  function _applyHighlights() {
    const wins = activeWins
    // Placeholder — full win-line highlighting implemented with pixi Graphics
    // in the integration pass once symbol assets are available
  }

  // ── Public API — called by App.svelte ─────────────────────────────────────
  export async function animateSpin(finalBoard: string[][]): Promise<void> {
    isSpinning.set(true)

    // Staggered reel stop: each reel stops 120ms after the previous
    const spinPromises = reelContainers.map((rc, r) =>
      new Promise<void>(resolve => {
        const startTime = performance.now()
        const duration  = 500 + r * 120

        function tick() {
          const elapsed = performance.now() - startTime
          const progress = Math.min(elapsed / duration, 1)

          // Scroll each row downward (mod cell height)
          for (let row = 0; row < ROWS; row++) {
            const cell = cellSprites[r][row]
            const baseY = row * (CELL_H + GAP)
            cell.y = baseY + ((elapsed * 0.3) % (CELL_H + GAP))
          }

          if (progress < 1) {
            requestAnimationFrame(tick)
          } else {
            // Snap to final symbols
            const reel = finalBoard[r] ?? []
            for (let row = 0; row < ROWS; row++) {
              const sym = reel[row] ?? 'L3'
              const old = cellSprites[r][row]
              const newCell = _makeCell(sym, false)
              newCell.y = row * (CELL_H + GAP)
              reelContainers[r].addChild(newCell)
              reelContainers[r].removeChild(old)
              cellSprites[r][row] = newCell
            }
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
    box-shadow: 0 0 40px rgba(0, 100, 255, 0.2), inset 0 0 60px rgba(0,0,30,0.8);
  }

  .game-grid :global(canvas) {
    display: block;
  }
</style>
