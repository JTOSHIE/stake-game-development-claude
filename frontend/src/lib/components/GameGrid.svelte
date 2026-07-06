<script lang="ts">
  /**
   * GameGrid.svelte — travelling tile-strip reel engine (Reel Feel v3)
   *
   * The mechanic is now TRUE travelling tiles, not a fixed-cell noise cycle.
   * Each reel is a wrapped vertical strip of TILE UNITS; a tile is one
   * container holding the tinted plate and its symbol (plus idle/charge layers)
   * that move together. Two choreographies share the one tile system, chosen by
   * the fs_reel_mode dev store:
   *   - strip (default): the strip scrolls vertically — accelerate (cubic-in)
   *     to a per-tier cruise, cruise with velocity-scaled vertical stretch and a
   *     subtle alpha trail while weighted-random tiles pass, then decelerate
   *     (cubic-out) into an index-aligned stop that lands the book's result row
   *     exactly, with a 22px overshoot and spring settle. Per-reel stagger.
   *   - drop: the same tile units fall from above the frame with gravity easing,
   *     per-column stagger and a squash-and-settle landing; result rows identical.
   * Slam-stop collapses every reel to a fast deceleration (never a teleport).
   * Scatter anticipation extends the final reel's travel under the glow, floored
   * at 300ms per tier.
   *
   * Win state: winning tiles brighten (others dim), the plate edge blooms in the
   *   symbol's signature colour, the symbol punches in scale, and a pooled Pixi
   *   particle burst fires (fixed-size array, no per-frame allocation).
   * Win overlay: a transparent PixiJS canvas draws the gold borders / connecting
   *   lines and the particle layer above the tile layer.
   * Public API: animateSpin(board) and slamStop() — called by App.svelte.
   */
  import { onMount, onDestroy } from 'svelte'
  import { get } from 'svelte/store'
  import { Application, Graphics } from 'pixi.js'
  import { boardSymbols, activeWins, isSpinning, isTurbo } from '../stores/gameStore'
  import { speedTier } from '../stores/speedMode'
  import { reelMode } from '../stores/reelMode'
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

  // ── Tile-strip geometry ───────────────────────────────────────────────────
  // A tile occupies CELL_H + GAP; the strip holds the 4 visible rows plus one
  // buffer above (VIS_OFFSET) and two below, so tiles enter/exit off-screen.
  const TILE       = CELL_H + GAP                  // 104
  const VIS_OFFSET = 1                             // visible row 0 = strip slot 1
  const STRIP      = ROWS + 3                       // 7 slots: [buf, r0..r3, buf, buf]
  const REST_Y     = -VIS_OFFSET * TILE            // -104: slot 1 sits at window top

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

  // ── Layered sprites — H1 rotating spoke overlay ──────────────────────────
  const LAYERED_OVERLAY: Record<string, { base: string; overlay: string }> = {
    H1: { base: 'h1_base', overlay: 'h1_spin' },
  }
  function symbolBaseSrc(symbol: string): string {
    const layered = LAYERED_OVERLAY[symbol.toUpperCase()]
    return layered ? `${SYMBOL_BASE}/${layered.base}.png` : symbolSrc(symbol)
  }
  function symbolOverlaySrc(symbol: string): string | null {
    const layered = LAYERED_OVERLAY[symbol.toUpperCase()]
    return layered ? `${SYMBOL_BASE}/${layered.overlay}.png` : null
  }

  // ── Symbol Life v2 idle classes (Set A) ──────────────────────────────────
  // Each settled symbol carries a tuned idle; travelling tiles pause idles via
  // the .spinning class on the column (CSS gates the animation off).
  const IDLE_CLASS: Record<string, string> = {
    H1: 'idle-breathe',   // rotation is on the H1 spoke overlay
    H2: 'idle-charge',    // crimson charge halo + valve hiss flicker
    M1: 'idle-rev',       // rim dash stream + rev LED chase
    M2: 'idle-coil',      // coil highlight chase + body bob
    M3: 'idle-flame',     // booster flame flipbook (fx layer)
    L1: 'idle-glint',     // facet glint sweep + bore ring pulse
    L2: 'idle-arc',       // fuse arc flicker (fx layer)
    L3: 'idle-pump',      // crown pump
    W:  'idle-rings',     // dual rings opposite phase
    S:  'idle-rays',      // rays rotation + core pulse
  }
  function idleClass(symbol: string | undefined): string {
    return IDLE_CLASS[(symbol ?? '').toUpperCase()] ?? 'idle-breathe'
  }
  // Full class lists so _paintSlot can swap idle/fx classes via classList without
  // ever wiping the Svelte scope hash class (which className= would drop, killing
  // the scoped sizing rules).
  const IDLE_ALL = ['idle-breathe','idle-charge','idle-rev','idle-coil','idle-flame',
                    'idle-glint','idle-arc','idle-pump','idle-rings','idle-rays']
  const FX_ALL = ['fx-none','fx-flame','fx-arc']
  // Symbols whose idle is driven by a sprite-sheet flipbook fx overlay
  // (deterministic sheets from symbol_fx.py, played via CSS steps()).
  const FX_CLASS: Record<string, string> = {
    M3: 'fx-flame',
    L2: 'fx-arc',
  }
  const FX_SHEET: Record<string, string> = {
    M3: 'm3_flame_sheet',
    L2: 'l2_fuse_sheet',
  }
  function fxClass(symbol: string | undefined): string {
    return FX_CLASS[(symbol ?? '').toUpperCase()] ?? 'fx-none'
  }
  function fxSheet(symbol: string): string | null {
    const s = FX_SHEET[symbol.toUpperCase()]
    return s ? `${SYMBOL_BASE}/${s}.png` : null
  }

  // ── State ─────────────────────────────────────────────────────────────────
  let pixiContainer: HTMLDivElement
  let app: Application
  let winHighlightLayer: Graphics
  let particleLayer: Graphics
  let assetsReady = false

  // Per-column strip element (translateY) and per-slot element refs.
  let stripRefs:   (HTMLDivElement | null)[] = Array.from({ length: REELS }, () => null)
  let slotCell:    (HTMLDivElement | null)[][] =
    Array.from({ length: REELS }, () => Array.from({ length: STRIP }, (): HTMLDivElement | null => null))
  let slotInner:   (HTMLDivElement | null)[][] =
    Array.from({ length: REELS }, () => Array.from({ length: STRIP }, (): HTMLDivElement | null => null))
  let slotImg:     (HTMLImageElement | null)[][] =
    Array.from({ length: REELS }, () => Array.from({ length: STRIP }, (): HTMLImageElement | null => null))
  let slotOverlay: (HTMLImageElement | null)[][] =
    Array.from({ length: REELS }, () => Array.from({ length: STRIP }, (): HTMLImageElement | null => null))
  let slotFx:      (HTMLDivElement | null)[][] =
    Array.from({ length: REELS }, () => Array.from({ length: STRIP }, (): HTMLDivElement | null => null))

  // Current symbol id in each slot (drives recycling and win mapping).
  let slotSym: string[][] =
    Array.from({ length: REELS }, () => Array.from({ length: STRIP }, () => 'L3'))

  // Visible-cell accessors — the four on-screen rows map to strip slots 1..4.
  const visIdx = (row: number) => row + VIS_OFFSET
  const visImg     = (col: number, row: number) => slotImg[col]?.[visIdx(row)] ?? null
  const visOverlay = (col: number, row: number) => slotOverlay[col]?.[visIdx(row)] ?? null
  const visCell    = (col: number, row: number) => slotCell[col]?.[visIdx(row)] ?? null

  // Win burst state
  let winBurstTimer: ReturnType<typeof setTimeout> | null = null

  // ── Weighted random passing-tile pool (cruise fill) ──────────────────────
  // Weighted toward low symbols so the blur reads like a real reel band; the
  // exact result rows are injected on landing, so this only affects the blur.
  const CYCLE_WEIGHTED: string[] = [
    'L1','L1','L1','L2','L2','L2','L3','L3','L3',
    'M1','M1','M2','M2','M3','M3','H1','H2','W','S',
  ]
  function randSym(): string {
    return CYCLE_WEIGHTED[(Math.random() * CYCLE_WEIGHTED.length) | 0]
  }

  // ── Pooled Pixi particle burst — fixed-size array, no per-frame allocation
  interface Particle {
    active: boolean
    x: number; y: number
    vx: number; vy: number
    life: number; maxLife: number
    color: number; size: number
  }
  // Bigger pool so several winners can each fire a fuller burst without starving.
  const PARTICLE_POOL_SIZE = 140
  const particles: Particle[] = Array.from({ length: PARTICLE_POOL_SIZE }, () => ({
    active: false, x: 0, y: 0, vx: 0, vy: 0, life: 0, maxLife: 0, color: 0xffffff, size: 0,
  }))

  // Reduced-motion: particle bursts (Pixi-drawn, not CSS) must fall back to
  // static, so gate the whole burst behind this flag.
  const _reduceMotion = typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false

  // Amplified burst: ~1.75x the particle count, bigger and a touch faster, still
  // tinted per symbol and drawn from the fixed pool (no per-frame allocation).
  function spawnBurst(x: number, y: number, colorHex: string, count = 28): void {
    if (_reduceMotion) return
    const color = hexToPixi(colorHex)
    let spawned = 0
    for (const p of particles) {
      if (spawned >= count) break
      if (p.active) continue
      const angle = Math.random() * Math.PI * 2
      const speed = 90 + Math.random() * 150
      p.active  = true
      p.x = x; p.y = y
      p.vx = Math.cos(angle) * speed
      p.vy = Math.sin(angle) * speed
      p.life = 0
      p.maxLife = 500 + Math.random() * 400
      p.color = color
      p.size = 3 + Math.random() * 4
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

  // ── Reel motion state machine (rAF-driven; one loop, all columns) ────────
  type ColState = 'rest' | 'accel' | 'cruise' | 'decel'
  interface Reel {
    state: ColState
    velocity: number     // px/s (for stretch/alpha)
    offset: number       // scroll offset within a tile [0,TILE)
    t: number            // ms elapsed in accel/decel phase
    cruiseV: number      // target cruise velocity for this spin
    decelDur: number
    decelDist: number
    decelOffset0: number // offset captured when decel began
    injects: number      // injections performed in decel
    queue: string[]      // injection order for landing
    onSettle: (() => void) | null
    charged: boolean     // scatter-anticipation glow applied
    lastM: number        // last applied motion factor (throttles var writes)
  }
  const reels: Reel[] = Array.from({ length: REELS }, () => ({
    state: 'rest', velocity: 0, offset: 0, t: 0, cruiseV: 0,
    decelDur: 0, decelDist: 0, decelOffset0: 0, injects: 0, queue: [],
    onSettle: null, charged: false, lastM: 0,
  }))
  let rafId: number | null = null
  let lastFrame = 0
  const ACCEL_MS = 140
  const VMAX = 3400           // px/s reference for stretch/alpha normalisation
  const easeInCubic  = (t: number) => t * t * t
  const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

  function _recycle(col: number, sym: string): void {
    // Shift every slot's symbol down by one, inject at the top (slot 0).
    for (let i = STRIP - 1; i >= 1; i--) slotSym[col][i] = slotSym[col][i - 1]
    slotSym[col][0] = sym
    for (let i = 0; i < STRIP; i++) _paintSlot(col, i, slotSym[col][i], /*moving*/ true)
  }

  // accel/cruise advance — offset-based with weighted-random passing tiles.
  function _advance(col: number, px: number): void {
    const r = reels[col]
    r.offset += px
    while (r.offset >= TILE) {
      r.offset -= TILE
      _recycle(col, randSym())
    }
    _positionStrip(col)
  }

  // Position + stretch every frame with minimal hot-loop allocation: the
  // per-reel velocity stretch/alpha are pushed to CSS variables on the strip
  // (inherited by every tile-inner) and only rewritten when the motion factor
  // changes, so cruise frames allocate just the one translateY string.
  function _positionStrip(col: number): void {
    const r = reels[col]
    const strip = stripRefs[col]
    if (!strip) return
    strip.style.transform = `translateY(${(REST_Y + r.offset).toFixed(1)}px)`
    const m = Math.min(1, r.velocity / VMAX)
    if (Math.abs(m - r.lastM) > 0.02 || (m === 0 && r.lastM !== 0)) {
      r.lastM = m
      strip.style.setProperty('--ts', (1 + 0.18 * m).toFixed(3))
      strip.style.setProperty('--ta', (1 - 0.34 * m).toFixed(3))
    }
  }

  function _tickReels(dtMs: number): void {
    let anyActive = false
    const dt = dtMs / 1000
    for (let c = 0; c < REELS; c++) {
      const r = reels[c]
      if (r.state === 'rest') continue
      anyActive = true
      if (r.state === 'accel') {
        r.t += dtMs
        const f = Math.min(r.t / ACCEL_MS, 1)
        r.velocity = r.cruiseV * easeInCubic(f)
        _advance(c, r.velocity * dt)
        if (f >= 1) { r.state = 'cruise'; r.velocity = r.cruiseV }
      } else if (r.state === 'cruise') {
        r.velocity = r.cruiseV
        _advance(c, r.velocity * dt)
      } else if (r.state === 'decel') {
        r.t += dtMs
        const f = Math.min(r.t / r.decelDur, 1)
        const travel = r.decelDist * easeOutCubic(f)
        // Injection count is TRAVEL-based and clamped to the queue length, so a
        // float boundary never drops or duplicates an injection: exactly
        // queue.length recycles happen over the decel, landing the result row.
        const crossed = Math.min(r.queue.length, Math.floor((r.decelOffset0 + travel) / TILE))
        while (r.injects < crossed) { _recycle(c, r.queue[r.injects]); r.injects++ }
        r.offset = (r.decelOffset0 + travel) - crossed * TILE
        r.velocity = (r.decelDist * 3 * Math.pow(1 - f, 2)) / (r.decelDur / 1000)
        _positionStrip(c)
        if (f >= 1) _settleReel(c)
      }
    }
    if (!anyActive) { rafId = null; return }
    rafId = requestAnimationFrame(_frame)
  }

  function _frame(now: number): void {
    const dt = lastFrame ? Math.min(now - lastFrame, 48) : 16.7
    lastFrame = now
    _tickReels(dt)
  }
  function _ensureRaf(): void {
    if (rafId == null) { lastFrame = 0; rafId = requestAnimationFrame(_frame) }
  }

  // ── Landing — decelerate into an index-aligned stop, then overshoot/settle
  function _startReel(col: number, cruiseV: number): void {
    const r = reels[col]
    r.state = 'accel'; r.t = 0; r.velocity = 0; r.cruiseV = cruiseV
    r.injects = 0; r.lastM = 0; r.queue = []; r.charged = false
    const strip = stripRefs[col]
    if (strip) strip.classList.add('spinning')
    _ensureRaf()
  }

  function _landReel(col: number, resultRows: string[], fast: boolean): Promise<void> {
    return new Promise<void>((resolve) => {
      const r = reels[col]
      // Injection order so that after Q recycles slots 1..4 = result rows 0..3.
      // (r3,r2,r1,r0) land in slots 4..1; a trailing filler pushes them home.
      const [r0, r1, r2, r3] = [resultRows[0], resultRows[1], resultRows[2], resultRows[3]]
      const extra = fast ? [] : [randSym(), randSym()]
      r.queue = [...extra, r3, r2, r1, r0, randSym()]
      const Q = r.queue.length
      r.decelOffset0 = r.offset
      r.decelDist = Q * TILE - r.offset
      r.decelDur = fast ? 150 : Math.min(460, Math.max(280, (r.decelDist * 3) / (r.cruiseV || VMAX) * 1000))
      r.t = 0
      r.injects = 0
      r.state = 'decel'
      r.onSettle = resolve
      _ensureRaf()
    })
  }

  function _settleReel(col: number): void {
    const r = reels[col]
    // Safety net: guarantee every queued symbol is injected before we snap to
    // rest, so the landed rows equal the book result even if the last frame's
    // travel fell a hair short of the final tile boundary.
    while (r.injects < r.queue.length) { _recycle(col, r.queue[r.injects]); r.injects++ }
    r.state = 'rest'
    r.offset = 0
    r.velocity = 0
    // Snap to exact rest and clear stretch/alpha.
    _positionStrip(col)
    const strip = stripRefs[col]
    if (strip) strip.classList.remove('spinning')
    // Paint the settled visible rows at full quality (idle + overlays on).
    for (let i = 0; i < STRIP; i++) _paintSlot(col, i, slotSym[col][i], /*moving*/ false)
    playReelStop(col)
    if (resultHasScatter(col)) playScatterLand()
    _bounceStrip(col, r).then(() => {
      const cb = r.onSettle
      r.onSettle = null
      if (cb) cb()
    })
  }

  function resultHasScatter(col: number): boolean {
    for (let row = 0; row < ROWS; row++) if (slotSym[col][visIdx(row)] === 'S') return true
    return false
  }

  // 22px overshoot + spring settle on the strip (rAF-driven).
  function _bounceStrip(col: number, r: Reel): Promise<void> {
    return new Promise((resolve) => {
      const strip = stripRefs[col]
      if (!strip) { resolve(); return }
      // Punchier landing: a bigger overshoot with a snappier settle.
      const OVER = r.decelDur <= 160 ? 8 : 30
      const D1 = r.decelDur <= 160 ? 36 : 78
      const D2 = r.decelDur <= 160 ? 22 : 58
      const base = REST_Y
      const start = performance.now()
      const down = () => {
        const t = Math.min((performance.now() - start) / D1, 1)
        strip.style.transform = `translateY(${(base + OVER * (1 - easeOutCubic(t))).toFixed(2)}px)`
        if (t < 1) { requestAnimationFrame(down); return }
        const s2 = performance.now()
        const up = () => {
          const t2 = Math.min((performance.now() - s2) / D2, 1)
          strip.style.transform = `translateY(${(base - 2 * Math.sin(t2 * Math.PI)).toFixed(2)}px)`
          if (t2 < 1) { requestAnimationFrame(up); return }
          strip.style.transform = `translateY(${base}px)`
          resolve()
        }
        requestAnimationFrame(up)
      }
      requestAnimationFrame(down)
    })
  }

  // ── Drop mode — the same tiles fall from above with gravity + squash ─────
  function _dropReel(col: number, resultRows: string[], delayMs: number): Promise<void> {
    return new Promise<void>((resolve) => {
      const strip = stripRefs[col]
      if (!strip) { resolve(); return }
      // Seat the result rows in the visible slots, then release from above.
      for (let row = 0; row < ROWS; row++) slotSym[col][visIdx(row)] = resultRows[row]
      for (let i = 0; i < VIS_OFFSET; i++) slotSym[col][i] = randSym()
      for (let i = visIdx(ROWS); i < STRIP; i++) slotSym[col][i] = randSym()
      for (let i = 0; i < STRIP; i++) _paintSlot(col, i, slotSym[col][i], /*moving*/ true)
      strip.classList.add('spinning')

      const DROP_H = 520
      const FALL = get(isTurbo) ? 260 : 400
      const startY = REST_Y - DROP_H
      strip.style.transform = `translateY(${startY}px)`
      const begin = performance.now() + delayMs
      const fall = (now: number) => {
        if (now < begin) { requestAnimationFrame(fall); return }
        const f = Math.min((now - begin) / FALL, 1)
        // gravity: accelerating fall (f^2)
        const y = startY + (REST_Y - startY) * (f * f)
        strip.style.transform = `translateY(${y.toFixed(2)}px)`
        if (f < 1) { requestAnimationFrame(fall); return }
        // squash-and-settle on the tiles, then finish
        strip.style.transform = `translateY(${REST_Y}px)`
        strip.classList.remove('spinning')
        for (let i = 0; i < STRIP; i++) _paintSlot(col, i, slotSym[col][i], /*moving*/ false)
        playReelStop(col)
        if (resultHasScatter(col)) playScatterLand()
        _squash(col).then(resolve)
      }
      requestAnimationFrame(fall)
    })
  }

  function _squash(col: number): Promise<void> {
    return new Promise((resolve) => {
      const start = performance.now()
      const D = 135
      const step = () => {
        const t = Math.min((performance.now() - start) / D, 1)
        // 0.74 -> 1 spring - a deeper squash with a snappier settle.
        const s = 0.74 + 0.26 * easeOutCubic(t) + 0.09 * Math.sin(t * Math.PI)
        for (let row = 0; row < ROWS; row++) {
          const inner = slotInner[col][visIdx(row)]
          if (inner) inner.style.transform = `scaleY(${s.toFixed(3)})`
        }
        if (t < 1) { requestAnimationFrame(step); return }
        for (let row = 0; row < ROWS; row++) {
          const inner = slotInner[col][visIdx(row)]
          if (inner) inner.style.transform = ''
        }
        resolve()
      }
      requestAnimationFrame(step)
    })
  }

  // ── Paint one slot's DOM to a symbol id ──────────────────────────────────
  function _paintSlot(col: number, i: number, symbol: string, moving: boolean): void {
    const sym = (symbol ?? 'L3').toUpperCase()
    const img = slotImg[col]?.[i]
    if (img) {
      const src = symbolBaseSrc(sym)
      if (img.getAttribute('src') !== src) img.setAttribute('src', src)
    }
    // Fast path while travelling: only the symbol image reads through the blur,
    // so skip plate tint / overlay / idle / fx work (imperceptible or gated off
    // by .spinning) and repaint them once on settle.
    if (moving) return
    const cell = slotCell[col]?.[i]
    if (cell) cell.style.setProperty('--plate-tint', plateTint(sym))
    const overlay = slotOverlay[col]?.[i]
    if (overlay) {
      const ov = symbolOverlaySrc(sym)
      // Overlays (H1 spoke) only show on settled tiles, not while travelling.
      if (ov && !moving) {
        if (overlay.getAttribute('src') !== ov) overlay.setAttribute('src', ov)
        overlay.style.display = 'block'
      } else {
        overlay.style.display = 'none'
      }
    }
    // Idle micro-motion class — only meaningful on settled tiles; the .spinning
    // class on the column gates the animations off while travelling. Use
    // classList (not className=) so the Svelte scope hash class survives.
    if (img) { img.classList.remove(...IDLE_ALL); img.classList.add(idleClass(sym)) }
    const fx = slotFx[col]?.[i]
    if (fx) {
      const fxc = moving ? 'fx-none' : fxClass(sym)
      fx.classList.remove(...FX_ALL); fx.classList.add(fxc)
      const sheet = moving ? null : fxSheet(sym)
      fx.style.backgroundImage = sheet ? `url(${sheet})` : ''
    }
  }

  // Decode every symbol texture + fx sheet during load so the first spin's
  // full-res cruise paint never pays a first-use decode cost mid-frame.
  function _prewarmArt(): void {
    if (!SYMBOL_BASE) return
    const files = ['h1_base', 'h1_spin', 'h2', 'm1', 'm2', 'm3', 'l1', 'l2', 'l3',
                   'wild', 'scatter', 'tile_plate', 'm3_flame_sheet', 'l2_fuse_sheet']
    for (const f of files) {
      const img = new Image()
      img.src = `${SYMBOL_BASE}/${f}.png`
      img.decode?.().catch(() => {})
    }
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  onMount(() => {
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
      app.ticker.add(() => _tickParticles(app.ticker.deltaMS))
      assetsReady = true
    } catch (err) {
      console.error('[GameGrid] PixiJS init failed — win lines disabled:', err)
      assetsReady = true // tiles are DOM; still render/animate without the canvas
    }

    assetLoadProgress.set(100)
    _prewarmArt()

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
    if (rafId != null) cancelAnimationFrame(rafId)
    app?.destroy(true)
  })

  // ── Seat a settled board into the visible rows (idle state) ──────────────
  function _updateSymbols(board: string[][]): void {
    for (let col = 0; col < REELS; col++) {
      // buffers above/below get random band symbols so a spin looks continuous
      for (let i = 0; i < STRIP; i++) {
        const row = i - VIS_OFFSET
        const sym = (row >= 0 && row < ROWS) ? (board[col]?.[row] ?? 'L3') : randSym()
        slotSym[col][i] = sym.toUpperCase()
      }
      for (let i = 0; i < STRIP; i++) _paintSlot(col, i, slotSym[col][i], /*moving*/ false)
      const strip = stripRefs[col]
      if (strip) strip.style.transform = `translateY(${REST_Y}px)`
    }
  }

  // ── Win burst — brighten winners, dim others, plate bloom, punch, particles
  function _winningCells(
    wins: Array<{ symbol: string; kind: number }>,
    board: string[][],
  ): Set<string> {
    const cells = new Set<string>()
    for (const win of wins) {
      const reelCount = win.kind ?? 3
      for (let r = 0; r < reelCount; r++) {
        const reelSymbols = board[r] ?? []
        for (let row = 0; row < ROWS; row++) {
          const sym = reelSymbols[row]
          if (sym === win.symbol || sym === 'W' || win.symbol === 'W') cells.add(`${r},${row}`)
        }
      }
    }
    return cells
  }

  function _triggerWinBurst(
    wins: Array<{ symbol: string; kind: number; ways: number; payout: number }>,
    board: string[][],
  ): void {
    if (winBurstTimer) clearTimeout(winBurstTimer)
    const winningCells = _winningCells(wins, board)
    const STRIP_W = CELL_W + GAP
    const STRIP_H = CELL_H + GAP

    for (let col = 0; col < REELS; col++) {
      for (let row = 0; row < ROWS; row++) {
        const symbol = board[col]?.[row]
        if (!symbol) continue
        const img     = visImg(col, row)
        const overlay = visOverlay(col, row)
        const cell    = visCell(col, row)
        if (!img) continue
        if (winningCells.has(`${col},${row}`)) {
          // 250ms charge pre-burst, then a per-reel left-to-right stagger
          // (~70ms per reel) so the win reads as a sweep, not all-at-once.
          cell?.classList.add('pre-charge')
          setTimeout(() => {
            cell?.classList.remove('pre-charge')
            img.classList.remove('loser-dim')
            img.style.opacity = '1'
            img.classList.add('win-flash')
            cell?.classList.add('plate-bloom')
            if (symbol.toUpperCase() === 'H1') overlay?.classList.add('win-spin-fast')
            spawnBurst(col * STRIP_W + CELL_W / 2, row * STRIP_H + CELL_H / 2, plateTint(symbol))
          }, 250 + col * 70)
        } else {
          // Dim losers harder (and desaturate) so winners clearly spotlight.
          img.style.opacity = ''
          img.classList.add('loser-dim')
        }
      }
    }

    winBurstTimer = setTimeout(() => {
      for (let col = 0; col < REELS; col++) {
        for (let row = 0; row < ROWS; row++) {
          const img     = visImg(col, row)
          const overlay = visOverlay(col, row)
          const cell    = visCell(col, row)
          if (img) { img.style.opacity = '1'; img.classList.remove('win-flash', 'loser-dim') }
          overlay?.classList.remove('win-spin-fast')
          cell?.classList.remove('plate-bloom', 'pre-charge')
        }
      }
    }, 4000)
  }

  function _resetToIdle(): void {
    if (winBurstTimer) { clearTimeout(winBurstTimer); winBurstTimer = null }
    for (let col = 0; col < REELS; col++) {
      for (let row = 0; row < ROWS; row++) {
        const img     = visImg(col, row)
        const overlay = visOverlay(col, row)
        const cell    = visCell(col, row)
        if (img) { img.style.opacity = '1'; img.classList.remove('win-flash', 'loser-dim') }
        overlay?.classList.remove('win-spin-fast')
        cell?.classList.remove('plate-bloom', 'pre-charge', 'scatter-charge')
      }
    }
  }

  // ── Scatter anticipation (Set B) — charge glow on the still-travelling reels,
  // plus a landed-scatter charge loop (glow bloom + scanline + orbiting spark)
  // on every scatter already on the board while the final reel decides.
  function _scatterAnticipation(fromReel: number): void {
    for (let r = fromReel; r < REELS; r++) {
      const strip = stripRefs[r]
      if (strip && reels[r].state !== 'rest') { strip.classList.add('anticipate'); reels[r].charged = true }
    }
    _chargeLandedScatters()
  }
  function _chargeLandedScatters(): void {
    for (let c = 0; c < REELS; c++) {
      if (reels[c].state !== 'rest') continue
      for (let row = 0; row < ROWS; row++) {
        if (slotSym[c][visIdx(row)] === 'S') visCell(c, row)?.classList.add('scatter-charge')
      }
    }
  }
  function _clearAnticipation(): void {
    for (let r = 0; r < REELS; r++) {
      stripRefs[r]?.classList.remove('anticipate')
      for (let i = 0; i < STRIP; i++) slotCell[r]?.[i]?.classList.remove('scatter-charge')
    }
  }

  function _checkAnticipation(board: string[][]): boolean {
    const highValue = ['H1', 'H2', 'S']
    const isWild = (s: string | undefined) => s === 'W'
    const matches = (a: string | undefined, b: string | undefined) =>
      a !== undefined && b !== undefined && (a === b || isWild(a) || isWild(b))
    for (let row = 0; row < ROWS; row++) {
      const s0 = board[0]?.[row], s1 = board[1]?.[row], s2 = board[2]?.[row]
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
    const winningCells = _winningCells(wins, board)

    for (const key of winningCells) {
      const [r, row] = key.split(',').map(Number)
      winHighlightLayer.lineStyle(2, wlc, 0.85)
      winHighlightLayer.beginFill(wlc, 0.08)
      winHighlightLayer.drawRoundedRect(r * STRIP_W + 2, row * STRIP_H + 2, CELL_W - 4, CELL_H - 4, 6)
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

  // ── Slam-stop — collapse to a fast deceleration (never a teleport) ───────
  let slamRequested = false
  export function slamStop(): void {
    if (!get(isSpinning) || slamRequested) return
    slamRequested = true
    if (_pendingWaitAbort) _pendingWaitAbort()
  }

  // ── Public API — called by App.svelte ─────────────────────────────────────
  export async function animateSpin(finalBoard: string[][]): Promise<void> {
    if (!assetsReady) return
    winHighlightLayer?.clear()
    _resetToIdle()
    _clearAnticipation()
    slamRequested = false
    isSpinning.set(true)
    playSpinStart()

    // Precompute the result rows once (avoids per-reference array allocation in
    // the hot spin loop, which feeds GC and risks a >100ms pause).
    const boardRows: string[][] = Array.from({ length: REELS }, (_, c) =>
      Array.from({ length: ROWS }, (_, row) => (finalBoard[c]?.[row] ?? 'L3').toUpperCase()))

    if (get(reelMode) === 'drop') {
      await _dropAll(boardRows)
      isSpinning.set(false)
      return
    }

    // ── Strip mode ──────────────────────────────────────────────────────────
    const tier = get(speedTier)
    const isT  = get(isTurbo)
    const speedFactor = tier === 'super' ? 0.16 : isT ? 0.5 : 1
    const cruiseV = (tier === 'super' ? 5200 : isT ? 4200 : 3200)

    for (let c = 0; c < REELS; c++) _startReel(c, cruiseV)

    // Per-reel decel start times: a minimum cruise then a 90-140ms stagger.
    const MIN_CRUISE = Math.max(120, 360 * speedFactor)
    const STAGGER    = Math.max(70, 120 * speedFactor)
    const settles: Promise<void>[] = []
    let scattersLanded = 0

    for (let r = 0; r < REELS; r++) {
      const delay = r === 0 ? MIN_CRUISE : STAGGER
      await _sleepOrSlam(delay)

      // Scatter anticipation before the final reel commits to its stop.
      if (r === REELS - 1) {
        const scatterAnticipate = scattersLanded >= 2
        const nearMiss = !isT && !scatterAnticipate && _checkAnticipation(finalBoard)
        if (!slamRequested && (scatterAnticipate || nearMiss)) {
          _scatterAnticipation(REELS - 1)
          playAnticipation()
          const holdMs = Math.max(300, (scatterAnticipate ? 900 : 600) * speedFactor)
          await _sleepOrSlam(holdMs)
        }
      }

      const p = _landReel(r, boardRows[r], slamRequested).then(() => {
        _clearAnticipationFor(r)
      })
      settles.push(p)

      // Count scatters that have now committed (their queue is set on landing).
      scattersLanded += boardRows[r].filter((s) => s === 'S').length
      if (scattersLanded >= 2 && !slamRequested && r < REELS - 1) {
        _scatterAnticipation(r + 1)
      }
    }

    await Promise.all(settles)
    _clearAnticipation()

    if (import.meta.env.DEV) {
      for (let c = 0; c < REELS; c++) {
        for (let row = 0; row < ROWS; row++) {
          if (slotSym[c][visIdx(row)] !== boardRows[c][row]) {
            console.error(`[GameGrid] landing mismatch reel ${c} row ${row}: ` +
              `got ${slotSym[c][visIdx(row)]} want ${boardRows[c][row]}`)
          }
        }
      }
    }

    isSpinning.set(false)
  }

  function _clearAnticipationFor(col: number): void {
    stripRefs[col]?.classList.remove('anticipate')
  }

  async function _dropAll(boardRows: string[][]): Promise<void> {
    const stagger = get(isTurbo) ? 60 : 95
    const drops = Array.from({ length: REELS }, (_, c) => _dropReel(c, boardRows[c], c * stagger))
    await Promise.all(drops)
  }

  // ── Cancellable stagger wait (resolves instantly on slam) ────────────────
  // setTimeout-based (not rAF-polled) so a long cruise wait allocates one timer,
  // not a closure every frame — needless GC pressure otherwise.
  let _pendingWaitAbort: (() => void) | null = null
  function _sleepOrSlam(ms: number): Promise<void> {
    if (slamRequested) return Promise.resolve()
    return new Promise<void>((resolve) => {
      const t = setTimeout(() => { _pendingWaitAbort = null; resolve() }, ms)
      _pendingWaitAbort = () => { clearTimeout(t); _pendingWaitAbort = null; resolve() }
    })
  }
</script>

<div class="grid-container">
  <!-- Symbol grid — 5 columns × 4 visible rows, each a wrapped travelling strip -->
  <div class="symbol-grid">
    {#each Array(REELS) as _, col}
      <div class="symbol-col">
        <div class="reel-strip" bind:this={stripRefs[col]} data-col={col} style="transform: translateY({REST_Y}px);">
          {#each Array(STRIP) as _, i}
            <div
              class="symbol-cell"
              bind:this={slotCell[col][i]}
              data-col={col}
              data-slot={i}
              style="--plate-tint: #00ffff;"
            >
              <div class="tile-inner" bind:this={slotInner[col][i]}>
                {#if tilePlateSrc}
                  <img class="tile-plate" src={tilePlateSrc} alt="" draggable="false" aria-hidden="true" />
                {/if}
                <img
                  bind:this={slotImg[col][i]}
                  class="symbol-img idle-breathe"
                  src={symbolBaseSrc('L3')}
                  alt=""
                  draggable="false"
                />
                <img
                  bind:this={slotOverlay[col][i]}
                  class="symbol-overlay"
                  src=""
                  alt=""
                  aria-hidden="true"
                  draggable="false"
                  style="display:none;"
                />
                <div class="symbol-fx fx-none" bind:this={slotFx[col][i]} aria-hidden="true"></div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/each}
  </div>

  <!-- PixiJS canvas — transparent overlay for win lines, particles and borders -->
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

  .symbol-grid {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: row;
    gap: 4px;
  }

  /* Each column is a fixed viewport that clips its travelling strip. */
  .symbol-col {
    position: relative;
    width: 120px;
    height: 412px;
    flex-shrink: 0;
    overflow: hidden;
    border-radius: 8px;
  }

  /* The strip stacks STRIP tiles and is translated to scroll / drop. */
  .reel-strip {
    position: absolute;
    left: 0;
    top: 0;
    width: 120px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    will-change: transform;
  }

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
    box-shadow: inset 0 0 10px 1px color-mix(in srgb, var(--plate-tint, #00ffff) 55%, transparent);
  }

  /* Inner wrapper carries the velocity stretch / alpha so the strip geometry
     (used for exact landing) stays untouched. */
  .tile-inner {
    position: absolute;
    inset: 0;
    transform-origin: 50% 50%;
    will-change: transform, opacity;
    /* velocity stretch/alpha come from per-reel CSS vars set on the strip */
    transform: scaleY(var(--ts, 1));
    opacity: var(--ta, 1);
  }

  .tile-plate {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: fill;
    pointer-events: none;
    border-radius: 8px;
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

  /* Flipbook / fx overlay layer (Symbol Life v2) — a centred 82x82 square
     aligned to the symbol's contained render, screen-blended over the base. */
  .symbol-fx {
    position: absolute;
    top: 9px;
    left: 19px;
    width: 82px;
    height: 82px;
    pointer-events: none;
    background-repeat: no-repeat;
    background-position-y: center;
    mix-blend-mode: screen;
    opacity: 0.9;
  }
  .symbol-fx.fx-none { display: none; }
  /* M3 booster flame — 6-frame flipbook at ~9fps */
  .symbol-fx.fx-flame {
    background-size: 492px 82px;
    animation: fx-flame-cycle 0.66s steps(6) infinite;
  }
  @keyframes fx-flame-cycle { from { background-position-x: 0; } to { background-position-x: -492px; } }
  /* L2 fuse arc — 4-frame flicker at an irregular cadence */
  .symbol-fx.fx-arc {
    background-size: 328px 82px;
    animation: fx-arc-cycle 0.34s steps(4) infinite;
  }
  @keyframes fx-arc-cycle { from { background-position-x: 0; } to { background-position-x: -328px; } }

  /* Idles pause on travelling reels. */
  .reel-strip.spinning .symbol-img,
  .reel-strip.spinning .symbol-overlay,
  .reel-strip.spinning .symbol-fx { animation: none !important; }
  .reel-strip.spinning .symbol-overlay,
  .reel-strip.spinning .symbol-fx { display: none !important; }

  /* Scatter-anticipation charge glow on still-travelling reels - stronger glow
     plus a faint tremble on every tile of the anticipating reel. The tremble
     lives on the cell (which has no JS-driven transform), so it survives the
     .spinning gate and never fights the strip's travel transform. */
  .reel-strip.anticipate .tile-inner {
    filter: brightness(1.5) saturate(1.75) drop-shadow(0 0 16px rgba(0, 255, 255, 0.85));
  }
  @keyframes reel-tremble {
    0%, 100% { transform: translateX(0); }
    25%      { transform: translateX(-1.5px); }
    75%      { transform: translateX(1.5px); }
  }
  .reel-strip.anticipate .symbol-cell { animation: reel-tremble 0.09s linear infinite; }

  /* ── Symbol Life v2 idles (Set A) — tuned to read at 120px ─────────────── */
  @keyframes idle-breathe { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.03); } }
  .idle-breathe { animation: idle-breathe 3.4s ease-in-out infinite; }

  /* H2 nitro crimson charge halo (2.4s) + valve-hiss opacity flicker */
  @keyframes idle-charge {
    0%, 100% { filter: brightness(1) drop-shadow(0 0 2px rgba(255, 45, 61, 0.35)); }
    50%      { filter: brightness(1.14) drop-shadow(0 0 10px rgba(255, 45, 61, 0.9)); }
  }
  @keyframes valve-hiss { 0%,90%,100% { opacity: 1; } 93% { opacity: 0.82; } 96% { opacity: 1; } }
  .idle-charge { animation: idle-charge 2.4s ease-in-out infinite, valve-hiss 1.7s steps(1) infinite; }

  /* M1 rev — rim dash stream + rev LED chase (the LED strip is the fx layer) */
  @keyframes idle-rev {
    0%, 100% { filter: brightness(1); transform: scale(1); }
    50%      { filter: brightness(1.12) saturate(1.15); transform: scale(1.012); }
  }
  .idle-rev { animation: idle-rev 1.8s ease-in-out infinite; }

  /* M2 coilover — coil highlight chase (1.4s) + 3px body bob */
  @keyframes idle-coil {
    0%, 100% { transform: translateY(0); filter: brightness(1); }
    50%      { transform: translateY(-3px); filter: brightness(1.12) drop-shadow(0 0 6px rgba(138, 92, 255, 0.6)); }
  }
  .idle-coil { animation: idle-coil 1.4s ease-in-out infinite; }

  /* M3 booster — the flame flipbook lives on the fx layer; base gently breathes */
  @keyframes idle-flame { 0%, 100% { filter: brightness(1); } 50% { filter: brightness(1.08); } }
  .idle-flame { animation: idle-flame 1.2s ease-in-out infinite; }

  /* L1 chrome lug — facet glint sweep every 3s + bore ring pulse */
  @keyframes idle-glint {
    0%, 82%, 100% { filter: brightness(1); }
    88%           { filter: brightness(1.55) drop-shadow(0 0 7px rgba(255, 215, 0, 0.85)); }
    94%           { filter: brightness(1); }
  }
  .idle-glint { animation: idle-glint 3s ease-in-out infinite; }

  /* L2 fuse — arc flicker lives on the fx layer; base steady */
  @keyframes idle-arc { 0%, 100% { filter: brightness(1); } 50% { filter: brightness(1.06); } }
  .idle-arc { animation: idle-arc 2s ease-in-out infinite; }

  /* L3 piston - crown pump 7px over 2.2s */
  @keyframes idle-pump {
    0%, 100% { transform: translateY(0); }
    50%      { transform: translateY(-7px); }
  }
  .idle-pump { animation: idle-pump 2.2s ease-in-out infinite; }

  /* W wild — dual rings pulsing in opposite phase (approximated on the base) */
  @keyframes idle-rings {
    0%, 100% { filter: brightness(1) drop-shadow(0 0 3px rgba(255, 0, 255, 0.4)); transform: scale(1); }
    50%      { filter: brightness(1.2) drop-shadow(0 0 11px rgba(255, 0, 255, 0.85)); transform: scale(1.03); }
  }
  .idle-rings { animation: idle-rings 1.9s ease-in-out infinite; }

  /* S scatter — rays rotating (1 rev / 12s) + core pulse */
  @keyframes idle-rays { to { transform: rotate(360deg); } }
  @keyframes scatter-core {
    0%, 100% { filter: brightness(1) drop-shadow(0 0 4px rgba(255, 215, 0, 0.5)); }
    50%      { filter: brightness(1.25) drop-shadow(0 0 12px rgba(255, 215, 0, 0.95)); }
  }
  .idle-rays { animation: idle-rays 12s linear infinite, scatter-core 2s ease-in-out infinite; }

  /* H1 — continuous idle rotation on the spoke overlay, fast on wins. */
  @keyframes h1-idle-spin { to { transform: rotate(72deg); } }
  @keyframes h1-win-spin  { from { transform: rotate(0deg); } to { transform: rotate(720deg); } }
  .symbol-overlay { animation: h1-idle-spin 8s linear infinite; }
  .symbol-overlay.win-spin-fast { animation: h1-win-spin 0.6s cubic-bezier(0.2, 0.8, 0.3, 1) 1; }

  /* ── Win state — brighten, plate bloom, punch scale ──────────────────────── */
  /* Stronger, larger edge bloom in the symbol's tint (bigger spread + a wider
     outer halo) so winners glow hard against the dimmed losers. */
  @keyframes plate-bloom-pulse {
    0%, 100% {
      box-shadow:
        inset 0 0 16px 2px color-mix(in srgb, var(--plate-tint, #00ffff) 75%, transparent),
        0 0 14px 2px color-mix(in srgb, var(--plate-tint, #00ffff) 50%, transparent);
    }
    50%      {
      box-shadow:
        inset 0 0 30px 6px color-mix(in srgb, var(--plate-tint, #00ffff) 100%, transparent),
        0 0 28px 8px color-mix(in srgb, var(--plate-tint, #00ffff) 85%, transparent);
    }
  }
  .symbol-cell.plate-bloom { animation: plate-bloom-pulse 0.6s ease-in-out infinite; z-index: 5; }

  /* Dimmed, desaturated losers - spotlight the winners (harder than before). */
  .symbol-img:global(.loser-dim) {
    opacity: 0.2 !important;
    filter: grayscale(0.6) brightness(0.62) !important;
    animation: none !important;
    transition: opacity 0.2s ease, filter 0.2s ease;
  }

  /* 250ms charge pre-burst on winning tiles (Set B). */
  @keyframes pre-charge-pulse {
    0%   { box-shadow: inset 0 0 10px 1px color-mix(in srgb, var(--plate-tint, #00ffff) 55%, transparent); }
    100% { box-shadow: inset 0 0 20px 3px color-mix(in srgb, var(--plate-tint, #00ffff) 95%, transparent), 0 0 12px 2px color-mix(in srgb, var(--plate-tint, #00ffff) 60%, transparent); }
  }
  .symbol-cell.pre-charge { animation: pre-charge-pulse 0.25s ease-in forwards; z-index: 5; }

  /* Winner pop (biggest lift): a squash-and-stretch overshoot to 1.22 that
     spring-settles to 1.0, then a gentle 1.0<->1.06 pulse for the win duration.
     Flash and pop/pulse animate DIFFERENT properties (filter vs transform) so
     they run concurrently in one animation list; win-pulse is listed after
     win-pop (with a 0.5s delay) so it owns the transform once the pop settles. */
  @keyframes win-pop {
    0%   { transform: scale(0.86); }
    40%  { transform: scale(1.22); }
    64%  { transform: scale(0.97); }
    82%  { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
  @keyframes win-pulse {
    0%, 100% { transform: scale(1); }
    50%      { transform: scale(1.06); }
  }
  /* Brighter, higher-contrast white flash. */
  @keyframes win-flash-pulse {
    0%, 100% { filter: brightness(1.15) contrast(1.05) drop-shadow(0 0 10px rgba(255, 255, 255, 0.85)); }
    50%      { filter: brightness(1.65) contrast(1.22) drop-shadow(0 0 22px rgba(255, 255, 255, 1)); }
  }
  .symbol-img:global(.win-flash) {
    animation:
      win-pop 0.5s ease-out 1 both,
      win-pulse 0.9s ease-in-out 0.5s infinite,
      win-flash-pulse 0.55s ease-in-out infinite;
  }

  /* ── Scatter charge (Set B) — landed scatters charge during anticipation ── */
  @keyframes scatter-charge-bloom {
    0%, 100% { box-shadow: inset 0 0 12px 2px rgba(255, 215, 0, 0.5), 0 0 10px 2px rgba(255, 215, 0, 0.4); }
    50%      { box-shadow: inset 0 0 26px 6px rgba(255, 215, 0, 0.95), 0 0 22px 6px rgba(255, 215, 0, 0.8); }
  }
  .symbol-cell.scatter-charge { animation: scatter-charge-bloom 0.5s ease-in-out infinite; z-index: 6; }
  /* scanline sweep */
  .symbol-cell.scatter-charge::before {
    content: ''; position: absolute; inset: 0; border-radius: 8px; pointer-events: none;
    background: linear-gradient(to bottom, transparent 42%, rgba(255, 240, 170, 0.55) 50%, transparent 58%);
    animation: scatter-scanline 0.7s linear infinite; z-index: 7;
  }
  @keyframes scatter-scanline { 0% { background-position: 0 -100%; } 100% { background-position: 0 100%; } }
  /* orbiting spark */
  .symbol-cell.scatter-charge::after {
    content: ''; position: absolute; top: 50%; left: 50%; width: 6px; height: 6px; margin: -3px;
    border-radius: 50%; background: #fff8c0; box-shadow: 0 0 8px 3px rgba(255, 224, 120, 0.9);
    pointer-events: none; transform-origin: -34px 0; animation: scatter-orbit 0.9s linear infinite; z-index: 8;
  }
  @keyframes scatter-orbit { to { transform: rotate(360deg); } }

  .pixi-overlay {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 2;
  }
  .pixi-overlay :global(canvas) { display: block; }

  @media (prefers-reduced-motion: reduce) {
    .symbol-img, .symbol-overlay, .symbol-fx,
    .symbol-img:global(.win-flash), .symbol-cell.plate-bloom, .symbol-cell.pre-charge,
    .reel-strip.anticipate .symbol-cell,
    .symbol-cell.scatter-charge, .symbol-cell.scatter-charge::before, .symbol-cell.scatter-charge::after {
      animation: none !important;
    }
    .symbol-cell.scatter-charge::before, .symbol-cell.scatter-charge::after { display: none; }
    /* Winners still spotlight, but statically (no pop / pulse / flash motion);
       losers still dim. Particle bursts are gated in JS (_reduceMotion). */
    .symbol-img:global(.loser-dim) { transition: none; }
  }
</style>
