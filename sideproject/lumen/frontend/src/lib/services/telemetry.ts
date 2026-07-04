// telemetry.ts — vendor-agnostic analytics event emitter for the template.
//
// Designed ONCE at fine grain so every skin emits a consistent event stream (see
// docs/TELEMETRY_TAXONOMY.md). The emitter is a thin, side-effect-free layer with a
// PLUGGABLE SINK: nothing is sent until a sink is registered, so it is a no-op in
// production until the owner wires an analytics vendor. It never touches the OUTCOME
// path (it only observes), so it cannot affect provably-fair reconstruction.

export type TelemetrySink = (event: TelemetryEvent) => void

/** Common envelope on every event. */
export interface TelemetryBase {
  ts: number // emit time (analytics only; NOT part of the game outcome)
  mode: string // bet mode in play (base/cruise/ante/... or a buy tier)
  betMicros: number // base bet in integer micros
  currency: string
  social: boolean // social/sweeps session
}

export type TelemetryEvent =
  | (TelemetryBase & { type: 'session_start' })
  | (TelemetryBase & { type: 'mode_change'; from: string; to: string })
  | (TelemetryBase & { type: 'spin'; costMicros: number })
  | (TelemetryBase & { type: 'buy'; tier: string; costMicros: number })
  | (TelemetryBase & { type: 'win'; winMicros: number; multiple: number; tier: WinTier })
  | (TelemetryBase & { type: 'feature_trigger'; scatters: number; spins: number })
  | (TelemetryBase & { type: 'feature_complete'; totalMicros: number; multiple: number })
  | (TelemetryBase & { type: 'wincap'; multiple: number })
  | (TelemetryBase & { type: 'error'; code: string; detail?: string })

export type WinTier = 'none' | 'small' | 'big' | 'mega' | 'epic' | 'max'

// Win-tier thresholds as multiples of TOTAL BET (studio choice; configurable per skin).
const WIN_TIERS: Array<[WinTier, number]> = [
  ['max', 5000],
  ['epic', 1000],
  ['mega', 200],
  ['big', 20],
  ['small', 0.000001],
]
export function winTier(multiple: number): WinTier {
  for (const [tier, min] of WIN_TIERS) if (multiple >= min) return tier
  return 'none'
}

let sink: TelemetrySink | null = null
let base: () => Omit<TelemetryBase, 'ts'> = () => ({
  mode: 'base',
  betMicros: 0,
  currency: 'USD',
  social: false,
})

/** Register the analytics sink (owner wires the vendor). Dev can use a buffer sink. */
export function setTelemetrySink(s: TelemetrySink | null): void {
  sink = s
}

/** Provide the current session envelope (mode/bet/currency/social) lazily. */
export function configureTelemetry(fn: () => Omit<TelemetryBase, 'ts'>): void {
  base = fn
}

/** Emit an event. No-op when no sink is registered. Never throws into the caller. */
export function track(ev: Omit<TelemetryEvent, keyof TelemetryBase> & Partial<TelemetryBase>): void {
  if (!sink) return
  try {
    const env = base()
    const now = typeof performance !== 'undefined' ? performance.now() : 0
    sink({ ts: now, ...env, ...ev } as TelemetryEvent)
  } catch {
    /* telemetry must never break gameplay */
  }
}

/** Simple in-memory buffer sink for dev/testing (inspect window.__telemetry). */
export function bufferSink(buf: TelemetryEvent[] = []): TelemetrySink {
  return (e) => {
    buf.push(e)
  }
}
