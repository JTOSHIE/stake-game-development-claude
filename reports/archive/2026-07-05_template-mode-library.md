# Session Report: gap analysis + full template bet-mode library

- **Date:** 2026-07-05
- **Model / effort:** Claude Opus 4.8 (1M context), High.
- **Branch:** `claude/gap-analysis` (off `main`; not pushed).
- **Source:** owner: research the field, then "expand maths", then "start with the first 2",
  then "go get everything ... this game is our template ... all the math done ... select what
  we need". Worked autonomously per instruction.

## What was delivered

### 1. Gap analysis + design space (docs)
- `docs/GAP_ANALYSIS.md` - game vs slot UX conventions + Stake rubric. Headline: bet modes and
  maths lock at approval. Answered the paytable "winning lines" question (1,024-ways, no
  paylines) and shipped a ways-explainer clarity fix.
- `docs/MATH_DESIGN_SPACE.md` - full menu of modes/mechanics, config vs code, volatility recipes.

### 2. The full template bet-mode LIBRARY (11 modes, all 96.3500% RTP, 5,000x cap)
This game is a reusable template, so every compliant config-only mode was built and independently
validated (`scripts/validate_math.py`, ALL PASS), each generated on its own so the others stay
byte-identical:

- **Standing modes:** cruise 1.0x (SD 11.10x, hit 43.9%), base 1.0x (17.28x), antelite 1.25x
  (20.31x, ~1.6x trigger), ante 1.5x (23.26x, ~2x trigger), volatile 1.0x (24.28x, high-vol),
  superante 2.0x (26.41x, ~3x trigger).
- **Buy ladder:** minibuy 80x (SD 178x), bonus 100x (207x), superbuy 300x (407x),
  megabuy 500x (633x), hyperbuy 1000x (969x).

Commits: `b26dc7f` (cruise + mini-buy finding), `b560e43` (volatile/antelite/superante +
5-tier buy ladder), plus the earlier ante `8e94995`.

### 3. Key findings (the "make sure the maths is right" payoff)
- **Feature is rich:** the minimum 3-scatter (8-spin) entry has natural median ~80x, so a cheap
  25x hunt buy would nerf the feature. The honest cheapest buy is ~80x (minibuy).
- **Buy-ceiling finding:** the 5,000x cap does NOT limit the buy ladder. Buys are feasible to
  1000x (the platform cost-multiplier ceiling) because the rich feature has a fat sub-cap body
  and the tail-risk gate is cost-scaled. Earlier back-of-envelope analysis (ceiling ~110x) was
  wrong. So the max-win cap is a marketing/positioning choice, not a buy constraint.
- **Volatility is fully tunable at one RTP** via fence RTP split, ConstructScaling win-range
  dresses, mean-to-median band, and fence bias - all config, no game code.

### 4. Master template reference
- `docs/MASTER_TEMPLATE.md` - the mode library, volatility recipes, the code-mechanic catalogue
  (config-only win engines: ways/lines/cluster/scatter; code mechanics: multiplier symbols,
  tumble, sticky wilds, meters, upgrades; not-possible-stateless list), the cap decision, and a
  per-game selection guide. PAR sheet section 1A (mode-library table); game_metadata v1.4.0 lists
  all 11 with a template note; run.py is the canonical 11-mode runner.

## Verification
`validate_math.py` ALL PASS (11 modes at 96.3500%, cross-mode 0.0000%, all tail gates pass).
base/cruise/ante/bonus tables byte-identical across the incremental builds. Lock discipline
followed throughout (deny lifted per build, restored with verified-empty diff before each commit).

## 5. "Go for all" phase: ship config, production UI, cap + mechanic variants

- **Ship decisions + production UI** (`docs/SHIP_CONFIG.md`, commit `bacc0a9`): this skin ships
  5 of 11 modes (cruise/base/ante 1.5x/bonus/superbuy); ante ships at 1.5x. Production
  `ModeSelector` (Cruise/Normal/Double + Buy/Super) replaces the ante toggle; dev Mode Library
  still exposes all 11.
- **Higher-cap variant** (`games/future_spinner_bigwin`, commit `22ab035`): forked package at
  25,000x cap. base/bonus/superbuy all validate at 96.3500%; SD roughly doubles (base 17->36x),
  max win 25,000x. Finding: cap is a marketing choice, not a functional need.
- **Multiplier-wilds mechanic variant** (`games/future_spinner_multiwild`, commit `abdc659`):
  forked package, Wilds carry random multipliers in free spins (ways "symbol" strategy). base +
  bonus validate at 96.3500%. Proves the mechanic-fork approach end to end.
- **Mechanic recipes** (`docs/MECHANIC_VARIANTS.md`): precise, proven recipes for multiplier
  wilds (built), tumble/cascade, cluster pays, paylines, scatter-pays - each anchored to a
  working SDK sample game (0_0_cluster / 0_0_expwilds / 0_0_lines / 0_0_scatter / 0_0_ways +
  the built-in tumble engine). Tumble + cluster documented (not forked; each needs its own
  retune, best as a focused build).

Forks are siblings of the locked future_spinner (no lock exception); the main 5,000x package is
untouched and still validates ALL PASS.

## Still open / next passes (owner to steer)
- **Frontend selector** for the library (standing-mode selector Normal/Cruise/Ante/... + buy-tier
  UI). Cruise + the new modes are not yet UI-selectable; only the ante toggle exists. Iterable,
  non-locked; the shipped skin selects which subset to expose.
- **Which subset this first game ships** (11 modes is a lot for one game's UI; the library stays
  available regardless).
- **Ante price** (keep 1.5x ante, or use antelite 1.25x, or offer both - both are now built).
- **Code-mechanic prototypes** (tumble, multiplier symbols, alternate win engines) - each a
  distinct build with its own maths + validation; documented as recipes, not yet built.
- **Max-win cap** - keep 5,000x or raise for a bigger headline (per-skin regen; not needed for buys).
- Not pushed (holding per prior owner preference re PR-orphaning).

## FOR THE NEXT SESSION
- **Model/effort:** Opus 4.8 (1M), High. **Approach:** research-first, then surgical one-mode-at-
  a-time maths generation preserving verified modes; empirical feasibility testing (buy ceiling).
- **Alternatives rejected:** full-package rebuilds (would change verified tables + replay IDs) -
  used per-mode generation instead. A cheap 25x mini buy - rejected (nerfs the feature). Building a
  parallel higher-cap package - deferred (per-skin choice, not needed for buys).
- **Files touched (maths):** game_config.py, game_optimization.py, run.py, PAR sheet,
  game_metadata.json, index.json, 8 new lookUpTable_*_0.csv. **Docs:** MASTER_TEMPLATE.md,
  MATH_DESIGN_SPACE.md, GAP_ANALYSIS.md, COMPLIANCE_WATCH.md, validate_math.py.
- **Open threads:** frontend selector; shipped subset; ante price; code-mechanic prototypes; cap;
  push/PR the branch.
