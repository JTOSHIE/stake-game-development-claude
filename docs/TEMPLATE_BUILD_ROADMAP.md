# FUTURE SPINNER: TEMPLATE BUILD ROADMAP

Executable specs for the ranked gap items (`docs/TEMPLATE_GAPS.md`). Each item: scope, design,
files, approach, acceptance, cost, dependencies. Australian English, no em/en dashes. The point
is to make every item ready to pick up and build, and to note what is drawn in already.

Legend: BUILT / IN PROGRESS / SPEC. Cost: CONFIG / CODE(fe|game) / ART / OWNER.

---

## 1. Provably-fair readiness (CODE-fe, LOW) - IN PROGRESS

- **Done:** `docs/PF_READINESS.md` (the invariant + why our books model is ~80% PF-ready).
- **This pass:** a round-reconstruction DETERMINISM TEST - `frontend/src/lib/services/
  roundInterpreter.determinism.test.ts` asserting `scriptFromEvents(book.events)` is identical
  across repeated runs for fixed sample books, with no wall-clock/RNG dependence. Locks invariant
  2 into CI.
- **Acceptance:** test passes; running it twice yields byte-identical scripts.
- **Later:** reserve a per-round id field to carry a seed/nonce when Stake exposes a PF API.

## 2. Frontend presentation for non-ways mechanics (CODE-fe, MED) - BUILT (core)

DONE: `CellModifier.svelte` overlay + `roundInterpreter.ts` per-cell extractors
(`collectCellMultipliers`) + `cellMultipliers` store + `GameGrid.svelte` overlay layer (publishes
cell geometry, mounts a badge per modified cell, clears on new spin) + a demo round. Verified:
exact-total 59/59, PF determinism PASS, build clean; screenshot proof
`reports/screens/mechanics/multiwild_badge.png` (x5/x3 badges on winning wilds). tumble/cluster
reuse the same overlay. FOLLOW-UP: the in-feature (FreeSpinsPresentation) badge + a collect-pot
meter display. Original spec below.



The multiplier-wilds maths (`future_spinner_multiwild`) has no wild-multiplier display; same for
future tumble/cluster forks. Turning proven maths into shippable games depends on this.

- **Design:** the interpreter already maps book events to a presentation script. Extend the
  event->script mapping with mechanic-specific event kinds and add presentation components:
  - Multiplier wilds: read the per-win `symbolMult` / wild `multiplier` from `winInfo` meta;
    render a multiplier badge on the wild cell + fold it into the win count-up.
  - Tumble: a cascade animation (explode winning symbols, drop/refill) driven by tumble events.
  - Cluster: highlight the connected group; a cluster-size win readout.
- **Files:** `roundInterpreter.ts` (event mapping, per fork), new `MultiplierBadge.svelte` /
  `CascadeLayer.svelte`, `GameGrid.svelte` hooks, win-display components.
- **Approach:** keep the presentation MECHANIC-AGNOSTIC where possible (a generic
  "per-cell modifier" overlay) so each new mechanic adds data, not a bespoke pipeline. This
  directly addresses the "ways-only frontend assumptions" pitfall.
- **Acceptance:** the multiwild fork plays end to end with visible wild multipliers; headless
  screenshot proof.
- **Dependency:** the mechanic maths fork (multiwild done; tumble/cluster per `MECHANIC_VARIANTS.md`).

## 3. Telemetry / analytics event taxonomy (CODE-fe, LOW-MED) - IN PROGRESS

Define the event schema ONCE at fine grain; emit alongside book events. Unusable if bolted on per
game later.

- **This pass:** `docs/TELEMETRY_TAXONOMY.md` (the schema) + `frontend/src/lib/services/
  telemetry.ts` (a minimal, side-effect-free emitter with a pluggable sink; dev sink = console/
  buffer). Events: `session_start`, `spin` (mode, bet, cost), `win` (amount, multiple, tier),
  `feature_trigger` (scatters, spins), `feature_complete` (total), `buy` (tier, cost),
  `mode_change`, `wincap`, `error`. Every event carries {ts, mode, betMicros, currency, social}.
- **Acceptance:** emitter typechecks; a spin path emits `spin`+`win` with the right shape; sink is
  swappable (no vendor lock).
- **Later:** wire a production sink (owner picks the analytics vendor); add funnel/retention events.

## 4. Responsible-gambling / compliance module (CODE-fe, MED) - BUILT (branch claude/compliance-rg)

DONE: autoplay stop-conditions (stop on win / single-win limit / feature / loss limit) on the
live HudOverlay + App loop; minimum spin interval (rgSpinDelay); autoplay ban where flagged;
session tracking + SessionPanel (time/spins/net); reality-check modal; all jurisdiction-flag
driven and off by default. Tested 12/12 (`responsibleGambling.test.ts`); proof in
`reports/screens/compliance/`. Documented in `docs/RG_COMPLIANCE.md`. Original spec below.



Jurisdiction-flag-driven, not per-game. Needed the moment we target a regulated market.

- **Scope:** (a) Autoplay with STOP CONDITIONS - number of spins, stop on any win, stop if single
  win >= X, stop on feature, loss limit, balance-decrease limit (currently count-only). (b) A
  minimum spin interval (UKGC 2.5s) + no unattended autoplay where flagged. (c) Session panel -
  time played + net win/loss, reality-check reminders at intervals. (d) RG info links.
- **Files:** `stores/responsibleGambling.ts` (limits + timers), extend `ControlBar.svelte`
  autoplay menu, a `SessionPanel.svelte`, jurisdiction flags in `stores/jurisdiction.ts`.
- **Approach:** all gated by jurisdiction flags from the RGS authenticate response; off by default
  so the crypto/Stake model is unaffected, on where a market requires it.
- **Acceptance:** autoplay honours each stop condition; a jurisdiction flag enforces the 2.5s
  minimum spin + disables turbo where required.
- **Dependency:** jurisdiction flags (partly present via `disabledBuyFeature`).

## 5. Stateless feature-primitives library (CODE-game + ART, MED) - STARTED (collection meter BUILT)

DONE: `games/future_spinner_collect` - a collection-meter primitive (in-round coin pot paid at
bonus end, resets each round). Independently verified 96.3500% RTP both modes, statelessness proven
from the books (one payout/round, payout == sum of coins). REMAINING primitives: symbol-upgrade
ladder, nudge-wild (same fork pattern + retune). Original spec below.

Reusable, config-parameterised feature modules that resolve inside ONE round (like the Overdrive
meter). The current signature mechanics.

- **Collection meter:** collect coin/value symbols during the feature; pay the pot at bonus end.
  Implement as an in-round accumulator on gamestate (like `global_multiplier`), emitted via events;
  resets each round. Fork per `MECHANIC_VARIANTS.md`.
- **Symbol-upgrade ladder:** low symbols upgrade to high within the round (a per-symbol callback +
  a board transform step in `run_freespin`).
- **Nudge-wild:** a wild nudges across its reel, +1 multiplier per step, within the spin.
- **Files (per primitive):** a fork `future_spinner_<primitive>`; `gamestate.py` accumulator/loop,
  `game_calculation.py` evaluation, `game_config.py` params, then maths retune + validate.
- **Acceptance:** each primitive validates at target RTP; resets each round (stateless proof).
- **Note:** EXCLUDE progressive jackpots / hold-and-win with a persistent pot / gamble - not stateless.

## 6. Localisation infrastructure (CODE-fe, LOW) - PARTIAL

- **Done:** 16 locales, social scrub, a shared `t()`/`tr` layer; text-free SVG art (dodges the
  worst i18n trap). New library-mode strings fall back to English.
- **Gap:** locale-aware NUMBER/CURRENCY formatting via `Intl.NumberFormat` everywhere money/counts
  render (some places use fixed formatting); a lint check that no user string is hardcoded outside
  the i18n layer; complete the new-mode strings across all 16 locales (currently English fallback).
- **Files:** `utils/currency.ts` (Intl formatting), a small i18n-coverage check script.
- **Acceptance:** money/counts format per locale; grep finds no stray hardcoded UI strings.

## 7. Mutable-board grid capability (CODE-game, MED) - SPEC

Let board dimensions change WITHIN a round to unlock expanding grids and own-brand variable-height
ways. Fixed grids (5x3/6x4/5x5) are already config-only (change `num_rows`/reels/paytable).

- **Design:** treat board dimensions as mutable per reveal rather than fixed at round start;
  recount ways each reveal (variable-height) or grow the grid on a trigger (expanding). The cluster
  engine already gave us flood-fill + gravity refill, so part of the machinery exists.
- **Naming:** do NOT use "Megaways" (trademarked/patented, BTG/Evolution). Ship an own-brand
  variable-ways name (e.g. "OverdriveWays").
- **Files:** a fork; `game_config.py` variable `num_rows`, `game_calculation.py` per-reveal ways
  recount, `gamestate.py` grow-on-trigger; frontend grid must render a changing shape.
- **Acceptance:** ways recount per spin; validates at target RTP; frontend renders the mutable board.
- **Cost:** the biggest maths + frontend axis; lowest urgency for a strong debut.

---

## First-game pitfalls (design guardrails, applied across the above)

- **Do not over-couple the UI** - prefer isolation/inheritance over max component reuse so a skin's
  bespoke animation does not force a catalogue-wide retest. (Frame mechanic frontends as additive
  overlays, item 2.)
- **No hardcoded geometry** - grid size / symbol count stay config-driven (item 7 depends on this).
- **No money logic in the UI** - currency/bet stays below the game; we enforce integer micros.
- **Deterministic replays** - keep rounds reconstructable (item 1 / PF).
- **Theme behind tokens** - art/colour/audio swap without touching logic (the re-skin promise).
- **Frontend not ways-only** - generic per-cell modifier overlay (item 2) so new engines are data,
  not new pipelines.

## Suggested execution order

1 (finish PF test) -> 3 (telemetry, near-free now) -> 2 (multiwild frontend: makes a 2nd real game)
-> 4 (RG module: unlocks regulated markets) -> 6 (i18n formatting) -> 5 (feature primitives) ->
7 (mutable grids). Items 1/3/6 are cheap-now/expensive-later; do them while the architecture is young.
