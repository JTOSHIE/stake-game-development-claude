---
name: build-original-slot
description: >-
  Use when building an original online slot game / slot machine from scratch on the Stake Engine
  math-sdk in this repo - theme, validated maths, in-house art, and a playable frontend. Also use
  for adding a new bet mode, a new feature mechanic, a higher max-win cap, or an RTP preset to an
  existing game. Codifies the end-to-end workflow, the proven patterns, and the traps to avoid.
---

# Build an original slot game (playbook)

Distilled from building LUMEN (a full original game: theme -> validated maths -> art -> playable
frontend) end to end. Follow the phases in order. The golden rules and the fast-path shortcuts are
what make a second run hours faster than the first.

## Golden rules (do not skip)

1. **Independently verify every maths number.** NEVER trust a build agent's reported RTP. Recompute
   from the SHIPPED lookup table yourself: `RTP = sum(weight*payout)/sum(weight)/100/cost`. Also
   check SD, max-win, row count, and cross-mode spread (<=0.5pp).
2. **Wait for the optimiser to finish before recomputing.** A `lookUpTable_<mode>_0.csv` read
   mid-optimisation gives nonsense (raw/unweighted -> e.g. 17,000% RTP). Only trust it after the run
   signals DONE.
3. **Prove statelessness from the books**, not the code alone: decompress `books_<mode>.jsonl.zst`
   and confirm the meter/pot starts fresh each round (one payout/round; meter=1 at round start).
4. **Isolate a side project completely.** New game -> a NEW sibling package `games/<name>/` (never
   edit `games/future_spinner/**`, `rgsService.ts`, `gameStore.ts` - deny-locked). Copy/adapt freely;
   do not modify the locked originals. Work on a dedicated branch.
5. **Delegate intricate builds to fresh-context subagents** with detailed specs (see templates
   below), then independently verify. This is how quality holds across a long run without your
   context degrading. Give each agent: the exact files to study, the constraint (no locked files),
   the acceptance test, and "recompute the number, do not trust it".
6. **Plan destination points up front** (D0-D4 below) so the autonomous run has a spine and a
   must-reach fallback.

## Environment

- Python venv: `make setup` creates `env/`; run `./env/bin/python`. Pipeline: create_books ->
  generate_configs -> OptimizationExecution (Rust PigFarm). Runners live in the session scratchpad
  (copy `run_modes.py`, point `_GAME_DIR` at the new game).
- Frontend: Svelte 5 + Vite 7 + PixiJS 7 in `frontend/`. Art pipeline: SVG masters -> PNG via
  `scripts/assets` (CairoSVG in `scripts/assets/.venv`).

## D0 - Design (yours to decide)

Shortlist 3-4 themes; pick the one whose CORE IDEA maps onto a mechanic (theme-mechanic fusion beats
a bolt-on). Decide: grid (5x4/1024-ways is the fast, proven base), RTP (90.0-96.70% band; 96.35% is
the safe default), max win (5,000x mass-market; up to 100,000x allowed - higher caps validate fine),
volatility, the signature mechanic, and a TIGHT bet-mode ladder (base + an ante/double-chance + 1-2
buy tiers; not a sprawling menu). Write a GDD. Compliance envelope: stateless (no jackpot/gamble/
continuation/cross-round state), all modes within 0.5% RTP, original IP, no Stake branding.

## D1 - Validated maths (the must-reach). FAST PATH:

1. **Fork the proven base**: `cp -r games/future_spinner games/<name>; rm -rf games/<name>/library;
   mkdir games/<name>/library; rm -f games/<name>/{FUTURE_SPINNER_PAR_SHEET,SDK_PATTERN_ANALYSIS}.md`.
   In `game_config.py` set `game_id`, `game_name`, `_WINCAP`. Keep the symbol IDs (H1..L3/W/S) and
   reels - the THEME is presentation only, so the maths is unchanged by the art.
2. **Bet modes**: the future_spinner fence splits transfer cleanly. Reuse them, retargeting every
   wincap fence `av_win`/`search` to the new cap:
   - base/standing = `base` fences; ante/double-chance (~2x trigger) = `ante` fences (hr halved);
     buy = `bonus` fences; rich super-buy = `superbuy` fences. Each mode's opt_params fence `rtp`
     values MUST sum to the target RTP (verify_optimization_input enforces it).
3. **A new mechanic** (if any) = the proven pattern:
   - Per-symbol value/multiplier: `assign_special_sym_function` returns `{"<SYM>": [callback]}`; the
     callback does `symbol.assign_attribute({...})` in free spins only (see multiwild/expwilds).
   - In-round accumulator (progressive meter or a collect pot): a field on gamestate, set in
     `reset_book` (this makes it stateless), updated in `run_freespin`, applied via
     `multiplier_strategy="global"` (meter) or paid at `end_freespin` (pot). NOTE the ways engine
     supports `symbol`/`board`/`global` - there is NO `combined`; to stack a symbol mult with a meter
     you feed both into ONE global meter (the LUMEN dual-fed GLOW pattern: meter += orbs + win_bonus).
4. **Generate + validate**: simulate ALL modes first, then optimise (generate_configs needs every
   mode's RAW table; else trim `bet_modes`/`opt_params` and make `wincaps` a defaultdict to the cap).
   `./env/bin/python <runner> mode1,mode2,...`. Then INDEPENDENTLY recompute RTP per mode. Fix fences
   only if a mode misses; the base splits usually converge first try.

## D2 - Art (in-house vector; no external image gen)

Author one self-contained SVG per symbol (240x240 viewBox, front-facing, NO baked-in text, layered
`<g>` groups) matching `design-system/masters/*.svg`. A DARK theme is art-efficient: glowing shapes
on near-black read well and pop cheaply (feGaussianBlur halo + radial hot core). Keep one shared
glow/lighting system for cohesion. Render to PNG with `scripts/assets/.venv/bin/python` + cairosvg
(240px symbols, large bg) into the frontend's `public/assets/<name>/`. Also make: reel frame, logo/
brand mark, feature-button, tile-plate, meter gauge (the UI kit - the first run's biggest art gap).

## D3 - Playable frontend (reskin the copy)

`rsync -a --exclude node_modules --exclude dist frontend/ sideproject/<name>/frontend/`; trim the old
`public/assets`; `npm install`. **REPOINT the existing default theme** (`config/themes.ts`: name,
palette, `assetBase`) at the new assets - do NOT add a new theme id, because the feature/meter/scene/
buttons are gated on the literal `'future-spinner'` id string (the #1 frontend trap; the real fix for
true multi-skin is to convert those gates to capability flags on the theme config). Relabel the meter
(i18n `overdrive` key) and swap the gauge art. Add `on:error` hides for any UI art you have not made
yet. `npm run build` + `svelte-check` (ignore the ~6 pre-existing node_modules .d.ts errors) + a
Playwright screenshot (dismiss the intro, buy to trigger the feature) to prove it plays.

## D4 - PAR sheet + review

Write the PAR (grid/RTP/cap/mechanic + the per-mode validated table). Write a REVIEW listing the
bottlenecks hit and the opportunities - this is what compounds across builds.

## Subagent spec template (copy, fill, dispatch)

> Build X at `games/<name>/` (or `sideproject/<name>/...`). Do NOT edit `games/future_spinner/**`,
> `rgsService.ts`, `gameStore.ts`. Study these working references first: [exact files]. Reuse their
> patterns. Implement [precise change]. ACCEPTANCE: [independent check - recompute RTP from the
> shipped table / build + screenshot]; if it will not converge, STOP and report the numbers, do not
> ship a wrong value. Do NOT commit; leave for review. Report exact files changed + the verified
> numbers + any bottleneck.

## Reusable mechanic library (all proven + validated in this repo)

- Progressive multiplier meter (Overdrive) - `games/future_spinner/gamestate.py`.
- Collection pot paid at bonus end - `games/future_spinner_collect/`.
- Multiplier wilds (symbol strategy) - `games/future_spinner_multiwild/`.
- Dual-fed meter (progressive + collection into one meter) - `games/lumen/`.
- Higher cap - `games/future_spinner_bigwin/` (25,000x). RTP preset - `games/future_spinner_rtp94/`.
- Recipes for tumble/cluster/lines/scatter (SDK samples `games/0_0_*`) - `docs/MECHANIC_VARIANTS.md`.

## Time budget reality (from the first run)

A full original game (theme -> validated 4-mode maths -> 12 art masters -> playable reskin) is
reachable in one focused autonomous run IF you fork the proven base, reuse the fence splits, delegate
+ verify, and know the traps above. The maths is the cheap part now; the frontend UI-art kit and the
theme-id decoupling are the real remaining costs.
