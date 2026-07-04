# FUTURE SPINNER: MASTER TEMPLATE (bet-mode + mechanic library)

Studio: We Roll Spinners. Compiled 2026-07-05. Australian English, no em/en dashes.

Purpose: this first game is our reusable template. The maths, symbols and UI are built
once; future games re-skin the art and select which bet modes / bonuses to ship. This
document is the catalogue of everything the maths engine can do within Stake Engine
compliance: every validated bet mode (all at 96.35% RTP), the volatility recipes, the
mechanic options (config vs code), and how to select a subset per game.

Everything here is stateless and holds all modes within 0.5% RTP of each other, per the
Stake rules. All modes independently validated by `scripts/validate_math.py`.

---

## 1. THE VALIDATED BET-MODE LIBRARY

All modes return 96.3500% RTP and share the 5,000x cap. What differs is COST, VOLATILITY
and ENTRY. Generated one at a time so each is independently verified and the others stay
byte-identical. A shipped game picks any subset (the lookup tables are the reusable asset).

### Standing modes (reels spin normally; cost = play multiplier)

| Mode | Cost | Volatility (SD) | Hit rate | Character | Status |
|---|---|---|---|---|---|
| **cruise** | 1.0x | 11.10x (Low) | 43.9% | smooth casual ride, rare feature | BUILT |
| **base** | 1.0x | 17.28x (Med) | 29.1% | the standard game | BUILT |
| **antelite** | 1.25x | 20.31x | — | +25% for ~1.6x trigger (market-centre ante) | BUILT |
| **ante** | 1.5x | 23.26x | — | +50% for ~2x trigger (Double Chance) | BUILT |
| **volatile** | 1.0x | 24.28x (High) | — | swingy: more feature + tail, fewer base wins | BUILT |
| **superante** | 2.0x | 26.41x | — | 2x for ~3x trigger (heavy ante) | BUILT |

### Buy modes (guaranteed feature entry; is_buybonus)

| Mode | Cost | Volatility (SD) | Entry weighting | Status |
|---|---|---|---|---|
| **minibuy** | 80x | 178x | 3-scatter (weak) | BUILT |
| **bonus** (standard) | 100x | 207x | 3/4/5 mixed | BUILT |
| **superbuy** | 300x | 407x | 4/5-scatter (rich) | BUILT |
| **megabuy** | 500x | 633x | 5-scatter (richest) | BUILT |
| **hyperbuy** | 1000x | 969x | 5-scatter (richest) | BUILT |

All 1.0x-cost standing modes sit inside the operator-risk SD band (0.6-60). Eleven modes total,
all validated at 96.3500% RTP by `scripts/validate_math.py`. The full ladder gives a shipped
game a wide menu: pick cruise+base for a mass-market smooth title, add ante rungs for
trigger-chasers, add volatile for a high-variance skin, add any buy tiers where jurisdiction
allows.

---

## 2. VOLATILITY / TRIGGER RECIPES (how each mode is tuned)

Every mode is one RTP number (0.9635) split across optimiser "fences", realised by the Rust
optimiser. The knobs (`game_optimization.py`):
- **Fence RTP split** (`ConstructConditions.rtp` per criteria) - more RTP in the frequent
  base-ways fence = lower volatility; more in the rare feature/wincap = higher.
- **Fence hit-rate** (`hr`) - trigger/hit frequency; `av_win = hr x rtp`.
- **Dresses** (`ConstructScaling`) - boost/suppress specific payout ranges.
- **Mean-to-median band** (`min_m2m`/`max_m2m`) - low = tight/low-variance, high = heavy tail.
- **Fence bias** (`ConstructFenceBias`) - force win mass into a payout band.

Reference splits (fractions of cost, sum to 0.9635):

| Mode | wincap | freegame (hr) | basegame (hr) | m2m band |
|---|---|---|---|---|
| cruise | 0.02 | 0.18 (260) | 0.7635 (2.3) | 2-4 (tight) |
| base | 0.05 | 0.38 (185) | 0.5335 (3.5) | 4-8 |
| antelite | 0.05 | 0.608 (115) | 0.3055 (3.5) | 4-8 |
| ante | 0.05 | 0.76 (92.5) | 0.1535 (3.5) | 4-8 |
| volatile | 0.10 | 0.55 (185) | 0.3135 (3.5) | 6-14 (heavy tail) |
| superante | 0.05 | 0.80 (62) | 0.1135 (3.5) | 4-8 |

Trigger-rate limit: the free-game fence rtp cannot exceed the mode RTP minus the wincap
fence, so a higher trigger multiplier forces smaller average features (av_win = hr x rtp).
That is why superante (3x trigger) has smaller features than ante (2x trigger).

---

## 3. MECHANIC OPTIONS (config vs code)

The above modes all reuse the current ways + Overdrive engine (config-only). Genuinely new
mechanics need game code but the SDK ships the engines. Full catalogue for the template:

### Config-only (call a built-in engine or set config)
- **Win engines** (one call in `game_calculation.py`): ways-to-win (current),
  **paylines** (`src/calculations/lines.py` + a `paylines` dict), **cluster pays**
  (`src/calculations/cluster.py`), **scatter / pay-anywhere** (`src/calculations/scatter.py`).
- **Anticipation**, **per-mode reel strips**, **scatter-trigger weighting**.

### Code (needs game logic; building blocks exist)
- **Multiplier symbols / multiplier wilds** - list a symbol in `special_symbols["multiplier"]`
  + a per-symbol value callback; the ways/cluster/scatter engines read the per-cell multiplier.
- **Tumble / cascade** - built-in `src/calculations/tumble.py`; loop it in the spin.
- **Progressive in-round meter** - the Overdrive meter (already built); the pattern generalises
  (any collect-and-multiply that resolves inside one round).
- **Sticky / expanding wilds** - within a round only (track positions across reveals).
- **Symbol upgrades / morph** - per-symbol create callbacks.

### Not possible (stateless platform rule)
- Jackpots, gamble/double-up, cross-round collection/persistence, continuation, early cashout.
  The Overdrive meter is the compliant "persistence": it resets every round.

Each code mechanic is a distinct build with its own maths regeneration + testing, so it is a
now-or-never-before-approval decision for whichever game ships it. For the TEMPLATE, the
config-only mode library above is the immediately reusable asset; the code mechanics are the
documented roadmap for richer future skins.

---

## 4. THE MAX-WIN CAP: A TEMPLATE-LEVEL DECISION

The cap (currently 5,000x) is a single game-level number shared by all modes; it is NOT
per-mode selectable. It interacts with the buy ladder (see section 5). Market bands:
5,000x (mass-market), 10,000-25,000x (modern high-vol), 50,000x (specialist),
100,000x+ (Nolimit City). Raising it raises every mode's tail (including base). For a
template, the cap is chosen per skin at generation time; a higher-cap variant is a full
regeneration of the whole package.

---

## 5. BUY-LADDER CEILING FINDING

Question: does the 5,000x cap limit how expensive/rich a buy can be? Earlier back-of-envelope
analysis suggested a hard ceiling near ~110x (a dear buy would need too much cap frequency to
average its price, breaching the tail-risk gate). We TESTED it empirically by building buys at
80x / 300x / 500x / 1000x.

Result: the 5,000x cap does NOT limit the buy ladder. Every tier from 80x to 1000x validates
at 96.35% RTP and passes the tail-risk gate:

| Buy | Cost | Avg outcome | SD | P(cap) | tail gate (cost-scaled) |
|---|---|---|---|---|---|
| minibuy | 80x | 77x | 178x | 8.0e-04 | 8.0e-04 (PASS) |
| bonus | 100x | 96x | 207x | 1.0e-03 | 1.0e-03 (PASS) |
| superbuy | 300x | 289x | 407x | 3.0e-03 | 2.4e-03 (PASS) |
| megabuy | 500x | 482x | 633x | 5.0e-03 | 2.5e-03 (PASS) |
| hyperbuy | 1000x | 963x | 969x | 1.0e-02 | 2.0e-03 (PASS) |

Two reasons the ceiling is higher than the naive analysis predicted:
1. The rich (4/5-scatter) feature produces a fat body of large wins BELOW the cap, so a high
   average does not require much mass AT the cap.
2. The Stake tail-risk gate is COST-SCALED: P(>=5000x) x cost_scale <= 1e-2, where cost_scale
   is 0.2 for cost >= 1000x, 0.5 for >= 500x, 0.8 for >= 200x. Dearer buys get proportionally
   more tail headroom, which offsets their higher cap frequency.

Practical ceiling: the binding limit is the platform's cost-multiplier ceiling (~1000x tier-1,
1500x higher tier), not the 5,000x win cap. So a game can ship a full buy menu (e.g. 80 / 100 /
300 / 500 / 1000x) at one identical RTP without raising the cap. This means the max-win cap
(section 4) is a MARKETING / positioning choice (headline max win, and base-mode volatility),
not a buy-ladder constraint. Raising the cap is a full package regeneration and is available
per-skin (change `_WINCAP` in game_config.py), but is NOT required to have a rich buy ladder.

---

## 6. HOW TO USE THE TEMPLATE PER GAME

1. Re-skin art/audio (symbols, background, UI) - the maths package is unchanged.
2. Choose the cap at generation (5,000x default; regenerate for a higher-cap skin).
3. Select the bet-mode subset to ship in `index.json` (the lookup tables already exist).
   Typical selections:
   - Mass-market smooth: cruise + base + bonus.
   - Trigger-chaser: base + antelite + ante + bonus.
   - High-variance: base + volatile + superante + bonus (+ superbuy if cap allows).
4. Wire the shipped subset into the frontend mode selector + buy UI, localise, social-scrub,
   jurisdiction-gate (ante bets and buys are restricted in some markets).
5. Validate with `scripts/validate_math.py` and submit.

Sources: in-repo SDK audit, competitor scan, mirrored `docs/stake-engine-live/`,
`docs/MATH_DESIGN_SPACE.md`.
