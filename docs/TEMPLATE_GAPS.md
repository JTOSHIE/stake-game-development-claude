# FUTURE SPINNER: TEMPLATE COMPLETENESS / GAP CHECKLIST

What the master template HAS, and what it is still MISSING to be a strong studio foundation.
Australian English, no em/en dashes. Companion to `docs/TEMPLATE_INDEX.md`.

Legend: DONE / PARTIAL / GAP. Build cost: CONFIG (maths config) / CODE (game or frontend code)
/ ART (asset/audio) / OWNER (business/portal).

---

## A. MATHS AXES (what a skin can vary)

| Axis | Status | Notes |
|---|---|---|
| Bet-mode library (11 modes, one RTP) | DONE | cruise..hyperbuy; select a subset per skin |
| Volatility range at one RTP | DONE | SD 11x (cruise) to 969x (hyperbuy) |
| Higher max-win cap | DONE (proof) | `future_spinner_bigwin` 25,000x; per-skin regen |
| RTP preset (jurisdiction/operator) | DONE (proof) | `future_spinner_rtp94` 94%; band 90.0-96.70% |
| Mechanic swap (multiplier wilds) | DONE (proof) | `future_spinner_multiwild` |
| Mechanic: tumble / cluster / lines / scatter | GAP (recipe only) | CODE; SDK samples exist (`MECHANIC_VARIANTS.md`) |
| Grid / reel-structure variants (6x4, 5x5, cluster grids, Megaways/variable ways) | GAP | CODE; a bigger axis - each is a distinct maths base |
| In-round retention meta (symbol upgrades, collection meters, win-boost trails) | GAP | CODE; stateless-compatible; the Overdrive meter is one example |

## B. FRONTEND / UX (reusable across skins)

| Item | Status | Notes |
|---|---|---|
| Spin engine, win presentation, tiered celebrations, wincap splash | DONE | reusable |
| Paytable with ways explainer | DONE | ways-based; per-mechanic paytable needed for other engines |
| Production ModeSelector + dev Mode Library | DONE | drives the mode store |
| Bet replay, 16 locales, social scrub | DONE | mandatory + compliant |
| Autoplay with stop-conditions (win/loss/feature/single-win limits) | GAP | CODE; currently count-only. RG + jurisdiction relevant |
| Volatility indicator in the info screen | GAP | CODE; we have the SD numbers per mode |
| Settings depth (music/SFX split, reduced-motion toggle, battery, one-hand) | PARTIAL | CODE; single mute + CSS reduced-motion only |
| UI button guide screen | GAP | CODE; a named Stake requirement |
| Mini-player / popout renders undistorted | GAP-VERIFY | reviewers test the small background player |
| Frontend presentation for NON-ways mechanics (multiwild, tumble, cluster) | GAP | CODE; each mechanic needs its own interpreter + win display |

## C. ART / AUDIO PIPELINE (the re-skin surface)

| Item | Status | Notes |
|---|---|---|
| In-house vector asset pipeline (SVG masters -> exact-size PNG) | DONE | answers the "no generic AI assets" rubric line |
| Symbol set, brand mark, backgrounds, UI art | DONE (this skin) | the re-skin surface for future games |
| Reusable AUDIO system (music + SFX layers, per-event cues) | PARTIAL | CODE/ART; sound service exists; a documented reusable audio template would help |
| Game tile asset pack (BG + FG + provider logo, <=3MB) | GAP | ART/OWNER; captured spec in COMPLIANCE_WATCH |
| Per-skin theming tokens (colours/fonts swap without code) | PARTIAL | theme tokens exist; formalise a skin-token contract |

## D. COMPLIANCE / RG / PLATFORM

| Item | Status | Notes |
|---|---|---|
| Stateless; no jackpot/gamble/continuation | DONE | verified |
| All modes within 0.5% RTP; RTP band; cost/cap ceilings | DONE | CI-gated (`validate_math.py`) |
| Original IP, no Stake branding, social scrub, disclaimer | DONE | verified |
| Bet replay (mandatory) | DONE | verify Play Again + bonus-buy cost display per skin |
| Jurisdiction gating (buys hidden under `disabledBuyFeature`; ante-style restricted markets) | PARTIAL | buys gated; ante-style modes need a per-skin flag |
| Responsible-gambling: autoplay limits, loss limits, reality-check hooks | GAP | CODE; ties to the autoplay gap |
| Provably-fair readiness (Stake rolled PF across slots in 2026) | GAP-RESERVE | reserve a Fairness info surface; `lastRoundEvents` is the data hook |
| Submission checklist (login-gated) + portal profile/branding/payment | GAP | OWNER; capture on next portal login |

## E. HIGHEST-VALUE MISSING PIECES (ranked, research-refined 2026-07-05)

Ranked by leverage x cost-to-retrofit-later, given the maths breadth already built. The maths
axes are broad; the gaps are now mostly the cross-cutting PLUMBING and the mechanic FRONTENDS.

1. **Provably-fair readiness posture** (CODE, LOW) - THE cheap-now/expensive-later item. Stake
   moved to provably-fair across its slot catalogue in 2026. Our pre-computed books model is
   already PF-friendly (the only entropy is the RGS's weighted simulation-index selection).
   Deliverable: a written invariant (never derive the shown round from hidden client state; every
   round reconstructable from simulation-id/seed + nonce; RGS selection is the sole entropy source)
   plus a round-reconstruction test. See `docs/PF_READINESS.md`. We are ~80% there via determinism;
   the point is to NOT break it. Note: Stake Engine's data-format docs do not yet expose seeds/
   nonces, so this is architectural posture to reserve, not an API to fill.
2. **Frontend presentation for non-ways mechanics** (CODE) - the multiwild maths is done but has no
   wild-multiplier display; same for any tumble/cluster fork. Without this, mechanic variants are
   not shippable. Highest leverage for turning the maths axes into real games.
3. **Telemetry / analytics event taxonomy** (CODE, LOW-MED) - a defined spin/win/feature-trigger/
   buy event schema emitted alongside book events, designed ONCE at fine grain. Nearly free now;
   unusable if bolted on per game across a catalogue.
4. **Responsible-gambling / compliance module** (CODE, MED) - session time + net-spend display,
   reality-check reminders, loss/time limits, autoplay caps, the 2.5s minimum spin interval and
   the unattended-autoplay ban (UKGC, enforced May 2026). Build as a jurisdiction-flag-driven
   module, not per-game. Ties to the autoplay stop-conditions gap.
5. **Stateless feature-primitives library** (CODE+ART, MED) - the current signature mechanics, all
   resolving inside one round: in-round COLLECTION METER (pays at bonus end), SYMBOL-UPGRADE ladder,
   NUDGE-WILD (+1 multiplier per nudged step). Alongside our Overdrive meter. Config-parameterised.
6. **Localisation infrastructure** (CODE, LOW) - string externalisation + locale-aware number/
   currency formatting from day one (the web-SDK supports it). Our text-free SVG art already dodges
   the worst i18n trap (baked-in text).
7. **Mutable-board grid capability** (CODE, MED) - let board dimensions change WITHIN a round to
   unlock expanding grids and own-brand variable-height ways (do NOT use the "Megaways" name -
   trademarked/patented by BTG/Evolution; ship a "Hackways/xWays"-style own-brand). Fixed grids
   (5x3/6x4/5x5) are already config-only. Cluster gave us flood-fill + gravity, so we are part-way.
8. **Configurable celebration tiers + adaptive audio** (CONFIG+ART) - win-tier thresholds as
   bet-multiple config (studio choice; ~10-25x "big", 1000x+ "epic") + layered win-tier audio
   stingers. The reusable presentation seam every re-skin depends on.
9. **RTP presets: SKIP for Stake-only.** RTP is fixed per published bet mode and Stake Engine has
   no operator-facing RTP-selection layer, so presets add little on a single-distributor platform
   (they matter to studios selling to many operators/jurisdictions, e.g. Play'n GO's 5-tier certs).
   `future_spinner_rtp94` PROVES the capability (a one-line change) - reserve it only for a possible
   Stake "Enhanced RTP" commissioned build, not as a shipped axis.

Bonus (already partly covered): ante / bet+ per-spin trigger booster - our `ante`/`antelite`/
`superante` modes ARE this axis (config, done).

## F. WHAT A FIRST GAME COMMONLY GETS WRONG AS A TEMPLATE (avoid; research-backed)

- **Over-coupling the UI** - sharing components too tightly creates a retest-everything bottleneck
  and blocks game-specific animation. Favour inheritance/isolation over max reuse.
- **Hardcoding geometry** - grid size / symbol count must be config-driven, not baked into logic.
- **Money in the UI** - currency/bet logic belongs below the game (RGS/wallet layer). We already
  enforce integer micros (correct).
- **Non-deterministic replays** - keep rounds fully reconstructable (ties to PF readiness).
- **Theme baked into logic** - keep art/colour/audio behind skin tokens.
- **Ways-only frontend assumptions** - the paytable/win display should generalise to other engines.
- Reminder: visuals cannot change post-certification, so the asset pipeline must be right BEFORE submission.

Sources: Stake Engine math-sdk + web-sdk docs, UKGC (autoplay/spin rules, enforced May 2026),
Play'n GO RTP-tier interview (BigWinBoard), Nolimit/Hacksaw/Push studio pages, PF/HMAC references.
Discarded as false: any UK statutory minimum RTP or "2018 sub-90% ban" (no such rules exist).
