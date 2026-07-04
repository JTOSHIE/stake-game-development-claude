# FUTURE SPINNER: TELEMETRY EVENT TAXONOMY

Australian English, no em/en dashes. The analytics event schema, designed once at fine grain so
every skin emits a consistent stream. Implemented in `frontend/src/lib/services/telemetry.ts`
(vendor-agnostic, pluggable sink, no-op until a sink is registered). Telemetry OBSERVES only; it
never touches the outcome path, so it does not affect provably-fair reconstruction.

## Envelope (on every event)

| Field | Type | Meaning |
|---|---|---|
| `type` | string | event name (below) |
| `ts` | number | emit time (monotonic `performance.now`; analytics only, not the game outcome) |
| `mode` | string | bet mode in play (base/cruise/ante/.../buy tier) |
| `betMicros` | number | base bet, integer micros |
| `currency` | string | ISO currency |
| `social` | boolean | social/sweeps session |

Money is always integer micros (never floats), matching the maths rule.

## Events

| `type` | Extra fields | Emitted when |
|---|---|---|
| `session_start` | - | game loaded / RGS authenticated |
| `mode_change` | `from`, `to` | standing mode or buy tier changes |
| `spin` | `costMicros` | a normal spin is placed (cost = bet x mode cost) |
| `buy` | `tier`, `costMicros` | a feature buy is placed |
| `win` | `winMicros`, `multiple`, `tier` | a round resolves with a win (tier = small/big/mega/epic/max) |
| `feature_trigger` | `scatters`, `spins` | free spins are triggered |
| `feature_complete` | `totalMicros`, `multiple` | the feature round finishes |
| `wincap` | `multiple` | the 5,000x (or skin cap) is reached |
| `error` | `code`, `detail?` | a client/RGS error surfaces |

## Win tiers (multiples of TOTAL BET; configurable per skin)

max >= 5000, epic >= 1000, mega >= 200, big >= 20, small > 0, else none. These are studio choices,
not platform standards; adjust per skin in `telemetry.ts` `WIN_TIERS`.

## Usage

```ts
import { configureTelemetry, setTelemetrySink, track, bufferSink, winTier } from './telemetry'
configureTelemetry(() => ({ mode, betMicros, currency, social })) // lazy session envelope
setTelemetrySink(bufferSink(buf)) // dev; production wires the vendor sink
track({ type: 'spin', costMicros })
track({ type: 'win', winMicros, multiple, tier: winTier(multiple) })
```

## Notes for production

- The owner picks the analytics vendor and registers a sink (batching/transport live in the sink).
- Add funnel/retention events (first_spin, first_feature, session_end, deposit_prompt) as needed;
  keep the envelope stable so cross-game dashboards work.
- Never send personal data; the envelope carries no player identity (the platform owns identity).
