# FUTURE SPINNER: MASTER TEMPLATE INDEX

Studio: We Roll Spinners. The single navigation point for the reusable slot template.
Australian English, no em/en dashes. Everything below is stateless and Stake Engine compliant.

The idea: build the maths, UI and art once; future games re-skin the art and SELECT which bet
modes / cap / mechanic to ship. This index says what exists, where it lives, and how to reuse it.

---

## 1. PACKAGES (game maths)

| Package | What it is | Modes | Cap | Status |
|---|---|---|---|---|
| `games/future_spinner` | the shipping game + the full bet-mode LIBRARY | 11 (see below) | 5,000x | LOCKED, validated |
| `games/future_spinner_bigwin` | higher max-win-cap template axis | base/bonus/superbuy | 25,000x | proof, validated |
| `games/future_spinner_multiwild` | multiplier-wilds MECHANIC swap | base/bonus | 5,000x | proof, validated |
| `games/future_spinner_rtp94` | RTP-preset axis (94.00%) | base/bonus | 5,000x | proof, validated |

`future_spinner` is the locked, verified core. The forks are siblings (no lock exception) proving
two template axes (cap, mechanic). SDK sample games `games/0_0_{ways,cluster,lines,scatter,expwilds}`
are the working bases for further mechanic forks.

## 2. THE BET-MODE LIBRARY (in future_spinner, all 96.3500% RTP, 5,000x cap)

Standing: cruise 1.0x (SD 11.1x) / base 1.0x (17.3x) / antelite 1.25x (20.3x) / ante 1.5x (23.3x)
/ volatile 1.0x (24.3x) / superante 2.0x (26.4x).
Buys: minibuy 80x (178x) / bonus 100x (207x) / superbuy 300x (407x) / megabuy 500x (633x) /
hyperbuy 1000x (969x).
This skin SHIPS: cruise, base, ante, bonus, superbuy (see `SHIP_CONFIG.md`).

## 3. DOCS MAP

| Doc | Purpose |
|---|---|
| `docs/MASTER_TEMPLATE.md` | mode library + volatility recipes + code-mechanic catalogue + per-game selection guide |
| `docs/MATH_DESIGN_SPACE.md` | the full menu of modes/mechanics, config vs code, the envelope |
| `docs/MECHANIC_VARIANTS.md` | per-mechanic build recipes anchored to the SDK sample games |
| `docs/SHIP_CONFIG.md` | which subset this first skin ships + the ante-price decision |
| `docs/GAP_ANALYSIS.md` | game vs slot UX conventions + the Stake rubric |
| `games/*/README.md` | per-fork summary + validated numbers |
| `FUTURE_SPINNER_PAR_SHEET.md` | the formal PAR (mode-library table + per-mode stats) |
| `COMPLIANCE_WATCH.md` | living compliance posture + change log |
| `scripts/validate_math.py` | CI-gated independent RTP/SD/tail recompute from the shipped tables |

## 4. FRONTEND (in `frontend/`)

- **ModeSelector.svelte** (production): Cruise/Normal/Double + Buy/Super, drives `standingMode`.
- **ModeLibrary.svelte** (dev-only): exposes all 11 modes for testing.
- **betMode.ts**: the mode library metadata (StandingMode/BuyMode, MODE_COST, STANDING/BUY_MODES)
  + the persisted `standingMode` store; server mode via the sanctioned `selectedBetMode` passthrough.
- Feature presentation, win-tier celebrations, wincap splash, paytable (ways explainer),
  bet replay, 16 locales, social scrub - all reusable across skins.

## 5. HOW TO SPIN UP A NEW SKIN

1. Re-skin art/audio (symbols, background, UI); the maths package is unchanged.
2. Pick the CAP at generation (5,000x default; use the bigwin pattern for higher).
3. SELECT the bet-mode subset in `index.json` (tables already exist) + expose it in the UI.
4. Optionally swap the MECHANIC (fork per `MECHANIC_VARIANTS.md`).
5. Validate (`validate_math.py`) + submit.

## 6. BUILD WORKFLOW (proven this project)

- One mode at a time: `create_books({mode: 100000})` + optimise; other modes stay byte-identical.
- Gotcha: `generate_configs` needs EVERY config mode's RAW table - simulate all first, or trim the
  package's `bet_modes`/`opt_params` to the proof modes (use a `wincaps` defaultdict fallback).
- Volatility knobs (game_optimization): fence RTP split, `ConstructScaling` win-range dresses,
  `min/max_mean_to_median`, `ConstructFenceBias`. Trigger rate = free-game fence `hr`.
- Ways multiplier strategies: `symbol` / `board` / `global` (no combined).
- Env: `make setup` (venv `env/`); runners in the session scratchpad.
- Lock: `games/future_spinner/**` is deny-locked; edits need a sanctioned, restored-before-commit
  exception. Forks (`future_spinner_*`) are NOT locked.

## 7. COMPLIANCE POSTURE (all skins)

Stateless; no jackpot/gamble/continuation; all modes within 0.5% RTP; RTP band 90.0-96.70%;
max payout <=100,000x; cost mult <=~1,000x; original in-house art; no Stake branding; social scrub;
bet replay mandatory. See `COMPLIANCE_WATCH.md`.

## 8. OPEN THREADS

Push/PR the branch; finish tumble + cluster mechanic forks; frontend presentation for the
multiplier-wild mechanic; capture the login-gated submission checklist + tile assets; decide the
final shipped skin. Gaps tracked in `docs/TEMPLATE_GAPS.md`.
