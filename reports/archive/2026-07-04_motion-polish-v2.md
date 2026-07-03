# Session Report: Motion Polish v2 — reel feel, symbol life, celebrations, Overdrive transition, brand screens

- **Date:** 2026-07-04
- **Branch:** `claude/motion-polish-v2` (from up-to-date `main`; PR #13 ux-polish already
  merged to main).
- **Brief:** `FS_MotionPolish_v2_Prompt.md` (saved verbatim).

## Asset pipeline extension (read-only masters, additive manifest entries)

Two new layered exports, generated the same deterministic way as the existing H1
spoke/H2-gauge pair (`npm run assets`, `scripts/assets/build.py`/`manifest.json`), byte-
identical for every pre-existing export (confirmed via `git status` after rebuild — only
the 4 new files appeared):

- **H2 reel-symbol scale** (`symbols/h2_base.png` / `symbols/h2_needle.png`, 240x240): the
  same needle-isolation already used for the HUD gauge, rendered at symbol-cell scale, so
  the H2 reel symbol can idle-flicker and win-slam its own needle independently of the HUD.
- **Brand mark inner disc** (`ui/brand_mark_base.png` / `ui/brand_mark_spin.png`, 512x512):
  isolates the five-fold `bpair` blade cluster (one real `<g id="bpair">` plus four `<use
  href="#bpair">` clones at 72/144/216/288deg) from the static rim/hub, per DESIGN_SYSTEM's
  brand-mark law ("a neon chrome rim whose inner layer spins independently"). `build.py`
  gained one small extension (`href_ids` matching in `top_level_matches`/`layered()`) to
  isolate a group *and* its `<use>` clones, since the brand mark's blades are exactly that
  pattern — H1/H2's existing layered specs are untouched and still byte-identical.

## 1. Reel feel (owner priority one)

`GameGrid.svelte` rewritten:

- **Ticker-driven, 60fps** (`app.ticker`, the same PixiJS instance already driving the
  win-line/particle layers): a single ticker callback advances per-column rapid symbol
  cycling (~16/s) and the particle simulation — no per-frame allocation (a fixed 90-slot
  particle pool, fields reset in place).
- **Vertical blur — no CSS `filter: blur()` anywhere.** Replaced with a velocity-scaled
  vertical stretch (`scaleY(1.18)`) plus a brightness dip and the rapid symbol-cycling
  noise described above — the "no live blur filters" requirement is met literally (grepped
  clean) rather than by degree.
- **Staggered stops, overshoot slam + settle:** the existing rAF-driven bounce (`_bounceCol`)
  tuned up (10px overshoot, ease-out settle).
- **Scatter anticipation, extended + glowing:** anticipation is now primarily
  scatter-count-driven (accumulated across reels 0-3, not just after reel 2 as before) —
  once 2+ scatters have landed, the glow (`brightness(1.6) saturate(1.8)
  drop-shadow(cyan)`) applies to the remaining spinning columns and the final reel's hold
  extends by 900ms (scaled by speed tier) before landing. The prior near-miss check
  (premium-symbol near-match) remains as a secondary trigger with the original 600ms hold.
- **Mid-spin slam-stop:** the SPIN button now stays clickable while spinning (previously
  disabled) and dispatches a `slam` event instead of a new spin request; `GameGrid` exports
  `slamStop()`, which makes every pending `await wait(ms)` resolve immediately via a
  cancellable-wait helper, and switches the remaining bounces to a fast (~20-30ms) variant.
  Outcome is unchanged — the board was already determined before `animateSpin` started;
  this only fast-forwards the presentation. Verified headlessly: clicking spin then
  slamming ~150ms later brought total elapsed time for all 5 reels to land down to ~500ms.
- **Speed tiers scale every duration:** Normal 1x / Turbo 0.5x / Super Turbo 0.16x (near-
  instant) applied to reel-stop timing and the anticipation hold. Autoplay's inter-spin
  pause (App.svelte `scheduleAutoSpin`) now scales by the same tier factor.

## 2. Symbol life

- **H1** — the existing `h1_base`/`h1_spin` layered pair: the spoke overlay rotates
  continuously at idle (`h1-idle-spin`, seamless every 72deg — five-fold symmetry) and
  bursts into a fast multi-rotation spin-up on wins (`win-spin-fast`, 0→720deg over 0.6s).
- **H2** — the new symbol-scale `h2_base`/`h2_needle` pair: the needle idles with a small
  flicker held low (`rotate(-75deg)` ±3deg) and slams to the baked "redline" orientation
  (`rotate(0deg)`, the needle PNG's own baked angle) on wins with an overshoot-then-settle
  ease.
- **Every other symbol** gets its lineup-table idle micro-motion via a CSS class keyed off
  the symbol id: M2 (Grille) light-bar brightness sweep, M3 (Booster) two-step flicker, L3
  (Piston) heat-shimmer glow pulse, L2 (Spark Plug) periodic arc blink; M1/L1/Wild/Scatter
  get the generic gentle breathing pulse (scale 1.000→1.015) the design system specifies
  for "the rest."
- **Uniform WIN state** on every winning cell: the tile plate edge blooms in the symbol's
  signature colour (`plates.json`, animated box-shadow pulse), the symbol punches in scale
  (`win-flash-pulse`, now includes a scale beat, not just brightness), and a pooled Pixi
  particle burst fires in that same colour at the cell's centre. Verified visually (screen-
  shotted) with real winning cells showing the bloom + orange (L3 heat-orange) particle
  burst exactly matching the win-line's own cells.

## 3. Win presentation

- Winning symbols brighten (opacity 1, `win-flash`), non-winners dim (opacity 0.35) —
  unchanged behaviour, verified still correct.
- **New:** `WinBreakdown.svelte` — after the win burst settles (900ms), cycles group by
  group through `activeWins` (symbol, count, ways, pay), 1.4s per group, matching exactly
  what the interpreter/RGS reported as winning. Mounted in the grid area, auto-hides when
  spinning starts or wins clear.
- Win amounts still count up incrementally (unchanged, `WinDisplay`/`WinBanner`).

## 4. Celebrations

- `WinBanner.svelte` gained explicit **BIG (10x) / MEGA (30x) / EPIC (100x)** tiers — the
  same thresholds the autoplay-pause logic already used — each with its own tier label,
  border/glow intensity, staged count-up duration (1.4s/2.0s/2.8s), and an escalating CSS
  particle burst (14/28/48 particles, widening colour palette per tier).
- **Screen shake** (`App.svelte`, `.game-wrapper.shake`): fires on every feature trigger and
  on any win ≥50x (once per win, guarded against re-firing while the amount is still
  displayed). The keyframe re-applies `scale(S)` at every step so the stage stays correctly
  sized while shaking.
- Every new animation (idle motions, plate bloom, banner particles, screen shake) is wrapped
  in `@media (prefers-reduced-motion: reduce)` — verified by grep across every edited file.

## 5. Overdrive transition

`FreeSpinsPresentation.svelte`'s `entry` phase is now a five-stage sequence
(`entryStage`: flare → dip → gauge → burst → settle, each turbo-aware via the existing
`dur()`): a scatter-gold radial flare, a screen dip (dark vignette), the gauge_face/
gauge_needle pair scaling up to centre-frame with the needle ripping from a low idle angle
to the baked redline orientation, a "+N FREE SPINS" text burst, then a fade-out settle —
handing off to the real `BonusInstrumentColumn` (already present in its column position the
whole time, since it and the grid overlay never spatially overlap). The background
crossfade and a new frame neon hue-shift (`.game-frame.overdrive-active`, a distinct
`hue-rotate(280deg)` keyframe variant so it doesn't fight the base glow-pulse animation) are
now driven by a new bindable `overdriveVisualActive` (true through entry+spin, false the
moment the `end` phase starts) instead of the raw `featureActive` flag — so the reverse
shift plays out **behind the total-win summary**, not after it, per the brief. Fixed a
latent bug found while touching this: the template's outer guard required
`script.triggered`, silently swallowing the non-triggered base-wincap walkthrough branch
added in the UX-polish pass; now guards on `script` alone.

## 6. Scene life

`SceneGroup.svelte`: added a slow car underglow pulse near the hover pads, a faint
booster-light flicker, and an occasional visor glint on the character — all low-opacity,
positioned as overlays on the single flat art (no new masters), and all disabled under
reduced-motion.

## 7. Brand screens

- **`LoadingScreen.svelte` rebuilt** to the WRS standard: the new `brand_mark_base`/
  `brand_mark_spin` pair renders large with the inner five-fold disc spinning continuously
  as the loader itself, "WE ROLL SPINNERS" wordmark in CSS Orbitron above, the active
  theme's game logo below.
- **New `IntroSplash.svelte`** — the Overdrive rules explainer (trigger table, meter,
  retrigger, buy line gated by jurisdiction) with a Continue control, shown once per browser
  session (`sessionStorage`) right after loading finishes. Localised across all 16 locales
  with social overrides by reusing the existing `rulesOverdrive*` feature-i18n keys
  unchanged; added exactly one new key, `introContinue` ("Continue"), to all 16 locale
  blocks in `translations.ts` (`FeatureKey`/`FeatureStrings`) for the Continue label.
  Spacebar-spin is blocked while it's showing.

## Proof gates

**a. FPS — 20 spins including one bonus entry, headless (`frontend/scripts/
motion_v2_proof.mjs`):**

| Metric | Result |
|---|---|
| Samples | 7,394 frames |
| Average frame time | 16.69ms |
| **Average fps** | **59.93** (gate: ≥55 — PASS) |
| Frames over 100ms | 1 |

One single frame over 100ms (150-167ms across repeated runs) was found, reproducibly at the
exact same point every run: the very first time the Overdrive entry/`BonusInstrumentColumn`
subtree ever mounts on a fresh page load. I investigated this rather than just log it: tried
preloading the gauge images (`App.svelte` onMount) and preloading the curated mock-sample
JSON (`roundProvider.preloadSamples()`, since that file is 2.68MB and parsing it cold used
to happen exactly at the first bonus buy) — both are real, kept optimisations, but neither
eliminated the single hitch, and its duration varies run to run (150ms vs 166-167ms),
which together point to a one-time browser/JS-engine cold-start cost (first style
recalculation + first execution of that code path) rather than a data-loading or rendering
defect. It is a single occurrence out of 7,394 sampled frames, tied to a page's first-ever
Overdrive entry, and does not recur on any subsequent trigger or during any of the
19 other (steady-state) spins — i.e. it does not affect reel motion, which is what "jitter
is a defect class" is about. Reporting this plainly rather than suppressing it; flagging
for the owner in case a stricter zero-tolerance reading of the gate is wanted, in which
case the next lever would be deferring the `BonusInstrumentColumn`/entry-overlay Svelte
component compilation cost further (e.g. an explicit warm mount hidden at opacity 0 during
loading) — not attempted here to avoid rushing a fragile fix this late in the pass.

**b. GIF captures** — `reports/screens/motion-v2/`:

| Clip | Size | Content |
|---|---|---|
| `spin-stagger.gif` | 1.03 MB | A spin showing the per-reel staggered stop |
| `win-bloom.gif` | 1.05 MB | A win showing plate bloom + particle burst (trimmed to the winning spin's tail, since the search for a win takes a variable number of attempts) |
| `overdrive-transition.gif` | 0.67 MB | The full five-stage Overdrive entry sequence |

All three well under the 3MB gate (9fps, 360px wide, 96-colour palette).

**c. Occlusion re-run at 1280x720** (same methodology as the UX-polish pass, `.game-frame`
vs. every text-bearing HUD element): 11 boxes checked, **0 failures**.

**d. Exact-total interpreter test:** PASS 58/58 (full expanded pool from the UX-polish pass,
unchanged by this session).

**e. Type/build:**

| Gate | Result |
|------|--------|
| `svelte-check` on edited/new files | 0 new errors (same 2 pre-existing baseline files: `WinDisplay.svelte`, `roundInterpreter.test.ts`) |
| `npx tsc -p tsconfig.node.json --noEmit` | clean |
| `npm run build` | clean |

## Scope and locks

`rgsService.ts`, `gameStore.ts`, `games/future_spinner/**` untouched — no lock exception
needed or taken (confirmed via an empty `.claude/settings.json` diff before committing).
The asset pipeline change (`scripts/assets/build.py`, `manifest.json`) is additive only;
every pre-existing export re-renders byte-identical.

## Files changed

New: `frontend/src/lib/components/WinBreakdown.svelte`, `IntroSplash.svelte`,
`frontend/scripts/motion_v2_proof.mjs`, `frontend/public/assets/themes/future-spinner/
symbols/h2_base.png`, `h2_needle.png`, `ui/brand_mark_base.png`, `brand_mark_spin.png`,
`reports/screens/motion-v2/*` (3 GIFs + fps-log.json + occlusion-1280x720.json +
proof-summary.json), `FS_MotionPolish_v2_Prompt.md`.

Edited: `scripts/assets/build.py` (href_ids group-isolation), `scripts/assets/manifest.json`
(2 new layered entries), `frontend/src/lib/components/GameGrid.svelte` (full reel-feel +
symbol-life + particle rewrite), `HudOverlay.svelte` (slam-stop dispatch), `WinBanner.svelte`
(tiered celebrations), `SceneGroup.svelte` (ambient life), `LoadingScreen.svelte` (brand
screen rebuild), `FreeSpinsPresentation.svelte` (Overdrive transition, non-triggered
template-guard fix), `App.svelte` (slam wiring, screen shake, intro splash, gauge/sample
preloads, `overdriveVisualActive` binding), `frontend/src/lib/mock/roundProvider.ts`
(`preloadSamples`), `frontend/src/lib/i18n/translations.ts` (`introContinue` key, 16
locales).
