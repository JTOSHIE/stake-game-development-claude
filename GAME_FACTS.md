# FUTURE SPINNER: GAME FACTS

Authoritative facts sheet compiled for external audit. Every figure below is quoted from a
committed repo document (cited inline); none is invented or estimated for this sheet. Where
the maths PAR sheet and later art passes disagree only on a symbol's cosmetic name (the
maths ID itself never changes, see `design-system/DESIGN_SYSTEM.md`), the current shipped
name is used and the PAR sheet's original name is noted alongside it. The full maths ID to
display-name reconciliation and integrity statement is in `docs/PAR_NAMING_ADDENDUM.md`.

## 1. Game identity

| Field | Value | Source |
|---|---|---|
| Game name | Future Spinner | `games/future_spinner/FUTURE_SPINNER_PAR_SHEET.md` |
| Studio / brand | We Roll Spinners | `FUTURE_SPINNER_PAR_SHEET.md`; `design-system/DESIGN_SYSTEM.md` |
| Grid | 5 reels x 4 rows (20 symbol positions) | `FUTURE_SPINNER_PAR_SHEET.md` §1 |
| Win mechanic | Ways-to-win, up to 4^5 = 1,024 ways | `FUTURE_SPINNER_PAR_SHEET.md` §1 |
| Bet modes | Five (FeatureMath v2, 2026-07-07): `base` 1.0x, `cruise` 1.0x, `antelite`/OVERBOOST 1.25x, `bonus`/Buy Overdrive 100.0x, `super`/NITRO OVERDRIVE 400.0x | `FUTURE_SPINNER_PAR_SHEET.md` §1, §10, §11 |
| Min / max bet | $0.10 / $100.00 | `FUTURE_SPINNER_PAR_SHEET.md` §1 |
| Simulation basis | 100,000 rounds per mode, Stake Engine SDK v1 | `FUTURE_SPINNER_PAR_SHEET.md` (header) |
| Optimiser | PigFarm (Rust); all five modes converged to 96.3500% RTP | `FUTURE_SPINNER_PAR_SHEET.md` (header) |
| Version | v1.2.0 (FeatureMath v2, five modes). **Corrected 2026-07-31**: the PAR sheet's own footer reads `Future Spinner v1.2`, not v1.2.0, and that file has fourteen `##` sections rather than a numbered §12. A derived record must not out-precise its source. | `FUTURE_SPINNER_PAR_SHEET.md` footer |

Note (2026-07-07): the "Verified mathematics" section below (§2) was compiled before
FeatureMath v2 and documents `base`/`bonus` only. Cruise/antelite/super's independently
re-verified figures (all 96.350000% RTP; SD 11.29x/20.32x/539.16x; wincap 1-in-250k/
1-in-80k/1-in-250) are in `reports/archive/handovers/HANDOVER_2026-07-07_Fable.md`'s per-mode table and
`FUTURE_SPINNER_PAR_SHEET.md` §§10-11; a full three-mode audit-sheet expansion mirroring
the Base/Bonus sections below remains a follow-up, not done in this pass.

## 2. Verified mathematics

All figures are from `games/future_spinner/FUTURE_SPINNER_PAR_SHEET.md`, which the dossier
records as independently recomputed with exact integer arithmetic (`fractions.Fraction`) and
verified against the books.

**Precision note (2026-08-10, Fable independent audit, finding AF-1, tracker TR-118).**
The recomputed rational RTPs are not exactly equal to 96.35: they differ from it by
between 1.1e-9 and 1.5e-7 percentage points per mode (base 96.34999987%, exact fraction
108480455878185533/112589990681340000; cruise 96.34999995%; antelite 96.34999985%; bonus
and super 96.35000000% at 8dp). Every displayed figure in this document is correct at its
quoted precision and the cross-mode spread rounds to 0.0000pp. The standing wording rule:
an RTP equality claim states its precision, "96.3500% at 4dp", never an unqualified
"exactly".

### Base mode (cost 1.0x)

| Metric | Value |
|---|---|
| RTP | **96.3500%** at 4dp (10dp: 96.3499998727%) |
| Hit rate (win > 0) | **29.11%** |
| Zero-win rate | 70.89% |
| Volatility (weighted SD) | **17.28x** |
| Maximum win | 5,000x bet (hard cap) |
| Free-spin trigger rate | **1 in 184.7** (0.5415%) |
| Average triggered-round win | 79.40x bet |
| Wincap frequency | 1 in 100,000 (0.001%) |
| RTP split | Base ways 53.3500% + Overdrive free-spin rounds 38.0000% + wincap rounds 5.0000% = 96.3500% |

**The hard cap and the grid are checked against the maths package itself on every CI run,
not restated from memory here.** These two are annotated ahead of the prettier figures on
purpose: convention (l.1) says derive from the specification first, and the worked example
that produced that convention was a scatter count reported from measurement when
`num_reels = 5` was one line of specification away.
<!--CHECK: grep "_WINCAP = 5000.0" games/future_spinner/game_config.py-->
<!--CHECK: grep "self.num_reels = 5" games/future_spinner/game_config.py-->

### Bonus buy mode (cost 100.0x)

| Metric | Value |
|---|---|
| RTP | **96.3500%** at 4dp (10dp: 96.3499999962%) |
| Trigger rate | 100% (guaranteed 3+ scatter entry) |
| Average bought outcome | **96.35x bet** (i.e. RTP 96.35% at the 100x cost) |
| Volatility (weighted SD) | 206.63x |
| Maximum win | 5,000x bet (hard cap) |
| Wincap frequency | 1 in 1,000 (0.100%) |
| RTP split | Overdrive free-spin rounds (incl. instant pays) 91.3500% + wincap rounds 5.0000% = 96.3500% |

### Tail-risk / hard-cap verification

- Maximum win is **exactly 5,000.00x with zero rounds above the cap in either mode**
  (`FUTURE_SPINNER_PAR_SHEET.md` §9).
- Both lookup tables independently recomputed with exact integer arithmetic; both equal
  96.3500% RTP at 4dp (`FUTURE_SPINNER_PAR_SHEET.md` §9).
- Books match the lookup tables positionally by id and as sorted multisets, in both modes
  (`FUTURE_SPINNER_PAR_SHEET.md` §9).
- Simulation is deterministic: fixed seeds reproduce identical payouts
  (`FUTURE_SPINNER_PAR_SHEET.md` §9).
- Round-shape audit of freegame-containing books confirmed correct trigger counts,
  retriggers, Overdrive multiplier progression (+1 only after winning spins, applied to
  subsequent wins), instant scatter pays, and that the total payout equals the recorded
  payout multiplier in every sampled round (`FUTURE_SPINNER_PAR_SHEET.md` §9).
- SHA-256 manifest recorded for `index.json`, `game_metadata.json`, both lookup tables and
  both compressed book files (`FUTURE_SPINNER_PAR_SHEET.md` §9 table).

### Paytable (per-way multiplier x bet x ways x Overdrive meter)

| Match | H1 | H2 | M1 | M2 | M3 | L1 | L2 | L3 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| 5-of | 22.00 | 10.00 | 5.00 | 4.00 | 2.00 | 1.50 | 0.80 | 0.65 |
| 4-of | 6.00 | 3.00 | 1.50 | 1.00 | 0.60 | 0.45 | 0.25 | 0.20 |
| 3-of | 1.50 | 0.80 | 0.45 | 0.30 | 0.20 | 0.15 | 0.10 | 0.08 |

Wild substitutes for all pay symbols (no independent pay). Scatter pays instantly and does
not participate in the ways calculation (`FUTURE_SPINNER_PAR_SHEET.md` §3).

## 3. Feature rules: Overdrive Free Spins

Source: `FUTURE_SPINNER_PAR_SHEET.md` §2 and `CLAUDE.md` "True game facts".

- **Trigger:** 3, 4 or 5 scatters in the base game award 8, 12 or 16 free spins and pay an
  instant scatter award of 1x, 3x or 10x the BASE BET respectively (R047 TASK 6, closing
  TR-130). The recorded unit proves the basis from primary data: book payouts are counted
  in centibets of the base bet, which is why the 5,000x cap is declared as exactly 500,000
  centibets (`BOOKS_MANIFEST.md:102-105`), so every recorded award, the instant scatter
  pays included, is a base-bet multiple. The ruled player-facing basis (R042 A3, R043
  section K) states the same thing on every disclosure surface. The config's own feature
  header (`game_config.py:11`, VERIFIED by direct read 2026-08-11) phrases it as "pay the
  instant scatter award of 1x, 3x or 10x total bet"; that quote stands as the
  specification's language from the two-mode era, when every mode cost 1.0x and the two
  bases coincided. In the shipped five-mode package OVERBOOST debits 1.25x per spin while
  the recorded awards remain base-bet multiples, which is exactly why the ruled
  player-facing basis names the base bet.
- **Overdrive meter:** starts at 1x. After every **winning** free spin the meter rises +1x
  and applies to all subsequent free-spin wins (ways wins and scatter pays alike). It never
  resets during the round and is not retroactive; no cap beyond the round win cap.
- **Retrigger:** 3 or more scatters during free spins award +5 free spins and pay their
  instant scatter award multiplied by the current Overdrive meter.
- **Bonus buy:** the `bonus` mode (cost 100.0x) guarantees a 3+ scatter trigger spin.
- **Win cap:** 5,000x total per round, hard, both modes.
- **Stateless:** the entire feature resolves inside a single book round; no state carries
  between rounds. No jackpot, gamble, or continuation mechanic.
- **Scatter values are 1x/3x/10x everywhere** (maths, PAR, frontend), not 5x/15x/50x.

### Trigger distribution

| Free spins | Scatters | Base-mode share | Bonus-mode share |
|---:|---:|---:|---:|
| 8 | 3 | 86.37% | 76.56% |
| 12 | 4 | 12.78% | 16.37% |
| 16 | 5 | 0.85% | 7.07% |

(`FUTURE_SPINNER_PAR_SHEET.md` §5, §6)

### Symbol lineup (art is skin level; the maths IDs H1/H2/M1/M2/M3/L1/L2/L3/W/S never change)

| ID | Current shipped name | PAR sheet name (maths doc, unchanged) |
|---|---|---|
| H1 | Spinning Rim | Spinning Rim |
| H2 | Nitro Canister | Turbocharger |
| M1 | Steering Wheel | Car Grille |
| M2 | Coilover | Exhaust Pipe |
| M3 | Plasma Booster | Steering Wheel |
| L1 | Lug Nut | Lug Nut |
| L2 | Blade Fuse | Spark Plug |
| L3 | Piston | Piston |
| W | Wild (machined W hub) | Wild |
| S | Energy Burst Scatter | Scatter |

(`design-system/DESIGN_SYSTEM.md` "APPROVED SYMBOL LINEUP"; `FUTURE_SPINNER_PAR_SHEET.md` §3/§4.
Reel frequencies, which are maths-locked, are unaffected by the cosmetic rename.)

## 3a. PLATFORM DISPLAY CONVENTION, and what our own surfaces show

Confirmed live on 2026-07-26 from the owner's DevTools captures. This exists
because the two numbers look like they should agree and do not, and every future
reader of a Bets page will hit it.

**HARDENED 2026-07-27, and the upgrade matters: this stopped being an inference.**
The 2026-07-26 evidence was three modes behaving alike, which is a strong inference
but still an inference. Two independent things landed since:

1. **The platform says it itself.** The authenticate response carries a per-mode
   table publishing `"mode": "bonus", "costMultiplier": 100` and
   `"mode": "super", "costMultiplier": 400` as its OWN fields, and a play response
   carries `"amount": 1000000000` with `"mode": "antelite"` in the same instant the
   HUD reads `EUR 1,250.00`. Level and cost multiplier are two separate fields and
   the COST column renders the first. Per convention (l.4) this counts as
   corroboration precisely because `fsModes.ts` and that payload share no input.
2. **Three sessions were reconciled by solving for the opening balance TWICE**, once
   under each competing reading, so the round figures are a test rather than
   decoration. Under the true per-mode costs the openings come out at exactly
   EUR 1,000.00, EUR 1,000,000.00 and EUR 500,000.00; under the COST column they
   come out at EUR 291.75, EUR 900,250.00 and EUR 499,250.00. Residual 0.00 in all
   three under the true costs.

Working, generated rather than typed:
`reports/qa/live_stats/2026-07-27_money_timeline.md`,
`reports/qa/live_stats/2026-07-27_reconcile.py` and its JSON output.
**The owner-facing one-page explanation of the same thing, with four annotated
frames from the owner's own sessions, is `docs/records/MONEY_DISPLAY_EXPLAINED.md`.**

**An open decision sits on top of this, and it is not the builder's to make.**
Ledger rows SA-002 and SA-007 ask whether the convention should be raised with the
platform before submission, so that a reviewer reading the Bets page alone does not
underestimate spend on every non-unit mode. Awaiting a Fable or owner ruling since
2026-07-26 (`docs/records/screenshots/FINDINGS_LEDGER.md`).

**The platform reports the BET LEVEL, not what the round cost.**

Both the Bets page COST column and the `round.amount` field in the play response
carry the bet level, on every mode. They do NOT carry the effective debit. The
platform keeps the multiplier as a separate `costMultiplier` field rather than
folding it into the amount.

Worked example, all from one capture,
`reports/screens/live-round2-2026-07-26/03_antelite_play_round_amount_20000000_is_BET_LEVEL_hud_2500.png`:

| what | reads | which is |
| --- | --- | --- |
| `round.amount` | `20000000` micros, EUR 20.00 | the BET LEVEL |
| Bets page COST | `EUR 20.00` | the BET LEVEL |
| our HUD BET | `EUR 25.00` | the EFFECTIVE debit, 20.00 x 1.25 |

**The effective debit is bet level times the mode cost multiplier:**

| mode | multiplier | proven live to the cent |
| --- | --- | --- |
| `base` | 1.00x | yes, 524 spin session panel |
| `cruise` | 1.00x | **NO. Display level only. TR-075 open.** |
| `antelite` | 1.25x | yes, balance delta across two frames, residual 0.00 |
| `bonus` | 100x | yes, residual 0.00 |
| `super` | 400x | yes, residual 0.00 |

Working at `reports/qa/live_stats/2026-07-26_mode_cost_reconciliation.md`.

**Our surfaces state effective prices, and that is deliberate.** Confirmed in
`reports/screens/live-round2-2026-07-26/04_features_menu_effective_prices_spincost_875_buy_70000.png`,
at a EUR 7.00 bet level with OVERBOOST on:

- the HUD BET plate reads `EUR 8.75`, the effective debit;
- the FEATURES header reads `SPIN COST EUR 8.75` beside `BET EUR 7.00`, so both
  figures are visible and labelled rather than one standing for the other;
- the OVERBOOST card reads `1.25x per spin while ON . EUR 8.75`;
- the Buy Overdrive card reads `100x . EUR 700.00`;
- the buy confirm dialog states the same price the card does.

**The consequence to keep in view.** The platform's MULT column is payout divided
by the bet level, so it is against the bet level too. An `antelite` row reading
`x91.60` is `x73.28` against what the player actually spent. No cap is breached
in either reading: the 5,000x cap is measured against the bet level by both the
platform and by `gameStore.ts`'s `WINCAP`, and the largest multiplier observed
live is exactly 5,000.00x on the wincap round itself.

## 4. Technology summary

- **Frontend:** Svelte + PixiJS. Reel motion is ticker-driven (PixiJS `app.ticker`, 60fps);
  win-line highlighting and win particle bursts render on a transparent Pixi canvas layered
  over the symbol grid (`reports/archive/2026-07-04_motion-polish-v2.md`).
- **Asset pipeline:** deterministic, in-house, vector-to-raster. Every visual asset derives
  from SVG masters in `design-system/masters/` via `npm run assets`
  (`scripts/assets/build.py` + `manifest.json`), reproducible byte-identical on re-run. Layered
  exports (e.g. H1's rotating spoke sprite, H2's needle, the Overdrive flame jets) isolate
  named SVG groups so the engine animates parts independently of the static base art
  (`design-system/DESIGN_SYSTEM.md`; `reports/archive/2026-07-04_motion-polish-v2.md`;
  `reports/archive/2026-07-04_opus-elevate-2.md`). Manus is retired
  (`CLAUDE.md` "Assets").
- **Externally sourced art: FOUR assets, all owner-commissioned, all scene or marketing,
  none of them symbols, each with recorded provenance.** Corrected 2026-07-27. This bullet
  previously read "No externally sourced or AI-generated stock art", which was true when it
  was written and has not been true since 2026-07-25. It is stated plainly here because this
  document is compiled for external audit and because the platform's quality-rankings page
  warns specifically against over-reliance on generic AI-generated assets
  (`COMPLIANCE_WATCH.md`). The permitting rule is `CLAUDE.md`'s Assets section as amended
  2026-07-27: owner-commissioned NEW DESIGNS are permitted for SCENE and MARKETING art with
  recorded provenance; **symbols remain never externally designed**, and unrequested
  external design remains prohibited.

  | Asset | Class | Measured against what it replaced | Provenance record |
  |---|---|---|---|
  | `backgrounds/bg_base.jpg` 1920x1080 | Owner-commissioned NEW DESIGN | Pearson r **0.3850**, 58.2% of cells moved, against a declared ENHANCEMENT control scoring 0.9966 and an identity control at 1.0000 | `design-system/brand/GENERATION_NOTE_background.md`, `reports/qa/background_candidate_ingest.json` |
  | `backgrounds/bg_overdrive.jpg` 1920x1080 | Derived in-house from the above | Deterministic grade by `scripts/assets/background_overdrive_derive.py`, ratios taken from the original two-grade pipeline | `reports/qa/background_overdrive_derive.json` |
  | `design-system/brand/tile/tile_composed_master.png` 408x546 | Owner-commissioned NEW DESIGN | Landed byte-identical at the platform's own observed published tile geometry, 408x546 | `design-system/brand/tile/GENERATION_NOTE_composed_master.md` |
  | `ui/scene_character.png` 680x1344, `ui/scene_car.png` 2840x1000 | External ENHANCEMENT of art we already own | Character subject bounding box matching the original to **0.7%**; car bounding box **identical** at 2729x914, 40.7% transparent in both | `CLAUDE.md` Assets section; shipped hashes recorded in `SUBMISSION_DOSSIER.md` section 9 |

  **Every symbol, frame, particle and animated element still derives from the in-house SVG
  masters.** That is the line the rule actually draws, and it is unbroken: none of the four
  above enters the animation pipeline. Scene backdrops, tiles and marketing art are flat and
  terminal and animate nothing, which is why they can come from outside without recreating
  the failure the original prohibition was written for.
- **Backgrounds:** static graded stills (one base scene, one Overdrive-state variant), no
  background video ships (`design-system/DESIGN_SYSTEM.md` ADDENDUM "Static environment
  backgrounds"). Since 2026-07-27 the base is owner-commissioned art and the Overdrive
  variant is DERIVED from it rather than graded from a second video frame, so the two can
  never be of two different cities: `App.svelte` crossfades them.
- **Speed tiers:** three, Normal, Turbo and Super Turbo, scaling every reel-motion duration
  (the reel-feel requirements, whose exact heading is NOT in `design-system/LAYOUT_SPEC.md`; corrected 2026-07-31, the three tiers are declared at `frontend/src/lib/stores/speedMode.ts:15`; implemented in
  `frontend/src/lib/stores/speedMode.ts`, verified in
  `reports/archive/2026-07-04_motion-polish-v2.md`). Autoplay honours the active tier.
- **Layout system:** a single 1280x720 design surface scaled by one factor `S` so the whole
  stage (frame, grid, HUD, instrument column) shrinks/grows together
  (`design-system/LAYOUT_SPEC.md` v3.1 onward, amended through v3.4 for the fixed-field HUD
  and Overdrive flame jets).
- **Audio: shipped** (2026-07-13, previously the one open creative item per
  `docs/CHAT_CLOSEOUT_2026-07-06.md`). Twelve mastered sound files - two music beds
  (`bgm_loop` 100 BPM, `bgm_tension` 140 BPM, both crossfading on Overdrive entry/exit)
  and ten SFX/stingers - generated via Stable Audio 3 open weights
  (`tools/audio_forge/generate.py`, model `stabilityai/stable-audio-3-medium`), mastered
  deterministically (`tools/audio_forge/master.py`: silence trim, bar-aligned loop points,
  loudness normalisation with a verified win-tier escalation check) and wired into
  `soundService.ts`. Provenance: `reports/audio/GENERATION_LOG_2026-07-13.md` (per-file
  model/seed/prompt), `frontend/public/assets/themes/future-spinner/sounds/README.md`,
  licensed under the Stability AI Community License
  (`tools/audio_forge/LICENSE.md`/`NOTICE`). Verified via
  `frontend/scripts/audio_verify.mjs` - ALL CHECKS PASS.

## 5. Compliance summary

- **Locales:** 16, with social-mode overrides for every player-facing string
  (`SUBMISSION_DOSSIER.md` §4; `CLAUDE.md`).
- **Social mode:** prohibited-term overrides applied for stake.us (`social=true`); the
  `disabledBuyFeature` jurisdiction flag fully hides the bonus buy where required
  (`COMPLIANCE_WATCH.md` "Current posture").
- **Bet Replay:** implemented and mandatory-compliant, no player session required; bonus-buy
  replays display the amount spent including the 100x cost multiplier
  (`COMPLIANCE_WATCH.md`; `SUBMISSION_DOSSIER.md` §4).
  **CONFIRMED WORKING ON THE LIVE PLATFORM, 2026-07-26** (TR-076), and it was a genuine
  blocker before that: the panel launched, the board rendered static, and START REPLAY sat
  at the bottom as an unclickable shadow. Root cause was a `position: fixed` backdrop at
  `z-index: 0` hit-testing above the unpositioned replay container; fixed in both
  directions. Confirmed live on a `super` buy-tier wincap round through to its celebration
  and PLAY AGAIN: `reports/screens/live-round2-2026-07-26/01_replay_22975_celebration_multiplier_5000x_win_3750000.png`
  and `02_MAX_WIN_REACHED_overlay_5000x_bet_collect.png`.
  **The defect this paragraph carried is CLOSED twice over** (updated 2026-08-13):
  ledger row SA-022, HIGH, recorded the replay win pod rendering player money with
  `.toFixed(2)`, showing `3750000.00` with no separators and no currency symbol,
  overflowing its fixed zone beside a banner formatting correctly in the same frame.
  It was FIXED on 2026-07-26 (QUALITY_CHARTER Q-11, the canonical formatter routed),
  and the component itself, WinPod.svelte, was DELETED on 2026-08-13 by the R058
  owner design ruling (TR-137): the replay pod is gone at every size and the
  end-of-replay banner carries both values.
  **Fixed at source 2026-07-27** by routing it through the canonical `formatBalance`
  (`docs/QUALITY_CHARTER.md` Q-11); still awaiting a live re-capture to confirm it on the
  platform, so it is recorded as fixed-not-yet-re-observed rather than closed.
- **Disclaimer:** the Stake Engine seven-point disclaimer and full paytable are always
  reachable (`SUBMISSION_DOSSIER.md` §4).
- **Responsive viewports:** verified at all six required viewports: Mobile S 320x568,
  Mobile M 375x667, Mobile L 425x812, Popout S 400x225, Popout L 800x450, Desktop 1200x675
  (`SUBMISSION_DOSSIER.md` §4; occlusion/position audits in
  `reports/archive/2026-07-04_layout-install.md` and `reports/archive/2026-07-04_ux-polish.md`).
- **Stateless / no jackpot, gamble, or continuation:** verified, matches the Stake Engine
  approval-guidelines key restrictions (`COMPLIANCE_WATCH.md`).
- **Original IP, studio marks only, no underage appeal:** verified (`COMPLIANCE_WATCH.md`).
  The one Stake mark in shipped text is the closing line of the platform's MANDATED
  General Disclaimer, which the platform requires verbatim and which R078 made the
  branding rule's one scoped exception (2026-08-21).
- **fps gate:** headless run of 20 spins including a full bonus round averaged **59.9fps**
  against a >=55fps gate (PASS); a single frame exceeded 100ms, root-caused to a one-time
  browser cold-start cost at the very first Overdrive-entry mount on a fresh page load, not
  a recurring reel-motion defect (`reports/archive/2026-07-04_motion-polish-v2.md`;
  re-confirmed with flame jets burning in `reports/archive/2026-07-04_opus-elevate-2.md`).
- **Exact-total interpreter gate:** the presented win sequence sums exactly to the book's
  recorded payout on every sampled round, PASS 58/58 across the full curated sample pool
  (`reports/archive/2026-07-04_ux-polish.md`; re-confirmed in later passes).

## Sources

`games/future_spinner/FUTURE_SPINNER_PAR_SHEET.md` · `SUBMISSION_DOSSIER.md` ·
`COMPLIANCE_WATCH.md` · `CLAUDE.md` · `design-system/DESIGN_SYSTEM.md` ·
`design-system/LAYOUT_SPEC.md` · `reports/archive/2026-07-04_layout-install.md` ·
`reports/archive/2026-07-04_ux-polish.md` · `reports/archive/2026-07-04_motion-polish-v2.md` ·
`reports/archive/2026-07-04_opus-elevate.md` · `reports/archive/2026-07-04_opus-elevate-2.md` ·
`reports/audio/GENERATION_LOG_2026-07-13.md` · `reports/archive/2026-07-13_job1-audio-integration.md`

---

## STATE AT HEAD, 2026-07-25

Authoritative where it conflicts with anything above. Every figure below is either measured
from the shipped package or cited to its source.

### Maths, unchanged and now proven row by row

| Fact | Value |
|---|---|
| RTP, all five modes | **96.3500%** at 4dp |
| Max win | **5,000x**, hard cap every mode |
| Grid | 5x4, 1,024 ways |
| Outcomes per mode | **100,000** (platform cap 10,000,000) |
| Base hit rate | 29.11% |
| Base volatility (weighted SD) | 17.28x |
| Feature trigger rate | 1 in 184.7 (0.5415%) |

**Book-to-lookup equality is proven**, not asserted: 500,000 rounds, 4,455,829 assertions,
zero failures (`tools/verify_books_lookup_equality.py`).

**Weighted wincap frequency**, computed as capped weight over total weight rather than from
raw row counts:

| Mode | 1 in |
|---|---|
| base | 100,000 |
| cruise | 250,000 |
| antelite | 80,000 |
| bonus | 1,000 |
| super | 250 |

### Scatter placement, measured across 40,000 base rounds

| Fact | Value |
|---|---|
| Anticipation opens (2+ scatters) | 23.18% of base rounds |
| Of those, convert to a trigger | 64.5% |
| Triggers going past three scatters | 24.0% |
| Third scatter lands on the final reel | 46.2% |
| Rounds with two scatters on one reel | 0.5% |

**Scatter maximum on the visible 5x4 window, per mode** (corrected 2026-08-10, R043
PHASE 3a, fresh-context major 11: this line previously said "maximum is 5, one per
reel", an under-sampled claim that also sat five rows below this file's own 0.5%
two-scatters-on-one-reel figure). The BASE trigger is forced to exactly 3/4/5
distinct-reel scatters, but free-spin draws are natural and scatters can stack, so 6+
can appear and every count from 3 to the 20-cell maximum is mapped, 6+ awarding the
5-scatter amount (`games/future_spinner/game_config.py:149-156`). Measured on the FULL
population, 100,000 rounds per mode (2026-08-09 payout reconciliation pass): rounds
with six visible scatters are base 0, cruise 0, antelite 0, bonus 2, super 2; the
first found are bonus round 61700 (quoted verbatim as a seeded case in
`frontend/scripts/round_payout_reconciliation_gate.mjs`) and super round 98874; none
reached seven. The award is identical to five scatters, 10x and 16 spins, so nothing
player-facing changes; the owner has ruled no disclosure is owed (CLAUDE.md
LOCKED_FILE_DEBTS). The `reveal` event carries a six-row board per reel, the visible
four plus one padding row at each end; the padding is never shown to a player and must
not be counted.

### Currency

Fiat via `Intl` from the platform's code. Virtual: **XGC** to GC, **XSC** to SC, and
**XEC** to SC for Stake EU, where XEC support is a release gate. The raw code is never
shown to a player, asserted for every virtual code. Symbol placement is driven by the
platform's own display metadata where supplied, with both placements asserted from fixture
payloads.

### Responsible gambling

Jurisdiction flags are **enforced**, not merely derived: autoplay cap, `turboDisabled` and
`minSpinMs` all gate real controls. Session panel and reality check carry native RG wording
across 16 locales, and "Stop playing" halts autoplay and returns to idle.

### Audio

No soundtrack claim is made here. Audio ships or it does not; this document does not
describe it in advance.
