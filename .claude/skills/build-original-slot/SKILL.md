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
   do not modify the locked originals. Branch the side project off `main` (a CLEAN base), NOT off
   whatever you happen to be on - otherwise the branch silently carries unrelated work. One dedicated
   branch, off main. Beware same-dir Remote Control spawns: a concurrent session shares the working
   tree and can switch branches under you - run one at a time, or use `--spawn=worktree`.
5. **Delegate intricate builds to fresh-context subagents** with detailed specs (see templates
   below), then independently verify. This is how quality holds across a long run without your
   context degrading. Give each agent: the exact files to study, the constraint (no locked files),
   the acceptance test, and "recompute the number, do not trust it". PARALLELISE independent pieces:
   the maths (`games/<name>/`) and the art (`sideproject/<name>/art/`) touch different directories,
   so dispatch both at once and verify each as it lands - it roughly halves wall-clock.
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

**Less is more for the opener.** The first game ships a CLEAN, lean base, not a sprawl of half-baked
features. Complex mechanics are the end game; the opener needs the ARCHITECTURE and the placeholder
hooks, not a full feature zoo. The base template is the container future games start from (this skill
starts from it), so getting the presentation and the mode-menu architecture right - with slots for
buys/add-ons you tweak in and out later - matters more than shipping many features. Do not overdo it
and risk a weak first submission.

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

## D2 - Art (in-house vector; no external image gen). AUTHOR THE FULL KIT IN ONE PASS.

The single biggest lesson from run 1: brief the WHOLE art kit up front, not just symbols, or you
pay for a second run. In ONE art pass author + render all of:
- **Symbols** (10): one self-contained SVG each, 240x240 viewBox, front-facing, NO baked-in text,
  layered `<g>` groups, matching `design-system/masters/*.svg`.
- **UI chrome kit** (the gap that forced run 2): reel frame (`frames/frame-2.png`, transparent
  centre), logo/wordmark (`ui/logo.png` - the only piece with text, drawn as vector paths),
  spin button, bet +/- buttons, autoplay + menu buttons, balance + win panels, feature button,
  meter gauge, tile plate (`symbols/tile_plate.png`), loading brand mark. SIZE each to match the
  equivalent future_spinner asset (read the dimensions off `frontend/public/assets/themes/
  future-spinner/` with PIL) so they are drop-in. Known-good sizes from LUMEN: symbols 240x240,
  frame 800x640 (transparent centre), tile_plate 244x204, logo 600x120, round buttons (spin/bet
  +-/autoplay/menu) 200x200, panel_balance 340x90, panel_win 360x100, feature_button 224x224,
  brand_mark 512x512, glow/meter gauge ~180x480, background 1600x900.
A DARK theme is art-efficient: glowing shapes on near-black pop cheaply (feGaussianBlur halo +
radial hot core); keep ONE shared glow/lighting system for cohesion across symbols AND chrome.
Render to PNG with `scripts/assets/.venv/bin/python` + cairosvg into `public/assets/<name>/`.
- **Audio**: reuse the existing project sound set as placeholder (`cp
  frontend/public/assets/themes/future-spinner/sounds/*.mp3` to the new `.../sounds/`); themed
  audio is a later pass. (No audio-authoring tool exists, so do not try to synthesise it.)

## D3 - Playable frontend (reskin the copy)

`rsync -a --exclude node_modules --exclude dist frontend/ sideproject/<name>/frontend/`; trim the old
`public/assets`; `npm install`. Then, with the FULL art kit from D2 present, do all of this in one pass
(run 1 split it across two - do not):
- **REPOINT the existing default theme** (`config/themes.ts`: name, palette, `assetBase`) at the new
  assets - do NOT add a new theme id, because the feature/meter/scene/buttons/background-stills are
  gated on the literal `'future-spinner'` id string (the #1 frontend trap; the real multi-skin fix is
  to convert those gates to capability flags on the theme config).
- **Repoint every asset path** (symbols, background, frame, logo, panels, buttons, tile plate, gauge,
  brand mark) to the theme `assetBase`. Fix hardcoded `assets/themes/future-spinner/...` paths in
  components (e.g. background stills in App.svelte, btn_max in ControlBar) to `$themeAssets`.
- **Strip the old theme's decorative chrome** that does not fit: gate off the SceneGroup and FlameJets
  mounts in App.svelte (they render on the `future-spinner` id, which is now your theme). Do NOT leave
  a car/flames in a non-racing theme.
- **Relabel all feature/buy text** via i18n from the start: the meter (`overdrive`/`overdriveFreeSpins`
  keys), `buyConfirmTitle/Body/buyFeature`, and the `rules*` strings - and make the rules describe YOUR
  real mechanic + cap, not the inherited one. Swap the gauge art.
- Only add `on:error` graceful-hides for art you genuinely did not make (e.g. a MAX-bet button); with
  the full D2 kit there should be almost none.
- One Svelte gotcha seen: a reactive inline `style` (e.g. a rotating needle) will WIPE an `on:error`
  `display:none` every value change, so a broken img reappears - remove the element, do not just hide it.

### D3a - Unified FEATURES menu + BET MODES info (the base-template mode architecture)

The proven presentation for the bet-mode ladder, grounded in the competitor field (every buy and
add-on sits under ONE entry, not scattered buttons). Build it data-driven so future skins tweak modes
in and out without touching components:

- **One source of truth**: a single config array `src/lib/config/<name>Modes.ts` -
  `{ id, label, kind: 'standing'|'enhancer'|'buy', cost, volatility, blurb }` per mode, ids VERBATIM
  from `games/<name>/game_config.py`. The FEATURES menu, the BET MODES info page, AND the betMode
  store all derive from this one array. Adding/removing a mode = a one-array edit (+ widen the id
  union + add the maths mode); document that recipe in a header comment. This is the placeholder
  architecture: slots for buys/add-ons the owner tweaks later.
- **One entry, one modal** (`FeatureMenu.svelte`): replace the inherited scattered mounts
  (`FeatureButton`, `BuyBonus`, `ModeSelector`, dev `ModeLibrary`) with ONE glowing FEATURES icon
  that opens a modal: a shared bet selector on top, then a scrollable card list. Card behaviour keys
  off `kind`: `standing` shows ACTIVE, `enhancer` is an ON/OFF toggle (`role="switch"`) bound to the
  standing mode, `buy` shows cost + ACTIVATE which dispatches a `buy` event to `handleBuy(id)`.
- **Align the betMode store** to the new maths ids (default = the standing mode); keep the store's
  PUBLIC shape identical (`selectedBetMode`/`standingMode` writables) so the locked `rgsService`
  (which reads `selectedBetMode`) is untouched. DELETE the inherited `ModeSelector.svelte` +
  `ModeLibrary.svelte` (their old ids fail type-check).
- **BET MODES info page** (section in `PaytableModal.svelte`): render EVERY mode uniformly from the
  same array (label, blurb, cost x bet, RTP) plus the shared "all modes same RTP / max win Nx"
  footer - the competitor's info architecture. Correct any inherited cap number to YOUR cap.
- Keep it lean (the opener philosophy): one entry, the four-ish real modes as cards, clean palette.
  Screenshot proof: base (single FEATURES entry, no scattered buttons), menu open (the cards), the
  BET MODES info page, and a working buy that triggers the feature. (LUMEN reference commit: the
  unified menu + `lumenModes.ts` on `claude/lumen-sideproject`.)
VERIFY: `npm run build` + `svelte-check` (ignore the ~6 pre-existing node_modules .d.ts errors) +
Playwright screenshots of BOTH the base game (frame/logo/panels/buttons render, no old scene) and the
feature (buy to trigger; the meter + feature art show). Recompute nothing here - this is visual; the
maths was verified in D1. The deliverable is RUNNABLE for the owner:
`cd sideproject/<name>/frontend && npm run dev` -> the dev server boots into the new theme.

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

## One run, not two (validated across the two LUMEN runs)

Run 1 reached "operational with visual gaps"; run 2 filled them. The ONLY reasons it split were: the
art brief covered symbols but not the UI-chrome kit, and the frontend pass did not strip the old
theme's scene. Both are now folded into D2/D3 above, so this is a SINGLE run: theme -> validated
maths -> full art kit (symbols + chrome + placeholder audio) -> complete reskin (wired + old chrome
stripped + text relabelled) -> review. Do NOT plan a second "polish" run; brief the full kit up front.

## Time budget reality

A complete original game in one focused autonomous run IF you: fork the proven base, reuse the fence
splits, brief the FULL art kit (symbols + chrome + audio) up front, delegate each intricate piece to
a fresh-context agent + independently verify (recompute RTP, view screenshots), strip the old chrome
and relabel text from the start, and know the traps above. The maths is the cheap part now; the
biggest genuine cost is the UI-art kit and (for true multi-skin) decoupling the theme-id gates.

## Definition of done (the lock-in checklist)

- [ ] GDD written (theme choice + mechanic + modes + cap + RTP).
- [ ] Every bet mode INDEPENDENTLY recomputes to the target RTP from the shipped lookUpTable;
      cross-mode spread <=0.5pp; max win = the cap; each mode 100k rows.
- [ ] Any new mechanic proven STATELESS from the books (meter/pot resets each round).
- [ ] Full art kit (symbols + UI chrome + placeholder audio) authored, rendered, and present.
- [ ] Frontend reskinned: theme repointed, all assets render, old chrome (scene/flame) stripped,
      all feature/buy text relabelled to the new game, no broken/hidden art.
- [ ] Bet modes presented under ONE unified FEATURES menu driven by a single `<name>Modes.ts`
      config array (scattered mode/buy buttons removed); BET MODES info page renders all modes
      uniformly; adding a placeholder mode is a one-array edit.
- [ ] `npm run build` + `svelte-check` clean (only the ~6 pre-existing node_modules errors);
      screenshots of base + feature captured and eyeballed.
- [ ] Runs via `cd sideproject/<name>/frontend && npm run dev`.
- [ ] PAR sheet + REVIEW (bottlenecks + opportunities) written.
- [ ] `future_spinner`, `rgsService.ts`, `gameStore.ts` verified UNTOUCHED; work isolated on one
      branch off main.

If every box is ticked, it is one complete run - do NOT schedule a second polish pass.
