// loopBed.ts, a gapless looping music bed for soundService (R148)
//
// WHY THIS EXISTS. A looping <audio> element does not loop gaplessly in Chromium: at every
// wrap the element waits for end of stream, seeks and restarts, and its clock stalls about
// 50 to 60 ms (measured R148 with no instrument attached: a 10,959 to 10,969 ms period against
// 10,909 ms of audio, headed and headless, webm and mp3 alike). A longer file only makes the
// stall rarer (the 16-bar encode stalled 43 to 48 ms every 43.6 s). The bed's own join is clean:
// decodeAudioData returns exactly the 523,636-frame loop and its seam is 1.50 dB. So the file
// is fine and the player is not. An AudioBufferSourceNode looping the decoded buffer is
// sample-exact, which is the only mechanism R148 measured with nothing inserted at the wrap.
//
// SHAPE. LoopBed stands in for the HTMLAudioElement that soundService used for the bed, with
// the same small surface soundService drives (volume, muted, paused, currentTime, loop,
// play(), pause()), so the mute loop, applyVolumes, both ducks, the warm-up and the 600 ms
// Overdrive crossfade keep working unchanged. It keeps the element's autoplay contract too:
// play() REJECTS with NotAllowedError when the page has no user activation, which is what
// arms soundService's gesture starter. That needs care, because AudioContext.resume() called
// before any gesture never rejects: it stays pending until a LATER resume() succeeds (a gesture
// alone does not settle it; measured R148 in Chromium, WebKit and Firefox), and in Chromium the
// call logs an autoplay warning. So play() never calls resume() before the page has user
// activation: it refuses at once, as an element does. With activation it calls resume()
// synchronously inside the caller's own event (WebKit wants it there), then again, bounded.
//
// One deliberate difference from an element: `paused` stays true until the source has actually
// started, not from the moment play() is called. A touch tap's pointerdown carries no
// activation and its click does; were a refused-but-pending start to read as playing, the
// click would skip play() and the tap would be lost (R148 self-audit, reproduced on touch).
//
// If Web Audio is unavailable, or neither encode fetches and decodes, the bed falls back to
// a plain looping <audio> element, exactly as before R148, rather than falling silent.

/** The part of an HTMLAudioElement that soundService drives. */
export type Voice = Pick<HTMLAudioElement, 'volume' | 'muted' | 'paused' | 'currentTime' | 'loop' | 'play' | 'pause'>

// Build the context at the bed's own rate, so the decoded webm loop is bit-exact. At 44.1 kHz
// it is still gapless but resampled (a join step of 0.5 to 0.6x the loop's 99.9th-percentile
// step, measured R148).
const BED_SAMPLE_RATE = 48000
// Gain changes glide with this time constant instead of stepping, so a duck or a crossfade
// step cannot click: about 15 ms to settle, well inside every duck and fade in the game.
const GAIN_GLIDE_S = 0.005
// How long play() waits, once the page has user activation, for a suspended context to start.
// No wait is unbounded: a play() that never settles would never report a refusal, so
// soundService's gesture starter would never arm and the bed would stay silent. With activation
// resume() settles within milliseconds, so the cap only guards a browser that still refuses.
// Where the activation API is missing the page cannot tell, so it tries and gives up sooner.
const RESUME_WAIT_ACTIVATED_MS = 3000
const RESUME_WAIT_UNKNOWN_MS = 1000

type Ctor = typeof AudioContext

function audioContextCtor(): Ctor | null {
  if (typeof window === 'undefined') return null
  const w = window as unknown as { AudioContext?: Ctor; webkitAudioContext?: Ctor }
  return w.AudioContext ?? w.webkitAudioContext ?? null
}

let sharedCtx: AudioContext | null = null
function bedContext(): AudioContext {
  if (sharedCtx) return sharedCtx
  const C = audioContextCtor() as Ctor
  try {
    sharedCtx = new C({ sampleRate: BED_SAMPLE_RATE })
  } catch {
    sharedCtx = new C()
  }
  return sharedCtx
}

type Activation = 'active' | 'sticky' | 'none' | 'unknown'

/** The page's user activation (HTML's transient and sticky activation), or 'unknown' where
 * navigator.userActivation is missing. */
function activation(): Activation {
  const ua = (navigator as unknown as { userActivation?: { isActive: boolean; hasBeenActive: boolean } }).userActivation
  if (!ua) return 'unknown'
  return ua.isActive ? 'active' : ua.hasBeenActive ? 'sticky' : 'none'
}

function abortError(): Error {
  try {
    return new DOMException('The bed was paused before it could start.', 'AbortError')
  } catch {
    const e = new Error('The bed was paused before it could start.')
    e.name = 'AbortError'
    return e
  }
}

function notAllowed(): Error {
  try {
    return new DOMException('The bed could not start without a user gesture.', 'NotAllowedError')
  } catch {
    const e = new Error('The bed could not start without a user gesture.')
    e.name = 'NotAllowedError'
    return e
  }
}

export class LoopBed implements Voice {
  loop = true
  /** Called when the browser suspends or interrupts the context under a playing bed (iOS),
   * so soundService can arm its gesture starter to bring it back. */
  onInterrupted: (() => void) | null = null

  private readonly ctx: AudioContext
  private readonly gain: GainNode
  private readonly loaded: Promise<AudioBuffer | null>
  private buffer: AudioBuffer | null = null
  private source: AudioBufferSourceNode | null = null
  private fallbackEl: HTMLAudioElement | null = null
  private readonly makeFallback: () => HTMLAudioElement
  private wantPlay = false
  // Bumped by every play() and pause(), so only the newest request may cancel a start.
  private playGen = 0
  private startedAt = 0
  private offset = 0
  private _volume = 1
  private _muted = false

  constructor(urls: string[], makeFallback: () => HTMLAudioElement) {
    this.makeFallback = makeFallback
    this.ctx = bedContext()
    this.gain = this.ctx.createGain()
    this.gain.connect(this.ctx.destination)
    this.ctx.addEventListener('statechange', () => this.onStateChange())
    this.loaded = this.load(urls)
  }

  // ── the element surface ──────────────────────────────────────────────────

  get volume(): number { return this.fallbackEl ? this.fallbackEl.volume : this._volume }
  set volume(v: number) {
    if (this.fallbackEl) { this.fallbackEl.volume = v; return }
    this._volume = Math.max(0, Math.min(1, v))
    this.applyGain()
  }

  get muted(): boolean { return this.fallbackEl ? this.fallbackEl.muted : this._muted }
  set muted(m: boolean) {
    if (this.fallbackEl) { this.fallbackEl.muted = m; return }
    this._muted = m
    this.applyGain()
  }

  /** True until the source has actually started (see the header: a pending start is not
   * playing), and again after pause() or a refusal. */
  get paused(): boolean { return this.fallbackEl ? this.fallbackEl.paused : !(this.wantPlay && this.source !== null) }

  get currentTime(): number {
    if (this.fallbackEl) return this.fallbackEl.currentTime
    return this.source ? this.position() : this.offset
  }
  set currentTime(t: number) {
    if (this.fallbackEl) { this.fallbackEl.currentTime = t; return }
    this.offset = this.wrap(t)
    if (this.source) { this.stopSource(); this.startSource() }
  }

  play(): Promise<void> {
    this.wantPlay = true
    const gen = ++this.playGen
    if (this.fallbackEl) return this.fallbackEl.play()
    // Inside a gesture, resume in the gesture itself. Never before activation (see the header).
    if (!this.running() && activation() !== 'none') this.ctx.resume().catch(() => {})
    return this.loaded.then(async (buf) => {
      if (!this.wantPlay) throw abortError()
      if (this.fallbackEl) return this.fallbackEl.play()
      if (!buf) throw notAllowed()
      if (!this.running()) {
        const act = activation()
        if (act !== 'none') await this.resumeContext(act)
        if (!this.wantPlay) throw abortError()
        if (!this.running()) {
          // Only the newest request may give the start up; an older one's refusal must not
          // cancel a newer start that is still waiting on its own resume().
          if (gen === this.playGen) this.wantPlay = false
          throw notAllowed()
        }
      }
      if (!this.source) this.startSource()
    })
  }

  pause(): void {
    this.wantPlay = false
    this.playGen++
    if (this.fallbackEl) { this.fallbackEl.pause(); return }
    if (this.source) {
      this.offset = this.position()
      this.stopSource()
    }
  }

  // ── internals ────────────────────────────────────────────────────────────

  private async load(urls: string[]): Promise<AudioBuffer | null> {
    for (const url of urls) {
      try {
        const res = await fetch(url)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const bytes = await res.arrayBuffer()
        this.buffer = await this.ctx.decodeAudioData(bytes)
        return this.buffer
      } catch (e) {
        console.warn(`[Sound] Bed failed to load as a buffer: ${url}`, e)
      }
    }
    // Neither encode decoded: carry on as a plain looping element, as before R148.
    const el = this.makeFallback()
    el.loop = true
    el.volume = this._volume
    el.muted = this._muted
    this.fallbackEl = el
    return null
  }

  /** Read fresh each time: the context's state changes while play() awaits. */
  private running(): boolean {
    return (this.ctx.state as string) === 'running'
  }

  /** Once the page has activation, ask the context to run and wait, for a bounded time; the
   * caller then checks the state and reports NotAllowedError if it is still not running. This
   * resume() also settles any earlier one still pending (see the header). */
  private resumeContext(act: Activation): Promise<void> {
    const resumed = this.ctx.resume().catch(() => {})
    const cap = act === 'unknown' ? RESUME_WAIT_UNKNOWN_MS : RESUME_WAIT_ACTIVATED_MS
    return Promise.race([resumed, new Promise<void>((r) => setTimeout(r, cap))])
  }

  private onStateChange(): void {
    if (this.fallbackEl) return
    const state = this.ctx.state as string
    if (state !== 'running' && this.wantPlay && this.source) {
      // Suspended or interrupted under a playing bed (iOS: a call, the app backgrounded).
      // Treat it as paused, keeping the place, and let soundService re-arm its starter.
      this.pause()
      this.onInterrupted?.()
    }
  }

  private startSource(): void {
    if (!this.buffer) return
    const src = this.ctx.createBufferSource()
    src.buffer = this.buffer
    src.loop = true // loopStart = loopEnd = 0: the whole decoded buffer, sample-exact
    src.connect(this.gain)
    const at = this.offset
    src.start(0, at)
    this.startedAt = this.ctx.currentTime - at
    this.source = src
    this.applyGain()
  }

  private stopSource(): void {
    const src = this.source
    this.source = null
    if (!src) return
    try { src.stop() } catch { /* already stopped */ }
    src.disconnect()
  }

  private position(): number {
    return this.wrap(this.ctx.currentTime - this.startedAt)
  }

  private wrap(t: number): number {
    const d = this.buffer?.duration ?? 0
    if (!(d > 0)) return 0
    return ((t % d) + d) % d
  }

  private applyGain(): void {
    const target = this._muted ? 0 : this._volume
    const p = this.gain.gain
    const now = this.ctx.currentTime
    p.cancelScheduledValues(now)
    if (this.ctx.state === 'running') p.setTargetAtTime(target, now, GAIN_GLIDE_S)
    else p.value = target
  }
}

/** A gapless Web Audio bed where the browser has Web Audio, else the plain element. Building
 * the bed runs at module load, so a context that cannot be built (an exotic environment, a
 * browser's per-page context limit) must never throw out of here: that would take the whole
 * game down with it, which R148's own proof harness showed when its tap made the constructor
 * throw. Any failure falls back to the looping element. */
export function makeLoopBed(urls: string[], makeFallback: () => HTMLAudioElement): Voice {
  if (audioContextCtor()) {
    try {
      return new LoopBed(urls, makeFallback)
    } catch (e) {
      console.warn('[Sound] Web Audio bed unavailable, using the <audio> element', e)
    }
  }
  const el = makeFallback()
  el.loop = true
  return el
}
