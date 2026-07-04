# FUTURE SPINNER: MATH DESIGN SPACE

Studio: We Roll Spinners. Compiled 2026-07-05. Australian English, no em/en dashes.

Purpose: map the full space of bet modes and mechanics we can build, so we lock the
foundation right and then add modes incrementally with confidence. This is an
exploration/reference, not an implementation. Bet modes and maths cannot change after
Stake approval, so the menu we ship is the menu forever; this doc exists to make that
one-shot decision deliberate.

Grounded in two research passes (2026-07-05): an audit of the math-sdk framework's real
capabilities (what is config-only vs needs game code) and a scan of how competitor studios
structure multi-mode maths (Pragmatic, Nolimit City, Hacksaw, Push, ELK, Relax, Print) with
cited per-mode costs, RTP and volatility. Cross-checked against our mirrored Stake docs in
`docs/stake-engine-live/`.

---

## 0. THE ENVELOPE (hard limits we build inside)

Platform (Stake Engine, from our mirrored approval docs + SDK docs):
- **Stateless.** Every round independent. No jackpots, gamble, continuation, early cashout,
  or cross-round state. This is a hard rule and rules out whole categories (see section 4).
- **RTP band 90.0% to 96.70%.** We sit at 96.35% (0.35% headroom).
- **All modes within 0.5% RTP of each other.** This is the single most important constraint
  for a multi-mode menu: every mode we add must return the same RTP (we use 96.3500% for all).
- **Max payout up to 100,000x; cost multiplier up to ~1,000x (tier 1) / 1,500x (higher tier).**
- **Max win is a SHARED hard cap across all modes** (universal market convention and how our
  engine treats it, though `BetMode.max_win` is technically per-mode). Raising the cap raises
  it for base too.
- Docs-watch: the 0.5% rule and the 100,000x/1,500x ceilings are from our mirrored docs; the
  live approval SPA did not render for direct re-fetch this pass. Re-confirm on next docs refresh.

Framework (math-sdk, audited in-repo):
- **No limit on the number of bet modes.** `self.bet_modes` is a plain list; every consumer
  iterates it. Mode names are free-form. (`src/config/betmode.py`, `src/config/config.py`.)
- **Everything about a mode is per-mode:** cost, rtp, max_win, is_feature, is_buybonus, its own
  distributions/criteria/quotas, its own reel strips, and its own optimiser fences.
- **Volatility is fully controllable in config** via the optimiser (see section 3). Two modes
  can share one RTP and differ entirely in volatility.
- **The optimiser hits an exact target RTP** by allocating the mode RTP across "fences" whose
  rtp values must sum to the mode RTP (`verify_optimization_input` enforces the sum), then the
  Rust PigFarm re-weights the simulated lookup table to realise each fence.

---

## 1. BUILD-COST AXIS: config vs code

The cheapest, lowest-risk additions reuse our existing mechanics (1,024 ways + Overdrive free
spins). Those are **config-only** (`game_config.py` + `game_optimization.py`, then re-run sims).
New mechanics need **game code** (`gamestate.py` / `game_executables/game_calculation.py`).

| Addition | Build cost |
|---|---|
| Extra bet modes reusing ways + Overdrive (ante variants, buy tiers, low/high-vol modes) | CONFIG only |
| Different reel strip per mode | CONFIG only |
| Distinct volatility profile per mode at the same RTP | CONFIG only |
| A different win engine (paylines, cluster, scatter-pay) | CODE-light (engines exist in `src/calculations/`, call from game_calculation) |
| Multiplier symbols / multiplier wilds | CODE (list in `special_symbols["multiplier"]` + a per-symbol value callback) |
| Tumble / cascade | CODE-light (built-in `Tumble` engine, loop it in the spin) |
| Progressive in-round multiplier (Overdrive is one) | CODE (already built for us) |
| Sticky / expanding wilds within a round | CODE (in-round only) |
| Symbol upgrades / morph | CODE |
| Jackpots, gamble, cross-round stickies, continuation | NOT POSSIBLE (stateless) |

Implication: we can build a rich multi-mode MENU now with zero new mechanics (all config). New
MECHANICS are a separate, later decision and the bigger lift; the SDK already ships the engines.

---

## 2. THE BET-MODE MENU (what we can offer, with market precedent)

All modes below return 96.3500% RTP and share the 5,000x cap (unless we revisit the cap,
section 5). What differs between modes is COST, VOLATILITY, and ENTRY QUALITY (how the feature
is entered), never the RTP or the cap. That is exactly the compliant model ELK uses (Pirots X:
every buy tier and base at one identical RTP), as opposed to the Relax/Print model (buy raises
RTP by 1 to 2 points) which would breach our 0.5% rule.

| Mode | Cost | Volatility | What it is | Status | Market precedent |
|---|---|---|---|---|---|
| **base** | 1.0x | Med-High (SD 17.3x) | Standard play; feature ~1 in 185 | BUILT | universal |
| **ante / Double-Chance** | 1.5x | High (SD 23.3x) | ~2x trigger (1 in 92); reels spin normally | BUILT | Pragmatic ante +25%, NLC xBet +25%, Push Bet; +50% matches Pragmatic Super Scatter mid ante |
| **low-vol / "Cruise"** | 1.0x | Low (SD 11.1x, hit 43.9%) | Same RTP, more frequent smaller wins, rarer feature | BUILT | white space: rare in-market (Evoplay difficulty modes); a genuine differentiator |
| **mini / hunt buy** | see finding | High | Cheap guaranteed feature entry | NOT A CLEAN FIT (see below) | Hacksaw BonusHunt 3x, ELK Bonus Hunt 3x |
| **standard buy** | 100x | High (SD 206x) | Guaranteed feature entry | BUILT (bonus) | the single most common buy price; real Stake titles (Madame Mystique, Cursed Seas T1) |
| **super buy** | ~300-500x | Very High | Enhanced entry (guaranteed 4-5 scatters or higher starting Overdrive meter) | OPTION | ELK Super Bonus 500x, Pragmatic Super FS 500x, Hacksaw Epic/Super Core |

**Mini-buy finding (measured 2026-07-05):** our Overdrive feature is rich. Even the minimum
3-scatter (8 free spins) entry has a natural median of ~80x and a mean well above 100x (the tail
runs to the 5,000x cap). The 100x standard buy is therefore ALREADY at the cheap end for this
feature (the optimiser already suppresses the natural richness to hit 96.35% at 100x). A cheaper
"mini/hunt buy" (25x, or even 60x) would hit 96.35% RTP only by systematically nerfing the
feature below a natural trigger, which is a poor product. For this feature the room is UPWARD
(a super buy at a richer entry), not downward. A genuine cheap hunt buy would require a separate
WEAKER mini-feature (fewer free spins) = game code, not config. Conclusion: the mini buy was not
shipped; the buy ladder should grow up (super buy) rather than down.

Key design facts from the market scan:
- **Ante and buys do NOT stack** (mechanically meaningless; unseen in market). They are
  alternative entries, not combinable. Our UI already treats them as separate.
- **Buy tiers differ by ENTRY, not RTP or cap.** A mini buy guarantees the minimum (3-scatter)
  trigger weighted low; a super buy guarantees a rich entry (4-5 scatters or a higher starting
  meter). All return 96.35% of their (larger) cost, so the absolute average payout scales with
  price while RTP stays flat. Higher-entry tiers are naturally higher-volatility.
- **Ante price:** market norm is +25% (1.25x). Ours is +50% (1.5x), which reads as a heavier
  "double chance" premium (defensible, matches Pragmatic Super Scatter's mid ante). Decision
  point: keep 1.5x, drop to the dead-centre 1.25x, or offer both as two ante rungs.
- **UK and some jurisdictions ban bonus buys**; ante is the sanctioned alternative. Any buy
  tier must be jurisdiction-gated (we already gate the 100x via `disabledBuyFeature`).

---

## 3. VOLATILITY RECIPES (how we "make the math math" per mode)

Volatility is shaped in `game_optimization.py` and realised by the Rust optimiser. The knobs:
- **Fence RTP split** (`ConstructConditions.rtp` per criteria) — how much of the mode RTP sits
  in frequent base-ways wins vs the rare free-game/wincap fences. More RTP in base ways = lower
  felt volatility.
- **Fence hit-rate** (`hr`) — spins between hits for that fence; sets trigger/hit frequency.
  `av_win = hr x rtp`.
- **Dresses** (`ConstructScaling`: win_range + scale_factor + probability) — boost small-win
  ranges, suppress big-win ranges (or vice versa) to fine-tune the shape.
- **Mean-to-median band** (`min_m2m`/`max_m2m`) — bounds distribution skew. Low band (2-3) =
  tight, low variance. High band (8-12) = heavy tail, high variance.
- **Fence bias** (`ConstructFenceBias`) — force win mass into a target payout band.
- **Reel strips / scatter_triggers** — a flatter strip or lower scatter weighting reduces variance.

Concrete recipes, all at 96.35% RTP:

- **Low-vol "Cruise" (cost 1.0x, target SD ~8-10x):** shift fence RTP toward a frequent
  `basegame` fence (e.g. basegame 0.78, freegame 0.135, wincap 0.05), lower basegame `hr`
  (more frequent small wins), set `max_m2m` low (2-3), dresses `scale_factor > 1` on 1-5x and
  suppress 100x+; bias basegame into 1-5x. Feature becomes rarer but the ride is smooth.
- **Base (cost 1.0x, SD 17.3x):** current split (basegame 0.5335, freegame 0.38 hr 185,
  wincap 0.05). BUILT.
- **Ante (cost 1.5x, SD 23.3x):** freegame 0.76 at hr 92.5 (2x trigger), basegame 0.1535,
  wincap 0.05. BUILT.
- **Super buy (cost ~400x, Very High):** almost all RTP in the free-game fence with a rich
  entry (scatter_triggers weighted to 4/5), high `max_m2m`, dresses boosting 100x-4000x.

The point: every mode is one RTP number spread differently across fences. We already have a
CI-gated validator (`scripts/validate_math.py`) that recomputes RTP, hit rate, SD, wincap odds
and tail probability from the shipped tables and gates on the Stake rubric, so each new mode is
independently checkable the moment it is generated.

---

## 4. MECHANICS CATALOGUE (for future depth, mostly a later/bigger decision)

Config-switchable win engines (exist in `src/calculations/`, one call from game_calculation):
- **Ways-to-win** (current), **paylines**, **cluster pays**, **scatter / pay-anywhere**.

Code mechanics (need game logic; the SDK provides building blocks):
- **Multiplier symbols / multiplier wilds** — collectable or per-cell multipliers.
- **Tumble / cascade** — built-in `Tumble` engine; loop it for consecutive wins.
- **Progressive in-round meter** — the Overdrive meter (already built); the pattern generalises
  (e.g. a collection meter that resolves inside the round).
- **Sticky / expanding wilds** within a bonus round (in-round only, cannot persist across rounds).
- **Symbol upgrades / morph.**

Not possible (stateless): jackpots, gamble/double-up, cross-round collection or persistence,
continuation. Our Overdrive meter is the compliant way to get "persistence" because it resets
each round.

A second interacting free-spins mechanic (e.g. sticky wilds that feed the Overdrive meter, or a
symbol-upgrade step) is the highest-impact way to deepen the game and lift the star rating, but
it is a maths + game-code change, so it is also a now-or-never-before-approval decision.

---

## 5. THE MAX-WIN CEILING DECISION

Our cap is 5,000x, shared across all modes. Market read:
- 5,000x = classic Pragmatic mass-market band (Gates of Olympus, Big Bass). Conservative by
  2025-26 specialist standards.
- 10,000x-25,000x = modern high-volatility mainstream (Sugar Rush 1000 at 25,000x).
- 50,000x = premium specialist (Hacksaw Itero, Push Razor Shark).
- 100,000x-300,000x = almost exclusively Nolimit City.

Because the cap is shared, raising it makes base a higher-ceiling (higher-volatility) game too.
Options: keep 5,000x (smooth, mass-market, aligns with a low-vol strategy) or raise to
10,000x-25,000x (bigger chase, higher variance, more competitive with specialist titles). This
interacts with the low-vol direction: if the strategy is "smoother, more bet options", 5,000x
fits; if it is "big-win chaser", raise the cap. Cannot be changed after approval.

---

## 6. RECOMMENDED FOUNDATION + PHASED ROADMAP

A competitive, compliant, premium menu that is almost entirely config (no new mechanics):

**Foundation (ship this submission, all config, all 96.35%, all 5,000x cap):**
1. base 1.0x (built)
2. ante / Double-Chance 1.5x (built) — decide 1.25x vs 1.5x, or two ante rungs
3. low-vol "Cruise" 1.0x — the differentiator the owner flagged ("reducing volatility")
4. mini / hunt buy ~25x
5. standard buy 100x (built)
6. super buy ~400x

That is a 6-mode ladder (one enhancer toggle + a 3-tier buy menu + a low-vol option), matching
the ELK X-iter "clean packaged ladder" best-in-class pattern, all at identical RTP.

**Phase order (each independently generated + validated, base/bonus preserved):**
- P1 (done): base, ante, standard buy.
- P2: low-vol "Cruise" mode (config; the flagged priority).
- P3: mini buy + super buy tiers (config; entry-weighted, same RTP/cap).
- P4 (optional, bigger): a second interacting free-spins mechanic (multiplier symbols or sticky
  wilds feeding the meter) - maths + code; only if we want more depth before locking.
- P5 (optional): revisit the 5,000x cap.

**Decisions needed before we start building (all lock at approval):**
- D1: ante price - 1.25x (market centre) vs keep 1.5x vs two ante rungs.
- D2: low-vol "Cruise" mode - yes/no (recommended yes; it is white space and config-only).
- D3: buy ladder - just 100x, or add mini (~25x) and/or super (~400x).
- D4: a second free-spins mechanic this submission - yes/no (the only item needing game code).
- D5: max-win ceiling - keep 5,000x or raise.
- D6: RTP parity model - confirm identical 96.35% across every mode (recommended; ELK pattern).

**Do NOT build:** ante stacked on a buy (meaningless), any per-mode RTP uplift beyond 0.5%
(breaches the rule; the Relax/Print model), ELK-style "betting strategies" (autoplay scaling,
not a maths mode), and anything stateful.

---

## 7. HOW EACH MODE GETS BUILT + VERIFIED (proven this session)

The ante mode proved the surgical workflow that preserves already-verified modes:
1. Add the `BetMode` in `game_config.py` (cost, reuse or new conditions) + opt_params fences in
   `game_optimization.py` (fences sum to 0.9635).
2. Generate that mode ONLY (`create_books({"<mode>": 100000})` + optimise that mode) so existing
   modes' books, tables and replay event IDs stay byte-identical.
3. The pipeline publishes the weighted `lookUpTable_<mode>_0.csv`, book, and updated `index.json`.
4. `scripts/validate_math.py` recomputes and gates RTP/hit/SD/wincap/tail for all modes.
5. Wire the mode into the frontend (mode selector), localise, social-scrub, jurisdiction-gate.

This is repeatable per mode, low-risk, and keeps the verified core intact.

Sources: in-repo framework audit (`src/config/`, `optimization_program/`, `src/calculations/`,
`src/wins/`), competitor scan (bigwinboard per-tier reviews, nolimitcity/elk/relax/print game
pages, stakeengine.github.io math-sdk docs), and our mirrored `docs/stake-engine-live/`.
