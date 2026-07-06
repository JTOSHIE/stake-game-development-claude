# Future Spinner chrome primitives (canonical design reference)

The single source of truth for the brushed-steel `.fs-` chrome, for any design
pass (Claude Design mocks and coding-agent implementations). Because Claude
Design builds mocks in a separate environment without repo access, this file is
the hand-over: it carries the exact primitives, tokens and states so a mock can
be built on them without reading the shipped components.

**Canonical source in the repo** (these `<style>` blocks are the real thing;
this doc mirrors them):
- `frontend/src/lib/components/PaytableModal.svelte` (B3 paytable)
- `frontend/src/lib/components/HudOverlay.svelte` (B1 HUD)
- `frontend/src/lib/stores/overdriveVisual.ts` (the shared Overdrive flag)

## Constraints (do not regress)
- NO external font CDN. Do NOT add a `fonts.googleapis.com` / `fonts.gstatic.com`
  `<link>`. Orbitron is self-hosted via `@fontsource`; just use
  `font-family: 'Orbitron', system-ui, sans-serif`.
- Australian English. NO em dashes or en dashes anywhere (use hyphens; the `x`
  multiplication sign is fine).
- Svelte scopes styles per component, so each component RE-DECLARES the
  primitives + tokens in its own scoped `<style>`. That is correct, not
  duplication to avoid.

## The 5 signature tokens (declare on your component root)
All colour flows from these; one scheme class re-tints everything.
```css
.your-root {
  --sig-cyan:   var(--theme-primary,   #00FFFF);
  --sig-magenta:var(--theme-secondary, #FF00FF);
  --sig-pink:   #FF2EC4;
  --sig-gold:   #FFD700;
  --sig-orange: #FF9A2E;
  --sig-green:  #4EFF91;
  --acc:  var(--sig-cyan);   /* live accent - flips in Overdrive */
  --acc2: var(--sig-pink);
}
```

## Primitives
```css
/* notched brushed-chrome plate (bezel + face + optional left rail) */
.fs-plate {
  position: relative; --sig: var(--sig-cyan); padding: 2px;
  clip-path: polygon(0 0, calc(100% - 13px) 0, 100% 13px, 100% 100%, 13px 100%, 0 calc(100% - 13px));
  background: linear-gradient(150deg, #eef5fa, #b3c6d2 15%, #63737f 37%, #2b363f 52%, #8499a8 72%, #dceaf2);
  box-shadow: 0 3px 10px rgba(0,0,0,.6), 0 0 9px color-mix(in srgb, var(--sig) 20%, transparent), inset 0 1px 0 rgba(255,255,255,.35);
}
.fs-plate > .fs-face {
  position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center;
  clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px));
  background: linear-gradient(160deg, color-mix(in srgb, var(--sig) 12%, transparent), transparent 44%), linear-gradient(180deg, #111a2b, #070b16);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.07), inset 0 -8px 18px rgba(0,0,0,.6);
}
/* left neon signature rail */
.fs-rail {
  position: absolute; left: 2px; top: 9px; bottom: 9px; width: 3px; border-radius: 2px; z-index: 2;
  background: var(--sig); box-shadow: 0 0 8px var(--sig);
}
/* round chrome bezel (buttons) */
.fs-knob {
  border-radius: 50%; padding: 3px; position: relative;
  background: conic-gradient(from 216deg, #e7f1f7, #93a7b5, #39454f, #728593, #eef5fa, #4f5f6b, #a9bcc8, #e7f1f7);
  box-shadow: 0 3px 10px rgba(0,0,0,.6), inset 0 1px 0 rgba(255,255,255,.55);
}
.fs-knob > .fs-face {
  position: absolute; inset: 3px; border-radius: 50%;
  background: radial-gradient(circle at 36% 28%, #1a3640, #06131c 72%);
  display: flex; align-items: center; justify-content: center;
  box-shadow: inset 0 2px 3px rgba(255,255,255,.14), inset 0 -6px 12px rgba(0,0,0,.7);
}
/* crisp tabular numerals */
.fs-num { font-variant-numeric: tabular-nums; -webkit-font-smoothing: antialiased; text-rendering: geometricPrecision; }
```

## Overdrive two-state + swappable schemes
```css
/* accents flip cyan -> magenta on feature entry */
.your-root--overdrive { --acc: var(--sig-pink); --acc2: var(--sig-orange); }

/* template layer - one class re-tints the whole component per skin */
.your-root.scheme-trap  { --sig-cyan:#39FF14; --sig-pink:#FF7A1A; --sig-gold:#EBFF5A; --sig-orange:#FF6600; --sig-green:#B6FF3C; }
.your-root.scheme-oil   { --sig-cyan:#FF8A3D; --sig-pink:#D9A86A; --sig-gold:#F5D061; --sig-orange:#FF5A1F; --sig-green:#F0B24A; }
.your-root.scheme-pitch { --sig-cyan:#2FD24F; --sig-pink:#FFD700; --sig-gold:#EDE7C8; --sig-orange:#4CE06B; --sig-green:#5BE07A; }
```
Drive the Overdrive state from the shared store (App already mirrors it live):
```svelte
import { overdriveVisual } from '../stores/overdriveVisual'
<div class="your-root" class:your-root--overdrive={$overdriveVisual}> ... </div>
```
`overdriveVisual.ts` is simply `export const overdriveVisual = writable(false)`.

## Win-tier reference (C1 celebrations)
Confirmed from `WinBanner.svelte` (these match the autoplay-pause thresholds):
| tier | threshold | count-up | particles | suggested token |
|---|---|---|---|---|
| BIG  | `>= 10x`  | 1400ms | 14 | `--sig-cyan` |
| MEGA | `>= 30x`  | 2000ms | 28 | `--sig-pink` (+ `--sig-gold`) |
| EPIC | `>= 100x` | 2800ms | 48 | `--sig-gold` (rainbow) |
| MAX  | `= 5,000x` cap | dedicated fullscreen, explicit COLLECT (Enter), 90 particles, halo ring | `--sig-pink` / `--sig-orange` (Overdrive pair) |

Small wins `1x` to `<10x` are a brief non-blocking `WIN!` / `PRIZE!` flash
(1.2s), not a tiered plate. Set `--sig` per tier on the plate and the rail/face
bloom follow automatically. Amounts via `formatBalance` + `CURRENCY_SCALE`;
`WIN` <-> `PRIZE` via the `isSocial` i18n switch.
